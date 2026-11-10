// MindHero – הגיבור: ציור, פריטים, כוחות ודרגות

export const STYLES = {
  pixel:    { name: 'לוחם פיקסלים', desc: 'עולם קוביות בסגנון מיינקראפט', suit: '#3b82f6', pants: '#1e3a8a', accent: '#22d3ee' },
  comic:    { name: 'גיבור-על',      desc: 'חליפה, גלימה וכוחות תודעה',    suit: '#dc2626', pants: '#1d4ed8', accent: '#facc15' },
  tactical: { name: 'סוכן עתידני',   desc: 'שריון היי-טק ונשק אנרגיה',     suit: '#475569', pants: '#1f2937', accent: '#22c55e' },
};
export const SKINS = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524'];

export const ITEMS = {
  // ראש
  headband: { slot: 'head', tier: 1, name: { pixel: 'סרט ראש אדום', comic: 'סרט נינג׳ה', tactical: 'סרט טקטי' }, desc: 'סמל של מתאמן רציני' },
  mask:     { slot: 'head', tier: 1, name: { pixel: 'מסכת פיקסלים', comic: 'מסכת גיבור', tactical: 'מסכת התגנבות' }, desc: 'זהות סודית' },
  visor:    { slot: 'head', tier: 2, name: { pixel: 'משקפי יהלום', comic: 'משקפי רנטגן', tactical: 'משקף ראיית לילה' }, desc: 'רואה את מה שאחרים מפספסים' },
  helmet:   { slot: 'head', tier: 2, name: { pixel: 'קסדת ברזל', comic: 'קסדת טיטניום', tactical: 'קסדת קרב' }, desc: 'הגנה מלאה' },
  crown:    { slot: 'head', tier: 3, name: { pixel: 'כתר זהב', comic: 'כתר תודעה', tactical: 'קסדת עצב-נוירון' }, desc: 'מגביר את כוח המוח' },
  // גב
  cape:     { slot: 'back', tier: 1, name: { pixel: 'גלימת צמר', comic: 'גלימת גיבור', tactical: 'שכמיית הסוואה' }, desc: 'מתנופפת ברוח' },
  jetpack:  { slot: 'back', tier: 2, name: { pixel: 'תרמיל רקטות', comic: 'תרמיל סילון', tactical: 'מנוע סילון' }, desc: 'מעוף מהיר' },
  wings:    { slot: 'back', tier: 3, name: { pixel: 'כנפי אליטרה', comic: 'כנפי אור', tactical: 'כנפי פלזמה' }, desc: 'שליטה בשמיים' },
  // נשק
  sword:    { slot: 'weapon', tier: 1, name: { pixel: 'חרב יהלום', comic: 'חרב אנרגיה', tactical: 'להב פלזמה' }, desc: 'חותך כל בעיה' },
  shield:   { slot: 'weapon2', tier: 1, name: { pixel: 'מגן עץ', comic: 'מגן כוכב', tactical: 'מגן אנרגיה' }, desc: 'הגנה מפני מלכודות' },
  staff:    { slot: 'weapon', tier: 2, name: { pixel: 'מטה קסמים', comic: 'מטה תודעה', tactical: 'מוט פריקה' }, desc: 'מרכז אנרגיה מנטלית' },
  blaster:  { slot: 'weapon', tier: 2, name: { pixel: 'קשת', comic: 'רובה פוטונים', tactical: 'רובה לייזר' }, desc: 'מכה מרחוק' },
  hammer:   { slot: 'weapon', tier: 3, name: { pixel: 'פטיש נת׳רייט', comic: 'פטיש הרעם', tactical: 'פטיש כבידה' }, desc: 'עוצמה אדירה' },
  // סמל
  bolt:     { slot: 'emblem', tier: 1, name: { pixel: 'סמל ברק', comic: 'סמל ברק', tactical: 'סמל ברק' }, desc: 'מהירות מחשבה' },
  star:     { slot: 'emblem', tier: 1, name: { pixel: 'סמל כוכב', comic: 'סמל כוכב', tactical: 'סמל כוכב' }, desc: 'אור מוביל' },
  brain:    { slot: 'emblem', tier: 2, name: { pixel: 'סמל מוח', comic: 'סמל מוח', tactical: 'סמל מוח' }, desc: 'כוח החשיבה' },
  eye:      { slot: 'emblem', tier: 3, name: { pixel: 'עין הדרקון', comic: 'העין השלישית', tactical: 'עין הסורק' }, desc: 'רואה את התשובה' },
  // שריון
  silver:   { slot: 'suit', tier: 2, name: { pixel: 'שריון ברזל', comic: 'חליפת כסף', tactical: 'שריון קרמי' }, desc: 'שדרוג לחליפה' },
  gold:     { slot: 'suit', tier: 3, name: { pixel: 'שריון זהב', comic: 'חליפת זהב', tactical: 'שריון נאנו-זהב' }, desc: 'שדרוג מלכותי' },
  cosmic:   { slot: 'suit', tier: 4, name: { pixel: 'שריון נת׳רייט', comic: 'חליפה קוסמית', tactical: 'שריון קוונטי' }, desc: 'השדרוג האגדי' },
};
export const SLOT_HE = { head: 'ראש', back: 'גב', weapon: 'נשק', weapon2: 'יד שנייה', emblem: 'סמל', suit: 'חליפה' };

