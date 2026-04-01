from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class LandingPageTest(unittest.TestCase):
    def test_landing_page_contains_required_application_content(self):
        index_path = ROOT / "index.html"
        styles_path = ROOT / "styles.css"
        script_path = ROOT / "script.js"
        hero_image_path = ROOT / "assets" / "hero-illustration.svg"
        portrait_image_path = ROOT / "assets" / "story-portrait.svg"

        self.assertTrue(index_path.exists(), "index.html should exist")
        self.assertTrue(styles_path.exists(), "styles.css should exist")
        self.assertTrue(script_path.exists(), "script.js should exist")
        self.assertTrue(hero_image_path.exists(), "hero illustration should exist")
        self.assertTrue(portrait_image_path.exists(), "story portrait should exist")

        html = index_path.read_text(encoding="utf-8")

        self.assertIn("병해조기경보", html)
        self.assertIn("병해를 더 늦기 전에 알 수 있다면", html)
        self.assertIn("왜 지금 필요한가", html)
        self.assertIn("핵심 원칙", html)
        self.assertIn("규칙 엔진이 먼저 판단합니다", html)
        self.assertIn("LLM은 설명을 돕는 역할에만 사용합니다", html)
        self.assertIn("시스템 구성", html)
        self.assertIn("추진 계획", html)
        self.assertIn("근거 자료", html)
        self.assertIn("55.8%", html)
        self.assertIn("50.8%", html)
        self.assertIn("90%+", html)
        self.assertIn("성숙기에 비가 많으면", html)
        self.assertIn("공식 병해충 정보와 농업기상 데이터를 바탕으로", html)
        self.assertIn('class="hero-actions"', html)
        self.assertIn('class="hero-metrics"', html)
        self.assertIn("핵심 요약", html)
        self.assertIn("검증 가능한 판단 구조", html)
        self.assertIn("section-shell", html)
        self.assertIn('href="styles.css"', html)
        self.assertIn('src="script.js"', html)
        self.assertIn("kostat.go.kr", html)
        self.assertIn("ncpms.rda.go.kr", html)
        self.assertIn("nongsaro.go.kr", html)
        self.assertIn("weather.rda.go.kr", html)
        self.assertIn('src="assets/hero-illustration.svg"', html)
        self.assertIn('src="assets/story-portrait.svg"', html)
        self.assertIn("포도 농장과 데이터 흐름을 표현한 병해조기경보 일러스트", html)
        self.assertIn("문제의 출발점을 표현한 인물 일러스트", html)


if __name__ == "__main__":
    unittest.main()
