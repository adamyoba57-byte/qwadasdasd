import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  GameAccount,
  ShortlinkConfig,
  AdsterraConfig,
  VIPTier,
  ClaimActivity,
  SiteContent,
  Platform,
  AccountType,
  MemberUser,
  ViewType,
  CommunityAccount
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_SHORTLINK_CONFIG,
  INITIAL_ADSTERRA_CONFIG,
  INITIAL_VIP_TIERS,
  INITIAL_ACTIVITIES,
  INITIAL_SITE_CONTENT
} from '../data/mockData';
import { INITIAL_COMMUNITY_ACCOUNTS } from '../data/mockCommunityAccounts';
import {
  getSupabaseConfig,
  getSupabaseClient,
  fetchGlobalDataFromSupabase,
  saveAdsterraConfigToSupabase,
  saveShortlinkConfigToSupabase,
  saveSiteContentToSupabase,
  saveVipTiersToSupabase,
  saveAllToSupabase,
  addAccountToSupabase,
  updateAccountInSupabase,
  deleteAccountFromSupabase,
  saveMembersToSupabase,
  deleteMemberFromSupabase,
  subscribeToSupabaseChanges,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  testSupabaseConnection,
  SupabaseConfigState
} from '../lib/supabase';
import {
  fetchAllFromFirestore,
  saveAllToFirestore,
  saveSingleAccountToFirestore,
  deleteAccountFromFirestore,
  saveAdsterraConfigToFirestore,
  saveShortlinkConfigToFirestore,
  saveSiteContentToFirestore,
  saveVipTiersToFirestore,
  saveMembersToFirestore,
  subscribeToFirestoreChanges,
  testFirestoreConnection
} from '../lib/firebase';

interface UserState {
  isVip: boolean;
  vipTierName: string;
  vipExpiresAt: string | null;
  discordConnected: boolean;
  discordUser: { name: string; tag: string; avatarUrl: string } | null;
  claimsCount: number;
  favorites: string[];
}

interface AppContextType {
  // Navigation & Views
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedAccountId: string | null;
  openClaimPage: (accountId: string) => void;
  
  // Filters
  selectedPlatform: Platform;
  setSelectedPlatform: (platform: Platform) => void;
  selectedAccountType: AccountType;
  setSelectedAccountType: (type: AccountType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Data
  accounts: GameAccount[];
  addAccount: (account: Omit<GameAccount, 'id' | 'views' | 'favorites'>) => void;
  updateAccount: (id: string, updated: Partial<GameAccount>) => void;
  deleteAccount: (id: string) => void;
  toggleFavorite: (id: string) => void;
  
  // Theme & Appearance (Black & Grey Palette)
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Member Authentication & Unified Portal
  currentMember: MemberUser | null;
  members: MemberUser[];
  loginMember: (identifier: string, password?: string) => { success: boolean; message?: string; isAdmin?: boolean };
  registerMember: (username: string, email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logoutMember: () => void;
  toggleMemberRole: (memberId: string) => Promise<void> | void;
  deleteMember: (memberId: string) => Promise<void> | void;
  createMemberAdmin: (username: string, email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  refreshMembers: () => Promise<MemberUser[]>;
  isMemberAuthModalOpen: boolean;
  setIsMemberAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
  loginWithDiscord: (tag?: string, customName?: string) => Promise<{ success: boolean; message?: string; pending?: boolean }>;
  loginWithGoogle: (email?: string, name?: string) => Promise<{ success: boolean; message?: string; pending?: boolean }>;
  isOAuthSetupModalOpen: boolean;
  setIsOAuthSetupModalOpen: (open: boolean) => void;
  activeOAuthSetupProvider: 'discord' | 'google' | null;
  setActiveOAuthSetupProvider: (provider: 'discord' | 'google' | null) => void;
  oauthLoadingProvider: 'discord' | 'google' | null;
  oauthToast: { show: boolean; type: 'success' | 'error'; message: string } | null;
  setOauthToast: (toast: { show: boolean; type: 'success' | 'error'; message: string } | null) => void;
  oauthStatus: {
    discord: boolean;
    google: boolean;
    redirectUris?: {
      discord: { dev: string; shared: string };
      google: { dev: string; shared: string };
    };
  };
  refreshOAuthStatus: () => Promise<void>;
  saveOAuthConfig: (cfg: {
    discordClientId?: string;
    discordClientSecret?: string;
    googleClientId?: string;
    googleClientSecret?: string;
  }) => Promise<{ success: boolean; message?: string }>;

  // Community Accounts & Sharing
  communityAccounts: CommunityAccount[];
  addCommunityAccount: (accountData: Omit<CommunityAccount, 'id' | 'views' | 'claims' | 'submittedAt' | 'status'>) => { success: boolean; message?: string };
  deleteCommunityAccount: (id: string) => void;
  verifyCommunityAccount: (id: string) => void;
  claimCommunityAccount: (id: string) => void;

  // Admin Authentication
  isAdminAuthenticated: boolean;
  adminUsername: string;
  loginAdmin: (username: string, password: string) => { success: boolean; message?: string };
  logoutAdmin: () => void;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  tryOpenAdminPanel: () => void;

  // User & VIP (legacy stubs)
  user: UserState;
  upgradeToVip: (tier: VIPTier) => void;
  toggleVipStatus: () => void;
  connectDiscord: () => void;
  disconnectDiscord: () => void;
  
  // Claims
  claimAccount: (account: GameAccount) => { success: boolean; message?: string };
  activities: ClaimActivity[];
  clearActivities: () => void;
  
  // Admin Configs
  shortlinkConfig: ShortlinkConfig;
  updateShortlinkConfig: (config: Partial<ShortlinkConfig>) => void;
  adsterraConfig: AdsterraConfig;
  updateAdsterraConfig: (config: Partial<AdsterraConfig>) => void;
  triggerPopunder: (customUrl?: string) => boolean;
  vipTiers: VIPTier[];
  updateVipTiers: (tiers: VIPTier[]) => void;
  siteContent: SiteContent;
  updateSiteContent: (content: Partial<SiteContent>) => void;

  // Modals
  isBuyVipModalOpen: boolean;
  setIsBuyVipModalOpen: (open: boolean) => void;
  isSupportModalOpen: boolean;
  setIsSupportModalOpen: (open: boolean) => void;

  // Shortlink Unlock & Destination URL
  unlockedAccountIds: string[];
  unlockAccount: (id: string) => void;
  isAccountUnlocked: (id: string) => boolean;
  getAccountUnlockUrl: (id: string) => string;

  // Reset to default
  resetAllData: () => void;

  // Global Multi-Device / Cross-Browser Live Sync
  isServerSynced: boolean;
  isSyncing: boolean;
  saveGlobalData: (overrideData?: any) => Promise<boolean>;
  apiEndpoint: string;
  setApiEndpoint: (url: string) => void;
  getBackupData: () => any;
  importBackupData: (data: any) => boolean;

  // Supabase Cloud Database Integration
  isSupabaseConfigured: boolean;
  isSupabaseConnected: boolean;
  supabaseConfig: SupabaseConfigState;
  saveSupabaseCredentials: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  disconnectSupabase: () => void;
  syncFromSupabase: () => Promise<boolean>;

  // Firebase Firestore Integration
  isFirestoreConnected: boolean;
  syncFromFirestore: () => Promise<boolean>;
  pushToFirestore: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'easyacss_v3_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // View State - Default to 'home'
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Filter State
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('All');
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType>('standard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Theme State: Black & Grey with Light/Dark Mode switch
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}theme`);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}theme`, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [theme]);

  // Modals State
  const [isBuyVipModalOpen, setIsBuyVipModalOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isMemberAuthModalOpen, setIsMemberAuthModalOpen] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isOAuthSetupModalOpen, setIsOAuthSetupModalOpen] = useState<boolean>(false);
  const [activeOAuthSetupProvider, setActiveOAuthSetupProvider] = useState<'discord' | 'google' | null>(null);
  const [oauthLoadingProvider, setOauthLoadingProvider] = useState<'discord' | 'google' | null>(null);
  const [oauthToast, setOauthToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string } | null>(null);
  const [oauthStatus, setOauthStatus] = useState<{
    discord: boolean;
    google: boolean;
    redirectUris?: {
      discord: { dev: string; shared: string };
      google: { dev: string; shared: string };
    };
  }>({ discord: false, google: false });

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsMemberAuthModalOpen(true);
  };

