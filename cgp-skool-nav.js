/*
 * CGP SKOOL - Navigation partagee
 * Usage: <script src="cgp-skool-nav.js" defer></script>
 * Requires: cgp-skool-core.js, cgp-skool-layout.css
 *
 * Injecte automatiquement :
 *  - La sidebar de navigation (tous les modules)
 *  - Les boutons Export PDF / Sauvegarder / Charger projet
 *  - Le hamburger mobile
 *
 * Chaque module doit avoir dans son HTML :
 *   <div class="cgp-app">
 *     <nav id="cgp-nav-slot"></nav>
 *     <div class="cgp-module"> ... contenu ... </div>
 *   </div>
 */
(function() {
  'use strict';

  /* ── REGISTRE DES MODULES ─────────────────────── */
  var MODULES = [
    { cat: 'Outils patrimoniaux' },
    { id: 'etude-dossier',       icon: '\uD83D\uDCCB', name: 'Etude de Dossier',        href: 'etude-dossier.html' },
    { id: 'per-vs-av',           icon: '\u2696\uFE0F',  name: 'PER vs Assurance Vie',    href: 'per-vs-av.html' },
    { id: 'scpi-simulator',      icon: '\uD83D\uDCC8', name: 'SCPI Cash',                href: 'scpi-simulator.html' },
    { id: 'scpi-financement',    icon: '\uD83C\uDFE6', name: 'SCPI Financement',         href: 'scpi-financement.html' },
    { id: 'immo-simulator',      icon: '\uD83C\uDFE0', name: 'Immobilier locatif',       href: 'immo-simulator.html' },
    { id: 'interets-composes',   icon: '\uD83E\uDDEE', name: 'Interets composes',        href: 'interets-composes.html' },
    { id: 'simulateur-avance-av',icon: '\uD83C\uDFE7', name: 'Avance sur AV',            href: 'simulateur-avance-av.html' },
    { id: 'etude-transfert-per', icon: '\uD83D\uDD04', name: 'Transfert PER',            href: 'etude-transfert-per.html' },

    { cat: 'Organisation' },
    { id: 'bp-simulator',        icon: '\uD83D\uDCC8', name: 'Business Plan',            href: 'bp-simulator.html' },
    { id: 'equipe-builder',      icon: '\uD83D\uDC65', name: 'Construire son equipe',    href: 'equipe-builder.html' },
    { id: 'comparatif-cgp',      icon: '\u2696\uFE0F',  name: 'Notre positionnement',    href: 'comparatif-cgp.html' }
  ];

  /* ── DETECTION PAGE COURANTE ──────────────────── */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  /* ── CONSTRUCTION HTML ────────────────────────── */
  function buildSidebar() {
    var html = '';

    MODULES.forEach(function(m) {
      if (m.cat) {
        html += '<div class="cgp-nav-category">' + m.cat + '</div>';
        return;
      }
      var isActive = currentPage === m.href;
      html += '<a class="cgp-nav-item' + (isActive ? ' active' : '') + '" href="' + m.href + '">'
            + '<span class="nav-icon">' + m.icon + '</span>'
            + '<span>' + m.name + '</span>'
            + '</a>';
    });

    // Spacer
    html += '<div class="cgp-nav-spacer"></div>';

    // Action buttons
    html += '<div class="cgp-nav-actions">';
    html += '<button class="cgp-nav-action" onclick="CGP.pdf.print()" title="Exporter en PDF">'
          + '<span class="nav-icon">\uD83D\uDCC4</span> Exporter PDF</button>';
    html += '<button class="cgp-nav-action" onclick="CGP.project.exportAll()" title="Sauvegarder le projet">'
          + '<span class="nav-icon">\uD83D\uDCBE</span> Sauvegarder</button>';
    html += '<label class="cgp-nav-action" title="Charger un projet">'
          + '<span class="nav-icon">\uD83D\uDCC2</span> Charger'
          + '<input type="file" accept=".json" onchange="CGP.project.importAll(this.files[0]);this.value=\'\'">'
          + '</label>';
    html += '</div>';

    return html;
  }

  /* ── INJECTION ────────────────────────────────── */
  function init() {
    var slot = document.getElementById('cgp-nav-slot');
    if (!slot) return;

    // Create sidebar element
    slot.className = 'cgp-nav-sidebar';
    slot.innerHTML = buildSidebar();

    // Add hamburger toggle to cs-nav for mobile
    var csNav = document.querySelector('.cs-nav-inner');
    if (csNav) {
      var toggle = document.createElement('button');
      toggle.className = 'cgp-nav-toggle';
      toggle.innerHTML = '\u2630';
      toggle.onclick = function() {
        slot.classList.toggle('open');
      };
      csNav.insertBefore(toggle, csNav.firstChild);
    }

    // Close sidebar on click outside (mobile)
    document.addEventListener('click', function(e) {
      if (slot.classList.contains('open') && !slot.contains(e.target) && !e.target.classList.contains('cgp-nav-toggle')) {
        slot.classList.remove('open');
      }
    });
  }

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
