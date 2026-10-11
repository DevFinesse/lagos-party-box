import React, { useState, useEffect } from 'react';
import { Player, PromptItem, DeckCategory } from '../types';
import { BottleSpinner } from './BottleSpinner';
import { TRUTH_PROMPTS, DARE_PROMPTS } from '../data/prompts';
import { sounds } from '../services/sound';
import confetti from 'canvas-confetti';
import { Flame, MessageCircle, Beer, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface TruthOrDareProps {
  players: Player[];
  activeUser: Player;
  deckCategory: DeckCategory;
  onUpdateScore: (playerId: string, delta: number) => void;
  onNextTurn: () => void;
}

export const TruthOrDare: React.FC<TruthOrDareProps> = ({
  players,
  activeUser,
  deckCategory,
  onUpdateScore,
  onNextTurn
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<PromptItem | null>(null);
  const [choiceType, setChoiceType] = useState<'truth' | 'dare' | 'forfeit' | null>(null);
  const [timer, setTimer] = useState<number>(45);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [resolved, setResolved] = useState<boolean>(false);

  // Timer countdown
  useEffect(() => {
    let interval: any;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 5 && t > 1) sounds.click();
          if (t === 1) sounds.buzz();
          return t - 1;
        });
      }, 1000);
    } else if (timer === 0 && timerActive) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  // Pick prompt based on choice
  const handleChoice = (type: 'truth' | 'dare') => {
    setChoiceType(type);
    sounds.suspense();

    const pool = type === 'truth' ? TRUTH_PROMPTS : DARE_PROMPTS;
    const filtered = pool.filter((p) => {
      if (deckCategory === 'all') return true;
      if (deckCategory === 'spicy_18') return p.spicy || p.category === 'spicy_18';
      return p.category === deckCategory;
    });

    const chosen = filtered[Math.floor(Math.random() * filtered.length)] || pool[0];
    setCurrentPrompt(chosen);
    setTimer(45);
    setTimerActive(true);
  };

  const handleForfeit = () => {
    setChoiceType('forfeit');
    setResolved(true);
    sounds.drink();
    sounds.buzz();
  };

  const handleComplete = () => {
    setResolved(true);
    setTimerActive(false);
    sounds.victory();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (selectedPlayer) {
      onUpdateScore(selectedPlayer.id, 50);
    }
  };

  const handleChickenOut = () => {
    setResolved(true);
    setTimerActive(false);
    sounds.buzz();
  };

  const resetRound = () => {
    setSelectedPlayer(null);
    setCurrentPrompt(null);
    setChoiceType(null);
    setResolved(false);
    setTimer(45);
    setTimerActive(false);
    onNextTurn();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-4">
      {/* Stage 1: Bottle Spinner (No player selected yet) */}
      {!selectedPlayer && (
        <div className="flex flex-col items-center w-full animate-fadeIn">
          <div className="text-center mb-2">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Lagos Afterdark · <span className="text-amber-400">Bottle Spin</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Spin the bottle to find out who faces the hot seat!
            </p>
          </div>

          <BottleSpinner
            players={players}
            onPlayerSelected={(p) => setSelectedPlayer(p)}
            isSpinning={isSpinning}
            setIsSpinning={setIsSpinning}
            selectedPlayer={selectedPlayer}
          />
        </div>
      )}

      {/* Stage 2 & 3: Player in Hot Seat */}
      {selectedPlayer && (
        <div className="w-full flex flex-col items-center animate-scaleUp">
          {/* Hot Seat Header */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.06] border border-white/10 w-full justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-bold flex items-center justify-center text-lg ring-2 ring-amber-400/50 shadow-md">
                {selectedPlayer.avatar ? (
                  <img src={selectedPlayer.avatar} alt={selectedPlayer.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  selectedPlayer.name.charAt(0)
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">HOT SEAT</span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-white">{selectedPlayer.name}</h3>
              </div>
            </div>

            {timerActive && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono text-sm font-bold">
                <Clock className="h-4 w-4 animate-spin" />
                <span>{timer}s</span>
              </div>
            )}
          </div>

          {/* Choice Selection: Truth, Dare or Forfeit */}
          {!choiceType && (
            <div className="w-full flex flex-col items-center p-6 rounded-3xl bg-[#140F24] border border-purple-500/20 shadow-2xl">
              <span className="text-sm font-semibold text-slate-300 mb-4">
                What does <span className="text-amber-400 font-bold">{selectedPlayer.name}</span> choose?
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                {/* TRUTH */}
                <button
                  onClick={() => handleChoice('truth')}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-blue-600/30 to-blue-900/40 border border-blue-400/30 hover:border-blue-400 hover:scale-[1.02] transition-all group shadow-lg active:scale-95"
                >
                  <MessageCircle className="h-8 w-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-display text-lg font-bold text-white">TRUTH</span>
                  <span className="text-[11px] text-blue-200 mt-1">Spill the Lagos gist</span>
                </button>

                {/* DARE */}
                <button
                  onClick={() => handleChoice('dare')}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-rose-600/30 to-rose-900/40 border border-rose-400/30 hover:border-rose-400 hover:scale-[1.02] transition-all group shadow-lg active:scale-95"
                >
                  <Flame className="h-8 w-8 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-display text-lg font-bold text-white">DARE</span>
                  <span className="text-[11px] text-rose-200 mt-1">Wild street action</span>
                </button>

                {/* FORFEIT */}
                <button
                  onClick={handleForfeit}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-amber-600/30 to-amber-900/40 border border-amber-400/30 hover:border-amber-400 hover:scale-[1.02] transition-all group shadow-lg active:scale-95"
                >
                  <Beer className="h-8 w-8 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-display text-lg font-bold text-white">FORFEIT</span>
                  <span className="text-[11px] text-amber-200 mt-1">Pay coins / take shot</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Prompt Card */}
          {choiceType && choiceType !== 'forfeit' && currentPrompt && (
            <div className="w-full flex flex-col items-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1E1438] to-[#120B24] border border-purple-400/30 shadow-[0_10px_40px_-10px_rgba(168,85,247,0.4)]">
              {/* Type Pill */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  choiceType === 'truth' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {choiceType === 'truth' ? '💬 TRUTH PROMPT' : '🔥 DARE CHALLENGE'}
                </span>
                {currentPrompt.spicy && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    🌶️ 18+ LEKKI NIGHTS
                  </span>
                )}
              </div>

              {/* The Text */}
              <p className="font-display text-xl sm:text-2xl font-bold text-center text-white leading-relaxed my-4">
                "{currentPrompt.text}"
              </p>

              {/* Action Buttons */}
              {!resolved ? (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6 w-full">
                  <button
                    onClick={handleComplete}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Completed! (+50)</span>
                  </button>
                  <button
                    onClick={handleChickenOut}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-white/10 hover:bg-white/15 text-rose-300 font-bold border border-rose-500/30 transition-all active:scale-95"
                  >
                    <XCircle className="h-5 w-5" />
                    <span>Chicked Out 🐔</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center mt-6 w-full animate-fadeIn">
                  <button
                    onClick={resetRound}
                    className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30 hover:brightness-105 transition-all active:scale-95"
                  >
                    <span>NEXT ROUND</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Forfeit Resolution */}
          {choiceType === 'forfeit' && (
            <div className="w-full flex flex-col items-center p-8 rounded-3xl bg-[#1B122B] border border-amber-500/30 text-center animate-scaleUp">
              <span className="text-4xl mb-2">🍻</span>
              <h3 className="font-display text-xl font-bold text-amber-300">FORFEIT ACCEPTED</h3>
              <p className="text-slate-300 text-sm mt-2 max-w-sm">
                {selectedPlayer.name} dodged the bullet! They must take a shot, drink a glass of water in one gulp, or pay ₦100 Lagos Life coins into the table pot.
              </p>
              <button
                onClick={resetRound}
                className="mt-6 flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all shadow-lg active:scale-95"
              >
                <span>NEXT PLAYER</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
