import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GameAccount, Platform, AccountType } from '../types';
import { EditAccountModal } from './EditAccountModal';
import { AddAccountModal } from './AddAccountModal';
import {
  LayoutDashboard,
  Gamepad2,
  Megaphone,
  FileEdit,
  Users,
  Clock,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  ExternalLink,
  Shield,
  Search,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Save,
  RotateCcw,
  Key,
  Link2,
  Copy,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  MessageSquare,
  Lock,
  LogIn,
  LogOut,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Camera,
  Upload,
  UploadCloud,
  Globe,
  Download,
  ArrowDownToLine,
  Database,
  Server,
  CheckCircle2,
  Code
} from 'lucide-react';
import { processImageFile } from './ImageUploadInput';
import { EasyAcssLogo } from './EasyAcssLogo';
import { AdFrame } from './AdBannerSlot';
import { SUPABASE_SQL_SCHEMA } from '../data/supabaseSql';
import { saveAllToSupabase, testSupabaseConnection } from '../lib/supabase';
import { GameSpecsModal } from './GameSpecsModal';
import { Monitor } from 'lucide-react';

type AdminTab =
  | 'dashboard'
  | 'games'
  | 'community'
  | 'ads'
  | 'content'
  | 'users'
  | 'activity'
  | 'domains'
  | 'supabase'
  | 'oauth';

