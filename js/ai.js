/* ══════════════════════════════════════
   ai.js — AI Chat panel & Search AI
   Codee App
══════════════════════════════════════ */

import { fmtAI, escH, showToast } from './utils.js';
import { VIDS } from './feed.js';

// ── Knowledge base (offline fallback) ──
export const KB = {
  'async':        'async/await คือ syntactic sugar บน Promise ทำให้ async code อ่านง่าย ใช้ <code>await</code> หน้า Promise เพื่อรอผล',
  'promise':      'Promise = object แทน async operation มี 3 state: pending, fulfilled, rejected ใช้ .then() .catch() .finally()',
  'react':        'React คือ JS library สร้าง UI โดย Meta ใช้ Virtual DOM, component-based, Hooks เหมาะสร้าง SPA',
  'python':       'Python เป็น interpreted, dynamically typed นิยมใน Data Science, AI/ML, web backend (FastAPI, Django)',
  'docker':       'Docker = containerization platform แยก app เป็น containers deploy ได้ทุกที่ แก้ปัญหา "works on my machine"',
  'rust':         'Rust = systems lang memory safety ไม่มี GC ผ่าน Ownership + Borrow Checker ประสิทธิภาพสูงเทียบ C/C++',
  'sql':          'SQL จัดการ relational DB: DDL, DML (SELECT/INSERT/UPDATE/DELETE), JOIN, INDEX, Transaction, ACID',
  'api':          'API = interface ให้ programs สื่อสารกัน REST ใช้ HTTP (GET/POST/PUT/DELETE), GraphQL ยืดหยุ่นกว่า',
  'git':          'Git = version control ติดตาม changes คำสั่งสำคัญ: init, add, commit, push, pull, branch, merge, rebase',
  'typescript':   'TypeScript = JS + static typing ช่วย catch error ตอน compile-time ทำ codebase ใหญ่ maintainable',
  'kubernetes':   'Kubernetes (k8s) = container orchestration จัดการ deploy, scale containers อัตโนมัติ ใช้คู่ Docker',
  'big o':        'Big O: O(1) constant, O(log n) binary search, O(n) linear, O(n log n) merge sort, O(n²) bubble sort',
  'go':           'Go (Golang) โดย Google เหมาะ microservices, CLI compile เร็ว Goroutines ทำ concurrency ง่าย',
  'nextjs':       'Next.js = React framework เพิ่ม SSR/SSG/ISR, App Router, API Routes สร้าง full-stack app ในที่เดียว',
  'nosql':        'NoSQL: Document (MongoDB), Key-Value (Redis), Column (Cassandra), Graph (Neo4j) ไม่มี schema ตายตัว',
  'microservice': 'Microservices แบ่ง app เป็น services เล็กๆ deploy แยก สื่อสาร API ช่วย scale เฉพาะส่วนที่ต้องการ',
  'algorithm':    'Algorithm คือขั้นตอนแก้ปัญหา สำคัญ: Sorting, Search (BFS/DFS), Dynamic Programming, Greedy, Divide & Conquer',
  'linux':        'Linux คือ open-source OS kernel คำสั่งพื้นฐาน: ls, cd, mkdir, rm, cat, grep, chmod, sudo, apt/yum',
  'css':          'CSS จัดสไตล์ HTML: Flexbox, Grid สำหรับ layout, ตัวแปร custom properties, media queries สำหรับ responsive',
  'vue':          'Vue.js คือ progressive JS framework reactive data binding, component-based เหมาะสร้าง SPA ง่ายกว่า React',
};

// ── Init AI Chat with welcome message ──
export function initAI() {
  const chat = document.getElementById('aichat');
  const name = window.CU?.name || 'นักพัฒนา';
  chat.innerHTML = `
    <div class="msg ai">
      <div class="mlbl">✦ Codee AI</div>
      <div class="mbub">สวัสดีครับ ${escH(name)}! 👾<br>ถามเรื่อง IT ได้เลย ทั้ง concept, code, หรือ career</div>
    </div>
    <div class="msg ai">
      <div class="mlbl">ตัวอย่าง</div>
      <div class="mbub">• "async/await คืออะไร"<br>• "React vs Vue ต่างยังไง"<br>• "Docker ใช้ทำอะไร"<br>• "Big O คืออะไร"</div>
    </div>`;
  chat.scrollTop = chat.scrollHeight;
}

