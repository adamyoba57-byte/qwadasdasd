import React from 'react';
import { useApp } from '../context/AppContext';
import { Crown, Check, Sparkles, Zap, Shield, X, ArrowRight } from 'lucide-react';
import { VIPTier } from '../types';

export const BuyVIPModal: React.FC = () => {
  const { isBuyVipModalOpen, setIsBuyVipModalOpen, vipTiers, upgradeToVip, user } = useApp();

  if (!isBuyVipModalOpen) return null;

  const handleSelectTier = (tier: VIPTier) => {
    upgradeToVip(tier);
    setIsBuyVipModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#0e111a] border border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-950/40 overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="p-6 md:p-8 text-center relative border-b border-slate-800">
          <button
            onClick={() => setIsBuyVipModalOpen(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs mb-3">
            <Crown className="w-3.5 h-3.5 fill-amber-400" />
            <span>VIP MEMBERSHIP ACCESS</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-gaming text-white tracking-wide">
            UPGRADE TO EASYACSS VIP
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
            Skip all shortlink sponsor ads, bypass wait times, unlock Day-1 AAA game releases, and get priority 2FA Steam Guard generators.
          </p>

          {user.isVip && (
            <div className="mt-3 inline-block px-4 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
              ✓ You currently have VIP Active ({user.vipTierName})
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {vipTiers.map((tier) => {
            const isPopular = tier.popular;
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? 'bg-gradient-to-b from-[#1c1a2e] to-[#12151e] border-2 border-amber-500/80 shadow-xl shadow-amber-950/30 scale-105'
                    : 'bg-[#12151e] border border-slate-800 hover:border-purple-500/40'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-gaming text-[10px] font-black uppercase tracking-wider shadow-md">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white font-gaming">{tier.name}</h3>
                    <Crown className={`w-4 h-4 ${isPopular ? 'text-amber-400' : 'text-slate-500'}`} />
                  </div>

                  <div className="mt-4 mb-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black font-gaming text-white">
                      ${((tier as any).price ?? tier.priceUSD ?? 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      / {tier.durationDays > 365 ? 'Lifetime' : `${tier.durationDays} days`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono mb-4">
                    Instant automated activation
                  </p>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleSelectTier(tier)}
                    className={`w-full py-3 rounded-xl font-gaming text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                      isPopular
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    <span>Activate {tier.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Guarantee Bar */}
        <div className="p-6 bg-[#0a0c10] border-t border-slate-800 flex flex-wrap items-center justify-around gap-4 text-xs font-mono text-slate-400 text-center">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Instant Zero-Wait Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>24/7 Account Restock Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Ad-Free Clean Experience</span>
          </div>
        </div>
      </div>
    </div>
  );
};
