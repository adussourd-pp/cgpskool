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

| Méthode | Route     | Body JSON                                      | Effet                                       |
|---------|-----------|------------------------------------------------|---------------------------------------------|
| `GET`   | `/`       | —                                              | Healthcheck + lecture                       |
| `POST`  | `/add`    | `{ prenom, parrain, etape }`                   | Ajoute un invité                            |
| `POST`  | `/update` | `{ id, etape?, continue? }`                    | Met à jour étape et/ou statut "continue"    |
| `POST`  | `/delete` | `{ id }`                                       | Supprime définitivement                     |

CORS activé pour tous les domaines (GitHub Pages, dev local, etc.).

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

- ✅ 4 tuiles compteurs cliquables (filtrent le Kanban)
- ✅ Kanban à 4 colonnes avec actions ⬅️ ➡️ ❌ ✅ 🗑️
- ✅ Formulaire d'ajout compact, avec auto-suggestion des parrains existants
- ✅ Classement 🏆 Top parrains
- ✅ Taux de conversion DM → INSCRIT en direct
- ✅ 🎉 Confetti CSS quand un invité atteint INSCRIT
- ✅ 100% responsive mobile

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
