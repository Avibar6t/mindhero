// MindHero – האפליקציה הראשית
import * as DB from './store.js?v=19';
import { LS } from './store.js?v=19';
import { CHAPTERS, CH_ORDER, VERBAL, ANALOGY, LOGIC, MATH, ACADEMY } from './bank.js?v=19';
import { generate } from './gen.js?v=19';
import { STYLES, SKINS, ITEMS, POWERS, SLOT_HE, heroSVG, itemName, strongestPowerColor, levelUpOffers, rankOf, xpForLevel } from './hero.js?v=19';
import { $, $$, esc, toast, modal, beep, confetti, sound, prepareQ, isCorrect, answerText, renderQuestion, markResult, today, weekKey, fmtTime, isMobile, bars, LETTERS, bm, explainHTML } from './ui.js?v=19';
import { ic, moodFace, lobbyScene } from './icons.js?v=19';
import { TOPICS, topicById, grid100 } from './learn.js?v=19';
import { startExam } from './exam.js?v=19';
import { parentScreen } from './parent.js?v=19';

const app = $('#app');
export const S = { team: null, teamData: null, pid: null, p: null, active: false, lastInput: Date.now(), inQuestion: null, messages: [] };
const BANK = { verbal: VERBAL, analogy: ANALOGY, logic: LOGIC, math: MATH };
const MENTOR = 'פרופסור מיינד';

// ================== עזרי שחקן ==================
function newPlayer({ name, style, skin, pinHash }) {
  const ch = {}; CH_ORDER.forEach(c => ch[c] = { lvl: 2, n: 0, ok: 0, time: 0 });
  return { learned: {}, learnStep: {}, name, style, skin, pinHash, created: Date.now(), level: 1, xp: 0, coins: 50, items: [], equip: {}, powers: {}, ch, seen: {}, mistakes: [], days: {}, streak: 0, bestStreak: 0, lastGoalDay: null, freezeUsed: {}, academy: {}, diag: false, records: { bestBoss: 0, bestCombo: 0, sims: [], totalQ: 0, totalOk: 0, duelsWon: 0 }, daily: null, weekXp: {}, pendingLevels: 0 };
}
const P = () => S.p;
const save = (now) => DB.savePlayer(S.team, S.pid, S.p, now);
const goalMin = () => S.teamData?.goalMin || 60;
const dayRec = (d = today()) => (P().days[d] = P().days[d] || { sec: 0, q: 0, ok: 0, xp: 0 });
const pw = id => P().powers?.[id] || 0;

function addXP(n) {
  const p = P(); n = Math.round(n);
  p.xp += n; dayRec().xp += n; if (S.act) S.act.xp += n; const wk = weekKey(); p.weekXp[wk] = (p.weekXp[wk] || 0) + n;
  while (p.xp >= xpForLevel(p.level)) { p.xp -= xpForLevel(p.level); p.level++; p.pendingLevels = (p.pendingLevels || 0) + 1; }
}
// ----- יומן פעילות להורה -----
function startAct(kind, title) {
  if (S.act) endAct();
  if (!S.p) return; S.act = { kind, title, t: Date.now(), sec: 0, q: 0, ok: 0, xp: 0 };
}
function endAct(extra) {
  const a = S.act; S.act = null; if (!a || !S.p) return;
  if (extra) Object.assign(a, extra);
  if (a.sec < 20 && !a.q && !a.done && !extra) return; // פעילות של שניות בודדות לא נרשמת
  const p = P(); p.log = p.log || {}; const d = today(new Date(a.t));
  (p.log[d] = p.log[d] || []).push(a); if (p.log[d].length > 40) p.log[d].shift();
  const keep = Object.keys(p.log).sort().slice(-14); Object.keys(p.log).forEach(k => { if (!keep.includes(k)) delete p.log[k]; });
  save();
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
  const d = dayRec(); d.sec++; tickN++; if (S.act) S.act.sec++;
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
  toast(`השלמת ${goalMin()} דקות אימון היום! +80 מטבעות, +50 XP · רצף: ${p.streak} ימים`, 'gold');
}

// ================== בחירת שאלות ==================
const clampD = x => Math.max(1, Math.min(5, Math.round(x)));
export function pickOne(ch, diff, avoid = new Set()) {
  const p = P(); const bank = BANK[ch] || [];
  const genable = ['series', 'math', 'shapes'].includes(ch);
  const useBank = bank.length && (!genable || Math.random() < 0.4);
  if (useBank) {
    const learned = p?.learned;
    const scored = bank.filter(q => !avoid.has(q.id) && (!learned || !q.topic || learned[q.topic])).map(q => {
      const s = p?.seen?.[q.id];
      return [Math.abs(q.diff - diff) * 1.2 + (s ? s.n * 0.9 - (s.lastOk ? 0 : 0.8) : 0) + Math.random() * 0.8, q];
    }).sort((a, b) => a[0] - b[0]);
    if (scored.length) { avoid.add(scored[0][1].id); return prepareQ(scored[0][1]); }
  }
  if (genable) { const q = generate(ch, diff, (Math.random() * 1e9) | 0, p?.learned); avoid.add(q.id); return prepareQ(q); }
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
  if (p.daily?.date === today() && /^[a-z0-9]+$/.test(p.daily.missions[0]?.icon || '')) return p.daily;
  const keepDone = p.daily?.date === today() ? p.daily.done : {};
  const missions = [];
  if (!p.diag) {
    missions.push({ id: 'diag', kind: 'diag', icon: 'radar', title: 'משימת גילוי', sub: '18 שאלות – נגלה את נקודות הכוח שלך', min: 20 });
    missions.push({ id: 'acad', kind: 'acad', icon: 'academy', title: 'שיעור באקדמיה', sub: 'טקטיקה אחת שתעזור במבחן', min: 3 });
    missions.push({ id: 'warm', kind: 'mixed', n: 8, icon: 'flame', title: 'סבב אימון ראשון', sub: '8 שאלות מכל הפרקים', min: 10 });
    missions.push({ id: 'mood', kind: 'mood', icon: 'chat', title: 'דיווח סוף יום', sub: 'איך היה לך היום?', min: 1 });
  } else {
    const [w1, w2] = weakest();
    missions.push({ id: 'warm', kind: 'mixed', n: 6, icon: 'flame', title: 'חימום', sub: '6 שאלות מעורבות', min: 6 });
    const nextTopic = TOPICS.find(t => !(p.learned || {})[t.id]);
    if (nextTopic) missions.push({ id: 'learn', kind: 'learn', topic: nextTopic.id, icon: 'bulb', title: `נושא חדש: ${nextTopic.title}`, sub: 'לומדים מאפס – הסבר, דוגמאות ותרגול', min: 12 });
    missions.push({ id: 'f1', kind: 'focus', ch: w1, n: 10, icon: w1, title: `אימון ממוקד: ${CHAPTERS[w1].name}`, sub: 'הפרק שהכי כדאי לחזק עכשיו', min: 12 });
    missions.push({ id: 'acad', kind: 'acad', icon: 'academy', title: 'שיעור באקדמיה', sub: 'טקטיקת מבחן', min: 3 });
    missions.push({ id: 'f2', kind: 'focus', ch: w2, n: 10, icon: w2, title: `אימון ממוקד: ${CHAPTERS[w2].name}`, sub: 'עוד פרק לחיזוק', min: 12 });
    missions.push({ id: 'boss', kind: 'boss', n: 12, icon: 'boss', title: 'קרב בוס', sub: '12 שאלות בשעון – כמו במבחן', min: 15 });
    missions.push({ id: 'lab', kind: 'lab', icon: 'flask', title: 'מעבדת טעויות', sub: p.mistakes.length ? `${Math.min(8, p.mistakes.length)} שאלות שכדאי לנסות שוב` : 'סבב מהירות', min: 8 });
    missions.push({ id: 'mood', kind: 'mood', icon: 'chat', title: 'דיווח סוף יום', sub: 'איך היה לך היום?', min: 1 });
  }
  p.daily = { date: today(), missions, done: keepDone };
  save(); return p.daily;
}

// ================== מסכים ==================
let keyHandler = null;
function setScreen(html, { active = false, cls = '' } = {}) {
  if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
  if (!active && S.act && !S.keepAct) endAct();
  S.active = active; S.inQuestion = null;
  app.className = cls; app.innerHTML = html; window.scrollTo(0, 0);
  $('#comms-btn').style.display = S.p ? 'flex' : 'none';
}

async function boot() {
  app.innerHTML = `<div class="center-screen"><div class="logo-big">Mind<span>Hero</span></div><div class="loader"></div><p class="muted">מתחבר לבסיס...</p></div>`;
  await DB.initCloud();
  const url = new URL(location.href); const tcode = url.searchParams.get('team');
  const sess = LS.get('mh_session', null);
  const chId = url.searchParams.get('challenge'); if (chId) return guestChallenge(chId);
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
  const line = [['tactical', { head: 'visor', weapon: 'blaster', emblem: 'eye' }], ['comic', { back: 'cape', emblem: 'bolt', head: 'mask', weapon2: 'shield' }], ['pixel', { weapon: 'sword', head: 'helmet' }]];
  setScreen(`<div class="center-screen start">
    <div class="start-lineup">${line.map(([s, e], i) => `<div class="${i === 1 ? '' : 'side'}" style="height:${i === 1 ? 100 : 80}%">${heroSVG({ style: s, skin: SKINS[i + 1], equip: e })}</div>`).join('')}</div>
    <div class="logo-big">Mind<span>Hero</span></div>
    <p class="tag">אימון יומי למבחן המחוננים. כל תשובה מחזקת את הגיבור שלך.</p>
    <div class="stack">
      <input id="code" class="big-in" placeholder="קוד צוות" dir="ltr" maxlength="8" autocomplete="off"/>
      <button class="btn primary big" id="join">כניסה לצוות</button>
      <button class="btn" id="newteam">${ic('parent')} פתיחת צוות חדש (להורים)</button>
      <button class="btn link" id="parent">כניסה למסך הורה</button>
    </div>
    ${DB.isCloud() ? '' : '<p class="warn">אין חיבור לענן. ההתקדמות תישמר רק במכשיר הזה.</p>'}
  </div>`);
  const code = () => $('#code').value.trim().toUpperCase();
  $('#join').onclick = () => code() ? joinTeam(code()) : toast('הקלידו את קוד הצוות');
  $('#code').onkeydown = e => { if (e.key === 'Enter') $('#join').click(); };
  $('#newteam').onclick = createTeamScreen;
  $('#parent').onclick = () => code() ? parentEntry(code()) : toast('הקלידו קודם את קוד הצוות');
}
function pinPad(title, onDone, { sub = '', back } = {}) {
  let v = '';
  setScreen(`<div class="center-screen"><h2>${title}</h2>${sub ? `<p class="muted">${sub}</p>` : ''}<div class="pin-dots">${'<i></i>'.repeat(4)}</div>
    <div class="pinpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map(k => `<button data-k="${k}">${k}</button>`).join('')}</div>${isMobile() ? '' : '<p class="pin-hint">אפשר להקליד גם מהמקלדת</p>'}
    ${back ? '<button class="btn link" id="pback">חזרה</button>' : ''}</div>`);
  const draw = () => $$('.pin-dots i').forEach((d, i) => d.classList.toggle('on', i < v.length));
  let done = false;
  const press = k => {
    if (done) return; beep('click');
    const btn = $(`.pinpad button[data-k="${k}"]`); if (btn) { btn.classList.add('pressed'); setTimeout(() => btn.classList.remove('pressed'), 120); }
    if (k === '⌫') v = v.slice(0, -1); else if (k === '✓') { if (v.length === 4) { done = true; onDone(v); } } else if (v.length < 4) { v += k; if (v.length === 4) { done = true; draw(); onDone(v); return; } }
    draw();
  };
  $$('.pinpad button').forEach(b => b.onclick = () => press(b.dataset.k));
  keyHandler = e => {
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace' || e.key === 'Delete') press('⌫');
    else if (e.key === 'Enter') press('✓');
    else if (e.key === 'Escape' && back) back();
    else return;
    e.preventDefault();
  };
  document.addEventListener('keydown', keyHandler);
  if (back) $('#pback').onclick = back;
}

