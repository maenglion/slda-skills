---
name: slda-ai-invocation
description: SLDA §C3 AI 원용 추적 오버레이. 논쟁·분쟁 텍스트에서 화자가 AI(GPT·Gemini·Grok·Claude 등)·전문가·기사·본인 모델을 권위로 소환하는 행위를 7신호(INVOKE·CONTAMINATE·POSSESS·MISMATCH·DISQUALIFY·LAUNDER·DEMAND)로 태깅하고 INVOKE_MODE(explore/assert)와 stance(confirmatory/adversarial)를 부착한다. "AI 딸깍", "내 GPT", "네 AI가 편향", "AI한테 물어보니", "5개 AI가 동일", "AI가 써준 걸", "이거 AI에 넣어봐" 류 발화가 있으면 반드시 이 오버레이를 적용. slda-core 선행, slda-controversy 또는 slda-dispute 위에 얹는다.
---

# SLDA §C3 AI-Invocation Tracking v0.1

상속: `slda-core`. verdict_mode = `observe` — 누가 어떤 권위를 어떻게 소환했는지까지. **원용된 AI가 맞았는지 / 전제가 실제로 편향됐는지 / 누가 이겼는지는 공백.**

## 1. 핵심 질문

화자는 자료로 정교화하기 위해 AI를 원용했는가, 아니면 밀릴 때마다 권위로 소환하거나 상대의 AI 사용을 오염으로 되치며 결론을 유지했는가. 그리고 **자기 전제만** 넣었는가, **반대 전제도** 넣어봤는가. 원용의 존재가 아니라 **방향**을 본다.

## 2. 앞단 전처리 — 발화 귀속 (필수)

SNS 원문은 캡처·인용중첩·AI붙여넣기로 화자가 흐려진다.
- 캡처 재인용 → 원 발화자 복원.
- AI 붙여넣기 → `SPEAKER`=화자, `AUTHOR`=AI 로 분리(core §3). 미분리 시 LAUNDER·INVOKE 상호 오염.
- 산출: `utterance_units.csv` (turn_id · speaker · author · quoted_from · is_ai_paste). §C3는 이 위에서만 돈다.

## 3. 앵커 맵 (분석 착수 시 고정)

- **SPEAKER 맵**: 초기 역할 스냅샷만(역할은 턴 단위 변수). §C3는 화자 식별자만 가져온다.
- **AUTHORITY 맵** (§C3 고유): 권위 / 유형(AI·인간권위·매체·본인모델) / 소유 귀속("내/네 GPT") / 비고.
- 절대 규칙: 원용된 AI의 **출력 내용**을 참·거짓으로 평가하지 않는다.

## 4. 시그널 7종

| 코드 | 정의 |
|---|---|
| `INVOKE` | AI/권위 출력을 자기 주장 지지로 제시 |
| `CONTAMINATE` | 상대 원용을 내용이 아니라 **출처·전제**로 반박 |
| `POSSESS` | AI를 소유격으로 인격화(내/네 GPT) |
| `MISMATCH` | 원용 자료가 원용자 결론을 되레 반박(방향 불일치만 등재) |
| `DISQUALIFY` | AI 사용 자체를 실격 사유로(메타 수) |
| `LAUNDER` | AI 산출을 자기 사고로 제시/은폐 (또는 그 비난) |
| `DEMAND` | 상대에게 원용 강요("이거 긁어서 넣어봐") |
| `SELF_ADVERSE` | 자기 AI 산출이 **자기 귀책·불리 판정**을 포함하는데 그대로 보유·제시 (MISMATCH와 구분: 결론 반박이 아니라 부분 자인) |

## 5. 모드·태세 — 2계층

**1계층 `INVOKE_MODE`(core §3, 상위):**
- `explore` = 답을 찾는 중. 지표 = 불리한 판정을 공개·수용했는가.
- `assert` = 확정 산출물(모델·식·보고서) 보유. 지표 = 산출물–주장 정합. 이 모드에서 "AI가 동의했다"는 성립하지 않는다.
- 두 모드는 같은 저울에 올리지 않는다. **v0.1 결함: 모드 미구분으로 "AI 호출 비대칭"이라 오분류했다 → 실제는 모드 불일치.**

**2계층 `stance`(INVOKE·DEMAND에 부착, 하위):**
- `confirmatory` = 자기 전제·주장만 넣어 돌림
- `adversarial` = 반대 전제·상대 주장·자기 약점도 넣어 돌림
- `na` = 프롬프트 내용 추론 불가(로그 미첨부 → 과소탐지 감수)

stance 비대칭은 **관찰이지 판정이 아니다.** "확증만 함 = 편향/오답"으로 결론짓지 않는다.

## 6. 출력 `ai_invocation_units.csv`

`thread_id · turn_id · speaker · author · ts · utterance_text · invoke_yn · signal · authority(gpt/gemini/grok/copilot/claude/복수AI/전문가/기사/본인모델/none) · invoke_mode · stance · target · provenance(자기AI/남의AI/복수AI/미상)`

롤업 `ai_invocation_report.md`: 화자별 원용 빈도 + mode·stance 비율 / CONTAMINATE·DISQUALIFY 방향 그래프 / MISMATCH 등재(근거 문장 첨부, 검증된 것만).

## 7. 본체 연동

- controversy: `INVOKE + DISQUALIFY` 동시발생 → PC 후보(자기 기준 비대칭). 편향 기준이 산출 주체에 따라 갈리면 E4 감점 근거.
- stylistic-drift: AI 붙여넣기 구간(정제 높음) ↔ 개인 발화 구간(파편)의 정제도 편차를 **같은 턴에서 오버레이**. 인과는 붙이지 않는다.
- "N개 AI가 동일" 류 합의 원용은 N·중복 검증 없이 **주장된 합의**로만 등재.

## 8. 금지선

AI 원용으로 거짓·조작·의도 단정 금지 / CONTAMINATE가 정당한 반박인지 회피인지 가르지 않음 / MISMATCH는 방향 불일치만, 자료·결론 중 무엇이 옳은지 공백 / 정치·통계 사안 정오·조작 판정 금지 / 데모 제작 시 익명화.

## 캘리브레이션 앵커 (송도 스레드 · AI_논쟁_2)

송도: 맹난영 INVOKE(복수AI)·DEMAND·CONTAMINATE·MISMATCH 지적, mode=explore, stance=adversarial 다수 / 성륜수 INVOKE(본인모델·gpt)·DISQUALIFY, mode=assert, stance=confirmatory 전용. MISMATCH 후보 1(영문 DM 단락 ⊥ 인용자 결론). AI_논쟁_2: 양방향 DISQUALIFY 대칭, LAUNDER 다수, §5 귀속 선행 필수.
