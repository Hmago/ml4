# Chapter 17c — LLM Systems: Serving, Scaling & Measuring

> "Training is a science project. Serving is a business." — the difference between a model that works and a product that ships.

**How to read this chapter:** every topic uses the same seven blocks — *in one line*, *why it exists*, a picture, the mechanism with real numbers, when to use it, the sentence you say in an interview, and the follow-up they will ask next. Read the first two blocks of every topic; go deeper only where your target level says to.

---

## Where you are

**Layer: SYSTEMS — *how you run it at scale*.** Part of **Deep Learning & LLMs** (Ch 16–20). This is the third of the three LLM chapters:

| Chapter | Question it answers |
|---|---|
| [**Ch 17** — How They Work](#content/17_llm) | *How does it work inside?* |
| [**Ch 17b** — How You Use Them](#content/17b_llm_applications) | *How do I build with it?* |
| **Ch 17c (you are here)** | *How do I run it at scale?* |

| | |
|---|---|
| **Read this after** | [Ch 17 §2 (the Transformer)](#content/17_llm) — this chapter assumes you know what a KV cache *is* |
| **On Track A** (interview) | **Essential.** This is the material that separates mid-level from senior in 2026 loops |
| **On Track C** (shipping) | Read Parts 1–3 and 5; they decide your cloud bill |
| **On Track B** (depth) | Read straight through |

**Full section map, tracks and the L1–L4 depth ladder → [Ch 16 — Deep Learning Reference](#content/16_deep_learning).**

---

## What You'll Learn

After this chapter you will be able to:

- Explain **prefill vs decode** and use it to diagnose any inference performance problem
- Compute a **KV cache budget** from first principles, turn it into "how many requests fit on this GPU", and explain why GQA and MLA exist
- Define the four serving metrics — **TTFT, TPOT/ITL, throughput and goodput** — and say which optimisations help which, without confusing them
- Describe **continuous batching** well enough to implement it
- Work out when **speculative decoding** pays for itself, and why it does not change the output
- Say how to **split a model across GPUs for serving** — tensor, pipeline or expert parallelism, or more replicas — and what each one buys
- Choose between **weight-only and W8A8 quantization** and justify it
- Design an **evaluation stack** with golden sets, regression tests and LLM-as-judge
- Do the **cost arithmetic** for self-hosting versus an API, out loud, in an interview

---

## Table of Contents

| Part | Topic |
|------|-------|
| 1 | The Two Phases of Inference |
| 2 | Making Decode Fast |
| 3 | Making the Model Smaller |
| 4 | Measuring — Evaluation That Survives Production |
| 5 | Putting It Together — Stack, Cost, Failure Modes |

---

## How this chapter fits

This chapter owns the **software** layer of running an LLM: the scheduler, the cache, the batching policy, the eval harness. It deliberately does **not** re-explain the hardware or the training-cluster material, which already has a home.

| Topic | Its home | Why it is not here |
|---|---|---|
| GPU architecture, tensor cores, memory hierarchy, CUDA | [Ch 29 §24.1–24.4](#content/29_gpus_tpus_infrastructure) | Hardware layer |
| Distributed training — DDP, FSDP, ZeRO, tensor / pipeline / sequence parallelism, **Ring Attention** | [Ch 29 §24.6–24.6c](#content/29_gpus_tpus_infrastructure) | Training-cluster layer |
| Gradient checkpointing, mixed precision, gradient accumulation, Flash Attention, `torch.compile` | [Ch 29 §24.3, §24.5](#content/29_gpus_tpus_infrastructure) | Training-throughput layer |
| TPUs, JAX, cloud GPU pricing, emerging silicon | [Ch 29 §24.7–24.11](#content/29_gpus_tpus_infrastructure) | Hardware layer |
| Attention variants (MHA / MQA / GQA / MLA) — the *mechanism* | [Ch 17 §2.4](#content/17_llm) | Model layer. Here we only cover their **serving consequences** |
| Quantization, speculative decoding, PagedAttention — a short hardware-side summary | [Ch 29 §24.9](#content/29_gpus_tpus_infrastructure) | Ch 29 gives the one-paragraph hardware view; **this chapter is their home** |
| Which inference server to pick — vLLM, SGLang, TensorRT-LLM and friends | [Ch 19 §19.11](#content/19_ai_frameworks) | Tooling layer; this chapter explains the ideas those servers implement |
| Prompting, RAG, fine-tuning, APIs, cost, safety | [Ch 17b — LLM Applications](#content/17b_llm_applications) | Application layer |
| Agents — tools, MCP, patterns, memory | [Ch 18 — AI Agents](#content/18_ai_agents) | Agent layer |
| Vector index internals — HNSW, IVF-PQ, hybrid search | [Ch 28 — Semantic Search](#content/28_semantic_search) | Retrieval layer |
| Agent-specific evaluation and telemetry | [Ch 18b §18.12](#content/18b_agents_in_production) | Agent layer |

> If you only have time for one thing: **Part 1**. Almost every inference question in an interview is a prefill-vs-decode question wearing a disguise.

---

# PART 1 — THE TWO PHASES OF INFERENCE

---

## 1.1 Prefill vs Decode ★★★ `L3`

**In one line:** generating text has two completely different phases — reading your prompt (fast, parallel, compute-hungry) and writing the answer (slow, one token at a time, memory-hungry) — and almost every optimisation helps exactly one of them.

![Infographic comparing prefill and decode: prefill reads all prompt tokens in one parallel pass, fills the KV cache and is compute-bound (sets TTFT); decode generates one token per step, re-reads all weights from HBM and is bandwidth-bound (sets TPOT). Shows the decode ceiling formula, a 70B model on H100s at 3,350 GB/s giving about 48 tokens/s in FP16 on 2 GPUs and about 96 tokens/s in INT4 on 1 GPU, batching from 1 to 96 raising total throughput from 95 to 4,785 tokens/s, and which lever to pick per workload.](diagrams/llm17c_info_prefill_vs_decode_ai.png)

![Prefill vs decode: two opposite bottlenecks](diagrams/llm17cx_prefill_vs_decode_ai.png)

<details>
<summary><strong>Read as text</strong> — the two phases, the decode ceiling and why batching helps</summary>

> **Maths in one line:** `decode ceiling (tokens/s per stream) ≈ memory bandwidth per GPU ÷ bytes each GPU must read per token` — at batch size 1 every weight is read once for every generated token, so bandwidth, not arithmetic, sets the speed limit.

**Why it exists.** People try to make "inference" faster as if it were one thing. It isn't. A change that doubles prefill speed can leave your users' experience completely unchanged, because they were waiting on decode. Until you know which phase you are bottlenecked on, every optimisation is a guess.

**Picture.**

```
PROMPT: "Summarise this contract:  <2,000 tokens of contract>"

┌──────────────── PHASE 1: PREFILL ────────────────┐
│  All 2,000 prompt tokens go through the model    │
│  AT ONCE, in parallel — like one big matrix      │
│  multiply.                                       │
│                                                  │
│  [t1][t2][t3] ............... [t2000]            │
│    │   │   │                    │                │
│    └───┴───┴────────┬───────────┘                │
│                     ▼                            │
│         one forward pass, huge batch             │
│         → fills the KV cache                     │
│         → emits the FIRST token                  │
│                                                  │
│  Bottleneck: COMPUTE (the GPU's math units)      │
│  Determines: TTFT (time to first token)          │
└──────────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────── PHASE 2: DECODE ─────────────────┐
│  One token at a time. Each new token must wait   │
│  for the previous one — it cannot be parallelised│
│                                                  │
│  [t2001] → [t2002] → [t2003] → ... → [t2200]     │
│                                                  │
│  Each step: read the ENTIRE model's weights      │
│  from memory to produce ONE token.               │
│                                                  │
│  Bottleneck: MEMORY BANDWIDTH                    │
│  Determines: TPOT (time per output token)        │
└──────────────────────────────────────────────────┘
```

**The mechanism.** Here is the part that makes it click. In decode, at batch size 1, the GPU must stream **every weight in the model** out of its HBM (high-bandwidth memory) to produce **one single token**. The arithmetic is trivial; the data movement is enormous. So the theoretical ceiling is set purely by memory bandwidth:

$$\text{max tokens/sec} = \frac{\text{per-GPU bandwidth}}{\text{bytes of weights held per GPU}}$$

Note *per GPU*. A 70B model in FP16 is 140 GB (70 billion parameters × 2 bytes), which does not fit on a single 80 GB H100 — it needs at least two, with tensor parallelism splitting the weights. Each GPU then holds 70 GB and both stream **concurrently**, so with the H100's 3.35 TB/s:

$$\frac{3350 \text{ GB/s}}{70 \text{ GB}} \approx 48 \text{ tokens/sec}$$

Quantize the same model to INT4 (35 GB) and it fits on **one** H100:

$$\frac{3350 \text{ GB/s}}{35 \text{ GB}} \approx 96 \text{ tokens/sec}$$

**That ceiling is hard for a single request, no matter how fast the GPU's math units are.** You cannot compute your way out of it. This single calculation explains why:

- Batching helps enormously (the same weight read now serves 64 requests instead of 1)
- Quantization helps decode (fewer bytes to move — INT4 reads a quarter of the FP16 bytes, which is why one GPU at INT4 beats two at FP16 above)
- Buying a GPU with more FLOPs but the same bandwidth does nothing for decode — and the reverse works: the H200 has the H100's compute but 4.8 TB/s instead of 3.35 TB/s, so it decodes about 1.4× faster ([Ch 29 §24.1](#content/29_gpus_tpus_infrastructure))
- Adding a second GPU with tensor parallelism helps decode, because bandwidth adds up
- Speculative decoding helps (it produces several tokens per weight read, §2.5)

> **Watch the units in an interview.** Candidates routinely divide total model bytes by *one* GPU's bandwidth and quote a number that is 2–8× too pessimistic. Always state how many GPUs the weights are sharded across.

**Two things the simple ceiling leaves out.** First, every decode step also reads the **KV cache** (§1.2) of every sequence in the batch, and that read grows with context length and batch size — one 128K-token request on a 70B model carries about 43 GB of cache, more than the INT4 weights. Second, **batching turns one weight read into many tokens.** An FP16 weight is 2 bytes and takes part in about 2 FLOPs (a multiply and an add) per sequence, so each byte read feeds roughly 1 FLOP per sequence in the batch. An H100 can do 989 TFLOPS ÷ 3.35 TB/s ≈ **295 FLOPs in the time it reads one byte**, so decode would only become compute-bound at a batch of roughly 300 (about 150 with FP8 weights, where each byte feeds 2 FLOPs) — and because every extra sequence also adds KV-cache reads, real decode stays memory-bound at any batch you can fit in memory.

</details>

**Run it yourself** — the ceiling, the classic unit slip, and what batching does (FP8 weights on 2 H100s, every sequence holding 2,048 tokens of context):

```python
# Decode ceiling: every decode step streams the weights (and every KV cache) out of HBM
BW, PEAK = 3.35e12, 989e12          # one H100 SXM: HBM bytes/s and dense BF16 FLOP/s (Ch 29)
PARAMS = 70e9                        # a Llama-3-70B-class model
KV_PER_TOKEN = 327_680               # bytes of KV cache per context token, FP16 GQA (§1.2)

def step_time(gpus, bytes_per_param, batch=1, ctx=0):
    weights = PARAMS * bytes_per_param / gpus        # each GPU streams only its own shard
    kv = batch * ctx * KV_PER_TOKEN / gpus           # ...plus the cache of every sequence
    flops = 2 * PARAMS * batch / gpus                # about 2 FLOPs per weight per token
    t_mem, t_math = (weights + kv) / BW, flops / PEAK
    return max(t_mem, t_math), t_mem / t_math

print("One stream, short context:")
for name, gpus, bpp in [("FP16, sharded over 2 GPUs", 2, 2), ("INT4, fits on 1 GPU", 1, 0.5)]:
    t, _ = step_time(gpus, bpp)
    print(f"  {name:26s}{PARAMS * bpp / gpus / 1e9:4.0f} GB per GPU -> {1 / t:5.1f} tokens/s")
slip = BW / (PARAMS * 2)                             # all 140 GB divided by ONE GPU's bandwidth
print(f"  The slip (140 GB / one GPU's bandwidth): {slip:.1f} tokens/s, 2x too pessimistic")
assert round(1 / step_time(2, 2)[0]) == 48 and round(1 / step_time(1, 0.5)[0]) == 96

print("\nBatching: FP8 weights on 2 GPUs, every sequence holds 2,048 tokens of context")
print(f"{'batch':>5}{'step ms':>9}{'tok/s per user':>16}{'tok/s total':>13}{'memory/math':>13}")
for b in [1, 8, 32, 64, 96]:
    t, ratio = step_time(2, 1, b, 2048)
    print(f"{b:5d}{t * 1e3:9.1f}{1 / t:16.1f}{b / t:13,.0f}{ratio:12.1f}x")

ridge = PEAK / BW                                    # FLOPs the GPU can do per byte it reads
print(f"\nH100: {ridge:.0f} FLOPs per byte read. A weight byte feeds 1 FLOP per sequence in FP16, 2 in FP8,")
print(f"so even with zero KV reads decode stays memory-bound up to a batch of ~{ridge:.0f} (FP16) or ~{ridge / 2:.0f} (FP8).")
```

**Output:**

```
One stream, short context:
  FP16, sharded over 2 GPUs   70 GB per GPU ->  47.9 tokens/s
  INT4, fits on 1 GPU         35 GB per GPU ->  95.7 tokens/s
  The slip (140 GB / one GPU's bandwidth): 23.9 tokens/s, 2x too pessimistic

Batching: FP8 weights on 2 GPUs, every sequence holds 2,048 tokens of context
batch  step ms  tok/s per user  tok/s total  memory/math
    1     10.5            94.8           95       149.0x
    8     11.2            88.9          711        19.9x
   32     13.7            73.2        2,344         6.0x
   64     16.9            59.3        3,796         3.7x
   96     20.1            49.8        4,785         3.0x

H100: 295 FLOPs per byte read. A weight byte feeds 1 FLOP per sequence in FP16, 2 in FP8,
so even with zero KV reads decode stays memory-bound up to a batch of ~295 (FP16) or ~148 (FP8).
```

<details>
<summary><strong>Read as text</strong> — continued: reading the batching table, when each phase matters and the interview answer</summary>

Read the batching table top to bottom: going from 1 to 96 sequences multiplies total throughput about 50× while each user's speed falls only from 95 to 50 tokens/s — that is the throughput-versus-latency trade-off of §1.3. The last column is how many times longer the memory traffic takes than the maths: 149× at batch 1, still 3× at batch 96 — the step is limited by bytes moved, not by FLOPs, all the way.

Prefill is the mirror image. Those 2,000 prompt tokens are processed as one large matrix multiplication, so every weight read is reused 2,000 times — far past the ~295 FLOPs per byte needed to keep the math units busy. Prefill is **compute-bound**.

**When each one matters.**

| Your workload | Dominated by | Optimise |
|---|---|---|
| Long documents, short answers (summarise, classify, extract) | **Prefill** | Chunked prefill, prefix caching, W8A8/FP8, more FLOPs |
| Short prompts, long answers (chat, code generation, agents) | **Decode** | Continuous batching, quantization, speculative decoding, GQA |
| Reasoning models (thousands of hidden "thinking" tokens before the answer) | **Decode** | Same as above — the thinking tokens are decode tokens the user waits for |
| RAG (big retrieved context, medium answer) | Both — usually prefill first | Prefix-cache the system prompt; measure before guessing |

**Say this in an interview:**
> "Inference has two phases with opposite bottlenecks. Prefill processes the whole prompt in parallel — it's compute-bound and sets TTFT. Decode generates one token at a time and has to re-read the entire model from memory for each token — it's memory-bandwidth-bound and sets TPOT. A 70B in FP16 is 140 GB, so it's sharded over two H100s; each streams 70 GB per token at 3.35 TB/s, which caps a single stream near 48 tokens per second. Quantize to INT4 and it fits on one GPU at 35 GB, roughly doubling that. Either way you can't add FLOPs to fix it — you reduce bytes, batch, or speculate."

**They will then ask:** *"So how do you get past that ceiling?"*
You don't — not for one request on fixed hardware. You either (a) reduce bytes moved via quantization, (b) amortise the weight read across many concurrent requests via batching, (c) produce more than one token per weight read via speculative decoding, or (d) shard across more GPUs so aggregate bandwidth rises. Those are the levers, and they compose.

</details>

---

## 1.2 The KV Cache, With Real Numbers ★★★ `L3`

**In one line:** the KV cache stores the attention keys and values for every token you have already processed, so each new token costs one step of work instead of re-reading the whole conversation — and it is usually the thing that runs you out of GPU memory.

![Infographic on the KV cache budget: formula KV bytes = 2 x layers x KV heads x head_dim x tokens x bytes per value; Llama-3-70B with GQA in FP16 stores 327,680 bytes = 320 KiB per token, so one request needs 1.25 GiB at 4K, 2.5 GiB at 8K, 10 GiB at 32K and 40 GiB at 128K, more than the 35 GB INT4 weights. On two H100s with 144 GiB usable, FP16 weights leave room for 5 requests of 8K tokens, FP8 weights for 31 and FP8 weights plus FP8 cache for 63. Table of numbers cached per token per layer: MHA 16,384, GQA 2,048, MQA 256, MLA 576.](diagrams/llm17c_info_kv_cache_budget_ai.png)

<details>
<summary><strong>Read as text</strong> — the formula, Llama-3-70B worked out and what each attention variant caches</summary>

> **Maths in one line:** `KV bytes = 2 × layers × kv_heads × head_dim × tokens × bytes_per_value` — every layer keeps one key and one value vector (the 2) per KV head for every token so far, so the cache grows in a straight line with context length *and* with the number of concurrent requests.

**Why it exists.** Without it, generating token 500 means recomputing the keys and values of tokens 1–499 from scratch, and the total work would grow with the *square* of the output length. The cache trades memory for time. The trouble is how much memory.

**The mechanism — the formula worth memorising.**

$$\text{KV bytes} = 2 \times L \times H_{kv} \times d_h \times S \times b$$

| Symbol | Meaning |
|---|---|
| 2 | one tensor for K, one for V |
| $L$ | number of layers |
| $H_{kv}$ | number of **key/value** heads (not query heads) |
| $d_h$ | dimension per head |
| $S$ | sequence length (tokens so far) |
| $b$ | bytes per element (2 for FP16/BF16, 1 for FP8) |

> **Units.** KV-cache sizes come out as round numbers in binary units — 1 KiB = 1,024 bytes, 1 GiB = 2³⁰ bytes ≈ 1.07 GB — so this chapter quotes them that way (matching the KV-cache program in [Ch 17 §2.4](#content/17_llm)). Weight sizes stay decimal: 70B parameters × 2 bytes = 140 GB. The 7 % gap never changes a design decision, but say which one you mean.

**Worked example — Llama-3-70B** (Llama 3, 3.1 and 3.3 70B share the shape in their `config.json`: $L=80$, 64 query heads, $d_h=128$; FP16 so $b=2$):

*If it used plain multi-head attention* ($H_{kv} = 64$, one KV head per query head):

$$2 \times 80 \times 64 \times 128 \times 2 = 2{,}621{,}440 \text{ bytes} = \textbf{2.5 MiB per token}$$

At an 8,192-token context that is **20 GiB for a single request**. Ten concurrent users would need 200 GiB of KV cache — more than two H100s hold, before you have even loaded the model.

*With grouped-query attention* ($H_{kv} = 8$, which is what Llama 3 actually uses):

$$2 \times 80 \times 8 \times 128 \times 2 = 327{,}680 \text{ bytes} = \textbf{320 KiB per token}$$

At 8,192 tokens: **2.5 GiB per request**. An 8× reduction — exactly the saving GQA was designed to buy.

| Context length | KV cache per request (Llama-3-70B, GQA, FP16) |
|---|---|
| 4K | 1.25 GiB |
| 8K | 2.5 GiB |
| 32K | 10 GiB |
| 128K | 40 GiB |

> **Note the shape of that table.** At 128K context the KV cache of **one** request (40 GiB ≈ 43 GB) is already bigger than the INT4 weights (35 GB) and well over half the FP8 weights (70 GB). This is why "at long context the KV cache outweighs the model" is now a standard interview remark, and why KV-cache quantization and offload (§3.2) became a topic.

**The serving consequences of attention variants.** The mechanisms of MHA, MQA, GQA and MLA live in [Ch 17 §2.4](#content/17_llm); what matters *here* is what each one does to that formula. Numbers below are per token per layer, using Llama-3-70B's shape (64 query heads of size 128) for the first three rows:

| Variant | What is cached | Numbers per token per layer | Quality cost | Used by |
|---|---|---|---|---|
| **MHA** — multi-head | K and V for every head ($H_{kv} = H$) | 2 × 64 × 128 = 16,384 | None (baseline) | GPT-2, GPT-3, Llama 2 7B/13B |
| **MQA** — multi-query | one shared K/V head ($H_{kv} = 1$) | 2 × 1 × 128 = 256 (÷ 64) | Noticeable | PaLM, Falcon-7B |
| **GQA** — grouped-query | one K/V head per group ($H_{kv} = H/g$) | 2 × 8 × 128 = 2,048 (÷ 8) | Near zero | Llama 3, Mistral, Qwen3, most open models of 2026 |
| **MLA** — multi-head latent | one compressed latent vector, expanded into K and V when needed | 512 + 64 = 576 in DeepSeek-V3, vs 32,768 for MHA of its shape (÷ 57) | DeepSeek reports on par with MHA or better | DeepSeek-V2/V3, Kimi K2 |

Two serving facts fall out of this. **Mixture-of-experts does not shrink the cache** — the cache depends on attention, not on experts, so a 235B MoE with 4 KV heads (Qwen3-235B-A22B) needs *less* cache per token than a dense 70B with 8. And **the cache, not the weights, usually sets your batch size**: the program below turns per-token bytes into "how many requests fit".

</details>

**Run it yourself** — per-token cache for four real configurations (layer and head counts from each model's `config.json` on Hugging Face), then how many 8K-token Llama-3.3-70B requests fit next to the weights:

```python
# KV-cache size for real model configs, and how many requests fit beside the weights
GiB = 2 ** 30
models = {                                   # (layers, KV heads, head_dim) from each config.json
    "Llama-3.1-8B":    (32, 8, 128),
    "Llama-3.3-70B":   (80, 8, 128),
    "Qwen3-235B-A22B": (94, 4, 128),         # MoE: 235B weights, yet only 4 KV heads
}

def kv_bytes(layers, kv_heads, head_dim, tokens, nbytes=2):     # nbytes=2 -> FP16/BF16 cache
    return 2 * layers * kv_heads * head_dim * tokens * nbytes   # 2 = one K and one V

print(f"{'model':20s}{'KiB/token':>10s}{'8K request':>12s}{'128K request':>14s}")
for name, cfg in models.items():
    print(f"{name:20s}{kv_bytes(*cfg, 1) / 1024:10.0f}{kv_bytes(*cfg, 8192) / GiB:8.2f} GiB"
          f"{kv_bytes(*cfg, 131072) / GiB:10.1f} GiB")
mla = 61 * (512 + 64) * 2                    # DeepSeek-V3 MLA: one 576-number latent per layer
print(f"{'DeepSeek-V3 (MLA)':20s}{mla / 1024:10.1f}{mla * 8192 / GiB:8.2f} GiB{mla * 131072 / GiB:10.1f} GiB")
assert kv_bytes(80, 8, 128, 1) == 327_680 and kv_bytes(80, 8, 128, 131072) == 40 * GiB

# Llama-3.3-70B: count an "80 GB" H100 as 80 GiB (it reports ~79.6); vLLM lets the engine use 90 % of it
print("\nLlama-3.3-70B, 8K-token requests that fit:")
for name, gpus, w_bytes, kv_nbytes in [("FP16 weights on 2xH100", 2, 2, 2),
                                       ("FP8 weights on 2xH100", 2, 1, 2),
                                       ("INT4 weights on 1xH100", 1, 0.5, 2),
                                       ("FP8 weights + FP8 KV, 2xH100", 2, 1, 1)]:
    free = 0.9 * gpus * 80 * GiB - 70e9 * w_bytes                 # usable HBM minus weights
    per_req = kv_bytes(80, 8, 128, 8192, kv_nbytes)
    print(f"  {name:30s} {free / GiB:5.1f} GiB free for KV -> {int(free // per_req):3d} requests")
```

**Output:**

```
model                KiB/token  8K request  128K request
Llama-3.1-8B               128    1.00 GiB      16.0 GiB
Llama-3.3-70B              320    2.50 GiB      40.0 GiB
Qwen3-235B-A22B            188    1.47 GiB      23.5 GiB
DeepSeek-V3 (MLA)         68.6    0.54 GiB       8.6 GiB

Llama-3.3-70B, 8K-token requests that fit:
  FP16 weights on 2xH100          13.6 GiB free for KV ->   5 requests
  FP8 weights on 2xH100           78.8 GiB free for KV ->  31 requests
  INT4 weights on 1xH100          39.4 GiB free for KV ->  15 requests
  FP8 weights + FP8 KV, 2xH100    78.8 GiB free for KV ->  63 requests
```

<details>
<summary><strong>Read as text</strong> — continued: how many requests fit and the interview answer</summary>

Read the second table as the interview answer to "how many users can this box serve?": FP16 weights leave room for only five 8K conversations on two H100s; FP8 weights free six times as much memory; an FP8 cache doubles it again. Paged allocation (§2.2) lets you budget for the *average* conversation length, not the maximum.

**Say this in an interview:**
> "KV cache size is 2 × layers × KV-heads × head-dim × sequence-length × bytes. For Llama-3-70B with GQA that's 320 KiB per token, so a 128K-token context is about 40 GiB for one request — more than the INT4 weights. That's why GQA replaced MHA, why MLA is interesting, and why KV-cache quantization and paging exist. Your maximum batch at a given context length is basically usable GPU memory minus weights, divided by that number."

**They will then ask:** *"How many concurrent requests can you serve, then?"*
Take total HBM, keep about 90 % of it (vLLM's default `gpu_memory_utilization` is 0.9; the rest covers activations and fragmentation), subtract the weights, and divide by (KV bytes per token × expected sequence length). On 2×H100 a 140 GB FP16 70B model leaves about 14 GiB — five 8K requests. FP8 weights leave about 79 GiB — 31 requests — and an FP8 cache on top doubles that to 63.

</details>

---

## 1.3 The Four Metrics ★★★ `L2`

**In one line:** latency is not one number — track TTFT and TPOT per request, throughput for the bill, and goodput for "how much traffic can I serve *inside* my latency targets", and report each as a P50 and a P99, never just a mean.

![Infographic on the four LLM serving metrics: TTFT (arrival to first token, queue plus prefill), TPOT and ITL (average and individual gaps between tokens), throughput (tokens per second across all users) and goodput (requests per second meeting every SLO). Shows total latency = TTFT + TPOT x (N - 1), so 200 tokens at 300 ms TTFT and 25 ms TPOT take about 5.3 s, a request timeline with a 928 ms freeze, a throughput versus latency curve over batch sizes, and four example requests under an SLO of TTFT 500 ms and TPOT 50 ms giving throughput 0.42 requests/s but goodput only 0.21 requests/s.](diagrams/llm17c_info_four_serving_metrics_ai.png)

<details>
<summary><strong>Read as text</strong> — the four metrics, end-to-end latency and the throughput trade-off</summary>

> **Maths in one line:** `end-to-end latency = TTFT + TPOT × (N − 1)` for N output tokens, and `goodput = requests per second that meet every SLO` — the first says where a user's wait goes; the second is the capacity you can actually sell.

**Why it exists.** "Make it faster" is not a spec. A summarisation batch job and a live chat have opposite definitions of fast. Teams that track only average latency ship systems that feel broken. An **SLO** (service-level objective) is the target you commit to, for example "TTFT ≤ 500 ms and TPOT ≤ 50 ms for 99 % of requests".

| Metric | Definition | Set by | Who feels it |
|---|---|---|---|
| **TTFT** — time to first token | Request arrives → first output token, *including* time waiting in the queue | Queue wait + prefill | User: "Is it frozen?" |
| **TPOT / ITL** — time per output token, inter-token latency | TPOT = a request's average gap, (end-to-end − TTFT) ÷ (N − 1). ITL = each individual gap; its worst values show stalls | Decode, memory bandwidth, batch size, other users' prefills | User: "Is it typing at a nice speed? Why did it freeze mid-sentence?" |
| **Throughput** | Output tokens per second (or requests per second) across all users | Batching efficiency | Finance: your GPU bill |
| **Goodput** | Requests per second that meet *every* SLO; requests that miss one count for nothing | All of the above | Product: the load you can promise |

Goodput was made popular by DistServe (OSDI 2024, §2.6), and benchmark tools such as `vllm bench serve` and GuideLLM report it when you give them TTFT/TPOT targets. It is the honest number: pushing batch size up usually raises throughput, but past a point it *lowers* goodput because more requests blow their TPOT target.

**End-to-end latency** is then:

$$\text{total} = \text{TTFT} + \text{TPOT} \times (N - 1)$$

A 200-token answer with 300 ms TTFT and 25 ms TPOT takes $0.3 + 0.025 \times 199 \approx 5.3$ seconds. Note where the time actually goes: 94 % of it is decode. Shaving TTFT from 300 ms to 150 ms improves the total by under 3 %.

**Reasoning models move the wait into decode.** A model that "thinks" for 2,000 hidden tokens at 25 ms each makes the user wait 2,000 × 0.025 = 50 seconds before the first *visible* word — so for reasoning models, TPOT is what the user experiences as time to first token.

**Rules of thumb for interactive chat** (common targets, not standards):

| Metric | Good | Acceptable | Bad |
|---|---|---|---|
| TTFT | < 300 ms | < 1 s | > 2 s |
| TPOT | < 30 ms (≈ 33 tok/s) | < 60 ms | > 100 ms |

People read about 200–300 words a minute — roughly 4–7 tokens per second — so anything above ~20 tokens/second already streams faster than anyone reads. Pushing TPOT much below 30 ms buys little perceived quality for prose; spend the GPU on throughput instead (code and reasoning models are the exceptions, because users wait for the *whole* output).

**The trade-off you must be able to state.** Bigger batches raise throughput (cheaper per token) but raise TPOT (each step does more work) and raise queueing delay (raising TTFT and the tail). This is the central tension of LLM serving:

```
      throughput ▲
   (cheap tokens)│                    ●  batch=128
                 │              ●  batch=64
                 │        ●  batch=32
                 │    ●  batch=16
                 │  ● batch=8
                 │● batch=1
                 └──────────────────────────────▶
                      per-user latency (TPOT, P99)

   Pick your point on this curve from the product, not from a benchmark.
```

</details>

**Run it yourself** — the four metrics computed from token timestamps, the way benchmark tools do it. Request A is the 200-token example above; B has one 0.9-second freeze in the middle (another user's huge prefill); C waited too long in the queue; D decodes too slowly:

```python
# The four serving metrics from token timestamps: TTFT, TPOT / ITL, throughput, goodput
import numpy as np
rng = np.random.default_rng(0)
SLO_TTFT, SLO_TPOT = 0.5, 0.05               # chat SLO in seconds: TTFT <= 500 ms and TPOT <= 50 ms

def request(arrival, ttft, n_out, gap, jitter=0.0, stall=0.0):
    gaps = gap + jitter * rng.standard_normal(n_out - 1)
    gaps[len(gaps) // 2] += stall            # one long pause, e.g. another user's huge prefill
    return arrival, arrival + ttft + np.concatenate([[0.0], np.cumsum(gaps)])

reqs = {"A (chapter)": request(0.0, 0.30, 200, 0.025),
        "B (stalled)": request(0.1, 0.40, 120, 0.030, 0.003, stall=0.9),
        "C": request(0.2, 1.20, 80, 0.030, 0.003),
        "D": request(0.3, 0.35, 150, 0.060, 0.005)}

print(f"{'request':12s}{'TTFT ms':>8s}{'TPOT ms':>9s}{'worst gap ms':>14s}{'total s':>9s}  within SLO?")
good, tokens, end = 0, 0, 0.0
for name, (arrival, t) in reqs.items():
    ttft, e2e = t[0] - arrival, t[-1] - arrival
    tpot = (e2e - ttft) / (len(t) - 1)       # average gap after the first token
    itl = np.diff(t)                         # every individual gap
    ok = ttft <= SLO_TTFT and tpot <= SLO_TPOT
    good, tokens, end = good + ok, tokens + len(t), max(end, t[-1])
    print(f"{name:12s}{ttft * 1e3:8.0f}{tpot * 1e3:9.1f}{itl.max() * 1e3:14.0f}{e2e:9.2f}  {'yes' if ok else 'no'}")
    if name.startswith("A"):
        assert abs(e2e - (0.3 + 0.025 * 199)) < 1e-9     # total = TTFT + TPOT x (N - 1)

print(f"\nThroughput: {tokens / end:.0f} output tokens/s ({len(reqs) / end:.2f} requests/s) over {end:.1f} s")
print(f"Goodput:    {good / end:.2f} requests/s inside the SLO ({good} of {len(reqs)})")
```

**Output:**

```
request      TTFT ms  TPOT ms  worst gap ms  total s  within SLO?
A (chapter)      300     25.0            25     5.28  yes
B (stalled)      400     37.2           928     4.82  yes
C               1200     29.9            36     3.56  no
D                350     60.2            71     9.32  no

Throughput: 57 output tokens/s (0.42 requests/s) over 9.6 s
Goodput:    0.21 requests/s inside the SLO (2 of 4)
```

<details>
<summary><strong>Read as text</strong> — continued: what the four requests show and the interview answer</summary>

Two lessons. Request B passes its TPOT target — the average hides a 928 ms freeze that a user would certainly notice — so watch the worst inter-token gaps (P99 ITL), not just TPOT. And throughput counts all four requests while goodput counts only the two that met the SLO: if you sized the service on throughput, you would promise twice the capacity you can deliver.

**Say this in an interview:**
> "I'd separate TTFT from TPOT because they have different bottlenecks and different fixes. For chat I'd target TTFT under 300 ms and TPOT under 30 ms, then set batch size to the largest value that still meets P99 TPOT — that maximises goodput, the requests per second that meet the SLO, which is what I can actually sell. I'd alert on P99, not the mean, and on the worst inter-token gaps, because batching and scheduling problems show up in the tail first."

**They will then ask:** *"Your P99 TTFT just tripled but the mean is flat. What happened?"*
Almost always queueing, not compute — requests are waiting for a batch slot. Check the scheduler: are long prefills blocking the queue (fix with chunked prefill, §2.3)? Has KV cache filled up so new requests can't be admitted (fix with paging or quantization)? Is one tenant sending 100K-token prompts (fix with admission control and per-tenant limits)?

</details>

---

# PART 2 — MAKING DECODE FAST

---

## 2.1 Continuous (In-Flight) Batching ★★★ `L3`

**In one line:** instead of waiting for every request in a batch to finish, the scheduler evicts each sequence the moment it emits its stop token and immediately admits a waiting request into that slot.

![Infographic on continuous batching: the scheduler evicts finished sequences, admits queued requests when KV blocks are free and runs one decode step for all sequences, every step. Gantt charts with 4 slots compare static batching, where slots sit wasted until the longest request R3 ends, with continuous batching, where R5 to R9 take over freed slots. A simulation table shows static vs continuous decode steps: 2,837 vs 1,786 (1.59x), 2,441 vs 966 (2.53x), 800 vs 800 (1.00x) and 5,996 vs 1,393 (4.30x), plus published results from Orca and Anyscale.](diagrams/llm17c_info_continuous_batching_ai.png)

![Static batching wastes GPU slots; continuous batching refills them every step](diagrams/llm17c_continuousbatching_ai.png)

<details>
<summary><strong>Read as text</strong> — why static batching wastes slots and the scheduler loop</summary>

> **Maths in one line:** `slot utilisation = useful tokens ÷ (decode steps × slots)` — static batching pays for the *longest* request in every batch, so its step count is the sum of the batch maxima; continuous batching needs only about `total tokens ÷ slots` steps.

**Why it exists.** This is the single largest throughput win in LLM serving, and it exists because of a mismatch classic batching cannot handle: **LLM requests finish at wildly different times.** One user asks for a word, another for a thousand-word essay. With static batching the whole batch runs until the *longest* member finishes, so most of your GPU slots sit idle generating padding. The fix was introduced as *iteration-level scheduling* by Orca (Yu et al., OSDI 2022) and is now standard in every serving engine — TensorRT-LLM calls it *in-flight batching*.

**Picture.**

```
STATIC BATCHING — the batch finishes together
                                            ← wasted GPU →
  R1 ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  R2 ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░
  R3 ██████████████████████████████████████████████████
  R4 ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
     └──────────── every slot blocked until R3 ends ───┘
     New requests wait here, even though 3 slots are free.


CONTINUOUS BATCHING — slots are refilled every step
  R1 ████████╳R5 ██████████████████╳R8 ████████████
  R2 ████████████████████████╳R6 ██████████████████
  R3 ██████████████████████████████████████████████
  R4 ████╳R7 ████████████████████╳R9 ██████████████
     ╳ = sequence hits its stop token; a queued request
         takes the slot on the very next decode step.
```

**The mechanism.** The scheduler runs a loop at *token* granularity rather than *request* granularity. Every iteration does three things: (1) evict sequences that emitted their stop token or hit their length limit, streaming their results back and freeing their KV blocks; (2) refill the free slots from the waiting queue; (3) run **one** decode step for every running sequence together — one weight read, N tokens out.

The refill check in a real engine — often called `can_admit` — is the interesting part: it must confirm that enough **KV cache blocks** are free for the new sequence, not just that a slot index is free. That is why continuous batching and PagedAttention (§2.2) go together — variable-length sequences entering and leaving constantly would fragment a naive contiguous cache into uselessness.

</details>

**Run it yourself** — the same three-step loop as a simulation, against static batching on the same requests (each decode step costs the same whatever the batch, because decode is memory-bound):

```python
# Static vs continuous batching: same slots, same requests -- count the decode steps
import numpy as np

def static(lengths, slots):
    # each batch holds all its slots until its LONGEST member finishes
    return sum(max(lengths[i:i + slots]) for i in range(0, len(lengths), slots))

def continuous(lengths, slots):
    waiting, running, steps = list(lengths), [], 0
    while waiting or running:
        running = [r for r in running if r > 0]          # 1. evict sequences that finished
        while waiting and len(running) < slots:          # 2. refill free slots from the queue
            running.append(waiting.pop(0))
        if running:
            running = [r - 1 for r in running]           # 3. one decode step for every sequence
            steps += 1
    return steps

rng = np.random.default_rng(0)
uniform = [int(x) for x in rng.integers(5, 400, 64)]            # output lengths 5..399 tokens
tailed = [int(x) for x in np.ceil(rng.lognormal(4, 1.0, 64))]   # most short, a few very long
big = [int(x) for x in np.ceil(rng.lognormal(4, 1.0, 400))]
cases = [("8 slots, lengths 5-399", 8, uniform), ("8 slots, long-tailed", 8, tailed),
         ("8 slots, all 100 tokens", 8, [100] * 64), ("32 slots, long-tailed", 32, big)]

print(f"{'workload':25s}{'static':>8s}{'busy':>6s}{'continuous':>12s}{'busy':>6s}{'speed-up':>10s}")
for name, slots, lengths in cases:
    s, c = static(lengths, slots), continuous(lengths, slots)
    used = sum(lengths)                                  # useful token-slots
    print(f"{name:25s}{s:8d}{used / (s * slots):6.0%}{c:12d}{used / (c * slots):6.0%}{s / c:9.2f}x")
    assert c <= s
assert static([100] * 64, 8) == continuous([100] * 64, 8)
```

**Output:**

```
workload                   static  busy  continuous  busy  speed-up
8 slots, lengths 5-399       2837   58%        1786   92%     1.59x
8 slots, long-tailed         2441   36%         966   92%     2.53x
8 slots, all 100 tokens       800  100%         800  100%     1.00x
32 slots, long-tailed        5996   18%        1393   77%     4.30x
```

<details>
<summary><strong>Read as text</strong> — continued: how the gain depends on output lengths, when to use it and the interview answer</summary>

The gain depends entirely on how *different* the output lengths are: identical lengths give exactly 1×, uniform 5–399-token answers about 1.6×, and long-tailed lengths — mostly short answers with a few essays, which is what real chat looks like — 2.5× with 8 slots and over 4× with 32.

**What it buys you.** Because the expensive step is reading the model's weights out of memory, and one read now serves every sequence in the batch, throughput grows almost in proportion to batch size at first — in §1.1's table, 96 sequences give about 50× the tokens per second of one — until memory runs out or compute saturates. Orca reported **36.9× the throughput of NVIDIA FasterTransformer at the same latency** on GPT-3 175B. Anyscale's 2023 benchmark measured about **8× over naive static batching from continuous batching alone, and up to 23×** when combined with vLLM's paged KV memory. Uniform outputs → small gain. Highly variable outputs → enormous gain.

**When to use / when not.**

| Use it | Skip it |
|---|---|
| Any online serving with variable output lengths | Single-user local inference (no batch to form) |
| Chat, agents, code generation | Strictly uniform batch jobs where static batching is already full |
| Anywhere you care about cost per token | When P99 TPOT is so tight you must cap batch size at 1–2 |

It is on by default in vLLM, SGLang and TensorRT-LLM. You rarely implement it — but you are absolutely expected to explain it.

**Say this in an interview:**
> "Static batching wastes GPU because the batch is held until the longest sequence finishes, and LLM output lengths vary by orders of magnitude. Continuous batching — Orca's iteration-level scheduling — schedules at token granularity: the moment a sequence emits EOS, its slot and its KV blocks are freed and a queued request joins on the next decode step. Since decode is memory-bandwidth-bound, one weight read now amortises across the whole batch; published benchmarks show about 8× over naive batching on its own and over 20× together with paged KV memory. It needs paged KV memory underneath, otherwise constant admission and eviction fragments the cache."

**They will then ask:** *"What's the downside?"* — TPOT rises as the batch grows, so per-user typing speed degrades under load; and without admission control, a burst of very long prompts can starve short requests. Real systems add per-tenant limits, a max batch size chosen from the P99 TPOT target, and chunked prefill so a huge prompt cannot block the decode loop.

</details>

---

## 2.2 PagedAttention & KV Fragmentation ★★ `L2`

**In one line:** store the KV cache in fixed-size blocks with a lookup table — exactly like virtual memory pages — instead of one contiguous slab per request.

![Infographic on PagedAttention: the KV cache is split into fixed 16-token blocks, each request keeps a block table and takes blocks from a shared free list, and identical prefixes share blocks. Contiguous reservation (used 6 of 30, used 3 of 30) is compared with paged physical blocks B0 to B7, where R1's table holds B0, B3, B7, R2's holds B1, B4 and the free list holds B2, B5, B6. Worked numbers: a 1,000-token conversation needs 63 blocks (1,008 slots, 8 wasted, 0.8 %) versus 3,096 wasted (76 %) in a 4,096 reservation; earlier systems used only 20.4-38.2 % of KV memory, paging over 90 %.](diagrams/llm17c_info_paged_attention_ai.png)

<details>
<summary><strong>Read as text</strong> — wasted reservations, blocks and block tables, preemption and the interview answer</summary>

> **Maths in one line:** `blocks needed = ⌈tokens ÷ block size⌉` — a sequence only ever wastes part of its *last* block (at most block size − 1 token slots), instead of everything between its real length and the maximum length.

**Why it exists.** You do not know in advance how long a response will be, so a naive server reserves the *maximum* possible length for every request. If max length is 4,096 but the average answer is 200 tokens, you have wasted 95 % of that reservation. The PagedAttention paper (Kwon et al., SOSP 2023 — the paper behind **vLLM**) measured that earlier systems used only **20.4–38.2 %** of their KV memory for real tokens; paging pushes it above **90 %**, which the paper turned into **2–4× the throughput** of FasterTransformer and Orca at the same latency.

**Picture.**

```
CONTIGUOUS (naive) — reserve max_len per request
  R1 │██████░░░░░░░░░░░░░░░░░░░░░░░░│  used 6 / reserved 30
  R2 │███░░░░░░░░░░░░░░░░░░░░░░░░░░░│  used 3 / reserved 30
        ▲ internal fragmentation: this memory is
          reserved, unused, and unusable by anyone else

PAGED — fixed blocks (e.g. 16 tokens) + a block table
  Physical blocks:  [B0][B1][B2][B3][B4][B5][B6][B7]...
  R1 block table →   B0, B3, B7        (grows one block at a time)
  R2 block table →   B1, B4
  Free list      →   B2, B5, B6, ...   (available to ANY request)
```

**A worked example.** With 16-token blocks, a 1,000-token conversation needs ⌈1,000 ÷ 16⌉ = 63 blocks = 1,008 token slots, so it wastes 8 slots (0.8 %). The same conversation in a contiguous 4,096-token reservation wastes 3,096 slots (76 %).

**Two consequences worth knowing.** First, blocks need not be contiguous, so a sequence can grow without ever needing a large free region — external fragmentation disappears. Second, **blocks can be shared**: if ten requests share the same 2,000-token system prompt, they can point at the *same* physical blocks, with copy-on-write applied only when their content diverges. That is the foundation of prefix caching (§2.4).

**When blocks run out.** If the batch grows faster than blocks free up, the scheduler **preempts** a running sequence: it frees that sequence's blocks and later recomputes them (vLLM's V1 engine recomputes by default rather than swapping to CPU). Frequent preemption is a sign the batch is too large for the memory — the "preempted" warning in the logs is worth alerting on.

**Say this in an interview:**
> "PagedAttention applies virtual-memory ideas to the KV cache — fixed-size blocks plus a per-sequence block table, so memory is allocated on demand instead of reserving max sequence length up front. The vLLM paper measured earlier systems using only 20–38 % of KV memory for real tokens; paging gets it above 90 %, which translates directly into larger batches — 2–4× throughput — and it enables copy-on-write sharing of common prefixes."

**They will then ask:** *"What's the cost?"* — an indirection on every attention lookup (needs a custom kernel), and a block size trade-off: small blocks waste less memory but add more table overhead and more kernel indirection; 16–32 tokens is the usual compromise (16 is vLLM's usual default).

</details>

---

## 2.3 Chunked Prefill ★★ `L2`

**In one line:** slice a huge prompt into fixed-size chunks and interleave those chunks with ongoing decode steps, so one enormous prompt cannot freeze everybody else's stream.

![Infographic on chunked prefill: a 100K-token prefill on a 70B model takes about 27 s on two H100s and stalls every decoding user; chunked prefill fixes a per-step token budget, schedules decode tokens first and fills the rest with a slice of the prompt. Timelines compare one long prefill block with 51 steps of 64 decode plus 1,984 prompt tokens under a 2,048-token budget, using steps = ceil(prompt tokens / (budget - decode tokens)). Notes that vLLM V1 enables it by default with the max_num_batched_tokens knob, and Sarathi-Serve reported up to 2.6x serving capacity.](diagrams/llm17c_info_chunked_prefill_ai.png)

<details>
<summary><strong>Read as text</strong> — the 100K-token stall, the per-step token budget and the trade-off</summary>

> **Maths in one line:** `steps to finish a prompt ≈ ⌈prompt tokens ÷ (token budget − decode tokens in the batch)⌉` — every step carries one token for each decoding user plus as many prompt tokens as the per-step budget has left.

**Why it exists.** Prefill and decode compete for the same GPU. A single 100K-token prefill on a 70B model is about 2.7 × 10¹⁶ FLOPs (2 × 70B × 100K = 1.4 × 10¹⁶ for the weights, plus nearly as much again for attention across 100K tokens) — roughly **27 seconds** on two H100s running at half their peak. Every user currently mid-answer sees their tokens simply stop arriving for that long. Your mean TPOT looks fine; your P99 is a disaster. This is one of the most common causes of "it's usually smooth but sometimes it just hangs".

**Picture.**

```
WITHOUT chunked prefill
  step: [D][D][D][ P R E F I L L  100K  tokens ][D][D][D]
                   └── every decoding user stalls here ──┘

WITH chunked prefill (chunk = 512 tokens)
  step: [D+p1][D+p2][D+p3][D+p4] ... [D+pN][D][D]
         └ each step does a slice of prefill AND a decode step,
           so streams keep flowing and TTFT degrades gracefully
```

**A worked example.** Budget 2,048 tokens per step, 64 users decoding: each step carries 64 decode tokens + 1,984 prompt tokens, so the 100K prompt finishes in ⌈100,000 ÷ 1,984⌉ = **51 steps** — and in every one of those steps all 64 users still get their next token. Each step is heavier than a pure decode step, so their inter-token gaps grow for a while, but nobody freezes.

**The trade-off.** Total prefill takes slightly longer (less parallelism per step), so the big request's own TTFT gets marginally worse — in exchange, everyone else's P99 TPOT stops collapsing. Nearly always the right trade for interactive serving. The idea comes from SARATHI (2023) and **Sarathi-Serve** (Agrawal et al., OSDI 2024), which paired chunked prefills with "stall-free" scheduling and reported up to 2.6× more serving capacity than the vLLM of the time for Mistral-7B on one A100. In vLLM's V1 engine chunked prefill is **on by default**: decodes are scheduled first and prompts fill the rest of the per-step budget `max_num_batched_tokens` — smaller budgets (around 2,048) give smoother inter-token latency, larger ones a faster TTFT and higher throughput.

**Say this in an interview:**
> "Chunked prefill splits a long prompt into slices and interleaves them with decode steps, so a single long-context request can't monopolise the GPU and stall every active stream. It slightly increases that request's own TTFT but dramatically improves P99 inter-token latency for everyone else. It's the standard fix when P99 TPOT spikes while the mean looks healthy — vLLM now does it by default, and the knob is the per-step token budget."

</details>

---

## 2.4 Prefix Caching & Semantic Caching ★★ `L2`

**In one line:** two different caches — one reuses the *computed KV state* of a shared prompt prefix; the other skips the model entirely when a semantically similar question has already been answered.

![Infographic comparing a prefix cache, which reuses the KV state of an identical prompt start in whole 16-token blocks and never changes the output, with a semantic cache, which returns an old answer when a question is embedding-similar and risks a wrong answer. Shows cached tokens = floor(shared prefix / 16) x 16 (3,000 shared tokens reuse 2,992), good versus bad prompt order (stable system prompt, few-shot and tools first, timestamp never first), and a per-request table at 95 % hits: agent prompt 658 tokens prefilled and 27 % input bill, timestamp first 100 %, RAG 88 %, 50 % hit rate 62 %.](diagrams/llm17c_info_prefix_and_semantic_caching_ai.png)

![Prefix caching only works if the stable part of the prompt comes first](diagrams/llm17c_prefixcaching_ai.png)

<details>
<summary><strong>Read as text</strong> — the two caches, how engines match prefixes and the prompt-order rule</summary>

> **Maths in one line:** `prefill saved ≈ hit rate × cached prefix tokens ÷ prompt tokens`, where `cached prefix tokens = ⌊shared prefix ÷ block size⌋ × block size` — only whole blocks of an *identical* prefix are reused, so a 3,000-token shared prefix saves 2,992 tokens of prefill per hit with 16-token blocks.

**Why it exists.** In production, prompts are far more repetitive than they look. Every request carries the same system prompt, the same few-shot examples, the same tool definitions. Recomputing that prefill on every call is pure waste — and in RAG and agent systems the shared prefix is frequently the *majority* of the prompt.

**The two caches, which interviewers like to see distinguished:**

| | **Prefix / prompt cache** | **Semantic cache** |
|---|---|---|
| Caches | KV tensors for a token prefix | Final responses |
| Match on | Exact token-prefix match | Embedding similarity above a threshold |
| Saves | Prefill compute (lower TTFT, lower cost) | The entire call (near-zero latency) |
| Risk | Essentially none — the output is unchanged | **Serving a wrong answer** to a subtly different question |
| Where | Built into vLLM and SGLang; provider APIs sell it as "prompt caching", billing cached input tokens at a large discount (90–97.5 % off as of Nov 2026) | Application layer (e.g. a Redis + embeddings layer) |

**How the engines find a match.** vLLM's *automatic prefix caching* — on by default in its V1 engine — hashes each full 16-token block together with everything before it, so a block is reused only when the whole prefix up to that block is identical; a partial last block is always recomputed. SGLang's *RadixAttention* (Zheng et al., NeurIPS 2024) keeps cached prefixes in a radix tree and evicts the least recently used branches. Same idea, different bookkeeping — both are exact.

```
Prefix cache — structure your prompts to exploit it

  ✅ GOOD:  [ system prompt ][ few-shot ][ tools ][ user query ]
            └────────── stable, cacheable prefix ────────┘  └ varies

  ❌ BAD:   [ timestamp ][ system prompt ][ user query ]
            └ changes every call → prefix never matches → cache always misses
```

**The single most actionable rule in this section:** put everything variable — timestamps, user IDs, session data — at the **end** of the prompt. A prefix cache only matches from the start, so one variable token at position 0 destroys the whole thing.

</details>

**Run it yourself** — prefill work, prefill time and input bill per request for four prompt layouts (assumptions in the comments: 10,000 prompt tokens/s of prefill, cached tokens billed at 10 % of the normal price):

```python
# Prefix caching: prefill work, time and input bill saved by a shared prompt prefix
BLOCK = 16                    # vLLM hashes and caches whole 16-token blocks only
PREFILL_TPS = 10_000          # assumed prefill speed for one request, tokens/s
CACHED_PRICE = 0.10           # cached input billed at 10 % of the normal price (illustrative)

def per_request(shared, unique, hit_rate):
    total = shared + unique
    reused = (shared // BLOCK) * BLOCK * hit_rate      # a partial last block is recomputed
    computed = total - reused
    prefill_ms = computed / PREFILL_TPS * 1000
    bill = (computed + reused * CACHED_PRICE) / total  # input cost relative to no caching
    return computed, prefill_ms, bill

cases = [("agent: 3,000 stable + 500 new", 3000, 500, 0.95),
         ("same, timestamp at position 0", 0, 3500, 0.95),
         ("RAG: 1,000 stable + 6,000 docs", 1000, 6000, 0.95),
         ("agent, cache evicted half the time", 3000, 500, 0.50)]
print(f"{'prompt layout':36s}{'prefilled':>10s}{'prefill ms':>11s}{'input bill':>12s}")
for name, shared, unique, hit in cases:
    computed, ms, bill = per_request(shared, unique, hit)
    print(f"{name:36s}{computed:10.0f}{ms:11.0f}{bill:12.0%}")

computed, ms, bill = per_request(3000, 500, 0.95)
assert (3000 // BLOCK) * BLOCK == 2992 and round(computed) == 658
print(f"\nNo cache: 3,500 tokens and {3500 / PREFILL_TPS * 1000:.0f} ms of prefill on every request")
```

**Output:**

```
prompt layout                        prefilled prefill ms  input bill
agent: 3,000 stable + 500 new              658         66         27%
same, timestamp at position 0             3500        350        100%
RAG: 1,000 stable + 6,000 docs            6058        606         88%
agent, cache evicted half the time        2004        200         62%

No cache: 3,500 tokens and 350 ms of prefill on every request
```

<details>
<summary><strong>Read as text</strong> — continued: what the four layouts show, caching at scale and the interview answer</summary>

The well-ordered agent prompt cuts prefill by about 80 % and the input bill to about a quarter; moving one timestamp to the front throws all of that away. RAG gains little, because the retrieved documents change on every request — only the system prompt is shared.

**At scale, three more things matter.** A cache only helps if the request reaches the replica that holds it, so multi-replica deployments use **cache-aware routing** (llm-d and NVIDIA Dynamo route on which replica already has the prefix). Hot prefixes can outgrow GPU memory, so engines spill them to CPU RAM or SSD instead of dropping them (vLLM's offloading connector, Mooncake, SGLang's HiCache; see §3.2). And in a multi-tenant service, give each tenant its own cache namespace (vLLM calls it a *cache salt*), because a cache hit is faster than a miss and that timing difference can leak whether another tenant sent the same prompt.

**Say this in an interview:**
> "Prefix caching reuses the KV state of a shared prompt prefix, so the system prompt and few-shot examples aren't re-prefilled on every request — big TTFT and cost win for RAG and agents. The design rule is to keep everything stable at the front and everything variable at the end. Semantic caching is a different, riskier thing: it returns a previous answer when a new question is embedding-similar. I'd only use it with a high similarity threshold, on a narrow domain like FAQs, and with a way to bypass it."

**They will then ask:** *"When does semantic caching bite you?"* — near-duplicate questions with opposite meaning ("can I cancel my order?" vs "can I *not* cancel my order?"), personalised answers cached across users, and stale answers after the underlying data changes. Mitigations: high thresholds, per-user cache keys, TTLs tied to data freshness, and never caching anything the user can act on financially.

</details>

---

## 2.5 Speculative Decoding ★★ `L2`

**In one line:** a small fast model guesses the next few tokens, the big model verifies them all in a single forward pass, and you keep every token up to the first mistake.

![Infographic on speculative decoding: a cheap drafter proposes k tokens, the target model scores them all in one forward pass, each is kept with probability min(1, p/q) and the first rejection is resampled from max(p - q, 0). Shows expected tokens per pass = (1 - alpha^(k+1)) / (1 - alpha) and speed-up = E / (1 + k x c), a flow with guesses 1 to 3 accepted and guess 4 replaced, a chart of tokens per pass versus acceptance rate for k = 4 (0.3 gives 1.43, 0.9 gives 4.10), and a table of speed-ups from 3.41x down to 0.79x depending on acceptance and draft cost. Stresses that the method is lossless.](diagrams/llm17c_info_speculative_decoding_ai.png)

![Speculative decoding: draft, verify, accept](diagrams/llm17cx_speculative_decoding_ai.png)

<details>
<summary><strong>Read as text</strong> — draft, verify, accept — when it pays and why it is lossless</summary>

> **Maths in one line:** `E[tokens per target pass] = (1 − α^(k+1)) / (1 − α)` and `speed-up ≈ E ÷ (1 + k·c)` — with k drafted tokens each accepted with probability α, and a draft step costing a fraction c of a target step.

**Why it exists.** Decode is memory-bandwidth-bound (§1.1), so a forward pass that verifies 5 candidate tokens costs almost exactly the same as one that produces 1. If the guesses are usually right, you get several tokens for the price of one weight read. The method was published almost simultaneously by Leviathan, Kalman & Matias at Google (ICML 2023) and by Chen et al. at DeepMind (2023).

> This section is the home for speculative decoding; [Ch 29 §24.9](#content/29_gpus_tpus_infrastructure) has a short hardware-side summary.

**The mechanism — one round.**

1. **Draft.** The cheap drafter proposes k tokens x₁ … xₖ (the image's γ is the same k), remembering its probability q(x) for each.
2. **Verify.** The target model runs **one** forward pass over the context plus all k drafts, which gives its own probability p at all k + 1 positions at once.
3. **Accept left to right.** Keep draft token xᵢ with probability min(1, p(xᵢ) ÷ q(xᵢ)). With greedy decoding this is simply "keep it if it is the target's top token".
4. **Fix or bonus.** At the first rejection, sample a replacement from the leftover distribution max(p − q, 0), renormalised, and stop. If all k drafts survive, sample one bonus token from the target's last position.

So every round yields between 1 and k + 1 tokens for one target pass. The per-token acceptance rate is α = Σ min(p, q) — 1 minus the distance between the two distributions — which is why a drafter that imitates the target closely matters more than a fast one.

**The maths of whether it is worth it** — the part interviewers push on. If each draft token is accepted with probability α, the expected tokens per target pass is a geometric sum, $1 + \alpha + \dots + \alpha^k$:

$$E[\text{tokens}] = \frac{1 - \alpha^{k+1}}{1 - \alpha}$$

The drafter is not free: each of its k steps costs a fraction c of a target step, so the speed-up is $E \div (1 + k c)$ (Leviathan et al.). With k = 4:

| Acceptance α | Tokens per target pass | Speed-up, cheap draft (c = 0.05) | Speed-up, costly draft (c = 0.2) | Practical read |
|---|---|---|---|---|
| 0.9 | 4.10 | 3.41× | 2.28× | Excellent — draft is well matched |
| 0.8 | 3.36 | 2.80× | 1.87× | Strong win |
| 0.7 | 2.77 | 2.31× | 1.54× | Solid |
| 0.5 | 1.94 | 1.61× | 1.08× | Worth it only with a cheap draft |
| 0.3 | 1.43 | 1.19× | 0.79× | Little or no gain — often a net loss |

Real overheads (verifying k extra positions is not completely free, plus scheduling) shave these further, so a common rule is: you want α above about 0.6 and a draft that is cheap relative to the target. Pick k by measuring — a longer draft only helps while α stays high.

**A crucial property:** with this acceptance rule, speculative decoding is **mathematically lossless** — the output distribution is identical to what the big model would have produced alone. It is a pure latency optimisation, not a quality trade-off. Say this; candidates frequently get it wrong and claim it degrades quality. (Some engines also offer opt-in *lossy* verification modes that relax the rule for speed — those do change the output.)

</details>

**Run it yourself** — the formula checked by a seeded simulation, the speed-up table, and a demonstration that the accept/resample rule reproduces the target distribution exactly even when the drafter is poor:

```python
# Speculative decoding - expected tokens per target pass (formula vs simulation), and losslessness
import numpy as np
rng = np.random.default_rng(0)

def expected_tokens(alpha, k):                 # k drafted tokens, each accepted with prob alpha
    return (1 - alpha ** (k + 1)) / (1 - alpha)

def simulate(alpha, k, steps=100_000):
    accepted = rng.random((steps, k)) < alpha
    prefix = np.cumprod(accepted, axis=1).sum(axis=1)   # accepted run, stops at the first reject
    return (prefix + 1).mean()                          # +1: the target's own token (fix or bonus)

k = 4
print(f"k = {k} draft tokens; c = cost of one draft step relative to one target step")
print(f"{'alpha':>6s}{'formula':>9s}{'simulated':>11s}{'speed-up c=0.05':>17s}{'c=0.2':>7s}")
for alpha in [0.9, 0.8, 0.7, 0.5, 0.3]:
    e, sim = expected_tokens(alpha, k), simulate(alpha, k)
    assert abs(e - sim) < 0.02
    print(f"{alpha:6.1f}{e:9.2f}{sim:11.2f}{e / (1 + k * 0.05):17.2f}{e / (1 + k * 0.2):7.2f}")

# Lossless: accept draft token x ~ q with prob min(1, p(x)/q(x)); otherwise resample from max(p - q, 0)
p = np.array([0.50, 0.30, 0.15, 0.05])        # target model's next-token distribution
q = np.array([0.25, 0.25, 0.25, 0.25])        # draft model's (worse) distribution
n = 200_000
x = rng.choice(4, size=n, p=q)
accept = rng.random(n) < np.minimum(1, p[x] / q[x])
residual = np.maximum(p - q, 0) / np.maximum(p - q, 0).sum()
out = np.where(accept, x, rng.choice(4, size=n, p=residual))
freq = np.array([(out == v).mean() for v in range(4)])
print(f"\nalpha = sum(min(p, q)) = {np.minimum(p, q).sum():.2f}; measured acceptance {accept.mean():.3f}")
print("target p        :", "  ".join(f"{v:.3f}" for v in p))
print("tokens emitted  :", "  ".join(f"{v:.3f}" for v in freq))
assert np.abs(freq - p).max() < 0.005
```

**Output:**

```
k = 4 draft tokens; c = cost of one draft step relative to one target step
 alpha  formula  simulated  speed-up c=0.05  c=0.2
   0.9     4.10       4.10             3.41   2.28
   0.8     3.36       3.36             2.80   1.87
   0.7     2.77       2.78             2.31   1.54
   0.5     1.94       1.93             1.61   1.08
   0.3     1.43       1.43             1.19   0.79

alpha = sum(min(p, q)) = 0.70; measured acceptance 0.699
target p        : 0.500  0.300  0.150  0.050
tokens emitted  : 0.499  0.300  0.150  0.050
```

<details>
<summary><strong>Read as text</strong> — continued: where drafts come from, when to use it and the interview answer</summary>

The drafter here is uniform — a bad guesser — yet the emitted tokens follow the target's 0.50 / 0.30 / 0.15 / 0.05 to three decimals. A worse drafter costs speed (α = 0.70 here), never correctness.

**Where the draft comes from:**

| Draft source | How it drafts | Notes |
|---|---|---|
| **Separate small model** | A same-family, same-tokenizer model 10–20× smaller | Simplest; costs its own memory and KV cache |
| **EAGLE / EAGLE-3** | A light draft head that reads the target's own hidden states (EAGLE-3 fuses several layers) | Trained per target model; EAGLE-3 reports up to 6.5× in its paper and 1.38× throughput at batch 64 in SGLang |
| **Medusa** | Extra decoding heads that guess positions +1, +2, … at once, verified as a tree | No separate model (Cai et al., ICML 2024) |
| **MTP heads** (multi-token prediction) | Heads trained *with* the model to predict further ahead | Free if the model ships them — DeepSeek-V3 reports 85–90 % acceptance for its second token and about 1.8× tokens per second |
| **n-gram / prompt lookup / suffix decoding** | Copy spans that already appear in the prompt or earlier output | No model at all; very effective for code editing, summarisation and RAG, where output echoes input |

As of November 2026, vLLM's documentation lists EAGLE, MTP, separate draft models, PARD (a parallel draft model), n-gram and suffix decoding among its methods. A realistic expectation is **2–3× per stream at low batch size** — in line with the cheap-draft column above.

**When to use / when not.**

| Use it | Skip it |
|---|---|
| Low-to-medium load, latency-critical (the GPU has spare compute) | Very high load — the GPU is closer to compute-bound and the gain shrinks |
| Output is predictable: code, structured data, summarisation | Highly creative / high-temperature output → acceptance collapses |
| A matched drafter exists: same-family model, EAGLE head, or built-in MTP | No well-matched drafter (acceptance too low to pay for itself) |

**Say this in an interview:**
> "Speculative decoding exploits the fact that decode is bandwidth-bound, so verifying k tokens costs about the same as generating one. A cheap drafter proposes, the target verifies in one pass, and you keep the longest accepted prefix plus one token from the target. Expected tokens per pass is (1 − α^(k+1))/(1 − α), so with 80 % acceptance and a 4-token draft you get about 3.4 tokens per pass, and dividing by the draft overhead gives roughly 2–3×. It's lossless — the accept-or-resample rule keeps the target's exact distribution — but it pays off most at low-to-medium batch size; at very high batch the GPU has little spare compute to verify with."

</details>

---

## 2.6 Disaggregated Prefill / Decode Serving ★ `L2`

**In one line:** run prefill and decode on *separate pools of GPUs* rather than making one pool do both, because the two phases want different hardware and different scaling.

![Infographic on splitting LLM serving work: a router sends prompts to a compute-heavy prefill pool, which ships the KV cache (3.3 GB for a 10K-token Llama-3-70B prompt) to a bandwidth-heavy decode pool. KV transfer time = prompt tokens x KV bytes per token / link bandwidth, so moving 3.3 GB takes about 4 ms over NVLink, 66 ms over InfiniBand NDR, 0.26 s over 100 Gb Ethernet and 2.6 s over 10 Gb Ethernet, longer than the 1.5 s prefill. Tiles summarise tensor, pipeline and expert parallelism and replicas; key numbers cover DistServe, DeepSeek-V3 needing 8 x H200 and DeepSeek's EP32 prefill and EP144 decode.](diagrams/llm17c_info_disaggregation_and_parallelism_ai.png)

<details>
<summary><strong>Read as text</strong> — why split the phases, from papers to products and the KV-transfer catch</summary>

> **Maths in one line:** `KV transfer time = prompt tokens × KV bytes per token ÷ link bandwidth` — disaggregation pays only when that transfer is small next to the prefill time it frees the decode GPUs from.

**Why it exists.** From §1.1: prefill is compute-bound, decode is bandwidth-bound. Co-locating them means every prefill burst interferes with every active decode stream, and you must size a single cluster for the worse of two very different profiles. Disaggregation lets each pool be sized, scaled, parallelised and even *hardware-matched* independently — a ratio of x prefill workers to y decode workers ("xPyD") tuned to the traffic.

**Picture.**

```
              ┌──────────────┐
  request ──▶ │   ROUTER     │
              └──────┬───────┘
                     ▼
        ┌────────────────────────┐
        │  PREFILL POOL          │   compute-heavy GPUs
        │  big matmuls, bursty   │   scale on prompt volume
        └───────────┬────────────┘
                    │  ships the KV cache over the interconnect
                    ▼
        ┌────────────────────────┐
        │  DECODE POOL           │   bandwidth-heavy, big VRAM
        │  many concurrent slots │   scale on concurrent sessions
        └────────────────────────┘
```

**From papers to products.** DistServe (Zhong et al., OSDI 2024) introduced the goodput framing of §1.3 and reported serving up to 7.4× more requests, or 12.6× tighter latency targets, within SLO than co-located systems. Splitwise (Microsoft, ISCA 2024) made the same split and matched each phase to different GPU types. Mooncake (Moonshot AI's serving platform for Kimi, FAST 2025 best paper) built the design around a shared KV-cache pool in CPU memory and SSD. As of November 2026 the production stacks are **NVIDIA Dynamo** (open source since March 2025, version 1.0 in March 2026; moves KV caches GPU-to-GPU with its NIXL library and routes on where caches live) and **llm-d** (Kubernetes-native, a CNCF Sandbox project co-founded by Google, Red Hat, IBM and others; 1.0 in October 2026). Dynamo runs vLLM, SGLang or TensorRT-LLM underneath, llm-d runs vLLM or SGLang, and vLLM and SGLang can also disaggregate on their own.

**The catch, which is the whole interview point:** you now have to move the KV cache between pools. At 320 KiB per token (Llama-3-70B, §1.2), a 10K-token prompt means shipping about 3.3 GB before the first token can be decoded. Prefilling that prompt takes roughly 1.5 s on two H100s running at half their peak, so:

| Link between the pools | Bandwidth | Time to move 3.3 GB | Verdict |
|---|---|---|---|
| NVLink (same node, H100) | 450 GB/s each way (900 GB/s total) | ≈ 7 ms | Free |
| InfiniBand NDR, 400 Gb/s | 50 GB/s | ≈ 66 ms | Fine — and it can be streamed layer by layer while prefill runs |
| 100 Gb/s Ethernet | 12.5 GB/s | ≈ 0.26 s | Marginal |
| 10 Gb/s Ethernet | 1.25 GB/s | ≈ 2.6 s | Ruinous — longer than the prefill itself |

**Disaggregation is a high-end optimisation that only pays off at large scale with a fast interconnect.**

**Say this in an interview:**
> "Prefill is compute-bound and decode is bandwidth-bound, so at scale it can pay to run them on separate pools sized independently — prefill scales with prompt volume, decode with concurrent sessions, and neither interferes with the other's latency; DistServe showed several-fold goodput gains. The cost is transferring the KV cache between pools — about 3 GB for a 10K-token prompt on a 70B model, which is tens of milliseconds over InfiniBand but seconds over ordinary Ethernet — so it only makes sense with a fast interconnect and enough traffic to justify the complexity. Below that scale, chunked prefill on a single pool gets most of the benefit."

> **Bar-raiser note.** Mentioning this — *and then correctly arguing it is overkill for the scale in the question* — is a stronger signal than proposing it everywhere.

</details>

### Parallelism at Serving Time — TP, PP, EP and Replicas

<details>
<summary><strong>Read as text</strong> — what TP, PP, EP and replicas each buy, the DeepSeek-V3 example and the interview answer</summary>

**In one line:** when a model does not fit on one GPU you must split it, and each way of splitting buys something different at serving time — lower latency, room for a bigger model, or more throughput.

The mechanics of each split live in [Ch 17 §3.6](#content/17_llm) and [Ch 29 §24.6](#content/29_gpus_tpus_infrastructure), and expert routing in [Ch 17 §4.8](#content/17_llm). What matters when *serving*:

| Split | What it buys at serving time | What it costs | Typical use |
|---|---|---|---|
| **Tensor parallel (TP)** | Lower TPOT: each GPU streams only its slice of every layer, so bandwidth adds up (§1.1), and more HBM is left for KV cache | Two all-reduces per layer on every decode step | Inside one NVLink domain — usually one 8-GPU node |
| **Pipeline parallel (PP)** | Fits a model bigger than one node, with little traffic between stages | No speed-up for a single stream; needs many requests in flight to keep every stage busy | Across nodes, when TP alone cannot fit the model |
| **Expert parallel (EP)** | Spreads a mixture-of-experts model's experts over many GPUs, so each GPU reads only a few experts per step while the batch per expert grows | An all-to-all exchange in every MoE layer; one hot expert makes its GPU the straggler | MoE models, often across nodes ("wide EP") |
| **Replicas (data parallel)** | Throughput grows with the number of copies; copies never talk to each other | No latency gain; every copy holds all the weights | Scaling out once one copy meets the SLO |

**A worked example.** DeepSeek-V3 has 671B parameters (37B active per token) stored in FP8, so its weights alone are about 671 GB. That does not fit one 8 × H100 node (8 × 80 = 640 GB) even before any KV cache, but it fits one 8 × H200 node (8 × 141 = 1,128 GB) with TP or EP inside the node. DeepSeek's own production system, described in February 2025, combines this with disaggregation: prefill and decode run on separate pools; prefill runs on 32-GPU units with **EP32** (9 routed experts per GPU) and decode on 144-GPU units with **EP144** (2 routed experts plus the shared expert per GPU), so each decode GPU reads very little expert weight per step while every expert still sees a large batch.

**Say this in an interview:**
> "Inside a node I'd use tensor parallelism, because it cuts per-token latency — bandwidth adds up. If the model still doesn't fit, I'd add pipeline stages across nodes, or for an MoE, expert parallelism as wide as the interconnect allows. Then I scale throughput with independent replicas: each replica is sized to meet the latency SLO, and the number of replicas is sized to the traffic."

</details>

---

# PART 3 — MAKING THE MODEL SMALLER

---

## 3.1 Weight-Only vs W8A8 — Which Phase Does It Help? ★★★ `L2`

**In one line:** quantizing only the weights speeds up **decode**; quantizing activations too (W8A8/FP8) is what speeds up **prefill** — and confusing the two is the most common quantization mistake.

![Infographic: which phase quantization speeds up. Decode is bandwidth-bound (weight bytes / 3.35 TB/s), so weight-only INT4 such as GPTQ, AWQ and NF4 helps it; prefill is compute-bound (H100 BF16 989 vs FP8 1,979 TFLOPS), so only W8A8, FP8 or FP4 on Blackwell help both. Error bars for one 2048 x 2048 layer: INT8 0.83%, INT4 per channel 15.00%, INT4 per 128 11.74%, naive W8A8 13.15%, SmoothQuant 1.95%.](diagrams/llm17c_info_quantization_by_phase_ai.png)

![Weight-only quantization speeds up decode; W8A8/FP8 is what also speeds up prefill](diagrams/llm17c_quantization_ai.png)

<details>
<summary><strong>Read as text</strong> — why each phase has its own bottleneck, and the formats table</summary>

> **Maths in one line:** `decode step ≈ weight bytes ÷ memory bandwidth` and `prefill time ≈ 2 × parameters × prompt tokens ÷ matmul FLOP/s` — fewer bits per weight shrink the first; only a lower-precision *matmul* (weights **and** activations quantized) shrinks the second.

**Why it exists.** Everyone knows quantization "makes the model smaller and faster". Almost nobody can say *which part* gets faster. Since prefill and decode have opposite bottlenecks (§1.1), the answer follows directly:

- **Decode is memory-bandwidth-bound.** Its cost is *bytes of weights moved*. Shrink the weights → decode gets faster. Activations are tiny at batch 1, so quantizing them changes nothing.
- **Prefill is compute-bound.** Its cost is *matmul FLOPs*. You only go faster if the matmul itself runs on faster hardware paths — which requires **both** operands in low precision, i.e. quantized activations too. An H100 peaks at about 989 dense TFLOPS in BF16 and about 1,979 in FP8 ([Ch 29 §24.1](#content/29_gpus_tpus_infrastructure)), so FP8 prefill can be up to twice as fast; INT4 weights that are expanded back to BF16 for the multiply get none of that.

| Scheme | Weights | The matmul runs in | Helps decode | Helps prefill | Notes |
|---|---|---|---|---|---|
| **GPTQ 4-bit** | INT4 | FP16 / BF16 | ✅ strongly | ❌ | Post-training; uses a small calibration set to correct rounding errors layer by layer |
| **AWQ 4-bit** | INT4 | FP16 / BF16 | ✅ strongly | ❌ | Finds the ~1 % of "salient" weight channels from activation sizes and scales them up before rounding |
| **NF4 (QLoRA)** | NF4 | BF16 | ✅ | ❌ | A storage format for fine-tuning a frozen base on one GPU ([Ch 17b §9.4](#content/17b_llm_applications)) |
| **SmoothQuant** | INT8 | INT8 | ✅ | ✅ | Moves the outliers out of the activations and into the weights — the reason naive W8A8 fails is a few huge activation channels |
| **INT8 W8A8** | INT8 | INT8 | ✅ | ✅ | Needs activation calibration; breaks on outliers without SmoothQuant-style fixes |
| **FP8 (W8A8)** | FP8 | FP8 | ✅ | ✅ | Hopper (H100/H200), Ada and Blackwell GPUs; near-lossless for most models — the usual default |
| **FP4 (NVFP4 / MXFP4)** | FP4 | FP4 (or FP8) | ✅ strongly | ✅ on Blackwell | Blackwell GPUs (B200/B300) only. 4-bit floats sharing one scale per small block: NVFP4 = an FP8 scale per 16 values, MXFP4 = a power-of-two scale per 32. gpt-oss ships its expert weights in MXFP4 |

**Run it yourself** — why 8-bit weights are easy, 4-bit weights need small groups, and 8-bit *activations* need SmoothQuant (symmetric round-to-nearest: `q = round(x / scale)` with `scale = max|x| / 127` for INT8 and `/ 7` for INT4):

</details>

```python
# Symmetric INT8/INT4 round-trip error, and why activation outliers break naive W8A8 (SmoothQuant fixes it)
import numpy as np

rng = np.random.default_rng(0)

def quantize(x, bits, axis=None):
    qmax = 2 ** (bits - 1) - 1                                # 127 for INT8, 7 for INT4
    scale = np.abs(x).max(axis=axis, keepdims=axis is not None) / qmax
    q = np.clip(np.round(x / scale), -qmax, qmax)             # the integers you store
    return q * scale                                          # de-quantized copy

def rel_err(a, b):
    return np.linalg.norm(a - b) / np.linalg.norm(b)

# 1) Weights: one 2048 x 2048 layer, one scale per output channel (column)
W = rng.normal(0, 0.02, size=(2048, 2048))
for bits in (8, 4):
    print(f"INT{bits} weights, one scale per channel : error {rel_err(quantize(W, bits, axis=0), W):6.2%}")
W_g = quantize(W.reshape(16, 128, 2048), 4, axis=1).reshape(2048, 2048)   # one scale per 128 weights
print(f"INT4 weights, one scale per 128     : error {rel_err(W_g, W):6.2%}")

# 2) W8A8: activations X (tokens x channels) with ONE outlier channel, as in real LLMs
X = rng.normal(0, 1, size=(64, 512))
X[:, 7] *= 60                                                 # channel 7 is ~60x larger
W2 = rng.normal(0, 0.02, size=(512, 256))
Y = X @ W2                                                    # the full-precision answer

naive = quantize(X, 8) @ quantize(W2, 8, axis=0)              # one scale for X, per-channel W
s = np.sqrt(np.abs(X).max(axis=0) / np.abs(W2).max(axis=1))   # SmoothQuant, alpha = 0.5
assert np.allclose((X / s) @ (W2 * s[:, None]), Y)            # same maths, just rescaled
smooth = quantize(X / s, 8) @ quantize(W2 * s[:, None], 8, axis=0)

print(f"W8A8 naive        : output error {rel_err(naive, Y):6.2%}")
print(f"W8A8 SmoothQuant  : output error {rel_err(smooth, Y):6.2%}")
assert rel_err(smooth, Y) < rel_err(naive, Y) / 2
```

**Output:**

```
INT8 weights, one scale per channel : error  0.83%
INT4 weights, one scale per channel : error 15.00%
INT4 weights, one scale per 128     : error 11.74%
W8A8 naive        : output error 13.15%
W8A8 SmoothQuant  : output error  1.95%
```

<details>
<summary><strong>Read as text</strong> — continued: reading the numbers, memory per precision and the interview answer</summary>

Reading it: INT8 weights lose under 1 %. Plain 4-bit rounding loses 15 %, and a scale per 128 weights brings that to 12 % — which is why every 4-bit format keeps a scale per small block (GPTQ and AWQ use groups of 128, NVFP4 blocks of 16) and why GPTQ and AWQ then correct the rounding further. The second half is the W8A8 story: one activation channel 60× larger than the rest forces a coarse scale onto every channel, so the naive output error is 13 %. SmoothQuant divides that channel down and multiplies the matching weight row up — the product is mathematically unchanged (the first `assert`) — and the error falls to 2 %.

**One more nuance:** the weight-only gain shrinks as the batch grows. At large batch sizes decode does more arithmetic per weight read (§1.1), and expanding INT4 back to BF16 inside the kernel costs time. That is why high-throughput deployments usually prefer FP8 (or FP4 on Blackwell), while INT4 weight-only wins at small batch sizes and when memory is short.

**Memory reference for a 70B model** (usable memory as in §1.2: 90 % of each "80 GB" H100, 8K-token requests):

| Precision | Weights | Fits on | Left for KV cache |
|---|---|---|---|
| FP16 / BF16 | 140 GB | 2×H100 | about 14 GiB → five 8K-token requests |
| FP8 / INT8 | 70 GB | 1×H100, barely | about 7 GiB → two requests; in practice use 2×H100 (79 GiB → 31) |
| INT4 / FP4 | about 35 GB | 1×H100 | about 39 GiB → fifteen requests |

That last row is the practical punchline: 4-bit weights do not merely halve your hardware. On one H100 they leave about 39 GiB for the KV cache, so a single GPU holds fifteen 8K-token conversations where FP8 weights on the same GPU leave room for two. Freed memory converts almost directly into **concurrency**, which is usually the bigger win.

**Say this in an interview:**
> "Weight-only quantization like GPTQ or AWQ shrinks the bytes you stream per token, so it accelerates decode, which is bandwidth-bound — but it doesn't help prefill, because prefill is compute-bound and the matmuls still run in BF16. To speed up prefill you need the activations quantized too, W8A8 or FP8, so you actually hit the low-precision tensor cores. On H100 I'd default to FP8: it helps both phases with almost no quality loss. On Blackwell, FP4 (NVFP4) is the next step. If I'm memory-constrained and decode-dominated, INT4 weight-only, mainly because the freed memory buys me a much bigger KV cache and more concurrency."

**They will then ask:** *"How do you know quantization didn't hurt quality?"* — not perplexity alone, which is far too blunt. Run your **task** evals (§4.3) before and after, compare on the tail (rare formats, long contexts, non-English), and watch for the classic 4-bit failure mode: fine on short answers, degrades on long-form reasoning and instruction-following.

</details>

---

## 3.2 KV-Cache Quantization & Offload ★★ `L2`

**In one line:** store the KV cache in FP8 or INT4 instead of FP16, or spill cold blocks to CPU memory, so long contexts stop eating your entire GPU.

![Infographic: KV-cache quantization and multi-LoRA serving. One 128K-token Llama-3-70B request needs 40 GiB of KV cache in FP16, 20 GiB in FP8 and 10 GiB in INT4, versus 35 GB of INT4 weights; KV bytes = 2 x layers x kv_heads x head_dim x tokens x bytes_per_value. One 140 GB base model serves five requests with LoRA adapters of about 33 MB each in one shared batch; rank 8 on Q and V is 16.4M parameters, rank 16 on Q, K, V, O is 65.5M, under 0.1% of the base.](diagrams/llm17c_info_kv_quant_and_multilora_ai.png)

![Multi-LoRA serving: one resident base model, many tiny adapters swapped in per request](diagrams/llm17c_multilora_ai.png)

<details>
<summary><strong>Read as text</strong> — shrinking the cache: FP8, INT4 and CPU offload</summary>

> **Maths in one line:** `KV bytes = 2 × layers × kv_heads × head_dim × tokens × bytes_per_value` — the last factor is the one you control: FP16 = 2 bytes, FP8 = 1, INT4 = 0.5, so one 128K-token Llama-3-70B request shrinks from 40 GiB to 20 GiB to 10 GiB.

**Why it exists.** §1.2 showed one 128K-token request on Llama-3-70B holding 40 GiB of KV cache (about 43 GB) — more than the INT4 weights (35 GB). Once the cache dominates memory, shrinking the *weights* further stops helping; you have to shrink the *cache*.

| Technique | Effect | Cost |
|---|---|---|
| **FP8 KV cache** | 2× smaller → 2× the context or batch | Small quality loss for most models; the usual first step. In vLLM: `--kv-cache-dtype fp8`, ideally with calibrated scales |
| **INT4 / 2-bit KV cache** | 4–8× smaller | Measurable degradation on long-context recall; test it. Research methods (KIVI, KVQuant) quantize keys per channel and values per token, because keys have a few outlier channels |
| **CPU offload** | Cold blocks spill to host RAM | PCIe transfer latency on re-access; only for very long, sparsely-touched contexts |

**Say this in an interview:**
> "At long context the KV cache can exceed the quantized weights, so it becomes the binding constraint. FP8 KV cache costs very little quality on most models and doubles either context length or batch size; INT4 is aggressive and I'd validate it on long-context retrieval tasks specifically, because that's where it degrades first. Offloading to CPU only makes sense when the context is long but rarely re-read, since you pay PCIe latency on every touch."

</details>

---

## 3.3 Multi-LoRA Serving ★★ `L2`

<details>
<summary><strong>Read as text</strong> — one shared base model, adapter sizes and mixed-adapter batches</summary>

**In one line:** serve one base model plus many small LoRA adapters swapped in per request, instead of running a separate full model per customer.

> **Maths in one line:** `adapter parameters = Σ r × (d_in + d_out)` over every adapted weight matrix — the rank `r` is tiny (8–64), so a whole adapter is a fraction of a percent of the base model.

**Why it exists.** You have fine-tuned the model for 50 enterprise customers. Fifty 70B deployments is financially absurd. But a LoRA adapter (how LoRA works: [Ch 17b §9.4](#content/17b_llm_applications)) is only tens to hundreds of megabytes — so keep **one** copy of the 140 GB base model resident and page the tiny adapters in and out per request.

**How big is an adapter?** Llama-3-70B has 80 layers, a hidden size of 8,192, and key/value projections of width 1,024 (grouped-query attention). Rank 8 on the query and value projections: 8 × (8,192 + 8,192) + 8 × (8,192 + 1,024) = 204,800 parameters per layer, × 80 = 16.4M parameters ≈ **33 MB** in BF16 — the "~30 MB" in the picture below. Rank 16 on all four attention projections is 65.5M parameters ≈ 131 MB — still under 0.1 % of the base.

**Picture.**

```
  ┌─────────────────────────────────────────────┐
  │   BASE MODEL — 70B, 140 GB, loaded ONCE     │
  └──────────────────────┬──────────────────────┘
                         │  one batch mixes tenants freely
     ┌─────────┬─────────┼─────────┬─────────┐
     ▼         ▼         ▼         ▼         ▼
  [LoRA-A]  [LoRA-B]  [LoRA-A]  [LoRA-C]  [LoRA-B]    ~30 MB each
     R1        R2        R3        R4        R5
```

The subtlety that makes it work: requests using *different* adapters can sit in the **same** batch. The base-model matmul is shared across all of them; only the small low-rank adapter multiplication is per-request (the Punica and S-LoRA papers, both 2023, introduced batched kernels that run many different adapters in one step). So you keep continuous batching's throughput while serving many tenants.

**When to use / when not.** Use it for per-customer or per-task specialisation where the base model is shared. Skip it if adapters are so few you can just merge them into dedicated deployments, or if your tenants need genuinely different base models.

**Say this in an interview:**
> "Multi-LoRA serving keeps one base model resident and applies per-request adapters, so 50 fine-tuned variants cost roughly one deployment instead of 50. Because the adapters are low-rank, requests with different adapters can share a batch — the expensive base matmul is amortised across all of them and only the small adapter term is per-request. vLLM, SGLang and TensorRT-LLM all support it; in vLLM it's `--enable-lora` with limits like `--max-loras`. The limits are adapter count versus memory, and a small latency cost when an adapter has to be loaded cold."

</details>

---

## 3.4 Distill, Quantize or Prune? ★★ `L2`

**In one line:** three different ways to make a model smaller, and they fail in different places — so the choice depends on whether you are short of memory, bandwidth or budget.

![Infographic comparing quantization, distillation and pruning: what each does, cost to apply, typical gain (2-4x, 5-10x, 1.5-2x structured), quality risk and reversibility; a three-step decision ladder (no training budget: quantize, FP8 first; narrow task: distil, a 7B student can match a 70B teacher; fixed latency on fixed hardware: structured pruning plus fine-tune); and a 2:4 sparsity example, two zeros in every four weights, the pattern GPUs accelerate.](diagrams/llm17c_info_distill_quantize_prune_ai.png)

![Quantize, distill or prune: three ways to shrink a model](diagrams/llm17cx_distill_quantize_prune_ai.png)

<details>
<summary><strong>Read as text</strong> — the three options compared, the decision ladder and synthetic-data distillation</summary>

**Why it exists.** Candidates reach for quantization reflexively because it is the easiest. But "make this model cheaper to serve" has three answers, and the strongest response compares them.

| | **Quantization** | **Distillation** | **Pruning** |
|---|---|---|---|
| What it does | Same weights, fewer bits each | Trains a *smaller* model to mimic a bigger one | Deletes weights that contribute little |
| Cost to apply | Minutes to hours, no training data | **Full training run** on the student | Hours, plus fine-tuning to recover |
| Typical gain | 2–4× smaller | 5–10× smaller | 1.5–2× (structured) |
| Quality risk | Low at 8-bit, moderate at 4-bit | Depends entirely on student capacity | Unstructured pruning needs sparse-matrix hardware to actually go faster; the one pattern GPUs accelerate is 2:4 (two zeros in every four weights, Ampere and later) — up to 2× faster matmuls on paper, less in practice |
| Reversible? | Yes — just reload FP16 | No, it is a new model | No |
| Home in this book | §3.1 above | [Ch 29 §24.9](#content/29_gpus_tpus_infrastructure) | [Ch 29 §24.9](#content/29_gpus_tpus_infrastructure) |

**The decision in practice:**

```
Need it cheaper, and you have NO training budget?
  → Quantize. FP8 first, INT4 if memory-bound. Start here always.

Still too expensive, and the task is NARROW?
  → Distil. A 7B student on your specific task often matches a
    70B teacher, because you are buying task performance, not
    general capability. This is where the 10x wins live.

Need to hit a specific latency on fixed hardware?
  → Structured pruning (drop whole heads/layers) + fine-tune.
    Unstructured pruning gives great sparsity numbers and
    frequently zero real speedup — check your hardware first.
```

**The modern framing worth knowing:** distillation used to mean training on a teacher's soft logits. Increasingly it means **generating synthetic data** from a frontier model and fine-tuning a small open model on it — same idea, no logit access required, which is what makes it possible when the teacher is behind an API. Note this often conflicts with provider terms of service (several forbid using outputs to build competing models); a good answer mentions that.

**Say this in an interview:**
> "I'd quantize first because it costs nothing and is reversible — FP8 on modern hardware, INT4 if I'm memory-bound. If that isn't enough and the task is narrow, distillation is the bigger lever: a small student trained on the teacher's outputs can match it on that specific task at a fraction of the cost, because I'm not paying for general capability I don't use. Pruning I'd reach for last, and structured rather than unstructured, since unstructured sparsity usually needs hardware support to turn into real speedup."

</details>

---

# PART 4 — MEASURING

---

## 4.1 The Evaluation Stack ★★★ `L2`

**In one line:** you need four layers of evaluation — assertions, golden sets, judges, and online metrics — because no single one of them can tell you whether the system got better.

![Infographic of the four-layer LLM evaluation stack drawn as a pyramid: assertions at the bottom (fastest, cheapest), then golden set, judge, and online metrics at the top (slowest, truest). Layers 1 and 2 run on every commit, layer 3 nightly, layer 4 continuously; a curved arrow shows every production failure becoming a new golden-set case.](diagrams/llm17c_info_evaluation_stack_ai.png)

![The four-layer evaluation stack: assertions, golden sets, judges, and online metrics](diagrams/llm17c_evalstack_ai.png)

<details>
<summary><strong>Read as text</strong> — the four layers, when each runs and the failure-to-test loop</summary>

**Why it exists.** LLM outputs are non-deterministic and open-ended, so "did my change help?" is genuinely hard. Teams that skip this ship changes on vibes, and then cannot explain a regression. A working evaluation loop is what separates teams that ship reliable LLM products from teams that do not.

```
   ┌──────────────────────────────────────────────────┐
   │ 4. ONLINE      user feedback, A/B tests, guardrail│  slowest, truest
   │                metrics, cost & latency dashboards │
   ├──────────────────────────────────────────────────┤
   │ 3. JUDGE       LLM-as-judge on open-ended output  │
   ├──────────────────────────────────────────────────┤
   │ 2. GOLDEN SET  curated cases, run on every change │
   ├──────────────────────────────────────────────────┤
   │ 1. ASSERTIONS  valid JSON? cites a source? no PII?│  fastest, cheapest
   └──────────────────────────────────────────────────┘
        Run 1–2 on every commit. 3 nightly. 4 continuously.
```

The discipline that matters most: **every production failure becomes a new case in layer 2.** That single loop is what makes the system improve instead of oscillate.

This section is the home for *LLM* evaluation. Agents add trajectory-level checks and pass^k reliability on top ([Ch 18b §18.12](#content/18b_agents_in_production)); the tools that run all of this (Ragas, DeepEval, Langfuse, LangSmith and others) are compared in [Ch 19 §19.10](#content/19_ai_frameworks).

</details>

---

## 4.2 LLM-as-Judge and Its Three Biases ★★★ `L2`

**In one line:** use a strong model to grade outputs when there is no exact answer — but know the three ways it is systematically wrong, or you will optimise straight into them.

![Infographic on LLM-as-judge and its three biases: position (fix: judge both orders, count a win only if it survives the swap, report the flip rate), verbosity (length-controlled win rates) and self-preference (a judge from another family or a panel). Win rate = wins / (wins + losses) over consistent verdicts. Simulated example where NEW is truly better in 60% of pairs: shown first 0.700, shown second 0.411, averaged 0.556, consistent pairs only 0.590 against a truth of 0.60; 62% of pairs consistent.](diagrams/llm17c_info_llm_judge_biases_ai.png)

<details>
<summary><strong>Read as text</strong> — why judges are used, the three biases and the fix for each</summary>

> **Maths in one line:** `win rate = wins ÷ (wins + losses)`, counting a pair only when the verdict survives swapping the order of the two answers — a verdict that flips with the order is measuring position, not quality.

**Why it exists.** Human evaluation is accurate and far too slow and expensive to run on every change. Exact-match metrics like BLEU and ROUGE do not work for open-ended generation (§4.7). A strong judge model correlates reasonably with human preference and runs in minutes: in the MT-Bench study (Zheng et al., 2023) GPT-4 as a judge agreed with human experts over 80 % of the time — about as often as the experts agreed with each other.

**The three biases — name all three and the mitigation:**

| Bias | What happens | Mitigation |
|---|---|---|
| **Position bias** | The judge favours an answer because of *where* it appears — usually the first, for some judges the second | Judge every pair in both orders; count a win only if it holds in both, otherwise a tie; report how often verdicts flip |
| **Verbosity bias** | Longer answers score higher regardless of quality | Length-controlled win rates (as in AlpacaEval 2.0); a rubric that penalises padding |
| **Self-preference** | A judge prefers text produced by its own model family | Use a judge from a different family, or a panel of judges from several families; validate against human labels |

**Run it yourself** — a simulated judge that, 30 % of the time, simply picks whichever answer it saw first, and is 90 % accurate otherwise:

</details>

```python
# LLM-as-judge position bias: judge every pair in BOTH orders and count a win only if it survives the swap
import numpy as np

rng = np.random.default_rng(0)
n_pairs = 2000
lazy = 0.30          # 30% of the time the judge just picks whichever answer it saw FIRST
accuracy = 0.90      # otherwise it picks the truly better answer 90% of the time

def judge_picks_new(new_is_better, new_shown_first):
    if rng.random() < lazy:
        return new_shown_first                                # position bias
    correct = rng.random() < accuracy
    return new_is_better if correct else not new_is_better

for true_rate in (0.60, 0.50):                                # how often NEW is really better
    better = rng.random(n_pairs) < true_rate
    first = np.array([judge_picks_new(b, True) for b in better])    # NEW shown first
    second = np.array([judge_picks_new(b, False) for b in better])  # same pairs, order swapped
    consistent = first == second                              # the verdict survived the swap
    wins, losses = (consistent & first).sum(), (consistent & ~first).sum()
    print(f"NEW is really better in {true_rate:.0%} of pairs")
    print(f"  NEW always shown first : win rate {first.mean():.3f}")
    print(f"  NEW always shown second: win rate {second.mean():.3f}")
    print(f"  both orders, averaged  : win rate {(first.mean() + second.mean()) / 2:.3f}")
    print(f"  consistent pairs only  : win rate {wins / (wins + losses):.3f} "
          f"({consistent.mean():.0%} of pairs; the rest count as ties)")
    assert first.mean() - second.mean() > 0.2                 # the order alone moves the score
    assert abs(wins / (wins + losses) - true_rate) < 0.03     # the swap test recovers the truth
```

**Output:**

```
NEW is really better in 60% of pairs
  NEW always shown first : win rate 0.700
  NEW always shown second: win rate 0.411
  both orders, averaged  : win rate 0.556
  consistent pairs only  : win rate 0.590 (62% of pairs; the rest count as ties)
NEW is really better in 50% of pairs
  NEW always shown first : win rate 0.623
  NEW always shown second: win rate 0.359
  both orders, averaged  : win rate 0.491
  consistent pairs only  : win rate 0.486 (64% of pairs; the rest count as ties)
```

<details>
<summary><strong>Read as text</strong> — continued: reading the simulation, pairwise judging and calibration</summary>

Reading it: with a single fixed order the same judge reports 70 % or 41 % for the same pairs — a 29-point swing from position alone. In the second case NEW is no better at all, yet showing it first "wins" 62 % of the time. Averaging the two orders removes the bias but drags the answer towards 50 % (0.556 for a true 0.60); keeping only the verdicts that survive the swap gets close to the truth (0.590), and the 38 % flip rate itself tells you how much to trust this judge.

**Two more rules that separate a good answer from a great one:**

1. **Pairwise beats absolute.** "Which of these two is better?" is far more reliable than "score this 1–10". Absolute scores drift between runs and cluster around the middle.
2. **Calibrate the judge.** Hand-label 100–200 examples, measure the judge's agreement with your humans, and only trust it on the axes where agreement is high. An uncalibrated judge is an opinion, not a metric.

**Say this in an interview:**
> "LLM-as-judge is the practical way to evaluate open-ended output, but it has three known biases: position, verbosity and self-preference. I'd mitigate by evaluating pairwise rather than on an absolute scale, judging both orders and counting only verdicts that survive the swap, controlling for length, and using a judge from a different model family than the one under test. Crucially I'd calibrate it against a hundred or two human labels first and track agreement, because otherwise I'm optimising against the judge's quirks rather than actual quality."

**They will then ask:** *"What if the judge and your users disagree?"* — the users are right. Treat judge-human disagreement as the signal: sample the disagreements, work out which dimension the judge is blind to, and either add an assertion for it or change the rubric. Judges measure proxies; A/B tests measure reality.

</details>

---

## 4.3 Golden Sets & Regression Testing ★★★ `L3`

**In one line:** a small, versioned, hand-curated set of input/expectation pairs that runs automatically on every prompt, model or retrieval change — unit tests for a non-deterministic system.

![Infographic on golden sets and A/B tests. A golden test case refund-policy-out-of-window with two deterministic assertions and one judged assertion, added because of incident INC-2481. Sample size per arm from a 60% baseline: 37,510 for a 1-point lift, 9,333 for 2 points (simulated power 80.7%), 1,468 for 5 points, from n per arm = (1.96 + 0.84)^2 x the summed variances / the squared gap. Peeking with no real difference: 5.4% false positives testing once vs 19.2% checking daily for 10 days.](diagrams/llm17c_info_golden_sets_and_ab_tests_ai.png)

<details>
<summary><strong>Read as text</strong> — building a golden set, mixing assertion types and handling flaky cases</summary>

**Why it exists.** Prompts are code, but they have no type checker and no compiler. Change one line of the system prompt and you may silently break a case that worked for six months. Without a regression suite you will not find out until a customer does.

**How to build one that works.**

| Property | Guidance |
|---|---|
| **Size** | 50–200 cases. Small enough to run in minutes, large enough to catch real regressions |
| **Source** | **Real production failures**, not invented examples. Every incident adds a case |
| **Coverage** | Happy path, known edge cases, adversarial inputs, and each supported language/format |
| **Assertions** | Prefer deterministic checks where possible: valid JSON, contains citation, refuses correctly, no PII, under N tokens |
| **Versioning** | In git, next to the prompts. A change to either is a reviewable diff |

```yaml
# A golden case is deliberately boring — that is the point.
id: refund-policy-out-of-window
input: "I bought this 400 days ago, can I get a refund?"
assert:
  - must_not_contain: "yes, you can"        # deterministic
  - must_cite_source: true                   # deterministic
  - judge: "Does the reply correctly state the 365-day limit?"   # judged
added_because: "INC-2481 — model invented a 2-year window"
```

Mix the two assertion types: deterministic checks are free, instant and unambiguous — use them for everything you can express. Reserve the judge for the genuinely subjective residue.

**Non-determinism.** The same case can pass on one run and fail on the next. Run each case a few times (3–5) and track its *pass rate*; a case that drops from 5/5 to 3/5 after a change is a regression even though it "still passes" sometimes. (For agents, where one run is many steps, this becomes pass^k — [Ch 18b §18.12](#content/18b_agents_in_production).)

**Say this in an interview:**
> "I'd keep a versioned golden set of 50–200 cases in git alongside the prompts, built mostly from real production failures, and run it in CI on every prompt, model or retrieval change. Most assertions are deterministic — valid JSON, cites a source, correctly refuses — with LLM-as-judge only for the subjective parts. The key discipline is that every incident becomes a permanent test case, so the same failure can't ship twice."

</details>

---

## 4.4 A/B Testing an LLM Feature ★★ `L2`

<details>
<summary><strong>Read as text</strong> — why offline wins fail online, the sample-size formula and a worked example</summary>

**In one line:** offline evaluation tells you the model changed; only an online experiment tells you the *product* got better.

> **Maths in one line:** `n per arm ≈ (z₁₋α/₂ + z₁₋β)² × [p₁(1 − p₁) + p₂(1 − p₂)] ÷ (p₂ − p₁)²` — with the usual 5 % false-positive rate and 80 % power the z-term is (1.96 + 0.84)² ≈ 7.85, and because the gap is squared, halving the lift you want to detect needs **four times** the traffic.

**Why it exists.** Offline wins routinely fail to materialise online. The eval set does not match the real traffic distribution, the judge rewards something users do not care about, or the improvement is real but too small to move behaviour.

**Worked example — how many sessions?** Today 60 % of support sessions end in task success; you want to detect a lift to 62 %. Then n ≈ 7.85 × (0.60 × 0.40 + 0.62 × 0.38) ÷ 0.02² = 7.85 × 0.4756 ÷ 0.0004 ≈ **9,333 sessions per arm**. Hoping for 61 % instead needs about 37,500 per arm; a big 5-point lift needs only about 1,500. Decide this number *before* you start, then look once:

</details>

```python
# A/B test sample size for a success-rate metric, checked by simulation, plus what "peeking" does
import numpy as np
from statistics import NormalDist

def n_per_arm(p1, p2, alpha=0.05, power=0.80):
    z = NormalDist().inv_cdf(1 - alpha / 2) + NormalDist().inv_cdf(power)   # 1.96 + 0.84
    return int(np.ceil(z**2 * (p1 * (1 - p1) + p2 * (1 - p2)) / (p1 - p2) ** 2))

def z_test(s1, s2, n):                                        # two-proportion z statistic
    p = (s1 + s2) / (2 * n)
    return (s2 - s1) / n / np.sqrt(2 * p * (1 - p) / n)

base = 0.60                                                   # today's task-success rate
for lift in (0.02, 0.01, 0.05):
    print(f"detect {base:.0%} -> {base + lift:.0%}: {n_per_arm(base, base + lift):,} sessions per arm")

rng = np.random.default_rng(0)
n = n_per_arm(0.60, 0.62)
sims = 4000
a = rng.binomial(n, 0.60, sims)                               # control arm, 4,000 repeated experiments
b = rng.binomial(n, 0.62, sims)                               # treatment really is +2 points
power = (np.abs(z_test(a, b, n)) > 1.96).mean()
print(f"simulated power at n = {n:,}: {power:.1%}")
assert 0.77 < power < 0.83

# Peeking: NO real difference, but we test after each of 10 daily batches and stop at the first p < 0.05
daily = n // 10
a = rng.binomial(daily, 0.60, (sims, 10)).cumsum(axis=1)
b = rng.binomial(daily, 0.60, (sims, 10)).cumsum(axis=1)
z = z_test(a, b, daily * np.arange(1, 11))
print(f"false positives, one test at the end: {(np.abs(z[:, -1]) > 1.96).mean():.1%}")
print(f"false positives, peeking every day  : {(np.abs(z) > 1.96).any(axis=1).mean():.1%}")
assert (np.abs(z) > 1.96).any(axis=1).mean() > 0.12
```

**Output:**

```
detect 60% -> 62%: 9,333 sessions per arm
detect 60% -> 61%: 37,510 sessions per arm
detect 60% -> 65%: 1,468 sessions per arm
simulated power at n = 9,333: 80.7%
false positives, one test at the end: 5.4%
false positives, peeking every day  : 19.2%
```

<details>
<summary><strong>Read as text</strong> — continued: reading the simulation, the four traps and the metric set</summary>

Reading it: the formula's 9,333 really does give about 80 % power when 4,000 experiments are simulated. The last two lines are the peeking trap in numbers — with no real difference at all, testing once gives the promised ~5 % false positives, but checking every day and stopping at the first "significant" result ships a useless change almost one time in five.

**The four traps interviewers probe:**

| Trap | What goes wrong | Fix |
|---|---|---|
| **Peeking** | Checking daily and stopping at the first significant result inflates false positives badly | Fix the sample size in advance, or use a proper sequential test |
| **Novelty effect** | Users engage with anything new; the lift decays | Run long enough to see it flatten; look at returning-user cohorts |
| **Wrong metric** | Optimising thumbs-up while task completion falls | Pick one primary metric; make the rest **guardrails** that can only block a launch |
| **Ignored variance** | LLM metrics are noisy, so tests are underpowered | Use pre-period covariates (CUPED-style) to cut variance; increase duration before increasing risk |

**The metric set to propose:** one primary (task success, resolution rate, acceptance rate), plus guardrails on latency P95, cost per session, escalation/hand-off rate, and safety incidents. Then state the decision rule *before* launching: "ship if primary is up ≥ 2 % and no guardrail regresses beyond its threshold."

**Say this in an interview:**
> "I'd treat shipping a model as running an experiment. Fix the sample size up front to avoid peeking, choose one primary metric like task completion rather than a vanity metric like thumbs-up, and set guardrails on latency, cost per session and escalation rate. I'd expect some offline gain not to survive contact with real traffic — usually a distribution mismatch between the eval set and production — so I'd close the loop by sampling online failures back into the golden set."

</details>

---

## 4.5 Benchmark Contamination & Goodhart's Law ★ `L1`

**In one line:** public benchmark scores are systematically inflated because the test sets have leaked into pre-training data, and any benchmark that becomes a target stops measuring what it measured.

![Infographic on benchmark contamination and Goodhart's law: a six-step cycle from benchmark published, copied across the web, scraped into pre-training, model memorises answers, score inflates, to benchmark retired. A 2026 case study, as of Nov 2026: OpenAI retired SWE-bench Verified in Feb 2026 (59% of 138 audited hard tasks flawed) and on 8 Jul 2026 retracted its SWE-bench Pro recommendation (about 30% of tasks broken). Defences: private held-out evals, live benchmarks, treat small gaps as noise.](diagrams/llm17c_info_contamination_goodhart_ai.png)

<details>
<summary><strong>Read as text</strong> — why scores inflate, how to talk about it and the 2026 SWE-bench case</summary>

**Why it exists.** Models are trained on scrapes of the whole internet, and benchmark questions and their answers live on that internet. A model can score well by memorisation rather than capability. Meanwhile, once a benchmark drives funding and headlines, it is optimised against directly — Goodhart's law in action.

**How to talk about it:** prefer **held-out, private** evaluation on your own task distribution; check whether a benchmark has a decontaminated or "live"/rolling variant; treat leaderboard deltas under a few points as noise; and note that a suspiciously large gap between benchmark performance and your own eval is a contamination smell.

**The 2026 case study.** In February 2026 OpenAI retired **SWE-bench Verified**, the coding benchmark every lab had quoted: all the frontier models it tested could reproduce some of the original human-written fixes or problem details verbatim — they had seen them in training — and 59 % of the 138 hard tasks it audited had flawed tests or problem statements. It pointed labs to **SWE-bench Pro** instead — then audited that too, estimated that about 30 % of its tasks are broken, and on 8 July 2026 retracted the recommendation. The lesson is not "find the one clean benchmark": every public test leaks or breaks eventually, so audit the tasks behind any score you rely on. Contamination is *prevented* at training time by n-gram decontamination ([Ch 17 §3.1b](#content/17_llm)); at evaluation time all you can do is detect it and move to fresher tests.

> Deeper treatment, with the specific benchmarks that saturated and what replaced them, is in [Ch 33b](#content/33b_llm_interview_questions_part2) and [Ch 20 §20.13](#content/20_2026_landscape).

</details>

---

## The classical metrics you still have to name

> **Moved here from Ch 17** so that evaluation has a single home. These are the metrics interviewers expect you to *name and bound* — you rarely make a shipping decision on them, but "what is perplexity and why isn't it enough?" is a standard question. The decision-making layers are §4.1–§4.5 above.

![Infographic of the classical LLM metrics. Perplexity = e^loss in nats (2^loss only for bits): loss 1.0, 3.0, 4.5 give 2.7, 20.1, 90.0 in nats vs 2.0, 8.0, 22.6 in bits; a 4-bit model's perplexity rises only 3.3% while all 20 answer tokens go wrong. BLEU = BP x (p1 x p2 x p3 x p4)^(1/4): against The cat is on the mat, The cat is sitting on the mat matches 6/7, 4/6, 2/5, 0/4 n-grams (BLEU-3 0.61), while the reversed The mat is on the cat still scores BLEU-3 0.58 and ROUGE-1 recall 1.00. A pick-by-question table maps perplexity, BLEU, ROUGE and human evaluation to their uses.](diagrams/llm17c_info_classical_metrics_ai.png)

---

## 4.6 Intrinsic Metrics — Perplexity & Cross-Entropy ★★ `L2`

<details>
<summary><strong>Read as text</strong> — loss and perplexity in one line, and nats versus bits</summary>

> **Maths in one line:** `loss = −(1/N) Σ ln P(true tokenᵢ)` and `perplexity = e^loss` — the average surprise of the true tokens, turned back into "as unsure as choosing uniformly among this many tokens". With natural logs (what PyTorch reports) use `e^loss`; only a loss measured in bits uses `2^loss`. The derivation and a hand-worked example are in [Ch 17 §1.4](#content/17_llm); this section is about using it as an evaluation number.

</details>

### Perplexity

<details>
<summary><strong>Read as text</strong> — what perplexity means, a worked example and its three limits</summary>

**Perplexity measures how "surprised" the model is by text.** Lower perplexity = the model predicted the text better = a better *language model* on that text.

$\text{Perplexity} = e^{\text{average negative natural-log probability of each true token}}$

```
  Intuition:
  - Perplexity of 1:   the model predicted every token perfectly
  - Perplexity of 10:  on average, as unsure as choosing between
                       10 equally likely tokens
  - Perplexity of 100: very uncertain

  Example: "The cat sat on the ___", true next token "mat"
  Good model: P("mat") = 0.4   → for this token, perplexity 1/0.4   = 2.5
  Bad model:  P("mat") = 0.001 → for this token, perplexity 1/0.001 = 1,000

  Published zero-shot results (same GPT-2 tokenizer, same test set):
  Penn Treebank (per word):  GPT-2 1.5B ≈ 35.8    GPT-3 175B ≈ 20.5   (lower is better)
```

**Three limitations to name:**

1. **Same text, same tokenizer.** Perplexity is per token, so models with different tokenizers cannot be compared on it — use bits-per-byte instead ([Ch 17 §1.4](#content/17_llm)).
2. **It needs the probabilities.** Most closed APIs do not return the probability of text *you* supply, so perplexity is mainly a tool for open models and your own training runs.
3. **It averages over every token.** The few tokens that matter — the number in an answer, the name, the "not" — are drowned out by thousands of easy ones. Low perplexity ≠ a useful, correct or safe model, which is why a quantized model is judged on task evals (§3.1), not perplexity alone.

</details>

### Cross-Entropy Loss

<details>
<summary><strong>Read as text</strong> — the training loss, its link to perplexity and the units table</summary>

Closely related to perplexity. It's the average negative log probability of the correct next token. This is what's directly optimized during training.

$\text{Cross-entropy loss} = -\frac{1}{N} \sum_{i=1}^{N} \ln P(\text{correct token}_i)$

$\text{Perplexity} = e^{\text{cross-entropy loss}}$ (or $2^{\text{loss}}$ if the loss was measured in bits)

```
  Loss 1.0 nats → perplexity  2.7   (very good)
  Loss 3.0 nats → perplexity 20.1   (if the 3.0 were bits: 8)
  Loss 4.5 nats → perplexity 90.0   (if the 4.5 were bits: 22.6)
```

**Run it yourself** — the cat example, the units trap, and a 4-bit model whose perplexity barely moves while every answer breaks:

</details>

```python
# Perplexity from token probabilities, the nats-vs-bits trap, and a small perplexity change hiding broken answers
import numpy as np

def perplexity(p_true):                  # p_true: probability the model gave each TRUE next token
    loss = -np.log(p_true).mean()        # cross-entropy in nats (what PyTorch reports)
    return loss, np.exp(loss)

# 1) The chapter's example: "The cat sat on the ___", true next token "mat"
for name, p in (("good model", 0.4), ("bad model", 0.001)):
    loss, ppl = perplexity(np.array([p]))
    print(f"{name}: P(mat) = {p}, loss {loss:.3f} nats -> perplexity {ppl:,.1f}")

# 2) Units: the same number read as nats or as bits gives a very different perplexity
for loss in (1.0, 3.0, 4.5):
    print(f"loss {loss}: perplexity {np.exp(loss):5.1f} if nats, {2 ** loss:5.1f} if bits")

# 3) A 4-bit model scored on 1,000 tokens: 980 ordinary tokens + 20 answer tokens (a digit, a name)
#    columns: P(true token), P(best wrong token)
base = np.r_[np.tile([0.60, 0.10], (980, 1)), np.tile([0.90, 0.05], (20, 1))]
quant = np.r_[np.tile([0.59, 0.10], (980, 1)), np.tile([0.40, 0.50], (20, 1))]
ppl_base, ppl_quant = perplexity(base[:, 0])[1], perplexity(quant[:, 0])[1]
right_base = (base[980:, 0] > base[980:, 1]).sum()        # answer tokens still ranked first
right_quant = (quant[980:, 0] > quant[980:, 1]).sum()
print(f"perplexity {ppl_base:.3f} -> {ppl_quant:.3f} (+{ppl_quant / ppl_base - 1:.1%})")
print(f"answer tokens ranked first: {right_base} of 20 -> {right_quant} of 20")
assert ppl_quant / ppl_base < 1.05 and right_quant == 0
assert np.isclose(perplexity(np.full(4, 1 / 50_000))[1], 50_000)   # uniform guessing over V -> V
```

**Output:**

```
good model: P(mat) = 0.4, loss 0.916 nats -> perplexity 2.5
bad model: P(mat) = 0.001, loss 6.908 nats -> perplexity 1,000.0
loss 1.0: perplexity   2.7 if nats,   2.0 if bits
loss 3.0: perplexity  20.1 if nats,   8.0 if bits
loss 4.5: perplexity  90.0 if nats,  22.6 if bits
perplexity 1.653 -> 1.708 (+3.3%)
answer tokens ranked first: 20 of 20 -> 0 of 20
```

<details>
<summary><strong>Read as text</strong> — continued: what the numbers show</summary>

Reading it: a loss of 3.0 means perplexity 20 if it came from PyTorch (nats) but 8 if it was in bits — always ask which. The last two lines are the interview point: the quantized model's perplexity rises only 3 %, easy to wave through, yet it now ranks a wrong token first on every one of the 20 tokens that carry the answer.

</details>

---

## 4.7 Extrinsic Metrics — BLEU, ROUGE & Human Evaluation `L1`

<details>
<summary><strong>Read as text</strong> — BLEU versus ROUGE in one line: precision versus recall</summary>

> **Maths in one line:** `BLEU = BP × (p₁ · p₂ · p₃ · p₄)^(1/4)` and `ROUGE-1 recall = shared words ÷ words in the reference` — BLEU asks "how much of what I wrote appears in the reference?" (precision), ROUGE asks "how much of the reference did I cover?" (recall); neither knows what the words mean.

</details>

### BLEU (Bilingual Evaluation Understudy)

<details>
<summary><strong>Read as text</strong> — the formula, a worked n-gram count and the reversed-sentence trap</summary>

Measures overlap between generated text and reference text. Originally designed for machine translation.

$\text{BLEU} = \text{BP} \times \exp\!\left(\sum_{n=1}^{N} \frac{1}{N} \log p_n\right)$

where $p_n$ = **clipped** precision of $n$-grams (a reference n-gram can be matched only as many times as it occurs), $N = 4$ as standard, and BP = brevity penalty: 1 if the output is longer than the reference, otherwise $e^{1 - r/c}$ for reference length $r$ and output length $c$.

```
  Reference: "The cat is on the mat"
  Generated: "The cat is sitting on the mat"

  BLEU counts matching n-grams (lower-cased):
  1-grams: "the", "cat", "is", "on", "the", "mat" match      → 6/7
  2-grams: "the cat", "cat is", "on the", "the mat" match    → 4/6
  3-grams: "the cat is", "on the mat" match                  → 2/5
  4-grams: none of the 4 matches                             → 0/4

  BLEU-3 = (6/7 × 4/6 × 2/5)^(1/3) ≈ 0.61     (BP = 1: output is longer)
  BLEU-4 = 0, because one precision is 0 — which is why BLEU is
  meant for a whole test corpus, and sentence-level tools add smoothing.
  Range: 0 to 1 (often reported × 100)

  Limitation: "The mat is on the cat" scores BLEU-3 ≈ 0.58 — almost the
  same — although the meaning is reversed. BLEU doesn't understand meaning.
```

</details>

### ROUGE (Recall-Oriented Understudy for Gisting Evaluation)

<details>
<summary><strong>Read as text</strong> — ROUGE-1, ROUGE-2 and ROUGE-L, with a worked recall example</summary>

Similar to BLEU but focused on recall (how much of the reference is captured). Used for summarization evaluation.

```
  ROUGE-1: unigram overlap (individual words)
  ROUGE-2: bigram overlap (word pairs)
  ROUGE-L: longest common subsequence

  Reference summary: "The president met with foreign leaders to discuss trade."
  Generated summary: "The president discussed trade with world leaders."

  ROUGE-1 recall: how many reference words appear in the generated text?
  "The" ✓ "president" ✓ "met" ✗ "with" ✓ "foreign" ✗ "leaders" ✓
  "to" ✗ "discuss" ✗ (the output says "discussed") "trade" ✓
  = 5/9 ≈ 0.56     with a stemmer, "discussed" → "discuss": 6/9 ≈ 0.67
```

**Run it yourself** — both examples, plus the reversed sentence:

</details>

```python
# BLEU-style clipped n-gram precision and ROUGE-1 by hand: they count shared words, not shared meaning
import numpy as np
from collections import Counter

def ngrams(words, n):
    return Counter(tuple(words[i:i + n]) for i in range(len(words) - n + 1))

def bleu(candidate, reference, max_n):
    c, r = candidate.lower().split(), reference.lower().split()
    precisions = []
    for n in range(1, max_n + 1):
        cand, ref = ngrams(c, n), ngrams(r, n)
        clipped = sum(min(k, ref[g]) for g, k in cand.items())   # a reference n-gram counts once
        precisions.append(clipped / max(sum(cand.values()), 1))
    bp = 1.0 if len(c) > len(r) else np.exp(1 - len(r) / len(c))  # brevity penalty
    score = bp * np.exp(np.mean(np.log(precisions))) if min(precisions) > 0 else 0.0
    return precisions, score

def stem(w):                                     # a toy stemmer: discussed -> discuss, leaders -> leader
    if w.endswith("ed") and len(w) > 4:
        return w[:-2]
    return w[:-1] if w.endswith("s") and not w.endswith("ss") else w

def rouge1(candidate, reference, stemming=False):
    f = stem if stemming else (lambda w: w)
    c = Counter(f(w) for w in candidate.lower().split())
    r = Counter(f(w) for w in reference.lower().split())
    overlap = sum((c & r).values())
    recall, precision = overlap / sum(r.values()), overlap / sum(c.values())
    return recall, precision, 2 * recall * precision / (recall + precision)

ref = "The cat is on the mat"
for cand in ("The cat is sitting on the mat", "The mat is on the cat"):
    p, b3 = bleu(cand, ref, 3)
    print(f"{cand!r}: p1..p3 = {', '.join(f'{x:.2f}' for x in p)} | BLEU-3 {b3:.2f} "
          f"| BLEU-4 {bleu(cand, ref, 4)[1]:.2f} | ROUGE-1 recall {rouge1(cand, ref)[0]:.2f}")

ref2 = "The president met with foreign leaders to discuss trade"
gen2 = "The president discussed trade with world leaders"
for stemming in (False, True):
    r, p, f1 = rouge1(gen2, ref2, stemming)
    print(f"summary, stemming={stemming}: ROUGE-1 recall {r:.2f}, precision {p:.2f}, F1 {f1:.2f}")
assert round(rouge1(gen2, ref2)[0], 2) == 0.56 and bleu("The mat is on the cat", ref, 4)[1] == 0.0
```

**Output:**

```
'The cat is sitting on the mat': p1..p3 = 0.86, 0.67, 0.40 | BLEU-3 0.61 | BLEU-4 0.00 | ROUGE-1 recall 1.00
'The mat is on the cat': p1..p3 = 1.00, 0.80, 0.25 | BLEU-3 0.58 | BLEU-4 0.00 | ROUGE-1 recall 1.00
summary, stemming=False: ROUGE-1 recall 0.56, precision 0.71, F1 0.63
summary, stemming=True: ROUGE-1 recall 0.67, precision 0.86, F1 0.75
```

<details>
<summary><strong>Read as text</strong> — continued: what word overlap cannot see</summary>

Reading it: the reversed sentence gets a *perfect* ROUGE-1 recall and nearly the same BLEU as the faithful paraphrase — word overlap cannot see who sat on whom. A stemmer (real ROUGE tools use the Porter stemmer as an option) lifts the summary's recall from 0.56 to 0.67 without any change in quality, so always report which settings you used. For open-ended output these metrics have largely given way to embedding-based scores and LLM-as-judge (§4.2); they survive in translation, summarisation and regression tests where a reference text exists.

</details>

### Human Evaluation (The Gold Standard)

<details>
<summary><strong>Read as text</strong> — the rating criteria and checking that raters agree</summary>

No automated metric perfectly captures quality. For critical applications, human evaluation is still the best:

```
  Common human evaluation criteria:
  - Helpfulness: Does this answer the question?
  - Accuracy: Is the information correct?
  - Fluency: Is the language natural?
  - Safety: Is the response harmful in any way?
  - Following instructions: Did it do what was asked?
```

Before trusting human labels, measure how often two raters agree (Cohen's κ corrects that agreement for chance). If your humans agree only 70 % of the time, that is also the ceiling for any judge you calibrate against them (§4.2).

</details>

---

## 4.8 Benchmarks & Arena (formerly Chatbot Arena) `L1`

![Infographic on benchmarks and Arena, as of Nov 2026. Saturated benchmarks: MMLU, HellaSwag, GSM8K, HumanEval. Frontier benchmarks: Terminal-Bench, OSWorld-Verified, GPQA Diamond, AIME and FrontierMath, ARC-AGI-3 (humans 100%, best AI 0.51% at launch), Humanity's Last Exam, LiveCodeBench, with a warning card that SWE-bench Verified was retired in Feb 2026 and the SWE-bench Pro recommendation retracted on 8 Jul 2026. Arena podium from the 27 Oct 2026 table: Gemini 4 Carbon 1528, Gemini 4 Argon 1520, Claude Opus 5.5 1509; P(A beats B) = 1 / (1 + 10^((R_B - R_A) / 400)), so a 19-point gap is a 53% win rate.](diagrams/llm17c_info_benchmarks_and_arena_ai.png)

| Benchmark | What It Tests | Format |
|-----------|--------------|--------|
| MMLU | 57 subjects (math, history, law, medicine...) | Multiple choice |
| HellaSwag | Commonsense reasoning | Sentence completion |
| HumanEval | Code generation (Python) | 164 functions that must pass unit tests |
| MBPP | Code generation (simpler) | 974 short entry-level Python problems |
| GSM8K | Grade school math | Word problems with step-by-step solutions |
| MATH | Competition math (hard) | AMC/AIME-level problems |
| TruthfulQA | Resistance to common misconceptions | Q&A with tricky questions |
| ARC | Science questions (grade school) | Multiple choice |
| WinoGrande | Pronoun resolution | "The trophy doesn't fit in the suitcase because it's too [big/small]" |
| BBH | Hard reasoning tasks | 23 challenging BIG-Bench tasks |
| MT-Bench | Multi-turn conversation quality | 80 multi-turn questions, answers graded by GPT-4 as judge |

> **Saturation warning:** MMLU, HellaSwag, GSM8K and HumanEval are *saturated* — top models score 90 %+, so they no longer separate the frontier, and citing them as a quality signal is a yellow flag. What labs report instead — the last row is a warning, not a recommendation:

| Frontier benchmark | What it tests | Status as of November 2026 |
|---|---|---|
| **Terminal-Bench** | Agent work in a real terminal: inspect files, run commands, recover from errors | Version 4.0 is the current table (top about 65 %, Oct 2026); 2.x is saturated (about 90 %). Scores are not comparable across versions |
| **OSWorld (-Verified)** | Operating a real desktop through screenshots — computer use ([Ch 18 §18.6](#content/18_ai_agents)) | Active |
| **GPQA Diamond** | 198 graduate-level, "Google-proof" science questions | Saturated — top score about 96 % (Epoch AI, Sep 2026) |
| **AIME / FrontierMath** | Competition- to research-level maths (reasoning models) | AIME is close to saturated; FrontierMath Tiers 1–3 are nearly saturated too (95.1 %, Claude Fable 5.2, Epoch AI, 9 Nov 2026) and the harder Tier 4 is topped out (100 %, Fable 5.2 and GPT-6.1 Sol) |
| **ARC-AGI-2 / ARC-AGI-3** | Abstract reasoning from a few examples; ARC-AGI-3 (March 2026) is interactive games with no instructions | ARC-AGI-2 is nearly saturated (95.0 %, Sep 2026). ARC-AGI-3 is current: at launch humans scored 100 % and the best AI 0.51 %; by Sep 2026 the best reached 62.7 % on the Standard harness ([Ch 20 §20.13](#content/20_2026_landscape)) |
| **Humanity's Last Exam** | 2,500 expert-written questions across many fields | Active |
| **LiveCodeBench** | Competitive-programming problems published after a model's training cutoff | Contamination-resistant by design |
| **MMLU-Pro** | Harder, 10-option version of MMLU | Itself approaching saturation |
| **SWE-bench Pro** | Real software-engineering tasks from GitHub repositories — the patch must pass hidden tests | OpenAI found ~30 % of tasks broken and retracted its recommendation on 8 July 2026; some labs still report it, so treat scores as rough. (Its predecessor, SWE-bench Verified, was retired by OpenAI in February 2026 for flawed tests and contamination — §4.5) |

Always say which harness (agent scaffold) and which version a score came from — on agent benchmarks the scaffold moves the number as much as the model. The landscape view, with more scores, is [Ch 20 §20.13](#content/20_2026_landscape).

**Example benchmark questions:**

```
  MMLU (Professional Medicine):
  "A 45-year-old woman presents with fatigue and weight gain.
  Lab results show elevated TSH and low T4. What is the most likely diagnosis?
  A) Hyperthyroidism  B) Hypothyroidism  C) Cushing's  D) Addison's"
  → Answer: B

  HumanEval:
  "Write a function that returns the n-th Fibonacci number."
  → Model writes code, which is tested against hidden test cases.
  → pass@1: Does the first attempt pass all tests?

  GSM8K:
  "Janet has 12 eggs. She uses 3 for breakfast and buys 4 more.
  How many eggs does she have?"
  → Model must show reasoning and arrive at 13.
```

---

### Arena (formerly Chatbot Arena) & Elo-Style Ratings

<details>
<summary><strong>Read as text</strong> — how Arena ranks models, the Elo maths and why a small gap is a coin flip</summary>

Academic benchmarks don't always reflect real-world usefulness. **Arena** — started in 2023 as Chatbot Arena by LMSYS at UC Berkeley, later LMArena, and since January 2026 simply Arena (arena.ai) — ranks models by human preference.

> **Maths in one line:** `P(A beats B) = 1 / (1 + 10^((R_B − R_A) / 400))` — scores sit on the chess-Elo scale, so a 19-point gap means the leader wins only about 53 % of head-to-head votes.

```
  How it works:
  1. A user asks a question
  2. Two anonymous models answer side by side
  3. The user picks the better answer (or a tie)
  4. A Bradley–Terry model fits all the votes at once and reports
     each model's score on the Elo scale, with a confidence interval

  Snapshot — text leaderboard, arena.ai default view (style control on),
  9 November 2026 (it changes often):
  1. Gemini 4 Carbon    1526 ± 10
  2. Gemini 4 Argon     1522 ± 5
  3. Muse Wonder (Meta) 1511 ± 6
  4. Claude Opus 5.5    1506 ± 6
  1526 vs 1506: P = 1 / (1 + 10^(-20/400)) ≈ 0.53 — nearly a coin flip
```

**Why this matters:** a model can top Arena yet trail on agentic coding benchmarks such as Terminal-Bench, or the reverse — real-world preference ≠ benchmark scores. Two cautions: votes reward style (length, headings, bullet points), which is why Arena's default ranking now controls for style (the raw-vote ranking is still published); and labs can test several private variants before a launch and publish only the best one (the main criticism in "The Leaderboard Illusion", 2025). Treat models whose confidence intervals overlap as tied, and check arena.ai for today's table.

</details>

---

---
# PART 5 — PUTTING IT TOGETHER

---

## 5.1 The Serving Stack

![Infographic comparing LLM serving engines: vLLM (default for self-hosting), SGLang (RadixAttention prefix tree, strict JSON, agents), TensorRT-LLM (peak NVIDIA performance, FP8 and FP4 kernels), Ollama and llama.cpp (local and on-device, GGUF) and managed APIs (zero ops, pay per token). TGI is shown greyed out, in maintenance mode since 11 Dec 2025; NVIDIA Dynamo and llm-d sit above the engines for disaggregation and KV-aware routing. A prefix-tree picture shows a shared system prompt reused across agent steps.](diagrams/llm17c_info_serving_stack_ai.png)

<details>
<summary><strong>Read as text</strong> — the engine table, what replaced TGI and RadixAttention</summary>

| Engine | Strengths | Choose it when |
|---|---|---|
| **vLLM** | PagedAttention, continuous batching, prefix caching, speculative decoding, multi-LoRA, OpenAI-compatible server; broadest model and hardware support | Default choice for self-hosting |
| **SGLang** | RadixAttention (a prefix-tree KV cache that shares across requests automatically), strong structured-output and constrained-decoding support | Heavy prompt reuse, agents, strict JSON output |
| **TensorRT-LLM** | Deepest NVIDIA hardware optimisation, FP8/FP4 kernels | Maximum performance on NVIDIA, willing to pay in build complexity |
| **Ollama / llama.cpp** | CPU and consumer GPU, GGUF quantization, trivial setup | Local development, on-device, small models |
| **Managed APIs** | Zero ops, elastic, pay per token | Low or spiky volume; before you have proven product-market fit |

Hugging Face's TGI, once a common default, has been in maintenance mode since 11 December 2025, and Hugging Face itself recommends vLLM or SGLang. At very large scale, orchestration layers such as NVIDIA Dynamo and llm-d sit *above* these engines to add prefill/decode disaggregation (§2.6) and KV-cache-aware routing. Products, versions and hello-world code are in [Ch 19 §19.11](#content/19_ai_frameworks); this section is about *why* each one wins.

**RadixAttention in one line** (since it pairs with §2.4): SGLang keeps a *prefix tree* of cached KV states across all requests, so any shared prefix is reused automatically without you having to declare it — particularly effective for agent loops, where each step resends the growing history.

</details>

---

## 5.2 Capacity & Cost — A Worked Example

![Infographic of the capacity and cost worked example, prices as of Nov 2026: 1M requests a day with 500 input and 200 output tokens is 500M input plus 200M output tokens a day. At 4 / 20 USD per 1M tokens the API costs 6,000 USD a day, about 182,500 a month (mid tier 91,250). Self-hosting a 70B model needs about 3.4 PFLOP/s at peak: INT4 weight-only needs 9 H100s (2 nodes, 35,040 a month) while FP8 needs 6 (1 node, 17,520 a month). One node beats the API above about 2.0B tokens a month at frontier prices or 4.1B at mid-tier prices; this workload is 21.3B.](diagrams/llm17c_info_capacity_and_cost_ai.png)

<details>
<summary><strong>Read as text</strong> — the scenario, token volume, API cost and how many GPUs</summary>

Interviewers ask you to do this arithmetic out loud. Practise it once and it becomes free marks.

> **Maths in one line:** `API cost per day = requests × (in_tokens × p_in + out_tokens × p_out)` and `GPUs ≈ peak tokens/s × 2 × parameters ÷ (GPU FLOP/s × MFU)` — the first is a price-list lookup; the second says every token, input or output, costs about 2 FLOPs per parameter, and MFU is the share of the GPU's peak you actually achieve.

**The scenario.** A chat feature: 1,000,000 requests/day, averaging 500 input tokens and 200 output tokens. Prices are per 1M tokens, from the November 2026 snapshot in [Ch 17b §13.3](#content/17b_llm_applications): a frontier tier at 4 USD input and 20 output (Claude Opus 5.5), and a mid tier at 2 and 10 (GPT-6.1 Sol, Claude Sonnet 5.5).

**Step 1 — token volume.**

$$\text{input} = 10^6 \times 500 = 500\text{M tokens/day} \qquad \text{output} = 10^6 \times 200 = 200\text{M tokens/day}$$

**Step 2 — API cost** (frontier tier):

$$500 \times 4 + 200 \times 20 = 2{,}000 + 4{,}000 = 6{,}000 \text{ USD/day} \approx 182{,}500 \text{ USD/month}$$

The mid tier halves that (91,250 a month). Caching 60 % of the input at a tenth of its price saves only 18 % (149,650 a month), because output is two-thirds of this bill.

**Step 3 — self-hosting.** The average output rate is 200M ÷ 86,400 s ≈ 2,315 tokens/s; size for a 3× peak, so 6,944 output plus 17,361 input tokens/s. Every token costs about 2 × 70B = 140 GFLOPs, so the peak needs about 3.4 PFLOP/s. At a realistic 40 % MFU:

- **INT4 weight-only** still multiplies in BF16 (989 TFLOPS per H100) → 8.6 GPUs → 9, in practice 2 nodes of 8.
- **FP8 W8A8** uses the FP8 tensor cores (1,979 TFLOPS) → 4.3 GPUs → 6 (FP8 weights need 2 GPUs per copy) → **1 node**.

At 3 USD per H100-hour ([Ch 29 §24.1](#content/29_gpus_tpus_infrastructure) quotes about 3–4 on demand; some providers are cheaper) one node costs 8 × 3 × 730 h ≈ 17,520 USD a month. That is the §3.1 lesson in money: this workload is input-heavy, so prefill dominates the FLOPs, and the format that speeds up prefill halves the hardware. The calculator also checks the other limit — memory bandwidth — and finds each decode step needs about 20 ms of weight and cache reads, inside a 30 ms per-token target:

</details>

```python
# Capacity & cost calculator: API bill vs self-hosting a 70B model on H100s (every input is a named assumption)
import math

REQ_PER_DAY, IN_TOK, OUT_TOK = 1_000_000, 500, 200
DAYS_PER_MONTH = 730 / 24                     # 730 hours = the usual cloud month (30.4 days)
PEAK_TO_MEAN = 3                              # busiest hour vs the daily average

# 1) API: USD per 1M tokens, input and output billed separately; cached input billed at 10%
def api_per_day(p_in, p_out, cached_share=0.0):
    p_in_eff = p_in * (1 - cached_share + cached_share * 0.10)
    return REQ_PER_DAY * (IN_TOK * p_in_eff + OUT_TOK * p_out) / 1e6

assert api_per_day(4, 20) == 6000             # 500M x 4 + 200M x 20, per 1M tokens
for name, p_in, p_out, cached in (("frontier tier (4 / 20)", 4, 20, 0), ("mid tier (2 / 10)", 2, 10, 0),
                                  ("frontier, 60% input cached", 4, 20, 0.6)):
    day = api_per_day(p_in, p_out, cached)
    print(f"API {name:27s}: {day:6,.0f} USD/day = {day * DAYS_PER_MONTH:8,.0f} USD/month")

# 2) Self-hosting: every token, input or output, costs about 2 x N FLOPs
N, MFU = 70e9, 0.40                           # parameters; share of peak FLOP/s really achieved
BW, BW_EFF = 3.35e12, 0.6                     # H100 HBM bytes/s and the share of it achieved
KV_PER_TOKEN, TPOT = 327_680, 0.030           # Llama-3-70B: 320 KiB of KV per token (sec 1.2); 30 ms
GPU_HOUR = 3.00                               # USD per H100-hour on demand (Ch 29: about 3-4)

in_peak = REQ_PER_DAY * IN_TOK / 86_400 * PEAK_TO_MEAN
out_peak = REQ_PER_DAY * OUT_TOK / 86_400 * PEAK_TO_MEAN
print(f"output tokens/sec: {out_peak / PEAK_TO_MEAN:,.0f} average; peak {in_peak:,.0f} in + {out_peak:,.0f} out")

# (label, dense FLOP/s of the matmul format, GPUs per model copy); weights are 35 GB per GPU in both
for label, flops, replica in (("INT4 weight-only (BF16 maths)", 989e12, 1), ("FP8 W8A8 (FP8 maths)", 1979e12, 2)):
    need = (in_peak + out_peak) * 2 * N / (flops * MFU)
    gpus = math.ceil(need / replica) * replica
    nodes = math.ceil(gpus / 8)
    batch = out_peak / gpus * TPOT            # sequences decoding at once per GPU (Little's law)
    kv = batch * (IN_TOK + OUT_TOK / 2) * KV_PER_TOKEN
    step = (35e9 + kv) / (BW * BW_EFF)        # bandwidth floor of one decode step (sec 1.1)
    assert step < TPOT                        # at this batch, memory bandwidth is not the limit
    print(f"{label}: {need:.1f} GPUs of compute -> {gpus} GPUs -> {nodes} node(s) of 8 "
          f"= {nodes * 8 * GPU_HOUR * 730:,.0f} USD/month")
    print(f"   check: {batch:.0f} decodes per GPU, KV {kv / 2**30:.1f} GiB, decode step >= {step * 1e3:.0f} ms")

# 3) Break-even: how many tokens a month make one 8-GPU node cheaper than the API?
node_month = 8 * GPU_HOUR * 730
volume = REQ_PER_DAY * (IN_TOK + OUT_TOK) * DAYS_PER_MONTH
for name, p_in, p_out in (("frontier", 4, 20), ("mid", 2, 10)):
    blended = (IN_TOK * p_in + OUT_TOK * p_out) / (IN_TOK + OUT_TOK)   # USD per 1M tokens
    print(f"break-even vs {name} tier: {node_month / blended / 1e3:.1f}B tokens/month "
          f"(this workload: {volume / 1e9:.1f}B)")
```

**Output:**

```
API frontier tier (4 / 20)     :  6,000 USD/day =  182,500 USD/month
API mid tier (2 / 10)          :  3,000 USD/day =   91,250 USD/month
API frontier, 60% input cached :  4,920 USD/day =  149,650 USD/month
output tokens/sec: 2,315 average; peak 17,361 in + 6,944 out
INT4 weight-only (BF16 maths): 8.6 GPUs of compute -> 9 GPUs -> 2 node(s) of 8 = 35,040 USD/month
   check: 23 decodes per GPU, KV 4.2 GiB, decode step >= 20 ms
FP8 W8A8 (FP8 maths): 4.3 GPUs of compute -> 6 GPUs -> 1 node(s) of 8 = 17,520 USD/month
   check: 35 decodes per GPU, KV 6.4 GiB, decode step >= 21 ms
break-even vs frontier tier: 2.0B tokens/month (this workload: 21.3B)
break-even vs mid tier: 4.1B tokens/month (this workload: 21.3B)
```

<details>
<summary><strong>Read as text</strong> — continued: the honest answer and the cheapest win first</summary>

**Step 4 — the honest answer.** Self-hosting looks 5–10× cheaper (17,520–35,040 against 182,500 a month), but that comparison holds only once you add: engineering headcount to run it; redundancy (a spare node or a second region can double the hardware); capacity sized for the peak, so at an average hour two-thirds of it sits idle; and the quality gap between a 70B open model and a frontier model. The last two lines put the threshold in numbers: one node only beats the API above about 2 billion tokens a month at frontier prices (4 billion at mid-tier prices). The senior answer is: **start on the API, instrument cost per session, and move to self-hosting when sustained, predictable volume reaches several billion tokens a month** — this workload, at 21 billion, clearly qualifies.

**Step 5 — the cheapest win first.** Before any of that: cache. Prompt caching bills a repeated prefix at 2.5–10 % of the input price (§2.4), and a semantic cache that answers 30 % of requests outright removes 30 % of the bill — a day of work and no new infrastructure.

</details>

---

## 5.3 What Goes Wrong in Production

![Infographic mapping eight production symptoms to causes and fixes, such as P99 TTFT spikes from long prefills (chunked prefill, admission control), throughput collapse from an exhausted KV cache, OOM under load, prompt bloat, quality drops after quantization, offline-online eval mismatch, slower speculative decoding and semantic-cache collisions. A decision tree from what dominates your traffic splits into prefill-bound (FP8 W8A8, prefix caching, chunked prefill, skip speculation), decode-bound (INT4 weight-only or FP8, continuous batching sized by P99 TPOT, speculation at low batch, GQA or MLA) and KV-bound (FP8 KV cache, chunked prefill mandatory, disaggregation at scale).](diagrams/llm17c_info_failures_and_decision_tree_ai.png)

<details>
<summary><strong>Read as text</strong> — eight symptoms, their likely causes and the fixes</summary>

| Symptom | Likely cause | Fix |
|---|---|---|
| P99 TTFT spikes, mean is flat | Long prefills blocking the scheduler | Chunked prefill (§2.3; on by default in vLLM V1 — tune `max_num_batched_tokens`); admission control |
| Throughput collapses as users grow | KV cache exhausted → batch size forced down | Quantize weights and/or KV (§3.1–3.2); cap max context |
| Out-of-memory only under load | KV fragmentation, or `max_model_len` set too high | Paged KV (§2.2); lower max context; reserve headroom |
| Cost per request creeps up quietly | Prompt bloat — few-shot examples and tool defs growing | Audit prompt length; exploit prefix caching (§2.4) |
| Quality drops after a "harmless" quantization | Long-form and instruction-following degrade first | Task evals before/after (§4.3), not perplexity |
| Offline eval improved, users unhappy | Eval distribution ≠ production distribution | Rebuild golden set from real traffic; A/B it (§4.4) |
| Speculative decoding made it *slower* | Acceptance rate too low, or batch already saturated | Measure α; disable above a batch-size threshold |
| Answers occasionally wrong for the wrong user | Semantic cache collision | Per-user keys, higher threshold, or disable it |

</details>

---

## 5.4 Decision Tree — Pick Your Serving Configuration

<details>
<summary><strong>Read as text</strong> — the decision tree: prefill-bound, decode-bound or both</summary>

```
START: what dominates your traffic?
│
├─ Long prompts, short outputs (summarise, extract, classify)
│    → PREFILL-bound
│    → FP8 W8A8 quantization (FP4 on Blackwell) — speeds up prefill
│    → aggressive prefix caching
│    → chunked prefill to protect other users
│    → speculative decoding: usually NOT worth it
│
├─ Short prompts, long outputs (chat, code, agents)
│    → DECODE-bound
│    → INT4 weight-only or FP8 (both cut bytes read per token)
│    → continuous batching, batch size set by P99 TPOT target
│    → speculative decoding IF batch is low and output is predictable
│    → GQA/MLA model to shrink KV cache
│
└─ Long prompts AND long outputs (long-context agents, doc chat)
     → BOTH — and KV cache is your binding constraint
     → FP8 KV cache; consider INT4 KV with long-context evals
     → chunked prefill is mandatory (default in vLLM V1; size max_num_batched_tokens)
     → at very large scale, consider prefill/decode disaggregation
```

</details>

---

## Interview Questions

1. Explain prefill versus decode. Which is compute-bound and which is memory-bandwidth-bound, and why?
2. Compute the KV cache for a 70B model with GQA at 32K context. What does that imply for batch size?
3. What is continuous batching, and why does it need paged KV memory underneath?
4. Your P99 inter-token latency spikes but the mean is unchanged. Diagnose it.
5. Does weight-only INT4 quantization speed up prefill? Justify your answer.
6. When does speculative decoding *not* help?
7. Name three biases of LLM-as-judge and how you would mitigate each.
8. How would you know a quantized model got worse? Perplexity is not an acceptable answer on its own.
9. Design an evaluation stack for a customer-support assistant.
10. Estimate the monthly cost of a chat feature at 1M requests/day, then argue for or against self-hosting.
11. What is prefix caching, and how should it change the way you *write* prompts?
12. When is disaggregated prefill/decode serving justified, and when is it over-engineering?
13. You doubled the batch size and throughput rose, yet users complain. Which number did you forget to watch?
14. A model does not fit on one GPU. When do you use tensor, pipeline or expert parallelism, and when do you just add replicas?
15. What do FP8 and FP4 (NVFP4 / MXFP4) give you that INT4 weight-only quantization does not?
16. A judge seems to prefer whichever answer it sees first. How do you detect that, and which win rate do you report?
17. How many sessions per arm do you need to detect a lift from 60 % to 62 % task success — and what goes wrong if you check the dashboard every day?
18. Why did OpenAI retire SWE-bench Verified in February 2026 and then retract its recommendation of SWE-bench Pro in July — and how would you judge a coding model today?
19. A training log shows a loss of 3.0. What is the perplexity, and what do you need to know before you answer?

---

## Key Takeaways

- **Prefill vs decode is the master model.** Compute-bound versus bandwidth-bound explains nearly every serving question.
- **A single stream is capped by memory bandwidth.** A 70B in FP16 sharded over 2×H100 streams 70 GB per GPU per token, capping one stream near 48 tokens/sec; at INT4 on one GPU it is ~96. Batching, quantization, speculation and more shards are the ways around it.
- **KV cache is usually the binding constraint**, not the weights — especially past 32K context. GQA and MLA exist because of that formula.
- **Continuous batching is the biggest single throughput win** — Orca reported 36.9× over FasterTransformer, and Anyscale measured ~8× from continuous batching alone (up to 23× with vLLM) — and it requires paged KV memory to work.
- **Goodput, not throughput, is the capacity you can sell** — requests per second that meet every latency SLO. End-to-end latency = TTFT + TPOT × (N − 1) for N output tokens.
- **Split to fit, replicate to scale.** Tensor parallelism inside an NVLink node lowers per-token latency (bandwidth adds up); pipeline parallelism fits a bigger model but does not speed one stream; expert parallelism spreads an MoE's experts (an all-to-all every layer); replicas add throughput only. Size one replica to the latency SLO, then the number of replicas to the traffic.
- **Weight-only quantization helps decode; W8A8/FP8 helps both** (FP4 on Blackwell). Never blur them. INT4 weights put a 70B on one H100 with about 39 GiB left for KV cache.
- **Put the variable part of your prompt last** so prefix caching can work — only whole blocks of an identical prefix are reused.
- **Evaluation is a four-layer stack**, and every production failure must become a permanent golden-set case.
- **Debias the judge.** Judge every pair in both orders, count only verdicts that survive the swap, and calibrate on 100–200 human labels.
- **Size A/B tests before launch.** About 9,333 sessions per arm to see 60 % → 62 %; checking every day instead of once pushes false positives from 5 % to about 19 %.
- **Perplexity = e^loss (in nats).** Compare it only on the same text and tokenizer; a 3 % rise can hide answers that are all wrong.
- **Benchmarks expire.** SWE-bench Verified was retired in February 2026 (flawed tests, contamination), and OpenAI retracted its recommendation of SWE-bench Pro in July after finding ~30 % of its tasks broken. Quote Terminal-Bench, OSWorld, ARC-AGI or Humanity's Last Exam with the harness and the date, and trust your own private eval most. An Arena gap of 19 points is only a 53 % win rate.
- **Do the cost arithmetic out loud.** Tokens/day → USD/day → GPUs at peak → break-even. At frontier prices one 8×H100 node (about 17,500 USD a month) beats the API only above roughly 2 billion tokens a month.

---

## Review Questions — Test Your Understanding

**Worked numbers**

1. Four requests finish in 9.6 s and two of them meet the latency SLO. Throughput is 0.42 requests/s — what is goodput, and why does the difference matter?
2. DeepSeek-V3 has 671B parameters stored in FP8. Does it fit on one 8 × H100 node?
3. An agent prompt is 3,000 stable tokens plus 500 new ones, with 16-token cache blocks and a 95 % prefix-cache hit rate. How many tokens are prefilled per request on average?
4. A judge prefers answer B 65 % of the time when B is shown first and 40 % when it is shown second. What does that tell you, and what do you report?
5. Baseline task success is 60 %. You can afford only 2,500 sessions per arm. Roughly what is the smallest lift you can reliably detect?
6. A training log shows a loss of 2.3. What is the perplexity?
7. Model A scores 1528 on Arena and model B 1509, each about ± 8. How often does A win a head-to-head vote, and is A "better"?
8. At 4 USD per 1M input tokens and 20 per 1M output tokens, what does 1M requests/day of 500 in + 200 out cost per month, and above what monthly volume does one 8×H100 node at 3 USD per GPU-hour become cheaper?
9. Why does "The mat is on the cat" score almost the same BLEU as "The cat is sitting on the mat" against the reference "The cat is on the mat"?

<details>
<summary>Answers — questions 1–9</summary>

1. Goodput counts only requests that meet every SLO: 2 ÷ 9.6 ≈ **0.21 requests/s**, half the raw throughput. Sizing on throughput would promise twice the capacity you can actually deliver within the SLO.
2. **Not in practice.** The weights alone are about 671 GB against 8 × 80 = 640 GB of HBM (about 687 GB if you count each card's true 80 GiB) — either way nothing is left for the KV cache, activations and runtime. It fits one 8 × H200 node (1,128 GB); at scale DeepSeek serves it disaggregated, with expert parallelism across many nodes.
3. Only whole blocks are reused: ⌊3,000 ÷ 16⌋ × 16 = 2,992 tokens. Average prefill = 3,500 − 0.95 × 2,992 ≈ **658 tokens**, about 19 % of the uncached 3,500.
4. The verdict moves 25 points with the order alone, so position bias is strong. The averaged rate (52.5 %) cancels the bias but is diluted towards 50 %; report the win rate over the pairs whose verdict survives the swap, count the rest as ties, and report how often verdicts flip — at least 25 % of them do here.
5. Solve the sample-size formula for the gap: Δ ≈ √(7.85 × 0.48 ÷ 2,500) ≈ 0.039, so about **4 points** (60 % → 64 %). Anything smaller needs more traffic or a longer test.
6. If the loss is in nats (PyTorch's default), e^2.3 ≈ **10** — as unsure as choosing among ten tokens. If it were in bits, 2^2.3 ≈ 4.9. Always ask which.
7. P = 1 ÷ (1 + 10^(−19/400)) ≈ **53 %** — barely better than a coin flip, and the confidence intervals overlap, so treat them as tied on Arena and decide with your own evals.
8. 500 × 4 + 200 × 20 = 6,000 USD a day ≈ **182,500 USD a month**. One node costs 8 × 3 × 730 = 17,520 USD a month; the blended price is (500 × 4 + 200 × 20) ÷ 700 ≈ 8.57 USD per 1M tokens, so break-even is 17,520 ÷ 8.57 ≈ **2 billion tokens a month** (before staff, redundancy and peak headroom).
9. BLEU counts shared n-grams. The reversed sentence shares every word and most bigrams with the reference (precisions 1.00, 0.80, 0.25 → BLEU-3 ≈ 0.58 against 0.61 for the paraphrase), and its ROUGE-1 recall is a perfect 1.00. Neither metric knows who sat on whom.

</details>

**Concepts to explain out loud**

<details>
<summary>Answers to the seven questions below — try them first</summary>

1. Single-stream decode reads every weight once per token, so its speed is bytes ÷ bandwidth; the arithmetic units are mostly idle waiting for memory. More FLOPs change nothing; more bandwidth (H200), fewer bytes (quantization) or more tokens per read (batching, speculation) do.
2. 2 × 60 × 8 × 128 × 2 bytes = 245,760 bytes = 240 KiB per token; × 16,384 tokens = **3.75 GiB** (about 4.0 GB) for one request.
3. The base weights are identical for every request, so x·W is one shared matmul. Each request then adds its own small low-rank term x·A·B, computed by batched kernels that gather each request's adapter; nothing in the base matmul depends on which adapter a request uses.
4. With α = 0.45 and k = 4, expected tokens per target pass = (1 − 0.45⁵) ÷ 0.55 ≈ 1.78. With a cheap draft (c = 0.05) the speed-up is 1.78 ÷ 1.2 ≈ 1.49×; with a costly one (c = 0.2) it is 1.78 ÷ 1.8 ≈ 0.99× — a net loss. Keep it only if the draft is very cheap, and measure end-to-end at your real batch size, where the gain shrinks further.
5. Believe the A/B test — users are the ground truth and judges measure proxies. Then check that engagement really is the primary metric (and not a vanity metric), check the judge for verbosity and position bias, sample the cases where judge and users disagree, and fix the rubric or add an assertion for what the judge missed.
6. Prefix caching reuses only an identical prefix, block by block. A timestamp in the first tokens makes every request's prefix unique, so nothing is ever reused: every request pays full prefill time and full input price, instead of the 2.5–10 % that cached input tokens cost.
7. Long-context retrieval tests at the target length, comparing FP16 or FP8 KV against INT4 KV: needle and multi-needle recall at several depths, RULER-style multi-hop tasks, and your own long-document task evals — because recall of facts deep in the context is what INT4 KV degrades first. Check latency and throughput too, since the extra context is the point of the change.

</details>

1. Why does adding a GPU with more FLOPs but identical memory bandwidth fail to improve single-stream decode speed?
2. A model has 60 layers, 8 KV heads, head dimension 128, served in FP16. What is the KV cache for one 16K-token request?
3. Why can requests using *different* LoRA adapters share a single batch?
4. You measure a speculative-decoding acceptance rate of 0.45 with a 4-token draft. Should you keep it on? Show the arithmetic.
5. Your judge says the new prompt is better; your A/B test says engagement fell. Which do you believe, and what do you do next?
6. Explain why a timestamp at the start of a system prompt can materially increase your inference bill.
7. Your team wants INT4 KV cache to double context length. What specific evaluation would you run before agreeing?
