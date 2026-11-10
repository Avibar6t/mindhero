// MindHero – מחוללי שאלות (סדרות, חשבון, צורות) – אינסוף תרגול, כל שאלה עם רמזים והסבר

export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const uid = (r, p) => p + Math.floor(r() * 1e9).toString(36);

function numOptions(r, ans, near) {
  const set = new Set([ans]);
  const cands = [ans + 1, ans - 1, ans + 2, ans - 2, ans + near, ans - near, ans * 2, Math.round(ans / 2), ans + 10, ans - 10].filter(x => x !== ans && x >= 0);
  while (set.size < 4 && cands.length) set.add(cands.splice(Math.floor(r() * cands.length), 1)[0]);
  let k = 3; while (set.size < 4) set.add(ans + k++);
  const opts = [...set].map(String);
  return { opts, ans: 0 };
}

// ---------- סדרות ----------
const HEB = 'אבגדהוזחטיכלמנסעפצקרשת'.split('');
const SERIES_H1 = 'בדקו מה ההפרש בין כל שני מספרים צמודים. אם ההפרשים לא קבועים – בדקו את ההפרשים בין ההפרשים, או אם יש כפל.';

export function genSeries(diff, seed) {
  const r = rng(seed);
  let terms, ans, h2, exp, kind;
  const n = 6;
  const types = {
    1: ['arith', 'arith', 'letters'],
    2: ['arith', 'arithDown', 'geo2', 'letters'],
    3: ['incDiff', 'alt', 'geo3', 'interleave'],
    4: ['linMul', 'fib', 'squares', 'interleave', 'incDiff2'],
    5: ['diffGeo', 'interMix', 'linMul', 'cubes', 'lettersInc'],
  }[Math.max(1, Math.min(5, diff))];
  kind = pick(r, types);
  if (kind === 'letters' || kind === 'lettersInc') {
    const step = kind === 'letters' ? ri(r, 2, 3) : 1;
    const start = ri(r, 0, 4);
    const idx = []; let c = start, s = step;
    for (let i = 0; i < 6; i++) { idx.push(c); c += s; if (kind === 'lettersInc') s++; }
    if (idx[5] >= HEB.length) return genSeries(diff, seed + 7);
    const L = idx.map(i => HEB[i]);
    const shown = L.slice(0, 5); ans = L[5];
    const alts = new Set([ans]); [idx[5] - 1, idx[5] + 1, idx[5] - 2, idx[5] + 2].forEach(i => { if (i >= 0 && i < HEB.length) alts.add(HEB[i]); });
    const opts = [...alts].slice(0, 4);
    return {
      id: uid(r, 's'), ch: 'series', diff, type: 'mc', gen: true,
      q: `איזו אות ממשיכה את הסדרה?<div class="series">${shown.join(' , ')} , ?</div>`,
      opts, ans: 0,
      hints: ['חשבו על המקום של כל אות באלף-בית: א=1, ב=2, ג=3...', kind === 'letters' ? `בין כל שתי אותיות צמודות מדלגים על ${step - 1} ${step - 1 === 1 ? 'אות' : 'אותיות'}.` : 'הדילוג גדל בכל פעם באחד.'],
      exp: kind === 'letters' ? `כל אות מתקדמת ${step} מקומות באלף-בית, ולכן אחרי ${shown[4]} מגיעה ${ans}.` : `הקפיצות גדלות: 1, 2, 3, 4, 5 מקומות. אחרי ${shown[4]} קופצים 5 מקומות ומגיעים ל-${ans}.`,
    };
  }
  const t = [];
  if (kind === 'arith' || kind === 'arithDown') {
    const d = (kind === 'arith' ? 1 : -1) * ri(r, 2, diff === 1 ? 6 : 13);
    let a = kind === 'arith' ? ri(r, 1, 30) : ri(r, 60, 120);
    for (let i = 0; i < n; i++) { t.push(a); a += d; }
    h2 = `ההפרש בין כל שני מספרים צמודים הוא ${d > 0 ? '+' : ''}${d}.`; exp = `בכל צעד ${d > 0 ? 'מוסיפים' : 'מחסירים'} ${Math.abs(d)}.`;
  } else if (kind === 'geo2' || kind === 'geo3') {
    const m = kind === 'geo2' ? 2 : 3; let a = ri(r, 1, kind === 'geo2' ? 6 : 3);
    for (let i = 0; i < n; i++) { t.push(a); a *= m; }
    h2 = `ההפרשים גדלים מהר מדי – נסו לחלק כל מספר בקודם לו.`; exp = `כל מספר גדול פי ${m} מהקודם.`;
  } else if (kind === 'incDiff' || kind === 'incDiff2') {
    let a = ri(r, 1, 20), d = ri(r, 1, 4); const inc = kind === 'incDiff' ? 1 : ri(r, 2, 3);
    for (let i = 0; i < n; i++) { t.push(a); a += d; d += inc; }
    h2 = `ההפרשים בין המספרים גדלים בכל פעם ב-${inc}.`; exp = `ההפרשים הם ${t.slice(1).map((x, i) => '+' + (x - t[i])).join(', ')} – כל הפרש גדול ב-${inc} מקודמו.`;
  } else if (kind === 'alt') {
    const p = ri(r, 3, 9), q = ri(r, 1, p - 1); let a = ri(r, 5, 30);
    for (let i = 0; i < n; i++) { t.push(a); a += i % 2 === 0 ? p : -q; }
    h2 = `יש שני הפרשים שמתחלפים לסירוגין: +${p} ואז −${q}.`; exp = `החוק: +${p}, −${q}, +${p}, −${q}...`;
  } else if (kind === 'interleave' || kind === 'interMix') {
    let a = ri(r, 1, 10), b = ri(r, 20, 40); const da = ri(r, 2, 5), db = ri(r, 2, 6);
    const mul = kind === 'interMix';
    for (let i = 0; i < 7; i++) { if (i % 2 === 0) { t.push(a); a = mul ? a * 2 : a + da; } else { t.push(b); b -= db; } }
    h2 = 'הסתכלו בנפרד על המספרים במקומות 1, 3, 5... ועל המספרים במקומות 2, 4, 6...';
    exp = `אלה שתי סדרות משולבות: במקומות האי-זוגיים ${mul ? 'כל מספר כפול מהקודם' : '+' + da} ובמקומות הזוגיים −${db}.`;
  } else if (kind === 'linMul') {
    const m = 2, c = pick(r, [1, -1, 2, 3]); let a = ri(r, 1, 5);
    for (let i = 0; i < n; i++) { t.push(a); a = a * m + c; }
    h2 = `נסו: כל מספר כפול 2 ועוד/פחות מספר קטן קבוע.`; exp = `החוק: כופלים ב-2 ו${c > 0 ? 'מוסיפים ' + c : 'מחסירים ' + (-c)}.`;
  } else if (kind === 'fib') {
    let a = ri(r, 1, 4), b = ri(r, 2, 6);
    for (let i = 0; i < n; i++) { t.push(a); [a, b] = [b, a + b]; }
    h2 = 'נסו לחבר שני מספרים צמודים ולהשוות לבא אחריהם.'; exp = 'כל מספר הוא סכום שני המספרים שלפניו.';
  } else if (kind === 'squares') {
    const c = ri(r, 0, 3), s = ri(r, 1, 3);
    for (let i = 0; i < n; i++) t.push((s + i) * (s + i) + c);
    h2 = `ההפרשים הם מספרים אי-זוגיים עוקבים. חשבו על מספרים בריבוע: 1, 4, 9, 16...`; exp = `המספרים הם ריבועים (${s}², ${s + 1}², ...)${c ? ' ועוד ' + c : ''}.`;
  } else if (kind === 'diffGeo') {
    let a = ri(r, 1, 10), d = ri(r, 1, 3);
    for (let i = 0; i < n; i++) { t.push(a); a += d; d *= 2; }
    h2 = 'ההפרשים בין המספרים מכפילים את עצמם בכל צעד.'; exp = `ההפרשים: ${t.slice(1).map((x, i) => x - t[i]).join(', ')} – כל הפרש כפול מקודמו.`;
  } else if (kind === 'cubes') {
    const s = ri(r, 1, 2); for (let i = 0; i < n; i++) t.push((s + i) ** 3);
    h2 = 'חשבו על מספר כפול עצמו כפול עצמו: 1×1×1, 2×2×2...'; exp = `אלה מספרים בחזקת 3: ${s}³, ${s + 1}³, ...`;
  }
  // לפעמים חסר איבר באמצע
  let missing = t.length - 1;
  if (diff >= 4 && r() < 0.35 && !['interleave', 'interMix'].includes(kind)) missing = ri(r, 2, t.length - 2);
  ans = t[missing];
  const shown = t.map((x, i) => i === missing ? '?' : x);
  const useInput = diff >= 3 && r() < 0.6;
  const q = `מה המספר שצריך לבוא במקום סימן השאלה?<div class="series" dir="ltr">${shown.join(' , ')}</div>`;
  const base = { id: uid(r, 's'), ch: 'series', diff, gen: true, q, hints: [SERIES_H1, h2], exp: exp + ` לכן התשובה: ${ans}.` };
  if (useInput) return { ...base, type: 'input', answer: String(ans), q: q + '<small>הקלידו את התשובה</small>' };
  const { opts } = numOptions(r, ans, Math.max(3, Math.abs(t[1] - t[0])));
  return { ...base, type: 'mc', opts, ans: 0 };
}

