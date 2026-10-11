import React, { useState } from 'react';
import { GameMode, DeckCategory, Player, StoreItem } from '../types';
import { sounds } from '../services/sound';
import { Sparkles, Users, Lock, Plus, Trash2, Play } from 'lucide-react';

interface LobbyProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  selectedCategory: DeckCategory;
  onSelectCategory: (cat: DeckCategory) => void;
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onStartGame: () => void;
  storeItems: StoreItem[];
  onOpenShop: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  selectedMode,
  onSelectMode,
  selectedCategory,
  onSelectCategory,
  players,
  onAddPlayer,
  onRemovePlayer,
  onStartGame,
  storeItems,
  onOpenShop
}) => {
  const [newPlayerName, setNewPlayerName] = useState<string>('');

  const lekkiPackUnlocked = storeItems.find((i) => i.id === 'pack_lekki_afterdark')?.unlocked;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
      sounds.click();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-6 animate-fadeIn">
      {/* Hero Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#E9C9FF] text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Lagos Life Edition</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          LAGOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E9C9FF] via-purple-300 to-amber-300">PARTY BOX</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
          The ultimate cheat-proof multiplayer party suite for Lagosians. Choose your poison and call out your friends!
        </p>
      </div>

      {/* 1. Game Mode Selection */}
      <div className="w-full mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          1. Choose Your Game Mode
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Truth or Dare */}
          <button
            onClick={() => {
              onSelectMode('truth_or_dare');
              sounds.click();
            }}
            className={`p-5 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-[160px] ${
              selectedMode === 'truth_or_dare'
                ? 'bg-gradient-to-br from-purple-900/60 to-[#1b1035] border-purple-400 ring-2 ring-purple-400/40 shadow-lg shadow-purple-500/20 scale-[1.02]'
                : 'bg-[#120D22]/60 border-white/10 hover:border-white/20 hover:bg-[#150F28]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">🍾</span>
              {selectedMode === 'truth_or_dare' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E9C9FF] text-slate-950">
                  SELECTED
                </span>
              )}
            </div>
            <div>
              <h4 className="font-display font-bold text-lg text-white">Truth or Dare</h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                Spin the VIP bottle on the table. Face the hot seat or pay a forfeit!
              </p>
            </div>
          </button>

          {/* Most Likely To */}
          <button
            onClick={() => {
              onSelectMode('most_likely_to');
              sounds.click();
            }}
            className={`p-5 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-[160px] ${
              selectedMode === 'most_likely_to'
                ? 'bg-gradient-to-br from-rose-900/60 to-[#2c0e27] border-rose-400 ring-2 ring-rose-400/40 shadow-lg shadow-rose-500/20 scale-[1.02]'
                : 'bg-[#120D22]/60 border-white/10 hover:border-white/20 hover:bg-[#150F28]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">🫵</span>
              {selectedMode === 'most_likely_to' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-400 text-slate-950">
                  SELECTED
                </span>
              )}
            </div>
            <div>
              <h4 className="font-display font-bold text-lg text-white">Most Likely To...</h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                15-second rapid voting on player avatars. The culprit loses a heart!
              </p>
            </div>
          </button>

          {/* Never Have I Ever */}
          <button
            onClick={() => {
              onSelectMode('never_have_i_ever');
              sounds.click();
            }}
            className={`p-5 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-[160px] ${
              selectedMode === 'never_have_i_ever'
                ? 'bg-gradient-to-br from-amber-900/60 to-[#27170a] border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/20 scale-[1.02]'
                : 'bg-[#120D22]/60 border-white/10 hover:border-white/20 hover:bg-[#150F28]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">🍻</span>
              {selectedMode === 'never_have_i_ever' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  SELECTED
                </span>
              )}
            </div>
            <div>
              <h4 className="font-display font-bold text-lg text-white">Never Have I Ever</h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                Confess your wildest Lagos escapades or take a drink!
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Deck & Theme Selection */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            2. Prompt Category & Spice Level
          </h3>
          <button
            onClick={onOpenShop}
            className="text-xs text-[#E9C9FF] hover:underline font-semibold"
          >
            Unlock Decks in Shop →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'all', label: 'All Mixed', icon: '🎲' },
            { id: 'chill', label: 'Lagos Chill', icon: '🌴' },
            { id: 'street', label: 'Street & Campus', icon: '🚌' },
            { id: 'spicy_18', label: 'Lekki Nights (18+)', icon: '🔥', locked: !lekkiPackUnlocked }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                if (cat.locked) {
                  onOpenShop();
                } else {
                  onSelectCategory(cat.id as DeckCategory);
                  sounds.click();
                }
              }}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-purple-900/40 border-purple-400 text-white font-bold'
                  : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs">{cat.label}</span>
                {cat.locked && <Lock className="h-3 w-3 text-amber-400" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Players Seated in Room */}
      <div className="w-full p-5 rounded-3xl bg-[#140F24] border border-white/10 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#E9C9FF]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Players at Table ({players.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Min 2 · Max 8</span>
        </div>

        {/* Players Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-slate-200"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-purple-500 to-amber-400 flex items-center justify-center text-[10px] text-white font-bold">
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  p.name.charAt(0)
                )}
              </div>
              <span>{p.name}</span>
              {p.isHost && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold">
                  HOST
                </span>
              )}
              {!p.isHost && (
                <button
                  onClick={() => onRemovePlayer(p.id)}
                  className="hover:text-rose-400 text-slate-500 transition-colors ml-0.5"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Friend Form */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            placeholder="Add friend's name (e.g. Chioma, Segun)…"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            maxLength={18}
            className="flex-1 rounded-2xl bg-black/40 border border-white/10 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Player</span>
          </button>
        </form>
      </div>

      {/* Start Game Action */}
      <div className="w-full flex flex-col items-center">
        <button
          onClick={onStartGame}
          disabled={players.length < 2}
          className={`flex items-center justify-center gap-2.5 w-full max-w-sm py-4 rounded-full font-display text-lg font-bold shadow-xl transition-all active:scale-95 ${
            players.length >= 2
              ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-amber-500/30 hover:brightness-105'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
          }`}
        >
          <Play className="h-5 w-5 fill-current" />
          <span>START PARTY ROUND</span>
        </button>

        {players.length < 2 && (
          <span className="text-xs text-amber-400 mt-2">
            ⚠️ Add at least one more player to start the party!
          </span>
        )}
      </div>
    </div>
  );
};
