/*
 * CGP SKOOL - Actions partagees (sidebar + nav)
 * Usage: <script src="cgp-skool-nav.js" defer></script>
 * Requires: cgp-skool-core.js, cgp-skool-layout.css
 *
 * Injecte automatiquement :
 *  - Bouton Accueil dans la barre du haut
 *  - Boutons PDF / Sauver / Charger / Guide en bas de la sidebar
 *  - Panneau Guide avec contenu structure par module
 */
(function() {
  'use strict';

  /* ── GUIDES STRUCTURES PAR MODULE ─────────────── */
  var GUIDES = {
    'etude-dossier': {
      title: 'Etude de Dossier',
      intro: 'Analysez la situation patrimoniale complete de votre client.',
      steps: [
        'Importez le RI Word ou saisissez les donnees manuellement',
        'Parcourez chaque section : Situation, Patrimoine, Fiscal, Retraite...',
        'Ajoutez vos preconisations dans le panneau conseiller',
        'Cochez les sections a inclure dans le PDF',
        'Cliquez Exporter PDF pour generer le document client'
      ],
      tips: [
        'Le profil conseiller se configure depuis la page Accueil',
        'Les commentaires libres sont visibles dans le PDF si actives',
        'Sauvegardez regulierement votre etude avec le bouton Sauvegarder'
      ]
    },
    'per-vs-av': {
      title: 'PER vs Assurance Vie',
      intro: 'Comparez l\'efficacite nette entre PER et AV.',
      steps: [
        'Selectionnez la TMI d\'entree (actuelle) et de sortie (retraite)',
        'Ajustez le montant du versement et l\'horizon',
        'Consultez la matrice et le calcul detaille'
      ],
      tips: [
        'Le PER est plus avantageux quand la TMI baisse a la retraite',
        'L\'AV gagne si la TMI reste stable ou augmente'
      ]
    },
    'scpi-simulator': {
      title: 'SCPI Cash',
      intro: 'Simulez un investissement SCPI comptant.',
      steps: [
        'Selectionnez une SCPI ou configurez un rendement personnalise',
        'Ajustez le montant, l\'horizon et la TMI',
        'Visualisez la projection de capital et revenus'
      ],
      tips: [
        'Le mode Nue-propriete permet de simuler un demembrement',
        'Comparez plusieurs SCPI en changeant la selection'
      ]
    },
    'scpi-financement': {
      title: 'SCPI Financement',
      intro: 'Simulez un investissement SCPI a credit.',
      steps: [
        'Choisissez la banque partenaire (SOFIAP, CFCAL, CACF)',
        'Configurez le montant, la duree et le taux',
        'Ajoutez les SCPI a l\'investissement',
        'Visualisez le levier bancaire et le rendement net'
      ],
      tips: [
        'Le profil d\'endettement aide a determiner la capacite d\'emprunt',
        'Le differe d\'amortissement reduit les mensualites initiales'
      ]
    },
    'immo-simulator': {
      title: 'Immobilier locatif',
      intro: 'Simulez un investissement LMNP.',
      steps: [
        'Choisissez le type : mono, colocation ou residence services',
        'Renseignez le prix, les loyers, les charges et le financement',
        'Visualisez l\'amortissement, le cashflow et la rentabilite'
      ],
      tips: [
        'Le mode colocation genere souvent un meilleur rendement brut',
        'La reserve de tresorerie est calculee automatiquement'
      ]
    },
    'interets-composes': {
      title: 'Interets composes',
      intro: 'Visualisez l\'effet de la capitalisation dans le temps.',
      steps: [
        'Configurez le capital initial et les versements periodiques',
        'Ajustez le taux de rendement et les frais',
        'Choisissez la fiscalite (PFU ou bareme progressif)',
        'Consultez le graphique et le tableau annee par annee'
      ],
      tips: [
        'Les frais de gestion impactent significativement le resultat final',
        'Comparez PFU vs bareme pour optimiser la fiscalite'
      ]
    },
    'simulateur-avance-av': {
      title: 'Avance sur Assurance Vie',
      intro: 'Simulez une avance sur votre contrat AV.',
      steps: [
        'Renseignez la valeur du contrat et le rendement',
        'Ajustez le taux d\'avance et la duree',
        'Activez l\'option SCPI pour autofinancer l\'avance',
        'Consultez le bilan et le tableau annee par annee'
      ],
      tips: [
        'L\'avance est limitee a 60% de la valeur du contrat',
        'Les loyers SCPI peuvent couvrir le cout de l\'avance'
      ]
    },
    'etude-transfert-per': {
      title: 'Etude de transfert PER',
      intro: 'Analysez l\'interet d\'un transfert de PER.',
      steps: [
        'Selectionnez le type de PER actuel',
        'Renseignez le capital et les allocations actuelle/recommandee',
        'Ajustez les frais de transfert et d\'entree',
        'Visualisez le breakeven et la projection'
      ],
      tips: [
        'Les frais de transfert sont nuls apres un certain nombre d\'annees',
        'Le graphique montre quand le nouveau PER depasse l\'ancien'
      ]
    },
    'bp-simulator': {
      title: 'Business Plan',
      intro: 'Projetez votre progression dans le reseau Prodemial.',
      steps: [
        'Renseignez votre CA actuel et vos objectifs',
        'Configurez la taille de votre equipe',
        'Visualisez les qualifications PMR et les commissions'
      ],
      tips: [
        'Les qualifications PMR dependent du CA cumule et de l\'equipe',
        'Le graphique montre l\'evolution sur la duree du plan'
      ]
    },
    'equipe-builder': {
      title: 'Construire son equipe',
      intro: 'Gerez votre equipe et visualisez l\'organigramme.',
      steps: [
        'Ajoutez vos collaborateurs avec leur statut',
        'Definissez les qualifications et objectifs',
        'Consultez l\'organigramme genere automatiquement'
      ],
      tips: [
        'L\'export JSON sauvegarde toute la structure de l\'equipe',
        'Cliquez sur un membre pour modifier ses informations'
      ]
    },
    'comparatif-cgp': {
      title: 'Notre positionnement',
      intro: 'Comparez les 3 modeles CGP du marche.',
      steps: [
        'Parcourez les sections : marche, gamme, frais',
        'Consultez le comparatif des 3 modeles',
        'Utilisez le simulateur de cout client'
      ],
      tips: [
        'Le simulateur montre l\'impact des frais sur le long terme',
        'Les donnees de frais sont documentees et sourcees'
      ]
    }
  };

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var moduleId = currentPage.replace('.html', '');
  var guide = GUIDES[moduleId];

  /* ── BOUTONS SIDEBAR ──────────────────────────── */
  function buildSidebarActions() {
    // Detecter les fonctions custom du module
    var pdfAction = 'typeof exportPDF==="function"?exportPDF():CGP.pdf.print()';
    var saveAction = 'typeof sauvegarderEtude==="function"?sauvegarderEtude():CGP.project.exportAll()';
    var saveLabel = '\uD83D\uDCBE Sauvegarder';

    var html = '<div class="cs-sidebar-actions">';
    html += '<button class="cs-sidebar-btn cs-sidebar-btn-primary" onclick="' + pdfAction + '">\uD83D\uDCC4 Exporter PDF</button>';
    html += '<button class="cs-sidebar-btn" onclick="' + saveAction + '">' + saveLabel + '</button>';
    // Charger : detecter chargerEtude (input file specifique) ou CGP.project.importAll
    html += '<label class="cs-sidebar-btn" style="cursor:pointer">\uD83D\uDCC2 Charger'
          + '<input type="file" accept=".json" onchange="typeof chargerEtude===\'function\'?chargerEtude(this):CGP.project.importAll(this.files[0]);this.value=\'\'" style="position:absolute;opacity:0;width:0;height:0">'
          + '</label>';
    if (guide) {
      html += '<button class="cs-sidebar-btn cs-sidebar-guide" onclick="CGP.nav.toggleGuide()">\u2753 Guide</button>';
    }
    html += '</div>';
    return html;
  }

  /* ── CONSTRUCTION DU PANNEAU GUIDE ────────────── */
  function buildGuideHTML() {
    if (!guide) return '';
    var h = '';
    // Header
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">';
    h += '<div style="font-size:15px;font-weight:700;color:#0D0D0D">' + guide.title + '</div>';
    h += '<button onclick="document.getElementById(\'cgp-guide-panel\').style.display=\'none\'" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6B6B6B;padding:0 4px">\u2715</button>';
    h += '</div>';
    // Intro
    h += '<div style="font-size:13px;color:#3A3A3A;line-height:1.7;margin-bottom:20px">' + guide.intro + '</div>';
    // Steps
    h += '<div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6B6B6B;margin-bottom:8px">Etapes</div>';
    h += '<ol style="margin:0 0 20px;padding-left:20px;font-size:12px;color:#3A3A3A;line-height:2">';
    guide.steps.forEach(function(s) { h += '<li>' + s + '</li>'; });
    h += '</ol>';
    // Tips
    if (guide.tips && guide.tips.length) {
      h += '<div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6B6B6B;margin-bottom:8px">Astuces</div>';
      h += '<ul style="margin:0 0 20px;padding-left:18px;font-size:12px;color:#6B6B6B;line-height:2;list-style:none">';
      guide.tips.forEach(function(t) { h += '<li>\uD83D\uDCA1 ' + t + '</li>'; });
      h += '</ul>';
    }
    // Buttons legend
    h += '<div style="padding-top:14px;border-top:1px solid #EDE8DF;font-size:11px;color:#6B6B6B;line-height:1.8">';
    h += '<strong>Boutons</strong><br>';
    h += '\uD83D\uDCC4 <strong>PDF</strong> \u2014 exporte la page au format A4<br>';
    h += '\uD83D\uDCBE <strong>Sauver</strong> \u2014 sauvegarde tout le projet en JSON<br>';
    h += '\uD83D\uDCC2 <strong>Charger</strong> \u2014 restaure un projet sauvegarde<br>';
    h += '\u2753 <strong>Guide</strong> \u2014 cette aide';
    h += '</div>';
    return h;
  }

  /* ── TOGGLE GUIDE ─────────────────────────────── */
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
    panel.innerHTML = '<div class="cgp-guide-inner">' + buildGuideHTML() + '</div>';
    document.body.appendChild(panel);
  };

  /* ── INJECTION ────────────────────────────────── */
  function init() {
    // 1. Barre du haut : bouton Accueil
    var navSlot = document.getElementById('cs-nav-actions');
    if (navSlot) {
      navSlot.className = 'cs-nav-actions';
      navSlot.innerHTML = '<a class="cs-nav-btn" href="index.html" title="Retour accueil">\u2190 Accueil</a>';
    }

    // 2. Sidebar : boutons en bas
    var sidebarSlot = document.getElementById('cs-sidebar-actions');
    if (sidebarSlot) {
      sidebarSlot.innerHTML = buildSidebarActions();
    } else {
      var sidebar = document.querySelector('.cs-sidebar') || document.querySelector('.sidebar');
      if (sidebar) {
        var div = document.createElement('div');
        div.id = 'cs-sidebar-actions';
        div.innerHTML = buildSidebarActions();
        sidebar.appendChild(div);
      } else {
        // Pas de sidebar : boutons dans la barre du haut
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
