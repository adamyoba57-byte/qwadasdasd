import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AdsterraConfig, ShortlinkConfig, SiteContent, GameAccount, MemberUser, ClaimActivity, VIPTier } from '../types';

const STORAGE_KEY_URL = 'easyacss_supabase_url';
const STORAGE_KEY_KEY = 'easyacss_supabase_anon_key';

export interface SupabaseConfigState {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'localStorage' | 'none';
}

let supabaseInstance: SupabaseClient | null = null;
let cachedConfigKey = '';

export function isValidSupabaseUrl(urlStr?: string | null): boolean {
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

export function isValidSupabaseKey(keyStr?: string | null): boolean {
  if (!keyStr || typeof keyStr !== 'string') return false;
  const trimmed = keyStr.trim();
  return trimmed.length > 20 && trimmed !== '11';
}

export function getSupabaseConfig(): SupabaseConfigState {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = (metaEnv.VITE_SUPABASE_URL || '').trim();
  const envKey = (metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();

  let storedUrl = '';
  let storedKey = '';
  try {
    storedUrl = (localStorage.getItem(STORAGE_KEY_URL) || '').trim();
    storedKey = (localStorage.getItem(STORAGE_KEY_KEY) || '').trim();
  } catch {}

  // Prioritize valid custom local storage credentials if user entered them in Admin Panel
  if (isValidSupabaseUrl(storedUrl) && isValidSupabaseKey(storedKey)) {
    return {
      url: storedUrl,
      anonKey: storedKey,
      isConfigured: true,
      source: 'localStorage'
    };
  }

  // Next check environment variables (if they are valid HTTP URLs and not placeholders like "11")
  if (isValidSupabaseUrl(envUrl) && isValidSupabaseKey(envKey)) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env'
    };
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none'
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured || !isValidSupabaseUrl(cfg.url) || !isValidSupabaseKey(cfg.anonKey)) {
    return null;
  }

  const currentKey = `${cfg.url}:${cfg.anonKey}`;
  if (supabaseInstance && cachedConfigKey === currentKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    cachedConfigKey = currentKey;
    return supabaseInstance;
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
    return null;
  }
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): boolean {
  try {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanKey = anonKey.trim();
    if (!isValidSupabaseUrl(cleanUrl) || !isValidSupabaseKey(cleanKey)) return false;

    localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
    localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
    supabaseInstance = null;
    cachedConfigKey = '';
    return true;
  } catch {
    return false;
  }
}

export function clearCustomSupabaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    supabaseInstance = null;
    cachedConfigKey = '';
  } catch {}
}

export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string }> {
  try {
    let client: SupabaseClient | null = null;
    if (url || key) {
      const targetUrl = (url || '').trim();
      const targetKey = (key || '').trim();
      if (!isValidSupabaseUrl(targetUrl)) {
        return {
          success: false,
          message: 'Invalid Supabase URL: Must be a valid HTTP or HTTPS URL (e.g. https://your-project.supabase.co)'
        };
      }
      if (!isValidSupabaseKey(targetKey)) {
        return {
          success: false,
          message: 'Invalid Supabase Key: Must be a valid Anon Public Key from Supabase Project Settings.'
        };
      }
      client = createClient(targetUrl, targetKey, { auth: { persistSession: false } });
    } else {
      client = getSupabaseClient();
    }

    if (!client) {
      return { success: false, message: 'Supabase URL and Anon Key are not configured.' };
    }

    // Attempt to read from app_settings or app_configs
    const { data: settingsData, error: settingsError } = await client
      .from('app_settings')
      .select('id')
      .limit(1);

    if (settingsError) {
      // Check if table missing
      if (settingsError.code === '42P01' || settingsError.message?.includes('does not exist')) {
        return {
          success: false,
          message: 'Connected to Supabase, but the "app_settings" table does not exist yet. Please run the SQL schema in your Supabase SQL Editor!'
        };
      }
      return { success: false, message: `Supabase error: ${settingsError.message}` };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase! Tables are active and ready.'
    };
  } catch (err: any) {
    return { success: false, message: `Connection failed: ${err?.message || 'Unknown network error'}` };
  }
}

