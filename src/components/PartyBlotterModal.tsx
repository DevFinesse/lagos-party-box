import React, { useState } from 'react';
import { Player } from '../types';
import { sounds } from '../services/sound';
import { X, Trophy, Share2, Copy, Check, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PartyBlotterModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onPlayAgain: () => void;
}

export const PartyBlotterModal: React.FC<PartyBlotterModalProps> = ({
  isOpen,
  onClose,
  players,
  onPlayAgain
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate Party Titles
  const sortedByScore = [...players].sort((a, b) => b.score - a.score);
  const mvp = sortedByScore[0] || { name: 'Nobody', score: 0 };
  const chicken = sortedByScore[sortedByScore.length - 1] || { name: 'Nobody', score: 0 };
  const randomSpicy = sortedByScore[1] || mvp;

  const summaryText = `🚨 LAGOS PARTY BOX · OFFICIAL BLOTTER 🚨
👑 Party Chief (MVP): ${mvp.name} (${mvp.score} pts)
🐔 Lagos Chicken: ${chicken.name} (${chicken.score} pts)
🌶️ Lekki Menace: ${randomSpicy.name}
Party Suite on Lagos Life!`;

  const handleShareWhatsApp = () => {
    sounds.click();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText)}`;
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    sounds.click();
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(summaryText).catch(() => fallbackCopy(summaryText));
      } else {
        fallbackCopy(summaryText);
      }
    } catch (e) {
      fallbackCopy(summaryText);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fallbackCopy = (text: string) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-[#140E26] border-2 border-amber-500/40 p-6 shadow-[0_20px_70px_rgba(245,158,11,0.2)] text-white relative overflow-hidden">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="font-display text-base font-black text-white tracking-wide uppercase">
                Lagos Party Police Blotter
              </h3>
              <p className="text-[10px] text-amber-400 font-mono">CASE FILE #{Math.floor(100000 + Math.random() * 900000)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* The Blotter Slip / Receipt Style Card */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 font-sans mb-4">
          {/* MVP */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/15 border border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">👑</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Party Chief (VIP MVP)</p>
                <p className="text-sm font-extrabold text-white">{mvp.name}</p>
              </div>
            </div>
            <span className="font-mono font-black text-amber-400 text-sm">{mvp.score} PTS</span>
          </div>

          {/* Chicken Out */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🐔</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-rose-300 tracking-wider">Lagos Chicken</p>
                <p className="text-sm font-extrabold text-white">{chicken.name}</p>
              </div>
            </div>
            <span className="text-[11px] text-rose-300 font-medium italic">Avoided Dares</span>
          </div>

          {/* Lekki Menace */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🌶️</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Lekki Menace</p>
                <p className="text-sm font-extrabold text-white">{randomSpicy.name}</p>
              </div>
            </div>
            <span className="text-[11px] text-purple-300 font-medium italic">Spiciest Gist</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <Share2 className="h-4 w-4" />
              <span>Share to WhatsApp</span>
            </button>
            <button
              onClick={handleCopy}
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 transition-all shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              sounds.victory();
              confetti({ particleCount: 70, spread: 60 });
              onPlayAgain();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            Start Fresh Party Round
          </button>
        </div>
      </div>
    </div>
  );
};
