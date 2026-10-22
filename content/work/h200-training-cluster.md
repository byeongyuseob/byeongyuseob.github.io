---
title: "H200 학습 클러스터 구축·운영"
description: "약 200노드 H200 학습 클러스터의 전력 실측, 입고, InfiniBand 광모듈 교체, rail 배치를 지키는 고장 노드 복구를 현장에서 맡은 경험"
date: 2025-01-01
period: "2025"
weight: 1
role: "현장 구축·운영"
mine: "입고 전 전력 실측, 랙 배치와 입고, InfiniBand 광모듈 7천여 개 교체 관리, 고장 노드 복구 9회를 현장에서 맡았습니다."
decision: "랙 배치는 정격이 아니라 실측 전력으로 정했고, 고장 노드는 빈 포트가 아니라 같은 자리로 교체해 rail 배치를 지켰습니다."
summary: "약 200노드 H200 학습 클러스터의 입고 전 전력 실측부터 랙 마운트, InfiniBand 정비, 고장 노드 복구까지 현장 작업을 맡았습니다."
result: "약 200노드 입고, IB 광모듈 7천여 개 교체, 고장 노드 복구 9회"
stack: ["H200 (HGX)", "InfiniBand NDR 400G", "Rail-optimized Fat-tree", "Optical Transceiver", "Cable Map", "UPS"]
---

## 요약

약 200노드 규모 H200 학습 클러스터의 현장 구축과 운영을 맡았습니다. 입고 전에는 서버 전력을 직접 재서 랙당 배치 대수를 정했고, 구축 뒤에는 InfiniBand 광모듈 7천여 개 교체와 고장 노드 복구 9회를 진행했습니다. 운영 중 전력 스파이크로 UPS가 바이패스로 운전된 기간에는 GPU 장비 모니터링을 강화했습니다.

## 클러스터 구성

{{< arch >}}
title: "클러스터 구성 · 구성 요소를 눌러 보세요"
layers:
  - name: "스케줄링"
    items:
      - name: "Kubernetes"
        detail: "학습 작업이 올라가는 기반입니다."
      - name: "Run:AI"
        detail: "Kubernetes 위에서 GPU 작업 스케줄링을 맡습니다."
  - name: "관리"
    items:
      - name: "UFM"
        detail: "InfiniBand fabric을 관리합니다."
  - name: "네트워크"
    items:
      - name: "Compute · NDR 400G IB"
        detail: "GPU 1개당 NIC 1개, Rail-optimized fat-tree, 1:1 non-blocking입니다. spine 증설 여유가 있습니다."
      - name: "Storage 네트워크"
        detail: "compute 네트워크와 분리돼 있습니다."
  - name: "노드"
    tool: "약 200노드"
    items:
      - name: "8-GPU HGX H200"
        detail: "서버 1대에 GPU 8개, GPU마다 InfiniBand NIC 1개가 붙습니다."
      - name: "SU 32노드"
        detail: "확장 단위(Scalable Unit)는 32노드입니다."
  - name: "설비"
    items:
      - name: "랙 배치"
        tone: "warn"
        detail: "실측 전력을 근거로 랙 급전 한도 안에서 3랙에 4노드를 배치했습니다."
      - name: "UPS"
        tone: "bad"
        detail: "학습 부하의 전력 스파이크로 UPS가 오랫동안 바이패스로 운전된 기간이 있었습니다."
{{< /arch >}}

| 항목 | 내용 |
|---|---|
| 서버 | 8-GPU HGX H200, 약 200노드 |
| GPU 네트워크 | NDR 400G InfiniBand fat-tree, GPU 1개당 NIC 1개 |
| 배치 방식 | Rail-optimized, 1:1 non-blocking |
| 확장 단위 | SU(Scalable Unit) 32노드, spine 증설 여유 있음 |
| 네트워크 분리 | compute 네트워크와 storage 네트워크 분리 |
| 관리 | UFM으로 fabric 관리, Kubernetes와 Run:AI로 작업 스케줄링 |

구성은 운영 자료를 보고 정리한 내용입니다. 정리 과정은 [GPU 클러스터 네트워크 구조 분석](/posts/gpu-cluster-network-reconstruction/)에 따로 적었습니다.

## 맡은 일