// ---------- חשבון ----------
const OPS = [
  { f: (a, b) => 2 * a - b, s: 'a ★ b = 2a − b', w: (a, b) => `2×${a} − ${b}` },
  { f: (a, b) => a * b + a, s: 'a ★ b = a × b + a', w: (a, b) => `${a}×${b} + ${a}` },
  { f: (a, b) => a * a - b, s: 'a ★ b = a² − b', w: (a, b) => `${a}² − ${b}` },
  { f: (a, b) => a + b * 3, s: 'a ★ b = a + 3b', w: (a, b) => `${a} + 3×${b}` },
  { f: (a, b) => (a + b) * 2, s: 'a ★ b = 2 × (a + b)', w: (a, b) => `2×(${a}+${b})` },
  { f: (a, b) => a * b - a - b, s: 'a ★ b = a × b − a − b', w: (a, b) => `${a}×${b} − ${a} − ${b}` },
];

export const KIND_TOPIC = { percent: 'percent', percentBack: 'percent', avg: 'avg', avgAdd: 'avg', speed: 'speed' };
export function genMath(diff, seed, learned) {
  const r = rng(seed);
  let kinds = diff <= 2 ? ['op', 'percent', 'avg', 'speed'] : ['op', 'opNest', 'percentBack', 'avgAdd', 'work', 'speed'];
  if (learned) kinds = kinds.filter(k => !KIND_TOPIC[k] || learned[KIND_TOPIC[k]]);
  const kind = pick(r, kinds);
  let q, ans, h1, h2, exp;
  if (kind === 'op' || kind === 'opNest') {
    const op = pick(r, OPS);
    if (kind === 'op') {
      const a = ri(r, 2, 7), b = ri(r, 1, 6); ans = op.f(a, b);
      q = `נגדיר פעולה חדשה (הסימן ★ הומצא לשאלה): <b class="ltr">${op.s}</b><br>חשבו: <b class="ltr">${a} ★ ${b}</b>`;
      h1 = 'הציבו את המספר הראשון במקום a ואת השני במקום b.'; h2 = `${a} ★ ${b} = ${op.w(a, b)}`; exp = `${op.w(a, b)} = ${ans}.`;
    } else {
      const a = ri(r, 1, 5), b = ri(r, 1, 4), c = ri(r, 1, 4); const inner = op.f(b, c); ans = op.f(a, inner);
      if (Math.abs(ans) > 200) return genMath(diff, seed + 3, learned);
      q = `נגדיר פעולה חדשה (הסימן ★ הומצא לשאלה): <b class="ltr">${op.s}</b><br>חשבו: <b class="ltr">${a} ★ (${b} ★ ${c})</b>`;
      h1 = 'מתחילים תמיד מהסוגריים.'; h2 = `${b} ★ ${c} = ${op.w(b, c)} = ${inner}. עכשיו חשבו ${a} ★ ${inner}.`;
      exp = `בסוגריים: ${b} ★ ${c} = ${inner}. אחר כך ${a} ★ ${inner} = ${op.w(a, inner)} = ${ans}.`;
    }
  } else if (kind === 'percent') {
    const p = pick(r, [40, 60, 80, 120, 200, 160]), d = pick(r, [10, 20, 25, 50]);
    ans = p - p * d / 100;
    q = `משחק מחשב עולה ${p} ₪ ויש עליו הנחה של ${d}%. כמה יעלה המשחק אחרי ההנחה (בשקלים)?`;
    h1 = `כמה זה ${d}% מ-${p}? (10% = חלקי 10)`; h2 = `${d}% מ-${p} הם ${p * d / 100} ₪.`; exp = `ההנחה: ${p * d / 100} ₪. ${p} − ${p * d / 100} = ${ans}.`;
  } else if (kind === 'percentBack') {
    const orig = pick(r, [40, 60, 80, 120, 200, 160]), d = pick(r, [20, 25, 50]); const now = orig * (100 - d) / 100; ans = orig;
    q = `אחרי הנחה של ${d}%, אוזניות עולות ${now} ₪. מה היה המחיר <b>לפני</b> ההנחה?`;
    h1 = `אחרי הנחה של ${d}% נשארים ${100 - d}% מהמחיר המקורי.`; h2 = `${now} ₪ = ${100 - d}% מהמחיר. כמה זה 1%? כמה 100%?`;
    exp = `${now} הם ${100 - d}% מהמחיר, ולכן המחיר המקורי ${now} ÷ ${(100 - d) / 100} = ${ans}.`;
  } else if (kind === 'avg') {
    const nums = [ri(r, 2, 20), ri(r, 2, 20), ri(r, 2, 20)]; const s = nums[0] + nums[1] + nums[2];
    const fix = (3 - (s % 3)) % 3; nums[2] += fix; const sum = s + fix; ans = sum / 3;
    q = `מה הממוצע של המספרים ${nums.join(', ')}?`;
    h1 = 'ממוצע = הסכום חלקי כמות המספרים.'; h2 = `הסכום הוא ${sum}.`; exp = `${sum} ÷ 3 = ${ans}.`;
  } else if (kind === 'avgAdd') {
    const k = ri(r, 3, 5), A = ri(r, 6, 15), B = A + ri(r, 1, 4); ans = B * (k + 1) - A * k;
    q = `הממוצע של ${k} מספרים הוא ${A}. הוסיפו עוד מספר אחד, והממוצע עלה ל-${B}. מה המספר שהוסיפו?`;
    h1 = 'סכום = ממוצע × כמות. חשבו את הסכום לפני ואחרי.'; h2 = `לפני: ${k}×${A} = ${A * k}. אחרי: ${k + 1}×${B} = ${B * (k + 1)}.`;
    exp = `${B * (k + 1)} − ${A * k} = ${ans}.`;
  } else if (kind === 'work') {
    const w = ri(r, 2, 6), t = pick(r, [6, 8, 10, 12, 15, 18, 20, 24]); const total = w * t;
    const opts = [2, 3, 4, 5, 6, 8, 10, 12].filter(x => x !== w && total % x === 0); const w2 = pick(r, opts); ans = total / w2;
    q = `${w} פועלים בונים קיר ב-${t} שעות. בכמה שעות יבנו את אותו קיר ${w2} פועלים (באותו קצב)?`;
    h1 = 'יותר פועלים – פחות זמן. כמה שעות היה לוקח לפועל אחד לבד?'; h2 = `פועל אחד: ${w} × ${t} = ${total} שעות.`;
    exp = `פועל אחד היה בונה ב-${total} שעות, ולכן ${w2} פועלים: ${total} ÷ ${w2} = ${ans}.`;
  } else {
    const v = pick(r, [40, 50, 60, 80, 90]), h = ri(r, 2, 5); ans = v * h;
    q = `מכונית נוסעת במהירות קבועה של ${v} קמ"ש. כמה קילומטרים תעבור ב-${h} שעות?`;
    h1 = 'מהירות של X קמ"ש אומרת: בכל שעה עוברים X קילומטרים.'; h2 = `${v} ק"מ בכל שעה, ${h} שעות.`; exp = `${v} × ${h} = ${ans}.`;
  }
  const base = { id: uid(r, 'm'), ch: 'math', diff, gen: true, q, hints: [h1, h2], exp: exp };
  if (r() < 0.55) return { ...base, type: 'input', answer: String(ans), q: q + '<small>הקלידו את התשובה</small>' };
  const { opts } = numOptions(r, ans, 5);
  return { ...base, type: 'mc', opts, ans: 0 };
}

