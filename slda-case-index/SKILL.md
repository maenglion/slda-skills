---
name: slda-case-index
description: SLDA 사건 인덱스·선례 검색. 모든 SLDA 분석(litigation·controversy·dispute·inquiry)이 끝날 때 고정 택소노미로 태그를 뽑아 case card(JSONL 1행)로 누적하고, 새 분석 착수 시 태그 겹침으로 유사 선례를 검색해 리포트에 "선례 참조" 블록을 넣는다. 같은 상대의 누적 건수로 1회성/다회성을 판정하고, 패턴은 선례 N건 이상일 때만 확정한다. "비슷한 케이스 있었나", "전에도 이랬지", "선례", "이런 패턴 몇 번째", "1회성인지 반복인지", "태그 뽑아", "케이스 인덱스", "레퍼런스 붙여" 가 나오면 반드시 사용. slda-core 선행 로드.
---

# SLDA Case Index v0.1

상속: `slda-core`. 원칙 한 줄: **누적 없는 controversy는 1회성 관찰이고, 선례가 붙어야 패턴이다.** 리포트의 "반복 패턴" 문장은 이 인덱스에서 검색된 선례 ID가 있을 때만 쓴다.

## 1. 택소노미 — 태그는 여기 있는 값만 쓴다

| 축 | 값 | 출처 모듈 |
|---|---|---|
| `mod` | litigation / controversy / dispute / inquiry | 라우팅 |
| `drift` | ISSUE / PREMISE / EVIDENCE / ATTRIBUTION / SCOPE / STRENGTH / CONTRADICTION / RETREAT_CONCLUSION / ADVANCE / REDUCTIO | core §5 상위 어휘 |
| `pc` | doc_vs_citer / self_standard_unapplied / evidence_downgrade / criterion_asymmetry / variable_exclusion / capacity_vs_act / check_vs_prejudge | 전제충돌 중요도 유형 |
| `sig` | INVOKE / CONTAMINATE / POSSESS / MISMATCH / DISQUALIFY / LAUNDER / DEMAND / SELF_ADVERSE | ai-invocation |
| `mode` | explore / assert | INVOKE_MODE |
| `obj` | object_collapse / object_substitution / channel_substitution | OBJECT · CHANNEL 선처리 |
| `state` | state_substitution / state_time_extension / state_counter | dispute §8 |
| `verify` | verify_refuse / verify_asymmetry / falsifiability_offered / self_error_withdrawn | E4 · dispute §7 |
| `frame` | frame_switch:RC-n / role_argument / intent_for_transmission | counterpart-ledger · dispute §5 |
| `inq` | probe_over_prove / check_vs_assert_same_day / scope_asymmetry / protection_paradox / no_narrowing_after_reply | inquiry D-01~05 |
| `retreat` | ground_retreat / conclusion_retreat / none | 후퇴 벡터 |
| `gate` | PASS / PARTIAL+ / PARTIAL / FAIL | controversy G0 |
| `layer` | 사건 고유 레이어 키워드 3개 이내(자유어, 소문자) | 검색 보조 |

태그는 **관찰된 것만**. "있을 법한" 태그 금지. 각 태그는 리포트 내 위치(섹션·ID)로 역추적 가능해야 한다.

## 2. Case card — `cases.jsonl` 1행

```json
{"case_id":"C-2026-09-07-JM-01","date":"2026-09-07","mod":"controversy","run":3,
 "counterpart":"정민하","self_role":"외주자","window":"통화 +01:53~+37:08; 카톡 15:47–17:09",
 "tags":{"drift":["ATTRIBUTION","EVIDENCE","ISSUE","CONTRADICTION"],
         "pc":["self_standard_unapplied"],"sig":["INVOKE","DEMAND","SELF_ADVERSE"],"mode":["assert","explore"],
         "obj":["object_collapse","object_substitution","channel_substitution"],
         "state":["state_substitution","state_time_extension","state_counter"],
         "verify":["verify_refuse","verify_asymmetry","falsifiability_offered","self_error_withdrawn"],
         "frame":["role_argument","intent_for_transmission","frame_switch:RC-1→RC-2"],
         "retreat":["ground_retreat"],"gate":["PASS","PARTIAL"],"layer":["db귀속","명세미제공","전달책임"]},
 "scores":{"self":74,"other":39},"verdict_mode":"rank",
 "outcome":"partial","open_items":["OI-01","OI-02","OI-03"],
 "sources":["S-v3","S-v4","S-JM1"],"ledger_ref":"ledger_정민하.yaml@2026-09-08",
 "anchor_quotes":[{"t":"15:47","q":"증거잖아?"},{"t":"16:06","q":"이거나 받아서"}]}
```

