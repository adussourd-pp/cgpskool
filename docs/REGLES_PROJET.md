# CGP Skool -- Étude de Dossier
## Règles absolues & Tests de non-régression

---

## RÈGLES DE CODE -- À VÉRIFIER AVANT CHAQUE LIVRAISON

### R1 -- font-family dans les strings JS
```js
// INTERDIT -- casse la string JS
html += '<div style="font-family:\'Space Grotesk\',sans-serif">';

// CORRECT
html += '<div style="font-family:Space Grotesk,sans-serif">';
```

### R2 -- Caractère \xa0 dans le code JS
Provoque "Invalid or unexpected token". Utiliser des espaces normaux dans le code.

### R3 -- Pas de doublon de variable
Chercher si une variable existe déjà avant d'en déclarer une nouvelle (y compris dans les déclarations groupées `let a, b, c`).

### R4 -- Revenus ANNUELS dans le RI
- `ED.revenus.c1` / `sal1` = salaires annuels
- `ED.revenus.fonc` = fonciers annuels
- `revMens()` = (sal + fonc×0.70) / 12

### R5 -- Taux endettement = crédits SEULEMENT
`chrCredit` = échéances passifs /mois. PAS les charges totales (PER, leasing, éducation exclus).

### R6 -- Pension retraite = salaires SEULS
`pensM = Math.floor(ED.revenus.c1 / 12 * taux / 100)`. Fonciers exclus.

### R7 -- Clés internes sans accent
`goTo('synthese')` pas `goTo('synthèse')`. Texte affiché peut avoir des accents, pas les clés.

---

## TESTS DE NON-RÉGRESSION

### Cas 1 -- Alexia LAFOSSE & François LIEVRE (couple, séparation de biens)
| Indicateur | Attendu |
|---|---|
| Revenus nets /mois | 4 326 EUR |
| Charges crédit /mois | 3 654 EUR |
| Taux endettement | 84,5 % |
| Reste à vivre | 672 EUR |
| IR net | 0 EUR |
| Pension Alexia (55 ans, Sal. cadre) | 576 EUR/mois |
| Manque Alexia (souh. 3 000 EUR) | 2 424 EUR/mois |


### Cas 3 -- Eric & Marie Aude KEMPF (couple, séparation de biens, 3 parts)
| Indicateur | Attendu |
|---|---|
| Revenus nets /mois (couple) | (104 000+9 000+3 600×0,70)/12 = **9 627 EUR** |
| Charges crédit /mois | 12 000/12 = **1 000 EUR** |
| Taux endettement (couple) | 1 000/9 627 = **10,4 %** |
| Reste à vivre | 9 627-1 000 = **8 627 EUR** |
| IR net | **15 638 EUR** |
| TMI | **30 %** |
| Pension Eric (50 ans, Sal. cadre, départ 60) | (104 000+3 600)/12×55% = **4 931 EUR/mois** |
| Pension Marie Aude (48 ans, Sal. non cadre) | 9 000/12×62% = **465 EUR/mois** |

**Règle confirmée :** pension = (salaires + fonciers BRUTS) / 12 × taux (sans pondération 70%)
**Règle confirmée :** endettement = couple complet

### Cas 2 -- Mathieu THOMAS (seul, séparé, 2 enfants)
| Indicateur | Attendu |
|---|---|
| Revenus nets /mois | 8 713 EUR |
| Charges crédit /mois | 2 879 EUR |
| Taux endettement | 33,0 % |
| Reste à vivre | 5 834 EUR |
| IR net | 13 670 EUR |
| TMI | 41 % |
| Pension (67 ans, Sal. cadre) | 4 704 EUR/mois (taux interpolé 54%) |
| Impact mensuel (souh. 3 500 EUR) | +1 204 EUR (surplus) |

---

## CHECKLIST AVANT LIVRAISON

- [ ] 0 occurrence de `font-family:'` dans le script
- [ ] 0 caractère `\xa0` dans le script
- [ ] `steps` déclaré 1 seule fois
- [ ] Structure HTML : script avant /script avant /body
- [ ] Test Alexia : revMens() = 4 326 EUR
- [ ] Test Mathieu : endett = 33,0 %
- [ ] Test Mathieu : pension = 4 704 EUR (taux interpolé 54%)
- [ ] 0 curly quote comme délimiteur JS (R23) — `node --check` passe

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

