import React, { useState, useEffect, useCallback } from 'react';
import { sounds } from '../services/sound';
import { Banknote } from 'lucide-react';

interface FallingBill {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotation: number;
  noteType: '1000' | '500';
}

interface SprayMoneyProps {
  onSprayBroadcast?: () => void;
  activeUserName: string;
}

export const SprayMoney: React.FC<SprayMoneyProps> = ({ onSprayBroadcast, activeUserName }) => {
  const [bills, setBills] = useState<FallingBill[]>([]);
  const [sprayAlert, setSprayAlert] = useState<string | null>(null);

  const triggerSpray = useCallback((sprayerName?: string) => {
    sounds.sprayMoney();
    const who = sprayerName || activeUserName;
    setSprayAlert(`💸 ${who} is spraying cash!`);
    setTimeout(() => setSprayAlert(null), 3000);

    const count = 25;
    const newBills: FallingBill[] = [];
    for (let i = 0; i < count; i++) {
      newBills.push({
        id: Date.now() + i + Math.random(),
        left: Math.random() * 90 + 5, // 5% to 95%
        delay: Math.random() * 0.4,
        duration: 2.2 + Math.random() * 1.5,
        rotation: (Math.random() - 0.5) * 60,
        noteType: Math.random() > 0.4 ? '1000' : '500'
      });
    }

    setBills((prev) => [...prev, ...newBills]);

    // Clean up bills after falling
    setTimeout(() => {
      setBills((prev) => prev.filter((b) => !newBills.some((nb) => nb.id === b.id)));
    }, 4500);
  }, [activeUserName]);

  // Handle local click on Spray button
  const handleLocalSpray = () => {
    triggerSpray(activeUserName);
    if (onSprayBroadcast) {
      onSprayBroadcast();
    }
  };

  // Expose triggerSpray to window for global events or multiplayer sync
  useEffect(() => {
    const handleRemoteSpray = (e: any) => {
      triggerSpray(e.detail?.name || 'Someone');
    };
    window.addEventListener('lagos_spray_money', handleRemoteSpray);
    return () => window.removeEventListener('lagos_spray_money', handleRemoteSpray);
  }, [triggerSpray]);

  return (
    <>
      {/* Floating Spray Button (Bottom Left) */}
      <button
        onClick={handleLocalSpray}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white font-bold text-xs shadow-[0_8px_30px_rgb(16,185,129,0.45)] hover:brightness-110 active:scale-95 transition-all border border-emerald-300/40 group"
        title="Spray Cash on the Table!"
      >
        <span className="text-base group-hover:scale-125 transition-transform">💸</span>
        <span className="font-extrabold tracking-wide uppercase">Spray ₦1,000</span>
      </button>

      {/* Spray Alert Banner */}
      {sprayAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-2xl border-2 border-white flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <span>{sprayAlert}</span>
          </div>
        </div>
      )}

      {/* Raining Naira Bills Layer */}
      {bills.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="absolute animate-moneyFall"
              style={{
                left: `${bill.left}%`,
                top: '-80px',
                animationDelay: `${bill.delay}s`,
                animationDuration: `${bill.duration}s`,
                transform: `rotate(${bill.rotation}deg)`
              }}
            >
              {bill.noteType === '1000' ? (
                // ₦1000 Crisp Blue/Gold Naira Note
                <div className="w-24 h-12 rounded-sm bg-gradient-to-r from-[#1B365D] via-[#2F528F] to-[#1B365D] border border-amber-300/80 shadow-lg p-1 flex flex-col justify-between text-[7px] text-amber-200 font-mono select-none">
                  <div className="flex justify-between items-center font-bold">
                    <span>CENTRAL BANK OF NIGERIA</span>
                    <span className="text-amber-400 font-black">₦1000</span>
                  </div>
                  <div className="flex justify-center items-center gap-1 opacity-80">
                    <Banknote className="h-4 w-4 text-amber-300" />
                    <span className="text-[6px] tracking-widest font-black text-white">ONE THOUSAND NAIRA</span>
                  </div>
                  <div className="flex justify-between items-center text-[5px] text-slate-300 font-bold">
                    <span>LAGOS VIP</span>
                    <span>₦1000</span>
                  </div>
                </div>
              ) : (
                // ₦500 Crisp Green/Gold Naira Note
                <div className="w-24 h-12 rounded-sm bg-gradient-to-r from-[#1E4D2B] via-[#2D7A46] to-[#1E4D2B] border border-emerald-300/80 shadow-lg p-1 flex flex-col justify-between text-[7px] text-emerald-100 font-mono select-none">
                  <div className="flex justify-between items-center font-bold">
                    <span>CENTRAL BANK OF NIGERIA</span>
                    <span className="text-emerald-300 font-black">₦500</span>
                  </div>
                  <div className="flex justify-center items-center gap-1 opacity-80">
                    <Banknote className="h-4 w-4 text-emerald-200" />
                    <span className="text-[6px] tracking-widest font-black text-white">FIVE HUNDRED NAIRA</span>
                  </div>
                  <div className="flex justify-between items-center text-[5px] text-slate-300 font-bold">
                    <span>LAGOS VIP</span>
                    <span>₦500</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
