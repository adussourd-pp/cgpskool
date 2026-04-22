# CLAUDE.md — Guide pour Claude Code

## Architecture du projet

**CGP Skool** : outil d'analyse patrimoniale pour conseillers en gestion de patrimoine (CGP).
Application 100% front-end (zéro serveur), déployée via GitHub Pages.

### Fichiers principaux

| Fichier | Rôle | Taille |
|---|---|---|
| `etude-dossier.html` | App principale (~5000+ lignes JS inline) | ~350 Ko |
| `data.js` | Tables de référence (barème IR, taux retraite, COPERNIC) | ~450 lignes |
| `calculs.js` | Fonctions de calcul (fiscal, retraite, patrimoine) | ~500 lignes |
| `assets/cgp-skool-theme.css` | Variables CSS, thème global | |
| `assets/cgp-skool-layout.css` | Layout, sidebar, print CSS | |
| `docs/REGLES_PROJET.md` | Règles de code (R1-R22) + tests de non-régression | Critique |

### Outils secondaires (pages séparées)
`bp-simulator.html`, `comparatif-cgp.html`, `scpi-simulator.html`, `per-vs-av.html`, `immo-simulator.html`, `interets-composes.html`

---

## Architecture de etude-dossier.html

### Structure UI

```
┌──────────────────────────────────────────────────┐
│  <nav class="cs-nav"> — barre de navigation fixe │
├──────────┬───────────────────────────────────────┤
│ sidebar  │  <main class="main">                  │
│ 240px    │  .section-page (une par étape)         │
│ sticky   │  Format A4 (794×1123px)                │
│          │  blanc sur fond beige #ECEAE6          │
│ Étapes:  │                                        │
│ Import   │  panneau-interne = zones conseiller    │
│ Situation│  (hors PDF, display:none en print)     │
│ Patrimoi.│                                        │
│ Fiscal   │                                        │
│ Financ.  │                                        │
│ Retraite │                                        │
│ Transm.  │                                        │
│ Préco.   │                                        │
│ Synthèse │                                        │
│          │                                        │
│ Barre    │                                        │
│ progress │                                        │
│ Profil   │                                        │
└──────────┴───────────────────────────────────────┘
```

### 9 sections principales

| # | ID section | Fonction render | Rôle |
|---|---|---|---|
| 0 | `sec-import` | — | Import Word/texte, avis d'imposition |
| 1 | `sec-situation` | `rSituation()` | Identité, situation familiale, objectifs |
| 2 | `sec-patrimoine` | `rPatrimoine()` | Pyramide actifs, horizons CT/MT/LT |
| 3 | `sec-fiscal` | `rFiscal()` | TMI, IFI, leviers fiscaux |
| 4 | `sec-financement` | `rFinancement()` | Capacité d'emprunt, amortissement |
| 5 | `sec-retraite` | `rRetraite()` | Projection pension, taux remplacement |
| 6 | `sec-transmission` | `rTransmission()` | Succession, droits, abattements |
| 7 | `sec-preconisations` | `rPreconisations()` | Solutions, matrice Copernic |
| 8 | `sec-synthese` | `rSynthese()` | Graphiques avant/après, badge conseiller |

### Navigation et barre de progression

- `goTo(sectionKey)` : change la section active (ajoute classe `active`)
- Les dots/steps dans la sidebar = navigation entre sections
- La barre de progression reflète l'avancement (sections visitées/complétées)
- Clé R7 : les clés internes n'ont PAS d'accent (`synthese`, pas `synthèse`)

### Export PDF

- Sections contrôlées par checkboxes → classe `print-visible`
- `@media print` : seules les `.print-visible` sont rendues
- Page breaks entre sections cochées
- Sidebar, nav, boutons, panneau-interne = masqués en print
- Footer PDF : `.pdf-print-footer` (fixe, se répète sur chaque page)
- Format A4 : `max-width:794px; min-height:1045px`

### Panneau interne (panneau conseiller)

- `#panneauConseiller` : zone de travail du conseiller
- Contient les cards de solutions sélectionnées
- Masqué en print (`display:none`)
- Alimente les "Fiches Client" avec des narratifs personnalisables

---

## Système de profil conseiller

### Stockage localStorage

