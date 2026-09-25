export type Platform = 'All' | 'Steam' | 'Xbox' | 'Others' | 'Cookies';

export type AccountType = 'standard';

export interface MemberUser {
  id: string;
  username: string;
  email: string;
  password?: string;
  role?: 'admin' | 'member';
  avatar?: string;
  createdAt: string;
  favorites: string[];
  claimsCount: number;
  authProvider?: 'discord' | 'google' | 'email';
  discordTag?: string;
}

export interface CommunityAccount {
  id: string;
  gameTitle: string;
  platform: 'Steam' | 'Epic Games' | 'Xbox' | 'PlayStation' | 'Riot' | 'Roblox' | 'Minecraft' | 'Others' | string;
  coverImage: string;
  imageUrl?: string;
  username: string;
  password: string;
  instructions?: string;
  notes?: string;
  submittedBy: {
    userId: string;
    username: string;
    avatar?: string;
    authProvider?: 'discord' | 'google' | 'email' | 'guest';
    discordTag?: string;
  };
  submittedAt: string;
  views: number;
  claims: number;
  status: 'active' | 'reported' | 'archived';
  isVerified?: boolean;
}

export interface AdminSession {
  isAuthenticated: boolean;
  username: string;
  loggedInAt?: string;
}

export interface IncludedGame {
  title: string;
  genre: string;
  valueUSD?: number;
  badge?: string;
}

export interface GameAccount {
  id: string;
  title: string;
  platform: 'Steam' | 'Xbox' | 'Others' | 'Cookies';
  accountType: AccountType;
  coverImage: string;
  badge: string;
  views?: number;
  gameCount: number;
  includedGames: IncludedGame[];
  totalValueUSD?: number;
  stock: number;
  status: 'active' | 'out_of_stock' | 'maintenance';
  lastVerified: string;
  credentials: {
    username: string;
    passwordHash: string;
    guardActive: boolean;
    instructions: string;
    guardCode?: string;
    cookieData?: string;
  };
  linkConfig?: {
    enabled?: boolean;
    customShortlinkUrl?: string;
    provider?: 'global' | 'cutly' | 'gplinks' | 'shrinkme' | 'droplink' | 'custom' | 'direct';
    timerSeconds?: number;
  };
  description: string;
  systemRequirements?: string;
  featured?: boolean;
  isNew?: boolean;
  favorites: number;
}

export interface ShortlinkConfig {
  enabled: boolean;
  provider: 'cutly' | 'gplinks' | 'shrinkme' | 'droplink' | 'custom';
  domain: string;
  apiToken: string;
  timerSeconds: number;
  bypassForVip?: boolean;
  simulatedLatency: boolean;
}

export interface AdsterraConfig {
  enabled: boolean;
  publisherId?: string;
  directLinkUrl: string;
  popunderEnabled: boolean;
  triggerPopunderOnClaim: boolean;
  popunderOnFirstClick?: boolean;
  popunderCode: string;
  socialBarEnabled: boolean;
  socialBarCode: string;
  banner728x90Top: string;
  banner728x90Bottom: string;
  banner300x250Sidebar: string;
  banner468x60Claim: string;
  nativeBannerCode: string;
  inFeedAdsEnabled: boolean;
  antiAdblockEnabled?: boolean;
}

export interface OAuthConfig {
  discordClientId: string;
  discordClientSecret: string;
  googleClientId: string;
  googleClientSecret: string;
}

export interface VIPTier {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  popular?: boolean;
  features: string[];
}

export type ActivityType = 'register' | 'login' | 'admin_login' | 'claim';

export interface ClaimActivity {
  id: string;
  type?: ActivityType;
  action?: string;
  username: string;
  accountId?: string;
  accountTitle: string;
  platform?: string;
  timestamp: string;
  status: string;
  ip: string;
  details?: string;
}

export type ViewType = 'home' | 'free' | 'catalog' | 'rules' | 'claim' | 'admin' | 'community';

export interface SiteContent {
  siteName: string;
  subTitle: string;
  announcement: string;
  announcementActive: boolean;
  discordUrl: string;
  discordServerName: string;
  youtubeUrl?: string;
  supportUrl: string;
  telegramUrl: string;
  rules: string[];
}
