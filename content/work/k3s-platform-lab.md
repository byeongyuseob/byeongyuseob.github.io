---
title: "K3s 플랫폼 검증 환경 구축"
description: "물리 서버 1대에 VM 7대로 K3s 플랫폼을 기획·설계·구축하고, GitOps 배포, 관측, 저장소, IssueOps 배포 창구, vLLM 추론과 LoRA 학습까지 올려 ML 인프라 운영 시나리오를 검증하는 프로젝트"
date: 2026-09-07
period: "2026.09 – 현재"
weight: 6
track: "platform"
role: "기획, 설계, 구축, 검증"
mine: "물리 서버 1대에 VM 7대로 K3s 클러스터를 직접 설계하고 세워, GitOps 배포, 관측, 저장소, vLLM 추론 SLO 측정까지 진행하고 있습니다."
decision: "Cilium은 ArgoCD가 잘못 반영하면 스스로 복구할 수 없어 GitOps 밖에 두고, 관측 저장소는 Longhorn 장애도 볼 수 있게 노드 local 디스크에 뒀습니다."
summary: "물리 서버 1대에 VM 7대로 K3s 클러스터를 직접 설계하고 세워, ArgoCD로 플랫폼 부품을 배포하고(Application 21개, ApplicationSet 2개) vLLM 추론 SLO 기준선까지 측정했습니다."
result: "VM 7대, 커밋 148개, ArgoCD Application 21개 + ApplicationSet 2개, IssueOps 배포, vLLM SLO 기준선(Pod당 동시 4), LoRA 학습→서빙 고리"
stack: ["K3s", "Cilium", "ArgoCD", "Longhorn", "MinIO", "Grafana LGTM", "Harbor", "vLLM", "Terraform", "Ansible"]
---

## 왜 시작했나

컴포넌트를 하나씩 설치해 보는 것만으로는 실제 운영에서 서로 맞물렸을 때 어떻게 동작하는지 알기 어려웠습니다. 그래서 두 가지를 목표로 잡았습니다.

| 단계 | 목표 |
|---|---|
| 1. 플랫폼 | Cilium, Longhorn, MinIO, 관측 스택, ArgoCD가 서로 물린 상태에서 장애, 복구, 추적이 end-to-end로 성립하는지 확인 |
| 2. ML 인프라 | GPU 없이 CPU 클러스터에서, ML 인프라 엔지니어가 하는 운영 일(서빙 용량 계획, 자동 확장, 카나리, 학습 Job 대기열)을 같은 도구와 같은 지표로 해 보기 |

숫자(지연, 처리량 절대값)는 GPU 환경과 다르지만, 곡선의 모양, 병목이 생기는 이유, 운영 절차는 같다고 보고 진행하고 있습니다.

## 진행 경과

{{< flow >}}
title: "진행 경과 · 단계를 눌러 보세요"
steps:
  - title: "리서치 · 설계"
    sub: "2026.09 초"
    detail: "기술 리서치로 blocker 15개와 risk 8개, 버전 고정 표를 정리하고, 실제 HCL과 values를 담은 상세 설계 문서(4,099줄)를 썼습니다. 처음 계획한 노트북 VM 환경을 이 단계에서 물리 서버로 바꿨습니다."
  - title: "프리플라이트"
    sub: "2026.09.23"
    detail: "서버와 노트북 상태를 읽기 전용으로 수집하고, 사람이 Go/No-Go를 판단한 결과를 Terraform 입력값으로 썼습니다."
  - title: "구축"
    sub: "Terraform · Ansible · ArgoCD"
    detail: "VM, 네트워크, 디스크는 Terraform으로, 노드 OS부터 ArgoCD 첫 설치까지는 Ansible로 세우고, 나머지 플랫폼 부품은 ArgoCD가 설치하게 했습니다(Application 21개, ApplicationSet 2개). 2026.09.23부터 10.14까지 커밋 148개, PR 77번까지 진행했습니다."
  - title: "배포 창구"
    sub: "IssueOps"
    detail: "개발자가 이슈 양식만으로 새 앱, dev 배포, 운영 승격, 되돌리기, 삭제를 요청하는 창구를 붙였습니다."
  - title: "아키텍처 리뷰"
    sub: "2026.10.13"
    detail: "지금 시스템을 다시 점검해 high 1건, medium 16건을 찾았습니다. 알림 문제는 바로 고쳤습니다."
  - title: "추론 · 학습"
    sub: "2026.10.14"
    tone: "ok"
    detail: "서빙 엔진을 vLLM으로 정하고 부하를 늘려 가며 기준선을 재서 SLO를 정했습니다. LoRA 학습 결과를 서빙까지 잇는 고리도 한 바퀴 돌렸습니다."
  - title: "다음: 자동 확장"
    sub: "진행 예정"
    tone: "warn"
    detail: "대기 요청 수로 서빙 Pod를 늘리고, 시작 시간 약 2분(컴파일, 예열)을 줄이는 단계입니다."
{{< /flow >}}

