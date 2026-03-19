# CGP Skool — Étude de Dossier
## Règles absolues & Tests de non-régression

---

## RÈGLES DE CODE — À VÉRIFIER AVANT CHAQUE LIVRAISON

### R1 — font-family dans les strings JS
```js
// INTERDIT — casse la string JS
html += '<div style="font-family:\'Space Grotesk\',sans-serif">';

// CORRECT
html += '<div style="font-family:Space Grotesk,sans-serif">';
```

### R2 — Caractère \xa0 dans le code JS
Provoque "Invalid or unexpected token". Utiliser des espaces normaux dans le code.

### R3 — Pas de doublon de variable
Chercher si une variable existe déjà avant d'en déclarer une nouvelle (y compris dans les déclarations groupées `let a, b, c`).

### R4 — Revenus ANNUELS dans le RI
- `ED.revenus.c1` / `sal1` = salaires annuels
- `ED.revenus.fonc` = fonciers annuels
- `revMens()` = (sal + fonc×0.70) / 12

### R5 — Taux endettement = crédits SEULEMENT
`chrCredit` = échéances passifs /mois. PAS les charges totales (PER, leasing, éducation exclus).

### R6 — Pension retraite = salaires SEULS
`pensM = Math.floor(ED.revenus.c1 / 12 * taux / 100)`. Fonciers exclus.

### R7 — Clés internes sans accent
`goTo('synthese')` pas `goTo('synthèse')`. Texte affiché peut avoir des accents, pas les clés.

---

## TESTS DE NON-RÉGRESSION

### Cas 1 — Alexia LAFOSSE & François LIEVRE (couple, séparation de biens)
| Indicateur | Attendu |
|---|---|
| Revenus nets /mois | 4 326 € |
| Charges crédit /mois | 3 654 € |
| Taux endettement | 84,5 % |
| Reste à vivre | 672 € |
| IR net | 0 € |
| Pension Alexia (55 ans, Sal. cadre) | 576 €/mois |
| Manque Alexia (souh. 3 000 €) | 2 424 €/mois |


### Cas 3 — Eric & Marie Aude KEMPF (couple, séparation de biens, 3 parts)
| Indicateur | Attendu |
|---|---|
| Revenus nets /mois (couple) | (104 000+9 000+3 600×0,70)/12 = **9 627 €** |
| Charges crédit /mois | 12 000/12 = **1 000 €** |
| Taux endettement (couple) | 1 000/9 627 = **10,4 %** |
| Reste à vivre | 9 627−1 000 = **8 627 €** |
| IR net | **15 638 €** |
| TMI | **30 %** |
| Pension Eric (50 ans, Sal. cadre, départ 60) | (104 000+3 600)/12×55% = **4 931 €/mois** |
| Pension Marie Aude (48 ans, Sal. non cadre) | 9 000/12×62% = **465 €/mois** |

**Règle confirmée :** pension = (salaires + fonciers BRUTS) / 12 × taux (sans pondération 70%)
**Règle confirmée :** endettement = couple complet

### Cas 2 — Mathieu THOMAS (seul, séparé, 2 enfants)
| Indicateur | Attendu |
|---|---|
| Revenus nets /mois | 8 713 € |
| Charges crédit /mois | 2 879 € |
| Taux endettement | 33,0 % |
| Reste à vivre | 5 834 € |
| IR net | 13 670 € |
| TMI | 41 % |
| Pension (67 ans, Sal. cadre) | 4 791 €/mois |
| Impact mensuel (souh. 3 500 €) | +1 291 € (surplus) |

---

## CHECKLIST AVANT LIVRAISON

- [ ] 0 occurrence de `font-family:'` dans le script
- [ ] 0 caractère `\xa0` dans le script
- [ ] `steps` déclaré 1 seule fois
- [ ] Structure HTML : script avant /script avant /body
- [ ] Test Alexia : revMens() = 4 326 €
- [ ] Test Mathieu : endett = 33,0 %
- [ ] Test Mathieu : pension = 4 791 €

---

## NOMENCLATURE HORIZONS (Excel V12)

| Court terme | Moyen terme | Long terme |
|---|---|---|
| Livret A/Bleu/Jeune | PEL, CAT | Immobilier, SCPI |
| Compte courant | Assurance vie | PER, PERP |
| LDDS, LEP, CEL | Contrat de capi | Sociétés, Foncier |
| Livret classique | PEA, PEE, CTO | PERCO, Art.83, Madelin |

## TAUX DE PONDÉRATION REVENUS

| Type | Endettement | Retraite |
|---|---|---|
| Salaires, BIC, BNC | 100% | 100% |
| Revenus fonciers | 70% | Exclus |

