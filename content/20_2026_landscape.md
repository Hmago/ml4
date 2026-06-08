# Chapter 20 — The 2026 AI Landscape

> A field map of where AI is in May 2026 — frontier models, the open-weight race, coding agents, multimodal generation, computer-use, regulation, and the trends a Google AI Engineer interviewer expects you to know.

The state of AI in May 2026 is unrecognisable from late 2022. GPT-3.5 just answered questions; today's frontier models reason for minutes, navigate browsers, write production code, and generate minute-long video with synchronised audio. This chapter is the bird's-eye view: what's new, what changed, what saturated, and what interviewers now ask. Use it to ground every other chapter — the techniques in Ch 7–19 are tools; this chapter is the world they operate in.

---

## What You'll Learn

By the end of this chapter you'll be able to:

- Name the May 2026 frontier models and their specialisations.
- Explain test-time compute scaling and when reasoning models are worth the cost.
- Compare the open-weight contenders (Llama 4, DeepSeek V4, Qwen 3.5, Mistral, Gemma 4).
- Talk fluently about coding agents, SWE-bench, and the dev-tool revolution.
- Discuss multimodal generation (image, video, voice) at an interview-relevant level.
- Reason about computer-use agents and where they belong / don't.
- Apply quantization and on-device tradeoffs to a system design question.
- Cite the EU AI Act timeline and other 2026 regulatory milestones.
- Describe Google's full stack (Gemini 3.x + Vertex / Gemini Enterprise + TPU v7 Ironwood).
- Recognise which "trendy" topics are interview gold and which are noise.

---

## 19.1 The 2026 Frontier Model Lineup

> **Frontier model**: a generally-capable foundation model at or near the state of the art on the standard benchmarks (reasoning, coding, math, multimodal). Built by a small set of labs with the compute and talent to push the curve.

As of May 2026, four labs anchor the closed-weight frontier and three more lead the open-weight race:

```
                  ┌─────────────────────── CLOSED-WEIGHT FRONTIER ───────────────────────┐
                  │                                                                       │
                  │   GPT-5.5            Claude Opus 4.7         Gemini 3.1 Pro          │
                  │   (OpenAI)           (Anthropic)             (Google)                │
                  │   • agents leader    • SWE-bench leader      • cheapest flagship     │
                  │   • Terminal-Bench   • tool orchestration    • PhD-reasoning tied #1 │
                  │     82.7%            • 87.6% SWE-bench       • $2/$12 per M tokens   │
                  │                                                                       │
                  └───────────────────────────────────────────────────────────────────────┘

                  ┌────────────────────── OPEN-WEIGHT (sparse-MoE era) ───────────────────┐
                  │                                                                       │
                  │   DeepSeek V4-Pro       Llama 4 Scout         Qwen 3.5                │
                  │   1.6T total/49B act    109B/17B, 10M ctx    397B/17B                 │
                  │   • 83.7% SWE-bench     • industry-largest    • 88.4% GPQA Diamond   │
                  │   • MIT license           context window      • Apache 2.0           │
                  │                                                                       │
                  │   Mistral Large 3       Gemma 4 31B           Apple Foundation        │
                  │   675B/41B              • LiveCodeBench 80%   • 3B on-device         │
                  │   Apache 2.0            • Apache 2.0          • new for iOS 19       │
                  │                                                                       │
                  └───────────────────────────────────────────────────────────────────────┘
```

**Key takeaway:** No single model wins everything. GPT-5.5 leads autonomous agents; Claude Opus 4.7 leads software engineering and tool orchestration; Gemini 3.1 Pro leads price/speed/multimodal; DeepSeek V4 leads open-weight raw benchmarks; Llama 4 Scout leads context length (10M tokens). **Pick by task.**

### Frontier comparison at a glance

| Model | Strength | SWE-bench | GPQA Diamond | Context | Headline price (in/out per M tok) |
|---|---|---|---|---|---|
| **GPT-5.5** | Agents, computer use | 88.7% | ~94% | 1M | premium |
| **Claude Opus 4.7** | Coding, tool orchestration | 87.6% | 94.2% | 1M | premium |
| **Gemini 3.1 Pro** | Multimodal, value | 80.6% | 94.3% | 2M | $2 / $12 |
| **DeepSeek V4-Pro** | Open-weight reasoning | 83.7% | ~88% | 1M | self-host |
| **Llama 4 Scout** | Long context | mid | mid | **10M** | self-host |
| **Qwen 3.5** | Open-weight science | mid | 88.4% | 1M | self-host |

Interview tip: don't memorise these numbers — they shift monthly. Memorise the *shape* of the leaderboard: closed-weight leads by ~3–8 points on agentic and code tasks, open-weight has closed the gap on reasoning, and **everyone within ~3 points of the top means model choice is mostly about price, latency, and ecosystem**, not raw capability.

---

## 19.2 Reasoning Models & Test-Time Compute

> **Reasoning model**: an LLM that allocates additional compute *at inference time* — generating hidden "thinking" tokens before producing a final answer — so accuracy on hard problems scales with thinking budget rather than parameters alone.

Plain explanation: a normal LLM is like a student who blurts the first answer that comes to mind. A reasoning model is the same student told "show your work, take your time." On a hard problem they often outperform; on easy ones they overthink and waste tokens.