export const AdminPanel: React.FC = () => {
  const {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    communityAccounts,
    deleteCommunityAccount,
    verifyCommunityAccount,
    shortlinkConfig,
    updateShortlinkConfig,
    adsterraConfig,
    updateAdsterraConfig,
    triggerPopunder,
    siteContent,
    updateSiteContent,
    activities,
    clearActivities,
    user,
    resetAllData,
    setCurrentView,
    getAccountUnlockUrl,
    isAdminAuthenticated,
    adminUsername,
    currentMember,
    loginAdmin,
    loginMember,
    logoutAdmin,
    members,
    toggleMemberRole,
    deleteMember,
    createMemberAdmin,
    refreshMembers,
    isServerSynced,
    isSyncing,
    saveGlobalData,
    apiEndpoint,
    setApiEndpoint,
    getBackupData,
    importBackupData,
    isSupabaseConfigured,
    isSupabaseConnected,
    supabaseConfig,
    saveSupabaseCredentials,
    disconnectSupabase,
    syncFromSupabase,
    isFirestoreConnected,
    syncFromFirestore,
    pushToFirestore,
    oauthStatus,
    refreshOAuthStatus,
    saveOAuthConfig,
    setIsOAuthSetupModalOpen,
    setActiveOAuthSetupProvider
  } = useApp();

  // Admin and tab state
  const [activeTab, setActiveTab] = useState<AdminTab>('games');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'register' | 'login' | 'claim'>('all');

  // OAuth dedicated tab states
  const [oauthForm, setOauthForm] = useState({
    discordClientId: '',
    discordClientSecret: '',
    googleClientId: '',
    googleClientSecret: ''
  });
  const [oauthSaveLoading, setOauthSaveLoading] = useState(false);
  const [oauthSaveMsg, setOauthSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDiscordSecret, setShowDiscordSecret] = useState(false);
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState<string | null>(null);

  // Fetch current oauth config on tab focus or switch
  useEffect(() => {
    if (activeTab === 'oauth') {
      fetch('/api/auth/config')
        .then((res) => res.json())
        .then((data) => {
          if (data.config) {
            setOauthForm((prev) => ({
              ...prev,
              discordClientId: data.config.discordClientId || '',
              discordClientSecret: data.config.discordClientSecret || '',
              googleClientId: data.config.googleClientId || '',
              googleClientSecret: data.config.googleClientSecret || ''
            }));
          }
        })
        .catch(console.warn);
    }
  }, [activeTab]);

  // Admin login credentials state for unauthenticated view
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminErr, setAdminErr] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Supabase Dedicated Cloud Tab States
  const [sbUrlInput, setSbUrlInput] = useState(supabaseConfig.url || '');
  const [sbKeyInput, setSbKeyInput] = useState(supabaseConfig.anonKey || '');
  const [sbTesting, setSbTesting] = useState(false);
  const [sbStatusMsg, setSbStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isPushingSb, setIsPushingSb] = useState(false);
  const [isPullingSb, setIsPullingSb] = useState(false);
  const [revealAnonKey, setRevealAnonKey] = useState(false);
  const [adsSaveFeedback, setAdsSaveFeedback] = useState<string | null>(null);

  // Firestore Sync States
  const [isPushingFs, setIsPushingFs] = useState(false);
  const [isPullingFs, setIsPullingFs] = useState(false);
  const [fsStatusMsg, setFsStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Domain & Backup Sync States
  const [remoteEndpointInput, setRemoteEndpointInput] = useState(apiEndpoint);
  const [backupMsg, setBackupMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedBackupString, setCopiedBackupString] = useState(false);
  const [pastedBackupInput, setPastedBackupInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const backupFileInputRef = React.useRef<HTMLInputElement>(null);

  // Member Management & Admin Role States
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member'>('all');
  const [isRefreshingMembers, setIsRefreshingMembers] = useState(false);
  const [memberActionNotice, setMemberActionNotice] = useState<{ type: 'success' | 'info'; text: string } | null>(null);
  const [revealedMemberPasswords, setRevealedMemberPasswords] = useState<Record<string, boolean>>({});
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newAdminMsg, setNewAdminMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-refresh members whenever the users tab is opened
  useEffect(() => {
    if (activeTab === 'users') {
      setIsRefreshingMembers(true);
      refreshMembers()
        .catch(() => {})
        .finally(() => {
          setTimeout(() => setIsRefreshingMembers(false), 400);
        });
    }
  }, [activeTab]);

  // Modals state
  const [editingAccount, setEditingAccount] = useState<GameAccount | null>(null);
  const [specsAccount, setSpecsAccount] = useState<GameAccount | null>(null);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);

  // Global Shortlink drawer toggle inside Manage Games
  const [showGlobalLinkGateway, setShowGlobalLinkGateway] = useState(false);
  const [shortlinkForm, setShortlinkForm] = useState(shortlinkConfig);
  const [shortlinkSaved, setShortlinkSaved] = useState(false);

  // Quick inline password reveal tracker
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Adsterra form state
  const [adsForm, setAdsForm] = useState(adsterraConfig);
  const [adsSaved, setAdsSaved] = useState(false);
  const [previewSlot, setPreviewSlot] = useState<string | null>(null);

  React.useEffect(() => {
    setAdsForm(adsterraConfig);
  }, [adsterraConfig]);

  React.useEffect(() => {
    setShortlinkForm(shortlinkConfig);
  }, [shortlinkConfig]);

  // Site content form state
  const [contentForm, setContentForm] = useState(siteContent);
  const [contentSaved, setContentSaved] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  React.useEffect(() => {
    setContentForm(siteContent);
  }, [siteContent]);

  // Admin Access Protection Gate
  const isCurrentAdmin = Boolean(
    isAdminAuthenticated ||
    currentMember?.role === 'admin' ||
    currentMember?.username?.toLowerCase() === 'adam' ||
    currentMember?.username?.toLowerCase() === 'admin'
  );

  if (!isCurrentAdmin) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 bg-[#08090d] relative overflow-hidden">
        {/* Subtle ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md p-7 sm:p-8 rounded-2xl bg-[#0e1017]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-purple-950/40 relative z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <EasyAcssLogo size="md" badgeText="ADMIN VAULT" />
            <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-mono font-semibold">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Restricted Security Clearance</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Sign in with your administrator account to manage games, credentials, and monetized links.
            </p>
          </div>

          {adminErr && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{adminErr}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAdminErr(null);
              setAdminLoading(true);
              setTimeout(() => {
                const res = loginAdmin(adminUser, adminPass);
                setAdminLoading(false);
                if (!res.success) {
                  setAdminErr(res.message || 'Access denied. Invalid administrator credentials.');
                }
              }, 400);
            }}
            className="space-y-4 font-mono text-xs"
          >
            <div>
              <label className="block uppercase tracking-wider text-slate-400 mb-1.5 text-[10px] font-bold">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="adam"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141722] border border-white/[0.08] focus:border-purple-500 text-white text-sm outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-slate-400 mb-1.5 text-[10px] font-bold">
                Master Password
              </label>
              <input
                type="password"
                required
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141722] border border-white/[0.08] focus:border-purple-500 text-white text-sm outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={adminLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-gaming text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-purple-600/30 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {adminLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate & Enter Admin Vault</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 text-xs text-center transition-colors font-mono cursor-pointer"
            >
              ← Back to Home
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Stats calculations
  const totalGames = accounts.reduce((acc, curr) => acc + curr.gameCount, 0);
  const totalAccounts = accounts.length;
  const availableStock = accounts.reduce((acc, curr) => acc + curr.stock, 0);
  const totalClaims = 3420 + activities.length;
  const totalLinkClicks = Math.round(totalClaims * 1.84);
  const totalMembersCount = members.length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const togglePasswordReveal = (accId: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [accId]: !prev[accId] }));
  };

  const regenerateGuardCode = (account: GameAccount) => {
    const chars = '23456789BCDFGHJKMNPQRTVWXYZ';
    let newCode = '';
    for (let i = 0; i < 5; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updateAccount(account.id, {
      credentials: {
        ...account.credentials,
        guardCode: newCode
      }
    });
  };

  const handleSaveShortlink = (e: React.FormEvent) => {
    e.preventDefault();
    updateShortlinkConfig(shortlinkForm);
    setShortlinkSaved(true);
    setTimeout(() => setShortlinkSaved(false), 2500);
  };

  const handleSaveAds = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasAnyCode = Boolean(
      adsForm.directLinkUrl?.trim() ||
      adsForm.popunderCode?.trim() ||
      adsForm.socialBarCode?.trim() ||
      adsForm.banner728x90Top?.trim() ||
      adsForm.banner728x90Bottom?.trim() ||
      adsForm.banner300x250Sidebar?.trim() ||
      adsForm.banner468x60Claim?.trim() ||
      adsForm.nativeBannerCode?.trim()
    );
    const updated = {
      ...adsForm,
      enabled: hasAnyCode ? true : adsForm.enabled,
      popunderEnabled: adsForm.popunderCode?.trim() ? true : adsForm.popunderEnabled,
      socialBarEnabled: adsForm.socialBarCode?.trim() ? true : adsForm.socialBarEnabled,
    };
    setAdsForm(updated);
    updateAdsterraConfig(updated);
    setAdsSaved(true);
    setAdsSaveFeedback(
      isSupabaseConnected
        ? 'Ad scripts saved to Supabase cloud and cache! Changes are now live for all visitors across all browsers.'
        : 'Ad scripts saved locally! To make them live across the internet, you can connect Supabase in the "Cloud Database" tab.'
    );
    setTimeout(() => {
      setAdsSaved(false);
      setAdsSaveFeedback(null);
    }, 4500);
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteContent(contentForm);
    setContentSaved(true);
    setTimeout(() => setContentSaved(false), 2500);
  };

  const handleAddAccount = (newAcc: Omit<GameAccount, 'id' | 'views' | 'favorites'>) => {
    addAccount(newAcc);
  };

  const handleUpdateAccountFull = (updated: Partial<GameAccount>) => {
    if (editingAccount) {
      updateAccount(editingAccount.id, updated);
      setEditingAccount(null);
    }
  };

  // Platform counts
  const platformCounts = {
    all: accounts.length,
    Steam: accounts.filter((a) => a.platform.toLowerCase() === 'steam').length,
    Xbox: accounts.filter((a) => a.platform.toLowerCase() === 'xbox').length,
    Cookies: accounts.filter((a) => a.platform.toLowerCase() === 'cookies').length,
    Others: accounts.filter((a) => !['steam', 'xbox', 'cookies'].includes(a.platform.toLowerCase())).length
  };

  // Filter accounts for Manage Games
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.credentials.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.linkConfig?.customShortlinkUrl &&
        account.linkConfig.customShortlinkUrl.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPlatform =
      selectedPlatform === 'all' ||
      account.platform.toLowerCase() === selectedPlatform.toLowerCase();

    const matchesType =
      selectedType === 'all' || account.accountType === selectedType;

    return matchesSearch && matchesPlatform && matchesType;
  });

  interface AdminNavTabItem {
    id: AdminTab;
    label: string;
    badge?: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  const adminNavTabs: AdminNavTabItem[] = [
    { id: 'games', label: 'Manage Games', badge: `${accounts.length}`, icon: Gamepad2 },
    { id: 'community', label: 'Community Drops', badge: `${communityAccounts.length}`, icon: Users },
    { id: 'oauth', label: 'OAuth (Discord / Google)', badge: (oauthStatus.discord && oauthStatus.google) ? 'Live' : (oauthStatus.discord || oauthStatus.google ? 'Partial' : 'Setup'), icon: Key },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'supabase', label: 'Supabase Cloud', badge: isSupabaseConnected ? 'Live' : 'Connect', icon: Database },
    { id: 'domains', label: 'Domain & Backup Sync', badge: 'Live', icon: Globe },
    { id: 'users', label: 'Registered Members', badge: `${members.length}`, icon: Users },
    { id: 'ads', label: 'Ad Management', icon: Megaphone },
    { id: 'content', label: 'Site Content', icon: FileEdit },
    { id: 'activity', label: 'Activity Log', icon: Clock }
  ];

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#08090d] text-slate-200 flex flex-col">
      {/* Sleek Top Admin Navigation Header */}
      <header className="sticky top-0 z-30 w-full bg-[#0d1017]/95 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <EasyAcssLogo size="sm" badgeText="ADMIN VAULT" />

          {/* Sync & Health Status Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/[0.08]">
            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium ${
                isSyncing
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : isServerSynced
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : isServerSynced ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{isSyncing ? 'Writing changes...' : isServerSynced ? 'Live Server Connected' : 'Local Only'}</span>
              <button
                type="button"
                onClick={async () => {
                  const ok = await saveGlobalData();
                  if (ok) {
                    setPublishSuccess(true);
                    setTimeout(() => setPublishSuccess(false), 3500);
                  }
                }}
                disabled={isSyncing}
                title="Force push changes to live server"
                className="ml-1 p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-purple-400' : ''}`} />
              </button>
            </div>

            {/* Firestore Cloud Connection Status */}
            <button
              type="button"
              onClick={() => setActiveTab('supabase')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                isFirestoreConnected
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
              }`}
              title="Google Firestore Cloud Status"
            >
              <Database className="w-3 h-3 text-amber-400" />
              <span>{isFirestoreConnected ? 'Firestore: Live' : 'Firestore: Connecting'}</span>
            </button>

            {/* Supabase Cloud Connection Status */}
            <button
              type="button"
              onClick={() => setActiveTab('supabase')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                isSupabaseConnected
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:bg-slate-700/60'
              }`}
              title="Supabase Database Status"
            >
              <Database className="w-3 h-3" />
              <span>{isSupabaseConnected ? 'Supabase: Active' : 'Supabase: Ready'}</span>
            </button>

            <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                🎮 <strong className="text-white">{accounts.length}</strong> Games
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                👥 <strong className="text-white">{members.length}</strong> Gamers
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Publish Live Button */}
          <button
            type="button"
            onClick={async () => {
              const ok = await saveGlobalData();
              if (ok) {
                setPublishSuccess(true);
                setTimeout(() => setPublishSuccess(false), 4500);
              }
            }}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-gaming text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            title="Publish all games, shortlinks and settings so all visitors can see them immediately"
          >
            <UploadCloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Publishing...' : 'Publish Live'}</span>
          </button>

          {/* Quick Add Game Button */}
          <button
            type="button"
            onClick={() => setIsNewAccountModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white font-gaming text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Game</span>
          </button>

          {/* Return to Website / Storefront */}
          <button
            type="button"
            onClick={() => setCurrentView('home')}
            className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-gaming font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="Return to Main Website / Storefront"
          >
            <ExternalLink className="w-3.5 h-3.5 text-purple-300" />
            <span>Storefront</span>
          </button>

          {/* Administrator Profile & Quick Logout */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/[0.08]">
            <div
              className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xs shadow-sm font-gaming"
              title={`Logged in as ${adminUsername}`}
            >
              {adminUsername.charAt(0).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={logoutAdmin}
              title="Logout from Admin Vault"
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Notification Banner when Published */}
      {publishSuccess && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Changes saved and published live! Any visitor opening your site will now see your updates immediately.</span>
        </div>
      )}

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Mobile Horizontal Tabs Bar (Easy access on phones) */}
        <div className="lg:hidden w-full bg-[#0c0e15] border-b border-white/[0.08] px-3 py-2 overflow-x-auto flex items-center gap-2 scrollbar-none">
          {adminNavTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                    : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.05]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-black/40 text-purple-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex w-64 bg-[#0c0e15] border-r border-white/[0.08] p-4 shrink-0 flex-col justify-between">
          <div className="space-y-6">
            <div className="px-3 py-2.5 rounded-2xl bg-[#121520] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-gaming font-extrabold text-white text-xs shadow-md shadow-purple-600/30">
                  {adminUsername.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-xs text-white font-gaming">Administrator</div>
                  <div className="text-[10px] text-purple-300 font-mono flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    <span>{adminUsername}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={logoutAdmin}
                title="Log Out Admin"
                className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Exit</span>
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1.5">
              {adminNavTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as AdminTab)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-600/25 border border-purple-400/30'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                        isActive
                          ? 'bg-black/40 text-purple-200'
                          : 'bg-purple-950/40 text-purple-300 border border-purple-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Quick Config & Reset */}
          <div className="pt-4 border-t border-white/[0.06] space-y-3">
            <div className="p-3 rounded-xl bg-[#121520] border border-white/[0.06]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Shortlink Gate</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    shortlinkConfig.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {shortlinkConfig.enabled ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateShortlinkConfig({ enabled: !shortlinkConfig.enabled })}
                className="mt-2 w-full py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-slate-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                {shortlinkConfig.enabled ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-emerald-400" /> Switch OFF
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-slate-400" /> Switch ON
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={resetAllData}
              className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo DB</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* ==================================================================== */}
        {/* TAB: MANAGE GAMES (UNIFIED: GAMES, CREDENTIALS & LINK CONFIG) */}
        {/* ==================================================================== */}
        {activeTab === 'games' && (
          <div className="space-y-6">
            {/* Top Header & Action Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold font-gaming text-white tracking-wide">
                    Manage Games, Credentials & Link Config
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    All-in-One
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Central command for catalog listings, login credentials & 2FA keys, and monetized shortlinks.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setShowGlobalLinkGateway(!showGlobalLinkGateway)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all border ${
                    showGlobalLinkGateway
                      ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-md shadow-purple-900/20'
                      : 'bg-[#12151e] border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Global Shortlink Gateway</span>
                  {showGlobalLinkGateway ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={() => setIsNewAccountModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-gaming text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Game & Account
                </button>
              </div>
            </div>

            {/* Top Quick Stats Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3.5 rounded-xl bg-[#12151e] border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Games</span>
                <span className="text-xl font-bold font-gaming text-white mt-0.5 block">
                  {accounts.length}
                </span>
                <span className="text-[10px] text-purple-400">Listed in catalog</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#12151e] border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Vault Status</span>
                <span className="text-xl font-bold font-gaming text-emerald-400 mt-0.5 block">
                  100% Online
                </span>
                <span className="text-[10px] text-emerald-400/80">Available</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#12151e] border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Registered Members</span>
                <span className="text-xl font-bold font-gaming text-purple-400 mt-0.5 block">
                  {totalMembersCount}
                </span>
                <span className="text-[10px] text-slate-500">Active community accounts</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#12151e] border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Shortlink Gate</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      shortlinkConfig.enabled ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-sm font-bold font-gaming text-white">
                    {shortlinkConfig.enabled ? shortlinkConfig.provider.toUpperCase() : 'DISABLED'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">{shortlinkConfig.timerSeconds}s wait timer</span>
              </div>
            </div>

            {/* COLLAPSIBLE GLOBAL SHORTLINK GATEWAY CONFIG DRAWER */}
            {showGlobalLinkGateway && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#12151e] to-[#0c0e15] border border-purple-500/40 shadow-2xl animate-in fade-in space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="text-sm font-bold font-gaming text-white">
                        Global Shortlink Gateway Settings
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        These settings govern all accounts by default unless overridden per game below.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShortlinkForm((p) => ({ ...p, enabled: !p.enabled }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                      shortlinkForm.enabled
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {shortlinkForm.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    <span>{shortlinkForm.enabled ? 'GATE ON' : 'GATE OFF'}</span>
                  </button>
                </div>

                <form onSubmit={handleSaveShortlink} className="space-y-4 font-mono text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1">Monetization Provider</label>
                      <select
                        value={shortlinkForm.provider}
                        onChange={(e) => {
                          const prov = e.target.value as any;
                          setShortlinkForm((p) => ({
                            ...p,
                            provider: prov,
                            domain: prov === 'cutly' ? 'https://cutt.ly' : prov === 'gplinks' ? 'https://gplinks.co' : prov === 'shrinkme' ? 'https://shrinkme.io' : prov === 'droplink' ? 'https://droplink.co' : p.domain
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                      >
                        <option value="cutly">Cutt.ly (Default)</option>
                        <option value="gplinks">GPLinks.co (High CPM)</option>
                        <option value="shrinkme">ShrinkMe.io</option>
                        <option value="droplink">DropLink.co</option>
                        <option value="custom">Custom Domain</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Base Shortlink Gateway Domain</label>
                      <input
                        type="text"
                        value={shortlinkForm.domain}
                        onChange={(e) => setShortlinkForm((p) => ({ ...p, domain: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Shortlink API Token</label>
                      <input
                        type="password"
                        value={shortlinkForm.apiToken}
                        onChange={(e) => setShortlinkForm((p) => ({ ...p, apiToken: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Countdown Wait Timer:</span>
                        <span className="text-purple-400 font-bold">{shortlinkForm.timerSeconds} seconds</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="30"
                        value={shortlinkForm.timerSeconds}
                        onChange={(e) => setShortlinkForm((p) => ({ ...p, timerSeconds: parseInt(e.target.value) || 8 }))}
                        className="w-full accent-purple-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-3 md:pt-0">
                      <input
                        type="checkbox"
                        id="bypassVipGlobal"
                        checked={shortlinkForm.bypassForVip}
                        onChange={(e) => setShortlinkForm((p) => ({ ...p, bypassForVip: e.target.checked }))}
                        className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="bypassVipGlobal" className="text-slate-300 cursor-pointer">
                        Auto-bypass shortlinks for VIP users & VIP tier accounts
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-gaming text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
                    >
                      {shortlinkSaved ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" /> Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Save Global Gateway Settings
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filter and Search Controls Bar */}
            <div className="p-4 rounded-2xl bg-[#0e1017] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
              {/* Search input with clear button */}
              <div className="relative w-full md:w-84">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search title, platform, username, link..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#141722] border border-white/[0.08] text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Pills with real counts */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto font-mono text-xs">
                <span className="text-slate-500 text-[11px] font-bold mr-1">Platform:</span>
                {[
                  { id: 'all', label: 'All', count: platformCounts.all },
                  { id: 'Steam', label: 'Steam', count: platformCounts.Steam },
                  { id: 'Xbox', label: 'Xbox', count: platformCounts.Xbox },
                  { id: 'Cookies', label: 'Cookies', count: platformCounts.Cookies },
                  { id: 'Others', label: 'Others', count: platformCounts.Others }
                ].map((p) => {
                  const isSelected = selectedPlatform.toLowerCase() === p.id.toLowerCase();
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`px-3 py-1.5 rounded-xl transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/30'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                      }`}
                    >
                      <span>{p.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {p.count}
                      </span>
                    </button>
                  );
                })}

                <span className="text-slate-500 text-[11px] font-bold ml-2 mr-1">Type:</span>
                {['all', 'standard', 'vip'].map((t) => {
                  const isSelected = selectedType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`px-2.5 py-1.5 rounded-xl transition-all text-xs uppercase cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* UNIFIED ACCOUNTS LIST / CARDS */}
            <div className="space-y-4">
              {filteredAccounts.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#12151e] border border-slate-800 text-slate-400 font-mono">
                  <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No matching accounts found</p>
                  <p className="text-xs text-slate-500 mt-1">Try modifying your search or platform filter.</p>
                </div>
              ) : (
                filteredAccounts.map((account) => {
                  const isPasswordRevealed = revealedPasswords[account.id] || false;
                  const isShortlinkBypassed = account.linkConfig?.enabled === false;
                  const effectiveLinkUrl =
                    account.linkConfig?.customShortlinkUrl ||
                    `${shortlinkConfig.domain}/claim?acc=${account.id}`;

                  return (
                    <div
                      key={account.id}
                      className="rounded-2xl bg-[#12151e] border border-slate-800 hover:border-purple-500/40 transition-all shadow-xl overflow-hidden"
                    >
                      {/* Top Bar: Game Info & Quick Actions */}
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#141824] to-[#0e111a] border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative group shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-slate-700 shadow-md">
                            <img
                              src={account.coverImage}
                              alt={account.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <label
                              htmlFor={`quick-img-upload-${account.id}`}
                              className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                              title="Upload new image / Bddel taswira"
                            >
                              <Camera className="w-4 h-4 text-purple-400" />
                              <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">Edit</span>
                            </label>
                            <input
                              id={`quick-img-upload-${account.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  try {
                                    const dataUrl = await processImageFile(e.target.files[0]);
                                    updateAccount(account.id, { coverImage: dataUrl });
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-600/30 text-purple-300 border border-purple-500/40">
                                {account.platform}
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                                  account.accountType === 'vip'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {account.accountType}
                              </span>

                              <span className="text-[10px] font-mono text-slate-500">
                                ID: {account.id}
                              </span>
                            </div>

                            <h3
                              onClick={() => setSpecsAccount(account)}
                              className="text-base font-bold text-white font-sans truncate hover:text-[#67c1f5] cursor-pointer transition-colors flex items-center gap-1.5"
                              title="Click to view & configure game system requirements"
                            >
                              <span>{account.title}</span>
                              <Monitor className="w-3.5 h-3.5 text-[#67c1f5] opacity-60 hover:opacity-100 shrink-0" />
                            </h3>

                            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                100% Free Access
                              </span>
                              <span>•</span>
                              <span className="text-slate-400 truncate max-w-[240px]">
                                {account.platform.toUpperCase()} Vault
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Main Actions */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-center font-mono">
                          {/* Available Status Pill */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Available</span>
                          </div>

                          {/* Steam PC Config Button (Direct Access) */}
                          <button
                            type="button"
                            onClick={() => setSpecsAccount(account)}
                            className="px-3 py-2 rounded-xl bg-[#172535] hover:bg-[#1f3247] border border-[#2a475e] text-[#67c1f5] hover:text-white font-gaming text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                            title="Steam PC Requirements & System Config"
                          >
                            <Monitor className="w-3.5 h-3.5 text-[#67c1f5]" />
                            <span>PC Config</span>
                            {account.systemRequirements?.trim() ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Config active" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Not configured" />
                            )}
                          </button>

                          {/* Full Edit Modal Trigger */}
                          <button
                            onClick={() => setEditingAccount(account)}
                            className="px-3 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-gaming text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit All</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${account.title}"?`)) {
                                deleteAccount(account.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors cursor-pointer"
                            title="Delete Game Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Integrated 2-Column Grid: Credentials Vault + Link Config */}
                      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
                        {/* ======================================================== */}
                        {/* FACET 1: CREDENTIALS VAULT (DIRECT INLINE EDITABLE) */}
                        {/* ======================================================== */}
                        <div className="p-4 rounded-xl bg-[#0c0e15] border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                            <span className="font-bold text-slate-200 flex items-center gap-1.5">
                              <Key className="w-3.5 h-3.5 text-blue-400" />
                              <span>Account Credentials</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              DIRECT EDITING ACTIVE
                            </span>
                          </div>

                          {/* Username / Login Email (Direct In-Line Edit) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                                <span>User / Email:</span>
                                <span className="text-[9px] text-purple-400 font-normal">(Instant Edit)</span>
                              </label>
                              <button
                                onClick={() => handleCopy(account.credentials.username, `u-${account.id}`)}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                title="Copy Username"
                              >
                                {copiedField === `u-${account.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <input
                              type="text"
                              value={account.credentials.username}
                              onChange={(e) =>
                                updateAccount(account.id, {
                                  credentials: {
                                    ...account.credentials,
                                    username: e.target.value
                                  }
                                })
                              }
                              placeholder="steam_account_username"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#151824] border border-slate-700 focus:border-purple-500 text-slate-100 text-xs font-mono focus:outline-none transition-colors"
                            />
                          </div>

                          {/* Password (Direct In-Line Edit) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                                <span>Password:</span>
                                <span className="text-[9px] text-purple-400 font-normal">(Instant Edit)</span>
                              </label>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => togglePasswordReveal(account.id)}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                  title={isPasswordRevealed ? 'Hide Password' : 'Show Password'}
                                >
                                  {isPasswordRevealed ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleCopy(account.credentials.passwordHash, `p-${account.id}`)}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                  title="Copy Password"
                                >
                                  {copiedField === `p-${account.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <input
                              type={isPasswordRevealed ? 'text' : 'password'}
                              value={account.credentials.passwordHash}
                              onChange={(e) =>
                                updateAccount(account.id, {
                                  credentials: {
                                    ...account.credentials,
                                    passwordHash: e.target.value
                                  }
                                })
                              }
                              placeholder="Account password"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#151824] border border-slate-700 focus:border-purple-500 text-slate-100 text-xs font-mono focus:outline-none transition-colors"
                            />
                          </div>

                          {/* Cookie session data if Cookies */}
                          {account.credentials.cookieData && (
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                              <span className="text-amber-300 font-semibold">Cookie JSON:</span>{' '}
                              <span className="truncate inline-block max-w-[220px] align-bottom text-slate-500">
                                {account.credentials.cookieData.slice(0, 35)}...
                              </span>
                            </div>
                          )}
                        </div>

                        {/* ======================================================== */}
                        {/* FACET 2: CUTT.LY SHORTLINK & SECRET UNLOCK LINK CONFIG */}
                        {/* ======================================================== */}
                        <div className="p-4 rounded-xl bg-[#0c0e15] border border-emerald-500/30 space-y-3 relative overflow-hidden">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                            <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                              <Link2 className="w-4 h-4 text-emerald-400" />
                              <span>Cutt.ly Monetization Setup (Shortlink Gate)</span>
                            </span>

                            {/* Shortlink Switch for this specific account */}
                            <button
                              onClick={() => {
                                const currentEnabled = account.linkConfig?.enabled ?? true;
                                updateAccount(account.id, {
                                  linkConfig: {
                                    ...account.linkConfig,
                                    enabled: !currentEnabled
                                  }
                                });
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1 transition-all ${
                                !isShortlinkBypassed
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {!isShortlinkBypassed ? (
                                <>
                                  <ToggleRight className="w-3.5 h-3.5 text-emerald-400" /> GATE ACTIVE (MUST PASS CUTT.LY)
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-3.5 h-3.5 text-slate-400" /> BYPASS (DIRECT ACCESS)
                                </>
                              )}
                            </button>
                          </div>

                          {/* STEP 1: SECRET UNLOCK LINK (Rabit ta3 User & Password) */}
                          <div className="p-2.5 rounded-lg bg-[#151824] border border-purple-500/40 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5 font-gaming">
                                <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                                <span>Rabit ta3 User & Password (Secret Unlock Link)</span>
                              </span>
                              <span className="text-[9px] text-purple-400 font-mono">Paste this in Cutt.ly</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              Nsakh had l-lien o 7etto f Cutt.ly bach y-khtasro (Copy and paste this destination link into Cutt.ly):
                            </p>
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 px-2 py-1 rounded bg-[#0a0c10] border border-purple-500/30 text-purple-200 text-[10px] font-mono truncate select-all">
                                {getAccountUnlockUrl(account.id)}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(getAccountUnlockUrl(account.id), `target-${account.id}`)}
                                className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold font-gaming flex items-center gap-1 transition-all shrink-0"
                                title="Copy Secret Unlock URL"
                              >
                                {copiedField === `target-${account.id}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-300" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" /> Nsakh Rabit
                                  </>
                                )}
                              </button>
                              <a
                                href="https://cutt.ly"
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold font-gaming flex items-center gap-1 transition-all shrink-0"
                                title="Open Cutt.ly in new tab"
                              >
                                <ExternalLink className="w-3 h-3" /> Fte7 Cutt.ly
                              </a>
                            </div>
                          </div>

                          {/* STEP 2: CUTT.LY SHORTENED LINK (Rabit Mokhtasar) */}
                          <div className="p-2.5 rounded-lg bg-[#151824] border border-emerald-500/40 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 font-gaming">
                                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                                <span>Rabit Mokhtasar mn Cutt.ly (Shortlink for 'Get Account')</span>
                              </span>
                              <div className="flex items-center gap-1">
                                {account.linkConfig?.customShortlinkUrl && (
                                  <a
                                    href={account.linkConfig.customShortlinkUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" /> Test Link
                                  </a>
                                )}
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              Mli t-khtaser l-lien f Cutt.ly, jibo o 7etto hna (Paste your shortened Cutt.ly link here):
                            </p>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={account.linkConfig?.customShortlinkUrl ?? ''}
                                onChange={(e) =>
                                  updateAccount(account.id, {
                                    linkConfig: {
                                      ...account.linkConfig,
                                      customShortlinkUrl: e.target.value
                                    }
                                  })
                                }
                                placeholder="https://cutt.ly/your-game-key"
                                className="flex-1 px-2.5 py-1 rounded-lg bg-[#0a0c10] border border-emerald-500/30 focus:border-emerald-400 text-emerald-300 text-xs font-mono focus:outline-none transition-colors"
                              />
                              {account.linkConfig?.customShortlinkUrl && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(account.linkConfig?.customShortlinkUrl || '', `cuttly-${account.id}`)}
                                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                  title="Copy Cutt.ly link"
                                >
                                  {copiedField === `cuttly-${account.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Explanatory Workflow Help */}
                          <div className="text-[10px] text-slate-400 bg-[#0a0c10] p-2 rounded border border-slate-800/80 leading-relaxed font-mono">
                            <span className="text-amber-400 font-bold">💡 Tari9at l-3amal:</span> L-user mli y-cliki 3la <span className="text-purple-300 font-semibold">'Get Account'</span>, ghadi y-mchi l had Cutt.ly link. Mli y-khtaser rabit, Cutt.ly ghadi y-reddo l Rabit ta3 Khatwa 1, o ghadi y-ban lih l-User & Password unlocked!
                          </div>
                        </div>
                      </div>

                      {/* ======================================================== */}
                      {/* FACET 3: STEAM SYSTEM REQUIREMENTS & PC CONFIG BAR */}
                      {/* ======================================================== */}
                      <div className="px-4 py-3 bg-[#0d131c] border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#172535] border border-[#2a475e] flex items-center justify-center shrink-0">
                            <Monitor className="w-4 h-4 text-[#67c1f5]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white font-gaming text-xs">
                                Steam PC System Requirements:
                              </span>
                              {account.systemRequirements?.trim() ? (
                                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> CONFIG ACTIVE
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  NOT CONFIGURED
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#8f98a0] font-sans truncate max-w-md">
                              {account.systemRequirements?.trim()
                                ? account.systemRequirements.slice(0, 75) + '...'
                                : 'Ila bghiti t-zid les config dial l-game (MINIMUM & RECOMMENDED), clicki 3la had l-button.'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSpecsAccount(account)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#172535] hover:bg-[#20344b] border border-[#2a475e] text-[#67c1f5] hover:text-white font-gaming text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                        >
                          <Monitor className="w-3.5 h-3.5 text-[#67c1f5]" />
                          <span>{account.systemRequirements?.trim() ? 'Edit Steam Specs' : 'Configure Steam Specs'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB: DASHBOARD (TELEMETRY & OVERVIEW) */}
        {/* ==================================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold font-gaming text-white tracking-wide">
                  Platform Telemetry & Dashboard
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Real-time monetization, stock analytics, and claims monitoring.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsNewAccountModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-gaming text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add New Account
                </button>
              </div>
            </div>

            {/* Analytics Stats Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
              <div className="p-4 rounded-2xl bg-[#12151e] border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Total Games</span>
                  <Gamepad2 className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-extrabold font-gaming text-white mt-2">
                  {totalGames}
                </div>
                <div className="text-[10px] text-purple-400 mt-1">Across all platforms</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#12151e] border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Total Accounts</span>
                  <Key className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-extrabold font-gaming text-white mt-2">
                  {totalAccounts}
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">100% Verified status</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#12151e] border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Available Stock</span>
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold font-gaming text-emerald-400 mt-2">
                  {availableStock}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Auto-restocked 6h</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#12151e] border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Total Claims</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-extrabold font-gaming text-white mt-2">
                  {totalClaims.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">+14% vs yesterday</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#12151e] border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Link Clicks</span>
                  <Link2 className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-extrabold font-gaming text-white mt-2">
                  {totalLinkClicks.toLocaleString()}
                </div>
                <div className="text-[10px] text-indigo-400 mt-1">Adsterra CPM active</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#12151e] border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Registered Members</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-extrabold font-gaming text-purple-400 mt-2">
                  {totalMembersCount}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Community gamers</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#12151e] border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Account Model</span>
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold font-gaming text-white mt-2">
                  Standard
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">100% Free with Shortlink</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#12151e] border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Shortlink Gate</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      shortlinkConfig.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                </div>
                <div className="text-xl font-extrabold font-gaming text-white mt-2 flex items-center justify-between">
                  <span>{shortlinkConfig.enabled ? 'ACTIVE' : 'OFF'}</span>
                  <button
                    onClick={() => updateShortlinkConfig({ enabled: !shortlinkConfig.enabled })}
                    className="text-xs text-purple-400 hover:text-purple-300 font-mono underline"
                  >
                    Toggle
                  </button>
                </div>
                <div className="text-[10px] font-mono text-purple-400 mt-1">
                  Provider: {shortlinkConfig.provider}
                </div>
              </div>
            </div>

            {/* Quick action button to go manage games */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#141824] to-[#12151e] border border-purple-500/30 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-gaming text-white">
                  Manage Games, Credentials & Link Config
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  View and update game catalogs, 2FA credentials, and monetization links in one unified screen.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('games')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-gaming text-xs font-bold transition-all shadow-md shadow-purple-600/30"
              >
                Go to Manage Games
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB: ADSTERRA AD MANAGEMENT */}
        {/* ==================================================================== */}
        {activeTab === 'ads' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="text-2xl font-bold font-gaming text-white">Adsterra Ads & Monetization</h1>
              <p className="text-xs text-slate-400 font-mono">
                Manage CPM banner codes, popunder settings, and placement positions.
              </p>
            </div>

            {/* Adsterra Guidance Banner */}
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-purple-300 font-gaming">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Adsterra Ad Setup & Placement Guide</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300 font-sans">
                1. <strong>Direct Link / SmartLink:</strong> Copy your Direct Link URL from Adsterra (starts with <code>https://...</code>) and paste it into Slot 1.
                <br />
                2. <strong>Popunder:</strong> Copy your Popunder script snippet and paste it into Slot 2 (activates across Catalog and Claim pages).
                <br />
                3. <strong>Banners (728x90, 300x250, 468x60):</strong> Copy the HTML/Script snippet containing <code>atOptions</code> or <code>&lt;iframe&gt;</code> and paste it into its respective slot. You can click <strong>"Test Preview"</strong> to verify it renders before saving!
                <br />
                4. <strong>Native Banner (Slot 8):</strong> Copy the Native Banner snippet from Adsterra and paste it into Slot 8. It displays on the <strong>Home page</strong> and inside the game catalog grid.
                <br />
                5. Once you click <strong>"Save Changes"</strong>, the ad engine instantly activates across the entire site and syncs to cloud storage!
              </p>
            </div>

            {/* Supabase Cloud Live Status for Ads */}
            {isSupabaseConnected ? (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-emerald-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div>
                    <strong className="text-white">Supabase Cloud Database Connected:</strong>
                    <p className="text-[11px] text-emerald-400/80 font-sans mt-0.5">
                      All popunders, banner snippets, and shortlink setups save directly to Supabase and load live for all visitors worldwide in real time.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('supabase')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                >
                  View Database
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-amber-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <div>
                    <strong className="text-white">Supabase Not Linked:</strong>
                    <p className="text-[11px] text-amber-300/80 font-sans mt-0.5">
                      Ad codes are currently saving to local browser storage only. Connect your free Supabase database to broadcast ads globally to all visitors on Vercel or custom domains.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('supabase')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Connect Supabase
                </button>
              </div>
            )}

            {adsSaveFeedback && (
              <div className="p-3.5 rounded-xl bg-purple-900/40 border border-purple-500/40 text-xs text-purple-200 font-mono animate-in fade-in">
                {adsSaveFeedback}
              </div>
            )}

            <form
              onSubmit={handleSaveAds}
              className="p-6 rounded-2xl bg-[#12151e] border border-slate-800 space-y-6 font-mono"
            >
              {/* Master Engine Toggle */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white font-gaming">Master Adsterra Engine</h4>
                  <p className="text-xs text-slate-400">Activer ou désactiver toutes les publicités et popunders du site</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAdsForm((p) => ({ ...p, enabled: !p.enabled }))}
                  className={`p-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                    adsForm.enabled
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {adsForm.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  <span>{adsForm.enabled ? 'ADS ENGINE ACTIVE' : 'ADS PAUSED'}</span>
                </button>
              </div>

              {/* Anti-AdBlock Detection Shield Setting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0c0e15] border border-purple-500/30">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white font-gaming">Anti-AdBlock Detection Shield</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">
                      Visitor Barrier
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Forces visitors using AdBlock, uBlock Origin, or Brave Shields to pause their ad blocker before accessing the site.
                    <span className="text-emerald-400 font-medium ml-1">Admins are automatically exempted and never blocked.</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAdsForm((p) => ({ ...p, antiAdblockEnabled: p.antiAdblockEnabled === false ? true : false }))}
                  className={`p-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                    adsForm.antiAdblockEnabled !== false
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {adsForm.antiAdblockEnabled !== false ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  <span>{adsForm.antiAdblockEnabled !== false ? 'ANTI-ADBLOCK ACTIVE' : 'DISABLED'}</span>
                </button>
              </div>

              {/* Direct Link / SmartLink URL */}
              <div className="p-4 rounded-xl bg-[#0c0e15] border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 font-gaming uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    1. Direct Link / SmartLink URL (Lien Direct Adsterra)
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    HIGH CPM
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Lien direct fourni par Adsterra (ex: <code>https://www.profitablecpmrate.com/d0b98e8e7c0d12e</code>). Utilisé pour les popunders et redirections de secours.
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://www.profitablecpmrate.com/your-code-here"
                    value={adsForm.directLinkUrl || ''}
                    onChange={(e) => setAdsForm((p) => ({ ...p, directLinkUrl: e.target.value }))}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[#141824] border border-slate-700 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (adsForm.directLinkUrl) {
                        window.open(adsForm.directLinkUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-bold flex items-center gap-1 border border-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Test
                  </button>
                </div>
              </div>

              {/* Publisher / Zone ID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Adsterra Publisher / Account ID (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="ex: pub_1048291"
                  value={adsForm.publisherId || ''}
                  onChange={(e) => setAdsForm((p) => ({ ...p, publisherId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Slot 2: Popunder Code */}
              <div className="p-4 rounded-xl bg-[#0c0e15] border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-purple-300 font-gaming uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      2. Code Popunder Script (Adsterra Popunder)
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Collez le code de votre script Popunder Adsterra (`&lt;script src="..."&gt;` ou URL directe).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdsForm((p) => ({ ...p, popunderEnabled: !p.popunderEnabled }))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono ${
                      adsForm.popunderEnabled
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {adsForm.popunderEnabled ? 'POPUNDER ON' : 'POPUNDER OFF'}
                  </button>
                </div>

                <textarea
                  rows={3}
                  placeholder={`<script type="text/javascript" src="//pl19842.profitablecpmrate.com/xx/yy/zz.js"></script>`}
                  value={adsForm.popunderCode || ''}
                  onChange={(e) => setAdsForm((p) => ({ ...p, popunderCode: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-purple-200 font-mono focus:border-purple-500 focus:outline-none"
                />

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="popunderFirstClick"
                      checked={adsForm.popunderOnFirstClick ?? false}
                      onChange={(e) => setAdsForm((p) => ({ ...p, popunderOnFirstClick: e.target.checked }))}
                      className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-slate-300">
                      Déclencher Popunder au 1er clic (Optionnel: ouvre le Direct Link ou Popunder au premier clic)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="popunderClaim"
                      checked={adsForm.triggerPopunderOnClaim ?? false}
                      onChange={(e) => setAdsForm((p) => ({ ...p, triggerPopunderOnClaim: e.target.checked }))}
                      className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-slate-300">
                      Déclencher Popunder au clic sur "Claim Account" (Optionnel)
                    </span>
                  </label>
                </div>
              </div>

              {/* Slot 3: Social Bar Code */}
              <div className="p-4 rounded-xl bg-[#0c0e15] border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-indigo-300 font-gaming uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      3. Code Social Bar (Notification Flottante)
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Collez le code Social Bar Adsterra (`&lt;script src="..."&gt;`). Si vide, la notification interactive gaming intégrée reste active.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdsForm((p) => ({ ...p, socialBarEnabled: !p.socialBarEnabled }))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono ${
                      adsForm.socialBarEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {adsForm.socialBarEnabled ? 'SOCIAL BAR ON' : 'SOCIAL BAR OFF'}
                  </button>
                </div>

                <textarea
                  rows={3}
                  placeholder={`<script type="text/javascript" src="//pl2025.profitablecpmrate.com/socialbar.js"></script>`}
                  value={adsForm.socialBarCode || ''}
                  onChange={(e) => setAdsForm((p) => ({ ...p, socialBarCode: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-indigo-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Slot 4: Banner 728x90 Top */}
              <div className="p-4 rounded-xl bg-[#0c0e15] border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-300 font-gaming uppercase tracking-wider flex items-center gap-1.5">
                    4. Bannière Leaderboard 728x90 (En Haut de page)
                  </label>
                  <div className="flex items-center gap-2">
                    {adsForm.banner728x90Top?.trim() && (
                      <button
                        type="button"
                        onClick={() => setPreviewSlot(previewSlot === 'top728' ? null : 'top728')}
                        className="text-[10px] px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-bold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        {previewSlot === 'top728' ? 'Masquer' : 'Tester Aperçu'}
                      </button>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      adsForm.banner728x90Top?.trim() ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {adsForm.banner728x90Top?.trim() ? 'CODE DÉTECTÉ' : 'PAR DÉFAUT'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Affichée au sommet du catalogue. Collez le code script `atOptions` ou `&lt;iframe&gt;` ou script invoke Adsterra.
                </p>
                <textarea
                  rows={3}
                  placeholder={`<script type="text/javascript">\n\tatOptions = {\n\t\t'key' : '...', 'format' : 'iframe', 'height' : 90, 'width' : 728\n\t};\n</script>\n<script type="text/javascript" src="//www.topcreativeformat.com/.../invoke.js"></script>`}
                  value={adsForm.banner728x90Top || ''}
                  onChange={(e) => setAdsForm((p) => ({ ...p, banner728x90Top: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-blue-200 font-mono focus:border-blue-500 focus:outline-none"
                />
                {previewSlot === 'top728' && adsForm.banner728x90Top?.trim() && (
                  <div className="pt-2">
                    <p className="text-[10px] text-emerald-400 font-bold mb-1">Aperçu direct en temps réel :</p>
                    <AdFrame code={adsForm.banner728x90Top} type="728x90" position="top-test" />
                  </div>
                )}
              </div>

              {/* Slot 5: Banner 728x90 Bottom */}
              <div className="p-4 rounded-xl bg-[#0c0e15] border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-300 font-gaming uppercase tracking-wider flex items-center gap-1.5">
                    5. Bannière Leaderboard 728x90 (En Bas de page avant Footer)
                  </label>
                  <div className="flex items-center gap-2">
                    {adsForm.banner728x90Bottom?.trim() && (
                      <button
                        type="button"
                        onClick={() => setPreviewSlot(previewSlot === 'bot728' ? null : 'bot728')}
                        className="text-[10px] px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-bold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        {previewSlot === 'bot728' ? 'Masquer' : 'Tester Aperçu'}
                      </button>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      adsForm.banner728x90Bottom?.trim() ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {adsForm.banner728x90Bottom?.trim() ? 'CODE DÉTECTÉ' : 'PAR DÉFAUT'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Affichée en bas de page pour monétiser les visiteurs qui défilent jusqu'au pied de page.
                </p>
                <textarea
                  rows={3}
                  placeholder={`<script type="text/javascript">\n\tatOptions = {\n\t\t'key' : '...', 'format' : 'iframe', 'height' : 90, 'width' : 728\n\t};\n</script>\n<script type="text/javascript" src="//www.topcreativeformat.com/.../invoke.js"></script>`}
                  value={adsForm.banner728x90Bottom || ''}
                  onChange={(e) => setAdsForm((p) => ({ ...p, banner728x90Bottom: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-blue-200 font-mono focus:border-blue-500 focus:outline-none"
                />
                {previewSlot === 'bot728' && adsForm.banner728x90Bottom?.trim() && (
                  <div className="pt-2">
                    <p className="text-[10px] text-emerald-400 font-bold mb-1">Aperçu direct en temps réel :</p>
                    <AdFrame code={adsForm.banner728x90Bottom} type="728x90" position="bottom-test" />
                  </div>
                )}
              </div>

              {/* Slot 6: Banner 300x250 Sidebar & Modals */}
              <div className="p-4 rounded-xl bg-[#0c0e15] border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-cyan-300 font-gaming uppercase tracking-wider flex items-center gap-1.5">
                    6. Bannière Carrée 300x250 (Sidebar & Modales)
                  </label>
                  <div className="flex items-center gap-2">
                    {adsForm.banner300x250Sidebar?.trim() && (
                      <button
                        type="button"
                        onClick={() => setPreviewSlot(previewSlot === 'side300' ? null : 'side300')}
                        className="text-[10px] px-2 py-0.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 font-bold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        {previewSlot === 'side300' ? 'Masquer' : 'Tester Aperçu'}
                      </button>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      adsForm.banner300x250Sidebar?.trim() ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {adsForm.banner300x250Sidebar?.trim() ? 'CODE DÉTECTÉ' : 'PAR DÉFAUT'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Format carré / rectangle 300x250, idéal pour les barres latérales et fenêtres d'accès.
                </p>
                <textarea
                  rows={3}
                  placeholder={`<script type="text/javascript">\n\tatOptions = {\n\t\t'key' : '...', 'format' : 'iframe', 'height' : 250, 'width' : 300\n\t};\n</script>\n<script type="text/javascript" src="//www.topcreativeformat.com/.../invoke.js"></script>`}
                  value={adsForm.banner300x250Sidebar || ''}
                  onChange={(e) => setAdsForm((p) => ({ ...p, banner300x250Sidebar: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-cyan-200 font-mono focus:border-cyan-500 focus:outline-none"
                />
                {previewSlot === 'side300' && adsForm.banner300x250Sidebar?.trim() && (
                  <div className="pt-2">
                    <p className="text-[10px] text-emerald-400 font-bold mb-1">Aperçu direct en temps réel :</p>
                    <AdFrame code={adsForm.banner300x250Sidebar} type="300x250" position="sidebar-test" />
                  </div>
                )}
              </div>

              {/* Slot 7: Banner 468x60 / 320x50 (Sous le bouton Claim) */}
              <div className="p-4 rounded-xl bg-[#0c0e15] border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-300 font-gaming uppercase tracking-wider flex items-center gap-1.5">
                    7. Bannière 468x60 / 320x50 (Page Claim & Modale Shortlink)
                  </label>
                  <div className="flex items-center gap-2">
                    {adsForm.banner468x60Claim?.trim() && (
                      <button
                        type="button"
                        onClick={() => setPreviewSlot(previewSlot === 'claim468' ? null : 'claim468')}
                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-bold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        {previewSlot === 'claim468' ? 'Masquer' : 'Tester Aperçu'}
                      </button>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      adsForm.banner468x60Claim?.trim() ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {adsForm.banner468x60Claim?.trim() ? 'CODE DÉTECTÉ' : 'PAR DÉFAUT'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Emplacement stratégique à très haute conversion, situé juste au-dessus du bouton "Obtenir le compte / Khtaser Rabit".
                </p>
                <textarea
                  rows={3}
                  placeholder={`<script type="text/javascript">\n\tatOptions = {\n\t\t'key' : '...', 'format' : 'iframe', 'height' : 60, 'width' : 468\n\t};\n</script>\n<script type="text/javascript" src="//www.topcreativeformat.com/.../invoke.js"></script>`}
                  value={adsForm.banner468x60Claim || ''}
                  onChange={(e) => setAdsForm((p) => ({ ...p, banner468x60Claim: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-emerald-200 font-mono focus:border-emerald-500 focus:outline-none"
                />
                {previewSlot === 'claim468' && adsForm.banner468x60Claim?.trim() && (
                  <div className="pt-2">
                    <p className="text-[10px] text-emerald-400 font-bold mb-1">Aperçu direct en temps réel :</p>
                    <AdFrame code={adsForm.banner468x60Claim} type="468x60" position="claim-test" />
                  </div>
                )}
              </div>

              {/* Slot 8: Native Banner (Home Page & In-Feed Grid) */}
              <div className="p-4 rounded-xl bg-[#0c0e15] border border-pink-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-pink-300 font-gaming uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        8. Bannière Native Banner (Home Page & Catalogue In-Feed)
                      </h5>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        adsForm.nativeBannerCode?.trim()
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {adsForm.nativeBannerCode?.trim() ? 'CODE ACTIF' : 'CODE VIDE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      <strong>Emplacement Native Banner :</strong> S'affiche sur la Page d'Accueil (à la place de la section Featured Free Accounts) ainsi que dans la grille du catalogue.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {adsForm.nativeBannerCode?.trim() && (
                      <button
                        type="button"
                        onClick={() => setPreviewSlot(previewSlot === 'nativeCard' ? null : 'nativeCard')}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-pink-600/30 hover:bg-pink-600/50 text-pink-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        {previewSlot === 'nativeCard' ? 'Masquer' : 'Tester Aperçu'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setAdsForm((p) => ({ ...p, inFeedAdsEnabled: !p.inFeedAdsEnabled }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                        adsForm.inFeedAdsEnabled ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {adsForm.inFeedAdsEnabled ? 'NATIVE ACTIVE' : 'NATIVE OFF'}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  placeholder={`<script type="text/javascript" src="//www.topcreativeformat.com/.../invoke.js"></script>\nou code script Adsterra Native Banner...`}
                  value={adsForm.nativeBannerCode || ''}
                  onChange={(e) => setAdsForm((p) => ({ ...p, nativeBannerCode: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-slate-700 text-xs text-pink-200 font-mono focus:border-pink-500 focus:outline-none"
                />
                {previewSlot === 'nativeCard' && adsForm.nativeBannerCode?.trim() && (
                  <div className="pt-2">
                    <p className="text-[10px] text-emerald-400 font-bold mb-1">Aperçu direct en temps réel :</p>
                    <AdFrame code={adsForm.nativeBannerCode} type="native-banner" position="native-home-test" />
                  </div>
                )}
              </div>

              {/* Submit Save Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-gaming text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-xl shadow-purple-600/30 active:scale-95"
              >
                {adsSaved ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-300" /> TOUS LES CODES ET PARAMÈTRES ADSTERRA SONT ENREGISTRÉS !
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> ENREGISTRER TOUS LES CODES ADSTERRA
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB: COMMUNITY SHARED DROPS */}
        {/* ==================================================================== */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-gaming text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-400" />
                  <span>Community Shared Drops</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {communityAccounts.length}
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Manage accounts submitted by logged-in community members (Discord/Google authenticated). Automated text & anti-+18 safe-cover filtering is active.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentView('community')}
                className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-gaming font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Community Page</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#12151e] border border-slate-800 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-mono text-slate-400 uppercase">Total Drops</p>
                  <p className="text-xl font-bold text-white font-gaming">{communityAccounts.length}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#12151e] border border-slate-800 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-mono text-slate-400 uppercase">Verified Safe</p>
                  <p className="text-xl font-bold text-emerald-400 font-gaming">
                    {communityAccounts.filter(a => a.isVerified).length}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#12151e] border border-slate-800 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-mono text-slate-400 uppercase">Total Claims</p>
                  <p className="text-xl font-bold text-cyan-400 font-gaming">
                    {communityAccounts.reduce((sum, a) => sum + (a.claims || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Community Drops Table */}
            {communityAccounts.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#12151e] border border-slate-800 text-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No community drops yet</h3>
                <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto mb-4">
                  When members share their gaming accounts from the Community page, they will appear here for admin moderation.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#12151e] border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0c0e15] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Game & Cover</th>
                        <th className="py-3.5 px-4">Platform</th>
                        <th className="py-3.5 px-4">Submitted By</th>
                        <th className="py-3.5 px-4">Credentials</th>
                        <th className="py-3.5 px-4">Claims & Views</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {communityAccounts.map((acc) => (
                        <tr key={acc.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Game */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={acc.coverImage}
                                alt={acc.gameTitle}
                                className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-white text-xs">{acc.gameTitle}</p>
                                <p className="text-[10px] text-slate-400 line-clamp-1">{acc.notes || 'No notes'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Platform */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 border border-slate-700 font-bold text-slate-200">
                              {acc.platform}
                            </span>
                          </td>

                          {/* Submitted By */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {acc.submittedBy.avatar ? (
                                <img
                                  src={acc.submittedBy.avatar}
                                  alt={acc.submittedBy.username}
                                  className="w-6 h-6 rounded-full border border-purple-500/40"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-purple-900/60 flex items-center justify-center text-[10px] text-purple-300 font-bold">
                                  {acc.submittedBy.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-200 text-[11px]">{acc.submittedBy.username}</p>
                                <p className="text-[9px] text-slate-500">{acc.submittedBy.authProvider || 'Member'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Credentials */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <p className="text-[10px]">
                                <span className="text-slate-500">User:</span>{' '}
                                <span className="text-white font-mono bg-black/40 px-1.5 py-0.5 rounded select-all">
                                  {acc.username}
                                </span>
                              </p>
                              <p className="text-[10px]">
                                <span className="text-slate-500">Pass:</span>{' '}
                                <span className="text-emerald-400 font-mono bg-black/40 px-1.5 py-0.5 rounded select-all">
                                  {acc.password}
                                </span>
                              </p>
                            </div>
                          </td>

                          {/* Stats */}
                          <td className="py-3 px-4">
                            <div className="text-[10px] text-slate-400 space-y-0.5">
                              <p>{acc.claims || 0} claims</p>
                              <p>{acc.views || 0} views</p>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            {acc.isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Community
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => verifyCommunityAccount(acc.id)}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  acc.isVerified
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-emerald-300 hover:border-emerald-500/30'
                                }`}
                                title={acc.isVerified ? 'Unverify drop' : 'Mark drop as verified'}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete community drop for "${acc.gameTitle}"?`)) {
                                    deleteCommunityAccount(acc.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                                title="Remove community drop"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB: SITE CONTENT */}
        {/* ==================================================================== */}
        {activeTab === 'content' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="text-2xl font-bold font-gaming text-white">Storefront Content & URLs</h1>
              <p className="text-xs text-slate-400 font-mono">
                Update store headers, discord community links, and support contact URLs.
              </p>
            </div>

            <form
              onSubmit={handleSaveContent}
              className="p-6 rounded-2xl bg-[#12151e] border border-slate-800 space-y-4 font-mono"
            >
              <div>
                <label className="block text-xs text-slate-300 mb-1">Catalog Headline</label>
                <input
                  type="text"
                  value={contentForm.heroTitle}
                  onChange={(e) => setContentForm((p) => ({ ...p, heroTitle: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Catalog Subtitle</label>
                <input
                  type="text"
                  value={contentForm.subTitle}
                  onChange={(e) => setContentForm((p) => ({ ...p, subTitle: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#5865F2]" />
                  <span>Discord Community Invite URL</span>
                </label>
                <input
                  type="text"
                  placeholder="https://discord.gg/easyacss"
                  value={contentForm.discordUrl || ''}
                  onChange={(e) => setContentForm((p) => ({ ...p, discordUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-xs text-white placeholder-slate-600 focus:border-[#5865F2] focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Used in top navigation button, footer, and support links.</span>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF0000]" />
                  <span>YouTube Channel URL</span>
                </label>
                <input
                  type="text"
                  placeholder="https://youtube.com/@easyacss"
                  value={contentForm.youtubeUrl || ''}
                  onChange={(e) => setContentForm((p) => ({ ...p, youtubeUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-xs text-white placeholder-slate-600 focus:border-[#FF0000] focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Used in top navigation YouTube button and footer channel list.</span>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Telegram Support URL</label>
                <input
                  type="text"
                  value={contentForm.supportUrl || ''}
                  onChange={(e) => setContentForm((p) => ({ ...p, supportUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e15] border border-slate-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-gaming text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                {contentSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" /> Content Updated!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Update Site Content
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB: REGISTERED MEMBERS & ADMIN ROLE MANAGEMENT */}
        {/* ==================================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-gaming text-white flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <span>Member Management & Admin Rights</span>
                </h1>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  Manage registered users and grant or revoke Administrator privileges.
                  Users with Admin rights can sign in to access this Admin Panel.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setIsRefreshingMembers(true);
                    await refreshMembers();
                    setTimeout(() => setIsRefreshingMembers(false), 450);
                  }}
                  title="Reload registered members from server"
                  className="px-3.5 py-2 rounded-xl bg-[#141418] hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-mono font-medium flex items-center gap-2 transition-all active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-zinc-300 ${isRefreshingMembers ? 'animate-spin' : ''}`} />
                  <span>{isRefreshingMembers ? 'Syncing...' : 'Refresh List'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddAdminModal(true);
                    setNewAdminMsg(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 text-xs font-gaming font-bold tracking-wide flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <UserPlus className="w-4 h-4 text-zinc-950" />
                  <span>Provision New Admin</span>
                </button>
              </div>
            </div>

            {/* Action notification toast */}
            {memberActionNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-700/80 text-emerald-200 text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{memberActionNotice.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMemberActionNotice(null)}
                  className="text-emerald-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Admin Privilege Info Banner */}
            <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs font-mono text-zinc-300">
                <p className="font-semibold text-white mb-0.5">How Admin Access Works:</p>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Any user who completes <strong className="text-zinc-200">Registration</strong> on the site appears in this list immediately. Click <strong className="text-emerald-400">"Grant Admin"</strong> to grant them administrator status. 
                  When they sign into their account, the <strong className="text-white">"Admin Panel"</strong> button appears in their navbar automatically.
                </p>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <div 
                onClick={() => setRoleFilter('all')}
                className={`p-4 rounded-xl bg-[#121215] border cursor-pointer transition-colors ${roleFilter === 'all' ? 'border-zinc-500 bg-[#17171d]' : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider block mb-1">Total Users</span>
                <span className="text-2xl font-bold font-gaming text-white">{members.length}</span>
              </div>
              <div 
                onClick={() => setRoleFilter('admin')}
                className={`p-4 rounded-xl bg-[#121215] border cursor-pointer transition-colors ${roleFilter === 'admin' ? 'border-emerald-600 bg-emerald-950/20' : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                <span className="text-[11px] text-emerald-400 uppercase tracking-wider block mb-1">Administrators</span>
                <span className="text-2xl font-bold font-gaming text-emerald-300">
                  {members.filter((m) => m.role === 'admin').length}
                </span>
              </div>
              <div 
                onClick={() => setRoleFilter('member')}
                className={`p-4 rounded-xl bg-[#121215] border cursor-pointer transition-colors ${roleFilter === 'member' ? 'border-zinc-400 bg-zinc-800/40' : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider block mb-1">Standard Members</span>
                <span className="text-2xl font-bold font-gaming text-zinc-300">
                  {members.filter((m) => m.role !== 'admin').length}
                </span>
              </div>
            </div>

            {/* Quick Filter & Role Tabs */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search members by username or email..."
                  value={memberSearchTerm}
                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121215] border border-zinc-800 text-xs text-white placeholder-zinc-500 font-mono outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121215] border border-zinc-800 shrink-0 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    roleFilter === 'all' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All ({members.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('admin')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    roleFilter === 'admin' ? 'bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-800/80' : 'text-zinc-400 hover:text-emerald-400'
                  }`}
                >
                  Admins ({members.filter((m) => m.role === 'admin').length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('member')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    roleFilter === 'member' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Members ({members.filter((m) => m.role !== 'admin').length})
                </button>
              </div>
            </div>

            {/* Provision New Admin Drawer/Modal */}
            {showAddAdminModal && (
              <div className="p-5 rounded-2xl bg-[#16161a] border border-zinc-700 shadow-2xl space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-zinc-300" />
                    <h3 className="font-gaming font-bold text-white text-sm">Provision Administrator Account</h3>
                  </div>
                  <button
                    onClick={() => setShowAddAdminModal(false)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {newAdminMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                      newAdminMsg.type === 'success'
                        ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/40 border border-rose-800 text-rose-300'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{newAdminMsg.text}</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setNewAdminMsg(null);
                    const res = createMemberAdmin(newAdminUser, newAdminEmail, newAdminPass);
                    if (res.success) {
                      setNewAdminMsg({ type: 'success', text: `Admin account "${newAdminUser}" created successfully!` });
                      setNewAdminUser('');
                      setNewAdminEmail('');
                      setNewAdminPass('');
                      setTimeout(() => setShowAddAdminModal(false), 1200);
                    } else {
                      setNewAdminMsg({ type: 'error', text: res.message || 'Failed to create admin.' });
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs"
                >
                  <div>
                    <label className="block text-[10px] uppercase text-zinc-400 mb-1">Admin Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. staff_alex"
                      value={newAdminUser}
                      onChange={(e) => setNewAdminUser(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e0e11] border border-zinc-700 text-white outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-zinc-400 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@easyacss.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e0e11] border border-zinc-700 text-white outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-zinc-400 mb-1">Password</label>
                    <input
                      type="text"
                      placeholder="e.g. securePass123"
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e0e11] border border-zinc-700 text-white outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAdminModal(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 font-gaming font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                      <ShieldCheck className="w-4 h-4 text-zinc-950" />
                      <span>Create Admin</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Members & Admins List */}
            <div className="rounded-2xl bg-[#121215] border border-zinc-800 p-5 shadow-xl">
              <div className="space-y-3 font-mono text-xs">
                {members
                  .filter((m) => {
                    // Role filter
                    if (roleFilter === 'admin' && m.role !== 'admin') return false;
                    if (roleFilter === 'member' && m.role === 'admin') return false;

                    // Search term filter
                    if (!memberSearchTerm.trim()) return true;
                    const q = memberSearchTerm.toLowerCase();
                    return m.username.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
                  })
                  .map((member) => {
                    const isMaster = member.username.toLowerCase() === 'admin' || member.username.toLowerCase() === 'adam';
                    const isAdmin = member.role === 'admin';
                    const isPasswordRevealed = revealedMemberPasswords[member.id];

                    return (
                      <div
                        key={member.id}
                        className={`p-4 rounded-xl bg-[#0e0e11] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isAdmin
                            ? 'border-emerald-900/60 hover:border-emerald-700/80 bg-gradient-to-r from-emerald-950/15 to-[#0e0e11]'
                            : 'border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        {/* Member Info */}
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                            alt={member.username}
                            className="w-10 h-10 rounded-xl object-cover border border-zinc-700 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{member.username}</span>

                              {isMaster ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                  <Shield className="w-3 h-3 text-amber-400" />
                                  Master Admin
                                </span>
                              ) : isAdmin ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                  Admin Staff
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                                  Gamer Member
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5 flex flex-wrap items-center gap-2">
                              <span>{member.email}</span>
                              <span>•</span>
                              <span>{member.createdAt}</span>

                              {member.password && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1.5 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-[10px] text-zinc-400">
                                    <span>Pass:</span>
                                    <span className="font-mono text-zinc-200">
                                      {isPasswordRevealed ? member.password : '••••••••'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRevealedMemberPasswords((prev) => ({
                                          ...prev,
                                          [member.id]: !prev[member.id]
                                        }));
                                      }}
                                      className="p-0.5 hover:text-white"
                                      title={isPasswordRevealed ? 'Hide Password' : 'Show Password'}
                                    >
                                      {isPasswordRevealed ? (
                                        <EyeOff className="w-3 h-3" />
                                      ) : (
                                        <Eye className="w-3 h-3" />
                                      )}
                                    </button>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Claims / Favorites stats & Actions */}
                        <div className="flex flex-wrap items-center justify-between md:justify-end gap-4">
                          <div className="flex items-center gap-4 text-zinc-400 text-xs">
                            <div className="text-right">
                              <span className="text-white font-bold">{member.claimsCount || 0}</span>
                              <span className="text-[10px] text-zinc-500 block">Claims</span>
                            </div>
                            <div className="w-px h-6 bg-zinc-800" />
                            <div className="text-right">
                              <span className="text-white font-bold">{member.favorites?.length || 0}</span>
                              <span className="text-[10px] text-zinc-500 block">Saved</span>
                            </div>
                          </div>

                          {/* Action Buttons: Toggle Role & Delete */}
                          <div className="flex items-center gap-2">
                            {isMaster ? (
                              <span className="px-3 py-1.5 rounded-lg text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800">
                                Protected Master
                              </span>
                            ) : isAdmin ? (
                              <button
                                type="button"
                                onClick={async () => {
                                  await toggleMemberRole(member.id);
                                  setMemberActionNotice({
                                    type: 'info',
                                    text: `Removed Admin privileges from "${member.username}". They are now a standard member.`
                                  });
                                }}
                                title="Revoke admin access for this user"
                                className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/80 flex items-center gap-1.5 transition-all active:scale-95"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Revoke Admin</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={async () => {
                                  await toggleMemberRole(member.id);
                                  setMemberActionNotice({
                                    type: 'success',
                                    text: `Promoted "${member.username}" to Admin! They can now access the Admin Panel with their account.`
                                  });
                                }}
                                title="Promote this user to Admin (gives access to Admin Panel)"
                                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-600/90 flex items-center gap-1.5 transition-all shadow-md active:scale-95 hover:shadow-emerald-950/50"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Grant Admin</span>
                              </button>
                            )}

                            {!isMaster && (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to remove user "${member.username}"?`)) {
                                    await deleteMember(member.id);
                                    setMemberActionNotice({
                                      type: 'info',
                                      text: `Removed member "${member.username}".`
                                    });
                                  }
                                }}
                                title="Delete user"
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {members.length === 0 && (
                  <div className="text-center py-8 text-zinc-500 font-mono">
                    No members registered yet. When someone registers, they will appear here immediately.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB: ACTIVITY LOG */}
        {/* ==================================================================== */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-gaming text-white">Live Activity & Access Log</h1>
                <p className="text-xs text-zinc-400 font-mono">
                  Live audit trail of user registrations, member logins, claims, and admin portal access.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearActivities}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 border border-zinc-700 transition-colors"
                >
                  Clear History
                </button>
              </div>
            </div>

            {/* Filter Pills for Activity Types */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActivityFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  activityFilter === 'all'
                    ? 'bg-zinc-200 text-zinc-950 shadow-sm'
                    : 'bg-[#121215] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                All Events ({activities.length})
              </button>
              <button
                onClick={() => setActivityFilter('register')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                  activityFilter === 'register'
                    ? 'bg-emerald-500 text-black shadow-sm font-bold'
                    : 'bg-[#121215] text-emerald-400 hover:text-emerald-300 border border-zinc-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Registrations ({activities.filter((a) => a.type === 'register').length})</span>
              </button>
              <button
                onClick={() => setActivityFilter('login')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                  activityFilter === 'login'
                    ? 'bg-cyan-500 text-black shadow-sm font-bold'
                    : 'bg-[#121215] text-cyan-400 hover:text-cyan-300 border border-zinc-800'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Logins ({activities.filter((a) => a.type === 'login' || a.type === 'admin_login').length})</span>
              </button>
              <button
                onClick={() => setActivityFilter('claim')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                  activityFilter === 'claim'
                    ? 'bg-zinc-300 text-zinc-950 shadow-sm font-bold'
                    : 'bg-[#121215] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Claims ({activities.filter((a) => !a.type || a.type === 'claim').length})</span>
              </button>
            </div>

            <div className="rounded-2xl bg-[#121215] border border-zinc-800 overflow-hidden shadow-xl">
              <div className="divide-y divide-zinc-800/80 font-mono text-xs">
                {activities
                  .filter((act) => {
                    if (activityFilter === 'all') return true;
                    if (activityFilter === 'register') return act.type === 'register';
                    if (activityFilter === 'login') return act.type === 'login' || act.type === 'admin_login';
                    if (activityFilter === 'claim') return !act.type || act.type === 'claim';
                    return true;
                  })
                  .map((act) => {
                    const isRegister = act.type === 'register';
                    const isLogin = act.type === 'login';
                    const isAdmin = act.type === 'admin_login';
                    const isClaim = !act.type || act.type === 'claim';

                    return (
                      <div key={act.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/30 transition-colors">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isRegister
                              ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-400'
                              : isLogin
                              ? 'bg-cyan-950/60 border-cyan-700/50 text-cyan-400'
                              : isAdmin
                              ? 'bg-purple-950/60 border-purple-700/50 text-purple-300'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                          }`}>
                            {isRegister && <UserPlus className="w-4 h-4" />}
                            {isLogin && <LogIn className="w-4 h-4" />}
                            {isAdmin && <ShieldCheck className="w-4 h-4" />}
                            {isClaim && <Gamepad2 className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-bold text-sm">
                                {act.username || 'Anonymous User'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                isRegister
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                                  : isLogin
                                  ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60'
                                  : isAdmin
                                  ? 'bg-purple-950/40 text-purple-300 border-purple-800/60'
                                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              }`}>
                                {isRegister ? 'Registered' : isLogin ? 'Signed In' : isAdmin ? 'Admin Access' : 'Claimed'}
                              </span>
                              <span className="text-zinc-500 text-[11px]">
                                {act.platform || 'Web Portal'}
                              </span>
                            </div>
                            <div className="text-zinc-300 font-medium mt-0.5">
                              {act.action || act.accountTitle || act.description}
                            </div>
                            {act.details && (
                              <div className="text-[11px] text-zinc-400 mt-0.5">
                                {act.details}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center sm:flex-col sm:items-end justify-between text-right text-[11px] text-zinc-400">
                          <span className="font-semibold text-zinc-300">{act.timestamp}</span>
                          {act.ip && (
                            <span className="text-[10px] font-mono text-zinc-500">
                              IP: {act.ip}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {activities.length === 0 && (
                  <div className="p-8 text-center text-zinc-500 font-mono">
                    No activity recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB: DOMAIN & BACKUP SYNC */}
        {/* ==================================================================== */}
        {activeTab === 'domains' && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold font-gaming text-white tracking-wide">
                  Domain & Backup Sync
                </h1>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Universal
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Complete solution for deploying to custom domains, Vercel, or Netlify with persistent sync and without losing data.
              </p>
            </div>

            {/* Notification alert */}
            {backupMsg && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono animate-in fade-in ${
                  backupMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {backupMsg.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{backupMsg.text}</span>
                </div>
                <button
                  onClick={() => setBackupMsg(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Card 1: Live Domain Status */}
            <div className="p-5 rounded-2xl bg-[#12151e] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white font-gaming">
                      Current Active Domain Status
                    </h2>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Vercel & CORS Ready
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed space-y-1.5">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Vercel routing configuration (vercel.json + api/site-data.ts) active in project!</span>
                </div>
                <p className="text-slate-400 pl-5">
                  SPA routing and 404 redirects are fully configured for Vercel, GitHub, and custom domains with CORS support.
                </p>
              </div>
            </div>

            {/* Card 1.5: Special GitHub & Vercel Sync */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-[#12151e] to-blue-950/30 border border-purple-500/30 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white font-gaming">
                      🚀 Direct Sync with GitHub & Vercel (Deploy to Vercel)
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      IMPORTANT
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    Vercel builds your site directly from <code className="text-purple-400 font-bold">src/data/mockData.ts</code> in GitHub. Whenever you add or edit accounts here, click the button below to sync all changes into the code repository so every visitor sees the new accounts!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    setIsExporting(true);
                    try {
                      const ok = await saveGlobalData();
                      if (ok) {
                        setBackupMsg({
                          type: 'success',
                          text: '✅ All accounts and configurations successfully saved and synced to mockData.ts! Push your repository to GitHub / Vercel to publish live for everyone.'
                        });
                      } else {
                        setBackupMsg({
                          type: 'error',
                          text: 'An error occurred while syncing code.'
                        });
                      }
                    } catch {
                      setBackupMsg({
                        type: 'error',
                        text: 'Unable to connect to the server.'
                      });
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                  disabled={isExporting}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-gaming text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
                  <span>{isExporting ? 'Syncing Code...' : 'Save & Sync to GitHub / Vercel'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      // Generate direct typescript mockData content for download
                      const data = getBackupData();
                      const tsContent = `import { GameAccount, ShortlinkConfig, AdsterraConfig, VIPTier, ClaimActivity, SiteContent } from '../types';

export const INITIAL_ACCOUNTS: GameAccount[] = ${JSON.stringify(data.accounts, null, 2)};

export const INITIAL_MEMBERS = ${JSON.stringify(data.members, null, 2)};

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

export const INITIAL_ACTIVITIES: ClaimActivity[] = ${JSON.stringify(data.activities, null, 2)};

export const INITIAL_SHORTLINK_CONFIG: ShortlinkConfig = ${JSON.stringify(data.shortlinkConfig, null, 2)};

export const INITIAL_ADSTERRA_CONFIG: AdsterraConfig = ${JSON.stringify(data.adsterraConfig, null, 2)};

export const INITIAL_SITE_CONTENT: SiteContent = ${JSON.stringify(data.siteContent, null, 2)};

export const INITIAL_CONTENT = INITIAL_SITE_CONTENT;
`;
                      const blob = new Blob([tsContent], { type: 'text/typescript' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'mockData.ts';
                      a.click();
                      URL.revokeObjectURL(url);
                      setBackupMsg({
                        type: 'success',
                        text: 'Updated mockData.ts downloaded! You can replace src/data/mockData.ts in your GitHub repository directly.'
                      });
                    } catch {
                      setBackupMsg({
                        type: 'error',
                        text: 'Error downloading file.'
                      });
                    }
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-gaming text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>Download mockData.ts directly</span>
                </button>
              </div>
            </div>

            {/* Card 2: Backup Export & Import */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Export Column */}
              <div className="p-5 rounded-2xl bg-[#12151e] border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-gaming text-sm font-bold">
                    <Download className="w-4 h-4 text-purple-400" />
                    <span>Export Full Backup (Export JSON)</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">
                    Download complete site data with one click. Contains all game accounts, shortlink gateways, ads, and settings to easily migrate or back up your website.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const data = getBackupData();
                        const blob = new Blob([JSON.stringify(data, null, 2)], {
                          type: 'application/json'
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `easyacss-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        setBackupMsg({
                          type: 'success',
                          text: 'Backup file downloaded successfully!'
                        });
                      } catch {
                        setBackupMsg({
                          type: 'error',
                          text: 'Error downloading file.'
                        });
                      }
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-gaming text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Data File (.JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const data = getBackupData();
                      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                      setCopiedBackupString(true);
                      setTimeout(() => setCopiedBackupString(false), 3000);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedBackupString ? 'JSON Data Copied!' : 'Copy JSON Text'}</span>
                  </button>
                </div>
              </div>

              {/* Import Column */}
              <div className="p-5 rounded-2xl bg-[#12151e] border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-gaming text-sm font-bold">
                    <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                    <span>Import & Restore to this Domain</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">
                    If you open the site from a new domain or browser, upload your JSON backup file or paste your JSON code to restore all game accounts and settings immediately!
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <input
                    type="file"
                    ref={backupFileInputRef}
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const json = JSON.parse(event.target?.result as string);
                          const ok = importBackupData(json);
                          if (ok) {
                            setBackupMsg({
                              type: 'success',
                              text: 'Data imported and all accounts successfully updated on this domain!'
                            });
                          } else {
                            setBackupMsg({
                              type: 'error',
                              text: 'Invalid file format or incorrect JSON structure.'
                            });
                          }
                        } catch {
                          setBackupMsg({
                            type: 'error',
                            text: 'Failed to read file (not valid JSON).'
                          });
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => backupFileInputRef.current?.click()}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-gaming text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                    <span>Upload Backup File (.JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const input = prompt('Paste your JSON backup data here:');
                      if (!input) return;
                      try {
                        const json = JSON.parse(input);
                        const ok = importBackupData(json);
                        if (ok) {
                          setBackupMsg({
                            type: 'success',
                            text: 'Data applied successfully to this domain!'
                          });
                        } else {
                          setBackupMsg({
                            type: 'error',
                            text: 'The provided data is invalid.'
                          });
                        }
                      } catch {
                        setBackupMsg({
                          type: 'error',
                          text: 'The entered code is not valid JSON.'
                        });
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Paste JSON Manually</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Cloud API Endpoint Sync */}
            <div className="p-5 rounded-2xl bg-[#12151e] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white font-gaming">
                    Connect Site to Remote Server (Remote API Endpoint)
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono">
                    If deploying the frontend to an external static host (like Netlify or cPanel), enter your central server URL here so your domain fetches dynamic data automatically.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={remoteEndpointInput}
                  onChange={(e) => setRemoteEndpointInput(e.target.value)}
                  placeholder="https://ais-dev-...run.app (or leave empty to use default server)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => {
                    setApiEndpoint(remoteEndpointInput);
                    setBackupMsg({
                      type: 'success',
                      text: 'Remote cloud server URL saved successfully!'
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-gaming text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save URL</span>
                </button>

                {apiEndpoint && (
                  <button
                    type="button"
                    onClick={() => {
                      setRemoteEndpointInput('');
                      setApiEndpoint('');
                      setBackupMsg({
                        type: 'success',
                        text: 'Default server URL restored.'
                      });
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-mono text-xs transition-all"
                  >
                    Reset Default
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB: CLOUD PERSISTENT DATABASE (FIRESTORE & SUPABASE) */}
        {/* ==================================================================== */}
        {activeTab === 'supabase' && (
          <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-gaming text-white flex items-center gap-2.5">
                  <Database className="w-6 h-6 text-amber-400" />
                  <span>Cloud Database & Synchronization</span>
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Google Firestore & Supabase cloud databases for real-time live synchronization of games, accounts, members, and ads.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                    isFirestoreConnected
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isFirestoreConnected ? 'bg-amber-400 animate-pulse' : 'bg-zinc-400'}`} />
                  <span>Firestore: {isFirestoreConnected ? 'Active & Live' : 'Connecting'}</span>
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                    isSupabaseConnected
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/60'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                  <span>Supabase: {isSupabaseConnected ? 'Connected' : 'Optional'}</span>
                </span>
              </div>
            </div>

            {/* Firestore Active Notice Card */}
            <div className="p-5 rounded-2xl bg-[#14121a] border border-amber-500/30 text-xs text-slate-300 space-y-3 shadow-lg shadow-amber-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-300 font-gaming text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Google Firestore Cloud Database (Active Central Cloud DB)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  REAL-TIME SYNC
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-slate-300 font-sans">
                Your website is connected to <strong>Google Cloud Firestore</strong>! Any game account, member, or ad configuration edited in the Admin Panel is immediately saved to the cloud and <strong>available live to all visitors on Netlify or Vercel with zero manual rebuilds</strong>.
              </p>

              {fsStatusMsg && (
                <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                  fsStatusMsg.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-700/60 text-rose-300'
                }`}>
                  {fsStatusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{fsStatusMsg.text}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setIsPushingFs(true);
                    setFsStatusMsg(null);
                    try {
                      const ok = await pushToFirestore();
                      setFsStatusMsg({
                        type: ok ? 'success' : 'error',
                        text: ok ? 'All accounts and settings synced successfully to Google Firestore!' : 'Error syncing data to Google Firestore.'
                      });
                    } catch (e: any) {
                      setFsStatusMsg({ type: 'error', text: e?.message || 'Firestore error' });
                    } finally {
                      setIsPushingFs(false);
                    }
                  }}
                  disabled={isPushingFs}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-gaming text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-950/40 disabled:opacity-50"
                >
                  <UploadCloud className={`w-3.5 h-3.5 ${isPushingFs ? 'animate-bounce' : ''}`} />
                  <span>{isPushingFs ? 'Pushing to Firestore...' : 'Push All Data to Firestore'}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsPullingFs(true);
                    setFsStatusMsg(null);
                    try {
                      const ok = await syncFromFirestore();
                      setFsStatusMsg({
                        type: ok ? 'success' : 'error',
                        text: ok ? 'Latest data pulled successfully from Google Firestore!' : 'No new data found in Firestore.'
                      });
                    } catch (e: any) {
                      setFsStatusMsg({ type: 'error', text: e?.message || 'Firestore sync error' });
                    } finally {
                      setIsPullingFs(false);
                    }
                  }}
                  disabled={isPullingFs}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-700 disabled:opacity-50"
                >
                  <ArrowDownToLine className={`w-3.5 h-3.5 ${isPullingFs ? 'animate-bounce' : ''}`} />
                  <span>{isPullingFs ? 'Pulling Data...' : 'Pull Live Data from Firestore'}</span>
                </button>
              </div>
            </div>

            {/* Connection Credentials Card */}
            <div className="p-6 rounded-2xl bg-[#12151e] border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-gaming">
                      Supabase API Credentials
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Source: {supabaseConfig.source === 'env' ? 'Environment Variables (.env / Vercel)' : supabaseConfig.source === 'localStorage' ? 'Custom Browser Storage' : 'None'}
                    </p>
                  </div>
                </div>

                {isSupabaseConnected && (
                  <button
                    type="button"
                    onClick={() => {
                      disconnectSupabase();
                      setSbUrlInput('');
                      setSbKeyInput('');
                      setSbStatusMsg({ type: 'success', text: 'Disconnected from custom Supabase credentials.' });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-mono transition-all cursor-pointer"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!sbUrlInput.trim() || !sbKeyInput.trim()) {
                    setSbStatusMsg({ type: 'error', text: 'Please enter both Supabase Project URL and Anon Public Key.' });
                    return;
                  }
                  setSbTesting(true);
                  setSbStatusMsg(null);
                  try {
                    const res = await saveSupabaseCredentials(sbUrlInput.trim(), sbKeyInput.trim());
                    if (res.success) {
                      setSbStatusMsg({ type: 'success', text: res.message });
                    } else {
                      setSbStatusMsg({ type: 'error', text: res.message });
                    }
                  } catch (err: any) {
                    setSbStatusMsg({ type: 'error', text: err?.message || 'Connection failed.' });
                  } finally {
                    setSbTesting(false);
                  }
                }}
                className="space-y-4"
              >
                {/* Project URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                    <span>1. Supabase Project URL</span>
                    <span className="text-[11px] text-slate-500 font-normal">e.g. https://xyzcompany.supabase.co</span>
                  </label>
                  <input
                    type="text"
                    value={sbUrlInput}
                    onChange={(e) => setSbUrlInput(e.target.value)}
                    placeholder="https://YOUR_PROJECT_REF.supabase.co"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Anon Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                    <span>2. Supabase Anon Public Key</span>
                    <button
                      type="button"
                      onClick={() => setRevealAnonKey(!revealAnonKey)}
                      className="text-[11px] text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {revealAnonKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{revealAnonKey ? 'Hide Key' : 'Show Key'}</span>
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={revealAnonKey ? 'text' : 'password'}
                      value={sbKeyInput}
                      onChange={(e) => setSbKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500 pr-10"
                    />
                  </div>
                </div>

                {sbStatusMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                      sbStatusMsg.type === 'success'
                        ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/40 border border-red-500/40 text-red-300'
                    }`}
                  >
                    {sbStatusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{sbStatusMsg.text}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={sbTesting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-gaming text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${sbTesting ? 'animate-spin' : ''}`} />
                    <span>{sbTesting ? 'Connecting & Testing...' : 'Connect & Save Database'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setSbTesting(true);
                      setSbStatusMsg(null);
                      const res = await testSupabaseConnection(sbUrlInput, sbKeyInput);
                      setSbStatusMsg({
                        type: res.success ? 'success' : 'error',
                        text: res.message
                      });
                      setSbTesting(false);
                    }}
                    disabled={sbTesting || !sbUrlInput || !sbKeyInput}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Test Ping Only
                  </button>
                </div>
              </form>
            </div>

            {/* Cloud Sync Operations Card */}
            <div className="p-6 rounded-2xl bg-[#12151e] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-gaming">
                    Live Cloud Synchronization
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Synchronize ad settings, game accounts, and site content with Supabase tables.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Pull */}
                <button
                  type="button"
                  onClick={async () => {
                    setIsPullingSb(true);
                    try {
                      const ok = await syncFromSupabase();
                      setSbStatusMsg({
                        type: ok ? 'success' : 'error',
                        text: ok ? 'Successfully pulled latest ads and data from Supabase!' : 'Supabase returned empty or could not be reached.'
                      });
                    } catch (e: any) {
                      setSbStatusMsg({ type: 'error', text: 'Pull error: ' + e?.message });
                    } finally {
                      setIsPullingSb(false);
                    }
                  }}
                  disabled={isPullingSb}
                  className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-gaming flex items-center gap-1.5">
                      <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                      Pull from Supabase
                    </span>
                    {isPullingSb && <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                    Fetch active Adsterra codes, shortlink URLs, and accounts stored in Supabase tables.
                  </p>
                </button>

                {/* Push */}
                <button
                  type="button"
                  onClick={async () => {
                    setIsPushingSb(true);
                    try {
                      const ok = await saveAllToSupabase({
                        adsterraConfig,
                        shortlinkConfig,
                        siteContent,
                        accounts,
                        members,
                        activities
                      });
                      setSbStatusMsg({
                        type: ok ? 'success' : 'error',
                        text: ok ? 'All current settings, Adsterra codes, and accounts successfully pushed to Supabase!' : 'Failed to push to Supabase. Make sure tables are created using the SQL below.'
                      });
                    } catch (e: any) {
                      setSbStatusMsg({ type: 'error', text: 'Push error: ' + e?.message });
                    } finally {
                      setIsPushingSb(false);
                    }
                  }}
                  disabled={isPushingSb}
                  className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-gaming flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-purple-400" />
                      Push All Data to Supabase
                    </span>
                    {isPushingSb && <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                    Upload your active Adsterra banner scripts, popunder codes, and {accounts.length} game accounts to seed your database.
                  </p>
                </button>
              </div>
            </div>

            {/* Exact SQL Schema Code & One-Click Copy */}
            <div className="p-6 rounded-2xl bg-[#12151e] border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-gaming">
                      Exact SQL Table Schema (Copy & Run in Supabase)
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Run this once in your Supabase Project ➔ SQL Editor ➔ New Query ➔ Run
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    copiedSql
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                  }`}
                >
                  {copiedSql ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Copied SQL Code!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-[#090b10] border border-slate-800 text-[11px] font-mono text-emerald-400/90 overflow-x-auto max-h-72 select-all leading-relaxed">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>

            {/* Step-by-Step Vercel Setup Guide */}
            <div className="p-6 rounded-2xl bg-[#12151e] border border-slate-800 space-y-3 font-sans">
              <h4 className="text-sm font-bold text-white font-gaming flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>How to link Supabase permanently to your Vercel Deployment</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 font-mono">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-purple-400 font-bold">Step 1: Get Keys</span>
                  <p className="text-[11px] text-slate-400">
                    In your Supabase project, go to <strong>Project Settings ➔ API</strong> and copy the <strong>Project URL</strong> and <strong>anon public key</strong>.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-purple-400 font-bold">Step 2: Add in Vercel</span>
                  <p className="text-[11px] text-slate-400">
                    Open your project in <strong>Vercel ➔ Settings ➔ Environment Variables</strong>. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-purple-400 font-bold">Step 3: Auto Sync</span>
                  <p className="text-[11px] text-slate-400">
                    Redeploy Vercel. Now whenever you edit Adsterra banners or add games in Admin Vault, all visitors get the updates instantly worldwide!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB: REAL OAUTH CONFIGURATION (DISCORD & GOOGLE) */}
        {/* ==================================================================== */}
        {activeTab === 'oauth' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold font-gaming text-white tracking-wide">
                    Discord & Google Real OAuth Login
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Production Ready
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Connect your real Discord Application and Google Cloud OAuth credentials to allow players to log in directly with their actual accounts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveOAuthSetupProvider('discord');
                    setIsOAuthSetupModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 text-[#8ea1e1] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Discord Setup Assistant</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveOAuthSetupProvider('google');
                    setIsOAuthSetupModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Setup Assistant</span>
                </button>
              </div>
            </div>

            {/* Notification message */}
            {oauthSaveMsg && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono animate-in fade-in ${
                  oauthSaveMsg.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {oauthSaveMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{oauthSaveMsg.text}</span>
                </div>
                <button
                  onClick={() => setOauthSaveMsg(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Status Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#0f121d] border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-gaming">Discord Authentication</h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {oauthStatus.discord ? 'Real OAuth2 Enabled & Active' : 'Waiting for Client Credentials'}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                    oauthStatus.discord
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {oauthStatus.discord ? 'ACTIVE' : 'ACTION NEEDED'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f121d] border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-gaming">Google Authentication</h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {oauthStatus.google ? 'Real OAuth2 Enabled & Active' : 'Waiting for Client Credentials'}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                    oauthStatus.google
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {oauthStatus.google ? 'ACTIVE' : 'ACTION NEEDED'}
                </span>
              </div>
            </div>

            {/* Main Configuration Forms */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setOauthSaveLoading(true);
                setOauthSaveMsg(null);
                const res = await saveOAuthConfig(oauthForm);
                setOauthSaveLoading(false);
                if (res.success) {
                  setOauthSaveMsg({
                    type: 'success',
                    text: 'OAuth configuration saved successfully! Visitors can now log in with their real accounts.'
                  });
                } else {
                  setOauthSaveMsg({
                    type: 'error',
                    text: res.message || 'Failed to save OAuth settings.'
                  });
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Discord Section */}
                <div className="p-6 rounded-2xl bg-[#0f121d] border border-white/[0.08] space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center text-white">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </div>
                      <h2 className="font-gaming font-bold text-white text-base">Discord Application</h2>
                    </div>

                    <a
                      href="https://discord.com/developers/applications"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-[#8ea1e1] hover:underline flex items-center gap-1"
                    >
                      <span>Developer Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Discord Client ID (Application ID)
                      </label>
                      <input
                        type="text"
                        value={oauthForm.discordClientId}
                        onChange={(e) => setOauthForm({ ...oauthForm, discordClientId: e.target.value.trim() })}
                        placeholder="e.g. 1345678901234567890"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090d] border border-slate-800 focus:border-[#5865F2] text-white text-xs font-mono outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Discord Client Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showDiscordSecret ? 'text' : 'password'}
                          value={oauthForm.discordClientSecret}
                          onChange={(e) => setOauthForm({ ...oauthForm, discordClientSecret: e.target.value.trim() })}
                          placeholder="e.g. AbCdEf1234567890..."
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#08090d] border border-slate-800 focus:border-[#5865F2] text-white text-xs font-mono outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDiscordSecret(!showDiscordSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showDiscordSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Redirect URIs to copy */}
                    <div className="pt-2 border-t border-white/[0.06] space-y-2">
                      <label className="block text-[11px] font-mono text-purple-300 font-bold uppercase">
                        Authorized Redirect URIs (Add to Discord Portal)
                      </label>
                      
                      <div className="p-2.5 rounded-xl bg-[#090b12] border border-slate-800 flex items-center justify-between gap-2">
                        <div className="truncate text-[11px] font-mono text-slate-300">
                          {typeof window !== 'undefined' ? `${window.location.origin}/auth/discord/callback` : '/auth/discord/callback'}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const uri = `${window.location.origin}/auth/discord/callback`;
                            navigator.clipboard.writeText(uri);
                            setCopiedRedirect('disc-origin');
                            setTimeout(() => setCopiedRedirect(null), 2000);
                          }}
                          className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[10px] font-mono text-slate-300 shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedRedirect === 'disc-origin' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedRedirect === 'disc-origin' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#090b12] border border-slate-800 flex items-center justify-between gap-2">
                        <div className="truncate text-[11px] font-mono text-slate-400">
                          https://easyacss.com/auth/discord/callback
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('https://easyacss.com/auth/discord/callback');
                            setCopiedRedirect('disc-domain');
                            setTimeout(() => setCopiedRedirect(null), 2000);
                          }}
                          className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[10px] font-mono text-slate-300 shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedRedirect === 'disc-domain' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedRedirect === 'disc-domain' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Section */}
                <div className="p-6 rounded-2xl bg-[#0f121d] border border-white/[0.08] space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </div>
                      <h2 className="font-gaming font-bold text-white text-base">Google Cloud OAuth</h2>
                    </div>

                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Google Cloud Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Google Client ID
                      </label>
                      <input
                        type="text"
                        value={oauthForm.googleClientId}
                        onChange={(e) => setOauthForm({ ...oauthForm, googleClientId: e.target.value.trim() })}
                        placeholder="e.g. 1234567890-xxx.apps.googleusercontent.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090d] border border-slate-800 focus:border-blue-500 text-white text-xs font-mono outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Google Client Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showGoogleSecret ? 'text' : 'password'}
                          value={oauthForm.googleClientSecret}
                          onChange={(e) => setOauthForm({ ...oauthForm, googleClientSecret: e.target.value.trim() })}
                          placeholder="e.g. GOCSPX-xxxxxxxxxxxxxx"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#08090d] border border-slate-800 focus:border-blue-500 text-white text-xs font-mono outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showGoogleSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Redirect URIs to copy */}
                    <div className="pt-2 border-t border-white/[0.06] space-y-2">
                      <label className="block text-[11px] font-mono text-cyan-300 font-bold uppercase">
                        Authorized Redirect URIs (Add to Google Console)
                      </label>
                      
                      <div className="p-2.5 rounded-xl bg-[#090b12] border border-slate-800 flex items-center justify-between gap-2">
                        <div className="truncate text-[11px] font-mono text-slate-300">
                          {typeof window !== 'undefined' ? `${window.location.origin}/auth/google/callback` : '/auth/google/callback'}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const uri = `${window.location.origin}/auth/google/callback`;
                            navigator.clipboard.writeText(uri);
                            setCopiedRedirect('goog-origin');
                            setTimeout(() => setCopiedRedirect(null), 2000);
                          }}
                          className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[10px] font-mono text-slate-300 shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedRedirect === 'goog-origin' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedRedirect === 'goog-origin' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#090b12] border border-slate-800 flex items-center justify-between gap-2">
                        <div className="truncate text-[11px] font-mono text-slate-400">
                          https://easyacss.com/auth/google/callback
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('https://easyacss.com/auth/google/callback');
                            setCopiedRedirect('goog-domain');
                            setTimeout(() => setCopiedRedirect(null), 2000);
                          }}
                          className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[10px] font-mono text-slate-300 shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedRedirect === 'goog-domain' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedRedirect === 'goog-domain' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit & Test Buttons */}
              <div className="p-4 rounded-2xl bg-[#0c0e15] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400 font-mono">
                  Credentials are saved safely on your server storage and persist across server restarts.
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={oauthSaveLoading}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-gaming text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
                  >
                    {oauthSaveLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{oauthSaveLoading ? 'Enregistrement...' : 'Enregistrer la configuration OAuth'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
      </div>

      {/* Edit Account Modal (All-in-One: Game, Credentials, Link Config) */}
      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          isOpen={true}
          onClose={() => setEditingAccount(null)}
          onSave={handleUpdateAccountFull}
        />
      )}

      {/* Add Account Modal (All-in-One: Game, Credentials, Link Config) */}
      <AddAccountModal
        isOpen={isNewAccountModalOpen}
        onClose={() => setIsNewAccountModalOpen(false)}
        onAdd={handleAddAccount}
      />

      {/* Steam PC Config & System Requirements Modal */}
      {specsAccount && (
        <GameSpecsModal
          account={specsAccount}
          isOpen={!!specsAccount}
          onClose={() => setSpecsAccount(null)}
          onSave={(accountId, specs) => {
            updateAccount(accountId, { systemRequirements: specs });
          }}
        />
      )}
    </div>
  );
};
