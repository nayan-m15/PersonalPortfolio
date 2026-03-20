// ─── Theme ────────────────────────────────────────────
const root = document.documentElement;
const themeBtn = document.getElementById('theme-btn');
root.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');
themeBtn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/*
// ─── Show resume button after scroll ──────────────────
const navResume = document.getElementById('nav-resume');
window.addEventListener('scroll', () => {
  if(window.scrollY > 200) navResume.style.display = 'inline-flex';
}, {passive:true});
*/
const navResume = document.getElementById('nav-resume');
navResume.style.display = 'inline-flex';


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
    menuBtn.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  });
});



// ─── Smooth scrolling with highlight effect ───────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    
    if (targetId !== '#') {
      e.preventDefault();
      const target = document.querySelector(targetId);
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Add highlight effect
        target.style.transition = 'background-color 0.3s ease';
        target.style.backgroundColor = 'rgba(100, 108, 255, 0.1)';
        setTimeout(() => {
          target.style.backgroundColor = '';
        }, 1000);
      }
    }
  });
});

// ─── Interactive resume download ──────────────────────
const resumeBtn = document.getElementById('resumeBtn');
if (resumeBtn) {
  resumeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Show confirmation dialog
    const userConfirmed = confirm('Would you like to download the resume?');
    
    if (userConfirmed) {
      // Add loading state
      const originalText = this.innerHTML;
      this.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Downloading...';
      this.style.opacity = '0.7';
      
      // Replace with your actual resume file path
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = '/resume.pdf'; // Update with actual resume path
        link.download = 'Nayan_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Reset button
        this.innerHTML = originalText;
        this.style.opacity = '';
        
        // Show success message
        showToast('Resume download started!', 'success');
      }, 500);
    }
  });
}

