/*
 * CGP SKOOL - Core shared library
 * Usage: <script src="cgp-skool-core.js"></script>
 * Requires: nothing (standalone)
 *
 * Provides:
 *   CGP.fmt(n)           - format number FR
 *   CGP.fmtE(n)          - format number + euro sign
 *   CGP.fmtPct(n,d)      - format percentage
 *   CGP.profil.load()    - read profil from localStorage (dual-key)
 *   CGP.profil.save(p)   - write profil to localStorage (dual-key)
 *   CGP.profil.isComplete() - true if nom+cabinet+orias
 *   CGP.profil.loadImages() - {photo, logo}
 *   CGP.footer.render(el)   - render conseiller footer into element
 *   CGP.project.registerModule(id, {getState, setState})
 *   CGP.project.exportAll()  - export all modules as JSON file
 *   CGP.project.importAll(file) - import JSON file, restore states
 *   CGP.pdf.print()       - convert canvas to PNG then print
 */
var CGP = CGP || {};

/* ── FORMATTING ─────────────────────────────────── */
CGP.fmt = function(n, decimals) {
  if (decimals !== undefined && decimals > 0) {
    return (+(n || 0)).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  }
  return Math.round(n || 0).toLocaleString('fr-FR');
};
CGP.fmtE = function(n) {
  return CGP.fmt(n) + ' \u20ac';
};
CGP.fmtPct = function(n, decimals) {
  var d = decimals !== undefined ? decimals : 1;
  return (+(n || 0)).toFixed(d) + '%';
};

/* ── UTILITIES ──────────────────────────────────── */
CGP.esc = function(s) {
  if (!s) return '';
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
};

CGP.toggleAcc = function(lbl) {
  lbl.classList.toggle('open');
  var body = lbl.nextElementSibling;
  if (body && body.classList.contains('sb-body')) body.classList.toggle('open');
  // Also support .sidebar-body class (scpi-simulator)
  if (body && body.classList.contains('sidebar-body')) body.classList.toggle('open');
};

/* ── PROFIL ──────────────────────────────────────── */
CGP.profil = {};

// Key mapping: semantic <-> prefixed
CGP.profil._MAP = {
  prenom: 'pPrenom', nom: 'pNom', cabinet: 'pCabinet',
  orias: 'pOrias', tel: 'pTel', email: 'pEmail',
  adresse: 'pAdresse', cp: 'pCp', ville: 'pVille',
  mentions: 'pMentions', color1: 'pColor1', color2: 'pColor2'
};

CGP.profil._KEY = 'cgpskool_profil_v1';

/**
 * Load profil from localStorage.
 * Returns an object with BOTH key formats:
 *   result.prenom === result.pPrenom
 * So all existing code keeps working.
 */
CGP.profil.load = function() {
  try {
    var raw = localStorage.getItem(CGP.profil._KEY);
    if (!raw) return {};
    var p = JSON.parse(raw);
    var result = {};
    var map = CGP.profil._MAP;
    // Copy habilitations as-is
    var habils = ['hImmo', 'hIobsp', 'hIas', 'hAgent', 'hCif'];
    habils.forEach(function(k) { if (p[k] !== undefined) result[k] = p[k]; });
    // Normalize dual keys
    Object.keys(map).forEach(function(sem) {
      var pref = map[sem];
      var v = p[sem] || p[pref] || '';
      result[sem] = v;
      result[pref] = v;
    });
    return result;
  } catch(e) { return {}; }
};

/**
 * Save profil to localStorage in BOTH key formats.
 * Accepts either format as input.
 */
CGP.profil.save = function(data) {
  if (!data) return;
  var stored = {};
  var map = CGP.profil._MAP;
  // Normalize: write both formats
  Object.keys(map).forEach(function(sem) {
    var pref = map[sem];
    var v = data[sem] || data[pref] || '';
    stored[sem] = v;
    stored[pref] = v;
  });
  // Habilitations
  var habils = ['hImmo', 'hIobsp', 'hIas', 'hAgent', 'hCif'];
  habils.forEach(function(k) { if (data[k] !== undefined) stored[k] = data[k]; });
  try { localStorage.setItem(CGP.profil._KEY, JSON.stringify(stored)); } catch(e) {}
};

CGP.profil.isComplete = function() {
  var p = CGP.profil.load();
  return !!(p.nom && p.cabinet && p.orias);
};

