// MindHero – מבחנים בבית הספר: עולם נפרד, עם שותף שגדל בתוך ביצה ובוקע בערב המבחן
import { $, $$, esc, modal, toast, beep, confetti, today } from './ui.js?v=35';
import { GEO_TOPICS, FRAC_TOPICS, gcd, genQ, checkAnswer, answerHTML, prismSVG, pyramidSVG, roundSVG, netSVG, boxSVG, F, M, X } from './schoolgen.js?v=35';
import { CREATURES, STAGE_NAME, creatureSVG, eggSVG } from './creatures.js?v=35';

let C = null; // הקשר מהאפליקציה: P, save, setScreen, home, bossHour, mentorFace
export function initSchool(ctx) { C = ctx; }

export const EXAMS = {
  geo: { title: 'מבחן בגיאומטריה', subject: 'מנסרות', date: '2026-12-03', kind: 'walk', world: 'ממלכת המנסרות', worldG: '💎', topics: GEO_TOPICS, partner: 'שותף הולך' },
  frac: { title: 'מבחן במתמטיקה', subject: 'כפל וחילוק שברים', date: '2026-12-14', kind: 'fly', world: 'שמי השברים', worldG: '☁️', topics: FRAC_TOPICS, partner: 'שותף מעופף' },
};
const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const dateHe = d => { const x = new Date(d + 'T12:00'); return `יום ${DAYS_HE[x.getDay()]}, ${x.getDate()}.${x.getMonth() + 1}`; };
const daysLeft = d => Math.ceil((new Date(d + 'T00:00') - new Date(today() + 'T00:00')) / 864e5);
const revealAt = ex => new Date(`${EXAMS[ex].date}T${String(C?.bossHour?.() ?? 18).padStart(2, '0')}:00`);
const isRevealTime = ex => Date.now() >= revealAt(ex).getTime();