## 설계에서 내린 판단

| 판단 | 대안 | 고른 이유 |
|---|---|---|
| 노트북 VM 대신 물리 서버 1대 | 노트북(24GB) + VM 3대 | 노트북 가상 네트워크는 외부로 나가는 트래픽을 모두 NAT해서 egress gateway를 검증할 방법이 없었습니다. 메모리도 ArgoCD, 관측 스택만 약 19GB로 가용 18GB를 넘었습니다. |
| libvirt network를 `route` 모드로 | 기본 `nat` 모드 | `nat`은 Pod에서 관측점으로 가는 트래픽 출발지를 브리지 IP로 바꿔서, egress gateway가 동작하지 않는 것과 증상이 구별되지 않습니다. |
| Cilium은 GitOps 밖에 둠 | ArgoCD로 함께 관리 | ArgoCD가 CNI를 잘못 반영하면 클러스터 네트워크가 끊겨 ArgoCD 스스로 복구할 수 없습니다. |
| MinIO와 관측 작업 공간은 노드 local 디스크에 | 모두 Longhorn 위에 | Longhorn에 장애가 나도 그 장애를 관측할 수 있어야 합니다. 순환 의존과 쓰기 증폭도 피합니다. |
| 비밀값은 클러스터 밖에 둠 | sealed-secrets | sealed-secrets 키는 클러스터 안에 있어서 클러스터를 지우면 저장소의 비밀값을 영영 풀 수 없습니다. 설계는 sops + age로 암호화해 Git에 두는 것이었지만, 지금은 Git에서 제외한 노트북 로컬 파일이라 리뷰에서 남은 과제로 잡혔습니다. |
| 하이퍼바이저에 Docker 미설치 | 설치 | Docker가 거는 `FORWARD DROP` 정책이 노드 간 VXLAN을 막고, 증상이 Cilium 고장과 구별되지 않습니다. |
| 메트릭 수집은 Prometheus 하나만 | Alloy도 함께 scrape | 둘 다 수집하면 Mimir에 같은 series가 두 번 저장됩니다. Alloy는 로그와 트레이스만 맡겼습니다. |

### 설계와 달라진 것

| 항목 | 처음 설계 | 실제 |
|---|---|---|
| 노드 | server 1 + agent 3 | control plane 3 + worker 3 (etcd 3대 정족수) |
| 구축 방식 | 부트스트랩 스크립트 | Ansible playbook |
| Cilium envoy | 끔 | Gateway API를 쓰려고 켬 |
| Longhorn 복제 | 3 | 2 |
| 비밀값 | sops + age | Git에서 제외한 로컬 파일 (남은 과제) |
| 앱 배포 | 없음 | IssueOps 창구 추가 |

## 리서치에서 찾은 함정

설치 전에 차트 기본값과 알려진 문제를 먼저 조사했습니다. 그대로 설치했다면 조용히 실패했을 것들입니다.

| 대상 | 찾은 것 | 대응 |
|---|---|---|
| Mimir | 기본 차트가 요청 메모리만 5.7GiB이고 Kafka와 두 번째 MinIO까지 끌고 옴 | monolithic, 구성 요소 7개를 직접 지정, 멀티테넌시 끔 |
| Loki | 기본값이 memcached에 약 11GiB, single binary 복제 수 0이 기본이라 Pod가 0개 | 값을 직접 지정 |
| Grafana 차트 | 4개 중 3개가 옛 저장소에서 deprecated, `grafana/loki`는 Enterprise 차트 | Helm 저장소를 둘로 나눔 |
| MinIO | OSS가 보관 처리됐고 마지막 이미지에 권한 상승 CVE 수정이 없음 | 유지되는 포크 이미지로 교체 |
| Egress Gateway | 노드 상태로 넘어가지 않음, VM을 꺼도 Node 객체가 남으면 failover 안 됨 | 측정값으로 기록하고, 노드 라벨 이동으로 판정 |
| Tempo | 차트에 환경 변수 치환 옵션이 없어 S3 인증 실패 | 설정 추가 |
| L2 Announcements | 베타 기능, IP 풀과 L2 정책의 API 버전이 다름 | 매니페스트에서 버전을 나눠 씀 |
| GitOps와 CNI | ArgoCD가 처음 만나는 Helm release는 항상 upgrade, CNI가 깨지면 스스로 복구 불가 | Cilium을 GitOps 밖에 둠 |