/**
 * Load legal/regulatory profile.
 * Returns:
 *   interlocuteur : data for the client-facing footer/header (junior if junior, else self)
 *   legal         : regulatory data (parrain if junior, else self) — used in mentions legales
 *   mandats       : editable mandate labels with defaults
 *   addrs         : legal addresses (ACPR, RCP, mediateurs, ...)
 *   habils        : booleans hImmo/hIobsp/hIas/hAgent/hCif/pAnacofi
 *   junior        : true if junior mode
 */
CGP.profil.loadLegal = function() {
  var raw = {};
  try { raw = JSON.parse(localStorage.getItem(CGP.profil._KEY) || '{}'); } catch(e) {}
  var g = function(k) { return raw[k] || ''; };
  var isJunior = !!raw.pJunior;

  var self = {
    prenom: g('pPrenom'), nom: g('pNom'), cabinet: g('pCabinet'),
    orias: g('pOrias'), tel: g('pTel'), email: g('pEmail'),
    adresse: g('pAdresse'), cp: g('pCp'), ville: g('pVille')
  };
  var parrain = {
    prenom: g('pParrainPrenom'), nom: g('pParrainNom'),
    cabinet: g('pParrainCabinet'), orias: g('pParrainOrias'),
    tel: g('pParrainTel'), email: g('pParrainEmail')
  };

  return {
    junior: isJunior,
    self: self,
    parrain: parrain,
    interlocuteur: self,
    legal: isJunior && (parrain.nom || parrain.cabinet) ? parrain : self,
    mandats: {
      iobsp: g('pMandIobsp') || 'Stellium Financement',
      ias:   g('pMandIas')   || 'Stellium Courtage',
      cif:   g('pMandCif')   || 'Stellium Invest (ACPR n\u00b0 10983)',
      immo:  g('pMandImmo')  || 'Stellium Immobilier \u2014 CPI 3101 2015 000 001 813'
    },
    addrs: {
      acpr:        g('pAcpr')        || '4 Place de Budapest, 75436 Paris',
      rcp:         g('pRcp')         || 'Zurich Insurance \u2014 112 av. de Wagram, 75017 Paris',
      reclamation: g('pReclamation') || 'reclamations@stellium.fr',
      medAmf:      g('pMediateurAmf')|| '17 place de la Bourse, 75082 Paris',
      medAss:      g('pMediateurAss')|| 'AME Conso, 11 place Dauphine, 75001 Paris'
    },
    habils: {
      immo:    !!raw.hImmo,
      iobsp:   !!raw.hIobsp,
      ias:     !!raw.hIas,
      agent:   !!raw.hAgent,
      cif:     !!raw.hCif,
      anacofi: !!raw.pAnacofi
    },
    mentionsLibres: g('pMentions')
  };
};

CGP.profil.loadImages = function() {
  var photo = null, logo = null;
  try { photo = localStorage.getItem('cgpskool_photo'); } catch(e) {}
  try { logo = localStorage.getItem('cgpskool_logo'); } catch(e) {}
  return { photo: photo, logo: logo };
};

/* ── FOOTER CONSEILLER ──────────────────────────── */
CGP.footer = {};

/**
 * Render conseiller footer into a DOM element.
 * Used for PDF pages. Shows name, cabinet, contact, logo.
 */
