import React, { useState, useEffect } from 'react';
import { GameAccount } from '../types';
import { useApp } from '../context/AppContext';
import { Heart } from 'lucide-react';

interface AccountCardProps {
  account: GameAccount;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const { openClaimPage, toggleFavorite, user, currentMember } = useApp();
  const isFavorited = (currentMember?.favorites || user.favorites).includes(account.id);
  const [imgSrc, setImgSrc] = useState(account.coverImage);

  // Sync state if account coverImage prop updates (e.g., after editing/uploading)
  useEffect(() => {
    setImgSrc(account.coverImage);
  }, [account.coverImage]);

  // Fallback poster generator if image link is broken
  const handleImageError = () => {
    setImgSrc(
      `https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80`
    );
  };

  return (
    <div
      id={`account-card-${account.id}`}
      onClick={() => openClaimPage(account.id)}
      className="group relative flex flex-col bg-[#0e1118] hover:bg-[#131724] border border-white/[0.07] hover:border-purple-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-600/10 cursor-pointer"
    >
      {/* Poster Cover Container - vertical aspect-[3/4] matching screenshot */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#161a24]">
        <img
          src={imgSrc}
          alt={account.title}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Subtle Dark Gradient at bottom of poster */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1118]/80 via-transparent to-black/30 pointer-events-none" />

        {/* Top-Left Circular Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(account.id);
          }}
          className="absolute top-2.5 left-2.5 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-rose-400 transition-colors shadow-sm"
          title="Add to Favorites"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isFavorited ? 'fill-rose-500 text-rose-500' : 'text-white/80'
            }`}
          />
        </button>

        {/* Top-Right Badge: NEW (cyan) or HOT/FEATURED */}
        {account.isNew ? (
          <span className="absolute top-2.5 right-2.5 z-20 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#00c8c8] text-black shadow-md">
            NEW
          </span>
        ) : account.featured ? (
          <span className="absolute top-2.5 right-2.5 z-20 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-600/90 text-white shadow-md backdrop-blur-sm border border-purple-400/30">
            HOT
          </span>
        ) : null}
      </div>

      {/* Card Info Box - minimal, clean, high-contrast typography */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 bg-[#0e1118]">
        {/* Game Title */}
        <h3
          className="text-sm font-bold text-white truncate font-sans tracking-tight mb-2 group-hover:text-purple-300 transition-colors"
          title={account.title}
        >
          {account.title}
        </h3>

        {/* Sub-row: Platform indicator on left, FREE badge on right */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-slate-400 font-sans text-xs">
            <span className="w-2 h-2 rounded-full border border-slate-400 inline-block shrink-0" />
            <span className="text-[11px] text-slate-300 font-medium truncate max-w-[110px]">
              {account.platform === 'Steam'
                ? 'Steam Offline'
                : account.platform === 'Xbox'
                ? 'Xbox Game Pass'
                : account.platform === 'Cookies'
                ? 'Premium Cookie'
                : `${account.platform} Offline`}
            </span>
          </div>

          <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 tracking-wider shrink-0">
            FREE
          </span>
        </div>
      </div>
    </div>
  );
};

