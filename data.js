/**
 * CGP Skool — data.js
 * Tables de reference extraites du fichier Excel ED_RI_62_-_ACTIVER_MACRO__1_.xlsm
 * Source : Loi de Finances du 14/02/2025 — Bareme IR 2025 sur revenus 2024
 * NE PAS MODIFIER MANUELLEMENT — regenerer depuis l'Excel si besoin
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. BAREME IR 2025 (revenus 2024)
//
//    BAREME_IR[sitmat][nbEnfants] = {
//      parts     : nb parts fiscales
//      seuils    : [s_0%, s_11%, s_30%, s_41%, s_45%] revenu imposable entree tranche
//      fin_decote: seuil fin decote
//      somme_r   : [sr_0%, sr_11%, sr_30%, sr_41%, sr_45%] constantes calcul rapide
//    }
//    Calcul rapide : impot_brut = RBI * TMI + somme_r[TMI]  (somme_r sont negatives)
// ─────────────────────────────────────────────────────────────────────────────

var BAREME_IR = {
  marie: {
    0:   {parts:2,    seuils:[0,22994,58630, 167646,360588], fin_decote:52527,  somme_r:[0,-2529.34, -13669.04,-32110.10,-46533.62]},
    0.5: {parts:2.25, seuils:[0,25868,61679, 167646,360588], fin_decote:55401,  somme_r:[0,-2845.51, -14564.54,-33005.60,-47429.12]},
    1:   {parts:2.5,  seuils:[0,28742,64728, 167646,360588], fin_decote:58275,  somme_r:[0,-3161.68, -15460.04,-33901.10,-48324.62]},
    1.5: {parts:2.75, seuils:[0,31617,67777, 167646,360588], fin_decote:61150,  somme_r:[0,-3477.84, -16355.54,-34796.60,-49220.12]},
    2:   {parts:3,    seuils:[0,34491,70826, 167646,360588], fin_decote:64024,  somme_r:[0,-3794.01, -17251.04,-35692.10,-50115.62]},
    2.5: {parts:3.5,  seuils:[0,40239,76925, 167646,360588], fin_decote:69772,  somme_r:[0,-4426.35, -19042.04,-37483.10,-51906.62]},
    3:   {parts:4,    seuils:[0,45988,83023, 167646,360588], fin_decote:75521,  somme_r:[0,-5058.68, -20833.04,-39274.10,-53697.62]},
    3.5: {parts:4.5,  seuils:[0,51737,89121, 167646,360588], fin_decote:81269,  somme_r:[0,-5691.02, -22624.04,-41065.10,-55488.62]},
    4:   {parts:5,    seuils:[0,57485,95219, 167646,360588], fin_decote:87018,  somme_r:[0,-6323.35, -24415.04,-42856.10,-57279.62]},
  },
  celibataire: {
    0:   {parts:1,    seuils:[0,11497,29315,83823,180294], fin_decote:29357, somme_r:[0,-1264.67,-6834.52, -16055.05,-23266.81]},
    0.5: {parts:1.25, seuils:[0,14371,32364,83823,180294], fin_decote:32232, somme_r:[0,-1580.84,-7730.02, -16950.55,-24162.31]},
    1:   {parts:1.5,  seuils:[0,17246,35413,83823,180294], fin_decote:35106, somme_r:[0,-1897.01,-8625.52, -17846.05,-25057.81]},
    1.5: {parts:1.75, seuils:[0,20120,38462,83823,180294], fin_decote:37980, somme_r:[0,-2213.17,-9521.02, -18741.55,-25953.31]},
    2:   {parts:2,    seuils:[0,22994,41511,83823,180294], fin_decote:40854, somme_r:[0,-2529.34,-10416.52,-19637.05,-26848.81]},
    2.5: {parts:2.5,  seuils:[0,28742,47610,83823,180294], fin_decote:46603, somme_r:[0,-3161.68,-12207.52,-21428.05,-28639.81]},
    3:   {parts:3,    seuils:[0,34491,53708,83823,180294], fin_decote:52351, somme_r:[0,-3794.01,-13998.52,-23219.05,-30430.81]},
    3.5: {parts:3.5,  seuils:[0,40239,59806,83823,180294], fin_decote:58100, somme_r:[0,-4426.35,-15789.52,-25010.05,-32221.81]},
    4:   {parts:4,    seuils:[0,45988,65904,83823,180294], fin_decote:63848, somme_r:[0,-5058.68,-17580.52,-26801.05,-34012.81]},
  },
  // Celibataire vivant seul avec enfant(s) present(s) — case T
  celibataire_seul: {
    0.5: {parts:1.5,  seuils:[0,17246,37103,83823,180294], fin_decote:35106, somme_r:[0,-1897.01,-8946.52, -18167.05,-25378.81]},
    1:   {parts:2,    seuils:[0,22994,44890,83823,180294], fin_decote:40854, somme_r:[0,-2529.34,-11058.52,-20279.05,-27490.81]},
    1.5: {parts:2.25, seuils:[0,25868,47940,83823,180294], fin_decote:40854, somme_r:[0,-2845.51,-11954.02,-21174.55,-28386.31]},
    2:   {parts:2.5,  seuils:[0,28742,50989,83823,180294], fin_decote:40854, somme_r:[0,-3161.68,-12849.52,-22070.05,-29281.81]},
    2.5: {parts:3,    seuils:[0,34491,57087,83823,180294], fin_decote:40854, somme_r:[0,-3794.01,-14640.52,-23861.05,-31072.81]},
    3:   {parts:3.5,  seuils:[0,40239,63185,83823,180294], fin_decote:40854, somme_r:[0,-4426.35,-16431.52,-25652.05,-32863.81]},
    3.5: {parts:4,    seuils:[0,45988,69283,83823,180294], fin_decote:40854, somme_r:[0,-5058.68,-18222.52,-27443.05,-34654.81]},
    4:   {parts:4.5,  seuils:[0,51737,75382,83823,180294], fin_decote:40854, somme_r:[0,-5691.02,-20013.52,-29234.05,-36445.81]},
  },
  // Parent isole — case L (enfant parti)
  parent_isole: {
    0: {parts:1.5, seuils:[0,11497,29315,83823,180294], fin_decote:29357, somme_r:[0,-1264.67,-6834.52,-16055.05,-23266.81]},
  },
  veuf: {
    0:   {parts:1,    seuils:[0,11497,29315, 83823,180294], fin_decote:29357, somme_r:[0,-1264.67,-6834.52, -16055.05,-23266.81]},
    0.5: {parts:2.25, seuils:[0,20120,39525, 83823,180294], fin_decote:29357, somme_r:[0,-2213.17,-9723.02, -18943.55,-26155.31]},
    1:   {parts:2.5,  seuils:[0,28742,39247, 83823,180294], fin_decote:29357, somme_r:[0,-3161.68,-10618.52,-19839.05,-27050.81]},
    1.5: {parts:2.75, seuils:[0,31617,42296, 83823,180294], fin_decote:29357, somme_r:[0,-3477.84,-11514.02,-20734.55,-27946.31]},
    2:   {parts:3,    seuils:[0,34491,45345, 83823,180294], fin_decote:29357, somme_r:[0,-3794.01,-12409.52,-21630.05,-28841.81]},
    2.5: {parts:3.5,  seuils:[0,40239,51443, 83823,180294], fin_decote:29357, somme_r:[0,-4426.35,-14200.52,-23421.05,-30632.81]},
    3:   {parts:4,    seuils:[0,45988,57541, 83823,180294], fin_decote:29357, somme_r:[0,-5058.68,-15991.52,-25212.05,-32423.81]},
    3.5: {parts:4.5,  seuils:[0,51737,63640, 83823,180294], fin_decote:29357, somme_r:[0,-5691.02,-17782.52,-27003.05,-34214.81]},
    4:   {parts:5,    seuils:[0,57485,69738, 83823,180294], fin_decote:29357, somme_r:[0,-6323.35,-19573.52,-28794.05,-36005.81]},
  },
};

// Decote (art. 197 CGI par 4.a)
var DECOTE = {seul:889, couple:1470};

// Abattements 10% (art. 83 et 158 CGI)
var ABATTEMENT_10 = {
  salaries:  {min:503.91,  max:14426.08},
  retraites: {min:450.22,  max:4398.68},
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. TAUX DE REMPLACEMENT RETRAITE
//    Source : onglet "Config - Retraite"
//
//    RET_AGES en ordre DECROISSANT — logique ceiling :
//    ageIdx = RET_AGES.reduce((bi,a,i) => a>=age ? i : bi, 0)
// ─────────────────────────────────────────────────────────────────────────────

var RET_AGES = [65, 60, 55, 50, 45, 40, 35, 30, 0];

var RET_TAUX = {
  'Sal. cadre':      [60, 57, 56, 55, 54, 53, 50, 48, 48],
  'Sal. cadre sup.': [54, 52, 50, 49, 47, 45, 43, 42, 42],
  'Sal. non cadre':  [75, 70, 67, 64, 60, 57, 56, 54, 54],
  'Fonctionnaire':   [85, 75, 70, 65, 60, 60, 60, 60, 60],
  'TNS lib.':        [60, 54, 45, 44, 43, 42, 41, 40, 40],
  'TNS comer.':      [54, 50, 48, 45, 44, 43, 42, 41, 41],
};

// Ages de depart pour esperance de vie
var ESP_AGES = [55, 57, 60, 62, 64, 65, 67];

// Esperance de vie en mois (source Config-Retraite)
var ESP_VIE = {
  'Mme': [377, 355, 323, 302, 273, 261, 240],
  'M.':  [313, 294, 265, 247, 229, 217, 193],
};

// Mapping labels RI -> cles RET_TAUX
var CSP_MAP = {
  'Sal. cadre':                'Sal. cadre',
  'Sal. cadre sup.':           'Sal. cadre sup.',
  'Sal. non cadre':            'Sal. non cadre',
  'Fonctionnaire':             'Fonctionnaire',
  'TNS lib.':                  'TNS lib.',
  'TNS comer.':                'TNS comer.',
  'Salarie cadre':             'Sal. cadre',
  'Salarie non-cadre':         'Sal. non cadre',
  'Salarie cadre':             'Sal. cadre',
  "Chef d'entreprise":         'TNS comer.',
  'Independant / TNS':         'TNS lib.',
  'TNS Prof. liberale':        'TNS lib.',
  'TNS Commercant':            'TNS comer.',
  'Retraite':                  'Sal. non cadre',
  'Autres independants':       'TNS comer.',
  'Autres ind\u00e9pendants':  'TNS comer.',
  'Salari\u00e9 cadre':        'Sal. cadre',
  'Salari\u00e9 non cadre':    'Sal. non cadre',
  'Salari\u00e9 cadre sup.':   'Sal. cadre sup.',
  'TNS Prof. lib\u00e9rale':   'TNS lib.',
  'TNS Commer\u00e7ant':       'TNS comer.',
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. BAREME DROITS DE SUCCESSION EN LIGNE DIRECTE
//    Source : onglet "Config - Transmission"
// ─────────────────────────────────────────────────────────────────────────────

var SUCCESSION_TRANCHES = [
  {de:0,       a:8072,     taux:0.05},
  {de:8073,    a:12109,    taux:0.10},
  {de:12110,   a:15932,    taux:0.15},
  {de:15933,   a:552324,   taux:0.20},
  {de:552325,  a:902838,   taux:0.30},
  {de:902839,  a:1850677,  taux:0.40},
  {de:1850678, a:Infinity, taux:0.45},
];

var SUCCESSION_ABATTEMENT_ENFANT = 100000;

// ─────────────────────────────────────────────────────────────────────────────
// 4. CATALOGUE ACTIFS — horizons + flag immobilier
//    Source : onglet "X_Import - Config - V2"
// ─────────────────────────────────────────────────────────────────────────────

var ACTIFS_CONFIG = {
  // Court terme
  'Livret A':                           {h:'CT', immo:false},
  'Livret Bleu':                        {h:'CT', immo:false},
  'Livret Classique':                   {h:'CT', immo:false},
  'Livret Jeune':                       {h:'CT', immo:false},
  'Livret de Developpement Durable (LDD)':{h:'CT',immo:false},
  'LDDS':                               {h:'CT', immo:false},
  'LDD':                                {h:'CT', immo:false},
  "Livret d'Epargne Populaire (LEP)":   {h:'CT', immo:false},
  'LEP':                                {h:'CT', immo:false},
  'Compte courant':                     {h:'CT', immo:false},
  'Compte Epargne Logement (CEL)':      {h:'CT', immo:false},
  'CEL':                                {h:'CT', immo:false},
  // Moyen terme
  'Compte a terme (CAT)':               {h:'MT', immo:false},
  'CAT':                                {h:'MT', immo:false},
  "Plan d'Epargne Logement (PEL)":      {h:'MT', immo:false},
  'PEL':                                {h:'MT', immo:false},
  'Autre liquidite':                    {h:'MT', immo:false},
  'Assurance-vie':                      {h:'MT', immo:false},
  'Assurance vie':                      {h:'MT', immo:false},
  'Contrat de capitalisation':          {h:'MT', immo:false},
  'PEP Assurance vie':                  {h:'MT', immo:false},
  'PEP bancaire':                       {h:'MT', immo:false},
  'PEA':                                {h:'MT', immo:false},
  'PEA PME':                            {h:'MT', immo:false},
  'Compte titre (CTO)':                 {h:'MT', immo:false},
  'PEE':                                {h:'MT', immo:false},
  'Autre valeur mobiliere':             {h:'MT', immo:false},
  // Long terme financier
  'PER':                                {h:'LT', immo:false},
  'PERP':                               {h:'LT', immo:false},
  'PERCO':                              {h:'LT', immo:false},
  'Article 82':                         {h:'LT', immo:false},
  'Article 83':                         {h:'LT', immo:false},
  'Article 39':                         {h:'LT', immo:false},
  'Contrat Madelin':                    {h:'LT', immo:false},
  'EIP':                                {h:'LT', immo:false},
  'PLCI':                               {h:'LT', immo:false},
  'FIP':                                {h:'LT', immo:false},
  'FIP Corse':                          {h:'LT', immo:false},
  'FIP Outre Mer':                      {h:'LT', immo:false},
  'FCPI':                               {h:'LT', immo:false},
  'Capital Risque':                     {h:'LT', immo:false},
  'Holding':                            {h:'LT', immo:false},
  'Parts de Societe':                   {h:'LT', immo:false},
  'Assurance vie a PB differee':        {h:'LT', immo:false},
  'Participation':                      {h:'LT', immo:false},
  'Autre epargne':                      {h:'LT', immo:false},
  'Autre placement':                    {h:'LT', immo:false},
  // Long terme immobilier
  'Residence principale':               {h:'LT', immo:true},
  'Residence secondaire':               {h:'LT', immo:true},
  'Classique':                          {h:'LT', immo:true},
  'Pinel':                              {h:'LT', immo:true},
  'LMNP classique':                     {h:'LT', immo:true},
  'LMP':                                {h:'LT', immo:true},
  'Demembrement temporaire':            {h:'LT', immo:true},
  'Malraux 2009':                       {h:'LT', immo:true},
  'Monument historique':                {h:'LT', immo:true},
  'OPCI':                               {h:'LT', immo:true},
  'Terrain a batir':                    {h:'LT', immo:true},
  'Terre agricole':                     {h:'LT', immo:true},
  'Bien rural - bail a long terme':     {h:'LT', immo:true},
  'Bien Immobilier':                    {h:'LT', immo:true},
  // Foncier non bati
  "Bois & parts de GFF":               {h:'LT', immo:false},
  'Parts de GFA':                       {h:'LT', immo:false},
  'Parts GFV':                          {h:'LT', immo:false},
  'Autre foncier non bati':             {h:'LT', immo:false},
  // Biens professionnels
  'Fonds de commerce':                  {h:'LT', immo:false},
  'Materiel professionnel':             {h:'LT', immo:false},
  'Vehicule Professionnel':             {h:'LT', immo:false},
  // Objets de valeur
  'Meuble':                             {h:'LT', immo:false},
  'Bijoux':                             {h:'LT', immo:false},
  'Vehicules':                          {h:'LT', immo:false},
  "Objet d'art":                        {h:'LT', immo:false},
  'Metaux precieux':                    {h:'LT', immo:false},
  'Scellier':                           {h:'LT', immo:true},
  'Duflot':                             {h:'LT', immo:true},
  'Robien':                             {h:'LT', immo:true},
  'Borloo':                             {h:'LT', immo:true},
  'Perisol':                            {h:'LT', immo:true},
  'Girardin':                           {h:'LT', immo:true},
  'Sofica':                             {h:'LT', immo:false},
};

function getActifConfig(label) {
  if (!label) return {h:'LT', immo:false};
  var l = label.trim();
  if (ACTIFS_CONFIG[l]) return ACTIFS_CONFIG[l];
  var low = l.toLowerCase().replace(/[éèêë]/g,'e').replace(/[àâ]/g,'a').replace(/[ùûü]/g,'u').replace(/[îï]/g,'i').replace(/[ôö]/g,'o').replace(/[ç]/g,'c');
  var keys = Object.keys(ACTIFS_CONFIG);
  for (var i=0; i<keys.length; i++) {
    var klow = keys[i].toLowerCase().replace(/[éèêë]/g,'e').replace(/[àâ]/g,'a').replace(/[ùûü]/g,'u').replace(/[îï]/g,'i').replace(/[ôö]/g,'o').replace(/[ç]/g,'c');
    if (low.indexOf(klow)>=0 || klow.indexOf(low)>=0) return ACTIFS_CONFIG[keys[i]];
  }
  if (/livret|livrets/i.test(l))              return {h:'CT', immo:false};
  if (/compte courant|\bcc\b/i.test(l))       return {h:'CT', immo:false};
  if (/assurance.?vie/i.test(l))              return {h:'MT', immo:false};
  if (/\bper\b|\bperp\b|\bperco\b/i.test(l)) return {h:'LT', immo:false};
  if (/r[eé]sidence|immo|sci\b|terrain|lmnp|pinel/i.test(l)) return {h:'LT', immo:true};
  if (/\bpea\b|\bcto\b|\bpee\b/i.test(l))    return {h:'MT', immo:false};
  return {h:'LT', immo:false};
}

// Correspondance h -> label complet
var HORIZON_LABEL = {CT:'Court terme', MT:'Moyen terme', LT:'Long terme'};

// ─────────────────────────────────────────────────────────────────────────────
// 5. CATALOGUE SOLUTIONS
//    Source : onglet "Config - Solutions"
// ─────────────────────────────────────────────────────────────────────────────

var SOLUTIONS_CONFIG = {
  'AV': {
    label:'Assurance-vie', levier:'Placements',
    horizon:'8 ans', horizonAns:8, rendement:0.025,
    texte:"Le but est de se constituer un capital minimal d'environ {capital} dans {horizon} ans, en fonction de votre profil investisseur. Ce placement assure une souplesse durant toute la vie active.",
    objectifs:['Reorganiser votre patrimoine','Optimiser vos placements','Optimiser votre patrimoine','Optimiser votre transmission','Proteger vos proches','Proteger votre conjoint','Proteger vos enfants','Transmettre votre patrimoine','Preparer votre retraite','Accompagner vos enfants'],
  },
  'PER': {
    label:'PER adulte', levier:'Impots',
    horizon:'Retraite', horizonAns:20, rendement:0.04,
    texte:"Capital d'environ {capital} dans {horizon} ans, pour la retraite, avec une economie d'impot de {impots} des cette annee.",
    objectifs:['Optimiser votre fiscalite','Optimiser votre transmission','Proteger votre conjoint','Transmettre votre patrimoine','Preparer votre retraite'],
  },
  'PER_ENFANT': {
    label:'PER enfant', levier:'Impots',
    horizon:'Majorite / Retraite', horizonAns:15, rendement:0.04,
    texte:"Reduction d'impot de {impots} tout en constituant un capital minimal d'environ {capital} dans {horizon} ans pour l'achat d'une residence principale ou la retraite.",
    objectifs:['Optimiser votre fiscalite','Accompagner vos enfants'],
  },
  'FIP_FCPI': {
    label:'FIP / FCPI', levier:'Impots',
    horizon:'7 - 10 ans', horizonAns:8, rendement:0.02,
    texte:"Reduction d'impot de {impots}.\nSe constituer un capital en investissant dans des entreprises, pour diversifier son patrimoine.",
    objectifs:['Optimiser vos placements','Diversifier votre patrimoine','Optimiser votre patrimoine','Optimiser votre fiscalite'],
  },
  'G3F': {
    label:'G3F Industriel', levier:'Impots',
    horizon:'10 a 14 mois', horizonAns:1, rendement:0.10,
    texte:"Reduction d'impot de {impots}.\nInvestissement oneshot, permettant une rentabilite de 10% sur 1 an.",
    objectifs:['Optimiser vos placements','Diversifier votre patrimoine','Optimiser votre patrimoine','Optimiser votre fiscalite'],
  },
  'SCPI_FIN': {
    label:'SCPI Financee', levier:'Financement',
    horizon:'25 ans', horizonAns:25, rendement:0.045,
    texte:'Patrimoine de {capital} et generateur de revenus complementaires de {revenus}/mois (hors fiscalite) dans {horizon} ans.',
    objectifs:['Optimiser vos placements','Creer patrimoine immobilier','Optimiser votre patrimoine','Completer vos revenus','Proteger votre conjoint','Proteger vos enfants','Preparer votre retraite'],
  },
  'SCPI_CASH': {
    label:'SCPI Cash', levier:'Placements',
    horizon:'15 ans', horizonAns:15, rendement:0.045,
    texte:"Se constituer un patrimoine dans l'immobilier d'entreprise et generateur de revenus complementaires de {revenus}/mois.",
    objectifs:['Reorganiser votre patrimoine','Optimiser vos placements','Creer patrimoine immobilier','Completer vos revenus','Preparer votre retraite'],
  },
  'SCPI_CASH_VP': {
    label:'SCPI Cash (versements programmés)', levier:'Placements',
    horizon:'15 ans', horizonAns:15, rendement:0.045,
    texte:"Se constituer un patrimoine dans l'immobilier d'entreprise via des versements reguliers et generateur de revenus complementaires de {revenus}/mois.",
    objectifs:['Reorganiser votre patrimoine','Optimiser vos placements','Creer patrimoine immobilier','Completer vos revenus','Preparer votre retraite'],
  },
  'SCPI_DEM': {
    label:'SCPI Demembrement', levier:'Placements',
    horizon:'10 ans', horizonAns:10, rendement:0.04,
    texte:"Se constituer un patrimoine dans l'immobilier d'entreprise d'environ {capital} et generateur de revenus complementaires d'environ {revenus}/mois dans {horizon} ans.",
    objectifs:['Reorganiser votre patrimoine','Optimiser vos placements','Creer patrimoine immobilier','Diversifier votre patrimoine','Optimiser votre patrimoine','Optimiser votre transmission','Preparer votre retraite'],
  },
  'PINEL': {
    label:'Pinel / Loi fiscale', levier:'Financement',
    horizon:'25 ans', horizonAns:25, rendement:0.04,
    texte:"Se constituer un patrimoine dans l'immobilier d'environ {capital} et generateur de revenus complementaires d'environ {revenus}/mois, dans {horizon} ans.",
    objectifs:['Creer patrimoine immobilier','Optimiser votre fiscalite','Proteger votre conjoint','Proteger vos enfants','Preparer votre retraite'],
  },
  'NOVAXIA': {
    label:'Novaxia', levier:'Placements',
    horizon:'8 - 10 ans', horizonAns:9, rendement:0.05,
    texte:"Se constituer un capital d'environ {capital} dans 6-8 ans minimum.",
    objectifs:['Reorganiser votre patrimoine','Optimiser vos placements','Creer patrimoine immobilier','Diversifier votre patrimoine'],
  },
  'LMNP': {
    label:'LMNP', levier:'Financement',
    horizon:'1 - 2 ans', horizonAns:20, rendement:0.045,
    texte:'Se constituer un patrimoine de {capital} et generateur de revenus complementaires de {revenus}/mois en optimisant la fiscalite sur les revenus locatifs.',
    objectifs:['Creer patrimoine immobilier','Completer vos revenus','Proteger votre conjoint','Preparer votre retraite','Accompagner vos enfants'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. HELPERS — fonctions exposees globalement
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recuperer la config bareme IR
 * @param {string} sitmat  'marie'|'celibataire'|'veuf'|'divorce'|'pacs'
 * @param {number} nbEnfants  0, 0.5, 1, 1.5, 2 ...
 * @param {boolean} vivantSeul  case T (parent isole avec enfant present)
 */
