// MindHero – סימולציית מבחן בממשק שדומה למבחן הממוחשב האמיתי
import { CHAPTERS, CH_ORDER } from './bank.js?v=9';
import { $, $$, esc, fmtTime, renderQuestion, isCorrect, answerText, modal, confetti, bars, bm } from './ui.js?v=9';
import { ic } from './icons.js?v=9';

const INSTR = {
  verbal: 'בפרק זה תופענה שאלות על משמעות של מילים והשלמת משפטים. קראו בעיון את המשפט ואת כל האפשרויות, ובחרו את התשובה המתאימה ביותר.',
  series: 'בכל שאלה בפרק זה מוצגת סדרה של מספרים או אותיות הבנויה לפי חוק מסוים. עליכם למצוא את החוק ולהשלים את האיבר החסר. בחלק מהשאלות יש להקליד את התשובה.',
  analogy: 'בכל שאלה מוצג זוג מילים שיש ביניהן קשר. בחרו מבין האפשרויות את הזוג שהקשר בין מילותיו זהה לקשר בזוג הנתון.',
  logic: 'בפרק זה שאלות הדורשות הסקת מסקנות. בחלק מהשאלות יש לגרור פריטים למקומם. ייתכן שיש יותר מסידור נכון אחד.',
  math: 'בפרק זה בעיות בחשבון. בחלק מהשאלות יש לבחור תשובה ובחלקן יש להקליד את התשובה. מומלץ להיעזר בדף טיוטה.',
  shapes: 'בשאלות שלפניכם מופיעות צורות המסודרות בשורות ובעמודות לפי חוקיות מסוימת. עליכם להבין את החוקיות ולבחור את הצורה החסרה.',
};

