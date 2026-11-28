// MindHero – מבחני בית הספר (כיתה ו'): מחוללי שאלות לגיאומטריה (מנסרות) ולשברים (כפל וחילוק)
// כל שאלה: { id, sig, topic, diff, type: 'mc'|'num'|'frac', q, opts?, ans?, answer?, rule, steps, tip, hint }

let SEED = 1;
export function srand(s) { SEED = (s >>> 0) || 1; }
const rnd = () => { SEED ^= SEED << 13; SEED >>>= 0; SEED ^= SEED >> 17; SEED ^= SEED << 5; SEED >>>= 0; return SEED / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = a => a[Math.floor(rnd() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const uid = p => p + Math.floor(rnd() * 1e9).toString(36);

// =================== שברים: עזרים ===================
export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export const simp = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
// ייצוג HTML של שבר / מספר מעורב (תמיד LTR)
export const F = (n, d) => `<span class="fr"><i>${n}</i><i>${d}</i></span>`;
export const M = (w, n, d) => n === 0 ? `${w}` : w ? `<span class="mixd">${w}${F(n, d)}</span>` : F(n, d);
export const X = s => `<span class="mx" dir="ltr">${s}</span>`;
export function mixed(n, d) { [n, d] = simp(n, d); const w = Math.floor(n / d), r = n - w * d; return { w, n: r, d }; }
export const showVal = (n, d) => { const m = mixed(n, d); return M(m.w, m.n, m.d); };
const toMixedStep = (n, d) => { const [a, b] = simp(n, d); if (a < b) return a !== n ? `מצמצמים: ${F(n, d)} = ${F(a, b)}` : ''; const w = Math.floor(a / b), r = a % b; return `${a !== n ? `מצמצמים: ${F(n, d)} = ${F(a, b)}. ` : ''}${r ? `הופכים למספר מעורב: ${a} : ${b} = ${w} ושארית ${r}, כלומר ${M(w, r, b)}` : `${a} : ${b} = ${w}`}`; };
const NAMES = ['נועה', 'יואב', 'מאיה', 'איתי', 'שירה', 'עומר', 'ליה', 'גיא'];

function fracQ(topic, diff, q, num, den, extra) {
  const [n, d] = simp(num, den);
  return { id: uid('f'), topic, diff, type: 'frac', q, answer: { n, d }, sig: `${topic}|${q.replace(/<[^>]+>/g, '')}`, ...extra };
}
function mcQ(topic, diff, q, right, wrongs, extra) {
  const opts = [right, ...wrongs.filter((w, i, a) => w !== right && a.indexOf(w) === i)].slice(0, 4);
  return { id: uid('m'), topic, diff, type: 'mc', q, opts, ans: 0, sig: `${topic}|${q.replace(/<[^>]+>/g, '')}|${right.replace(/<[^>]+>/g, '')}`, ...extra };
}
function numQ(topic, diff, q, answer, extra) { return { id: uid('n'), topic, diff, type: 'num', q, answer, sig: `${topic}|${q.replace(/<[^>]+>/g, '')}`, ...extra }; }

// מסיחים מספריים לשברים (כתווית HTML)
function fracDistractors(n, d, alts) { return alts.filter(([a, b]) => b > 0 && a >= 0 && a * d !== n * b).map(([a, b]) => showVal(a, b)); }

// ---------- 1. כפל שלם בשבר ----------
function genWxF(diff) {
  const kind = diff === 1 ? pick(['basic', 'basic', 'of', 'concept']) : diff === 2 ? pick(['basic', 'word', 'of', 'swap']) : pick(['basic', 'word', 'of', 'big']);
  const d = ri(3, diff === 1 ? 8 : 12), n = ri(1, d - 1), a = ri(2, diff === 1 ? 6 : 9);
  const base = { rule: 'כופלים את השלם <b>במונה</b>, והמכנה נשאר אותו דבר. אחר כך מצמצמים, ואם המונה גדול מהמכנה – הופכים למספר מעורב.', tip: 'כפל בשבר הוא כמו חיבור חוזר: 3 × ⅖ = ⅖ + ⅖ + ⅖.' };
  const steps = (a, n, d) => [`כופלים את השלם במונה: ${X(`${a} × ${n} = ${a * n}`)}. המכנה נשאר ${d}: ${X(F(a * n, d))}.`, toMixedStep(a * n, d) || 'התוצאה כבר מצומצמת.', `התשובה: ${X(showVal(a * n, d))}.`].filter(Boolean);
  if (kind === 'concept') {
    return mcQ('wxf', diff, `בלי לחשב: התוצאה של ${X(`${a} × ${F(n, d)}`)} היא…`, `קטנה מ-${a}`, [`גדולה מ-${a}`, `שווה ל-${a}`, `קטנה מ-${F(n, d)}`], { ...base, hint: `כמה זה ${a} פעמים משהו שקטן מ-1?`, steps: [`${F(n, d)} קטן מ-1 (המונה קטן מהמכנה).`, `לקחת ${a} פעמים משהו שקטן מ-1 נותן פחות מ-${a}.`, `ליתר ביטחון: ${X(`${a} × ${F(n, d)} = ${showVal(a * n, d)}`)}.`], tip: 'כפל בשבר שקטן מ-1 תמיד מקטין את המספר. זו בדיקה מהירה לכל תשובה!' });
  }
  if (kind === 'of') {
    const k = ri(2, diff === 1 ? 5 : 9), whole = d * k;
    return numQ('wxf', diff, `כמה זה ${X(F(n, d))} מ-${whole}?`, n * k, { ...base, hint: `קודם מוצאים ${F(1, d)} מ-${whole}: מחלקים ב-${d}.`, rule: '<b>"שבר מ..." = כפל.</b> מחלקים במכנה (מוצאים חלק אחד), ואז כופלים במונה.', steps: [`${F(1, d)} מ-${whole}: ${X(`${whole} : ${d} = ${k}`)}.`, `${F(n, d)} הם ${n} חלקים כאלה: ${X(`${k} × ${n} = ${n * k}`)}.`, `התשובה: ${n * k}.`], tip: 'אפשר גם לכפול קודם ואז לחלק – אבל לחלק קודם נותן מספרים קטנים ונוחים.' });
  }
  if (kind === 'word') {
    const ctx = pick([
      [`בכל בקבוק יש ${X(F(n, d))} ליטר מיץ. כמה ליטר מיץ יש ב-${a} בקבוקים?`, 'ליטר'],
      [`${pick(NAMES)} רץ/ה כל יום ${X(F(n, d))} ק"מ. כמה ק"מ ירוץ/תרוץ ב-${a} ימים?`, 'ק"מ'],
      [`עוגה אחת צריכה ${X(F(n, d))} כוס סוכר. כמה כוסות סוכר צריך ל-${a} עוגות?`, 'כוסות'],
    ]);
    return fracQ('wxf', diff, ctx[0], a * n, d, { ...base, hint: `זו בעיית כפל: ${a} × ${F(n, d)}.`, steps: [`מה התרגיל? ${a} פעמים ${F(n, d)}: ${X(`${a} × ${F(n, d)}`)}.`, ...steps(a, n, d)] });
  }
  const A = kind === 'big' ? ri(6, 12) : a;
  const q = kind === 'swap' ? `${X(`${F(n, d)} × ${A} = ?`)}` : `${X(`${A} × ${F(n, d)} = ?`)}`;
  return fracQ('wxf', diff, `חשבו (כתבו את התשובה כמספר מעורב או שבר מצומצם):<div class="qexp">${q}</div>`, A * n, d, { ...base, hint: `כמה זה ${A} × ${n}?`, steps: steps(A, n, d) });
}

// ---------- 2. כפל שלם במספר מעורב ----------
function genWxM(diff) {
  const kind = diff === 1 ? pick(['basic', 'method']) : diff === 2 ? pick(['basic', 'word', 'method']) : pick(['basic', 'word', 'big']);
  const d = ri(2, diff === 1 ? 6 : 9), n = ri(1, d - 1), w = ri(1, diff === 1 ? 3 : 6), a = ri(2, diff === 3 ? 9 : 6);
  const imp = w * d + n, tot = a * imp;
  const base = { rule: 'שתי דרכים: <b>חוק הפילוג</b> – כופלים את השלם בכל חלק בנפרד ומחברים; או <b>מעבר לשבר</b> – הופכים את המספר המעורב לשבר ואז כופלים.' };
  const steps = (a, w, n, d) => {
    const imp = w * d + n;
    return [`<b>דרך 1 – חוק הפילוג:</b> ${X(`${a} × ${M(w, n, d)} = ${a} × ${w} + ${a} × ${F(n, d)}`)}`,
      `${X(`${a} × ${w} = ${a * w}`)} ו-${X(`${a} × ${F(n, d)} = ${F(a * n, d)} = ${showVal(a * n, d)}`)}. מחברים: ${X(`${a * w} + ${showVal(a * n, d)} = ${showVal(a * imp, d)}`)}.`,
      `<b>דרך 2 – מעבר לשבר:</b> ${X(`${M(w, n, d)} = ${F(imp, d)}`)} (${X(`${w} × ${d} + ${n} = ${imp}`)}). ואז ${X(`${a} × ${F(imp, d)} = ${F(a * imp, d)} = ${showVal(a * imp, d)}`)}.`];
  };
  if (kind === 'method') {
    return mcQ('wxm', diff, `איזה תרגיל מתאים לחישוב ${X(`${a} × ${M(w, n, d)}`)} <b>בחוק הפילוג</b>?`, X(`${a} × ${w} + ${a} × ${F(n, d)}`), [X(`${a} × ${w} + ${F(n, d)}`), X(`${a} × ${w} × ${a} × ${F(n, d)}`), X(`${a} + ${w} × ${F(n, d)}`)],
      { ...base, hint: 'בחוק הפילוג כופלים את השלם בכל אחד מהחלקים של המספר המעורב.', steps: [`${M(w, n, d)} זה ${w} ועוד ${F(n, d)}.`, `לכן ${a} פעמים ${M(w, n, d)} = ${a} פעמים ${w}, ועוד ${a} פעמים ${F(n, d)}.`, `התוצאה: ${X(showVal(tot, d))}.`], tip: 'הטעות הנפוצה: לכפול רק את השלם ולשכוח לכפול גם את השבר.' });
  }
  if (kind === 'word') {
    const ctx = pick([
      `בכל חבילה יש ${X(M(w, n, d))} ק"ג קמח. כמה ק"ג קמח יש ב-${a} חבילות?`,
      `${pick(NAMES)} מתאמן/ת ${X(M(w, n, d))} שעות בכל שבוע. כמה שעות יתאמן/תתאמן ב-${a} שבועות?`,
      `אורך כל קרש הוא ${X(M(w, n, d))} מטרים. מה האורך של ${a} קרשים יחד?`,
    ]);
    return fracQ('wxm', diff, ctx, tot, d, { ...base, hint: `התרגיל: ${a} × ${M(w, n, d)}.`, steps: steps(a, w, n, d), tip: 'בבעיה מילולית: "בכל אחד יש... כמה יש ב-X" = כפל.' });
  }
  return fracQ('wxm', diff, `חשבו:<div class="qexp">${X(`${a} × ${M(w, n, d)} = ?`)}</div>`, tot, d, { ...base, hint: `נסו חוק הפילוג: ${a} × ${w} ועוד ${a} × ${F(n, d)}.`, steps: steps(a, w, n, d), tip: 'בדיקה מהירה: התשובה צריכה להיות בין ' + `${a * w} ל-${a * (w + 1)}.` });
}

// ---------- 3. חילוק שבר בשלם ----------
function genFdW(diff) {
  const kind = diff === 1 ? pick(['div', 'div', 'concept']) : diff === 2 ? pick(['div', 'mul', 'word']) : pick(['mul', 'word', 'mixed']);
  const a = ri(2, diff === 1 ? 4 : 6);
  const base = { rule: 'מחלקים שבר בשלם: אם המונה מתחלק בשלם – <b>מחלקים את המונה</b>. אם לא – <b>כופלים את המכנה</b> בשלם (כל חלק נעשה קטן יותר).' };
  if (kind === 'concept') {
    const d = ri(3, 9), n = ri(1, d - 1);
    return mcQ('fdw', diff, `${X(`${F(n, d)} : 2`)} זה כמו…`, `למצוא חצי מ-${F(n, d)}`, [`לכפול את ${F(n, d)} ב-2`, `להוסיף 2 למכנה`, `לחסר 2 מהמונה`], { ...base, hint: 'לחלק ל-2 חלקים שווים = למצוא חצי.', steps: [`לחלק ב-2 זה לחלק לשני חלקים שווים – כלומר חצי.`, `${X(`${F(n, d)} : 2 = ${F(n, d * 2)}`)}${n % 2 === 0 ? ` = ${showVal(n / 2, d)}` : ''}.`], tip: 'חילוק במספר שלם תמיד מקטין את השבר.' });
  }
  if (kind === 'mixed') {
    const d = ri(2, 6), n = ri(1, d - 1), w = ri(1, 3), imp = w * d + n;
    return fracQ('fdw', diff, `חשבו:<div class="qexp">${X(`${M(w, n, d)} : ${a} = ?`)}</div>`, imp, d * a, { ...base, hint: `קודם הופכים את ${M(w, n, d)} לשבר.`, steps: [`${X(`${M(w, n, d)} = ${F(imp, d)}`)}.`, imp % a === 0 ? `המונה ${imp} מתחלק ב-${a}: ${X(`${F(imp, d)} : ${a} = ${F(imp / a, d)}`)}.` : `${imp} לא מתחלק ב-${a}, אז כופלים את המכנה: ${X(`${F(imp, d)} : ${a} = ${F(imp, d * a)}`)}.`, toMixedStep(imp, d * a) || '', `התשובה: ${X(showVal(imp, d * a))}.`].filter(Boolean), tip: 'במספר מעורב – תמיד קודם הופכים לשבר.' });
  }
  let n, d;
  if (kind === 'div') { const k = ri(1, 3); n = a * k; d = ri(n + 1, n + 7); }
  else { d = ri(2, 8); n = ri(1, d - 1); if (n % a === 0) n = n + 1 < d ? n + 1 : n - 1 || 1; }
  const divisible = n % a === 0;
  const steps = [divisible ? `המונה ${n} מתחלק ב-${a}: ${X(`${n} : ${a} = ${n / a}`)}. המכנה נשאר: ${X(F(n / a, d))}.` : `המונה ${n} לא מתחלק ב-${a}, אז כופלים את המכנה: ${X(`${d} × ${a} = ${d * a}`)}. התוצאה: ${X(F(n, d * a))}.`, toMixedStep(n, d * a) || '', `התשובה: ${X(showVal(n, d * a))}.`].filter(Boolean);
  if (kind === 'word') {
    const ctx = pick([`${X(F(n, d))} מהפיצה מתחלקת שווה בשווה בין ${a} ילדים. איזה חלק מהפיצה מקבל כל ילד?`, `סרט באורך ${X(F(n, d))} מטר נחתך ל-${a} חתיכות שוות. מה אורך כל חתיכה (במטרים)?`, `${X(F(n, d))} ליטר מים נמזגים שווה בשווה ל-${a} כוסות. כמה ליטר בכל כוס?`]);
    return fracQ('fdw', diff, ctx, n, d * a, { ...base, hint: `התרגיל: ${F(n, d)} : ${a}.`, steps: [`"מתחלק שווה בשווה" = חילוק: ${X(`${F(n, d)} : ${a}`)}.`, ...steps], tip: 'בדיקה: כופלים את התשובה ב-' + a + ' – צריך לקבל את ' + F(n, d) + '.' });
  }
  return fracQ('fdw', diff, `חשבו:<div class="qexp">${X(`${F(n, d)} : ${a} = ?`)}</div>`, n, d * a, { ...base, hint: divisible ? `האם ${n} מתחלק ב-${a}?` : `${n} לא מתחלק ב-${a}. מה עושים עם המכנה?`, steps, tip: 'בדיקה: ' + X(`${showVal(n, d * a)} × ${a}`) + ' צריך לצאת ' + F(n, d) + '.' });
}

// ---------- 4. חילוק שלם בשבר ----------
function genWdF(diff) {
  const kind = diff === 1 ? pick(['unit', 'unit', 'concept']) : diff === 2 ? pick(['unit', 'nonunitInt', 'word']) : pick(['nonunitInt', 'nonunit', 'word', 'concept2']);
  const base = { rule: '<b>חילוק בשבר = "כמה פעמים השבר נכנס בשלם?"</b> בשלם אחד יש d חלקים של 1/d. לכן: כופלים את השלם במכנה, ומחלקים במונה.' };
  if (kind === 'concept' || kind === 'concept2') {
    const a = ri(3, 9), d = ri(2, 6), n = kind === 'concept' ? 1 : ri(1, d - 1);
    return mcQ('wdf', diff, `בלי לחשב: התוצאה של ${X(`${a} : ${F(n, d)}`)} היא…`, `גדולה מ-${a}`, [`קטנה מ-${a}`, `שווה ל-${a}`, `קטנה מ-1`], { ...base, hint: `האם ${F(n, d)} נכנס ב-${a} יותר או פחות מ-${a} פעמים?`, steps: [`${F(n, d)} קטן מ-1, ולכן הוא "נכנס" בכל שלם יותר מפעם אחת.`, `לכן ב-${a} שלמים הוא נכנס יותר מ-${a} פעמים.`, `ליתר ביטחון: ${X(`${a} : ${F(n, d)} = ${showVal(a * d, n)}`)}.`], tip: 'חילוק במספר שקטן מ-1 תמיד <b>מגדיל</b>. זה ההפך מכפל בשבר!' });
  }
  let a, n, d;
  if (kind === 'unit') { a = ri(2, diff === 1 ? 6 : 12); d = ri(2, 9); n = 1; }
  else if (kind === 'nonunitInt' || kind === 'word') { d = ri(3, 9); n = ri(2, d - 1); const k = ri(1, 4); const g = n / gcd(n, d); a = g * k; if (a < 2) a = g * 2; }
  else { d = ri(3, 9); n = ri(2, d - 1); a = ri(2, 9); if ((a * d) % n === 0) a++; }
  const res = [a * d, n];
  const steps = [`בכל שלם יש ${d} חלקים של ${F(1, d)}, אז ב-${a} שלמים יש ${X(`${a} × ${d} = ${a * d}`)} חלקים כאלה.`,
    n === 1 ? `כל ${F(1, d)} הוא חלק אחד – לכן התשובה ${a * d}.` : `${F(n, d)} הם ${n} חלקים, אז מחלקים: ${X(`${a * d} : ${n} = ${showVal(a * d, n)}`)}.`,
    `בקיצור: ${X(`${a} : ${F(n, d)} = ${a} × ${F(d, n)} = ${showVal(a * d, n)}`)}.`];
  if (kind === 'word') {
    const ctx = pick([`כמה כוסות של ${X(F(n, d))} ליטר אפשר למלא מ-${a} ליטר מיץ?`, `חבל באורך ${a} מטרים נחתך לחתיכות של ${X(F(n, d))} מטר. כמה חתיכות יש?`, `${pick(NAMES)} אוכל/ת ${X(F(n, d))} שוקולד ביום. לכמה ימים יספיקו ${a} שוקולדים?`]);
    return fracQ('wdf', diff, ctx, ...res, { ...base, hint: `שואלים כמה פעמים ${F(n, d)} נכנס ב-${a}.`, steps: [`"כמה ... של ... יש ב..." = חילוק: ${X(`${a} : ${F(n, d)}`)}.`, ...steps], tip: 'בדיקה: כופלים את התשובה ב-' + F(n, d) + ' – צריך לקבל ' + a + '.' });
  }
  return fracQ('wdf', diff, `חשבו:<div class="qexp">${X(`${a} : ${F(n, d)} = ?`)}</div>`, ...res, { ...base, hint: `כמה פעמים ${F(n, d)} נכנס ב-${a}? התחילו מכמה ${F(1, d)} יש ב-${a}.`, steps, tip: n === 1 ? `קיצור: ${a} : ${F(1, d)} = ${a} × ${d}.` : 'הקיצור: כופלים במכנה ומחלקים במונה.' });
}

export const FRAC_TOPICS = {
  wxf: { name: 'כפל שלם בשבר', g: '✖️', gen: genWxF },
  wxm: { name: 'כפל שלם במספר מעורב', g: '🧩', gen: genWxM },
  fdw: { name: 'חילוק שבר בשלם', g: '🍕', gen: genFdW },
  wdf: { name: 'חילוק שלם בשבר', g: '🥤', gen: genWdF },
};

// =================== גיאומטריה: ציורים ===================
export const BASE_NAME = { 3: 'משולש', 4: 'מרובע', 5: 'מחומש', 6: 'משושה', 7: 'משובע', 8: 'מתומן' };
export const PRISM_NAME = { 3: 'מנסרה משולשת', 4: 'מנסרה מרובעת', 5: 'מנסרה מחומשת', 6: 'מנסרה משושה', 7: 'מנסרה משובעת', 8: 'מנסרה מתומנת' };
const ST = 'stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round"';
const DASH = 'stroke="#64748b" stroke-width="1.6" stroke-dasharray="5 4"';
function ring(n, cx, cy, R, k = 0.36) {
  const off = Math.PI / 2 + Math.PI / n;
  return Array.from({ length: n }, (_, i) => { const t = off + 2 * Math.PI * i / n; return { x: cx + R * Math.cos(t), y: cy + R * k * Math.sin(t), s: Math.sin(t) }; });
}
const pts = a => a.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
export function prismSVG(n, { size = 150, h = 70, hl = null, color = '#7dd3fc' } = {}) {
  const W = 160, H = 170, R = 55, cy = 140, top = cy - h - 10;
  const B = ring(n, 80, cy, R), T = B.map(p => ({ ...p, y: p.y - (cy - top) }));
  const xs = B.map(p => p.x), minX = Math.min(...xs), maxX = Math.max(...xs);
  const o = [];
  // פאות צדדיות קדמיות
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; const mid = Math.sin(Math.atan2((B[i].y + B[j].y) / 2 - cy, ((B[i].x + B[j].x) / 2 - 80) * .36)); if ((B[i].s + B[j].s) / 2 > 0.001) o.push(`<polygon points="${pts([B[i], B[j], T[j], T[i]])}" fill="${hl === 'side' && i === 0 ? '#fbbf24' : color}" fill-opacity="${hl === 'side' && i === 0 ? .9 : .35}"/>`); }
  o.push(`<polygon points="${pts(T)}" fill="${hl === 'bases' ? '#fbbf24' : color}" fill-opacity="${hl === 'bases' ? .9 : .6}" ${ST}/>`);
  if (hl === 'bases') o.push(`<polygon points="${pts(B)}" fill="#fbbf24" fill-opacity=".45"/>`);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; const vis = (B[i].s + B[j].s) / 2 > 0.001; o.push(`<line x1="${B[i].x}" y1="${B[i].y}" x2="${B[j].x}" y2="${B[j].y}" ${vis ? ST : DASH}/>`); }
  for (let i = 0; i < n; i++) { const sil = Math.abs(B[i].x - minX) < .5 || Math.abs(B[i].x - maxX) < .5; const vis = B[i].s > 0.001 || sil; o.push(`<line x1="${B[i].x}" y1="${B[i].y}" x2="${T[i].x}" y2="${T[i].y}" ${vis ? ST : DASH}/>`); }
  if (hl === 'vertices') [...B, ...T].forEach(p => o.push(`<circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#ef4444" stroke="#fff" stroke-width="1.2"/>`));
  return `<svg class="solid" viewBox="0 0 ${W} ${H}" width="${size}" height="${size * H / W}">${o.join('')}</svg>`;
}
export function pyramidSVG(n, { size = 150, color = '#c4b5fd' } = {}) {
  const W = 160, H = 170, cy = 140; const B = ring(n, 80, cy, 58), A = { x: 80, y: 22 };
  const xs = B.map(p => p.x), minX = Math.min(...xs), maxX = Math.max(...xs); const o = [];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; if ((B[i].s + B[j].s) / 2 > 0.001) o.push(`<polygon points="${pts([B[i], B[j], A])}" fill="${color}" fill-opacity="${.3 + .1 * (i % 2)}"/>`); }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; const vis = (B[i].s + B[j].s) / 2 > 0.001; o.push(`<line x1="${B[i].x}" y1="${B[i].y}" x2="${B[j].x}" y2="${B[j].y}" ${vis ? ST : DASH}/>`); }
  for (let i = 0; i < n; i++) { const sil = Math.abs(B[i].x - minX) < .5 || Math.abs(B[i].x - maxX) < .5; o.push(`<line x1="${B[i].x}" y1="${B[i].y}" x2="${A.x}" y2="${A.y}" ${B[i].s > 0.001 || sil ? ST : DASH}/>`); }
  return `<svg class="solid" viewBox="0 0 ${W} ${H}" width="${size}" height="${size * H / W}">${o.join('')}</svg>`;
}
export function roundSVG(kind, { size = 150 } = {}) {
  const W = 160, H = 170; let b;
  if (kind === 'cyl') b = `<path d="M30 40 V135 A50 16 0 0 0 130 135 V40" fill="#86efac" fill-opacity=".4" ${ST}/><ellipse cx="80" cy="40" rx="50" ry="16" fill="#86efac" fill-opacity=".7" ${ST}/><path d="M30 135 A50 16 0 0 1 130 135" fill="none" ${DASH}/>`;
  else if (kind === 'cone') b = `<path d="M30 135 L80 22 L130 135 A50 16 0 0 1 30 135" fill="#fca5a5" fill-opacity=".45" ${ST}/><path d="M30 135 A50 16 0 0 1 130 135" fill="none" ${DASH}/>`;
  else b = `<circle cx="80" cy="85" r="58" fill="#fde68a" fill-opacity=".55" ${ST}/><path d="M22 85 A58 17 0 0 0 138 85" fill="none" ${ST}/><path d="M22 85 A58 17 0 0 1 138 85" fill="none" ${DASH}/>`;
  return `<svg class="solid" viewBox="0 0 ${W} ${H}" width="${size}" height="${size * H / W}">${b}</svg>`;
}
export const SOLID_NAME = { cyl: 'גליל', cone: 'חרוט', sphere: 'כדור' };
export function boxSVG(a, b, c, { size = 210, unit = 'ס"מ', cube = false } = {}) {
  const W = 220, H = 170, x0 = 30, y0 = 140, w = 120, d = 50, h = 80, dx = d * .7, dy = d * .45;
  const P = (x, y) => `${x},${y}`;
  return `<svg class="solid" viewBox="0 0 ${W} ${H}" width="${size}" height="${size * H / W}">
    <polygon points="${P(x0, y0)} ${P(x0 + w, y0)} ${P(x0 + w, y0 - h)} ${P(x0, y0 - h)}" fill="#7dd3fc" fill-opacity=".45" ${ST}/>
    <polygon points="${P(x0, y0 - h)} ${P(x0 + w, y0 - h)} ${P(x0 + w + dx, y0 - h - dy)} ${P(x0 + dx, y0 - h - dy)}" fill="#7dd3fc" fill-opacity=".7" ${ST}/>
    <polygon points="${P(x0 + w, y0)} ${P(x0 + w + dx, y0 - dy)} ${P(x0 + w + dx, y0 - h - dy)} ${P(x0 + w, y0 - h)}" fill="#38bdf8" fill-opacity=".5" ${ST}/>
    <path d="M${x0} ${y0} L${x0 + dx} ${y0 - dy} L${x0 + w + dx} ${y0 - dy} M${x0 + dx} ${y0 - dy} L${x0 + dx} ${y0 - h - dy}" fill="none" ${DASH}/>
    <text x="${x0 + w / 2}" y="${y0 + 18}" text-anchor="middle" font-size="15" font-weight="700" fill="#0f172a">${a} ${unit}</text>
    <text x="${x0 + w + dx / 2 + 14}" y="${y0 - dy / 2 + 6}" font-size="15" font-weight="700" fill="#0f172a">${cube ? '' : b + ' ' + unit}</text>
    <text x="${x0 - 6}" y="${y0 - h / 2 + 5}" text-anchor="end" font-size="15" font-weight="700" fill="#0f172a">${cube ? '' : c + ' ' + unit}</text></svg>`;
}
// פריסה: n מלבנים ברצועה + שני בסיסים. opts: top, bot (אינדקס מלבן), same (שני בסיסים למעלה), rects, sides
function polyOnEdge(x, y, s, m, up) {
  const out = [{ x, y }]; let cx = x, cy = y, ang = 0; const ext = 2 * Math.PI / m;
  for (let k = 1; k < m; k++) { cx += s * Math.cos(ang); cy += s * Math.sin(ang); out.push({ x: cx, y: cy }); ang += up ? -ext : ext; }
  return out;
}
export function netSVG(n, { top = 0, bot = 0, same = false, rects = n, sides = n, size = 210 } = {}) {
  const s = 28, H = 46, polyH = s * (sides <= 4 ? 1 : 1 / (2 * Math.tan(Math.PI / sides)) * 2);
  const y0 = polyH + 6, w = rects * s;
  const o = [];
  for (let k = 0; k < rects; k++) o.push(`<rect x="${k * s}" y="${y0}" width="${s}" height="${H}" fill="#7dd3fc" fill-opacity=".45" ${ST}/>`);
  const T = polyOnEdge((top % rects) * s, y0, s, sides, true);
  const bi = same ? (top + Math.max(2, Math.floor(rects / 2))) % rects : bot % rects;
  const Bp = same ? polyOnEdge(bi * s, y0, s, sides, true) : polyOnEdge(bi * s, y0 + H, s, sides, false);
  o.push(`<polygon points="${pts(T)}" fill="#fbbf24" fill-opacity=".7" ${ST}/>`, `<polygon points="${pts(Bp)}" fill="#fbbf24" fill-opacity=".7" ${ST}/>`);
  const all = [...T, ...Bp, { x: 0, y: y0 }, { x: w, y: y0 + H }];
  const minX = Math.min(...all.map(p => p.x)) - 4, maxX = Math.max(...all.map(p => p.x)) + 4, minY = Math.min(...all.map(p => p.y)) - 4, maxY = Math.max(...all.map(p => p.y)) + 4;
  const VW = maxX - minX, VH = maxY - minY, sc = size / Math.max(VW, VH * 1.15);
  return `<svg class="net" viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${VW.toFixed(1)} ${VH.toFixed(1)}" width="${(VW * sc).toFixed(0)}" height="${(VH * sc).toFixed(0)}">${o.join('')}</svg>`;
}

