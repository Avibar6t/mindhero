// MindHero – הגיבור: ציור, פריטים, כוחות ודרגות

export const STYLES = {
  pixel:    { name: 'לוחם פיקסלים', desc: 'עולם קוביות בסגנון מיינקראפט', suit: '#3b82f6', pants: '#1e3a8a', accent: '#22d3ee' },
  comic:    { name: 'גיבור-על',      desc: 'חליפה, גלימה וכוחות תודעה',    suit: '#2563eb', pants: '#1e3a8a', accent: '#fbbf24' },
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
  wings:    { slot: 'back', tier: 3, name: { pixel: 'כנפי סערה', comic: 'כנפי אור', tactical: 'כנפי פלזמה' }, desc: 'שליטה בשמיים' },
  // נשק
  sword:    { slot: 'weapon', tier: 1, name: { pixel: 'חרב פלדה', comic: 'חרב אנרגיה', tactical: 'להב פלזמה' }, desc: 'חותך כל בעיה' },
  shield:   { slot: 'weapon2', tier: 1, name: { pixel: 'מגן עץ', comic: 'מגן כוכב', tactical: 'מגן אנרגיה' }, desc: 'הגנה מפני מלכודות' },
  staff:    { slot: 'weapon', tier: 2, name: { pixel: 'מטה קסמים', comic: 'מטה תודעה', tactical: 'מוט פריקה' }, desc: 'מרכז אנרגיה מנטלית' },
  blaster:  { slot: 'weapon', tier: 2, name: { pixel: 'קשת', comic: 'רובה פוטונים', tactical: 'רובה לייזר' }, desc: 'מכה מרחוק' },
  hammer:   { slot: 'weapon', tier: 3, name: { pixel: 'פטיש אבן-ברק', comic: 'פטיש הרעם', tactical: 'פטיש כבידה' }, desc: 'עוצמה אדירה' },
  // סמל
  bolt:     { slot: 'emblem', tier: 1, name: { pixel: 'סמל ברק', comic: 'סמל ברק', tactical: 'סמל ברק' }, desc: 'מהירות מחשבה' },
  star:     { slot: 'emblem', tier: 1, name: { pixel: 'סמל כוכב', comic: 'סמל כוכב', tactical: 'סמל כוכב' }, desc: 'אור מוביל' },
  brain:    { slot: 'emblem', tier: 2, name: { pixel: 'סמל מוח', comic: 'סמל מוח', tactical: 'סמל מוח' }, desc: 'כוח החשיבה' },
  eye:      { slot: 'emblem', tier: 3, name: { pixel: 'עין הדרקון', comic: 'העין השלישית', tactical: 'עין הסורק' }, desc: 'רואה את התשובה' },
  // שריון
  silver:   { slot: 'suit', tier: 2, name: { pixel: 'שריון ברזל', comic: 'חליפת כסף', tactical: 'שריון קרמי' }, desc: 'שדרוג לחליפה' },
  gold:     { slot: 'suit', tier: 3, name: { pixel: 'שריון זהב', comic: 'חליפת זהב', tactical: 'שריון נאנו-זהב' }, desc: 'שדרוג מלכותי' },
  cosmic:   { slot: 'suit', tier: 4, name: { pixel: 'שריון אובסידיאן', comic: 'חליפה קוסמית', tactical: 'שריון קוונטי' }, desc: 'השדרוג האגדי' },
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
export { heroSVG } from './heroart.js?v=16';

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
