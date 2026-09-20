/* ==========================================================================
   RUANG HORMAT — script.js
   Isi: Loader · Navbar · Menu mobile · Scroll reveal (IntersectionObserver) ·
   Word-mask split · Stagger delay · Nav active state · Parallax ringan ·
   Flip cards · Chips persetujuan · Refleksi · Drag-scroll prinsip · Cursor
   ========================================================================== */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. LOADING SCREEN ---------- */
  const loader = document.getElementById('loader');
  const bootTime = performance.now();
  let loaderDone = false;

  document.body.classList.add('no-scroll');

  function hideLoader() {
    if (loaderDone) return;
    loaderDone = true;
    const minShow = prefersReduced ? 150 : 900;
    const remaining = Math.max(0, minShow - (performance.now() - bootTime));
    setTimeout(() => {
      loader.classList.add('done');
      document.body.classList.add('is-loaded');
      document.body.classList.remove('no-scroll');
      setTimeout(() => loader.remove(), 800);
    }, remaining);
  }

  window.addEventListener('load', hideLoader, { once: true });
  setTimeout(hideLoader, 2600); // pengaman jika load lambat

  /* ---------- 2. NAVBAR + PROGRESS ---------- */
  const header = document.getElementById('site-header');
  const progress = document.getElementById('progress');
  let ticking = false;

  function onScrollUI() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 12);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';

    // Parallax ringan pada foto hero (desktop, non-reduced)
    if (heroFrame && finePointer && !prefersReduced) {
      const rect = heroFrame.getBoundingClientRect();
      if (rect.bottom > 0) {
        heroFrame.style.transform = 'translateY(' + Math.max(-40, y * -0.05) + 'px)';
      }
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScrollUI); ticking = true; }
  }, { passive: true });

  /* ---------- 3. MENU MOBILE ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const menuOverlay = document.getElementById('menuOverlay');

  function setMenu(open) {
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    menuOverlay.classList.toggle('open', open);
    document.body.classList.toggle('no-scroll', open);
    if (open) {
      const first = menuOverlay.querySelector('.menu-link');
      if (first) setTimeout(() => first.focus(), 350);
    } else {
      menuBtn.focus();
    }
  }

  menuBtn.addEventListener('click', () => setMenu(!menuOverlay.classList.contains('open')));
  menuOverlay.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('open')) setMenu(false);
  });

  /* ---------- 4. STAGGER DELAY ---------- */
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    Array.from(parent.children).forEach((child, i) => {
      child.style.setProperty('--d', (i * 0.08).toFixed(2) + 's');
    });
  });

  /* ---------- 5. WORD-MASK SPLIT (untuk quote besar) ---------- */
  function splitWords(el) {
    let idx = 0;
    const walk = (node) => {
      const out = [];
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          child.textContent.split(/\s+/).filter(Boolean).forEach(word => {
            const mask = document.createElement('span');
            mask.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = word;
            inner.style.setProperty('--i', idx++);
            mask.appendChild(inner);
            out.push(mask);
            out.push(document.createTextNode(' '));
          });
        } else {
          out.push(child);
        }
      });
      node.textContent = '';
      out.forEach(n => node.appendChild(n));
    };
    walk(el);
    el.classList.add('split');
  }

  if (!prefersReduced) {
    document.querySelectorAll('[data-split]').forEach(splitWords);
  }

  /* ---------- 6. SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll('.rv, .split');

  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------- 7. NAV ACTIVE STATE ---------- */
  const navMap = {};
  document.querySelectorAll('[data-nav]').forEach(a => { navMap[a.dataset.nav] = a; });

  const sectionIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = navMap[entry.target.id];
      if (link && entry.isIntersecting) {
        Object.values(navMap).forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  ['beranda', 'mengapa', 'cara', 'refleksi'].forEach(id => {
    const sec = document.getElementById(id);
    if (sec) sectionIO.observe(sec);
  });

  /* ---------- 8. FLIP CARDS (kata-kata) ---------- */
  document.querySelectorAll('.flip').forEach(card => {
    card.addEventListener('click', () => {
      const flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(flipped));
    });
  });

  /* ---------- 9. CHIPS PERSETUJUAN ---------- */
  const cChips = document.querySelectorAll('.c-chip');
  const cNotes = document.querySelectorAll('.c-note');

  cChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.note;
      cChips.forEach(c => {
        const on = c === chip;
        c.classList.toggle('active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      cNotes.forEach(n => n.classList.toggle('show', n.dataset.note === key));
    });
  });

  /* ---------- 10. REFLEKSI ---------- */
  document.querySelectorAll('.q-card').forEach(card => {
    const btn = card.querySelector('.q-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      card.classList.add('reflected');
    });
  });

  const reflectAll = document.getElementById('reflectAll');
  const reflectMsg = document.getElementById('reflectMsg');

  if (reflectAll) {
    reflectAll.addEventListener('click', () => {
      document.querySelectorAll('.q-card').forEach(card => card.classList.add('reflected'));
      reflectMsg.classList.add('show');
      reflectAll.disabled = true;
      reflectAll.textContent = 'Terima kasih sudah berhenti sejenak.';
    });
  }

  /* ---------- 11. DRAG-SCROLL PRINSIP (mouse desktop) ---------- */
  const track = document.querySelector('.p-track');
  const heroFrame = document.querySelector('.hero-frame');

  if (track && finePointer) {
    let down = false, startX = 0, startLeft = 0;
    track.addEventListener('mousedown', e => {
      down = true;
      startX = e.pageX;
      startLeft = track.scrollLeft;
      track.classList.add('dragging');
    });
    window.addEventListener('mousemove', e => {
      if (!down) return;
      track.scrollLeft = startLeft - (e.pageX - startX);
    });
    window.addEventListener('mouseup', () => {
      down = false;
      track.classList.remove('dragging');
    });
  }

  /* ---------- 12. CUSTOM CURSOR (desktop saja) ---------- */
  if (finePointer && !prefersReduced) {
    document.body.classList.add('has-cursor');
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    let mx = -100, my = -100, rx = -100, ry = -100;

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();

    document.addEventListener('mouseover', e => {
      const hot = e.target.closest('a, button, .flip, .p-card, .m-card');
      ring.classList.toggle('big', !!hot);
    });
  }

  /* ---------- 13. Init tampilan awal ---------- */
  onScrollUI();
})();
