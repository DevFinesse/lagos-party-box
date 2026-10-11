import React, { useState, useRef, useEffect } from 'react';
import { Player, ChatMessage } from '../types';
import { sounds } from '../services/sound';
import { MessageCircle, X, Send, Smile, Sparkles } from 'lucide-react';

interface ChatDrawerProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  activeUser: Player;
  isOpen: boolean;
  onToggle: () => void;
  unreadCount: number;
}

const QUICK_REACTIONS = [
  '😂 Wahala dey!',
  '🧢 Lie lie!',
  '👀 Gist is sweet!',
  '🔥 Too spicy!',
  '🍻 Drink your drink!',
  '💀 I am dead!'
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  messages,
  onSendMessage,
  activeUser,
  isOpen,
  onToggle,
  unreadCount
}) => {
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      sounds.click();
    }
  };

  const handleQuickReaction = (text: string) => {
    onSendMessage(text);
    sounds.click();
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-[0_8px_30px_rgb(168,85,247,0.4)] hover:brightness-110 active:scale-95 transition-all border border-purple-400/40"
          title="Open Table Chat"
        >
          <div className="relative">
            <MessageCircle className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-md animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline">Table Banter</span>
        </button>
      )}

      {/* Slide-in Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[92vw] sm:w-[380px] h-[520px] max-h-[85vh] flex flex-col rounded-3xl bg-[#120B22]/95 border border-purple-500/30 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] animate-scaleUp overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-purple-950/40">
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <div>
                <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                  Table Banter & Gist
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </h4>
                <p className="text-[10px] text-slate-400">Live chat with everyone at the table</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 [scrollbar-width:none]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Sparkles className="h-8 w-8 mb-2 text-purple-400/50" />
                <p className="text-xs font-semibold text-slate-300">No messages yet!</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Start the banter, type your confessions, or drop a quick reaction!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === activeUser.id;
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-1">
                      <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-amber-300 font-medium">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-600 to-amber-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5 shadow-sm">
                      {msg.senderAvatar ? (
                        <img src={msg.senderAvatar} alt={msg.senderName} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        msg.senderName.charAt(0)
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-slate-400 font-semibold mb-0.5 px-1">
                        {isMe ? 'You' : msg.senderName}
                      </span>
                      <div
                        className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-md ${
                          isMe
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                            : 'bg-white/10 text-slate-100 rounded-tl-none border border-white/10'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reaction Pills */}
          <div className="px-3 py-2 border-t border-white/5 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {QUICK_REACTIONS.map((rx) => (
              <button
                key={rx}
                onClick={() => handleQuickReaction(rx)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-200 transition-colors active:scale-95"
              >
                {rx}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your gist or confession…"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={200}
              className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold hover:brightness-105 disabled:opacity-40 transition-all shrink-0 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
