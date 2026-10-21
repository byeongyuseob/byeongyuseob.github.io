# TIL

데이터센터 운영 10년, 이제 GPU 클러스터와 AI 인프라로 넓히고 있습니다.
해 온 작업과 배운 것을 날짜순으로 기록합니다.

- 블로그: https://byeongyuseob.github.io (Hugo, GitHub Pages)

## 구조

```
content/posts/              글 (front matter: title, date, categories, projects)
content/projects/<이름>/    프로젝트 설명 (_index.md: title, status, summary)
layouts/  assets/css/       사이트 모양 (테마 없이 직접 작성)
hugo.toml                   이름·소개·경력·기술
```

## 글 쓰기

```bash
hugo new posts/<영어-kebab-case>.md   # 문제 / 해결 / 메모 템플릿, draft: true
hugo server -D                        # http://localhost:1313 미리보기
```

- 진행 중인 프로젝트 로그는 front matter 에 `projects: ["<이름>"]` 를 넣는다. 첫 화면에 프로젝트 카드가 자동으로 생긴다.
- 실제로 한 것만 쓰고, 날짜는 작업한 날로.
- 공개 전 회사 정보(도메인·IP·호스트명·계정명·사내 시스템 이름)가 없는지 검색한다.
