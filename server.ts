import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3000;

app.set('trust proxy', true);

// Universal CORS for any domain, iframe, or proxy
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '15mb' }));

function isValidSupabaseUrl(urlStr?: string | null): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  if (!trimmed || trimmed === '11' || trimmed.includes('your-project-ref')) return false;
  try {
    const parsed = new URL(trimmed);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

function isValidSupabaseKey(keyStr?: string | null): boolean {
  if (!keyStr || typeof keyStr !== 'string') return false;
  const trimmed = keyStr.trim();
  return trimmed.length > 20 && trimmed !== '11';
}

// Supabase Server-side Client Initialization
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

let serverSupabase: SupabaseClient | null = null;
if (isValidSupabaseUrl(SUPABASE_URL) && isValidSupabaseKey(SUPABASE_KEY)) {
  try {
    serverSupabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    console.log('[EasyAcss] Server Supabase client connected successfully to:', SUPABASE_URL);
  } catch (err) {
    console.warn('[EasyAcss] Server Supabase initialization failed:', err);
  }
} else {
  console.log('[EasyAcss] Server operating with local file persistence (Supabase not configured or placeholder detected).');
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache backed by file
let siteDataCache: any = null;

function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      siteDataCache = JSON.parse(raw);
      return siteDataCache;
    }
  } catch (err) {
    console.error('Failed to read store file:', err);
  }
  return null;
}

const DEFAULT_SHORTLINK_CONFIG = {
  enabled: false,
  provider: 'cutly',
  domain: 'cutt.ly',
  apiToken: '',
  timerSeconds: 5,
  bypassForVip: true,
  simulatedLatency: false
};

const DEFAULT_ADSTERRA_CONFIG = {
  enabled: false,
  publisherId: '',
  directLinkUrl: '',
  popunderEnabled: false,
  triggerPopunderOnClaim: false,
  popunderOnFirstClick: false,
  popunderCode: '',
  socialBarEnabled: false,
  socialBarCode: '',
  banner728x90Top: '',
  banner728x90Bottom: '',
  banner300x250Sidebar: '',
  banner468x60Claim: '',
  nativeBannerCode: '',
  inFeedAdsEnabled: false
};

const DEFAULT_SITE_CONTENT = {
  siteName: 'EasyAcss',
  subTitle: 'Free Steam offline gaming accounts, instant credentials unlock, and active 2FA dispatching.',
  announcement: '🔥 New Steam accounts added daily! Check back often.',
  announcementActive: true,
  discordUrl: 'https://discord.gg/easyacss',
  discordServerName: 'EasyAcss Official',
  supportUrl: 'https://discord.gg/easyacss',
  telegramUrl: 'https://t.me/easyacss',
  rules: [
    'Do not change the account credentials (email or password).',
    'Switch Steam to "Go Offline" mode immediately after logging in.',
    'Do not activate Steam Guard Family sharing or modify security settings.',
    'Use accounts strictly for offline single-player playthroughs.'
  ]
};

const DEFAULT_OAUTH_CONFIG = {
  discordClientId: (process.env.DISCORD_CLIENT_ID || '').trim(),
  discordClientSecret: (process.env.DISCORD_CLIENT_SECRET || '').trim(),
  googleClientId: (process.env.GOOGLE_CLIENT_ID || '').trim(),
  googleClientSecret: (process.env.GOOGLE_CLIENT_SECRET || '').trim()
};

function getOAuthConfig() {
  const cached = siteDataCache?.oauthConfig || {};
  return {
    discordClientId: (process.env.DISCORD_CLIENT_ID || cached.discordClientId || '').trim(),
    discordClientSecret: (process.env.DISCORD_CLIENT_SECRET || cached.discordClientSecret || '').trim(),
    googleClientId: (process.env.GOOGLE_CLIENT_ID || cached.googleClientId || '').trim(),
    googleClientSecret: (process.env.GOOGLE_CLIENT_SECRET || cached.googleClientSecret || '').trim()
  };
}

