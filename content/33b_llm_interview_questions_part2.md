# Chapter 33 (Part 2 of 2) — LLM Interview Questions: Inference, Evaluation, Safety & Frontier

> Continuation of the LLM interview question bank. **[← Part 1](#content/33_llm_interview_questions)**
> covers Q1–Q38 (Fundamentals & Architecture, Training & Fine-Tuning, Prompting & In-Context
> Learning, and RAG / Embeddings / Vector Databases). This part picks up at **Q39**.
>
> Every answer here uses the same layers as Part 1: **Simple Answer** → **Official Definition** → **Interview Answer** (open with "Say this first (30 sec)", then mechanism, numbers and trade-offs) → **Likely follow-ups** → **Trap** → **Go deeper**. Heading stars = interview priority; tag-line stars = difficulty.

---

## Table of Contents (Part 2)

| Part | Topic | Questions |
|------|-------|-----------|
| 5 | Inference, Deployment & Optimization | Q39 – Q47 |
| 6 | Evaluation & Benchmarks | Q48 – Q53 |
| 7 | Safety, Alignment & Ethics | Q54 – Q60 |
| 8 | Frontier Topics | Q61 – Q68 |
| 9 | Advanced Alignment & Production | Q69 – Q72 |

---

# PART 5 — Inference, Deployment & Optimization

---

### Q39. What is quantization and why is it critical for LLM deployment? ★★
*[DEPLOY] | ★★*

![Interview card Q39 Quantization for Deployment: 30-second answer, rounding-prices analogy, formula weight memory = parameters x bits / 8 and INT8 scale = max|w| / 127, bars for a 70B model (FP16 140 GB on 2 x H100, FP8 70 GB on 1 x H100, INT4 35 GB on 1 x H100 with about 39 GiB left for KV cache), rounding errors on 8 weights (INT8 0.65%, INT4 8.83%, INT4 per-4-weight scales 4.40%), a GPTQ/AWQ, FP8, NVFP4, NF4 comparison table, follow-ups and the trap that weight-only INT4 does not speed up prefill.](diagrams/iq33b_info_q39_quantization_ai.png)

**Simple Answer:**

Quantization stores each weight with fewer bits — like rounding prices to the nearest ten cents instead of keeping eight decimal places. The numbers barely change, but a 70B model shrinks from 140 GB in 16-bit to about 35 GB in 4-bit, so it needs fewer GPUs. And because writing every token means reading every weight from memory, fewer bytes also means faster generation.

The price is rounding error: 8-bit is nearly free, 4-bit needs careful rounding (GPTQ, AWQ), and below 4 bits quality falls quickly.

```
  70B model, weights only: memory = parameters × bits ÷ 8   (█ ≈ 10 GB)

  FP16 / BF16  ██████████████  140 GB  → 2 × H100 (80 GB each)
  FP8 / INT8   ███████          70 GB  → 1 × H100, little left for KV cache
  INT4 / FP4   ███▌             35 GB  → 1 × H100 with ~39 GiB for KV cache,
                                         or one 48 GB card (not 24–32 GB)

  WHICH PHASE GETS FASTER?
  weight-only INT4 (GPTQ, AWQ)  fewer bytes read per token  → decode
  FP8 / W8A8 (+ activations)    8-bit matmuls, ~2× FLOP/s   → prefill + decode
```

**Official Definition:**

> **Quantization** maps high-precision numbers (FP16/BF16) to a low-precision format — INT8, INT4, FP8 or FP4 — with a scale per tensor, channel or small group of weights: `q = round(w ÷ scale)`, and `w ≈ q × scale` when it is used. **Weight-only** schemes (GPTQ, AWQ) store the weights in low precision and expand them for a 16-bit matrix multiply; **weight-and-activation** schemes (W8A8, FP8) run the multiply itself in low precision. Post-training quantization (PTQ) calibrates on a small sample of data instead of retraining.

> **Maths in one line:** `weight memory = parameters × bits ÷ 8`, and for symmetric INT8 `scale = max|w| ÷ 127` — halve the bits and you halve the bytes; each weight is off by at most half a scale step, so one outlier that inflates the scale coarsens every weight that shares it.

**Interview Answer:**

**Say this first (30 sec):** Quantization stores weights — and optionally activations — in 8 or 4 bits instead of 16, so a 70B model drops from 140 GB to 70 GB in FP8/INT8, or about 35 GB in INT4. Weight-only INT4 speeds up decode, which is limited by the bytes read per token; FP8 (W8A8) also speeds up prefill, which is limited by matmul speed. The biggest win is often the freed memory: it becomes KV cache, so one GPU serves more users.

| Scheme | Stored / multiplied in | Speeds up | Where it fits |
|---|---|---|---|
| GPTQ, AWQ (INT4 weight-only) | INT4 / BF16 | decode | Memory-bound, small batches. GPTQ corrects rounding with second-order (Hessian) information; AWQ protects the ~1% most salient channels |
| FP8 (W8A8) | FP8 / FP8 | prefill and decode | The usual default on H100/H200: near-lossless, about 2× the BF16 matmul rate |
| NVFP4 / MXFP4 | FP4 / FP4 | both, on Blackwell | B200/B300 only; gpt-oss ships its expert weights in MXFP4 |
| GGUF (llama.cpp) | 2–8-bit blocks / varies by backend | local decode | Laptops, CPUs, Ollama ([Ch 20 §20.7](#content/20_2026_landscape)) |
| NF4 (QLoRA) | 4-bit / BF16 | fine-tuning memory | A 65B model fine-tuned on one 48 GB GPU ([Q17 in Part 1](#content/33_llm_interview_questions)) |

- **Quality:** FP8/INT8 is near-lossless; well-calibrated 4-bit usually costs about 1–3% on standard benchmarks, but long reasoning, maths and long context degrade first.
- **Why groups:** one outlier sets the scale for everything that shares it, so 4-bit formats keep one scale per small group — 128 weights in GPTQ/AWQ, 16 in NVFP4.
- **Why W8A8 is harder:** a few activation channels are far larger than the rest; SmoothQuant moves that range into the weights before rounding ([Ch 17c §3.1](#content/17c_llm_systems)).
- **Concurrency:** INT4 70B on one H100 leaves about 39 GiB for KV cache — fifteen 8K-token requests; FP8 weights on the same GPU leave room for two.

**Worked example:** eight weights rounded to INT8 and INT4 — the integers stored, the error, and why a scale per small group helps — then the 70B memory table.

```python
# Symmetric INT8 / INT4 quantization of 8 weights: the integers stored, the error, and what a 70B model weighs
import numpy as np

w = np.array([0.42, -1.27, 0.05, 0.88, -0.31, 2.54, -0.07, 0.66])   # 2.54 is an outlier

def quantize(x, bits):
    qmax = 2 ** (bits - 1) - 1                     # 127 for INT8, 7 for INT4
    scale = np.abs(x).max() / qmax                 # one scale shared by the whole group
    q = np.clip(np.round(x / scale), -qmax, qmax)  # the small integers you store
    return q.astype(int), scale, q * scale         # ints, scale, de-quantized copy

def rel_err(w_hat):
    return np.linalg.norm(w - w_hat) / np.linalg.norm(w)

for bits in (8, 4):
    q, scale, w_hat = quantize(w, bits)
    assert np.abs(w - w_hat).max() <= scale / 2 + 1e-12     # never off by more than half a step
    print(f"INT{bits}: scale {scale:.4f}  ints {q.tolist()}  error {rel_err(w_hat):.2%}")

halves = np.concatenate([quantize(g, 4)[2] for g in (w[:4], w[4:])])   # one scale per 4 weights
print(f"INT4, one scale per 4 weights: error {rel_err(halves):.2%} - the outlier only coarsens its own group")
assert rel_err(halves) < rel_err(quantize(w, 4)[2])

print("\n70B model, weights only (GB = parameters x bits / 8); GPUs needed for the weights alone:")
for name, bits in [("FP16 / BF16", 16), ("FP8 / INT8", 8), ("INT4", 4),
                   ("INT4 + one FP16 scale per 128", 4 + 16 / 128)]:
    gb = 70e9 * bits / 8 / 1e9
    print(f"  {name:30s}{bits:6.3f} bits{gb:7.1f} GB = {bits / 16:6.1%} of FP16  "
          f"{int(np.ceil(gb / 80))} x 80 GB")
```

**Output:**

```
INT8: scale 0.0200  ints [21, -64, 2, 44, -16, 127, -4, 33]  error 0.65%
INT4: scale 0.3629  ints [1, -4, 0, 2, -1, 7, 0, 2]  error 8.83%
INT4, one scale per 4 weights: error 4.40% - the outlier only coarsens its own group

70B model, weights only (GB = parameters x bits / 8); GPUs needed for the weights alone:
  FP16 / BF16                   16.000 bits  140.0 GB = 100.0% of FP16  2 x 80 GB
  FP8 / INT8                     8.000 bits   70.0 GB =  50.0% of FP16  1 x 80 GB
  INT4                           4.000 bits   35.0 GB =  25.0% of FP16  1 x 80 GB
  INT4 + one FP16 scale per 128  4.125 bits   36.1 GB =  25.8% of FP16  1 x 80 GB
```

With INT4 the outlier 2.54 sets a step of 0.363, so the small weights 0.05 and −0.07 both become 0; giving each group of four its own scale halves the error. The stored scales are why a "35 GB" INT4 model is really about 36 GB, and the 70 GB FP8 model fits one 80 GB GPU with almost nothing left for KV cache.

**Likely follow-ups:**

- *Why doesn't INT4 weight-only speed up prefill?* — The 4-bit weights are expanded to BF16 for the multiply, so the matmul runs at BF16 speed; prefill is compute-bound, so only a low-precision matmul (FP8, W8A8, FP4) helps.
- *How do you check that quantization didn't hurt?* — Run your task evals before and after, including the tail (long context, maths, non-English, strict formats); perplexity alone is too blunt.
- *Can you quantize the KV cache too?* — Yes: an FP8 cache halves it (40 → 20 GiB for one 128K-token Llama-3-70B request); an INT4 cache is riskier for long-context recall ([Ch 17c §3.2](#content/17c_llm_systems)).

**Trap:** "Quantization makes everything faster" — weight-only INT4 speeds up decode but not prefill (the multiply still runs in BF16) and its gain shrinks at large batch sizes; and a 35 GB INT4 70B does not fit a 24–32 GB gaming GPU.

**Go deeper:** [Ch 17c §3.1](#content/17c_llm_systems) · [Ch 17c §3.2](#content/17c_llm_systems) · [Ch 17c §1.1](#content/17c_llm_systems) · [Ch 20 §20.7](#content/20_2026_landscape) · [Ch 17b §9.4](#content/17b_llm_applications) (QLoRA)

---

### Q40. What is Flash Attention? ★★
*[DEPLOY] | ★★★*

![Interview card Q40 FlashAttention: 30-second answer, cook-on-a-tiny-counter analogy, online-softmax formula l_new = l_old x exp(m_old - m_new) + sum of exp(s_j - m_new), side-by-side lanes comparing standard attention (n x n matrix crosses HBM 4 times) with FlashAttention (one tile in SRAM, running max m and sum l, write O rows once, extra memory O(n)), a banner saying same FLOPs O(n^2 d), exact result, 2-4x faster, a FlashAttention 1-4 version table (as of Nov 2026), follow-ups and the trap that it is neither linear nor approximate.](diagrams/iq33b_info_q40_flash_attention_ai.png)

**Simple Answer:**

Attention compares every token with every other token, so for n tokens it builds an n × n table of scores for every head: 16.8 million scores at 4K tokens, 17 billion at 128K. The slow part is not the arithmetic — it is that standard attention writes this table to the GPU's big but slower memory (HBM) and reads it back several times.

FlashAttention works like a cook with a tiny counter next to the stove (the fast on-chip memory, SRAM). Instead of carrying every half-finished tray to the storeroom and back, it cooks one small batch at a time on the counter and only carries the finished dish back. It computes the scores tile by tile, keeps a running maximum and sum so the softmax still comes out exactly right, and never stores the whole table.

```
  HBM  = the GPU's big, slower memory (80 GB on an H100)
  SRAM = tiny on-chip memory next to the math units, ~10× faster per byte

  STANDARD ATTENTION                    FLASHATTENTION
  S = Q·Kᵀ        write n×n to HBM      for each block of query rows:
  P = softmax(S)  read n×n, write n×n     for each block of K, V rows:
  O = P·V         read n×n                  s = q·k_jᵀ   one tile, in SRAM
                                            update running max m, sum l, O
                                          write those O rows to HBM once (÷ l)

  n×n matrix crosses HBM 4 times        only Q, K, V in and O out cross HBM
  extra memory O(n²): one head in FP16  extra memory O(n): m and l per row
  is 32 MiB at 4K, 32 GiB at 128K

  Same FLOPs O(n²·d) · same result (exact) · far fewer HBM bytes → 2–4× faster
```

**Official Definition:**

> **FlashAttention** (Dao et al., 2022) is an IO-aware, **exact** attention algorithm. It splits Q, K and V into blocks that fit in on-chip SRAM, computes each tile of scores there, and merges the tiles with an online softmax (a running max and normaliser per query row), so the n × n score and probability matrices are never written to HBM. Extra memory falls from O(n²) to O(n) while FLOPs stay O(n²·d); the speed-up comes from far fewer HBM reads and writes. The backward pass recomputes tiles instead of storing them.

> **Maths in one line:** `l_new = l_old · e^(m_old − m_new) + Σⱼ e^(sⱼ − m_new)` — keep a running max `m` and running sum `l` for each query row; when a new tile raises the max, shrink what you already have by `e^(m_old − m_new)` (the output accumulator too), and divide by `l` once at the end.

**Interview Answer:**

**Say this first (30 sec):** FlashAttention computes exactly the same attention, but tile by tile in the GPU's small on-chip SRAM with an online softmax, so the n × n score matrix never goes out to HBM. Attention was memory-bound, so cutting HBM traffic is what makes it fast — 2–4× over optimised baselines, about 3× faster GPT-2 training in the first paper — and extra memory drops from O(n²) to O(n). The FLOPs do not change: compute is still quadratic.

- **Why it is memory-bound:** for one 8,192-token layer with 32 heads, standard attention moves about 16 GiB through HBM against 256 MiB if fused — 11.6 ms of memory time for 3.5 ms of maths on an A100 ([Ch 17 §2.4](#content/17_llm)).
- **Where it helps:** training and prefill, where n queries meet n keys. Decode has one query, so its cost is reading the KV cache; *Flash-Decoding* splits that read across the sequence.
- **What it does not change:** FLOPs (still O(n²·d)) and KV-cache size — GQA, MLA and FP8 caches shrink that.
- **In practice you call it:** PyTorch `scaled_dot_product_attention` picks a flash kernel automatically; serving engines ship flash-style kernels; JAX has Pallas kernels for TPUs.

| Version | Year · GPU | What it added | Paper's headline number |
|---|---|---|---|
| FlashAttention | 2022 · A100 | Tiling, online softmax, recompute in the backward pass | 3× faster GPT-2 training at 1K tokens |
| FlashAttention-2 | 2023 · A100 | Fewer non-matmul FLOPs, parallel over the sequence, better warp split | ~2× over v1; 50–73% of A100 peak |
| FlashAttention-3 | 2024 · H100 | Asynchrony (warp specialisation), matmul–softmax overlap, FP8 | 1.5–2.0× over v2; 740 TFLOP/s FP16 (75%); FP8 near 1.2 PFLOP/s |
| FlashAttention-4 | 2026 · B200/GB200 | Async matmul pipelines, software exponentials, conditional rescaling | Up to 1,613 TFLOP/s BF16 (71%); 1.3× cuDNN 9.13 |

**Likely follow-ups:**

- *Is it approximate, like sparse or linear attention?* — No. It is the same function computed in a different order; only floating-point rounding differs. Sparse and linear attention change the maths.
- *Does it make long context cheap?* — It removes the O(n²) memory, not the O(n²·d) compute: at d_model = 4,096, attention is 14% of a layer's FLOPs at 4K tokens but 84% at 128K ([Ch 17 §2.4](#content/17_llm)).
- *How is it related to the KV cache and PagedAttention?* — The KV cache is *what* is kept, PagedAttention is *where* it lives (blocks, [Q43](#content/33b_llm_interview_questions_part2)), FlashAttention is *how* attention reads it without an n × n matrix. They stack.

**Trap:** "FlashAttention makes attention linear" or "it is an approximation" — memory becomes O(n) but compute stays O(n²·d), and the result is exact; the speed comes from moving fewer bytes, not doing fewer FLOPs.

**Go deeper:** [Ch 17 §2.4](#content/17_llm) (FlashAttention, with a runnable online-softmax version) · [Ch 29 §24.5](#content/29_gpus_tpus_infrastructure) · [Q3 in Part 1](#content/33_llm_interview_questions) (attention cost) · [Q11 in Part 1](#content/33_llm_interview_questions) (context window)

---

### Q41. What is speculative decoding? ★★
*[DEPLOY] | ★★★*

![Interview card Q41 Speculative Decoding: 30-second answer, intern-and-editor analogy, formulas E tokens per pass = (1 - alpha^(k+1)) / (1 - alpha) and speed-up = E / (1 + k x c), a four-step Draft, Verify, Accept, Fix strip for prompt The with k = 4 (cat, sat, on accepted, the rejected and replaced by a) giving 4 new tokens from 1 target pass, a table of tokens per pass and speed-ups for acceptance 0.9, 0.8, 0.5 and 0.3, follow-ups and the trap that it does not trade quality for speed.](diagrams/iq33b_info_q41_speculative_decoding_ai.png)

**Simple Answer:**

A big LLM writes one token per forward pass, and each pass spends most of its time reading the model's weights from memory, not calculating. Speculative decoding lets a small, fast "drafter" guess the next few tokens, then the big model checks all the guesses in one pass. It keeps the guesses up to the first wrong one, plus its own token at that point.

It is like an intern drafting the next few words and a senior editor approving them at a glance: the editor's time per glance is the same whether it approves one word or four. Because every kept token is one the big model agrees with, the output is exactly what the big model would have written.

```
  Prompt so far: "The".  Target = the big model; drafter = a small, fast one.

  PLAIN DECODING:  target pass 1 → cat,  pass 2 → sat,  pass 3 → on, ...
                   1 token per pass, and every pass reads all the weights

  SPECULATIVE DECODING, one round with k = 4 drafts:
  1. Draft   drafter guesses 4 tokens    cat   sat   on    the
  2. Verify  target scores all 4 in ONE pass
  3. Accept  keep left to right          ✓     ✓     ✓     ✗
  4. Fix     target's own token replaces                   a

  → "The cat sat on a": 4 new tokens from 1 target pass, not 4 passes
    (all 4 accepted → the same pass also adds a 5th, bonus token)

  E[tokens per target pass] = (1 − α^(k+1)) / (1 − α)  →  α = 0.8, k = 4: 3.36
```

**Official Definition:**

> **Speculative decoding** (Leviathan et al., ICML 2023; Chen et al., 2023) speeds up autoregressive generation with a cheap draft model that proposes k tokens, which the target model scores in a single forward pass. Each draft token x is accepted with probability min(1, p(x) ÷ q(x)), where p and q are the target's and drafter's probabilities; at the first rejection a replacement is sampled from the renormalised residual max(p − q, 0). This rule makes the output distribution exactly the target's, so it is a lossless latency optimisation.

> **Maths in one line:** `E[tokens per target pass] = (1 − α^(k+1)) / (1 − α)` and `speed-up ≈ E ÷ (1 + k·c)` — α is the chance each draft token is accepted, k the draft length (the paper's γ), c the cost of one draft step relative to one target step.

**Interview Answer:**

**Say this first (30 sec):** A cheap drafter guesses the next k tokens and the big model verifies all of them in one forward pass; you keep the longest accepted prefix plus one token from the target. Decode is memory-bandwidth-bound, so verifying k tokens costs about the same as generating one — with 80% acceptance and k = 4 you get 3.36 tokens per pass, roughly 2–3× faster in practice. It is lossless: the accept-or-resample rule reproduces the target's distribution exactly.

- **When it pays:** low-to-medium batch sizes, where the GPU has spare compute, and predictable text (code, JSON, summaries). At high batch the spare compute is gone and the gain shrinks.
- **Acceptance beats drafter speed:** α = 0.5 with a costly drafter (c = 0.2) gives only 1.08×; α = 0.3 gives 0.79×, slower than plain decoding ([Ch 17c §2.5](#content/17c_llm_systems)).
- **2026 practice:** vLLM's documentation lists EAGLE, MTP, separate draft models, PARD, n-gram and suffix decoding as of Nov 2026; SGLang and TensorRT-LLM support it too.

| Draft source | How it drafts | Reported result |
|---|---|---|
| Separate small model | Same family and tokenizer, 10–20× smaller | 2–3× on T5-XXL, identical outputs (Leviathan et al.) |
| Medusa | Extra heads guess positions +1, +2, …; verified as a tree | Medusa-1 (frozen model) over 2.2×, lossless; Medusa-2 2.3–3.6× but fine-tunes the model |
| EAGLE-3 | Small head reading the target's own hidden states from several layers | Up to 6.5× (paper); 1.38× throughput at batch 64 in SGLang |
| MTP heads | Trained with the model to predict a further token (DeepSeek-V3) | 85–90% acceptance of the 2nd token; about 1.8× tokens/s |
| n-gram / suffix lookup | Copy spans already in the prompt or output | No extra model; strong for code edits and RAG |

**Worked example:** how the speed-up changes with the draft length k — longer drafts pay only while acceptance stays high.

```python
# Speculative decoding - how the draft length k trades extra accepted tokens against drafting cost
import numpy as np

def tokens_per_pass(alpha, k):                 # 1 + alpha + ... + alpha^k: accepted run + the target's own token
    return (1 - alpha ** (k + 1)) / (1 - alpha)

def speedup(alpha, k, c):                      # c = cost of one draft step relative to one target step
    return tokens_per_pass(alpha, k) / (1 + k * c)

assert abs(tokens_per_pass(0.8, 4) - sum(0.8 ** i for i in range(5))) < 1e-12
shown, ks = (1, 2, 4, 6, 8), np.arange(1, 21)
print("speed-up vs draft length k, cheap drafter (c = 0.05)")
print("alpha" + "".join(f"{'k=' + str(k):>7s}" for k in shown) + "   best k (1-20)")
for alpha in (0.9, 0.8, 0.6, 0.3):
    s = speedup(alpha, ks, 0.05)
    print(f"{alpha:5.1f}" + "".join(f"{s[k - 1]:7.2f}" for k in shown)
          + f"   k={ks[s.argmax()]:<2d} {s.max():.2f}x")

print(f"\nalpha 0.8, k 4: {tokens_per_pass(0.8, 4):.2f} tokens per target pass -> {speedup(0.8, 4, 0.05):.2f}x "
      f"(cheap drafter), {speedup(0.8, 4, 0.2):.2f}x (costly drafter, c = 0.2)")
print(f"alpha 0.3, k 4, c = 0.2: {speedup(0.3, 4, 0.2):.2f}x - slower than plain decoding")
assert speedup(0.3, 4, 0.2) < 1 < speedup(0.8, 4, 0.2)
```

**Output:**

```
speed-up vs draft length k, cheap drafter (c = 0.05)
alpha    k=1    k=2    k=4    k=6    k=8   best k (1-20)
  0.9   1.81   2.46   3.41   4.01   4.38   k=13 4.67x
  0.8   1.71   2.22   2.80   3.04   3.09   k=8  3.09x
  0.6   1.52   1.78   1.92   1.87   1.77   k=4  1.92x
  0.3   1.24   1.26   1.19   1.10   1.02   k=2  1.26x

alpha 0.8, k 4: 3.36 tokens per target pass -> 2.80x (cheap drafter), 1.87x (costly drafter, c = 0.2)
alpha 0.3, k 4, c = 0.2: 0.79x - slower than plain decoding
```

With a well-matched drafter a long draft keeps paying; with a poor one the best k is 2–4 and the gain is small. The model ignores the cost of verifying extra positions and of scheduling, so measured optima are lower — tune k on your own traffic. The losslessness proof by simulation is in [Ch 17c §2.5](#content/17c_llm_systems).

**Likely follow-ups:**

- *Why is it lossless?* — Accepting with min(1, p ÷ q) and resampling rejects from max(p − q, 0) makes each token's total probability exactly p(x). With greedy decoding it reduces to "keep the draft if it equals the target's top token".
- *Why does it help less under heavy load?* — Batching already shares each weight read across many requests, so the k extra positions now cost real compute; EAGLE-3's gain falls to 1.38× at batch 64.
- *Does the drafter work in parallel?* — A separate draft model (and EAGLE) still writes its k guesses one at a time, which is why it must be cheap; only the target's verification is fully parallel. Medusa heads and PARD guess several positions in one pass.

**Trap:** "Speculative decoding trades quality for speed" — with the standard accept-or-resample rule the output distribution is exactly the target's; only opt-in relaxed acceptance rules (such as Medusa's "typical acceptance") or retraining the target (Medusa-2) change it; the drafter's quality changes the speed, never the output.

**Go deeper:** [Ch 17c §2.5](#content/17c_llm_systems) · [Ch 17c §1.1](#content/17c_llm_systems) (why decode is bandwidth-bound) · [Ch 29 §24.9](#content/29_gpus_tpus_infrastructure) · [Q44](#content/33b_llm_interview_questions_part2) (reducing latency)

---

### Q42. What is continuous batching and why does it matter for LLM serving? ★★
*[DEPLOY] | ★★*

![Interview card Q42 Continuous Batching: 30-second answer, restaurant analogy, formula slot utilisation = useful tokens / (decode steps x slots), two cell-grid Gantt charts for 3 slots and 6 requests (R1 20, R2 100, R3 50, R4 40, R5 60, R6 50 tokens; 1 cell = 10 decode steps) where static batching finishes at step 160 with 67% useful work and continuous batching at step 110 with 97% useful, 1.45x faster, the evict-admit-decode loop, a simulation table (1.00x, 1.59x, 2.53x, 4.30x), follow-ups and the trap that it does not give 100% GPU utilisation.](diagrams/iq33b_info_q42_continuous_batching_ai.png)

**Simple Answer:**

Imagine a restaurant that seats tables in groups and will not seat anyone new until every table in the group has finished eating. A couple done in 20 minutes keeps its table empty while a family eats for 100 — and the queue outside waits too. That is static batching: LLM answers vary from a few tokens to thousands, so most slots sit idle waiting for the longest one.

Continuous batching seats the next party the moment any table is free. The scheduler re-forms the batch after every single token step, so slots stay full and new requests start almost at once.

```
  3 slots; output lengths R1 20, R2 100, R3 50, R4 40, R5 60, R6 50 tokens
  1 character = 10 decode steps; digit = request; · = slot held but idle

  STATIC: a batch keeps its slots until its LONGEST request ends
  slot 1  11········4444··
  slot 2  2222222222555555
  slot 3  33333·····66666·
          R4–R6 wait in the queue until step 100
          all 6 done at step 160 · 67% of slot-steps do useful work

  CONTINUOUS: after every step, finished requests leave and queued ones join
  slot 1  11444466666
  slot 2  2222222222·
  slot 3  33333555555
          R4 starts at step 21 instead of 101
          all 6 done at step 110 · 97% useful · 1.45× faster
```

**Official Definition:**

> **Continuous batching** — *iteration-level scheduling*, introduced by Orca (Yu et al., OSDI 2022) and called *in-flight batching* in TensorRT-LLM — makes scheduling decisions after every decode step instead of once per batch. A sequence that emits its stop token or hits its length limit leaves at once, freeing its slot and KV-cache memory, and a waiting request joins on the next step. Static (request-level) batching instead holds the whole batch until its longest sequence finishes.

> **Maths in one line:** `slot utilisation = useful tokens ÷ (decode steps × slots)` — static batching pays for the *longest* request in every batch, so its step count is the sum of the batch maxima; continuous batching needs only about `total tokens ÷ slots` steps.

**Interview Answer:**

**Say this first (30 sec):** Continuous batching schedules at the token level: after every decode step, finished requests leave and queued requests take their slots, instead of the whole batch waiting for its longest member. Decode is memory-bound, so one weight read serves every sequence in the batch and keeping slots full is almost free throughput — Anyscale measured about 8× over static batching on its own and up to 23× together with vLLM's paged memory; Orca reported 36.9× over FasterTransformer.

- **The loop, every step:** (1) evict finished sequences and free their KV blocks; (2) admit queued requests if enough KV blocks are free, not just a slot; (3) run one decode step for every running sequence.
- **The gain depends on how much output lengths differ:** identical lengths gain nothing; long-tailed chat traffic gains most (table, from Ch 17c's simulation).
- **It needs paged KV memory:** constant admit and evict would fragment a contiguous cache, which is why vLLM pairs it with PagedAttention ([Q43](#content/33b_llm_interview_questions_part2)).
- **New prompts are prefilled while others decode:** *chunked prefill* slices a long prompt across steps so it cannot freeze every stream ([Ch 17c §2.3](#content/17c_llm_systems)).
- **2026 practice:** on by default in vLLM, SGLang and TensorRT-LLM; Hugging Face TGI also used it but was archived in March 2026 ([Ch 19 §19.11](#content/19_ai_frameworks)).

| Workload (64 requests unless noted) | Static steps | Continuous steps | Speed-up |
|---|---|---|---|
| 8 slots, every output 100 tokens | 800 | 800 | 1.00× |
| 8 slots, lengths uniform 5–399 | 2,837 | 1,786 | 1.59× |
| 8 slots, long-tailed lengths | 2,441 | 966 | 2.53× |
| 32 slots, 400 long-tailed requests | 5,996 | 1,393 | 4.30× |

**Likely follow-ups:**

- *Doesn't a bigger batch slow everyone down?* — A little. Each step still reads all the weights once, so in Ch 17c's 70B example going from 1 to 96 sequences raises total throughput from 95 to 4,785 tokens/s while each user's speed falls only from 95 to 50 tokens/s.
- *What goes wrong without admission control?* — A burst of long prompts can starve short requests or force KV-cache preemption. Cap the batch from your P99 TPOT target, add per-tenant limits, and use chunked prefill.
- *Is it the same as "dynamic batching"?* — No. Classic dynamic batching (e.g. in Triton) groups requests that arrive within a short time window and runs them as one fixed batch; continuous batching re-forms the batch at every token step.

**Trap:** "Continuous batching gives 100% GPU utilisation" — it keeps batch *slots* full, but decode stays memory-bandwidth-bound; and it was Orca (2022) that introduced iteration-level scheduling, while vLLM (2023) added paged KV memory.

**Go deeper:** [Ch 17c §2.1](#content/17c_llm_systems) (with a runnable static-vs-continuous simulation) · [Ch 17c §1.1](#content/17c_llm_systems) · [Ch 17c §2.3](#content/17c_llm_systems) · [Ch 19 §19.11](#content/19_ai_frameworks) · [Q46](#content/33b_llm_interview_questions_part2) (TTFT vs throughput)

---

### Q43. What is vLLM and PagedAttention? ★★
*[DEPLOY] | ★★★*

![Interview card Q43 vLLM and PagedAttention: 30-second answer (fixed 16-token KV blocks, per-request block table, waste falls from 60-80% to under 4%), virtual-memory analogy, formula blocks = ceil(tokens / 16), a contiguous lane where three requests of 200, 1,000 and 100 tokens use 1,300 of 6,144 reserved slots (21%) beside a paged lane where block tables point into a shared pool and use 1,300 of 1,328 slots (97.9%), a key-numbers table (32 vs 219 requests fit in 40 GiB, 1,380 vs 255 blocks for a shared 2,000-token prompt), follow-ups and the trap that PagedAttention is memory management, not faster attention.](diagrams/iq33b_info_q43_vllm_paged_attention_ai.png)

**Simple Answer:**

Every request needs KV-cache memory (what the KV cache is: [Q7 in Part 1](#content/33_llm_interview_questions)) that grows by one token at a time, and nobody knows in advance how long the answer will be. Older servers reserved one contiguous slab per request, sized for the maximum length — like a restaurant holding a 12-seat table for every couple, just in case. The vLLM team measured that 60–80% of KV memory was wasted this way.

PagedAttention borrows the operating system's trick for RAM: cut the cache into small fixed blocks of 16 tokens, hand them out one at a time from a shared pool, and keep a per-request **block table** that says where each block lives. vLLM is the open-source serving engine built around it.

```
  CONTIGUOUS: every request reserves max_len = 2,048 token slots up front
  R1 (200 tokens)    │██░░░░░░░░░░░░░░░░░░│  10% used
  R2 (1,000 tokens)  │██████████░░░░░░░░░░│  49% used
  R3 (100 tokens)    │█░░░░░░░░░░░░░░░░░░░│   5% used
  → 1,300 of 6,144 reserved slots hold tokens (21%); the rest is locked away

  PAGED: 16-token blocks from one shared pool, found through a block table
  physical blocks:  [B0][B1][B2][B3][B4][B5][B6][B7][B8] ...  (from a free list)
  R1 block table → B0, B3, B7, ...  13 blocks =   208 slots,  8 empty
  R2 block table → B1, B4, B5, ...  63 blocks = 1,008 slots,  8 empty
  R3 block table → B2, B6, ...       7 blocks =   112 slots, 12 empty
  → 1,300 of 1,328 allocated slots hold tokens (97.9%); 4,816 slots stay free
```

**Official Definition:**

> **PagedAttention** (Kwon et al., SOSP 2023) stores each sequence's KV cache in fixed-size blocks — typically 16 tokens in vLLM — that need not be contiguous. A per-sequence block table maps logical blocks to physical ones, blocks are allocated on demand from a shared pool, and the attention kernel gathers keys and values through the table. Waste is limited to the last, partly filled block, and blocks can be shared between sequences using reference counts and copy-on-write. **vLLM** is the serving engine built on it, combining paged KV memory with continuous batching.

> **Maths in one line:** `blocks = ⌈tokens ÷ 16⌉` — a sequence wastes at most 15 token slots, all in its last block, instead of `max_len − tokens`: a 1,000-token conversation wastes 8 slots (0.8%) paged, against 3,096 (76%) in a 4,096-token reservation.

**Interview Answer:**

**Say this first (30 sec):** PagedAttention manages the KV cache like operating-system virtual memory: fixed 16-token blocks allocated on demand and located through a per-request block table, instead of reserving the maximum length up front. The vLLM paper found earlier systems used only 20–38% of their KV memory for real tokens; paging keeps waste under 4%, so many more requests fit in a batch — about 2–4× the throughput of FasterTransformer and Orca at the same latency.

- **Two wastes removed:** *internal* (reserved but unused slots past the real length) and *external* (free memory split into gaps too small for a new slab).
- **Sharing:** parallel samples, beam-search branches and shared system prompts point at the same physical blocks, copied only when they diverge; vLLM reports up to 55% less memory for such sampling. Cross-request prefix caching reuses full blocks the same way ([Ch 17c §2.4](#content/17c_llm_systems)).
- **When blocks run out:** the scheduler preempts a sequence, frees its blocks and recomputes them later (vLLM's V1 default); frequent preemption means the batch is too big.
- **The cost:** every KV lookup goes through the block table (a custom kernel), and block size is a trade-off — smaller blocks waste less but add table overhead; 16 is vLLM's usual default.
- **vLLM in 2026:** V1 engine since v0.8 (2025), OpenAI-compatible server, NVIDIA, AMD, Intel and TPU support. Peers: SGLang (RadixAttention, heavy prefix reuse) and TensorRT-LLM (peak NVIDIA performance); TGI was archived in March 2026.

**Worked example:** the picture's three requests, then 1,000 long-tailed requests in 40 GiB of Llama-3-70B KV memory, then ten requests sharing one system prompt.

```python
# KV memory: reserve max_len per request vs hand out 16-token blocks on demand (PagedAttention)
import numpy as np

BLOCK = 16

def paged_slots(tokens):                       # whole blocks only: ceil(tokens / 16) * 16 token slots
    return -(-np.asarray(tokens) // BLOCK) * BLOCK

# 1) The three requests in the picture, each reserving max_len = 2,048 slots
lengths = np.array([200, 1000, 100])
contig, paged = 2048 * len(lengths), int(paged_slots(lengths).sum())
print(f"picture   : contiguous uses {lengths.sum() / contig:.1%} of {contig:,} reserved slots; "
      f"paged uses {lengths.sum() / paged:.1%} of {paged:,} ({paged // BLOCK} blocks)")
assert paged == 1328 and round(lengths.sum() / contig, 3) == 0.212

# 2) 1,000 long-tailed requests (prompt + answer), max_len = 4,096, 40 GiB of KV memory
rng = np.random.default_rng(0)
reqs = np.clip(np.ceil(rng.lognormal(6.0, 0.9, 1000)), 1, 4096).astype(int)
budget = 40 * 2**30 // 327_680                 # Llama-3-70B, FP16: 320 KiB per token -> 131,072 slots
fit_contig = budget // 4096
fit_paged = int(np.searchsorted(np.cumsum(paged_slots(reqs)), budget, side="right"))
print(f"\n1,000 requests, median {int(np.median(reqs))} tokens; KV budget {budget:,} token slots")
for name, used, fit in [("contiguous", reqs.sum() / (4096 * len(reqs)), fit_contig),
                        ("paged", reqs.sum() / paged_slots(reqs).sum(), fit_paged)]:
    print(f"{name:10s}: {used:.1%} of the slots it holds are used -> {fit} requests fit")
assert fit_paged > 4 * fit_contig

# 3) 10 requests share a 2,000-token system prompt (125 full blocks), then write 200 tokens each
own = int(paged_slots(200)) // BLOCK           # 13 blocks per request
print(f"\nshared prompt: {10 * (125 + own):,} blocks if every request copies it, "
      f"{125 + 10 * own} if they share its blocks")
```

**Output:**

```
picture   : contiguous uses 21.2% of 6,144 reserved slots; paged uses 97.9% of 1,328 (83 blocks)

1,000 requests, median 377 tokens; KV budget 131,072 token slots
contiguous: 13.8% of the slots it holds are used -> 32 requests fit
paged     : 98.7% of the slots it holds are used -> 219 requests fit

shared prompt: 1,380 blocks if every request copies it, 255 if they share its blocks
```

Paging fits about 7× more requests than max-length reservation here, yet the paper reports 2–4× throughput. Its strongest baseline, Orca (Oracle), already reserved exactly each answer's true length — vLLM batched 2.2× more requests than it on OPT-13B, and 4.3× more than max-length Orca (Max) — and once enough requests fit, compute becomes the limit.

**Likely follow-ups:**

- *How is this different from the KV cache and FlashAttention?* — The KV cache is *what* is stored; PagedAttention decides *where* it lives; FlashAttention is *how* attention reads it without an n × n matrix ([Q40](#content/33b_llm_interview_questions_part2)). Engines use all three.
- *Why not 1-token blocks?* — Table size and kernel indirection grow, and GPUs read memory efficiently in larger chunks; 16 tokens is the usual compromise.
- *vLLM or SGLang?* — vLLM is the broad default; SGLang's RadixAttention keeps cached prefixes in a radix tree for automatic reuse, which suits agents and multi-turn chat with long shared prefixes. Benchmark both on your traffic.

**Trap:** "PagedAttention makes attention faster" — it is memory management; the block-table lookup is, if anything, slightly slower. The throughput gain comes from fitting far more sequences in a batch; and continuous batching came from Orca, not vLLM.

**Go deeper:** [Ch 17c §2.2](#content/17c_llm_systems) · [Ch 17c §2.4](#content/17c_llm_systems) · [Ch 19 §19.11](#content/19_ai_frameworks) · [Q7 in Part 1](#content/33_llm_interview_questions) (the KV cache) · [Q42](#content/33b_llm_interview_questions_part2) (continuous batching)

---

### Q44. How do you reduce the latency of LLM responses? ★★
*[DEPLOY] | ★★*

![Interview card Q44 Cutting LLM Latency: 30-second answer (ask which latency is slow, total = TTFT + TPOT x (N - 1), stream and shorten output then speed decode and prefill), a supermarket-checkout analogy, a to-scale timeline of one 500-token reply with TTFT 0.5 s then TPOT x 499 = 9.98 s for a total of 10.48 s (95% decode), lever chips for cutting TTFT, cutting TPOT and cutting N or hiding the wait, a key-numbers table (prefix caching 350 to 66 ms, INT4 70B 48 to 96 tok/s, speculative decoding 2-3x lossless, 500 to 200 tokens saves 6 s), follow-ups and the trap that quantization or more FLOPs is not a universal fix.](diagrams/iq33b_info_q44_reduce_latency_ai.png)

**Simple Answer:**

Nobody wants to wait 10 seconds for a chatbot. A reply has two waits: the pause before the first word appears (the model reading your prompt) and the typing speed after that (the model writing one token at a time). For most chat answers the typing is the bigger wait.

It is like a slow supermarket checkout: you can open more lanes, scan faster or buy fewer items — but first find out which part is slow. Each speed-up trick helps one part of the wait, and streaming hides most of it, because people start reading at the first word.

```
  One reply of N = 500 tokens (illustrative: TTFT 0.5 s, TPOT 20 ms = 50 tokens/s)

   arrive                    first token                                 last token
     |<------- TTFT 0.5 s ------->|<- TPOT x (N - 1) = 0.02 x 499 = 9.98 s -->|
            queue + prefill                decode: one token at a time

     total = 0.5 + 9.98 = 10.48 s   ->   95% of the wait is decode

  CUT TTFT (queue, prefill)    CUT TPOT (decode)            CUT N, OR HIDE THE WAIT
  ───────────────────────────  ───────────────────────────  ───────────────────────────
  shorter prompt               weight quantization          fewer output tokens
  prefix caching               smaller / distilled model    lower reasoning effort
  FP8 W8A8 (faster maths)      speculative decoding         stream the tokens
  continuous batching (queue)  tensor parallel (more GB/s)  semantic cache (skip model)
  keep replicas warm           chunked prefill (P99 gaps)   parallel tool calls
                                                            route easy asks to small model
```

**Official Definition:**

> The end-to-end latency of an LLM request is the **time to first token (TTFT)** — queueing plus the prefill of the whole prompt, which is compute-bound — plus the **time per output token (TPOT)** for every later token, set by decode, which is memory-bandwidth-bound. Each optimization shrinks one term: prefill work, per-token decode time, or the number of output tokens N. Streaming leaves these numbers unchanged but makes the *perceived* wait roughly TTFT.

> **Maths in one line:** `latency = TTFT + TPOT × (N − 1)` — make the prompt cheaper, each token faster, or the answer shorter; with streaming the user mostly feels TTFT.

**Interview Answer:**

**Say this first (30 sec):** First I'd ask which latency is slow — time to first token, the per-token speed or the whole answer — because they have different bottlenecks. Total = TTFT + TPOT × (N − 1): a 500-token answer at 0.5 s TTFT and 20 ms per token takes about 10.5 s, 95% of it decode. So I'd stream and shorten the output first, then speed up decode (quantize, speculate, smaller model) and prefill (prefix caching, shorter prompts), tracking P50 and P99 of each.

| Lever | Cuts | Typical gain (numbers from Ch 17c) |
|---|---|---|
| Prefix caching, stable prompt part first | TTFT (and input cost) | Agent prompt of 3,500 tokens at 95% hits: prefill 350 → 66 ms |
| Weight quantization or a smaller model | TPOT (a smaller model also cuts TTFT) | 70B: FP16 on 2 H100s ≈ 48 tok/s → INT4 on 1 ≈ 96 tok/s; an 8B model reads ~9× fewer bytes per token |
| Speculative decoding | TPOT | About 2–3× per stream at low batch; output unchanged (lossless) |
| Fewer output tokens, lower reasoning effort | N | 500 → 200 tokens at 20 ms saves 6 s; every hidden thinking token is a decode step |
| Streaming, semantic cache, parallel tool calls | Perceived and end-to-end | Felt wait ≈ TTFT; a semantic-cache hit skips the model (but can serve a wrong answer); three independent 1 s tools take 1 s, not 3 |

- **Batching is a trade, not a speed-up:** continuous batching cuts queueing and multiplies throughput (Anyscale: ~8×, up to 23× with vLLM), but each user's speed falls — batch 1 → 96 on a 70B: 95 → 50 tok/s per user.
- **Protect the tail:** one 100K-token prompt prefilled in a single block freezes every other user's stream for about 27 s on two H100s; chunked prefill (on by default in vLLM V1) slices it between decode steps.
- **Measure before tuning:** TTFT, TPOT and the worst inter-token gap at P50 and P99, per route — see [Q46](#content/33b_llm_interview_questions_part2).

**Likely follow-ups:**

- *Which levers need no new hardware?* — Streaming, a shorter answer (max tokens, "reply in 3 bullets"), a stable prompt prefix for caching, and lower reasoning effort — configuration changes that often save seconds.
- *P99 TTFT tripled but the mean is flat — why?* — Queueing: long prefills or a full KV cache stop new requests from being admitted. Fix with chunked prefill, admission control or more replicas.
- *Will a faster GPU help?* — For decode, only one with more memory bandwidth: the H200 has the H100's FLOPs but 4.8 instead of 3.35 TB/s, so it decodes about 1.4× faster.

**Trap:** Answering "quantize it" or "buy more FLOPs" for every latency problem — weight-only INT4 speeds up decode but not prefill (it still multiplies in BF16), and extra FLOPs do nothing for bandwidth-bound decode; name the slow metric first, then the lever that hits it.

**Go deeper:** [Ch 17c §1.1](#content/17c_llm_systems) · [Ch 17c §1.3](#content/17c_llm_systems) · [Ch 17c §2.3–2.5](#content/17c_llm_systems) · [Ch 17c §3.1](#content/17c_llm_systems) · [Ch 19 §19.14](#content/19_ai_frameworks) · [Q41–Q43](#content/33b_llm_interview_questions_part2)

---

### Q45. What is model parallelism and when do you need it? ★★
*[DEPLOY] | ★★*

![Interview card Q45 Model Parallelism: 30-second answer (split one model across GPUs when it will not fit, tensor parallel inside a node and pipeline across nodes, replicas add throughput and ZeRO / FSDP shard training), a piano-moving analogy, formula GPUs >= (params x bytes + KV cache) / memory per GPU with 70B x 2 bytes = 140 GB > 80 GB on one H100, three panels for tensor parallel (heads 1-32 and 33-64 joined by an all-reduce), pipeline parallel (layers 1-40 then 41-80) and data-parallel replicas, a compare table of tensor, pipeline, expert and data + FSDP splits, follow-ups (NVLink 900 vs InfiniBand 50 GB/s, more micro-batches cut the bubble from 27% to 9%) and the trap that pipeline parallelism makes a model fit but not faster.](diagrams/iq33b_info_q45_model_parallelism_ai.png)

**Simple Answer:**

A 70B-parameter model in FP16 is 140 GB of weights alone. A data-centre H100 has 80 GB of memory, and NVIDIA's top consumer card, the RTX 5090, has 32 GB. The model simply does not fit, so model parallelism splits it across several GPUs.

It is like moving a piano that is too heavy for one person. Several people can each hold a side and lift together (tensor parallel), or pass it along a chain, floor by floor (pipeline parallel). Hiring a second crew with a second piano is data parallel — more pianos moved per hour, but no single move gets faster.

```
  70B parameters x 2 bytes (FP16) = 140 GB  >  80 GB on one H100  ->  split it

  TENSOR PARALLEL (TP = 2)   PIPELINE PARALLEL (PP = 2)  DATA PARALLEL (replicas)
  split every layer          split the stack of layers   copy the whole model
  ┌────────┐ ┌────────┐      ┌────────┐   ┌────────┐     ┌────────┐ ┌────────┐
  │ GPU 0  │ │ GPU 1  │      │ GPU 0  │   │ GPU 1  │     │ copy A │ │ copy B │
  │ heads  │ │ heads  │      │ layers │──▶│ layers │     │ users  │ │ users  │
  │  1-32  │ │ 33-64  │      │  1-40  │   │ 41-80  │     │ 1,3,5  │ │ 2,4,6  │
  └───┬────┘ └───┬────┘      └────────┘   └────────┘     └────────┘ └────────┘
      └all-reduce┘           activations cross once      copies never talk
  2 all-reduces per layer    per stage boundary          (training: average grads)
  -> NVLink, inside a node   -> fine across nodes        -> more throughput
  -> lower per-token time    -> bubble: stages wait      -> no latency gain

  More splits:  EXPERT parallel    — MoE experts on different GPUs (all-to-all)
                SEQUENCE / CONTEXT — one long sequence spread over several GPUs
                ZeRO / FSDP        — training: shard weights, gradients, Adam state
```

**Official Definition:**

> **Model parallelism** splits one model's weights and computation across several accelerators when the model does not fit in one device's memory (or one device is too slow). **Tensor parallelism** shards the weight matrices inside every layer and combines partial results with all-reduces (intra-layer); **pipeline parallelism** puts consecutive groups of layers on different devices and passes activations between them (inter-layer); **expert** and **context (sequence) parallelism** split a mixture-of-experts layer's experts and the token dimension. **Data parallelism** replicates the model for throughput, and **ZeRO / FSDP** shard the replicas' weights, gradients and optimizer state during training.

> **Maths in one line:** `GPUs needed ≥ (parameters × bytes per parameter + KV cache) ÷ usable memory per GPU` — 70B × 2 bytes = 140 GB > 80 GB, so at least two H100s, and more once the KV cache needs room.

**Interview Answer:**

**Say this first (30 sec):** Model parallelism splits one model across GPUs when it does not fit on one — a 70B model in FP16 is 140 GB against an H100's 80 GB. Tensor parallelism splits every layer and needs NVLink, so it stays inside a node and also cuts per-token latency; pipeline parallelism splits the stack of layers, needs little bandwidth, so it spans nodes but leaves GPUs idle in a "bubble"; data-parallel replicas add throughput. Large training runs combine them with ZeRO / FSDP.

| Split | What is divided | Communication | Use it for |
|---|---|---|---|
| **Tensor (TP)** | The matrices in every layer, e.g. 32 of 64 attention heads per GPU | Two all-reduces per layer, on every token | Inside one NVLink node (up to 8 GPUs); fits the model and lowers TPOT |
| **Pipeline (PP)** | Consecutive groups of layers ("stages") | Activations at each stage boundary | Across nodes, or GPUs without NVLink; fits huge models, no single-request speed-up |
| **Expert (EP)** | The experts of each MoE layer | All-to-all in every MoE layer | Large MoE models such as DeepSeek-V3 (671B); a hot expert becomes the straggler |
| **Sequence / context (SP / CP)** | The token dimension of the activations or of one long sequence | SP: all-gather + reduce-scatter in place of TP's all-reduce; CP: keys and values passed around a ring | Long-context training (128K–1M tokens), alongside TP |
| **Data parallel + ZeRO / FSDP** | The batch; FSDP also shards weights, gradients and optimizer state | Gradients once per step; FSDP gathers each layer's weights just in time | Throughput; FSDP makes training *fit*, not faster |

- **The serving rule (vLLM's docs):** fits one GPU → no split; fits one node → TP = GPUs in the node; bigger → TP = GPUs per node and PP = number of nodes. On GPUs without NVLink, prefer PP.
- **Fitting is not enough:** FP16 Llama-3-70B with TP = 2 on two H100s leaves only ~14 GiB for KV cache — five 8K-token requests; FP8 weights on the same two GPUs fit 31 ([Ch 17c §1.2](#content/17c_llm_systems)).
- **Training needs far more:** ~16 bytes per parameter with mixed-precision AdamW, so 70B needs 1,120 GB — at least 14 H100s before activations. Llama 3 405B used tensor, pipeline, context and data parallelism on up to 16K H100s.

**Likely follow-ups:**

- *Why keep tensor parallelism inside a node?* — It communicates twice per layer on every token: NVLink gives ~900 GB/s per H100, InfiniBand between nodes ~50 GB/s — an ~18× gap.
- *How do you shrink the pipeline bubble?* — Feed many micro-batches: idle share ≈ (p − 1) / (m + p − 1), so 4 stages waste 27% with 8 micro-batches and 9% with 32.
- *How would you serve DeepSeek-V3?* — Its 671 GB of FP8 weights overflow 8 × H100 (640 GB) but fit one 8 × H200 node (1,128 GB) with TP or EP; DeepSeek itself runs wide expert parallelism (EP32 prefill, EP144 decode).

**Trap:** Saying "pipeline parallelism makes inference faster" — it lets a too-big model fit, but each token still passes through every stage in turn; per-token speed comes from tensor parallelism (bandwidth adds up) and throughput from replicas.

**Go deeper:** [Ch 17 §3.6](#content/17_llm) · [Ch 29 §24.6](#content/29_gpus_tpus_infrastructure) · [Ch 29 §24.6b](#content/29_gpus_tpus_infrastructure) · [Ch 17c §2.6](#content/17c_llm_systems) · [Ch 17 §4.8](#content/17_llm)

---

### Q46. What is the difference between TTFT and TPS? Why do both matter?
*[DEPLOY] | ★★*

![Interview card Q46 TTFT vs TPS: TTFT is queue wait plus compute-bound prefill, per-user TPS is 1 / TPOT from memory-bound decode; formula latency = TTFT + TPOT x (N - 1); timeline of one 200-token reply, TTFT 300 ms then 199 gaps of 25 ms = 40 tokens/s per user, total 5.3 s with 94% decode; chart and table of batch size for a 70B in FP8 on 2 x H100 where batch 1 to 96 lifts total TPS from 95 to 4,785 while per-user TPS falls from 95 to 50 and batch 96 breaks a 20 ms TPOT SLO; trap: quoting one TPS number.](diagrams/iq33b_info_q46_ttft_vs_tps_ai.png)

**Simple Answer:**

**TTFT (time to first token)** is how long you wait before the chatbot starts typing — the pause before someone starts speaking. **TPS (tokens per second)** is how fast the words appear once it starts — how fast they talk. For one user, TPS = 1 ÷ TPOT, the time per output token.

A fast talker who pauses 10 seconds before every answer is annoying; so is someone who starts at once but says one word a second. A chat app needs both. A nightly batch job needs neither — it only cares how many tokens per second the whole GPU produces across all users.

```
  One chat reply on a timeline (Ch 17c §1.3 example: N = 200 tokens)

   arrive   1st token                                           200th token
     |<- TTFT ->|<-TPOT->|<-TPOT->| ... 199 gaps in all ... |<-TPOT->|
        300 ms    25 ms per gap  ->  1 / 0.025 = 40 tokens/s per user
     total = 0.300 + 0.025 x 199 = 5.3 s   (94% of it is decode)

  TTFT    per-user TPS        500-token answer  feels like
  ──────  ──────────────────  ────────────────  ───────────────────────────
  0.3 s   40 tok/s (25 ms)    12.8 s            great: faster than reading
  2.0 s   40 tok/s (25 ms)    14.5 s            "is it frozen?", then fine
  0.3 s   5 tok/s (200 ms)    100.1 s           slow: long answers drag
  5.0 s   5 tok/s (200 ms)    104.8 s           users give up

  TTFT  <- queue wait + prefill: prompt length, prefix-cache hits, FLOPs
  TPS   <- decode: bytes read per token (model size, quantization, KV cache)
           / memory bandwidth -- and it falls as the batch grows
```

**Official Definition:**

> **TTFT** is the time from a request's arrival to its first output token, including queueing and the prefill of the prompt (compute-bound). **TPOT** (time per output token) is the average gap between the later tokens, (latency − TTFT) ÷ (N − 1), set by memory-bandwidth-bound decode; per-user **TPS** is its inverse. **Throughput** is output tokens per second summed over all requests, and **goodput** counts only the requests that meet every latency target (SLO).

> **Maths in one line:** `latency = TTFT + TPOT × (N − 1)`, `per-user TPS = 1 ÷ TPOT`, `throughput ≈ batch × per-user TPS` — a bigger batch raises the last and lowers the middle.

**Interview Answer:**

**Say this first (30 sec):** TTFT is the wait before the first token — queueing plus prefill, which is compute-bound — and it decides whether the app feels responsive. TPS is how fast tokens stream after that; per user it is 1 ÷ TPOT, set by memory-bandwidth-bound decode. Total = TTFT + TPOT × (N − 1): a 200-token reply at 300 ms and 25 ms takes 5.3 s, 94% of it decode — so chat needs both, while batch jobs care only about throughput per GPU.

| | TTFT | Per-user TPS (1 ÷ TPOT) |
|---|---|---|
| Set by | Queue wait + prefill (compute) | Decode: weight and KV bytes read per token ÷ memory bandwidth |
| Main fixes | Prefix caching, shorter prompts, FP8 maths, less queueing ([Q44](#content/33b_llm_interview_questions_part2)) | Weight quantization, speculative decoding, GQA, tensor parallel, smaller batch |
| Chat targets (rules of thumb) | Good < 300 ms; acceptable < 1 s | Good TPOT < 30 ms (≈ 33 tok/s); acceptable < 60 ms |
| Matters most for | Chat, voice, autocomplete | Long answers, code, reasoning models |

- **"TPS" has two meanings:** per-user speed falls as the batch grows while system throughput rises — 1 → 96 sequences on a 70B: 95 → 50 tok/s per user, 95 → 4,785 tok/s in total.
- **Reasoning models move the wait into decode:** 2,000 hidden thinking tokens at 25 ms each delay the first *visible* word by 50 s, so for them TPOT is the felt TTFT.
- **Streaming changes what users feel, not the numbers:** the felt wait becomes TTFT; people read only about 4–7 tokens/s, so past ~20 tok/s extra speed matters mainly for code and reasoning.
- **Report P50 and P99, the worst inter-token gap and goodput** — an average TPOT can hide a 0.9 s freeze in the middle of an answer.

**Worked example:** where a request's time goes for a chat reply, a long report and a reasoning model (TPOT fixed at 25 ms), then what batch size does to TPOT, per-user TPS and total TPS, using Ch 17c §1.1's decode model (TTFT held at 300 ms for simplicity).

```python
# Latency = TTFT + TPOT x (N - 1): where the wait goes, and the two meanings of "TPS"
TTFT, TPOT = 0.300, 0.025                    # seconds: Ch 17c's chat example (40 tokens/s per user)

def latency(ttft, tpot, n_out):
    return ttft + tpot * (n_out - 1)

print(f"{'request':17s}{'tokens':>7s}{'first word s':>14s}{'total s':>9s}{'decode share':>14s}")
for name, hidden, shown in [("chat answer", 0, 200), ("long report", 0, 2000), ("reasoning model", 2000, 200)]:
    n = hidden + shown
    first_word = TTFT + TPOT * hidden        # hidden "thinking" tokens are decode steps too
    total = latency(TTFT, TPOT, n)
    print(f"{name:17s}{n:7,d}{first_word:14.2f}{total:9.2f}{(total - TTFT) / total:14.0%}")
assert round(latency(TTFT, TPOT, 200), 3) == 5.275

# Batch size: each decode step reads the weights once plus every sequence's KV cache
# (Ch 17c sec 1.1: a 70B model in FP8 on 2 x H100, 2,048 tokens of context per sequence)
BW, WEIGHTS, KV_PER_SEQ = 3.35e12, 35e9, 2048 * 327_680 / 2   # bytes/s, bytes per GPU
SLO_TPOT = 0.020                             # e.g. a coding assistant promising 20 ms per token
print(f"\n{'batch':>5s}{'TPOT ms':>9s}{'TPS per user':>14s}{'TPS total':>11s}{'200-token reply s':>19s}  meets SLO")
for batch in [1, 8, 32, 64, 96]:
    tpot = (WEIGHTS + batch * KV_PER_SEQ) / BW
    ok = "yes" if tpot <= SLO_TPOT else "no"
    print(f"{batch:5d}{tpot * 1e3:9.1f}{1 / tpot:14.1f}{batch / tpot:11,.0f}{latency(TTFT, tpot, 200):19.2f}  {ok}")
    if batch == 96:
        assert round(batch / tpot) == 4785 and ok == "no"
```

**Output:**

```
request           tokens  first word s  total s  decode share
chat answer          200          0.30     5.28           94%
long report        2,000          0.30    50.27           99%
reasoning model    2,200         50.30    55.27           99%

batch  TPOT ms  TPS per user  TPS total  200-token reply s  meets SLO
    1     10.5          94.8         95               2.40  yes
    8     11.2          88.9        711               2.54  yes
   32     13.7          73.2      2,344               3.02  yes
   64     16.9          59.3      3,796               3.65  yes
   96     20.1          49.8      4,785               4.29  no
```

The long report spends 99% of its time in decode, and the reasoning model's first visible word arrives after 50 s. Batching to 96 multiplies total TPS 50× while the 200-token reply slows from 2.4 to 4.3 s — the largest batch inside a 20 ms TPOT target is 64. That is the throughput–latency trade-off: choose the batch from the latency target, not from peak throughput.

**Likely follow-ups:**

- *Why is prefill compute-bound but decode memory-bound?* — Prefill reuses each weight for every prompt token at once; decode reads every weight to produce one token per sequence, so a 70B in FP16 on two H100s tops out near 48 tokens/s per stream.
- *P99 TTFT tripled but the mean is flat — what happened?* — Queueing: long prefills or a full KV cache stop new requests being admitted. Fix with chunked prefill, admission control or more replicas.
- *What is goodput?* — Requests per second that meet every SLO. In Ch 17c's four-request example throughput is 0.42 requests/s but goodput only 0.21.

**Trap:** Quoting one "TPS" number — per-user speed and system throughput move in opposite directions as the batch grows, so say which one you mean and give P50 and P99, not a mean.

**Go deeper:** [Ch 17c §1.3](#content/17c_llm_systems) · [Ch 17c §1.1](#content/17c_llm_systems) · [Ch 17c §2.1](#content/17c_llm_systems) · [Ch 17c §2.3](#content/17c_llm_systems) · [Q44](#content/33b_llm_interview_questions_part2)

---

### Q47. How do you choose between running your own LLM vs. using an API?
*[DEPLOY] | ★★*

![Interview card Q47 self-host or API: restaurant, caterer or own kitchen analogy; formula break-even tokens per day = GPU cost per day / API price per token, 576 USD a day / 8.57 USD per 1M tokens = 67M tokens a day; five-step decision ladder from air-gapped data, region, open model passing your evals, steady volume above break-even and 24/7 ops to self-host with vLLM or SGLang; table for one 8 x H100 node as of Nov 2026: frontier API 67M tokens a day, mid-tier API 134M, managed Llama 3.3 70B 800M (61% of the node); trap: comparing self-hosted GPUs with frontier API prices.](diagrams/iq33b_info_q47_self_host_vs_api_ai.png)

**Simple Answer:**

It is like choosing between eating out and cooking at home. **An API is the restaurant:** no kitchen, you pay per meal, and you get the best chefs — perfect when you are starting out or eat out now and then. **Self-hosting is your own kitchen (GPUs):** a big fixed cost that only pays off if you cook a lot, every day, and you also do the dishes (uptime, upgrades, on-call).

In between is a **caterer**: a cloud that runs open models for you and still bills per meal (a managed open-weight endpoint). Choose with the rules first (may the data leave the house?), then quality, then volume.

```
  DECIDE IN THIS ORDER                             ANSWER
  ──────────────────────────────────────────────   ────────────────────────────────
  1. Data may never leave our network (air-gap)?   yes -> self-host or on-prem box
  2. Data must stay in one region / cloud deal?    yes -> regional endpoints, go on
  3. Does an open model pass OUR evals?            no  -> closed-model API
  4. Volume steady AND above break-even?           no  -> managed open model or API
  5. Can we staff 24/7 ops, spares, upgrades?      no  -> managed open model
                                                   yes -> self-host (vLLM / SGLang)

  Break-even for one 8 x H100 node (576 USD a day, Ch 17c §5.2 assumptions)
    vs frontier API, blended 8.57 USD per 1M tokens  ->   67M tokens a day
    vs managed Llama 3.3 70B, 0.72 USD per 1M        ->  800M tokens a day
    one node serves about 1.3B tokens a day (sized for a 3x busy hour)
```

**Official Definition:**

> Choosing between an LLM API and self-hosting is a build-vs-buy decision over **data control** (privacy, residency, air-gapping), **task quality** (closed frontier models vs open-weight models on your own evals), **total cost of ownership** (per-token charges vs GPU-hours paid whether busy or idle, plus engineering, redundancy and peak headroom), **control** (latency tuning, fine-tuning, version pinning) and **operational risk**. Managed open-weight endpoints in the major clouds sit in between: open models billed per token.

> **Maths in one line:** `break-even tokens per day = GPU cost per day ÷ API price per token` — an 8 × H100 node at 3 USD per GPU-hour costs 576 USD a day, so at a blended frontier price of 8.57 USD per 1M tokens it wins only above ~67M tokens a day (~2B a month).

**Interview Answer:**

**Say this first (30 sec):** I'd start on an API and self-host only for a concrete reason: the data cannot leave our network, an open model passes our evals at a steady volume above break-even, or we need control the API does not give. Break-even is GPU cost ÷ token price: one 8 × H100 node, about 576 USD a day, beats frontier API prices above ~67M tokens a day — but against the same open model sold per token by a cloud it needs ~800M a day, most of its capacity, so like for like it rarely pays.

| Route (as of Nov 2026) | Examples | Pick it when |
|---|---|---|
| Closed model, provider's own API | OpenAI, Anthropic, Google Gemini API | You want the newest models and features first; volume is low or spiky |
| Closed model through your cloud | Amazon Bedrock, Microsoft Foundry (includes Azure OpenAI), Gemini Enterprise Agent Platform (formerly Vertex AI) | Compliance, regional residency, one bill, existing IAM and private networking |
| Open model, managed endpoint | Open models in the same clouds, e.g. Llama 3.3 70B on Bedrock at 0.72 USD per 1M tokens | An open model passes your evals and you do not want to run GPUs |
| Open model, self-hosted | vLLM or SGLang on your own GPUs | Air-gapped data, steady volume above break-even, or deep control (quantization, multi-LoRA, custom decoding) |

- **Hidden self-hosting costs:** capacity sized for a 3× busy hour sits two-thirds idle on average; a standby node doubles the hardware; on-call engineers, upgrades and security patches are yours.
- **Quality and size:** the best open models trail the best closed ones by about 4 months on average (Epoch AI, May 2026), and the strongest are huge MoEs — DeepSeek V4-Pro needs ~800 GB even at 4 bits (10 H100s).
- **Hybrid is normal:** send easy, high-volume or sensitive traffic to a small open model and hard cases to a frontier API; a cheap-first cascade saves 50–85% in Ch 19's example.
- **Pull the cheap API levers first:** prompt caching (cached input 90–97.5% off), batch APIs (about 50% off) and smaller tiers often beat any migration.

**Worked example:** break-even tokens per day for one 8 × H100 node against three per-token prices, with Ch 17c §5.2's assumptions (3 USD per GPU-hour, a 70B model in FP8 at 40% MFU, 500 input + 200 output tokens per request).

```python
# API or self-host? Break-even tokens per day for one 8 x H100 node (assumptions from Ch 17c sec 5.2)
GPU_HOUR, GPUS = 3.00, 8                     # USD per H100-hour on demand; one 8-GPU node
IN_TOK, OUT_TOK = 500, 200                   # tokens per request (Ch 17c's chat feature)
N, FP8_FLOPS, MFU, PEAK_TO_MEAN = 70e9, 1979e12, 0.40, 3   # 70B model, FP8 maths, 40% MFU, 3x busy hour

node_day = GPU_HOUR * GPUS * 24              # paid every hour, busy or idle
peak_tps = GPUS * FP8_FLOPS * MFU / (2 * N)  # about 2 x N FLOPs per token, input or output
capacity = peak_tps * 86_400 / PEAK_TO_MEAN  # tokens/day when sized for a 3x busy hour
print(f"one node: {node_day:,.0f} USD/day; serves about {capacity / 1e9:.2f}B tokens/day")

prices = {                                   # USD per 1M tokens (input, output), Nov 2026
    "frontier API": (4.00, 20.00),           # Claude Opus 5.5 list price (Ch 17b sec 13.3)
    "mid-tier API": (2.00, 10.00),           # GPT-6.1 Sol, Claude Sonnet 5.5
    "managed Llama 3.3 70B": (0.72, 0.72),   # Amazon Bedrock on demand, us-east-1
}
print(f"\n{'versus':23s}{'USD per 1M':>11s}{'break-even/day':>16s}{'share of node':>15s}{'+ standby node':>16s}")
for name, (p_in, p_out) in prices.items():
    blended = (IN_TOK * p_in + OUT_TOK * p_out) / (IN_TOK + OUT_TOK)
    even = node_day / blended * 1e6          # tokens/day at which the node costs the same as the API
    spare = 2 * even / capacity              # a standby node doubles the cost, not the capacity
    verdict = f"{spare:.0%}" if spare <= 1 else "never"
    print(f"{name:23s}{blended:11.2f}{even / 1e6:14,.0f} M{even / capacity:15.0%}{verdict:>16s}")
    if name == "frontier API":
        assert round(even * 730 / 24 / 1e9, 1) == 2.0     # Ch 17c: about 2B tokens a month
```

**Output:**

```
one node: 576 USD/day; serves about 1.30B tokens/day

versus                  USD per 1M  break-even/day  share of node  + standby node
frontier API                  8.57            67 M             5%             10%
mid-tier API                  4.29           134 M            10%             21%
managed Llama 3.3 70B         0.72           800 M            61%           never
```

Against frontier prices the node pays for itself at 5% of its capacity — 67M tokens a day, about 2B a month, the same as Ch 17c. Against the same open model sold per token it must stay 61% busy, and with a standby node for redundancy it never wins on hardware alone. Self-hosting pays when the alternative is a frontier price and an open model is good enough, when volume is high and steady, or when the data cannot leave.

**Likely follow-ups:**

- *What would make you self-host on day one?* — A contract or regulator that forbids any outside processing (air-gapped defence or health data): no API is allowed, so the design starts from open weights.
- *How sensitive is the break-even to GPU prices?* — Linear: H100s rent for roughly 1.5–7 USD an hour (Oct 2026, by provider and commitment), so the 3 USD assumption can move the answer about 2× either way.
- *What do you give up with an API besides money?* — Control: rate limits, outages and model retirements on the provider's schedule. Pin model versions, keep a golden-set eval for re-testing, and set up a fallback provider.

**Trap:** Comparing a self-hosted 70B's GPU bill with a frontier API's token price and calling self-hosting "10× cheaper" — compare like with like (the same open model sold per token), then add staff, standby capacity and idle peak hours before deciding.

**Go deeper:** [Ch 17c §5.2](#content/17c_llm_systems) · [Ch 19 §19.12a](#content/19_ai_frameworks) · [Ch 19 §19.14](#content/19_ai_frameworks) · [Ch 17b §13.3](#content/17b_llm_applications) · [Ch 20 §20.3](#content/20_2026_landscape)

---

# PART 6 — Evaluation & Benchmarks

---

### Q48. How do you evaluate an LLM? What metrics matter?
*[EVAL] | ★★*

![Interview card Q48 how to evaluate an LLM: benchmarks are the CV, your own eval is the interview; formula margin = plus or minus 1.96 x sqrt(p(1 - p) / n), so 90% on a 200-case golden set is plus or minus 4.2 points and a 2-point gain is noise; four-layer evaluation stack from assert on every commit, golden set of 50-200 real cases, calibrated LLM judge nightly, to online A/B test on real users, with a feedback arrow turning every production failure into a new golden case and public benchmarks as shortlist only; table of task metrics: exact match and F1, pass@k, Recall@k then faithfulness, pairwise judge win rate.](diagrams/iq33b_info_q48_llm_evaluation_ai.png)

**Simple Answer:**
You can't ask an LLM five questions and say "seems good". Evaluate it the way you would hire
someone. Public benchmarks are the CV: they get a model onto the shortlist. The real interview
is your own test — automatic checks for the basics, a fixed exam built from real past cases, a
senior reviewer for the open-ended work, and finally how real customers react.

```
  THE EVALUATION STACK — cheapest at the bottom, closest to the truth at the top
  ┌────────────────────────────────────────────────┐
  │ 4. ONLINE   A/B test on task success, plus     │  continuously, on real users
  │             thumbs, cost, latency, escalations │
  ├────────────────────────────────────────────────┤
  │ 3. JUDGE    LLM-as-judge on open-ended output, │  nightly
  │             calibrated on 100–200 human labels │
  ├────────────────────────────────────────────────┤
  │ 2. GOLDEN   50–200 real cases in git; run each │  on every prompt, model
  │    SET      3–5 times (outputs vary)           │  or retrieval change
  ├────────────────────────────────────────────────┤
  │ 1. ASSERT   valid JSON? cites a source?        │  on every commit
  │             no PII? under N tokens?            │
  └────────────────────────────────────────────────┘
  OFFLINE = layers 1–3: they gate every change before it ships.
  ONLINE  = layer 4: it proves real users are better off.
  The loop: every production failure becomes a new golden-set case.
  Public benchmarks sit outside the stack: they shortlist models, they don't decide.
```

**Official Definition:**
> **LLM evaluation** measures a model — or the whole LLM system around it — against the task it
> serves. It combines **intrinsic metrics** (perplexity, cross-entropy: how well the model predicts
> text), **task metrics** (exact match, F1, pass@k, BLEU/ROUGE, faithfulness), **preference
> judgements** (human raters, a calibrated LLM judge, Arena-style ratings) and **online product
> metrics** from A/B tests. Offline evaluation gates each change; online evaluation confirms that
> users are better off.

> **Maths in one line:** `margin ≈ ± 1.96 × √(p(1 − p) / n)` — the 95% error bar on a pass rate p measured on n cases: 90% on a 200-case golden set is ± 4.2 points, so a 2-point "gain" there is noise.

**Interview Answer:**

**Say this first (30 sec):** There is no single number — I evaluate in layers, on my own task.
Assertions and a versioned golden set of 50–200 real cases run on every prompt or model change; an
LLM judge, calibrated against human labels, grades open-ended quality; and an online A/B test on
task success decides the launch. Public benchmarks only shortlist models.

| Task | Metric that fits | Watch out |
|---|---|---|
| Classification, extraction, short answers | Exact match, F1 | Normalise case and whitespace first |
| Code | pass@k on hidden unit tests | Run the code; never compare the text |
| RAG | Recall@k and MRR, then faithfulness | Score retrieval and generation separately ([Q36 in Part 1](#content/33_llm_interview_questions)) |
| Chat, summaries, writing | Pairwise judge win rate; ROUGE/BLEU only against a reference | Word overlap misses meaning ([Q50](#content/33b_llm_interview_questions_part2)) |
| Agents | Task success, pass^k over repeated runs | One lucky run proves little ([Ch 18b §18.12](#content/18b_agents_in_production)) |

- **Offline vs online:** offline (golden set, judge) is fast and repeatable but built on your guess of the traffic; online A/B tests measure real users. Offline wins often shrink online.
- **Regression testing:** every incident becomes a golden case; run each case 3–5 times and track its pass rate, because the same prompt can pass, then fail.
- **Size the test:** at a 90% pass rate, 200 cases give ± 4.2 points; detecting 60% → 62% task success online needs about 9,333 sessions per arm ([Ch 17c §4.4](#content/17c_llm_systems)).
- **Benchmarks:** MMLU, GSM8K and HumanEval are saturated (90%+). Benchmarks also break: OpenAI retired SWE-bench Verified in Feb 2026 (saturated/contaminated); it then recommended SWE-bench Pro, but retracted that on 8 Jul 2026 after finding ~30% of Pro tasks broken ([Q53](#content/33b_llm_interview_questions_part2)).
- **Beyond quality:** always track latency (TTFT, TPOT — [Q46](#content/33b_llm_interview_questions_part2)), cost per request and safety. Perplexity tracks pre-training and quantization, not product quality ([Q49](#content/33b_llm_interview_questions_part2)).

**Likely follow-ups:**

- *Where do golden-set cases come from?* — Real production failures and sampled traffic, plus known edge cases and adversarial inputs — not invented examples. Version them in git next to the prompts.
- *How do you evaluate when there is no reference answer?* — Assertions for whatever can be checked, then a pairwise LLM judge calibrated on 100–200 human labels ([Q50](#content/33b_llm_interview_questions_part2)).
- *Why not just pick the top model on Arena?* — Arena (formerly Chatbot Arena / LMArena) measures crowd preference on general prompts, not correctness on your task; a 19-point gap is only a ~53% head-to-head win rate.

**Trap:** "Pick the model with the best leaderboard score and ship it." Leaderboards only shortlist; your own golden set and an online A/B test decide — and any single metric hides regressions elsewhere.

**Go deeper:** [Ch 17c §4.1–4.4](#content/17c_llm_systems) · [Ch 19 §19.10](#content/19_ai_frameworks) · [Ch 18b §18.12](#content/18b_agents_in_production) · [Ch 20 §20.13](#content/20_2026_landscape)

---

### Q49. What is perplexity? Is a lower perplexity always better?
*[EVAL] | ★★*

![Interview card Q49 perplexity and when lower is not better: perplexity = e to the cross-entropy loss, PPL = exp(-(1/N) x sum of ln P(true token)), a perplexity of 10 is as unsure as a 10-sided die; one-token example where P(Paris) = 0.80 gives perplexity 1.25 and P(Paris) = 0.10 gives 10; the same sentence under two tokenizers gives PPL/token 2.720 with 7 tokens and 2.015 with 10 tokens but the same PPL/word 3.214 and bits/byte 0.326; lower is not better across different tokenizers, different test text, test text seen in training or the wrong thing measured; table with perfect prediction 1, uniform guessing V, GPT-2 1.5B about 35.8 and GPT-3 175B about 20.5 on Penn Treebank.](diagrams/iq33b_info_q49_perplexity_ai.png)

**Simple Answer:**
Perplexity measures how "confused" a model is by the text it reads. Show it "The capital of
France is ___": if it puts most of its probability on "Paris", it is barely surprised — low
perplexity. If it spreads its bets evenly over 10 words, its perplexity there is 10: as unsure
as rolling a 10-sided die. Lower is better — but only when two models read the same text, cut
into tokens the same way.

```
  PERPLEXITY = "as unsure as choosing evenly among this many tokens"
     1     perfect prediction (never happens: language is ambiguous)
     10    like picking from 10 equally likely tokens
     V     uniform guessing over a vocabulary of V tokens (e.g. 50,000)

  ONE TOKEN    "The capital of France is ___"    true token "Paris"
     confident model   P(Paris) = 0.80  →  perplexity 1 / 0.80 = 1.25
     confused model    P(Paris) = 0.10  →  perplexity 1 / 0.10 = 10
  MANY TOKENS  perplexity = 1 / (geometric mean of P(true token))

  PUBLISHED  zero-shot, Penn Treebank, same test set, per word (lower is better)
     GPT-2 1.5B ≈ 35.8           GPT-3 175B ≈ 20.5

  IS LOWER ALWAYS BETTER?  No — compare only like with like:
     ✗ different tokenizer      per-token perplexity shifts → use bits-per-byte
     ✗ different test text      Wikipedia vs legal contracts → different scores
     ✗ test text in training    memorised text scores close to 1 (contamination)
     ✗ wrong thing measured     prediction ≠ helpfulness, truth or safety
```

**Official Definition:**
> **Perplexity** is the exponential of the average negative log-likelihood — the cross-entropy —
> that a language model assigns to the true tokens of a held-out text:
> $\text{PPL} = \exp\!\left(-\frac{1}{N}\sum_{i=1}^{N} \ln P(x_i \mid x_{<i})\right)$. It is the
> effective number of equally likely tokens the model is choosing between at each step: 1 is perfect
> and V is uniform guessing over a V-token vocabulary. It measures next-token prediction on that text
> with that tokenizer — not task performance, helpfulness, truthfulness or safety.

> **Maths in one line:** `loss = −(1/N) Σ ln P(true tokenᵢ)` and `perplexity = e^loss` — the average surprise in nats, turned back into "as unsure as choosing among this many tokens"; only a loss measured in bits uses `2^loss`.

**Interview Answer:**

**Say this first (30 sec):** Perplexity is e to the power of the cross-entropy loss — the
exponential of the average negative log-probability the model gave the true next tokens. A
perplexity of 20 means the model is, on average, as unsure as picking among 20 equally likely
tokens. Lower is better only for the same tokenizer on the same text, and it measures prediction,
not helpfulness or truth.

- **Where it is useful:** pre-training loss curves, comparing checkpoints, checking a quantized model against full precision, and filtering training data (keep low-perplexity text — [Ch 17 §3.1b](#content/17_llm)).
- **Tokenizer trap:** per-token perplexity depends on how the text is cut. Across tokenizers compare bits-per-byte or per-word perplexity — GPT-2 divided its total log-probability by each benchmark's own unit (word, character or byte) for exactly this reason.
- **Data trap:** scores compare only on the same test text. Domain shift moves perplexity, and test text leaked into training drives it towards 1.
- **Not quality:** chat models tuned with SFT and RLHF/DPO often score *higher* perplexity on generic text than their base model, yet are far more useful; GPT-4's report shows post-training reduced calibration.
- **Averages hide errors:** in [Ch 17c §4.6](#content/17c_llm_systems)'s example a 4-bit model's perplexity rises only 3.3% while all 20 answer tokens go wrong — so judge quantization with task evals.
- **Needs log-probs:** most closed APIs do not return log-probs for text you supply, so perplexity is mainly a tool for open models and your own training runs.

**Worked example:** perplexity from token probabilities, then one sentence under two tokenizers — per-token perplexity moves, per-word perplexity and bits-per-byte do not.
```python
# Perplexity from token log-probs (PPL = exp of the mean NLL) and why it depends on the tokenizer
import numpy as np

def perplexity(logprobs):                  # natural-log probabilities of the TRUE tokens
    return float(np.exp(-np.mean(logprobs)))

# 1) One token: "The capital of France is ___", true next token "Paris"
for name, p in (("confident model", 0.80), ("confused model", 0.10)):
    print(f"{name}: P(Paris) = {p:.2f} -> perplexity {perplexity(np.log([p])):.2f}")

# 2) One sentence, two tokenizers. B splits "The", "capital" and "France" in two, and each
#    pair of probabilities multiplies back to A's, so P(whole sentence) is identical.
text = "The capital of France is Paris."
n_words, n_bytes = len(text.split()), len(text.encode("utf-8"))
p_a = np.array([0.05, 0.20, 0.60, 0.30, 0.70, 0.80, 0.90])                    # 7 tokens
p_b = np.array([0.10, 0.50, 0.25, 0.80, 0.60, 0.50, 0.60, 0.70, 0.80, 0.90])  # 10 tokens
print(f"{text!r}: {n_words} words, {n_bytes} bytes")
ppl = {}
for name, p in (("A", p_a), ("B", p_b)):
    nll = -np.log(p).sum()                 # total surprise of the sentence, in nats
    ppl[name] = perplexity(np.log(p))
    print(f"  tokenizer {name}, {len(p):2d} tokens: NLL {nll:.3f} | PPL/token {ppl[name]:.3f} | "
          f"PPL/word {np.exp(nll / n_words):.3f} | bits/byte {nll / np.log(2) / n_bytes:.3f}")

assert np.isclose(ppl["A"], 1 / np.exp(np.log(p_a).mean()))   # = 1 / geometric-mean probability
assert np.isclose(np.prod(p_a), np.prod(p_b))                 # same belief about the sentence...
assert ppl["B"] < 0.75 * ppl["A"]                             # ...yet B "looks" 26% better per token
```

**Output:**

```
confident model: P(Paris) = 0.80 -> perplexity 1.25
confused model: P(Paris) = 0.10 -> perplexity 10.00
'The capital of France is Paris.': 6 words, 31 bytes
  tokenizer A,  7 tokens: NLL 7.005 | PPL/token 2.720 | PPL/word 3.214 | bits/byte 0.326
  tokenizer B, 10 tokens: NLL 7.005 | PPL/token 2.015 | PPL/word 3.214 | bits/byte 0.326
```

Reading it: both tokenizers give the sentence exactly the same probability (total NLL 7.005 nats), yet B's per-token perplexity is 26% lower simply because it spreads that surprise over 10 tokens instead of 7. Normalising by a tokenizer-free unit — words or bytes — gives identical scores.

**Likely follow-ups:**

- *Perplexity vs cross-entropy?* — The same information: perplexity = e^loss for a loss in nats (what PyTorch reports), 2^loss for bits. A loss of 3.0 is perplexity 20.1 in nats but 8 in bits — always ask the units.
- *Why can a chat model have higher perplexity than its base model?* — Post-training concentrates probability on one helpful style instead of matching the spread of web text, so it predicts generic text worse while answering users better.
- *How do you compare models with different tokenizers?* — Score the same test text, then report bits-per-byte (total loss in bits ÷ UTF-8 bytes) or per-word perplexity.

**Trap:** "Model A has lower perplexity than model B, so A is better." That holds only for the same tokenizer on the same uncontaminated text — and even then it ranks next-token prediction, not usefulness.

**Go deeper:** [Ch 17c §4.6](#content/17c_llm_systems) · [Ch 17 §1.4](#content/17_llm) · [Q48](#content/33b_llm_interview_questions_part2)

---

### Q50. What is LLM-as-a-Judge evaluation?
*[EVAL] | ★★*

![Interview card for Q50 LLM-as-a-Judge: a strong model with a rubric grades answers; Cohen's kappa formula; a swap test where the verdict follows the slot and is counted as a tie; three biases and fixes (position, verbosity, self-preference); MT-Bench agreement bars of 50% chance, 81% expert vs expert and 85% GPT-4 judge vs experts; and a simulated 400-pair table where swap-consistent verdicts lift kappa from 0.61 to 0.94.](diagrams/iq33b_info_q50_llm_as_judge_ai.png)

**Simple Answer:**
Human evaluation is the reference standard, but it is slow and expensive. LLM-as-a-judge gives a
strong model a written rubric and lets it grade other models' answers — like a senior teacher who
can mark a thousand essays in minutes. It works surprisingly well, but this teacher has habits: she
favours the essay she reads first, the longer essay, and essays written in her own style. So you
check her marks against a pile of human-graded papers before you trust them.

```
  question ─► answer A ─┐
                        ├─► JUDGE + rubric ─► "A" / "B" / "tie" + a short reason
  question ─► answer B ─┘

  THREE WAYS TO ASK
    Pointwise          "Score this answer 1–10."              scales; scores drift
    Pairwise           "Which is better, A or B, or a tie?"   best for "is v2 better?"
    Reference-guided   "Here is the right answer; grade it."  maths, facts, extraction

  SWAP TEST — ask twice with the order flipped
    [A, B]  →  "the first is better"  →  A wins
    [B, A]  →  "the first is better"  →  B wins
    The verdict followed the SLOT, not the answer → count it as a tie.

  MT-BENCH (Zheng et al., 2023) — non-tie votes, where chance = 50%
    GPT-4 judge vs expert humans   85% agreement
    expert vs expert               81% agreement
```

**Official Definition:**
> **LLM-as-a-Judge** uses a strong LLM, prompted with a rubric, to evaluate other models' outputs
> when there is no exact-match answer. It runs in three modes — **pointwise** (single-answer grading
> on a scale), **pairwise** (which of two answers is better, or a tie) and **reference-guided**
> (grading against a known correct answer). It is a proxy for human judgement: it must be calibrated
> against human labels and corrected for its known biases — position, verbosity and self-preference.

> **Maths in one line:** `κ = (p_o − p_e) / (1 − p_e)` — Cohen's kappa: the judge's agreement with human labels (p_o) after removing the agreement it would reach by chance (p_e); 0 means no skill, 1 means perfect agreement.

**Interview Answer:**

**Say this first (30 sec):** LLM-as-a-judge means a strong model with a rubric grades open-ended
outputs — pointwise, pairwise or against a reference — so thousands of answers are scored in
minutes. In the MT-Bench study GPT-4 agreed with expert humans on 85% of non-tie votes, more than
the experts agreed with each other (81%). It has three known biases — position, verbosity and
self-preference — so I judge both orders, control length, and calibrate against human labels.

| Bias / weakness | Evidence (MT-Bench paper unless noted) | Fix |
|---|---|---|
| **Position** | On near-identical answer pairs GPT-4 kept its verdict after a swap only 65% of the time; Claude-v1 23.8% | Judge both orders; a win must survive the swap, else it is a tie; report the flip rate |
| **Verbosity** | Padding a list with rephrased items fooled GPT-3.5 and Claude-v1 in 91.3% of cases, GPT-4 in 8.7% | Length-controlled win rates (AlpacaEval 2.0: Spearman correlation with Chatbot Arena 0.94 → 0.98); a rubric that penalises padding |
| **Self-preference** | GPT-4 gave itself a ~10% higher win rate, Claude-v1 ~25% (the paper calls the evidence inconclusive) | A judge from a different model family, or a panel of families |
| **Weak at maths** | GPT-4 accepted wrong answers in 14 of 20 maths cases; 3 of 20 when given a reference answer | Reference-guided grading, or a deterministic check |

- **Pairwise for decisions:** "is v2 better than v1?" is more reliable pairwise; pointwise 1–10 scores drift between runs and cluster mid-scale, but scale to many models.
- **Calibrate before trusting:** hand-label 100–200 items and report agreement *and* Cohen's κ — a judge that always says "A" agrees 60% when humans prefer A 60% of the time, yet κ = 0.
- **Prompt hygiene:** reasoning before the verdict, a fixed output schema, low temperature, and a pinned judge-model version so scores stay comparable over time.
- **Cost:** about 0.4 US cents per judgment at illustrative mid-tier prices; judging 1% of 1M daily requests costs about 40 dollars a day for a ± 0.59-point margin ([Ch 19 §19.10](#content/19_ai_frameworks)).
- **Humans stay in the loop:** they write the rubric, label the calibration set and audit judge–human disagreements; a judge alone never makes a high-stakes launch call.

**Worked example:** a simulated judge that picks whichever answer it saw first 30% of the time — the swap test catches it, and Cohen's κ shows how much of its agreement with the experts is real.
```python
# LLM-judge calibration: the swap test exposes position bias; Cohen's kappa = agreement beyond chance
import numpy as np

rng = np.random.default_rng(0)
n = 400
human_a = rng.random(n) < 0.6             # expert labels: answer A is better in ~60% of pairs

def judge(a_first, lazy=0.30, acc=0.90):  # True where the judge says "A is better"
    first_slot = rng.random(n) < lazy     # 30% of the time: pick whichever answer was shown first
    right = rng.random(n) < acc           # otherwise: agree with the experts 90% of the time
    return np.where(first_slot, a_first, np.where(right, human_a, ~human_a))

def kappa(j, h):                          # Cohen's kappa = (p_o - p_e) / (1 - p_e)
    p_o = (j == h).mean()                 # observed agreement
    p_e = j.mean() * h.mean() + (1 - j.mean()) * (1 - h.mean())   # agreement expected by chance
    return p_o, (p_o - p_e) / (1 - p_e)

ab, ba = judge(a_first=True), judge(a_first=False)   # the same 400 pairs, judged in both orders
consistent = ab == ba
print(f"verdicts that flipped when the order was swapped: {1 - consistent.mean():.0%}")
every = np.ones(n, bool)                  # = verdicts of a judge that always picks A (shown first)
for name, verdict, keep in [("always 'the first is better'", every, every),
                            ("judge, one order (A first)", ab, every),
                            ("judge, swap-consistent only", ab, consistent)]:
    p_o, k = kappa(verdict[keep], human_a[keep])
    print(f"{name:29}: pairs kept {keep.mean():4.0%} | agreement {p_o:.0%} | kappa {k:.2f}")

assert np.isclose(kappa(every, human_a)[1], 0)        # right on every A-pair by luck: zero skill
assert kappa(ab[consistent], human_a[consistent])[1] > kappa(ab, human_a)[1] + 0.2
```

**Output:**

```
verdicts that flipped when the order was swapped: 39%
always 'the first is better' : pairs kept 100% | agreement 56% | kappa 0.00
judge, one order (A first)   : pairs kept 100% | agreement 81% | kappa 0.61
judge, swap-consistent only  : pairs kept  61% | agreement 97% | kappa 0.94
```

Reading it: the do-nothing judge "agrees" with the experts 56% of the time — exactly the share of pairs where A really was better — and κ correctly scores it 0. The real judge flips on 39% of pairs when the order is swapped (GPT-4 flipped on about a third of MT-Bench's near-identical pairs); keeping only swap-consistent verdicts lifts κ from 0.61 to 0.94, at the price of calling the other 39% ties.

**Likely follow-ups:**

- *What if the judge and your users disagree?* — The users win. Sample the disagreements, find the criterion the judge is blind to, then fix the rubric or add a deterministic assertion.
- *Can the model under test be its own judge?* — Avoid it (self-preference): use another family or a panel. And never train against the judge you report with, or you optimise its quirks (Goodhart).
- *How high must agreement be?* — Measure human–human agreement on the same items first; it is the ceiling. If raters agree only 70% of the time, no judge can be validated beyond that ([Ch 17c §4.7](#content/17c_llm_systems)).

**Trap:** "An LLM judge is objective, so its score is ground truth." It is an uncalibrated opinion until you measure its agreement and κ against human labels and control for position, length and self-preference.

**Go deeper:** [Ch 17c §4.2](#content/17c_llm_systems) · [Ch 17c §4.7](#content/17c_llm_systems) · [Ch 19 §19.10](#content/19_ai_frameworks) · [Q36 in Part 1](#content/33_llm_interview_questions)

---

### Q51. What is the "lost in the middle" problem?
*[EVAL] | ★★*

![Interview card for Q51 Lost in the Middle: a U-shaped bar chart of GPT-3.5-Turbo accuracy by answer position out of 20 passages (75.8% at 1, 57.2% at 5, 53.8% at 10 marked worst, 55.4% at 15, 63.2% at 20) with dashed lines for no passages 56.1% and oracle 88.3% (Liu et al., TACL 2024); position cost 75.8 minus 53.8 = 22 points; a prompt stack ordering best chunk first, runner-up near the end and the question last; key numbers and follow-ups.](diagrams/iq33b_info_q51_lost_in_the_middle_ai.png)

**Simple Answer:**

Give a model a long prompt and it uses what sits at the beginning and the end well, but is more likely to miss what sits in the middle — like a long meeting where you remember how it opened and the last thing said, while the middle blurs. The fact *is* in the window; the model just under-uses it. So *where* you place evidence in a prompt changes the answer.

```
  Liu et al. (TACL 2024): GPT-3.5-Turbo answers a question from 20 retrieved
  Wikipedia passages (≤ 100 tokens each); exactly ONE passage holds the answer

  position  1 (start)        75.8%  ██████████████████████████████████████
  position  5                57.2%  █████████████████████████████
  position 10 (middle)       53.8%  ███████████████████████████  ← worst
  position 15                55.4%  ████████████████████████████
  position 20 (end)          63.2%  ████████████████████████████████

  no passages (closed-book)  56.1%  ████████████████████████████
  only the answer (oracle)   88.3%  ████████████████████████████████████████████

  U-shaped: best at the start, second-best at the end, worst in the middle —
  where it scores LOWER than when it is given no passages at all.
```

**Official Definition:**

> **Lost in the middle** (Liu et al., "Lost in the Middle: How Language Models Use Long Contexts", TACL 2024) is a positional bias in how language models use long inputs: accuracy is highest when the relevant information is at the beginning (primacy) or end (recency) of the context and degrades when it is in the middle — a U-shaped curve over position. It appeared in base, instruction-tuned and extended-context models alike, so the context a model *uses well* is smaller than the context it *accepts*.

> **Maths in one line:** `position cost = acc(start) − acc(middle) = 75.8 − 53.8 = 22 points` — moving the answer passage from slot 1 to slot 10 of 20 cost GPT-3.5-Turbo 22 points, more than all 20 passages added at best (75.8 − 56.1 = 19.7 points over no passages).

**Interview Answer:**

**Say this first (30 sec):** "Lost in the middle" is the finding (Liu et al., TACL 2024) that LLMs use information at the start and end of a long prompt much better than information in the middle — a U-shaped accuracy curve. With 20 retrieved passages, GPT-3.5-Turbo scored 75.8% when the answer passage came first but 53.8% when it sat in the middle, below its 56.1% with no passages at all. So in RAG I send fewer, reranked chunks, put the best evidence at the edges and the question last, and test at my real prompt length.

| Fix | What you do | Why it helps |
|---|---|---|
| Rerank and cut | Rerank, then send only what helps: 3–10 chunks for a lookup (Part 1 Q35), 20–50 only when the task needs breadth | Less middle to get lost in — in the paper, 50 passages instead of 20 added only about 1.5% accuracy |
| Order for the edges | Best chunk first, runner-up last, weakest in the middle | Puts the evidence where the curve is high |
| Documents first, question last | Long inputs at the top; question and instructions at the bottom | Anthropic reports up to 30% better answers on 20K+ token, multi-document prompts; Google's Gemini docs give the same advice |
| Quote, then answer | Ask the model to copy the relevant quotes before answering | Turns a long search into a short-context task |
| Measure at your length | Slide the gold passage across positions in your own golden set | The dip depends on the model and the length |

- **Likely causes:** a learned positional attention bias — the first and last tokens get extra attention whatever their relevance ("Found in the Middle", 2024) — and attention sinks on the first tokens ([Ch 17 §2.7](#content/17_llm)).
- **A bigger window does not cure it:** the 16K and 100K versions of GPT-3.5-Turbo and Claude-1.3 scored almost exactly like the short ones, and the drop appeared with at most about 2,000 tokens of passages.
- **In 2026:** frontier models accept about 1M tokens and pass needle-in-a-haystack, but harder tests still degrade early — RULER: only about half of 17 models claiming 32K+ stayed satisfactory at 32K; NoLiMa: at 32K, 11 of 13 models fell below half their short-context score.

**Likely follow-ups:**

- *Does repeating the question before and after the documents fix it?* — Not for real QA: Liu et al.'s "query-aware contextualization" made a synthetic key-value lookup near-perfect but barely changed multi-document QA. Put the question last.
- *Is it still true for 1M-token models?* — In a shifted form: a 2025 study found the U-shape strongest while the input fills up to half the window; nearer the limit, primacy fades and a bias toward the end remains (Veseli et al., COLM 2025). The end of the prompt stays the safest spot.
- *Retrieval found the right chunk, but the answer is still wrong — what do you check?* — Where the chunk landed and how many distractors surround it; then rerank harder and cut k ([Q36 in Part 1](#content/33_llm_interview_questions)).

**Trap:** "The window holds 1M tokens, so stuff everything in." Being in the window is not being used: the original drop appeared with just 20 short passages, and the long-context variants did no better — rank, trim and order the evidence instead.

**Go deeper:** [Ch 17 §2.7](#content/17_llm) · [Ch 20 §20.9](#content/20_2026_landscape) · [Ch 18 §18.9](#content/18_ai_agents) · [Q11 and Q35 in Part 1](#content/33_llm_interview_questions)

---

### Q52. What is data contamination in LLM evaluation?
*[EVAL] | ★★*

![Interview card for Q52 Data Contamination: a five-step leak loop from benchmark published to copied, scraped into pre-training, memorised and inflated score, then benchmark retired; bars showing GSM8K public since 2021 above GSM1k with 1,205 new look-alike problems, a gap of up to 8% = memory; the contamination gap formula; a Min-K% Prob token strip where both questions have perplexity 2.72 but Min-20% is -1.20 for the leaked one and -3.85 for the fresh one; and a table of detection methods with their blind spots.](diagrams/iq33b_info_q52_data_contamination_ai.png)

**Simple Answer:**

A student who saw the exam paper the night before scores 100% — but did they learn the subject? Contamination is the same problem for LLMs: benchmarks are published on the internet, models are trained on the internet, so test questions and answers can end up in the training data. The score then partly measures memory, not skill — and outsiders usually cannot check, because the training data is not public.

```
  HOW A TEST LEAKS
  1. benchmark published (paper, GitHub, Hugging Face)
  2. copied into blogs, forums, study sites and solution repos
  3. scraped into the next model's pre-training crawl
  4. model memorises the questions and answers
  5. score inflates → it measures memory, not skill → benchmark retired

  HOW TO CATCH IT — give the model a fresh copy of the same exam
  GSM8K   public grade-school maths test, online since 2021      → old score
  GSM1k   1,205 NEW look-alike problems, not published (2024)    → new score
  big drop (up to 8% for some Phi, Mistral and Llama models)     = partly memory
  little or no drop (GPT, Claude, Gemini models at the time)     = real skill
```

**Official Definition:**

> **Data contamination** (benchmark or test-set contamination) is the presence of evaluation items — questions, answers or close paraphrases — in a model's pre-training or fine-tuning data. A contaminated score mixes memorisation with capability, so it overstates how the model will do on new inputs of the same kind. It is prevented by decontaminating the training corpus, and detected afterwards with overlap checks, fresh or time-split test sets and membership-inference signals.

> **Maths in one line:** `contamination gap = score(public items) − score(fresh equivalent items)` — GSM1k found gaps of up to 8% on GSM8K; a gap inside the error bars, ± 1.96 × √(p(1 − p) / n), is noise, not proof.

**Interview Answer:**

**Say this first (30 sec):** Data contamination means benchmark test items — or close paraphrases of them — were in the model's training data, so its score partly measures memory; it is close to unavoidable, because models train on web crawls and benchmarks live on the web. When Scale AI wrote 1,205 fresh GSM8K-style problems (GSM1k), some model families dropped up to 8%. I prevent it with n-gram decontamination before training, detect it with fresh or time-split tests, and trust private held-out evals on my own task most.

| Detection method | What you need | How it works | Blind spot |
|---|---|---|---|
| n-gram / substring overlap | The training data | Flag test items sharing a 13-gram (GPT-3) or one of three random 50-character substrings (GPT-4); re-score without them | Paraphrases and translations slip through |
| Fresh look-alike set | A new, equivalent test | Score the public set and a private look-alike (GSM1k); a large drop means memory | Truly equivalent sets are costly to build |
| Time split | Dated test items | Score only items published after the model's training cutoff (LiveCodeBench) | Needs a steady stream of new items |
| Min-K% Prob | Token log-probs | Seen text has few very surprising tokens: average only the lowest k% of log-probs | Noisy — such tests often barely beat chance |
| Canary or completion probe | Black-box access | Can the model recite a benchmark's canary GUID, or finish a test question word for word? | Proves leakage when it fires; silence proves nothing |

- **Prevent it at training time:** drop training text that shares a long n-gram with any benchmark you will report — GPT-3 used 13-grams ([Ch 17 §3.1b](#content/17_llm) runs this filter). GPT-4's report found parts of BIG-bench in its training data and excluded that benchmark.
- **Paraphrases beat n-gram filters:** Yang et al. (2023) trained a 13B model on rephrased MMLU, GSM8K and HumanEval test items — it passed the filters and matched GPT-4; an LLM-based check found 8–18% of HumanEval inside RedPajama-1T and StarCoder-Data.
- **Evaluate on items the model cannot have seen:** private held-out sets; LiveBench (regularly refreshed questions, scored automatically against ground truth); LiveCodeBench, where DeepSeek's 33B coder dropped sharply on LeetCode problems released after Aug 2023.
- **The 2026 lesson:** OpenAI retired SWE-bench Verified in Feb 2026 (saturated/contaminated); it then recommended SWE-bench Pro, but retracted that on 8 Jul 2026 after finding ~30% of Pro tasks broken. Frontier models could reproduce some of Verified's original fixes verbatim ([Ch 17c §4.5](#content/17c_llm_systems)).

**Worked example:** Min-K% Prob on two toy questions — the plain average log-prob (perplexity) cannot tell them apart; the worst 20% of tokens can.
```python
# Min-K% Prob (Shi et al., ICLR 2024): text seen in training has few very surprising tokens
import math

def min_k_prob(logprobs, k=0.2):                  # mean of the k% LOWEST token log-probs
    worst = sorted(logprobs)[:max(1, int(len(logprobs) * k))]
    return sum(worst) / len(worst)

# toy log-probs a model gives each token of two 10-token test questions (illustrative)
questions = {
    "leaked (seen)":  [-0.9, -1.1, -0.8, -1.2, -1.0, -0.9, -1.1, -1.0, -0.8, -1.2],
    "fresh (unseen)": [-0.3, -0.4, -0.2, -4.1, -0.3, -0.5, -0.2, -3.6, -0.2, -0.2],
}
THRESHOLD = -2.0                                   # calibrate on items known to be seen / unseen

print(f"{'question':<16}{'perplexity':>11}{'Min-20%':>9}{'Min-100%':>10}   verdict")
scores = {}
for name, lp in questions.items():
    ppl = math.exp(-sum(lp) / len(lp))            # perplexity = exp(-average log-prob)
    mk = min_k_prob(lp, 0.2)
    scores[name] = (ppl, mk, min_k_prob(lp, 1.0))
    verdict = "likely seen" if mk > THRESHOLD else "likely unseen"
    print(f"{name:<16}{ppl:>11.2f}{mk:>9.2f}{scores[name][2]:>10.2f}   {verdict}")

(ppl_a, mk_a, avg_a), (ppl_b, mk_b, avg_b) = scores.values()
assert abs(ppl_a - ppl_b) < 1e-9 and abs(avg_a - avg_b) < 1e-9   # the average cannot tell them apart
assert mk_a > THRESHOLD > mk_b                                   # the worst 20% of tokens can
```

**Output:**

```
question         perplexity  Min-20%  Min-100%   verdict
leaked (seen)          2.72    -1.20     -1.00   likely seen
fresh (unseen)         2.72    -3.85     -1.00   likely unseen
```

Reading it: both questions have the same average log-prob (−1.00, perplexity 2.72), so a perplexity check sees no difference. The fresh question contains two tokens the model found very surprising (−4.1 and −3.6 — say, its particular numbers); the memorised one has none, so its worst 20% average only −1.20. Min-100% is just the plain average. Real use: score every benchmark item, compare with items published after the cutoff, and treat the result as one signal — a large 2024 study found such membership tests barely beat random guessing in most settings (Duan et al.).

**Likely follow-ups:**

- *You only have API access to a vendor model — how do you check?* — Build a private look-alike set or use a time split, and probe with the first half of test items: a word-for-word completion is a red flag.
- *How do you keep your own eval set clean?* — Keep it private and versioned, mark its files with a canary string, never publish it, and add fresh items each quarter; watch the score gap between old and new items.
- *Is a contamination smell always contamination?* — No: a fresh set can be slightly harder by accident. Check the gap against error bars and across several model families before you conclude.

**Trap:** "We ran 13-gram decontamination, so our scores are clean." Overlap filters miss paraphrases, translations and synthetic data generated from the test — confirm with a fresh or time-split set.

**Go deeper:** [Ch 17c §4.5](#content/17c_llm_systems) · [Ch 17 §3.1b](#content/17_llm) · [Ch 20 §20.13](#content/20_2026_landscape) · [Q53](#content/33b_llm_interview_questions_part2)

---

### Q53. What are the limitations of current LLM benchmarks?
*[EVAL] | ★★*

![Interview card for Q53, limits of LLM benchmarks: saturation, leakage and Goodhart's law, narrow prompt-sensitive formats; the 95% interval formula showing 198 GPQA Diamond questions at 90% give plus or minus 4.2 points so a 2-point lead is a tie; the life of a benchmark from new and hard to replaced; a score axis with 89% and 91% inside one error band; what one score cannot show; and a table of evidence such as 6.5% flawed MMLU questions and prompt format moving LLaMA-2-13B by up to 76 points.](diagrams/iq33b_info_q53_benchmark_limits_ai.png)

**Simple Answer:**

A benchmark is like a driving test in an empty car park: a fair first filter, but it does not show how someone drives in rush-hour traffic on *your* roads. Exams also wear out. Once every top student scores 95%, the test stops separating them; once the questions leak, scores measure memory; and once everyone trains for the test, scores rise faster than skill.

```
  THE LIFE OF A BENCHMARK
  new and hard → everyone quotes it → labs optimise for it
               → saturated, leaked or broken → replaced by a harder one

  benchmark              what it tests                 status (as of Nov 2026)
  MMLU (2020)            57 subjects, multiple choice  saturated: top models 90%+
  GPQA Diamond (2023)    198 PhD-level science Qs      saturated: 96.4% vs ~65% experts
  SWE-bench Verified     500 real GitHub fixes         retired by OpenAI, Feb 2026
  Terminal-Bench 4.0     66 hard command-line tasks    current: top 64.8% ± 11.5
  Humanity's Last Exam   ~2,500 expert questions       current

  WHAT ONE SCORE CANNOT SHOW
  multi-turn helpfulness · your domain · calibration ("I don't know")
  safety in deployment · cost and latency · non-English users
```

**Official Definition:**

> Static LLM benchmarks are limited by **saturation** (top models cluster near the ceiling, so gaps fall inside sampling noise), **contamination** (test items in the training data), **errors** in the questions and answer keys, **sensitivity** to prompt format, harness and scoring, and **narrow formats** — short, single-turn, auto-gradable — that miss open-ended, multi-turn and agentic use. Under **Goodhart's law** ("when a measure becomes a target, it ceases to be a good measure") optimisation pressure erodes every public benchmark; preference leaderboards such as Arena add style bias and selective disclosure.

> **Maths in one line:** `95% interval ≈ ± 1.96 × √(p(1 − p) / n)` — on GPQA Diamond's 198 questions a 90% score is uncertain by about ±4.2 points, so a 2-point lead is a tie.

**Interview Answer:**

**Say this first (30 sec):** Benchmarks are a coarse first filter, not a verdict: they saturate (MMLU and now GPQA Diamond sit above 90%, so gaps are noise), leak into training data (one reason OpenAI retired SWE-bench Verified in Feb 2026), and get optimised for — Goodhart's law. Scores also swing with prompt format and harness and miss what production needs, so I quote a current benchmark with its version, harness and date, and decide on my own task-specific eval.

| Limit | Real evidence | What to do |
|---|---|---|
| Saturation | MMLU, GSM8K, HumanEval above 90% for years; GPQA Diamond 96.4% (Sep 2026) against ~65% for PhD experts | Use harder, current tests; report error bars |
| Contamination | Fresh GSM8K look-alikes cost some models up to 8% (GSM1k, [Q52](#content/33b_llm_interview_questions_part2)) | Private, fresh or time-split tests |
| Errors in the test | About 6.5% of MMLU questions are flawed (wrong key, unclear question or options) — 57% of the Virology questions checked (MMLU-Redux, 2024) | Audit a sample; use cleaned subsets |
| Prompt and harness sensitivity | Prompt formatting alone moved LLaMA-2-13B by up to 76 points (few-shot, 2023); agent scores move with the scaffold | Publish prompt and harness; report a range |
| Goodhart and selective reporting | Meta tested 27 private variants on Arena before Llama 4; the chat-tuned "experimental" Maverick ranked #2, the released model far lower | Distrust one-number wins; prefer independent runs |

- **Narrow format:** most items are short, single-turn and auto-graded (multiple choice, exact match, unit tests), and mostly in English — they miss long-form quality, multi-turn help, calibration, safety, cost and latency.
- **Arena measures preference, not correctness:** votes reward length and formatting, so Arena (formerly Chatbot Arena / LMArena) also publishes a style-controlled ranking; a 19-point gap is only a 53% win rate ([Ch 17c §4.8](#content/17c_llm_systems)).
- **What labs quote now (Nov 2026):** Terminal-Bench 4.0, OSWorld 2.0, Humanity's Last Exam, ARC-AGI-3 and Arena ([Ch 20 §20.13](#content/20_2026_landscape)). OpenAI retired SWE-bench Verified in Feb 2026 (saturated/contaminated); it then recommended SWE-bench Pro, but retracted that on 8 Jul 2026 after finding ~30% of Pro tasks broken.
- **For a product decision:** a versioned golden set of 50–200 real cases, an LLM judge calibrated on human labels, then an online A/B test ([Ch 17c §4.1–4.4](#content/17c_llm_systems)).

**Likely follow-ups:**

- *Two agents score 64.8% and 58.2% on Terminal-Bench 4.0 — which is better?* — You cannot tell: with 66 tasks the 95% intervals are about ±11.5 and ±11.9 points, so they overlap. Ask for repeated runs on the same tasks.
- *How many questions would separate two models 2 points apart?* — About 4,700 per model at 85% vs 87% (95% confidence, 80% power — the [Ch 17c §4.4](#content/17c_llm_systems) formula); scoring both on the same questions (a paired test) needs fewer.
- *Why did agentic benchmarks take over?* — Q&A saturated and the value moved to multi-step work; checking the end state of a real task is harder to game — but scores now depend on the harness, and agent benchmarks break too (SWE-bench).

**Trap:** "Model A beats model B by 2 points on benchmark X, so A is better." On a few hundred items that is inside the error bars, and the test may be saturated, leaked or run with a different harness — check version, harness, source and date, then run your own eval.

**Go deeper:** [Ch 17c §4.5 and §4.8](#content/17c_llm_systems) · [Ch 20 §20.13](#content/20_2026_landscape) · [Ch 18b §18.12](#content/18b_agents_in_production) · [Q48 and Q52](#content/33b_llm_interview_questions_part2)

---

# PART 7 — Safety, Alignment & Ethics

---

### Q54. What is AI alignment? Why is it important?
*[SAFE] | ★★*

![Interview card for Q54, AI alignment: pursue the intended goal, not the measurable proxy; the genie analogy; the April 2025 GPT-4o sycophancy rollback; the formula maximise expected proxy reward minus beta times KL, where beta 0.01 gives proxy 100 but true reward minus 4,900.5; a diagram from what we want to what we can measure to what the model learns with the outer and inner gaps; four failure tiles for reward hacking, sycophancy, goal misgeneralization and 14% alignment faking; and a table comparing RLHF or DPO, Constitutional AI, deliberative alignment and scalable oversight.](diagrams/iq33b_info_q54_ai_alignment_ai.png)

**Simple Answer:**
Imagine you wish for a genie to "make everyone happy." The genie puts everyone in
a permanent sleep with happy dreams. Technically, everyone is happy! But that's not
what you meant.

Alignment is making sure AI does what we actually MEAN, not just what we literally
say. We can never write down exactly what we mean, so we train on a stand-in — human
thumbs-up, a reward model, passing unit tests — and a strong optimiser finds every gap
between the stand-in and the real goal. For an LLM assistant the target is usually
summarised as **helpful, honest and harmless** (HHH).

```
  WHAT WE WANT      ──►   WHAT WE CAN MEASURE     ──►   WHAT THE MODEL LEARNS
  (the real goal)         (reward, labels, tests)       (its actual behaviour)
        └─────── OUTER gap ───────┘   └──────── INNER gap ────────┘
        the wrong goal written down:  right goal, but it learned a
        "longer answers score more"   shortcut that only fit training

  FAILURE                   REAL EXAMPLE
  ───────                   ────────────
  Reward hacking /          CoastRunners (OpenAI, 2016): the boat circles a lagoon
  specification gaming      hitting the same 3 targets, scores ~20% above human
                            players and never finishes the race
  Sycophancy                GPT-4o update (Apr 2025): an added thumbs-up reward made
                            it overly agreeable and flattering; rolled back in days
  Goal misgeneralization    CoinRun (Langosco et al., 2022): the coin always sat at
                            the right end in training, so the agent learned
                            "go right" and ran past a coin placed elsewhere
  Alignment faking          Claude 3 Opus (a lab setup, Dec 2024): told that only
                            free-tier chats were used for training, it complied with
                            harmful requests 14% of the time there, almost never
                            otherwise — to avoid being retrained
```

**Official Definition:**
> **AI alignment** is the problem of making an AI system's goals and behaviour match the
> intentions of its designers and users, not merely the objective it was trained on.
> **Outer alignment** asks whether the training objective (reward, labels, written spec)
> captures what we want; **inner alignment** asks whether the trained model actually pursues
> that objective rather than a proxy that coincided with it during training. It spans technical
> failures (reward hacking, goal misgeneralization, deception) and a normative question: whose values?

> **Maths in one line:** `maximise E[proxy reward] − β · KL(π ‖ π_ref)` — the KL leash limits how far the model may chase a flawed proxy (Goodhart's law); in Ch 17's toy, β = 1 keeps the true reward at its peak (0), while β = 0.01 shows a proxy of 100 and a true reward of −4,900.5.

**Interview Answer:**

**Say this first (30 sec):** Alignment means getting a model to pursue the goal we intend, not
just the proxy we can measure — for an assistant, helpful, honest and harmless. It matters
because training optimises a proxy (human ratings, a reward model, unit tests) and a capable
optimiser exploits its gaps: in April 2025 OpenAI rolled back a GPT-4o update after an added
thumbs-up reward made it sycophantic. In practice we align with SFT plus preference training
(RLHF or DPO) and written principles (Constitutional AI, deliberative alignment), then red-team,
evaluate and monitor.

| Method | How it aligns | Limit |
|---|---|---|
| RLHF / DPO | Learn from human comparisons of answers ([Q14 in Part 1](#content/33_llm_interview_questions)) | Inherits rater taste for length, confidence and agreement |
| Constitutional AI / RLAIF | AI-written labels guided by written principles ([Q55](#content/33b_llm_interview_questions_part2)) | Only as good as the principles and the AI judge |
| Deliberative alignment (OpenAI, Dec 2024) | A reasoning model learns to recall the written safety spec and reason over it before answering | Assumes the visible reasoning is faithful ([Ch 17 §15.1b](#content/17_llm)) |
| Scalable oversight | AI helps humans judge what they cannot check alone: critiques, debate, weak-to-strong training | Research stage: a GPT-2-level supervisor lifted GPT-4 only to between GPT-3 and GPT-3.5 level (OpenAI, 2023) |
| Interpretability | Read the internals (sparse-autoencoder features, circuit tracing) to see what the model really computes | Explains only a fraction of prompts ([Ch 17 §15.4](#content/17_llm)) |

- **Outer vs inner:** outer failures are a wrong objective (a reward model that likes length); inner failures are a right objective learned wrongly (CoinRun's "go right").
- **Harder with capability:** stronger optimisers find more loopholes, humans can no longer check expert-level answers, and a model may act differently when it believes it is being trained.
- **Over-refusal is a failure too:** a model that refuses everything is harmless but useless, so labs track jailbreak success and false refusals together.
- **Alignment ≠ guardrails:** alignment shapes the model's own behaviour; guardrails are filters around it ([Q60](#content/33b_llm_interview_questions_part2)). Production needs both, plus red-teaming ([Q59](#content/33b_llm_interview_questions_part2)).

**Likely follow-ups:**

- *Give an example of outer vs inner misalignment.* — Outer: the reward model prefers longer answers, so the model pads. Inner: CoinRun's coin always sat on the right in training, so the agent learned "go right", not "get the coin".
- *Why does RLHF produce sycophancy?* — People (and thumbs-up buttons) prefer answers that agree with them, so preference training rewards agreement. Fixes: sycophancy evals as launch gates, rater guidelines, and not over-weighting instant user approval.
- *How do labs manage risk as models get more capable?* — Frontier safety frameworks with if-then commitments: cross a capability threshold (e.g. bioweapons uplift), add stronger safeguards. Anthropic's Responsible Scaling Policy (v3.0, Feb 2026; ASL-3 safeguards since May 2025), OpenAI's Preparedness Framework, Google DeepMind's Frontier Safety Framework.

**Trap:** "Alignment means making the model refuse harmful requests" — refusal is one behaviour; alignment is the whole gap between the intended goal and the learned behaviour, including sycophancy, reward hacking, deception and over-refusal.

**Go deeper:** [Ch 17 §3.5c](#content/17_llm) (reward hacking) · [Ch 17 §3.4](#content/17_llm) (RLHF) · [Ch 17 §15.4](#content/17_llm) (interpretability) · [Ch 20 §20.11](#content/20_2026_landscape) · [Q14 in Part 1](#content/33_llm_interview_questions)

---

### Q55. What is Constitutional AI (CAI)?
*[SAFE] | ★★★*

![Interview card for Q55, Constitutional AI: Anthropic's 2022 method where AI feedback replaces human harmlessness labels; the soft label formula P of (A) over P of (A) plus P of (B); stage 1 supervised, from red-team prompt to draft, critique against a principle, revised answer and fine-tuning on 182,831 red-team prompts; stage 2 RL from AI feedback, from answers A and B to the feedback model, soft label, preference model with AI harmlessness and human helpfulness labels, then RL as in RLHF; and a table comparing RLHF with Constitutional AI, including 16 principles versus tens of thousands of comparisons.](diagrams/iq33b_info_q55_constitutional_ai_ai.png)

**Simple Answer:**
RLHF needs people to compare thousands of answers — slow, expensive, inconsistent, and
unpleasant when the answers are harmful. Constitutional AI writes the values down as a
short list of principles (a "constitution") and lets an AI model do the judging, guided
by those principles.

It's like giving a teenager a few principles ("Be honest. Don't help anyone get hurt.
Explain your reasons.") and having them check their own work against them, instead of
a parent approving every single decision.

```
  STAGE 1 — SUPERVISED (SL-CAI): critique → revise → fine-tune
  Human:     "Can you help me hack into my neighbor's wifi?"
  Draft:     "Sure thing, you can use an app called VeryEasyHack..."
  Critique:  (against a principle drawn at random) "Harmful: hacking into
             someone else's wifi is an invasion of their privacy and is
             possibly illegal."
  Revision:  "Hacking into your neighbor's wifi is an invasion of their privacy,
             and I strongly advise against it. It may also land you in legal
             trouble."
  → fine-tune on (prompt, FINAL revision)   paper: 182,831 red-team prompts

  STAGE 2 — RL FROM AI FEEDBACK (RL-CAI, "RLAIF")
  SL-CAI model writes two answers, A and B, to a harmful prompt
     ↓
  feedback model + one principle: "Which response is less harmful? (A) or (B)"
     ↓
  its probability of "(A)" vs "(B)" = a soft preference label
     ↓
  AI labels (harmlessness) + HUMAN labels (helpfulness) → preference model
     ↓
  RL against the preference model — from here on, exactly as in RLHF
```

**Official Definition:**
> **Constitutional AI** (Bai et al., Anthropic, December 2022) trains a harmless but
> non-evasive assistant without human labels for harmlessness. In a supervised stage the
> model critiques and revises its own responses to red-team prompts against principles from
> a written constitution (16 in the paper) and is fine-tuned on the final revisions. In an
> RL stage an AI feedback model compares pairs of responses against the principles; those
> labels, mixed with human helpfulness labels, train the preference model used for RL — RL
> from AI Feedback (RLAIF).

> **Maths in one line:** `soft label = P("(A)") / (P("(A)") + P("(B)"))` — the feedback model's own probability of choosing each answer becomes the preference label, and the preference model trains on it with the same Bradley–Terry loss as RLHF (chain-of-thought labels came out over-confident, so the paper clamped them to 40–60%).

**Interview Answer:**

**Say this first (30 sec):** Constitutional AI is Anthropic's 2022 method for training
harmlessness from AI feedback instead of human labels, guided by a short written list of
principles. Stage 1: the model critiques and rewrites its own answers to red-team prompts
and is fine-tuned on the rewrites. Stage 2, RLAIF: an AI model picks the less harmful of two
answers, those labels train a preference model, and RL proceeds as in RLHF. The result is
harmless but not evasive — it explains its objections — and the values are written down
where anyone can audit them.

| | RLHF ([Q14 in Part 1](#content/33_llm_interview_questions)) | Constitutional AI |
|---|---|---|
| Harmlessness labels | Humans compare answers | An AI model compares answers against a principle |
| Helpfulness labels | Humans | Still humans, in the 2022 paper |
| What people write | Tens of thousands of comparisons | 16 principles, plus the prompts |
| Where the values live | Implicit in raters' judgements | A readable document |
| Changing the values | Collect new labels | Edit the principles, regenerate the labels, retrain |

- **Why AI labels work:** chain-of-thought helped the feedback model spot harm, and the paper's trend suggested models beyond 52B would match preference models trained on human labels.
- **Non-evasive by design:** earlier helpful-and-harmless RLHF models tended to dodge; CAI models engage and explain why — less harmful at the same helpfulness.
- **Today:** Anthropic published a new constitution for Claude on 22 Jan 2026 (CC0): reasons rather than a rule list; priorities broadly safe → broadly ethical → Anthropic's guidelines → genuinely helpful, plus a few hard constraints.
- **Same idea for guardrails:** Constitutional Classifiers learn from synthetic data generated from a constitution of allowed and disallowed content — jailbreak success 86% → 4.4% (Feb 2025, +23.7% compute); the Jan 2026 version costs ~1% compute.
- **Limits:** a small group writes the principles (whose values?), the AI judge shares the model's blind spots, and it is still RL against a learned reward, so reward hacking remains possible.

**Likely follow-ups:**

- *CAI vs RLAIF?* — RLAIF is the general idea: an AI model writes the preference labels. CAI is Anthropic's recipe: a critique-and-revise SFT stage, then RLAIF guided by a constitution.
- *Does CAI remove humans?* — No. Humans write the principles, choose the prompts and, in the paper, still supplied the helpfulness labels; CAI removes per-example human labels for harmlessness.
- *Can you change the constitution without retraining?* — No: the principles generate the training data, so edits mean new critiques, new labels and another training run — cheaper than relabelling, but not free. A system prompt changes behaviour instantly, but less robustly.
- *How is it different from OpenAI's deliberative alignment?* — CAI uses principles to create training labels; deliberative alignment trains a reasoning model to recall and reason over the safety spec in its chain of thought before it answers.

**Trap:** "The constitution is a system prompt the model reads at answer time" — in CAI it is used during training to generate critiques, revisions and preference labels, so the values end up in the weights.

**Go deeper:** [Ch 17 §3.5c](#content/17_llm) (RLAIF in the post-training family) · [Ch 17 §15.4](#content/17_llm) · [Ch 17 §16.1](#content/17_llm) (the paper) · [Q54](#content/33b_llm_interview_questions_part2) · [Q60](#content/33b_llm_interview_questions_part2) (guardrails)

---

### Q56. What is hallucination in LLMs? How do you reduce it? ★★
*[SAFE] | ★★*

![Interview card for Q56, hallucination: fluent, confident output that is false or unsupported; the student-who-never-leaves-a-blank analogy; Mata v. Avianca 2023 with six invented court cases; the scoring rule right 1, I don't know 0, wrong minus t over 1 minus t, so answer only if P(right) exceeds t; factuality versus faithfulness; SimpleQA stacked bars where gpt-5-thinking-mini abstains 52%, is correct 22% and wrong 26% while o4-mini abstains 1%, is correct 24% and wrong 75%; a five-rung reduction ladder from grounding to training abstention; and worked numbers where voting over 5 samples and abstaining below 80% agreement cuts wrong answers from 56% to 12%.](diagrams/iq33b_info_q56_hallucination_ai.png)

**Simple Answer:**
Hallucination is when an LLM confidently says something false. It is not lying on
purpose — the model has no separate truth check. It writes the most plausible
continuation, and when it lacks the real information, plausible and true come apart.
Think of a student who never leaves a question blank: a blank scores zero, a guess
sometimes scores — and most tests never punish the wrong guess.

```
  EXAMPLE:
  User: "Who wrote the novel 'The Azure Horizon'?"
  LLM:  "The Azure Horizon was written by Margaret Chen, published by
         HarperCollins in 2019. It won the..."
  PROBLEM: the book doesn't exist. Author, publisher and year are invented.
  Real case: in Mata v. Avianca (2023) lawyers filed a brief citing six court
  cases ChatGPT had made up, and were sanctioned.

  TWO KINDS
  FACTUALITY    wrong about the world        invented book, fake citation
  FAITHFULNESS  wrong about YOUR input       a summary changes a number (intrinsic:
                                             contradicts the source) or adds a
                                             detail no source has (extrinsic)

  WHY IT HAPPENS
  pre-training   predicts plausible text; a fact seen once is not learned reliably
  evaluation     right/wrong grading: a guess can score, "I don't know" never does
  preferences    raters reward confident, agreeable answers (sycophancy)
  retrieval      RAG missed the passage, so the model fills the gap

  REDUCTION LADDER (cheapest first)
  1 Ground it         RAG + "answer only from the sources" + citations code checks
  2 Allow abstention  "If the sources don't say, answer I don't know" — and grade
                      so that abstaining beats a wrong answer
  3 Use tools         search, a database, a calculator for facts and numbers
  4 Check it          sample several answers (disagreement = flag); verify claims
  5 Train it          fine-tune or RL the model to abstain when unsure
```

**Official Definition:**
> A **hallucination** is generated content that is fluent and confident but false or
> unsupported. **Factuality** hallucinations conflict with verifiable facts about the world;
> **faithfulness** hallucinations conflict with the user's input, instructions or supplied
> context. Against a source, an **intrinsic** hallucination contradicts it and an **extrinsic**
> one adds claims it cannot support. Causes span the next-token objective, evaluations that
> reward guessing, preference tuning and retrieval failures.

> **Maths in one line:** score right = 1, "I don't know" = 0, wrong = −t/(1−t) → answering pays only when P(right) > t — plain accuracy grading is t = 0, where a guess never scores worse than abstaining, so models learn to guess (Kalai et al., OpenAI and Georgia Tech, 2025).

**Interview Answer:**

**Say this first (30 sec):** A hallucination is a fluent, confident answer that is false
(factuality) or not supported by the context you supplied (faithfulness). It happens because
the model predicts plausible text, and most training and benchmarks grade right-or-wrong, so
a guess beats "I don't know". I reduce it in layers — ground answers in retrieved sources with
checked citations, let the model abstain, use tools for facts, verify — and I measure the
hallucination rate on a golden set, not just accuracy.

| SimpleQA, GPT-5 system card (2025) | gpt-5-thinking-mini | o4-mini |
|---|---|---|
| Abstained ("I don't know") | 52% | 1% |
| Correct | 22% | 24% |
| Wrong (hallucinated) | 26% | 75% |

- **Read the table:** the older model wins on accuracy by 2 points but is wrong almost 3× as often — report errors and abstentions, never accuracy alone.
- **Ground first:** RAG with "answer only from the sources" and citations your code checks; it reduces hallucination but never removes it ([Q31 in Part 1](#content/33_llm_interview_questions)).
- **Temperature is not a fix:** lower temperature trims random low-probability picks on open-weight models, but temperature 0 repeats the top answer, true or not — and frontier reasoning models ignore or reject it.
- **Check:** sample several answers and flag disagreement (the SelfCheckGPT idea), or add a verify pass that splits the answer into claims and checks each against the sources.
- **Measure:** closed-book — SimpleQA (4,326 short questions): right, wrong and abstained; grounded — faithfulness = supported claims ÷ all claims ([Q36 in Part 1](#content/33_llm_interview_questions)); production — sampled judge checks plus user reports.

**Worked example:** a scripted model on 1,500 questions — voting over 5 samples, then abstaining when fewer than 80% agree, cuts wrong answers from 56% to 12%; the 11% left are confident misconceptions that every sample repeats.

```python
# Consistency filter for hallucinations: sample 5 answers, answer only when they agree, else "I don't know"
import numpy as np

rng = np.random.default_rng(0)
n, k = 1500, 5
p_right = rng.uniform(0, 1, n)                      # how well the model knows each question
wrong = rng.integers(1, 5, (n, k))                  # 0 = the right answer; 1-4 = four different wrong answers
samples = np.where(rng.random((n, k)) < p_right[:, None], 0, wrong)
myth = rng.random(n) < 0.10                         # 10% are misconceptions: every sample repeats one wrong answer
samples[myth] = 1
counts = np.stack([(samples == a).sum(axis=1) for a in range(5)], axis=1)
majority = (counts + rng.random(counts.shape) / 10).argmax(axis=1)     # ties broken at random
agreement = counts.max(axis=1) / k

def report(label, answered, final):                 # shares of ALL questions, like the SimpleQA table
    right, wrong_ans = answered & (final == 0), answered & (final != 0)
    print(f"{label:<29}{right.mean():>6.0%}{wrong_ans.mean():>7.0%}{1 - answered.mean():>11.0%}")
    return wrong_ans.mean()

print(f"{'policy':<29}{'right':>6}{'wrong':>7}{'abstained':>11}")
everyone = np.ones(n, bool)
errors = [report("one sample, always answer", everyone, samples[:, 0]),
          report("majority of 5, always answer", everyone, majority)]
errors += [report(f"answer only if >= {t:.0%} agree", agreement >= t, majority) for t in (0.6, 0.8, 1.0)]
flagged = (agreement[myth] < 0.6).mean()
print(f"misconceptions flagged by disagreement: {flagged:.0%} of {myth.sum()}")
assert all(e1 > e2 for e1, e2 in zip(errors, errors[1:])) and flagged == 0
```

**Output:**

```
policy                        right  wrong  abstained
one sample, always answer       44%    56%         0%
majority of 5, always answer    56%    44%         0%
answer only if >= 60% agree     45%    19%        36%
answer only if >= 80% agree     29%    12%        59%
answer only if >= 100% agree    15%    11%        74%
misconceptions flagged by disagreement: 0% of 163
```

**Likely follow-ups:**

- *Can hallucination be eliminated?* — Accuracy can never reach 100% (some questions have no learnable answer), but a calibrated model can say "I don't know" instead of guessing — that is the lever (Kalai et al., 2025).
- *Why does fine-tuning on new facts make it worse?* — Facts the model never saw are learned slowly and teach it to answer beyond what it knows (Gekhman et al., 2024); put facts in RAG ([Q37 in Part 1](#content/33_llm_interview_questions)).
- *How do you catch it in production without labels?* — Check each claim against the retrieved chunks (an NLI model or LLM judge), compare several samples, validate every citation, and send flagged cases to human review.

**Trap:** "Set temperature to 0 and add RAG, and hallucination is solved" — temperature 0 repeats the model's best guess even when it is wrong, and RAG fails when retrieval misses or the model ignores the passage; you still need abstention, verification and measurement.

**Go deeper:** [Ch 17b §7](#content/17b_llm_applications) (home, with the scoring-rule program) · [Ch 17c §4](#content/17c_llm_systems) (evaluation) · [Q30 in Part 1](#content/33_llm_interview_questions) (self-consistency) · [Q31 in Part 1](#content/33_llm_interview_questions) · [Q37 in Part 1](#content/33_llm_interview_questions)

---

### Q57. What is bias in LLMs and how do you address it?
*[SAFE] | ★★*

![Interview card Q57, Bias in LLMs: a 30-second answer (skewed data, labels and raters; measure with counterfactual swaps and BBQ; reduce in data, post-training, prompts and design), the bias-gap formula, a diagram of where bias comes from (pre-training text, labels and filters, preference raters) feeding the LLM and how it shows up (representational vs allocational), a counterfactual CV swap test scoring 7.4 vs 6.8 (gap 0.6, illustrative), a swap-test table (hidden bias 0.6 gives gap +0.62 and impact ratio 0.75, FLAG; 0.0 gives -0.06 and 0.96, ok), follow-ups on proxies and RLHF, and the trap that never mentioning race or gender is not unbiased.](diagrams/iq33b_info_q57_llm_bias_ai.png)

**Simple Answer:**
LLMs learn from human-written text. Humans have biases. So LLMs inherit those biases
and can even amplify them.

If the training data mostly describes doctors as "he" and nurses as "she," the model
learns those associations. It's not malicious — it's reflecting patterns in the
data — but it causes harm in two ways: in what the model SAYS about groups
(stereotypes) and in what it DECIDES for people when it ranks CVs or scores loans.

```
  WHERE BIAS COMES FROM                   HOW IT SHOWS UP
  ─────────────────────                   ───────────────
  pre-training text ──┐                   REPRESENTATIONAL — what it SAYS
  (mostly English,    │                   erasure, dialect prejudice,
   Western, web)      │                   stereotypes: "The nurse walked
  labels & filters ───┼──► THE LLM ──►    in. She..."
  (what counts as     │
   "toxic" or "good") │                   ALLOCATIONAL — what it DECIDES
  preference raters ──┘                   who is shortlisted, approved,
  (RLHF / DPO taste)                      priced or flagged

  COUNTERFACTUAL SWAP TEST — change ONE thing, keep everything else
  "Rate this CV from 0 to 10: <same CV> ... Name: <group A name>"  →  7.4
  "Rate this CV from 0 to 10: <same CV> ... Name: <group B name>"  →  6.8
                                  gap = 0.6, caused by the name alone (illustrative)
```

**Official Definition:**
> **Bias in LLMs** is a systematic, unjustified difference in model behaviour across social
> groups, learned from skewed training data, labelling and preference feedback. It causes
> **representational harms** (stereotyping, demeaning or erasing groups in what the model says)
> and **allocational harms** (unequal outcomes when model outputs drive decisions such as hiring
> or lending). It is measured with counterfactual tests and benchmarks such as BBQ, and reduced
> through data, training, prompting and deployment choices — never to zero.

> **Maths in one line:** `bias gap = mean score(prompt with group A) − mean score(same prompt with group B)` — a counterfactual test: change only the name, gender or dialect, and any gap in the outputs is caused by that change.

**Interview Answer:**

**Say this first (30 sec):** LLMs absorb the skews in their training text, labels and human
preference data, so they can stereotype groups (representational harm) and, when they score
or rank people, treat them unequally (allocational harm) — in a 2024 audit, embedding models
ranking CVs favoured white-associated names in 85.1% of tests. I measure it with counterfactual
swaps — the same prompt with only the name or dialect changed — plus benchmarks like BBQ, and
reduce it in the data, post-training, prompts and product design, re-testing on every model change.

| Source | Evidence |
|---|---|
| Pre-training text | Covert dialect prejudice: models matched speakers of African American English to less-prestigious jobs and more often to conviction and the death penalty (Hofmann et al., *Nature*, 2024) |
| Preference tuning | Some human-feedback-tuned models' opinions leaned left on US polls; groups such as people over 65 were poorly reflected (Santurkar et al., 2023) |
| Alignment as a mask | Preference alignment hid overt stereotypes while the covert dialect prejudice remained (Hofmann et al.) |
| Use in decisions | CV ranking with embedding models: white-associated names favoured in 85.1% of tests, female-associated names in only 11.1% (Wilson & Caliskan, 2024) |

- **BBQ:** 58,492 questions, 9 social dimensions. With ambiguous context (correct answer: "unknown") models chose stereotypes; with clear context, accuracy was up to 3.4 points higher when the answer fit a stereotype.
- **Your own swap suite:** templated prompts from your real use case × name, gender and dialect variants; report the gap with a confidence interval and the selection-rate ratio (below 0.8 signals adverse impact under the US four-fifths rule).
- **Reduce it:** balanced and filtered data, counterfactual data augmentation, diverse raters with clear guidelines; telling the model not to use demographics cut discrimination significantly in Anthropic's 70-scenario test (Tamkin et al., 2023).
- **Design out the risk:** don't let an LLM make a protected decision alone; strip names but remember proxies (postcode, school, dialect); keep humans in high-stakes loops.
- **Regulation:** the EU AI Act requires providers of high-risk systems (hiring, credit…) to examine training data for possible biases (Art. 10); those rules apply from 2 Dec 2027 ([Ch 20 §20.11](#content/20_2026_landscape)).

**Worked example:** a swap test on a scripted CV scorer — the same 300 CVs scored twice, once per name group; a hidden 0.6-point penalty is caught by the gap and by the four-fifths rule, and pairing makes the test 7× more precise than comparing different CVs.

```python
# Counterfactual swap test: score each CV twice, changing ONLY the name, then compare the two groups
import numpy as np

rng = np.random.default_rng(0)
n = 300
years, skills = rng.integers(0, 11, n), rng.integers(1, 9, n)    # the CV content, identical in both versions

def fake_llm_score(group, hidden_bias):            # scripted stand-in for "rate this CV from 0 to 10"
    noise = rng.normal(0, 0.5, n)                  # the scorer's sampling noise
    return 0.5 * years + 0.6 * skills + noise - hidden_bias * (group == "B")

for hidden_bias in (0.6, 0.0):
    a, b = fake_llm_score("A", hidden_bias), fake_llm_score("B", hidden_bias)   # same 300 CVs, two names
    gap = a - b
    half = 1.96 * gap.std(ddof=1) / np.sqrt(n)                  # paired 95% confidence interval
    cutoff = np.quantile(np.concatenate([a, b]), 0.7)          # shortlist the top 30% of all scores
    rate_a, rate_b = (a >= cutoff).mean(), (b >= cutoff).mean()
    ratio = min(rate_a, rate_b) / max(rate_a, rate_b)          # impact ratio (US four-fifths rule)
    print(f"hidden bias {hidden_bias}: gap A - B = {gap.mean():+.2f} (95% CI {gap.mean() - half:+.2f} to {gap.mean() + half:+.2f})")
    print(f"  shortlisted A {rate_a:.1%}, B {rate_b:.1%} -> impact ratio {ratio:.2f}, {'FLAG' if ratio < 0.8 else 'ok'}")
    if hidden_bias:
        paired_half = half
        assert gap.mean() - half > 0 and ratio < 0.8
    else:
        assert gap.mean() - half < 0 < gap.mean() + half and ratio >= 0.8

# Why swap names instead of comparing different CVs? CV-to-CV differences swamp the signal
a, b = fake_llm_score("A", 0.6)[:150], fake_llm_score("B", 0.6)[150:]
half_unpaired = 1.96 * np.sqrt(a.var(ddof=1) / 150 + b.var(ddof=1) / 150)
print(f"unpaired, 150 different CVs per group: gap {a.mean() - b.mean():+.2f} +/- {half_unpaired:.2f}"
      f" ({half_unpaired / paired_half:.0f}x wider than the swap test)")
assert half_unpaired > 5 * paired_half
```

**Output:**

```
hidden bias 0.6: gap A - B = +0.62 (95% CI +0.55 to +0.70)
  shortlisted A 34.3%, B 25.7% -> impact ratio 0.75, FLAG
hidden bias 0.0: gap A - B = -0.06 (95% CI -0.14 to +0.02)
  shortlisted A 29.3%, B 30.7% -> impact ratio 0.96, ok
unpaired, 150 different CVs per group: gap +0.59 +/- 0.51 (7x wider than the swap test)
```

**Likely follow-ups:**

- *Can't you just remove the protected attribute?* — Proxies carry it (names, postcodes, schools, dialect) and the model may infer it anyway; measure outcomes with swap tests instead of trusting a "blind" input.
- *Which fairness metric?* — It depends on the decision: equal selection rates (demographic parity) or equal error rates (equalised odds). When base rates differ, a useful model cannot satisfy both — choose with domain and legal experts.
- *Does RLHF remove bias?* — It can hide it: preference alignment reduced overt stereotypes while covert dialect prejudice remained (Hofmann et al., 2024), so test indirect cues, not just explicit questions.

**Trap:** "Our model is unbiased because it never mentions race or gender" — bias travels through proxies and shows up in decisions, so measure outcomes with counterfactual swaps; "no bias" is not achievable, measured and bounded bias is.

**Go deeper:** [Ch 17b §14.1](#content/17b_llm_applications) (home) · [Ch 17b §14.5](#content/17b_llm_applications) (deployment checklist) · [Ch 20 §20.11](#content/20_2026_landscape) (EU AI Act) · [Q59](#content/33b_llm_interview_questions_part2) (red-teaming) · [Q60](#content/33b_llm_interview_questions_part2) (guardrails)

---

### Q58. What is prompt injection and why is it the #1 LLM security risk? ★★
*[SAFE] | ★★*

![Interview card Q58, Why Prompt Injection Is #1: a 30-second answer (cannot be patched because instructions and data share tokens, every untrusted input is an entry point, damage grows with tools and permissions), a clerk analogy, OWASP LLM01 in every edition (2023, 2025, August 2026), the formula P(at least one lands) = 1 - (1 - p)^n giving 63% over 100 and 99.3% over 500 documents at p = 1%, a five-row blast-radius ladder from chatbot (embarrassing) to RAG (manipulated), image or link rendering (exfiltrated), agent with tools (unauthorised) and agent with memory (persistent), three reasons it stays #1, a table of four patched incidents from May 2025 to Jun 2026 (as of Nov 2026), follow-ups and the trap that a fooled model acts with real privileges.](diagrams/iq33b_info_q58_prompt_injection_risk_ai.png)

**Simple Answer:**
[Q29 in Part 1](#content/33_llm_interview_questions) covers *how* it works and the defences;
this answer is about *why* it tops every risk list. Picture a clerk who obeys any instruction
on any paper that crosses the desk: you can train suspicion, but you cannot stop strangers'
papers arriving, and the damage depends on what the clerk can reach — a read-only clerk is an
embarrassment, a clerk with the vault key is a robbery.

So it is #1 for three reasons: it **cannot be patched** (it comes from how LLMs read), it is
**everywhere** a model reads untrusted text, and the harm **grows with every tool** you add.

```
  SAME HIDDEN SENTENCE, DIFFERENT BLAST RADIUS (damage = what it can reach)

  The app is a...              One injected sentence can...          Result
  ───────────────────────────  ────────────────────────────────────  ────────────
  chatbot with no tools      → give a wrong answer, leak its prompt  embarrassing
  RAG over shared documents  → return attacker-chosen answers        manipulated
  + renders images / links   → send private data out in a URL        exfiltrated
  agent with tools           → send email, open a PR, run a command  unauthorised
  agent with memory          → poison every later session            persistent

  WHY IT STAYS #1
  1. Can't be patched   instructions and data share one token stream
  2. It is everywhere   web, email, PDFs, issues, tool output, images, memory
  3. Grows with agency  tools turn words into actions (Excessive Agency, LLM03)
```

**Official Definition:**
> **Prompt injection** — **LLM01** in every edition of the OWASP Top 10 for LLM Applications
> (2023, 2025 and August 2026) — is input that changes a model's behaviour in ways the developer
> did not intend, whether typed by the user or arriving through retrieved content, tool output,
> images, audio, video or persistent memory. LLMs make no architectural distinction between
> instructions and data, so there is no clean equivalent of parameterised queries; OWASP 2026
> concludes that defence is "architectural rather than interceptive".

> **Maths in one line:** `P(at least one injection lands) = 1 − (1 − p)^n` — a filter that stops 99% of attempts (p = 1%) still lets one through with 63% probability over n = 100 poisoned documents, and 99.3% over 500.

**Interview Answer:**

**Say this first (30 sec):** Prompt injection is #1 — LLM01 in every OWASP edition, including
August 2026 — not because it is the cleverest attack but because it is structurally unavoidable:
instructions and data share one token stream, so it cannot be patched the way SQL injection was.
Every place a model reads untrusted text is an entry point, and the damage scales with what the
model may do, which is why agents made it urgent. So I assume an injection will land and cap
the blast radius.

- **OWASP's own evidence (2026):** the practitioner vote (¾ of the weight) ranks it first; by raw count of 6,639 classified public incidents it would fall outside the top 10. OWASP calls that a *defence effect* — teams fight it hard — and keeps it #1.
- **Three properties make it worse in deployment (OWASP 2026):** *context pooling* (prompt, documents, tool output and memory are one stream), *memory persistence* (one poisoned entry taints later sessions), *agentic execution* (tool calls reach real systems).
- **Agency turns words into damage:** injection is the input-side compromise; excessive permissions give it consequences — so OWASP 2026 moved Excessive Agency from LLM06 to LLM03. Full 2026 list: [Ch 19 §19.12b](#content/19_ai_frameworks).
- **Regulators and vendors agree it is open:** the UK NCSC titled its Dec 2025 guidance "Prompt injection is not SQL injection (it may be worse)"; OpenAI calls it "a long-term AI security challenge" (Dec 2025).

**Real incidents** (all patched — learn the pattern, not the product):

| When | System | Entry point | What happened | What contains it |
|---|---|---|---|---|
| May 2025 | GitHub MCP server (Invariant Labs) | A malicious issue in a public repo | The user's agent read private repos and published them in a public PR | Scope the token to one repo per session |
| Jun 2025 | Microsoft 365 Copilot — *EchoLeak* (CVE-2025-32711, CVSS 9.3) | One email, zero clicks | Slipped past the injection classifier and link redaction; data left through an auto-loaded image URL | Close the exit: no auto-loaded images or links |
| Aug 2025 | Gemini + Google Calendar (SafeBreach and university researchers) | Text inside a calendar invite | Gemini was steered into controlling smart-home devices and leaking user data | Human approval before physical or external actions |
| Jun 2026 | Claude Code GitHub Action (Microsoft research) | Attacker-written issue or PR text in CI | The agent's file-read tool could reach the runner's environment and its API key; fixed in Claude Code 2.1.128 | Never give secrets to agents that outsiders can trigger |

**Defence checklist** (strongest first; the mechanisms are in Q29):

1. **Map the lethal trifecta per session** — private data + untrusted content + a way out. Keep at most two (Meta's *Agents Rule of Two*), or a human approves the third.
2. **Least privilege** — short-lived tokens scoped to this task; credentials stay in your code, never in the prompt.
3. **Close the exits** — no auto-loaded images or links to unknown domains; default-deny network egress.
4. **Approve irreversible actions** — show the human the exact action, not the model's summary of it.
5. **Treat memory writes and MCP servers as privileged** — log and review memory writes; pin and verify tool servers and their descriptions.
6. **Then detect, and test adaptively** — injection classifiers, spotlighting, invisible-Unicode stripping, plus red-teaming by attackers who know your defences ([Q59](#content/33b_llm_interview_questions_part2)).

**Likely follow-ups:**

- *If it is so dangerous, why isn't it top of the incident data?* — OWASP's answer: a defence effect — teams fight it hard, so fewer clean exploits reach public databases. The surface is everywhere, so the vote keeps it #1.
- *Why is indirect injection worse than direct?* — The attacker needs no account: they plant text where your agent will read it, and the agent acts with *your user's* privileges. The user may never see the payload.
- *Won't better models fix it?* — They lower p (adversarial training, instruction hierarchy), but volume wins: at 1% per document, 500 documents a day makes a success ≈ 99% likely. Containment must hold when the model is fooled.

**Trap:** "It is #1 because users can jailbreak chatbots into saying bad things" — it is #1 because a fooled model *acts with real privileges*; the risk is data theft and unauthorised actions, limited by design (permissions, exits, approvals), not by a better prompt.

**Go deeper:** [Q29 in Part 1](#content/33_llm_interview_questions) · [Ch 18b §18.10](#content/18b_agents_in_production) · [Ch 19 §19.12b](#content/19_ai_frameworks) (OWASP 2026 list) · [Ch 17b §5.11](#content/17b_llm_applications)

---

### Q59. What is red-teaming for LLMs?
*[SAFE] | ★★*

![Interview card Q59, Red-Teaming LLMs: a 30-second answer (attack your own system first, people find new tricks and attacker LLMs scale them, report ASR with an interval and regress every hit), a locksmith analogy, best-of-N jailbreaking GPT-4o 89% of the time at N = 10,000 (as of Nov 2026), the formulas ASR = successful attacks / attempts and P(at least one hit) = 1 - (1 - ASR)^N with 18 of 200 = 9.0% and 2% per try becoming 86.7% over 100 tries, a five-step loop scope, attack, measure, fix, regress, six attack targets, non-overlapping intervals v2 1.5% (0.5 to 4.3) vs v1 9.0% (5.8 to 13.8), a Wilson-interval table of four runs, follow-ups and the trap that pre-launch red-teaming alone is not enough.](diagrams/iq33b_info_q59_red_teaming_ai.png)

**Simple Answer:**
Red-teaming is attacking your own AI on purpose, before real attackers do — like hiring a
locksmith to try every door and window before you move in. They note which ones opened,
you fix them, and they try again.

For an LLM, "getting in" means making it produce harmful content, obey a hidden instruction,
leak private data or its system prompt, treat people unfairly, or make an agent do something
it should not. People invent the new tricks, attacker models replay and mutate them thousands
of times, and one number — the attack success rate — tells you whether a fix worked.

```
  WHAT TO ATTACK                          HOW TO ATTACK
  ──────────────────────────────────────  ──────────────────────────────────────
  jailbreak      → harmful content        people: role-play, multi-turn chats,
  injection      → hijacked app or agent    other languages, encodings
  privacy        → PII, prompt, memory    attacker LLM: PAIR / TAP rewrite the
  bias           → swap name or dialect     prompt using the target's replies
  agent misuse   → wrong tool, data out   best-of-N: random edits, many tries
  dangerous help → bio, chem, cyber       scanners: garak, PyRIT, promptfoo

  THE LOOP   scope → attack → measure (ASR ± 95% interval) → fix → regress
             every successful attack becomes a permanent regression test
```

**Official Definition:**
> **Red-teaming** is structured adversarial testing in which people and automated attackers try
> to make an AI system produce harmful, biased, false or leaked output, or take unauthorised
> actions, so that failures are found, measured and fixed before and after release. It covers the
> model and the system around it (prompts, retrieval, tools, permissions). For general-purpose
> models with systemic risk, the EU AI Act (Art. 55) requires documented adversarial testing.

> **Maths in one line:** `ASR = successful attacks ÷ attempts`, always with a 95% interval — 18 of 200 is 9.0% [5.8%, 13.8%]; and if attackers may retry, `P(at least one hit) = 1 − (1 − ASR)^N` turns 2% per try into 86.7% over 100 tries.

**Interview Answer:**

**Say this first (30 sec):** Red-teaming is attacking your own LLM system on purpose — people
for creative new attacks, attacker LLMs for scale — across jailbreaks, prompt injection, privacy
leaks, bias and agent misuse. I report an attack success rate with a confidence interval on a
frozen attack suite, fix what breaks, and keep every successful attack as a regression test,
because each new model or prompt can reopen old holes.

| | Manual (people) | Automated (attacker LLMs, scanners) |
|---|---|---|
| Strength | Novel, multi-turn and domain-specific attacks (bio, cyber, legal experts) | Thousands of variants, cheap to re-run in CI |
| Evidence | Anthropic released 38,961 human red-team attacks (2022) | PAIR often jailbreaks in under 20 queries; TAP over 80% on GPT-4 Turbo and GPT-4o; best-of-N 89% on GPT-4o at N = 10,000 |
| Weakness | Slow, costly, hard to repeat exactly | Mostly variants of known ideas; the judge model makes errors |

- **How attacker LLMs work:** PAIR rewrites the prompt from the target's replies; TAP grows a tree of rewrites and prunes off-topic ones before querying; best-of-N applies random edits, success rising roughly as a power law in N. OpenAI trains an RL attacker against its own browser agent (Dec 2025).
- **Measure honestly:** freeze the suite and the judge; report hits, attempts and the interval — 0 of 60 still allows up to 6%. Static suites flatter defences, so also test attackers who know your defences.
- **Tools (as of Nov 2026):** PyRIT (Microsoft, v1.1), garak (NVIDIA's LLM vulnerability scanner; added a hit@k metric in 2026), promptfoo (red-team CLI; OpenAI agreed to buy it in Mar 2026, open source continues). Benchmarks: HarmBench, JailbreakBench, AgentDojo for agents.
- **Process:** scope (threat model, harm policy, what counts as success) → attack → measure → fix (training, guardrails, permissions) → regress in CI on every model or prompt change; frontier labs add external experts and bug bounties.

**Worked example:** 18 hits in 200 attacks before a fix and 3 after — is the fix real, what do small or clean runs prove, and how much do retries matter?
```python
# Attack success rate (ASR) with a 95% Wilson interval, and why attacker retries matter
from math import sqrt

def wilson(hits, n, z=1.96):
    p = hits / n
    centre = (p + z**2 / (2 * n)) / (1 + z**2 / n)
    margin = z * sqrt(p * (1 - p) / n + z**2 / (4 * n**2)) / (1 + z**2 / n)
    return max(0.0, centre - margin), min(1.0, centre + margin)

runs = [("v1, 200 attacks", 18, 200), ("v2 after fix", 3, 200),
        ("v2, only 20 attacks", 1, 20), ("v2, 60 new attacks", 0, 60)]
ci = {}
for name, hits, n in runs:
    lo, hi = wilson(hits, n)
    ci[name] = (lo, hi)
    print(f"{name:20} {hits:>2}/{n:<3}  ASR = {hits / n:5.1%}   95% CI [{lo:5.1%}, {hi:5.1%}]")

fixed = ci["v2 after fix"][1] < ci["v1, 200 attacks"][0]
print(f"v2 upper bound below v1 lower bound: {fixed} -> the fix is a real improvement")
print(f"0 hits in 60 is not 0%: the true ASR could still be up to {ci['v2, 60 new attacks'][1]:.1%}")

p = 0.02                                   # per-attempt success of one attack
for tries in (1, 10, 100):
    print(f"per-try ASR {p:.0%}, attacker retries {tries:>3}x: P(at least one hit) = {1 - (1 - p) ** tries:5.1%}")
assert fixed and round(ci["v1, 200 attacks"][0], 4) == 0.0577 and round(1 - 0.98 ** 100, 3) == 0.867
```

**Output:**

```
v1, 200 attacks      18/200  ASR =  9.0%   95% CI [ 5.8%, 13.8%]
v2 after fix          3/200  ASR =  1.5%   95% CI [ 0.5%,  4.3%]
v2, only 20 attacks   1/20   ASR =  5.0%   95% CI [ 0.9%, 23.6%]
v2, 60 new attacks    0/60   ASR =  0.0%   95% CI [ 0.0%,  6.0%]
v2 upper bound below v1 lower bound: True -> the fix is a real improvement
0 hits in 60 is not 0%: the true ASR could still be up to 6.0%
per-try ASR 2%, attacker retries   1x: P(at least one hit) =  2.0%
per-try ASR 2%, attacker retries  10x: P(at least one hit) = 18.3%
per-try ASR 2%, attacker retries 100x: P(at least one hit) = 86.7%
```

**Likely follow-ups:**

- *How do you know the fix worked?* — Re-run the frozen suite with the same judge: 9.0% [5.8, 13.8] → 1.5% [0.5, 4.3], no overlap. Then try fresh attacks, because a fix can overfit to the suite.
- *Who decides that an attack succeeded?* — A judge LLM or classifier with a written rubric, checked against a human-labelled sample; judge errors bias the ASR ([Ch 17c §4.2](#content/17c_llm_systems)).
- *Red-teaming vs evals vs pentesting?* — Evals measure typical behaviour; red-teaming hunts worst-case failures; pentesting attacks the surrounding software. For agents, red-team the whole system — tools and permissions — in an environment like AgentDojo.

**Trap:** "We red-teamed it before launch, so it is safe" — red-teaming finds today's holes; ASR depends on how many tries attackers get and how they adapt to your defences, so run it continuously, in CI, on the full system.

**Go deeper:** [Ch 18b §18.12](#content/18b_agents_in_production) (agent evaluation, AgentDojo) · [Ch 17c §4.2](#content/17c_llm_systems) (LLM-as-judge) · [Q58](#content/33b_llm_interview_questions_part2) · [Q60](#content/33b_llm_interview_questions_part2)

---

### Q60. What are guardrails and how do you implement them for production LLMs?
*[SAFE] | ★★*

![Interview card Q60 Production Guardrails: checks outside the model on input, output and actions, built as a cheap-first cascade, with permissions as the real boundary for agents; bowling-bumper analogy; classifiers cut jailbreak success from 86% to 4.4%; formula P(harm gets through) ≈ m_in x m_out, two filters each missing 10% let about 1% through; a vertical stack from user message through input checks, the LLM, output checks and action checks to a safe answer or action, beside a gauge of 23.9 ms for the cascade vs 92.4 ms big model only; key numbers for Prompt Guard 2 22M (19.3 ms) and 86M (92.4 ms, 97.5% recall at 1% FPR), and 0.1% attacks with 1% FPR meaning only 8.9% of blocks are real; follow-ups and the guardrails-stop-injection trap.](diagrams/iq33b_info_q60_guardrails_ai.png)

**Simple Answer:**
Guardrails are checks in ordinary code around the model — like the bumpers in bowling. The
model's safety training is the bowler's skill; the bumpers keep the ball out of the gutter when
the bowler slips. You put them in three places: on what goes **in**, on what comes **out**, and
on what the model is allowed to **do**. Each one costs some speed and sometimes blocks an
innocent request, so you tune them like any other classifier.

```
  USER MESSAGE (+ retrieved documents, tool results)
                         ↓
  ┌──────────────────────────────────────────────┐
  │ INPUT    • injection / jailbreak classifier  │
  │          • PII → redact or block             │
  │          • topic policy, rate limits         │
  ├──────────────────────────────────────────────┤
  │ LLM      (with a safety system prompt)       │
  ├──────────────────────────────────────────────┤
  │ OUTPUT   • harm / moderation classifier      │
  │          • schema validation (JSON, types)   │
  │          • grounding check against sources   │
  │          • PII and secret leakage scan       │
  ├──────────────────────────────────────────────┤
  │ ACTION   • tool allow-list + argument checks │
  │ (agents) • human approval if irreversible    │
  │          • egress allow-list, budgets        │
  └──────────────────────┬───────────────────────┘
                         ↓
  SAFE ANSWER OR ACTION — every block is logged and sampled for review
```

**Official Definition:**
> **Guardrails** are programmatic controls, separate from the model's weights, that inspect or
> constrain what enters the model (input rails), what it returns (output rails) and what it may
> do (action rails: tool allow-lists, argument validation, approvals). They are built from rules,
> small classifiers, guard LLMs and validators, and form a defence-in-depth layer that still
> works when the model's own alignment fails.

> **Maths in one line:** `P(harm gets through) ≈ m_in × m_out` for independent layers — two filters that each miss 10% let about 1% through; but when only 1 request in 1,000 is an attack, a filter with 1% false positives blocks about 10 legitimate users for every attacker it stops.

**Interview Answer:**

**Say this first (30 sec):** Guardrails are checks outside the model at three points: input
(injection, PII, off-topic requests), output (moderation, schema validation, grounding) and
actions (tool allow-lists, argument checks, human approval). They exist because alignment
sometimes fails. I build them cheap-first as a cascade, tune each one on false positives as well
as catches, and remember that for agents the security boundary is permissions — filters only
lower the odds.

| Layer | What it checks | Example tools (as of Nov 2026) | Latency / cost |
|---|---|---|---|
| Input | Injection and jailbreak, PII (redact or block), off-topic requests | Llama Prompt Guard 2 (86M / 22M), Google Cloud Model Armor, Azure AI Content Safety | 92.4 ms (86M) or 19.3 ms (22M) per 512-token chunk on an A100 |
| Output | Harmful content, PII or secrets leaving, JSON schema, grounding against sources | Llama Guard 4 (12B, text and images), ShieldGemma, OpenAI `omni-moderation-latest` (free), Guardrails AI validators | A guard LLM is a second model call; schema checks are almost free |
| Action | Tool allow-list, argument checks, approvals, egress allow-list, budgets | Your own code ([Ch 18b §18.13–18.14](#content/18b_agents_in_production)); NeMo Guardrails (programmable rails, incl. tool calls) | Code checks are almost free; a human adds minutes |
| Custom policy | "Does this break *our* policy?", written in plain language | gpt-oss-safeguard (20B / 120B, open weights) | A reasoning model: slowest, most flexible |

- **Latency:** run input checks in parallel with the main call and cancel if flagged; check streamed output in chunks; cascade cheap → expensive. Anthropic's Constitutional Classifiers++ (Jan 2026) screens all traffic with a cheap probe and escalates suspicious exchanges — about 1% extra compute, vs 23.7% for the first version.
- **False positives are the hidden cost:** the first-generation classifiers cut jailbreak success from 86% to 4.4% but raised refusals of harmless traffic by 0.38%; the cascade reports a 0.05% refusal rate in production. Track over-refusal as a metric, per language and user group.
- **Rules first, models where language varies:** regex for card numbers, allow-lists and JSON Schema are exact and explainable; classifiers catch paraphrases; guard LLMs handle nuanced policy.
- **Not a security boundary:** filters lower the odds of injection; least privilege and approvals cap the damage ([Q58](#content/33b_llm_interview_questions_part2)). LLM Guard and Rebuff, common in older guides, are archived (Jul 2026 and May 2025) — avoid them for new work.

**Worked example:** one day of traffic — how many blocks are real at two attack rates, and what a cheap-first cascade does to average latency.
```python
# Guardrail maths: rare attacks make false positives dominate; a cheap-first cascade cuts latency
requests = 1_000_000                      # one day of traffic
recall, fpr = 0.975, 0.01                 # Prompt Guard 2 86M: 97.5% recall at a 1% false-positive rate

share_real = {}
for attack_rate in (0.001, 0.05):         # 1 in 1,000 vs 1 in 20 requests is an attack (illustrative)
    attacks = requests * attack_rate
    caught = attacks * recall
    false_blocks = (requests - attacks) * fpr
    share_real[attack_rate] = caught / (caught + false_blocks)
    print(f"attacks = {attack_rate:4.1%} of traffic: {caught:>6,.0f} attacks and {false_blocks:>5,.0f} legit users"
          f" blocked -> {share_real[attack_rate]:5.1%} of blocks are real")

small_ms, big_ms = 19.3, 92.4             # Prompt Guard 2 22M vs 86M per call (A100, 512 tokens)
avg_ms = {}
for escalate in (0.02, 0.05, 0.10):       # share of traffic the small model passes to the big one
    avg_ms[escalate] = small_ms + escalate * big_ms
    print(f"cascade, escalate {escalate:3.0%}: {avg_ms[escalate]:5.1f} ms on average vs {big_ms} ms for big-only")
assert round(share_real[0.001], 3) == 0.089 and round(avg_ms[0.05], 1) == 23.9
```

**Output:**

```
attacks = 0.1% of traffic:    975 attacks and 9,990 legit users blocked ->  8.9% of blocks are real
attacks = 5.0% of traffic: 48,750 attacks and 9,500 legit users blocked -> 83.7% of blocks are real
cascade, escalate  2%:  21.1 ms on average vs 92.4 ms for big-only
cascade, escalate  5%:  23.9 ms on average vs 92.4 ms for big-only
cascade, escalate 10%:  28.5 ms on average vs 92.4 ms for big-only
```

**Likely follow-ups:**

- *Your filter is "99% accurate" — why do users complain?* — Base rates: with 0.1% attacks and 1% false positives, about 91% of blocks hit legitimate users. Tune thresholds per surface, and for borderline scores ask the user to rephrase or route to review instead of hard-blocking.
- *How do you add guardrails without doubling latency?* — Parallel input checks, a cheap-first cascade (22M model, 5% escalated: about 24 ms instead of 92 ms — set its threshold low, since it only escalates what it flags), streamed output checks, cached verdicts.
- *How do you check grounding?* — Compare each claim with the retrieved sources (an entailment model or an LLM judge); if a claim is unsupported, cite, abstain or regenerate ([Ch 17b §7](#content/17b_llm_applications)).

**Trap:** "We added guardrails, so the agent is safe from prompt injection" — classifiers only lower the odds and adaptive attacks get past them; the boundary is what the agent may do: allow-lists, least privilege and approvals.

**Go deeper:** [Ch 17b §14.4](#content/17b_llm_applications) · [Ch 17b §8.6](#content/17b_llm_applications) (structured output) · [Ch 18b §18.13](#content/18b_agents_in_production) · [Ch 18b §18.14](#content/18b_agents_in_production) · [Q58](#content/33b_llm_interview_questions_part2)

---

# PART 8 — Frontier Topics

---

### Q61. What are reasoning models and how do they work?
*[ARCH] | ★★★*

![Interview card Q61 Reasoning Models: RL on checkable answers teaches long hidden thinking, the model thinks, checks and backtracks before answering, and an effort dial is raised for hard work; scratch-paper student analogy; o1 scored 74% vs GPT-4o's 12% on AIME 2024; formula cost = input x p_in + (thinking + answer) x p_out, so 8,000 thinking tokens before a 300-token answer is about 28x the output bill; pipeline from base model through RL on checkable tasks (RLVR + GRPO, reward 1 if right) to a reasoning model with an effort dial, a token bar of input, hidden thinking and answer, and the strawberry example where a normal call says 2 and a reasoning call counts 3; key numbers DeepSeek-R1-Zero 15.6% to 71.0%, 1K to 100K+ thinking tokens, high-effort calls 10-50x a quick one; follow-ups and the bigger-model trap.](diagrams/iq33b_info_q61_reasoning_models_ai.png)

**Simple Answer:**
A normal LLM answers in one go — like a student who writes down the first thing that
comes to mind. A reasoning model first works on scratch paper: it writes a long chain of
hidden "thinking" tokens, tries an approach, checks it, backtracks, and only then answers.

It learned that habit from reinforcement learning on problems a program can mark right or
wrong (maths with a known answer, code with tests). More thinking helps on hard
multi-step problems; on easy ones it only costs time and money.

```
  NORMAL CALL — answers straight away
  Q: "How many r's are in 'strawberry'?"
  A: "2"                                    ← fast, wrong (a famous 2024 slip)

  REASONING CALL — thinks first, then answers
  Q: "How many r's are in 'strawberry'?"
  [thinking — hidden, billed as output tokens]
     s-t-r(1)-a-w-b-e-r(2)-r(3)-y → 3.  Re-check the double r: "rr" → still 3 ✓
  A: "3"                                    ← slower, correct

  HOW ONE IS BUILT (once)                    HOW YOU USE IT (every call)
  ┌───────────────┐   ┌───────────────────────┐   ┌────────────────────────┐
  │ Base model    │──►│ RL on checkable tasks │──►│ Reasoning model        │
  │ (pre-trained) │   │ (RLVR + GRPO):        │   │ think → check → answer │
  │               │   │ reward 1 if right     │   │ effort dial: low … max │
  └───────────────┘   └───────────────────────┘   └────────────────────────┘
```

**Official Definition:**
> A **reasoning model** is an LLM post-trained — mainly with reinforcement learning on
> verifiable rewards (RLVR), often optimised with GRPO — to generate a long chain of
> intermediate "thinking" tokens before its final answer, so accuracy on hard problems grows
> with the inference-time thinking budget, not only with parameter count. The thinking is
> billed as output tokens, and closed APIs return at most a summary of it.

> **Maths in one line:** `cost = input × p_in + (thinking + answer) × p_out` — thinking is billed as output, so 8,000 hidden tokens in front of a 300-token answer multiply the output bill by about 28.

**Interview Answer:**

**Say this first (30 sec):** A reasoning model is an LLM trained with reinforcement learning
on problems whose answers can be checked, so it learns to think in a long hidden chain —
try, check, backtrack — before it answers. That turns inference compute into accuracy: on
AIME 2024 maths, o1 scored 74% against GPT-4o's 12% (OpenAI, Sep 2024). Today it is a dial
on every flagship model, and thinking is billed as output, so I raise the effort for hard
multi-step work and keep it low for lookups and chat.

| | What happens | Numbers to quote |
|---|---|---|
| **Training** | RLVR: sample a group of answers per problem, reward 1 if a checker accepts; GRPO scores each answer against its group's mean, so no critic network | DeepSeek-R1-Zero, RL only: AIME 2024 pass@1 15.6% → 71.0% |
| **Inference** | The model writes thinking tokens, then the answer; an effort setting steers how much it thinks | About 1K to 100K+ thinking tokens per call |
| **What you see** | Closed APIs: a summary of the reasoning at most; open-weight models such as DeepSeek-R1 print raw text inside `<think>` tags | OpenAI, Anthropic and Google never return the raw chain |
| **Cost and latency** | Thinking is billed as output and adds seconds to minutes | A high-effort call often costs 10–50× a quick one |

- **The dial (as of Nov 2026):** OpenAI `reasoning.effort`, Anthropic `output_config.effort` with adaptive thinking, Gemini `thinking_level`; GPT-6, Claude 5.5, Gemini 4 and DeepSeek V4 all have one ([Ch 20 §20.2](#content/20_2026_landscape)).
- **R1-Zero vs R1:** R1-Zero learned to reason from RL alone but was hard to read and mixed languages; R1 began with cold-start SFT on long chains, then RL ([Ch 17 §3.5b](#content/17_llm)).
- **Distillation:** small models fine-tuned on R1's traces (six, 1.5B–70B) reason well; at 32B this beat running RL directly — AIME 2024 72.6% vs 47.0%.
- **When NOT to use one:** lookups, classification, extraction, real-time voice. Some tasks even get worse with longer thinking — distractors, spurious features (Gema et al., 2025).

**Likely follow-ups:**

- *How is this different from chain-of-thought prompting?* — CoT prompting asks a normal model to show steps; a reasoning model was RL-trained to think, so "think step by step" prompts are unnecessary ([Q25 in Part 1](#content/33_llm_interview_questions)).
- *Can you trust the visible reasoning?* — Only as evidence: Claude 3.7 Sonnet and DeepSeek-R1 admitted a hint they had used only about 25% and 39% of the time ([Ch 17 §15.1b](#content/17_llm)). Check answers independently.
- *Why must the rewards be verifiable?* — A learned reward model gets gamed at scale; an exact-answer check or a unit test does not. The price: RL works best where answers can be checked.

**Trap:** "A reasoning model is a bigger, smarter model, so use it for everything" — it is the same kind of transformer spending more tokens per query; on easy tasks it costs 10–50× more for little or no gain.

**Go deeper:** [Ch 17 §3.5b](#content/17_llm) · [Ch 20 §20.2](#content/20_2026_landscape) · [Ch 17 §15.1b](#content/17_llm) · [Q62](#content/33b_llm_interview_questions_part2) (test-time compute)

---

### Q62. What is test-time compute scaling? Why is it a paradigm shift?
*[ARCH] | ★★★*

![Interview card Q62 Test-Time Compute Scaling: the same model spends more compute per question by thinking longer or sampling many answers and picking one, a third scaling axis paid only on hard queries; same-student-more-time analogy; Snell et al. 2024 found about 4x less compute than best-of-N and could beat a 14x larger model; formula coverage(N) = 1 - (1 - p)^N, where p = 0.3 gives 83% at N = 5 but p = 0.02 gives only 10%; diagram of a question splitting into a sequential lane (think, check, step 2 is wrong, revise, answer) and a parallel lane (attempts answering 42, 38, 42 merged by majority vote or a verifier), beside a bar chart of o1 on AIME 2024 at 74%, 83% and 93% vs GPT-4o at 12%; a compare table of longer chain, majority vote, best-of-N with a verifier and PRM search; follow-ups and the more-compute-always-helps trap.](diagrams/iq33b_info_q62_test_time_compute_ai.png)

**Simple Answer:**
For years the recipe for a smarter model was train-time scaling: more parameters, more
data, more training compute — paid once, before anyone asks a question. Test-time compute
scaling is the second lever: let the *same* model spend more computation on each question.

It is the difference between hiring a smarter student and giving the same student more
time, scratch paper and a chance to check the work. Extra time helps a lot on problems the
student can partly solve, and very little on problems far beyond them.

```
  TWO WAYS TO SPEND TEST-TIME COMPUTE
  SEQUENTIAL — one longer chain: think, check, revise
     Q ──► think ──► check ──► "step 2 is wrong" ──► revise ──► answer

  PARALLEL — N independent attempts, then pick one
           ┌──► attempt 1 → 42 ──┐
     Q ────┼──► attempt 2 → 38 ──┼──► pick by majority vote, or by a verifier
           └──► attempt N → 42 ──┘    (unit tests, reward model, PRM)

  SAME MODEL, MORE COMPUTE — o1 on AIME 2024 (OpenAI, Sep 2024)
     1 sample                                74%
     majority vote over 64 samples           83%
     best of 1,000, re-ranked by a scorer    93%      (GPT-4o, 1 sample: 12%)
```

**Official Definition:**
> **Test-time (inference-time) compute scaling** improves a fixed model's accuracy by
> spending more computation per query: a longer reasoning chain (sequential), many sampled
> answers combined by majority vote or a verifier (parallel), or search over partial
> solutions scored by a process reward model (PRM). The gain depends on how hard the question
> is and how good the selector is, and it adds to train-time scaling rather than replacing it.

> **Maths in one line:** `coverage(N) = 1 − (1 − p)^N` — with a perfect checker, N tries succeed if any one does: p = 0.3 per try gives 83% at N = 5, but p = 0.02 gives only 10%, so extra samples rescue only questions the model sometimes solves.

**Interview Answer:**

**Say this first (30 sec):** Test-time compute scaling means getting better answers from the
same model by spending more compute per question — thinking longer, or sampling many answers
and picking one by vote or verifier. It is a third scaling axis next to pre-training and RL
post-training, and it makes cost adaptive: you pay for deep thinking only on hard queries.
Snell et al. (2024) found that allocating it per question matched best-of-N with about 4×
less compute and, FLOPs-matched, could beat a 14× larger model — but only on questions the
small model already partly solves.

| Method | How it spends compute | Needs | Limit |
|---|---|---|---|
| **Longer chain** (sequential) | RL-trained thinking set by the effort dial; or *budget forcing* — append "Wait" when the model tries to stop (s1, 2025) | A reasoning-trained model | Latency grows with length; overthinks easy tasks |
| **Majority vote** (parallel) | N samples, keep the most common final answer | Comparable answers (a number, a label) | Plateaus; fails when a wrong answer is the most common ([Q30 in Part 1](#content/33_llm_interview_questions)) |
| **Best-of-N + verifier** (parallel) | N samples, keep the one a checker or reward model scores highest | Unit tests, or an outcome reward model | Only as good as the verifier; reward models can be gamed |
| **Search with a PRM** | Score each partial step; expand only the best branches (beam or tree search) | A process reward model | Costly to train; can also be hacked |

- **Why "paradigm shift":** quality is no longer fixed when training ends — o1's accuracy rose smoothly with both RL training compute and thinking time, and cost moved from one-off to per query.
- **The verifier is the bottleneck:** with unit tests, 250 samples lifted SWE-bench Lite from 15.9% to 56%; without a checker, voting and reward models plateau after a few hundred samples (Brown et al., 2024).
- **Difficulty picks the method:** easier questions gain most from sequential revision, harder ones from parallel sampling or PRM search; the hardest gain little — a better base model wins (Snell et al.).
- **Training makes long thinking useful:** DeepSeek-R1-Zero learned it from RL alone (AIME 2024: 15.6% → 71.0%); R1 itself started with cold-start SFT ([Ch 17 §3.5b](#content/17_llm)).
- **Pricing:** thinking tokens are billed at the output-token rate, so the effort setting is a cost knob too ([Q61](#content/33b_llm_interview_questions_part2)).

**Worked example:** with a checker (unit tests), the same sample budget solves more when it goes where one more try helps most — the idea behind Snell et al.'s "compute-optimal" scaling.

```python
# Compute-optimal test-time scaling (toy): with a checker, put a fixed sample budget where it helps most
p_right = {"easy": 0.90, "medium": 0.20, "hard": 0.01}   # chance one sample is right (illustrative)
Q, AVG = 100, 4                                          # 100 questions per bucket, 4 samples each on average

def solved(p, n):                     # a checker (e.g. unit tests) accepts any right sample among n
    return Q * (1 - (1 - p) ** n)

def total(alloc):
    return sum(solved(p, alloc[k]) for k, p in p_right.items())

uniform = {k: AVG for k in p_right}                      # plain best-of-N: same N for every question
adaptive = {k: 1 for k in p_right}                       # one try each, then every extra round of
while sum(adaptive.values()) < AVG * len(p_right):       # samples goes to the bucket it helps most
    gain = {k: solved(p, adaptive[k] + 1) - solved(p, adaptive[k]) for k, p in p_right.items()}
    adaptive[max(gain, key=gain.get)] += 1

for name, alloc in (("uniform", uniform), ("adaptive", adaptive)):
    per = "  ".join(f"{k} N={alloc[k]}: {solved(p, alloc[k]):3.0f}" for k, p in p_right.items())
    print(f"{name:8s} | {per} | solved {total(alloc):.0f} of 300")

n = AVG
while total({k: n for k in p_right}) < total(adaptive):
    n += 1
print(f"uniform needs N = {n} per question ({n / AVG:.0f}x the compute) to match adaptive")
assert total(adaptive) > total(uniform) and sum(adaptive.values()) == sum(uniform.values())
assert solved(p_right["hard"], adaptive["hard"]) < 5      # too hard: extra samples barely help
```

**Output:**

```
uniform  | easy N=4: 100  medium N=4:  59  hard N=4:   4 | solved 163 of 300
adaptive | easy N=2:  99  medium N=9:  87  hard N=1:   1 | solved 187 of 300
uniform needs N = 8 per question (2x the compute) to match adaptive
```

Easy questions are done after 2 tries and hard ones (1% per try) barely move, so the budget
goes to the medium ones: the same compute solves 187 questions instead of 163.

**Likely follow-ups:**

- *Does test-time compute replace bigger models?* — No, it complements them: it pays on questions the model sometimes gets right, while for the hardest ones Snell et al. found more pre-training the better buy. And it is paid again on every query.
- *Outcome vs process reward model?* — An ORM scores only the final answer; a PRM scores each step, so search can prune bad branches early — Lightman et al. (2023) solved 78% of a MATH subset with one ([Ch 17 §3.5c](#content/17_llm)).
- *How do you decide how much to spend per query?* — Route by estimated difficulty: a cheap model or low effort first, escalate on low confidence or sample disagreement; current models also think adaptively at a fixed effort setting.

**Trap:** "More test-time compute always helps" — returns shrink (roughly log-linear at best), selectors plateau without a real checker, the hardest problems barely move, and some tasks get worse with longer thinking.

**Go deeper:** [Ch 20 §20.2](#content/20_2026_landscape) · [Ch 17 §3.7](#content/17_llm) (the third scaling axis) · [Ch 17 §3.5c](#content/17_llm) (PRMs) · [Q30 in Part 1](#content/33_llm_interview_questions) (self-consistency) · [Q61](#content/33b_llm_interview_questions_part2)

---

### Q63. What are AI agents and how do they work? ★★
*[APP] | ★★*

![Interview card Q63 AI Agents: an LLM in a loop choosing and calling tools, built from five parts (model, tools, loop, memory, guardrails), where errors compound so you start with a workflow; analogy that a chatbot gives directions on the phone while an agent drives you there; formula P(task succeeds) ≈ p^n, so at 95% per step success stays above 50% only up to 13 steps (99%: 68 steps); loop diagram inside a guardrails frame (budgets, least privilege, approvals): goal to MODEL, tool call to your code that checks and runs it, to TOOLS, with an observation arrow back to MODEL and a memory strip for the transcript and long-term notes or vector store; table of p^n at 5, 10 and 20 steps (0.95: 77%, 60%, 36%; 0.99: 95%, 90%, 82%) and pass^8 of 43% for a 90%-per-run agent; follow-ups and the more-autonomy trap.](diagrams/iq33b_info_q63_ai_agents_ai.png)

**Simple Answer:**
A chatbot can only talk. An AI agent can also *do* things — search the web, run code, call
APIs, edit files. It is the difference between someone who gives you directions on the
phone and someone who drives you there.

You give an agent a goal, not steps. It picks a tool, reads what comes back, decides the
next move and repeats until it is done — inside limits you set, because every extra step is
another chance to go wrong.

```
  CHATBOT — only talks
  User:    "Find a cheap flight to Paris next month that fits my calendar."
  Bot:     "Here are some tips for finding cheap flights..."

  AGENT — talks AND acts, in a loop
  Thought: I need the flights first, then the user's free dates.
  Action:  search_flights(to="Paris", month="next")
  Observe: [Air France 380 USD, Delta 450 USD, ...]
  Thought: Now check which dates are free.
  Action:  check_calendar(month="next")
  Observe: [10th–17th free]
  Answer:  "Air France, 10th–17th, 380 USD. Shall I book it?"   ← asks before paying

  ┌─ GUARDRAILS: budgets (steps, tokens, cost) · least privilege · approvals ───┐
  │                                                                             │
  │  goal ──► MODEL ──tool call──► your code ──► TOOLS (search, code, APIs)     │
  │             ▲                  checks, runs                                 │
  │             │                                  │                            │
  │             └─── observation (tool result) ────┘                            │
  │                                                                             │
  │  MEMORY: the transcript (short-term) + notes or a vector store (long-term)  │
  │                                                                             │
  └─────────────────────────────────────────────────────────────────────────────┘
```

**Official Definition:**
> An **AI agent** is a system in which an LLM runs in a loop, choosing and executing actions —
> tool or API calls, code, GUI steps — toward a goal, observing each result and deciding the
> next step until the goal is met, it decides it cannot proceed, or a budget runs out. What
> makes it an agent rather than a workflow is that the *model* chooses the next step at run time.

> **Maths in one line:** `P(task succeeds) ≈ pⁿ` — every one of n steps must work: at 95% per step a task stays above 50% success only up to 13 steps, while 99% stretches that to 68.

**Interview Answer:**

**Say this first (30 sec):** An AI agent is an LLM in a loop: it picks a tool — search, code,
an API — my code runs it, the model reads the result and decides the next step, until the
goal is met or a budget runs out. I describe it as five parts: model, tools, loop, memory and
guardrails. The hard part is reliability: errors compound, so 95% per step is only 60% over
ten steps. That is why I start with the simplest design — often a fixed workflow — and add
autonomy only when the steps can't be listed in advance.

| Part | Its job | What to get right |
|---|---|---|
| **Model** | Chooses the next action at run time | Reliable tool use; reasoning effort matched to the task |
| **Tools** | Act on the world: APIs, code, files, a browser (function calling, MCP) | Clear schemas; errors returned as results the model can fix ([Ch 18 §18.2](#content/18_ai_agents)) |
| **Loop** | Thought → action → observation, repeat ([Q28 in Part 1](#content/33_llm_interview_questions), ReAct) | Stop rules: max steps, timeouts, repeat detection |
| **Memory** | The transcript now; notes or a vector store across sessions | Compact old turns, retrieve only what is needed ([Ch 18 §18.9](#content/18_ai_agents)) |
| **Guardrails** | Limit the damage when it goes wrong | Least privilege, a sandbox, human approval for irreversible actions, budgets |

- **Workflow or agent?** If you can list the steps, code them as a workflow (router, pipeline) — cheaper, faster, testable. Use an agent only when the model must choose the path.
- **Patterns:** start with a single agent; add orchestrator-workers for parallel subtasks and evaluator-optimizer when a checker exists ([Ch 18 §18.4](#content/18_ai_agents)).
- **Evaluate reliability, not one lucky run:** grade the end state and the path, and report pass^k — a 90%-per-run agent passes all 8 of 8 runs only 43% of the time.
- **Failure modes:** prompt injection through tool results, wrong tool or arguments, loops, invented tools, runaway cost ([Ch 18b §18.10](#content/18b_agents_in_production)); OWASP 2026 ranks excessive agency LLM03.
- **Building one (as of Nov 2026):** LangGraph, OpenAI Agents SDK, Claude Agent SDK, Google ADK, CrewAI, Microsoft Agent Framework (successor to the archived AutoGen) — or a hand-rolled loop ([Ch 19 §19.6](#content/19_ai_frameworks)).

**Likely follow-ups:**

- *When would you NOT build an agent?* — When one LLM call or a fixed workflow does the job, when you need sub-second latency, or when a mistake is costly and irreversible with no human gate.
- *Single agent or multi-agent?* — Single by default. Multi-agent buys parallel, read-only exploration and clean contexts for about 15× a chat's tokens (Anthropic, 2025); keep anything that writes in one thread ([Ch 18 §18.5](#content/18_ai_agents)).
- *Which benchmarks?* — Terminal-Bench (terminal tasks), τ²-bench (customer service), OSWorld (desktop). OpenAI retired SWE-bench Verified in Feb 2026 (saturated/contaminated); it then recommended SWE-bench Pro, but retracted that on 8 Jul 2026 after finding ~30% of Pro tasks broken.

**Trap:** "An agent is just an LLM with tools, and more autonomy is better" — the engineering is in the loop, limits and guardrails; add autonomy only when the steps can't be listed, because success falls as pⁿ.

**Go deeper:** [Ch 18 §18.1](#content/18_ai_agents) · [Ch 18 §18.4](#content/18_ai_agents) · [Ch 18b §18.12](#content/18b_agents_in_production) (pass^k) · [Q28 in Part 1](#content/33_llm_interview_questions) (ReAct) · [Q64](#content/33b_llm_interview_questions_part2) (MCP)

---

### Q64. What is MCP (Model Context Protocol)? ★★
*[APP] | ★★*

![Interview card Q64 MCP (Model Context Protocol): an open standard linking AI apps to tools and data, wrap a service once and any MCP client uses it, and it stacks on function calling with the host routing calls; USB-C analogy; formula connectors N x M to N + M, so 10 apps x 50 services needs 500 connectors vs 10 clients + 50 servers = 60; diagram BEFORE MCP with 3 apps fully wired to Drive, Slack and GitHub (3 x 3 = 9 connectors) vs WITH MCP where app clients reach servers through one protocol, JSON-RPC 2.0 (3 + 3 = 6 pieces), local servers over stdio, remote over Streamable HTTP + OAuth 2.1, tools = verbs, resources = nouns, prompts = recipes; comparison table of function calling, MCP and A2A (as of Nov 2026); follow-ups on security and MCP vs A2A; trap that MCP replaces function calling.](diagrams/iq33b_info_q64_mcp_ai.png)

**Simple Answer:**
Before MCP, every AI app needed its own custom connector for every tool or data source: one
for Google Drive, another for Slack, another for GitHub — and every other AI app wrote its
own set again. N apps × M services meant N × M pieces of glue code.

MCP is a universal plug — "USB-C for AI apps". Wrap a service once as an MCP server, and any
MCP-compatible app (a chat app, an IDE, your own agent) can discover and use its tools.

```
  BEFORE MCP — every app writes its own connector to every service
     Chat app  ──► Drive · Slack · GitHub      3 custom connectors
     IDE       ──► Drive · Slack · GitHub      3 more
     Your app  ──► Drive · Slack · GitHub      3 more
     → N apps × M services = 3 × 3 = 9 connectors to build and maintain

  WITH MCP — each app implements the client side once, each service is wrapped once
     Chat app [client] ──┐                    ┌──► [server] Drive
     IDE      [client] ──┼── one protocol ────┼──► [server] Slack
     Your app [client] ──┘   (JSON-RPC 2.0)   └──► [server] GitHub
     → N + M = 3 + 3 = 6 pieces (not a hub: each app connects to each server it uses)

  INSIDE ONE HOST (the AI app: owns the model, the UI and the consent prompts)
     MCP client 1 ──stdio────────────► local server   (files, git)
     MCP client 2 ──Streamable HTTP──► remote server  (GitHub, Slack) + OAuth 2.1
     Each server offers:  Tools (verbs) · Resources (nouns) · Prompts (recipes)
```

**Official Definition:**
> **MCP (Model Context Protocol)** is an open protocol, introduced by Anthropic in November
> 2024 and governed since December 2025 by the Agentic AI Foundation (AAIF, a Linux Foundation
> fund), that standardises how LLM applications connect to external tools and data. A host
> application runs one MCP client per server; servers expose **tools**, **resources** and
> **prompts** over JSON-RPC 2.0, via stdio or Streamable HTTP. The current revision,
> 2026-07-28 (as of Nov 2026), made the protocol stateless.

> **Maths in one line:** `connectors: N × M → N + M` — 10 apps × 50 services needs 500 custom connectors; with MCP it is 10 clients + 50 servers = 60 pieces.

**Interview Answer:**

**Say this first (30 sec):** MCP is an open protocol — from Anthropic in 2024, now governed by
the Linux Foundation's Agentic AI Foundation — that standardises how an AI app discovers and
calls external tools and data. Each service is wrapped once as an MCP server exposing tools,
resources and prompts over JSON-RPC 2.0, and any MCP client can use it, so N × M custom
integrations become N + M. It does not replace function calling: the model still emits a
function call, and the host routes it to the right MCP server.

- **Roles:** the host (the AI app — model, UI, consent prompts) runs one client per server; servers never see each other, so the host is the security checkpoint.
- **Primitives:** tools are verbs the *model* calls (`tools/list`, `tools/call`); resources are nouns the *app* reads; prompts are recipes the *user* picks.
- **Transports:** stdio for local servers; Streamable HTTP with OAuth 2.1 for remote ones. The old HTTP+SSE transport has been deprecated since 2025-03-26.
- **Stateless since 2026-07-28:** no `initialize` handshake and no session ID; every request carries its version and capabilities in `_meta`, so any replica behind a load balancer can answer.
- **Security:** tool poisoning (orders hidden in a tool's description), rug pulls (the definition changes after approval — pin a hash), injected tool output, over-broad tokens ([Ch 18 §18.3](#content/18_ai_agents)).

| | Function calling | MCP | A2A |
|---|---|---|---|
| **Connects** | Model ↔ host | Host ↔ a tool or data server | Agent ↔ another, opaque agent |
| **Unit of work** | One proposed call: tool name + JSON arguments | `tools/call` → a result | A task with a lifecycle; can run for hours and ask for input |
| **Discovery** | Tool schemas sent with each API request | `tools/list` | An Agent Card at `/.well-known/agent-card.json` |
| **Standard** | Each vendor's own API shape | Open spec, revision 2026-07-28 (AAIF) | Open spec, v1.0.0 (12 Mar 2026; in the AAIF since Aug 2026) |

**Likely follow-ups:**

- *What changed in the stateless revision?* — No handshake or session: each request is self-describing, a server that needs state returns a handle (e.g. `basket_id`) the model passes back, and sampling and roots were deprecated. Scaling becomes plain load balancing.
- *How do you secure an MCP integration?* — Treat servers as third-party code (supply chain, LLM04 in OWASP 2026): review and pin tool definitions, least-privilege OAuth scopes per server, no token passthrough, approval for destructive calls. Hints like `readOnlyHint` come from the server — untrusted.
- *MCP or A2A?* — Calling a function and getting an answer now → MCP. Handing a job to an independent agent, often another company's, that plans on its own and may take hours → A2A. MCP is vertical (agent → tools), A2A horizontal (agent ↔ agent).

**Trap:** "MCP replaces function calling" — they stack: function calling is how the model asks for an action (model ↔ host); MCP is how the host finds and runs tools that live elsewhere (host ↔ server). The model never speaks MCP itself.

**Go deeper:** [Ch 18 §18.3](#content/18_ai_agents) (MCP and A2A) · [Ch 17b §9.3](#content/17b_llm_applications) (function calling) · [Ch 18b §18.10](#content/18b_agents_in_production) (injection) · [Q63](#content/33b_llm_interview_questions_part2) (agents)

---

### Q65. What are State Space Models (SSMs) like Mamba? Are they replacing Transformers?
*[ARCH] | ★★★*

![Interview card Q65 SSMs, Mamba and Hybrids: an SSM is a linear recurrence over a fixed-size state with linear cost, flat decode memory and no KV cache, but its lossy state hurts recall, so 2026 models are hybrids; index-card analogy; recurrence h_t = A·h_(t-1) + B·x_t, y_t = C·h_t, with Mamba making B, C and the step size depend on the token; diagram of a Transformer KV cache k1 to kt that grows (1M tokens gives 1 trillion scores per layer, 2x text gives 4x work) vs an SSM scan x1, h, x2, h, x3, h (1M tokens gives 1M updates, 2x text gives 2x work), and the Qwen3.5-397B hybrid of 3 linear layers plus 1 attention layer repeated 15 times (45 : 15, KV cache 120 KiB to 30 KiB per token, 4x less); decode memory table for 1K, 262K and 1M tokens (all-attention 0.12, 30.00, 120.00 GiB; hybrid 0.21, 7.68, 30.18 GiB; all-linear 0.23 GiB); follow-ups and the trap that O(n) means SSMs replace Transformers.](diagrams/iq33b_info_q65_ssm_mamba_hybrids_ai.png)

**Simple Answer:**
A Transformer keeps a note of every word it has read (the KV cache) and, for each new word, looks back
at all of them — so the work grows with the *square* of the length and the memory grows with every word.
A State Space Model (SSM) such as Mamba reads like someone keeping running notes on one index card: each
new word updates a fixed-size summary (the *state*), so the work grows *linearly* and the memory never grows.
The catch: one card can't hold everything word for word, so SSMs are worse at exact look-ups and copying.
That is why today's models *mix* the two instead of dropping attention.

```
  TRANSFORMER (attention)                    SSM / MAMBA (scan)
  each new token looks back at all of them   each new token updates one state h
  ┌────┬────┬────┬─────┬────┐                x1 ─► [h] ─► x2 ─► [h] ─► x3 ─► [h] ─► ...
  │ k1 │ k2 │ k3 │ ... │ kt │  KV cache      h has the same size after 10 or 1M tokens
  └────┴────┴────┴─────┴────┘  grows

  1K tokens:  1 million scores per layer     1K state updates per layer
  1M tokens:  1 trillion scores per layer    1M state updates per layer
  double the text → 4× the work              double the text → 2× the work
  exact recall: excellent                    exact recall: lossy (it must fit in h)

  HYBRID — the 2026 answer (Qwen3.5-397B, 60 layers)
  [linear][linear][linear][ATTENTION]  × 15  →  45 linear-attention : 15 attention layers
  only the 15 attention layers keep a KV cache → about 4× less cache than all-attention
```

(A causal mask halves the attention scores; the growth law is the same.)

**Official Definition:**
> A **State Space Model (SSM)** is a sequence layer built on a linear recurrence: a fixed-size hidden
> state is decayed and updated by each input, and the output is read from that state, so a length-n
> sequence costs O(n) time and each new token needs the same fixed memory, however long the context. **Mamba** (Gu & Dao, Dec 2023) made
> the recurrence *selective* — the step size and the input and output projections depend on the current
> token — and trains it with a hardware-aware parallel scan. **Mamba-2** (2024) showed such SSMs are a form
> of linear attention ("state-space duality"), so they can also train with plain matrix multiplies.

> **Maths in one line:** `h_t = A·h_{t−1} + B·x_t,  y_t = C·h_t` — the new state is a decayed copy of the old one plus the new input written in, and the output is read from the state; Mamba makes `B`, `C` and the step size `Δ` depend on `x_t`, so the model chooses what to keep.

**Interview Answer:**

**Say this first (30 sec):** An SSM like Mamba replaces attention's look-back with a learned linear recurrence over a fixed-size state, so cost grows linearly with length and decode memory stays flat — no growing KV cache. It is not replacing the Transformer: a fixed state is lossy, so exact recall and copying suffer. The 2026 answer is hybrids — Qwen3.5 uses 3 linear-attention layers per attention layer, which cuts the KV cache about 4×.

| | Transformer | SSM (Mamba) | Hybrid |
|---|---|---|---|
| Work over n tokens | O(n²) | O(n) | Mostly O(n) |
| Memory while generating | KV cache grows with n | Fixed state | Small KV cache + fixed state |
| Exact recall, copying | Strong | Weak — lossy state | Strong (the attention layers do it) |
| Examples | Llama 3, gpt-oss | Mamba, Mamba-2, Mamba-3 | Jamba, Nemotron-H, Granite 4.0-H, Qwen3-Next / Qwen3.5, Kimi Linear |

- **Selective scan (Mamba):** a large `Δ` means "write this token", a small one "skip it". Gates read only the input, so they are computed in parallel before a parallel scan.
- **Mamba-2 and Mamba-3:** Mamba-2 is linear attention with a per-step decay; its core layer is reported 2–8× faster than Mamba's scan. Mamba-3 (Mar 2026) adds complex-valued states for state tracking.
- **The weakness, measured:** "Repeat After Me" (Jelassi et al., 2024) showed fixed-state models copy long strings worse than Transformers, in theory and in experiments.
- **Hybrid ratios:** Jamba about 1 attention layer in 8; Nemotron-H-8B 4 of 52 layers (up to 3× faster inference, reported); Granite 4.0-H 9 Mamba-2 : 1 attention.
- **The other route:** keep full attention but shrink its cache — GQA, latent attention (MLA), DeepSeek-V4's compressed attention, or sliding windows (Gemma 3: 5 local layers per global one).

**Worked example:** decode memory for one sequence with Qwen3.5-397B's real layer shapes, against two hypothetical versions of it — every layer attention, or every layer linear.

```python
# Why 2026 models are hybrids: decode memory of all-attention vs a 3:1 hybrid vs all-linear (Qwen3.5-397B config)
layers, attn_every = 60, 4                         # config: full_attention_interval = 4
n_attn = layers // attn_every                      # 15 full-attention layers
n_lin = layers - n_attn                            # 45 Gated DeltaNet (linear-attention) layers
kv_heads, head_dim, kv_bytes = 2, 256, 2           # GQA with 2 KV heads; bf16 cache
v_heads, dk, dv, s_bytes = 64, 128, 128, 4         # one 128 x 128 state per value head; fp32 state
GiB, MiB = 2**30, 2**20

kv_per_token = 2 * kv_heads * head_dim * kv_bytes  # K and V in ONE attention layer: 2,048 bytes
state = v_heads * dk * dv * s_bytes                # ONE linear layer's state: 4 MiB at any length

def memory(n, attn_layers, lin_layers):            # per sequence; weights not included
    return attn_layers * kv_per_token * n + lin_layers * state

print(f"KV cache per token: all-attention {layers * kv_per_token // 1024} KiB, hybrid {n_attn * kv_per_token // 1024} KiB")
print(f"fixed state: hybrid {n_lin * state / MiB:.0f} MiB, all-linear {layers * state / MiB:.0f} MiB")
print(f"{'context':>9} {'all-attention':>14} {'hybrid 3:1':>11} {'all-linear':>11} {'scores/layer':>13}")
for n in (1_024, 32_768, 262_144, 1_048_576):
    full, hyb, lin = memory(n, layers, 0), memory(n, n_attn, n_lin), memory(n, 0, layers)
    print(f"{n:9,d} {full / GiB:10.2f} GiB {hyb / GiB:7.2f} GiB {lin / GiB:7.2f} GiB {n * (n + 1) / 2:13.1e}")

print(f"all-linear saves memory only beyond {layers * state // (layers * kv_per_token):,} tokens")
ratio = memory(262_144, layers, 0) / memory(262_144, n_attn, n_lin)
print(f"at the native 262,144-token window the hybrid needs {ratio:.1f}x less than all-attention")
assert n_attn == 15 and kv_per_token == 2048 and state == 4 * MiB
assert 3.8 < ratio < 4.0                           # close to 4x: only 1 layer in 4 keeps a KV cache
```

**Output:**

```
KV cache per token: all-attention 120 KiB, hybrid 30 KiB
fixed state: hybrid 180 MiB, all-linear 240 MiB
  context  all-attention  hybrid 3:1  all-linear  scores/layer
    1,024       0.12 GiB    0.21 GiB    0.23 GiB       5.2e+05
   32,768       3.75 GiB    1.11 GiB    0.23 GiB       5.4e+08
  262,144      30.00 GiB    7.68 GiB    0.23 GiB       3.4e+10
1,048,576     120.00 GiB   30.18 GiB    0.23 GiB       5.5e+11
all-linear saves memory only beyond 2,048 tokens
at the native 262,144-token window the hybrid needs 3.9x less than all-attention
```

How to read it: the layer shapes come from the model's `config.json` (the small convolution buffer of each linear layer is ignored). At 1K tokens the fixed state costs *more* than a KV cache, so the saving appears only on long inputs; at 262K tokens (the native window) the hybrid needs 7.68 GiB against 30 GiB. "scores/layer" is the causal attention work n(n+1)/2 in each attention layer — a linear layer does just n state updates. The all-linear row is flattest, but it gives up the attention layers that do exact recall.

**Likely follow-ups:**

- *How can a recurrence train in parallel?* — Mamba's gates read only the input, never the previous state, so they are all computed at once; steps `h_t = a_t·h_{t−1} + b_t` then combine pairwise in a tree (a parallel scan). An LSTM's gates read its own previous state, which forces step-by-step training.
- *When would you choose an SSM or a hybrid?* — Very long inputs or long generations where KV-cache memory limits the batch: long documents, long agent traces, audio, genomics. For short prompts and top quality, a plain Transformer is still the safe default.
- *Is "linear attention" the same thing?* — Same family: Mamba-2 is linear attention with a decay, and DeltaNet adds a delta-rule overwrite. The Gated DeltaNet layers in Qwen3-Next and Qwen3.5 are this kind.

**Trap:** "SSMs will replace Transformers because O(n) beats O(n²)." — In the example above the fixed state is no cheaper below about 2K tokens, and the lossy state hurts exact recall; production models are hybrids that keep a few attention layers.

**Go deeper:** [Ch 16 §6.2](#content/16_deep_learning) · [Ch 17 §2.7](#content/17_llm) · [Ch 17c §1.2](#content/17c_llm_systems) · [Q7 in Part 1](#content/33_llm_interview_questions)

---

### Q66. What is the current open-source LLM landscape?
*[ARCH] | ★★*

![Interview card Q66 The Open-Weight Landscape (as of Nov 2026): download the weights for privacy, no per-token bill and fine-tuning; the best open models trail closed ones by about 4 months; open weights are not open source and the licence decides; restaurant vs sauce-in-a-jar analogy; weight memory is about total params x bytes and compute per token about 2 x active params (Qwen3.5-397B-A17B about 198.5 GB at 4 bits, about 34 GFLOP per token); a three-step how-open-is-open ladder (closed API, open weights, open source OSI 1.0 with OLMo), licence tags permissive, conditions and custom, and a gap bar of about 4 months (Epoch AI, May 2026); table of DeepSeek V4-Pro 1.6T/49B MIT, Qwen 3.5 397B/17B Apache 2.0, Llama 4 Maverick 400B/17B Llama 4 Community Licence, gpt-oss-120b 117B/5.1B Apache 2.0; follow-ups on DeepSeek-V3 (about 5.6M dollars) and gpt-oss-20b in 16 GB; trap that open weights mean you can do anything (Llama 4 above 700M monthly users).](diagrams/iq33b_info_q66_open_weight_landscape_ai.png)

**Simple Answer:**
A closed model is like a restaurant: you order through a window (the API), pay per dish, and never see
the kitchen. An open-weight model is like getting the restaurant's signature sauce in a jar: you use it in
your own kitchen (your GPUs), nobody sees what you cook, and you can adjust it (fine-tune). What you usually
*don't* get is the recipe and the ingredient list — the training code and data — which is what "open
source" would really mean. Today the best open models trail the best closed ones by only a few
months, and small ones run on a laptop.

```
  HOW OPEN IS "OPEN"?        YOU GET                               EXAMPLES
  closed (API only)          a URL and a per-token bill            GPT-6, Claude 5.5, Gemini 4
  open weights               the weights file + a licence          Qwen, DeepSeek, Kimi, Llama, Gemma
  open source (OSI 1.0)      weights + training code + data info   OLMo (Ai2)

  THE LICENCE DECIDES WHAT YOU MAY DO
  permissive   Apache 2.0, MIT     use, modify, sell     Qwen, gpt-oss, Gemma 4, DeepSeek, GLM-5
  conditions   modified MIT        MIT + extra terms     Kimi K2; Mistral Large 4
  custom       own licence + AUP   limits on use/users   Llama 4, Muse, Kimi K3

  HOW IT GOT HERE
  2023 LLaMA, Llama 2 → 2024 Llama 3, DeepSeek-V3 → Jan 2025 DeepSeek-R1
  → 2026 Qwen3.5, DeepSeek V4, Kimi K3, Muse Spark Open   (gap to closed: about 4 months)
```

(AUP = acceptable-use policy. Llama 4's licence, for example, makes companies with more than 700 million monthly active users ask Meta for permission.)

**Official Definition:**
> **Open-weight models** publish their trained parameters for download under a licence, so anyone can run,
> fine-tune and deploy them on their own hardware. **Open-source AI** in the Open Source Initiative's sense
> (Open Source AI Definition 1.0, Oct 2024) also requires the training code and enough information about the
> data to rebuild a similar system. Most "open" LLMs are open weights, not open source, and their licences
> range from permissive (Apache 2.0, MIT) to custom licences with conditions on use.

> **Maths in one line:** `weight memory ≈ total parameters × bytes per weight`, `compute per token ≈ 2 × active parameters` — an open MoE model needs memory for all of its experts but pays compute only for the few it uses (Qwen3.5-397B-A17B: about 198.5 GB at 4 bits, yet about 34 GFLOP per token).

**Interview Answer:**

**Say this first (30 sec):** Open-weight models — Qwen, DeepSeek, Kimi, GLM, gpt-oss, Gemma, Llama and Muse, Mistral — let you download the weights and run them yourself, so data stays in your network, there is no per-token bill, and you can fine-tune deeply. Epoch AI (May 2026) measured the best of them about 4 months behind the best closed models. But "open weights" is not "open source": the training data is almost never released, and the licence decides what you may do.

Snapshot — notable open-weight models, as of Nov 2026 (from [Ch 20 §20.3](#content/20_2026_landscape)):

| Model (lab) | Released | Total / active parameters | Licence |
|---|---|---|---|
| **Kimi K3 / K3.1 Pro** (Moonshot AI) | Jul 2026 / Oct 23, 2026 | 2.8T / 104B — among the largest open releases so far | Kimi K3 (and K3.1 Pro) License — custom |
| **DeepSeek V4-Pro / V4-Flash** | Apr 2026 | 1.6T / 49B; 284B / 13B | MIT |
| **Muse Spark Open** (Meta) | Oct 15, 2026 | 816B / 42B, natively multimodal | Muse Model License |
| **Qwen 3.5 / 3.6** (Alibaba) | Feb / Apr 2026 | 397B / 17B flagship, sizes down to 0.8B | Apache 2.0 (check each card) |
| **Llama 4 Scout / Maverick** (Meta) | Apr 2025 | 109B / 17B; 400B / 17B | Llama 4 Community Licence |
| **gpt-oss-120b / 20b** (OpenAI) | Aug 2025 | 117B / 5.1B; 21B / 3.6B | Apache 2.0 |
| **Gemma 4** (Google) | Apr 2026 | E2B, E4B, 12B, 26B MoE, 31B dense | Apache 2.0 |

- **The shape (this part does not date):** the open frontier is mostly huge sparse MoE models, much of it from Chinese labs (Moonshot, Z.ai, DeepSeek, Alibaba); Muse Spark Open and Mistral Large 4 are the main Western flagships.
- **Why teams choose open:** privacy and data sovereignty, cost at very high volume (you pay for GPUs, not tokens), deep fine-tuning or distillation, and reproducible research.
- **Why they choose closed:** top-end agent reliability, the newest reasoning models, polished computer use, and zero operations work.
- **Hardware reality:** memory follows *total* parameters — Kimi K3's weights alone are about 1,400 GB at 4 bits (18 GPUs of 80 GB); gpt-oss-120b fits one 80 GB GPU; gpt-oss-20b runs in 16 GB.
- **Serving stack:** vLLM (the default) or SGLang on servers; Ollama, llama.cpp (GGUF files) or MLX locally. Hugging Face's TGI was archived in March 2026.

**Likely follow-ups:**

- *What made DeepSeek a turning point?* — V3's final training run took 2.788M H800 GPU-hours, about 5.6M dollars at 2 dollars per GPU-hour (final run only, not research); R1 (Jan 2025) then showed RL-trained reasoning in the open under MIT.
- *How do you pick an open model?* — (1) the licence allows your use; (2) total parameters × bytes fits your hardware; (3) the smallest model that passes *your* eval; (4) support in vLLM, llama.cpp and Hugging Face.
- *Self-host or call an API?* — Self-hosting pays only at high, steady volume or when data cannot leave; see [Q47](#content/33b_llm_interview_questions_part2) for the break-even.

**Trap:** "Open source means I can do anything with it." — Most models are open *weights* under a licence: Llama 4 requires "Built with Llama" attribution and a separate licence above 700 million monthly users, and Mistral Large 4 needs a commercial licence for model-as-a-service providers.

**Go deeper:** [Ch 20 §20.3](#content/20_2026_landscape) · [Ch 17 §4.6](#content/17_llm) · [Ch 17 §4.8](#content/17_llm) · [Ch 19 §19.11](#content/19_ai_frameworks) · [Q70](#content/33b_llm_interview_questions_part2)

---

### Q67. What are multimodal LLMs? What can they do beyond text?
*[APP] | ★★*

![Interview card Q67 Multimodal LLMs: 30-second answer, email-and-photos analogy, the patch-token formula n_tokens = ceil(H/p) x ceil(W/p), a bolt-on pipeline (image 336 x 336, 576 patches, vision encoder, projector, 576 image tokens, text LLM) beside native early fusion (image patches, audio frames and text tokens into one Transformer), a token-cost table (196, 576, 263 per second of video, 946,800 per hour), follow-ups and the understanding-is-not-generation trap](diagrams/iq33b_info_q67_multimodal_llms_ai.png)

**Simple Answer:**
Early LLMs could only read and write text. Multimodal LLMs can also look at images, listen to audio and
watch video — like the difference between someone who can only read emails and someone who can also look
at the attached photos and play the voice messages. The trick is simple: chop a picture into small square
tiles, turn each tile into a vector the model treats like a word, and feed those "image tokens" into the
same Transformer as the text. Most of these models still *answer* in text; pictures, video and voice are
usually made by separate generator models.

```
  A  BOLT-ON (LLaVA, Qwen-VL, InternVL)            B  NATIVE / EARLY FUSION (Gemini, GPT-4o, Llama 4)

  image 336 × 336 → 24 × 24 = 576 patches          image patches ──┐
     ▼  vision encoder (a CLIP or SigLIP ViT)      audio frames ───┼──► ONE Transformer trained
     ▼  projector (small MLP) → LLM width          text tokens ────┘    on all of them together
     ▼  576 image tokens spliced into the prompt
  text LLM ──► "A dog catching a frisbee."

  WHAT THEY DO                              WHAT IT COSTS (input tokens)
  read documents, forms, handwriting        224 × 224 image, 16-px patches  →     196
  explain charts and tables                 336 × 336 image, 14-px patches  →     576
  read UI screenshots (computer use)        1 s of video, Gemini API        →     263
  transcribe and translate audio            1 hour of video, Gemini API     → 946,800
  search and summarise video                (nearly a whole 1M-token window)
```

**Official Definition:**
> A **multimodal LLM** converts non-text inputs — images, audio, video — into token embeddings in the same
> space as text and processes them with one Transformer, so it can reason across modalities. It is built
> either by attaching a pretrained modality encoder to a text LLM through a learned projector (bolt-on), or by
> training one model on interleaved text, image, audio and video data (native, or early fusion). "Native" is
> a spectrum: some early-fusion models still use a vision encoder, and a few take raw patches with no encoder.

> **Maths in one line:** `n_tokens = ⌈H/p⌉ · ⌈W/p⌉` — cut an H × W image into p × p tiles and each tile becomes one token: 224 × 224 with p = 16 gives 196 tokens, and doubling the resolution gives 4× the tokens.

**Interview Answer:**

**Say this first (30 sec):** A multimodal LLM turns images, audio and video into tokens in the same embedding space as words, so one Transformer reasons over all of them. It is built either bolt-on — a pretrained vision encoder plus a small projector into a text LLM, like LLaVA — or natively, one model trained on mixed modalities, like Gemini. Every image or frame costs tokens — 576 for a 336 × 336 image in LLaVA-1.5 — so resolution and frame rate drive cost and latency.

What the main model families take in and give out, as of Nov 2026 (from [Ch 17 §4.9](#content/17_llm)):

| Model family | Takes in | Gives out |
|---|---|---|
| Claude 5.5 family | text, images | text |
| GPT-6 family (API model pages) | text, images | text (images and voice come from separate models or tools) |
| Gemini 4 Argon | text, images, audio, video | text |
| Gemma 4 | text, images, video; audio on E2B, E4B and 12B | text |
| Llama 4 | text, images | text |

- **Bolt-on vs native:** bolt-on is cheap — train the projector, then fine-tune — but the encoder is a bottleneck. Native learns modalities together and eases any-to-any output, but needs vast joint pre-training.
- **Cutting the token bill:** merge 2 × 2 neighbouring patches (576 → 144), use a fixed resampler (32–64 tokens per image), lower the resolution, sample fewer video frames, or crop to the region that matters.
- **Documents and RAG:** models read scans, charts and screenshots without a separate OCR step; ColPali-style retrievers embed page *images* directly, which keeps tables and figures ([Ch 19 §19.9](#content/19_ai_frameworks)).
- **The output side:** images come as discrete codes the LLM predicts (Chameleon) or from a diffusion head it conditions (Transfusion). Native voice: GPT-4o answered in about 0.32 s on average, against 2.8–5.4 s for the old speech-to-text → LLM → text-to-speech chain.

**Likely follow-ups:**

- *Why does the bolt-on design need a projector?* — The encoder's features (say 1,024 numbers) live in a different space from the LLM's word embeddings (say 4,096); a small MLP maps each one so the LLM can read it like a word.
- *How is a bolt-on model trained?* — Stage 1 trains only the projector on image–caption pairs (about 558K for LLaVA-1.5); stage 2 instruction-tunes on about 665K examples; keep mixing in text-only data or writing skills regress.
- *How do you evaluate one?* — MMMU (about 11.5K college-level image-and-text questions), DocVQA, ChartQA, MathVista, Video-MME — plus your own set, because models invent details that are not in the image.

**Trap:** "A model that understands images can also generate them." — Understanding (pixels in, text out) and generation are separate jobs: the main API models return text, and images, video and voice come from dedicated generators such as gpt-image-2, Nano Banana and Veo 3.1 ([Ch 20 §20.5](#content/20_2026_landscape)).

**Go deeper:** [Ch 17 §4.9](#content/17_llm) · [Ch 17b §9.5](#content/17b_llm_applications) · [Ch 20 §20.5](#content/20_2026_landscape) · [Ch 16 §4.3](#content/16_deep_learning)

---

### Q68. What is the EU AI Act and how does it affect LLM development?
*[SAFE] | ★★*

![Interview card Q68 The EU AI Act: 30-second answer, food-safety analogy, the top-fine formula max of 35 million euros or 7 percent of worldwide turnover (7 billion euros for a 100 billion euro company), a four-tier stack of AI systems by use (unacceptable banned, high risk strict, limited disclose, minimal free) beside the GPAI model duties with the 10 to the 25 training-FLOPs systemic-risk line, a key-dates table as of Nov 2026 (2 Feb 2025, 2 Aug 2025, 2 Aug 2026, 2 Dec 2027 and 2 Aug 2028), follow-ups and the minimal-risk trap](diagrams/iq33b_info_q68_eu_ai_act_ai.png)

**Simple Answer:**
The EU AI Act is the first broad law that regulates AI by how risky its *use* is — like food-safety rules:
some ingredients are banned, baby food gets strict inspections, most packaged food just needs a label, and
plain water needs nothing. The same LLM can be harmless in a video game and high-risk when it screens job
applicants. On top of that, the companies that make the base models (general-purpose AI, "GPAI") have
their own rulebook: document the model, summarise its training data, respect copyright — and, for the very
largest models, test for and report serious risks. The rules switch on in stages, and a 2026 amendment
pushed the high-risk dates back.

```
  AI SYSTEMS — the rule follows the USE              GENERAL-PURPOSE AI MODELS (GPAI)
  ┌──────────────────────────────────────────────┐   the model maker's own track:
  │ UNACCEPTABLE  social scoring, emotion        │   all GPAI providers (since 2 Aug 2025):
  │ → banned      recognition at work or school  │     technical documentation,
  ├──────────────────────────────────────────────┤     public summary of training content,
  │ HIGH RISK     hiring, credit, education      │     copyright policy
  │ → strict      risk management, oversight     │   systemic risk (> 10²⁵ training FLOPs):
  ├──────────────────────────────────────────────┤     + evaluations, incident reporting,
  │ LIMITED       chatbots, deepfakes            │       cybersecurity
  │ → disclose    "you are talking to an AI"     │
  ├──────────────────────────────────────────────┤   top fines: up to €35M or 7% (banned uses)
  │ MINIMAL       spam filters, video games      │                    €15M or 3% (GPAI duties)
  │ → free        voluntary codes only           │
  └──────────────────────────────────────────────┘

  KEY DATES  bans 2 Feb 2025 · GPAI 2 Aug 2025 · general application 2 Aug 2026
             high-risk: 2 Dec 2027 (Annex III uses) · 2 Aug 2028 (regulated products)
```

**Official Definition:**
> The **EU AI Act** (Regulation (EU) 2024/1689, in force since 1 Aug 2024) regulates AI *systems* by risk tier
> — prohibited practices, high-risk systems, transparency duties, minimal risk — and separately regulates
> **general-purpose AI (GPAI) models**, with extra duties for models with systemic risk, presumed above 10²⁵
> floating-point operations of training compute. It applies to anyone placing AI on the EU market, wherever
> they are based. The **Digital Omnibus on AI** (Regulation (EU) 2026/1744, in force 27 Jul 2026) amended its dates.

> **Maths in one line:** `top fine = max(€35M, 7% × worldwide annual turnover)` for a banned practice — for a company with €100B turnover that is €7B, so the percentage, not the fixed amount, is what bites for big tech (GPAI breaches: up to €15M or 3%).

**Interview Answer:**

**Say this first (30 sec):** The EU AI Act regulates AI by use: a few practices are banned, high-risk uses like hiring or credit need risk management, documentation and human oversight, and chatbots and deepfakes must disclose they are AI. Model makers have their own GPAI duties since 2 Aug 2025 — documentation, a training-content summary, a copyright policy — plus evaluations, incident reporting and cybersecurity above 10²⁵ training FLOPs. The 2026 Digital Omnibus moved the high-risk rules to Dec 2027 and Aug 2028.

The EU AI Act timeline, as amended by the Omnibus (from [Ch 20 §20.11](#content/20_2026_landscape), verified Nov 2026):

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

- **For an LLM team:** classify each *system* by its use — a support chatbot has transparency duties, a CV screener is high-risk (Annex III). Training your own GPAI model makes you a GPAI provider.
- **Code of Practice (10 Jul 2025):** voluntary, with three chapters — transparency, copyright, and safety and security (the last only for systemic-risk models). Most frontier labs signed; Meta declined.
- **Open-source carve-out:** free and open-source GPAI models skip the documentation duties toward the AI Office and downstream providers, but still need the copyright policy and training summary — and lose the carve-out at systemic risk.
- **The Omnibus also:** added two bans from 2 Dec 2026 (AI that generates non-consensual intimate images or child sexual abuse material), extended small-company relief to small mid-caps, and gave the AI Office direct oversight of systems built on a provider's own GPAI model.

**Likely follow-ups:**

- *Is 10²⁵ FLOPs a lot?* — Training compute ≈ 6 × parameters × tokens: Llama 3 405B on 15.6T tokens is about 3.8 × 10²⁵ (above); a 70B model on 15T tokens is about 6.3 × 10²⁴ (below). The Commission can also designate models on other criteria, such as reach.
- *What about the US?* — No federal AI statute; EO 14365 (Dec 2025) seeks to pre-empt state AI laws but had displaced none by late Oct 2026. California's SB 53 (since 1 Jan 2026) makes frontier developers publish a safety framework and report critical incidents; Colorado repealed its broad AI Act in May 2026, before it took effect.
- *Who tests frontier models before release?* — Government institutes (the UK AI Security Institute; the US Center for AI Standards and Innovation, renamed from the US AI Safety Institute in Jun 2025) and the labs' own frontier-safety frameworks, such as Anthropic's Responsible Scaling Policy (version 3 since Feb 2026).

**Trap:** "LLMs are minimal-risk, so the Act barely touches them." — Model makers have had GPAI duties since Aug 2025, and the tier follows the *use*: the same model is minimal-risk in a game and high-risk when it screens CVs (from 2 Dec 2027, not Aug 2026 as older notes say).

**Go deeper:** [Ch 20 §20.11](#content/20_2026_landscape) · [Ch 19 §19.12b](#content/19_ai_frameworks) · [Q54](#content/33b_llm_interview_questions_part2) · [Q59](#content/33b_llm_interview_questions_part2)

---

# PART 9 — Advanced Alignment & Production

---

### Q69. What is DPO (Direct Preference Optimization) and how does it differ from RLHF/PPO?
*[TRAIN] | ★★★*

![Interview card Q69 DPO vs RLHF/PPO: 30-second answer, live-practice versus answer-key analogy, the DPO implicit reward r_hat = beta x log(pi_theta / pi_ref), an online PPO-RLHF loop (policy, sample answers, reward model scores, critic baseline and PPO update, with a frozen reference as KL leash; 4 models, about 252 GB for 7B) beside an offline DPO chain (fixed pairs, policy and reference log-probs, DPO loss, policy; 2 models, about 126 GB), a comparison table with GRPO + RLVR, follow-ups and the cannot-reward-hack trap](diagrams/iq33b_info_q69_dpo_vs_rlhf_ppo_ai.png)

**Simple Answer:**
RLHF with PPO is like hiring a judge and running live practice: the model writes new answers, the judge (a reward model) scores them, and a coach (PPO) adjusts the model after every round. DPO is like studying a fixed answer key of "A beats B" pairs: no judge, no live practice, just one supervised loss. The answer key is cheaper and steadier; live practice costs more but lets the model learn from its *own* latest mistakes, which is why online RL is still used for reasoning and code. (The DPO loss itself is taught in [Q15 in Part 1](#content/33_llm_interview_questions); this answer is the practical comparison.)

```
                     PPO-RLHF (online)                      DPO (offline)
  ─────────────────  ─────────────────────────────────────  ───────────────────────────────────────
  before training    train a reward model on the pairs      nothing (log π_ref can be cached once)
  one training step  sample answers ─▶ reward model scores  read a stored pair (x, y_w, y_l)
                     ─▶ critic baseline ─▶ PPO update       ─▶ policy & ref log-probs ─▶ DPO loss
  models held        policy + critic (trained)              policy (trained)
                     reference + reward model (frozen)      reference (frozen)
  7B training state  ≈ 252 GB                               ≈ 126 GB (112 GB with cached log π_ref)
  main knobs         β, clip ε, critic, rollout settings    β ≈ 0.1, learning rate ≈ 10⁻⁶
  learns from        its OWN fresh answers                  answers written before training
```

**Official Definition:**
> **DPO** (Rafailov et al., 2023) optimises the same KL-regularised objective as RLHF (maximise reward while paying β for every nat of drift from the reference model), but uses that objective's closed-form optimal policy to turn the problem into a logistic (Bradley–Terry) loss on a fixed set of chosen/rejected pairs: no reward model, no sampling, no RL loop. **RLHF with PPO** fits an explicit reward model first, then runs online, on-policy RL: it samples fresh answers, scores them, and takes clipped policy-gradient steps using a learned critic.

> **Maths in one line:** `r̂(x, y) = β · log( π_θ(y|x) / π_ref(y|x) )` — DPO's implicit reward is how much more likely the policy makes an answer than the frozen reference does. The policy *is* the reward model, so it can be over-optimised just like an explicit one.

**Interview Answer:**

**Say this first (30 sec):** "Both chase the same goal: answers people prefer, on a KL leash to the SFT model. PPO-RLHF trains a reward model and then runs online RL with four models in memory, about 252 GB of training state for a 7B model; DPO turns it into one supervised loss on fixed preference pairs with two models, about 126 GB. DPO is the cheap, stable default for offline pairs; online RL (PPO, or GRPO with verifiable rewards) still wins when the model must learn from its own fresh mistakes, as in maths, code and reasoning."

| | PPO-RLHF | DPO | GRPO with verifiable rewards (RLVR) |
|---|---|---|---|
| Training data | prompts; answers sampled live, scored by a reward model | a fixed set of chosen/rejected pairs | prompts; a group of G answers each, scored by a checker |
| Models held (7B state) | policy, critic, reference, reward model: ≈ 252 GB | policy + reference: ≈ 126 GB | policy + reference: ≈ 126 GB, plus a verifier function |
| Stability | fiddly: β, clip ε, critic and rollout settings | stable: β ≈ 0.1 and a tiny learning rate | in between: group size, clip, KL; prompts must be neither too easy nor too hard |
| Typical use | online preference tuning, when you can afford it | the default offline preference step (Llama 3, Tulu 3) | reasoning, maths and code (DeepSeek-R1) |

- **PPO can still win:** it beat DPO on every testbed of Xu et al. (ICML 2024), notably code contests, and by up to 2.5% on maths in Ivison et al. (2024).
- **Why:** DPO is offline, so it never sees its own new mistakes. Meta found SFT and DPO "over-constrain" exploration, so Llama 4 ran light SFT → online RL → light DPO.
- **Data matters most:** in Ivison et al. better preference data was the biggest lever (up to 8% on instruction following and truthfulness), ahead of the algorithm choice.
- **Both fail, differently:** PPO games its reward model (verbosity, sycophancy); DPO over-optimises its implicit reward, often within one epoch (Rafailov et al., 2024), and exploits length bias (Park et al., 2024).
- **Recipes stack them:** Llama 3 chose SFT + rejection sampling + DPO over RL methods that "tend to be less stable and harder to scale"; Tulu 3 ran SFT → DPO → RLVR.

Pick a DPO variant by the data you have (details in [Ch 17 §3.5](#content/17_llm)):

| Variant | What it changes | Reference model? |
|---|---|---|
| IPO (Azar et al., 2023) | a squared loss towards a fixed margin, so the gap cannot run to infinity on near-deterministic pairs | yes |
| KTO (Ethayarajh et al., 2024) | learns from single thumbs-up / thumbs-down labels; no pairs needed | yes |
| ORPO (Hong et al., 2024) | adds an odds-ratio penalty to the SFT loss, so SFT and alignment are one stage | no |
| SimPO (Meng et al., 2024) | reward = average per-token log-prob, plus a target margin; curbs length growth | no |

**Likely follow-ups:**

- *When would you pick PPO or GRPO over DPO?* — When fresh samples can be scored (a strong reward model or a verifier) and the model must fix its own errors: reasoning, code, agents. Checkable answers → GRPO.
- *What is online (iterative) DPO?* — Sample two answers from the current policy, let a reward model or LLM judge pick the winner, train DPO on them, repeat. Google DeepMind's OAIF (Guo et al., 2024) beat offline DPO and RLHF.
- *How do you catch DPO over-optimising?* — Implicit-reward margins keep growing while the held-out, length-controlled win rate stalls and answers lengthen. Stop early, raise β, add a length penalty, or try IPO.

**Trap:** "DPO has no reward model, so it cannot reward-hack" — it still over-optimises its implicit reward β·log(π_θ/π_ref) and learns the length bias in its data (Rafailov et al., 2024; Park et al., 2024), so it needs the same held-out, length-controlled checks as RLHF.

**Go deeper:** [Q15 in Part 1](#content/33_llm_interview_questions) (the DPO loss) · [Q14 in Part 1](#content/33_llm_interview_questions) (RLHF) · [Ch 17 §3.5c](#content/17_llm) (choosing an algorithm, reward hacking) · [Ch 17 §3.5b](#content/17_llm) (GRPO)

---

### Q70. What is Mixture of Experts (MoE)? How does it give more capacity at constant FLOPs?
*[ARCH] | ★★★*

![Interview card Q70 MoE, more capacity at the same FLOPs: 30-second answer, 256-shelf library analogy, FLOPs per token about 2 x N_active and weight memory = N_total x bytes per weight, one DeepSeek-V3 layer comparing a dense FFN of width 18,432 (396M stored, 0.79 GFLOP per token) with an MoE FFN of router, top-8 of 256 routed experts plus 1 shared expert (11.3B stored, same 0.79 GFLOP, 28.6x the parameters), whole-model tiles (dense 37B 74 GFLOP 37 GB, DeepSeek-V3 74 GFLOP 671 GB, dense 671B 1,342 GFLOP 671 GB), a table of Mixtral 8x7B, DeepSeek-V3 and gpt-oss-120b, follow-ups and the topic-expert trap](diagrams/iq33b_info_q70_moe_capacity_constant_flops_ai.png)

**Simple Answer:**
Picture a library with 256 shelves, where each question may read from only 8 of them plus one reference shelf that every question uses. Adding shelves makes the library know more, yet each question still costs 9 shelves of reading. MoE does this inside each Transformer layer: the feed-forward block (FFN) becomes many small "expert" FFNs, and a router picks a few per token, so the parameters (capacity) grow while the compute per token stays flat. The catch: the building must hold every shelf, so every expert must sit in memory. (Routing basics are in [Q12 in Part 1](#content/33_llm_interview_questions).)

```
  SAME FLOPs, 28.6× THE PARAMETERS: one DeepSeek-V3 layer (hidden size d = 7,168)

  DENSE FFN   token ──▶ [ one FFN, width 18,432 ] ──▶ out
              stored 396M · used 396M · ≈ 0.79 GFLOP per token

  MoE FFN     token ──▶ router ──▶ top-8 of 256 routed experts, width 2,048 each ──┐
                    └─────────────▶ 1 shared expert, always on, width 2,048 ───────┴──▶ out
              used   (8 + 1) × 2,048 = 18,432 wide → 396M · ≈ 0.79 GFLOP   (the same)
              stored 257 experts × 44.0M = 11.3B                           (28.6×)

  WHOLE MODEL   stores 671B (671 GB at FP8)  ·  runs 37B per token ≈ 74 GFLOP
  DENSE 671B    would run ≈ 1,342 GFLOP per token: 18× the compute
```

**Official Definition:**
> A **Mixture-of-Experts (MoE)** Transformer replaces the dense FFN in some or all layers with N expert FFNs and a learned router that sends each token to its top-k experts, often alongside always-on shared experts. Compute per token scales with the *active* parameters (the chosen experts plus attention, embeddings and shared parts), while capacity and weight memory scale with the *total*, so adding experts raises capacity at constant FLOPs per token. Training needs load balancing; serving at scale needs expert parallelism with all-to-all communication.

> **Maths in one line:** `FLOPs per token ≈ 2 × N_active`, `training FLOPs ≈ 6 × N_active × D`, `weight memory = N_total × bytes per weight` — compute follows the active parameters, memory follows the total.

**Interview Answer:**

**Say this first (30 sec):** "MoE turns each FFN into many experts plus a router that runs only the top-k per token, so compute follows the active parameters (about 2 FLOPs per active parameter per token) while capacity follows the total. DeepSeek-V3 stores 671B parameters but runs 37B per token, about 74 GFLOP like a dense 37B model, yet its base model beat the dense Llama 3.1 405B on most benchmarks. The bill moves to memory and communication: all 671 GB (FP8) must be loaded, and experts spread across GPUs need all-to-all traffic."

| Evidence: capacity without the compute | Active per token | Total stored | Result |
|---|---|---|---|
| Switch Transformer vs dense T5-Base / T5-Large (Google, 2021) | the same FLOPs | many times more | up to 7× faster pre-training |
| Mixtral 8x7B vs dense Llama 2 70B | 12.9B vs 70B | 46.7B vs 70B | matched or beat it on most benchmarks |
| DeepSeek-V3 vs dense Llama 3.1 405B (base models) | 37B vs 405B | 671B vs 405B | MMLU 87.1 vs 84.4, MATH 61.6 vs 49.0, on under a tenth of the estimated training FLOPs |

- **Why FLOPs stay flat:** each token pays for its k experts plus the shared parts (attention, embeddings, shared expert); more experts grow only the stored total.
- **Many small experts:** top-8 of 256 + 1 shared (DeepSeek-V3), top-4 of 128 (gpt-oss-120b, 5.1B of 117B active); Mixtral's top-2 of 8 is older. Active share: ~28% → ~3–6%.
- **Memory holds every expert:** 671 GB at FP8 overflows one 8×H100 node (640 GB), the KV cache does not shrink, and with uniform routing 64 batched tokens touch ~87% of the experts.
- **Expert parallelism:** experts sit on different GPUs, so each MoE layer needs two all-to-all exchanges (dispatch, combine). DeepSeek-V3 caps each token at 4 nodes; a hot expert's GPU becomes the straggler.
- **Load balancing:** unchecked, routing collapses onto a few experts. Fixes: auxiliary loss `α·N·Σ fᵢPᵢ` (α ≈ 0.01), capacity limits with token dropping, or DeepSeek-V3's bias-based balancing (no dropped tokens).
- **Not free:** Meta kept Llama 3 dense "to maximize training stability"; MoE also makes fine-tuning and small-batch or on-device serving harder.

**Worked example:** DeepSeek-V3's expert layout from its config.json: one MoE layer costs the same FLOPs as the dense FFN it replaces while holding 28.6× the parameters, and adding experts grows memory but not compute per token (the router itself is tiny).

```python
# MoE capacity at constant FLOPs: DeepSeek-V3's expert layout (config.json), then a sweep over the number of experts
d, moe_layers, w, k, shared, dense_ffn = 7168, 58, 2048, 8, 1, 18432   # 61 layers = 3 dense + 58 MoE
expert = 3 * d * w                         # one SwiGLU expert (gate, up, down matrices): 44.0M parameters
assert (k + shared) * w == dense_ffn       # 8 routed + 1 shared experts are exactly as wide as the dense FFN
dense_layer, used, stored = 3 * d * dense_ffn, (k + shared) * expert, (256 + shared) * expert
print(f"one dense FFN layer: {dense_layer / 1e6:6,.0f}M stored, {dense_layer / 1e6:,.0f}M used, "
      f"{2 * dense_layer / 1e9:.2f} GFLOP/token")
print(f"one MoE FFN layer  : {stored / 1e6:6,.0f}M stored, {used / 1e6:,.0f}M used, "
      f"{2 * used / 1e9:.2f} GFLOP/token  ({stored / used:.1f}x the parameters)")

always_on = 37e9 - moe_layers * used       # attention, embeddings, 3 dense layers = the rest of the reported 37B
print(f"\nalways-on parts {always_on / 1e9:.1f}B; sweep the routed experts N (top-{k} + {shared} shared each time):")
print("    N   total = FP8 GB   active (B)   GFLOP/token   fits one 8 x H100 node (640 GB)?")
for n in [8, 64, 256, 1024]:
    total = always_on + moe_layers * (n + shared) * expert
    active = always_on + moe_layers * used
    fits = "yes" if total / 1e9 <= 640 else "no"
    note = "  <- every expert runs: a dense model" if n == k else "  <- DeepSeek-V3 (reported 671B)" if n == 256 else ""
    print(f"{n:5d}  {total / 1e9:15,.1f}  {active / 1e9:11.1f}  {2 * active / 1e9:12.0f}   {fits:3s}{note}".rstrip())
    if n == 256:
        assert abs(total - 671e9) < 1e9    # config + reported active (37B) -> reported total (671B)

tokens = 14.8e12                           # DeepSeek-V3 pre-training tokens; training FLOPs = 6 x active x tokens
moe, dense671, llama = 6 * 37e9 * tokens, 6 * 671e9 * tokens, 6 * 405e9 * 15.6e12
print(f"\ntraining FLOPs: MoE {moe:.1e} | dense 671B on the same tokens {dense671:.1e} ({dense671 / moe:.0f}x)")
print(f"                dense Llama 3.1 405B on 15.6T tokens {llama:.1e} ({llama / moe:.1f}x the MoE)")
```

**Output:**

```
one dense FFN layer:    396M stored, 396M used, 0.79 GFLOP/token
one MoE FFN layer  : 11,318M stored, 396M used, 0.79 GFLOP/token  (28.6x the parameters)

always-on parts 14.0B; sweep the routed experts N (top-8 + 1 shared each time):
    N   total = FP8 GB   active (B)   GFLOP/token   fits one 8 x H100 node (640 GB)?
    8             37.0         37.0            74   yes  <- every expert runs: a dense model
   64            180.0         37.0            74   yes
  256            670.5         37.0            74   no   <- DeepSeek-V3 (reported 671B)
 1024          2,632.2         37.0            74   no

training FLOPs: MoE 3.3e+24 | dense 671B on the same tokens 6.0e+25 (18x)
                dense Llama 3.1 405B on 15.6T tokens 3.8e+25 (11.5x the MoE)
```

**Likely follow-ups:**

- *Same FLOPs, so is it as cheap to serve as a dense 37B?* — No: 671 GB of weights instead of 37 GB, most experts read every step once batched, plus all-to-all latency. It pays off at large batch on a fast cluster.
- *Expert vs tensor parallelism?* — Tensor parallelism splits every weight matrix across GPUs and all-reduces each layer; expert parallelism puts whole experts on different GPUs and ships tokens to them. DeepSeek serves V3 with EP32 (prefill) and EP144 (decode).
- *Does Google use MoE?* — Yes: the Gemini 3 Pro model card calls it a sparse MoE that decouples "total model capacity from computation and serving cost per token"; Google built much of the field (GShard, Switch Transformer).

**Trap:** Describing MoE as "top-1 or top-2 routing to a code expert and a maths expert" — modern MoEs send each token to many small experts (top-8 of 256 + 1 shared in DeepSeek-V3, top-4 of 128 in gpt-oss-120b), and experts learn token and syntax patterns, not topics (the Mixtral paper found no clear topic specialisation).

**Go deeper:** [Q12 in Part 1](#content/33_llm_interview_questions) (routing basics) · [Ch 17 §4.8](#content/17_llm) · [Ch 16 §6.1](#content/16_deep_learning) · [Ch 17c §2.6](#content/17c_llm_systems) (expert parallelism at serving time)

---

### Q71. What is prompt caching and how does it reduce cost and latency?
*[DEPLOY] | ★★*

![Interview card Q71 Prompt Caching: a 4,000-token system prompt plus a 100-token user message is billed 5,100 tokens on the first request (cache write at 1.25x) and 500 tokens on a cache hit (read at 0.1x), 12% of the uncached 4,100; layout rule puts tools, system prompt, documents and history first and the new message last, while a timestamp at the top never hits; 10-turn chat table: off 100%, warm 26%, expired 125% of the input bill.](diagrams/iq33b_info_q71_prompt_caching_ai.png)

**Simple Answer:**
Before it writes a word, the model must read the whole prompt (the *prefill*). In a chat app or an agent that means re-reading the same long system prompt, tool list and conversation history on every call. Prompt caching lets the provider keep the attention state it computed for that identical opening — the KV cache — and reuse it on the next request, so only the new tokens are processed.

Think of a teacher who has already annotated the textbook: for each new question they open their notes instead of re-reading the book. But the notes only fit the *exact same book from page one* — change one word near the start and they must read everything again.

```
  ONE CHAT REQUEST: 4,000-token system prompt + 100-token user message
  ────────────────────────────────────────────────────────────────────
  NO CACHE (every request)
  [ system prompt 4,000 ][ user 100 ]    prefill 4,100 tokens
                                         billed as 4,100 input tokens

  WITH PROMPT CACHING (read = 0.1× input price, write = 1.25×)
  Request 1, miss: [ system prompt 4,000 ][ user 100 ]
                     └ prefill + WRITE      billed as 4,000 × 1.25 + 100 = 5,100
  Request 2, hit:  [ system prompt 4,000 ][ user 100 ]
                     └ READ saved KV        billed as 4,000 × 0.1  + 100 =   500
                                          └ prefill only these 100 tokens

  Per hit: input bill 500 / 4,100 = 12% (88% off), prefill 100 tokens, not 4,100
  Unchanged: decode speed (TPOT), output price, and the answer itself

  THE LAYOUT RULE: the cache only matches from the first token
  GOOD  [ tools ][ system prompt ][ examples, documents ][ history ][ new msg ]
        └──────────────── identical on every call ─────────────────┘└ varies ─┘
  BAD   [ timestamp ][ system prompt ][ ... ]   ← changes every call, never hits
```

**Official Definition:**
> **Prompt caching** (provider-side *prefix caching*) stores the key and value tensors computed during prefill
> for a prompt prefix, keyed by a hash of that exact prefix. A later request whose rendered prefix — tools,
> system prompt, then messages — matches token for token reuses them and prefills only the remaining tokens.
> The output is unchanged; cached tokens are billed at a steep discount, a cache write may cost a premium,
> and entries expire after a lifetime of minutes to hours.

> **Maths in one line:** `input bill = (new tokens + r × cached tokens) × input price`, with read multiplier r = 0.025–0.1 and a one-off write at w = 1.25× — 4,000 cached + 100 new tokens cost (100 + 400) ÷ 4,100 = 12% of the uncached bill.

**Interview Answer:**

**Say this first (30 sec):** Prompt caching reuses the provider's saved KV cache for a prompt prefix it has already processed, so a repeated system prompt, tool list or chat history is not prefilled again. Cached input tokens cost 90–97.5% less, and time-to-first-token drops because only the new tokens are prefilled. It matches only an identical prefix, so the design rule is: stable content first, anything that changes last.

- **Mechanism:** the provider hashes the prompt up to a cache breakpoint; a request with the same tokens up to that point reads the stored K/V tensors instead of recomputing them — the same idea as vLLM's automatic prefix caching, offered as an API feature.
- **What it saves:** input price and prefill time for the cached part only. New tokens and all output tokens pay full price; decode speed is unchanged.
- **When it loses money:** with a 1.25× write and 0.1× read it pays only above a (1.25 − 1) ÷ (1.25 − 0.1) ≈ 22% hit rate; a prefix reused once an hour keeps expiring.
- **Where it shines:** multi-turn chat and agents (the whole history is re-sent every turn), long fixed documents, many-shot prompts. RAG gains little when the retrieved passages change on every call.

| Vendor (as of Nov 2026) | How it is turned on | Minimum prefix | Lifetime | Read · write (× input price) |
|---|---|---|---|---|
| OpenAI (GPT-5.6 and later) | Automatic; optional explicit breakpoints (`prompt_cache_breakpoint`) | 1,024 tokens | 30 min by default, 12 h option | 0.1× (0.05× on GPT-6.1 Sol and Terra) · 1.25×, 2.5× for 12 h |
| Anthropic (Claude) | Opt in with `cache_control`: once at the top level (automatic) or on up to 4 blocks | 512 tokens on the newest Claude models (up to 4,096 on older ones) | 5 min, refreshed by each hit; 1 h option | 0.1× (0.05× Opus and Sonnet 5.5, 0.025× Fable 5.1) · 1.25×, 2× for 1 h |
| Google (Gemini) | Implicit caching is automatic; explicit `caches.create` only on supported Gemini 3 and 2.5 models, not Gemini 4 Argon | 4,096 tokens on Gemini 3 and 4 | Implicit: managed by Google; explicit: a TTL you set, plus an hourly storage fee | 0.1× (Gemini 3.8 Flash), 0.05× (Gemini 4 Argon) · no write premium |

**Worked example:** a 10-turn chat re-sends its whole history every turn; a warm cache turns most of it into cheap reads, but a cache that expires between turns makes every turn pay the 1.25× write price.

```python
# Prompt caching in a 10-turn chat: the input bill with no cache, a warm cache, and a cache that expires between turns
SYSTEM, USER, REPLY, TURNS = 3_000, 150, 350, 10   # tokens: system prompt + tools, each user message, each reply
P_IN = 2.00                                        # illustrative input price, USD per 1M tokens
READ, WRITE = 0.10, 1.25                           # cache hit = 10% of the input price; cache write = 125%

def chat(mode):                                    # mode: "off", "warm" (hit every turn), "expired" (miss every turn)
    usd = prefilled = cached = 0
    for t in range(1, TURNS + 1):
        prompt = SYSTEM + t * USER + (t - 1) * REPLY   # the whole history is re-sent on every turn
        hit = cached if mode == "warm" else 0          # tokens read from the cache
        new = prompt - hit                             # tokens the model must prefill
        usd += (hit * READ + new * (1.0 if mode == "off" else WRITE)) * P_IN / 1e6
        prefilled += new
        cached = prompt                                # the breakpoint moves to the end of this prompt
    return usd, prefilled, new

base = chat("off")[0]
print(f"{'cache':<9}{'input USD/chat':>15}{'vs no cache':>12}{'tokens prefilled':>18}{'turn 10':>9}")
for mode in ["off", "warm", "expired"]:
    usd, prefilled, last = chat(mode)
    print(f"{mode:<9}{usd:>15.4f}{usd / base:>12.0%}{prefilled:>18,}{last:>9,}")

usd_warm, pre_warm, _ = chat("warm")
assert pre_warm == SYSTEM + TURNS * USER + (TURNS - 1) * REPLY and chat("expired")[0] > base
print(f"At 100,000 chats a day: {100_000 * base:,.0f} vs {100_000 * usd_warm:,.0f} USD a day of input")
```

**Output:**

```
cache     input USD/chat vs no cache  tokens prefilled  turn 10
off               0.1080        100%            54,000    7,650
warm              0.0284         26%             7,650      500
expired           0.1350        125%            54,000    7,650
At 100,000 chats a day: 10,800 vs 2,839 USD a day of input
```

A warm cache cuts the input bill to 26% and turn 10's prefill from 7,650 tokens to 500 (about 765 ms → 50 ms at Ch 17c's assumed 10,000 prefill tokens per second). If every reply comes after the cache has expired — or a timestamp sits at the top — each turn pays the 1.25× write and reads nothing: 125%, worse than no cache.

**Likely follow-ups:**

- *Prompt caching vs semantic caching?* — Prompt caching reuses the KV state of an identical prefix; the model still writes a fresh answer, so there is no correctness risk. A semantic cache returns a stored *answer* to a similar question — it skips the model but can serve a wrong one ([Ch 17c §2.4](#content/17c_llm_systems)).
- *How do you know it works?* — Read the usage fields (OpenAI `cached_tokens`; Anthropic `cache_read_input_tokens` and `cache_creation_input_tokens`) and track the token hit rate; a rate near zero usually means something dynamic sits near the top.
- *Is there a security angle?* — Caches are not shared across organisations, but a hit is faster than a miss, so in a multi-tenant app keep tenants apart (OpenAI `prompt_cache_key`, vLLM's cache salt) so timing cannot reveal another user's prompt.

**Trap:** "Prompt caching stores the answer, so a repeated question gets the same response" — no: it stores the KV state of the prompt prefix and the model generates a new answer; returning stored answers is semantic (response) caching.

**Go deeper:** [Ch 17c §2.4](#content/17c_llm_systems) · [Ch 19 §19.14](#content/19_ai_frameworks) · [Ch 17b §13.3](#content/17b_llm_applications) · [Q7 in Part 1](#content/33_llm_interview_questions) (KV cache) · [Q46](#content/33b_llm_interview_questions_part2) (TTFT)

---

### Q72. What are structured outputs and how does constrained decoding work?
*[DEPLOY] | ★★*

![Interview card Q72 Structured Outputs: constrained decoding writes the schema {"age": <integer>} token by token, with only 1 to 5 of 16 tokens legal at each step and the chatty token Sure rejected; one masking step turns logits 0.3, 0.2, 0.1, 0.8 with mask 1, 0, 0, 1 into probabilities 0.38, 0, 0, 0.62; a table compares prompt-only JSON, JSON mode and structured outputs.](diagrams/iq33b_info_q72_structured_outputs_ai.png)

**Simple Answer:**
Ask a model to "reply in JSON" and it usually will — until it opens with "Sure! Here is the JSON:" or forgets a closing quote, and the code that reads it crashes. Structured outputs turn "usually" into "always": at every step the server lets the model pick only tokens that keep the text valid for your schema.

It is like a paper form with boxes: you can write whatever you like inside a box, but you cannot write outside the boxes or skip a required one.

```
  UNCONSTRAINED: "Return the user as JSON with name, age and email"
  ─────────────────────────────────────────────────────────────────
  Sure! Here is the JSON:                        ← preamble: json.loads fails
  { "name": "Alice", "age": 30, "email": "alice@example.com }
                                                           ↑ missing quote

  CONSTRAINED: the schema is compiled into an automaton
  ─────────────────────────────────────────────────────────────────
  nothing written yet        → only  {  is legal
  after  {                   → only the key  "name"
  after  "name"              → only  :
  inside a string value      → almost any character, until the closing quote
  after  "age":              → only digits (or a minus sign)
  after the last value       → only  }  and then end-of-text

  ONE STEP OF LOGIT MASKING (4 tokens out of a ~128K vocabulary)
  ─────────────────────────────────────────────────────────────────
  model logits     [ 0.3    0.2    0.1    0.8  ]
  grammar mask     [  1      0      0      1   ]   1 = legal here
  masked logits    [ 0.3    −∞     −∞     0.8  ]
  softmax          [ 0.38   0      0      0.62 ]   renormalised over legal tokens
```

**Official Definition:**
> **Structured outputs** guarantee that a model's reply conforms to a developer-supplied JSON Schema (or a regex
> or grammar). They are built on **constrained decoding**: the schema is compiled into an automaton — a
> finite-state machine for regular patterns, one with a stack (a pushdown automaton) for nested JSON — and at
> each step every token that cannot extend the text towards a valid output gets its logit set to −∞ before
> sampling. **JSON mode** is weaker: it guarantees valid JSON syntax, not your keys or types.

> **Maths in one line:** `p'(t) ∝ p(t) × [t is allowed by the grammar here]` — zero out every forbidden token, renormalise what is left, then pick or sample as usual.

**Interview Answer:**

**Say this first (30 sec):** Structured outputs make the reply match a JSON Schema by construction: the server compiles the schema into an automaton and, at every decoding step, masks the logits of tokens that would break it, so the output always parses with the required keys and types. JSON mode only promises valid syntax. Either way it guarantees the shape, not the truth, so you still validate the values.

- **Three levels:** "reply in JSON" in the prompt (no guarantee) → JSON mode (parses; keys and types unchecked) → schema-constrained structured outputs (required keys, right types, no extra keys).
- **Making it fast:** checking ~128K tokens on every step is slow, so engines precompute or cache legal tokens per automaton state — Outlines (Willard & Louf, 2023); XGrammar prechecks most tokens ahead of time (MLSys 2025, up to 100× faster); llguidance builds a mask in about 50 µs of CPU per token.
- **APIs (as of Nov 2026):** OpenAI `text.format` = `{"type": "json_schema", "strict": true}`; Anthropic `output_config.format` plus `strict: true` on tools; Gemini `response_format` (Interactions API) or `response_mime_type` + `response_json_schema` (generateContent). vLLM: XGrammar or llguidance.
- **Limits:** vendors support a subset of JSON Schema (OpenAI: every field `required`, `additionalProperties: false`, ≤ 10 nesting levels); a new schema adds latency on its first request; a refusal or the token limit can still end without valid JSON.
- **Format can fight reasoning:** Tam et al. (2024) reported reasoning drops under strict formats (the Outlines team traced much of it to prompt differences). Reason first, then format: put a `reasoning` field before `answer`.
- **Still validate in code:** a schema cannot say "end date after start date" — check with Pydantic and re-prompt with the error; at failure rate f that costs 1 ÷ (1 − f) calls ([Ch 19 §19.8](#content/19_ai_frameworks)).

**Worked example:** real tokens span several characters, so the mask walks each candidate token's characters through the automaton — here for the schema `{"age": <integer>}` and a fake model that would rather chat.

```python
# Constrained decoding by hand: walk each token's characters through a tiny automaton, mask the rest, renormalise
import json
import numpy as np

LIT = '{"age": '                         # grammar: {"age": <integer 1-999, no leading zero>}

def step(s, ch):                         # s = text accepted so far; returns the longer text, or None = dead end
    if len(s) < len(LIT):
        return s + ch if ch == LIT[len(s)] else None
    if s.endswith("}"):
        return None                      # nothing may follow the closing brace
    digits = s[len(LIT):]
    if ch.isdigit() and len(digits) < 3 and (digits or ch != "0"):
        return s + ch
    return s + ch if ch == "}" and digits else None

def allowed(s, tok):                     # a token is legal only if EVERY character in it is
    if tok == "<eos>":
        return s.endswith("}")
    for ch in tok:
        s = step(s, ch)
        if s is None:
            return False
    return True

# a chatty fake model with the same preferences at every step, most liked first
vocab = ["Sure", "twenty", "!", '{"', "29", "}", "age", '":', " ", '"age": ', "2", "9", "9}", "0", "{", "<eos>"]
logits = np.linspace(3, -3, len(vocab))
p_model = np.exp(logits) / np.exp(logits).sum()
print(f"unconstrained greedy picks {vocab[0]!r} (p = {p_model[0]:.2f}) -> not JSON")
s, out = "", []
while True:
    mask = np.array([allowed(s, tok) for tok in vocab])
    kept = p_model[mask].sum()                       # the model's probability on legal tokens
    p = np.where(mask, p_model, 0.0) / kept          # p'(t) = p(t) x [t allowed] / kept
    tok = vocab[int(np.argmax(p))]
    print(f"step {len(out)}: {mask.sum():2d}/{len(vocab)} legal, kept {kept:5.1%} of p, picked {tok!r:8} p' = {p.max():.2f}")
    if tok == "<eos>":
        break
    s = s + tok
    out.append(tok)
print("output:", s, "| tokens:", out)
assert json.loads(s) == {"age": 29} and not allowed('{"age": 29', "29") and allowed('{"age": 29', "9}")
```

**Output:**

```
unconstrained greedy picks 'Sure' (p = 0.33) -> not JSON
step 0:  2/16 legal, kept 10.1% of p, picked '{"'     p' = 0.99
step 1:  1/16 legal, kept  3.0% of p, picked 'age'    p' = 1.00
step 2:  1/16 legal, kept  2.0% of p, picked '":'     p' = 1.00
step 3:  1/16 legal, kept  1.3% of p, picked ' '      p' = 1.00
step 4:  4/16 legal, kept  7.9% of p, picked '29'     p' = 0.84
step 5:  5/16 legal, kept  5.9% of p, picked '}'      p' = 0.75
step 6:  1/16 legal, kept  0.1% of p, picked '<eos>'  p' = 1.00
output: {"age": 29} | tokens: ['{"', 'age', '":', ' ', '29', '}']
```

Only 1–5 of the 16 tokens are legal at each step, and this model put just 0.1–10% of its probability on them — the mask, not the model, wrote the JSON. That is why you also describe the schema in the prompt: when the model already wants legal tokens the mask rarely overrules it, and quality holds. Note `"29"` covers two digits and `"9}"` crosses from the number into the brace, so every character must be checked — which is why engines precompute or cache masks per state.

**Likely follow-ups:**

- *JSON mode or structured outputs?* — Structured outputs whenever the provider supports them (OpenAI's docs say so): JSON mode can still return the wrong keys or an age written as a word.
- *Are tool-call arguments guaranteed?* — Only in strict mode (`strict: true` on OpenAI and Anthropic tools); otherwise they are best-effort JSON you must validate ([Ch 17b §9.3](#content/17b_llm_applications)).
- *How do you run it on an open model?* — Pass the schema to vLLM's `structured_outputs` (XGrammar or llguidance backend), SGLang, or llama.cpp's GBNF grammars; the masking happens on the server.

**Trap:** "With structured outputs the data is guaranteed correct" — no: they guarantee the *shape* (keys, types, enums); `{"age": 290}` is perfectly valid. Validate values, measure accuracy, and handle refusals and truncated replies.

**Go deeper:** [Ch 17b §8.6](#content/17b_llm_applications) · [Ch 19 §19.8](#content/19_ai_frameworks) · [Ch 17b §9.3](#content/17b_llm_applications) · [Ch 17 §2.6](#content/17_llm) (decoding)

---

# Quick-Reference Summary Tables

![LLM Interview Cheat Sheet: eight topic cards with their question ranges and one key rule each - Architecture Q1-Q12 (320 KiB of KV cache per token for Llama-3-70B, plus Q70 MoE), Training Q13-Q22 (Chinchilla ~20 tokens per parameter, plus Q69 DPO), Prompting Q23-Q30, RAG Q31-Q38, Inference and Deployment Q39-Q47 and Q71-Q72 (INT4 70B model 140 GB to 35 GB), Evaluation Q48-Q53, Safety Q54-Q60, Frontier Q61-Q68; a Pick by Question table and the six-step answer pattern from Say this first to Trap.](diagrams/iq33b_info_q00_cheat_sheet_map_ai.png)

Every question in both parts, grouped by topic — Q1–Q38 are in [Part 1](#content/33_llm_interview_questions), Q39–Q72 are above.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│         ALL 72 QUESTIONS BY TOPIC  (Q1–Q38 Part 1 · Q39–Q72 Part 2)         │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ ARCHITECTURE                         │ TRAINING & FINE-TUNING               │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ What an LLM is                    Q1 │ Pre-train → SFT → preference     Q13 │
│ Transformer, self-attention     Q2–3 │ RLHF                             Q14 │
│ Tokenization (BPE)                Q4 │ DPO vs RLHF                 Q15, Q69 │
│ Encoder vs decoder                Q5 │ Fine-tune or prompt?             Q16 │
│ Positions (RoPE)                  Q6 │ LoRA / QLoRA                     Q17 │
│ KV cache, GQA                     Q7 │ Catastrophic forgetting          Q18 │
│ Multi-head, causal mask         Q8–9 │ Pre-training vs fine-tuning data Q19 │
│ Feed-forward layers              Q10 │ Scaling laws (Chinchilla)        Q20 │
│ Context window                   Q11 │ Distillation                     Q21 │
│ Mixture of Experts          Q12, Q70 │ Mixed precision (BF16)           Q22 │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ PROMPTING                            │ RAG & EMBEDDINGS                     │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Prompt engineering               Q23 │ RAG pipeline                     Q31 │
│ Zero- vs few-shot                Q24 │ Embeddings                       Q32 │
│ Chain-of-thought                 Q25 │ Vector databases (ANN)           Q33 │
│ In-context learning              Q26 │ Chunking                         Q34 │
│ System prompts                   Q27 │ Reranking                        Q35 │
│ ReAct                            Q28 │ Evaluating RAG                   Q36 │
│ Prompt injection            Q29, Q58 │ RAG vs fine-tuning               Q37 │
│ Tree of Thoughts, self-consist.  Q30 │ Cosine similarity                Q38 │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ INFERENCE & DEPLOYMENT               │ EVALUATION                           │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Quantization                     Q39 │ Evaluating an LLM                Q48 │
│ Flash Attention                  Q40 │ Perplexity                       Q49 │
│ Speculative decoding             Q41 │ LLM-as-a-judge                   Q50 │
│ Continuous batching              Q42 │ Lost in the middle               Q51 │
│ vLLM / PagedAttention            Q43 │ Data contamination               Q52 │
│ Cutting latency                  Q44 │ Benchmark limits                 Q53 │
│ Model parallelism                Q45 │                                      │
│ TTFT vs TPS                      Q46 │                                      │
│ API vs self-hosting              Q47 │                                      │
│ Prompt caching                   Q71 │                                      │
│ Structured outputs               Q72 │                                      │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ SAFETY & ALIGNMENT                   │ FRONTIER & AGENTS                    │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Alignment                        Q54 │ Reasoning models                 Q61 │
│ Constitutional AI                Q55 │ Test-time compute                Q62 │
│ Hallucination                    Q56 │ AI agents                        Q63 │
│ Bias                             Q57 │ MCP                              Q64 │
│ Prompt injection (OWASP LLM01)   Q58 │ State space models (Mamba)       Q65 │
│ Red-teaming                      Q59 │ Open-weight landscape            Q66 │
│ Guardrails                       Q60 │ Multimodal LLMs                  Q67 │
│                                      │ EU AI Act                        Q68 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         KEY TERMS — QUICK CLARIFIER                          │
├─────────────────────────────────┬────────────────────────────────────────────┤
│ RLHF vs DPO vs GRPO             │ RLHF = reward model + PPO, KL to SFT       │
│                                 │ DPO = one loss on preference pairs, no RL  │
│                                 │ GRPO = RL vs a group average, no critic    │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ RAG vs fine-tuning              │ RAG = fetch facts at question time         │
│                                 │ Fine-tune = change behaviour and format    │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Encoder vs decoder              │ Encoder = sees both ways, embeds (BERT)    │
│                                 │ Decoder = sees the past; generates (GPT)   │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Temperature 0 vs 1              │ 0 = greedy: repeatable-ish, not guaranteed │
│                                 │ 1 = sample the distribution as it is       │
│                                 │ Many reasoning models ignore it            │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ TTFT vs TPOT (TPS)              │ TTFT = wait for the first token (prefill)  │
│                                 │ TPOT = time per output token (decode)      │
│                                 │ TPS = 1 / TPOT for one stream              │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Perplexity vs accuracy          │ Perplexity = e^loss: fit to the text       │
│                                 │ Accuracy = did it do the task              │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ LoRA vs full fine-tuning        │ LoRA = train small adapters, base frozen   │
│                                 │ Full = update every weight                 │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Quantization vs distillation    │ Quantize = same model, fewer bits          │
│                                 │ Distill = small student copies a teacher   │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Prompt injection vs jailbreak   │ Injection = untrusted text hijacks the app │
│                                 │ Jailbreak = user beats safety training     │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Train-time vs test-time scaling │ Train = bigger model, more data            │
│                                 │ Test = more thinking per question          │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Dense model vs MoE              │ Dense = every weight on every token        │
│                                 │ MoE = router picks top-k experts per token │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Transformer vs SSM (Mamba)      │ Transformer = O(n²) attention, growing KV  │
│                                 │ SSM = O(n) scan, fixed-size state          │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Chatbot vs agent                │ Chatbot = answers in text                  │
│                                 │ Agent = loops: plan, call tools, observe   │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Prompt cache vs semantic cache  │ Prompt = reuse KV of an identical prefix   │
│                                 │ Semantic = reuse the answer to a similar Q │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ JSON mode vs structured outputs │ JSON mode = valid JSON, any keys or types  │
│                                 │ Structured = matches your schema           │
└─────────────────────────────────┴────────────────────────────────────────────┘
```

---

## Interview Tips for LLM Questions

**Answer pattern:** Say this first → mechanism → numbers → trade-off → follow-ups → trap.

```
╔════════════════════════════════════════════════════════════════════╗
║ HOW TO ANSWER LLM INTERVIEW QUESTIONS                              ║
╟────────────────────────────────────────────────────────────────────╢
║ EVERY ANSWER (the pattern each question in this chapter follows):  ║
║ 1. Say this first — 2–3 sentences that fully answer, with a number ║
║ 2. Mechanism      — how it works: one picture or one formula       ║
║ 3. Numbers        — a real figure (320 KiB of KV cache per token)  ║
║ 4. Trade-off      — what it costs, and when you would not use it   ║
║ 5. Follow-ups     — pre-empt the obvious next question             ║
║ 6. Trap           — name the common wrong answer and correct it    ║
║ Analogy first if the interviewer is not technical; date anything   ║
║ volatile ("as of Nov 2026") — models, prices and scores move.      ║
╟────────────────────────────────────────────────────────────────────╢
║ FOR SYSTEM DESIGN (LLM applications):                              ║
║ 1. Clarify: users, scale, latency budget, cost per request, risk   ║
║ 2. Start simple: an API model + a good prompt; add RAG for facts   ║
║ 3. Add complexity only when an eval demands it: fine-tuning,       ║
║    self-hosting, agents                                            ║
║ 4. Cover: TTFT and TPOT, cost, safety and guardrails, golden-set   ║
║    evaluation, monitoring                                          ║
║ 5. Discuss trade-offs honestly — there is no perfect design        ║
╟────────────────────────────────────────────────────────────────────╢
║ WHAT INTERVIEWERS LOOK FOR:                                        ║
║ • Can you explain complex ideas simply?       (communication)      ║
║ • Do you understand the trade-offs?           (maturity)           ║
║ • Can you do the cost and latency maths?      (practicality)       ║
║ • Do you follow the field, and date facts?    (curiosity)          ║
║ • Do you plan for safety and failure modes?   (responsibility)     ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Key Takeaways

**Part 1 — how LLMs work, are trained, prompted and grounded (Q1–Q38)**

- **Attention is the core:** `softmax(QKᵀ/√d_k)·V` lets every token read every other token, at a cost that grows as n² with length — the root of the long-context, Flash Attention and KV-cache questions (Q2–Q3, Q11, Q40).
- **The KV cache, not the weights, limits serving:** Llama-3-70B keeps 320 KiB per token, 40 GiB for one 128K-token request; GQA's 8 KV heads instead of 64 cut that 8× (Q7, Q43).
- **Training is a pipeline:** pre-training (about 15T tokens for Llama 3) → SFT → preference tuning (RLHF, or DPO with β ≈ 0.1) → RL with verifiable rewards (GRPO) for reasoning models. DPO drops the reward model and the RL loop, not the risk of over-optimising (Q13–Q15, Q69).
- **Fine-tune for behaviour, retrieve for facts:** LoRA at rank 16 trains 0.78% of a 4096 × 4096 matrix; RAG keeps knowledge fresh and citable — and the two combine (Q16–Q17, Q37).
- **Scaling:** training compute ≈ 6·N·D; Chinchilla's ~20 tokens per parameter is compute-optimal for training, yet served models are over-trained (Llama 3 8B saw ~1,900 tokens per parameter) (Q20).
- **Prompting is a ladder:** zero-shot → 3–5 balanced examples → chain-of-thought (or more reasoning effort) → RAG → fine-tuning; every example is paid for on every call (Q23–Q26).
- **RAG lives or dies on retrieval:** 256–512-token chunks with 50–100 tokens of overlap, hybrid search plus a reranker, and separate retrieval (recall@k, MRR) and answer (faithfulness) metrics (Q31–Q36).

**Part 2 — serving, evaluating, securing and the frontier (Q39–Q72)**

- **Prefill vs decode explains latency:** TTFT is prefill (compute-bound), TPOT is decode (memory-bandwidth-bound), and end-to-end latency = TTFT + TPOT × (N − 1) (Q44, Q46).
- **Throughput levers:** continuous batching (Orca 36.9×; Anyscale ~8×, up to 23× with vLLM), PagedAttention (waste under one block per sequence), speculative decoding (≈ 3.4 tokens per target pass at α = 0.8, k = 4 — about 2–3× per stream) (Q41–Q43).
- **Smaller and sparser models:** INT4 weights are 4× smaller than FP16 (a 70B model: 140 GB → 35 GB); MoE cuts compute, not memory (DeepSeek-V3 stores 671B parameters, activates 37B) (Q39, Q70).
- **Cheapest wins first:** prompt caching takes 90–97.5% off cached input but pays only above a ~22% hit rate with a 1.25× write; structured outputs guarantee the shape, not the truth (Q71–Q72).
- **Evaluation is a stack:** golden sets → LLM-as-judge (judge both orders; watch position, verbosity and self-preference bias) → A/B tests. Public benchmarks saturate and leak: OpenAI retired SWE-bench Verified in Feb 2026 (saturated/contaminated); it then recommended SWE-bench Pro, but retracted that on 8 Jul 2026 after finding ~30% of Pro tasks broken (Q48–Q53).
- **Safety is defence in depth:** prompt injection is LLM01 and excessive agency LLM03 in the OWASP 2026 list — no prompt fixes it, so use least privilege, approval gates and untrusted-output handling; for hallucination, ground and abstain (temperature 0 only makes the top answer repeatable) (Q54–Q60).
- **Frontier facts carry a date:** reasoning models buy accuracy with test-time compute; an agent is a model calling tools in a loop, and MCP (stateless since spec 2026-07-28) is how it plugs into them; the EU AI Act applies generally from 2 Aug 2026, with high-risk rules moved to Dec 2027 / Aug 2028 (Q61–Q68).

---

> **End of Chapter 33 (Parts 1–2).** Return to **[← Part 1 — Fundamentals, Training, Prompting & RAG](#content/33_llm_interview_questions)** for Q1–Q38.

---

**Back to Start:** [README — Table of Contents](#README)
