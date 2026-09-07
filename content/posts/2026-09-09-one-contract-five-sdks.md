---
title: One contract, five SDKs
description: What I learned building Togul, a feature flag platform, mostly on my own — and why the boring parts turned out to be the product.
tags: [Go, Fiber, OpenAPI, Kubernetes]
---

*Bu yazının [Türkçesi](/blog/tek-kontrat-bes-sdk/) de var.*

[Togul](https://togul.io) is a feature flag and remote config platform I build
on the side, as an alternative to LaunchDarkly and Unleash. All of it: the API,
the dashboard, the SDKs, the infrastructure. That is either a bad idea or a
very good way to learn where a product actually spends its complexity, and
after a while I stopped thinking it was the first one.

![The Togul dashboard](/img/togul-2.jpg)

The interesting thing is where the work went. A flag service sounds like a
key-value store with a nice UI. Almost none of the effort was there.

## The evaluation engine is pure, and that is the point

The API is Go on Fiber, and the piece that decides what a flag evaluates to
for a given context is a **pure function**. No database handle, no clock, no
HTTP request. Rules and a context go in, a value comes out.

That was not aesthetics. A flag platform has one job it cannot get wrong: two
things asking the same question about the same flag must get the same answer.
The dashboard previews an evaluation, the API serves it, and every SDK has a
local copy of the rules. If any of those disagree, someone ships a bug they
cannot reproduce, and they will blame my service before they blame their code —
correctly.

Making the engine pure means it can be tested exhaustively without standing
anything up, and it can be handed to any of the callers unchanged.

## Flipping a flag should not need a redeploy

The other thing a flag service cannot do is be slow to take effect. If turning
something off takes a deploy, or even a cache TTL, nobody trusts it in the one
moment it matters — which is the moment production is on fire.

SDKs hold an open SSE connection back to the API. Flipping a flag fans out a
cache invalidation to everyone connected, and the change reaches running
processes without a restart, a deploy or a poll loop. Streaming also means the
common path costs nothing: an evaluation is a local lookup, not a network call
on every request.

## Five SDKs, one OpenAPI contract

Togul ships official SDKs for Go, JavaScript/Next.js, PHP, Laravel and Ruby.
Five languages is enough that writing each one by hand, against its own idea of
what the API looks like, would guarantee that they drift apart.

So the contract came first. One OpenAPI document is the source of truth, and
every SDK is built against it. Adding a field is a change in one place that
five SDKs inherit rather than five changes I have to remember to make. Half the
value of Togul as a product is that the PHP one and the Go one behave the same,
and the only reason they do is that neither of them is the definition.

The same instinct produced the pieces around the edges: a **Terraform
provider**, so flags can be managed as code alongside everything else in a
repo, and a **CLI** for scripting and CI/CD. Nobody picks a flag service for
its Terraform provider. But the teams I want using this are the ones who would
rather not click a dashboard to change production, and for them it is the
difference between a tool and a toy.

![The Togul landing page](/img/togul-1.jpg)

## The parts nobody puts on a landing page

Multi-tenancy, audit logging, billing through Stripe and LemonSqueezy. It runs
on Kubernetes with PostgreSQL, Redis and MongoDB, and the infrastructure lives
in its own repository with its own pipeline, so a change to the cluster is a
reviewed change like any other.

That list is where most of the calendar time went, and none of it is a feature
anybody asks for. It is also the difference between something I demo and
something I would let a company depend on. Audit logging is not exciting until
the question is *who turned that off at 2am*, and multi-tenancy is not exciting
until getting it wrong means one customer sees another's flags.

## What I would tell myself at the start

Build the thing that has to be correct as a pure function, and build the
contract before the clients. Both cost more on day one and both stop being a
decision after that — which is the whole reason the side project survived
having a day job in front of it.

Togul is at [togul.io](https://togul.io).
