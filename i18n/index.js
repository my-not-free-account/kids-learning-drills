/**
 * i18n/index.js
 * Localization system for kids-learning-drills.
 *
 * Usage on each page:
 *   1. Set PAGE_KEY before loading this script:
 *        <script>const PAGE_KEY = 'division-col';</script>
 *        <script src="/i18n/index.js"></script>
 *
 *   2. Mark translatable elements with data-i18n:
 *        <h1 data-i18n="h1">➗ Деление столбиком</h1>
 *
 *   3. Use t() for dynamically generated strings:
 *        t('feedback_correct')
 *        t('feedback_attempts_left', { left: 3 })
 */

const I18N_SUPPORTED_LANGS = ['ru', 'es'];
const I18N_DEFAULT_LANG    = 'ru';
const I18N_STORAGE_KEY     = 'kld_lang';

let _strings = {};
let _lang    = I18N_DEFAULT_LANG;

// --- Public API ---

/**
 * Get a translated string by key, with optional placeholder interpolation.
 * Placeholders are written as {key} and replaced by values from params.
 */
function t(key, params = {}) {
  let str = _strings[key];

  if (str === undefined) {
    console.warn(`[i18n] Missing key: "${key}" (lang: ${_lang})`);
    return key;
  }

  return str.replace(/\{(\w+)\}/g, (_, name) => {
    if (params[name] !== undefined) return params[name];
    console.warn(`[i18n] Missing param "${name}" for key "${key}"`);
    return `{${name}}`;
  });
}

function currentLang() {
  return _lang;
}

function switchLang() {
  const next = _lang === 'ru' ? 'es' : 'ru';
  localStorage.setItem(I18N_STORAGE_KEY, next);
  location.reload();
}

// --- JSON loading ---

async function _fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`[i18n] Failed to load ${path}: ${res.status}`);
  return res.json();
}

function _detectLang() {
  const stored = localStorage.getItem(I18N_STORAGE_KEY);
  if (stored && I18N_SUPPORTED_LANGS.includes(stored)) return stored;

  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  if (I18N_SUPPORTED_LANGS.includes(browser)) return browser;

  return I18N_DEFAULT_LANG;
}

/**
 * Resolve the repository root URL from the script's own src attribute.
 * Required for correct fetch paths on GitHub Pages subdirectory deployments.
 */
function _baseUrl() {
  const scripts = document.querySelectorAll('script[src]');
  for (const s of scripts) {
    if (s.src.includes('/i18n/index.js')) {
      return s.src.replace('/i18n/index.js', '');
    }
  }
  return '';
}

// --- DOM ---

function _applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key  = el.dataset.i18n;
    const attr = el.dataset.i18nAttr;
    const str  = t(key);
    if (attr) {
      el.setAttribute(attr, str);
    } else {
      el.innerHTML = str;
    }
  });
}

function _applyHtmlLang() {
  document.documentElement.lang = _lang;
}

function _applyPageTitle() {
  if (_strings.page_title) document.title = _strings.page_title;
}

// --- Language toggle button ---

function _injectLangToggle() {
  const style = document.createElement('style');
  style.textContent = `
    .i18n-toggle {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 900;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 99px;
      border: 2px solid rgba(0,0,0,0.10);
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 2px 12px rgba(0,0,0,0.10);
      cursor: pointer;
      font-family: 'Baloo 2', 'Fredoka One', cursive;
      font-size: 0.88rem;
      font-weight: 700;
      color: #3d3642;
      transition: transform 0.15s, box-shadow 0.15s;
      user-select: none;
    }
    .i18n-toggle:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.14);
    }
    .i18n-toggle:active { transform: translateY(0); }
    .i18n-toggle__flag  { font-size: 1.1rem; line-height: 1; }
    .i18n-toggle__label { line-height: 1; }
  `;
  document.head.appendChild(style);

  const btn     = document.createElement('button');
  btn.className = 'i18n-toggle';
  btn.title     = _lang === 'ru' ? 'Cambiar a Español' : 'Переключить на Русский';
  btn.setAttribute('aria-label', btn.title);
  btn.onclick   = switchLang;

  const flag  = _lang === 'ru' ? '🇪🇸' : '🇷🇺';
  const label = _lang === 'ru' ? 'ES'   : 'RU';

  btn.innerHTML = `
    <span class="i18n-toggle__flag">${flag}</span>
    <span class="i18n-toggle__label">${label}</span>
  `;

  document.body.appendChild(btn);
}

