---
title: "장애 회고: 서버 200대 CPU 온도 상승"
description: "서버 약 200대의 CPU 온도 상승과 성능 저하를 추적해 iLO firmware 버그를 찾은 과정"
date: 2020-08-31
categories: ["hardware"]
---

> 2020.05 – 2020.08, Contributor. 관련 프로젝트: [서버 하드웨어 트러블슈팅](/work/hardware-troubleshooting/)

## 요약

특정 제조사 서버 약 200대에서 CPU 온도가 비정상적으로 올라 성능이 떨어지고 응답 시간이 늘었습니다. 부하나 외부 환경 문제가 아닌 것을 먼저 확인했고, 냉각 설정으로 증상을 줄인 뒤 제조사와 로그를 분석해 iLO firmware 버그를 찾았습니다. 최신 firmware로 업데이트한 뒤 온도와 성능이 정상으로 돌아왔습니다.

## 영향

- 대상: 특정 제조사 서버 약 200대
- 증상: CPU 온도 상승, 성능 저하, 응답 지연

## 확인 과정

1. 서버 환경과 부하를 확인하고 성능 모니터링 도구로 살펴봤습니다. 과부하가 원인은 아니었습니다.
2. 서버 설정에서 Enhanced Cooling Mode를 켜고 팬 속도를 바꿔 가며 냉각이 가장 잘 되는 값을 찾았습니다.
3. 제조사와 함께 상세 로그를 분석해 iLO firmware 버그를 확인했습니다.
4. iLO firmware를 최신 버전으로 업데이트해 CPU 온도와 성능을 정상화했습니다.

{{< flow >}}
title: "원인을 좁힌 순서 · 단계를 눌러 보세요"
steps:
  - title: "온도 상승 · 응답 지연"
    tone: "bad"
    detail: "CPU 온도가 올라가면서 서버 응답이 느려지는 증상이 나타났습니다."
  - title: "부하 · 외부 요인"
    sub: "이상 없음"
    detail: "서버 부하와 주변 환경을 확인했지만 원인이 될 만한 것은 없었습니다."
  - title: "냉각 모드 · 팬 속도"
    sub: "증상 완화"
    detail: "Enhanced Cooling Mode와 팬 속도 조정으로 증상을 줄였지만 근본 원인은 아니었습니다."
  - title: "제조사와 로그 분석"
    detail: "제조사와 함께 로그를 분석했습니다."
  - title: "iLO firmware 버그"
    tone: "ok"
    detail: "iLO firmware 버그가 원인으로 확인됐습니다."
  - title: "최신 firmware 적용"
    sub: "같은 조합 서버까지"
    detail: "증상이 난 서버뿐 아니라 같은 모델과 firmware 조합의 서버에 미리 적용했습니다."
{{< /flow >}}

## 가설과 결과

| 가설 | 확인한 방법 | 결과 |
|---|---|---|
| 과부하 | 서버 환경과 부하, 성능 모니터링 도구 | 과부하 아님 |
| 외부 환경 | 서버 환경 확인 | 외부 요인 아님 |
| 냉각 부족 | Enhanced Cooling Mode, 팬 속도를 바꿔 가며 최적값 찾기 | 증상 완화, 근본 원인은 아님 |
| BMC firmware | 제조사와 상세 로그 분석 | iLO firmware 버그 확인 |

## 재발 방지

- 같은 모델과 firmware 조합을 쓰는 서버에 업데이트를 미리 적용했습니다.
- 냉각 설정 변경은 임시 조치로 보고, 원인 조치(firmware)와 나눠서 관리했습니다.

## 남긴 점

- 온도 문제라고 해서 냉각 부족이 원인이라고 단정하지 않습니다. 팬을 제어하는 BMC firmware도 함께 확인합니다.
- 서비스 영향을 먼저 줄이고, 원인은 따로 끝까지 확인했습니다.

## GPU 노드에 적용하면

아래는 일반적인 내용입니다.

GPU는 온도가 올라가면 clock을 스스로 낮춥니다(thermal throttling). 장애로 잡히지 않고 학습 속도 저하로만 나타나서 놓치기 쉽습니다. 이번 사례처럼 BMC와 firmware 설정이 팬 제어에 영향을 주는 것도 같습니다.

| 확인할 것 | 방법 |
|---|---|
| 현재 온도와 clock | `nvidia-smi -q -d TEMPERATURE,CLOCK` |
| clock이 낮아진 이유 | `nvidia-smi -q -d PERFORMANCE`의 Clocks Throttle Reasons(최근 드라이버는 Clocks Event Reasons)에서 Thermal Slowdown 항목 |
| 노드 간 비교 | DCGM으로 GPU 온도와 throttle 사유를 계속 수집해 같은 랙·모델끼리 비교 |
| 펌웨어 | BMC와 GPU 관련 firmware 버전을 노드별로 수집해 같은 조합끼리 묶어 보기 |

{{< tabs >}}
title: "GPU 서버라면 · throttle 사유를 골라 보세요"
items:
  - label: "Thermal"
    tone: "bad"
    steps: ["학습 속도 저하", "throttle 사유: Thermal", "랙 · 노드 온도 비교", "팬 정책 · BMC firmware 확인"]
    text: "같은 랙의 다른 노드와 온도를 비교하고, 팬 정책과 BMC firmware 버전 차이를 확인합니다. CPU 사례에서 배운 순서 그대로입니다."
  - label: "Power"
    tone: "warn"
    steps: ["학습 속도 저하", "throttle 사유: Power", "전력 캡 · 랙 급전 확인"]
    text: "GPU 전력 캡 설정과 랙 급전 상태를 확인합니다."
  - label: "없음"
    steps: ["학습 속도 저하", "throttle 사유 없음", "통신 · 다른 원인 확인"]
    text: "throttle이 없으면 GPU 자체보다 노드 간 통신이나 다른 원인을 먼저 봅니다."
{{< /tabs >}}