// =================== גיאומטריה: מחוללים ===================
const ns = d => d === 1 ? [3, 4, 5] : d === 2 ? [3, 4, 5, 6] : [5, 6, 7, 8];
const GEO_TIP = 'הנוסחאות של מנסרה שבבסיסה n צלעות: <b>קדקודים = <span class="mx" dir="ltr">2n</span></b>, <b>מקצועות = <span class="mx" dir="ltr">3n</span></b>, <b>פאות = <span class="mx" dir="ltr">n + 2</span></b>.';

function genDef(diff) {
  const kind = pick(diff === 1 ? ['name', 'which', 'facts'] : ['name', 'which', 'facts', 'tf']);
  const rule = '<b>מנסרה</b> היא גוף שיש לו <b>שני בסיסים חופפים ומקבילים</b> שהם מצולעים, ושאר הפאות (הפאות הצדדיות) הן <b>מלבנים</b>. שם המנסרה נקבע לפי צורת הבסיס.';
  if (kind === 'name') {
    const n = pick(ns(diff));
    return mcQ('def', diff, `איך נקראת המנסרה הזו?<div class="qfig">${prismSVG(n, { hl: 'bases' })}</div><small>הבסיסים צבועים בצהוב</small>`, PRISM_NAME[n], shuffle(Object.keys(PRISM_NAME).filter(k => +k !== n).map(k => PRISM_NAME[k])).slice(0, 3), { rule, hint: 'ספרו כמה צלעות יש לבסיס (הפאה הצהובה).', steps: [`הבסיס הוא ${BASE_NAME[n]} – יש לו ${n} צלעות.`, `שם המנסרה לפי הבסיס: <b>${PRISM_NAME[n]}</b>.`], tip: 'קודם מוצאים את שני הבסיסים (הפאות שאינן מלבנים, או זוג הפאות המקבילות), ורק אז סופרים צלעות.' });
  }
  if (kind === 'which') {
    const n = pick(ns(diff));
    const others = shuffle([`<div class="optfig">${pyramidSVG(pick([3, 4, 5]), { size: 90 })}</div>`, `<div class="optfig">${roundSVG('cyl', { size: 90 })}</div>`, `<div class="optfig">${roundSVG('cone', { size: 90 })}</div>`, `<div class="optfig">${roundSVG('sphere', { size: 90 })}</div>`]).slice(0, 3);
    return mcQ('def', diff, 'איזה מהגופים הוא <b>מנסרה</b>?', `<div class="optfig">${prismSVG(n, { size: 90 })}</div>`, others, { rule, sig: `def|which|${n}|${rnd().toFixed(2)}`, hint: 'חפשו גוף עם שני בסיסים זהים ומקבילים, ופאות צדדיות מלבניות.', steps: ['פירמידה – יש לה בסיס אחד וקודקוד למעלה, לא שני בסיסים.', 'גליל, חרוט וכדור – יש להם משטחים מעוגלים, ולכן הם לא מנסרות (וגם לא פאונים).', `הגוף הנכון: ${PRISM_NAME[n]}.`], tip: 'גליל נראה כמו מנסרה – אבל הבסיסים שלו עיגולים, לא מצולעים!' });
  }
  if (kind === 'facts') {
    const F2 = pick([
      ['כמה בסיסים יש לכל מנסרה?', '2', ['1', '3', 'תלוי במנסרה'], 'לכל מנסרה יש בדיוק 2 בסיסים – חופפים ומקבילים.'],
      ['במנסרה ישרה, הפאות הצדדיות הן תמיד…', 'מלבנים', ['משולשים', 'ריבועים בלבד', 'זהות לבסיסים'], 'הפאות הצדדיות של מנסרה ישרה הן מלבנים (לפעמים ריבועים – שגם הם מלבנים).'],
      ['שני הבסיסים של מנסרה הם…', 'חופפים ומקבילים', ['שונים זה מזה', 'מאונכים זה לזה', 'תמיד ריבועים'], 'שני הבסיסים זהים (חופפים) ונמצאים זה מול זה (מקבילים).'],
      ['מה קובע את השם של מנסרה?', 'צורת הבסיס', ['מספר הפאות הצדדיות בלבד', 'הגובה שלה', 'הנפח שלה'], 'מנסרה נקראת לפי צורת הבסיס: בסיס משושה → מנסרה משושה.'],
      ['תיבה היא…', 'מנסרה מרובעת', ['פירמידה מרובעת', 'לא מנסרה', 'מנסרה משולשת'], 'לתיבה יש שני בסיסים מלבניים חופפים ומקבילים ופאות צדדיות מלבניות – היא מנסרה מרובעת. גם קובייה היא מנסרה מרובעת.'],
    ]);
    return mcQ('def', diff, F2[0], F2[1], F2[2], { rule, hint: 'חשבו על ההגדרה של מנסרה.', steps: [F2[3]], tip: 'כדאי לזכור את ההגדרה בעל-פה: "שני בסיסים חופפים ומקבילים, ופאות צדדיות מלבניות".' });
  }
  const T = pick([
    ['קובייה היא מנסרה.', true, 'לקובייה יש שני בסיסים ריבועיים חופפים ומקבילים, וכל הפאות הצדדיות הן ריבועים (מלבנים). היא מנסרה מרובעת.'],
    ['גליל הוא מנסרה.', false, 'לגליל יש שני בסיסים, אבל הם עיגולים – לא מצולעים, והמעטפת שלו מעוגלת. לכן הוא לא מנסרה.'],
    ['יש מנסרה עם 4 פאות בדיוק.', false, 'למנסרה הקטנה ביותר (משולשת) יש 3 + 2 = 5 פאות. אין מנסרה עם פחות מ-5 פאות.'],
    ['למנסרה משולשת יש 3 פאות צדדיות.', true, 'מספר הפאות הצדדיות שווה למספר צלעות הבסיס: 3.'],
    ['פירמידה היא מנסרה.', false, 'לפירמידה יש בסיס אחד בלבד, והפאות הצדדיות הן משולשים שנפגשים בקודקוד. היא לא מנסרה (אבל היא פאון).'],
  ]);
  return mcQ('def', diff, `נכון או לא נכון?<div class="qsent">${T[0]}</div>`, T[1] ? 'נכון' : 'לא נכון', [T[1] ? 'לא נכון' : 'נכון'], { rule, sig: `def|tf|${T[0]}`, hint: 'בדקו את הטענה מול ההגדרה של מנסרה.', steps: [T[2]], tip: 'בשאלות נכון/לא נכון – מחפשים דוגמה אחת שסותרת. אם יש כזו, הטענה לא נכונה.' });
}

