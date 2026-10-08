# SLDA Skills — Work Log

Append-only. Newest entry at the bottom. One line per decision or state change; link commits by short SHA.
Format: `YYYY-MM-DD · <area> · <what> · <sha|ref>`

## 2026-10-08

- repo · Created private repo `maenglion/slda-skills`; first push from local Windows clone (99 objects). CI `validate` passed on first run. · 3f4a669
- skills · Restored 11 skills from `.skill` packages (core, litigation, controversy, dispute, inquiry, ai-invocation, stylistic-drift, transcript, counterpart-ledger, case-index, report-html). · b515299 b39e343
- skills · Added `slda-probe` (R-05) from plan v0.1 + dispute display sample. · 28cef0f
- skills · Added `slda-regulation` — public track (`data_class=public`), no PII, no preprocessing gate. First target: letscheck-sinbo. · 3f4a669
- registry · `rubrics.json` = registry v1.1 (R-01..R-13) + MIRROR tolerance-balance v1.1.4 rule + module→rubric map. · 28cef0f
- routing · `dispatch.json` = total_king routing. Human (CBT, 20 cases) picks *which ruler*; rubric computes the value. `data_class` gate: public↔private modules cannot cross. · 6c01647 3f4a669
- api · Supabase Edge Function `supabase/functions/slda-skills/index.ts`: `GET /manifest`, `GET /rubrics`, `GET /skill/:name`, `GET /directive/:model`, `POST /dispatch` (returns order, verdict_mode, rubrics, data_class, optional bundle). Server-to-server key `x-slda-key`; reads GitHub raw via `GH_TOKEN`, 5-min cache. Not deployed yet. · 6c01647 28cef0f 3f4a669
- preprocess · Stage-1 user directives ×3 (litigation / controversy / speaker) stored under `preprocess/`, served only via `/directive/:model` (SPEC §14.4 — never hard-coded in front-end). · 28cef0f
- references · R-10 v1.1, REFERENT_STANDING v0.1, SNS scoring rules v0.2, C3 spec v0, stylistic plan v0.1, SPEC internal v1 (§0–§18) placed under each skill's `references/` or `specs/`. · 28cef0f
- local · `C:\slda` (ledger, CSVs, call audio) stays local-only, no remote (its README/.gitignore already say so). `C:\slda\skills` to be replaced by a junction to this repo. Local `slda_index.py`/`slda_timeline.py` are ahead of the repo copies (type hints, `alias`/`issue_thread_id` columns, `SEQ_UNRESOLVED`) — local is canonical for those scripts.
- security · A fine-grained GitHub PAT was pasted into chat during push troubleshooting; session proxy refused writes anyway. PAT must be revoked.
- decision · Backend: reuse Supabase project `nafpbwqdjxcftwfpadfr` (Seoul) if it still exists (Free tier pauses after 7 days idle — restore, not recreate). If deleted, new project `slda`, Seoul; only the 20-char ref in the URL changes.
- pending · Verify Supabase account email (maengnanyoung@gmail.com vs nanyoung@soulspectrum.kr). Set secrets `SLDA_API_KEY`, `GH_TOKEN` (Contents:read only), `GH_REPO`, `GH_REF`; `supabase functions deploy slda-skills --no-verify-jwt`. Then wire letscheck-sinbo server → `POST /dispatch {"mod":"regulation","data_class":"public"}`.
- pending · Second document batch not yet integrated: Pragmatics module spec v1.3 (candidate new module), Jinsun case analysis + evaluator anchor (evaluator-only — must be isolated under `eval/`, never in production prompts), OnPremise Workspace v0.2 + system prompt (Odysseus contract docs).
- process · WORKLOG is the hand-off point: every commit carries one WORKLOG line; a new session or engine reads README → WORKLOG tail → manifest before acting. · 70e837d
- backend · Confirmed via `maenglion/homepage`: Supabase project `nafpbwqdjxcftwfpadfr` already hosts 4 Edge Functions (slda-start-session, slda-issue-prompt, slda-normalize, purge) + 14 migrations. Reuse it; likely paused since 2026-07-29 → Restore in dashboard. Account email not in repo — try both.
- api · Removed `/directive/:model` — stage-1 directives are issued by `slda-issue-prompt` from DB table `slda_prompts` (homepage is public, so prompt bodies never live in a repo). `preprocess/` kept as INSERT source only. `slda-skills` function must be deployed from the homepage repo (`supabase/functions/slda-skills/` + `config.toml.snippet`).
- backend · Old project `nafpbwqdjxcftwfpadfr` found alive under account 2e.studio.2025@gmail.com (not deleted). New project `ysxkibzuhokrwmrawiar` (org sinbo, PRO) is redundant → delete. homepage-new-ref.zip NOT to be applied.
- api · Secret names lowercased (`slda_api_key`, `gh_token`, `gh_repo`, `gh_ref`) — dashboard Secrets UI rejects uppercase. Function reads lowercase first, uppercase fallback.
- api · Switched to built-in `Deno.serve` (dashboard editor rejects std/http import).
- api · Fixed syntax: trailing // comment swallowed the closing `};` of dispatch() return (TS1005). Verified with tsc.
- deploy · `slda-skills` Edge Function LIVE on `nafpbwqdjxcftwfpadfr` (project 'soulspectrum', account 2e.studio.2025@gmail.com). Deployed via dashboard editor; Verify-JWT OFF; secrets lowercase ×4. `GET /manifest` returns manifest v1.6.0 from private repo via gh_token. Gotchas logged: dashboard editor shows false 'Cannot find name Deno' lint; Via-Editor default name is 'smart-function' (must rename); PowerShell eats $ in keys → use hex-only api key.
- cleanup · Delete redundant project `ysxkibzuhokrwmrawiar` (org sinbo, PRO). Revoke the PAT pasted in chat. Do NOT apply homepage-new-ref.zip.
- next · Verify `POST /dispatch {mod:regulation,data_class:public}`; then wire letscheck-sinbo server → this endpoint. Sync C:\slda-skills with index.ts/README/WORKLOG from this session.
- api · Added `API.md` — caller spec for KODIT-analysis public-site (Next.js API Route). /dispatch returns routing + bundle, NOT analysis; LLM call is the caller's job. Branch plan on their side: `codex/assembly-slda-api` off `codex/assembly-audit-preview`.
- kodit · Crosscheck prompt `eval/crosscheck_kodit_prompt.md` for Grok/DeepSeek: map 의원실 3 topics → public doc/article/stat items; 3 tables (mapping · undisclosed→legal basis · regulation>law candidates). Merge rule CONFIRMED_2/CANDIDATE/CONFLICT. Finding: slda-regulation must move observe→determine with finding(꼭지) output + 상위법 대조 engine (law_version × regulation_version) — v0.2 pending.
- api · Added `POST /run`: dispatch → Anthropic Messages → insert `slda_runs`. LLM key lives only in Supabase secret `anthropic_api_key`; fronts carry `slda_api_key` only (decision: multi-front reuse). public track only. Migration `20261008000000_slda_runs.sql` (RLS on, service-role only). tsc clean.
- llm · Anthropic API key issued (30-day expiry → **rotate ~2026-11-07**). Model decision: Opus-tier for regulation (precision over speed) via secret `slda_llm_model`. API billing is separate from claude.ai plan — console credits required. Expired key symptom: `/run` → 502 {error:llm}.
