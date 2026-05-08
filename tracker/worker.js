/**
 * CGP Skool Tracker — Cloudflare Worker
 * --------------------------------------
 * Lit / écrit le fichier `tracking.json` (à la racine du repo GitHub configuré)
 * via l'API GitHub. Le token GitHub est stocké côté Cloudflare uniquement
 * (variable d'environnement `GITHUB_TOKEN`), jamais exposé au client.
 *
 * Variables d'environnement attendues :
 *   - GITHUB_USER    : nom du propriétaire du repo (ex: "moncompte")
 *   - GITHUB_REPO    : nom du repo (ex: "cgp-skool-tracker")
 *   - GITHUB_BRANCH  : branche à utiliser (ex: "main")
 *   - GITHUB_TOKEN   : Personal Access Token avec scope "repo" (ou fine-grained
 *                     avec write sur Contents)
 *
 * Endpoints :
 *   GET  /         -> healthcheck + dernier état du tracking.json
 *   POST /add      -> { prenom, parrain, etape } : ajoute un invité
 *   POST /update   -> { id, etape?, continue? } : modifie un invité existant
 *   POST /delete   -> { id } : supprime un invité
 *
 * Toutes les réponses renvoient le tracking.json à jour.
 */

const FILE_PATH = 'tracking.json';
const ETAPES = ['DM', 'AD', '3J', 'INSCRIT'];

// --- En-têtes CORS (autorisent l'appel depuis GitHub Pages, etc.) ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ ok: false, error: message }, status);
}

// --- Helpers GitHub API --------------------------------------------------

function ghHeaders(env) {
  return {
    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'cgp-skool-tracker-worker',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function ghContentsUrl(env) {
  const branch = env.GITHUB_BRANCH || 'main';
  return `https://api.github.com/repos/${env.GITHUB_USER}/${env.GITHUB_REPO}/contents/${FILE_PATH}?ref=${branch}`;
}

/**
 * Récupère le contenu actuel de tracking.json + son SHA (nécessaire pour
 * pouvoir le mettre à jour ensuite).
 */
async function readTracking(env) {
  const res = await fetch(ghContentsUrl(env), { headers: ghHeaders(env) });

  if (res.status === 404) {
    // Fichier pas encore créé -> on commence avec une liste vide
    return { data: [], sha: null };
  }
  if (!res.ok) {
    throw new Error(`Lecture GitHub impossible (${res.status}) : ${await res.text()}`);
  }

  const json = await res.json();
  // Le contenu est encodé en base64 par l'API GitHub
  const decoded = atob(json.content.replace(/\n/g, ''));
  let data = [];
  try {
    data = JSON.parse(decoded || '[]');
    if (!Array.isArray(data)) data = [];
  } catch (e) {
    data = [];
  }
  return { data, sha: json.sha };
}

/**
 * Écrit la nouvelle version de tracking.json sur GitHub.
 */
async function writeTracking(env, data, sha, message) {
  const branch = env.GITHUB_BRANCH || 'main';
  const body = {
    message,
    // btoa accepte les chars latin1 ; on encode en UTF-8 d'abord
    content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2) + '\n'))),
    branch,
  };
  if (sha) body.sha = sha;

  const url = `https://api.github.com/repos/${env.GITHUB_USER}/${env.GITHUB_REPO}/contents/${FILE_PATH}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...ghHeaders(env), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Écriture GitHub impossible (${res.status}) : ${await res.text()}`);
  }
  return data;
}

// --- Petites utilitaires métier ------------------------------------------

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function newId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function cleanStr(v) {
  return (typeof v === 'string' ? v : '').trim().slice(0, 80);
}

// --- Handlers ------------------------------------------------------------

async function handleAdd(req, env) {
  const body = await req.json().catch(() => ({}));
  const prenom = cleanStr(body.prenom);
  const parrain = cleanStr(body.parrain);
  const etape = ETAPES.includes(body.etape) ? body.etape : 'DM';

  if (!prenom) return errorResponse('Le prénom est requis.');
  if (!parrain) return errorResponse('Le parrain / la marraine est requis(e).');

  const { data, sha } = await readTracking(env);
  const today = todayStr();
  const invite = {
    id: newId(),
    prenom,
    parrain,
    etape,
    continue: true,
    date_ajout: today,
    date_maj: today,
  };
  data.push(invite);

  await writeTracking(env, data, sha, `tracker: ajout ${prenom} (${parrain})`);
  return jsonResponse({ ok: true, data });
}

async function handleUpdate(req, env) {
  const body = await req.json().catch(() => ({}));
  if (!body.id) return errorResponse('id manquant.');

  const { data, sha } = await readTracking(env);
  const idx = data.findIndex(x => x.id === body.id);
  if (idx === -1) return errorResponse('Invité introuvable.', 404);

  const before = { ...data[idx] };
  if (typeof body.etape === 'string' && ETAPES.includes(body.etape)) {
    data[idx].etape = body.etape;
  }
  if (typeof body.continue === 'boolean') {
    data[idx].continue = body.continue;
  }
  data[idx].date_maj = todayStr();

  const msg = `tracker: maj ${data[idx].prenom} (${before.etape}→${data[idx].etape}, continue=${data[idx].continue})`;
  await writeTracking(env, data, sha, msg);
  return jsonResponse({ ok: true, data });
}

async function handleDelete(req, env) {
  const body = await req.json().catch(() => ({}));
  if (!body.id) return errorResponse('id manquant.');

  const { data, sha } = await readTracking(env);
  const idx = data.findIndex(x => x.id === body.id);
  if (idx === -1) return errorResponse('Invité introuvable.', 404);

  const removed = data.splice(idx, 1)[0];
  await writeTracking(env, data, sha, `tracker: suppression ${removed.prenom}`);
  return jsonResponse({ ok: true, data });
}

// --- Router --------------------------------------------------------------

export default {
  async fetch(request, env) {
    // Pré-vol CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    try {
      // Healthcheck + lecture
      if (path === '/' && request.method === 'GET') {
        const { data } = await readTracking(env);
        return jsonResponse({ ok: true, status: 'up', data });
      }

      if (path === '/add' && request.method === 'POST') return await handleAdd(request, env);
      if (path === '/update' && request.method === 'POST') return await handleUpdate(request, env);
      if (path === '/delete' && request.method === 'POST') return await handleDelete(request, env);

      return errorResponse('Route inconnue.', 404);
    } catch (err) {
      return errorResponse(err.message || String(err), 500);
    }
  },
};
