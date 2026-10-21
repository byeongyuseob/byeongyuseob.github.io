---
title: "서버 하드웨어 트러블슈팅"
description: "원인을 알 수 없던 서버 성능 저하 두 건을 환경, 설정, 부품, firmware 순으로 좁혀 BMC와 UEFI firmware에서 원인을 찾은 경험"
date: 2020-04-01
period: "2020.04 – 2020.08"
weight: 3
role: "Contributor"
summary: "서버 약 200대의 CPU 온도 이상과 특정 모델의 메모리 성능 저하를 추적해, 두 건 모두 firmware에서 원인을 찾았습니다."
result: "약 200대 온도·성능 정상화, UEFI v2.31로 메모리 성능 문제 해결"
stack: ["Linux", "iLO", "IMM", "UEFI", "Intel MLC", "BIOS 설정"]
---

## 원인을 좁힌 순서

두 건 모두 바깥쪽 원인부터 하나씩 지워 가며 안쪽으로 들어갔습니다.

{{< flow >}}
title: "원인을 좁힌 순서 · 단계를 눌러 보세요"
steps:
  - title: "환경 · 부하"
    detail: "CPU 온도 건은 서버 환경과 부하를 확인해 과부하가 원인이 아님을 먼저 확인했습니다."
  - title: "설정 변경"
    sub: "냉각 · UEFI"
    detail: "CPU 온도 건은 Enhanced Cooling Mode와 팬 속도 조정으로 증상을 줄였고, 메모리 건은 UEFI 설정을 초기화한 뒤 다시 맞췄습니다."
  - title: "부품 교체"
    detail: "메모리 건은 CPU, 메모리, 시스템 보드를 새 부품으로 바꾸고 Intel MLC로 다시 쟀지만 같은 증상이었습니다."
  - title: "firmware · 로그"
    detail: "두 건 모두 firmware 업데이트와 로그 분석으로 원인 쪽으로 좁혀 갔습니다."
  - title: "제조사 확인"
    tone: "ok"
    detail: "CPU 온도는 제조사 로그 분석으로 iLO firmware 버그를, 메모리는 제조사 글로벌 기술지원과 UEFI v2.31을 확인했습니다."
  - title: "선제 적용"
    detail: "증상이 난 서버뿐 아니라 같은 모델과 firmware 조합의 서버 전체에 미리 적용했습니다."
{{< /flow >}}

## 두 건 비교

| | CPU 온도 이상 | 메모리 성능 저하 |
|---|---|---|
| 기간 | 2020.05 – 08 | 2020.04 – 07 |
| 범위 | 특정 제조사 서버 약 200대 | 특정 제조사의 특정 모델 |
| 증상 | CPU 온도 상승, 성능 저하, 응답 지연 | CPU P-state 기능과 관련된 메모리 성능 저하 |
| 확인 과정 | 부하와 외부 요인 확인, 냉각 설정 변경, 제조사와 로그 분석 | 부품 교체 후 MLC 측정, 메모리 구성 변경, UEFI 설정 조정, firmware 업데이트 |
| 원인과 조치 | iLO firmware 버그, 최신 버전으로 업데이트 | UEFI v2.31 firmware로 해결 |
| 재발 방지 | 같은 모델·firmware 조합 서버에 미리 적용 | 증상이 없던 서버에도 BMC firmware 미리 적용 |

## CPU 온도 이상 (2020.05 – 08)

1. 서버 환경과 부하를 확인하고 성능 모니터링 도구로 살펴봤습니다. 과부하가 원인은 아니었습니다.
2. 서버 설정에서 Enhanced Cooling Mode를 켜고 팬 속도를 바꿔 가며 냉각이 가장 잘 되는 값을 찾았습니다. 이것으로 증상을 먼저 줄였습니다.
3. 제조사와 함께 상세 로그를 분석해 iLO firmware 버그를 확인했습니다.
4. iLO firmware를 최신 버전으로 올려 CPU 온도와 성능을 정상화했습니다.

## 메모리 성능 저하 (2020.04 – 07)

1. CPU, 메모리, 시스템 보드를 새 부품으로 교체하고 Intel MLC로 메모리 성능을 다시 쟀습니다.
2. 메모리 구성을 최소로 줄여 가며 CPU와 메모리 사이의 영향을 확인했습니다.
3. UEFI 설정을 초기화하고 IDC 환경에 맞게 다시 맞췄습니다.
4. UEFI와 BMC(IMM) firmware를 최신으로 올리고 영향받은 서버 로그를 분석했습니다.
5. 제조사 글로벌 기술지원팀과 자료를 주고받으며 원인을 좁혔고, UEFI v2.31로 해결했습니다.

## 정리

- 두 건 모두 처음에는 하드웨어 고장을 의심했지만 원인은 firmware에 있었습니다. 이후로는 부품 교체 전에 firmware 버전과 전력·냉각 설정부터 확인합니다.
- 증상이 난 서버만 고치지 않고, 같은 모델과 firmware 조합을 가진 서버 전체에 조치를 적용했습니다.
- GPU 노드에서도 thermal throttling이나 driver·VBIOS 버전 차이로 같은 유형의 문제가 생기기 때문에, 같은 순서로 확인할 수 있습니다.

## 자세한 기록

- [장애 회고: 서버 200대 CPU 온도 상승](/posts/cpu-thermal-postmortem/)
- [장애 회고: P-state와 메모리 성능 저하](/posts/memory-pstate-postmortem/)
