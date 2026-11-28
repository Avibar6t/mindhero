// MindHero – יצורי שותף: ביצה ו-5 שלבי גדילה. walk = הולכים (גיאומטריה), fly = מעופפים (שברים)
let N = 0;
const OL = '#1e1b2e', SW = 3;
const st = `stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"`;

export const CREATURES = {
  fox:      { kind: 'walk', name: 'שועל האש',      desc: 'זריז וערמומי. הזנב שלו בוער יותר ככל שהוא מתחזק.', c1: '#fb923c', c2: '#fde68a' },
  golem:    { kind: 'walk', name: 'גולם הקריסטל',   desc: 'בנוי ממנסרות קריסטל! כל שלב מצמיח לו גבישים חדשים.', c1: '#a78bfa', c2: '#67e8f9' },
  rex:      { kind: 'walk', name: 'דינו-רקס',       desc: 'קטן ומתוק עכשיו – ענק ושואג בסוף.', c1: '#4ade80', c2: '#fde047' },
  dragon:   { kind: 'fly',  name: 'דרקון הרוח',     desc: 'הכנפיים שלו גדלות עם כל תרגול. בסוף – נשימת אש.', c1: '#38bdf8', c2: '#c4b5fd' },
  owl:      { kind: 'fly',  name: 'ינשוף הסערה',    desc: 'הכי חכם בשמיים. הנוצות שלו מתחשמלות.', c1: '#a8a29e', c2: '#facc15' },
  firebird: { kind: 'fly',  name: 'ציפור האש',      desc: 'הזנב שלה הופך ללהבות זוהרות.', c1: '#f43f5e', c2: '#fb923c' },
};
export const STAGE_NAME = ['ביצה', 'בוקע', 'גור', 'צעיר', 'בוגר', 'אגדי'];