function getBaremeIR(sitmat, nbEnfants, vivantSeul) {
  var s = (sitmat||'').toLowerCase()
    .replace(/\u00e9|\u00e8|\u00ea/g,'e')
    .replace(/\u00e0|\u00e2/g,'a');
  var table;
  if (s.indexOf('mari')>=0 || s.indexOf('pacs')>=0) {
    table = BAREME_IR.marie;
  } else if (s.indexOf('veuf')>=0) {
    table = BAREME_IR.veuf;
  } else if (vivantSeul && nbEnfants > 0) {
    table = BAREME_IR.celibataire_seul;
  } else {
    table = BAREME_IR.celibataire;
  }
  var enf = Math.round((nbEnfants||0) * 2) / 2;
  return table[enf] || table[0] || BAREME_IR.celibataire[0];
}

/**
 * Taux de remplacement retraite
 * Regle : ceiling vers multiple de 5 superieur (confirme backtests Phase 1)
 * @param {string} csp  cle CSP_MAP ou directement cle RET_TAUX
 * @param {number} age  age actuel
 * @returns {number} taux en %
 */
function getRetTaux(csp, age) {
  var key = CSP_MAP[csp] || CSP_MAP[(csp||'').replace(/\u00e9/g,'e').replace(/\u00e7/g,'c')] || 'Sal. cadre';
  var arr = RET_TAUX[key] || RET_TAUX['Sal. cadre'];
  // Interpolation lineaire entre deux paliers d'age (R19)
  // RET_AGES est en ordre decroissant : [65, 60, 55, 50, 45, 40, 35, 30, 0]
  if (age >= RET_AGES[0]) return arr[0];
  if (age <= RET_AGES[RET_AGES.length-1]) return arr[arr.length-1];
  for (var i = 0; i < RET_AGES.length - 1; i++) {
    if (age <= RET_AGES[i] && age >= RET_AGES[i+1]) {
      var t = (age - RET_AGES[i+1]) / (RET_AGES[i] - RET_AGES[i+1]);
      return Math.round(arr[i+1] + t * (arr[i] - arr[i+1]));
    }
  }
  return arr[0];
}

