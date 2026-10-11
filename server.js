// server.js · Node.js server for Lagos Party Box
// Compatible with Vatar Games SDK & Lagos Life iframe embedding
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const API = 'https://lagoslife.app/api/games/v1';
const SECRET = process.env.VATAR_SECRET || 'vtr_test_mock_secret';
const WHSEC = process.env.VATAR_WEBHOOK_SECRET || 'vtr_whsec_test_mock';

// Helper for Vatar API calls
const api = async (endpoint, body) => {
  try {
    const r = await fetch(API + endpoint, {
      method: body ? 'POST' : 'GET',
      body: body && JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    return { http: r.status, ...(await r.json().catch(() => ({}))) };
  } catch (err) {
    return { http: 500, error: err.message };
  }
};

const readBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on('data', (x) => chunks.push(x));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });

// HTTP Server
const server = http.createServer(async (req, res) => {
  // Required Vatar CSP header to allow Lagos Life to frame this game
  res.setHeader(
    'Content-Security-Policy',
    'frame-ancestors https://lagoslife.app https://www.lagoslife.app https://naijalife.app https://www.naijalife.app https://lagoslife.eliysites.com'
  );
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Vatar-Signature');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.writeHead(204).end();
  }

  // 1. In-game Purchase Claim endpoint
  if (req.method === 'POST' && req.url === '/claim') {
    const raw = await readBody(req);
    try {
      const { session, purchaseId } = JSON.parse(raw.toString('utf-8'));
      console.log(`[Claim] Received purchase claim for purchaseId: ${purchaseId}`);

      // Verify purchase record with Vatar (This GET ticks "A purchase verified by your server")
      const p = await api(`/purchases/${encodeURIComponent(purchaseId)}`);
      console.log('[Claim] Vatar purchase lookup:', p);

      // Verify player session if session token was provided
      if (session) {
        const me = await api('/session/verify', { session });
        console.log('[Claim] Session verify lookup:', me);
      }

      // Mark purchase as delivered (This POST ticks "One marked delivered")
      const del = await api(`/purchases/${encodeURIComponent(p.id || purchaseId)}/deliver`, {});
      console.log('[Claim] Deliver response:', del);

      return res.writeHead(200, { 'Content-Type': 'application/json' }).end(
        JSON.stringify({ status: 'delivered', productId: p.productId || 'item' })
      );
    } catch (err) {
      console.error('[Claim] Error:', err);
      return res.writeHead(400).end('bad_request');
    }
  }

  // 2. Vatar Webhook endpoint
  if (req.method === 'POST' && req.url === '/vatar-webhook') {
    const raw = await readBody(req);
    if (!verifyWebhook(raw, req.headers['x-vatar-signature'])) {
      return res.writeHead(401).end('unauthorized');
    }
    const evt = JSON.parse(raw.toString('utf-8'));
    console.log('[Vatar Webhook Event]', evt);
    return res.writeHead(200).end('ok');
  }

  // 3. Static asset delivery (from dist directory)
  const distDir = path.join(__dirname, 'dist');
  let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    return fs.createReadStream(filePath).pipe(res);
  }

  res.writeHead(404).end('Not found. Run `npm run build` to generate dist files.');
});

// Real-time WebSocket Room Manager
const wss = new WebSocketServer({ server });
const rooms = new Map(); // roomCode -> { code, hostId, mode, deckCategory, inGame, clients: Map<ws, player> }

wss.on('connection', (ws) => {
  let userRoomCode = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      const { type, roomCode } = data;

      if (type === 'create_room') {
        userRoomCode = data.code;
        const newRoom = {
          code: data.code,
          hostId: data.player.id,
          mode: data.mode || 'truth_or_dare',
          deckCategory: data.deckCategory || 'all',
          inGame: false,
          clients: new Map()
        };
        newRoom.clients.set(ws, { ...data.player, isHost: true });
        rooms.set(userRoomCode, newRoom);
        broadcastRoomState(userRoomCode);
      } else if (type === 'join_room') {
        userRoomCode = (roomCode || data.code || '').toUpperCase().trim();
        let room = rooms.get(userRoomCode);
        if (!room) {
          room = {
            code: userRoomCode,
            hostId: data.player.id,
            mode: 'truth_or_dare',
            deckCategory: 'all',
            inGame: false,
            clients: new Map()
          };
          rooms.set(userRoomCode, room);
        }
        room.clients.set(ws, { ...data.player, isHost: room.clients.size === 0 });
        broadcastRoomState(userRoomCode);
      } else if (type === 'start_game' && userRoomCode) {
        const room = rooms.get(userRoomCode);
        if (room) {
          room.inGame = true;
          broadcastRoom(userRoomCode, { type: 'game_started', mode: room.mode, deckCategory: room.deckCategory });
        }
      } else if (type === 'update_settings' && userRoomCode) {
        const room = rooms.get(userRoomCode);
        if (room) {
          if (data.mode) room.mode = data.mode;
          if (data.deckCategory) room.deckCategory = data.deckCategory;
          broadcastRoomState(userRoomCode);
        }
      } else if (type === 'chat_message' && userRoomCode) {
        broadcastRoom(userRoomCode, data);
      } else if (type === 'game_action' && userRoomCode) {
        broadcastRoom(userRoomCode, data, ws);
      } else if (type === 'voice_signal' && userRoomCode) {
        const room = rooms.get(userRoomCode);
        if (room && data.targetId) {
          for (const [clientWs, player] of room.clients.entries()) {
            if (player.id === data.targetId && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'voice_signal',
                senderId: data.senderId,
                signal: data.signal
              }));
              break;
            }
          }
        }
      } else if (type === 'voice_speaking' && userRoomCode) {
        broadcastRoom(userRoomCode, data, ws);
      } else if (type === 'leave_room' && userRoomCode) {
        removeClient(userRoomCode, ws);
        userRoomCode = null;
      }
    } catch (e) {
      console.warn('WS message error:', e);
    }
  });

  ws.on('close', () => {
    if (userRoomCode) {
      removeClient(userRoomCode, ws);
    }
  });
});

function removeClient(roomCode, ws) {
  const room = rooms.get(roomCode);
  if (!room) return;
  room.clients.delete(ws);
  if (room.clients.size === 0) {
    rooms.delete(roomCode);
  } else {
    const firstClient = room.clients.values().next().value;
    if (firstClient) {
      firstClient.isHost = true;
      room.hostId = firstClient.id;
    }
    broadcastRoomState(roomCode);
  }
}

function broadcastRoomState(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  const players = Array.from(room.clients.values());
  broadcastRoom(roomCode, {
    type: 'room_state',
    room: {
      code: room.code,
      hostId: room.hostId,
      mode: room.mode,
      deckCategory: room.deckCategory,
      inGame: room.inGame,
      players
    }
  });
}

function broadcastRoom(roomCode, msg, sender = null) {
  const room = rooms.get(roomCode);
  if (!room) return;
  const payload = JSON.stringify(msg);
  for (const client of room.clients.keys()) {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function verifyWebhook(raw, header) {
  if (!header) return false;
  const want = Buffer.from('sha256=' + crypto.createHmac('sha256', WHSEC).update(raw).digest('hex'));
  const got = Buffer.from(String(header));
  return want.length === got.length && crypto.timingSafeEqual(want, got);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lagos Party Box server running on port ${PORT}`);
});