{{< flow >}}
title: "맡은 일 순서 · 단계를 눌러 보세요"
steps:
  - title: "전력 실측"
    sub: "2025 입고 전"
    detail: "시설 담당 조직과 함께 UPS 출력단에 전력 측정기를 설치해 8-GPU 서버의 실사용 전력을 쟀습니다."
  - title: "랙 배치 · 입고"
    sub: "3랙에 4노드"
    detail: "실측값을 근거로 랙 급전 한도 안에서 배치 대수를 정하고, 약 200노드를 입고해 랙에 설치했습니다."
  - title: "광모듈 교체"
    sub: "2025.08 – 10 · 7천여 개"
    detail: "NDR 400G InfiniBand의 서드파티 광모듈을 NVIDIA 정품으로 바꿨습니다. 케이블맵으로 범위와 순서를 관리했습니다."
  - title: "고장 노드 복구"
    sub: "2025.08 – 10 · 9회"
    tone: "ok"
    detail: "고장 노드 자리로 예비 노드를 옮겨 rail 배치를 지켰습니다. 재마운트, 전원, 광 케이블 재결선을 직접 했습니다."
  - title: "UPS 바이패스 대응"
    sub: "운영 중"
    tone: "warn"
    detail: "전력 스파이크로 UPS가 바이패스로 운전된 기간 동안 GPU 장비 모니터링을 강화했습니다. 이후 시설 쪽에서 UPS 모듈을 증설했습니다."
{{< /flow >}}

## 전력 스파이크와 랙 배치

8-GPU 학습 서버는 정격 전력, 평상시 부하, 순간 스파이크가 모두 다릅니다. 학습 중에는 여러 노드의 GPU가 같은 순간 계산과 통신을 반복해서, 전력이 동시에 튀어 오릅니다. 랙을 정격이나 평균으로 채우면 이 순간에 급전 한도를 넘습니다.

{{< spike >}}

- 아래 값은 H200 서버 1대를 직접 측정한 최대값입니다. 같은 H200 세대라도 기종에 따라 스파이크가 대당 약 4kW 차이가 났습니다.
- 이 클러스터는 실측값을 근거로 3랙에 4노드를 배치했습니다.
- 기존 기종에서 스파이크를 겪은 뒤로 GPU 서버는 Max Spike 값의 80%를 기준으로 마운트 대수를 정합니다. 신규 기종 측정과 센터별 운영 대수 조정 검토는 [GPU 서버 전력 스파이크와 랙 배치](/work/gpu-power-validation/)에 따로 정리했습니다.

| 구분 | 기존 기종 | 신규 기종 |
|---|---|---|
| 100% 부하 최대 | 8~9kW | 약 13kW |
| 스파이크 최대 | 약 15kW | 약 18.9kW |

## Rail-optimized 구조

각 노드의 GPU 0번은 rail 0 leaf로, GPU 1번은 rail 1 leaf로 가는 식으로 같은 번호끼리 묶입니다. 노드 사이 같은 번호 GPU 통신이 leaf 하나 안에서 끝나기 때문에, 학습 중 집단 통신(all-reduce 등)의 경로가 짧고 일정합니다.

{{< rail >}}

## InfiniBand 광모듈 교체

NDR 400G InfiniBand 네트워크에 쓰이던 서드파티 광모듈을 NVIDIA 정품으로 바꾸기로 했습니다. 2025.08부터 10월까지 7천여 개를 교체했습니다.

| 관리한 것 | 방법 |
|---|---|
| 교체 범위 | 케이블맵의 노드, 포트, 상대 스위치 포트, 광모듈 수량으로 전체 대상을 정리 |
| 교체 순서 | 케이블맵 기준으로 순서를 정해 진행 |
| 진행 추적 | 어느 링크를 작업했는지 케이블맵에서 추적 |

같은 기간에 진행한 고장 노드 복구도 같은 케이블맵으로 다시 연결할 링크를 확인했습니다.

## 고장 노드 복구

예비 노드를 빈 포트에 바로 연결하면 빠르지만, 그 노드의 GPU들이 원래와 다른 rail leaf에 붙게 됩니다. 그러면 그 노드가 들어간 작업은 통신 경로가 달라집니다. 위 도식에서 "빈 포트에 예비 노드 연결"을 누르면 그 차이가 보입니다.

그래서 고장 노드를 빼고 그 자리에 예비 노드를 옮겨 설치했습니다. 재마운트, 전원, 광 케이블 재결선까지 직접 했고, 두 달 동안 9번 진행했습니다. 작업 1건당 정지 시간은 기록이 남아 있지 않습니다. 판단 과정은 [GPU 고장 노드를 같은 자리로 교체한 이유](/posts/gpu-node-replace-same-slot/)에 따로 적었습니다.

## 정리

- GPU 클러스터의 랙 배치는 정격이 아니라 실측한 스파이크 값으로 정해야 했습니다.
- 노드를 바꿀 때는 서버뿐 아니라 네트워크상의 위치(rail)까지 맞춰야 했습니다.
- 광모듈처럼 수천 개 단위 작업은 케이블맵 하나를 기준으로 범위, 순서, 진행을 함께 관리해야 추적이 됐습니다.
- 앞으로는 복구 후 `nccl-tests`로 통신 성능을 확인하는 절차까지 직접 해 볼 계획입니다.