function syncToMockData(data: any) {
  try {
    const mockDataFile = path.join(process.cwd(), 'src', 'data', 'mockData.ts');
    if (fs.existsSync(mockDataFile)) {
      const shortlink = (data.shortlinkConfig && Object.keys(data.shortlinkConfig).length > 0)
        ? { ...DEFAULT_SHORTLINK_CONFIG, ...data.shortlinkConfig }
        : DEFAULT_SHORTLINK_CONFIG;
      const adsterra = (data.adsterraConfig && Object.keys(data.adsterraConfig).length > 0)
        ? { ...DEFAULT_ADSTERRA_CONFIG, ...data.adsterraConfig }
        : DEFAULT_ADSTERRA_CONFIG;
      const siteContent = (data.siteContent && Object.keys(data.siteContent).length > 0)
        ? { ...DEFAULT_SITE_CONTENT, ...data.siteContent }
        : DEFAULT_SITE_CONTENT;

      const code = `import { GameAccount, ShortlinkConfig, AdsterraConfig, VIPTier, ClaimActivity, SiteContent } from '../types';

export const INITIAL_ACCOUNTS: GameAccount[] = ${JSON.stringify(data.accounts || [], null, 2)};

export const INITIAL_MEMBERS = ${JSON.stringify(data.members || [], null, 2)};

export const INITIAL_VIP_TIERS: VIPTier[] = [
  {
    id: "silver-pass",
    name: "Silver Pass",
    durationDays: 30,
    price: 4.99,
    features: [
      "Access to Standard Game Accounts",
      "Faster Shortlink Processing",
      "Standard Restock Priority"
    ]
  },
  {
    id: "gold-vault",
    name: "Gold Vault",
    durationDays: 90,
    price: 11.99,
    popular: true,
    features: [
      "Access to All Games + DLCs",
      "Reduced Shortlink Verification",
      "Automated Steam Guard Instant Codes",
      "Priority Replacement Support"
    ]
  },
  {
    id: "diamond-lifetime",
    name: "Diamond Lifetime",
    durationDays: 365,
    price: 24.99,
    features: [
      "All VIP & Standard Games Unlocked",
      "Exclusive AAA Day-1 Vault Accounts",
      "Direct Discord Support Channel"
    ]
  }
];

export const VIP_TIERS = INITIAL_VIP_TIERS;

export const INITIAL_ACTIVITIES: ClaimActivity[] = ${JSON.stringify(data.activities || [], null, 2)};

export const INITIAL_SHORTLINK_CONFIG: ShortlinkConfig = ${JSON.stringify(shortlink, null, 2)};

export const INITIAL_ADSTERRA_CONFIG: AdsterraConfig = ${JSON.stringify(adsterra, null, 2)};

export const INITIAL_SITE_CONTENT: SiteContent = ${JSON.stringify(siteContent, null, 2)};

export const INITIAL_CONTENT = INITIAL_SITE_CONTENT;
`;
      fs.writeFileSync(mockDataFile, code, 'utf-8');
      console.log('[EasyAcss] Synced live data into src/data/mockData.ts');
    }
  } catch (err) {
    console.error('Failed to sync to mockData.ts:', err);
  }
}

function saveStore(data: any) {
  try {
    siteDataCache = {
      ...siteDataCache,
      ...data,
      shortlinkConfig: (data.shortlinkConfig && Object.keys(data.shortlinkConfig).length > 0)
        ? { ...DEFAULT_SHORTLINK_CONFIG, ...data.shortlinkConfig }
        : (siteDataCache?.shortlinkConfig || DEFAULT_SHORTLINK_CONFIG),
      adsterraConfig: (data.adsterraConfig && Object.keys(data.adsterraConfig).length > 0)
        ? { ...DEFAULT_ADSTERRA_CONFIG, ...data.adsterraConfig }
        : (siteDataCache?.adsterraConfig || DEFAULT_ADSTERRA_CONFIG),
      siteContent: (data.siteContent && Object.keys(data.siteContent).length > 0)
        ? { ...DEFAULT_SITE_CONTENT, ...data.siteContent }
        : (siteDataCache?.siteContent || DEFAULT_SITE_CONTENT),
      oauthConfig: (data.oauthConfig && typeof data.oauthConfig === 'object')
        ? { ...(siteDataCache?.oauthConfig || DEFAULT_OAUTH_CONFIG), ...data.oauthConfig }
        : (siteDataCache?.oauthConfig || DEFAULT_OAUTH_CONFIG),
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(siteDataCache, null, 2), 'utf-8');
    // Note: Do not rewrite src/data/mockData.ts during live API requests, as Vite watcher detects file changes and reloads the browser
    return true;
  } catch (err) {
    console.error('Failed to write store file:', err);
    return false;
  }
}

// Initialize on startup
const initialLoaded = loadStore();
if (initialLoaded) {
  syncToMockData(initialLoaded);
}

// ==========================================
// API ROUTES
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// ==========================================
// OAUTH PROVIDER AUTHENTICATION (DISCORD & GOOGLE)
// ==========================================

