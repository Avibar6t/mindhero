// MindHero – סט אייקונים אחיד (24×24, קו מעוגל + מילוי דו-גוני)
const D = 'fill="currentColor" fill-opacity=".22"';
const P = {
  // פרקים
  verbal: `<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z" ${D}/><path d="M8 8h8M8 11.5h5"/>`,
  series: `<rect x="3" y="14" width="4" height="6" rx="1" ${D}/><rect x="10" y="10" width="4" height="10" rx="1" ${D}/><rect x="17" y="5" width="4" height="15" rx="1" ${D}/><path d="M4 9l5-4 4 2 6-4"/>`,
  analogy: `<rect x="2.5" y="8" width="10" height="8" rx="4" ${D}/><rect x="11.5" y="8" width="10" height="8" rx="4"/>`,
  logic: `<path d="M5 9h3a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v3H5v-3a2 2 0 1 0 0-4z" ${D}/><path d="M15 5h4v4"/>`,
  math: `<rect x="3.5" y="3.5" width="17" height="17" rx="3" ${D}/><path d="M7 8h4M9 6v4M14 8h3M7 15l3 3M10 15l-3 3M14 15.5h3M14 17.5h3"/>`,
  shapes: `<path d="M7 3.5l4 7H3z" ${D}/><circle cx="17" cy="7" r="3.5"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h6v6h-6z" ${D}/>`,
  // ניווט
  home: `<path d="M3.5 11L12 4l8.5 7v8.5a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z" ${D}/>`,
  target: `<circle cx="12" cy="12" r="8.5" ${D}/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>`,
  academy: `<path d="M2.5 9L12 4.5 21.5 9 12 13.5z" ${D}/><path d="M6.5 11v4.5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3V11M21.5 9v5"/>`,
  exam: `<rect x="5" y="4" width="14" height="17" rx="2" ${D}/><path d="M9 4V3h6v1M8.5 12l2 2 4-4.5M8.5 17.5h7"/>`,
  duel: `<path d="M4 4l9 9M4 4h4M4 4v4M20 4l-9 9M20 4h-4M20 4v4"/><path d="M8 15l-3 3 1 1 3-3M16 15l3 3-1 1-3-3" ${D}/><path d="M7 13l4 4M17 13l-4 4"/>`,
  trophy: `<path d="M7 4h10v5a5 5 0 0 1-10 0z" ${D}/><path d="M7 6H4.5a2.5 2.5 0 0 0 2.5 4M17 6h2.5a2.5 2.5 0 0 1-2.5 4M12 14v3M8 20.5h8M9.5 17h5v3.5h-5z"/>`,
  chart: `<path d="M4 20V4M4 20h16"/><rect x="7" y="12" width="3" height="5" rx=".8" ${D}/><rect x="12" y="8" width="3" height="9" rx=".8" ${D}/><rect x="17" y="5" width="3" height="12" rx=".8" ${D}/>`,
  armor: `<path d="M8 3.5L4 6l1.5 5L7 10v10.5h10V10l1.5 1L20 6l-4-2.5c-.5 1.8-2 3-4 3s-3.5-1.2-4-3z" ${D}/>`,
  spark: `<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" ${D}/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>`,
  // משימות
  radar: `<circle cx="12" cy="12" r="8.5" ${D}/><circle cx="12" cy="12" r="4.5"/><path d="M12 12l6-6"/><circle cx="15.5" cy="9" r="1.2" fill="currentColor"/>`,
  flame: `<path d="M12 21c-4 0-6.5-2.7-6.5-6.2 0-3.6 2.8-5.6 4-9.3 2 1.2 3 3 3 4.8 1-.6 1.6-1.8 1.8-3 2.4 2 4.2 4.6 4.2 7.5 0 3.5-2.5 6.2-6.5 6.2z" ${D}/><path d="M12 21c-1.7 0-2.8-1.2-2.8-2.8 0-1.7 1.4-2.6 2-4.2 1.6 1 3.6 2.5 3.6 4.2 0 1.6-1.1 2.8-2.8 2.8z"/>`,
  crosshair: `<circle cx="12" cy="12" r="7" ${D}/><path d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>`,
  boss: `<path d="M5 10c0-4 3-6.5 7-6.5s7 2.5 7 6.5v3.5c0 2-1 3.5-2.5 4.2V20.5h-9v-2.8C6 17 5 15.5 5 13.5z" ${D}/><path d="M5 7L3 3.5 7 5M19 7l2-3.5L17 5"/><path d="M8.5 11.5l2 1M15.5 11.5l-2 1M10 17v1.5M14 17v1.5"/>`,
  flask: `<path d="M9.5 3.5h5M10.5 3.5v5L5 18.5A1.5 1.5 0 0 0 6.3 20.5h11.4a1.5 1.5 0 0 0 1.3-2L13.5 8.5v-5"/><path d="M7.5 14.5h9l2 4H5.5z" ${D}/><circle cx="11" cy="17" r=".9" fill="currentColor"/><circle cx="14" cy="16" r=".7" fill="currentColor"/>`,
  chat: `<path d="M20.5 11.5c0 4.1-3.8 7.5-8.5 7.5-1.2 0-2.3-.2-3.3-.6L4 20l1.3-3.6A7 7 0 0 1 3.5 11.5C3.5 7.4 7.3 4 12 4s8.5 3.4 8.5 7.5z" ${D}/><path d="M12 14.5s-3-1.7-3-3.6a1.5 1.5 0 0 1 3-.4 1.5 1.5 0 0 1 3 .4c0 1.9-3 3.6-3 3.6z" fill="currentColor"/>`,
  // סטטוס וכלים
  coin: `<circle cx="12" cy="12" r="8.5" fill="#fbbf24" stroke="#b45309"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#b45309" stroke-opacity=".6"/><path d="M12 9v6M10.5 10.5h3" stroke="#92400e"/>`,
  xp: `<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z" ${D}/>`,
  clock: `<circle cx="12" cy="12" r="8.5" ${D}/><path d="M12 7.5V12l3 2"/>`,
  gift: `<rect x="4" y="9" width="16" height="11.5" rx="1.5" ${D}/><path d="M3 9h18M12 9v11.5M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9zM12 9c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z"/>`,
  lock: `<rect x="5" y="10.5" width="14" height="10" rx="2" ${D}/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2.5"/>`,
  check: `<path d="M5 12.5l4.5 4.5L19 7.5"/>`,
  x: `<path d="M6 6l12 12M18 6L6 18"/>`,
  flag: `<path d="M5 21V4M5 4h11l-2 4 2 4H5" ${D}/>`,
  bulb: `<path d="M9 17.5h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16.5h5V15.9c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" ${D}/>`,
  antenna: `<circle cx="12" cy="11" r="2" fill="currentColor"/><path d="M8.5 7.5a5 5 0 0 0 0 7M15.5 7.5a5 5 0 0 1 0 7M5.5 4.5a9 9 0 0 0 0 13M18.5 4.5a9 9 0 0 1 0 13M12 13l-3 8h6z"/>`,
  sound: `<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" ${D}/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>`,
  mute: `<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" ${D}/><path d="M16 9.5l5 5M21 9.5l-5 5"/>`,
  back: `<path d="M9 5l7 7-7 7"/>`,
  next: `<path d="M15 5l-7 7 7 7"/>`,
  refresh: `<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4h-4"/>`,
  send: `<path d="M20.5 3.5L3.5 10.5l7 2.5 2.5 7z" ${D}/><path d="M20.5 3.5L10.5 13"/>`,
  users: `<circle cx="9" cy="8.5" r="3.5" ${D}/><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.8c2 .7 3.3 2.5 3.6 5.2"/>`,
  star: `<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" ${D}/>`,
  gear: `<circle cx="12" cy="12" r="3"/><path d="M12 2.5l1.6 2.6 3-.7.7 3 2.6 1.6-1.4 2.7 1.4 2.7-2.6 1.6-.7 3-3-.7L12 21.5l-1.6-2.6-3 .7-.7-3-2.6-1.6L5.5 12 4.1 9.3l2.6-1.6.7-3 3 .7z" ${D}/>`,
  mail: `<rect x="3" y="5.5" width="18" height="13" rx="2" ${D}/><path d="M3.5 7l8.5 6 8.5-6"/>`,
  heart: `<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" ${D}/>`,
  breath: `<path d="M3 9h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17h7"/>`,
  pause: `<rect x="6" y="4.5" width="4" height="15" rx="1.2" ${D}/><rect x="14" y="4.5" width="4" height="15" rx="1.2" ${D}/>`,
  parent: `<circle cx="9" cy="7" r="3" ${D}/><circle cx="17" cy="10" r="2.3"/><path d="M3.5 20c.4-3.6 2.6-6 5.5-6s5.1 2.4 5.5 6M14.5 20c.3-2.6 1.4-4.5 3-4.5s2.7 1.9 3 4.5"/>`,
  switch: `<path d="M4 8h13l-3-3M20 16H7l3 3"/>`,
  // כוחות
  hawk: `<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" ${D}/><circle cx="12" cy="12" r="3"/><path d="M12 3v2M5 5l1.3 1.5M19 5l-1.3 1.5"/>`,
  insight: `<path d="M9 17.5h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16.5h5V15.9c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" ${D}/><path d="M12 7v4l2 1"/>`,
  slow: `<path d="M6.5 3.5h11M6.5 20.5h11M7.5 3.5c0 4 4.5 5 4.5 8.5S7.5 16.5 7.5 20.5M16.5 3.5c0 4-4.5 5-4.5 8.5s4.5 4.5 4.5 8.5"/><path d="M9 20.5c0-2 3-3 3-3s3 1 3 3z" ${D}/>`,
  shield: `<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z" ${D}/><path d="M8.5 12l2.5 2.5 4.5-5"/>`,
  storm: `<path d="M4 6h14M6 10h12M8 14h8M10 18h4M12 21v1"/>`,
  memory: `<rect x="3" y="6.5" width="18" height="13" rx="2.5" ${D}/><circle cx="12" cy="13" r="3.5"/><path d="M8.5 6.5L10 4h4l1.5 2.5"/>`,
  freeze: `<path d="M12 2.5v19M4 7l16 10M20 7L4 17M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/>`,
  telek: `<path d="M12 12c0-1.4 1.1-2 2-2 1.7 0 2.7 1.5 2.7 3 0 2.5-2.2 4.5-4.7 4.5-3.4 0-6-2.8-6-6.2C6 7.5 9.3 4.5 13 4.5c4.4 0 8 3.6 8 8"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>`,
};