CGP.footer.render = function(el) {
  if (typeof el === 'string') el = document.getElementById(el);
  if (!el) return;
  var p = CGP.profil.load();
  var img = CGP.profil.loadImages();
  var nom = ((p.prenom || '') + ' ' + (p.nom || '')).trim();
  // Si rien dans le profil → afficher placeholder
  if (!nom && !p.cabinet) {
    el.innerHTML = '<div style="background:#F2F1EE;margin:28px -40px -40px -40px;padding:20px 40px;text-align:center;font-size:11px;color:#9C9A96;font-style:italic">Renseignez votre profil sur la page d\'accueil pour personnaliser ce pied de page</div>';
    el.style.display = '';
    return;
  }
  var e = CGP.esc;

  // Couleurs personnalisees (fallback orange)
  var color1 = p.color1 || p.pColor1 || '#D4622A';
  var c1dim  = 'rgba(212,98,42,0.07)';
  var c1bord = 'rgba(212,98,42,0.18)';
  // Si couleur perso, regenerer dim/bord (approximatif via opacity)
  if (p.color1 || p.pColor1) {
    c1dim  = color1 + '14'; // ~8% alpha en hex
    c1bord = color1 + '33'; // ~20% alpha en hex
  }

  // Photo (gauche)
  var photoBlock = '';
  if (img.photo) {
    photoBlock = '<div style="width:56px;height:56px;border-radius:50%;background:#fff;border:1.5px solid #e5e5e5;overflow:hidden;flex-shrink:0">'
      + '<img src="' + img.photo + '" style="width:100%;height:100%;object-fit:cover">'
      + '</div>';
  }

  // Photo plus petite
  if (img.photo) {
    photoBlock = '<div style="width:40px;height:40px;border-radius:50%;background:#fff;border:1px solid #e5e5e5;overflow:hidden;flex-shrink:0">'
      + '<img src="' + img.photo + '" style="width:100%;height:100%;object-fit:cover">'
      + '</div>';
  }

  // Bloc texte central — compact
  var center = '<div style="flex:1;min-width:0">';
  if (nom) center += '<div style="font-size:13px;font-weight:700;color:#181614;line-height:1.3">' + e(nom) + '</div>';
  // Cabinet — ORIAS sur une ligne
  var line2 = '';
  if (p.cabinet) line2 += e(p.cabinet);
  if (p.orias) line2 += (line2 ? ' \u2014 ' : '') + 'ORIAS n\u00b0 ' + e(p.orias);
  if (line2) center += '<div style="font-size:10px;color:#6B6B6B;margin-top:1px">' + line2 + '</div>';
  // Tel + email sur une ligne
  var contact = [];
  if (p.tel) contact.push('\u260e ' + e(p.tel));
  if (p.email) contact.push('\u2709 ' + e(p.email));
  if (contact.length) center += '<div style="font-size:10px;color:#6B6B6B;margin-top:1px">' + contact.join(' \u00a0\u00a0 ') + '</div>';
  center += '</div>';

  // Logo cabinet (droite) — petit
  var right = '';
  if (img.logo) {
    right = '<div style="width:40px;height:40px;border-radius:50%;background:#fff;border:1px solid #e5e5e5;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">'
      + '<img src="' + img.logo + '" style="max-width:28px;max-height:28px;object-fit:contain">'
      + '</div>';
  }

  el.innerHTML = '<div style="background:#F2F1EE;margin:28px -40px -40px -40px;padding:12px 40px;display:flex;align-items:center;gap:14px">'
    + photoBlock
    + center
    + right
    + '</div>';
  el.style.display = '';
};

/* ── COPERNIC OBJECTIFS PAR SOLUTION ─────────────── */
CGP.copernic = {
  OBJECTIFS_BY_SOLUTION: {
    'AV':         ['Reorganiser votre patrimoine','Optimiser vos placements','Optimiser votre patrimoine','Optimiser votre transmission','Proteger votre conjoint','Proteger vos enfants','Transmettre votre patrimoine','Preparer votre retraite','Accompagner vos enfants'],
    'PER':        ['Optimiser votre fiscalite','Optimiser votre transmission','Proteger votre conjoint','Transmettre votre patrimoine','Preparer votre retraite'],
    'SCPI_FIN':   ['Optimiser vos placements','Creer patrimoine immobilier','Optimiser votre patrimoine','Completer vos revenus','Proteger votre conjoint','Proteger vos enfants','Preparer votre retraite'],
    'SCPI_CASH':  ['Reorganiser votre patrimoine','Optimiser vos placements','Creer patrimoine immobilier','Completer vos revenus','Preparer votre retraite'],
    'PINEL':      ['Creer patrimoine immobilier','Optimiser votre fiscalite','Proteger votre conjoint','Proteger vos enfants','Preparer votre retraite'],
    'LMNP':       ['Creer patrimoine immobilier','Completer vos revenus','Proteger votre conjoint','Preparer votre retraite','Accompagner vos enfants']
  },
  // Tags affiches sous le titre (extraits de la matrice COPERNIC d'etude-dossier)
  TAGS_BY_SOLUTION: {
    'AV':        ['Placement'],
    'PER':       ['Retraite','Imp\u00f4ts'],
    'SCPI_CASH': ['SCPI','Placement'],
    'SCPI_FIN':  ['Immobilier','Financement'],
    'LMNP':      ['Immobilier','Financement'],
    'PINEL':     ['Immobilier','Financement']
  },
  // Fusionne plusieurs solutions en une liste unique d'objectifs
  union: function(solutions) {
    var seen = {}, out = [];
    (solutions || []).forEach(function(sol) {
      (CGP.copernic.OBJECTIFS_BY_SOLUTION[sol] || []).forEach(function(o) {
        if (!seen[o]) { seen[o] = true; out.push(o); }
      });
    });
    return out;
  },
  // Fusionne les tags de plusieurs solutions
  unionTags: function(solutions) {
    var seen = {}, out = [];
    (solutions || []).forEach(function(sol) {
      (CGP.copernic.TAGS_BY_SOLUTION[sol] || []).forEach(function(t) {
        if (!seen[t]) { seen[t] = true; out.push(t); }
      });
    });
    return out;
  }
};

