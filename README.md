# SLDA Skills — Semantic Logic Drift Analysis

Soul Spectrum Inc. · 설계 맹난영 · 엔진 비종속(Claude / GPT / Gemini / Manus 공용 markdown)

`manifest.json`이 스킬 목록·로딩 순서·해시를 들고 있다. 다른 사이트/엔진은 raw URL로 SKILL.md를 그대로 가져가면 된다.

| 스킬 | 계층 | 역할 |
|---|---|---|
| slda-core | core | 공통 규약: 금지선·척도·선처리 필드·drift 어휘·verdict_mode·상태표 |
| slda-litigation | module | 소송 서면 시계열 — 프레임 히트맵·표현강도·귀속·PC·편 분리 |
| slda-inquiry | module | 증거신청·정보조회 확장 — 결합 단위·침해 강도축·D-01~05 |
| slda-controversy | module | SNS 다자 논쟁 — 게이트·E1–E6·후퇴 벡터·PC |
| slda-dispute | module | 1:1 계약·외주 분쟁 — 청구단위 원장·객체 계층·의도/전달·적대검증 |
| slda-probe | overlay | R-05 프로브 검출 — answer/deflect/silence · EVASION_CONFIRMED · KNOWN_DENIAL |
| slda-ai-invocation | overlay | §C3 AI 원용 7신호·INVOKE_MODE |
| slda-stylistic-drift | overlay | §6.5 어투 지표 6종 (observe 고정) |
| slda-transcript | preprocess | 통화 STT 전처리 — 호칭 앵커·교정 대조표·귀속 등급 |
| slda-counterpart-ledger | context | 쌍(dyad) 누적 원장 — S0 기준선 |
| slda-case-index | context | 사건 태그 인덱스·선례 검색·1회성/다회성 |
| slda-report-html | render | 고정 CSS 스캐폴드 HTML/PDF |

루브릭 레지스트리 R-01~R-13 = `rubrics.json` (레지스트리 v1.1). 1단 전처리 지시문 3종 = `preprocess/` (Edge Function 발급 전용). 내부 SPEC = `specs/`.

로딩 순서: core → case-index → counterpart-ledger → (transcript) → 본체 모듈 1개 → 오버레이 → report-html

## 사용
```
https://raw.githubusercontent.com/maenglion/slda-skills/main/manifest.json
https://raw.githubusercontent.com/maenglion/slda-skills/main/slda-litigation/SKILL.md
```

## 서버 API (다른 사이트 서버 → 여기)
스킬은 2·3단 자산이라 프론트에 내려가지 않는다. Supabase Edge Function `slda-skills`가 서버 간 키(`x-slda-key`)로만 응답한다.

```
GET  /slda-skills/manifest
GET  /slda-skills/skill/slda-litigation
POST /slda-skills/dispatch   {"mod":"litigation","sources":["소장","준비서면","제출명령"],"output":"html","bundle":true}
     → {"order":[...], "verdict_mode":"determine", "bundle":"<SKILL.md 연결본>"}
```
`/dispatch`가 total_king: 메타로 어떤 자(스킬)를 댈지만 고른다. 채점 값은 건드리지 않는다. 규칙은 `dispatch.json`.

배포:
```
supabase secrets set SLDA_API_KEY=... GH_TOKEN=... GH_REPO=maenglion/slda-skills GH_REF=main
supabase functions deploy slda-skills --no-verify-jwt
```