function renderOAuthPopupResult(res: express.Response, success: boolean, data: any, provider: string) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (success) {
    const payload = JSON.stringify({ type: 'OAUTH_AUTH_SUCCESS', provider, member: data });
    return res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Connexion Réussie</title>
  <style>
    body { background: #0e0e11; color: #f3f4f6; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .box { text-align: center; background: #16161a; border: 1px solid rgba(255,255,255,0.1); padding: 32px; border-radius: 18px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); max-width: 360px; width: 90%; }
    .icon { width: 52px; height: 52px; margin: 0 auto 16px; border-radius: 50%; background: #10b98125; color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 26px; border: 1px solid #10b98140; }
    h2 { font-size: 18px; margin: 0 0 8px; color: #fff; }
    p { font-size: 13px; color: #9ca3af; margin: 0; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="box">
    <div class="icon">✓</div>
    <h2>Authentification Réussie !</h2>
    <p>Connexion vérifiée avec succès. Cette fenêtre se ferme automatiquement...</p>
  </div>
  <script>
    try {
      if (window.opener) {
        window.opener.postMessage(${payload}, '*');
        setTimeout(() => { window.close(); }, 350);
      } else {
        window.location.href = '/';
      }
    } catch(e) {
      console.error(e);
      window.location.href = '/';
    }
  </script>
</body>
</html>`);
  } else {
    const errPayload = JSON.stringify({ type: 'OAUTH_AUTH_ERROR', provider, error: String(data) });
    return res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Échec de Connexion</title>
  <style>
    body { background: #0e0e11; color: #f3f4f6; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .box { text-align: center; background: #16161a; border: 1px solid #ef444444; padding: 32px; border-radius: 18px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); max-width: 400px; width: 90%; }
    .icon { width: 52px; height: 52px; margin: 0 auto 16px; border-radius: 50%; background: #ef444425; color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 26px; border: 1px solid #ef444440; }
    h2 { font-size: 18px; margin: 0 0 8px; color: #f87171; }
    p { font-size: 13px; color: #9ca3af; margin: 0 0 20px; line-height: 1.5; word-break: break-word; }
    button { background: #27272a; color: #fff; border: 1px solid #3f3f46; padding: 10px 22px; border-radius: 10px; font-weight: bold; cursor: pointer; }
    button:hover { background: #3f3f46; }
  </style>
</head>
<body>
  <div class="box">
    <div class="icon">✕</div>
    <h2>Erreur de Connexion OAuth</h2>
    <p>${typeof data === 'string' ? data : 'Une erreur est survenue lors de la connexion.'}</p>
    <button onclick="window.close()">Fermer cette fenêtre</button>
  </div>
  <script>
    try {
      if (window.opener) {
        window.opener.postMessage(${errPayload}, '*');
      }
    } catch(e) {}
  </script>
</body>
</html>`);
  }
}

// Status & Redirect URIs
app.get('/api/auth/status', (req, res) => {
  const cfg = getOAuthConfig();
  const devUrl = 'https://ais-dev-zrwqmxq6pzy7gmjz3dgfm3-818357937668.europe-west2.run.app';
  const sharedUrl = 'https://ais-pre-zrwqmxq6pzy7gmjz3dgfm3-818357937668.europe-west2.run.app';
  res.json({
    discord: {
      configured: Boolean(cfg.discordClientId && cfg.discordClientSecret),
      clientId: cfg.discordClientId ? `${cfg.discordClientId.slice(0, 6)}...` : ''
    },
    google: {
      configured: Boolean(cfg.googleClientId && cfg.googleClientSecret),
      clientId: cfg.googleClientId ? `${cfg.googleClientId.slice(0, 10)}...` : ''
    },
    redirectUris: {
      discord: {
        dev: `${devUrl}/auth/discord/callback`,
        shared: `${sharedUrl}/auth/discord/callback`
      },
      google: {
        dev: `${devUrl}/auth/google/callback`,
        shared: `${sharedUrl}/auth/google/callback`
      }
    }
  });
});

// Admin OAuth Configuration (view)
app.get('/api/auth/config', (req, res) => {
  const cfg = getOAuthConfig();
  res.json({
    discordClientId: cfg.discordClientId,
    discordClientSecret: cfg.discordClientSecret ? '••••••••' + cfg.discordClientSecret.slice(-4) : '',
    hasDiscordSecret: Boolean(cfg.discordClientSecret),
    googleClientId: cfg.googleClientId,
    googleClientSecret: cfg.googleClientSecret ? '••••••••' + cfg.googleClientSecret.slice(-4) : '',
    hasGoogleSecret: Boolean(cfg.googleClientSecret)
  });
});

// Admin OAuth Configuration (update)
app.post('/api/auth/config', (req, res) => {
  const current = getOAuthConfig();
  const incoming = req.body || {};
  const newConfig = {
    discordClientId: typeof incoming.discordClientId === 'string' ? incoming.discordClientId.trim() : current.discordClientId,
    discordClientSecret: typeof incoming.discordClientSecret === 'string' && !incoming.discordClientSecret.startsWith('••••')
      ? incoming.discordClientSecret.trim()
      : current.discordClientSecret,
    googleClientId: typeof incoming.googleClientId === 'string' ? incoming.googleClientId.trim() : current.googleClientId,
    googleClientSecret: typeof incoming.googleClientSecret === 'string' && !incoming.googleClientSecret.startsWith('••••')
      ? incoming.googleClientSecret.trim()
      : current.googleClientSecret
  };
  saveStore({ oauthConfig: newConfig });
  res.json({ success: true, message: 'OAuth configuration updated successfully.' });
});

// Discord OAuth: Get Authorize URL
app.get('/api/auth/discord/url', (req, res) => {
  const cfg = getOAuthConfig();
  const origin = (req.query.origin as string) || process.env.APP_URL || 'https://ais-dev-zrwqmxq6pzy7gmjz3dgfm3-818357937668.europe-west2.run.app';
  const cleanOrigin = origin.replace(/\/$/, '');
  const redirectUri = `${cleanOrigin}/auth/discord/callback`;

  if (!cfg.discordClientId || !cfg.discordClientSecret) {
    return res.json({
      configured: false,
      provider: 'discord',
      redirectUri,
      message: 'Discord Client ID & Secret are not configured yet.'
    });
  }

  const state = Buffer.from(JSON.stringify({ origin: cleanOrigin })).toString('base64url');
  const params = new URLSearchParams({
    client_id: cfg.discordClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email',
    state: state,
    prompt: 'consent'
  });

  res.json({
    configured: true,
    provider: 'discord',
    redirectUri,
    url: `https://discord.com/oauth2/authorize?${params.toString()}`
  });
});

// Discord OAuth: Callback Handler (handles both trailing slash and non-trailing slash)
app.get(['/auth/discord/callback', '/auth/discord/callback/'], async (req, res) => {
  const { code, error, error_description, state } = req.query;
  if (error) {
    return renderOAuthPopupResult(res, false, String(error_description || error), 'discord');
  }
  if (!code || typeof code !== 'string') {
    return renderOAuthPopupResult(res, false, 'No authorization code received from Discord.', 'discord');
  }

  let origin = (process.env.APP_URL || 'https://ais-dev-zrwqmxq6pzy7gmjz3dgfm3-818357937668.europe-west2.run.app').replace(/\/$/, '');
  if (state && typeof state === 'string') {
    try {
      const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
      if (parsed.origin && typeof parsed.origin === 'string') {
        origin = parsed.origin.replace(/\/$/, '');
      }
    } catch (e) {
      console.warn('Could not parse state parameter:', e);
    }
  }
  const redirectUri = `${origin}/auth/discord/callback`;
  const cfg = getOAuthConfig();

  if (!cfg.discordClientId || !cfg.discordClientSecret) {
    return renderOAuthPopupResult(res, false, 'Discord credentials missing on server.', 'discord');
  }

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cfg.discordClientId,
        client_secret: cfg.discordClientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      }).toString()
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Discord token error:', tokenData);
      return renderOAuthPopupResult(res, false, tokenData.error_description || tokenData.error || 'Failed to exchange Discord authorization code.', 'discord');
    }

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const discordUser = await userRes.json();
    if (!userRes.ok || !discordUser.id) {
      return renderOAuthPopupResult(res, false, 'Failed to fetch Discord user profile.', 'discord');
    }

    let avatarUrl = '';
    if (discordUser.avatar) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`;
    } else {
      const defaultAvatarIndex = Number((BigInt(discordUser.id || '0') >> 22n) % 6n);
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
    }

    const discTag = (discordUser.discriminator && discordUser.discriminator !== '0')
      ? `${discordUser.username}#${discordUser.discriminator}`
      : `@${discordUser.username}`;

    const memberName = discordUser.global_name || discordUser.username;
    const memberEmail = discordUser.email || `${discordUser.username.toLowerCase().replace(/[^a-z0-9]/g, '')}@discord.user`;

    const current = siteDataCache || loadStore() || {};
    const existingMembers = Array.isArray(current.members) ? [...current.members] : [];
    let member = existingMembers.find((m: any) => m.id === `member-disc-${discordUser.id}` || m.email === memberEmail);

    if (member) {
      member.username = memberName;
      member.avatar = avatarUrl;
      member.discordTag = discTag;
      member.authProvider = 'discord';
    } else {
      member = {
        id: `member-disc-${discordUser.id}`,
        username: memberName,
        email: memberEmail,
        role: 'member',
        avatar: avatarUrl,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        favorites: [],
        claimsCount: 0,
        authProvider: 'discord',
        discordTag: discTag
      };
      existingMembers.push(member);
    }

    const act: any = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'login',
      action: 'Discord OAuth Login',
      username: member.username,
      accountTitle: `Connexion Discord réelle (${discTag})`,
      platform: 'Discord',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Discord Active',
      ip: req.ip || '127.0.0.1',
      details: `Authentification réussie via Discord (ID: ${discordUser.id})`
    };

    const existingActivities = Array.isArray(current.activities) ? current.activities : [];
    saveStore({
      members: existingMembers,
      activities: [act, ...existingActivities.slice(0, 49)]
    });

    return renderOAuthPopupResult(res, true, member, 'discord');
  } catch (err: any) {
    console.error('Discord callback exception:', err);
    return renderOAuthPopupResult(res, false, err?.message || 'Server error during Discord authentication.', 'discord');
  }
});

