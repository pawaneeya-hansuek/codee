/* ══════════════════════════════════════
   profile.js — Profile side panel
   Codee App
══════════════════════════════════════ */

import { VIDS, SAVED } from './feed.js';
import { escH }        from './utils.js';

// ── Open profile panel ──
export function openProfile() {
  document.getElementById('umenu').classList.remove('open');
  const u = window.CU;

  // Avatar
  const pa = document.getElementById('pavlg');
  pa.textContent    = u.initials || u.name.slice(0, 2).toUpperCase();
  pa.style.background = u.grad || 'linear-gradient(135deg,var(--accent2),var(--accent))';

  // Name / handle
  document.getElementById('pname').textContent   = u.name;
  document.getElementById('phandle').textContent = '@' + u.username;

  // My videos
  const myv = VIDS.filter(v => v.uid === u.username || v.username === u.username);
  document.getElementById('myvcount').textContent = myv.length;
  const grid = document.getElementById('myvgrid');
  grid.innerHTML = myv.length
    ? myv.map(v => `
        <div class="pvthumb" title="${escH(v.title)}" onclick="window._profile.close()">
          ${v.emoji || '🎬'}
        </div>`).join('')
    : '<div style="color:var(--muted);font-size:.8rem;grid-column:1/-1">ยังไม่มีวิดีโอ — กด <strong>+ อัพโหลด</strong> ได้เลย!</div>';

  // Saved videos
  const sv = VIDS.filter(v => SAVED.has(v.id));
  const sl = document.getElementById('svlist');
  sl.innerHTML = sv.length
    ? sv.map(v => `
        <div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:.8rem;cursor:pointer"
             onclick="window._profile.close()">
          🔖 ${escH(v.title.slice(0, 38))}…
        </div>`).join('')
    : '<div style="color:var(--muted);font-size:.8rem">ยังไม่มีวิดีโอที่บันทึก</div>';

  document.getElementById('ppanel').classList.add('open');
}

// ── Close ──
export function close() { document.getElementById('ppanel').classList.remove('open'); }

// ── Shortcuts used by topbar menu ──
export function openSaved()   { openProfile(); }
export function openMyVids()  { openProfile(); }

// ── Expose to global ──
window._profile = { openProfile, close, openSaved, openMyVids };