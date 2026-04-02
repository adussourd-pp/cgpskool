/*
 * CGP SKOOL - Actions partagees
 * Usage: <script src="cgp-skool-nav.js" defer></script>
 * Requires: cgp-skool-core.js, cgp-skool-layout.css
 *
 * Injecte automatiquement :
 *  - Bouton Accueil + Guide dans la barre du haut
 *  - Boutons PDF / Sauver / Charger en bas de la sidebar
 *    (SAUF si la sidebar a deja des boutons .btn ou .sidebar-btn)
 */
(function() {
  'use strict';

  var GUIDES = {
    'etude-dossier':       { title: 'Etude de Dossier',      intro: 'Analysez la situation patrimoniale complete de votre client.', steps: ['Importez le RI Word ou saisissez les donnees manuellement','Parcourez chaque section : Situation, Patrimoine, Fiscal, Retraite...','Ajoutez vos preconisations dans le panneau conseiller','Cochez les sections a inclure dans le PDF','Cliquez Exporter PDF pour generer le document client'], tips: ['Le profil conseiller se configure depuis la page Accueil','Sauvegardez regulierement votre etude'] },
    'per-vs-av':           { title: 'PER vs Assurance Vie',   intro: 'Comparez l\'efficacite nette entre PER et AV.', steps: ['Selectionnez la TMI d\'entree et de sortie','Ajustez le montant et l\'horizon','Consultez la matrice et le calcul detaille'], tips: ['Le PER est plus avantageux quand la TMI baisse a la retraite'] },
    'scpi-simulator':      { title: 'SCPI Cash',              intro: 'Simulez un investissement SCPI comptant.', steps: ['Selectionnez une SCPI ou configurez un rendement','Ajustez le montant, l\'horizon et la TMI','Visualisez la projection de capital et revenus'], tips: ['Le mode Nue-propriete permet de simuler un demembrement'] },
    'scpi-financement':    { title: 'SCPI Financement',       intro: 'Simulez un investissement SCPI a credit.', steps: ['Choisissez la banque partenaire','Configurez le montant, la duree et le taux','Ajoutez les SCPI','Visualisez le levier et le rendement net'], tips: ['Le differe d\'amortissement reduit les mensualites initiales'] },
    'immo-simulator':      { title: 'Immobilier locatif',     intro: 'Simulez un investissement LMNP.', steps: ['Choisissez le type : mono, colocation ou residence services','Renseignez le prix, loyers, charges et financement','Visualisez amortissement, cashflow et rentabilite'], tips: ['La reserve de tresorerie est calculee automatiquement'] },
    'interets-composes':   { title: 'Interets composes',      intro: 'Visualisez l\'effet de la capitalisation.', steps: ['Configurez capital initial et versements periodiques','Ajustez le taux et les frais','Choisissez la fiscalite (PFU ou bareme)','Consultez le graphique annee par annee'], tips: ['Les frais de gestion impactent significativement le resultat'] },
    'simulateur-avance-av':{ title: 'Avance sur Assurance Vie',intro: 'Simulez une avance sur votre contrat AV.', steps: ['Renseignez la valeur du contrat et le rendement','Ajustez le taux d\'avance et la duree','Activez l\'option SCPI pour autofinancer','Consultez le bilan annee par annee'], tips: ['L\'avance est limitee a 60% de la valeur du contrat'] },
    'etude-transfert-per': { title: 'Transfert PER',          intro: 'Analysez l\'interet d\'un transfert de PER.', steps: ['Selectionnez le type de PER actuel','Renseignez capital et allocations','Ajustez les frais de transfert et d\'entree','Visualisez breakeven et projection'], tips: ['Les frais de transfert sont nuls apres un certain nombre d\'annees'] },
    'bp-simulator':        { title: 'Business Plan',          intro: 'Projetez votre progression Prodemial.', steps: ['Renseignez votre CA et vos objectifs','Configurez la taille de votre equipe','Visualisez qualifications PMR et commissions'], tips: ['Les qualifications dependent du CA cumule et de l\'equipe'] },
    'equipe-builder':      { title: 'Construire son equipe',  intro: 'Gerez votre equipe et organigramme.', steps: ['Ajoutez vos collaborateurs','Definissez statuts et qualifications','Consultez l\'organigramme'], tips: ['Cliquez sur un membre pour modifier ses informations'] },
    'comparatif-cgp':      { title: 'Notre positionnement',   intro: 'Comparez les 3 modeles CGP.', steps: ['Parcourez les sections : marche, gamme, frais','Consultez le comparatif des 3 modeles','Utilisez le simulateur de cout client'], tips: ['Le simulateur montre l\'impact des frais sur le long terme'] }
  };

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var moduleId = currentPage.replace('.html', '');
  var guide = GUIDES[moduleId];

  /* ── GUIDE PANEL ──────────────────────────────── */
  CGP.nav = CGP.nav || {};
  CGP.nav.toggleGuide = function() {
    var panel = document.getElementById('cgp-guide-panel');
    if (panel) { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; return; }
    if (!guide) return;
    panel = document.createElement('div');
    panel.id = 'cgp-guide-panel';
    panel.className = 'cgp-guide-panel';
    var h = '<div class="cgp-guide-inner">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">';
    h += '<div style="font-size:15px;font-weight:700;color:#0D0D0D">' + guide.title + '</div>';
    h += '<button onclick="document.getElementById(\'cgp-guide-panel\').style.display=\'none\'" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6B6B6B">\u2715</button></div>';
    h += '<div style="font-size:13px;color:#3A3A3A;line-height:1.7;margin-bottom:20px">' + guide.intro + '</div>';
    h += '<div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6B6B6B;margin-bottom:8px">Etapes</div>';
    h += '<ol style="margin:0 0 20px;padding-left:20px;font-size:12px;color:#3A3A3A;line-height:2">';
    guide.steps.forEach(function(s) { h += '<li>' + s + '</li>'; });
    h += '</ol>';
    if (guide.tips && guide.tips.length) {
      h += '<div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6B6B6B;margin-bottom:8px">Astuces</div>';
      h += '<ul style="margin:0;padding-left:18px;font-size:12px;color:#6B6B6B;line-height:2;list-style:none">';
      guide.tips.forEach(function(t) { h += '<li>\uD83D\uDCA1 ' + t + '</li>'; });
      h += '</ul>';
    }
    h += '</div>';
    panel.innerHTML = h;
    document.body.appendChild(panel);
  };

  /* ── INJECTION BOUTONS SIDEBAR ────────────────── */
  function injectSidebarButtons() {
    var sidebar = document.querySelector('.cs-sidebar') || document.querySelector('.sidebar');
    if (!sidebar) return false;
    // Ne pas injecter si la sidebar a deja des boutons d'action (mais retourner true = pas de fallback)
    if (sidebar.querySelector('.btn-success,.sidebar-btn,.cs-sidebar-btn,.sim-btn,.btn-sim,.btn-calc')) return true;

    var div = document.createElement('div');
    div.className = 'cs-sidebar-actions';

    var btnPdf = document.createElement('button');
    btnPdf.className = 'cs-sidebar-btn cs-sidebar-btn-primary';
    btnPdf.textContent = '\u2B07 Exporter PDF';
    btnPdf.onclick = function() { typeof exportPDF === 'function' ? exportPDF() : CGP.pdf.print(); };

    var btnSave = document.createElement('button');
    btnSave.className = 'cs-sidebar-btn';
    btnSave.textContent = '\uD83D\uDCBE Sauvegarder';
    btnSave.onclick = function() { typeof sauvegarderEtude === 'function' ? sauvegarderEtude() : CGP.project.exportAll(); };

    var lblLoad = document.createElement('label');
    lblLoad.className = 'cs-sidebar-btn';
    lblLoad.style.cursor = 'pointer';
    lblLoad.textContent = '\uD83D\uDCC2 Charger';
    var inputLoad = document.createElement('input');
    inputLoad.type = 'file';
    inputLoad.accept = '.json';
    inputLoad.style.cssText = 'position:absolute;opacity:0;width:0;height:0';
    inputLoad.onchange = function() {
      typeof chargerEtude === 'function' ? chargerEtude(this) : CGP.project.importAll(this.files[0]);
      this.value = '';
    };
    lblLoad.appendChild(inputLoad);

    div.appendChild(btnPdf);
    div.appendChild(btnSave);
    div.appendChild(lblLoad);
    sidebar.appendChild(div);
    return true;
  }

  /* ── INJECTION ────────────────────────────────── */
  var _initialized = false;
  function init() {
    if (_initialized) return;
    _initialized = true;
    // 1. Barre du haut : Accueil + Guide
    var navSlot = document.getElementById('cs-nav-actions');
    if (navSlot) {
      var html = '<a class="cs-nav-btn" href="index.html">\u2190 Accueil</a>';
      if (guide) html += '<button class="cs-nav-btn" onclick="CGP.nav.toggleGuide()">\u2753 Guide</button>';
      navSlot.className = 'cs-nav-actions';
      navSlot.innerHTML = html;
    }

    // 2. Sidebar : boutons PDF / Sauver / Charger (seulement si pas deja presents)
    var injected = injectSidebarButtons();

    // 3. Fallback modules sans sidebar : boutons dans la barre du haut
    if (!injected && navSlot) {
      var bp = document.createElement('button');
      bp.className = 'cs-nav-btn';
      bp.textContent = '\uD83D\uDCC4 PDF';
      bp.onclick = function() { typeof exportPDF === 'function' ? exportPDF() : CGP.pdf.print(); };
      navSlot.appendChild(bp);

      var bs = document.createElement('button');
      bs.className = 'cs-nav-btn';
      bs.textContent = '\uD83D\uDCBE Sauver';
      bs.onclick = function() { typeof sauvegarderEtude === 'function' ? sauvegarderEtude() : CGP.project.exportAll(); };
      navSlot.appendChild(bs);

      var bl = document.createElement('label');
      bl.className = 'cs-nav-btn';
      bl.style.cursor = 'pointer';
      bl.textContent = '\uD83D\uDCC2 Charger';
      var il = document.createElement('input');
      il.type = 'file'; il.accept = '.json';
      il.style.cssText = 'position:absolute;opacity:0;width:0;height:0';
      il.onchange = function() {
        typeof chargerEtude === 'function' ? chargerEtude(this) : CGP.project.importAll(this.files[0]);
        this.value = '';
      };
      bl.appendChild(il);
      navSlot.appendChild(bl);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
