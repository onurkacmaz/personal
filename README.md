# onurkacmaz.com

My personal site. One static page, no build step, no framework.

Live at [onurkacmaz.com](https://onurkacmaz.com), served from Cloudflare
Workers as a static-assets-only Worker.

## Layout

```
public/          everything that gets published
  index.html     the whole site: markup, styles and script in one file
  404.html       not-found page
  img/           portrait, company and project logos, screenshots
wrangler.jsonc   Worker config: assets dir, custom domains, account
```

Nothing outside `public/` is published, so this README and the config stay
private to the repo.

## Local

```sh
npm install
npm run dev        # wrangler dev, serves public/ on localhost
```

Or just open `public/index.html` in a browser — there is no build, so the
file works straight from disk.

## Deploy

```sh
npm run deploy     # wrangler deploy
```

`wrangler.jsonc` pins the Cloudflare account and both custom domains
(`onurkacmaz.com` and `www.onurkacmaz.com`), so a deploy from any machine
reproduces the same setup. The apex is canonical; `www` serves the same
page and the canonical link points at the apex.

The Worker has no `main` entry. With no script to run, requests are answered
straight from the edge, and unmatched paths fall through to `404.html`.
