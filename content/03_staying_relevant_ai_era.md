# Chapter 3 — Staying Relevant as a Software Engineer in the AI Era

> "AI Won't Replace Humans — But Humans With AI Will Replace Humans Without AI"
> — title of a *Harvard Business Review* interview with Karim Lakhani (Harvard Business School), August 2023

**As of November 2026.** In about three years, AI coding tools went from autocomplete to agents that write most of the new code at some companies. This chapter separates what the evidence shows from what the marketing says, and turns it into a plan: which skills rise in value, how to work with AI tools day to day, and how to keep learning. It is written for engineers preparing for Google AI Engineer interviews, but the lessons apply to any software career.

---

## What You'll Learn

After this chapter you will be able to:

- Tell a company claim from a survey, a randomized trial and payroll data — and explain why they disagree (§1).
- Quote the key numbers on AI adoption, AI-written code and productivity, each with its source and evidence type (§1).
- Say what AI does well, where it still fails (security, long messy tasks) and how fast AI agents are improving (§2).
- Name the skills that are rising in value — and the ones being commoditized (§3–§4).
- Use AI coding tools in a disciplined loop and pick a career path that fits the new market (§5–§7).
- Understand what is happening to junior hiring, and avoid the most common mistakes (§8–§10).
- Follow a concrete playbook and learning plan, and protect your focus (§11–§14).

## How to Read This Chapter

- **Numbers are a dated snapshot.** Each statistic names its source and its evidence type (*company-reported*, *survey*, *randomized trial*, *payroll data*, *projection*). §1 explains why that label matters. Re-check anything time-sensitive before you quote it in an interview.
- **One home per idea.** This chapter covers the job market and your career. How LLMs work, how to use them, agents and evaluation are taught in Ch 17–18 — follow the links instead of re-learning them here.
- **Short on time?** Read §1, §3, §11 and §12 first.

---

## Table of Contents

| Section | Topic |
|---------|-------|
| 1 | The Reality Check — What's Actually Happening |
| 2 | What AI Can and Can't Do (Today) |
| 3 | Skills That Are Rising in Value |
| 4 | Skills Being Commoditized |
| 5 | AI Coding Tools — and How to Work With Them |
| 6 | What Tech Leaders Say — and What Their Companies Did |
| 7 | The New Career Paths |
| 8 | Junior Developers — The Entry Door Is Narrower |
| 9 | The New "10x Engineer" — Leverage, Not Typing Speed |
| 10 | Common Mistakes Engineers Are Making |
| 11 | Your Playbook — Concrete Actions |
| 12 | The Learning Stack — What to Study |
| 13 | Beating Brain Fog — Protecting Your Mind in the AI Era |
| 14 | Final Perspective |

---

# SECTION 1: The Reality Check — What's Actually Happening

**Simple Explanation:** Almost every developer now uses AI tools, and at some companies AI writes most of the new code. But "AI wrote the code" is not the same as "the work got done faster". The careful studies show smaller and messier gains than the headlines — and the gains depend on the team, the task and how the tools are used.

> **Key number:** 83% of developers use AI tools at work, but only 16% say these tools handle complex tasks "very well" (Stack Overflow Developer Survey 2026, self-reported).

![Infographic: how to read AI statistics. Google says 75% of its new code is AI-generated while a randomized trial found experienced developers 19% slower, because they answer different questions. Four steps: label the evidence type, ask who measured it, what was counted and compared with what. Key number: 83% use AI tools at work but only 16% say they handle complex tasks very well (Stack Overflow 2026 survey). Five kinds of evidence with source chips: company-reported Google bar chart more than 25% in Oct 2024, about 50% in fall 2025, 75% in Apr 2026; survey 48% trust AI only when they can easily verify; telemetry more than 40% of pull requests start with an agent; DORA survey plus modelling throughput up, stability down; METR 2025 trial felt 20% faster, measured 19% slower. Worked numbers: METR Feb 2026 about 18% less time as very weak evidence, DX AI-authored code 27% to 52% and median pull request 44 to 72 lines.](diagrams/era03_info_reading_ai_evidence_ai.png)

---

## How to Read AI Statistics

<details>
<summary><strong>Read as text</strong> — the six evidence types, why they disagree and three questions to ask</summary>

**Simple Explanation:** A number about AI is only as good as the way it was measured. A CEO counting AI code that engineers accepted, a developer guessing how much faster they feel, and an experiment that times real tasks answer three *different* questions — so they can all be true and still disagree.

| Evidence type | Example | What it really measures | Main weakness |
|---------------|---------|-------------------------|---------------|
| **Company-reported** | Google: 75% of new code is AI-generated (Apr 2026) | The company's own metric, defined by the company | Not independently checked; every company counts differently |
| **Survey (self-reported)** | Stack Overflow 2026: 83% use AI tools at work | What people say they do and feel | People misjudge their own speed; respondents choose themselves |
| **Platform telemetry** | GitHub Octoverse 2026: more than 40% of pull requests start with an agent | What the tools log, at huge scale | Counts activity (commits, lines, PRs), not value |
| **Randomized trial** | METR 2025: tasks took 19% longer with AI | Cause and effect on real tasks | Small samples; tools change faster than studies finish |
| **Payroll / job-ad data** | Stanford (ADP payroll), PwC (more than a billion job ads) | Who gets hired, and what pay is offered | Shows patterns, not causes; an advertised salary is not a paid one |
| **Projection** | US BLS employment outlook 2025–35 | A model of the future | Assumptions can be overtaken by events |

**Why vendor numbers and research disagree.** "Share of code written by AI" counts *output*. It says nothing about review time, rework or bugs. In METR's trial, developers *believed* AI had made them 20% faster while the clock showed they were 19% slower — so a dashboard or a feeling can point one way while the stopwatch points the other. DORA, Google Cloud's software-delivery research program, adds the team view: more code moving faster can make releases *less* stable when tests and review do not keep up.

**Before you repeat any AI number, ask:**

1. Who measured it — and do they sell the tool?
2. What exactly was counted — lines, accepted suggestions, minutes, money?
3. Compared with what — a control group, last year, or nothing?

</details>

---

## How Much Code Is AI-Generated Right Now?

<details>
<summary><strong>Read as text</strong> — Google's 25% → 50% → 75%, JetBrains, DX and Octoverse</summary>

Google's figure is the most quoted, and it has moved fast:

```
  Share of new code at Google that is AI-generated (company-reported)

  Oct 2024    █████                  more than 25%
  Fall 2025   ██████████             about 50%
  Apr 2026    ███████████████        75%
              |----|----|----|----|
              0%  25%  50%  75% 100%
```

- **Oct 2024** (Q3 earnings call): "more than a quarter of all new code at Google is generated by AI, then reviewed and accepted by engineers."
- **Apr 2026** (Sundar Pichai, Cloud Next): "Today, 75% of all new code at Google is now AI-generated and approved by engineers, up from 50% last fall." The same post reports one complex code migration, done by agents and engineers together, finishing six times faster than a year earlier with engineers alone.

Other ways of measuring the same thing give a similar picture:

| Source (evidence type) | Finding |
|------------------------|---------|
| **JetBrains Developer Ecosystem Survey 2026** (self-reported; more than 15,000 professional developers, May–Jul 2026) | On average about 47% of last month's code was "fully generated by AI agents", 38% written with some AI help and 27% fully by hand (bucket averages, so they add up to more than 100%). One in five developers wrote no code at all without AI; only about 22% let agents write more than 80%. |
| **DX** (vendor analysis, self-reported; 400+ companies) | AI-authored code rose from 27% (Q1 2026) to 52% (Q2 2026, preliminary). |
| **GitHub Octoverse 2026** (platform telemetry) | More than 40% of pull requests were started with an agent in September 2026, up from 17% in March. |

**What the share does *not* tell you:** whether the work is faster, better or safer. DX also measured that the median pull request grew from 44 to 72 lines between July 2025 and June 2026 — more code for a human to review.

</details>

---

## Developer Survey Data (2025-2026)

<details>
<summary><strong>Read as text</strong> — four surveys: near-universal use, conditional trust</summary>

| Survey (who, when) | Adoption | Trust and quality | Evidence type |
|--------------------|----------|-------------------|---------------|
| **Stack Overflow Developer Survey 2026** (30,903 responses, 169 countries) | 83% use at least one AI tool at work: 66% coding assistants or agents, 63% general chat tools, 26% agents or automated workflows. 73% of coding-assistant users use them daily. | 48% "trust it when I can easily verify the output"; only about 7% trust it for important decisions; 16% say it handles complex tasks "very well". | Survey (self-reported) |
| **JetBrains Developer Ecosystem Survey 2026** (more than 15,000 professional developers, May–Jul 2026) | 90% use AI coding agents at work at least weekly; 68% daily. | — | Survey (self-reported, weighted to the global developer population) |
| **DORA 2025** (Google Cloud; nearly 5,000 technology professionals) | 90% use AI at work; more than 80% believe it raised their productivity. | 30% have little or no trust in AI-generated code. | Survey + statistical modelling |
| **Pragmatic Engineer 2026** (900+ newsletter readers, Jan–Feb 2026) | 95% use AI at least weekly; 75% for at least half their work; 55% regularly use AI agents; 70% use 2–4 tools. | — | Survey (self-selected readers) |

**What changed since 2025.** In the 2025 Stack Overflow survey, 84% used or planned to use AI tools, and more developers distrusted the accuracy of AI output (46%) than trusted it (33%). In 2026 the question became *when* developers trust AI — and the answer is "when I can check it". Before using an AI answer, 77% run it locally and 64% compare it against the codebase; only 10% use it as-is.

**The pattern:** use is nearly universal; trust is conditional. Developers lean on AI where the result is easy to verify and stay hands-on where it is not.

</details>

---

## The Productivity Reality

<details>
<summary><strong>Read as text</strong> — METR's slowdown and follow-up, DORA, and how to reconcile them</summary>

**Simple Explanation:** "How much faster does AI make me?" is the hardest question to answer. The best-designed study of experienced developers found a *slowdown* in early 2025; its 2026 follow-up points to a speed-up but cannot measure it reliably. Large surveys find most developers *feel* more productive, while teams without strong tests ship less stable releases.

| Study (evidence type) | Who and what | Result |
|-----------------------|--------------|--------|
| **METR, July 2025** (randomized trial) | 16 experienced open-source developers, 246 real issues in their own large repos (Feb–Jun 2025); AI tools mostly Cursor Pro with Claude 3.5/3.7 Sonnet | Tasks took **19% longer** with AI (95% CI +2% to +39%). Developers expected to be 24% faster and, afterwards, still *believed* they had been 20% faster. |
| **METR follow-up, Feb 2026** (randomized trial) | 57 developers, 800+ tasks, Aug 2025 – Feb 2026 | Returning developers took about **18% less time** with AI (CI −38% to +9%); new developers −4% (CI −15% to +9%). METR calls this very weak evidence: 30–50% of developers held back tasks they did not want to do without AI, so the true speed-up is probably larger. |
| **DORA 2025** (survey + statistical modelling) | Nearly 5,000 technology professionals | More than 80% *feel* more productive. AI adoption goes with higher delivery throughput **and** lower delivery stability: "AI doesn't fix a team; it amplifies what's already there." |
| **METR survey, May 2026** (self-reported) | 349 technical workers | A median **1.4–2×** self-reported change in the value of their work — METR itself notes reasons to doubt the size. |
| **Google, Apr 2026** (company-reported) | One complex code migration | Agents plus engineers finished it **6× faster** than engineers alone a year earlier — a single, chosen example. |

**How to reconcile them:**

1. **The task matters.** METR's slowdown was measured on complex changes to large, mature codebases that the developers knew very well — a hard setting for AI. Gains are usually reported on new code, unfamiliar code and boilerplate.
2. **The tools changed between studies.** Agents such as Claude Code and Codex spread through 2025; from talking to participants, METR believes developers are "more sped up from AI tools now — in early 2026".
3. **Typing speed is not delivery speed.** Bigger pull requests (DX) and less stable releases (DORA) eat the gain unless tests, review and small batches keep up.
4. **Feelings are unreliable.** In METR's 2025 trial, developers felt 20% faster while the clock showed 19% slower — measure your own tasks before you claim a number.

</details>

---

# SECTION 2: What AI Can and Can't Do (Today)

**Simple Explanation:** AI is strong when the task is well specified and the result is easy to check — code in a familiar pattern, tests, a refactor guarded by a test suite. It is weak when the task is long and messy, or needs judgement and context that is not written down. The line moves every few months, so learn the *test* ("can I check this cheaply?") rather than a fixed list.

> **Rule of thumb:** hand AI the work you can check cheaply (tests, types, a small diff) and keep the decisions you cannot. Developers already work this way: 48% trust AI output "when I can easily verify" it (Stack Overflow Developer Survey 2026).

![Infographic: what to hand to AI and why security still needs you. Rule of thumb: hand AI the work you can check cheaply and keep the decisions you cannot; 48% trust AI when they can easily verify it (Stack Overflow 2026 survey). A traffic light: green hand to AI for boilerplate, config and SQL (69%), tests and docs (58%), debugging and refactoring inside a test harness (64%); amber only with scanning and expert review for security-critical code such as auth, crypto and input handling; red you, with AI only assisting, for production ops (only 20% use AI), architecture and requirements. Security numbers from the Veracode 2026 vendor benchmark: code compiles about 100% but passes security 56%; coding-specialised vs general models 51% vs 52%, reasoning vs non-reasoning 56% vs 51%, Python 63% vs Java 30%. Prompt injection (OWASP LLM01:2025): give agents least privilege; scan every AI change in CI.](diagrams/era03_info_ai_can_cant_security_ai.png)

---

## Where to Use AI — and Where You're Needed

<details>
<summary><strong>Read as text</strong> — the work-by-work table: yes, with review, assist only, or you</summary>

| Work | Hand it to AI? | Why (evidence) |
|------|----------------|----------------|
| Boilerplate, scaffolding, config, regex, SQL, API glue | **Yes** — then read the diff | Easy to check. The most common use: 69% use AI to write code in a familiar area (Stack Overflow 2026) |
| Unit tests, docs, translating code, explaining unfamiliar code | **Yes, with review** | 58% use AI for tests — but an AI test can simply assert today's buggy behaviour |
| Debugging and refactoring | **Often** — inside a test harness | 64% use AI here; tests turn "looks right" into "is right" |
| Security-critical code (auth, crypto, input handling) | **Only with scanning and expert review** | In Veracode's 2026 tests, AI code failed security checks on about 44% of tasks (see below) |
| Deploying, operating production, incident response | **Assist only** (summarise logs, suggest hypotheses) | Only 20% use AI to deploy or operate production systems; a wrong action is expensive |
| Architecture and long-term trade-offs | **As a sparring partner** | Needs organisational context that is not in the repo, and no test can check it |
| Requirements, stakeholders, team communication | **You** | 46% don't use AI for emails and messages and don't plan to |
| Deciding what *not* to build | **You** | Priorities, judgement and accountability stay human |

</details>

---

## Security — Where AI Code Still Fails

<details>
<summary><strong>Read as text</strong> — Veracode 2026: compiles ~100%, secure 56%, and what to do</summary>

**Simple Explanation:** Models now write code that compiles almost every time, but "it runs" is not "it's safe". When nobody asks for security, they often choose the insecure way to implement a function — and that rate has barely moved in two years.

Veracode gives models coding tasks that can be done safely or unsafely (for example, building a database query from user input), with no security hints, and scans the result.

| Veracode GenAI Code Security Report 2026 (raw models, published 28 Jul 2026) | Result |
|------------------------------------------------------------------------------|--------|
| Average security pass rate (100+ models, four test snapshots) | **56%** — about 44% of tasks produced code with a known flaw; "virtually unchanged" since the 2025 report |
| Code that compiles (syntax) | about 100% |
| Best model in the Summer 2026 snapshot | 68% (GPT-5.5) |
| Coding-specialised vs general-purpose models | 51% vs 52% — no safer |
| Reasoning vs non-reasoning models | 56% vs 51% |
| By language | Python 63% … Java 30% |

