# Audit RGPD — CGP Skool

> Audit **technique et opérationnel** de la protection des données, mis en regard des obligations
> propres au métier de CGP (conseiller en gestion de patrimoine).
> Ce document n'est pas un avis juridique : les conclusions réglementaires doivent être validées
> par un DPO / avocat spécialisé. Les faits techniques, eux, sont vérifiables dans le code (références `fichier:ligne`).

---

## 0. Résumé exécutif — le message dur d'abord

**Ce qui est challengé en priorité :** le positionnement *« 100 % navigateur = conforme RGPD »*
est une **erreur de catégorie**. La conformité RGPD est une propriété du **cabinet** (responsable de
traitement), pas d'un outil logiciel. La CNIL est explicite : un produit ne peut pas être « conforme RGPD »
par auto-déclaration. L'architecture *privacy by design* de CGP Skool est un **excellent socle de minimisation**
— probablement dans le haut du panier du marché — mais elle ne rend personne « conforme » et ne remplace
aucune des obligations du CGP.

Trois problèmes concrets :

1. **Des affirmations affichées sont factuellement fausses au niveau réseau.** « Rien n'est envoyé sur
   Internet », « les données ne transitent jamais par Internet », « aucune transmission à un serveur »,
   « aucun cookie de suivi » — contredites par le chargement, sur les pages qui manipulent les données
   client, de **scripts tiers** (Chart.js et pdf.js depuis Cloudflare, widget Feedback depuis Tally,
   Google Fonts). Les *données client* elles-mêmes ne partent pas — mais l'**absolu** est faux, et un
   claim faux fragilise plus qu'il ne protège (risque de pratique commerciale trompeuse + fausse assurance
   donnée à l'utilisateur).

2. **Le vrai travail RGPD du CGP est hors outil et quasi absent du dispositif.** Registre des traitements,
   mention d'information client, base légale, durées de conservation, sécurité de l'archive, contrats de
   sous-traitance : c'est là que se joue 80 % de la conformité, et l'outil laisse (involontairement) croire
   qu'il suffit.

3. **Le risque réel n'est pas un serveur (il n'existe pas pour les données client) — c'est ailleurs :**
   (a) les dépendances CDN tierces **sans contrôle d'intégrité (SRI)** sur la page la plus sensible, et
   (b) le **JSON/PDF ultrasensible** qui atterrit en clair dans le dossier Téléchargements, sans aide au
   chiffrement ni à l'archivage sécurisé.

Le reste du document détaille, puis propose un plan priorisé (Lots A→E).

---

## 1. Ce qui est bien fait — à conserver absolument

Il faut le dire clairement : le socle est solide et rare.

| Point fort | Où | Pourquoi c'est bon |
|---|---|---|
| **Minimisation par défaut** : données client en `sessionStorage`, effacées à la fermeture de l'onglet | `cgp-skool-core.js:464-468` | Privacy by design / by default (art. 25 RGPD) |
| **Whitelist explicite de persistance** (`PERSIST`) | `cgp-skool-core.js:460` | Seuls 5 outils internes persistent ; décision consciente, pas un défaut |
| **Purge au chargement** des états client stockés par d'anciennes versions | `cgp-skool-core.js:472-484` | Nettoyage rétroactif — bon réflexe |
| **`DATA_KIND` aligné** sur `PERSIST`, textes pédagogiques par module | `cgp-skool-nav.js:40-49` | Transparence, information de l'utilisateur |
| **Aucun backend pour les données client** ; conservation = export JSON manuel | archi générale | Réduit drastiquement la surface d'exposition |
| **Bon réflexe affiché** : *« c'est toi qui l'archives… conformément à tes obligations RGPD de conseiller »* | `etude-dossier.html:1794` | Renvoie (à raison) la responsabilité de conservation au CGP |

**À garder tel quel.** Les corrections ci-dessous ne remettent pas ce socle en cause — elles le rendent *exact*.

---

## 2. Le référentiel : tes obligations réelles en tant que CGP