---

## RÈGLE R8 — Base de calcul pension retraite

La pension est calculée sur les **revenus BRUTS totaux** (salaires + fonciers), sans appliquer le 70%.

```js
// CORRECT — revenus bruts pour la retraite
var revBrutMensuel = (sal + foncBrut) / 12;
var pension = Math.floor(revBrutMensuel * tauxRemplacement / 100);

// INTERDIT — pondération 70% sur les fonciers pour la retraite
var pension = Math.floor(revMens() * tauxRemplacement / 100); // revMens() applique 70%
```

Pour un couple, les fonciers sont répartis 50/50 entre C1 et C2.

---

## RÈGLE R9 — Endettement calculé sur le couple complet

Le taux d'endettement et le reste à vivre utilisent **les revenus nets du couple** (`revMens()` = salaires couple + fonciers×70% / 12), pas C1 seul.

```js
// CORRECT
const endett = chrCredit / revMens() * 100;  // couple complet

// INTERDIT
const endett = chrCredit / (ED.revenus.c1 / 12) * 100;  // C1 seul
```

---

## TEST — Calcul bilan retraite (validation complète)

### Formule générale
```
revBrutMensuel(n) = (sal_n + fonc_n_brut) / 12
pension_n        = floor(revBrutMensuel(n) × tauxRemplacement(csp, age) / 100)
manque_n         = pensionSouhaitee_n - pension_n   (négatif = surplus)
capitalCible     = manque × 12 / 0.04               (rendement 4% pour la rente)
effortMensuel(r) = capitalCible / ((1+r)^h - 1) * r / 12
```

### Cas Eric KEMPF — Salarié cadre, 50 ans, départ 60 ans

| Données | Valeur |
|---|---|
| Salaires Eric | 104 000 €/an |
| Revenus fonciers Ostheim (bruts) | 3 600 €/an |
| CSP | Salarié cadre |
| Taux remplacement à 60 ans (Sal. cadre) | **55 %** |

**Calcul :**
```
revBrutMensuel = (104 000 + 3 600) / 12 = 8 967 €/mois
pension        = floor(8 967 × 55 / 100) = 4 931 €/mois
manque         = 5 000 − 4 931 = 69 €/mois  ← surplus (impact = −69 €)
capitalCible   = 69 × 12 / 0.04 = 20 700 €
```
PDF attendu : pension **4 931 €**, impact foyer **−69 €** ✓

---

### Cas Marie Aude KEMPF — Salarié non cadre, 48 ans, départ 60 ans

| Données | Valeur |
|---|---|
| Salaires Marie Aude | 9 000 €/an |
| Revenus fonciers | 0 |
| CSP | Salarié non cadre |
| Taux remplacement à 60 ans (Sal. non cadre) | **62 %** |

**Calcul :**
```
revBrutMensuel = 9 000 / 12 = 750 €/mois
pension        = floor(750 × 62 / 100) = 465 €/mois
manque         = 1 000 − 465 = 535 €/mois
capitalCible   = 535 × 12 / 0.04 = 160 500 €
```
PDF attendu : pension **465 €**, impact foyer **−535 €** ✓

---

### Cas Mathieu THOMAS — Salarié cadre, 47 ans, départ 67 ans

```
revBrutMensuel = 104 551 / 12 = 8 713 €/mois  (pas de fonciers)
pension        = floor(8 713 × 55 / 100) = 4 791 €/mois
manque         = 3 500 − 4 791 = −1 291 €/mois  ← surplus
```
PDF attendu : pension **4 791 €**, impact **+1 291 €** ✓

---

### Cas Alexia LAFOSSE — Salarié cadre, 30 ans, départ 55 ans

```
revBrutMensuel = 14 400 / 12 = 1 200 €/mois  (fonciers SCI partagés : 33014/2 = 16507 bruts)
Mais PDF utilise salaires seuls pour Alexia → 14 400 / 12 = 1 200 €/mois
pension        = floor(1 200 × 48 / 100) = 576 €/mois
manque         = 3 000 − 576 = 2 424 €/mois
```
PDF attendu : pension **576 €**, impact **−2 424 €** ✓

> **Note :** Pour Alexia, les fonciers SCI sont des revenus fonciers déclarés au niveau du foyer,
> non attribuables à un seul conjoint pour le calcul de la pension individuelle.
> Le PDF utilise les salaires seuls → **sal_n / 12** sans fonciers dans ce cas.
> Règle à appliquer : fonciers inclus UNIQUEMENT si déclarés nominativement sur C1 ou C2.

---

### Tableau des taux de remplacement (source graphique étude)

