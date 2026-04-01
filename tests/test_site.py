from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class LandingPageTest(unittest.TestCase):
    def test_landing_page_contains_required_application_content(self):
        index_path = ROOT / "index.html"
        styles_path = ROOT / "styles.css"

        self.assertTrue(index_path.exists(), "index.html should exist")
        self.assertTrue(styles_path.exists(), "styles.css should exist")

        html = index_path.read_text(encoding="utf-8")

        self.assertIn("병해조기경보", html)
        self.assertIn("AWS Activate Founder", html)
        self.assertIn("현재 단계", html)
        self.assertIn("프로젝트 소개", html)
        self.assertIn("핵심 원칙", html)
        self.assertIn("규칙 엔진이 먼저 판단합니다", html)
        self.assertIn("LLM은 설명을 돕는 역할에만 사용합니다", html)
        self.assertIn("AWS 기반 구축 계획", html)
        self.assertIn("추진 계획", html)
        self.assertIn("AWS Activate가 필요한 이유", html)
        self.assertIn('class="hero-actions"', html)
        self.assertIn('class="hero-metrics"', html)
        self.assertIn("핵심 요약", html)
        self.assertIn("검증 가능한 판단 구조", html)
        self.assertIn("section-shell", html)
        self.assertIn('href="styles.css"', html)


if __name__ == "__main__":
    unittest.main()