/**
 * Fetch all persistent settings, ads scripts, content, and accounts from Supabase.
 * This is executed by both public visitors and the Admin Panel.
 */
export async function fetchGlobalDataFromSupabase(): Promise<{
  adsterraConfig?: AdsterraConfig;
  shortlinkConfig?: ShortlinkConfig;
  siteContent?: SiteContent;
  vipTiers?: VIPTier[];
  accounts?: GameAccount[];
  members?: MemberUser[];
  activities?: ClaimActivity[];
} | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const result: any = {};

    // 1. Fetch app_settings (contains adsterra_config, shortlink_config, site_content, vip_tiers)
    const { data: settingsRows, error: settingsErr } = await client
      .from('app_settings')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    if (!settingsErr && settingsRows) {
      if (settingsRows.adsterra_config) {
        result.adsterraConfig = settingsRows.adsterra_config;
      }
      if (settingsRows.shortlink_config) {
        result.shortlinkConfig = settingsRows.shortlink_config;
      }
      if (settingsRows.site_content) {
        result.siteContent = settingsRows.site_content;
      }
      if (settingsRows.vip_tiers) {
        result.vipTiers = settingsRows.vip_tiers;
      }
    }

    // 2. Fetch app_configs fallback (key-value JSON store)
    const { data: configRows, error: configErr } = await client
      .from('app_configs')
      .select('key, value');

    if (!configErr && Array.isArray(configRows)) {
      for (const row of configRows) {
        if (row.key === 'adsterraConfig' && !result.adsterraConfig) {
          result.adsterraConfig = row.value;
        } else if (row.key === 'shortlinkConfig' && !result.shortlinkConfig) {
          result.shortlinkConfig = row.value;
        } else if (row.key === 'siteContent' && !result.siteContent) {
          result.siteContent = row.value;
        } else if (row.key === 'vipTiers' && !result.vipTiers) {
          result.vipTiers = row.value;
        } else if (row.key === 'accounts' && !result.accounts) {
          result.accounts = row.value;
        } else if (row.key === 'members' && !result.members) {
          result.members = row.value;
        } else if (row.key === 'activities' && !result.activities) {
          result.activities = row.value;
        }
      }
    }

    // 3. Fetch structured game_accounts table if available
    const { data: accountsRows, error: accountsErr } = await client
      .from('game_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!accountsErr && Array.isArray(accountsRows) && accountsRows.length > 0) {
      // Map postgres snake_case to typescript GameAccount
      result.accounts = accountsRows.map((r: any) => ({
        id: r.id,
        title: r.title,
        platform: r.platform,
        accountType: r.account_type || 'standard',
        coverImage: r.cover_image,
        badge: r.badge || 'Verified',
        views: r.views || 0,
        gameCount: r.game_count || 1,
        includedGames: Array.isArray(r.included_games) ? r.included_games : [],
        totalValueUSD: Number(r.total_value_usd) || 0,
        stock: r.stock ?? 1,
        status: r.status || 'active',
        lastVerified: r.last_verified || 'Verified',
        credentials: r.credentials || { username: '', passwordHash: '', guardActive: false, instructions: '' },
        linkConfig: r.link_config || {},
        description: r.description || '',
        featured: Boolean(r.featured),
        isNew: Boolean(r.is_new),
        favorites: r.favorites || 0
      }));
    }

    // 4. Fetch member_users table
    const { data: membersRows, error: membersErr } = await client
      .from('member_users')
      .select('*');

    if (!membersErr && Array.isArray(membersRows) && membersRows.length > 0) {
      result.members = membersRows.map((m: any) => ({
        id: m.id,
        username: m.username,
        email: m.email,
        password: m.password,
        role: m.role || 'member',
        avatar: m.avatar,
        createdAt: m.created_at || 'Recently',
        favorites: Array.isArray(m.favorites) ? m.favorites : [],
        claimsCount: m.claims_count || 0
      }));
    }

    return result;
  } catch (err) {
    console.error('[Supabase] Error fetching global data:', err);
    return null;
  }
}

