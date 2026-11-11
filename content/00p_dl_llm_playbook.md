# Deep Learning & LLMs — The Playbook

> A decision-oriented quick reference for Ch 14–20. Skim during interview prep; grep during a real on-call. Recipes, defaults, decision trees, diagnostic flowcharts, and the numbers worth memorising.

This is **not** a textbook chapter. The why-and-how is in Ch 14 (Neural Networks), Ch 16 (Deep Learning Reference), Ch 17 (LLMs — how they work), **Ch 17b (LLMs — how you use them)**, **Ch 17c (LLM Systems — serving, scaling, evaluation)**, Ch 18 (AI Agents), **Ch 18b (Agents in Production)**, Ch 19 (Frameworks), Ch 20 (2026 Landscape). This is the index of decisions you make most often, in the order you make them.

Need a study order instead? The learning tracks, the L1–L4 depth ladder and the 18-rung coding ladder are in the **Section map** at the top of [Ch 16](#content/16_deep_learning); **P13** below is the one-page checklist with links to every must-know topic. Model names, prices and benchmark tables date within months, so this playbook is a **November 2026** snapshot; the *shapes* (decoder-only, MoE, RAG, the serving levers) age much more slowly.

---

## Contents

- [P1. The 90-Second Field Map](#p1-the-90-second-field-map)
- [P2. Frontier Models Cheat Card (November 2026)](#p2-frontier-models-cheat-card-november-2026)
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
- [P13. Must-Know Checklist and Code Ladder](#p13-must-know-checklist-and-code-ladder)

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
![The 90-second training vs inference field map](diagrams/play00_fieldmap_ai.png)

What the map compresses — say these out loud when you draw it:

- **"Data" is a pipeline, not a box.** Crawl → extract text → language ID → quality filters → deduplicate → PII/safety → mix domains → decontaminate → order and anneal. Most of a model's quality comes from here, not from the architecture ([Ch 17 §3.1b](#content/17_llm)).
- **Post-training has a second branch.** SFT, then preference tuning (DPO / RLHF / RLAIF) *or* reinforcement learning on answers a program can check (RLVR, optimised with GRPO) — that is how reasoning models are made. You pick by the feedback you have ([Ch 17 §3.5b–3.5c](#content/17_llm)).
- **Inside "[LLM]" is one repeated block:** RMSNorm → attention (RoPE, grouped-query, FlashAttention) → RMSNorm → SwiGLU feed-forward, each with a residual. A mixture-of-experts model swaps the feed-forward for many experts plus a router ([Ch 17 §4.8](#content/17_llm)); pictures and audio enter as extra tokens ([Ch 17 §4.9](#content/17_llm)).

---

## P2. Frontier Models Cheat Card (November 2026)

Memorise the *shape*, not the names or digits — leaderboards and version numbers drift monthly. Facts below are from vendor model pages and cards as summarised in [Ch 17 §4](#content/17_llm); where a vendor page and this card disagree, trust the vendor page.

```
   CLOSED-WEIGHT FRONTIER (three labs, same shape: a top tier, a workhorse, a cheap tier)
   ──────────────────────────────────────────────────────────────────────────────────────
   OpenAI      GPT-6 Astra (flagship) · GPT-6.1 Sol (near-Astra, much cheaper) ·
               GPT-6 Luna (high-volume, low cost)         ~1M ctx, text+image in
   Anthropic   Claude Fable 5.2 (top tier) · Opus 5.5 (long-running agentic coding) ·
               Sonnet 5.5 (speed + intelligence) · Haiku 5.5 (fastest)   1M ctx, text+image in
   Google      Gemini 4 Argon (sparse MoE, native multimodal: text, image, audio, video in,
               up to 1M ctx) · Gemini 4 Carbon (staged rollout) · Gemini 3.x Flash tiers (cheap)

   OPEN-WEIGHT (sparse-MoE era — total / active parameters)
   ────────────────────────────────────────────────────────
   DeepSeek V4-Pro    1.6T / 49B          1M ctx (compressed attention)   MIT
   Muse Spark Open    816B / 42B          1M ctx, multimodal (Meta)       Muse licence, limited commercial
   Qwen 3.5           397B / 17B          flagship; 3.6 followed          Apache 2.0 (check each card)
   Mistral Large 4    1.05T / 52B         1M ctx + 1.6B vision encoder    Mistral open-weight (modified MIT)
   Llama 4 Scout      109B / 17B          10M ctx *advertised*            Llama community licence
   gpt-oss-120b       117B / 5.1B         fits one 80 GB GPU (4-bit)      Apache 2.0
   Gemma 4            31B dense, 26B MoE  small multimodal, 128K–256K     Apache 2.0

   ON-DEVICE
   ─────────
   Gemini Nano        Pixel / Android
   Apple Foundation   iOS / macOS, ~3B
   Gemma 4 E2B / E4B  phones and laptops, open weights
   Phi-4 Mini         Copilot+ PCs
   Llama 3.2 1B/3B    open-weight reference
```

**How to read it.** Each lab's launch table favours its own model and uses its own harness, so compare two scores only when they come from the *same* table. Context is ~1M tokens at the frontier; the 10M Scout figure is advertised, and *effective* length is shorter ([Ch 17 §2.7](#content/17_llm)). The open models are mostly large MoE: **memory follows the total parameters, compute follows the active ones** ([Ch 17 §4.8](#content/17_llm)). Most current API models take text and images in and return text; images and voice come from separate generators ([Ch 17 §4.9](#content/17_llm)).

---

## P3. "Which Model?" Decision Tree

```
   What's the task?
      │
      ├── Real-time mobile autocomplete            → Gemini Nano / Apple Foundation /
      │                                              Gemma 4 E2B-E4B
      │
      ├── High-QPS classification                  → Gemini 3.x Flash / GPT-6 Luna / Haiku 5.5 /
      │                                              open-weight Qwen 3.5 self-host
      │
      ├── Complex code, multi-file refactor         → Claude Opus 5.5 (adaptive thinking) or
      │                                              GPT-6.1 Sol (via Claude Code / Codex / Cursor)
      │
      ├── Browser / desktop automation              → Claude computer use, OpenAI computer-use agent
      │
      ├── PhD-level science reasoning               → top tier (Astra / Fable 5.2 / Gemini 4 Argon)
      │                                              with the reasoning-effort dial turned up
      │
      ├── Long document (≥1M tokens)                → retrieve + chunk, or a ~1M-window model;
      │                                              Scout's 10M is advertised — test effective length
      │
      ├── Real-time voice                            → OpenAI Realtime API / Gemini Live /
      │                                                ElevenLabs Conversational
      │
      ├── Image gen (production)                     → Imagen / GPT-Image / FLUX (check versions)
      │
      ├── Video gen with audio                      → Veo (Google)
      │
      ├── Bulk inference, cost dominates            → Self-host DeepSeek V4 / Qwen 3.5
      │
      └── Sensitive data / sovereign                 → On-device or self-host open-weight
```

**Default for prototyping**: a Flash / Sonnet / Luna-tier model (Gemini 3.x Flash, Claude Sonnet 5.5, GPT-6 Luna) — cheap, fast, good enough for almost everything. Reasoning depth is now a dial (`reasoning.effort` / `effort` / thinking levels): start low, raise it only on the hard cases.
![Which model? An eleven-branch decision tree](diagrams/play00_modeltree_ai.png)

---

## P4. Training a Neural Network — Defaults & Recipes

### Sane defaults for "I'm starting a deep learning project"

| Choice | Default | When to deviate |
|---|---|---|
| **Optimizer** | AdamW | SGD+momentum (well tuned) for ImageNet-style CNNs; Muon / Adafactor / Lion are the 2024–26 alternatives |
| **Learning rate** | 3e-4 (Karpathy's constant) for small models | Smaller as models grow (≈1.5e-4 at 70B, ≈8e-5 at 405B in Llama 3); 1e-5 to 5e-5 to fine-tune a Transformer |
| **LR schedule** | Linear warmup + cosine decay to ~10% of peak ([Ch 16 §1.3](#content/16_deep_learning)) | Warmup 3–10% of steps for fine-tuning and small runs, but only ~0.1–2% for LLM pre-training; warmup–stable–decay for long runs |
| **Batch size** | Largest that fits, then re-tune LR: SGD ∝ batch, Adam ∝ √batch (both only starting points) | Does not fit? Gradient accumulation: effective batch = micro-batch × steps × GPUs, divide each loss by k ([Ch 16 §1.9](#content/16_deep_learning)) |
| **Precision** | BF16 mixed precision with FP32 master weights | FP16 needs loss scaling, BF16 does not; FP8 is used in some of the largest recent training runs; INT8/INT4 are mainly for inference |
| **Weight decay** | 0.1 for LLM pre-training (0.01–0.1 with AdamW), 1e-4 for CNNs with SGD | Skip biases and norm gains; 0 if the model is underfitting |
| **Gradient clipping** | Global norm 1.0 | Lower (0.5) if loss spikes |
| **Dropout** | 0 for LLM pre-training; 0.1 for small Transformers and fine-tuning | 0.3–0.5 on large fully-connected layers in older nets |
| **Init** | He / Kaiming (2/fan_in) for ReLU, Xavier (2/(fan_in+fan_out)) for tanh; Transformers: normal std 0.02, zero biases, residual out-projections scaled by 1/√(2L) ([Ch 16 §1.8](#content/16_deep_learning)) | PyTorch's `nn.Linear` default is neither — fine only because norm layers repair the scale; call `kaiming_normal_` for deep plain ReLU stacks |
| **Activation** | ReLU (CNNs), GELU (BERT, GPT-2, ViT) | SwiGLU is the default in open LLMs (Llama, Qwen, DeepSeek), with hidden width ≈ 8d/3 to match a 4d FFN's parameters |
| **Normalisation** | BatchNorm (CNNs), LayerNorm (classic Transformers) | RMSNorm, pre-norm, in most modern LLMs |
| **Loss** | Cross-entropy (label smoothing 0.1 for classification) | MSE for regression; focal loss for heavy imbalance |
| **Evaluate** | The final weights | EMA of the weights (decay 0.999–0.9999) for diffusion, GANs and many vision recipes; LLM pre-training usually skips it ([Ch 16 §1.9](#content/16_deep_learning)) |

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
      ├── Init too small / too large in a deep net — print activation std per layer
      └── Architecture broken — overfit a single batch first

   Train loss spikes intermittently
      │
      ├── Lower learning rate
      ├── Tighten gradient clipping
      ├── Check for outlier batches (extreme labels)
      ├── BF16 instead of FP16
      └── LLM-scale runs: AdamW β₂ = 0.95, QK-norm, rewind to an earlier
          checkpoint and skip the batches around the spike (Ch 17 §3.6)

   CUDA out of memory while training
      │
      ├── Count first: mixed-precision AdamW = 16 bytes/param (2+2+12),
      │     so a 7B model needs 112 GB before activations
      ├── States alone do not fit → shard (FSDP / ZeRO-3) or use LoRA
      ├── Activations too big → smaller micro-batch + gradient accumulation
      ├── Still too big → activation checkpointing (≈ +33% compute)
      └── Attention scores huge at long sequences → FlashAttention

   Accurate, but a tiny invisible change flips the answer
      │
      ├── Adversarial example (FGSM: x + ε·sign(∇ₓL)) — random noise will NOT reveal it
      ├── Test with PGD, not just one FGSM step
      └── Adversarial training (≈ K+1× cost, some clean accuracy lost);
          randomized smoothing for a certified radius; beware gradient masking
```

Where each lives: weight init and activations [Ch 16 §1.8](#content/16_deep_learning); accumulation, checkpointing, EMA and the 16-byte budget [Ch 16 §1.9](#content/16_deep_learning); adversarial examples [Ch 16 §2.7](#content/16_deep_learning); depthwise-separable convolutions for phones and cameras [Ch 16 §2.6](#content/16_deep_learning) (about 8–9× fewer multiply-adds for 3×3 filters, ~1 point of ImageNet accuracy in MobileNet v1).

### The "always do these first" sanity checks

1. **Overfit a single batch.** If your model can't drive loss to ~0 on 4 examples, the model is broken. Don't tune hyperparameters yet.
2. **Predict the labels.** Feed labels as features. Model should reach ~0 loss instantly. If not, there's a data bug.
3. **Print one batch.** Look at shapes, dtype, value ranges. A large share of "model is broken" issues are dataloader bugs.
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
| Rank `r` | 16 | 8 is often enough; 64+ adds capacity (closer to full fine-tuning) with diminishing returns ([Ch 17b §9.4](#content/17b_llm_applications)) |
| `lora_alpha` | 32 (= 2× r) | Most public recipes use this ratio |
| `lora_dropout` | 0.05 | Only matters on very small datasets |
| `target_modules` | `["q_proj", "v_proj"]` | Adding `k_proj`, `o_proj`, FFN layers (`gate_proj`, `up_proj`, `down_proj`) helps quality at ~2× cost |
| Learning rate | 2e-4 | ~10× higher than full fine-tune |
| Epochs | 1–3 | Diminishing returns past 3 |
| Batch size | as large as fits | Use gradient accumulation if OOM ([Ch 16 §1.9](#content/16_deep_learning)) |
| Quant for QLoRA | NF4 (4-bit) | Base weights ~75% smaller than 16-bit (70B: 140 → ~35 GB); the adapters stay in higher precision |

### SFT → DPO → RLHF — when each pays off
![SFT to DPO to RLHF, cost versus payoff ladder](diagrams/play00_sftdpo_ai.png)

| Stage | What it does | Cost | Pay off |
|---|---|---|---|
| **SFT** (Supervised) | Teach format, basic capability | Cheap | Always. Skip and you have no foundation. |
| **Rejection sampling** | Sample N answers, keep the best, SFT on the winners | Cheap | Easy gain over plain SFT; stacks with DPO (Llama 3 did both). |
| **DPO** | Align with preferences, no reward model | Medium | Often enough; what most teams ship. |
| **KTO / SimPO / ORPO** | DPO cousins: thumbs-up/down labels only / no reference model / SFT and alignment in one stage | Low–Medium | When your feedback is unpaired, or you want fewer moving parts. |
| **RLHF** (PPO + reward model) | Strongest alignment but complex | High | Worth it for top-of-leaderboard chasing. |
| **RLAIF** | AI feedback replaces humans | Medium | Scales when human labels are scarce. |
| **Constitutional AI** | Self-critique against principles | Low–Medium | Anthropic-style; less labelling. |
| **RLVR + GRPO** | RL on answers a program can check (tests, exact match); GRPO uses the group's mean score as the baseline, so no critic | High | Maths, code and reasoning models (DeepSeek-R1 recipe). |

Pick by **the feedback you actually have** ([Ch 17 §3.5c](#content/17_llm)): demonstrations → SFT; chosen/rejected pairs → DPO; thumbs up/down → KTO; an automatic checker → RLVR with GRPO; only a written rulebook → RLAIF. The follow-up interviewers ask is *reward hacking* — the model scores well without doing the thing (verbosity is the commonest hack); a KL penalty and a held-out gold metric are the defences. Both DPO and GRPO are runnable in Ch 17 ([§3.5](#content/17_llm), [§3.5b](#content/17_llm)).

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
![Nine LLM serving cost and latency levers, ranked](diagrams/play00_levers_ai.png)

| Lever | Typical impact | Where it lives |
|---|---|---|
| **Prompt caching** | About 90–97.5% cheaper on cached prefix tokens (cache hits billed at 0.025×–0.1× the input price, depending on model) | Provider feature — automatic on some providers, opt-in on others; only an exact *prefix* hits, so put everything variable (timestamps, user IDs) last ([Ch 17c §2.4](#content/17c_llm_systems)) |
| **Model routing** | 30–80% cost cut | App layer — easy queries to a Flash / Luna / Haiku-tier model, hard ones to Pro / Astra / Opus |
| **Batching** | 50% via async batch APIs | OpenAI Batch / Anthropic Batch |
| **Streaming** | Better TTFT, no cost change | Default for any user-facing chat |
| **Continuous batching + PagedAttention (vLLM)** | Continuous batching is the biggest throughput win (Orca: 36.9× over FasterTransformer; Anyscale: ~8× over static batching alone, up to 23× with vLLM); paging lifts KV-cache use from ~20–40% to over 90% (vLLM paper: ~2–4× throughput over earlier servers) | Inference server ([Ch 17c §2.1–2.2](#content/17c_llm_systems)) |
| **Speculative decoding** | ~2–3× faster per stream at low batch size; lossless — same output distribution | Built into vLLM, SGLang; skip it at high batch or high temperature ([Ch 17c §2.5](#content/17c_llm_systems)) |
| **KV-cache reuse** | Multi-turn and agent-loop cost cut | vLLM prefix caching, SGLang RadixAttention |
| **Quantization** | Weights 2× (INT8/FP8) to 4× (INT4) smaller than FP16 | Weight-only INT4/FP8 speeds up *decode*; W8A8/FP8 speeds up prefill too; FP8 KV cache cuts the long-context bill ([Ch 17c §3.1–3.2](#content/17c_llm_systems)) |
| **Smaller embedder** | Several × cheaper retrieval | Usually a small quality loss — measure on your own eval |

### Inference server defaults

```
   Local dev / one-user                    → Ollama (5-min setup, zero-ops)
   Production, single GPU node             → vLLM
   Production, structured / agent workloads → SGLang
   Peak NVIDIA throughput, willing to fight → TensorRT-LLM
   Edge / CPU / GGUF                        → llama.cpp
   Apple silicon                            → MLX

   Avoid for new projects: TGI (Hugging Face put it in maintenance mode in Dec 2025).
```

### Quick math: how big a GPU do I need?

| Precision | Bytes / param | 7B model | 70B model |
|---|---|---|---|
| FP32 | 4 | 28 GB | 280 GB |
| FP16 / BF16 | 2 | 14 GB | 140 GB |
| INT8 | 1 | 7 GB | 70 GB |
| INT4 | 0.5 | 3.5 GB | 35 GB |

Those are **weights only**. The **KV cache** comes on top and grows with context × concurrent requests: `2 × layers × KV-heads × head-dim × bytes × tokens` — Llama-3-70B with grouped-query attention is about **320 KiB per token**, so 10 GiB at 32K and 40 GiB (≈ 43 GB) at 128K *per request* ([Ch 17c §1.2](#content/17c_llm_systems), [Ch 17 §2.7](#content/17_llm)). In practice a single H100 (80 GB) serves a 70B model only at INT4 (FP8 weights alone are 70 GB, leaving ~10 GB for KV); a B200 / B300 holds it at INT8.

Two multipliers people forget:

- **Mixture-of-experts: memory follows *total* parameters, compute follows *active* ones.** DeepSeek-V3 (671B total, 37B active) costs the FLOPs of a 37B model but needs 671 GB of weights even at FP8 — an 8×H100 node (640 GB) cannot hold it, an 8×H200 node can ([Ch 17 §4.8](#content/17_llm)).
- **Training is a different bill: ~16 bytes per parameter** for mixed-precision AdamW (2 weights + 2 gradients + 12 optimizer state) — a 7B model needs 112 GB before activations. FSDP / ZeRO-3 divides that by the number of GPUs; LoRA avoids it by freezing the base ([Ch 17 §3.6](#content/17_llm), [Ch 16 §1.9](#content/16_deep_learning)).

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

**Knobs worth knowing:** chunk **~256–512 tokens** with **50–100 tokens of overlap** ([Ch 28](#content/28_semantic_search)); retrieve 20, keep 3 as the default. With a generous context window, widen it — retrieve 20–50 and let the window hold them rather than squeezing the evidence into three chunks ([Ch 17 §2.7](#content/17_llm)); Ch 28 retrieves 50–100 and keeps ~10. Long context replaces RAG only when the material fits in the window *and* the task needs all of it.

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
![RAG failure modes mapped to their fixes](diagrams/play00_ragfix_ai.png)

| Symptom | Likely cause | Fix |
|---|---|---|
| Retrieves wrong docs | Query and corpus use different vocabulary | **HyDE** — generate hypothetical answer, embed *that* |
| Misses exact-match (IDs, error codes) | Pure vector search | **Hybrid search** (vector + BM25) |
| Top-5 by similarity ≠ top-5 by meaning | No reranker | Add **cross-encoder rerank** of top 20 → 3 |
| Chunk meaningless on its own | Bad chunking | **Contextual chunks** — prepend doc summary; ~256–512 tokens with overlap |
| Wrong answer despite right docs retrieved | Lost-in-the-middle (accuracy is highest for evidence at the start or end of the prompt) | Put the key evidence and the question at the ends; fewer, better-ranked chunks; structured tags |
| LLM hallucinates citations | No grounding instructions | "Quote the document; cite source. If unknown, say so." |
| Slow at scale | Re-embedding on every query | Cache embeddings; serve via ANN index (HNSW) |

### Embedder defaults (November 2026)

Leaders rotate every few months — treat this as a starting shortlist and check the MTEB leaderboard *and* your own eval set.

| Family | When |
|---|---|
| **OpenAI `text-embedding-3-large`** | Hosted, multilingual, strong default (last refreshed in early 2024, as of mid-2026) |
| **Cohere `embed-v4`** | Hosted, multilingual |
| **Voyage `voyage-4-large` / `voyage-3-large`** | Strong paid option, popular for RAG and code |
| **Qwen3-Embedding (up to 8B)** | Apache 2.0, strong all-round open-weight model |
| **BGE-M3** | Open-weight, multilingual, dense + sparse + ColBERT in one model |
| **Cohere Rerank 5.0 (`rerank-v5.0-pro` / `-fast`)** | Managed reranker default |
| **BGE-Reranker v2 / Qwen3-Reranker** | Open-weight rerankers you can self-host |

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
                conversational debate (research)?  → AG2, or Microsoft Agent Framework
                                                     (AutoGen is archived; this is its successor)
                Google Cloud / Agent Platform?     → ADK + Agent Runtime
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
    system_prompt="You are a concise travel assistant.",
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
      ├── On Google Cloud                         → ADK + Agent Runtime (Gemini Enterprise Agent Platform)
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
![Five things breaking, and the fastest fixes](diagrams/play00_diagnose_ai.png)

### "My LLM hallucinates"

```
   Hallucination
      │
      ├── No retrieval? Add RAG.
      ├── Retrieval works but answer ignores it?
      │     → Put the key evidence and the question at the start or end of the prompt, not the
      │       middle (lost-in-the-middle); add a "cite source" instruction
      │     → Use stricter system prompt: "If unsure, say 'I don't know.'"
      ├── Citing wrong docs?
      │     → Add reranker
      │     → Switch to hybrid search
      ├── Wrong even with right docs?
      │     → Check chunk size; chunk may lack context
      │     → Try contextual chunking (prepend doc summary)
      └── Still wrong on a hard task?
            → Reasoning model at a higher effort setting — but still verify the answer
              (run the tests, check the citation): the visible chain of thought is a
              useful trace, not a guaranteed honest explanation (Ch 17 §15.1b)
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
      │     → Long prompts make prefill slow: shorten the prompt, cache the stable prefix
      ├── Total output latency high
      │     → Speculative decoding (vLLM has it; lossless, best at low batch size)
      │     → Smaller model
      │     → Reduce max_tokens; structured outputs cap waste
      ├── Tail latency (p99) bad
      │     → Continuous batching; PagedAttention; chunked prefill so long prompts
      │       do not block everyone; bigger KV cache (FP8 KV, GQA/MLA model)
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
      ├── First win: add a reranker — typically the biggest single gain once the embedder is decent.
      ├── Second: hybrid search (vector + BM25).
      ├── Third: better embedder (check MTEB and your own eval: Qwen3-Embedding, voyage-4, BGE-M3).
      ├── Fourth: smarter chunking (contextual chunks; semantic split).
      ├── Fifth: query rewriting (LLM splits multi-part questions).
      └── If still bad: maybe it's not retrieval — eval the LLM with the *correct* docs.
            If it's still wrong, the failure is generation, not retrieval.
```

---

## P11. Numbers Worth Memorising

| Quantity | Value | Why it matters |
|---|---|---|
| Tokens per English word | ~1.3 (≈ 4 characters or 0.75 words per token) | Estimate tokens from word or character count; code, numbers and other languages cost more, and vendors' tokenizers differ ([Ch 17 §2.2](#content/17_llm)) |
| BF16 bytes per parameter | 2 | Memory math |
| INT4 bytes per parameter | 0.5 | On-device math |
| Training memory, mixed-precision AdamW | 16 bytes / param (2 + 2 + 12) | 7B → 112 GB, 70B → 1.12 TB before activations ([Ch 17 §3.6](#content/17_llm)) |
| Training compute | ≈ 6 · N · D FLOPs | 405B params × 15T tokens ≈ 3.8 × 10²⁵ ([Ch 17 §3.1](#content/17_llm)) |
| Chinchilla ratio | ≈ 20 tokens per parameter | Labs over-train small models: Llama 3 8B saw ≈ 1,900 ([Ch 17 §3.7](#content/17_llm)) |
| Activation checkpointing | ≈ +33% compute (30–40% measured) | Buys most of the activation memory back ([Ch 16 §1.9](#content/16_deep_learning)) |
| KV cache, Llama-3-70B (GQA, FP16) | ~320 KiB per token → 40 GiB (≈ 43 GB) at 128K, per request | Often the binding serving constraint |
| MoE active share | DeepSeek-V3: 37B of 671B (5.5%) | Memory follows total, compute follows active |
| Image token cost | ⌈H/p⌉ · ⌈W/p⌉ — 336 × 336 at p = 14 → 576 tokens | Why video is compressed hard ([Ch 17 §4.9](#content/17_llm)) |
| H100 HBM | 80 GB | Standard production GPU memory |
| B200 HBM | ~180–192 GB (B300: 288 GB) | Blackwell, 2025 |
| TPU v7 Ironwood HBM | 192 GiB; 4,614 FP8 TFLOPS per chip | Google flagship |
| Ironwood pod | 9,216 chips → ~42.5 exaFLOPS (FP8) | Google's 2026 compute story |
| Default learning rate | 3e-4 for small models, falling with size (≈ 8e-5 at 405B) | "Karpathy's constant" |
| Fine-tune LR | 1e-5 to 5e-5 | 10× lower than from-scratch |
| LoRA LR | 2e-4 | 10× higher than full FT |
| LoRA rank `r` | 16 | Sane default |
| Price of a fixed capability | ~13× cheaper per year for the same benchmark score (Epoch AI, Sep 2026: ~47% per quarter) | Architecture decisions follow this ([Ch 20 §20.8](#content/20_2026_landscape)) |
| GPT-3-level quality cost | 60 → 0.06 USD per 1M tokens, Nov 2021 → Nov 2024 (a16z "LLMflation": ~1,000× in 3 years) | The *best* model's price stays roughly flat |
| SWE-bench Verified | Top scores reached the high 80s % before it was retired | Retired by OpenAI in Feb 2026 (flawed tests, contamination). SWE-bench Pro — OpenAI found ~30% of tasks broken and retracted its recommendation on 8 Jul 2026; some labs still report it, so treat scores as rough |
| Reasoning thinking budget | 1K–100K tokens | Controlled per-call |
| Default chunk size for RAG | ~256–512 tokens, 50–100 overlap | Balance precision vs context |
| Top-k for retrieval | 20 → rerank to 3 (50–100 → 10 in Ch 28) | Standard pipeline; widen with a big window |
| Prompt cache discount | about 90–97.5% off the input price (hits billed at 0.025×–0.1× input, depending on model) | Biggest single cost lever |
| EU AI Act | General application 2 Aug 2026; the AI Office's enforcement powers over general-purpose AI start then. High-risk rules were delayed to 2 Dec 2027 and 2 Aug 2028 (Digital Omnibus, Regulation (EU) 2026/1744, in force 27 Jul 2026) | Check the current text before quoting dates |
| Frontier context window | ~1M tokens (GPT-6, Claude, Gemini 4 Argon) | Llama 4 Scout advertises 10M; effective length is shorter |

---

## P12. Interview Soundbites

Short answers to the questions you'll actually be asked — two to four sentences each. Memorise the *shape*; rephrase to fit the conversation.

**"Walk me through training an LLM."**
Curate the data (crawl → filter → deduplicate → mix → decontaminate) → tokenise with BPE → pretrain on next-token prediction on TPU/GPU clusters with BF16 mixed precision and FSDP/ZeRO sharding (compute ≈ 6·N·D) → SFT on instruction data → align with DPO or RLHF, and RLVR/GRPO for reasoning → deploy on vLLM with KV-cache reuse and quantization.

**"Why are reasoning models a big deal?"**
They scale a separate axis — *test-time compute*. On hard math, code and planning, extra thinking tokens can beat a much bigger model (the gains flatten and the bill grows). They are trained with RL on answers a program can check (RLVR/GRPO). Pay only on hard problems; skip them for trivial tasks — and remember the visible reasoning is a useful trace, not a guaranteed honest explanation.

**"How would you fix a hallucinating LLM?"**
RAG with hybrid search and a reranker; structured output with a strict JSON schema; "cite source or say 'I don't know'" instructions; reasoning model on hard cases; eval with Ragas faithfulness on every release.

**"How do you reduce LLM cost?"**
In order: prompt caching (about 90–97.5% off the input price of shared prefixes), model routing (cheap model for easy queries), batch APIs (50% off), smaller embedder, quantization for self-hosted.

**"Why is my fine-tune worse than the base model?"**
Likely catastrophic forgetting or overfitting to format. Mix general data into the tune set, lower LR, fewer epochs, and run held-out evals — don't trust train loss.

**"What's the RAG pipeline you'd build today?"**
Query rewriting → hybrid search (dense + BM25) → cross-encoder rerank (top 20 → 3) → structured prompt with citations → answer. Eval with Ragas.

**"When would you fine-tune vs prompt + RAG?"**
Default: prompt + RAG. Fine-tune only when you need a specific style/format prompts can't capture, when you must run on-device, or when token cost on the hot path dominates.

**"Why is TGI no longer the default in 2026?"**
Hugging Face put it in maintenance mode in December 2025 and points users to vLLM or SGLang. vLLM is the production default — continuous batching, PagedAttention, an OpenAI-compatible API, broad hardware support. Stripe reportedly cut inference cost 73% moving from Hugging Face Transformers to vLLM (a secondary report, not from TGI).

**"How does PagedAttention work in 30 seconds?"**
The KV cache is split into fixed-size blocks, like OS virtual-memory pages, with a per-request block table. Memory is allocated on demand and prefixes can be shared copy-on-write. KV-cache utilisation rises from roughly 20–40% to over 90%, so you fit bigger batches — the vLLM paper reports ~2–4× throughput over earlier servers.

**"Why did SWE-bench Verified go from ~13% to the high 80s — and why did OpenAI stop reporting it?"**
Four compounding factors: better base models, test-time compute, better scaffolds (file IO, test runners, diff review), and RL on agentic traces. But in February 2026 OpenAI found flawed tests and training-data contamination and retired it. It pointed to SWE-bench Pro, where the same models score far lower (Opus 4.7 was reported at about 64% on Pro against 87.6% on Verified) — then on 8 Jul 2026 found ~30% of Pro's tasks broken and retracted that recommendation; some labs still report Pro, so treat its scores as rough. Scaffold matters as much as the model — the same model can score very differently under two harnesses.

**"When does long context replace RAG?"**
When the material fits in the window and the task needs *all* of it — one contract, one paper, one repo slice. For Q&A across thousands of changing, access-controlled docs, retrieval still wins on cost, freshness and citations. Advertised is not effective: accuracy is U-shaped (best at the start and end), needle-in-a-haystack is a smoke test, and RULER-style multi-hop tests show models degrading well before their limit. In practice they combine — retrieve 20–50 chunks and let a big window hold them.

**"What's context engineering?"**
Designing the entire context window — system prompt, retrieved docs, tool outputs, history, memory, layout — not just the user-facing prompt. The wording of the prompt is one slice; the rest decides most of an AI app's quality.

**"What's your default model for a new prototype?"**
A Flash / Sonnet / Luna-tier model — Gemini 3.x Flash, Claude Sonnet 5.5 or GPT-6 Luna — cheap, fast, multimodal, good enough for almost everything. Move to the top tier only when measurably needed; move to open-weight when cost or sovereignty pressure shows up.

**"How would you decide on-device vs cloud?"**
On-device when privacy, latency, billions-of-queries scale, or offline matters. Cloud when you need top-end reasoning, multimodal beyond text+image, real-time external data, or you can't ship a model with the OS.

**"What would you cite as quality benchmarks in 2026?"**
Terminal-Bench 4.1 (CLI agents; since 9 Nov 2026 it re-grades 4.0's tasks with hardened verifiers), OSWorld 2.0 (long computer-use workflows), Humanity's Last Exam and ARC-AGI-3 — saturated or nearly saturated ones (GPQA Diamond at 96.4%, ARC-AGI-2 at 95%, FrontierMath Tiers 1–3 at 95.1% for Claude Fable 5.2 on Epoch AI's hub, 9 Nov 2026, with Tier 4 topped out at 100%) only as history — and SWE-bench Pro only with a caveat: OpenAI retired SWE-bench Verified in Feb 2026 (flawed tests, contamination), then found ~30% of Pro's tasks broken and retracted its recommendation on 8 Jul 2026; some labs still report Pro, so treat its scores as rough. **Not** MMLU or HumanEval — saturated. Always say which harness and which table a score came from ([Ch 20 §20.13](#content/20_2026_landscape)).

**"What does FlashAttention change?"**
Not the maths — it is *exact* attention. It streams K and V through the GPU's fast on-chip memory in tiles with an online softmax, so the n × n score matrix is never written to slow HBM: memory falls from O(n²) to O(n) and it runs faster (the paper measured ~3× faster GPT-2 training at 1K tokens) because attention is memory-bound. FLOPs stay O(n²) ([Ch 17 §2.4](#content/17_llm)).

**"What makes long context hard?"**
Four things: attention compute grows as n², the KV cache grows with n (≈ 320 KiB per token for a 70B GQA model, so 40 GiB ≈ 43 GB at 128K), the model may never have trained at that length (RoPE scaling plus staged long-context training), and lost-in-the-middle. Attention sinks — keep the first ~4 tokens plus a rolling window — give a stable stream with a fixed cache, but not a longer memory ([Ch 17 §2.7](#content/17_llm)).

**"Explain mixture of experts — and what goes wrong when you train one."**
Replace each feed-forward block with N experts and a router that sends every token to its top-k, blending their outputs by softmax gates. It stores a lot (total parameters) but computes a little (active ones — DeepSeek-V3 uses 37B of 671B). Left alone the router collapses onto a few experts, so you add an auxiliary load-balancing loss (or DeepSeek's aux-loss-free bias) and cap each expert with a capacity factor, dropping overflow tokens. It saves compute, not memory, and pays off at large serving batches ([Ch 17 §4.8](#content/17_llm)).

**"How does an LLM 'see' an image?"**
Cut the image into patches and embed them as tokens. Either a pretrained vision encoder plus a small projector feeds them into the LLM's embedding space (bolt-on), or one Transformer is trained on interleaved text, image and audio from the start (native / early fusion). The cost is token count: a 336 × 336 image with 14-pixel patches is 576 tokens, and video is frames × tokens per frame ([Ch 17 §4.9](#content/17_llm)).

**"Is in-context learning real learning? Are emergent abilities real?"**
ICL changes behaviour with frozen weights — partly pattern-copying (induction heads), partly recognising which task this is, and in bigger models partly learning a new mapping; it is sensitive to example order and format. "Emergence" is partly a measurement artefact: if per-token accuracy p improves smoothly, an exact-match score p^k looks like a sudden jump, and a smooth metric shows steady progress ([Ch 17 §3.9](#content/17_llm)).

**"Can you trust a reasoning model's chain of thought?"**
As a monitoring signal, yes; as an explanation, no. In Anthropic's hint experiments Claude 3.7 Sonnet and DeepSeek-R1 admitted a hint they had demonstrably used only about 25% and 39% of the time, and training against "bad thoughts" taught models to hide their intent. Verify answers independently ([Ch 17 §15.1b](#content/17_llm)).

**"What goes into a pretraining dataset?"**
Crawl → extract text → language ID → heuristic then model-based quality filters → near-duplicate removal (MinHash + LSH) → PII and safety filtering → domain mixing → synthetic data → decontamination against benchmarks → ordering and a final high-quality "annealing" phase. Data quality moves the result more than architecture tweaks ([Ch 17 §3.1b](#content/17_llm)).

**"My 7B model does not fit on one GPU for training — what do you do?"**
Count first: mixed-precision AdamW is 16 bytes per parameter, so 112 GB. Shard the states with FSDP / ZeRO-3 or freeze the base with LoRA; shrink activations with a smaller micro-batch plus gradient accumulation (effective batch = micro-batch × steps × GPUs, each loss ÷ k) and activation checkpointing (about +33% compute). Evaluate an EMA of the weights if you train a diffusion model or GAN ([Ch 16 §1.9](#content/16_deep_learning), [Ch 17 §3.6](#content/17_llm)).

**"How do you initialise a deep network — and which activation do modern LLMs use?"**
Keep the signal's variance constant through depth: He init (2/fan_in) for ReLU, Xavier for tanh. Transformers use std 0.02, zero biases and scale each residual branch's output projection by 1/√(2L), so the residual stream does not grow with depth. Modern LLMs use gated SwiGLU with the hidden width cut to 8d/3, so the parameter count matches a plain FFN ([Ch 16 §1.8](#content/16_deep_learning)).

**"Why are MobileNets cheap?"**
A depthwise-separable convolution splits one convolution into a per-channel spatial filter and a 1×1 channel mixer. Cost falls to 1/C_out + 1/K² of the original — about 8–9× fewer multiply-adds for 3×3 filters, for roughly one point of ImageNet accuracy in MobileNet v1 ([Ch 16 §2.6](#content/16_deep_learning)).

**"How would you make an image model robust to adversarial examples?"**
Tiny, aligned nudges (FGSM: x + ε·sign(∇ₓL)) add up like n while random noise adds up like √n, so passing a random-noise test proves nothing. Adversarial training — PGD attacks inside the training loop, about K+1× the cost and some clean accuracy lost — is the reliable defence; randomized smoothing gives a certified radius; beware gradient masking ([Ch 16 §2.7](#content/16_deep_learning)).

---

## P13. Must-Know Checklist and Code Ladder

The last-week page. Tracks, the L1–L4 depth ladder and the full 18-rung coding ladder live in the **Section map** at the top of [Ch 16](#content/16_deep_learning); this is the short version. The rule that saves the most time: **L2 on every ★★★ topic, L3 only on the ladder below, L1 on everything else** — the "Depth" column is the tag on each topic's heading in the chapter.

### Must-know topics — where each one lives

| Topic | Depth | Read | Runnable code |
|---|---|---|---|
| Weight init and activations (He / Xavier, std 0.02, SwiGLU) | L2 | [Ch 16 §1.8](#content/16_deep_learning) | 20-layer signal experiment; SwiGLU parameter count |
| Gradient accumulation, checkpointing, EMA; the 16-byte budget | L2 | [Ch 16 §1.9](#content/16_deep_learning) | Accumulation = big batch; memory table; EMA |
| Depthwise-separable convs, MobileNet | L2 | [Ch 16 §2.6](#content/16_deep_learning) | Conv vs separable cost |
| Adversarial examples (FGSM, PGD, adversarial training) | L1 | [Ch 16 §2.7](#content/16_deep_learning) | FGSM on a linear model |
| FlashAttention (tiles + online softmax) | L2 | [Ch 17 §2.4](#content/17_llm), [Ch 29 §24.5](#content/29_gpus_tpus_infrastructure) | Online softmax in NumPy |
| Long context, attention sinks, needle-in-a-haystack vs RULER | L2 | [Ch 17 §2.7](#content/17_llm) | KV-cache calculator; sinks |
| The pretraining data pipeline (filter, dedupe, mix, decontaminate) | L2 | [Ch 17 §3.1b](#content/17_llm) | MinHash / LSH; decontamination |
| In-context learning vs emergent abilities | L2 | [Ch 17 §3.9](#content/17_llm) | Few-shot prompt builder; p^k emergence |
| Multimodal LLMs (patches → tokens, bolt-on vs native) | L2 | [Ch 17 §4.9](#content/17_llm), [Ch 16 §2.4](#content/16_deep_learning), [Ch 16 §4.3](#content/16_deep_learning) | Image → tokens and token cost |
| MoE routing, load balancing, capacity factor | L2 (layer: L3) | [Ch 17 §4.8](#content/17_llm), [Ch 16 §6.1](#content/16_deep_learning) | A MoE layer in NumPy |
| Reasoning-trace faithfulness | L2 | [Ch 17 §15.1b](#content/17_llm) | — |
| Alignment family and reward hacking | L2 | [Ch 17 §3.5c](#content/17_llm) | Reward-hacking sweep |

### The coding ladder — in the order to practise it

These are the problems candidates report implementing from scratch in 20–40 minutes; work top-down, because each rung reuses the one above.

| Rungs | Implement | Where |
|---|---|---|
| 1–5 · warm-ups | BPE · sinusoidal positions · RoPE · RMSNorm · stable softmax | [Ch 17 §2.2](#content/17_llm), [Ch 16 §3.4](#content/16_deep_learning), [Ch 16 §1.5](#content/16_deep_learning), [Ch 17 §1.4](#content/17_llm) |
| 6–10 · the realistic bar | Scaled dot-product attention · multi-head · grouped-query · KV cache · sampling (temperature, top-k, top-p) | [Ch 17 §2.4](#content/17_llm), [Ch 17c §1.2](#content/17c_llm_systems), [Ch 17 §2.6](#content/17_llm) |
| 11–13 | Sliding-window attention · LoRA layer · KL divergence | [Ch 17 §2.4](#content/17_llm), [Ch 17b §9.4](#content/17b_llm_applications), [Ch 17 §1.4](#content/17_llm) |
| 14–18 · research and infra roles | DPO loss · MoE layer · speculative decoding · continuous batching · GRPO | [Ch 17 §3.5](#content/17_llm), [Ch 17 §4.8](#content/17_llm), [Ch 17c §2.5](#content/17c_llm_systems), [Ch 17c §2.1](#content/17c_llm_systems), [Ch 17 §3.5b](#content/17_llm) |

**Only a weekend?** Rungs 6, 7, 9 and 10 — attention, multi-head, KV cache, sampling — cover most reported LLM coding rounds. Say tensor shapes out loud as you go; shape errors are the commonest way to lose a correct answer.

---

## Key Takeaways

```
╔════════════════════════════════════════════════════════════════════╗
║  DEEP LEARNING & LLMs PLAYBOOK — FIELD GUIDE                       ║
╠════════════════════════════════════════════════════════════════════╣
║  PIPELINE                                                          ║
║    • Data (crawl→filter→dedupe→mix) → tokenise (BPE) →             ║
║      pretrain (next-token) → post-train (SFT → DPO/RLHF/RLAIF;     ║
║      RLVR + GRPO for reasoning) → serve                            ║
║    • Sketch the train/inference map; it answers 80%                ║
╠════════════════════════════════════════════════════════════════════╣
║  MODEL CHOICE                                                      ║
║    • Default prototype: a Flash / Sonnet / Luna-tier model         ║
║    • Escalate to the top tier only when measurably needed          ║
║    • Reasoning models trade test-time compute for IQ;              ║
║      pay only on hard math/code/planning                           ║
║    • MoE: memory = total params, compute = active params           ║
║    • On-device: privacy, latency, scale, offline                   ║
╠════════════════════════════════════════════════════════════════════╣
║  TRAINING DEFAULTS                                                 ║
║    • LR 3e-4 (falls with model size); fine-tune 1e-5–5e-5;         ║
║      LoRA 2e-4, r=16                                               ║
║    • AdamW + warmup + cosine; BF16 mixed precision; clip 1.0       ║
║    • Init: He/Xavier; Transformers std 0.02, residual ×1/√(2L)     ║
║    • Won't fit? 16 B/param: accumulate, checkpoint, shard/LoRA     ║
║    • Won't converge? lower LR, check data/labels first             ║
║    • Fine-tune last: prompt + RAG beats it by default              ║
╠════════════════════════════════════════════════════════════════════╣
║  SERVING (COST/LATENCY)                                            ║
║    • vLLM is the 2026 default (continuous batching, paged KV)      ║
║    • Cut cost in order: prompt cache (90–97.5% off input) → model  ║
║      routing → batch API (50%) → small embedder → quantize         ║
║    • KV cache ≈ 320 KiB/token (70B GQA) — often the limit          ║
║    • BF16 = 2 bytes/param; INT4 = 0.5 — size your GPU              ║
╠════════════════════════════════════════════════════════════════════╣
║  RAG & LONG CONTEXT                                                ║
║    • Rewrite → hybrid (dense+BM25) → rerank 20→3 → cite            ║
║    • Chunk ~256–512 tokens; eval faithfulness (Ragas)              ║
║    • Long context replaces RAG only when it all fits and all       ║
║      of it is needed; advertised window ≠ effective window         ║
╠════════════════════════════════════════════════════════════════════╣
║  AGENTS & DIAGNOSTICS                                              ║
║    • Build agents only for multi-step, tool-using tasks            ║
║    • Loops forever → step cap, better stop criteria                ║
║    • Hallucinates → RAG + JSON schema + 'cite or IDK'              ║
║    • Visible reasoning is a trace, not proof — verify answers      ║
║    • Fine-tune worse → forgetting/overfit: mix data, lower LR      ║
╠════════════════════════════════════════════════════════════════════╣
║  BENCH IN 2026: Terminal-Bench 4.1, OSWorld 2.0, HLE, ARC-AGI-3 —  ║
║  NOT MMLU/HumanEval/GPQA. SWE-bench Verified retired (Feb 2026);   ║
║  Pro ~30% broken (OpenAI, Jul 2026) — treat its scores as rough    ║
╚════════════════════════════════════════════════════════════════════╝
```

---

**See also:** [Ch 14 Neural Networks](#content/14_neural_networks) · [Ch 16 Deep Learning Reference](#content/16_deep_learning) · [Ch 17 LLMs](#content/17_llm) · [Ch 17b LLM Applications](#content/17b_llm_applications) · [Ch 17c LLM Systems](#content/17c_llm_systems) · [Ch 18 AI Agents](#content/18_ai_agents) · [Ch 19 AI Frameworks](#content/19_ai_frameworks) · [Ch 20 The 2026 AI Landscape](#content/20_2026_landscape) · [Ch 00 Cheat Sheet](#content/00_quick_reference_cheat_sheet)