### How test-time compute scales

```
   Normal LLM:
      Input ──> [ one forward pass ] ──> Output
      cost: fixed per token

   Reasoning Model (o3, Claude extended thinking, Gemini 3 Thinking, DeepSeek-R1):
      Input ──> [ think... think... think... ] ──> Output
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                Hidden tokens (1K to 100K+)
      cost: scales with task difficulty

   Empirically: doubling the thinking budget often beats doubling parameters
   on math, code, and multi-step planning — but only on those tasks.
```

### Hello world — controlling thinking budget

OpenAI exposes `reasoning_effort` (`low`/`medium`/`high`); Anthropic exposes `thinking` blocks with a token budget; Google exposes `thinking_config` on Gemini 3 Pro.

```python
# OpenAI o-series / GPT-5.5 reasoning
from openai import OpenAI
c = OpenAI()
r = c.chat.completions.create(
    model="o3",
    messages=[{"role": "user", "content": "Prove that sqrt(2) is irrational."}],
    reasoning_effort="high",   # low / medium / high
)
print(r.choices[0].message.content)
```

```python
# Anthropic Claude extended thinking
import anthropic
client = anthropic.Anthropic()
msg = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=4096,
    thinking={"type": "enabled", "budget_tokens": 16000},
    messages=[{"role": "user", "content": "Optimal seating for 8 guests with 3 constraints..."}],
)
print(msg.content)
```

### When reasoning helps vs hurts

| Use reasoning models | Skip reasoning models |
|---|---|
| Math, formal logic, theorem-style problems | Simple Q&A, trivia, lookup |
| Multi-step planning ("design X given constraints") | Creative writing, brainstorming |
| Hard code generation with formal specs | High-throughput classification |
| Scientific analysis with multiple hypotheses | Real-time voice (latency-bound) |
| Research / debugging legacy code | Bulk extraction from clean structured input |

**The cost trap**: reasoning models charge for the hidden thinking tokens *plus* the output. A single `reasoning_effort=high` call can be 10–50× the price of a normal call. Use them where they earn that premium.

---

## 19.3 The Open-Weight Race

The single biggest 2025–2026 story: open-weight models closed the capability gap on closed-weight ones. Almost every flagship is now a **sparse Mixture-of-Experts (MoE)** — a giant total parameter count, only a small slice active per token.

| Model | Total / Active | Context | License | Sweet spot |
|---|---|---|---|---|
| **DeepSeek V4-Pro** | 1.6T / 49B | 1M | MIT | Reasoning, coding, raw benchmarks |
| **Llama 4 Maverick** | 400B / 17B | 1M | Meta custom (700M MAU clause) | General-purpose, multilingual |
| **Llama 4 Scout** | 109B / 17B | **10M** | Meta custom | Long-context RAG |
| **Qwen 3.5** | 397B / 17B | 1M | **Apache 2.0** | Science, tool-use |
| **Mistral Large 3** | 675B / 41B | 1M | **Apache 2.0** | Tool-use, multilingual |
| **Gemma 4 31B** | 31B dense | 256K | Apache 2.0 | Self-host on 1 H100, code |

### Why it matters in interviews

1. **Cost & sovereignty** — self-host on TPUs/H100s, no per-token bill, data never leaves your VPC.
2. **License war** — Apache 2.0 won for permissive labs (Qwen, Mistral, Gemma). Llama keeps its MAU clause; DeepSeek went MIT.
3. **Quality** — DeepSeek V4 at 83.7% SWE-bench Verified is within 5 points of GPT-5.5 — close enough that for many production tasks, open-weight + good infra beats premium API.

### When to pick open-weight

- Privacy-critical workloads (health, finance, defence, sovereign-cloud).
- Bulk inference where token cost dominates (classification at billions of QPS).
- Long-context RAG over giant corpora — Llama 4 Scout's 10M window has no closed-weight equal.
- Research where reproducibility matters.

When to pick **closed-weight**: top-end agent reliability, latest reasoning frontier, computer-use, when you want zero ops.

---

## 19.4 Coding Agents — The 2026 Headline Story

> **Coding agent**: an LLM-powered system that reads a codebase, plans changes, edits files, runs tests, and iterates — autonomously or with a human in the loop. The category that took over developer tooling in 2025–2026.

**SWE-bench Verified** is the benchmark that defined the race: real GitHub bug-fix tasks, scored by whether the patch passes the project's test suite. In late 2023 the frontier was ~13%. By May 2026:

```
   SWE-bench Verified — May 2026 leaderboard (selected)

   GPT-5.5 (with Codex CLI scaffold)        ████████████████████████  88.7%
   Claude Opus 4.7 (Adaptive)               ███████████████████████   87.6%
   GPT-5.3 Codex                            ██████████████████████    85.0%
   DeepSeek V4-Pro                          █████████████████████     83.7%
   Augment Code (Opus 4.6)                  ██████████████████        72.0%
   Cursor (Sonnet 4.6)                      █████████████████         65.7%
   Devin 2.0                                ██████████████            45.8%
   Late-2023 baseline                       ████                      13.0%
```

(Scores drift monthly — always cite the date.)

### The dev-tool battle

