# slda-skills Edge Function

| 경로 | 역할 |
|---|---|
| GET /manifest · /rubrics · /skill/:name | 리포 파일 프록시 |
| POST /dispatch | total_king 라우팅 + 번들 (LLM 호출은 호출자) |
| POST /run | **dispatch → LLM → slda_runs 저장** 까지 서버 안에서. public 트랙만. LLM 키는 Supabase secret 한 곳 |

secrets (소문자): `slda_api_key` · `gh_token` · `gh_repo` · `gh_ref` · `anthropic_api_key` · `slda_llm_model`(선택, 기본 claude-sonnet-4-5)
`SUPABASE_URL`·`SUPABASE_SERVICE_ROLE_KEY`는 자동 주입. 테이블은 `migrations/20261008000000_slda_runs.sql`.

/run 요청:
```json
{ "mod":"regulation", "data_class":"public", "input":"<규정 버전들 원문>", "label":"신보 책임경영약정 2018-2026", "caller":"letscheck-sinbo" }
```
응답: `run_id` + 라우팅 메타 + `output`(LLM 산출). `return_output:false`면 저장만.
프론트(어느 사이트든)는 `x-slda-key` 하나만 들고 `/run` 호출 → `run_id`로 자기 서버에서 조회.