function genStruct(diff) {
  const kind = pick(diff === 1 ? ['count', 'count'] : diff === 2 ? ['count', 'reverse', 'formula'] : ['reverse', 'impossible', 'sum', 'count']);
  const n = pick(ns(diff)), V = 2 * n, E = 3 * n, Fc = n + 2;
  const base = { rule: GEO_TIP, tip: 'בדיקה: קדקודים + פאות − מקצועות = 2 (נוסחת אוילר). ' + X(`${V} + ${Fc} − ${E} = 2`) };
  const expl = [`לבסיס יש ${n} צלעות (${BASE_NAME[n]}).`, `<b>קדקודים:</b> ${n} למטה + ${n} למעלה = ${X(`2 × ${n} = ${V}`)}.`, `<b>מקצועות:</b> ${n} בבסיס התחתון + ${n} בעליון + ${n} מקצועות צדדיים = ${X(`3 × ${n} = ${E}`)}.`, `<b>פאות:</b> ${n} פאות צדדיות + 2 בסיסים = ${X(`${n} + 2 = ${Fc}`)}.`];
  if (kind === 'count') {
    const what = pick([['קדקודים', V], ['מקצועות', E], ['פאות', Fc]]);
    const fig = diff === 1 ? `<div class="qfig">${prismSVG(n, { hl: what[0] === 'קדקודים' ? 'vertices' : null })}</div>` : '';
    return numQ('struct', diff, `כמה <b>${what[0]}</b> יש ל${PRISM_NAME[n]}?${fig}`, what[1], { ...base, hint: `לבסיס יש ${n} צלעות. השתמשו בנוסחה.`, steps: expl });
  }
  if (kind === 'reverse') {
    const what = pick([['מקצועות', E, 3, 'מחלקים ב-3'], ['קדקודים', V, 2, 'מחלקים ב-2'], ['פאות', Fc, 0, 'מחסירים 2']]);
    return mcQ('struct', diff, `למנסרה יש <b>${what[1]} ${what[0]}</b>. איזו מנסרה היא?`, PRISM_NAME[n], shuffle(Object.keys(PRISM_NAME).filter(k => +k !== n).map(k => PRISM_NAME[k])).slice(0, 3), { ...base, hint: `הנוסחה ל${what[0]} – והפעם הולכים הפוך.`, steps: [`${what[0]} = ${what[0] === 'מקצועות' ? '3n' : what[0] === 'קדקודים' ? '2n' : '<span class="mx" dir="ltr">n + 2</span>'}.`, `${what[3]}: ${X(what[0] === 'פאות' ? `${what[1]} − 2 = ${n}` : `${what[1]} : ${what[2]} = ${n}`)}.`, `לבסיס ${n} צלעות → <b>${PRISM_NAME[n]}</b>.`] });
  }
  if (kind === 'formula') {
    return mcQ('struct', diff, 'במנסרה שלבסיס שלה <b>n</b> צלעות, מספר <b>המקצועות</b> הוא…', X('3 × n'), [X('2 × n'), X('n + 2'), X('n × n')], { ...base, hint: 'ספרו: מקצועות בבסיס התחתון, בעליון, והמקצועות הצדדיים.', steps: ['n מקצועות בבסיס התחתון.', 'n מקצועות בבסיס העליון.', 'n מקצועות צדדיים (אחד מכל קדקוד למטה לקדקוד מעליו).', 'ביחד: 3n.'] });
  }
  if (kind === 'impossible') {
    const good = shuffle([9, 12, 15, 18, 21, 24]).slice(0, 3), bad = pick([10, 14, 16, 20, 22, 25]);
    return mcQ('struct', diff, 'איזה מספר <b>לא יכול</b> להיות מספר המקצועות של מנסרה?', String(bad), good.map(String), { ...base, sig: `struct|imp|${bad}`, hint: 'מספר המקצועות של מנסרה הוא תמיד 3 × n.', steps: ['מספר המקצועות הוא 3n – תמיד מתחלק ב-3.', `${good.join(', ')} מתחלקים ב-3 – הם אפשריים.`, `${bad} לא מתחלק ב-3 – אין מנסרה כזו.`], tip: 'באותו אופן: מספר הקדקודים (2n) תמיד זוגי.' });
  }
  return numQ('struct', diff, `כמה <b>קדקודים ופאות ביחד</b> יש ל${PRISM_NAME[n]}?`, V + Fc, { ...base, hint: 'חשבו כל אחד בנפרד ואז חברו.', steps: [...expl.slice(0, 2), expl[3], `ביחד: ${X(`${V} + ${Fc} = ${V + Fc}`)}.`] });
}

