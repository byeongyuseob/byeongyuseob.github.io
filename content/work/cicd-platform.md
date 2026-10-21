---
title: "통합 배포 시스템 구축: CI/CD 자동화와 컨테이너화"
date: 2023-01-01
period: "2023.01 – 2024.01"
role: "PM"
summary: "제각각이던 배포 절차를 표준 스택 · 컨테이너 · GitOps 로 통일"
result: "수동 배포 → GitOps 자동 배포 · 장애 인지가 시간 단위에서 분 단위로"
stack: ["Python/Django", "React", "Docker", "GitHub Actions", "Kubernetes (kubeadm)", "ArgoCD", "Prometheus", "Grafana"]
---

## 배경

- 서비스마다 언어 · 배포 방식이 달라 업데이트와 관리가 어려웠다.
- 배포를 사람이 직접 하다 보니 오래 걸렸고, 배포 실수로 인한 서비스 중단·오류가 연 10회 이상 있었다.

## 한 일

- 개발 스택을 Python/Django 와 React 로 표준화
- Dockerfile 로 컨테이너화하고 환경별 image build 를 자동화
- GitHub Actions 로 변경 감지 → build → test → 배포 pipeline 구성
- kubeadm 으로 3-node Kubernetes cluster 설계·구축, ArgoCD 로 GitOps 배포
- Prometheus · Grafana 모니터링과 메신저 실시간 알림

## 결과

- 배포가 사람 손을 거치지 않게 됐다. push 하면 build · test 를 거쳐 ArgoCD 가 cluster 에 반영한다.
- 배포 절차가 하나로 통일되면서 배포 실수로 인한 장애가 눈에 띄게 줄었다.
- 문제가 생기면 알림이 바로 와서, 알아채고 원인을 찾기까지가 시간 단위에서 분 단위로 줄었다.
