---
title: "서버 하드웨어 트러블슈팅"
description: "원인 불명 성능 저하 두 건을 부하 배제 → 설정 실험 → 부품 교체 → firmware · 제조사 협업 순으로 좁혀 BMC · UEFI firmware 에서 원인을 찾은 기록"
date: 2020-04-01
period: "2020.04 – 2020.08"
weight: 3
role: "Contributor"
summary: "약 200대 CPU 온도 이상과 특정 모델의 메모리 성능 저하를 층을 하나씩 걷어내며 추적해, 둘 다 firmware 에서 원인을 찾고 증상 없는 서버까지 선제 조치"
result: "약 200대 온도 · 성능 정상화 · UEFI v2.31 로 메모리 성능 해결 · 미발생 서버 선제 업데이트"
stack: ["Linux", "iLO · IMM (BMC)", "UEFI", "Intel MLC", "Vendor Escalation"]
---

## 두 사건

| | CPU 온도 이상 | 메모리 성능 저하 |
|---|---|---|
| 기간 | 2020.05 – 08 | 2020.04 – 07 |
| 범위 | 특정 제조사 서버 약 200대 | 특정 제조사의 특정 모델 |
| 증상 | CPU 온도 상승 → 성능 저하 · 응답 지연 | CPU P-state 와 얽힌 메모리 성능 저하 |
| 좁힌 순서 | 부하 · 외부 요인 배제 → 냉각 설정 실험 → 제조사 로그 분석 | 부품 교체 + MLC 측정 → 메모리 구성 실험 → UEFI 설정 → firmware · 로그 → 글로벌 기술지원 |
| 원인 · 조치 | **iLO firmware 버그** → 최신 firmware | **UEFI v2.31** firmware |
| 재발 방지 | 같은 조합 서버에 firmware 선적용 | 증상 없는 서버 그룹까지 BMC firmware 선적용 |

## 공통으로 배운 것

- **성능 문제의 열쇠는 종종 firmware 와 전력 · 냉각 정책**에 있다. 부품부터 바꾸기 전에 버전과 정책을 본다.
- **완화와 해결을 나눈다.** 냉각 설정으로 서비스를 먼저 살리고, 원인은 제조사 로그로 확정했다.
- 증상이 난 서버만 고치면 끝나지 않는다. **같은 조합을 가진 서버 전체**를 맞춰야 재발이 없다.
- 이 습관은 GPU 클러스터의 thermal throttling, driver · VBIOS 버전 불일치 대응에 그대로 이어진다.

## 자세한 기록

- [Postmortem: 서버 약 200대의 CPU 온도 이상](/posts/cpu-thermal-postmortem/)
- [Postmortem: CPU P-state 와 메모리 성능 저하](/posts/memory-pstate-postmortem/)
