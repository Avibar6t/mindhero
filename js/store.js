// MindHero – שמירה וסנכרון (Firebase, עם גיבוי מקומי כשאין רשת)
import { firebaseConfig } from './firebase-config.js?v=10';

const V = '10.12.2';
let fb = null, db = null, cloud = false;
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
export { LS };

export async function initCloud() {
  try {
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 9000));
    const load = (async () => {
      const [app, auth, fs] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
      ]);
      const a = app.initializeApp(firebaseConfig);
      await auth.signInAnonymously(auth.getAuth(a));
      db = fs.getFirestore(a); fb = fs; cloud = true;
    })();
    await Promise.race([load, timeout]);
  } catch (e) { console.warn('MindHero: מצב מקומי (ללא ענן)', e); cloud = false; }
  return cloud;
}
export const isCloud = () => cloud;

export async function sha(s) {
  try {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('mindhero::' + s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  } catch { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return 'x' + h; }
}

const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const newCode = (n = 7) => Array.from({ length: n }, () => ALPH[Math.floor(Math.random() * ALPH.length)]).join('');
const localTeam = code => LS.get('mh_team_' + code, null);
const saveLocalTeam = (code, t) => LS.set('mh_team_' + code, t);

// ----- צוות -----
export async function createTeam(data) {
  const code = newCode();
  const team = { ...data, createdAt: Date.now() };
  saveLocalTeam(code, { team, players: {}, messages: [], duels: {} });
  if (cloud) await fb.setDoc(fb.doc(db, 'teams', code), team);
  return code;
}
export async function getTeam(code) {
  if (cloud) { try { const s = await fb.getDoc(fb.doc(db, 'teams', code)); if (s.exists()) return s.data(); return null; } catch (e) { console.warn(e); } }
  return localTeam(code)?.team || null;
}
export async function updateTeam(code, patch) {
  const lt = localTeam(code); if (lt) { lt.team = { ...lt.team, ...patch }; saveLocalTeam(code, lt); }
  if (cloud) await fb.setDoc(fb.doc(db, 'teams', code), patch, { merge: true });
}

// ----- שחקנים -----
export async function listPlayers(code) {
  if (cloud) { try { const s = await fb.getDocs(fb.collection(db, 'teams', code, 'players')); return s.docs.map(d => ({ id: d.id, ...d.data() })); } catch (e) { console.warn(e); } }
  const lt = localTeam(code); return lt ? Object.entries(lt.players).map(([id, p]) => ({ id, ...p })) : [];
}
export async function getPlayer(code, pid) {
  if (cloud) { try { const s = await fb.getDoc(fb.doc(db, 'teams', code, 'players', pid)); if (s.exists()) return s.data(); } catch (e) { console.warn(e); } }
  return localTeam(code)?.players?.[pid] || null;
}
let saveTimer = null, pending = null;
export function savePlayer(code, pid, data, now = false) {
  const lt = localTeam(code) || { team: {}, players: {}, messages: [], duels: {} };
  lt.players[pid] = data; saveLocalTeam(code, lt);
  pending = { code, pid, data };
  clearTimeout(saveTimer);
  const go = async () => { const p = pending; pending = null; if (cloud && p) { try { await fb.setDoc(fb.doc(db, 'teams', p.code, 'players', p.pid), JSON.parse(JSON.stringify(p.data))); } catch (e) { console.warn('save failed', e); } } };
  if (now) return go();
  saveTimer = setTimeout(go, 1500);
}
export function flushSave() { if (pending) { clearTimeout(saveTimer); return savePlayer(pending.code, pending.pid, pending.data, true); } }

// ----- הודעות -----
export async function addMessage(code, msg) {
  const m = { ...msg, ts: Date.now(), read: false };
  const lt = localTeam(code); if (lt) { m._lid = newCode(10); lt.messages.push(m); saveLocalTeam(code, lt); }
  if (cloud) { try { await fb.addDoc(fb.collection(db, 'teams', code, 'messages'), m); } catch (e) { console.warn(e); } }
}
export async function listMessages(code) {
  if (cloud) { try { const s = await fb.getDocs(fb.collection(db, 'teams', code, 'messages')); return s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.ts - a.ts); } catch (e) { console.warn(e); } }
  return (localTeam(code)?.messages || []).map(m => ({ id: m._lid, ...m })).sort((a, b) => b.ts - a.ts);
}
export async function markRead(code, id) {
  const lt = localTeam(code); if (lt) { const m = lt.messages.find(x => x._lid === id); if (m) { m.read = true; saveLocalTeam(code, lt); } }
  if (cloud) { try { await fb.updateDoc(fb.doc(db, 'teams', code, 'messages', id), { read: true }); } catch {} }
}

// ----- דו-קרבות -----
export async function createDuel(code, duel) {
  const id = newCode(10); const d = { ...duel, ts: Date.now(), results: {} };
  const lt = localTeam(code); if (lt) { lt.duels[id] = d; saveLocalTeam(code, lt); }
  if (cloud) { try { await fb.setDoc(fb.doc(db, 'teams', code, 'duels', id), JSON.parse(JSON.stringify(d))); } catch (e) { console.warn(e); } }
  return id;
}
export async function listDuels(code) {
  if (cloud) { try { const s = await fb.getDocs(fb.collection(db, 'teams', code, 'duels')); return s.docs.map(x => ({ id: x.id, ...x.data() })).sort((a, b) => b.ts - a.ts); } catch (e) { console.warn(e); } }
  return Object.entries(localTeam(code)?.duels || {}).map(([id, d]) => ({ id, ...d })).sort((a, b) => b.ts - a.ts);
}
export async function submitDuel(code, id, pid, result) {
  const lt = localTeam(code); if (lt?.duels[id]) { lt.duels[id].results[pid] = result; saveLocalTeam(code, lt); }
  if (cloud) { try { await fb.setDoc(fb.doc(db, 'teams', code, 'duels', id), { results: { [pid]: result } }, { merge: true }); } catch (e) { console.warn(e); } }
}

// ----- הורים -----
export const parentsOf = t => t?.parents?.length ? t.parents : [{ id: 'parent', name: t?.parentName || 'אבא', pinHash: t?.parentPinHash }];

// ----- אתגרים פתוחים (קישור לכל אחד, מחוץ לצוות) -----
export async function createChallenge(ch) {
  const id = newCode(12); const d = { ...ch, ts: Date.now(), results: {} };
  LS.set('mh_ch_' + id, d);
  if (cloud) { try { await fb.setDoc(fb.doc(db, 'challenges', id), JSON.parse(JSON.stringify(d))); } catch (e) { console.warn(e); } }
  return id;
}
export async function getChallenge(id) {
  if (cloud) { try { const s = await fb.getDoc(fb.doc(db, 'challenges', id)); if (s.exists()) return s.data(); } catch (e) { console.warn(e); } }
  return LS.get('mh_ch_' + id, null);
}
export async function submitChallenge(id, key, result) {
  const l = LS.get('mh_ch_' + id, null); if (l) { l.results[key] = result; LS.set('mh_ch_' + id, l); }
  if (cloud) { try { await fb.setDoc(fb.doc(db, 'challenges', id), { results: { [key]: result } }, { merge: true }); } catch (e) { console.warn(e); } }
}
