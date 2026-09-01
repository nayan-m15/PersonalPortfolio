// ─── Theme ────────────────────────────────────────────
const root = document.documentElement;
const themeBtn = document.getElementById('theme-btn');
root.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');
themeBtn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});


// ─── Mobile menu ──────────────────────────────────────
const menuBtn = document.getElementById('menu-btn');
const mobMenu = document.getElementById('mob-menu');
menuBtn.addEventListener('click', () => {
  const open = mobMenu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
document.querySelectorAll('.mob-close').forEach(a => {
  a.addEventListener('click', () => {
    mobMenu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});


// ─── Smooth scrolling with highlight effect ───────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Highlight using theme-aware accent colour
    const accentBg = getComputedStyle(root).getPropertyValue('--accent-bg').trim();
    target.style.transition = 'background-color 0.3s ease';
    target.style.backgroundColor = accentBg || 'rgba(96, 165, 250, 0.08)';
    setTimeout(() => { target.style.backgroundColor = ''; }, 1000);
  });
});


// ─── Scroll: progress, nav, back-to-top ───────────────
const prog = document.getElementById('progress');
const nav  = document.getElementById('nav');
const btt  = document.getElementById('btt');
window.addEventListener('scroll', () => {
  const s = window.scrollY;
  const t = document.body.scrollHeight - window.innerHeight;
  if (prog) prog.style.width = (s / t * 100) + '%';
  if (nav)  nav.classList.toggle('scrolled', s > 10);
  if (btt)  btt.classList.toggle('vis', s > 400);
}, { passive: true });
if (btt) {
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}


// ─── Avatar expand ────────────────────────────────────
const avatar  = document.querySelector('.nav-avatar');
const overlay = document.getElementById('avatar-overlay');

if (avatar && overlay) {
  avatar.addEventListener('click', () => overlay.classList.add('open'));
  overlay.addEventListener('click', () => overlay.classList.remove('open'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') overlay.classList.remove('open');
  });
}


// ─── Active nav link ──────────────────────────────────
const secs = document.querySelectorAll('section[id]');
const nls  = document.querySelectorAll('.nav-links a');
if (secs.length && nls.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        nls.forEach(l => {
          const href = l.getAttribute('href');
          l.classList.toggle('active', href === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  secs.forEach(s => observer.observe(s));
}


// ─── Reveal animations ───────────────────────────────
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      ro.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));


// ─── GitHub stats (with localStorage cache) ───────────
(async () => {
  const u = 'nayan-m15';
  const CACHE_KEY = 'gh_stats_' + u;
  const CACHE_TTL = 60 * 60 * 1000; // 1 hour

  const requiredIds = ['st-repos', 'st-stars', 'st-commits', 'cg'];
  if (requiredIds.some(id => !document.getElementById(id))) return;

  // ── Try to use cached data ──────────────────────────
  let cached = null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_TTL) {
        cached = parsed.data;
      }
    }
  } catch (_) { /* cache miss — fetch fresh */ }

  let publicRepos, stars, commitsByDay, totalCommits;

  if (cached) {
    ({ publicRepos, stars, commitsByDay, totalCommits } = cached);
  } else {
    try {
      // ── Profile + repos ──────────────────────────────
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${u}`),
        fetch(`https://api.github.com/users/${u}/repos?per_page=100&type=owner`)
      ]);

      if (userRes.ok) {
        const user = await userRes.json();
        publicRepos = user.public_repos ?? null;
      }

      let repos = [];
      if (reposRes.ok) {
        repos = await reposRes.json();
        stars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
      }

      // ── Fetch commits from each repo ────────────────
      const since = new Date();
      since.setFullYear(since.getFullYear() - 1);
      const sinceISO = since.toISOString();

      commitsByDay = {};
      totalCommits = 0;

      const activeRepos = repos
        .filter(r => !r.fork && r.name)
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, 10);

      await Promise.allSettled(activeRepos.map(async (repo) => {
        try {
          const res = await fetch(
            `https://api.github.com/repos/${u}/${repo.name}/commits?author=${u}&per_page=100&since=${sinceISO}`
          );
          if (!res.ok) return;

          const commits = await res.json();
          if (!Array.isArray(commits)) return;

          commits.forEach(c => {
            const date = c.commit?.author?.date?.slice(0, 10);
            if (date) {
              commitsByDay[date] = (commitsByDay[date] || 0) + 1;
              totalCommits++;
            }
          });
        } catch (_) { /* skip failed repo */ }
      }));

      // ── Save to cache ──────────────────────────────
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: { publicRepos, stars, commitsByDay, totalCommits }
        }));
      } catch (_) { /* storage full — continue without caching */ }

    } catch (_) {
      // Network error — show fallback
      return;
    }
  }

  // ── Populate stat cards ──────────────────────────────
  const reposEl   = document.getElementById('st-repos');
  const starsEl   = document.getElementById('st-stars');
  const commitsEl = document.getElementById('st-commits');

  if (reposEl)   reposEl.textContent   = publicRepos ?? '—';
  if (starsEl)   starsEl.textContent   = stars ?? '—';
  if (commitsEl) commitsEl.textContent = totalCommits > 0 ? `${totalCommits}+` : '—';

  // ── Build contribution grid ─────────────────────────
  const g = document.getElementById('cg');
  if (!g) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (52 * 7) - startDate.getDay());

  const maxCommits = Math.max(1, ...Object.values(commitsByDay || {}));
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 53 * 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const cell = document.createElement('div');
    cell.classList.add('cc');

    if (d > today) {
      cell.setAttribute('aria-hidden', 'true');
      fragment.appendChild(cell);
      continue;
    }

    const key   = d.toISOString().slice(0, 10);
    const count = (commitsByDay && commitsByDay[key]) || 0;

    let level = 0;
    if (count > 0) {
      const ratio = count / maxCommits;
      if      (ratio <= 0.25) level = 1;
      else if (ratio <= 0.5)  level = 2;
      else if (ratio <= 0.75) level = 3;
      else                    level = 4;
    }

    if (level > 0) cell.classList.add('l' + level);
    cell.title = `${key}: ${count} commit${count !== 1 ? 's' : ''}`;
    cell.setAttribute('aria-hidden', 'true');
    fragment.appendChild(cell);
  }

  g.appendChild(fragment);
})();


