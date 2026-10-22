---
title: "1분 cron으로 서버 자원 기록하기"
description: "OOM 흔적이 나온 서버에 1분 cron으로 자원 기록부터 시작해, 추세를 보고 CPU·load 알림과 일일 리포트 메일까지 붙인 과정"
date: 2026-10-21
categories: ["linux"]
---

## 문제

컨테이너 수십 개가 실행되는 팀 배포 서버에서 OOM 흔적이 발견됐습니다. 확인해 보니 로그 크기 제한(`max-size`)이 없는 컨테이너가 27개, 메모리 상한이 없는 컨테이너가 34개였습니다. 어느 컨테이너 하나가 메모리나 로그로 서버를 채우면 같은 서버의 다른 서비스까지 함께 멈출 수 있는 상태였습니다.

장애가 난 뒤에 감지하기보다 CPU, 메모리, 디스크가 차기 전에 미리 알고 싶었습니다. 다만 임계값을 정하려면 평소 추세부터 알아야 했습니다. 그래서 기록과 알림을 두 단계로 나눠 진행했습니다.

## 전체 구성

{{< flow >}}
title: "수집과 정리 흐름 · 단계를 눌러 보세요"
note: "2단계로 추세 확인과 임계값 알림, 매일 18:30 리포트 메일을 붙였습니다."
steps:
  - title: "cron"
    sub: "1분 간격"
    detail: "cron이 1분마다 collect.sh를 실행합니다."
  - title: "collect.sh"
    detail: "호스트와 컨테이너 자원을 한 번에 읽어 날짜별 CSV에 한 줄씩 붙입니다."
  - title: "CSV 3종"
    sub: "host · ctr · dockerdf"
    detail: "host CSV에는 load·메모리·디스크, ctr CSV에는 컨테이너별 CPU·메모리, dockerdf CSV에는 이미지·볼륨·캐시 용량을 남깁니다."
  - title: "7일 보관"
    detail: "7일이 지난 파일은 지워 디스크를 채우지 않게 했습니다."
  - title: "알림 · 리포트"
    tone: "ok"
    sub: "2단계"
    detail: "추세와 임계값을 보고 CPU·load 알림 메일을 보내고, 매일 18:30 리포트 메일을 보냅니다."
{{< /flow >}}

| 단계 | 내용 |
|---|---|
| 1단계: 기록 | 알림 없이 1분마다 CSV로만 남김, 7일 보관 |
| 2단계: 알림 | 쌓인 추세로 기준을 정해 CPU·load 알림, 매일 그래프 리포트 |

## 1단계: 기록만 하는 cron

### 설치 전 백업과 롤백

```bash
crontab -l > ~/crontab.before-resmon          # 백업
(crontab -l; echo '* * * * * $HOME/resmon/collect.sh >/dev/null 2>&1 # resmon-collect') | crontab -

# 롤백
crontab ~/crontab.before-resmon && rm -rf ~/resmon
```

- 줄 끝에 `# resmon-collect` 같은 태그 주석을 달아 두면 나중에 찾거나 지우기 쉽습니다.
- 기존 crontab을 먼저 파일로 남겨 두면, 다른 사람이 등록한 작업을 건드리지 않고 되돌릴 수 있습니다.

### 수집 스크립트 (요지)

```bash
#!/bin/bash
# 1분마다 호스트와 컨테이너 자원을 날짜별 CSV에 추가
set -u
PATH=/usr/local/bin:/usr/bin:/bin           # cron은 PATH가 짧음
DIR="$HOME/resmon/data"; mkdir -p "$DIR"
TS=$(date '+%F %T'); DAY=$(date +%Y%m%d)

# 호스트: load1, 메모리 사용·가용(MB), / 사용률
read -r load1 _ < /proc/loadavg
mem=$(free -m | awk '/^Mem:/ {print $3","$7}')
disk=$(df -P / | awk 'NR==2 {print $5}')
echo "$TS,$load1,$mem,$disk" >> "$DIR/host-$DAY.csv"

# 컨테이너별: 이름, CPU%, 메모리
docker stats --no-stream --format '{{.Name}},{{.CPUPerc}},{{.MemUsage}}' \
  | sed "s/^/$TS,/" >> "$DIR/ctr-$DAY.csv"

# docker 디스크: Type, Size, Reclaimable
docker system df --format '{{.Type}},{{.Size}},{{.Reclaimable}}' \
  | sed "s/^/$TS,/" >> "$DIR/dockerdf-$DAY.csv"

find "$DIR" -name '*.csv' -mtime +7 -delete
```

### 남기는 값

| 파일 | 열 | 쓰는 곳 |
|---|---|---|
| host | 시각, load1, 메모리 사용, 메모리 가용, `/` 사용률 | 서버 전체 추세 |
| ctr | 시각, 컨테이너 이름, CPU%, 메모리 사용/한도 | 메모리 상한 없는 컨테이너 찾기 |
| dockerdf | 시각, 종류, 크기, 회수 가능 용량 | 이미지·볼륨·빌드 캐시 증가 확인 |

## 2단계: 알림과 리포트

기록이 쌓인 뒤 평소 수준을 보고 알림 기준을 정했습니다. 알림과 리포트는 같은 서버의 [보안·자원 점검 도구](/work/ops-platform/)에 합쳤습니다.

| 자원 | 주의 | 위험 |
|---|---|---|
| 여유 메모리 | 20% 미만 | 10% 미만 |
| 디스크 사용률 | 80% 이상 | 90% 이상 |
| CPU | | 90% 이상 |
| iowait | | 40% 이상 |
| load (15분) | | CPU 수 × 2 이상 |
| 컨테이너 재시작 | 1회 이상 | 20회 이상 |
| 무재부팅 가동 | 365일 초과 | |


- CPU와 load가 기준을 넘으면 알림 메일을 보냅니다.
- 같은 위험은 한 번만 알리고, 하루 넘게 사라졌다가 다시 나타나면 다시 알립니다. 1분마다 같은 메일이 오지 않게 하기 위해서입니다.
- 매일 18:30에 그래프가 들어간 자원 리포트를 보냅니다. 리포트 맨 위에는 사내 LLM으로 만든 한 줄 요약을 넣었습니다. 요약이 120자를 넘거나 입력에 없는 숫자가 들어가면 버리고 규칙 기반 문장을 씁니다.
- 메일에는 문제가 있는 컨테이너만 나열하고, 제목 맨 앞에 상태를 두고 날짜를 붙여서 메일 목록에서도 바로 구분되게 했습니다.

## 메모

- cron 환경에서는 PATH가 짧아서 `docker`를 찾지 못할 수 있습니다. 스크립트 안에서 PATH를 지정하거나 전체 경로를 씁니다.
- 계정 권한에 따라 `/var/log/cron`이나 docker 데이터 폴더(컨테이너 로그 실제 크기)를 읽지 못할 수 있으니, 볼 수 없는 항목을 먼저 확인해 둡니다.
- docker 명령이 멈추면 다음 cron 실행이 겹칠 수 있습니다. `flock -n /tmp/resmon.lock collect.sh`로 막을 수 있습니다.
- 처음부터 알림을 붙이지 않고 기록부터 시작한 덕분에, 기준값을 감으로 정하지 않아도 됐습니다.
