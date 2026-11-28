// MindHero – כוחות-על לאוסף (אפקטים חזותיים בלבד), הישגים, מטבע הזהב היומי, חנות האגדות וכרטיס שיתוף
import { heroSVG, rankOf } from './hero.js?v=32';
import { heroScene } from './fun.js?v=32';
import { CHAPTERS, CH_ORDER } from './bank.js?v=32';
import { today } from './ui.js?v=32';

// ---------------------------------------------------------------
// כוחות-על לאוסף: לא משנים את המשחק – רק נראים מדהים ומספרים סיפור
// ---------------------------------------------------------------
export const SUPER = {
  lightning: { name: 'ברק מחשבתי',      g: '⚡', c: '#facc15', lore: 'המחשבות שלך מהירות כל כך, שהאוויר סביבך מתחשמל.', how: 'קומבו של 8 תשובות נכונות ברצף', ok: p => (p.records?.bestCombo || 0) >= 8 },
  phoenix:   { name: 'כנפי הפניקס',     g: '🔥', c: '#f97316', lore: 'כמו עוף החול – אתה תמיד חוזר חזק יותר.', how: '7 ימי אימון ברצף', ok: p => (p.bestStreak || 0) >= 7 },
  chess:     { name: 'מוח השחמט',       g: '♞', c: '#e2e8f0', lore: 'אתה רואה עשרה מהלכים קדימה. היריבים עוד לא יודעים שהפסידו.', how: 'ניצחון ב-3 דו-קרבות', ok: p => (p.records?.duelsWon || 0) >= 3 },
  gravity:   { name: 'שליטה בכבידה',    g: '🪐', c: '#a78bfa', lore: 'החוקים של הפיזיקה? הם יותר כמו הצעות בשבילך.', how: 'להגיע לרמה 5', ok: p => (p.level || 1) >= 5 },
  frost:     { name: 'נשימת הקרח',      g: '❄️', c: '#7dd3fc', lore: 'גם כשהשעון לוחץ – אתה נשאר קר כמו קרח.', how: 'להשלים סימולציה (מיני או מלאה)', ok: p => (p.records?.sims || []).length >= 1 },
  shadow:    { name: 'שיבוט צללים',     g: '👥', c: '#64748b', lore: 'לפעמים נדמה שיש שלושה כמוך. אולי באמת יש?', how: 'לנצח את בוס הערב', ok: p => (p.records?.eveWins || 0) >= 1 },
  runes:     { name: 'רונות עתיקות',    g: 'ᚱ', c: '#2dd4bf', lore: 'סימנים עתיקים נדלקים סביבך – סוד הידע של הקדמונים.', how: 'להשלים 5 שיעורים באקדמיה', ok: p => Object.keys(p.academy || {}).length >= 5 },
  music:     { name: 'מנגינת הניצחון',  g: '♫', c: '#f472b6', lore: 'בכל פעם שאתה צודק, נשמעת מוזיקה שרק אתה שומע.', how: 'לשלוח 3 מתנות מצחיקות ליריבים', ok: p => (p.records?.giftsSent || 0) >= 3 },
  blocks:    { name: 'קוביות מרחפות',   g: '🧊', c: '#4ade80', lore: 'העולם נבנה מחדש סביבך, קובייה אחרי קובייה.', how: 'משימה מושלמת – כל התשובות נכונות (8 שאלות ומעלה)', ok: p => (p.records?.perfect || 0) >= 1 },
  timelord:  { name: 'אדון הזמן',       g: '⏳', c: '#fbbf24', lore: 'השניות עוצרות כשאתה חושב. רק אתה זז.', how: 'לענות על 300 שאלות', ok: p => (p.records?.totalQ || 0) >= 300 },
  matrix:    { name: 'ראיית הקוד',      g: '01', c: '#22c55e', lore: 'אתה רואה את הקוד שמאחורי כל חידה.', how: 'לענות על 1,000 שאלות', ok: p => (p.records?.totalQ || 0) >= 1000 },
  rainbow:   { name: 'הילת הקשת',       g: '🌈', c: '#c084fc', lore: 'שישה פרקים, שישה צבעים – ואתה שולט בכולם.', how: 'להגיע לרמה 3 ומעלה בכל ששת פרקי המבחן', ok: p => CH_ORDER.every(c => (p.ch?.[c]?.lvl || 0) >= 3) },
  dragon:    { name: 'רוח הדרקון',      g: '🐉', c: '#ef4444', lore: 'רוח עתיקה בחרה בך. היא לא בוחרת בכל אחד.', how: 'להגיע לרמה 10', ok: p => (p.level || 1) >= 10 },
  galaxy:    { name: 'שליטה בגלקסיה',   g: '🌌', c: '#818cf8', lore: 'הכוח הנדיר מכולם. כוכבים שלמים נעים לפי המחשבות שלך.', how: 'רק בחנות האגדות – 20 מטבעות זהב', ok: () => false, legend: true },
};