설계 원칙은 "틀렸을 때 시끄럽게 틀린다"였습니다. 예를 들어 관측 namespace의 PVC가 누군가의 선의로 Longhorn으로 바뀌어도 검증이 잡도록 storageClass를 매번 확인하게 설계했습니다.

## 설치 순서 (sync-wave)

{{< flow >}}
title: "ArgoCD 설치 순서 · 단계를 눌러 보세요"
steps:
  - title: "ArgoCD · 기반"
    sub: "wave −10 · 5"
    detail: "ArgoCD 자신, cert-manager, 스케줄링 우선순위를 먼저 둡니다."
  - title: "저장소"
    sub: "wave 10 · 20 · 25"
    detail: "Longhorn과 local-path, 그 위에 MinIO, Longhorn 백업 설정 순서입니다."
  - title: "관측 · 이미지"
    sub: "wave 30 · 35 · 40 · 45"
    detail: "kube-prometheus-stack과 Harbor, Mimir, Loki와 Tempo, Alloy 순서로 올립니다."
  - title: "대시보드"
    sub: "wave 50"
    detail: "Grafana 대시보드를 넣습니다."
  - title: "워크로드"
    sub: "wave 60 · 65"
    tone: "ok"
    detail: "HotROD, vLLM 서빙, 학습 namespace를 올리고 Gateway를 엽니다."
  - title: "앱 창구"
    sub: "wave 70"
    detail: "배포 현황 포털과 앱 배포용 ApplicationSet을 마지막에 둡니다."
{{< /flow >}}

| 구성 요소 | 버전 |
|---|---|
| K3s | v1.36.4 |
| Cilium | 1.20.2 (kube-proxy 대체, VXLAN, BPF masquerade, Egress Gateway, L2 announcements) |
| ArgoCD | v3.5.2 (차트 10.8.1) |
| Longhorn | 1.12.1 |
| Mimir | 3.2.1 (series 한도 50만, 실측 약 20.5만, 보관 30일) |
| vLLM | 0.31.0 (CPU) |

## 전체 구조

{{< arch >}}
title: "K3s 검증 환경 구조 · 구성 요소를 눌러 보세요"
layers:
  - name: "진입"
    items:
      - name: "HAProxy"
        detail: "물리 서버에서 사내망 입구 역할을 합니다. 포트별로 LoadBalancer IP에 연결합니다."
      - name: "Cilium LB-IPAM"
        detail: "LoadBalancer IP를 나눠 주고 서비스로 연결합니다."
      - name: "Gateway API"
        detail: "앱 공용 입구입니다. dev는 /dev/<앱>, prod는 /<앱> 경로로 받습니다."
  - name: "워크로드"
    tool: "apps-workload"
    items:
      - name: "vLLM 추론"
        detail: "SmolLM2-135M 모델을 CPU로 서빙합니다. 모델 파일은 MinIO에서 받고, OpenAI 호환 API로 엽니다."
      - name: "LoRA 학습 Job"
        detail: "train namespace에서 LoRA 학습 Job을 실행합니다. namespace 한도는 CPU 8, 메모리 16Gi입니다."
      - name: "개발자 앱"
        detail: "IssueOps로 요청받아 dev와 prod에 배포합니다."
  - name: "플랫폼"
    tool: "ArgoCD · Application 21 + ApplicationSet 2"
    items:
      - name: "ArgoCD"
        detail: "저장소의 정의를 보고 나머지 플랫폼 부품을 sync-wave 순서로 설치합니다. Application 21개와 앱 배포용 ApplicationSet 2개입니다."
      - name: "Harbor"
        detail: "앱 이미지와 학습 이미지 저장소입니다."
      - name: "Grafana LGTM"
        detail: "메트릭은 Prometheus에서 Mimir로, 로그는 Alloy에서 Loki로, 트레이스는 OTLP로 Tempo에 모아 Grafana에서 함께 봅니다."
      - name: "Longhorn"
        detail: "앱 PVC용 저장소입니다. 복제 2, 6시간마다 스냅샷(4개 보관), 매일 02시 MinIO로 백업(7개 보관)합니다."
      - name: "MinIO"
        detail: "관측 데이터 장기 보관, 이미지, 백업, 모델, 학습 데이터, 체크포인트를 S3 하나로 모읍니다."
  - name: "노드"
    tool: "K3s · Cilium"
    items:
      - name: "Control plane × 3"
        detail: "4 vCPU, 8GiB. K3s server와 etcd 3대 정족수입니다. 앱은 올리지 않습니다."
      - name: "Worker × 3"
        detail: "8 vCPU, 24GiB. 앱과 플랫폼 부품이 올라가고 Longhorn 80G 디스크 1개와 MinIO 30G 디스크 2개를 가집니다."
      - name: "관측 노드 × 1"
        detail: "2 vCPU, 2GiB. 클러스터에 join하지 않는 바깥 관측점입니다. egress gateway가 실제로 동작하는지 밖에서 확인하는 용도입니다."
  - name: "기반"
    tool: "Terraform · Ansible"
    items:
      - name: "물리 서버 1대"
        detail: "48 thread, 125GiB. libvirt로 VM 7대를 띄웁니다. VM, 네트워크, 디스크는 Terraform으로 만듭니다."
      - name: "Ansible"
        detail: "노드 OS, K3s, Cilium, ArgoCD 첫 설치, 비밀값을 맡습니다."
{{< /arch >}}