| Tool | Form factor | Best for |
|---|---|---|
| **Claude Code** (Anthropic CLI) | Terminal agent in your repo | Long-running multi-file refactors, agentic loops |
| **Cursor** | Forked VS Code IDE | Inline edits, codebase-aware chat, rapid prototyping |
| **Windsurf** | IDE | Cascade flow for multi-file edits |
| **GitHub Copilot** + workspace | Editor sidebar | In-IDE chat, broad enterprise integration |
| **Devin** (Cognition) | Async cloud agent | Self-driving tickets, less hands-on |
| **Codex CLI / Codex desktop** | OpenAI's terminal + Mac agent | OpenAI-native workflow, SWE-bench leader |
| **OpenAI Operator / Mariner** | Browser agent | Web tasks, computer use |

The trend: coding has split into **interactive copilots** (Cursor, Copilot) for tight feedback loops and **autonomous agents** (Claude Code, Devin) for delegated tasks. Both keep the human in the review loop — the moment trust breaks, productivity collapses.

### Hello world — letting Claude Code edit your repo

```bash
# Install
npm install -g @anthropic-ai/claude-code

# In your repo
claude

# Then ask:
> Add tests for src/auth/login.ts and run them
# Claude reads the file, writes tests, runs `npm test`, fixes failures, shows the diff.
```

### Interview angle

Expect questions like *"How would you build a coding agent?"* or *"Why did SWE-bench scores jump from 13% to 87% in 18 months?"*. Strong answer covers: (1) better base models, (2) test-time compute / reasoning, (3) better scaffolds (file IO tools, test-runner integration, diff review), (4) RL on agentic traces. Augment Code's 72% with Opus 4.6 vs Cursor's 65.7% with Sonnet 4.6 illustrates the *scaffold gap* — agent quality is base model + harness.

---

## 19.5 Multimodal Generation — Images, Video, Voice

By 2026, generation went from a research demo to a product category.

### Image generation

| Model | Org | Notes |
|---|---|---|
| **DALL-E 3 / GPT-Image-1** | OpenAI | Native in ChatGPT, strong text rendering |
| **Imagen 4** | Google DeepMind | High photorealism, in Gemini app |
| **Midjourney v7** | Midjourney | Aesthetic leader, web + Discord |
| **FLUX 1.1 Pro / FLUX dev** | Black Forest Labs | Open-weight (FLUX dev), fast |
| **Stable Diffusion 3.5** | Stability AI | Open-weight workhorse |

**Production rule of thumb**: hosted APIs for quality, FLUX/SD for self-host and customisation (LoRA, ControlNet).

### Video generation — the 2026 explosion

| Model | Org | Headline capability |
|---|---|---|
| **Sora 2** | OpenAI | Up to 60-second clips, physics-realistic, in ChatGPT/Sora app |
| **Veo 3.1** | Google DeepMind | Up to 1-minute, **synchronised audio (dialogue + SFX)**, 4K |
| **Kling 2.0** | Kuaishou | Strong human motion |
| **Runway Gen-4** | Runway | Editor-friendly, control over camera/character |
| **Seedance 2** | ByteDance | Fast, low cost |

The 2026 Sora 2 release modelled physics well enough to handle backflips on a paddleboard and basketball rim rebounds — earlier models would just teleport the ball through the rim. Veo 3.1 matched the quality and added native audio (dialogue, ambient, SFX) — a major leap that bypasses the post-production sound step.

### Voice — real-time conversation

| Model / Product | What's new |
|---|---|
| **GPT-4o voice / Realtime API** | Speech-to-speech, no text intermediary; ~300 ms latency |
| **Gemini Live** | Real-time bidirectional audio + screen-share |
| **ElevenLabs Conversational** | Production voice agents (B2B leader) |
| **Sesame** | High-fidelity expressive voice |

The shift: 2024 voice was `STT → LLM → TTS` (high latency, lost prosody). 2026 voice is one model end-to-end — it hears tone, interrupts naturally, and responds in ~300 ms. This is **the** product enabling phone-based AI agents.

---

## 19.6 Computer-Use Agents

> **Computer-use agent**: an AI that drives a real computer — looking at the screen, moving a mouse, typing, clicking — to complete tasks intended for humans (filling forms, navigating browsers, operating apps).

The 2026 breakthrough category. Claude Computer Use jumped from 14% to **44% on OSWorld** in 18 months. OpenAI's **Operator** runs cloud-hosted browsers; **Project Mariner** is Google's browser agent; OpenAI's **Codex desktop** controls your Mac directly.

### Hello world — Anthropic computer use

```python
import anthropic
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=2048,
    tools=[{
        "type": "computer_20250124",
        "name": "computer",
        "display_width_px": 1280,
        "display_height_px": 800,
    }],
    messages=[{"role": "user", "content": "Open my browser and book a 7am flight to Tokyo on Friday."}],
)
# Claude returns a sequence of mouse_move / left_click / type / screenshot tool calls.
# Your client executes them on a sandboxed VM and returns screenshots back.
```

### Where computer-use fits — and where it doesn't

| Right fit | Wrong fit |
|---|---|
| Legacy software with no API | High-QPS production traffic |
| One-off automation across many apps | Latency-sensitive UX (>>1 s per click) |
| QA-automating a flaky internal tool | Anything with a public API (use the API) |
| Internal back-office data entry | Anything where mis-clicks have high blast radius |

