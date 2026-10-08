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
| slda-ai-invocation | overlay | §C3 AI 원용 7신호·INVOKE_MODE |
| slda-stylistic-drift | overlay | §6.5 어투 지표 6종 (observe 고정) |
| slda-transcript | preprocess | 통화 STT 전처리 — 호칭 앵커·교정 대조표·귀속 등급 |
| slda-counterpart-ledger | context | 쌍(dyad) 누적 원장 — S0 기준선 |
| slda-case-index | context | 사건 태그 인덱스·선례 검색·1회성/다회성 |
| slda-report-html | render | 고정 CSS 스캐폴드 HTML/PDF |

로딩 순서: core → case-index → counterpart-ledger → (transcript) → 본체 모듈 1개 → 오버레이 → report-html

## 사용
```
https://raw.githubusercontent.com/maenglion/slda-skills/main/manifest.json
https://raw.githubusercontent.com/maenglion/slda-skills/main/slda-litigation/SKILL.md
```
