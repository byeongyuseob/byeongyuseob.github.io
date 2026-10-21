---
title: "AI 에이전트가 남의 레포를 git pull 했다 — 되돌리기와 막기"
date: 2026-10-21
categories: ["ai-tools"]
---

## 문제

Claude Code에 "뭘 해야 할지 모르겠다"고 했더니, 작업 폴더에 있던 레포 두 개를 살펴보다가
`git fetch` + `git pull --ff-only`까지 해 버렸다. 둘 다 내 프로젝트가 아니었다.
파일 수정·커밋·push는 없었지만 working tree가 몇십 커밋 앞으로 움직였다.

권한 확인 없이 도구를 실행하는 모드(`bypassPermissions`)였고,
막연한 요청을 "알아서 진행하라"로 받아들인 것이 원인이었다.

## 되돌리기

```bash
# 1. working tree: 원래 커밋으로 (로컬 변경이 있으면 멈추는 --keep)
git reset --keep <원래 커밋>

# 2. remote-tracking branch: fetch 전 값은 reflog 파일의 첫 칸(old sha)에 있다
cut -d' ' -f1,2 .git/logs/refs/remotes/origin/main
git update-ref refs/remotes/origin/main <old sha>

# 3. fetch로 새로 생긴 remote-tracking branch(old sha가 0000…)는 로컬에서만 지운다
git update-ref -d refs/remotes/origin/<새 브랜치>
```

- `git reflog show`는 한 줄만 보여 줘서 이전 값이 안 보였다. 파일(`.git/logs/...`)을 직접 보면 `old new` 두 값이 다 있다.
- 지우기 전에 해당 기록이 전부 오늘 내가 한 fetch인지 타임스탬프로 확인했다. 원래 있던 걸 지우면 안 되니까.
- 원격 저장소 자체는 건드리지 않는다. 전부 로컬 기록이다.

## 막기: ask 규칙

`~/.claude/settings.json`에 상태를 바꾸는 git 명령을 `ask`로 둔다.

```json
{
  "permissions": {
    "ask": [
      "Bash(git pull *)",
      "Bash(git fetch *)",
      "Bash(git reset *)",
      "Bash(git push *)",
      "Bash(git -C *)"
    ]
  }
}
```

공식 문서 기준으로 확인한 것 ([permissions](https://code.claude.com/docs/en/permissions), [permission modes](https://code.claude.com/docs/en/permission-modes)):

- `Bash(git pull *)`와 `Bash(git pull:*)`는 같은 뜻이다. 끝의 `*`는 인자 없는 `git pull`도 잡는다.
- 평가 순서는 **deny → ask → allow**. 먼저 걸리는 쪽이 이긴다.
- **`bypassPermissions` 모드에서도 ask 규칙은 묻고, deny 규칙은 막는다.** allow 규칙만 의미가 없어진다.
- 단, 규칙은 **명령 문자열**을 맞춰 본다. `git -C 경로 pull`은 `Bash(git pull *)`에 안 걸린다. 이번에 실제로 쓴 형태가 바로 이거였다. 그래서 `Bash(git -C *)`도 넣었다 (대신 `git -C 경로 log` 같은 읽기 명령도 묻게 된다).
- 문서도 이 규칙이 완전한 보안 경계는 아니라고 말한다. 확실히 막으려면 샌드박스(쓰기 가능 경로 제한)를 쓴다.

## 메모

- 규칙보다 먼저, 에이전트에게 "막연한 질문이면 무슨 일을 말하는지 먼저 물어라", "남의 레포는 읽기만"이라고 지시(메모리·CLAUDE.md)해 두는 게 효과가 컸다.
- 확인한 Claude Code 문서 시점: 2026-10-21. 동작이 버전에 따라 바뀔 수 있다.
