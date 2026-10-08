# SLDA MIRROR 반감 v1.1.3 · 인내 잔고 검토 및 보완안

**작성일:** 2026-09-09  
**검토 대상:** `SLDA_v1_1_3_인내잔고_적용샘플`  
**주 적용 모듈:** `dispute`

## 1. 총평

R-10의 동일지칭 기능·부호 분석이 단순히 같은 개념의 긍정·부정 기능을 판독하는 데서 끝나지 않고, **선행 공격의 누적과 후행 반사의 상당성**까지 계산하는 `인내 잔고(tolerance balance)`로 확장됐다.

이 모델은 “누가 부정적 표현을 더 많이 사용했는가”가 아니라 다음을 판독한다.

> 동일 쟁점에서 반복 공격을 받고도 반사하지 않은 기간은 절제로 인정하되, 동일한 기능으로 되돌린 범위 안에서만 제한적으로 감경한다.

따라서 선행 공격을 이유로 후행 공격을 면책하지 않으면서도, 긴 관계와 분쟁의 시간축을 최종 점수에 반영할 수 있다.

## 2. 현재 구조에서 잘 구현된 부분

- 동일한 `concept_id` 안에서만 잔고를 사용한다.
- 불확실한 과거 주장은 지칭확실성 가중치로 할인한다.
- MIRROR가 성립해도 완전히 제외하지 않고 `×0.5`만 적용한다.
- 잔고를 초과한 후행 공격은 전액 반영한다.
- 학점·지능·사생활 등 다른 개념에는 AI 관련 잔고를 차입할 수 없다.
- B의 “너도 쓰레기지”에도 같은 반감 규칙을 적용해 대칭성을 확보했다.
- 국면이 끝나면 잔고를 소멸시키고 다음 분쟁으로 이월하지 않는다.
- 애매한 발화는 확실성 가중치로 적립량을 제한해 자기보고에 의한 잔고 인플레이션을 막는다.
- 원값·MIRROR 제외값·반감 적용값을 함께 표시해 계산 과정을 감사할 수 있다.

이 구조는 “먼저 당했으니 무엇을 말해도 괜찮다”는 보복 면허가 아니라, **누적된 절제를 제한적으로 보상하는 문맥 보정 규칙**이다.

## 3. 필수 보완 1 · 원발화 부호와 잔고 증감량 분리

현재 B 타격의 원발화 부호는 `−2`이고 지칭확실성 가중치가 `0.8`이면 가중값은 `−1.6`이다. 그러나 인내 잔고에는 피해 크기의 절댓값인 `+1.6`이 적립된다.

논리는 맞지만 같은 열에 음수 적립과 양수 잔고가 함께 표시되어 혼동될 수 있다. 다음처럼 값을 분리한다.

```text
raw_polarity = -2
confidence_weight = 0.8
weighted_harm = -2 × 0.8 = -1.6
harm_credit = abs(weighted_harm) = +1.6
tolerance_balance = tolerance_balance + 1.6
```

권장 필드:

| 필드 | 의미 |
|---|---|
| `raw_polarity` | 원발화의 기능 부호 |
| `confidence_weight` | 지칭확실성 가중치 |
| `weighted_harm` | 원발화의 가중 부정값 |
| `balance_delta` | 인내 잔고에 실제 적립·차감되는 값 |
| `balance_after` | 해당 사건 처리 후 잔고 |

표의 `적립/차감` 열에는 `−1.6`이 아니라 `+1.6 적립`으로 표시하고, 원발화의 부정값은 `부호` 열에 유지하는 편이 명확하다.

## 4. 필수 보완 2 · MIRROR 성립조건 세분화

같은 `AI_TOOL_USE`라는 이유만으로 MIRROR를 허용하면 범위가 지나치게 넓어진다. MIRROR는 최소한 다음 조건이 모두 충족될 때만 성립해야 한다.

```text
same concept_id
same evaluation_dimension
same function_family
actor ↔ target reversal
open issue_thread
```

이번 사건의 예시는 다음과 같이 세분화할 수 있다.

