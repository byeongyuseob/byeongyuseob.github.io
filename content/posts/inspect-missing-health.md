---
title: "docker inspect: healthcheck 없는 컨테이너에서 템플릿이 에러 난다"
date: 2026-10-21
categories: ["docker"]
---

## 문제

컨테이너 상태를 한 줄씩 뽑으려고 이렇게 썼다.

```bash
docker inspect -f '{{.Name}} {{if .State.Health}}{{.State.Health.Status}}{{end}}' $(docker ps -q)
```

healthcheck가 없는 컨테이너에서 `Health` 키가 없다는 에러가 나며 멈췄다.
`if`로 감쌌는데도 키에 접근하는 순간 에러가 났다.

## 해결

필드 접근 대신 `index`로 꺼내고 `with`로 감싼다.

```bash
docker inspect -f '{{.Name}} {{with index .State "Health"}}{{.Status}}{{end}}' $(docker ps -q)
```

- `index`는 없는 키면 빈 값을 돌려준다.
- `with`는 빈 값이면 안쪽을 건너뛴다. 안쪽에서 `.`은 Health 자체다.

## 메모

- 같은 템플릿이 어떤 서버에서는 되고 어떤 서버에서는 안 됐다. docker 버전 차이로 추측한다 (확인 안 함).
- 여러 서버에서 돌릴 스크립트라면 처음부터 `index` + `with` 형태로 쓰는 게 안전하다.
