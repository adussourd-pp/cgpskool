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
| `cgp-skool-theme.css` | Variables CSS, thème global | |
| `cgp-skool.css` | Styles spécifiques composants | |
| `REGLES_PROJET.md` | Règles de code (R1-R22) + tests de non-régression | Critique |

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

## Règles de code critiques (résumé de REGLES_PROJET.md)

- **R1** : Pas de quotes autour de font-family dans les strings JS
- **R2** : Pas de `\xa0` (espace insécable) dans le code
- **R2b** : **JAMAIS de curly/smart quotes** (`'` `'` `"` `"`) dans le code. Toujours utiliser les apostrophes droites (`'` `"`). Après chaque Edit, vérifier avec : `grep -Pn $'\xe2\x80\x99|\xe2\x80\x98' etude-dossier.html`
- **R2c** : **Vérifier la syntaxe JS** après chaque modification : extraire le bloc `<script>` et lancer `node --check`. Commande : `sed -n '2124,6790p' etude-dossier.html > /tmp/check.js && node --check /tmp/check.js`
- **R3** : Pas de doublon de variable
- **R4** : Revenus stockés ANNUELS, `revMens()` divise par 12
- **R7** : Clés internes sans accent (`synthese` pas `synthèse`)
- **R21** : Chart.js ne résout pas les CSS variables → utiliser hex/rgba + "Inter"
- **R22** : mammoth parser & Format-A doivent implémenter R10, R13, R16

### Tests de non-régression (4 cas canoniques)

Voir `REGLES_PROJET.md` pour les valeurs attendues :
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