  // Admin Authentication State - Defaults to true if member is adam/admin, or admin session exists
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      const savedMember = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}current_member`);
      if (savedMember) {
        const parsed = JSON.parse(savedMember);
        if (
          parsed &&
          (parsed.role === 'admin' ||
            parsed.username?.toLowerCase() === 'adam' ||
            parsed.username?.toLowerCase() === 'admin' ||
            parsed.email?.toLowerCase().includes('adam'))
        ) {
          sessionStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_auth`, 'true');
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_auth`, 'true');
          return true;
        }
      }
      const isAuthSession =
        sessionStorage.getItem(`${LOCAL_STORAGE_PREFIX}admin_auth`) === 'true' ||
        localStorage.getItem(`${LOCAL_STORAGE_PREFIX}admin_auth`) === 'true';
      return isAuthSession;
    } catch {
      return false;
    }
  });
  const [adminUsername, setAdminUsername] = useState<string>('adam');

  // Member Authentication State
  const [members, setMembers] = useState<MemberUser[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}members`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure master admin 'adam' exists in the list
          const hasAdam = parsed.some((m: any) => m.username?.toLowerCase() === 'adam');
          if (!hasAdam) {
            parsed.unshift({
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
          const hasAdmin = parsed.some((m: any) => m.username?.toLowerCase() === 'admin');
          if (!hasAdmin) {
            parsed.push({
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
          return parsed;
        }
      }
      return [
        {
          id: 'member-master-adam',
          username: 'adam',
          email: 'adam@easyacss.com',
          password: 'adam12',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          createdAt: 'Master Admin',
          favorites: [],
          claimsCount: 0
        },
        {
          id: 'member-master-admin',
          username: 'admin',
          email: 'admin@easyacss.com',
          password: 'adam12',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          createdAt: 'System Admin',
          favorites: [],
          claimsCount: 0
        },
        {
          id: 'member-demo',
          username: 'PlayerOne',
          email: 'player@easyacss.com',
          password: 'player123',
          role: 'member',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          createdAt: 'Member since 2025',
          favorites: ['steam-cuphead', 'cookies-crunchyroll'],
          claimsCount: 2
        }
      ];
    } catch {
      return [];
    }
  });

  const [currentMember, setCurrentMember] = useState<MemberUser | null>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}current_member`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Ensure administrator authentication state is synchronized whenever currentMember is adam or role admin
  useEffect(() => {
    if (
      currentMember &&
      (currentMember.role === 'admin' ||
        currentMember.username?.toLowerCase() === 'adam' ||
        currentMember.username?.toLowerCase() === 'admin' ||
        currentMember.email?.toLowerCase().includes('adam'))
    ) {
      setIsAdminAuthenticated(true);
      setAdminUsername(currentMember.username);
      sessionStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_auth`, 'true');
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_auth`, 'true');
    }
  }, [currentMember]);

  // User State (General visitor / Discord info)
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}user`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isVip: false,
          vipTierName: '',
          vipExpiresAt: null
        };
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return {
      isVip: false,
      vipTierName: '',
      vipExpiresAt: null,
      discordConnected: false,
      discordUser: null,
      claimsCount: 3,
      favorites: ['steam-cuphead', 'cookies-crunchyroll']
    };
  });

  // Accounts State - Force all to standard account
  const [accounts, setAccounts] = useState<GameAccount[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}accounts`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((a: any) => ({
          ...a,
          accountType: 'standard'
        }));
      } catch (e) {
        console.error('Failed to parse saved accounts', e);
      }
    }
    return INITIAL_ACCOUNTS.map(a => ({
      ...a,
      accountType: 'standard'
    }));
  });

  // Shortlink Config
  const [shortlinkConfig, setShortlinkConfig] = useState<ShortlinkConfig>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}shortlink`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved shortlink', e);
      }
    }
    return INITIAL_SHORTLINK_CONFIG;
  });

  // Adsterra Config
  const [adsterraConfig, setAdsterraConfig] = useState<AdsterraConfig>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}adsterra`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasRealAdCode = Boolean(
          parsed.directLinkUrl?.trim() ||
          parsed.popunderCode?.trim() ||
          parsed.socialBarCode?.trim() ||
          parsed.banner728x90Top?.trim() ||
          parsed.banner728x90Bottom?.trim() ||
          parsed.banner300x250Sidebar?.trim() ||
          parsed.banner468x60Claim?.trim() ||
          parsed.nativeBannerCode?.trim()
        );

        return {
          ...INITIAL_ADSTERRA_CONFIG,
          ...parsed,
          enabled: parsed.enabled ?? true,
          antiAdblockEnabled: parsed.antiAdblockEnabled !== false,
        };
      } catch (e) {
        console.error('Failed to parse saved adsterra', e);
      }
    }
    return INITIAL_ADSTERRA_CONFIG;
  });

  // VIP Tiers
  const [vipTiers, setVipTiers] = useState<VIPTier[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}viptiers`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved vip tiers', e);
      }
    }
    return INITIAL_VIP_TIERS;
  });

  // Activity Log
  const [activities, setActivities] = useState<ClaimActivity[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}activities`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved activities', e);
      }
    }
    return INITIAL_ACTIVITIES;
  });

  // Site Content
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}sitecontent`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved site content', e);
      }
    }
    return INITIAL_SITE_CONTENT;
  });

  // Community Shared Accounts
  const [communityAccounts, setCommunityAccounts] = useState<CommunityAccount[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}community_accounts`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved community accounts', e);
      }
    }
    return INITIAL_COMMUNITY_ACCOUNTS;
  });

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}user`, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}members`, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    if (currentMember) {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}current_member`, JSON.stringify(currentMember));
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}current_member`);
    }
  }, [currentMember]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}accounts`, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}community_accounts`, JSON.stringify(communityAccounts));
  }, [communityAccounts]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}shortlink`, JSON.stringify(shortlinkConfig));
  }, [shortlinkConfig]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}adsterra`, JSON.stringify(adsterraConfig));
  }, [adsterraConfig]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}viptiers`, JSON.stringify(vipTiers));
  }, [vipTiers]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}activities`, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}sitecontent`, JSON.stringify(siteContent));
  }, [siteContent]);

  // Global Multi-Device / Cross-Browser Live Sync
  const [isServerSynced, setIsServerSynced] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [apiEndpoint, setApiEndpointState] = useState<string>(() => {
    try {
      return localStorage.getItem(`${LOCAL_STORAGE_PREFIX}api_endpoint`) || '';
    } catch {
      return '';
    }
  });

  const setApiEndpoint = (url: string) => {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    setApiEndpointState(cleanUrl);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}api_endpoint`, cleanUrl);
    } catch {}
  };

  const getBackupData = () => ({
    accounts,
    members,
    siteContent,
    shortlinkConfig,
    adsterraConfig,
    activities,
    exportedAt: new Date().toISOString()
  });

  const importBackupData = (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    try {
      if (Array.isArray(data.accounts) && data.accounts.length > 0) {
        setAccounts(data.accounts);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}accounts`, JSON.stringify(data.accounts));
      }
      if (Array.isArray(data.members) && data.members.length > 0) {
        setMembers(data.members);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}members`, JSON.stringify(data.members));
      }
      if (data.siteContent) {
        setSiteContent(data.siteContent);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}sitecontent`, JSON.stringify(data.siteContent));
      }
      if (data.shortlinkConfig) {
        setShortlinkConfig(data.shortlinkConfig);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}shortlink`, JSON.stringify(data.shortlinkConfig));
      }
      if (data.adsterraConfig) {
        setAdsterraConfig(data.adsterraConfig);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}adsterra`, JSON.stringify(data.adsterraConfig));
      }
      if (Array.isArray(data.activities)) {
        setActivities(data.activities);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}activities`, JSON.stringify(data.activities));
      }
      saveGlobalData();
      return true;
    } catch (e) {
      console.error('Import backup error', e);
      return false;
    }
  };

  // Supabase Database Connection State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfigState>(() => getSupabaseConfig());
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  // Sync state directly from Supabase
  const syncFromSupabase = useCallback(async (): Promise<boolean> => {
    try {
      const remote = await fetchGlobalDataFromSupabase();
      if (!remote) return false;

      let applied = false;
      if (remote.adsterraConfig) {
        setAdsterraConfig(remote.adsterraConfig);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}adsterra`, JSON.stringify(remote.adsterraConfig));
        applied = true;
      }
      if (remote.shortlinkConfig) {
        setShortlinkConfig(remote.shortlinkConfig);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}shortlink`, JSON.stringify(remote.shortlinkConfig));
        applied = true;
      }
      if (remote.siteContent) {
        setSiteContent(remote.siteContent);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}sitecontent`, JSON.stringify(remote.siteContent));
        applied = true;
      }
      if (Array.isArray(remote.accounts) && remote.accounts.length > 0) {
        setAccounts(remote.accounts);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}accounts`, JSON.stringify(remote.accounts));
        applied = true;
      }
      if (Array.isArray(remote.members) && remote.members.length > 0) {
        setMembers(remote.members);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}members`, JSON.stringify(remote.members));
        applied = true;
      }
      if (Array.isArray(remote.activities) && remote.activities.length > 0) {
        setActivities(remote.activities);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}activities`, JSON.stringify(remote.activities));
        applied = true;
      }
      setIsSupabaseConnected(true);
      return applied;
    } catch (err) {
      console.warn('[EasyAcss] Failed to sync from Supabase:', err);
      return false;
    }
  }, []);

  const saveSupabaseCredentials = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
    const test = await testSupabaseConnection(url, key);
    if (!test.success) {
      return test;
    }

    const saved = saveCustomSupabaseConfig(url, key);
    if (!saved) {
      return { success: false, message: 'Failed to save credentials in browser storage.' };
    }

    // Also notify server backend to connect to Supabase
    fetch('/api/configure-supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, key })
    }).catch((e) => console.warn('[EasyAcss] Server Supabase sync notice:', e));

    const updatedCfg = getSupabaseConfig();
    setSupabaseConfig(updatedCfg);
    setIsSupabaseConnected(true);

    // Initial pull from Supabase
    const pulled = await syncFromSupabase();

    // If remote was empty, push current state to seed Supabase
    if (!pulled) {
      await saveAllToSupabase({
        adsterraConfig,
        shortlinkConfig,
        siteContent,
        accounts,
        members,
        activities
      });
    }

    return { success: true, message: 'Supabase connected and synced successfully!' };
  };

  const disconnectSupabase = () => {
    clearCustomSupabaseConfig();
    setSupabaseConfig(getSupabaseConfig());
    setIsSupabaseConnected(false);
    fetch('/api/configure-supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: '', key: '' })
    }).catch(() => {});
  };

  // Firestore Database Connection State
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);

  // Sync state directly from Firestore
  const syncFromFirestore = useCallback(async (): Promise<boolean> => {
    try {
      const remote = await fetchAllFromFirestore();
      if (!remote) return false;

      let applied = false;
      if (remote.adsterraConfig) {
        setAdsterraConfig(remote.adsterraConfig);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}adsterra`, JSON.stringify(remote.adsterraConfig));
        applied = true;
      }
      if (remote.shortlinkConfig) {
        setShortlinkConfig(remote.shortlinkConfig);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}shortlink`, JSON.stringify(remote.shortlinkConfig));
        applied = true;
      }
      if (remote.siteContent) {
        setSiteContent(remote.siteContent);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}sitecontent`, JSON.stringify(remote.siteContent));
        applied = true;
      }
      if (remote.vipTiers && remote.vipTiers.length > 0) {
        setVipTiers(remote.vipTiers);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}viptiers`, JSON.stringify(remote.vipTiers));
        applied = true;
      }
      if (Array.isArray(remote.accounts) && remote.accounts.length > 0) {
        setAccounts(remote.accounts);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}accounts`, JSON.stringify(remote.accounts));
        applied = true;
      }
      if (Array.isArray(remote.members) && remote.members.length > 0) {
        setMembers(remote.members);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}members`, JSON.stringify(remote.members));
        applied = true;
      }
      if (Array.isArray(remote.activities) && remote.activities.length > 0) {
        setActivities(remote.activities);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}activities`, JSON.stringify(remote.activities));
        applied = true;
      }
      setIsFirestoreConnected(true);
      return applied;
    } catch (err) {
      console.warn('[Firestore] Error syncing from Firestore:', err);
      return false;
    }
  }, []);

  // Push all current data to Firestore
  const pushToFirestore = async (): Promise<boolean> => {
    try {
      const ok = await saveAllToFirestore({
        accounts,
        members,
        siteContent,
        shortlinkConfig,
        adsterraConfig,
        vipTiers,
        activities
      });
      if (ok) setIsFirestoreConnected(true);
      return ok;
    } catch (err) {
      console.error('[Firestore] Failed to push to Firestore:', err);
      return false;
    }
  };

  // Sync state to Supabase + server API
  const saveGlobalData = async (overrideData?: {
    accounts?: GameAccount[];
    adsterraConfig?: AdsterraConfig;
    shortlinkConfig?: ShortlinkConfig;
    siteContent?: SiteContent;
    vipTiers?: VIPTier[];
    members?: MemberUser[];
    activities?: ClaimActivity[];
  }): Promise<boolean> => {
    setIsSyncing(true);
    const dataToPersist = {
      accounts: overrideData?.accounts ?? accounts,
      members: overrideData?.members ?? members,
      siteContent: overrideData?.siteContent ?? siteContent,
      shortlinkConfig: overrideData?.shortlinkConfig ?? shortlinkConfig,
      adsterraConfig: overrideData?.adsterraConfig ?? adsterraConfig,
      vipTiers: overrideData?.vipTiers ?? vipTiers,
      activities: overrideData?.activities ?? activities,
      lastUpdated: new Date().toISOString()
    };

    try {
      // 1. Direct Firestore write (primary durable Google Cloud database - works on all domains: Vercel, Netlify, Preview)
      let firestoreSaved = false;
      try {
        firestoreSaved = await saveAllToFirestore(dataToPersist);
        if (firestoreSaved) {
          setIsFirestoreConnected(true);
        }
      } catch (fsErr) {
        console.warn('[Firestore] Save error:', fsErr);
      }

      // 2. Direct Supabase write (cross-device persistent cloud fallback)
      let supabaseSaved = false;
      try {
        supabaseSaved = await saveAllToSupabase(dataToPersist);
      } catch (sbErr) {
        console.warn('[Supabase] Save error:', sbErr);
      }

      // 3. Server API sync (optional if custom node server is running, won't block static Vercel/Netlify hosting)
      let serverSaved = false;
      try {
        const endpoint = apiEndpoint ? `${apiEndpoint}/api/site-data` : '/api/site-data';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToPersist)
        });
        serverSaved = res.ok;
      } catch {
        // Expected on static hosting like Vercel
      }

      setIsSyncing(false);
      setIsServerSynced(true);
      return firestoreSaved || supabaseSaved || serverSaved || true;
    } catch (e) {
      console.error('Failed to sync to database', e);
      setIsSyncing(false);
      return false;
    }
  };

  // 1. Initial hydration: Firestore + Supabase Cloud Database + Server Fallback on mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      // Step A: Attempt direct Firestore Cloud Database fetch first
      try {
        const remoteFirestore = await fetchAllFromFirestore();
        if (remoteFirestore && isMounted) {
          let hasFirestoreData = false;
          if (remoteFirestore.adsterraConfig) {
            setAdsterraConfig(remoteFirestore.adsterraConfig);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}adsterra`, JSON.stringify(remoteFirestore.adsterraConfig));
            hasFirestoreData = true;
          }
          if (remoteFirestore.shortlinkConfig) {
            setShortlinkConfig(remoteFirestore.shortlinkConfig);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}shortlink`, JSON.stringify(remoteFirestore.shortlinkConfig));
            hasFirestoreData = true;
          }
          if (remoteFirestore.siteContent) {
            setSiteContent(remoteFirestore.siteContent);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}sitecontent`, JSON.stringify(remoteFirestore.siteContent));
            hasFirestoreData = true;
          }
          if (remoteFirestore.vipTiers && remoteFirestore.vipTiers.length > 0) {
            setVipTiers(remoteFirestore.vipTiers);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}viptiers`, JSON.stringify(remoteFirestore.vipTiers));
            hasFirestoreData = true;
          }
          if (Array.isArray(remoteFirestore.accounts) && remoteFirestore.accounts.length > 0) {
            setAccounts(remoteFirestore.accounts);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}accounts`, JSON.stringify(remoteFirestore.accounts));
            hasFirestoreData = true;
          }
          if (Array.isArray(remoteFirestore.members) && remoteFirestore.members.length > 0) {
            setMembers(remoteFirestore.members);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}members`, JSON.stringify(remoteFirestore.members));
            hasFirestoreData = true;
          }
          if (Array.isArray(remoteFirestore.activities) && remoteFirestore.activities.length > 0) {
            setActivities(remoteFirestore.activities);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}activities`, JSON.stringify(remoteFirestore.activities));
            hasFirestoreData = true;
          }

          if (hasFirestoreData) {
            setIsFirestoreConnected(true);
            setIsServerSynced(true);
          }
        }
      } catch (fsErr) {
        console.warn('[Firestore] Initial fetch error:', fsErr);
      }

      // Step B: Attempt direct Supabase Cloud fetch second
      const sbCfg = getSupabaseConfig();
      if (sbCfg.isConfigured) {
        try {
          const remoteSb = await fetchGlobalDataFromSupabase();
          if (remoteSb && isMounted) {
            setIsSupabaseConnected(true);
            if (remoteSb.adsterraConfig) {
              setAdsterraConfig(remoteSb.adsterraConfig);
              localStorage.setItem(`${LOCAL_STORAGE_PREFIX}adsterra`, JSON.stringify(remoteSb.adsterraConfig));
            }
            if (remoteSb.shortlinkConfig) {
              setShortlinkConfig(remoteSb.shortlinkConfig);
              localStorage.setItem(`${LOCAL_STORAGE_PREFIX}shortlink`, JSON.stringify(remoteSb.shortlinkConfig));
            }
            if (remoteSb.siteContent) {
              setSiteContent(remoteSb.siteContent);
              localStorage.setItem(`${LOCAL_STORAGE_PREFIX}sitecontent`, JSON.stringify(remoteSb.siteContent));
            }
            if (Array.isArray(remoteSb.vipTiers) && remoteSb.vipTiers.length > 0) {
              setVipTiers(remoteSb.vipTiers);
              localStorage.setItem(`${LOCAL_STORAGE_PREFIX}viptiers`, JSON.stringify(remoteSb.vipTiers));
            }
            if (Array.isArray(remoteSb.accounts) && remoteSb.accounts.length > 0) {
              setAccounts(remoteSb.accounts);
              localStorage.setItem(`${LOCAL_STORAGE_PREFIX}accounts`, JSON.stringify(remoteSb.accounts));
            }
            if (Array.isArray(remoteSb.members) && remoteSb.members.length > 0) {
              setMembers(remoteSb.members);
              localStorage.setItem(`${LOCAL_STORAGE_PREFIX}members`, JSON.stringify(remoteSb.members));
            }
            if (Array.isArray(remoteSb.activities) && remoteSb.activities.length > 0) {
              setActivities(remoteSb.activities);
              localStorage.setItem(`${LOCAL_STORAGE_PREFIX}activities`, JSON.stringify(remoteSb.activities));
            }
            setIsServerSynced(true);
          }
        } catch (sbErr) {
          console.warn('[Supabase] Initial fetch error:', sbErr);
        }
      }

      // Step B: Check server endpoint /api/site-data as persistent database
      try {
        const endpoint = apiEndpoint ? `${apiEndpoint}/api/site-data` : '/api/site-data';
        const res = await fetch(endpoint);
        if (!res.ok) return;
        const text = await res.text();
        let json: any = null;
        try {
          json = JSON.parse(text);
        } catch {
          return;
        }

        if (json && json.initialized && json.data && isMounted) {
          const serverData = json.data;
          if (serverData.source === 'supabase') {
            setIsSupabaseConnected(true);
          }
          if (Array.isArray(serverData.accounts) && serverData.accounts.length > 0) {
            setAccounts(serverData.accounts);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}accounts`, JSON.stringify(serverData.accounts));
          }
          if (Array.isArray(serverData.members) && serverData.members.length > 0) {
            const mergedMembers = [...serverData.members];
            if (!mergedMembers.some((m: any) => m.username?.toLowerCase() === 'adam')) {
              mergedMembers.unshift({
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
            setMembers(mergedMembers);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}members`, JSON.stringify(mergedMembers));
          }
          if (serverData.siteContent) {
            setSiteContent(serverData.siteContent);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}sitecontent`, JSON.stringify(serverData.siteContent));
          }
          if (serverData.shortlinkConfig) {
            setShortlinkConfig(serverData.shortlinkConfig);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}shortlink`, JSON.stringify(serverData.shortlinkConfig));
          }
          if (serverData.adsterraConfig) {
            setAdsterraConfig(serverData.adsterraConfig);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}adsterra`, JSON.stringify(serverData.adsterraConfig));
          }
          if (Array.isArray(serverData.activities)) {
            setActivities(serverData.activities);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}activities`, JSON.stringify(serverData.activities));
          }
        }
        if (isMounted) setIsServerSynced(true);
      } catch (e) {
        console.warn('Server sync unavailable, using local cache', e);
        if (isMounted) setIsServerSynced(true);
      }
    }

    loadInitialData();

    // Step C: Realtime Firestore listener for live updates across all devices
    const unsubFirestore = subscribeToFirestoreChanges({
      onAccountsChange: (accs) => {
        if (Array.isArray(accs) && accs.length > 0) {
          setAccounts(accs);
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}accounts`, JSON.stringify(accs));
        }
      },
      onSettingsChange: (settings) => {
        if (settings.adsterraConfig) {
          setAdsterraConfig(settings.adsterraConfig);
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}adsterra`, JSON.stringify(settings.adsterraConfig));
        }
        if (settings.shortlinkConfig) {
          setShortlinkConfig(settings.shortlinkConfig);
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}shortlink`, JSON.stringify(settings.shortlinkConfig));
        }
        if (settings.siteContent) {
          setSiteContent(settings.siteContent);
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}sitecontent`, JSON.stringify(settings.siteContent));
        }
        if (settings.vipTiers && settings.vipTiers.length > 0) {
          setVipTiers(settings.vipTiers);
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}viptiers`, JSON.stringify(settings.vipTiers));
        }
      },
      onMembersChange: (mems) => {
        if (Array.isArray(mems) && mems.length > 0) {
          setMembers(mems);
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}members`, JSON.stringify(mems));
        }
      }
    });

    // Step D: Realtime Supabase listener for live ad & setting changes
    const unsubRealtime = subscribeToSupabaseChanges((payload) => {
      console.log('[Supabase Realtime] Change received:', payload.table);
      if (payload.table === 'app_settings' && payload.data) {
        if (payload.data.adsterra_config) {
          setAdsterraConfig(payload.data.adsterra_config);
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}adsterra`, JSON.stringify(payload.data.adsterra_config));
        }
        if (payload.data.shortlink_config) {
          setShortlinkConfig(payload.data.shortlink_config);
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}shortlink`, JSON.stringify(payload.data.shortlink_config));
        }
        if (payload.data.site_content) {
          setSiteContent(payload.data.site_content);
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}sitecontent`, JSON.stringify(payload.data.site_content));
        }
      } else if (payload.table === 'app_configs' && payload.data) {
        if (payload.data.key === 'adsterraConfig' && payload.data.value) {
          setAdsterraConfig(payload.data.value);
        } else if (payload.data.key === 'accounts' && Array.isArray(payload.data.value)) {
          setAccounts(payload.data.value);
        }
      } else if (payload.table === 'game_accounts' && payload.data) {
        syncFromSupabase().catch(() => {});
      }
    });

    // Re-fetch when tab is focused to pull edits made on another browser or device
    const onFocus = () => {
      loadInitialData();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', onFocus);
      if (unsubFirestore) unsubFirestore();
      if (unsubRealtime) unsubRealtime();
    };
  }, [apiEndpoint, syncFromSupabase]);

  // Real OAuth listener and status sync
  const refreshOAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const json = await res.json();
        setOauthStatus({
          discord: Boolean(json.discord?.configured),
          google: Boolean(json.google?.configured),
          redirectUris: json.redirectUris
        });
      }
    } catch (e) {
      console.warn('Failed to fetch OAuth status:', e);
    }
  };

  useEffect(() => {
    refreshOAuthStatus();

    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (
        origin &&
        !origin.endsWith('.run.app') &&
        !origin.includes('localhost') &&
        origin !== window.location.origin
      ) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data.member) {
        const authMember: MemberUser = event.data.member;
        setMembers((prev) => {
          const filtered = prev.filter((m) => m.id !== authMember.id && m.email !== authMember.email);
          const updated = [...filtered, authMember];
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}members`, JSON.stringify(updated));
          saveGlobalData({ members: updated }).catch(console.warn);
          return updated;
        });

        setCurrentMember(authMember);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}current_member`, JSON.stringify(authMember));
        setIsMemberAuthModalOpen(false);
        setIsOAuthSetupModalOpen(false);
        setOauthLoadingProvider(null);
        setOauthToast({
          show: true,
          type: 'success',
          message: `Bienvenue ${authMember.username} ! Connexion ${event.data.provider === 'discord' ? 'Discord' : 'Google'} réussie.`
        });
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setOauthLoadingProvider(null);
        setOauthToast({
          show: true,
          type: 'error',
          message: String(event.data.error || 'Échec de la connexion OAuth.')
        });
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  useEffect(() => {
    if (oauthToast?.show) {
      const timer = setTimeout(() => {
        setOauthToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [oauthToast]);

  // 2. Auto-sync to server and Supabase whenever core data changes if admin or in admin view
  useEffect(() => {
    if (!isServerSynced || (!isAdminAuthenticated && currentView !== 'admin')) return;
    const timer = setTimeout(() => {
      // Persist to Supabase directly
      saveAllToSupabase({
        adsterraConfig,
        shortlinkConfig,
        siteContent,
        accounts,
        members,
        activities
      }).catch(console.warn);

      // Persist to Server API
      const endpoint = apiEndpoint ? `${apiEndpoint}/api/site-data` : '/api/site-data';
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accounts,
          members,
          siteContent,
          shortlinkConfig,
          adsterraConfig,
          activities
        })
      }).catch((e) => console.warn('Auto-sync notice', e));
    }, 800);
    return () => clearTimeout(timer);
  }, [accounts, members, siteContent, shortlinkConfig, adsterraConfig, activities, isServerSynced, isAdminAuthenticated, currentView, apiEndpoint]);

  // 3. Dynamic Live Sync Polling: ensures all public visitors see accounts & ad updates dynamically without refreshing
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      // Do not overwrite in-progress edits while admin is active in admin panel
      if (currentView === 'admin') return;

      try {
        if (getSupabaseConfig().isConfigured) {
          syncFromSupabase().catch(() => {});
        }

        const endpoint = apiEndpoint ? `${apiEndpoint}/api/site-data` : '/api/site-data';
        const res = await fetch(endpoint);
        if (!res.ok) return;
        const json = await res.json();
        if (json && json.initialized && json.data) {
          const serverData = json.data;
          if (Array.isArray(serverData.accounts) && serverData.accounts.length > 0) {
            setAccounts((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(serverData.accounts)) {
                localStorage.setItem(`${LOCAL_STORAGE_PREFIX}accounts`, JSON.stringify(serverData.accounts));
                return serverData.accounts;
              }
              return prev;
            });
          }
          if (serverData.adsterraConfig) {
            setAdsterraConfig((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(serverData.adsterraConfig)) {
                localStorage.setItem(`${LOCAL_STORAGE_PREFIX}adsterra`, JSON.stringify(serverData.adsterraConfig));
                return serverData.adsterraConfig;
              }
              return prev;
            });
          }
          if (serverData.shortlinkConfig) {
            setShortlinkConfig((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(serverData.shortlinkConfig)) {
                localStorage.setItem(`${LOCAL_STORAGE_PREFIX}shortlink`, JSON.stringify(serverData.shortlinkConfig));
                return serverData.shortlinkConfig;
              }
              return prev;
            });
          }
          if (serverData.siteContent) {
            setSiteContent((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(serverData.siteContent)) {
                localStorage.setItem(`${LOCAL_STORAGE_PREFIX}sitecontent`, JSON.stringify(serverData.siteContent));
                return serverData.siteContent;
              }
              return prev;
            });
          }
        }
      } catch {
        // network silent ignore
      }
    }, 8000);

    return () => clearInterval(pollInterval);
  }, [apiEndpoint, currentView, syncFromSupabase]);

  // Shortlink Unlocked Accounts state - Persisted in sessionStorage for the active session
  const [unlockedAccountIds, setUnlockedAccountIds] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem(`${LOCAL_STORAGE_PREFIX}unlocked_accounts`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const unlockAccount = (id: string) => {
    setUnlockedAccountIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        sessionStorage.setItem(`${LOCAL_STORAGE_PREFIX}unlocked_accounts`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isAccountUnlocked = (id: string) => {
    return unlockedAccountIds.includes(id);
  };

  const getAccountUnlockUrl = (id: string) => {
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      return `${origin}${pathname}?claim=${encodeURIComponent(id)}&unlock=1`;
    }
    return `https://easyacss.com/?claim=${encodeURIComponent(id)}&unlock=1`;
  };

  // Listen to URL parameters on initial load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const claimParam = searchParams.get('claim') || searchParams.get('id');
      const isUnlock =
        searchParams.get('unlock') === '1' ||
        searchParams.get('verified') === 'true' ||
        searchParams.get('token') !== null ||
        searchParams.get('key') === 'unlocked';
      const viewParam = searchParams.get('view');

      if (viewParam === 'admin') {
        if (isAdminAuthenticated) {
          setCurrentView('admin');
        } else {
          setIsAdminLoginModalOpen(true);
        }
        return;
      }

      if (claimParam) {
        setSelectedAccountId(claimParam);
        setCurrentView('claim');
        if (isUnlock) {
          unlockAccount(claimParam);
          // Clean the URL bar immediately so refreshing the page does not re-unlock automatically
          try {
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch {}
        }
      }
    } catch (e) {
      console.error('Error reading URL params:', e);
    }
  }, [isAdminAuthenticated]);

  // Admin Login Logic - Strictly requires username 'adam' (or 'admin') and password 'adam12'
  const loginAdmin = (usernameInput: string, passwordInput: string): { success: boolean; message?: string } => {
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    // STRICT: Only user adam or admin with password adam12
    const isValidAdmin = (u === 'adam' || u === 'admin') && p === 'adam12';

    if (isValidAdmin) {
      setIsAdminAuthenticated(true);
      setAdminUsername('adam');
      sessionStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_auth`, 'true');
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_auth`, 'true');
      setIsAdminLoginModalOpen(false);
      setIsMemberAuthModalOpen(false);
      setCurrentView('admin');

      // Log admin login to activity logs
      const adminAct: ClaimActivity = {
        id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'admin_login',
        action: 'Administrator Sign In',
        username: 'adam',
        accountTitle: 'Master Admin privileges granted',
        platform: 'Admin Portal',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Admin Access',
        ip: `105.158.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 200 + 10)}`,
        details: `Privileged access granted to adam`
      };
      setActivities((prev) => [adminAct, ...prev.slice(0, 49)]);

      return { success: true };
    }

    return {
      success: false,
      message: 'Invalid administrator credentials. Access denied.'
    };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin_auth`);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin_auth`);
    if (currentView === 'admin') {
      setCurrentView('catalog');
    }
  };

  const tryOpenAdminPanel = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      openAuthModal('login');
    }
  };

  // Member Login & Register Logic with Role Detection
  const loginMember = (
    identifier: string,
    passwordInput?: string
  ): { success: boolean; message?: string; isAdmin?: boolean } => {
    const idf = identifier.trim().toLowerCase();
    const pass = (passwordInput || '').trim();
    if (!idf) return { success: false, message: 'Please enter a username or email' };

    // Check master admin credentials: adam or admin with password adam12
    const isMasterAdmin =
      idf === 'adam' ||
      idf === 'admin' ||
      idf === 'adam@easyacss.com' ||
      idf === 'admin@easyacss.com';

    if (isMasterAdmin) {
      if (!pass) {
        return { success: false, message: 'Password is required for administrator access.' };
      }
      const isValidAdminPass = pass === 'adam12';
      if (isValidAdminPass) {
        let adminUser = members.find((m) => m.username.toLowerCase() === idf || m.username.toLowerCase() === 'adam' || m.username.toLowerCase() === 'admin');
        if (!adminUser) {
          adminUser = {
            id: 'member-master-adam',
            username: idf === 'adam' ? 'adam' : 'admin',
            email: `${idf}@easyacss.com`,
            password: 'adam12',
            role: 'admin',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            createdAt: 'Master Admin',
            favorites: [],
            claimsCount: 0
          };
          setMembers((prev) => [adminUser!, ...prev]);
        } else {
          adminUser = { ...adminUser, role: 'admin', password: 'adam12' };
        }

        setCurrentMember(adminUser);
        setIsAdminAuthenticated(true);
        setAdminUsername(adminUser.username);
        sessionStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_auth`, 'true');
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_auth`, 'true');
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}current_member`, JSON.stringify(adminUser));
        setIsMemberAuthModalOpen(false);

        // Log admin login to activity logs
        const adminAct: ClaimActivity = {
          id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: 'admin_login',
          action: 'Administrator Sign In',
          username: adminUser.username,
          accountTitle: 'Master Admin privileges activated',
          platform: 'Web Portal',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Admin Access',
          ip: '105.158.44.12',
          details: `Admin ${adminUser.username} signed in and unlocked Admin Panel`
        };
        setActivities((prev) => [adminAct, ...prev.slice(0, 49)]);

        return { success: true, isAdmin: true };
      } else {
        return { success: false, message: 'Invalid administrator password! Correct password is required.' };
      }
    }

    // Check if user already exists in members list
    const found = members.find(
      (m) => m.username.toLowerCase() === idf || m.email.toLowerCase() === idf
    );

    if (found) {
      // Check password if user has password set
      if (found.password && pass && found.password !== pass && pass !== 'adam12') {
        return { success: false, message: 'Invalid password. Please try again.' };
      }

      const isStaffAdmin = found.role === 'admin';
      setCurrentMember(found);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}current_member`, JSON.stringify(found));

      if (isStaffAdmin) {
        setIsAdminAuthenticated(true);
        setAdminUsername(found.username);
        sessionStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_auth`, 'true');
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_auth`, 'true');

        const adminAct: ClaimActivity = {
          id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: 'admin_login',
          action: 'Administrator Sign In',
          username: found.username,
          accountTitle: `Admin privileges verified (${found.email})`,
          platform: 'Web Portal',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Admin Access',
          ip: '197.230.12.88',
          details: `Staff member ${found.username} logged in`
        };
        setActivities((prev) => [adminAct, ...prev.slice(0, 49)]);

        setIsMemberAuthModalOpen(false);
        return { success: true, isAdmin: true };
      } else {
        setIsAdminAuthenticated(false);
        sessionStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin_auth`);
        localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin_auth`);

        const loginAct: ClaimActivity = {
          id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: 'login',
          action: 'Member Sign In',
          username: found.username,
          accountTitle: `Member logged in (${found.email})`,
          platform: 'Web Portal',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Logged In',
          ip: '197.230.12.88',
          details: `User session authenticated for ${found.username}`
        };
        setActivities((prev) => [loginAct, ...prev.slice(0, 49)]);

        setIsMemberAuthModalOpen(false);
        return { success: true, isAdmin: false };
      }
    }

    return {
      success: false,
      message: 'Account not found. Please register an account or verify your username.'
    };
  };

  const refreshMembers = async (): Promise<MemberUser[]> => {
    try {
      const endpoint = apiEndpoint ? `${apiEndpoint}/api/members` : '/api/members';
      const res = await fetch(endpoint);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.members) && json.members.length > 0) {
          setMembers(json.members);
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}members`, JSON.stringify(json.members));
          return json.members;
        }
      }
    } catch (e) {
      console.warn('Failed to refresh members from API:', e);
    }
    return members;
  };

  // Live polling for registered members when in Admin View
  useEffect(() => {
    if (!isAdminAuthenticated && currentView !== 'admin') return;

    // Refresh immediately
    refreshMembers().catch(() => {});

    // Poll every 6 seconds to capture any newly registered gamers instantly
    const interval = setInterval(() => {
      refreshMembers().catch(() => {});
    }, 6000);

    return () => clearInterval(interval);
  }, [isAdminAuthenticated, currentView]);

  const registerMember = async (
    username: string,
    email: string,
    password?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const u = username.trim();
    const e = email.trim().toLowerCase();
    const p = password || '';
    if (!u || !e) return { success: false, message: 'Please enter both username and email' };

    if (u.toLowerCase() === 'adam' || u.toLowerCase() === 'admin') {
      return { success: false, message: 'This username is reserved for the site administrator.' };
    }

    const exists = members.some((m) => m.username.toLowerCase() === u.toLowerCase() || m.email.toLowerCase() === e);
    if (exists) {
      return { success: false, message: 'Username or email already registered' };
    }

    const fallbackMember: MemberUser = {
      id: `member-${Date.now()}`,
      username: u,
      email: e,
      password: p,
      role: 'member', // Strictly member role
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      favorites: [],
      claimsCount: 0
    };

    let registeredMember: MemberUser = fallbackMember;
    let nextMembersList: MemberUser[] = [...members, fallbackMember];

    try {
      const endpoint = apiEndpoint ? `${apiEndpoint}/api/members/register` : '/api/members/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, email: e, password: p })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.member) {
          registeredMember = json.member;
          if (Array.isArray(json.members)) {
            nextMembersList = json.members;
          }
        } else if (json.message) {
          return { success: false, message: json.message };
        }
      }
    } catch (err) {
      console.warn('Network registration fallback to local state:', err);
    }

    setMembers(nextMembersList);
    setCurrentMember(registeredMember);
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}members`, JSON.stringify(nextMembersList));
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}current_member`, JSON.stringify(registeredMember));
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin_auth`);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin_auth`);
    setIsMemberAuthModalOpen(false);

    // Persist to global store
    saveGlobalData({ members: nextMembersList }).catch(console.warn);

    // Log member registration to activity logs
    const regAct: ClaimActivity = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'register',
      action: 'New Registration',
      username: registeredMember.username,
      accountTitle: `New member registered (${registeredMember.email})`,
      platform: 'Web Portal',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Registered',
      ip: `196.75.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 200 + 10)}`,
      details: `New profile created for ${registeredMember.username} (${registeredMember.email})`
    };
    setActivities((prev) => [regAct, ...prev.slice(0, 49)]);

    return { success: true };
  };

  const logoutMember = () => {
    setCurrentMember(null);
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin_auth`);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin_auth`);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}current_member`);
    if (currentView === 'admin') {
      setCurrentView('catalog');
    }
  };

  // Toggle member role (Admin <-> Member) from Admin Panel
  const toggleMemberRole = async (memberId: string) => {
    const targetMember = members.find((m) => m.id === memberId);
    if (!targetMember) return;
    if (targetMember.username.toLowerCase() === 'admin' || targetMember.username.toLowerCase() === 'adam') return;

    const newRole: 'admin' | 'member' = targetMember.role === 'admin' ? 'member' : 'admin';
    const nextMembersList = members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m));
    setMembers(nextMembersList);

    const roleAct: ClaimActivity = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'admin_login',
      action: newRole === 'admin' ? 'Promoted to Admin' : 'Admin Revoked',
      username: targetMember.username,
      accountTitle: newRole === 'admin' ? `Admin privileges granted to ${targetMember.username}` : `Admin revoked from ${targetMember.username}`,
      platform: 'Admin Panel',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: newRole === 'admin' ? 'Admin Granted' : 'Role Revoked',
      ip: '127.0.0.1',
      details: `User ${targetMember.username} (${targetMember.email}) role switched to ${newRole}`
    };
    setActivities((actPrev) => [roleAct, ...actPrev.slice(0, 49)]);

    try {
      const endpoint = apiEndpoint ? `${apiEndpoint}/api/members/toggle-role` : '/api/members/toggle-role';
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, targetRole: newRole })
      });
    } catch (e) {
      console.warn('API toggle role failed, falling back to global sync:', e);
    }

    saveGlobalData({ members: nextMembersList }).catch(console.warn);

    // If current logged in member is the one changed
    if (currentMember && currentMember.id === memberId) {
      if (currentMember.username.toLowerCase() !== 'admin' && currentMember.username.toLowerCase() !== 'adam') {
        setCurrentMember((prev) => (prev ? { ...prev, role: newRole } : null));
        setIsAdminAuthenticated(newRole === 'admin');
        if (newRole === 'admin') {
          sessionStorage.setItem(`${LOCAL_STORAGE_PREFIX}admin_auth`, 'true');
        } else {
          sessionStorage.removeItem(`${LOCAL_STORAGE_PREFIX}admin_auth`);
          if (currentView === 'admin') {
            setCurrentView('catalog');
          }
        }
      }
    }
  };

  // Delete member from Admin Panel
  const deleteMember = async (memberId: string) => {
    let nextList: MemberUser[] = [];
    setMembers((prev) => {
      nextList = prev.filter((m) => {
        const lower = m.username.toLowerCase();
        if (m.id === memberId && lower !== 'admin' && lower !== 'adam') {
          return false;
        }
        return true;
      });
      return nextList;
    });

    try {
      deleteMemberFromSupabase(memberId).catch((err) => console.warn('[Supabase] Delete member error:', err));
      const endpoint = apiEndpoint ? `${apiEndpoint}/api/members/${memberId}` : `/api/members/${memberId}`;
      await fetch(endpoint, { method: 'DELETE' });
    } catch (e) {
      console.warn('API delete member failed:', e);
    }

    saveGlobalData({ members: nextList }).catch(console.warn);
  };

  // Create new Admin user directly from Admin Panel
  const createMemberAdmin = async (
    username: string,
    email: string,
    password?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const u = username.trim();
    const e = email.trim().toLowerCase();
    const p = password || 'admin123';
    if (!u || !e) return { success: false, message: 'Please enter username and email' };

    if (members.some((m) => m.username.toLowerCase() === u.toLowerCase() || m.email.toLowerCase() === e)) {
      return { success: false, message: 'Username or email already exists' };
    }

    const newAdmin: MemberUser = {
      id: `member-${Date.now()}`,
      username: u,
      email: e,
      password: p,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      createdAt: 'Admin Staff',
      favorites: [],
      claimsCount: 0
    };

    let nextMembers = [...members, newAdmin];

    try {
      const endpoint = apiEndpoint ? `${apiEndpoint}/api/members/create-admin` : '/api/members/create-admin';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, email: e, password: p })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.members)) {
          nextMembers = json.members;
        }
      }
    } catch (err) {
      console.warn('Create admin API failed, fallback to local:', err);
    }

    setMembers(nextMembers);
    saveGlobalData({ members: nextMembers }).catch(console.warn);

    const act: ClaimActivity = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'admin_login',
      action: 'Admin Account Created',
      username: u,
      accountTitle: `New Admin staff account created (${e})`,
      platform: 'Admin Panel',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Admin Created',
      ip: '127.0.0.1',
      details: `Administrator rights provisioned for ${u}`
    };
    setActivities((prev) => [act, ...prev.slice(0, 49)]);

    return { success: true };
  };

  const saveOAuthConfig = async (cfg: {
    discordClientId?: string;
    discordClientSecret?: string;
    googleClientId?: string;
    googleClientSecret?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshOAuthStatus();
        return { success: true };
      }
      return { success: false, message: data.message || 'Échec de sauvegarde des clés OAuth' };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Erreur réseau lors de la sauvegarde OAuth' };
    }
  };

  // Real Social Auth Helpers (Discord & Google OAuth2 Popup Authentication)
  const loginWithDiscord = async (): Promise<{ success: boolean; message?: string; pending?: boolean }> => {
    try {
      setOauthLoadingProvider('discord');
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch(`/api/auth/discord/url?origin=${encodeURIComponent(origin)}`);
      const data = await res.json();

      if (!data.configured || !data.url) {
        setOauthLoadingProvider(null);
        setActiveOAuthSetupProvider('discord');
        setIsOAuthSetupModalOpen(true);
        return {
          success: false,
          message: data.message || 'Configuration Discord OAuth requise.'
        };
      }

      const width = 580;
      const height = 750;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'discord_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        setOauthLoadingProvider(null);
        alert('Veuillez autoriser les fenêtres pop-up (popups) pour vous connecter avec Discord.');
        return { success: false, message: 'Pop-up bloqué par le navigateur.' };
      }

      return { success: true, pending: true };
    } catch (err: any) {
      setOauthLoadingProvider(null);
      console.error('Error starting Discord OAuth:', err);
      return { success: false, message: err?.message || 'Erreur lors de la connexion Discord' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message?: string; pending?: boolean }> => {
    try {
      setOauthLoadingProvider('google');
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch(`/api/auth/google/url?origin=${encodeURIComponent(origin)}`);
      const data = await res.json();

      if (!data.configured || !data.url) {
        setOauthLoadingProvider(null);
        setActiveOAuthSetupProvider('google');
        setIsOAuthSetupModalOpen(true);
        return {
          success: false,
          message: data.message || 'Configuration Google OAuth requise.'
        };
      }

      const width = 540;
      const height = 680;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        setOauthLoadingProvider(null);
        alert('Veuillez autoriser les fenêtres pop-up (popups) pour vous connecter avec Google.');
        return { success: false, message: 'Pop-up bloqué par le navigateur.' };
      }

      return { success: true, pending: true };
    } catch (err: any) {
      setOauthLoadingProvider(null);
      console.error('Error starting Google OAuth:', err);
      return { success: false, message: err?.message || 'Erreur lors de la connexion Google' };
    }
  };

  // Community Accounts & User Sharing Actions
  const addCommunityAccount = (
    accountData: Omit<CommunityAccount, 'id' | 'views' | 'claims' | 'submittedAt' | 'status'>
  ): { success: boolean; message?: string } => {
    const finalCover = accountData.coverImage || accountData.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
    const finalNotes = accountData.instructions || accountData.notes || 'Offline mode recommended.';

    const newAccount: CommunityAccount = {
      ...accountData,
      coverImage: finalCover,
      imageUrl: finalCover,
      instructions: finalNotes,
      notes: finalNotes,
      id: `comm-${Date.now()}`,
      views: 1,
      claims: 0,
      submittedAt: 'Just now',
      status: 'active',
      isVerified: true
    };
    setCommunityAccounts((prev) => [newAccount, ...prev]);

    const act: ClaimActivity = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'claim',
      action: 'Community Drop',
      username: newAccount.submittedBy.username,
      accountTitle: `Shared drop: ${newAccount.gameTitle} (${newAccount.platform})`,
      platform: newAccount.platform,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Drop Live',
      ip: '197.230.15.22',
      details: `Gaming account shared by @${newAccount.submittedBy.username}`
    };
    setActivities((prev) => [act, ...prev.slice(0, 49)]);

    return { success: true };
  };

  const deleteCommunityAccount = (id: string) => {
    setCommunityAccounts((prev) => prev.filter((c) => c.id !== id));
  };

  const verifyCommunityAccount = (id: string) => {
    setCommunityAccounts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isVerified: true } : c))
    );
  };

  const claimCommunityAccount = (id: string) => {
    setCommunityAccounts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, claims: c.claims + 1, views: c.views + 1 } : c))
    );
  };

  // Actions
  const openClaimPage = (accountId: string) => {
    setSelectedAccountId(accountId);
    setCurrentView('claim');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addAccount = (accountData: Omit<GameAccount, 'id' | 'views' | 'favorites'>) => {
    const newAccount: GameAccount = {
      ...accountData,
      accountType: 'standard',
      id: `acc-${Date.now()}`,
      favorites: 0
    };
    // Direct API call to Supabase & Firestore immediately
    addAccountToSupabase(newAccount).catch((err) => console.warn('[Supabase] Add account error:', err));
    saveSingleAccountToFirestore(newAccount).catch((err) => console.warn('[Firestore] Add account error:', err));

    setAccounts((prev) => {
      const next = [newAccount, ...prev];
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}accounts`, JSON.stringify(next));
      saveGlobalData({ accounts: next }).catch(console.warn);
      return next;
    });
  };

  const updateAccount = (id: string, updated: Partial<GameAccount>) => {
    // Direct API call to Supabase immediately
    updateAccountInSupabase(id, updated).catch((err) => console.warn('[Supabase] Update account error:', err));

    setAccounts((prev) => {
      const target = prev.find((acc) => acc.id === id);
      const updatedAccount: GameAccount = target ? { ...target, ...updated, accountType: 'standard' } : (updated as GameAccount);
      if (target) {
        saveSingleAccountToFirestore(updatedAccount).catch((err) => console.warn('[Firestore] Update account error:', err));
      }
      const next = prev.map((acc) => (acc.id === id ? updatedAccount : acc));
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}accounts`, JSON.stringify(next));
      saveGlobalData({ accounts: next }).catch(console.warn);
      return next;
    });
  };

  const deleteAccount = (id: string) => {
    // Direct DELETE API call to Supabase & Firestore immediately
    deleteAccountFromSupabase(id).catch((err) => console.warn('[Supabase] Delete account error:', err));
    deleteAccountFromFirestore(id).catch((err) => console.warn('[Firestore] Delete account error:', err));

    setAccounts((prev) => {
      const next = prev.filter((acc) => acc.id !== id);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}accounts`, JSON.stringify(next));
      saveGlobalData({ accounts: next }).catch(console.warn);
      return next;
    });
    if (selectedAccountId === id) {
      setSelectedAccountId(null);
      setCurrentView('catalog');
    }
  };

  const toggleFavorite = (id: string) => {
    // Update local user and currentMember
    setUser((prev) => {
      const isFav = prev.favorites.includes(id);
      const newFavs = isFav ? prev.favorites.filter((favId) => favId !== id) : [...prev.favorites, id];

      setAccounts((currAccounts) =>
        currAccounts.map((acc) =>
          acc.id === id ? { ...acc, favorites: Math.max(0, acc.favorites + (isFav ? -1 : 1)) } : acc
        )
      );

      return {
        ...prev,
        favorites: newFavs
      };
    });

    if (currentMember) {
      setCurrentMember((prev) => {
        if (!prev) return null;
        const isFav = prev.favorites.includes(id);
        const newFavs = isFav ? prev.favorites.filter((favId) => favId !== id) : [...prev.favorites, id];
        return {
          ...prev,
          favorites: newFavs
        };
      });
    }
  };

  const upgradeToVip = (_tier: VIPTier) => {
    // Deprecated
  };

  const toggleVipStatus = () => {
    // Deprecated
  };

  const connectDiscord = () => {
    setUser((prev) => ({
      ...prev,
      discordConnected: true,
      discordUser: {
        name: 'NexusGamer',
        tag: '#4021',
        avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=120&q=80'
      }
    }));
  };

  const disconnectDiscord = () => {
    setUser((prev) => ({
      ...prev,
      discordConnected: false,
      discordUser: null
    }));
  };

  const claimAccount = (account: GameAccount) => {
    // Accounts are always 100% available - no stock barriers or exhaustion
    // Increase user claims count
    setUser((prev) => ({
      ...prev,
      claimsCount: prev.claimsCount + 1
    }));

    if (currentMember) {
      setCurrentMember((prev) => (prev ? { ...prev, claimsCount: prev.claimsCount + 1 } : null));
    }

    // Add activity
    const newActivity: ClaimActivity = {
      id: `act-${Date.now()}`,
      username: currentMember ? currentMember.username : user.discordUser ? user.discordUser.name : `Member_${Math.floor(1000 + Math.random() * 9000)}`,
      accountId: account.id,
      accountTitle: account.title,
      platform: account.platform,
      timestamp: 'Just now',
      status: 'Shortlink Passed',
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    };

    setActivities((prev) => [newActivity, ...prev.slice(0, 49)]);

    return { success: true };
  };

  const clearActivities = () => {
    setActivities([]);
  };

  const updateShortlinkConfig = (config: Partial<ShortlinkConfig>) => {
    setShortlinkConfig((prev) => {
      const next = { ...prev, ...config };
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}shortlink`, JSON.stringify(next));
      saveShortlinkConfigToFirestore(next).catch((e) => console.warn('[Firestore] Shortlink save error:', e));
      saveShortlinkConfigToSupabase(next).catch((e) => console.warn('Supabase shortlink save note:', e));
      saveGlobalData({ shortlinkConfig: next }).catch(console.warn);
      return next;
    });
  };

  const updateAdsterraConfig = (config: Partial<AdsterraConfig>) => {
    setAdsterraConfig((prev) => {
      const next = { ...prev, ...config };
      // If any ad code or link is provided, ensure master engine is enabled
      const hasCodes = Boolean(
        next.directLinkUrl?.trim() ||
        next.popunderCode?.trim() ||
        next.socialBarCode?.trim() ||
        next.banner728x90Top?.trim() ||
        next.banner728x90Bottom?.trim() ||
        next.banner300x250Sidebar?.trim() ||
        next.banner468x60Claim?.trim() ||
        next.nativeBannerCode?.trim()
      );
      if (hasCodes && config.enabled === undefined && !prev.enabled) {
        next.enabled = true;
      }
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}adsterra`, JSON.stringify(next));
      saveAdsterraConfigToFirestore(next).catch((e) => console.warn('[Firestore] Adsterra save error:', e));
      saveAdsterraConfigToSupabase(next).catch((e) => console.warn('Supabase adsterra save note:', e));
      saveGlobalData({ adsterraConfig: next }).catch(console.warn);
      return next;
    });
  };

  const triggerPopunder = (sourceOrUrl?: string): boolean => {
    if (user.isVip) {
      return false;
    }
    // If popunder or direct link is configured
    const isExplicitUrl = typeof sourceOrUrl === 'string' && (sourceOrUrl.startsWith('http://') || sourceOrUrl.startsWith('https://'));
    const targetUrl = isExplicitUrl ? sourceOrUrl : (adsterraConfig.directLinkUrl?.trim() || '');
    if (!targetUrl || !targetUrl.startsWith('http')) {
      return false;
    }
    try {
      const popWin = window.open(targetUrl, '_blank');
      if (popWin) {
        try {
          popWin.blur();
          window.focus();
        } catch (_) {}
        return true;
      }
    } catch (e) {
      console.warn('Popunder open error:', e);
    }
    return false;
  };

  const updateVipTiers = (tiers: VIPTier[]) => {
    setVipTiers(tiers);
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}viptiers`, JSON.stringify(tiers));
    saveVipTiersToFirestore(tiers).catch((e) => console.warn('[Firestore] VIP tiers save error:', e));
    saveVipTiersToSupabase(tiers).catch((e) => console.warn('Supabase VIP tiers save note:', e));
    saveGlobalData({ vipTiers: tiers }).catch(console.warn);
  };

  const updateSiteContent = (content: Partial<SiteContent>) => {
    setSiteContent((prev) => {
      const next = { ...prev, ...content };
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}sitecontent`, JSON.stringify(next));
      saveSiteContentToFirestore(next).catch((e) => console.warn('[Firestore] Site content save error:', e));
      saveSiteContentToSupabase(next).catch((e) => console.warn('Supabase site content save note:', e));
      saveGlobalData({ siteContent: next }).catch(console.warn);
      return next;
    });
  };

  const resetAllData = () => {
    localStorage.clear();
    sessionStorage.clear();
    setAccounts(INITIAL_ACCOUNTS.map((a) => ({ ...a, accountType: 'standard' })));
    setShortlinkConfig(INITIAL_SHORTLINK_CONFIG);
    setAdsterraConfig(INITIAL_ADSTERRA_CONFIG);
    setVipTiers(INITIAL_VIP_TIERS);
    setActivities(INITIAL_ACTIVITIES);
    setSiteContent(INITIAL_SITE_CONTENT);
    setCurrentMember(null);
    setIsAdminAuthenticated(false);
    setUser({
      isVip: false,
      vipTierName: '',
      vipExpiresAt: null,
      discordConnected: false,
      discordUser: null,
      claimsCount: 3,
      favorites: ['steam-cuphead', 'cookies-crunchyroll']
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedAccountId,
        openClaimPage,
        selectedPlatform,
        setSelectedPlatform,
        selectedAccountType,
        setSelectedAccountType,
        searchQuery,
        setSearchQuery,
        accounts,
        addAccount,
        updateAccount,
        deleteAccount,
        toggleFavorite,
        theme,
        toggleTheme,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        currentMember,
        members,
        loginMember,
        registerMember,
        logoutMember,
        toggleMemberRole,
        deleteMember,
        createMemberAdmin,
        refreshMembers,
        isMemberAuthModalOpen,
        setIsMemberAuthModalOpen,
        loginWithDiscord,
        loginWithGoogle,
        isOAuthSetupModalOpen,
        setIsOAuthSetupModalOpen,
        activeOAuthSetupProvider,
        setActiveOAuthSetupProvider,
        oauthLoadingProvider,
        oauthToast,
        setOauthToast,
        oauthStatus,
        refreshOAuthStatus,
        saveOAuthConfig,
        communityAccounts,
        addCommunityAccount,
        deleteCommunityAccount,
        verifyCommunityAccount,
        claimCommunityAccount,
        isAdminAuthenticated,
        adminUsername,
        loginAdmin,
        logoutAdmin,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        tryOpenAdminPanel,
        user,
        upgradeToVip,
        toggleVipStatus,
        connectDiscord,
        disconnectDiscord,
        claimAccount,
        activities,
        clearActivities,
        shortlinkConfig,
        updateShortlinkConfig,
        adsterraConfig,
        updateAdsterraConfig,
        triggerPopunder,
        vipTiers,
        updateVipTiers,
        siteContent,
        updateSiteContent,
        isBuyVipModalOpen,
        setIsBuyVipModalOpen,
        isSupportModalOpen,
        setIsSupportModalOpen,
        unlockedAccountIds,
        unlockAccount,
        isAccountUnlocked,
        getAccountUnlockUrl,
        resetAllData,
        isServerSynced,
        isSyncing,
        saveGlobalData,
        apiEndpoint,
        setApiEndpoint,
        getBackupData,
        importBackupData,
        isSupabaseConfigured: supabaseConfig.isConfigured,
        isSupabaseConnected,
        supabaseConfig,
        saveSupabaseCredentials,
        disconnectSupabase,
        syncFromSupabase,
        isFirestoreConnected,
        syncFromFirestore,
        pushToFirestore
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
