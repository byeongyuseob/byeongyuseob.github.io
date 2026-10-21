---
title: "통합 배포 시스템 구축"
date: 2023-01-01
period: "2023.01 – 2024.01"
weight: 8
role: "PM"
summary: "서비스마다 달랐던 배포 방식을 표준 개발 스택, 컨테이너, GitOps 기반 자동 배포로 통일했습니다."
result: "수동 배포를 자동 배포로 전환, 장애 인지 시간 단축"
stack: ["Python/Django", "React", "Docker", "GitHub Actions", "Kubernetes (kubeadm)", "ArgoCD", "Prometheus", "Grafana"]
---

## 배경

- 서비스마다 언어와 배포 방식이 달라 업데이트와 관리가 어려웠습니다.
- 배포를 사람이 직접 하다 보니 시간이 오래 걸렸고, 배포 실수로 인한 서비스 중단과 오류가 1년에 10회 이상 있었습니다.

## 한 일

- 개발 스택을 Python/Django와 React로 표준화
- Dockerfile로 컨테이너화하고 환경별 이미지 빌드 자동화
- GitHub Actions로 변경 감지, 빌드, 테스트, 배포 파이프라인 구성
- kubeadm으로 3노드 Kubernetes 클러스터를 구축하고 ArgoCD로 GitOps 배포
- Prometheus와 Grafana로 모니터링, 메신저로 실시간 알림

## 결과

- push하면 빌드와 테스트를 거쳐 ArgoCD가 클러스터에 반영하도록 배포를 자동화했습니다.
- 배포 절차가 하나로 정리되면서 배포 실수로 인한 장애가 줄었습니다.
- 알림이 바로 오면서 문제를 알아채고 원인을 찾는 데 걸리던 시간이 몇 시간에서 몇십 분으로 줄었습니다.
