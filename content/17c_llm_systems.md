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
- Compute a **KV cache budget** from first principles and explain why GQA and MLA exist
- Describe **continuous batching** well enough to implement it
- Say which optimisations help **TTFT** and which help **TPOT** — and never confuse them
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
| Attention variants (MHA / MQA / GQA) — the *mechanism* | [Ch 17 §2.4](#content/17_llm) | Model layer. Here we only cover their **serving consequences** |
| Quantization, speculative decoding, PagedAttention — *hardware-side* treatment | [Ch 29 §24.9](#content/29_gpus_tpus_infrastructure) | Overlaps this chapter; Ch 29 covers the hardware angle, this chapter the scheduler/serving angle |
| Prompting, RAG, agents, fine-tuning, APIs, cost, safety | [Ch 17b — LLM Applications](#content/17b_llm_applications) | Application layer |
| Vector index internals — HNSW, IVF-PQ, hybrid search | [Ch 28 — Semantic Search](#content/28_semantic_search) | Retrieval layer |
| Agent-specific evaluation and telemetry | [Ch 18b §18.12](#content/18b_agents_in_production) | Agent layer |

> If you only have time for one thing: **Part 1**. Almost every inference question in an interview is a prefill-vs-decode question wearing a disguise.

---

# PART 1 — THE TWO PHASES OF INFERENCE

---

## 1.1 Prefill vs Decode ★★★ `L3`

**In one line:** generating text has two completely different phases — reading your prompt (fast, parallel, compute-hungry) and writing the answer (slow, one token at a time, memory-hungry) — and almost every optimisation helps exactly one of them.

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

**The mechanism.** Here is the part that makes it click. In decode, at batch size 1, the GPU must stream **every weight in the model** out of memory to produce **one single token**. The arithmetic is trivial; the data movement is enormous. So the theoretical ceiling is set purely by memory bandwidth:

$$\text{max tokens/sec} = \frac{\text{per-GPU bandwidth}}{\text{bytes of weights held per GPU}}$$

Note *per GPU*. A 70B model in FP16 is 140 GB, which does not fit on a single 80 GB H100 — it needs at least two, with tensor parallelism splitting the weights. Each GPU then holds 70 GB and both stream **concurrently**, so:

$$\frac{3350 \text{ GB/s}}{70 \text{ GB}} \approx 48 \text{ tokens/sec}$$

Quantize the same model to INT4 (35 GB) and it fits on **one** H100:

$$\frac{3350 \text{ GB/s}}{35 \text{ GB}} \approx 96 \text{ tokens/sec}$$

**That ceiling is hard for a single request, no matter how fast the GPU's math units are.** You cannot compute your way out of it. This single calculation explains why:

- Batching helps enormously (the same weight read now serves 64 requests instead of 1)
- Quantization helps decode (fewer bytes to move — and it halved the number above)
- Buying a GPU with more FLOPs but the same bandwidth does nothing for decode
- Adding a second GPU with tensor parallelism helps decode, because bandwidth adds up
- Speculative decoding helps (it produces several tokens per weight-read)

> **Watch the units in an interview.** Candidates routinely divide total model bytes by *one* GPU's bandwidth and quote a number that is 2–8× too pessimistic. Always state how many GPUs the weights are sharded across.

Prefill is the mirror image. Those 2,000 tokens are processed as one large matrix multiplication, so the GPU's math units are saturated and bandwidth is not the constraint. Prefill is **compute-bound**.

**When each one matters.**

| Your workload | Dominated by | Optimise |
|---|---|---|
| Long documents, short answers (summarise, classify, extract) | **Prefill** | Chunked prefill, prefix caching, W8A8/FP8, more FLOPs |
| Short prompts, long answers (chat, code generation, agents) | **Decode** | Continuous batching, quantization, speculative decoding, GQA |
| RAG (big retrieved context, medium answer) | Both — usually prefill first | Prefix-cache the system prompt; measure before guessing |

**Say this in an interview:**
> "Inference has two phases with opposite bottlenecks. Prefill processes the whole prompt in parallel — it's compute-bound and sets TTFT. Decode generates one token at a time and has to re-read the entire model from memory for each token — it's memory-bandwidth-bound and sets TPOT. A 70B in FP16 is 140 GB, so it's sharded over two H100s; each streams 70 GB per token at 3.35 TB/s, which caps a single stream near 48 tokens per second. Quantize to INT4 and it fits on one GPU at 35 GB, roughly doubling that. Either way you can't add FLOPs to fix it — you reduce bytes, batch, or speculate."

**They will then ask:** *"So how do you get past that ceiling?"*
You don't — not for one request on fixed hardware. You either (a) reduce bytes moved via quantization, (b) amortise the weight read across many concurrent requests via batching, (c) produce more than one token per weight-read via speculative decoding, or (d) shard across more GPUs so aggregate bandwidth rises. Those are the levers, and they compose.

---

## 1.2 The KV Cache, With Real Numbers ★★★ `L3`

**In one line:** the KV cache stores the attention keys and values for every token you have already processed, so each new token costs one step of work instead of re-reading the whole conversation — and it is usually the thing that runs you out of GPU memory.

**Why it exists.** Without it, generating token 500 means recomputing attention over tokens 1–499 from scratch. Generation would be quadratic in output length and unusably slow. The cache trades memory for time. The trouble is how much memory.

**The mechanism — the formula worth memorising.**

$$\text{KV bytes} = 2 \times L \times H_{kv} \times d_h \times S \times b$$

| Symbol | Meaning |
|---|---|
| 2 | one tensor for K, one for V |
| $L$ | number of layers |
| $H_{kv}$ | number of **key/value** heads (not query heads) |
| $d_h$ | dimension per head |
| $S$ | sequence length (tokens so far) |
| $b$ | bytes per element (2 for FP16, 1 for FP8) |

**Worked example — Llama-3-70B** ($L=80$, $d_h=128$, FP16 so $b=2$):

*If it used plain multi-head attention* ($H_{kv} = 64$):

$$2 \times 80 \times 64 \times 128 \times 2 = 2{,}621{,}440 \text{ bytes} = \textbf{2.5 MB per token}$$

At an 8,192-token context that is **20 GB for a single request**. Serving ten concurrent users would need 200 GB of KV cache — more than an H100 has, before you have even loaded the model.

*With grouped-query attention* ($H_{kv} = 8$, which is what Llama 3 actually uses):

$$2 \times 80 \times 8 \times 128 \times 2 = 327{,}680 \text{ bytes} = \textbf{320 KB per token}$$

At 8,192 tokens: **2.5 GB per request**. An 8× reduction — and that is the entire reason GQA exists.

| Context length | KV cache per request (Llama-3-70B, GQA, FP16) |
|---|---|
| 4K | 1.25 GB |
| 8K | 2.5 GB |
| 32K | 10 GB |
| 128K | 40 GB |

> **Note the shape of that table.** At 128K context the KV cache (40 GB) is approaching the size of the *quantized model itself*. This is why "KV cache is bigger than the weights at long context" is now a standard interview remark, and why KV-cache quantization (§3.2) became a topic.

**The serving consequences of attention variants.** The mechanism of MHA, MQA and GQA lives in [Ch 17 §2.4](#content/17_llm) (MLA is newer and has no mechanism section in this book yet); what matters *here* is what each one does to that formula:

| Variant | Effect on $H_{kv}$ | KV cache | Quality cost | Used by |
|---|---|---|---|---|
| **MHA** — multi-head | $H_{kv} = H$ | Baseline | None | GPT-2, early models |
| **MQA** — multi-query | $H_{kv} = 1$ | ÷ H (huge) | Noticeable | PaLM, Falcon |
| **GQA** — grouped-query | $H_{kv} = H/g$ | ÷ g (e.g. ÷8) | Near-zero | Llama 3, Mistral, most of 2026 |
| **MLA** — multi-head latent | compresses K,V to a low-rank latent vector; only the latent is cached | ÷ 5–13 | Near-zero, sometimes better | DeepSeek-V2/V3 |

**Say this in an interview:**
> "KV cache size is 2 × layers × KV-heads × head-dim × sequence-length × bytes. For Llama-3-70B with GQA that's about 320 KB per token, so a 128K-token context is roughly 40 GB — comparable to the quantized weights. That's why GQA replaced MHA, why MLA is interesting, and why KV-cache quantization and paging exist. Your maximum batch size at a given context length is basically GPU memory minus weights, divided by that number."

**They will then ask:** *"How many concurrent requests can you serve, then?"*
Take total VRAM, subtract the weights, subtract ~10 % overhead for activations and fragmentation, divide by (KV bytes per token × expected sequence length). On 2×H100 (160 GB) with a 140 GB FP16 70B model you have almost nothing left — which is exactly why people quantize to 4-bit (35 GB) and free up 125 GB for KV cache and concurrency.

---

## 1.3 The Four Metrics ★★★ `L2`

**In one line:** latency is not one number — you need TTFT, TPOT, throughput and a tail percentile, and optimising one usually costs you another.

**Why it exists.** "Make it faster" is not a spec. A summarisation batch job and a live chat have opposite definitions of fast. Teams that track only average latency ship systems that feel broken.

| Metric | What it measures | Set by | Users feel it as |
|---|---|---|---|
| **TTFT** — time to first token | Prompt submitted → first token appears | Prefill + queue wait | "Is it frozen?" |
| **TPOT / ITL** — time per output token, inter-token latency | Gap between consecutive tokens | Decode, memory bandwidth | "Is it typing at a nice speed?" |
| **Throughput** | Total tokens/sec across all users | Batching efficiency | Your GPU bill |
| **P95 / P99** | Tail latency | Queueing, scheduling, long requests | "It's usually fine but sometimes awful" |

**End-to-end latency** is then:

$$\text{total} = \text{TTFT} + (\text{TPOT} \times \text{output tokens})$$

A 200-token answer with 300 ms TTFT and 25 ms TPOT takes $0.3 + (0.025 \times 200) = 5.3$ seconds. Note where the time actually goes: 94 % of it is decode. Shaving TTFT from 300 ms to 150 ms improves the total by under 3 %.

**Rules of thumb for interactive chat:**

| Metric | Good | Acceptable | Bad |
|---|---|---|---|
| TTFT | < 300 ms | < 1 s | > 2 s |
| TPOT | < 30 ms (≈ 33 tok/s) | < 60 ms | > 100 ms |

Humans read at roughly 5–8 tokens/second, so anything above ~20 tokens/second already feels faster than reading. Pushing TPOT below that buys you very little perceived quality — spend the GPU on throughput instead.

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

**Say this in an interview:**
> "I'd separate TTFT from TPOT because they have different bottlenecks and different fixes. For chat I'd target TTFT under 300 ms and TPOT under 30 ms, then set batch size to the largest value that still meets P99 TPOT — that gives me the cheapest tokens that still feel good. I'd alert on P99, not the mean, because batching problems show up in the tail first."

**They will then ask:** *"Your P99 TTFT just tripled but the mean is flat. What happened?"*
Almost always queueing, not compute — requests are waiting for a batch slot. Check the scheduler: are long prefills blocking the queue (fix with chunked prefill, §2.3)? Has KV cache filled up so new requests can't be admitted (fix with paging or quantization)? Is one tenant sending 100K-token prompts (fix with admission control and per-tenant limits)?

---

# PART 2 — MAKING DECODE FAST

---

## 2.1 Continuous (In-Flight) Batching ★★★ `L3`

**In one line:** instead of waiting for every request in a batch to finish, the scheduler evicts each sequence the moment it emits its stop token and immediately admits a waiting request into that slot.

**Why it exists.** This is the single largest throughput win in LLM serving, and it exists because of a mismatch classic batching cannot handle: **LLM requests finish at wildly different times.** One user asks for a word, another for a thousand-word essay. With static batching the whole batch runs until the *longest* member finishes, so most of your GPU slots sit idle generating padding.

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

**The mechanism.** The scheduler runs a loop at *token* granularity rather than *request* granularity:

```python
# The core idea, stripped to its essentials.
running = []          # sequences currently generating
waiting = Queue()     # admitted but not yet started

while True:
    # 1. Evict anything that finished on the previous step
    for seq in list(running):
        if seq.emitted_eos or seq.at_max_tokens:
            stream_back(seq); running.remove(seq); free_kv_blocks(seq)

    # 2. Refill free slots — this is the whole trick
    while waiting and can_admit(running, waiting.peek()):
        running.append(waiting.pop())     # new request joins mid-flight

    # 3. One decode step for EVERY running sequence, batched together
    logits = model.decode_step(running)   # one weight read, N tokens out
    for seq, tok in zip(running, sample(logits)):
        seq.append(tok)
```

`can_admit` is the interesting part: it must check that enough **KV cache blocks** are free for the new sequence, not just that a slot index is free. That is why continuous batching and PagedAttention (§2.2) were designed together — variable-length sequences entering and leaving constantly would fragment a naive contiguous cache into uselessness.

**What it buys you.** Because the expensive step is reading the model's weights out of memory, and one read now serves every sequence in the batch, throughput scales close to linearly with batch size until you exhaust memory or saturate compute. Published benchmarks commonly report **10–20× throughput** over naive static batching for realistic mixed-length traffic; the exact figure depends entirely on how variable your output lengths are. Uniform outputs → small gain. Highly variable outputs → enormous gain.

**When to use / when not.**

| Use it | Skip it |
|---|---|
| Any online serving with variable output lengths | Single-user local inference (no batch to form) |
| Chat, agents, code generation | Strictly uniform batch jobs where static batching is already full |
| Anywhere you care about cost per token | When P99 TPOT is so tight you must cap batch size at 1–2 |

It is on by default in vLLM, SGLang and TensorRT-LLM. You rarely implement it — but you are absolutely expected to explain it.

**Say this in an interview:**
> "Static batching wastes GPU because the batch is held until the longest sequence finishes, and LLM output lengths vary by orders of magnitude. Continuous batching schedules at token granularity — the moment a sequence emits EOS, its slot and its KV blocks are freed and a queued request joins on the next decode step. Since decode is memory-bandwidth-bound, one weight read now amortises across the whole batch, so throughput goes up roughly 10–20× on realistic traffic. It needs paged KV memory underneath, otherwise constant admission and eviction fragments the cache."

**They will then ask:** *"What's the downside?"* — TPOT rises as the batch grows, so per-user typing speed degrades under load; and without admission control, a burst of very long prompts can starve short requests. Real systems add per-tenant limits, a max batch size chosen from the P99 TPOT target, and chunked prefill so a huge prompt cannot block the decode loop.

---

## 2.2 PagedAttention & KV Fragmentation ★★ `L2`

**In one line:** store the KV cache in fixed-size blocks with a lookup table — exactly like virtual memory pages — instead of one contiguous slab per request.

**Why it exists.** You do not know in advance how long a response will be, so a naive server reserves the *maximum* possible length for every request. If max length is 4,096 but the average answer is 200 tokens, you have wasted 95 % of that reservation. Measured utilisation in pre-paging systems was commonly **20–40 %**; paging pushes it above **90 %**.

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

**Two consequences worth knowing.** First, blocks need not be contiguous, so a sequence can grow without ever needing a large free region — external fragmentation disappears. Second, **blocks can be shared**: if ten requests share the same 2,000-token system prompt, they can point at the *same* physical blocks, with copy-on-write applied only when their content diverges. That is the foundation of prefix caching (§2.4).

**Say this in an interview:**
> "PagedAttention applies virtual-memory ideas to the KV cache — fixed-size blocks plus a per-sequence block table, so memory is allocated on demand instead of reserving max sequence length up front. It takes KV utilisation from roughly 20–40 % to over 90 %, which directly translates into larger batches and higher throughput, and it enables copy-on-write sharing of common prefixes."

**They will then ask:** *"What's the cost?"* — an indirection on every attention lookup (needs a custom kernel), and a block size trade-off: small blocks waste less memory but add more table overhead and more kernel indirection; 16–32 tokens is the usual compromise.

---

## 2.3 Chunked Prefill ★★ `L2`

**In one line:** slice a huge prompt into fixed-size chunks and interleave those chunks with ongoing decode steps, so one enormous prompt cannot freeze everybody else's stream.

**Why it exists.** Prefill and decode compete for the same GPU. A single 100K-token prefill can occupy the device for seconds. Every user currently mid-answer sees their tokens simply stop arriving. Your mean TPOT looks fine; your P99 is a disaster. This is one of the most common causes of "it's usually smooth but sometimes it just hangs".

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

**The trade-off.** Total prefill takes slightly longer (less parallelism per step), so the big request's own TTFT gets marginally worse — in exchange, everyone else's P99 TPOT stops collapsing. Nearly always the right trade for interactive serving. In vLLM this is the `--enable-chunked-prefill` flag; the chunk size is the knob.

**Say this in an interview:**
> "Chunked prefill splits a long prompt into slices and interleaves them with decode steps, so a single long-context request can't monopolise the GPU and stall every active stream. It slightly increases that request's own TTFT but dramatically improves P99 inter-token latency for everyone else. It's the standard fix when P99 TPOT spikes while the mean looks healthy."

---

## 2.4 Prefix Caching & Semantic Caching ★★ `L2`

**In one line:** two different caches — one reuses the *computed KV state* of a shared prompt prefix; the other skips the model entirely when a semantically similar question has already been answered.

**Why it exists.** In production, prompts are far more repetitive than they look. Every request carries the same system prompt, the same few-shot examples, the same tool definitions. Recomputing that prefill on every call is pure waste — and in RAG and agent systems the shared prefix is frequently the *majority* of the prompt.

**The two caches, which interviewers like to see distinguished:**

| | **Prefix / prompt cache** | **Semantic cache** |
|---|---|---|
| Caches | KV tensors for a token prefix | Final responses |
| Match on | Exact token-prefix match | Embedding similarity above a threshold |
| Saves | Prefill compute (lower TTFT, lower cost) | The entire call (near-zero latency) |
| Risk | Essentially none — it is exact | **Serving a wrong answer** to a subtly different question |
| Where | vLLM/SGLang built-in; provider APIs bill cached input tokens at a large discount | Application layer (e.g. a Redis + embeddings layer) |

```
Prefix cache — structure your prompts to exploit it

  ✅ GOOD:  [ system prompt ][ few-shot ][ tools ][ user query ]
            └────────── stable, cacheable prefix ────────┘  └ varies

  ❌ BAD:   [ timestamp ][ system prompt ][ user query ]
            └ changes every call → prefix never matches → cache always misses
```

**The single most actionable rule in this section:** put everything variable — timestamps, user IDs, session data — at the **end** of the prompt. A prefix cache only matches from the start, so one variable token at position 0 destroys the whole thing.

**Say this in an interview:**
> "Prefix caching reuses the KV state of a shared prompt prefix, so the system prompt and few-shot examples aren't re-prefilled on every request — big TTFT and cost win for RAG and agents. The design rule is to keep everything stable at the front and everything variable at the end. Semantic caching is a different, riskier thing: it returns a previous answer when a new question is embedding-similar. I'd only use it with a high similarity threshold, on a narrow domain like FAQs, and with a way to bypass it."

**They will then ask:** *"When does semantic caching bite you?"* — near-duplicate questions with opposite meaning ("can I cancel my order?" vs "can I *not* cancel my order?"), personalised answers cached across users, and stale answers after the underlying data changes. Mitigations: high thresholds, per-user cache keys, TTLs tied to data freshness, and never caching anything the user can act on financially.

---

## 2.5 Speculative Decoding ★★ `L2`

**In one line:** a small fast model guesses the next few tokens, the big model verifies them all in a single forward pass, and you keep every token up to the first mistake.

**Why it exists.** Decode is memory-bandwidth-bound (§1.1), so a forward pass that verifies 5 candidate tokens costs almost exactly the same as one that produces 1. If the guesses are usually right, you get several tokens for the price of one weight read.

> The mechanism and the basic diagram are in [Ch 29 §24.9](#content/29_gpus_tpus_infrastructure). What follows is the part interviewers push on: **the maths of whether it is worth it.**

**The mechanism — expected speedup.** With a draft of $\gamma$ tokens and per-token acceptance rate $\alpha$, the expected number of tokens accepted per verification step is:

$$E[\text{tokens}] = \frac{1 - \alpha^{\gamma+1}}{1 - \alpha}$$

| Acceptance $\alpha$ | Draft $\gamma = 4$ | Practical read |
|---|---|---|
| 0.9 | 4.10 tokens/step | Excellent — draft model is well matched |
| 0.8 | 3.36 | Strong win |
| 0.7 | 2.77 | Solid |
| 0.5 | 1.94 | Marginal once you subtract draft cost |
| 0.3 | 1.43 | **Net loss** — you are paying for the draft model for nothing |

The draft model is not free: it costs roughly its own forward pass per step. So the real condition is that the speedup must exceed the draft overhead. Rough guide: you want $\alpha > 0.6$ and a draft model roughly 10–20× smaller than the target.

**A crucial property:** with the correct verification rule, speculative decoding is **mathematically lossless** — the output distribution is identical to what the big model would have produced alone. It is a pure latency optimisation, not a quality trade-off. Say this; candidates frequently get it wrong and claim it degrades quality.

**Variants worth naming:** EAGLE / EAGLE-3 (a lightweight draft head trained on the target model's own hidden states — currently the strongest published speedups), Medusa (multiple decoding heads predicting several positions at once), and n-gram / prompt-lookup decoding (no draft model at all; drafts by copying repeated spans from the prompt — very effective for summarisation and code editing, where output heavily echoes input).

**When to use / when not.**

| Use it | Skip it |
|---|---|
| Low batch size, latency-critical (you have spare compute) | Already at high batch — compute is saturated, no free capacity to verify with |
| Output is predictable: code, structured data, summarisation | Highly creative/high-temperature output → acceptance collapses |
| You have a same-family small model available | No well-matched draft model (acceptance too low to pay for itself) |

**Say this in an interview:**
> "Speculative decoding exploits the fact that decode is bandwidth-bound, so verifying k tokens costs about the same as generating one. A small draft model proposes, the target verifies in one pass, and you accept the longest correct prefix. Expected tokens per step is (1 − α^(γ+1))/(1 − α), so with 80 % acceptance and a 4-token draft you get about 3.4 tokens per step. It's lossless — same output distribution — but it only pays off at low batch size, because at high batch you've already saturated compute and there's nothing spare to verify with."

---

## 2.6 Disaggregated Prefill / Decode Serving ★ `L2`

**In one line:** run prefill and decode on *separate pools of GPUs* rather than making one pool do both, because the two phases want different hardware and different scaling.

**Why it exists.** From §1.1: prefill is compute-bound, decode is bandwidth-bound. Co-locating them means every prefill burst interferes with every active decode stream, and you must size a single cluster for the worse of two very different profiles. Disaggregation lets each pool be sized, scaled and even *hardware-matched* independently.

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

**The catch, which is the whole interview point:** you now have to move the KV cache between pools. At 320 KB/token, a 10K-token prompt means shipping ~3 GB before the first token can be decoded. That is fine over NVLink or InfiniBand and ruinous over ordinary networking. **Disaggregation is a high-end optimisation that only pays off at large scale with a fast interconnect.**

**Say this in an interview:**
> "Prefill is compute-bound and decode is bandwidth-bound, so at scale it can pay to run them on separate pools sized independently — prefill scales with prompt volume, decode with concurrent sessions, and neither interferes with the other's latency. The cost is transferring the KV cache between pools, which is gigabytes for long prompts, so it only makes sense with a fast interconnect and enough traffic to justify the complexity. Below that scale, chunked prefill on a single pool gets most of the benefit."

> **Bar-raiser note.** Mentioning this — *and then correctly arguing it is overkill for the scale in the question* — is a stronger signal than proposing it everywhere.

---

# PART 3 — MAKING THE MODEL SMALLER

---

## 3.1 Weight-Only vs W8A8 — Which Phase Does It Help? ★★★ `L2`

**In one line:** quantizing only the weights speeds up **decode**; quantizing activations too (W8A8/FP8) is what speeds up **prefill** — and confusing the two is the most common quantization mistake.

**Why it exists.** Everyone knows quantization "makes the model smaller and faster". Almost nobody can say *which part* gets faster. Since prefill and decode have opposite bottlenecks (§1.1), the answer follows directly:

- **Decode is memory-bandwidth-bound.** Its cost is *bytes of weights moved*. Shrink the weights → decode gets faster. Activations are tiny at batch 1, so quantizing them changes nothing.
- **Prefill is compute-bound.** Its cost is *matmul FLOPs*. You only go faster if the matmul itself runs on faster hardware paths — which requires **both** operands in low precision, i.e. quantized activations too, hitting the INT8/FP8 tensor cores.

| Scheme | Weights | Activations | Helps decode | Helps prefill | Notes |
|---|---|---|---|---|---|
| **GPTQ 4-bit** | INT4 | FP16 | ✅ strongly | ❌ | Calibration-based, post-training |
| **AWQ 4-bit** | INT4 | FP16 | ✅ strongly | ❌ | Protects salient weight channels |
| **NF4 (QLoRA)** | NF4 | BF16 | ✅ | ❌ | Designed for fine-tuning on one GPU |
| **SmoothQuant** | INT8 | INT8 | ✅ | ✅ | Migrates quantization difficulty from activations to weights, which is what makes INT8 activations viable — outliers are the reason naive W8A8 fails |
| **INT8 W8A8** | INT8 | INT8 | ✅ | ✅ | Needs activation calibration; outlier-sensitive |
| **FP8** | FP8 | FP8 | ✅ | ✅ | H100+ hardware; near-zero quality loss |

**Memory reference for a 70B model:**

| Precision | Weights | Fits on |
|---|---|---|
| FP16 | 140 GB | 2×H100 |
| FP8 / INT8 | 70 GB | 1×H100 (80 GB), tight |
| INT4 | 35 GB | 1×H100 with ~45 GB left for KV cache |

That last row is the practical punchline: 4-bit quantization does not merely halve your hardware — it frees roughly 105 GB of *weight* memory, which on a single 80 GB H100 leaves about 45 GB for KV cache instead of nothing at all. That converts almost directly into **concurrency**, which is usually the bigger win.

**Say this in an interview:**
> "Weight-only quantization like GPTQ or AWQ shrinks the bytes you stream per token, so it accelerates decode, which is bandwidth-bound — but it doesn't help prefill, because prefill is compute-bound and the matmuls still run in FP16. To speed up prefill you need the activations quantized too, W8A8 or FP8, so you actually hit the low-precision tensor cores. On H100 I'd default to FP8: it helps both phases with almost no quality loss. If I'm memory-constrained and decode-dominated, INT4 weight-only, mainly because the freed memory buys me a much bigger KV cache and more concurrency."

**They will then ask:** *"How do you know quantization didn't hurt quality?"* — not perplexity alone, which is far too blunt. Run your **task** evals (§4.3) before and after, compare on the tail (rare formats, long contexts, non-English), and watch for the classic 4-bit failure mode: fine on short answers, degrades on long-form reasoning and instruction-following.

---

## 3.2 KV-Cache Quantization & Offload ★★ `L2`

**In one line:** store the KV cache in FP8 or INT4 instead of FP16, or spill cold blocks to CPU memory, so long contexts stop eating your entire GPU.

**Why it exists.** §1.2 showed KV cache reaching 40 GB at 128K context — comparable to the quantized weights themselves. Once the cache dominates memory, shrinking the *weights* further stops helping; you have to shrink the *cache*.

| Technique | Effect | Cost |
|---|---|---|
| **FP8 KV cache** | 2× smaller → 2× the context or batch | Negligible quality impact; the usual default |
| **INT4 KV cache** | 4× smaller | Measurable degradation on long-context recall; test it |
| **CPU offload** | Cold blocks spill to host RAM | PCIe transfer latency on re-access; only for very long, sparsely-touched contexts |
| **Quantize K only** | K tolerates quantization better than V in practice | Asymmetric, slightly awkward to implement |

**Say this in an interview:**
> "At long context the KV cache can exceed the quantized weights, so it becomes the binding constraint. FP8 KV cache is close to free and doubles either context length or batch size; INT4 is aggressive and I'd validate it on long-context retrieval tasks specifically, because that's where it degrades first. Offloading to CPU only makes sense when the context is long but rarely re-read, since you pay PCIe latency on every touch."

---

## 3.3 Multi-LoRA Serving ★★ `L2`

**In one line:** serve one base model plus many small LoRA adapters swapped in per request, instead of running a separate full model per customer.

**Why it exists.** You have fine-tuned the model for 50 enterprise customers. Fifty 70B deployments is financially absurd. But a LoRA adapter is only tens of megabytes — so keep **one** copy of the 140 GB base model resident and page the tiny adapters in and out per request.

**Picture.**

```
  ┌─────────────────────────────────────────┐
  │   BASE MODEL — 70B, loaded ONCE         │
  └───────────────────┬─────────────────────┘
                      │  batch mixes tenants freely
     ┌────────┬───────┼────────┬────────┐
     ▼        ▼       ▼        ▼        ▼
  [LoRA-A][LoRA-B][LoRA-A][LoRA-C][LoRA-B]     ~30 MB each
     R1       R2      R3       R4      R5
```

The subtlety that makes it work: requests using *different* adapters can sit in the **same** batch. The base-model matmul is shared across all of them; only the small low-rank adapter multiplication is per-request. So you keep continuous batching's throughput while serving many tenants.

**When to use / when not.** Use it for per-customer or per-task specialisation where the base model is shared. Skip it if adapters are so few you can just merge them into dedicated deployments, or if your tenants need genuinely different base models.

**Say this in an interview:**
> "Multi-LoRA serving keeps one base model resident and applies per-request adapters, so 50 fine-tuned variants cost roughly one deployment instead of 50. Because the adapters are low-rank, requests with different adapters can share a batch — the expensive base matmul is amortised across all of them and only the small adapter term is per-request. vLLM and LoRAX both support it. The limits are adapter count versus memory, and a small latency cost when an adapter has to be loaded cold."

---

## 3.4 Distill, Quantize or Prune? ★★ `L2`

**In one line:** three different ways to make a model smaller, and they fail in different places — so the choice depends on whether you are short of memory, bandwidth or budget.

**Why it exists.** Candidates reach for quantization reflexively because it is the easiest. But "make this model cheaper to serve" has three answers, and the strongest response compares them.

| | **Quantization** | **Distillation** | **Pruning** |
|---|---|---|---|
| What it does | Same weights, fewer bits each | Trains a *smaller* model to mimic a bigger one | Deletes weights that contribute little |
| Cost to apply | Minutes to hours, no training data | **Full training run** on the student | Hours, plus fine-tuning to recover |
| Typical gain | 2–4× smaller | 5–10× smaller | 1.5–2× (structured) |
| Quality risk | Low at 8-bit, moderate at 4-bit | Depends entirely on student capacity | Unstructured pruning needs sparse-matrix hardware to actually go faster |
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

**The 2026 framing worth knowing:** distillation used to mean training on a teacher's soft logits. Increasingly it means **generating synthetic data** from a frontier model and fine-tuning a small open model on it — same idea, no logit access required, which is what makes it possible when the teacher is behind an API. Note this often conflicts with provider terms of service; a good answer mentions that.

**Say this in an interview:**
> "I'd quantize first because it costs nothing and is reversible — FP8 on modern hardware, INT4 if I'm memory-bound. If that isn't enough and the task is narrow, distillation is the bigger lever: a small student trained on the teacher's outputs can match it on that specific task at a fraction of the cost, because I'm not paying for general capability I don't use. Pruning I'd reach for last, and structured rather than unstructured, since unstructured sparsity usually needs hardware support to turn into real speedup."

---

# PART 4 — MEASURING

---

## 4.1 The Evaluation Stack ★★★ `L2`

**In one line:** you need four layers of evaluation — assertions, golden sets, judges, and online metrics — because no single one of them can tell you whether the system got better.

**Why it exists.** LLM outputs are non-deterministic and open-ended, so "did my change help?" is genuinely hard. Teams that skip this ship changes on vibes, and then cannot explain a regression. Practitioners consistently name evaluation as the single biggest differentiator between teams that ship reliable LLM products and teams that do not.

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

---

## 4.2 LLM-as-Judge and Its Three Biases ★★★ `L2`

**In one line:** use a strong model to grade outputs when there is no exact answer — but know the three ways it is systematically wrong, or you will optimise straight into them.

**Why it exists.** Human evaluation is accurate and far too slow and expensive to run on every change. Exact-match metrics like BLEU and ROUGE do not work for open-ended generation. A judge model correlates reasonably with human preference and runs in minutes.

**The three biases — name all three and the mitigation:**

| Bias | What happens | Mitigation |
|---|---|---|
| **Position bias** | The judge favours whichever response is shown first | Run both orders, average; discard non-transitive pairs |
| **Verbosity bias** | Longer answers score higher regardless of quality | Length-controlled comparison; penalise or normalise for length |
| **Self-preference** | A judge prefers text produced by its own model family | Use a different family as judge; validate against human labels |

**Two more rules that separate a good answer from a great one:**

1. **Pairwise beats absolute.** "Which of these two is better?" is far more reliable than "score this 1–10". Absolute scores drift between runs and cluster around the middle.
2. **Calibrate the judge.** Hand-label 50–100 examples, measure the judge's agreement with your humans, and only trust it on the axes where agreement is high. An uncalibrated judge is an opinion, not a metric.

**Say this in an interview:**
> "LLM-as-judge is the practical way to evaluate open-ended output, but it has three known biases: position, verbosity and self-preference. I'd mitigate by evaluating pairwise rather than on an absolute scale, randomising and swapping order, controlling for length, and using a judge from a different model family than the one under test. Crucially I'd calibrate it against a few hundred human labels first and track agreement, because otherwise I'm optimising against the judge's quirks rather than actual quality."

**They will then ask:** *"What if the judge and your users disagree?"* — the users are right. Treat judge-human disagreement as the signal: sample the disagreements, work out which dimension the judge is blind to, and either add an assertion for it or change the rubric. Judges measure proxies; A/B tests measure reality.

---

## 4.3 Golden Sets & Regression Testing ★★★ `L3`

**In one line:** a small, versioned, hand-curated set of input/expectation pairs that runs automatically on every prompt, model or retrieval change — unit tests for a non-deterministic system.

**Why it exists.** Prompts are code, but they have no type checker and no compiler. Change one line of the system prompt and you may silently break a case that worked for six months. Without a regression suite you will not find out until a customer does.

**How to build one that works.**

| Property | Guidance |
|---|---|
| **Size** | 50–200 cases. Small enough to run in minutes, large enough to catch real regressions |
| **Source** | **Real production failures**, not invented examples. Every incident adds a case |
| **Coverage** | Happy path, known edge cases, adversarial inputs, and each supported language/format |
| **Assertions** | Prefer deterministic checks where possible: valid JSON, contains citation, refuses correctly, no PII, under N tokens |
| **Versioning** | In git, next to the prompts. A change to either is a reviewable diff |

```python
# A golden case is deliberately boring — that is the point.
{
  "id": "refund-policy-out-of-window",
  "input": "I bought this 400 days ago, can I get a refund?",
  "assert": [
    ("must_not_contain", "yes, you can"),        # deterministic
    ("must_cite_source", True),                  # deterministic
    ("judge", "Does the reply correctly state the 365-day limit?")  # judged
  ],
  "added_because": "INC-2481 — model invented a 2-year window"
}
```

Mix the two assertion types: deterministic checks are free, instant and unambiguous — use them for everything you can express. Reserve the judge for the genuinely subjective residue.

**Say this in an interview:**
> "I'd keep a versioned golden set of 50–200 cases in git alongside the prompts, built mostly from real production failures, and run it in CI on every prompt, model or retrieval change. Most assertions are deterministic — valid JSON, cites a source, correctly refuses — with LLM-as-judge only for the subjective parts. The key discipline is that every incident becomes a permanent test case, so the same failure can't ship twice."

---

## 4.4 A/B Testing an LLM Feature ★★ `L2`

**In one line:** offline evaluation tells you the model changed; only an online experiment tells you the *product* got better.

**Why it exists.** Offline wins routinely fail to materialise online. The eval set does not match the real traffic distribution, the judge rewards something users do not care about, or the improvement is real but too small to move behaviour.

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

---

## 4.5 Benchmark Contamination & Goodhart's Law ★ `L1`

**In one line:** public benchmark scores are systematically inflated because the test sets have leaked into pre-training data, and any benchmark that becomes a target stops measuring what it measured.

**Why it exists.** Models are trained on scrapes of the whole internet, and benchmark questions and their answers live on that internet. A model can score well by memorisation rather than capability. Meanwhile, once a benchmark drives funding and headlines, it is optimised against directly — Goodhart's law in action.

**How to talk about it:** prefer **held-out, private** evaluation on your own task distribution; check whether a benchmark has a decontaminated or "live"/rolling variant; treat leaderboard deltas under a few points as noise; and note that a suspiciously large gap between benchmark performance and your own eval is a contamination smell.

> Deeper treatment, with the specific benchmarks that saturated and what replaced them, is in [Ch 33b](#content/33b_llm_interview_questions_part2) and [Ch 20 §20.13](#content/20_2026_landscape).

---

## The classical metrics you still have to name

> **Moved here from Ch 17 §11** so that evaluation has a single home. These are the metrics interviewers expect you to *name and bound* — you rarely make a shipping decision on them, but "what is perplexity and why isn't it enough?" is a standard question. The decision-making layers are §4.1–§4.5 above.

---

## 4.6 Intrinsic Metrics — Perplexity & Cross-Entropy ★★ `L2`

### Perplexity

**Perplexity measures how "surprised" the model is by text.** Lower perplexity = the model predicted the text better = better language model.

$\text{Perplexity} = 2^{\text{(average negative log probability of each token)}}$

```
  Intuition:
  - Perplexity of 1: The model predicted every token perfectly
  - Perplexity of 10: On average, the model was choosing between
                      10 equally likely tokens
  - Perplexity of 100: The model was very uncertain

  Example:
  "The cat sat on the ___"
  Good model: P("mat") = 0.4   → low perplexity (expected this)
  Bad model:  P("mat") = 0.001 → high perplexity (didn't expect this)

  GPT-2 perplexity on WikiText: ~29.4
  GPT-3 perplexity on WikiText: ~20.5  (better — lower is better)
```

**Limitation:** Low perplexity ≠ useful model. A model might predict text well but still give unhelpful or unsafe responses.

### Cross-Entropy Loss

Closely related to perplexity. It's the average negative log probability of the correct next token. This is what's directly optimized during training.

$\text{Cross-entropy loss} = -\frac{1}{N} \sum_{i=1}^{N} \log P(\text{correct token}_i)$

$\text{Perplexity} = 2^{\text{cross-entropy loss}}$

```
  Loss of 3.0 → Perplexity of 8
  Loss of 4.5 → Perplexity of ~23
  Loss of 1.0 → Perplexity of 2 (very good)
```

---

## 4.7 Extrinsic Metrics — BLEU, ROUGE & Human Evaluation `L1`

### BLEU (Bilingual Evaluation Understudy)

Measures overlap between generated text and reference text. Originally designed for machine translation.

$\text{BLEU} = \text{BP} \times \exp\!\left(\sum_{n=1}^{N} \frac{1}{N} \log p_n\right)$

where $p_n$ = precision of $n$-grams, BP = brevity penalty.

```
  Reference: "The cat is on the mat"
  Generated: "The cat is sitting on the mat"

  BLEU counts matching n-grams:
  1-grams: "The", "cat", "is", "on", "the", "mat" → 6/7 match
  2-grams: "The cat", "cat is", "on the", "the mat" → 4/6 match
  3-grams: "The cat is", "on the mat" → 2/5 match

  BLEU = geometric mean of n-gram precisions × brevity penalty
  Range: 0 to 1 (higher is better)

  Limitation: "The mat is on the cat" would score HIGH even though
  the meaning is completely different. BLEU doesn't understand meaning.
```

### ROUGE (Recall-Oriented Understudy for Gisting Evaluation)

Similar to BLEU but focused on recall (how much of the reference is captured). Used for summarization evaluation.

```
  ROUGE-1: unigram overlap (individual words)
  ROUGE-2: bigram overlap (word pairs)
  ROUGE-L: longest common subsequence

  Reference summary: "The president met with foreign leaders to discuss trade."
  Generated summary: "The president discussed trade with world leaders."

  ROUGE-1 recall: how many reference words appear in the generated text?
  "The" ✓ "president" ✓ "met" ✗ "with" ✓ "foreign" ✗ "leaders" ✓
  "to" ✗ "discuss" ~ "trade" ✓
  = ~5/9 ≈ 0.56
```

### Human Evaluation (The Gold Standard)

No automated metric perfectly captures quality. For critical applications, human evaluation is still the best:

```
  Common human evaluation criteria:
  - Helpfulness: Does this answer the question?
  - Accuracy: Is the information correct?
  - Fluency: Is the language natural?
  - Safety: Is the response harmful in any way?
  - Following instructions: Did it do what was asked?
```

---

## 4.8 Benchmarks & the Chatbot Arena `L1`

| Benchmark | What It Tests | Format |
|-----------|--------------|--------|
| MMLU | 57 subjects (math, history, law, medicine...) | Multiple choice |
| HellaSwag | Commonsense reasoning | Sentence completion |
| HumanEval | Code generation (Python) | Write functions that pass tests |
| MBPP | Code generation (simpler) | 1000 Python programming problems |
| GSM8K | Grade school math | Word problems with step-by-step solutions |
| MATH | Competition math (hard) | AMC/AIME-level problems |
| TruthfulQA | Resistance to common misconceptions | Q&A with tricky questions |
| ARC | Science questions (grade school) | Multiple choice |
| WinoGrande | Pronoun resolution | "The trophy doesn't fit in the suitcase because it's too [big/small]" |
| BBH | Hard reasoning tasks | 23 challenging BIG-Bench tasks |
| MT-Bench | Multi-turn conversation quality | Open-ended conversation judged by GPT-4 |

> **Saturation warning (2026):** MMLU, HellaSwag, GSM8K, and HumanEval are largely *saturated* — top models score 90%+, so they no longer separate the frontier. The benchmarks that actually matter in 2026:

| Frontier benchmark (2026) | What it tests |
|---|---|
| **GPQA (Diamond)** | Graduate-level science, "Google-proof" hard Q&A |
| **SWE-bench Verified** | Real GitHub bug fixes — the patch must pass the repo's tests (the agentic-coding benchmark) |
| **AIME / MATH-500 / FrontierMath** | Competition- to research-level math (reasoning models) |
| **ARC-AGI-2** | Abstract reasoning / fluid intelligence |
| **MMLU-Pro** | Harder, less-saturated MMLU |
| **LiveCodeBench** | Contamination-resistant competitive coding |
| **Humanity's Last Exam** | Expert-level, cross-domain frontier questions |

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

### Chatbot Arena & ELO Ratings

Academic benchmarks don't always reflect real-world usefulness. **Chatbot Arena** (by LMSYS) uses human preferences:

```
  How it works:
  1. User asks a question
  2. Two anonymous models generate answers side by side
  3. User picks which answer they prefer (or tie)
  4. ELO ratings are calculated (like chess ratings)

  Top-tier models (as of July 2026 — model versions shift monthly) include:
  - GPT-5.6, Claude Opus 4.8, Gemini 3.5 Pro    (highest tier)
  - GPT-5.6 (high-effort), Claude Sonnet 5, Gemini 3.5 Flash  (strong reasoning)
  - GPT-4o, Claude Sonnet, LLaMA 4 Maverick     (very capable)
  - DeepSeek R1, Qwen 3                          (strong open-source)

  (Rankings change frequently — check lmsys.org for current leaderboard)
```

**Why this matters:** A model might score well on MMLU but poorly in Chatbot Arena (or vice versa). Real-world preference ≠ benchmark scores.

---

---
# PART 5 — PUTTING IT TOGETHER

---

## 5.1 The Serving Stack

| Engine | Strengths | Choose it when |
|---|---|---|
| **vLLM** | PagedAttention, continuous batching, prefix caching, speculative decoding, multi-LoRA; broadest ecosystem | Default choice for self-hosting |
| **SGLang** | RadixAttention (a prefix-tree KV cache that shares across requests automatically), strong structured-output and constrained-decoding support | Heavy prompt reuse, agents, strict JSON output |
| **TensorRT-LLM** | Deepest NVIDIA hardware optimisation, FP8/INT4 kernels | Maximum performance on NVIDIA, willing to pay in build complexity |
| **Ollama / llama.cpp** | CPU and consumer GPU, GGUF quantization, trivial setup | Local development, on-device, small models |
| **Managed APIs** | Zero ops, elastic, pay per token | Low or spiky volume; before you have proven product-market fit |

**RadixAttention in one line** (since it pairs with §2.4): SGLang keeps a *prefix tree* of cached KV states across all requests, so any shared prefix is reused automatically without you having to declare it — particularly effective for agent loops, where each step resends the growing history.

---

## 5.2 Capacity & Cost — A Worked Example

Interviewers ask you to do this arithmetic out loud. Practise it once and it becomes free marks.

**The scenario.** A chat feature: 1,000,000 requests/day, averaging 500 input tokens and 200 output tokens.

**Step 1 — token volume.**

$$\text{input} = 10^6 \times 500 = 500\text{M tokens/day} \qquad \text{output} = 10^6 \times 200 = 200\text{M tokens/day}$$

**Step 2 — API cost** (at a frontier price of \$5 per M input, \$25 per M output):

$$(500 \times 5) + (200 \times 25) = 2{,}500 + 5{,}000 = \$7{,}500/\text{day} \approx \$225\text{k/month}$$

**Step 3 — self-hosting.** Sustained output rate:

$$\frac{200\text{M tokens}}{86{,}400 \text{ s}} \approx 2{,}315 \text{ output tokens/sec}$$

A 70B model with continuous batching on an 8×H100 node delivers on the order of a few thousand output tokens/sec (treat this as a planning figure, then measure). So roughly **2 nodes** for headroom and traffic peaks. At ~\$2/GPU-hour:

$$2 \text{ nodes} \times 8 \text{ GPUs} \times \$2 \times 730 \text{ h} \approx \$23\text{k/month}$$

**Step 4 — the honest answer.** Self-hosting looks ~10× cheaper, but that comparison is only valid if you add: engineering headcount to run it, GPU capacity reserved for peak rather than average (your day is not flat — a 3× peak-to-mean ratio erases much of the gap), and the quality difference between a 70B open model and a frontier model. The senior answer is: **start on the API, instrument cost per session, and move to self-hosting when sustained volume makes the arithmetic clear** — usually somewhere north of a few hundred million tokens per month with predictable load.

**Step 5 — the cheapest win first.** Before any of that: cache. If 30 % of your traffic hits a prefix or semantic cache, you have cut 30 % of the bill with a day of work and no infrastructure at all.

---

## 5.3 What Goes Wrong in Production

| Symptom | Likely cause | Fix |
|---|---|---|
| P99 TTFT spikes, mean is flat | Long prefills blocking the scheduler | Chunked prefill (§2.3); admission control |
| Throughput collapses as users grow | KV cache exhausted → batch size forced down | Quantize weights and/or KV (§3.1–3.2); cap max context |
| Out-of-memory only under load | KV fragmentation, or `max_model_len` set too high | Paged KV (§2.2); lower max context; reserve headroom |
| Cost per request creeps up quietly | Prompt bloat — few-shot examples and tool defs growing | Audit prompt length; exploit prefix caching (§2.4) |
| Quality drops after a "harmless" quantization | Long-form and instruction-following degrade first | Task evals before/after (§4.3), not perplexity |
| Offline eval improved, users unhappy | Eval distribution ≠ production distribution | Rebuild golden set from real traffic; A/B it (§4.4) |
| Speculative decoding made it *slower* | Acceptance rate too low, or batch already saturated | Measure α; disable above a batch-size threshold |
| Answers occasionally wrong for the wrong user | Semantic cache collision | Per-user keys, higher threshold, or disable it |

---

## 5.4 Decision Tree — Pick Your Serving Configuration

```
START: what dominates your traffic?
│
├─ Long prompts, short outputs (summarise, extract, classify)
│    → PREFILL-bound
│    → FP8 or W8A8 quantization (helps prefill)
│    → aggressive prefix caching
│    → chunked prefill to protect other users
│    → speculative decoding: usually NOT worth it
│
├─ Short prompts, long outputs (chat, code, agents)
│    → DECODE-bound
│    → weight-only INT4/FP8 (helps decode)
│    → continuous batching, batch size set by P99 TPOT target
│    → speculative decoding IF batch is low and output is predictable
│    → GQA/MLA model to shrink KV cache
│
└─ Long prompts AND long outputs (long-context agents, doc chat)
     → BOTH — and KV cache is your binding constraint
     → FP8 KV cache; consider INT4 KV with long-context evals
     → chunked prefill is mandatory
     → at very large scale, consider prefill/decode disaggregation
```

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

---

## Key Takeaways

- **Prefill vs decode is the master model.** Compute-bound versus bandwidth-bound explains nearly every serving question.
- **A single stream is capped by memory bandwidth.** A 70B in FP16 sharded over 2×H100 streams 70 GB per GPU per token, capping one stream near 48 tokens/sec; at INT4 on one GPU it is ~96. Batching, quantization, speculation and more shards are the ways around it.
- **KV cache is usually the binding constraint**, not the weights — especially past 32K context. GQA and MLA exist because of that formula.
- **Continuous batching is the biggest single throughput win**, and it requires paged KV memory to work.
- **Weight-only quantization helps decode; W8A8/FP8 helps both.** Never blur them.
- **Put the variable part of your prompt last** so prefix caching can work.
- **Evaluation is a four-layer stack**, and every production failure must become a permanent golden-set case.
- **Do the cost arithmetic out loud.** Tokens/day → \$/day → GPU-hours → the honest caveats.

---

## Review Questions — Test Your Understanding

1. Why does adding a GPU with more FLOPs but identical memory bandwidth fail to improve single-stream decode speed?
2. A model has 60 layers, 8 KV heads, head dimension 128, served in FP16. What is the KV cache for one 16K-token request?
3. Why can requests using *different* LoRA adapters share a single batch?
4. You measure a speculative-decoding acceptance rate of 0.45 with a 4-token draft. Should you keep it on? Show the arithmetic.
5. Your judge says the new prompt is better; your A/B test says engagement fell. Which do you believe, and what do you do next?
6. Explain why a timestamp at the start of a system prompt can materially increase your inference bill.
7. Your team wants INT4 KV cache to double context length. What specific evaluation would you run before agreeing?
