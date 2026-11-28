// MindHero – דוח מצב להדפסה / שמירה כ-PDF (עיצוב בהיר, A4)
import { CHAPTERS, CH_ORDER } from './bank.js?v=35';
import { heroSVG, rankOf } from './hero.js?v=35';
import { esc, today } from './ui.js?v=35';
import { moodFace } from './icons.js?v=35';

const MOOD_HE = { great: 'מעולה', ok: 'בסדר', tired: 'עייף', confused: 'לא מבין משהו', frustrated: 'מתוסכל', stressed: 'לחוץ מהמבחן', quit: 'רוצה לוותר' };
const HARD = ['stressed', 'quit', 'frustrated'];
const lvlPct = l => Math.round((Math.max(1, Math.min(5, l || 1)) - 1) / 4 * 100);
const readinessOf = ch => Math.round(CH_ORDER.reduce((s, c) => s + lvlPct(ch?.[c]), 0) / CH_ORDER.length);
const dl = d => { const x = new Date(d); return `${x.getDate()}.${x.getMonth() + 1}`; };
const dayKey = off => { const d = new Date(); d.setDate(d.getDate() + off); return today(d); };
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);

function series(p) {
  const h = { ...(p.hist || {}) };
  if (p.diagResult && !h[p.diagResult.date]) { const ch = {}; CH_ORDER.forEach(c => ch[c] = 1.5 + (p.diagResult.per[c] || 0)); h[p.diagResult.date] = { ch }; }
  if (p.diag) { const ch = {}; CH_ORDER.forEach(c => ch[c] = p.ch?.[c]?.lvl || 1); h[today()] = { ch }; }
  return Object.keys(h).sort().map(d => ({ d, r: h[d].r ?? readinessOf(h[d].ch), ch: h[d].ch }));
}

