import React, { useState } from 'react';
import { PromptItem, DeckCategory } from '../types';
import { sounds } from '../services/sound';
import { X, Sparkles, Send, EyeOff } from 'lucide-react';

interface CustomPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPrompt: (prompt: PromptItem, isAnonymous: boolean) => void;
}

export const CustomPromptModal: React.FC<CustomPromptModalProps> = ({
  isOpen,
  onClose,
  onSubmitPrompt
}) => {
  const [promptType, setPromptType] = useState<'truth' | 'dare' | 'most_likely' | 'never_ever'>('truth');
  const [category, setCategory] = useState<DeckCategory>('street');
  const [isSpicy, setIsSpicy] = useState<boolean>(false);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [text, setText] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    let formattedText = text.trim();
    if (promptType === 'most_likely' && !formattedText.toLowerCase().startsWith('most likely to')) {
      formattedText = `Most likely to ${formattedText}`;
    } else if (promptType === 'never_ever' && !formattedText.toLowerCase().startsWith('never have i ever')) {
      formattedText = `Never have I ever ${formattedText}`;
    }

    const newPrompt: PromptItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      category: isSpicy ? 'spicy_18' : category,
      type: promptType === 'most_likely' ? 'most_likely' : promptType === 'never_ever' ? undefined : promptType,
      text: formattedText,
      spicy: isSpicy
    };

    onSubmitPrompt(newPrompt, isAnonymous);
    sounds.click();
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-[#130E22] border border-purple-500/30 p-6 shadow-2xl overflow-hidden relative">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 -z-10 h-40 w-40 rounded-full bg-purple-600/20 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h3 className="font-display text-lg font-bold text-white">Put Your Friends On Blast</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Write a custom prompt or secret gossip. It will be secretly slipped into the live game deck!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Selector */}
          <div>
            <label className="text-[11px] font-bold text-purple-300 uppercase block mb-1.5">Game Deck</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'truth', label: '💬 Truth' },
                { id: 'dare', label: '🔥 Dare' },
                { id: 'most_likely', label: '👀 Most Likely' },
                { id: 'never_ever', label: '🍻 Never Ever' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    sounds.click();
                    setPromptType(opt.id as any);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    promptType === opt.id
                      ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Text Input */}
          <div>
            <label className="text-[11px] font-bold text-purple-300 uppercase block mb-1.5">Your Custom Prompt</label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                promptType === 'truth'
                  ? 'e.g., What is the most embarrassing lie you told on a date in Ikeja?'
                  : promptType === 'dare'
                  ? 'e.g., Call your favorite contact and demand ₦50,000 transport fare!'
                  : promptType === 'most_likely'
                  ? 'e.g., borrow car key to pose on Instagram'
                  : 'e.g., eaten someone else food from the fridge and blamed NEPA'
              }
              maxLength={220}
              className="w-full rounded-2xl bg-black/40 border border-white/10 p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none"
            />
            <div className="flex justify-end text-[10px] text-slate-500 mt-1">
              {text.length}/220 characters
            </div>
          </div>

          {/* Spice & Category options */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                sounds.click();
                setIsSpicy(!isSpicy);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                isSpicy
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <span>🌶️ 18+ Lekki Nights Spice</span>
              <span className={`text-[10px] ${isSpicy ? 'text-rose-400' : 'text-slate-500'}`}>
                {isSpicy ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.click();
                setIsAnonymous(!isAnonymous);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                isAnonymous
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <EyeOff className="h-3.5 w-3.5" />
              <span>Anonymous Mode</span>
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-105 disabled:opacity-40 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
          >
            <Send className="h-4 w-4" />
            <span>Slip Into Live Deck</span>
          </button>
        </form>
      </div>
    </div>
  );
};