## RÈGLE R8 -- Base de calcul pension retraite

La pension est calculée sur les **revenus BRUTS totaux** (salaires + fonciers), sans appliquer le 70%.

```js
// CORRECT -- revenus bruts pour la retraite
var revBrutMensuel = (sal + foncBrut) / 12;
var pension = Math.floor(revBrutMensuel * tauxRemplacement / 100);

// INTERDIT -- pondération 70% sur les fonciers pour la retraite
var pension = Math.floor(revMens() * tauxRemplacement / 100); // revMens() applique 70%
```

Pour un couple, les fonciers sont répartis 50/50 entre C1 et C2.

---

## RÈGLE R9 -- Endettement calculé sur le couple complet

Le taux d'endettement et le reste à vivre utilisent **les revenus nets du couple** (`revMens()` = salaires couple + fonciers×70% / 12), pas C1 seul.

```js
// CORRECT
const endett = chrCredit / revMens() * 100;  // couple complet

// INTERDIT
const endett = chrCredit / (ED.revenus.c1 / 12) * 100;  // C1 seul
```

---

## TEST -- Calcul bilan retraite (validation complète)

### Formule générale
```
revBrutMensuel(n) = (sal_n + fonc_n_brut) / 12
pension_n        = floor(revBrutMensuel(n) × tauxRemplacement(csp, age) / 100)
manque_n         = pensionSouhaitee_n - pension_n   (négatif = surplus)
capitalCible     = manque × 12 / 0.04               (rendement 4% pour la rente)
effortMensuel(r) = capitalCible / ((1+r)^h - 1) * r / 12
```

### Cas Eric KEMPF -- Salarié cadre, 50 ans, départ 60 ans

| Données | Valeur |
|---|---|
| Salaires Eric | 104 000 EUR/an |
| Revenus fonciers Ostheim (bruts) | 3 600 EUR/an |
| CSP | Salarié cadre |
| Taux remplacement à 60 ans (Sal. cadre) | **55 %** |

**Calcul :**
```
revBrutMensuel = (104 000 + 3 600) / 12 = 8 967 EUR/mois
pension        = floor(8 967 × 55 / 100) = 4 931 EUR/mois
manque         = 5 000 - 4 931 = 69 EUR/mois  <- surplus (impact = -69 EUR)
capitalCible   = 69 × 12 / 0.04 = 20 700 EUR
```
PDF attendu : pension **4 931 EUR**, impact foyer **-69 EUR** ok

---

### Cas Marie Aude KEMPF -- Salarié non cadre, 48 ans, départ 60 ans

| Données | Valeur |
|---|---|
| Salaires Marie Aude | 9 000 EUR/an |
| Revenus fonciers | 0 |
| CSP | Salarié non cadre |
| Taux remplacement à 60 ans (Sal. non cadre) | **62 %** |

**Calcul :**
```
revBrutMensuel = 9 000 / 12 = 750 EUR/mois
pension        = floor(750 × 62 / 100) = 465 EUR/mois
manque         = 1 000 - 465 = 535 EUR/mois
capitalCible   = 535 × 12 / 0.04 = 160 500 EUR
```
PDF attendu : pension **465 EUR**, impact foyer **-535 EUR** ok

---

### Cas Mathieu THOMAS -- Salarié cadre, 47 ans, départ 67 ans

```
revBrutMensuel = 104 551 / 12 = 8 713 EUR/mois  (pas de fonciers)
taux           = interpolation(47 ans, cadre) = 54 + (47-45)/(50-45)*(55-54) = 54.4 -> arrondi 54%
pension        = floor(8 713 × 54 / 100) = 4 704 EUR/mois
manque         = 3 500 - 4 704 = -1 204 EUR/mois  <- surplus
```
PDF attendu : pension **4 704 EUR**, impact **+1 204 EUR** ok

---

### Cas Alexia LAFOSSE -- Salarié cadre, 30 ans, départ 55 ans

