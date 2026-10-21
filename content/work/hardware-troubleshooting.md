---
title: "서버 하드웨어 트러블슈팅"
description: "원인을 알 수 없던 서버 성능 저하 두 건을 추적해 BMC와 UEFI firmware에서 원인을 찾은 경험"
date: 2020-04-01
period: "2020.04 – 2020.08"
weight: 3
role: "Contributor"
summary: "서버 약 200대의 CPU 온도 이상과 특정 모델의 메모리 성능 저하를 추적해, 두 건 모두 firmware에서 원인을 찾았습니다."
result: "약 200대 온도·성능 정상화, UEFI v2.31로 메모리 성능 문제 해결"
stack: ["Linux", "iLO", "IMM", "UEFI", "Intel MLC"]
---

## 두 건 비교

| | CPU 온도 이상 | 메모리 성능 저하 |
|---|---|---|
| 기간 | 2020.05 – 08 | 2020.04 – 07 |
| 범위 | 특정 제조사 서버 약 200대 | 특정 제조사의 특정 모델 |
| 증상 | CPU 온도 상승, 성능 저하, 응답 지연 | CPU P-state 기능과 관련된 메모리 성능 저하 |
| 확인 과정 | 부하와 외부 요인 확인, 냉각 설정 변경, 제조사와 로그 분석 | 부품 교체 후 MLC 측정, 메모리 구성 변경, UEFI 설정 조정, firmware 업데이트 |
| 원인과 조치 | iLO firmware 버그, 최신 버전으로 업데이트 | UEFI v2.31 firmware로 해결 |
| 재발 방지 | 같은 모델·firmware 조합 서버에 미리 적용 | 증상이 없던 서버에도 BMC firmware 미리 적용 |

## 정리

두 건 모두 처음에는 하드웨어 고장을 의심했지만 원인은 firmware에 있었습니다. 이후로는 부품 교체 전에 firmware 버전과 전력·냉각 설정부터 확인합니다.

증상이 난 서버만 고치지 않고, 같은 모델과 firmware 조합을 가진 서버 전체에 조치를 적용했습니다.

## 자세한 기록

- [장애 회고: 서버 200대 CPU 온도 상승](/posts/cpu-thermal-postmortem/)
- [장애 회고: P-state와 메모리 성능 저하](/posts/memory-pstate-postmortem/)
