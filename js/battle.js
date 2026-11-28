// MindHero – זירת הקרב: אנימציה של שני הגיבורים נלחמים לפי התשובות בדו-קרב
import { heroSVG, POWERS, strongestPowerColor } from './hero.js?v=35';
import { ic } from './icons.js?v=35';
import { heroWithFx } from './legend.js?v=35';
import { alliesHTML } from './school.js?v=35';
import { heroScene, GIFTS, giftHit } from './fun.js?v=35';
import { $, esc, beep, confetti, fmtTime, toast } from './ui.js?v=35';

// דמות קבועה להורה (אין לו גיבור משלו)
export const PARENT_HERO = { style: 'tactical', skin: '#e0ac69', equip: { head: 'helmet', weapon: 'hammer', weapon2: 'shield', emblem: 'star', suit: 'silver' }, powers: { shield: 2 } };

const ATTACK = { sword: 'slash', staff: 'orb', blaster: 'beam', hammer: 'quake' };
const NAME = { slash: 'מכת חרב', orb: 'כדור אנרגיה', beam: 'קרן לייזר', quake: 'רעידת פטיש', mind: 'גל תודעה' };
const seqOf = r => r.seq?.length ? r.seq : Array.from({ length: 8 }, (_, i) => i < r.ok); // קרבות ישנים: לפי מספר הנכונות

