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
CGP.fmt = function(n) {
  return Math.round(n || 0).toLocaleString('fr-FR');
};
CGP.fmtE = function(n) {
  return CGP.fmt(n) + ' \u20ac';
};
CGP.fmtPct = function(n, decimals) {
  var d = decimals !== undefined ? decimals : 1;
  return (+(n || 0)).toFixed(d) + '%';
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
  if (!el) return;
  var p = CGP.profil.load();
  var img = CGP.profil.loadImages();
  var nom = ((p.prenom || '') + ' ' + (p.nom || '')).trim();
  if (!nom) { el.style.display = 'none'; return; }

  var left = '';
  left += '<div style="font-size:16px;font-weight:700;color:#181614">' + nom + '</div>';
  if (p.cabinet) left += '<div style="font-size:11px;color:#6B6B6B;margin-top:2px">' + p.cabinet + '</div>';
  var contact = [];
  if (p.tel) contact.push('\u260e ' + p.tel);
  if (p.email) contact.push('\u2709 ' + p.email);
  if (contact.length) left += '<div style="font-size:11px;color:#6B6B6B;margin-top:4px">' + contact.join(' \u00a0\u00a0 ') + '</div>';

  var right = '';
  if (img.logo) {
    right = '<div style="width:52px;height:52px;border-radius:50%;background:#fff;border:1px solid #e5e5e5;display:flex;align-items:center;justify-content:center;overflow:hidden">'
      + '<img src="' + img.logo + '" style="max-width:36px;max-height:36px;object-fit:contain">'
      + '</div>';
  }

  el.innerHTML = '<div style="background:#F2F1EE;margin:28px -40px -40px -40px;padding:20px 40px;display:flex;align-items:center;justify-content:space-between">'
    + '<div>' + left + '</div>'
    + (right ? '<div>' + right + '</div>' : '')
    + '</div>';
  el.style.display = '';
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
