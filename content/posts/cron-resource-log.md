---
title: "1분 cron으로 서버 자원 기록하기 (알림 전 1단계)"
date: 2026-10-21
categories: ["linux"]
---

## 문제

컨테이너 수십 개가 도는 서버에서 OOM 흔적이 나왔다. 살펴보니 로그 크기 제한이 없는
컨테이너, 메모리 상한이 없는 컨테이너가 많았다.

목표는 "죽은 걸 감지"가 아니라 **CPU·메모리·디스크가 차기 전에 아는 것**.
그런데 임계값을 정하려면 평소 추세부터 알아야 한다.

## 해결

1단계로 **알림 없이 기록만** 하는 1분 cron을 넣었다.

- 날짜별 CSV 3종: 호스트(CPU·메모리·디스크), 컨테이너별 사용량, docker 디스크 사용량
- 7일 지난 파일은 스스로 지운다
- 1~2일 쌓이면 증가 추세를 보고 경고 임계값을 정한 뒤 알림을 붙인다 (2단계)

### 설치 전 백업, 롤백 한 줄

```bash
crontab -l > ~/crontab.before-resmon          # 백업
(crontab -l; echo '* * * * * $HOME/resmon/collect.sh >/dev/null 2>&1 # resmon-collect') | crontab -

# 롤백
crontab ~/crontab.before-resmon && rm -rf ~/resmon
```

- 줄 끝에 `# resmon-collect` 같은 태그 주석을 달아 두면 나중에 찾거나 지우기 쉽다.

### 수집 스크립트 (예시, 요지만)

```bash
#!/bin/bash
# 1분마다 호스트·컨테이너 자원을 날짜별 CSV에 붙인다.
set -u
PATH=/usr/local/bin:/usr/bin:/bin           # cron은 PATH가 짧다
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

# docker 디스크: 종류, 크기, 회수 가능
docker system df --format '{{.Type}},{{.Size}},{{.Reclaimable}}' \
  | sed "s/^/$TS,/" >> "$DIR/dockerdf-$DAY.csv"

find "$DIR" -name '*.csv' -mtime +7 -delete
```

## 메모

- cron 안에서는 PATH가 짧아 `docker`를 못 찾는 경우가 있다. 스크립트 안에서 PATH를 정하거나 전체 경로를 쓴다.
- 계정 권한에 따라 `/var/log/cron`이나 docker 데이터 폴더(컨테이너 로그 실제 크기)를 못 읽을 수 있다. 무엇을 못 보는지 먼저 확인해 둔다.
- 생각해 볼 것: docker 명령이 멈추면 다음 cron이 겹쳐 쌓인다. `flock -n /tmp/resmon.lock collect.sh`로 겹침을 막을 수 있다.
