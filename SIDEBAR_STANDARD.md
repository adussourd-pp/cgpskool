# Nomenclature standard de la sidebar

Référence unique pour normaliser la sidebar de tous les modules CGP Skool.
Basée sur `scpi-financement.html`, `suivi-contrat.html`, `scpi-simulator.html`
et `etude-transfert-per.html`.

---

## 1. Structure globale

```
┌─────────────────────────────┐
│ 0. Choix initial (option.)  │  ← tabs boutons, sans toggle
│    "Type de projection",    │    (ex: scpi-simulator, transfert-per)
│    "Famille de contrat"…    │
├─────────────────────────────┤
│ 1. Identité client          │  ← fg / input (toggle ouvert OU
│    (séparateur discret)     │    bloc simple sans toggle)
├─────────────────────────────┤
│ 2. Toggles métier           │  ← cs-sidebar-lbl + sb-body
│    (1 à N selon module)     │
│    (accordéon strict si     │
│     progression)            │
├─────────────────────────────┤
│ 3. Bouton d'action (orange) │  ← sim-btn (si module avec calcul)
│    "Lancer la projection →" │
│                             │
│ 4. Compteur étapes (option) │  ← prog-count
│    "X / N étapes validées"  │
│    (sous le bouton Lancer)  │
├─────────────────────────────┤
│    (flex:1 spacer)          │  ← pousse le bas vers le bas
│                             │
│    (séparateur)             │
│ 5. Boutons bas fixes        │
│    • Exporter PDF (vert)    │
│    • Sauvegarder            │
│    • Charger                │
│    • Réinitialiser (rouge)  │
└─────────────────────────────┘
```

Le conteneur `.cs-sidebar` est déjà en `display:flex; flex-direction:column`
(défini dans `cgp-skool-layout.css`). Le spacer `flex:1` répartit le bloc
d'actions bas vers le pied.

---

## 1bis. Choix initial hors toggle (optionnel)

Certains modules imposent un choix structurant **avant même de renseigner
le client** : type de projection, famille de contrat, profil, etc. Ce
choix pilote l'affichage du reste du module et doit être visible en
permanence.

### Règles

- **Toujours au-dessus du bloc client**, sans aucun toggle
- Rendu en **boutons-onglets** (2 ou 3 max), pas en menu déroulant
- Le bouton actif utilise l'orange de la marque
- Un `<select>` `display:none` peut être conservé en coulisses pour la
  compatibilité JS (la sélection est lue via `.value`)

### HTML

```html
<div class="fg" style="margin-bottom:14px">
  <label>Type de projection</label>
  <div class="mode-tabs">
    <div class="mode-tab active" onclick="setMode('a',this)">
      <span class="mode-icon">📈</span>Option A
    </div>
    <div class="mode-tab" onclick="setMode('b',this)">
      <span class="mode-icon">🔀</span>Option B
    </div>
    <div class="mode-tab" onclick="setMode('c',this)">
      <span class="mode-icon">🏢</span>Option C
    </div>
  </div>
</div>
```

### CSS local

```css
.mode-tabs{display:grid;grid-template-columns:repeat(var(--n,3),1fr);
  gap:6px}
.mode-tab{padding:10px 6px;border:1.5px solid var(--bord);border-radius:8px;
  background:#fff;color:var(--gris);font-size:11px;cursor:pointer;
  text-align:center;transition:all 0.2s;font-family:var(--sans);
  font-weight:400;line-height:1.3}
.mode-tab.active{border-color:var(--orange);color:var(--orange);
  background:rgba(212,98,42,0.08);font-weight:600}
.mode-tab:hover:not(.active){border-color:var(--orange);color:var(--orange)}
.mode-icon{font-size:16px;display:block;margin-bottom:4px}
```

Pour 2 options, changer `grid-template-columns:1fr 1fr` (pattern utilisé
dans `etude-transfert-per.html` sous le nom `.fam-tabs`).

### JS

```js
function setMode(m, el){
  currentMode = m;
  document.querySelectorAll('.mode-tab').forEach(function(t){
    t.classList.remove('active');
  });
  el.classList.add('active');
  // ... afficher/masquer les blocs liés
  update();
}
```

