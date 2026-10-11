import React, { useState, useEffect } from 'react';
import { Player, PromptItem, DeckCategory } from '../types';
import { NEVER_HAVE_I_EVER_PROMPTS } from '../data/prompts';
import { sounds } from '../services/sound';
import { ArrowRight, Beer, ShieldCheck } from 'lucide-react';

interface NeverHaveIEverProps {
  players: Player[];
  activeUser: Player;
  deckCategory: DeckCategory;
  onTakeShot: (playerId: string) => void;
  onNextRound: () => void;
}

export const NeverHaveIEver: React.FC<NeverHaveIEverProps> = ({
  players,
  activeUser,
  deckCategory,
  onTakeShot,
  onNextRound
}) => {
  const [currentPrompt, setCurrentPrompt] = useState<PromptItem | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [myChoice, setMyChoice] = useState<'guilty' | 'clean' | null>(null);

  const pickNewPrompt = () => {
    const filtered = NEVER_HAVE_I_EVER_PROMPTS.filter((p) => {
      if (deckCategory === 'all') return true;
      if (deckCategory === 'spicy_18') return p.spicy || p.category === 'spicy_18';
      return p.category === deckCategory;
    });
    const chosen = filtered[Math.floor(Math.random() * filtered.length)] || NEVER_HAVE_I_EVER_PROMPTS[0];
    setCurrentPrompt(chosen);
    setAnswered(false);
    setMyChoice(null);
    sounds.suspense();
  };

  useEffect(() => {
    pickNewPrompt();
  }, [deckCategory]);

  const handleGuilty = () => {
    setMyChoice('guilty');
    setAnswered(true);
    sounds.drink();
    onTakeShot(activeUser.id);
  };

  const handleClean = () => {
    setMyChoice('clean');
    setAnswered(true);
    sounds.click();
  };

  const handleNext = () => {
    pickNewPrompt();
    onNextRound();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-4 animate-fadeIn">
      {currentPrompt && (
        <div className="w-full flex flex-col items-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1E1133] to-[#0E071A] border border-amber-500/20 shadow-[0_10px_40px_-10px_rgba(245,158,11,0.25)] mb-6 text-center">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4">
            🙈 NEVER HAVE I EVER...
          </span>

          <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-relaxed my-2">
            "{currentPrompt.text}"
          </h2>

          <p className="text-xs text-slate-400 mt-2">
            Be honest! If you have done this, take a sip or tap Guilty.
          </p>

          {!answered ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-6">
              <button
                onClick={handleGuilty}
                className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <Beer className="h-5 w-5" />
                <span>GUILTY! (Take a Drink)</span>
              </button>

              <button
                onClick={handleClean}
                className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold transition-all active:scale-95"
              >
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span>NEVER (I'm Clean 😇)</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center mt-6 w-full animate-fadeIn">
              <div className={`p-3 rounded-2xl font-bold text-sm mb-4 ${
                myChoice === 'guilty' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {myChoice === 'guilty' ? '🍻 You confessed! Take a drink!' : '😇 Safe! Hands clean!'}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 py-3 px-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30 active:scale-95"
              >
                <span>NEXT STATEMENT</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