// בודק הישגים ופותח כוחות חדשים. מחזיר רשימת כוחות שנפתחו עכשיו
export function checkSupers(p) {
  p.cpowers = p.cpowers || [];
  const fresh = Object.keys(SUPER).filter(k => !SUPER[k].legend && !p.cpowers.includes(k) && SUPER[k].ok(p));
  fresh.forEach(k => p.cpowers.push(k));
  if (fresh.length && !p.fpow) p.fpow = fresh[0];
  return fresh;
}

// אפקט חזותי סביב הגיבור. heroHtml נדרש רק לשיבוט צללים
export function powerFx(id, heroHtml = '') {
  if (!id || !SUPER[id]) return '';
  const c = SUPER[id].c; const n = (k, f) => Array.from({ length: k }, (_, i) => f(i)).join('');
  const inner = {
    lightning: n(3, i => `<svg class="bolt b${i}" viewBox="0 0 30 60"><path d="M18 0 L4 34 H14 L8 60 L28 22 H17 Z" fill="${c}"/></svg>`),
    phoenix: n(9, i => `<i style="--x:${10 + i * 10}%;--d:${(i * .37) % 2}s;--s:${0.7 + (i % 3) * .25}"></i>`),
    chess: `<div class="orb">${['♞', '♜', '♝', '♛', '♚', '♟'].map((g, i) => `<b style="--a:${i * 60}deg">${g}</b>`).join('')}</div>`,
    gravity: n(5, i => `<i style="--x:${8 + i * 21}%;--y:${30 + (i % 3) * 18}%;--d:${i * .5}s"></i>`),
    frost: n(12, i => `<i style="--x:${(i * 37) % 100}%;--d:${(i * .53) % 4}s;--t:${4 + (i % 4)}s">❄</i>`),
    shadow: `<div class="clone l">${heroHtml}</div><div class="clone r">${heroHtml}</div>`,
    runes: n(7, i => `<i style="--x:${8 + i * 14}%;--d:${i * .6}s">${'ᚠᚱᚦᛟᛉᚹᛞ'[i]}</i>`),
    music: n(7, i => `<i style="--x:${10 + i * 13}%;--d:${i * .55}s">${'♪♫♬'[i % 3]}</i>`),
    blocks: n(8, i => `<i style="--x:${6 + i * 12}%;--d:${i * .45}s;--c2:${['#4ade80', '#a16207', '#60a5fa', '#94a3b8'][i % 4]}"></i>`),
    timelord: `<svg class="clock" viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="2 10" opacity=".9"/><circle cx="100" cy="100" r="78" fill="none" stroke="${c}" stroke-width="1.5" opacity=".5"/><path d="M100 100 L100 34" stroke="${c}" stroke-width="4" stroke-linecap="round" class="hand1"/><path d="M100 100 L148 100" stroke="${c}" stroke-width="3" stroke-linecap="round" class="hand2"/></svg>`,
    matrix: n(10, i => `<i style="--x:${i * 10 + 3}%;--d:${(i * .71) % 3}s;--t:${2.5 + (i % 3)}s">${n(6, k => ((i * 7 + k * 3) % 2))}</i>`),
    rainbow: '<div class="halo"></div>',
    dragon: '<div class="ribbon r1"></div><div class="ribbon r2"></div><div class="ribbon r3"></div>',
    galaxy: `<div class="neb"></div>${n(14, i => `<i style="--x:${(i * 41) % 100}%;--y:${(i * 23) % 80}%;--d:${(i * .4) % 3}s"></i>`)}`,
  }[id];
  return `<div class="pfx pfx-${id}" style="--pc:${c}" aria-hidden="true">${inner}</div>`;
}
// כוחות שמציירים "מאחורי" הגיבור
export const FX_BEHIND = new Set(['galaxy', 'rainbow', 'timelord', 'shadow', 'dragon']);
export function heroWithFx(h, opts = {}) {
  const hero = heroSVG(h, opts); const id = h.fpow;
  if (!id) return hero;
  return FX_BEHIND.has(id) ? powerFx(id, hero) + hero : hero + powerFx(id, hero);
}

