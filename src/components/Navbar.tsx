import React from 'react';
import { Volume2, VolumeX, ShoppingBag, Trophy, Home, Music, PlusCircle, ShieldAlert } from 'lucide-react';
import { Player, VatarSession } from '../types';
import { sounds } from '../services/sound';

interface NavbarProps {
  session: VatarSession | null;
  activePlayer?: Player;
  walletBalance: number;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onGoHome?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  musicEnabled?: boolean;
  onToggleMusic?: () => void;
  onOpenCustomPrompt?: () => void;
  onOpenBlotter?: () => void;
  inGame?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  activePlayer,
  walletBalance,
  onOpenShop,
  onOpenLeaderboard,
  onGoHome,
  soundEnabled,
  onToggleSound,
  musicEnabled,
  onToggleMusic,
  onOpenCustomPrompt,
  onOpenBlotter,
  inGame
}) => {
  return (
    <header className="shrink-0 z-30 border-b border-white/[0.08] bg-[#0E0B1A]/95 backdrop-blur-xl px-2 py-2 sm:px-6 w-full box-border overflow-hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-1 sm:gap-3 w-full">
        {/* Brand / Logo */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {inGame && onGoHome && (
            <button
              onClick={onGoHome}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              title="Return to Lobby"
            >
              <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-display text-xs sm:text-base font-bold tracking-tight text-white whitespace-nowrap">
                LAGOS <span className="text-[#E9C9FF]">PARTY BOX</span>
              </span>
              <span className={`rounded-full px-1 py-0.2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${
                session?.mode === 'live' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {session?.mode === 'live' ? 'LIVE' : 'TEST'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 hidden xs:inline">by Vatar Games</span>
          </div>
        </div>

        {/* Player Profile, Wallet Balance & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Wallet Balance Chip */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-400/40 hover:border-amber-400 text-amber-300 transition-all active:scale-95 shadow-sm"
            title="Click to Top Up Table Cash"
          >
            <span className="text-xs">💰</span>
            <span className="font-mono text-[11px] sm:text-xs font-black tracking-tight text-amber-200">
              ₦{walletBalance.toLocaleString()}
            </span>
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[10px] font-black ml-0.5">
              +
            </span>
          </button>

          {/* Player avatar on desktop */}
          {activePlayer && (
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/10 py-1 px-2.5">
              <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-purple-500 to-amber-400 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                {activePlayer.avatar ? (
                  <img src={activePlayer.avatar} alt={activePlayer.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  activePlayer.name.charAt(0)
                )}
              </div>
              <span className="text-xs font-semibold text-slate-200 max-w-[80px] truncate">
                {activePlayer.name}
              </span>
            </div>
          )}

          {/* Procedural Afrobeats Vibe Music Toggle (hidden on tiny screens) */}
          {onToggleMusic && (
            <button
              onClick={onToggleMusic}
              className={`hidden sm:flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-bold border transition-all ${
                musicEnabled
                  ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-sm animate-pulse'
                  : 'bg-white/[0.06] border-white/10 text-slate-400 hover:text-white'
              }`}
              title={musicEnabled ? 'Pause Afrobeats Vibe' : 'Play Afrobeats Vibe Music'}
            >
              <Music className="h-3 w-3" />
              <span>{musicEnabled ? 'Vibe ON' : 'Vibe'}</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/15 transition-colors text-slate-300 hover:text-white"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          {/* Leaderboard (hidden on tiny screens) */}
          <button
            onClick={onOpenLeaderboard}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/15 transition-colors text-amber-300"
            title="High Rollers Leaderboard"
          >
            <Trophy className="h-3.5 w-3.5" />
          </button>

          {/* VIP Shop Button */}
          <button
            onClick={onOpenShop}
            className="flex h-7 sm:h-8 items-center gap-1 rounded-full bg-[#E9C9FF] px-2 sm:px-2.5 font-bold text-[#111] hover:bg-[#f3e1ff] transition-all text-[11px] sm:text-xs shadow-md shadow-purple-500/20 active:scale-95"
            title="VIP Deck & Cash Shop"
          >
            <ShoppingBag className="h-3 w-3" />
            <span className="hidden sm:inline">Shop</span>
          </button>
        </div>
      </div>
    </header>
  );
};
