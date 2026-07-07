(() => {
  'use strict';

  const REPO = 'thisisroot/zdm';
  const API_BASE = `https://api.github.com/repos/${REPO}`;
  const CACHE_TTL_MS = 10 * 60 * 1000;

  // Persian is fully translated below but temporarily hidden from users (toggle
  // hidden via CSS too) — flip this back on when it's ready to ship.
  const PERSIAN_ENABLED = false;

  /* ================= i18n ================= */
  const OS_NAMES = {
    windows: { en: 'Windows', fa: 'ویندوز' },
    mac: { en: 'macOS', fa: 'مک‌اواس' },
    linux: { en: 'Linux', fa: 'لینوکس' },
  };

  const FA = {
    'skip': 'رد شدنا',
    'nav.features': 'امکانات',
    'nav.download': 'دانلود',
    'nav.architecture': 'معماری',
    'nav.development': 'توسعه',
    'nav.contact': 'تماس',
    'nav.star': 'استار',
    'hero.eyebrow': 'رایگان و متن‌باز · مجوز MIT',
    'hero.title': 'دانلودهایی که از <span class="grad-text">تمام پهنای باند</span> شما استفاده می‌کنند.',
    'hero.sub': 'ZDM هر فایل را بین چند اتصال هم‌زمان تقسیم می‌کند و همه را با هم دریافت می‌کند، تا سرعت کل به سرعت یک اتصال محدود نشود. یک هسته‌ی بومی به زبان Rust، همراه با پوسته‌ای کوچک و سریع — بدون مرورگر جاسازی‌شده.',
    'hero.ctaSecondary': 'مشاهده کد منبع',
    'hero.ctaFetching': 'در حال آماده‌سازی دانلود…',
    'hero.fetching': 'در حال دریافت آخرین نسخه…',
    'hero.platformWindows': 'ویندوز',
    'hero.platformMac': 'مک‌اواس',
    'hero.platformLinux': 'لینوکس (deb / rpm / AppImage)',
    'hero.mockActive': 'فعال',
    'hero.mockConnections': '۴ اتصال',
    'hero.mockDownloading': 'در حال دانلود',
    'hero.mockCompleted': 'کامل شد',
    'hero.mockCompletedMeta': 'تکمیل‌شده',
    'stats.stars': 'ستاره در گیت‌هاب',
    'stats.license': 'مجوز',
    'stats.core': 'هسته‌ی اصلی',
    'stats.platforms': 'پلتفرم پشتیبانی‌شده',
    'features.eyebrow': 'امکانات',
    'features.title': 'طراحی‌شده برای سرعت واقعی، نه فقط یک نوار پیشرفت.',
    'features.f1.title': 'دانلود قطعه‌بندی‌شده با چند اتصال',
    'features.f1.desc': 'فایل‌ها را به قطعاتی تقسیم می‌کند که به‌طور هم‌زمان توسط چند اتصال دریافت می‌شوند تا بیشترین سرعت ممکن به‌دست آید.',
    'features.f2.title': 'پیشرفت واقعی برای هر اتصال',
    'features.f2.desc': 'رابط کاربری دقیقاً نشان می‌دهد هر اتصال فعال چه کاری انجام می‌دهد، مستقیم از داده‌های خود هسته‌ی دانلود.',
    'features.f3.title': 'ازسرگیری دانلود',
    'features.f3.desc': 'پس از بستن برنامه، قطع اتصال یا توقف دستی، دانلود دقیقاً از همان‌جا که متوقف شده ادامه پیدا می‌کند.',
    'features.f4.title': 'صف‌های دانلود',
    'features.f4.desc': 'دانلودها را در گروه‌هایی با محدودیت هم‌زمانی مخصوص به خود دسته‌بندی کنید و همه را با هم متوقف یا ازسر بگیرید.',
    'features.f5.title': 'دانلود دسته‌ای',
    'features.f5.desc': 'یک الگوی آدرس شماره‌دار را در یک مرحله به یک صف کامل از فایل‌ها تبدیل کنید.',
    'features.f6.title': 'دسته‌بندی خودکار پوشه‌ها',
    'features.f6.desc': 'دانلودهای جدید به‌طور خودکار بر اساس نوع فایل در پوشه‌ی مناسب قرار می‌گیرند.',
    'features.footnote': 'بومی و سبک — هسته‌ای به زبان Rust همراه با پوسته‌ای کوچک و سریع؛ بدون مرورگر جاسازی‌شده.',
    'download.eyebrow': 'دانلود',
    'download.title': 'آخرین نسخه را برای سیستم‌عامل خود دریافت کنید.',
    'download.loading': 'در حال دریافت آخرین نسخه از گیت‌هاب…',
    'download.otherPlatforms': 'سایر پلتفرم‌ها',
    'download.windows.title': 'ویندوز',
    'download.windows.desc': 'نسخه‌ی ۶۴ بیتی، ویندوز ۱۰ به بعد.',
    'download.mac.title': 'مک‌اواس',
    'download.mac.desc': 'یونیورسال — سازگار با Apple Silicon و Intel.',
    'download.linux.title': 'لینوکس',
    'download.linux.desc': 'دبیان/اوبونتو، فدورا/RHEL یا هر توزیعی از طریق AppImage.',
    'download.fmt.dmgArm': '.dmg (اپل سیلیکون)',
    'download.fmt.dmgIntel': '.dmg (اینتل)',
    'download.fmt.dmgUniversal': '.dmg — یونیورسال',
    'download.fmt.deb': '.deb — دبیان / اوبونتو',
    'download.fmt.rpm': '.rpm — فدورا / RHEL',
    'download.fmt.appimage': '.AppImage — هر توزیعی',
    'download.notInRelease': 'در این نسخه موجود نیست',
    'download.callout': 'نسخه‌های فعلی امضا نشده‌اند. در اولین اجرا، Windows SmartScreen و macOS Gatekeeper هشدار نمایش می‌دهند — روی <strong>«اطلاعات بیشتر ← اجرا در هر صورت»</strong> (ویندوز) یا <strong>کلیک راست ← Open</strong> (مک) بزنید.',
    'download.allReleases': 'دنبال نسخه‌ی قدیمی‌تر یا چک‌سام‌ها هستید؟ <a href="https://github.com/thisisroot/zdm/releases" target="_blank" rel="noopener">همه‌ی نسخه‌ها را در گیت‌هاب ببینید ↗</a>',
    'download.recommended': 'پیشنهاد شده برای شما',
    'architecture.eyebrow': 'معماری',
    'architecture.title': 'یک اپلیکیشن Tauri — هسته‌ی Rust، رابط کاربری وب‌ویو بومی.',
    'architecture.sub': 'بک‌اندی به زبان Rust همراه با وب‌ویوی بومی سیستم‌عامل برای رابط کاربری، به‌جای یک مرورگر جاسازی‌شده.',
    'architecture.core.desc': 'موتور دانلود — کاملاً Rust، بدون وابستگی به رابط گرافیکی. یک آدرس را برای پشتیبانی از Range بررسی می‌کند، فایل را به قطعات کوچک تقسیم می‌کند و بین چند کارگر هم‌زمان که از یک صف مشترک کار می‌گیرند توزیع می‌کند. برای ازسرگیری پس از راه‌اندازی مجدد، وضعیت کافی را در فایلی به‌نام <code>&lt;file&gt;.zdm.json</code> ذخیره می‌کند و پیش از اعتماد به پیشرفت قبلی، تغییرنکردنِ فایل مبدا را از طریق ETag/Last-Modified بررسی می‌کند. مجموعه‌تست‌های خودش را دارد که روی یک سرور HTTP محلی واقعی اجرا می‌شود — بدون شبیه‌سازی شبکه.',
    'architecture.tauri.desc': 'بک‌اند Tauri — رویدادهای موتور را به <code>DownloadRecord</code>های سطح برنامه تبدیل می‌کند، زمان‌بند صف را اجرا می‌کند (اینکه کدام دانلود اتصال بگیرد)، تاریخچه، صف‌ها و تنظیمات را در یک پایگاه‌داده‌ی SQLite محلی ذخیره می‌کند و دستورات را در اختیار رابط کاربری قرار می‌دهد.',
    'architecture.ui.desc': 'رابط کاربری با React و TypeScript — توکن‌های طراحی CSS به‌صورت دستی نوشته شده‌اند، بدون هیچ فریم‌ورک کامپوننتی؛ به این ترتیب هر پیکسل با هویت بصری خود برنامه هماهنگ است، نه پیش‌فرض‌های یک دیزاین‌سیستم عمومی.',
    'getstarted.eyebrow': 'توسعه',
    'getstarted.title': 'با چهار دستور، خودتان آن را بسازید.',
    'getstarted.terminal': 'ترمینال',
    'getstarted.copy': 'کپی',
    'getstarted.win.summary': 'پیش‌نیازهای ویندوز',
    'getstarted.win.item1': '<a href="https://rustup.rs" target="_blank" rel="noopener">Rust</a> (تولکیت MSVC — نصب پیش‌فرض rustup)',
    'getstarted.win.item2': '<a href="https://nodejs.org" target="_blank" rel="noopener">Node.js</a> نسخه‌ی ۲۰ به بعد',
    'getstarted.win.item3': '<a href="https://visualstudio.microsoft.com/downloads/" target="_blank" rel="noopener">Visual Studio Build Tools</a> همراه با بار کاری «Desktop development with C++»',
    'getstarted.win.item4': 'WebView2 Runtime (از پیش نصب‌شده در ویندوز ۱۰ و ۱۱)',
    'getstarted.mac.summary': 'پیش‌نیازهای مک',
    'getstarted.mac.item3': 'ابزارهای خط فرمان Xcode (<code>xcode-select --install</code>)',
    'getstarted.linux.summary': 'پیش‌نیازهای لینوکس (دبیان/اوبونتو)',
    'getstarted.buildInstaller': 'ساخت نصب‌کننده',
    'getstarted.runTests': 'اجرای تست‌ها',
    'getstarted.contribNote': 'ایشو و پول‌ریکوئست‌ها با آغوش باز پذیرفته می‌شوند. برای تغییرات غیرجزئی، لطفاً ابتدا <a href="https://github.com/thisisroot/zdm/issues" target="_blank" rel="noopener">یک ایشو باز کنید</a> تا درباره‌ی روش انجام کار گفت‌وگو شود.',
    'support.title': 'اگر ZDM در وقتتان صرفه‌جویی کرده، تشکر کردن رایگان است.',
    'support.desc': 'استار زدن به مخزن کمک می‌کند دیگران این پروژه را پیدا کنند و برای شما فقط یک کلیک هزینه دارد.',
    'support.reportIssue': 'گزارش یک مشکل',
    'support.fork': 'فورک و مشارکت',
    'contact.eyebrow': 'تماس',
    'contact.title': 'سوال، بازخورد یا باگی دارید که هنوز در گیت‌هاب ثبت نشده؟',
    'contact.sub': 'پیام را مستقیم به اینباکس من بفرستید — بدون نیاز به هیچ برنامه‌ی ایمیلی.',
    'contact.name': 'نام',
    'contact.email': 'ایمیل شما',
    'contact.message': 'پیام',
    'contact.directPrefix': 'یا مستقیم ایمیل بزنید:',
    'contact.send': 'ارسال پیام',
    'footer.tagline': 'یک مدیریت‌کننده‌ی دانلود سریع و قطعه‌بندی‌شده برای ویندوز، مک و لینوکس.',
    'footer.github': 'گیت‌هاب',
    'footer.releases': 'نسخه‌ها',
    'footer.issues': 'ایشوها',
    'footer.license': 'مجوز MIT',
    'footer.fine': 'ساخته و نگهداری‌شده توسط سازنده‌ی ZDM. مشارکت و بازخورد شما همیشه خوش‌آمد است.',
    'toast.copied': 'در کلیپ‌بورد کپی شد',
    'toast.copyFailed': 'کپی نشد — به‌صورت دستی انتخاب کنید',
    'toast.fillFields': 'لطفاً همه‌ی فیلدها را پر کنید',
    'toast.sending': 'در حال ارسال…',
    'toast.sent': 'پیام شما ارسال شد — به‌زودی پاسخ می‌دهم.',
    'toast.sendFailed': 'ارسال پیام ناموفق بود — لطفاً مستقیم ایمیل بزنید.',
    'apiError.version': 'اتصال به گیت‌هاب برقرار نشد — صفحه‌ی نسخه‌ها را ببینید',
    'apiError.releaseInfo': 'در حال حاضر امکان دریافت اطلاعات نسخه از گیت‌هاب نیست — مستقیم به صفحه‌ی نسخه‌ها مراجعه کنید.',
    'badge.prerelease': ' · پیش‌انتشار',
    'badge.latest': ' · آخرین نسخه',
    'releaseInfo.prerelease': 'جدیدترین پیش‌انتشار',
    'releaseInfo.stable': 'آخرین نسخه‌ی پایدار',
    'releaseInfo.published': ' · تاریخ انتشار ',
    'heroLabel.windowsUnavailable': 'نسخه‌ی ویندوز موجود نیست',
    'heroLabel.macUnavailable': 'نسخه‌ی مک موجود نیست',
    'heroLabel.linuxUnavailable': 'نسخه‌ی لینوکس موجود نیست',
    'heroLabel.chooseBelow': 'پلتفرم خود را از پایین انتخاب کنید',
    'title': 'ZDM — مدیریت دانلود سریع و قطعه‌بندی‌شده',
    'metaDescription': 'ZDM هر دانلود را بین چند اتصال هم‌زمان تقسیم می‌کند. یک اپلیکیشن رایگان و متن‌باز برای ویندوز، مک و لینوکس.',
  };

  const originalContent = new Map();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    originalContent.set(el, el.innerHTML);
  });
  const originalTitle = document.title;
  const originalMetaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  let currentLang = PERSIAN_ENABLED
    ? (localStorage.getItem('zdm-lang') || (navigator.language.toLowerCase().startsWith('fa') ? 'fa' : 'en'))
    : 'en';

  function t(key, vars) {
    let str = currentLang === 'fa' && FA[key] !== undefined ? FA[key] : ENGLISH_DYNAMIC[key] || key;
    if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, v); });
    return str;
  }

  // Dynamic (JS-generated) English strings — static page text lives in the HTML itself.
  const ENGLISH_DYNAMIC = {
    'hero.ctaFetching': 'Download for your OS',
    'hero.fetching': 'fetching latest version…',
    'download.notInRelease': 'not in this release',
    'download.fmt.dmgUniversal': '.dmg — Universal',
    'download.recommended': 'Recommended for you',
    'toast.copied': 'Copied to clipboard',
    'toast.copyFailed': 'Could not copy — select manually',
    'toast.fillFields': 'Please fill in every field',
    'toast.sending': 'Sending…',
    'toast.sent': 'Message sent — I\'ll get back to you soon.',
    'toast.sendFailed': 'Could not send — please email directly instead.',
    'apiError.version': 'Could not reach GitHub — see releases page',
    'apiError.releaseInfo': 'Could not load release data from GitHub right now — browse releases directly.',
    'badge.prerelease': ' · pre-release',
    'badge.latest': ' · latest',
    'releaseInfo.prerelease': 'the most recent pre-release',
    'releaseInfo.stable': 'the latest stable release',
    'releaseInfo.published': ' · published ',
    'heroLabel.windowsUnavailable': 'Windows build unavailable',
    'heroLabel.macUnavailable': 'macOS build unavailable',
    'heroLabel.linuxUnavailable': 'Linux build unavailable',
    'heroLabel.chooseBelow': 'Choose your platform below',
    'nav.download': 'Download',
    'title': originalTitle,
    'metaDescription': originalMetaDesc,
  };

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('zdm-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.innerHTML = (lang === 'fa' && FA[key] !== undefined) ? FA[key] : originalContent.get(el);
    });

    document.title = lang === 'fa' ? FA['title'] : originalTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', lang === 'fa' ? FA['metaDescription'] : originalMetaDesc);

    const langLabel = lang === 'fa' ? 'English' : 'فارسی';
    document.getElementById('langToggleLabel').textContent = langLabel;
    document.getElementById('langToggleMobileLabel').textContent = langLabel;

    renderDynamicTexts();
  }

  if (PERSIAN_ENABLED) {
    document.getElementById('langToggle')?.addEventListener('click', () => applyLanguage(currentLang === 'fa' ? 'en' : 'fa'));
    document.getElementById('langToggleMobile')?.addEventListener('click', () => applyLanguage(currentLang === 'fa' ? 'en' : 'fa'));
  }

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

  /* ---------------- sticky navbar + scroll progress ---------------- */
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 8);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- scrollspy ---------------- */
  const sections = ['features', 'download', 'architecture', 'get-started', 'contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  const navLinkFor = (id) => document.querySelectorAll(`.nav-links a[href="#${id}"]`);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
          navLinkFor(entry.target.id).forEach(a => a.classList.add('active'));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------------- reveal on scroll (staggered by sibling position) ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const siblings = Array.from(entry.target.parentElement.children).filter(c => c.classList.contains('reveal') || c.matches('.feature-card, .download-card, .arch-card'));
          const idx = siblings.indexOf(entry.target);
          entry.target.style.setProperty('--stagger', Math.min(idx >= 0 ? idx : 0, 6));
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------------- generic collapsible (other-platforms + prereqs) ---------------- */
  document.querySelectorAll('[data-collapsible]').forEach(box => {
    const trigger = box.querySelector('.collapsible-trigger');
    trigger?.addEventListener('click', () => {
      const open = box.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(open));
    });
  });

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
        toast(t('toast.copied'));
      } catch {
        toast(t('toast.copyFailed'));
      }
    });
  });

  /* ---------------- hero visual: mouse-parallax tilt ---------------- */
  const heroVisual = document.getElementById('heroVisual');
  const appMock = document.getElementById('appMock');
  const DEFAULT_TILT = { ry: -6, rx: 2 };
  if (heroVisual && appMock && window.matchMedia('(hover: hover)').matches) {
    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const dir = document.documentElement.dir === 'rtl' ? -1 : 1;
      const ry = DEFAULT_TILT.ry * dir + px * 14;
      const rx = DEFAULT_TILT.rx - py * 10;
      appMock.style.transform = `perspective(1200px) rotateY(${ry}deg) rotateX(${rx}deg)`;
    });
    heroVisual.addEventListener('mouseleave', () => {
      const dir = document.documentElement.dir === 'rtl' ? -1 : 1;
      appMock.style.transform = `perspective(1200px) rotateY(${DEFAULT_TILT.ry * dir}deg) rotateX(${DEFAULT_TILT.rx}deg)`;
    });
  }

  /* ---------------- animated mock segment bars ---------------- */
  function buildSegbar(el, count) {
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

  /* ---------------- move the detected-OS card into the featured slot ---------------- */
  function initDownloadLayout() {
    const primary = document.getElementById('downloadPrimary');
    const secondary = document.getElementById('downloadSecondary');
    const wrap = document.getElementById('otherPlatformsWrap');
    if (!primary || !secondary || !wrap) return;

    const cards = Array.from(secondary.querySelectorAll('.download-card'));
    const matchCard = cards.find(c => c.dataset.platform === platform);

    if (matchCard) {
      const badge = document.createElement('div');
      badge.className = 'recommended-badge';
      badge.dataset.recommendedFor = platform;
      badge.textContent = `${t('download.recommended')} · ${OS_NAMES[platform][currentLang] || OS_NAMES[platform].en}`;
      matchCard.prepend(badge);
      matchCard.classList.add('is-primary');
      primary.appendChild(matchCard);
    } else {
      wrap.classList.add('open');
      wrap.querySelector('.collapsible-trigger')?.setAttribute('aria-expanded', 'true');
    }
  }
  initDownloadLayout();

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
    const sizeEl = el.querySelector('.dl-size');
    if (asset) {
      el.href = asset.browser_download_url;
      el.target = '_self';
      el.removeAttribute('rel');
      el.classList.remove('disabled');
      if (sizeEl) sizeEl.textContent = formatBytes(asset.size);
    } else {
      el.classList.add('disabled');
      if (sizeEl) sizeEl.textContent = t('download.notInRelease');
    }
  }

  function countUp(el, target) {
    const duration = 900;
    const start = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Cached, already-resolved data so a language switch can re-render without refetching.
  // `undefined` = not fetched yet (leave the HTML's initial placeholder alone),
  // `null` = fetch attempted and failed, a number = fetched successfully.
  let releaseState; // undefined | { error: true } | { release, isFallbackToNonStable, assets, ... }
  let starState; // undefined | null | number

  function renderDynamicTexts() {
    renderReleaseTexts();
    renderStarTexts();
    renderOtherPlatformsBadge();
  }

  function renderOtherPlatformsBadge() {
    const badge = document.querySelector('.recommended-badge');
    if (!badge) return;
    const os = badge.dataset.recommendedFor;
    if (!os || !OS_NAMES[os]) return;
    badge.textContent = `${t('download.recommended')} · ${OS_NAMES[os][currentLang] || OS_NAMES[os].en}`;
  }

  function renderReleaseTexts() {
    const versionBadge = document.getElementById('versionBadge');
    const releaseInfo = document.getElementById('releaseInfo');
    const heroDownloadLabel = document.getElementById('heroDownloadLabel');
    const heroDownloadBtn = document.getElementById('heroDownloadBtn');
    const navDownloadBtn = document.getElementById('navDownloadBtn');

    if (!releaseState) return;

    if (releaseState.error) {
      versionBadge.textContent = t('apiError.version');
      releaseInfo.textContent = t('apiError.releaseInfo');
      return;
    }

    const { release, isFallbackToNonStable, assets, heroAsset, heroPlatform } = releaseState;
    const tag = release.tag_name || release.name || 'latest';
    const publishedDate = release.published_at
      ? new Date(release.published_at).toLocaleDateString(currentLang === 'fa' ? 'fa-IR' : undefined, { year: 'numeric', month: 'short', day: 'numeric' })
      : '';

    versionBadge.textContent = `${tag}${isFallbackToNonStable || release.prerelease ? t('badge.prerelease') : t('badge.latest')}`;
    const showingPrefix = currentLang === 'fa' ? 'در حال نمایش' : 'Showing';
    const releaseKindText = release.prerelease ? t('releaseInfo.prerelease') : t('releaseInfo.stable');
    releaseInfo.textContent = `${showingPrefix} ${releaseKindText}: ${tag}${publishedDate ? t('releaseInfo.published') + publishedDate : ''}.`;

    wireDownloadButton('[data-asset="exe"]', assets.exeAsset);
    wireDownloadButton('[data-asset="msi"]', assets.msiAsset);
    wireDownloadButton('[data-asset="dmg-arm"]', assets.dmgArm || (!assets.dmgIntel ? assets.dmgAny : null));
    wireDownloadButton('[data-asset="dmg-intel"]', assets.dmgIntel || (!assets.dmgArm ? assets.dmgAny : null));
    wireDownloadButton('[data-asset="deb"]', assets.debAsset);
    wireDownloadButton('[data-asset="rpm"]', assets.rpmAsset);
    wireDownloadButton('[data-asset="appimage"]', assets.appImageAsset);

    if (!assets.dmgArm && !assets.dmgIntel && assets.dmgAny) {
      document.querySelector('[data-asset="dmg-intel"]')?.remove();
      const soleLabel = document.querySelector('[data-asset="dmg-arm"] .dl-label');
      if (soleLabel) soleLabel.textContent = t('download.fmt.dmgUniversal');
    }

    let heroLabel;
    if (heroPlatform === 'windows') heroLabel = heroAsset ? `${currentLang === 'fa' ? 'دانلود برای ویندوز' : 'Download for Windows'} (${tag})` : t('heroLabel.windowsUnavailable');
    else if (heroPlatform === 'mac') heroLabel = heroAsset ? `${currentLang === 'fa' ? 'دانلود برای مک' : 'Download for macOS'} (${tag})` : t('heroLabel.macUnavailable');
    else if (heroPlatform === 'linux') heroLabel = heroAsset ? `${currentLang === 'fa' ? 'دانلود برای لینوکس' : 'Download for Linux'} (${tag})` : t('heroLabel.linuxUnavailable');
    else heroLabel = t('heroLabel.chooseBelow');

    const wasReady = heroDownloadBtn.dataset.ready === '1';
    heroDownloadLabel.textContent = heroLabel;
    if (heroAsset) {
      heroDownloadBtn.href = heroAsset.browser_download_url;
      navDownloadBtn.href = heroAsset.browser_download_url;
      navDownloadBtn.textContent = t('nav.download');
      if (!wasReady) {
        heroDownloadBtn.dataset.ready = '1';
        heroDownloadBtn.classList.add('pulse-once');
        setTimeout(() => heroDownloadBtn.classList.remove('pulse-once'), 1500);
      }
    } else {
      heroDownloadBtn.href = '#download';
    }
  }

  async function initReleases() {
    const data = await fetchLatestRelease();

    if (!data) {
      releaseState = { error: true };
      renderReleaseTexts();
      return;
    }

    const { release, isFallbackToNonStable } = data;
    const rawAssets = release.assets || [];

    const assets = {
      exeAsset: pickAsset(rawAssets, [/setup.*\.exe$/i, /\.exe$/i]),
      msiAsset: pickAsset(rawAssets, [/\.msi$/i]),
      dmgArm: pickAsset(rawAssets, [/(aarch64|arm64).*\.dmg$/i]),
      dmgIntel: pickAsset(rawAssets, [/(x64|x86_64|amd64|intel).*\.dmg$/i]),
      dmgAny: pickAsset(rawAssets, [/\.dmg$/i]),
      debAsset: pickAsset(rawAssets, [/\.deb$/i]),
      rpmAsset: pickAsset(rawAssets, [/\.rpm$/i]),
      appImageAsset: pickAsset(rawAssets, [/\.appimage$/i]),
    };

    let heroAsset = null;
    if (platform === 'windows') {
      heroAsset = assets.exeAsset || assets.msiAsset;
    } else if (platform === 'mac') {
      const arch = detectMacArch();
      heroAsset = (arch === 'intel' ? assets.dmgIntel : assets.dmgArm) || assets.dmgAny;
    } else if (platform === 'linux') {
      heroAsset = assets.appImageAsset || assets.debAsset || assets.rpmAsset;
    }

    releaseState = { release, isFallbackToNonStable, assets, heroAsset, heroPlatform: platform };
    renderReleaseTexts();
  }

  function renderStarTexts() {
    if (starState === undefined) return; // not fetched yet — keep the HTML placeholder
    const starCountEls = [document.getElementById('starCount'), document.getElementById('starStat')];
    if (starState === null) {
      starCountEls.forEach(el => { if (el) el.textContent = '★'; });
      return;
    }
    starCountEls.forEach(el => {
      if (!el) return;
      if (el.id === 'starStat') countUp(el, starState);
      else el.textContent = starState.toLocaleString();
    });
  }

  async function initStars() {
    const info = await fetchRepoInfo();
    starState = info ? (info.stargazers_count || 0) : null;
    renderStarTexts();
  }

  initReleases();
  initStars();
  applyLanguage(currentLang);

  /* ---------------- contact form -> real send via /api/contact.php ---------------- */
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    const company = document.getElementById('cf-company')?.value || ''; // honeypot

    if (!name || !email || !message) {
      toast(t('toast.fillFields'));
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    toast(t('toast.sending'));

    try {
      const res = await fetch('/api/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, company }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      toast(t('toast.sent'));
      contactForm.reset();
    } catch (err) {
      console.warn('ZDM: contact form send failed', err);
      toast(t('toast.sendFailed'));
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
