/* ══════════════════════════════════════
   share.js — Share modal
   Codee App
══════════════════════════════════════ */

import { copyToClipboard, showToast } from './utils.js';
import { VIDS } from './feed.js';

// ── Open ──
export function open(id) {
  const v = VIDS.find(x => x.id === id);
  const url = 'https://codee.app/v/' + id + (v ? '/' + encodeURIComponent(v.title.slice(0, 30)) : '');
  document.getElementById('shareLink').textContent = url;
  document.getElementById('shareM').classList.add('open');
}

// ── Close ──
export function close() { document.getElementById('shareM').classList.remove('open'); }

// ── Copy link ──
export function copyLink() {
  const t = document.getElementById('shareLink').textContent;
  copyToClipboard(t);
  close();
}

// ── Share to platform (simulated) ──
export function shareTo(platform) {
  showToast('↗️ แชร์ไปยัง ' + platform + ' แล้ว!');
  close();
}

// ── Expose to global ──
window._share = { open, close, copyLink, shareTo };