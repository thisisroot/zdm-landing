(() => {
  'use strict';

  const REPO = 'thisisroot/zdm';
  const API_BASE = `https://api.github.com/repos/${REPO}`;
  const CONTACT_EMAIL = 'iranb@artificiallyintimate.wtf';
  const CACHE_TTL_MS = 10 * 60 * 1000;

  /* ---------------- theme toggle ---------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const storedTheme = localStorage.getItem('zdm-theme');
  if (storedTheme) root.setAttribute('data-theme', storedTheme);

  themeToggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('zdm-theme', next);
  });

  /* ---------------- mobile menu ---------------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  menuToggle?.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  /* ---------------- sticky navbar background ---------------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- reveal on scroll ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = `${(i % 6) * 60}ms`;
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------------- toast ---------------- */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ---------------- copy-to-clipboard ---------------- */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy.replace(/&#10;/g, '\n');
      try {
        await navigator.clipboard.writeText(text);
        toast('Copied to clipboard');
      } catch {
        toast('Could not copy — select manually');
      }
    });
  });

  /* ---------------- animated mock segment bars ---------------- */
  function buildSegbar(el, count, opts = {}) {
    el.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const seg = document.createElement('i');
      const fill = document.createElement('span');
      fill.className = 'fill';
      seg.appendChild(fill);
      el.appendChild(seg);
    }
    return Array.from(el.children).map(seg => seg.querySelector('.fill'));
  }
  function animateSegbars() {
    const barA = document.getElementById('segbarA');
    const barB = document.getElementById('segbarB');
    if (!barA || !barB) return;
    const fillsA = buildSegbar(barA, 8);
    const fillsB = buildSegbar(barB, 6);
    const progressA = fillsA.map(() => Math.random() * 20);
    const progressB = fillsB.map(() => Math.random() * 20);
    function tick() {
      progressA.forEach((p, i) => {
        progressA[i] = Math.min(100, p + Math.random() * 3.2);
        fillsA[i].style.width = progressA[i] + '%';
      });
      progressB.forEach((p, i) => {
        progressB[i] = Math.min(100, p + Math.random() * 2.4);
        fillsB[i].style.width = progressB[i] + '%';
      });
      if (progressA.some(p => p < 100) || progressB.some(p => p < 100)) {
        requestAnimationFrame(() => setTimeout(tick, 220));
      } else {
        setTimeout(() => {
          progressA.forEach((_, i) => progressA[i] = Math.random() * 15);
          progressB.forEach((_, i) => progressB[i] = Math.random() * 15);
          tick();
        }, 1200);
      }
    }
    tick();
  }
  function animateMockSpeed() {
    const speedEl = document.getElementById('mockSpeed');
    if (!speedEl) return;
    setInterval(() => {
      const base = 120 + Math.random() * 40;
      speedEl.textContent = base.toFixed(1);
    }, 1400);
  }
  animateSegbars();
  animateMockSpeed();

  /* ---------------- OS / arch detection ---------------- */
  function detectPlatform() {
    const uaData = navigator.userAgentData;
    const platform = (uaData?.platform || navigator.platform || navigator.userAgent || '').toLowerCase();
    const ua = navigator.userAgent.toLowerCase();
    if (platform.includes('win') || ua.includes('windows')) return 'windows';
    if (platform.includes('mac') || ua.includes('mac os') || ua.includes('macintosh')) return 'mac';
    if (platform.includes('linux') || ua.includes('linux')) return 'linux';
    return 'unknown';
  }
  function detectMacArch() {
    // Best-effort: Apple Silicon Macs report as "MacIntel" too, so this is a heuristic,
    // not a guarantee — the download cards always expose both options either way.
    if (navigator.userAgentData?.platform === 'macOS' && navigator.userAgentData?.architecture) {
      return navigator.userAgentData.architecture.includes('arm') ? 'arm' : 'intel';
    }
    const ua = navigator.userAgent;
    const isAppleSilicon = ua.includes('Mac') && navigator.maxTouchPoints > 1;
    return isAppleSilicon ? 'arm' : 'unknown';
  }

  const platform = detectPlatform();

  /* ---------------- release fetching, with graceful fallback ---------------- */
  function readCache() {
    try {
      const raw = sessionStorage.getItem('zdm-release-cache');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
      return parsed.data;
    } catch { return null; }
  }
  function writeCache(data) {
    try { sessionStorage.setItem('zdm-release-cache', JSON.stringify({ ts: Date.now(), data })); } catch {}
  }

  async function fetchLatestRelease() {
    const cached = readCache();
    if (cached) return cached;

    let release = null;
    let isFallbackToNonStable = false;

    try {
      const res = await fetch(`${API_BASE}/releases/latest`);
      if (res.ok) {
        release = await res.json();
      } else if (res.status === 404) {
        // No stable ("latest") release exists yet — fall back to the most recent
        // release/tag overall, prerelease or not.
        const listRes = await fetch(`${API_BASE}/releases`);
        if (listRes.ok) {
          const list = await listRes.json();
          if (Array.isArray(list) && list.length) {
            release = list[0];
            isFallbackToNonStable = true;
          }
        }
      }
    } catch (err) {
      console.warn('ZDM: release fetch failed', err);
    }

    const result = release ? { release, isFallbackToNonStable } : null;
    if (result) writeCache(result);
    return result;
  }

  async function fetchRepoInfo() {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) return res.json();
    } catch (err) {
      console.warn('ZDM: repo info fetch failed', err);
    }
    return null;
  }

  function formatBytes(bytes) {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0, n = bytes;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
  }

  function pickAsset(assets, matchers) {
    for (const re of matchers) {
      const found = assets.find(a => re.test(a.name));
      if (found) return found;
    }
    return null;
  }

  function wireDownloadButton(selector, asset) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (asset) {
      el.href = asset.browser_download_url;
      el.target = '_self';
      el.removeAttribute('rel');
      const sizeEl = el.querySelector('.dl-size');
      if (sizeEl) sizeEl.textContent = formatBytes(asset.size);
    } else {
      el.classList.add('disabled');
      const sizeEl = el.querySelector('.dl-size');
      if (sizeEl) sizeEl.textContent = 'not in this release';
    }
  }

  function countUp(el, target, opts = {}) {
    const duration = opts.duration || 900;
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  async function initReleases() {
    const versionBadge = document.getElementById('versionBadge');
    const releaseInfo = document.getElementById('releaseInfo');
    const heroDownloadLabel = document.getElementById('heroDownloadLabel');
    const heroDownloadBtn = document.getElementById('heroDownloadBtn');
    const navDownloadBtn = document.getElementById('navDownloadBtn');

    const data = await fetchLatestRelease();

    if (!data) {
      versionBadge.textContent = 'Could not reach GitHub — see releases page';
      releaseInfo.textContent = 'Could not load release data from GitHub right now — browse releases directly.';
      return;
    }

    const { release, isFallbackToNonStable } = data;
    const assets = release.assets || [];
    const tag = release.tag_name || release.name || 'latest';
    const publishedDate = release.published_at
      ? new Date(release.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
      : '';

    versionBadge.textContent = `${tag}${isFallbackToNonStable || release.prerelease ? ' · pre-release' : ' · latest'}`;
    releaseInfo.textContent = `Showing ${release.prerelease ? 'the most recent pre-release' : 'the latest stable release'}: ${tag}${publishedDate ? ' · published ' + publishedDate : ''}.`;

    const exeAsset = pickAsset(assets, [/setup.*\.exe$/i, /\.exe$/i]);
    const msiAsset = pickAsset(assets, [/\.msi$/i]);
    const dmgArm = pickAsset(assets, [/(aarch64|arm64).*\.dmg$/i]);
    const dmgIntel = pickAsset(assets, [/(x64|x86_64|amd64|intel).*\.dmg$/i]);
    const dmgAny = pickAsset(assets, [/\.dmg$/i]);
    const debAsset = pickAsset(assets, [/\.deb$/i]);
    const rpmAsset = pickAsset(assets, [/\.rpm$/i]);
    const appImageAsset = pickAsset(assets, [/\.appimage$/i]);

    wireDownloadButton('[data-asset="exe"]', exeAsset);
    wireDownloadButton('[data-asset="msi"]', msiAsset);
    wireDownloadButton('[data-asset="dmg-arm"]', dmgArm || (!dmgIntel ? dmgAny : null));
    wireDownloadButton('[data-asset="dmg-intel"]', dmgIntel || (!dmgArm ? dmgAny : null));
    wireDownloadButton('[data-asset="deb"]', debAsset);
    wireDownloadButton('[data-asset="rpm"]', rpmAsset);
    wireDownloadButton('[data-asset="appimage"]', appImageAsset);

    // Hide a macOS button entirely if we truly only have one universal/only-arch build.
    if (!dmgArm && !dmgIntel && dmgAny) {
      document.querySelector('[data-asset="dmg-intel"]')?.closest('.download-actions')
        ?.querySelector('[data-asset="dmg-intel"]')?.remove();
      const soleBtn = document.querySelector('[data-asset="dmg-arm"]');
      if (soleBtn) soleBtn.textContent = '.dmg — Universal';
    }

    // Wire the primary hero CTA to the best match for the visitor's OS.
    let heroAsset = null, heroLabel = 'View all downloads';
    if (platform === 'windows') {
      heroAsset = exeAsset || msiAsset;
      heroLabel = heroAsset ? `Download for Windows (${tag})` : 'Windows build unavailable';
    } else if (platform === 'mac') {
      const arch = detectMacArch();
      heroAsset = (arch === 'intel' ? dmgIntel : dmgArm) || dmgAny;
      heroLabel = heroAsset ? `Download for macOS (${tag})` : 'macOS build unavailable';
    } else if (platform === 'linux') {
      heroAsset = appImageAsset || debAsset || rpmAsset;
      heroLabel = heroAsset ? `Download for Linux (${tag})` : 'Linux build unavailable';
    } else {
      heroLabel = 'Choose your platform below';
    }

    heroDownloadLabel.textContent = heroLabel;
    if (heroAsset) {
      heroDownloadBtn.href = heroAsset.browser_download_url;
      navDownloadBtn.href = heroAsset.browser_download_url;
      navDownloadBtn.textContent = 'Download';
    } else {
      heroDownloadBtn.href = '#download';
    }
  }

  async function initStars() {
    const starCountEls = [document.getElementById('starCount'), document.getElementById('starStat')];
    const info = await fetchRepoInfo();
    if (!info) {
      starCountEls.forEach(el => { if (el) el.textContent = '★'; });
      return;
    }
    const count = info.stargazers_count || 0;
    starCountEls.forEach(el => {
      if (!el) return;
      if (el.id === 'starStat') countUp(el, count);
      else el.textContent = count.toLocaleString();
    });
  }

  initReleases();
  initStars();

  /* ---------------- contact form -> mailto ---------------- */
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();

    if (!name || !email || !message) {
      toast('Please fill in every field');
      return;
    }

    const subject = encodeURIComponent(`ZDM contact form — message from ${name}`);
    const body = encodeURIComponent(`${message}\n\n—\n${name}\n${email}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    toast('Opening your email client…');
  });
})();
