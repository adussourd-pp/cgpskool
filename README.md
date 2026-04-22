# CGP Skool — Outils patrimoniaux

> Outils libres pour conseillers en gestion de patrimoine (Prodémial / Peak Patrimoine).
> Zéro serveur · Zéro coût · Fonctionne 100% dans le navigateur.

## 🚀 Accès

**GitHub Pages** : `https://[user].github.io/cgpskool/`

## 📋 Outils disponibles

### Outils patrimoniaux (client)

| Outil | Fichier | État |
|---|---|---|
| **Étude de Dossier** | `modules/etude-dossier.html` | ✅ v2.0 |
| PER vs Assurance Vie | `modules/per-vs-av.html` | ✅ Opérationnel |
| SCPI Cash | `modules/scpi-simulator.html` | ✅ Bêta |
| SCPI Financement | `modules/scpi-financement.html` | ✅ Bêta |
| Immobilier locatif (LMNP) | `modules/immo-simulator.html` | ✅ Opérationnel |
| Intérêts composés | `modules/interets-composes.html` | ✅ Opérationnel |

### Outils développement réseau (conseiller)

| Outil | Fichier | État |
|---|---|---|
| Business Plan | `modules/bp-simulator.html` | ✅ Opérationnel |

## ✨ Étude de Dossier v2 — fonctionnalités

- **Import RI** : Word (.docx) via mammoth.js ou copier-coller texte brut
- **Avis d'imposition** : upload PDF (PDF.js)
- **Barème IR 2025** (Loi de Finances 14/02/2025) — toutes situations × enfants
- **Tables retraite** : 6 CSP × âge actuel, espérance de vie (interpolation linéaire R19)
- **Matrice Copernic** : objectifs → solutions avec calculs automatiques
- **Préconisations** : textes narratifs avec `{capital}`, `{horizon}`, `{impots}` calculés
- **Synthèse avant/après** : 3 graphiques Chart.js + stepper visuel
- **Profil conseiller** : persistant en localStorage, injecté dans chaque étude
- **Export PDF** : conversion canvas→PNG, en-tête/pied conseiller, @media print A4

## 📁 Structure du projet

```
/
├── index.html              ← Hub d'accueil (2 sections : outils client + réseau)
├── articles.html           ← Bibliothèque d'articles (manifest dynamique)
├── favicon.svg
├── modules/                ← 16 outils HTML (etude-dossier, simulateurs, etc.)
│   ├── etude-dossier.html  ← Outil principal (standalone, data.js + calculs.js inline)
│   ├── per-vs-av.html
│   ├── scpi-simulator.html
│   ├── scpi-financement.html
│   ├── immo-simulator.html
│   ├── interets-composes.html
│   ├── bp-simulator.html   ← Business Plan réseau (PMR, qualifications, CA)
│   └── ...
├── assets/                 ← Design system & scripts partagés
│   ├── cgp-skool-theme.css     ← Tokens design (Inter + Playfair Display)
│   ├── cgp-skool-layout.css    ← Layout, sidebar, print CSS
│   ├── cgp-skool-core.js       ← CGP.profil, CGP.fmt, CGP.footer, CGP.pdf
│   ├── cgp-skool-nav.js        ← Nav universelle, guide, boutons sidebar
│   ├── cgp-skool-feedback.js   ← Widget feedback Tally
│   └── cgp-skool-scpi-data.js  ← Données SCPI partagées
├── docs/
│   ├── REGLES_PROJET.md    ← Règles de code R1-R22 + cas de non-régression
│   └── SIDEBAR_STANDARD.md ← Standard sidebar des modules
├── data.js                 ← Tables de référence (source: Excel ED_RI_62)
├── calculs.js              ← Fonctions de calcul patrimonial (testées)
└── README.md
```

> **Note** : `data.js` et `calculs.js` sont **aussi injectés inline** dans `etude-dossier.html`
> pour qu'il soit standalone (fonctionne en ouvrant directement le fichier HTML).

## 🛠️ Déploiement GitHub Pages

1. Créer un repo `cgpskool` (privé recommandé)
2. Pousser tous les fichiers sur la branche `main`
3. `Settings` → `Pages` → Source : `main` / `/ (root)`
4. L'URL sera : `https://[username].github.io/cgpskool/`

## 🔑 Règles de code (docs/REGLES_PROJET.md)

### Calculs patrimoniaux
- **R4** — Revenus stockés en ANNUEL, `revMens()` divise par 12
- **R5** — Taux endettement = crédits seuls (passifs, pas charges totales)
- **R8** — Pension = salaires + fonciers nominatifs uniquement (SCI exclus pour couple)
- **R18** — Pondération salaires par âge (txSal = 0.70 si âge moyen ≥ 57)
- **R19** — Taux retraite et espérance de vie : interpolation linéaire (pas ceiling)
- **R20** — CSP_MAP unique dans data.js (jamais de redéclaration locale)

### Code et parsing
- **R1** — Pas de quotes autour des font-family dans les strings JS
- **R7** — Clés internes sans accent (`synthese` pas `synthèse`)
- **R10** — Regex fonciers : ne pas capturer les labels d'actifs immobiliers
- **R13/R16** — Anti double-comptage (détail > catégorie)
- **R21** — Chart.js : couleurs hex/rgba (pas de CSS vars dans canvas), police `'Inter'`
- **R22** — Parser mammoth = mêmes protections que parser Format-A

### Sources de données validées

| Source | Date | Fichiers |
|---|---|---|
| Excel ED_RI_62 (Omnium Finance) | 2025 | data.js |
| PMR Prodémial — Convention Cadre Annexe 1 | nov. 2021 | bp-simulator.html |
| Doc Suravenir — Cristalliance Avenir | 01/01/2026 | comparatif-cgp.html |
| Article ADI — Bilan Prosper Conseil 2026 | jan. 2026 | comparatif-cgp.html |
| Webinaire CGPulse — SilmaTec Finance | 30/01/2026 | comparatif-cgp.html |

## 📊 Backtests validés

| Cas | Indicateur | Résultat |
|---|---|---|
| Cas n°1 — Couple | revMens() | 4 326 € ✅ |
| Cas n°1 — Couple | Pension 30 ans, cadre (48%) | 576 €/mois ✅ |
| Cas n°1 — Couple | Taux endettement | 84,5 % ✅ |
| Cas n°2 — Célibataire | Taux endettement | 33,0 % ✅ |
| Cas n°2 — Célibataire | Pension 47 ans, cadre (interpolé 54%) | 4 704 €/mois ✅ |
| Cas n°3 — Couple | Pension 50 ans, cadre (55%) | 4 931 €/mois ✅ |
| Cas n°4 — Couple | Pension 48 ans, non cadre (interpolé 62%) | 465 €/mois ✅ |

---

*Simulations non contractuelles — à usage interne conseiller uniquement.*
