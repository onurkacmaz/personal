// Static assets plus one API route: the Togul "blog" flag evaluation.
//
// The browser can't call api.togul.io directly (the SDK key would ship in the
// page), so it posts to /api/v1/evaluate on this origin and this Worker asks
// Togul with the key from the TOGUL_SDK_KEY secret. The request body is
// ignored: the flag is fixed here, so the route can't evaluate anything else.
//
// It uses Togul's OFREP endpoint, where the environment comes from the API
// key itself, so there is no environment name to keep in sync. The answer is
// reshaped into what the @togul/js SDK expects from /api/v1/evaluate.

const UPSTREAM = 'https://api.togul.io/ofrep/v1/evaluate/flags/blog';
const FLAG = 'blog';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname !== '/api/v1/evaluate') return env.ASSETS.fetch(request);

    if (request.method !== 'POST') {
      return json({ error: 'method not allowed' }, 405, { Allow: 'POST' });
    }
    if (!env.TOGUL_SDK_KEY) return json({ error: 'not configured' }, 503);

    let upstream;
    try {
      upstream = await fetch(UPSTREAM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': env.TOGUL_SDK_KEY },
        body: JSON.stringify({ context: {} }),
      });
    } catch {
      return json({ error: 'upstream unreachable' }, 502);
    }

    // Togul's errors (bad key, unknown flag, quota) pass through untouched.
    if (!upstream.ok) return json(await readJson(upstream), upstream.status);

    const data = await readJson(upstream);
    if (!data) return json({ error: 'bad upstream response' }, 502);

    // OFREP leaves `value` out when the flag is disabled, and says so in
    // `reason`; the SDK's `enabled` is that same "flag is active" bit.
    return json({
      flag_key: FLAG,
      enabled: data.reason !== 'DISABLED',
      value_type: typeof data.value === 'boolean' ? 'boolean' : 'json',
      value: data.value ?? null,
      reason: String(data.reason ?? 'UNKNOWN').toLowerCase(),
    });
  },
};

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });
}
