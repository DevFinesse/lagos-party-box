import React, { useState, useEffect } from 'react';
import { GameMode, DeckCategory, Player, VatarSession, StoreItem, ChatMessage } from './types';
import { vatar } from './services/vatarSdk';
import { sounds } from './services/sound';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { TruthOrDare } from './components/TruthOrDare';
import { MostLikelyTo } from './components/MostLikelyTo';
import { NeverHaveIEver } from './components/NeverHaveIEver';
import { ShopModal } from './components/ShopModal';
import { ChatDrawer } from './components/ChatDrawer';
import { STORE_ITEMS } from './data/prompts';
import { Trophy, X } from 'lucide-react';

import { multiplayer } from './services/multiplayer';

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

  // Online Multiplayer Room State
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(true);

  // In-Game Live Table Banter / Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      senderId: 'sys',
      senderName: 'Lagos Host',
      text: 'Welcome to Lagos Party Box! 🎉 Type your confessions, banter, or drop quick reactions!',
      timestamp: Date.now(),
      isSystem: true
    }
  ]);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);

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

      const activeUser: Player = {
        id: sess.playerId,
        name: sess.name || 'Lagosian',
        avatar: sess.avatar,
        hearts: 3,
        score: 0,
        isHost: true
      };

      setPlayers((prev) => [activeUser, ...prev.slice(1)]);

      // Check if URL has ?room=CODE invite
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const inviteRoom = urlParams.get('room');
        if (inviteRoom) {
          console.log('[Multiplayer] Found room invite in URL:', inviteRoom);
          multiplayer.joinRoom(inviteRoom, activeUser);
          setRoomCode(inviteRoom.toUpperCase());
          setIsHost(false);
        }
      }
    });

    // Multiplayer room listeners
    const unsubRoom = multiplayer.on('room_state', (data: any) => {
      const { room } = data;
      if (!room) return;
      console.log('[Multiplayer] Received room state:', room);
      setRoomCode(room.code);
      if (room.players && room.players.length > 0) {
        setPlayers(room.players);
        setIsHost(room.hostId === room.players[0]?.id);
      }
      if (room.mode) setSelectedMode(room.mode);
      if (room.deckCategory) setSelectedCategory(room.deckCategory);
    });

    const unsubStart = multiplayer.on('game_started', (data: any) => {
      if (data.mode) setSelectedMode(data.mode);
      if (data.deckCategory) setSelectedCategory(data.deckCategory);
      sounds.victory();
      setInGame(true);
    });

    const unsubChat = multiplayer.on('chat_message', (data: any) => {
      if (data?.message) {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        setUnreadChatCount((count) => count + 1);
        sounds.click();
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

    return () => {
      cleanup();
      unsubRoom();
      unsubStart();
      unsubChat();
    };
  }, []);

  const handleCreateRoom = () => {
    sounds.click();
    const code = multiplayer.createRoom(players[0], selectedMode, selectedCategory);
    setRoomCode(code);
    setIsHost(true);
    setPlayers([players[0]]); // Starts with host only; friends join via link!
  };

  const handleJoinRoom = (code: string) => {
    sounds.click();
    multiplayer.joinRoom(code, players[0]);
    setRoomCode(code.toUpperCase());
    setIsHost(false);
  };

  const handleLeaveRoom = () => {
    sounds.buzz();
    multiplayer.leaveRoom();
    setRoomCode(null);
    setIsHost(true);
    // Restore default simulated group
    setPlayers([
      players[0],
      { id: 'p_emeka', name: 'Emeka', avatar: null, hearts: 3, score: 0 },
      { id: 'p_tiwa', name: 'Tiwa', avatar: null, hearts: 3, score: 0 },
      { id: 'p_segun', name: 'Segun', avatar: null, hearts: 3, score: 0 }
    ]);
  };

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

  const handleSendMessage = (text: string) => {
    const msg = multiplayer.sendChat(text, players[0]);
    if (msg) {
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    }

    // Friendly Lagos banter replies if in local simulated room
    if (!roomCode && players.length > 1) {
      const bots = players.slice(1);
      const bot = bots[Math.floor(Math.random() * bots.length)];
      const BOT_BANTER = [
        '😂😂 Wahala dey tonight!',
        'Lie lie, no be so o! 🧢',
        'Gist don sweet die! 🔥',
        'Abeg drink your drink and keep quiet! 🍻',
        'Wahala for who no dey Lagos table! 💀',
        'I swear na real talk! 👏',
        'Omo see matter! 👀'
      ];
      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          senderId: bot.id,
          senderName: bot.name,
          senderAvatar: bot.avatar,
          text: BOT_BANTER[Math.floor(Math.random() * BOT_BANTER.length)],
          timestamp: Date.now()
        };
        setChatMessages((prev) => [...prev, botMsg]);
        setUnreadChatCount((prev) => (isChatOpen ? 0 : prev + 1));
        sounds.click();
      }, 1500);
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
            onSelectMode={(m) => {
              setSelectedMode(m);
              if (roomCode && isHost) multiplayer.send('update_settings', { mode: m });
            }}
            selectedCategory={selectedCategory}
            onSelectCategory={(c) => {
              setSelectedCategory(c);
              if (roomCode && isHost) multiplayer.send('update_settings', { deckCategory: c });
            }}
            players={players}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            onStartGame={() => {
              sounds.victory();
              if (roomCode) {
                multiplayer.startGame();
              }
              setInGame(true);
            }}
            storeItems={storeItems}
            onOpenShop={() => setIsShopOpen(true)}
            roomCode={roomCode}
            isHost={isHost}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onLeaveRoom={handleLeaveRoom}
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
                onSendMessage={handleSendMessage}
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

      {/* Floating Live Banter & Chat Drawer */}
      <ChatDrawer
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        activeUser={players[0]}
        isOpen={isChatOpen}
        onToggle={() => {
          if (!isChatOpen) setUnreadChatCount(0);
          setIsChatOpen(!isChatOpen);
        }}
        unreadCount={unreadChatCount}
      />

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