// ---------------------------------------------------------------
// מטבע הזהב היומי – כל יום מקום אחר
// ---------------------------------------------------------------
export const PLACES = {
  verbal:  { name: 'ספריית המילים האבודות', ch: 'verbal',  g: '📜', desc: 'הספרנית הזקנה החביאה מטבע זהב בין הספרים.' },
  series:  { name: 'מבוך הסדרות',           ch: 'series',  g: '🌀', desc: 'רק מי שמגלה את החוק מוצא את היציאה – ואת המטבע.' },
  analogy: { name: 'גשר הקשרים',            ch: 'analogy', g: '🌉', desc: 'כל קרש בגשר הוא קשר בין מילים. אל תיפול!' },
  logic:   { name: 'מגדל החידות',            ch: 'logic',   g: '🗼', desc: 'בראש המגדל מחכה מטבע. כל קומה – חידה.' },
  math:    { name: 'מכרה המספרים',          ch: 'math',    g: '⛏️', desc: 'חופרים עמוק – ובסוף מוצאים זהב.' },
  shapes:  { name: 'מקדש הצורות',           ch: 'shapes',  g: '🔷', desc: 'הדלתות במקדש נפתחות רק למי שרואה את התבנית.' },
  blitz:   { name: 'מסלול הבזק',            ch: null,      g: '⚡', desc: '8 שאלות מכל הפרקים – ו-5 דקות בלבד על השעון.', timed: 300 },
};
const hash = s => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const dayShift = k => { const d = new Date(); d.setDate(d.getDate() + k); return today(d); };
export function goldQuest(p) {
  const t = today();
  if (p.goldQ?.date === t) return p.goldQ;
  const keys = Object.keys(PLACES);
  const avoid = new Set([p.goldQ?.place, p.goldLast].filter(Boolean));
  let i = hash(t) % keys.length; while (avoid.has(keys[i])) i = (i + 1) % keys.length;
  p.goldQ = { date: t, place: keys[i], done: false, tries: 0 };
  return p.goldQ;
}
export const GOLD_NEED = 5; // מתוך 8

// ---------------------------------------------------------------
// חנות האגדות (מטבעות זהב)
// ---------------------------------------------------------------
export const LEGEND_WEAPON = { pixel: 'pickaxe', comic: 'scepter', tactical: 'qblade' };
export function legendShop(p) {
  const w = LEGEND_WEAPON[p.style] || 'scepter';
  return [
    { id: 'w', kind: 'item', item: w, price: 10, rar: 'אגדי' },
    { id: 'bg', kind: 'bg', bg: 'goldpalace', price: 15, rar: 'אגדי' },
    { id: 'pw', kind: 'power', power: 'galaxy', price: 20, rar: 'מיתולוגי' },
  ];
}
export const goldCoinSVG = (s = 22) => `<svg class="gcoin" width="${s}" height="${s}" viewBox="0 0 40 40" aria-hidden="true"><defs><radialGradient id="gcg" cx=".35" cy=".3"><stop offset="0" stop-color="#fff7c2"/><stop offset=".45" stop-color="#fbbf24"/><stop offset="1" stop-color="#b45309"/></radialGradient></defs><circle cx="20" cy="20" r="18" fill="url(#gcg)" stroke="#78350f" stroke-width="2"/><circle cx="20" cy="20" r="12.5" fill="none" stroke="#fef3c7" stroke-width="1.6" opacity=".8"/><path d="M20 11 l2.6 5.4 5.9.9 -4.3 4.1 1 5.8 -5.2-2.8 -5.2 2.8 1-5.8 -4.3-4.1 5.9-.9z" fill="#fef3c7" opacity=".95"/></svg>`;

