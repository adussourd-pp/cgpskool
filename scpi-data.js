// ═══════════════════════════════════════════════════════════
// SCPI DATA — Source : Panorama SCPI 2025 (Stellium Invest)
// Barèmes de démembrement extraits du fichier Excel officiel
// ═══════════════════════════════════════════════════════════

// Barème NP par SCPI : { duree: np_pct }
// np_pct = % que vous payez en nue-propriété
// us_pct = 1 - np_pct = % usufruit

const SCPI_DEMEM = {
  eurovalys: {5:0.81, 7:0.76, 10:0.69, 15:0.6},
  activimmo: {3:0.865, 4:0.82, 5:0.78, 6:0.75, 7:0.72, 8:0.7, 9:0.67, 10:0.65, 11:0.635, 12:0.625, 13:0.605, 14:0.59, 15:0.58, 16:0.57, 17:0.56, 18:0.55, 19:0.54, 20:0.53},
  comete: {3:0.875, 4:0.84, 5:0.8, 6:0.77, 7:0.74, 8:0.715, 9:0.7, 10:0.67, 11:0.655, 12:0.64, 13:0.63, 14:0.62, 15:0.61, 16:0.6, 17:0.59, 18:0.58, 19:0.57, 20:0.56},
  altaconv: {3:0.855, 4:0.815, 5:0.775, 6:0.745, 7:0.715, 8:0.69, 9:0.665, 10:0.64, 11:0.625, 12:0.61, 13:0.595, 14:0.585, 15:0.575, 16:0.56, 17:0.55, 18:0.54, 19:0.53, 20:0.52},
  epe: {3:0.875, 4:0.84, 5:0.8, 6:0.765, 7:0.74, 8:0.715, 9:0.7, 10:0.67, 11:0.655, 12:0.64, 13:0.63, 14:0.62, 15:0.585, 16:0.575, 17:0.565, 18:0.555, 19:0.55, 20:0.545},
  ep: {3:0.87, 4:0.83, 5:0.79, 6:0.76, 7:0.73, 8:0.71, 9:0.68, 10:0.66, 11:0.65, 12:0.64, 13:0.63, 14:0.62, 15:0.6, 16:0.59, 17:0.58, 18:0.57, 19:0.56, 20:0.55},
  atream: {5:0.815, 6:0.785, 7:0.755, 8:0.735, 9:0.71, 10:0.69, 12:0.66, 15:0.63, 20:0.59},
  te: {5:0.8, 6:0.77, 7:0.74, 8:0.71, 9:0.69, 10:0.67, 11:0.65, 12:0.63, 13:0.61, 14:0.6, 15:0.58, 16:0.57, 17:0.56, 18:0.55, 19:0.54, 20:0.53},
  corigin: {3:0.85, 4:0.81, 5:0.78, 6:0.75, 7:0.72, 8:0.69, 9:0.67, 10:0.65, 11:0.64, 12:0.63, 13:0.62, 14:0.61, 15:0.6, 16:0.59, 17:0.58, 18:0.57, 19:0.56, 20:0.55},
  ceurion: {3:0.87, 4:0.83, 5:0.79, 6:0.76, 7:0.74, 8:0.73, 9:0.71, 10:0.69, 11:0.68, 12:0.67, 13:0.66, 14:0.65, 15:0.64, 16:0.63, 17:0.62, 18:0.61, 19:0.6, 20:0.59},
  lfsante: {},
  osmo: {3:0.875, 4:0.84, 5:0.8, 6:0.765, 7:0.74, 8:0.715, 9:0.7, 10:0.67, 11:0.655, 12:0.64, 13:0.63, 14:0.62, 15:0.61, 16:0.6, 17:0.59, 18:0.58, 19:0.57, 20:0.56},
  ncap: {3:0.84, 4:0.81, 5:0.77, 6:0.74, 7:0.71, 8:0.68, 9:0.66, 10:0.64, 11:0.63, 12:0.61, 13:0.6, 14:0.59, 15:0.58},
  perial: {5:0.77, 6:0.735, 7:0.705, 8:0.675, 9:0.65, 10:0.62, 11:0.605, 12:0.585, 13:0.565, 14:0.55, 15:0.53},
  immorente: {5:0.7975, 6:0.765, 7:0.7375, 8:0.71, 9:0.6875, 10:0.665, 11:0.645, 12:0.6275, 13:0.61, 14:0.595, 15:0.5825, 16:0.57, 17:0.56, 18:0.55, 19:0.54, 20:0.5325},
  sofidy: {5:0.81, 6:0.78, 7:0.7525, 8:0.725, 9:0.6975, 10:0.675, 11:0.655, 12:0.635, 13:0.6175, 14:0.6, 15:0.585, 16:0.57, 17:0.5575, 18:0.545, 19:0.535, 20:0.5275},
};

