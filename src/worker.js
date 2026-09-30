// Static assets plus one API route: the Togul "blog" flag evaluation.
//
// The browser can't call api.togul.io directly (CORS, and the SDK key would
// ship in the page), so it posts to /api/v1/evaluate on this origin and this
// Worker forwards the request with the key from the TOGUL_SDK_KEY secret.
// The request body is ignored: the flag, environment and context are fixed
// here, so the route can't be used to evaluate anything else.

const UPSTREAM = 'https://api.togul.io/api/v1/evaluate';
const FLAG = 'blog';
const ENVIRONMENT = 'production';

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
        body: JSON.stringify({ flag_key: FLAG, environment_key: ENVIRONMENT, context: {} }),
      });
    } catch {
      return json({ error: 'upstream unreachable' }, 502);
    }

    // Pass Togul's answer through untouched, whatever the status.
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  },
};

function json(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });
}