// ─── Social links with hover effects and tracking ─────
const socialLinks = document.querySelectorAll('.hero-social');
socialLinks.forEach(link => {
  // Add click tracking
  link.addEventListener('click', function(e) {
    const platform = this.getAttribute('aria-label');
    console.log(`Opening ${platform} profile`); // Replace with analytics tracking
    
    // Show toast notification
    showToast(`Opening ${platform} profile...`, 'info');
  });
  
  // Add ripple effect on click
  link.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    ripple.style.left = `${e.clientX - this.offsetLeft}px`;
    ripple.style.top = `${e.clientY - this.offsetTop}px`;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// ─── Toast notification system ────────────────────────
function showToast(message, type = 'info') {
  // Remove existing toast
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// ─── Add animations styles ────────────────────────────
const animationStyles = document.createElement('style');
animationStyles.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .ripple-effect {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.4);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  }
  
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .btn, .hero-social {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
  }
  
  .btn:active, .hero-social:active {
    transform: scale(0.96);
  }
`;
document.head.appendChild(animationStyles);

// ─── Scroll: progress, nav, back-to-top ───────────────
const prog = document.getElementById('progress');
const nav  = document.getElementById('nav');
const btt  = document.getElementById('btt');
window.addEventListener('scroll', () => {
  const s = window.scrollY;
  const t = document.body.scrollHeight - window.innerHeight;
  if (prog) prog.style.width = (s/t*100) + '%';
  if (nav) nav.classList.toggle('scrolled', s > 10);
  if (btt) btt.classList.toggle('vis', s > 400);
}, {passive:true});
if (btt) {
  btt.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
}

// ─── Avatar expand ────────────────────────────────────
const avatar  = document.querySelector('.nav-avatar');
const overlay = document.getElementById('avatar-overlay');

avatar.addEventListener('click', () => overlay.classList.add('open'));
overlay.addEventListener('click', () => overlay.classList.remove('open'));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') overlay.classList.remove('open');
});

// ─── Active nav link ──────────────────────────────────
const secs = document.querySelectorAll('section[id]');
const nls  = document.querySelectorAll('.nav-links a');
if (secs.length && nls.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        nls.forEach(l => {
          const href = l.getAttribute('href');
          if (href === '#' + e.target.id) {
            l.classList.add('active');
          } else {
            l.classList.remove('active');
          }
        });
      }
    });
  }, {rootMargin:'-40% 0px -55% 0px'});
  
  secs.forEach(s => observer.observe(s));
}

// ─── Reveal ───────────────────────────────────────────
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => { 
    if(e.isIntersecting) { 
      e.target.classList.add('in'); 
      ro.unobserve(e.target); 
    }
  });
}, {threshold:.1, rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));


// ─── GitHub stats ─────────────────────────────────────

(async () => {
  const u = 'nayan-m15';

  try {
    // ── Profile + repos ──────────────────────────────
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${u}`),
      fetch(`https://api.github.com/users/${u}/repos?per_page=100&type=owner`)
    ]);

    if (userRes.ok) {
      const user = await userRes.json();
      const reposEl = document.getElementById('st-repos');
      if (reposEl) reposEl.textContent = user.public_repos ?? '—';
    }

    let repos = [];
    if (reposRes.ok) {
      repos = await reposRes.json();
      const stars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
      const starsEl = document.getElementById('st-stars');
      if (starsEl) starsEl.textContent = stars;
    }

    // ── Fetch commits from each repo directly ────────
    // Only look back 1 year
    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);
    const sinceISO = since.toISOString();

    const commitsByDay = {};
    let totalCommits = 0;

    // Fetch in parallel, max 10 repos to avoid rate limit
    const activeRepos = repos
      .filter(r => !r.fork)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 10);

    await Promise.all(activeRepos.map(async (repo) => {
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
      } catch (_) {}
    }));

    const commitsEl = document.getElementById('st-commits');
    if (commitsEl) commitsEl.textContent = totalCommits > 0 ? `${totalCommits}+` : '—';

    // ── Build contribution grid ──────────────────────
    const g = document.getElementById('cg');
    if (!g) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (52 * 7) - startDate.getDay());

    const maxCommits = Math.max(1, ...Object.values(commitsByDay));

    let html = '';
    for (let i = 0; i < 53 * 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      if (d > today) {
        html += `<div class="cc" aria-hidden="true"></div>`;
        continue;
      }

      const key = d.toISOString().slice(0, 10);
      const count = commitsByDay[key] || 0;

      let level = 0;
      if (count > 0) {
        const ratio = count / maxCommits;
        if      (ratio <= 0.25) level = 1;
        else if (ratio <= 0.5)  level = 2;
        else if (ratio <= 0.75) level = 3;
        else                    level = 4;
      }

      html += `<div class="cc${level > 0 ? ' l' + level : ''}" title="${key}: ${count} commit${count !== 1 ? 's' : ''}" aria-hidden="true"></div>`;
    }
    g.innerHTML = html;

  } catch (_) {}
})();

// ─── Contact form ─────────────────────────────────────
const form = document.getElementById('cform');
const succ = document.getElementById('fsuccess');
function val(id, errId, fn){
  const el = document.getElementById(id), er = document.getElementById(errId);
  if (!el || !er) return true;
  const ok = fn(el.value.trim());
  el.classList.toggle('err', !ok); 
  er.classList.toggle('show', !ok);
  return ok;
}
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const ok1 = val('fn','en', v => v.length >= 2);
    const ok2 = val('fe2','ee', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    const ok3 = val('fm','em', v => v.length >= 10);
    if(!ok1 || !ok2 || !ok3) return;
    const btn = document.getElementById('fsubmit');
    if (btn) {
      btn.disabled = true; 
      btn.textContent = 'Sending…';
    }
    // TODO: Replace with real submission, e.g.:
    // await fetch('https://formspree.io/f/YOUR_ID', {method:'POST', body: new FormData(form)});
    await new Promise(r => setTimeout(r, 900));
    form.style.display = 'none';
    if (succ) succ.classList.add('show');
  });
}
['fn','fe2','fm'].forEach(id => {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('input', function(){ this.classList.remove('err'); });
  }
});

// ─── Footer ───────────────────────────────────────────
const yearEl = document.getElementById('yr');
if (yearEl) yearEl.textContent = new Date().getFullYear();
const updateEl = document.getElementById('upd');
if (updateEl) updateEl.textContent = 'Last updated: ' + new Date().toLocaleDateString('en-ZA',{year:'numeric',month:'long'});

// ─── Initialize additional interactive features ───────
console.log('All interactive features initialized successfully');