---
title: Every front matter field there is
description: A one line summary, used on the index page and in link previews.
date: 2026-01-01
slug: every-front-matter-field
tags: [Go, PostgreSQL]
draft: true
---

Files with `draft: true` are skipped by the build, so this one never reaches
`public/blog/`. Copy it when starting a post, drop the fields you do not need
and delete the draft flag when it is ready.

Every field is optional except the date, and even that can come from the file
name — `content/posts/2026-09-07-a-post.md` is dated `2026-09-07`. The slug
comes from the file name too unless `slug:` overrides it, so a published URL
never moves because a title was reworded.