### Exemples existants

| Module | Label | Options |
|---|---|---|
| `scpi-simulator` | Type de projection | Plan Retraite / Nue-propriété / Entreprise |
| `etude-transfert-per` | Famille de contrat | PER / Assurance Vie |

---

## 2. Bloc client (haut)

### Variante A — bloc simple sans toggle (recommandé si pas de progression)

```html
<div class="fg" style="margin-bottom:14px">
  <label>Nom du client</label>
  <input class="fi" type="text" id="clientNom" placeholder="Prénom Nom"
         oninput="renderHeader()">
</div>
<div style="height:1px;background:var(--bord);margin-bottom:14px"></div>
```

### Variante B — toggle ouvert par défaut (si module avec progression)

```html
<div class="cs-sidebar-lbl open" data-step="client"
     onclick="openStep('client', this)">
  <span class="acc">▶</span>Client
</div>
<div class="sb-body open" id="body_client">
  <div class="fg"><label>Nom du client</label>
    <input class="fi" type="text" id="clientNom" placeholder="Prénom Nom"
           oninput="renderHeader();updateProgress()">
  </div>
</div>
```

- `id` libre mais préféré : `fClient1` (scpi-financement) ou `clientNom` (autres)
- Variante B est utilisée dès qu'il y a un compteur `prog-count`, pour
  que "Client" compte comme une étape validable.

---

## 3. Toggles métier

### Structure HTML

```html
<div class="cs-sidebar-lbl open" data-step="xxx"
     onclick="openStep('xxx', this)">
  <span class="acc">▶</span>Titre sans emoji
</div>
<div class="sb-body open" id="body_xxx">
  … contenu …
</div>
```

### Règles

- **Titre sans emoji** dans `.cs-sidebar-lbl`
- **Accent `▶`** obligatoire, tourne de 90° quand `.open`
- **Aucune pastille** dans les titres (indicateur = compteur sous le bouton)
- **Un seul toggle ouvert à la fois** (accordéon strict) → utiliser `openStep`
- **Sans progression** : conserver `onclick="CGP.toggleAcc(this)"`

### Sans progression (module simple)

```html
<div class="cs-sidebar-lbl open" onclick="CGP.toggleAcc(this)">
  <span class="acc">▶</span>Paramètres généraux
</div>
<div class="sb-body open"> … </div>
```

### Avec progression (module complexe)

Voir section **5. Progression pastilles**.

---

## 4. Inputs dans les toggles

### Input standard (label + champ + unité)

```html
<div class="fg">
  <label>Nom du champ</label>
  <div class="fi-row">
    <input type="number" id="xxx" value="0" oninput="recalc()">
    <span class="fi-unit">€</span>
  </div>
</div>
```

### Input sans unité

```html
<div class="fg">
  <label>Nom du champ</label>
  <input class="fi" type="text" id="xxx">
</div>
```

### Select

```html
<div class="fg">
  <label>Choix</label>
  <select class="fi" id="xxx">
    <option value="a">A</option>
  </select>
</div>
```

### Grille 2 colonnes

```html
<div class="grid2">
  <div class="fg"> … </div>
  <div class="fg"> … </div>
</div>
```

### Classes (définies localement dans chaque module)

- `.fg` : conteneur label + input
- `.fg label` : 9px, 600, uppercase, letter-spacing 0.06em, couleur var(--gris)
- `.fi` : input/select standard
- `.fi-row` : conteneur input + unité
- `.fi-unit` : unité à droite
- `.grid2` : grille 2 colonnes

**Interdits** : `.pr`, `.pl`, `.iu`, `.iu-u` (dépréciés).

---

## 5. Progression (modules complexes)

### Quand l'utiliser

Si le module a **3 toggles ou plus** avec des champs obligatoires à remplir.

Le seul indicateur visuel est le **compteur sous le bouton Lancer** :
aucune pastille n'est affichée dans les titres de toggles (titres propres).

### CSS local

