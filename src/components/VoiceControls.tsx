import React, { useState, useEffect } from 'react';
import { voice } from '../services/voice';
import { sounds } from '../services/sound';
import { Player } from '../types';
import { Mic, MicOff, PhoneOff, Radio, AlertCircle } from 'lucide-react';

interface VoiceControlsProps {
  activePlayer: Player;
  players: Player[];
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({ activePlayer, players }) => {
  const [voiceState, setVoiceState] = useState({
    isActive: voice.isActive,
    isMuted: voice.isMuted,
    speakingPlayers: Array.from(voice.speakingPlayers),
    error: voice.error
  });
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  useEffect(() => {
    const unsub = voice.subscribe((state) => {
      setVoiceState(state);
      setIsConnecting(false);
    });
    return () => unsub();
  }, []);

  const handleToggleVoice = async () => {
    sounds.click();
    if (!voiceState.isActive) {
      setIsConnecting(true);
      const otherPlayerIds = players.filter((p) => p.id !== activePlayer.id).map((p) => p.id);
      await voice.startVoice(activePlayer.id, otherPlayerIds);
    } else {
      voice.toggleMute();
    }
  };

  const handleDisconnect = () => {
    sounds.buzz();
    voice.stopVoice();
  };

  return (
    <>
      {/* Floating Voice Bar (Bottom Center) */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 rounded-full bg-[#130E26]/90 border border-purple-500/30 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.6)]">
        {/* Main Mic Toggle */}
        <button
          onClick={handleToggleVoice}
          disabled={isConnecting}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-bold text-xs transition-all active:scale-95 shadow-md ${
            !voiceState.isActive
              ? 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
              : voiceState.isMuted
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 ring-2 ring-emerald-500/30'
          }`}
          title={
            !voiceState.isActive
              ? 'Join Voice Chat'
              : voiceState.isMuted
              ? 'Unmute Microphone'
              : 'Mute Microphone'
          }
        >
          {isConnecting ? (
            <Radio className="h-4 w-4 animate-spin text-amber-400" />
          ) : !voiceState.isActive ? (
            <MicOff className="h-4 w-4 text-slate-400" />
          ) : voiceState.isMuted ? (
            <MicOff className="h-4 w-4 text-rose-400" />
          ) : (
            <div className="relative">
              <Mic className="h-4 w-4 text-emerald-400" />
              {voiceState.speakingPlayers.includes(activePlayer.id) && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
          )}

          <span className="text-[11px] uppercase tracking-wider font-extrabold">
            {isConnecting
              ? 'Connecting...'
              : !voiceState.isActive
              ? 'Join Voice'
              : voiceState.isMuted
              ? 'Muted'
              : 'Live Mic'}
          </span>
        </button>

        {/* Leave Voice button if active */}
        {voiceState.isActive && (
          <button
            onClick={handleDisconnect}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all active:scale-95"
            title="Leave Voice Chat"
          >
            <PhoneOff className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Mic Permission Error Toast */}
      {voiceState.error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="px-4 py-2.5 rounded-2xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 shadow-2xl backdrop-blur-md">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{voiceState.error}</span>
          </div>
        </div>
      )}
    </>
  );
};
