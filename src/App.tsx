import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AccountCard } from './components/AccountCard';
import { ClaimPage } from './components/ClaimPage';
import { AdminPanel } from './components/AdminPanel';
import { AdBannerSlot } from './components/AdBannerSlot';
import { AdsterraSocialBar } from './components/AdsterraSocialBar';
import { AdsterraScriptInjector } from './components/AdsterraScriptInjector';
import { MemberAuthModal } from './components/AuthModals';
import { SupportModal } from './components/SupportModal';
import { BuyVIPModal } from './components/BuyVIPModal';
import { AntiAdblockScreen } from './components/AntiAdblockScreen';
import { HomePage } from './components/HomePage';
import { RulesPage } from './components/RulesPage';
import { CommunityPage } from './components/CommunityPage';
import { EasyAcssLogo } from './components/EasyAcssLogo';
import { OAuthSetupModal } from './components/OAuthSetupModal';
import { Gamepad2, Layers, CheckCircle2, ShieldCheck, UserPlus, LogIn, Shield, MessageSquare } from 'lucide-react';
import { Platform } from './types';

const PLATFORM_FILTERS: { label: string; value: Platform }[] = [
  { label: 'All Games', value: 'All' },
  { label: 'Steam PC', value: 'Steam' },
  { label: 'Xbox', value: 'Xbox' },
  { label: 'Streaming Cookies', value: 'Cookies' },
  { label: 'Others', value: 'Others' }
];

