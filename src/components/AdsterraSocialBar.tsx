import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, X, ExternalLink, Flame, Gamepad2, Gift } from 'lucide-react';

const SOCIAL_BAR_NOTIFICATIONS = [
  {
    icon: Gift,
    title: '🎁 New Steam Key Drop Added!',
    subtitle: 'Over 40+ Cyberpunk & Black Myth: Wukong accounts restocked.',
    badge: 'JUST NOW',
    cta: 'Claim Key'
  },
  {
    icon: Flame,
    title: '🔥 Free $50 Steam Wallet Drop',
    subtitle: 'Limited sponsor event: 100% free gift card voucher for gamers.',
    badge: 'HOT SPONSOR',
    cta: 'Claim Voucher'
  },
  {
    icon: Gamepad2,
    title: '⚡ GTA V Criminal Enterprise Vault',
    subtitle: 'Instant credentials with offline guard code verified 1 min ago.',
    badge: 'EXCLUSIVE',
    cta: 'Unlock Access'
  }
];

export const AdsterraSocialBar: React.FC = () => {
  const { adsterraConfig, user, triggerPopunder } = useApp();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [currentPromoIndex, setCurrentPromoIndex] = useState<number>(0);

  useEffect(() => {
    if (!adsterraConfig.enabled || !adsterraConfig.socialBarEnabled || !adsterraConfig.directLinkUrl?.trim() || user.isVip) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % SOCIAL_BAR_NOTIFICATIONS.length);
    }, 9000);

    return () => clearInterval(interval);
  }, [adsterraConfig.enabled, adsterraConfig.socialBarEnabled, adsterraConfig.directLinkUrl, user.isVip]);

  const directUrl = adsterraConfig.directLinkUrl?.trim() || '';

  if (!adsterraConfig.enabled || !adsterraConfig.socialBarEnabled || !directUrl || !directUrl.startsWith('http') || isDismissed || user.isVip) {
    return null;
  }

  const handleClick = () => {
    window.open(directUrl, '_blank', 'noopener,noreferrer');
    if (adsterraConfig.popunderEnabled) {
      triggerPopunder();
    }
  };

  const promo = SOCIAL_BAR_NOTIFICATIONS[currentPromoIndex];
  const IconComponent = promo.icon;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-96 animate-in slide-in-from-bottom-5 duration-300">
      <div className="relative rounded-2xl bg-[#121522]/95 border border-purple-500/40 p-3.5 shadow-2xl shadow-purple-950/40 backdrop-blur-md">
        {/* Top bar */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-slate-200">ADSTERRA SOCIAL BAR</span>
            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold">
              {promo.badge}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Dismiss Notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content clickable */}
        <div
          onClick={handleClick}
          className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-xl hover:bg-slate-800/40 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <IconComponent className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-white group-hover:text-purple-300 transition-colors truncate">
              {promo.title}
            </h4>
            <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
              {promo.subtitle}
            </p>
          </div>

          <button
            type="button"
            className="shrink-0 px-3 py-1.5 rounded-lg bg-purple-600 group-hover:bg-purple-500 text-white text-[11px] font-gaming font-bold flex items-center gap-1 shadow-md shadow-purple-600/30 transition-all"
          >
            <span>{promo.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
