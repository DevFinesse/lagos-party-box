import React, { useState, useEffect } from 'react';
import { Player, PromptItem, DeckCategory } from '../types';
import { MOST_LIKELY_TO_PROMPTS } from '../data/prompts';
import { sounds } from '../services/sound';
import { multiplayer } from '../services/multiplayer';
import { vatar } from '../services/vatarSdk';
import confetti from 'canvas-confetti';
import { Clock, ArrowRight, Heart, AlertCircle, Sparkles, ShoppingBag } from 'lucide-react';

interface MostLikelyToProps {
  players: Player[];
  activeUser: Player;
  deckCategory: DeckCategory;
  walletBalance: number;
  onDeductBalance: (amount: number, reason: string) => boolean;
  onLoseHeart: (playerId: string) => void;
  onNextRound: () => void;
  onOpenShop: () => void;
}

export const MostLikelyTo: React.FC<MostLikelyToProps> = ({
  players,
  activeUser,
  deckCategory,
  walletBalance,
  onDeductBalance,
  onLoseHeart,
  onNextRound,
  onOpenShop
}) => {
  const [currentPrompt, setCurrentPrompt] = useState<PromptItem | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({}); // voterId -> targetPlayerId
  const [myVote, setMyVote] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(15);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [culprit, setCulprit] = useState<Player | null>(null);
  const [finedMe, setFinedMe] = useState<boolean>(false);
  const [showLoserModal, setShowLoserModal] = useState<boolean>(false);
  const [isPayingLoserFine, setIsPayingLoserFine] = useState<boolean>(false);

  const LOSER_FEE = 1000;

  // Initialize new prompt
  const pickNewPrompt = (providedPrompt?: PromptItem) => {
    if (providedPrompt) {
      setCurrentPrompt(providedPrompt);
    } else {
      const filtered = MOST_LIKELY_TO_PROMPTS.filter((p) => {
        if (deckCategory === 'all') return true;
        if (deckCategory === 'spicy_18') return p.spicy || p.category === 'spicy_18';
        return p.category === deckCategory;
      });
      const chosen = filtered[Math.floor(Math.random() * filtered.length)] || MOST_LIKELY_TO_PROMPTS[0];
      setCurrentPrompt(chosen);
      multiplayer.broadcastAction('mlt_new_prompt', { prompt: chosen });
    }

    setVotes({});
    setMyVote(null);
    setRevealed(false);
    setCulprit(null);
    setFinedMe(false);
    setShowLoserModal(false);
    setTimer(15);
    sounds.suspense();
  };

  useEffect(() => {
    pickNewPrompt();
  }, [deckCategory]);

  // Multiplayer listeners
  useEffect(() => {
    const unsub = multiplayer.on('game_action', (data: any) => {
      if (data?.action === 'mlt_new_prompt') {
        pickNewPrompt(data.data?.prompt);
      } else if (data?.action === 'mlt_vote') {
        setVotes((prev) => ({ ...prev, [data.data.voterId]: data.data.targetId }));
        sounds.click();
      } else if (data?.action === 'mlt_reveal') {
        setVotes(data.data.votes || {});
        setRevealed(true);
        if (data.data.culpritId) {
          const loser = players.find((p) => p.id === data.data.culpritId) || null;
          setCulprit(loser);
          if (loser) {
            onLoseHeart(loser.id);
            sounds.buzz();
            sounds.horn();
            confetti({ particleCount: 50, spread: 60 });
          }
        }
      }
    });

    return () => unsub();
  }, [players]);

  // Timer countdown
  useEffect(() => {
    let interval: any;
    if (!revealed && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 4 && t > 1) sounds.click();
          if (t === 1) handleTimeUp();
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, revealed, votes, myVote]);

  // When timer runs out or everyone votes
  const handleTimeUp = () => {
    setRevealed(true);

    // Simulate bot votes if bots exist or local pass-and-play
    const finalVotes = { ...votes };
    if (myVote) finalVotes[activeUser.id] = myVote;

    players.forEach((p) => {
      if (!finalVotes[p.id]) {
        // pick random target
        const randomTarget = players[Math.floor(Math.random() * players.length)];
        finalVotes[p.id] = randomTarget.id;
      }
    });
    setVotes(finalVotes);

    // Count votes
    const tally: Record<string, number> = {};
    Object.values(finalVotes).forEach((targetId) => {
      tally[targetId] = (tally[targetId] || 0) + 1;
    });

    let maxVotes = 0;
    let worstPlayerId: string | null = null;
    Object.entries(tally).forEach(([targetId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        worstPlayerId = targetId;
      }
    });

    if (worstPlayerId) {
      const loser = players.find((p) => p.id === worstPlayerId) || null;
      setCulprit(loser);
      if (loser) {
        onLoseHeart(loser.id);
        sounds.buzz();
        sounds.horn();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });

        // If local player lost, deduct ₦1,000 penalty fee
        if (loser.id === activeUser.id) {
          const ok = onDeductBalance(LOSER_FEE, 'Most Likely To Loser Penalty');
          if (ok) {
            setFinedMe(true);
          } else {
            setShowLoserModal(true);
          }
        }
      }
    }

    multiplayer.broadcastAction('mlt_reveal', { votes: finalVotes, culpritId: worstPlayerId });
  };

  const handlePayLoserViaVatar = async () => {
    setIsPayingLoserFine(true);
    sounds.click();
    try {
      const ok = await vatar.purchasePack('loser_penalty');
      if (ok) {
        setShowLoserModal(false);
        setFinedMe(true);
      }
    } finally {
      setIsPayingLoserFine(false);
    }
  };

  const handleCastVote = (targetPlayerId: string) => {
    if (revealed) return;
    setMyVote(targetPlayerId);
    sounds.click();
    setVotes((prev) => ({ ...prev, [activeUser.id]: targetPlayerId }));
    multiplayer.broadcastAction('mlt_vote', { voterId: activeUser.id, targetId: targetPlayerId });
  };

  const handleNext = () => {
    pickNewPrompt();
    onNextRound();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto px-2 sm:px-4 py-2 animate-fadeIn box-border overflow-x-hidden">
      {/* Header Prompt Card */}
      {currentPrompt && (
        <div className="w-full max-w-full flex flex-col items-center p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-[#1C1236] to-[#100A22] border border-purple-400/30 shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)] mb-4 text-center box-border">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              🫵 MOST LIKELY TO...
            </span>

            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
              timer <= 5 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse' : 'bg-white/10 text-white'
            }`}>
              <Clock className="h-3 w-3" />
              <span>{timer}s</span>
            </div>
          </div>

          <h2 className="font-display text-lg sm:text-2xl font-bold text-white leading-relaxed my-2">
            "{currentPrompt.text}"
          </h2>

          <p className="text-[11px] text-slate-400 mt-1">
            {!revealed ? 'Tap the player you think fits this best!' : 'The votes are in!'}
          </p>
        </div>
      )}

      {/* Players Voting Grid */}
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-full box-border">
        {players.map((p) => {
          const isSelectedByMe = myVote === p.id;
          const voteCount = Object.values(votes).filter((v) => v === p.id).length;
          const isCulprit = culprit?.id === p.id && revealed;

          return (
            <button
              key={p.id}
              onClick={() => handleCastVote(p.id)}
              disabled={revealed}
              className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all text-center w-full box-border ${
                isCulprit
                  ? 'bg-rose-950/50 border-rose-500 ring-2 ring-rose-500/50 scale-[1.02] shadow-lg shadow-rose-500/20'
                  : isSelectedByMe
                  ? 'bg-purple-900/40 border-purple-400 ring-2 ring-purple-400/40'
                  : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
              }`}
            >
              {/* Culprit Stamp */}
              {isCulprit && (
                <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-rose-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  GUILTY 🎯
                </div>
              )}

              {/* Avatar */}
              <div className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-lg text-white mb-2 shadow-inner">
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  p.name.charAt(0)
                )}
                {/* Hearts / Lives indicator */}
                <span className="absolute -bottom-1 -right-1 flex items-center text-[11px]">
                  {'❤️'.repeat(Math.max(0, p.hearts))}
                </span>
              </div>

              {/* Name */}
              <span className="font-semibold text-sm text-white max-w-[120px] truncate text-center">
                {p.name}
              </span>

              {/* Live Votes Pill */}
              {revealed ? (
                <div className="mt-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-mono font-bold text-amber-300">
                  <span>{voteCount} votes</span>
                </div>
              ) : isSelectedByMe ? (
                <div className="mt-2 text-[11px] text-purple-300 font-semibold">
                  ✓ Your Vote
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Next Round Bar when revealed */}
      {revealed && (
        <div className="mt-8 flex flex-col items-center w-full animate-fadeIn">
          {culprit && (
            <div className={`flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border text-xs sm:text-sm mb-4 text-center w-full max-w-md ${
              culprit.id === activeUser.id 
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-200' 
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}>
              <div className="flex items-center gap-1.5 font-black">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>
                  {culprit.id === activeUser.id 
                    ? '🚨 YOU WERE CALLED OUT!' 
                    : `🎯 ${culprit.name} took the most votes!`}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs">
                {culprit.id === activeUser.id ? (
                  finedMe 
                    ? `Lost 1 heart and ₦${LOSER_FEE.toLocaleString()} Loser Penalty deducted from your table balance!` 
                    : `Lost 1 heart! Mandatory ₦${LOSER_FEE.toLocaleString()} Loser Penalty required.`
                ) : (
                  `${culprit.name} lost 1 heart and must pay the table loser penalty.`
                )}
              </p>
            </div>
          )}

          <button
            onClick={handleNext}
            className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30 hover:brightness-105 transition-all active:scale-95 text-xs sm:text-sm"
          >
            <span>NEXT PROMPT</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loser Fine Bailout Modal */}
      {showLoserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#140E26] border-2 border-rose-500/40 p-6 shadow-2xl text-white text-center">
            <span className="text-4xl block mb-2">🎯</span>
            <h3 className="font-display text-lg font-black text-white uppercase tracking-wide">
              Loser Table Penalty
            </h3>
            <p className="text-xs text-slate-300 mt-2 mb-4 leading-relaxed">
              The table unanimously voted you as Most Likely To! Losers must settle a <b className="text-rose-400">₦{LOSER_FEE.toLocaleString()}</b> penalty. Your balance is <b className="text-amber-300">₦{walletBalance.toLocaleString()}</b>.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handlePayLoserViaVatar}
                disabled={isPayingLoserFine}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isPayingLoserFine ? 'Opening Vatar Checkout…' : `Pay ₦${LOSER_FEE.toLocaleString()} via Vatar Pay`}</span>
              </button>
              <button
                onClick={() => {
                  setShowLoserModal(false);
                  onOpenShop();
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Top Up Table Wallet</span>
              </button>
              <button
                onClick={() => setShowLoserModal(false)}
                className="w-full py-2 rounded-2xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Accept Shame (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
