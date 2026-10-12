import { PromptItem, StoreItem } from '../types';

export const TRUTH_PROMPTS: PromptItem[] = [
  // Chill & Gossip
  { id: 't1', category: 'chill', type: 'truth', text: 'What is the biggest lie you ever told to avoid hanging out with someone?' },
  { id: 't2', category: 'chill', type: 'truth', text: 'Have you ever eaten someone else’s food in the fridge and blamed it on NEPA?' },
  { id: 't3', category: 'chill', type: 'truth', text: 'Who in this room would you never trust to drive you across Third Mainland Bridge at night?' },
  { id: 't4', category: 'chill', type: 'truth', text: 'Have you ever borrowed someone’s clothes or sneakers without asking and worn it outside?' },
  { id: 't5', category: 'chill', type: 'truth', text: 'What is the most ridiculous amount of money you have spent on a single night out in Lagos?' },
  
  // Street & Campus
  { id: 't6', category: 'street', type: 'truth', text: 'Have you ever entered Danfo and discovered you had no cash when the conductor asked for fare?' },
  { id: 't7', category: 'street', type: 'truth', text: 'What’s the most embarrassing encounter you’ve ever had with LASTMA or Police in Lagos?' },
  { id: 't8', category: 'campus', type: 'truth', text: 'Did you ever sign an attendance sheet in school or work for someone who was asleep at home?' },
  { id: 't9', category: 'street', type: 'truth', text: 'Have you ever pretended to receive an emergency phone call just to escape paying the bill?' },
  { id: 't10', category: 'campus', type: 'truth', text: 'Who was your most embarrassing campus crush that your friends must never know about?' },

  // Spicy / 18+ Lekki Nights
  { id: 't11', category: 'spicy_18', type: 'truth', text: 'Who among the players in this room would you date if your life depended on it?', spicy: true },
  { id: 't12', category: 'spicy_18', type: 'truth', text: 'What is the wildest thing you have ever done at a beach house or club in Lekki/VI?', spicy: true },
  { id: 't13', category: 'spicy_18', type: 'truth', text: 'Have you ever checked your partner’s phone while they were in the bathroom?', spicy: true },
  { id: 't14', category: 'spicy_18', type: 'truth', text: 'Have you ever flirted with someone just so they would pay for your drinks or food?', spicy: true },
  { id: 't15', category: 'spicy_18', type: 'truth', text: 'What is your current toxic trait that has ruined your past situationships?', spicy: true },
  { id: 't16', category: 'spicy_18', type: 'truth', text: 'Have you ever stayed in a relationship solely because of their money or car?', spicy: true },
  { id: 't17', category: 'spicy_18', type: 'truth', text: 'What’s the dirtiest text currently sitting in your WhatsApp archives?', spicy: true }
];

export const DARE_PROMPTS: PromptItem[] = [
  // Chill & Fun
  { id: 'd1', category: 'chill', type: 'dare', text: 'Do 10 press-ups right now and yell "UP NEPA!" after every single one.' },
  { id: 'd2', category: 'chill', type: 'dare', text: 'Talk with a heavy Danfo conductor accent until your next turn or pay a forfeit.' },
  { id: 'd3', category: 'chill', type: 'dare', text: 'Let the person to your left post any emoji comment on the first photo on your Instagram feed.' },
  { id: 'd4', category: 'chill', type: 'dare', text: 'Show everyone the last 3 photos in your phone gallery without skipping.' },
  
  // Street & Savage
  { id: 'd5', category: 'street', type: 'dare', text: 'Send a voice note to the 4th person on your WhatsApp chat list singing the chorus of a Burna Boy song.' },
  { id: 'd6', category: 'street', type: 'dare', text: 'Call your food delivery or favorite vendor and ask if they sell boiled snake meat.' },
  { id: 'd7', category: 'street', type: 'dare', text: 'Pretend to be an Agbero calling passengers to "Oshodi-Under-Bridge" for 30 seconds straight.' },

  // Spicy / 18+ Lekki Nights
  { id: 'd8', category: 'spicy_18', type: 'dare', text: 'Text your ex or your most recent crush "I still think about you" and do not explain for 5 minutes.', spicy: true },
  { id: 'd9', category: 'spicy_18', type: 'dare', text: 'Give the player chosen by the bottle your most seductive wink and pickup line.', spicy: true },
  { id: 'd10', category: 'spicy_18', type: 'dare', text: 'Whisper a juicy secret into the ear of the player directly opposite you.', spicy: true },
  { id: 'd11', category: 'spicy_18', type: 'dare', text: 'Put your phone on speaker and call a random contact asking them to borrow you ₦500,000 urgently.', spicy: true },
  { id: 'd12', category: 'spicy_18', type: 'dare', text: 'Let the group pick one person from your WhatsApp to receive: "Can we talk tonight?"', spicy: true }
];