// ---------------------------------------------------------------
// כרטיס שיתוף – תמונת PNG של הגיבור עם ההישג
// ---------------------------------------------------------------
const svgToImg = (svg, w, h) => new Promise((res, rej) => {
  let s = svg.replace(/<svg\b/, `<svg width="${w}" height="${h}"`);
  if (!/xmlns=/.test(s.slice(0, 300))) s = s.replace(/<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
  const img = new Image(); img.onload = () => res(img); img.onerror = rej;
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
});
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
export async function makeShareCard(p, { headline, sub = '', chips = [] }) {
  const W = 1080, H = 1350; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
  try { await Promise.all(['700 80px Fredoka', '700 40px Assistant', '600 34px Assistant'].map(f => document.fonts.load(f, 'אבגMH'))); } catch {}
  ctx.fillStyle = '#0e1630'; ctx.fillRect(0, 0, W, H);
  try { const bg = await svgToImg(heroScene(p), W, 880); ctx.drawImage(bg, 0, 120, W, 880); } catch {}
  const grd = ctx.createLinearGradient(0, 120, 0, 1000); grd.addColorStop(0, '#0e1630'); grd.addColorStop(.18, '#0e163000'); grd.addColorStop(.75, '#0e163000'); grd.addColorStop(1, '#0e1630'); ctx.fillStyle = grd; ctx.fillRect(0, 100, W, 920);
  // הילה של הכוח המוצג
  const pc = SUPER[p.fpow]?.c || '#3ee6d2';
  const hal = ctx.createRadialGradient(W / 2, 620, 30, W / 2, 620, 380); hal.addColorStop(0, pc + '88'); hal.addColorStop(1, pc + '00'); ctx.fillStyle = hal; ctx.fillRect(0, 200, W, 820);
  try { const hw = p.style === 'pixel' ? 470 : 520, hh = p.style === 'pixel' ? Math.round(470 * 296 / 200) : 676; const hero = await svgToImg(heroSVG(p), hw, hh); ctx.drawImage(hero, (W - hw) / 2, 975 - hh, hw, hh); } catch {}
  // לוגו
  ctx.direction = 'ltr'; ctx.textAlign = 'left'; ctx.font = '700 64px Fredoka, sans-serif';
  ctx.fillStyle = '#3ee6d2'; ctx.fillText('Mind', 60, 100); const mw = ctx.measureText('Mind').width; ctx.fillStyle = '#ffb547'; ctx.fillText('Hero', 60 + mw, 100);
  ctx.direction = 'rtl'; ctx.textAlign = 'right'; ctx.font = '700 40px Assistant, sans-serif'; ctx.fillStyle = '#cdd5f3'; ctx.fillText(`${p.name} · רמה ${p.level} · ${rankOf(p.level)}`, W - 60, 96);
  // כותרת
  ctx.textAlign = 'center'; ctx.font = '700 76px Fredoka, Assistant, sans-serif'; ctx.fillStyle = '#ffb547';
  ctx.shadowColor = '#000a'; ctx.shadowBlur = 18; ctx.fillText(headline, W / 2, 1075); ctx.shadowBlur = 0;
  if (sub) { ctx.font = '600 40px Assistant, sans-serif'; ctx.fillStyle = '#eef2ff'; ctx.fillText(sub, W / 2, 1135); }
  // צ'יפים
  const cs = chips.slice(0, 3); const cw = 300, gap = 24, total = cs.length * cw + (cs.length - 1) * gap; let x = (W + total) / 2 - cw;
  ctx.font = '700 36px Assistant, sans-serif';
  cs.forEach(t => { rr(ctx, x, 1175, cw, 84, 42); ctx.fillStyle = '#1b2656'; ctx.fill(); ctx.strokeStyle = '#3ee6d266'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#eef2ff'; ctx.textAlign = 'center'; ctx.fillText(t, x + cw / 2, 1230); x -= cw + gap; });
  ctx.font = '600 28px Assistant, sans-serif'; ctx.fillStyle = '#7c87b8'; ctx.fillText('מתאמן לקראת מבחן המחוננים 💪', W / 2, 1318);
  return new Promise(r => cv.toBlob(r, 'image/png'));
}
export async function shareHero(p, card, text) {
  const blob = await makeShareCard(p, card);
  const file = new File([blob], `MindHero-${p.name}.png`, { type: 'image/png' });
  const touch = matchMedia('(pointer: coarse)').matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], text }); return 'shared'; } catch (e) { if (e.name === 'AbortError') return 'cancel'; }
  }
  // במחשב: מורידים את התמונה ופותחים ווטסאפ עם הטקסט – מצרפים את התמונה מהתיקייה
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  return 'download';
}
