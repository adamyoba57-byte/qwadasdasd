import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Sparkles, ExternalLink, Info, Flame, Zap, Award, Crown } from 'lucide-react';

interface AdBannerSlotProps {
  type: '728x90' | '300x250' | 'native-card' | '468x60' | 'native-banner';
  position?: 'top' | 'bottom' | 'sidebar' | 'in-feed' | 'modal' | 'home';
  className?: string;
}

export const AdFrame: React.FC<{
  code: string;
  type: '728x90' | '300x250' | 'native-card' | '468x60' | 'native-banner';
  position?: string;
  className?: string;
}> = ({ code, type, position, className = '' }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const dimensions = React.useMemo(() => {
    switch (type) {
      case '728x90':
        return { width: '728px', height: '90px' };
      case '300x250':
        return { width: '300px', height: '250px' };
      case '468x60':
        return { width: '468px', height: '60px' };
      case 'native-banner':
        return { width: '100%', height: '360px' };
      case 'native-card':
      default:
        return { width: '100%', height: '300px' };
    }
  }, [type]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    let rawCode = (code || '').trim();
    if (!rawCode) return;

    // 1. If it's a direct URL or script URL without HTML tags
    if (!rawCode.includes('<') && (rawCode.startsWith('http://') || rawCode.startsWith('https://') || rawCode.startsWith('//'))) {
      const fullUrl = rawCode.startsWith('//') ? `https:${rawCode}` : rawCode;
      if (fullUrl.endsWith('.js') || fullUrl.includes('/invoke.js') || fullUrl.includes('profitablecpmrate') || fullUrl.includes('topcreativeformat') || fullUrl.includes('highperformanceformat')) {
        rawCode = `<script type="text/javascript" src="${fullUrl}"></script>`;
      } else {
        rawCode = `<iframe src="${fullUrl}" width="100%" height="100%" frameborder="0" scrolling="no"></iframe>`;
      }
    } else if (!rawCode.includes('<script') && rawCode.includes('atOptions')) {
      rawCode = `<script type="text/javascript">${rawCode}</script>`;
    }

    // 2. Convert any protocol-relative src="//..." or href="//..." to https://
    rawCode = rawCode.replace(/(src|href)=["']\/\/([^"']+)["']/gi, '$1="https://$2"');
    rawCode = rawCode.replace(/(src|href)=\/\/([^\s>]+)/gi, '$1="https://$2"');

    // 3. Create fresh iframe for isolated script execution and document.write support
    const iframe = document.createElement('iframe');
    iframe.title = `Adsterra Ad ${type} ${position || ''}`;
    iframe.style.width = dimensions.width;
    iframe.style.maxWidth = '100%';
    iframe.style.height = dimensions.height;
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.scrolling = 'no';
    iframe.setAttribute('frameBorder', '0');

    container.appendChild(iframe);

    const docContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base target="_blank">
    <style>
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: transparent !important;
        overflow: hidden !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      iframe {
        max-width: 100% !important;
      }
    </style>
  </head>
  <body>
    ${rawCode}
  </body>
</html>`;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(docContent);
        doc.close();
      } else {
        iframe.srcdoc = docContent;
      }
    } catch (e) {
      console.warn('Iframe doc write failed, using srcdoc:', e);
      iframe.srcdoc = docContent;
    }
  }, [code, dimensions, position, type]);

  return (
    <div className={`relative overflow-hidden flex justify-center items-center my-2 text-center ${className}`}>
      <div ref={containerRef} className="flex justify-center items-center overflow-hidden min-h-[50px] w-full" />
    </div>
  );
};

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({ type, position = 'top', className = '' }) => {
  const { adsterraConfig, setCurrentView, user, triggerPopunder } = useApp();

  // If VIP user and bypass is enabled, render nothing or VIP notification
  if (user.isVip) {
    return (
      <div className={`w-full py-2 px-4 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-center justify-between text-xs text-purple-300/80 ${className}`}>
        <span className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          VIP Ad-Shield Active: All Adsterra banners and popunders are disabled for your account.
        </span>
        <span className="font-mono font-medium text-purple-400">VIP_AD_BLOCKED</span>
      </div>
    );
  }

  // Check for custom script/HTML code from admin settings
  let customCode = '';
  if (type === '728x90') {
    if (position === 'top' && adsterraConfig.banner728x90Top?.trim()) {
      customCode = adsterraConfig.banner728x90Top.trim();
    } else if (position === 'bottom' && adsterraConfig.banner728x90Bottom?.trim()) {
      customCode = adsterraConfig.banner728x90Bottom.trim();
    }
  } else if (type === '300x250') {
    if (adsterraConfig.banner300x250Sidebar?.trim()) {
      customCode = adsterraConfig.banner300x250Sidebar.trim();
    }
  } else if (type === '468x60') {
    if (adsterraConfig.banner468x60Claim?.trim()) {
      customCode = adsterraConfig.banner468x60Claim.trim();
    }
  } else if (type === 'native-card' || type === 'native-banner') {
    if (adsterraConfig.nativeBannerCode?.trim()) {
      customCode = adsterraConfig.nativeBannerCode.trim();
    }
  }

  // If custom code is provided, ALWAYS render it using the robust AdFrame renderer!
  if (customCode) {
    return (
      <AdFrame
        code={customCode}
        type={type}
        position={position}
        className={className}
      />
    );
  }

  // If monetization is paused, or if the user hasn't configured any real ad code/link,
  // completely hide the ad slot so no simulated ads or banners appear!
  const directUrl = adsterraConfig.directLinkUrl?.trim() || '';
  if (!adsterraConfig.enabled || !directUrl || !directUrl.startsWith('http')) {
    return null;
  }

  const handleAdClick = (e: React.MouseEvent) => {
    if (directUrl && directUrl.startsWith('http')) {
      window.open(directUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // ============================================================================
  // NATIVE BANNER (Full 4-item responsive widget for Home page / Large slots)
  // ============================================================================
  if (type === 'native-banner') {
    const nativeItems = [
      {
        id: 'nb-1',
        tag: 'Instant Unlock',
        title: 'Free $50 Steam Wallet & CS2 Cases',
        desc: 'Claim official wallet codes and prime status passes without payment.',
        badge: 'Top Pick',
        icon: Award,
        color: 'from-purple-600 to-indigo-600'
      },
      {
        id: 'nb-2',
        tag: 'Unlimited Pass',
        title: 'Xbox Game Pass Ultimate 3-Months',
        desc: 'Play over 400+ AAA games on PC and Cloud with zero subscription fee.',
        badge: 'Hot Deal',
        icon: Flame,
        color: 'from-emerald-600 to-teal-600'
      },
      {
        id: 'nb-3',
        tag: 'Ultra Fast',
        title: 'Gaming VPN & Low Ping Nodes',
        desc: 'Bypass ISP throttling and geo-restrictions with 10Gbps gaming servers.',
        badge: 'Popular',
        icon: Zap,
        color: 'from-blue-600 to-cyan-600'
      },
      {
        id: 'nb-4',
        tag: 'VIP Reward',
        title: 'Exclusive Discord Nitro & Perks',
        desc: 'Get custom emojis, 4K 60FPS streaming and double server boosts.',
        badge: 'Bonus',
        icon: Crown,
        color: 'from-pink-600 to-rose-600'
      }
    ];

    return (
      <div className={`relative rounded-2xl bg-[#0b0d14] border border-purple-500/25 p-4 sm:p-5 shadow-2xl ${className}`}>
        {/* Banner Top Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Sponsored Gaming Offers & Rewards
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Sponsored
          </span>
        </div>

        {/* 4 Native Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {nativeItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={handleAdClick}
                className="group relative rounded-xl bg-[#121520] hover:bg-[#181d2c] border border-white/[0.08] hover:border-purple-500/50 p-4 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-purple-950/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                      {item.tag}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                      {item.badge}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-bold text-purple-400 group-hover:text-purple-300">
                  <span>Claim Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================================================
  // NATIVE IN-FEED CARD (Renders seamlessly inside catalog account grids)
  // ============================================================================
  if (type === 'native-card') {
    return (
      <div
        onClick={handleAdClick}
        className={`group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#161a29] to-[#0d0f18] border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 shadow-xl hover:shadow-purple-600/20 cursor-pointer flex flex-col justify-between ${className}`}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-purple-900/60 via-indigo-950 to-[#0a0c12] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between z-10">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-600 text-white shadow-md shadow-purple-600/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> ADSTERRA SPONSOR
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> HOT BONUS
            </span>
          </div>

          <div className="text-center z-10 py-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/40 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 text-white" />
            </div>
            <p className="font-gaming text-sm font-black text-white mt-2 tracking-wide">
              $50 STEAM WALLET & CS2 KEYS
            </p>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-[#161a29] via-transparent to-transparent opacity-90" />
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
              <span className="text-purple-400 font-bold">Featured Partner</span>
              <span className="text-emerald-400 font-bold">100% Free Bonus</span>
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
              Claim Free Gaming Pass & Steam Wallet Code
            </h4>
            <p className="text-xs text-slate-400 line-clamp-2 mt-1">
              Unlock exclusive in-game items, free Steam gift cards, and high-speed VPN gaming nodes instantly.
            </p>
          </div>

          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-gaming text-xs font-bold tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/25 group-hover:shadow-purple-600/40 active:scale-95 transition-all"
          >
            <span>Claim Sponsor Reward</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 728x90 LEADERBOARD BANNER (Top / Bottom)
  // ============================================================================
  if (type === '728x90') {
    return (
      <div
        onClick={handleAdClick}
        className={`group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#121520] via-[#1a1f33] to-[#121520] border border-purple-500/25 hover:border-purple-500/50 shadow-xl shadow-purple-950/20 p-3 text-center cursor-pointer transition-all duration-300 hover:shadow-purple-600/10 ${className}`}
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-mono mb-2 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-300">Adsterra Sponsored Network</span>
            <span className="text-slate-600">•</span>
            <span className="text-purple-400">728x90 Leaderboard</span>
          </span>
          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold">
            ADS ACTIVE
          </span>
        </div>

        <div className="max-w-[728px] mx-auto min-h-[85px] flex flex-col md:flex-row items-center justify-between gap-4 p-3 bg-[#0d0f17]/90 rounded-xl border border-slate-800/80 group-hover:border-purple-500/40 transition-colors">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm text-white font-gaming tracking-wide">
                  VALORANT VP & CS2 SKINS GENERATOR
                </h4>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono font-bold">
                  VERIFIED SPONSOR
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Unlock instant Dragon Lore knife cases, 50$ Steam wallet vouchers, and permanent gaming boosts.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-400 font-bold">
              FREE INSTANT ACCESS
            </span>
            <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 group-hover:from-purple-500 group-hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30 active:scale-95">
              <span>Claim Free Drop</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 468x60 COMPACT BANNER (Inside verification panels / modals)
  // ============================================================================
  if (type === '468x60') {
    return (
      <div
        onClick={handleAdClick}
        className={`group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#141824] to-[#0e111a] border border-blue-500/20 hover:border-blue-500/50 p-2.5 cursor-pointer shadow-md transition-all ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white font-gaming">
                ULTRA HIGH-SPEED GAMING VPN (0 PING)
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Bypass geo-locks & secure steam logins • Free 30-Day Pass
              </p>
            </div>
          </div>
          <div className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 group-hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1">
            <span>Download</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 300x250 SIDEBAR & MODAL BANNER
  // ============================================================================
  return (
    <div
      onClick={handleAdClick}
      className={`w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#141826] via-[#10131e] to-[#0c0e16] border border-blue-500/25 hover:border-blue-500/50 shadow-xl p-3.5 text-center cursor-pointer transition-all duration-300 group ${className}`}
    >
      <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-mono mb-2 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Adsterra 300x250
        </span>
        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold">
          SPONSORED
        </span>
      </div>

      <div className="w-full min-h-[210px] flex flex-col items-center justify-center p-4 bg-[#0a0c13]/90 rounded-xl border border-slate-800/80 group-hover:border-blue-500/30 text-center transition-colors">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h4 className="font-semibold text-sm text-white font-gaming tracking-wide mb-1">
          HIGH-SPEED GAMING VPN & VAULT
        </h4>
        <p className="text-xs text-slate-300 mb-3.5 px-2 leading-relaxed">
          Bypass geo-restrictions, drop ping by 40%, and protect your real IP while claiming game vaults.
        </p>
        <div className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-500 group-hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/30 active:scale-95">
          <span>Download Free (0$ / Trial)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
