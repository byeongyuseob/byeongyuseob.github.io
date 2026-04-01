# AWS Activate Founder Landing Page Design

**Date:** 2026-04-01
**Project:** `byeongyuseob.github.io`

## Goal

Create a single GitHub Pages landing page for the `병해조기경보 (EarlyCropDiseaseAlert)` project that supports an AWS Activate Founder application.

## Approved Direction

- Audience: balanced for both AWS reviewers and startup context
- Tone: formal and documentation-first
- Priority: product reliability first, architecture second
- Project status: planning-stage only
- Visual direction: KISS and flat

## Content Structure

1. Hero
   - Project name
   - One-line summary
   - Planning-stage note
   - AWS Activate Founder context
2. Problem Background
   - 2025 anthracnose damage on the founder's father's grape farm
   - Motivation to reduce preventable crop loss
3. Reliability Principles
   - Rule engine first
   - LLM as explanation layer only
   - Official-document grounded RAG
4. AWS-Native Architecture
   - AWS EKS, Terraform, Helm, ArgoCD
   - FastAPI, Random Forest, Redis, PostgreSQL, ChromaDB
   - KServe, vLLM, Prometheus, Grafana, Loki
   - Karpenter, HPA, Spot-first cost strategy
5. Roadmap and KPIs
   - 8-week phased plan
   - Accuracy, latency, cost, and grounding targets
6. Why AWS Activate
   - Explain how AWS credits unlock EKS validation, GPU inference experiments, autoscaling, and observability

## Copy Constraints

- Avoid hype language
- Do not claim implementation is complete
- Keep founder story short and factual
- Emphasize trust, safety, and operational realism

## UI Constraints

- Single static page
- Flat visual system
- Minimal JavaScript
- Responsive layout
- No dark mode
- No decorative animation dependencies

## Deliverables

- `index.html`
- `styles.css`
- Optional lightweight JS only if needed for anchor navigation
- Updated `README.md`