// Google OAuth: Get Authorize URL
app.get('/api/auth/google/url', (req, res) => {
  const cfg = getOAuthConfig();
  const origin = (req.query.origin as string) || process.env.APP_URL || 'https://ais-dev-zrwqmxq6pzy7gmjz3dgfm3-818357937668.europe-west2.run.app';
  const cleanOrigin = origin.replace(/\/$/, '');
  const redirectUri = `${cleanOrigin}/auth/google/callback`;

  if (!cfg.googleClientId || !cfg.googleClientSecret) {
    return res.json({
      configured: false,
      provider: 'google',
      redirectUri,
      message: 'Google Client ID & Secret are not configured yet.'
    });
  }

  const state = Buffer.from(JSON.stringify({ origin: cleanOrigin })).toString('base64url');
  const params = new URLSearchParams({
    client_id: cfg.googleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state: state,
    access_type: 'offline',
    prompt: 'select_account'
  });

  res.json({
    configured: true,
    provider: 'google',
    redirectUri,
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  });
});

// Google OAuth: Callback Handler (handles both trailing slash and non-trailing slash)
app.get(['/auth/google/callback', '/auth/google/callback/'], async (req, res) => {
  const { code, error, error_description, state } = req.query;
  if (error) {
    return renderOAuthPopupResult(res, false, String(error_description || error), 'google');
  }
  if (!code || typeof code !== 'string') {
    return renderOAuthPopupResult(res, false, 'No authorization code received from Google.', 'google');
  }

  let origin = (process.env.APP_URL || 'https://ais-dev-zrwqmxq6pzy7gmjz3dgfm3-818357937668.europe-west2.run.app').replace(/\/$/, '');
  if (state && typeof state === 'string') {
    try {
      const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
      if (parsed.origin && typeof parsed.origin === 'string') {
        origin = parsed.origin.replace(/\/$/, '');
      }
    } catch (e) {
      console.warn('Could not parse Google OAuth state:', e);
    }
  }
  const redirectUri = `${origin}/auth/google/callback`;
  const cfg = getOAuthConfig();

  if (!cfg.googleClientId || !cfg.googleClientSecret) {
    return renderOAuthPopupResult(res, false, 'Google credentials missing on server.', 'google');
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cfg.googleClientId,
        client_secret: cfg.googleClientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      }).toString()
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Google token exchange error:', tokenData);
      return renderOAuthPopupResult(res, false, tokenData.error_description || tokenData.error || 'Failed to exchange Google authorization code.', 'google');
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const googleUser = await userRes.json();
    if (!userRes.ok || !googleUser.sub) {
      return renderOAuthPopupResult(res, false, 'Failed to fetch Google user profile.', 'google');
    }

    const avatarUrl = googleUser.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
    const memberName = googleUser.name || googleUser.email.split('@')[0];
    const memberEmail = googleUser.email;

    const current = siteDataCache || loadStore() || {};
    const existingMembers = Array.isArray(current.members) ? [...current.members] : [];
    let member = existingMembers.find((m: any) => m.email === memberEmail || m.id === `member-goog-${googleUser.sub}`);

    if (member) {
      member.username = memberName;
      member.avatar = avatarUrl;
      member.authProvider = 'google';
    } else {
      member = {
        id: `member-goog-${googleUser.sub}`,
        username: memberName,
        email: memberEmail,
        role: 'member',
        avatar: avatarUrl,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        favorites: [],
        claimsCount: 0,
        authProvider: 'google'
      };
      existingMembers.push(member);
    }

    const act: any = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'login',
      action: 'Google OAuth Login',
      username: member.username,
      accountTitle: `Connexion Google réelle (${memberEmail})`,
      platform: 'Google',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Google Active',
      ip: req.ip || '127.0.0.1',
      details: `Authentification réussie via Google OAuth (${memberEmail})`
    };

    const existingActivities = Array.isArray(current.activities) ? current.activities : [];
    saveStore({
      members: existingMembers,
      activities: [act, ...existingActivities.slice(0, 49)]
    });

    return renderOAuthPopupResult(res, true, member, 'google');
  } catch (err: any) {
    console.error('Google callback exception:', err);
    return renderOAuthPopupResult(res, false, err?.message || 'Server error during Google authentication.', 'google');
  }
});

