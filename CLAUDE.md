# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **Machine Learning study notes and learning platform** — a comprehensive collection of Markdown files covering ML topics from beginner to advanced, plus an interactive web dashboard for studying. The content is focused on **Google AI Engineer interview preparation** but covers ML broadly.

## Content Structure

- **22+ chapters** (`00_google_ai_engineer_strategy.md` through `21_quick_reference_cheat_sheet.md`) organized into sections:
  - **Core ML Curriculum** (Ch 2–13): Math fundamentals, ML intro, core concepts, data preprocessing, supervised/unsupervised/reinforcement learning, key algorithms, neural networks, model evaluation, deep learning, LLMs
  - **Interview Preparation** (Ch 0, 15–17, 20, behavioral): Google strategy guide, ML interview questions, LLM interview questions, Google top 10 ML topics, ML system design, behavioral interview
  - **System Design** (Ch 14, Modern System Design): Design fundamentals, modern system design patterns
  - **DSA & Coding** (Ch 18, dsa_problems.js): Trees, graphs, ML coding in Java; 30 in-browser DSA practice problems
  - **Google ML Ecosystem** (Ch 19): TPUs, JAX, Vertex AI, key papers
  - **Supplementary**: Brain training, practical ML, staying relevant in AI era, quick reference cheat sheet
- **README.md** — Table of contents with Google interview priority ratings (★★★/★★/★), difficulty levels, estimated reading times, chapter dependency map, and five learning tracks
- **~74 hours** of total content

## Web Learning Platform

- **`index.html`** — Single-page web app (deployed via GitHub Pages) that renders all Markdown chapters with:
  - Sidebar navigation with chapter read-progress tracking
  - Dark/light theme toggle
  - Per-chapter quizzes (defined in `quizzes.js`) that auto-pop when marking a chapter as read
  - DSA Practice page with 30 in-browser coding problems (`dsa_problems.js`)
  - Timetable/study schedule page
  - KaTeX for math rendering, highlight.js for code syntax highlighting
  - Markdown rendered client-side using marked.js
- **PWA support**: `manifest.json`, `sw.js` (service worker), SVG icons — installable as an app
- **Local use**: Open `index.html` directly in a browser or use `start.bat` — no build step or server required

## Writing Conventions

Each chapter follows a consistent pedagogical format:
- Starts with `# Chapter N — Title`
- Uses a "Simple Explanation" section (plain-language analogy) followed by an "Official Definition" (formal/academic)
- Heavy use of ASCII art diagrams and tables for visual explanation
- Code blocks use ``` fencing (no language-specific syntax highlighting for diagrams)
- Blockquotes (`>`) for formal definitions and attributions
- Google interview priority ratings in README: ★★★ = Critical, ★★ = High Priority, ★ = Good to Know

## When Editing Content

- Maintain the existing tone: accessible explanations first, then formal definitions.
- Preserve ASCII diagram style — do not replace with image links or Mermaid.
- Keep the numbered chapter prefix (`00_`, `01_`, ...) in filenames.
- If adding a new chapter, update the table of contents in `README.md` to include the new entry with its difficulty level and Google priority rating.
- When adding quiz questions for a chapter, add them to `quizzes.js`.
- When modifying the web dashboard, test in browser — it's a single HTML file with no build step.
- Service worker (`sw.js`) has a version cache string — bust it when deploying significant changes.
