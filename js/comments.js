/* ══════════════════════════════════════
   comments.js — Comment modal
   Codee App
══════════════════════════════════════ */

import { ls, escH, fmt, showToast } from './utils.js';
import { VIDS, syncVid }            from './feed.js';

let CURVID = null; // current video id

// ── Open modal ──
export function open(id) {
  CURVID = id;
  const v = VIDS.find(x => x.id === id);
  document.getElementById('comTitle').textContent = '💬 ' + (v?.title?.slice(0, 32) || '') + '…';
  renderComs(v?.comments || []);
  document.getElementById('comM').classList.add('open');
  document.getElementById('cominp').focus();
}

// ── Close modal ──
export function close() {
  document.getElementById('comM').classList.remove('open');
  CURVID = null;
}

// ── Render comment list ──
function renderComs(list) {
  const el = document.getElementById('clist');
  if (!list.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:.81rem;padding:8px 0">ยังไม่มีความคิดเห็น — เป็นคนแรกที่แสดงความคิดเห็น!</div>';
    return;
  }
  const gs = [
    'linear-gradient(135deg,#7b5cff,#ff4f8b)',
    'linear-gradient(135deg,#00ffc8,#0099ff)',
    'linear-gradient(135deg,#ff4f8b,#ffb800)',
  ];
  el.innerHTML = list.map(c => `
    <div class="ci">
      <div class="cia" style="background:${gs[c.user.charCodeAt(0) % 3]}">${c.user.slice(0, 2).toUpperCase()}</div>
      <div class="cib">
        <div class="cin">@${escH(c.user)}</div>
        <div class="cit">${escH(c.text)}</div>
        <div class="ctime">${c.time}</div>
      </div>
    </div>`).join('');
  el.scrollTop = el.scrollHeight;
}

// ── Submit comment ──
export function submit() {
  const inp  = document.getElementById('cominp');
  const text = inp.value.trim();
  if (!text || !CURVID) return;
  const v = VIDS.find(x => x.id === CURVID); if (!v) return;

  const comment = {
    user: window.CU.username,
    text,
    time: new Date().toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
  };
  v.comments.push(comment);
  ls.set('cc_' + v.id, v.comments);
  syncVid(v);
  renderComs(v.comments);
  inp.value = '';

  // Update comment count badge on the card
  const card = document.getElementById('vc_' + v.id);
  if (card) {
    card.querySelectorAll('.abtn').forEach(b => {
      if (b.innerHTML.includes('💬'))
        b.innerHTML = `💬 <span class="anum">${fmt(v.comments.length)}</span>`;
    });
  }
  showToast('💬 แสดงความคิดเห็นแล้ว!');
}

// ── Expose to global ──
window._comments = { open, close, submit };