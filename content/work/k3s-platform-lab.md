---
title: "K3s 플랫폼 검증 환경 구축"
date: 2026-09-23
period: "2026.09 – 2026.10"
weight: 5
track: "platform"
role: "구축, 검증"
summary: "물리 서버 1대에 VM 5대로 K3s와 관측·스토리지·배포 도구를 함께 올리고, 장애 상황에서 관측과 복구가 되는지 검증했습니다."
result: "K3s 4노드와 외부 관측 노드 1대, smoke·full·chaos 단계 검증"
stack: ["K3s", "Cilium", "Longhorn", "MinIO", "Grafana LGTM", "kube-prometheus-stack", "ArgoCD", "Terraform", "Ansible", "bats"]
---

## 배경

컴포넌트를 하나씩 설치해 보는 것만으로는 실제 운영에서 서로 맞물렸을 때 어떻게 동작하는지 알기 어려웠습니다. 장애가 났을 때 관측, 복구, 원인 추적이 실제로 이어지는지 확인하고 싶었습니다.

## 한 일

- libvirt VM 5대(K3s 4대, 외부 관측용 1대)를 Terraform으로 생성하고, 노드와 클러스터 설정은 Ansible로 관리
- 네트워크 Cilium, 스토리지 Longhorn과 MinIO, 관측 Grafana LGTM과 kube-prometheus-stack, 배포 ArgoCD 구성
- 역할 분리: Terraform은 잘 바뀌지 않는 형상, Ansible은 노드 설정, ArgoCD는 클러스터 위 플랫폼과 앱
- bats로 검증 스크립트를 만들어 smoke, full, chaos 단계로 나눠 확인

## 다음 단계

이 환경 위에 학습·추론 인프라를 올려 볼 계획입니다.
