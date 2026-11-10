// MindHero – האפליקציה הראשית
import * as DB from './store.js';
import { LS } from './store.js';
import { CHAPTERS, CH_ORDER, VERBAL, ANALOGY, LOGIC, MATH, ACADEMY } from './bank.js';
import { generate } from './gen.js';
import { STYLES, SKINS, ITEMS, POWERS, SLOT_HE, heroSVG, itemName, strongestPowerColor, levelUpOffers, rankOf, xpForLevel } from './hero.js';
import { $, $$, esc, toast, modal, beep, confetti, sound, prepareQ, isCorrect, answerText, renderQuestion, markResult, today, weekKey, fmtTime, isMobile, bars, LETTERS, bm } from './ui.js';
import { startExam } from './exam.js';
import { parentScreen } from './parent.js';

const app = $('#app');
export const S = { team: null, teamData: null, pid: null, p: null, active: false, lastInput: Date.now(), inQuestion: null, messages: [] };
const BANK = { verbal: VERBAL, analogy: ANALOGY, logic: LOGIC, math: MATH };
const MENTOR = 'נובה';

// ================== עזרי שחקן ==================
function newPlayer({ name, style, skin, pinHash }) {
  const ch = {}; CH_ORDER.forEach(c => ch[c] = { lvl: 2, n: 0, ok: 0, time: 0 });
  return { name, style, skin, pinHash, created: Date.now(), level: 1, xp: 0, coins: 50, items: [], equip: {}, powers: {}, ch, seen: {}, mistakes: [], days: {}, streak: 0, bestStreak: 0, lastGoalDay: null, freezeUsed: {}, academy: {}, diag: false, records: { bestBoss: 0, bestCombo: 0, sims: [], totalQ: 0, totalOk: 0, duelsWon: 0 }, daily: null, weekXp: {}, pendingLevels: 0 };
}
const P = () => S.p;
const save = (now) => DB.savePlayer(S.team, S.pid, S.p, now);
const goalMin = () => S.teamData?.goalMin || 60;
const dayRec = (d = today()) => (P().days[d] = P().days[d] || { sec: 0, q: 0, ok: 0, xp: 0 });
const pw = id => P().powers?.[id] || 0;

function addXP(n) {
  const p = P(); n = Math.round(n);
  p.xp += n; dayRec().xp += n; const wk = weekKey(); p.weekXp[wk] = (p.weekXp[wk] || 0) + n;
  while (p.xp >= xpForLevel(p.level)) { p.xp -= xpForLevel(p.level); p.level++; p.pendingLevels = (p.pendingLevels || 0) + 1; }
}
function addCoins(n) { P().coins += Math.round(n * (1 + pw('telek') * 0.1)); }

function streakNow() {
  const p = P(); if (!p.lastGoalDay) return 0;
  const gap = daysBetween(p.lastGoalDay, today());
  if (gap <= 1) return p.streak;
  if (gap === 2 && freezeLeft() > 0) return p.streak;
  return 0;
}
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
const freezeLeft = () => pw('freeze') - (P().freezeUsed?.[weekKey()] || 0);