```yaml
concept_id: AI_TOOL_USE
evaluation_dimension: COMPETENCE_CREDIT
function_family: DEVALUE_BY_TOOL_SUBSTITUTION
```

예를 들어 “AI는 개인정보 문제가 있다”와 “AI가 다 했지 네가 했냐”는 모두 AI를 언급하지만 평가 차원이 다르다. 전자는 위험·정책 판단이고 후자는 능력·크레딧 박탈이다. 따라서 서로의 잔고를 공유해서는 안 된다.

### 권장 MIRROR 연결 필드

| 필드 | 의미 |
|---|---|
| `mirror_source_event_id` | 반사의 원인이 된 선행 공격 사건 |
| `concept_id` | 동일 개념 여부 |
| `evaluation_dimension` | 능력·책임·신뢰·도덕성 등 동일 평가축 여부 |
| `function_family` | 동일한 공격 기능 여부 |
| `actor_target_reversed` | 행위자와 평가대상이 뒤집혔는지 |
| `available_balance` | 반사 직전 사용 가능한 잔고 |
| `mirror_eligible_amount` | 잔고 안에서 반감 가능한 범위 |
| `excess_amount` | 잔고를 초과해 전액 반영되는 범위 |

## 5. 필수 보완 3 · `phase`와 `issue_thread_id` 분리

현재 샘플은 2025년 1월부터 2026년 9월까지의 발화를 하나의 잔고로 연결한다. 이를 하나의 ‘국면’으로 표현하면 일반적인 대화 국면보다 범위가 지나치게 길어 보인다.

잔고의 수명을 시간 길이가 아니라 **동일 분쟁 스레드의 개방·폐쇄 상태**로 관리하는 것이 정확하다.

```yaml
issue_thread_id: AI_COMPETENCE_DEVALUATION
opened_at: 2025-01
last_recurrence_at: 2026-09-08
closed_at: 2026-09-08
closure_event: 관계 종결 또는 명시적 수리
```

`phase`는 개별 발화의 국면을 기록하고, `issue_thread_id`는 여러 국면에 걸쳐 이어진 동일 쟁점을 연결한다.

- `phase`: 작업지시·협상·공격·검증·수리·종결
- `issue_thread_id`: 장기간 반복된 동일 쟁점 계열

### 스레드 폐쇄 이벤트 예시

- 구체적 행위에 대한 사과가 수리됨
- 오류 정정이 완료됨
- 당사자 간 합의로 해당 쟁점을 닫음
- 관계 또는 거래가 종료됨
- 후속 문면에서 명시적으로 더 이상 원용하지 않기로 함

잔고는 `issue_thread_id`가 닫히면 소멸하며 다른 사건으로 이월하지 않는다.

## 6. 필수 보완 4 · 실제 시각과 분석순서 분리

현재 표에는 `09.08 22:56` 다음에 `09.08 22:40`이 배치돼 있다. 시계열 원장이라면 실제 발화시각 순으로 `22:40 → 22:56`으로 정렬해야 한다.

분석상 연결 순서와 실제 시각순서가 다른 경우 다음 필드를 분리한다.

```text
sequence_index
utterance_time
analysis_order
```

- `sequence_index`: 전체 채널을 병합한 실제 사건순서
- `utterance_time`: 원자료에 표시된 발화시각
- `analysis_order`: 특정 MIRROR 쌍을 설명하기 위한 보고서 배치순서

잔고 계산은 반드시 `sequence_index`를 기준으로 수행한다. 보고서에서 분석순서로 재배치할 경우 실제 시각순서와 다르다는 점을 명시한다.

## 7. 필수 보완 5 · R-11 최종 점수 환산식 공개

샘플에서는 다음과 같이 점수가 변한다.

- A: `−34 → −32.5`, 존엄·강도 절제 `3.0 → 3.5`
- B: `−14 → −13`, 존엄·강도 절제 `2.0 → 2.5`

하지만 가중 피해량이 어떤 구간표를 거쳐 0.5점 상승으로 변환되는지 드러나지 않는다. 재현성을 위해 환산함수 또는 구간표가 필요하다.

예시 구조:

