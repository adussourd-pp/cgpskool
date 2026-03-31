/*
 * CGP SKOOL - Barre de navigation partagee
 * Usage: <script src="cgp-skool-nav.js" defer></script>
 * Requires: cgp-skool-core.js, cgp-skool-layout.css
 *
 * Injecte automatiquement dans la barre .cs-nav :
 *  - Bouton Accueil (retour index.html)
 *  - Boutons Export PDF / Sauvegarder / Charger projet
 *  - Bouton Guide (ouvre un panneau d'aide)
 *
 * Chaque module doit avoir dans son HTML :
 *   <nav class="cs-nav">
 *     <div class="cs-nav-inner">
 *       <a class="cs-logo" href="index.html">...</a>
 *       <div style="flex:1"></div>
 *       <div id="cs-nav-actions"></div>
 *     </div>
 *   </nav>
 */
(function() {
  'use strict';

  /* ── REGISTRE DES MODULES (pour le guide) ─────── */
  var MODULES = {
    'etude-dossier':       { name: 'Etude de Dossier',     guide: 'Importez un RI Word ou saisissez les donnees client. Parcourez les sections (Situation, Patrimoine, Fiscal, Retraite...) puis exportez le PDF complet.' },
    'per-vs-av':           { name: 'PER vs Assurance Vie',  guide: 'Comparez l\'efficacite nette entre PER et AV selon la TMI d\'entree et de sortie. Ajustez l\'horizon et le montant pour voir la matrice.' },
    'scpi-simulator':      { name: 'SCPI Cash',             guide: 'Selectionnez une SCPI ou configurez un rendement personnalise. Visualisez la projection de capital, revenus et fiscalite sur votre horizon.' },
    'scpi-financement':    { name: 'SCPI Financement',      guide: 'Simulez un investissement SCPI a credit. Configurez le montant, la duree, le taux et visualisez le levier bancaire et le rendement net.' },
    'immo-simulator':      { name: 'Immobilier locatif',    guide: 'Simulez un investissement LMNP (mono, colocation ou residence services). Visualisez l\'amortissement, le cashflow et la rentabilite nette.' },
    'interets-composes':   { name: 'Interets composes',     guide: 'Configurez le capital initial, les versements periodiques, le taux et les frais. Visualisez la capitalisation sur votre horizon.' },
    'simulateur-avance-av':{ name: 'Avance sur AV',         guide: 'Simulez une avance sur votre contrat AV (60% max). Activez l\'option SCPI pour voir comment autofinancer l\'avance.' },
    'etude-transfert-per': { name: 'Transfert PER',         guide: 'Comparez l\'allocation actuelle et recommandee de votre PER. Visualisez le gain et le delai de recuperation des frais de transfert.' },
    'bp-simulator':        { name: 'Business Plan',         guide: 'Projetez votre progression dans le reseau Prodemial. Configurez vos objectifs CA et visualisez les qualifications PMR.' },
    'equipe-builder':      { name: 'Construire son equipe', guide: 'Ajoutez vos collaborateurs, suivez les statuts et qualifications, visualisez l\'organigramme de votre equipe.' },
    'comparatif-cgp':      { name: 'Notre positionnement',  guide: 'Comparez les 3 modeles CGP (reseau, hybride, honoraires). Visualisez les frais documentes et simulez le cout client.' }
  };

  /* ── DETECTION PAGE COURANTE ──────────────────── */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var moduleId = currentPage.replace('.html', '');
  var moduleInfo = MODULES[moduleId];

  /* ── CONSTRUCTION DES BOUTONS ─────────────────── */
  function buildActions() {
    var html = '';
    html += '<a class="cs-nav-btn" href="index.html" title="Retour accueil">\u2190 Accueil</a>';
    html += '<button class="cs-nav-btn" onclick="CGP.pdf.print()" title="Exporter en PDF">\uD83D\uDCC4 PDF</button>';
    html += '<button class="cs-nav-btn" onclick="CGP.project.exportAll()" title="Sauvegarder le projet">\uD83D\uDCBE Sauver</button>';
    html += '<label class="cs-nav-btn" title="Charger un projet" style="cursor:pointer">\uD83D\uDCC2 Charger'
          + '<input type="file" accept=".json" onchange="CGP.project.importAll(this.files[0]);this.value=\'\'" style="position:absolute;opacity:0;width:0;height:0">'
          + '</label>';
    if (moduleInfo && moduleInfo.guide) {
      html += '<button class="cs-nav-btn cs-nav-guide" onclick="CGP.nav.toggleGuide()" title="Guide du module">\u2753 Guide</button>';
    }
    return html;
  }

  /* ── GUIDE PANEL ──────────────────────────────── */
  CGP.nav = CGP.nav || {};
  CGP.nav.toggleGuide = function() {
    var panel = document.getElementById('cgp-guide-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      return;
    }
    // Create panel
    panel = document.createElement('div');
    panel.id = 'cgp-guide-panel';
    panel.className = 'cgp-guide-panel';
    panel.innerHTML = '<div class="cgp-guide-inner">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">'
      + '<div style="font-size:14px;font-weight:700;color:#181614">Guide : ' + (moduleInfo ? moduleInfo.name : '') + '</div>'
      + '<button onclick="document.getElementById(\'cgp-guide-panel\').style.display=\'none\'" style="background:none;border:none;font-size:18px;cursor:pointer;color:#6B6B6B">\u2715</button>'
      + '</div>'
      + '<div style="font-size:13px;color:#3A3A3A;line-height:1.8">' + (moduleInfo ? moduleInfo.guide : '') + '</div>'
      + '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #EDE8DF;font-size:11px;color:#6B6B6B;line-height:1.6">'
      + '<strong>Raccourcis :</strong><br>'
      + '\uD83D\uDCC4 PDF : exporte la page en PDF via le dialogue d\'impression<br>'
      + '\uD83D\uDCBE Sauver : exporte l\'etat de tous les modules en fichier JSON<br>'
      + '\uD83D\uDCC2 Charger : restaure un projet depuis un fichier JSON'
      + '</div>'
      + '</div>';
    document.body.appendChild(panel);
  };

  /* ── INJECTION ────────────────────────────────── */
  function init() {
    // Inject action buttons into cs-nav
    var slot = document.getElementById('cs-nav-actions');
    if (!slot) {
      // Fallback: create the actions div inside cs-nav-inner
      var navInner = document.querySelector('.cs-nav-inner');
      if (!navInner) return;
      slot = document.createElement('div');
      slot.id = 'cs-nav-actions';
      navInner.appendChild(slot);
    }
    slot.className = 'cs-nav-actions';
    slot.innerHTML = buildActions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
