
  // ─── Theme ────────────────────────────────────────────
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-btn');
  root.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // ─── Show resume button after scroll ──────────────────
  const navResume = document.getElementById('nav-resume');
  window.addEventListener('scroll', () => {
    if(window.scrollY > 200) navResume.style.display = 'inline-flex';
  }, {passive:true});

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

  // ─── Scroll: progress, nav, back-to-top ───────────────
  const prog = document.getElementById('progress');
  const nav  = document.getElementById('nav');
  const btt  = document.getElementById('btt');
  window.addEventListener('scroll', () => {
    const s = window.scrollY;
    const t = document.body.scrollHeight - window.innerHeight;
    prog.style.width = (s/t*100) + '%';
    nav.classList.toggle('scrolled', s > 10);
    btt.classList.toggle('vis', s > 400);
  }, {passive:true});
  btt.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

  // ─── Active nav link ──────────────────────────────────
  const secs = document.querySelectorAll('section[id]');
  const nls  = document.querySelectorAll('.nav-links a');
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting) nls.forEach(l => l.classList.toggle('active', l.getAttribute('href')==='#'+e.target.id));
    });
  }, {rootMargin:'-40% 0px -55% 0px'}).observe && secs.forEach(s => {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting) nls.forEach(l => l.classList.toggle('active', l.getAttribute('href')==='#'+e.target.id));
      });
    }, {rootMargin:'-40% 0px -55% 0px'}).observe(s);
  });

  // ─── Reveal ───────────────────────────────────────────
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); ro.unobserve(e.target); }});
  }, {threshold:.1, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

  // ─── GitHub stats ─────────────────────────────────────
  (async () => {
    try {
      const u = 'nayan-m15';
      const r = await fetch(`https://api.github.com/users/${u}`);
      if(!r.ok) return;
      const d = await r.json();
      document.getElementById('st-repos').textContent = d.public_repos ?? '—';
      // Stars: sum across repos (basic version)
      const rr = await fetch(`https://api.github.com/users/${u}/repos?per_page=100`);
      if(rr.ok){
        const repos = await rr.json();
        const stars = repos.reduce((acc, repo) => acc + (repo.stargazers_count||0), 0);
        document.getElementById('st-stars').textContent = stars;
        document.getElementById('st-commits').textContent = repos.length > 0 ? repos.length * 12 + '+' : '—';
      }
    } catch(_) { /* silent fail */ }
  })();

  // ─── Contribution graph (mock) ────────────────────────
  (() => {
    const g = document.getElementById('cg');
    const lvls = [0,0,1,0,2,0,0,1,3,2,0,0,1,2,4,3,0,1,2,0,3,1,2,4,3,0,1,2,3,4,1,0,2,3,4,1,2,0,3,4,1,2,0,3,4,1,2,0,3,4,2,1,0,4,3,1,2,0,4,3,1,2,0,3,4,1,2,0,3,4,1,2,0,3,4,1,2,0,3,4,1,2,3,0,4,1,2,3,0,4,1,2,3,0,4,1,2,0,3,4];
    let h = '';
    for(let i=0; i<53*7; i++){
      const l = lvls[i % lvls.length];
      h += `<div class="cc${l>0?' l'+l:''}" aria-hidden="true"></div>`;
    }
    g.innerHTML = h;
  })();

  // ─── Contact form ─────────────────────────────────────
  const form = document.getElementById('cform');
  const succ = document.getElementById('fsuccess');
  function val(id, errId, fn){
    const el = document.getElementById(id), er = document.getElementById(errId);
    const ok = fn(el.value.trim());
    el.classList.toggle('err', !ok); er.classList.toggle('show', !ok);
    return ok;
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const ok1 = val('fn','en', v => v.length >= 2);
    const ok2 = val('fe2','ee', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    const ok3 = val('fm','em', v => v.length >= 10);
    if(!ok1 || !ok2 || !ok3) return;
    const btn = document.getElementById('fsubmit');
    btn.disabled = true; btn.textContent = 'Sending…';
    // TODO: Replace with real submission, e.g.:
    // await fetch('https://formspree.io/f/YOUR_ID', {method:'POST', body: new FormData(form)});
    await new Promise(r => setTimeout(r, 900));
    form.style.display = 'none';
    succ.classList.add('show');
  });
  ['fn','fe2','fm'].forEach(id => document.getElementById(id)?.addEventListener('input', function(){ this.classList.remove('err'); }));

  // ─── Footer ───────────────────────────────────────────
  document.getElementById('yr').textContent = new Date().getFullYear();
  document.getElementById('upd').textContent = 'Last updated: ' + new Date().toLocaleDateString('en-ZA',{year:'numeric',month:'long'});
