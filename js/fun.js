// רקעים לגיבור ומתנות מצחיקות לדו-קרב
import { lobbyScene } from './icons.js?v=26';

// r: 1 רגיל · 2 נדיר · 3 אפי
export const BGS = {
  ocean:   { name: 'מצולות האוקיינוס', r: 1 },
  snow:    { name: 'פסגת הקרח',        r: 1 },
  jungle:  { name: 'הג׳ונגל האבוד',     r: 1 },
  volcano: { name: 'לב הר הגעש',       r: 2 },
  space:   { name: 'תחנת חלל',          r: 2 },
  neon:    { name: 'כביש הניאון',       r: 3 },
  chess:   { name: 'אולם השחמט',        r: 3 },
};
export const RAR_NAME = { 1: 'רגיל', 2: 'נדיר', 3: 'אפי' };

const S = (inner, defs = '') => `<svg class="scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice"><defs>${defs}</defs>${inner}</svg>`;
const rnd = seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

function ocean() {
  const r = rnd(7);
  const bubbles = Array.from({ length: 18 }, () => `<circle cx="${(r() * 320).toFixed(0)}" cy="${(r() * 170).toFixed(0)}" r="${(1.5 + r() * 3.5).toFixed(1)}" fill="none" stroke="#bae6fd" stroke-opacity=".55"/>`).join('');
  const weeds = [18, 44, 270, 298].map((x, i) => `<path d="M${x} 200 q${i % 2 ? 10 : -10} -25 0 -50 q${i % 2 ? -10 : 10} -25 0 -50" stroke="#15803d" stroke-width="6" fill="none" stroke-linecap="round"/>`).join('');
  return S(`<rect width="320" height="200" fill="url(#oc1)"/>
    <g fill="#e0f2fe" opacity=".08"><path d="M60 0h30l-50 200h-30z"/><path d="M150 0h22l-20 200h-40z"/><path d="M240 0h30l30 200h-40z"/></g>
    ${bubbles}${weeds}
    <path d="M0 178 Q80 166 160 176 T320 172 V200 H0z" fill="#d6b77a"/><path d="M0 186 Q90 178 180 186 T320 182 V200 H0z" fill="#c4a066"/>
    <g fill="#fb7185"><circle cx="230" cy="174" r="7"/><circle cx="240" cy="168" r="6"/><circle cx="249" cy="175" r="6"/></g>
    <g fill="#f59e0b" opacity=".9"><path d="M80 70 q10 -8 20 0 q-10 8 -20 0z"/><path d="M100 70l8 -6v12z"/></g>
    <g fill="#38bdf8" opacity=".8"><path d="M200 50 q8 -6 16 0 q-8 6 -16 0z"/><path d="M216 50l6 -5v10z"/></g>`,
    `<linearGradient id="oc1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c4a6e"/><stop offset="1" stop-color="#082f49"/></linearGradient>`);
}
function snow() {
  const r = rnd(3);
  const flakes = Array.from({ length: 30 }, () => `<circle cx="${(r() * 320).toFixed(0)}" cy="${(r() * 150).toFixed(0)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="#fff" opacity=".85"/>`).join('');
  return S(`<rect width="320" height="200" fill="url(#sn1)"/>
    <path d="M0 40 Q80 10 160 38 T320 30" stroke="url(#sn2)" stroke-width="22" fill="none" opacity=".55"/>
    <path d="M0 150 L50 80 L80 110 L130 50 L180 120 L220 70 L270 130 L320 90 V200 H0z" fill="#6d7fb3"/>
    <path d="M130 50 L115 72 L124 70 L130 78 L138 68 L146 72z M50 80 L42 92 L50 90 L56 95z M220 70 L210 85 L220 82 L228 88z" fill="#f8fafc"/>
    <path d="M0 175 Q100 160 200 172 T320 165 V200 H0z" fill="#e2e8f0"/><path d="M0 188 Q120 178 240 186 T320 184 V200 H0z" fill="#f8fafc"/>
    ${flakes}`,
    `<linearGradient id="sn1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#4c5a9e"/></linearGradient>
     <linearGradient id="sn2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4ade80"/><stop offset=".5" stop-color="#22d3ee"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>`);
}
function jungle() {
  const leaf = (x, y, s, rot, c) => `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 0 Q20 -18 44 0 Q20 18 0 0z M0 0 L44 0" fill="${c}" stroke="#14532d" stroke-width="1.5"/>`;
  return S(`<rect width="320" height="200" fill="url(#jg1)"/>
    <g fill="#166534" opacity=".55"><rect x="40" y="0" width="16" height="200"/><rect x="250" y="0" width="20" height="200"/><rect x="150" y="0" width="10" height="200"/></g>
    <path d="M70 0 q10 40 -4 80 q-8 30 6 60" stroke="#15803d" stroke-width="3" fill="none"/><path d="M220 0 q-10 50 6 90" stroke="#15803d" stroke-width="3" fill="none"/>
    <rect y="120" width="320" height="30" fill="#bbf7d0" opacity=".12"/>
    ${leaf(-10, 20, 1.6, 20, '#22c55e')}${leaf(0, 60, 1.3, -10, '#16a34a')}${leaf(330, 30, 1.6, 160, '#22c55e')}${leaf(325, 80, 1.2, 200, '#16a34a')}
    ${leaf(-5, 150, 1.5, -30, '#15803d')}${leaf(325, 160, 1.5, 210, '#15803d')}
    <path d="M0 180 Q80 170 160 178 T320 174 V200 H0z" fill="#3f2d1d"/><path d="M0 190 Q100 182 200 188 T320 186 V200 H0z" fill="#2a1f14"/>
    <g fill="#fde047"><circle cx="110" cy="90" r="1.5"/><circle cx="200" cy="70" r="1.5"/><circle cx="170" cy="110" r="1.2"/></g>`,
    `<linearGradient id="jg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#052e16"/><stop offset="1" stop-color="#14532d"/></linearGradient>`);
}
function volcano() {
  const r = rnd(11);
  const embers = Array.from({ length: 22 }, () => `<circle cx="${(r() * 320).toFixed(0)}" cy="${(r() * 160).toFixed(0)}" r="${(0.8 + r() * 1.8).toFixed(1)}" fill="${r() > .5 ? '#fdba74' : '#fde047'}" opacity=".85"/>`).join('');
  return S(`<rect width="320" height="200" fill="url(#vo1)"/>
    <ellipse cx="160" cy="70" rx="60" ry="30" fill="#f97316" opacity=".35"/>
    <path d="M40 200 L130 70 L190 70 L280 200z" fill="#292524"/><path d="M130 70 L190 70 L182 80 L138 80z" fill="#f97316"/>
    <path d="M152 80 q-6 30 4 60 q6 30 -6 60" stroke="#fb923c" stroke-width="5" fill="none"/><path d="M170 80 q10 40 -2 70 q-8 25 10 50" stroke="#f97316" stroke-width="4" fill="none"/>
    <path d="M0 200 L0 150 L40 130 L70 170z M320 200 L320 140 L280 125 L250 170z" fill="#1c1917"/>
    <path d="M0 186 Q160 170 320 186 V200 H0z" fill="#44403c"/><path d="M60 192 q60 -10 120 0" stroke="#f97316" stroke-width="3" fill="none" opacity=".8"/>
    ${embers}`,
    `<linearGradient id="vo1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#450a0a"/><stop offset=".6" stop-color="#7c2d12"/><stop offset="1" stop-color="#9a3412"/></linearGradient>`);
}
function space() {
  const r = rnd(5);
  const stars = Array.from({ length: 45 }, () => `<circle cx="${(r() * 320).toFixed(0)}" cy="${(r() * 150).toFixed(0)}" r="${(0.5 + r() * 1.3).toFixed(1)}" fill="#fff" opacity="${(.4 + r() * .6).toFixed(2)}"/>`).join('');
  return S(`<rect width="320" height="200" fill="url(#sp1)"/>${stars}
    <ellipse cx="80" cy="60" rx="70" ry="22" fill="#a78bfa" opacity=".15"/>
    <circle cx="250" cy="55" r="26" fill="url(#sp2)"/><ellipse cx="250" cy="55" rx="44" ry="9" fill="none" stroke="#fcd34d" stroke-width="3" opacity=".8" transform="rotate(-15 250 55)"/>
    <circle cx="60" cy="40" r="7" fill="#94a3b8"/>
    <path d="M0 170 Q160 150 320 170 V200 H0z" fill="#64748b"/><path d="M0 182 Q160 168 320 182 V200 H0z" fill="#475569"/>
    <g fill="#334155"><ellipse cx="70" cy="180" rx="16" ry="4"/><ellipse cx="230" cy="186" rx="22" ry="5"/><ellipse cx="150" cy="176" rx="8" ry="2.5"/></g>`,
    `<linearGradient id="sp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020617"/><stop offset="1" stop-color="#1e1b4b"/></linearGradient>
     <radialGradient id="sp2" cx=".35" cy=".35"><stop offset="0" stop-color="#fdba74"/><stop offset="1" stop-color="#c2410c"/></radialGradient>`);
}
function neon() {
  const grid = [];
  for (let i = 0; i <= 16; i++) grid.push(`<line x1="${160 + (i - 8) * 6}" y1="130" x2="${160 + (i - 8) * 60}" y2="200"/>`);
  [134, 140, 148, 158, 172, 190].forEach(y => grid.push(`<line x1="0" y1="${y}" x2="320" y2="${y}"/>`));
  return S(`<rect width="320" height="200" fill="url(#ne1)"/>
    <circle cx="160" cy="105" r="48" fill="url(#ne2)"/>
    <g fill="#2e1065">${[0, 1, 2, 3, 4].map(i => `<rect x="100" y="${108 + i * 6}" width="120" height="${1.5 + i * .8}"/>`).join('')}</g>
    <path d="M0 130 L40 100 L70 118 L100 92 L130 130z M190 130 L220 96 L250 116 L285 90 L320 112 V130z" fill="#3b0764"/>
    <rect y="130" width="320" height="70" fill="#0f0326"/>
    <g stroke="#e879f9" stroke-width="1" opacity=".75">${grid.join('')}</g>
    <line x1="0" y1="130" x2="320" y2="130" stroke="#f0abfc" stroke-width="2"/>`,
    `<linearGradient id="ne1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f0326"/><stop offset="1" stop-color="#581c87"/></linearGradient>
     <linearGradient id="ne2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde047"/><stop offset=".6" stop-color="#f472b6"/><stop offset="1" stop-color="#a21caf"/></linearGradient>`);
}
function chess() {
  // רצפת שחמט בפרספקטיבה + כלים גדולים ברקע
  const tiles = [];
  const rows = [130, 140, 152, 166, 182, 200];
  for (let r = 0; r < rows.length - 1; r++) {
    const y0 = rows[r], y1 = rows[r + 1];
    for (let c = -8; c < 8; c++) {
      const k = (y => (y - 100) / 100);
      const x = (c, y) => 160 + c * 40 * k(y) * 1.6;
      tiles.push(`<path d="M${x(c, y0)} ${y0} L${x(c + 1, y0)} ${y0} L${x(c + 1, y1)} ${y1} L${x(c, y1)} ${y1}z" fill="${(r + c) % 2 ? '#e7e5e4' : '#292524'}"/>`);
    }
  }
  const pawn = (x, s, c) => `<g transform="translate(${x} 130) scale(${s})" fill="${c}"><circle cx="0" cy="-58" r="10"/><path d="M-7 -48 h14 l6 34 h-26z"/><rect x="-18" y="-14" width="36" height="8" rx="2"/><rect x="-22" y="-6" width="44" height="6" rx="2"/></g>`;
  const rook = (x, s, c) => `<g transform="translate(${x} 130) scale(${s})" fill="${c}"><path d="M-16 -70 h7 v6 h5 v-6 h8 v6 h5 v-6 h7 v14 h-32z"/><path d="M-12 -56 h24 l4 42 h-32z"/><rect x="-20" y="-14" width="40" height="8" rx="2"/><rect x="-24" y="-6" width="48" height="6" rx="2"/></g>`;
  const king = (x, s, c) => `<g transform="translate(${x} 130) scale(${s})" fill="${c}"><rect x="-2.5" y="-92" width="5" height="16"/><rect x="-8" y="-87" width="16" height="5"/><path d="M-14 -76 h28 l-6 14 h-16z"/><path d="M-10 -62 h20 l6 48 h-32z"/><rect x="-20" y="-14" width="40" height="8" rx="2"/><rect x="-24" y="-6" width="48" height="6" rx="2"/></g>`;
  return S(`<rect width="320" height="200" fill="url(#chs1)"/>
    <g fill="#fbbf24" opacity=".12"><path d="M90 0 h20 l-30 130 h-30z"/><path d="M210 0 h20 l30 130 h-30z"/></g>
    ${rook(36, 1, '#57412f')}${king(282, 1.05, '#57412f')}${pawn(92, .6, '#6b5440')}${pawn(232, .6, '#6b5440')}
    ${tiles.join('')}`,
    `<linearGradient id="chs1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1410"/><stop offset="1" stop-color="#57351c"/></linearGradient>`);
}
const SCENES = { ocean, snow, jungle, volcano, space, neon, chess };
export function bgScene(id) { return SCENES[id] ? SCENES[id]() : ''; }
export function heroScene(p) { return p?.bg && SCENES[p.bg] ? SCENES[p.bg]() : lobbyScene(p?.style || 'comic'); }

