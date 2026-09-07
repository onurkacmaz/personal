// npm run new -- "The title of the post"
//
// Writes a dated file into content/posts/ with the front matter filled in, so
// starting a post is one command and one paragraph.

import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { slugify } from './markdown.mjs';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('usage: npm run new -- "The title of the post"');
  process.exit(1);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const date = new Date().toISOString().slice(0, 10);
const slug = slugify(title);
const path = join(ROOT, 'content', 'posts', `${date}-${slug}.md`);

if (existsSync(path)) {
  console.error(`already exists: ${path}`);
  process.exit(1);
}

await mkdir(dirname(path), { recursive: true });
await writeFile(path, `---
title: ${title}
description:
tags: []
draft: true
---

`);

console.log(`${path}\n  drop "draft: true" when it is ready, then npm run deploy`);