```css
.prog-count{font-family:var(--sans);font-size:10px;font-weight:600;
  letter-spacing:0.08em;text-transform:uppercase;color:var(--gris);
  text-align:center;margin-top:8px}
.prog-count strong{color:var(--orange);font-weight:700;font-size:11px}
.prog-count.full strong{color:var(--green)}
```

### JS local

```js
var _stepOpened = {step1:true, step2:false, step3:false, step4:false};

function openStep(id, el){
  if(id) _stepOpened[id] = true;
  document.querySelectorAll('.cs-sidebar-lbl').forEach(function(l){
    var body = l.nextElementSibling;
    if(!body || !body.classList.contains('sb-body')) return;
    if(l === el){
      var open = l.classList.toggle('open');
      body.classList.toggle('open', open);
    } else {
      l.classList.remove('open');
      body.classList.remove('open');
    }
  });
  updateProgress();
}

function isStepComplete(id){
  if(!_stepOpened[id]) return false;
  // logique spécifique au module : champs obligatoires remplis
  return true;
}

function updateProgress(){
  var steps = ['step1','step2','step3','step4'], done = 0;
  steps.forEach(function(id){if(isStepComplete(id)) done++;});
  var c = document.getElementById('progCount');
  if(c){
    c.innerHTML = '<strong>' + done + '</strong> / ' + steps.length + ' étapes validées';
    c.classList.toggle('full', done === steps.length);
  }
}
```

### HTML du compteur (sous le bouton Lancer)

```html
<button class="sim-btn" onclick="runSim()">Lancer la projection →</button>
<div class="prog-count" id="progCount">
  <strong>0</strong> / 4 étapes validées
</div>
```

### Règles

- Le compteur **orange** tant qu'il y a des étapes manquantes
- Le compteur passe en **vert** (`.full`) quand toutes les étapes sont validées
- L'accordéon strict (1 toggle ouvert) reste actif même sans pastilles

---

## 6. Bouton d'action principal (module avec calcul)

```html
<button class="sim-btn" onclick="runSim()">Lancer la projection →</button>
```

### CSS

```css
.sim-btn{width:100%;padding:10px;background:var(--orange);color:#fff;
  border:none;font-family:var(--sans);font-size:13px;font-weight:500;
  cursor:pointer;margin-top:12px;flex-shrink:0}
.sim-btn:hover{background:var(--orange-hover)}
```

- **Reste orange en permanence** (pas grisé pendant le remplissage)
- **Un seul bouton d'action** par module (jamais 2)
- Texte : verbe d'action + flèche → : "Lancer la projection →", "Calculer →"

### Module sans calcul (affichage live)

