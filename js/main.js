/* ══════════════════════════════════════
   main.js — App entry point & bootstrap
   Codee App
══════════════════════════════════════ */

import { ls, showToast }            from './utils.js';
import { switchAuth, clearAuthErr, togglePwd, checkUser,
         checkStr, forgotPwd, socialLogin, doLogin,
         doRegister, loginOK, doLogout }  from './auth.js';
import { loadFeed, renderFeed, VIDS,
         setTab, setNav, catFilter, tagSearch, SAVED } from './feed.js';
import { openUpload, closeUpload,
         onDragOver, onDragLeave, onDrop,
         onFileSelect, publishVid }   from './upload.js';
import { initAI, aiKey, sendAI, initSearch } from './ai.js';
import { open as openCom, close as closeCom,
         submit as submitCom }        from './comments.js';
import { open as openShare,
         copyLink, shareTo }          from './share.js';
import { openProfile, close as closeProfile,
         openSaved, openMyVids }      from './profile.js';

// ── Bootstrap ──
function init() {
  const sess = ls.get('codee_sess');
  if (sess && sess.name) loginOK(sess);
  bindGlobalEvents();
}

// ── Global event bindings ──
function bindGlobalEvents() {
  // Close dropdowns when clicking outside
  document.addEventListener('click', e => {
    const uavbtn = document.getElementById('uavbtn');
    if (uavbtn && !uavbtn.contains(e.target))
      document.getElementById('umenu').classList.remove('open');

    const swrap = document.getElementById('swrap');
    if (swrap && !swrap.contains(e.target))
      document.getElementById('sdd').classList.remove('open');
  });

  // Keyboard: close modals with Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      ['uploadM', 'comM', 'shareM'].forEach(id => {
        document.getElementById(id)?.classList.remove('open');
      });
      closeProfile();
    }
  });
}

// ── User menu toggle ──
function toggleUMenu() { document.getElementById('umenu').classList.toggle('open'); }

// ── Scroll feed to top ──
function scrollTop() { document.getElementById('vstack').scrollTo({ top: 0, behavior: 'smooth' }); }

// ── Mobile nav ──
function mobNav(el) {
  document.querySelectorAll('.mobi').forEach(m => m.classList.remove('active'));
  el.classList.add('active');
}

// ── Expose ALL functions to global scope
//    (needed because HTML onclick= uses global context) ──
Object.assign(window, {
  // Auth
  switchAuth, clearAuthErr, togglePwd, checkUser, checkStr,
  forgotPwd, socialLogin, doLogin, doRegister, doLogout,
  // Feed
  setTab, setNav, catFilter, tagSearch, scrollTop,
  // Upload
  openUpload, closeUpload, onDragOver, onDragLeave, onDrop, onFileSelect, publishVid,
  // AI
  aiKey, sendAI,
  // Comments
  closeComments: closeCom, submitCom,
  // Share
  copyLink, shareTo,
  // Profile
  openProfile, closeProfile, openSaved, openMyVids,
  // UI helpers
  toggleUMenu, mobNav,
  // Feed ref for search inline onclick
  _vids: VIDS,
  _feedRender: renderFeed,
});

// ── Start ──
init();