// ---------- מצב ----------
export function S_(ex) {
  const p = C.P(); p.school = p.school || {};
  const s = p.school[ex] = p.school[ex] || { cr: null, cname: '', m: {}, n: {}, ok: {}, learned: {}, qlog: {}, sec: {}, sessions: [], mocks: [], revealed: false, final: 0 };
  Object.keys(EXAMS[ex].topics).forEach(t => { s.m[t] = s.m[t] || 0; s.n[t] = s.n[t] || 0; s.ok[t] = s.ok[t] || 0; });
  return s;
}
export const overall = s => { const v = Object.values(s.m); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0; };
const TH = [0, 15, 35, 55, 75, 90];
export function stageOf(s) {
  if (s.revealed) return s.final;
  const o = overall(s), mn = Math.min(...Object.values(s.m));
  let st = 0; for (let i = 1; i <= 5; i++) if (o >= TH[i]) st = i;
  if (st === 5 && mn < 70) st = 4;
  return st;
}
const nextTH = s => { const st = stageOf(s); return st >= 5 ? null : TH[st + 1]; };
const diffOf = m => m < 35 ? 1 : m < 70 ? 2 : 3;
function learn(s, ex, q, ok, mode) {
  const t = q.topic, k = [0, .09, .12, .15][q.diff] * (mode === 'mock' ? 1.2 : 1);
  if (!isRevealTime(ex)) s.m[t] = Math.max(0, Math.min(100, s.m[t] + (ok ? (100 - s.m[t]) * k : -s.m[t] * 0.06)));
  s.n[t]++; if (ok) s.ok[t]++;
}
// חוק החזרות גם כאן: שאלה לכל היותר פעמיים, ולא פעמיים באותו מצב
const keyOf = q => { let h = 5381; const z = q.sig || q.q; for (let i = 0; i < z.length; i++) h = ((h * 33) ^ z.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
function freshQ(ex, topic, diff, mode, avoid) {
  const s = S_(ex), md = mode[0];
  for (let t = 0; t < 40; t++) {
    const q = genQ(ex, topic, t < 25 ? diff : 1 + (t % 3), (Math.random() * 1e9) | 0); const k = keyOf(q), u = s.qlog[k] || '';
    if (!avoid.has(k) && u.length < 2 && !u.includes(md)) { avoid.add(k); q.key = k; return q; }
  }
  const q = genQ(ex, topic, diff, (Math.random() * 1e9) | 0); q.key = keyOf(q); return q;
}

// ---------- זמן תרגול ----------
let tInt = null, lastIn = Date.now(), tEx = null;
['pointerdown', 'keydown', 'touchstart'].forEach(e => window.addEventListener(e, () => lastIn = Date.now(), { passive: true }));
function startTimer(ex) { tEx = ex; clearInterval(tInt); tInt = setInterval(() => { if (document.hidden || Date.now() - lastIn > 90000 || !tEx) return; const s = S_(tEx); const d = today(); s.sec[d] = (s.sec[d] || 0) + 5; }, 5000); }
function stopTimer() { clearInterval(tInt); tInt = null; tEx = null; C.save(true); }

// ---------- עזרים חזותיים ----------
export const fracBar = (n, d, { w = 220, wholes = 1, col = '#f472b6' } = {}) => {
  const out = []; const segW = w / d;
  for (let k = 0; k < wholes; k++) { const y = k * 34; for (let i = 0; i < d; i++) { const idx = k * d + i; out.push(`<rect x="${i * segW}" y="${y}" width="${segW}" height="26" fill="${idx < n ? col : '#fff'}" stroke="#1e293b" stroke-width="2"/>`); } }
  return `<svg class="fbar" viewBox="-2 -2 ${w + 4} ${wholes * 34 + 2}" width="${Math.min(w, 260)}">${out.join('')}</svg>`;
};
const card = (title, body) => ({ title, body });
const vbox = (...a) => `<div class="lfig">${a.join('')}</div>`;
const LESSONS = {
  def: [
    card('מהי מנסרה?', `<p><b>מנסרה</b> היא גוף שיש לו <b>שני בסיסים חופפים ומקבילים</b> – והם מצולעים.<br>שאר הפאות נקראות <b>פאות צדדיות</b>, והן <b>מלבנים</b>.</p>${vbox(prismSVG(5, { hl: 'bases' }))}<p class="lnote">בציור: שני הבסיסים (צהוב) זהים ונמצאים אחד מול השני.</p>`),
    card('השם לפי הבסיס', `<p>קוראים למנסרה לפי <b>צורת הבסיס</b> שלה:</p><div class="lgrid">${[3, 4, 5, 6].map(n => `<div>${prismSVG(n, { hl: 'bases', size: 90 })}<small>${['', '', '', 'מנסרה משולשת', 'מנסרה מרובעת', 'מנסרה מחומשת', 'מנסרה משושה'][n]}</small></div>`).join('')}</div>`),
    card('גם תיבה וקובייה!', `<p><b>תיבה</b> ו<b>קובייה</b> הן מנסרות מרובעות – יש להן שני בסיסים מלבניים/ריבועיים, וכל הפאות הצדדיות מלבנים.</p>${vbox(boxSVG('', '', '', { size: 170, unit: '' }))}<p>ומה <b>לא</b> מנסרה? <b>פירמידה</b> (בסיס אחד וקודקוד), ו<b>גליל</b> (הבסיסים עיגולים – לא מצולעים).</p>${vbox(pyramidSVG(4, { size: 100 }), roundSVG('cyl', { size: 100 }))}`),
    card('איך מזהים מנסרה – 3 בדיקות', `<ol class="lsteps"><li>מוצאים <b>שני בסיסים</b> זהים שנמצאים זה מול זה.</li><li>בודקים שהבסיסים הם <b>מצולעים</b> (צלעות ישרות).</li><li>בודקים שכל הפאות האחרות הן <b>מלבנים</b>.</li></ol><p class="ltip">💡 עברו את שלוש הבדיקות? זו מנסרה!</p>`),
  ],
  struct: [
    card('קדקודים, מקצועות ופאות', `<p><b>קדקוד</b> – נקודה שבה נפגשים מקצועות (הנקודות האדומות).<br><b>מקצוע</b> – קו ישר שבו נפגשות שתי פאות.<br><b>פאה</b> – משטח שטוח של הגוף.</p>${vbox(prismSVG(3, { hl: 'vertices' }))}`),
    card('סופרים במנסרה משולשת', `${vbox(prismSVG(3))}<p><b>קדקודים:</b> 3 למטה + 3 למעלה = <b>6</b><br><b>מקצועות:</b> 3 למטה + 3 למעלה + 3 צדדיים = <b>9</b><br><b>פאות:</b> 3 צדדיות + 2 בסיסים = <b>5</b></p>`),
    card('החוק לכל מנסרה', `<p>אם לבסיס יש <b>n</b> צלעות:</p><div class="lrule">קדקודים = <b><span class="mx" dir="ltr">2n</span></b> · מקצועות = <b><span class="mx" dir="ltr">3n</span></b> · פאות = <b><span class="mx" dir="ltr">n + 2</span></b></div><table class="ltable"><tr><th>מנסרה</th><th>n</th><th>קדקודים</th><th>מקצועות</th><th>פאות</th></tr>${[3, 4, 5, 6, 8].map(n => `<tr><td>${['', '', '', 'משולשת', 'מרובעת', 'מחומשת', 'משושה', '', 'מתומנת'][n]}</td><td>${n}</td><td>${2 * n}</td><td>${3 * n}</td><td>${n + 2}</td></tr>`).join('')}</table>`),
    card('טריקים למבחן', `<ul class="lsteps"><li>מספר המקצועות <b>תמיד מתחלק ב-3</b>. 20 מקצועות? אין מנסרה כזו!</li><li>מספר הקדקודים <b>תמיד זוגי</b>.</li><li>הפוך: 18 מקצועות → ${X('18 : 3 = 6')} → מנסרה משושה.</li><li>בדיקה: קדקודים + פאות − מקצועות = 2.</li></ul>`),
  ],
  net: [
    card('מהי פריסה?', `<p><b>פריסה</b> היא מה שמקבלים כש"פותחים" את הגוף ומשטחים אותו על הדף – כמו קופסת קרטון פתוחה.</p>${vbox(netSVG(3, { top: 1, bot: 1, size: 220 }))}<p class="lnote">פריסה של מנסרה משולשת: 3 מלבנים ו-2 משולשים.</p>`),
    card('ממה בנויה פריסה של מנסרה?', `<p><b>n מלבנים</b> ברצועה (הפאות הצדדיות) + <b>2 בסיסים</b> – <b>אחד מעל</b> הרצועה ו<b>אחד מתחת</b>.</p>${vbox(netSVG(4, { top: 0, bot: 2, size: 160 }), netSVG(6, { top: 2, bot: 4, size: 180 }))}`),
    card('פריסות שגויות – זהירות!', `<ul class="lsteps"><li><b>שני הבסיסים באותו צד</b> – בקיפול הם נופלים זה על זה, ולמטה נשאר חור.</li><li>מספר <b>מלבנים</b> לא נכון – חסרה או מיותרת פאה.</li><li>הבסיסים בצורה הלא נכונה.</li></ul>${vbox(netSVG(4, { top: 0, same: true, size: 170 }))}<p class="lnote">❌ כאן שני הבסיסים למעלה – זו לא פריסה של מנסרה.</p>`),
    card('סוד הרצועה', `<p>אורך הרצועה של המלבנים = <b>ההיקף של הבסיס</b>, והגובה של כל מלבן = <b>הגובה של המנסרה</b>.</p><p class="ltip">💡 במבחן: דמיינו שאתם מקפלים. הרצועה מתגלגלת סביב, ובסיס אחד סוגר מלמעלה ואחד מלמטה.</p>`),
  ],
  vol: [
    card('מה זה נפח?', `<p><b>נפח</b> = כמה מקום הגוף תופס. מודדים אותו בכמה <b>קוביות של 1 סמ"ק</b> נכנסות בו.</p>${vbox(boxSVG(4, 3, 2))}<p>שכבה תחתונה: ${X('4 × 3 = 12')} קוביות. 2 שכבות: ${X('12 × 2 = 24')} סמ"ק.</p>`),
    card('הנוסחה לכל מנסרה', `<div class="lrule">נפח = <b>שטח הבסיס × הגובה</b></div><p>בתיבה: ${X('אורך × רוחב × גובה')}. בקובייה: ${X('צלע × צלע × צלע')}.</p><p>דוגמה: תיבה 5 × 4 × 3 → ${X('5 × 4 = 20')} (שטח בסיס), ${X('20 × 3 = 60')} סמ"ק.</p>`),
    card('מנסרה משולשת', `${vbox(prismSVG(3, { hl: 'bases' }))}<p>בסיס = משולש ישר-זווית עם ניצבים 6 ו-4 ס"מ, גובה המנסרה 10 ס"מ:</p><ol class="lsteps"><li>שטח הבסיס: ${X('6 × 4 : 2 = 12')} סמ"ר</li><li>נפח: ${X('12 × 10 = 120')} סמ"ק</li></ol><p class="ltip">⚠️ לא לשכוח לחלק ב-2 בשטח המשולש!</p>`),
    card('שאלות הפוכות', `<p>אם יודעים את הנפח ואת שטח הבסיס – מוצאים את הגובה בחילוק:</p><div class="lrule">גובה = נפח : שטח בסיס</div><p>דוגמה: נפח 96 סמ"ק, בסיס 8 × 4 = 32 → גובה ${X('96 : 32 = 3')} ס"מ.</p><p class="ltip">💡 יחידות: אורך בס"מ, שטח בסמ"ר, נפח בסמ"ק.</p>`),
  ],
  poly: [
    card('מהו פאון?', `<p><b>פאון</b> הוא גוף שכל הפאות שלו הן <b>מצולעים</b> – משטחים שטוחים עם צלעות ישרות.</p>${vbox(prismSVG(4, { size: 90 }), pyramidSVG(3, { size: 90 }), prismSVG(6, { size: 90 }))}<p class="lnote">קובייה, מנסרות ופירמידות – כולם פאונים.</p>`),
    card('מה לא פאון?', `<p>גופים עם <b>משטח מעוגל</b> אינם פאונים:</p>${vbox(roundSVG('cyl', { size: 90 }), roundSVG('cone', { size: 90 }), roundSVG('sphere', { size: 90 }))}<p class="lnote">גליל, חרוט וכדור – לא פאונים.</p>`),
    card('משפט הזהב', `<div class="lrule">כל מנסרה היא פאון – אך לא כל פאון הוא מנסרה</div><svg class="venn" viewBox="0 0 260 150"><ellipse cx="130" cy="75" rx="124" ry="70" fill="#c4b5fd55" stroke="#7c3aed" stroke-width="3"/><ellipse cx="100" cy="80" rx="62" ry="44" fill="#7dd3fc88" stroke="#0284c7" stroke-width="3"/><text x="100" y="86" text-anchor="middle" font-size="16" font-weight="700" fill="#0c4a6e">מנסרות</text><text x="200" y="40" text-anchor="middle" font-size="16" font-weight="700" fill="#4c1d95">פאונים</text><text x="198" y="96" text-anchor="middle" font-size="13" fill="#4c1d95">פירמידה</text></svg><p>למה? כל הפאות של מנסרה הן מצולעים → היא פאון. אבל <b>פירמידה</b> היא פאון שאינו מנסרה (אין לה שני בסיסים).</p>`),
    card('עובדות מהירות', `<ul class="lsteps"><li>לפאון הקטן ביותר יש <b>4 פאות</b> (פירמידה משולשת).</li><li>למנסרה הקטנה ביותר יש <b>5 פאות</b> (מנסרה משולשת).</li><li>גליל דומה למנסרה – אבל הבסיסים עגולים, ולכן הוא לא מנסרה ולא פאון.</li></ul>`),
  ],
  wxf: [
    card('כפל = חיבור חוזר', `<p>${X(`3 × ${F(2, 5)}`)} זה ${X(`${F(2, 5)} + ${F(2, 5)} + ${F(2, 5)}`)}</p>${vbox(fracBar(2, 5), fracBar(2, 5), fracBar(2, 5))}<p>ביחד: 6 חמישיות = ${X(F(6, 5))} = ${X(M(1, 1, 5))}</p>`),
    card('החוק', `<div class="lrule">שלם × שבר: כופלים את השלם <b>במונה</b>. המכנה לא משתנה.</div><p>${X(`4 × ${F(3, 8)} = ${F(12, 8)}`)}</p><ol class="lsteps"><li>מצמצמים: ${X(`${F(12, 8)} = ${F(3, 2)}`)} (מחלקים מונה ומכנה ב-4)</li><li>הופכים למספר מעורב: ${X(`${F(3, 2)} = ${M(1, 1, 2)}`)}</li></ol>`),
    card('"שבר מ..." = כפל', `<p>כמה זה ${X(F(3, 4))} מ-20?</p><ol class="lsteps"><li>רבע מ-20: ${X('20 : 4 = 5')}</li><li>3 רבעים: ${X('5 × 3 = 15')}</li></ol><p class="ltip">💡 מחלקים במכנה, כופלים במונה.</p>`),
    card('שבר מדומה → מספר מעורב', `<p>${X(F(17, 5))}: כמה פעמים 5 נכנס ב-17? <b>3</b>, ונשארים <b>2</b>.</p><p>${X(`${F(17, 5)} = ${M(3, 2, 5)}`)}</p><p class="ltip">💡 בדיקה מהירה: כפל בשבר שקטן מ-1 תמיד נותן פחות מהשלם.</p>`),
  ],
  wxm: [
    card('שלם × מספר מעורב', `<p>כמה זה ${X(`3 × ${M(2, 1, 4)}`)}? יש <b>שתי דרכים</b> – ושתיהן נכונות.</p>${vbox(fracBar(9, 4, { wholes: 3 }))}<p class="lnote">${M(2, 1, 4)} = שני שלמים ועוד רבע.</p>`),
    card('דרך 1: חוק הפילוג', `<p>כופלים את השלם <b>בכל חלק</b> בנפרד, ומחברים:</p><p>${X(`3 × ${M(2, 1, 4)} = 3 × 2 + 3 × ${F(1, 4)}`)}</p><p>${X(`= 6 + ${F(3, 4)} = ${M(6, 3, 4)}`)}</p>`),
    card('דרך 2: מעבר לשבר', `<ol class="lsteps"><li>הופכים לשבר: ${X(`${M(2, 1, 4)} = ${F(9, 4)}`)} (${X('2 × 4 + 1 = 9')})</li><li>כופלים: ${X(`3 × ${F(9, 4)} = ${F(27, 4)}`)}</li><li>חוזרים למספר מעורב: ${X(`${F(27, 4)} = ${M(6, 3, 4)}`)}</li></ol>`),
    card('בדיקת שכל', `<p>${X(`3 × ${M(2, 1, 4)}`)} חייב להיות בין ${X('3 × 2 = 6')} ל-${X('3 × 3 = 9')}.</p><p>יצא ${M(6, 3, 4)} – הגיוני ✔️</p><p class="ltip">⚠️ הטעות הנפוצה: לכפול רק את השלם (3 × 2) ולשכוח את השבר.</p>`),
  ],
  fdw: [
    card('חלוקה שווה', `<p>${X(`${F(4, 5)} : 2`)} = מחלקים 4 חמישיות בין 2 ילדים.</p>${vbox(fracBar(4, 5))}<p>כל אחד מקבל <b>2 חמישיות</b>: ${X(F(2, 5))}</p><p class="ltip">💡 כשהמונה מתחלק – פשוט מחלקים את המונה.</p>`),
    card('כשהמונה לא מתחלק', `<p>${X(`${F(3, 4)} : 2`)} – 3 לא מתחלק ב-2. אז <b>חוצים כל רבע</b> לשניים: רבעים הופכים לשמיניות!</p>${vbox(fracBar(3, 4), fracBar(6, 8))}<p>${X(`${F(3, 4)} = ${F(6, 8)}`)}, וחצי מזה: ${X(F(3, 8))}</p>`),
    card('החוק', `<div class="lrule">שבר : שלם – אם המונה מתחלק: מחלקים את <b>המונה</b>. אם לא: כופלים את <b>המכנה</b>.</div><p>${X(`${F(6, 7)} : 3 = ${F(2, 7)}`)} · ${X(`${F(3, 4)} : 2 = ${F(3, 8)}`)}</p><p class="ltip">💡 בדיקה: ${X(`${F(3, 8)} × 2 = ${F(6, 8)} = ${F(3, 4)}`)} ✔️</p>`),
    card('מספר מעורב : שלם', `<p>${X(`${M(2, 1, 2)} : 5`)}:</p><ol class="lsteps"><li>הופכים לשבר: ${X(`${M(2, 1, 2)} = ${F(5, 2)}`)}</li><li>מחלקים: ${X(`${F(5, 2)} : 5 = ${F(1, 2)}`)}</li></ol>`),
  ],
  wdf: [
    card('כמה פעמים נכנס?', `<p>${X(`3 : ${F(1, 4)}`)} שואל: <b>כמה רבעים יש ב-3?</b></p>${vbox(fracBar(12, 4, { wholes: 3, col: '#38bdf8' }))}<p>בכל שלם 4 רבעים → ב-3 שלמים: ${X('3 × 4 = 12')}</p>`),
    card('שבר שאינו "אחד חלקי"', `<p>${X(`3 : ${F(3, 4)}`)}: ב-3 יש 12 רבעים. כל ${F(3, 4)} = 3 רבעים.</p><p>כמה קבוצות של 3 ב-12? ${X('12 : 3 = 4')}</p>`),
    card('החוק המקוצר', `<div class="lrule">שלם : שבר = כופלים <b>במכנה</b>, ומחלקים <b>במונה</b></div><p>${X(`5 : ${F(2, 3)} = (5 × 3) : 2 = 15 : 2 = ${M(7, 1, 2)}`)}</p>`),
    card('בדיקה וטריק', `<p>חילוק במספר <b>קטן מ-1</b> תמיד <b>מגדיל</b>! ${X(`6 : ${F(1, 2)} = 12`)}.</p><p class="ltip">💡 בדיקה: ${X(`${M(7, 1, 2)} × ${F(2, 3)} = 5`)} ✔️</p>`),
  ],
};

// ---------- מסכים ----------
function themeCls(ex) { return ex === 'geo' ? 'world-geo' : 'world-frac'; }
const back = () => { stopTimer(); C.home(); };
export function schoolHub() {
  stopTimer(); const p = C.P();
  const cards = Object.entries(EXAMS).map(([ex, E]) => {
    const s = S_(ex), dl = daysLeft(E.date), st = stageOf(s), rev = s.revealed, ready = !rev && isRevealTime(ex);
    const fig = !s.cr ? eggSVG(E.kind === 'walk' ? 'golem' : 'dragon', 0, { size: 110 }) : rev ? creatureSVG(s.cr, s.final, { size: 120 }) : eggSVG(s.cr, overall(s) / 100, { size: 110 });
    return `<button class="sw-card ${themeCls(ex)} ${ready ? 'hatch' : ''}" data-ex="${ex}"><div class="sw-fig">${fig}</div><div class="sw-info"><small>${E.worldG} ${E.world}</small><b>${E.title}: ${E.subject}</b>
      <span>${dateHe(E.date)} · ${dl > 0 ? `עוד <b>${dl}</b> ${dl === 1 ? 'יום' : 'ימים'}` : dl === 0 ? '<b>היום!</b>' : 'המבחן עבר'}</span>
      <span class="sw-bar"><i style="width:${overall(s)}%"></i></span><small>${ready ? '🥚 הביצה מוכנה לבקוע!' : rev ? `${esc(s.cname)} · ${STAGE_NAME[s.final]}` : s.cr ? `מוכנות ${overall(s)}% · בתוך הביצה: ${STAGE_NAME[st]}` : `בחר ${E.partner}`}</small></div></button>`;
  }).join('');
  C.setScreen(`<header class="topbar"><button class="icon-btn" id="bk">‹</button><b>📚 מבחנים בבית הספר</b><span></span></header>
  <main class="school-hub"><p class="lead">עולם נפרד להכנה למבחנים בכיתה – לא משפיע על ההכנה למבחן המחוננים. בכל עולם גדל לך <b>שותף בתוך ביצה</b>: ככל שתתרגל, הוא יתחזק. הוא בוקע ב<b>ערב המבחן בשעה ${C.bossHour()}:00</b> – ואם יגיע לשלב <b>בוגר</b>, יצטרף ל${esc(p.name)} בקרבות!</p>
  <div class="sw-grid">${cards}</div></main>`);
  $('#bk').onclick = back;
  $$('.sw-card').forEach(b => b.onclick = () => world(b.dataset.ex));
}
function chooseCreature(ex) {
  const E = EXAMS[ex], kinds = Object.entries(CREATURES).filter(([, c]) => c.kind === E.kind);
  let pickK = kinds[0][0];
  C.setScreen(`<div class="${themeCls(ex)} world-bg"><header class="topbar"><button class="icon-btn" id="bk">‹</button><b>${E.worldG} ${E.world}</b><span></span></header>
  <main class="choose-cr"><h2>בחר את ה${E.partner} שלך</h2><p class="lead">הוא יגדל בתוך ביצה בזמן שאתה מתכונן ל${E.title} (${dateHe(E.date)}). ככל שתבין טוב יותר את החומר – הוא יהיה חזק יותר.</p>
  <div class="cr-grid">${kinds.map(([k, c]) => `<button class="cr-card ${k === pickK ? 'on' : ''}" data-k="${k}">${creatureSVG(k, 3, { size: 140 })}<b>${c.name}</b><small>${c.desc}</small></button>`).join('')}</div>
  <label class="cr-name">איך תקרא לו? <input id="crn" maxlength="14" placeholder="${kinds[0][1].name}"/></label>
  <button class="btn gold big" id="crgo">🥚 זה השותף שלי!</button></main></div>`);
  $('#bk').onclick = schoolHub;
  $$('.cr-card').forEach(b => b.onclick = () => { pickK = b.dataset.k; $$('.cr-card').forEach(x => x.classList.toggle('on', x === b)); $('#crn').placeholder = CREATURES[pickK].name; });
  $('#crgo').onclick = () => { const s = S_(ex); s.cr = pickK; s.cname = $('#crn').value.trim() || CREATURES[pickK].name; C.save(true); beep('level'); world(ex); };
}
function recommend(ex) {
  const s = S_(ex), E = EXAMS[ex], T = Object.keys(E.topics), dl = daysLeft(E.date);
  const unl = T.find(t => !s.learned[t]);
  if (dl <= 1 && dl >= 0 && !s.mocks.some(m => m.date === today())) return { t: '📝 מבחן דמה', d: 'המבחן ממש קרוב – בוא נבדוק אותך בתנאי מבחן.', fn: () => runQuiz(ex, { mode: 'mock' }) };
  if (unl) return { t: `📖 שיעור: ${E.topics[unl].name}`, d: 'נושא שעוד לא למדת. 4 כרטיסים קצרים ובדיקה.', fn: () => lesson(ex, unl) };
  const weak = T.slice().sort((a, b) => s.m[a] - s.m[b])[0];
  if (s.m[weak] < 75) return { t: `✏️ תרגול: ${E.topics[weak].name}`, d: `הנושא החלש ביותר כרגע (${Math.round(s.m[weak])}%). כל תשובה נכונה מחזקת את ${esc(s.cname)}.`, fn: () => runQuiz(ex, { topic: weak }) };
  return { t: '📝 מבחן דמה', d: 'אתה שולט בכל הנושאים – זמן לבדוק את עצמך כמו במבחן.', fn: () => runQuiz(ex, { mode: 'mock' }) };
}
export function world(ex) {
  const s = S_(ex), E = EXAMS[ex];
  if (!s.cr) return chooseCreature(ex);
  startTimer(ex);
  if (!s.revealed && isRevealTime(ex)) return hatch(ex);
  const st = stageOf(s), o = overall(s), nt = nextTH(s), dl = daysLeft(E.date), rec = recommend(ex);
  const mins = Math.round(Object.values(s.sec).reduce((a, b) => a + b, 0) / 60);
  const fig = s.revealed ? creatureSVG(s.cr, s.final, { size: 170 }) : `<div class="egg-wrap">${eggSVG(s.cr, o / 100, { size: 150 })}<div class="egg-sil" title="מה שגדל בפנים">${st ? creatureSVG(s.cr, st, { size: 84, silhouette: true }) : ''}</div></div>`;
  C.setScreen(`<div class="${themeCls(ex)} world-bg"><header class="topbar"><button class="icon-btn" id="bk">‹</button><b>${E.worldG} ${E.world}</b><span class="stat">⏱️ ${mins}′</span></header>
  <main class="world">
    <section class="w-partner">${fig}<div class="wp-info"><small>${E.title}: ${E.subject} · ${dateHe(E.date)}</small><h2>${esc(s.cname)}</h2>
      <p>${s.revealed ? `בקע בשלב <b>${STAGE_NAME[s.final]}</b>${s.final >= 4 ? ' – ומצטרף לקרבות! ⚔️' : '.'}` : `בתוך הביצה: <b>${STAGE_NAME[st]}</b>${nt ? ` · עוד ${Math.max(1, nt - o)}% לשלב הבא` : ' · השלב הגבוה ביותר!'}`}</p>
      <div class="wp-bar"><i style="width:${o}%"></i>${TH.slice(1).map((t, i) => `<b style="right:${t}%" title="${STAGE_NAME[i + 1]}" class="${o >= t ? 'got' : ''} ${i + 1 === 4 ? 'battle' : ''}"></b>`).join('')}</div>
      <small class="muted">${s.revealed ? '' : dl > 0 ? `בוקע בעוד ${dl} ${dl === 1 ? 'יום' : 'ימים'} – ${dateHe(E.date)} בשעה ${C.bossHour()}:00. ⚔️ = מהשלב הזה הוא מצטרף לקרבות.` : `בוקע היום בשעה ${C.bossHour()}:00!`}</small></div></section>
    <button class="w-rec" id="rec"><span>המלצה להיום</span><b>${rec.t}</b><small>${rec.d}</small></button>
    <section class="w-topics">${Object.entries(E.topics).map(([t, T]) => `<div class="wt-row"><span class="wt-g">${T.g}</span><div class="wt-main"><b>${T.name}</b><span class="wt-bar"><i style="width:${Math.round(s.m[t])}%"></i></span><small>${Math.round(s.m[t])}% שליטה · ${s.n[t]} שאלות${s.n[t] ? ` · ${Math.round(s.ok[t] / s.n[t] * 100)}% נכונות` : ''}</small></div>
      <button class="btn small ${s.learned[t] ? '' : 'gold'}" data-les="${t}">📖 ${s.learned[t] ? 'חזרה' : 'שיעור'}</button><button class="btn small primary" data-pr="${t}">✏️ תרגול</button></div>`).join('')}</section>
    <div class="w-actions"><button class="btn primary" id="mix">🎯 תרגול מעורב</button><button class="btn gold" id="mock">📝 מבחן דמה</button><button class="btn" id="sheet">📋 דף סיכום</button></div>
    ${s.mocks.length ? `<section class="w-mocks"><h4>מבחני דמה</h4>${s.mocks.slice(-5).reverse().map(m => `<div><span>${m.date.split('-').reverse().slice(0, 2).join('.')}</span><b>${m.score}</b></div>`).join('')}</section>` : ''}
  </main></div>`);
  $('#bk').onclick = schoolHub;
  $('#rec').onclick = rec.fn;
  $$('[data-les]').forEach(b => b.onclick = () => lesson(ex, b.dataset.les));
  $$('[data-pr]').forEach(b => b.onclick = () => runQuiz(ex, { topic: b.dataset.pr }));
  $('#mix').onclick = () => runQuiz(ex, {});
  $('#mock').onclick = () => C.mentorPopup(`<b>מבחן דמה</b><br>12 שאלות מכל הנושאים, כמו במבחן בכיתה.<br>אין משוב עד הסוף – בסוף תקבל ציון ותראה הסבר לכל טעות.`, [{ t: 'מתחילים', primary: true, fn: () => runQuiz(ex, { mode: 'mock' }) }, { t: 'לא עכשיו' }]);
  $('#sheet').onclick = () => sheet(ex);
}
function sheet(ex) {
  const html = ex === 'geo'
    ? `<h3>📋 דף סיכום – מנסרות</h3><ul class="lsteps"><li><b>מנסרה:</b> שני בסיסים חופפים ומקבילים (מצולעים), פאות צדדיות מלבנים. השם לפי הבסיס.</li><li><b>בסיס עם n צלעות:</b> קדקודים <span class="mx" dir="ltr">2n</span> · מקצועות <span class="mx" dir="ltr">3n</span> · פאות <span class="mx" dir="ltr">n + 2</span>.</li><li><b>פריסה:</b> n מלבנים ברצועה + 2 בסיסים, אחד מכל צד.</li><li><b>נפח:</b> שטח בסיס × גובה. תיבה: א × ר × ג. משולש ישר-זווית: ניצב × ניצב : 2.</li><li><b>פאון:</b> כל הפאות מצולעים. כל מנסרה היא פאון, אך לא כל פאון הוא מנסרה (פירמידה!).</li></ul>`
    : `<h3>📋 דף סיכום – כפל וחילוק שברים</h3><ul class="lsteps"><li><b>שלם × שבר:</b> שלם × מונה, המכנה נשאר. ${X(`4 × ${F(3, 8)} = ${F(12, 8)} = ${M(1, 1, 2)}`)}</li><li><b>שלם × מעורב:</b> חוק הפילוג ${X(`3 × ${M(2, 1, 4)} = 6 + ${F(3, 4)}`)} או מעבר לשבר ${X(`3 × ${F(9, 4)}`)}.</li><li><b>שבר : שלם:</b> מחלקים את המונה (אם אפשר), אחרת כופלים את המכנה. ${X(`${F(3, 4)} : 2 = ${F(3, 8)}`)}</li><li><b>שלם : שבר:</b> כמה פעמים נכנס? כופלים במכנה ומחלקים במונה. ${X(`5 : ${F(2, 3)} = ${M(7, 1, 2)}`)}</li><li>תמיד: מצמצמים, והופכים שבר מדומה למספר מעורב.</li></ul>`;
  modal(`<div class="sheet">${html}</div>`, { cls: 'wide' });
}
function lesson(ex, t) {
  const L = LESSONS[t], E = EXAMS[ex]; let i = 0;
  const show = () => {
    C.setScreen(`<div class="${themeCls(ex)} world-bg"><header class="topbar"><button class="icon-btn" id="bk">✕</button><b>📖 ${E.topics[t].name}</b><span class="qprog">${i + 1}/${L.length}</span></header>
    <main class="lesson-s"><div class="ls-card"><h2>${L[i].title}</h2>${L[i].body}</div>
    <div class="ls-nav">${i ? '<button class="btn" id="prev">הקודם</button>' : '<span></span>'}<button class="btn primary big" id="next">${i < L.length - 1 ? 'הבא' : 'לבדיקה קצרה ✏️'}</button></div></main></div>`);
    $('#bk').onclick = () => world(ex);
    const pv = $('#prev'); if (pv) pv.onclick = () => { i--; show(); };
    $('#next').onclick = () => { if (i < L.length - 1) { i++; show(); } else { S_(ex).learned[t] = true; C.save(true); runQuiz(ex, { topic: t, n: 4, title: `בדיקה: ${E.topics[t].name}`, mode: 'lesson' }); } };
  };
  show();
}

// ---------- מסך שאלות ----------
function renderQ(q, el) {
  let h = `<div class="qtext">${q.q}</div>`;
  if (q.type === 'mc') h += `<div class="opts ${q.opts.some(o => o.includes('optfig')) ? 'figopts' : ''}">${q.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="ol">${'אבגד'[i]}</span><span class="ot">${o}</span></button>`).join('')}</div>`;
  else if (q.type === 'num') h += `<div class="inrow"><input class="ans-in" inputmode="numeric" dir="ltr" autocomplete="off" placeholder="התשובה"/><button class="btn primary sub">בדיקה</button></div>`;
  else h += `<div class="frin" dir="ltr"><input class="fw" inputmode="numeric" placeholder="שלם" aria-label="שלם"/><span class="frstack"><input class="fn" inputmode="numeric" placeholder="מונה" aria-label="מונה"/><i></i><input class="fd" inputmode="numeric" placeholder="מכנה" aria-label="מכנה"/></span><button class="btn primary sub">בדיקה</button></div><small class="muted">אפשר מספר שלם, שבר, או מספר מעורב (שלם + שבר).</small>`;
  el.innerHTML = h;
}
function readResp(q, el, idx) {
  if (q.type === 'mc') return idx;
  if (q.type === 'num') { const v = $('.ans-in', el).value.trim(); return v === '' ? null : v; }
  const g = c => { const v = $(c, el).value.trim(); return v === '' ? null : +v; };
  const w = g('.fw') ?? 0, n = g('.fn'), d = g('.fd');
  if (n == null && d == null) return $('.fw', el).value.trim() === '' ? null : { w, n: 0, d: 1 };
  if (n == null || !d) return 'bad';
  return { w, n, d };
}
function explainBox(q) {
  return `<div class="explain"><div class="ex-rule"><b>הכלל:</b> ${q.rule || ''}</div><div class="ex-steps"><small>פתרון צעד אחר צעד</small><ol>${(q.steps || []).map(x => `<li>${x}</li>`).join('')}</ol></div>${q.tip ? `<div class="ex-tip"><b>טיפ:</b> ${q.tip}</div>` : ''}</div>`;
}
function runQuiz(ex, { topic = null, mode = 'practice', n, title } = {}) {
  const s = S_(ex), E = EXAMS[ex], T = Object.keys(E.topics);
  const N = n || (mode === 'mock' ? 12 : 10), avoid = new Set(), res = [];
  const pickTopic = i => topic || (mode === 'mock' ? T[i % T.length] : (() => { const w = T.map(t => [t, (100 - s.m[t]) + 15 + Math.random() * 40]); w.sort((a, b) => b[1] - a[1]); return w[0][0]; })());
  const qs = []; const getQ = i => { if (!qs[i]) { const t = pickTopic(i); qs[i] = freshQ(ex, t, mode === 'mock' ? 1 + (i % 3) : diffOf(s.m[t]), mode, avoid); } return qs[i]; };
  const resp = []; let i = 0; const startO = overall(s), startSt = stageOf(s);
  startTimer(ex);
  const show = () => {
    const q = getQ(i); let sel = null, done = false, hintN = 0;
    C.setScreen(`<div class="${themeCls(ex)} world-bg"><div class="quiz school-quiz"><header class="qbar"><button class="icon-btn" id="qx">✕</button><b class="qtitle">${esc(title || (mode === 'mock' ? '📝 מבחן דמה' : topic ? E.topics[topic].name : '🎯 תרגול מעורב'))}</b><span class="qprog">${i + 1}/${N}</span><span class="qpartner" id="qp">${s.revealed ? creatureSVG(s.cr, s.final, { size: 40 }) : eggSVG(s.cr, overall(s) / 100, { size: 36 })}</span></header>
      <div class="dots">${Array.from({ length: N }, (_, k) => `<i class="${k < res.length ? (mode === 'mock' ? 'ans' : res[k].ok ? 'ok' : 'no') : k === i ? 'cur' : ''}"></i>`).join('')}</div>
      <div class="qcard" id="qcard"></div><div class="qtools">${mode !== 'mock' ? '<button class="btn small" id="hint">💡 רמז</button>' : ''}${mode === 'mock' ? `<button class="btn small" id="skipq">${i < N - 1 ? 'הבאה ›' : 'סיום'}</button>` : ''}</div><div id="fb"></div></div></div>`);
    const el = $('#qcard'); renderQ(q, el);
    $('#qx').onclick = () => C.mentorPopup('לצאת? מה שכבר פתרת נשמר ומחזק את השותף.', [{ t: 'כן, לצאת', fn: () => { C.save(true); world(ex); } }, { t: 'להמשיך', primary: true }]);
    const hb = $('#hint'); if (hb) hb.onclick = () => { hintN++; $('#fb').innerHTML = `<div class="hintbox">💡 ${q.hint || 'חשבו על הכלל של הנושא.'}</div>`; };
    const submit = () => {
      if (done) return; const r = readResp(q, el, sel);
      if (r === 'bad') return toast('בשבר צריך גם מונה וגם מכנה');
      if (r == null) return toast('כתבו תשובה');
      const ok = checkAnswer(q, r); resp[i] = r;
      if (mode === 'mock') { res[i] = { q, ok, r }; next(); return; }
      done = true; res.push({ q, ok, r }); learn(s, ex, q, ok, mode); s.qlog[q.key] = (s.qlog[q.key] || '') + mode[0]; C.save();
      el.classList.add('locked'); beep(ok ? 'ok' : 'bad');
      if (q.type === 'mc') $$('.opt', el).forEach(b => { const k = +b.dataset.i; if (k === q.ans) b.classList.add('right'); else if (k === sel) b.classList.add('wrong'); });
      else $$('input', el).forEach(x => { x.disabled = true; x.classList.add(ok ? 'right' : 'wrong'); });
      if (ok && !s.revealed) { const qp = $('#qp'); qp.classList.remove('pulse'); void qp.offsetWidth; qp.classList.add('pulse'); }
      const notSimpl = ok && q.type === 'frac' && r.n > 0 && (r.n >= r.d || gcd(r.n, r.d) > 1);
      $('#fb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}"><div class="fb-head">${ok ? `✔ נכון!${!s.revealed ? ` <span class="xp">+כוח ל${esc(s.cname)}</span>` : ''}` : `✘ התשובה הנכונה: ${answerHTML(q)}`}</div>${ok && notSimpl ? `<p class="muted small">נכון! במבחן כדאי לכתוב בצורה המצומצמת: ${answerHTML(q)}</p>` : ''}${ok ? `<details class="fb-more"><summary>איך פותרים?</summary>${explainBox(q)}</details>` : explainBox(q)}<button class="btn primary big" id="nx">${i < N - 1 ? 'הבאה' : 'סיום'}</button></div>`;
      $('#nx').onclick = next; $('#nx').focus();
    };
    const next = () => { if (i < N - 1) { i++; show(); } else finish(); };
    if (q.type === 'mc') $$('.opt', el).forEach(b => b.onclick = () => { if (done) return; sel = +b.dataset.i; $$('.opt', el).forEach(x => x.classList.toggle('sel', x === b)); beep('click'); submit(); });
    else { $('.sub', el).onclick = submit; $$('input', el).forEach(x => x.onkeydown = e => { if (e.key === 'Enter') submit(); }); setTimeout(() => $('input', el)?.focus(), 60); }
    const sk = $('#skipq'); if (sk) sk.onclick = () => { if (mode === 'mock' && !res[i]) res[i] = { q, ok: false, r: null }; next(); };
  };
  const finish = () => {
    if (mode === 'mock') { res.forEach(x => { learn(s, ex, x.q, x.ok, 'mock'); s.qlog[x.q.key] = (s.qlog[x.q.key] || '') + 'm'; }); }
    const okN = res.filter(x => x && x.ok).length, total = N;
    const score = Math.round(okN / total * 100);
    s.sessions.push({ date: today(), mode, topic, n: total, ok: okN }); if (mode === 'mock') s.mocks.push({ date: today(), score });
    C.save(true);
    const endSt = stageOf(s), endO = overall(s), grew = endSt > startSt;
    if (okN / total >= .8) confetti();
    const wrong = res.filter(x => x && !x.ok);
    C.setScreen(`<div class="${themeCls(ex)} world-bg"><main class="center-screen results school-res"><h2>${mode === 'mock' ? `ציון במבחן הדמה: ${score}` : 'סיימת!'}</h2>
      <div class="sr-partner">${s.revealed ? creatureSVG(s.cr, s.final, { size: 150 }) : `<div class="egg-wrap">${eggSVG(s.cr, endO / 100, { size: 130 })}<div class="egg-sil">${endSt ? creatureSVG(s.cr, endSt, { size: 74, silhouette: true }) : ''}</div></div>`}</div>
      <div class="res-stats"><div><b>${okN}/${total}</b><small>נכונות</small></div><div class="gold"><b>${endO}%</b><small>מוכנות${endO > startO ? ` (▲${endO - startO})` : ''}</small></div></div>
      ${grew ? `<p class="grow">🎉 ${esc(s.cname)} גדל בתוך הביצה לשלב <b>${STAGE_NAME[endSt]}</b>!${endSt === 4 ? ' מעכשיו הוא מספיק חזק כדי להצטרף לקרבות!' : ''}</p>` : !s.revealed ? `<p class="muted">${esc(s.cname)} מתחזק בתוך הביצה...</p>` : ''}
      ${mode === 'mock' && wrong.length ? `<details class="review" open><summary>הטעויות שלך (${wrong.length}) – עם הסבר</summary>${wrong.map(x => `<div class="rv"><div class="rv-q">${x.q.q}</div><div class="rv-a">✔ ${answerHTML(x.q)}</div>${explainBox(x.q)}</div>`).join('')}</details>` : ''}
      <div class="row-btns"><button class="btn" id="again">עוד סבב</button><button class="btn primary big" id="cont">חזרה ל${EXAMS[ex].world}</button></div></main></div>`);
    $('#cont').onclick = () => world(ex);
    $('#again').onclick = () => runQuiz(ex, { topic, mode: mode === 'lesson' ? 'practice' : mode, n: mode === 'lesson' ? 10 : n, title: mode === 'lesson' ? undefined : title });
  };
  show();
}

