/* ══════════════════════════════════════
   feed.js — Video data, rendering, actions
   Codee App
══════════════════════════════════════ */

import { ls, fmt, escH, showToast } from './utils.js';

// ── Demo video data ──
export const DEMOS = [
  {
    id: 'd1', uid: 'demo', username: 'devmaster_th', name: 'DevMaster TH',
    emoji: '💻', ag: 'linear-gradient(135deg,#7b5cff,#ff4f8b)',
    title: 'Async/Await ใน 7 นาที — คุณจะไม่งงอีกต่อไป',
    desc:  'อธิบาย async/await ตั้งแต่ Promise chain ยัน error handling',
    tags: ['JavaScript', 'Async'], cat: 'Web Development',
    likes: 14200, views: '128K', progress: 35, comments: [],
    code: `<span class="cm">// async/await example</span>
<span class="kw">async function</span> <span class="fn">fetchUser</span>(id) {
  <span class="kw">try</span> {
    <span class="kw">const</span> res = <span class="kw">await</span> fetch(<span class="str">\`/api/\${id}\`</span>);
    <span class="kw">return</span> res.<span class="fn">json</span>();
  } <span class="kw">catch</span>(e) { console.<span class="fn">error</span>(e); }
}`,
  },
  {
    id: 'd2', uid: 'pythonk', username: 'pythonista_k', name: 'Pythonista K',
    emoji: '🐍', ag: 'linear-gradient(135deg,#00ffc8,#0099ff)',
    title: 'สร้าง REST API ด้วย FastAPI ใน 10 นาที',
    desc:  'FastAPI เร็ว type-safe พร้อม auto Swagger docs',
    tags: ['Python', 'FastAPI'], cat: 'Web Development',
    likes: 9700, views: '84K', progress: 65, comments: [],
    code: `<span class="kw">from</span> fastapi <span class="kw">import</span> FastAPI
app = <span class="fn">FastAPI</span>()

<span class="fn">@app.get</span>(<span class="str">"/items/{id}"</span>)
<span class="kw">async def</span> <span class="fn">read</span>(id: <span class="kw">int</span>):
  <span class="kw">return</span> {<span class="str">"id"</span>: id}`,
  },
  {
    id: 'd3', uid: 'rustth', username: 'rustacean_th', name: 'Rustacean TH',
    emoji: '🦀', ag: 'linear-gradient(135deg,#ff4f8b,#ffb800)',
    title: 'ทำไม Rust ไม่มี GC แต่ยัง Memory Safe?',
    desc:  'Ownership + Borrow Checker = ความปลอดภัยโดยไม่ต้อง GC',
    tags: ['Rust', 'Systems'], cat: 'Algorithms',
    likes: 21300, views: '212K', progress: 15, comments: [],
    code: `<span class="kw">fn</span> <span class="fn">main</span>() {
  <span class="kw">let</span> s1 = String::<span class="fn">from</span>(<span class="str">"hi"</span>);
  <span class="kw">let</span> s2 = &s1; <span class="cm">// borrow</span>
  println!(<span class="str">"{} {}"</span>, s1, s2);
}`,
  },
  {
    id: 'd4', uid: 'godev', username: 'golang_dev', name: 'Golang Dev',
    emoji: '🔵', ag: 'linear-gradient(135deg,#00b4d8,#7b5cff)',
    title: 'Goroutines คืออะไร? Concurrency ง่ายๆ ใน Go',
    desc:  'channel + goroutine ทำให้ Go เหมาะ high-performance systems',
    tags: ['Go', 'Concurrency'], cat: 'Web Development',
    likes: 17500, views: '156K', progress: 50, comments: [],
    code: `<span class="kw">func</span> <span class="fn">worker</span>(ch <span class="kw">chan int</span>) {
  ch <- <span class="num">42</span>
}
ch := <span class="fn">make</span>(<span class="kw">chan int</span>)
<span class="kw">go</span> <span class="fn">worker</span>(ch)
v := <-ch <span class="cm">// 42</span>`,
  },
  {
    id: 'd5', uid: 'aix', username: 'ai_ml_th', name: 'AI/ML Thailand',
    emoji: '🤖', ag: 'linear-gradient(135deg,#ff4f8b,#7b5cff)',
    title: 'Neural Network จาก Scratch ด้วย NumPy เท่านั้น',
    desc:  'Backpropagation ทีละขั้น + visualize gradient descent',
    tags: ['Python', 'AI', 'NumPy'], cat: 'AI / Machine Learning',
    likes: 32100, views: '298K', progress: 25, comments: [],
    code: `<span class="kw">import</span> numpy <span class="kw">as</span> np

<span class="kw">def</span> <span class="fn">sigmoid</span>(x):
  <span class="kw">return</span> <span class="num">1</span> / (<span class="num">1</span> + np.<span class="fn">exp</span>(-x))

<span class="kw">def</span> <span class="fn">forward</span>(X, W, b):
  <span class="kw">return</span> <span class="fn">sigmoid</span>(X @ W + b)`,
  },
];

