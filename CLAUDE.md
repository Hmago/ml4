# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **Machine Learning study notes** repository — a collection of Markdown files covering ML topics from beginner to advanced, organized as numbered chapters. There is no source code, build system, or test suite.

## Content Structure

- **12 chapters** (`03_introduction.md` through `13_llm.md`) covering: ML fundamentals, core concepts, data preprocessing, supervised/unsupervised/reinforcement learning, key algorithms, neural networks, model evaluation, interview questions, deep learning, and LLMs.
- **README.md** — Table of contents with difficulty levels and an ASCII big-picture diagram of the ML taxonomy.
- Chapters are meant to be read sequentially; later chapters build on earlier ones.

## Writing Conventions

Each chapter follows a consistent pedagogical format:
- Starts with `# Chapter N — Title`
- Uses a "Simple Explanation" section (plain-language analogy) followed by an "Official Definition" (formal/academic)
- Heavy use of ASCII art diagrams and tables for visual explanation
- Code blocks use ``` fencing (no language-specific syntax highlighting for diagrams)
- Blockquotes (`>`) for formal definitions and attributions

## When Editing Content

- Maintain the existing tone: accessible explanations first, then formal definitions.
- Preserve ASCII diagram style — do not replace with image links or Mermaid.
- Keep the numbered chapter prefix (`01_`, `02_`, ...) in filenames.
- If adding a new chapter, update the table of contents in `README.md` to include the new entry with its difficulty level.
