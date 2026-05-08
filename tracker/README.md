# 🎯 CGP Skool Tracker

Mini-site web de suivi d'équipe pour les actions de développement commercial.
Un Kanban partagé qui suit chaque invité du **DM** au **INSCRIT**, avec
classement des parrains et taux de conversion en direct.

100% statique côté navigateur, données stockées dans un simple `tracking.json`
sur GitHub, écriture sécurisée via un Worker Cloudflare (le token GitHub n'est
**jamais** exposé au client).

```
┌─────────────────┐      ┌─────────────────────┐      ┌─────────────────┐
│ index.html      │ ───▶ │ Cloudflare Worker   │ ───▶ │ GitHub API      │
│ (GitHub Pages)  │      │ (worker.js)         │      │ tracking.json   │
└─────────────────┘      └─────────────────────┘      └─────────────────┘
```

---

## 📁 Fichiers

| Fichier          | Rôle                                                     |
|------------------|----------------------------------------------------------|
| `index.html`     | Application (vanilla JS, CSS moderne, mobile-friendly)   |
| `worker.js`      | Cloudflare Worker — proxy sécurisé vers l'API GitHub     |
| `tracking.json`  | Données (vide au départ, géré automatiquement ensuite)   |
| `README.md`      | Ce fichier                                               |

---

## 🚀 Déploiement

### 1. Créer le repo GitHub

1. Crée un nouveau repo (par ex. `cgp-skool-tracker`).
2. Pousse le contenu de ce dossier à la racine du repo.
3. Vérifie que `tracking.json` est bien à la racine et contient `[]`.

### 2. Générer un token GitHub

Dans **GitHub → Settings → Developer settings → Personal access tokens** :

- **Fine-grained token** (recommandé) :
  - Repository access : *Only select repositories* → ton repo tracker
  - Permissions : *Repository permissions → Contents : Read and write*
- Ou **Classic token** avec le scope `repo`.

Copie le token, tu en auras besoin à l'étape suivante. **Ne le commite jamais.**

### 3. Déployer le Worker Cloudflare

#### Option A — via le dashboard Cloudflare (le plus simple)

1. Va sur [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create → Create Worker**.
2. Donne un nom (ex : `cgp-skool-tracker`).
3. Une fois créé, ouvre **Edit code** et remplace le contenu par celui de `worker.js`.
4. Clique **Save and deploy**.
5. Va dans **Settings → Variables and Secrets** et ajoute :

   | Type   | Nom              | Valeur                            |
   |--------|------------------|-----------------------------------|
   | Text   | `GITHUB_USER`    | ton nom d'utilisateur GitHub      |
   | Text   | `GITHUB_REPO`    | nom du repo (ex : `cgp-skool-tracker`) |
   | Text   | `GITHUB_BRANCH`  | `main`                            |
   | Secret | `GITHUB_TOKEN`   | ton PAT GitHub                    |

6. Note l'URL du Worker, du genre :
   `https://cgp-skool-tracker.<ton-compte>.workers.dev`

> 💡 **Optionnel — notifications Slack**
> Ajoute une variable de type **Secret** nommée `SLACK_WEBHOOK_URL`
> contenant un *Incoming Webhook* (voir section dédiée plus bas).
> Sans cette variable, la fonctionnalité est silencieusement désactivée.

#### Option B — via wrangler (CLI)

```bash
npm install -g wrangler
wrangler login

# crée un wrangler.toml minimal
cat > wrangler.toml <<'EOF'
name = "cgp-skool-tracker"
main = "worker.js"
compatibility_date = "2024-10-01"
EOF

# secret
wrangler secret put GITHUB_TOKEN

# variables (texte brut)
wrangler deploy --var GITHUB_USER:moncompte \
                --var GITHUB_REPO:cgp-skool-tracker \
                --var GITHUB_BRANCH:main
```

### 4. Brancher le front

Ouvre `index.html` et remplace la constante en haut du `<script>` :

```js
const WORKER_URL = "https://cgp-skool-tracker.<ton-compte>.workers.dev";
```

Commite, pousse, et c'est en ligne.

### 5. Activer GitHub Pages

Dans **Settings → Pages** du repo :

- **Source** : `Deploy from a branch`
- **Branch** : `main` / `/ (root)`

Ton site sera accessible à :
`https://<ton-user>.github.io/cgp-skool-tracker/`

---

## 🔌 API du Worker

Toutes les routes renvoient le `tracking.json` à jour (`{ ok:true, data:[...] }`).

| Méthode | Route     | Body JSON                                          | Effet                                       |
|---------|-----------|----------------------------------------------------|---------------------------------------------|
| `GET`   | `/`       | —                                                  | Healthcheck + lecture                       |
| `POST`  | `/add`    | `{ prenom, parrain, etape, actor? }`               | Ajoute un invité                            |
| `POST`  | `/update` | `{ id, etape?, continue?, actor? }`                | Met à jour étape et/ou statut "continue"    |
| `POST`  | `/delete` | `{ id, actor? }`                                   | Supprime définitivement                     |

`actor` = prénom de la personne qui fait l'action (utilisé pour signer la
notification Slack). CORS activé pour tous les domaines.