// ── Global video list ──
export let VIDS = [];

// Load stored comments into demos
DEMOS.forEach(v => {
  const c = ls.get('cc_' + v.id, '[]');
  if (Array.isArray(c)) v.comments = c;
});

// ── Saved & followed sets ──
export let SAVED   = new Set(ls.get('codee_saved', '[]'));
export let FOLLOWS = new Set();

// ── Persist saved ──
function storeSaved() { ls.set('codee_saved', [...SAVED]); }

// ── Load all videos ──
export function loadFeed() {
  const stored = ls.get('codee_vids', '[]');
  VIDS = [...DEMOS, ...stored];
  renderFeed(VIDS);
}

// ── Render feed ──
export function renderFeed(vids) {
  const st = document.getElementById('vstack');
  if (!vids.length) {
    st.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted);font-family:\'Space Mono\',monospace;font-size:.82rem;">ไม่พบวิดีโอ ลองเลือกหมวดอื่น 🔍</div>';
    return;
  }
  st.innerHTML = vids.map(vcardHTML).join('');
}

// ── Build video card HTML ──
function vcardHTML(v) {
  const liked  = v.likedBy && v.likedBy.includes(window.CU?.username);
  const saved  = SAVED.has(v.id);
  const fol    = FOLLOWS.has(v.username);
  const mine   = v.username === window.CU?.username || v.uid === window.CU?.username;

  return `
  <div class="vcard" id="vc_${v.id}">
    <div class="vplayer" onclick="window._feed.playToggle('${v.id}')">
      <div class="vthumb">${v.emoji || '🎬'}</div>
      <div class="voverlay">
        <div class="vtags">${(v.tags || []).map(t => `<span class="vtag">${t}</span>`).join('')}</div>
        <div class="vtitle">${v.title}</div>
      </div>
      <div class="playbtn" id="pb_${v.id}">▶</div>
      <div class="vwm">@${v.username} · codee.app</div>
      <div class="vprog"><div class="vpfill" style="width:${v.progress || 30}%"></div></div>
    </div>
    <div class="vinfo">
      <div class="vmeta">
        <div class="cavatar" style="${v.ag ? 'background:' + v.ag : 'background:linear-gradient(135deg,var(--accent2),var(--accent))'}">
          ${(v.name || v.username).slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div class="cname">${v.name || v.username}</div>
          <div class="chandle">@${v.username} · ${v.views || '0'} views</div>
        </div>
        ${mine
          ? `<span style="margin-left:auto;font-size:.7rem;color:var(--accent);font-family:'Space Mono',monospace">วิดีโอของฉัน</span>`
          : `<button class="bfollow${fol ? ' on' : ''}" onclick="window._feed.toggleFollow(this,'${v.username}')">${fol ? '✓ ติดตาม' : '+ ติดตาม'}</button>`
        }
      </div>
      <div class="vdesc">
        ${escH(v.desc || '')}
        ${(v.tags || []).map(t => `<span class="hl">#${t.toLowerCase().replace(/\s/g, '')}</span>`).join(' ')}
      </div>
      ${v.code ? `<div class="cprev"><div class="cdots"><span></span><span></span><span></span></div><div class="cbody">${v.code}</div></div>` : ''}
      <div class="actbar">
        <button class="abtn${liked ? ' liked' : ''}" onclick="window._feed.toggleLike(this,'${v.id}')">
          ${liked ? '❤️' : '🤍'} <span class="anum">${fmt(v.likes || 0)}</span>
        </button>
        <button class="abtn" onclick="window._comments.open('${v.id}')">
          💬 <span class="anum">${fmt((v.comments || []).length)}</span>
        </button>
        <button class="abtn${saved ? ' saved' : ''}" onclick="window._feed.toggleSave(this,'${v.id}')">
          ${saved ? '🔖' : '🏷️'} <span class="anum">${saved ? 'บันทึกแล้ว' : 'บันทึก'}</span>
        </button>
        <button class="abtn" onclick="window._share.open('${v.id}')">↗️ แชร์</button>
        <button class="bdl" onclick="window._feed.dlVid('${v.id}')">⬇ ดาวน์โหลด</button>
      </div>
    </div>
  </div>`;
}

// ── Actions ──
export function playToggle(id) {
  const btn = document.getElementById('pb_' + id); if (!btn) return;
  const playing = btn.textContent === '⏸';
  document.querySelectorAll('.playbtn').forEach(b => { b.textContent = '▶'; b.classList.remove('playing'); });
  if (!playing) {
    btn.textContent = '⏸'; btn.classList.add('playing');
    showToast('▶ ' + (VIDS.find(v => v.id === id) || {}).title?.slice(0, 28) + '…');
  }
}

export function toggleLike(btn, id) {
  const v = VIDS.find(x => x.id === id); if (!v) return;
  if (!v.likedBy) v.likedBy = [];
  const u = window.CU.username;
  if (v.likedBy.includes(u)) {
    v.likedBy = v.likedBy.filter(x => x !== u); v.likes--;
    btn.classList.remove('liked'); btn.innerHTML = `🤍 <span class="anum">${fmt(v.likes)}</span>`;
  } else {
    v.likedBy.push(u); v.likes++;
    btn.classList.add('liked'); btn.innerHTML = `❤️ <span class="anum">${fmt(v.likes)}</span>`;
    showToast('❤️ กดถูกใจแล้ว!');
  }
  syncVid(v);
}

export function toggleSave(btn, id) {
  if (SAVED.has(id)) {
    SAVED.delete(id); btn.classList.remove('saved');
    btn.innerHTML = '🏷️ <span class="anum">บันทึก</span>'; showToast('🗑 ยกเลิกการบันทึก');
  } else {
    SAVED.add(id); btn.classList.add('saved');
    btn.innerHTML = '🔖 <span class="anum">บันทึกแล้ว</span>'; showToast('🔖 บันทึกแล้ว!');
  }
  storeSaved();
}

export function toggleFollow(btn, username) {
  if (FOLLOWS.has(username)) {
    FOLLOWS.delete(username); btn.textContent = '+ ติดตาม'; btn.classList.remove('on'); showToast('ยกเลิกการติดตาม');
  } else {
    FOLLOWS.add(username); btn.textContent = '✓ ติดตาม'; btn.classList.add('on'); showToast('✓ ติดตาม @' + username + ' แล้ว!');
  }
}

export function dlVid(id) {
  const v = VIDS.find(x => x.id === id); if (!v) return;
  showToast('⬇ กำลังดาวน์โหลด…');
  setTimeout(() => showToast('💾 เสร็จ! ลายน้ำ @' + v.username + ' ถูกฝังแล้ว'), 2000);
}

// ── Tab / Nav filters ──
export function setTab(el, key) {
  document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  let f = [...VIDS];
  if      (key === 'trending')  f = f.sort((a, b) => b.likes - a.likes);
  else if (key === 'following') f = f.filter(v => FOLLOWS.has(v.username));
  else if (key === 'new')       f = [...VIDS].reverse();
  else if (key === 'ai')        f = f.filter(v => v.cat?.toLowerCase().includes('ai'));
  renderFeed(f);
}

export function setNav(el, key) {
  document.querySelectorAll('.navi').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  let f = [...VIDS];
  if      (key === 'trending')  f = f.sort((a, b) => b.likes - a.likes);
  else if (key === 'saved')     f = f.filter(v => SAVED.has(v.id));
  else if (key === 'following') f = f.filter(v => FOLLOWS.has(v.username));
  renderFeed(f);
}

export function catFilter(cat) {
  renderFeed(VIDS.filter(v =>
    v.cat?.toLowerCase().includes(cat.toLowerCase()) ||
    v.tags?.some(t => t.toLowerCase().includes(cat.toLowerCase()))
  ));
  showToast('🔍 หมวด: ' + cat);
}

export function tagSearch(tag) {
  renderFeed(VIDS.filter(v =>
    v.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase())) ||
    v.title.toLowerCase().includes(tag)
  ));
  showToast('🔍 #' + tag);
}

// ── Sync user-uploaded video back to localStorage ──
export function syncVid(v) {
  let store = ls.get('codee_vids', '[]');
  const i = store.findIndex(x => x.id === v.id);
  if (i >= 0) { store[i] = v; ls.set('codee_vids', store); }
}

// ── Expose to global (for inline onclick in cards) ──
window._feed = { playToggle, toggleLike, toggleSave, toggleFollow, dlVid };