// L,R: {name, hero, res:{ok,t,seq}}
export const REACTS = ['👏', '🔥', '😎', '😤', '🤝', '😂'];
export const REACT_TXT = { '👏': 'כל הכבוד!', '🔥': 'קרב לוהט!', '😎': 'קל מדי', '😤': 'אני דורש נקמה!', '🤝': 'קרב הוגן', '😂': 'חחח איזה קרב' };
export function battleScreen(app, L, R, { onDone, onRematch, onReact, myReact = '', theirReact = '', gifts, onGift, theirGift = null } = {}) {
  const ls = seqOf(L.res), rs = seqOf(R.res);
  const lWin = L.res.ok > R.res.ok || (L.res.ok === R.res.ok && L.res.t < R.res.t);
  const tie = L.res.ok === R.res.ok && L.res.t === R.res.t;
  const W = lWin ? L : R;
  const style = L.hero.style || 'comic';
  const atk = h => ATTACK[h.equip?.weapon] || 'mind';
  const colorOf = h => { let c = ''; try { c = strongestPowerColor(h); } catch {} return c || (h.style === 'pixel' ? '#facc15' : h.style === 'tactical' ? '#22d3ee' : '#a78bfa'); };
  app.className = 'battle-mode';
  app.innerHTML = `<div class="arena">
    <div class="ar-scene">${heroScene(L.hero)}</div>
    <div class="ar-top">
      <div class="hpbox l"><b>${esc(L.name)}</b><div class="hpbar"><i id="hpL" style="width:100%"></i></div></div>
      <div class="ar-round" id="rnd">מתכוננים…</div>
      <div class="hpbox r"><b>${esc(R.name)}</b><div class="hpbar"><i id="hpR" style="width:100%"></i></div></div>
    </div>
    <div class="fighters">
      <div class="fighter l" id="fL" style="--c:${colorOf(L.hero)}"><div class="aura"></div>${heroWithFx(L.hero)}<div class="allies">${alliesHTML(L.hero, 74)}</div><div class="dmg" id="dL"></div></div>
      <div class="fx" id="fx"></div>
      <div class="fighter r" id="fR" style="--c:${colorOf(R.hero)}"><div class="aura"></div><div class="flip">${heroWithFx(R.hero)}<div class="allies">${alliesHTML(R.hero, 74)}</div></div><div class="dmg" id="dR"></div></div>
    </div>
    <div class="ar-log" id="log"></div>
    <div class="ar-bottom"><button class="btn small" id="skip">דילוג לתוצאה</button></div>
  </div>`;
  let hpL = 100, hpR = 100, i = 0, stop = false;
  const fx = $('#fx'), log = $('#log');
  const setHP = () => { $('#hpL').style.width = Math.max(0, hpL) + '%'; $('#hpR').style.width = Math.max(0, hpR) + '%'; };
  const hit = (side, n) => { const f = $('#f' + side), d = $('#d' + side); f.classList.remove('hurt'); void f.offsetWidth; f.classList.add('hurt'); d.textContent = '−' + n; d.classList.remove('show'); void d.offsetWidth; d.classList.add('show'); };
  const shoot = (from, kind, color) => {
    fx.innerHTML = `<div class="proj ${kind} from-${from}" style="--c:${color}"></div>`;
    const f = $('#f' + from); f.classList.remove('lunge'); void f.offsetWidth; f.classList.add('lunge');
  };
  const say = t => { log.innerHTML = t; };
  const round = () => {
    if (stop) return;
    if (i >= 8) return finale();
    $('#rnd').textContent = `סיבוב ${i + 1}/8`;
    const a = !!ls[i], b = !!rs[i];
    if (a && !b) { shoot('L', atk(L.hero), colorOf(L.hero)); beep('ok'); setTimeout(() => { hpR -= 11; hit('R', 11); setHP(); }, 450); say(`<b>${esc(L.name)}</b> צדק – ${NAME[atk(L.hero)]}!`); }
    else if (b && !a) { shoot('R', atk(R.hero), colorOf(R.hero)); beep('ok'); setTimeout(() => { hpL -= 11; hit('L', 11); setHP(); }, 450); say(`<b>${esc(R.name)}</b> צדק – ${NAME[atk(R.hero)]}!`); }
    else if (a && b) { fx.innerHTML = `<div class="clash" style="--a:${colorOf(L.hero)};--b:${colorOf(R.hero)}"></div>`; ['L', 'R'].forEach(s => { const f = $('#f' + s); f.classList.remove('lunge'); void f.offsetWidth; f.classList.add('lunge'); }); beep('coin'); setTimeout(() => { hpL -= 4; hpR -= 4; hit('L', 4); hit('R', 4); setHP(); }, 450); say('שניכם צדקתם – התנגשות כוחות!'); }
    else { fx.innerHTML = '<div class="miss">?!</div>'; say('שניכם טעיתם – הכוחות פספסו.'); }
    i++; setTimeout(round, 1500);
  };
  const finale = () => {
    if (stop) return; stop = true;
    $('#rnd').textContent = tie ? 'תיקו!' : 'מכת הסיום'; if (tie) say('כוחות שווים – אף אחד לא נפל!');
    const ws = lWin ? 'L' : 'R', loser = lWin ? 'R' : 'L';
    if (!tie) {
      fx.innerHTML = `<div class="ult from-${ws}" style="--c:${colorOf(W.hero)}"></div>`; const f = $('#f' + ws); f.classList.add('power-up'); const al = (W.hero.allies || []); f.querySelectorAll('.ally').forEach(a => a.classList.add('assist')); say(`<b>${esc(W.name)}</b> משחרר את מכת הסיום – ${NAME.mind}!${al.length ? ` ו${al.map(a => esc(a.name)).join(' ו')} מצטרף/ים להתקפה!` : ''}`);
      setTimeout(() => { if (lWin) hpR = 0; else hpL = 0; setHP(); $('#f' + loser).classList.add('ko'); beep('level'); confetti(); }, 900);
    }
    setTimeout(results, tie ? 600 : 2200);
  };
  let shown = false;
  const results = () => {
    if (shown) return; shown = true; stop = true;
    const lineup = (X, win) => `<div class="res-side ${win ? 'win' : ''}"><div class="mini-h big">${heroSVG(X.hero)}</div><b>${esc(X.name)}</b><span>${X.res.ok}/8 נכונות</span><small>${fmtTime(X.res.t)}</small>${win ? `<em>${ic('trophy')} מנצח</em>` : ''}</div>`;
    const why = tie ? 'אותו מספר תשובות נכונות ואותו זמן – תיקו מושלם!' : L.res.ok === R.res.ok ? `אותו מספר תשובות נכונות – ${esc(W.name)} ניצח כי היה מהיר יותר.` : `${esc(W.name)} צדק ביותר שאלות.`;
    const ov = document.createElement('div'); ov.className = 'ar-result';
    ov.innerHTML = `<div class="ar-card"><h2>${tie ? 'תיקו!' : `${esc(W.name)} ניצח!`}</h2><p class="muted">${why}</p><div class="res-sides">${lineup(L, !tie && lWin)}<span class="vs">VS</span>${lineup(R, !tie && !lWin)}</div>
      ${theirReact ? `<div class="their-react"><span class="rbig">${theirReact}</span> ${esc(R.name)}: ${REACT_TXT[theirReact] || ''}</div>` : ''}
      ${onReact ? `<div class="reacts"><small class="muted">שלח תגובה ל${esc(R.name)}:</small><div>${REACTS.map(e => `<button class="react-b ${e === myReact ? 'on' : ''}" data-e="${e}" title="${REACT_TXT[e]}">${e}</button>`).join('')}</div></div>` : ''}
      ${theirGift && GIFTS[theirGift] ? `<div class="their-react"><span class="rbig">${GIFTS[theirGift].e}</span> ${esc(R.name)} שלח לך ${GIFTS[theirGift].name}!</div>` : ''}
      ${onGift ? `<div class="reacts gifts-row"><small class="muted">שלח ל${esc(R.name)} מתנה מצחיקה:</small><div>${Object.entries(GIFTS).map(([k, g]) => { const n = gifts == null ? '∞' : (gifts[k] || 0); return `<button class="react-b gift-b" data-g="${k}" title="${g.name}" ${n === 0 ? 'disabled' : ''}>${g.e}<i>${n}</i></button>`; }).join('')}</div></div>` : ''}
      <div class="row-btns"><button class="btn small" id="bshare">${ic('send')} שיתוף בווטסאפ</button>${onRematch ? `<button class="btn gold" id="rematch">${ic('duel')} קרב חוזר</button>` : ''}<button class="btn primary" id="bdone">סיום</button></div></div>`;
    $('.arena').appendChild(ov);
    $('#bdone').onclick = async () => {
      const b = $('#bdone'); b.disabled = true; b.textContent = 'רגע…';
      app.className = '';
      try { await onDone?.(); } catch (e) { console.error(e); location.reload(); }
    };
    ov.querySelectorAll('.gift-b').forEach(b => b.onclick = async () => {
      const row = ov.querySelector('.gifts-row'); row.querySelectorAll('button').forEach(x => x.disabled = true);
      const sides = ov.querySelectorAll('.res-side .mini-h'); giftHit(sides[sides.length - 1], b.dataset.g); beep('bad');
      row.querySelector('small').textContent = `${GIFTS[b.dataset.g].name} נשלחה ל${R.name}! 😂`;
      await onGift(b.dataset.g);
    });
    ov.querySelectorAll('.react-b:not(.gift-b)').forEach(b => b.onclick = async () => { ov.querySelectorAll('.react-b:not(.gift-b)').forEach(x => x.classList.toggle('on', x === b)); beep('coin'); await onReact(b.dataset.e); });
    $('#bshare').onclick = async () => {
      const txt = `⚔️ דו-קרב ב-MindHero!\n${L.name}: ${L.res.ok}/8 (${fmtTime(L.res.t)})\n${R.name}: ${R.res.ok}/8 (${fmtTime(R.res.t)})\n${tie ? '🤝 תיקו!' : `🏆 ${W.name} ניצח!`}`;
      // בטלפון: חלון השיתוף של המכשיר. במחשב: ישר לווטסאפ (חלון השיתוף של Windows עלול "לתקוע" את הדף)
      const touch = matchMedia('(pointer: coarse)').matches;
      if (touch && navigator.share) { try { await navigator.share({ text: txt }); return; } catch (e) { if (e.name === 'AbortError') return; } }
      const w = window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener');
      if (!w) { try { await navigator.clipboard.writeText(txt); toast('התוצאה הועתקה – אפשר להדביק בווטסאפ'); } catch { toast('לא הצלחתי לפתוח את ווטסאפ'); } }
    };
    const rm = $('#rematch'); if (rm) rm.onclick = () => { app.className = ''; onRematch(); };
  };
  $('#skip').onclick = () => { if (!stop) { stop = true; hpL = lWin || tie ? Math.max(hpL, 30) : 0; hpR = !lWin || tie ? Math.max(hpR, 30) : 0; setHP(); } results(); };
  setHP(); setTimeout(round, 900);
}
