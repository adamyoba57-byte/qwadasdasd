import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GameAccount } from '../types';
import { AdBannerSlot } from './AdBannerSlot';
import { ShieldCheck, Timer, ArrowRight, Sparkles, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ShortlinkModalProps {
  account: GameAccount;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ShortlinkModal: React.FC<ShortlinkModalProps> = ({ account, isOpen, onClose, onComplete }) => {
  const { shortlinkConfig, setIsBuyVipModalOpen, triggerPopunder } = useApp();

  const effectiveTimer = account.linkConfig?.timerSeconds ?? shortlinkConfig.timerSeconds ?? 8;
  const effectiveProvider = (account.linkConfig?.provider && account.linkConfig.provider !== 'global')
    ? account.linkConfig.provider
    : shortlinkConfig.provider;
  const effectiveLinkUrl = account.linkConfig?.customShortlinkUrl || `${shortlinkConfig.domain}/claim?acc=${account.id}`;

  const [secondsLeft, setSecondsLeft] = useState<number>(effectiveTimer);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [popunderTriggered, setPopunderTriggered] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    setSecondsLeft(effectiveTimer);
    setIsReady(false);
    setPopunderTriggered(false);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, effectiveTimer]);

  if (!isOpen) return null;

  const handleProceed = () => {
    onComplete();
  };

  const progressPercent = Math.max(0, Math.min(100, Math.round(((effectiveTimer - secondsLeft) / effectiveTimer) * 100)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e111a] border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-950/40 overflow-hidden">
        {/* Header bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-950/40 via-[#141824] to-[#0e111a] border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-300">
              Sponsor Shortlink Gateway • {effectiveProvider.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Target Account Info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 mb-5">
            <img
              src={account.coverImage}
              alt={account.title}
              className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                {account.platform}
              </span>
              <h4 className="text-sm font-semibold text-white truncate mt-1">{account.title}</h4>
            </div>
          </div>

          {/* Countdown & Progress */}
          <div className="text-center my-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/20 to-blue-600/20 border border-purple-500/30 mb-3 relative">
              {isReady ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
              ) : (
                <Timer className="w-8 h-8 text-purple-400 animate-pulse" />
              )}
            </div>

            <h3 className="text-lg font-bold text-white font-gaming">
              {isReady ? 'Your Secure Access Link Is Ready!' : 'Generating Account Credentials...'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {isReady
                ? 'Thank you for supporting our free game servers via our verified sponsor.'
                : `Please wait ${secondsLeft} seconds while our cloud server synchronizes with Steam Guard.`}
            </p>

            {/* Progress Bar */}
            <div className="mt-4 w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>Cloudflare SSL Checked</span>
              <span>{progressPercent}% Complete</span>
            </div>
          </div>

          {/* Adsterra Middle Sponsor Slot */}
          <AdBannerSlot type="468x60" position="modal" className="my-4" />

          {/* Action button */}
          <div className="space-y-3">
            <button
              onClick={handleProceed}
              disabled={!isReady}
              className={`w-full py-3.5 px-4 rounded-xl font-bold font-gaming tracking-wide text-sm flex items-center justify-center gap-2 transition-all ${
                isReady
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isReady ? (
                <>
                  GET CREDENTIALS NOW <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Timer className="w-4 h-4 animate-spin" /> Unlocking in {secondsLeft}s...
                </>
              )}
            </button>

            {/* VIP Upsell inside modal */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Tired of waiting for shortlinks?
              </span>
              <button
                onClick={() => {
                  onClose();
                  setIsBuyVipModalOpen(true);
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                Go VIP to Skip Ads
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
