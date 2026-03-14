/* ══════════════════════════════════════
   utils.js — Shared helpers
   Codee App
══════════════════════════════════════ */

// ── localStorage wrapper ──
export const ls = {
  get(k, d = 'null') {
    try { return JSON.parse(localStorage.getItem(k) || d); } catch { return JSON.parse(d); }
  },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  rm(k)     { localStorage.removeItem(k); },
};

// ── Format number (e.g. 14200 → 14.2K) ──
export function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return (n / 1_000    ).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

// ── Escape HTML to prevent XSS ──
export function escH(s) {
  return String(s)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

// ── Toast notification ──
let _toastTimer;
export function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Copy text to clipboard ──
export function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('🔗 คัดลอกแล้ว!'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('🔗 คัดลอกแล้ว!');
  }
}

// ── Format AI response (markdown-lite) ──
export function fmtAI(text) {
  return text
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, _lang, code) => `<pre>${escH(code.trim())}</pre>`)
    .replace(/`([^`]+)`/g, (_, c) => `<code>${escH(c)}</code>`)
    .replace(/\n/g, '<br>');
}

// ── Relative time (simple) ──
export function relTime(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'เมื่อกี้';
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  return `${Math.floor(h / 24)} วันที่แล้ว`;
}

// ── Generate gradient from string (for avatars) ──
export function strGrad(str) {
  const grads = [
    'linear-gradient(135deg,#7b5cff,#ff4f8b)',
    'linear-gradient(135deg,#00ffc8,#0099ff)',
    'linear-gradient(135deg,#ff4f8b,#ffb800)',
    'linear-gradient(135deg,#00b4d8,#7b5cff)',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return grads[Math.abs(hash) % grads.length];
}

// ── Random emoji for uploaded videos ──
export const VIDEO_EMOJIS = ['🎯','🚀','💡','⚡','🔥','🌟','🛠️','🎓','🧩','🔬'];
export function randomEmoji() {
  return VIDEO_EMOJIS[Math.floor(Math.random() * VIDEO_EMOJIS.length)];
}