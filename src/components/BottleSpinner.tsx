import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { sounds } from '../services/sound';
import { Sparkles } from 'lucide-react';

interface BottleSpinnerProps {
  players: Player[];
  onPlayerSelected: (player: Player) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  selectedPlayer: Player | null;
  disabled?: boolean;
  isVipSkin?: boolean;
}

export const BottleSpinner: React.FC<BottleSpinnerProps> = ({
  players,
  onPlayerSelected,
  isSpinning,
  setIsSpinning,
  selectedPlayer,
  disabled,
  isVipSkin
}) => {
  const [rotation, setRotation] = useState<number>(0);

  const spinBottle = () => {
    if (isSpinning || disabled || players.length === 0) return;

    setIsSpinning(true);
    sounds.spin();

    // Pick random winner
    const targetIndex = Math.floor(Math.random() * players.length);
    const sliceAngle = 360 / players.length;
    // Bottle points upward (0 deg), each player is positioned at index * sliceAngle
    // To point at player index, target angle = index * sliceAngle
    const fullSpins = (5 + Math.floor(Math.random() * 4)) * 360;
    const finalAngle = fullSpins + (targetIndex * sliceAngle);

    setRotation((prev) => prev + finalAngle);

    setTimeout(() => {
      setIsSpinning(false);
      sounds.click();
      sounds.suspense();
      onPlayerSelected(players[targetIndex]);
    }, 2800);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* VIP Skin Badge */}
      {isVipSkin && (
        <div className="mb-3 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 border border-amber-400/50 text-amber-300 font-bold text-xs shadow-lg shadow-amber-500/20 animate-pulse">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>24K GOLD STAR VIP BOTTLE ACTIVE</span>
        </div>
      )}

      {/* Table Container */}
      <div className={`relative h-[340px] w-[340px] sm:h-[400px] sm:w-[400px] rounded-full border transition-all duration-500 flex items-center justify-center ${
        isVipSkin
          ? 'border-amber-400/50 bg-gradient-to-b from-[#251505] to-[#0d0701] shadow-[0_0_100px_-10px_rgba(245,158,11,0.55)]'
          : 'border-purple-500/20 bg-gradient-to-b from-[#18112e] to-[#0d091a] shadow-[0_0_80px_-20px_rgba(168,85,247,0.35)]'
      }`}>
        {/* Table Felt Ring */}
        <div className={`absolute inset-4 rounded-full border transition-colors duration-500 ${
          isVipSkin
            ? 'border-amber-400/30 bg-gradient-to-b from-[#1c1004] to-[#080401]'
            : 'border-amber-500/15 bg-gradient-to-b from-[#130d24] to-[#080512]'
        }`} />
        
        {/* Center Table Coaster */}
        <div className={`absolute h-36 w-36 rounded-full border flex items-center justify-center shadow-inner transition-colors duration-500 ${
          isVipSkin
            ? 'border-amber-400/40 bg-amber-950/40 shadow-amber-500/20'
            : 'border-purple-400/20 bg-purple-950/30'
        }`}>
          <div className="h-24 w-24 rounded-full border border-dashed border-amber-400/30" />
        </div>

        {/* Players seated in circle */}
        {players.map((p, idx) => {
          const angle = (idx * (360 / players.length) - 90) * (Math.PI / 180);
          const radius = 135; // px from center
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isTarget = selectedPlayer?.id === p.id && !isSpinning;

          return (
            <div
              key={p.id}
              className={`absolute flex flex-col items-center transition-all duration-300 z-10 ${
                isTarget ? 'scale-110' : 'scale-100 opacity-90'
              }`}
              style={{
                transform: `translate(${x}px, ${y}px)`
              }}
            >
              <div
                className={`relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full text-base font-bold shadow-lg transition-all ${
                  isTarget
                    ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 shadow-amber-500/50 animate-bounce'
                    : 'border-2 border-purple-400/40 bg-gradient-to-br from-purple-700 to-indigo-900 text-white'
                }`}
              >
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  p.name.charAt(0)
                )}
                {isTarget && (
                  <span className="absolute -top-2 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] text-slate-950">
                    👑
                  </span>
                )}
              </div>
              <span className={`mt-1 max-w-[80px] truncate text-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                isTarget ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 bg-black/40'
              }`}>
                {p.name}
              </span>
            </div>
          );
        })}

        {/* The 3D-Styled Lagos Bottle (Green or 24K VIP Gold) */}
        <div
          className="relative z-20 transition-transform duration-[2800ms] cursor-pointer will-change-transform"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionTimingFunction: 'cubic-bezier(0.15, 0.85, 0.35, 1)'
          }}
          onClick={spinBottle}
        >
          {isVipSkin ? (
            /* VIP 24K GOLD STAR BOTTLE */
            <svg
              width="64"
              height="184"
              viewBox="0 0 60 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-[0_0_24px_rgba(251,191,36,0.95)] hover:scale-105 transition-transform"
            >
              {/* Bottle Body - 24K Solid Gold */}
              <path
                d="M24 8 H36 V35 C36 45 48 55 48 70 V160 C48 172 40 178 30 178 C20 178 12 172 12 160 V70 C12 55 24 45 24 35 V8 Z"
                fill="url(#gold_body)"
                stroke="#B45309"
                strokeWidth="2"
              />
              {/* Diamond Platinum Cap */}
              <rect x="23" y="2" width="14" height="7" rx="2" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
              {/* Platinum Foil Neck Ring */}
              <rect x="24" y="20" width="12" height="15" fill="url(#platinum_foil)" />
              {/* Luxury Black & Gold Crest Label */}
              <rect x="13" y="82" width="34" height="54" rx="4" fill="#090710" stroke="#FDE68A" strokeWidth="1.5" />
              {/* Star Crest */}
              <polygon points="30,87 32,92 37,92 33,95 34.5,100 30,97 25.5,100 27,95 23,92 28,92" fill="#FBBF24" />
              <text x="30" y="109" textAnchor="middle" fill="#FDE68A" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
                VIP GOLD
              </text>
              <text x="30" y="120" textAnchor="middle" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">
                STAR 24K
              </text>
              <circle cx="30" cy="128" r="2.5" fill="#FBBF24" />
              {/* Radiant Metallic Highlights */}
              <path d="M16 72 L16 156" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M44 72 L44 156" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M26 14 L26 33" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />

              <defs>
                <linearGradient id="gold_body" x1="0" y1="0" x2="60" y2="180" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFBEB" />
                  <stop offset="0.2" stopColor="#FDE68A" />
                  <stop offset="0.45" stopColor="#F59E0B" />
                  <stop offset="0.75" stopColor="#D97706" />
                  <stop offset="0.95" stopColor="#B45309" />
                  <stop offset="1" stopColor="#78350F" />
                </linearGradient>
                <linearGradient id="platinum_foil" x1="24" y1="20" x2="36" y2="35" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="0.5" stopColor="#E5E7EB" />
                  <stop offset="1" stopColor="#9CA3AF" />
                </linearGradient>
              </defs>
            </svg>
          ) : (
            /* STANDARD GREEN LAGOS BEER BOTTLE */
            <svg
              width="60"
              height="180"
              viewBox="0 0 60 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-[0_12px_16px_rgba(0,0,0,0.85)] hover:scale-105 transition-transform"
            >
              {/* Bottle Body - Deep Green Glass */}
              <path
                d="M24 8 H36 V35 C36 45 48 55 48 70 V160 C48 172 40 178 30 178 C20 178 12 172 12 160 V70 C12 55 24 45 24 35 V8 Z"
                fill="url(#green_glass)"
                stroke="#2e6930"
                strokeWidth="2"
              />
              {/* Gold Cap */}
              <rect x="23" y="2" width="14" height="7" rx="2" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
              {/* Gold Foil Neck Ring */}
              <rect x="24" y="22" width="12" height="12" fill="#F59E0B" />
              {/* Lagos Life VIP Label */}
              <rect x="14" y="85" width="32" height="50" rx="4" fill="#064E3B" stroke="#FBBF24" strokeWidth="1.5" />
              <text x="30" y="105" textAnchor="middle" fill="#FBBF24" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                LAGOS
              </text>
              <text x="30" y="118" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontWeight="bold" fontFamily="sans-serif">
                LIFE
              </text>
              <circle cx="30" cy="126" r="3" fill="#FBBF24" />
              {/* Bottle Glass Highlights */}
              <path d="M16 75 L16 155" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M26 15 L26 32" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />

              <defs>
                <linearGradient id="green_glass" x1="0" y1="0" x2="60" y2="180" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#10B981" />
                  <stop offset="0.4" stopColor="#047857" />
                  <stop offset="0.8" stopColor="#064E3B" />
                  <stop offset="1" stopColor="#022C22" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>
      </div>

      {/* Spin Controls */}
      <div className="mt-6 flex flex-col items-center">
        <button
          onClick={spinBottle}
          disabled={isSpinning || disabled}
          className={`flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold transition-all shadow-lg active:scale-95 ${
            isSpinning || disabled
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-amber-500/30 hover:shadow-amber-500/50 hover:brightness-105 animate-pulse'
          }`}
        >
          <Sparkles className="h-5 w-5" />
          <span>{isSpinning ? 'SPINNING…' : 'SPIN THE BOTTLE'}</span>
        </button>
        <span className="mt-2 text-xs font-medium text-slate-400">
          Tap button or bottle to choose who is in the hot seat
        </span>
      </div>
    </div>
  );

};
