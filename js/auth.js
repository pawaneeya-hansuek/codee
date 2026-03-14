/* ══════════════════════════════════════
   auth.js — Login, Register, Logout
   Codee App
══════════════════════════════════════ */

import { ls, showToast } from './utils.js';
import { loadFeed }      from './feed.js';
import { initAI }        from './ai.js';

// ── Switch between login / register panels ──
export function switchAuth(tab) {
  document.getElementById('loginPanel').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('registerPanel').style.display = tab === 'register' ? 'block' : 'none';
  const c = document.getElementById('authCard');
  c.style.animation = 'none';
  void c.offsetWidth; // reflow
  c.style.animation = 'cardIn .4s cubic-bezier(.34,1.56,.64,1) both';
  clearAuthErr();
}

export function clearAuthErr() {
  ['loginErr', 'regErr'].forEach(id => {
    const e = document.getElementById(id);
    if (e) { e.textContent = ''; e.classList.remove('show'); }
  });
}

function showErr(id, msg) {
  const e = document.getElementById(id);
  if (!e) return;
  e.textContent = msg;
  e.classList.add('show');
}

// ── Toggle password visibility ──
export function togglePwd(id, eye) {
  const inp = document.getElementById(id);
  inp.type   = inp.type === 'password' ? 'text' : 'password';
  eye.textContent = inp.type === 'text' ? '🙈' : '👁';
}

// ── Username availability check ──
export function checkUser(inp) {
  const s = document.getElementById('ustatus');
  if (!s) return;
  const v = inp.value;
  if (!v) { s.textContent = ''; return; }
  const taken = ls.get('codee_users', '[]').some(u => u.username === v);
  if (taken) {
    s.style.color = 'var(--accent3)'; s.textContent = '✕ ชื่อนี้ถูกใช้แล้ว';
  } else if (/^[a-z0-9_]{3,}$/i.test(v)) {
    s.style.color = 'var(--accent)';  s.textContent = '✓ ใช้ได้';
  } else {
    s.style.color = 'var(--muted)';   s.textContent = 'ตัวอักษร/ตัวเลข/_ อย่างน้อย 3 ตัว';
  }
}

// ── Password strength meter ──
export function checkStr(pw) {
  const bar  = document.getElementById('sbar');
  const fill = document.getElementById('sfill');
  const lbl  = document.getElementById('slbl');
  if (!bar) return;
  if (!pw) { bar.style.display = 'none'; lbl.textContent = ''; return; }
  bar.style.display = 'block';
  let s = 0;
  if (pw.length >= 8)            s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^a-zA-Z0-9]/.test(pw))  s++;
  const lvl = [
    ['#ff4f8b', 'อ่อนมาก', '25%'],
    ['#ffb800', 'อ่อน',    '50%'],
    ['#00c8ff', 'ปานกลาง', '75%'],
    ['#00ffc8', 'แข็งแกร่ง','100%'],
  ];
  const [c, t, w] = lvl[Math.max(0, s - 1)];
  fill.style.background = c;
  fill.style.width      = w;
  lbl.style.color       = c;
  lbl.textContent       = '🔐 ' + t;
}

// ── Forgot password ──
export function forgotPwd() {
  const em = document.getElementById('loginEmail').value;
  if (!em) { showErr('loginErr', 'กรุณากรอกอีเมลก่อน'); return; }
  showToast('📧 ส่งลิงก์รีเซ็ตไปยัง ' + em + ' แล้ว');
}

// ── Social login (simulated) ──
export function socialLogin(provider) {
  const n  = provider + ' User';
  const un = provider.toLowerCase() + '_' + Math.floor(Math.random() * 9999);
  loginOK({
    name: n, username: un,
    email:    un + '@' + provider.toLowerCase() + '.com',
    initials: provider.slice(0, 2).toUpperCase(),
    grad:     'linear-gradient(135deg,#00ffc8,#7b5cff)',
  });
}

// ── Login ──
export function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  if (!email || !pass) { showErr('loginErr', 'กรุณากรอกอีเมลและรหัสผ่าน'); return; }

  // Demo account
  if (email === 'demo@codee.app' && pass === 'demo1234') {
    loginOK({ name: 'Demo User', username: 'demo_user', email, initials: 'DU', grad: 'linear-gradient(135deg,#00ffc8,#7b5cff)' });
    return;
  }

  const user = ls.get('codee_users', '[]').find(u => u.email === email && u.password === pass);
  if (!user) {
    showErr('loginErr', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    const p = document.getElementById('loginPass');
    p.classList.add('shake');
    setTimeout(() => p.classList.remove('shake'), 400);
    return;
  }
  loginOK(user);
}

// ── Register ──
export function doRegister() {
  const name  = document.getElementById('regName').value.trim();
  const un    = document.getElementById('regUser').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass  = document.getElementById('regPass').value;

  if (!name || !un || !email || !pass) { showErr('regErr', 'กรุณากรอกข้อมูลให้ครบ'); return; }
  if (!/^[a-z0-9_]{3,}$/i.test(un))   { showErr('regErr', 'Username: ตัวอักษร/ตัวเลข/_ อย่างน้อย 3 ตัว'); return; }
  if (pass.length < 8)                  { showErr('regErr', 'รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร'); return; }
  if (!/\S+@\S+\.\S+/.test(email))     { showErr('regErr', 'รูปแบบอีเมลไม่ถูกต้อง'); return; }

  const users = ls.get('codee_users', '[]');
  if (users.some(u => u.email    === email)) { showErr('regErr', 'อีเมลนี้ถูกใช้แล้ว'); return; }
  if (users.some(u => u.username === un))    { showErr('regErr', 'Username นี้ถูกใช้แล้ว'); return; }

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const grads    = [
    'linear-gradient(135deg,#7b5cff,#ff4f8b)',
    'linear-gradient(135deg,#00ffc8,#0099ff)',
    'linear-gradient(135deg,#ff4f8b,#ffb800)',
    'linear-gradient(135deg,#00b4d8,#7b5cff)',
  ];
  const grad = grads[Math.floor(Math.random() * grads.length)];
  const user = { name, username: un, email, password: pass, initials, grad };
  users.push(user);
  ls.set('codee_users', users);
  loginOK(user);
}

// ── Internal: complete login ──
export function loginOK(user) {
  window.CU = user;
  ls.set('codee_sess', user);

  document.getElementById('authScreen').style.display = 'none';
  const app = document.getElementById('mainApp');
  app.style.display = 'flex';

  document.getElementById('uinit').textContent        = user.initials || user.name.slice(0, 2).toUpperCase();
  document.getElementById('uavbtn').style.background  = user.grad || 'linear-gradient(135deg,var(--accent2),var(--accent))';

  loadFeed();
  initAI();
  showToast('👋 ยินดีต้อนรับ ' + user.name + '!');
}

// ── Logout ──
export function doLogout() {
  window.CU = null;
  ls.rm('codee_sess');
  document.getElementById('mainApp').style.display    = 'none';
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('umenu').classList.remove('open');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPass').value  = '';
  switchAuth('login');
  showToast('👋 ออกจากระบบแล้ว');
}