// Backup download endpoint
app.get('/api/export-backup', (req, res) => {
  const current = siteDataCache || loadStore();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="easyacss-backup.json"');
  res.send(JSON.stringify(current || {}, null, 2));
});

// Backup restore endpoint
app.post('/api/import-backup', (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ error: 'Invalid backup file' });
  }
  const saved = saveStore(incoming);
  if (saved) {
    res.json({ success: true, message: 'Backup restored successfully' });
  } else {
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// GET global site data (accessible by all browsers and visitors)
app.get('/api/site-data', async (req, res) => {
  try {
    if (serverSupabase) {
      // Fetch latest from Supabase app_settings
      const { data: settingsRow, error: sErr } = await serverSupabase
        .from('app_settings')
        .select('*')
        .eq('id', 'global')
        .maybeSingle();

      const { data: configRows } = await serverSupabase
        .from('app_configs')
        .select('key, value');

      if (!sErr && (settingsRow || configRows)) {
        const remoteData: any = { ...(siteDataCache || loadStore() || {}) };
        if (settingsRow) {
          if (settingsRow.adsterra_config) remoteData.adsterraConfig = settingsRow.adsterra_config;
          if (settingsRow.shortlink_config) remoteData.shortlinkConfig = settingsRow.shortlink_config;
          if (settingsRow.site_content) remoteData.siteContent = settingsRow.site_content;
        }
        if (Array.isArray(configRows)) {
          for (const row of configRows) {
            if (row.key === 'accounts' && Array.isArray(row.value)) remoteData.accounts = row.value;
            if (row.key === 'adsterraConfig') remoteData.adsterraConfig = row.value;
            if (row.key === 'shortlinkConfig') remoteData.shortlinkConfig = row.value;
            if (row.key === 'siteContent') remoteData.siteContent = row.value;
            if (row.key === 'members' && Array.isArray(row.value)) remoteData.members = row.value;
            if (row.key === 'activities' && Array.isArray(row.value)) remoteData.activities = row.value;
          }
        }
        siteDataCache = remoteData;
        return res.json({ initialized: true, data: remoteData, source: 'supabase' });
      }
    }
  } catch (err) {
    console.warn('[EasyAcss] Supabase fetch error, falling back to local file:', err);
  }

  const current = siteDataCache || loadStore();
  if (!current) {
    return res.json({ initialized: false });
  }
  res.json({ initialized: true, data: current, source: 'local' });
});

// POST update global site data (from Admin Panel or state updates)
app.post('/api/site-data', async (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const saved = saveStore(incoming);

  // If Supabase is connected on server, persist asynchronously
  if (serverSupabase) {
    try {
      if (incoming.adsterraConfig || incoming.shortlinkConfig || incoming.siteContent) {
        await serverSupabase.from('app_settings').upsert({
          id: 'global',
          ...(incoming.adsterraConfig ? { adsterra_config: incoming.adsterraConfig } : {}),
          ...(incoming.shortlinkConfig ? { shortlink_config: incoming.shortlinkConfig } : {}),
          ...(incoming.siteContent ? { site_content: incoming.siteContent } : {}),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }

      if (incoming.adsterraConfig) {
        await serverSupabase.from('app_configs').upsert({ key: 'adsterraConfig', value: incoming.adsterraConfig, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      }
      if (incoming.shortlinkConfig) {
        await serverSupabase.from('app_configs').upsert({ key: 'shortlinkConfig', value: incoming.shortlinkConfig, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      }
      if (incoming.siteContent) {
        await serverSupabase.from('app_configs').upsert({ key: 'siteContent', value: incoming.siteContent, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      }
      if (incoming.accounts) {
        await serverSupabase.from('app_configs').upsert({ key: 'accounts', value: incoming.accounts, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      }
      if (incoming.members) {
        await serverSupabase.from('app_configs').upsert({ key: 'members', value: incoming.members, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      }
    } catch (sbErr) {
      console.error('[EasyAcss] Error writing to Supabase:', sbErr);
    }
  }

  if (saved) {
    res.json({ success: true, message: 'Data synced successfully to global database and server storage' });
  } else {
    res.status(500).json({ error: 'Failed to persist data' });
  }
});

// ==========================================
// REGISTERED MEMBERS & ROLES API
// ==========================================

// Helper to ensure master admins always present
function ensureMasterAdmins(membersList: any[]) {
  const list = Array.isArray(membersList) ? [...membersList] : [];
  if (!list.some((m) => m.username?.toLowerCase() === 'adam')) {
    list.unshift({
      id: 'member-master-adam',
      username: 'adam',
      email: 'adam@easyacss.com',
      password: 'adam12',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      createdAt: 'Master Admin',
      favorites: [],
      claimsCount: 0
    });
  }
  if (!list.some((m) => m.username?.toLowerCase() === 'admin')) {
    list.unshift({
      id: 'member-master-admin',
      username: 'admin',
      email: 'admin@easyacss.com',
      password: 'adam12',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      createdAt: 'System Admin',
      favorites: [],
      claimsCount: 0
    });
  }
  return list;
}

// GET /api/members - Fetch all registered members
app.get('/api/members', async (req, res) => {
  try {
    if (serverSupabase) {
      const { data: configRow } = await serverSupabase
        .from('app_configs')
        .select('value')
        .eq('key', 'members')
        .maybeSingle();
      if (configRow && Array.isArray(configRow.value) && configRow.value.length > 0) {
        const full = ensureMasterAdmins(configRow.value);
        return res.json({ success: true, members: full, source: 'supabase' });
      }
    }
  } catch (err) {
    console.warn('[Members API] Supabase fetch error, fallback to store:', err);
  }

  const current = siteDataCache || loadStore() || {};
  const membersList = ensureMasterAdmins(current.members || []);
  res.json({ success: true, members: membersList, source: 'local' });
});

// POST /api/members/register - Register new member from any client
app.post('/api/members/register', async (req, res) => {
  const { username, email, password } = req.body;
  const u = (username || '').trim();
  const e = (email || '').trim().toLowerCase();
  const p = (password || '').trim();

  if (!u || !e) {
    return res.status(400).json({ success: false, message: 'Please enter both username and email.' });
  }

  if (u.toLowerCase() === 'adam' || u.toLowerCase() === 'admin') {
    return res.status(400).json({ success: false, message: 'This username is reserved for the site administrator.' });
  }

  const current = siteDataCache || loadStore() || {};
  let currentMembers = ensureMasterAdmins(current.members || []);

  const exists = currentMembers.some(
    (m: any) => m.username?.toLowerCase() === u.toLowerCase() || m.email?.toLowerCase() === e
  );

  if (exists) {
    return res.status(400).json({ success: false, message: 'Username or email already registered.' });
  }

  const newMember = {
    id: `member-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    username: u,
    email: e,
    password: p,
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    favorites: [],
    claimsCount: 0
  };

  currentMembers.push(newMember);

  // Add activity log for the registration
  const regAct = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: 'register',
    action: 'New Registration',
    username: u,
    accountTitle: `New member registered (${e})`,
    platform: 'Web Portal',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Registered',
    ip: `196.75.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 200 + 10)}`,
    details: `User profile created for ${u} (${e})`
  };

  let activities = Array.isArray(current.activities) ? [regAct, ...current.activities.slice(0, 49)] : [regAct];

  saveStore({ members: currentMembers, activities });

  if (serverSupabase) {
    try {
      await serverSupabase.from('app_configs').upsert(
        { key: 'members', value: currentMembers, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
      await serverSupabase.from('app_configs').upsert(
        { key: 'activities', value: activities, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    } catch (sbErr) {
      console.error('[EasyAcss] Failed to sync new member to Supabase:', sbErr);
    }
  }

  console.log(`[EasyAcss] New member registered and saved: ${u} (${e})`);
  res.json({ success: true, member: newMember, members: currentMembers });
});

// POST /api/members/toggle-role - Promote member to Admin or Revoke Admin
app.post('/api/members/toggle-role', async (req, res) => {
  const { memberId, targetRole } = req.body;
  if (!memberId) {
    return res.status(400).json({ error: 'Missing memberId' });
  }

  const current = siteDataCache || loadStore() || {};
  let currentMembers = ensureMasterAdmins(current.members || []);

  let updatedMember: any = null;
  currentMembers = currentMembers.map((m: any) => {
    if (m.id === memberId) {
      if (m.username?.toLowerCase() === 'admin' || m.username?.toLowerCase() === 'adam') {
        return m; // Cannot demote master admins
      }
      const nextRole = targetRole || (m.role === 'admin' ? 'member' : 'admin');
      updatedMember = { ...m, role: nextRole };
      return updatedMember;
    }
    return m;
  });

  if (!updatedMember) {
    return res.status(404).json({ error: 'Member not found' });
  }

  // Activity log for role modification
  const roleAct = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: 'admin_login',
    action: updatedMember.role === 'admin' ? 'Promoted to Admin' : 'Admin Revoked',
    username: updatedMember.username,
    accountTitle: updatedMember.role === 'admin' ? `Admin privileges granted to ${updatedMember.username}` : `Admin revoked from ${updatedMember.username}`,
    platform: 'Admin Panel',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: updatedMember.role === 'admin' ? 'Admin Granted' : 'Role Revoked',
    ip: '127.0.0.1',
    details: `User ${updatedMember.username} (${updatedMember.email}) role changed to ${updatedMember.role}`
  };

  let activities = Array.isArray(current.activities) ? [roleAct, ...current.activities.slice(0, 49)] : [roleAct];

  saveStore({ members: currentMembers, activities });

  if (serverSupabase) {
    try {
      await serverSupabase.from('app_configs').upsert(
        { key: 'members', value: currentMembers, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
      await serverSupabase.from('app_configs').upsert(
        { key: 'activities', value: activities, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    } catch (sbErr) {
      console.error('[EasyAcss] Failed to sync role toggle to Supabase:', sbErr);
    }
  }

  console.log(`[EasyAcss] Role toggled for ${updatedMember.username}: ${updatedMember.role}`);
  res.json({ success: true, member: updatedMember, members: currentMembers });
});

// POST /api/members/create-admin - Provision new admin directly
app.post('/api/members/create-admin', async (req, res) => {
  const { username, email, password } = req.body;
  const u = (username || '').trim();
  const e = (email || '').trim().toLowerCase();
  const p = (password || '').trim() || 'admin123';

  if (!u || !e) {
    return res.status(400).json({ success: false, message: 'Please enter username and email' });
  }

  const current = siteDataCache || loadStore() || {};
  let currentMembers = ensureMasterAdmins(current.members || []);

  if (currentMembers.some((m: any) => m.username?.toLowerCase() === u.toLowerCase() || m.email?.toLowerCase() === e)) {
    return res.status(400).json({ success: false, message: 'Username or email already exists' });
  }

  const newAdmin = {
    id: `member-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    username: u,
    email: e,
    password: p,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    createdAt: 'Admin Staff',
    favorites: [],
    claimsCount: 0
  };

  currentMembers.push(newAdmin);
  saveStore({ members: currentMembers });

  if (serverSupabase) {
    try {
      await serverSupabase.from('app_configs').upsert(
        { key: 'members', value: currentMembers, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    } catch (sbErr) {
      console.error('[EasyAcss] Failed to sync new admin to Supabase:', sbErr);
    }
  }

  res.json({ success: true, member: newAdmin, members: currentMembers });
});

// DELETE /api/members/:id - Delete a member
app.delete('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  const current = siteDataCache || loadStore() || {};
  let currentMembers = ensureMasterAdmins(current.members || []);

  currentMembers = currentMembers.filter((m: any) => {
    if (m.id === id) {
      if (m.username?.toLowerCase() === 'admin' || m.username?.toLowerCase() === 'adam') {
        return true; // Protected
      }
      return false;
    }
    return true;
  });

  saveStore({ members: currentMembers });

  if (serverSupabase) {
    try {
      await serverSupabase.from('app_configs').upsert(
        { key: 'members', value: currentMembers, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    } catch (sbErr) {
      console.error('[EasyAcss] Failed to sync member deletion to Supabase:', sbErr);
    }
  }

  res.json({ success: true, members: currentMembers });
});

app.get('/api/supabase-status', async (req, res) => {
  const isConfigured = Boolean(serverSupabase);
  let isConnected = false;
  let errorMsg = null;

  if (serverSupabase) {
    try {
      const { error } = await serverSupabase.from('app_settings').select('id').limit(1);
      if (!error) {
        isConnected = true;
      } else {
        errorMsg = error.message;
      }
    } catch (err: any) {
      errorMsg = err?.message || 'Network error';
    }
  }

  res.json({
    configured: isConfigured,
    connected: isConnected,
    url: SUPABASE_URL ? `${SUPABASE_URL.slice(0, 16)}...` : null,
    error: errorMsg
  });
});

// Configure Supabase on the server dynamically from Admin Panel
app.post('/api/configure-supabase', async (req, res) => {
  const { url, key } = req.body || {};
  const cleanUrl = (url || '').trim();
  const cleanKey = (key || '').trim();

  if (!cleanUrl && !cleanKey) {
    serverSupabase = null;
    return res.json({ success: true, message: 'Supabase disconnected from server. Using local database storage.' });
  }

  if (!isValidSupabaseUrl(cleanUrl) || !isValidSupabaseKey(cleanKey)) {
    return res.status(400).json({ success: false, error: 'Invalid Supabase URL or Anon Key provided.' });
  }

  try {
    const testClient = createClient(cleanUrl, cleanKey, { auth: { persistSession: false } });
    const { error } = await testClient.from('app_settings').select('id').limit(1);
    
    // Even if table doesn't exist yet, client connection succeeded
    serverSupabase = testClient;
    console.log('[EasyAcss] Server Supabase re-initialized successfully with:', cleanUrl);

    // Push existing cache to seed Supabase
    if (siteDataCache) {
      try {
        if (siteDataCache.adsterraConfig || siteDataCache.shortlinkConfig || siteDataCache.siteContent) {
          await serverSupabase.from('app_settings').upsert({
            id: 'global',
            adsterra_config: siteDataCache.adsterraConfig || {},
            shortlink_config: siteDataCache.shortlinkConfig || {},
            site_content: siteDataCache.siteContent || {},
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        }
      } catch (seedErr) {
        console.warn('[EasyAcss] Initial seed to Supabase warning:', seedErr);
      }
    }

    return res.json({
      success: true,
      message: 'Supabase connected successfully on server!',
      tableNotice: error ? error.message : 'Database tables ready'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed to connect to Supabase' });
  }
});

app.get('/api/database-info', (req, res) => {
  const current = siteDataCache || loadStore() || {};
  res.json({
    status: 'online',
    mode: serverSupabase ? 'supabase_cloud' : 'server_database',
    accountsCount: Array.isArray(current.accounts) ? current.accounts.length : 0,
    membersCount: Array.isArray(current.members) ? current.members.length : 0,
    adsActive: Boolean(current.adsterraConfig?.enabled),
    lastUpdated: current.lastUpdated || new Date().toISOString(),
    realtimeSupported: true
  });
});

// ==========================================
// VITE MIDDLEWARE / SPA FALLBACK
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EasyAcss Global Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