export const POWERS = {
  hawk:    { name: 'עין הנץ',      icon: '🦅', color: '#f59e0b', desc: l => `פוסל תשובה שגויה אחת – ${l} ${l === 1 ? 'פעם' : 'פעמים'} בכל משימה`, active: true },
  insight: { name: 'תובנה',         icon: '💡', color: '#fde047', desc: l => `${l} ${l === 1 ? 'רמז חינם' : 'רמזים חינם'} בכל משימה (בלי להפסיד XP)`, active: true },
  slow:    { name: 'האטת זמן',      icon: '⏳', color: '#38bdf8', desc: l => `+${l * 10}% זמן בקרבות בוס`, active: false },
  shield:  { name: 'מגן מחשבה',     icon: '🛡️', color: '#a78bfa', desc: l => `${l} ${l === 1 ? 'טעות' : 'טעויות'} בכל משימה לא שוברות את הקומבו`, active: false },
  storm:   { name: 'סערת מוח',      icon: '🌪️', color: '#22d3ee', desc: l => `הקומבו מתחיל מוקדם יותר (אחרי ${4 - l} תשובות נכונות)`, active: false },
  memory:  { name: 'זיכרון צילומי', icon: '📸', color: '#f472b6', desc: l => `+${l * 25}% XP במעבדת הטעויות`, active: false },
  freeze:  { name: 'קפאון זמן',     icon: '❄️', color: '#93c5fd', desc: l => `שומר על רצף הימים אם פספסת יום – ${l} ${l === 1 ? 'פעם' : 'פעמים'} בשבוע`, active: false },
  telek:   { name: 'טלקינזיס',      icon: '🌀', color: '#c084fc', desc: l => `+${l * 10}% מטבעות מכל משימה`, active: false },
};

export const RANKS = ['טירון', 'צוער', 'סייר', 'לוחם', 'שומר', 'מגן', 'אלוף', 'מאסטר', 'גיבור-על', 'אגדה'];
export const rankOf = lvl => RANKS[Math.min(RANKS.length - 1, Math.floor((lvl - 1) / 3))];
export const xpForLevel = lvl => Math.round(120 + (lvl - 1) * 60);

export function itemName(id, style) { const it = ITEMS[id]; return it ? it.name[style] || it.name.comic : id; }