/**
 * Esperance de vie en mois
 * @param {string} civ  'Mme' | 'M.'
 * @param {number} ageDepart
 */
function getEspVie(civ, ageDepart) {
  var arr = (civ==='Mme') ? ESP_VIE['Mme'] : ESP_VIE['M.'];
  // Interpolation lineaire entre deux ages de depart (R19)
  // ESP_AGES est en ordre croissant : [55, 57, 60, 62, 64, 65, 67]
  if (ageDepart <= ESP_AGES[0]) return arr[0];
  if (ageDepart >= ESP_AGES[ESP_AGES.length-1]) return arr[arr.length-1];
  for (var i = 0; i < ESP_AGES.length - 1; i++) {
    if (ageDepart >= ESP_AGES[i] && ageDepart <= ESP_AGES[i+1]) {
      var t = (ageDepart - ESP_AGES[i]) / (ESP_AGES[i+1] - ESP_AGES[i]);
      return Math.round(arr[i] + t * (arr[i+1] - arr[i]));
    }
  }
  return arr[arr.length-1];
}

/**
 * Calcul droits de succession (en ligne directe apres abattement)
 * @param {number} valeur  valeur transmise APRES abattement
 */
function calcSuccession(valeur) {
  var droits = 0;
  for (var i=0; i<SUCCESSION_TRANCHES.length; i++) {
    var t = SUCCESSION_TRANCHES[i];
    if (valeur > t.de) {
      droits += (Math.min(valeur, t.a) - t.de) * t.taux;
    }
  }
  return Math.round(droits);
}

// Export Node.js si besoin (tests unitaires)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BAREME_IR, DECOTE, ABATTEMENT_10,
    RET_AGES, RET_TAUX, CSP_MAP,
    ESP_AGES, ESP_VIE,
    SUCCESSION_TRANCHES, SUCCESSION_ABATTEMENT_ENFANT,
    ACTIFS_CONFIG, HORIZON_LABEL, getActifConfig,
    SOLUTIONS_CONFIG,
    getBaremeIR, getRetTaux, getEspVie, calcSuccession,
  };
}
