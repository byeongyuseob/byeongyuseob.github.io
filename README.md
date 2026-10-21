# byeongyuseob.github.io

데이터센터 운영 10년, 이제 GPU 클러스터와 AI 인프라로 넓히고 있습니다.
해 온 작업과 배운 것을 날짜순으로 기록합니다.

- 사이트: https://byeongyuseob.github.io (Hugo, GitHub Pages)

## 구조

```
hugo.toml                   이름 · 소개 · 경력 · 자격 · 학력 · 기술
content/work/               주요 프로젝트 (period · role · summary · result · stack)
content/posts/              기록 (title · date · categories · projects)
content/projects/<이름>/    진행 중인 프로젝트 설명 (_index.md: title · status · summary)
layouts/  assets/css/       사이트 모양 (테마 없이 직접 작성)
```

## 글 쓰기

```bash
hugo new posts/<영어-kebab-case>.md   # 문제 / 해결 / 메모 템플릿, draft: true
hugo server -D                        # http://localhost:1313 미리보기
```

- 진행 중인 프로젝트 로그는 front matter 에 `projects: ["<이름>"]` 를 넣는다. 첫 화면에 "진행 중" 카드가 생긴다.
- 실제로 한 것만, 날짜는 작업한 날로. 재기 어려운 비율 대신 셀 수 있는 사실과 상황으로 쓴다.
- 기술 용어는 어색하게 번역하지 않고 영어 그대로 쓴다.
- 공개 전 회사 내부 정보(도메인 · IP · 호스트명 · 계정명 · 사내 시스템 이름)와 전화번호가 없는지 검색한다.
