# slda-skills API — 호출 명세 (서버 간 전용)

대상: `maenglion/KODIT-analysis` `apps/public-site` (Next.js 15 API Route) 등 **서버 코드**. 브라우저에서 직접 호출 금지 — 키가 노출된다.

## 엔드포인트

```
BASE = https://nafpbwqdjxcftwfpadfr.supabase.co/functions/v1/slda-skills
헤더  x-slda-key: <SLDA_API_KEY>          (서버 환경변수. 틀리면 401 {"error":"unauthorized"})
```

| 메서드 | 경로 | 반환 |
|---|---|---|
| GET | `/manifest` | `manifest.json` — 스킬 13개 목록·해시·tier |
| GET | `/rubrics` | `rubrics.json` — R-01~R-13 · 모듈별 루브릭 맵 |
| GET | `/skill/:name` | 해당 `SKILL.md` 원문 (text/markdown) |
| POST | `/dispatch` | **라우팅 결과 + (옵션) 번들**. LLM은 호출자가 |
| POST | `/run` | **dispatch → LLM → `slda_runs` 저장을 서버 안에서**. public 트랙 전용. 여러 프론트가 쓸 때 이쪽 — 프론트는 `x-slda-key`만 들면 됨 |

## `/dispatch` — 무엇을 반환하나

**SLDA 분석 결과가 아니다. "어떤 스킬을 어떤 순서로 LLM에 넣을지"와 그 스킬 본문(번들)을 돌려준다.** 분석 자체(LLM 호출)는 호출 측이 한다. 이것이 total_king 역할 — 자를 고르지, 값을 내지 않는다.

요청:
```json
{ "mod": "regulation", "data_class": "public", "output": "html", "bundle": true }
```
| 필드 | 값 | 비고 |
|---|---|---|
| `mod` | `regulation` \| `litigation` \| `controversy` \| `dispute` \| `inquiry` | 필수 |
| `data_class` | `public` \| (생략=private) | `regulation`은 반드시 `public`. public인데 다른 mod면 500 |
| `output` | `html` \| `pdf` \| 생략 | html/pdf면 `slda-report-html` 추가 |
| `bundle` | `true` | **true면 `order`의 SKILL.md를 `---`로 이어 붙인 전문을 `bundle`에 담아 줌** |
| `sources` `signals` `flags` `pair_id` | 배열/문자열 | private 트랙용. public에선 무시해도 됨 |

응답 (실측, 2026-10-08):
```json
{
  "order": ["slda-core","slda-regulation","slda-report-html"],
  "verdict_mode": "observe",
  "data_class": "public",
  "preprocess_directive": null,
  "rubrics": ["R-01","R-02","R-08"],
  "dispatch_version": "1.6.0",
  "bundle": "---\nname: slda-core\n...(세 스킬 전문)..."
}
```

## 권장: `/run` (여러 프론트 공용)

```json
POST /run { "mod":"regulation", "data_class":"public", "input":"<규정 버전 원문들>", "label":"...", "caller":"letscheck-sinbo" }
→ { "run_id":"uuid", "order":[...], "rubrics":[...], "model":"claude-sonnet-4-5", "output":"<산출>", "usage":{...}, "ms":... }
```
LLM 키(`anthropic_api_key`)는 Supabase secret 한 곳. Netlify에는 `SLDA_API_KEY`만. 결과는 `slda_runs` 테이블 — 프론트는 자기 서버(service-role)로 조회.
한계: Edge Function 실행 상한(~150s). 입력이 크면 `max_tokens` 낮추거나 버전을 나눠 여러 run.

## 대안: `/dispatch` + 직접 LLM 호출 (프론트 1곳일 때)

```
1. POST /dispatch {mod:"regulation", data_class:"public", output:"html", bundle:true}
2. system prompt = bundle                       ← 규약·금지선·산출 규격이 전부 여기 있음
   user prompt   = 분석 대상 (규정 버전 N개, 파일명 [기관]_[규정명]_[시행일]_[차수], sha256·출처URL 포함)
3. LLM 호출 (엔진 무관 — Claude/GPT/Gemini. 번들은 엔진 비종속 markdown)
4. 산출물 = slda-regulation §3 파일들 (versions.csv, change_ledger.csv, disclosure_gap.csv, ref_integrity.csv, regulation_report.html)
5. 리포트 표지에 verdict_mode=observe · rubrics · dispatch_version 명기
```

**LLM 호출은 새로 추가하는 작업이 맞다.** public 사이트에 LLM 호출이 없었으므로, API Route 하나(`/api/slda/regulation`)에 (1)dispatch → (2)LLM → (3)산출 저장을 넣는다. LLM 키는 그 Route의 환경변수.

## 캐시·비용
- 번들은 리포 커밋이 바뀔 때만 변한다. `manifest.sha256`을 키로 캐시하면 dispatch 호출은 배포당 1회면 된다.
- Edge Function 자체는 GitHub raw 5분 캐시. 월 50만 호출 무료 구간.

## 트랙 분리 (중요)
- `data_class=public` 트랙은 전처리 지시문·마스킹 게이트·사건 인덱스·원장을 **전부 건너뛴다**. 개인정보 없는 공개 문서 전용.
- 실명이 섞인 입력은 이 트랙에 넣지 않는다 — 함수가 막지 않으니 호출 측 책임. `slda-regulation` §5 체크리스트(식별자 regex 0건)를 Route에서 먼저 돌릴 것.
