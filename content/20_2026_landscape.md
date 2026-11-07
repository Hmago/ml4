# Chapter 20 — The 2026 AI Landscape

> A field map of AI **as of 5 November 2026** — the frontier models, the open-weight race, coding and computer-use agents, multimodal generation, on-device AI, the cost curve, regulation, Google's stack and the benchmarks that still mean something.

In late 2022 ChatGPT answered questions. In late 2026 the frontier models think for minutes before answering, run coding agents for hours, operate a desktop from screenshots, and read text, images, audio and video in one prompt. The techniques behind them are in Ch 7–19; this chapter is the world they operate in.

**How to read this chapter.** Every topic has the same shape: a plain explanation that will not date, then **one dated snapshot table** ("verified 5 Nov 2026", with the source named), then *what to look for* when that snapshot goes stale. Model names change every few weeks; the questions you ask about them do not. Where a vendor page disagrees with this chapter, trust the vendor page.

---

## Where you are

**Layer: CONTEXT — *where the field is right now*.** Part of **Deep Learning & LLMs** (Ch 16–20). ~120 min.

| | |
|---|---|
| **Read this** | **First** if you want orientation, or **last** if you want the techniques first. Both work |
| **On Track A** (interview) | Read §20.13–§20.15 and §20.17 the week of your interview — it is the cheapest way to sound current |
| **Shelf life** | Shortest in the book alongside Ch 19. Memorise the **shape** of each snapshot, never the digits — see §20.14 for what does *not* go stale |