// ---------- בקיעה ----------
function hatch(ex) {
  const s = S_(ex), E = EXAMS[ex], fin = stageOf(s);
  C.setScreen(`<div class="${themeCls(ex)} world-bg"><main class="hatch-s"><h2>ערב ${E.title}!</h2><p class="lead">הגיע הרגע. הביצה של ${esc(s.cname)} מתחילה לזוז...</p>
    <div class="hatch-stage" id="hs">${eggSVG(s.cr, 1, { size: 220 })}</div><button class="btn gold big" id="crack">🥚 לבקוע!</button></main></div>`);
  $('#crack').onclick = () => {
    $('#crack').disabled = true; const hs = $('#hs'); hs.classList.add('shake'); beep('click');
    setTimeout(() => {
      s.revealed = true; s.final = Math.max(1, fin); s.revealDate = today();
      const p = C.P(); if (s.final >= 4) { p.allies = (p.allies || []).filter(a => a.ex !== ex); p.allies.push({ ex, cr: s.cr, name: s.cname, stage: s.final }); }
      C.save(true); hs.classList.remove('shake'); hs.innerHTML = `<div class="hatch-flash"></div>${creatureSVG(s.cr, s.final, { size: 240 })}`; beep('level'); confetti(); setTimeout(confetti, 600);
      const join = s.final >= 4;
      $('.hatch-s').insertAdjacentHTML('beforeend', `<div class="hatch-msg"><h2>${esc(s.cname)} בקע!</h2><p>שלב: <b>${STAGE_NAME[s.final]}</b> · מוכנות ${overall(s)}%</p>
        <p>${join ? `⚔️ ${esc(s.cname)} חזק מספיק – <b>מעכשיו הוא מצטרף ל${esc(p.name)} בקרבות ובזירה!</b>` : `${esc(s.cname)} עוד קטן מכדי להצטרף לקרבות, אבל הוא שלך – ויחכה לך בעולם ${E.world}. בפעם הבאה – עוד קצת תרגול והוא יגיע לשלב בוגר!`}</p>
        <div class="row-btns"><button class="btn primary big" id="hok">${join ? 'יאללה לקרב!' : 'מעולה'}</button></div></div>`);
      $('#hok').onclick = () => world(ex);
      $('#crack').remove();
    }, 1800);
  };
}