// ================== מעקב זמן ==================
let tickN = 0;
setInterval(() => {
  if (!S.p || !S.active || document.hidden) return;
  if (Date.now() - S.lastInput > 120000) return;
  const d = dayRec(); d.sec++; tickN++;
  if (tickN % 20 === 0) save();
  const ring = $('#mini-ring'); if (ring) ring.textContent = Math.floor(d.sec / 60) + '′';
  if (!d.goal && d.sec >= goalMin() * 60) reachGoal();
}, 1000);
['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, () => S.lastInput = Date.now(), { passive: true }));
document.addEventListener('visibilitychange', () => { if (document.hidden) DB.flushSave(); });

function reachGoal() {
  const p = P(), d = dayRec(); d.goal = true;
  const gap = p.lastGoalDay ? daysBetween(p.lastGoalDay, today()) : 99;
  if (gap === 1) p.streak++;
  else if (gap === 2 && freezeLeft() > 0) { p.streak++; p.freezeUsed[weekKey()] = (p.freezeUsed[weekKey()] || 0) + 1; toast('❄️ קפאון זמן שמר על הרצף שלך!'); }
  else if (gap !== 0) p.streak = 1;
  p.lastGoalDay = today(); p.bestStreak = Math.max(p.bestStreak, p.streak);
  addCoins(80); addXP(50); save(true); beep('level'); confetti();
  toast(`🏆 השלמת ${goalMin()} דקות אימון היום! +80 🪙 +50 XP · רצף: ${p.streak} 🔥`, 'gold');
}

// ================== בחירת שאלות ==================
const clampD = x => Math.max(1, Math.min(5, Math.round(x)));
export function pickOne(ch, diff, avoid = new Set()) {
  const p = P(); const bank = BANK[ch] || [];
  const genable = ['series', 'math', 'shapes'].includes(ch);
  const useBank = bank.length && (!genable || Math.random() < 0.4);
  if (useBank) {
    const scored = bank.filter(q => !avoid.has(q.id)).map(q => {
      const s = p?.seen?.[q.id];
      return [Math.abs(q.diff - diff) * 1.2 + (s ? s.n * 0.9 - (s.lastOk ? 0 : 0.8) : 0) + Math.random() * 0.8, q];
    }).sort((a, b) => a[0] - b[0]);
    if (scored.length) { avoid.add(scored[0][1].id); return prepareQ(scored[0][1]); }
  }
  if (genable) { const q = generate(ch, diff, (Math.random() * 1e9) | 0); avoid.add(q.id); return prepareQ(q); }
  return prepareQ(bank[Math.floor(Math.random() * bank.length)]);
}
export function buildQs(spec) { // spec: [{ch, n, diff?}]
  const avoid = new Set(), out = [];
  for (const s of spec) for (let i = 0; i < s.n; i++) {
    const base = s.diff ?? P()?.ch?.[s.ch]?.lvl ?? 2;
    const d = clampD(s.diffs ? s.diffs[i] : base + (Math.random() < 0.3 ? 1 : Math.random() < 0.3 ? -1 : 0));
    out.push(pickOne(s.ch, d, avoid));
  }
  return out;
}
const weakest = () => CH_ORDER.slice().sort((a, b) => (P().ch[a].lvl + (P().ch[a].n ? P().ch[a].ok / P().ch[a].n : 0.5)) - (P().ch[b].lvl + (P().ch[b].n ? P().ch[b].ok / P().ch[b].n : 0.5)));
const mixed = n => { const out = []; const avoid = new Set(); for (let i = 0; i < n; i++) { const ch = CH_ORDER[i % 6]; out.push(pickOne(ch, clampD(P().ch[ch].lvl), avoid)); } return out.sort(() => Math.random() - .5); };

// ================== תוכנית יומית ==================
function dailyPlan() {
  const p = P();
  if (p.daily?.date === today()) return p.daily;
  const missions = [];
  if (!p.diag) {
    missions.push({ id: 'diag', kind: 'diag', icon: '🛰️', title: 'משימת גילוי', sub: '18 שאלות – נגלה את נקודות הכוח שלך', min: 20 });
    missions.push({ id: 'acad', kind: 'acad', icon: '🏛️', title: 'שיעור באקדמיה', sub: 'טקטיקה אחת שתעזור במבחן', min: 3 });
    missions.push({ id: 'warm', kind: 'mixed', n: 8, icon: '🔥', title: 'סבב אימון ראשון', sub: '8 שאלות מכל הפרקים', min: 10 });
    missions.push({ id: 'mood', kind: 'mood', icon: '💬', title: 'דיווח סוף יום', sub: 'איך היה לך היום?', min: 1 });
  } else {
    const [w1, w2] = weakest();
    missions.push({ id: 'warm', kind: 'mixed', n: 6, icon: '🔥', title: 'חימום', sub: '6 שאלות מעורבות', min: 6 });
    missions.push({ id: 'f1', kind: 'focus', ch: w1, n: 10, icon: CHAPTERS[w1].icon, title: `אימון ממוקד: ${CHAPTERS[w1].name}`, sub: 'הפרק שהכי כדאי לחזק עכשיו', min: 12 });
    missions.push({ id: 'acad', kind: 'acad', icon: '🏛️', title: 'שיעור באקדמיה', sub: 'טקטיקת מבחן', min: 3 });
    missions.push({ id: 'f2', kind: 'focus', ch: w2, n: 10, icon: CHAPTERS[w2].icon, title: `אימון ממוקד: ${CHAPTERS[w2].name}`, sub: 'עוד פרק לחיזוק', min: 12 });
    missions.push({ id: 'boss', kind: 'boss', n: 12, icon: '👾', title: 'קרב בוס', sub: '12 שאלות בשעון – כמו במבחן', min: 15 });
    missions.push({ id: 'lab', kind: 'lab', icon: '🧪', title: 'מעבדת טעויות', sub: p.mistakes.length ? `${Math.min(8, p.mistakes.length)} שאלות שכדאי לנסות שוב` : 'סבב מהירות', min: 8 });
    missions.push({ id: 'mood', kind: 'mood', icon: '💬', title: 'דיווח סוף יום', sub: 'איך היה לך היום?', min: 1 });
  }
  p.daily = { date: today(), missions, done: {} };
  save(); return p.daily;
}

// ================== מסכים ==================
function setScreen(html, { active = false, cls = '' } = {}) {
  S.active = active; S.inQuestion = null;
  app.className = cls; app.innerHTML = html; window.scrollTo(0, 0);
  $('#comms-btn').style.display = S.p ? 'flex' : 'none';
}

async function boot() {
  app.innerHTML = `<div class="center-screen"><div class="logo-big">Mind<span>Hero</span></div><div class="loader"></div><p class="muted">מתחבר לבסיס...</p></div>`;
  await DB.initCloud();
  const url = new URL(location.href); const tcode = url.searchParams.get('team');
  const sess = LS.get('mh_session', null);
  if (url.searchParams.get('parent') !== null && (tcode || sess?.team)) return parentEntry(tcode || sess.team);
  if (sess?.team && sess?.pid && (!tcode || tcode === sess.team)) {
    const team = await DB.getTeam(sess.team); const p = await DB.getPlayer(sess.team, sess.pid);
    if (team && p) { S.team = sess.team; S.teamData = team; S.pid = sess.pid; S.p = migrate(p); return home(); }
  }
  if (tcode) return joinTeam(tcode);
  startScreen();
}
function migrate(p) {
  const d = newPlayer({}); for (const k in d) if (p[k] === undefined) p[k] = d[k];
  CH_ORDER.forEach(c => p.ch[c] = p.ch[c] || { lvl: 2, n: 0, ok: 0, time: 0 });
  p.records = { ...d.records, ...p.records };
  return p;
}

function startScreen() {
  setScreen(`<div class="center-screen start">
    <div class="logo-big">Mind<span>Hero</span></div>
    <p class="tag">מתאמנים כל יום. הגיבור מתחזק. המבחן כבר לא מפחיד.</p>
    <div class="start-hero">${heroSVG({ style: 'comic', skin: SKINS[1], equip: { back: 'cape', emblem: 'bolt', head: 'mask', weapon2: 'shield' } }, { aura: '#22d3ee' })}</div>
    <div class="stack">
      <input id="code" class="big-in" placeholder="קוד צוות (למשל K7QM2XA)" dir="ltr" maxlength="8"/>
      <button class="btn primary big" id="join">כניסה לצוות 🚀</button>
      <button class="btn ghost" id="newteam">אני הורה – פתיחת צוות חדש</button>
      <button class="btn link" id="parent">כניסה למסך הורה</button>
    </div>
    ${DB.isCloud() ? '' : '<p class="warn">⚠️ אין חיבור לענן – הנתונים יישמרו רק במכשיר הזה.</p>'}
  </div>`);
  const code = () => $('#code').value.trim().toUpperCase();
  $('#join').onclick = () => code() ? joinTeam(code()) : toast('הקלידו קוד צוות');
  $('#code').onkeydown = e => { if (e.key === 'Enter') $('#join').click(); };
  $('#newteam').onclick = createTeamScreen;
  $('#parent').onclick = () => code() ? parentEntry(code()) : toast('הקלידו קודם את קוד הצוות');
}

function pinPad(title, onDone, { sub = '', back } = {}) {
  let v = '';
  setScreen(`<div class="center-screen"><h2>${title}</h2>${sub ? `<p class="muted">${sub}</p>` : ''}<div class="pin-dots">${'<i></i>'.repeat(4)}</div>
    <div class="pinpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map(k => `<button data-k="${k}">${k}</button>`).join('')}</div>
    ${back ? '<button class="btn link" id="pback">חזרה</button>' : ''}</div>`);
  const draw = () => $$('.pin-dots i').forEach((d, i) => d.classList.toggle('on', i < v.length));
  $$('.pinpad button').forEach(b => b.onclick = () => {
    const k = b.dataset.k; beep('click');
    if (k === '⌫') v = v.slice(0, -1); else if (k === '✓') { if (v.length === 4) onDone(v); } else if (v.length < 4) { v += k; if (v.length === 4) setTimeout(() => onDone(v), 150); }
    draw();
  });
  if (back) $('#pback').onclick = back;
}

function createTeamScreen() {
  pinPad('קוד הורה חדש', pin1 => pinPad('הקלידו שוב לאימות', async pin2 => {
    if (pin1 !== pin2) { toast('הקודים לא תואמים, נסו שוב'); return createTeamScreen(); }
    const code = await DB.createTeam({ parentPinHash: await DB.sha(pin1), goalMin: 60, parentName: 'אבא' });
    const link = `${location.origin}${location.pathname}?team=${code}`;
    setScreen(`<div class="center-screen"><h2>🎉 הצוות נוצר!</h2>
      <p>קוד הצוות:</p><div class="team-code">${code}</div>
      <p class="muted">שמרו את הקוד. איתו הילדים (וחברים) נכנסים מכל מכשיר.<br>קישור ישיר להצטרפות:</p>
      <div class="linkbox" dir="ltr">${esc(link)}</div>
      <button class="btn" id="copy">📋 העתקת הקישור</button>
      <button class="btn primary big" id="go">יצירת הגיבור הראשון ←</button></div>`);
    $('#copy').onclick = () => { navigator.clipboard?.writeText(link); toast('הקישור הועתק'); };
    $('#go').onclick = () => joinTeam(code);
  }, { back: createTeamScreen }), { sub: '4 ספרות. איתו נכנסים למסך ההורה (לא לגלות לילדים 😉)', back: startScreen });
}

async function joinTeam(code) {
  const team = await DB.getTeam(code);
  if (!team) { toast('לא מצאתי צוות עם הקוד הזה'); return startScreen(); }
  S.team = code; S.teamData = team;
  const players = await DB.listPlayers(code);
  setScreen(`<div class="center-screen"><h2>מי מתאמן היום?</h2>
    <div class="hero-pick">${players.map(pl => `<button class="hp" data-id="${pl.id}"><div class="hp-svg">${heroSVG(pl, { aura: strongestPowerColor(pl) })}</div><b>${esc(pl.name)}</b><small>רמה ${pl.level} · ${rankOf(pl.level)}</small></button>`).join('')}
      <button class="hp new" id="newhero"><div class="plus">＋</div><b>גיבור חדש</b></button></div>
    <button class="btn link" id="back">חזרה</button></div>`);
  $$('.hp[data-id]').forEach(b => b.onclick = () => {
    const pl = players.find(x => x.id === b.dataset.id);
    pinPad(`שלום ${esc(pl.name)}! הקוד הסודי שלך`, async pin => {
      if (await DB.sha(pin) !== pl.pinHash) { toast('קוד שגוי 🙃'); return joinTeam(code); }
      S.pid = pl.id; S.p = migrate(pl); LS.set('mh_session', { team: code, pid: pl.id }); home();
    }, { back: () => joinTeam(code) });
  });
  $('#newhero').onclick = () => onboarding();
  $('#back').onclick = () => { history.replaceState(null, '', location.pathname); startScreen(); };
}

// ---------- יצירת גיבור ----------
function onboarding() {
  const st = { style: null, name: '', skin: SKINS[1] };
  const step1 = () => {
    setScreen(`<div class="onb"><div class="mentor-say">${mentorFace()}<div class="bubble">היי! אני <b>${MENTOR}</b>, המנטורית שלך. 👋<br>בכל יום שתתאמן כאן – הגיבור שלך יתחזק: ציוד, נשק וכוחות תודעה. בסוף, כשתגיע למבחן המחוננים, תרגיש שאתה כבר מכיר אותו.<br><b>קודם כל – באיזה עולם הגיבור שלך חי?</b></div></div>
      <div class="style-cards">${Object.entries(STYLES).map(([k, s]) => `<button class="style-card" data-s="${k}"><div class="sc-svg">${heroSVG({ style: k, skin: st.skin, equip: k === 'pixel' ? { weapon: 'sword', head: 'helmet' } : k === 'comic' ? { back: 'cape', emblem: 'bolt', head: 'mask' } : { head: 'visor', weapon: 'blaster', emblem: 'eye' } })}</div><b>${s.name}</b><small>${s.desc}</small></button>`).join('')}</div></div>`);
    $$('.style-card').forEach(b => b.onclick = () => { st.style = b.dataset.s; beep('click'); step2(); });
  };
  const step2 = () => {
    setScreen(`<div class="onb two"><div class="onb-prev" id="prev"></div><div class="onb-form">
      <h2>איך קוראים לגיבור שלך?</h2>
      <input id="hn" class="big-in" maxlength="16" placeholder="שם הגיבור" value="${esc(st.name)}"/>
      <h3>גוון עור</h3><div class="skins">${SKINS.map(s => `<button class="skin ${s === st.skin ? 'on' : ''}" data-s="${s}" style="background:${s}"></button>`).join('')}</div>
      <button class="btn primary big" id="next">המשך ←</button><button class="btn link" id="b">חזרה לבחירת עולם</button></div></div>`);
    const prev = () => $('#prev').innerHTML = heroSVG({ style: st.style, skin: st.skin, equip: {} }) + `<div class="prev-name">${esc(st.name || '???')}</div>`;
    prev();
    $('#hn').oninput = e => { st.name = e.target.value.trim(); prev(); };
    $$('.skin').forEach(b => b.onclick = () => { st.skin = b.dataset.s; $$('.skin').forEach(x => x.classList.toggle('on', x === b)); prev(); });
    $('#b').onclick = step1;
    $('#next').onclick = () => { if (st.name.length < 2) return toast('בחר שם לגיבור (לפחות 2 אותיות)'); step3(); };
  };
  const step3 = () => pinPad('בחר קוד סודי בן 4 ספרות', p1 => pinPad('הקלד אותו שוב', async p2 => {
    if (p1 !== p2) { toast('הקודים לא תואמים'); return step3(); }
    const pl = newPlayer({ name: st.name, style: st.style, skin: st.skin, pinHash: await DB.sha(p1) });
    S.pid = 'h' + DB.newCode(9).toLowerCase(); S.p = pl; LS.set('mh_session', { team: S.team, pid: S.pid });
    save(true); step4();
  }), { sub: 'איתו תיכנס מכל מכשיר – מחשב או טלפון', back: step2 });
  const step4 = () => {
    const starters = { pixel: ['sword', 'shield', 'headband'], comic: ['cape', 'mask', 'bolt'], tactical: ['visor', 'blaster', 'star'] }[st.style];
    setScreen(`<div class="center-screen"><div class="mentor-say">${mentorFace()}<div class="bubble">כל גיבור מתחיל עם פריט אחד. <b>בחר את הפריט הראשון שלך:</b><br><small>בכל פעם שתעלה רמה, תבחר עוד פריט או כוח.</small></div></div>
      <div class="offers">${starters.map(id => `<button class="offer" data-id="${id}"><div class="o-svg">${heroSVG({ style: st.style, skin: st.skin, equip: { [ITEMS[id].slot]: id } })}</div><b>${itemName(id, st.style)}</b><small>${ITEMS[id].desc}</small></button>`).join('')}</div></div>`);
    $$('.offer').forEach(b => b.onclick = () => {
      const id = b.dataset.id; P().items.push(id); P().equip[ITEMS[id].slot] = id; save(true); beep('level'); confetti();
      home();
      setTimeout(() => mentorPopup(`ברוך הבא, <b>${esc(P().name)}</b>! 🚀<br>המשימה הראשונה היא <b>משימת גילוי</b> – 18 שאלות מכל ששת הפרקים של המבחן. אין כאן ציון – זה רק כדי שאדע איפה להתחיל איתך.<br><br>📡 בכל רגע אפשר ללחוץ על כפתור הקשר למטה – לבקש רמז, או לספר לי איך אתה מרגיש.`), 600);
    });
  };
  step1();
}

const mentorFace = () => `<div class="mentor"><svg viewBox="0 0 60 60"><defs><radialGradient id="mg"><stop offset="0" stop-color="#a5f3fc"/><stop offset="1" stop-color="#0891b2"/></radialGradient></defs><circle cx="30" cy="30" r="27" fill="url(#mg)" opacity=".9"/><circle cx="30" cy="30" r="27" fill="none" stroke="#67e8f9" stroke-width="2"><animate attributeName="r" values="26;28;26" dur="2.5s" repeatCount="indefinite"/></circle><ellipse cx="22" cy="27" rx="4" ry="5" fill="#082f49"/><ellipse cx="38" cy="27" rx="4" ry="5" fill="#082f49"/><path d="M21 39 Q30 45 39 39" stroke="#082f49" stroke-width="3" fill="none" stroke-linecap="round"/></svg></div>`;
function mentorPopup(html, buttons = [{ t: 'יאללה!', primary: true }]) {
  const m = modal(`<div class="mentor-say">${mentorFace()}<div class="bubble">${html}</div></div><div class="row-btns">${buttons.map((b, i) => `<button class="btn ${b.primary ? 'primary' : ''}" data-i="${i}">${b.t}</button>`).join('')}</div>`);
  $$('.row-btns .btn', m.el).forEach(x => x.onclick = () => { m.close(); buttons[+x.dataset.i].fn && buttons[+x.dataset.i].fn(); });
  return m;
}

// ---------- בית ----------
async function home() {
  const p = P(); const plan = dailyPlan(); const d = dayRec();
  const min = Math.floor(d.sec / 60), goal = goalMin(), pct = Math.min(1, d.sec / (goal * 60));
  const exam = S.teamData?.examDate ? daysBetween(today(), S.teamData.examDate) : null;
  const xpNeed = xpForLevel(p.level);
  const st = streakNow();
  setScreen(`
  <header class="topbar"><div class="tb-name"><b>${esc(p.name)}</b><small>${rankOf(p.level)} · רמה ${p.level}</small></div>
    <div class="tb-stats"><span title="מטבעות">🪙 ${p.coins}</span><span title="רצף ימים" class="${st ? 'fire' : ''}">🔥 ${st}</span><button class="icon-btn" id="snd" title="צלילים">${sound.on ? '🔊' : '🔇'}</button></div></header>
  <main class="home">
    <section class="hero-panel">
      <div class="hero-stage ${p.style}">${heroSVG(p, { aura: strongestPowerColor(p) })}</div>
      <div class="xpbar"><div style="width:${(p.xp / xpNeed) * 100}%"></div><span>${p.xp} / ${xpNeed} XP</span></div>
      <div class="powers-row">${Object.entries(p.powers).map(([k, l]) => `<span class="pw-chip" style="--c:${POWERS[k].color}" title="${POWERS[k].name} – ${POWERS[k].desc(l)}">${POWERS[k].icon}<sup>${l}</sup></span>`).join('') || '<small class="muted">עוד אין כוחות תודעה – הם נפתחים בעליית רמה</small>'}</div>
      <div class="hero-actions"><button class="btn small" id="wardrobe">🎒 ארון ציוד</button><button class="btn small" id="powers">✨ כוחות</button></div>
    </section>
    <section class="today">
      <div class="ring-wrap"><svg viewBox="0 0 120 120" class="ring"><circle cx="60" cy="60" r="52" class="r-bg"/><circle cx="60" cy="60" r="52" class="r-fg" style="stroke-dasharray:${pct * 326.7} 400"/></svg><div class="ring-txt"><b>${min}</b><small>מתוך ${goal} דק׳</small></div></div>
      <div class="today-info"><h2>${d.goal ? 'המטרה היומית הושלמה! 🏆' : 'המשימה של היום'}</h2>
        ${exam != null && exam >= 0 ? `<div class="countdown">⏳ עוד <b>${exam}</b> ימים למבחן</div>` : ''}
        <p class="muted">${d.goal ? 'כל דקה נוספת = עוד XP ומטבעות.' : `עוד ${Math.max(0, goal - min)} דקות לתיבת האוצר היומית 🎁`}</p></div>
    </section>
    <div id="msg-banner"></div>
    <section class="missions"><h3>לוח המשימות</h3>
      ${plan.missions.map((m, i) => { const done = plan.done[m.id]; const next = !done && plan.missions.slice(0, i).every(x => plan.done[x.id]); return `<button class="mission ${done ? 'done' : ''} ${next ? 'next' : ''}" data-id="${m.id}"><span class="m-ic">${done ? '✅' : m.icon}</span><span class="m-t"><b>${m.title}</b><small>${m.sub}</small></span><span class="m-min">~${m.min}′</span></button>`; }).join('')}
    </section>
    <section class="grid-menu">
      <button data-go="practice">🎯<b>זירת אימון</b><small>בחירת פרק חופשית</small></button>
      <button data-go="academy">🏛️<b>אקדמיה</b><small>טקטיקות מבחן</small></button>
      <button data-go="sim">📝<b>סימולציה</b><small>${isMobile() ? 'מומלץ במחשב' : 'כמו המבחן האמיתי'}</small></button>
      <button data-go="duel">⚔️<b>דו-קרב</b><small>מול אבא וחברים</small></button>
      <button data-go="board">🏆<b>טבלת אלופים</b><small>השבוע בצוות</small></button>
      <button data-go="records">📊<b>השיאים שלי</b><small>התקדמות בפרקים</small></button>
    </section>
    <footer class="foot"><button class="btn link" id="switch">החלפת גיבור</button> · <button class="btn link" id="parentbtn">מסך הורה</button></footer>
  </main>`);
  $('#snd').onclick = () => { sound.on = !sound.on; localStorage.setItem('mh_sound', sound.on ? '1' : '0'); home(); };
  $('#wardrobe').onclick = wardrobe; $('#powers').onclick = powersScreen;
  $$('.mission').forEach(b => b.onclick = () => startMission(plan.missions.find(m => m.id === b.dataset.id)));
  const go = { practice: practicePick, academy: academy, sim: simPick, duel: duelScreen, board: leaderboard, records: recordsScreen };
  $$('.grid-menu button').forEach(b => b.onclick = () => go[b.dataset.go]());
  $('#switch').onclick = () => { DB.flushSave(); LS.set('mh_session', null); S.p = null; joinTeam(S.team); };
  $('#parentbtn').onclick = () => parentEntry(S.team);
  if (p.pendingLevels > 0) return levelUpFlow(home);
  loadMessages();
}

async function loadMessages() {
  S.messages = await DB.listMessages(S.team);
  const mine = S.messages.filter(m => m.to === S.pid && !m.read);
  const duels = (await DB.listDuels(S.team)).filter(d => d.to === S.pid && !d.results?.[S.pid]);
  const b = $('#msg-banner'); if (!b) return;
  b.innerHTML = mine.map(m => `<div class="banner msg" data-id="${m.id}">💌 <b>${esc(m.fromName || S.teamData.parentName || 'אבא')}:</b> ${esc(m.text)} <button class="btn small">תודה!</button></div>`).join('')
    + duels.map(d => `<div class="banner duel" data-d="${d.id}">⚔️ <b>${esc(d.fromName)}</b> מאתגר אותך לדו-קרב! <button class="btn small primary">לקרב!</button></div>`).join('');
  $$('.banner.msg', b).forEach(x => $('button', x).onclick = async () => { await DB.markRead(S.team, x.dataset.id); x.remove(); addXP(5); save(); beep('coin'); });
  $$('.banner.duel', b).forEach(x => $('button', x).onclick = () => playDuel(duels.find(d => d.id === x.dataset.d)));
}

// ---------- משימות ----------
function startMission(m) {
  const p = P();
  const done = () => { const plan = dailyPlan(); plan.done[m.id] = true; save(); };
  if (m.kind === 'diag') {
    const qs = buildQs(CH_ORDER.map(ch => ({ ch, n: 3, diffs: [2, 3, 4] }))).sort(() => Math.random() - .5);
    return runQuiz({ title: 'משימת גילוי', qs, kind: 'diag', onDone: (res) => {
      CH_ORDER.forEach(ch => { const r = res.filter(x => x.q.ch === ch); const ok = r.filter(x => x.ok).length; p.ch[ch].lvl = 1.5 + ok; });
      p.diag = true; done(); p.daily = null; save(true);
      const sorted = CH_ORDER.slice().sort((a, b) => p.ch[b].lvl - p.ch[a].lvl);
      mentorPopup(`ניתחתי את משימת הגילוי! 🛰️<br><br>💪 החוזקות שלך: <b>${CHAPTERS[sorted[0]].name}</b> ו<b>${CHAPTERS[sorted[1]].name}</b>.<br>🎯 כדאי לחזק: <b>${CHAPTERS[sorted[5]].name}</b> ו<b>${CHAPTERS[sorted[4]].name}</b>.<br><br>מעכשיו לוח המשימות היומי ייבנה במיוחד בשבילך.`, [{ t: 'מעולה!', primary: true, fn: home }]);
    } });
  }
  if (m.kind === 'mixed') return runQuiz({ title: m.title, qs: mixed(m.n), kind: 'practice', onDone: () => { done(); home(); } });
  if (m.kind === 'focus') return runQuiz({ title: m.title, qs: buildQs([{ ch: m.ch, n: m.n }]), kind: 'practice', onDone: () => { done(); home(); } });
  if (m.kind === 'boss') return bossIntro(() => { done(); home(); });
  if (m.kind === 'lab') {
    if (!p.mistakes.length) return runQuiz({ title: 'סבב מהירות', qs: mixed(8), kind: 'practice', onDone: () => { done(); home(); } });
    const qs = p.mistakes.slice(0, 8).map(q => prepareQ(q));
    return runQuiz({ title: 'מעבדת טעויות', qs, kind: 'lab', onDone: () => { done(); home(); } });
  }
  if (m.kind === 'acad') { const next = ACADEMY.find(a => !p.academy[a.id]) || ACADEMY[Math.floor(Math.random() * ACADEMY.length)]; return lesson(next, () => { done(); home(); }); }
  if (m.kind === 'mood') return moodReport(() => { done(); home(); });
}

function bossIntro(after) {
  const secs = Math.round(15 * 60 * (1 + pw('slow') * 0.1));
  const boss = ['סְפִינְקְס הסדרות', 'הגולם הלוגי', 'דרקון הצורות', 'מכשף המילים', 'רובוט החשבון'][new Date().getDate() % 5];
  mentorPopup(`👾 <b>${boss}</b> חוסם את הדרך!<br>12 שאלות מכל הפרקים, ${Math.round(secs / 60)} דקות על השעון – בדיוק כמו במבחן:<br>• אין משוב עד הסוף.<br>• אפשר לדלג ולחזור.<br>• <b>לא משאירים שאלה ריקה</b> – אין עונש על ניחוש!`, [{ t: 'לקרב! ⚔️', primary: true, fn: () => runQuiz({ title: `קרב בוס: ${boss}`, qs: mixed(12), kind: 'boss', timed: secs, onDone: after }) }, { t: 'לא עכשיו' }]);
}

// ================== מנוע השאלות ==================
function runQuiz(cfg) {
  const R = { ...cfg, i: 0, res: [], resp: Array(cfg.qs.length).fill(null), combo: 0, maxCombo: 0, xp: 0, coins: 0,
    hawk: pw('hawk'), insight: pw('insight'), shield: pw('shield'), thr: 4 - pw('storm'), start: Date.now(), qStart: Date.now(), hintsUsed: 0, elim: {} };
  if (cfg.timed) R.endAt = Date.now() + cfg.timed * 1000;
  const boss = cfg.kind === 'boss';
  let timerInt = null;
  const quit = () => { clearInterval(timerInt); if (R.res.length && !boss) finish(); else home(); };

  const show = () => {
    const q = R.qs[R.i]; R.qStart = Date.now(); R.hintsUsed = 0; R.hintIdx = 0;
    S.inQuestion = { q, hint: giveHint };
    setScreen(`<div class="quiz ${boss ? 'boss' : ''}">
      <header class="qbar"><button class="icon-btn" id="qx">✕</button><b class="qtitle">${esc(cfg.title)}</b>
        <span class="qprog">${R.i + 1}/${R.qs.length}</span>${cfg.timed ? '<span class="timer" id="timer"></span>' : ''}${!boss ? `<span class="combo ${R.combo >= R.thr ? 'hot' : ''}">🔥×${R.combo}</span>` : ''}<span class="qmin" id="mini-ring">${Math.floor(dayRec().sec / 60)}′</span></header>
      ${boss ? `<div class="qnav">${R.qs.map((_, i) => `<button class="${i === R.i ? 'cur' : ''} ${R.resp[i] != null ? 'ans' : ''}" data-i="${i}">${i + 1}</button>`).join('')}</div>` : `<div class="dots">${R.qs.map((_, i) => `<i class="${i < R.res.length ? (R.res[i].ok ? 'ok' : 'no') : i === R.i ? 'cur' : ''}"></i>`).join('')}</div>`}
      <div class="qcard" id="qcard"></div>
      <div class="qtools" id="qtools"></div>
      <div id="fb"></div></div>`, { active: true });
    $('#qx').onclick = () => mentorPopup(boss ? 'לצאת מקרב הבוס? ההתקדמות בקרב לא תישמר.' : 'לצאת מהמשימה? מה שכבר פתרת נשמר.', [{ t: 'כן, לצאת', fn: quit }, { t: 'להמשיך', primary: true }]);
    if (cfg.timed) { const tick = () => { const left = (R.endAt - Date.now()) / 1000; const t = $('#timer'); if (t) { t.textContent = '⏱ ' + fmtTime(left); t.classList.toggle('low', left < 120); } if (left <= 0) { clearInterval(timerInt); finishBoss(); } }; clearInterval(timerInt); tick(); timerInt = setInterval(tick, 500); }
    renderQuestion(q, $('#qcard'), { exam: boss, response: R.resp[R.i], eliminated: R.elim[R.i], onAnswer: (r, final) => boss ? bossAnswer(r) : (final && answer(r)) });
    tools();
    if (boss) $$('.qnav button').forEach(b => b.onclick = () => { R.i = +b.dataset.i; show(); });
  };
  const tools = () => {
    const q = R.qs[R.i]; const t = $('#qtools'); if (!t) return;
    if (boss) {
      t.innerHTML = `<button class="btn" id="prev" ${R.i === 0 ? 'disabled' : ''}>→ הקודם</button>${R.i < R.qs.length - 1 ? '<button class="btn primary" id="nxt">הבא ←</button>' : '<button class="btn gold" id="fin">סיום הקרב ✓</button>'}`;
      $('#prev') && ($('#prev').onclick = () => { R.i--; show(); });
      $('#nxt') && ($('#nxt').onclick = () => { R.i++; show(); });
      $('#fin') && ($('#fin').onclick = () => { const empty = R.resp.filter(x => x == null || (Array.isArray(x) && x.some(y => !y))).length; if (empty) mentorPopup(`נשארו <b>${empty}</b> שאלות בלי תשובה. זכור – אין עונש על ניחוש! לסיים בכל זאת?`, [{ t: 'לחזור ולנחש', primary: true }, { t: 'לסיים', fn: finishBoss }]); else finishBoss(); });
      return;
    }
    const canHawk = R.hawk > 0 && (q.type === 'mc' || q.type === 'shape') && (R.elim[R.i] || []).length < 2;
    t.innerHTML = `<button class="btn small" id="hint">💡 רמז${R.insight > 0 ? ` (חינם ×${R.insight})` : ' (−XP)'}</button>${canHawk ? `<button class="btn small pw" id="hawk">🦅 עין הנץ ×${R.hawk}</button>` : ''}`;
    $('#hint').onclick = giveHint;
    if (canHawk) $('#hawk').onclick = () => {
      const wrong = q.opts.map((_, i) => i).filter(i => i !== q.ans && !(R.elim[R.i] || []).includes(i));
      const k = wrong[Math.floor(Math.random() * wrong.length)]; R.elim[R.i] = [...(R.elim[R.i] || []), k]; R.hawk--;
      const b = $(`.opt[data-i="${k}"]`); b.classList.add('elim'); b.disabled = true; beep('coin'); tools();
    };
  };
  function giveHint() {
    const q = R.qs[R.i]; if (!q || $('#qcard')?.classList.contains('locked') || boss) return;
    if (R.hintIdx >= q.hints.length) return;
    let free = false;
    if (R.insight > 0) { R.insight--; free = true; } else R.hintsUsed++;
    $('#fb').insertAdjacentHTML('beforeend', `<div class="hint">${mentorFace()}<div><b>רמז ${R.hintIdx + 1}${free ? ' (חינם 💡)' : ''}:</b> ${bm(q.hints[R.hintIdx])}</div></div>`);
    R.hintIdx++; beep('click');
    const hb = $('#hint');
    if (R.hintIdx >= q.hints.length) { if (hb) hb.outerHTML = '<button class="btn small" id="reveal">🔓 הסבר מלא</button>'; const rv = $('#reveal'); if (rv) rv.onclick = () => answer(null, true); }
    else if (hb) hb.innerHTML = `💡 רמז נוסף${R.insight > 0 ? ` (חינם ×${R.insight})` : ' (−XP)'}`;
  }

  function answer(r, revealed = false) {
    const q = R.qs[R.i]; const ok = !revealed && isCorrect(q, r); const p = P();
    const t = (Date.now() - R.qStart) / 1000;
    markResult(q, $('#qcard'), r);
    // סטטיסטיקה
    const c = p.ch[q.ch]; c.n++; if (ok) c.ok++; c.time += t;
    const delta = 0.22 * (1 + ((ok ? q.diff - c.lvl : c.lvl - q.diff) || 0) * 0.3);
    if (cfg.kind !== 'diag') c.lvl = Math.max(1, Math.min(5, c.lvl + (ok ? delta : -delta)));
    p.seen[q.id] = { n: (p.seen[q.id]?.n || 0) + 1, lastOk: ok };
    p.records.totalQ++; if (ok) p.records.totalOk++;
    const d = dayRec(); d.q++; if (ok) d.ok++;
    // מעבדת טעויות
    const mIdx = p.mistakes.findIndex(m => m.id === q.id);
    if (ok && mIdx >= 0) p.mistakes.splice(mIdx, 1);
    if (!ok && mIdx < 0) { p.mistakes.unshift(q); if (p.mistakes.length > 40) p.mistakes.pop(); }
    // XP וקומבו
    let xp = 0;
    if (ok) {
      R.combo++; R.maxCombo = Math.max(R.maxCombo, R.combo);
      const mult = R.combo >= R.thr * 2 ? 2 : R.combo >= R.thr ? 1.5 : 1;
      xp = (8 + q.diff * 4) * mult * Math.max(0.3, 1 - R.hintsUsed * 0.3) * (cfg.kind === 'lab' ? 1 + pw('memory') * 0.25 : 1) + (t < 40 ? 3 : 0);
      R.coins += 2 + q.diff;
    } else {
      if (R.shield > 0 && R.combo > 0) { R.shield--; toast('🛡️ מגן המחשבה שמר על הקומבו!'); } else R.combo = 0;
      xp = 2; // גם ניסיון שווה משהו
    }
    xp = Math.round(xp); R.xp += xp; addXP(xp);
    R.res.push({ q, ok, t, r });
    beep(ok ? 'ok' : 'bad');
    const praise = ['מצוין!', 'בול!', 'יפה מאוד!', 'כל הכבוד!', 'מוח של גיבור!', 'חד כמו תער!'];
    const comfort = ['לא נורא – עכשיו אתה יודע את הטריק.', 'טעות באימון = נקודה במבחן.', 'גם גיבורים טועים. העיקר להבין למה.', 'זו בדיוק המטרה של אימון.'];
    $('#fb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}"><div class="fb-head">${ok ? `✅ ${praise[Math.floor(Math.random() * praise.length)]} <span class="xp">+${xp} XP</span>${R.combo >= R.thr ? ` <span class="combo hot">🔥×${R.combo}</span>` : ''}` : `${revealed ? '🔓' : '❌'} ${revealed ? 'הנה ההסבר:' : comfort[Math.floor(Math.random() * comfort.length)]}`}</div>
      ${!ok ? `<div class="fb-ans">התשובה הנכונה: <b>${answerText(q)}</b></div>` : ''}<div class="fb-exp">${bm(q.exp)}</div>
      <button class="btn primary big" id="next">${R.i < R.qs.length - 1 ? 'לשאלה הבאה ←' : 'סיום המשימה 🏁'}</button></div>`;
    $('#qtools').innerHTML = '';
    $('#next').onclick = () => { if (R.i < R.qs.length - 1) { R.i++; show(); } else finish(); };
    $('#next').scrollIntoView({ behavior: 'smooth', block: 'center' });
    save();
  }
  function bossAnswer(r) { R.resp[R.i] = r; const b = $(`.qnav button[data-i="${R.i}"]`); if (b) b.classList.toggle('ans', r != null && r !== ''); }
  function finishBoss() {
    clearInterval(timerInt); const p = P();
    R.qs.forEach((q, i) => {
      const r = R.resp[i]; const ok = isCorrect(q, r); R.res.push({ q, ok, r });
      const c = p.ch[q.ch]; c.n++; if (ok) c.ok++;
      c.lvl = Math.max(1, Math.min(5, c.lvl + (ok ? 0.15 : -0.15)));
      p.records.totalQ++; if (ok) p.records.totalOk++; const d = dayRec(); d.q++; if (ok) d.ok++;
      if (!ok && !p.mistakes.some(m => m.id === q.id)) { p.mistakes.unshift(q); if (p.mistakes.length > 40) p.mistakes.pop(); }
      if (ok) { const x = 10 + q.diff * 5; R.xp += x; addXP(x); R.coins += 3 + q.diff; }
    });
    const score = Math.round(R.res.filter(x => x.ok).length / R.qs.length * 100);
    const empty = R.resp.filter(x => x == null || x === '').length;
    if (score >= 50) { R.xp += 40; addXP(40); }
    p.records.bestBoss = Math.max(p.records.bestBoss, score);
    finish({ score, empty });
  }
  function finish(extra = {}) {
    clearInterval(timerInt); const p = P();
    const okN = R.res.filter(x => x.ok).length;
    addCoins(R.coins); p.records.bestCombo = Math.max(p.records.bestCombo, R.maxCombo); save(true);
    S.active = false;
    const review = R.res.filter(x => !x.ok);
    setScreen(`<div class="center-screen results">
      <h2>${boss ? (extra.score >= 60 ? '👾 הבוס הובס!' : '👾 הבוס נסוג... בינתיים') : '🏁 המשימה הושלמה!'}</h2>
      <div class="res-hero">${heroSVG(p, { aura: strongestPowerColor(p) })}</div>
      <div class="res-stats"><div><b>${okN}/${R.res.length}</b><small>נכונות</small></div><div><b>+${R.xp}</b><small>XP</small></div><div><b>+${Math.round(R.coins * (1 + pw('telek') * .1))}</b><small>🪙</small></div>${!boss ? `<div><b>${R.maxCombo}</b><small>קומבו שיא</small></div>` : `<div><b>${extra.score}%</b><small>ציון</small></div>`}</div>
      ${boss && extra.empty ? `<p class="warn">השארת ${extra.empty} שאלות ריקות. במבחן – תמיד לנחש! 🎯</p>` : ''}
      ${boss && review.length ? `<details class="review"><summary>מה היה כדאי לעשות אחרת? (${review.length})</summary>${review.map(x => `<div class="rv"><div class="rv-q">${CHAPTERS[x.q.ch].icon} ${x.q.q}</div><div class="rv-a">✔ ${answerText(x.q)}</div><div class="rv-e">${bm(x.q.exp)}</div></div>`).join('')}</details>` : ''}
      <button class="btn primary big" id="cont">המשך ←</button></div>`);
    if (okN / R.res.length >= 0.8) confetti();
    $('#cont').onclick = () => { if (P().pendingLevels > 0) levelUpFlow(() => cfg.onDone(R.res, extra)); else cfg.onDone(R.res, extra); };
  }
  show();
}

// ---------- עליית רמה ----------
function levelUpFlow(after) {
  const p = P(); if (!p.pendingLevels) return after();
  const offers = levelUpOffers(p);
  beep('level'); confetti();
  const m = modal(`<div class="levelup"><div class="lu-title"><span>רמה ${p.level - p.pendingLevels + 1}!</span> ⬆️</div><p>${rankOf(p.level)} · בחר שדרוג אחד לגיבור:</p>
    <div class="offers">${offers.map((o, i) => o.kind === 'item'
      ? `<button class="offer" data-i="${i}"><div class="o-svg">${heroSVG({ ...p, equip: { ...p.equip, [ITEMS[o.id].slot]: o.id } })}</div><span class="o-kind">פריט · ${SLOT_HE[ITEMS[o.id].slot]}</span><b>${itemName(o.id, p.style)}</b><small>${ITEMS[o.id].desc}</small></button>`
      : o.kind === 'power' ? `<button class="offer power" data-i="${i}" style="--c:${POWERS[o.id].color}"><div class="o-pw">${POWERS[o.id].icon}</div><span class="o-kind">כוח תודעה${o.lvl > 1 ? ' · שדרוג לרמה ' + o.lvl : ''}</span><b>${POWERS[o.id].name}</b><small>${POWERS[o.id].desc(o.lvl)}</small></button>`
      : `<button class="offer" data-i="${i}"><div class="o-pw">🪙</div><b>${o.amount} מטבעות</b></button>`).join('')}</div></div>`, { closable: false, cls: 'wide' });
  $$('.offer', m.el).forEach(b => b.onclick = () => {
    const o = offers[+b.dataset.i];
    if (o.kind === 'item') { p.items.push(o.id); p.equip[ITEMS[o.id].slot] = o.id; }
    else if (o.kind === 'power') p.powers[o.id] = o.lvl;
    else p.coins += o.amount;
    p.pendingLevels--; save(true); m.close(); beep('coin');
    levelUpFlow(after);
  });
}

// ---------- ארון וכוחות ----------
function wardrobe() {
  const p = P(); const slots = ['head', 'back', 'weapon', 'weapon2', 'emblem', 'suit'];
  const tierMax = p.level < 4 ? 1 : p.level < 8 ? 2 : p.level < 13 ? 3 : 4;
  const price = id => ITEMS[id].tier * 150;
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk">→</button><b>🎒 ארון הציוד</b><span>🪙 ${p.coins}</span></header>
  <main class="wardrobe"><div class="w-hero ${p.style}">${heroSVG(p, { aura: strongestPowerColor(p) })}</div><div class="w-slots">
  ${slots.map(s => { const own = p.items.filter(id => ITEMS[id].slot === s); const shop = Object.keys(ITEMS).filter(id => ITEMS[id].slot === s && !p.items.includes(id));
    return `<div class="w-slot"><h4>${SLOT_HE[s]}</h4><div class="w-items"><button class="w-item ${!p.equip[s] ? 'on' : ''}" data-s="${s}" data-id="">ללא</button>${own.map(id => `<button class="w-item ${p.equip[s] === id ? 'on' : ''}" data-s="${s}" data-id="${id}">${itemName(id, p.style)}</button>`).join('')}
    ${shop.map(id => ITEMS[id].tier <= tierMax ? `<button class="w-item buy" data-buy="${id}">🛒 ${itemName(id, p.style)} · ${price(id)}🪙</button>` : `<span class="w-item locked">🔒 ${itemName(id, p.style)} (רמה ${[0, 1, 4, 8, 13][ITEMS[id].tier]})</span>`).join('')}</div></div>`; }).join('')}
  </div></main>`);
  $('#bk').onclick = home;
  $$('.w-item[data-s]').forEach(b => b.onclick = () => { const s = b.dataset.s; if (b.dataset.id) p.equip[s] = b.dataset.id; else delete p.equip[s]; save(); wardrobe(); });
  $$('.w-item[data-buy]').forEach(b => b.onclick = () => { const id = b.dataset.buy; if (p.coins < price(id)) return toast('אין מספיק מטבעות – עוד קצת אימון 💪'); p.coins -= price(id); p.items.push(id); p.equip[ITEMS[id].slot] = id; save(true); beep('coin'); confetti(); wardrobe(); });
}
function powersScreen() {
  const p = P();
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk">→</button><b>✨ כוחות תודעה</b><span></span></header>
  <main class="list-screen"><p class="muted">כוחות נפתחים ומשתדרגים כשעולים רמה. לכל כוח השפעה אמיתית באימונים.</p>
  ${Object.entries(POWERS).map(([k, w]) => { const l = p.powers[k] || 0; return `<div class="pw-card ${l ? '' : 'off'}" style="--c:${w.color}"><div class="pw-ic">${w.icon}</div><div><b>${w.name}</b> ${l ? `<span class="lvl">רמה ${l}/3</span>` : '<span class="lvl">🔒 טרם נפתח</span>'}<small>${w.desc(Math.max(1, l))}</small></div></div>`; }).join('')}</main>`);
  $('#bk').onclick = home;
}

// ---------- זירת אימון ----------
function practicePick() {
  const p = P();
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk">→</button><b>🎯 זירת אימון</b><span></span></header>
  <main class="list-screen"><p class="muted">בחר פרק – 8 שאלות ברמה שמתאימה לך עכשיו.</p>
  ${CH_ORDER.map(ch => { const c = p.ch[ch]; return `<button class="ch-card" data-ch="${ch}" style="--c:${CHAPTERS[ch].color}"><span class="ch-ic">${CHAPTERS[ch].icon}</span><span class="ch-t"><b>${CHAPTERS[ch].name}</b><small>${CHAPTERS[ch].desc}</small></span><span class="mastery"><i style="width:${(c.lvl / 5) * 100}%"></i></span></button>`; }).join('')}
  <button class="ch-card" data-ch="mix" style="--c:#facc15"><span class="ch-ic">🌀</span><span class="ch-t"><b>ערבוב</b><small>מכל הפרקים</small></span></button></main>`);
  $('#bk').onclick = home;
  $$('.ch-card').forEach(b => b.onclick = () => { const ch = b.dataset.ch; runQuiz({ title: ch === 'mix' ? 'ערבוב' : CHAPTERS[ch].name, qs: ch === 'mix' ? mixed(8) : buildQs([{ ch, n: 8 }]), kind: 'practice', onDone: home }); });
}

// ---------- אקדמיה ----------
function academy() {
  const p = P();
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk">→</button><b>🏛️ האקדמיה לגיבורים</b><span>${Object.keys(p.academy).length}/${ACADEMY.length}</span></header>
  <main class="list-screen">${ACADEMY.map((a, i) => { const open = i === 0 || p.academy[ACADEMY[i - 1].id] || p.academy[a.id]; return `<button class="ch-card ${open ? '' : 'locked'}" data-i="${i}" ${open ? '' : 'disabled'}><span class="ch-ic">${p.academy[a.id] ? '✅' : open ? a.icon : '🔒'}</span><span class="ch-t"><b>${a.title}</b></span></button>`; }).join('')}</main>`);
  $('#bk').onclick = home;
  $$('.ch-card[data-i]').forEach(b => b.onclick = () => lesson(ACADEMY[+b.dataset.i], academy));
}
function lesson(a, after) {
  S.active = true;
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk">→</button><b>${a.icon} ${a.title}</b><span></span></header>
  <main class="lesson"><div class="mentor-say">${mentorFace()}<div class="bubble">${a.body}</div></div>
  <div class="lesson-q"><h3>בדיקה קצרה:</h3><p>${a.quiz.q}</p><div class="opts">${a.quiz.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="ol">${LETTERS[i]}</span><span class="ot">${o}</span></button>`).join('')}</div></div><div id="lfb"></div></main>`, { active: true });
  $('#bk').onclick = after;
  $$('.lesson-q .opt').forEach(b => b.onclick = () => {
    const i = +b.dataset.i; if ($('.lesson-q').classList.contains('locked')) return;
    if (i === a.quiz.ans) {
      $('.lesson-q').classList.add('locked'); b.classList.add('right'); beep('ok');
      const first = !P().academy[a.id]; P().academy[a.id] = true; if (first) { addXP(30); addCoins(20); } save();
      $('#lfb').innerHTML = `<div class="feedback ok"><div class="fb-head">✅ נכון! ${first ? '<span class="xp">+30 XP +20🪙</span>' : ''}</div><button class="btn primary big" id="ldone">המשך ←</button></div>`;
      $('#ldone').onclick = () => P().pendingLevels ? levelUpFlow(after) : after();
    } else { b.classList.add('wrong'); beep('bad'); toast('לא בדיוק – קרא שוב את ההסבר ונסה שוב'); }
  });
}

// ---------- דיווח מצב רוח ----------
const MOODS = [
  { k: 'great', e: '😄', t: 'מעולה' }, { k: 'ok', e: '🙂', t: 'בסדר' }, { k: 'tired', e: '😴', t: 'עייף' },
  { k: 'confused', e: '😕', t: 'לא מבין משהו' }, { k: 'frustrated', e: '😤', t: 'מתוסכל' }, { k: 'stressed', e: '😰', t: 'לחוץ מהמבחן' }, { k: 'quit', e: '🏳️', t: 'רוצה לוותר' },
];
const MENTOR_REPLY = {
  great: ['יאללה!! 🔥 ככה מדברים גיבורים. תמשיך ככה – והמבחן ירגיש כמו עוד משימה.', 'אני שמחה לשמוע! 😄 אנרגיה טובה = מוח חד.', 'וואו! תשמור על התחושה הזו – היא הנשק הכי חזק שלך.'],
  ok: ['בסדר זה מצוין. לא כל יום צריך להיות זיקוקים – העיקר להתמיד. 💪', 'קיבלתי! כל יום של אימון מוסיף לך כוח, גם יום "בסדר".'],
  tired: ['המוח צריך דלק. 🧃 קח הפסקה של 5 דקות: כוס מים, מתיחות, ותחזור רענן.', 'עייפות היא סימן שעבדת קשה. הפסקה קצרה עכשיו תעזור יותר מעוד שאלה.', 'אולי סבב קצר של 3 שאלות קלות – ואז מנוחה? מה שמרגיש לך נכון.'],
  confused: ['זה בדיוק המקום ללמוד! 🔍 נסה ללחוץ על "רמז" – הרמז הראשון לא מגלה תשובה, רק מכוון.', 'כשמשהו לא ברור – באקדמיה יש שיעור לכל סוג שאלה. וגם אפשר לשאול את אבא. 😉', 'לא להבין זה שלב בלמידה, לא סוף הדרך. בוא נפרק את זה לחלקים קטנים.'],
  frustrated: ['גם לגיבורי-על יש קרבות קשים. 🛡️ כל טעות שאתה מבין עכשיו – לא תחזור במבחן.', 'תסכול אומר שאתה מתאמץ באמת. קח נשימה – ובוא ננסה משהו קצת יותר קל לרגע.', 'אתה יודע מה? טעויות באימון הן בדיוק מה שהופך אותך לחזק. זה עובד גם כשזה לא מרגיש ככה.'],
  stressed: ['לחץ לפני מבחן אומר שאכפת לך – וזה טוב! 💙 בוא ננשום רגע יחד: נשימת קופסה.', 'הנה סוד: כל יום פה אתה פוגש בדיוק את סוגי השאלות של המבחן. ביום המבחן – לא יהיו הפתעות.', 'זכור: אין עונש על טעות במבחן, ומותר לנחש. אתה מגיע מוכן.'],
  quit: ['זה בסדר להרגיש ככה. 🤝 בוא נעשה עסקה: רק עוד 3 שאלות, ואז תחליט.', 'גם הגיבורים הכי חזקים רצו לוותר לפעמים. מה שעשה אותם גיבורים – זה שחזרו למחרת.', 'אולי הגיע הזמן להפסקה, לא לוויתור. מחר הגיבור שלך מחכה לך. 💪'],
};
function moodReport(after) {
  const m = modal(`<div class="mentor-say">${mentorFace()}<div class="bubble">איך היה לך האימון היום?</div></div>
    <div class="moods">${MOODS.map(x => `<button class="mood" data-k="${x.k}">${x.e}<small>${x.t}</small></button>`).join('')}</div>
    <textarea id="mtxt" placeholder="רוצה לספר משהו? (לא חובה)"></textarea><button class="btn primary big" id="msend">שליחה</button><p class="muted small">הדיווח נשלח גם ל${esc(S.teamData.parentName || 'אבא')}.</p>`, { onClose: after });
  let mood = null;
  $$('.mood', m.el).forEach(b => b.onclick = () => { mood = b.dataset.k; $$('.mood', m.el).forEach(x => x.classList.toggle('on', x === b)); });
  $('#msend', m.el).onclick = async () => {
    if (!mood) return toast('בחר איך הרגשת');
    const mm = MOODS.find(x => x.k === mood); dayRec().mood = mood;
    await DB.addMessage(S.team, { from: S.pid, fromName: P().name, to: 'parent', kind: 'mood', mood, text: `${mm.e} ${mm.t}${$('#mtxt', m.el).value.trim() ? ' – ' + $('#mtxt', m.el).value.trim() : ''}` });
    addXP(10); save(true);
    m.el.innerHTML = `<div class="mentor-say">${mentorFace()}<div class="bubble">${pickR(MENTOR_REPLY[mood])}</div></div><button class="btn primary big" id="mok">סגירה</button>`;
    $('#mok', m.el).onclick = () => { m.close(); };
  };
}
const pickR = a => a[Math.floor(Math.random() * a.length)];

// ---------- כפתור הקשר ----------
function comms() {
  const inQ = S.inQuestion;
  const mine = S.messages.filter(x => x.to === S.pid).slice(0, 5);
  const m = modal(`<h3>📡 קו פתוח</h3>
    <div class="mentor-say">${mentorFace()}<div class="bubble">אני כאן. מה צריך?</div></div>
    ${inQ ? `<button class="btn big" id="c-hint">💡 תני לי רמז לשאלה הזו</button>` : ''}
    <button class="btn big" id="c-breath">🌬️ נשימת קופסה (דקה אחת)</button>
    <h4>איך אני מרגיש עכשיו?</h4>
    <div class="moods">${MOODS.filter(x => x.k !== 'ok').map(x => `<button class="mood" data-k="${x.k}">${x.e}<small>${x.t}</small></button>`).join('')}</div>
    <textarea id="ctxt" placeholder="אפשר לכתוב כאן כל דבר – גם שאלה, גם תחושה"></textarea>
    <button class="btn primary" id="c-send">שליחה</button>
    <p class="muted small">הודעות על תחושות נשלחות גם ל${esc(S.teamData.parentName || 'אבא')} 💙</p>
    ${mine.length ? `<h4>הודעות אליך</h4>${mine.map(x => `<div class="inbox-msg">💌 <b>${esc(x.fromName || 'אבא')}:</b> ${esc(x.text)}</div>`).join('')}` : ''}`);
  let mood = null;
  if (inQ) $('#c-hint', m.el).onclick = () => { m.close(); inQ.hint(); };
  $('#c-breath', m.el).onclick = () => { m.close(); breathing(); };
  $$('.mood', m.el).forEach(b => b.onclick = () => { mood = b.dataset.k; $$('.mood', m.el).forEach(x => x.classList.toggle('on', x === b)); });
  $('#c-send', m.el).onclick = async () => {
    const txt = $('#ctxt', m.el).value.trim(); if (!mood && !txt) return toast('בחר תחושה או כתוב משהו');
    const mm = MOODS.find(x => x.k === mood);
    await DB.addMessage(S.team, { from: S.pid, fromName: P().name, to: 'parent', kind: mood ? 'feeling' : 'help', mood, text: `${mm ? mm.e + ' ' + mm.t : '❓'}${txt ? ' – ' + txt : ''}`, context: inQ ? CHAPTERS[inQ.q.ch].name : null });
    const reply = mood ? pickR(MENTOR_REPLY[mood]) : 'קיבלתי! 📨 ההודעה נשלחה. בינתיים – אם זה על שאלה, נסה את כפתור הרמז, הוא בנוי בשלבים.';
    const acts = mood === 'stressed' ? '<button class="btn" id="a-br">🌬️ בוא ננשום</button>' : mood === 'tired' ? '<button class="btn" id="a-brk">⏸️ הפסקה של 5 דקות</button>' : (mood === 'confused' && inQ) ? '<button class="btn" id="a-h">💡 רמז</button>' : '';
    m.el.innerHTML = `<div class="mentor-say">${mentorFace()}<div class="bubble">${reply}</div></div><div class="row-btns">${acts}<button class="btn primary" id="a-ok">תודה ${MENTOR}</button></div>`;
    $('#a-ok', m.el).onclick = m.close;
    $('#a-br', m.el) && ($('#a-br', m.el).onclick = () => { m.close(); breathing(); });
    $('#a-h', m.el) && ($('#a-h', m.el).onclick = () => { m.close(); inQ.hint(); });
    $('#a-brk', m.el) && ($('#a-brk', m.el).onclick = () => { m.close(); breakTimer(); });
  };
}
function breathing() {
  const m = modal(`<div class="breath"><div class="b-box"><div class="b-dot"></div></div><div class="b-txt">מתכוננים...</div><div class="b-n"></div></div>`);
  const steps = ['שאיפה 🌬️', 'החזקה ✋', 'נשיפה 💨', 'החזקה ✋']; let i = 0, cyc = 0;
  const box = $('.b-box', m.el);
  const run = () => {
    if (!document.body.contains(m.el)) return;
    if (cyc >= 3) { $('.b-txt', m.el).innerHTML = 'כל הכבוד! 💙 המוח שלך מוכן להמשיך.'; $('.b-n', m.el).textContent = ''; addXP(5); save(); return; }
    box.dataset.step = i; $('.b-txt', m.el).textContent = steps[i]; let n = 4; $('.b-n', m.el).textContent = n;
    const t = setInterval(() => { n--; if (n > 0) $('.b-n', m.el).textContent = n; else { clearInterval(t); i = (i + 1) % 4; if (i === 0) cyc++; run(); } }, 1000);
  };
  setTimeout(run, 800);
}
function breakTimer() {
  let s = 300; S.active = false;
  const m = modal(`<div class="center"><h3>⏸️ הפסקה</h3><div class="big-timer" id="bt">5:00</div><p>שתה מים, תזוז קצת, תסתכל רחוק מהמסך. הגיבור שלך מחכה. 🧃</p></div>`);
  const t = setInterval(() => { s--; const e = $('#bt', m.el); if (!e) return clearInterval(t); e.textContent = fmtTime(s); if (s <= 0) { clearInterval(t); e.textContent = 'חוזרים! 💪'; beep('level'); } }, 1000);
}

// ---------- סימולציה ----------
function simPick() {
  const p = P();
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk">→</button><b>📝 סימולציית מבחן</b><span></span></header>
  <main class="list-screen"><div class="mentor-say">${mentorFace()}<div class="bubble">הסימולציה בנויה <b>כמו מסך המבחן האמיתי</b>: בחירת פרק, מספרי שאלות, "הבא"/"הקודם" וסימון שאלות לחזרה. ${isMobile() ? '<br>⚠️ המבחן האמיתי נעשה במחשב – מומלץ לעשות את הסימולציה המלאה במחשב.' : ''}</div></div>
  <button class="ch-card" data-m="mini" style="--c:#22d3ee"><span class="ch-ic">⚡</span><span class="ch-t"><b>מיני-סימולציה</b><small>24 שאלות (4 מכל פרק) · 30 דקות</small></span></button>
  <button class="ch-card" data-m="full" style="--c:#facc15"><span class="ch-ic">🏟️</span><span class="ch-t"><b>סימולציה מלאה</b><small>72 שאלות (12 מכל פרק) · 90 דקות</small></span></button>
  <label class="chk"><input type="checkbox" id="extra"/> תוספת זמן של 15 דקות (כמו בשנה שעברה)</label>
  ${p.records.sims.length ? `<h4>סימולציות קודמות</h4>${p.records.sims.slice(-6).reverse().map(s => `<div class="sim-row"><span>${s.date}</span><span>${s.mini ? 'מיני' : 'מלאה'}</span><b>${s.score}%</b></div>`).join('')}` : ''}</main>`);
  $('#bk').onclick = home;
  $$('.ch-card[data-m]').forEach(b => b.onclick = () => {
    const mini = b.dataset.m === 'mini'; const n = mini ? 4 : 12;
    const qs = CH_ORDER.map(ch => buildQs([{ ch, n, diffs: Array.from({ length: n }, (_, i) => 1 + Math.floor(i * 4.99 / (n - 1 || 1))) }]));
    const mins = (mini ? 30 : 90) + ($('#extra').checked ? (mini ? 5 : 15) : 0);
    S.active = true;
    startExam({ app, qsByCh: qs, minutes: mins, mini, onExit: home, onFinish: (r) => {
      const p = P(); p.records.sims.push({ date: today(), mini, score: r.score, perCh: r.perCh, empty: r.empty });
      CH_ORDER.forEach((ch, i) => { const c = p.ch[ch]; c.n += r.perCh[i].n; c.ok += r.perCh[i].ok; c.lvl = Math.max(1, Math.min(5, c.lvl + (r.perCh[i].ok / r.perCh[i].n - 0.6))); });
      r.wrong.forEach(q => { if (!p.mistakes.some(m => m.id === q.id)) { p.mistakes.unshift(q); } }); p.mistakes = p.mistakes.slice(0, 40);
      const xp = Math.round(r.ok * 6 + (mini ? 40 : 150)); addXP(xp); addCoins(mini ? 40 : 150); save(true);
      return xp;
    } });
  });
}

