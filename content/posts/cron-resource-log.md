---
title: "1분 cron으로 서버 자원 기록하기"
description: "OOM 흔적이 나온 서버에 알림 없이 기록만 하는 1분 cron을 넣어, 임계값을 정하기 전에 자원 추세부터 모은 과정"
date: 2026-10-21
categories: ["linux"]
---

## 문제

컨테이너 수십 개가 실행되는 서버에서 OOM 흔적이 발견됐습니다. 확인해 보니 로그 크기 제한이 없는 컨테이너와 메모리 상한이 없는 컨테이너가 많았습니다.

장애가 난 뒤에 감지하기보다 CPU, 메모리, 디스크가 차기 전에 미리 알고 싶었습니다. 다만 임계값을 정하려면 평소 추세부터 알아야 했습니다.

## 해결

1단계로 알림 없이 기록만 하는 1분 간격 cron을 설치했습니다.

- 날짜별 CSV 3종: 호스트(CPU, 메모리, 디스크), 컨테이너별 사용량, docker 디스크 사용량
- 7일이 지난 파일은 자동으로 삭제
- 1~2일 정도 쌓이면 증가 추세를 보고 경고 임계값을 정한 뒤 알림을 붙일 계획(2단계)

### 설치 전 백업과 롤백

```bash
crontab -l > ~/crontab.before-resmon          # 백업
(crontab -l; echo '* * * * * $HOME/resmon/collect.sh >/dev/null 2>&1 # resmon-collect') | crontab -

# 롤백
crontab ~/crontab.before-resmon && rm -rf ~/resmon
```

- 줄 끝에 `# resmon-collect` 같은 태그 주석을 달아 두면 나중에 찾거나 지우기 쉽습니다.

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

## 메모

- cron 환경에서는 PATH가 짧아서 `docker`를 찾지 못할 수 있습니다. 스크립트 안에서 PATH를 지정하거나 전체 경로를 씁니다.
- 계정 권한에 따라 `/var/log/cron`이나 docker 데이터 폴더(컨테이너 로그 실제 크기)를 읽지 못할 수 있으니, 볼 수 없는 항목을 먼저 확인해 둡니다.
- docker 명령이 멈추면 다음 cron 실행이 겹칠 수 있습니다. `flock -n /tmp/resmon.lock collect.sh`로 막을 수 있습니다.