The tests used raw models, not agents with scanners and review in the loop — which is exactly the safety net you must add. Veracode's advice: AI-generated code "needs to be treated like any unreviewed code: scan it, fix it, and never ship it blind."

**What to do:**

1. Run static analysis and dependency scanning in CI on every AI-written change.
2. Ask for the safe version explicitly (parameterised queries, input validation) — and for a test that tries the attack.
3. Review auth, crypto, deserialisation, file paths and shell commands line by line.
4. Remember that agents add a new attack surface: **prompt injection**, where text hidden in a web page, issue or file that the agent reads tells it what to do (OWASP Top 10 for LLM Applications 2025, LLM01). Give agents the least privilege they need — see [Ch 17b §5.11](#content/17b_llm_applications) and [Ch 18b §18.14](#content/18b_agents_in_production).

</details>

---

## How Fast the Frontier Moves — METR Time Horizons

![Infographic: METR time horizons, how long a task in human time an AI agent can finish half the time. Trend in one line: h(t) = h0 x 2^(t/T) with T about 129 days (95% CI 104 to 158), doubling about every 4 months, about x7 per year. A log-scale chart of the 50%-time horizon by release date: GPT-4 4 min, Claude 3.5 Sonnet 21 min, Claude 3.7 Sonnet 1 h, GPT-5 3.4 h, Claude Opus 4.6 12 h with a 5 to 61 h error bar, and early Mythos Preview 17 h above the dashed 16 h reliability limit, with a dashed trend line. Inset: for Claude Opus 4.6 the 80% horizon is 1.2 h vs 12 h at 50%, about 10x shorter. Worked numbers: 1.01 h x 2^(346/128.7) = 6.5 h predicted vs 12 h measured; if the trend held, 12 h to 40 h after 181, 224 or 274 days for T of 104, 129 or 158 days.](diagrams/era03_info_metr_time_horizons_ai.png)

<details>
<summary><strong>Read as text</strong> — the 50%-time horizon, the doubling trend and what it does not mean</summary>

**Simple Explanation:** METR, a non-profit that evaluates AI agents, timed skilled humans on more than a hundred self-contained software, machine-learning and cybersecurity tasks. For each AI agent it then asks: *how long a task (in human time) can this agent finish half the time?* That length is the agent's **50%-time horizon**. Since 2023 it has doubled roughly every four months.

> **Official Definition:** "The task-completion time horizon is the task duration (measured by human expert completion time) at which an AI agent is predicted to succeed with a given level of reliability." — METR

| Agent (release) | 50%-time horizon | 80%-time horizon |
|-----------------|------------------|------------------|
| GPT-4 (Mar 2023) | ≈ 4 min | ≈ 1 min |
| Claude 3.5 Sonnet, new (Oct 2024) | ≈ 21 min | ≈ 3 min |
| Claude 3.7 Sonnet (Feb 2025) | ≈ 1.0 h | ≈ 12 min |
| GPT-5 (Aug 2025) | ≈ 3.4 h | ≈ 38 min |
| Claude Opus 4.6 (Feb 2026) | ≈ 12 h (95% CI ≈ 5–61 h) | ≈ 1.2 h |
| Claude Mythos Preview, early version (Apr 2026) | ≈ 17 h (CI ≈ 8–55 h) — above the 16-hour limit where METR's tasks give reliable numbers | ≈ 3.1 h |

*Source: METR Time Horizon 1.1 data. METR measures only some models, and stopped actively updating the page on 8 September 2026.*

**The trend in one line:** `h(t) = h0 · 2^(t / T)`, with a doubling time T ≈ 129 days (95% CI 104–158 days) for 2023 onwards — about ×7 per year.

```
  Doubling every ~4 months:

  1 h ──► 2 h ──► 4 h ──► ~7 h        (one year later)
  now     +4 mo   +8 mo   +12 mo
```

**What it does *not* mean:**

- **Not how long an agent can run.** The horizon measures task *difficulty* in human time; agents usually finish the tasks they solve several times faster than people.
- **Not "AI can do any 12-hour job".** The tasks are self-contained, clearly specified and scored automatically, and the humans were timed with little context, like a new hire. Real work is messier, and agents score lower when their work is judged as a whole.
- **Reliability lags capability.** The 80% horizon is about 5–10× shorter than the 50% horizon. Errors compound over many steps — see [Ch 18 §18.1](#content/18_ai_agents).

The program below checks the trend against a real measurement, then shows how much a forecast depends on the doubling time.

</details>

```python
# METR time-horizon trend h(t) = h0 * 2**(t / T): check it, then see how much a forecast depends on T
import math

h0 = 1.01      # hours: 50%-time horizon of Claude 3.7 Sonnet, released 24 Feb 2025
T = 128.7      # doubling time in days (METR fit for 2023 onwards; 95% CI 104-158)
days = 346     # 24 Feb 2025 -> 5 Feb 2026 (Claude Opus 4.6, measured 12.0 h, 95% CI 5.3-60.6 h)

pred = h0 * 2 ** (days / T)
print(f"Trend predicts {pred:.1f} h after {days} days; METR measured 12.0 h")
assert 5.3 <= pred <= 60.6, "prediction should fall inside the measured interval"
print(f"Growth per year when T = {T} days: x{2 ** (365 / T):.1f}")

# IF the trend held: when would the 50% horizon go from 12 h to a 40-hour work week?
for T_ in (104.4, 128.7, 158.0):
    d = T_ * math.log2(40 / 12.0)
    print(f"T = {T_:5.1f} days -> 40 h after {d:3.0f} days (about {d / 30.4:.0f} months)")

# Reliability gap: the 80% horizon is far shorter than the 50% horizon
for name, p50, p80 in [("Claude 3.7 Sonnet", 1.01, 0.20), ("GPT-5", 3.38, 0.64), ("Claude Opus 4.6", 11.98, 1.16)]:
    print(f"{name:18s} 50%: {p50:5.2f} h   80%: {p80:4.2f} h   ratio {p50 / p80:4.1f}x")
```

**Output:**

```
Trend predicts 6.5 h after 346 days; METR measured 12.0 h
Growth per year when T = 128.7 days: x7.1
T = 104.4 days -> 40 h after 181 days (about 6 months)
T = 128.7 days -> 40 h after 224 days (about 7 months)
T = 158.0 days -> 40 h after 274 days (about 9 months)
Claude 3.7 Sonnet  50%:  1.01 h   80%: 0.20 h   ratio  5.0x
GPT-5              50%:  3.38 h   80%: 0.64 h   ratio  5.3x
Claude Opus 4.6    50%: 11.98 h   80%: 1.16 h   ratio 10.3x
```

<details>
<summary><strong>Read as text</strong> — continued: what the program teaches about forecasts</summary>

**What it teaches:** the trend predicted 6.5 hours and the measurement was 12 hours — inside METR's wide error bars, so the trend held. But the "40-hour" date moves by three months just from the uncertainty in T, and it lies beyond the 16-hour range METR can measure reliably. Treat extrapolations as scenarios, not forecasts.

</details>

---

# SECTION 3: Skills That Are Rising in Value

**Simple Explanation:** When typing code gets cheap, the scarce skills are the ones around it: deciding what to build, describing it precisely enough that an agent can build it, checking that the result is right and safe, and owning it in production. Employers now ask for this directly: in October 2026 Google told Business Insider that AI fluency is required for all its software engineering jobs ([Ch 2 §1.4](#content/02_behavioral_interview)).

> **Key number:** job ads that require AI skills offer a **62%** higher salary than comparable ads that don't (PwC 2026 Global AI Jobs Barometer; advertised salaries).

![Infographic: skills rising in value when typing code gets cheap. The idea as four steps: decide what to build, describe it for an agent, verify it is right and safe, own it in production; Google said in Oct 2026 that AI fluency is required for all its software engineering jobs. Key number: job ads that require AI skills offer a 62% higher salary than comparable ads (PwC 2026 Global AI Jobs Barometer, advertised salaries). A grid of 9 skills: system design, specs and context, verification (median pull request grew 44 to 72 lines, DX), agent orchestration (40%+ of pull requests start with an agent, Octoverse 2026), AI product integration, security and prompt injection (AI code fails about 44% of security tasks, Veracode 2026), debugging and incidents, domain expertise, technical communication. A pick-by-question table of practices and PwC key numbers: 62% premium (previously 57%), AI-specialist hiring 8x faster, AI-exposed entry jobs 7x more likely to need senior skills.](diagrams/era03_info_rising_skills_premium_ai.png)

---

## The Skills That Matter More Now (Not Less)

| # | Skill | Why it is rising now | Practise it | Go deeper |
|---|-------|----------------------|-------------|-----------|
| 1 | **System design and architecture** | Code is cheap; deciding *what* to build and which trade-offs to accept is not — and it needs context no model has | Write a one-page design before you start an agent session | [Ch 23](#content/23_system_design_fundamentals_deep_dive), [Ch 26](#content/26_ml_system_design) |
| 2 | **Writing specs and context** ("context engineering") | An agent is only as good as the goal, constraints, examples and files you give it | Turn each task into: goal, constraints, files to touch, acceptance tests | [Ch 18 §18.9](#content/18_ai_agents) |
| 3 | **Verification — tests, evals and code review** | More AI code means more to check; the median pull request grew from 44 to 72 lines in a year (DX) | Write the test first; review every AI diff as if a new hire wrote it | [Ch 17c §4](#content/17c_llm_systems), [Ch 18b §18.12](#content/18b_agents_in_production) |
| 4 | **Agent orchestration** | More than 40% of GitHub pull requests now start with an agent (Octoverse 2026) | Split work into small, independent tasks, each with a clear "done" check | [Ch 18 §18.4–18.5](#content/18_ai_agents) |
| 5 | **AI product integration** | Companies need engineers who can ship LLM features (RAG, tool calling, evals, cost); Google asks for it in most roles above entry level | Build one small LLM feature end-to-end, with an evaluation set | [Ch 17b](#content/17b_llm_applications) |
| 6 | **Security, including prompt injection** | AI code fails about 44% of security tasks (Veracode 2026); agents that read outside content can be hijacked (OWASP LLM01) | Run a scanner in CI; give agents least privilege | [Ch 17b §5.11](#content/17b_llm_applications), [Ch 18b §18.14](#content/18b_agents_in_production) |
| 7 | **Debugging and incident response** | When generated code fails in production, someone must understand the *system*, not just the diff | Read logs and traces yourself first, then compare with the AI's diagnosis | [Ch 25](#content/25_system_design_operations_case_studies) |
| 8 | **Domain expertise** | The rules of health care, finance or infrastructure are rarely written where a model can read them | Learn one domain's constraints, data and regulations deeply | — |
| 9 | **Technical communication** | When implementation is fast, explaining trade-offs to people (and agents) becomes the bottleneck | Write short design docs and decision records | [Ch 2](#content/02_behavioral_interview) |

---

## The Salary Premium Is Real

<details>
<summary><strong>Read as text</strong> — PwC 2026: the 62% premium, 8× hiring growth, and how to read it</summary>

PwC's *2026 Global AI Jobs Barometer* (June 2026) analysed more than a billion online job ads on six continents (Lightcast data):

| Finding | Number |
|---------|--------|
| Salary premium in job ads that require AI skills, vs comparable ads that don't | **62%** (57% in the previous Barometer) |
| Hiring of AI specialists vs hiring in all jobs (2025) | grew **8×** faster |
| The most AI-exposed entry-level jobs vs the least exposed: how much more likely they are to require "senior" skills such as judgement and leadership | **7×** |

**Read it carefully:** these are *advertised* salaries averaged across sectors and countries — not a promise that adding "AI" to your CV raises your pay by 62%. The premium is for being able to *build with* AI on top of strong fundamentals. What this means for juniors is in §8; the roles that are growing are in §7.

</details>

---

# SECTION 4: Skills Being Commoditized

**Simple Explanation:** a skill is "commoditized" when it becomes cheap and available to
everyone — the way calculators did it to long division. AI coding tools have done this to
*typing correct code for a task that is clearly described and easy to check*. What stays
valuable is everything around that code: deciding what to build, describing it so a tool can
act on it, checking that the result is right, and owning what happens in production.

> **Key number:** developers rate AI "useful" or "very useful" for **implementation (75%)** and
> **debugging (73%)**, but only for **design (49%)** and **communication (35%)** (Stack Overflow
> Developer Survey 2026, self-reported, about 12,700 respondents).

![Infographic: Skills Being Commoditized. Typing correct code for clear, easy-to-check tasks got cheap, like calculators did to long division; the value moved to the loop around the code: 1 Decide, 2 Explain, 3 Check, 4 Own. Bar chart from the Stack Overflow 2026 survey (self-reported, about 12,700 respondents): AI rated useful or very useful for implementation 75%, debugging 73%, design 49%, communication 35%. Old world versus new world diagram, a table of what still needs you (boilerplate and CRUD, syntax and API signatures, simple unit tests, translating languages, routine docs), and the trap of letting the same AI write the code and the only tests.](diagrams/era03_info_commoditized_skills_ai.png)

## What's Worth Less Than It Used To Be

<details>
<summary><strong>Read as text</strong> — what AI does cheaply now and what still needs you</summary>

| Task | Why AI does it cheaply now | What still needs you |
|---|---|---|
| Boilerplate and basic CRUD code | Common patterns, and you can check them by running them | The data model, the API contract, the edge cases |
| Remembering syntax and API signatures | The tool (or the docs it reads) answers in seconds | Knowing which API fits and how it fails |
| Simple unit tests | Generated from the code in seconds | Deciding *what must be true* — tests generated from the code copy its bugs |
| Translating code between languages | Mostly a mechanical mapping | Library and runtime differences, performance |
| Routine docs and comments | Summarising code is easy for an LLM | Explaining *why* the design was chosen |
| Formatting and style | Linters and formatters automated this even before LLMs | Agreeing on the team's conventions |

**What this means:** "cheap" is not "worthless". You still have to read this code to review
it — you just should not spend your day typing it.

</details>

## Where the Value Moved

<details>
<summary><strong>Read as text</strong> — old world vs new world, the four-step loop and the trap</summary>

```
  OLD WORLD                  NEW WORLD (2026)
  ─────────                  ────────────────
  Writing code = the job     AI drafts most routine code.
                             Your job is the loop around it:

                             1. DECIDE   what to build, and why (trade-offs)
                             2. EXPLAIN  it so a tool can act (spec, "done" test)
                             3. CHECK    that it is right (tests, review, security)
                             4. OWN      what happens in production (incidents)
```

The person who can write a function fastest is less valuable. The person who knows **which**
function to write — and can show that it works — is more valuable. §3 lists the skills that are
rising; §5 turns steps 2 and 3 into a daily workflow.

> **Trap:** letting the same AI write the code *and* the only tests for it. Tests derived from
> the code check what the code does, not what it should do, so they pass on the bug. Write the
> edge cases yourself — the program in §5 shows the difference.

</details>

---

# SECTION 5: AI Coding Tools — and How to Work With Them

**Simple Explanation:** AI coding tools come in four shapes: helpers inside your editor, agents
in your terminal, agents that work in the cloud and send you a pull request, and "agent
managers" that run several agents at once. Brand names change every few months — in 2026 alone
several big tools were renamed, sold or shut down — so learn the shapes and one solid workflow,
not one product.

> **Key number:** only **10%** of developers use an AI answer as-is; **77%** run it locally
> first and **64%** compare it with the existing codebase (Stack Overflow Developer Survey 2026,
> self-reported, about 13,200 respondents).

![Infographic: AI Coding Tools, four shapes as of Nov 2026. A 2 by 2 grid: IDE assistant or AI editor (GitHub Copilot, Cursor, JetBrains AI, Kiro), terminal agent (Claude Code, Codex CLI, Antigravity CLI), cloud or async agent that turns an issue into a pull request (GitHub Copilot, Codex cloud tasks, Devin Cloud) and agent manager (Antigravity 2.0, Devin Desktop). Key number from the Stack Overflow 2026 survey (self-reported, about 13,200 respondents): only 10% use an AI answer as-is, 77% run it locally first, 64% compare it with the codebase. Google's own tools: Antigravity; Gemini CLI replaced by Antigravity CLI for individuals on 18 Jun 2026; Jules closes 31 Dec 2026. A four-step staircase of use levels (Autocomplete, Guided, Delegated task, Agentic) with the AI's role and your role, highlighting the 1 to 2 jump (give context) and the 2 to 3 jump (give a spec and a check), plus a pick-by-question table.](diagrams/era03_info_coding_tool_shapes_ai.png)

## The Four Shapes of AI Coding Tools (as of November 2026)

| Shape | What it does | Examples (maker) |
|---|---|---|
| **IDE assistant / AI editor** | Completions, chat and an "agent mode" inside your editor | GitHub Copilot, Cursor (part of SpaceX since Aug 2026), JetBrains AI and Junie, Kiro (AWS; spec-driven) |
| **Terminal agent** | Reads the repo, edits files, runs commands and tests in your shell | Claude Code (Anthropic), Codex CLI (OpenAI), Copilot CLI (GitHub), Antigravity CLI (Google), OpenCode (open source) |
| **Cloud / async agent** | Takes an issue, works in a cloud sandbox, opens a pull request for you to review | GitHub Copilot (assign it an issue), Codex cloud tasks, Devin Cloud (Cognition) |
| **Agent manager** | Runs and supervises several local and cloud agents in parallel | Google Antigravity 2.0, Devin Desktop (formerly Windsurf) |

<details>
<summary><strong>Read as text</strong> — most products span several shapes</summary>

Most products now span several shapes — Claude Code, for example, also runs in IDEs and in
desktop and web apps. Benchmarks and the wider landscape are in
[Ch 20 §20.4](#content/20_2026_landscape).

</details>

### Google's own tools (worth knowing for a Google interview)

<details>
<summary><strong>Read as text</strong> — Antigravity, Gemini CLI and Jules in November 2026</summary>

| Tool | Status (November 2026) |
|---|---|
| **Antigravity** — agent-first IDE (Nov 2025); Antigravity 2.0 desktop app and Antigravity CLI (May 2026) | Free tier for individuals; higher limits with Google AI Pro or Ultra; companies buy it through Google Cloud |
| **Gemini CLI** and the **Gemini Code Assist** IDE extensions | Stopped serving free and Google AI Pro/Ultra individual accounts on 18 Jun 2026 (replaced by Antigravity CLI); enterprise licences and API keys are unaffected |
| **Jules** — asynchronous cloud coding agent | Winding down: read-only after 11 Nov 2026, closes 31 Dec 2026 |

</details>

### What changed in 2026 — why you learn workflows, not brands

<details>
<summary><strong>Read as text</strong> — the 2026 renames, sales and shutdowns, and how usage moved</summary>

| Change | Date |
|---|---|
| Windsurf became **Devin Desktop** (Cognition) | 2 Jun 2026 |
| Gemini CLI replaced by **Antigravity CLI** for individual accounts | 18 Jun 2026 |
| **Cursor** became part of SpaceX; sold inside the "X Subscription" bundle from October | deal closed 14 Aug 2026 |
| Amazon Q Developer replaced by **Kiro** (no new sign-ups; IDE plugins supported until 30 Apr 2027) | from 15 May 2026 |
| **Jules** closes | 31 Dec 2026 |

Usage moved just as fast. Between January and May–July 2026, the share of professional
developers using **Claude Code** at work went from 18% to 39% and **Codex** from 3% to 16%, while
**GitHub Copilot** fell from 29% (a year earlier) to 21% and **Cursor** from 18% to 12%
(JetBrains Developer Ecosystem Survey 2026, more than 15,000 developers, self-reported).

</details>

## Prices — One Dated Snapshot (individual plans, as of 7 November 2026)

<details>
<summary><strong>Read as text</strong> — the dated price table and how to read it</summary>

| Tool (where it lives) | Free tier | Entry paid plan (USD per month) | Higher tiers (USD per month) |
|---|---|---|---|
| GitHub Copilot | Yes — 2,000 completions, limited agent use | 10 (Pro) | 39 (Pro+), 100 (Max) |
| Claude Code (in Claude plans) | No — needs Pro or higher | 20 (Pro; 17 if billed yearly) | 100 (Max), 200 (Ultra) |
| OpenAI Codex (in ChatGPT plans) | Yes — desktop app only, limited | 20 (Plus); Go at 8 is desktop-app only | 100, 200, 500 (Pro) |
| Cursor (in the X Subscription) | Yes — limited | 8 (Plus, Grok models only) | 30, 100, 200 — other vendors' models billed at API prices |
| Google Antigravity (via Google AI plans) | Yes | 19.99 (Google AI Pro) | 99.99, 199.99 (Google AI Ultra) |
| Devin Desktop and Devin Cloud (Cognition) | Yes — light quota | 20 (Pro) | 200 (Max) |
| Kiro (AWS) | Yes — 50 credits | 20 (Pro) | 40, 100, 200 |

Read this table for its shape, not its decimals: most vendors sell an entry tier of about 20
and heavy-agent tiers of 100–200 USD a month, and every plan has **usage limits** rather than
"unlimited" use. Check the vendor's page before you pay.

</details>

## How to Actually Use These Effectively

<details>
<summary><strong>Read as text</strong> — the four levels of use and the jumps that matter</summary>

| Level | What you ask | The AI's role | Your role |
|---|---|---|---|
| **1 — Autocomplete** | "Complete this function", "fix this error" | A faster keyboard | Accept or reject lines |
| **2 — Guided** | "Write tests for this module following our test patterns"; "review this diff for security issues" | A helper that follows your context | Give context, check the output |
| **3 — Delegated task** | "Add retries to the payment client following the pattern in the order service; done = these tests pass" | A junior engineer working from your spec | Design, spec, review |
| **4 — Agentic** | Several agents work on parts of a feature in parallel, each opening a pull request | A small team you lead | Split the work, set the checks, review and merge |

Many people stop at Level 1. The jumps that matter are **1 → 2** (give context) and **2 → 3**
(give a spec and a check). Level 4 multiplies whatever discipline you already have — good or
bad (see the delivery data in §1).

</details>

## The Agentic Loop — Spec → Plan → Small Diffs → Check → Review

**Simple Explanation:** treat an agent like a very fast new teammate who has never heard your
team's unwritten rules. Tell it what "done" means, let it propose a plan, have it change one
small thing at a time, let the tests decide, and read every line before you merge.

> **Rule of thumb:** "I won't commit any code to my repository if I couldn't explain exactly
> what it does to somebody else." (Simon Willison, *Not all AI-assisted programming is vibe
> coding*, March 2025)

![Infographic: The Agentic Loop. A five-step pipeline 1 Spec (goal, limits, done test, AGENTS.md house rules), 2 Plan, 3 Small diff, 4 Check (tests, types, lint, CI), 5 Review, then merge, with a red fails arrow from Check back to Small diff. Rule of thumb quote from Simon Willison, March 2025. Worked example for the bug a 100% discount crashes checkout: with only the bug-report test, patch v1 passes 1 of 1 and is accepted although total(50, 20) = -950.0; with your edge cases 0%, 20% and over 100%, patch v1 passes 3 of 4, patch v2 passes 4 of 4 and total(50, 20) = 40.0. Table comparing vibe coding (Feb 2025) and agentic engineering (Feb 2026), both terms by Andrej Karpathy, and the protocols MCP, A2A, AGENTS.md and ACP in one line each.](diagrams/era03_info_agentic_loop_ai.png)

<details>
<summary><strong>Read as text</strong> — the five-step loop, what each step does and why</summary>

```
  ┌──────────┐   ┌──────────┐   ┌────────────┐   ┌──────────┐   ┌──────────┐
  │ 1 SPEC   │──►│ 2 PLAN   │──►│ 3 SMALL    │──►│ 4 CHECK  │──►│ 5 REVIEW │──► merge
  │ goal +   │   │ agent    │   │   DIFF     │   │ tests,   │   │ you read │
  │ context +│   │ proposes,│   │ one step,  │   │ types,   │   │ every    │
  │ "done"   │   │ you edit │   │ one commit │   │ lint, CI │   │ line     │
  └──────────┘   └──────────┘   └────────────┘   └────┬─────┘   └──────────┘
                                      ▲               │ fails
                                      └───────────────┘
```

| Step | Do this | Why |
|---|---|---|
| 1. Spec | State the goal, the limits ("don't change the public API") and what "done" means — ideally a failing test. Keep a short `AGENTS.md` (or `CLAUDE.md`) with build and test commands and rules the code doesn't show | The agent cannot read decisions that live in meetings or in someone's head ([Ch 18 §18.9](#content/18_ai_agents)) |
| 2. Plan | For anything bigger than one file, ask for a plan first; fix the plan, not the code | A wrong plan is cheap to fix; wrong code is not |
| 3. Small diff | One step per commit; check after each | Small diffs can be reviewed properly; huge ones get skimmed |
| 4. Check | Tests, type checker, linter and CI run by the tool — not just promised by the agent | Turns "done" into something a machine verifies |
| 5. Review | Read every line; once you merge it, you own it | Branch protection and a human approver have the last word ([Ch 18b §18.13](#content/18b_agents_in_production)) |

Anthropic's own guide for Claude Code gives the same advice in three lines: tell the agent what
it can't see, give it a check to run, and enforce the rules that can't have exceptions with
hooks or CI rather than with stronger wording in the prompt (*Best practices for Claude Code*,
code.claude.com, November 2026). Prompting basics are in [Ch 17b §5](#content/17b_llm_applications).

</details>

### Worked example — one bug, two prompts

<details>
<summary><strong>Read as text</strong> — a Level 1 prompt vs a Level 3 prompt</summary>

**Level 1 prompt:** "fix the discount bug". The agent guesses what is wrong, edits several files
and reports "done".

**Level 3 prompt:**

```
A 100% discount code crashes checkout in total(subtotal, discount_pct)
(src/pricing.py). First write a failing test that reproduces it. Add edge
cases: 0%, 20%, and anything over 100% (treat it as 100%). Then fix it
without changing the function signature. Done = all tests pass. Show the diff.
```

The program below plays the loop with a scripted "agent" that proposes two patches. With only
the bug-report test as the check, the loop accepts a patch that is still wrong; with your edge
cases, the same loop keeps going until the patch is right.

</details>

```python
# A test-gated agent loop: a scripted "agent" proposes patches; only a passing test suite ends the loop.
def total_v1(subtotal, discount_pct):           # agent's 1st patch: stops the crash, wrong maths
    if discount_pct >= 100:
        return 0.0
    return subtotal * (1 - discount_pct)        # bug: treats 20 as 2,000%

def total_v2(subtotal, discount_pct):           # agent's 2nd patch
    discount_pct = min(max(discount_pct, 0), 100)
    return round(subtotal * (1 - discount_pct / 100), 2)

AGENT_PATCHES = [total_v1, total_v2]            # what a fake LLM proposes, in order

bug_report_test = [((50.0, 100), 0.0)]          # "a 100% discount crashes checkout"
your_tests = bug_report_test + [((50.0, 20), 40.0), ((80.0, 0), 80.0), ((10.0, 150), 0.0)]

def agent_loop(tests):
    for turn, patch in enumerate(AGENT_PATCHES, start=1):
        failures = [(args, want, patch(*args)) for args, want in tests if patch(*args) != want]
        print(f"  turn {turn}: {patch.__name__} passes {len(tests) - len(failures)}/{len(tests)} tests")
        for args, want, got in failures:
            print(f"    FAIL total{args}: want {want}, got {got}")
        if not failures:
            return patch
    return None

print("Check = only the bug-report test")
done = agent_loop(bug_report_test)
print(f"  accepted {done.__name__}; total(50, 20) = {done(50.0, 20)}  <- wrong, and nothing caught it")

print("Check = your edge-case tests")
done = agent_loop(your_tests)
print(f"  accepted {done.__name__}; total(50, 20) = {done(50.0, 20)}")
assert done is total_v2 and done(50.0, 20) == 40.0
```

**Output:**

```
Check = only the bug-report test
  turn 1: total_v1 passes 1/1 tests
  accepted total_v1; total(50, 20) = -950.0  <- wrong, and nothing caught it
Check = your edge-case tests
  turn 1: total_v1 passes 3/4 tests
    FAIL total(50.0, 20): want 40.0, got -950.0
  turn 2: total_v2 passes 4/4 tests
  accepted total_v2; total(50, 20) = 40.0
```

<details>
<summary><strong>Read as text</strong> — continued: the check is your spec</summary>

**What this means:** the agent stops when the check passes, so the check *is* your spec. A weak
check ships a wrong patch with a green tick; writing the edge cases is the part of the job that
did not get cheaper.

</details>

## Vibe Coding vs Agentic Engineering

<details>
<summary><strong>Read as text</strong> — Karpathy's two terms side by side, and Google's AI fluency</summary>

Andrej Karpathy coined **"vibe coding"** on X on 2 February 2025: you "fully give in to the
vibes, embrace exponentials, and forget that the code even exists" — accept every change, don't
read the diffs. He called it "not too bad for throwaway weekend projects". Collins Dictionary
made it its Word of the Year 2025. A year later (February 2026) he proposed **"agentic
engineering"** for the professional version, whose goal is to "claim the leverage from the use
of agents but without any compromise on the quality of the software".

| | Vibe coding | Agentic engineering |
|---|---|---|
| Who reads the code? | Nobody — "Accept All" | You, every line you merge |
| What decides "done"? | "It seems to work" | Tests, CI and review |
| Good for | Throwaway prototypes, personal scripts, demos | Anything with users, data, money or security |
| Main risk | Hidden bugs and security holes (see the security data in §1–3) | Slower start; needs discipline |

Google calls this skill **AI fluency** — using AI tools well and checking their output — and a
Google spokesperson told Business Insider (October 2026) that it is now required for all
software engineering jobs. How to show it in an interview: [Ch 2 §1.4](#content/02_behavioral_interview)
and §11.

</details>

## Protocols in One Minute

<details>
<summary><strong>Read as text</strong> — MCP, A2A, AGENTS.md and ACP in one line each</summary>

| Protocol | What it standardizes | Started by |
|---|---|---|
| **MCP** (Model Context Protocol) | How an agent reaches tools and data (GitHub, databases, Slack…) | Anthropic, Nov 2024 |
| **A2A** (Agent2Agent) | How agents from different vendors hand tasks to each other | Google, Apr 2025 |
| **AGENTS.md** | A README for coding agents: build and test commands, house rules | OpenAI |
| **ACP** (Agent Client Protocol) | How any compatible agent runs inside any compatible editor — like LSP did for language servers | Zed, with JetBrains |

MCP and AGENTS.md (with Block's goose agent) were donated to the Linux Foundation's **Agentic AI
Foundation** on 9 December 2025, and A2A joined it in August 2026, so they are now
vendor-neutral. How they work: [Ch 18 §18.3](#content/18_ai_agents).

</details>

---

# SECTION 6: What Tech Leaders Say — and What Their Companies Did

**Simple Explanation:** CEO quotes make headlines, but they are forecasts by people who sell AI
or need investors to believe in it. Read each one with three questions: what exactly was said
(not the headline), when, and what the company did next. Below are the exact words with date and
venue, then a table that checks them against the companies' own numbers.

> **Key number:** Google says **75%** of its new code is AI-generated and approved by engineers
> (April 2026, company-reported) — and Alphabet's headcount still grew **7.7%** in the year to
> 30 September 2026, from 190,167 to 204,757 (Alphabet Q3 2026 earnings release).

![Infographic: What tech leaders say versus what their companies did, as of Nov 2026. Key number: Google says 75% of its new code is AI-generated and approved by engineers (Pichai, Apr 2026, company-reported), yet Alphabet headcount grew 7.7% from Sep 2025 to Sep 2026. Three columns of said versus did: Google, Sundar Pichai on 4 Jun 2025 expecting to grow the engineering base, employees 190,167 to 204,757; Meta, Mark Zuckerberg in Jan 2025 promising an AI midlevel engineer, then plus 30% output per engineer and headcount 66,775, down 15% in a year; Salesforce, Marc Benioff in Dec 2024 saying no new software engineers in 2025, engineering about 15,000 and mostly flat for 2 years. Dario Amodei at Davos, 20 Jan 2026, said the model might do most, maybe all of what SWEs do in six to 12 months, and in the same answer that it could take a few years.](diagrams/era03_info_leaders_vs_data_ai.png)

## The Quotes — Exact Words, Date and Venue

<details>
<summary><strong>Read as text</strong> — the exact quotes from Amodei, Hassabis, Pichai, Zuckerberg, Altman and Benioff</summary>

**Dario Amodei, CEO of Anthropic** — World Economic Forum, Davos, session "The Day After AGI",
20 January 2026:

> "I have engineers within Anthropic who say I don't write any code anymore. I just let the
> model write the code. I edit it. I do the things around it. I think, I don't know, we might be
> six to 12 months away from when the model is doing most, maybe all of what SWEs do
> end-to-end."

In the same answer he added: "It's easy to see how this could take a few years." Earlier, in an
Axios interview (28 May 2025), he warned that AI could wipe out half of entry-level white-collar
jobs and push US unemployment to 10–20% within one to five years (Axios's summary of his words).

**Demis Hassabis, CEO of Google DeepMind** — same session:

> "...if I was to talk to a class of undergrads right now I would be telling them to get really
> unbelievably proficient with these tools."

He also said he expected 2026 to show "the beginnings" of an effect on junior and entry-level
jobs and internships.

**Sundar Pichai, CEO of Google and Alphabet:**

> "I expect we will grow from our current engineering base even into next year, because it
> allows us to do more with the opportunity space." — Bloomberg Tech conference, San Francisco,
> 4 June 2025

> "Today, 75% of all new code at Google is now AI-generated and approved by engineers, up from
> 50% last fall." — Google blog post for Cloud Next '26, 22 April 2026

How this share grew, and what "AI-generated" does and does not mean, is in §1.

**Mark Zuckerberg, CEO of Meta** — *The Joe Rogan Experience*, January 2025:

> "Probably in 2025, we at Meta, as well as the other companies that are basically working on
> this, are going to have an AI that can effectively be a sort of midlevel engineer that you
> have at your company that can write code."

**Sam Altman, CEO of OpenAI:**

> "Today [AI] is like an intern that can work for a couple of hours, but at some point it'll be
> like an experienced software engineer that can work for a couple of days." — Snowflake Summit,
> June 2025

> "2026 will likely see the arrival of systems that can figure out novel insights." — *The
> Gentle Singularity* (blog post), 10 June 2025

**Marc Benioff, CEO of Salesforce** — said in December 2024 (*20VC* podcast) that Salesforce
would add no software engineers in 2025 because AI had raised productivity. On the earnings call
of 27 May 2026, about the engineering team:

> "you've had the 15,000 engineers for about two years. It's been mostly flat."

</details>

## What Their Companies Did — the Quotes Checked Against Data

<details>
<summary><strong>Read as text</strong> — said vs did for Google, Meta and Salesforce, and the pattern</summary>

| Company | What its leader said | What the company reported next |
|---|---|---|
| **Google** | Engineering base will keep growing (Jun 2025); 75% of new code AI-generated (Apr 2026) | Employees 190,167 → 204,757 (+7.7%) from Sep 2025 to Sep 2026, all roles (Q3 2026 earnings release) |
| **Meta** | An AI "midlevel engineer" during 2025 (Jan 2025) | "a 30% increase in output per engineer" since the start of 2025, mostly from agentic coding (CFO, Jan 2026 call); headcount 66,775 on 30 Sep 2026, down 15% in a year, after a ~10% layoff in May 2026 (Q3 2026 results; Reuters) |
| **Salesforce** | No new software engineers in 2025 (Dec 2024) | Engineering held at about 15,000 for two years (May 2026 call); customer support cut from 9,000 to about 5,000 people (Benioff, Aug 2025) |

```
  THE PATTERN (checked against the table above)
  ──────────────────────────────────────────────
  1. Headlines predict REPLACEMENT; what actually changed first is HIRING —
     and it differs by company (Google grew, Salesforce held engineering flat,
     Meta shrank).
  2. Every company reports MORE OUTPUT PER ENGINEER. These are company-reported
     numbers ("output" is often code changes, not value) — compare them with the
     independent studies in §1.
  3. Timelines slip: the 2025 "midlevel engineer" became +30% output per
     engineer, and Amodei himself said "this could take a few years".
  4. What is consistent: the engineers who stay are expected to DIRECT and CHECK
     AI — exactly Hassabis's advice to students.
```

</details>

---

# SECTION 7: The New Career Paths

**Simple Explanation:** new job titles appear wherever companies need people to turn AI models
into products that work, stay safe and can be measured. Titles come and go fast — "prompt
engineer" was the hot job of 2023 and had mostly faded into a general skill by 2025 — but the
skills underneath last: solid software engineering, knowing how LLMs and agents behave, and
measuring quality.

> **Key number:** the US Bureau of Labor Statistics projects jobs for software developers, QA
> analysts and testers to grow **10%** from 2025 to 2035 — almost three times the **3.5%** for
> all jobs (BLS Employment Projections 2025–35, released 27 August 2026; a projection).

![Infographic: the new career paths in the AI era. A software engineering core (design, code, test, debug, ship) branches into five roles: AI engineer, forward-deployed engineer, eval / agent engineer, ML platform / inference engineer and AI security engineer, with prompt engineer (2023) shown as a faded leaf. Key number: BLS projects software developer, QA and tester jobs to grow 10% from 2025 to 2035 versus 3.5% for all jobs. Job data as of Nov 2026: AI engineer is the number-one fastest-growing US title (LinkedIn 2026), forward-deployed postings 5,230% above January 2025 (Indeed), and 71% of the software-postings rise is senior roles, 37% with AI in the title (Indeed Hiring Lab, Jul 2026).](diagrams/era03_info_new_career_paths_ai.png)

<details>
<summary><strong>Read as text</strong> — the career tree: one core, five branches</summary>

```
              SOFTWARE ENGINEERING CORE  (design · code · test · debug · ship)
                                       │
     ┌──────────────┬──────────────────┼──────────────────┬──────────────────┐
     │              │                  │                  │                  │
 AI engineer   Forward-deployed   Eval / agent       ML platform /      AI security
 (build with   engineer (put AI   engineer           inference          engineer
  models)      into a customer's  (measure quality)  engineer (serve    (keep it safe)
               systems)                              it fast, cheaply)
```

</details>

## Roles That Grew (as of November 2026)

| Role | What you do | Core skills | Learn it in |
|---|---|---|---|
| **AI engineer** (LLM / applied AI engineer) | Build products on top of models: RAG, agents, tool calling, evals | Software engineering, LLM APIs, retrieval, evaluation | [Ch 17b](#content/17b_llm_applications), [Ch 18](#content/18_ai_agents), [Ch 19](#content/19_ai_frameworks) |
| **Forward-deployed engineer** | Work inside a customer's systems to get AI into production | Full-stack and integration work, clear communication | [Ch 18b](#content/18b_agents_in_production), [Ch 23](#content/23_system_design_fundamentals_deep_dive) |
| **Evaluation / agent engineer** | Build test sets, LLM judges, agent harnesses and monitoring | Statistics, test design, tracing | [Ch 17c §4](#content/17c_llm_systems), [Ch 18b §18.12](#content/18b_agents_in_production) |
| **ML platform / inference engineer** | Serve models fast and cheaply on GPUs/TPUs; run the MLOps pipeline | Distributed systems, model serving, cost | [Ch 17c](#content/17c_llm_systems), [Ch 29](#content/29_gpus_tpus_infrastructure) |
| **AI security engineer** | Defend against prompt injection, data leaks and unsafe agent actions; red-team | Application security, LLM threat models, sandboxing | [Ch 17b §5.11](#content/17b_llm_applications), [Ch 18b §18.14](#content/18b_agents_in_production) |

## What the Job Data Says (each number labelled)

<details>
<summary><strong>Read as text</strong> — the job-data signals, pay and what it means</summary>

| Signal | Number | Source (type) |
|---|---|---|
| AI engineer is the fastest-growing US job title | #1 of 25; most common previous job: software engineer; median prior experience 3.7 years | LinkedIn Jobs on the Rise 2026, job starts Jan 2023–Jul 2025 (platform data) |
| Forward-deployed engineer postings | April 2026 = 5,230% above the January 2025 level, about 8 times a year earlier — from a tiny base | Indeed data via Business Insider, May 2026 (job postings) |
| Where software hiring is growing | Postings up about 15% since late Feb 2025 while all US postings fell 7%; 71% of the rise was senior roles, 37% had "AI" in the title (the groups overlap) | Indeed Hiring Lab, 8 Jul 2026 (job postings) |
| Software postings vs pre-pandemic | 79 on 16 Oct 2026, where Feb 2020 = 100 | Indeed via FRED (job postings index) |
| Prompt engineer as a standalone job | Faded — the skill moved into every role | *Wall Street Journal*, 25 Apr 2025 (reporting) |

**Pay:** salary figures for these new titles vary widely by company and change fast, so treat
any single number with care. One solid anchor: the BLS median annual wage for software
developers was 135,980 USD in May 2025. The wage premium for AI skills is in §3, and what all
this means for juniors is in §8.

**What this means:** the profession is projected to keep growing faster than average, but new
openings lean towards experienced engineers who can build with AI and check it. That is the case
for the playbook in §11.

</details>

---

# SECTION 8: Junior Developers — The Entry Door Is Narrower

**Simple Explanation:** The tasks that used to train new engineers — boilerplate, small bug fixes, simple tests — are exactly what AI coding tools do well. As a result, many companies now hire fewer new graduates and expect the ones they do hire to deliver more from day one. Experienced engineers have not seen the same drop. The door is narrower, not closed: it favours juniors who use AI well **and** can explain every line it writes.

> **Key number:** employment of 22–25-year-olds in AI-exposed jobs is **19% below** where it would be had it kept pace with their less-exposed peers, while experienced workers show no comparable gap (Stanford Digital Economy Lab, payroll data to June 2026, published August 2026).

![Infographic: junior developers, the entry door is narrower, not closed. Key number as of Nov 2026: employment of 22 to 25-year-olds in AI-exposed jobs is 19% below where it would be, with no comparable gap for experienced workers (Stanford Digital Economy Lab, payroll data to June 2026). Three forces (big tech still hiring 25% below 2019, AI doing boilerplate, small fixes and tests, and about 12 engineers per manager making review the bottleneck) push into a narrowing door: fewer junior seats and a higher bar. A junior walks through carrying a proof kit: an AI-assisted PR they can explain, a test that caught an AI bug, DSA without AI, and a deployed RAG or agent app with evals. An evidence table lists Stanford payroll, SignalFire 2026 hiring data, PwC 2026 job ads, Challenger employer announcements and Cui et al. 2025 randomized trials.](diagrams/era03_info_junior_entry_door_ai.png)

## What the Data Says (as of Nov 2026)

<details>
<summary><strong>Read as text</strong> — the evidence table, the three forces and the good news</summary>

| Source (evidence type) | Finding | How to read it |
|---|---|---|
| Stanford Digital Economy Lab, *Canaries in the Coal Mine?* (ADP **payroll data**, millions of US workers, to June 2026) | No economy-wide job loss. Ages 22–25 in AI-exposed jobs: 19% below the counterfactual, a gap that has widened since August 2025. It comes mostly from **fewer hires**, not more firings, and sits where AI substitutes for the work; where AI complements workers, employment is flat or rising | The strongest evidence so far — but the authors call these "early, descriptive indicators" rather than causal estimates |
| Hosseini Maasoum & Lichtinger, Harvard (**résumé and job-ad data**, 65 million workers, 280,000+ firms; working paper, 2025–2026) | After a firm starts adopting generative AI, its junior employment falls relative to non-adopters, while senior employment stays largely unchanged — again through slower hiring | The same pattern inside individual firms |
| SignalFire *State of Talent 2026* (a venture-capital firm's **hiring data**, June 2026) | New-grad hiring is about 65% below 2019 at 12 large tech companies and about 76% below at early-stage startups. Engineering held up best: software engineers are 55% of big-tech hires (46% in 2019) | Far fewer new-grad seats — but engineering itself is not collapsing |
| PwC *2026 Global AI Jobs Barometer* (1 billion+ **job ads**) | AI-exposed entry-level roles are 7× more likely to ask for senior-level skills such as judgement and leadership — and those roles grew 35% since 2019, while other entry-level roles fell 10% (US data) | The entry bar rose; these jobs did not vanish |
| Challenger, Gray & Christmas (US **employer announcements**) | Employers named AI in 121,401 announced job cuts in January–October 2026 (about 20% of announced cuts), up from 54,836 in all of 2025. October 2026 had 1,265 — the lowest month of the year — and economic conditions overtook AI as the top stated reason for 2026 | These are the reasons employers **give**, not measured causes |

**How to read this:** the strongest data (payroll and résumés) shows fewer *hires* of young workers where AI can do the work — not mass firing, and not the end of engineering. Layoff headlines that "blame AI" repeat what companies announce. How to judge AI statistics in general is in §1.

```
  WHY THE ENTRY DOOR NARROWED — three forces at once

  1. Money   2022 hiring peak → 2023 crash → years of "efficiency"
             (big tech still hires 25% below 2019 — SignalFire 2026)
  2. AI      the old training tasks — boilerplate, small fixes, tests —
             are what AI coding tools do best
  3. Teams   flatter orgs: ~12 engineers per manager at big tech;
             the bottleneck moved from WRITING code to REVIEWING it
                                  │
                                  ▼
       fewer junior seats  +  a higher bar for the seats that remain
```

**The good news — also in the data:**

- **AI helps beginners most when they use it.** Across three field experiments with 4,867 developers at Microsoft, Accenture and a Fortune 100 company, less experienced developers adopted the AI assistant more and gained more (Cui et al., 2025).
- **AI-exposed entry-level roles grew** 35% since 2019 — they simply ask for judgement and leadership earlier (PwC 2026).
- **New paths open:** top computer-science graduates of 2025 were twice as likely to call themselves founders as the 2022 class (SignalFire 2026).

</details>

## Strategy for Juniors

<details>
<summary><strong>Read as text</strong> — Osmani's advice, the proof-you-can-show table and two myths</summary>

Addy Osmani — 14 years at Google (Chrome, then a director at Google Cloud AI), now at Anthropic working on Claude Code — wrote in *The Next Two Years of Software Engineering* (January 2026): "Make yourself AI-proficient and versatile. Demonstrate that one junior plus AI can match a small team's output." And: "Use AI as a learning tool, not a crutch."

| Do this | Why it matters | Proof you can show an interviewer |
|---|---|---|
| Build bigger features with an agent — and be able to explain every line | Reviewers and interviewers will ask "why this line?" | A walk-through of one AI-assisted pull request: what you kept, what you rejected, and why |
| Get good at verification: write tests first, read stack traces, use a debugger | Review is the new bottleneck | A test you wrote that caught an AI bug |
| Keep the fundamentals: sometimes switch AI off and write key algorithms by hand | You cannot debug what you do not understand, and AI that does your thinking can hurt learning ([Ch 5 §5.11](#content/05_brain_training)) | DSA practice without AI ([Ch 31](#content/31_dsa_foundations)) |
| Build one AI-integrated project end to end | Google requires AI fluency for all software-engineering roles ([Ch 2 §1.4](#content/02_behavioral_interview)) | A deployed RAG or agent app with a small evaluation set |
| Widen the door: internships, open source, adjacent roles (QA, DevRel, data), contracting, your own product | There are fewer classic new-grad seats | Merged open-source pull requests; real users |

**Watch out — two opposite myths:** "AI has replaced junior developers" (the data shows no economy-wide displacement, and AI-exposed entry roles grew) and "nothing has changed" (a 19% employment gap for 22–25-year-olds, and about 65% fewer new-grad hires at big tech than in 2019).

</details>

---

# SECTION 9: The New "10x Engineer" — Leverage, Not Typing Speed

**Simple Explanation:** The old "10x engineer" was the person who coded fastest. Now an AI agent can type the code, so typing speed stops being the edge. What multiplies output is **leverage**: turning a fuzzy goal into a clear spec, handing the right pieces to AI, and checking the result quickly and correctly. The multiplier is real on some tasks — and zero, or even negative, on others.

> **Rule of thumb:** AI amplifies what is already there — clear specs, good tests and fast review get multiplied, and so do vague goals and weak review ("AI is an amplifier" — DORA 2025).

![Infographic: the new 10x engineer, leverage not typing speed. Rule of thumb from DORA 2025: AI amplifies what is already there. Old 10x (about 2015) codes fast and is measured by features typed; new 10x (2026) writes specs and verifies fast, running a loop of spec, plan, small diffs, tests and review, and is measured by correct, reviewed changes shipped. Three randomized trials disagree because the setting differs: Cui et al. 2025, plus 26% completed tasks for 4,867 developers; Paradis et al. 2024 at Google, about 21% less time; METR 2025, 19% more time for experienced maintainers in their own large repos. A table shows where AI helps most, from large speed-ups on boilerplate and tests to fast but often unsafe security-sensitive code, and a quality card notes about 44% of AI code-generation tasks had a known vulnerability (Veracode 2026) and lower delivery stability (DORA 2025).](diagrams/era03_info_leverage_not_typing_ai.png)

## Old vs New

<details>
<summary><strong>Read as text</strong> — the old-vs-new table, one feature done two ways, and why judgement still matters</summary>

| | Old "10x" (≈ 2015) | New "10x" (2026) |
|---|---|---|
| Edge | Codes and debugs fast; knows many frameworks | Writes clear specs; splits work for agents; verifies fast |
| Bottleneck | Writing code | Deciding what to build, and reviewing what was built |
| Measured by | Features I typed | Correct, reviewed changes shipped through me and my AI tools |
| Typical failure | Hero code nobody else understands | Lots of fast, unreviewed code |

```
  ONE FEATURE, TWO WAYS — "add per-user rate limiting to the API"

  OLD WAY (you type everything)      NEW WAY (you lead, AI types) — the loop in §5
  ─────────────────────────────      ────────────────────────────────────────────
  read code → design → write code    1. SPEC    limits, error code, edge cases and
  → write tests → debug → PR                    acceptance tests — written by YOU
                                     2. PLAN    the agent proposes; you fix the plan
                                     3. DIFFS   one small change per pull request
                                     4. TESTS   run on every diff
                                     5. REVIEW  you read every line and ask the
                                                security question: can the "user"
                                                key be spoofed?

  Your time goes to: typing          Your time goes to: spec + review
```

**Leverage still needs judgement.** In March 2025 Y Combinator said a quarter of its Winter 2025 startups had codebases about 95% written by AI — and stressed that "every one of these people is highly technical". YC partner Diana Hu added: "In order to do good 'vibe coding,' you still need to have taste and knowledge to judge good versus bad" (TechCrunch, 6 March 2025).

</details>

## What the Evidence Says

<details>
<summary><strong>Read as text</strong> — three speed trials, and the quality bill</summary>

**Speed — randomized trials disagree because the settings differ** (how to read study types: §1):

| Study (evidence type) | Who and what | Result |
|---|---|---|
| Cui et al., 2025 (3 field **randomized trials** at Microsoft, Accenture and a Fortune 100 firm) | 4,867 developers, an AI code-completion assistant, normal work | +26% completed tasks (standard error 10 points); less experienced developers gained more |
| Paradis et al., 2024 (Google **randomized trial**) | 96 Google engineers, one enterprise-grade task, internal AI features | About 21% less time on the task (wide confidence interval) |
| METR (**randomized trial**, 2025; follow-up Feb 2026) | Experienced open-source maintainers in their own large repos | 19% **more** time in 2025; an unreliable speed-up signal in Feb 2026 — details in §1 |

**Quality — the bill can come later:**

- **Security:** about 44% of AI code-generation tasks produced a known vulnerability in Veracode's 2026 tests, even though the code compiled (§2).
- **Stability:** DORA 2025 linked AI adoption to higher delivery throughput but *lower* delivery stability (§1).
- **Maintainability:** GitClear's 2025 analysis of 211 million changed lines (2020–2024; a code-analytics vendor) found duplicated code blocks rising about 4× and copy/pasted code exceeding moved (refactored) code for the first time — a trend over time, not proof that AI caused it.

</details>

## The Honest Picture — Where AI Helps Most

<details>
<summary><strong>Read as text</strong> — where AI helps by task type, and the trap</summary>

| Task | Typical effect (rule of thumb, consistent with the trials above) | Your job |
|---|---|---|
| Boilerplate, glue code, tests for a clear spec, unfamiliar APIs | Large speed-up | Skim, run the tests |
| Medium features in a well-tested codebase | Clear speed-up | Spec, plan, review small diffs |
| Deep changes in a huge codebase you know by heart; novel design | Small, none or negative | Lead; use AI for search, drafts and tests |
| Security-sensitive code (auth, payments, input handling) | Fast but often unsafe | Threat-model and security-review every line |

**The trap:** judging leverage by how much code AI produced. Judge it by how much *correct, reviewed* work ships — and by what breaks afterwards.

</details>

---

# SECTION 10: Common Mistakes Engineers Are Making

**Simple Explanation:** Most AI mistakes are not about the tool — they are about habits: trusting output you did not check, building fast before you know what to build, or swinging to an extreme (refusing AI, or depending on it completely). Each mistake below has a cheap fix.

> **Key number:** only 7% of developers trust AI output with important decisions, and 48% trust it only when they can easily verify it (Stack Overflow Developer Survey 2026, self-reported).

![Infographic: 7 common AI mistakes engineers make and how to measure your own speed-up. Key number: only 7% of developers trust AI output with important decisions and 48% trust it only when they can easily verify it (Stack Overflow 2026, survey). Seven mistake-to-fix rows: faster typewriter to the agentic loop, building the wrong thing fast to requirements and acceptance tests, trusting without verifying to review plus security checks in CI, skipping fundamentals to coding key algorithms without AI, trusting your gut to measuring, ignoring AI to one free tool daily, prompt monkey to real skills and AI. A four-step measurement flow (estimate, flip a coin, log the time, compare actual-to-estimate ratios) and a worked example of 12 tasks: mean ratio 1.02 with AI and 1.07 without gives a time change of minus 5% with a 95% CI from minus 22% to plus 13%, while the gut guess of minus 25% falls outside the interval on a number line.](diagrams/era03_info_common_mistakes_ai.png)

<details>
<summary><strong>Read as text</strong> — the seven mistakes, why they hurt, and the fixes</summary>

| # | Mistake | Why it hurts | Fix |
|---|---|---|---|
| 1 | **AI as a faster typewriter** — autocomplete, or pasting errors into a chat | You get the smallest gains | Move to the agentic loop in §5: spec → plan → small diffs → tests → review |
| 2 | **Building the wrong thing efficiently** | AI speeds up whatever you aim it at — including a wrong requirement | Spend more time on requirements, acceptance tests and design; less on typing |
| 3 | **Trusting without verifying** | Code that compiles is not code that is safe: about 44% of AI code-generation tasks fail security tests (Veracode 2026, §2) | Review AI output like a new teammate's pull request; run tests and security checks in CI |
| 4 | **Skipping fundamentals** | When the output breaks, you cannot debug what you do not understand | Sometimes switch AI off and write key algorithms by hand ([Ch 31](#content/31_dsa_foundations)) |
| 5 | **Trusting your gut about speed-up** | In METR's 2025 trial developers expected AI to make them 24% faster; tasks took 19% longer, and even afterwards they believed AI had sped them up by 20% (§1) | Measure it — see the next subsection |
| 6 | **Ignoring AI entirely** | 83% of respondents already use AI tools at work (Stack Overflow 2026), and Google requires AI fluency for all software-engineering roles ([Ch 2 §1.4](#content/02_behavioral_interview)) | Start with one free tool (§11) on real tasks, daily |
| 7 | **Becoming a "prompt monkey"** — you can only work with AI | Models hallucinate, tools go down, and novel problems need your own thinking | Build real skills **and** use AI: together they are strong, either alone is fragile |

</details>

## Measure Your Own AI Speed-Up

<details>
<summary><strong>Read as text</strong> — why your gut is a poor stopwatch, and the four-step experiment</summary>

**Simple Explanation:** Your feeling about AI speed is a poor measuring tool — METR's developers were 19% slower and still felt faster. A tiny personal experiment fixes that, using the same idea as a randomized trial.

1. **Estimate** — before each task, write down how long it would take you *without* AI.
2. **Flip a coin** — heads: AI allowed; tails: no AI. The coin stops you from using AI only on the easy tasks.
3. **Log** the real time.
4. **Compare** the average actual ÷ estimate ratio with and without AI: `time change = mean ratio (AI) ÷ mean ratio (no AI) − 1` (negative = faster with AI).

</details>

```python
# Measure your own AI speed-up: estimate first, flip a coin, log the time, compare actual/estimate ratios
import numpy as np

rng = np.random.default_rng(0)
# One row per task: (your estimate WITHOUT AI in minutes, actual minutes, coin said "use AI"?)
log = [(60, 50, True), (30, 41, True), (90, 70, True), (45, 52, True), (120, 95, True), (40, 47, True),
       (60, 66, False), (30, 33, False), (90, 99, False), (45, 41, False), (120, 130, False), (40, 46, False)]
estimate = np.array([row[0] for row in log], dtype=float)
actual = np.array([row[1] for row in log], dtype=float)
used_ai = np.array([row[2] for row in log])
ratio = actual / estimate                      # 1.10 = took 10% longer than you estimated

def time_change(r_ai, r_no):
    return r_ai.mean() / r_no.mean() - 1       # negative = faster with AI

r_ai, r_no = ratio[used_ai], ratio[~used_ai]
point = time_change(r_ai, r_no)
# Bootstrap: resample tasks within each group 10,000 times to get a 95% confidence interval
boots = [time_change(rng.choice(r_ai, r_ai.size), rng.choice(r_no, r_no.size)) for _ in range(10_000)]
lo, hi = np.percentile(boots, [2.5, 97.5])
felt = -0.25                                   # your gut feeling: "AI makes me about 25% faster"
width = (hi - lo) * 100

print(f"Tasks: {r_ai.size} with AI, {r_no.size} without")
print(f"Mean actual/estimate: with AI {r_ai.mean():.2f}, without {r_no.mean():.2f}")
print(f"Measured time change with AI: {point:+.0%} (95% CI {lo:+.0%} to {hi:+.0%})")
print(f"Felt time change: {felt:+.0%} -> inside the CI? {lo <= felt <= hi}")
print(f"CI width: {width:.0f} points -> with 4x the tasks, about {width / 2:.0f} points")
assert lo < point < hi and lo < 0 < hi         # 12 tasks: cannot yet tell faster from slower
```

**Output:**

```
Tasks: 6 with AI, 6 without
Mean actual/estimate: with AI 1.02, without 1.07
Measured time change with AI: -5% (95% CI -22% to +13%)
Felt time change: -25% -> inside the CI? False
CI width: 35 points -> with 4x the tasks, about 18 points
```

<details>
<summary><strong>Read as text</strong> — continued: reading the result</summary>

**Read the result:** the log says about 5% faster, but the interval runs from 22% faster to 13% slower — twelve tasks cannot yet tell faster from slower. Your gut's "25% faster" lies outside even that wide interval. The interval shrinks with the square root of the number of tasks, so 4× the tasks halves it: keep logging.

</details>

---

# SECTION 11: Your Playbook — Concrete Actions

**Simple Explanation:** Small, regular actions beat one big course. This week, put one AI tool on real work. This month, build the verify-everything habit and one small agent project. This quarter, make one career-level move. Interviewing at Google? Read the last subsection.

> **Rule of thumb:** use AI on one real task every day, verify every result, and ship one AI-integrated project per quarter.

![Infographic on the AI-era career playbook: a four-step staircase from This week (0-1 h each: install one AI coding tool, add an AGENTS.md file, start a task log) to This month (30 min/day: agentic loop not autocomplete, learn MCP, a what-AI-got-wrong journal), This quarter (deepen system design, pick one domain, RAG app or agent with an eval set) and Always (public portfolio, explain to non-technical people, contribute to open-source AI); the rule of thumb use AI on one real task every day, verify every result, ship one AI project per quarter; a Google interviews card (as of Nov 2026): AI fluency required for all SWE jobs, Gemini allowed only in pilot rounds, prepare 1 AI story and 1 project deep-dive; trap: collecting tools instead of shipping verified work.](diagrams/era03_info_career_playbook_ai.png)

## Tier 1: Do This Week (0-1 hours each)

<details>
<summary><strong>Read as text</strong> — this week: one tool, an instructions file, a task log</summary>

- [ ] Install one AI coding tool and use it on real work, not toy examples. Free starting points (as of Nov 2026): **GitHub Copilot Free** (Copilot Student is free for verified students), **Google Antigravity** or **Antigravity CLI** (free individual tier; they replaced Gemini CLI for individual accounts in June 2026), **Cursor**'s free plan (Cursor has been part of SpaceX since August 2026), **OpenAI Codex** (limited, on ChatGPT Free), and the free tiers of **Kiro** (AWS) and **Devin Desktop** (formerly Windsurf). **Claude Code** needs a paid Claude plan. Brands change often — the dated landscape is in §5 and [Ch 20 §20.4](#content/20_2026_landscape).
- [ ] Give your agent a short project-instructions file: build and test commands, code style, what not to touch. **AGENTS.md** ("a README for agents") is read by many agents, including Codex, VS Code and Devin; Claude Code uses **CLAUDE.md**.
- [ ] Start a one-line-per-task log — task, your estimate, AI or not, actual time — for the speed-up check in §10.
- [ ] Follow one community: Hacker News, r/LocalLLaMA, or your tool's own forum.

</details>

## Tier 2: Do This Month (ongoing, 30 min/day)

<details>
<summary><strong>Read as text</strong> — this month: the agentic loop, one project, MCP, three papers, a mistakes journal</summary>

- [ ] Move from autocomplete to the agentic loop in §5: spec → plan → small diffs → tests → review.
- [ ] Build one small project end to end with an agent — then explain every file out loud.
- [ ] Learn MCP (Model Context Protocol), the standard way agents connect to tools and data ([Ch 18 §18.3](#content/18_ai_agents)).
- [ ] Read three papers you can explain: "Attention Is All You Need" (2017), BERT (2018) and one recent one — a Google-focused list is in [Ch 1 §0.10](#content/01_google_ai_engineer_strategy).
- [ ] Keep a "what AI got wrong" journal: every bug, hallucination or security issue you caught.

</details>

## Tier 3: Do This Quarter (career-level moves)

<details>
<summary><strong>Read as text</strong> — this quarter: design, a domain, how AI works, an app with evals</summary>

- [ ] Deepen system design: *Designing Data-Intensive Applications* (2nd edition, 2026) plus [Ch 23](#content/23_system_design_fundamentals_deep_dive)–[25](#content/25_system_design_operations_case_studies).
- [ ] Pick one domain — healthcare, finance, infrastructure, developer tools… — and go deep.
- [ ] Learn how AI works. You don't need to become an ML engineer, but you must be AI-literate ([Ch 17](#content/17_llm), [Ch 17b](#content/17b_llm_applications)).
- [ ] Build something that combines software engineering and AI — a RAG app, an agent, or an AI feature in an existing product — **with an evaluation set** ([Ch 17c §4](#content/17c_llm_systems)).
- [ ] Practise AI-assisted system design, not just AI-assisted coding.

</details>

## Tier 4: Ongoing Career Strategy

<details>
<summary><strong>Read as text</strong> — always: your story, a portfolio, a few sources, open source</summary>

- [ ] Shift your story from "I write code" to "I design systems and ship verified work with AI".
- [ ] Keep a public portfolio: AI-integrated projects plus short write-ups of what you verified and why.
- [ ] Stay current with a few good sources, not a firehose (§12).
- [ ] Practise explaining technical decisions to non-technical people.
- [ ] Contribute to open-source AI tools or MCP servers.

</details>

## For Google Interviews: Show AI Fluency

<details>
<summary><strong>Read as text</strong> — what Google expects (as of Nov 2026) and what to prepare</summary>

A Google spokesperson told Business Insider (October 2026) that AI fluency is now required for all software-engineering jobs, and Google is piloting rounds in which candidates use Gemini to read, debug and optimize code. Outside such pilot rounds, AI is **not** allowed in Google interviews. Prepare one story about using AI tools well — and checking their output — and one past project you can discuss in depth. Details and current status: [Ch 2 §1.4](#content/02_behavioral_interview).

</details>

---

# SECTION 12: The Learning Stack — What to Study

**Simple Explanation:** Learn what AI makes *more* valuable: deciding what to build (design), understanding what was built (fundamentals), checking it (verification and security), and knowing how the AI itself works. Use AI tools every day while you learn — as a tutor, not a crutch ([Ch 5 §5.11](#content/05_brain_training)).

> **Rule of thumb:** study the skills AI makes more valuable — design, fundamentals, verification and how AI works — and practise them *with* AI tools, not instead of them.

![Infographic on the learning stack: the rule of thumb study design, fundamentals, verification and how AI works and practise them with AI tools; a priority pyramid with MUST at the base (AI tool fluency Ch 20, system design Ch 23-26, CS fundamentals Ch 31), HIGH in the middle (verification and security incl. prompt injection, how AI works, building AI features with RAG, agents, MCP and evals) and MEDIUM on top (domain expertise, communication and leadership); a pick-by-question table; why-now evidence as of Nov 2026: Google requires AI fluency for all SWE roles, 68% expected employers to require AI-tool skills (JetBrains 2025 survey), about 44% of AI code tasks fail security tests (Veracode 2026 vendor benchmark), AI-exposed entry roles 7 times more likely to need judgement and leadership (PwC 2026 job-ad data); a sample week of 2 design, 2 DSA with AI off and 1 build session with about 20 eval questions.](diagrams/era03_info_learning_priority_ai.png)

## The New Software Engineer Learning Priority

| Priority | Skill | Why it matters now | Learn it in |
|---|---|---|---|
| 1 — Must | AI tool fluency: specs, agents, review | Google requires AI fluency for all software-engineering roles ([Ch 2 §1.4](#content/02_behavioral_interview)); 68% of developers expected employers to require AI-tool proficiency soon (JetBrains, 2025) | §5, §11, [Ch 20 §20.4](#content/20_2026_landscape) |
| 2 — Must | System design and architecture | Code is cheap; deciding what to build is not | [Ch 23](#content/23_system_design_fundamentals_deep_dive)–[25](#content/25_system_design_operations_case_studies), [Ch 26](#content/26_ml_system_design) |
| 3 — Must | CS fundamentals: DSA, OS, networking | You cannot debug what you do not understand | [Ch 31](#content/31_dsa_foundations), [Ch 23](#content/23_system_design_fundamentals_deep_dive) |
| 4 — High | Verification, testing and security, incl. prompt injection | About 44% of AI code-generation tasks fail security tests (Veracode 2026); AI adoption goes with less stable delivery (DORA 2025) | [Ch 17b §5.11](#content/17b_llm_applications), [Ch 18b](#content/18b_agents_in_production) |
| 5 — High | How AI works: transformers, embeddings, RAG, fine-tuning | Know a tool's limits before you trust it | [Ch 17](#content/17_llm), [Ch 17b](#content/17b_llm_applications) |
| 6 — High | Building AI features: RAG, agents, MCP, tool calling, evals | Google also asks for AI product integration in most roles above entry level ([Ch 2 §1.4](#content/02_behavioral_interview)) | [Ch 18](#content/18_ai_agents), [Ch 19](#content/19_ai_frameworks), [Ch 17c §4](#content/17c_llm_systems) |
| 7 — Medium | Domain expertise (pick one and go deep) | AI is general; your context is not | — |
| 8 — Medium | Technical communication and leadership | AI-exposed entry-level roles are 7× more likely to ask for judgement and leadership (PwC 2026) | [Ch 2](#content/02_behavioral_interview) |

<details>
<summary><strong>Read as text</strong> — a sample study week</summary>

**A sample week (five sessions of about an hour):** two system-design sessions ([Ch 23](#content/23_system_design_fundamentals_deep_dive)–[26](#content/26_ml_system_design)), two DSA sessions with AI switched off ([Ch 31](#content/31_dsa_foundations)), and one build session — for example a small RAG feature with about 20 evaluation questions ([Ch 17c §4](#content/17c_llm_systems)). When you use AI to learn, ask for hints, not answers ([Ch 5 §5.11](#content/05_brain_training)).

</details>

## Recommended Resources

**AI tools (learn by doing):** start with one free tool from §11 Tier 1; the full landscape is in §5.

**Books:**

| Area | Book | Note |
|---|---|---|
| System design | *Designing Data-Intensive Applications* — Martin Kleppmann & Chris Riccomini | 2nd edition, O'Reilly, March 2026 |
| System design | *System Design Interview* Vol. 1 & 2 — Alex Xu (Vol. 2 with Sahn Lam) | Interview framework and case studies |
| ML system design | *Machine Learning System Design Interview* — Ali Aminian & Alex Xu (2023) | The closest prep book for the ML design round |
| GenAI system design | *Generative AI System Design Interview* — Ali Aminian & Hao Sheng (2024) | GenAI design cases |
| AI engineering | *AI Engineering* — Chip Huyen (O'Reilly, 2025) | Building on foundation models; evaluation |
| Production ML | *Designing Machine Learning Systems* — Chip Huyen (O'Reilly, 2022) | Data, deployment, monitoring |
| Agentic coding | *Agentic Engineering* — Addy Osmani (O'Reilly early release; final edition due 2027) | Specs, harnesses and verification for coding agents |

**AI/ML literacy (this repo):**

- [Ch 17](#content/17_llm) — how LLMs work; [Ch 17b](#content/17b_llm_applications) — how to use them
- [Ch 18](#content/18_ai_agents) and [Ch 18b](#content/18b_agents_in_production) — agents, and agents in production
- [Ch 14](#content/14_neural_networks) and [Ch 16](#content/16_deep_learning) — neural-network and deep-learning foundations
- [Ch 6](#content/06_math_fundamentals) — the maths for ML, explained simply
- [Ch 33](#content/33_llm_interview_questions) and [Ch 33b](#content/33b_llm_interview_questions_part2) — LLM interview questions
- [Ch 20](#content/20_2026_landscape) — the 2026 model and tool landscape

**Stay current (all active as of Nov 2026):**

| Source | Type | Why |
|---|---|---|
| *The Pragmatic Engineer* — Gergely Orosz | Newsletter and podcast | How AI is changing engineering teams, with survey data |
| Simon Willison's Weblog | Blog | Practical, hands-on notes on LLMs and agentic engineering |
| Addy Osmani's blog | Blog | AI-assisted engineering; *The Next Two Years of Software Engineering* (January 2026) |
| *Latent Space* — swyx & Alessio | Podcast | AI-engineering deep dives with builders |
| Hacker News | Link aggregator | Daily developments — skim, don't binge |

---

# SECTION 13: Beating Brain Fog — Protecting Your Mind in the AI Era

**Simple Explanation:** Everything in this chapter — judging AI output, designing systems, learning fast — runs on one brain you cannot swap out. An AI-heavy day adds tools, tabs and hundreds of small "is this right?" checks, and a tired, scattered mind slips first. This is the short version; the science is in [Ch 5](#content/05_brain_training) and the full routines in [Ch 5B](#content/05b_brain_upgrade_30_days).

> **Rule of thumb:** sleep 7+ hours, move most days, protect one long single-task block, and attempt hard problems yourself before you ask AI. If the fog lasts for weeks anyway, see a doctor.

![Infographic on beating brain fog in the AI era: a fog machine where tool firehose, context switching (attention residue), review load (reviews over about 400 lines overwhelm) and cognitive offloading (exam 17% worse without AI) push into a cloudy head, versus a clear head held up by four pillars: sleep 7+ h with the same wake time, move 150-300 min a week, one 60-120 min deep block and AI-free reps, with last coffee about 9 h before bed and at most 400 mg a day; key numbers: 6 h sleep for 2 weeks gives lapses like up to 2 nights with no sleep (Van Dongen 2003), plain GPT-4 help practice +48% but exam without AI -17% (Bastani 2025 randomized trial), review 100-300 lines per sitting (Cisco 2006 vendor case study), the 54-adult EEG preprint is not peer-reviewed; a daily and weekly anti-fog checklist and when to see a doctor.](diagrams/era03_info_brain_fog_ai_era_ai.png)

## What Brain Fog Actually Is

<details>
<summary><strong>Read as text</strong> — what fog is and how to spot it</summary>

> **Brain fog** is not a medical diagnosis. It is an everyday name for a group of symptoms — trouble concentrating, mental fatigue, forgetfulness, slow thinking, not finding the right word — that is usually temporary and has many possible causes, from short sleep and stress to medical conditions (Cleveland Clinic, 2024).

```
  YOU MIGHT BE FOGGY IF...
  ──────────────────────────────────────────────────────────────
  • You re-read the same paragraph three times and retain nothing
  • Simple decisions (which ticket first?) feel weirdly heavy
  • You reach for a word or API you know well, and it won't come
  • You "work" 9 hours but produce 2 hours of real output
  • By mid-afternoon you approve AI diffs you did not really read
```

A foggy engineer doesn't get worse at typing; they get worse at judgement, system thinking and spotting the subtle bug in AI output — exactly the skills this chapter says matter most.

</details>

## Why the AI Era Makes It Worse

<details>
<summary><strong>Read as text</strong> — the five AI-era pressures and the "cognitive debt" preprint</summary>

| AI-era pressure | What it does to your focus |
|---|---|
| **Tool firehose** | A new model, IDE or agent every few weeks: lots of switching, little mastery. |
| **Context switching** | IDE ↔ chat ↔ agent ↔ Slack. After a switch, part of your mind stays on the old task ("attention residue", Leroy, 2009); in office studies, interrupted work was resumed about 23 minutes later on average ([Ch 5 §5.8](#content/05_brain_training)). |
| **Review load** | Agents write more code than you would type, and pull requests are growing (median 44 → 72 lines, DX 2026, vendor data). Big reviews miss more: in 2,500 reviews at Cisco, reviews over about 400 lines overwhelmed reviewers (SmartBear, 2006, vendor case study). |
| **Cognitive offloading** | If AI does the thinking, you get the output but not the practice. In a randomized trial (~1,000 students), plain GPT-4 help raised practice scores 48% but left students 17% worse on a later exam without AI (Bastani et al., *PNAS*, 2025; [Ch 5 §5.11](#content/05_brain_training)). |
| **Always-on inputs** | Even a notification you don't answer disrupts an attention task (Stothart et al., 2015). |

> ⚠️ **"Cognitive debt" — an early warning, not proof.** In an MIT Media Lab preprint, *"Your Brain on ChatGPT"* (Kosmyna et al., arXiv 2506.08872, 2025), 54 adults wrote essays with ChatGPT, a search engine or no tool while wearing EEG; the ChatGPT group showed the weakest brain connectivity and often could not quote their own essays. But it is small (18 people in the key fourth session), not peer-reviewed as of November 2026, and a written critique questions its EEG analysis (Stanković et al., arXiv 2601.00856). It agrees with the stronger trial above; the lesson matches §10: use AI, but keep doing the hard thinking yourself.

</details>

## How to Fix It — The Playbook

<details>
<summary><strong>Read as text</strong> — the fixes, why they work and the anti-fog checklist</summary>

Body basics first (taught in Ch 5B; the numbers match it), then AI-era work habits.

| Fix | Why it works | Learn more |
|---|---|---|
| **Sleep 7+ hours, same wake time** | 6 hours a night for 2 weeks caused attention lapses like up to 2 nights without sleep — and people barely noticed (Van Dongen et al., 2003). | [Ch 5B Pillar 3](#content/05b_brain_upgrade_30_days) |
| **Move most days** | Aerobic exercise has some of the strongest evidence for brain health. WHO target: 150–300 minutes of moderate activity a week (e.g., five 30-minute brisk walks). | [Ch 5B Pillar 1](#content/05b_brain_upgrade_30_days) |
| **Water and regular meals** | Thinking suffers clearly once you lose more than ~2% of body weight as water (Wittbrodt & Millard-Stafford, 2018). Don't start a deep block hungry. | [Ch 5B Pillar 2](#content/05b_brain_upgrade_30_days) |
| **Morning daylight; caffeine with a cut-off** | Daylight anchors your body clock. Last coffee about 9 hours before bed (≥ 8.8 h for a ~107 mg coffee; Gardiner et al., 2023), at most 400 mg a day (FDA, healthy adults). The popular "wait 90 minutes after waking" rule has little direct evidence. | [Ch 5B Pillars 3 and 7](#content/05b_brain_upgrade_30_days) |
| **One protected deep-work block** | 60–120 minutes on one task, notifications off. Forced to stop? Write a one-line "ready-to-resume" note (it reduced attention residue; Leroy & Glomb, 2018). | [Ch 5 §5.8](#content/05_brain_training) |
| **Review AI output in small batches** | Ask for small diffs; review about 100–300 lines in 30–60 minutes, never more than ~400 per sitting (Cisco case study). | §5 and §10 of this chapter |
| **AI-free reps** | Regularly solve a problem with no AI — it keeps your debugging instinct, and Google interviews allow no AI except in pilot rounds that provide it ([Ch 2 §1.4](#content/02_behavioral_interview)). | [Ch 5 §5.11](#content/05_brain_training) |
| **Input diet** | 2–3 trusted sources and one weekly "what's new" slot, not every launch live. | §12 of this chapter |

```
  THE ANTI-FOG CHECKLIST
  ──────────────────────────────────────────────────────────────────
  DAILY                               WEEKLY
  □ 7+ h sleep, same wake time        □ 150+ min of movement in total
  □ Morning daylight + water          □ 1–2 problems solved with no AI
  □ One 90-min deep-work block        □ One evening fully offline
  □ Notifications off while coding    □ Cut one feed or newsletter
  □ Last coffee ~9 h before bed       □ Protect one no-meeting block
```

</details>

## When It's More Than Just Fog

> ⚠️ **See a doctor if the fog lasts for weeks despite good sleep and daily movement, or if it gets in the way of daily life.** Go sooner if you notice worsening memory or confusion; low mood or loss of interest lasting 2+ weeks; or exhaustion despite 7–9 hours in bed, loud snoring or gasping at night (possible sleep apnoea). Common, treatable causes include sleep apnoea, an underactive thyroid, vitamin B12 deficiency, depression or anxiety, chronic stress, medication side effects and the after-effects of an illness such as long COVID (Cleveland Clinic; NHS). Ruling these out is part of staying sharp, not separate from it.
>
> **If you are struggling right now** or have any thoughts of harming yourself, contact your local emergency number or a crisis line today — in the US, call or text **988**; in India, call **Tele-MANAS 14416**. More in [Ch 5B — Safety](#content/05b_brain_upgrade_30_days).

<details>
<summary><strong>Read as text</strong> — continued: the bottom line</summary>

```
  ╔══════════════════════════════════════════════════════════════════════╗
  ║  BOTTOM LINE                                                         ║
  ║                                                                      ║
  ║  AI can take over much of your typing. It cannot take over           ║
  ║  your THINKING, and thinking is the skill the AI era pays for.       ║
  ║                                                                      ║
  ║  Sleep, move, single-task, and keep your own brain in the loop.      ║
  ║  A clear head is the one tool nobody can commoditize.                ║
  ╚══════════════════════════════════════════════════════════════════════╝
```

</details>

---

# SECTION 14: Final Perspective

**Simple Explanation:** Put the whole chapter together and one picture appears. AI is not removing the software engineer; it is moving the job away from typing code and towards deciding what to build, giving AI clear specs and context, and checking what comes back. The evidence is mixed in places — fast adoption, uneven speed-ups, fewer junior hires — and that mix is exactly why judgement and fundamentals keep their value.

> **Key number:** US software-developer jobs are projected to grow **about 10% from 2025 to 2035 (1.72 → 1.89 million, about 175,000 more jobs)**, against about 3.5% for all jobs (BLS Employment Projections 2025–35, August 2026). The previous round (2024–34) said +15.8%: projections move, so read them as direction, not precision.

![Infographic on the final perspective: key number US software-developer jobs about +10% from 2025 to 2035 (1.72 to 1.89 million, about 175,000 more, vs about 3.5% for all jobs; BLS projection, Aug 2026); evidence at a glance as of Nov 2026, each with its evidence type: 75% of Google new code AI-generated and approved by engineers (Pichai, company-reported), 83% use AI at work but about 7% trust it with important decisions (Stack Overflow 2026 survey), 19% slower with early-2025 tools while feeling about 20% faster (METR randomized trial), -19% for ages 22-25 in AI-exposed jobs (Stanford payroll data), +62% advertised pay in AI-skill job ads (PwC job-ad data), DORA 2025 AI as amplifier; the formula strong fundamentals + AI fluency + system design + domain expertise = an engineer AI makes stronger, not replaceable, with doing-well and at-risk badges; a read-each-number-by-type table.](diagrams/era03_info_final_perspective_formula_ai.png)

## The Evidence at a Glance (as of Nov 2026)

| What the evidence says | Key number | Evidence type | Source |
|---|---|---|---|
| The profession is still growing | About +10% software developers, 2025–35 ("much faster than average") | Government projection | BLS, Aug 2026 |
| AI writes much of the new code at leading companies | 75% of new code at Google is "AI-generated and approved by engineers", up from 50% in autumn 2025 | Company-reported | Sundar Pichai, 22 Apr 2026 |
| Nearly everyone uses AI; few trust it blindly | 83% use AI at work; 48% trust it when they can easily verify it; about 7% trust it with important decisions | Survey (self-reported) | Stack Overflow, 2026 |
| Speed-ups are not automatic | Experienced developers took 19% longer with early-2025 tools while believing they were about 20% faster; a 2026 follow-up points to speed-ups now, on weak data | Randomized trial (16 developers) | METR, 2025 and 2026 |
| AI amplifies the team you already have | Higher throughput, but also less stable delivery without strong testing and fast feedback | Survey (~5,000 people) | DORA, 2025 |
| The entry door is narrower | Employment of 22–25-year-olds in AI-exposed jobs is 19% below its expected path, mostly through fewer hires | Payroll data | Stanford Digital Economy Lab, Aug 2026 |
| AI skills pay | Job ads that require AI skills offer 62% higher salaries than comparable ads on average (all jobs, 27 countries) | Job-ad data (advertised salaries) | PwC, 2026 |

## The Formula

```
  ╔══════════════════════════════════════════════════════════════════════╗
  ║  THE FORMULA                                                         ║
  ║                                                                      ║
  ║      Strong fundamentals     you can debug what AI writes            ║
  ║    + AI fluency              clear specs, good context, checks       ║
  ║    + System design           you decide WHAT gets built              ║
  ║    + Domain expertise        you know what "correct" means           ║
  ║    ─────────────────────────                                         ║
  ║    = An engineer AI makes stronger, not replaceable                  ║
  ║                                                                      ║
  ║  Doing well:  use AI every day AND keep deepening fundamentals.      ║
  ║  At risk:     ignore AI entirely, OR trust it without checking.      ║
  ║                                                                      ║
  ║  Start today: one action from §11, one AI-free problem a week.       ║
  ╚══════════════════════════════════════════════════════════════════════╝
```

---

## Review Questions

Questions 1–3 test §1–§2, 4–6 test §3–§9, 7 tests §11 and 8 tests §13. Try each one aloud or on paper before opening the answers.

1. Google says 75% of its new code is AI-generated; METR measured experienced developers 19% slower with AI; vendors promise big speed-ups. Can all of these be "true", and which do you trust most?
2. What does "a 50%-time horizon of 12 hours" mean — and what does it *not* mean?
3. Your team adopted a coding agent: pull requests per week went up, and so did failed deployments. What does DORA 2025 say is happening, and what do you fix first?
4. Name the five steps of the agentic loop and your job in each. Why can an agent ship a wrong patch "with a green tick"?
5. Name three skills rising in value and one being commoditized. Why should the same AI never write both the code and its only tests?
6. Why have early-career engineers been hit hardest so far, why are "AI-cited layoffs" weak evidence, and what should a junior do?
7. Can you use AI in a Google interview? How do you still show the "AI fluency" Google asks for?
8. A colleague cites "Your Brain on ChatGPT" as proof that AI damages the brain. What is your measured reply — and what do you check first if your own afternoons have felt foggy for three weeks?

<details>
<summary><strong>Answers</strong> — short model answers</summary>

1. Yes — they measure different things. Google's 75% is a company-reported share of *output* (code generated by AI and approved by engineers); it says nothing about review time, rework, quality or headcount. METR randomized 246 real tasks done by 16 experienced developers in their own large projects with early-2025 tools: tasks took 19% longer, yet the developers believed AI had made them about 20% faster, so self-reports are unreliable. Trials in other settings found speed-ups (for example +26% completed tasks across 4,867 developers; Cui et al.), and METR's February 2026 update suggests developers are probably faster with today's tools, on weak data. Trust randomized trials over self-reports and company figures — and measure your own tasks, flipping a coin to decide "AI or no AI" so you don't use AI only on the easy ones (§10).
2. An agent is predicted to succeed half the time on self-contained, well-specified tasks that take a skilled human (with little context) about 12 hours. It is not how long the agent runs, not its reliability (the 80% horizon is much shorter, about an hour), and not "it can do any 12-hour job" — real work is messier. The horizon doubled about every 4 months from 2023 to early 2026; treat any extrapolation as a scenario, not a forecast (§2).
3. DORA calls AI an amplifier: AI adoption goes with higher throughput but also less stable delivery, because more changes hit weak testing and review. Fix the system, not the tool: smaller batches, strong automated tests, fast feedback loops and clear review rules.
4. Spec (goal, limits, a "done" test, a context file) → Plan (read and edit it) → Small diff (one step per commit) → Check (tests and CI that the tool runs) → Review (read every line, then merge). The loop stops when the check passes, so if the check is only the bug-report test — or tests the AI derived from its own code — a patch that fixes the crash but breaks other cases still gets a green tick. Write the edge-case tests yourself (§5).
5. Rising: system design (someone must decide what to build), writing clear specs and context (agents do what you describe), verification and evals (AI output must be checked), and security including prompt injection (AI code passed only about 56% of Veracode's 2026 security tasks); agent orchestration and AI product integration also rise. Commoditized: writing boilerplate and remembering syntax. Tests written by the same AI from the same code share its misunderstanding, so they pass on its bugs — derive tests from the spec, not from the code.
6. Stanford's payroll data show employment of 22–25-year-olds in AI-exposed jobs 19% below its expected path, mainly through fewer hires, while experienced workers show no comparable gap. "AI-cited layoffs" (Challenger) are the reasons employers *state* in announcements, not measured effects. PwC finds AI-exposed entry-level roles seven times more likely to ask for senior-level skills such as judgement. A junior should (1) become fluent with AI tools while being able to explain every line, (2) keep building fundamentals with AI-free practice, and (3) show judgement through tested, shipped projects (§8).
7. Normally no: Google Careers says Google Search and AI are not permitted during interviews; the exceptions are 2026 pilot rounds for software engineers that provide an approved assistant (Gemini). Prepare one story where you used AI well *and* checked its output (for example, catching an AI mistake before it shipped) and an in-depth discussion of one past project ([Ch 2 §1.4](#content/02_behavioral_interview)).
8. It is an early signal, not proof: a preprint that is not peer-reviewed, with 54 people (18 in the key session) and a written critique of its EEG analysis. The stronger evidence is a randomized trial (Bastani et al., 2025): AI that gave answers hurt later unaided performance, while a hints-only tutor largely avoided the harm — so "attempt first, use AI as a tutor", not "avoid AI". For your own fog, check the basics first: 7+ hours of sleep with a fixed wake time, last coffee about 9 hours before bed, daily movement, water and meals, one protected deep-work block, AI reviews in small batches. If it lasts for weeks despite that, or comes with worsening memory, low mood for 2+ weeks, or loud snoring and gasping at night, see a doctor (§13).

</details>

---

## Sources

Every source used in this chapter, checked in November 2026 and grouped by topic. The label at the end of each entry is its evidence type — §1 explains why that matters.

<details>
<summary><strong>Show all 91 sources</strong> — grouped by topic, each with its evidence type</summary>

**Opening quote and how to read AI numbers (§1)**

- [AI Won't Replace Humans — But Humans With AI Will Replace Humans Without AI](https://hbr.org/2023/08/ai-wont-replace-humans-but-humans-with-ai-will-replace-humans-without-ai) — Harvard Business Review interview with Karim Lakhani, 4 Aug 2023. *Interview.*
- [2026 Developer Survey: AI](https://survey.stackoverflow.co/2026/ai) — Stack Overflow, 2026 (full data: survey.stackoverflow.co/2026/ai/data). *Survey (self-reported).*
- [2025 Developer Survey: AI](https://survey.stackoverflow.co/2025/ai) — Stack Overflow, 2025 (comparison year). *Survey (self-reported).*
- [AI Coding Agents: Adoption Trends (Developer Ecosystem Survey 2026)](https://blog.jetbrains.com/research/2026/08/ai-coding-agent-adoption-2026/) — JetBrains Research, 18 Aug 2026 (more than 15,000 developers). *Survey (self-reported).*
- [How Much Code Do Developers Really Let Agents Write?](https://blog.jetbrains.com/research/2026/08/how-much-code-do-developers-really-let-agents-write/) — JetBrains Research, 26 Aug 2026. *Survey (self-reported).*
- [The State of Developer Ecosystem 2025](https://blog.jetbrains.com/research/2025/10/state-of-developer-ecosystem-2025/) — JetBrains Research, Oct 2025. *Survey (self-reported).*
- [AI Tooling for Software Engineers in 2026](https://newsletter.pragmaticengineer.com/p/ai-tooling-2026) — Gergely Orosz & Elin Nilsson, The Pragmatic Engineer, 3 Mar 2026 (900+ respondents). *Survey (self-selected).*
- [Octoverse: Commits, pushes reach new highs in 2026 as developers build with agents](https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/) — GitHub, 28 Oct 2026 (updated 6 Nov 2026). *Platform telemetry.*
- [AI-authored code has nearly doubled, but so has PR size](https://newsletter.getdx.com/p/ai-authored-code-has-nearly-doubled) — Justin Reock, DX, 17 Jun 2026 (400+ companies). *Vendor analysis.*
- [Alphabet Q3 earnings call: CEO Sundar Pichai's remarks](https://blog.google/company-news/inside-google/message-ceo/alphabet-earnings-q3-2024/) — Sundar Pichai, Google blog, 29 Oct 2024. *Company-reported.*
- [Cloud Next '26: Momentum and innovation at Google scale](https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/cloud-next-2026-sundar-pichai/) — Sundar Pichai, Google blog, 22 Apr 2026. *Company-reported.*
- [A quarter of startups in YC's current cohort have codebases that are almost entirely AI-generated](https://techcrunch.com/2025/03/06/a-quarter-of-startups-in-ycs-current-cohort-have-codebases-that-are-almost-entirely-ai-generated/) — TechCrunch, 6 Mar 2025. *Company-reported (Y Combinator).*

**Productivity and capability (§1, §2, §9)**

- [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) — Becker, Rush, Barnes & Rein, METR, 10 Jul 2025 (paper: arXiv 2507.09089). *Randomized trial.*
- [We are Changing our Developer Productivity Experiment Design](https://metr.org/blog/2026-02-24-uplift-update/) — METR, 24 Feb 2026. *Trial update (weak data).*
- [Measuring the Self-Reported Impact of Early-2026 AI on Technical Worker Productivity](https://metr.org/blog/2026-05-11-ai-usage-survey/) — METR, 11 May 2026 (349 workers). *Survey (self-reported).*
- [Task-Completion Time Horizons of Frontier AI Models (Time Horizon 1.1)](https://metr.org/time-horizons/) — METR, page last updated 8 Sep 2026. *Benchmark measurement.*
- [Measuring AI Ability to Complete Long Software Tasks](https://arxiv.org/abs/2503.14499) — Kwa et al., METR, arXiv 2503.14499, 2025. *Benchmark method.*
- [Announcing the 2025 DORA Report: State of AI-assisted Software Development](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report) — DORA / Google Cloud, Sep 2025 (nearly 5,000 respondents; overview dora.dev/research/2025). *Survey + modelling.*
- [The Effects of Generative AI on High-Skilled Work](https://www.ssrn.com/abstract=4945566) — Cui, Demirer, Jaffe, Musolff, Peng & Salz, SSRN 4945566, rev. Aug 2025 (4,867 developers). *Randomized trials.*
- [How much does AI impact development speed? An enterprise-based randomized controlled trial](https://arxiv.org/abs/2410.12944) — Paradis et al. (Google), arXiv 2410.12944, 2024 (96 engineers). *Randomized trial.*

**Code quality and security (§2, §9, §13)**

- [2026 GenAI Code Security Report](https://www.veracode.com/resources/analyst-reports/2026-genai-code-security-report) — Veracode, 28 Jul 2026 (press release: businesswire.com/news/home/20260728207685/en). *Vendor benchmark.*
- [Spring 2026 GenAI Code Security Update](https://www.veracode.com/blog/spring-2026-genai-code-security/) — Veracode, 24 Mar 2026 (150+ models). *Vendor benchmark.*
- [AI Copilot Code Quality: 2025 Research](https://www.gitclear.com/ai_assistant_code_quality_2025_research) — GitClear, Feb 2025 (211 million changed lines). *Vendor analysis.*
- [LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) — OWASP GenAI Security Project, 2025. *Industry standard.*
- [Code Review at Cisco Systems (from Best Kept Secrets of Peer Code Review)](https://static1.smartbear.co/support/media/resources/cc/book/code-review-cisco-case-study.pdf) — SmartBear Software, 2006 (2,500 reviews). *Vendor case study.*

**AI coding tools and workflow (§5; vendor pages checked 7 Nov 2026)**

- [GitHub Copilot plans](https://github.com/features/copilot/plans) — GitHub (also docs.github.com/en/copilot/get-started/plans). *Vendor page.*
- [Claude pricing (Claude Code is included in paid plans)](https://claude.com/pricing) — Anthropic. *Vendor page.*
- [Codex pricing](https://developers.openai.com/codex/pricing) — OpenAI. *Vendor page.*
- [Cursor pricing](https://cursor.com/pricing) — Cursor. *Vendor page.*
- [SpaceX officially closes its Cursor acquisition](https://techcrunch.com/2026/08/15/spacex-officially-closes-its-cursor-acquisition/) — TechCrunch, 15 Aug 2026 (deal announced 16 Jun 2026: cnbc.com/2026/06/16/spacex-spcx-cursor-acquisition-ipo.html). *News.*
- [Google Antigravity pricing](https://antigravity.google/pricing) — Google. *Vendor page.*
- [Google AI plans](https://gemini.google/us/subscriptions/) — Google. *Vendor page.*
- [An important update: transitioning Gemini CLI to Antigravity CLI](https://developers.googleblog.com/en/an-important-update-transitioning-gemini-cli-to-antigravity-cli/) — Google for Developers blog, 19 May 2026. *Vendor announcement.*
- [Jules Turndown (changelog)](https://jules.google/docs/changelog/2026-10-29/) — Google, 29 Oct 2026. *Vendor announcement.*
- [Windsurf is now Devin Desktop](https://devin.ai/blog/windsurf-is-now-devin-desktop) — Cognition, 2 Jun 2026 (plans: devin.ai/pricing). *Vendor announcement.*
- [Kiro pricing](https://kiro.dev/pricing/) — AWS. *Vendor page.*
- [Amazon Q Developer end-of-support announcement](https://aws.amazon.com/blogs/devops/amazon-q-developer-end-of-support-announcement/) — AWS, 30 Apr 2026. *Vendor announcement.*
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) — Anthropic docs, 2026. *Vendor documentation.*
- [Not all AI-assisted programming is vibe coding (but vibe coding rocks)](https://simonwillison.net/2025/Mar/19/vibe-coding/) — Simon Willison, 19 Mar 2025. *Practitioner blog.*
- ["There's a new kind of coding I call vibe coding…"](https://x.com/karpathy/status/1886192184808149383) — Andrej Karpathy, X post, 2 Feb 2025. *Primary post.*
- [Collins' Word of the Year 2025](https://blog.collinsdictionary.com/language-lovers/collins-word-of-the-year-2025-ai-meets-authenticity-as-society-shifts/) — Collins Dictionary, 6 Nov 2025. *Dictionary announcement.*
- [Vibe coding is passé. Karpathy has a new name for the future of software.](https://thenewstack.io/vibe-coding-is-passe/) — The New Stack, Feb 2026. *News.*
- [Linux Foundation Announces the Formation of the Agentic AI Foundation (AAIF)](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) — Linux Foundation, 9 Dec 2025. *Press release.*
- [JetBrains × Zed: open interoperability for AI coding agents in your IDE (ACP)](https://blog.jetbrains.com/ai/2025/10/jetbrains-zed-open-interoperability-for-ai-coding-agents-in-your-ide/) — JetBrains, Oct 2025. *Vendor announcement.*
- [AGENTS.md](https://agents.md/) — AGENTS.md project (Agentic AI Foundation). *Specification.*

**What leaders said and what their companies did (§6)**

- [The Day After AGI — Dario Amodei and Demis Hassabis (Radio Davos episode)](https://www.weforum.org/podcasts/radio-davos/episodes/ai-agi-dario-amodei-demis-hassabis/) — World Economic Forum, Davos, 20 Jan 2026. *Primary recording.*
- [Behind the Curtain: A white-collar bloodbath](https://www.axios.com/2025/05/28/ai-jobs-white-collar-unemployment-anthropic) — Axios interview with Dario Amodei, 28 May 2025. *Interview (paraphrased).*
- [Alphabet CEO expects to keep hiring engineers while AI advances](https://www.thehindubusinessline.com/info-tech/alphabet-ceo-expects-to-keep-hiring-engineers-while-ai-advances/article69659399.ece) — Sundar Pichai at Bloomberg Tech, 4 Jun 2025 (via Bloomberg). *Interview.*
- [Alphabet Q3 2026 earnings release](https://s206.q4cdn.com/479360582/files/doc_news/2026/Oct/28/attachments/2026q3-alphabet-earnings-release.pdf) — Alphabet, 28 Oct 2026. *Company filing.*
- [Joe Rogan Experience #2255 — Mark Zuckerberg](https://epublications.marquette.edu/zuckerberg_files_videos/430/) — 10 Jan 2025 (transcript archive, Marquette University). *Primary recording.*
- [Meta Q4 2025 earnings call transcript](https://www.fool.com/earnings/call-transcripts/2026/01/28/meta-meta-q4-2025-earnings-call-transcript/) — Meta, 28 Jan 2026. *Company-reported.*
- [Meta Q3 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1326801/000162828026066700/meta-09302026xexhibit991.htm) — Meta, SEC filing, Oct 2026. *Company filing.*
- [Meta cuts 8,000 jobs in sweeping global layoffs](https://www.aljazeera.com/economy/2026/5/20/meta-cuts-8000-jobs-in-sweeping-global-layoffs) — Al Jazeera (Reuters), 20 May 2026. *News.*
- [OpenAI CEO Sam Altman says AI could replace interns — but there's still hope for Gen Z (Snowflake Summit)](https://tech.yahoo.com/ai/articles/openai-ceo-sam-altman-says-144312035.html) — Yahoo Tech, Jun 2025. *Interview.*
- [The Gentle Singularity](https://blog.samaltman.com/the-gentle-singularity) — Sam Altman, 10 Jun 2025. *Opinion.*
- [Salesforce Q1 FY27 earnings call transcript](https://s205.q4cdn.com/626266368/files/doc_financials/2027/q1/Salesforce-Q1-FY27-Earnings-Transcript.pdf) — Salesforce, 27 May 2026. *Company-reported.*
- [Salesforce CEO confirms 4,000 layoffs 'because I need less heads' with AI](https://www.cnbc.com/2025/09/02/salesforce-ceo-confirms-4000-layoffs-because-i-need-less-heads-with-ai.html) — CNBC, 2 Sep 2025. *News.*

**Jobs, pay and early careers (§3, §7, §8, §14)**

- [Occupational Outlook Handbook: Software Developers, Quality Assurance Analysts, and Testers (projections 2025–35)](https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm) — U.S. Bureau of Labor Statistics, updated 27 Aug 2026 (news release: bls.gov/news.release/pdf/ecopro.pdf). *Projection.*
- [Software Developers (15-1252.00): national employment trends, BLS 2025–35 data](https://www.onetonline.org/link/localtrends/15-1252.00) — O*NET OnLine, 2026. *Projection.*
- [Artificial intelligence, information technology, and employment, 2024–34](https://www.bls.gov/opub/ted/2026/artificial-intelligence-information-technology-and-employment-2024-34.htm) — BLS, The Economics Daily, 2026 (previous projection round). *Projection.*
- [2026 Global AI Jobs Barometer](https://www.pwc.com/gx/en/services/ai/ai-jobs-barometer.html) — PwC, 15 Jun 2026 (more than 1 billion job ads; press release: pwc.com/gx/en/news-room/press-releases/2026/pwc-2026-ai-jobs-barometer.html). *Job-ad data (advertised salaries).*
- [Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence](https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine-six-facts-about-the-recent-employment-effects-of-artificial-intelligence/) — Brynjolfsson, Chandar & Chen, Stanford Digital Economy Lab, revised 12 Aug 2026. *Payroll data (ADP).*
- [Generative AI as Seniority-Biased Technological Change](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5425555) — Hosseini Maasoum & Lichtinger, SSRN 5425555, rev. 2026. *Working paper (résumé and job-posting data).*
- [State of Tech Talent Report 2026](https://www.signalfire.com/blog/signalfire-state-of-talent-report-2026) — SignalFire, 22 Jun 2026. *Hiring data (vendor analysis).*
- [October Layoffs at Three-Year Low; Seasonal Hiring Plans Up 26%](https://www.challengergray.com/blog/october-layoffs-at-three-year-low-seasonal-hiring-plans-up-26/) — Challenger, Gray & Christmas, Nov 2026 (2025 totals: December 2025 report). *Employer-stated reasons for announced cuts.*
- [Job trends 2026: The 25 fastest-growing jobs in the U.S. (Jobs on the Rise)](https://www.linkedin.com/pulse/linkedin-jobs-rise-2026-25-fastest-growing-roles-us-linkedin-news-dlb1c/) — LinkedIn News, 7 Jan 2026. *Platform data.*
- [Job postings for this tech role have grown more than 700% in the last year (forward-deployed engineers)](https://www.aol.com/articles/job-postings-tech-role-grown-185134000.html) — Business Insider (Indeed data), 18 May 2026. *Job-posting data.*
- [AI and Job Postings: From Destruction to Creation?](https://hiringlab.indeed.com/2026/07/08/ai-and-job-postings-from-destruction-to-creation/) — Indeed Hiring Lab, 8 Jul 2026. *Job-posting data.*
- [The Labor Market Is Tilting Toward Seniority](https://hiringlab.indeed.com/2026/07/23/the-labor-market-is-tilting-toward-seniority/) — Indeed Hiring Lab, 23 Jul 2026. *Job-posting data.*
- [Indeed software-development job postings index (FRED series IHLIDXUSTPSOFTDEVE)](https://fred.stlouisfed.org/series/IHLIDXUSTPSOFTDEVE) — FRED / Indeed, 2026. *Job-posting data.*
- [The Hottest AI Job of 2023 Is Already Obsolete](https://www.wsj.com/articles/the-hottest-ai-job-of-2023-is-already-obsolete-1961b054) — The Wall Street Journal, 25 Apr 2025. *News.*
- [The Next Two Years of Software Engineering](https://addyosmani.com/blog/next-two-years/) — Addy Osmani, 5 Jan 2026. *Opinion.*

**Google interviews and learning resources (§11, §12)**

- [Interviewing at Google: Best practices, advice, and tips](https://www.google.com/about/careers/applications/interview-tips/) — Google. *Official policy; the 2026 AI-fluency pilot (Business Insider, May and Oct 2026) is sourced in Ch 2 §1.4.*
- [Designing Data-Intensive Applications, 2nd edition](https://martin.kleppmann.com/2026/03/24/designing-data-intensive-applications-2e.html) — Martin Kleppmann & Chris Riccomini, O'Reilly, Mar 2026. *Book.*
- [Agentic Engineering (early release)](https://www.oreilly.com/library/view/agentic-engineering/0642572392291/) — Addy Osmani, O'Reilly, 2026. *Book.*

**Brain, focus and learning (§13)**

- [Brain Fog](https://my.clevelandclinic.org/health/symptoms/brain-fog) — Cleveland Clinic, 2024. *Medical reference.*
- [Sleep apnoea](https://www.nhs.uk/conditions/sleep-apnoea/) — NHS. *Medical reference.*
- [Underactive thyroid (hypothyroidism)](https://www.nhs.uk/conditions/underactive-thyroid-hypothyroidism/) — NHS. *Medical reference.*
- [Vitamin B12 or folate deficiency anaemia: symptoms](https://www.nhs.uk/conditions/vitamin-b12-or-folate-deficiency-anaemia/symptoms/) — NHS. *Medical reference.*
- [Your Brain on ChatGPT: Accumulation of Cognitive Debt when Using an AI Assistant for Essay Writing Task](https://arxiv.org/abs/2506.08872) — Kosmyna et al., arXiv 2506.08872, Jun 2025 (v2 Dec 2025). *Preprint (EEG, 54 people).*
- [Comment on: Your Brain on ChatGPT](https://arxiv.org/abs/2601.00856) — Stanković, Hirche, Kollatzsch & Doetsch, arXiv 2601.00856, Dec 2025. *Critique.*
- [Generative AI without guardrails can harm learning: Evidence from high school mathematics](https://doi.org/10.1073/pnas.2422633122) — Bastani et al., PNAS 122(26), 2025. *Randomized trial.*
- [Why is it so hard to do my work? The challenge of attention residue when switching between work tasks](https://doi.org/10.1016/j.obhdp.2009.04.002) — Leroy, Organizational Behavior and Human Decision Processes 109(2), 2009. *Lab experiments.*
- [Tasks interrupted: … how a "ready-to-resume" plan mitigates the effects](https://doi.org/10.1287/orsc.2017.1184) — Leroy & Glomb, Organization Science 29(3), 2018. *Experiments.*
- [No task left behind? Examining the nature of fragmented work](https://doi.org/10.1145/1054972.1055017) — Mark, Gonzalez & Harris, CHI 2005. *Field observation.*
- [The attentional cost of receiving a cell phone notification](https://doi.org/10.1037/xhp0000100) — Stothart, Mitchum & Yehnert, JEP: Human Perception and Performance 41(4), 2015. *Lab experiment.*
- [The cumulative cost of additional wakefulness](https://doi.org/10.1093/sleep/26.2.117) — Van Dongen et al., Sleep 26(2), 2003. *Randomized lab trial.*
- [Dehydration impairs cognitive performance: A meta-analysis](https://doi.org/10.1249/MSS.0000000000001682) — Wittbrodt & Millard-Stafford, Medicine & Science in Sports & Exercise 50(11), 2018. *Meta-analysis.*
- [The effect of caffeine on subsequent sleep: A systematic review and meta-analysis](https://doi.org/10.1016/j.smrv.2023.101764) — Gardiner et al., Sleep Medicine Reviews 69, 2023. *Meta-analysis.*
- [World Health Organization 2020 guidelines on physical activity and sedentary behaviour](https://doi.org/10.1136/bjsports-2020-102955) — Bull et al., British Journal of Sports Medicine 54(24), 2020. *Guideline.*
- [Spilling the Beans: How Much Caffeine Is Too Much?](https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much) — U.S. Food and Drug Administration. *Consumer guidance.*

</details>

---

## Key Takeaways

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  STAYING RELEVANT IN THE AI ERA — WHAT TO REMEMBER                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  READ THE EVIDENCE (§1, as of Nov 2026)                                      ║
║    • Label each number: company-reported, survey, trial, payroll, projection ║
║    • Google: 75% of new code is AI-generated + engineer-approved             ║
║      (company-reported, Apr 2026) — a share of output, not productivity      ║
║    • Use ≠ trust: 83% use AI at work; ~7% trust it for important             ║
║      decisions, 48% only when they can verify (Stack Overflow 2026)          ║
║    • Speed: METR trial — 19% slower with early-2025 tools while feeling      ║
║      ~20% faster; other trials found up to +26%; 2026: likely faster now     ║
║    • DORA 2025: AI is an amplifier — more throughput, less stable            ║
║      delivery unless tests, small batches and fast feedback are strong       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  WHERE TO USE AI (§2)                                                        ║
║    • Delegate what you can check cheaply (boilerplate, tests, refactors      ║
║      under tests); keep architecture, people and production decisions        ║
║    • Security: AI code passed only ~56% of security tasks (Veracode          ║
║      2026) — scan every AI change; least privilege vs prompt injection       ║
║    • METR time horizon (50%) doubled ~every 4 months, to ~12 h in early      ║
║      2026; the 80% horizon is 5–10× shorter — trends ≠ forecasts             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  SKILLS (§3–§4)                                                              ║
║    • Rising: specs and context, verification and evals, system design,       ║
║      agent orchestration, AI product integration, security                   ║
║    • Pay: AI-skill job ads offer 62% higher salaries (PwC 2026)              ║
║    • Commoditized: boilerplate, syntax recall. Value moved to deciding,      ║
║      specifying, checking, owning — never let one AI write code AND tests    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  TOOLS & WORKFLOW (§5)                                                       ║
║    • Learn the four tool shapes (IDE assistant, terminal agent, cloud        ║
║      agent, agent manager) and one workflow — brands change fast             ║
║    • Agentic loop: spec → plan → small diff → check → review every line      ║
║    • Vibe coding = throwaway prototypes; agentic engineering = real code     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  LEADERS & JOBS (§6–§7)                                                      ║
║    • Read CEO quotes with date, venue and what the company did next          ║
║      (Alphabet headcount +7.7%, Meta −15%, Salesforce engineering flat)      ║
║    • BLS: US software-developer jobs ~+10% in 2025–35 (projection)           ║
║    • Growing roles: AI engineer, forward-deployed, eval/agent, ML            ║
║      platform, AI security — titles fade (prompt engineer), skills last      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  JUNIORS & LEVERAGE (§8–§9)                                                  ║
║    • Ages 22–25 in AI-exposed jobs: 19% below trend, via fewer hires         ║
║      (Stanford payroll data, Aug 2026); experienced workers: no gap          ║
║    • AI-exposed entry roles: 7× likelier to ask for senior skills (PwC)      ║
║      — be AI-proficient AND able to explain every line                       ║
║    • The new "10x" is leverage: clear spec, delegated work, fast checks      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  MISTAKES, PLAYBOOK & LEARNING (§10–§12)                                     ║
║    • Verify everything; measure your own speed-up (coin flip per task,       ║
║      log the times) — a dozen tasks rarely tell faster from slower           ║
║    • Google: no AI in interviews except pilot rounds — prepare one           ║
║      "AI used well and checked" story + one project deep-dive (Ch 2)         ║
║    • Learn with AI as a tutor (hints, not answers); keep AI-free reps        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  MIND (§13)                                                                  ║
║    • Sleep 7+ h, move, one deep block, small review batches, attempt         ║
║      first; see a doctor if the fog lasts for weeks                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  THE FORMULA (§14)                                                           ║
║    • Fundamentals + AI fluency + system design + domain expertise            ║
║      = an engineer AI makes stronger, not replaceable                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

**Back to Start:** [README — Table of Contents](../README.md)
