import React, { useState } from 'react';
import { StoreItem, VatarSession } from '../types';
import { vatar } from '../services/vatarSdk';
import { sounds } from '../services/sound';
import confetti from 'canvas-confetti';
import { X, Check, Lock, Sparkles } from 'lucide-react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StoreItem[];
  onItemPurchased: (itemId: string) => void;
  session: VatarSession | null;
  walletBalance: number;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  items,
  onItemPurchased,
  session,
  walletBalance
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuy = async (item: StoreItem) => {
    setLoadingId(item.id);
    sounds.click();

    try {
      const ok = await vatar.purchasePack(item.id);
      if (ok) {
        sounds.victory();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 }
        });
        onItemPurchased(item.id);
      } else {
        sounds.buzz();
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#130E22] border border-purple-500/30 p-5 sm:p-6 shadow-[0_20px_60px_-15px_rgba(168,85,247,0.5)] box-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍾</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg sm:text-xl font-bold text-white">VIP Deck & Cash Shop</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/30">
                  💰 ₦{walletBalance.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-400">Unlock party packs & top up spraying cash via Vatar Pay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Deck & Consumable Cards */}
        <div className="mt-4 space-y-3 max-h-[58vh] overflow-y-auto pr-1">
          {items.map((item) => {
            const isConsumable = item.id.startsWith('wallet_topup_') || item.id === 'drink_shot_1000' || item.id === 'chicken_out_fine';
            const isAlreadyUnlocked = !isConsumable && item.unlocked;

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isAlreadyUnlocked
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-white/[0.04] border-white/10 hover:border-purple-400/30'
                }`}
              >
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="text-2xl sm:text-3xl p-2 rounded-xl bg-purple-900/30 border border-purple-500/20 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-sm sm:text-base text-white">{item.name}</h4>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold bg-amber-400 text-slate-950">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 max-w-[210px] sm:max-w-[240px] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="shrink-0">
                  {isAlreadyUnlocked ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      <Check className="h-3.5 w-3.5" />
                      <span>Unlocked</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={loadingId === item.id}
                      className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#E9C9FF] hover:bg-[#f3e1ff] text-[#111] font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>
                        {loadingId === item.id ? 'Loading…' : `₦${item.price.toLocaleString()}`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>Processed securely by Lagos Life Pay</span>
          <span className="text-amber-400 font-semibold">70% goes to Creator</span>
        </div>
      </div>
    </div>
  );
};
