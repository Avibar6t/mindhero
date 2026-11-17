// MindHero – מסך הורה (תומך בשני הורים)
import * as DB from './store.js?v=23';
import { CHAPTERS, CH_ORDER } from './bank.js?v=23';
import { heroSVG, rankOf } from './hero.js?v=23';
import { $, $$, esc, toast, modal, today, bars, fmtTime, renderQuestion, isCorrect, markResult, answerText, bm, explainHTML } from './ui.js?v=23';
import { ic, moodFace } from './icons.js?v=23';
import { analysisHTML } from './analysis.js?v=23';

const ago = ts => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'עכשיו' : m < 60 ? `לפני ${m} דק׳` : m < 1440 ? `לפני ${Math.round(m / 60)} שע׳` : `לפני ${Math.round(m / 1440)} ימים`; };
const HARD = ['stressed', 'quit', 'frustrated'];



const ACT = { diag: ['radar', 'משימת גילוי'], practice: ['target', 'אימון'], boss: ['boss', 'קרב בוס'], lab: ['flask', 'מעבדת טעויות'], duel: ['duel', 'דו-קרב'], learn: ['bulb', 'בית ספר לגיבורים'], tactic: ['academy', 'אקדמיה – טקטיקות'], sim: ['exam', 'סימולציה'], breath: ['breath', 'נשימת קופסה'] };
const mins = sec => sec >= 60 ? `${Math.round(sec / 60)} דק׳` : sec > 0 ? 'פחות מדקה' : '';
function activityHTML(p, day) {
  const log = p.log || {}; const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return today(d); });
  const list = (log[day] || []).slice().sort((a, b) => a.t - b.t);
  const byKind = {}; list.forEach(a => byKind[a.kind] = (byKind[a.kind] || 0) + a.sec);
  const dayName = d => { const i = days.indexOf(d); return i === 0 ? 'היום' : i === 1 ? 'אתמול' : new Date(d).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' }); };
  const ach = a => { const o = [];
    if (a.kind === 'learn') o.push(a.passed ? `עבר את מבחן השליטה (${a.mastery})` : a.mastery ? `מבחן שליטה ${a.mastery} – עוד לא עבר` : 'באמצע השיעור');
    if (a.kind === 'tactic') o.push(a.done ? 'השלים את השיעור' : 'קרא ולא סיים');
    if (a.kind === 'diag') o.push(a.done ? 'סיים את משימת הגילוי' : 'עצר באמצע – ההתקדמות נשמרה');
    if ((a.kind === 'boss' || a.kind === 'sim') && a.score != null) o.push(`ציון ${a.score}%`);
    if (a.kind === 'sim' && a.empty) o.push(`${a.empty} שאלות ריקות`);
    if (a.combo >= 5) o.push(`קומבו ${a.combo}`);
    if (!a.done && ['practice', 'lab', 'boss', 'duel'].includes(a.kind)) o.push('יצא לפני הסוף');
    return o; };
  return `<div class="p-card"><h4>${ic('clock')} מה עשה ${dayName(day)}</h4>
    <div class="kid-tabs day-tabs">${days.map(d => `<button class="${d === day ? 'on' : ''}" data-day="${d}">${dayName(d)}${log[d]?.length ? ` <small>· ${log[d].length}</small>` : ''}</button>`).join('')}</div>
    ${list.length ? `<div class="act-sum">${Object.entries(byKind).filter(([, v]) => v >= 30).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<span class="stat">${ic(ACT[k]?.[0] || 'star')}${ACT[k]?.[1] || k} · ${mins(v)}</span>`).join('')}</div>
      <div class="act-list">${list.map(a => `<div class="act"><span class="act-time">${new Date(a.t).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span><span class="tile">${ic(ACT[a.kind]?.[0] || 'star')}</span>
        <span class="act-main"><b>${esc(a.kind === 'learn' ? 'שיעור: ' + a.title : a.title || ACT[a.kind]?.[1])}</b><small>${[a.dev ? (a.dev === 'm' ? 'בטלפון' : 'במחשב') : '', mins(a.sec), a.q ? `${a.ok}/${a.q} נכונות (${Math.round(a.ok / a.q * 100)}%)` : '', a.xp ? `<span class="ltrm">+${a.xp} XP</span>` : ''].filter(Boolean).join(' · ')}</small>
        ${ach(a).length ? `<span class="act-ach">${ach(a).map(x => `<i>${esc(x)}</i>`).join('')}</span>` : ''}</span></div>`).join('')}</div>`
      : `<p class="muted">לא נרשמה פעילות ${dayName(day) === 'היום' ? 'היום עד עכשיו' : 'ביום הזה'}.</p>`}
    <p class="muted small">נספר רק זמן פעיל (בלי מסך פתוח ללא פעילות). היומן נשמר לשבועיים.</p></div>`;
}


// ----- גרף התקדמות מיום ליום -----
const readinessOf = ch => Math.round(CH_ORDER.reduce((s, c) => s + (Math.max(1, Math.min(5, ch?.[c] || 1)) - 1) / 4, 0) / CH_ORDER.length * 100);
const pct = lvl => Math.round((Math.max(1, Math.min(5, lvl)) - 1) / 4 * 100);
function progressSeries(p) {
  const h = { ...(p.hist || {}) };
  if (p.diagResult && !h[p.diagResult.date]) { const ch = {}; CH_ORDER.forEach(c => ch[c] = 1.5 + (p.diagResult.per[c] || 0)); h[p.diagResult.date] = { ch, r: readinessOf(ch) }; }
  if (p.diag) { const ch = {}; CH_ORDER.forEach(c => ch[c] = p.ch?.[c]?.lvl || 1); h[today()] = { ch, r: readinessOf(ch) }; }
  return Object.keys(h).sort().map(d => ({ d, r: h[d].r ?? readinessOf(h[d].ch), ch: h[d].ch }));
}
const dlabel = d => { const x = new Date(d); return `${x.getDate()}.${x.getMonth() + 1}`; };
function lineSVG(pts, { color = '#3ee6d2', h = 180, w = 640, ticks = [0, 25, 50, 75, 100], id = '', mini = false } = {}) {
  const padL = mini ? 6 : 34, padR = mini ? 30 : 44, padT = 14, padB = mini ? 8 : 26;
  const X = i => padL + (pts.length < 2 ? (w - padL - padR) / 2 : i * (w - padL - padR) / (pts.length - 1));
  const Y = v => padT + (1 - v / 100) * (h - padT - padB);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(' ');
  const area = `${path} L${X(pts.length - 1).toFixed(1)} ${Y(0)} L${X(0).toFixed(1)} ${Y(0)} Z`;
  const last = pts[pts.length - 1];
  const step = Math.max(1, Math.ceil(pts.length / 8));
  return `<svg class="pchart" viewBox="0 0 ${w} ${h}" dir="ltr" data-chart="${id}" role="img" aria-label="גרף התקדמות">
    ${mini ? '' : ticks.map(t => `<line x1="${padL}" x2="${w - padR}" y1="${Y(t)}" y2="${Y(t)}" stroke="#2c3b78" stroke-width="1" ${t ? 'stroke-dasharray="3 4"' : ''}/><text x="${padL - 8}" y="${Y(t) + 4}" font-size="11" fill="#9aa6d1" text-anchor="end">${t}</text>`).join('')}
    ${mini ? `<line x1="${padL}" x2="${w - padR}" y1="${Y(0)}" y2="${Y(0)}" stroke="#2c3b78"/>` : ''}
    <path d="${area}" fill="${color}" fill-opacity=".10"/>
    <path d="${path}" fill="none" stroke="${color}" stroke-width="${mini ? 2.5 : 2.5}" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.v)}" r="${mini ? 3.5 : 4.5}" fill="${color}" stroke="#141e44" stroke-width="2"/>`).join('')}
    <text x="${X(pts.length - 1) + (mini ? 8 : 10)}" y="${mini ? Math.max(12, Y(last.v) - 6) : Y(last.v) + 4}" font-size="${mini ? 13 : 13}" font-weight="700" fill="#eef2ff">${last.v}</text>
    ${mini ? '' : pts.map((p, i) => i % step === 0 || i === pts.length - 1 ? `<text x="${X(i)}" y="${h - 6}" font-size="11" fill="#9aa6d1" text-anchor="middle">${dlabel(p.d)}</text>` : '').join('')}
    ${pts.map((p, i) => `<rect x="${X(i) - (w - padL - padR) / Math.max(1, pts.length - 1) / 2}" y="0" width="${(w - padL - padR) / Math.max(1, pts.length - 1)}" height="${h}" fill="transparent" data-i="${i}"><title>${dlabel(p.d)}: ${p.v}</title></rect>`).join('')}
  </svg>`;
}
export function progressHTML(p) {
  const S = progressSeries(p);
  if (!p.diag || !S.length) return `<div class="p-card"><h4>${ic('chart')} התקדמות לאורך זמן</h4><p class="muted">הגרף יופיע אחרי שאוריה יסיים את משימת הגילוי – היא נקודת ההתחלה.</p></div>`;
  const now = S[S.length - 1].r, first = S[0].r, prev = S.length > 1 ? S[S.length - 2].r : null;
  const delta = v => v > 0 ? `<b class="up">▲ ${v}</b>` : v < 0 ? `<b class="down">▼ ${-v}</b>` : '<b class="flat">ללא שינוי</b>';
  const minis = CH_ORDER.map(c => { const pts = S.map(x => ({ d: x.d, v: pct(x.ch[c]) })); const dv = pts[pts.length - 1].v - pts[0].v;
    return `<div class="mini-chart" style="--c:${CHAPTERS[c].color}"><div class="mc-h">${ic(c)}<b>${CHAPTERS[c].name}</b><span>${delta(dv)}</span></div>${lineSVG(pts, { color: CHAPTERS[c].color, h: 76, w: window.innerWidth < 700 ? 180 : 240, mini: true })}</div>`; }).join('');
  return `<div class="p-card"><h4>${ic('chart')} התקדמות לאורך זמן</h4>
    <div class="ready-row"><div class="ready-num">${now}<small>/100</small></div><div><b>מדד מוכנות</b><p class="muted small" style="margin:2px 0">ממוצע הרמה בששת פרקי המבחן, בסולם 0–100. נקודת ההתחלה היא משימת הגילוי.</p>
      <div class="ready-deltas"><span>מאז משימת הגילוי: ${delta(now - first)}</span>${prev != null ? `<span>מאז יום האימון הקודם: ${delta(now - prev)}</span>` : ''}</div></div></div>
    <div class="chart-box" id="pc-main">${lineSVG(S.map(x => ({ d: x.d, v: x.r })), { id: 'main', w: window.innerWidth < 700 ? 380 : 640, h: window.innerWidth < 700 ? 200 : 180 })}<div class="chart-tip" hidden></div></div>
    <h4 style="margin-top:16px">לפי פרקים (0–100)</h4><div class="mini-grid">${minis}</div>
    <details class="review"><summary>הצגה כטבלה</summary><table class="ptable"><tr><th>תאריך</th><th>מוכנות</th>${CH_ORDER.map(c => `<th>${CHAPTERS[c].name}</th>`).join('')}</tr>${S.slice().reverse().map(x => `<tr><td>${dlabel(x.d)}</td><td><b>${x.r}</b></td>${CH_ORDER.map(c => `<td>${pct(x.ch[c])}</td>`).join('')}</tr>`).join('')}</table></details>
    <p class="muted small">נקודה נוספת נרשמת בכל יום שבו אוריה מתאמן. רמה בפרק עולה עם תשובות נכונות בשאלות קשות, ויורדת מעט בטעויות – לכן ירידה קטנה אחרי שאלות קשות היא חלק רגיל מהלמידה.</p></div>`;
}
export function bindProgress(el, p) {
  const box = $('#pc-main', el); if (!box) return; const S = progressSeries(p); const tip = $('.chart-tip', box);
  $$('rect[data-i]', box).forEach(r => {
    r.onmouseenter = r.onfocus = () => { const x = S[+r.dataset.i]; tip.hidden = false; tip.innerHTML = `<b>${dlabel(x.d)}</b> · מוכנות ${x.r}<br>${CH_ORDER.map(c => `<span style="--c:${CHAPTERS[c].color}"><i></i>${CHAPTERS[c].name} ${pct(x.ch[c])}</span>`).join('')}`;
      const bb = r.getBoundingClientRect(), pb = box.getBoundingClientRect(); tip.style.left = Math.min(pb.width - 230, Math.max(0, bb.left - pb.left + bb.width / 2 - 115)) + 'px'; };
    r.onmouseleave = () => tip.hidden = true;
  });
}

export async function parentScreen(ctx) {
  const { code, setScreen, back } = ctx;
  let team = ctx.team, me = ctx.me || DB.parentsOf(ctx.team)[0], tab = 'overview', kid = null, actDay = today();
  let players = [], msgs = [], duels = [];
  const load = async () => { [players, msgs, duels] = await Promise.all([DB.listPlayers(code), DB.listMessages(code), DB.listDuels(code)]); team = await DB.getTeam(code) || team; if (!kid && players[0]) kid = players[0].id; };
  await load();
  const parents = () => DB.parentsOf(team);

  const render = () => {
    const unread = msgs.filter(m => m.to === 'parent' && !(m.readBy || {})[me.id] && !m.read).length;
    setScreen(`<header class="topbar"><button class="icon-btn" id="pbk" aria-label="חזרה">${ic('back')}</button><b>${ic('parent')} מסך הורה · ${esc(me.name)}</b><button class="icon-btn" id="pref" aria-label="רענון">${ic('refresh')}</button></header>
    <nav class="ptabs">${[['overview', 'chart', 'סקירה'], ['messages', 'chat', 'הודעות' + (unread ? ` <i class="badge">${unread}</i>` : '')], ['duel', 'duel', 'דו-קרב'], ['settings', 'gear', 'הגדרות']].map(([k, i, t]) => `<button class="${tab === k ? 'on' : ''}" data-t="${k}">${ic(i)}${t}</button>`).join('')}</nav>
    <main class="parent-main" id="pm"></main>`);
    $('#comms-btn').style.display = 'none';
    $('#pbk').onclick = back; $('#pref').onclick = async () => { await load(); render(); toast('הנתונים עודכנו'); };
    $$('.ptabs button').forEach(b => b.onclick = () => { tab = b.dataset.t; render(); });
    ({ overview, messages, duel, settings })[tab]($('#pm'));
  };

  const kidTabs = () => players.length > 1 ? `<div class="kid-tabs">${players.map(p => `<button class="${p.id === kid ? 'on' : ''}" data-k="${p.id}">${esc(p.name)}</button>`).join('')}</div>` : '';
  const bindKid = el => $$('.kid-tabs button', el).forEach(b => b.onclick = () => { kid = b.dataset.k; render(); });

  function overview(el) {
    if (!players.length) { el.innerHTML = `<div class="p-card"><h4>${ic('users')} עוד אין גיבורים בצוות</h4><p>שתפו את קוד הצוות <b dir="ltr">${code}</b> כדי שהילד ייצור גיבור.</p></div>`; return; }
    const p = players.find(x => x.id === kid) || players[0];
    const goal = team.goalMin || 60;
    const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); const k = today(d); return { k, l: String(d.getDate()), v: Math.round((p.days?.[k]?.sec || 0) / 60), mood: p.days?.[k]?.mood, q: p.days?.[k]?.q || 0, ok: p.days?.[k]?.ok || 0 }; });
    const week = days.slice(7); const wMin = week.reduce((s, d) => s + d.v, 0); const wQ = week.reduce((s, d) => s + d.q, 0), wOk = week.reduce((s, d) => s + d.ok, 0);
    const daysGoal = week.filter(d => d.v >= goal).length;
    const chs = CH_ORDER.map(c => ({ c, ...(p.ch?.[c] || { lvl: 2, n: 0, ok: 0, time: 0 }) }));
    const sorted = chs.filter(x => x.n).sort((a, b) => a.lvl - b.lvl);
    const mistakesBy = {}; (p.mistakes || []).forEach(q => mistakesBy[q.ch] = (mistakesBy[q.ch] || 0) + 1);
    const lastDay = Object.keys(p.days || {}).filter(k => p.days[k].sec > 30).sort().pop();
    const sims = (p.records?.sims || []).slice(-5);
    const rec = [];
    if (!p.diag) rec.push(`${esc(p.name)} עוד לא השלים את <b>משימת הגילוי</b>${p.diagState ? ` (${p.diagState.res.length}/18)` : ''}. עד שיסיים, שאר המשחק נעול – כדאי לעודד אותו לסיים.`);
    if (wMin < goal * 3) rec.push(`השבוע ${wMin} דקות אימון. שעה קבועה ביום (למשל אחרי ארוחת הצהריים) עוזרת לבנות הרגל.`);
    else rec.push(`השבוע ${wMin} דקות אימון, ${daysGoal} ימים ביעד. ${daysGoal >= 5 ? 'התמדה מצוינת – שווה לפרגן לו.' : 'כדאי לעודד אותו לשמור על רצף.'}`);
    if (sorted.length >= 2) rec.push(`הפרקים לחיזוק: <b>${CHAPTERS[sorted[0].c].name}</b> ו<b>${CHAPTERS[sorted[1].c].name}</b>. המשימות היומיות כבר מתמקדות בהם.`);
    if (p.diag && !sims.length) rec.push('עוד לא נעשתה סימולציה. מומלץ סימולציה מלאה (90 דקות) במחשב פעם בשבוע.');
    const recent = Object.entries(p.log || {}).filter(([d]) => d >= days[7].k).flatMap(([, l]) => l); const onPhone = recent.filter(a => a.dev === 'm').reduce((t, a) => t + a.sec, 0), onPc = recent.filter(a => a.dev === 'd').reduce((t, a) => t + a.sec, 0);
    if (onPhone > 600 && onPhone > onPc * 3) rec.push(`רוב האימון השבוע היה בטלפון (${Math.round(onPhone / 60)} דק׳, לעומת ${Math.round(onPc / 60)} במחשב). זה מצוין לתרגול יומי, אבל המבחן עצמו נעשה במחשב – כדאי לקבוע לו סימולציה אחת בשבוע במחשב, כדי שיתרגל לעכבר, לגרירה ולמסך המבחן.`);
    const stressDays = days.filter(d => HARD.includes(d.mood)).length;
    if (stressDays >= 2) rec.push(`ב-${stressDays} מהימים האחרונים דווח על לחץ או תסכול. שיחה קצרה יכולה לעזור – המטרה היא היכרות עם המבחן, לא ציון.`);
    el.innerHTML = `${kidTabs()}
      <div class="p-head"><div class="mini-h big">${heroSVG(p)}</div><div><h2>${esc(p.name)}</h2><p>רמה ${p.level} · ${rankOf(p.level)} · רצף ${p.streak || 0} ימים</p><p class="muted">פעילות אחרונה: ${lastDay || 'עדיין אין'}</p></div></div>
      <div class="rec-grid"><div><b>${days[13].v}′</b><small>היום (יעד ${goal}′)</small></div><div><b>${wMin}′</b><small>7 ימים אחרונים</small></div><div><b>${wQ ? Math.round(wOk / wQ * 100) : 0}%</b><small>דיוק השבוע · ${wQ} שאלות</small></div><div><b>${p.records?.bestBoss || 0}%</b><small>שיא בקרב בוס</small></div></div>
      ${progressHTML(p)}
      ${activityHTML(p, actDay)}
      ${analysisHTML(p, ic)}
      ${p.diagResult ? `<div class="p-card"><h4>${ic('radar')} תוצאות משימת הגילוי · ${p.diagResult.date}</h4><p class="muted small" style="margin:0 0 8px">3 שאלות מכל פרק, ברמות קושי עולות. נקודת הפתיחה שלפיה נבנה האימון.</p>${CH_ORDER.map(c => `<div class="mast-row" style="--c:${CHAPTERS[c].color}"><span>${ic(c)} ${CHAPTERS[c].name}</span><span class="mastery big"><i style="width:${(p.diagResult.per[c] || 0) / 3 * 100}%"></i></span><b>${p.diagResult.per[c] || 0}/3</b></div>`).join('')}</div>`
        : p.diagState ? `<div class="p-card"><h4>${ic('radar')} משימת הגילוי בתהליך</h4><p>${esc(p.name)} ענה על ${p.diagState.res.length} מתוך 18 שאלות. שאר המשחק נפתח אחרי שיסיים.</p></div>` : ''}
      <div class="p-card"><h4>${ic('target')} המלצות לשבוע הזה</h4><ul>${rec.map(r => `<li>${r}</li>`).join('')}</ul></div>
      <div class="p-card"><h4>${ic('clock')} דקות אימון ביום</h4>${bars(days.map(d => ({ l: d.l, v: d.v, c: d.v >= goal ? '#4ade80' : '#3ee6d2' })), { goal, h: 130 })}
        <p class="muted small" style="margin:6px 0 0">הקו הצהוב הוא היעד היומי. ירוק = יום שבו היעד הושלם.</p>
        <h4 style="margin-top:14px">מצב רוח מדווח – 7 ימים</h4><div class="mood-row">${days.slice(7).map(d => d.mood ? moodFace(d.mood) : '<span>·</span>').join('')}</div></div>
      <div class="p-card"><h4>${ic('target')} שליטה בפרקי המבחן</h4><table class="ptable"><tr><th>פרק</th><th>רמה 1–5</th><th>דיוק</th><th>זמן לשאלה</th><th>שאלות</th><th>טעויות פתוחות</th></tr>
        ${chs.map(x => `<tr style="--c:${CHAPTERS[x.c].color}"><td>${ic(x.c)} ${CHAPTERS[x.c].name}</td><td><span class="mastery"><i style="width:${x.lvl / 5 * 100}%"></i></span> ${x.lvl.toFixed(1)}</td><td>${x.n ? Math.round(x.ok / x.n * 100) + '%' : '–'}</td><td>${x.n && x.time ? Math.round(x.time / x.n) + ' שנ׳' : '–'}</td><td>${x.n}</td><td>${mistakesBy[x.c] || 0}</td></tr>`).join('')}</table></div>
      ${sims.length ? `<div class="p-card"><h4>${ic('exam')} סימולציות</h4>${sims.map(s => `<div class="sim-row"><span>${s.date}</span><span>${s.mini ? 'מיני' : 'מלאה'}</span><b>${s.score}%</b><span class="muted">${s.empty ? s.empty + ' ללא תשובה' : 'הכל נענה'}</span></div>`).join('')}</div>` : ''}
      <div class="p-card"><h4>${ic('mail')} מילה טובה ל${esc(p.name)}</h4><div class="quick">${['גאה בך!', 'ראיתי שהתאמנת היום – כל הכבוד!', 'אתה בדרך הנכונה, תמשיך ככה', 'דו-קרב איתי הערב?'].map(t => `<button class="btn small" data-q="${esc(t)}">${esc(t)}</button>`).join('')}</div>
        <textarea id="enc" placeholder="או כתבו הודעה משלכם"></textarea><button class="btn primary" id="encsend">${ic('send')} שליחה – תופיע לו במסך הבית</button></div>`;
    bindKid(el);
    $$('[data-day]', el).forEach(b => b.onclick = () => { actDay = b.dataset.day; render(); });
    bindProgress(el, p);
    $$('[data-q]', el).forEach(b => b.onclick = () => $('#enc').value = b.dataset.q);
    $('#encsend').onclick = async () => { const t = $('#enc').value.trim(); if (!t) return toast('כתבו הודעה'); await DB.addMessage(code, { from: me.id, fromName: me.name, to: p.id, kind: 'encourage', text: t }); $('#enc').value = ''; toast('ההודעה נשלחה'); };
  }

  function messages(el) {
    const inbox = msgs.filter(m => m.to === 'parent');
    const sent = msgs.filter(m => parents().some(x => x.id === m.from)).slice(0, 10);
    const kindName = m => m.kind === 'mood' ? 'דיווח סוף יום' : m.kind === 'help' ? 'בקשת עזרה' : 'שיתוף תחושה';
    el.innerHTML = `<h3>הודעות מהגיבורים</h3>${inbox.length ? inbox.map(m => { const replies = msgs.filter(r => r.replyTo === m.id); return `<div class="pmsg ${m.read || (m.readBy || {})[me.id] ? '' : 'unread'} ${HARD.includes(m.mood) ? 'alert' : ''}"><div class="pm-h">${m.mood ? moodFace(m.mood) : ic('chat')}<b>${esc(m.fromName)}</b><small>${kindName(m)}${m.context ? ' · בזמן ' + esc(m.context) : ''} · ${ago(m.ts)}</small></div><div class="pm-t">${esc(m.text)}</div>
      ${replies.map(r => `<div class="inbox-msg"><b>${esc(r.fromName)}:</b> ${esc(r.text)} <small class="muted">${r.read ? '· נקרא' : ''}</small></div>`).join('')}
      <div class="pm-reply"><input placeholder="תשובה ל${esc(m.fromName)}" data-to="${m.from}" data-mid="${m.id}"/><button class="btn small primary" aria-label="שליחה">${ic('send')}</button></div></div>`; }).join('') : '<p class="muted">עדיין אין הודעות. כשהילד ישתף תחושה או יבקש עזרה, זה יופיע כאן.</p>'}
      ${sent.filter(m => !m.replyTo).length ? `<h3>מילים טובות שנשלחו</h3>${sent.filter(m => !m.replyTo).map(m => `<div class="pmsg sent"><small class="muted">${esc(m.fromName)} אל ${esc(players.find(p => p.id === m.to)?.name || '')} · ${ago(m.ts)} · ${m.read ? 'נקרא' : 'טרם נקרא'}</small><div>${esc(m.text)}</div></div>`).join('')}` : ''}`;
    inbox.filter(m => !m.read).forEach(m => DB.markRead(code, m.id));
    $$('.pm-reply button', el).forEach(b => b.onclick = async () => { const inp = b.previousElementSibling; const t = inp.value.trim(); if (!t) return; await DB.addMessage(code, { from: me.id, fromName: me.name, to: inp.dataset.to, kind: 'reply', replyTo: inp.dataset.mid, text: t }); inp.value = ''; toast('התשובה נשלחה'); msgs = await DB.listMessages(code); messages(el); });
  }

  function duel(el) {
    const mine = duels.filter(d => d.from === me.id || d.to === me.id);
    el.innerHTML = `<p class="lead">אתגרו את הגיבור: שניכם פותרים את אותן 8 שאלות מכל הפרקים. מנצח מי שצדק ביותר שאלות; בתיקו – המהיר.</p>
      <div class="opp">${players.map(p => `<button class="opp-b" data-k="${p.id}" data-n="${esc(p.name)}"><span class="mini-h">${heroSVG(p)}</span>לאתגר את ${esc(p.name)}</button>`).join('')}</div>
      <h4>הקרבות שלי</h4>${mine.length ? mine.map(d => { const other = d.from === me.id ? d.to : d.from; const a = d.results?.[me.id], b = d.results?.[other]; const on = d.from === me.id ? d.toName : d.fromName;
        return `<div class="duel-row"><span>מול <b>${esc(on)}</b></span><span>${a ? `אני: ${a.ok}/8 · ${fmtTime(a.t)}` : ''}${b ? ` | ${esc(on)}: ${b.ok}/8 · ${fmtTime(b.t)}` : ` | ${esc(on)} עוד לא שיחק`}</span>${!a ? `<button class="btn small primary" data-play="${d.id}">לשחק</button>` : ''}</div>`; }).join('') : '<p class="muted">עוד אין קרבות.</p>'}`;
    $$('.opp-b', el).forEach(b => b.onclick = async () => {
      const qs = ctx.mixed(8);
      const d = { from: me.id, fromName: me.name, to: b.dataset.k, toName: b.dataset.n, qs };
      d.id = await DB.createDuel(code, d); d.results = {};
      playDuel(d);
    });
    $$('[data-play]', el).forEach(b => b.onclick = () => playDuel(duels.find(d => d.id === b.dataset.play)));
  }

  function playDuel(d) {
    const qs = d.qs; let i = 0, ok = 0; const t0 = Date.now();
    const show = () => {
      setScreen(`<div class="quiz"><header class="qbar"><b class="qtitle">${ic('duel')} דו-קרב מול ${esc(d.from === me.id ? d.toName : d.fromName)}</b><span class="qprog">${i + 1}/8</span></header><div class="dots">${qs.map((_, k) => `<i class="${k < i ? 'ok' : k === i ? 'cur' : ''}"></i>`).join('')}</div><div class="qcard" id="pq"></div><div id="pfb"></div></div>`);
      renderQuestion(qs[i], $('#pq'), { onAnswer: (r, final) => {
        if (!final) return; const good = isCorrect(qs[i], r); if (good) ok++; markResult(qs[i], $('#pq'), r);
        $('#pfb').innerHTML = `<div class="feedback ${good ? 'ok' : 'no'}"><div class="fb-head">${ic(good ? 'check' : 'x')} ${good ? 'נכון' : 'התשובה: ' + answerText(qs[i])}</div><div class="fb-exp">${explainHTML(qs[i])}</div><button class="btn primary big" id="pn">${i < 7 ? 'לשאלה הבאה' : 'סיום'}</button></div>`;
        $('#pn').onclick = async () => { if (i < qs.length - 1) { i++; show(); } else { const t = Math.round((Date.now() - t0) / 1000); await DB.submitDuel(code, d.id, me.id, { ok, t }); toast(`סיימת: ${ok}/8`); await load(); tab = 'duel'; render(); } };
      } });
    };
    show();
  }

  function settings(el) {
    const link = `${location.origin}${location.pathname}?team=${code}`;
    el.innerHTML = `<div class="p-card"><h4>${ic('users')} קוד הצוות</h4><div class="team-code">${code}</div><div class="linkbox" dir="ltr">${esc(link)}</div><button class="btn small" id="cp">העתקת קישור ההצטרפות</button><p class="muted small">ילדים מצטרפים עם הקישור או הקוד ויוצרים גיבור משלהם. מי שרק רוצה לאתגר את הילד – עדיף "אתגר פתוח" ממסך הדו-קרב, בלי קוד צוות.</p></div>
      <div class="p-card"><h4>${ic('parent')} הורים</h4>
        ${parents().map(x => `<div class="parent-row"><input value="${esc(x.name)}" data-pid="${x.id}" class="pname" maxlength="14"/>${x.id === me.id ? '<span class="muted small">(אתם)</span>' : ''}</div>`).join('')}
        ${parents().length < 2 ? `<h4 style="margin-top:14px">הוספת הורה שני</h4><div class="parent-row"><input id="np-name" placeholder="שם (למשל אמא)" maxlength="14"/><input id="np-pin" inputmode="numeric" maxlength="4" placeholder="קוד – 4 ספרות" dir="ltr"/><button class="btn small primary" id="np-add">הוספה</button></div>` : ''}
        <p class="muted small">לכל הורה קוד משלו. שניכם רואים את אותן הודעות, ותשובות מופיעות עם השם של מי שענה.</p></div>
      <div class="p-card"><h4>${ic('users')} גיבורים בצוות</h4>${players.length ? players.map(x => `<div class="duel-row"><span class="mini-h">${heroSVG(x)}</span><span style="flex:1"><b>${esc(x.name)}</b> <small class="muted">רמה ${x.level}</small></span><button class="btn small" data-del="${x.id}">מחיקה</button></div>`).join('') : '<p class="muted">אין גיבורים.</p>'}<p class="muted small">מחיקה היא סופית: הגיבור, הציוד וכל ההתקדמות שלו יימחקו.</p></div>
      <div class="p-card"><h4>${ic('clock')} תאריך המבחן</h4><input type="date" id="exd" value="${team.examDate || ''}"/><p class="muted small">כשיפורסם התאריך – עדכנו כאן, ותופיע לילד ספירה לאחור.</p></div>
      <div class="p-card"><h4>${ic('target')} יעד אימון יומי</h4><select id="goal">${[30, 45, 60, 75, 90].map(m => `<option value="${m}" ${(team.goalMin || 60) === m ? 'selected' : ''}>${m} דקות</option>`).join('')}</select><p class="muted small">רצף הימים נספר בימים שבהם היעד הושלם. נספר רק זמן פעיל – לא מסך פתוח בלי פעילות.</p></div>
      <div class="p-card"><h4>${ic('star')} יעד שבועי</h4><select id="wdays">${[3, 4, 5, 6, 7].map(n => `<option value="${n}" ${(team.weekDays || 5) === n ? 'selected' : ''}>${n} ימים בשבוע</option>`).join('')}</select><p class="muted small">בכמה ימים בשבוע צריך להשלים את היעד היומי כדי לקבל את תיבת השבוע (200 מטבעות ופריט נדיר). יום שהוחמץ לא מאפס את ההתקדמות השבועית.</p></div>
      <div class="p-card"><h4>${ic('boss')} שעת בוס הערב</h4><select id="bhour">${[15, 16, 17, 18, 19, 20].map(h => `<option value="${h}" ${(team.bossHour ?? 18) === h ? 'selected' : ''}>${h}:00 עד ${h + 2}:00</option>`).join('')}</select><p class="muted small">חלון של שעתיים בכל יום שבו מופיע בוס מיוחד. ניסיון אחד בערב; ניצחון מעניק פריט נדיר.</p></div>
      <button class="btn primary big" id="psave">שמירת הגדרות</button>
      <div class="p-card"><h4>${ic('lock')} החלפת קוד ההורה שלי</h4><div class="parent-row"><input id="npin" inputmode="numeric" maxlength="4" placeholder="קוד חדש – 4 ספרות" dir="ltr"/><button class="btn small" id="npinb">עדכון</button></div></div>`;
    $$('[data-del]', el).forEach(b => b.onclick = () => {
      const pl = players.find(x => x.id === b.dataset.del);
      const m = modal(`<h3>למחוק את ${esc(pl.name)}?</h3><p>הגיבור, הציוד וכל ההתקדמות שלו יימחקו לצמיתות. אי אפשר לבטל את זה.</p><div class="row-btns"><button class="btn" id="dno">ביטול</button><button class="btn danger" id="dyes">מחיקה סופית</button></div>`);
      $('#dno', m.el).onclick = m.close;
      $('#dyes', m.el).onclick = async () => { await DB.deletePlayer(code, pl.id); ctx.onDelete?.(pl.id); m.close(); toast(`${pl.name} נמחק`); if (kid === pl.id) kid = null; await load(); tab = 'settings'; render(); };
    });
    const saveParents = async list => { await DB.updateTeam(code, { parents: list }); team.parents = list; };
    $('#cp').onclick = () => { navigator.clipboard?.writeText(link); toast('הקישור הועתק'); };
    $('#psave').onclick = async () => {
      const list = parents().map(x => ({ ...x, name: ($(`.pname[data-pid="${x.id}"]`)?.value.trim()) || x.name }));
      const patch = { examDate: $('#exd').value || null, goalMin: +$('#goal').value, weekDays: +$('#wdays').value, bossHour: +$('#bhour').value, parents: list };
      await DB.updateTeam(code, patch); Object.assign(team, patch); me = list.find(x => x.id === me.id) || me; toast('ההגדרות נשמרו'); render();
    };
    const add = $('#np-add'); if (add) add.onclick = async () => {
      const name = $('#np-name').value.trim(), pin = $('#np-pin').value.trim();
      if (name.length < 2) return toast('כתבו שם להורה השני'); if (!/^\d{4}$/.test(pin)) return toast('הקוד צריך להיות 4 ספרות');
      const h = await DB.sha(pin); if (parents().some(x => x.pinHash === h)) return toast('הקוד הזה כבר בשימוש. בחרו קוד אחר.');
      await saveParents([...parents(), { id: 'parent2', name, pinHash: h }]); toast(`${name} נוסף/ה. הקוד נכנס לתוקף מיד.`); render();
    };
    $('#npinb').onclick = async () => {
      const v = $('#npin').value.trim(); if (!/^\d{4}$/.test(v)) return toast('הקוד צריך להיות 4 ספרות');
      const h = await DB.sha(v); if (parents().some(x => x.id !== me.id && x.pinHash === h)) return toast('הקוד הזה כבר בשימוש. בחרו קוד אחר.');
      await saveParents(parents().map(x => x.id === me.id ? { ...x, pinHash: h } : x)); toast('הקוד עודכן'); $('#npin').value = '';
    };
  }

  render();
}