export function ic(name, cls = '') {
  const body = P[name] || P.star;
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

// פני מצב רוח – אחידות בסגנון
const MOOD = {
  great: { c: '#4ade80', m: 'M8 13.5q4 4 8 0', b: '' , e: 'M8.6 9.5q.9-1.2 1.8 0M13.6 9.5q.9-1.2 1.8 0' },
  ok: { c: '#a3e635', m: 'M8.5 14.5q3.5 2 7 0', b: '' },
  tired: { c: '#94a3b8', m: 'M9.5 15h5', b: '', e: 'M8 10h3M13 10h3', z: true },
  confused: { c: '#fbbf24', m: 'M8.5 15q2-1.5 3.5 0t3.5 0', b: 'M7.5 7.5l2.5 1M16.5 6.5l-2.5 1.5' },
  frustrated: { c: '#fb923c', m: 'M8.5 16q3.5-2.5 7 0', b: 'M7.5 7.5l3 1.5M16.5 7.5l-3 1.5' },
  stressed: { c: '#60a5fa', m: 'M9 15.5q3-2 6 0', b: 'M7.5 8.5l2.5-1.5M16.5 8.5l-2.5-1.5', sweat: true },
  quit: { c: '#c4b5fd', m: 'M9 16q3-2.5 6 0', b: 'M8 8.5l2.5-1M16 8.5l-2.5-1', tear: true },
};
export function moodFace(k) {
  const f = MOOD[k] || MOOD.ok;
  return `<svg class="mood-face" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="${f.c}" stroke="#0e1630" stroke-width="1.4"/>
    ${f.e ? `<path d="${f.e}" stroke="#0e1630" stroke-width="1.5" fill="none" stroke-linecap="round"/>` : '<circle cx="9" cy="10" r="1.3" fill="#0e1630"/><circle cx="15" cy="10" r="1.3" fill="#0e1630"/>'}
    ${f.b ? `<path d="${f.b}" stroke="#0e1630" stroke-width="1.4" fill="none" stroke-linecap="round"/>` : ''}
    <path d="${f.m}" stroke="#0e1630" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    ${f.sweat ? '<path d="M18.5 5.5q1.5 2 0 3t-1.2-1.5z" fill="#e0f2fe" stroke="#0e1630" stroke-width=".8"/>' : ''}
    ${f.tear ? '<path d="M8 12q.8 1.5 0 2.3t-.8-1.2z" fill="#e0f2fe"/>' : ''}
    ${f.z ? '<text x="16.5" y="6.5" font-size="5" font-weight="700" fill="#0e1630">z</text>' : ''}</svg>`;
}

// סצנת לובי לכל סגנון – רקע מאחורי הגיבור
export function lobbyScene(style) {
  if (style === 'pixel') {
    const blocks = []; const cols = ['#5b8c3a', '#6fa344', '#4f7a32'];
    for (let x = 0; x < 20; x++) { const h = 3 + Math.round(Math.sin(x * .7) * 1.5 + Math.cos(x * .3)); for (let y = 0; y < h; y++) blocks.push(`<rect x="${x * 16}" y="${200 - (y + 1) * 16}" width="16.3" height="16.3" fill="${y === h - 1 ? cols[(x * 7) % 3] : ['#7a5230', '#6b4626', '#86592f'][(x + y) % 3]}"/>`); }
    return `<svg class="scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice" shape-rendering="crispEdges"><defs><linearGradient id="skyp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e3a8a"/><stop offset="1" stop-color="#60a5fa"/></linearGradient></defs><rect width="320" height="200" fill="url(#skyp)"/><rect x="240" y="24" width="28" height="28" fill="#fde68a"/><rect x="244" y="28" width="20" height="20" fill="#fef9c3"/>
      <g fill="#fff" opacity=".85"><rect x="30" y="40" width="48" height="10"/><rect x="40" y="32" width="24" height="10"/><rect x="150" y="56" width="40" height="8"/></g>${blocks.join('')}</svg>`;
  }
  if (style === 'tactical') {
    const hex = []; for (let r = 0; r < 6; r++) for (let c = 0; c < 12; c++) { const x = c * 30 + (r % 2) * 15, y = 120 + r * 14; hex.push(`<polygon points="${x},${y - 8} ${x + 13},${y - 4} ${x + 13},${y + 4} ${x},${y + 8} ${x - 13},${y + 4} ${x - 13},${y - 4}" />`); }
    return `<svg class="scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice"><defs><radialGradient id="labg" cx=".5" cy=".9" r=".9"><stop offset="0" stop-color="#0f3b46"/><stop offset="1" stop-color="#070d1c"/></radialGradient></defs><rect width="320" height="200" fill="url(#labg)"/>
      <g stroke="#22d3ee" stroke-opacity=".25" fill="none">${hex.join('')}</g>
      <g stroke="#22d3ee" stroke-opacity=".35"><path d="M20 30h60v40M300 20h-50v30M250 50h-20"/><circle cx="80" cy="70" r="3" fill="#22d3ee"/><circle cx="230" cy="50" r="3" fill="#22d3ee"/></g>
      <rect x="20" y="80" width="40" height="26" rx="3" fill="#0b1324" stroke="#22d3ee" stroke-opacity=".5"/><path d="M26 98l6-6 5 4 8-9 8 5" stroke="#4ade80" fill="none"/>
      <rect x="262" y="70" width="38" height="36" rx="3" fill="#0b1324" stroke="#22d3ee" stroke-opacity=".5"/><circle cx="281" cy="88" r="10" fill="none" stroke="#22d3ee" stroke-dasharray="4 3"/></svg>`;
  }
  // comic – קו רקיע של עיר בלילה
  const bld = [[0, 90, 34], [30, 60, 28], [56, 105, 30], [84, 75, 40], [122, 120, 26], [146, 82, 36], [180, 100, 30], [208, 64, 34], [240, 112, 26], [264, 86, 30], [292, 70, 30]];
  return `<svg class="scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="skyc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset=".7" stop-color="#4c1d95"/><stop offset="1" stop-color="#9d174d"/></linearGradient><pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="#fff" fill-opacity=".07"/></pattern></defs>
    <rect width="320" height="200" fill="url(#skyc)"/><rect width="320" height="200" fill="url(#dots)"/><circle cx="260" cy="44" r="18" fill="#fde68a" opacity=".9"/>
    <path d="M160 0 L120 200 L200 200 Z" fill="#fde68a" opacity=".07"/>
    ${bld.map(([x, y, w], i) => `<rect x="${x}" y="${y}" width="${w}" height="${200 - y}" fill="${i % 2 ? '#1e1b4b' : '#2e1065'}"/>${Array.from({ length: Math.floor((200 - y) / 16) }, (_, k) => `<rect x="${x + 6}" y="${y + 8 + k * 16}" width="5" height="6" fill="#fde68a" opacity="${(i + k) % 3 ? .15 : .7}"/><rect x="${x + w - 11}" y="${y + 8 + k * 16}" width="5" height="6" fill="#fde68a" opacity="${(i * k) % 4 ? .15 : .6}"/>`).join('')}`).join('')}</svg>`;
}