Un CGP est **responsable de traitement** au sens du RGPD. Les données traitées (patrimoine, revenus,
composition familiale, projets de vie, parfois éléments de santé/vulnérabilité au titre du devoir de conseil
DDA) sont **parmi les plus sensibles** qui soient au sens courant — même si toutes ne sont pas des « données
sensibles » au sens strict de l'art. 9.

Particularité du métier : une **tension structurelle** entre RGPD (minimiser, ne pas conserver) et les
obligations professionnelles (conserver et tracer). Elles ne s'annulent pas — elles se cumulent.

| # | Obligation | Base | Implication pour toi |
|---|---|---|---|
| 1 | **Registre des activités de traitement** | RGPD art. 30 | À tenir, même petit cabinet. Absent aujourd'hui. |
| 2 | **Base légale** de chaque traitement | RGPD art. 6 | Prestation de conseil = **exécution du contrat** + **obligation légale** (LCB-FT). Le **consentement n'est PAS** la base de la prestation (il l'est pour la prospection commerciale). |
| 3 | **Information des personnes** au moment de la collecte | RGPD art. 13 | Une **mention d'information client** doit être remise à l'entrée en relation (dans le RI / DER). |
| 4 | **Durées de conservation** | RGPD art. 5 + **CMF L561-12 (LCB-FT)** + RG AMF (CIF) + DDA | **Conservation obligatoire ~5 ans** après la fin de la relation pour les documents de conseil et LCB-FT. → *« rien n'est conservé »* ne te dispense pas : **tu DOIS archiver**. L'archive devient donc LE vrai sujet RGPD. |
| 5 | **Sécurité** des données | RGPD art. 32 | S'applique à ton **archive** (JSON/PDF), pas à un serveur inexistant. Chiffrement, accès, sauvegarde. |
| 6 | **Sous-traitance** : contrat (DPA) avec chaque prestataire qui traite pour toi | RGPD art. 28 | Hébergeur de l'archive, Drive, CRM, éventuel outil d'e-signature… chacun exige un DPA. |
| 7 | **Droits des personnes** (accès, rectification, effacement, opposition, portabilité) | RGPD art. 15-22 | Procédure à définir — compliquée si les études sont éparpillées en JSON. |
| 8 | **Transferts hors UE** (Schrems II) | RGPD chap. V | CDN US (Cloudflare/cdnjs), Google Fonts (US), Google Drive (US) = transferts à encadrer (CCT / Data Privacy Framework). |
| 9 | **Violation de données** : notification CNIL sous 72 h | RGPD art. 33-34 | Procédure à prévoir (ex. vol du PC contenant les archives). |
| 10 | **AIPD (analyse d'impact)** à évaluer | RGPD art. 35 | Profilage patrimonial + données pouvant révéler une vulnérabilité → à évaluer ; pas automatiquement obligatoire pour un petit cabinet, mais la **question doit être tracée**. |
| 11 | **DPO** | RGPD art. 37 | Généralement non obligatoire pour un petit CGP, mais l'analyse doit être documentée. |

**Point clé à intégrer dans le discours produit :** la non-persistance de l'outil est une **bonne pratique
de minimisation**, mais elle **déplace** l'obligation de conservation vers ton archive personnelle — elle ne
la supprime pas. C'est même l'inverse : tu es **obligé** de conserver 5 ans. Le message « ferme l'onglet, tout
s'efface » doit donc toujours être accompagné de « … et c'est à toi d'archiver de façon sécurisée, car la loi
t'y oblige ».

---

## 3. Écarts constatés — le challenge, fichier par fichier

### 3.1 — Sur-affirmations / claims faux (risque juridique + réputationnel) 🔴

Le discours emploie des **absolus** que le code contredit.

| Affirmation affichée | Où | Problème |
|---|---|---|
| « **conforme RGPD** » (répété comme argument) | `outils.html:1036`, `cgp-skool-nav.js:97` | Un outil ne peut pas être « conforme RGPD ». Auto-déclaration non recevable (position CNIL). Fragilise juridiquement. |
| « **Rien n'est envoyé sur Internet.** Les données saisies ne quittent jamais votre navigateur » | `index.html:172` | Faux au niveau réseau : chaque page charge des scripts tiers (voir 3.2). |
| « les données saisies **ne transitent jamais par Internet** » | `etude-dossier.html:1792` | Idem, sur la page la plus sensible. |
| « aucune collecte, aucun **cookie de suivi**, aucune **transmission à un serveur** » | `cgp-skool-nav.js:97` | Le widget Tally (3.2) est un script tiers susceptible de déposer des cookies ; affiché **y compris** sur le module `tracking` qui, lui, transmet réellement à un serveur (3.3). |

> **Nuance importante, à conserver dans la reformulation :** les *données client* ne sont effectivement
> **pas** envoyées aux tiers. La correction ne consiste pas à dire « on envoie vos données » (ce serait faux
> aussi) mais à **cesser les absolus** : dire précisément *« aucune donnée client n'est transmise à un serveur
> ; les données restent en mémoire de session »*, ce qui est vrai et tout aussi vendeur.

### 3.2 — Dépendances tierces sans SRI sur la page la plus sensible 🔴

Sur `etude-dossier.html` (l'app qui ingère avis d'imposition, revenus, patrimoine, situation familiale) sont
chargés, depuis des domaines tiers, **sans `integrity=` (Subresource Integrity)** :

- **Chart.js** depuis `cdnjs.cloudflare.com` — `etude-dossier.html:201`
- **pdf.js** (+ worker) depuis `cdnjs.cloudflare.com` — `etude-dossier.html:8385,8388` (sert justement à **parser l'avis d'imposition**)
- **Widget Feedback / Tally** `tally.so/widgets/embed.js` — via `cgp-skool-feedback.js:36-41`, inclus dans `etude-dossier.html:12`

Le même schéma existe sur tous les modules (Chart.js CDN partout) et les articles/tracker chargent
**Google Fonts** depuis Google (`fonts.googleapis.com` / `fonts.gstatic.com`).

**Deux risques distincts :**

1. **Transfert d'IP vers des tiers (souvent US).** Charger une ressource depuis Google/Cloudflare transmet
   l'IP (et le referer, donc le module utilisé) du conseiller à ces tiers. C'est **exactement** le motif pour
   lequel la CNIL/les tribunaux ont sanctionné l'usage de Google Fonts distant. Transfert hors UE à encadrer.
2. **Supply-chain (le plus grave).** Un script tiers **sans SRI** s'exécute dans la **même page** que la
   saisie des revenus/patrimoine. Si le CDN est compromis (ou le compte Tally), du JS injecté peut lire le DOM
   et **exfiltrer les données client** en direct. L'argument « rien ne sort » tombe alors complètement.

**C'est le point le plus important de la partie technique :** tant que ces dépendances tierces existent, le
discours « rien ne quitte votre navigateur » est **structurellement faux** et le risque d'exfiltration est réel.

**Pire — une transmission active de données existe dans `etude-dossier` :** la récupération des avis
Trustpilot du conseiller passe par un **proxy CORS tiers** — l'URL Trustpilot est envoyée à
`api.allorigins.win` (`etude-dossier.html:7905-7906`), service tiers qui va chercher et renvoie le HTML.
Ce n'est plus une simple fuite d'IP : c'est une **donnée transmise activement** à un tiers depuis la page la
plus sensible. À supprimer (récupérer les avis autrement, ou saisie manuelle).

### 3.3 — Le tracker : une vraie collecte de données personnelles sur serveur 🟠

Le module `tracker/` fait ce que le reste du produit se targue de ne pas faire :

- **Données collectées** : prénom + prénom du parrain/marraine + étape + dates (`tracker/worker.js:183-191`).
  Ce sont des **données personnelles** (personnes identifiables : filleuls, prospects, recrues).
- **Transmises à un serveur** : Cloudflare Worker → **commit dans `tracking.json` versionné sur GitHub**
  (`worker.js:97-117`) → **POST Slack** avec les prénoms (`worker.js:137-149,197-201`).
- **CORS `*`** (`worker.js:32-37`) : appelable depuis n'importe quelle origine.
- **Appel automatique à chaque visite du hub** : `outils.html` interroge le Worker en GET dès le chargement
  pour afficher le compteur d'inscrits (`outils.html:1313`, endpoint `cgpskool-tracker.a-dussourd.workers.dev`).
  → **tout** utilisateur d'`outils.html`, même sans ouvrir le tracker, contacte ce serveur tiers et reçoit la
  liste des invités.
- **Conservation ad vitam** : « supprimer » un invité (`worker.js:259-278`) le retire du `tracking.json`
  courant, mais **l'historique Git conserve toutes les versions** — le droit à l'effacement n'est pas réellement
  honoré.

`CLAUDE.md` qualifie le tracker de *« ne traite aucune donnée client »* — c'est vrai, mais **« sans données
client » ≠ « sans données personnelles »**. Et le guide du module `tracking` affiche quand même
*« aucune transmission à un serveur »* (texte générique `cgp-skool-nav.js:97`), ce qui est **contradictoire**.

**Enjeux spécifiques :** base légale de ce suivi, **information des personnes trackées**, durée de conservation
(un commit git = conservation **ad vitam** dans l'historique, même après « suppression »), minimisation,
**caractère public ou non du repo** GitHub cible, sécurité du token, CORS ouvert. À traiter comme un
**traitement à part entière**, hors du discours « 0 serveur ».

### 3.4 — La whitelist de persistance n'est pas « propre » : des données personnelles/client persistent en localStorage 🟠

`CLAUDE.md` pose comme doctrine que les modules whitelistés (`PERSIST`) sont des *« outils internes sans
données client »*. **C'est faux pour au moins deux d'entre eux**, et un module non-whitelisté persiste aussi
des données de tiers :

- **`suivi-contrat`** est dans `PERSIST` (`cgp-skool-core.js:460`) **et ingère des données de contrat client**
  (export Proxeema/Ariane/Apicil collé) → persistées en clair dans `localStorage` (`cgpskool_suivi_contrat_v1`,
  `suivi-contrat.html:322`). Donc des **données client survivent à la fermeture de l'onglet**, à rebours du
  principe affiché.
- **`equipe-builder`** (whitelisté) persiste **noms/statuts/qualifications de collaborateurs** — données
  personnelles de tiers — en localStorage (`equipe-builder.html:270,389-394`).
- **`etude-dossier`** (NON whitelisté, donc censé être 100 % session) écrit pourtant en **localStorage
  persistant** : `cgpskool_avis` (**nom + verbatim d'avis clients réels**), `cgpskool_avis_lien`,
  `cgpskool_trustpilot` (avis scrapés) — `etude-dossier.html:7909,9666-9682`. La purge automatique
  (`core.js:472-484`) ne cible que le préfixe `cgpskool_state_` et **ne nettoie jamais** ces clés.

**Conséquence :** l'affirmation « aucune donnée client n'est conservée sur l'appareil » comporte des
exceptions réelles et non documentées. À corriger (soit basculer ces données en session, soit les assumer
explicitement et les couvrir par le registre + une purge dédiée).

### 3.5 — Profil conseiller & images en localStorage 🟡

`cgpskool_profil_v1`, `cgpskool_logo`, `cgpskool_photo` persistent **en clair et indéfiniment** dans le
localStorage (`cgp-skool-core.js:64,179-181`). Ce sont **tes propres** données (+ celles du parrain,
`loadLegal` `:140-144`) — donc acceptable — mais :

- sur un **poste partagé**, elles restent visibles pour l'utilisateur suivant ;
- le discours « rien n'est stocké sur l'appareil » mérite la nuance « sauf votre profil conseiller, sur cet appareil ».

Faible risque, mais à mentionner pour rester exact.

### 3.6 — Absence de mentions légales / politique de confidentialité du site 🟠

Aucune page **Mentions légales** (éditeur + hébergeur GitHub Pages) ni **Politique de confidentialité** propre
à CGP Skool n'existe (recherche infructueuse ; les seules « mentions légales » du code concernent la **DER du
client** rendue dans `etude-dossier.html:9867+`, pas le site lui-même).

- Un site public édité en France doit afficher des **mentions légales** (LCEN).
- Le site vitrine multiplie les **claims RGPD marketing** (`index.html:163-174`) sans page qui les encadre ni
  les nuance — ce qui aggrave le point 3.1.

### 3.7 — Le maillon faible réel : l'export JSON/PDF non sécurisé 🟠

Toute la donnée sensible finit sa vie dans le **fichier JSON exporté** (`cgp-skool-core.js:512-546`) et le
**PDF** — déposés en clair dans le dossier Téléchargements. C'est **là** que vivent réellement les données,
et c'est le point que l'art. 32 (sécurité) vise réellement. Aujourd'hui :

- aucune aide au **chiffrement** du fichier,
- aucun garde-fou sur **où** l'archiver,
- le message « la seule conservation est le JSON que tu télécharges » est juste, mais **s'arrête là où le
  risque commence**.

### 3.8 — Divers à statuer 🟡

- **Google Drive** en « boîte à outils » (`udp-prep.html:256`) et flux d'archivage éventuels vers Drive
  (US) → sous-traitance + transfert hors UE.
- **pdf.js** parse l'avis d'imposition **côté client** (bon principe) mais via un **script CDN** (cf. 3.2).
- **Code mort / doc obsolète** : le chemin d'import RI `.docx` appelle `mammoth` (`etude-dossier.html:8275`)
  alors que la librairie **n'est plus chargée** (commentaire `:200`) → échouerait ; le `README.md:31`
  mentionne encore « Import RI : Word (.docx) via mammoth.js ». À nettoyer (cohérence, pas RGPD).
- Liens externes divers (`my.prodemial`, `asso-forman`, `skool.com`) — informationnels, pas de donnée
  transmise, mais à lister dans la politique de confidentialité.

---

## 4. Plan d'action — clair et priorisé

### 🟥 Lot A — Corriger les affirmations (rapide, fort impact, réduit le risque juridique)

Objectif : ne plus rien affirmer de faux. Purement rédactionnel, faisable tout de suite.

- **A1.** Remplacer partout **« conforme RGPD »** → *« conçu selon les principes de minimisation et de
  privacy by design »*. Fichiers : `outils.html:1036`, `cgp-skool-nav.js:97`.
- **A2.** Supprimer les **absolus** (« rien ne quitte », « jamais par Internet », « aucune transmission ») →
  formulation exacte : *« aucune donnée client n'est transmise à un serveur ; elles restent en mémoire de
  session et sont effacées à la fermeture de l'onglet »*. Fichiers : `index.html:172-174`,
  `etude-dossier.html:1792-1794`, `cgp-skool-nav.js:48-49,97`.
- **A3.** Corriger « aucun cookie de suivi » tant que des widgets tiers sont chargés (ou les retirer, cf. Lot B).
- **A4.** Ajouter partout la nuance métier : *« la conservation de l'étude relève de vous, et la loi
  (LCB-FT, devoir de conseil) vous impose de l'archiver ~5 ans de façon sécurisée »*.

### 🟧 Lot B — Rendre l'architecture cohérente avec le discours (moyen effort, fort gain)

Objectif : rendre l'affirmation « aucune requête tierce » **vraie**, et fermer le risque supply-chain.

- **B1.** **Vendoriser** Chart.js et pdf.js en local (`assets/`) — supprimer les `<script src="cdnjs…">`.
- **B2.** **Self-host les Google Fonts** (articles + tracker) — supprimer `fonts.googleapis.com`/`gstatic`.
- **B3.** Décider du sort du **widget Feedback (Tally)** : soit le retirer des pages à données client
  (a minima d'`etude-dossier`), soit le charger uniquement au clic (lazy) et le documenter.
- **B4.** Ajouter une **CSP** restrictive (`Content-Security-Policy` via `<meta>`) interdisant tout script
  hors `self` sur les modules à données client → garantie technique, plus seulement une promesse.
- **B5.** Si une dépendance CDN devait rester : ajouter **SRI** (`integrity=` + `crossorigin`).
- **B6.** **Supprimer le proxy tiers `allorigins.win`** dans `etude-dossier` (récupération Trustpilot) —
  cf. 3.2. Basculer sur une saisie/import manuel des avis.
- **B7.** **Assainir la persistance** (cf. 3.4) : basculer `suivi-contrat` (et les clés `cgpskool_avis`/
  `cgpskool_trustpilot` d'`etude-dossier`) en `sessionStorage`, **ou** les assumer et les couvrir par le
  registre + une purge dédiée. Réaligner `CLAUDE.md` / `DATA_KIND` avec la réalité.

*Bénéfice :* après B1-B4, « aucune donnée ne quitte votre navigateur sur les modules d'étude » devient
**littéralement vrai et vérifiable** — l'argument de vente le plus fort du produit, enfin solide.

### 🟨 Lot C — Le vrai RGPD du cabinet (le plus important — livrables, pas du code)

Objectif : outiller le CGP sur les 80 % de la conformité qui sont hors application.

- **C1.** **Kit conformité cabinet** (modèles téléchargeables, éventuellement générés depuis le profil) :
  - Registre des activités de traitement (modèle pré-rempli pour un CGP multi-casquettes CIF/IAS/IOBSP/IMMO)
  - **Mention d'information client** (art. 13) à insérer dans le RI / la DER
  - Politique de conservation (articulation RGPD ↔ LCB-FT 5 ans ↔ devoir de conseil)
  - Procédure droits des personnes + procédure violation (notification 72 h)
  - Modèle de registre des sous-traitants + checklist DPA (Drive, hébergeur d'archive, CRM…)
- **C2.** **Guide « archiver en sécurité »** : comment chiffrer et ranger le JSON/PDF (ex. archive chiffrée,
  Drive pro avec DPA, nommage, durée). Transforme le maillon faible (3.6) en process.
- **C3.** Dans l'outil, remplacer le message actuel par un renvoi honnête : *« l'outil minimise ; la
  conformité relève de votre cabinet — voici le kit »* (lien vers C1).

### 🟨 Lot D — Traiter le tracker à part

- **D1.** Repo GitHub cible **privé** (vérifier), token à portée minimale.
- **D2.** **Information** des personnes suivies + base légale documentée (intérêt légitime probable, à tracer).
- **D3.** Politique de **purge/anonymisation** (le git conserve l'historique → prévoir purge réelle ou
  pseudonymisation dès la saisie).
- **D4.** Retirer le tracker du discours « 0 serveur » et lui donner sa propre ligne au registre (C1).

### 🟩 Lot E — Pages légales du site

- **E1.** Page **Mentions légales** (éditeur, hébergeur GitHub, contact).
- **E2.** Page **Politique de confidentialité** (traitements du site : profil localStorage, feedback Tally,
  éventuels transferts, absence de cookies de suivi une fois le Lot B fait) — liée depuis `index.html` et `outils.html`.

---

## 5. Priorisation en un coup d'œil

| Lot | Effort | Risque couvert | Priorité |
|---|---|---|---|
| **A** — corriger les claims | Faible | Juridique (trompeur) + confiance | **1 — tout de suite** |
| **B** — supprimer les dépendances tierces | Moyen | Supply-chain + transferts hors UE | **2** |
| **C** — kit conformité cabinet | Moyen/élevé | Le cœur du RGPD du CGP | **2 (en parallèle)** |
| **D** — tracker | Faible/moyen | Traitement non déclaré | 3 |
| **E** — pages légales | Faible | LCEN + transparence | 3 |

---

## 6. Le message à retenir

Ton architecture est un **très bon socle de minimisation** — garde-le. Mais **« 0 serveur » ≠ « conforme
RGPD »**, et deux ou trois affirmations absolues te **fragilisent** plus qu'elles ne te protègent. Le risque
réel n'est pas un serveur (il n'existe pas pour les données client) : c'est **(a)** les scripts tiers chargés
sur la page la plus sensible sans contrôle d'intégrité, et **(b)** l'archive JSON/PDF ultrasensible laissée en
clair. Et surtout, **80 % de la conformité se joue hors de l'outil** : registre, information client,
conservation 5 ans, archivage sécurisé, sous-traitance. Le plan ci-dessus commence par rendre ton discours
*exact* (Lot A), puis rend ton archi *cohérente avec ce discours* (Lot B), puis t'outille sur le vrai RGPD du
cabinet (Lot C).

*À faire valider par un DPO / avocat avant toute communication client ou mention commerciale « RGPD ».*
