// Lagos Life / Vatar Games SDK Bridge
import { VatarSession } from '../types';

declare global {
  interface Window {
    Vatar?: {
      init: () => Promise<{
        player: { id: string; name: string; avatar: string | null };
        session: string;
        mode: 'live' | 'test';
      }>;
      session: () => Promise<{ session: string; exp: number }>;
      purchase: (productId: string) => Promise<{ purchaseId: string; productId: string }>;
      onPurchase: (fn: (p: { purchaseId: string; productId: string }) => void) => () => void;
      purchases: () => Promise<Array<{ purchaseId: string; productId: string }>>;
      submitScore: (score: number) => Promise<{ best: number; accepted: boolean }>;
      leaderboard: () => Promise<{
        top: Array<{ rank: number; name: string; score: number }>;
        me: { rank: number | null; label: string; score: number } | null;
      }>;
      onPause: (fn: () => void) => () => void;
      onResume: (fn: () => void) => () => void;
      match?: {
        create: (opts: { stake: number; seats: number }) => Promise<any>;
        join: (code: string) => Promise<any>;
        quick: (opts: { stake: number }) => Promise<any>;
        current: () => Promise<any>;
        leave: () => Promise<any>;
        onUpdate: (fn: (match: any) => void) => () => void;
      };
    };
  }
}

class VatarService {
  private sessionData: VatarSession | null = null;
  private isStandalone: boolean = false;
  private unlockedPacks: Set<string> = new Set();

  private async claimPurchase(p: { purchaseId: string; productId: string }) {
    if (!p?.purchaseId) return;
    this.unlockedPacks.add(p.productId);

    try {
      let sessionToken = '';
      if (window.Vatar?.session) {
        const s = await window.Vatar.session();
        sessionToken = s.session;
      }
      await fetch('/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: sessionToken, purchaseId: p.purchaseId })
      });
      console.log('[Vatar] Claimed and delivered purchase:', p.purchaseId);
    } catch (err) {
      console.warn('[Vatar] Error claiming purchase with server:', err);
    }
  }

  public async initialize(): Promise<VatarSession> {
    if (typeof window !== 'undefined' && window.Vatar) {
      try {
        const initData = await window.Vatar.init();
        this.sessionData = {
          playerId: initData.player.id,
          name: initData.player.name || 'Lagosian',
          avatar: initData.player.avatar,
          mode: initData.mode,
          sessionToken: initData.session
        };
        this.isStandalone = false;

        // Restore pending undelivered purchases and tell server to deliver
        const pending = await window.Vatar.purchases();
        for (const p of pending) {
          await this.claimPurchase(p);
        }

        // Listen for new purchases and tell server to deliver
        window.Vatar.onPurchase((p) => {
          this.claimPurchase(p);
        });

        return this.sessionData;
      } catch (err) {
        console.warn('Vatar.init failed or returned error, falling back to mock sandbox:', err);
      }
    }

    // Fallback: Localhost / Sandbox Mock Mode
    this.isStandalone = true;
    this.sessionData = {
      playerId: 't_mock_player_01',
      name: 'Tolu (VIP)',
      avatar: null,
      mode: 'sandbox',
      sessionToken: 'mock_sandbox_session_token'
    };
    return this.sessionData;
  }

  public getSession(): VatarSession | null {
    return this.sessionData;
  }

  public isUnlocked(packId: string): boolean {
    return this.unlockedPacks.has(packId);
  }

  public async purchasePack(productId: string): Promise<boolean> {
    if (this.isStandalone || !window.Vatar) {
      // Instant test purchase in sandbox
      console.log(`[Vatar Mock] Simulating test purchase for: ${productId}`);
      this.unlockedPacks.add(productId);
      return true;
    }

    try {
      const res = await window.Vatar.purchase(productId);
      if (res && res.productId === productId) {
        await this.claimPurchase(res);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Purchase failed or canceled:', err?.code || err);
      return false;
    }
  }

  public async submitScore(score: number): Promise<void> {
    if (window.Vatar?.submitScore) {
      try {
        await window.Vatar.submitScore(score);
      } catch (e) {
        console.warn('Score submission error:', e);
      }
    }
  }

  public async getLeaderboard() {
    if (window.Vatar?.leaderboard) {
      try {
        return await window.Vatar.leaderboard();
      } catch (e) {
        console.warn('Leaderboard error:', e);
      }
    }
    // Mock leaderboard
    return {
      top: [
        { rank: 1, name: 'Chinedu (Lekki)', score: 1420 },
        { rank: 2, name: 'Bisi_The_Baddie', score: 1190 },
        { rank: 3, name: 'Tech_Bro_Kayode', score: 980 }
      ],
      me: { rank: 4, label: '#4', score: 650 }
    };
  }

  public setupLifecycle(onPause: () => void, onResume: () => void): () => void {
    if (window.Vatar) {
      const unsubPause = window.Vatar.onPause(onPause);
      const unsubResume = window.Vatar.onResume(onResume);
      return () => {
        unsubPause();
        unsubResume();
      };
    }
    return () => {};
  }
}

export const vatar = new VatarService();
