---
title: Togul speaks OpenFeature
description: How Togul got native OpenFeature providers in every SDK, an OFREP endpoint on the API, and a listing on openfeature.dev, in about two and a half weeks.
tags: [OpenFeature, OFREP, Go, TypeScript, Python]
---

[OpenFeature](https://openfeature.dev) is the CNCF's vendor-neutral standard
for feature flags. Application code talks to the OpenFeature API, and a
*provider* underneath decides where the answer comes from. Swap the provider
and you swap LaunchDarkly for Unleash or Flagsmith without touching a single
`if` in the codebase.

For a small flag service that is the whole argument. Nobody wants to rewrite
their evaluation calls to try a product they found last week. If
[Togul](https://togul.io) was going to be a serious option, it had to plug into
the standard people already write against.

As of today it does, and it is listed in the
[OpenFeature ecosystem](https://openfeature.dev/ecosystem) under both
Providers and OFREP.

## Starting from the gap

On 23 September I compared Togul against the datasets behind openfeature.dev:
50 vendors with providers, 9 with OFREP support. Togul was in neither list.
There were two ways in, and they solve different problems, so I did both.

## Track one: a provider in every SDK

Each official SDK now ships an OpenFeature provider:

| SDK | Provider | Release |
| --- | --- | --- |
| JavaScript | `@togul/js/openfeature` (server, optional peer dependency) | npm 0.6.0 |
| Go | `github.com/togulapp/togul-go/openfeature` (separate module) | v0.1.0 |
| Python | `togul[openfeature]` | PyPI 0.2.0 |
| Ruby | `togul/open_feature` | rubygems 3.1.0 |
| PHP | `TogulProvider`, registered globally by the Laravel package | |

PHP went first and became the reference implementation; Laravel shipped the
same day.

The rule I held to: **every Togul SDK keeps a single `evaluate()` call.** The
provider is a thin adapter that maps that one call onto OpenFeature's typed
resolvers, translates reasons and errors, and turns `user_id` into the
targeting key. I did not add `getBooleanValue`-style helpers to the core SDKs.
OpenFeature already defines that surface, and a second, slightly different
copy of it in each SDK would only be something to keep in sync.

Two of the releases fixed more than they added. The Go module had to move to a
`/v3` import path (v3.1.0): the old v2 and v3 tags were unusable without the
`/vN` suffix, which Go modules require past v1. And the Ruby work turned up a
bug where the stream client was never loaded at all.

## Track two: OFREP on the API

A native provider only helps in languages Togul has an SDK for. The
[OpenFeature Remote Evaluation Protocol](https://togul.io/docs/en/api/ofrep)
covers the rest: it is a standard HTTP API that generic OFREP providers speak,
so a Java or .NET service can evaluate Togul flags with no Togul code
installed.

The API now serves single evaluation, bulk evaluation with an ETag so clients
only download what changed, and an SSE stream for change notifications, the
same streaming model the SDKs already use.

## Testing against code I did not write

Unit tests against my own server prove that my server agrees with me. The
interesting question is whether it agrees with providers other people wrote.
So the end-to-end suite runs against the *generic* OFREP providers: JS server,
JS web with bulk evaluation, Go and Python, six cases each.

Every case asserts both the value and the reason. Cases where a flag should
match use sentinel defaults, values the server never returns, so a passing
assertion can only mean the answer really came from Togul and not from a
fallback that happened to look right.

It found two bugs before anyone else did.

**The optional field that wasn't.** The spec marks `variant` as optional, and
I had left it out. The generic `openfeature-provider-ofrep` 0.3.0 reads it
directly, so every *successful* evaluation fell into `ERROR` / `GENERAL` and
handed back the caller's default. The fix was to always send a variant:
`default`, or `rule:<uuid>` for the rule that matched. I already had that
information. Sending an optional field cost nothing; leaving it out broke a
whole language.

**Same flag, different answer.** For a disabled flag, my native providers
return the *caller's* default. OFREP was sending Togul's own flag default
instead. Same app, same flag: the generic JS and Python providers returned
`true`, the generic Go provider returned `false`. That is precisely the
disagreement a flag service exists to prevent. OFREP has a signal for
"use the default in code": leave `value` out of the response. Now the API does
that for disabled flags. The Go provider had been handling it correctly all
along, so the bug was mine, not upstream's.

After both fixes: 24 of 24 green.

## Shipped alongside

The same release train carried flag prerequisites, an approval workflow with
change requests, and scheduled flag changes (API v1.7.0). The CLI
and the Terraform provider both reached v0.2.0 with
prerequisites support, and the Terraform release is on the Terraform Registry.

## Getting listed

On 27 September everything went out together: npm, PyPI, rubygems, the Go
tags, GitHub releases and the production deploy. The same day I opened two
pull requests to the openfeature.dev repository:

- [#1556](https://github.com/open-feature/openfeature.dev/pull/1556) adds
  Togul to the Providers section for JS, Go, Python, Ruby and PHP. The site has
  no "Laravel" technology type, so Laravel is mentioned in the PHP entry.
- [#1557](https://github.com/open-feature/openfeature.dev/pull/1557) adds
  Togul to the OFREP section.

Both were merged, and the listing went live on 9 October.

## What I would keep

From gap analysis to listing took about two and a half weeks. Most of that
went into the boring decision at the start: keep the SDKs small, make the
OpenFeature layer an adapter, and test against other people's clients instead
of my own. A standard is only worth adopting if the parts you did not write
agree with the parts you did, and the only way to know is to ask them.

Togul is at [togul.io](https://togul.io), and the OFREP reference is in the
[docs](https://togul.io/docs/en/api/ofrep).
