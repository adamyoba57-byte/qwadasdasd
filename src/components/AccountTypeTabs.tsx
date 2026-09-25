import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Crown, Sparkles } from 'lucide-react';

export const AccountTypeTabs: React.FC = () => {
  const { selectedAccountType, setSelectedAccountType, accounts, user, setIsBuyVipModalOpen } = useApp();

  const standardCount = accounts.filter(a => a.accountType === 'standard').length;
  const vipCount = accounts.filter(a => a.accountType === 'vip').length;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b border-slate-800/80 mb-6">
      {/* Switcher Buttons */}
      <div className="inline-flex p-1 rounded-xl bg-[#12151e] border border-slate-800 shadow-inner">
        <button
          id="tab-standard-accounts"
          onClick={() => setSelectedAccountType('standard')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-gaming text-xs md:text-sm font-bold tracking-wide transition-all ${
            selectedAccountType === 'standard'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Standard Accounts</span>
          <span
            className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono ${
              selectedAccountType === 'standard' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {standardCount}
          </span>
        </button>

        <button
          id="tab-vip-accounts"
          onClick={() => setSelectedAccountType('vip')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-gaming text-xs md:text-sm font-bold tracking-wide transition-all ${
            selectedAccountType === 'vip'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30'
              : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/20'
          }`}
        >
          <Crown className="w-4 h-4 fill-current" />
          <span>VIP Accounts</span>
          <span
            className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              selectedAccountType === 'vip' ? 'bg-slate-950/30 text-slate-950' : 'bg-amber-950/60 text-amber-300'
            }`}
          >
            {vipCount}
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            AAA Games
          </span>
        </button>
      </div>

      {/* Right VIP indicator / Upsell */}
      <div className="flex items-center gap-3">
        {user.isVip ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>VIP Active • {user.vipTierName || 'Full Access'}</span>
          </div>
        ) : (
          <button
            onClick={() => setIsBuyVipModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/30 text-amber-300 text-xs font-gaming font-semibold tracking-wide transition-all group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Want Instant Ad-Free Claims? Get VIP</span>
          </button>
        )}
      </div>
    </div>
  );
};
