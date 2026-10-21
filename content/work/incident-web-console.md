---
title: "인프라 장애 관리 웹 인터페이스 구현"
date: 2021-12-01
period: "2021.12 – 2022.10"
weight: 1
role: "PM"
summary: "하루 30~40건의 서버 장애를 SSO · Ansible Playbook · 웹 콘솔로 표준 처리"
result: "정형 장애는 Playbook 실행 한 번으로 · 서버 직접 접속 대부분 제거"
stack: ["Ansible", "Dynamic Inventory", "SSO", "Flask", "Vue.js", "Elasticsearch", "Kibana"]
---

## 배경

- 서버 60,000대 이상을 운영하는 중에 하드웨어 · OS 레벨 장애가 하루 30~40건 발생했다. 대응 인력과 서버 접속 횟수가 함께 늘었다.
- 여러 사람이 서버에 직접 접속하면서 보안 취약점이 생겼고, 경험이 적은 엔지니어의 처리가 늦어졌다.

## 한 일

- SSO 도입으로 서버 접근 인증을 중앙화
- Ansible Dynamic Inventory 구성
- 장애 유형을 분류하고 유형별 조치를 담은 Ansible Playbook 작성
- Flask(backend) · Vue.js(frontend) 로 웹 인터페이스 개발
- Elasticsearch · Kibana 로 장애 데이터 분석·시각화

## 결과

- 서버에 직접 접속할 일이 거의 사라졌다. 조치는 SSO 를 거친 웹 콘솔에서 한다.
- 유형이 정해진 장애는 Playbook 실행 한 번으로 끝나, 건당 분 단위이던 처리가 수십 초 수준이 됐다. 경험이 적은 엔지니어도 같은 절차로 처리한다.
- 장애 데이터가 쌓이면서 유형별 증감을 보고 미리 대응할 수 있게 됐다.
