# CGP Skool — Outils patrimoniaux

> Outils libres pour conseillers en gestion de patrimoine (Prodemial / Peak Patrimoine).  
> Zéro serveur · Zéro coût · Fonctionne 100% dans le navigateur.

## 🚀 Accès

**GitHub Pages** : `https://[user].github.io/cgp-skool/`

## 📋 Outils disponibles

| Outil | Fichier | État |
|---|---|---|
| **Étude de Dossier** | `etude-dossier.html` | ✅ v2.0 |
| SCPI Cash | `scpi-simulator.html` | ✅ Beta |
| SCPI Financement | `scpi-financement.html` | ✅ Beta |
| Immobilier locatif | — | 🔜 |
| AV / PER | — | 🔜 |

## ✨ Étude de Dossier v2 — fonctionnalités

- **Import RI** : Word (.docx) via mammoth.js ou copier-coller texte brut
- **Avis d'imposition** : upload PDF (PDF.js)
- **Barème IR 2025** (Loi de Finances 14/02/2025) — toutes situations × enfants
- **Tables retraite** : 6 CSP × âge actuel, espérance de vie
- **Matrice Copernic** : objectifs → solutions avec calculs automatiques
- **Préconisations** : textes narratifs avec `{capital}`, `{horizon}`, `{impots}` calculés
- **Synthèse avant/après** : 3 graphiques Chart.js + stepper visuel
- **Profil conseiller** : persistant en localStorage, injecté dans chaque étude
- **Export PDF** : conversion canvas→PNG, en-tête/pied conseiller, @media print A4

## 📁 Structure du projet

```
/
├── index.html              ← Hub d'accueil
├── etude-dossier.html      ← Outil principal (standalone, data.js + calculs.js inline)
├── scpi-simulator.html     ← SCPI Cash
├── scpi-financement.html   ← SCPI Financement
├── cgp-skool.css           ← CSS commun (nav, composants)
├── data.js                 ← Tables de référence (source: ED_RI_62 Excel)
├── calculs.js              ← Fonctions de calcul testées
└── README.md
```

> **Note** : `data.js` et `calculs.js` sont **aussi injectés inline** dans `etude-dossier.html`  
> pour qu'il soit standalone (fonctionne en ouvrant directement le fichier HTML).

## 🛠️ Déploiement GitHub Pages

1. Créer un repo `cgp-skool` (privé recommandé)
2. Pousser tous les fichiers sur la branche `main`
3. `Settings` → `Pages` → Source : `main` / `/ (root)`
4. L'URL sera : `https://[username].github.io/cgp-skool/`

```bash
git init
git add .
git commit -m "CGP Skool v2.0 - Étude de Dossier complète"
git remote add origin https://github.com/[user]/cgp-skool.git
git push -u origin main
```

## 🔑 Règles de code (REGLES_PROJET.md)

- **R4** — Revenus stockés en ANNUEL, `revMens()` divise par 12
- **R5** — Taux endettement = crédits seuls (passifs, pas charges totales)
- **R8** — Pension = salaires + fonciers nominatifs uniquement (SCI exclus pour couple)
- **R7** — Clés internes sans accent (`synthese` pas `synthèse`)
- **R10** — Regex fonciers : ne pas capturer les labels d'actifs immobiliers
- **R13/R16** — Anti double-comptage (détail > catégorie)

## 📊 Backtests validés

| Cas | Indicateur | Résultat |
|---|---|---|
| Alexia LAFOSSE | revMens() | 4 326 € ✅ |
| Alexia LAFOSSE | Pension 30 ans, cadre | 576 €/mois ✅ |
| Alexia LAFOSSE | Taux endettement | 84,5 % ✅ |
| Mathieu THOMAS | Taux endettement | 33,0 % ✅ |
| Mathieu THOMAS | Pension 47 ans, cadre | 4 791 €/mois ✅ |
| Eric KEMPF | Pension 50 ans, cadre | 4 931 €/mois ✅ |

---

*Simulations non contractuelles — à usage interne conseiller uniquement.*