const MainContent: React.FC = () => {
  const {
    currentView,
    accounts,
    selectedPlatform,
    searchQuery,
    setSearchQuery,
    setSelectedPlatform,
    siteContent,
    setIsSupportModalOpen,
    setCurrentView,
    currentMember,
    openAuthModal,
    adsterraConfig,
    theme
  } = useApp();

  if (currentView === 'admin') {
    return (
      <div className="bg-[#08090d] text-slate-100 min-h-screen">
        <AdminPanel />
        <MemberAuthModal />
      </div>
    );
  }

  if (currentView === 'home') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#07080d] text-slate-100">
        <AntiAdblockScreen />
        <Navbar />
        <main className="flex-1">
          <HomePage />
        </main>
        <Footer />
        <SupportModal />
        <MemberAuthModal />
        <BuyVIPModal />
        <AdsterraScriptInjector />
        {!adsterraConfig.socialBarCode?.trim() && <AdsterraSocialBar />}
      </div>
    );
  }

  if (currentView === 'rules') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#07080d] text-slate-100">
        <AntiAdblockScreen />
        <Navbar />
        <main className="flex-1">
          <RulesPage />
        </main>
        <Footer />
        <SupportModal />
        <MemberAuthModal />
        <BuyVIPModal />
        <AdsterraScriptInjector />
        {!adsterraConfig.socialBarCode?.trim() && <AdsterraSocialBar />}
      </div>
    );
  }

  if (currentView === 'community') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#07080d] text-slate-100">
        <AntiAdblockScreen />
        <Navbar />
        <main className="flex-1">
          <CommunityPage />
        </main>
        <Footer />
        <SupportModal />
        <MemberAuthModal />
        <BuyVIPModal />
        <AdsterraScriptInjector />
        {!adsterraConfig.socialBarCode?.trim() && <AdsterraSocialBar />}
      </div>
    );
  }

  if (currentView === 'claim') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#08090d] text-slate-100">
        <AntiAdblockScreen />
        <Navbar />
        <main className="flex-1">
          <ClaimPage />
        </main>
        <Footer />
        <SupportModal />
        <MemberAuthModal />
        <BuyVIPModal />
        <AdsterraScriptInjector />
        {!adsterraConfig.socialBarCode?.trim() && <AdsterraSocialBar />}
      </div>
    );
  }

  // Catalog Filter Logic (Standard accounts only)
  const filteredAccounts = accounts.filter((acc) => {
    // 1. Platform filter
    if (selectedPlatform !== 'All' && acc.platform !== selectedPlatform) {
      return false;
    }
    // 2. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = acc.title.toLowerCase().includes(q);
      const matchPlatform = acc.platform.toLowerCase().includes(q);
      const matchBadge = acc.badge.toLowerCase().includes(q);
      const matchIncluded = acc.includedGames.some(g => g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q));
      if (!matchTitle && !matchPlatform && !matchBadge && !matchIncluded) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#08090d] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 w-full">
        {/* Top Adsterra 728x90 Banner */}
        <AdBannerSlot type="728x90" position="top" className="mb-4" />

        {/* Category & Filter Bar - Minimal, sleek, matching clean aesthetic */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {PLATFORM_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedPlatform(filter.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer ${
                  selectedPlatform === filter.value
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-[#121520] hover:bg-[#181d2c] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{filteredAccounts.length} Verified Accounts Online</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-purple-400 hover:text-purple-300 underline ml-2 cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* 5-Column Product Grid - Exactly matching user screenshot */}
        {filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredAccounts.map((account, index) => (
              <React.Fragment key={account.id}>
                <AccountCard account={account} />
                {/* Insert In-Feed Native Adsterra Banner after 5th card if enabled */}
                {index === 4 && adsterraConfig.enabled && adsterraConfig.inFeedAdsEnabled && (
                  <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5">
                    <AdBannerSlot type="native-card" position="in-feed" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-2xl bg-[#0e1118] border border-white/5 p-8 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white font-sans">No Games Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4 font-mono">
              No accounts match "{searchQuery}" under the {selectedPlatform} platform filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPlatform('All');
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-bold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Bottom Adsterra 728x90 Banner */}
        <div className="mt-8">
          <AdBannerSlot type="728x90" position="bottom" />
        </div>
      </main>

      {/* Floating Purple Chat / Support Button matching screenshot */}
      <button
        id="floating-support-btn"
        onClick={() => setIsSupportModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#8a2be2] hover:bg-[#7b23d1] text-white flex items-center justify-center shadow-xl shadow-purple-600/40 hover:scale-110 active:scale-95 transition-all cursor-pointer"
        title="Community & Live Support"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      <AntiAdblockScreen />
      <Footer />
      <SupportModal />
      <MemberAuthModal />
      <BuyVIPModal />
      <AdsterraScriptInjector />
      {!adsterraConfig.socialBarCode?.trim() && <AdsterraSocialBar />}
    </div>
  );
};

const Footer: React.FC = () => {
  const { siteContent, setCurrentView, setIsSupportModalOpen, isAdminAuthenticated, currentMember } = useApp();

  const isCurrentAdmin = Boolean(
    isAdminAuthenticated ||
    currentMember?.role === 'admin' ||
    currentMember?.username?.toLowerCase() === 'adam' ||
    currentMember?.username?.toLowerCase() === 'admin'
  );

  return (
    <footer className="mt-16 bg-[#08090d] border-t border-white/[0.08] pt-10 pb-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <EasyAcssLogo size="sm" showSubtitle />
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Free Steam offline gaming accounts, instant credentials unlock, and active 2FA dispatching.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Steam Servers: 100% Online</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-white uppercase font-sans tracking-wider mb-3 text-xs">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentView('home')} className="hover:text-purple-400 transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('free')} className="hover:text-purple-400 transition-colors cursor-pointer">
                  Free Games Catalog
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('community')} className="hover:text-purple-400 transition-colors cursor-pointer text-purple-300 font-semibold">
                  Community Drops
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('rules')} className="hover:text-purple-400 transition-colors cursor-pointer">
                  Rules & Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => setIsSupportModalOpen(true)} className="hover:text-purple-400 transition-colors cursor-pointer">
                  Community & Support
                </button>
              </li>
              {isCurrentAdmin && (
                <li>
                  <button 
                    onClick={() => setCurrentView('admin')} 
                    className="hover:text-emerald-300 transition-colors flex items-center gap-1 text-emerald-400 font-semibold cursor-pointer"
                  >
                    <Shield className="w-3 h-3 text-emerald-400" />
                    <span>Admin Panel</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-white uppercase font-sans tracking-wider mb-3 text-xs">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-white cursor-pointer">Steam Offline PC</li>
              <li className="hover:text-white cursor-pointer">Xbox Ultimate Pass</li>
              <li className="hover:text-white cursor-pointer">Anime & Movie Cookies</li>
              <li className="hover:text-white cursor-pointer">Weekly Drops</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-bold text-white uppercase font-sans tracking-wider mb-3 text-xs">
              Community Channels
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href={siteContent.discordUrl || 'https://discord.gg/easyacss'}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 rounded-xl bg-[#121520] border border-white/5 hover:border-purple-500/40 text-slate-300 hover:text-white transition-colors"
              >
                Join Discord (18.4k Gamers)
              </a>
              <a
                href={siteContent.youtubeUrl || 'https://youtube.com/@easyacss'}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 rounded-xl bg-[#121520] border border-white/5 hover:border-red-500/40 text-slate-300 hover:text-white transition-colors"
              >
                YouTube Channel
              </a>
              <a
                href={siteContent.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 rounded-xl bg-[#121520] border border-white/5 hover:border-purple-500/40 text-slate-300 hover:text-white transition-colors"
              >
                Telegram Restock Channel
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} {siteContent.siteName || 'EasyAcss'} Network. All games and accounts verified daily.
          </div>
          <div className="flex items-center gap-4">
            <span>Instant In-Navigator Access</span>
            <span>•</span>
            <span>Cloudflare Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const OAuthToastBanner: React.FC = () => {
  const { oauthToast, setOauthToast } = useApp();
  if (!oauthToast?.show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`p-4 rounded-2xl shadow-2xl backdrop-blur-md border flex items-start gap-3 ${
          oauthToast.type === 'success'
            ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50'
            : 'bg-rose-950/95 border-rose-500/40 text-rose-100 shadow-rose-950/50'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {oauthToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Shield className="w-5 h-5 text-rose-400" />
          )}
        </div>
        <div className="flex-1 text-xs">
          <p className="font-bold">{oauthToast.type === 'success' ? 'Authentification Réussie' : 'Information OAuth'}</p>
          <p className="mt-0.5 text-slate-300 leading-relaxed font-sans">{oauthToast.message}</p>
        </div>
        <button
          onClick={() => setOauthToast(null)}
          className="text-slate-400 hover:text-white text-xs font-mono px-1.5 py-0.5 rounded cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
      <OAuthSetupModal />
      <OAuthToastBanner />
    </AppProvider>
  );
}
