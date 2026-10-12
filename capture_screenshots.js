// capture_screenshots.js
// Launches a temporary static server and uses Microsoft Edge headless to capture
// high-resolution 375x812 mobile portrait screenshots for Vatar Games review!

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8085;
const distDir = path.join(__dirname, 'dist');
const outDir = path.join(__dirname, 'screenshots');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Simple static server for dist
const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(distDir, urlPath === '/' ? 'index.html' : urlPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };

  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Screenshot server running on http://localhost:${PORT}`);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const views = [
    { name: 'screenshot_1_lobby.png', url: `http://localhost:${PORT}/` },
    { name: 'screenshot_2_truth_or_dare.png', url: `http://localhost:${PORT}/?view=truth_or_dare` },
    { name: 'screenshot_3_most_likely_to.png', url: `http://localhost:${PORT}/?view=most_likely_to` },
    { name: 'screenshot_4_never_have_i_ever.png', url: `http://localhost:${PORT}/?view=never_have_i_ever` },
    { name: 'screenshot_5_blotter.png', url: `http://localhost:${PORT}/?view=blotter` }
  ];

  for (const v of views) {
    const dest = path.join(outDir, v.name);
    console.log(`Capturing ${v.name}...`);
    try {
      const cmd = `"${edgePath}" --headless --disable-gpu --screenshot="${dest}" --window-size=375,812 --virtual-time-budget=2000 "${v.url}"`;
      execSync(cmd, { stdio: 'ignore' });
      console.log(`Saved: ${dest}`);
    } catch (e) {
      console.error(`Failed to capture ${v.name}:`, e.message);
    }
  }

  console.log('\nAll gameplay screenshots captured successfully in ./screenshots !');
  server.close(() => process.exit(0));
});