/**
 * Saves updated Adsterra configuration directly to Supabase.
 * Updates both app_settings (column adsterra_config) and app_configs (key adsterraConfig).
 */
export async function saveAdsterraConfigToSupabase(adsterraConfig: AdsterraConfig): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // 1. Upsert to app_settings
    await client
      .from('app_settings')
      .upsert({
        id: 'global',
        adsterra_config: adsterraConfig,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    // 2. Upsert to app_configs
    await client
      .from('app_configs')
      .upsert({
        key: 'adsterraConfig',
        value: adsterraConfig,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    console.log('[Supabase] Adsterra configuration persisted to Supabase database successfully.');
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to save Adsterra config:', err);
    return false;
  }
}

/**
 * Saves updated Shortlink configuration directly to Supabase.
 */
export async function saveShortlinkConfigToSupabase(shortlinkConfig: ShortlinkConfig): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    await client
      .from('app_settings')
      .upsert({
        id: 'global',
        shortlink_config: shortlinkConfig,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    await client
      .from('app_configs')
      .upsert({
        key: 'shortlinkConfig',
        value: shortlinkConfig,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    return true;
  } catch (err) {
    console.error('[Supabase] Failed to save Shortlink config:', err);
    return false;
  }
}

/**
 * Saves updated Site Content directly to Supabase.
 */
export async function saveSiteContentToSupabase(siteContent: SiteContent): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    await client
      .from('app_settings')
      .upsert({
        id: 'global',
        site_content: siteContent,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    await client
      .from('app_configs')
      .upsert({
        key: 'siteContent',
        value: siteContent,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    return true;
  } catch (err) {
    console.error('[Supabase] Failed to save Site Content:', err);
    return false;
  }
}

/**
 * Saves updated VIP Tiers directly to Supabase.
 */
export async function saveVipTiersToSupabase(vipTiers: VIPTier[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    await client
      .from('app_settings')
      .upsert({
        id: 'global',
        vip_tiers: vipTiers,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    await client
      .from('app_configs')
      .upsert({
        key: 'vipTiers',
        value: vipTiers,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    return true;
  } catch (err) {
    console.error('[Supabase] Failed to save VIP Tiers:', err);
    return false;
  }
}

/**
 * Adds or upserts a single game account in Supabase.
 */
export async function addAccountToSupabase(account: GameAccount): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const formatted = {
      id: account.id,
      title: account.title,
      platform: account.platform || 'Steam',
      account_type: account.accountType || 'standard',
      cover_image: account.coverImage,
      badge: account.badge || 'Verified',
      views: account.views || 0,
      game_count: account.gameCount || 1,
      included_games: account.includedGames || [],
      total_value_usd: account.totalValueUSD || 0,
      stock: account.stock ?? 1,
      status: account.status || 'active',
      last_verified: account.lastVerified || 'Verified',
      credentials: account.credentials || {},
      link_config: account.linkConfig || {},
      description: account.description || '',
      featured: Boolean(account.featured),
      is_new: Boolean(account.isNew),
      favorites: account.favorites || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Upsert into structured game_accounts table
    const { error: accErr } = await client.from('game_accounts').upsert(formatted, { onConflict: 'id' });
    if (accErr) {
      console.warn('[Supabase] addAccount error on game_accounts table:', accErr);
    }

    // 2. Also keep app_configs 'accounts' array synced
    const { data: configRow } = await client.from('app_configs').select('value').eq('key', 'accounts').maybeSingle();
    let currentAccounts: GameAccount[] = Array.isArray(configRow?.value) ? configRow.value : [];
    currentAccounts = [account, ...currentAccounts.filter(a => a.id !== account.id)];
    await client.from('app_configs').upsert({
      key: 'accounts',
      value: currentAccounts,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

    return true;
  } catch (err) {
    console.error('[Supabase] Failed to add account:', err);
    return false;
  }
}

/**
 * Updates a game account in Supabase.
 */
export async function updateAccountInSupabase(id: string, updated: Partial<GameAccount>): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const patch: any = { updated_at: new Date().toISOString() };
    if (updated.title !== undefined) patch.title = updated.title;
    if (updated.platform !== undefined) patch.platform = updated.platform;
    if (updated.accountType !== undefined) patch.account_type = updated.accountType;
    if (updated.coverImage !== undefined) patch.cover_image = updated.coverImage;
    if (updated.badge !== undefined) patch.badge = updated.badge;
    if (updated.views !== undefined) patch.views = updated.views;
    if (updated.gameCount !== undefined) patch.game_count = updated.gameCount;
    if (updated.includedGames !== undefined) patch.included_games = updated.includedGames;
    if (updated.totalValueUSD !== undefined) patch.total_value_usd = updated.totalValueUSD;
    if (updated.stock !== undefined) patch.stock = updated.stock;
    if (updated.status !== undefined) patch.status = updated.status;
    if (updated.lastVerified !== undefined) patch.last_verified = updated.lastVerified;
    if (updated.credentials !== undefined) patch.credentials = updated.credentials;
    if (updated.linkConfig !== undefined) patch.link_config = updated.linkConfig;
    if (updated.description !== undefined) patch.description = updated.description;
    if (updated.featured !== undefined) patch.featured = updated.featured;
    if (updated.isNew !== undefined) patch.is_new = updated.isNew;
    if (updated.favorites !== undefined) patch.favorites = updated.favorites;

    await client.from('game_accounts').update(patch).eq('id', id);

    // Update in app_configs 'accounts' array
    const { data: configRow } = await client.from('app_configs').select('value').eq('key', 'accounts').maybeSingle();
    if (Array.isArray(configRow?.value)) {
      const updatedList = configRow.value.map((a: GameAccount) => a.id === id ? { ...a, ...updated } : a);
      await client.from('app_configs').upsert({
        key: 'accounts',
        value: updatedList,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    }

    return true;
  } catch (err) {
    console.error('[Supabase] Failed to update account:', err);
    return false;
  }
}

/**
 * Deletes a game account from Supabase database.
 */
export async function deleteAccountFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // 1. Delete row from game_accounts table
    const { error: delErr } = await client.from('game_accounts').delete().eq('id', id);
    if (delErr) {
      console.warn('[Supabase] deleteAccount error on game_accounts table:', delErr);
    }

    // 2. Remove from app_configs 'accounts' array
    const { data: configRow } = await client.from('app_configs').select('value').eq('key', 'accounts').maybeSingle();
    if (Array.isArray(configRow?.value)) {
      const filtered = configRow.value.filter((a: GameAccount) => a.id !== id);
      await client.from('app_configs').upsert({
        key: 'accounts',
        value: filtered,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    }

    return true;
  } catch (err) {
    console.error('[Supabase] Failed to delete account:', err);
    return false;
  }
}

/**
 * Saves complete application state to Supabase.
 */
export async function saveAllToSupabase(data: {
  adsterraConfig?: AdsterraConfig;
  shortlinkConfig?: ShortlinkConfig;
  siteContent?: SiteContent;
  vipTiers?: VIPTier[];
  accounts?: GameAccount[];
  members?: MemberUser[];
  activities?: ClaimActivity[];
}): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const promises: Promise<any>[] = [];

    // 1. Settings
    promises.push(
      Promise.resolve(
        client
          .from('app_settings')
          .upsert({
            id: 'global',
            ...(data.adsterraConfig ? { adsterra_config: data.adsterraConfig } : {}),
            ...(data.shortlinkConfig ? { shortlink_config: data.shortlinkConfig } : {}),
            ...(data.siteContent ? { site_content: data.siteContent } : {}),
            ...(data.vipTiers ? { vip_tiers: data.vipTiers } : {}),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
      )
    );

    // 2. JSON store backup in app_configs
    if (data.adsterraConfig) {
      promises.push(Promise.resolve(client.from('app_configs').upsert({ key: 'adsterraConfig', value: data.adsterraConfig, updated_at: new Date().toISOString() }, { onConflict: 'key' })));
    }
    if (data.shortlinkConfig) {
      promises.push(Promise.resolve(client.from('app_configs').upsert({ key: 'shortlinkConfig', value: data.shortlinkConfig, updated_at: new Date().toISOString() }, { onConflict: 'key' })));
    }
    if (data.siteContent) {
      promises.push(Promise.resolve(client.from('app_configs').upsert({ key: 'siteContent', value: data.siteContent, updated_at: new Date().toISOString() }, { onConflict: 'key' })));
    }
    if (data.vipTiers) {
      promises.push(Promise.resolve(client.from('app_configs').upsert({ key: 'vipTiers', value: data.vipTiers, updated_at: new Date().toISOString() }, { onConflict: 'key' })));
    }
    if (data.accounts) {
      promises.push(Promise.resolve(client.from('app_configs').upsert({ key: 'accounts', value: data.accounts, updated_at: new Date().toISOString() }, { onConflict: 'key' })));
      
      // Also upsert accounts to game_accounts table
      const formattedAccounts = data.accounts.map((a) => ({
        id: a.id,
        title: a.title,
        platform: a.platform,
        account_type: a.accountType || 'standard',
        cover_image: a.coverImage,
        badge: a.badge,
        views: a.views || 0,
        game_count: a.gameCount || 1,
        included_games: a.includedGames || [],
        total_value_usd: a.totalValueUSD || 0,
        stock: a.stock ?? 1,
        status: a.status || 'active',
        last_verified: a.lastVerified || 'Verified',
        credentials: a.credentials || {},
        link_config: a.linkConfig || {},
        description: a.description || '',
        featured: Boolean(a.featured),
        is_new: Boolean(a.isNew),
        favorites: a.favorites || 0,
        updated_at: new Date().toISOString()
      }));

      promises.push(
        Promise.resolve(client.from('game_accounts').upsert(formattedAccounts, { onConflict: 'id' }))
      );
    }

    if (data.members) {
      promises.push(Promise.resolve(client.from('app_configs').upsert({ key: 'members', value: data.members, updated_at: new Date().toISOString() }, { onConflict: 'key' })));
    }

    await Promise.all(promises);
    return true;
  } catch (err) {
    console.error('[Supabase] Failed to save all data:', err);
    return false;
  }
}

/**
 * Saves members array to Supabase
 */
export async function saveMembersToSupabase(members: MemberUser[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const formatted = members.map((m) => ({
      id: m.id,
      username: m.username,
      email: m.email,
      password: m.password,
      role: m.role || 'member',
      avatar: m.avatar,
      created_at: m.createdAt || 'Recently',
      favorites: m.favorites || [],
      claims_count: m.claimsCount || 0
    }));

    await client.from('member_users').upsert(formatted, { onConflict: 'id' });
    await client.from('app_configs').upsert({
      key: 'members',
      value: members,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

    return true;
  } catch (err) {
    console.error('[Supabase] Failed to save members:', err);
    return false;
  }
}

/**
 * Deletes a member from Supabase
 */
export async function deleteMemberFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    await client.from('member_users').delete().eq('id', id);

    const { data: configRow } = await client.from('app_configs').select('value').eq('key', 'members').maybeSingle();
    if (Array.isArray(configRow?.value)) {
      const filtered = configRow.value.filter((m: MemberUser) => m.id !== id);
      await client.from('app_configs').upsert({
        key: 'members',
        value: filtered,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    }

    return true;
  } catch (err) {
    console.error('[Supabase] Failed to delete member:', err);
    return false;
  }
}

/**
 * Realtime listener: Subscribes to Supabase postgres_changes
 * so that when the Admin updates ads, shortlinks, or games,
 * all public visitor screens update dynamically!
 */
export function subscribeToSupabaseChanges(
  onUpdate: (payload: { table: string; data: any }) => void
): (() => void) | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('public:easyacss_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        (payload) => {
          onUpdate({ table: 'app_settings', data: payload.new });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_configs' },
        (payload) => {
          onUpdate({ table: 'app_configs', data: payload.new });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_accounts' },
        (payload) => {
          onUpdate({ table: 'game_accounts', data: payload.new });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.error('[Supabase] Realtime subscription error:', err);
    return null;
  }
}
