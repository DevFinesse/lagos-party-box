import { multiplayer } from './multiplayer';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

type VoiceStateListener = (state: {
  isActive: boolean;
  isMuted: boolean;
  speakingPlayers: string[];
  error: string | null;
}) => void;

class VoiceService {
  private localStream: MediaStream | null = null;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private remoteAudioElements: Map<string, HTMLAudioElement> = new Map();
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private speakingInterval: any = null;

  public isActive: boolean = false;
  public isMuted: boolean = false;
  public speakingPlayers: Set<string> = new Set();
  public error: string | null = null;

  private activePlayerId: string = '';
  private listeners: Set<VoiceStateListener> = new Set();

  constructor() {
    this.setupMultiplayerListeners();
  }

  public subscribe(listener: VoiceStateListener) {
    this.listeners.add(listener);
    listener({
      isActive: this.isActive,
      isMuted: this.isMuted,
      speakingPlayers: Array.from(this.speakingPlayers),
      error: this.error
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) =>
      fn({
        isActive: this.isActive,
        isMuted: this.isMuted,
        speakingPlayers: Array.from(this.speakingPlayers),
        error: this.error
      })
    );
  }

  private setupMultiplayerListeners() {
    multiplayer.on('voice_signal', async (data: any) => {
      if (!this.isActive || !this.localStream) return;
      const { senderId, signal } = data;
      if (!senderId || !signal) return;

      let pc = this.peers.get(senderId);
      if (!pc) {
        pc = this.createPeerConnection(senderId);
      }

      try {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          multiplayer.sendVoiceSignal(senderId, this.activePlayerId, pc.localDescription);
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
        } else if (signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.warn('[Voice] Signal error with peer:', senderId, err);
      }
    });

    multiplayer.on('voice_speaking', (data: any) => {
      const { playerId, isSpeaking } = data;
      if (isSpeaking) {
        this.speakingPlayers.add(playerId);
      } else {
        this.speakingPlayers.delete(playerId);
      }
      this.notify();
    });
  }

  public async startVoice(activePlayerId: string, remotePlayerIds: string[] = []): Promise<boolean> {
    this.activePlayerId = activePlayerId;
    this.error = null;

    if (!navigator.mediaDevices?.getUserMedia) {
      this.error = 'Voice chat is not supported on this browser.';
      this.notify();
      return false;
    }

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.isActive = true;
      this.isMuted = false;
      this.startVoiceActivityDetection();

      // Connect to existing peers in the room (we initiate as new entrant)
      for (const peerId of remotePlayerIds) {
        if (peerId !== this.activePlayerId) {
          this.initiateConnection(peerId);
        }
      }

      this.notify();
      return true;
    } catch (err: any) {
      console.warn('[Voice] Mic access error:', err);
      this.error = err?.message || 'Microphone access denied. Check your browser permissions.';
      this.isActive = false;
      this.notify();
      return false;
    }
  }

  public toggleMute(): boolean {
    if (!this.localStream) return false;
    const track = this.localStream.getAudioTracks()[0];
    if (track) {
      this.isMuted = !this.isMuted;
      track.enabled = !this.isMuted;
      if (this.isMuted) {
        this.speakingPlayers.delete(this.activePlayerId);
        multiplayer.sendVoiceSpeaking(this.activePlayerId, false);
      }
      this.notify();
    }
    return this.isMuted;
  }

  public stopVoice() {
    if (this.speakingInterval) {
      clearInterval(this.speakingInterval);
      this.speakingInterval = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    this.peers.forEach((pc) => pc.close());
    this.peers.clear();

    this.remoteAudioElements.forEach((el) => {
      el.pause();
      el.srcObject = null;
      el.remove();
    });
    this.remoteAudioElements.clear();

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    this.isActive = false;
    this.isMuted = false;
    this.speakingPlayers.clear();
    multiplayer.sendVoiceSpeaking(this.activePlayerId, false);
    this.notify();
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to send to peer
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // ICE candidate generation
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        multiplayer.sendVoiceSignal(peerId, this.activePlayerId, {
          candidate: event.candidate
        });
      }
    };

    // Receive peer audio stream
    pc.ontrack = (event) => {
      let audio = this.remoteAudioElements.get(peerId);
      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        this.remoteAudioElements.set(peerId, audio);
      }
      audio.srcObject = event.streams[0];
      audio.play().catch((e) => console.warn('Audio play error:', e));
    };

    this.peers.set(peerId, pc);
    return pc;
  }

  private async initiateConnection(peerId: string) {
    const pc = this.createPeerConnection(peerId);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      multiplayer.sendVoiceSignal(peerId, this.activePlayerId, pc.localDescription);
    } catch (err) {
      console.warn('[Voice] Failed to create offer for peer:', peerId, err);
    }
  }

  private startVoiceActivityDetection() {
    if (!this.localStream) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.localStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let wasSpeaking = false;

      this.speakingInterval = setInterval(() => {
        if (!this.analyser || this.isMuted || !this.isActive) {
          if (wasSpeaking) {
            wasSpeaking = false;
            this.speakingPlayers.delete(this.activePlayerId);
            multiplayer.sendVoiceSpeaking(this.activePlayerId, false);
            this.notify();
          }
          return;
        }

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const isSpeaking = avg > 20; // speaking threshold

        if (isSpeaking !== wasSpeaking) {
          wasSpeaking = isSpeaking;
          if (isSpeaking) {
            this.speakingPlayers.add(this.activePlayerId);
          } else {
            this.speakingPlayers.delete(this.activePlayerId);
          }
          multiplayer.sendVoiceSpeaking(this.activePlayerId, isSpeaking);
          this.notify();
        }
      }, 150);
    } catch (e) {
      console.warn('[Voice] VAD initialization failed:', e);
    }
  }
}

export const voice = new VoiceService();
