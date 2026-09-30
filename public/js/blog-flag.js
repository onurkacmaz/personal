// Shows or hides the blog based on the Togul flag "blog".
//
// Everything that leads to the blog is marked data-blog-only and is hidden by
// CSS until this script sets <html data-blog="on">. So the default, and the
// outcome of any failure (network, bad key, missing flag), is hidden.
// On a blog page, an off flag also sends the visitor back to the front page.
//
// The SDK talks to this site's own /api/v1/evaluate (src/worker.js), which
// adds the real key server-side. The apiKey below is only there because the
// SDK refuses an empty one; the Worker ignores it.

import { TogulClient } from '/vendor/togul/index.mjs';

const FLAG = 'blog';

async function blogEnabled() {
  const client = new TogulClient({
    apiKey: 'proxied',
    environment: 'production',
    baseUrl: location.origin,
  });
  const result = await client.evaluate(FLAG);
  // `enabled` only says the flag record is active; `value` is the evaluation.
  return result.enabled === true && result.value === true;
}

let on = false;
try {
  on = await blogEnabled();
} catch (err) {
  console.warn('blog flag: evaluation failed, keeping the blog hidden', err);
}

if (on) {
  document.documentElement.setAttribute('data-blog', 'on');
} else if (location.pathname.startsWith('/blog')) {
  location.replace('/');
}
