import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdBannerSlot } from './AdBannerSlot';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Crown,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Gamepad2,
  Clock,
  AlertCircle,
  FileText,
  KeyRound,
  Download,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { SteamSystemRequirements } from './SteamSystemRequirements';
import { parseSteamRequirements } from '../utils/steamRequirementsParser';

export const ClaimPage: React.FC = () => {
  const {
    selectedAccountId,
    accounts,
    setCurrentView,
    user,
    currentMember,
    claimAccount,
    shortlinkConfig,
    setIsBuyVipModalOpen,
    adsterraConfig,
    siteContent,
    isAccountUnlocked,
    unlockAccount,
    getAccountUnlockUrl,
    triggerPopunder
  } = useApp();

  const account = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const effectiveTimer = account?.linkConfig?.timerSeconds ?? shortlinkConfig?.timerSeconds ?? 8;

  // Claim & Shortlink Gate State
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(effectiveTimer);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const formatUrl = (url?: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const getTargetLink = () => {
    if (!account) return '';
    if (account.linkConfig && account.linkConfig.enabled === false) return '';
    const custom = account.linkConfig?.customShortlinkUrl?.trim();
    if (custom) return formatUrl(custom);
    if (shortlinkConfig?.enabled && shortlinkConfig?.domain) {
      const domain = shortlinkConfig.domain.trim();
      const base = /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;
      return `${base}/claim?acc=${account.id}`;
    }
    return '';
  };

  const targetLink = getTargetLink();

  // Check if account is unlocked: either via shortlink callback (?unlock=1), VIP status, or unlocked list
  const isVip = Boolean(user?.isVip || currentMember?.isVip);
  const isUnlocked = Boolean(account && (isAccountUnlocked(account.id) || isVip));

  // Automatically register claim stats when account is confirmed unlocked
  useEffect(() => {
    if (account && isUnlocked) {
      claimAccount(account);
    }
  }, [account?.id, isUnlocked]);

  const finalizeClaim = () => {
    if (!account) return;
    const res = claimAccount(account);
    if (!res.success) {
      setClaimError(res.message || 'Failed to claim account.');
      return;
    }
    unlockAccount(account.id);
  };

  // Countdown effect: when timer finishes, redirect directly to shortlink if one exists!
  useEffect(() => {
    if (!isTimerRunning) return;

    if (countdown <= 0) {
      setIsTimerRunning(false);

      const linkToOpen = getTargetLink();
      if (linkToOpen) {
        // User MUST complete the shortlink before getting credentials!
        setIsRedirecting(true);

        // Immediate automatic redirect directly to the shortened link!
        try {
          if (window.top && window.top !== window) {
            window.top.location.href = linkToOpen;
          } else {
            window.location.href = linkToOpen;
          }
        } catch {
          window.location.href = linkToOpen;
        }
        return;
      }

      // If no shortlink is configured for this account, unlock directly:
      finalizeClaim();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isTimerRunning, countdown]);

  // Password display states
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleClaimClick = () => {
    if (isTimerRunning || isUnlocked || isRedirecting) return;
    setClaimError(null);

    // If user is VIP, instant unlock without waiting or links
    if (isVip) {
      finalizeClaim();
      return;
    }

    // Trigger popunder if configured
    triggerPopunder('claim');

    // Start countdown timer
    setCountdown(effectiveTimer);
    setIsTimerRunning(true);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentView('catalog')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121215] hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span>EasyAcss</span>
          <span>/</span>
          <span>{account.platform}</span>
          <span>/</span>
          <span className="text-zinc-300 truncate max-w-[140px] sm:max-w-none">{account.title}</span>
        </div>
      </div>

      {/* Top Adsterra 728x90 Banner */}
      <AdBannerSlot type="728x90" position="top" className="mb-6" />

      {/* Main Grid: Left Details & Right Claim Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Section (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Card with Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-[#121215] border border-zinc-800 shadow-xl">
            <div className="relative aspect-[21/9] w-full bg-zinc-900">
              <img
                src={account.coverImage}
                alt={account.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/40 to-transparent" />

              {/* Badges on hero */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold font-gaming uppercase tracking-wide bg-zinc-800 text-zinc-100 shadow-lg border border-zinc-700">
                  {account.platform}
                </span>

                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-zinc-900/90 backdrop-blur-md text-zinc-300 border border-zinc-700">
                  {account.badge}
                </span>
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="p-6">
              <h1 className="text-2xl sm:text-3xl font-bold font-gaming text-white tracking-wide">
                {account.title}
              </h1>

              {(() => {
                const explicitReq = account.systemRequirements?.trim();
                const parsed = parseSteamRequirements(account.description);
                let effectiveRequirements: string | null = null;
                let displayDescription: string = account.description;

                if (explicitReq) {
                  effectiveRequirements = explicitReq;
                } else if (parsed.hasRequirements) {
                  effectiveRequirements = account.description;
                  displayDescription = parsed.leadDescription;
                }

                return (
                  <>
                    {displayDescription ? (
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                        {displayDescription}
                      </p>
                    ) : null}

                    {effectiveRequirements ? (
                      <div className="mt-5">
                        <SteamSystemRequirements requirementsText={effectiveRequirements} />
                      </div>
                    ) : null}
                  </>
                );
              })()}

              {/* 100% Verification Badge */}
              <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-emerald-300 font-gaming">
                        100% VERIFIED WORKING ACCOUNT
                      </h4>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <p className="text-xs text-slate-400">
                      Automated cloud bot verified login status: <span className="text-emerald-300 font-mono">{account.lastVerified}</span>.
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-emerald-500/20 sm:pl-4">
                  <div className="text-[11px] font-mono text-slate-400">Vault Status</div>
                  <div className="text-base font-bold font-mono text-emerald-400 flex items-center gap-1.5 justify-end">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Available
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Included Games List */}
          <div className="rounded-2xl bg-[#12151e] border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white font-gaming">
                  Included Content & Games ({account.includedGames.length})
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-medium">
                Full Library Access
              </span>
            </div>

            <div className="space-y-2.5">
              {(account.includedGames || []).map((game, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0e111a] hover:bg-[#151926] border border-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-xs font-mono text-purple-300 font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{game.title}</h4>
                      <span className="text-xs text-slate-400 font-mono">{game.genre}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-400">
                      Standard
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Rules Card */}
          <div className="rounded-2xl bg-[#12151e] border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-base text-white font-gaming">
                Security & Account Guidelines
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              {(Array.isArray(siteContent?.rules) && siteContent.rules.length > 0
                ? siteContent.rules
                : [
                    'Do not change the account credentials (email or password).',
                    'Switch Steam to "Go Offline" mode immediately after logging in.',
                    'Do not activate Steam Guard Family sharing or modify security settings.',
                    'Use accounts strictly for offline single-player playthroughs.'
                  ]
              ).map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Section (5 Columns - Claim Box & Delivery) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Claim Box */}
          <div className="rounded-2xl bg-[#121215] border border-zinc-800 p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                  Instant Delivery Terminal
                </span>
                <h3 className="text-lg font-bold text-white font-gaming mt-0.5">
                  Claim Account Access
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                Direct In-Tab
              </span>
            </div>

            {/* Error notice */}
            {claimError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{claimError}</span>
              </div>
            )}

            {!isUnlocked ? (
              <div className="space-y-4">
                {/* Account Availability Overview */}
                <div className="p-3.5 rounded-xl bg-[#16161a] border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Account Status</span>
                    <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Available
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Platform</span>
                    <span className="text-zinc-200 font-semibold">{account.platform}</span>
                  </div>
                </div>

                {/* In-Card Sponsor Ad Slot */}
                <AdBannerSlot type="468x60" position="in-feed" className="my-1" />

                {/* State 1: Redirecting directly to shortlink */}
                {isRedirecting ? (
                  <div className="p-5 rounded-xl bg-[#16161a] border border-emerald-500/40 space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
                    <div>
                      <h4 className="font-bold text-white font-gaming text-sm">
                        Redirecting to Shortlink Gateway...
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 font-mono">
                        Directing to link verification. Please complete the sponsor link to unlock credentials.
                      </p>
                    </div>
                    {targetLink && (
                      <a
                        href={targetLink}
                        className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-gaming text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/50"
                      >
                        <span>Click here if not redirected automatically (Open Link)</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ) : isTimerRunning ? (
                  /* State 2: Countdown Timer */
                  <div className="p-4 rounded-xl bg-[#16161a] border border-emerald-500/30 space-y-3.5 shadow-lg shadow-emerald-950/20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        <span className="text-xs font-gaming font-bold text-white uppercase tracking-wider">
                          {targetLink ? 'Preparing Secure Gateway' : 'Preparing Credentials'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{countdown}s</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800 p-0.5">
                      <div
                        className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full rounded-full transition-all duration-1000 ease-linear shadow-sm shadow-emerald-400/50"
                        style={{
                          width: `${Math.round(((effectiveTimer - countdown) / Math.max(effectiveTimer, 1)) * 100)}%`
                        }}
                      />
                    </div>

                    <p className="text-[11px] font-mono text-zinc-400 text-center animate-pulse">
                      {countdown > Math.floor(effectiveTimer * 0.7) && 'Connecting to dispatch server...'}
                      {countdown <= Math.floor(effectiveTimer * 0.7) && countdown > Math.floor(effectiveTimer * 0.3) && 'Verifying offline license & security token...'}
                      {countdown <= Math.floor(effectiveTimer * 0.3) && countdown > 0 && (targetLink ? 'Preparing redirect to sponsor shortlink...' : 'Unlocking credentials now...')}
                      {countdown <= 0 && 'Redirecting...'}
                    </p>

                    <button
                      disabled
                      className="w-full py-3.5 px-6 rounded-xl font-gaming text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2.5 bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 cursor-not-allowed shadow-inner"
                    >
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Please wait ({countdown}s)...</span>
                    </button>
                  </div>
                ) : (
                  /* State 3: Ready to Claim Button */
                  <button
                    id="claim-account-btn"
                    onClick={handleClaimClick}
                    className="w-full py-4 px-6 rounded-xl font-gaming text-sm font-bold tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 shadow-zinc-900/50 active:scale-[0.98] cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Get Account</span>
                  </button>
                )}
              </div>
            ) : (
              /* Revealed Credentials Box: Only shown AFTER passing shortlink or VIP */
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-zinc-200 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block text-white font-gaming">Account Successfully Unlocked • Access Granted</span>
                    <span className="text-[11px] text-emerald-300/90 font-mono">
                      Here are your login credentials for this account:
                    </span>
                  </div>
                </div>

                {/* Login Credentials Panel */}
                <div className="space-y-3 p-4 rounded-xl bg-[#16161a] border border-zinc-800">
                  {/* Username Field */}
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      Account Username / Email
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 rounded-lg bg-[#0e0e11] border border-zinc-700 font-mono text-xs text-white select-all">
                        {account.credentials.username}
                      </div>
                      <button
                        onClick={() => copyToClipboard(account.credentials.username, 'username')}
                        className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1 transition-all border border-zinc-700 cursor-pointer"
                      >
                        {copiedField === 'username' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      Account Password
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 rounded-lg bg-[#0e0e11] border border-zinc-700 font-mono text-xs text-white select-all">
                        {showPassword ? account.credentials.passwordHash : '••••••••••••••••'}
                      </div>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs border border-zinc-700 cursor-pointer"
                        title={showPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(account.credentials.passwordHash, 'password')}
                        className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1 transition-all border border-zinc-700 cursor-pointer"
                      >
                        {copiedField === 'password' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-white flex items-center gap-1.5 font-gaming">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    Quick Launch Guide:
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {account.credentials.instructions}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentView('catalog')}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-gaming font-bold text-white transition-colors cursor-pointer"
                  >
                    Browse Other Games
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Adsterra 300x250 Sidebar Banner */}
          <AdBannerSlot type="300x250" position="sidebar" />
        </div>
      </div>

      {/* Bottom Adsterra 728x90 Banner */}
      <div className="mt-8">
        <AdBannerSlot type="728x90" position="bottom" />
      </div>
    </div>
  );
};
