/*
 * CGP SKOOL - Actions partagees (sidebar + nav)
 * Usage: <script src="cgp-skool-nav.js" defer></script>
 * Requires: cgp-skool-core.js, cgp-skool-layout.css
 *
 * Injecte automatiquement :
 *  - Bouton Accueil dans la barre du haut (.cs-nav)
 *  - Boutons PDF / Sauver / Charger / Guide dans la sidebar module (.cs-sidebar)
 *
 * La barre du haut doit contenir : <div id="cs-nav-actions"></div>
 * La sidebar module doit contenir : <div id="cs-sidebar-actions"></div>
 * (si absent, les boutons sont crees automatiquement en bas de .cs-sidebar)
 */
(function() {
  'use strict';

  /* ── GUIDES PAR MODULE ────────────────────────── */
  var GUIDES = {
    'etude-dossier':       'Importez un RI Word ou saisissez les donnees client. Parcourez les sections (Situation, Patrimoine, Fiscal, Retraite...) puis exportez le PDF complet.',
    'per-vs-av':           'Comparez l\'efficacite nette entre PER et AV selon la TMI d\'entree et de sortie. Ajustez l\'horizon et le montant pour voir la matrice.',
    'scpi-simulator':      'Selectionnez une SCPI ou configurez un rendement personnalise. Visualisez la projection de capital, revenus et fiscalite sur votre horizon.',
    'scpi-financement':    'Simulez un investissement SCPI a credit. Configurez le montant, la duree, le taux et visualisez le levier bancaire et le rendement net.',
    'immo-simulator':      'Simulez un investissement LMNP (mono, colocation ou residence services). Visualisez l\'amortissement, le cashflow et la rentabilite nette.',
    'interets-composes':   'Configurez le capital initial, les versements periodiques, le taux et les frais. Visualisez la capitalisation sur votre horizon.',
    'simulateur-avance-av':'Simulez une avance sur votre contrat AV (60% max). Activez l\'option SCPI pour voir comment autofinancer l\'avance.',
    'etude-transfert-per': 'Comparez l\'allocation actuelle et recommandee de votre PER. Visualisez le gain et le delai de recuperation des frais de transfert.',
    'bp-simulator':        'Projetez votre progression dans le reseau Prodemial. Configurez vos objectifs CA et visualisez les qualifications PMR.',
    'equipe-builder':      'Ajoutez vos collaborateurs, suivez les statuts et qualifications, visualisez l\'organigramme de votre equipe.',
    'comparatif-cgp':      'Comparez les 3 modeles CGP (reseau, hybride, honoraires). Visualisez les frais documentes et simulez le cout client.'
  };

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var moduleId = currentPage.replace('.html', '');
  var guideText = GUIDES[moduleId] || '';

  /* ── BOUTONS SIDEBAR ──────────────────────────── */
  function buildSidebarActions() {
    // Si le module a sa propre fonction exportPDF(), l'utiliser (ex: etude-dossier)
    var pdfAction = 'typeof exportPDF===\"function\"?exportPDF():CGP.pdf.print()';
    var html = '<div class="cs-sidebar-actions">';
    html += '<button class="cs-sidebar-btn" onclick="' + pdfAction + '">\uD83D\uDCC4 Exporter PDF</button>';
    html += '<button class="cs-sidebar-btn" onclick="CGP.project.exportAll()">\uD83D\uDCBE Sauvegarder</button>';
    html += '<label class="cs-sidebar-btn" style="cursor:pointer">\uD83D\uDCC2 Charger'
          + '<input type="file" accept=".json" onchange="CGP.project.importAll(this.files[0]);this.value=\'\'" style="position:absolute;opacity:0;width:0;height:0">'
          + '</label>';
    if (guideText) {
      html += '<button class="cs-sidebar-btn cs-sidebar-guide" onclick="CGP.nav.toggleGuide()">\u2753 Guide</button>';
    }
    html += '</div>';
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
    panel = document.createElement('div');
    panel.id = 'cgp-guide-panel';
    panel.className = 'cgp-guide-panel';
    panel.innerHTML = '<div class="cgp-guide-inner">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">'
      + '<div style="font-size:14px;font-weight:700;color:#0D0D0D">\u2753 Guide</div>'
      + '<button onclick="document.getElementById(\'cgp-guide-panel\').style.display=\'none\'" style="background:none;border:none;font-size:18px;cursor:pointer;color:#6B6B6B">\u2715</button>'
      + '</div>'
      + '<div style="font-size:13px;color:#3A3A3A;line-height:1.8">' + guideText + '</div>'
      + '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #EDE8DF;font-size:11px;color:#6B6B6B;line-height:1.6">'
      + '<strong>Boutons :</strong><br>'
      + '\uD83D\uDCC4 PDF : exporte la page en PDF<br>'
      + '\uD83D\uDCBE Sauver : sauvegarde l\'etat de tous les modules en JSON<br>'
      + '\uD83D\uDCC2 Charger : restaure un projet depuis un fichier JSON'
      + '</div>'
      + '</div>';
    document.body.appendChild(panel);
  };

  /* ── INJECTION ────────────────────────────────── */
  function init() {
    // 1. Barre du haut : juste le bouton Accueil
    var navSlot = document.getElementById('cs-nav-actions');
    if (navSlot) {
      navSlot.className = 'cs-nav-actions';
      navSlot.innerHTML = '<a class="cs-nav-btn" href="index.html" title="Retour accueil">\u2190 Accueil</a>';
    }

    // 2. Sidebar : boutons PDF / Sauver / Charger / Guide
    var sidebarSlot = document.getElementById('cs-sidebar-actions');
    if (sidebarSlot) {
      sidebarSlot.innerHTML = buildSidebarActions();
    } else {
      // Fallback : inserer en bas de la premiere sidebar trouvee
      var sidebar = document.querySelector('.cs-sidebar') || document.querySelector('.sidebar');
      if (sidebar) {
        var div = document.createElement('div');
        div.id = 'cs-sidebar-actions';
        div.innerHTML = buildSidebarActions();
        sidebar.appendChild(div);
      } else {
        // Pas de sidebar : mettre les boutons dans la barre du haut
        if (navSlot) {
          navSlot.innerHTML += buildSidebarActions().replace(/cs-sidebar-btn/g, 'cs-nav-btn').replace(/cs-sidebar-actions/g, 'cs-nav-actions-extra').replace(/cs-sidebar-guide/g, 'cs-nav-btn');
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