```
revBrutMensuel = 14 400 / 12 = 1 200 EUR/mois  (fonciers SCI partagés : 33014/2 = 16507 bruts)
Mais PDF utilise salaires seuls pour Alexia -> 14 400 / 12 = 1 200 EUR/mois
pension        = floor(1 200 × 48 / 100) = 576 EUR/mois
manque         = 3 000 - 576 = 2 424 EUR/mois
```
PDF attendu : pension **576 EUR**, impact **-2 424 EUR** ok

> **Note :** Pour Alexia, les fonciers SCI sont des revenus fonciers déclarés au niveau du foyer,
> non attribuables à un seul conjoint pour le calcul de la pension individuelle.
> Le PDF utilise les salaires seuls -> **sal_n / 12** sans fonciers dans ce cas.
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

## TABLE ESPÉRANCE DE VIE (départ à la retraite -> mois restants)

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
manque       = pensionSouhaitee - pensionEstimee  (EUR/mois)
impactRetraite = manque × espVie                  (EUR total)
```

**Vérifications PDF :**
- Alexia (Mme, départ 55 ans) : 377 mois × 2 424 = 913 848 EUR <- impact individuel
- François (M, départ 55 ans) : 313 mois × 9 424 = 2 949 712 EUR
- PDF Alexia+François total = -3 863 560 EUR ok (sum des deux)
- Mathieu (M, départ 67 ans) : 193 mois × 1 291 = 249 163 EUR ok
- Eric (M, départ 60 ans) : 265 mois × 69 = 18 285 EUR
- Marie Aude (Mme, départ 60 ans) : 323 mois × 535 = 172 805 EUR
- PDF Eric+Marie total = -191 090 EUR ok

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
- Mathieu, 47 ans, Sal. cadre -> entre 45 (54%) et 50 (55%) -> interpolé 54% (54.4 arrondi)
- Eric, 50 ans, Sal. cadre -> 55% ok
- Marie Aude, 48 ans, Sal. non cadre -> entre 45 (60%) et 50 (64%) -> ~62% ok
- Alexia, 30 ans, Sal. cadre -> 48% ok

---

## PONDÉRATION REVENUS (selon âge -- config Excel)

Seuil : avant 56 ans -> 100%, à partir de 57 ans -> 70% (sauf exceptions)

| Type de revenu | < 56 ans | >= 57 ans |
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

## SOLUTIONS & OBJECTIFS (config Excel -- textes et leviers)

### Tableau de correspondance solution -> objectifs

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

## RÈGLE R10 -- Regex revenus fonciers : ne pas matcher les actifs

Le label `"Immobilier & Foncier"` dans la section actifs contient le mot "foncier".
Un regex trop large comme `/foncier/i` capture les actifs immobiliers comme revenus -> bug critique.

```js
// [KO] INTERDIT -- capture "Immobilier & Foncier" = valeur des actifs (710 000 EUR)
if (/foncier|location.meuble|loyer/i.test(label)) { ... }

// [OK] CORRECT -- restreint aux vraies lignes de revenus
if (/revenus fonciers|revenus immobiliers|location.meuble/i.test(label)
    && !/immobilier.*foncier|foncier.*immobilier|immo/i.test(label)) { ... }
```

**Symptôme :** revMens() = 41 417 EUR/mois au lieu de 4 326 EUR
-> ED.revenus.fonc = 710 000 (valeur actifs immo) au lieu de 33 014 (revenus fonciers réels)

---

## RÈGLE R11 -- Architecture du parser : sections numérotées

Le RI Word copié-collé est structuré en 5 sections `01` à `05` sur leur propre ligne.
**Ne jamais parser en cherchant des mots-clés dans tout le texte.** Découper d'abord en sections.

```js
// [OK] CORRECT -- découper par section numérotée, puis traiter chaque section
function getSection(n){
  var re = new RegExp('(?:^|\\n)0'+n+'\\s*\\n([\\s\\S]*?)(?=\\n0'+(n+1)+'\\s*\\n|$)');
  return full.match(re)?.[1] || '';
}
var s01=getSection(1); // Identité
var s02=getSection(2); // Objectifs
var s03=getSection(3); // Patrimoine (Actifs + Passifs)
var s04=getSection(4); // Revenus & Charges
var s05=getSection(5); // Fiscalité