## 누가 무엇을 바꾸는지

| 대상 | 바꾸는 도구 |
|---|---|
| VM, 네트워크, 디스크 | Terraform |
| 노드 OS, K3s, Cilium, ArgoCD 첫 설치, 비밀값 | Ansible |
| 저장소, 관측, Harbor, Gateway 같은 플랫폼 부품 | ArgoCD (저장소에 파일을 넣고 push) |
| 서빙, 포털 같은 플랫폼 워크로드 | ArgoCD |
| 학습 Job | 손으로 제출 (자리와 한도는 ArgoCD) |
| 개발자 앱 | IssueOps |

다시 세우는 순서는 `make ansible-deps → host-prepare → infra → k3s → cilium → argocd → secrets`이고, 그 뒤는 ArgoCD가 sync-wave 순서로 이어 받습니다.

## 저장소 구성

| 층 | 쓰는 곳 | 이유 |
|---|---|---|
| Longhorn (복제 2) | 앱 PVC | 노드가 죽어도 데이터 유지, 6시간 스냅샷, 매일 MinIO 백업 |
| local-path (노드 디스크) | Prometheus, Tempo 등 관측 작업 공간 | Longhorn에 문제가 생겨도 관측은 계속되어야 함 |
| MinIO (워커 3대 × 드라이브 2개, EC:3) | 로그·트레이스·메트릭 장기 보관, 이미지, 백업, 모델, 학습 데이터 | S3 하나로 통일, 쓸 수 있는 용량 약 87GiB |

## 앱 배포 창구 (IssueOps)

{{< flow >}}
title: "IssueOps 배포 흐름 · 단계를 눌러 보세요"
steps:
  - title: "요청 이슈"
    sub: "새 앱 · 배포 · 승격 · 되돌리기"
    detail: "개발자는 저장소 이슈 양식으로 새 앱, dev 배포, 운영 승격, 되돌리기, 삭제를 요청합니다. kubectl과 YAML은 몰라도 됩니다."
  - title: "self-hosted runner"
    detail: "자동화가 요청을 읽고 배포 값을 만듭니다. 권한은 GitHub App 두 개(배포용, 저장소 생성용)로 나눴습니다."
  - title: "배포 값 저장소"
    sub: "dev 자동 · prod 승인"
    detail: "dev 변경은 바로 merge되고, prod 변경은 담당자 승인을 거칩니다."
  - title: "ArgoCD ApplicationSet"
    detail: "배포 값 저장소의 dev와 prod 경로를 읽어 앱을 만듭니다. 값을 지우면 앱도 내려갑니다."
  - title: "반영 확인"
    tone: "ok"
    sub: "커밋 · 이미지 · rollout · HTTP 200"
    detail: "ArgoCD가 그 커밋을 실제로 반영했는지, 이미지와 rollout, HTTP 200까지 스크립트로 확인합니다. dev에서 확인이 실패하면 자동으로 되돌립니다."
{{< /flow >}}