// --- Home button ---

function _injectHomeButton() {
  if (typeof PAGE_KEY === 'undefined' || PAGE_KEY === 'index') return;

  const style = document.createElement('style');
  style.textContent = `
    .i18n-home {
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 900;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 99px;
      border: 2px solid rgba(0,0,0,0.10);
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 2px 12px rgba(0,0,0,0.10);
      font-family: 'Baloo 2', 'Fredoka One', cursive;
      font-size: 0.88rem;
      font-weight: 700;
      color: #3d3642;
      text-decoration: none;
      transition: transform 0.15s, box-shadow 0.15s;
      user-select: none;
    }
    .i18n-home:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.14);
    }
    .i18n-home:active { transform: translateY(0); }
  `;
  document.head.appendChild(style);

  const a     = document.createElement('a');
  a.className = 'i18n-home';
  a.href      = `${_baseUrl()}/index.html`;
  a.innerHTML = t('nav_home');

  document.body.appendChild(a);
}

// --- Loading screen ---

function _showLoader() {
  const ICONS = ['✏️', '🌟', '🎒', '🍎', '📐', '⭐', '🐣', '📏'];
  const COUNT = 12;

  const style = document.createElement('style');
  style.id    = 'i18n-loader-style';
  style.textContent = `
    body { visibility: hidden; }

    #i18n-loader {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fdf6ee;
      visibility: visible;
    }

    .i18n-loader__icon {
      position: absolute;
      font-size: 2.2rem;
      opacity: 0;
      animation: loaderFloat var(--dur) ease-in-out var(--delay) infinite;
    }

    @keyframes loaderFloat {
      0%   { transform: translateY(0px)   rotate(0deg);  opacity: 0;    }
      15%  { opacity: 0.55; }
      50%  { transform: translateY(-28px) rotate(12deg); opacity: 0.55; }
      85%  { opacity: 0.55; }
      100% { transform: translateY(0px)   rotate(0deg);  opacity: 0;    }
    }

    .i18n-loader__fade-out {
      animation: loaderFadeOut 0.4s ease forwards;
    }

    @keyframes loaderFadeOut {
      to { opacity: 0; pointer-events: none; }
    }
  `;
  document.head.appendChild(style);

  const loader = document.createElement('div');
  loader.id    = 'i18n-loader';

  for (let i = 0; i < COUNT; i++) {
    const angle = (i / COUNT) * 2 * Math.PI;
    const x     = Math.round(50 + 90 * Math.cos(angle) * 0.9);
    const y     = Math.round(50 + 90 * Math.sin(angle) * 0.55);

    const icon = document.createElement('span');
    icon.className   = 'i18n-loader__icon';
    icon.textContent = ICONS[i % ICONS.length];
    icon.style.cssText = `
      left: ${x}%;
      top:  ${y}%;
      --dur:   ${1.8 + (i % 4) * 0.35}s;
      --delay: ${(i / COUNT) * 1.6}s;
    `;
    loader.appendChild(icon);
  }

  document.body.appendChild(loader);

  return {
    hide() {
      loader.classList.add('i18n-loader__fade-out');
      loader.addEventListener('animationend', () => {
        loader.remove();
        style.remove();
        const bodyStyle = document.createElement('style');
        bodyStyle.textContent = 'body { visibility: visible !important; }';
        document.head.appendChild(bodyStyle);
      }, { once: true });
    }
  };
}

// --- Init ---

async function _init() {
  _lang = _detectLang();

  const loader  = _showLoader();
  const base    = _baseUrl();
  const pageKey = (typeof PAGE_KEY !== 'undefined') ? PAGE_KEY : 'index';

  try {
    const [common, page] = await Promise.all([
      _fetchJSON(`${base}/locales/common.${_lang}.json`),
      _fetchJSON(`${base}/locales/${pageKey}.${_lang}.json`),
      new Promise(resolve => setTimeout(resolve, 500)),
    ]);

    _strings = { ...common, ...page };

  } catch (err) {
    console.error('[i18n] Failed to load translations:', err);
    _strings = {};
  }

  _applyHtmlLang();
  _applyPageTitle();
  _applyStaticTranslations();
  _injectLangToggle();
  _injectHomeButton();

  loader.hide();

  document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { lang: _lang } }));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _init);
} else {
  _init();
}
