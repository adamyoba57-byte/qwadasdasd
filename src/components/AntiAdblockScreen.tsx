import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  LogIn,
  KeyRound,
  User,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink
} from 'lucide-react';
import { EasyAcssLogo } from './EasyAcssLogo';

export const AntiAdblockScreen: React.FC = () => {
  const {
    isAdminAuthenticated,
    currentMember,
    currentView,
    adsterraConfig,
    loginAdmin
  } = useApp();

  const [isAdblockDetected, setIsAdblockDetected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [hasCheckedOnce, setHasCheckedOnce] = useState<boolean>(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [justUnblocked, setJustUnblocked] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'ublock' | 'adblock' | 'brave' | 'adguard'>('ublock');

  // Admin inline bypass modal/form
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string>('adam');
  const [adminPass, setAdminPass] = useState<string>('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoggingIn, setAdminLoggingIn] = useState<boolean>(false);

  const baitElementRef = useRef<HTMLDivElement | null>(null);

  // If user is admin (authenticated, role admin, adam, or on admin view), never block them!
  const isUserAdmin = Boolean(
    isAdminAuthenticated ||
    currentMember?.role === 'admin' ||
    currentMember?.username?.toLowerCase() === 'adam' ||
    currentMember?.username?.toLowerCase() === 'admin' ||
    currentMember?.email?.toLowerCase().includes('adam') ||
    currentView === 'admin'
  );

  // Core detection routine
  const runDetection = useCallback(async (): Promise<boolean> => {
    // If admin, always report false (exempt)
    if (isUserAdmin) {
      return false;
    }

    // Only skip if explicitly disabled in adsterra settings
    if (adsterraConfig.antiAdblockEnabled === false) {
      return false;
    }

    let detected = false;

    // Check 1: DOM Bait elements check (cosmetic filters immediately hide or collapse elements matching ad selectors)
    try {
      const bait = document.createElement('div');
      bait.className = 'adsbox ad-placement adsbygoogle adsterra_banner textads banner-ads banner_ads ad-zone doubleclick pub_300x250 pub_728x90 ad-slot google-ad ad-banner';
      bait.id = 'ad-banner-detector-slot';
      bait.setAttribute('aria-hidden', 'true');
      bait.style.position = 'absolute';
      bait.style.left = '-9999px';
      bait.style.top = '-9999px';
      bait.style.width = '300px';
      bait.style.height = '250px';
      bait.style.pointerEvents = 'none';
      bait.innerHTML = '&nbsp;';
      document.body.appendChild(bait);

      // Allow microtask/render cycle for cosmetic filter rules to apply
      await new Promise((r) => setTimeout(r, 60));

      const style = window.getComputedStyle(bait);
      if (
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        bait.offsetWidth === 0 ||
        bait.clientHeight === 0 ||
        style.display === 'none' ||
        style.visibility === 'hidden'
      ) {
        detected = true;
      }
      bait.remove();
    } catch {
      // ignore
    }

    // Check 2: Script execution probe to /ads.js (All standard ad blockers block script files named ads.js)
    if (!detected) {
      try {
        await new Promise<void>((resolve) => {
          const testScript = document.createElement('script');
          testScript.src = '/ads.js?cache=' + Date.now();
          testScript.async = true;
          testScript.onload = () => {
            // Check if window.__easyacss_ads_allowed was set by ads.js
            if ((window as any).__easyacss_ads_allowed !== true) {
              detected = true;
            }
            testScript.remove();
            resolve();
          };
          testScript.onerror = () => {
            // Script was intercepted / blocked by ad blocker
            detected = true;
            testScript.remove();
            resolve();
          };
          document.head.appendChild(testScript);
          setTimeout(() => {
            testScript.remove();
            resolve();
          }, 600);
        });
      } catch {
        detected = true;
      }
    }

    // Check 3: Fetch probe to /ads.js
    if (!detected) {
      try {
        const res = await fetch('/ads.js?t=' + Date.now(), {
          method: 'GET',
          cache: 'no-store'
        });
        if (!res.ok) {
          detected = true;
        }
      } catch {
        // Network error caused by browser ad blocker blocking /ads.js
        detected = true;
      }
    }

    // Check 4: Remote ad network domain probe (uBlock Origin, AdGuard, Brave, Pi-hole, AdBlock Plus)
    if (!detected) {
      try {
        const probeUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        await fetch(new Request(probeUrl, { method: 'HEAD', mode: 'no-cors' }));
      } catch {
        // Network request to Google ad server was blocked by browser ad blocker
        detected = true;
      }
    }

    // Check 5: Secondary ad probe for Brave Shields & aggressive DNS ad blockers
    if (!detected) {
      try {
        const doubleclickProbe = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
        await fetch(new Request(doubleclickProbe, { method: 'HEAD', mode: 'no-cors' }));
      } catch {
        detected = true;
      }
    }

    return detected;
  }, [isUserAdmin, adsterraConfig.antiAdblockEnabled]);

  // Initial detection on mount
  useEffect(() => {
    if (isUserAdmin) {
      setIsAdblockDetected(false);
      setIsChecking(false);
      return;
    }

    let isMounted = true;
    setIsChecking(true);

    const check = async () => {
      const blocked = await runDetection();
      if (isMounted) {
        setIsAdblockDetected(blocked);
        setIsChecking(false);
        setHasCheckedOnce(true);
      }
    };

    const timer = setTimeout(check, 150);
    // Recurring watchdog check every 5 seconds to ensure visitor hasn't re-enabled adblock
    const interval = setInterval(async () => {
      if (isMounted && !isUserAdmin) {
        const isStillBlocked = await runDetection();
        if (isMounted) {
          setIsAdblockDetected(isStillBlocked);
        }
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isUserAdmin, runDetection]);

  // Handle re-checking when user clicks "I've Disabled It"
  const handleRecheck = async () => {
    setIsChecking(true);
    setCheckError(null);

    // Wait a brief moment to show check animation
    await new Promise((r) => setTimeout(r, 600));

    const blocked = await runDetection();
    setIsChecking(false);

    if (blocked) {
      setIsAdblockDetected(true);
      setCheckError('Ad blocker is still detected! Please make sure your ad blocker or browser shield is completely paused for this site, then try again.');
    } else {
      setJustUnblocked(true);
      setTimeout(() => {
        setIsAdblockDetected(false);
        setJustUnblocked(false);
      }, 500);
    }
  };

  // Lock background scrolling when adblock barrier is active to prevent any access to the site
  useEffect(() => {
    if (isAdblockDetected && !isUserAdmin) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAdblockDetected, isUserAdmin]);

  // When user switches back to this tab after disabling their ad blocker, auto re-check
  useEffect(() => {
    const handleWindowFocus = () => {
      if (!isUserAdmin && isAdblockDetected) {
        handleRecheck();
      }
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isUserAdmin, isAdblockDetected]);

  // Handle Admin login inline
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoggingIn(true);

    setTimeout(() => {
      const res = loginAdmin(adminUser, adminPass);
      setAdminLoggingIn(false);
      if (res.success) {
        setShowAdminLogin(false);
        setIsAdblockDetected(false);
      } else {
        setAdminError(res.message || 'Invalid administrator password.');
      }
    }, 300);
  };

  // If user is Admin or anti-adblock is turned off, do not render anything
  if (isUserAdmin || adsterraConfig.antiAdblockEnabled === false) {
    return null;
  }

  // If not detected and not checking, don't show barrier
  if (!isAdblockDetected && !justUnblocked) {
    return null;
  }

  return (
    <div
      id="easyacss-anti-adblock-barrier"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-[#07080c]/96 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300 select-none"
    >
      <div className="relative w-full max-w-xl my-auto rounded-3xl bg-[#0c0e15] border border-red-500/30 p-6 sm:p-8 shadow-2xl shadow-red-950/40 text-center">
        
        {/* Top Glowing Shield Icon */}
        <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-red-500/15 blur-xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 via-[#18111e] to-red-600/10 border border-red-500/40 flex items-center justify-center shadow-lg shadow-red-500/20 text-red-400">
            {justUnblocked ? (
              <ShieldCheck className="w-9 h-9 text-emerald-400 animate-bounce" />
            ) : (
              <ShieldAlert className="w-9 h-9 text-red-400" />
            )}
          </div>
        </div>

        {/* Brand & Badge */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider uppercase bg-red-500/10 border border-red-500/30 text-red-400">
            Ad Blocker Detected
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight mb-2">
          {justUnblocked ? 'Access Granted!' : 'Please Disable Your Ad Blocker'}
        </h2>

        {/* Notice description */}
        <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto mb-6">
          {justUnblocked ? (
            <span className="text-emerald-400 font-medium">
              Thank you! Your ad blocker is paused. Loading EasyAcss catalog...
            </span>
          ) : (
            <>
              EasyAcss provides <strong>100% free Steam accounts</strong>, instant 2FA unlocks, and daily server verifications funded entirely by non-intrusive advertisements. To access our accounts catalog and free credentials, please whitelist or pause your ad blocker for this site.
            </>
          )}
        </p>

        {/* If error on recheck */}
        {checkError && !justUnblocked && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5 text-left animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{checkError}</span>
          </div>
        )}

        {/* Step-by-Step Whitelisting Instructions */}
        {!justUnblocked && (
          <div className="mb-6 text-left rounded-2xl bg-[#121520] border border-white/[0.08] p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                How to turn it off:
              </span>
              
              {/* Tab Selector */}
              <div className="flex items-center gap-1">
                {(['ublock', 'adblock', 'brave', 'adguard'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveGuideTab(tab)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      activeGuideTab === tab
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    {tab === 'ublock' ? 'uBlock' : tab === 'adblock' ? 'AdBlock' : tab === 'brave' ? 'Brave' : 'AdGuard'}
                  </button>
                ))}
              </div>
            </div>

            {/* Guide Details */}
            <div className="text-xs text-slate-300 space-y-2 font-sans">
              {activeGuideTab === 'ublock' && (
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Click the <strong>uBlock Origin</strong> shield icon in your browser toolbar.</li>
                  <li>Click the big blue <strong>Power icon</strong> (turn it off for this domain).</li>
                  <li>Click the button below: <strong>"I've Disabled AdBlock"</strong>.</li>
                </ol>
              )}
              {activeGuideTab === 'adblock' && (
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Click the <strong>AdBlock / ABP</strong> icon in your browser extensions bar.</li>
                  <li>Click <strong>"Pause on this site"</strong> or toggle <strong>"Enabled on this site"</strong> to OFF.</li>
                  <li>Click the button below: <strong>"I've Disabled AdBlock"</strong>.</li>
                </ol>
              )}
              {activeGuideTab === 'brave' && (
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Click the <strong>Brave Lion Shield</strong> icon at the right edge of the address bar.</li>
                  <li>Toggle the main switch from <strong>"Shields UP"</strong> to <strong>"Shields DOWN"</strong>.</li>
                  <li>Click the button below: <strong>"I've Disabled AdBlock"</strong>.</li>
                </ol>
              )}
              {activeGuideTab === 'adguard' && (
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Click the <strong>AdGuard</strong> icon in your browser.</li>
                  <li>Toggle protection switch to <strong>Pause / Off</strong> for this website.</li>
                  <li>Click the button below: <strong>"I've Disabled AdBlock"</strong>.</li>
                </ol>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRecheck}
            disabled={isChecking || justUnblocked}
            className={`w-full py-3.5 px-6 rounded-2xl font-sans text-sm font-bold tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
              justUnblocked
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-red-600 via-purple-600 to-purple-700 hover:from-red-500 hover:via-purple-500 hover:to-purple-600 text-white shadow-purple-900/40 active:scale-[0.98]'
            }`}
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Checking Ad Delivery Status...</span>
              </>
            ) : justUnblocked ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Unblocked! Entering site...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>I've Disabled AdBlock — Re-check & Enter</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
          >
            Or Reload the Page (Ctrl + R / F5)
          </button>
        </div>

        {/* Admin Bypass Link: Admins never see adblocker barrier once logged in */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>EasyAcss Secure Shield</span>
          <button
            onClick={() => setShowAdminLogin((prev) => !prev)}
            className="text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>Admin Sign In</span>
            {showAdminLogin ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Inline Admin Login Form if admin is logging in from blocked browser */}
        {showAdminLogin && (
          <div className="mt-4 p-4 rounded-2xl bg-[#141824] border border-purple-500/30 text-left animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5 text-purple-400" />
                <span>Administrator Verification</span>
              </span>
              <span className="text-[10px] text-purple-300 font-mono">Instant Bypass</span>
            </div>

            {adminError && (
              <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-[11px] text-red-300">
                {adminError}
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="adam"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0c0e15] border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0c0e15] border border-white/10 text-white text-xs outline-none focus:border-purple-500 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={adminLoggingIn}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-purple-600/30 active:scale-95"
              >
                {adminLoggingIn ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Verify Admin Access & Enter</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