// בחירת רקע אקראי שעוד לא קיבל (maxR = נדירות מקסימלית)
export function rollBg(p, maxR = 3) {
  const own = p.bgs || [];
  const pool = Object.keys(BGS).filter(k => !own.includes(k) && BGS[k].r <= maxR);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

// ----- מתנות מצחיקות -----
export const GIFTS = {
  pie:     { e: '🥧', name: 'עוגת קצפת',     fx: 'splat',  line: n => `<b>${n}</b> זרק עליך עוגת קצפת – ישר לפרצוף!` },
  sock:    { e: '🧦', name: 'גרב מסריחה',    fx: 'stink',  line: n => `<b>${n}</b> שלח לך גרב אחרי שבוע בלי כביסה. פיייי!` },
  fish:    { e: '🐟', name: 'דג רטוב',        fx: 'slap',   line: n => `<b>${n}</b> הצליף בך עם דג רטוב. שלאפ!` },
  banana:  { e: '🍌', name: 'קליפת בננה',     fx: 'slip',   line: n => `<b>${n}</b> שם לך קליפת בננה. אופס…` },
  chicken: { e: '🐔', name: 'תרנגולת גומי',   fx: 'bounce', line: n => `<b>${n}</b> שלח לך תרנגולת גומי שלא מפסיקה לצפצף!` },
  tp:      { e: '🧻', name: 'נייר טואלט',     fx: 'wrap',   line: n => `<b>${n}</b> עטף אותך בנייר טואלט כמו מומיה!` },
  frog:    { e: '🐸', name: 'צפרדע קופצת',    fx: 'bounce', line: n => `<b>${n}</b> שחרר עליך צפרדע קופצת. קוואק!` },
};
export function rollGift() { const k = Object.keys(GIFTS); return k[Math.floor(Math.random() * k.length)]; }
export function addGift(p, id, n = 1) { p.gifts = p.gifts || {}; p.gifts[id] = (p.gifts[id] || 0) + n; }

// אנימציית פגיעה של מתנה על דמות (el = מיכל שמכיל את ה-SVG של הגיבור)
export function giftHit(el, id) {
  const g = GIFTS[id]; if (!g || !el) return;
  el.classList.add('gift-target');
  const fly = document.createElement('div'); fly.className = 'gift-fly'; fly.textContent = g.e; el.appendChild(fly);
  setTimeout(() => {
    fly.remove(); el.classList.add('gfx-' + g.fx);
    const fx = document.createElement('div'); fx.className = 'gift-fx ' + g.fx;
    fx.innerHTML = g.fx === 'splat' ? `<svg viewBox="0 0 100 70"><path d="M10 40 Q5 20 25 22 Q30 5 50 12 Q70 2 78 20 Q98 22 90 42 Q96 60 72 58 Q60 70 45 60 Q22 68 18 55 Q2 52 10 40z" fill="#fffbeb" stroke="#fde68a" stroke-width="2"/><circle cx="40" cy="30" r="4" fill="#ef4444"/><path d="M30 58 q2 10 0 12 M62 56 q2 8 0 10" stroke="#fffbeb" stroke-width="4" stroke-linecap="round"/></svg>`
      : g.fx === 'stink' ? `<span class="st">〰</span><span class="st">〰</span><span class="st">〰</span><span class="gem">${g.e}</span>`
      : g.fx === 'wrap' ? `<i></i><i></i><i></i><i></i>`
      : `<span class="gem">${g.e}</span>`;
    el.appendChild(fx);
  }, 650);
}
