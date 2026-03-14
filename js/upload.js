/* ══════════════════════════════════════
   upload.js — Video upload & publish
   Codee App
══════════════════════════════════════ */

import { ls, showToast, randomEmoji } from './utils.js';
import { VIDS, renderFeed }           from './feed.js';

let selFile = null;

// ── Open / Close ──
export function openUpload()  { document.getElementById('uploadM').classList.add('open'); }
export function closeUpload() {
  document.getElementById('uploadM').classList.remove('open');
  selFile = null;
  document.getElementById('uzprev').style.display   = 'none';
  document.getElementById('uprompt').style.display  = 'block';
  document.getElementById('uprog').style.display    = 'none';
  document.getElementById('upfill').style.width     = '0';
  document.getElementById('vtitle').value           = '';
  document.getElementById('vdesc').value            = '';
  document.getElementById('fileinput').value        = '';
}

// ── Drag & Drop ──
export function onDragOver(e) { e.preventDefault(); document.getElementById('uzone').classList.add('drag'); }
export function onDragLeave() { document.getElementById('uzone').classList.remove('drag'); }
export function onDrop(e) {
  e.preventDefault(); document.getElementById('uzone').classList.remove('drag');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('video/')) procFile(f);
  else showToast('⚠️ กรุณาเลือกไฟล์วิดีโอเท่านั้น');
}
export function onFileSelect(e) {
  const f = e.target.files[0]; if (f) procFile(f);
}

function procFile(f) {
  if (f.size > 500 * 1024 * 1024) { showToast('⚠️ ไฟล์ใหญ่เกิน 500MB'); return; }
  selFile = f;
  const url = URL.createObjectURL(f);
  document.getElementById('pvid').src    = url;
  document.getElementById('uzinfo').textContent = f.name + ' · ' + (f.size / 1024 / 1024).toFixed(2) + ' MB';
  document.getElementById('uzprev').style.display  = 'block';
  document.getElementById('uprompt').style.display = 'none';
  // Auto-fill title from filename
  if (!document.getElementById('vtitle').value)
    document.getElementById('vtitle').value = f.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
}

// ── Publish ──
export function publishVid() {
  const title = document.getElementById('vtitle').value.trim();
  if (!title) { showToast('⚠️ กรุณากรอกชื่อวิดีโอ'); return; }

  // Show progress bar
  document.getElementById('uprog').style.display = 'block';
  let pct = 0;
  const iv = setInterval(() => {
    pct += Math.random() * 20;
    if (pct >= 100) { pct = 100; clearInterval(iv); finishUpload(title); }
    document.getElementById('upfill').style.width     = pct + '%';
    document.getElementById('uplbl').textContent      = pct < 100
      ? `กำลังอัพโหลด… ${Math.floor(pct)}%`
      : 'เสร็จสิ้น! ✓';
  }, 180);
}

function finishUpload(title) {
  const desc = document.getElementById('vdesc').value.trim();
  const cat  = document.getElementById('vcat').value;
  const tags = desc.match(/#\w+/g)?.map(t => t.slice(1)) || [cat.split(' ')[0]];
  const CU   = window.CU;

  const vid = {
    id:       'v_' + Date.now(),
    uid:      CU.username,
    username: CU.username,
    name:     CU.name,
    emoji:    randomEmoji(),
    ag:       CU.grad,
    title,
    desc:     desc.replace(/#\w+/g, '').trim() || title,
    tags, cat,
    likes: 0, comments: [], views: '0', progress: 0,
    likedBy: [], ts: Date.now(),
  };

  // Persist
  const store = ls.get('codee_vids', '[]');
  store.unshift(vid);
  ls.set('codee_vids', store);
  VIDS.unshift(vid);

  closeUpload();
  renderFeed(VIDS);
  showToast('🎉 เผยแพร่สำเร็จ! "' + title.slice(0, 22) + '"');
  setTimeout(() => document.getElementById('vstack').scrollTo({ top: 0, behavior: 'smooth' }), 300);
}