| CSP | 65 ans | 60 ans | 55 ans | 50 ans | 45 ans | 40 ans | 35 ans | 30 ans |
|---|---|---|---|---|---|---|---|---|
| Fonctionnaire | 84% | 75% | 70% | 65% | 65% | 60% | 60% | 60% |
| Sal. non cadre | 76% | 70% | 67% | 64% | 60% | 57% | 56% | 54% |
| Sal. cadre | 60% | 58% | 57% | 55% | 54% | 52% | 50% | 48% |
| TNS lib. | 60% | 51% | 45% | 44% | 43% | 42% | 41% | 40% |
| Sal. cadre sup. | 54% | 50% | 50% | 49% | 46% | 44% | 43% | 43% |
| TNS artisan | 54% | 50% | 48% | 45% | 43% | 43% | 42% | 41% |

Le taux utilisé = interpolation sur l'âge actuel du client (pas l'âge de départ).

---

## TABLE ESPÉRANCE DE VIE (départ à la retraite → mois restants)

| Âge départ | Madame | Monsieur |
|---|---|---|
| 55 ans | 377 mois | 313 mois |
| 57 ans | 355 mois | 294 mois |
| 60 ans | 323 mois | 265 mois |
| 62 ans | 302 mois | 247 mois |
| 64 ans | 273 mois | 229 mois |
| 65 ans | 261 mois | 217 mois |
| 67 ans | 240 mois | 193 mois |

**Interpolation** : pour un âge non listé, interpoler linéairement entre les deux valeurs encadrantes.

**Formule impact retraite :**
```
espVie       = table[civ][ageDepart]  (en mois)
manque       = pensionSouhaitee - pensionEstimee  (€/mois)
impactRetraite = manque × espVie                  (€ total)
```

**Vérifications PDF :**
- Alexia (Mme, départ 55 ans) : 377 mois × 2 424 = 913 848 € ← impact individuel
- François (M, départ 55 ans) : 313 mois × 9 424 = 2 949 712 €
- PDF Alexia+François total = −3 863 560 € ✓ (sum des deux)
- Mathieu (M, départ 67 ans) : 193 mois × 1 291 = 249 163 € ✓
- Eric (M, départ 60 ans) : 265 mois × 69 = 18 285 €
- Marie Aude (Mme, départ 60 ans) : 323 mois × 535 = 172 805 €
- PDF Eric+Marie total = −191 090 € ✓

---

## TABLE TAUX DE REMPLACEMENT (axes : âge actuel)

| CSP | 0-29 | 30 | 35 | 40 | 45 | 50 | 55 | 60 | 65 |
|---|---|---|---|---|---|---|---|---|---|
| Salarié cadre | 48% | 48% | 50% | 53% | 54% | 55% | 56% | 57% | 60% |
| Salarié cadre sup. | 42% | 42% | 43% | 45% | 47% | 49% | 50% | 52% | 54% |
| Salarié non cadre | 54% | 54% | 56% | 57% | 60% | 64% | 67% | 70% | 75% |
| Fonctionnaire | 60% | 60% | 60% | 60% | 60% | 65% | 70% | 75% | 85% |
| TNS Prof. libérale | 40% | 40% | 41% | 42% | 43% | 44% | 45% | 54% | 60% |
| TNS Commerçant | 41% | 41% | 42% | 43% | 44% | 45% | 48% | 50% | 54% |