/* ── HEADER PAGE A4 ─────────────────────────────── */
CGP.header = {};

/**
 * Render a standard page header with tag, client name, date, optional COPERNIC chips.
 * @param {string|HTMLElement} target - id or element
 * @param {object} opts - {
 *   tag: 'MODULE TAG',
 *   solutions: ['SCPI_CASH']  OR  objectifs: [...]  (optional, no chips if neither),
 *   clientId: 'clientNom',     (id of input in sidebar)
 *   savedKey: 'scpi-simulator' (localStorage key for chip state)
 * }
 */
CGP.header.render = function(target, opts) {
  var el = (typeof target === 'string') ? document.getElementById(target) : target;
  if (!el || !opts) return;
  var e = CGP.esc;
  var p = CGP.profil.load();
  var color1 = p.color1 || p.pColor1 || '#D4622A';

  // Date du jour
  var today = new Date();
  var dateStr = today.toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'});

  // Nom client (depuis input sidebar)
  var clientName = '';
  if (opts.clientId) {
    var inp = document.getElementById(opts.clientId);
    if (inp && inp.value) clientName = inp.value.trim();
  }
  var clientDisplay = clientName ? clientName.toUpperCase() : 'CLIENT';

  // Liste objectifs (chips)
  var objectifs = [];
  if (opts.objectifs) objectifs = opts.objectifs;
  else if (opts.solutions) objectifs = CGP.copernic.union(opts.solutions);

  // Tags solution (sous le titre)
  var solTags = [];
  if (opts.solutions) solTags = CGP.copernic.unionTags(opts.solutions);

  // Etat coches (localStorage)
  var savedKey = opts.savedKey ? ('cgpskool_obj_' + opts.savedKey) : null;
  var checked = {};
  if (savedKey) {
    try {
      var raw = localStorage.getItem(savedKey);
      if (raw) checked = JSON.parse(raw) || {};
    } catch(err) {}
  }

  // ── Construction HTML ────────────────────────────
  var h = '<div style="margin-bottom:24px">';

  // Ligne tag + client + date
  h += '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:20px">';
  h += '<div style="min-width:0">';
  h += '<div style="font-size:11px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;color:' + color1 + ';padding-top:3px">' + e(opts.tag || '') + '</div>';
  if (solTags.length) {
    h += '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px">';
    solTags.forEach(function(t) {
      h += '<span style="font-size:9px;font-weight:600;letter-spacing:0.04em;color:#6B6B6B;background:rgba(0,0,0,0.04);border:1px solid rgba(0,0,0,0.08);padding:2px 8px;border-radius:10px">' + e(t) + '</span>';
    });
    h += '</div>';
  }
  h += '</div>';
  h += '<div style="text-align:right;flex-shrink:0">';
  h += '<div style="font-size:18px;font-weight:700;color:#0D0D0D;text-transform:uppercase;letter-spacing:0.02em">' + e(clientDisplay) + '</div>';
  h += '<div style="font-size:12px;color:#6B6B6B;font-weight:300;margin-top:2px">' + e(dateStr) + '</div>';
  h += '</div>';
  h += '</div>';

  // Trait fin sous le header (pleine largeur)
  h += '<div style="height:1px;background:rgba(0,0,0,0.06);margin-top:14px"></div>';

  h += '</div>';
  el.innerHTML = h;
};

/* ── PROJECT EXPORT/IMPORT ──────────────────────── */
CGP.project = {};
CGP.project._modules = {};

/**
 * Register a module for project-wide export/import.
 * @param {string} id - Module identifier (e.g. 'simulateur-avance-av')
 * @param {object} handlers - {getState: function, setState: function}
 */
CGP.project.registerModule = function(id, handlers) {
  CGP.project._modules[id] = handlers;
  // Auto-load saved state from localStorage
  try {
    var saved = localStorage.getItem('cgpskool_state_' + id);
    if (saved && handlers.setState) {
      handlers.setState(JSON.parse(saved));
    }
  } catch(e) {}
};

/**
 * Save current module state to localStorage (call after calc).
 */
CGP.project.autoSave = function(id) {
  var mod = CGP.project._modules[id];
  if (!mod || !mod.getState) return;
  try {
    localStorage.setItem('cgpskool_state_' + id, JSON.stringify(mod.getState()));
  } catch(e) {}
};