function createTeamScreen() {
  setScreen(`<div class="center-screen"><h2>צוות חדש</h2><p class="muted">איך הילדים יקראו לך?</p>
    <div class="stack"><input id="pn" class="big-in" maxlength="14" value="אבא"/><button class="btn primary big" id="pnext">המשך</button><button class="btn link" id="pb">חזרה</button></div></div>`);
  $('#pb').onclick = startScreen;
  $('#pn').onkeydown = e => { if (e.key === 'Enter') $('#pnext').click(); };
  $('#pnext').onclick = () => {
    const pname = $('#pn').value.trim() || 'אבא';
    pinPad('בחרו קוד הורה', pin1 => pinPad('הקלידו שוב לאימות', async pin2 => {
      if (pin1 !== pin2) { toast('הקודים לא תואמים. נסו שוב.'); return createTeamScreen(); }
      const code = await DB.createTeam({ parents: [{ id: 'parent', name: pname, pinHash: await DB.sha(pin1) }], goalMin: 60 });
      const link = `${location.origin}${location.pathname}?team=${code}`;
      setScreen(`<div class="center-screen"><h2>הצוות מוכן</h2>
        <p class="muted">קוד הצוות – איתו הילדים נכנסים מכל מחשב או טלפון:</p><div class="team-code">${code}</div>
        <p class="muted">או קישור ישיר:</p><div class="linkbox" dir="ltr">${esc(link)}</div>
        <button class="btn" id="copy">העתקת הקישור</button>
        <p class="muted small">הורה נוסף? אפשר להוסיף במסך ההורה, בלשונית "הגדרות".</p>
        <button class="btn primary big" id="go">יצירת הגיבור הראשון</button></div>`);
      $('#copy').onclick = () => { navigator.clipboard?.writeText(link); toast('הקישור הועתק'); };
      $('#go').onclick = () => joinTeam(code);
    }, { back: createTeamScreen }), { sub: '4 ספרות. איתו נכנסים למסך ההורה – כדאי לא לגלות לילדים.', back: createTeamScreen });
  };
}
async function joinTeam(code) {
  const team = await DB.getTeam(code);
  if (!team) { toast('לא נמצא צוות עם הקוד הזה. בדקו את האותיות ונסו שוב.'); return startScreen(); }
  S.team = code; S.teamData = team;
  const players = await DB.listPlayers(code);
  setScreen(`<div class="center-screen"><h2>מי מתאמן היום?</h2>
    <div class="hero-pick">${players.map(pl => `<button class="hp" data-id="${pl.id}"><div class="hp-svg">${heroSVG(pl, { aura: strongestPowerColor(pl) })}</div><b>${esc(pl.name)}</b><small>רמה ${pl.level} · ${rankOf(pl.level)}</small></button>`).join('')}
      <button class="hp new" id="newhero"><div class="plus">${ic('star')}</div><b>גיבור חדש</b><small>מתחילים מרמה 1</small></button></div>
    <button class="btn link" id="back">חזרה</button></div>`);
  $$('.hp[data-id]').forEach(b => b.onclick = () => {
    const pl = players.find(x => x.id === b.dataset.id);
    pinPad(`${esc(pl.name)}, הקוד הסודי שלך`, async pin => {
      if (await DB.sha(pin) !== pl.pinHash) { toast('הקוד לא נכון. נסה שוב.'); return joinTeam(code); }
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
    setScreen(`<div class="onb"><div class="mentor-say">${mentorFace()}<div class="bubble">היי! אני <b>${MENTOR}</b>, המנטורית שלך.<br>בכל יום שתתאמן כאן הגיבור שלך יתחזק – ציוד, נשק וכוחות תודעה. וכשתגיע למבחן המחוננים, תרגיש שאתה כבר מכיר אותו.<br><b>באיזה עולם הגיבור שלך חי?</b></div></div>
      <div class="style-cards">${Object.entries(STYLES).map(([k, s]) => `<button class="style-card" data-s="${k}"><div class="sc-stage">${lobbyScene(k)}<div class="sc-svg">${heroSVG({ style: k, skin: st.skin, equip: k === 'pixel' ? { weapon: 'sword', head: 'helmet' } : k === 'comic' ? { back: 'cape', emblem: 'bolt', head: 'mask' } : { head: 'visor', weapon: 'blaster', emblem: 'eye' } })}</div></div><b>${s.name}</b><small>${s.desc}</small></button>`).join('')}</div></div>`);
    $$('.style-card').forEach(b => b.onclick = () => { st.style = b.dataset.s; beep('click'); step2(); });
  };
  const step2 = () => {
    setScreen(`<div class="onb two"><div class="onb-prev" id="prev"></div><div class="onb-form">
      <h2>איך קוראים לגיבור שלך?</h2>
      <input id="hn" class="big-in" maxlength="16" placeholder="שם הגיבור" value="${esc(st.name)}"/>
      <h3>גוון עור</h3><div class="skins">${SKINS.map(s => `<button class="skin ${s === st.skin ? 'on' : ''}" data-s="${s}" style="background:${s}" aria-label="גוון עור"></button>`).join('')}</div>
      <button class="btn primary big" id="next">המשך</button><button class="btn link" id="b">חזרה לבחירת עולם</button></div></div>`);
    const prev = () => $('#prev').innerHTML = lobbyScene(st.style) + heroSVG({ style: st.style, skin: st.skin, equip: {} }) + `<div class="prev-name">${esc(st.name || 'הגיבור שלך')}</div>`;
    prev();
    $('#hn').oninput = e => { st.name = e.target.value.trim(); $('.prev-name').textContent = st.name || 'הגיבור שלך'; };
    $('#hn').onkeydown = e => { if (e.key === 'Enter') $('#next').click(); };
    $$('.skin').forEach(b => b.onclick = () => { st.skin = b.dataset.s; $$('.skin').forEach(x => x.classList.toggle('on', x === b)); prev(); });
    $('#b').onclick = step1;
    $('#next').onclick = () => { if (st.name.length < 2) return toast('צריך שם של לפחות 2 אותיות'); step3(); };
  };
  const step3 = () => pinPad('בחר קוד סודי בן 4 ספרות', p1 => pinPad('הקלד אותו שוב', async p2 => {
    if (p1 !== p2) { toast('הקודים לא תואמים. נסה שוב.'); return step3(); }
    const pl = newPlayer({ name: st.name, style: st.style, skin: st.skin, pinHash: await DB.sha(p1) });
    S.pid = 'h' + DB.newCode(9).toLowerCase(); S.p = pl; LS.set('mh_session', { team: S.team, pid: S.pid });
    save(true); step4();
  }), { sub: 'איתו תיכנס מכל מכשיר – מחשב או טלפון', back: step2 });
  const step4 = () => {
    const starters = { pixel: ['sword', 'shield', 'headband'], comic: ['cape', 'mask', 'bolt'], tactical: ['visor', 'blaster', 'star'] }[st.style];
    setScreen(`<div class="center-screen"><div class="mentor-say">${mentorFace()}<div class="bubble">כל גיבור מתחיל עם פריט אחד. <b>בחר את הפריט הראשון שלך.</b><br>בכל עליית רמה תבחר עוד פריט או כוח.</div></div>
      <div class="offers">${starters.map(id => `<button class="offer r1" data-id="${id}"><div class="o-svg">${heroSVG({ style: st.style, skin: st.skin, equip: { [ITEMS[id].slot]: id } })}</div><span class="o-kind">${SLOT_HE[ITEMS[id].slot]}</span><b>${itemName(id, st.style)}</b><small>${ITEMS[id].desc}</small></button>`).join('')}</div></div>`);
    $$('.offer').forEach(b => b.onclick = () => {
      const id = b.dataset.id; P().items.push(id); P().equip[ITEMS[id].slot] = id; save(true); beep('level'); confetti();
      home();
      setTimeout(() => mentorPopup(`ברוך הבא, <b>${esc(P().name)}</b>!<br>המשימה הראשונה היא <b>משימת גילוי</b>: 18 שאלות מכל ששת הפרקים של המבחן. אין כאן ציון – רק כדי שאדע מאיפה להתחיל איתך.<br><br>כפתור הקשר בפינה פתוח תמיד: אפשר לבקש רמז, או לספר לי איך אתה מרגיש.`, [{ t: 'מתחילים', primary: true }]), 600);
    });
  };
  step1();
}
let mfN = 0;
const mentorFace = () => { const u = 'mf' + (++mfN); return `<div class="mentor"><svg viewBox="0 0 100 100"><defs>
<radialGradient id="${u}bg" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#4c1d95"/><stop offset="1" stop-color="#0f172a"/></radialGradient>
<radialGradient id="${u}sk" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#fde3c8"/><stop offset=".75" stop-color="#f3c9a1"/><stop offset="1" stop-color="#d9a77c"/></radialGradient>
<linearGradient id="${u}hr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b45309"/><stop offset="1" stop-color="#7c2d12"/></linearGradient>
<linearGradient id="${u}ct" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cbd5e1"/></linearGradient>
<clipPath id="${u}c"><circle cx="50" cy="50" r="48"/></clipPath></defs>
<circle cx="50" cy="50" r="48" fill="url(#${u}bg)"/>
<g clip-path="url(#${u}c)" stroke="#1e1b4b" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
<path d="M22 46 C18 70 26 86 34 92 L66 92 C74 86 82 70 78 46 Z" fill="url(#${u}hr)"/>
<path d="M14 104 C14 84 30 76 50 76 C70 76 86 84 86 104 Z" fill="url(#${u}ct)"/>
<path d="M40 77 L50 92 L60 77 C56 75 44 75 40 77 Z" fill="#7c3aed"/>
<path d="M40 77 L46 98 M60 77 L54 98" fill="none"/>
<rect x="44" y="64" width="12" height="13" rx="4" fill="#e7b48b"/>
<path d="M28 48 C28 30 38 22 50 22 C62 22 72 30 72 48 C72 64 62 74 50 74 C38 74 28 64 28 48 Z" fill="url(#${u}sk)"/>
<circle cx="50" cy="14" r="9" fill="url(#${u}hr)"/>
<path d="M27 52 C22 30 34 18 50 19 C66 18 78 30 73 52 C70 40 66 34 60 31 C52 36 40 37 33 34 C30 39 28 45 27 52 Z" fill="url(#${u}hr)"/>
<path d="M36 26 Q44 21 54 23" stroke="#fdba74" stroke-width="2" fill="none" opacity=".7"/>
<path d="M35 44 Q40 41 45 43 M55 43 Q60 41 65 44" stroke="#5b2a12" stroke-width="2.2" fill="none"/>
<ellipse cx="40" cy="51" rx="3" ry="3.6" fill="#1e1b4b" stroke="none"/><ellipse cx="60" cy="51" rx="3" ry="3.6" fill="#1e1b4b" stroke="none"/>
<circle cx="41" cy="49.6" r="1.1" fill="#fff" stroke="none"/><circle cx="61" cy="49.6" r="1.1" fill="#fff" stroke="none"/>
<circle cx="40" cy="51" r="8.5" fill="#a5f3fc" fill-opacity=".18" stroke="#d4a017" stroke-width="2"/><circle cx="60" cy="51" r="8.5" fill="#a5f3fc" fill-opacity=".18" stroke="#d4a017" stroke-width="2"/>
<path d="M48.5 51 Q50 49 51.5 51" stroke="#d4a017" stroke-width="2" fill="none"/>
<path d="M35 47 l3 -2" stroke="#fff" stroke-width="1.4" opacity=".8"/><path d="M55 47 l3 -2" stroke="#fff" stroke-width="1.4" opacity=".8"/>
<ellipse cx="33" cy="61" rx="4" ry="2.2" fill="#fb7185" opacity=".35" stroke="none"/><ellipse cx="67" cy="61" rx="4" ry="2.2" fill="#fb7185" opacity=".35" stroke="none"/>
<path d="M43 63 Q50 68 57 63" stroke="#9f1239" stroke-width="2" fill="none"/>
<circle cx="29" cy="58" r="1.8" fill="#22d3ee" stroke="none"/>
</g>
<g transform="translate(80 22)"><circle r="3" fill="#22d3ee"/><ellipse rx="10" ry="4" fill="none" stroke="#67e8f9" stroke-width="1.4"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite"/></ellipse><ellipse rx="10" ry="4" fill="none" stroke="#c4b5fd" stroke-width="1.4" transform="rotate(60)"/></g>
<circle cx="50" cy="50" r="48" fill="none" stroke="#67e8f9" stroke-width="2.5"><animate attributeName="stroke-opacity" values="1;.4;1" dur="2.6s" repeatCount="indefinite"/></circle>
</svg></div>`; };
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
  const doneN = plan.missions.filter(m => plan.done[m.id]).length;
  setScreen(`
  <header class="topbar"><div class="tb-name"><span class="rank-badge" title="רמה">${p.level}</span><div><b>${esc(p.name)}</b><small>${rankOf(p.level)}</small></div></div>
    <div class="tb-stats"><span class="stat" title="מטבעות">${ic('coin')}${p.coins}</span><span class="stat streak ${st ? '' : 'off'}" title="ימים ברצף שבהם הושלם היעד">${ic('flame')}${st}</span><button class="icon-btn" id="snd" aria-label="צלילים">${ic(sound.on ? 'sound' : 'mute')}</button></div></header>
  <main class="home">
    <section class="lobby">
      <div class="stage">${lobbyScene(p.style)}<div class="platform"></div>${heroSVG(p, { aura: strongestPowerColor(p) })}</div>
      <div class="lobby-info">
        <div class="xpbar"><div style="width:${(p.xp / xpNeed) * 100}%"></div></div>
        <div class="xp-row"><span>עוד ${xpNeed - p.xp} XP לרמה ${p.level + 1}</span><b>${p.xp}/${xpNeed}</b></div>
        <div class="powers-row">${Object.entries(p.powers).map(([k, l]) => `<span class="pw-chip" style="--c:${POWERS[k].color}" title="${POWERS[k].name}: ${POWERS[k].desc(l)}">${ic(k)}${l}</span>`).join('') || '<small class="muted">כוחות תודעה נפתחים בעליית רמה</small>'}</div>
        <div class="hero-actions"><button class="btn small" id="wardrobe">${ic('armor')} ציוד</button><button class="btn small" id="powers">${ic('spark')} כוחות</button></div>
      </div>
    </section>
    <div class="side">
      <section class="today ${d.goal ? 'goal' : ''}">
        <div class="ring-wrap"><svg viewBox="0 0 120 120" class="ring"><circle cx="60" cy="60" r="52" class="r-bg"/><circle cx="60" cy="60" r="52" class="r-fg" style="stroke-dasharray:${pct * 326.7} 400"/></svg><div class="ring-txt"><b>${min}</b><small>מתוך ${goal} דק׳</small></div></div>
        <div><h2>${d.goal ? 'היעד היומי הושלם' : 'האימון של היום'}</h2>
          ${exam != null && exam >= 0 ? `<div class="countdown">${ic('clock')} עוד ${exam} ימים למבחן</div>` : ''}
          <p class="muted" style="margin:4px 0 0">${d.goal ? 'כל דקה נוספת מוסיפה XP ומטבעות.' : `עוד ${Math.max(0, goal - min)} דקות לתיבת האוצר היומית.`}</p></div>
      </section>
      <div id="msg-banner"></div>
      <section class="quest"><h3>המסלול של היום <small>${doneN}/${plan.missions.length} הושלמו</small></h3><div class="path">
        ${plan.missions.map((m, i) => { const done = plan.done[m.id]; const next = !done && plan.missions.slice(0, i).every(x => plan.done[x.id]); const lock = !p.diag && m.kind !== 'diag'; const dn = m.kind === 'diag' ? (p.diagState?.res?.length || 0) : 0;
          return `<button class="mission ${done ? 'done' : ''} ${next ? 'next' : ''} ${lock ? 'locked' : ''}" data-id="${m.id}"><span class="node">${ic(done ? 'check' : lock ? 'lock' : m.icon)}</span><span class="m-t"><b>${m.title}</b><small>${dn ? `עצרת בשאלה ${dn + 1} מתוך 18 – ממשיכים מאותה נקודה` : m.sub}</small></span>${next ? `<span class="go">${dn ? 'המשך' : 'התחלה'}</span>` : `<span class="m-min">${ic('clock')}${m.min}′</span>`}</button>`; }).join('')}
      </div></section>
    </div>
  </main>
  <footer class="foot"><button class="btn link" id="switch">${ic('switch')} החלפת גיבור</button><button class="btn link" id="parentbtn">${ic('parent')} מסך הורה</button></footer>
  <nav class="dock">
    <button data-go="practice">${ic('target')}אימון</button><button data-go="academy">${ic('academy')}אקדמיה</button><button data-go="sim">${ic('exam')}סימולציה</button>
    <button data-go="duel">${ic('duel')}דו-קרב</button><button data-go="board">${ic('trophy')}אלופים</button><button data-go="records">${ic('chart')}התקדמות</button>
  </nav>`);
  $('#snd').onclick = () => { sound.on = !sound.on; localStorage.setItem('mh_sound', sound.on ? '1' : '0'); home(); };
  $('#wardrobe').onclick = wardrobe; $('#powers').onclick = powersScreen;
  const lockedMsg = () => mentorPopup(`קודם מסיימים את <b>משימת הגילוי</b>. ${p.diagState?.res?.length ? `נשארו לך ${18 - p.diagState.res.length} שאלות.` : '18 שאלות, אפשר לעצור ולחזור מתי שרוצים.'}<br>ככה אדע בדיוק מה הרמה שלך בכל פרק, ואבנה לך אימון שמתאים רק לך. אחרי זה כל המשחק נפתח.`, [{ t: 'למשימת הגילוי', primary: true, fn: () => startMission(plan.missions.find(m => m.kind === 'diag')) }, { t: 'אחר כך' }]);
  $$('.mission').forEach(b => b.onclick = () => b.classList.contains('locked') ? lockedMsg() : startMission(plan.missions.find(m => m.id === b.dataset.id)));
  const go = { practice: practicePick, academy: academy, sim: simPick, duel: duelScreen, board: leaderboard, records: recordsScreen };
  $$('.dock button').forEach(b => { if (!p.diag) b.classList.add('locked'); b.onclick = () => p.diag ? go[b.dataset.go]() : lockedMsg(); });
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
  b.innerHTML = mine.map(m => `<div class="banner msg" data-id="${m.id}">${ic('mail')}<span><b>${esc(m.fromName || 'הורה')}:</b> ${esc(m.text)}</span><button class="btn small">קראתי</button></div>`).join('')
    + duels.map(d => `<div class="banner duel" data-d="${d.id}">${ic('duel')}<span><b>${esc(d.fromName)}</b> מאתגר אותך לדו-קרב</span><button class="btn small primary">לקרב</button></div>`).join('');
  $$('.banner.msg', b).forEach(x => $('button', x).onclick = async () => { await DB.markRead(S.team, x.dataset.id); x.remove(); addXP(5); save(); beep('coin'); });
  $$('.banner.duel', b).forEach(x => $('button', x).onclick = () => playDuel(duels.find(d => d.id === x.dataset.d)));
}
// ---------- משימות ----------
function startMission(m) {
  const p = P();
  const done = () => { const plan = dailyPlan(); plan.done[m.id] = true; save(); };
  if (m.kind === 'diag') {
    if (!p.diagState) { p.diagState = { qs: buildQs(CH_ORDER.map(ch => ({ ch, n: 3, diffs: [2, 3, 4] }))).sort(() => Math.random() - .5), res: [] }; save(true); }
    const ds = p.diagState;
    return runQuiz({ title: 'משימת גילוי', qs: ds.qs.map(q => JSON.parse(JSON.stringify(q))), prior: ds.res, kind: 'diag', onDone: (res) => {
      const per = {};
      CH_ORDER.forEach(ch => { const r = res.filter(x => x.q.ch === ch); const ok = r.filter(x => x.ok).length; per[ch] = ok; p.ch[ch].lvl = 1.5 + ok; });
      p.diagResult = { date: today(), per }; delete p.diagState;
      p.diag = true; done(); p.daily = null; save(true);
      const sorted = CH_ORDER.slice().sort((a, b) => p.ch[b].lvl - p.ch[a].lvl);
      mentorPopup(`סיימת את משימת הגילוי.<br><br><b>החוזקות שלך:</b> <b>${CHAPTERS[sorted[0]].name}</b> ו<b>${CHAPTERS[sorted[1]].name}</b>.<br><b>כדאי לחזק:</b> <b>${CHAPTERS[sorted[5]].name}</b> ו<b>${CHAPTERS[sorted[4]].name}</b>.<br><br>מעכשיו לוח המשימות היומי ייבנה במיוחד בשבילך.`, [{ t: 'מעולה!', primary: true, fn: home }]);
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
  if (m.kind === 'learn') return lessonPlayer(topicById(m.topic), () => { if (P().learned?.[m.topic]) done(); home(); });
  if (m.kind === 'mood') return moodReport(() => { done(); home(); });
}

function bossIntro(after) {
  const secs = Math.round(15 * 60 * (1 + pw('slow') * 0.1));
  const boss = ['סְפִינְקְס הסדרות', 'הגולם הלוגי', 'דרקון הצורות', 'מכשף המילים', 'רובוט החשבון'][new Date().getDate() % 5];
  mentorPopup(`<b>${boss}</b> חוסם את הדרך!<br>12 שאלות מכל הפרקים, ${Math.round(secs / 60)} דקות על השעון – בדיוק כמו במבחן:<br>• אין משוב עד הסוף.<br>• אפשר לדלג ולחזור.<br>• <b>לא משאירים שאלה ריקה</b> – אין עונש על ניחוש!`, [{ t: 'לקרב! ⚔️', primary: true, fn: () => runQuiz({ title: `קרב בוס: ${boss}`, qs: mixed(12), kind: 'boss', timed: secs, onDone: after }) }, { t: 'לא עכשיו' }]);
}

// ================== מנוע השאלות ==================
function runQuiz(cfg) {
  const prior = (cfg.prior || []).map(x => ({ q: { ch: x.ch, id: 'prev' }, ok: x.ok }));
  startAct(cfg.kind === 'diag' ? 'diag' : cfg.kind === 'boss' ? 'boss' : cfg.kind === 'lab' ? 'lab' : cfg.kind === 'duel' ? 'duel' : 'practice', cfg.title);
  const R = { ...cfg, i: prior.length, res: prior, resp: Array(cfg.qs.length).fill(null), combo: 0, maxCombo: 0, xp: 0, coins: 0,
    hawk: pw('hawk'), insight: pw('insight'), shield: pw('shield'), thr: 4 - pw('storm'), start: Date.now(), qStart: Date.now(), hintsUsed: 0, elim: {} };
  if (cfg.timed) R.endAt = Date.now() + cfg.timed * 1000;
  const boss = cfg.kind === 'boss';
  let timerInt = null;
  const quit = () => { clearInterval(timerInt); if (cfg.kind === 'diag') { save(true); toast(`ההתקדמות נשמרה: ${R.res.length}/${R.qs.length}. ממשיכים מאותה נקודה.`); return home(); } if (R.res.length && !boss) finish(); else home(); };

  const show = () => {
    const q = R.qs[R.i]; R.qStart = Date.now(); R.hintsUsed = 0; R.hintIdx = 0;
    S.inQuestion = { q, hint: giveHint };
    setScreen(`<div class="quiz ${boss ? 'boss' : ''}">
      <header class="qbar"><button class="icon-btn" id="qx">✕</button><b class="qtitle">${esc(cfg.title)}</b>
        <span class="qprog">${R.i + 1}/${R.qs.length}</span>${cfg.timed ? '<span class="timer" id="timer"></span>' : ''}${!boss ? `<span class="combo ${R.combo >= R.thr ? 'hot' : ''}" title="קומבו – תשובות נכונות ברצף">${ic('flame')}${R.combo}</span>` : ''}<span class="qmin" id="mini-ring">${Math.floor(dayRec().sec / 60)}′</span></header>
      ${boss ? `<div class="qnav">${R.qs.map((_, i) => `<button class="${i === R.i ? 'cur' : ''} ${R.resp[i] != null ? 'ans' : ''}" data-i="${i}">${i + 1}</button>`).join('')}</div>` : `<div class="dots">${R.qs.map((_, i) => `<i class="${i < R.res.length ? (R.res[i].ok ? 'ok' : 'no') : i === R.i ? 'cur' : ''}"></i>`).join('')}</div>`}
      <div class="qcard" id="qcard"></div>
      <div class="qtools" id="qtools"></div>
      <div id="fb"></div></div>`, { active: true });
    $('#qx').onclick = () => mentorPopup(boss ? 'לצאת מקרב הבוס? ההתקדמות בקרב לא תישמר.' : cfg.kind === 'diag' ? 'לעצור עכשיו? ההתקדמות נשמרת, ובפעם הבאה ממשיכים מאותה שאלה. כדי לפתוח את שאר המשחק צריך לסיים את משימת הגילוי.' : 'לצאת מהמשימה? מה שכבר פתרת נשמר.', [{ t: 'כן, לצאת', fn: quit }, { t: 'להמשיך', primary: true }]);
    if (cfg.timed) { const tick = () => { const left = (R.endAt - Date.now()) / 1000; const t = $('#timer'); if (t) { t.innerHTML = ic('clock') + fmtTime(left); t.classList.toggle('low', left < 120); } if (left <= 0) { clearInterval(timerInt); finishBoss(); } }; clearInterval(timerInt); tick(); timerInt = setInterval(tick, 500); }
    renderQuestion(q, $('#qcard'), { exam: boss, response: R.resp[R.i], eliminated: R.elim[R.i], onAnswer: (r, final) => boss ? bossAnswer(r) : (final && answer(r)) });
    tools();
    if (boss) $$('.qnav button').forEach(b => b.onclick = () => { R.i = +b.dataset.i; show(); });
  };
  const tools = () => {
    const q = R.qs[R.i]; const t = $('#qtools'); if (!t) return;
    if (boss) {
      t.innerHTML = `<button class="btn" id="prev" ${R.i === 0 ? 'disabled' : ''}>${ic('back')} הקודם</button>${R.i < R.qs.length - 1 ? `<button class="btn primary" id="nxt">הבא ${ic('next')}</button>` : '<button class="btn gold" id="fin">סיום הקרב ✓</button>'}`;
      $('#prev') && ($('#prev').onclick = () => { R.i--; show(); });
      $('#nxt') && ($('#nxt').onclick = () => { R.i++; show(); });
      $('#fin') && ($('#fin').onclick = () => { const empty = R.resp.filter(x => x == null || (Array.isArray(x) && x.some(y => !y))).length; if (empty) mentorPopup(`נשארו <b>${empty}</b> שאלות בלי תשובה. זכור – אין עונש על ניחוש! לסיים בכל זאת?`, [{ t: 'לחזור ולנחש', primary: true }, { t: 'לסיים', fn: finishBoss }]); else finishBoss(); });
      return;
    }
    const canHawk = R.hawk > 0 && (q.type === 'mc' || q.type === 'shape') && (R.elim[R.i] || []).length < 2;
    t.innerHTML = `<button class="btn small" id="hint">${ic('bulb')} רמז${R.insight > 0 ? ` · חינם ×${R.insight}` : ''}</button>${canHawk ? `<button class="btn small pw" id="hawk">${ic('hawk')} עין הנץ ×${R.hawk}</button>` : ''}`;
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
    $('#fb').insertAdjacentHTML('beforeend', `<div class="hint">${mentorFace()}<div><b>רמז ${R.hintIdx + 1}${free ? ' (בזכות כוח התובנה)' : ''}:</b> ${bm(q.hints[R.hintIdx])}</div></div>`);
    R.hintIdx++; beep('click');
    const hb = $('#hint');
    if (R.hintIdx >= q.hints.length) { if (hb) hb.outerHTML = `<button class="btn small" id="reveal">${ic('lock')} הסבר מלא</button>`; const rv = $('#reveal'); if (rv) rv.onclick = () => answer(null, true); }
    else if (hb) hb.innerHTML = `${ic('bulb')} רמז נוסף${R.insight > 0 ? ` · חינם ×${R.insight}` : ''}`;
  }

  function answer(r, revealed = false) {
    const q = R.qs[R.i]; const ok = !revealed && isCorrect(q, r); const p = P();
    const t = (Date.now() - R.qStart) / 1000;
    markResult(q, $('#qcard'), r);
    // סטטיסטיקה
    const c = p.ch[q.ch]; c.n++; if (ok) c.ok++; c.time += t; if (S.act) { S.act.q++; if (ok) S.act.ok++; }
    const delta = 0.22 * (1 + ((ok ? q.diff - c.lvl : c.lvl - q.diff) || 0) * 0.3);
    if (cfg.kind !== 'diag') c.lvl = Math.max(1, Math.min(5, c.lvl + (ok ? delta : -delta)));
    p.seen[q.id] = { n: (p.seen[q.id]?.n || 0) + 1, lastOk: ok };
    p.records.hints = (p.records.hints || 0) + R.hintIdx; if (revealed) p.records.reveals = (p.records.reveals || 0) + 1;
    p.records.qTime = (p.records.qTime || 0) + Math.min(t, 300);
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
    if (cfg.kind === 'diag' && p.diagState) p.diagState.res = R.res.map(x => ({ ch: x.q.ch, ok: x.ok }));
    beep(ok ? 'ok' : 'bad');
    const praise = ['מצוין', 'בול', 'יפה מאוד', 'כל הכבוד', 'חשיבה חדה', 'בדיוק ככה'];
    const comfort = ['לא נורא – עכשיו אתה יודע את הטריק.', 'טעות באימון היא נקודה שתרוויח במבחן.', 'גם גיבורים טועים. העיקר להבין למה.', 'זו בדיוק המטרה של אימון.'];
    $('#fb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}"><div class="fb-head">${ok ? `${ic('check')} ${praise[Math.floor(Math.random() * praise.length)]}${R.combo >= R.thr ? ` <span class="combo hot">${ic('flame')}${R.combo}</span>` : ''}<span class="xp">${ic('xp')}+${xp}</span>` : `${ic(revealed ? 'bulb' : 'x')} ${revealed ? 'הנה ההסבר' : comfort[Math.floor(Math.random() * comfort.length)]}`}</div>
      ${!ok ? `<div class="fb-ans">התשובה הנכונה: <b>${answerText(q)}</b></div>` : ''}<div class="fb-exp">${explainHTML(q)}</div>
      <button class="btn primary big" id="next">${R.i < R.qs.length - 1 ? 'לשאלה הבאה' : 'סיום המשימה'}</button></div>`;
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
      p.records.totalQ++; if (ok) p.records.totalOk++; const d = dayRec(); d.q++; if (ok) d.ok++; if (S.act) { S.act.q++; if (ok) S.act.ok++; }
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
    endAct({ done: true, score: extra.score, combo: R.maxCombo, total: R.res.length, totalOk: okN });
    addCoins(R.coins); p.records.bestCombo = Math.max(p.records.bestCombo, R.maxCombo); save(true);
    S.active = false;
    const review = R.res.filter(x => !x.ok);
    setScreen(`<div class="center-screen results">
      <h2>${boss ? (extra.score >= 60 ? 'הבוס הובס!' : 'הבוס נסוג – בינתיים') : 'המשימה הושלמה'}</h2>
      <div class="res-hero">${heroSVG(p, { aura: strongestPowerColor(p) })}</div>
      <div class="res-stats"><div><b>${okN}/${R.res.length}</b><small>נכונות</small></div><div class="gold"><b>+${R.xp}</b><small>XP</small></div><div class="gold"><b>+${Math.round(R.coins * (1 + pw('telek') * .1))}</b><small>מטבעות</small></div>${!boss ? `<div><b>${R.maxCombo}</b><small>קומבו שיא</small></div>` : `<div><b>${extra.score}%</b><small>ציון</small></div>`}</div>
      ${boss && extra.empty ? `<p class="warn">השארת ${extra.empty} שאלות ריקות. במבחן האמיתי – תמיד מנחשים.</p>` : ''}
      ${boss && review.length ? `<details class="review"><summary>מה היה כדאי לעשות אחרת? (${review.length})</summary>${review.map(x => `<div class="rv"><div class="rv-q">${x.q.q}</div><div class="rv-a">✔ ${answerText(x.q)}</div><div class="rv-e">${explainHTML(x.q)}</div></div>`).join('')}</details>` : ''}
      <button class="btn primary big" id="cont">המשך</button></div>`);
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
  const rar = o => o.kind === 'item' ? 'r' + Math.min(4, ITEMS[o.id].tier) : o.kind === 'power' ? 'r' + Math.min(4, o.lvl + 1) : 'r1';
  const rarName = { r1: 'רגיל', r2: 'נדיר', r3: 'אפי', r4: 'אגדי' };
  const m = modal(`<div class="levelup"><div class="lu-rays"></div><div class="lu-title">רמה ${p.level - p.pendingLevels + 1}</div><p class="lu-sub">${rankOf(p.level)} · בחר שדרוג אחד לגיבור</p>
    <div class="offers">${offers.map((o, i) => o.kind === 'item'
      ? `<button class="offer ${rar(o)}" data-i="${i}"><div class="o-svg">${heroSVG({ ...p, equip: { ...p.equip, [ITEMS[o.id].slot]: o.id } })}</div><span class="o-kind">${rarName[rar(o)]} · ${SLOT_HE[ITEMS[o.id].slot]}</span><b>${itemName(o.id, p.style)}</b><small>${ITEMS[o.id].desc}</small></button>`
      : o.kind === 'power' ? `<button class="offer ${rar(o)}" data-i="${i}"><div class="o-pw" style="--c:${POWERS[o.id].color}">${ic(o.id)}</div><span class="o-kind">${rarName[rar(o)]} · ${o.lvl > 1 ? 'שדרוג כוח לרמה ' + o.lvl : 'כוח תודעה'}</span><b>${POWERS[o.id].name}</b><small>${POWERS[o.id].desc(o.lvl)}</small></button>`
      : `<button class="offer r1" data-i="${i}"><div class="o-pw">${ic('coin')}</div><b>${o.amount} מטבעות</b></button>`).join('')}</div></div>`, { closable: false, cls: 'wide' });
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
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk" aria-label="חזרה">${ic('back')}</button><b>${ic('armor')} ציוד</b><span class="stat">${ic('coin')}${p.coins}</span></header>
  <main class="wardrobe"><div class="w-hero">${lobbyScene(p.style)}${heroSVG(p, { aura: strongestPowerColor(p) })}</div><div class="w-slots">
  ${slots.map(s => { const own = p.items.filter(id => ITEMS[id].slot === s); const shop = Object.keys(ITEMS).filter(id => ITEMS[id].slot === s && !p.items.includes(id));
    return `<div class="w-slot"><h4>${SLOT_HE[s]}</h4><div class="w-items"><button class="w-item ${!p.equip[s] ? 'on' : ''}" data-s="${s}" data-id="">ללא</button>${own.map(id => `<button class="w-item ${p.equip[s] === id ? 'on' : ''}" data-s="${s}" data-id="${id}">${p.equip[s] === id ? ic('check') : ''}${itemName(id, p.style)}</button>`).join('')}
    ${shop.map(id => ITEMS[id].tier <= tierMax ? `<button class="w-item buy" data-buy="${id}">${itemName(id, p.style)} · ${ic('coin')}${price(id)}</button>` : `<span class="w-item locked">${ic('lock')}${itemName(id, p.style)} · רמה ${[0, 1, 4, 8, 13][ITEMS[id].tier]}</span>`).join('')}</div></div>`; }).join('')}
  </div></main>`);
  $('#bk').onclick = home;
  $$('.w-item[data-s]').forEach(b => b.onclick = () => { const s = b.dataset.s; if (b.dataset.id) p.equip[s] = b.dataset.id; else delete p.equip[s]; save(); wardrobe(); });
  $$('.w-item[data-buy]').forEach(b => b.onclick = () => { const id = b.dataset.buy; if (p.coins < price(id)) return toast(`חסרים ${price(id) - p.coins} מטבעות. כל משימה מוסיפה מטבעות.`); p.coins -= price(id); p.items.push(id); p.equip[ITEMS[id].slot] = id; save(true); beep('coin'); confetti(); wardrobe(); });
}
function powersScreen() {
  const p = P();
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk" aria-label="חזרה">${ic('back')}</button><b>${ic('spark')} כוחות תודעה</b><span></span></header>
  <main class="list-screen"><p class="lead">כוחות נפתחים ומשתדרגים בעליית רמה. לכל כוח יש השפעה אמיתית באימונים.</p>
  ${Object.entries(POWERS).map(([k, w]) => { const l = p.powers[k] || 0; return `<div class="pw-card ${l ? '' : 'off'}" style="--c:${w.color}"><span class="tile">${ic(k)}</span><div><b>${w.name}</b><span class="pips">${[1, 2, 3].map(i => `<i class="${i <= l ? 'on' : ''}"></i>`).join('')}</span><small>${l ? w.desc(l) : 'עוד לא נפתח · ' + w.desc(1)}</small></div></div>`; }).join('')}</main>`);
  $('#bk').onclick = home;
}
// ---------- זירת אימון ----------
function practicePick() {
  const p = P();
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk" aria-label="חזרה">${ic('back')}</button><b>${ic('target')} אימון חופשי</b><span></span></header>
  <main class="list-screen"><p class="lead">בחר פרק: 8 שאלות ברמה שמתאימה לך עכשיו. הפס מראה את רמת השליטה שלך בפרק.</p>
  ${CH_ORDER.map(ch => { const c = p.ch[ch]; return `<button class="ch-card" data-ch="${ch}" style="--c:${CHAPTERS[ch].color}"><span class="tile">${ic(ch)}</span><span class="ch-t"><b>${CHAPTERS[ch].name}</b><small>${CHAPTERS[ch].desc}</small></span><span class="mastery"><i style="width:${(c.lvl / 5) * 100}%"></i></span></button>`; }).join('')}
  <button class="ch-card" data-ch="mix" style="--c:#ffb547"><span class="tile">${ic('spark')}</span><span class="ch-t"><b>מכל הפרקים</b><small>ערבוב, כמו במבחן</small></span></button></main>`);
  $('#bk').onclick = home;
  $$('.ch-card').forEach(b => b.onclick = () => { const ch = b.dataset.ch; runQuiz({ title: ch === 'mix' ? 'מכל הפרקים' : CHAPTERS[ch].name, qs: ch === 'mix' ? mixed(8) : buildQs([{ ch, n: 8 }]), kind: 'practice', onDone: home }); });
}
// ---------- אקדמיה ----------
function academy(tab = 'learn') {
  const p = P(); p.learned = p.learned || {};
  const learnList = TOPICS.map((t, i) => { const done = p.learned[t.id]; const prog = p.learnStep?.[t.id] || 0;
    return `<button class="ch-card" data-t="${t.id}" style="--c:${t.color}"><span class="tile ${done ? 'done' : ''}">${ic(done ? 'check' : t.icon)}</span><span class="ch-t"><b>${t.title}</b><small>${done ? 'נלמד ✓ – אפשר לחזור ולתרגל' : prog ? `באמצע – שלב ${prog + 1} מתוך ${t.steps.length + 1}` : t.desc}</small></span></button>`; }).join('');
  const tactList = ACADEMY.map((a, i) => { const open = i === 0 || p.academy[ACADEMY[i - 1].id] || p.academy[a.id]; const done = p.academy[a.id]; return `<button class="ch-card ${open ? '' : 'locked'}" data-i="${i}" ${open ? '' : 'disabled'}><span class="tile num ${done ? 'done' : ''}">${done ? ic('check') : open ? i + 1 : ic('lock')}</span><span class="ch-t"><b>${a.title}</b></span></button>`; }).join('');
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk" aria-label="חזרה">${ic('back')}</button><b>${ic('academy')} האקדמיה</b><span></span></header>
  <main class="list-screen"><nav class="ptabs"><button class="${tab === 'learn' ? 'on' : ''}" data-tab="learn">${ic('bulb')}לומדים נושא חדש <span class="muted">${Object.keys(p.learned).length}/${TOPICS.length}</span></button><button class="${tab === 'tact' ? 'on' : ''}" data-tab="tact">${ic('target')}טקטיקות מבחן <span class="muted">${Object.keys(p.academy).length}/${ACADEMY.length}</span></button></nav>
  ${tab === 'learn' ? `<p class="lead">נושאים מהמבחן שאולי עוד לא למדת בבית הספר. כל שיעור מתחיל מאפס: הסבר, המחשה, ניסיון עם עזרה, ובסוף מבחן שליטה קצר. עד שתלמד נושא – לא יופיעו עליו שאלות באימונים.</p>${learnList}` : `<p class="lead">שיעורים קצרים על איך לגשת למבחן עצמו. כל שיעור נפתח אחרי הקודם.</p>${tactList}`}</main>`);
  $('#bk').onclick = home;
  $$('.ptabs button').forEach(b => b.onclick = () => academy(b.dataset.tab));
  $$('.ch-card[data-t]').forEach(b => b.onclick = () => lessonPlayer(topicById(b.dataset.t), () => academy('learn')));
  $$('.ch-card[data-i]').forEach(b => b.onclick = () => lesson(ACADEMY[+b.dataset.i], () => academy('tact')));
}
function lesson(a, after) {
  startAct('tactic', a.title);
  S.active = true;
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk" aria-label="חזרה">${ic('back')}</button><b>${a.title}</b><span></span></header>
  <main class="lesson"><div class="mentor-say">${mentorFace()}<div class="bubble">${a.body}</div></div>
  <div class="lesson-q"><h3>בדיקה קצרה</h3><p>${a.quiz.q}</p><div class="opts">${a.quiz.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="ol">${LETTERS[i]}</span><span class="ot">${o}</span></button>`).join('')}</div></div><div id="lfb"></div></main>`, { active: true });
  $('#bk').onclick = after;
  $$('.lesson-q .opt').forEach(b => b.onclick = () => {
    const i = +b.dataset.i; if ($('.lesson-q').classList.contains('locked')) return;
    if (i === a.quiz.ans) {
      $('.lesson-q').classList.add('locked'); b.classList.add('right'); beep('ok');
      const first = !P().academy[a.id]; P().academy[a.id] = true; if (first) { addXP(30); addCoins(20); } save(); if (S.act) S.act.done = true;
      $('#lfb').innerHTML = `<div class="feedback ok"><div class="fb-head">${ic('check')} נכון${first ? `<span class="xp">${ic('xp')}+30</span>` : ''}</div><button class="btn primary big" id="ldone">המשך</button></div>`;
      $('#ldone').onclick = () => P().pendingLevels ? levelUpFlow(after) : after();
    } else { b.classList.add('wrong'); beep('bad'); toast('לא בדיוק. קרא שוב את ההסבר ונסה שוב.'); }
  });
}

// ---------- בית ספר לגיבורים: שיעורי תוכן ----------
function lessonPlayer(t, after) {
  startAct('learn', t.title);
  const p = P(); p.learnStep = p.learnStep || {}; p.learned = p.learned || {};
  const total = t.steps.length + 1;
  const frame = (inner, i) => setScreen(`<header class="topbar"><button class="icon-btn" id="bk" aria-label="חזרה">${ic('back')}</button><b>${ic(t.icon)} ${t.title}</b><span class="muted small">${Math.min(i + 1, total)}/${total}</span></header>
    <main class="lesson"><div class="dots">${Array.from({ length: total }, (_, k) => `<i class="${k < i ? 'ok' : k === i ? 'cur' : ''}"></i>`).join('')}</div>${inner}</main>`, { active: true }) || ($('#bk').onclick = after);
  const step = i => {
    p.learnStep[t.id] = i; save();
    if (i >= t.steps.length) return masteryIntro();
    const s = t.steps[i];
    if (s.type === 'learn') {
      frame(`<div class="mentor-say">${mentorFace()}<div class="bubble"><h3 style="margin-top:0">${s.title}</h3>${s.html}</div></div>${s.viz ? `<div class="viz-wrap">${s.viz()}</div>` : ''}<button class="btn primary big" id="nx">הבנתי, ממשיכים</button>`, i);
      $('#nx').onclick = () => step(i + 1);
    } else if (s.type === 'slider') {
      frame(`<div class="mentor-say">${mentorFace()}<div class="bubble"><h3 style="margin-top:0">${s.title}</h3>${s.html}</div></div><div class="viz-wrap"><div id="g">${grid100(25)}</div><div class="slider-row"><input type="range" min="0" max="100" value="25" id="sl" dir="ltr"/><b id="sv">25%</b></div></div><button class="btn primary big" id="nx">הבנתי, ממשיכים</button>`, i);
      $('#sl').oninput = e => { const v = +e.target.value; $('#g').innerHTML = grid100(v); $('#sv').textContent = v + '%'; };
      $('#nx').onclick = () => step(i + 1);
    } else {
      const q = prepareQ({ ch: 'math', ...s.q() }); let tries = 0;
      const draw = () => {
        frame(`<div class="qcard" id="lq"></div><div id="lfb"></div>`, i);
        renderQuestion(q, $('#lq'), { onAnswer: (r, final) => {
          if (!final) return; const ok = isCorrect(q, r); tries++;
          if (ok || tries >= 2) {
            markResult(q, $('#lq'), r); beep(ok ? 'ok' : 'bad'); if (ok) { addXP(6); save(); }
            $('#lfb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}"><div class="fb-head">${ic(ok ? 'check' : 'bulb')} ${ok ? 'נכון!' : 'בוא נראה איך פותרים'}</div>${ok ? '' : `<div class="fb-ans">התשובה: <b>${answerText(q)}</b></div>`}<div class="fb-exp">${explainHTML(q)}</div><button class="btn primary big" id="nx">ממשיכים</button></div>`;
            $('#nx').onclick = () => step(i + 1);
          } else {
            beep('bad');
            $('#lfb').innerHTML = `<div class="hint">${mentorFace()}<div><b>כמעט.</b> ${bm(q.hints[0])} נסה שוב.</div></div>`;
            const keep = $('#lfb').innerHTML; draw(); $('#lfb').innerHTML = keep;
          }
        } });
      };
      draw();
    }
    $('#bk').onclick = after;
  };
  const masteryIntro = () => {
    frame(`<div class="mentor-say">${mentorFace()}<div class="bubble"><h3 style="margin-top:0">מבחן שליטה: ${t.title}</h3>5 שאלות חדשות. כדי לסיים את השיעור צריך לפחות <b>4 נכונות</b>. אין לחץ – אפשר לנסות שוב כמה פעמים שצריך.</div></div><button class="btn primary big" id="go">מתחילים</button><button class="btn link" id="again">לחזור על השיעור מההתחלה</button>`, t.steps.length);
    $('#go').onclick = mastery; $('#again').onclick = () => step(0); $('#bk').onclick = after;
  };
  const mastery = () => {
    const seed = (Math.random() * 1e9) | 0;
    const qs = Array.from({ length: 5 }, (_, k) => prepareQ({ ch: 'math', diff: 3, id: 'L' + t.id + k, ...t.master(seed + k * 7919), topic: undefined }));
    let i = 0, ok = 0;
    const show = () => {
      frame(`<div class="qch" style="--c:${t.color}">${ic(t.icon)}מבחן שליטה · ${i + 1}/5</div><div class="qcard" id="mq"></div><div id="mfb"></div>`, t.steps.length);
      $('#bk').onclick = after;
      renderQuestion(qs[i], $('#mq'), { onAnswer: (r, final) => {
        if (!final) return; const good = isCorrect(qs[i], r); if (good) ok++; markResult(qs[i], $('#mq'), r); beep(good ? 'ok' : 'bad');
        $('#mfb').innerHTML = `<div class="feedback ${good ? 'ok' : 'no'}"><div class="fb-head">${ic(good ? 'check' : 'x')} ${good ? 'נכון' : 'התשובה: ' + answerText(qs[i])}</div>${good ? '' : `<div class="fb-exp">${explainHTML(qs[i])}</div>`}<button class="btn primary big" id="nx">${i < 4 ? 'לשאלה הבאה' : 'לתוצאה'}</button></div>`;
        $('#nx').onclick = () => { if (i < 4) { i++; show(); } else result(); };
      } });
    };
    const result = () => {
      const pass = ok >= 4;
      if (S.act) { S.act.mastery = `${ok}/5`; S.act.passed = pass; S.act.done = pass; }
      if (pass) { const first = !p.learned[t.id]; p.learned[t.id] = true; p.learnStep[t.id] = 0; if (first) { addXP(80); addCoins(40); } save(true); confetti(); beep('level'); }
      frame(`<div class="center-screen" style="min-height:auto"><h2>${pass ? `שלטת ב${t.title}!` : `${ok} מתוך 5 – כמעט`}</h2>
        <div class="mentor-say">${mentorFace()}<div class="bubble">${pass ? `מעולה! מעכשיו גם שאלות על <b>${t.title}</b> יופיעו באימונים ובסימולציות – ואתה כבר יודע איך לפתור אותן.${p.learned[t.id] ? ' <b>+80 XP</b>' : ''}` : 'צריך 4 נכונות כדי לסיים. כדאי לעבור שוב על ההסבר, ואז לנסות שוב – זה בדיוק איך לומדים.'}</div></div>
        <div class="row-btns">${pass ? '<button class="btn primary" id="done">סיום</button>' : '<button class="btn primary" id="retry">ניסיון נוסף</button><button class="btn" id="redo">חזרה על השיעור</button>'}</div></div>`, total);
      $('#bk').onclick = after;
      if (pass) $('#done').onclick = () => P().pendingLevels ? levelUpFlow(after) : after();
      else { $('#retry').onclick = mastery; $('#redo').onclick = () => step(0); }
    };
    show();
  };
  step(Math.min(p.learnStep[t.id] || 0, t.steps.length));
}

