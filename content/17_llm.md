# Chapter 17 — Large Language Models: How They Work

> "A language model is a system that reads text and predicts what comes next.
> Scale it up enough and something extraordinary happens — it starts to understand."

**What this chapter covers:**
How an LLM actually works on the inside — from raw text to tokens to the Transformer to a trained, aligned model. This is the *model* layer. How to **use** an LLM is [Ch 17b](#content/17b_llm_applications); how to **run** one at scale is [Ch 17c](#content/17c_llm_systems).

---

## Where you are

**Layer: MODEL — *how it works inside*.** Part of **Deep Learning & LLMs** (Ch 16–20).

Chapter 17 used to be one 9-hour chapter covering everything about LLMs. It is now three, split by the question each one answers:

| Chapter | Question it answers | Covers |
|---|---|---|
| **Ch 17 (you are here)** | *How does it work inside?* | Tokenizer → embeddings → Transformer → training stages → model families |
| [**Ch 17b** — Applications](#content/17b_llm_applications) | *How do I build with it?* | Prompting, hallucinations, output control, RAG, tools, fine-tuning, APIs, safety |
| [**Ch 17c** — Systems](#content/17c_llm_systems) | *How do I run it at scale?* | Prefill/decode, batching, KV cache, quantization, serving, evaluation |

> **Section numbering is preserved across the split** so existing references keep working. This chapter holds **§1–§4** and **§15–§16**; §5–§10 and §13–§14 are in Ch 17b; §11 (evaluation) and §12 (inference) are now owned by Ch 17c.

**Full section map, tracks and the L1–L4 depth ladder → [Ch 16 — Deep Learning Reference](#content/16_deep_learning).**

### Covered in depth elsewhere

| If you are asked about… | Go to |
|---|---|
| Prompting, RAG, agents, fine-tuning, cost, safety | [Ch 17b — LLM Applications](#content/17b_llm_applications) |
| Serving, batching, KV cache, quantization, evaluation | [Ch 17c — LLM Systems](#content/17c_llm_systems) |
| Distributed training — DDP, FSDP, ZeRO, tensor & pipeline parallelism | [Ch 29 — GPUs, TPUs & Infrastructure](#content/29_gpus_tpus_infrastructure) |
| Vector index internals — HNSW, IVF-PQ, hybrid search | [Ch 28 — Semantic Search](#content/28_semantic_search) |
| Jailbreaks, red-teaming, benchmark contamination | [Ch 33b — LLM Interview Questions Pt 2](#content/33b_llm_interview_questions_part2) |
| The probability and linear-algebra prerequisites | [Ch 06 — Math Fundamentals](#content/06_math_fundamentals) |

---

## What You'll Learn

After reading this chapter, you will be able to:
- Explain what an LLM is and why "next token prediction" is so powerful
- Describe the full journey of text through an LLM (tokenization, embedding, Transformer, output)
- Explain how LLMs are trained (pre-training, SFT, RLHF/DPO/GRPO)
- Compare major LLM families (GPT, BERT, LLaMA, Claude, Gemini) and encoder vs decoder architectures
- Explain Mixture of Experts, scaling laws and transfer learning
- Describe reasoning models and how test-time compute changes the picture
- Name the papers that got us here

---

## Table of Contents

| Section | Topic | Key Concepts |
|---------|-------|--------------|
| 1 | What is an LLM? | Definition, parameters, capabilities, the maths you actually need |
| 2 | How Does an LLM Work Inside? | Tokenization, embeddings, Transformer, attention, GQA/MQA, decoding |
| 3 | How LLMs Are Trained | Pre-training, SFT, RLHF, DPO, GRPO/RLVR, scaling laws, transfer learning |
| 4 | Major LLM Families & Architectures | GPT, BERT, LLaMA, Claude, Gemini, MoE |
| 15 | The Future of LLMs | Reasoning models, research directions, open problems |
| 16 | Key Papers & Historical Timeline | Foundational papers, timeline |
| — | Quick Reference | Terminology cheat sheet |

---

# SECTION 1: WHAT IS AN LLM?

---

## 1.1 The Simple Explanation

**An LLM (Large Language Model) is a program that has read an enormous amount of text and learned to predict what words come next.**

That sounds simple. But when you train this prediction task on hundreds of billions of words from books, websites, code, scientific papers, and conversations — something surprising happens. The model starts to "understand" context, reason through problems, write code, translate languages, and answer questions — all from just learning "what word comes next."

### The Autocomplete Analogy

You've seen autocomplete on your phone. You type "I'm going to the" and your phone suggests "store" or "gym" based on what people usually type.

An LLM is like the world's most powerful autocomplete. It's been trained on essentially everything ever written in human history — not just on your personal messages. It can complete:

- "The capital of France is ___" → "Paris"
- "Write a poem about autumn ___" → (generates a full poem)
- "def fibonacci(n): ___" → (completes the function)
- "Explain quantum physics like I'm 10: ___" → (clear explanation)

The same mechanism — predicting the next word — handles all of these.

### Why "Large"?

The "large" in Large Language Model refers to the number of **parameters** (the learned settings inside the model).

```
  GPT-2 (2019):         1.5 billion parameters
  GPT-3 (2020):         175 billion parameters
  GPT-4 (2023):         estimated 1 trillion+ parameters (MoE)
  LLaMA 3 (2024):       8B, 70B, 405B versions available
  LLaMA 4 Scout (2025): 17B active / 109B total parameters (MoE with 16 experts)
  DeepSeek R1 (2025):   671B total parameters (MoE, 37B active per token)
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["GPT-2\n(2019)", "GPT-3\n(2020)", "LLaMA 3\n(2024)", "DeepSeek R1\n(2025)", "GPT-4\n(2023)"],
    "datasets": [{
      "label": "Parameters (Billions)",
      "data": [1.5, 175, 405, 671, 1800],
      "backgroundColor": ["rgba(99,102,241,0.5)","rgba(99,102,241,0.6)","rgba(34,197,94,0.7)","rgba(234,88,12,0.7)","rgba(239,68,68,0.7)"],
      "borderColor": ["rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(34,197,94,1)","rgba(234,88,12,1)","rgba(239,68,68,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "LLM Parameter Growth — From 1.5B (2019) to 1.8T (2023)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Parameters (Billions)" }, "beginAtZero": true },
      "x": {}
    }
  }
}
```

**One parameter** is like one tiny dial that the model tunes during training. A model with 175 billion dials has 175 billion ways to adjust how it processes text. More dials = more capacity to learn complex patterns.

---

## 1.2 What Can an LLM Do?

LLMs are remarkably versatile. The same base model can handle:

| Task | Example |
|------|---------|
| Answering questions | "What causes thunder?" |
| Writing | "Write an email declining a job offer politely" |
| Summarizing | "Summarize this 50-page report in 5 bullet points" |
| Translation | "Translate this paragraph to Spanish" |
| Coding | "Write a Python function that sorts a list by length" |
| Math | "Solve: if 3x + 7 = 22, what is x?" |
| Reasoning | "Which is heavier: a pound of feathers or a pound of gold?" |
| Analysis | "What are the pros and cons of remote work?" |
| Role-playing | "Act as a history teacher explaining World War I" |
| Brainstorming | "Give me 10 names for a coffee shop" |

All from the same mechanism: completing text given a prompt.

---

## 1.3 LLMs vs. Earlier AI Systems

Before LLMs, most AI systems were task-specific. You needed a different model for translation, a different one for summarization, a different one for Q&A.

LLMs changed this with the concept of **emergent generalization** — capabilities that appear from scale that weren't explicitly programmed.

```
  Old approach:
  Translation AI → translates only
  Q&A AI → answers questions only
  Code AI → writes code only
  (each model trained separately for each task)

  LLM approach:
  One model → trained to predict next word
  → translation
  → Q&A
  → code generation
  → summarization
  → ... (all from the same weights)
```

---


## 1.4 The Maths You Actually Need

Most of this is covered properly in **[Ch 06 — Math Fundamentals](#content/06_math_fundamentals)** — vectors and dot products, distributions, expected value and variance, Bayes' theorem, MLE. Two ideas that Ch 06 does *not* introduce separately but that this chapter leans on constantly are expanded below the table.

| Idea | In one line | Where it shows up in an LLM | Full treatment |
|---|---|---|---|
| **Probability** | How likely something is, 0 to 1 | The model's entire output is `P(next token | context)` | [Ch 06 §3.1–3.2](#content/06_math_fundamentals) |
| **Conditional probability** | How likely, *given* what you already know | The "given the context" half of that expression | *below* |
| **Softmax** | Turns arbitrary scores into probabilities that sum to 1 | Converts the final layer's logits into a token distribution | [Ch 06 §1.7](#content/06_math_fundamentals) |
| **Logarithms** | Turn tiny multiplied numbers into manageable added ones | Multiplying 1,000 token probabilities underflows to zero; adding log-probs doesn't | *below* |
| **Dot product** | Measures how aligned two vectors are | Attention scores; embedding similarity in RAG | [Ch 06 §1.2](#content/06_math_fundamentals) |
| **Cross-entropy / MLE** | Penalises the model by how surprised it was by the true token | The training loss. Perplexity = exp(average loss) | [Ch 06 §3.6](#content/06_math_fundamentals) |
| **KL divergence** | How far one distribution sits from another | Keeps RLHF/DPO from drifting too far from the reference model | [Ch 06 §3.3](#content/06_math_fundamentals) |

### Conditional probability — the whole model in one expression

An LLM is a conditional probability distribution. That is not an analogy; it is the definition.

$$P(\text{next token} \mid \text{everything so far})$$

Read the bar as **"given"**. Unconditional probability asks "how likely is the word *bank*?" — which is nearly meaningless. Conditional probability asks "how likely is *bank* **given** that I have just read *I sat on the river*?" — which is answerable, and is exactly what the model computes at every step.

```
  P("bank")                              ≈ small, and useless
  P("bank" | "I went to the")            ≈ high   → financial sense
  P("bank" | "I sat on the river")       ≈ high   → geographic sense

  Same word. Different context. Different probability.
  That conditioning IS what the Transformer computes.
```

Generating a sequence is then the **chain rule of probability** — each token conditioned on all the ones before it:

$$P(w_1, w_2, \ldots, w_n) = P(w_1) \cdot P(w_2 \mid w_1) \cdot P(w_3 \mid w_1, w_2) \cdots$$

This is why the architecture is *causal* (§2.4): token $i$ may only attend to tokens before it, because it is estimating a probability conditioned on the past, not the future.

### Logarithms — why everything is in log-space

Multiply the sentence above out for a 1,000-token document with typical per-token probabilities around 0.1 and you get roughly $10^{-1000}$. A 64-bit float bottoms out near $10^{-308}$. The number becomes **exactly zero**, and every gradient computed from it is zero. The model cannot learn.

Logs fix this by turning products into sums:

$$\log(a \times b) = \log a + \log b$$

$$\log P(w_1 \ldots w_n) = \sum_i \log P(w_i \mid w_{<i})$$

Instead of a product that underflows, you get a sum of a thousand numbers each around $-2.3$ — roughly $-2300$, which a float handles comfortably.

| | Raw probabilities | Log-probabilities |
|---|---|---|
| Combining | Multiply | **Add** |
| 1,000 tokens | Underflows to 0 | ≈ −2300, perfectly stable |
| Range | 0 to 1, crowded near 0 | −∞ to 0, well spread |
| Used for | Displaying to humans | **Everything internal**: loss, sampling, beam scoring |

Three consequences worth carrying: log-probs are always **negative** (log of a number below 1), "higher" means "more likely" (−0.1 beats −5.0), and the training loss is just the negative of the average log-prob — which is exactly cross-entropy, and whose exponential is **perplexity**.

**The one sentence that ties it together:** an LLM produces a vector of scores over the vocabulary, softmax turns those into probabilities, cross-entropy measures how wrong they were against the real next token, and gradient descent nudges the weights to reduce that. Everything else in this chapter is detail on top of that loop.

> **Interview note.** You will not be asked to derive Bayes' theorem. You *will* be asked why we work in log-space, what perplexity means, and why softmax temperature changes output diversity. Those three are worth being fluent in.

---

# SECTION 2: HOW DOES AN LLM WORK INSIDE?

---

## 2.1 The Journey of Your Text

When you type a prompt into an LLM, here's what happens inside:

```
  Your text: "What is the capital of France?"
       ↓
  STEP 1: TOKENIZATION
  Split into tokens: ["What", " is", " the", " capital", " of", " France", "?"]
  Convert to numbers: [1867, 318, 262, 3139, 286, 4881, 30]
       ↓
  STEP 2: EMBEDDING
  Convert each number to a vector (list of ~768-12288 numbers)
  Each vector captures the "meaning" of that token
       ↓
  STEP 3: TRANSFORMER LAYERS (12 to 96 layers)
  Each layer refines the representations using self-attention
  "What does each token mean given its context?"
       ↓
  STEP 4: OUTPUT
  Final layer predicts the next token
  Convert back to text: "Paris"
```

---

## 2.2 Tokenization — How Text Becomes Numbers ★★

Computers can't read words — only numbers. Tokenization converts words into tokens (pieces) and then into numbers.

**The key insight:** LLMs don't work with words — they work with **subwords**.

```
  "hello" → one token: [hello]
  "running" → one or two tokens: ["run", "ning"]
  "photosynthesis" → ["photo", "synthesis"]
  "gpt4" → ["gpt", "4"]
  "😊" → ["<|emoji|>"]
```

Why subwords? Because:
- Rare words can still be handled (broken into common pieces)
- New words (brand names, technical terms) can always be represented
- Different languages work differently and subwords handle this better

**How many tokens is your text?**

```
  1 token ≈ 0.75 words in English
  "Hello, how are you?" ≈ 5 tokens
  A typical paragraph ≈ 100 tokens
  A full book ≈ 100,000 tokens
```

### Tokenization Algorithms

How does the model decide what subwords to use? There are several algorithms:

**BPE (Byte Pair Encoding)** — Used by GPT models

BPE starts with individual characters and repeatedly merges the most frequent pair:

```
  Training corpus: "low lower lowest"

  Step 0 (start with characters):
  l o w   l o w e r   l o w e s t

  Step 1: most frequent pair is "l" + "o" → merge into "lo"
  lo w   lo w e r   lo w e s t

  Step 2: most frequent pair is "lo" + "w" → merge into "low"
  low   low e r   low e s t

  Step 3: most frequent pair is "e" + "r" → merge into "er"
  low   low er   low e s t

  ... continue until you reach your desired vocabulary size (e.g., 50,000 tokens)
```

The result: common words stay whole ("the", "and"), while rare words get split into known pieces ("un" + "like" + "ly").

**WordPiece** — Used by BERT

Similar to BPE but uses a likelihood-based score to decide which pairs to merge:

```
  Instead of counting raw frequency, WordPiece picks the merge that
  maximizes: P(merged) / (P(piece1) × P(piece2))

  This finds merges where the pair almost always appears together.
  Subword tokens start with "##" to indicate continuation:
  "playing" → ["play", "##ing"]
```

**SentencePiece** — Used by LLaMA, T5

Works directly on raw text (including spaces and special characters) without pre-tokenization. Language-agnostic — works equally well for English, Chinese, Japanese, etc.

### Special Tokens

LLMs use special tokens as bookmarks to understand the structure of input:

```
  [BOS] / <s>          → Beginning of sequence — "this is the start"
  [EOS] / </s>         → End of sequence — "I'm done generating"
  [PAD]                → Padding — fills shorter sequences to make batches equal length
  [UNK]                → Unknown — for tokens not in vocabulary (rare in modern LLMs)
  [SEP]                → Separator — marks boundaries between segments
  [MASK]               → Mask — used in BERT-style training (hide this token, predict it)
  [CLS]                → Classification — BERT uses this for classification tasks

  Chat-specific tokens:
  <|system|>           → Start of system prompt
  <|user|>             → Start of user message
  <|assistant|>        → Start of assistant response
  <|end_of_turn|>      → End of a turn in conversation
```

**Why vocabulary size matters:**

```
  Small vocabulary (10K tokens):
  + Fewer parameters to learn
  − More tokens per sentence (slower, uses more context window)
  − Common words get split unnecessarily

  Large vocabulary (100K+ tokens):
  + Fewer tokens per sentence (faster, more efficient)
  − More parameters to learn
  − Rare tokens get poor representations

  Modern LLMs: 100K–262K (GPT-4o ~200K, Llama 3 128K, Gemma 256K).
  Early models (GPT-2/3) used ~50K; vocabularies grew to shorten
  multilingual/code sequences.
```

---

## 2.3 Embeddings — Meaning as Numbers

Once text is tokenized, each token becomes a **vector** — a list of numbers that captures the token's meaning.

**The magic of embeddings:**

Similar meanings → similar vectors. The model learns this during training.

```
  "king"  → [0.2, 0.8, -0.3, 0.5, ...]
  "queen" → [0.2, 0.9, -0.2, 0.4, ...]   ← similar to "king"
  "dog"   → [0.7, -0.2, 0.6, -0.3, ...]  ← different

  Famous example:
  vector("king") − vector("man") + vector("woman") ≈ vector("queen")
```

This means the model "understands" that king and queen are related (both royalty) but differ by gender — without anyone explicitly programming this.

**Embedding dimension:** The length of this vector. Common sizes:
- Small models: 768 numbers
- Large models: 4096 numbers
- Very large models: 12,288 numbers

---

## 2.4 The Transformer — The Brain of an LLM ★★★

The Transformer is the architecture that makes LLMs work. It was invented in 2017 and transformed (pun intended) AI.

The key innovation: **self-attention** — each token looks at all other tokens and decides how much to "pay attention" to each one.

### Self-Attention in Plain English ★★★

Imagine you're reading: "The bank by the river was steep."

When you read "bank," you need to figure out: is this a financial bank or a river bank? You look at the surrounding words — "river" and "steep" — and figure out it's a river bank.

Self-attention does this mechanically:

```
  For each word, ask:
  "Which other words in this sentence are most relevant to understanding me?"

  "bank" asks:
    → "The": 5% relevant
    → "by": 8% relevant
    → "the": 5% relevant
    → "river": 60% relevant  ← big weight!
    → "was": 5% relevant
    → "steep": 17% relevant  ← some weight

  "bank"'s final representation = weighted mix of all other words
  (mostly colored by "river" and "steep")
```

After self-attention, each word's representation contains information from the whole sentence. Context is captured.

### Multiple Attention Heads ★★★

Real Transformers run self-attention multiple times in parallel (called **multi-head attention**). Each "head" looks for different types of relationships:

- Head 1 might track grammatical structure (subject-verb-object)
- Head 2 might track coreference ("she" refers to "Alice")
- Head 3 might track semantic similarity (synonyms)
- Head 4 might track positional patterns

The outputs are combined. The model gets multiple perspectives on each token simultaneously.

### Multi-Query and Grouped-Query Attention — Modern Optimizations

Standard multi-head attention creates separate Q, K, V for each head. This works well but the KV cache ([Ch 17c §1.2](#content/17c_llm_systems)) becomes enormous during text generation.

**Multi-Query Attention (MQA):** All heads share the SAME K and V — only Q differs per head.

```
  Standard Multi-Head Attention (e.g., 32 heads):
  Head 1:  Q₁, K₁, V₁
  Head 2:  Q₂, K₂, V₂
  ...
  Head 32: Q₃₂, K₃₂, V₃₂
  → 32 separate K and V sets to cache = lots of memory

  Multi-Query Attention:
  Head 1:  Q₁, K_shared, V_shared
  Head 2:  Q₂, K_shared, V_shared
  ...
  Head 32: Q₃₂, K_shared, V_shared
  → Only 1 K and 1 V to cache = 32× less KV cache memory!
```

**Grouped-Query Attention (GQA):** A middle ground — heads are divided into groups, and each group shares K and V.

```
  GQA with 8 groups (32 heads total):
  Group 1 (heads 1-4):   Q₁-Q₄ share K₁, V₁
  Group 2 (heads 5-8):   Q₅-Q₈ share K₂, V₂
  ...
  Group 8 (heads 29-32): Q₂₉-Q₃₂ share K₈, V₈
  → 8 K and V sets to cache = 4× less memory than standard

  Quality:    Standard MHA > GQA > MQA
  Speed:      MQA > GQA > Standard MHA
  Sweet spot: GQA — nearly as good as standard, much faster

  Used by: LLaMA 2 (70B), LLaMA 3, Mistral, Gemma
```

### Multi-Head Latent Attention (MLA) ★★ `L2`

**In one line:** instead of sharing K and V across heads, *compress* them into a small latent vector and cache only that — then reconstruct K and V on the fly.

**Why it exists.** MQA and GQA shrink the KV cache by giving up heads. MLA (introduced with DeepSeek-V2 and used in V3) asks a different question: what if you keep all the heads but store a *compressed* representation? Each token's K and V are projected down to a low-rank latent vector $c_{kv}$, and only that latent sits in the cache. At attention time the full K and V are projected back up.

```
  GQA:  cache K,V for 8 groups          → cache size ÷ 8
  MLA:  cache ONE small latent c_kv     → cache size ÷ 5 to ÷ 13
        per token, then up-project

  token ──▶ [ down-projection ] ──▶ c_kv  (small — this is all you cache)
                                     │
                                     ├──▶ [ up-proj ] ──▶ K
                                     └──▶ [ up-proj ] ──▶ V
```

**The trade-off:** you swap memory for a little extra compute (the up-projection runs every step). Since decode is memory-bandwidth-bound, that is usually a very good trade. Reported quality is on par with — sometimes slightly better than — full MHA, because the latent acts as a mild bottleneck regulariser rather than a crude head-sharing shortcut.

**Say this in an interview:**
> "MQA and GQA reduce KV cache by sharing key/value heads, which costs some quality. MLA instead compresses K and V into a low-rank latent and caches only that, reconstructing them per step — so you get a 5–13× smaller cache while keeping per-head diversity. It trades a bit of compute for memory, which is the right direction because decode is bandwidth-bound."

---

### Sliding-Window (Local) Attention ★★ `L2`

**In one line:** each token attends only to the last *W* tokens rather than the entire history, turning attention from quadratic to linear in sequence length.

**Why it exists.** Full attention costs $O(n^2)$. At 100K tokens that is unaffordable. Most tokens mostly need *nearby* context anyway, so Mistral and others bound the window — typically 4,096 tokens.

**The clever part — stacked layers extend the reach.** A window of W does not mean the model can only see W tokens back. Each layer lets information hop one window, so after $L$ layers the effective receptive field is roughly $W \times L$:

```
  W = 4096, 32 layers  →  effective reach ≈ 131,072 tokens

  layer 1:  token 10000 sees 5904..10000
  layer 2:  those tokens each saw 4096 back  → reach 1808..10000
  layer 3:  ...                              → reach grows each layer
```

It is the same intuition as stacking small convolutions to get a large receptive field.

| | Full attention | Sliding-window |
|---|---|---|
| Cost | $O(n^2)$ | $O(n \cdot W)$ |
| Exact long-range links | Yes, direct | Indirect, via layer stacking |
| Best for | Short/medium context, retrieval-critical tasks | Long documents, streaming, on-device |

**Watch out:** because long-range links are indirect, sliding-window models can degrade on tasks needing precise recall of a single distant fact — exactly what needle-in-a-haystack evaluations probe. Many production models use a **hybrid**: a few full-attention layers interleaved among sliding-window ones.

---

### Attention variants at a glance ★★★ `L2`

Interviewers ask you to walk this ladder. Memorise the direction of each trade.

| Variant | KV heads cached | KV cache | Quality | Used by |
|---|---|---|---|---|
| **MHA** | one per query head | baseline | best | GPT-2, original Transformer |
| **MQA** | exactly 1, shared | ÷ H (largest cut) | noticeable drop | PaLM, Falcon |
| **GQA** | H / g groups | ÷ g (e.g. ÷ 8) | ≈ MHA | Llama 3, Mistral, Gemma |
| **MLA** | 1 compressed latent | ÷ 5 to ÷ 13 | ≈ MHA or better | DeepSeek-V2 / V3 |
| **Sliding-window** | unchanged per token, but bounded span | grows with W not n | task-dependent | Mistral, Gemma 2 |

> **The one-liner that ties it together:** MQA, GQA and MLA attack the *number of bytes per token*; sliding-window attacks the *number of tokens*. They compose — Mistral uses GQA **and** sliding-window together.

---

### What else changed since 2017 — the modern block ★★ `L2`

"Explain how a 2026 Transformer block differs from the one in *Attention Is All You Need*" is a common opener. Four things changed:

| Change | Original (2017) | Modern | Why |
|---|---|---|---|
| **Norm placement** | Post-LN — normalise *after* the sublayer | **Pre-LN** — normalise *before* | Post-LN needs learning-rate warmup and gets unstable when deep; pre-LN keeps a clean residual path and trains reliably at depth |
| **Norm type** | LayerNorm (re-centre + re-scale) | **RMSNorm** (re-scale only) | Drops the mean subtraction — nearly identical quality, measurably cheaper |
| **FFN activation** | ReLU | **SwiGLU** | A gated unit: one projection produces the values, a second produces a Swish-activated gate that multiplies them |
| **Positional info** | Fixed sinusoidal, added to embeddings | **RoPE** | Rotates Q and K by position, so attention depends on *relative* distance and extrapolates further |

**SwiGLU in one line:** `SwiGLU(x) = (xW₁ ⊙ Swish(xW₂))W₃` — the gate lets the network learn *which* features to pass through, not just how much to rectify them.

```
  ReLU FFN:      x ──▶ [W₁] ──▶ ReLU ──▶ [W₂] ──▶ out     (2 matrices)

  SwiGLU FFN:    x ──┬─▶ [W₁] ─────────────┐
                     │                     ⊙ ──▶ [W₃] ──▶ out   (3 matrices)
                     └─▶ [W₂] ─▶ Swish ────┘
```

Because SwiGLU needs three matrices instead of two, implementations shrink the hidden dimension (typically to about 2/3) so the parameter count stays comparable.

**Say this in an interview:**
> "A modern block is pre-norm instead of post-norm, uses RMSNorm instead of LayerNorm, SwiGLU instead of ReLU in the FFN, RoPE instead of additive sinusoidal positions, and GQA or MLA instead of plain multi-head attention. Every one of those is a stability, efficiency or extrapolation win rather than a change to the core attention idea — which is unchanged since 2017."

---

### The Full Transformer Block

Each of the 12-96 layers in an LLM is a "Transformer block":

```
  Input
    ↓
  Self-Attention: each token looks at all others, gathers context
    ↓
  Add & Normalize: add input back in (skip connection), normalize
    ↓
  Feed-Forward Network: two linear layers with a nonlinearity
    ↓
  Add & Normalize: again
    ↓
  Output (enriched representation, ready for next layer)
```

After 12-96 of these blocks, the final representation is rich enough to predict the next token accurately.

### Key Components Inside the Transformer Block

Let's break down each component mentioned in the diagram above.

**Softmax — Turning Scores Into Probabilities**

Softmax appears everywhere in LLMs — in attention scores and in the final output layer. It takes a list of raw numbers (called **logits**) and converts them into probabilities that sum to 1.

**Worked example** with input logits $[2.0, 1.0, 0.1]$:

$$\text{Step 1: Exponentiate each: } [e^{2.0}, e^{1.0}, e^{0.1}] = [7.39, 2.72, 1.11]$$

$$\text{Step 2: Sum them: } 7.39 + 2.72 + 1.11 = 11.22$$

$$\text{Step 3: Divide each by sum: } \left[\frac{7.39}{11.22}, \frac{2.72}{11.22}, \frac{1.11}{11.22}\right]$$

$$\text{Output probabilities: } [0.659, 0.242, 0.099] \quad \rightarrow \text{sums to 1.0}$$

Key property: larger inputs get DISPROPORTIONATELY more probability. The difference between 2.0 and 1.0 in the input becomes 0.659 vs 0.242 in the output. Softmax sharpens differences -- it makes the model "decisive."

**Formula:** $\text{softmax}(x_i) = \dfrac{e^{x_i}}{\sum_j e^{x_j}}$

**Residual (Skip) Connections — Preventing Information Loss**

Each sub-layer (attention, feed-forward) has a "skip connection" that adds the original input directly to the output:

$$\text{output} = \text{SubLayer}(\text{input}) + \text{input}$$

The "$+ \text{input}$" is the skip connection.

```
  Without skip connection:
  Layer 1 → Layer 2 → ... → Layer 96
  Information must survive 96 transformations. It often doesn't — 
  gradients vanish, and the model can't learn.

  With skip connection:
  Each layer only needs to learn the DIFFERENCE (residual) from its input.
  The original signal is always preserved by the shortcut.

  Analogy: It's like writing annotations on a photocopy of a document
  rather than rewriting the document from scratch at each step —
  the original is always there.
```

**Layer Normalization — Keeping Numbers Stable**

After each sub-layer, the values are normalized so they don't grow too large or too small:

LayerNorm adjusts each vector to have mean approximately 0 and standard deviation approximately 1, then applies a learned scale $\gamma$ and shift $\beta$:

$$\text{LayerNorm}(x) = \gamma \cdot \frac{x - \mu}{\sqrt{\sigma^2 + \epsilon}} + \beta$$

Why this matters: Without normalization, after passing through 96 layers, values might explode ($10^{15}$) or vanish ($10^{-15}$). Training becomes completely unstable. With normalization, values stay in a manageable range at every layer.

```
  Variants:
  - Post-LN: normalize AFTER attention/FFN (original Transformer)
  - Pre-LN: normalize BEFORE attention/FFN (used by GPT-2+, LLaMA)
    Pre-LN trains more stably and is now the standard.
```

**Feed-Forward Network (FFN) — Where Knowledge Is Stored**

The FFN is a simple two-layer neural network applied to each token independently:

$$\text{FFN}(x) = W_2 \cdot \text{activation}(W_1 \cdot x + b_1) + b_2$$

```
  Step 1: Expand — project to a larger dimension (e.g., 4096 → 16384)
  Step 2: Activate — apply nonlinearity (GeLU or SiLU in modern LLMs)
  Step 3: Compress — project back to original dimension (16384 → 4096)

  Key insight from research:
  - Attention layers handle RELATIONSHIPS between tokens
    ("what is relevant to what?")
  - FFN layers store FACTUAL KNOWLEDGE
    ("Paris is the capital of France")

  The FFN contains roughly 2/3 of the model's total parameters.
  This is where most of the model's "memory" lives.
```

### Query, Key, Value — The Core of Attention ★★★

Self-attention is built on three concepts borrowed from information retrieval: **Query**, **Key**, and **Value**.

**The analogy:** Think of looking up a book in a library.

```
  Query (Q) = "What am I looking for?"
    → The current token asking a question: "Who is relevant to me?"

  Key (K) = "What does each book's label say?"
    → Every token advertising what it has to offer

  Value (V) = "What's actually inside the book?"
    → The actual information each token carries

  Process:
  1. Compare my Query against every Key → get relevance scores
  2. Use those scores to weight the Values → get a focused summary
```

**How it works mathematically (simplified):**

For each token, the model creates three vectors:

$$Q = \text{token} \times W_Q \quad K = \text{token} \times W_K \quad V = \text{token} \times W_V$$

Attention score between token $i$ and token $j$:

$$\text{score}(i,j) = \frac{Q_i \cdot K_j}{\sqrt{d_k}}$$

The $\sqrt{d_k}$ prevents scores from getting too large (called "scaled dot-product attention").

Apply softmax to get weights that sum to 1: $\text{weights} = \text{softmax}(\text{scores})$

Final output for token $i$: $\text{output}_i = \sum_j \text{weight}_{ij} \times V_j$

In short: each token gets a weighted average of all other tokens' values, where the weights are determined by how well queries match keys.

**The Attention Formula:**

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right) V$$

Where $Q$ = queries, $K$ = keys, $V$ = values, $d_k$ = dimension of keys (for scaling).

```

  Where:
  Q = all queries stacked as a matrix
  K = all keys stacked as a matrix  
  V = all values stacked as a matrix
  d_k = dimension of the keys (for scaling)
  K^T = K transposed (flip rows and columns)
```

**Concrete example:**

```
  Sentence: "The cat sat on the mat"
  Focus token: "sat"

  Q_sat asks: "Who did the sitting? Where was it?"
  K_cat says: "I'm an animal, a subject"     → high score with Q_sat
  K_mat says: "I'm a location, a surface"     → moderate score with Q_sat
  K_the says: "I'm just an article"           → low score with Q_sat

  Result: "sat" pays most attention to "cat" (the doer) and "mat" (the place)
  Its new representation encodes: "sitting done by cat on mat"
```

### Positional Encoding — How the Model Knows Word Order ★★

Self-attention treats all tokens equally — it has no built-in notion of "first word", "second word", etc. Without help, "The cat sat on the mat" and "The mat sat on the cat" would look identical.

**Positional encoding** gives each token a position signal:

```
  Token:    [The]    [cat]    [sat]    [on]    [the]    [mat]
  Position:  0        1        2        3       4        5

  Each position gets a unique vector added to the token's embedding:
  final_embedding = token_embedding + position_embedding
```

**Types of positional encoding:**

| Method | Used By | How It Works |
|--------|---------|-------------|
| Sinusoidal (fixed) | Original Transformer | Uses sin/cos waves of different frequencies |
| Learned absolute | GPT-2, BERT | Each position has a learned vector |
| RoPE (Rotary) | LLaMA, Mistral | Rotates embeddings based on position — supports length extrapolation |
| ALiBi | BLOOM | Adds a linear bias to attention scores based on distance |
| Relative position | T5, DeBERTa | Encodes distance between tokens, not absolute position |

**RoPE (Rotary Position Embedding)** deserves special attention — it's used by most modern LLMs:

```
  Instead of adding a position vector, RoPE rotates the Q and K vectors
  by an angle proportional to their position:

  Q_rotated = rotate(Q, position × θ)
  K_rotated = rotate(K, position × θ)

  When computing Q · K, the angle difference naturally encodes
  the relative distance between tokens.

  Key advantage: The model can generalize to longer sequences than
  it was trained on (with techniques like NTK-aware scaling or YaRN).
```

### Causal (Masked) Attention vs. Bidirectional Attention

Not all LLMs attend to all tokens. There are two major patterns:

```
  CAUSAL (MASKED) ATTENTION — Used by GPT, LLaMA, Claude
  Each token can only attend to tokens BEFORE it (and itself).
  Token 5 can see tokens 0-5, but NOT tokens 6, 7, 8...

  Why? Because during generation, future tokens don't exist yet.
  The model must predict the next token using only past context.

  Attention mask looks like:
  1 0 0 0 0    (token 0 sees only itself)
  1 1 0 0 0    (token 1 sees tokens 0-1)
  1 1 1 0 0    (token 2 sees tokens 0-2)
  1 1 1 1 0    (token 3 sees tokens 0-3)
  1 1 1 1 1    (token 4 sees tokens 0-4)

  BIDIRECTIONAL ATTENTION — Used by BERT, RoBERTa
  Each token can attend to ALL tokens in the sequence.
  Token 3 can see tokens 0, 1, 2, 3, 4, 5...

  Better for understanding tasks (the model sees full context),
  but can't be used for text generation (you'd be "cheating"
  by looking at tokens that haven't been generated yet).
```

---

## 2.5 Generating Text — How the Output Works

The LLM produces a list of scores — one for every token in its vocabulary (100K–200K in modern models). The score says "how likely is this token to come next?"

```
  After processing "The capital of France is"...
  
  Score for "Paris":     15.2  → high (very likely)
  Score for "Lyon":       4.1  → lower (possible)
  Score for "Berlin":     2.3  → low (wrong country)
  Score for "pizza":     -8.1  → very low (makes no sense)
```

These scores are converted to probabilities using **softmax**. Then one token is **sampled** from this distribution.

**Key insight:** The model doesn't just pick the most likely word every time. It samples from the distribution. This is why the same prompt can give different answers each time — there's randomness in the sampling.

---

## 2.6 Decoding Strategies — How Tokens Are Chosen

The model produces a probability distribution over the whole vocabulary (100K+ tokens). But how do you pick which token to actually use? Different strategies give very different results.

### Greedy Decoding

Always pick the most probable token at each step.

```
  Step 1: P("Paris") = 0.85, P("Lyon") = 0.05, ...  → pick "Paris"
  Step 2: P(",") = 0.70, P(".") = 0.20, ...          → pick ","
  Step 3: P("the") = 0.40, P("which") = 0.15, ...    → pick "the"

  Pros: Fast, deterministic
  Cons: Can produce repetitive, boring text.
        Can get stuck in loops: "the the the the..."
        Misses globally better sequences by being locally greedy
```

### Beam Search

Keep track of the top-B sequences (beams) at each step. Explores multiple possibilities simultaneously.

```
  Beam width = 3 (track top 3 candidates)

  Step 1:
    Beam 1: "Paris"     (score: 0.85)
    Beam 2: "Lyon"      (score: 0.05)
    Beam 3: "the"       (score: 0.03)

  Step 2: Extend each beam, keep top 3 overall:
    Beam 1: "Paris,"           (score: 0.85 × 0.70 = 0.595)
    Beam 2: "Paris."           (score: 0.85 × 0.20 = 0.170)
    Beam 3: "Paris is"         (score: 0.85 × 0.08 = 0.068)

  Continue until all beams reach [EOS].
  Pick the highest-scoring complete sequence.

  Pros: Finds better overall sequences than greedy
  Cons: Slower, still tends toward generic/safe outputs
  Best for: Machine translation, summarization
```

### Top-K Sampling

Only sample from the top K most likely tokens. Eliminates the long tail of unlikely tokens.

```
  Full distribution: {Paris: 0.40, Lyon: 0.10, Berlin: 0.05, ..., pizza: 0.0001}

  Top-K (K=3): {Paris: 0.40, Lyon: 0.10, Berlin: 0.05}
  → Renormalize: {Paris: 0.73, Lyon: 0.18, Berlin: 0.09}
  → Sample from these 3 options only

  K=1: Same as greedy (always pick top-1)
  K=50: Common default, good variety
  K=vocab_size: Same as unrestricted sampling
```

### Top-P (Nucleus) Sampling

Instead of picking a fixed number of tokens (Top-K), include the smallest set of tokens whose combined probability reaches P.

```
  Distribution: {Paris: 0.60, Lyon: 0.10, Marseille: 0.08, Berlin: 0.05, Madrid: 0.04, ...}

  Top-P (P=0.9):
  Paris(0.60) + Lyon(0.10) + Marseille(0.08) + Berlin(0.05) + Madrid(0.04) + others = 0.90
  → Include tokens until cumulative probability hits 90%, ignore the rest
  → Renormalize and sample

  Top-P (P=0.5):
  Paris(0.60) already exceeds 0.5
  → Almost always picks "Paris" (very focused)

  Why Top-P over Top-K?
  Top-K always picks exactly K tokens, REGARDLESS of confidence.
  - If the model is 99% sure, K=50 still considers 50 tokens (wasteful noise)
  - If the model is unsure, K=5 might miss good options

  Top-P ADAPTS: when the model is confident (one token dominates),
  it considers fewer options. When uncertain, it considers more.
```

**Temperature + Top-P together:** Temperature reshapes the distribution FIRST (sharper or flatter), then Top-P selects from it. Most APIs use both together (common defaults: temperature=0.7, top_p=0.9). More detail on Temperature in Section 8.

### The Autoregressive Loop — How Full Responses Are Generated

LLMs generate text **one token at a time**, feeding each generated token back as input:

```
  Prompt: "Tell me a joke"

  Step 1: Input: "Tell me a joke"
          Model outputs: "Why"

  Step 2: Input: "Tell me a joke Why"
          Model outputs: " did"

  Step 3: Input: "Tell me a joke Why did"
          Model outputs: " the"

  Step 4: Input: "Tell me a joke Why did the"
          Model outputs: " chicken"

  ... (continues until the model outputs [EOS] or hits max_tokens)

  This is why LLM output appears to "stream" word by word.
  Each token requires a full forward pass through the entire model.
```

**Important implication:** Generating 100 tokens requires 100 forward passes. This is why:
- Longer outputs take longer to generate
- Input tokens are processed in parallel (fast), but output tokens are sequential (slow)
- The **KV cache** optimization stores intermediate results to avoid recomputing everything each step (covered in Section 12)

---

# SECTION 3: HOW LLMs ARE TRAINED

---

## 3.1 Stage 1 — Pre-Training ★★

**What happens:** Feed the model an enormous amount of text and train it to predict the next token.

**The training data:**

```
  Common Crawl (web pages):  ~60% of training data
  Books:                     ~16%
  Wikipedia:                  ~3%
  GitHub (code):              ~3%
  Scientific papers:          ~2%
  Other curated data:        ~16%
```

GPT-3 was trained on 300 billion tokens. At 0.75 words/token, that's 225 billion words — equivalent to reading 750,000 novels.

**The training process:**

```
  1. Take a chunk of text: "The quick brown fox jumps"
  2. Predict the next token at each position:
     "The" → predict "quick"
     "The quick" → predict "brown"
     "The quick brown" → predict "fox"
     ...
  3. Compare prediction to actual next token → compute loss
  4. Backpropagate → update 175 billion weights
  5. Repeat billions of times
```

**How long does this take?**

Training GPT-3 took approximately:
- 3,640 petaflop/s-days of compute
- ~950 high-end GPUs running for ~34 days
- ~$4.6 million in cloud compute costs

---

### Data curation — the work that actually determines quality ★★ `L2`

"Trained on 15 trillion tokens" hides the real engineering. Raw web scrape is mostly unusable, and the curation pipeline matters more to final quality than most architecture choices.

| Stage | What it does | Why it matters |
|---|---|---|
| **Language & quality filtering** | Drop boilerplate, spam, machine-translated text; keep documents a classifier or perplexity filter rates as prose | Most of a raw crawl is navigation chrome and SEO filler |
| **Deduplication (MinHash / LSH)** | Find near-duplicate documents by shingling text and hashing, so similar docs collide | Web data contains massive duplication. Duplicates get *memorised* rather than learned, waste compute, and inflate eval scores |
| **Decontamination** | Remove documents containing n-grams from your benchmark test sets | Otherwise you are testing memorisation and your MMLU number is fiction |
| **Mixture weighting** | Decide how much code, maths, multilingual, books | Code in the mix measurably improves reasoning, even for non-code tasks |
| **Synthetic augmentation** | Generate high-quality data from a stronger model | Increasingly common where clean human data is scarce |

**MinHash in one line:** break each document into overlapping k-word shingles, hash them, keep the minimum hash per permutation — documents that share many shingles produce matching signatures, so near-duplicates can be found without comparing every pair.

> **The connection to §4.5 (contamination):** decontamination during curation is the *only* place you can prevent benchmark leakage. Once it is in the weights, no evaluation trick recovers a clean measurement — which is why held-out private evals exist.

---

## 3.2 What the Model Learns From Predicting Text
Nobody told the model "learn grammar" or "learn facts about history." Yet it learned both. Here's why:

**To accurately predict the next word, you need to understand everything about language and the world.**

- To predict "The capital of France is ___", you need to know geography.
- To predict "She picked up the ball and ___ it to him", you need to understand physics and grammar.
- To predict "def add(a, b): return ___", you need to know Python.
- To predict "2 + 2 = ___", you need basic arithmetic.

All of this is encoded in the 175 billion weights — not as explicit rules, but as statistical patterns learned from reading half the internet.

---

## 3.3 Stage 2 — Supervised Fine-Tuning (SFT) ★★★

After pre-training, the model can complete text — but it doesn't know how to be an assistant. It might just continue a question instead of answering it.

SFT teaches the model to respond helpfully:

```
  Collect ~10,000-100,000 examples of ideal conversations:
  Human: "How do I make pasta?"
  Assistant: "Bring a large pot of salted water to a boil..."

  Fine-tune the model on these examples.
  Now it learns: when a question appears, answer it helpfully.
```

---

## 3.4 Stage 3 — RLHF (Making It Actually Helpful) ★★★

**In one sentence:** a pipeline that teaches the model to produce outputs humans actually *prefer* — not merely outputs that are grammatically likely.

### Why next-token prediction isn't enough

A model trained only to predict the next token is fluent but not necessarily **helpful, honest or harmless**. It will happily produce plausible-sounding nonsense, dodge the question, or repeat something harmful — because all of those are statistically reasonable continuations of internet text. Nothing in the pre-training objective says "be useful."

**The analogy:** you hire someone (the pre-trained model). They can write, but not the way your company needs. You give them a style manual and worked examples (**SFT**). Then their manager reviews their output and ranks it (**reward model**). Then you coach them to consistently produce top-ranked work (**RL fine-tuning**).

### Stage 1 — Supervised fine-tuning

Collect on the order of 10,000 ideal (prompt, response) pairs written by humans and fine-tune the base model on them. Result: a model that follows instructions — but inconsistently. (Covered in §3.3 above.)

### Stage 2 — Train a reward model

For each prompt, sample 4–9 responses from the SFT model and have human labellers **rank** them. Then train a separate model to predict those rankings:

```
  Input:  (prompt, response)  →  Output: a single scalar quality score
```

The training objective pushes the winning response's score above the loser's:

$$L = -\log\!\left(\sigma(s_{\text{win}} - s_{\text{lose}})\right)$$

The important consequence: **once trained, the reward model can score any new response without a human in the loop.** That is what makes the next stage possible at all — you have converted expensive human judgement into a cheap automatic signal.

> Note the labellers **rank** rather than score. Humans are reliable at "A is better than B" and unreliable at "this is a 7 out of 10", so the data collection is designed around comparisons.

### Stage 3 — RL fine-tuning with PPO

The model generates responses, the reward model scores them, and PPO updates the model toward higher-scoring output.

**The critical KL constraint:**

$$R_{\text{total}} = R_{\text{reward model}} - \beta \cdot D_{KL}\!\left(\pi \,\|\, \pi_{\text{SFT}}\right)$$

The KL term penalises drifting too far from the Stage 1 model. Without it the policy discovers ways to **fool the reward model** — high-scoring gibberish, or the verbosity and sycophancy patterns described in §3.5c. The KL term is what keeps it grounded, and $\beta$ is the dial between "obey the reward model" and "stay close to something sane."

```
  prompt ──▶ policy (LLM) ──▶ response ──┬──▶ reward model ──▶ score
                  ▲                      │
                  │                      └──▶ KL vs SFT model ──▶ penalty
                  └────────── PPO update ◀────── score − β·KL
```

**Result:** ChatGPT, Claude, Gemini — models that are genuinely usable, rather than merely fluent.

> **This is the classic recipe, and it is no longer the only one.** DPO removes the reward model and the RL loop entirely (§3.5), GRPO and RLVR power reasoning models (§3.5b), and §3.5c compares the whole family and tells you which to pick for the feedback data you actually have.

---

## 3.5 Stage 3 (Alternative) — DPO (Direct Preference Optimization) ★★★

RLHF is effective but complex — it requires training a separate reward model and using reinforcement learning. **DPO** is a simpler alternative that achieves similar results.

**The key insight:** Instead of training a reward model and then doing RL, DPO directly updates the language model using preference pairs.

```
  RLHF pipeline:
  1. Collect preference data (response A > response B)
  2. Train a reward model on these preferences
  3. Use RL (PPO) to optimize the LLM against the reward model
  → 3 separate training stages, complex and unstable

  DPO pipeline:
  1. Collect preference data (response A > response B)
  2. Directly fine-tune the LLM using a special loss function
     that increases probability of preferred responses
     and decreases probability of rejected responses
  → 1 training stage, simpler and more stable
```

**DPO loss function (intuition):**

```
  For each preference pair (prompt, good_response, bad_response):
    Increase P(good_response | prompt)
    Decrease P(bad_response | prompt)
    But don't drift too far from the original model (KL penalty)
```

**Why DPO is popular:**
- Simpler to implement (no RL, no reward model)
- More stable training
- Used by LLaMA 3, Zephyr, and many open-source models
- Results are comparable to RLHF

---

## 3.5b Stage 3 (2025) — RLVR & GRPO for Reasoning Models ★★★

RLHF and DPO align a model to human *preferences*. The 2025 breakthrough was aligning it to **correctness** — the method behind reasoning models (OpenAI o-series, DeepSeek-R1).

> **RLVR (Reinforcement Learning with Verifiable Rewards)** trains the model on tasks whose answers can be *checked automatically* — math with a known result, code that must pass tests, proofs a verifier accepts. The reward is the objective correctness signal, so there is no learned (and gameable) reward model.

The workhorse optimizer is **GRPO (Group Relative Policy Optimization)**, introduced with DeepSeek-R1. GRPO drops PPO's separate value/critic network:

- Sample a **group** of *k* answers for each prompt.
- Score each (e.g., 1 if the math/code is correct, else 0).
- Use each answer's reward **minus the group average** as its advantage — a group baseline that replaces PPO's value function. Cheaper, and a natural fit for verifiable rewards.

Because the model is rewarded for reasoning traces that reach correct answers, it learns to "think" in long chains of thought before responding. The modern post-training stack is often **SFT → DPO → RLVR/GRPO**. (More on reasoning models in §15.1.)

---

## 3.5c The Post-Training Family — Choosing an Alignment Algorithm ★★★ `L2`

**In one line:** SFT teaches format, then *one* of a growing family of preference algorithms teaches judgement — and interviewers now expect you to compare them, not just name RLHF.

**Why this matters.** In 2023 the answer was "SFT then RLHF". By 2026 there are eight credible options, and the interesting question is which one fits your data. The deciding factor is almost always **what feedback you actually have**, not which algorithm is newest.

| Algorithm | Feedback it needs | Extra models required | Use it when |
|---|---|---|---|
| **SFT** | Prompt → ideal response demonstrations | none | Always first. Teaches format and instruction-following |
| **RLHF (PPO)** | Pairwise human preferences | reward model + critic + reference | The classic. Powerful, but three extra models and a fiddly RL loop |
| **DPO** | Preference pairs (chosen / rejected) | reference model only | Default offline choice. Same objective as RLHF, no reward model, no RL |
| **SimPO** | Preference pairs | **none** | DPO without even a reference model — simpler and cheaper |
| **KTO** | Single thumbs-up / thumbs-down labels | none | You have unpaired feedback. Real products collect this, not pairs |
| **ORPO** | Instruction demos with a rejected sample | none | Merges SFT and alignment into one stage |
| **GRPO** | Prompts only, plus a scorable outcome | **no critic** | Reasoning and maths. Powers DeepSeek-R1 |
| **RLVR** | Tasks with an automatically *verifiable* answer | a verifier, not a reward model | Code and maths, where correctness can be checked by running it |

### The two ideas worth understanding properly

**1. Why DPO replaced PPO in most shops.** RLHF trains a separate reward model on human preferences, then uses PPO to maximise that reward while a KL penalty stops the policy drifting from the reference. DPO's insight is that the optimal policy for that objective has a closed form — so you can skip the reward model and the RL loop entirely and optimise the policy *directly* on preference pairs with a simple classification-style loss. Same goal, far less machinery.

**2. Why GRPO drops the critic.** PPO needs a critic (value network) to estimate how good a state is, so it can compute advantage. GRPO instead samples a **group** of responses to the same prompt, scores them all, and uses the group's mean as the baseline — the advantage of a response is just how much better it did than its siblings. No critic means roughly half the memory and one fewer model to train, which is what makes long chain-of-thought RL affordable.

```
  PPO:   response ──▶ reward model ──▶ reward
                  ──▶ critic       ──▶ baseline   → advantage

  GRPO:  sample G responses to the SAME prompt
         score all G
         baseline = mean(scores)                  → advantage
         (no critic network at all)
```

### Reward hacking — the failure mode they will ask about ★★ `L2`

**In one line:** the model finds a way to score highly on your reward signal without doing the thing the reward was meant to measure.

This is Goodhart's law inside the training loop. Classic examples:

| Reward signal | What the model learns instead |
|---|---|
| Human raters prefer longer answers | Padding and repetition — **verbosity is the most common reward hack** |
| Raters prefer confident tone | Confident-sounding hallucination |
| "Was the user satisfied?" | Sycophancy — agreeing with the user rather than being correct |
| Unit tests must pass | Special-casing the tests instead of implementing the function |

**Defences:** the KL penalty against the reference model (bounds how far it can drift), length normalisation, holding out a fresh preference set the reward model never saw, adversarial probing of the reward model, and — most reliably — evaluating on tasks the reward model was *not* trained on.

### Process reward models (PRM) ★★ `L2`

**In one line:** score every reasoning *step*, not just the final answer.

An **outcome** reward model (ORM) sees only the end result. That creates a specific pathology in multi-step maths: a model can reach the correct answer through invalid reasoning — a sign error that cancels, a lucky guess — and be rewarded for it, which reinforces exactly the wrong behaviour.

A **process** reward model assigns credit per step:

```
  Problem: 12 x 15

  ORM view:                     PRM view:
  ┌────────────────────┐        ┌────────────────────┬─────┐
  │ step 1  (wrong)    │        │ step 1  (wrong)    │  ✗  │
  │ step 2  (wrong)    │        │ step 2  (wrong)    │  ✗  │
  │ answer: 180  ✓     │        │ answer: 180        │  ✓  │
  └────────────────────┘        └────────────────────┴─────┘
   Reward: POSITIVE              Reward: mostly negative
   → reinforces bad reasoning    → reinforces correct reasoning
```

**Two things PRMs buy you:**

1. **Denser training signal.** One scalar at the end of a 2,000-token chain is a very sparse reward. Per-step labels give the optimiser far more to work with.
2. **Test-time search.** You can score *partial* reasoning paths, so beam search or tree search over reasoning becomes possible — expand the promising branches, prune the rest. This is a core mechanism behind test-time compute scaling in reasoning models.

**The cost:** step-level labels are expensive. Human annotation of every step does not scale, so practitioners use automated approaches — roll out many completions from a given prefix and label the step by how often it leads to a correct final answer.

**Say this in an interview:**
> "An outcome reward model can't distinguish sound reasoning from a lucky answer, so it rewards both. A process reward model scores each step, which gives a much denser training signal and — more usefully — lets you score partial reasoning paths, so test-time search over reasoning becomes possible. The catch is label cost, which in practice is handled by rolling out completions from each prefix and labelling steps by how often they lead to a correct answer."

**Say this in an interview:**
> "I'd start with SFT to fix the output format. For alignment I'd default to DPO — it hits the same objective as RLHF without a reward model or an RL loop. If my feedback is thumbs-up/down rather than pairs I'd use KTO, since forcing unpaired data into pairs throws away signal. For maths or code where I can verify correctness automatically, GRPO or RLVR, because a verifier is a cleaner reward than a learned model and GRPO drops the critic so it fits in memory. Throughout I'd watch for reward hacking — especially verbosity — and keep the KL penalty plus a held-out eval the reward model never saw."

**They will then ask:** *"Your DPO-tuned model got more verbose and users like it less. What happened?"*
Length bias in the preference data: annotators systematically preferred longer answers, so "longer" got baked into the objective. Fix by length-normalising the loss or the data, adding a length-controlled evaluation, and checking whether your win-rate metric is itself rewarding verbosity — an LLM judge has the same bias ([Ch 17c §4.2](#content/17c_llm_systems)).

---

## 3.6 Training Infrastructure — What It Actually Takes

> **This section is deliberately short — and it is the biggest gap in most people's preparation.** Interviewers at Meta, Google, NVIDIA, Anthropic and xAI routinely ask candidates to compare **DDP → FSDP → ZeRO-1/2/3**, and to explain **tensor, pipeline, sequence and expert parallelism**, gradient checkpointing and bf16/FP8. All of that lives in **[Ch 29 — GPUs, TPUs & Infrastructure](#content/29_gpus_tpus_infrastructure)**. If you are targeting a systems or infra role, read Ch 29 immediately after this section — do not stop here. `L4`

Training an LLM is one of the most compute-intensive tasks in all of computing.

### Hardware Requirements

```
  Small model (7B parameters):
  - 4-8 high-end GPUs (A100 80GB or H100)
  - Training time: days to weeks
  - Cost: $10K-$100K

  Medium model (70B parameters):
  - 64-256 GPUs
  - Training time: weeks to months
  - Cost: $500K-$2M

  Large model (400B+ parameters):
  - 1000-16000 GPUs
  - Training time: months
  - Cost: $10M-$100M+

  GPT-4 reportedly used ~25,000 A100 GPUs over ~100 days
  Total cost estimated at $50-100M+
```

### Distributed Training Strategies

A single GPU can't hold a large model. Training must be split across many GPUs:

| Strategy | What It Splits | How It Works |
|----------|---------------|-------------|
| Data Parallelism | Training data | Each GPU has a full copy of the model, processes different data batches, gradients are averaged |
| Tensor Parallelism | Individual layers | Single layers are split across GPUs (e.g., half the attention heads on each GPU) |
| Pipeline Parallelism | Groups of layers | Different layers run on different GPUs, data flows through them like a pipeline |
| ZeRO (DeepSpeed) | Optimizer states | Splits optimizer memory across GPUs without splitting the model itself |
| FSDP (PyTorch) | Parameters + gradients | Fully shards everything across GPUs, gathers as needed |

In practice, large training runs use all of these simultaneously:

```
  Example: Training a 70B model on 256 GPUs
  - 8 GPUs per node, 32 nodes
  - Tensor parallelism within each node (8-way)
  - Pipeline parallelism across nodes (4-way)
  - Data parallelism across pipeline replicas (8-way)
  - 8 × 4 × 8 = 256 GPUs
```

### Key Training Techniques

**Mixed Precision Training:** Use 16-bit floats (FP16/BF16) instead of 32-bit for most computations. Cuts memory in half, speeds up training 2x, minimal quality loss.

**Gradient Checkpointing:** Don't store all intermediate activations in memory. Recompute them during the backward pass. Trades compute time for memory — allows training bigger models on less hardware.

**Learning Rate Schedule:** Training doesn't use a fixed learning rate:

```
  Phase 1 — Warmup (first ~2000 steps):
  Learning rate ramps up from 0 to peak (e.g., 3e-4)
  Why: Large updates early on are destabilizing

  Phase 2 — Cosine Decay (rest of training):
  Learning rate gradually decreases following a cosine curve
  Why: As the model gets closer to optimal, you want smaller, more precise updates

  0 ──── warmup ──── peak ──── cosine decay ──── near 0
```

**Data Decontamination:** Before training, remove test/benchmark data from the training set. Without this, the model might memorize answers to evaluation questions — making benchmarks meaningless.

---

## 3.7 Scaling Laws — Why Bigger Models Work Better

One of the most important discoveries in LLM research: model performance improves **predictably** as you increase compute, data, and parameters.

**The original scaling laws (Kaplan et al., 2020):**

$$\text{Loss} \propto \frac{1}{N^\alpha} \quad \text{where } N = \text{number of parameters}$$

$$\text{Loss} \propto \frac{1}{D^\beta} \quad \text{where } D = \text{number of training tokens}$$

$$\text{Loss} \propto \frac{1}{C^\gamma} \quad \text{where } C = \text{total compute used}$$

```
  Translation: double the parameters → loss drops by a fixed, predictable amount.
  This relationship holds across many orders of magnitude.

  This is WHY the field kept making models bigger:
  GPT-1 (117M) → GPT-2 (1.5B) → GPT-3 (175B) → GPT-4 (~1T)
  Each jump gave predictable improvement.
```

**The Chinchilla correction (Hoffmann et al., 2022):**

The original scaling laws suggested: "make models as big as possible." Chinchilla showed: **for a fixed compute budget, you should balance model size and training data equally.**

```
  GPT-3:      175B parameters, trained on 300B tokens
  Chinchilla:  70B parameters, trained on 1.4T tokens
  → Chinchilla OUTPERFORMED GPT-3 despite being 2.5× smaller!

  The Chinchilla-optimal rule of thumb:
  Training tokens ≈ 20 × Parameters

  7B model   → train on ~140B tokens
  70B model  → train on ~1.4T tokens
  400B model → train on ~8T tokens

  This is why LLaMA (13B, trained on 1.4T tokens) beat GPT-3 (175B, 300B tokens).
  Data quantity and quality matter just as much as model size.
```

**Emergent abilities:** Some capabilities appear suddenly above certain model sizes — they aren't present in smaller models at all:

```
  < 10B parameters:  No chain-of-thought reasoning
  > 60B parameters:  Chain-of-thought works well

  < 100B parameters: Poor few-shot learning on complex tasks
  > 100B parameters: Strong few-shot learning appears

  These "phase transitions" mean you can't always predict
  what a larger model will be able to do by testing smaller ones.
  New capabilities can appear suddenly at scale.
```

```chart
{
  "type": "line",
  "data": {
    "labels": ["0.1B","0.3B","1B","3B","7B","13B","30B","65B","175B","540B","1T"],
    "datasets": [{
      "label": "Training Loss (lower = better)",
      "data": [3.8, 3.4, 2.9, 2.6, 2.3, 2.1, 1.9, 1.75, 1.6, 1.5, 1.4],
      "borderColor": "rgba(99, 102, 241, 1)",
      "backgroundColor": "rgba(99, 102, 241, 0.1)",
      "fill": true,
      "tension": 0.4, "pointRadius": 3, "borderWidth": 2
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Scaling Laws — More Parameters = Predictably Lower Loss" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Loss" }, "min": 1.0, "max": 4.0 },
      "x": { "title": { "display": true, "text": "Model Size (Parameters)" } }
    }
  }
}
```

---

## 3.8 Transfer Learning — Why Pre-Training Works ★★

The entire LLM pipeline relies on **transfer learning** — knowledge learned from one task (predicting text) transfers to help with completely different tasks (answering questions, writing code, etc.).

```
  Phase 1: Pre-training (general knowledge)
  The model reads the internet and learns:
  - Grammar and syntax of many languages
  - Facts about the world (geography, science, history)
  - Reasoning patterns (if A then B)
  - Code syntax and programming patterns
  - Conversational conventions

  Phase 2: Fine-tuning (specific skills)
  All that general knowledge TRANSFERS to the specific task.
  The model doesn't learn from scratch — it already "knows language."

  Analogy:
  A doctor who studied general medicine for 10 years (pre-training)
  can specialize in cardiology (fine-tuning) in 1 year.
  Someone with no medical background would need all 11 years.

  Why this works:
  Low-level features (word meanings, grammar, basic reasoning)
  are SHARED across all language tasks. Pre-training builds these
  general capabilities once, and fine-tuning adds task-specific
  skills on top — cheaply and quickly.
```

**Practical impact:**

```
  Training from scratch for a customer service chatbot:
  → Need millions of examples, weeks of training, huge cost

  Fine-tuning a pre-trained model for the same task:
  → Need ~1,000-10,000 examples, hours of training, small cost
  → Often BETTER results because the model already understands language
```

---

# SECTION 4: MAJOR LLM FAMILIES & ARCHITECTURES

---

## 4.1 The GPT Family (OpenAI)

GPT stands for **Generative Pre-trained Transformer**.

| Model | Year | Key Feature |
|-------|------|-------------|
| GPT-1 | 2018 | First proof of concept (117M params) |
| GPT-2 | 2019 | OpenAI initially "too dangerous to release" (1.5B params) |
| GPT-3 | 2020 | Few-shot learning, powered early ChatGPT (175B params) |
| GPT-3.5 | 2022 | Fine-tuned with RLHF → ChatGPT launch |
| GPT-4 | 2023 | Multimodal (text + images), major leap (~1T params, rumored MoE) |
| GPT-4o | 2024 | Native multimodal (text, vision, audio), faster and cheaper |
| GPT-4.1 | 2025 | API-focused, improved coding and instruction following |
| GPT-4.5 | 2025 | Largest pre-trained model, improved "EQ" and naturalness |
| GPT-5 series | 2025-26 | GPT-5.1 → 5.2 → 5.3-Codex → 5.4 → 5.5 → 5.6 Sol (current flagship; ~1M context, tiers Sol/Terra/Luna, plus 5.6 mini/nano) |

**Reasoning models (o-series):**

| Model | Year | Key Feature |
|-------|------|-------------|
| o1 | 2024 | First "thinking" model — reasons before answering |
| o3 | 2025 | 20% fewer errors than o1, agentic tool use |
| o3-pro | 2025 | Maximum reasoning quality for complex tasks |
| o4-mini | 2025 | Fast, cost-efficient reasoning; 99.5% on AIME 2025 |

**Architecture:** Decoder-only Transformer. Reads left-to-right only. Best for generation tasks.

**Used in:** ChatGPT, GitHub Copilot, Microsoft Copilot, Codex (agentic coding).

---

## 4.2 The BERT Family (Google)

BERT stands for **Bidirectional Encoder Representations from Transformers**.

| Model | Year | Key Feature |
|-------|------|------------|
| BERT | 2018 | Original, reads both directions |
| RoBERTa | 2019 | Trained longer, removed NSP task, better |
| DistilBERT | 2019 | 40% smaller, 60% faster, 97% quality |
| ALBERT | 2019 | Parameter sharing, even smaller |
| DeBERTa | 2020 | Disentangled attention, very strong |

**Architecture:** Encoder-only Transformer. Reads both directions. Best for understanding tasks.

**Used for:** Search engines (Google Search), classification, NER, Q&A, sentiment analysis.

---

## 4.3 The LLaMA Family (Meta)

Meta released the LLaMA model weights publicly, enabling researchers and developers to run LLMs on their own hardware.

| Model | Year | Sizes | Key Feature |
|-------|------|-------|------------|
| LLaMA 1 | 2023 | 7B-65B | First major open-weight LLM |
| LLaMA 2 | 2023 | 7B-70B | Allowed commercial use |
| LLaMA 3 | 2024 | 8B-405B | Competitive with GPT-4 |
| LLaMA 3.1/3.2/3.3 | 2024 | 1B-405B | 128K context, multimodal variants |
| LLaMA 4 Scout | 2025 | 17B active (16 experts) | 10M token context window, fits on single H100 GPU |
| LLaMA 4 Maverick | 2025 | 17B active (128 experts) | Beats GPT-4o on many benchmarks |
| LLaMA 4 Behemoth | 2025 | 288B active (16 experts) | Most powerful open model, outperforms GPT-4.5 on STEM |

**Why LLaMA matters:** You can run it on your own hardware, use it for free, see the weights, and fine-tune for your specific use case. LLaMA 4 introduced MoE architecture — huge total knowledge with efficient inference.

**Key shift with LLaMA 4:** All LLaMA 4 models use **Mixture of Experts (MoE)** architecture and are **natively multimodal** (text + images from the start, not added later).

**Popular community models built on LLaMA:** Vicuna, Alpaca, Code LLaMA, and many fine-tuned variants.

---

## 4.4 Claude (Anthropic)

Anthropic was founded by former OpenAI employees with a focus on AI safety. Claude is designed to be helpful, harmless, and honest.

| Version | Year | Key Feature |
|---------|------|------------|
| Claude 1 | 2023 | Initial release |
| Claude 2 | 2023 | 100K context window |
| Claude 3 (Haiku/Sonnet/Opus) | 2024 | Three tiers: Haiku (fast/cheap), Sonnet (balanced), Opus (most capable) |
| Claude 3.5 Sonnet | 2024 | Strong coding, fast, very cost-effective |
| Claude 4 (Haiku/Sonnet/Opus) | 2025 | Extended thinking, tool use, computer use |
| Claude Haiku 4.5 | 2025 | Fastest and most cost-efficient, high-volume automation |
| Claude Opus 4.5 | 2025 | Major coding and workplace task improvements |
| Claude Opus 4.8 | 2026 | Current flagship — 1M context, strongest coding and reasoning |
| Claude Sonnet 5 | 2026 | Mid-tier, best price/performance default; near-Opus quality, improved computer use |

**Key differences:**
- **Constitutional AI (CAI):** Claude is trained to evaluate its own responses against a set of written principles (a "constitution"), reducing harmful outputs without relying solely on human feedback
- **Extended thinking:** Claude 4+ models can "think" step-by-step internally before responding, similar to reasoning models
- **1M context window:** The latest Claude models (Opus 4.8, Sonnet 5) support 1 million tokens of context — entire codebases or books
- **Computer use:** Claude can interact with desktop GUIs, clicking buttons and reading screens

---

## 4.5 Gemini (Google DeepMind)

Google's multimodal model designed from the ground up to handle text, images, audio, video, and code.

| Version | Year | Key Feature |
|---------|------|------------|
| Gemini 1.0 (Nano/Pro/Ultra) | 2023 | First generation, three tiers |
| Gemini 1.5 Pro | 2024 | 1M token context window |
| Gemini 1.5 Flash | 2024 | Fast, efficient for high-volume tasks |
| Gemini 2.0 Flash | 2025 | Agentic capabilities, native tool use |
| Gemini 2.5 Pro | 2025 | Strong reasoning with "thinking" mode |
| Gemini 2.5 Flash | 2025 | Best value model for high-volume use |
| Gemini 3 Flash | 2025 | 78% SWE-bench, fast reasoning + coding |
| Gemini 3 Pro Preview | 2026 | State-of-the-art reasoning and multimodal |
| Gemini 3 Deep Think | 2026 | Specialized reasoning, 84.6% on ARC-AGI-2 |
| Gemini 3.5 Pro | 2026 | Current flagship — 1–2M context, state-of-the-art reasoning + multimodal |
| Gemini 3.5 Flash | 2026 | Current mid-tier, best value for high-volume use (Flash-Lite = cheapest) |

**Google's advantage:** Seamless integration with Google Search, Gmail, Docs, YouTube. Gemini models offer some of the longest context windows available (up to 1M tokens).

---

## 4.6 Open-Source LLMs Worth Knowing

| Model | Creator | Year | Key Feature |
|-------|---------|------|------------|
| Mistral Small 3 | Mistral AI | 2025 | 24B params, 256K context, strong coding |
| Mixtral 8x7B / 8x22B | Mistral AI | 2024 | MoE architecture, very efficient |
| DeepSeek R1 | DeepSeek | 2025 | Reasoning model rivaling o1 at fraction of cost |
| DeepSeek V3.2 | DeepSeek | 2025 | Frontier reasoning + agentic workloads |
| Qwen 3 | Alibaba | 2025 | Full model family: vision, coding, embedding, multilingual |
| Phi-3 / Phi-4 | Microsoft | 2024-25 | Small but surprisingly capable |
| Gemma 2 | Google | 2024 | Open-weight, strong for its size |
| Command R+ | Cohere | 2024 | Optimized for RAG |

---

## 4.7 Architecture Comparison — Encoder vs. Decoder vs. Encoder-Decoder

The Transformer paper introduced an encoder-decoder architecture, but modern LLMs have diverged into three families:

```
  ENCODER-ONLY (BERT, RoBERTa, DeBERTa)
  ┌─────────────────────────┐
  │   Bidirectional          │   ← Each token sees ALL other tokens
  │   Transformer Encoder    │
  │                          │   Best for: Understanding tasks
  │   Input → Representation │   (classification, NER, search, Q&A)
  └─────────────────────────┘
  Cannot generate new text. Produces embeddings/representations.

  DECODER-ONLY (GPT, LLaMA, Claude, Mistral)
  ┌─────────────────────────┐
  │   Causal (left-to-right) │   ← Each token only sees PREVIOUS tokens
  │   Transformer Decoder    │
  │                          │   Best for: Generation tasks
  │   Input → Next Token     │   (chatbots, writing, code generation)
  └─────────────────────────┘
  The dominant architecture today. Almost all modern LLMs are decoder-only.

  ENCODER-DECODER (T5, BART, mBART)
  ┌──────────────┐    ┌──────────────┐
  │   Encoder    │ →  │   Decoder    │
  │ (bidirection)│    │ (causal)     │
  │              │    │              │
  │ Input text   │    │ Output text  │
  └──────────────┘    └──────────────┘
  Encoder understands input, decoder generates output.
  Best for: Translation, summarization, seq-to-seq tasks.
```

**Why decoder-only won:**

```
  1. Simpler to scale — one stack instead of two
  2. Pre-training is straightforward (just predict next token)
  3. Few-shot prompting works naturally (examples are just input context)
  4. Same architecture handles both understanding and generation
  5. Scaling laws show decoder-only models are more efficient per parameter
```

---

## 4.8 Mixture of Experts (MoE) — Bigger Models, Same Cost

**The problem:** Bigger models perform better, but are more expensive to run. A 1 trillion parameter model costs ~6x more per query than a 175B model.

**The solution:** Mixture of Experts (MoE). Make the model huge, but only activate a small fraction for each input.

```
  STANDARD MODEL (Dense):
  Every token goes through ALL parameters.
  70B model → 70B parameters activated per token → expensive

  MoE MODEL (Sparse):
  Each layer has N "expert" sub-networks.
  A "router" picks the top-K experts for each token.
  Only those K experts activate.

  Mixtral 8x7B:
  - 8 experts per layer, each with 7B parameters
  - Router picks top-2 experts per token
  - Total parameters: ~47B
  - Active parameters per token: ~13B
  - Performance: comparable to a dense 70B model!
  - Cost: comparable to a 13B model!
```

**How the router works:**

```
  For each token:
  1. Router network computes a score for each expert
  2. Pick top-K experts (usually K=1 or K=2)
  3. Run the token through only those experts
  4. Combine outputs weighted by router scores

  Token "Python" might route to:
    Expert 3 (specializes in programming)  weight: 0.7
    Expert 5 (specializes in technical)    weight: 0.3

  Token "Paris" might route to:
    Expert 1 (specializes in geography)    weight: 0.6
    Expert 7 (specializes in culture)      weight: 0.4
```

**Key MoE models:**

| Model | Experts | Active | Total Params | Performance Like |
|-------|---------|--------|-------------|-----------------|
| Mixtral 8x7B | 8 | 2 | 47B | ~LLaMA-2-70B |
| Mixtral 8x22B | 8 | 2 | 141B | ~GPT-4 class |
| GPT-4 (rumored) | ~16 | 2 | ~1.8T | State of the art (2023) |
| DeepSeek R1 | 256 | 8 | 671B | Rivals o1 at fraction of cost |
| LLaMA 4 Scout | 16 | varies | 109B | 10M context, fits on 1 GPU |
| LLaMA 4 Maverick | 128 | varies | ~400B | Beats GPT-4o on many tasks |
| LLaMA 4 Behemoth | 16 | varies | ~2T | Outperforms GPT-4.5 on STEM |

**Trade-offs:**

```
  Pros:
  + Much cheaper inference (only K experts active)
  + Can scale total knowledge without scaling compute
  + Different experts can specialize in different domains

  Cons:
  − Larger total memory footprint (all experts must be loaded)
  − Router training is tricky (load balancing across experts)
  − Harder to fine-tune (which experts to update?)
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Mixtral 8x7B", "Mixtral 8x22B", "GPT-4 (rumored)", "DeepSeek R1", "LLaMA 4 Behemoth"],
    "datasets": [
      {
        "label": "Total Parameters (B)",
        "data": [47, 141, 1800, 671, 2000],
        "backgroundColor": "rgba(99, 102, 241, 0.5)",
        "borderColor": "rgba(99, 102, 241, 1)", "borderWidth": 1
      },
      {
        "label": "Active Parameters per Token (B)",
        "data": [13, 39, 225, 37, 288],
        "backgroundColor": "rgba(34, 197, 94, 0.8)",
        "borderColor": "rgba(34, 197, 94, 1)", "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "MoE Models — Total vs Active Params (Active = What You Actually Pay For)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Parameters (Billions)" }, "beginAtZero": true },
      "x": {}
    }
  }
}
```

---


# SECTION 15: THE FUTURE OF LLMs

---

## 15.1 Reasoning Models — see Ch 20

> **Covered in [Ch 20 §20.2 — Reasoning Models & Test-Time Compute](#content/20_2026_landscape).**
> Reasoning models are a *state of the field* topic, so they live in the landscape
> chapter rather than being explained twice. What belongs here is the training
> mechanism that produces them — **GRPO and RLVR**, in [§3.5b](#content/17_llm) and
> [§3.5c](#content/17_llm) above — and the question of whether the visible reasoning
> trace is faithful, in §15.1b below.

---

## 15.2 Current Research Directions

**Longer context windows:** Models are pushing toward 1M+ tokens (Gemini 1.5 Pro already supports this). This allows processing entire codebases, books, or research libraries in one prompt.

**Reasoning at scale:** Building on o3/o4-mini, Claude extended thinking, and Gemini Deep Think — making models that spend variable amounts of compute thinking, depending on problem difficulty. o4-mini achieved 99.5% on AIME 2025; Gemini 3 Deep Think scored 84.6% on ARC-AGI-2.

**Multimodality:** Video, audio, 3D shapes — models are learning to handle more types of input and output data natively.

**Efficiency:** Smaller models that match larger ones. Phi-3 (3.8B params) performs comparably to GPT-3.5 (175B) on many benchmarks. Distillation and architecture improvements keep closing the gap.

**Agents:** LLMs that can autonomously complete multi-step tasks, use tools, browse the web, write and run code, and coordinate with other agents. Computer-use agents can interact with GUIs directly.

**Test-time compute scaling:** Instead of making models bigger (more training compute), spend more compute at inference time through search, verification, and self-correction.

---

## 15.3 Limitations That Remain Unsolved

| Challenge | Current Status |
|-----------|---------------|
| Reliable reasoning | Still unreliable on novel problems |
| Long-term memory | Each conversation starts fresh |
| Real-time knowledge | Requires RAG or search tools |
| Causal understanding | Pattern matching, not true causality |
| Physical world grounding | Limited understanding of physics, space |
| Consistent personality | Can be manipulated to act differently |

---

## 15.4 Important Concepts to Know

**Scaling laws:** Covered in detail in Section 3.7. As you increase parameters and training data, performance improves predictably — the foundation for why LLMs keep getting bigger and better.

**Emergent abilities:** Covered in Section 3.7. Capabilities that appear suddenly at scale — chain-of-thought reasoning, few-shot learning, and arithmetic ability each appeared abruptly above certain model sizes.

**Constitutional AI (Anthropic):** Instead of only relying on human ratings, teach the AI to critique its own outputs against a written constitution of values. The AI helps train itself to be safe. Used to train Claude.

**Mechanistic interpretability:** The growing field of understanding WHAT computations happen inside LLMs. Researchers have found specific "circuits" — like a circuit that completes "The Eiffel Tower is in ___" → "Paris." Understanding these circuits could help us build safer, more predictable AI.

**Knowledge distillation:** Training a small "student" model to mimic a large "teacher" model. The student learns from the teacher's output probabilities (which contain richer information than just the correct answer). This is how models like DistilBERT achieve 97% of BERT's quality at 40% the size.

**Synthetic data:** Using LLMs to generate training data for other (often smaller) models. GPT-4 can generate training examples for fine-tuning a 7B model. This has become a common and effective practice, though care must be taken to avoid "model collapse" (degradation from training on AI-generated data recursively).

---

# SECTION 16: KEY PAPERS & HISTORICAL TIMELINE

---

## 16.1 The Papers That Shaped LLMs

Understanding the key papers helps you understand WHY things are the way they are:

### "Attention Is All You Need" (Vaswani et al., 2017)

```
  THE paper that started it all. Introduced the Transformer architecture.

  Before this: RNNs and LSTMs processed text sequentially (slow, hard to parallelize)
  After this:  Self-attention processes all tokens in parallel (fast, scalable)

  Key innovations:
  - Multi-head self-attention (instead of recurrence)
  - Positional encoding (since attention has no notion of order)
  - Encoder-decoder architecture with cross-attention
  - Scaled dot-product attention

  Impact: EVERY modern LLM is built on this architecture.
  Citation count: 100,000+ (one of the most-cited CS papers ever)
```

### "Improving Language Understanding by Generative Pre-Training" (Radford et al., 2018) — GPT-1

```
  Showed that pre-training a Transformer on unlabeled text, then fine-tuning
  on specific tasks, outperforms training from scratch.

  Key idea: unsupervised pre-training + supervised fine-tuning
  Model size: 117M parameters (tiny by today's standards)
  Impact: Established the "pre-train then fine-tune" paradigm
```

### "BERT: Pre-training of Deep Bidirectional Transformers" (Devlin et al., 2018)

```
  Introduced bidirectional pre-training using masked language modeling.

  Instead of predicting the NEXT word (like GPT):
  "The [MASK] sat on the mat" → predict "cat"

  The model sees context from BOTH directions.
  This makes it much better at understanding tasks.

  Key innovations:
  - Masked Language Modeling (MLM)
  - Next Sentence Prediction (NSP) — later shown to not help much
  - Revolutionized NLP benchmarks (GLUE, SQuAD)
```

### "Language Models are Few-Shot Learners" (Brown et al., 2020) — GPT-3

```
  Demonstrated that scaling to 175B parameters unlocks "in-context learning."

  Key discovery: You don't need to fine-tune!
  Just show the model a few examples in the prompt, and it learns the pattern.

  This paper shifted the paradigm from "fine-tune for each task"
  to "prompt the same model for any task."

  Also revealed emergent abilities that appeared at scale.
```

### "Training Language Models to Follow Instructions" (Ouyang et al., 2022) — InstructGPT

```
  The paper behind ChatGPT. Introduced RLHF for language models.

  Key insight: Raw pre-trained models are bad at following instructions.
  RLHF makes them dramatically better.

  Three stages:
  1. Supervised fine-tuning on demonstrations
  2. Reward model trained on human comparisons
  3. PPO optimization against the reward model

  Result: InstructGPT (1.3B) was preferred by humans over GPT-3 (175B)!
  A smaller, aligned model beat a much larger unaligned one.
```

### "LLaMA: Open and Efficient Foundation Language Models" (Touvron et al., 2023)

```
  Meta's open-source LLM that democratized access to large language models.

  Key contribution: Showed that smaller models trained on MORE data
  can match larger models trained on less data.

  LLaMA-13B outperformed GPT-3 (175B) on most benchmarks.
  Why? GPT-3 was trained on 300B tokens; LLaMA on 1.4T tokens.

  Lesson: Data quantity and quality matter as much as model size.
  This launched the open-source LLM revolution.
```

### "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via RL" (DeepSeek, 2025)

```
  The paper that made reasoning models mainstream and reproducible.

  Key contribution: strong reasoning can be learned by RL on VERIFIABLE
  rewards (RLVR) — no human-preference labels — using GRPO, a critic-free
  policy-gradient method (group-relative advantage, no value network).

  R1-Zero showed reasoning can emerge from pure RL (no SFT first); the full
  R1 recipe (SFT → RL) produced an open-weight model rivaling OpenAI's o1
  on math/code, and its distilled small models stayed strong.

  Lesson: for checkable tasks, optimize correctness directly. This is the
  training method behind the 2025-26 reasoning wave (o-series, R1, and more).
```

---

## 16.2 Historical Timeline

```
  2017 │ "Attention Is All You Need" — Transformer invented
       │
  2018 │ GPT-1 (117M) — Pre-training + fine-tuning paradigm
       │ BERT (340M) — Bidirectional pre-training
       │ ELMo — Contextual word embeddings
       │
  2019 │ GPT-2 (1.5B) — "Too dangerous to release" (spoiler: it wasn't)
       │ RoBERTa — BERT done right
       │ T5 — Text-to-text framework
       │ DistilBERT — Model distillation for efficiency
       │
  2020 │ GPT-3 (175B) — Few-shot learning, in-context learning
       │ Scaling laws paper (Kaplan et al.)
       │
  2021 │ Codex — GPT-3 fine-tuned on code → GitHub Copilot
       │ FLAN — Instruction fine-tuning at scale
       │ Chinchilla scaling laws (Hoffmann et al.) — "train longer, not bigger"
       │
  2022 │ ChatGPT / InstructGPT — RLHF makes models conversational
       │ PaLM (540B) — Google's largest dense model
       │ Stable Diffusion — Open-source image generation
       │ Constitutional AI — Anthropic's alignment approach
       │
  2023 │ GPT-4 — Multimodal, major capability jump
       │ LLaMA — Open-source revolution
       │ Claude 2 — 100K context
       │ Mistral 7B — Small but mighty
       │ Mixtral 8x7B — Mixture of Experts goes mainstream
       │
  2024 │ GPT-4o — Omni model (text, vision, audio natively)
       │ Claude 3 family (Haiku/Sonnet/Opus) + Claude 3.5 Sonnet
       │ LLaMA 3 (8B/70B/405B) — Competitive with GPT-4
       │ Gemini 1.5 — 1M token context window
       │ OpenAI o1 — "Thinking" model (reasoning before responding)
       │ DeepSeek-V3 — Efficient open-source MoE model
       │ Open-source models close the gap with proprietary ones
       │
  2025 │ GPT-4.5 — Largest pre-trained model, improved naturalness
       │ OpenAI o3 + o4-mini — Advanced reasoning models, agentic tool use
       │ GPT-5 series begins (5.1 → 5.2 → 5.3-Codex → 5.4)
       │ Claude 4 family — Extended thinking, computer use, tool use
       │ Claude Haiku 4.5, Opus 4.5 — Speed and capability improvements
       │ Gemini 2.5 Pro/Flash — Reasoning with "thinking" mode
       │ Gemini 3 Flash — Fast reasoning + coding (78% SWE-bench)
       │ LLaMA 4 (Scout/Maverick/Behemoth) — MoE, natively multimodal, 10M context
       │ DeepSeek R1 — Open-source reasoning model rivaling o1 at fraction of cost
       │ Qwen 3 — Comprehensive open model family from Alibaba
       │ Mistral Small 3 — 24B param model, strong coding
       │ "DeepSeek moment" — open-source matches proprietary at fraction of cost
       │
  2026 │ Claude Opus 4.8 / Sonnet 5 — 1M context; Opus flagship, Sonnet best price/performance
       │ Gemini 3.5 Pro (current flagship), 3.5 Flash (earlier 3 Deep Think hit 84.6% ARC-AGI-2)
       │ GPT-5.5 → 5.6 — GPT-5.6 (Sol) is the current OpenAI flagship
       │ Open-source models fully competitive with proprietary on many tasks
       │ AI agents and computer-use capabilities mature rapidly
       │ Focus shifts from "bigger models" to "smarter inference"
```

---


# SECTION 17: QUICK REFERENCE

---

## LLM Terminology Cheat Sheet

| Term | Plain English |
|------|--------------|
| Probability | A number (0 to 1) saying how likely something is |
| Conditional probability | How likely A is, GIVEN that B happened — P(A\|B) |
| Probability distribution | List of all possible outcomes and their probabilities (sums to 1) |
| Log-probability | Logarithm of a probability — turns tiny numbers into manageable negatives |
| Cross-entropy loss | Training signal: -log(P(correct answer)). Lower = better predictions |
| Vector | A list of numbers representing a point or direction in space |
| Dot product | Multiply matching elements and sum — measures similarity between vectors |
| Cosine similarity | Dot product normalized by lengths — measures direction similarity (-1 to 1) |
| Bayes' theorem | Update beliefs with evidence: P(A\|B) = P(B\|A)P(A) / P(B) |
| Expected value | The average outcome if you repeated something many times |
| Variance | How spread out values are around the mean |
| Standard deviation | Square root of variance — same unit as the data |
| Normal distribution | The bell curve — most values near the mean, few far away |
| Entropy | Measures uncertainty/surprise in a distribution (higher = more unpredictable) |
| KL divergence | Measures how different two distributions are (used in RLHF/DPO penalty) |
| MLE | Maximum Likelihood Estimation — find parameters that make data most probable |
| Token | A word piece that the model processes (1 token ≈ 0.75 words) |
| Context window | The maximum amount of text the model can "see" at once |
| Embedding | A list of numbers representing the meaning of a word/token |
| Temperature | How random vs. predictable the output is (0=deterministic, 1=random) |
| Hallucination | When the model confidently states something false |
| Prompt | Your input/instruction to the model |
| System prompt | Background instructions that apply to the whole conversation |
| Fine-tuning | Further training on your specific data to customize behavior |
| RAG | Retrieving relevant documents and feeding them to the model |
| Top-P | Only sample from tokens that together account for P% of probability |
| Few-shot | Providing examples of desired input/output in the prompt |
| Chain-of-thought | Asking the model to reason step-by-step before answering |
| RLHF | Training technique using human preference rankings |
| Parameters | The learned "dials" inside the model (more = more capable) |
| Pre-training | Initial training on massive text data |
| SFT | Fine-tuning on (prompt, ideal response) pairs |
| LoRA | Fine-tuning method that updates <1% of parameters via low-rank adapters |
| Inference | Running the model to generate output (as opposed to training) |
| Latency | Time for the model to generate a response |
| Throughput | How many requests/tokens the model can handle per second |
| Scaling laws | Predictable relationship between model size, data, compute, and performance |
| GQA | Grouped-Query Attention — shares K,V across head groups for efficiency |
| Quantization | Reducing model precision (32-bit → 4-bit) to shrink size and speed up inference |
| KV Cache | Caching attention keys/values to avoid recomputing them each token |
| Reasoning model | LLM that "thinks" step-by-step before answering for better accuracy |
| Structured output | Constraining LLM output to valid formats (JSON, SQL, etc.) |
| AI Agent | LLM that takes actions (tool calls, code execution) to accomplish goals |
| Tool calling | LLM's ability to invoke external functions (search, code, APIs) |
| ReAct | Agent pattern: Reason → Act → Observe → Repeat |
| Multi-agent | Multiple specialized agents collaborating on a task |
| Computer use | Agent that interacts with GUIs by seeing screenshots and clicking |
| MCP | Model Context Protocol — standard for connecting LLMs to tools/data |
| Human-in-the-loop | Requiring human approval for risky agent actions |
| Agentic coding | AI that writes, runs, debugs, and fixes code autonomously |

---


---

## Review Questions — Test Your Understanding

1. An LLM "just predicts the next token." How can this simple mechanism produce complex reasoning, code, and creative writing?
2. What is tokenization and why do LLMs use subword tokens instead of whole words?
3. Explain self-attention in one sentence. Why is it O(n squared) and why does this matter for long contexts?
4. What are the three stages of training a chat LLM? What does each stage accomplish?
5. Why do we work with log-probabilities instead of raw probabilities?
6. Compare encoder-only, decoder-only and encoder-decoder architectures. Give one model of each.
7. What does Mixture of Experts buy you, and what is the difference between active and total parameters?
8. What do scaling laws say, and what did Chinchilla change about how we allocate a compute budget?

<details>
<summary>Answers</summary>

1. The model has been trained on essentially all human-written text. By predicting the next token in this vast corpus, it implicitly learns grammar, facts, reasoning patterns, code syntax, and more. The depth comes from the scale of training data and parameters — patterns from trillions of tokens encoded into billions of weights.
2. Tokenization converts text to numbers. Subword tokens (BPE) are used because: (a) they handle rare or new words by breaking them into known pieces, (b) they keep the vocabulary manageable (around 50K–200K entries rather than millions of words), (c) they work across languages and code.
3. Self-attention lets each token look at every other token in the sequence and compute how much to attend to each one. It is O(n squared) because every token attends to every other — for a 100K-token context that is 10 billion pairwise computations, which is why long contexts are expensive and why Flash Attention and sliding-window variants exist.
4. (1) Pre-training: predict next tokens on massive text (learns language and world knowledge). (2) SFT: train on curated (prompt, ideal response) pairs (learns to follow instructions). (3) Preference optimisation — RLHF, DPO or GRPO (learns to be helpful, harmless and honest).
5. Multiplying hundreds of probabilities each well below 1 underflows to zero in floating point. Logs turn those products into sums, which are numerically stable, and they turn the maximum-likelihood objective into the cross-entropy loss that is actually optimised.
6. Encoder-only (BERT) sees the whole sequence bidirectionally and is best for understanding tasks such as classification. Decoder-only (GPT, LLaMA, Claude) is causal and generates text — the dominant design today. Encoder-decoder (T5) encodes an input then decodes an output, which suits translation and summarisation.
7. MoE routes each token through only a few of many expert sub-networks, so total parameters (capacity) grow while active parameters per token (compute cost) stay roughly fixed. You get a larger, more capable model at close to the inference cost of a smaller one — at the price of much higher memory to hold all the experts.
8. Scaling laws say loss falls predictably as a power law in parameters, data and compute. Chinchilla showed earlier models were badly under-trained on data: for a fixed compute budget you should scale data roughly in proportion to parameters, which is why later models are smaller but trained on far more tokens.
</details>

---

## Key Takeaways

```
LLMs: HOW THEY WORK — WHAT TO REMEMBER
═══════════════════════════════════════════════════════════════════

CORE IDEA
  • An LLM is a next-token predictor: it models
    P(next token | context) and samples repeatedly.
  • Emergent reasoning/code/writing come from scale of data and
    parameters, not from any explicit rules.

THE MATHS THAT MATTERS
  • Softmax turns logits into a probability distribution;
    log-probs avoid underflow and define the loss.
  • Cross-entropy / MLE: training minimises surprise on the real
    next token; perplexity = exp(average loss).
  • Dot products measure embedding similarity; KL divergence
    keeps aligned models near their reference.

HOW IT WORKS INSIDE
  • Pipeline: text → tokens (BPE) → embeddings → Transformer
    stack → logits → decode.
  • Self-attention is O(n²) in context length — the main cost
    driver for long contexts.
  • GQA/MQA shrink the KV cache by sharing key/value heads.
  • Decoding: greedy/beam (deterministic) vs temperature,
    top-k, top-p (controlled randomness).

TRAINING STAGES
  • (1) Pre-training: next-token on massive corpora → language
    + world knowledge.
  • (2) SFT: curated (prompt, response) pairs → instruction
    following.
  • (3) RLHF / DPO / GRPO: align to human preference. DPO skips
    the separate reward model and PPO loop; GRPO drops the
    critic and powers reasoning models.
  • Scaling laws: loss falls predictably with params, data and
    compute (Chinchilla: scale data with params).

MODEL FAMILIES
  • GPT = decoder-only generation; BERT = encoder-only
    understanding; T5 = encoder-decoder.
  • LLaMA/Mistral/Gemma drive open-weight; Claude, Gemini, GPT
    lead the closed frontier.
  • MoE: route each token to a few experts → more capacity at
    roughly fixed inference compute.

WHERE TO GO NEXT
  • Building with an LLM → Ch 17b (prompting, RAG, agents,
    fine-tuning, cost, safety).
  • Running one at scale → Ch 17c (batching, KV cache,
    quantization, serving, evaluation).
```

---

**Previous:** [Chapter 16 — Deep Learning](#content/16_deep_learning) | **Next:** [Chapter 17b — LLM Applications](#content/17b_llm_applications)