**Cost & speed**: each step is a screenshot + LLM call. A 30-step flow easily takes 60–120 seconds and costs $0.10–$0.50. Useful for 10×/day workflows; ruinous for 10×/sec.

---

## 19.7 On-Device AI & Quantization

> **On-device AI**: running ML models locally on phones, laptops, or edge devices instead of in the cloud — trading model size for privacy, latency, cost, and offline availability.

By 2026 every major phone OS ships with on-device models:

| Product | What's on-device |
|---|---|
| **Gemini Nano** (Pixel/Android) | Smart Reply, summarisation, Magic Compose |
| **Apple Intelligence** (iOS/macOS) | Writing tools, image clean-up, Siri context |
| **Phi-4 Mini** (Microsoft) | Copilot+ PCs |
| **Llama 3.2 1B/3B** | Open-weight reference models for edge |

### Quantization — the enabler

> **Quantization**: reducing the numerical precision of weights (32-bit floats → 4-bit ints) to shrink memory and speed up inference, with minimal accuracy loss.

```
   Memory for a 7B-parameter model:

   FP32 (full)    32 bits/weight   ──>   28 GB
   FP16 / BF16    16 bits/weight   ──>   14 GB
   INT8            8 bits/weight   ──>    7 GB
   INT4            4 bits/weight   ──>    3.5 GB   ← fits on a phone
```

INT4 loses ~1–3% on benchmarks. **GPTQ**, **AWQ**, and **GGUF** make it practical. Frameworks: `bitsandbytes` (training), `llama.cpp` + GGUF (CPU/edge), MLC and Apple's **MLX** (Apple silicon), MediaPipe (mobile).

### Hello world — load a 4-bit quantized model

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype="bfloat16")

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    quantization_config=bnb,
    device_map="auto",
)
tok = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B-Instruct")
print(tok.decode(model.generate(**tok("Hello", return_tensors="pt").to("cuda"))[0]))
```

### Edge vs cloud decision

| Pick on-device | Pick cloud |
|---|---|
| Privacy-critical (health, finance, personal context) | Need the largest model / latest frontier |
| Latency-critical (autocomplete, real-time UX) | Multi-step reasoning beyond on-device capacity |
| Billions of queries (zero marginal cost) | Live external data lookups |
| Offline / spotty connectivity | Computer-use, video gen, multimodal beyond text+image |

---

## 19.8 The Cost Trajectory

The single most under-appreciated fact of 2026: **token prices fell ~150–1000× between late 2022 and 2026** for equivalent quality.

```
   Cost per million tokens for "GPT-4 quality" output (approximate)

   Nov 2021 (GPT-3 tier)       $60.00      ████████████████████████████
   Late 2022 (original GPT-4)  $20.00      ████████████
   Mid 2023 (GPT-4 Turbo)      $10.00      ██████
   Mid 2024 (GPT-4o)            $2.50      ██
   Mid 2025 (GPT-4o-mini etc)   $0.15      ▌
   May 2026 (Gemini Flash etc)  $0.06      .

   Roughly 1000× cheaper in 4.5 years for equivalent quality.
```

**Why it matters for system design.** Architectures that were uneconomic in 2022 (agentic loops calling the LLM 30 times for one task, RAG with reranker + hybrid search, multi-agent debates) are routine in 2026. Tomorrow's affordable architecture is in the same direction.

**Why your bill still went up.** Per-token prices fell, but total token consumption grew faster — long context, reasoning models burning thinking tokens, agents making 10–100 calls per task. AI is now the fastest-growing IT line item at most enterprises.

---

## 19.9 The Long-Context Era

Context windows scaled fast: **8K (GPT-3.5, 2022) → 32K (GPT-4) → 200K (Claude 3) → 1M (Gemini 1.5 / Claude 4) → 10M (Llama 4 Scout, 2025)**.

**Lost-in-the-middle still exists.** Attention degrades on tokens buried in the middle of long contexts. A 2M-token window is a canvas, not an invitation to paint every pixel.

### What you actually need to know

- **Tokens ≠ words.** ~4 chars/token in English; code and non-English tokenize worse.
- **Everything counts.** System prompt + history + retrieved docs + tool outputs + the response being generated all share one budget.
- **Going over fails.** Providers either silently drop earlier tokens or error.
- **Prompt caching** (Ch 19) makes the long prefix cheap on subsequent calls — biggest cost lever after model choice.

### When to use long context vs RAG

| Long-context wins | RAG wins |
|---|---|
| One-shot analysis of a single big document (a contract, a paper) | Querying a knowledge base of thousands of docs |
| Few-shot examples that are large | When freshness matters (docs change daily) |
| Conversation memory inside a session | Per-user data with ACLs |
| Code analysis over a whole repo | When precision retrieval beats stuffing |

A 2026 best practice: **use both.** Retrieve top-50 with hybrid search and reranking, dump the top-50 into a 1M context window, and let the model do the final reasoning. The "throw bigger context at it" reflex that long-context unlocked still loses to selective retrieval on most production workloads.

---

## 19.10 Context Engineering — The 2026 Skill

> **Context engineering**: the systematic design of everything a model sees at inference — system prompt, retrieved docs (RAG), tool outputs, conversation history, structured memory, layout — to maximise task quality.

If 2024 was about prompt engineering, 2026 is about context engineering. The wording of the user-facing prompt is one slice of the context window; the rest determines 80% of an AI application's quality.

### The context stack

```
   ┌─────────────────────────────────────────────────────────────┐
   │  1. System prompt (persona, rules, tool specs)              │  static, dev-set
   ├─────────────────────────────────────────────────────────────┤
   │  2. Retrieved documents (RAG)                                │  dynamic, per-query
   ├─────────────────────────────────────────────────────────────┤
   │  3. Tool results (API calls, code execution, search)         │  dynamic, per-step
   ├─────────────────────────────────────────────────────────────┤
   │  4. Conversation history                                     │  growing, per-turn
   ├─────────────────────────────────────────────────────────────┤
   │  5. Structured memory (user prefs, summaries)                │  persistent, compressed
   ├─────────────────────────────────────────────────────────────┤
   │  6. User message — the actual question                       │  current turn
   └─────────────────────────────────────────────────────────────┘
                        ▼
                    [ LLM generates response ]
