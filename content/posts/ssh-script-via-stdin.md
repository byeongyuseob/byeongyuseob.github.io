---
title: "csh 환경에서 ssh 원격 명령이 깨질 때"
description: "점프 서버 로그인 셸이 csh라 따옴표가 깨질 때, 명령 대신 스크립트를 stdin 으로 넘겨 해결한 방법"
date: 2026-10-21
categories: ["shell"]
---

## 문제

점프 서버를 거쳐 대상 서버에 명령을 보내야 했다. 점프 서버의 로그인 셸이 csh라서
따옴표를 겹친 명령이 중간에서 다르게 해석되어 깨졌다.

```bash
ssh jump "ssh target 'awk \"{print \$1}\" /proc/loadavg'"   # 중간 csh에서 깨짐
```

csh는 `!`, `$`, 따옴표 처리 규칙이 bash와 달라 이스케이프를 맞추기가 사실상 어렵다.

## 해결

명령을 인자로 넘기지 말고 스크립트를 stdin으로 넘긴다.

```bash
ssh jump ssh target bash < script.sh
```

- 중간 셸은 `ssh target bash`라는 단순한 문자열만 해석한다.
- 스크립트 본문은 stdin으로 그대로 흘러가 대상 서버의 bash가 읽는다.
- 스크립트는 로컬에서 평범한 bash 문법으로 쓰면 된다.
- 인자가 필요하면 `bash -s -- arg1 arg2 < script.sh`.

`ssh -J jump target` (ProxyJump)이 허용되는 환경이면 중간 셸을 아예 안 거치니 그게 제일 깔끔하다.
중간 서버에서 명령을 실행해야만 넘어갈 수 있는 환경에서 stdin 방식이 유용하다.

## 메모: 연결 재사용

매번 인증하기 번거로우면 ControlMaster로 연결 하나를 열어 두고 재사용한다.

```bash
# 한 번 열어 두기
ssh -o ControlMaster=auto -o ControlPath=~/.ssh/cm-%r@%h:%p -o ControlPersist=10m jump

# 열린 연결로 보내기
ssh -o ControlPath=~/.ssh/cm-%r@%h:%p -o BatchMode=yes jump ssh target bash < script.sh
```

- `BatchMode=yes`는 비밀번호를 묻지 않고 바로 실패한다. 연결이 끊겼는지 빨리 알 수 있다.