// ─── Contact form ─────────────────────────────────────
const form       = document.getElementById('cform');
const succ       = document.getElementById('fsuccess');
const formStatus = document.getElementById('fform-status');

function val(id, errId, fn) {
  const el = document.getElementById(id);
  const er = document.getElementById(errId);
  if (!el || !er) return true;
  const ok = fn(el.value.trim());
  el.classList.toggle('err', !ok);
  er.classList.toggle('show', !ok);
  el.setAttribute('aria-invalid', String(!ok));
  return ok;
}

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const ok1 = val('fn', 'en', v => v.length >= 2);
    const ok2 = val('fe2', 'ee', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    const ok3 = val('fm', 'em', v => v.length >= 10);
    if (!ok1 || !ok2 || !ok3) return;

    const submitBtn = document.getElementById('fsubmit');
    const btnMarkup = submitBtn ? submitBtn.innerHTML : '';

    if (formStatus) {
      formStatus.textContent = '';
      formStatus.classList.remove('show', 'is-error');
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        let message = 'Something went wrong. Please try again.';
        try {
          const result = await response.json();
          if (Array.isArray(result.errors) && result.errors.length > 0) {
            message = result.errors.map(err => err.message).join(' ');
          }
        } catch (_) { /* use default message */ }
        throw new Error(message);
      }

      form.reset();
      form.style.display = 'none';
      if (succ) succ.classList.add('show');
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = error.message || 'Unable to send your message. Please email me directly.';
        formStatus.classList.add('show', 'is-error');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnMarkup;
      }
    }
  });
}

// Clear validation errors on input
['fn', 'fe2', 'fm'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', function () {
      this.classList.remove('err');
      this.setAttribute('aria-invalid', 'false');
    });
  }
});


// ─── Footer ───────────────────────────────────────────
const yearEl = document.getElementById('yr');
if (yearEl) yearEl.textContent = new Date().getFullYear();
const updateEl = document.getElementById('upd');
if (updateEl) updateEl.textContent = 'Last updated: ' + new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long' });
