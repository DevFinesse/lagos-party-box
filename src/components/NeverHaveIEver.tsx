import React, { useState, useEffect } from 'react';
import { Player, PromptItem, DeckCategory } from '../types';
import { NEVER_HAVE_I_EVER_PROMPTS } from '../data/prompts';
import { sounds } from '../services/sound';
import { multiplayer } from '../services/multiplayer';
import { vatar } from '../services/vatarSdk';
import { ArrowRight, Beer, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';

interface NeverHaveIEverProps {
  players: Player[];
  activeUser: Player;
  deckCategory: DeckCategory;
  walletBalance: number;
  onDeductBalance: (amount: number, reason: string) => boolean;
  onTakeShot: (playerId: string) => void;
  onNextRound: () => void;
  onOpenShop: () => void;
}

export const NeverHaveIEver: React.FC<NeverHaveIEverProps> = ({
  players,
  activeUser,
  deckCategory,
  walletBalance,
  onDeductBalance,
  onTakeShot,
  onNextRound,
  onOpenShop
}) => {
  const [currentPrompt, setCurrentPrompt] = useState<PromptItem | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [myChoice, setMyChoice] = useState<'guilty' | 'clean' | null>(null);
  const [tableResponses, setTableResponses] = useState<Record<string, 'guilty' | 'clean'>>({});
  const [totalDrinksCount, setTotalDrinksCount] = useState<number>(0);
  const [showDrinkModal, setShowDrinkModal] = useState<boolean>(false);
  const [isPayingVatar, setIsPayingVatar] = useState<boolean>(false);

  const DRINK_PRICE = 1000;

  const pickNewPrompt = (providedPrompt?: PromptItem) => {
    if (providedPrompt) {
      setCurrentPrompt(providedPrompt);
    } else {
      const filtered = NEVER_HAVE_I_EVER_PROMPTS.filter((p) => {
        if (deckCategory === 'all') return true;
        if (deckCategory === 'spicy_18') return p.spicy || p.category === 'spicy_18';
        return p.category === deckCategory;
      });
      const chosen = filtered[Math.floor(Math.random() * filtered.length)] || NEVER_HAVE_I_EVER_PROMPTS[0];
      setCurrentPrompt(chosen);
      multiplayer.broadcastAction('nhe_prompt', { prompt: chosen });
    }

    setAnswered(false);
    setMyChoice(null);
    setTableResponses({});
    sounds.suspense();
  };

  useEffect(() => {
    pickNewPrompt();
  }, [deckCategory]);

  // Multiplayer listeners
  useEffect(() => {
    const unsub = multiplayer.on('game_action', (data: any) => {
      if (data?.action === 'nhe_prompt') {
        pickNewPrompt(data.data?.prompt);
      } else if (data?.action === 'nhe_answer') {
        setTableResponses((prev) => ({ ...prev, [data.data.playerId]: data.data.choice }));
        if (data.data.choice === 'guilty') {
          sounds.drink();
          setTotalDrinksCount((c) => c + 1);
        } else {
          sounds.click();
        }
      } else if (data?.action === 'nhe_next') {
        pickNewPrompt();
      }
    });

    return () => unsub();
  }, [players]);

  const recordGuiltyDrink = () => {
    setMyChoice('guilty');
    setAnswered(true);
    setTableResponses((prev) => ({ ...prev, [activeUser.id]: 'guilty' }));
    setTotalDrinksCount((c) => c + 1);
    sounds.drink();
    onTakeShot(activeUser.id);
    multiplayer.broadcastAction('nhe_answer', { playerId: activeUser.id, choice: 'guilty' });
  };

  const handleGuiltyClick = () => {
    // Attempt to deduct ₦1,000 from in-game wallet balance
    const deducted = onDeductBalance(DRINK_PRICE, 'Never Have I Ever Table Drink');
    if (deducted) {
      recordGuiltyDrink();
    } else {
      // Wallet low: prompt player to buy drink via Vatar or top up
      sounds.buzz();
      setShowDrinkModal(true);
    }
  };

  const handleBuyDrinkViaVatar = async () => {
    setIsPayingVatar(true);
    sounds.click();
    try {
      const ok = await vatar.purchasePack('drink_shot_1000');
      if (ok) {
        setShowDrinkModal(false);
        recordGuiltyDrink();
      }
    } finally {
      setIsPayingVatar(false);
    }
  };

  const handleClean = () => {
    setMyChoice('clean');
    setAnswered(true);
    setTableResponses((prev) => ({ ...prev, [activeUser.id]: 'clean' }));
    sounds.click();
    multiplayer.broadcastAction('nhe_answer', { playerId: activeUser.id, choice: 'clean' });
  };

  const handleNext = () => {
    pickNewPrompt();
    multiplayer.broadcastAction('nhe_next', {});
    onNextRound();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto px-3 sm:px-4 py-4 animate-fadeIn box-border overflow-hidden">
      {/* Table Drinks Meter */}
      <div className="w-full flex items-center justify-between px-4 py-2 mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
        <div className="flex items-center gap-1.5 text-amber-300 font-bold">
          <Beer className="h-4 w-4" />
          <span>Table Drinks Bought: {totalDrinksCount}</span>
        </div>
        <span className="font-mono text-amber-400 font-black">
          Tab: ₦{(totalDrinksCount * DRINK_PRICE).toLocaleString()}
        </span>
      </div>

      {currentPrompt && (
        <div className="w-full flex flex-col items-center p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-[#1E1133] to-[#0E071A] border border-amber-500/20 shadow-[0_10px_40px_-10px_rgba(245,158,11,0.25)] mb-4 text-center box-border">
          <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
            🙈 NEVER HAVE I EVER...
          </span>

          <h2 className="font-display text-lg sm:text-2xl font-bold text-white leading-snug sm:leading-relaxed my-2 max-w-md">
            "{currentPrompt.text}"
          </h2>

          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Confess and buy a chilled drink for <b>₦{DRINK_PRICE.toLocaleString()}</b>, or claim clean hands!
          </p>

          {!answered ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-6">
              <button
                onClick={handleGuiltyClick}
                className="flex items-center justify-center gap-2 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <Beer className="h-5 w-5 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm leading-tight">GUILTY! (Drink)</span>
                  <span className="text-[10px] font-mono opacity-90">Pay ₦{DRINK_PRICE.toLocaleString()}</span>
                </div>
              </button>

              <button
                onClick={handleClean}
                className="flex items-center justify-center gap-2 p-3.5 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold transition-all active:scale-95"
              >
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm leading-tight">NEVER</span>
                  <span className="text-[10px] text-emerald-300">Clean Hands 😇</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center mt-6 w-full animate-fadeIn">
              <div className={`p-3 rounded-2xl font-bold text-xs sm:text-sm mb-4 ${
                myChoice === 'guilty' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {myChoice === 'guilty' ? `🍻 Drink Confirmed! (Paid ₦${DRINK_PRICE.toLocaleString()})` : '😇 Safe! Hands clean!'}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 py-3 px-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30 active:scale-95 text-xs sm:text-sm"
              >
                <span>NEXT STATEMENT</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Drink Pay / Low Balance Modal */}
      {showDrinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#140E26] border-2 border-amber-500/40 p-6 shadow-2xl text-white text-center">
            <span className="text-4xl block mb-2">🍻</span>
            <h3 className="font-display text-lg font-black text-white uppercase tracking-wide">
              Buy Table Drink
            </h3>
            <p className="text-xs text-slate-300 mt-2 mb-4 leading-relaxed">
              Every confession in Lagos Party Box comes with a drink fee of <b className="text-amber-400">₦{DRINK_PRICE.toLocaleString()}</b>. Your table balance is <b className="text-amber-300">₦{walletBalance.toLocaleString()}</b>.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleBuyDrinkViaVatar}
                disabled={isPayingVatar}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isPayingVatar ? 'Opening Vatar Checkout…' : `Pay ₦${DRINK_PRICE.toLocaleString()} via Vatar Pay`}</span>
              </button>
              <button
                onClick={() => {
                  setShowDrinkModal(false);
                  onOpenShop();
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Top Up Table Wallet</span>
              </button>
              <button
                onClick={() => setShowDrinkModal(false)}
                className="w-full py-2 rounded-2xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel / Claim Clean Hands
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
