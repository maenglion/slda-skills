---
name: slda-counterpart-ledger
description: SLDA 상대별 누적 원장(counterpart ledger). 같은 상대와 반복되는 분쟁·협상에서 "싸움 이전 맥락"(관계 계약 다중성·확인된 R&R 합의·반복 발화 형식·트리거·회복 신호·미결·합의된 금지선·정산 규칙)을 상대 1인당 1파일로 누적하고, 새 분쟁 분석 시 slda-dispute/controversy의 기준선(S0)으로 먼저 주입한다. "정민하 원장", "그 사람이랑 또 싸웠어", "지난번에 합의했던 거", "이전 맥락 넣고 분석", "상대 프로파일", "누적 저장", "관계 잘 유지하려면", "재발 방지" 류가 나오면 반드시 사용. slda-core 선행 로드. 사람을 채점하지 않는다 — 발화·합의·이력만 저장한다.
---

# SLDA Counterpart Ledger v0.1

상속: `slda-core`. verdict_mode = `observe`. **목적 필드 고정: "다음 분쟁의 기준선 제공 + 재발 방지 합의점 유지".** 원장은 상대를 이기기 위한 파일이 아니라 두 사람이 같은 전제에서 시작하게 하는 파일이다.

## 0. 왜 법률 문서와 다른가

