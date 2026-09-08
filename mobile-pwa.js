/* TOEFL 2026 — shared mobile/PWA surface */
(() => {
  'use strict';

  const PWA_VERSION = '20260908-mobile-nav4';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let installPrompt = null;
  let updateRegistration = null;
  let updateReloading = false;
  let updateReloadOnController = false;
  let statusTimer = null;

  function safeStorage(action, key, value) {
    try {
      if (action === 'get') return sessionStorage.getItem(key);
      if (action === 'set') sessionStorage.setItem(key, value);
      if (action === 'remove') sessionStorage.removeItem(key);
    } catch {}
    return null;
  }

  function ensureMobileStyles() {
    const existing = $('link[data-toefl-mobile-style]');
    if (existing) {
      // retromax.js adds site-tree-nav.css at runtime. Moving this shared layer
      // to the end makes the final responsive contract deterministic.
      document.head.appendChild(existing);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `mobile-pwa.css?v=${PWA_VERSION}`;
    link.dataset.toeflMobileStyle = 'true';
    document.head.appendChild(link);
  }

  function addMobileUtility() {
    if ($('.toefl-mobile-utility')) return;
    const utility = document.createElement('header');
    utility.className = 'toefl-mobile-utility';
    utility.setAttribute('aria-label', 'TOEFL 2026 mobile utilities');
    utility.innerHTML = `
      <a class="toefl-mobile-brand" href="index.html" aria-label="TOEFL 2026 guide home">
        <img src="toefl-2026-logo-header.webp" alt="TOEFL 2026">
      </a>
      <nav class="toefl-mobile-community" aria-label="Community links">
        <a class="toefl-mobile-community-link toefl-mobile-community-kamiunity" href="https://t.me/kamiunity_opensource" target="_blank" rel="noreferrer" title="Join Kamiunity">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3 11 18-8-6 18-3.6-7.4L3 11Zm0 0 8.4 2.6L21 3"/></svg>
          <span>KAMI</span>
        </a>
        <a class="toefl-mobile-community-link toefl-mobile-community-github" href="https://github.com/Kami80/TOEFL-2026" target="_blank" rel="noreferrer" title="Star TOEFL 2026 on GitHub">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 2.89-.39c.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.08.78 2.18 0 1.57-.01 2.83-.01 3.21 0 .31.21.67.8.56A10.99 10.99 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>
          <span>STAR</span>
        </a>
      </nav>
    `;
    document.body.appendChild(utility);
  }

  function isStandalone() {
    return window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function makeButton(label, className, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
  }

  function showStatus(message, tone = 'info', duration = 4600) {
    let status = $('.toefl-pwa-status');
    if (!status) {
      status = document.createElement('div');
      status.className = 'toefl-pwa-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      document.body.appendChild(status);
    }
    status.dataset.tone = tone;
    status.textContent = message;
    status.hidden = false;
    clearTimeout(statusTimer);
    if (duration > 0) statusTimer = window.setTimeout(() => { status.hidden = true; }, duration);
  }

  function createInstallBanner() {
    if ($('.toefl-pwa-install-banner') || isStandalone()) return;
    const banner = document.createElement('aside');
    banner.className = 'toefl-pwa-install-banner';
    banner.setAttribute('aria-label', 'Install TOEFL 2026');
    banner.innerHTML = `
      <div class="toefl-pwa-install-icon" aria-hidden="true">T26</div>
      <div class="toefl-pwa-install-copy">
        <strong>Keep your study station close.</strong>
        <span>Install TOEFL 2026 for fast, offline-friendly access.</span>
      </div>
      <div class="toefl-pwa-install-actions"></div>
    `;
    const actions = $('.toefl-pwa-install-actions', banner);
    const install = makeButton('Install', 'toefl-pwa-install-button', installApp);
    const dismiss = makeButton('Later', 'toefl-pwa-dismiss-button', () => {
      safeStorage('set', 'toefl26-install-dismissed', '1');
      banner.remove();
    });
    actions.append(install, dismiss);
    document.body.appendChild(banner);
    return banner;
  }

  async function installApp() {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    $$('.toefl-pwa-install-button').forEach(button => { button.disabled = true; });
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {}
    $('.toefl-pwa-install-banner')?.remove();
  }

  function addInstallTrigger() {
    if (!$('.site-fastnav') || $('.toefl-pwa-nav-install')) return;
    const mapButton = $('.site-map-open');
    const button = makeButton('APP', 'site-fastnav-link toefl-pwa-nav-install', installApp);
    button.title = 'Install TOEFL 2026';
    button.setAttribute('aria-label', 'Install TOEFL 2026 app');
    button.hidden = !installPrompt;
    if (mapButton) mapButton.before(button);
    else $('.site-fastnav')?.appendChild(button);
  }

  function revealInstallUI() {
    addInstallTrigger();
    $$('.toefl-pwa-nav-install').forEach(button => { button.hidden = false; });
    if (safeStorage('get', 'toefl26-install-dismissed') !== '1') createInstallBanner();
  }

  function removeInstallUI() {
    $$('.toefl-pwa-nav-install').forEach(button => button.remove());
    $('.toefl-pwa-install-banner')?.remove();
  }

  function showUpdateUI(registration) {
    if ($('.toefl-pwa-update-banner')) return;
    const banner = document.createElement('aside');
    banner.className = 'toefl-pwa-update-banner';
    banner.setAttribute('role', 'status');
    banner.innerHTML = '<span><b>New study tools are ready.</b><small>Refresh to use the latest version.</small></span>';
    const update = makeButton('Refresh', 'toefl-pwa-update-button', () => {
      updateReloadOnController = true;
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.setTimeout(() => window.location.reload(), 250);
    });
    const dismiss = makeButton('×', 'toefl-pwa-update-dismiss', () => banner.remove());
    dismiss.setAttribute('aria-label', 'Dismiss update notice');
    banner.append(update, dismiss);
    document.body.appendChild(banner);
  }

  function watchRegistration(registration) {
    updateRegistration = registration;
    if (registration.waiting && navigator.serviceWorker.controller) showUpdateUI(registration);
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdateUI(registration);
      });
    });
  }

  async function registerPWA() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    try {
      const registration = await navigator.serviceWorker.register(`./service-worker.js?v=${PWA_VERSION}`, { scope: './' });
      watchRegistration(registration);
      await navigator.serviceWorker.ready;
      document.documentElement.classList.add('toefl-pwa-ready');
    } catch {
      document.documentElement.classList.add('toefl-pwa-live-only');
    }
  }

  function addScrollTopControl() {
    if (window.matchMedia?.('(max-width:760px)').matches) return;
    if ($('.toefl-mobile-top')) return;
    const button = makeButton('↑', 'toefl-mobile-top', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    button.setAttribute('aria-label', 'Back to top');
    button.hidden = true;
    document.body.appendChild(button);
    const toggle = () => { button.hidden = window.scrollY < Math.max(480, window.innerHeight * 1.15); };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  function bindConnectionStatus() {
    window.addEventListener('offline', () => showStatus('Offline mode · your local progress is still available.', 'offline', 0));
    window.addEventListener('online', () => showStatus('Back online · the study station is synced with the latest files.', 'online'));
    if (!navigator.onLine) showStatus('Offline mode · your local progress is still available.', 'offline', 0);
  }

  function bindInstallLifecycle() {
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      installPrompt = event;
      revealInstallUI();
    });
    window.addEventListener('appinstalled', () => {
      installPrompt = null;
      removeInstallUI();
      showStatus('TOEFL 2026 is installed. Your study station is ready.', 'online');
    });
  }

  function bindServiceWorkerLifecycle() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!updateReloadOnController) return;
      if (updateReloading) return;
      updateReloading = true;
      window.location.reload();
    });
    // retromax.js creates the fast nav at DOMContentLoaded. A short observer
    // keeps the install affordance available without coupling the two scripts.
    const observer = new MutationObserver(() => addInstallTrigger());
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 8000);
    if (updateRegistration?.waiting && navigator.serviceWorker.controller) showUpdateUI(updateRegistration);
  }

  function init() {
    ensureMobileStyles();
    addMobileUtility();
    bindInstallLifecycle();
    bindConnectionStatus();
    addScrollTopControl();
    bindServiceWorkerLifecycle();
    registerPWA();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
