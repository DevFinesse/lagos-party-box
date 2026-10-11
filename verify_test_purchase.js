// verify_test_purchase.js
// Run: node verify_test_purchase.js <purchaseId> <vtr_test_secret>
// Or set VATAR_SECRET in environment and run: node verify_test_purchase.js <purchaseId>

const purchaseId = process.argv[2];
const secret = process.argv[3] || process.env.VATAR_SECRET;

if (!purchaseId || !secret) {
  console.log(`
Usage:
  node verify_test_purchase.js <purchaseId> <vtr_test_secret>

Example:
  node verify_test_purchase.js 3b9d0c41e7a24f8f9a10 vtr_test_abcdef123456
  `);
  process.exit(1);
}

const API = 'https://lagoslife.app/api/games/v1';

async function run() {
  console.log(`Checking purchase ${purchaseId} with Vatar API...`);
  
  // Step 1: Verify purchase (ticks "A purchase verified by your server")
  const checkRes = await fetch(`${API}/purchases/${encodeURIComponent(purchaseId)}`, {
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json'
    }
  });
  
  const checkData = await checkRes.json();
  console.log(`GET /purchases/${purchaseId} status:`, checkRes.status, checkData);

  if (!checkRes.ok) {
    console.error('Failed to verify purchase. Check your VATAR_SECRET.');
    process.exit(1);
  }

  // Step 2: Mark delivered (ticks "One marked delivered")
  console.log(`Marking purchase ${purchaseId} delivered...`);
  const delRes = await fetch(`${API}/purchases/${encodeURIComponent(purchaseId)}/deliver`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  const delData = await delRes.json();
  console.log(`POST /purchases/${purchaseId}/deliver status:`, delRes.status, delData);

  if (delRes.ok) {
    console.log('\n🎉 SUCCESS! "A purchase verified by your server" and "One marked delivered" are now both satisfied!');
  }
}

run().catch(console.error);