| Clé localStorage | Contenu |
|---|---|
| `cgpskool_profil_v1` | JSON du profil conseiller (nom, cabinet, ORIAS, etc.) |
| `cgpskool_logo` | Base64 data URL du logo cabinet |
| `cgpskool_photo` | Base64 data URL de la photo profil |
| `cgpskool_mentions` | Texte brut des mentions légales (fiche DER) |
| `cgpskool_avis` | JSON des avis clients manuels |
| `cgpskool_avis_lien` | URL vers page d'avis externe |

### Champs profil (PROFIL_FIELDS)

`pPrenom`, `pNom`, `pCabinet`, `pOrias` (requis), `pTel`, `pEmail`, `pAdresse`, `pCP`, `pVille`, `pMentions`, `pColor1`, `pColor2`

### Profil complet = `nom` + `cabinet` + `orias` renseignés

---

## Mentions légales

### Fonctionnement

- L'utilisateur colle son Document d'Entrée en Relation (DER/fiche légale) dans `#mentionsDirectInput`
- `saveMentionsDirect()` parse le texte et génère un rendu visuel dans `#mentionsPreview`
- Layout 2 colonnes : sidebar sticky (contact + sommaire) + contenu (sections numérotées)
- Helpers : `renderMlCard2()` (cards avec sous-titre), `mlHighlight()` (mots clés en gras)

### Sections détectées (SECTIONS array)

| ID | Regex | Titre affiché | Badge |
|---|---|---|---|
| `immo` | IMMOBILIER ou SES HABILITATIONS | Activité immobilière | TRANSACTION |
| `orias` | IMMATRICULATION.*ORIAS | Immatriculation ORIAS | ORIAS |
| `fin` | FINANCEMENT | Financement | IOBSP |
| `ass` | ASSURANCE | Assurance | IAS |
| `inst` | INSTRUMENTS FINANCIERS | Instruments financiers | CIF |
| `rcp` | ASSURANCES? RCP | Assurance RCP | — |
| `recl` | TRAITEMENT DES RECLAMATIONS | Réclamations | — |
| `med` | MEDIATEURS | Médiateurs | — |

---

## Format "One-Page" — Standard pour les modules outils

Chaque module outil (simulateur, étude) doit suivre ce format.
**RÉFÉRENCE UNIQUE** — toute modification UI doit respecter ces specs.

### Structure

```
┌─────────────────────────────────────────────────────┐
│  <nav class="cs-nav"> — barre noire, logo C, Accueil│
├───────────┬─────────────────────────────────────────┤
│ sidebar   │  .cs-main (fond beige #ECEAE6)          │
│ 320px     │  └─ .cs-page (page A4, fond blanc)      │
│ #F2F1EE   │     ├─ Header (tag orange + titre gras) │
│ sticky    │     ├─ Contenu (cards, KPIs, charts)     │
│           │     ├─ Disclaimer                        │
│ Toggles   │     └─ Pied de page conseiller           │
│ ▶ LABEL   │        (fond beige, pleine largeur,      │
│            │         margin négatif -40px)             │
│           │                                          │
│ [Bouton]  │                                          │
│ orange    │                                          │
└───────────┴─────────────────────────────────────────┘
```

### Imports requis (dans cet ordre)

```html
<link rel="stylesheet" href="assets/cgp-skool-theme.css">
<link rel="stylesheet" href="assets/cgp-skool-layout.css">
<script src="assets/cgp-skool-core.js"></script>
<script src="assets/cgp-skool-nav.js" defer></script>
```

### Sidebar — Standard

