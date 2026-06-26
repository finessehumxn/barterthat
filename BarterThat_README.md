# BarterThat

> **Trade without money. Powered by AI.**

[![Production](https://img.shields.io/badge/status-production-brightgreen)](https://barterthat.app)
[![Deployments](https://img.shields.io/badge/deployments-54-blue)](https://barterthat.app)
[![Platform](https://img.shields.io/badge/platform-web%20%7C%20android%20%7C%20ios-lightgrey)](https://barterthat.app)
[![AI](https://img.shields.io/badge/AI-Claude%20API-orange)](https://anthropic.com)

Live → [barterthat.app](https://barterthat.app)

---

## The Problem

The gig economy extracts value. Cash is a bottleneck. Skills sit idle while needs go unmet — not because the value isn't there, but because the money isn't.

BarterThat is the infrastructure for a parallel economy where what you *have* is the currency.

---

## What's Built

A full-scale, production-deployed barter marketplace. Not a prototype.

- **AI matchmaking** — Claude analyzes offer/need profiles and surfaces ranked trade suggestions with reasoning. The model considers skill overlap, value equivalency, geography, and trade history. It doesn't just match keywords — it reads intent.
- **Real-time communication** — live chat with voice notes, photos, and video calls. Built on Supabase Realtime. No polling.
- **Crowdfunding layer** — token backing, interest pledges, and licensed-portal integration so communities can fund shared resources through barter credit.
- **Cross-language trading** — AI translation removes language as a barrier to exchange.
- **Verified accounts** — identity verification before any trade completes.
- **Payments** — Stripe for premium tiers. Most features are free.
- **One codebase, three platforms** — React web + Capacitor Android + Capacitor iOS. 54 production deployments.

---

## Architecture

```
barterthat/
├── src/
│   ├── components/        # UI — chat, listings, profiles, crowdfunding
│   ├── pages/             # Route views
│   └── hooks/             # Supabase subscriptions, auth, realtime
├── api/
│   └── match.js           # Claude AI matchmaker — Vercel serverless
├── supabase/
│   ├── schema.sql         # Full DB schema
│   └── functions/         # Edge functions for notifications, matching
├── android/               # Capacitor Android project (versionCode 2 / v1.1)
├── ios/                   # Capacitor iOS project
└── .github/workflows/     # CI — Node 22, Android release builds
```

---

## The AI Layer

`api/match.js` is a Vercel serverless function that sends structured offer/need profiles to Claude and receives ranked trade suggestions with confidence scores and human-readable reasoning.

What makes it work beyond keyword matching:
- Reads *what someone actually needs* from natural language descriptions
- Weights by value equivalency, not just category
- Surfaces non-obvious trades ("you need a logo, she needs bookkeeping — her 3 hours equals your 2")
- Degrades gracefully — falls back to category matching if the AI call fails

---

## Stack

```
Frontend     React · Vite · Tailwind CSS
Mobile       Capacitor 8 (Android + iOS — single codebase)
Backend      Supabase · PostgreSQL · Edge Functions · Realtime
AI           Anthropic Claude API
Payments     Stripe
Deployment   Vercel (web) · Codemagic (cloud-Mac iOS builds)
CI/CD        GitHub Actions · Node 22
```

---

## Status

| Target | Status |
|--------|--------|
| Web app | ✅ Live at barterthat.app |
| Android | ✅ Built · submitted to Google Play |
| iOS | ✅ Configured via Codemagic cloud-Mac |
| Production deploys | ✅ 54 and counting |
| App Store | 🔄 Review in progress |

---

## Why This Exists

Built as part of [Millennials Creatives LLC](https://millennialscreatives.com) — a woman-owned AI product studio. BarterThat is one of three production AI applications alongside [MedCompanionAI](https://medcompanionai.com) (healthcare) and [Finesse Our Minds](https://finesseourminds.org) (mental health).

The through-line: AI that creates access for people the current system underserves.

---

*Built by [L. Finesse Humxn](https://github.com/finessehumxn)*
