import { Player, GameMode, DeckCategory, ChatMessage } from '../types';

export interface RoomInfo {
  code: string;
  hostId: string;
  players: Player[];
  mode: GameMode;
  deckCategory: DeckCategory;
  inGame: boolean;
}

type MessageHandler = (data: any) => void;

class MultiplayerService {
  private ws: WebSocket | null = null;
  private currentRoomCode: string | null = null;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  public isConnected: boolean = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // In dev with vite on 3000, websocket connects to 8080 or same origin in production
      const wsUrl =
        window.location.port === '3000'
          ? `${protocol}//${window.location.hostname}:8080`
          : `${protocol}//${window.location.host}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('[Multiplayer] Connected to WebSocket server');
        if (this.currentRoomCode) {
          // Re-join if reconnected
          this.dispatch('reconnected', {});
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.dispatch(data.type, data);
        } catch (e) {
          console.warn('WS parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        console.log('[Multiplayer] Disconnected, retrying in 3s...');
        setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (err) => {
        console.warn('[Multiplayer] WS error:', err);
      };
    } catch (e) {
      console.warn('[Multiplayer] Connection init failed:', e);
    }
  }

  public on(type: string, handler: MessageHandler) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);
    return () => {
      this.listeners.get(type)?.delete(handler);
    };
  }

  private dispatch(type: string, data: any) {
    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.forEach((fn) => fn(data));
    }
  }

  public send(type: string, payload: any = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...payload, roomCode: this.currentRoomCode }));
    }
  }

  public createRoom(host: Player, mode: GameMode, category: DeckCategory): string {
    // Generate clean 6-char room code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    this.currentRoomCode = code;
    this.send('create_room', {
      code,
      player: host,
      mode,
      deckCategory: category
    });

    return code;
  }

  public joinRoom(code: string, player: Player) {
    this.currentRoomCode = code.toUpperCase().trim();
    this.send('join_room', {
      code: this.currentRoomCode,
      player
    });
  }

  public startGame() {
    this.send('start_game');
  }

  public broadcastAction(action: string, data: any) {
    this.send('game_action', { action, data });
  }

  public leaveRoom() {
    if (this.currentRoomCode) {
      this.send('leave_room', { code: this.currentRoomCode });
      this.currentRoomCode = null;
    }
  }

  public sendChat(text: string, sender: Player) {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      text: text.trim(),
      timestamp: Date.now()
    };
    this.send('chat_message', { message: msg });
    return msg;
  }

  public getInviteLink(roomCode: string): string {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomCode);
    return url.toString();
  }

  public getWhatsAppShareLink(roomCode: string): string {
    const link = this.getInviteLink(roomCode);
    const text = `Join my Lagos Party Box room on Lagos Life! Room Code: ${roomCode}\nTap to enter: ${link}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }
}

export const multiplayer = new MultiplayerService();
