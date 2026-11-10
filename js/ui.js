// MindHero – רכיבי ממשק משותפים והצגת שאלות
import { cellSVG } from './gen.js';
import { CHAPTERS } from './bank.js';

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// עוטף ביטויים מתמטיים בכיווניות שמאל-לימין כדי שלא יתהפכו בטקסט עברי
export const bm = s => String(s ?? '').replace(/[0-9a-z(][0-9a-z()★#@×÷+−\-=²³ .,/]*[0-9a-z)²³]/g, m => /[★#@×÷+−=]/.test(m) && /\d/.test(m) ? `<span class="ltrm">${m}</span>` : m);
export const LETTERS = ['א', 'ב', 'ג', 'ד', 'ה'];
export const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const weekKey = (d = new Date()) => { const x = new Date(d); x.setDate(x.getDate() - x.getDay()); return today(x); };
export const fmtTime = s => { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60), r = s % 60; return `${m}:${String(r).padStart(2, '0')}`; };
export const isMobile = () => window.matchMedia('(max-width: 720px)').matches || 'ontouchstart' in window && window.innerWidth < 900;

export function toast(msg, kind = '') {
  const t = document.createElement('div'); t.className = 'toast ' + kind; t.innerHTML = msg;
  document.body.appendChild(t); setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2600);
}
export function modal(html, { onClose, cls = '', closable = true } = {}) {
  const m = document.createElement('div'); m.className = 'modal-bg';
  m.innerHTML = `<div class="modal ${cls}">${closable ? '<button class="modal-x" aria-label="סגירה">✕</button>' : ''}${html}</div>`;
  document.body.appendChild(m);
  const close = () => { m.remove(); onClose && onClose(); };
  if (closable) { $('.modal-x', m).onclick = close; m.addEventListener('click', e => { if (e.target === m) close(); }); }
  return { el: $('.modal', m), close };
}

// צלילים קטנים
let actx = null;
export const sound = { on: localStorage.getItem('mh_sound') !== '0' };
export function beep(kind) {
  if (!sound.on) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const seq = { ok: [[660, .08], [880, .12]], bad: [[220, .18]], level: [[523, .1], [659, .1], [784, .1], [1046, .25]], click: [[440, .03]], coin: [[988, .06], [1319, .12]] }[kind] || [[440, .05]];
    let t = actx.currentTime;
    for (const [f, d] of seq) { const o = actx.createOscillator(), g = actx.createGain(); o.type = kind === 'bad' ? 'sawtooth' : 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d); t += d * .9; }
  } catch {}
}
export function confetti() {
  const box = document.createElement('div'); box.className = 'confetti';
  for (let i = 0; i < 60; i++) { const s = document.createElement('i'); s.style.left = Math.random() * 100 + '%'; s.style.background = ['#facc15', '#22d3ee', '#f472b6', '#a78bfa', '#4ade80'][i % 5]; s.style.animationDelay = Math.random() * .6 + 's'; s.style.transform = `rotate(${Math.random() * 360}deg)`; box.appendChild(s); }
  document.body.appendChild(box); setTimeout(() => box.remove(), 2600);
}

// ----- שאלות -----
export function prepareQ(q, rnd = Math.random) {
  const c = JSON.parse(JSON.stringify(q));
  if (c.type === 'mc' || c.type === 'shape') {
    const idx = c.opts.map((_, i) => i).sort(() => rnd() - .5);
    c.opts = idx.map(i => q.opts[i]); c.ans = idx.indexOf(q.ans);
  }
  if (c.type === 'drag') c.items = c.items.slice().sort(() => rnd() - .5);
  return c;
}

export function isCorrect(q, r) {
  if (r == null) return false;
  if (q.type === 'mc' || q.type === 'shape') return r === q.ans;
  if (q.type === 'input') return String(r).trim().replace(/[,\s]/g, '').replace('−', '-') === q.answer;
  if (q.type === 'drag') {
    if (!Array.isArray(r) || r.some(x => !x)) return false;
    if (q.check.kind === 'order') return q.check.solution.every((x, i) => r[i] === x);
    const pos = n => r.indexOf(n), N = r.length;
    return q.check.rules.every(([k, a, b, c]) => {
      if (k === 'between') return Math.abs(pos(a) - pos(b)) === 1 && Math.abs(pos(a) - pos(c)) === 1;
      if (k === 'end') return pos(a) === 0 || pos(a) === N - 1;
      if (k === 'notAdj') return Math.abs(pos(a) - pos(b)) !== 1;
      if (k === 'adj') return Math.abs(pos(a) - pos(b)) === 1;
      if (k === 'at') return pos(a) === b;
      return true;
    });
  }
  return false;
}
export function answerText(q) {
  if (q.type === 'mc') return q.opts[q.ans];
  if (q.type === 'input') return q.answer;
  if (q.type === 'shape') return 'אפשרות ' + LETTERS[q.ans];
  if (q.type === 'drag') return q.check.kind === 'order' ? q.check.solution.join(' ← ') : 'ראו הסבר';
}

