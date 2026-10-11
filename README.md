# 🍾 Lagos Party Box · Lagos Life Games

A cheat-proof, multiplayer party game suite designed specifically for the **[Lagos Life](https://lagoslife.app)** browser ecosystem using the **Vatar Games SDK (`vatar-games-v1.js`)**.

Players can switch between multiple Nigerian party game modes in the same room without leaving:

1. **🍾 Truth or Dare (Lagos Afterdark)**:
   - Interactive 3D/2D bottle spinner on a VIP club table.
   - Hot seat decision: Truth, Dare, or Forfeit (pay coins / take a drink).
   - Nigerian prompts with a 45s timer and group resolution.
2. **🫵 Who is Most Likely To...? (Naija Call-Out)**:
   - 15-second rapid voting on player avatars.
   - Heart elimination system: the most-voted culprit loses a heart.
3. **🙈 Never Have I Ever (Lagos Edition)**:
   - Drink count & confession showdown.
4. **🛍️ VIP Deck Shop**:
   - In-app purchases for expansion decks (*Lekki Afterdark 18+*, *Lagos Street & Wahala*, *VIP Bottle Skins*) integrated with `Vatar.purchase()`.

---

## 🛠️ Project Structure

```
lagoslifewwbam/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx         # Player status, coins, VIP shop & sound toggle
│   │   ├── BottleSpinner.tsx  # Radial table + animated Lagos Beer bottle
│   │   ├── TruthOrDare.tsx    # Truth/Dare hot-seat gameplay
│   │   ├── MostLikelyTo.tsx   # Rapid avatar voting grid & culprit reveal
│   │   ├── NeverHaveIEver.tsx # Shots/lives counter & prompt cards
│   │   ├── Lobby.tsx          # Mode selector, category chooser & player roster
│   │   └── ShopModal.tsx      # In-app purchase modal for Vatar store packs
│   ├── data/
│   │   └── prompts.ts         # Authentic Nigerian party prompts & store packs
│   ├── services/
│   │   ├── sound.ts           # Web Audio API sound synthesizer (zero asset files)
│   │   └── vatarSdk.ts        # Vatar SDK bridge + Sandbox Mock fallback
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces & game models
│   ├── App.tsx                # Master game state manager
│   ├── main.tsx               # React mount
│   └── index.css              # Tailwind v4 styles
├── server.js                  # Node.js backend with CSP header & Vatar verification
├── package.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### 1. Run Development Server (Local Test)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
*Note: In local standalone mode, the built-in **Vatar Sandbox Mock** automatically provides simulated players and instant test purchases so you can test everything immediately.*

### 2. Build for Production
```bash
npm run build
```

### 3. Run the Production Server
```bash
npm run server
```
Serves the game on `http://localhost:8080` with the required **Content-Security-Policy** frame headers for Lagos Life.

---

## 🔑 Lagos Life Developer Integration

1. Go to **[lagoslife.app/developers](https://lagoslife.app/developers)** and click **Get your keys**.
2. Set your Game URL to your deployed HTTPS address (e.g. `https://your-domain.com`).
3. In your dashboard, create the matching product IDs:
   - `pack_lekki_afterdark` (₦300)
   - `pack_street_savage` (₦200)
   - `pack_vip_bottle` (₦500)
4. Set your environment variables on your production host:
   ```env
   VATAR_SECRET=vtr_test_...          # Test secret first, vtr_live_... once approved
   VATAR_WEBHOOK_SECRET=vtr_whsec_...
   PORT=8080
   ```
5. Test inside the Lagos Life sandbox player at `/developers/sandbox/<draft>`.