// ---------- דיווח מצב רוח ----------
const MOODS = [
  { k: 'great', t: 'מעולה' }, { k: 'ok', t: 'בסדר' }, { k: 'tired', t: 'עייף' },
  { k: 'confused', t: 'לא מבין משהו' }, { k: 'frustrated', t: 'מתוסכל' }, { k: 'stressed', t: 'לחוץ מהמבחן' }, { k: 'quit', t: 'רוצה לוותר' },
];
const MENTOR_REPLY = {
  great: ['ככה מדברים גיבורים. תמשיך ככה, והמבחן ירגיש כמו עוד משימה.', 'אני שמחה לשמוע! אנרגיה טובה היא מוח חד.', 'תשמור על התחושה הזו – היא הנשק הכי חזק שלך.'],
  ok: ['"בסדר" זה מצוין. לא כל יום צריך להיות זיקוקים – העיקר להתמיד.', 'קיבלתי. כל יום של אימון מוסיף לך כוח, גם יום "בסדר".'],
  tired: ['המוח צריך דלק. קח הפסקה של 5 דקות: כוס מים, מתיחות, ותחזור רענן.', 'עייפות היא סימן שעבדת קשה. הפסקה קצרה עכשיו תעזור יותר מעוד שאלה.', 'אולי עוד 3 שאלות קלות – ואז מנוחה? מה שמרגיש לך נכון.'],
  confused: ['זה בדיוק המקום ללמוד. נסה את כפתור הרמז – הרמז הראשון לא מגלה תשובה, רק מכוון.', 'כשמשהו לא ברור – באקדמיה יש שיעור לכל סוג שאלה. ואפשר תמיד לשאול בבית.', 'לא להבין זה שלב בלמידה, לא סוף הדרך. בוא נפרק את זה לחלקים קטנים.'],
  frustrated: ['גם לגיבורים יש קרבות קשים. כל טעות שאתה מבין עכשיו לא תחזור במבחן.', 'תסכול אומר שאתה מתאמץ באמת. קח נשימה, ובוא ננסה משהו קצת יותר קל לרגע.', 'טעויות באימון הן בדיוק מה שהופך אותך לחזק – גם כשזה לא מרגיש ככה.'],
  stressed: ['לחץ לפני מבחן אומר שאכפת לך – וזה טוב. בוא ננשום רגע יחד: נשימת קופסה.', 'הנה סוד: כל יום פה אתה פוגש בדיוק את סוגי השאלות של המבחן. ביום המבחן לא יהיו הפתעות.', 'זכור: אין עונש על טעות במבחן, ומותר לנחש. אתה מגיע מוכן.'],
  quit: ['זה בסדר להרגיש ככה. בוא נעשה עסקה: רק עוד 3 שאלות, ואז תחליט.', 'גם הגיבורים הכי חזקים רצו לוותר לפעמים. מה שעשה אותם גיבורים – שהם חזרו למחרת.', 'אולי הגיע הזמן להפסקה, לא לוויתור. מחר הגיבור שלך מחכה לך.'],
};
const parentsLabel = () => DB.parentsOf(S.teamData).map(x => x.name).join(' ול');
function moodReport(after) {
  const m = modal(`<div class="mentor-say">${mentorFace()}<div class="bubble">איך היה לך האימון היום?</div></div>
    <div class="moods">${MOODS.map(x => `<button class="mood" data-k="${x.k}">${moodFace(x.k)}<small>${x.t}</small></button>`).join('')}</div>
    <textarea id="mtxt" placeholder="רוצה לספר משהו? (לא חובה)"></textarea><button class="btn primary big" id="msend">שליחה</button><p class="muted small">הדיווח נשלח גם ל${esc(parentsLabel())}.</p>`, { onClose: after });
  let mood = null;
  $$('.mood', m.el).forEach(b => b.onclick = () => { mood = b.dataset.k; $$('.mood', m.el).forEach(x => x.classList.toggle('on', x === b)); });
  $('#msend', m.el).onclick = async () => {
    if (!mood) return toast('בחר איך הרגשת');
    const mm = MOODS.find(x => x.k === mood); dayRec().mood = mood;
    const extra = $('#mtxt', m.el).value.trim();
    await DB.addMessage(S.team, { from: S.pid, fromName: P().name, to: 'parent', kind: 'mood', mood, text: mm.t + (extra ? ' – ' + extra : '') });
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
  const m = modal(`<h3>${ic('antenna')} קו פתוח</h3>
    <div class="mentor-say">${mentorFace()}<div class="bubble">אני כאן. מה צריך?</div></div>
    <div class="comms-actions">${inQ ? `<button class="btn" id="c-hint">${ic('bulb')} רמז לשאלה הזו</button>` : ''}
    <button class="btn" id="c-breath">${ic('breath')} נשימת קופסה – דקה אחת</button></div>
    <h4>איך אני מרגיש עכשיו?</h4>
    <div class="moods">${MOODS.filter(x => x.k !== 'ok').map(x => `<button class="mood" data-k="${x.k}">${moodFace(x.k)}<small>${x.t}</small></button>`).join('')}</div>
    <textarea id="ctxt" placeholder="אפשר לכתוב כאן כל דבר – שאלה או תחושה"></textarea>
    <button class="btn primary" id="c-send">${ic('send')} שליחה</button>
    <p class="muted small">הודעות על תחושות נשלחות גם ל${esc(parentsLabel())}.</p>
    ${mine.length ? `<h4>הודעות אליך</h4>${mine.map(x => `<div class="inbox-msg"><b>${esc(x.fromName || 'הורה')}:</b> ${esc(x.text)}</div>`).join('')}` : ''}`);
  let mood = null;
  if (inQ) $('#c-hint', m.el).onclick = () => { m.close(); inQ.hint(); };
  $('#c-breath', m.el).onclick = () => { m.close(); breathing(); };
  $$('.mood', m.el).forEach(b => b.onclick = () => { mood = b.dataset.k; $$('.mood', m.el).forEach(x => x.classList.toggle('on', x === b)); });
  $('#c-send', m.el).onclick = async () => {
    const txt = $('#ctxt', m.el).value.trim(); if (!mood && !txt) return toast('בחר תחושה או כתוב משהו');
    const mm = MOODS.find(x => x.k === mood);
    await DB.addMessage(S.team, { from: S.pid, fromName: P().name, to: 'parent', kind: mood ? 'feeling' : 'help', mood, text: (mm ? mm.t : 'שאלה') + (txt ? ' – ' + txt : ''), context: inQ ? CHAPTERS[inQ.q.ch].name : null });
    const reply = mood ? pickR(MENTOR_REPLY[mood]) : 'קיבלתי, ההודעה נשלחה. בינתיים, אם זה על שאלה – כפתור הרמז בנוי בשלבים ויכול לעזור.';
    const acts = mood === 'stressed' ? `<button class="btn" id="a-br">${ic('breath')} בוא ננשום</button>` : mood === 'tired' ? `<button class="btn" id="a-brk">${ic('pause')} הפסקה של 5 דקות</button>` : (mood === 'confused' && inQ) ? `<button class="btn" id="a-h">${ic('bulb')} רמז</button>` : '';
    m.el.innerHTML = `<div class="mentor-say">${mentorFace()}<div class="bubble">${reply}</div></div><div class="row-btns">${acts}<button class="btn primary" id="a-ok">תודה, ${MENTOR}</button></div>`;
    $('#a-ok', m.el).onclick = m.close;
    $('#a-br', m.el) && ($('#a-br', m.el).onclick = () => { m.close(); breathing(); });
    $('#a-h', m.el) && ($('#a-h', m.el).onclick = () => { m.close(); inQ.hint(); });
    $('#a-brk', m.el) && ($('#a-brk', m.el).onclick = () => { m.close(); breakTimer(); });
  };
}
function breathing() {
  S.keepAct = true; const prevAct = S.act; S.act = null; startAct('breath', 'נשימת קופסה'); const restore = () => { endAct({ done: true }); S.act = prevAct; S.keepAct = false; };
  const m = modal(`<div class="breath"><div class="b-box"><div class="b-dot"></div></div><div class="b-txt">מתכוננים...</div><div class="b-n"></div></div>`, { onClose: restore });
  const steps = ['שאיפה', 'החזקה', 'נשיפה', 'החזקה']; let i = 0, cyc = 0;
  const box = $('.b-box', m.el);
  const run = () => {
    if (!document.body.contains(m.el)) return;
    if (cyc >= 3) { $('.b-txt', m.el).innerHTML = 'כל הכבוד. המוח שלך מוכן להמשיך.'; $('.b-n', m.el).textContent = ''; addXP(5); save(); return; }
    box.dataset.step = i; $('.b-txt', m.el).textContent = steps[i]; let n = 4; $('.b-n', m.el).textContent = n;
    const t = setInterval(() => { n--; if (n > 0) $('.b-n', m.el).textContent = n; else { clearInterval(t); i = (i + 1) % 4; if (i === 0) cyc++; run(); } }, 1000);
  };
  setTimeout(run, 800);
}
function breakTimer() {
  let s = 300; S.active = false;
  const m = modal(`<div class="center"><h3 style="justify-content:center">${ic('pause')} הפסקה</h3><div class="big-timer" id="bt">5:00</div><p>שתה מים, תזוז קצת, תסתכל רחוק מהמסך. הגיבור שלך מחכה.</p></div>`);
  const t = setInterval(() => { s--; const e = $('#bt', m.el); if (!e) return clearInterval(t); e.textContent = fmtTime(s); if (s <= 0) { clearInterval(t); e.textContent = 'חוזרים!'; beep('level'); } }, 1000);
}
// ---------- סימולציה ----------
function simPick() {
  const p = P();
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk" aria-label="חזרה">${ic('back')}</button><b>${ic('exam')} סימולציית מבחן</b><span></span></header>
  <main class="list-screen"><div class="mentor-say">${mentorFace()}<div class="bubble">המסך בסימולציה בנוי <b>כמו מסך המבחן האמיתי</b>: בחירת פרק, מספרי שאלות, "הבא" ו"הקודם", וסימון שאלות לחזרה.${isMobile() ? '<br>המבחן האמיתי נעשה במחשב, ולכן כדאי לעשות את הסימולציה המלאה במחשב.' : ''}</div></div>
  <button class="ch-card" data-m="mini" style="--c:#3ee6d2"><span class="tile">${ic('clock')}</span><span class="ch-t"><b>מיני-סימולציה</b><small>24 שאלות, 4 מכל פרק · 30 דקות</small></span></button>
  <button class="ch-card" data-m="full" style="--c:#ffb547"><span class="tile">${ic('exam')}</span><span class="ch-t"><b>סימולציה מלאה</b><small>72 שאלות, 12 מכל פרק · 90 דקות</small></span></button>
  <label class="chk"><input type="checkbox" id="extra"/> תוספת זמן של 15 דקות (כמו שניתנה בשנה שעברה)</label>
  ${p.records.sims.length ? `<h4>סימולציות קודמות</h4>${p.records.sims.slice(-6).reverse().map(s => `<div class="sim-row"><span>${s.date}</span><span>${s.mini ? 'מיני' : 'מלאה'}</span><b>${s.score}%</b></div>`).join('')}` : ''}</main>`);
  $('#bk').onclick = home;
  $$('.ch-card[data-m]').forEach(b => b.onclick = () => {
    const mini = b.dataset.m === 'mini'; const n = mini ? 4 : 12;
    const qs = CH_ORDER.map(ch => buildQs([{ ch, n, diffs: Array.from({ length: n }, (_, i) => 1 + Math.floor(i * 4.99 / (n - 1 || 1))) }]));
    const mins = (mini ? 30 : 90) + ($('#extra').checked ? (mini ? 5 : 15) : 0);
    S.active = true;
    startAct('sim', mini ? 'מיני-סימולציה' : 'סימולציה מלאה');
    startExam({ app, qsByCh: qs, minutes: mins, mini, onExit: home, onFinish: (r) => {
      const p = P(); p.records.sims.push({ date: today(), mini, score: r.score, perCh: r.perCh, empty: r.empty });
      CH_ORDER.forEach((ch, i) => { const c = p.ch[ch]; c.n += r.perCh[i].n; c.ok += r.perCh[i].ok; c.lvl = Math.max(1, Math.min(5, c.lvl + (r.perCh[i].ok / r.perCh[i].n - 0.6))); });
      r.wrong.forEach(q => { if (!p.mistakes.some(m => m.id === q.id)) { p.mistakes.unshift(q); } }); p.mistakes = p.mistakes.slice(0, 40);
      const xp = Math.round(r.ok * 6 + (mini ? 40 : 150)); addXP(xp); addCoins(mini ? 40 : 150); endAct({ done: true, q: r.n, ok: r.ok, score: r.score, empty: r.empty }); save(true);
      return xp;
    } });
  });
}
// ---------- דו-קרב ----------
async function duelScreen() {
  const players = (await DB.listPlayers(S.team)).filter(x => x.id !== S.pid);
  const duels = (await DB.listDuels(S.team)).filter(d => d.from === S.pid || d.to === S.pid);
  const parents = DB.parentsOf(S.teamData);
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk" aria-label="חזרה">${ic('back')}</button><b>${ic('duel')} דו-קרב</b><span></span></header>
  <main class="list-screen"><p class="lead">שני השחקנים פותרים בדיוק את אותן 8 שאלות. מנצח מי שצדק ביותר שאלות; בתיקו – המהיר. ניצחון שווה 40 XP.</p>
  <h4>את מי לאתגר?</h4><div class="opp">
    ${parents.map(pr => `<button class="opp-b" data-to="${pr.id}" data-n="${esc(pr.name)}">${ic('parent')}${esc(pr.name)}</button>`).join('')}
    ${players.map(x => `<button class="opp-b" data-to="${x.id}" data-n="${esc(x.name)}"><span class="mini-h">${heroSVG(x)}</span>${esc(x.name)}</button>`).join('')}</div>
  <div class="p-card"><h4>${ic('send')} אתגר פתוח</h4><p class="muted" style="margin:0 0 10px">קישור שאפשר לשלוח לכל אחד – סבא, דודה או חבר. הם כותבים שם ופותרים את אותן 8 שאלות, בלי הרשמה.</p><button class="btn primary" id="opench">יצירת אתגר פתוח</button>
    <div id="chlist"></div></div>
  <h4>הקרבות שלך</h4>${duels.length ? duels.map(d => duelRow(d)).join('') : '<p class="muted">עוד אין קרבות. בחר יריב כדי להתחיל.</p>'}</main>`);
  $('#opench').onclick = async () => {
    const qs = mixed(8).slice(0, 8);
    const id = await DB.createChallenge({ fromName: P().name, style: P().style, qs });
    (P().challenges = P().challenges || []).unshift({ id, ts: Date.now() }); P().challenges = P().challenges.slice(0, 10); save(true);
    runQuiz({ title: 'האתגר שלך – קודם אתה', qs: qs.map(q => JSON.parse(JSON.stringify(q))), kind: 'duel', onDone: async res => {
      const ok = res.filter(x => x.ok).length, t = Math.round(res.reduce((s, x) => s + (x.t || 0), 0));
      await DB.submitChallenge(id, 'owner', { name: P().name, ok, t, owner: true }); addXP(15); save(true);
      shareChallenge(id); } });
  };
  renderChallenges();
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
  if (!me) status = `<button class="btn small primary" data-play="${d.id}">לקרב</button>`;
  else if (!them) status = `<span class="muted">מחכים ל${esc(oname)}</span>`;
  else { const win = me.ok > them.ok || (me.ok === them.ok && me.t < them.t); const tie = me.ok === them.ok && me.t === them.t; status = `<b class="${win ? 'win' : 'lose'}">${tie ? 'תיקו' : win ? 'ניצחת' : 'הפעם הוא ניצח'}</b>`; }
  return `<div class="duel-row"><span>מול <b>${esc(oname)}</b></span><span>${me ? `אתה: ${me.ok}/8 · ${fmtTime(me.t)}` : ''}${them ? ` | ${esc(oname)}: ${them.ok}/8 · ${fmtTime(them.t)}` : ''}</span>${status}</div>`;
}
function playDuel(d) {
  const qs = d.qs.map(q => JSON.parse(JSON.stringify(q)));
  runQuiz({ title: `דו-קרב מול ${d.from === S.pid ? d.toName : d.fromName}`, qs, kind: 'duel', onDone: async (res) => {
    const ok = res.filter(x => x.ok).length, t = Math.round(res.reduce((s, x) => s + (x.t || 0), 0));
    await DB.submitDuel(S.team, d.id, S.pid, { ok, t });
    const other = d.from === S.pid ? d.to : d.from; const them = d.results?.[other];
    addXP(15);
    if (them && (ok > them.ok || (ok === them.ok && t < them.t))) { addXP(40); P().records.duelsWon++; confetti(); toast('ניצחת בדו-קרב! +40 XP', 'gold'); }
    save(true); duelScreen();
  } });
}
// ---------- טבלת אלופים ושיאים ----------
async function leaderboard() {
  const wk = weekKey();
  const players = (await DB.listPlayers(S.team)).map(x => x.id === S.pid ? { ...P(), id: S.pid } : x).sort((a, b) => (b.weekXp?.[wk] || 0) - (a.weekXp?.[wk] || 0));
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk" aria-label="חזרה">${ic('back')}</button><b>${ic('trophy')} טבלת האלופים</b><span class="muted small">השבוע</span></header>
  <main class="list-screen">${players.map((x, i) => `<div class="lb-row ${x.id === S.pid ? 'me' : ''}"><span class="lb-n ${i < 3 ? 'p' + (i + 1) : ''}">${i + 1}</span><span class="mini-h">${heroSVG(x)}</span><span class="lb-name"><b>${esc(x.name)}</b><small>רמה ${x.level} · ${rankOf(x.level)}</small></span><span class="lb-xp">${x.weekXp?.[wk] || 0} XP</span></div>`).join('')}
  <p class="muted small">הטבלה מתאפסת בכל יום ראשון. חברים מצטרפים עם קוד הצוות <b dir="ltr">${S.team}</b>.</p></main>`);
  $('#bk').onclick = home;
}
function recordsScreen() {
  const p = P(); const r = p.records;
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); const k = today(d); return { l: String(d.getDate()), v: Math.round((p.days[k]?.sec || 0) / 60) }; });
  setScreen(`<header class="topbar"><button class="icon-btn" id="bk" aria-label="חזרה">${ic('back')}</button><b>${ic('chart')} ההתקדמות שלי</b><span></span></header>
  <main class="list-screen"><div class="rec-grid">
    <div><b>${p.bestStreak}</b><small>רצף ימים שיא</small></div><div><b>${r.bestCombo}</b><small>קומבו שיא</small></div>
    <div><b>${r.bestBoss}%</b><small>שיא בקרב בוס</small></div><div><b>${r.totalQ}</b><small>שאלות שנפתרו</small></div>
    <div><b>${r.totalQ ? Math.round(r.totalOk / r.totalQ * 100) : 0}%</b><small>דיוק כללי</small></div><div><b>${r.duelsWon}</b><small>ניצחונות בדו-קרב</small></div></div>
    <h4>דקות אימון בשבועיים האחרונים</h4>${bars(days, { goal: goalMin(), color: '#3ee6d2' })}
    <h4>שליטה בפרקי המבחן</h4>${CH_ORDER.map(ch => { const c = p.ch[ch]; return `<div class="mast-row" style="--c:${CHAPTERS[ch].color}"><span>${ic(ch)} ${CHAPTERS[ch].name}</span><span class="mastery big"><i style="width:${c.lvl / 5 * 100}%"></i></span><small>${c.n ? Math.round(c.ok / c.n * 100) + '%' : '–'}</small></div>`; }).join('')}
  </main>`);
  $('#bk').onclick = home;
}

function challengeLink(id) { return `${location.origin}${location.pathname}?challenge=${id}`; }
function shareChallenge(id) {
  const link = challengeLink(id);
  const text = `${P().name} מאתגר אותך ב-MindHero! 8 שאלות חשיבה – בוא נראה מי מנצח: ${link}`;
  const m = modal(`<h3>${ic('send')} האתגר מוכן</h3><p>שלח את הקישור למי שתרצה. התוצאות יופיעו אצלך במסך הדו-קרב.</p><div class="linkbox" dir="ltr">${esc(link)}</div>
    <div class="row-btns"><a class="btn primary" href="https://wa.me/?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">שליחה בוואטסאפ</a><button class="btn" id="cpy">העתקת הקישור</button></div>`, { onClose: duelScreen });
  $('#cpy', m.el).onclick = () => { navigator.clipboard?.writeText(text); toast('הקישור הועתק'); };
}
async function renderChallenges() {
  const box = $('#chlist'); const list = P().challenges || []; if (!box || !list.length) return;
  const items = (await Promise.all(list.slice(0, 5).map(async c => ({ c, d: await DB.getChallenge(c.id) })))).filter(x => x.d);
  box.innerHTML = items.map(({ c, d }) => { const rs = Object.values(d.results || {}).sort((a, b) => b.ok - a.ok || a.t - b.t);
    return `<div class="duel-row"><span>${new Date(c.ts).toLocaleDateString('he-IL')} · ${rs.length} ${rs.length === 1 ? 'משתתף' : 'משתתפים'}</span><span>${rs.slice(0, 4).map((r, i) => `${i === 0 ? '<b class="win">' : ''}${esc(r.name)} ${r.ok}/8${i === 0 ? '</b>' : ''}`).join(' · ')}</span><button class="btn small" data-share="${c.id}">שיתוף</button></div>`; }).join('');
  $$('[data-share]', box).forEach(b => b.onclick = () => shareChallenge(b.dataset.share));
}

// ---------- אורח באתגר פתוח ----------
async function guestChallenge(id) {
  const d = await DB.getChallenge(id);
  if (!d) { setScreen(`<div class="center-screen"><h2>האתגר לא נמצא</h2><p class="muted">ייתכן שהקישור לא הועתק במלואו. בקשו קישור חדש.</p></div>`); return; }
  const rs = () => Object.values(d.results || {}).sort((a, b) => b.ok - a.ok || a.t - b.t);
  const board = () => `<div class="list-screen" style="width:100%">${rs().map((r, i) => `<div class="lb-row ${r.me ? 'me' : ''}"><span class="lb-n ${i < 3 ? 'p' + (i + 1) : ''}">${i + 1}</span><span class="lb-name"><b>${esc(r.name)}</b><small>${fmtTime(r.t)}</small></span><span class="lb-xp">${r.ok}/8</span></div>`).join('')}</div>`;
  const key = LS.get('mh_guest', null) || ('g' + DB.newCode(10)); LS.set('mh_guest', key);
  if (d.results?.[key]) { setScreen(`<div class="center-screen"><h2>כבר השתתפת באתגר</h2>${board()}</div>`); return; }
  setScreen(`<div class="center-screen"><div class="start-lineup"><div style="height:100%">${heroSVG({ style: d.style || 'comic', skin: SKINS[1], equip: { back: 'cape', emblem: 'bolt' } })}</div></div><div class="logo-big" style="font-size:2rem">Mind<span>Hero</span></div>
    <h2>${esc(d.fromName)} מאתגר אותך</h2><p class="muted">8 שאלות חשיבה מתוך מבחן המחוננים: מילים, סדרות, היגיון, חשבון וצורות. מנצח מי שצודק ביותר שאלות; בתיקו – המהיר.</p>
    <div class="stack"><input id="gn" class="big-in" maxlength="16" placeholder="השם שלך"/><button class="btn primary big" id="gstart">מתחילים</button></div></div>`);
  $('#gn').onkeydown = e => { if (e.key === 'Enter') $('#gstart').click(); };
  $('#gstart').onclick = () => {
    const name = $('#gn').value.trim(); if (name.length < 2) return toast('כתבו שם של לפחות 2 אותיות');
    const qs = d.qs; let i = 0, ok = 0; const t0 = Date.now();
    const show = () => {
      setScreen(`<div class="quiz"><header class="qbar"><b class="qtitle">האתגר של ${esc(d.fromName)}</b><span class="qprog">${i + 1}/8</span></header><div class="dots">${qs.map((_, k) => `<i class="${k < i ? 'ok' : k === i ? 'cur' : ''}"></i>`).join('')}</div><div class="qcard" id="gq"></div><div id="gfb"></div></div>`);
      renderQuestion(qs[i], $('#gq'), { onAnswer: (r, final) => {
        if (!final) return; const good = isCorrect(qs[i], r); if (good) ok++; markResult(qs[i], $('#gq'), r); beep(good ? 'ok' : 'bad');
        $('#gfb').innerHTML = `<div class="feedback ${good ? 'ok' : 'no'}"><div class="fb-head">${ic(good ? 'check' : 'x')} ${good ? 'נכון' : 'התשובה: ' + answerText(qs[i])}</div><div class="fb-exp">${explainHTML(qs[i])}</div><button class="btn primary big" id="gn2">${i < 7 ? 'לשאלה הבאה' : 'לתוצאות'}</button></div>`;
        $('#gn2').onclick = async () => { if (i < qs.length - 1) { i++; show(); } else {
          const t = Math.round((Date.now() - t0) / 1000); await DB.submitChallenge(id, key, { name, ok, t });
          d.results = { ...(d.results || {}), [key]: { name, ok, t, me: true } };
          const top = rs()[0]; if (top.me) confetti();
          setScreen(`<div class="center-screen"><h2>${ok}/8 תשובות נכונות</h2><p class="muted">${top.me ? 'אתה במקום הראשון!' : `${esc(top.name)} מוביל בינתיים.`}</p>${board()}
            <p class="muted small">MindHero – משחק אימון למבחן המחוננים.</p></div>`);
        } };
      } });
    };
    show();
  };
}

// ---------- הורה ----------
function parentEntry(code) {
  pinPad('מסך הורה', async pin => {
    const team = await DB.getTeam(code); if (!team) { toast('הצוות לא נמצא'); return startScreen(); }
    const h = await DB.sha(pin); const me = DB.parentsOf(team).find(x => x.pinHash === h);
    if (!me) { toast('קוד ההורה לא נכון'); return parentEntry(code); }
    S.team = code; S.teamData = team;
    parentScreen({ app, code, team, me, setScreen, back: () => S.p ? home() : startScreen(), mixed: n => mixedFor(n), pickOne, onDelete: pid => { if (S.pid === pid) { S.p = null; S.pid = null; LS.set('mh_session', null); } } });
  }, { sub: 'הקלידו את קוד ההורה שלכם', back: () => S.p ? home() : startScreen() });
}
function mixedFor(n) { const out = [], avoid = new Set(); for (let i = 0; i < n; i++) out.push(pickOne(CH_ORDER[i % 6], 3, avoid)); return out.sort(() => Math.random() - .5); }

// ---------- אתחול ----------
$('#comms-btn').onclick = () => S.p && comms();
window.addEventListener('beforeunload', () => DB.flushSave());
boot();
