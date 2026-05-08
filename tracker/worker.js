/**
 * CGP Skool Tracker — Cloudflare Worker
 * --------------------------------------
 * Lit / écrit le fichier `tracking.json` (à la racine du repo GitHub configuré)
 * via l'API GitHub. Le token GitHub est stocké côté Cloudflare uniquement
 * (variable d'environnement `GITHUB_TOKEN`), jamais exposé au client.
 *
 * Variables d'environnement attendues :
 *   - GITHUB_USER         : nom du propriétaire du repo (ex: "moncompte")
 *   - GITHUB_REPO         : nom du repo (ex: "cgp-skool-tracker")
 *   - GITHUB_BRANCH       : branche à utiliser (ex: "main")
 *   - GITHUB_TOKEN        : Personal Access Token avec scope "repo" (ou
 *                          fine-grained avec write sur Contents)
 *   - SLACK_WEBHOOK_URL   : (optionnel) Incoming Webhook Slack. Si présent,
 *                          chaque ajout/changement d'étape/abandon/réactivation
 *                          est posté dans le canal Slack associé, signé par
 *                          le prénom de la personne qui a fait l'action.
 *
 * Endpoints :
 *   GET  /         -> healthcheck + dernier état du tracking.json
 *   POST /add      -> { prenom, parrain, etape, actor? } : ajoute un invité
 *   POST /update   -> { id, etape?, continue?, actor? } : modifie un invité
 *   POST /delete   -> { id, actor? } : supprime un invité
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

// --- Notifications Slack -------------------------------------------------
// Incoming Webhook : on POSTe un JSON simple { text, blocks }. Si la variable
// SLACK_WEBHOOK_URL n'est pas configurée, on saute silencieusement.

async function postSlack(env, payload) {
  if (!env.SLACK_WEBHOOK_URL) return;
  try {
    await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // On ne casse jamais l'appel principal pour une notif Slack
    console.log('Slack notify failed:', e.message);
  }
}

function actorOf(body) {
  return cleanStr(body.actor) || 'Quelqu’un';
}

function slackBlocks(headline, context) {
  // Mise en forme Slack avec un block "section" + un "context" sous-titre
  return {
    text: headline.replace(/\*/g, ''),
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: headline } },
      ...(context ? [{
        type: 'context',
        elements: [{ type: 'mrkdwn', text: context }],
      }] : []),
    ],
  };
}

// --- Handlers ------------------------------------------------------------

async function handleAdd(req, env, ctx) {
  const body = await req.json().catch(() => ({}));
  const prenom = cleanStr(body.prenom);
  const parrain = cleanStr(body.parrain);
  const etape = ETAPES.includes(body.etape) ? body.etape : 'DM';
  const actor = actorOf(body);

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

  // 🔔 Slack
  const headline = `:bust_in_silhouette: *${actor}* a ajouté *${prenom}* au tracker en *${etape}*`;
  const context = parrain !== actor
    ? `Parrain·e officiel·le : *${parrain}* — bienvenue à bord ✦`
    : `Bienvenue à bord ✦`;
  ctx.waitUntil(postSlack(env, slackBlocks(headline, context)));

  return jsonResponse({ ok: true, data });
}

async function handleUpdate(req, env, ctx) {
  const body = await req.json().catch(() => ({}));
  if (!body.id) return errorResponse('id manquant.');
  const actor = actorOf(body);

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
  const after = data[idx];

  const msg = `tracker: maj ${after.prenom} (${before.etape}→${after.etape}, continue=${after.continue})`;
  await writeTracking(env, data, sha, msg);

  // 🔔 Slack — choix du message selon ce qui a changé
  let slack = null;
  if (before.continue && !after.continue) {
    slack = slackBlocks(
      `:x: *${after.prenom}* ne continue pas pour le moment`,
      `Acté par *${actor}* — parrain·e : *${after.parrain}*`
    );
  } else if (!before.continue && after.continue) {
    slack = slackBlocks(
      `:white_check_mark: *${after.prenom}* reprend le parcours !`,
      `Réactivé·e par *${actor}* — étape : *${after.etape}*`
    );
  } else if (before.etape !== after.etape) {
    if (after.etape === 'INSCRIT') {
      slack = slackBlocks(
        `:tada: *${after.prenom}* est *INSCRIT·E* ! :tada:`,
        `Bravo *${after.parrain}* (acté par *${actor}*) — la team avance ✦`
      );
    } else {
      const arrow = ETAPES.indexOf(after.etape) > ETAPES.indexOf(before.etape) ? ':arrow_right:' : ':arrow_left:';
      slack = slackBlocks(
        `${arrow} *${after.prenom}* passe en *${after.etape}*  _(${before.etape} → ${after.etape})_`,
        `Acté par *${actor}* — parrain·e : *${after.parrain}*`
      );
    }
  }
  if (slack) ctx.waitUntil(postSlack(env, slack));

  return jsonResponse({ ok: true, data });
}

async function handleDelete(req, env, ctx) {
  const body = await req.json().catch(() => ({}));
  if (!body.id) return errorResponse('id manquant.');
  const actor = actorOf(body);

  const { data, sha } = await readTracking(env);
  const idx = data.findIndex(x => x.id === body.id);
  if (idx === -1) return errorResponse('Invité introuvable.', 404);

  const removed = data.splice(idx, 1)[0];
  await writeTracking(env, data, sha, `tracker: suppression ${removed.prenom}`);

  // 🔔 Slack (discret)
  ctx.waitUntil(postSlack(env, slackBlocks(
    `:wastebasket: *${actor}* a retiré *${removed.prenom}* du tracker`,
    `Étape avant retrait : *${removed.etape}*`
  )));

  return jsonResponse({ ok: true, data });
}

// --- Router --------------------------------------------------------------

export default {
  async fetch(request, env, ctx) {
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

      if (path === '/add'    && request.method === 'POST') return await handleAdd(request, env, ctx);
      if (path === '/update' && request.method === 'POST') return await handleUpdate(request, env, ctx);
      if (path === '/delete' && request.method === 'POST') return await handleDelete(request, env, ctx);

      return errorResponse('Route inconnue.', 404);
    } catch (err) {
      return errorResponse(err.message || String(err), 500);
    }
  },
};