function genNet(diff) {
  const kind = pick(diff === 1 ? ['which', 'rects'] : ['which', 'which', 'solid', 'rects']);
  const n = pick(diff === 1 ? [3, 4] : diff === 2 ? [3, 4, 5, 6] : [5, 6, 7]);
  const rule = 'פריסה של מנסרה: <b>n מלבנים</b> ברצף (הפאות הצדדיות) + <b>2 בסיסים</b> – אחד מצד אחד של הרצועה ואחד מהצד השני.';
  if (kind === 'rects') {
    return numQ('net', diff, `כמה <b>מלבנים</b> יש בפריסה של ${PRISM_NAME[n]}?`, n, { rule, hint: 'כל פאה צדדית היא מלבן. כמה פאות צדדיות יש?', steps: [`ל${PRISM_NAME[n]} יש ${n} פאות צדדיות – אחת לכל צלע של הבסיס.`, `לכן בפריסה יש ${n} מלבנים, ועוד 2 בסיסים (${BASE_NAME[n]}ים).`], tip: 'בפריסה יש בסך הכול <span class="mx" dir="ltr">n + 2</span> צורות – בדיוק כמו מספר הפאות.' });
  }
  const top = ri(0, n - 1), bot = ri(0, n - 1);
  const good = `<div class="optfig">${netSVG(n, { top, bot, size: 150 })}</div>`;
  if (kind === 'solid') {
    return mcQ('net', diff, `איזה גוף אפשר לבנות מהפריסה?<div class="qfig">${netSVG(n, { top, bot, size: 230 })}</div>`, PRISM_NAME[n], shuffle(Object.keys(PRISM_NAME).filter(k => +k !== n).map(k => PRISM_NAME[k])).slice(0, 2).concat([`פירמידה ${BASE_NAME[n] === 'משולש' ? 'משולשת' : 'מרובעת'}`]), { rule, sig: `net|solid|${n}|${top}|${bot}`, hint: 'ספרו את המלבנים, ובדקו את צורת שני הבסיסים.', steps: [`יש ${n} מלבנים ושני ${BASE_NAME[n]}ים.`, `לכן זו פריסה של <b>${PRISM_NAME[n]}</b>.`], tip: 'בפירמידה הפאות הצדדיות הן משולשים – לא מלבנים.' });
  }
  const bads = shuffle([
    [`<div class="optfig">${netSVG(n, { top, same: true, size: 150 })}</div>`, 'שני הבסיסים באותו צד של הרצועה – בקיפול הם ייפלו זה על זה, ולמטה יישאר חור.'],
    [`<div class="optfig">${netSVG(n, { top, bot, rects: n - 1, size: 150 })}</div>`, `יש רק ${n - 1} מלבנים – חסרה פאה צדדית.`],
    [`<div class="optfig">${netSVG(n, { top, bot, rects: n + 1, size: 150 })}</div>`, `יש ${n + 1} מלבנים – מלבן אחד מיותר.`],
    [`<div class="optfig">${netSVG(n, { top, bot, sides: n + 1, size: 150 })}</div>`, `הבסיסים הם ${BASE_NAME[n + 1]}ים ולא ${BASE_NAME[n]}ים.`],
  ]).slice(0, 3);
  return mcQ('net', diff, `איזו פריסה היא של <b>${PRISM_NAME[n]}</b>?`, good, bads.map(b => b[0]), { rule, sig: `net|which|${n}|${top}|${bot}|${rnd().toFixed(2)}`, hint: `צריך בדיוק ${n} מלבנים, ושני ${BASE_NAME[n]}ים – אחד מכל צד של הרצועה.`, steps: [`בפריסה הנכונה: ${n} מלבנים ושני ${BASE_NAME[n]}ים, אחד למעלה ואחד למטה.`, ...bads.map(b => 'בפריסה אחרת: ' + b[1])], tip: 'דמיינו שאתם מקפלים: הרצועה נסגרת לגליל של מלבנים, ובסיס אחד סוגר מלמעלה ואחד מלמטה.' });
}