// [KO] INTERDIT -- regex globaux sur tout le texte
var revSection = full.match(/REVENUS([\s\S]*?)(?:CHARGES|$)/i);
// -> "Revenus & Charges" (titre section 04) contient "Charges" -> stop prématuré
```

---

## RÈGLE R12 -- Revenus & Charges : découpage sur ligne propre

Dans la section 04, `REVENUS` et `CHARGES` sont des mots **seuls sur leur ligne**.
Le titre de la section est `"04\n| Revenus & Charges"` -- il contient les deux mots.

```js
// [OK] CORRECT -- \n avant et après (mot seul sur sa ligne)
var revPart = s04.match(/(?:^|\n)REVENUS\s*\n([\s\S]*?)(?=\nCHARGES\s*\n|TOTAL DES REVENUS|$)/i);
var chPart  = s04.match(/(?:^|\n)CHARGES\s*\n([\s\S]*?)(?=TOTAL DES REVENUS|TOTAL DES CHARGES|$)/i);

// [KO] INTERDIT -- capte le titre "Revenus & Charges"
var revPart = full.match(/REVENUS([\s\S]*?)(?:CHARGES|$)/i);
```

---

## RÈGLE R13 -- Fonciers : éviter le double comptage

Le RI contient souvent deux lignes qui matchent "foncier" :
- `"Revenus immobiliers"` -> ligne catégorie (sous-total)
- `"Revenus fonciers SCI Chalet..."` -> ligne détail

**Prendre uniquement les lignes détail. Fallback sur catégorie si pas de détail.**

```js
if (/revenus fonciers|location.meuble/i.test(label)) {
  ED.revenus._foncSpecific += max(vals);   // ligne détail
} else if (/revenus immobiliers/i.test(label)) {
  ED.revenus._foncCategory += max(vals);   // ligne catégorie
}
// Finalisation : préférer spécifique
ED.revenus.fonc = ED.revenus._foncSpecific || ED.revenus._foncCategory || 0;
```

**Symptôme si non respecté :** `ED.revenus.fonc = 66 028` au lieu de `33 014`
-> `revMens() = 6 252` au lieu de `4 326`

---

## RÈGLE R14 -- Objectifs : prendre parts[1], pas parts[0]

Dans la section 02, le tableau objectifs est :
```
Personnes           \t Objectif                        \t Horizon \t Moyen
Mathieu THOMAS      \t Accompagner vos enfants          \t        \t
François LIEVRE ... \t Réorganiser votre patrimoine     \t        \t
```
- `parts[0]` = Nom de la personne -> **ne pas prendre**
- `parts[1]` = Objectif réel -> **prendre**

```js
// [OK] CORRECT
var obj = parts[1] || '';  // colonne Objectif

// [KO] INTERDIT -- prend le nom "François LIEVRE" comme objectif
var obj = parts.length >= 2 ? parts[1] : parts[0];
// -> si la ligne n'a pas de tab, parts[0] = "François LIEVRE"
```

**Symptôme :** "François LIEVRE" apparaît comme objectif n°1 dans la liste.

---

## RÈGLE R15 -- Actifs : ignorer les lignes de sous-totaux

Les lignes suivantes sont des **catégories/sous-totaux**, pas des actifs réels :
`Désignation`, `Total`, `Immobilier & Foncier`, `Immobilier de jouissance`,
`Immobilier locatif`, `Épargne`, `Court terme`, `Moyen terme`, `Long terme`,
`Retraite et Salariale`, `Biens professionnels`, `Foncier`

```js
var SKIP_A = /^(désignation|total|immobilier & foncier|immobilier de jouissance|
               immobilier locatif|épargne|court terme|moyen terme|long terme|
               retraite et salariale|biens professionnels|foncier)$/i;
