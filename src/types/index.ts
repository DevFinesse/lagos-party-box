export interface Player {
  id: string;
  name: string;
  avatar: string | null;
  hearts: number; // for elimination modes
  score: number;
  walletBalance?: number;
  drinksCount?: number;
  isHost?: boolean;
  isBot?: boolean;
}

export type GameMode = 'truth_or_dare' | 'most_likely_to' | 'never_have_i_ever';

export type DeckCategory = 'all' | 'chill' | 'spicy_18' | 'campus' | 'street';

export interface PromptItem {
  id: string;
  category: DeckCategory;
  text: string;
  type?: 'truth' | 'dare' | 'most_likely' | 'never_ever';
  spicy?: boolean;
}

export interface RoomState {
  code: string;
  mode: GameMode;
  hostId: string;
  stake: number;
  deckCategory: DeckCategory;
  status: 'lobby' | 'playing' | 'round_over' | 'game_over';
  players: Player[];
  currentTurnPlayerId?: string; // for Truth or Dare
  currentPrompt?: PromptItem;
  votes: Record<string, string>; // voterId -> targetPlayerId (for Most Likely To)
  responses: Record<string, boolean>; // playerId -> true/false (for Never Have I Ever)
  timer: number;
  roundNumber: number;
  winner?: Player | null;
}

export interface VatarSession {
  playerId: string;
  name: string;
  avatar: string | null;
  mode: 'live' | 'test' | 'sandbox';
  sessionToken: string;
}

export interface StoreItem {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  badge?: string;
  unlocked: boolean;
  isConsumable?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}