function genVol(diff) {
  const kind = pick(diff === 1 ? ['box', 'cube', 'baseArea'] : diff === 2 ? ['box', 'baseArea', 'tri', 'word'] : ['tri', 'revBox', 'revH', 'concept', 'word']);
  const rule = '<b>נפח מנסרה = שטח הבסיס × גובה.</b> בתיבה: אורך × רוחב × גובה. יחידות הנפח: סמ"ק (ס"מ³).';
  if (kind === 'cube') { const s = ri(2, 10); return numQ('vol', diff, `מה הנפח של קובייה שאורך המקצוע שלה ${s} ס"מ? (בסמ"ק)<div class="qfig">${boxSVG(s, s, s, { cube: true })}</div>`, s ** 3, { rule, hint: 'בקובייה כל המקצועות שווים: מקצוע × מקצוע × מקצוע.', steps: [`שטח הבסיס: ${X(`${s} × ${s} = ${s * s}`)} סמ"ר.`, `כפול הגובה: ${X(`${s * s} × ${s} = ${s ** 3}`)} סמ"ק.`], tip: 'בקובייה הנפח הוא המקצוע בחזקת 3.' }); }
  if (kind === 'box' || kind === 'word') {
    const a = ri(2, 12), b = ri(2, 9), c = ri(2, 10);
    const q = kind === 'word' ? pick([`אקווריום בצורת תיבה: אורך ${a} ס"מ, רוחב ${b} ס"מ וגובה ${c} ס"מ. כמה סמ"ק מים נכנסים בו כשהוא מלא?`, `כמה קוביות של 1 סמ"ק צריך כדי למלא קופסה בצורת תיבה שמידותיה ${a} × ${b} × ${c} ס"מ?`]) : `מה הנפח של התיבה? (בסמ"ק)<div class="qfig">${boxSVG(a, b, c)}</div>`;
    return numQ('vol', diff, q, a * b * c, { rule, hint: 'קודם שטח הבסיס (אורך × רוחב), אחר כך כפול הגובה.', steps: [`שטח הבסיס: ${X(`${a} × ${b} = ${a * b}`)} סמ"ר.`, `נפח = שטח הבסיס × הגובה: ${X(`${a * b} × ${c} = ${a * b * c}`)} סמ"ק.`], tip: 'כדי לכפול 3 מספרים בקלות – כופלים קודם את הזוג הנוח (למשל זה שיוצא עגול).' });
  }
  if (kind === 'baseArea') { const S = ri(4, 40), h = ri(2, 12), n = pick([3, 5, 6]); return numQ('vol', diff, `שטח הבסיס של ${PRISM_NAME[n]} הוא ${S} סמ"ר, והגובה שלה ${h} ס"מ. מה הנפח שלה (בסמ"ק)?<div class="qfig">${prismSVG(n, { hl: 'bases', size: 130 })}</div>`, S * h, { rule, hint: 'הנוסחה עובדת לכל מנסרה – לא משנה מה צורת הבסיס.', steps: [`נפח = שטח בסיס × גובה.`, `${X(`${S} × ${h} = ${S * h}`)} סמ"ק.`], tip: 'כשנותנים שטח בסיס – לא צריך לדעת את צורת הבסיס בכלל.' }); }
  if (kind === 'tri') { let a = ri(2, 10), b = ri(2, 10); if ((a * b) % 2) a++; const h = ri(3, 12), S = a * b / 2; return numQ('vol', diff, `הבסיס של מנסרה משולשת הוא <b>משולש ישר-זווית</b> שניצביו ${a} ס"מ ו-${b} ס"מ. גובה המנסרה ${h} ס"מ. מה הנפח (בסמ"ק)?<div class="qfig">${prismSVG(3, { hl: 'bases', size: 130 })}</div>`, S * h, { rule, hint: 'שטח משולש ישר-זווית = ניצב × ניצב : 2.', steps: [`שטח הבסיס (משולש): ${X(`${a} × ${b} : 2 = ${S}`)} סמ"ר.`, `נפח: ${X(`${S} × ${h} = ${S * h}`)} סמ"ק.`], tip: 'הטעות הנפוצה: לשכוח לחלק ב-2 בשטח המשולש.' }); }
  if (kind === 'revBox') { const a = ri(2, 10), b = ri(2, 8), c = ri(2, 10); return numQ('vol', diff, `הנפח של תיבה הוא ${a * b * c} סמ"ק. האורך שלה ${a} ס"מ והרוחב ${b} ס"מ. מה הגובה שלה (בס"מ)?`, c, { rule, hint: 'נפח = שטח בסיס × גובה. אז גובה = נפח : שטח בסיס.', steps: [`שטח הבסיס: ${X(`${a} × ${b} = ${a * b}`)}.`, `גובה = נפח : שטח בסיס: ${X(`${a * b * c} : ${a * b} = ${c}`)} ס"מ.`], tip: 'בדיקה: כופלים את שלושת המידות – צריך לצאת הנפח.' }); }
  if (kind === 'revH') { const S = ri(5, 30), h = ri(2, 12); return numQ('vol', diff, `הנפח של מנסרה הוא ${S * h} סמ"ק ושטח הבסיס שלה ${S} סמ"ר. מה הגובה שלה (בס"מ)?`, h, { rule, hint: 'גובה = נפח : שטח בסיס.', steps: [`${X(`${S * h} : ${S} = ${h}`)} ס"מ.`], tip: 'כפל וחילוק הם פעולות הפוכות – ככה עוברים מהנוסחה לשאלה הפוכה.' }); }
  const C = pick([['אם מגדילים את <b>הגובה</b> של מנסרה פי 2 (והבסיס לא משתנה), הנפח…', 'גדל פי 2', ['גדל פי 4', 'לא משתנה', 'קטן פי 2'], 'הנפח = שטח בסיס × גובה. אם הגובה פי 2, גם המכפלה פי 2.'], ['אם מגדילים את <b>כל המידות</b> של קובייה פי 2, הנפח גדל…', 'פי 8', ['פי 2', 'פי 4', 'פי 6'], '2 × 2 × 2 = 8. כל אחת משלוש המידות מכפילה את הנפח.']]);
  return mcQ('vol', diff, C[0], C[1], C[2], { rule, hint: 'חשבו על הנוסחה: שטח בסיס × גובה.', steps: [C[2 + 1]], tip: 'אפשר לבדוק עם מספרים: קובייה של 1 ס"מ ושל 2 ס"מ.' });
}

