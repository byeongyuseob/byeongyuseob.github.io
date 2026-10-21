---
title: "GPU 클러스터 네트워크 구조 분석"
description: "서버·네트워크 CI, InfiniBand 케이블맵, DCIM 자료로 200노드급 학습 클러스터와 250노드급 클라우드 클러스터의 네트워크 구조를 정리한 분석"
date: 2026-10-21
categories: ["gpu-infra"]
---

> 직접 설계하거나 테스트한 결과가 아니라, 운영 자료를 보고 분석한 내용입니다.

## 배경

현장에서 운영하는 GPU 클러스터의 설계 문서를 따로 받지 못했습니다. 노드를 옮기고 광모듈을 교체하면서 연결 구조를 정확히 알아야 할 일이 많아, 운영 자료로 구조를 정리해 봤습니다.

## 사용한 자료

- 서버 CI, 네트워크 CI
- InfiniBand 케이블맵 2종
- DCIM

## 정리 방법

{{< flow >}}
title: "자료를 합친 흐름 · 단계를 눌러 보세요"
steps:
  - title: "서버 · 네트워크 CI"
    detail: "서버와 네트워크 장비의 CI 정보를 모았습니다."
  - title: "IB 케이블맵 2종"
    detail: "IB 케이블맵 두 가지를 함께 썼습니다."
  - title: "DCIM 상면 정보"
    detail: "랙 위치를 알기 위해 DCIM 상면 정보를 붙였습니다."
  - title: "노드 · 스위치 · 포트 연결"
    detail: "세 자료를 노드, 스위치, 포트 단위로 이어 붙였습니다."
  - title: "결과물 3종"
    tone: "ok"
    sub: "지도 · 엑셀 · 해설"
    detail: "상면과 IB 3층을 보는 인터랙티브 지도, 케이블 5,833행 엑셀, 구조 해설 문서를 만들었습니다."
{{< /flow >}}

1. 서버 CI와 네트워크 CI로 노드와 스위치 목록을 만들었습니다.
2. 케이블맵 두 종을 합쳐 노드 포트와 스위치 포트를 하나씩 연결했습니다.
3. DCIM의 상면 정보로 각 장비의 물리 위치를 붙였습니다.
4. 연결 관계를 보고 GPU당 NIC 수, rail 배치, spine 여유를 판단했습니다.

## 정리한 구조

| 항목 | 200노드급 학습 클러스터 | 250노드급 클라우드 클러스터 |
|---|---|---|
| GPU : NIC | 1 : 1 | 2 : 1 |
| 네트워크 | Rail-optimized, 1:1 non-blocking | Spine 포트 여유 없음 |
| 확장 단위 | SU 32노드, spine 증설 여유 있음 | 해당 없음 |
| 용도 | 학습 | KVM 멀티테넌트 |

{{< tabs >}}
title: "두 클러스터 비교 · 탭을 바꿔 보세요"
items:
  - label: "학습 · GPU:NIC 1:1"
    tone: "ok"
    steps: ["GPU 8 · NIC 8", "Rail별 Leaf", "Spine (증설 여유)"]
    text: "GPU마다 NIC가 하나씩 붙고, 같은 번호 GPU끼리 같은 Leaf로 모입니다. Spine에는 증설 여유가 있습니다."
  - label: "클라우드 · GPU:NIC 2:1"
    tone: "warn"
    steps: ["GPU 8 · NIC 4", "Leaf", "Spine (포트 여유 없음)"]
    text: "NIC 하나를 GPU 두 개가 나눠 씁니다. Spine 포트에 여유가 없습니다."
{{< /tabs >}}

두 클러스터 모두 NDR 400G InfiniBand fat-tree, UFM, compute와 storage 네트워크 분리, Kubernetes와 Run:AI를 사용합니다.

정리해 보면 DGX가 아닌 HGX 서버로 NVIDIA SuperPOD 레퍼런스 네트워크 구성을 따른 구조였습니다.

## 만든 자료

- 상면과 InfiniBand 구성을 층별로 볼 수 있는 인터랙티브 지도
- 케이블 5,833행 엑셀(전력 이중화, 광모듈 수량 포함)
- 구조 해설 문서

인수 테스트 성능값(busbw, TFLOPS, 스토리지 대역)은 제가 직접 측정한 값이 아니라서 넣지 않았습니다.

## 운영에 쓴 점

- 학습용 클러스터는 GPU 하나당 NIC 하나, rail 정렬, non-blocking 구성이라 예비 노드도 [원래 자리로 옮겨서](/work/h200-training-cluster/) 복구했습니다.
- 클라우드용 클러스터는 GPU 두 개가 NIC 하나를 함께 쓰고 spine에 여유가 없어, 같은 GPU 세대라도 용도에 따라 네트워크 구성이 다르다는 것을 확인했습니다.