// ---------- ציור ----------
export function heroSVG(h, opts = {}) {
  const style = h.style || 'comic', S = STYLES[style];
  const eq = h.equip || {};
  const skin = h.skin || SKINS[1];
  const suitMap = { silver: '#94a3b8', gold: '#eab308', cosmic: 'url(#cosmic)' };
  const suit = suitMap[eq.suit] || S.suit;
  const pants = eq.suit === 'gold' ? '#a16207' : eq.suit === 'cosmic' ? '#312e81' : eq.suit === 'silver' ? '#475569' : S.pants;
  const accent = S.accent;
  const pix = style === 'pixel', com = style === 'comic', tac = style === 'tactical';
  const ol = com ? 'stroke="#111" stroke-width="3" stroke-linejoin="round"' : tac ? 'stroke="#0b1220" stroke-width="2"' : '';
  const rx = com ? 12 : tac ? 4 : 0;
  const R = (x, y, w, hh, fill, r = rx, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="${r}" fill="${fill}" ${ol} ${extra}/>`;
  const P = (pts, fill, extra = '') => `<polygon points="${pts}" fill="${fill}" ${ol} ${extra}/>`;
  const out = [];
  out.push(`<defs>
    <radialGradient id="aura"><stop offset="0" stop-color="${opts.aura || '#fff'}" stop-opacity=".55"/><stop offset="1" stop-color="${opts.aura || '#fff'}" stop-opacity="0"/></radialGradient>
    <linearGradient id="cosmic" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset=".5" stop-color="#2563eb"/><stop offset="1" stop-color="#db2777"/></linearGradient>
    <linearGradient id="blade" x1="0" x2="1"><stop offset="0" stop-color="#e0f2fe"/><stop offset="1" stop-color="${pix ? '#67e8f9' : accent}"/></linearGradient>
  </defs>`);
  if (opts.aura) out.push(`<ellipse cx="100" cy="140" rx="98" ry="125" fill="url(#aura)"><animate attributeName="ry" values="120;128;120" dur="3s" repeatCount="indefinite"/></ellipse>`);
  // גב
  if (eq.back === 'cape') out.push(P('70,112 130,112 156,244 44,244', com ? '#b91c1c' : tac ? '#3f6212' : '#7f1d1d'));
  if (eq.back === 'wings') {
    const wc = com ? '#fef9c3' : tac ? '#22d3ee' : '#a78bfa';
    out.push(P('76,120 20,70 8,150 40,190 74,160', wc, 'opacity=".92"'), P('124,120 180,70 192,150 160,190 126,160', wc, 'opacity=".92"'));
  }
  if (eq.back === 'jetpack') {
    out.push(R(58, 112, 22, 52, '#64748b', rx / 2), R(120, 112, 22, 52, '#64748b', rx / 2));
    out.push(`<polygon points="60,166 78,166 69,196" fill="#f97316"><animate attributeName="points" values="60,166 78,166 69,196;60,166 78,166 69,186;60,166 78,166 69,196" dur=".4s" repeatCount="indefinite"/></polygon>`);
    out.push(`<polygon points="122,166 140,166 131,196" fill="#f97316"><animate attributeName="points" values="122,166 140,166 131,196;122,166 140,166 131,186;122,166 140,166 131,196" dur=".4s" repeatCount="indefinite"/></polygon>`);
  }
  // רגליים
  out.push(R(80, 178, 18, 56, pants, rx / 2), R(102, 178, 18, 56, pants, rx / 2));
  out.push(R(76, 226, 24, 14, tac ? '#111827' : pix ? '#3f2a14' : '#1f2937', rx / 2), R(100, 226, 24, 14, tac ? '#111827' : pix ? '#3f2a14' : '#1f2937', rx / 2));
  // גוף
  out.push(R(68, 108, 64, 76, suit));
  if (tac) out.push(`<path d="M72 130 H128 M72 152 H128" stroke="${accent}" stroke-width="2" opacity=".8"/>`, R(84, 114, 32, 12, '#1f2937', 2));
  if (com) out.push(`<path d="M76 112 Q100 130 124 112" fill="none" stroke="#111" stroke-width="2" opacity=".35"/>`);
  if (eq.suit === 'gold' || eq.suit === 'cosmic') out.push(`<rect x="68" y="108" width="64" height="8" fill="${accent}" opacity=".7"/>`);
  out.push(R(68, 170, 64, 9, tac ? '#111827' : '#422006', 2), R(94, 169, 12, 11, '#facc15', 2));
  // ידיים
  out.push(R(48, 110, 20, 58, suit), R(132, 110, 20, 58, suit));
  out.push(R(48, 164, 20, 14, skin, rx / 2), R(132, 164, 20, 14, skin, rx / 2));
  // סמל
  const em = eq.emblem;
  if (em === 'bolt') out.push(`<polygon points="104,124 90,146 100,146 94,164 112,138 102,138 108,124" fill="${accent}" stroke="#111" stroke-width="1.5"/>`);
  if (em === 'star') out.push(`<polygon points="100,124 105,137 119,137 108,145 112,159 100,151 88,159 92,145 81,137 95,137" fill="${accent}" stroke="#111" stroke-width="1.5"/>`);
  if (em === 'brain') out.push(`<g fill="#f9a8d4" stroke="#111" stroke-width="1.5"><circle cx="94" cy="142" r="10"/><circle cx="106" cy="142" r="10"/><path d="M100 132 V152 M90 140 q4 4 8 0 M102 144 q4 -4 8 0" fill="none"/></g>`);
  if (em === 'eye') out.push(`<g><ellipse cx="100" cy="142" rx="17" ry="10" fill="#fff" stroke="#111" stroke-width="2"/><circle cx="100" cy="142" r="6" fill="${accent}"><animate attributeName="r" values="6;4;6" dur="2.5s" repeatCount="indefinite"/></circle></g>`);
  // ראש
  out.push(R(74, 50, 52, 56, skin, com ? 22 : tac ? 8 : 0));
  out.push(R(74, 46, 52, 16, pix ? '#4a2c0f' : '#2b1a0e', com ? 12 : tac ? 6 : 0));
  if (pix) out.push(R(74, 46, 8, 28, '#4a2c0f', 0), R(118, 46, 8, 28, '#4a2c0f', 0));
  // פנים
  const eyes = pix ? `${R(84, 74, 10, 8, '#fff', 0)}${R(106, 74, 10, 8, '#fff', 0)}${R(88, 74, 6, 8, '#1e3a8a', 0)}${R(110, 74, 6, 8, '#1e3a8a', 0)}`
    : `<ellipse cx="89" cy="78" rx="5" ry="6" fill="#fff"/><ellipse cx="111" cy="78" rx="5" ry="6" fill="#fff"/><circle cx="90" cy="79" r="3" fill="#111"/><circle cx="112" cy="79" r="3" fill="#111"/>`;
  out.push(eyes);
  out.push(pix ? R(92, 92, 16, 4, '#7c2d12', 0) : `<path d="M90 92 Q100 100 110 92" fill="none" stroke="#7c2d12" stroke-width="3" stroke-linecap="round"/>`);
  // פריט ראש
  const hd = eq.head;
  if (hd === 'headband') out.push(R(72, 60, 56, 8, '#dc2626', 2), `<path d="M72 64 L58 72 L62 58 Z" fill="#dc2626"/>`);
  if (hd === 'mask') out.push(`<path d="M72 70 H128 V86 H72 Z" fill="${com ? '#111' : tac ? '#0f172a' : '#1e1b4b'}"/><ellipse cx="89" cy="78" rx="6" ry="5" fill="#fff"/><ellipse cx="111" cy="78" rx="6" ry="5" fill="#fff"/>`);
  if (hd === 'visor') out.push(R(72, 70, 56, 16, pix ? '#22d3ee' : accent, 4, 'opacity=".85"'), `<rect x="76" y="73" width="20" height="3" fill="#fff" opacity=".7"/>`);
  if (hd === 'helmet') out.push(`<path d="M70 82 V58 Q70 38 100 38 Q130 38 130 58 V82 H122 V62 H78 V82 Z" fill="${pix ? '#9ca3af' : tac ? '#334155' : '#64748b'}" ${ol}/>`, `<rect x="78" y="64" width="44" height="6" fill="${accent}" opacity=".9"/>`);
  if (hd === 'crown') out.push(`<polygon points="72,50 72,30 84,42 100,24 116,42 128,30 128,50" fill="${tac ? '#22d3ee' : '#facc15'}" ${ol}/><circle cx="100" cy="40" r="4" fill="#ef4444"><animate attributeName="opacity" values="1;.4;1" dur="2s" repeatCount="indefinite"/></circle>`);
  // נשק
  const wp = eq.weapon;
  if (wp === 'sword') out.push(R(139, 84, 8, 84, 'url(#blade)', 2), R(130, 160, 26, 6, '#78350f', 2), R(140, 166, 6, 18, '#451a03', 1));
  if (wp === 'staff') out.push(R(141, 50, 6, 190, '#7c2d12', 3), `<circle cx="144" cy="46" r="11" fill="${accent}" stroke="#111" stroke-width="2"><animate attributeName="r" values="11;13;11" dur="1.6s" repeatCount="indefinite"/></circle>`);
  if (wp === 'blaster') out.push(R(130, 156, 46, 14, pix ? '#78350f' : '#1f2937', 3), R(170, 159, 14, 8, accent, 2), R(138, 168, 10, 14, '#111827', 2));
  if (wp === 'hammer') out.push(R(141, 92, 7, 92, '#78350f', 2), R(124, 72, 42, 28, pix ? '#9ca3af' : tac ? '#475569' : '#cbd5e1', 4), `<path d="M136 80 l6 6 l-4 2 l8 8" stroke="${accent}" stroke-width="2" fill="none"/>`);
  if (eq.weapon2 === 'shield') out.push(`<circle cx="50" cy="146" r="25" fill="${pix ? '#92400e' : tac ? '#0ea5e9' : '#2563eb'}" ${ol} ${tac ? 'opacity=".75"' : ''}/><circle cx="50" cy="146" r="14" fill="${pix ? '#a16207' : '#dc2626'}" stroke="#fff" stroke-width="2"/>${com ? '<polygon points="50,136 53,144 61,144 55,149 57,157 50,152 43,157 45,149 39,144 47,144" fill="#fff"/>' : ''}`);
  const svg = `<svg viewBox="0 0 200 260" ${pix ? 'shape-rendering="crispEdges"' : ''} class="hero-svg" xmlns="http://www.w3.org/2000/svg">${out.join('')}</svg>`;
  return svg;
}

export function strongestPowerColor(h) {
  const p = Object.entries(h.powers || {}).sort((a, b) => b[1] - a[1])[0];
  return p ? POWERS[p[0]].color : null;
}

// הצעות לבחירה בעליית דרגה
export function levelUpOffers(h, rnd = Math.random) {
  const owned = new Set(h.items || []);
  const lvl = h.level || 1;
  const maxTier = lvl < 4 ? 1 : lvl < 8 ? 2 : lvl < 13 ? 3 : 4;
  const itemPool = Object.keys(ITEMS).filter(id => !owned.has(id) && ITEMS[id].tier <= maxTier).map(id => ({ kind: 'item', id }));
  const powerPool = Object.keys(POWERS).filter(id => (h.powers?.[id] || 0) < 3 && (lvl >= 3 || POWERS[id].active || (h.powers?.[id] || 0) > 0 || Object.keys(h.powers || {}).length < 2)).map(id => ({ kind: 'power', id, lvl: (h.powers?.[id] || 0) + 1 }));
  const sh = a => a.map(x => [rnd(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const P = sh(powerPool), I = sh(itemPool);
  const res = [];
  if (P.length) res.push(P.shift());
  if (I.length) res.push(I.shift());
  if (I.length && (rnd() < 0.6 || !P.length)) res.push(I.shift()); else if (P.length) res.push(P.shift());
  while (res.length < 3 && (I.length || P.length)) res.push(I.length ? I.shift() : P.shift());
  if (!res.length) res.push({ kind: 'coins', amount: 100 });
  return res;
}
