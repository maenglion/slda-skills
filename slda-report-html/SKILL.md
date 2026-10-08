---
name: slda-report-html
description: SLDA 분석 산출물을 Soul Spectrum 고정 스캐폴드(Pretendard·A4 페이지·색 램프 b0–b4·전용 class)의 단일 HTML 리포트로 렌더링하고 필요 시 PDF로 변환한다. "SLDA 리포트 만들어", "HTML로 뽑아", "피고편/소외인편 리포트", "송도 리포트 형식으로", "기존 CSS 스캐폴드 재사용", "PDF로" 가 나오면 반드시 사용. 새 class를 만들지 않고 assets/scaffold.css 만 쓴다. 분석 모듈(slda-litigation/controversy/dispute) 산출이 먼저 있어야 한다.
---

# SLDA Report HTML

상속: `slda-core`. 이 스킬은 **렌더링만** 한다. 여기서 새 판단·새 수치를 만들지 않는다.

## 1. 스캐폴드 규칙

- CSS는 `assets/scaffold.css` 그대로 `<style>`에 인라인. **새 class 생성 금지.** 인라인 style은 색·폭 미세조정에만.
- 폰트: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">`. 오프라인 배포 시 서브셋 base64를 `@font-face`로 인라인(리서브셋 별도 자산).
- 페이지 단위: `<section class="page">` … `<div class="pagefoot"><span>좌</span><span>우</span></div>`. A4 기준 9 섹션 내외.
- 색 램프 고정: `b0 #6E7681 / b1 #B0843C / b2 #C2683A / b3 #A8302C / b4 #8E1418` · `navy #23304A` · `green #2C5238` · `rdx #4C3F7A`.

## 2. 사용 가능 class (전수)

```
page sec-head sec-num eyebrow thesis kpi-row kpi finding side-pill sbadge
chart-wrap alert alert.calm actor-block actor-head traj step step.hot step.cool
pc pc-head pc-id pc-issue pc-body prem lab q meta pc-note
pcx pcx-top pcx-rk pcx-nm pcx-src pcx-ab ab-l pcx-g
mv mk mk.adv mk.ret mk.rdx mk.fix dt tx ty
sc sc-head sc-rank sc-name sc-total sc-body bar bl bt bf bv
gate gate.pass gate.part gate.fail sc-note footnote pagefoot
scale scale-bar scale-h seg mono muted draft-flag summation tagdict
cover cover-top cover-mark cover-hero cover-meta cover-foot credit kicker case doc disclaim
heat heatleg drift-cap drift-sig cell cl cv crow s-lab tag
```

## 3. 표지 고정 필드

`cover-top`(사건/스레드 식별 · 모듈·버전 · 발행처) → `kicker` "SEMANTIC LOGIC DRIFT ANALYSIS" → `cover-hero`(제목 2줄) → 요약 차트 1개(표현강도 라인 또는 점수 라인, 순수 SVG) → `cover-meta` 4칸(분석 대상 / 분석 단위 / 작성 목적 또는 핵심 관찰 / 분석 방식) → `credit`(분석 설계·모델링 / 발행) → `disclaim` "첨부된 문서에 대한 논리분석 자료입니다 · CASE: Litigation|Controversy|Dispute".

## 4. 섹션 순서 (모듈별)

| 모듈 | 순서 |
|---|---|
| litigation 피고편 | 01 요약 · 02 분석 대상 · 03 프레임 드리프트(heat + 붕괴 차트) · 04 표현강도 · 05 원천 데이터·태그 사전 · 06 소결 · 부록 검증자료(SHA-256) |
| litigation 소외인편 | 01 요약 · 02 분석 대상 · 03 표현강도 · 04 주체귀속 · 05 비당사자 지칭 · 06 쟁점 프레임 · 07 전제충돌 · 08 시간축 서술 · 부록 |
| controversy | 01 요약(마지막 작성) · 02 분석 대상·쟁점 레이어 · 03 주체별 주장 · 04 시간축 드리프트 · 05 전진·후퇴 · 06 전제충돌 · 07 평가항목·세부점수 · 08 시사점·상태표 |
| dispute | 01 Executive finding · 02 Corpus & coding frame · 03 Timeline · 04 객체 계층 · 05 R&R baseline · 06 직전 맥락 · 07 의도 vs 전달 · 08 증거 치환 · 09 검증 비대칭·직접상충 · 10 상태 귀속 · 11 매트릭스 · 12 적대검증 · 13 이전 버전 대비 · 14 최종 판정 · 15 Context anchor · 16 Claim-unit table · 17 Codebook |

## 5. 컴포넌트 매핑

| 내용 | class |
|---|---|
| 요약 명제 | `thesis` |
| 숫자 KPI 4개 | `kpi-row > kpi` (전부 숫자, 서술 금지) |
| 핵심 결과 F-nn / PC 상위 | `finding` |
| 5단계 척도 바 | `scale > scale-bar > seg` ×5 |
| 히트맵 | `heat` (`crow > cell` , `cl/cv`), 범례 `heatleg` |
| 이동 행 | `mv > mk.adv|ret|rdx|fix + dt + tx(q 포함) + ty` |
| 전제충돌 풀카드 | `pc > pc-head(pc-id, pc-issue) + pc-body(prem > lab + q(meta)) + pc-note` |
| 전제충돌 컴팩트 | `pcx` (좌측 띠 `--c` = 중요도 램프) |
| 점수 카드 | `sc > sc-head(sc-rank, sc-name, sc-total) + sc-body(bar ×6) + sc-note` |
| 게이트 판정 | `gate.pass|part|fail` |
| 제외·결함 기록 | `alert.calm` |
| 초안 표시 | `draft-flag` |
| 각주·재현성 | `footnote` |

차트는 외부 라이브러리 없이 **인라인 SVG**. 값은 원자료에서 계산한 숫자를 직접 박는다.

## 6. 렌더 전 검증

- [ ] 모든 숫자가 원자료 행 계산값과 일치(모듈 체크리스트 통과 후 렌더)
- [ ] 헤더 카운트 == 행 수
- [ ] 인용(`q`)은 원문 워딩 그대로
- [ ] 상태표·미판정 선언·SHA-256(litigation) 포함
- [ ] 실명 노출 정책 확인(당사자 제공용은 실명, 제품 데모는 익명화)
- [ ] 편 분리 유지(합본 아님)

## 7. PDF 변환

`chromium --headless --print-to-pdf` 또는 `weasyprint`. `@page` 규칙은 scaffold.css에 있다. 변환 후 페이지 수 == section.page 수 확인.
