# Research-Backed Service Intro Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static GitHub Pages landing page that presents `병해조기경보` as a real service concept backed by official Korean statistics and agricultural sources.

**Architecture:** Use a zero-build static site with a single HTML entrypoint, one stylesheet, and one tiny JavaScript file for reveal-on-scroll motion. Lock the required content and source-backed facts with a lightweight Python test so claims stay grounded.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Python `unittest`

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
- `styles.css` and `script.js` references
- Required sections and headings
- Official metric values used in copy
- References section with source links
- Planning-stage language
- `styles.css` reference

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests/test_site.py -v`
Expected: FAIL because the new research-backed content and motion hooks do not exist yet.

### Task 3: Implement the static landing page

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `script.js`
- Modify: `README.md`

**Step 1: Write minimal implementation**

Create a single-page layout with these sections:
- Hero
- Why now
- Trust principles
- System flow
- Roadmap and KPIs
- References

**Step 2: Keep the design simple and modern**

Use restrained spacing, rounded surfaces, large headings, and mild contrast. Avoid complex visuals and library-driven interactions.

**Step 3: Add simple responsive behavior**

Support mobile and desktop via CSS only.

**Step 4: Add subtle motion**

Use a tiny IntersectionObserver-based reveal animation for sections and cards.

### Task 4: Verify and publish

**Files:**
- Verify: `tests/test_site.py`
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `script.js`

**Step 1: Run test to verify it passes**

Run: `python3 -m unittest tests/test_site.py -v`
Expected: PASS

**Step 2: Run a static syntax check**

Run: `python3 -m py_compile tests/test_site.py`
Expected: PASS

**Step 3: Review git diff**

Run: `git diff -- docs/plans/2026-04-01-aws-activate-founder-design.md docs/plans/2026-04-01-aws-activate-founder-implementation.md index.html styles.css script.js README.md tests/test_site.py`

**Step 4: Commit**

```bash
git add docs/plans/2026-04-01-aws-activate-founder-design.md \
  docs/plans/2026-04-01-aws-activate-founder-implementation.md \
  index.html styles.css script.js README.md tests/test_site.py
git commit -m "feat: add research-backed service intro page"
git push origin main
```
