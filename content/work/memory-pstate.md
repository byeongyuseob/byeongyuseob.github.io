---
title: "서버 메모리 성능 저하 트러블슈팅"
date: 2020-04-01
period: "2020.04 – 2020.07"
weight: 3
role: "Contributor"
summary: "특정 서버 모델에서 CPU P-state 와 메모리 성능 사이의 원인 불명 문제 추적"
result: "UEFI firmware 업데이트로 해결 · iLO 선적용으로 잠재 장애 차단"
stack: ["Linux", "CPU P-state", "UEFI", "iLO"]
---

## 배경

- 특정 제조사 서버 모델에서 CPU P-state 기능과 메모리 성능 사이에, 원인이 확인되지 않은 성능 저하가 있었다.

## 한 일

- Linux 환경에서 메모리 성능 저하를 추적
- 제조사의 UEFI v2.31 firmware 업데이트로 문제 해결
- 후속 조치로 iLO firmware 를 미리 업데이트

## 결과

- 메모리 성능 저하가 해결됐다.
- 같은 모델에서 생길 수 있는 잠재 장애를 미리 막았다.

자세한 원인 분석: [Postmortem](/posts/memory-pstate-postmortem/)