---

## 💬 Notifications Slack (optionnel)

Si `SLACK_WEBHOOK_URL` est configuré côté Worker, **chaque action déclenche
un message dans le canal Slack associé**, signé par la personne qui l'a faite :

| Action                    | Exemple de message Slack                                            |
|---------------------------|---------------------------------------------------------------------|
| Ajout                     | 👤 *Camille* a ajouté *Arnaud* au tracker en *DM*                   |
| Avancement                | ▶️ *Arnaud* passe en *3J* _(AD → 3J)_ — acté par *Camille*          |
| Recul                     | ◀️ *Arnaud* passe en *AD* _(3J → AD)_ — acté par *Camille*          |
| Inscription 🎉            | 🎉 *Arnaud* est *INSCRIT·E* ! Bravo *Alex* (acté par *Camille*)     |
| Abandon                   | ❌ *Arnaud* ne continue pas pour le moment — acté par *Camille*     |
| Réactivation              | ✅ *Arnaud* reprend le parcours ! — réactivé·e par *Camille*        |
| Suppression               | 🗑️ *Camille* a retiré *Arnaud* du tracker                           |

### Créer le webhook Slack

1. Va sur [api.slack.com/apps](https://api.slack.com/apps) → **Create New App**
   → *From scratch* → choisis le workspace.
2. Menu de gauche : **Incoming Webhooks** → active-le.
3. **Add New Webhook to Workspace** → choisis le canal (par ex. `#tracker`)
   → **Allow**.
4. Copie l'URL générée (commence par `https://hooks.slack.com/services/…`).

### Brancher au Worker

```bash
# avec wrangler
wrangler secret put SLACK_WEBHOOK_URL

# ou via le dashboard Cloudflare → Settings → Variables and Secrets :
# Type "Secret", nom "SLACK_WEBHOOK_URL", valeur = l'URL du webhook
```

C'est tout : le Worker détecte automatiquement la variable et publie les
messages. **Pas de redéploiement front nécessaire** — le webhook reste côté
serveur, jamais exposé au navigateur.

> Pour désactiver Slack : supprime la variable, le Worker reprend son
> comportement silencieux.

---

## 🗂 Format des données (`tracking.json`)

```json
[
  {
    "id": "ll7zn3-x9k1ad",
    "prenom": "Camille",
    "parrain": "Alex",
    "etape": "AD",
    "continue": true,
    "date_ajout": "2026-05-08",
    "date_maj": "2026-05-09"
  }
]
```

- `etape` : `"DM"` | `"AD"` | `"3J"` | `"INSCRIT"`
- `continue` : `false` quand l'invité ne continue pas (la carte reste visible mais grisée/barrée).

---

## 🎨 Aperçu des fonctionnalités

- ✅ Style officiel CGP Skool (Playfair / Inter, papier, orange #D4622A)
- ✅ 4 tuiles compteurs cliquables (filtrent le Kanban)
- ✅ Kanban à 4 colonnes avec actions ⬅️ ➡️ ❌ ✅ 🗑️
- ✅ Formulaire d'ajout compact, auto-suggestion des parrains existants
- ✅ **Identification rapide** : pill « Identifié·e : <prénom> » dans la nav
  → le champ « Parrain·e » est pré-rempli automatiquement, plus besoin de
  retaper son prénom à chaque ajout
- ✅ Classement 🏆 Top parrains
- ✅ Taux de conversion DM → INSCRIT en direct
- ✅ 🎉 Confetti aux couleurs CGP Skool quand un invité atteint INSCRIT
- ✅ **Notifications Slack** (optionnel) : chaque ajout / changement d'étape /
  inscription est posté dans un canal commun, signé par le prénom de la
  personne qui a fait l'action — voir la section dédiée plus bas
- ✅ 100% responsive mobile

### Comment marche l'identification ?

Au premier ajout, on te demande ton prénom (mémorisé en `localStorage` dans la
clé `cgpskool_tracker_user`). Si l'app principale CGP Skool est ouverte sur le
même navigateur/domaine, le tracker lit aussi automatiquement la clé
`cgpskool_profil_v1` (champ `pPrenom`) — donc si tu as déjà rempli ton profil
conseiller, il n'y a rien à faire, ton prénom est déjà connu.

Tu peux changer ou effacer ton identité à tout moment en cliquant sur la pill
en haut à droite. Si tu veux ponctuellement parrainer pour quelqu'un d'autre,
clique sur « parrainer pour quelqu'un d'autre ↩ » sous le champ parrain.

---

## 🛟 Dépannage

- **« Impossible de charger les données »** : vérifie l'URL du Worker dans
  `index.html` et la console du navigateur.
- **Erreur 401 / 403 côté Worker** : token GitHub manquant ou sans droit
  `Contents: Read and write`.
- **Le commit n'apparaît pas** : vérifie `GITHUB_BRANCH`. Sur les nouveaux
  repos, c'est `main`.
- **Plusieurs personnes éditent en même temps** : le Worker utilise le `sha`
  du fichier ; en cas de course, GitHub renverra `409` et il suffira de
  rafraîchir la page pour repartir de l'état à jour.