| 요청 | 하는 일 | 승인 |
|---|---|---|
| 새 앱 만들기 | 템플릿으로 앱 저장소 생성, main 보호와 CODEOWNERS 설정, dev 배포까지 자동 | 없음 |
| dev 배포 | merge된 커밋을 빌드해 dev에 반영, 확인 실패면 자동 되돌림 | 없음 |
| 운영 승격 | dev에서 정상인 이미지와 설정을 그대로 prod로 | 담당자 |
| 되돌리기 | 이전 이미지로, 버전을 비우면 바로 이전 버전 | prod만 담당자 |
| 앱 삭제 | dev·prod에서 내리고 앱 저장소를 보관 처리 | prod만 담당자 |

- 결과는 같은 이슈에 댓글과 메일로 오고, 배포 현황은 포털에서 30초마다 새로 읽어 보여 줍니다.
- 앱이 지킬 약속(PORT, `/healthz`, SIGTERM 처리, 일반 사용자 실행, 비밀값 금지)을 템플릿에 문서로 두고, 앱 저장소 CI가 이 약속을 검사해야 merge됩니다.

## 관측

- 메트릭은 Prometheus에서 Mimir로, 로그는 Alloy에서 Loki로, 트레이스는 OTLP로 Tempo에 모아 Grafana에서 함께 봅니다.
- Alertmanager가 사내 메일로 알림을 보내고, 앱 5xx 에러율 알림과 앱 대시보드, vLLM 대시보드를 만들었습니다.

## 검증 설계

- 프리플라이트는 서버에 아무것도 쓰지 않고 상태만 수집합니다. 하나라도 실패하면 진행하지 않는 항목 7개(KVM, sudo, 파일시스템, 레지스트리 도달, SSH 포워딩, 자원 할당 승인, libvirt 권한)와 경고만 하는 항목 10개로 나눴습니다. 기계가 만든 결과(증거)와 사람이 리뷰한 입력값(결정)을 파일로 나눠 나중에 감사할 수 있게 했습니다.
- `terraform apply` 전과 서버 재부팅 후에는 드리프트 검사를 돌립니다. 커널 업그레이드처럼 내가 바꾸지 않은 요인으로 어제 되던 랩이 오늘 안 되는 경우를 잡기 위해서입니다.
- 핵심 증명은 세 가지로 설계했습니다. 아직 실행 전입니다. egress 정책은 0개이고, fault injector도 아직 만들지 않았습니다.

{{< tabs >}}
title: "핵심 증명 세 가지 · 탭을 바꿔 보세요"
items:
  - label: "Egress Gateway"
    steps: ["정책 없음 → 노드 IP", "정책 적용 → egress IP", "같은 Pod에서 정책만 삭제 → 다시 노드 IP"]
    text: "같은 Pod, 같은 노드에서 정책만 넣고 빼서, 관측점이 보는 출발지 IP가 바뀐 원인이 정책이라는 것을 고정합니다."
  - label: "metric → trace → log"
    steps: ["알려진 trace ID로 요청 1건", "Tempo · Loki · Mimir에서 같은 ID 조회", "Grafana 링크 자체도 확인"]
    text: "HotROD 샘플 앱과 짧은 fault injector로 요청 하나를 세 저장소에서 함께 찾아갑니다."
  - label: "Longhorn 장애 관측"
    tone: "warn"
    steps: ["Longhorn 제어면 · 데이터면 정지", "마운트에서 실제 I/O 오류 확인", "그동안 메트릭 표본 나이로 수집 지속 확인"]
    text: "관측 평면을 Longhorn 밖에 둔 이유를 장애 중에 증명합니다. 최근 표본의 나이로 확인해야 수집이 멈춘 상태를 놓치지 않습니다."
{{< /tabs >}}

- 검증은 smoke(6분 이내), full(70분 이내), chaos(100분 이내, 직렬) 세 단계로 나눴습니다. 자동 검증 스크립트는 아직 만들지 못했고, 아키텍처 리뷰에서도 남은 과제로 잡혀 있습니다.

## 추론: vLLM 기준선과 SLO