**Lecture :** colonne = âge actuel du client (pas l'âge de départ).
Interpoler entre deux colonnes si l'âge est entre deux valeurs.

**Vérifications :**
- Mathieu, 47 ans, Sal. cadre → entre 45 (54%) et 50 (55%) → ~55% ✓
- Eric, 50 ans, Sal. cadre → 55% ✓
- Marie Aude, 48 ans, Sal. non cadre → entre 45 (60%) et 50 (64%) → ~62% ✓
- Alexia, 30 ans, Sal. cadre → 48% ✓

---

## PONDÉRATION REVENUS (selon âge — config Excel)

Seuil : avant 56 ans → 100%, à partir de 57 ans → 70% (sauf exceptions)

| Type de revenu | < 56 ans | ≥ 57 ans |
|---|---|---|
| Salaires | 100% | 70% |
| BA | 100% | 70% |
| BIC Pro | 100% | 70% |
| BIC non Pro | 100% | 70% |
| BNC Pro | 100% | 70% |
| BNC non Pro | 100% | 70% |
| Auto-entrepreneur | 100% | 70% |
| Autre revenu | 100% | 70% |
| **Retraite** | **100%** | **100%** |
| Rente viagère à titre onéreux | 100% | 70% |
| Pension et rente exonérée | 100% | 70% |
| Rente d'invalidité | 100% | 70% |
| Autre pension imposable | 100% | 70% |
| **Revenus fonciers** | **70%** | **70%** |
| Revenus capitaux mobiliers | 100% | 100% |
| **Revenus locations meublées** | **70%** | **70%** |

> **Important :** les revenus fonciers et locations meublées sont toujours à 70%,
> quel que soit l'âge. Les salaires passent à 70% seulement après 56 ans.
> À implémenter dans `revMens()` quand l'âge du client dépasse 56 ans.

---

## SOLUTIONS & OBJECTIFS (config Excel — textes et leviers)

### Tableau de correspondance solution → objectifs

| Solution | Levier | Horizon | Objectifs couverts |
|---|---|---|---|
| Assurance-vie | Placements | 8 ans | Réorganiser patrimoine, Optimiser placements, Compléter revenus, Optimiser transmission, Protéger proches/conjoint/enfants, Transmettre patrimoine, Préparer retraite, Accompagner enfants |
| PER (adulte) | Impôts | Majorité/Retraite | Optimiser fiscalité, Optimiser transmission, Protéger conjoint, Transmettre patrimoine, Préparer retraite |
| PER (enfant) | Impôts | Majorité/Retraite | Optimiser fiscalité, Accompagner enfants |
| FIP/FCPI | Impôts | 7-10 ans | Optimiser placements, Diversifier patrimoine, Optimiser patrimoine, Optimiser fiscalité |
| G3F Industriel | Impôts | 10-14 mois | Optimiser placements, Diversifier patrimoine, Optimiser patrimoine, Optimiser fiscalité |
| SCPI Financée | Financement | 25 ans | Optimiser placements, Créer patrimoine immo, Optimiser patrimoine, Compléter revenus, Protéger conjoint/enfants, Préparer retraite |
| SCPI Cash | Placements | 15 ans | Réorganiser patrimoine, Optimiser placements, Créer patrimoine immo, Compléter revenus, Préparer retraite |
| SCPI Démembrement | Placements | 10 ans | Réorganiser patrimoine, Optimiser placements, Créer patrimoine immo, Diversifier patrimoine, Optimiser patrimoine, Optimiser transmission, Préparer retraite |
| Pinel/Loi fiscale | Financement | 25 ans-Retraite | Créer patrimoine immo, Optimiser fiscalité, Protéger conjoint/enfants, Préparer retraite |
| Novaxia | Placements | 8-10 ans | Réorganiser patrimoine, Optimiser placements, Créer patrimoine immo, Diversifier patrimoine |
| LMNP | Financement | 1-2 ans | Créer patrimoine immo, Compléter revenus, Protéger conjoint/enfants, Préparer retraite |

### Textes de projection (templates)
```
Assurance-vie :
"Le but est de se constituer un capital minimal d'environ {capital} dans {horizon} ans,
en fonction de votre profil investisseur. Ce placement assure une souplesse durant toute la vie active."

PER adulte :
"Capital d'environ {capital} dans {horizon} ans, pour la retraite,
avec une réduction d'impôts de {impots} dès cette année."

SCPI Financée :
"Patrimoine de {capital} et générateur de revenus complémentaires de {revenus}/mois
(hors fiscalité) dans {horizon} ans."

SCPI Cash :
"Se constituer un patrimoine dans l'immobilier d'entreprise et générateur
de revenus complémentaires de {revenus}/mois."

LMNP :
"Se constituer un patrimoine de {capital} et générateur de revenus complémentaires
de {revenus}/mois en optimisant la fiscalité sur les revenus locatifs."

G3F :
"Réduction d'impôt de {impots}. Investissement oneshot, rentabilité de 10% sur 1 an."
```

---

## RÈGLE R10 — Regex revenus fonciers : ne pas matcher les actifs

Le label `"Immobilier & Foncier"` dans la section actifs contient le mot "foncier".
Un regex trop large comme `/foncier/i` capture les actifs immobiliers comme revenus → bug critique.

```js
// ❌ INTERDIT — capture "Immobilier & Foncier" = valeur des actifs (710 000 €)
if (/foncier|location.meuble|loyer/i.test(label)) { ... }

// ✅ CORRECT — restreint aux vraies lignes de revenus
if (/revenus fonciers|revenus immobiliers|location.meuble/i.test(label)
    && !/immobilier.*foncier|foncier.*immobilier|immo/i.test(label)) { ... }
```

**Symptôme :** revMens() = 41 417 €/mois au lieu de 4 326 €
→ ED.revenus.fonc = 710 000 (valeur actifs immo) au lieu de 33 014 (revenus fonciers réels)