function genPoly(diff) {
  const kind = pick(diff === 1 ? ['tf', 'which'] : ['tf', 'which', 'notprism', 'tf']);
  const rule = '<b>פאון</b> הוא גוף שכל הפאות שלו הן <b>מצולעים</b> (צורות שטוחות עם צלעות ישרות). <b>כל מנסרה היא פאון</b> – אבל <b>לא כל פאון הוא מנסרה</b>: למשל פירמידה היא פאון ולא מנסרה.';
  if (kind === 'which') {
    const good = pick([prismSVG(pick([3, 4, 5]), { size: 90 }), pyramidSVG(pick([3, 4]), { size: 90 })]);
    return mcQ('poly', diff, 'איזה מהגופים הוא <b>פאון</b>?', `<div class="optfig">${good}</div>`, ['cyl', 'cone', 'sphere'].map(k => `<div class="optfig">${roundSVG(k, { size: 90 })}</div>`), { rule, sig: `poly|which|${rnd().toFixed(3)}`, hint: 'בפאון כל הפאות שטוחות ועם צלעות ישרות. אין משטחים מעוגלים.', steps: ['לגליל, לחרוט ולכדור יש משטחים מעוגלים – הם לא פאונים.', 'הגוף הנכון בנוי רק ממצולעים – ולכן הוא פאון.'], tip: 'אם אפשר "לגלגל" את הגוף על משטח מעוגל – הוא לא פאון.' });
  }
  if (kind === 'notprism') {
    const k = pick([3, 4]);
    return mcQ('poly', diff, 'איזה גוף הוא <b>פאון</b> אבל <b>לא מנסרה</b>?', `<div class="optfig">${pyramidSVG(k, { size: 90 })}</div>`, [`<div class="optfig">${prismSVG(pick([3, 4, 5]), { size: 90 })}</div>`, `<div class="optfig">${roundSVG('cyl', { size: 90 })}</div>`, `<div class="optfig">${prismSVG(6, { size: 90 })}</div>`], { rule, sig: `poly|notprism|${rnd().toFixed(3)}`, hint: 'חפשו גוף שבנוי ממצולעים, אבל אין לו שני בסיסים חופפים ומקבילים.', steps: ['המנסרות – הן גם פאונים, אז הן לא מתאימות ("לא מנסרה").', 'הגליל – בכלל לא פאון.', `הפירמידה ה${k === 3 ? 'משולשת' : 'מרובעת'} – כל פאותיה מצולעים (פאון), אבל יש לה בסיס אחד וקודקוד – לא מנסרה.`], tip: 'פירמידה היא הדוגמה הכי חשובה לזכור: פאון שאינו מנסרה.' });
  }
  const T = pick([
    ['כל מנסרה היא פאון.', true, 'כל הפאות של מנסרה הן מצולעים (שני בסיסים מצולעים ומלבנים) – לכן היא פאון.'],
    ['כל פאון הוא מנסרה.', false, 'לא! פירמידה היא פאון (כל פאותיה מצולעים) אבל היא לא מנסרה – אין לה שני בסיסים חופפים ומקבילים.'],
    ['כדור הוא פאון.', false, 'לכדור אין פאות שטוחות בכלל – הוא כולו מעוגל.'],
    ['פירמידה היא פאון.', true, 'כל הפאות של פירמידה הן מצולעים: בסיס מצולע ומשולשים. לכן היא פאון.'],
    ['תיבה היא גם מנסרה וגם פאון.', true, 'תיבה היא מנסרה מרובעת, וכל מנסרה היא פאון.'],
    ['גליל הוא פאון.', false, 'לגליל יש בסיסים עגולים ומעטפת מעוגלת – הם לא מצולעים, ולכן הוא לא פאון.'],
    ['יש פאון עם 4 פאות בלבד.', true, 'פירמידה משולשת: בסיס משולש ו-3 פאות משולשות = 4 פאות. (למנסרה אין פחות מ-5.)'],
  ]);
  return mcQ('poly', diff, `נכון או לא נכון?<div class="qsent">${T[0]}</div>`, T[1] ? 'נכון' : 'לא נכון', [T[1] ? 'לא נכון' : 'נכון'], { rule, sig: `poly|tf|${T[0]}`, hint: 'זכרו: מנסרה ⊂ פאון. כל מנסרה היא פאון, אבל לא להפך.', steps: [T[2]], tip: 'משפט הזהב למבחן: "כל מנסרה היא פאון, אך לא כל פאון הוא מנסרה" – ודוגמה: פירמידה.' });
}

