---
title: A blog that is just markdown in a repo
description: The blog you are reading is a folder of markdown files. Pushing one to GitHub publishes it.
tags: [Cloudflare, Node, Static]
---

The site you are on has been one hand-written `index.html` for years. No
framework, no build, no content model. I wanted to add writing to it without
giving any of that up, so the blog is the smallest thing that could work: a
folder of markdown files and a script that turns them into pages.

## How a post gets published

Writing a post means adding a file:

```sh
content/posts/2026-09-07-a-blog-that-is-just-markdown.md
```

The file starts with a few lines of front matter and then the body:

```markdown
---
title: A blog that is just markdown in a repo
description: One line for the index page and the preview card.
tags: [Cloudflare, Node, Static]
---

The body, in ordinary markdown.
```

That is the whole content model. The date comes from the filename, the URL
comes from the filename, and `draft: true` keeps a file out of the build until
it is ready. Push to `main` and the post is live a few seconds later.

## What runs

`npm run build` reads every file in `content/posts`, renders it, and writes
`public/blog/`: an index page, one directory per post, an Atom feed and a
sitemap. Cloudflare then serves `public/` as static assets, exactly as it
served the single page before.

The markdown renderer is about two hundred lines in `scripts/markdown.mjs`. It
handles headings, lists, quotes, tables, fenced code, images and links, which
is all a post here has ever needed. Writing it took less time than choosing
between the libraries that do the same thing, and it means `wrangler` is still
the only dependency in the repo.

| Piece | Where |
| --- | --- |
| Posts | `content/posts/*.md` |
| Build | `scripts/build.mjs` |
| Output | `public/blog/` |

## Why not a static site generator

A generator would have been fine. But every one of them brings a config file,
a theme layer and an upgrade treadmill, and the thing I wanted to keep was the
property that any of this can be understood in one sitting.

> If the whole site fits in your head, you never have to look anything up to
> change it.

The design did not have to be redone either. The blog pages use the same
tokens as the front page — the same type scale, the same borders, the same
dark mode toggle — so a post looks like the rest of the site because it is
built from the same values.

## What is next

Posts about the things I actually work on: queues that have to stay correct,
services that talk to each other, and the small Go tools that come out of that
work. If you want them as they land, the [feed](/blog/feed.xml) is there.