// ---------- דו-קרב ----------
async function duelScreen() {
  const players = (await DB.listPlayers(S.team)).filter(x => x.id !== S.pid);
  const duels = (await DB.listDuels(S.team)).filter(d => d.from === S.pid || d.to === S.pid);
  const pname = S.teamData.parentName || 'אבא';
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk">→</button><b>⚔️ דו-קרב</b><span></span></header>
  <main class="list-screen"><p class="muted">אתה ויריב פותרים בדיוק את אותן 8 שאלות. מנצח מי שצודק יותר; בתיקו – המהיר יותר. ניצחון = +40 XP.</p>
  <h4>אתגר מישהו:</h4><div class="opp">
    <button class="opp-b" data-to="parent" data-n="${esc(pname)}">👨 ${esc(pname)}</button>
    ${players.map(x => `<button class="opp-b" data-to="${x.id}" data-n="${esc(x.name)}"><span class="mini-h">${heroSVG(x)}</span>${esc(x.name)}</button>`).join('')}</div>
  <h4>הקרבות שלך</h4>${duels.length ? duels.map(d => duelRow(d)).join('') : '<p class="muted">עוד אין קרבות</p>'}</main>`);
  $('#bk').onclick = home;
  $$('.opp-b').forEach(b => b.onclick = async () => {
    const qs = mixed(8).slice(0, 8);
    const id = await DB.createDuel(S.team, { from: S.pid, fromName: P().name, to: b.dataset.to, toName: b.dataset.n, qs });
    playDuel({ id, qs, from: S.pid, fromName: P().name, to: b.dataset.to, toName: b.dataset.n, results: {} });
  });
  $$('.duel-row [data-play]').forEach(b => b.onclick = () => playDuel(duels.find(d => d.id === b.dataset.play)));
}
function duelRow(d) {
  const me = d.results?.[S.pid], other = d.from === S.pid ? d.to : d.from, oname = d.from === S.pid ? d.toName : d.fromName, them = d.results?.[other];
  let status;
  if (!me) status = `<button class="btn small primary" data-play="${d.id}">לקרב!</button>`;
  else if (!them) status = `<span class="muted">מחכים ל${esc(oname)}...</span>`;
  else { const win = me.ok > them.ok || (me.ok === them.ok && me.t < them.t); const tie = me.ok === them.ok && me.t === them.t; status = `<b class="${win ? 'win' : 'lose'}">${tie ? 'תיקו' : win ? '🏆 ניצחת' : 'הפסד – בפעם הבאה!'}</b>`; }
  return `<div class="duel-row"><span>⚔️ מול <b>${esc(oname)}</b></span><span>${me ? `${me.ok}/8 · ${fmtTime(me.t)}` : ''}${them ? ` | ${esc(oname)}: ${them.ok}/8 · ${fmtTime(them.t)}` : ''}</span>${status}</div>`;
}
function playDuel(d) {
  const qs = d.qs.map(q => JSON.parse(JSON.stringify(q)));
  runQuiz({ title: `דו-קרב מול ${d.from === S.pid ? d.toName : d.fromName}`, qs, kind: 'duel', onDone: async (res) => {
    const ok = res.filter(x => x.ok).length, t = Math.round(res.reduce((s, x) => s + (x.t || 0), 0));
    await DB.submitDuel(S.team, d.id, S.pid, { ok, t });
    const other = d.from === S.pid ? d.to : d.from; const them = d.results?.[other];
    addXP(15);
    if (them && (ok > them.ok || (ok === them.ok && t < them.t))) { addXP(40); P().records.duelsWon++; confetti(); toast('🏆 ניצחת בדו-קרב! +40 XP', 'gold'); }
    save(true); duelScreen();
  } });
}

// ---------- טבלת אלופים ושיאים ----------
async function leaderboard() {
  const wk = weekKey();
  const players = (await DB.listPlayers(S.team)).map(x => x.id === S.pid ? { ...P(), id: S.pid } : x).sort((a, b) => (b.weekXp?.[wk] || 0) - (a.weekXp?.[wk] || 0));
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk">→</button><b>🏆 טבלת האלופים – השבוע</b><span></span></header>
  <main class="list-screen">${players.map((x, i) => `<div class="lb-row ${x.id === S.pid ? 'me' : ''}"><span class="lb-n">${['🥇', '🥈', '🥉'][i] || i + 1}</span><span class="mini-h">${heroSVG(x)}</span><span class="lb-name"><b>${esc(x.name)}</b><small>רמה ${x.level} · ${rankOf(x.level)}</small></span><span class="lb-xp">${x.weekXp?.[wk] || 0} XP</span></div>`).join('')}
  <p class="muted small">הטבלה מתאפסת בכל יום ראשון. מזמינים חברים עם קוד הצוות: <b dir="ltr">${S.team}</b></p></main>`);
  $('#bk').onclick = home;
}
function recordsScreen() {
  const p = P(); const r = p.records;
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); const k = today(d); return { l: String(d.getDate()), v: Math.round((p.days[k]?.sec || 0) / 60) }; });
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk">→</button><b>📊 השיאים שלי</b><span></span></header>
  <main class="list-screen"><div class="rec-grid">
    <div><b>${p.bestStreak}</b><small>רצף ימים שיא 🔥</small></div><div><b>${r.bestCombo}</b><small>קומבו שיא</small></div>
    <div><b>${r.bestBoss}%</b><small>שיא קרב בוס</small></div><div><b>${r.totalQ}</b><small>שאלות שנפתרו</small></div>
    <div><b>${r.totalQ ? Math.round(r.totalOk / r.totalQ * 100) : 0}%</b><small>דיוק כללי</small></div><div><b>${r.duelsWon}</b><small>ניצחונות בדו-קרב</small></div></div>
    <h4>דקות אימון – שבועיים אחרונים</h4>${bars(days, { goal: goalMin() })}
    <h4>שליטה בפרקים</h4>${CH_ORDER.map(ch => { const c = p.ch[ch]; return `<div class="mast-row"><span>${CHAPTERS[ch].icon} ${CHAPTERS[ch].name}</span><span class="mastery big"><i style="width:${c.lvl / 5 * 100}%;background:${CHAPTERS[ch].color}"></i></span><small>${c.n ? Math.round(c.ok / c.n * 100) + '%' : '–'}</small></div>`; }).join('')}
  </main>`);
  $('#bk').onclick = home;
}

// ---------- הורה ----------
function parentEntry(code) {
  pinPad('מסך הורה – קוד הורה', async pin => {
    const team = await DB.getTeam(code); if (!team) { toast('צוות לא נמצא'); return startScreen(); }
    if (await DB.sha(pin) !== team.parentPinHash) { toast('קוד שגוי'); return parentEntry(code); }
    S.team = code; S.teamData = team;
    parentScreen({ app, code, team, setScreen, back: () => S.p ? home() : startScreen(), mixed: n => mixedFor(n), pickOne });
  }, { back: () => S.p ? home() : startScreen() });
}
function mixedFor(n) { const out = [], avoid = new Set(); for (let i = 0; i < n; i++) out.push(pickOne(CH_ORDER[i % 6], 3, avoid)); return out.sort(() => Math.random() - .5); }

// ---------- אתחול ----------
$('#comms-btn').onclick = () => S.p && comms();
window.addEventListener('beforeunload', () => DB.flushSave());
boot();
