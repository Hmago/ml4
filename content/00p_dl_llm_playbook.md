# Deep Learning & LLMs — The Playbook

> A decision-oriented quick reference for Ch 14–20. Skim during interview prep; grep during a real on-call. Recipes, defaults, decision trees, diagnostic flowcharts, and the numbers worth memorising.

This is **not** a textbook chapter. The why-and-how is in Ch 14 (Neural Networks), Ch 16 (Deep Learning Reference), Ch 17 (LLMs), Ch 18 (AI Agents), Ch 19 (Frameworks), Ch 20 (2026 Landscape). This is the index of decisions you make most often, in the order you make them.

---

## Contents

- [P1. The 90-Second Field Map](#p1-the-90-second-field-map)
- [P2. Frontier Models Cheat Card (May 2026)](#p2-frontier-models-cheat-card-may-2026)
- [P3. "Which Model?" Decision Tree](#p3-which-model-decision-tree)
- [P4. Training a Neural Network — Defaults & Recipes](#p4-training-a-neural-network--defaults--recipes)
- [P5. Fine-Tuning Recipes](#p5-fine-tuning-recipes)
- [P6. LLM Serving — Cost / Latency / Quality](#p6-llm-serving--cost--latency--quality)
- [P7. RAG Playbook](#p7-rag-playbook)
- [P8. Agent Playbook](#p8-agent-playbook)
- [P9. Framework Picker](#p9-framework-picker)
- [P10. Diagnostics — When Things Break](#p10-diagnostics--when-things-break)
- [P11. Numbers Worth Memorising](#p11-numbers-worth-memorising)
- [P12. Interview Soundbites](#p12-interview-soundbites)

---

## P1. The 90-Second Field Map

```
   TRAINING TIME                                      INFERENCE TIME
   ─────────────                                      ──────────────
   Data ──► Tokenise ──► Pretrain ──► Post-train ──►  [LLM] ──► Reason / generate
            (BPE)        (next-token)  ( SFT  →                   ▲   │
                                         RLHF/                     │   │
                                         DPO  →                    │   ▼
                                         RLAIF )                   │  Tools / RAG /
                                                                   │  Computer-use
                                                                   │
   Compute:                                                       Compute:
   • TPU v7 / H100 / B200                                         • vLLM / SGLang
   • Megatron / FSDP / DeepSpeed                                  • PagedAttention
   • Mixed precision (BF16)                                       • KV-cache reuse
                                                                  • Speculative decoding
```

If you can sketch this on a whiteboard, you can answer 80% of "how does an LLM work end-to-end" interview questions.

---

## P2. Frontier Models Cheat Card (May 2026)

Memorise the *shape*, not the digits — leaderboards drift monthly.

```
   CLOSED-WEIGHT FRONTIER (within ~3 pts of each other)
   ────────────────────────────────────────────────────
   GPT-5.5            agents leader      Terminal-Bench 82.7%
   Claude Opus 4.7    coding leader      SWE-bench 87.6%
   Gemini 3.1 Pro     value + multimodal $2/$12 per M tokens, GPQA 94.3%

   OPEN-WEIGHT (sparse-MoE era)
   ─────────────────────────────
   DeepSeek V4-Pro    1.6T / 49B active   raw benchmarks leader,  MIT
   Llama 4 Scout      109B / 17B          10M context             Meta custom
   Qwen 3.5           397B / 17B          GPQA 88.4%              Apache 2.0
   Mistral Large 3    675B / 41B          tool-use                Apache 2.0
   Gemma 4 31B        31B dense           80% LiveCodeBench       Apache 2.0

   ON-DEVICE
   ─────────
   Gemini Nano        Pixel / Android
   Apple Foundation   iOS / macOS, ~3B
   Phi-4 Mini         Copilot+ PCs
   Llama 3.2 1B/3B    open-weight reference
```

Latest frontier note: **GPT-5.5 leads SWE-bench at 88.7%**, **Claude Opus 4.7 at 87.6%** — the agent category is what's still moving.

---

## P3. "Which Model?" Decision Tree

```
   What's the task?
      │
      ├── Real-time mobile autocomplete            → Gemini Nano / Apple Foundation
      │
      ├── High-QPS classification                  → Gemini 3 Flash / GPT-5 mini /
      │                                              open-weight Qwen 3.5 self-host
      │
      ├── Complex code, multi-file refactor         → Claude Opus 4.7 + extended thinking
      │                                              (or via Claude Code / Cursor)
      │
      ├── Browser / desktop automation              → Claude Computer Use, OpenAI Operator
      │
      ├── PhD-level science reasoning               → Gemini 3.1 Pro or Opus 4.7 thinking
      │
      ├── Long document (>1M tokens)                → Llama 4 Scout (10M) / Gemini 3.1 Pro (2M)
      │
      ├── Real-time voice                            → GPT-4o Realtime / Gemini Live /
      │                                                ElevenLabs Conversational
      │
      ├── Image gen (production)                     → Imagen 4 / DALL-E 3 / FLUX 1.1 Pro
      │
      ├── Video gen with audio                      → Veo 3.1
      │
      ├── Bulk inference, cost dominates            → Self-host DeepSeek V4 / Qwen 3.5
      │
      └── Sensitive data / sovereign                 → On-device or self-host open-weight
```

**Default for prototyping**: Gemini 3 Flash (cheap, fast, multimodal) or Claude Sonnet 4.6.

---

## P4. Training a Neural Network — Defaults & Recipes

### Sane defaults for "I'm starting a deep learning project"

| Choice | Default | When to deviate |
|---|---|---|
| **Optimizer** | AdamW | SGD+momentum for ImageNet-style image models |
| **Learning rate** | 3e-4 (Karpathy's constant) | Smaller (1e-5 to 5e-5) for fine-tuning |
| **LR schedule** | Linear warmup (5–10% of steps) + cosine decay | Constant LR for short tuning runs |
| **Batch size** | Largest that fits, then scale LR ∝ √batch | Tiny batches for limited memory |
| **Precision** | BF16 mixed precision | FP32 if you see NaN; INT8/FP8 for inference only |
| **Weight decay** | 0.1 (Transformers), 1e-4 (CNNs) | 0 if model is already underfitting |
| **Gradient clipping** | 1.0 | Lower (0.5) if loss spikes |
| **Dropout** | 0.0 (Transformers), 0.1–0.5 (older nets) | Modern Transformers prefer none |
| **Init** | Xavier/Kaiming for dense; PyTorch defaults are usually fine | Custom for very deep nets |
| **Activation** | GELU (Transformers), ReLU (everything else) | SwiGLU in modern LLMs |
| **Normalisation** | LayerNorm (Transformers), BatchNorm (CNNs) | RMSNorm in Llama-family |
| **Loss** | Cross-entropy | MSE for regression; focal loss for imbalanced |

### Diagnostic flow when training won't converge

```
   Loss is NaN / Inf
      │
      ├── Check input data — any NaN in features / labels?
      ├── Reduce learning rate 10×
      ├── Add gradient clipping (1.0)
      ├── Switch FP16 → BF16
      └── Check loss function — log(0)? divide-by-zero?

   Loss decreases on train but plateaus on val (overfitting)
      │
      ├── More data first (always cheapest fix)
      ├── Add weight decay / dropout
      ├── Augmentation (image: flip/crop; text: paraphrase)
      ├── Reduce model size
      └── Early stopping on val loss

   Loss flat from step 0 (not learning)
      │
      ├── LR too low? Try 10× higher
      ├── LR too high? Try 10× lower (most common)
      ├── Bug in label — predict the labels themselves; should overfit
      ├── Bug in dataloader — print one batch
      └── Architecture broken — overfit a single batch first

   Train loss spikes intermittently
      │
      ├── Lower learning rate
      ├── Tighten gradient clipping
      ├── Check for outlier batches (extreme labels)
      └── BF16 instead of FP16
```

### The "always do these first" sanity checks

1. **Overfit a single batch.** If your model can't drive loss to ~0 on 4 examples, the model is broken. Don't tune hyperparameters yet.
2. **Predict the labels.** Feed labels as features. Model should reach ~0 loss instantly. If not, there's a data bug.
3. **Print one batch.** Look at shapes, dtype, value ranges. ~50% of "model is broken" issues are dataloader bugs.
4. **Run with 1 worker, no shuffling.** Reproducible failures debug faster.
5. **Disable augmentation, regularisation, schedulers.** Get to a stupid model that learns. Add complexity back one at a time.

---

## P5. Fine-Tuning Recipes

### When to fine-tune at all

```
   Question:  "Can I get the behavior I want with prompting + RAG?"
              │
              ├── Yes  → don't fine-tune. Cheaper, faster, easier to update.
              │
              └── No   → consider fine-tuning. Reasons:
                          • Domain-specific style / format the prompt can't capture
                          • You need offline / on-device inference
                          • Token cost on the hot path is dominant
                          • Latency critical (small fine-tuned model > big API)
```

### LoRA / QLoRA defaults (Hugging Face TRL + PEFT)

| Hyperparameter | Default | Notes |
|---|---|---|
| Rank `r` | 16 | 8 is often enough; 64+ rarely helps |
| `lora_alpha` | 32 (= 2× r) | Most public recipes use this ratio |
| `lora_dropout` | 0.05 | Only matters on very small datasets |
| `target_modules` | `["q_proj", "v_proj"]` | Adding `k_proj`, `o_proj`, FFN layers helps quality at ~2× cost |
| Learning rate | 2e-4 | ~10× higher than full fine-tune |
| Epochs | 1–3 | Diminishing returns past 3 |
| Batch size | as large as fits | Use grad accumulation if OOM |
| Quant for QLoRA | NF4 (4-bit) | ~75% memory cut |

### SFT → DPO → RLHF — when each pays off

| Stage | What it does | Cost | Pay off |
|---|---|---|---|
| **SFT** (Supervised) | Teach format, basic capability | Cheap | Always. Skip and you have no foundation. |
| **DPO** | Align with preferences, no reward model | Medium | Often enough; what most teams ship. |
| **RLHF** (PPO + reward model) | Strongest alignment but complex | High | Worth it for top-of-leaderboard chasing. |
| **RLAIF** | AI feedback replaces humans | Medium | Scales when human labels are scarce. |
| **Constitutional AI** | Self-critique against principles | Low–Medium | Anthropic-style; less labelling. |

### Hello world — LoRA SFT

```python
from datasets import load_dataset
from trl import SFTTrainer, SFTConfig
from peft import LoraConfig

dataset = load_dataset("HuggingFaceH4/instruction-dataset", split="train")
lora = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
                  target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM")
SFTTrainer(
    model="meta-llama/Llama-3.1-8B-Instruct",
    train_dataset=dataset,
    peft_config=lora,
    args=SFTConfig(output_dir="./lora-out", num_train_epochs=1, learning_rate=2e-4),
).train()
```

---

## P6. LLM Serving — Cost / Latency / Quality

### Levers in priority order

| Lever | Typical impact | Where it lives |
|---|---|---|
| **Prompt caching** | 50–90% cost cut on shared prefixes | Provider feature; on by default for big system prompts |
| **Model routing** | 30–80% cost cut | App layer — easy queries to Flash/4o-mini, hard ones to Pro/Opus |
| **Batching** | 50% via async batch APIs | OpenAI Batch / Anthropic Batch |
| **Streaming** | Better TTFT, no cost change | Default for any user-facing chat |
| **PagedAttention (vLLM)** | 5–10× throughput | Inference server |
| **Speculative decoding** | 2–3× faster, no quality loss | Built into vLLM, SGLang |
| **KV-cache reuse** | Multi-turn cost cut | vLLM, SGLang |
| **Quantization** (INT8/INT4) | 2–8× memory | Use FP8/INT8 for serving; INT4 for edge |
| **Smaller embedder** | 5–10× retrieval cost cut | Often within 1% quality |

### Inference server defaults

```
   Local dev / one-user                    → Ollama (5-min setup, zero-ops)
   Production, single GPU node             → vLLM
   Production, structured / agent workloads → SGLang
   Peak NVIDIA throughput, willing to fight → TensorRT-LLM
   Edge / CPU / GGUF                        → llama.cpp
   Apple silicon                            → MLX

   Avoid for new projects: TGI (maintenance mode in 2026).
```

### Quick math: how big a GPU do I need?

| Precision | Bytes / param | 7B model | 70B model |
|---|---|---|---|
| FP32 | 4 | 28 GB | 280 GB |
| FP16 / BF16 | 2 | 14 GB | 140 GB |
| INT8 | 1 | 7 GB | 70 GB |
| INT4 | 0.5 | 3.5 GB | 35 GB |

Add ~20–40% on top for **KV cache** at production batch sizes. A single H100 (80 GB) serves a 70B model only at INT4. A B200 / B300 serves it at INT8.

---

## P7. RAG Playbook

### The default modern RAG pipeline

```
   user query
      │
      ▼
   ┌──────────────┐
   │ Query rewrite│  (LLM splits multi-part questions into sub-queries)
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Hybrid search│  vector (dense) + BM25 (sparse) + metadata filters
   │   top k = 20 │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │   Reranker   │  cross-encoder (Cohere Rerank, BGE) — keep top 3
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Context build│  XML tags, source citations, instruction at end
   └──────┬───────┘
          │
          ▼
       LLM call ──► answer with citations
```

### Vector DB picker

```
   <10M vectors, already on Postgres   →  pgvector
   10M–1B, self-host                   →  Qdrant / Weaviate / Milvus
   10M–1B, managed                     →  Pinecone
   >1B vectors                         →  Vespa / distributed Milvus
   Local dev / notebooks               →  Chroma
   Hybrid search out of the box        →  Weaviate / Vespa / Qdrant
```

### RAG failure modes → fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Retrieves wrong docs | Query and corpus use different vocabulary | **HyDE** — generate hypothetical answer, embed *that* |
| Misses exact-match (IDs, error codes) | Pure vector search | **Hybrid search** (vector + BM25) |
| Top-5 by similarity ≠ top-5 by meaning | No reranker | Add **cross-encoder rerank** of top 20 → 3 |
| Chunk meaningless on its own | Bad chunking | **Contextual chunks** — prepend doc summary |
| Wrong answer despite right docs retrieved | Lost-in-the-middle | Put critical content at end; structured tags |
| LLM hallucinates citations | No grounding instructions | "Quote the document; cite source. If unknown, say so." |
| Slow at scale | Re-embedding on every query | Cache embeddings; serve via ANN index (HNSW) |

### Embedder defaults (May 2026)

| Family | When |
|---|---|
| **OpenAI `text-embedding-3-large`** | Hosted, multilingual, strong default |
| **Cohere `embed-v4`** | Best multilingual hosted |
| **Voyage `voyage-3-large`** | Best on RAG benchmarks |
| **BGE-M3** | Best open-weight, multilingual, hybrid (dense+sparse+ColBERT) |
| **Nomic v2** | Best open-weight English, fast |
| **Cohere Rerank v3.5** | Default reranker |
| **BGE-Reranker v2** | Best open-weight reranker |

---

## P8. Agent Playbook

### When to actually build an agent

```
   Could a single LLM call + a few tool definitions solve this?
      │
      ├── Yes → not an agent. Don't add a graph. Stop.
      │
      └── No → need loops, branches, durable state? → LangGraph
                role-based pipeline?               → CrewAI
                conversational debate (research)?  → AutoGen / AG2
                Google enterprise / Vertex?        → ADK + Agent Engine
                type-safe / lots of validation?    → Pydantic AI
```

### Anti-patterns — when agent design hurts

- **Multi-agent for everything.** Each turn = LLM call. A 4-agent debate with 5 rounds = 20+ calls. Quantify before adopting.
- **Agent for a deterministic workflow.** If steps are fixed, write a script that calls the LLM where needed.
- **Agent without tracing.** You will not debug an opaque loop. LangSmith / Phoenix / Weave / MLflow trace from day 1.
- **Agent without evals.** No way to know whether your prompt change made it better.
- **Tools without docstrings.** The model decides whether to call a tool based on the description. Bad descriptions = bad tool use.

### The single-agent hello world (LangChain 1.0)

```python
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """Look up current weather for a city."""
    return f"It's 72°F in {city}."

agent = create_agent(
    model=ChatOpenAI(model="gpt-4o"),
    tools=[get_weather],
    prompt="You are a concise travel assistant.",
)
print(agent.invoke({"messages": [("user", "Weather in Tokyo?")]})["messages"][-1].content)
```

### MCP — when to expose a tool as MCP

- You want it usable by **Claude Desktop, Cursor, ChatGPT, ADK** without writing a per-host integration.
- You want to ship one server and have it work everywhere.
- Skip MCP if your tool is one-off for your own app — direct tool definitions are simpler.

---

## P9. Framework Picker

```
   Building an LLM app today — what do I reach for?
      │
      ├── 50-line script, single call            → raw OpenAI / Anthropic SDK
      │
      ├── RAG over PDFs / wiki / data           → LlamaIndex
      │
      ├── Agent with tools, prod-grade           → LangChain 1.0 + LangGraph
      │
      ├── Type-safe agent w/ validation           → Pydantic AI / Instructor
      │
      ├── Optimise prompts via evals              → DSPy
      │
      ├── Multi-agent role pipeline               → CrewAI
      │
      ├── On Google Cloud                         → ADK + Vertex Agent Engine
      │
      ├── Fine-tune / LoRA                        → HuggingFace TRL + PEFT
      │
      └── Serve a model at scale                  → vLLM
```

### Eval / observability stack

```
   CI gating (block bad PRs)
      ├── DeepEval  — Pytest-style LLM unit tests
      ├── Ragas     — reference-free RAG metrics
      └── promptfoo — CLI prompt regression + red-team

   Annotation, dashboards, regressions
      ├── LangSmith    — deep LangChain integration
      ├── Braintrust   — enterprise eval dashboards
      ├── W&B Weave    — if already on W&B
      ├── Arize Phoenix — open-source, OTel-native
      └── MLflow 3     — unified ML + GenAI lifecycle
```

Most teams converge on **one CI tool + one platform.** Pair Ragas/DeepEval (CI) with LangSmith/Braintrust (annotation, regressions, dashboards).

---

## P10. Diagnostics — When Things Break

### "My LLM hallucinates"

```
   Hallucination
      │
      ├── No retrieval? Add RAG.
      ├── Retrieval works but answer ignores it?
      │     → Move retrieved docs to end of prompt; add "cite source" instruction
      │     → Use stricter system prompt: "If unsure, say 'I don't know.'"
      ├── Citing wrong docs?
      │     → Add reranker
      │     → Switch to hybrid search
      ├── Wrong even with right docs?
      │     → Check chunk size; chunk may lack context
      │     → Try contextual chunking (prepend doc summary)
      └── Still wrong on a hard task?
            → Reasoning model with extended thinking
```

### "My agent loops forever"

```
   Agent loop
      │
      ├── Set a max-step budget (10–25)
      ├── Add timeout per step
      ├── Trace every tool call — what's the model trying?
      ├── Tool error message unclear? Improve it; the model reads errors.
      ├── Tool description ambiguous? Rewrite docstring.
      └── Hard problem? Add a reasoning model or split into a graph (LangGraph).
```

### "My model is slow"

```
   Slow LLM
      │
      ├── First-token latency high
      │     → Stream; turn on prompt caching; smaller model for simple queries
      ├── Total output latency high
      │     → Speculative decoding (vLLM has it)
      │     → Smaller model
      │     → Reduce max_tokens; structured outputs cap waste
      ├── Tail latency (p99) bad
      │     → Continuous batching; PagedAttention; bigger KV cache
      └── Multi-step agent slow
            → Parallel tool calls
            → Cheaper model for retrieval / planning, expensive only for final
```

### "My fine-tune got worse"

```
   Quality regressed after fine-tuning
      │
      ├── Catastrophic forgetting on general tasks
      │     → Mix general data into your tuning set (10–30%)
      │     → Lower learning rate (5e-5 instead of 2e-4)
      ├── Overfitting to format
      │     → Reduce epochs; add held-out eval; early stop
      ├── Eval went up but vibes went down
      │     → Eval doesn't cover real distribution
      │     → Run side-by-side comparisons; collect human prefs; DPO
      └── LoRA didn't move the needle
            → Increase rank (16 → 32 or 64)
            → Add more target_modules (k_proj, o_proj, FFN)
            → More data (most common cause)
```

### "My RAG is mediocre"

```
   RAG quality
      │
      ├── First win: add a reranker. Almost always 5–15% gain.
      ├── Second: hybrid search (vector + BM25).
      ├── Third: better embedder (Voyage v3-large or BGE-M3).
      ├── Fourth: smarter chunking (contextual chunks; semantic split).
      ├── Fifth: query rewriting (LLM splits multi-part questions).
      └── If still bad: maybe it's not retrieval — eval the LLM with the *correct* docs.
            If it's still wrong, the failure is generation, not retrieval.
```

---

## P11. Numbers Worth Memorising

| Quantity | Value | Why it matters |
|---|---|---|
| Tokens per English word | ~1.3 | Estimate token count from word count |
| Chars per token (English) | ~4 | Estimate from char count |
| BF16 bytes per parameter | 2 | Memory math |
| INT4 bytes per parameter | 0.5 | On-device math |
| H100 HBM | 80 GB | Standard production GPU memory |
| B200 HBM | 192 GB | Next-gen NVIDIA, 2024–2026 |
| TPU v7 Ironwood HBM | 192 GB | Google flagship; 4,614 FP8 TFLOPS |
| Ironwood pod | 9,216 chips → 42.5 exaFLOPS | Google's 2026 compute story |
| Default learning rate | 3e-4 | "Karpathy's constant" |
| Fine-tune LR | 1e-5 to 5e-5 | 10× lower than from-scratch |
| LoRA LR | 2e-4 | 10× higher than full FT |
| LoRA rank `r` | 16 | Sane default |
| Token price drop 2022 → 2026 | ~1000× | Architecture decisions follow this |
| GPT-4 quality cost (2026) | $0.06 / M tokens | Down from $20 in 2022 |
| Frontier SWE-bench (May 2026) | ~88% | GPT-5.5 leads |
| Reasoning thinking budget | 1K–100K tokens | Controlled per-call |
| Default chunk size for RAG | 100–500 tokens | Balance precision vs context |
| Top-k for retrieval | 20 → rerank to 3 | Standard pipeline |
| Prompt cache discount | ~90% | Biggest single cost lever |
| EU AI Act enforcement | Aug 2, 2026 | Penalties + GPAI live |
| Llama 4 Scout context | 10M tokens | Industry-largest |
| Gemini 3.1 Pro context | 2M tokens | Hosted long-context default |

---

## P12. Interview Soundbites

One- or two-sentence answers to the questions you'll actually be asked. Memorise the *shape*; rephrase to fit the conversation.

**"Walk me through training an LLM."**
Tokenise data with BPE → pretrain on next-token prediction across web-scale corpus on TPU/GPU clusters with mixed-precision and FSDP/DeepSpeed → SFT on instruction-tuned data → align with DPO or RLHF → deploy on vLLM with KV-cache reuse and quantization for serving.

**"Why are reasoning models a big deal?"**
They scale a separate axis — *test-time compute*. Doubling thinking budget often beats doubling parameters on math, code, and planning. Pay only on hard problems; skip them for trivial tasks.

**"How would you fix a hallucinating LLM?"**
RAG with hybrid search and a reranker; structured output with a strict JSON schema; "cite source or say 'I don't know'" instructions; reasoning model on hard cases; eval with Ragas faithfulness on every release.

**"How do you reduce LLM cost?"**
In order: prompt caching (90% off on shared prefixes), model routing (cheap model for easy queries), batch APIs (50% off), smaller embedder, quantization for self-hosted.

**"Why is my fine-tune worse than the base model?"**
Likely catastrophic forgetting or overfitting to format. Mix general data into the tune set, lower LR, fewer epochs, and run held-out evals — don't trust train loss.

**"What's the RAG pipeline you'd build today?"**
Query rewriting → hybrid search (dense + BM25) → cross-encoder rerank (top 20 → 3) → structured prompt with citations → answer. Eval with Ragas.

**"When would you fine-tune vs prompt + RAG?"**
Default: prompt + RAG. Fine-tune only when you need a specific style/format prompts can't capture, when you must run on-device, or when token cost on the hot path dominates.

**"Why is TGI no longer the default in 2026?"**
HuggingFace put it in maintenance mode. vLLM is the production default — PagedAttention, ~5–10× throughput, OpenAI-compatible API, broad hardware support. Stripe cut inference cost 73% migrating to vLLM.

**"How does PagedAttention work in 30 seconds?"**
KV cache is partitioned into fixed-size blocks like OS virtual-memory pages. Requests share blocks, no fragmentation. Net: 2–10× more concurrent users on the same GPU.

**"Why did SWE-bench jump from 13% to 88% in 18 months?"**
Four compounding factors: better base models, test-time compute, better scaffolds (file IO, test runners, diff review), and RL on agentic traces. The scaffold gap explains why Augment at 72% (Opus 4.6) beat Cursor at 65.7% (Sonnet 4.6).

**"When does long context replace RAG?"**
Single big document analysis (one contract, one paper, one repo). For knowledge-base Q&A across thousands of changing docs, retrieval still wins — lost-in-the-middle is real.

**"What's context engineering?"**
Designing the entire context window — system prompt, retrieved docs, tool outputs, history, memory, layout — not just the user-facing prompt. The wording of the prompt is one slice; the rest determines 80% of an AI app's quality.

**"What's your default model for a new prototype?"**
Gemini 3 Flash or Claude Sonnet 4.6 — cheap, fast, multimodal, good enough for almost everything. Move to Pro / Opus only when measurably needed; move to open-weight when cost or sovereignty pressure shows up.

**"How would you decide on-device vs cloud?"**
On-device when privacy, latency, billions-of-queries scale, or offline matters. Cloud when you need top-end reasoning, multimodal beyond text+image, real-time external data, or you can't ship a model with the OS.

**"What would you cite as quality benchmarks in 2026?"**
SWE-bench Verified (real bug fixes), Terminal-Bench 2.0 (CLI agents), OSWorld (computer use), GPQA Diamond (graduate science), ARC-AGI-2, FrontierMath. **Not** MMLU or HumanEval — saturated.

---

**See also:** [Ch 14 Neural Networks](14_neural_networks.md) · [Ch 16 Deep Learning Reference](16_deep_learning.md) · [Ch 17 LLMs](17_llm.md) · [Ch 18 AI Agents](18_ai_agents.md) · [Ch 19 AI Frameworks](19_ai_frameworks.md) · [Ch 20 The 2026 AI Landscape](20_2026_landscape.md) · [Ch 00 Cheat Sheet](00_quick_reference_cheat_sheet.md)
