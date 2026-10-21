---
title: "docker inspect에서 Health 필드 오류"
description: "healthcheck가 없는 컨테이너에서 docker inspect 템플릿이 멈출 때 index와 with로 피하는 방법"
date: 2026-10-21
categories: ["docker"]
---

## 문제

컨테이너 상태를 한 줄씩 출력하려고 아래처럼 작성했습니다.

```bash
docker inspect -f '{{.Name}} {{if .State.Health}}{{.State.Health.Status}}{{end}}' $(docker ps -q)
```

healthcheck가 없는 컨테이너에서 `Health` 키가 없다는 오류가 나며 멈췄습니다. `if`로 감쌌는데도 키에 접근하는 순간 오류가 났습니다.

## 해결

필드 접근 대신 `index`로 값을 꺼내고 `with`로 감쌌습니다.

```bash
docker inspect -f '{{.Name}} {{with index .State "Health"}}{{.Status}}{{end}}' $(docker ps -q)
```

- `index`는 키가 없으면 빈 값을 돌려줍니다.
- `with`는 값이 비어 있으면 안쪽을 건너뜁니다. 안쪽에서 `.`은 Health 값 자체를 가리킵니다.

## 메모

- 같은 템플릿이 어떤 서버에서는 동작하고 어떤 서버에서는 오류가 났습니다. docker 버전 차이로 보이지만 확인하지는 못했습니다.
- 여러 서버에서 쓸 스크립트라면 처음부터 `index`와 `with` 형태로 작성하는 편이 안전합니다.