export const GEO_TOPICS = {
  def: { name: 'מהי מנסרה', g: '🔷', gen: genDef },
  struct: { name: 'קדקודים, מקצועות ופאות', g: '🔢', gen: genStruct },
  net: { name: 'פריסת המנסרה', g: '📐', gen: genNet },
  vol: { name: 'חישוב נפח', g: '🧊', gen: genVol },
  poly: { name: 'פאון ומנסרה', g: '💎', gen: genPoly },
};

export function genQ(exam, topic, diff, seed) {
  srand(seed || (Math.random() * 1e9) | 0);
  const T = exam === 'geo' ? GEO_TOPICS : FRAC_TOPICS;
  const q = T[topic].gen(Math.max(1, Math.min(3, diff)));
  q.exam = exam; q.sig = q.sig || q.q; return q;
}
// בדיקת תשובה
export function checkAnswer(q, r) {
  if (r == null) return false;
  if (q.type === 'mc') return r === q.ans;
  if (q.type === 'num') return Number(String(r).replace(/[,\s]/g, '')) === Number(q.answer);
  if (q.type === 'frac') { const { w = 0, n = 0, d = 1 } = r; if (!d) return false; const num = w * d + n; return num * q.answer.d === q.answer.n * d; }
  return false;
}
export function answerHTML(q) {
  if (q.type === 'mc') return q.opts[q.ans];
  if (q.type === 'num') return String(q.answer);
  return X(showVal(q.answer.n, q.answer.d));
}