서면 분쟁은 정해진 문서만 비교하면 된다. 인간 간 논쟁은 싸움 이전 상황이 들어온다 — 앞선 합의, 앞선 싸움에서 상처가 된 발화, 관계의 층위(연인·발주–외주·생활 공동체). 이 맥락 없이 카톡 73건만 채점하면 run 1·2처럼 오분류한다(v3 결함 #4·#5). 원장은 그 맥락을 **한 번 확정해 두고 재사용**하는 장치다.

## 1. 대칭 원칙 (필수)

- **자기 자신 항목도 같은 스키마로 저장한다.** 상대만 기록한 원장은 판정문이지 원장이 아니다(정민하 문서의 결함: 상대 기록 부재).
- 각 행은 `subject = self | other | both`.
- 상대가 만든 분석물(예: 상대 AI 산출)은 `source = other_ai`로 **별도 provenance**. 자기 분석과 합치지 않는다. 일치 feature만 `CONFIRMED_BOTH`로 승격.

## 2. 저장 금지 (core §1 상속 + 원장 고유)

- 진단명·복약·정신과 이력·신체 정보 **자체**를 항목으로 저장하지 않는다. 저장 가능한 것은 "상태 치환 **발화**가 있었다"는 형식 관찰뿐(발화 원문·시각·subject).
- 성격·의도·동기 서술 금지. "~하는 성향" 금지. `패턴` 섹션도 **발화 형식의 반복 횟수 + 증거 링크**만.
- 관계 외 제3자(자녀·직장 동료) 정보는 분쟁 R&R에 직접 필요한 최소 식별자만.
- 상대에게 공유할 수 있는 형태로만 쓴다 — 공유 못 할 문장이 있으면 그 문장은 원장이 아니라 일기다.

## 3. 원장 스키마 — `ledger_[상대ID].yaml`

```yaml
counterpart: 정민하
purpose: "다음 분쟁 기준선 + 재발 방지 합의 유지"
updated: 2026-09-08
sources:            # 원장에 기여한 분석물 목록 (provenance)
  - id: S-v3   file: SLDA_v3_2026-09-07.pdf   maker: self   window: "통화 +01:53~+37:08, 카톡 15:47–17:09"
  - id: S-v4   file: SLDA_v4_ADOMS.pdf        maker: self   window: "S1–S5"
  - id: S-JM1  file: 대화갈등분석_20260907.html maker: other_ai window: "카톡 15:28–23:58"

relationship_contracts:     # 동시에 걸린 관계 계약. 프레임 전환 탐지의 기준
  - id: RC-1  name: 발주자–외주      rules: "범위·대가 다툼 정상"     evidence: [S-v4 §5]
  - id: RC-2  name: 연인             rules: "…"                       evidence: [S-JM1]
  - id: RC-3  name: 생활 공동체      rules: "…"                       evidence: [S-JM1]

agreements:                 # 확인된 합의 (R&R·정산·절차). dispute §4 기준선의 직접 입력
  - id: AG-01 text: "법령·의무·조건식 DB는 정민하/회사 책임"   evidence: ["S-v3 +15:50", "+20:34"]  status: confirmed_both
  - id: AG-02 text: "명세서는 발주 측 제공"                      evidence: ["+02:53", "+28:13"]        status: confirmed_both
  - id: AG-03 text: "정산 금액·산정 근거를 문서로 고정"           evidence: [S-JM1 구조 절]             status: proposed    # 미이행

red_lines:                  # 합의된(또는 제안된) 논쟁 금지선. 양측 대칭
  - id: RL-01 text: "서로의 진단·복약·상태를 논쟁 재료로 쓰지 않는다"  proposed_by: other_ai  accepted_by: [self]  status: proposed
  - id: RL-02 text: "외주 원문 검증 요구를 별도 문서로 치환하지 않는다"  evidence: ["S-v3 16:06"]  status: proposed

utterance_patterns:         # 반복 발화 형식. 횟수+증거만. 성격 서술 금지
  - id: UP-01 subject: other  form: "상태 치환 발화"          count: 5  evidence: ["15:30","16:06","17:02","17:03"]  window: [S-v3, S-JM1]
  - id: UP-02 subject: self   form: "상태 치환 발화(역적용)"   count: 1  evidence: ["17:05"]
  - id: UP-03 subject: other  form: "주어 생략 후 의도로 방어" count: 2  evidence: ["15:47", "15:51 ③"]
  - id: UP-04 subject: self   form: "검증 요구에 절차 조건 부착" count: 1  evidence: ["15:51–15:52"]  note: "논증축 +, 관계축 − (축 차이, core §9)"

triggers:                   # 확전 직전 발화 유형 (양측)
  - id: TR-01 subject: other  form: "역할 논증으로 전달 질문 대체"   evidence: ["15:48"]
  - id: TR-02 subject: self   form: "역량·관계 전반으로 확대"         evidence: ["17:05–17:09"]

recovery_signals:           # 실제로 국면을 바꾼 발화. 짧은 것이 효과 있었다는 기록
  - id: RV-01 subject: other  text: "고생 많이 했어"     time: "23:58"  source: S-JM1
  - id: RV-02 subject: self   text: "와서 고기 좀 구워"  time: "익일"    source: S-JM1

open_items:                 # 미결. 다음 접점에서 먼저 닫아야 할 것
  - id: OI-01 text: "정산 금액·산정 근거(도구 사용 반영)"   since: 2026-09-07
  - id: OI-02 text: "잔여 범위·종료 시점"                     since: 2026-09-07
  - id: OI-03 text: "결제 승인 한도"                          since: 2026-09-07
  - id: OI-04 text: "17:09–23:58 카톡 원문 미수록 (창 밖)"    since: 2026-09-07

history:                    # 분쟁 이력 1행 요약. 점수 아님
  - date: 2026-09-07  topic: "DB 귀속·전달"  analyses: [S-v3, S-v4, S-JM1]  resolved: partial  note: "RC 전환 양측"
```

`utterance_patterns.count`는 `slda-case-index`의 case 수와 연동 — case 1건이면 `observed_once`, ≥2건이면 `pattern_confirmed`.

## 4. 갱신 규칙

1. 새 분쟁 분석이 끝날 때마다 원장 갱신. **분석 중에는 갱신하지 않는다**(기준선 오염).
2. 항목 상충 시 최신을 `status`에 반영하되 이전 값은 `history`에 남긴다. 삭제 금지.
3. `count`는 증거 링크 수와 같아야 한다. 링크 없는 카운트 금지.
4. `proposed → confirmed_both`는 상대의 발화 또는 상대 산출물에서 동일 항목이 확인될 때만. 자기 판단으로 승격 금지.
5. 상대 산출물(other_ai)에서 가져온 항목은 그 문서가 채점한 **자기 귀책 항목을 우선** 옮긴다(SELF_ADVERSE). 상대 귀책 항목은 우리 분석과 대조 후에만.

## 5. 새 분쟁 분석 시 주입 순서

```
slda-core → slda-counterpart-ledger (S0: agreements·red_lines·open_items·relationship_contracts 로드)
  → slda-transcript (통화 있으면) → slda-dispute 또는 slda-controversy
```
- S0는 자료 신뢰도 표 첫 행. 역할 = "기준선(누적)". 신뢰 메모 = "원장 v날짜, 양측 확인 항목만 기준선으로, proposed는 참고".
- 분석 리포트 §"직전 문서 정합성"에 원장 항목 ID를 대응시킨다: `AG-01 유지 / RL-01 위반(양측) / OI-01 미결 지속`.
- **프레임 전환 탐지**: 발화가 어느 relationship_contract의 규칙으로 말하는지 태깅(`RC` 필드). 한 턴 안에서 RC가 바뀌면 `FRAME_SWITCH` 등재. 양측 대칭.

## 6. 산출물

- `ledger_[상대].yaml` (원본)
- `ledger_[상대]_shareable.md` — 상대와 공유 가능한 판: agreements · red_lines · open_items · recovery_signals만. utterance_patterns·triggers는 **양측 합의 후에만** 포함.

## 7. 검증 체크리스트

- [ ] self 행과 other 행이 모두 존재
- [ ] 저장 금지 항목(진단·복약·성격·의도) 0건 — 원문 grep
- [ ] 모든 count == evidence 링크 수
- [ ] other_ai 출처 항목에 provenance 표기
- [ ] shareable 판에 상대가 반박 못 할 문장이 아니라 **상대가 확인할 수 있는** 문장만 있는가

## 루브릭 매핑
R-10 동일지칭 기능·부호(references/R-10_same_referent_function_polarity_v1.1.md) — 원장 A표 = 사전확률 S0, 인스턴스 기능부호 −2~+2 × 지칭확실성 0.2~1.0, stance_holder로 인용/채택 분리, 조기 합산 금지. R-06 REFERENT_STANDING(references/REFERENT_STANDING_v0.1.md) — 사건 사전은 정의·시기만, 당위성은 상대 반응 이력(ACK+2/NOC+1/OBJ-E+0.5/OBJ-S−2)으로. 4모델 공용 허브: R-05·R-06·R-11·R-13에 산출 전달.