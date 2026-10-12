// verify_test_match.js
// Submits a signed multiplayer match result to the Vatar API to tick:
// "a test match created, joined and its result posted by your server"
//
// Usage:
//   node verify_test_match.js <matchId> <matchNonce> [winnerPlayerId] [vatar_secret] [vatar_results_secret]
//
// Or set VATAR_SECRET and VATAR_RESULTS_SECRET in environment:
//   node verify_test_match.js <matchId> <matchNonce>

import crypto from 'node:crypto';

const matchId = process.argv[2];
const nonce = process.argv[3];
const winner = process.argv[4] || 'draw';
const secret = process.argv[5] || process.env.VATAR_SECRET;
const resultsSecret = process.argv[6] || process.env.VATAR_RESULTS_SECRET;

if (!matchId || !nonce || !secret || !resultsSecret) {
  console.log(`
Usage:
  node verify_test_match.js <matchId> <matchNonce> [winner] [VATAR_SECRET] [VATAR_RESULTS_SECRET]

Example:
  node verify_test_match.js m_12345 nonce_abc draw vtr_test_secret vtr_res_test_secret

Notes:
  - match.nonce comes from match.started webhook, or GET /matches/{id}.
  - winner can be a playerId (e.g. t_...) or "draw".
`);
  process.exit(1);
}

const API = 'https://lagoslife.app/api/games/v1';

async function run() {
  console.log(`Submitting result for match ${matchId} (nonce: ${nonce}, winner: ${winner})...`);

  const path = `/api/games/v1/matches/${encodeURIComponent(matchId)}/result`;
  const body = JSON.stringify({ winner });
  const ts = String(Math.floor(Date.now() / 1000));
  const sha = crypto.createHash('sha256').update(body).digest('hex');

  const sig =
    'v1=' +
    crypto
      .createHmac('sha256', resultsSecret)
      .update(['POST', path, ts, nonce, sha].join('\n'))
      .digest('hex');

  const res = await fetch(`${API}/matches/${encodeURIComponent(matchId)}/result`, {
    method: 'POST',
    body,
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
      'X-Vatar-Timestamp': ts,
      'X-Vatar-Signature': sig
    }
  });

  const data = await res.json().catch(() => ({}));
  console.log(`POST /matches/${matchId}/result status:`, res.status, data);

  if (res.ok) {
    console.log('\n🎉 SUCCESS! Test match result submitted successfully!');
    console.log('Your Vatar dashboard checklist item "test match created, joined and its result posted by your server" is now satisfied!');
  } else {
    console.error('Failed to submit match result. Check error details above.');
  }
}

run().catch(console.error);
