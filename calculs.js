/**
 * CGP Skool — calculs.js
 * Fonctions de calcul patrimonial — Phase 3
 * Dependances : data.js (doit etre charge avant)
 * Toutes les fonctions sont pures (sans effet de bord sur ED)
 *
 * REGLES CONFIRMEES (backtests Phase 1) :
 *   R4  : revenus stockes en ANNUEL, revMens() divise par 12
 *   R5  : taux endettement = credits seuls (passifs), pas charges totales
 *   R8  : pension = salaires + fonciers nominatifs uniquement (fonciers SCI exclus pour couple)
 *   R9  : endettement calcule sur le couple complet
 *   R18 : txSal = 1.00 si age moyen < 57, sinon 0.70 (ponderation age)
 */

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculer l'age en annees depuis une date de naissance
 * @param {string} dob  "JJ/MM/AAAA" ou "MM/AAAA"
 * @returns {number|null}
 */
function calcAge(dob) {
  if (!dob) return null;
  var p = dob.split('/');
  var d;
  if (p.length === 3)      d = new Date(p[2], p[1]-1, p[0]);
  else if (p.length === 2) d = new Date(p[1], p[0]-1, 1);
  else return null;
  if (isNaN(d)) return null;
  var n = new Date();
  return n.getFullYear() - d.getFullYear() -
    (n < new Date(n.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
}

/**
 * Formater un nombre en euros style francais : "1 234"
 * @param {number} n
 * @returns {string}
 */
function fmt(n) {
  return Math.round(n || 0).toLocaleString('fr-FR');
}

// ─────────────────────────────────────────────────────────────────────────────
// R4 + R9 — REVENUS MENSUELS NETS (couple complet)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Revenus mensuels nets du foyer
 * R4  : revenus annuels / 12
 * R18 : ponderation age — txSal = 0.70 si age moyen >= 57 ans
 * R9  : couple complet (sal1 + sal2 + fonciers×0.70)
 *
 * @param {number} sal1    salaires annuels C1
 * @param {number} sal2    salaires annuels C2 (0 si seul)
 * @param {number} fonc    revenus fonciers annuels bruts
 * @param {number} age1    age actuel C1 (pour ponderation)
 * @param {number} age2    age actuel C2 (0 si seul)
 * @param {boolean} isCouple
 * @returns {number} revenus mensuels nets arrondis
 */
function calcRevMens(sal1, sal2, fonc, age1, age2, isCouple) {
  var ageMoy = isCouple ? Math.round(((age1||40) + (age2||40)) / 2) : (age1||40);
  var txSal  = ageMoy >= 57 ? 0.70 : 1.00;
  var sal    = (sal1||0) + (sal2||0);
  return Math.round((sal * txSal + (fonc||0) * 0.70) / 12);
}

// ─────────────────────────────────────────────────────────────────────────────
// R5 — TAUX D'ENDETTEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Charges credit mensuelles (R5 : passifs uniquement, pas charges courantes)
 * @param {Array} passifs  [{echeance: number annuel, ...}, ...]
 * @returns {number} charges credit /mois arrondies
 */
function calcChrCredit(passifs) {
  var total = (passifs||[]).reduce(function(s, p) {
    return s + (p.echeance || p.echeanceAn || 0);
  }, 0);
  return Math.round(total / 12);
}

/**
 * Taux d'endettement
 * @param {number} chrCredit  charges credit /mois
 * @param {number} revMens    revenus mensuels nets
 * @returns {number} taux en % (ex: 84.5)
 */
function calcTauxEndettement(chrCredit, revMens) {
  if (!revMens || revMens <= 0) return 0;
  return Math.round((chrCredit / revMens) * 1000) / 10; // arrondi 0.1%
}

/**
 * Reste a vivre mensuel
 * @param {number} revMens
 * @param {number} chrCredit
 * @returns {number}
 */
function calcRAV(revMens, chrCredit) {
  return revMens - (chrCredit||0);
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCUL IR 2025
// Utilise BAREME_IR de data.js
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcul complet de l'impot sur le revenu
 *
 * Algorithme :
 *   1. Abattement 10% sur salaires (min/max)
 *   2. Quotient familial : RBI / nb_parts
 *   3. Application des tranches sur le quotient
 *   4. Remultiplication par nb_parts
 *   5. Decote si impot < seuil
 *   6. Retrancher reductions / credits
 *
 * @param {number} rbg         Revenu Brut Global (apres deductions, avant abatt 10%)
 * @param {string} sitmat      'marie'|'celibataire'|'veuf'|etc.
 * @param {number} nbEnfants   0, 0.5, 1, 1.5, 2...
 * @param {boolean} vivantSeul case T
 * @param {number} reductions  total reductions d'impot
 * @param {number} credits     total credits d'impot
 * @returns {{ irBrut, decote, irNet, tmi, tauxMoyen, nbParts }}
 */
function calcIR(rbg, sitmat, nbEnfants, vivantSeul, reductions, credits) {
  rbg       = rbg || 0;
  reductions = reductions || 0;
  credits    = credits    || 0;

  if (rbg <= 0) return { irBrut:0, decote:0, irNet:0, tmi:0, tauxMoyen:0, nbParts:2 };

  // Recuperer la config bareme (data.js)
  var cfg = getBaremeIR(sitmat, nbEnfants||0, vivantSeul||false);
  var nbParts = cfg.parts;
  var seuils  = cfg.seuils;  // [0, s11, s30, s41, s45]
  var taux    = [0, 0.11, 0.30, 0.41, 0.45];

  // Revenu imposable : abattement 10% sur RBG (approx — le vrai RBI vient du RI)
  // Dans l'outil, on utilise directement le RBG declare (tel qu'il vient du RI)
  // L'abattement est deja integre dans le RBG du RI (c'est le revenu NET imposable)
  var rbi = rbg;

  // Calcul par tranches progressives sur quotient familial
  var qf    = rbi / nbParts;
  var irBrut = 0;
  var tmi    = 0;

  for (var i = 0; i < taux.length; i++) {
    var bas  = seuils[i];
    var haut = (seuils[i+1] !== undefined) ? seuils[i+1] : Infinity;
    if (qf > bas) {
      var taxable = (Math.min(qf, haut) - bas) * taux[i] * nbParts;
      irBrut += taxable;
      if (taux[i] > 0) tmi = Math.round(taux[i] * 100);
    }
  }
  irBrut = Math.round(irBrut);

  // Decote
  var isCouple = (sitmat||'').toLowerCase().indexOf('mari') >= 0 ||
                 (sitmat||'').toLowerCase().indexOf('pacs') >= 0;
  var seuilDecote = isCouple ? (DECOTE ? DECOTE.couple : 1470) : (DECOTE ? DECOTE.seul : 889);
  var decote = 0;
  if (irBrut > 0 && irBrut < cfg.fin_decote) {
    decote = Math.max(0, seuilDecote - Math.round(irBrut * 0.75));
    decote = Math.min(decote, irBrut); // ne peut pas depasser l'impot
  }

  var irApresDecote = Math.max(0, irBrut - decote);
  var irNet = Math.max(0, Math.round(irApresDecote - reductions - credits));
  var tauxMoyen = rbi > 0 ? Math.round((irNet / rbi) * 1000) / 10 : 0;

  return {
    irBrut:    irBrut,
    decote:    decote,
    irNet:     irNet,
    tmi:       tmi,
    tauxMoyen: tauxMoyen,
    nbParts:   nbParts,
  };
}

/**
 * TMI seul depuis RBG + situation (raccourci)
 */
function calcTMI(rbg, sitmat, nbEnfants) {
  return calcIR(rbg, sitmat, nbEnfants||0).tmi;
}

// ─────────────────────────────────────────────────────────────────────────────
// R8 — PENSION RETRAITE ESTIMEE
// Utilise RET_AGES, RET_TAUX, CSP_MAP de data.js
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pension retraite mensuelle estimee pour un client
 *
 * R8 : base = salaires + fonciers nominatifs (SCI exclus pour couple)
 *    = salaires seuls si couple (fonciers SCI partages non nominatifs)
 *    = salaires + fonciers si client seul
 *
 * @param {number} salAnnuel      salaires annuels bruts
 * @param {number} foncNominatif  fonciers nominatifs (0 si SCI couple)
 * @param {string} csp            cle CSP_MAP
 * @param {number} age            age actuel
 * @returns {{ pension, taux, revBrutMensuel }}
 */
function calcPension(salAnnuel, foncNominatif, csp, age) {
  var revBrut = (salAnnuel||0) + (foncNominatif||0);
  var tx      = getRetTaux(csp||'Sal. cadre', age||40); // data.js — regle ceiling
  var pension = Math.floor(revBrut / 12 * tx / 100);
  return {
    pension:        pension,
    taux:           tx,
    revBrutMensuel: Math.round(revBrut / 12),
  };
}

/**
 * Calcul complet retraite pour un foyer
 *
 * @param {Array} clients [{
 *   sal: number, foncNomin: number, csp: string,
 *   age: number, retAge: number, pensionSouhaitee: number, civ: string
 * }]
 * @returns {Array} [{
 *   pension, taux, manque, gap, espVie, impactTotal,
 *   capitalCible, efforts: [{label, rate, effort}]
 * }]
 */
function calcRetraiteForage(clients) {
  var EFFORTS = [
    { label:'Livret / epargne reglementee (1,5 %)', rate:0.015 },
    { label:'Fonds euros assurance vie (2,5 %)',     rate:0.025 },
    { label:'SCPI de rendement (4,5 %)',             rate:0.045 },
    { label:'PER allocation diversifiee (5 %)',      rate:0.05  },
  ];

  return (clients||[]).map(function(cl) {
    var res = calcPension(cl.sal, cl.foncNomin||0, cl.csp, cl.age);
    var gap  = Math.max(0, (cl.pensionSouhaitee||0) - res.pension);
    var manque = (cl.pensionSouhaitee||0) - res.pension; // negatif = surplus
    var espVie = getEspVie(cl.civ||'M.', cl.retAge||64); // data.js
    var impactTotal = Math.round(manque * espVie);
    var horizon = Math.max(1, (cl.retAge||64) - (cl.age||40));
    var capitalCible = gap > 0 ? gap * 12 / 0.04 : 0;

    var efforts = EFFORTS.map(function(e) {
      var effort = (capitalCible > 0 && horizon > 0)
        ? capitalCible / ((Math.pow(1+e.rate, horizon) - 1) / e.rate) / 12
        : 0;
      return { label:e.label, rate:e.rate, effort:Math.round(effort) };
    });

    return {
      pension:      res.pension,
      taux:         res.taux,
      manque:       manque,
      gap:          gap,
      espVie:       espVie,
      impactTotal:  impactTotal,
      capitalCible: Math.round(capitalCible),
      horizon:      horizon,
      efforts:      efforts,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PYRAMIDE PATRIMONIALE
// Utilise getActifConfig et HORIZON_LABEL de data.js
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Repartition patrimoniale par horizon
 *
 * @param {Array}  actifs  [{label, montant, horizon?}, ...]
 * @param {Array}  passifs [{crd, echeance, dateFin?}, ...]
 * @returns {{
 *   ct, mt, lt, precaution,
 *   actifBrut, passifTotal, patrimoineNet,
 *   immo, financier, pro,
 *   repartition: [{h, montant, pct}]
 * }}
 */
function calcPyramide(actifs, passifs) {
  var ct = 0, mt = 0, lt = 0, prec = 0;
  var immo = 0, financier = 0, pro = 0;

  (actifs||[]).forEach(function(a) {
    var montant = a.montant || a.valeur || 0;
    if (!montant) return;

    // Determination horizon
    var cfg = getActifConfig(a.label || a.nom || ''); // data.js
    var h   = a.horizon || HORIZON_LABEL[cfg.h] || cfg.h || 'LT';
    // Normaliser
    if (h === 'CT' || h === 'Court terme')  { ct  += montant; financier += montant; }
    else if (h === 'MT' || h === 'Moyen terme') { mt  += montant; financier += montant; }
    else { lt += montant; }

    // Flag immobilier / pro
    if (cfg.immo) { immo += montant; }
    else if (/soci[eé]t[eé]|sarl|sci\b|parts.*soci|fonds.comm|client|mat[eé]riel.pro|v[eé]hicule.pro/i.test(a.label||a.nom||'')) {
      pro += montant;
    } else if (h !== 'CT' && h !== 'MT' && h !== 'Court terme' && h !== 'Moyen terme') {
      financier += montant;
    }
  });

  var actifBrut   = ct + mt + lt;
  var passifTotal = (passifs||[]).reduce(function(s, p) { return s + (p.crd || 0); }, 0);
  var patNet      = actifBrut - passifTotal;

  return {
    ct:            Math.round(ct),
    mt:            Math.round(mt),
    lt:            Math.round(lt),
    precaution:    Math.round(prec),
    actifBrut:     Math.round(actifBrut),
    passifTotal:   Math.round(passifTotal),
    patrimoineNet: Math.round(patNet),
    immo:          Math.round(immo),
    financier:     Math.round(financier),
    pro:           Math.round(pro),
    pctImmo:       actifBrut > 0 ? Math.round(immo/actifBrut*100) : 0,
    pctFinancier:  actifBrut > 0 ? Math.round(financier/actifBrut*100) : 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTION CAPITAL (solutions preconisees)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Projeter un capital dans le temps (interet compose)
 * @param {number} vi       versement initial
 * @param {number} vp       versements periodiques /mois
 * @param {number} taux     taux annuel (ex: 0.025)
 * @param {number} horizon  duree en annees
 * @returns {number} capital final arrondi
 */
function calcCapital(vi, vp, taux, horizon) {
  vi = vi || 0;
  vp = vp || 0;
  taux    = taux    || 0.025;
  horizon = horizon || 10;
  var capVI = vi * Math.pow(1 + taux, horizon);
  var capVP = vp > 0
    ? vp * 12 * ((Math.pow(1+taux, horizon) - 1) / taux)
    : 0;
  return Math.round(capVI + capVP);
}

/**
 * Rente mensuelle depuis un capital a 4% (hypothese rendement SCPI/AV)
 * @param {number} capital
 * @returns {number}
 */
function calcRente(capital) {
  return Math.round((capital||0) * 0.04 / 12);
}

/**
 * Economie fiscale PER (versements deductibles)
 * @param {number} versements  versements PER annuels
 * @param {number} tmi         taux marginal imposition (ex: 30)
 * @returns {number} economie en euros
 */
function calcEconomiePER(versements, tmi) {
  return Math.round((versements||0) * (tmi||0) / 100);
}

/**
 * Reduction FIP/FCPI (18% de l'investissement, plafond 12 000 EUR seul / 24 000 EUR couple)
 * @param {number} invest  montant investi
 * @param {boolean} isCouple
 * @returns {number} reduction d'impot
 */
function calcReductionFIP(invest, isCouple) {
  var plafond = isCouple ? 24000 : 12000;
  return Math.round(Math.min(invest||0, plafond) * 0.18);
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNTHESE AVANT / APRES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construire la synthese avant/apres pour l'affichage
 * @param {Object} ED  objet de donnees de l'etude
 * @returns {{avant, apres}}
 */
function calcSynthese(ED, solsSelectionnees) {
  var sal1  = ED.revenus.sal1 || ED.revenus.c1 || 0;
  var sal2  = ED.revenus.sal2 || ED.revenus.c2 || 0;
  var fonc  = ED.revenus.fonc || 0;
  var isCouple = ED.type !== 'seul';
  var age1  = calcAge(ED.c1.dob) || 40;
  var age2  = isCouple ? (calcAge(ED.c2.dob)||40) : 0;

  var revM      = calcRevMens(sal1, sal2, fonc, age1, age2, isCouple);
  var chrCredit = calcChrCredit(ED.passifs||[]);
  var endett    = calcTauxEndettement(chrCredit, revM);
  var rav       = calcRAV(revM, chrCredit);

  var pyr  = calcPyramide(ED.actifs||[], ED.passifs||[]);
  var irResult = calcIR(
    ED.fiscal.rbg || ED.fiscal.revBrutGlobal || 0,
    ED.sitmat || 'marie',
    ED.nbEnfants || 0,
    false,
    ED.fiscal.reductions || 0,
    ED.fiscal.credits || 0
  );

  // AVANT
  var avant = {
    patrimoineNet: pyr.patrimoineNet,
    actifBrut:     pyr.actifBrut,
    passifTotal:   pyr.passifTotal,
    revMens:       revM,
    chrCredit:     chrCredit,
    endett:        endett,
    rav:           rav,
    irNet:         irResult.irNet,
    tmi:           irResult.tmi,
    pctImmo:       pyr.pctImmo,
    pctFinancier:  pyr.pctFinancier,
    epargne:       ED.epMens || 0,
  };

  // APRES (avec solutions)
  var sols = solsSelectionnees || [];
  var capitalSuppl  = 0;
  var economieFisc  = 0;
  var revComplem    = 0;

  sols.forEach(function(sol) {
    var cfg = (typeof SOLUTIONS_CONFIG !== 'undefined' && SOLUTIONS_CONFIG) ? SOLUTIONS_CONFIG[sol.produit] : null;
    if (!cfg) return;
    var h = parseInt(sol.horizon) || cfg.horizonAns || 10;
    var cap = calcCapital(sol.vi||0, sol.vp||0, cfg.rendement||0.025, h);
    capitalSuppl += cap;
    revComplem   += calcRente(cap);
    if (sol.produit === 'PER' || sol.produit === 'PER_ENFANT') {
      economieFisc += calcEconomiePER((sol.vp||0)*12, irResult.tmi);
    }
    if (sol.produit === 'FIP_FCPI') {
      economieFisc += calcReductionFIP(sol.vi||0, isCouple);
    }
  });

  var apres = {
    patrimoineNetProj: pyr.patrimoineNet + capitalSuppl,
    capitalSuppl:      Math.round(capitalSuppl),
    economieFisc:      Math.round(economieFisc),
    revComplem:        Math.round(revComplem),
    nbSolutions:       sols.length,
  };

  return { avant:avant, apres:apres };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT (Node.js pour tests)
// ─────────────────────────────────────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  // Injecter les dependances data.js pour les tests
  var _data = require('./data.js');
  var DECOTE          = _data.DECOTE;
  var getBaremeIR     = _data.getBaremeIR;
  var getRetTaux      = _data.getRetTaux;
  var getEspVie       = _data.getEspVie;
  var getActifConfig  = _data.getActifConfig;
  var HORIZON_LABEL   = _data.HORIZON_LABEL;
  var SOLUTIONS_CONFIG= _data.SOLUTIONS_CONFIG;

  module.exports = {
    calcAge, fmt,
    calcRevMens, calcChrCredit, calcTauxEndettement, calcRAV,
    calcIR, calcTMI,
    calcPension, calcRetraiteForage,
    calcPyramide,
    calcCapital, calcRente, calcEconomiePER, calcReductionFIP,
    calcSynthese,
  };
}