// ---------- לבית ולמסך ההורה ----------
export function homeCardHTML() {
  const p = C.P(); const list = Object.entries(EXAMS).map(([ex, E]) => ({ ex, E, s: S_(ex), dl: daysLeft(E.date) }));
  const hatchReady = list.find(x => !x.s.revealed && x.s.cr && isRevealTime(x.ex));
  const next = list.filter(x => x.dl >= 0 && !x.s.revealed).sort((a, b) => a.dl - b.dl)[0];
  if (!next && !hatchReady) return '';
  const x = hatchReady || next;
  return `<button class="school-card ${themeCls(x.ex)} ${hatchReady ? 'hatch' : ''}" id="schoolbtn"><span class="sc-fig">${x.s.cr ? eggSVG(x.s.cr, overall(x.s) / 100, { size: 58 }) : '📚'}</span><span class="ch-t"><small>📚 מבחנים בבית הספר</small><b>${hatchReady ? `🥚 הביצה של ${esc(x.s.cname)} בוקעת!` : `${x.E.title}: ${x.E.subject}`}</b><small>${hatchReady ? 'בוא לראות מה גדל בפנים' : `${dateHe(x.E.date)} · ${x.dl === 0 ? 'היום!' : `עוד ${x.dl} ${x.dl === 1 ? 'יום' : 'ימים'}`} · מוכנות ${overall(x.s)}%`}</small></span><span class="go">כניסה</span></button>`;
}
export function parentSchoolHTML(p) {
  const sch = p.school || {};
  return Object.entries(EXAMS).map(([ex, E]) => {
    const s = sch[ex]; const dl = daysLeft(E.date);
    if (!s) return `<div class="p-card"><h4>${E.worldG} ${E.title}: ${E.subject}</h4><p class="muted">${dateHe(E.date)} · עוד לא התחיל לתרגל.</p></div>`;
    const T = E.topics, mins = Math.round(Object.values(s.sec || {}).reduce((a, b) => a + b, 0) / 60);
    const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return Math.round((s.sec?.[today(d)] || 0) / 60); });
    const o = Math.round(Object.values(s.m).reduce((a, b) => a + b, 0) / Object.keys(T).length);
    return `<div class="p-card"><h4>${E.worldG} ${E.title}: ${E.subject}</h4><p class="muted small">${dateHe(E.date)} · ${dl > 0 ? `עוד ${dl} ימים` : dl === 0 ? 'היום' : 'המבחן עבר'} · ${mins} דקות תרגול בסך הכול · השבוע: ${last7.reduce((a, b) => a + b, 0)} דק׳</p>
      <div class="ready-row"><div class="ready-num">${o}<small>/100</small></div><div><b>מוכנות למבחן</b><p class="muted small" style="margin:2px 0">ממוצע השליטה בנושאי המבחן. השותף (${s.cr ? (s.cname && s.cname !== CREATURES[s.cr].name ? `${esc(s.cname)} – ${CREATURES[s.cr].name}` : CREATURES[s.cr].name) : 'עוד לא נבחר'}) ${s.revealed ? `בקע בשלב ${STAGE_NAME[s.final]}` : `נמצא בשלב ${STAGE_NAME[stageOfRaw(s)]}`}.</p></div></div>
      <table class="ptable"><tr><th>נושא</th><th>שליטה</th><th>שאלות</th><th>נכונות</th><th>שיעור</th></tr>${Object.entries(T).map(([t, x]) => `<tr><td>${x.g} ${x.name}</td><td><span class="mastery"><i style="width:${Math.round(s.m[t] || 0)}%"></i></span> ${Math.round(s.m[t] || 0)}</td><td>${s.n[t] || 0}</td><td>${s.n[t] ? Math.round(s.ok[t] / s.n[t] * 100) + '%' : '–'}</td><td>${s.learned[t] ? '✔' : '–'}</td></tr>`).join('')}</table>
      ${s.mocks?.length ? `<p><b>מבחני דמה:</b> ${s.mocks.map(m => `${m.date.split('-').reverse().slice(0, 2).join('.')} – <b>${m.score}</b>`).join(' · ')}</p>` : '<p class="muted small">עוד לא נעשה מבחן דמה.</p>'}</div>`;
  }).join('');
}
function stageOfRaw(s) { const v = Object.values(s.m || {}); const o = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; let st = 0; for (let i = 1; i <= 5; i++) if (o >= TH[i]) st = i; return st; }
export function alliesHTML(h, size = 70) { return (h.allies || []).map(a => `<span class="ally ${CREATURES[a.cr]?.kind}">${creatureSVG(a.cr, a.stage, { size })}</span>`).join(''); }