```

### The seven techniques you'll be asked about

| Technique | What it does |
|---|---|
| **RAG** | Retrieve relevant docs, inject into context |
| **Tool use** | Model calls APIs / runs code; results flow back into context |
| **Conversation summarisation** | Compress old turns before they slide out of effective attention |
| **Memory systems** | Persistent user-specific facts injected each session |
| **Context caching** | ~90% cheaper repeat tokens — biggest cost lever |
| **Structured layout** | XML/JSON tags (`<document>...`) beat flat prose for recall |
| **Attention anchoring** | Put the most critical instruction *just before* the generation point |

### Interview angle

*"Design the context for a customer support agent."* Strong answer walks the stack:
1. **System prompt**: persona, escalation policies, tone rules, tool specs.
2. **RAG**: pull articles from the knowledge base by hybrid retrieval over the user's query.
3. **Tools**: order lookup, refund processor, account status.
4. **History**: full current conversation; previous conversations summarised.
5. **Memory**: customer preferences, past issues, sentiment.
6. **User message**: current input.
7. **Layout & priorities**: when context fills up, drop summarised old turns first; keep policies and current conversation; structured tags for retrieved docs.

---

## 19.11 Responsible AI & Regulation

Safety stopped being optional in 2024; in 2026 it's also legally enforced.

### Alignment techniques (interview must-knows)

| Technique | How it works |
|---|---|
| **RLHF** | Humans rank outputs → train a reward model → fine-tune the LLM with PPO to maximise reward |
| **Constitutional AI** | Model self-critiques against written principles, no per-example human labelling |
| **DPO** (Direct Preference Optimization) | Skip the reward model — directly optimise on (chosen, rejected) preference pairs |
| **RLAIF** | AI-generated feedback replaces human feedback for scale |
| **Red-teaming** | Adversarial testing (manual + automated) before any major release |

### The EU AI Act — the date interviewers test you on

The **EU AI Act** is the world's first comprehensive AI regulation. Key dates:

| Date | What changes |
|---|---|
| Feb 2, 2025 | Prohibited-AI bans live (social scoring, real-time biometric surveillance, etc.) |
| Aug 2, 2025 | Obligations for **general-purpose AI providers** apply |
| **Aug 2, 2026** | Most rules in force; **enforcement powers and GPAI penalties go live** |
| Aug 2, 2027 | High-risk AI systems in regulated products fully covered |

If you build foundation models, deploy them in the EU, or sell to EU customers, this affects you. Penalties top out at €35M or 7% of global revenue. Compliance documentation, transparency about training data, copyright respect, and systemic-risk evaluation are the headline obligations for general-purpose AI.

### Other 2026 regulatory milestones to know

- **US**: Federal AI Bill of Rights guidance, sector-specific rules (FDA on medical AI, NHTSA on autonomous vehicles); California's SB 1047 was vetoed but successors are in committee.
- **UK**: AI Safety Institute (AISI) leads pre-deployment evals for frontier labs.
- **China**: generative AI services must register with the CAC; approved-content models only.
- **Industry**: Frontier Model Forum (Anthropic, Google, Microsoft, OpenAI) publishes voluntary safety commitments.

### Google's AI Principles (2018 — still cited)

1. Be socially beneficial.
2. Avoid creating or reinforcing unfair bias.
3. Be built and tested for safety.
4. Be accountable to people.
5. Incorporate privacy by design.
6. Uphold high standards of scientific excellence.
7. Be available for uses that align with these principles.

---

## 19.12 Google's 2026 AI Stack

If you're interviewing for an AI Engineer role at Google, you must know this stack — they invented half of it.

### Models — the Gemini 3.x family

| Tier | Use case |
|---|---|
| **Gemini 3.1 Pro** | Flagship — reasoning, coding, complex multimodal analysis |
| **Gemini 3 Flash** | High-throughput production workhorse |
| **Gemini 3 Nano** | On-device — Pixel, Android, ChromeOS |
| **Gemini Live** | Real-time bidirectional audio + video streaming |
| **Imagen 4 / Veo 3.1** | Image and video generation, in Vertex |

All natively multimodal (text, image, audio, video). Pro and Flash share a 1M+ token context.

### Platform — Gemini Enterprise Agent Platform

At **Cloud Next 2026** Google rebranded **Vertex AI** as the **Gemini Enterprise Agent Platform** and merged it with Agentspace. The components an interviewer expects you to name:

| Component | Role |
|---|---|
| **Agent Development Kit (ADK)** | Open-source code-first agent framework (Python, Go, Java, TS) |
| **Agent Engine** | Managed runtime — handles deployment, scaling, sessions, memory |
| **Agent Builder** | Console / low-code surface for non-engineers |
| **Vertex Pipelines** | Managed Kubeflow pipelines |
| **Vertex Feature Store** | Online + offline feature serving |
| **Model Garden** | Curated catalogue (Gemini, Llama, Mistral, Anthropic, etc.) |
| **Genkit** | Lighter open-source GenAI framework |

(Hello world for ADK is in Ch 19 §18.12.)

### Infrastructure — TPU v7 "Ironwood"

Announced 2025, GA in early 2026. Designed for the inference + reasoning era:

| Spec | Value |
|---|---|
| Peak compute | **4,614 FP8 TFLOPS** per chip |
| HBM memory | **192 GB** per chip (6× Trillium) |
| HBM bandwidth | 7.37 TB/s |
| Pod scale | **9,216 chips → 42.5 exaFLOPS** |
| Generation lift | ~10× peak vs TPU v5p; ~4× per-chip vs TPU v6e |

Anthropic committed to up to **1 million Ironwood chips and >1 GW of capacity** in 2026 — a public marker of how aggressively the inference frontier is scaling.

### Key papers from Google (interview-relevant)

- *Attention Is All You Need* (2017) — the Transformer.
- *BERT* (2018) — bidirectional pretraining.
- *Scaling Laws for Neural LMs* — compute-optimal training.
- *PaLM / PaLM 2* — multilinguality, reasoning emergence.
- *Gemini technical reports* — multimodal architecture.
- *Chinchilla* — data/parameter ratio.

---

## 19.13 Benchmarks 2026 — What Saturated, What's New

A quick map of the eval landscape interviewers expect you to know:

| Benchmark | Tests | Status |
|---|---|---|
| **MMLU** | Multitask academic knowledge | **Saturated** (~90%+ frontier) |
| **HumanEval** | Python function generation | **Saturated** (~95%+) |
| **GSM8K** | Grade-school math | **Saturated** |
| **GPQA Diamond** | Graduate-level science | Active — frontier ~94% |
| **SWE-bench Verified** | Real GitHub bug fixes | Active — frontier ~88.7% (May 2026) |
| **Terminal-Bench 2.0** | CLI agent tasks | Active — GPT-5.5 82.7% |
| **OSWorld** | Full computer use | Active — Claude Opus 4.7 ~44% |
| **WebArena / VisualWebArena** | Long-horizon web nav | **Unsolved** for long tasks |
| **τ-bench** | Tool-use reasoning | Active |
| **ARC-AGI-2** | Abstract reasoning | Active — frontier still well behind humans |
| **FrontierMath** | Research-level math | Active — frontier ~30% |

If a candidate cites *MMLU* or *HumanEval* as a quality signal in 2026, it's a yellow flag. They're saturated; the live differentiators are SWE-bench, Terminal-Bench, OSWorld, ARC-AGI-2, FrontierMath.

---

## 19.14 What's NOT New — and Still Wins

A useful counterweight to the hype cycle. Many production systems in 2026 still run **classical ML** because it's faster, cheaper, more debuggable, and good enough.

| Use case | Classical winner |
|---|---|
| Click-through-rate prediction at web scale | Gradient-boosted trees (XGBoost / LightGBM) |
| Tabular fraud detection | XGBoost + feature engineering |
| Recommender candidate generation | Two-tower retrieval + ANN |
| Time-series forecasting | Prophet, classical statsmodels, lightweight transformers |
| Search ranking | LambdaMART + neural rerankers, not LLMs |

**Interview answer template**: "I'd start with the simplest classical approach that solves the problem, measure baseline quality, and only add an LLM where the marginal quality justifies the latency and cost." Jumping straight to "use a Transformer" is a 2024 red flag in 2026 interviews.

---

## 19.15 Decision Tree — Which Model for Which Job

```
   What's the task?
        │
        ├── Real-time mobile autocomplete             → Gemini Nano / Apple Foundation (on-device)
        │
        ├── High-QPS classification at scale          → Gemini 3 Flash / GPT-5 mini / open-weight Qwen 3.5
        │
        ├── Complex code generation, formal specs     → Claude Opus 4.7 (extended thinking) or GPT-5.5
        │
        ├── PhD-level science reasoning               → Gemini 3.1 Pro or Claude Opus 4.7 (thinking)
        │
        ├── Long document analysis (>1M tokens)       → Llama 4 Scout (10M ctx) or Gemini 3.1 Pro (2M)
        │
        ├── Browser / desktop automation              → Claude Computer Use, OpenAI Operator
        │
        ├── Voice agent (real-time)                   → GPT-4o Realtime or Gemini Live or ElevenLabs
        │
        ├── Image generation (production)             → Imagen 4, DALL-E 3, FLUX 1.1 Pro
        │
        ├── Video with sync audio                     → Veo 3.1
        │
        ├── Privacy / sovereignty / bulk inference    → Self-host DeepSeek V4-Pro / Llama 4 / Qwen 3.5
        │
        └── Sensitive health / finance / on-device    → On-device with INT4 quantization
