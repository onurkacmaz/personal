// Turns content/posts/*.md into the pages under public/blog/.
//
// Everything the blog needs lives in the markdown files: adding a post means
// adding one file and pushing it. Nothing here reads the network, and there is
// no dependency beyond Node itself.

import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderMarkdown, stripMarkdown, escapeHtml, slugify } from './markdown.mjs';
import { BASE_CSS, FONTS, HEAD_SCRIPT, PAGE_SCRIPT, topbar } from './theme.mjs';
import { BLOG_CSS } from './blog-css.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = join(ROOT, 'content', 'posts');
const OUT_DIR = join(ROOT, 'public', 'blog');
const SITE = 'https://onurkacmaz.com';
const AUTHOR = 'Onur Kaçmaz';

/* ---------- front matter ---------- */

// A deliberately small YAML subset: `key: value`, plus `[a, b]` or a `- item`
// block for lists. Anything richer belongs in the body of the post.
function parseFrontMatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: raw };

  const data = {};
  let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || /^\s*#/.test(line)) continue;

    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && key) {
      if (!Array.isArray(data[key])) data[key] = [];
      data[key].push(unquote(item[1]));
      continue;
    }

    const pair = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!pair) continue;
    key = pair[1];
    const value = pair[2].trim();
    if (!value) { data[key] = []; continue; }
    if (/^\[.*\]$/.test(value)) {
      data[key] = value.slice(1, -1).split(',').map(unquote).filter(Boolean);
    } else {
      data[key] = unquote(value);
    }
  }
  return { data, body: raw.slice(m[0].length) };
}

