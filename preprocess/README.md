# 1단 전처리 지시문 — 원본 보관용

실제 발급은 homepage 의 `slda-issue-prompt` Edge Function 이 DB `slda_prompts` 테이블에서 한다(세션 토큰 게이팅, §14.4).
이 폴더는 그 테이블에 INSERT 할 **원본**이다. 리포에서 직접 서빙하지 않는다.

```sql
insert into slda_prompts(model, version, body, active) values ('lit','v1', $$<directive_litigation_v1.md 본문>$$, true);
insert into slda_prompts(model, version, body, active) values ('sns','v1', $$<directive_controversy_v1.md 본문>$$, true);
insert into slda_prompts(model, version, body, active) values ('spk','v1', $$<directive_speaker_v1.md 본문>$$, true);
```
