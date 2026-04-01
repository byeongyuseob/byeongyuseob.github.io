# AWS Activate Founder Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a flat, static GitHub Pages landing page that presents the `병해조기경보` project as an AWS Activate Founder application candidate.

**Architecture:** Use a zero-build static site with a single HTML entrypoint and one stylesheet. Lock the required content with a lightweight Python test so the page structure is verified before implementation and again before commit.

**Tech Stack:** HTML, CSS, Python `unittest`

---

### Task 1: Document the approved design

**Files:**
- Create: `docs/plans/2026-04-01-aws-activate-founder-design.md`
- Create: `docs/plans/2026-04-01-aws-activate-founder-implementation.md`

**Step 1: Write the design summary**

Capture the approved audience, tone, page sections, and flat visual rules.

**Step 2: Save the implementation plan**

List the exact files, tests, and verification flow for the static site.

### Task 2: Define required page behavior with a failing test

**Files:**
- Create: `tests/test_site.py`

**Step 1: Write the failing test**

Check for:
- `index.html` existence
- Required sections and headings
- AWS Activate content
- Planning-stage language
- `styles.css` reference

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests/test_site.py -v`
Expected: FAIL because `index.html` and `styles.css` do not exist yet.

### Task 3: Implement the static landing page

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Modify: `README.md`

**Step 1: Write minimal implementation**

Create a single-page layout with these sections:
- Hero
- Problem background
- Trust principles
- AWS architecture
- Roadmap and KPIs
- Why AWS Activate

**Step 2: Keep the design flat**

Use restrained spacing, borders, and typography. Avoid complex visuals, gradients, and library-driven interactions.

**Step 3: Add simple responsive behavior**

Support mobile and desktop via CSS only.

### Task 4: Verify and publish

**Files:**
- Verify: `tests/test_site.py`
- Verify: `index.html`
- Verify: `styles.css`

**Step 1: Run test to verify it passes**

Run: `python3 -m unittest tests/test_site.py -v`
Expected: PASS

**Step 2: Run a static syntax check**

Run: `python3 -m py_compile tests/test_site.py`
Expected: PASS

**Step 3: Review git diff**

Run: `git diff -- docs/plans/2026-04-01-aws-activate-founder-design.md docs/plans/2026-04-01-aws-activate-founder-implementation.md index.html styles.css README.md tests/test_site.py`

**Step 4: Commit**

```bash
git add docs/plans/2026-04-01-aws-activate-founder-design.md \
  docs/plans/2026-04-01-aws-activate-founder-implementation.md \
  index.html styles.css README.md tests/test_site.py
git commit -m "feat: add AWS Activate founder landing page"
git push origin main
```