function unquote(s) {
  return s.trim().replace(/^["']|["']$/g, '').trim();
}

const truthy = (v) => v === true || v === 'true' || v === 'yes' || v === '1';

/* ---------- posts ---------- */

function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

async function loadPosts() {
  if (!existsSync(POSTS_DIR)) return [];
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.md')).sort();

  const posts = [];
  for (const file of files) {
    const raw = await readFile(join(POSTS_DIR, file), 'utf8');
    const { data, body } = parseFrontMatter(raw);

    if (truthy(data.draft)) continue;

    const title = data.title || file.replace(/\.md$/, '');
    // The filename may carry the date (2026-09-07-a-post.md); either way the
    // slug is the filename, so a published URL never moves on its own.
    const fileSlug = file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    const slug = slugify(data.slug || fileSlug);
    const dateFromName = (file.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1];
    const date = data.date || dateFromName || '';

    if (!date) {
      throw new Error(`${file}: no date. Add "date: YYYY-MM-DD" or name the file 2026-09-07-slug.md`);
    }

    const plain = stripMarkdown(body);
    const words = plain ? plain.split(/\s+/).length : 0;

    posts.push({
      file,
      slug,
      title,
      // Posts are written in more than one language; the default keeps every
      // existing file working without a front matter change.
      lang: data.lang || 'en',
      date,
      dateLabel: formatDate(date),
      description: data.description || data.summary || plain.slice(0, 180).trim(),
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
      minutes: Math.max(1, Math.round(words / 200)),
      body,
    });
  }

  const seen = new Map();
  for (const p of posts) {
    if (seen.has(p.slug)) throw new Error(`${p.file}: slug "${p.slug}" also used by ${seen.get(p.slug)}`);
    seen.set(p.slug, p.file);
  }

  // Newest first; same-day posts fall back to filename order for stability.
  return posts.sort((a, b) => (a.date === b.date ? b.file.localeCompare(a.file) : b.date.localeCompare(a.date)));
}

/* ---------- pages ---------- */

const OG_LOCALE = { en: 'en_GB', tr: 'tr_TR' };

function page({ title, description, canonical, css, body, lang = 'en', ogType = 'website', extraHead = '' }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:type" content="${ogType}">
<meta property="og:locale" content="${OG_LOCALE[lang] || 'en_GB'}">
<!-- Open Graph requires absolute URLs; a relative one silently drops the preview image. -->
<meta property="og:image" content="${SITE}/img/portrait.jpg">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary">
<link rel="canonical" href="${canonical}">
<link rel="alternate" type="application/atom+xml" title="${escapeHtml(AUTHOR)} — Writing" href="${SITE}/blog/feed.xml">
<meta name="theme-color" content="#ffffff">
${HEAD_SCRIPT}
<link rel="icon" href="/img/portrait.jpg">
${FONTS}
${extraHead}
<style>
${BASE_CSS}
${css}
</style>
</head>

<body>

${topbar({ current: 'blog' })}

${body}

${PAGE_SCRIPT}

</body>
</html>
`;
}

function postRow(p) {
  return `      <li>
        <a class="post-link" href="/blog/${p.slug}/">
          <span class="post-head">
            <span class="post-title">${escapeHtml(p.title)}</span>
            ${p.lang !== 'en' ? `<span class="post-lang">${escapeHtml(p.lang.toUpperCase())}</span>` : ''}
            <time class="post-date" datetime="${p.date}">${p.dateLabel}</time>
          </span>
          ${p.description ? `<span class="post-desc">${escapeHtml(p.description)}</span>` : ''}
        </a>
      </li>`;
}

function indexPage(posts) {
  const years = [];
  for (const p of posts) {
    const y = p.date.slice(0, 4);
    if (!years.length || years[years.length - 1].year !== y) years.push({ year: y, posts: [] });
    years[years.length - 1].posts.push(p);
  }

  const groups = years.map((g) => `    <div class="year">
      <p class="year-k">${g.year}</p>
      <ul class="post-list">
${g.posts.map(postRow).join('\n')}
      </ul>
    </div>`).join('\n');

  const body = `<main id="top">

  <div class="block">
    <h1 class="sr-only">Writing</h1>
    <p class="lead">Notes on the things I build: backend services, and the developer tools that come out of them.</p>
  </div>

  <div class="block">
    <p class="label">Posts</p>
${posts.length ? groups : '    <p class="empty">Nothing published yet.</p>'}
  </div>

</main>

<footer>${AUTHOR} · <a href="/">onurkacmaz.com</a> · <a href="/blog/feed.xml">Feed</a></footer>`;

  return page({
    title: `Writing — ${AUTHOR}`,
    description: 'Posts on backend systems, Go, PHP and the tools I build.',
    canonical: `${SITE}/blog/`,
    css: BLOG_CSS,
    body,
  });
}

function postPage(post, { prev, next }) {
  const { html } = renderMarkdown(post.body);

  const tags = post.tags.length
    ? `\n    <div class="meta-row">${post.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`
    : '';

  const navLinks = [
    next && `<a class="nav-link" href="/blog/${next.slug}/"><span class="nav-k">Next</span><span class="nav-t">${escapeHtml(next.title)}</span></a>`,
    prev && `<a class="nav-link" href="/blog/${prev.slug}/"><span class="nav-k">Previous</span><span class="nav-t">${escapeHtml(prev.title)}</span></a>`,
    '<a class="nav-link" href="/blog/"><span class="nav-k">Index</span><span class="nav-t">All posts</span></a>',
  ].filter(Boolean).map((l) => `      ${l}`).join('\n');

  // JSON-LD needs the values as JSON strings, not HTML-escaped ones.
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Person', name: AUTHOR, url: SITE },
    mainEntityOfPage: `${SITE}/blog/${post.slug}/`,
  }).replace(/</g, '\\u003c');

  const body = `<main id="top">

  <article class="block">
    <header class="post-hero">
      <h1>${escapeHtml(post.title)}</h1>
      <div class="post-meta">
        <time datetime="${post.date}">${post.dateLabel}</time>
        <span class="dot"></span>
        <span>${post.minutes} min read</span>
      </div>${tags}
    </header>
    <div class="article">
${html}
    </div>
  </article>

  <div class="block">
    <p class="label">More</p>
    <div class="post-nav">
${navLinks}
    </div>
  </div>

</main>

<footer>${AUTHOR} · <a href="/">onurkacmaz.com</a> · <a href="/blog/feed.xml">Feed</a></footer>`;

  return page({
    title: `${post.title} — ${AUTHOR}`,
    description: post.description,
    canonical: `${SITE}/blog/${post.slug}/`,
    css: BLOG_CSS,
    body,
    lang: post.lang,
    ogType: 'article',
    extraHead: `<script type="application/ld+json">${jsonLd}</script>`,
  });
}

function feed(posts) {
  const updated = posts.length ? `${posts[0].date}T00:00:00Z` : new Date().toISOString();
  const entries = posts.map((p) => `  <entry>
    <title>${escapeHtml(p.title)}</title>
    <link href="${SITE}/blog/${p.slug}/"/>
    <id>${SITE}/blog/${p.slug}/</id>
    <updated>${p.date}T00:00:00Z</updated>
    <summary>${escapeHtml(p.description)}</summary>
  </entry>`).join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeHtml(AUTHOR)} — Writing</title>
  <link href="${SITE}/blog/"/>
  <link rel="self" href="${SITE}/blog/feed.xml"/>
  <id>${SITE}/blog/</id>
  <updated>${updated}</updated>
  <author><name>${escapeHtml(AUTHOR)}</name></author>
${entries}
</feed>
`;
}

function sitemap(posts) {
  const urls = [`${SITE}/`, `${SITE}/blog/`, ...posts.map((p) => `${SITE}/blog/${p.slug}/`)];
  return `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;
}

/* ---------- run ---------- */

async function build() {
  const posts = await loadPosts();

  // The whole directory is generated, so start from empty: a renamed post
  // should not leave its old page behind on the next deploy.
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  await writeFile(join(OUT_DIR, 'index.html'), indexPage(posts));
  await writeFile(join(OUT_DIR, 'feed.xml'), feed(posts));

  for (let i = 0; i < posts.length; i++) {
    const dir = join(OUT_DIR, posts[i].slug);
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, 'index.html'),
      postPage(posts[i], { next: posts[i - 1], prev: posts[i + 1] }),
    );
  }

  await writeFile(join(ROOT, 'public', 'sitemap.xml'), sitemap(posts));
  await writeFile(
    join(ROOT, 'public', 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`,
  );

  console.log(`blog: ${posts.length} post${posts.length === 1 ? '' : 's'} → public/blog/`);
  for (const p of posts) console.log(`  /blog/${p.slug}/  ${p.date}  ${p.title}`);
}

build().catch((err) => {
  console.error(`build failed: ${err.message}`);
  process.exit(1);
});
