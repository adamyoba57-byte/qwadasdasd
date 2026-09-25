import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Gamepad2,
  KeyRound,
  Ban,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  Lock,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RulesPage: React.FC = () => {
  const { setCurrentView, siteContent } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const rulesList = [
    {
      id: 'steam-offline',
      icon: Gamepad2,
      badge: 'MANDATORY',
      badgeColor: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
      title: '1. Always Switch Steam to "Go Offline" Mode',
      desc: 'Immediately after launching Steam and downloading your game, click "Steam" in the top-left menu bar and select "Go Offline...".',
      details: [
        'Allows unlimited members to play single-player stories at the exact same time.',
        'Prevents your gameplay from being interrupted by another user launching the game.',
        'Keeps your game progress completely local and isolated on your PC.',
      ],
      severity: 'high'
    },
    {
      id: 'no-alter',
      icon: Ban,
      badge: 'CRITICAL',
      badgeColor: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
      title: '2. Strictly Never Change Account Credentials',
      desc: 'Attempting to change the account password, linked email address, Steam Guard, or family sharing is strictly prohibited.',
      details: [
        'Automated security bots monitor all account sessions 24/7.',
        'Any modification triggers an instant credentials reset and permanent IP address ban.',
        'Respect the community so everyone can enjoy free gaming drops uninterrupted.',
      ],
      severity: 'critical'
    },
    {
      id: 'two-factor',
      icon: KeyRound,
      badge: 'GUIDELINE',
      badgeColor: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
      title: '3. Instant 2FA Code Generation Etiquette',
      desc: 'When logging into Steam or supported platforms, use our instant 2FA generator on the claim screen.',
      details: [
        'Steam Guard codes regenerate every 30 seconds and remain valid for 60 seconds.',
        'Only click "Request 2FA Code" when the client actually prompts you for Steam Guard.',
        'Do not spam the generator button to avoid rate-limiting your connection.',
      ],
      severity: 'medium'
    },
    {
      id: 'fair-use',
      icon: Shield,
      badge: 'FAIR USE',
      badgeColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
      title: '4. Fair Usage & Daily Drops Policy',
      desc: 'All accounts and drops are 100% free and funded by verified sponsor shortlinks.',
      details: [
        'Complete shortlinks fairly without automated bot bypassers.',
        'Fresh account restocks and new AAA games are added each day.',
        'If an account is temporarily full or locked, check back in a few hours or report it on Discord.',
      ],
      severity: 'medium'
    },
  ];

  const faqs = [
    {
      q: 'Can I keep my game progress and save files?',
      a: 'Yes! In Steam Offline Mode, game saves and achievements are written directly to your local computer directory (AppData or Documents). Your personal campaign saves remain intact on your machine.'
    },
    {
      q: 'Can I play online multiplayer games with these accounts?',
      a: 'No. These shared drops are intended exclusively for single-player offline campaigns and story playthroughs. Playing online causes concurrent session collisions and risks account suspensions.'
    },
    {
      q: 'What should I do if a code or password does not work?',
      a: 'Accounts are checked daily by automated bots. If a password fails, it may be undergoing scheduled maintenance or credentials rotation. Head over to our Discord community to report it and get an instant replacement drop.'
    },
    {
      q: 'Are any downloads or external software required?',
      a: 'Never. You only need the official client (such as Steam, Epic Games, or Ubisoft Connect). Never download external third-party tools claiming to bypass DRM.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-200 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-purple-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-10">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('free')}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Explore Free Drops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Page Hero Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-xs text-purple-300 shadow-sm backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold tracking-wide">EASYACSS COMMUNITY POLICY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Official Rules & Guidelines
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Follow these essential rules to prevent account locks and maintain uninterrupted access for every player in our community.
          </p>
        </div>

        {/* Quick Notice Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#10121d] to-indigo-950/30 border border-purple-500/30 flex items-start gap-3.5 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <div className="font-bold text-white flex items-center gap-2">
              <span>Zero-Tolerance Policy on Credential Tampering</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-mono uppercase">Enforced</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Every drop is monitored by automated security systems. Changing email, password, or security settings results in an automatic hardware & IP blacklist. Respect the shared accounts.
            </p>
          </div>
        </div>

        {/* Core Rules List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>General Account Rules</span>
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {rulesList.map((rule) => {
              const Icon = rule.icon;
              return (
                <div
                  key={rule.id}
                  className="p-5 sm:p-6 rounded-2xl bg-[#0e111a]/80 border border-white/[0.07] hover:border-purple-500/30 transition-all shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{rule.title}</h3>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{rule.desc}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border shrink-0 ${rule.badgeColor}`}>
                      {rule.badge}
                    </span>
                  </div>

                  <div className="pl-12 space-y-1.5">
                    {rule.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Steam Offline Walkthrough */}
        <div className="p-6 rounded-2xl bg-[#0f121d] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">How to Switch Steam to Offline Mode</h3>
              <p className="text-xs text-slate-400">Follow this simple 3-step sequence every time you play</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <div className="text-xs font-bold text-white">Login & Download</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Log into Steam using the provided credentials. Start downloading the game to your library.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <div className="text-xs font-bold text-white">Select "Go Offline"</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                In the top menu, click <strong className="text-purple-300">Steam</strong> → <strong className="text-purple-300">Go Offline...</strong> and click Restart in Offline Mode.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <div className="text-xs font-bold text-white">Play Uninterrupted</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Launch the game! Your saves remain local and other players cannot disconnect your session.
              </p>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-[#0e111a] border border-white/[0.07] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-white">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/[0.04] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Community & Social Actions */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/50 via-[#0e1019] to-indigo-950/40 border border-purple-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white">Need help or want to request a game?</h3>
            <p className="text-xs text-slate-300 max-w-md">
              Join our active community on Discord and subscribe to our YouTube channel for updates, alerts, and giveaways.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-center">
            {/* Discord Blue Button */}
            <a
              href={siteContent.discordUrl || 'https://discord.gg/easyacss'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-[#5865F2]/25 flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>Discord Server</span>
            </a>

            {/* YouTube Red Button */}
            <a
              href={siteContent.youtubeUrl || 'https://youtube.com/@easyacss'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#FF0000] hover:bg-red-700 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-red-600/25 flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>YouTube Channel</span>
            </a>

            <button
              onClick={() => setCurrentView('free')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Browse Free Drops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
