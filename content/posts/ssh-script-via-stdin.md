---
title: "csh 환경에서 ssh 원격 명령이 깨질 때"
description: "점프 서버 로그인 셸이 csh라 따옴표가 깨질 때, 명령 대신 스크립트를 stdin으로 넘겨 해결한 방법과 다른 방식 비교"
date: 2026-10-21
categories: ["shell"]
---

## 문제

점프 서버를 거쳐 대상 서버에 명령을 보내야 했습니다. 그런데 점프 서버의 로그인 셸이 csh라서, 따옴표를 겹쳐 쓴 명령이 중간에서 다르게 해석되어 깨졌습니다.

```bash
ssh jump "ssh target 'awk \"{print \$1}\" /proc/loadavg'"   # 중간 csh에서 깨짐
```

명령 문자열은 로컬 셸, 점프 서버의 csh, 대상 서버의 셸을 차례로 거치면서 매번 따옴표와 `$`가 다시 해석됩니다. csh는 `!`, `$`, 따옴표 처리 규칙이 bash와 달라서 세 번의 해석을 모두 맞추기가 매우 어렵습니다.

{{< tabs >}}
title: "명령이 해석되는 곳 · 탭을 바꿔 보세요"
items:
  - label: "인자로 넘길 때"
    tone: "bad"
    steps: ["로컬 bash · 1차 해석", "점프 서버 csh · 2차 해석", "대상 서버 셸 · 3차 해석"]
    text: "명령을 인자로 넘기면 세 번 해석됩니다. 점프 서버의 csh에서 따옴표와 변수가 깨집니다."
  - label: "stdin으로 넘길 때"
    tone: "ok"
    steps: ["script.sh (평범한 bash)", "로컬 ssh · stdin", "점프 서버 csh · ssh target bash만", "대상 서버 bash가 실행"]
    text: "점프 서버의 csh는 ssh target bash 한 줄만 해석하고, 스크립트 본문은 stdin으로 대상 서버 bash에 그대로 전달됩니다."
{{< /tabs >}}

## 해결: 스크립트를 stdin으로 넘기기

명령을 인자로 넘기지 않고 스크립트를 stdin으로 넘겼습니다.

```bash
ssh jump ssh target bash < script.sh
```


- 중간 셸은 `ssh target bash`라는 단순한 문자열만 해석합니다.
- 스크립트 내용은 stdin으로 그대로 전달되고 대상 서버의 bash가 읽습니다.
- 스크립트는 로컬에서 평범한 bash 문법으로 작성하면 됩니다.
- 인자가 필요하면 `bash -s -- arg1 arg2 < script.sh` 형태로 넘깁니다.

파일을 따로 만들기 번거로우면 heredoc으로도 넘길 수 있습니다. 구분자를 따옴표로 감싸면(`'EOF'`) 로컬 셸이 본문의 `$`를 해석하지 않습니다.

```bash
ssh jump ssh target bash -s <<'EOF'
awk '{print $1}' /proc/loadavg
df -h /
EOF
```

## 방법 비교

| 방법 | 장점 | 주의할 점 |
|---|---|---|
| 명령을 인자로 넘기기 | 짧은 명령은 간단함 | 중간 셸이 csh면 따옴표 맞추기가 어려움 |
| 스크립트를 stdin으로 넘기기 | 중간 셸 종류와 상관없이 동작 | 스크립트 안에서 stdin을 읽는 명령이 있으면 남은 스크립트 내용을 가져가 버림 |
| `ssh -J jump target` (ProxyJump) | 중간 셸을 아예 거치지 않음 | 점프 서버가 포트 포워딩을 허용해야 함 |

ProxyJump를 쓸 수 있는 환경이라면 가장 간단합니다. 이번처럼 중간 서버에서 명령을 실행해야만 넘어갈 수 있는 환경에서 stdin 방식이 유용했습니다.

stdin 방식에서는 스크립트 안의 `ssh`, `read`처럼 stdin을 읽는 명령이 남은 스크립트 내용을 가져갈 수 있습니다. 이럴 때는 `ssh -n`이나 `< /dev/null`로 해당 명령의 입력을 막습니다.

## 메모: 연결 재사용

매번 인증하기 번거로우면 ControlMaster로 연결 하나를 열어 두고 재사용할 수 있습니다.

```bash
# 연결 열어 두기
ssh -o ControlMaster=auto -o ControlPath=~/.ssh/cm-%r@%h:%p -o ControlPersist=10m jump

# 열린 연결로 보내기
ssh -o ControlPath=~/.ssh/cm-%r@%h:%p -o BatchMode=yes jump ssh target bash < script.sh
```

- `BatchMode=yes`를 주면 비밀번호를 묻지 않고 바로 실패해서, 연결이 끊긴 것을 빨리 알 수 있습니다.
- 반복 작업을 스크립트로 돌릴 때 매번 새로 인증하지 않아 속도도 빨라집니다.