| Élément | Classe | Specs |
|---|---|---|
| Conteneur | `.cs-sidebar` (layout.css) | fond `var(--paper)` (#F2F1EE), 320px, sticky, padding `16px 14px` |
| Toggle label | `.cs-sidebar-lbl` (layout.css) | 9px, weight 700, uppercase, letter-spacing 0.18em, couleur `var(--ink-60)` |
| Toggle icône | `<span class="acc">▶</span>` | 7px, rotate 90deg quand `.open` |
| Toggle body | `.sb-body` | max-height 0→2000px, transition 0.3s |
| Toggle onclick | `onclick="CGP.toggleAcc(this)"` | ou alias local `var toggleAcc=CGP.toggleAcc;` |
| Pas de trait | — | Pas de `.sidebar-divider` entre les toggles |
| Tous ouverts | `class="... open"` | Label ET body ont la classe `open` par défaut |

### Sidebar — Inputs

| Élément | Specs |
|---|---|
| Input label | 10px, weight 600, uppercase, letter-spacing 0.08em, couleur `var(--gris)` |
| Input text/number | fond `#fff`, bordure `1.5px solid var(--bord)`, border-radius `7px`, font-size `13px`, weight 500, couleur `var(--noir)`, padding `8px 10px` |
| Input focus | `border-color: var(--orange)` |
| Select | Même style que input + `cursor:pointer` |
| Slider range | accent-color `var(--orange)`, height `4px`, background `rgba(0,0,0,0.08)` |
| Slider thumb | 14px, round, background `var(--orange)`, cursor pointer |
| Slider valeur | 12px, weight 700, couleur `var(--orange)` |
| Slider labs (min/max) | 9px, couleur `var(--ink-30)` |

### Sidebar — Boutons

**Règle : 1 seul bouton par module.**

| Type de module | Bouton | Style |
|---|---|---|
| Avec calcul (Lancer/Calculer) | **Orange** `var(--orange)` | Texte blanc, pas de border-radius, hover `var(--orange-hover)` |
| Sans calcul (live) | **Vert** `#2D7A5B` | Texte "⬇ Exporter PDF", pas de border-radius, hover opacity 0.85 |

**JAMAIS 2 boutons** (pas de Exporter en doublon sous le bouton action).
L'export se fait via Ctrl+P (`CGP.pdf.print()` déclenché automatiquement par `beforeprint`).

Specs bouton : `width:100%; padding:10px; font-size:13px; font-weight:500; font-family:var(--sans); border:none; cursor:pointer`

### Sidebar — Classes HTML standard (référence : scpi-financement.html)

```html
<!-- Label + Input -->
<div class="fg"><label>Nom du champ</label>
  <div class="fi-row"><input type="number" id="xxx" value="0"><span class="fi-unit">€</span></div>
</div>

<!-- Label + Select -->
<div class="fg"><label>Choix</label>
  <select class="fi" id="xxx"><option>...</option></select>
</div>

<!-- Label + Input simple (sans unité) -->
<div class="fg"><label>Texte</label>
  <input class="fi" type="text" id="xxx" placeholder="...">
</div>

<!-- Grille 2 colonnes -->
<div class="grid2">
  <div class="fg">...</div>
  <div class="fg">...</div>
</div>
```

**Classes CSS sidebar :**
- `.fg` : conteneur label + input (flex column, gap 4px, margin-bottom 12px)
- `.fg label` : 9px, weight 600, uppercase, letter-spacing 0.06em, color var(--gris)
- `.fi` : input/select standard (border 1.5px solid var(--bord), border-radius 7px, padding 8px 10px, font-size 13px)
- `.fi-row` : conteneur input + unité (flex, border, border-radius 7px)
- `.fi-unit` : unité à droite (padding 7px 9px, font-size 11px, color var(--gris), border-left)
- `.grid2` : grille 2 colonnes (gap 6px)

**NE PAS utiliser** les anciennes classes `.pr`, `.pl`, `.iu`, `.iu-u` — elles sont dépréciées.

### Page A4 — Résultats (référence : scpi-financement.html)

**Ordre des blocs résultats :**
1. Header client/conseiller + date
2. Bloc emprunteur/capacité (noms, revenus, charges, endettement avant/après)
3. Détail investissement + Conditions de financement (côte à côte)
4. Équation (mensualité − revenus = effort/gain, toujours en valeur positive)
5. Bilans côte à côte (Pendant / Au terme)
6. Graphique (doughnut ou chart)
7. Tableau annuel détaillé

**Classes CSS résultats :**
- `.card` : bloc blanc avec bordure (border 1.5px solid var(--bord), border-radius 11px, padding 14px)
- `.card-title` : titre avec point orange (font-weight 700, font-size 14px)
- `.bl-row` : ligne label/valeur (flex, justify-content space-between, padding 6px 0, border-bottom)
- `.bl-k` : label gauche (font-size 12px, color var(--gris))
- `.bl-v` : valeur droite (font-size 13px, font-weight 600)
- `.bl-v.gold` : couleur orange
- `.bl-v.green` : couleur verte
- `.bl-v.red` : couleur rouge
- `.bilan-2` : conteneur 2 bilans côte à côte (display grid, 1fr 1fr)
- `.bl-title` : titre de bilan (font-weight 700, uppercase, border-bottom)
- `.eq` : conteneur équation (display flex, gap, align-items center)
- `.eq-b` : bulle équation (background, padding, border-radius)
- `.eq-op` : opérateur (font-size 20px, color var(--gris))

### Page A4 — Header

```
┌─────────────────────────────────────────────────┐
│ TAG MODULE (orange 10px uppercase)    Client     │
│                                       30/03/2026 │
└─────────────────────────────────────────────────┘
```

| Élément | Specs |
|---|---|
| Tag | 10px, weight 500, letter-spacing 0.22em, uppercase, couleur `var(--orange)` |
| Titre client | 18-24px, weight 700, font-family `var(--sans)`, couleur `var(--noir)` |
| Date | 12-13px, weight 300, couleur `var(--gris)` |

### Page A4 — Contenu

| Élément | Specs |
|---|---|
| KPI label | 9px, weight 600, uppercase, letter-spacing 0.08em, couleur `var(--gris)` |
| KPI valeur | 18px, weight 700 |
| KPI sous-texte | 10px, couleur `var(--gris)` |
| Card | fond `#fff`, bordure `1.5px solid var(--bord)`, border-radius `10px`, padding `20px` |
| Section label | 9px, weight 700, uppercase, letter-spacing 0.22em, couleur `var(--ink-30)` |

### Pied de page conseiller

- Fond beige `#F2F1EE`, pleine largeur via `margin: 28px -40px -40px -40px`
- Gauche : nom (16px bold), cabinet (11px gris), tel + email en ligne (11px gris, icônes ☎ ✉)
- Droite : logo cabinet dans un rond (52px, fond blanc, bordure, `border-radius:50%`)
- Données chargées depuis `localStorage('cgpskool_profil_v1')` + `localStorage('cgpskool_logo')`

### Profil conseiller (localStorage)

| Clé localStorage | Contenu |
|---|---|
| `cgpskool_profil_v1` | JSON : pPrenom, pNom, pCabinet, pOrias, pTel, pEmail, pAdresse, pCp, pVille, pMentions, hImmo, hIobsp, hIas, hAgent, hCif |
| `cgpskool_logo` | Base64 data URL du logo cabinet |
| `cgpskool_photo` | Base64 data URL de la photo profil |

### Print CSS — Règles critiques

**R23 — TOUJOURS préserver les couleurs au PDF (et JAMAIS `*`)**

Par défaut, Chrome/Edge strip les fonds/couleurs à l'impression pour économiser l'encre. Sans la règle, les KPI orange/verts, badges, headers de tableau, card backgrounds, etc. apparaissent en gris/blanc dans le PDF exporté.

**Tout nouveau module avec des fonds colorés, bordures colorées, ou textes en couleur DOIT inclure une règle `print-color-adjust: exact` ciblée** (pas sur `*` — ça rend le texte flou) :

```css
/* ✅ BON — ciblé : élargir la liste selon les classes du module */
.card,.kpi,.badge,.tool-card,.card-title .n,.tbl th,.tbl tfoot td,
.ph-tag,.pos,.neg,.gold,.green,.red,.sri-chip,
[style*="background"]{
  -webkit-print-color-adjust:exact !important;
  print-color-adjust:exact !important;
}

/* ❌ MAUVAIS — rend le texte flou (désactive l'anti-aliasing) */
*{-webkit-print-color-adjust:exact !important}
```

**Checklist avant commit d'un nouveau module** :
1. Lister tes classes avec fond/bordure/couleur non-défaut
2. Les ajouter au sélecteur ciblé ci-dessus
3. Ctrl+P (ou `CGP.pdf.print()`) pour prévisualiser le rendu PDF
4. Si un fond/couleur est absent → sélecteur manquant à ajouter

**Reconnaître le bug** : symptôme = "les couleurs disparaissent au PDF" / "le PDF sort tout gris" → oubli de R23.

**R24 — Les graphiques Chart.js (canvas) ne s'impriment PAS.**
Les `<canvas>` apparaissent vides/blancs en impression. Solution :
- `cgp-skool-core.js` convertit automatiquement les canvas en images PNG via `beforeprint`/`afterprint`
- Pour le bouton d'export : appeler `CGP.pdf.print()` (conversion + `window.print()` + restauration)
- Pour les modules avec leur propre logique d'export (ex: `etude-dossier.html`) : déclarer `CGP.pdf.customHandler = true` pour empêcher le double traitement
- Ne JAMAIS appeler `window.print()` directement dans un module avec des graphiques

**R25 — Le footer conseiller (`#conseillerFooter`) DOIT rester le dernier bloc et NE PAS être enveloppé.**

`CGP.footer.render` génère `<div style="background:#F2F1EE;margin:28px -40px -40px -40px;...">` — les `-40px` débordent les 40px de padding de `.cs-page` en écran. En print le padding tombe à 20px et le `-40px` bas ferait déborder le fond beige sur la page suivante (symptôme = "barre grise sous le footer") + le bloc peut se couper en deux (symptôme = "footer coupé").

La correction globale est dans `cgp-skool-layout.css` (`@media print` → section 9b) :
```css
#conseillerFooter,#conseillerFooter>div{
  break-inside:avoid!important;page-break-inside:avoid!important
}
#conseillerFooter>div{margin:16px -20px 0 -20px!important}
```

**À respecter dans les nouveaux modules** :
- L'élément d'ancrage DOIT avoir `id="conseillerFooter"` (pas de wrapper intermédiaire)
- Le footer doit être le **dernier** enfant de `.cs-page`, sans bloc après
- Ne **pas** dupliquer le CSS footer dans le module (déjà géré globalement)
- Si tu changes le nom de l'ID ou la structure, mets à jour R25 + `cgp-skool-layout.css`

**Print CSS partagé** : géré dans `cgp-skool-layout.css` (ne pas dupliquer dans les modules).

### Processus de modification UI

1. **Audit** → lister les écarts par rapport à ce standard
2. **Plan écrit** → proposer les changements fichier par fichier
3. **Validation utilisateur** → attendre le OK avant d'exécuter
4. **Exécution** → un fichier à la fois, vérif visuelle
5. **Jamais** de modification en masse par agent sans plan validé
6. **Toute nouvelle classe UI** va dans `cgp-skool-layout.css`, pas en inline

---

## Architecture partagée (fichiers communs)

### 4 fichiers = infrastructure complète

| Fichier | Rôle |
|---|---|
| `cgp-skool-theme.css` | Tokens design (couleurs, polices, composants de base) |
| `cgp-skool-layout.css` | Layout (grille, sidebar, page A4, print CSS, responsive) |
| `cgp-skool-core.js` | Profil (`CGP.profil`), utils (`CGP.fmt`), footer, export/import JSON, PDF |
| `cgp-skool-nav.js` | Sidebar navigation injectée automatiquement |

### Template module

Chaque nouveau module doit inclure :
```html
<link rel="stylesheet" href="assets/cgp-skool-theme.css">
<link rel="stylesheet" href="assets/cgp-skool-layout.css">
<script src="assets/cgp-skool-core.js"></script>
<script src="assets/cgp-skool-nav.js" defer></script>
```

Structure HTML :
```html
<nav class="cs-nav">...</nav>
<div class="cgp-app">
  <nav id="cgp-nav-slot"></nav>
  <div class="cgp-module">
    <!-- contenu du module -->
    <div id="conseillerFooter"></div>
  </div>
</div>
```

En fin de script :
```javascript
CGP.footer.render(document.getElementById('conseillerFooter'));
```

### Ajouter un module à la navigation

Ajouter une entrée dans le tableau `MODULES` de `cgp-skool-nav.js` :
```javascript
{ id: 'mon-module', icon: '\uD83D\uDCCB', name: 'Mon Module', href: 'mon-module.html' }
```

### Profil conseiller

- Édité uniquement dans `index.html` (modal profil)
- Lu partout via `CGP.profil.load()` (retourne les 2 formats : `prenom` + `pPrenom`)
- Sauvé via `CGP.profil.save(data)` (écrit les 2 formats)
- `index.html?openProfil=1` ouvre automatiquement le modal

### Export/Import projet JSON

- `CGP.project.registerModule(id, {getState, setState})` : enregistre un module
- `CGP.project.autoSave(id)` : sauvegarde l'état dans localStorage (appeler après `calc()`)
- `CGP.project.exportAll()` : exporte profil + tous les modules en JSON
- `CGP.project.importAll(file)` : restaure tout depuis un fichier JSON

---

## Git — Branches et workflow

### Branches

- `master` : branche principale locale (= `origin/main` sur GitHub)
- Les feature branches Claude suivent le format `claude/<nom>-<id>`

### ⚠️ LEÇONS APPRISES — NE PAS REPRODUIRE

1. **Toujours travailler sur `master` pour les changements directs** : la branche locale principale est `master`, pas `main`. `origin/main` est le remote. Pour push sur main : `git push origin master:main`.

2. **Ne jamais créer de feature branch divergente** quand on veut push directement sur main. Si l'utilisateur dit "push sur main", travailler sur `master` et `git push origin master:main`.

3. **Vérifier la branche AVANT de coder** : `git branch` pour savoir où on est. Si on est sur une feature branch avec un historique divergent, le merge/cherry-pick vers master créera des conflits.

4. **Historiques divergents** : si `git merge` échoue avec "unrelated histories", c'est que les branches ont été créées indépendamment. Ne pas utiliser `--allow-unrelated-histories` aveuglément — ça crée des conflits massifs.

5. **Pour force push** : `git push --force origin <branch>` — toujours confirmer avec l'utilisateur d'abord.

---

## Règles de travail

- **AVANT toute modification** : analyser l'impact potentiel et prévenir l'utilisateur si risque de casser quelque chose. Ne jamais exécuter une commande complexe sans analyse préalable.
- **Fonctions critiques** : NE JAMAIS modifier la structure interne de `renderSolsRetenues`, `renderFichesClient`, `rSituation`, `rPatrimoine`, `rFiscal`, `rRetraite`. Ajouter du code AUTOUR avec des try/catch.
- **Commits atomiques** : une feature = un commit. Tester R2b + R2c avant chaque commit.
- **Si ça casse** : `git checkout <dernier-bon-commit> -- etude-dossier.html` pour revenir en arrière.

## Règles de code critiques (résumé de docs/REGLES_PROJET.md)

- **R1** : Pas de quotes autour de font-family dans les strings JS
- **R2** : Pas de `\xa0` (espace insécable) dans le code
- **R2b** : **JAMAIS de curly/smart quotes** (`'` `'` `"` `"`) dans le code. Toujours utiliser les apostrophes droites (`'` `"`). Après chaque Edit, vérifier avec : `grep -Pn $'\xe2\x80\x99|\xe2\x80\x98' etude-dossier.html`
- **R2c** : **Vérifier la syntaxe JS** après chaque modification. Trouver le bon `<script>` avec `grep -n '^<script>' etude-dossier.html` puis `sed -n 'START,ENDp' etude-dossier.html > /tmp/check.js && node --check /tmp/check.js`
- **R3** : Pas de doublon de variable
- **R4** : Revenus stockés ANNUELS, `revMens()` divise par 12
- **R7** : Clés internes sans accent (`synthese` pas `synthèse`)
- **R21** : Chart.js ne résout pas les CSS variables → utiliser hex/rgba + "Inter"
- **R22** : mammoth parser & Format-A doivent implémenter R10, R13, R16

### Tests de non-régression (4 cas canoniques)

Voir `docs/REGLES_PROJET.md` pour les valeurs attendues :
- Alexia LAFOSSE & François LIÈVRE (couple)
- Mathieu THOMAS (célibataire)
- Éric KEMPF (couple)
- Marie Aude KEMPF (couple)

---

## Variables CSS principales

```
--orange, --orange-hover  : couleur primaire (ambre/orange)
--serif, --sans           : familles de polices
--noir, --gris, --gris-f  : texte (noir, gris, gris foncé)
--gris-l                  : fond clair
--bord                    : bordures légères
--o-dim                   : orange atténué (backgrounds)
```

---

## Commandes utiles

```bash
# Voir la branche courante
git branch

# Push master vers main sur GitHub
git push origin master:main

# Vérifier les fonctions dans etude-dossier.html
grep -n "function " etude-dossier.html | head -40
```