/**
 * Export all modules + profil as JSON file download.
 */
CGP.project.exportAll = function() {
  var data = {
    version: 1,
    exportDate: new Date().toISOString(),
    profil: CGP.profil.load(),
    modules: {}
  };
  // Add images
  var img = CGP.profil.loadImages();
  if (img.photo) data.profilPhoto = img.photo;
  if (img.logo) data.profilLogo = img.logo;
  // Collect all module states from localStorage
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key && key.indexOf('cgpskool_state_') === 0) {
      var modId = key.replace('cgpskool_state_', '');
      try { data.modules[modId] = JSON.parse(localStorage.getItem(key)); } catch(e) {}
    }
  }
  // Also get current module state (fresh)
  Object.keys(CGP.project._modules).forEach(function(id) {
    var mod = CGP.project._modules[id];
    if (mod && mod.getState) {
      data.modules[id] = mod.getState();
    }
  });

  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cgp-skool-projet_' + new Date().toLocaleDateString('fr-FR').replace(/\//g, '-') + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
};

/**
 * Import JSON project file. Restores profil + all module states.
 * @param {File} file - JSON file from file input
 * @param {function} [callback] - Called after import
 */
CGP.project.importAll = function(file, callback) {
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      // Restore profil
      if (data.profil) CGP.profil.save(data.profil);
      if (data.profilPhoto) {
        try { localStorage.setItem('cgpskool_photo', data.profilPhoto); } catch(err) {}
      }
      if (data.profilLogo) {
        try { localStorage.setItem('cgpskool_logo', data.profilLogo); } catch(err) {}
      }
      // Restore module states to localStorage
      if (data.modules) {
        Object.keys(data.modules).forEach(function(modId) {
          try {
            localStorage.setItem('cgpskool_state_' + modId, JSON.stringify(data.modules[modId]));
          } catch(err) {}
          // If this module is currently loaded, call setState
          var mod = CGP.project._modules[modId];
          if (mod && mod.setState) {
            mod.setState(data.modules[modId]);
          }
        });
      }
      if (callback) callback(data);
      else alert('Projet charge avec succes. Naviguez vers les autres modules pour voir les donnees restaurees.');
    } catch(err) {
      alert('Erreur lors du chargement : ' + err.message);
    }
  };
  reader.readAsText(file);
};

/* ── PDF EXPORT ─────────────────────────────────── */
CGP.pdf = {};

/**
 * Convert all canvas to PNG images, print, then restore.
 */
CGP.pdf._backups = [];

/**
 * Convert all canvas to PNG images (used before printing).
 * Called automatically by beforeprint event OR manually by CGP.pdf.print().
 */
CGP.pdf._convertCanvases = function() {
  if (CGP.pdf._backups.length > 0) return; // already converted
  document.querySelectorAll('canvas').forEach(function(canvas) {
    try {
      if (canvas.width > 0 && canvas.height > 0) {
        var url = canvas.toDataURL('image/png');
        if (url && url.length > 100) {
          var img = document.createElement('img');
          img.src = url;
          img.className = 'cgp-chart-print-img';
          img.style.cssText = 'max-width:100%;height:auto;display:none';
          // Insert AFTER canvas (not before) to avoid layout shift
          canvas.parentNode.insertBefore(img, canvas.nextSibling);
          CGP.pdf._backups.push({ canvas: canvas, img: img });
        }
      }
    } catch(e) {}
  });
  // Canvas hidden via CSS @media print { canvas{display:none!important} }
  // Images visible via CSS @media print { .cgp-chart-print-img{display:block!important} }
};

/**
 * Restore after printing: remove temporary images.
 */
CGP.pdf._restoreCanvases = function() {
  CGP.pdf._backups.forEach(function(b) {
    if (b.img && b.img.parentNode) b.img.parentNode.removeChild(b.img);
  });
  CGP.pdf._backups = [];
};

/**
 * Button handler: just trigger window.print().
 * beforeprint/afterprint events handle canvas conversion automatically.
 */
CGP.pdf.print = function() {
  window.print();
};

/**
 * Auto-convert canvases on Ctrl+P / system print.
 * Works even without clicking the "Exporter PDF" button.
 * Skips if the module handles its own canvas conversion (CGP.pdf.customHandler = true).
 */
window.addEventListener('beforeprint', function() {
  if (!CGP.pdf.customHandler) {
    CGP.pdf._convertCanvases();
  }
});
window.addEventListener('afterprint', function() {
  if (!CGP.pdf.customHandler) {
    CGP.pdf._restoreCanvases();
  }
});