서빙 엔진은 현업 LLM 서빙 표준인 vLLM(CPU 이미지)으로 정했습니다. 모델은 SmolLM2-135M 하나만 씁니다. 더 큰 모델은 CPU에서 너무 느려 부하 시험이 성립하지 않아서, 압박은 CPU 한도로 만들었습니다.

같은 조건(입력 256, 출력 128 토큰, 동시 8, CPU 4)에서 엔진을 비교했습니다.

| 엔진 | 출력 tok/s | TTFT 평균 | TPOT 평균 | 시작 |
|---|---|---|---|---|
| vLLM bf16 | 46 | 1.4초 | 165ms | 약 2분 |
| vLLM fp32 | 48 | 5.9초 | 122ms | 약 1분 45초 |
| llama.cpp Q8 | 133 | 3.4초 | 29ms | 몇 초 |

처리량은 llama.cpp가 높았지만, 지표와 설정, 측정 도구가 현업과 같은 vLLM을 골랐습니다.

이어서 vLLM Pod 1개(CPU 4, 메모리 6Gi)에 동시 요청을 1에서 32까지 늘리며 `vllm bench serve`로 쟀습니다.

| 동시 | 출력 tok/s | TTFT p50 / p95 | TPOT p50 / p95 |
|---|---|---|---|
| 1 | 16 | 1.3초 / 3.7초 | 47 / 48ms |
| 2 | 32 | 0.37초 / 0.48초 | 60 / 63ms |
| 4 | 48 | 0.75초 / 0.79초 | 77 / 81ms |
| 8 | 39 | 1.4초 / 8.6초 | 166 / 197ms |
| 16 | 55 | 2.2초 / 16초 | 228 / 285ms |
| 32 | 66 | 4.3초 / 31초 | 345 / 536ms |

- 꺾이는 지점은 동시 4에서 8 사이입니다. p95 TTFT가 0.8초에서 8.6초로 뛰고, 처리량은 오히려 줄었습니다.
- 대기 요청은 동시 32 전까지 0이었고 KV 캐시도 7%만 썼습니다. 줄이 막히거나 메모리가 모자란 문제는 아니었습니다.
- vLLM은 받을 수 있는 만큼 받고 모두 함께 느려졌습니다(실패 0). llama.cpp는 처리 칸이 정해져 있어 5번째 요청부터 줄을 섰습니다.
- 동시 1의 p95 TTFT 3.7초는 시작 직후 첫 요청들의 컴파일 때문이었습니다. 예열 없이 Ready가 되면 첫 사용자가 느립니다.

그래서 SLO를 TTFT p95 1초 이하, TPOT p95 100ms 이하, 에러율 0%로 정하고, Pod 하나의 용량을 동시 4로 잡았습니다. 다음 단계의 자동 확장 기준은 Pod당 실행 중 요청이 4를 넘기 전에 늘리는 것입니다.

## 학습: LoRA 결과를 서빙까지

{{< flow >}}
title: "학습에서 서빙까지 · 단계를 눌러 보세요"
steps:
  - title: "학습 Job"
    sub: "약 2분"
    detail: "train namespace에서 LoRA 학습 Job을 실행하고 adapter를 MinIO 체크포인트에 남깁니다."
  - title: "등록 Job"
    sub: "합치기 · 올리기"
    detail: "adapter를 원래 모델과 합쳐 Hugging Face 형식으로 MinIO 모델 경로에 올립니다."
  - title: "모델 변경 PR"
    detail: "서빙 설정의 MODEL 값을 바꾸는 PR을 merge합니다."
  - title: "새 Pod"
    sub: "준비 약 2분"
    tone: "ok"
    detail: "ArgoCD가 반영하면 새 모델로 서빙 Pod가 뜹니다. 되돌리기는 그 커밋을 revert하면 됩니다."
{{< /flow >}}

- 학습 Job은 PriorityClass `batch-low`로 두어 추론(`inference`)에 자원을 양보하게 했습니다.
- 학습 이미지는 torch CPU와 peft로 만들어 Harbor에 올렸고, 데이터와 체크포인트는 각각 10GiB 한도를 둔 전용 계정으로만 씁니다.

## 아키텍처 리뷰에서 찾은 것

2026.10.13에 지금 시스템을 다시 점검했습니다. 6개 관점 모두 5점 만점에 3점으로, "한 번 세워서 잘 돌고 있는 랩" 단계라는 판정이었습니다.