```text
dignity_restraint_score
= base_score_from_penalty_band(total_weighted_harm)
+ mirror_adjustment
```

권장 규칙:

- 원래의 부정 발화 총량과 MIRROR 보정값을 모두 표시한다.
- MIRROR로 인한 최종 보정 상한을 둔다.
- 반감 적용으로 존엄 점수가 원점수보다 과도하게 상승하지 않도록 한다.
- 두 화자에게 동일한 함수와 동일한 구간표를 적용한다.
- 점수 변화의 원인이 된 사건 ID를 출력한다.

## 8. 모듈별 적용 범위

인내 잔고를 모든 SLDA 모델의 최종 점수에 동일하게 적용하면 안 된다. 선행 공격이 후행 발언의 법적·계약적 책임을 자동으로 줄이는 것은 아니기 때문이다.

| 모델 | 적용 방식 |
|---|---|
| `dispute` | 동일 쟁점의 MIRROR 상당성을 판정하고 존엄·강도 절제 점수에 제한적으로 반영 |
| `controversy` | 선행 공격과 반사 구조를 표시하되, 논증의 진위·근거 점수와 분리 |
| `litigation` | 맥락자료와 발화 경위로만 표시. 법적 책임이나 증거가치 점수는 자동 보정하지 않음 |
| `contract` | 계약상 의무·위반 판단과 분리. 협상 태도나 커뮤니케이션 품질에만 제한적으로 사용 |

공통 코어는 MIRROR 후보와 연결 사건을 검출하고, 실제 감경 여부는 각 모듈이 결정하도록 한다.

## 9. 최종 산식 권고

```text
1. 선행 공격 적립
weighted_harm = abs(raw_polarity) × reference_confidence_weight
balance_after = balance_before + weighted_harm

2. MIRROR 적격성 판정
eligible = same_concept
        && same_evaluation_dimension
        && same_function_family
        && actor_target_reversed
        && issue_thread_open

3. 반사 처리
mirror_eligible_amount = min(response_harm, balance_before)
excess_amount = max(response_harm - balance_before, 0)

adjusted_response_harm
= mirror_eligible_amount × 0.5
+ excess_amount

4. 잔고 차감
balance_after = balance_before - mirror_eligible_amount

5. 스레드 종결
if issue_thread_closed:
    balance_after = 0
    remaining_balance_is_logged_only = true
```

## 10. 최종 출력 권고

리포트에는 최소한 다음 세 값을 동시에 표시한다.

| 출력 | 목적 |
|---|---|
| 전체 원값 | 실제 발생한 부정 발화 총량 |
| MIRROR 완전 제외값 | 비교용 극단값. 최종 점수로 사용하지 않음 |
| MIRROR 반감 적용값 | v1.1.3의 실제 최종값 |

추가로 다음을 표시한다.

- 잔고 적립 사건과 소진 사건
- 각 MIRROR의 `mirror_source_event_id`
- 개념·평가차원·기능계열 일치 여부
- 잔고 내 반사량과 초과 반사량
- 스레드 개방·폐쇄 시점
- 확실성 부족으로 승급 대기 중인 사건

## 11. 최종 정의

인내 잔고 모델은 **동일 개념에 관한 반복 공격과 지연된 반사를 시간축으로 연결하는 문맥 보정 모델**이다.

이 모델은 후행 공격을 면책하지 않는다. 동일한 평가축·기능계열에서 선행 공격을 받았으나 즉시 반사하지 않은 정도를 잔고로 적립하고, 이후 발생한 대칭 반응 중 잔고 범위에 해당하는 부분만 제한적으로 반감한다.

분석 단위는 다음과 같다.

```text
동일 개념
+ 동일 평가차원
+ 동일 기능계열
+ 행위자·대상 역전
+ 열린 쟁점 스레드
= MIRROR 반감 후보
```

따라서 이 모델은 단순 욕설 개수 비교를 넘어, **누가 어떤 쟁점에서 먼저 부정적 기능을 누적했고 상대의 후행 발언이 대칭 반사인지 독립 공격인지**를 재현 가능한 규칙으로 판독한다.