- 한 사건이 여러 run이면 최신 run만 활성(`superseded_by` 필드로 이전 행 연결). 삭제 금지.
- 상대 산출물(other_ai)이 있으면 `sources`에 넣되 `tags`는 우리 분석에서만 뽑는다. 상대 분석의 태그는 `other_tags`에 별도.

## 3. 검색 — 새 분석 착수 시 P0 직후

1. 새 사건의 **가태그**를 선처리 단계에서 뽑는다(확정 태그는 분석 후).
2. 유사도 = 태그 Jaccard(축별 가중: obj·state·verify·frame 1.5 / drift·pc 1.0 / sig·inq 1.0 / layer 0.5). 같은 상대면 ×1.5.
3. 상위 5건을 **선례 후보**로 리포트 §"선례 참조"에 표로: `case_id · 상대 · 겹친 태그 · 그때 결과 · 그때 미결 중 지금도 열린 것`.
4. 후보 중 **같은 상대 ≥ 2건**이면 `recurrence = 다회성`, 아니면 `1회성`. 이 값이 표지 메타에 들어간다.
5. 다른 상대와만 겹치면 "유형 선례"(패턴 아님, 구조 유사). 리포트 문장 고정형: "동일 구조 선례 n건(타 상대). 본 상대 기준 1회성."

## 4. 패턴 확정 규칙

- `utterance_patterns`(counterpart-ledger)의 항목은 **case ≥ 2 & 각 case에 증거 링크**일 때만 `pattern_confirmed`. 1건이면 `observed_once`.
- 리포트에서 "늘", "매번", "원래" 같은 빈도 부사는 `pattern_confirmed` 태그가 있을 때만 허용. 없으면 "이번에"로 고쳐 쓴다. (v3에서 맹난영 15:48 "원래 어디가서…"를 미검증 근거로 분류한 것과 같은 기준을 리포트 자체에도 적용)
- 선례 없이 쓴 패턴 문장은 채점 금지 규칙 위반으로 재작성.

## 5. 산출물

```
cases.jsonl                     전 사건 인덱스 (append-only)
taxonomy.md                     §1 표 (버전 관리, 값 추가는 결정 사항)
[리포트]§선례 참조               상위 5 후보 표 + recurrence 판정 + 열린 미결 승계
ledger_[상대].yaml → history    case_id 역링크
```

## 6. 다른 엔진에서 실행할 때

인덱스는 JSONL 텍스트라 어디서든 grep/Jaccard로 돈다. 택소노미 값이 엔진마다 달라지면 검색이 깨지므로 **taxonomy.md를 프롬프트에 그대로 붙인다.** 자유어는 `layer` 축에만.

## 7. 검증 체크리스트

- [ ] 모든 태그가 taxonomy 값 (layer 제외)
- [ ] 각 태그 → 리포트 위치 역추적 가능
- [ ] recurrence 판정이 표지 메타에 있음
- [ ] 빈도 부사 사용 문장마다 pattern_confirmed 근거 case_id
- [ ] 이전 run 행에 superseded_by 연결

## 앵커 (초기 인덱스 3행)

`C-2026-06-11-SONGDO-01`(controversy · 성륜수·김화랑 · pc doc_vs_citer/self_standard_unapplied · sig INVOKE/DISQUALIFY/DEMAND/MISMATCH · gate PASS/PARTIAL+/PARTIAL×2) / `C-2026-09-07-JM-01`(위 예시) / `C-2026-07-12-KODIT-INQ-01`(inquiry · 신보 · inq 5종 · drift ATTRIBUTION/SCOPE). 송도↔정민하 겹침: sig INVOKE·DEMAND, verify verify_refuse → 타 상대 유형 선례. 정민하 기준 다회성 판정은 case 2건째부터.
