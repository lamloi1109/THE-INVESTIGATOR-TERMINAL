# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This directory (`StrategicAnalyst/`) is the **planning + coordination hub** for **"THE INVESTIGATOR TERMINAL"** — PhuocLoi's AI Engineer portfolio site.

Per **D-002** (see `docs/DECISIONS.md`), application code lives in `../app/` at the repo root (monorepo layout). `StrategicAnalyst/` contains PRDs, task breakdowns with state machine, decision log, agent onboarding protocol, and session reports.

## Before you start — Agent Onboarding Protocol

Any agent (Antigravity, Claude Code, or PhuocLoi) opening a new session MUST read `docs/AGENT_ONBOARDING.md` first. It covers: context loading order, task claim protocol, git branch convention, commit rules, session report format, and project-specific hard rules (no React, no vector DB, no visual gimmicks).

The 5 files to load (in order) at every session start:
1. `StrategicAnalyst/CLAUDE.md` (this file)
2. `StrategicAnalyst/docs/PRD.md`
3. `StrategicAnalyst/docs/TASKS.md`
4. `StrategicAnalyst/docs/DECISIONS.md` (last 5 entries)
5. `StrategicAnalyst/docs/reports/{your-agent}.md`

## The Product — Core Context

- **Target user**: PhuocLoi, an AI Engineer demonstrating real-world capability (RAG, structured outputs, system design) to hiring managers — not a "chatbot gimmick".
- **Hard constraint**: total monthly cost MUST be **$0**. Every architectural trade-off must respect this.
- **Primary failure mode**: portfolio dismissed as gimmick. The static fallback must carry the full CV + case studies with JS disabled.

## Success Criteria (measurable)

| ID | Metric | Threshold |
|----|--------|-----------|
| S1 | Lighthouse Performance (static pages) | ≥ 95 |
| S2 | TTFB (SSG) | < 100ms |
| S3 | Terminal P95 latency | < 3s |
| S4 | Serverless bundle (uncompressed) | < 50MB |
| S5 | Monthly cost | $0 |
| S6 | Static-only coverage of CV + case studies | 100% |
| S7 | 429/504 errors under < 50 visitors/day | 0 |

## Non-Goals (explicit "do not build")

No auth, no paid DBs, no admin CMS UI, **no React** (use Preact — 3KB vs 40KB), no 3D/particles, no multi-language UI, no self-hosted vector DB (use Gemini 1M-token in-context RAG instead).

## Tech Stack + Rationale

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Astro 5.x (hybrid output) | Islands Architecture, zero-JS default, SSG + SSR hybrid |
| Islands | Preact | React-compatible API, ~13× lighter |
| AI SDK | Vercel AI SDK | `createUIMessageStream`, Data Stream Protocol, Generative UI |
| Model | Gemini 1.5 Flash | 1M-token context (in-context RAG), free tier 250 req/day |
| CMS | Google Sheets API v4 | Zero-cost, editable without a custom admin UI |
| Host | Vercel Hobby + Fluid Compute | Free edge CDN + serverless, low cold-start |
| Styling | Tailwind (or UnoCSS) | Utility-first, purges well |

## Task Assignment Convention

Tasks follow the format `T-0XX` with an `Assigned:` tag. Respect it:

- **`ANTIGRAVITY`** — implemented by the Antigravity agent
- **`CLAUDE_CODE`** — implemented by Claude Code (this instance)
- **`MANUAL`** — PhuocLoi does it by hand (e.g. creating Google Sheets, deploying to Vercel)

If a user asks Claude to perform a `MANUAL` task, surface it and ask whether they want step-by-step guidance or will do it themselves — don't silently take it on.

## Phase Ordering & Critical Path

```
Phase 0 (Scaffold): T-001 → T-002
Phase 1 (Data):     T-010 → T-011
Phase 2 (SSG):      T-011 → {T-020, T-021, T-022}   [parallel]
Phase 3 (Terminal): T-011 → T-030 → T-031 → T-032
Phase 4 (Harden):   T-031 → T-040 | T-030 → T-041 | T-02x → T-042, T-043
Phase 5 (Verify):   all → T-050
```

**Critical path**: `T-001 → T-010 → T-011 → T-031 → T-032 → T-040 → T-050`

T-001 (code scaffold) and T-010 (Sheets schema) can start in parallel.

## Load-Bearing Risks (read before proposing changes)

1. **Gemini 250 req/day ceiling** — client-side limit 20 req/min/IP, graceful static fallback when quota exhausted. Do NOT propose features that multiply requests per session (e.g. autocomplete-as-you-type).
2. **Vercel Hobby cold start** — stream chunks immediately, single-turn inference only. Do NOT propose multi-step agent loops.
3. **50MB bundle cap** — NEVER add React to deps. Audit every new package with `du -sh node_modules/<pkg>`. The 50MB limit is tighter than Vercel's 250MB ceiling, chosen as a quality bar.
4. **"Gimmick" perception** — static homepage comes FIRST; terminal is a bonus feature. Do NOT propose making the terminal the entry point.
5. **Sheets API downtime** — SWR cache (5min fresh / 1hr stale) plus a committed JSON snapshot fallback at build time.

## Documentation Conventions

- Task specs keep the canonical block format: `Task ID`, `Title`, `Status`, `Owner`, `Branch`, `Assigned`, `Files`, `Acceptance`, `Verification`, `Depends on`, `Complexity` (S/M/L), `Updated`. See `docs/TASKS.md` for the Status state machine and claim protocol.
- New tasks get IDs in the phase's hundred range (next Phase 2 task → `T-023`).
- Don't downgrade complexity just to fit a sprint — keep it honest.
- When a risk materialises, append the incident + new mitigation to `docs/RISKS.md` (Incident Log section); don't overwrite history.
- Code paths in task `Files` field use the `app/` prefix (monorepo layout per D-002). Planning files stay under `StrategicAnalyst/`.
