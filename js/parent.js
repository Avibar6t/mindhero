// MindHero – מסך הורה
import * as DB from './store.js?v=7';
import { CHAPTERS, CH_ORDER } from './bank.js?v=7';
import { heroSVG, rankOf } from './hero.js?v=7';
import { $, $$, esc, toast, today, bars, fmtTime, renderQuestion, isCorrect, markResult, answerText } from './ui.js?v=7';

const MOOD_E = { great: '😄', ok: '🙂', tired: '😴', confused: '😕', frustrated: '😤', stressed: '😰', quit: '🏳️' };
const ago = ts => { const m = Math.round((Date.now() - ts) / 60000); return m < 60 ? `לפני ${m} דק׳` : m < 1440 ? `לפני ${Math.round(m / 60)} שעות` : `לפני ${Math.round(m / 1440)} ימים`; };

export async function parentScreen(ctx) {
  const { app, code, setScreen, back } = ctx;
  let team = ctx.team, tab = 'overview', kid = null;
  let players = [], msgs = [], duels = [];
  const load = async () => { [players, msgs, duels] = await Promise.all([DB.listPlayers(code), DB.listMessages(code), DB.listDuels(code)]); team = await DB.getTeam(code) || team; if (!kid && players[0]) kid = players[0].id; };
  await load();

  const render = () => {
    const unread = msgs.filter(m => m.to === 'parent' && !m.read).length;
    setScreen(`<header class="topbar parent"><button class="icon-btn" id="pbk">→</button><b>👨‍👦 מסך הורה</b><button class="icon-btn" id="pref" title="רענון">🔄</button></header>
    <nav class="ptabs">${[['overview', '📊 סקירה'], ['messages', `💬 הודעות${unread ? ` <i class="badge">${unread}</i>` : ''}`], ['duel', '⚔️ דו-קרב'], ['settings', '⚙️ הגדרות']].map(([k, t]) => `<button class="${tab === k ? 'on' : ''}" data-t="${k}">${t}</button>`).join('')}</nav>
    <main class="parent-main" id="pm"></main>`);
    $('#comms-btn').style.display = 'none';
    $('#pbk').onclick = back; $('#pref').onclick = async () => { await load(); render(); toast('עודכן'); };
    $$('.ptabs button').forEach(b => b.onclick = () => { tab = b.dataset.t; render(); });
    ({ overview, messages, duel, settings })[tab]($('#pm'));
  };

  const kidTabs = () => players.length > 1 ? `<div class="kid-tabs">${players.map(p => `<button class="${p.id === kid ? 'on' : ''}" data-k="${p.id}">${esc(p.name)}</button>`).join('')}</div>` : '';
  const bindKid = el => $$('.kid-tabs button', el).forEach(b => b.onclick = () => { kid = b.dataset.k; render(); });

  function overview(el) {
    if (!players.length) { el.innerHTML = `<p class="muted">עוד אין גיבורים בצוות. שתפו את קוד הצוות <b dir="ltr">${code}</b> כדי להתחיל.</p>`; return; }
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
    let rec = [];
    if (!p.diag) rec.push(`${esc(p.name)} עוד לא השלים את <b>משימת הגילוי</b>. אחריה המערכת תדע מאיפה להתחיל איתו.`);
    if (wMin < goal * 3) rec.push(`השבוע ${wMin} דקות אימון. כדאי לקבוע יחד שעה קבועה ביום (למשל אחרי ארוחת צהריים).`);
    else rec.push(`השבוע ${wMin} דקות אימון, ${daysGoal} ימים עמד ביעד. ${daysGoal >= 5 ? 'התמדה מעולה – שווה לפרגן לו! 👏' : 'כדאי לעודד אותו לשמור על רצף.'}`);
    if (sorted.length >= 2) rec.push(`הפרקים שכדאי לחזק: <b>${CHAPTERS[sorted[0].c].name}</b> ו<b>${CHAPTERS[sorted[1].c].name}</b>. המשימות היומיות כבר מתמקדות בהם אוטומטית.`);
    if (p.diag && !sims.length) rec.push('עוד לא נעשתה סימולציה. מומלץ סימולציה מלאה (90 דק׳) במחשב פעם בשבוע, למשל בשישי.');
    const stressDays = days.filter(d => ['stressed', 'quit', 'frustrated'].includes(d.mood)).length;
    if (stressDays >= 2) rec.push(`ב-${stressDays} מהימים האחרונים הוא דיווח על לחץ/תסכול. כדאי שיחה קצרה – ולהזכיר שהמטרה היא היכרות עם המבחן, לא ציון.`);
    el.innerHTML = `${kidTabs()}
      <div class="p-head"><div class="mini-h big">${heroSVG(p)}</div><div><h2>${esc(p.name)}</h2><p>רמה ${p.level} · ${rankOf(p.level)} · 🔥 רצף ${p.streak || 0} · 🪙 ${p.coins}</p><p class="muted">פעילות אחרונה: ${lastDay || '—'}</p></div></div>
      <div class="rec-grid"><div><b>${days[13].v}′</b><small>היום (יעד ${goal}′)</small></div><div><b>${wMin}′</b><small>7 ימים אחרונים</small></div><div><b>${wQ ? Math.round(wOk / wQ * 100) : 0}%</b><small>דיוק השבוע (${wQ} שאלות)</small></div><div><b>${p.records?.bestBoss || 0}%</b><small>שיא קרב בוס</small></div></div>
      <div class="p-card rec"><h4>🧭 תובנות והמלצות</h4><ul>${rec.map(r => `<li>${r}</li>`).join('')}</ul></div>
      <div class="p-card"><h4>דקות אימון ביום (הקו הצהוב = היעד)</h4>${bars(days.map(d => ({ l: d.l, v: d.v, c: d.v >= goal ? '#4ade80' : '#22d3ee' })), { goal, h: 130 })}
        <div class="mood-row">${days.slice(7).map(d => `<span title="${d.k}">${d.mood ? MOOD_E[d.mood] : '·'}</span>`).join('')}</div><small class="muted">מצב רוח מדווח – 7 ימים אחרונים</small></div>
      <div class="p-card"><h4>שליטה בפרקי המבחן</h4><table class="ptable"><tr><th>פרק</th><th>רמה (1–5)</th><th>דיוק</th><th>זמן ממוצע</th><th>שאלות</th><th>טעויות פתוחות</th></tr>
        ${chs.map(x => `<tr><td>${CHAPTERS[x.c].icon} ${CHAPTERS[x.c].name}</td><td><span class="mastery"><i style="width:${x.lvl / 5 * 100}%;background:${CHAPTERS[x.c].color}"></i></span> ${x.lvl.toFixed(1)}</td><td>${x.n ? Math.round(x.ok / x.n * 100) + '%' : '–'}</td><td>${x.n && x.time ? Math.round(x.time / x.n) + ' שנ׳' : '–'}</td><td>${x.n}</td><td>${mistakesBy[x.c] || 0}</td></tr>`).join('')}</table></div>
      ${sims.length ? `<div class="p-card"><h4>סימולציות</h4>${sims.map(s => `<div class="sim-row"><span>${s.date}</span><span>${s.mini ? 'מיני' : 'מלאה'}</span><b>${s.score}%</b><span class="muted">${s.empty ? s.empty + ' ריקות' : ''}</span></div>`).join('')}</div>` : ''}
      <div class="p-card"><h4>💌 שליחת מילה טובה ל${esc(p.name)}</h4><div class="quick">${['גאה בך! 💪', 'ראיתי שהתאמנת היום – כל הכבוד!', 'אתה בדרך הנכונה, תמשיך ככה 🔥', 'מה דעתך על דו-קרב איתי הערב? ⚔️'].map(t => `<button class="btn small" data-q="${esc(t)}">${esc(t)}</button>`).join('')}</div>
        <textarea id="enc" placeholder="או כתבו הודעה משלכם"></textarea><button class="btn primary" id="encsend">שליחה – תופיע לו בבסיס</button></div>`;
    bindKid(el);
    $$('.quick button', el).forEach(b => b.onclick = () => $('#enc').value = b.dataset.q);
    $('#encsend').onclick = async () => { const t = $('#enc').value.trim(); if (!t) return toast('כתבו הודעה'); await DB.addMessage(code, { from: 'parent', fromName: team.parentName || 'אבא', to: p.id, kind: 'encourage', text: t }); $('#enc').value = ''; toast('נשלח! 💌'); };
  }

  function messages(el) {
    const inbox = msgs.filter(m => m.to === 'parent');
    const sent = msgs.filter(m => m.from === 'parent').slice(0, 10);
    el.innerHTML = `<h3>הודעות מהגיבורים</h3>${inbox.length ? inbox.map(m => `<div class="pmsg ${m.read ? '' : 'unread'} ${['stressed', 'quit', 'frustrated'].includes(m.mood) ? 'alert' : ''}"><div class="pm-h"><b>${esc(m.fromName)}</b> · ${m.kind === 'mood' ? 'דיווח סוף יום' : m.kind === 'help' ? 'בקשת עזרה' : 'שיתוף תחושה'}${m.context ? ' · בזמן ' + esc(m.context) : ''} <small>${ago(m.ts)}</small></div><div class="pm-t">${esc(m.text)}</div>
      <div class="pm-reply"><input placeholder="תשובה ל${esc(m.fromName)}..." data-to="${m.from}" data-n="${esc(m.fromName)}"/><button class="btn small primary" data-r="${m.id}">שליחה</button></div></div>`).join('') : '<p class="muted">אין הודעות עדיין.</p>'}
      ${sent.length ? `<h3>נשלחו לאחרונה</h3>${sent.map(m => `<div class="pmsg sent"><small>אל ${esc(players.find(p => p.id === m.to)?.name || '')} · ${ago(m.ts)} · ${m.read ? '✓ נקרא' : 'טרם נקרא'}</small><div>${esc(m.text)}</div></div>`).join('')}` : ''}`;
    inbox.filter(m => !m.read).forEach(m => DB.markRead(code, m.id));
    $$('.pm-reply button', el).forEach(b => b.onclick = async () => { const inp = b.previousElementSibling; const t = inp.value.trim(); if (!t) return; await DB.addMessage(code, { from: 'parent', fromName: team.parentName || 'אבא', to: inp.dataset.to, kind: 'reply', text: t }); inp.value = ''; toast('נשלח 💌'); msgs = await DB.listMessages(code); });
  }

  function duel(el) {
    const mine = duels.filter(d => d.from === 'parent' || d.to === 'parent');
    el.innerHTML = `<p>אתגרו את הגיבור לדו-קרב: שניכם פותרים את אותן 8 שאלות מכל הפרקים. מנצח מי שצודק יותר (בתיקו – המהיר). 😉</p>
      <div class="opp">${players.map(p => `<button class="opp-b" data-k="${p.id}" data-n="${esc(p.name)}"><span class="mini-h">${heroSVG(p)}</span>אתגר את ${esc(p.name)}</button>`).join('')}</div>
      <h4>הקרבות שלי</h4>${mine.length ? mine.map(d => { const other = d.from === 'parent' ? d.to : d.from; const me = d.results?.parent, them = d.results?.[other]; const on = d.from === 'parent' ? d.toName : d.fromName;
        return `<div class="duel-row"><span>⚔️ מול <b>${esc(on)}</b></span><span>${me ? `אני: ${me.ok}/8 · ${fmtTime(me.t)}` : ''}${them ? ` | ${esc(on)}: ${them.ok}/8 · ${fmtTime(them.t)}` : ` | ${esc(on)} עוד לא שיחק`}</span>${!me ? `<button class="btn small primary" data-play="${d.id}">לשחק</button>` : ''}</div>`; }).join('') : '<p class="muted">עוד אין קרבות.</p>'}`;
    $$('.opp-b', el).forEach(b => b.onclick = async () => {
      const qs = ctx.mixed(8);
      const d = { from: 'parent', fromName: team.parentName || 'אבא', to: b.dataset.k, toName: b.dataset.n, qs };
      d.id = await DB.createDuel(code, d); d.results = {};
      playDuel(d);
    });
    $$('[data-play]', el).forEach(b => b.onclick = () => playDuel(duels.find(d => d.id === b.dataset.play)));
  }

  function playDuel(d) {
    const qs = d.qs; let i = 0, ok = 0; const t0 = Date.now();
    const show = () => {
      setScreen(`<header class="topbar"><span></span><b>⚔️ דו-קרב · ${i + 1}/8</b><span></span></header><main class="quiz"><div class="qcard" id="pq"></div><div id="pfb"></div></main>`);
      renderQuestion(qs[i], $('#pq'), { onAnswer: (r, final) => {
        if (!final) return; const good = isCorrect(qs[i], r); if (good) ok++; markResult(qs[i], $('#pq'), r);
        $('#pfb').innerHTML = `<div class="feedback ${good ? 'ok' : 'no'}"><div class="fb-head">${good ? '✅ נכון' : '❌ התשובה: ' + answerText(qs[i])}</div><button class="btn primary big" id="pn">${i < 7 ? 'הבא ←' : 'סיום'}</button></div>`;
        $('#pn').onclick = async () => { if (i < qs.length - 1) { i++; show(); } else { const t = Math.round((Date.now() - t0) / 1000); await DB.submitDuel(code, d.id, 'parent', { ok, t }); toast(`סיימת: ${ok}/8`); await load(); tab = 'duel'; render(); } };
      } });
    };
    show();
  }

  function settings(el) {
    const link = `${location.origin}${location.pathname}?team=${code}`;
    el.innerHTML = `<div class="p-card"><h4>קוד הצוות</h4><div class="team-code">${code}</div><div class="linkbox" dir="ltr">${esc(link)}</div><button class="btn small" id="cp">📋 העתקת קישור הצטרפות</button><p class="muted small">חברים ואחים מצטרפים עם הקישור / הקוד ויוצרים גיבור משלהם.</p></div>
      <div class="p-card"><h4>תאריך המבחן</h4><input type="date" id="exd" value="${team.examDate || ''}"/><p class="muted small">כשיתפרסם התאריך – עדכנו כאן, ויופיע לו ספירה לאחור.</p></div>
      <div class="p-card"><h4>יעד אימון יומי</h4><select id="goal">${[30, 45, 60, 75, 90].map(m => `<option value="${m}" ${(team.goalMin || 60) === m ? 'selected' : ''}>${m} דקות</option>`).join('')}</select><p class="muted small">רצף הימים 🔥 נספר בימים שבהם היעד הושלם. נספר רק זמן פעיל (לא כשהמסך פתוח בלי פעילות).</p></div>
      <div class="p-card"><h4>איך הילדים יקראו לי</h4><input id="pname" value="${esc(team.parentName || 'אבא')}" maxlength="14"/></div>
      <button class="btn primary big" id="psave">שמירת הגדרות</button>
      <div class="p-card"><h4>החלפת קוד הורה</h4><input id="npin" inputmode="numeric" maxlength="4" placeholder="קוד חדש – 4 ספרות" dir="ltr"/><button class="btn small" id="npinb">עדכון</button></div>`;
    $('#cp').onclick = () => { navigator.clipboard?.writeText(link); toast('הועתק'); };
    $('#psave').onclick = async () => { const patch = { examDate: $('#exd').value || null, goalMin: +$('#goal').value, parentName: $('#pname').value.trim() || 'אבא' }; await DB.updateTeam(code, patch); Object.assign(team, patch); toast('נשמר ✓'); };
    $('#npinb').onclick = async () => { const v = $('#npin').value.trim(); if (!/^\d{4}$/.test(v)) return toast('4 ספרות בדיוק'); await DB.updateTeam(code, { parentPinHash: await DB.sha(v) }); toast('קוד ההורה עודכן'); $('#npin').value = ''; };
  }

  render();
}
