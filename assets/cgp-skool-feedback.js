/*
 * CGP SKOOL — Feedback (Tally)
 * Bouton flottant en bas a droite, ouvre une popup Tally avec le nom
 * du module pre-rempli dans le champ "page" du formulaire.
 *
 * Usage : <script src="cgp-skool-feedback.js" defer></script>
 * (a inclure apres cgp-skool-core.js dans chaque module)
 */
(function() {
  'use strict';

  var TALLY_FORM_ID = 'ja7eo4';

  // Mapping module → libelle lisible (pour le pre-fill)
  var MODULE_LABELS = {
    'index':                'Accueil',
    'etude-dossier':        'Etude de dossier',
    'scpi-simulator':       'SCPI Cash',
    'scpi-financement':     'SCPI Financement',
    'immo-simulator':       'Immobilier locatif',
    'per-vs-av':            'PER vs Assurance Vie',
    'interets-composes':    'Interets composes',
    'simulateur-avance-av': 'Avance sur Assurance Vie',
    'etude-transfert-per':  'Transfert PER/AV',
    'allocation-cible':     'Allocation Cible',
    'bp-simulator':         'Business Plan',
    'equipe-builder':       'Equipe',
    'comparatif-cgp':       'Notre positionnement',
    'dossier-solution':     'Dossier Solution'
  };

  var moduleFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var moduleId = moduleFile.replace('.html', '') || 'index';
  var pageLabel = MODULE_LABELS[moduleId] || moduleId;

  // ── Charger le script Tally ────────────────────────────────────
  if (!document.querySelector('script[src*="tally.so/widgets/embed.js"]')) {
    var s = document.createElement('script');
    s.src = 'https://tally.so/widgets/embed.js';
    s.async = true;
    document.head.appendChild(s);
  }

  // ── Style print : cacher le bouton a l'impression ──────────────
  var style = document.createElement('style');
  style.textContent =
    '#cgp-feedback-btn{position:fixed;bottom:20px;right:20px;padding:10px 16px;background:#D4622A;color:#fff;border:none;border-radius:24px;font-family:Inter,sans-serif;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.18);z-index:9999;display:inline-flex;align-items:center;gap:8px;transition:background 0.15s,transform 0.15s}' +
    '#cgp-feedback-btn:hover{background:#B8511F;transform:translateY(-2px)}' +
    '#cgp-feedback-btn svg{flex-shrink:0}' +
    '@media print{#cgp-feedback-btn{display:none!important}}' +
    '@media (max-width:640px){#cgp-feedback-btn{padding:10px 14px;font-size:12px;bottom:14px;right:14px}#cgp-feedback-btn span{display:none}}';
  document.head.appendChild(style);

  // ── Bouton flottant ────────────────────────────────────────────
  function injectButton() {
    if (document.getElementById('cgp-feedback-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'cgp-feedback-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Laisser un retour');
    btn.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
      '<span>Feedback</span>';

    btn.addEventListener('click', function() {
      // Tally pas encore charge ?
      if (typeof window.Tally === 'undefined') {
        // Fallback : ouvrir le form dans un nouvel onglet
        window.open('https://tally.so/r/' + TALLY_FORM_ID + '?page=' + encodeURIComponent(pageLabel), '_blank');
        return;
      }
      window.Tally.openPopup(TALLY_FORM_ID, {
        layout: 'modal',
        width: 600,
        autoClose: 2000,
        hiddenFields: {
          page: pageLabel
        }
      });
    });

    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }
})();