// ---------- צורות ----------
export const SHAPES = ['circle', 'square', 'triangle', 'star', 'diamond', 'hexagon'];
export const SHAPE_HE = { circle: 'עיגול', square: 'ריבוע', triangle: 'משולש', star: 'כוכב', diamond: 'מעוין', hexagon: 'משושה' };
export const COLORS = ['#ffd600', '#e91e63', '#00bcd4', '#7c4dff', '#4caf50'];
export const COLOR_HE = { '#ffd600': 'צהוב', '#e91e63': 'ורוד', '#00bcd4': 'תכלת', '#7c4dff': 'סגול', '#4caf50': 'ירוק' };

// כל תכונה: 'const' | 'row' (נקבע לפי שורה) | 'col' (לפי עמודה) | 'latin' (שלושה ערכים שונים בכל שורה ועמודה) | 'prog' (התקדמות לאורך השורה)
export function genShapes(diff, seed) {
  const r = rng(seed);
  const shapes = shuffle(r, SHAPES).slice(0, 3), colors = shuffle(r, COLORS).slice(0, 3);
  const plans = {
    1: [{ shape: 'row', color: 'row', count: 'prog', rot: 'const', fill: 'const' }, { shape: 'col', color: 'row', count: 'const', rot: 'const', fill: 'const' }],
    2: [{ shape: 'row', color: 'col', count: 'const', rot: 'const', fill: 'const' }, { shape: 'latin', color: 'row', count: 'const', rot: 'const', fill: 'const' }],
    3: [{ shape: 'latin', color: 'col', count: 'const', rot: 'const', fill: 'const' }, { shape: 'row', color: 'latin', count: 'prog', rot: 'const', fill: 'const' }],
    4: [{ shape: 'latin', color: 'latin2', count: 'const', rot: 'const', fill: 'col' }, { shape: 'col', color: 'latin', count: 'latin2', rot: 'const', fill: 'const' }],
    5: [{ shape: 'latin', color: 'latin2', count: 'prog', rot: 'const', fill: 'row' }, { shape: 'latin2', color: 'row', count: 'latin', rot: 'prog', fill: 'const' }],
  }[Math.max(1, Math.min(5, diff))];
  const plan = pick(r, plans);
  const vals = { shape: shapes, color: colors, count: [1, 2, 3], rot: [0, 45, 90], fill: [true, false, true] };
  const constV = { shape: shapes[0], color: colors[0], count: 1, rot: 0, fill: true };
  const at = (attr, row, col) => {
    const m = plan[attr], v = vals[attr];
    if (m === 'const') return constV[attr];
    if (m === 'row') return v[row];
    if (m === 'col' || m === 'prog') return v[col];
    if (m === 'latin') return v[(row + col) % 3];
    if (m === 'latin2') return v[(row + 2 * col) % 3];
  };
  const cells = [];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++)
    cells.push({ shape: at('shape', row, col), color: at('color', row, col), count: at('count', row, col), rot: at('rot', row, col), fill: at('fill', row, col) });
  const answer = cells[8];
  // מסיחים: כל אחד משנה תכונה אחת שמשתנה במטריצה
  const varying = Object.keys(plan).filter(k => plan[k] !== 'const');
  const distract = [];
  const tryAdd = c => { if (!distract.some(d => same(d, c)) && !same(c, answer)) distract.push(c); };
  let guard = 0;
  while (distract.length < 3 && guard++ < 60) {
    const k = pick(r, guard < 30 ? varying : ['shape', 'color', 'count']);
    const pool = k === 'shape' ? SHAPES : k === 'color' ? COLORS : vals[k];
    tryAdd({ ...answer, [k]: pick(r, pool) });
  }
  const opts = [answer, ...distract];
  const nm = { shape: 'סוג הצורה', color: 'הצבע', count: 'מספר הצורות', rot: 'הסיבוב', fill: 'המילוי (מלא/ריק)' };
  const desc = varying.map(k => {
    const m = plan[k];
    return m === 'row' ? `${nm[k]} קבוע בכל שורה` : (m === 'col') ? `${nm[k]} נקבע לפי העמודה` : m === 'prog' ? `${nm[k]} משתנה בהדרגה לאורך השורה` : `בכל שורה ובכל עמודה מופיעים שלושה ערכים שונים של ${nm[k]}`;
  });
  return {
    id: uid(r, 'h'), ch: 'shapes', diff, gen: true, type: 'shape',
    q: 'איזו צורה צריכה להופיע במקום סימן השאלה?',
    cells: cells.slice(0, 8), opts, ans: 0,
    hints: ['בדקו תכונה אחת בכל פעם: סוג הצורה, צבע, כמות, סיבוב, מלא/ריק. מה קורה לאורך כל שורה? ולאורך כל עמודה?', 'רמז: ' + desc[0] + '.'],
    exp: 'החוקיות: ' + desc.join('; ') + '. לכן בתא החסר: ' + `${answer.count > 1 ? answer.count + ' ' : ''}${SHAPE_HE[answer.shape]} ${COLOR_HE[answer.color]}${answer.fill ? '' : ' (ריק)'}.`,
  };
}
const same = (a, b) => a.shape === b.shape && a.color === b.color && a.count === b.count && a.rot === b.rot && a.fill === b.fill;
function shuffle(r, a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function shapePath(s, x, y, sz) {
  const h = sz / 2;
  switch (s) {
    case 'circle': return `<circle cx="${x}" cy="${y}" r="${h}"/>`;
    case 'square': return `<rect x="${x - h * .9}" y="${y - h * .9}" width="${sz * .9}" height="${sz * .9}"/>`;
    case 'triangle': return `<polygon points="${x},${y - h} ${x + h},${y + h * .8} ${x - h},${y + h * .8}"/>`;
    case 'diamond': return `<polygon points="${x},${y - h} ${x + h * .75},${y} ${x},${y + h} ${x - h * .75},${y}"/>`;
    case 'hexagon': { const p = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i; p.push(`${x + h * Math.cos(a)},${y + h * Math.sin(a)}`); } return `<polygon points="${p.join(' ')}"/>`; }
    case 'star': { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + Math.PI / 5 * i, rr = i % 2 ? h * .45 : h; p.push(`${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`); } return `<polygon points="${p.join(' ')}"/>`; }
  }
}
export function cellSVG(c, size = 80) {
  if (!c) return `<svg viewBox="0 0 80 80" width="${size}" height="${size}"><text x="40" y="54" text-anchor="middle" font-size="40" fill="#999">?</text></svg>`;
  const sz = c.count === 1 ? 40 : c.count === 2 ? 28 : 22;
  const pos = c.count === 1 ? [[40, 40]] : c.count === 2 ? [[24, 40], [56, 40]] : [[16, 40], [40, 40], [64, 40]];
  const body = pos.map(([x, y]) => `<g transform="rotate(${c.rot} ${x} ${y})">${shapePath(c.shape, x, y, sz)}</g>`).join('');
  const st = c.fill ? `fill="${c.color}" stroke="${c.color}"` : `fill="none" stroke="${c.color}" stroke-width="3.5"`;
  return `<svg viewBox="0 0 80 80" width="${size}" height="${size}"><g ${st}>${body}</g></svg>`;
}

export function generate(ch, diff, seed, learned) {
  if (ch === 'series') return genSeries(diff, seed);
  if (ch === 'math') return genMath(diff, seed, learned);
  if (ch === 'shapes') return genShapes(diff, seed);
}