if (SKIP_A.test(nom)) return; // ignorer
```

---

## RÈGLE R16 -- Salaires : éviter le double comptage (détail vs catégorie)

Mme logique que R13 pour les fonciers. Le RI contient :
- `"Revenus d'activité"` -> ligne **catégorie** (sous-total)
- `"Salaires - Revenus"`, `"Salaires - Salaire"`, `"BIC Pro"`, etc. -> lignes **détail**

**Utiliser uniquement les lignes détail. Fallback sur catégorie si pas de détail.**

```js
// Ligne détail (Salaires, BA, BIC, BNC, AE...)
if (/salaire|salaires|\bba\b|\bbic\b|\bbnc\b|auto.entrepreneur/i.test(label)) {
  ED.revenus._salSpecific += v1;
}
// Ligne catégorie (Revenus d'activité) -> fallback
else if (/revenus d.activit/i.test(label)) {
  ED.revenus._salCategory += v1;
}
// Finalisation
ED.revenus.sal1 = ED.revenus._salSpecific || ED.revenus._salCategory || 0;
```

**Symptôme si non respecté :** salaires multipliés par 2, 3 ou 4
-> Mathieu : `revMens = 34 850` (×4) au lieu de `8 713`

---

## RÈGLE R17 -- Client seul : ignorer la colonne 2 des revenus

Pour un client seul, la colonne 2 du tableau revenus = **colonne "Total"** (même valeur que C1).
Ne pas l'accumuler dans `sal2`, sinon les revenus sont doublés.

```js
var v2 = isCouple ? pEur(p[2] || '') : 0;  // [OK] 0 si client seul
// [KO] INTERDIT
var v2 = pEur(p[2] || '');  // prend le Total comme C2
```

**Symptôme :** `sal1 = sal2 = 104 551` -> `revMens = (209102)/12 = 17 425` au lieu de `8 713`

---

## DOCUMENT D'ENTREE EN RELATION -- Structure et champs extraits

Format : "DOCUMENT D'ENTREE EN RELATION - Fiche d'informations legales"

| Champ | Pattern | Variable ED |
|---|---|---|
| Nom conseiller | `Par : Alexandre DUSSOURD` ou `Nom / Prenom : DUSSOURD Alexandre` | `ED.consultant` |
| Email | `a.dussourd@peakpatrimoine.fr` | `ED.contactMail` |
| Tel | `Tel. Portable : 06 68 68 11 88` | `ED.contactTel` |
| ORIAS | `N deg : 22002240` | `ED.orias` |
| Adresse | `Adresse professionnelle : 3 Avenue...` | `ED.adressePro` |
| Ville | `06300 NICE` | `ED.villePro` |

**Note format nom** : le document peut avoir "DUSSOURD Alexandre" (NOM Prenom) ou "Alexandre DUSSOURD" (Prenom NOM).
Le parser detecte les mots tout en majuscules en debut de chaine et inverse si necessaire.

**Test valide sur** : document Stellium/Peak Patrimoine (Alexandre DUSSOURD)

---

## RÈGLE R18 -- Pondération salaires par âge

Le coefficient de pondération des salaires pour le calcul des revenus mensuels dépend de l'âge moyen du foyer :

```js
var txSal = ageMoy >= 57 ? 0.70 : 1.00;
```

| Âge moyen foyer | Salaires | Fonciers | Retraite | Capitaux mobiliers |
|---|---|---|---|---|
| < 57 ans | 100% | 70% | 100% | 100% |
| >= 57 ans | 70% | 70% | 100% | 100% |

**Source :** onglet "Config_Revenus" du fichier Excel ED_RI.

---

## RÈGLE R19 -- Interpolation linéaire (taux retraite et espérance de vie)

`getRetTaux()` et `getEspVie()` doivent **interpoler linéairement** entre deux paliers, pas utiliser le ceiling (arrondi au palier supérieur) ni le floor.

```js
// CORRECT — interpolation linéaire
var t = (age - ageBas) / (ageHaut - ageBas);
return Math.round(tauxBas + t * (tauxHaut - tauxBas));

// INTERDIT — ceiling (ancien comportement)
for (var i=0; i<AGES.length; i++) { if (AGES[i]>=age) idx=i; }
return arr[idx];
```

**Vérification :**
- Marie Aude, 48 ans, non cadre : entre 45 (60%) et 50 (64%) → 62% (pas 64%)
- Mathieu, 47 ans, cadre : entre 45 (54%) et 50 (55%) → 54% (pas 55%)
- Sur un âge exact (50, 60, 65...) : la valeur du palier est retournée telle quelle.

---

## RÈGLE R20 -- Ne jamais redéclarer CSP_MAP localement

Le mapping `CSP_MAP` est défini dans `data.js` et couvre toutes les variantes (avec/sans accents, labels RI, etc.). Ne jamais le redéclarer dans une fonction locale — cela crée un risque de désynchronisation.

```js
// INTERDIT — CSP_MAP local dans rRetraite()
var CSP_MAP = {'Fonctionnaire':'Fonctionnaire', ...};
CSP_MAP["Chef d'entreprise"] = 'TNS artisan';  // 'TNS artisan' n'existe pas !