```

---

## 19.16 What Goes Wrong (Pitfalls)

1. **Defaulting to a reasoning model for everything.** They charge for thinking tokens; on simple tasks they cost 10–50× and add latency without quality gain.
2. **Citing saturated benchmarks** (MMLU, HumanEval) in interviews. Use SWE-bench, GPQA Diamond, OSWorld, ARC-AGI-2.
3. **Memorising leaderboard numbers.** They drift monthly. Memorise the *shape* of the field, not the digits.
4. **Treating long context as a substitute for retrieval.** Lost-in-the-middle is real; selective retrieval + rerank usually wins.
5. **Ignoring the EU AI Act dates.** If your system touches EU users, Aug 2, 2026 enforcement is non-negotiable.
6. **Picking computer-use for high-QPS production.** It's slow and fragile; APIs always win where they exist.
7. **Skipping classical ML.** XGBoost on tabular data still beats fine-tuned LLMs at 1/100 the cost.
8. **Ignoring the open-weight option.** For most workloads at scale, self-hosted DeepSeek/Llama/Qwen is cheaper and within a few points of frontier APIs.
9. **Confusing video gen with multimodal understanding.** Sora generates; Gemini *reads* video. Different products, different system designs.
10. **Citing model versions that no longer exist** in interviews. Stay current — frontiers shift in months, not years.

---

## 19.17 Interview Questions

**Q1. Walk me through the May 2026 frontier model lineup.**
GPT-5.5 leads autonomous agents (Terminal-Bench 82.7%, OSWorld 78.7%); Claude Opus 4.7 leads software engineering (SWE-bench 87.6%) and tool orchestration; Gemini 3.1 Pro leads price/multimodal (GPQA 94.3%, $2/$12 per M tokens). Open-weight: DeepSeek V4-Pro at 83.7% SWE-bench, Llama 4 Scout with a 10M context window, Qwen 3.5 at 88.4% GPQA. Within ~3 points at the top, so model choice in production is mostly about price, latency, and ecosystem.

**Q2. When does test-time compute scaling beat parameter scaling?**
Test-time compute (reasoning models) scales accuracy on hard, decomposable tasks — math, code, multi-step planning — by spending more inference tokens. Doubling thinking budget often beats doubling parameters on those tasks. Skip it for simple Q&A, creative writing, real-time voice, and high-throughput classification, where the extra cost and latency don't earn back quality.

**Q3. Why did SWE-bench Verified jump from ~13% to ~88% in 18 months?**
Four compounding factors. (1) Stronger base models. (2) Test-time compute / reasoning improved planning over multiple files. (3) Better scaffolding — file IO tools, test runners, diff review, persistent state. (4) Reinforcement learning on agentic traces. Augment Code at 72% with Opus 4.6 vs Cursor at 65.7% with Sonnet 4.6 illustrates the scaffold gap — agent quality is base model + harness.

**Q4. How does INT4 quantization let a 7B model run on a phone?**
Each weight goes from 32 bits (FP32, 28 GB total) to 4 bits (INT4, 3.5 GB) — an 8× reduction. Techniques like GPTQ, AWQ, and GGUF calibrate the quantization on representative data so accuracy drops only ~1–3% on benchmarks. Combined with NPUs (Qualcomm, MediaTek, Apple Neural Engine), this puts a Llama-class model in pocket-sized devices.

**Q5. EU AI Act — what dates and obligations matter for a foundation-model provider?**
General-purpose AI obligations applied from Aug 2, 2025; full enforcement powers and GPAI penalties go live Aug 2, 2026; high-risk regulated-product rules cover Aug 2, 2027. Headline obligations: detailed training data summaries, copyright respect, transparency documentation, systemic-risk evaluations for the largest models. Penalties top out at €35M or 7% of global revenue.

**Q6. Design a Google Photos feature where users ask natural-language questions about their library.**
(1) Embed photos with a SigLIP-style vision-language encoder into a vector store. (2) Embed the user query into the same space; retrieve top-k photos. (3) Send retrieved photos + query to Gemini 3.1 Pro multimodal — the model sees images natively. (4) Route simple search queries to Gemini Nano on-device for privacy and latency; complex reasoning to cloud. (5) Filter for sensitive content and respect user-hidden flags. (6) Measure retrieval recall, answer accuracy, p95 latency, user satisfaction.

**Q7. How would you choose between a closed-weight API and a self-hosted open-weight model?**
Pick closed-weight (GPT-5.5, Claude Opus 4.7, Gemini 3.1 Pro) when you want zero ops, the latest frontier reasoning, computer-use, or quick model-swap. Pick open-weight (DeepSeek V4-Pro, Llama 4, Qwen 3.5) for privacy/sovereignty, billions-of-QPS workloads where token cost dominates, long-context RAG (Llama 4 Scout 10M), or research reproducibility. Many production stacks blend: open-weight for routine traffic, closed-weight API for hard tasks.

**Q8. What's wrong with citing MMLU or HumanEval in 2026?**
They're saturated — frontier models score 90%+ and the metric stops discriminating. Cite live benchmarks: SWE-bench Verified (real bug fixes), Terminal-Bench 2.0 (CLI agents), OSWorld (computer use), GPQA Diamond (graduate science), ARC-AGI-2 (abstract reasoning), FrontierMath (research math).

**Q9. Token prices fell ~1000× since 2022. What changes does that enable architecturally?**
Patterns that were uneconomic become routine. Agentic loops with 30 LLM calls per task are now affordable; multi-agent debates, RAG with hybrid search + cross-encoder reranking, reasoning models with 10K+ thinking tokens — all of these were prohibitively expensive in 2023 and are normal in 2026. Tomorrow's affordable architecture is in the same direction — assume more calls per task, more context per call, more compute at inference time.

**Q10. Computer-use agents — when should you use them, and when not?**
Use for legacy software with no API, one-off cross-app automation, QA of flaky internal tools, back-office data entry. Don't use for high-QPS production traffic (slow, fragile), latency-sensitive UX, or anything with a real API. A 30-step flow takes 60–120 seconds and costs $0.10–$0.50; great for human-paced workflows, terrible for machine-paced ones.

---

## 19.18 Key Takeaways

- **Frontier is plural in 2026** — GPT-5.5, Claude Opus 4.7, Gemini 3.1 Pro within ~3 points of each other; pick by task fit, not raw score.
- **Open-weight closed the gap.** DeepSeek V4-Pro, Llama 4, Qwen 3.5 are real production options.
- **Reasoning models** are about *spending compute at inference time*, not bigger weights. Use them where decomposition pays.
- **Coding agents** went from 13% to 88% on SWE-bench in 18 months — base model × scaffold × RL on agentic traces.
- **Multimodal generation** is now product-grade — Sora 2, Veo 3.1 (with audio), Imagen 4, DALL-E 3, FLUX.
- **Computer-use** is real but for human-paced workflows, not high-QPS production.
- **On-device + INT4** put 3–7B-parameter models in your pocket — privacy + latency + zero marginal cost.
- **Token prices fell ~1000× since 2022** — architectures that were uneconomic are now routine. Assume more calls, more context, more inference compute.
- **Long context (1M–10M tokens)** is real but doesn't replace retrieval — lost-in-the-middle still bites.
- **Context engineering** is the #1 AI engineering skill — the system prompt is the smallest slice of what determines quality.
- **EU AI Act enforcement Aug 2, 2026** — material for any foundation model provider or EU-facing product.
- **Google's 2026 stack**: Gemini 3.x + Gemini Enterprise Agent Platform (rebranded Vertex) + TPU v7 Ironwood + ADK / Agent Engine.
- **Classical ML still wins** many production cases. Start simple; add an LLM only where it earns the latency and cost.

---

## 19.19 Review Questions

1. List three places a reasoning model is the *wrong* choice and explain why.
2. Llama 4 Scout has a 10M-token context. What does that unlock that 1M doesn't, and what *doesn't* it solve?
3. Augment Code scores 72% on SWE-bench with Opus 4.6; Cursor scores 65.7% with Sonnet 4.6. What does the gap tell you about agent system design?
4. A teammate proposes computer-use to handle customer login. Critique.
5. Walk through the alignment techniques from RLHF → Constitutional AI → DPO → RLAIF, and explain what each one fixed about the previous.
6. Token prices fell ~1000× since 2022 but your AI bill went up. Resolve the paradox.
7. Design the context stack for a medical Q&A agent answering doctor-side queries against a hospital's records.
8. EU AI Act — name three obligations a foundation-model provider has and the date they apply.
9. Why is "use Gemini 3 Flash" usually a better production answer than "use Gemini 3 Pro"?
10. Your interviewer asks for the SWE-bench leader. You don't remember the latest score. What do you say?

<div class="chart-container" style="max-width: 600px; margin: 2rem auto;">
<canvas id="interviewTopicsChart"></canvas>
<script>
(function() {
  const ctx = document.getElementById('interviewTopicsChart');
  if (!ctx || typeof Chart === 'undefined') return;
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Reasoning Models', 'Multimodal AI', 'On-Device AI', 'Responsible AI', 'Context Engineering', 'Coding Agents', 'Computer Use'],
      datasets: [{
        label: '2024 Interview Frequency',
        data: [20, 40, 25, 50, 10, 30, 5],
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255,99,132,0.15)'
      }, {
        label: '2026 Interview Frequency',
        data: [80, 80, 60, 85, 95, 90, 60],
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54,162,235,0.15)'
      }]
    },
    options: {
      responsive: true,
      scales: { r: { beginAtZero: true, max: 100, ticks: { display: false } } },
      plugins: { title: { display: true, text: 'Interview Topic Frequency: 2024 vs 2026 (%)' } }
    }
  });
})();
</script>
</div>

---

**Previous:** [Chapter 19 — AI Frameworks & Engineering](19_ai_frameworks.md) | **Next:** [Chapter 21 — Design Fundamentals](21_design_fundamentals.md)
