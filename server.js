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
      // Verify player session
      const me = await api('/session/verify', { session });
      // Verify purchase record with Vatar
      const p = await api(`/purchases/${encodeURIComponent(purchaseId)}`);

      if (me.http !== 200 || p.http !== 200 || p.playerId !== me.playerId) {
        return res.writeHead(403, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'forbidden' }));
      }
      if (p.status === 'refunded') {
        return res.writeHead(409, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'refunded' }));
      }

      // Mark purchase as delivered
      await api(`/purchases/${p.id}/deliver`, {});
      return res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ status: 'delivered', productId: p.productId }));
    } catch (err) {
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
const rooms = new Map(); // roomCode -> Set of websockets

wss.on('connection', (ws) => {
  let currentRoom = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'join_room') {
        currentRoom = data.roomCode;
        if (!rooms.has(currentRoom)) rooms.set(currentRoom, new Set());
        rooms.get(currentRoom).add(ws);
        broadcast(currentRoom, { type: 'player_joined', player: data.player });
      } else if (data.type === 'game_action' && currentRoom) {
        broadcast(currentRoom, data, ws);
      }
    } catch (e) {
      console.warn('WS error:', e);
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(ws);
      if (rooms.get(currentRoom).size === 0) rooms.delete(currentRoom);
    }
  });
});

function broadcast(roomCode, msg, sender = null) {
  const clients = rooms.get(roomCode);
  if (!clients) return;
  const payload = JSON.stringify(msg);
  for (const client of clients) {
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
