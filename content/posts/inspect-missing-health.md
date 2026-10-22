---
title: "docker inspect에서 Health 필드 오류"
description: "healthcheck가 없는 컨테이너에서 docker inspect 템플릿이 멈출 때 index와 with로 피하는 방법과 다른 확인 방법"
date: 2026-10-21
tip: true
categories: ["docker"]
---

## 문제

팀 배포 서버의 컨테이너 상태를 [1분 cron 자원 기록](/posts/cron-resource-log/)과 함께 남기려고, 상태를 한 줄씩 출력하는 명령을 아래처럼 작성했습니다.

```bash
docker inspect -f '{{.Name}} {{if .State.Health}}{{.State.Health.Status}}{{end}}' $(docker ps -q)
```

healthcheck가 없는 컨테이너에서 `Health` 키가 없다는 오류가 나며 멈췄습니다. `if`로 감쌌는데도 키에 접근하는 순간 오류가 났습니다.

## 원인

healthcheck가 없는 컨테이너는 `State` 안에 `Health` 항목 자체가 없습니다. `.State.Health`처럼 필드로 접근하면 값을 꺼내는 단계에서 오류가 나기 때문에, 그 결과를 검사하는 `if`까지 가지 못합니다.

{{< tabs >}}
title: "두 방식 비교 · 탭을 바꿔 보세요"
items:
  - label: "if .State.Health"
    tone: "bad"
    steps: ["필드 접근 .State.Health", "키가 없으면 오류", "if 검사 전에 멈춤"]
    text: "healthcheck가 없는 컨테이너는 Health 키가 없어서, if가 값을 보기 전에 필드 접근에서 멈춥니다."
  - label: "with index .State \"Health\""
    tone: "ok"
    steps: ["index로 값 꺼내기", "키가 없으면 빈 값", "with가 건너뜀"]
    text: "index는 키가 없으면 빈 값을 돌려주고, with는 빈 값이면 블록을 건너뜁니다."
{{< /tabs >}}

## 해결

필드 접근 대신 `index`로 값을 꺼내고 `with`로 감쌌습니다.

```bash
docker inspect -f '{{.Name}} {{with index .State "Health"}}{{.Status}}{{end}}' $(docker ps -q)
```

- `index`는 키가 없으면 빈 값을 돌려줍니다.
- `with`는 값이 비어 있으면 안쪽을 건너뜁니다. 안쪽에서 `.`은 Health 값 자체를 가리킵니다.

healthcheck가 없는 컨테이너도 표시하고 싶으면 `else`를 씁니다.

```bash
docker inspect -f '{{.Name}} {{with index .State "Health"}}{{.Status}}{{else}}no-healthcheck{{end}}' $(docker ps -q)
```

## 다른 확인 방법

| 방법 | 명령 | 특징 |
|---|---|---|
| 템플릿 (`index` + `with`) | 위 명령 | 추가 도구 없이 동작 |
| `docker ps` 상태 | `docker ps --format '{{.Names}} {{.Status}}'` | healthcheck가 있으면 상태 끝에 `(healthy)` 등이 붙음 |
| jq | `docker inspect $(docker ps -q) \| jq -r '.[] \| "\(.Name) \(.State.Health.Status // "none")"'` | 없는 값을 `// "none"`으로 기본값 처리 |

## 메모

- 같은 템플릿이 어떤 서버에서는 동작하고 어떤 서버에서는 오류가 났습니다. docker 버전 차이로 보이지만 확인하지는 못했습니다.
- 여러 서버에서 쓸 스크립트라면 처음부터 `index`와 `with` 형태로 작성하는 편이 안전합니다.
