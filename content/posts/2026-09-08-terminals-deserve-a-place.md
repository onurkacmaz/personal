---
title: Terminals deserve a place, not a tab
description: Why I built Mesa, a macOS app that puts shells on an infinite canvas instead of behind a row of tabs.
tags: [Electron, React, macOS, node-pty]
---

Every terminal I have used asks me to keep a map in my head. The tab bar says
`zsh`, `zsh`, `zsh`, `npm`, `zsh`. I know the fourth one is the dev server and
the second one is the database I keep forgetting to stop, but only because I
opened them in that order twenty minutes ago. Reordering a tab, or coming back
after lunch, and the map is gone.

So I built [Mesa](https://github.com/onurkacmaz/mesa): the same shells, on an
unbounded surface, each one in a **place** I chose.

![Mesa's canvas with three terminal panes](/img/mesa-1.jpg)

## Position is a thing you remember

The whole idea is that spatial memory is free and list memory is not. The
service lives bottom-left because that is where I put it. The migrations
terminal is up and to the right, near the database. I do not read labels to
find them, I look where they are.

`⌘` and scroll zooms, space and drag pans, `⌘0` snaps back to actual size and
`⇧⌘0` fits the whole workspace on screen. Zoomed out, the layout is the index:
you see what is running and where, in one glance, without cycling through
anything.

Browser panes sit on the same canvas. The thing I am building and the page I am
checking it on end up side by side instead of one behind the other, which is
most of why I stopped alt-tabbing to a browser window that was covering the
logs I needed.

## Coming back tomorrow

A canvas is only worth arranging if the arrangement survives quitting the app.
Mesa writes workflows, panes, tabs, the canvas view, every terminal's folder
and every browser's address into a `session.json`, and reads it back on launch.

One thing it deliberately does not pretend: a pty dies with the app. A restored
terminal is a **fresh shell standing in the folder it was left in**. The layout
comes back, the running processes do not. I would rather be honest about that
than fake a restore and have someone assume their server is still up.

The answers the app should only ask once — whether you have read the onboarding
cards, which editor `⌘E` opens folders in — live in a separate `flags.json`. A
session file that cannot be parsed is set aside rather than overwritten, and
because the two files are separate, rescuing a broken layout never costs you an
answer you already gave.

## Where the tests are

Electron with a React renderer, `node-pty` driving the real shells, xterm.js
rendering them. No framework beyond React.

The part I care about structurally is that three files are pure:

```
src/session.mjs   what a session file is, and when to trust it
src/flags.mjs     what the app remembers about you, not your work
src/editors.mjs   which installed apps are editors, and which you chose
```

No React, no filesystem. `electron/main.js` can see the disk and nothing else:
it hands over raw text and raw file names, and what any of it *means* is
decided in those three modules. That split is not architecture for its own
sake — it means the part of persistence that can ruin a launch is the part
that is directly unit-tested, and `npm test` runs on `node:test` with no build
step in front of it.

`⌘E` follows the same instinct. Mesa does not embed an editor; it hands the
selected terminal's current folder to whichever one you already have installed,
and remembers your answer. Right-click a title bar or press `⇧⌘E` to change it.

## What it is not

Worth saying plainly, because it is a short list:

- **macOS on Apple Silicon only.** There is Windows and Linux code in the
  repo, but nothing is built or tested there, and it should not be expected to
  work as-is.
- **The DMG is unsigned.** macOS will refuse it on first launch — right-click
  → Open → Open, once.
- **"Is something running?" needs zsh.** The check that makes `⌘W` ask before
  killing a live command leans on a zsh prompt hook. Under bash or fish, panes
  close without asking.
- **No agent orchestration, no worktree management, no task board.** Mesa
  opens shells and puts them somewhere. That is the whole of it.

The last one is the one I keep having to defend to myself. Every week there is
a feature that would fit on a canvas. But the reason I still use it is that it
does one thing, and a terminal that takes a second to launch is worth more to
me than one that can do everything.

It is MIT licensed and the `.dmg` is on
[Releases](https://github.com/onurkacmaz/mesa/releases). Issues and pull
requests are welcome.