**Full section map, tracks and the L1–L4 depth ladder → [Ch 16 — Deep Learning Reference](#content/16_deep_learning).**

### Covered in depth elsewhere

| If you are asked about… | Go to |
|---|---|
| How the techniques behind these models actually work | [Ch 16](#content/16_deep_learning) · [Ch 17](#content/17_llm) · [Ch 17b](#content/17b_llm_applications) |
| Model families, sizes and licences in depth | [Ch 17 §4](#content/17_llm) |
| Serving, quantization mechanics and LLM evaluation | [Ch 17c](#content/17c_llm_systems) |
| How agents, computer use and context engineering work | [Ch 18](#content/18_ai_agents) · [Ch 18b](#content/18b_agents_in_production) |
| TPUs, Google's accelerator stack and training hardware | [Ch 29 — GPUs, TPUs & Infrastructure](#content/29_gpus_tpus_infrastructure) · [Ch 30 — Google ML Ecosystem](#content/30_google_ml_ecosystem) |
| The frameworks used to build on these models | [Ch 19 — AI Frameworks & Engineering](#content/19_ai_frameworks) |

---

## What You'll Learn

By the end of this chapter you'll be able to:

- Name the November 2026 frontier lineup by tier, and say what each tier is for.
- Explain test-time compute and the "reasoning effort" dial, and when the extra tokens pay for themselves.
- Compare the open-weight contenders (Kimi K3, DeepSeek V4, Mistral Large 4, Muse Spark Open, GLM-5, Qwen 3.5, Gemma 4) by memory, compute and licence.
- Tell the coding-agent story honestly — including why SWE-bench Verified was retired.
- Discuss image, video and voice generation, and why these products come and go.
- Read computer-use scores correctly (which OSWorld, which metric) and say where computer use fits.
- Apply on-device and quantization trade-offs to a system design question.
- Reason about the falling price of a fixed capability — and why bills still rise.
- Cite the EU AI Act timeline as amended by the 2026 AI Omnibus, and say which obligations already apply.
- Describe Google's stack (Gemini 4 + Gemini Enterprise Agent Platform + TPU Ironwood).
- Say which benchmarks are saturated, retired, contested or current — and how to read any score.

---

## 20.1 The 2026 Frontier Model Lineup

> **Frontier model**: a generally-capable foundation model at or near the state of the art on the standard benchmarks (reasoning, coding, maths, multimodal). Built by a small set of labs with the compute and talent to push the curve.

![Infographic of the Nov 2026 frontier lineup: a 3 x 3 grid of OpenAI, Anthropic and Google models by tier with USD per 1M token prices (GPT-6 Astra 10 in, 50 out; GPT-6 Luna 0.10 in, 0.50 out, a 100x gap), the cost-per-call formula, who leads which benchmark, and when to use each tier](diagrams/land20_info_frontier_lineup_ai.png)

<details>
<summary><strong>Read as text</strong> — three trims per lab, the cost formula and the lineup at a glance</summary>

**Simple explanation.** Think of each big lab as a car maker that sells the same three trims: a **top tier** (most capable, slowest, priciest), a **workhorse** (nearly as good, several times cheaper) and a **cheap tier** (fast, for millions of small jobs). The names change every few months; the three-trim shape has held since 2024.

> **Maths in one line:** `cost per call = input_tokens × price_in + output_tokens × price_out` — the same request can cost 100× more on a top tier than on a cheap tier (GPT-6 Astra vs GPT-6 Luna), so the trim you pick matters more than the lab.

```
   CLOSED-WEIGHT FRONTIER — verified 5 Nov 2026 (names change every few months)

   Tier           OpenAI                 Anthropic                Google
   ────────────   ────────────────────   ──────────────────────   ─────────────────────────
   Top            GPT-6 Astra            Claude Fable 5.1         Gemini 4 Argon
                                                                  (Gemini 4 Carbon: limited)
   Workhorse      GPT-6.1 Sol / Terra    Claude Opus 5.5,         Gemini 3.8 Flash
                                         Claude Sonnet 5.5
   Cheap / fast   GPT-6 Luna             Claude Haiku 5.5         Gemini 3.5 Flash-Lite

   All of them: ~1M-token context · text + images in (Gemini also audio + video) · text out
   Every one has a "reasoning effort" dial (§20.2)
```

</details>

### Snapshot — the closed-weight lineup (verified 5 Nov 2026)

<details>
<summary><strong>Read as text</strong> — models, release dates, context windows and list prices</summary>

Sources: the OpenAI, Anthropic, Google and SpaceXSI model and pricing pages; standard (non-batch) list prices. This matches [Ch 17 §4](#content/17_llm), which covers each family's history.

| Lab | Model (API id) | Released | Context | Input (USD per 1M tokens) | Output (USD per 1M tokens) |
|---|---|---|---|---|---|
| OpenAI | GPT-6 Astra (`gpt-6-astra`) | Sep 2026 | 1.05M | 10 | 50 |
| OpenAI | GPT-6.1 Sol (`gpt-6.1-sol`) | Sep 29, 2026 | 1.05M | 2 | 10 |
| OpenAI | GPT-6.1 Terra (`gpt-6.1-terra`) | Oct 26, 2026 | 1.05M | 1 | 5 |
| OpenAI | GPT-6 Luna (`gpt-6-luna`) | Sep 22, 2026 | 1.05M | 0.10 | 0.50 |
| Anthropic | Claude Fable 5.1 (`claude-fable-5-1`) | Sep 2026 | 1M | 10 | 50 |
| Anthropic | Claude Opus 5.5 (`claude-opus-5-5`) | Sep 22, 2026 | 1M | 4 | 20 |
| Anthropic | Claude Sonnet 5.5 (`claude-sonnet-5-5`) | Sep 2026 | 1M | 2 | 10 |
| Anthropic | Claude Haiku 5.5 (`claude-haiku-5-5`) | Sep–Oct 2026 | 1M | 0.10 (prompts up to 100K) | 0.50 (prompts up to 100K) |
| Google | Gemini 4 Argon (`gemini-4-argon`) | Sep 30, 2026 (open to all Oct 13) | 1M | 2 (4 from Dec 1) | 10 (20 from Dec 1) |
| Google | Gemini 3.8 Flash (`gemini-3.8-flash`) | Sep 2, 2026 | 1M | 0.75 (1.50 from Jan 1) | 3.75 (7.50 from Jan 1) |
| SpaceXSI (formerly xAI) | Grok 4.7 (`grok-4.7`) | Sep 21, 2026 | 500K | 2 | 6 |

Notes on the snapshot: OpenAI's standard rates apply to prompts under 272K tokens; Google's Argon and 3.8 Flash prices are introductory; **Gemini 4 Carbon** (Oct 28, 2026) is Google's strongest model but goes only to vetted cyber defenders for now; Anthropic also offers Fable 5.1 as **Mythos 5.1** to organisations verified for sensitive security and biology work. Batch APIs halve most of these prices.

</details>

### What the snapshot tells you (this part does not date)

<details>
<summary><strong>Read as text</strong> — five patterns that outlast the numbers, and the interview tip</summary>

| Pattern | Evidence, Nov 2026 |
|---|---|
| **No single winner** — each lab leads somewhere | Terminal-Bench 4.0: Claude Opus 5.5 first; ARC-AGI-3: GPT-6 Astra first; Arena text and the Artificial Analysis index v5.0: Gemini 4 Carbon first (§20.13) |
| **Price spread is inside each lab** | OpenAI's top tier is 100× its cheap tier on input; the three labs' workhorses are within about 5× of each other |
| **Context has converged** | ~1M tokens on almost every frontier API model (Grok 4.7: 500K) — [§20.9](#content/20_2026_landscape) |
| **Reasoning is a dial, not a product** | Every model above takes a reasoning-effort setting (§20.2) |
| **Releases are staged** | Models strong at cyber-offence ship first, or only, to vetted defenders (Gemini 4 Carbon, Claude Mythos 5.1) |

**Interview tip:** don't memorise these digits — they shift monthly. Memorise the *shape*: three tiers per lab, the leaders within a few points of each other, open weights a few months behind (§20.3), and **model choice decided mostly by price, latency, ecosystem and your own eval**, not by a leaderboard. Say "as of <month, year>" whenever you quote a number. The habits for checking a lineup yourself are in [Ch 17 §4.6](#content/17_llm) ("How to stay current").

</details>

---

## 20.2 Reasoning Models & Test-Time Compute

> **Reasoning model**: an LLM that allocates additional compute *at inference time* — generating hidden "thinking" tokens before producing a final answer — so accuracy on hard problems scales with thinking budget rather than parameters alone.

![Infographic of the reasoning-effort dial: a normal call versus a call with 8,000 hidden thinking tokens, a low-to-max effort knob with the OpenAI, Anthropic and Gemini parameter names, the cost formula with thinking billed as output, and worked costs at 2 and 10 USD per 1M tokens where reasoning wins on hard maths (0.184 vs 0.354 USD) but loses on easy lookup (0.104 vs 0.029 USD)](diagrams/land20_info_reasoning_dial_ai.png)

<details>
<summary><strong>Read as text</strong> — the student who shows their work, and the thinking-token bill</summary>

Plain explanation: a normal LLM is like a student who blurts the first answer that comes to mind. A reasoning model is the same student told "show your work, take your time." On a hard problem they often do much better; on easy ones they overthink and waste tokens. How these models are trained (RL on answers a program can check — RLVR, GRPO) is in [Ch 17 §3.5b](#content/17_llm).

> **Maths in one line:** `cost = input × p_in + (thinking + answer) × p_out` — thinking tokens are billed as output, so 8,000 hidden tokens in front of a 300-token answer multiply the output bill by about 28.

</details>

### How test-time compute scales

<details>
<summary><strong>Read as text</strong> — normal vs reasoning calls, and what changed since o1</summary>

```
   Normal answer:
      Input ──> [ forward passes, one per answer token ] ──> Output
      cost: grows with the answer length only

   Reasoning (every 2026 flagship — GPT-6, Claude 5.5, Gemini 4, DeepSeek V4 — has it):
      Input ──> [ think... think... think... ] ──> Output
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                hidden tokens (about 1K to 100K+)
      cost: grows with how hard the model decides the task is

   Typical finding: on maths, code and multi-step planning, more thinking can beat
   a much bigger model — the gains flatten and the bill grows. On easy tasks it barely helps.
```

Two things changed since the first reasoning models (o1, 2024). First, **thinking is built into every flagship** — there is no separate "reasoning model" to choose, just a dial. Second, models now think **adaptively**: at the same setting they spend fewer tokens on easy prompts. The visible reasoning is a summary or trace, not a guaranteed honest explanation ([Ch 17 §15.1b](#content/17_llm)).

</details>

### Snapshot — the reasoning dial by vendor (verified 5 Nov 2026)

<details>
<summary><strong>Read as text</strong> — the effort parameter, its levels and defaults per vendor</summary>

| Vendor | Where you set it | Levels | Default |
|---|---|---|---|
| OpenAI (Responses API) | `reasoning={"effort": ...}` | `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max` — model-dependent (GPT-6 Astra has no `none`) | model-dependent (`medium` on GPT-6.1 Sol) |
| Anthropic (Messages API) | `output_config={"effort": ...}`; adaptive thinking | `low`, `medium`, `high`, `xhigh`, `max` | `medium` on Opus 5.5 and Haiku 5.5, `high` on the others |
| Google (Gemini API) | `thinking_level` in the thinking config | `low`, `medium`, `high` on Gemini 4 Argon and 3.8 Flash (some older Flash models also `minimal`) | `medium` on Gemini 4 Argon and 3.8 Flash |
| SpaceXSI (Grok 4.7) | `reasoning_effort` | `low`, `medium`, `high`, `xhigh` | `high` |
| DeepSeek (V4.1 Flash, open weights) | reasoning effort | 1 to 100 | — |

</details>

### Hello world — turning the dial

<details>
<summary><strong>Read as text</strong> — two API calls with the effort dial set to high (OpenAI and Anthropic)</summary>

Both blocks need an API key, so run them locally. OpenAI recommends the **Responses API** for reasoning models (Chat Completions still works, but not for function calling with GPT-6 Astra or 6.1 Sol).

```python
# Runs locally: pip install openai; needs OPENAI_API_KEY
from openai import OpenAI

client = OpenAI()
response = client.responses.create(
    model="gpt-6.1-sol",              # verified model id, Nov 2026
    reasoning={"effort": "high"},     # model-dependent: none ... max
    input="Prove that the square root of 2 is irrational.",
)
print(response.output_text)
print(response.usage.output_tokens_details.reasoning_tokens, "hidden reasoning tokens billed")
```

```python
# Runs locally: pip install anthropic; needs ANTHROPIC_API_KEY
import anthropic

client = anthropic.Anthropic()
message = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=16000,                     # hard cap on thinking + answer together
    output_config={"effort": "high"},     # low / medium (Opus 5.5 default) / high / xhigh / max
    messages=[{"role": "user", "content": (
        "Seat 8 guests A-H at a round table: A next to B, C not next to D, "
        "E directly opposite F. Give one valid seating.")}],
)
for block in message.content:
    if block.type == "text":
        print(block.text)
```

</details>

### When reasoning helps vs hurts

<details>
<summary><strong>Read as text</strong> — when to turn the effort up, and the cost trap</summary>

| Turn the effort up | Keep it low (or off) |
|---|---|
| Maths, formal logic, theorem-style problems | Simple Q&A, trivia, lookup |
| Multi-step planning ("design X given constraints") | Creative writing, brainstorming |
| Hard code generation and long agentic coding | High-throughput classification |
| Scientific analysis with multiple hypotheses | Real-time voice (latency-bound) |
| Debugging legacy code | Bulk extraction from clean structured input |

**The cost trap.** Thinking tokens are billed as output, so a high-effort call is often 10–50× the price of a quick one. Whether that pays depends on what a wrong answer costs you. The program below prices one call both ways on a mid-tier model, then adds the cost of a person fixing each wrong answer.

</details>

```python
# When does a reasoning model pay? Cost per task = API cost + (1 - accuracy) x cost of fixing a wrong answer
P_IN, P_OUT = 2.00, 10.00   # USD per 1M tokens: a mid-tier list price (Claude Sonnet 5.5, Nov 2026)
FIX_COST = 0.50             # USD: a person spends a few minutes fixing one wrong answer (assumption)

def call_cost(in_tok, out_tok):
    return (in_tok * P_IN + out_tok * P_OUT) / 1_000_000

normal = call_cost(500, 300)               # answer straight away
reasoning = call_cost(500, 8_000 + 300)    # 8,000 hidden thinking tokens, then the same answer
ratio = reasoning / normal
print(f"normal call    : {normal:.4f} USD")
print(f"reasoning call : {reasoning:.4f} USD ({ratio:.0f}x the normal call)")
assert 10 <= ratio <= 50                   # the '10-50x' rule of thumb

# Accuracies below are illustrative assumptions, not measurements
tasks = {"hard multi-step maths": (0.30, 0.80), "easy lookup": (0.95, 0.96)}
for name, (acc_normal, acc_reason) in tasks.items():
    total_normal = normal + (1 - acc_normal) * FIX_COST
    total_reason = reasoning + (1 - acc_reason) * FIX_COST
    winner = "reasoning" if total_reason < total_normal else "normal"
    print(f"{name:21s}: normal {total_normal:.3f} | reasoning {total_reason:.3f} -> {winner} wins")
```

**Output:**

```
normal call    : 0.0040 USD
reasoning call : 0.0840 USD (21x the normal call)
hard multi-step maths: normal 0.354 | reasoning 0.184 -> reasoning wins
easy lookup          : normal 0.029 | reasoning 0.104 -> normal wins
```

<details>
<summary><strong>Read as text</strong> — continued: what the numbers show</summary>

Reading it: the reasoning call is 21× dearer, yet on the hard task it halves the total cost because it removes most of the expensive human fixes. On the easy task the extra 1 point of accuracy is not worth 21× — keep the dial low.

</details>

---

## 20.3 The Open-Weight Race

![Infographic of the open-weight race: paired bar charts of 4-bit memory and compute per token for Kimi K3, DeepSeek V4-Pro, Qwen3.5 397B and dense Gemma 4 31B (Qwen needs 13x Gemma's memory but 0.55x its compute), the memory and compute formulas, a licence table (MIT, Apache 2.0, custom), and when to pick open versus closed weights](diagrams/land20_info_open_weight_race_ai.png)

<details>
<summary><strong>Read as text</strong> — weights you can download, and MoE memory vs compute</summary>

**Simple explanation.** "Open weights" means you can download the model file and run it on your own machines — no per-token bill, and your data never leaves your network. The catch is that you now pay for the GPUs, and the licence decides what you may do with it. Almost every open flagship is a **sparse Mixture-of-Experts (MoE)**: a giant total parameter count, with only a small slice of "experts" used for each token ([Ch 17 §4.8](#content/17_llm)).

> **Maths in one line:** `weight memory ≈ total parameters × bytes per weight`, while `compute per token ≈ 2 × active parameters` — an MoE model needs memory for all of its experts but pays compute only for the few it uses.

</details>

### Snapshot — notable open-weight models (verified 5 Nov 2026)

<details>
<summary><strong>Read as text</strong> — the Nov 2026 open models, their sizes, licences and the 4-month gap</summary>

Sources: the Hugging Face model cards and the labs' release posts; the full family history is in [Ch 17 §4.6](#content/17_llm).

| Model (lab) | Released | Total / active parameters | Context | Licence |
|---|---|---|---|---|
| **Kimi K3 / K3.1 Pro** (Moonshot AI) | Jul 2026 / Oct 23, 2026 | 2.8T / 104B — among the largest open releases so far | 1M | Kimi K3 (and K3.1 Pro) License — custom |
| **DeepSeek V4-Pro / V4-Flash** | Apr 2026 | 1.6T / 49B; 284B / 13B | 1M | MIT |
| **DeepSeek V4.1 Flash** | Sep 10, 2026 (update Oct 17) | 552B backbone; 8B active in prefill, 16B in decode | 1M | MIT |
| **Mistral Large 4** (Mistral AI) | Oct 2026 | 1.05T / 52B, plus a 1.6B vision encoder | 1M | Mistral Ecosystem Open Weight License (modified MIT; model-as-a-service providers need a commercial licence) |
| **Muse Spark Open** (Meta) | Oct 15, 2026 | 816B / 42B, natively multimodal | 1M | Muse Model License |
| **GLM-5 / GLM-5.3** (Z.ai) | Feb / Aug 2026 | 744B / 40B (GLM-5; 5.3 is a post-trained update) | 200K (GLM-5) | MIT for GLM-5; GLM-5.3 has its own licence — check the card |
| **Qwen 3.5 / 3.6** (Alibaba) | Feb / Apr 2026 | 397B / 17B flagship, sizes down to 0.8B | see card | Apache 2.0 (check each card) |
| **Llama 4 Scout / Maverick** (Meta) | Apr 2025 | 109B / 17B; 400B / 17B | 10M advertised; 1M | Llama 4 Community Licence |
| **gpt-oss-120b / 20b** (OpenAI) | Aug 2025 | 117B / 5.1B; 21B / 3.6B | 128K | Apache 2.0 |
| **Gemma 4** (Google) | Apr 2026 | E2B, E4B, 12B, 26B MoE, 31B dense | 128K–256K | Apache 2.0 |

**The shape (this part does not date).** The strongest open models now come mostly from Chinese labs (Moonshot, Z.ai, DeepSeek, Alibaba), with Meta's Muse Spark Open and Mistral Large 4 the main Western releases. [Ch 17](#content/17_llm) cites Epoch AI (May 2026): the best open models trail the best closed ones by **about 4 months** on average, and the gap re-opens each time a new closed flagship ships. Llama 4 (April 2025) is still Meta's latest *Llama*; Meta's newer work ships under the Muse name.

The program below turns the "Maths in one line" into numbers: how many 80 GB GPUs each model needs just to hold its weights at 4 bits, and how much compute each generated token costs.

</details>

```python
# Memory follows TOTAL parameters, compute follows ACTIVE ones (sizes from the Nov 2026 model cards)
import math

models = {                      # name: (total params, active params), in billions
    "Kimi K3": (2800, 104),
    "DeepSeek V4-Pro": (1600, 49),
    "Muse Spark Open": (816, 42),
    "Qwen3.5-397B-A17B": (397, 17),
    "gpt-oss-120b": (117, 5.1),
    "Gemma 4 31B (dense)": (31, 31),
}
GPU_GB = 80                     # one H100-class GPU

print(f"{'model':20s} {'BF16 GB':>8s} {'4-bit GB':>9s} {'GPUs@4bit':>10s} {'GFLOP/token':>12s}")
for name, (total, active) in models.items():
    gb_bf16 = total * 2         # 2 bytes per weight
    gb_int4 = total * 0.5       # 0.5 bytes per weight (weights only, no KV cache)
    gpus = math.ceil(gb_int4 / GPU_GB)
    gflops = 2 * active         # ~2 FLOPs per active parameter per generated token
    print(f"{name:20s} {gb_bf16:8.0f} {gb_int4:9.1f} {gpus:10d} {gflops:12.1f}")

qwen, gemma = models["Qwen3.5-397B-A17B"], models["Gemma 4 31B (dense)"]
assert qwen[0] > gemma[0] and qwen[1] < gemma[1]   # 13x the memory, about half the compute
print(f"Qwen3.5 stores {qwen[0] / gemma[0]:.0f}x Gemma's weights but does {qwen[1] / gemma[1]:.2f}x its compute per token")
```

**Output:**

```
model                 BF16 GB  4-bit GB  GPUs@4bit  GFLOP/token
Kimi K3                  5600    1400.0         18        208.0
DeepSeek V4-Pro          3200     800.0         10         98.0
Muse Spark Open          1632     408.0          6         84.0
Qwen3.5-397B-A17B         794     198.5          3         34.0
gpt-oss-120b              234      58.5          1         10.2
Gemma 4 31B (dense)        62      15.5          1         62.0
Qwen3.5 stores 13x Gemma's weights but does 0.55x its compute per token
```

<details>
<summary><strong>Read as text</strong> — continued: why the 397B model is cheaper per token than the 31B one</summary>

The surprise in the last line is the whole MoE story: the 397B model is **cheaper to run per token** than the 31B dense one, but it needs three GPUs just to *hold*. Real deployments also need room for the KV cache ([Ch 17c §1.2](#content/17c_llm_systems)).

</details>

### Why it matters in interviews

<details>
<summary><strong>Read as text</strong> — cost, licences and quality</summary>

1. **Cost & sovereignty** — self-host on TPUs or GPUs, no per-token bill, data never leaves your VPC.
2. **Licences differ** — MIT and Apache 2.0 (DeepSeek, GLM-5, Qwen, gpt-oss, Gemma 4) are permissive; Llama 4, Muse, Kimi K3, GLM-5.3 and Mistral Large 4 use their own licences with conditions. "Open weights" is not "open source": the training data is almost never released.
3. **Quality** — a few months behind the closed frontier is good enough for many production tasks, especially after fine-tuning on your own data.

</details>

### When to pick open-weight

<details>
<summary><strong>Read as text</strong> — when open weights win, and when closed ones do</summary>

- Privacy-critical workloads (health, finance, defence, sovereign cloud).
- Bulk inference where token cost dominates (classification and extraction at very high volume).
- You need to fine-tune deeply, distil, or inspect the model.
- Research where reproducibility matters.

When to pick **closed-weight**: top-end agent reliability, the newest reasoning frontier, polished computer use, or when you want zero ops.

</details>

---

## 20.4 Coding Agents — The 2026 Headline Story

> **Coding agent**: an LLM-powered system that reads a codebase, plans changes, edits files, runs tests, and iterates — autonomously or with a human in the loop. The category that took over developer tooling in 2025–2026.

![Infographic of coding agents in 2026: agent score as a function of model, harness, effort and task set; a timeline from Devin at about 14 percent (Mar 2024) through SWE-bench Verified (Aug 2024), its retirement (Feb 2026) and SWE-bench Pro's retracted recommendation (Jul 2026); the Terminal-Bench 4.0 leaderboard of 28 Oct 2026 (Claude Opus 5.5 with Claude Code 64.8 percent); and the ARC-AGI-3 harness effect, 54.8 vs 99.9 percent for the same model](diagrams/land20_info_coding_agents_ai.png)

<details>
<summary><strong>Read as text</strong> — a tireless junior developer: model plus harness</summary>

**Simple explanation.** A coding agent is a junior developer that never gets tired: give it a ticket, it reads the repo, writes a patch, runs the tests, and tries again until they pass. Two things decide how good it is — the **model** (the brain) and the **harness** (the tools, prompts and loop around it; [Ch 18 §18.4](#content/18_ai_agents)).

> **Maths in one line:** `agent score = f(model, harness, effort, task set)` — change any one of the four and the "same model" gets a different number, so a score without its harness and date is not a fact.

</details>

### How the race was measured — and why the scoreboard keeps changing

<details>
<summary><strong>Read as text</strong> — from Devin and SWE-bench to Terminal-Bench 4.0, 2024–2026</summary>

| When | What happened |
|---|---|
| Mar 2024 | Devin solved about 14% of (a sample of) the original **SWE-bench** — real GitHub issues, judged by the project's own tests |
| Aug 2024 | **SWE-bench Verified**: 500 human-checked tasks; the best system scored about 33% at launch |
| Feb 2026 | OpenAI **stopped reporting Verified**: at least 59% of the hard tasks it audited had flawed tests, and every frontier model it tried could reproduce some gold patches from memory (contamination). State of the art had crept only from 74.9% to 80.9% in six months. It recommended **SWE-bench Pro** |
| Jul 2026 | OpenAI audited SWE-bench Pro's 731 public tasks (frontier scores had jumped from 23.3% to 80.3% in eight months), estimated **~30% of tasks are broken**, and **retracted** its recommendation |
| Nov 2026 | Vendors report **Terminal-Bench 4.0** plus newer coding suites (DeepSWE, FrontierCode, SWE-Marathon). Treat each as one noisy signal (§20.13) |

</details>

### Snapshot — Terminal-Bench 4.0 (verified 5 Nov 2026)

<details>
<summary><strong>Read as text</strong> — the 28 Oct 2026 leaderboard and how to read it</summary>

Terminal-Bench gives an agent hard, real command-line tasks (66 tasks in 4.0, 5 trials each, so one task is worth about 1.5 points). The numbers below are the benchmark owner's leaderboard at tbench.ai (snapshot of 28 Oct 2026) — **model + harness**, at the highest effort tested.

```
   Terminal-Bench 4.0 — tbench.ai leaderboard, 28 Oct 2026

   Claude Opus 5.5   · Claude Code      ████████████████████████████████   64.8%
   Claude Sonnet 5.5 · Claude Code      ███████████████████████████████    61.8%
   GPT-6 Astra       · Codex            █████████████████████████████      58.2%
   GPT-6.1 Sol       · Codex            █████████████████████████████      58.2%
   Claude Fable 5.1  · Claude Code      █████████████████████████████      57.9%
   GLM-5.3 (open)    · Claude Code      █████████████████████              41.8%
   Gemini 3.8 Flash  · mini-SWE-agent   ██████████                         19.1%
```

Read it like an engineer: the top five are within about 7 points, three of them are statistically tied, the best open-weight entry is about 23 points behind, and a model run in a generic harness (Gemini 3.8 Flash in mini-SWE-agent) is not comparable with one run in its own vendor's agent.

</details>

### The dev-tool landscape (Nov 2026)

<details>
<summary><strong>Read as text</strong> — the tools, their form factors, and copilots vs delegated agents</summary>

| Tool (maker) | Form factor | Best for |
|---|---|---|
| **Claude Code** (Anthropic) | Terminal agent, plus desktop and web apps | Long multi-file changes, agentic loops |
| **Codex** (OpenAI) | CLI, IDE extension, cloud tasks, desktop app | GPT-6-native workflows |
| **Cursor** (Anysphere) | AI-native IDE (a VS Code fork) | Inline edits, codebase-aware chat, agent mode across vendors' models |
| **GitHub Copilot** | IDE extension + a cloud coding agent that opens pull requests | Broad enterprise rollout, several vendors' models |
| **Antigravity · Gemini CLI · Jules** (Google) | Agent-first IDE · terminal agent · async cloud agent | Gemini-native workflows |
| **Devin · Windsurf** (Cognition) | Async cloud agent · IDE (Windsurf joined Cognition in 2025) | Delegated tickets |
| **Kiro** (AWS) · **Grok Build** (SpaceXSI) | Spec-driven IDE · terminal agent | AWS-centred and Grok-native work |

The trend: coding split into **interactive copilots** (tight feedback loops in the editor) and **delegated agents** (hand over a ticket, review the pull request). Both keep a human in the review loop — the moment trust breaks, productivity collapses ([Ch 18b §18.13](#content/18b_agents_in_production)).

</details>

### Hello world — letting Claude Code edit your repo

<details>
<summary><strong>Read as text</strong> — install Claude Code and hand it a task</summary>

```bash
# Install (native installer, Nov 2026). Windows PowerShell: irm https://claude.ai/install.ps1 | iex
curl -fsSL https://claude.ai/install.sh | bash

# In your repo
claude

# Then ask:
> Add tests for src/auth/login.ts and run them
# Claude reads the file, writes tests, runs `npm test`, fixes failures, shows the diff.
```

</details>

### Interview angle

<details>
<summary><strong>Read as text</strong> — why scores rose, and why to be careful with them</summary>

Expect *"How would you build a coding agent?"* or *"Why did coding scores jump so fast — and can you trust them?"*. A strong answer has two halves.

**Why scores rose:** (1) better base models, (2) test-time compute for planning across files, (3) better harnesses — file tools, test runners, diff review, memory across long sessions, (4) reinforcement learning on agentic traces.

**Why to be careful:** (5) contamination and broken tests (Verified retired, Pro contested), and (6) harness effects. A clean, verified example of (6): on ARC-AGI-3 the ARC Prize team ran GPT-6 Astra at the same "high" effort in two harnesses and got **54.8%** with their Standard harness and **99.9%** with a Provider Adapter that keeps the model's reasoning state between steps. Same model, nearly double the score — agent quality is model *plus* harness.

</details>

---

## 20.5 Multimodal Generation — Images, Video, Voice

![Infographic of image, video and voice generation as of Nov 2026: three columns of products (gpt-image-2, Nano Banana, FLUX.2; Gemini Omni Flash 3-10 s clips at up to 4K and 24 fps, Veo 3.1 with audio, Sora discontinued; Realtime API, Gemini 3.8 Live, ElevenLabs), the voice shift from a 2.8-5.4 s chained pipeline to one end-to-end model at about 320 ms, a pick-by-need table and common mix-ups](diagrams/land20_info_multimodal_generation_ai.png)

<details>
<summary><strong>Read as text</strong> — makers vs readers, and the key numbers</summary>

**Simple explanation.** Generation models turn a description into a picture, a video clip or a voice. They are separate products from the chat models that *read* images and video ([Ch 17 §4.9](#content/17_llm)) — a model that understands a video is not the one that makes it. The lesson of 2026: these products are **young and short-lived**, so build behind an abstraction you can re-point.

> **Key numbers:** today's video models make clips of seconds, not minutes (Google's Gemini Omni Flash: 3–10 s, up to 4K, 24 frames per second), and end-to-end voice models answer in a few hundred milliseconds (GPT-4o averaged about 320 ms in 2024) instead of the 2.8–5.4 s average of ChatGPT's earlier speech-to-text → LLM → text-to-speech chain.

</details>

### Snapshot — generation products (verified 5 Nov 2026)

<details>
<summary><strong>Read as text</strong> — image, video and voice products as of Nov 2026, and the production rule</summary>

| Modality | Product (maker) | Status, Nov 2026 |
|---|---|---|
| Image | **gpt-image-2** (OpenAI) | Released Apr 21, 2026 (snapshot `gpt-image-2-2026-04-21`); generation and editing in the API |
| Image | **Nano Banana Pro / Nano Banana 2 / 2.1** (Google's Gemini image models) | Generation and multi-turn editing in the Gemini API |
| Image | **FLUX.2** (Black Forest Labs) | Open weights: FLUX.2 [dev] 32B (Nov 2025, non-commercial licence) and small, fast [klein] models (the 4B ones are Apache 2.0) |
| Image | Midjourney · Stable Diffusion 3.5 | Aesthetic-first product · open-weight workhorse — check current versions |
| Video | **Gemini Omni Flash** (Google, `gemini-omni-1.1-flash`) | Text, image or video in → a 3–10 s video; conversational editing; stable since Aug 2026 |
| Video | **Veo 3.1** (Google) | Native audio; generally available on Gemini Enterprise Agent Platform; its Gemini API preview shut down Oct 22, 2026 |
| Video | **Sora** (OpenAI) | **Discontinued** — the app on Apr 26, 2026 and the API on Sep 24, 2026, about a year after Sora 2 launched |
| Video | Kling (Kuaishou) · Runway · Seedance (ByteDance) | Strong competitors — check current versions |
| Voice | **OpenAI Realtime API / GPT-Live-1** | Speech-to-speech; GPT-Live-1 voice sessions billed per second |
| Voice | **Gemini 3.8 Live** (Google) | Default Live API model for low-latency voice agents |
| Voice | **ElevenLabs** | Production voice agents and text-to-speech |

**Production rule of thumb**: hosted APIs for quality and safety filters; open weights (FLUX.2, Stable Diffusion) when you need self-hosting or customisation (LoRA, ControlNet).

</details>

### Voice — the architecture shift

<details>
<summary><strong>Read as text</strong> — chained pipeline vs one end-to-end model, and the vendor-risk answer</summary>

The shift: early voice assistants chained `speech-to-text → LLM → text-to-speech` — high latency, and the tone of voice was lost at the text step. Current voice models are **one model end-to-end**: they hear tone, can be interrupted naturally, and reply in a few hundred milliseconds. That is what makes phone-based AI agents usable.

**Interview angle:** "Our product depends on a video model — what's your risk plan?" Name the Sora shutdown, then answer: an internal interface over two vendors, stored prompts and seeds so you can regenerate, and an eval set to re-qualify a replacement model in days.

</details>

---

## 20.6 Computer-Use Agents

> **Computer-use agent**: an AI that drives a real computer — looking at the screen, moving a mouse, typing, clicking — to complete tasks intended for humans (filling forms, navigating browsers, operating apps).

![Infographic of computer-use agents: the screenshot, decide, click or type, new screenshot loop; task success = p_step to the power of steps with bars for 1, 10 and 30 steps (99, 90 and 74 percent); OSWorld scores from about 12 percent in 2024 to 86.1 percent on OSWorld-Verified and 20.6 percent completion on OSWorld 2.0; and worked costs of 0.631 USD for 30 steps and 18.546 USD for 300 steps (0.188 and 2.443 USD with caching)](diagrams/land20_info_computer_use_ai.png)

<details>
<summary><strong>Read as text</strong> — the screenshot intern, and why long tasks fail</summary>

**Simple explanation.** Picture an intern who can only see your screen through photos and can only act by telling you "click here, type this". Every step is: take a screenshot, think, do one action, take a new screenshot. That makes it universal — it works on any app, even ones with no API — and also slow and fragile. *How* the loop works (screenshots, coordinates, the tool's request and response shape) is taught in [Ch 18 §18.6](#content/18_ai_agents); this section covers the products, the scores and where it fits.

> **Maths in one line:** `task success ≈ p_step ^ steps` — at 99% per step, a 30-step task still fails about one time in four (0.99^30 ≈ 0.74), which is why long desktop workflows are so much harder than short ones.

</details>

### How far the scores moved — and which OSWorld a number comes from

<details>
<summary><strong>Read as text</strong> — three OSWorld versions, their baselines and how to read a score</summary>

OSWorld is the standard test: real desktop apps in a virtual machine, with a script that checks whether the task was really done. There are now three versions, and a score means little until you know which one.

| Version | What it contains | Human baseline | Scores |
|---|---|---|---|
| **OSWorld** (Apr 2024) | 369 tasks across Ubuntu, Windows and macOS apps | about 72% | Best model at launch: about 12% |
| **OSWorld-Verified** (Jul 2025) | The same suite with broken tasks repaired | about 72% (from the original paper) | Best reported, Nov 2026: 86.1% (Qwen3.8 Max); most top rows are vendor self-reports |
| **OSWorld 2.0** (Jun 2026) | 108 long-horizon workflows; humans need a median of about 1.6 hours each; an agent makes about 318 tool calls per task, against about 30 in the original | — | In the paper, the best agent (Claude Opus 4.8) **completed 20.6%** of tasks, with a **54.8% partial score**, at 500 steps |

Reading it: on short tasks (OSWorld-Verified) agents now beat the ~72% human baseline, so that benchmark is close to saturated. On whole professional workflows (OSWorld 2.0) they still fail about four times out of five — the paper says they lose track of constraints, miss information that arrives mid-task and skip verification. Watch the metric too: vendors often quote the *partial* score (GPT-6 Astra: 72.6% partial on a later OSWorld 2.0 task set), which is not comparable with a *completion* rate.

</details>

### Snapshot — computer-use products (verified 5 Nov 2026)

<details>
<summary><strong>Read as text</strong> — four form factors and who controls the machine</summary>

| Form factor | Examples | Who controls the machine |
|---|---|---|
| **API tool** — your code runs the loop | Anthropic's computer-use tool; OpenAI's computer-use tool (Responses API); Google's Gemini computer-use model | You: your sandboxed VM, your logs, your network rules |
| **Agent inside an assistant app** | ChatGPT agent; Gemini Agent (it absorbed Project Mariner, which Google shut down on May 4, 2026) | The vendor's cloud browser or VM |
| **Agent inside your own browser** | Claude for Chrome; Chrome's auto-browse (Gemini) | Your logged-in sessions — the highest prompt-injection risk ([Ch 18b §18.14](#content/18b_agents_in_production)) |
| **Specialised open models** | H Company's Holo3 and Tencent's UI-Mate (both on the OSWorld-Verified leaderboard) | Self-hosted |

</details>

### Where computer-use fits — and where it doesn't

<details>
<summary><strong>Read as text</strong> — right fit vs wrong fit, and why cost grows faster than steps</summary>

| Right fit | Wrong fit |
|---|---|
| Legacy software with no API | High-QPS production traffic |
| One-off automation across many apps | Latency-sensitive UX (seconds per click) |
| QA-automating a flaky internal tool | Anything with a public API (use the API) |
| Internal back-office data entry | Anything where mis-clicks have high blast radius |

**Cost & speed.** Each step sends a fresh screenshot plus the growing history to the model, so cost grows faster than the number of steps. The program below prices a short 30-step task and an OSWorld 2.0-length task (about 300 steps) on a mid-tier model, with and without prompt caching, and compares them with one ordinary API call.

</details>

```python
# Cost and time of a computer-use task vs one API call (token sizes are illustrative assumptions)
P_IN, P_OUT, P_CACHE = 2.00, 10.00, 0.10   # USD per 1M tokens: mid-tier list price; cache read = 5% of input
SYSTEM, SHOT, ACTION, OUT = 3_000, 1_500, 150, 200   # tokens: tools+rules, one screenshot, one past action, reply
KEEP_SHOTS, SEC_PER_STEP = 3, 3.0                     # keep the last 3 screenshots; ~3 s per step

def task(steps, cached):
    cost = 0.0
    for t in range(1, steps + 1):
        prompt = SYSTEM + min(t, KEEP_SHOTS) * SHOT + (t - 1) * ACTION
        new = SHOT + ACTION if cached and t > 1 else prompt     # idealised: all but the newest part is a cache hit
        cost += (new * P_IN + (prompt - new) * P_CACHE + OUT * P_OUT) / 1e6
    return cost, steps * SEC_PER_STEP / 60

api_call = (1_000 * P_IN + 200 * P_OUT) / 1e6
print(f"one API call         : {api_call:.4f} USD, under a second")
for steps in (30, 300):          # a short desktop task vs an OSWorld 2.0-style workflow (~300 tool calls)
    for cached in (False, True):
        cost, minutes = task(steps, cached)
        label = "with cache" if cached else "no cache"
        print(f"{steps:3d} steps, {label:10s}: {cost:7.3f} USD, {minutes:4.1f} min, {cost / api_call:6.0f}x one API call")

per_day = task(30, True)[0] * 10 * 86_400        # 10 tasks per second, all day
print(f"30-step tasks at 10 per second: {per_day:,.0f} USD per day")
assert task(300, True)[0] < task(300, False)[0] / 5   # caching cuts the long task by more than 5x
```

**Output:**

```
one API call         : 0.0040 USD, under a second
 30 steps, no cache  :   0.631 USD,  1.5 min,    158x one API call
 30 steps, with cache:   0.188 USD,  1.5 min,     47x one API call
300 steps, no cache  :  18.546 USD, 15.0 min,   4636x one API call
300 steps, with cache:   2.443 USD, 15.0 min,    611x one API call
30-step tasks at 10 per second: 162,467 USD per day
```

<details>
<summary><strong>Read as text</strong> — continued: what the costs mean</summary>

Reading it: a short task costs tens of cents and a minute or two — fine for a workflow a person runs ten times a day, ruinous at ten times a second. Prompt caching ([Ch 17c](#content/17c_llm_systems)) cuts the long task about 8×, because almost all of each prompt repeats the previous one. If the app has an API, one API call is hundreds of times cheaper and far more reliable.

</details>

---

## 20.7 On-Device AI & Quantization

> **On-device AI**: running ML models locally on phones, laptops, or edge devices instead of in the cloud — trading model size for privacy, latency, cost, and offline availability.

![Infographic of on-device AI: memory = params x bits / 8 with shrinking bars for a 7B model (FP32 28 GB, FP16 14 GB, INT8 7 GB, INT4 3.5 GB fits on a phone), a local-first cascade that escalates unsure requests to a cloud model, a Nov 2026 table of what ships (Gemini Nano via AICore, Apple AFM 3 Core with Private Cloud Compute, Phi Silica on Copilot+ PCs, Gemma 4 and Llama 3.2), and when device or cloud wins](diagrams/land20_info_on_device_ai.png)

<details>
<summary><strong>Read as text</strong> — fitting a model on a phone, and the memory formula</summary>

**Simple explanation.** A phone has a few gigabytes of memory to spare and a battery to protect, so it cannot hold a frontier model. Two moves make a useful model fit: store each weight in fewer bits (**quantization**), and start from a model that is small to begin with (**small language models**, below). The NPU — the phone's or laptop's AI accelerator — then runs it without the network.

> **Maths in one line:** `weight memory = parameters × bits per weight ÷ 8` — a 7B model needs 7 × 32 ÷ 8 = 28 GB in FP32 but 7 × 4 ÷ 8 = 3.5 GB in INT4, an 8× saving that moves it from a server to a phone.

</details>

### Snapshot — what ships on devices (verified 5 Nov 2026)

<details>
<summary><strong>Read as text</strong> — Gemini Nano, Apple AFM 3, Phi Silica and open weights</summary>

| Platform | On-device model | Notes |
|---|---|---|
| **Android** (Pixel and other flagships) | **Gemini Nano**, run by the AICore system service | Apps use it through the ML Kit GenAI APIs; **Gemini Nano 4** was in developer preview at Google I/O (May 2026), for flagship phones later in 2026 |
| **Apple** (iOS, macOS) | **Apple Foundation Models, 3rd generation** (Jun 2026): AFM 3 Core (~3B dense) and AFM 3 Core Advanced (natively multimodal) | Built in collaboration with Google; apps call it through the Foundation Models framework, and larger requests go to Apple's Private Cloud Compute |
| **Windows** (Copilot+ PCs) | **Phi Silica**, a small Phi model tuned for the NPU | Exposed to apps through Windows APIs |
| **Open weights** | Gemma 4 E2B / E4B, small Qwen 3.5 sizes, Llama 3.2 1B / 3B | Run them with llama.cpp (GGUF), MLX on Apple silicon, or LiteRT-LM on Android |

</details>

### Quantization — the enabler

<details>
<summary><strong>Read as text</strong> — bits per weight, memory for a 7B model and the 4-bit methods</summary>

> **Quantization**: reducing the numerical precision of weights (32-bit floats → 4-bit ints) to shrink memory and speed up inference, with minimal accuracy loss.

```
   Memory for a 7B-parameter model (weights only):

   FP32 (full)    32 bits/weight   ──>   28 GB
   FP16 / BF16    16 bits/weight   ──>   14 GB
   INT8            8 bits/weight   ──>    7 GB
   INT4            4 bits/weight   ──>    3.5 GB   ← fits on a phone
```

Well-calibrated 4-bit methods (**GPTQ**, **AWQ**, and the **GGUF** formats of llama.cpp) usually cost only a small accuracy drop on standard benchmarks, but the loss varies by model and task — long reasoning and maths suffer first — so measure it on your own eval. How weight-only and weight-and-activation quantization work, and which serving phase each one speeds up, is in [Ch 17c §3.1](#content/17c_llm_systems). Tools: `bitsandbytes` (load 4-bit for QLoRA fine-tuning), llama.cpp + GGUF (CPU and edge), Apple's **MLX** (Apple silicon), LiteRT-LM (Android).

</details>

### Hello world — load a 4-bit quantized model

<details>
<summary><strong>Read as text</strong> — loading a model in 4-bit with bitsandbytes</summary>

```python
# Runs locally: pip install transformers accelerate bitsandbytes; needs an NVIDIA GPU
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

MODEL_ID = "Qwen/Qwen3-8B"   # any causal LM on the Hugging Face Hub works the same way
bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_compute_dtype="bfloat16")

tok = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(MODEL_ID, quantization_config=bnb, device_map="auto")
print(f"weights in memory: {model.get_memory_footprint() / 1e9:.1f} GB")   # roughly a quarter to a third of BF16

inputs = tok("The capital of France is", return_tensors="pt").to(model.device)
print(tok.decode(model.generate(**inputs, max_new_tokens=20)[0], skip_special_tokens=True))
```

</details>

### Edge vs cloud decision

<details>
<summary><strong>Read as text</strong> — when the device wins and when the cloud does</summary>

| Pick on-device | Pick cloud |
|---|---|
| Privacy-critical (health, finance, personal context) | Need the largest model / latest frontier |
| Latency-critical (autocomplete, real-time UX) | Multi-step reasoning beyond on-device capacity |
| Billions of queries (zero marginal cost) | Live external data lookups |
| Offline / spotty connectivity | Computer-use, video gen, multimodal beyond text+image |

</details>

---

### Small language models (SLMs) — the other half of on-device ★★

<details>
<summary><strong>Read as text</strong> — start small, and the local-first cascade</summary>

Quantization shrinks a big model. The complementary move is to **start smaller**: a 1–8B model purpose-built for a narrow job.

| | Frontier model | SLM (1–8B) |
|---|---|---|
| Where it runs | Datacentre GPU | Phone, laptop, edge device, CPU |
| Cost per call | Cents | Effectively zero after deployment |
| Latency | Network round trip | Local, no network |
| Privacy | Data leaves the device | **Data never leaves** |
| Breadth | General | Narrow — and often *better* on that narrow task after fine-tuning |

**The insight interviewers want:** on a well-scoped task — classification, extraction, routing, summarising a known format — a fine-tuned 3B model frequently matches a frontier model at a fraction of the cost and latency, because you are not paying for general capability you never use. This is the same argument as distillation ([Ch 17c §3.4](#content/17c_llm_systems)), applied at model-selection time.

**The 2026 pattern is a cascade:** a small local model handles the common case and escalates only what it cannot confidently answer to a frontier model. Most traffic never leaves the device; the hard tail gets the expensive model. Apple's split between on-device models and Private Cloud Compute, and Android's "Gemini Nano first, cloud Gemini as fallback" hybrid inference, are this pattern. It is usually a bigger cost win than any single optimisation.

</details>

---

## 20.8 The Cost Trajectory

![Infographic of the AI cost trajectory: a fixed capability got 1,000x cheaper in 3 years (60 to 0.06 USD per 1M tokens, a16z) and about 12.7x cheaper per year (Epoch AI), yet one workload of 1M requests a month costs 400 USD on GPT-6 Luna versus 40,000 USD on GPT-6 Astra, and turning a Claude Sonnet 5.5 chat into a 30-call agent raises the bill from 8,000 to 1,320,000 USD a month (165x)](diagrams/land20_info_cost_trajectory_ai.png)

<details>
<summary><strong>Read as text</strong> — a fixed capability gets cheaper, the best model does not, and the decline formula</summary>

**Simple explanation.** Two prices move in opposite ways. The price of a *fixed* level of capability collapses — what needed the best model three years ago now runs on a cheap tier for a tiny fraction of the cost. The price of the *best* model stays roughly flat (the top tiers in §20.1 still list at 10 input / 50 output USD per 1M tokens), and the number of tokens each feature uses keeps growing. Good system design uses both facts.

> **Maths in one line:** `price after t years = price today × (1 − q)^(4t)` with `q ≈ 0.47` per quarter (Epoch AI, Sep 2026) — about 13× cheaper per year for the same benchmark performance.

</details>

### Snapshot — how fast a fixed capability got cheaper (verified 5 Nov 2026)

<details>
<summary><strong>Read as text</strong> — three price-decline studies, their caveats and why your bill still grew</summary>

| Study | What was held fixed | Price drop |
|---|---|---|
| a16z, "LLMflation" (Nov 2024) | GPT-3-level quality (MMLU 42): GPT-3 in Nov 2021 vs Llama 3.2 3B in Nov 2024 | 60 → 0.06 USD per 1M tokens: about 1,000× in 3 years, ≈ 10× per year |
| a16z, same post | GPT-4-level quality (MMLU 83), Mar 2023 → Nov 2024 | about 62× |
| Epoch AI, "The plunging price of thought" (Sep 2026) | Fixed scores on five maths, science and game benchmarks, 2023–2026 | about 47% per quarter ≈ 13× per year (slower on game puzzles, faster on maths) |

These measure the cheapest model that reaches a score, not what customers pay for real work — users do not always switch to the cheapest adequate model, and a benchmark score is an imperfect stand-in for useful work. Epoch itself says the numbers should not be read as exact.

**Why it matters for system design.** Architectures that were uneconomic in 2022 (agentic loops calling the LLM 30 times for one task, RAG with reranker + hybrid search, multi-agent debates) are routine in 2026. Tomorrow's affordable architecture is in the same direction.

**Why your bill still went up.** Per-token prices for a given capability fell, but tokens per task grew faster — long context, reasoning models billing thinking tokens as output (§20.2), agents making tens of calls per task. The program shows both effects: the compounding decline, then one fixed workload priced on today's tiers, then the same users served by an agent.

</details>

```python
# Price of a FIXED capability falls fast; your bill depends on how many tokens you use
quarterly_drop = 0.47                          # Epoch AI (Sep 2026): ~47% cheaper every quarter
per_year = 1 / (1 - quarterly_drop) ** 4       # four quarters compounded
print(f"47% per quarter = {per_year:.1f}x cheaper per year, {per_year ** 3:,.0f}x over 3 years")
print(f"a16z 'LLMflation' (2024): 10x per year = {10 ** 3:,}x over 3 years")
assert 12 < per_year < 14

# One workload priced on today's tiers (USD per 1M tokens, list prices checked 5 Nov 2026)
tiers = {"GPT-6 Luna": (0.10, 0.50), "Gemini 3.8 Flash": (0.75, 3.75),
         "Claude Sonnet 5.5": (2.00, 10.00), "Claude Opus 5.5": (4.00, 20.00), "GPT-6 Astra": (10.00, 50.00)}
REQUESTS, IN_TOK, OUT_TOK = 1_000_000, 2_000, 400       # per month, per request

def monthly(p_in, p_out, calls_per_request=1, in_tok=IN_TOK):
    return REQUESTS * calls_per_request * (in_tok * p_in + OUT_TOK * p_out) / 1e6

for name, (p_in, p_out) in tiers.items():
    print(f"{name:18s}: {monthly(p_in, p_out):>10,.0f} USD per month")

# Same users, but the feature becomes an agent: 30 calls per request, 20,000 input tokens each
chat = monthly(*tiers["Claude Sonnet 5.5"])
agent = monthly(*tiers["Claude Sonnet 5.5"], calls_per_request=30, in_tok=20_000)
print(f"chat -> agent on Sonnet 5.5: {chat:,.0f} -> {agent:,.0f} USD ({agent / chat:.0f}x)")
```

**Output:**

```
47% per quarter = 12.7x cheaper per year, 2,036x over 3 years
a16z 'LLMflation' (2024): 10x per year = 1,000x over 3 years
GPT-6 Luna        :        400 USD per month
Gemini 3.8 Flash  :      3,000 USD per month
Claude Sonnet 5.5 :      8,000 USD per month
Claude Opus 5.5   :     16,000 USD per month
GPT-6 Astra       :     40,000 USD per month
chat -> agent on Sonnet 5.5: 8,000 -> 1,320,000 USD (165x)
```

<details>
<summary><strong>Read as text</strong> — continued: routing, agents and the 165× bill</summary>

Reading it: the same million requests cost 100× more on the top tier than on the cheap tier, so routing easy traffic down is the first lever. And turning a chat feature into a 30-call agent multiplies the bill by 165× — more than a whole year of price decline wins back. Caching, routing and batch discounts are the counter-moves ([Ch 17b §13](#content/17b_llm_applications)).

</details>

---

## 20.9 The Long-Context Era

![Infographic of long context and context engineering: window growth from 4K tokens in 2022 to about 1M in 2024 and 10M advertised in 2025, a U-shaped lost-in-the-middle accuracy curve, a six-layer support-agent context stack that drops old summarised turns first, a Nov 2026 table of context windows (GPT-6 1.05M, Claude and Gemini 1M, Grok 4.7 500K), the cost of filling 1M tokens at 2 USD per 1M, and when long context or RAG wins](diagrams/land20_info_long_context_and_context_engineering_ai.png)

<details>
<summary><strong>Read as text</strong> — the model's desk, the token formula and how the window grew</summary>

**Simple explanation.** The context window is the model's desk: everything it can look at while answering — instructions, documents, history, tool output and the answer it is writing. Desks grew from a few pages to whole libraries, but a bigger desk does not mean the model reads every page carefully. *Why* long context is hard (attention cost, KV-cache memory, training at length, lost-in-the-middle) and how models stretch the window are taught in [Ch 17 §2.7](#content/17_llm); this section gives the current sizes and the practical choice between long context and retrieval.

> **Maths in one line:** `tokens ≈ English characters ÷ 4`, and input cost grows with every token you send — filling a 1M-token window at 2 USD per 1M input tokens costs about 2 dollars per call before caching.

How the window grew: **4K (ChatGPT, 2022) → 8K / 32K (GPT-4, 2023) → 100K–200K (Claude 2 / 2.1, 2023) → 1M (Gemini 1.5 Pro, 2024; 2M later that year) → 10M advertised (Llama 4 Scout, 2025) → about 1M standard on frontier APIs (2026)**.

</details>

### Snapshot — context windows (verified 5 Nov 2026)

<details>
<summary><strong>Read as text</strong> — context sizes by model, and lost-in-the-middle</summary>

| Model | Context window |
|---|---|
| GPT-6 Astra, 6.1 Sol, 6.1 Terra, 6 Luna | 1.05M (standard rate under 272K) |
| Claude Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5 | 1M (Haiku 5.5 charges more above 100K) |
| Gemini 4 Argon, Gemini 3.8 Flash | 1M |
| Grok 4.7 | 500K (higher rate above 200K) |
| Open: DeepSeek V4 / V4.1, Kimi K3, Mistral Large 4, Muse Spark Open | 1M |
| Llama 4 Scout | 10M advertised — effective length is much shorter |

**Lost-in-the-middle still exists.** Accuracy is best for material at the start and end of a long prompt and dips in the middle, and multi-hop tests show models degrading well before their limit. A 1M-token window is a canvas, not an invitation to paint every pixel.

</details>

### What you actually need to know

<details>
<summary><strong>Read as text</strong> — tokens, one shared budget, overflow and caching</summary>

- **Tokens ≠ words.** ~4 chars/token in English; code and non-English tokenize worse.
- **Everything counts.** System prompt + history + retrieved docs + tool outputs + the response being generated all share one budget.
- **Going over fails.** The API rejects a request that is too long; chat apps quietly drop or compact older turns.
- **Prompt caching** makes a long repeated prefix cheap on later calls (cached reads cost about 90–97.5% less at OpenAI, Anthropic and Google list prices) — the biggest cost lever after model choice ([Ch 17c](#content/17c_llm_systems)).

</details>

### When to use long context vs RAG

<details>
<summary><strong>Read as text</strong> — when long context or RAG wins, and why to use both</summary>

| Long-context wins | RAG wins |
|---|---|
| One-shot analysis of a single big document (a contract, a paper) | Querying a knowledge base of thousands of docs |
| Few-shot examples that are large | When freshness matters (docs change daily) |
| Conversation memory inside a session | Per-user data with ACLs |
| Code analysis over a whole repo | When precision retrieval beats stuffing |

The 2026 best practice is to **use both**: retrieve 20–50 chunks with hybrid search and a reranker, and let a large window hold them while the model does the final reasoning. The "throw bigger context at it" reflex still loses to selective retrieval on most production workloads — on cost, freshness and citations.

</details>

---

## 20.10 Context Engineering — The 2026 Skill

<details>
<summary><strong>Read as text</strong> — from prompt to context engineering, and a support-agent context stack</summary>

> **Context engineering**: the systematic design of everything a model sees at inference — system prompt, retrieved docs (RAG), tool outputs, conversation history, structured memory, layout — to maximise task quality.

If 2024 was about prompt engineering, 2026 is about context engineering. The wording of the user's prompt is one slice of the window; the system prompt, retrieved documents, tool results, history and memory decide most of an application's quality. The home section — the context stack, the techniques (retrieval, summarisation, tool-result truncation, memory, caching, structured tags, deferred tool loading) and token budgets — is [Ch 18 §18.9](#content/18_ai_agents).

**Interview angle** — *"Design the context for a customer support agent."* Walk the stack from top to bottom:

1. **System prompt**: persona, escalation policy, tone rules, tool specs.
2. **Retrieved articles**: hybrid search over the knowledge base for the user's question.
3. **Tools**: order lookup, refund processor, account status.
4. **History**: the full current conversation; earlier conversations summarised.
5. **Memory**: customer preferences, past issues.
6. **User message**: the current turn.
7. **Budget rule**: when the window fills, drop summarised old turns first; never drop the policies or the current conversation; wrap each source in its own tags.

</details>

---

## 20.11 Responsible AI & Regulation

![Infographic of the EU AI Act timeline as amended by the 2026 AI Omnibus: bans from 2 Feb 2025, GPAI duties from 2 Aug 2025, general application and GPAI fines from 2 Aug 2026, content marking for older systems 2 Dec 2026, legacy GPAI models 2 Aug 2027, and high-risk rules moved to 2 Dec 2027 (Annex III) and 2 Aug 2028 (products); the top fine max of EUR 35M or 7 percent of turnover; GPAI duties; and the status in the US, California, UK and China](diagrams/land20_info_eu_ai_act_regulation_ai.png)

<details>
<summary><strong>Read as text</strong> — safety becomes law</summary>

Safety stopped being optional in 2024; in 2026 parts of it are law.

</details>

### Alignment techniques (interview must-knows)

<details>
<summary><strong>Read as text</strong> — RLHF, Constitutional AI, DPO, RLAIF, RLVR and red-teaming in one line each</summary>

These are taught step by step in [Ch 17 §3.4–3.5c](#content/17_llm); here is the one-line version of each.

| Technique | How it works |
|---|---|
| **RLHF** | Humans rank outputs → train a reward model → fine-tune the LLM with PPO to maximise reward |
| **Constitutional AI** | Model self-critiques against written principles, no per-example human labelling |
| **DPO** (Direct Preference Optimization) | Skip the reward model — directly optimise on (chosen, rejected) preference pairs |
| **RLAIF** | AI-generated feedback replaces human feedback for scale |
| **RLVR / GRPO** | Reward from a program that checks the answer (unit tests, a maths checker) — how reasoning models are trained |
| **Red-teaming** | Adversarial testing (manual + automated) before any major release |

</details>

### The EU AI Act — the dates interviewers test you on

<details>
<summary><strong>Read as text</strong> — risk tiers, staged dates and the fine formula</summary>

**Simple explanation.** The EU AI Act sorts AI by risk. A few uses are banned outright; "high-risk" uses (hiring, credit, education, medical devices…) need risk management, documentation and human oversight; chatbots and deepfakes must say what they are; and the makers of general-purpose models (GPAI — the foundation models in §20.1) must document them. The rules switch on in stages, and in 2026 the **AI Omnibus** amended the Act and pushed the high-risk dates back.

> **Maths in one line:** `top fine = max(€35M, 7% × worldwide annual turnover)` for a banned practice — for a company with €100B turnover that is €7B, so the percentage, not the fixed amount, is what bites for big tech (GPAI breaches: up to €15M or 3%).

</details>

### Snapshot — EU AI Act timeline (verified 5 Nov 2026)

<details>
<summary><strong>Read as text</strong> — the dates as amended by the AI Omnibus, and what else it changed</summary>

Source: the AI Act (Regulation (EU) 2024/1689) as amended by the AI Omnibus, which entered into force on 27 July 2026.

| Date | What applies |
|---|---|
| 1 Aug 2024 | The Act enters into force |
| 2 Feb 2025 | **Banned practices** — e.g. social scoring, untargeted scraping of face images, emotion recognition at work or school, most real-time remote biometric identification in public by police |
| 2 Aug 2025 | **GPAI model providers**: technical documentation, a public summary of training content, a copyright policy; models with systemic risk (presumed above 10²⁵ training FLOPs) also need evaluations, incident reporting and cybersecurity. A voluntary GPAI Code of Practice (Jul 2025) shows one way to comply |
| 2 Aug 2026 | **General application**: transparency duties (tell people they are talking to an AI, label deepfakes), and the Commission's power to fine GPAI providers |
| 2 Dec 2026 | Marking AI-generated content becomes mandatory for systems already on the market before 2 Aug 2026 (postponed by the Omnibus) |
| 2 Aug 2027 | GPAI models placed on the market before 2 Aug 2025 must comply |
| 2 Dec 2027 | **High-risk systems in Annex III** (hiring, credit scoring, education, law enforcement…) — delayed by the Omnibus |
| 2 Aug 2028 | **High-risk AI inside regulated products** (Annex I: machinery, toys, lifts, medical devices…) — delayed by the Omnibus |

The Omnibus (Regulation (EU) 2026/1744, in force 27 Jul 2026) also added two bans — AI systems that generate non-consensual intimate images or child sexual abuse material — which apply from 2 Dec 2026, extended some small-company relief to small mid-caps, and gave the EU AI Office more oversight of systems built on general-purpose models. If you build foundation models, deploy them in the EU, or sell to EU customers, these dates apply to you — check the current text before quoting them.

</details>

### Snapshot — other rules to know (verified 5 Nov 2026)

<details>
<summary><strong>Read as text</strong> — the US, California, UK, China and industry</summary>

| Where | Status, Nov 2026 |
|---|---|
| **US — federal** | No general federal AI statute. Policy runs through executive action: the July 2025 AI Action Plan and Executive Order 14365 (Dec 2025), which seeks a national framework that pre-empts state AI laws — as of late October 2026 it had not displaced any state law |
| **US — states** | California's SB 53 (Transparency in Frontier AI Act) has applied since 1 Jan 2026: large frontier developers publish a safety framework and transparency reports, report critical safety incidents, and protect whistle-blowers. Colorado repealed its AI Act before it took effect (14 May 2026) and replaced it with a narrower automated-decision transparency law (SB 26-189) due on 1 Jan 2027 |
| **UK** | The AI Security Institute (renamed from AI Safety Institute in Feb 2025) runs pre-deployment tests of frontier models with the labs' cooperation |
| **China** | Generative AI services must file with the Cyberspace Administration of China (CAC); labels on AI-generated content have been required since 1 Sep 2025 |
| **Industry** | Frontier Model Forum — founded in 2023 by Anthropic, Google, Microsoft and OpenAI (Amazon and Meta joined in 2024) — shares safety practices; most labs also publish their own frontier-safety frameworks |

</details>

### Google's AI Principles — 2018 (historical) and the 2025 revision

<details>
<summary><strong>Read as text</strong> — the 2018 list and the 2025 revision</summary>

The original **2018** principles (widely cited for years):

1. Be socially beneficial.
2. Avoid creating or reinforcing unfair bias.
3. Be built and tested for safety.
4. Be accountable to people.
5. Incorporate privacy by design.
6. Uphold high standards of scientific excellence.
7. Be available for uses that align with these principles.

The 2018 list also included explicit **"AI we will not pursue"** pledges — notably not building AI for weapons or for surveillance violating internationally accepted norms.

> **Feb 2025 revision.** Google rewrote its AI Principles, **removing** those explicit pledges against weapons and surveillance. The framing shifted toward pursuing AI "where the overall likely benefits substantially exceed the foreseeable risks," consistent with international law and human rights. In interviews, treat the 7-point list above as historical and cite the 2025 benefit-vs-risk framing as current.

</details>

---

## 20.12 Google's 2026 AI Stack

![Infographic of Google's 2026 AI stack in three layers: models (Gemini 4 Argon, 3.8 Flash, Nano, 3.8 Live, Omni Flash and Veo 3.1, Gemma 4), the Gemini Enterprise Agent Platform that replaced Vertex AI in Apr 2026 (ADK, Agent Studio, Agent Runtime with Memory Bank, Model Garden with 200+ models), and TPU7x Ironwood chips (4,614 FP8 TFLOPS, 192 GiB HBM, 7.38 TB/s, 9,216-chip pods = 42.5 exaFLOPS), with FP8 bars for v5p 459, Trillium 918 and Ironwood 4,614 TFLOPS](diagrams/land20_info_google_stack_ai.png)

<details>
<summary><strong>Read as text</strong> — three layers that only Google owns end to end</summary>

If you're interviewing for an AI Engineer role at Google, you must know this stack — they invented half of it. The same stack, from a builder's angle, is in [Ch 19 §19.12](#content/19_ai_frameworks); TPUs and JAX in depth are in [Ch 29](#content/29_gpus_tpus_infrastructure) and [Ch 30](#content/30_google_ml_ecosystem).

**Simple explanation.** Google is the only lab that owns all three layers: the **models** (Gemini, Gemma), the **platform** you build and run agents on (Gemini Enterprise Agent Platform, the successor to Vertex AI), and the **chips** underneath (TPUs). Interviewers like candidates who can say which layer a question is about.

</details>

### Snapshot — models (verified 5 Nov 2026)

| Tier | Model | Use case |
|---|---|---|
| Top | **Gemini 4 Argon** (`gemini-4-argon`) — sparse MoE; text, image, audio and video in; up to 1M tokens | Hardest reasoning, coding and agent work |
| Top, limited | **Gemini 4 Carbon** | Strongest model; staged rollout, starting with vetted cyber defenders |
| Workhorse | **Gemini 3.8 Flash** | High-throughput production default |
| Cheapest | **Gemini 3.5 Flash-Lite** | Bulk classification and extraction |
| On-device | **Gemini Nano** (Nano 4 in preview) | Android, through AICore (§20.7) |
| Real-time | **Gemini 3.8 Live** | Low-latency voice and video agents |
| Generation | **Gemini Omni Flash** and **Veo 3.1** (video), **Nano Banana** models (images), **Lyria** (music) | Media generation (§20.5) |
| Open weights | **Gemma 4** | Self-hosting, on-device, fine-tuning |

### Platform — Gemini Enterprise Agent Platform

At **Google Cloud Next (22 April 2026)** Google launched the **Gemini Enterprise Agent Platform** as "the evolution of Vertex AI": all Vertex AI services and new features now ship through it. Employees reach the agents through the separate **Gemini Enterprise app**. The parts an interviewer expects you to name:

| Component | Role |
|---|---|
| **Agent Development Kit (ADK)** | Open-source, code-first agent framework (Python, Go, Java, TypeScript); hello world in [Ch 19 §19.12](#content/19_ai_frameworks) |
| **Agent Studio** | Low-code, visual agent builder |
| **Agent Runtime** + **Memory Bank** | Managed runtime for long-running agents that keep state for days (the re-engineered successor to Agent Engine), with persistent long-term memory |
| **Agent Identity, Registry, Gateway** | Governance: every agent gets an identity, is registered, and goes through a policy gateway |
| **Agent Simulation, Evaluation, Observability** | Test agents before release and trace them in production |
| **Model Garden** | 200+ models — Gemini, Gemma, and third-party models such as Claude |
| **Pipelines, Feature Store** | The classic Vertex MLOps services, now delivered inside Agent Platform |
| **A2A and MCP** | Supported protocols for agent-to-agent and agent-to-tool connections ([Ch 18 §18.3](#content/18_ai_agents)) |

### Infrastructure — TPU7x "Ironwood"

Ironwood is Google's seventh-generation TPU (Cloud name **TPU7x**), designed for both training and the inference-heavy reasoning era, and generally available on Google Cloud.

> **Maths in one line:** `pod compute = chips × compute per chip` — 9,216 × 4,614 TFLOPS ≈ 42.5 exaFLOPS (FP8), the headline Ironwood number.

| Spec (per chip unless noted) | TPU v5p | TPU v6e (Trillium) | **TPU7x (Ironwood)** |
|---|---|---|---|
| Peak compute, FP8 (TFLOPS) | 459 | 918 | **4,614** |
| Peak compute, BF16 (TFLOPS) | 459 | 918 | **2,307** |
| HBM capacity (GiB) | 95 | 32 | **192** |
| HBM bandwidth (TB/s) | 2.77 | 1.64 | **7.38** |
| Chips per pod | 8,960 | 256 | **9,216** |

Source: Google Cloud's TPU7x documentation (Nov 2026). Ironwood has about 10× the peak FP8 compute of v5p per chip and 6× Trillium's memory. The next generation, **TPU 8t** (training) and **TPU 8i** (serving), was announced in April 2026 and listed as "coming soon" in October 2026. Demand is a public signal of the inference build-out: in October 2025 Anthropic announced it would use up to **one million TPUs**, bringing well over a gigawatt of capacity online in 2026.

### Key papers from Google (interview-relevant)

- *Attention Is All You Need* (2017) — the Transformer.
- *BERT* (2018) — bidirectional pretraining.
- *T5* (2019) — every task as text-to-text.
- *Switch Transformer* (2021) — sparse mixture-of-experts at trillion-parameter scale.
- *Chain-of-Thought Prompting* (2022) — step-by-step reasoning from prompting alone.
- *Chinchilla* (DeepMind, 2022) — compute-optimal ratio of data to parameters.
- *PaLM / PaLM 2* (2022–23) — scale, multilinguality, reasoning.
- *Gemini technical reports and model cards* (2023–) — native multimodality, long context, sparse MoE.

---

## 20.13 Benchmarks 2026 — What Saturated, What's New

![Infographic of AI benchmarks as of Nov 2026: a map of saturated (MMLU, HumanEval, GSM8K, GPQA Diamond 96.4 percent), nearly saturated, retired or contested (SWE-bench Verified, SWE-bench Pro) and current benchmarks (Terminal-Bench 4.0, OSWorld 2.0, HLE, ARC-AGI-3, Arena, AA Index); the 95 percent interval formula with overlapping Terminal-Bench 4.0 error bars (64.8 plus or minus 11.5 vs 58.2 plus or minus 11.9, a tie); the SWE-bench Verified honest ceiling of 83.6 percent; and five questions to ask of any score](diagrams/land20_info_benchmarks_ai.png)

<details>
<summary><strong>Read as text</strong> — exams that saturate, leak or break, and the error-bar formula</summary>

**Simple explanation.** A benchmark is an exam. When every top student scores 95%, the exam stops telling them apart — it is **saturated**. When the answers leak into the textbooks, scores stop meaning skill — it is **contaminated**. And when some questions are simply wrong, even a perfect student cannot pass them — the test is **broken**. In 2026 all three happened to famous benchmarks, so the skill interviewers look for is reading a score critically, not quoting it.

> **Maths in one line:** `95% interval ≈ ± 1.96 × √(p(1 − p) / n)` — on a 66-task benchmark a 65% score is uncertain by about ± 11 points, so most leaderboard gaps at the top are ties.

</details>

### Snapshot — the benchmark map (verified 5 Nov 2026)

| Benchmark | Tests | Status | Top published score (source, date) |
|---|---|---|---|
| **MMLU, HumanEval, GSM8K** | School-level knowledge, short Python functions, grade-school maths | **Saturated** | Above 90% for years |
| **GPQA Diamond** | 198 PhD-level science questions (experts score about 65%) | **Saturated** | 96.4% Gemini 4 Argon (Epoch AI hub, Sep 2026) |
| **FrontierMath, Tiers 1–3** | Unpublished research-level maths | Nearly saturated | 93.7% GPT-6 Astra and GPT-6.1 Sol (Epoch AI hub) |
| **ARC-AGI-2** | Abstract visual puzzles | Nearly saturated | 95.0% GPT-6 Astra at max effort (ARC Prize, Sep 2026) |
| **Terminal-Bench 2.x** | Command-line agent tasks | Saturated — vendors moved to 3.0 and 4.0 | about 90% on 2.1 in 2026 model cards |
| **SWE-bench Verified** | 500 real GitHub fixes | **Retired** — flawed tests and contamination (OpenAI, Feb 2026) | High 80s, no longer meaningful |
| **SWE-bench Pro** | Harder GitHub tasks (731 public) | **Contested** — ~30% of tasks broken; OpenAI retracted its recommendation (Jul 2026) | about 80% |
| **OSWorld-Verified** | 369 desktop tasks | Nearly saturated — above the ~72% human baseline; mostly self-reported | 86.1% (Qwen3.8 Max) |
| **Terminal-Bench 4.0** | 66 hard CLI tasks, model + harness | **Current** | 64.8% Claude Opus 5.5 + Claude Code (tbench.ai, 28 Oct 2026) |
| **OSWorld 2.0** | 108 long-horizon desktop workflows | **Current** | 20.6% completed, Claude Opus 4.8 (paper); vendors quote partial scores (§20.6) |
| **Humanity's Last Exam** | About 2,500 expert questions, 100+ subjects | **Current** | 54.8% GPT-6 Astra (Scale AI / CAIS leaderboard, Sep 2026); higher self-reported runs use tools |
| **ARC-AGI-3** | Interactive game worlds the agent must explore | **Current** — score depends on the harness | GPT-6 Astra best: 62.7% Standard harness (max effort), 99.9% Provider Adapter harness (high effort); at high effort Standard gives 54.8% (ARC Prize, Sep 2026) |
| **Arena (text)** | Crowd votes between two anonymous answers (Elo-style) | **Current** — measures preference, not correctness | 1528 Gemini 4 Carbon (28 Oct 2026) |
| **Artificial Analysis Intelligence Index v5.0** | Nine evaluations run independently (launched 27 Oct 2026) | **Current** | 59.4 Gemini 4 Carbon |

Benchmark mechanics — contamination, LLM-as-judge, perplexity, BLEU/ROUGE and Chatbot Arena's rating — are taught in [Ch 17c §4](#content/17c_llm_systems); agent evaluation is in [Ch 18b §18.12](#content/18b_agents_in_production).

### How to read any score

<details>
<summary><strong>Read as text</strong> — six questions to ask of any score</summary>

1. **Which version and split?** Terminal-Bench 2.1 vs 4.0, OSWorld-Verified vs 2.0, HLE with or without tools — different exams.
2. **Which harness and effort?** Agent scores are model + harness (§20.4); ARC-AGI-3 moved from 54.8% to 99.9% on harness alone.
3. **Who ran it?** A vendor's launch table, or the benchmark owner / an independent evaluator?
4. **How many tasks?** Small task sets give wide error bars — see the program below.
5. **Is it still clean?** Public tasks leak into training data; old tests can be wrong.
6. **When?** Say "as of <month, year>" every time.

The program puts numbers on points 4 and 5: the error bar on Terminal-Bench 4.0, and the score ceiling that broken tests impose on SWE-bench Verified.

</details>

```python
# How much of a benchmark score is signal? (1) task-sampling noise, (2) broken tests cap the score
import math

N_TASKS = 66                                   # Terminal-Bench 4.0 has 66 tasks
print(f"one task = {100 / N_TASKS:.1f} points")
for p in (0.648, 0.582):                       # Opus 5.5 and GPT-6 Astra on the 4.0 leaderboard
    half = 1.96 * math.sqrt(p * (1 - p) / N_TASKS)
    print(f"score {p:.1%}: 95% interval from task sampling = +/- {100 * half:.1f} points")
gap = 0.582 - 0.579                            # GPT-6 Astra vs Claude Fable 5.1
print(f"Astra vs Fable 5.1 gap = {100 * gap:.1f} points = {gap * N_TASKS:.1f} of a task -> a tie")
assert gap * N_TASKS < 1

# SWE-bench Verified (OpenAI, Feb 2026): >= 59.4% of an audited 27.6% slice have tests that reject correct fixes
flawed = 0.594 * 0.276
ceiling = 1 - flawed                           # best score from correct-but-different code
print(f"flawed tasks >= {flawed:.1%} of Verified -> honest ceiling <= {ceiling:.1%}")
for score in (0.809, 0.876):                   # Feb 2026 state of the art; a high-80s score of the kind reported later
    verdict = "above the ceiling -> needs passes on flawed tasks" if score > ceiling else "below the ceiling"
    print(f"score {score:.1%}: {verdict}")
assert 0.83 < ceiling < 0.84
```

**Output:**

```
one task = 1.5 points
score 64.8%: 95% interval from task sampling = +/- 11.5 points
score 58.2%: 95% interval from task sampling = +/- 11.9 points
Astra vs Fable 5.1 gap = 0.3 points = 0.2 of a task -> a tie
flawed tasks >= 16.4% of Verified -> honest ceiling <= 83.6%
score 80.9%: below the ceiling
score 87.6%: above the ceiling -> needs passes on flawed tasks
```

<details>
<summary><strong>Read as text</strong> — continued: ties, ceilings and the yellow flag</summary>

Reading it: the whole top five of Terminal-Bench 4.0 sits inside one error bar, so "who is first" is mostly noise. And once at least 16% of SWE-bench Verified's tasks have tests that reject correct fixes, a score in the high 80s needs passes on exactly those flawed tasks — one way is to reproduce a memorised gold patch, which is the contamination OpenAI reported.

If a candidate cites *MMLU* or *HumanEval* as a quality signal in 2026, it is a yellow flag. Cite a current benchmark with its version, harness, source and date — and add your own eval on your own task.

</details>

---

## 20.14 What's NOT New — and Still Wins

A useful counterweight to the hype cycle. Many production systems in 2026 still run **classical ML** because it's faster, cheaper, more debuggable, and good enough.
![What's not new: classical ML still wins these production jobs](diagrams/land20x_classicalml_ai.png)

| Use case | Classical winner |
|---|---|
| Click-through-rate prediction at web scale | Gradient-boosted trees (XGBoost / LightGBM) |
| Tabular fraud detection | XGBoost + feature engineering |
| Recommender candidate generation | Two-tower retrieval + ANN |
| Time-series forecasting | Prophet, classical statsmodels, lightweight transformers |
| Search ranking | LambdaMART + neural rerankers, not LLMs |

**Interview answer template**: "I'd start with the simplest classical approach that solves the problem, measure baseline quality, and only add an LLM where the marginal quality justifies the latency and cost." Jumping straight to "use a Transformer" is a red flag in interviews.

---

## 20.15 Decision Tree — Which Model for Which Job

![Infographic decision tree for which model to use for which job as of Nov 2026: ten task cards from mobile autocomplete (on-device Gemini Nano or Gemma 4) and high-QPS classification (Flash-Lite, GPT-6 Luna, Haiku 5.5) to multi-file code, PhD-level science, long documents, desktop automation, voice, images, video and self-hosted bulk inference, a default of a Flash, Sonnet or Luna tier at low effort, and six pitfalls such as high effort everywhere and no fallback vendor](diagrams/land20_info_model_choice_and_pitfalls_ai.png)

Model names below are a November 2026 snapshot; the branches are what you should remember. The same tree, kept in step with this one, is in the playbook ([P3](#content/00p_dl_llm_playbook)).

```
   What's the task?
        │
        ├── Real-time mobile autocomplete          → On-device: Gemini Nano / Apple Foundation
        │                                            Models / Gemma 4 E2B-E4B
        │
        ├── High-QPS classification at scale       → Cheap tier: Gemini 3.5 Flash-Lite / GPT-6 Luna /
        │                                            Claude Haiku 5.5, or self-hosted open weights
        │
        ├── Complex code, multi-file changes       → Claude Opus 5.5 or GPT-6.1 Sol inside an agent
        │                                            harness (Claude Code / Codex / Cursor)
        │
        ├── PhD-level science reasoning            → Top tier (GPT-6 Astra / Claude Fable 5.1 /
        │                                            Gemini 4 Argon) with the effort dial turned up
        │
        ├── Long documents (≥1M tokens)            → Retrieve + chunk, or a ~1M-window model;
        │                                            Scout's 10M is advertised, so test it
        │
        ├── Browser / desktop automation           → A computer-use tool in a sandboxed VM —
        │                                            but call a real API if one exists
        │
        ├── Voice agent (real-time)                → OpenAI Realtime API / Gemini 3.8 Live /
        │                                            ElevenLabs
        │
        ├── Image generation (production)          → gpt-image-2 / Nano Banana / FLUX.2 (self-host)
        │
        ├── Video with audio                       → Veo 3.1 or Gemini Omni Flash, behind your
        │                                            own interface (§20.5)
        │
        ├── Privacy / sovereignty / bulk inference → Self-host DeepSeek V4.1 Flash / Qwen 3.5 /
        │                                            gpt-oss
        │
        └── Sensitive health / finance on device   → On-device model with INT4 quantization
```

**Default for prototyping**: a Flash / Sonnet / Luna-tier model (Gemini 3.x Flash, Claude Sonnet 5.5, GPT-6 Luna) — cheap, fast and good enough for almost everything. Start the effort dial low and raise it only on the cases your eval shows are hard.

---

## 20.16 What Goes Wrong (Pitfalls)

<details>
<summary><strong>Read as text</strong> — ten mistakes and what to do instead</summary>

1. **Defaulting to high reasoning effort for everything.** Thinking tokens are billed as output; on simple tasks a high-effort call costs 10–50× more and adds latency without a quality gain (§20.2).
2. **Citing saturated or retired benchmarks** (MMLU, HumanEval, GPQA Diamond, SWE-bench Verified) as if they still separate models. Cite a current one with its version, harness, source and date (§20.13).
3. **Memorising leaderboard numbers.** They drift monthly. Memorise the *shape* of the field, not the digits.
4. **Treating long context as a substitute for retrieval.** Lost-in-the-middle is real; selective retrieval + rerank usually wins.
5. **Quoting the old EU AI Act dates.** GPAI duties have applied since 2 Aug 2025 and general application since 2 Aug 2026, but the 2026 AI Omnibus moved the high-risk rules to 2 Dec 2027 and 2 Aug 2028 — "high-risk from August 2026" is now wrong.
6. **Picking computer-use for high-QPS production.** It's slow and fragile; APIs always win where they exist.
7. **Skipping classical ML.** Gradient-boosted trees on tabular data still beat fine-tuned LLMs at a tiny fraction of the cost.
8. **Ignoring the open-weight option.** For many workloads at scale, self-hosted DeepSeek, Qwen, gpt-oss or Mistral is cheaper and only months behind the frontier APIs.
9. **Confusing video generation with video understanding.** A generator (Veo, Gemini Omni Flash) makes clips; a multimodal model (Gemini 4 Argon) *reads* video. Different products, different system designs.
10. **Building on one product with no fallback.** Sora was shut down about a year after Sora 2 launched, Google closed Project Mariner, and Veo 3.1's Gemini API preview ended in October 2026. Put generation and agent vendors behind your own interface, and keep an eval set to re-qualify a replacement.

</details>

---

## 20.17 Interview Questions

**Q1. Walk me through the frontier model lineup as of November 2026.**
Three closed labs, each with three tiers: OpenAI's GPT-6 Astra, GPT-6.1 Sol / Terra and GPT-6 Luna; Anthropic's Claude Fable 5.1, Opus 5.5 (its recommended default), Sonnet 5.5 and Haiku 5.5; Google's Gemini 4 Argon (with Gemini 4 Carbon for vetted defenders), Gemini 3.8 Flash and Flash-Lite — plus SpaceXSI's Grok 4.7. Nearly all have ~1M-token context and a reasoning-effort dial. The leader depends on the test: Claude Opus 5.5 tops Terminal-Bench 4.0, GPT-6 Astra tops Humanity's Last Exam and ARC-AGI-3, Gemini 4 Carbon tops Arena and the Artificial Analysis index. Open weights (Kimi K3, DeepSeek V4.x, Mistral Large 4, Qwen 3.5) trail by a few months. So model choice is mostly price, latency, ecosystem and your own eval.

**Q2. When does test-time compute scaling beat parameter scaling?**
On hard, checkable, multi-step work — maths, code, planning — spending more inference tokens on thinking can beat a much bigger model, with diminishing returns as the budget grows. Every 2026 flagship exposes this as an effort dial, and thinking tokens are billed as output. Keep it low for simple Q&A, creative writing, real-time voice and high-throughput classification, where the extra cost and latency don't buy quality.

**Q3. Why did coding-agent scores rise so fast — and why did OpenAI stop reporting SWE-bench Verified?**
Scores rose from four compounding factors: stronger base models, test-time reasoning, better harnesses (file tools, test runners, diff review, memory) and RL on agentic traces. But in February 2026 OpenAI found that at least 59.4% of the hard Verified tasks it audited had tests that reject correct fixes, and that every frontier model it tested could reproduce some gold patches — so gains reflected exposure, not skill. It recommended SWE-bench Pro, then in July 2026 estimated ~30% of Pro's tasks were broken and retracted that advice. Harness matters as much as the model: on ARC-AGI-3, GPT-6 Astra scored 54.8% in one harness and 99.9% in another at the same effort.

**Q4. How does INT4 quantization let a 7B model run on a phone?**
Each weight goes from 32 bits (FP32, 28 GB total) to 4 bits (INT4, 3.5 GB) — an 8× reduction. Methods like GPTQ and AWQ calibrate the rounding on sample data so the accuracy loss is usually small (measure it on your task — long reasoning suffers first). An NPU (Qualcomm, MediaTek, Apple Neural Engine, Google Tensor) runs it. In practice phones ship even smaller models: Apple's on-device AFM 3 Core is about 3B, and Gemini Nano runs through Android's AICore.

**Q5. EU AI Act — what dates and obligations matter for a foundation-model provider?**
Obligations for general-purpose AI providers have applied since 2 Aug 2025: technical documentation, a public summary of training content and a copyright policy, plus evaluations, incident reporting and cybersecurity for systemic-risk models (presumed above 10²⁵ training FLOPs). From 2 Aug 2026 the Act applies generally and the Commission can fine GPAI providers (up to €15M or 3% of turnover); models already on the market before Aug 2025 must comply by 2 Aug 2027. The 2026 AI Omnibus moved high-risk rules to 2 Dec 2027 (Annex III) and 2 Aug 2028 (products). Banned practices can cost up to €35M or 7% of worldwide turnover.

**Q6. Design a Google Photos feature where users ask natural-language questions about their library.**
(1) Embed photos with a SigLIP-style vision-language encoder into a vector index. (2) Embed the query into the same space and retrieve the top-k photos, filtered by the user's ACLs. (3) Send retrieved photos + query to a multimodal Gemini (3.8 Flash by default, Gemini 4 Argon for hard questions) — it reads images natively. (4) Answer simple searches with Gemini Nano on the device for privacy and latency; escalate complex reasoning to the cloud. (5) Respect hidden photos and filter sensitive content. (6) Measure retrieval recall, answer accuracy, p95 latency and user satisfaction.

**Q7. How would you choose between a closed-weight API and a self-hosted open-weight model?**
Pick closed-weight (GPT-6.x, Claude 5.5 / Fable 5.1, Gemini 4) when you want zero ops, the newest reasoning frontier, polished computer use or quick model swaps. Pick open-weight (DeepSeek V4.x, Qwen 3.5, Kimi K3, Mistral Large 4, gpt-oss, Gemma 4) for privacy and sovereignty, very high volume where token cost dominates, deep fine-tuning or distillation, or reproducible research — and check the licence first. Many stacks blend: open weights for routine traffic, a closed API for the hard tail.

**Q8. What's wrong with citing MMLU or HumanEval in 2026?**
They are saturated — frontier models have scored 90%+ for years, so they no longer separate models; GPQA Diamond (~96%) and SWE-bench Verified (retired for contamination) have joined them. Cite a current benchmark with its version, harness, source and date — Terminal-Bench 4.0, OSWorld 2.0, Humanity's Last Exam, ARC-AGI-3, or the Arena and Artificial Analysis indexes — and then say what your own task-specific eval would measure.

**Q9. The price of a fixed level of capability falls roughly 10–13× a year. What does that change architecturally?**
Patterns that were uneconomic become routine: agent loops with dozens of LLM calls per task, hybrid retrieval with a cross-encoder reranker, multi-agent review, reasoning with thousands of thinking tokens. Design for tomorrow's prices — more calls per task, more context per call, more compute at inference — but route easy traffic to cheap tiers, because the *best* model's price has not fallen the same way and agents multiply token use (a chat feature turned into a 30-call agent can cost over 100× more).

**Q10. Computer-use agents — when should you use them, and when not?**
Use them for legacy software with no API, one-off cross-app automation, QA of flaky internal tools and back-office data entry. Avoid them for high-QPS traffic, latency-sensitive UX, anything with a real API, or actions with a large blast radius. Per-step errors compound (99% per step gives about 74% over 30 steps), a 30-step task costs tens of cents and a minute or more, and on long professional workflows (OSWorld 2.0) the best agent completed only about 21% of tasks.

---

## 20.18 Key Takeaways

- **The frontier is plural and tiered** — GPT-6, Claude 5.5 / Fable 5.1 and Gemini 4 each sell a top, a workhorse and a cheap tier; the leader changes with the benchmark, so pick by task fit, price and your own eval.
- **Open weights are a few months behind**, mostly huge sparse MoE models (Kimi K3, DeepSeek V4.x, Mistral Large 4, Muse Spark Open, Qwen 3.5): memory follows total parameters, compute follows active ones, and licences differ.
- **Reasoning is a dial, not a product.** Every flagship has an effort setting; thinking tokens are billed as output, so turn it up only where a wrong answer is expensive.
- **Coding agents = model × harness × effort.** SWE-bench Verified was retired for contamination, SWE-bench Pro is contested; read Terminal-Bench-style scores as noisy, harness-specific signals.
- **Generation products are short-lived** — Sora was shut down within about a year of Sora 2; put Gemini Omni Flash, Veo, gpt-image-2 or FLUX.2 behind your own interface.
- **Computer use is real but human-paced**: near the human baseline on short tasks (OSWorld-Verified), about 21% on long workflows (OSWorld 2.0), and expensive per step.
- **On-device AI** runs ~3B-class models (Gemini Nano, Apple AFM 3 Core, Phi Silica) thanks to INT4 quantization and NPUs; the winning pattern is a local-first cascade.
- **A fixed capability gets ~10–13× cheaper per year** (a16z, Epoch AI), but top-tier prices stay high and agents multiply token use — bills still rise.
- **Long context (~1M tokens) is standard** but doesn't replace retrieval; lost-in-the-middle still bites.
- **Context engineering** decides most of an application's quality — the user's prompt is the smallest slice ([Ch 18 §18.9](#content/18_ai_agents)).
- **EU AI Act**: GPAI duties since Aug 2025, general application Aug 2026, high-risk rules moved to Dec 2027 / Aug 2028 by the 2026 AI Omnibus.
- **Google's stack**: Gemini 4 + Gemini Enterprise Agent Platform (the evolution of Vertex AI: ADK, Agent Studio, Agent Runtime) + TPU7x Ironwood.
- **Benchmarks saturate, leak and break** — always give version, harness, source and date; MMLU, HumanEval and now GPQA Diamond no longer separate models.
- **Classical ML still wins** many production cases. Start simple; add an LLM only where it earns the latency and cost.

---

## 20.19 Review Questions

1. List three places where high reasoning effort is the *wrong* choice and explain why.
2. Llama 4 Scout advertises a 10M-token context. What does that unlock that 1M doesn't, and what *doesn't* it solve?
3. On ARC-AGI-3, GPT-6 Astra scored 54.8% in one harness and 99.9% in another at the same effort. What does the gap tell you about agent system design and about reading leaderboards?
4. A teammate proposes computer-use to handle customer login. Critique.
5. Walk through the alignment techniques from RLHF → Constitutional AI → DPO → RLAIF → RLVR, and explain what each one fixed about the previous.
6. The price of a fixed capability falls about 13× a year, but your AI bill went up. Resolve the paradox.
7. Design the context stack for a medical Q&A agent answering doctor-side queries against a hospital's records.
8. EU AI Act — name three obligations a foundation-model provider has, the dates they apply, and what the 2026 AI Omnibus changed.
9. Why is "use Gemini 3.8 Flash" usually a better production answer than "use Gemini 4 Argon"?
10. Your interviewer asks which model is best at coding. You don't remember the latest scores. What do you say?
11. A 397B-total / 17B-active MoE model and a 31B dense model: which needs more GPU memory, which does more compute per token, and why?
12. Why did OpenAI stop reporting SWE-bench Verified, and why did it later retract its recommendation of SWE-bench Pro?

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
        label: '2024 emphasis (author estimate)',
        data: [20, 40, 25, 50, 10, 30, 5],
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255,99,132,0.15)'
      }, {
        label: '2026 emphasis (author estimate)',
        data: [80, 80, 60, 85, 95, 90, 60],
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54,162,235,0.15)'
      }]
    },
    options: {
      responsive: true,
      scales: { r: { beginAtZero: true, max: 100, ticks: { display: false } } },
      plugins: { title: { display: true, text: 'Interview emphasis by topic, 2024 vs 2026 — author estimate, not survey data (0–100)' } }
    }
  });
})();
</script>
</div>

---

**Previous:** [Chapter 19 — AI Frameworks & Engineering](#content/19_ai_frameworks) | **Next:** [Chapter 21 — Design Fundamentals](#content/21_design_fundamentals)