// מציג שאלה. opts: {exam:boolean, response, onAnswer(resp, final), locked, eliminated:[]}
export function renderQuestion(q, el, opts = {}) {
  const ch = CHAPTERS[q.ch];
  const exam = !!opts.exam;
  let html = exam ? '' : `<div class="qch" style="--c:${ch.color}">${ch.icon} ${ch.name}${q.diff ? ` · <span class="stars">${'★'.repeat(q.diff)}${'☆'.repeat(5 - q.diff)}</span>` : ''}</div>`;
  html += `<div class="qtext">${q.q}</div>`;
  if (q.type === 'shape') {
    html += `<div class="matrix">${q.cells.map(c => `<div class="mcell">${cellSVG(c, 72)}</div>`).join('')}<div class="mcell q">${cellSVG(null, 72)}</div></div>`;
    html += `<div class="opts shapeopts">${q.opts.map((o, i) => `<button class="opt sopt" data-i="${i}"><span class="ol">${LETTERS[i]}</span>${cellSVG(o, 62)}</button>`).join('')}</div>`;
  } else if (q.type === 'mc') {
    html += `<div class="opts">${q.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="ol">${LETTERS[i]}</span><span class="ot">${o}</span></button>`).join('')}</div>`;
  } else if (q.type === 'input') {
    html += `<div class="inrow"><input class="ans-in" inputmode="numeric" dir="ltr" autocomplete="off" placeholder="התשובה" value="${esc(opts.response ?? '')}"/>${exam ? '' : '<button class="btn primary submit-in">בדיקה</button>'}</div>`;
  } else if (q.type === 'drag') {
    html += `<div class="drag ${q.layout}"><div class="slots">${q.slots.map((s, i) => `<div class="slot" data-s="${i}"><small>${s}</small><div class="slot-in"></div></div>`).join('')}</div><div class="pool">${q.items.map(n => `<div class="chip" data-n="${esc(n)}">${esc(n)}</div>`).join('')}</div><div class="drag-tip">גררו שם לכיסא – או הקישו על שם ואז על מקום. הקשה על שם שכבר הוצב מחזירה אותו.</div>${exam ? '' : '<button class="btn primary submit-drag">בדיקה</button>'}</div>`;
  }
  el.innerHTML = html;
  const lock = () => el.classList.add('locked');
  if (opts.locked) lock();
  (opts.eliminated || []).forEach(i => { const b = $(`.opt[data-i="${i}"]`, el); if (b) { b.classList.add('elim'); b.disabled = true; } });

  if (q.type === 'mc' || q.type === 'shape') {
    if (opts.response != null) $(`.opt[data-i="${opts.response}"]`, el)?.classList.add('sel');
    $$('.opt', el).forEach(b => b.onclick = () => {
      if (el.classList.contains('locked')) return;
      $$('.opt', el).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); beep('click');
      opts.onAnswer && opts.onAnswer(+b.dataset.i, !exam);
    });
  } else if (q.type === 'input') {
    const inp = $('.ans-in', el);
    if (!isMobile() && !opts.locked) setTimeout(() => inp.focus(), 50);
    const submit = () => { if (inp.value.trim() === '' || el.classList.contains('locked')) return; opts.onAnswer && opts.onAnswer(inp.value.trim(), true); };
    inp.oninput = () => { if (exam) opts.onAnswer && opts.onAnswer(inp.value.trim(), false); };
    inp.onkeydown = e => { if (e.key === 'Enter' && !exam) submit(); };
    const sb = $('.submit-in', el); if (sb) sb.onclick = submit;
  } else if (q.type === 'drag') {
    setupDrag(q, el, opts);
  }
}

function setupDrag(q, el, opts) {
  const exam = !!opts.exam;
  const place = Array.isArray(opts.response) ? opts.response.slice() : Array(q.slots.length).fill(null);
  let selected = null;
  const pool = $('.pool', el);
  const draw = () => {
    $$('.slot', el).forEach((s, i) => { const inn = $('.slot-in', s); inn.innerHTML = place[i] ? `<div class="chip placed" data-n="${esc(place[i])}">${esc(place[i])}</div>` : ''; });
    $$('.pool .chip', el).forEach(c => c.classList.toggle('used', place.includes(c.dataset.n)));
    $$('.chip', el).forEach(c => c.classList.toggle('picked', c.dataset.n === selected));
    bind();
    if (exam) opts.onAnswer && opts.onAnswer(place.slice(), false);
  };
  const putAt = (name, i) => { const prev = place.indexOf(name); if (prev >= 0) place[prev] = null; place[i] = name; selected = null; beep('click'); draw(); };
  const bind = () => {
    $$('.chip', el).forEach(c => {
      c.onclick = () => {
        if (el.classList.contains('locked')) return;
        if (c.classList.contains('placed')) { const i = place.indexOf(c.dataset.n); if (i >= 0) place[i] = null; selected = null; draw(); return; }
        if (c.classList.contains('used')) return;
        selected = selected === c.dataset.n ? null : c.dataset.n; draw();
      };
      c.onpointerdown = e => startDrag(e, c);
    });
    $$('.slot', el).forEach(s => s.onclick = e => { if (selected && !e.target.closest('.chip.placed')) putAt(selected, +s.dataset.s); });
  };
  let ghost = null, dragName = null, moved = false, sx = 0, sy = 0;
  const startDrag = (e, c) => {
    if (el.classList.contains('locked') || c.classList.contains('used')) return;
    dragName = c.dataset.n; moved = false; sx = e.clientX; sy = e.clientY;
    const mv = ev => {
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
      if (!moved) { moved = true; ghost = c.cloneNode(true); ghost.className = 'chip ghost'; document.body.appendChild(ghost); }
      ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px';
      $$('.slot', el).forEach(s => { const r = s.getBoundingClientRect(); s.classList.toggle('over', ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom); });
      ev.preventDefault();
    };
    const up = ev => {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
      if (moved) {
        ghost?.remove(); ghost = null;
        const over = $$('.slot', el).find(s => s.classList.contains('over')); $$('.slot', el).forEach(s => s.classList.remove('over'));
        if (over) putAt(dragName, +over.dataset.s);
        else if (c.classList.contains('placed')) { const i = place.indexOf(dragName); if (i >= 0) place[i] = null; draw(); }
      }
    };
    window.addEventListener('pointermove', mv, { passive: false }); window.addEventListener('pointerup', up);
  };
  draw();
  const sb = $('.submit-drag', el);
  if (sb) sb.onclick = () => { if (place.some(x => !x)) { toast('צריך להציב את כולם לפני בדיקה'); return; } opts.onAnswer && opts.onAnswer(place.slice(), true); };
}

export function markResult(q, el, resp) {
  el.classList.add('locked');
  if (q.type === 'mc' || q.type === 'shape') {
    $$('.opt', el).forEach(b => { const i = +b.dataset.i; if (i === q.ans) b.classList.add('right'); else if (i === resp) b.classList.add('wrong'); });
  } else if (q.type === 'input') {
    const inp = $('.ans-in', el); inp.disabled = true; inp.classList.add(isCorrect(q, resp) ? 'right' : 'wrong');
  } else if (q.type === 'drag') {
    $('.drag', el).classList.add(isCorrect(q, resp) ? 'right' : 'wrong');
  }
}

// גרף עמודות פשוט
export function bars(data, { max, color = '#22d3ee', h = 120, labels = true, goal } = {}) {
  max = max || Math.max(1, ...data.map(d => d.v));
  const w = 100 / data.length;
  return `<svg viewBox="0 0 100 ${h / 3}" preserveAspectRatio="none" class="bars" style="height:${h}px">${goal ? `<line x1="0" x2="100" y1="${h / 3 - (goal / max) * (h / 3 - 2)}" y2="${h / 3 - (goal / max) * (h / 3 - 2)}" stroke="#facc15" stroke-dasharray="1.5 1" stroke-width=".4"/>` : ''}${data.map((d, i) => { const bh = (d.v / max) * (h / 3 - 2); return `<rect x="${i * w + w * .15}" y="${h / 3 - bh}" width="${w * .7}" height="${bh}" rx=".8" fill="${d.c || color}"><title>${esc(d.l)}: ${d.v}</title></rect>`; }).join('')}</svg>${labels ? `<div class="bar-labels">${data.map(d => `<span>${esc(d.l)}</span>`).join('')}</div>` : ''}`;
}