// גרף קו בהיר
function lineChart(pts, { w = 680, h = 190, color = '#0e7490' } = {}) {
  if (!pts.length) return '<p class="r-muted">עדיין אין נתונים.</p>';
  const pl = 34, pr = 40, pt = 12, pb = 26;
  const X = i => pl + (pts.length < 2 ? (w - pl - pr) / 2 : i * (w - pl - pr) / (pts.length - 1));
  const Y = v => pt + (1 - v / 100) * (h - pt - pb);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(' ');
  const step = Math.max(1, Math.ceil(pts.length / 10)); const last = pts[pts.length - 1];
  return `<svg viewBox="0 0 ${w} ${h}" class="r-chart" dir="ltr">
    ${[0, 25, 50, 75, 100].map(t => `<line x1="${pl}" x2="${w - pr}" y1="${Y(t)}" y2="${Y(t)}" stroke="#d6dbe8" ${t ? 'stroke-dasharray="3 4"' : ''}/><text x="${pl - 7}" y="${Y(t) + 4}" font-size="11" fill="#6b7591" text-anchor="end">${t}</text>`).join('')}
    <path d="${path} L${X(pts.length - 1)} ${Y(0)} L${X(0)} ${Y(0)} Z" fill="${color}" fill-opacity=".08"/>
    <path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
    ${pts.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.v)}" r="4" fill="${color}" stroke="#fff" stroke-width="1.5"/>`).join('')}
    <text x="${X(pts.length - 1) + 8}" y="${Y(last.v) + 4}" font-size="13" font-weight="700" fill="#0e1630">${last.v}</text>
    ${pts.map((p, i) => i % step === 0 || i === pts.length - 1 ? `<text x="${X(i)}" y="${h - 7}" font-size="11" fill="#6b7591" text-anchor="middle">${dl(p.d)}</text>` : '').join('')}
  </svg>`;
}
// גרף עמודות של דקות ביום, עם קו יעד
function minutesChart(days, goal, { w = 680, h = 170 } = {}) {
  const pl = 30, pr = 8, pt = 12, pb = 26; const max = Math.max(goal * 1.2, ...days.map(d => d.v), 10);
  const bw = (w - pl - pr) / days.length; const Y = v => pt + (1 - v / max) * (h - pt - pb);
  return `<svg viewBox="0 0 ${w} ${h}" class="r-chart" dir="ltr">
    ${[0, Math.round(max / 2), Math.round(max)].map(t => `<text x="${pl - 6}" y="${Y(t) + 4}" font-size="10" fill="#6b7591" text-anchor="end">${t}</text>`).join('')}
    <line x1="${pl}" x2="${w - pr}" y1="${Y(0)}" y2="${Y(0)}" stroke="#c7cddc"/>
    ${days.map((d, i) => { const x = pl + i * bw + bw * .18; if (d.off && !d.v) d = { ...d, v: Math.max(4, max * .08) }; const bh = Y(0) - Y(d.v);
      return `<rect x="${x}" y="${Y(d.v)}" width="${bw * .64}" height="${Math.max(0, bh)}" rx="3" fill="${d.off ? '#7dd3fc' : d.v >= goal ? '#16a34a' : '#0e7490'}"/>
      ${d.off ? `<text x="${x + bw * .32}" y="${Y(d.v) - 4}" font-size="10" fill="#0369a1" text-anchor="middle">חופש</text>` : d.v ? `<text x="${x + bw * .32}" y="${Y(d.v) - 4}" font-size="10" fill="#0e1630" text-anchor="middle">${d.v}</text>` : ''}
      <text x="${x + bw * .32}" y="${h - 8}" font-size="10" fill="#6b7591" text-anchor="middle">${dl(d.k)}</text>`; }).join('')}
    <line x1="${pl}" x2="${w - pr}" y1="${Y(goal)}" y2="${Y(goal)}" stroke="#d97706" stroke-width="1.5" stroke-dasharray="5 4"/>
    <text x="${pl + 4}" y="${Y(goal) - 4}" font-size="10" fill="#d97706" text-anchor="start">יעד: ${goal} דק׳</text>
  </svg>`;
}

export function reportHTML(p, team) {
  const goal = team?.goalMin || 60;
  const S = series(p); const now = S.length ? S[S.length - 1].r : null, first = S.length ? S[0].r : null;
  const days14 = Array.from({ length: 14 }, (_, i) => { const k = dayKey(i - 13); const x = p.days?.[k] || {}; return { k, v: Math.round((x.sec || 0) / 60), q: x.q || 0, ok: x.ok || 0, goal: !!x.goal, off: !!x.off, mood: x.mood }; });
  const w7 = days14.slice(7), w30 = Array.from({ length: 30 }, (_, i) => p.days?.[dayKey(i - 29)] || {});
  const min7 = w7.reduce((s, d) => s + d.v, 0), min30 = Math.round(w30.reduce((s, d) => s + (d.sec || 0), 0) / 60);
  const q7 = w7.reduce((s, d) => s + d.q, 0), ok7 = w7.reduce((s, d) => s + d.ok, 0);
  const goalDays7 = w7.filter(d => d.goal).length;
  const exam = team?.examDate ? daysBetween(today(), team.examDate) : null;
  const chs = CH_ORDER.map(c => { const x = p.ch?.[c] || { lvl: 1, n: 0, ok: 0, time: 0 }; const start = p.diagResult ? lvlPct(1.5 + (p.diagResult.per[c] || 0)) : null; return { c, ...x, pct: lvlPct(x.lvl), start }; });
  const mistakesBy = {}; (p.mistakes || []).forEach(q => mistakesBy[q.ch] = (mistakesBy[q.ch] || 0) + 1);
  const practiced = chs.filter(x => x.n), weak = practiced.slice().sort((a, b) => a.lvl - b.lvl).slice(0, 2), strong = practiced.slice().sort((a, b) => b.lvl - a.lvl).slice(0, 2);
  const sims = (p.records?.sims || []).slice(-8).reverse();
  const moods = days14.filter(d => d.mood);
  const recent = Object.entries(p.log || {}).filter(([d]) => d >= w7[0].k).flatMap(([, l]) => l);
  const onPhone = Math.round(recent.filter(a => a.dev === 'm').reduce((t, a) => t + a.sec, 0) / 60), onPc = Math.round(recent.filter(a => a.dev === 'd').reduce((t, a) => t + a.sec, 0) / 60);
  const totQ = p.records?.totalQ || 0, totOk = p.records?.totalOk || 0;

  const rec = [];
  if (!p.diag) rec.push(`משימת הגילוי עדיין לא הושלמה${p.diagState ? ` (${p.diagState.res.length}/18)` : ''}. עד שתושלם, שאר המשחק נעול.`);
  rec.push(min7 >= goal * 5 ? `השבוע ${min7} דקות אימון ו-${goalDays7} ימים ביעד – התמדה טובה.` : `השבוע ${min7} דקות אימון בלבד (${goalDays7} ימים ביעד). שעה קבועה ביום עוזרת לבנות הרגל.`);
  if (weak.length) rec.push(`פרקים לחיזוק: ${weak.map(x => CHAPTERS[x.c].name).join(' ו')}. המשימות היומיות כבר מתמקדות בהם.`);
  if (strong.length && strong[0].lvl >= 3) rec.push(`נקודות חוזק: ${strong.map(x => CHAPTERS[x.c].name).join(' ו')}.`);
  if (p.diag && !sims.length) rec.push('עוד לא נעשתה סימולציה. מומלץ לעשות סימולציה מלאה של 90 דקות במחשב פעם בשבוע.');
  if (onPhone > 10 && onPhone > onPc * 3) rec.push(`רוב האימון השבוע היה בטלפון (${onPhone} דק׳ לעומת ${onPc} במחשב). המבחן נעשה במחשב, ולכן כדאי לשלב סימולציה במחשב.`);
  const hard = moods.filter(d => HARD.includes(d.mood)).length;
  if (hard >= 2) rec.push(`ב-${hard} מהימים האחרונים דווח על לחץ או תסכול. שיחה קצרה יכולה לעזור – המטרה היא היכרות עם המבחן, לא ציון.`);

  const delta = (a, b) => a == null || b == null ? '–' : a - b > 0 ? `<b class="r-up">▲ ${a - b}</b>` : a - b < 0 ? `<b class="r-down">▼ ${b - a}</b>` : '0';
  return `<div class="r-page">
  <header class="r-head">
    <div class="r-logo"><b>Mind</b><b>Hero</b></div>
    <div class="r-title"><h1>דוח התקדמות – ${esc(p.name)}</h1><p>הכנה למבחן הקבלה לתוכניות למחוננים · הופק ב-${dl(today())}.${new Date().getFullYear()}${exam != null && exam >= 0 ? ` · עוד <b>${exam}</b> ימים למבחן` : ''}</p></div>
    <div class="r-hero">${heroSVG(p)}</div>
  </header>

  <section class="r-kpis">
    <div><b>${now ?? '–'}</b><small>מדד מוכנות (0–100)</small><em>${p.diagResult ? 'מאז הגילוי: ' + delta(now, first) : ''}</em></div>
    <div><b>${min7}′</b><small>דקות אימון ב-7 ימים</small><em>${min30}′ ב-30 ימים</em></div>
    <div><b>${goalDays7}/7</b><small>ימים ביעד השבוע</small><em>רצף נוכחי: ${p.streak || 0} ימים</em></div>
    <div><b>${q7 ? Math.round(ok7 / q7 * 100) + '%' : '–'}</b><small>דיוק ב-7 ימים</small><em>${q7} שאלות</em></div>
    <div><b>${p.level}</b><small>רמת גיבור · ${rankOf(p.level)}</small><em>${totQ} שאלות בסך הכול${totQ ? ` · ${Math.round(totOk / totQ * 100)}% נכונות` : ''}</em></div>
  </section>

  <section class="r-sec"><h2>מדד המוכנות לאורך זמן</h2>
    <p class="r-muted">ממוצע הרמה בששת פרקי המבחן, בסולם 0–100. הנקודה הראשונה היא משימת הגילוי; נקודה נוספת נרשמת בכל יום אימון.</p>
    ${lineChart(S.map(x => ({ d: x.d, v: x.r })))}
  </section>

  <section class="r-sec r-avoid"><h2>מצב לפי פרקי המבחן</h2>
    <table class="r-table"><thead><tr><th>פרק</th><th>רמה</th><th>מוכנות</th><th>שינוי מהגילוי</th><th>דיוק</th><th>זמן לשאלה</th><th>שאלות</th><th>טעויות פתוחות</th></tr></thead><tbody>
    ${chs.map(x => `<tr><td><i class="r-dot" style="background:${CHAPTERS[x.c].color}"></i>${CHAPTERS[x.c].name}</td><td>${(x.lvl || 1).toFixed(1)} / 5</td><td><span class="r-bar"><i style="width:${x.pct}%;background:${CHAPTERS[x.c].color}"></i></span> ${x.pct}</td><td>${delta(x.pct, x.start)}</td><td>${x.n ? Math.round(x.ok / x.n * 100) + '%' : '–'}</td><td>${x.n && x.time ? Math.round(x.time / x.n) + ' שנ׳' : '–'}</td><td>${x.n}</td><td>${mistakesBy[x.c] || 0}</td></tr>`).join('')}
    </tbody></table>
  </section>

  <section class="r-sec r-avoid"><h2>דקות אימון – 14 הימים האחרונים</h2>
    ${minutesChart(days14, goal)}
    <p class="r-muted r-legend"><i style="background:#16a34a"></i>יום שבו היעד הושלם <i style="background:#0e7490"></i>יום אימון <i style="background:#7dd3fc"></i>יום חופש (פרס על 7 ימים ברצף)</p>
  </section>

  ${p.diagResult ? `<section class="r-sec r-avoid"><h2>משימת הגילוי (${dl(p.diagResult.date)})</h2>
    <p class="r-muted">3 שאלות מכל פרק ברמות קושי עולות – נקודת הפתיחה שלפיה נבנה האימון.</p>
    <div class="r-diag">${CH_ORDER.map(c => `<div><span>${CHAPTERS[c].name}</span><b>${p.diagResult.per[c] || 0}/3</b></div>`).join('')}</div></section>` : ''}

  ${sims.length ? `<section class="r-sec r-avoid"><h2>סימולציות</h2><table class="r-table"><thead><tr><th>תאריך</th><th>סוג</th><th>ציון</th><th>שאלות ללא תשובה</th></tr></thead><tbody>
    ${sims.map(s => `<tr><td>${dl(s.date)}</td><td>${s.mini ? 'מיני (30 דק׳)' : 'מלאה (90 דק׳)'}</td><td><b>${s.score}%</b></td><td>${s.empty || 0}</td></tr>`).join('')}</tbody></table></section>` : ''}

  ${moods.length ? `<section class="r-sec r-avoid"><h2>מצב רוח מדווח</h2><div class="r-moods">${moods.map(d => `<div>${moodFace(d.mood)}<small>${dl(d.k)}</small><span>${MOOD_HE[d.mood] || ''}</span></div>`).join('')}</div></section>` : ''}

  <section class="r-sec r-avoid r-recs"><h2>סיכום והמלצות</h2><ul>${rec.map(r => `<li>${r}</li>`).join('')}</ul></section>

  <footer class="r-foot">הופק ממערכת MindHero · ${dl(today())}.${new Date().getFullYear()} · הנתונים מבוססים על פעילות האימון במערכת ואינם תחליף להערכה מקצועית.</footer>
  </div>`;
}

// פותח את הדוח על המסך (עם כפתורי הדפסה/סגירה) – "שמירה כ-PDF" נעשית מחלון ההדפסה
export function openReport(p, team) {
  document.getElementById('print-report')?.remove();
  const box = document.createElement('div'); box.id = 'print-report';
  box.innerHTML = `<div class="r-toolbar"><button class="btn primary" id="rprint">שמירה כ-PDF / הדפסה</button><button class="btn" id="rclose">סגירה</button>
    <small>בחלון שייפתח בחרו "שמירה כ-PDF" (במחשב: יעד ← שמירה כ-PDF · באייפון: שיתוף ← שמירה בקבצים).</small></div>${reportHTML(p, team)}`;
  document.body.appendChild(box); document.body.classList.add('report-open'); window.scrollTo(0, 0);
  const close = () => { box.remove(); document.body.classList.remove('report-open'); };
  box.querySelector('#rclose').onclick = close;
  box.querySelector('#rprint').onclick = () => {
    const old = document.title; document.title = `MindHero - דוח התקדמות - ${p.name} - ${today()}`;
    window.print(); setTimeout(() => document.title = old, 1000);
  };
}
