import React from 'react';
import { Volume2, VolumeX, ShoppingBag, Trophy, Home } from 'lucide-react';
import { Player, VatarSession } from '../types';
import { sounds } from '../services/sound';

interface NavbarProps {
  session: VatarSession | null;
  activePlayer?: Player;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onGoHome?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  inGame?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  activePlayer,
  onOpenShop,
  onOpenLeaderboard,
  onGoHome,
  soundEnabled,
  onToggleSound,
  inGame
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0E0B1A]/80 backdrop-blur-xl px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          {inGame && onGoHome && (
            <button
              onClick={onGoHome}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              title="Return to Lobby"
            >
              <Home className="h-4 w-4" />
            </button>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">
                LAGOS <span className="text-[#E9C9FF]">PARTY BOX</span>
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                session?.mode === 'live' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {session?.mode === 'live' ? 'LIVE' : 'SANDBOX'}
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">by Vatar Games</span>
          </div>
        </div>

        {/* Player Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activePlayer && (
            <div className="flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 py-1 px-3">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-purple-500 to-amber-400 flex items-center justify-center text-[12px] font-bold text-white shadow-inner">
                {activePlayer.avatar ? (
                  <img src={activePlayer.avatar} alt={activePlayer.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  activePlayer.name.charAt(0)
                )}
              </div>
              <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate sm:max-w-none">
                {activePlayer.name}
              </span>
              {activePlayer.hearts > 0 && (
                <span className="text-xs text-rose-400 font-bold ml-1">
                  {'❤️'.repeat(Math.min(activePlayer.hearts, 3))}
                </span>
              )}
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/15 transition-colors text-slate-300 hover:text-white"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/15 transition-colors text-amber-300"
            title="High Rollers Leaderboard"
          >
            <Trophy className="h-4 w-4" />
          </button>

          {/* VIP Shop */}
          <button
            onClick={onOpenShop}
            className="flex h-9 items-center gap-1.5 rounded-full bg-[#E9C9FF] px-3 font-semibold text-[#111] hover:bg-[#f3e1ff] transition-all text-xs shadow-md shadow-purple-500/20 active:scale-95"
            title="VIP Deck Shop"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">VIP Shop</span>
          </button>
        </div>
      </div>
    </header>
  );
};
