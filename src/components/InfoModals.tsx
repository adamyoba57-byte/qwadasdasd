import React from 'react';
import {
  X,
  Shield,
  BookOpen,
  Gift,
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Gamepad2,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0e1118] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans tracking-wide">
                Community & Account Rules
              </h2>
              <p className="text-xs text-slate-400">Guidelines for uninterrupted gaming</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-slate-300 font-sans leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">1. Always Play in Steam Offline Mode</span>
              <p className="text-slate-300 text-[11px]">
                After downloading your game, click "Steam" in the top-left menu and select "Go Offline". This ensures multiple members can play simultaneously without kickouts.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-300 block mb-0.5">2. Do Not Alter Account Credentials</span>
              <p className="text-slate-300 text-[11px]">
                Changing passwords, email addresses, or Steam Guard configurations will trigger an immediate permanent IP ban and account lock.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-300 block mb-0.5">3. 100% Free & Restocked Daily</span>
              <p className="text-slate-300 text-[11px]">
                Standard accounts are sponsored through verified shortlinks. No hidden subscriptions or charges are required.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/20 flex items-start gap-3">
            <Gamepad2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-300 block mb-0.5">4. Cloud Saves & Achievements</span>
              <p className="text-slate-300 text-[11px]">
                Your game progress is saved locally on your machine in offline mode so your personal campaign saves are safe.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  );
};

export const GuidesModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0e1118] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans tracking-wide">
                How to Claim & Play Guide
              </h2>
              <p className="text-xs text-slate-400">Quick 3-step setup walkthrough</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300 font-sans leading-relaxed">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h3 className="font-bold text-white text-sm">Select Your Game</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Browse our catalog of over 120+ verified games. Click on any poster to view details, included DLCs, and ready status.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h3 className="font-bold text-white text-sm">Claim & Unlock Access</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Click the "Claim Account" button. Complete the quick sponsor step to support our servers and immediately view the username and password.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h3 className="font-bold text-white text-sm">Sign In on Steam & Go Offline</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Open Steam client, login with credentials, click library, install your game, then switch to Steam Offline mode to enjoy infinite uninterrupted gameplay!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
        >
          Got it, take me back
        </button>
      </div>
    </div>
  );
};

export const WeeklyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { accounts, openClaimPage } = useApp();
  if (!isOpen) return null;

  const weeklyGames = accounts.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#0e1118] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans tracking-wide">
                Weekly Featured Drop
              </h2>
              <p className="text-xs text-amber-400 font-mono">Restocked & active for 7 days</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {weeklyGames.map((game) => (
            <div
              key={game.id}
              onClick={() => {
                onClose();
                openClaimPage(game.id);
              }}
              className="group p-2 rounded-xl bg-white/[0.03] hover:bg-purple-950/30 border border-white/5 hover:border-purple-500/40 cursor-pointer transition-all flex flex-col"
            >
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-black/40 mb-2 relative">
                <img
                  src={game.coverImage}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-black">
                  DROP
                </span>
              </div>
              <span className="text-xs font-bold text-white truncate group-hover:text-purple-300">
                {game.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                Free Claim Available
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