// Retourne le % NP pour une SCPI et une durée données
function getNP(scpiId, duree) {
  const table = SCPI_DEMEM[scpiId];
  if (!table) return null;
  // Interpolation : chercher la durée exacte ou la plus proche
  if (table[duree] !== undefined) return table[duree];
  const keys = Object.keys(table).map(Number).sort((a,b)=>a-b);
  const lower = keys.filter(k=>k<=duree).pop();
  const upper = keys.filter(k=>k>=duree).shift();
  if (!lower) return table[upper];
  if (!upper) return table[lower];
  const t = (duree-lower)/(upper-lower);
  return table[lower] + t*(table[upper]-table[lower]);
}

const SCPI_DATA = [
  {id:'eurovalys',name:'Eurovalys',manager:'ADVENIS',theme:'Bureaux',geo:'Allemagne',yieldGross:0.055,capi:950.97,collecteNet2025:0,retraits2025:16.78,partsAttente:6.14,tof:0.901,leverage:0.3592,isr:false,sri:4,durabilite:'Article 8',valeurRealisation:749.03,valeurReconstitution:961.23,assets:36,tenants:195,sqm:454450,geography:{'Allemagne':1.0},assetTypes:{'Bureaux':0.84, 'Commerces':0.02, 'Production':0.09, 'Autres':0.03},price:960},
  {id:'activimmo',name:'Activimmo',manager:'ALDÉRAN',theme:'Logistique',geo:'International',yieldGross:0.0552,capi:1400,collecteNet2025:95.1,retraits2025:21.79,partsAttente:0,tof:0.781,leverage:null,isr:false,sri:3,durabilite:'Article 8',valeurRealisation:508.08,valeurReconstitution:610.67,assets:179,tenants:372,sqm:1392833,geography:{'France':0.78, 'Espagne':0.14, 'Italie':0.04, 'Pays-Bas':0.02, 'Portugal':0.01, 'Autres':0.01},assetTypes:{'Loc. d'activités':0.32, 'Entrepôts':0.51, 'Logistique':0.09, 'Transports':0.07},price:610},
  {id:'comete',name:'Comète',manager:'ALDÉRAN',theme:'Diversifié',geo:'International',yieldGross:0.1118,capi:519.6,collecteNet2025:398.9,retraits2025:0,partsAttente:0,tof:null,leverage:null,isr:false,sri:3,durabilite:'Article 8',valeurRealisation:219.03,valeurReconstitution:253.53,assets:27,tenants:72,sqm:232858,geography:{'Espagne':0.154, 'Italie':0.124, 'Pays-Bas':0.103, 'Royaume-Uni':0.465, 'Autres':0.154},assetTypes:{'Bureaux':0.14, 'Loisirs':0.06, 'Hôtellerie':0.16, 'Logistique':0.24, 'Commerce':0.28, 'Éducation':0.12},price:250},
  {id:'altaconv',name:'Alta Convictions',manager:'ALTAREA IM',theme:'Diversifié',geo:'France',yieldGross:0.065,capi:105.9,collecteNet2025:42.3,retraits2025:0,partsAttente:0,tof:0.96,leverage:0.14,isr:false,sri:3,durabilite:'Article 8',valeurRealisation:281.63,valeurReconstitution:333.68,assets:16,tenants:29,sqm:58773,geography:{'France':0.8, 'International':0.1, 'Espagne':0.1},assetTypes:{'Commerces':0.68, 'Logistique':0.23, 'Locaux d'activité':0.09},price:308},
  {id:'epe',name:'Epargne Pierre Europe',manager:'ATLAND VOISIN',theme:'Diversifié',geo:'Europe',yieldGross:0.0675,capi:559,collecteNet2025:291.6,retraits2025:0.96,partsAttente:0,tof:1.0,leverage:0,isr:false,sri:3,durabilite:'Article 8',valeurRealisation:172.14,valeurReconstitution:205.4,assets:27,tenants:54,sqm:null,geography:{'Espagne':0.34, 'Pays-Bas':0.1, 'Irlande':0.29, 'Allemagne':0.27},assetTypes:{'Bureaux':0.23, 'Commerces':0.2, 'Hôtels':0.32, 'Locaux activité':0.19, 'Santé':0.05},price:200},
  {id:'ep',name:'Epargne Pierre',manager:'ATLAND VOISIN',theme:'Diversifié',geo:'France',yieldGross:0.0528,capi:2803,collecteNet2025:69.99,retraits2025:43.81,partsAttente:0,tof:0.9445,leverage:0.112,isr:true,sri:3,durabilite:'Article 8',valeurRealisation:168.1,valeurReconstitution:207.22,assets:414,tenants:1020,sqm:1151069,geography:{'Rég. parisienne':0.27, 'Province':0.73},assetTypes:{'Bureaux':0.47, 'Commerces':0.29, 'Loc. d'activités':0.08, 'Hôtels':0.1, 'Santé':0.06},price:208},
  {id:'atream',name:'Atream Hôtels',manager:'ATREAM',theme:'Hôtellerie',geo:'Europe',yieldGross:0.065,capi:320.3,collecteNet2025:21.04,retraits2025:5.9,partsAttente:0,tof:1.0,leverage:0.2487,isr:false,sri:4,durabilite:'Article 8',valeurRealisation:874.7,valeurReconstitution:1064.31,assets:22,tenants:null,sqm:null,geography:{'France':0.33, 'Pays-Bas':0.14, 'Allemagne':0.3, 'Belgique':0.23},assetTypes:{'Hôtels':0.71, 'Hébergements':0.29},price:1000},
  {id:'te',name:'Transitions Europe',manager:'ARKEA REIM',theme:'Diversifié',geo:'Europe',yieldGross:0.0825,capi:1100,collecteNet2025:557.96,retraits2025:1.38,partsAttente:0,tof:null,leverage:null,isr:false,sri:3,durabilite:'Article 8',valeurRealisation:177.87,valeurReconstitution:207.49,assets:54,tenants:313,sqm:null,geography:{'Espagne':0.36, 'Pays-Bas':0.15, 'Allemagne':0.21, 'Irlande':0.09, 'Italie':0.13, 'Autres':0.06},assetTypes:{'Bureaux':0.31, 'Commerces':0.27, 'Logistique':0.16, 'Life Science':0.12, 'Autres':0.14},price:202},
  {id:'corigin',name:'Corum Origin',manager:'CORUM',theme:'Diversifié',geo:'Europe',yieldGross:0.073,capi:3794,collecteNet2025:530.43,retraits2025:51.97,partsAttente:0,tof:null,leverage:null,isr:false,sri:3,durabilite:'Article 8',valeurRealisation:null,valeurReconstitution:null,assets:164,tenants:401,sqm:1638679,geography:{'Pays-Bas':0.27, 'Italie':0.15, 'Finlande':0.09, 'Irlande':0.13, 'Espagne':0.09, 'Autres':0.27},assetTypes:{'Bureaux':0.58, 'Commerces':0.26, 'Hôtels':0.08, 'Activité':0.06, 'Santé':0.02},price:1135},
  {id:'ceurion',name:'Corum Eurion',manager:'CORUM',theme:'Diversifié',geo:'Europe',yieldGross:0.065,capi:1477,collecteNet2025:149.43,retraits2025:16.27,partsAttente:0,tof:null,leverage:null,isr:false,sri:3,durabilite:'Article 8',valeurRealisation:184.76,valeurReconstitution:229.29,assets:49,tenants:107,sqm:486537,geography:{'Pays-Bas':0.23, 'Italie':0.14, 'Irlande':0.22, 'Espagne':0.07, 'Portugal':0.09, 'Autres':0.25},assetTypes:{'Bureaux':0.74, 'Commerces':0.06, 'Hôtels':0.1, 'Activité':0.08, 'Santé':0.02},price:215},
  {id:'lfsante',name:'LF Avenir Santé',manager:'LA FRANÇAISE',theme:'Santé',geo:'France & Europe',yieldGross:0.0933,capi:259.9,collecteNet2025:36.6,retraits2025:1.9,partsAttente:0,tof:1.0,leverage:0.2621,isr:false,sri:3,durabilite:'Article 9',valeurRealisation:244.18,valeurReconstitution:302.3,assets:32,tenants:null,sqm:56104,geography:{'France':0.52, 'Belgique':0.1, 'Irlande':0.08, 'Autres':0.3},assetTypes:{'Santé':1.0},price:300},
  {id:'osmo',name:'Osmo Energie',manager:'MATA CAPITAL',theme:'Diversifié',geo:'Europe',yieldGross:0.0933,capi:79,collecteNet2025:47.39,retraits2025:0,partsAttente:0,tof:null,leverage:null,isr:false,sri:3,durabilite:'Article 9',valeurRealisation:246.78,valeurReconstitution:303.67,assets:23,tenants:35,sqm:42790,geography:{'Royaume-Uni':0.42, 'France':0.33, 'Pays-Bas':0.08, 'Irlande':0.11, 'Allemagne':0.06},assetTypes:{'Bureaux':0.39, 'Commerces':0.43, 'Activité & Log.':0.18},price:300},
  {id:'ncap',name:'NCAP Régions',manager:'NORMA CAPITAL',theme:'Diversifié',geo:'France',yieldGross:0.0601,capi:1084,collecteNet2025:87.2,retraits2025:21,partsAttente:0,tof:0.917,leverage:0.2,isr:false,sri:3,durabilite:'Article 8',valeurRealisation:570.66,valeurReconstitution:698.29,assets:178,tenants:430,sqm:506400,geography:{'Province':0.72, 'Rég. parisienne':0.26, 'Outre-mer':0.02},assetTypes:{'Bureaux':0.56, 'Commerces':0.3, 'Locaux activité':0.14},price:682},
  {id:'perial',name:'Perial Opportunités Europe',manager:'PERIAL',theme:'Diversifié',geo:'France & Europe',yieldGross:0.055,capi:788,collecteNet2025:10.22,retraits2025:26.68,partsAttente:0,tof:null,leverage:null,isr:false,sri:3,durabilite:'Article 8',valeurRealisation:33.56,valeurReconstitution:42.93,assets:128,tenants:309,sqm:371968,geography:{'France':0.59, 'Pays-Bas':0.14, 'Allemagne':0.13, 'Espagne':0.13, 'Italie':0.02},assetTypes:{'Bureaux':0.48, 'Commerces':0.19, 'Hôtels':0.27, 'Activité':0.02, 'Santé':0.05},price:44},
  {id:'immorente',name:'Immorente',manager:'SOFIDY',theme:'Diversifié',geo:'International',yieldGross:0.0572,capi:4391,collecteNet2025:5.92,retraits2025:60.96,partsAttente:88.6,tof:null,leverage:null,isr:true,sri:3,durabilite:'Article 8',valeurRealisation:null,valeurReconstitution:null,assets:994,tenants:3227,sqm:null,geography:{'Paris':0.23, 'Rég. parisienne':0.24, 'Province':0.32, 'International':0.21},assetTypes:{'Bureaux':0.35, 'Commerces':0.52, 'Hôtels':0.1, 'Autres':0.03},price:340},
  {id:'sofidy',name:'Sofidy Europe Invest',manager:'SOFIDY',theme:'Diversifié',geo:'Europe',yieldGross:0.065,capi:406,collecteNet2025:35.52,retraits2025:2.43,partsAttente:0,tof:null,leverage:0.21,isr:false,sri:3,durabilite:'Article 8',valeurRealisation:null,valeurReconstitution:null,assets:36,tenants:null,sqm:null,geography:{'Espagne':0.29, 'Pays-Bas':0.35, 'Allemagne':0.14, 'Irlande':0.1, 'Belgique':0.02, 'Royaume-Uni':0.1},assetTypes:{'Bureaux':0.36, 'Commerces':0.19, 'Hôtels':0.2, 'MSP':0.21, 'Logistique':0.05},price:235},
];

// Export pour usage dans les simulateurs
if (typeof module !== "undefined") module.exports = { SCPI_DATA, SCPI_DEMEM, getNP };