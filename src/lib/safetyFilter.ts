// Content and Image Safety Filter (Anti-NSFW / +18 / Explicit Content Blocker)

export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
}

// Banned adult, explicit, and inappropriate terms (multilingual: EN, FR, AR/Darija, Slang)
// Note: Only distinctive adult/NSFW tokens. Removed 2-letter tokens like 'cp' that break gaming titles like Cyberpunk 2077.
const BANNED_KEYWORDS = [
  'xxx', 'porn', 'porno', 'nsfw', 'hentai', 'rule34', 'nude', 'naked', 'sex', 'sexy',
  'boobs', 'tits', 'pussy', 'dick', 'cock', 'penis', 'vagina', 'erotic', 'erotica',
  'onlyfans', 'fansly', 'xvideos', 'xnxx', 'redtube', 'brazzers', 'pornhub',
  'strip', 'stripper', 'milf', 'fetish', 'bdsm', 'camgirl', 'chaturbate',
  'pedophile', 'pedo', 'rape', 'incest',
  // French terms
  'sexe', 'nue', 'pute', 'salope', 'bite', 'chatte', 'nichons',
  // Darija/Arabic transliterated terms
  '9ahba', 'zamel', 'tabon', 'kess', '3aryan', '3eryan', 'sharmota'
];

// Suspicious/adult domain names
const BANNED_DOMAINS = [
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'redtube.com', 'youporn.com',
  'onlyfans.com', 'chaturbate.com', 'hentaihaven.xxx', 'gelbooru.com',
  'rule34.xxx', 'danbooru.donmai.us', 'e-hentai.org', 'cam4.com', 'bongacams.com'
];

/**
 * Validates text inputs (Game Title, Instructions, Username) against explicit/NSFW content.
 */
export function checkTextSafety(text: string): SafetyCheckResult {
  if (!text || !text.trim()) return { isSafe: true };
  const normalized = text.toLowerCase().replace(/[\s_\-./\\#@!$%^&*()+=[\]{}|:;<>?~`]/g, ' ');

  for (const term of BANNED_KEYWORDS) {
    // Check whole word for clear offensive tokens
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(normalized)) {
      return {
        isSafe: false,
        reason: `Prohibited term detected (+18 / Inappropriate content: "${term}"). Please follow community gaming guidelines.`
      };
    }
  }

  return { isSafe: true };
}

/**
 * Validates Image URLs, data URLs, or file names against adult keywords, adult hosts, and +18 content.
 */
export function checkImageSafety(imageUrlOrName: string): SafetyCheckResult {
  if (!imageUrlOrName || !imageUrlOrName.trim()) {
    return { isSafe: false, reason: 'Please provide a cover image for the game.' };
  }

  const str = imageUrlOrName.trim();

  // Any base64 data URL or blob URL is valid image data from user device
  if (str.startsWith('data:image/') || str.startsWith('blob:')) {
    return { isSafe: true };
  }

  const lower = str.toLowerCase();

  // 1. Check for banned adult domains
  for (const domain of BANNED_DOMAINS) {
    if (lower.includes(domain)) {
      return {
        isSafe: false,
        reason: 'Prohibited image domain (+18 / adult hosting website is not permitted).'
      };
    }
  }

  // 2. Check for banned explicit keywords in URL / filename (with boundary or word delimiter)
  for (const term of BANNED_KEYWORDS) {
    const regex = new RegExp(`[\\b_\\-/.?=&]${term}[\\b_\\-/.?=&]`, 'i');
    if (regex.test(lower) || lower.includes(`/${term}/`)) {
      return {
        isSafe: false,
        reason: `Image file or link contains prohibited terms (+18 / "${term}"). Only video game cover visuals are permitted.`
      };
    }
  }

  // 3. Image format or URL check: allow web URLs, relative paths, or standard image filenames
  const isWebUrl = lower.startsWith('http://') || lower.startsWith('https://');
  const isImagePath = /\.(png|jpe?g|webp|gif|svg|avif|bmp|jfif|ico|tiff|heic)(\?.*)?$/i.test(lower) || lower.includes('images.unsplash.com');
  const isSafeLocalOrPreset = lower.startsWith('/') || lower.startsWith('./');

  if (!isWebUrl && !isImagePath && !isSafeLocalOrPreset) {
    // If it is just a plain filename or generic input, verify it has no dangerous script extension
    if (/\.(exe|bat|cmd|sh|vbs|js|html|php|jar|msi)$/i.test(lower)) {
      return {
        isSafe: false,
        reason: 'Invalid file format. Please upload an image (JPG, PNG, WebP, GIF, SVG, etc.).'
      };
    }
  }

  return { isSafe: true };
}

/**
 * Curated list of 100% safe, verified gaming cover presets.
 * Users can pick one with 1 click if they don't have an image URL!
 */
export const VERIFIED_GAME_COVERS = [
  {
    title: 'GTA V / Grand Theft Auto Online',
    platform: 'Steam' as const,
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Counter-Strike 2 (CS2)',
    platform: 'Steam' as const,
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Valorant',
    platform: 'Riot' as const,
    url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Minecraft Java & Bedrock',
    platform: 'Minecraft' as const,
    url: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Fortnite Battle Royale',
    platform: 'Epic Games' as const,
    url: 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Roblox Premium Account',
    platform: 'Roblox' as const,
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Cyberpunk 2077',
    platform: 'Steam' as const,
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'EA Sports FC 24',
    platform: 'Steam' as const,
    url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Call of Duty: Warzone / MW3',
    platform: 'Battle.net' as const,
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Red Dead Redemption 2',
    platform: 'Rockstar' as const,
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Xbox Game Pass PC',
    platform: 'Xbox' as const,
    url: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80'
  }
];
