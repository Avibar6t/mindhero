// MindHero – ציור הגיבורים (גרסה 2): צ'יבי מוצלל לגיבור-על ולסוכן, ספרייט פיקסלים אמיתי ללוחם פיקסלים
let N = 0;

function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function shade(h, p) { const [r, g, b] = hex2rgb(h); const f = c => Math.max(0, Math.min(255, Math.round(p < 0 ? c * (1 + p) : c + (255 - c) * p))); return '#' + [f(r), f(g), f(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }

const PAL = {
  comic: { suit: '#2563eb', pants: '#1e3a8a', accent: '#fbbf24', cape: '#7c3aed', boots: '#1f2937', glove: '#f8fafc', hair: '#3b2416', eye: '#2563eb' },
  tactical: { suit: '#4b5563', pants: '#1f2937', accent: '#22d3ee', cape: '#3f6212', boots: '#111827', glove: '#111827', hair: '#1c1917', eye: '#0f766e' },
};
const TIER = { silver: '#94a3b8', gold: '#eab308', cosmic: '#6d28d9' };

export function heroSVG(h, opts = {}) {
  const style = h.style || 'comic';
  return style === 'pixel' ? pixelHero(h, opts) : chibiHero(h, opts, style === 'tactical');
}

// ===================== צ'יבי =====================
function chibiHero(h, opts, tac) {
  const u = 'm' + (++N);
  const P = PAL[tac ? 'tactical' : 'comic'];
  const eq = h.equip || {};
  const skin = h.skin || '#f1c27d', skinD = shade(skin, -.18), skinL = shade(skin, .25);
  const suit = TIER[eq.suit] || P.suit, suitL = shade(suit, .28), suitD = shade(suit, -.35);
  const pants = eq.suit ? shade(suit, -.45) : P.pants;
  const acc = eq.suit === 'gold' ? '#fde68a' : eq.suit === 'cosmic' ? '#f472b6' : P.accent;
  const OL = tac ? '#0b1020' : '#16142b', W = tac ? 2.6 : 3.2;
  const st = `stroke="${OL}" stroke-width="${W}" stroke-linejoin="round" stroke-linecap="round"`;
  const o = [];
  o.push(`<defs>
  ${eq.suit === 'cosmic' ? `<linearGradient id="${u}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset=".5" stop-color="#2563eb"/><stop offset="1" stop-color="#db2777"/></linearGradient>` : `<linearGradient id="${u}s" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${suitL}"/><stop offset=".55" stop-color="${suit}"/><stop offset="1" stop-color="${suitD}"/></linearGradient>`}
  <linearGradient id="${u}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(pants, .15)}"/><stop offset="1" stop-color="${shade(pants, -.3)}"/></linearGradient>
  <radialGradient id="${u}k" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="${skinL}"/><stop offset=".7" stop-color="${skin}"/><stop offset="1" stop-color="${skinD}"/></radialGradient>
  <linearGradient id="${u}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(P.hair, .35)}"/><stop offset="1" stop-color="${P.hair}"/></linearGradient>
  <linearGradient id="${u}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(P.cape, .1)}"/><stop offset="1" stop-color="${shade(P.cape, -.45)}"/></linearGradient>
  <linearGradient id="${u}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f0f9ff"/><stop offset=".5" stop-color="#bae6fd"/><stop offset="1" stop-color="${tac ? '#22d3ee' : '#7dd3fc'}"/></linearGradient>
  <linearGradient id="${u}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#64748b"/></linearGradient>
  <linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fef08a"/><stop offset="1" stop-color="#ca8a04"/></linearGradient>
  <radialGradient id="${u}a"><stop offset="0" stop-color="${opts.aura || '#fff'}" stop-opacity=".6"/><stop offset=".6" stop-color="${opts.aura || '#fff'}" stop-opacity=".18"/><stop offset="1" stop-color="${opts.aura || '#fff'}" stop-opacity="0"/></radialGradient>
  <filter id="${u}f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>`);
  if (opts.aura) o.push(`<ellipse cx="100" cy="140" rx="96" ry="122" fill="url(#${u}a)"><animate attributeName="opacity" values=".75;1;.75" dur="2.6s" repeatCount="indefinite"/></ellipse>`);
  o.push(`<ellipse cx="100" cy="247" rx="48" ry="7" fill="#000" opacity=".35"/>`);

  // ---- גב ----
  if (eq.back === 'cape') {
    o.push(`<path d="M66 116 C54 160 46 205 38 240 Q70 250 100 244 Q130 250 162 240 C154 205 146 160 134 116 Z" fill="url(#${u}c)" ${st}/>`,
      `<path d="M78 140 Q72 190 64 238 M100 150 L100 242 M122 140 Q128 190 136 238" fill="none" stroke="${shade(P.cape, -.5)}" stroke-width="2" opacity=".55"/>`);
  }
  if (eq.back === 'wings') {
    const wc = tac ? '#22d3ee' : '#fef3c7', wd = tac ? '#0e7490' : '#fbbf24';
    const wing = s => `<g transform="translate(100 0) scale(${s} 1) translate(-100 0)">
      <path d="M78 122 C40 96 14 80 6 96 C2 120 18 160 44 178 C56 186 70 176 80 160 Z" fill="${wc}" ${st} ${tac ? 'opacity=".85"' : ''}/>
      <path d="M74 132 C46 118 26 112 18 120 M70 148 C48 142 30 142 24 150 M66 162 C50 162 40 166 36 172" fill="none" stroke="${wd}" stroke-width="2.5" stroke-linecap="round"/></g>`;
    o.push(wing(1), wing(-1));
  }
  if (eq.back === 'jetpack') {
    const tank = x => `<rect x="${x}" y="112" width="20" height="54" rx="9" fill="url(#${u}m)" ${st}/><rect x="${x + 3}" y="160" width="14" height="9" rx="3" fill="#334155" ${st}/>
      <path d="M${x + 3} 170 Q${x + 10} 204 ${x + 17} 170 Z" fill="#fb923c"><animate attributeName="d" values="M${x + 3} 170 Q${x + 10} 204 ${x + 17} 170 Z;M${x + 3} 170 Q${x + 10} 192 ${x + 17} 170 Z;M${x + 3} 170 Q${x + 10} 204 ${x + 17} 170 Z" dur=".35s" repeatCount="indefinite"/></path>
      <path d="M${x + 6} 170 Q${x + 10} 190 ${x + 14} 170 Z" fill="#fde047"/>`;
    o.push(tank(52), tank(128));
  }

  // ---- רגליים ----
  o.push(`<path d="M79 182 L80 226 L97 226 L98 186 Z" fill="url(#${u}p)" ${st}/><path d="M121 182 L120 226 L103 226 L102 186 Z" fill="url(#${u}p)" ${st}/>`);
  o.push(`<path d="M78 219 h21 v15 q0 8 -8 8 h-17 q-6 0 -4 -7 z" fill="${P.boots}" ${st}/><path d="M122 219 h-21 v15 q0 8 8 8 h17 q6 0 4 -7 z" fill="${P.boots}" ${st}/>`,
    `<path d="M82 224 h12" stroke="${shade(P.boots, .5)}" stroke-width="2.5" stroke-linecap="round"/><path d="M106 224 h12" stroke="${shade(P.boots, .5)}" stroke-width="2.5" stroke-linecap="round"/>`);

  // ---- גוף ----
  o.push(`<path d="M68 120 Q100 106 132 120 L128 178 Q100 188 72 178 Z" fill="url(#${u}s)" ${st}/>`);
  if (tac) {
    o.push(`<path d="M76 126 Q100 118 124 126 L121 152 Q100 158 79 152 Z" fill="${shade(suit, -.2)}" stroke="${OL}" stroke-width="2"/>`,
      `<path d="M80 134 H120 M81 144 H119" stroke="${acc}" stroke-width="1.6" opacity=".9"/>`,
      `<rect x="84" y="158" width="10" height="12" rx="2" fill="${shade(suit, -.3)}" stroke="${OL}" stroke-width="1.5"/><rect x="106" y="158" width="10" height="12" rx="2" fill="${shade(suit, -.3)}" stroke="${OL}" stroke-width="1.5"/>`);
  } else {
    o.push(`<path d="M76 124 Q88 118 96 120 Q84 140 80 168" fill="none" stroke="#fff" stroke-width="3" opacity=".25" stroke-linecap="round"/>`,
      `<path d="M88 160 Q100 164 112 160" fill="none" stroke="${OL}" stroke-width="1.6" opacity=".35"/>`);
  }
  if (eq.suit === 'gold' || eq.suit === 'cosmic' || eq.suit === 'silver') o.push(`<path d="M70 124 Q100 112 130 124" fill="none" stroke="${acc}" stroke-width="3" opacity=".9"/>`);
  o.push(`<rect x="71" y="170" width="58" height="11" rx="4" fill="${tac ? '#111827' : shade(P.pants, -.3)}" ${st}/><rect x="92" y="168" width="16" height="15" rx="3" fill="url(#${u}g)" ${st}/>`);
  // סמל
  const em = eq.emblem;
  if (em) {
    o.push(`<circle cx="100" cy="142" r="15" fill="${tac ? '#0f172a' : '#fff'}" ${st}/>`);
    if (em === 'bolt') o.push(`<path d="M103 130 L92 145 H100 L96 155 L109 139 H101 Z" fill="${acc}" stroke="${OL}" stroke-width="1.6" stroke-linejoin="round"/>`);
    if (em === 'star') o.push(`<path d="M100 131 L103.5 138.5 L111.5 139.2 L105.4 144.4 L107.3 152.2 L100 148 L92.7 152.2 L94.6 144.4 L88.5 139.2 L96.5 138.5 Z" fill="${acc}" stroke="${OL}" stroke-width="1.4" stroke-linejoin="round"/>`);
    if (em === 'brain') o.push(`<g stroke="${OL}" stroke-width="1.4" fill="#f9a8d4"><path d="M100 132 C92 130 88 136 90 140 C86 143 88 150 94 150 C96 154 100 153 100 151 Z"/><path d="M100 132 C108 130 112 136 110 140 C114 143 112 150 106 150 C104 154 100 153 100 151 Z"/></g><path d="M94 140 q3 2 6 0 M100 145 q3 -2 6 0" stroke="${OL}" stroke-width="1.2" fill="none"/>`);
    if (em === 'eye') o.push(`<path d="M87 142 Q100 131 113 142 Q100 153 87 142 Z" fill="#fff" stroke="${OL}" stroke-width="1.6"/><circle cx="100" cy="142" r="5" fill="${acc}"><animate attributeName="r" values="5;3.5;5" dur="2.4s" repeatCount="indefinite"/></circle><circle cx="100" cy="142" r="2" fill="${OL}"/>`);
  }
  // ---- ידיים ----
  const shoulder = tac ? `fill="${shade(suit, -.15)}"` : `fill="url(#${u}s)"`;
  o.push(`<path d="M70 121 Q56 124 54 146 L52 168 Q58 174 66 168 L70 146 Z" ${shoulder} ${st}/>`,
    `<path d="M130 121 Q144 124 146 146 L148 168 Q142 174 134 168 L130 146 Z" ${shoulder} ${st}/>`);
  if (tac) o.push(`<path d="M64 118 Q54 122 54 136 L70 134 L72 120 Z" fill="${shade(suit, .15)}" ${st}/><path d="M136 118 Q146 122 146 136 L130 134 L128 120 Z" fill="${shade(suit, .15)}" ${st}/>`);
  o.push(`<circle cx="58" cy="174" r="9.5" fill="${P.glove}" ${st}/><circle cx="142" cy="174" r="9.5" fill="${P.glove}" ${st}/>`);
  if (eq.weapon2 === 'shield') {
    o.push(`<g><circle cx="54" cy="150" r="27" fill="${tac ? '#0ea5e9' : '#e2e8f0'}" ${st} ${tac ? 'fill-opacity=".55"' : ''}/><circle cx="54" cy="150" r="19" fill="${tac ? 'none' : '#2563eb'}" stroke="${tac ? '#7dd3fc' : OL}" stroke-width="${tac ? 2 : 2.4}"/>
      <path d="M54 136 L64 150 L54 164 L44 150 Z" fill="${tac ? '#7dd3fc' : '#fbbf24'}" stroke="${OL}" stroke-width="1.8"/>
      <path d="M36 138 Q44 128 56 126" stroke="#fff" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/></g>`);
  }
  // ---- ראש ----
  o.push(`<rect x="91" y="102" width="18" height="14" rx="4" fill="${skinD}" ${st}/>`);
  o.push(`<ellipse cx="64" cy="80" rx="7" ry="9" fill="${skin}" ${st}/><ellipse cx="136" cy="80" rx="7" ry="9" fill="${skin}" ${st}/>`);
  o.push(`<path d="M64 76 C64 48 80 36 100 36 C120 36 136 48 136 76 C136 98 120 110 100 110 C80 110 64 98 64 76 Z" fill="url(#${u}k)" ${st}/>`);
  // שיער
  if (eq.head !== 'helmet') {
    if (tac) o.push(`<path d="M64 74 C62 46 80 34 100 34 C122 34 138 46 136 74 C132 62 126 56 118 54 C108 58 92 58 82 54 C74 56 68 62 64 74 Z" fill="url(#${u}h)" ${st}/>`);
    else o.push(`<path d="M63 76 C58 56 66 40 80 34 L78 26 L90 31 L94 20 L102 30 L112 21 L114 32 L126 28 L122 38 C134 46 140 60 137 76 C132 64 126 58 118 56 L112 62 L106 55 L96 62 L90 55 L82 61 L78 56 C70 60 66 68 63 76 Z" fill="url(#${u}h)" ${st}/>`,
      `<path d="M84 40 Q96 34 110 38" stroke="#fff" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>`);
  }
  // פנים
  const eyeC = P.eye;
  const eyes = `<g><ellipse cx="86" cy="81" rx="8.5" ry="10" fill="#fff" stroke="${OL}" stroke-width="2"/><ellipse cx="114" cy="81" rx="8.5" ry="10" fill="#fff" stroke="${OL}" stroke-width="2"/>
    <circle cx="87.5" cy="83" r="6" fill="${eyeC}"/><circle cx="115.5" cy="83" r="6" fill="${eyeC}"/><circle cx="87.5" cy="83.5" r="3.2" fill="#0b1020"/><circle cx="115.5" cy="83.5" r="3.2" fill="#0b1020"/>
    <circle cx="85.5" cy="80" r="2.2" fill="#fff"/><circle cx="113.5" cy="80" r="2.2" fill="#fff"/><circle cx="89.5" cy="86" r="1" fill="#fff"/><circle cx="117.5" cy="86" r="1" fill="#fff"/></g>`;
  const brows = `<path d="M77 69 Q85 64 94 68" stroke="${OL}" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M106 68 Q115 64 123 69" stroke="${OL}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
  const mouth = `<path d="M92 98 Q100 104 109 97" stroke="${OL}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const blush = `<ellipse cx="76" cy="95" rx="6" ry="3.5" fill="#f472b6" opacity=".3"/><ellipse cx="124" cy="95" rx="6" ry="3.5" fill="#f472b6" opacity=".3"/>`;
  if (eq.head === 'mask') o.push(`<path d="M62 74 Q100 64 138 74 L136 92 Q100 86 64 92 Z M78 80 a8 7 0 1 0 16 0 a8 7 0 1 0 -16 0 Z M106 80 a8 7 0 1 0 16 0 a8 7 0 1 0 -16 0 Z" fill="${tac ? '#0f172a' : '#111827'}" fill-rule="evenodd" ${st}/><ellipse cx="86" cy="80" rx="6.5" ry="5.5" fill="#fff"/><ellipse cx="114" cy="80" rx="6.5" ry="5.5" fill="#fff"/><path d="M80 78 q6 -3 12 0 M108 78 q6 -3 12 0" stroke="#111" stroke-width="1.5" fill="none"/>`, blush.replace(/opacity=".3"/g, 'opacity=".2"'), mouth);
  else if (eq.head === 'visor') o.push(brows, `<rect x="66" y="72" width="68" height="20" rx="10" fill="${tac ? '#22d3ee' : '#38bdf8'}" fill-opacity=".85" ${st}/><path d="M72 78 L92 78" stroke="#fff" stroke-width="3" opacity=".8" stroke-linecap="round"/><rect x="66" y="72" width="68" height="20" rx="10" fill="none" stroke="${tac ? '#a5f3fc' : '#e0f2fe'}" stroke-width="1" filter="url(#${u}f)"/>`, blush, mouth);
  else o.push(eyes, brows, blush, mouth);
  // פריט ראש
  if (eq.head === 'headband') o.push(`<path d="M64 62 Q100 52 136 62 L135 70 Q100 61 65 70 Z" fill="#dc2626" ${st}/><path d="M64 66 L48 74 L50 64 L42 58 L62 62" fill="#dc2626" ${st}/>`);
  if (eq.head === 'helmet') o.push(`<path d="M60 84 C58 48 76 30 100 30 C124 30 142 48 140 84 L130 86 C130 60 120 52 100 52 C80 52 70 60 70 86 Z" fill="url(#${u}m)" ${st}/><path d="M92 30 Q100 18 108 30" fill="${acc}" ${st}/><path d="M74 58 Q100 46 126 58" stroke="${acc}" stroke-width="3" fill="none"/><path d="M72 46 Q84 36 98 36" stroke="#fff" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>`);
  if (eq.head === 'crown') o.push(`<path d="M72 50 L70 26 L84 38 L100 20 L116 38 L130 26 L128 50 Q100 44 72 50 Z" fill="url(#${u}g)" ${st}/><circle cx="100" cy="36" r="4.5" fill="${tac ? '#22d3ee' : '#ef4444'}" stroke="${OL}" stroke-width="1.5"><animate attributeName="opacity" values="1;.5;1" dur="2s" repeatCount="indefinite"/></circle><circle cx="82" cy="44" r="2.5" fill="#22d3ee"/><circle cx="118" cy="44" r="2.5" fill="#22d3ee"/>`);

  // ---- נשק (ביד ימין של הצופה) ----
  const wp = eq.weapon;
  if (wp === 'sword') o.push(`<g transform="rotate(18 142 174)"><path d="M138 162 L139 84 L142 74 L145 84 L146 162 Z" fill="url(#${u}b)" ${st}/><path d="M142 82 L142 158" stroke="#fff" stroke-width="1.5" opacity=".7"/>
    <rect x="128" y="160" width="28" height="7" rx="3.5" fill="url(#${u}g)" ${st}/><rect x="138.5" y="166" width="7" height="18" rx="2" fill="#7c2d12" ${st}/><circle cx="142" cy="187" r="4.5" fill="url(#${u}g)" ${st}/>
    ${tac ? '' : `<path d="M139 84 L142 74 L145 84" fill="none" stroke="#e0f2fe" stroke-width="1"/>`}</g>`, `<circle cx="142" cy="174" r="9.5" fill="${P.glove}" ${st}/>`);
  if (wp === 'staff') o.push(`<rect x="139" y="58" width="7" height="186" rx="3.5" fill="#78350f" ${st}/><circle cx="142.5" cy="50" r="14" fill="${acc}" opacity=".35" filter="url(#${u}f)"/><circle cx="142.5" cy="50" r="10" fill="${acc}" ${st}><animate attributeName="r" values="10;11.5;10" dur="1.6s" repeatCount="indefinite"/></circle><circle cx="139" cy="46" r="3" fill="#fff" opacity=".8"/><path d="M134 62 Q142.5 56 151 62" stroke="url(#${u}g)" stroke-width="4" fill="none"/>`, `<circle cx="142" cy="174" r="9.5" fill="${P.glove}" ${st}/>`);
  if (wp === 'blaster') o.push(`<g><path d="M130 164 H174 Q180 164 180 170 V176 H150 L146 186 H136 L138 176 H130 Z" fill="${tac ? '#1f2937' : '#e2e8f0'}" ${st}/><rect x="150" y="158" width="18" height="6" rx="2" fill="${tac ? '#374151' : '#94a3b8'}" ${st}/><rect x="176" y="166" width="10" height="8" rx="2" fill="${acc}" ${st}/><path d="M136 169 H168" stroke="${acc}" stroke-width="2.5"/></g>`, `<circle cx="140" cy="176" r="9.5" fill="${P.glove}" ${st}/>`);
  if (wp === 'hammer') o.push(`<g transform="rotate(-12 142 174)"><rect x="138.5" y="94" width="8" height="96" rx="3" fill="#78350f" ${st}/><rect x="118" y="70" width="48" height="32" rx="6" fill="url(#${u}m)" ${st}/><path d="M124 76 V96 M160 76 V96" stroke="${OL}" stroke-width="2" opacity=".5"/><path d="M136 80 l6 7 l-5 3 l9 9" stroke="${acc}" stroke-width="2.5" fill="none"/></g>`, `<circle cx="142" cy="174" r="9.5" fill="${P.glove}" ${st}/>`);

  return `<svg viewBox="0 0 200 260" class="hero-svg" xmlns="http://www.w3.org/2000/svg">${o.join('')}</svg>`;
}

// ===================== פיקסלים =====================
function pixelHero(h, opts) {
  const u = 'p' + (++N);
  const eq = h.equip || {};
  const GW = 24, GH = 36, PX = 8;
  const grid = Array.from({ length: GH }, () => Array(GW).fill(null));
  const noise = (x, y) => ((x * 73856093) ^ (y * 19349663) ^ 0x5bd1e995) >>> 0;
  const tones = c => [c, shade(c, .12), shade(c, -.12), shade(c, -.22)];
  const fill = (x, y, w, hh, c, pat = 'noise') => {
    const t = tones(c);
    for (let j = y; j < y + hh; j++) for (let i = x; i < x + w; i++) {
      if (i < 0 || j < 0 || i >= GW || j >= GH) continue;
      let col = c;
      if (pat === 'noise') col = t[noise(i, j) % 4 === 0 ? 1 : noise(i, j) % 5 === 0 ? 2 : 0];
      else if (pat === 'shade') col = i === x ? t[1] : i === x + w - 1 ? t[2] : (j === y + hh - 1 ? t[3] : c);
      else if (pat === 'flat') col = c;
      else if (typeof pat === 'function') col = pat(i - x, j - y, t);
      grid[j][i] = col;
    }
  };
  const px = (x, y, c) => { if (x >= 0 && y >= 0 && x < GW && y < GH) grid[y][x] = c; };
  const OX = 4, OY = 3; // היסט לגוף
  const skin = h.skin || '#e0ac69';
  const suitMap = { silver: '#c0c7cf', gold: '#f2c84b', cosmic: '#4a3a5c' };
  const shirt = suitMap[eq.suit] || '#c2410c', pants = eq.suit ? shade(suitMap[eq.suit], -.35) : '#334155';
  const hair = '#1f1a17';

  // גלימה / כנפיים / סילון – מאחור
  if (eq.back === 'cape') fill(OX + 3, OY + 9, 10, 23, '#9b1c1c', (i, j, t) => (i === 0 || i === 9) ? t[2] : j % 6 === 0 ? t[1] : t[0]);
  if (eq.back === 'wings') { for (let j = 0; j < 14; j++) { const w = Math.max(1, 7 - Math.abs(j - 5)); fill(OX - w, OY + 9 + j, w, 1, '#8b7fb0'); fill(OX + 16, OY + 9 + j, w, 1, '#8b7fb0'); } }
  if (eq.back === 'jetpack') { fill(OX + 1, OY + 9, 3, 8, '#6b7280', 'shade'); fill(OX + 12, OY + 9, 3, 8, '#6b7280', 'shade'); fill(OX + 1, OY + 17, 3, 2, '#f97316', 'flat'); fill(OX + 12, OY + 17, 3, 2, '#f97316', 'flat'); px(OX + 2, OY + 19, '#fde047'); px(OX + 13, OY + 19, '#fde047'); }

  // רגליים
  fill(OX + 4, OY + 20, 4, 12, pants, 'shade'); fill(OX + 8, OY + 20, 4, 12, pants, 'shade');
  fill(OX + 4, OY + 29, 4, 3, '#6b4423'); fill(OX + 8, OY + 29, 4, 3, '#6b4423');
  // גוף
  fill(OX + 4, OY + 8, 8, 12, shirt);
  if (eq.suit) { fill(OX + 4, OY + 8, 8, 1, shade(shirt, .25), 'flat'); fill(OX + 4, OY + 19, 8, 1, shade(shirt, -.3), 'flat'); }
  else { fill(OX + 4, OY + 8, 8, 1, shade(shirt, -.25), 'flat'); fill(OX + 7, OY + 9, 2, 9, '#f5f5f4', 'flat'); }
  fill(OX + 4, OY + 18, 8, 1, '#3f2a14', 'flat'); px(OX + 7, OY + 18, '#f2c84b'); px(OX + 8, OY + 18, '#f2c84b');
  // סמל
  const emC = { bolt: '#facc15', star: '#fde047', brain: '#f472b6', eye: '#22d3ee' }[eq.emblem];
  if (emC) { fill(OX + 7, OY + 12, 2, 3, emC, 'flat'); px(OX + 6, OY + 13, emC); px(OX + 9, OY + 13, emC); if (eq.emblem === 'eye') { px(OX + 7, OY + 13, '#0b1020'); } }
  // ידיים
  fill(OX + 0, OY + 8, 4, 4, shirt); fill(OX + 12, OY + 8, 4, 4, shirt);
  fill(OX + 0, OY + 12, 4, 8, skin, 'shade'); fill(OX + 12, OY + 12, 4, 8, skin, 'shade');
  // ראש
  fill(OX + 4, OY + 0, 8, 8, skin);
  fill(OX + 4, OY + 0, 8, 2, hair); px(OX + 4, OY + 2, hair); px(OX + 11, OY + 2, hair); px(OX + 4, OY + 3, hair); px(OX + 11, OY + 3, hair); px(OX + 5, OY + 2, hair); px(OX + 6, OY + 2, hair); px(OX + 3, OY + 1, hair); px(OX + 12, OY + 1, hair); px(OX + 5, OY - 1, hair); px(OX + 8, OY - 1, hair); px(OX + 10, OY - 1, hair);
  // עיניים ופה
  px(OX + 5, OY + 4, '#1f1a17'); px(OX + 6, OY + 4, '#16a34a'); px(OX + 9, OY + 4, '#16a34a'); px(OX + 10, OY + 4, '#1f1a17'); px(OX + 5, OY + 3, '#1f1a17'); px(OX + 10, OY + 3, '#1f1a17');
  px(OX + 7, OY + 5, shade(skin, -.2)); px(OX + 8, OY + 5, shade(skin, -.2));
  fill(OX + 6, OY + 6, 4, 1, '#7c2d12', 'flat'); px(OX + 5, OY + 5, '#7c2d12'); px(OX + 10, OY + 5, '#7c2d12');
  // פריטי ראש
  if (eq.head === 'headband') { fill(OX + 4, OY + 2, 8, 1, '#dc2626', 'flat'); px(OX + 3, OY + 3, '#dc2626'); px(OX + 2, OY + 4, '#dc2626'); }
  if (eq.head === 'mask') { fill(OX + 4, OY + 4, 8, 1, '#1e1b4b', 'flat'); px(OX + 5, OY + 4, '#fff'); px(OX + 10, OY + 4, '#fff'); }
  if (eq.head === 'visor') { fill(OX + 4, OY + 4, 8, 1, '#22d3ee', 'flat'); px(OX + 5, OY + 4, '#a5f3fc'); }
  if (eq.head === 'helmet') { fill(OX + 3, OY - 1, 10, 3, '#c0c7cf', 'shade'); fill(OX + 3, OY + 2, 1, 4, '#9ca3af', 'flat'); fill(OX + 12, OY + 2, 1, 4, '#9ca3af', 'flat'); fill(OX + 5, OY - 1, 6, 1, '#e5e7eb', 'flat'); }
  if (eq.head === 'crown') { fill(OX + 4, OY - 1, 8, 1, '#f2c84b', 'flat'); [4, 7, 8, 11].forEach(i => px(OX + i, OY - 2, '#f2c84b')); px(OX + 7, OY - 1, '#ef4444'); px(OX + 8, OY - 1, '#ef4444'); }
  // מגן
  if (eq.weapon2 === 'shield') { const R = [[1, 4], [0, 6], [0, 6], [0, 6], [0, 6], [0, 6], [1, 4]]; R.forEach(([a, w], j) => fill(OX - 3 + a, OY + 12 + j, w, 1, '#1d4ed8', (i, jj) => (a + i === 0 || a + i === 5 || j === 0 || j === 6) ? '#facc15' : (a + i === 2 || a + i === 3) && j > 1 && j < 5 ? '#f8fafc' : '#1d4ed8')); }
  // נשק
  const hx = OX + 14, hy = OY + 16; // יד ימין
  if (eq.weapon === 'sword') { for (let k = 0; k < 11; k++) { px(hx + 1, hy - 3 - k, k % 3 === 0 ? '#f8fafc' : '#cbd5e1'); px(hx + 2, hy - 3 - k, k % 2 ? '#94a3b8' : '#cbd5e1'); } px(hx + 1, hy - 14, '#f8fafc'); fill(hx - 1, hy - 2, 5, 1, '#eab308', 'flat'); px(hx + 1, hy - 2, '#ef4444'); fill(hx + 1, hy - 1, 2, 3, '#7a4a20', 'flat'); }
  if (eq.weapon === 'staff') { fill(hx + 1, hy - 14, 1, 30, '#7a4a20', 'flat'); fill(hx, hy - 17, 3, 3, '#a855f7', 'flat'); px(hx + 1, hy - 16, '#f0abfc'); }
  if (eq.weapon === 'blaster') { for (let k = 0; k < 13; k++) { const off = Math.round(Math.abs(k - 6) * 0.5); px(hx + 3 - off, hy - 6 + k, '#7a4a20'); } fill(hx + 3, hy - 6, 1, 13, '#e5e7eb', 'flat'); }
  if (eq.weapon === 'hammer') { fill(hx + 1, hy - 10, 1, 14, '#7a4a20', 'flat'); fill(hx - 2, hy - 14, 7, 4, '#4b4b5a', 'shade'); fill(hx - 1, hy - 13, 5, 1, '#6b6b7a', 'flat'); }

  const rects = [];
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) if (grid[j][i]) rects.push(`<rect x="${i * PX}" y="${j * PX}" width="${PX + .4}" height="${PX + .4}" fill="${grid[j][i]}"/>`);
  const W = GW * PX, H = GH * PX;
  const aura = opts.aura ? `<defs><radialGradient id="${u}a"><stop offset="0" stop-color="${opts.aura}" stop-opacity=".55"/><stop offset="1" stop-color="${opts.aura}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${W / 2}" cy="${H / 2}" rx="${W / 2}" ry="${H / 2}" fill="url(#${u}a)"><animate attributeName="opacity" values=".7;1;.7" dur="2.6s" repeatCount="indefinite"/></ellipse>` : '';
  return `<svg viewBox="-4 -4 ${W + 8} ${H + 8}" class="hero-svg pixel" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">${aura}<ellipse cx="${W / 2}" cy="${H - 6}" rx="${W / 3}" ry="6" fill="#000" opacity=".35"/>${rects.join('')}</svg>`;
}