export const MOST_LIKELY_TO_PROMPTS: PromptItem[] = [
  { id: 'm1', category: 'chill', text: 'Most likely to borrow an iPhone 16 just to take mirror selfies at a Lekki lounge.' },
  { id: 'm2', category: 'chill', text: 'Most likely to tell you "I’m at Third Mainland Bridge" while still sleeping inside their blanket.' },
  { id: 'm3', category: 'chill', text: 'Most likely to enter Danfo and forget to ask for their ₦200 change.' },
  { id: 'm4', category: 'campus', text: 'Most likely to date someone for 6 months just because their generator never goes off.' },
  { id: 'm5', category: 'street', text: 'Most likely to start an argument with an Agbero over ₦50.' },
  { id: 'm6', category: 'spicy_18', text: 'Most likely to date two best friends without both of them ever finding out.', spicy: true },
  { id: 'm7', category: 'spicy_18', text: 'Most likely to ghost someone after eating ₦45,000 seafood boil on the first date.', spicy: true },
  { id: 'm8', category: 'street', text: 'Most likely to become a high-profile politician and buy a mansion in Banana Island.' },
  { id: 'm9', category: 'chill', text: 'Most likely to spend their entire salary in the first 48 hours of the month.' },
  { id: 'm10', category: 'spicy_18', text: 'Most likely to send a risky picture to the family WhatsApp group by mistake.', spicy: true },
  { id: 'm11', category: 'campus', text: 'Most likely to lie that they work in Tech while learning HTML on YouTube.' },
  { id: 'm12', category: 'street', text: 'Most likely to get into a physical fight at Balogun Market over the price of jeans.' },
  { id: 'm13', category: 'spicy_18', text: 'Most likely to stalk an ex from 4 different fake Instagram burner accounts.', spicy: true },
  { id: 'm14', category: 'chill', text: 'Most likely to sleep off during their own birthday party at Quilox.' },
  { id: 'm15', category: 'spicy_18', text: 'Most likely to have a secret situationship with someone in this room right now.', spicy: true }
];

export const NEVER_HAVE_I_EVER_PROMPTS: PromptItem[] = [
  { id: 'n1', category: 'chill', text: 'Never have I ever pretended to be asleep so that I wouldn’t pay the transport fare.' },
  { id: 'n2', category: 'street', text: 'Never have I ever bought "Pure Water" and used it to wash my face in traffic.' },
  { id: 'n3', category: 'chill', text: 'Never have I ever blocked someone on WhatsApp, unblocked them to check their status, then blocked them again.' },
  { id: 'n4', category: 'spicy_18', text: 'Never have I ever had a crush on my friend’s sibling or ex.', spicy: true },
  { id: 'n5', category: 'campus', text: 'Never have I ever cooked noodles with hot water inside a flask in the hostel.' },
  { id: 'n6', category: 'spicy_18', text: 'Never have I ever flirted my way out of paying for a VIP club table or entry.', spicy: true },
  { id: 'n7', category: 'street', text: 'Never have I ever entered one-chance bus in Lagos.' },
  { id: 'n8', category: 'spicy_18', text: 'Never have I ever sent a message to the wrong person that made my heart skip 10 beats.', spicy: true },
  { id: 'n9', category: 'chill', text: 'Never have I ever lied about my salary or how much my sneakers cost.' },
  { id: 'n10', category: 'spicy_18', text: 'Never have I ever kissed someone whose name I didn’t know at a party.', spicy: true }
];

export const STORE_ITEMS: StoreItem[] = [
  {
    id: 'pack_street_savage',
    name: 'Lagos Street & Wahala Pack',
    price: 1000,
    description: 'Agbero, Danfo, Balogun market, and clubbing wahala prompts that hit home.',
    icon: '⚡',
    badge: 'POPULAR',
    unlocked: false
  },
  {
    id: 'pack_lekki_afterdark',
    name: 'Lekki Afterdark (18+)',
    price: 1500,
    description: 'Unlocks 50+ spicy, unfiltered adult truths, wild dares, and savage party call-outs.',
    icon: '🔥',
    badge: '18+ SPICY',
    unlocked: false
  },
  {
    id: 'pack_vip_bottle',
    name: 'VIP Golden Star Bottle Skin',
    price: 2500,
    description: 'Custom 24K golden champagne bottle spinner with sparkling VIP table animations.',
    icon: '🍾',
    badge: 'LUXURY',
    unlocked: false
  },
  {
    id: 'wallet_topup_1000',
    name: '₦1,000 Cash Spray Bundle',
    price: 1000,
    description: 'Adds ₦1,000 to your table wallet to spray crisp bills and pay table drink penalties.',
    icon: '💸',
    badge: 'INSTANT',
    unlocked: false
  },
  {
    id: 'wallet_topup_2500',
    name: '₦2,500 Big Baller Roll',
    price: 2500,
    description: 'Adds ₦2,500 to your table wallet for non-stop spraying and drink rounds.',
    icon: '💎',
    badge: 'BEST VALUE',
    unlocked: false
  },
  {
    id: 'wallet_topup_5000',
    name: '₦5,000 Odogwu High Roller Vault',
    price: 5000,
    description: 'Adds ₦5,000 to your table wallet like a true Lagos billionaire.',
    icon: '👑',
    badge: 'ODOGWU',
    unlocked: false
  },
  {
    id: 'drink_shot_1000',
    name: 'Chilled Table Drink (NHIE)',
    price: 1000,
    description: 'Buy a drink for your Never Have I Ever confession like a real VIP.',
    icon: '🍻',
    unlocked: false
  },
  {
    id: 'chicken_out_fine',
    name: 'Chicken Out Bailout Ticket',
    price: 1000,
    description: 'Pay the mandatory forfeit fine when you chickened out of a Truth or Dare.',
    icon: '🐔',
    unlocked: false
  }
];

export function addCustomPrompt(prompt: PromptItem) {
  if (prompt.type === 'truth') {
    TRUTH_PROMPTS.unshift(prompt);
  } else if (prompt.type === 'dare') {
    DARE_PROMPTS.unshift(prompt);
  } else if (prompt.type === 'most_likely' || prompt.text.startsWith('Most likely')) {
    MOST_LIKELY_TO_PROMPTS.unshift(prompt);
  } else {
    NEVER_HAVE_I_EVER_PROMPTS.unshift(prompt);
  }
}
