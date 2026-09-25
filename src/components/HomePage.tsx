import React from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Gamepad2,
  KeyRound,
  CheckCircle2,
  Flame,
  Star,
  Layers,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdBannerSlot } from './AdBannerSlot';

export const HomePage: React.FC = () => {
  const {
    accounts,
    openClaimPage,
    setCurrentView,
    siteContent,
    activities
  } = useApp();

  // Dynamic stats
  const totalDrops = accounts.length > 0 ? accounts.length : 50;
  const availableDrops = Math.max(0, totalDrops - 4);
  const claimedToday = activities.filter(
    (a) => a.type === 'claim' || (a.status && a.status.toLowerCase().includes('claim'))
  ).length;

  return (
    <div className="min-h-screen bg-[#07080d] text-white selection:bg-purple-600 selection:text-white relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[480px] bg-purple-600/12 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-48 left-1/4 w-72 h-72 bg-violet-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-64 right-1/4 w-80 h-80 bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-8">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171427]/80 border border-purple-500/30 text-xs text-purple-200 shadow-lg shadow-purple-950/40 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
          <span className="font-medium tracking-wide">Fresh drops added every day</span>
        </div>

        {/* Giant Headline Matching User Screenshot */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight uppercase leading-[1.08]">
            GET ANY{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-400 to-violet-300 drop-shadow-[0_0_35px_rgba(192,132,252,0.35)]">
              PREMIUM
            </span>
            <br />
            ACCOUNT FREE
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed pt-2">
            Instant access to Steam, Netflix, Spotify, Crunchyroll and Disney+ accounts. Tested, working and completely free.
          </p>
        </div>

        {/* Counter Stats Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <div className="px-4 py-2 rounded-full bg-[#10121d]/90 border border-white/[0.08] text-xs font-medium text-slate-300 backdrop-blur-md shadow-sm">
            <strong className="text-white font-bold">{totalDrops}</strong>{' '}
            <span className="text-slate-400">total drops</span>
          </div>

          <div className="px-4 py-2 rounded-full bg-[#10121d]/90 border border-white/[0.08] text-xs font-medium text-slate-300 backdrop-blur-md shadow-sm">
            <strong className="text-white font-bold">{availableDrops}</strong>{' '}
            <span className="text-slate-400">available</span>
          </div>

          <div className="px-4 py-2 rounded-full bg-[#10121d]/90 border border-white/[0.08] text-xs font-medium text-slate-300 backdrop-blur-md shadow-sm flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <strong className="text-white font-bold">{claimedToday}</strong>{' '}
            <span className="text-slate-400">claimed today</span>
          </div>
        </div>

        {/* Subtle Horizontal Gradient Line */}
        <div className="w-48 sm:w-72 h-[1.5px] mx-auto bg-gradient-to-r from-transparent via-purple-500/80 to-transparent" />

        {/* Action Buttons: YouTube in RED, Discord in BLUE, and Free Accounts in PURPLE */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          {/* Primary CTA: Browse Free Accounts */}
          <button
            onClick={() => setCurrentView('free')}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm tracking-wide uppercase shadow-xl shadow-purple-700/30 transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Browse Free Drops</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Discord Button - Blue */}
          <a
            href={siteContent.discordUrl || 'https://discord.gg/easyacss'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-xl shadow-[#5865F2]/25 active:scale-[0.98] flex items-center gap-2.5 border border-indigo-400/30 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>Discord Server</span>
          </a>

          {/* YouTube Button - Red */}
          <a
            href={siteContent.youtubeUrl || 'https://youtube.com/@easyacss'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 rounded-xl bg-[#FF0000] hover:bg-red-700 text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-xl shadow-red-600/25 active:scale-[0.98] flex items-center gap-2.5 border border-red-500/40 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>YouTube Channel</span>
          </a>
        </div>
      </section>

      {/* Native Banner Ads Placement (Replaces Featured Free Accounts) */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdBannerSlot type="native-banner" position="home" />
      </section>

      {/* Why Choose EasyAcss Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
            PREMIUM VAULT BENEFITS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Why Gamers Trust EasyAcss
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Enjoy full AAA game libraries with seamless 2FA dispatch and zero hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-[#0d1019]/90 border border-white/[0.07] hover:border-purple-500/30 transition-all space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Live Instant 2FA Dispatch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No waiting for admins. Our automated generator yields valid Steam Guard codes in real time right on the unlock screen.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1019]/90 border border-white/[0.07] hover:border-purple-500/30 transition-all space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">100% Tested & Verified Daily</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every drop is verified by automated health checkers. Invalid or locked accounts are immediately rotated and refreshed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1019]/90 border border-white/[0.07] hover:border-purple-500/30 transition-all space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Completely Free Gaming</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Funded by shortlinks and verified sponsors. No subscriptions, credit cards, or hidden payment traps ever.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step Simple Guide */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="p-7 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0e111a] to-[#090b12] border border-white/[0.08] shadow-2xl space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Claim Your Account in 3 Quick Steps
            </h2>
            <p className="text-xs text-slate-400">
              Straightforward and safe unlock workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                01
              </span>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Select an Account</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Head over to the <strong className="text-purple-300">Free Drops</strong> page and pick the game or service you want to unlock.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                02
              </span>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Complete Sponsor Link</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pass through the sponsor verification page to reveal the secure unlock key for your selected drop.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                03
              </span>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Play in Offline Mode</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log in, request your live 2FA code, set Steam to <strong className="text-purple-300">Go Offline</strong>, and enjoy your game!
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 text-center">
            <button
              onClick={() => setCurrentView('rules')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-4 cursor-pointer"
            >
              Read Community & Offline Gaming Rules →
            </button>
          </div>
        </div>
      </section>

      {/* Footer Social Callout */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-5">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Join Over 50,000+ Happy Gamers
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Get notifications for restocks, request new titles, and participate in exclusive weekly community giveaways.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Discord Button */}
          <a
            href={siteContent.discordUrl || 'https://discord.gg/easyacss'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg shadow-[#5865F2]/25 flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>Join Discord</span>
          </a>

          {/* YouTube Button */}
          <a
            href={siteContent.youtubeUrl || 'https://youtube.com/@easyacss'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-[#FF0000] hover:bg-red-700 text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg shadow-red-600/25 flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>Subscribe on YouTube</span>
          </a>
        </div>
      </section>
    </div>
  );
};
