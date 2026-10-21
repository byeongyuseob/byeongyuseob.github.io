---
title: "자료로 복원한 GPU 클러스터 두 개의 네트워크 설계"
description: "서버·네트워크 CI, InfiniBand 케이블맵, DCIM 을 읽어 200노드급 학습 클러스터와 250노드급 클라우드 클러스터의 설계를 복원한 분석 기록"
date: 2026-10-21
categories: ["gpu-infra"]
---

> 등급: **분석** — 설계하거나 실행한 결과가 아니라, 설계 자료를 읽고 내가 분석한 내용이다.

## 왜 했나

현장에서 운영하는 GPU 클러스터의 설계 문서는 따로 받지 못했다.
노드를 옮기고 광모듈을 바꾸다 보니 **왜 이렇게 연결돼 있는지** 알아야 판단할 수 있었다.
그래서 운영 자료만으로 설계를 거꾸로 그려 봤다.

## 쓴 자료

- 서버 CI, 네트워크 CI
- InfiniBand 케이블맵 2종
- DCIM

## 복원한 구조

| 항목 | 200노드급 학습 클러스터 | 250노드급 클라우드 클러스터 |
|---|---|---|
| GPU : NIC | 1 : 1 | 2 : 1 |
| 네트워크 | Rail-optimized, 1:1 non-blocking | Spine 이 꽉 찬 상태 |
| 묶음 단위 | SU 32노드, spine 증설 여유 있음 | — |
| 용도 | 학습 | KVM 멀티테넌트 |

두 클러스터 공통: NDR 400G InfiniBand fat-tree, UFM, compute · storage fabric 분리, Kubernetes + Run:AI.

**판정**: DGX 가 아닌 HGX 서버로 SuperPOD 레퍼런스 네트워크를 구현한 구조다.

## 만든 것

- 상면 · InfiniBand 3층 인터랙티브 지도
- 케이블 5,833행 엑셀 (전력 이중화 · 광모듈 수량 포함)
- 해설서

## 넣지 않은 것

- 인수 성능값(busbw · TFLOPS · 스토리지 대역)은 내가 실행한 결과가 아니라서 쓰지 않는다.

## 배운 것

- 학습용은 **GPU 하나당 NIC 하나, rail 정렬, non-blocking** 이 기본이다. 그래서 예비 노드도 [원래 자리로 옮겨야](/work/h200-training-cluster/) 했다.
- 클라우드용은 GPU 두 개가 NIC 하나를 나눠 쓰고 spine 에 여유가 없다. 같은 세대 GPU 라도 **용도가 네트워크를 정한다.**