// CORRECT — utiliser le global de data.js
var key = CSP_MAP[csp];  // renvoie 'TNS comer.' pour "Chef d'entreprise"
```

**Symptôme :** pension fausse pour les chefs d'entreprise (fallback silencieux sur 'Sal. cadre').

---

## RÈGLE R21 -- Chart.js : pas de CSS custom properties dans le canvas

Les propriétés CSS custom (`var(--orange)`, `var(--gris)`) ne sont **pas résolues** dans un contexte canvas 2D (Chart.js). Toujours utiliser des couleurs hex ou rgba.

```js
// INTERDIT — dans un dataset Chart.js
borderColor: 'var(--orange)'    // → rendu noir
color: 'var(--gris)'            // → ignoré

// CORRECT
borderColor: '#D4622A'
color: 'rgba(24,22,20,0.55)'
```

**Police :** utiliser `'Inter'` (pas `'Outfit'`) dans toutes les configs Chart.js pour rester cohérent avec le design system.

---

## RÈGLE R22 -- Parser mammoth = mêmes protections que parser Format-A

Le fichier `etude-dossier.html` contient deux chemins de parsing (mammoth pour Word, Format-A pour paste). Les deux doivent implémenter :

- **R10** : regex foncier restrictif (`/revenus fonciers|location.meuble/i` + exclusion `immobilier.*foncier`)
- **R13** : distinction `_foncSpecific` vs `_foncCategory` (préférer spécifique)
- **R16** : distinction `_salSpecific` vs `_salCategory` (préférer spécifique)

Toute modification du parsing dans un chemin doit être répliquée dans l'autre.

---

## RÈGLE R23 -- Pas de curly quotes dans le code JS

Les guillemets courbes (U+2018 `'`, U+2019 `'`, U+201C `"`, U+201D `"`) sont **interdits** comme délimiteurs de chaînes JS. Utiliser uniquement les apostrophes droites `'` (U+0027) et guillemets droits `"` (U+0022).

**Exception** : les chaînes de l'objet `COPERNIC` contiennent des apostrophes courbes U+2019 **à l'intérieur** du texte français (`l'IS`, `d'emprunt`…). C'est volontaire pour éviter de casser les délimiteurs `'`. Ne pas les remplacer par `'`.

```js
// INTERDIT — curly quotes comme délimiteurs
var x = 'valeur';  // U+2018 / U+2019

// CORRECT — apostrophes droites
var x = 'valeur';  // U+0027

// OK — curly quote DANS le texte (objet COPERNIC uniquement)
desc:'Acquisition de l\u2019usufruit temporaire'  // U+2019 dans le contenu = OK
```

**Vérification** : `node --check` sur le bloc `<script>` extrait doit passer sans erreur.

---

## SOURCES DE DONNÉES VALIDÉES

| Source | Date | Fichiers impactés |
|---|---|---|
| Excel ED_RI_62 (Omnium Finance) | 2025 | data.js (barème IR, taux retraite, espérance vie, actifs, solutions) |
| PMR Prodémial — Convention Cadre Annexe 1 | nov. 2021 | bp-simulator.html (TPC, commissions, qualifications) |
| Doc Suravenir — Cristalliance Avenir | 01/01/2026 | comparatif-cgp.html (frais Finzzle : 4.8% max, gestion 1%) |
| Article ADI — Bilan Prosper Conseil 2026 | jan. 2026 | comparatif-cgp.html (honoraires 0.6%-0.2% TTC, 1er RDV 150€) |
| Webinaire CGPulse — SilmaTec Finance (S. VEAUX) | 30/01/2026 | comparatif-cgp.html (hybride : bilan 900-3000€, CSP 650-1200€) |