// ── Handle Enter key ──
export function aiKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAI(); }
}

// ── Send message to AI ──
export async function sendAI() {
  const inp  = document.getElementById('aiinput');
  const q    = inp.value.trim(); if (!q) return;
  inp.value  = '';
  const btn  = document.getElementById('aisend');
  btn.disabled = true;

  const chat = document.getElementById('aichat');

  // User bubble
  chat.innerHTML += `
    <div class="msg user">
      <div class="mlbl">คุณ</div>
      <div class="mbub">${escH(q)}</div>
    </div>`;

  // Typing indicator
  const tid = 't_' + Date.now();
  chat.innerHTML += `
    <div class="msg ai" id="${tid}">
      <div class="mlbl">✦ Codee AI</div>
      <div class="mbub" style="opacity:.5">กำลังคิด…</div>
    </div>`;
  chat.scrollTop = chat.scrollHeight;

  let answer = '';
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system:     'คุณคือ Codee AI ผู้ช่วยสอน IT Programming ตอบเป็นภาษาไทย กระชับ ชัดเจน ไม่เกิน 200 คำ ใช้ emoji เล็กน้อย ถ้ามีโค้ดให้ครอบด้วย backtick',
        messages:   [{ role: 'user', content: q }],
      }),
    });
    const d = await r.json();
    answer = d.content?.map(b => b.text || '').join('') || 'ขออภัย ไม่สามารถตอบได้ตอนนี้';
  } catch {
    // Offline fallback
    const ql = q.toLowerCase();
    for (const [k, v] of Object.entries(KB)) { if (ql.includes(k)) { answer = v; break; } }
    if (!answer) answer = 'ขออภัย เชื่อมต่อไม่ได้ตอนนี้ 🙏 ลองใหม่อีกครั้งนะครับ';
  }

  const el = document.getElementById(tid);
  if (el) {
    el.querySelector('.mbub').style.opacity = '1';
    el.querySelector('.mbub').innerHTML = fmtAI(answer);
  }
  chat.scrollTop = chat.scrollHeight;
  btn.disabled = false;
}

// ── Search bar AI answer ──
let _stimer;
export function initSearch() {
  document.getElementById('sinput').addEventListener('input', function () {
    const q = this.value.trim();
    clearTimeout(_stimer);
    if (!q) { document.getElementById('sdd').classList.remove('open'); return; }
    document.getElementById('sdd').classList.add('open');
    document.getElementById('sddhint').textContent = 'กำลังค้นหา…';

    _stimer = setTimeout(() => {
      // Video results
      const res = VIDS.filter(v =>
        v.title.toLowerCase().includes(q.toLowerCase()) ||
        v.tags?.some(t => t.toLowerCase().includes(q.toLowerCase()))
      ).slice(0, 4);

      document.getElementById('sdditems').innerHTML = res.map(v =>
        `<div class="sdd-item" onclick="
          document.getElementById('sdd').classList.remove('open');
          document.getElementById('sinput').value='';
          window._feedRender([window._vids.find(x=>x.id==='${v.id}')])
        "><span class="sdd-ico">📹</span>${v.title.slice(0, 42)}…</div>`
      ).join('') + (res.length ? '' : '<div class="sdd-item" style="color:var(--muted)">ไม่พบวิดีโอ</div>');

      // AI answer
      document.getElementById('sddhint').innerHTML = '<em>AI</em> ตอบแล้ว';
      let ans = 'ลองค้นหาด้วยคำอื่น หรือถามใน AI Chat ด้านขวา 👉';
      const ql = q.toLowerCase();
      for (const [k, v] of Object.entries(KB)) { if (ql.includes(k)) { ans = v; break; } }
      document.getElementById('sddai').innerHTML = ans;
    }, 400);
  });
}