| 잘 되고 있던 것 | 근거 |
|---|---|
| 인프라 드리프트 없음 | VM을 만든 지 19일 뒤에도 `terraform plan`이 No changes |
| 앱 격리 | 앱 namespace에 Pod Security restricted, 읽기 전용 root 파일시스템, capability 전부 제거 |
| 저장소 경계 | 관측 PVC 6개는 모두 local-path, MinIO PVC 6개는 모두 전용 local PV |
| 여유 자원 | 워커 CPU 사용률 3~5% |

정석과 다르거나 과한 부분도 적었습니다. 모든 Application이 기본 AppProject에 있고, 이미지를 digest가 아니라 태그로 고정하며, egress gateway 장치는 다 깔았지만 정책이 0개이고, IssueOps 자동화 약 1,650줄에 테스트가 없습니다.

고칠 것은 우선순위로 정리했습니다.

| 우선순위 | 찾은 것 | 상태 |
|---|---|---|
| high | 빈 클러스터에서 다시 세우면 Cilium 설치가 실패함. Cilium 설정이 쓰는 ServiceMonitor CRD를 ArgoCD가 나중에 설치하는 순서 문제 | 고칠 예정 |
| medium | 알림 수신처가 비어 있음 | 사내 메일로 고침, 앱 5xx 알림 추가 |
| medium | 추론 워크로드에 지연·에러율 지표가 없음 | vLLM 지표와 대시보드로 고침 |
| medium | 학습 워크로드를 올릴 자리가 없음 | train namespace와 한도로 고침 |
| medium | Harbor 보관 정책(최근 10개)이 prod가 쓰는 이미지를 지울 수 있음 | 고칠 예정 |
| medium | 게스트 커널이 무인 업그레이드로 바뀌고 있음 | 고칠 예정 |
| medium | 백업을 되돌려 본 적이 없음 | 복원 훈련 예정 |
| medium | 자동 검증(smoke)이 없음 | 만들 예정 |
| medium | dev 앱이 인증 없는 이미지 창고와 평평한 클러스터망으로 플랫폼에 닿을 수 있음 | 고칠 예정 |

## 앞으로 할 것

{{< tabs >}}
title: "다음 시나리오 · 탭을 바꿔 보세요"
items:
  - label: "서빙"
    steps: ["S2 자동 확장 · 콜드 스타트", "S3 모델 카나리", "S4 멀티 LoRA", "S5 보호 장치", "S6 부하 중 장애"]
    text: "대기 요청 수로 확장하고 시작 2분을 줄인 뒤, 새 모델에 트래픽 10%를 보내 나쁘면 자동으로 되돌리고, adapter 여러 개를 한 모델로 서빙하고, 사용자별 요청 제한과 부하 중 Pod 삭제·노드 drain 훈련까지 이어 갑니다."
  - label: "학습 · 배치"
    steps: ["T1 Kueue + 가짜 GPU", "T2 체크포인트 재개", "T3 파이프라인", "T4 평가 게이트", "T5 MLflow", "T6 분산 학습"]
    text: "노드에 가짜 GPU 자원을 등록해 Kueue로 팀별 할당량·빌려 쓰기·선점을 해 보고, 끊긴 학습 이어 하기, Argo Workflows 파이프라인, 평가 게이트, 실험 추적, gloo 분산 학습 구조까지 확인합니다."
  - label: "이 랩 밖"
    tone: "warn"
    steps: ["GPU 메모리 용량 계획", "MIG · time-slicing", "NCCL · InfiniBand", "GPU 노드 자동 증설"]
    text: "GPU가 있어야 하는 부분은 이 랩에서 할 수 없습니다. H200 클러스터 운영 경험과 이어서 GPU 환경에서 따로 확인할 계획입니다."
{{< /tabs >}}

## 알게 된 점

- 다시 세우는 순서도 검증 대상이었습니다. 처음 설치할 때는 없던 설정이 나중에 추가되면서, 지금 클러스터는 돌지만 빈 클러스터에서는 실패하는 상태가 생겼습니다.
- 증상이 같은 원인이 여럿인 경우가 많았습니다. NAT 모드, Docker의 방화벽 정책, 브리지 필터 설정은 모두 Cilium 고장처럼 보여서, 설계 단계에서 미리 제거했습니다.
- 서빙 성능은 처리량 하나로 보면 안 됐습니다. 처리량이 비슷해도 TTFT p95는 10배 넘게 차이가 났고, SLO는 꺾이는 지점을 보고 정해야 했습니다.
