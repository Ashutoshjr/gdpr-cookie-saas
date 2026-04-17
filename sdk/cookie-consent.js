/**
 * GDPR Cookie Consent SDK
 * Single-file embeddable script — zero dependencies
 *
 * Usage:
 *   <script src="cookie-consent.js"
 *           data-api-key="YOUR-API-KEY"
 *           data-api-url="https://your-api.com"></script>
 */
(function (window, document) {
  'use strict';

  // ── 1. Bootstrap ────────────────────────────────────────────────────────────
  // Capture currentScript SYNCHRONOUSLY at parse time (lost inside callbacks)
  var _currentScript = document.currentScript;

  var _apiKey = null;
  var _apiUrl = null;
  var _config = null;

  function boot() {
    if (!_currentScript) {
      console.warn('[CookieConsent] Could not detect script tag. Add the script without async/defer.');
      return;
    }
    _apiKey = _currentScript.getAttribute('data-api-key');
    _apiUrl = (_currentScript.getAttribute('data-api-url') || '').replace(/\/$/, '');

    if (!_apiKey) {
      console.warn('[CookieConsent] Missing data-api-key attribute.');
      return;
    }
    if (!_apiUrl) {
      console.warn('[CookieConsent] Missing data-api-url attribute.');
      return;
    }

    fetchConfig(_apiKey, function (config) {
      _config = config;
      init(config);
    });
  }

  // ── 2. Config Loader ────────────────────────────────────────────────────────
  function fetchConfig(apiKey, callback) {
    fetch(_apiUrl + '/api/config/' + apiKey)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(callback)
      .catch(function (e) {
        // FAIL-OPEN: if API is unreachable, do NOT block scripts and do NOT show banner.
        // A broken consent tool must never take down the host website.
        console.warn('[CookieConsent] Failed to load config — running fail-open.', e.message);
      });
  }

  // ── 3. Translations ─────────────────────────────────────────────────────────
  var TRANSLATIONS = {
    en: { acceptAll: 'Accept All', rejectAll: 'Reject All', customize: 'Customize',
          savePreferences: 'Save Preferences', required: 'Always required',
          modalTitle: 'Cookie Preferences', manage: '🍪 Manage Cookies' },
    de: { acceptAll: 'Alle akzeptieren', rejectAll: 'Alle ablehnen', customize: 'Anpassen',
          savePreferences: 'Einstellungen speichern', required: 'Immer erforderlich',
          modalTitle: 'Cookie-Einstellungen', manage: '🍪 Cookies verwalten' },
    fr: { acceptAll: 'Tout accepter', rejectAll: 'Tout refuser', customize: 'Personnaliser',
          savePreferences: 'Enregistrer', required: 'Toujours requis',
          modalTitle: 'Préférences cookies', manage: '🍪 Gérer les cookies' },
    es: { acceptAll: 'Aceptar todo', rejectAll: 'Rechazar todo', customize: 'Personalizar',
          savePreferences: 'Guardar preferencias', required: 'Siempre requerido',
          modalTitle: 'Preferencias de cookies', manage: '🍪 Gestionar cookies' },
    it: { acceptAll: 'Accetta tutto', rejectAll: 'Rifiuta tutto', customize: 'Personalizza',
          savePreferences: 'Salva preferenze', required: 'Sempre richiesto',
          modalTitle: 'Preferenze cookie', manage: '🍪 Gestisci cookie' },
    pt: { acceptAll: 'Aceitar tudo', rejectAll: 'Rejeitar tudo', customize: 'Personalizar',
          savePreferences: 'Guardar preferências', required: 'Sempre necessário',
          modalTitle: 'Preferências de cookies', manage: '🍪 Gerir cookies' },
    nl: { acceptAll: 'Alles accepteren', rejectAll: 'Alles weigeren', customize: 'Aanpassen',
          savePreferences: 'Voorkeuren opslaan', required: 'Altijd vereist',
          modalTitle: 'Cookie-voorkeuren', manage: '🍪 Cookies beheren' },
    pl: { acceptAll: 'Zaakceptuj wszystkie', rejectAll: 'Odrzuć wszystkie', customize: 'Dostosuj',
          savePreferences: 'Zapisz preferencje', required: 'Zawsze wymagane',
          modalTitle: 'Preferencje plików cookie', manage: '🍪 Zarządzaj plikami cookie' }
  };

  function t(config, key) {
    var lang = (config && config.language) || 'en';
    var dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || key;
  }

  // ── 4. EU Country List ───────────────────────────────────────────────────────
  var EU_COUNTRIES = [
    'AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI','FR','GR','HR',
    'HU','IE','IT','LT','LU','LV','MT','NL','PL','PT','RO','SE','SI',
    'SK', // EU member states
    'IS','LI','NO', // EEA
    'GB','CH' // UK/CH — GDPR still applies
  ];

  // ── 5. Init ─────────────────────────────────────────────────────────────────
  function init(config) {
    var stored = getStoredConsent();

    // If consent already stored and version matches → skip banner, just activate scripts
    if (stored && stored.version === config.version) {
      activateScripts(stored.categories);
      showManageButton(config);
      return;
    }

    // Geolocation check: if enabled, only show banner to EU/EEA visitors
    if (config.geoRestrictionEnabled) {
      checkIfEuVisitor(function (isEu) {
        if (isEu) {
          injectStyles(config);
          renderBanner(config);
        }
        // Non-EU visitor: activate all scripts silently, no banner
        else {
          var allCategories = {};
          (config.categories || []).forEach(function (c) { allCategories[c.name] = true; });
          activateScripts(allCategories);
        }
      });
    } else {
      injectStyles(config);
      renderBanner(config);
    }
  }

  function checkIfEuVisitor(callback) {
    fetch('http://ip-api.com/json/?fields=countryCode')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        callback(EU_COUNTRIES.indexOf(data.countryCode) !== -1);
      })
      .catch(function () {
        // Fail-open: if geo check fails, show the banner to be safe
        callback(true);
      });
  }

  // ── 4. Script Blocking Engine ───────────────────────────────────────────────
  // Scripts tagged type="text/plain" are NOT executed by the browser.
  // After consent, we replace each blocked node with a real <script> node.
  function activateScripts(allowedCategories) {
    var blocked = document.querySelectorAll('script[type="text/plain"][data-category]');
    blocked.forEach(function (orig) {
      var category = orig.getAttribute('data-category');
      if (allowedCategories[category] === true) {
        var clone = document.createElement('script');
        // Copy all attributes except type
        var attrs = orig.attributes;
        for (var i = 0; i < attrs.length; i++) {
          if (attrs[i].name !== 'type') {
            clone.setAttribute(attrs[i].name, attrs[i].value);
          }
        }
        // Copy inline script content
        if (orig.textContent) {
          clone.textContent = orig.textContent;
        }
        orig.parentNode.replaceChild(clone, orig);
      }
    });
  }

  // ── 5. localStorage Manager ─────────────────────────────────────────────────
  var STORAGE_KEY_PREFIX = 'cc_consent_';

  function storageKey() {
    return STORAGE_KEY_PREFIX + _apiKey;
  }

  function getStoredConsent() {
    try {
      var raw = localStorage.getItem(storageKey());
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function storeConsent(payload) {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(payload));
    } catch (e) {
      // Storage quota exceeded or private browsing — ignore silently
    }
  }

  function generateSessionId() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  // ── 6. API Client ───────────────────────────────────────────────────────────
  function postConsent(payload) {
    fetch(_apiUrl + '/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function (e) {
      // Fire-and-forget — consent is already in localStorage
      console.warn('[CookieConsent] Failed to record consent remotely.', e.message);
    });
  }

  // ── 7. CSS Injection ────────────────────────────────────────────────────────
  function injectStyles(config) {
    var primary = (config && config.primaryColor) || '#1a73e8';
    var position = (config && config.position) || 'bottom';

    var css = [
      '#cc-banner{position:fixed;' + position + ':0;left:0;right:0;z-index:999999;',
      'background:#fff;box-shadow:0 -2px 12px rgba(0,0,0,.15);padding:16px 24px;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
      'font-size:14px;line-height:1.5;color:#333;display:flex;align-items:center;',
      'justify-content:space-between;flex-wrap:wrap;gap:12px;}',

      '#cc-banner-text{flex:1;min-width:200px;margin:0;}',
      '#cc-banner-text a{color:' + primary + ';}',

      '#cc-banner-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}',

      '.cc-btn{border:none;cursor:pointer;padding:9px 18px;border-radius:4px;',
      'font-size:14px;font-weight:500;transition:opacity .15s;}',
      '.cc-btn:hover{opacity:.85;}',

      '#cc-accept-all{background:' + primary + ';color:#fff;}',
      '#cc-reject-all{background:#f1f3f4;color:#333;}',
      '#cc-customize{background:transparent;color:' + primary + ';',
      'text-decoration:underline;padding:9px 6px;}',

      // Modal overlay
      '#cc-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);',
      'z-index:1000000;display:flex;align-items:center;justify-content:center;}',

      '#cc-modal{background:#fff;border-radius:8px;padding:28px;max-width:480px;',
      'width:calc(100% - 32px);max-height:80vh;overflow-y:auto;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}',

      '#cc-modal h2{margin:0 0 8px;font-size:18px;color:#111;}',
      '#cc-modal p.cc-modal-desc{margin:0 0 20px;font-size:13px;color:#666;}',

      '.cc-category{display:flex;justify-content:space-between;align-items:flex-start;',
      'padding:12px 0;border-bottom:1px solid #eee;}',
      '.cc-category:last-of-type{border-bottom:none;}',
      '.cc-category-info{flex:1;padding-right:16px;}',
      '.cc-category-name{font-weight:600;font-size:14px;color:#111;margin-bottom:3px;}',
      '.cc-category-desc{font-size:12px;color:#777;}',
      '.cc-required-badge{font-size:11px;color:#888;font-style:italic;margin-top:4px;}',

      // Toggle switch
      '.cc-toggle{position:relative;width:44px;height:24px;flex-shrink:0;}',
      '.cc-toggle input{opacity:0;width:0;height:0;}',
      '.cc-slider{position:absolute;inset:0;background:#ccc;border-radius:24px;',
      'cursor:pointer;transition:.3s;}',
      '.cc-slider:before{content:"";position:absolute;height:18px;width:18px;',
      'left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s;}',
      '.cc-toggle input:checked + .cc-slider{background:' + primary + ';}',
      '.cc-toggle input:checked + .cc-slider:before{transform:translateX(20px);}',
      '.cc-toggle input:disabled + .cc-slider{opacity:.6;cursor:not-allowed;}',

      '#cc-modal-actions{display:flex;gap:8px;margin-top:20px;justify-content:flex-end;}',

      // Manage button (floating, after consent)
      '#cc-manage-btn{position:fixed;' + position + ':16px;right:16px;z-index:999998;',
      'background:' + primary + ';color:#fff;border:none;border-radius:24px;',
      'padding:8px 16px;font-size:12px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2);',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}'
    ].join('');

    var style = document.createElement('style');
    style.id = 'cc-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── 8. Banner Renderer ──────────────────────────────────────────────────────
  function renderBanner(config) {
    var banner = document.createElement('div');
    banner.id = 'cc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');

    var text = document.createElement('p');
    text.id = 'cc-banner-text';
    var title = (config && config.bannerTitle) ? config.bannerTitle : 'We use cookies';
    var desc = (config && config.bannerDescription) ? config.bannerDescription : 'We use cookies to improve your experience on our site.';
    var strong = document.createElement('strong');
    strong.textContent = title + ' ';
    text.appendChild(strong);
    text.appendChild(document.createTextNode(desc));

    // Privacy Policy link
    if (config && config.privacyPolicyUrl) {
      text.appendChild(document.createTextNode(' '));
      var ppLink = document.createElement('a');
      ppLink.href = config.privacyPolicyUrl;
      ppLink.target = '_blank';
      ppLink.rel = 'noopener noreferrer';
      ppLink.textContent = 'Privacy Policy';
      text.appendChild(ppLink);
      text.appendChild(document.createTextNode('.'));
    }

    var actions = document.createElement('div');
    actions.id = 'cc-banner-actions';

    var acceptBtn = makeButton('cc-accept-all', t(config, 'acceptAll'), 'cc-btn');
    var rejectBtn = makeButton('cc-reject-all', t(config, 'rejectAll'), 'cc-btn');
    var customizeBtn = makeButton('cc-customize', t(config, 'customize'), 'cc-btn');

    acceptBtn.addEventListener('click', function () { acceptAll(config); });
    rejectBtn.addEventListener('click', function () { rejectAll(config); });
    customizeBtn.addEventListener('click', function () { renderModal(config); });

    actions.appendChild(acceptBtn);
    actions.appendChild(rejectBtn);
    actions.appendChild(customizeBtn);
    banner.appendChild(text);
    banner.appendChild(actions);

    document.body.appendChild(banner);
  }

  function makeButton(id, label, className) {
    var btn = document.createElement('button');
    btn.id = id;
    btn.className = className;
    btn.textContent = label;
    return btn;
  }

  function removeBanner() {
    var b = document.getElementById('cc-banner');
    if (b) b.parentNode.removeChild(b);
  }

  // ── 9. Category Modal ───────────────────────────────────────────────────────
  function renderModal(config, existingConsent) {
    // Remove existing modal if open
    closeModal();

    var overlay = document.createElement('div');
    overlay.id = 'cc-modal-overlay';

    var modal = document.createElement('div');
    modal.id = 'cc-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Cookie preferences');

    var title = document.createElement('h2');
    title.textContent = t(config, 'modalTitle');

    var desc = document.createElement('p');
    desc.className = 'cc-modal-desc';
    desc.textContent = t(config, 'modalDesc') || 'Choose which cookies you allow. Required cookies cannot be disabled.';

    modal.appendChild(title);
    modal.appendChild(desc);

    var categories = (config && config.categories) || [];
    categories.forEach(function (cat) {
      var currentVal = existingConsent
        ? (existingConsent.categories[cat.name] === true)
        : cat.isRequired;

      var row = document.createElement('div');
      row.className = 'cc-category';

      var info = document.createElement('div');
      info.className = 'cc-category-info';

      var name = document.createElement('div');
      name.className = 'cc-category-name';
      name.textContent = capitalize(cat.name);

      var descEl = document.createElement('div');
      descEl.className = 'cc-category-desc';
      descEl.textContent = cat.description || '';

      info.appendChild(name);
      info.appendChild(descEl);

      if (cat.isRequired) {
        var badge = document.createElement('div');
        badge.className = 'cc-required-badge';
        badge.textContent = t(config, 'required');
        info.appendChild(badge);
      }

      // Toggle switch
      var label = document.createElement('label');
      label.className = 'cc-toggle';
      label.setAttribute('aria-label', capitalize(cat.name) + ' cookies');

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.setAttribute('data-category', cat.name);
      checkbox.checked = cat.isRequired ? true : currentVal;
      checkbox.disabled = cat.isRequired;

      var slider = document.createElement('span');
      slider.className = 'cc-slider';

      label.appendChild(checkbox);
      label.appendChild(slider);

      row.appendChild(info);
      row.appendChild(label);
      modal.appendChild(row);
    });

    // Action buttons
    var modalActions = document.createElement('div');
    modalActions.id = 'cc-modal-actions';

    var saveBtn = makeButton('cc-save-prefs', t(config, 'savePreferences'), 'cc-btn');
    saveBtn.style.cssText = 'background:' + ((config && config.primaryColor) || '#1a73e8') + ';color:#fff;';
    saveBtn.addEventListener('click', function () { saveCustom(config, modal); });

    var acceptAllBtn = makeButton('cc-modal-accept-all', t(config, 'acceptAll'), 'cc-btn');
    acceptAllBtn.style.cssText = 'background:#f1f3f4;color:#333;';
    acceptAllBtn.addEventListener('click', function () { acceptAll(config); closeModal(); });

    modalActions.appendChild(acceptAllBtn);
    modalActions.appendChild(saveBtn);
    modal.appendChild(modalActions);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    // Close on Escape
    document.addEventListener('keydown', handleEscKey);
  }

  function handleEscKey(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscKey);
    }
  }

  function closeModal() {
    var m = document.getElementById('cc-modal-overlay');
    if (m) m.parentNode.removeChild(m);
  }

  // ── 10. Consent Engine ──────────────────────────────────────────────────────
  function acceptAll(config) {
    var categories = {};
    var cats = (config && config.categories) || [];
    cats.forEach(function (c) { categories[c.name] = true; });
    recordConsent(true, categories, config);
  }

  function rejectAll(config) {
    var categories = {};
    var cats = (config && config.categories) || [];
    cats.forEach(function (c) { categories[c.name] = c.isRequired === true; });
    recordConsent(false, categories, config);
  }

  function saveCustom(config, modalEl) {
    var categories = {};
    var hasOptionalAccepted = false;
    var cats = (config && config.categories) || [];

    cats.forEach(function (cat) {
      if (cat.isRequired) {
        categories[cat.name] = true;
      } else {
        var checkbox = modalEl.querySelector('input[data-category="' + cat.name + '"]');
        var checked = checkbox ? checkbox.checked : false;
        categories[cat.name] = checked;
        if (checked) hasOptionalAccepted = true;
      }
    });

    closeModal();
    recordConsent(hasOptionalAccepted, categories, config);
  }

  function recordConsent(consentGiven, categories, config) {
    var sessionId = generateSessionId();
    var payload = {
      sessionId: sessionId,
      consentGiven: consentGiven,
      categories: categories,
      timestamp: new Date().toISOString(),
      version: (config && config.version) || 1
    };

    // 1. Persist to localStorage
    storeConsent(payload);

    // 2. Send to backend API (fire-and-forget)
    postConsent({
      websiteId: config && config.websiteId,
      consentGiven: consentGiven,
      categories: JSON.stringify(categories),
      sessionId: sessionId
    });

    // 3. Activate allowed scripts
    activateScripts(categories);

    // 4. Remove banner + show manage button
    removeBanner();
    closeModal();
    showManageButton(config);
  }

  // ── 11. Manage Cookies Button (Consent Withdrawal) ──────────────────────────
  function showManageButton(config) {
    if (document.getElementById('cc-manage-btn')) return;

    var btn = document.createElement('button');
    btn.id = 'cc-manage-btn';
    btn.textContent = t(config, 'manage');
    btn.setAttribute('aria-label', 'Manage cookie preferences');

    btn.addEventListener('click', function () {
      var stored = getStoredConsent();
      // Inject styles again if they were removed somehow
      if (!document.getElementById('cc-styles')) injectStyles(config);
      renderModal(config, stored);
    });

    document.body.appendChild(btn);
  }

  // ── 12. Helpers ─────────────────────────────────────────────────────────────
  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  // ── 13. Public API ───────────────────────────────────────────────────────────
  window.CookieConsent = {
    manage: function () {
      if (_config) {
        if (!document.getElementById('cc-styles')) injectStyles(_config);
        renderModal(_config, getStoredConsent());
      }
    },
    getConsent: function () {
      return getStoredConsent();
    },
    reset: function () {
      try { localStorage.removeItem(storageKey()); } catch (e) { /* ignore */ }
      location.reload();
    }
  };

  // ── 14. Entry point ─────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window, document);
