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
    'etude-transfert-per': { title: 'Analyse contrat',        intro: 'Analysez un contrat existant et comparez-le si besoin a une AV recommandee.', steps: ['Selectionnez la famille et le type de contrat actuel','Ajoutez les fonds qui composent le contrat','Activez le comparatif pour presenter une AV recommandee (gestion + frais)','Visualisez les repartitions et la projection'], tips: ['Le comparatif est optionnel : vous pouvez n\'afficher que le contrat existant'] },
    'bp-simulator':        { title: 'Business Plan',          intro: 'Projetez votre progression Prodemial.', steps: ['Renseignez votre CA et vos objectifs','Configurez la taille de votre equipe','Visualisez qualifications PMR et commissions'], tips: ['Les qualifications dependent du CA cumule et de l\'equipe'] },
    'equipe-builder':      { title: 'Construire son equipe',  intro: 'Gerez votre equipe et organigramme.', steps: ['Ajoutez vos collaborateurs','Definissez statuts et qualifications','Consultez l\'organigramme'], tips: ['Cliquez sur un membre pour modifier ses informations'] },
    'allocation-cible':    { title: 'Allocation Cible',       intro: 'Calculez l\'allocation finale d\'une assurance vie apres dynamique progressive.', steps: ['Renseignez le versement brut et les frais d\'entree','Saisissez l\'allocation de depart et les montants a desinvestir','Definissez l\'allocation cible des nouveaux fonds','Visualisez l\'allocation finale apres execution du programme'], tips: ['Mode \"jusqu\'a epuisement\" : la duree est calculee automatiquement','La dynamique progressive ne supporte pas de frais d\'entree'] },
    'productivite':        { title: 'Productivite',            intro: 'Suivez votre activite quotidienne et visualisez votre score de productivite sur la semaine.', steps: ['Naviguer entre les semaines avec les fleches','Incrementez chaque action en cliquant +','Consultez le score 0-100 par jour et le recap hebdo','Ajustez le poids de chaque action dans la sidebar','Definissez votre objectif de points pour la semaine'], tips: ['Un score >= 75 = journee excellente (vert)','Le streak compte les jours consecutifs >= 30 pts'] },
    'suivi-contrat':       { title: 'Suivi de contrat',        intro: 'Generez une annexe de suivi structuree a partir d\'un export contrat (Proxeema, Ariane/Apicil), avec calcul du TRI annualise (XIRR).', steps: ['Collez l\'export complet de la fiche contrat dans la sidebar (le format est detecte automatiquement)','Cliquez sur Analyser l\'export','Completez ou corrigez les champs client / contrat si besoin','Redigez vos commentaires conseiller dans les zones editables','Exportez en PDF pour l\'inserer dans la fiche client'], tips: ['Sans historique des mouvements (Proxeema), le TRI est estime : versement initial + versements programmes reconstitues','Avec historique (Ariane/Apicil), le TRI exclut automatiquement OST, arbitrages et interets (flux internes)'] },
    'dossier-placement':   { title: 'Dossier Placement',       intro: 'Generez un dossier solution editable pour AV, PER, SCPI ou LMNP avec trame A4, frais et workflow.', steps: ['Choisissez le type : AV / PER / SCPI / LMNP','Renseignez le nom du client et la date','Cochez les blocs a afficher sur le dossier','Editez librement les zones de texte (accompagnement, contrat, gestion, frais)','Cochez les annexes projections disponibles'], tips: ['Chaque zone est contenteditable : cliquez pour modifier','Les projections sauvegardees dans les autres modules s\'ajoutent automatiquement'] },
    'udp-prep':            { title: 'Preparation UDP',          intro: 'Preparez chaque Universite du Patrimoine comme une campagne : objectifs chiffres, liste rechauffee, questions aux formateurs et modeles a suivre.', steps: ['Choisissez l\'edition et renseignez la date de l\'UDP','Fixez vos objectifs : R1 a fixer, invitations DM, appels de mise en action','Construisez votre liste et rechauffez-la avant le jour J (fils rouges Conquete client + Dev Action)','Preparez vos questions pour les consultants et formateurs qui vous inspirent','Identifiez 1 a 3 modeles et l\'horizon pour leur ressembler'], tips: ['Le score "Suis-je pret pour l\'UDP" se met a jour automatiquement','Notez vos contacts en prenom + initiale (RGPD)','Exportez le PDF et emportez-le a l\'UDP'] }
  };

  /* Stockage des donnees par module :
   *  'session' = donnees client en memoire uniquement (rien de conserve, sauvegarde = JSON manuel)
   *  'local'   = parametres memorises dans le localStorage du navigateur (cet appareil uniquement)
   * Par defaut : 'session' (RGPD). Seuls les outils internes sans donnees client persistent
   * (doit rester aligne avec CGP.project.PERSIST dans cgp-skool-core.js).
   * Aucun module n'envoie de donnees sur un serveur. */
  var DATA_KIND = {
    'bp-simulator': 'local',
    'equipe-builder': 'local',
    'productivite': 'local',
    'udp-prep': 'local'
  };
  var DATA_NOTES = {
    'session': 'Les donn&eacute;es du client ne quittent jamais votre navigateur : rien n\'est envoy&eacute; ni stock&eacute; sur un serveur. Elles restent en m&eacute;moire le temps de la session et sont effac&eacute;es &agrave; la fermeture de l\'onglet. Seul le fichier JSON que vous t&eacute;l&eacute;chargez vous-m&ecirc;me conserve l\'&eacute;tude : archivez-le dans votre propre syst&egrave;me.',
    'local': 'Aucune donn&eacute;e n\'est envoy&eacute;e sur un serveur : l\'outil fonctionne 100 % dans votre navigateur. Vos param&egrave;tres sont m&eacute;moris&eacute;s uniquement sur cet appareil (stockage local du navigateur) pour retrouver votre travail &agrave; la prochaine visite.'
  };

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var moduleId = currentPage.replace('.html', '');
  var guide = GUIDES[moduleId];

  function guideSeen() {
    try { return !!localStorage.getItem('cgpskool_guide_seen_' + moduleId); } catch(e) { return true; }
  }
  function markGuideSeen() {
    try { localStorage.setItem('cgpskool_guide_seen_' + moduleId, '1'); } catch(e) {}
    var b = document.getElementById('cgp-guide-btn');
    if (b) b.classList.remove('cgp-guide-attn');
  }

  /* ── GUIDE PANEL ──────────────────────────────── */
  CGP.nav = CGP.nav || {};
  CGP.nav.toggleGuide = function() {
    var panel = document.getElementById('cgp-guide-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      if (panel.style.display === 'block') markGuideSeen();
      return;
    }
    if (!guide) return;
    markGuideSeen();
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
    var kind = DATA_KIND[moduleId] || 'session';
    h += '<div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6B6B6B;margin:20px 0 8px">\uD83D\uDD12 Vos donn&eacute;es</div>';
    h += '<div class="cgp-guide-privacy">' + DATA_NOTES[kind] + '</div>';
    h += '<div class="cgp-guide-rgpd">\u2713 Conforme RGPD &mdash; aucune collecte, aucun cookie de suivi, aucune transmission &agrave; un serveur.</div>';
    h += '</div>';
    panel.innerHTML = h;
    document.body.appendChild(panel);
  };

  /* ── INJECTION BOUTONS SIDEBAR ────────────────── */
  /* D\u00e9sactiv\u00e9 : chaque module g\u00e8re son propre bouton (standard CLAUDE.md) */
  function injectSidebarButtons() {
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
      var homeHref = (window.location.pathname.indexOf('/modules/') !== -1 || window.location.pathname.indexOf('/articles/') !== -1) ? '../outils.html' : 'outils.html';
      var html = '<a class="cs-nav-btn" href="' + homeHref + '">\u2190 Accueil</a>';
      if (guide) html += '<button class="cs-nav-btn' + (guideSeen() ? '' : ' cgp-guide-attn') + '" id="cgp-guide-btn" onclick="CGP.nav.toggleGuide()">\u2753 Guide</button>';
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

  // Version discrète en bas de sidebar
  function injectVersion() {
    var sidebar = document.querySelector('.cs-sidebar');
    if (!sidebar) return;
    var v = document.createElement('div');
    v.style.cssText = 'margin-top:auto;padding-top:12px;font-size:9px;color:rgba(0,0,0,0.2);text-align:center;font-family:var(--sans)';
    v.textContent = 'v1.5 \u2014 21 juil. 2026';
    v.className = 'no-print';
    sidebar.appendChild(v);
  }

  function boot() {
    init();
    injectVersion();
    // Onboarding : a la premiere visite d'un module, le guide s'ouvre tout seul.
    // (sauf etude-dossier qui a son propre overlay d'onboarding plus complet)
    if (guide && !guideSeen() && moduleId !== 'etude-dossier') {
      setTimeout(function() { CGP.nav.toggleGuide(); }, 400);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