Pas de `sim-btn` ; seulement la section "Boutons bas" (l'export PDF suffit).

---

## 7. Bloc de boutons bas (OBLIGATOIRE sur tous les modules)

```html
<div style="flex:1;min-height:16px"></div>
<div style="height:1px;background:var(--bord);margin:12px 0"></div>
<button class="btn-pdf" onclick="CGP.pdf.print()">⬇ Exporter PDF</button>
<button class="btn-secondary" onclick="CGP.project.exportAll()">💾 Sauvegarder</button>
<label class="btn-secondary" style="cursor:pointer">📂 Charger
  <input type="file" accept=".json" style="display:none"
         onchange="CGP.project.importAll(this.files[0]);this.value=''">
</label>
<button class="btn-secondary" onclick="resetModule()" style="color:#EF4444">
  ⎘ Réinitialiser
</button>
```

### CSS local

```css
.btn-pdf{width:100%;padding:11px;background:#2D7A5B;color:#fff;border:none;
  font-family:var(--sans);font-size:13px;font-weight:500;cursor:pointer;
  margin-bottom:4px}
.btn-secondary{width:100%;padding:10px;background:transparent;
  border:1.5px solid var(--bord);color:var(--gris);font-family:var(--sans);
  font-size:12px;font-weight:600;cursor:pointer;border-radius:7px;
  margin-bottom:4px;display:block;text-align:center;box-sizing:border-box}
.btn-secondary:hover{border-color:var(--orange);color:var(--orange)}
```

### Fonction reset standard

```js
function resetModule(){
  if(!confirm('Réinitialiser tous les champs ?')) return;
  try{
    localStorage.removeItem('cgpskool_state_NOM-DU-MODULE');
  } catch(e){}
  location.reload();
}
```

Remplacer `NOM-DU-MODULE` par l'ID utilisé dans
`CGP.project.registerModule('NOM-DU-MODULE', {...})`.

### Ordre fixe

1. Spacer `flex:1`
2. Séparateur 1px
3. **Exporter PDF** (vert, primary)
4. **Sauvegarder** (secondary)
5. **Charger** (secondary, label avec input file caché)
6. **Réinitialiser** (secondary, texte rouge)

---

## 8. Checklist de conformité pour un module

Avant commit d'un nouveau module ou refonte :

- [ ] Si un choix structurant doit précéder tout le reste : `.mode-tabs` / `.fam-tabs` au-dessus du client, sans toggle
- [ ] Bloc client en haut (bloc simple OU toggle ouvert `data-step="client"`)
- [ ] Toggles métier avec `cs-sidebar-lbl` + `sb-body`
- [ ] Pas d'emoji dans les titres de toggles
- [ ] Accent `▶` présent dans chaque toggle
- [ ] Si progression : compteur "X / N étapes validées" sous le bouton Lancer
- [ ] Si progression : accordéon strict (`openStep`), pas de pastilles dans les titres
- [ ] Sinon : `CGP.toggleAcc` classique
- [ ] Bouton d'action principal orange (si calcul) — 1 seul
- [ ] Spacer `flex:1` avant le bloc bas
- [ ] Séparateur 12px avant les boutons bas
- [ ] 4 boutons bas dans l'ordre : PDF / Sauver / Charger / Reset
- [ ] `resetModule()` efface `cgpskool_state_<id>`
- [ ] Module enregistré via `CGP.project.registerModule`
- [ ] `CGP.project.autoSave('<id>')` appelé après chaque calcul

---

## 9. Modules à migrer (état des lieux)

| Module | Choix initial | Client | Toggles | Progression | Boutons bas | Reset |
|---|---|---|---|---|---|---|
| scpi-financement | — | ✓ toggle | ✓ | ✓ compteur | ✓ 4 boutons | ✓ |
| suivi-contrat | — | ✓ | ✓ | — (live) | ✓ 4 boutons | ✓ |
| scpi-simulator | ✓ `.mode-tabs` (3) | ✓ toggle | ✓ | ✓ compteur 3/3 | ✓ 4 boutons | ✓ |
| etude-transfert-per | ✓ `.fam-tabs` (2) | ✓ toggle | ✓ | ✓ compteur 3/3 | ✓ 4 boutons | ✓ |
| allocation-cible | — | ✓ | ✓ | — (live) | ✓ 4 boutons | ✓ |
| per-vs-av | — | ✓ | ✓ | — (live) | ✓ 4 boutons | ✓ |
| immo-simulator | ✓ `.tog-row` (3) | ✓ toggle | ✓ | — (live) | ✓ 4 boutons | ✓ |
| productivite | ? | ? | ? | — | ? | ? |
| bp-simulator | ? | ? | ? | — | ? | ? |
| interets-composes | ? | ? | ? | — | ? | ? |
| simulateur-avance-av | ? | ? | ? | — | ? | ? |
| comparatif-cgp | ? | ? | ? | — | ? | ? |
| equipe-builder | ? | ? | ? | — | ? | ? |
| etude-dossier | — | ✗ (structure différente) | — | ✓ sections | — | — |

Les modules marqués `?` doivent être audités et alignés.
`etude-dossier` reste à part (application principale multi-section, pas un
outil one-page).

---

## 10. Fichiers de référence

- **Avec progression** : `scpi-financement.html`
- **Live (sans calcul)** : `suivi-contrat.html`
- **Classes CSS sidebar** : `cgp-skool-layout.css` (variables, accordion)
- **Print CSS** : `cgp-skool-layout.css` (masquage sidebar)
- **Actions communes** : `cgp-skool-core.js` (CGP.project, CGP.pdf, CGP.toggleAcc)