export function startExam({ app, qsByCh, minutes, mini, onExit, onFinish }) {
  const E = { ch: 0, i: -1, resp: qsByCh.map(qs => Array(qs.length).fill(null)), flag: qsByCh.map(qs => Array(qs.length).fill(false)), seenIntro: [], end: Date.now() + minutes * 60000, chTime: Array(6).fill(0), last: Date.now(), done: false };
  let tInt;
  const tickCh = () => { const now = Date.now(); E.chTime[E.ch] += (now - E.last) / 1000; E.last = now; };

  const frame = () => {
    app.className = 'exam-mode';
    app.innerHTML = `<div class="ex">
      <div class="ex-top"><span>מבחן תרגול – MindHero</span><span class="ex-timer" id="ext"></span></div>
      <div class="ex-bar">
        <div class="ex-nav"><button class="ex-btn" id="exprev">→ הקודם</button><button class="ex-btn nx" id="exnext">הבא ←</button></div>
        <div class="ex-mid"><label>פרק: <select id="exch">${CH_ORDER.map((c, i) => `<option value="${i}" ${i === E.ch ? 'selected' : ''}>${CHAPTERS[c].name}</option>`).join('')}<option value="6" ${E.ch === 6 ? 'selected' : ''}>סיום המבחן</option></select></label>
          ${E.ch < 6 ? `<span class="ex-ql">שאלות:</span><div class="ex-nums">${qsByCh[E.ch].map((_, i) => `<button class="${i === E.i ? 'cur' : ''} ${E.resp[E.ch][i] != null && E.resp[E.ch][i] !== '' ? 'ans' : ''} ${E.flag[E.ch][i] ? 'flg' : ''}" data-i="${i}">${i + 1}</button>`).join('')}</div>` : ''}
          ${E.ch < 6 && E.i >= 0 ? `<button class="ex-flag ${E.flag[E.ch][E.i] ? 'on' : ''}" id="exflag" title="סימון לחזרה">${ic('flag')} סימון</button>` : ''}</div>
        <button class="ex-quit" id="exquit">יציאה</button>
      </div>
      <div class="ex-body" id="exbody"></div></div>`;
    $('#exprev').onclick = prev; $('#exnext').onclick = next;
    $('#exch').onchange = e => go(+e.target.value, -1);
    $$('.ex-nums button').forEach(b => b.onclick = () => go(E.ch, +b.dataset.i));
    const fl = $('#exflag'); if (fl) fl.onclick = () => { E.flag[E.ch][E.i] = !E.flag[E.ch][E.i]; frame(); };
    $('#exquit').onclick = () => { const m = modal(`<h3>לצאת מהסימולציה?</h3><p>התשובות לא יישמרו.</p><div class="row-btns"><button class="btn" id="q1">לצאת</button><button class="btn primary" id="q2">להמשיך במבחן</button></div>`); $('#q1', m.el).onclick = () => { clearInterval(tInt); m.close(); onExit(); }; $('#q2', m.el).onclick = m.close; };
    body();
    timer();
  };
  const body = () => {
    const b = $('#exbody');
    if (E.ch === 6) return summary(b);
    const ch = CH_ORDER[E.ch];
    if (E.i < 0) { b.innerHTML = `<div class="ex-intro"><h2>פרק ${CHAPTERS[ch].name}</h2><p>${INSTR[ch]}</p><p>בפרק ${qsByCh[E.ch].length} שאלות. לכל השאלות משקל זהה.</p><p class="muted">לחצו על "הבא" כדי להתחיל.</p></div>`; return; }
    const q = qsByCh[E.ch][E.i];
    const wrap = document.createElement('div'); wrap.className = 'ex-q'; b.innerHTML = ''; b.appendChild(wrap);
    renderQuestion(q, wrap, { exam: true, response: E.resp[E.ch][E.i], onAnswer: r => { E.resp[E.ch][E.i] = r; const nb = $(`.ex-nums button[data-i="${E.i}"]`); if (nb) nb.classList.toggle('ans', r != null && r !== ''); } });
  };
  const go = (ch, i) => { tickCh(); E.ch = ch; E.i = i; frame(); };
  const next = () => { if (E.ch === 6) return; if (E.i < qsByCh[E.ch].length - 1) go(E.ch, E.i + 1); else go(E.ch + 1, E.ch + 1 === 6 ? 0 : -1); };
  const prev = () => { if (E.ch === 6) return go(5, qsByCh[5].length - 1); if (E.i > -1) go(E.ch, E.i - 1); else if (E.ch > 0) go(E.ch - 1, qsByCh[E.ch - 1].length - 1); };
  const timer = () => { clearInterval(tInt); const f = () => { const left = (E.end - Date.now()) / 1000; const t = $('#ext'); if (t) { t.textContent = 'זמן שנותר: ' + fmtTime(left); t.classList.toggle('low', left < 300); } if (left <= 0) { clearInterval(tInt); submit(true); } }; f(); tInt = setInterval(f, 1000); };
  const empties = () => E.resp.map(arr => arr.filter(r => r == null || r === '' || (Array.isArray(r) && r.some(x => !x))).length);
  const summary = b => {
    const em = empties();
    b.innerHTML = `<div class="ex-intro"><h2>סיום המבחן</h2><table class="ex-sum"><tr><th>פרק</th><th>ללא תשובה</th><th>מסומנות</th></tr>${CH_ORDER.map((c, i) => `<tr><td><a href="#" data-c="${i}">${CHAPTERS[c].name}</a></td><td class="${em[i] ? 'warnc' : ''}">${em[i]}</td><td>${E.flag[i].filter(Boolean).length}</td></tr>`).join('')}</table>
      ${em.some(x => x) ? '<p class="warnc">יש שאלות בלי תשובה. אין עונש על ניחוש – כדאי לחזור ולסמן תשובה בכל אחת.</p>' : '<p>ענית על כל השאלות.</p>'}
      <button class="btn gold big" id="exsub">הגשת המבחן</button></div>`;
    $$('a[data-c]', b).forEach(a => a.onclick = e => { e.preventDefault(); const c = +a.dataset.c; const firstEmpty = E.resp[c].findIndex(r => r == null || r === ''); go(c, firstEmpty >= 0 ? firstEmpty : 0); });
    $('#exsub').onclick = () => submit(false);
  };
  const submit = (timeUp) => {
    if (E.done) return; E.done = true; clearInterval(tInt); tickCh();
    const perCh = qsByCh.map((qs, c) => ({ n: qs.length, ok: qs.filter((q, i) => isCorrect(q, E.resp[c][i])).length }));
    const ok = perCh.reduce((s, x) => s + x.ok, 0), n = perCh.reduce((s, x) => s + x.n, 0);
    const wrong = []; qsByCh.forEach((qs, c) => qs.forEach((q, i) => { if (!isCorrect(q, E.resp[c][i])) wrong.push(q); }));
    const em = empties().reduce((a, b) => a + b, 0);
    const score = Math.round(ok / n * 100);
    const xp = onFinish({ score, perCh, ok, n, wrong, empty: em });
    const weakest = CH_ORDER.map((c, i) => [c, perCh[i].ok / perCh[i].n]).sort((a, b) => a[1] - b[1]);
    app.className = '';
    app.innerHTML = `<header class="topbar"><span></span><b>${ic('exam')} תוצאות הסימולציה</b><span></span></header><main class="list-screen sim-res">
      ${timeUp ? '<p class="warn">הזמן נגמר, והמבחן הוגש אוטומטית.</p>' : ''}
      <div class="big-score">${score}%</div><p class="center">${ok} תשובות נכונות מתוך ${n} · +${xp} XP</p>
      <h4>לפי פרקים</h4>${bars(CH_ORDER.map((c, i) => ({ l: CHAPTERS[c].name, v: Math.round(perCh[i].ok / perCh[i].n * 100), c: CHAPTERS[c].color })), { max: 100, h: 140 })}
      <h4>זמן בכל פרק</h4><div class="time-row">${CH_ORDER.map((c, i) => `<span style="--c:${CHAPTERS[c].color}">${ic(c)} ${fmtTime(E.chTime[i])}</span>`).join('')}</div>
      <div class="tips"><b>מה לומדים מהסימולציה:</b><ul>
        ${em ? `<li>נשארו <b>${em}</b> שאלות ריקות – במבחן האמיתי תמיד מנחשים.</li>` : '<li>לא השארת אף שאלה ריקה – מצוין.</li>'}
        <li>כדאי לחזק: <b>${CHAPTERS[weakest[0][0]].name}</b> ו<b>${CHAPTERS[weakest[1][0]].name}</b>. השאלות שטעית בהן נכנסו למעבדת הטעויות.</li>
        ${E.chTime.some(t => t > minutes * 60 / 6 * 1.4) ? '<li>בחלק מהפרקים בילית הרבה יותר מ-15 דקות. תקוע? מסמנים, מנחשים וממשיכים.</li>' : ''}</ul></div>
      <details class="review"><summary>מעבר על הטעויות (${wrong.length})</summary>${wrong.slice(0, 40).map(q => `<div class="rv"><div class="rv-q">${q.q}</div><div class="rv-a">✔ ${answerText(q)}</div><div class="rv-e">${bm(q.exp)}</div></div>`).join('')}</details>
      <button class="btn primary big" id="exback">חזרה לבסיס</button></main>`;
    if (score >= 70) confetti();
    $('#exback').onclick = onExit;
  };
  frame();
}
