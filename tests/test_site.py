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
        self.assertIn("Planning Stage", html)
        self.assertIn("Rule engine first", html)
        self.assertIn("LLM as an explanation layer", html)
        self.assertIn("AWS-native architecture", html)
        self.assertIn("Roadmap", html)
        self.assertIn("Why AWS Activate", html)
        self.assertIn('href="styles.css"', html)


if __name__ == "__main__":
    unittest.main()