const eye = (x, y, r, glow) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="${glow || OL}"/><circle cx="${x - r * .35}" cy="${y - r * .4}" r="${r * .38}" fill="#fff"/><circle cx="${x + r * .3}" cy="${y + r * .35}" r="${r * .16}" fill="#fff" opacity=".8"/>`;
const blush = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3.5" fill="#fb7185" opacity=".45"/>`;
const crown = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-16 0 L-16 -14 L-8 -6 L0 -18 L8 -6 L16 -14 L16 0 Z" fill="#facc15" ${st}/><circle cx="0" cy="-6" r="3" fill="#ef4444"/></g>`;
const sparkles = c => `<g fill="${c}">${[[20, 40], [178, 60], [30, 150], [170, 140], [100, 12]].map(([x, y], i) => `<path d="M${x} ${y - 6} L${x + 2} ${y - 2} L${x + 6} ${y} L${x + 2} ${y + 2} L${x} ${y + 6} L${x - 2} ${y + 2} L${x - 6} ${y} L${x - 2} ${y - 2} Z"><animate attributeName="opacity" values="0;1;0" dur="${1.6 + i * .3}s" repeatCount="indefinite"/></path>`).join('')}</g>`;
const flame = (x, y, s, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0 C-10 -8 -8 -22 0 -34 C2 -24 12 -20 8 -8 C6 -3 3 0 0 0Z" fill="#f97316" stroke="#b45309" stroke-width="1.5"><animate attributeName="d" values="M0 0 C-10 -8 -8 -22 0 -34 C2 -24 12 -20 8 -8 C6 -3 3 0 0 0Z;M0 0 C-11 -9 -5 -24 2 -36 C3 -24 13 -21 8 -8 C6 -3 3 0 0 0Z;M0 0 C-10 -8 -8 -22 0 -34 C2 -24 12 -20 8 -8 C6 -3 3 0 0 0Z" dur="0.9s" repeatCount="indefinite"/></path><path d="M0 -3 C-5 -8 -3 -16 1 -22 C2 -15 7 -12 4 -6Z" fill="#fde047"/></g>`;

function fox(s, c) {
  const o = [];
  // זנב
  o.push(`<path d="M128 150 C170 150 182 108 166 82 C158 110 140 120 122 128 Z" fill="${c.c1}" ${st}/><path d="M166 82 C176 96 174 112 164 122 C160 108 162 96 166 82Z" fill="#fff7ed"/>`);
  if (s >= 3) o.push(flame(168, 88, s >= 4 ? 1.1 : .8, 20));
  if (s >= 4) o.push(flame(150, 120, .7, 60), flame(176, 112, .6, 40));
  // גוף ורגליים
  o.push(`<ellipse cx="96" cy="140" rx="40" ry="32" fill="${c.c1}" ${st}/><ellipse cx="94" cy="150" rx="22" ry="18" fill="#fff7ed"/>`);
  o.push(`<rect x="70" y="160" width="14" height="24" rx="7" fill="${c.c1}" ${st}/><rect x="104" y="160" width="14" height="24" rx="7" fill="${c.c1}" ${st}/><ellipse cx="77" cy="184" rx="9" ry="4" fill="#431407"/><ellipse cx="111" cy="184" rx="9" ry="4" fill="#431407"/>`);
  // ראש
  o.push(`<path d="M60 62 L52 22 L82 46 Z" fill="${c.c1}" ${st}/><path d="M132 62 L140 22 L110 46 Z" fill="${c.c1}" ${st}/><path d="M60 52 L57 32 L72 46Z M132 52 L135 32 L120 46Z" fill="#fecaca"/>`);
  o.push(`<path d="M50 80 C50 50 70 40 96 40 C122 40 142 50 142 80 C142 104 122 118 96 118 C70 118 50 104 50 80Z" fill="${c.c1}" ${st}/><path d="M66 96 C74 116 118 116 126 96 C116 104 76 104 66 96Z" fill="#fff7ed"/>`);
  o.push(eye(78, 78, 8, s >= 4 ? '#7c2d12' : null), eye(114, 78, 8, s >= 4 ? '#7c2d12' : null), `<path d="M92 96 L100 96 L96 101Z" fill="${OL}"/>`, blush(68, 92), blush(124, 92));
  if (s >= 2) o.push(`<path d="M86 50 L96 58 L106 50" stroke="#fde68a" stroke-width="4" fill="none"/>`);
  if (s >= 5) o.push(crown(96, 40));
  return o.join('');
}
function golem(s, c) {
  const o = [];
  const crystal = (x, y, h, w, rot, col) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M${-w} 0 L${-w} ${-h} L0 ${-h - w} L${w} ${-h} L${w} 0Z" fill="${col}" ${st}/><path d="M0 ${-h - w} L0 0" stroke="#fff" stroke-width="2" opacity=".5"/></g>`;
  const k = Math.min(s, 5);
  [[70, 92, 22, 7, -25], [96, 82, 30, 8, 0], [122, 92, 22, 7, 25], [56, 112, 16, 6, -50], [138, 112, 16, 6, 50]].slice(0, 1 + k).forEach(([x, y, h, w, r], i) => o.push(crystal(x, y, h + (s >= 4 ? 6 : 0), w, r, i % 2 ? c.c2 : c.c1)));
  o.push(`<path d="M52 110 L70 88 L122 88 L140 110 L134 162 L58 162 Z" fill="#64748b" ${st}/><path d="M70 120 L96 108 L122 120 L114 150 L78 150Z" fill="#475569"/>`);
  if (s >= 2) o.push(`<path d="M78 126 L96 118 L114 126 L108 144 L84 144Z" fill="${c.c2}" ${st}><animate attributeName="opacity" values=".7;1;.7" dur="2s" repeatCount="indefinite"/></path>`);
  o.push(`<rect x="34" y="112" width="22" height="40" rx="8" fill="#64748b" ${st}/><rect x="136" y="112" width="22" height="40" rx="8" fill="#64748b" ${st}/><rect x="64" y="158" width="24" height="26" rx="6" fill="#475569" ${st}/><rect x="104" y="158" width="24" height="26" rx="6" fill="#475569" ${st}/>`);
  if (s >= 3) o.push(`<path d="M34 120 L56 120 M136 120 L158 120" stroke="${c.c1}" stroke-width="5"/>`);
  o.push(`<rect x="70" y="56" width="52" height="40" rx="10" fill="#94a3b8" ${st}/>`, eye(86, 76, 6, s >= 4 ? c.c2 : null), eye(106, 76, 6, s >= 4 ? c.c2 : null), `<path d="M88 88 Q96 92 104 88" stroke="${OL}" stroke-width="2.5" fill="none"/>`);
  if (s >= 5) o.push(crown(96, 56, .9));
  return o.join('');
}
function rex(s, c) {
  const o = [];
  o.push(`<path d="M128 150 C160 156 182 150 190 132 C176 140 156 138 134 130Z" fill="${c.c1}" ${st}/>`);
  if (s >= 3) o.push(`<g fill="${c.c2}" ${st}>${[[78, 66], [92, 58], [108, 60], [122, 70], [134, 86]].slice(0, s >= 4 ? 5 : 3).map(([x, y]) => `<path d="M${x - 7} ${y + 6} L${x} ${y - 9} L${x + 7} ${y + 6}Z"/>`).join('')}</g>`);
  o.push(`<ellipse cx="100" cy="136" rx="42" ry="38" fill="${c.c1}" ${st}/><ellipse cx="96" cy="146" rx="24" ry="24" fill="#fef9c3"/>`);
  o.push(`<path d="M70 168 L70 184 L90 184 L88 166Z M110 166 L108 184 L128 184 L128 168Z" fill="${c.c1}" ${st}/>`);
  o.push(`<path d="M64 120 Q52 124 54 132" stroke="${OL}" stroke-width="6" fill="none"/><path d="M64 120 Q52 124 54 132" stroke="${c.c1}" stroke-width="3" fill="none"/>`);
  o.push(`<path d="M54 78 C54 52 76 40 98 42 C124 44 140 58 138 84 C136 104 118 112 96 112 C70 112 54 100 54 78Z" fill="${c.c1}" ${st}/>`);
  o.push(eye(82, 72, 8, s >= 4 ? '#7f1d1d' : null), eye(116, 74, 8, s >= 4 ? '#7f1d1d' : null), `<path d="M78 96 Q98 106 118 96" stroke="${OL}" stroke-width="3" fill="none"/><path d="M86 98 l3 5 3-4 M104 98 l3 5 3-5" stroke="#fff" stroke-width="2.5" fill="none"/>`, blush(70, 90), blush(126, 90));
  if (s >= 2) o.push(`<g fill="#16a34a" opacity=".7"><circle cx="70" cy="132" r="5"/><circle cx="130" cy="128" r="6"/><circle cx="120" cy="150" r="4"/></g>`);
  if (s >= 4) o.push(`<path d="M60 112 L140 112 L136 124 L64 124Z" fill="#94a3b8" ${st}/>`);
  if (s >= 5) o.push(crown(98, 44));
  return o.join('');
}
function wing(side, s, col, col2, feather = false) {
  const k = 0.55 + s * 0.12, sx = side === 'l' ? -1 : 1;
  const body = feather
    ? `<path d="M0 0 C18 -42 70 -58 102 -46 C94 -38 98 -31 101 -26 C89 -24 91 -16 95 -9 C82 -10 81 -1 83 5 C68 1 63 9 63 15 C48 9 38 15 35 23 C21 13 9 6 0 0Z" fill="${col}" ${st}/><path d="M14 -6 C38 -30 70 -40 92 -38 M22 2 C46 -14 66 -18 86 -14 M30 10 C46 2 58 0 72 2" stroke="${col2}" stroke-width="3" fill="none" opacity=".85"/>`
    : `<path d="M0 0 C30 -50 80 -60 104 -40 C86 -34 84 -20 92 -6 C74 -12 66 -2 70 12 C52 4 40 12 38 24 C24 10 10 6 0 0Z" fill="${col}" ${st}/><path d="M12 -2 C40 -34 74 -44 96 -38 M20 6 C46 -10 62 -14 84 -8" stroke="${col2}" stroke-width="3" fill="none" opacity=".8"/>`;
  return `<g class="crt-wing ${side}" transform="translate(${100 + sx * 26} 96) scale(${sx * k} ${k})">${body}</g>`;
}
function dragon(s, c) {
  const o = [wing('l', s, c.c1, c.c2), wing('r', s, c.c1, c.c2)];
  o.push(`<path d="M110 150 C140 168 168 160 176 140 C162 148 140 146 120 138Z" fill="${c.c1}" ${st}/><path d="M176 140 l10 -10 -2 14 Z" fill="${c.c2}" ${st}/>`);
  o.push(`<ellipse cx="100" cy="128" rx="32" ry="34" fill="${c.c1}" ${st}/><path d="M86 108 L114 108 L112 156 L88 156Z" fill="#e0f2fe" opacity=".85"/>`);
  o.push(`<path d="M80 156 l-4 18 14 0 0-14Z M120 156 l4 18 -14 0 0-14Z" fill="${c.c1}" ${st}/>`);
  if (s >= 3) o.push(`<path d="M72 54 L62 26 L84 46Z M128 54 L138 26 L116 46Z" fill="${c.c2}" ${st}/>`);
  o.push(`<path d="M62 74 C62 50 80 40 100 40 C120 40 138 50 138 74 C138 98 120 106 100 106 C80 106 62 98 62 74Z" fill="${c.c1}" ${st}/><ellipse cx="100" cy="92" rx="20" ry="11" fill="#e0f2fe"/>`);
  o.push(eye(84, 70, 7.5, s >= 4 ? '#0c4a6e' : null), eye(116, 70, 7.5, s >= 4 ? '#0c4a6e' : null), `<circle cx="94" cy="92" r="2" fill="${OL}"/><circle cx="106" cy="92" r="2" fill="${OL}"/>`, blush(72, 84), blush(128, 84));
  if (s >= 4) o.push(`<path d="M100 104 Q100 120 92 126" stroke="#f97316" stroke-width="4" fill="none" opacity=".8"><animate attributeName="opacity" values=".2;.9;.2" dur="1.5s" repeatCount="indefinite"/></path>`);
  if (s >= 5) o.push(crown(100, 42));
  return o.join('');
}
function owl(s, c) {
  const o = [wing('l', s - 1, c.c1, c.c2, true), wing('r', s - 1, c.c1, c.c2, true)];
  o.push(`<path d="M64 80 C60 130 72 164 100 166 C128 164 140 130 136 80 C130 52 70 52 64 80Z" fill="${c.c1}" ${st}/><path d="M78 110 C78 140 88 156 100 156 C112 156 122 140 122 110 C112 118 88 118 78 110Z" fill="#f5f5f4"/>`);
  o.push(`<g stroke="#a8a29e" stroke-width="2" fill="none">${[118, 130, 142].map(y => `<path d="M88 ${y} q4 4 8 0 q4 4 8 0 q4 4 8 0"/>`).join('')}</g>`);
  if (s >= 3) o.push(`<path d="M70 66 L60 38 L86 58Z M130 66 L140 38 L114 58Z" fill="${c.c1}" ${st}/>`);
  o.push(`<circle cx="84" cy="84" r="17" fill="#fff" ${st}/><circle cx="116" cy="84" r="17" fill="#fff" ${st}/>`, eye(84, 84, 9, s >= 4 ? '#854d0e' : null), eye(116, 84, 9, s >= 4 ? '#854d0e' : null));
  o.push(`<path d="M94 98 L106 98 L100 110Z" fill="${c.c2}" ${st}/><path d="M86 166 l-4 10 M92 166 l0 10 M108 166 l0 10 M114 166 l4 10" stroke="#f59e0b" stroke-width="4"/>`);
  if (s >= 2) o.push(`<path d="M100 52 l-6 12 8 0 -6 12" stroke="${c.c2}" stroke-width="3.5" fill="none"/>`);
  if (s >= 4) o.push(`<g stroke="${c.c2}" stroke-width="3" fill="none"><path d="M44 70 l8 10 -6 2 8 10"><animate attributeName="opacity" values="0;1;0" dur="1.3s" repeatCount="indefinite"/></path><path d="M156 70 l-8 10 6 2 -8 10"><animate attributeName="opacity" values="1;0;1" dur="1.3s" repeatCount="indefinite"/></path></g>`);
  if (s >= 5) o.push(crown(100, 54));
  return o.join('');
}
function firebird(s, c) {
  const o = [];
  const tl = 2 + s;
  for (let i = 0; i < tl; i++) { const a = -30 + i * (60 / Math.max(1, tl - 1)); o.push(`<path d="M104 140 C ${130 + i * 6} ${150 + i * 4} ${150 + i * 6} ${170 + i * 2} ${166 + i * 4} ${184 - i * 4}" stroke="${i % 2 ? c.c2 : c.c1}" stroke-width="${8 - i * .6}" fill="none" stroke-linecap="round" transform="rotate(${a * .4} 104 140)"/>`); }
  if (s >= 3) o.push(flame(170, 182, .7, 120), flame(150, 186, .6, 160));
  o.push(wing('l', s - 1, c.c1, c.c2, true), wing('r', s - 1, c.c1, c.c2, true));
  o.push(`<ellipse cx="100" cy="122" rx="30" ry="34" fill="${c.c1}" ${st}/><ellipse cx="98" cy="132" rx="18" ry="20" fill="#fed7aa"/>`);
  o.push(`<circle cx="100" cy="76" r="30" fill="${c.c1}" ${st}/>`);
  if (s >= 2) o.push(`<path d="M92 48 C88 30 98 24 100 36 C104 22 116 30 108 48" fill="${c.c2}" ${st}/>`);
  o.push(eye(88, 74, 7, s >= 4 ? '#7c2d12' : null), eye(112, 74, 7, s >= 4 ? '#7c2d12' : null), `<path d="M94 86 L106 86 L100 96Z" fill="#facc15" ${st}/>`, blush(80, 88), blush(120, 88));
  if (s >= 5) o.push(crown(100, 50, .9));
  return o.join('');
}
const DRAW = { fox, golem, rex, dragon, owl, firebird };

export function eggSVG(kind, progress = 0, { size = 160 } = {}) {
  const c = CREATURES[kind] || CREATURES.fox, u = 'e' + (++N);
  const cracks = Math.floor(progress * 5);
  const crackPaths = ['M58 96 l12 -4 6 8 10 -6 8 6', 'M128 70 l6 12 -8 4 10 10', 'M100 34 l-3 12 6 5 -4 10', 'M120 132 l12 -6 4 10 10 -4', 'M64 140 l10 6 -2 10 10 4'].slice(0, cracks);
  return `<svg class="crt egg" viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="${u}" cx=".38" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="${c.c2}"/><stop offset="1" stop-color="${c.c1}"/></radialGradient></defs>
    <ellipse cx="100" cy="182" rx="46" ry="8" fill="#000" opacity=".3"/>
    <g class="egg-wob"><path d="M100 30 C140 30 158 96 156 124 C154 160 130 178 100 178 C70 178 46 160 44 124 C42 96 60 30 100 30Z" fill="url(#${u})" ${st}/>
    <g fill="${c.c1}" opacity=".55"><circle cx="78" cy="70" r="7"/><circle cx="124" cy="100" r="9"/><circle cx="86" cy="140" r="6"/><circle cx="120" cy="150" r="5"/></g>
    <g stroke="${OL}" stroke-width="2.5" fill="none">${crackPaths.map(d => `<path d="${d}"/>`).join('')}</g>
    ${progress > .6 ? `<ellipse cx="100" cy="104" rx="60" ry="76" fill="${c.c2}" opacity=".18"><animate attributeName="opacity" values=".05;.3;.05" dur="1.6s" repeatCount="indefinite"/></ellipse>` : ''}</g></svg>`;
}
// stage 1..5. silhouette – צללית כהה (לפני הבקיעה)
export function creatureSVG(kind, stage = 1, { size = 160, silhouette = false, mood = '' } = {}) {
  const c = CREATURES[kind] || CREATURES.fox, s = Math.max(1, Math.min(5, stage));
  const sc = [0, .62, .72, .82, .92, 1][s];
  const body = DRAW[kind] ? DRAW[kind](s, c) : '';
  const aura = s >= 4 ? `<circle cx="100" cy="110" r="${s >= 5 ? 92 : 80}" fill="${c.c2}" opacity="${s >= 5 ? .28 : .16}"><animate attributeName="r" values="${s >= 5 ? '84;96;84' : '74;84;74'}" dur="2.6s" repeatCount="indefinite"/></circle>` : '';
  const fly = c.kind === 'fly';
  return `<svg class="crt ${fly ? 'fly' : 'walk'} ${silhouette ? 'sil' : ''} ${mood}" viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    ${silhouette ? '' : aura}${fly ? `<ellipse cx="100" cy="192" rx="${30 * sc}" ry="5" fill="#000" opacity=".25"/>` : `<ellipse cx="100" cy="186" rx="${46 * sc}" ry="7" fill="#000" opacity=".3"/>`}
    <g class="crt-body" transform="translate(100 ${fly ? 190 : 186}) scale(${sc}) translate(-100 ${fly ? -196 : -186})" ${silhouette ? 'filter="brightness(0)"' : ''}>${silhouette ? `<g style="filter:brightness(0) drop-shadow(0 0 4px ${c.c2})">${body}</g>` : body}</g>
    ${s >= 5 && !silhouette ? sparkles('#fde68a') : ''}</svg>`;
}
