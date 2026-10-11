import React, { useState, useEffect } from 'react';
import { GameMode, DeckCategory, Player, VatarSession, StoreItem } from './types';
import { vatar } from './services/vatarSdk';
import { sounds } from './services/sound';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { TruthOrDare } from './components/TruthOrDare';
import { MostLikelyTo } from './components/MostLikelyTo';
import { NeverHaveIEver } from './components/NeverHaveIEver';
import { ShopModal } from './components/ShopModal';
import { STORE_ITEMS } from './data/prompts';
import { Trophy, X } from 'lucide-react';

export const App: React.FC = () => {
  const [session, setSession] = useState<VatarSession | null>(null);
  const [inGame, setInGame] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>('truth_or_dare');
  const [selectedCategory, setSelectedCategory] = useState<DeckCategory>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [storeItems, setStoreItems] = useState<StoreItem[]>(STORE_ITEMS);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);

  // Players in the party room
  const [players, setPlayers] = useState<Player[]>([
    { id: 'p_you', name: 'You (VIP)', avatar: null, hearts: 3, score: 0, isHost: true },
    { id: 'p_emeka', name: 'Emeka', avatar: null, hearts: 3, score: 0 },
    { id: 'p_tiwa', name: 'Tiwa', avatar: null, hearts: 3, score: 0 },
    { id: 'p_segun', name: 'Segun', avatar: null, hearts: 3, score: 0 }
  ]);

  // Initialize Vatar SDK on mount
  useEffect(() => {
    vatar.initialize().then((sess) => {
      setSession(sess);
      setStoreItems((prev) =>
        prev.map((item) => ({ ...item, unlocked: vatar.isUnlocked(item.id) }))
      );
      if (sess.name) {
        setPlayers((prev) => [
          { ...prev[0], id: sess.playerId, name: sess.name, avatar: sess.avatar },
          ...prev.slice(1)
        ]);
      }
    });

    const cleanup = vatar.setupLifecycle(
      () => {
        sounds.enabled = false;
      },
      () => {
        sounds.enabled = soundEnabled;
      }
    );

    return cleanup;
  }, []);

  const handleToggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const handleAddPlayer = (name: string) => {
    const newPlayer: Player = {
      id: `p_${Date.now()}`,
      name,
      avatar: null,
      hearts: 3,
      score: 0
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateScore = (playerId: string, delta: number) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          const newScore = p.score + delta;
          vatar.submitScore(newScore);
          return { ...p, score: newScore };
        }
        return p;
      })
    );
  };

  const handleLoseHeart = (playerId: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, hearts: Math.max(0, p.hearts - 1) } : p))
    );
  };

  const handleItemPurchased = (itemId: string) => {
    setStoreItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, unlocked: true } : item))
    );
    if (itemId === 'pack_lekki_afterdark') {
      setSelectedCategory('spicy_18');
    }
  };

  const handleOpenLeaderboard = async () => {
    sounds.click();
    const data = await vatar.getLeaderboard();
    setLeaderboardData(data);
    setIsLeaderboardOpen(true);
  };

  return (
    <div className="flex flex-col min-h-dvh h-full w-full bg-[#0A0714] text-white overflow-x-hidden overflow-y-auto selection:bg-purple-500 selection:text-white">
      {/* Background Ambience */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 80% 5%, rgba(112, 26, 179, 0.28), transparent 70%), radial-gradient(50% 40% at 10% 85%, rgba(233, 201, 255, 0.08), transparent 70%)'
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Top Navbar */}
      <Navbar
        session={session}
        activePlayer={players[0]}
        onOpenShop={() => {
          sounds.click();
          setIsShopOpen(true);
        }}
        onOpenLeaderboard={handleOpenLeaderboard}
        onGoHome={() => {
          sounds.click();
          setInGame(false);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        inGame={inGame}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 pb-12 w-full">
        {!inGame ? (
          <Lobby
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            players={players}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            onStartGame={() => {
              sounds.victory();
              setInGame(true);
            }}
            storeItems={storeItems}
            onOpenShop={() => setIsShopOpen(true)}
          />
        ) : (
          <div className="w-full flex flex-col items-center">
            {selectedMode === 'truth_or_dare' && (
              <TruthOrDare
                players={players}
                activeUser={players[0]}
                deckCategory={selectedCategory}
                onUpdateScore={handleUpdateScore}
                onNextTurn={() => {}}
                isVipSkin={
                  storeItems.find((i) => i.id === 'pack_vip_bottle')?.unlocked ||
                  vatar.isUnlocked('pack_vip_bottle')
                }
              />
            )}

            {selectedMode === 'most_likely_to' && (
              <MostLikelyTo
                players={players}
                activeUser={players[0]}
                deckCategory={selectedCategory}
                onLoseHeart={handleLoseHeart}
                onNextRound={() => {}}
              />
            )}

            {selectedMode === 'never_have_i_ever' && (
              <NeverHaveIEver
                players={players}
                activeUser={players[0]}
                deckCategory={selectedCategory}
                onTakeShot={handleLoseHeart}
                onNextRound={() => {}}
              />
            )}
          </div>
        )}
      </main>

      {/* VIP Deck Shop Modal */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        items={storeItems}
        onItemPurchased={handleItemPurchased}
        session={session}
      />

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#130E22] border border-amber-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Trophy className="h-5 w-5" />
                <h3 className="font-display text-lg font-bold text-white">Party High Rollers</h3>
              </div>
              <button
                onClick={() => setIsLeaderboardOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {leaderboardData?.top?.map((entry: any) => (
                <div
                  key={entry.rank}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-amber-400 w-5">
                      #{entry.rank}
                    </span>
                    <span className="font-semibold text-sm text-white">{entry.name}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-purple-300">
                    {entry.score} pts
                  </span>
                </div>
              ))}
            </div>

            {leaderboardData?.me && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300">Your Place: {leaderboardData.me.label}</span>
                <span className="font-mono font-bold text-white">{leaderboardData.me.score} pts</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
