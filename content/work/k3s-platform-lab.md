---
title: "K3s 플랫폼 통합 검증 랩"
date: 2026-09-23
period: "2026.09 – 2026.10"
weight: 5
role: "구축 · 검증"
summary: "물리 서버 1대 위 VM 5대에 K3s 와 관측·스토리지·GitOps 를 함께 세우고, 서로 물린 상태에서 장애·복구·추적이 되는지 end-to-end 로 검증"
result: "K3s 4노드 + 외부 관측점 1 · 검증 스크립트로 smoke / full / chaos 단계 확인"
stack: ["K3s", "Cilium", "Longhorn", "MinIO", "Grafana LGTM", "kube-prometheus-stack", "ArgoCD", "Terraform", "Ansible", "bats"]
---

## 배경

- 컴포넌트를 하나씩 익히는 것과, 플랫폼 전체가 서로 물려 돌아가는 것은 다르다.
- 장애가 났을 때 관측 · 복구 · 추적이 실제로 이어지는지 보고 싶었다.

## 한 일

- libvirt VM 5대(K3s 4 + 외부 관측점 1)를 Terraform 으로 만들고, 노드·클러스터 설정은 Ansible 로 관리
- 네트워크 Cilium, 스토리지 Longhorn · MinIO, 관측 Grafana LGTM + kube-prometheus-stack, 배포 ArgoCD
- 계층을 나눴다: Terraform = 잘 안 바뀌는 형상, Ansible = 노드 설정, ArgoCD = 클러스터 위 플랫폼·앱
- bats 기반 검증 스크립트로 smoke · full · chaos 단계를 나눠 확인

## 배운 것

- **층을 나누면 장애 원인을 층 단위로 좁힐 수 있다.** 무엇을 어디서 바꾸는지가 분명해진다.
- 다음 목표는 이 위에서 학습·추론 인프라를 올려 보는 것이다.
