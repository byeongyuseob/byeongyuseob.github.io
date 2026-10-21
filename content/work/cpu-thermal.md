---
title: "CPU 온도 이상으로 인한 서버 성능 저하 대응"
date: 2020-05-01
period: "2020.05 – 2020.08"
weight: 2
role: "Contributor"
summary: "약 200대 서버에서 CPU 온도가 비정상적으로 올라 생긴 성능 저하·응답 지연 해결"
result: "약 200대 성능 저하 해소 · iLO firmware 선적용으로 재발 방지"
stack: ["Linux", "Monitoring", "iLO", "Firmware"]
---

## 배경

- 약 200대 서버에서 CPU 온도가 비정상적으로 올라 성능 저하와 응답 지연이 생겼다.

## 한 일

- Linux 환경에서 성능 모니터링과 온도 관리로 원인을 좁혀 해결
- 같은 문제가 다른 서버에서 생기지 않도록 iLO firmware 를 미리 업데이트

## 결과

- 해당 서버들의 성능과 응답 지연이 정상으로 돌아왔다.
- 같은 원인의 재발을 막았다.

자세한 원인 분석: [Postmortem](/posts/cpu-thermal-postmortem/)
