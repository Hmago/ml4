# Chapter 30 — Google ML Ecosystem: TPUs, JAX, Vertex AI & Key Papers

**How to read this chapter:** Each topic starts with a story a 10-year-old could follow, then the official definition and technical details. The key papers section at the end ties everything together — those papers created the ideas that power the tools described here.

---

## What You'll Learn

After reading this chapter, you will be able to:
- Explain what a TPU is and why Google built a chip just for matrix multiplication
- Describe how TPUs differ from GPUs: systolic arrays, BF16, memory bandwidth, pods and slices linked by ICI, SparseCore, and the XLA compiler
- Decide when a TPU is the right choice, and how your JAX or PyTorch code reaches one
- Understand JAX and its core transformations (`jit`, `grad`, `vmap`, and multi-device sharding with `shard_map`, which replaces `pmap`)
- Know where TensorFlow and Keras 3 stand next to JAX and PyTorch
- Describe Google Cloud's ML platform — Vertex AI, now part of Gemini Enterprise Agent Platform (pipelines, feature store, endpoints, model registry)
- Summarize the landmark Google research papers that shaped modern AI

---

## Table of Contents

| Section | Topic | Key Concepts |
|---------|-------|--------------|
| 1 | TPUs — Google's Custom AI Chips | Systolic array (MXU), BF16, HBM bandwidth, pods / slices / ICI, SparseCore, XLA, TPU vs GPU |
| 2 | JAX — Functional ML at Google | jit, grad, vmap, pmap → shard_map, XLA, Flax / Optax |
| 3 | TensorFlow & Keras | Keras 3, eager mode, tf.data, SavedModel |
| 4 | Vertex AI — Google's ML Platform (now inside Gemini Enterprise Agent Platform) | Pipelines, Feature Store, endpoints, Model Registry |
| 5 | Key Google Research Papers | Transformer, BERT, T5, PaLM / Gemini, Wide & Deep, YouTube DNN, scaling laws |
| 6 | Quick Reference | Cheat sheets and decision guides |

---

# SECTION 1: TPUs — GOOGLE'S CUSTOM AI CHIPS

---

## 1.1 The Simple Explanation

![Infographic: what a TPU is. A weight-stationary 3x3 systolic array holds weights B00 to B22, rows of A stream in from the left, partial sums flow down and C = A x B leaves the bottom row; each cell computes sum_out = sum_in + a x b. Peak FLOPS = MXUs x cells per MXU x 2 x clock, so TPU v4 = 8 x 16,384 x 2 x 1.05 GHz, about 275 TFLOPS. Fill-and-drain table: 3x3 grid with 4 rows = 8 cycles, 50% busy; one 128x128 MXU with 8, 128 and 2,048 rows = 3%, 34% and 89% busy.](diagrams/gml30_info_tpu_systolic_array_ai.png)

### The LEGO Factory Analogy

<details>
<summary><strong>Read as text</strong> — the factory analogy and CPU vs GPU vs TPU</summary>

Imagine you need to build a million identical LEGO houses. You have two choices:

**Option A: A General Workshop (GPU)**
Your workshop has thousands of skilled workers who can build anything — houses, castles, spaceships, robots. They're incredibly versatile. But each worker reads their own instructions and fetches their own bricks from the shelves, again and again.

**Option B: A House-Building Factory (TPU)**
You build a factory with a single conveyor belt designed ONLY for making houses. Every station on the belt does one step and hands the piece straight to the next station — nobody walks back to the shelves. The factory can't make spaceships, but it churns out houses ridiculously fast because every step is hardwired.

A **TPU (Tensor Processing Unit)** is Google's custom-built factory for one job: multiplying big grids of numbers (matrix multiplication), which is most of the work inside a neural network. Google has run TPUs in its data centres since 2015, and trains and serves Gemini on them.

```
  ┌──────────────────────────────────────────────────────────────┐
  │                    CPU vs GPU vs TPU                         │
  ├──────────────────────────────────────────────────────────────┤
  │  CPU (Brain)          GPU (Army)            TPU (Factory)    │
  │  ┌───┐                ┌─┬─┬─┬─┐             ┌──────────┐     │
  │  │ ● │                │●│●│●│●│             │ ■ ■ ■ ■  │     │
  │  │ ● │                │●│●│●│●│             │ ■ ■ ■ ■  │     │
  │  └───┘                │●│●│●│●│             │ ■ ■ ■ ■  │     │
  │                       └─┴─┴─┴─┘             └──────────┘     │
  │  Tens of big cores.   Thousands of small    A few huge grids │
  │  Good at anything,    cores plus Tensor     of multiply-add  │
  │  step by step.        Cores. Good at        cells (systolic  │
  │                       parallel maths.       arrays). Matrix  │
  │                                             maths only.      │
  └──────────────────────────────────────────────────────────────┘
```

</details>

---

## 1.2 Official Definition

<details>
<summary><strong>Read as text</strong> — the definition, the parts of a chip and the generations</summary>

> **TPU (Tensor Processing Unit):** A custom-designed application-specific
> integrated circuit (ASIC) developed by Google specifically to accelerate
> machine learning workloads. TPUs are optimized for high-volume, low-precision
> matrix computations central to training and inference of neural networks.

**What is inside one TPU chip** (names you will see in Google's docs and profiler):

| Part | What it does | Example numbers |
|------|--------------|-----------------|
| **TensorCore** | The compute engine: MXUs + a vector unit + a scalar unit | 1 per chip (v5e, v6e); 2 per chip (v4, v5p, TPU7x) |
| **MXU** (matrix-multiply unit) | A systolic array of multiply-accumulate cells — it does the matmuls | 128 × 128 cells (v5e, v5p and earlier); 256 × 256 (v6e, TPU7x) |
| **Vector unit** | Element-wise maths: activations, softmax, normalisation | — |
| **Scalar unit** | Control flow and memory addresses | — |
| **HBM** (High Bandwidth Memory) | Memory stacked next to the chip; holds weights and activations | 95 GiB at 2,765 GB/s (v5p) |
| **SparseCore** | Small dataflow processors for embedding lookups | 4 per chip (v5p, TPU7x); 2 (v6e) |
| **ICI links** | Direct chip-to-chip links that build the pod network | 6 per chip in 3D-torus generations |

**Generations at a glance:** v1 (2015, inference only, int8) → v2 (2017, the first training TPU, BF16, 256-chip pods) → v3 (2018, liquid cooling, 1,024-chip pods) → v4 (2021, optical circuit switches and SparseCore, 4,096-chip pods) → v5e and v5p (2023) → v6e "Trillium" (2024) → TPU7x "Ironwood" (2025; generally available on Google Cloud since 31 March 2026) → TPU 8t and TPU 8i (announced April 2026). The spec table is in Difference 4 below; the hardware home is [Ch 29 §24.7](#content/29_gpus_tpus_infrastructure).

</details>

---

## 1.3 How TPUs Differ from GPUs

<details>
<summary><strong>Read as text</strong> — the five differences at a glance</summary>

There are five key differences. The first three are about one chip; the last two are about many chips and the software that drives them.

| # | Difference | TPU | GPU (e.g. NVIDIA H100) |
|---|-----------|-----|------------------------|
| 1 | Compute engine | A few large systolic arrays (MXUs) | Many streaming multiprocessors, each with small Tensor Cores |
| 2 | Number format | BF16 native since v2 (2017); sums kept in FP32 | BF16 since A100 (2020); FP8 since H100 |
| 3 | Memory | HBM, e.g. 7,380 GB/s per chip on TPU7x | HBM, 3,350 GB/s on H100 |
| 4 | Scaling out | ICI torus across a pod of up to 9,216 chips | NVLink inside a server or rack; InfiniBand or Ethernet between them |
| 5 | Software | The XLA compiler plans the whole program | Hand-tuned CUDA kernels plus compilers |

Let's take each one.

</details>

---

### Difference 1: Systolic Arrays (The Conveyor Belt)

<details>
<summary><strong>Read as text</strong> — the classroom story, the four steps and peak FLOPS</summary>

This is the biggest difference and the hardest to understand. Let's make it simple.

**The 10-year-old version:**

Imagine you're in a classroom. The teacher gives student #1 a math problem. Student #1 solves part of it and passes it to student #2. Student #2 adds their part and passes it to student #3. By the time it reaches the last student, the whole problem is solved — and student #1 has ALREADY started on the next problem!

Once the line is full, nobody waits and everybody is busy. That's a **systolic array**.

**The technical version:**

A systolic array is a grid of simple multiply-accumulate cells (processing elements, or PEs). In a TPU's MXU the grid works **weight-stationary**:

1. The weights `B` are loaded into the grid first — cell (k, n) holds `B[k, n]` and keeps it.
2. The inputs stream in from the left: value `A[m, k]` enters grid row k and moves one cell to the right per clock cycle. Grid row k starts one cycle later than row k − 1 (the *skew*), so each partial sum meets the right inputs.
3. Each cell multiplies the value passing through by its weight, adds the partial sum arriving from the cell above, and passes the new sum down.
4. Finished values of `C = A × B` drop out of the bottom row. No cell touches memory while this happens.

"Systolic" comes from the heartbeat (systole): data pulses through the grid in rhythm.

```
  How a TPU's systolic array computes C = A × B   (weight-stationary)
  ──────────────────────────────────────────────────────────────────

               col 0         col 1         col 2
  A[·,0] ──→  [B00]  ──→    [B01]  ──→    [B02]     every cell, every cycle:
                ↓             ↓             ↓         sum_out = sum_in + a × b
  A[·,1] ──→  [B10]  ──→    [B11]  ──→    [B12]       pass a to the right
                ↓             ↓             ↓         pass sum_out down
  A[·,2] ──→  [B20]  ──→    [B21]  ──→    [B22]
                ↓             ↓             ↓
              C[·,0]        C[·,1]        C[·,2]

  One MXU = 128 × 128 = 16,384 cells (v5e, v5p and earlier)
          = 256 × 256 = 65,536 cells (v6e and TPU7x)
```

> **Maths in one line:** `peak FLOPS = MXUs × cells per MXU × 2 × clock` — each cell does one multiply and one add per cycle. TPU v4: 8 MXUs (2 TensorCores × 4) × 16,384 cells × 2 × 1.05 GHz ≈ 275 TFLOPS, exactly its published peak.

The catch is filling and draining the pipeline. On a K × N grid, M rows of `A` take **M + K + N − 2** cycles, so the fraction of cell-cycles doing useful work is **M / (M + K + N − 2)**. The program below simulates the grid one cycle at a time and checks the answer against `A @ B`.

</details>

```python
# A weight-stationary systolic array (how a TPU MXU multiplies), simulated one clock cycle at a time
import numpy as np

def systolic_matmul(A, B, trace=False):
    M, K = A.shape                   # rows of A stream in from the left, one per cycle
    N = B.shape[1]                   # cell (k, n) holds the weight B[k, n] the whole time
    a_reg = np.zeros((K, N))         # the A value sitting in each cell
    s_reg = np.zeros((K, N))         # the partial sum each cell passes down
    C = np.zeros((M, N))
    cycles = M + K + N - 2           # fill + stream + drain
    for t in range(cycles):
        a_new = np.zeros((K, N))
        a_new[:, 1:] = a_reg[:, :-1]                 # A values move one cell right
        for k in range(K):                           # row k is fed A[t-k, k] (a skewed start)
            if 0 <= t - k < M:
                a_new[k, 0] = A[t - k, k]
        s_new = a_new * B                            # every cell: one multiply ...
        s_new[1:] += s_reg[:-1]                      # ... plus the sum from the cell above
        done = []
        for n in range(N):                           # finished sums drop out of the bottom row
            m = t - (K - 1) - n
            if 0 <= m < M:
                C[m, n] = s_new[K - 1, n]
                done.append(f"C[{m},{n}]")
        if trace:
            busy = sum(0 <= t - k - n < M for k in range(K) for n in range(N))
            print(f"cycle {t}: {busy}/{K * N} cells busy   out: {' '.join(done) or '-'}")
        a_reg, s_reg = a_new, s_new
    return C, cycles

A = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 1, 1]], dtype=float)   # 4 rows of activations
B = np.array([[1, 0, 2], [0, 1, 0], [1, 1, 1]], dtype=float)              # 3x3 weights in the grid
C, cycles = systolic_matmul(A, B, trace=True)
assert np.array_equal(C, A @ B)
print("C = A @ B ->", C.astype(int).tolist())
print(f"{cycles} cycles for {A.shape[0]} rows: utilization = M / (M + K + N - 2) = {A.shape[0] / cycles:.0%}")

rng = np.random.default_rng(0)                       # a bigger random check: 16x16 grid, 64 rows
A2, B2 = rng.integers(-5, 6, (64, 16)), rng.integers(-5, 6, (16, 16))
assert np.array_equal(systolic_matmul(A2, B2)[0], A2 @ B2)
print("16x16 grid, 64 rows: matches A @ B")

for M in [8, 128, 2048]:                             # one 128x128 MXU (v5e, v5p and earlier)
    print(f"128x128 MXU, {M:>4} rows: {M + 254:>4} cycles, utilization {M / (M + 254):.0%}")
peak = 2 * 4 * 128 * 128 * 2 * 1.05e9                # TPU v4: 2 cores x 4 MXUs x MACs x 2 FLOPs x clock
print(f"TPU v4 peak = {peak / 1e12:.0f} TFLOPS (BF16)")
```

**Output:**

```
cycle 0: 1/9 cells busy   out: -
cycle 1: 3/9 cells busy   out: -
cycle 2: 6/9 cells busy   out: C[0,0]
cycle 3: 8/9 cells busy   out: C[1,0] C[0,1]
cycle 4: 8/9 cells busy   out: C[2,0] C[1,1] C[0,2]
cycle 5: 6/9 cells busy   out: C[3,0] C[2,1] C[1,2]
cycle 6: 3/9 cells busy   out: C[3,1] C[2,2]
cycle 7: 1/9 cells busy   out: C[3,2]
C = A @ B -> [[4, 5, 5], [10, 11, 14], [16, 17, 23], [2, 2, 3]]
8 cycles for 4 rows: utilization = M / (M + K + N - 2) = 50%
16x16 grid, 64 rows: matches A @ B
128x128 MXU,    8 rows:  262 cycles, utilization 3%
128x128 MXU,  128 rows:  382 cycles, utilization 34%
128x128 MXU, 2048 rows: 2302 cycles, utilization 89%
TPU v4 peak = 275 TFLOPS (BF16)
```

<details>
<summary><strong>Read as text</strong> — continued: what the run shows and why it matters for ML</summary>

What the run shows:

- **It really is a matmul.** The grid's output equals `A @ B` exactly; the systolic array is matrix multiplication laid out in space and time.
- **Fill and drain cost time.** With only 4 rows, the 3 × 3 grid is busy half the time — the first and last cycles are mostly idle.
- **Big batches keep the MXU busy.** A 128 × 128 MXU fed 8 rows does useful work 3% of the time; fed 2,048 rows, 89%. This is the hardware reason TPUs want large batches and large matrices (real chips also spend time loading weights, which this toy ignores).

**Why this matters for ML:**

Neural networks are basically long chains of matrix multiplications:

```
  output = activation( W₃ × activation( W₂ × activation( W₁ × input )))
                       ─────           ─────           ─────
                       matrix          matrix          matrix
                       multiply        multiply        multiply
```

A TPU's systolic array is a hardware matrix-multiplication engine. GPUs do matrix maths very well too — their Tensor Cores are small matrix units — but they are general-purpose processors, organised around thousands of threads:

```
  GPU:  each thread / Tensor Core reads its operands from registers or shared
        memory, computes, and writes results back — flexible, but every step
        touches on-chip storage
  TPU:  operands pass straight from one cell to the next inside the MXU —
        no memory reads or writes until finished sums leave the array
```

</details>

---

### Difference 2: BF16 — Brain Floating Point

![Infographic comparing FP32 (1 sign, 8 exponent, 23 mantissa bits), FP16 (1, 5, 10) and BF16 (1, 8, 7): BF16 keeps FP32's range in 2 bytes, so a 1e-8 gradient stays 1.0012e-08 and 70,000 becomes 70,144 instead of FP16's 0 and inf. Ridge = peak FLOPS / HBM bandwidth; a roofline puts decode at batch 1 (about 1 FLOP per byte) on the memory-bound slope and training on the compute-bound flat part. Table: v5e 197 TFLOPS, 819 GB/s, ridge 240; v5p 459, 2,765, 166; v6e 918, 1,638, 560; TPU7x 2,307, 7,380, 313; H100 989, 3,350, 295. An 8B BF16 model (16 GB) needs 5.8 ms per decode token on v5p and 2.2 ms on TPU7x.](diagrams/gml30_info_bf16_and_hbm_bandwidth_ai.png)

<details>
<summary><strong>Read as text</strong> — the bit layouts, range vs precision and FP32 sums</summary>

**The 10-year-old version:**

When you write the number 3.14159265, do you really need all those decimal places? Most of the time, "3.14" is close enough. BF16 is Google's way of saying: "Let's use shorter numbers so we can do math faster and fit more numbers in memory."

**The technical version:**

BF16 (Brain Float 16) is a 16-bit floating-point format that Google Brain designed for deep learning: it keeps FP32's 8 exponent bits and cuts the mantissa to 7 bits.

```
  Number Formats Compared
  ───────────────────────────────────────────────────────────────

  FP32 (standard float):  1 sign + 8 exponent + 23 mantissa = 32 bits
  ┌─┬────────┬───────────────────────┐
  │S│EEEEEEEE│MMMMMMMMMMMMMMMMMMMMMMM│   High precision
  └─┴────────┴───────────────────────┘   32 bits per number

  FP16 (half precision):  1 sign + 5 exponent + 10 mantissa = 16 bits
  ┌─┬─────┬──────────┐
  │S│EEEEE│MMMMMMMMMM│   Smaller range, decent precision
  └─┴─────┴──────────┘   16 bits per number

  BF16 (brain float):    1 sign + 8 exponent + 7 mantissa = 16 bits
  ┌─┬────────┬───────┐
  │S│EEEEEEEE│MMMMMMM│   Same RANGE as FP32, less precision
  └─┴────────┴───────┘   16 bits per number
```

> **Maths in one line:** `value = (−1)^sign × 2^(exponent − bias) × 1.mantissa` — exponent bits buy **range**, mantissa bits buy **precision**; BF16 keeps FP32's 8 exponent bits (same range) and only 7 mantissa bits (about 2–3 decimal digits).

**Why BF16 is brilliant for ML:**

| Property | FP32 | FP16 | BF16 |
|----------|------|------|------|
| Bits | 32 | 16 | 16 |
| Exponent bits | 8 | 5 | **8** |
| Largest value | ±3.4×10³⁸ | ±65,504 | **±3.4×10³⁸** |
| Smallest normal value | 1.2×10⁻³⁸ | 6.1×10⁻⁵ | **1.2×10⁻³⁸** |
| Precision (decimal digits) | ~7.2 | ~3.3 | ~2.4 |
| Memory per number | 4 bytes | 2 bytes | **2 bytes** |

The key insight: training needs **range** more than **precision**. Gradients and activations span many orders of magnitude, but each one doesn't need many digits. BF16 keeps the same range as FP32 while using half the memory.

```
  Why FP16 is risky for training and BF16 is not   (same numbers as Ch 16 §1.7)

  A tiny gradient, 1e-8      FP16 → 0          underflow: below FP16's smallest value (~6e-8)
                             BF16 → 1.0012e-08 kept
  A big activation, 70,000   FP16 → inf        overflow: above 65,504
                             BF16 → 70,144     rounded, but finite
  BF16's price:              1.0 + 0.0001 → 1.0   tiny updates vanish, so master
                                                  weights and sums stay in FP32
```

**On a TPU**, the MXU multiplies BF16 inputs and **accumulates in FP32**, so long dot products don't lose precision. TPUs have had native BF16 since v2 (2017); NVIDIA GPUs added it with the A100 (2020). Newer TPUs add smaller formats for more speed: int8 (v5e, v6e), FP8 (v5p, TPU7x — 4,614 FP8 TFLOPS per TPU7x chip, twice its BF16 rate) and FP4 (TPU 8t). The training recipe — BF16 compute, FP32 master weights, loss scaling only for FP16 — is taught in [Ch 16 §1.7](#content/16_deep_learning).

</details>

---

### Difference 3: High Memory Bandwidth (HBM)

<details>
<summary><strong>Read as text</strong> — HBM speeds, the ridge point and decode speed</summary>

**The 10-year-old version:**

Imagine your brain is super fast at math, but your hands are slow at picking up numbers from a table. You'd spend most of your time picking up numbers instead of doing math. **Memory bandwidth** is how fast the chip can pick up numbers. Every modern AI chip, TPU or GPU, has very fast hands (HBM) — and still often waits for them.

**The technical version:**

Memory bandwidth is the rate at which a processor can read from or write to memory. In ML, the data (weights, activations, gradients) is far too large for on-chip memory, so it is streamed from **High Bandwidth Memory (HBM)** — DRAM stacked right next to the chip.

```
  HBM per chip: capacity and bandwidth
  ─────────────────────────────────────────────
  NVIDIA A100 (80 GB):   80 GB    ~2,000 GB/s
  NVIDIA H100 (SXM):     80 GB     3,350 GB/s
  Google TPU v4:         32 GiB    1,200 GB/s
  Google TPU v5e:        16 GB       819 GB/s
  Google TPU v5p:        95 GiB    2,765 GB/s
  Google TPU v6e:        32 GB     1,638 GB/s
  Google TPU7x:         192 GiB    7,380 GB/s

  Higher bandwidth = less time waiting for data
```

**Why this matters:**

Whether a step waits on memory or on maths depends on its **arithmetic intensity**: FLOPs done per byte read from HBM. Every chip has a break-even point, the *ridge*.

> **Maths in one line:** `ridge = peak FLOPS ÷ HBM bandwidth` — an operation doing fewer FLOPs per byte than this waits on memory (memory-bound); more, and it waits on the MXUs (compute-bound).

| Chip | Peak BF16 (TFLOPS) | HBM bandwidth (GB/s) | Ridge (FLOPs per byte) |
|------|--------------------|----------------------|------------------------|
| TPU v5e | 197 | 819 | ≈ 240 |
| TPU v5p | 459 | 2,765 | ≈ 166 |
| TPU v6e | 918 | 1,638 | ≈ 560 |
| TPU7x | 2,307 | 7,380 | ≈ 313 |
| H100 SXM (dense) | 989 | 3,350 | ≈ 295 |

A BF16 matmul reads each 2-byte weight once and uses it for one multiply-add (2 FLOPs) per row of the batch, so its intensity is roughly **the batch size in tokens**:

- **Training or prefill** (thousands of tokens per chip): far above the ridge — compute-bound.
- **LLM decode at batch 1** (about 1 FLOP per byte): far below every ridge — memory-bound. The speed limit is reading the weights: an 8B-parameter model in BF16 is 16 GB, so each token needs at least 16 GB ÷ 2,765 GB/s ≈ 5.8 ms on v5p (at most about 170 tokens/s per sequence) and 16 GB ÷ 7,380 GB/s ≈ 2.2 ms on TPU7x (about 460 tokens/s). On one 16 GB v5e chip the weights alone fill the memory, leaving no room for the KV cache — use two or more chips, or 8-bit weights.

```
  Compute-bound:  the chefs are the bottleneck      (big-batch training, prefill)
  Memory-bound:   the waiters can't bring           (small-batch decode,
                  ingredients fast enough            element-wise ops)

  Fixes for memory-bound work: bigger batches, fewer bytes per weight (int8 / FP8),
  fusing operations so data stays on-chip (XLA, Difference 5), more HBM bandwidth
```

The full roofline lesson is in [Ch 29 §24.3](#content/29_gpus_tpus_infrastructure); the decode version, including KV-cache reads, is in [Ch 17c §1.1](#content/17c_llm_systems).

</details>

---

### Difference 4: TPU Pods (The Supercomputer)

![Infographic on scaling TPUs: a staircase from chip (6 ICI links) to host (4 chips), cube (4x4x4 = 64 chips, 1 rack), slice (e.g. 4x4x8 = 128 chips), pod (4,096 v4, 8,960 v5p, 9,216 TPU7x) and Multislice over the data-centre network; ICI gives 1,200 GB/s per chip versus 50-100 Gbps of DCN. Pod peak = chips x peak per chip, so TPU7x reaches 9,216 x 2,307 TFLOPS, about 21.3 exaFLOPS in BF16 or 42.5 in FP8. The XLA compiler turns a Python step into an HLO graph, then fuses, tiles to 128x128 or 256x256 MXU blocks, schedules HBM to VMEM to MXU and shards with ICI collectives. A TPU vs GPU table and a checklist: pick a TPU for matmul-heavy, static-shape work that compiles through XLA on Google Cloud.](diagrams/gml30_info_pods_xla_tpu_vs_gpu_ai.png)

<details>
<summary><strong>Read as text</strong> — chip to pod, the 3D torus, the spec table and the naming trap</summary>

**The 10-year-old version:**

One TPU chip is fast. But to train a model like Gemini, one chip isn't enough — you need thousands working together. A **TPU pod** is like connecting thousands of LEGO factories with super-fast private highways so they can build one giant LEGO city together.

**The technical version:**

A **TPU Pod** is the full set of TPU chips joined by Google's own chip-to-chip network, **ICI (Inter-Chip Interconnect)**, so they can work as one machine. You rarely use a whole pod: you rent a **slice** — a block of chips inside one pod, connected by ICI — described by its topology, for example `4x4x8` = 128 chips. For a job bigger than one slice, **Multislice** joins several slices over the slower data-centre network (DCN).

```
  From one chip to a pod (3D-torus generations: v4, v5p, TPU7x)
  ──────────────────────────────────────────────────────────────────
  Chip        TensorCores + HBM + SparseCores + 6 ICI links
  Host        4 chips + 1 CPU host VM        (v5e / v6e hosts: 8 chips)
  Cube        4 × 4 × 4 = 64 chips = 1 rack, copper ICI inside
  Slice       the chips you rent, e.g. 4x4x8 = 128 chips; cubes are joined
              by optical circuit switches (OCS) into a 3D torus
  Pod         every chip on one ICI network:
              4,096 (v4), 8,960 (v5p), 9,216 (TPU7x)
  Multislice  several slices joined over the data-centre network (DCN),
              e.g. up to 18,432 v5p chips in one job

  ┌──────────────────────────────────────────────────┐
  │  Part of a 3D-torus slice (one layer shown)      │
  │                                                  │
  │  ┌──────┐  ICI  ┌──────┐  ICI  ┌──────┐          │
  │  │ Chip │◄─────►│ Chip │◄─────►│ Chip │  ...     │
  │  │  1   │       │  2   │       │  3   │          │
  │  └──┬───┘       └──┬───┘       └──┬───┘          │
  │     │ICI           │ICI           │ICI           │
  │  ┌──┴───┐       ┌──┴───┐       ┌──┴───┐          │
  │  │ Chip │◄─────►│ Chip │◄─────►│ Chip │  ...     │
  │  │  4   │       │  5   │       │  6   │          │
  │  └──────┘       └──────┘       └──────┘          │
  │     .               .               .            │
  │  Edges wrap around: the last chip in a row links │
  │  back to the first (that is the "torus").        │
  └──────────────────────────────────────────────────┘

  3D torus: every chip links to 6 neighbours (±x, ±y, ±z).
  The farthest chip in an X × Y × Z torus is X/2 + Y/2 + Z/2 hops away:
  6 hops in a 4×4×4 cube, 16 hops in an 8×8×16 slice.
  v5e and v6e use a 2D torus (4 links per chip) and stop at 256 chips.
```

> **Maths in one line:** `pod peak = chips per pod × peak per chip` — TPU7x: 9,216 × 4,614 TFLOPS (FP8) ≈ 42.5 exaFLOPS, or 9,216 × 2,307 TFLOPS (BF16) ≈ 21.3 exaFLOPS.

| TPU | Year | Chips per pod | Peak BF16 per chip (TFLOPS) | HBM per chip | HBM bandwidth (GB/s) | Pod peak (BF16) | ICI topology |
|-----|------|---------------|-----------------------------|--------------|----------------------|-----------------|--------------|
| v4 | 2021 | 4,096 | 275 | 32 GiB | 1,200 | ≈ 1.1 exaFLOPS | 3D torus |
| v5e | 2023 | 256 | 197 | 16 GB | 819 | ≈ 50 petaFLOPS | 2D torus |
| v5p | 2023 | 8,960 | 459 | 95 GiB | 2,765 | ≈ 4.1 exaFLOPS | 3D torus |
| v6e (Trillium) | 2024 | 256 | 918 | 32 GB | 1,638 | ≈ 235 petaFLOPS | 2D torus |
| TPU7x (Ironwood) | 2025 | 9,216 | 2,307 (4,614 FP8) | 192 GiB | 7,380 | ≈ 21.3 exaFLOPS | 3D torus |

Source: Google Cloud TPU documentation (checked November 2026); Google reports HBM in GiB for some generations and GB for others. Older pods: v2 had 256 chips (≈ 11.5 petaFLOPS) and v3 had 1,024 chips (≈ 126 petaFLOPS). **Next generation:** TPU 8t (training; 9,600-chip superpods, 216 GB of HBM at 6,528 GB/s per chip) and TPU 8i (serving; 288 GB at 8,601 GB/s, 384 MB of on-chip SRAM, up to 1,152 chips on a new "Boardfly" network) were announced in April 2026 for availability later in 2026 — check Google Cloud for current status.

**Three things that make pods work:**

- **ICI is much faster than the data-centre network.** Each v5p or TPU7x chip has 1,200 GB/s of ICI bandwidth counting both directions (on TPU7x: six links × 200 GB/s); v6e has 800 GB/s and v5e 400 GB/s. Its share of the data-centre network is only 50–100 Gbps — about 100–200 times less. So the chatty parallelism (tensor parallelism, FSDP) stays inside a slice, and Multislice runs plain data parallelism across slices, with XLA generating the DCN transfers. The parallelism strategies themselves are taught in [Ch 29 §24.6](#content/29_gpus_tpus_infrastructure).
- **Optical circuit switches make the pod reconfigurable.** Cubes are linked by mirrors that can be re-pointed, so Google can carve out a slice of the shape you ask for and route around a failed rack.
- **SparseCore handles embeddings.** Embedding lookups (recommendation models, huge vocabularies) are scattered memory reads — a bad fit for a systolic array. Since v4, TPUs add small dataflow processors for them: 4 SparseCores per chip on v5p and TPU7x, 2 on v6e. The TPU v4 paper reports 5–7× faster embedding-heavy models for about 5% of the chip's area and power.

**Naming trap:** older accelerator types count TensorCores, not chips — `v5p-128` is a 4x4x4 slice of 64 chips. On TPU7x each chip appears to JAX as **two** devices (one per chiplet), so a 4-chip VM shows 8 devices.

</details>

---

### Difference 5: XLA — One Compiler Plans Everything

<details>
<summary><strong>Read as text</strong> — the XLA pipeline and what it needs from your code</summary>

**The 10-year-old version:**

A GPU kitchen is full of cooks, each following their own recipe card (a *kernel*) for one dish at a time. A TPU kitchen has a head chef who reads the whole menu first, plans every step, merges steps that share ingredients, and tells every station exactly when to work. That head chef is the **XLA compiler**.

**The technical version:**

You don't program the MXU directly. JAX, PyTorch (through TorchTPU's `torch.compile` path) and TensorFlow all hand **XLA** a graph of the whole computation — in Google's words, they "generate an XLA high-level operation (HLO) graph, which XLA compiles to a TPU executable."

```
  Your Python step (JAX / PyTorch / TensorFlow)
        │  trace it once with example shapes
        ▼
  HLO graph (StableHLO): every matmul, add, softmax and all-reduce in the step
        │  XLA compiler
        ▼
  1. Fuse      x @ w + b → ReLU becomes one kernel; the intermediate
               never goes back to HBM
  2. Tile      cut matmuls into MXU-sized blocks (128 × 128, or 256 × 256
               on v6e / TPU7x) and pad what doesn't fit
  3. Schedule  stream blocks HBM → on-chip vector memory (VMEM) → MXU,
               overlapping copies with compute
  4. Shard     follow your sharding annotations: split arrays across chips
               and insert ICI collectives (all-reduce, all-gather)
        ▼
  One TPU program — cached and reused while the input shapes stay the same
```

What this means for your code:

| XLA needs | Why | What goes wrong otherwise |
|-----------|-----|---------------------------|
| Static shapes | It compiles one program per input shape | Every new sequence length triggers a fresh compile (seconds to minutes) — pad or bucket lengths |
| Large dimensions in multiples of 128 (and bigger than the MXU: 256 on v6e / TPU7x) | Matmuls are cut into MXU tiles (Google suggests batch 1,024 and feature sizes that are multiples of 128) | A 129-wide layer is padded to 256, so about half the work is wasted |
| Loops and branches the compiler can see | Python `if` / `for` run once, at trace time | Use `jax.lax.cond` / `jax.lax.scan` for control flow on traced values |
| Sharding annotations instead of hand-written communication | XLA inserts the collectives | A bad sharding becomes huge all-gathers over ICI — check the profile |

When XLA's output is not fast enough, you write a custom kernel in **Pallas**, JAX's kernel language for TPUs and GPUs. How `jax.jit` traces and compiles (you can inspect each stage with `jax.jit(f).trace(x).lower().compile()`) and how JAX shards arrays across chips are taught in Section 2 (§2.3).

</details>

---

## 1.4 TPU vs GPU — When to Use Which?

<details>
<summary><strong>Read as text</strong> — the TPU, GPU and CPU cards, the table and the rule of thumb</summary>

```
  ┌───────────────────────┬───────────────────────┬──────────────────┐
  │ TPU                   │ GPU                   │ CPU              │
  ├───────────────────────┼───────────────────────┼──────────────────┤
  │ Where: Google Cloud   │ Every cloud and       │ Everywhere       │
  │ (Oracle OCI in 2027)  │ on-premises           │                  │
  │                       │                       │                  │
  │ Code: JAX first;      │ PyTorch first; JAX    │ scikit-learn,    │
  │ PyTorch via TorchTPU  │ and TensorFlow too    │ pandas, NumPy    │
  │                       │                       │                  │
  │ Formats: BF16, int8,  │ BF16 (A100+), FP8     │ FP32 / FP64      │
  │ FP8 (v5p, TPU7x)      │ (H100+), FP4 (B200)   │                  │
  │                       │                       │                  │
  │ Best for:             │ Best for:             │ Best for:        │
  │ - big transformer /   │ - most research code  │ - classical ML   │
  │   LLM training        │ - custom CUDA ops     │ - small data     │
  │ - large-scale serving │ - mixed workloads     │ - data prep and  │
  │ - recommenders        │ - on-premises or      │   feature eng.   │
  │   (SparseCore)        │   multi-cloud         │                  │
  └───────────────────────┴───────────────────────┴──────────────────┘
```

| Factor | TPU | GPU |
|--------|-----|-----|
| Availability | Google Cloud today; Oracle Cloud (OCI, from 2027) and a Blackstone-backed TPU cloud (announced May 2026) are coming | Every major cloud and on-premises |
| Framework fit | JAX / XLA native; PyTorch through TorchTPU (replaces PyTorch/XLA); TensorFlow only on older generations (TPU7x supports JAX and PyTorch only) | PyTorch dominates research; the CUDA ecosystem is the largest |
| Custom or unusual ops | Must compile through XLA, or be written as Pallas kernels | Write any CUDA or Triton kernel |
| Scaling to thousands of chips | ICI torus inside a pod (up to 9,216 chips), Multislice beyond | NVLink inside a server or rack; InfiniBand or Ethernet between racks |
| Price-performance | Often strong for large, static-shape, matmul-heavy jobs — benchmark your own model | Strong everywhere, with more suppliers and pricing options |
| Low-precision formats | BF16 (v2+), int8 (v5e, v6e), FP8 (v5p, TPU7x), FP4 (TPU 8t) | BF16 (A100+), FP8 (H100+), FP4 (B200 and later) |

**Rule of thumb:** pick a TPU when (1) the model is matmul-heavy (transformers, recommenders), (2) shapes are static or can be bucketed, (3) your code compiles cleanly through XLA (JAX, or PyTorch via TorchTPU), and (4) you can run on Google Cloud. Otherwise, default to GPUs. The full GPU / TPU / CPU decision table is in [Ch 29 §24.8](#content/29_gpus_tpus_infrastructure).

**Say this in an interview:** "TPUs trade flexibility for efficiency: a few huge systolic arrays fed by HBM, BF16 by default with FP32 sums, chips wired into a torus by ICI, and XLA compiling the whole training step. They shine on large, static-shape, matmul-heavy work in JAX; GPUs win on ecosystem, custom kernels and availability."

</details>

---

# SECTION 2: JAX — FUNCTIONAL ML AT GOOGLE

---

## 2.1 The Simple Explanation

![Infographic on JAX's core transformations: one plain Python function written with jax.numpy feeds jit (sin, cos, two squares and an add fused into one kernel; same shape reuses the compiled program, a new shape recompiles), vmap (x1 to xn mapped through f in one batched operation, in_axes=(None, 0) shares the weights) and grad (tangent to f(x) = x^2 at x = 3, grad = 6.0, finite difference = 6.000000). Stacking jit(vmap(grad(loss))) gives per-example gradients of shape (5, 3) with norms 2.94, 2.43, 4.88, 0.96 and 23.71, the outlier DP-SGD clips; their mean equals the batch gradient +3.802, -0.563, +3.450. Trap: time JAX with .block_until_ready() because it runs asynchronously.](diagrams/gml30_info_jax_core_transforms_ai.png)

### The Magic Wand Analogy

<details>
<summary><strong>Read as text</strong> — the four wands and the JAX recipe card</summary>

Imagine you write a recipe for chocolate cake on a piece of paper. Now imagine you have four magic wands:

1. **Speed Wand (`jit`):** Wave it over your recipe and the wand reads the whole recipe once, plans every step, and from then on bakes much faster — no stopping to re-read each line.

2. **Clone Wand (`vmap`):** Wave it and your recipe for ONE cake works on 100 cakes at once — without you rewriting anything. One recipe, any batch size.

3. **Reverse Wand (`grad`):** Wave it and you learn "if I add a little more sugar, how much sweeter does the cake get?" — the exact effect of every ingredient on the result.

4. **Army Wand (sharding and `shard_map`):** Wave it and the order is split across 8 kitchens, each baking its share — all in parallel, comparing notes at the end. (Older JAX code uses `pmap` for this; it is now in maintenance mode — see Transformation 4.)

**JAX** gives you these four wands for maths functions. You write a normal Python function using `jax.numpy` (a copy of the NumPy API), then transform it.

```
  ┌──────────────────────────────────────────────────────┐
  │  JAX = NumPy API + function transformations + XLA    │
  │                                                      │
  │  import jax                                          │
  │  import jax.numpy as jnp        ← works like NumPy   │
  │                                                      │
  │  def f(x):                                           │
  │      return jnp.sin(x) ** 2 + jnp.cos(x) ** 2        │
  │                                                      │
  │  fast_f  = jax.jit(f)           ← Speed Wand         │
  │  batch_f = jax.vmap(f)          ← Clone Wand         │
  │  grad_f  = jax.grad(f)          ← Reverse Wand       │
  │  multi_f = jax.shard_map(f,...) ← Army Wand          │
  └──────────────────────────────────────────────────────┘
```

</details>

---

## 2.2 Official Definition

<details>
<summary><strong>Read as text</strong> — the formal definition and where JAX is used</summary>

> **JAX** is an open-source Python library from Google for accelerator-oriented
> array computation and program transformation, built for high-performance
> numerical computing and large-scale machine learning. It offers a NumPy-like
> API plus composable function transformations — `jit` (just-in-time
> compilation), `grad` (automatic differentiation), `vmap` (automatic
> vectorization) and sharding with `shard_map` (parallelism across devices).
> JAX traces Python functions and compiles them with **XLA** (Accelerated
> Linear Algebra, part of the open-source OpenXLA project) for CPUs, GPUs and TPUs.

**Where it is used:** Google DeepMind trains Gemini and the open Gemma models with JAX on the Pathways runtime; AlphaFold is written in JAX; PaLM (2022) was trained with JAX and T5X on 6,144 TPU v4 chips. JAX is still versioned 0.x and releases about once a month, so check the changelog before copying old code — `jax.tree_map`, for example, was removed in JAX 0.6.

</details>

---

## 2.3 The Four Transformations — Deep Dive

<details>
<summary><strong>Read as text</strong> — the learning order and the gradient check in one line</summary>

Each transformation takes a function and returns a new function. Learn them in this order: compile (`jit`), batch (`vmap`), differentiate (`grad`), then spread across chips (sharding).

> **Maths in one line:** `jax.grad(f)(x) = df/dx`, which you can check with `(f(x+h) − f(x−h)) / 2h` — for f(x) = x² at x = 3 both give 6.

</details>

### Transformation 1: `jit` — Just-In-Time Compilation

<details>
<summary><strong>Read as text</strong> — tracing, fusion, async timing and the rules jit imposes</summary>

**What it does:** The first time you call a jitted function, JAX *traces* it: it runs your Python once with placeholder values that carry only a shape and a dtype (data type, e.g. `float32`), records the array operations, and hands that program to XLA, which compiles it for your chip. Later calls with the same shapes and dtypes skip Python and run the compiled program.

**Why it matters:** Without `jit`, every `jnp` operation is launched separately from Python and writes its result to memory. XLA sees the whole function at once, so it can **fuse** operations (in the example below, `sin`, `cos`, two squares and an add become one pass over the array), drop unneeded work and plan memory. The speed-up depends on the function: chains of small element-wise steps gain the most.

```
  Without jit (one operation at a time):
  ──────────────────────────────────────
  jnp.sin(x)   → launch kernel → write y to memory
  jnp.cos(x)   → launch kernel → write z to memory
  y*y, z*z, +  → 3 more kernels, 3 more trips to memory
  (Python overhead + a memory round-trip for every op)

  With jit (traced once, compiled by XLA):
  ────────────────────────────────────────
  1st call:    trace → optimise and fuse → compile for this shape/dtype
  next calls:  one fused kernel: read x once, write the result once
```

**Code example:**

```python
# Runs locally: pip install -U jax
import jax
import jax.numpy as jnp

def f(x):
    y = jnp.sin(x)
    z = jnp.cos(x)
    return y * y + z * z               # five element-wise ops; XLA fuses them into one

fast_f = jax.jit(f)

x = jnp.ones(1_000_000)
fast_f(x).block_until_ready()          # 1st call: trace + compile for float32[1000000], then run
fast_f(x).block_until_ready()          # same shape and dtype: reuses the compiled program
fast_f(jnp.ones(10))                   # new shape: traces and compiles again
```

JAX runs work **asynchronously**: a call returns as soon as the work is queued. When you time code, call `.block_until_ready()` on the result, or you measure only the launch.

**The rules `jit` imposes** — tracing sees shapes, not values. Think of it as: `jit` plans the whole route before driving, so the route can't depend on what it sees on the road.

| You write | Under `jit` | Do this instead |
|-----------|-------------|-----------------|
| `if x > 0:` on an array value | Error (`TracerBoolConversionError`): the value is unknown while tracing | `jnp.where(x > 0, x, 0.0)` or `jax.lax.cond` |
| A Python `for` loop with a fixed count | Works, but is unrolled — a long loop compiles slowly | `jax.lax.fori_loop` or `jax.lax.scan` |
| A loop whose length depends on the data | Error | `jax.lax.while_loop` |
| A setting passed as an argument (e.g. `n_layers`) | Traced like data | `jax.jit(f, static_argnames="n_layers")` — recompiles for each new value |
| `print(x)` inside the function | Prints a placeholder once, at trace time | `jax.debug.print("{}", x)` |

</details>

---

### Transformation 2: `vmap` — Automatic Vectorization

<details>
<summary><strong>Read as text</strong> — the problem vmap solves and how it batches</summary>

**What it does:** Takes a function that works on ONE example and automatically makes it work on a BATCH of examples — with no loops, no rewriting.

**Why it matters:** Writing code for one data point is easy. Making it efficient for batches is hard. `vmap` does the hard part automatically.

```
  The Problem vmap Solves
  ────────────────────────

  You wrote this (works on one input):

    def predict(weights, single_input):
        return weights @ single_input

  You need this (works on a batch of 1000 inputs):

    # Option A: Slow Python loop 🐌
    results = [predict(weights, x) for x in batch]

    # Option B: Rewrite with batch dimensions 😰
    def predict_batch(weights, batch_input):
        return jnp.einsum('ij,bj->bi', weights, batch_input)

    # Option C: Just use vmap! ✨
    predict_batch = jax.vmap(predict, in_axes=(None, 0))
    results = predict_batch(weights, batch)
    # None = don't batch over weights
    # 0    = batch over first axis of inputs
```

```
  vmap Visualized
  ────────────────

  Your function:  f(x) → y     (works on one item)

  vmap(f):
  ┌─────────────────────┐
  │  x₁ → f → y₁        │
  │  x₂ → f → y₂        │    All computed in ONE vectorized
  │  x₃ → f → y₃        │    operation on the hardware.
  │  ...                │    No Python loop!
  │  xₙ → f → yₙ        │
  └─────────────────────┘

  vmap doesn't loop — it rewrites each operation into its batched
  version (a matrix-vector product becomes a matrix-matrix product),
  so the whole batch runs as one big array operation.
```

</details>

---

### Transformation 3: `grad` — Automatic Differentiation

<details>
<summary><strong>Read as text</strong> — reverse-mode autodiff, value_and_grad and the gradient check</summary>

**What it does:** Takes a function that returns ONE number (a scalar, such as a loss) and returns a NEW function that computes its gradient with respect to the first argument (pick others with `argnums`). This is the heart of how neural networks learn.

**Why it matters:** In deep learning we need "how much does changing each weight change the loss?" for billions of weights. `grad` uses **reverse-mode automatic differentiation**: it records the operations of the forward pass, then applies the chain rule backwards once. That single backward pass gives the derivative for EVERY input, at the cost of a few forward passes — whether the function has 3 inputs or 7 billion.

```
  grad Visualized
  ────────────────

  You have:   f(x) = x²

  Math says:  f'(x) = 2x     (the derivative)

  JAX does:   grad_f = jax.grad(f)
              grad_f(3.0) → 6.0     ✓  (2 × 3 = 6)

  This works for any function built from JAX operations:

  def messy_function(x):
      y = jnp.sin(x ** 2)
      z = jnp.log(y + 1) * jnp.tanh(x)
      return z.sum()               # grad needs a scalar output

  gradient_fn = jax.grad(messy_function)
  # JAX applies the chain rule for you
```

In training you almost always want the loss and the gradient together: `loss, grads = jax.value_and_grad(loss_fn)(params, batch)`. For full Jacobians there are `jax.jacrev` (reverse mode), `jax.jacfwd` (forward mode) and `jax.hessian`.

**Check it yourself.** A gradient can always be checked against a finite difference — the slope between two nearby points. That is how `jax.test_util.check_grads` tests gradients. The program also shows why nobody trains that way:

</details>

```python
# Checking a gradient the way jax.test_util.check_grads does: compare with a finite difference
import numpy as np

def f(x):
    return x ** 2

def df(x):                          # what jax.grad(f) returns: 2x
    return 2 * x

def central_diff(fn, x, h=1e-5):    # slope from two nearby points
    return (fn(x + h) - fn(x - h)) / (2 * h)

x = 3.0
print(f"f(x) = x^2 at x = 3: grad = {df(x):.1f}, finite difference = {central_diff(f, x):.6f}")

def messy(x):
    y = np.sin(x ** 2)
    return np.log(y + 1) * np.tanh(x)

def messy_grad(x):                  # the chain rule by hand: the bookkeeping jax.grad automates
    y = np.sin(x ** 2)
    dy_dx = np.cos(x ** 2) * 2 * x
    return dy_dx / (y + 1) * np.tanh(x) + np.log(y + 1) * (1 - np.tanh(x) ** 2)

for x in [0.5, 1.0, 1.5]:
    exact, approx = messy_grad(x), central_diff(messy, x)
    assert abs(exact - approx) < 1e-6
    print(f"messy at x = {x}: chain rule = {exact:+.6f}, finite difference = {approx:+.6f}")

# Why training never uses finite differences: 2 extra passes of f PER parameter
params = 7_000_000_000
print(f"finite differences, {params:,} parameters: {2 * params:,} passes of f per step")
print("reverse-mode autodiff (jax.grad): 1 forward + 1 backward pass, at any size")
```

**Output:**

```
f(x) = x^2 at x = 3: grad = 6.0, finite difference = 6.000000
messy at x = 0.5: chain rule = +0.532802, finite difference = +0.532802
messy at x = 1.0: chain rule = +0.703337, finite difference = +0.703337
messy at x = 1.5: chain rule = -0.855334, finite difference = -0.855334
finite differences, 7,000,000,000 parameters: 14,000,000,000 passes of f per step
reverse-mode autodiff (jax.grad): 1 forward + 1 backward pass, at any size
```

---

### Composability — Stacking Transformations

<details>
<summary><strong>Read as text</strong> — per-example gradients with jit(vmap(grad)) and the NumPy version</summary>

The magic of JAX is that transformations **compose**: each one returns an ordinary function, so you can feed it to the next. The classic example is **per-example gradients** — one gradient for every example in a batch, which differential-privacy training (DP-SGD) and data debugging need:

```python
# Runs locally: pip install -U jax
import jax
import jax.numpy as jnp

def loss(w, x, t):                                    # loss for ONE example
    return (x @ w - t) ** 2

grad_one = jax.grad(loss)                             # gradient for one example
grad_each = jax.vmap(grad_one, in_axes=(None, 0, 0))  # ... for every example (w shared)
fast_grad_each = jax.jit(grad_each)                   # ... compiled into one XLA program

w = jnp.array([0.5, -1.0, 2.0])
X, t = jnp.ones((5, 3)), jnp.zeros(5)
print(fast_grad_each(w, X, t).shape)                  # (5, 3): one gradient per example
```

```
  Composability Diagram
  ──────────────────────

  f(x) ──► grad ──► vmap ──► jit ───► sharded inputs
           │        │        │        │
           │        │        │        └─ runs on 8 chips (Transformation 4)
           │        │        └─ compiled to one fast XLA program
           │        └─ batched over 1000 examples
           └─ computes gradients automatically

  You write ONE function. JAX turns it into a differentiable,
  batched, compiled and distributed program.
```

The same computation in NumPy — the loop you would write without `vmap`, the vectorised version `vmap` builds for you, and the check that the average of the per-example gradients is the ordinary batch gradient:

</details>

```python
# What jax.vmap(jax.grad(loss), in_axes=(None, 0, 0)) computes: one gradient per example
import numpy as np

rng = np.random.default_rng(0)
X = rng.normal(size=(5, 3))              # batch: 5 examples x 3 features -> in_axes 0
t = rng.normal(size=5)                   # 5 targets                      -> in_axes 0
w = np.array([0.5, -1.0, 2.0])           # shared weights                 -> in_axes None

def grad_loss(w, x, t):                  # written for ONE example: d/dw (x.w - t)^2
    return 2 * (x @ w - t) * x

fmt = lambda v: "[" + ", ".join(f"{a:+.3f}" for a in v) + "]"

loop = np.stack([grad_loss(w, X[i], t[i]) for i in range(len(X))])   # Option A: Python loop
batched = 2 * (X @ w - t)[:, None] * X                                 # Option B: what vmap builds
assert np.allclose(loop, batched)
print(f"per-example gradients: shape {batched.shape} = (examples, weights)")
norms = np.linalg.norm(batched, axis=1)
for i, g in enumerate(batched):
    print(f"  example {i}: {fmt(g)}  norm {norms[i]:.2f}")
print(f"example {int(norms.argmax())} dominates; DP-SGD clips each row's norm before averaging")

mean_grad = batched.mean(axis=0)                  # average them ...
batch_grad = 2 * X.T @ (X @ w - t) / len(X)       # ... = gradient of the mean loss
assert np.allclose(mean_grad, batch_grad)
print(f"mean of per-example grads = batch gradient = {fmt(batch_grad)}")
```

**Output:**

```
per-example gradients: shape (5, 3) = (examples, weights)
  example 0: [+0.555, -0.583, +2.828]  norm 2.94
  example 1: [+0.389, -1.988, +1.342]  norm 2.43
  example 2: [-3.615, -2.626, +1.951]  norm 4.88
  example 3: [+0.856, +0.422, -0.028]  norm 0.96
  example 4: [+20.823, +1.960, +11.159]  norm 23.71
example 4 dominates; DP-SGD clips each row's norm before averaging
mean of per-example grads = batch gradient = [+3.802, -0.563, +3.450]
```

---

### Transformation 4: Parallelism Across Devices — `pmap` → Sharding and `shard_map`

![Infographic on data parallelism in JAX: a mesh of 4 chips, data rows split with NamedSharding P('batch') and weights copied with P(), each chip computes a local gradient g0 to g3, and an all-reduce (pmean) gives g = (g0 + g1 + g2 + g3) / 4 on every chip. Worked example with 8 rows on 4 chips: pmean equals the full-batch gradient -0.130, +0.308, -0.414; uneven 5/1/1/1 shards make the plain mean wrong. Notes jit + sharding vs shard_map vs legacy pmap.](diagrams/gml30_info_jax_sharding_parallelism_ai.png)

<details>
<summary><strong>Read as text</strong> — Mesh, NamedSharding, jit vs shard_map vs legacy pmap</summary>

**What it does:** Runs one program on many chips (TPUs or GPUs) at once. The most common pattern is **data parallelism**: split the batch across chips, give every chip a full copy of the weights, let each chip compute the gradient on its slice, then **all-reduce** (average) the gradients so every chip applies the same update. Averaging works because, with equal-sized slices, the mean of the per-chip gradients equals the full-batch gradient: `g = (g_0 + g_1 + ... + g_(N-1)) / N` for N chips.

**Why it matters:** Hand-written distributed training means hundreds of lines of communication code. In JAX you describe *where data lives*, and the compiler (or a few explicit collectives) does the rest.

Three words to learn first:

| Term | Meaning | Example |
|------|---------|---------|
| **Mesh** | A grid of devices with named axes | 8 chips as `('batch',)`, or 4 × 2 as `('data', 'model')` |
| **PartitionSpec** (`P`) | Which array axis is split over which mesh axis | `P('batch')` = split rows over `'batch'`; `P()` = full copy everywhere |
| **NamedSharding** | Mesh + PartitionSpec: where an array's pieces live | `NamedSharding(mesh, P('batch'))` |

```
  Data parallelism: 4 chips, mesh axis 'batch', global batch of 1000 rows
  ───────────────────────────────────────────────────────────────────────
  x: NamedSharding(mesh, P('batch'))  → split by rows
  w: NamedSharding(mesh, P())         → full copy on every chip

  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │   chip 0   │  │   chip 1   │  │   chip 2   │  │   chip 3   │
  │ rows 0-249 │  │rows 250-499│  │rows 500-749│  │rows 750-999│
  │  copy of w │  │  copy of w │  │  copy of w │  │  copy of w │
  │ local grad │  │ local grad │  │ local grad │  │ local grad │
  │     g0     │  │     g1     │  │     g2     │  │     g3     │
  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
        └───────────────┴───────┬───────┴───────────────┘
                                │ all-reduce (pmean)
                                ▼
                g = (g0 + g1 + g2 + g3) / 4 on EVERY chip
                → every chip applies the same update to w
```

JAX gives you two ways to write this today, plus one you will still meet in older code:

| Way | You write | Who adds the communication |
|-----|-----------|----------------------------|
| **Automatic:** `jax.jit` + sharded inputs | Normal single-device code; place the inputs with `NamedSharding` | The XLA compiler |
| **Manual:** `jax.shard_map` | Per-chip code that sees only its own shard | You: `jax.lax.psum`, `pmean`, `all_gather` |
| **Legacy:** `jax.pmap` | Per-device code, one array slice per device | You; in maintenance mode since JAX 0.8 (October 2025) and now a thin wrapper over `jit` + `shard_map` — don't use it in new code |

**Code example** (both modern ways, same model):

```python
# Runs locally: pip install -U jax   (8 fake devices on a CPU: XLA_FLAGS=--xla_force_host_platform_device_count=8)
import jax
import jax.numpy as jnp
from jax.sharding import NamedSharding, PartitionSpec as P

mesh = jax.make_mesh((jax.device_count(),), ("batch",))   # 1-D mesh: every chip on axis "batch"
jax.set_mesh(mesh)

def loss_fn(w, x, y):
    return jnp.mean((x @ w - y) ** 2)

@jax.jit                                     # (A) automatic: single-device code
def train_step(w, x, y):
    loss, g = jax.value_and_grad(loss_fn)(w, x, y)    # XLA inserts the gradient all-reduce
    return w - 0.1 * g, loss

@jax.shard_map(out_specs=P())                # (B) manual: each chip sees only its rows
def loss_manual(w, x, y):
    return jax.lax.pmean(loss_fn(w, x, y), "batch")   # average the per-chip losses

n = 32 * jax.device_count()                  # batch must divide evenly across chips
x = jax.device_put(jnp.ones((n, 4)), NamedSharding(mesh, P("batch")))   # rows split
y = jax.device_put(jnp.ones(n), NamedSharding(mesh, P("batch")))
w = jax.device_put(jnp.zeros(4), NamedSharding(mesh, P()))              # weights copied
g_auto = jax.jit(jax.grad(loss_fn))(w, x, y)          # (A) the compiler adds the all-reduce
g_manual = jax.jit(jax.grad(loss_manual))(w, x, y)    # (B) your pmean: same numbers as g_auto
w, loss = train_step(w, x, y)                         # one full training step, way (A)
```

**Older code you will still read:** `jax.pmap(step, axis_name="i")` with `jax.lax.pmean(grads, "i")` inside the step — the `axis_name` must be given to `pmap`, or `pmean` fails. `pmap` hands each device one slice with the mapped axis removed (an `(8, 128)` array becomes `(128,)` per device); `shard_map` keeps the axis (`(1, 128)` per device).

The same mesh scales beyond data parallelism: split the weights over a `'model'` axis (tensor parallelism) or over the batch axis too (fully sharded data parallelism, FSDP) — only the `PartitionSpec`s change. How those strategies trade memory for communication, and how a ring all-reduce works, is taught in [Ch 29 §24.6](#content/29_gpus_tpus_infrastructure).

Simulate it with 4 "chips" and 8 rows. The plain average is exact only when the shards are equal in size — one reason `shard_map` refuses a batch that the mesh does not divide evenly:

</details>

```python
# Data parallelism by hand: 4 "chips" each get 2 of 8 rows; averaging their gradients = full-batch gradient
import numpy as np

rng = np.random.default_rng(0)
X = rng.normal(size=(8, 3))               # global batch: 8 examples x 3 features
y = rng.normal(size=8)
w = np.zeros(3)                           # replicated weights: P()

def grad_mse(w, X, y):                    # gradient of mean((Xw - y)^2)
    return 2 * X.T @ (X @ w - y) / len(y)

fmt = lambda v: "[" + ", ".join(f"{a:+.3f}" for a in v) + "]"

shards = np.split(np.arange(8), 4)                     # P('batch') over 4 chips: rows 0-1, 2-3, 4-5, 6-7
local = [grad_mse(w, X[s], y[s]) for s in shards]      # each chip sees only its own rows
for d, (s, g) in enumerate(zip(shards, local)):
    print(f"chip {d} (rows {s[0]}-{s[-1]}): local grad {fmt(g)}")

pmean = np.mean(local, axis=0)                         # lax.pmean(g, 'batch'): same answer on every chip
full = grad_mse(w, X, y)
assert np.allclose(pmean, full)
print(f"pmean of local grads : {fmt(pmean)}")
print(f"full-batch gradient  : {fmt(full)}")

uneven = [np.arange(0, 5), np.array([5]), np.array([6]), np.array([7])]   # 5 + 1 + 1 + 1 rows
naive = np.mean([grad_mse(w, X[s], y[s]) for s in uneven], axis=0)
weighted = sum(len(s) * grad_mse(w, X[s], y[s]) for s in uneven) / len(y)
assert np.allclose(weighted, full) and not np.allclose(naive, full)
print(f"uneven 5/1/1/1 rows, plain mean   : {fmt(naive)}  <- wrong")
print(f"uneven 5/1/1/1 rows, size-weighted: {fmt(weighted)}  <- right")
```

**Output:**

```
chip 0 (rows 0-1): local grad [-0.123, +0.170, -0.613]
chip 1 (rows 2-3): local grad [-0.197, +0.130, -0.485]
chip 2 (rows 4-5): local grad [-0.903, +0.020, -0.501]
chip 3 (rows 6-7): local grad [+0.701, +0.913, -0.056]
pmean of local grads : [-0.130, +0.308, -0.414]
full-batch gradient  : [-0.130, +0.308, -0.414]
uneven 5/1/1/1 rows, plain mean   : [+0.293, +0.537, -0.160]  <- wrong
uneven 5/1/1/1 rows, size-weighted: [-0.130, +0.308, -0.414]  <- right
```

---

## 2.4 JAX Ecosystem — Libraries Built on JAX

![Infographic on the JAX AI stack and the functional style: a layer stack from TPU / GPU / CPU through XLA and JAX core (jit, vmap, grad, shard_map, Pallas) up to Flax NNX, Optax, Orbax, Grain and MaxText / Tunix, beside a pure training-step loop params + opt_state, value_and_grad, Optax update, apply_updates giving new params while old params stay unchanged. Random-key example: the same key gives +0.126, -0.132, +0.640 twice, a reused key gives masks 1011 and 1011, split keys give 0111 and 1010. Trap: arrays are immutable, update with x.at index set, which returns a new array.](diagrams/gml30_info_jax_stack_functional_ai.png)

<details>
<summary><strong>Read as text</strong> — the JAX AI stack and its PyTorch twins</summary>

JAX itself is deliberately small: arrays, transformations and compilation. Google calls the set of libraries around it the **JAX AI stack** — each library does one job, and you combine the ones you need:

```
  ┌──────────────────────────────────────────────────────────┐
  │                    The JAX AI stack                      │
  │                                                          │
  │   Your model code                                        │
  │        │                                                 │
  │   ┌────┴─────────────────────────────────────────────┐   │
  │   │  Flax NNX  — neural-network layers and models    │   │
  │   │  Optax     — optimizers (AdamW, LR schedules)    │   │
  │   │  Orbax     — checkpoints (save / restore)        │   │
  │   │  Grain     — data loading                        │   │
  │   │  MaxText   — LLM pre-training and post-training  │   │
  │   └────┬─────────────────────────────────────────────┘   │
  │        │                                                 │
  │   ┌────┴────────────┐                                    │
  │   │    JAX core     │  jit, vmap, grad, shard_map        │
  │   └────┬────────────┘  (Pallas: custom kernels)          │
  │        │                                                 │
  │   ┌────┴────────────┐                                    │
  │   │      XLA        │  the compiler (OpenXLA)            │
  │   └────┬────────────┘                                    │
  │        │                                                 │
  │   ┌────┴────────────┐                                    │
  │   │ TPU / GPU / CPU │  hardware                          │
  │   └─────────────────┘                                    │
  └──────────────────────────────────────────────────────────┘
```

| Library | What it does | Like in PyTorch |
|---------|--------------|-----------------|
| **Flax NNX** | Layers and models as Python objects (`nnx.Module`). The older **Flax Linen** API is still widely used and supported | `torch.nn.Module` |
| **Optax** | Optimizers, learning-rate schedules and gradient clipping, as small composable pieces | `torch.optim` |
| **Orbax** | Fast, asynchronous checkpoints of sharded arrays; `orbax-export` can also write a TensorFlow SavedModel | `torch.distributed.checkpoint` |
| **Grain** | Deterministic, resumable input pipelines | `torch.utils.data.DataLoader` |
| **Pallas** | Custom TPU/GPU kernels written in Python inside JAX | Triton |
| **MaxText** | Open-source reference LLM code for TPUs and GPUs (Gemma, Llama, DeepSeek, Qwen, …): pre-training and post-training such as SFT and GRPO | TorchTitan |
| **Tunix** | Post-training and alignment (SFT, RLHF, DPO) | TRL |
| **T5X, Pax** | Earlier Google training frameworks (PaLM was trained with T5X); MaxText is the current reference | — |

</details>

### A Training Step with Flax NNX + Optax

<details>
<summary><strong>Read as text</strong> — a Flax NNX + Optax training step</summary>

Flax NNX feels like PyTorch on the outside — a model is an object that holds its weights — while `nnx.jit` and `nnx.value_and_grad` turn it into pure JAX functions underneath:

```python
# Runs locally: pip install -U flax optax   (Flax NNX + Optax; Flax 0.12 API)
import jax.numpy as jnp
import optax
from flax import nnx

class MLP(nnx.Module):
    def __init__(self, din, dhidden, dout, rngs: nnx.Rngs):
        self.hidden = nnx.Linear(din, dhidden, rngs=rngs)
        self.out = nnx.Linear(dhidden, dout, rngs=rngs)

    def __call__(self, x):
        return self.out(nnx.relu(self.hidden(x)))

model = MLP(4, 32, 1, rngs=nnx.Rngs(0))               # weights created now, from seed 0
optimizer = nnx.Optimizer(model, optax.adamw(1e-3), wrt=nnx.Param)

@nnx.jit                                               # like jax.jit, but understands NNX objects
def train_step(model, optimizer, x, y):
    loss_fn = lambda m: jnp.mean((m(x) - y) ** 2)
    loss, grads = nnx.value_and_grad(loss_fn)(model)
    optimizer.update(model, grads)                     # one AdamW step, written back into model
    return loss

x, y = jnp.ones((8, 4)), jnp.zeros((8, 1))
for step in range(3):
    print(step, train_step(model, optimizer, x, y))
```

</details>

---

## 2.5 Key JAX Concepts to Remember

<details>
<summary><strong>Read as text</strong> — pure functions, pytrees and the functional training step</summary>

**JAX is functional.** Unlike PyTorch (where objects carry mutable state), core JAX works with pure functions: everything a function needs goes in as an argument, and everything it changes comes out as a return value.

> **Maths in one line:** `params_new = update(params, grad(loss)(params, batch))` — a training step is a pure function: the same inputs always give the same outputs, so `jit`, `vmap` and sharding can transform it safely.

```
  PyTorch style (objects own their state):
  ────────────────────────────────────────
  model = MyNetwork()              # weights live inside the model object
  loss = loss_fn(model(x), y)      # forward pass records what backward needs
  loss.backward()                  # writes each gradient into param.grad
  optimizer.step()                 # updates the weights in place

  JAX style (pure functions: state goes in, new state comes out):
  ───────────────────────────────────────────────────────────────
  params = init(key)                                        # a pytree: nested dict of arrays
  loss, grads = jax.value_and_grad(loss_fn)(params, x, y)   # grads: same tree shape as params
  updates, opt_state = tx.update(grads, opt_state, params)  # Optax: a pure function too
  params = optax.apply_updates(params, updates)             # NEW params; old ones unchanged
```

**Why functional matters:**
- Pure functions have no side effects → easier to reason about and to test
- No hidden state → `jit`, `vmap`, `grad` and sharding can safely transform them
- Immutable arrays → safe to copy across chips (no race conditions)

**Pytrees.** JAX functions accept nested lists, tuples and dicts of arrays, called **pytrees** — a whole model's parameters are one pytree, and `grad` returns a pytree of the same shape. `jax.tree.map(lambda p, g: p - 0.01 * g, params, grads)` updates every leaf at once. (Older code uses `jax.tree_map`, which was removed in JAX 0.6.)

Flax NNX objects look stateful, but the rule still holds underneath: `nnx.jit` and `nnx.grad` split the object into a pure pytree of state, run the transformation, and put the result back.

</details>

### Randomness — Explicit PRNG Keys

<details>
<summary><strong>Read as text</strong> — why JAX passes random keys explicitly</summary>

NumPy and PyTorch keep a hidden global random state. JAX can't: hidden state would break `jit` (the function is traced once), `vmap` and sharding (which chip would advance it?). So every random function takes a **key** — a small array value — and the same key always gives the same numbers. You **split** a key to get new ones, and use each key only once.

```python
# Runs locally: pip install -U jax
import jax

key = jax.random.key(0)                          # typed key (older code: jax.random.PRNGKey(0))
key, k_init, k_drop = jax.random.split(key, 3)   # one parent -> three children; use each once
w = jax.random.normal(k_init, (3,))
keep = jax.random.bernoulli(k_drop, 0.9, (3,))   # dropout mask with keep-probability 0.9
```

The same idea in NumPy: a key is a plain value, splitting is deterministic, and reusing a key is a silent bug:

</details>

```python
# JAX-style randomness: a key is a plain value; same key -> same numbers; split a key to get fresh ones
import numpy as np

def split(key, num=2):                 # like jax.random.split: child keys depend only on the parent key
    return [int(k) for k in np.random.SeedSequence(key).generate_state(num)]

def normal(key, n):                    # like jax.random.normal: a pure function of (key, n)
    return np.random.default_rng(key).standard_normal(n)

fmt = lambda v: "[" + ", ".join(f"{a:+.3f}" for a in v) + "]"
bits = lambda m: "".join(str(int(b)) for b in m)

key = 0
a, b = normal(key, 3), normal(key, 3)
assert np.array_equal(a, b)
print(f"normal(key=0) twice : {fmt(a)} and {fmt(b)} -> identical (reproducible)")

drop1 = normal(key, 4) > 0             # BUG: the same key for two dropout layers ...
drop2 = normal(key, 4) > 0
assert np.array_equal(drop1, drop2)
print(f"reused key          : masks {bits(drop1)} and {bits(drop2)} -> the same 'random' mask")

key, k1, k2 = split(key, 3)            # FIX: split once, use each child key once
m1, m2 = normal(k1, 4) > 0, normal(k2, 4) > 0
assert not np.array_equal(normal(k1, 4), normal(k2, 4))
assert split(0, 3) == split(0, 3)      # splitting is deterministic too
print(f"split keys          : masks {bits(m1)} and {bits(m2)} -> independent")

np.random.seed(0)                      # contrast: NumPy's global generator hides its state
c1, c2 = np.random.standard_normal(3), np.random.standard_normal(3)
print(f"global RNG twice    : {fmt(c1)} and {fmt(c2)} -> differ (hidden state moved)")
```

**Output:**

```
normal(key=0) twice : [+0.126, -0.132, +0.640] and [+0.126, -0.132, +0.640] -> identical (reproducible)
reused key          : masks 1011 and 1011 -> the same 'random' mask
split keys          : masks 0111 and 1010 -> independent
global RNG twice    : [+1.764, +0.400, +0.979] and [+2.241, +1.868, -0.977] -> differ (hidden state moved)
```

### Common JAX Traps

<details>
<summary><strong>Read as text</strong> — the five traps and their fixes</summary>

| Trap | What happens | Fix |
|------|--------------|-----|
| `x[0] = 1.0` | Error: JAX arrays are immutable | `x = x.at[0].set(1.0)` returns a new array (inside `jit`, XLA usually updates in place) |
| Reusing a PRNG key | The same "random" numbers twice, e.g. identical dropout masks | `jax.random.split`, and use each key once |
| Timing without `.block_until_ready()` | You measure only the launch, because JAX runs asynchronously | Call `.block_until_ready()` on the result |
| A new input shape on every call | A new trace and compile on every call | Pad or bucket inputs to a few fixed shapes |
| A Python `if` on a value, or `print`, inside `jit` | Error, or a print that runs once at trace time | See the `jit` rules table in Transformation 1 |

</details>

---

# SECTION 3: TENSORFLOW & KERAS

---

## 3.1 The Simple Explanation

![Comparison infographic of Keras 3, JAX, PyTorch and TensorFlow as of Nov 2026: Keras 3 is one front end running on JAX, PyTorch or TensorFlow via KERAS_BACKEND; JAX is native on TPUs; PyTorch is the default for most work, with TorchTPU for TPUs; TensorFlow 2.21 (Mar 2026) is in maintenance and not supported on Ironwood (TPU7x). A pick-by-need table, common mix-ups, latest releases JAX 0.12, Flax 0.12, Keras 3.15, TensorFlow 2.21, PyTorch 2.15, and the trap that model.save with no .keras extension is an error in Keras 3.](diagrams/gml30_info_tensorflow_keras_framework_choice_ai.png)

<details>
<summary><strong>Read as text</strong> — what changed: Keras 3 went multi-backend, TensorFlow went into maintenance</summary>

**TensorFlow** (released in 2015) is Google's first big open-source ML framework — a workshop with a tool for every stage: loading data (`tf.data`), training, serving (TensorFlow Serving), production pipelines (TFX) and phones (TensorFlow Lite, now renamed **LiteRT**). **Keras** is the simple instruction manual for that workshop: stack layers, `compile`, `fit`, `predict`.

Two things changed, and interviewers like to check that you know them:

1. **Keras moved out.** Since **Keras 3** (November 2023), Keras is its own multi-backend library: the same Keras code runs on JAX, PyTorch or TensorFlow, and you pick the engine with one setting. Since TensorFlow 2.16, `tf.keras` *is* Keras 3 (the old Keras 2 lives on as the `tf_keras` package).
2. **TensorFlow is in maintenance mode.** With TensorFlow 2.21 (March 2026), Google said it will focus only on security and bug fixes, dependency updates (such as new Python versions) and critical community fixes — for TensorFlow and its libraries (tf.data, TensorFlow Serving, TFX and others) — and recommended Keras 3, JAX or PyTorch for new generative-AI work.

Think of Keras today as a cookbook that works in three kitchens: the same recipe cooks on the JAX stove, the PyTorch stove or the TensorFlow stove. TensorFlow's own kitchen still runs, but it is no longer being extended.

```
  ┌───────────────────────────────────────────────────────────┐
  │  Keras 3: model.compile() → model.fit() → model.predict() │ ← start here
  │  KerasHub: pretrained models (e.g. Gemma)                 │
  └────────────┬───────────────────┬───────────────────┬──────┘
               │  KERAS_BACKEND =  │                   │
        ┌──────┴──────┐     ┌──────┴──────┐     ┌──────┴──────┐
        │     JAX     │     │   PyTorch   │     │ TensorFlow  │
        │   (+ XLA)   │     │             │     │ maintenance │
        └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
               └───────────────────┬───────────────────┘
                                   ▼
                            CPU / GPU / TPU

  Save:   my_model.keras (full model, any backend)
  Export: TF SavedModel (TF Serving) · ONNX · LiteRT (phones)
```

</details>

---

## 3.2 Official Definition

<details>
<summary><strong>Read as text</strong> — the formal definitions of TensorFlow and Keras 3</summary>

> **TensorFlow** is an end-to-end open-source platform for machine learning,
> originally developed by the Google Brain team and released in 2015. Its
> ecosystem includes `tf.data` (input pipelines), SavedModel (a serialized
> model format), TensorFlow Serving, TFX (production ML pipelines) and LiteRT
> (the on-device runtime, formerly TensorFlow Lite).
>
> **Keras 3** is a multi-backend deep-learning API for building, training and
> exporting models, with support for JAX, TensorFlow and PyTorch (plus
> OpenVINO for inference only).

</details>

---

## 3.3 TensorFlow/Keras — Key Concepts

### Keras: Build a Model in 5 Lines

<details>
<summary><strong>Read as text</strong> — the compile, fit, predict code</summary>

```python
# Runs locally: pip install -U keras jax   (Keras 3; choose the backend BEFORE importing keras)
import os
os.environ["KERAS_BACKEND"] = "jax"                    # or "tensorflow" / "torch": nothing below changes

import numpy as np
import keras

model = keras.Sequential([
    keras.Input(shape=(784,)),                         # e.g. a 28x28 image, flattened
    keras.layers.Dense(128, activation="relu"),        # hidden layer
    keras.layers.Dense(64, activation="relu"),         # hidden layer
    keras.layers.Dense(10, activation="softmax"),      # output: 10 class probabilities
])
model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])

rng = np.random.default_rng(0)
x_train = rng.random((1000, 784), dtype=np.float32)    # stand-in data
y_train = rng.integers(0, 10, size=1000)               # integer labels 0-9
model.fit(x_train, y_train, epochs=3, batch_size=32, validation_split=0.2)
predictions = model.predict(x_train[:5])               # shape (5, 10)
```

</details>

### tf.data — Efficient Data Pipelines

<details>
<summary><strong>Read as text</strong> — shuffle, batch, prefetch</summary>

```python
# Runs locally: pip install -U tensorflow
import numpy as np
import tensorflow as tf

rng = np.random.default_rng(0)
features = rng.random((1000, 784), dtype=np.float32)
labels = rng.integers(0, 10, size=1000)

dataset = (tf.data.Dataset.from_tensor_slices((features, labels))
           .shuffle(1000)                      # buffer = dataset size -> a full shuffle every epoch
           .batch(32)                          # 32 examples per training step
           .prefetch(tf.data.AUTOTUNE))        # prepare the next batch while this one trains

for x, y in dataset.take(1):
    print(x.shape, y.shape)                    # (32, 784) (32,)
```

`prefetch` overlaps data preparation with training, so the accelerator waits less — it cannot rescue a pipeline that is slower than the model. A shuffle buffer smaller than the dataset gives only a partial shuffle. Keras 3's `fit()` accepts a `tf.data.Dataset` on any backend; the JAX-native equivalent is Grain (§2.4).

</details>

### SavedModel — Package and Deploy

<details>
<summary><strong>Read as text</strong> — save as .keras, export to SavedModel, LiteRT or ONNX</summary>

```python
# Runs locally: pip install -U keras tensorflow   (TensorFlow is Keras's default backend)
import numpy as np
import keras

model = keras.Sequential([keras.Input(shape=(4,)), keras.layers.Dense(1)])
model.compile(optimizer="adam", loss="mse")
model.fit(np.ones((32, 4)), np.zeros((32, 1)), epochs=1, verbose=0)

model.save("my_model.keras")                          # full model: architecture + weights + optimizer state
reloaded = keras.saving.load_model("my_model.keras")

model.export("my_model_savedmodel", format="tf_saved_model")   # inference-only SavedModel (TF Serving)
model.export("my_model.tflite", format="litert")                # on-device file for LiteRT (ex-TensorFlow Lite)
```

Old tutorials call `model.save("my_model")` with no extension to get a SavedModel. In Keras 3 that raises an error: save with a `.keras` extension, and use `model.export()` when a server needs a SavedModel. `export` also writes ONNX (`format="onnx"`) and, from Keras 3.15, a PyTorch program (`format="torch"`).

</details>

---

## 3.4 TensorFlow vs JAX vs PyTorch — When to Use Which

<details>
<summary><strong>Read as text</strong> — the comparison table, how Google uses each and the interview answer</summary>

| | PyTorch | JAX | TensorFlow / Keras |
|---|---------|-----|--------------------|
| **Who uses it** | The default for most research and industry work; most open models are released as PyTorch weights | Google DeepMind and other teams that train on TPUs | TensorFlow: existing production systems (TF + TFX). Keras 3: quick models on any backend |
| **Style** | Eager, object-oriented (`nn.Module`); `torch.compile` for speed | Pure functions + transformations (`jit`, `grad`, `vmap`), compiled by XLA | Keras: layers + `compile` / `fit`; TensorFlow: graphs via `tf.function` |
| **Scaling** | DDP, FSDP, DTensor | Sharding + `shard_map`, up to thousands of TPU chips | `tf.distribute` |
| **TPU support** | **TorchTPU**: a native PyTorch backend for TPUs from Google and Meta (announced 2026; the older route was PyTorch/XLA) | Native — the best-supported | TPU v6e (Trillium) and earlier; not supported on Ironwood (TPU7x) |
| **Learning curve** | Low–medium | Medium–high | Low (Keras) |
| **Known for** | Llama, Stable Diffusion; OpenAI standardised on PyTorch in 2020 | Gemini, Gemma, AlphaFold, PaLM | Google's earlier production ML (TFX pipelines); BERT's original code |

**Inside Google specifically:**
- **New large-model work is JAX.** Gemini and Gemma are trained with JAX on Pathways; MaxText is the open reference for LLM training on TPUs.
- **TensorFlow lives on in older production systems.** It stays stable (security and bug fixes), but gets no new features; TFX and TensorFlow Serving are in the same maintenance mode.
- **Serving changed.** On Google Cloud, LLMs on TPUs are served with vLLM or SGLang (with JAX or TorchTPU backends) rather than by converting them to TensorFlow; `orbax-export` can still write a SavedModel when a TensorFlow Serving system needs one.
- **"TPU means JAX" is no longer strictly true.** TorchTPU runs existing PyTorch code on TPUs after a `.to("tpu")` change (peak speed still needs TPU-friendly shapes and sharding), so a PyTorch team no longer has to rewrite its model to use TPUs.

**Interview answer — which framework?** New model on TPUs → JAX + Flax NNX + Optax (MaxText for LLMs). Team already on PyTorch → stay on PyTorch, with TorchTPU if you need TPUs. A quick model, or a library that must run on several backends → Keras 3. TensorFlow → maintain existing systems, but don't start new generative-AI work on it (Google's own advice).

</details>

### Status snapshot (verified 6 Nov 2026)

<details>
<summary><strong>Read as text</strong> — the latest releases and their status</summary>

| Library | Latest stable release | Status |
|---------|-----------------------|--------|
| JAX | 0.12.0.1 (Oct 2026) | Active; `pmap` in maintenance mode, use sharding / `shard_map` |
| Flax | 0.12.12 (Oct 2026) | Active; NNX is the main API, Linen still supported |
| Optax / Orbax checkpoint | 0.2.8 / 0.12.9 | Active; Orbax has a new `v1` checkpoint API |
| Keras | 3.15.1 (Jul 2026) | Active; backends JAX, TensorFlow, PyTorch (+ OpenVINO for inference) |
| TensorFlow | 2.21.0 (Mar 2026); 2.22 at release candidate | Maintenance: security / bug fixes and dependency updates only |
| PyTorch | 2.15.0 (Oct 2026) | Active; TorchTPU backend for TPUs in active development |

</details>

---

# SECTION 4: VERTEX AI — GOOGLE'S ML PLATFORM

---

> **Name change (22 April 2026).** Google relaunched Vertex AI as **Gemini Enterprise Agent Platform** ("Agent Platform" for short), "the evolution of Vertex AI". Every service in this section was renamed, but the classic ML code did not change: the Python SDK is still `google-cloud-aiplatform` (`from google.cloud import aiplatform`) and the API host is still `aiplatform.googleapis.com`. This section keeps the Vertex AI name in its headings because most existing code, blog posts and many interviewers still use it. The platform's agent tools (ADK, Agent Runtime, Agent Studio) are in [Ch 19 §19.12](#content/19_ai_frameworks).

| Old name (until April 2026) | New name (as of Nov 2026) |
|---|---|
| Vertex AI Pipelines | Gemini Enterprise Agent Platform Pipelines |
| Vertex AI Feature Store | Feature Store on Gemini Enterprise Agent Platform |
| Vertex AI Endpoints / Online Inference | Gemini Enterprise Agent Platform Endpoints / Online Inference |
| Vertex AI Model Registry | Model Registry on Gemini Enterprise Agent Platform |
| Vertex AI Model Monitoring | Model Monitoring on Gemini Enterprise Agent Platform |
| Vertex AI Training / Serverless Training | Gemini Enterprise Agent Platform Managed Training / Serverless Training |

## 4.1 The Simple Explanation

![Map infographic of Google Cloud's ML platform, Vertex AI renamed Gemini Enterprise Agent Platform on 22 Apr 2026: DATA (Managed Datasets, Feature Store) flows to BUILD (AutoML or Custom Training, Pipelines with KFP or TFX) and DEPLOY (Model Registry with versions and aliases, then Endpoints online or Batch Inference), with a MONITOR bar for Model Monitoring (skew + drift) and Cloud Logging. A restaurant-kitchen grid maps each service to an analogy, notes the code is unchanged (google-cloud-aiplatform, aiplatform.googleapis.com), and a pick-by-question table chooses the service.](diagrams/gml30_info_agent_platform_ml_map_ai.png)

### The Restaurant Kitchen Analogy

<details>
<summary><strong>Read as text</strong> — the restaurant analogy and the platform map</summary>

Building ML models is like cooking a meal. But in a big company, you're not just cooking one meal — you're running a whole restaurant. You need:

1. **Fresh ingredients** organized and ready (Feature Store)
2. **Recipes** that run the same way every time (Pipelines)
3. **A serving window** where waiters pick up finished plates (Endpoints)
4. **Quality checks** to make sure the food tastes right (Model Monitoring)
5. **A menu board** tracking all your dishes (Model Registry)

**Vertex AI** (now **Gemini Enterprise Agent Platform**) is Google Cloud's restaurant management system for ML. It handles everything from organizing your data to serving predictions to millions of users.

```
  ┌────────────────────────────────────────────────────────────┐
  │   GEMINI ENTERPRISE AGENT PLATFORM (formerly Vertex AI)    │
  │                  the classic ML services                   │
  │                                                            │
  │   DATA              BUILD               DEPLOY             │
  │   ────              ─────               ──────             │
  │   Managed     →     AutoML or     →     Model Registry     │
  │   Datasets          Custom              (versions +        │
  │                     Training             aliases)          │
  │                                             ↓              │
  │   Feature     →     Pipelines     →     Endpoints          │
  │   Store             (KFP or TFX)        (online) or        │
  │                                         Batch Inference    │
  │                                                            │
  │   ──────────────────────────────────────────────────────   │
  │   MONITOR: Model Monitoring (skew + drift), Cloud Logging  │
  └────────────────────────────────────────────────────────────┘
```

</details>

---

## 4.2 Official Definition

<details>
<summary><strong>Read as text</strong> — the formal definition</summary>

> **Gemini Enterprise Agent Platform** (called **Vertex AI** until April 2026)
> is Google Cloud's unified platform for building, deploying and governing
> machine learning models and AI agents. For classic ML it covers the whole
> lifecycle — data preparation and feature management, training and
> evaluation, deployment and serving, and monitoring in production.

</details>

---

## 4.3 Vertex AI — Core Concepts Deep Dive

![Infographic on Pipelines and Feature Store on Google Cloud: a pipeline DAG Ingest, Transform, Train, Evaluate with an accuracy > 0.95 gate that deploys to an endpoint or skips and alerts the team; a BigQuery offline store table for user u1 (clicks_7d 3, 5, 12) feeding point-in-time training reads and a scheduled sync to a Bigtable online store for millisecond lookups by entity_id. Three runs: epochs 5 gives 0.95 and the deploy is skipped, epochs 10 reruns only train, evaluate, deploy for 0.98, run 3 is fully cached. Point-in-time join gives 3 and 5 where a naive join leaks 12 into 3 of 4 rows.](diagrams/gml30_info_pipelines_feature_store_ai.png)

<details>
<summary><strong>Read as text</strong> — the five services and where the ideas are taught</summary>

Five services carry most interview questions. The general ideas behind them — training-serving skew, model versioning, canary rollouts, drift — are taught in [Ch 26](#content/26_ml_system_design) and [Ch 27 §18.5–§18.10](#content/27_practical_ml); this section shows how Google's platform implements them.

</details>

### Concept 1: Pipelines

<details>
<summary><strong>Read as text</strong> — what a pipeline is, the gated DAG, why it matters and the KFP code</summary>

**The 10-year-old version:**

A pipeline is like a set of dominoes. You set them up once, and then you knock over the first one — all the rest fall automatically in order. In ML, the dominoes are steps like "load data → clean data → train model → test model → deploy model."

**The technical version:**

A pipeline is a directed acyclic graph (DAG) of containerized steps. You write it in Python with the **Kubeflow Pipelines (KFP)** SDK or **TFX** (TensorFlow Extended), compile it to a YAML file, and the platform runs it serverlessly — there is no cluster to manage. Each step runs in its own container and hands its outputs to the next step: *artifacts* (a dataset, a model) and *parameters* (a number such as accuracy).

> **Maths in one line:** `steps that run = steps whose code or inputs changed + every step downstream of them` — all other steps are served from the execution cache.

```
  ML Pipeline Example
  ───────────────────

  ┌──────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐
  │  Ingest  │───►│ Transform │───►│   Train   │───►│ Evaluate │
  │  Data    │    │   Data    │    │   Model   │    │  Model   │
  └──────────┘    └───────────┘    └───────────┘    └────┬─────┘
                                                         │
                                                accuracy > 0.95?
                                                  │           │
                                                 YES          NO
                                                  │           │
                                            ┌─────┴────┐ ┌────┴────────┐
                                            │  Deploy  │ │ Skip deploy │
                                            │    to    │ │  and alert  │
                                            │ Endpoint │ │  the team   │
                                            └──────────┘ └─────────────┘

  Each box is a separate container.
  The pipeline can be scheduled to run daily or weekly.
  If the model isn't good enough, it doesn't get deployed.
```

**Why pipelines matter:**

| Benefit | What it means on the platform |
|---|---|
| **Reproducibility** | Same compiled YAML + same inputs → same steps; every run's inputs, outputs and parameters are recorded as lineage |
| **Automation** | A schedule (cron) re-runs the pipeline to retrain on new data without a human |
| **Cheaper re-runs** | Execution caching skips any step whose inputs have not changed |
| **Collaboration** | Each step is a separate component, so team members build and reuse steps independently; Google Cloud Pipeline Components give prebuilt steps (AutoML training, model upload, deploy) |

The pipeline from the diagram, in KFP code (training and evaluation are stubbed so the shape stays visible):

```python
# Runs locally: pip install kfp google-cloud-aiplatform; needs a Google Cloud project and bucket
from kfp import compiler, dsl
from google.cloud import aiplatform

@dsl.component(base_image="python:3.11")
def train(epochs: int, model: dsl.Output[dsl.Model]):
    with open(model.path, "w") as f:                 # real step: fit and save a model
        f.write(f"weights after {epochs} epochs")

@dsl.component(base_image="python:3.11")
def evaluate(model: dsl.Input[dsl.Model]) -> float:
    return 0.96                                      # real step: score on held-out data

@dsl.component(base_image="python:3.11")
def deploy(model: dsl.Input[dsl.Model]):
    print(f"deploying {model.uri}")                  # real step: ModelUploadOp + ModelDeployOp

@dsl.pipeline(name="train-eval-deploy")
def training_pipeline(epochs: int = 10):
    train_task = train(epochs=epochs)
    eval_task = evaluate(model=train_task.outputs["model"])
    with dsl.If(eval_task.output > 0.95, name="accuracy-gate"):   # dsl.Condition is deprecated
        deploy(model=train_task.outputs["model"])

compiler.Compiler().compile(training_pipeline, "pipeline.yaml")
aiplatform.init(project="my-project", location="us-central1")
aiplatform.PipelineJob(display_name="train-eval-deploy", template_path="pipeline.yaml",
                       pipeline_root="gs://my-bucket/pipeline-root",
                       parameter_values={"epochs": 10}).submit()
```

Old tutorials write `from kfp.v2 import dsl` — that was a preview namespace in KFP 1.x; with KFP 2 import from `kfp` directly.

</details>

**What a run actually does — DAG order, caching and the gate (a plain-Python toy you can run):**

```python
# A toy pipeline: steps run in DAG order, unchanged steps come from the cache, deploy is gated
from graphlib import TopologicalSorter

parents = {"ingest": [], "transform": ["ingest"], "train": ["transform"],
           "evaluate": ["train"], "deploy": ["train", "evaluate"]}
uses = {"ingest": ["date"], "train": ["epochs"]}   # which run parameters each step reads
cache = {}

def execute(name, inputs, params):
    if name == "ingest":    return f"rows@{params['date']}"
    if name == "transform": return f"clean({inputs[0]})"
    if name == "train":     return f"model(epochs={params['epochs']})"
    if name == "evaluate":  return round(0.90 + 0.01 * min(params["epochs"], 8), 2)  # toy accuracy
    if name == "deploy":    return "done"

def run(params):
    out, ran, hit = {}, [], []
    for name in TopologicalSorter(parents).static_order():
        if name == "deploy" and not out["evaluate"] > 0.95:     # the dsl.If gate
            out[name] = "skipped by the gate"
            continue
        inputs = [out[p] for p in parents[name]]
        key = (name, tuple(inputs), tuple(params[k] for k in uses.get(name, [])))
        if key in cache:
            hit.append(name)
        else:
            cache[key] = execute(name, inputs, params)
            ran.append(name)
        out[name] = cache[key]
    return out, ran, hit

for i, params in enumerate([{"date": "11-01", "epochs": 5},
                            {"date": "11-01", "epochs": 10},
                            {"date": "11-01", "epochs": 10}], start=1):
    out, ran, hit = run(params)
    print(f"run {i} (epochs={params['epochs']:>2}): accuracy {out['evaluate']:.2f} -> deploy {out['deploy']}")
    print(f"   ran:    {', '.join(ran) or '-'}")
    print(f"   cached: {', '.join(hit) or '-'}")
    if i == 1: assert out["deploy"] == "skipped by the gate" and len(ran) == 4
    if i == 2: assert ran == ["train", "evaluate", "deploy"]
    if i == 3: assert ran == []
```

**Output:**

```
run 1 (epochs= 5): accuracy 0.95 -> deploy skipped by the gate
   ran:    ingest, transform, train, evaluate
   cached: -
run 2 (epochs=10): accuracy 0.98 -> deploy done
   ran:    train, evaluate, deploy
   cached: ingest, transform
run 3 (epochs=10): accuracy 0.98 -> deploy done
   ran:    -
   cached: ingest, transform, train, evaluate, deploy
```

<details>
<summary><strong>Read as text</strong> — continued: what each run shows</summary>

Run 1 trains but the gate blocks the deploy (0.95 is not > 0.95). Run 2 changes only `epochs`, so ingest and transform come from the cache and only train → evaluate → deploy run. Run 3 changes nothing, so nothing runs.

</details>

---

### Concept 2: Feature Store

<details>
<summary><strong>Read as text</strong> — what a feature store is, Google's BigQuery design, the skew problem</summary>

**The 10-year-old version:**

Imagine you have a giant organized toy box where every toy has a label, and you always know exactly where to find it. A Feature Store is like that — but for data facts about your users, products, or whatever your ML model needs.

Without a Feature Store, every team computes the same facts (like "how many times did this user click last week?") independently. With a Feature Store, you compute it ONCE and everyone shares it.

**The technical version:**

A feature store is a central place to define, store and serve ML features, so that training and serving read the same values. It gives you three things:

- **Consistent features** between training and serving (no training-serving skew — the idea is taught in [Ch 26](#content/26_ml_system_design))
- **Point-in-time correctness** — each training example gets the feature value *as it was at that example's time*, never a later one
- **Low-latency online serving** — a key-value lookup by entity ID in milliseconds at prediction time

Google's current Feature Store (redesigned in 2023) is a thin layer over **BigQuery** rather than a separate database:

| Piece | What it is |
|---|---|
| **Offline store** | Your own BigQuery tables or views — one row per entity and timestamp, one column per feature. Nothing is copied |
| **Feature Registry** (optional) | A *feature group* points at one BigQuery source; each *feature* is one of its columns |
| **Online store** | A *feature online store* (Bigtable online serving) holding *feature views* that are synced from BigQuery on a schedule |

The older design, now called **Feature Store (Legacy)**, kept its own copy of the data in *featurestores* and *entity types*; it was deprecated in February 2026 and shuts down on 17 February 2027. The current design's second online option, *Optimized online serving*, is deprecated too and shuts down the same day — use Bigtable online serving, and keep embeddings in Vector Search.

> **Maths in one line:** `feature value for a training row (entity, t) = the latest value with feature_timestamp ≤ t` — anything newer leaks the future into training.

```
  Feature Store (current, BigQuery-based)
  ───────────────────────────────────────

  BigQuery table user_features  ← the OFFLINE store (full history)
  ┌───────────┬───────────┬───────────┬───────────────────┐
  │ entity_id │ clicks_7d │ avg_spend │ feature_timestamp │
  ├───────────┼───────────┼───────────┼───────────────────┤
  │ u1        │     3     │   41.0    │ 2026-11-01 09:00  │
  │ u1        │     5     │   44.5    │ 2026-11-02 09:00  │
  │ u1        │    12     │   47.0    │ 2026-11-03 09:00  │
  └───────────┴───────────┴───────────┴───────────────────┘
        │                                  │
        │ TRAINING: point-in-time read     │ scheduled sync
        │ (ML.ENTITY_FEATURES_AT_TIME      │ (latest value per entity)
        │  in BigQuery, or your own SQL)   │
        ▼                                  ▼
  training rows, each with          ONLINE store (Bigtable serving)
  the value known at its time       feature view "user_view"
                                           │ lookup by entity_id (ms)
                                           ▼
                                    model at prediction time
```

**The training-serving skew problem (what Feature Store prevents):**

```
  WITHOUT Feature Store:
  ──────────────────────
  Training code:   avg_spend = total_spend / num_orders
  Serving code:    avg_spend = total_spend / (num_orders + 1)   ← subtle bug!

  Model trained on one definition, serves with another.
  Predictions are silently wrong. 😱

  WITH Feature Store:
  ──────────────────────
  Training code:   feature_store.read('user', 'avg_spend')
  Serving code:    feature_store.read('user', 'avg_spend')

  Same definition, same computation — this kind of skew is gone. ✓
  (Stale or missing values can still cause skew, so you still
   monitor the inputs — Concept 5.)
```

</details>

**Point-in-time correctness in code — a naive join versus a point-in-time join:**

```python
# Point-in-time join: each training row sees the feature value as it was at that moment
import pandas as pd

features = pd.DataFrame({            # feature history: one row per refresh
    "user": ["u1", "u1", "u1", "u2", "u2"],
    "feature_ts": pd.to_datetime(["2026-11-01 09:00", "2026-11-02 09:00", "2026-11-03 09:00",
                                  "2026-11-01 09:00", "2026-11-03 09:00"]),
    "clicks_7d": [3, 5, 12, 1, 9],
})
labels = pd.DataFrame({              # training examples: what happened, and when
    "user": ["u1", "u1", "u2", "u2"],
    "event_ts": pd.to_datetime(["2026-11-01 12:00", "2026-11-02 18:00",
                                "2026-11-02 08:00", "2026-11-03 10:00"]),
    "bought": [0, 1, 0, 1],
})

# Naive: join today's latest value per user
latest = features.sort_values("feature_ts").groupby("user").tail(1)
naive = labels.merge(latest[["user", "clicks_7d"]], on="user")

# Point-in-time: the latest value with feature_ts <= event_ts, per user
pit = pd.merge_asof(labels.sort_values("event_ts"), features.sort_values("feature_ts"),
                    left_on="event_ts", right_on="feature_ts", by="user", direction="backward")
naive = naive.sort_values(["user", "event_ts"]).reset_index(drop=True)
pit = pit.sort_values(["user", "event_ts"]).reset_index(drop=True)

print("user  event        bought  naive  point-in-time (value from)")
for n, p in zip(naive.itertuples(), pit.itertuples()):
    print(f"{p.user}    {p.event_ts:%m-%d %H:%M}  {int(p.bought):>6}  {int(n.clicks_7d):>5}"
          f"  {int(p.clicks_7d):>13} ({p.feature_ts:%m-%d %H:%M})")

assert (pit["feature_ts"] <= pit["event_ts"]).all()   # never a value from the future
leaks = int((naive["clicks_7d"] != pit["clicks_7d"]).sum())
print(f"rows where the naive join leaked a future value: {leaks} of {len(pit)}")
assert leaks == 3
```

**Output:**

```
user  event        bought  naive  point-in-time (value from)
u1    11-01 12:00       0     12              3 (11-01 09:00)
u1    11-02 18:00       1     12              5 (11-02 09:00)
u2    11-02 08:00       0      9              1 (11-01 09:00)
u2    11-03 10:00       1      9              9 (11-03 09:00)
rows where the naive join leaked a future value: 3 of 4
```

<details>
<summary><strong>Read as text</strong> — continued: why the naive join leaks</summary>

The naive join gives both u1 rows the value 12, which was computed on 3 November — *after* both events, so it can include behaviour that followed the purchase. A model trained on it looks great offline and fails live. `merge_asof` with `direction="backward"` is the pandas version of the lookup the Maths line describes.

</details>

---

### Concept 3: Endpoints

![Infographic on shipping and watching a model on Google Cloud: a Model Registry with versions v1 (AUC 0.952), v2 default and champion (0.963) and v3 challenger (0.971) deploys to one endpoint URL that splits traffic 90% to v2 (3 replicas, min 2, max 8) and 10% to the v3 canary (1 replica), whose live inputs feed Model Monitoring for skew versus training data and drift versus earlier production, with a promote arrow back to the registry. Maths: 1,000 req/s x 10% = 100 req/s = 60,000 requests in 10 minutes. Skew checks against the 0.3 default: desktop campaign L-inf 0.35 and age +25 years JS 0.52 alert, age +5 years JS 0.04 does not.](diagrams/gml30_info_serve_registry_monitoring_ai.png)

<details>
<summary><strong>Read as text</strong> — what an endpoint is, the traffic split and what to watch out for</summary>

**The 10-year-old version:**

An endpoint is like a drive-through window. You pull up, say your order (send data), and get your food (prediction) back. You don't need to know what's happening in the kitchen — you just talk to the window.

**The technical version:**

An endpoint (part of the service now called **Online Inference**) is one stable URL that serves real-time predictions over REST, or gRPC on dedicated endpoints. You deploy one or more models to it. Each **deployed model** gets its own replicas — a machine type plus a minimum and maximum count — and the endpoint's **traffic split** decides what share of requests each deployed model receives.

> **Maths in one line:** `requests to a version = total requests × its traffic share` — at 1,000 requests per second, a 10% canary gets 100 per second, so 10 minutes gives it 60,000 requests to judge.

```
  Endpoint Architecture
  ─────────────────────

  Client request                         Endpoint (one URL)
  ──────────────                         ──────────────────

  POST .../endpoints/ENDPOINT_ID:predict ┌────────────────────────────┐
  {"instances": [                        │ traffic split: v2 90%,     │
    {"age": 25, "clicks": 12,      ────► │                v3 10%      │
     "device": "mobile"}]}               └─────┬────────────────┬─────┘
                                               │ 90%            │ 10%
                                               ▼                ▼
  Response                             ┌────────────────┐ ┌────────────────┐
  {"predictions": [                    │ deployed model │ │ deployed model │
     {"will_purchase": 0.87}],   ◄──── │ v2 (champion)  │ │ v3 (canary)    │
   "deployedModelId": "..."}           │ 3 replicas     │ │ 1 replica      │
                                       │ (min 2, max 8) │ │ (min 1, max 2) │
                                       └────────────────┘ └────────────────┘
```

| Feature | What it does | Watch out |
|---|---|---|
| **Autoscaling** | Adds replicas when load rises (default target: 60% CPU — on GPU machines, 60% of CPU or GPU, whichever is higher) and removes them when it falls | Never goes below `min_replica_count`, which must be at least 1 — you pay for idle minimum replicas (scale-to-zero is only in Preview) |
| **Traffic split** | Percentages per deployed model, summing to 100 | Shift a canary up step by step; the rollout playbook is in [Ch 27 §18.10](#content/27_practical_ml) |
| **A/B testing** | Run two versions side by side on live traffic | The split only routes requests — measuring the business metric and deciding is your job ([Ch 26](#content/26_ml_system_design)) |
| **Endpoint type** | Dedicated public (recommended), shared public, or private through Private Service Connect | A shared public endpoint caps a request at 60 seconds and 1.5 MB |
| **Logging** | Request-response logging to a BigQuery table | Model Monitoring v1 (Concept 5) logs to the same backend table, so once monitoring is on you cannot turn on or change request-response logging |

</details>

---

### Concept 4: Model Registry

<details>
<summary><strong>Read as text</strong> — versions, aliases, labels and how to promote</summary>

The Model Registry is a version-controlled catalog of all your trained models. Think of it like a library card catalog — every model is recorded with its versions, metrics, lineage and deployment status. (The general practice is in [Ch 27 §18.5](#content/27_practical_ml).) On Google's platform:

- Each **model** has numbered **versions** (1, 2, 3, …).
- An **alias** is a movable name tag on one version, like a Git branch or a Docker tag. The first version automatically gets `default`, which is used when no version is named; you add your own, such as `champion` or `challenger`. Each alias points at exactly one version, and aliases cannot be numbers.
- **Labels** (`team=ads`) organize models so you can filter and find them.
- From a version you can deploy to an endpoint, run batch inference, or start an evaluation; BigQuery ML models can be registered without exporting them.

```
  Model Registry
  ──────────────

  ┌────────────────────────────────────────────────────────────────┐
  │  Model: "click-prediction"         Labels: team=ads, use=ctr   │
  │  ───────────────────────────────────────────────────────────── │
  │  Version  Aliases             Created     AUC    Status        │
  │  1        —                   2026-01-12  0.952  not deployed  │
  │  2        default, champion   2026-02-20  0.963  endpoint 90%  │
  │  3        challenger          2026-03-15  0.971  endpoint 10%  │
  │  ───────────────────────────────────────────────────────────── │
  │  v3 lineage: pipeline run #847, gs://my-bucket/data/2026-03/   │
  └────────────────────────────────────────────────────────────────┘

  Promote v3:  move "champion" (and "default") to version 3,
               then shift the endpoint traffic split to 100% v3.
```

</details>

---

### Concept 5: Model Monitoring

<details>
<summary><strong>Read as text</strong> — skew versus drift, the two scores and the 0.3 threshold</summary>

**The 10-year-old version:**

A health inspector keeps a photo of what the ingredients looked like on opening day. Every week she compares today's delivery with the photo. If the tomatoes suddenly look very different, she rings the alarm — the recipe may no longer work.

**The technical version:**

Model Monitoring compares the distribution of each feature the model receives in production with a baseline, and alerts when the gap is too big. The ideas (data drift, concept drift, PSI) are taught in [Ch 27 §18.8](#content/27_practical_ml); Google's version works like this:

| Check | Compared with | Score used |
|---|---|---|
| **Skew** | The training data | Categorical feature → **L-infinity distance** (the largest change in any one category's share); numerical feature → **Jensen-Shannon divergence** over equal-width buckets |
| **Drift** | Production data from an earlier window | The same two scores |

An alert fires when a feature's score goes above its threshold — **0.3 by default**, settable per feature. You can sample only a fraction of requests and choose how often a job runs. **Model Monitoring v1** (generally available) is set up on an endpoint; **v2** (in Preview as of Nov 2026) attaches to a model version, also watches models served outside Google Cloud, and can check output drift and feature attributions too.

> **Maths in one line:** `L∞ = max over categories |p − q|` and `JS = ½·KL(p‖m) + ½·KL(q‖m)` with `m = (p + q) / 2`, where p = baseline shares and q = latest shares — alert when the score is above 0.3.

</details>

```python
# How Model Monitoring scores skew: L-infinity for categories, Jensen-Shannon for numbers
import numpy as np

def l_inf(p, q):                       # the biggest change in any one category's share
    return float(np.max(np.abs(p - q)))

def js_divergence(p, q):               # log base 2 here, so the score lies between 0 and 1
    m = (p + q) / 2
    kl = lambda a, b: np.sum(a[a > 0] * np.log2(a[a > 0] / b[a > 0]))
    return float(0.5 * kl(p, m) + 0.5 * kl(q, m))

THRESHOLD = 0.3                         # the default alert threshold
rng = np.random.default_rng(0)
bins = [0, 30, 45, 60, 200]             # age buckets: under 30, 30-44, 45-59, 60+

def age_shares(mean, sd):
    return np.histogram(rng.normal(mean, sd, 10_000), bins)[0] / 10_000

train_device = np.array([0.60, 0.30, 0.10])        # mobile, desktop, tablet
train_age = age_shares(35, 10)
checks = [
    ("device: same mix",         l_inf, train_device, np.array([0.57, 0.32, 0.11])),
    ("device: desktop campaign", l_inf, train_device, np.array([0.25, 0.65, 0.10])),
    ("age: same population",     js_divergence, train_age, age_shares(35, 10)),
    ("age: 5 years older",       js_divergence, train_age, age_shares(40, 10)),
    ("age: 25 years older",      js_divergence, train_age, age_shares(60, 12)),
]
print(f"{'feature':25} {'metric':13} {'score':>5}  verdict (> {THRESHOLD})")
scores = []
for name, metric, baseline, latest in checks:
    score = metric(baseline, latest)
    scores.append(score)
    print(f"{name:25} {metric.__name__:13} {score:5.2f}  {'ALERT' if score > THRESHOLD else 'ok'}")
print(f"age shares at training: {np.round(train_age, 2).tolist()}")
print(f"age shares 25y older:   {np.round(checks[-1][3], 2).tolist()}")
assert abs(scores[1] - 0.35) < 1e-9 and scores[0] < THRESHOLD < scores[4]
```

**Output:**

```
feature                   metric        score  verdict (> 0.3)
device: same mix          l_inf          0.03  ok
device: desktop campaign  l_inf          0.35  ALERT
age: same population      js_divergence  0.00  ok
age: 5 years older        js_divergence  0.04  ok
age: 25 years older       js_divergence  0.52  ALERT
age shares at training: [0.31, 0.53, 0.16, 0.01]
age shares 25y older:   [0.01, 0.1, 0.39, 0.5]
```

<details>
<summary><strong>Read as text</strong> — continued: what the alerts mean</summary>

The desktop campaign moved mobile's share from 60% to 25% — a 0.35 jump in one category — so it alerts. Users five years older score only 0.04: the default threshold catches big shifts, so lower it for the features your model is most sensitive to.

</details>

---

## 4.4 Vertex AI — Complete Platform Overview

<details>
<summary><strong>Read as text</strong> — every component, the retired services and the whole loop in one breath</summary>

| Component (status as of Nov 2026) | What It Does | Analogy |
|-----------|-------------|---------|
| **Managed datasets** | Hold image, tabular, text or video training data; split it into train, validation and test sets | Your ingredient pantry |
| **Feature Store** | BigQuery as the offline store, Bigtable online serving for fast lookups | Organized spice rack |
| **AutoML** | Train tabular and image models with no code (AutoML for text and video was retired in 2025 — prompt or tune Gemini instead) | Instant ramen (easy!) |
| **Custom training** (now Managed Training / Serverless Training) | Run your own training code in a container on managed CPUs, GPUs or TPUs, with distributed training and hyperparameter tuning | Full recipe from scratch |
| **Pipelines** | Orchestrate multi-step ML workflows (KFP or TFX), on a schedule, with caching | Assembly line |
| **Model Registry** | Version models, tag versions with aliases, deploy from here | Library catalog |
| **Endpoints** (Online Inference) | Serve real-time predictions with autoscaling and traffic splits | Drive-through window |
| **Batch Inference** | Predict over a BigQuery table or Cloud Storage files offline — no endpoint needed | Catering (bulk orders) |
| **Model Monitoring** | Detect skew and drift in production inputs and outputs | Health inspector |
| **Vector Search** | Approximate nearest-neighbour search over embeddings ([Ch 26](#content/26_ml_system_design), [Ch 28](#content/28_semantic_search)) | Finding the most similar dish fast |
| **Model Garden** | 200+ ready models — Gemini, Gemma and third-party ones such as Claude ([Ch 19 §19.12](#content/19_ai_frameworks)) | The supplier catalogue |

Two services from older Vertex AI material are gone or going:

| Retired service | Status | Use instead |
|---|---|---|
| **Data Labeling Service** (Google-managed human labelers) | Shut down 3 October 2024 | Label in the console yourself, or hire a labeling partner from Google Cloud Marketplace |
| **Explainable AI** (feature attributions) | Deprecated 16 March 2026; shuts down 16 March 2027 | Open-source SHAP or LIME |

**The whole loop in one breath** (a common interview ask — "how would you run this model in production on Google Cloud?"):

1. A **pipeline** reads point-in-time features from **Feature Store**, trains, evaluates, and stops if the model misses the bar.
2. A passing model becomes a new version in **Model Registry**, tagged `challenger`.
3. It is deployed to the **endpoint** with a 10% traffic split next to the `champion`.
4. **Model Monitoring** watches skew and drift; the team compares business metrics between the two versions.
5. If the challenger wins, move the aliases and shift traffic to 100%; an alert or a schedule triggers the pipeline again.

</details>

---

# SECTION 5: KEY GOOGLE RESEARCH PAPERS

---

## 5.1 Why These Papers Matter

![Infographic timeline of eight landmark Google and DeepMind ML papers, each with its year, one idea and one number: Wide & Deep 2016 (memorize plus generalize, +3.9% Google Play installs), YouTube DNN 2016 (millions to hundreds to dozens, rank by watch time not clicks), Transformer 2017 (softmax(QK^T / sqrt(d_k)) V, 28.4 BLEU English to German), BERT 2018 (mask 15%, read both sides, 110M / 340M parameters), T5 2019 (text in, text out, C4 about 750 GB, up to 11B), PaLM 2022 (540B on 6,144 TPU v4 chips, 46.2% MFU), Chinchilla 2022 from DeepMind (about 20 tokens per parameter, 70B beat 280B Gopher) and Gemini 2023 (natively multimodal, 1.5 Pro with a 1M-token context in 2024). An Also Know strip lists word2vec 2013 to Gemma 2024, a Pick by Topic table maps interview topics to papers, and a note warns that the 2020 Scaling Laws paper (Kaplan et al.) is OpenAI's, with Chinchilla as DeepMind's correction.](diagrams/gml30_info_google_papers_timeline_ai.png)

<details>
<summary><strong>Read as text</strong> — why these papers matter and the four things to know about each</summary>

Google has published many of the most influential papers in modern ML — from **Google Brain**, **Google Research** and **DeepMind**, which merged into **Google DeepMind** in 2023. The papers explain why the tools in this chapter look the way they do: a Transformer is mostly big matrix multiplies, which is exactly what a TPU's systolic array is built for (§1.3), and PaLM needed one program to drive two TPU pods, which is the sharding story behind JAX (§2).

This section is the **home for Google's papers**. Each paper gets a plain-language version, the formal summary, one key number and what it changed; the ideas themselves are taught in depth in other chapters, which are linked. In an interview, be ready to say four things about each paper: **the problem, the one idea, one number, and what it changed.**

</details>

```
  Timeline of key Google & DeepMind papers            (★ = explained below)
  ────────────────────────────────────────

  2013     word2vec — words become vectors
  2014     Sequence to Sequence — one network reads, another writes
  2015     Distillation · Hidden Technical Debt in ML Systems
  2016  ★  Wide & Deep (Google Play) · ★ YouTube DNN (two-stage recommender)
  2017  ★  Attention Is All You Need — the Transformer · Sparsely-gated MoE
  2018  ★  BERT — bidirectional pre-training
  2019  ★  T5 — every task is text-to-text · Multi-query attention
  2020     ViT — an image as 16×16 patches
  2021     Switch Transformer — one expert per token · AlphaFold 2
  2022  ★  PaLM — 540B on 6,144 TPU v4 · ★ Chinchilla — ~20 tokens per parameter
           Chain-of-thought prompting · Speculative decoding
  2023  ★  Gemini 1.0 — natively multimodal · PaLM 2
  2024     Gemini 1.5 — 1M-token context · Gemma — open weights

  Not Google: the 2020 "Scaling Laws" paper (Kaplan et al.) is OpenAI's.
  Chinchilla (Paper 7) is DeepMind's correction of it.
```

For landmark LLM papers from every lab, see [Ch 17 §16.1](#content/17_llm).

---

### Paper 1: "Attention Is All You Need" (2017)

<details>
<summary><strong>Read as text</strong> — the idea, the attention formula, key numbers and impact</summary>

**The 10-year-old version:**

Before this paper, AI read sentences like you read a book on a bumpy bus — one word at a time, trying to remember the beginning by the time you reach the end. The **Transformer** lets every word look at every other word directly, in one step, and decide which ones matter — even if they are far apart.

```
  Old way (RNN — one word at a time):
  ───────────────────────────────────

   The → cat → that → I → saw → yesterday → at → the → park → was → fluffy

   What the RNN knows about "cat" must survive 9 hand-offs to reach
   "fluffy" — like a message whispered down a line of children.

  New way (Transformer — every word looks at every word, in one step):
  ────────────────────────────────────────────────────────────────────

   "fluffy" asks: which words describe me?

     cat         ████████████   strong
     park        ███            weak
     yesterday   █              tiny
     the, was …  ▏              almost zero

   "fluffy" reaches "cat" directly, however far apart they are.
```

> **Maths in one line:** `Attention(Q, K, V) = softmax(QKᵀ / √d_k) · V` — score each word's query against every word's key, turn the scores into weights that add up to 1, and take the weighted average of the values; dividing by √d_k keeps the scores from saturating the softmax.

**Official definition:**

> The paper (Vaswani et al., Google Brain and Google Research; NeurIPS 2017)
> introduced the **Transformer architecture**, which replaces recurrent and
> convolutional layers with **self-attention**. Self-attention computes a
> weighted relationship between every pair of positions in a sequence,
> enabling parallel training and capturing long-range dependencies. The
> Transformer uses multi-head attention, positional encodings, and an
> encoder-decoder structure.

**Key numbers:** new records of 28.4 BLEU (English→German) and 41.8 BLEU (English→French) translation scores, after 3.5 days of training on 8 GPUs.

**The trade-off:** n tokens give n × n attention scores, so doubling the context quadruples the attention work — the root of every long-context trick.

**Impact:** Almost every modern LLM (GPT, Claude, Gemini, Llama) descends from this architecture; most keep only the decoder half. Taught step by step in [Ch 17 §2.4](#content/17_llm).

</details>

---

### Paper 2: "BERT" — Bidirectional Encoder Representations from Transformers (2018)

<details>
<summary><strong>Read as text</strong> — masked words, both directions, sizes and impact</summary>

**The 10-year-old version:**

Imagine you're trying to guess a missing word in a sentence:

"I went to the _____ and bought milk."

You'd look at the words BEFORE ("went to the") AND AFTER ("and bought milk") to guess "store." That's what BERT does — it reads in both directions at once. GPT-style models read only left to right (like covering one eye), and ELMo (2018) glued together two one-way readers; BERT was the first to be *deeply* bidirectional — every layer sees both sides.

```
  GPT style (left-to-right only):
  ──────────────────────────────
  "I went to the _____"  →  could be: store, park, gym, office...
  (can't see what comes after!)

  BERT style (both directions):
  ─────────────────────────────
  "I went to the _____ and bought milk"
   ←────────────── ●  ──────────────→
  (sees "bought milk" → almost certainly "store"!)
```

> **Maths in one line:** `L = −Σ log P(xᵢ | the unmasked tokens)`, summed over the masked positions only — guess each hidden token from both sides; only the ~15% masked positions give a learning signal (about 77 of a 512-token input).

**Official definition:**

> BERT (Devlin et al., Google AI Language; arXiv October 2018, NAACL 2019) is
> a pre-trained Transformer encoder. It introduces **Masked Language Modeling
> (MLM)**: 15% of input tokens are chosen as targets (80% of them replaced by
> `[MASK]`, 10% by a random token, 10% left unchanged) and the model predicts
> them from bidirectional context. BERT also used **Next Sentence Prediction
> (NSP)** to learn relationships between sentence pairs. It came in two sizes,
> BERT-base (110M parameters) and BERT-large (340M), and fine-tuned BERT set
> new state-of-the-art results on 11 NLP tasks, e.g. a GLUE score of 80.5
> (+7.7 points).

**Key innovation:** Bidirectional pre-training with masking, then fine-tuning with one small task head on top. (Later work, RoBERTa, showed NSP adds little.)

**Impact:** In October 2019 Google Search began using BERT to understand queries — about 1 in 10 English searches in the US at launch. BERT-style encoders still power embeddings, classification and re-ranking ([Ch 17 §4.2](#content/17_llm)); the masking recipe and sizes are taught in [Ch 16 §3.5](#content/16_deep_learning).

</details>

---

### Paper 3: "T5" — Text-to-Text Transfer Transformer (2019)

<details>
<summary><strong>Read as text</strong> — every task as text in, text out, the recipe and impact</summary>

**The 10-year-old version:**

What if EVERY language task was just "turn this text into other text"? These are the paper's own examples:

- Translation: `translate English to German: That is good.` → `Das ist gut.`
- Grammar check: `cola sentence: The course is jumping well.` → `not acceptable`
- Sentence similarity: `stsb sentence1: The rhino grazed on the grass. sentence2: A rhino is grazing in a field.` → `3.8` (even a number is written as text)
- Summary: `summarize: state authorities dispatched emergency crews tuesday…` → `six people hospitalized after a storm in attala county.`

T5 says: don't build different models for each task. Build ONE model that takes text in and puts text out. Just change the instruction at the beginning.

```
  T5: Everything is Text-to-Text   (examples from the paper's Figure 1)
  ───────────────────────────────

  INPUT (always text)                                OUTPUT (always text)

  "translate English to German: That is good."  ──►  "Das ist gut."
  "cola sentence: The course is jumping well."  ──►  "not acceptable"
  "stsb sentence1: The rhino grazed on the      ──►  "3.8"
   grass. sentence2: A rhino is grazing in a
   field."
  "summarize: state authorities dispatched      ──►  "six people hospitalized
   emergency crews tuesday to survey the              after a storm in attala
   damage after an onslaught of severe weather        county."
   in mississippi…"

  Same model, same loss, same decoding. Only the text prefix changes.
```

> **Maths in one line:** `L = −Σₜ log P(targetₜ | prefix + input, target<ₜ)` — one ordinary next-token loss for every task; the text prefix is the only thing that tells the model which task to do.

**Official definition:**

> T5 (Raffel et al., Google; arXiv October 2019, JMLR 2020) reframes every NLP
> task as a text-to-text problem — both inputs and outputs are text strings.
> The paper is a systematic study of transfer learning: it compares
> pre-training objectives, architectures, unlabeled datasets and transfer
> methods, using the new C4 (Colossal Clean Crawled Corpus, about 750 GB of
> cleaned English web text). The best recipe — an encoder-decoder Transformer
> pre-trained with a denoising "span corruption" objective — scaled to 11B
> parameters and set state-of-the-art results on many benchmarks.

**Key innovation:** Unified framing — one model, one format, one loss, many tasks. Sizes ran from 60M to 11B parameters.

**Impact:** Instruction tuning grew out of this framing: Flan-T5 (Google, 2022) is T5 fine-tuned on about 1,800 tasks phrased as instructions. Frozen T5 encoders also became the text encoders of image generators such as Imagen (2022). Span corruption and the encoder-decoder are taught in [Ch 16 §3.5](#content/16_deep_learning).

</details>

---

### Paper 4: "PaLM" and "Gemini" — Google's Frontier Models

<details>
<summary><strong>Read as text</strong> — PaLM's scale, chain-of-thought and how MFU is computed</summary>

**The 10-year-old version:**

If the Transformer paper was the blueprint for a car engine, PaLM is a giant truck built with that engine, and Gemini is a vehicle that can also see and hear — it understands pictures, sound and video, not just text.

**PaLM (2022):**

```
  PaLM — Pathways Language Model   (Chowdhery et al., Google, 2022)
  ──────────────────────────────

  Size:        540 billion parameters (dense, decoder-only Transformer)
  Hardware:    6,144 TPU v4 chips = 2 pods × 3,072 chips
               (data parallel across the pods, no pipeline parallelism)
  System:      JAX + T5X code on Pathways — one Python client sends
               half of each batch to each pod
  Data:        780 billion tokens: 50% social-media conversations,
               27% web pages, 13% books, 5% GitHub code,
               4% Wikipedia, 1% news
  Efficiency:  46.2% MFU — vs GPT-3 21.3%, Gopher 32.5%, MT-NLG 30.2%

  Headline result: scale + chain-of-thought prompting
  ───────────────────────────────────────────────────
  Given 8 worked examples in the prompt, PaLM 540B solved 58% of the
  GSM8K grade-school maths problems (previous best: 55%, a fine-tuned
  GPT-3 with a calculator and a verifier). One worked example:

  Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls.
     Each can has 3 tennis balls. How many tennis balls does he have now?
  A: Roger started with 5 balls. 2 cans of 3 tennis balls each is
     6 tennis balls. 5 + 6 = 11. The answer is 11.

  No fine-tuning on maths: the steps shown in the prompt teach the
  model to write its own steps before it answers.
```

**"Emergent" abilities?** On about 25% of BIG-bench tasks, going from PaLM 62B to 540B gave a far bigger jump than going from 8B to 62B — the paper's "discontinuous improvements", often called **emergent abilities**. Later work argued that many such jumps come from all-or-nothing scoring (exact match) rather than a sudden change inside the model; see [Ch 17 §3.9](#content/17_llm).

> **Maths in one line:** `MFU = tokens/s × FLOPs per token ÷ (chips × peak FLOP/s)`, with FLOPs per token = 6N + 12·L·H·Q·T — the share of the chips' peak speed spent on the model's own maths; for PaLM, 238.3K × 3.28×10¹² ÷ (6,144 × 275×10¹²) = 46.2%.

**Run it yourself — PaLM's MFU from its own published numbers.** N = parameters, L = layers, H = heads, Q = head size, T = sequence length; the 12·L·H·Q·T term is the attention work that 6N leaves out. MFU itself is taught in [Ch 29 §24.6c](#content/29_gpus_tpus_infrastructure).

</details>

```python
# PaLM's 46.2% MFU from its own published numbers, a contrast run, and the napkin training time
N, L, H, Q, T = 540.35e9, 118, 48, 256, 2048    # parameters, layers, heads, head size, sequence length
tokens_per_s = 238.3e3                           # measured training throughput (tokens per second)
chips, peak = 6144, 275e12                       # TPU v4 chips, peak BF16 FLOP/s per chip

flops_per_token = 6 * N + 12 * L * H * Q * T     # 6N for the weights + the attention term
mfu = tokens_per_s * flops_per_token / (chips * peak)
mfu_weights_only = tokens_per_s * 6 * N / (chips * peak)
print(f"PaLM 540B  : MFU = {mfu:.1%}  (weights only, 6N: {mfu_weights_only:.1%})")
assert round(mfu, 3) == 0.462 and round(mfu_weights_only, 3) == 0.457   # the paper's two numbers

# Contrast: Megatron-Turing NLG 530B, 2,240 A100 GPUs (312 TFLOP/s peak), 65.43K tokens/s
mt_nlg = 65.43e3 * 6 * 530e9 / (2240 * 312e12)
print(f"MT-NLG 530B: MFU = {mt_nlg:.0%}  (weights only)")

# Napkin training time: total compute C = 6 * N * D, spent at PaLM's MFU on 6,144 chips
D = 780e9                                        # training tokens
C = 6 * N * D
days = C / (chips * peak * mfu) / 86_400
napkin_chip_hours = chips * days * 24
actual_chip_hours = 6144 * 1200 + 3072 * 336     # reported, incl. downtime and repeated steps
print(f"C = 6ND = {C:.2e} FLOPs -> {days:.0f} days on {chips:,} chips")
print(f"chip-hours: napkin {napkin_chip_hours/1e6:.1f}M vs reported {actual_chip_hours/1e6:.1f}M "
      f"({actual_chip_hours/napkin_chip_hours:.1f}x)")
```

**Output:**

```
PaLM 540B  : MFU = 46.2%  (weights only, 6N: 45.7%)
MT-NLG 530B: MFU = 30%  (weights only)
C = 6ND = 2.53e+24 FLOPs -> 37 days on 6,144 chips
chip-hours: napkin 5.5M vs reported 8.4M (1.5x)
```

<details>
<summary><strong>Read as text</strong> — continued: the napkin gap, Gemini and the model lineup</summary>

The napkin number is a floor: the reported run took about 1.5× the ideal chip-hours, because real training includes restarts, downtime and repeated steps. MT-NLG, trained with pipeline parallelism on GPUs, reached about 30%.

**Gemini (2023):**

```
  Gemini — Natively Multimodal
  ─────────────────────────────

  Previous approach:           Gemini approach:
  ┌────────┐  ┌────────┐      ┌───────────────────────┐
  │ Text   │  │ Image  │      │                       │
  │ Model  │  │ Model  │      │   ONE model that      │
  └───┬────┘  └───┬────┘      │   understands text,   │
      │           │           │   images, audio,      │
      └─────┬─────┘           │   video and code      │
            │                 │                       │
      ┌─────┴─────┐           │   Trained on all      │
      │ Glue them │           │   modalities from     │
      │ together  │           │   the start           │
      └───────────┘           └───────────────────────┘
      (separate training,      (joint training,
       bolted on later)         deeply integrated)
```

Gemini 1.0 (Gemini Team, Google; December 2023) came in three sizes — Ultra, Pro and Nano — trained jointly on text, images, audio and video, on TPU v4 and v5e chips with JAX and Pathways. Gemini 1.5 Pro (February 2024) moved to a sparse mixture-of-experts design ([Ch 17 §4.8](#content/17_llm)) with a 1-million-token context window; 1.5 Flash (May 2024) added a fast, cheap tier.

| Model | Parameters | Inputs | Year | Key feature |
|-------|-----------|--------|------|-------------|
| PaLM | 540B | Text, code | 2022 | Scale + Pathways; multi-step reasoning with chain-of-thought prompts |
| PaLM 2 | Undisclosed (largest "significantly smaller" than PaLM) | Text, code; 100+ languages | 2023 | Stronger and cheaper to serve than PaLM; data and model size grown ~1:1 |
| Gemini 1.0 (Ultra / Pro / Nano) | Undisclosed (Nano: 1.8B and 3.25B) | Text, image, audio, video | Dec 2023 | Natively multimodal |
| Gemini 1.5 (Pro / Flash) | Undisclosed | Same, up to 1M tokens | 2024 | Pro is a sparse MoE; million-token context |
| Gemini 2.x → 4 | Undisclosed | Text, image, audio, video | 2024–26 | Thinking models, native tool use, agents; latest is Gemini 4 Argon (Oct 2026) — lineup in [Ch 17 §4.5](#content/17_llm) |

</details>

---

### Paper 5: "Wide & Deep Learning" — Recommendations (2016)

<details>
<summary><strong>Read as text</strong> — memorize plus generalize, the architecture and the +3.9% result</summary>

**The 10-year-old version:**

When recommending apps on Google Play, you need two things:

1. **Memory (Wide):** "People who installed Netflix were happy to be shown Pandora." This is simple pattern matching — memorizing specific combinations that really happened.

2. **Imagination (Deep):** "This user likes music and video apps, so a podcast app might suit them too." This is understanding the deeper meaning behind choices, even for combinations never seen before.

Wide & Deep combines both — the exact memory of a lookup table AND the generalization of a neural network — in ONE model.

```
  Wide & Deep Architecture   (as deployed on Google Play)
  ────────────────────────

  Input features (user, app shown, context)
             │
             ├─────────────────────────────┐
             ▼                             ▼
  ┌────────────────────┐        ┌────────────────────┐
  │ WIDE component     │        │ DEEP component     │
  │                    │        │                    │
  │ Linear model on    │        │ Embeddings +       │
  │ cross features     │        │ dense features     │
  │ (memorize exact    │        │ (~1,200 numbers)   │
  │ combinations)      │        │ → ReLU 1024        │
  │                    │        │ → ReLU 512         │
  │ e.g. AND(          │        │ → ReLU 256         │
  │  installed=Netflix,│        │ (generalize to     │
  │  shown=Pandora)    │        │ unseen combos)     │
  └──────────┬─────────┘        └──────────┬─────────┘
             └──────────────┬──────────────┘
                            ▼
                    ┌───────────────┐
                    │ ONE sigmoid   │
                    │ output, both  │
                    │ parts trained │
                    │ jointly       │
                    └───────┬───────┘
                            ▼
                        P(install)
```

> **Maths in one line:** `P(install) = σ(w_wideᵀ[x, cross(x)] + w_deepᵀ a_final + b)` — add the wide part's score and the deep part's score, then squash with a sigmoid; both parts are trained together on one loss, not as two separate models averaged afterwards.

**Official definition:**

> Wide & Deep Learning (Cheng et al., Google; arXiv June 2016, DLRS workshop
> at RecSys 2016) jointly trains a wide linear model (for memorization of
> feature cross-products) and a deep neural network (for generalization
> through learned embeddings). The wide part was optimized with FTRL and L1
> regularization, the deep part with AdaGrad, on over 500 billion examples.
> In a live A/B test on Google Play (over one billion active users, over one
> million apps), it raised app acquisitions by 3.9% relative to the highly
> optimized wide-only model; a deep-only model gained 2.9%.

**Today:** Deep & Cross Networks (DCN and DCN-v2, also from Google) learn the feature crosses automatically instead of relying on hand-picked ones. How ranking fits into a modern recommender is taught in [Ch 26 Part 3](#content/26_ml_system_design).

</details>

---

### Paper 6: "Deep Neural Networks for YouTube Recommendations" (2016)

<details>
<summary><strong>Read as text</strong> — the two-stage funnel, ranking by watch time and the key insights</summary>

**The 10-year-old version:**

In 2016 YouTube had millions of videos to choose from (far more today). When you open YouTube, it must pick a few dozen for your home page — in tens of milliseconds. That's like picking a shelf of books you'd love from a giant library, in the blink of an eye.

The trick: do it in two steps — a quick, rough first pass, then a careful second look at the few that survive.

```
  YouTube Recommendation System   (Covington, Adams, Sargin — RecSys 2016)
  ──────────────────────────────

  STEP 1: Candidate generation (the wide net)
  ───────────────────────────────────────────

  Millions of videos
              │
              ▼
  ┌──────────────────────┐
  │ Neural network       │  "Which few hundred videos MIGHT
  │ (fast, rough)        │   this user like?"
  │                      │
  │ Inputs: average of   │  Trained as a giant classifier:
  │ watched-video        │  "which video is watched NEXT?"
  │ embeddings, search   │  Served by nearest-neighbour
  │ tokens, region,      │  search over video embeddings.
  │ device, age, gender, │
  │ "example age"        │
  └───────────┬──────────┘
              │
     Hundreds of candidates
              │
              ▼
  STEP 2: Ranking (the careful sort)
  ──────────────────────────────────

  ┌──────────────────────┐
  │ Neural network       │  "Of these hundreds, which few
  │ (slower, precise)    │   dozen should we show?"
  │                      │
  │ Inputs: the video    │  Richer features: only hundreds
  │ shown, how many      │  of videos are scored.
  │ videos the user      │  Target: expected WATCH TIME,
  │ watched from its     │  not clicks.
  │ channel, time since  │
  │ last watch, times    │
  │ already shown        │
  └───────────┬──────────┘
              │
              ▼
     A few dozen videos → shown to the user
```

> **Maths in one line:** `odds = Σ Tᵢ / (N − k) ≈ E[T]` — train a logistic regression in which each clicked impression is weighted by its watch time Tᵢ and each skip weighs 1; with N impressions and k clicks, the learned odds e^(Wx+b) equal E[T] / (1 − CTR), about the expected watch time per impression, so serving can rank by e^(Wx+b).

**Official definition:**

> The paper (Covington, Adams, Sargin, Google; RecSys 2016) presents a
> two-stage deep learning architecture for YouTube recommendations: (1) a
> **candidate generation** network that retrieves hundreds of candidates from
> a corpus of millions, posed as extreme multi-class classification ("which
> video will be watched next?") and trained with a sampled softmax — several
> thousand sampled negatives instead of millions of classes, over 100× faster
> — then served by approximate nearest-neighbour search; and (2) a **ranking**
> network that scores those candidates with a richer set of features and
> predicts expected watch time. The models have about one billion parameters,
> are trained on hundreds of billions of examples, and serve more than a
> billion users.

**Key insights that changed the field:**

- **Rank by expected watch time, not click-through rate (CTR)** — ranking by CTR promotes clickbait that people abandon. The weighted logistic regression above turns a click model into a watch-time model.
- **Predict the user's NEXT watch from earlier activity only** — holding out a random watch from the middle of someone's history leaks the future, because viewing is asymmetric (series are watched in order; people move from popular to niche).
- **An "example age" feature** — feeding the age of each training example lets the model learn that fresh uploads are popular; at serving time it is set to zero.
- **The two-stage funnel** (retrieve → rank) became the standard architecture for large-scale recommenders; today's version (two-tower retrieval, multi-task ranker, re-ranking) is in [Ch 26 Part 3](#content/26_ml_system_design).

**Run it yourself — clickbait vs lecture.** Two videos: one gets more clicks, the other gets watched much longer. Fit the weighted logistic regression for each and compare the two rankings.

</details>

```python
# YouTube's ranking trick: weight each click by its watch time, and the learned odds become expected watch time
import numpy as np

rng = np.random.default_rng(0)
videos = {"clickbait": (0.10, 1.0), "lecture": (0.04, 8.0)}   # (click-through rate, mean minutes per click)
N = 50_000                                                      # impressions per video
odds_of, ctr_of = {}, {}

for name, (ctr, mean_min) in videos.items():
    clicked = rng.random(N) < ctr
    T = np.where(clicked, rng.exponential(mean_min, N), 0.0)    # minutes watched; 0 if not clicked
    k, S = int(clicked.sum()), float(T.sum())
    b = 0.0                                                     # logistic regression with one bias term
    for _ in range(50):                                         # Newton steps on the WEIGHTED log-loss:
        p = 1 / (1 + np.exp(-b))                                #   a click weighs T_i, a skip weighs 1
        b -= ((N - k) * p - S * (1 - p)) / ((N - k + S) * p * (1 - p))
    odds, E_T, P = float(np.exp(b)), S / N, k / N
    assert abs(odds - S / (N - k)) < 1e-9                       # closed form: odds = sum(T) / (N - k)
    odds_of[name], ctr_of[name] = odds, P
    print(f"{name:9s}: CTR {P:.3f} | E[T] per impression {E_T:.3f} min | "
          f"learned odds {odds:.3f} = E[T]/(1-P) {E_T / (1 - P):.3f}")

by_ctr = max(ctr_of, key=ctr_of.get)
by_watch = max(odds_of, key=odds_of.get)
print(f"rank by CTR -> {by_ctr} first; rank by learned odds (watch time) -> {by_watch} first")
assert (by_ctr, by_watch) == ("clickbait", "lecture")
```

**Output:**

```
clickbait: CTR 0.102 | E[T] per impression 0.100 min | learned odds 0.112 = E[T]/(1-P) 0.112
lecture  : CTR 0.040 | E[T] per impression 0.317 min | learned odds 0.330 = E[T]/(1-P) 0.330
rank by CTR -> clickbait first; rank by learned odds (watch time) -> lecture first
```

<details>
<summary><strong>Read as text</strong> — continued: what the run shows</summary>

The learned odds match `E[T] / (1 − CTR)` exactly, and they flip the ranking: the clickbait video wins on clicks (CTR 0.102 vs 0.040), the lecture wins on watch time (learned odds 0.330 vs 0.112; true watch time per impression 0.317 vs 0.100 minutes).

</details>

---

### Paper 7: "Chinchilla" — Compute-Optimal Scaling Laws (2022)

<details>
<summary><strong>Read as text</strong> — power laws, the ~20 tokens per parameter rule and two twists</summary>

**The 10-year-old version:**

If you practice piano for 1 hour, you get a bit better. For 10 hours, a lot better. For 1,000 hours, really good. But there's a pattern: the improvement from hour 1 to 10 is bigger than from hour 100 to 110.

Scaling laws found the same pattern for AI: as you make models bigger, train them on more data and spend more compute, they get better in a **predictable, mathematical way** — so you can plan a training run before spending millions on it. The first big measurement came from **OpenAI** (Kaplan et al., 2020). DeepMind's **Chinchilla** paper (2022) — the Google side of the story — redid the experiment and changed how every lab spends its budget.

```
  Scaling Laws — The Key Relationships   (Kaplan et al., OpenAI, 2020)
  ─────────────────────────────────────

  Loss (how wrong the model is) depends on three things:

  1. N = Number of parameters (model size)
  2. D = Dataset size (tokens trained on)
  3. C = Compute budget (FLOPs spent training)

  The relationships follow POWER LAWS:

  Loss ∝ N^(-0.076)    ← more params → lower loss (but diminishing)
  Loss ∝ D^(-0.095)    ← more data → lower loss (but diminishing)
  Loss ∝ C^(-0.050)    ← more compute → lower loss (but diminishing)

  Doubling the parameters: loss × 2^(-0.076) = 0.95 → about 5% lower.

  Visualized:

  Loss
  │
  │╲
  │  ╲
  │    ╲
  │      ╲──────────           The curve flattens but never
  │              ───────       truly stops improving.
  │                    ───────
  └──────────────────────────── Model Size / Data / Compute
```

> **Maths in one line:** `C ≈ 6·N·D`, and at the compute-optimal point `D ≈ 20·N`, so `N_opt ≈ √(C / 120)` — training costs about 6 FLOPs per parameter per token; for a fixed budget, grow parameters and tokens together. Chinchilla's own budget: C = 6 × 70B × 1.4T = 5.88×10²³ FLOPs → N_opt = √(5.88×10²³ / 120) = 7.0×10¹⁰ = 70B parameters.

**Official definition:**

> Hoffmann et al. (DeepMind; arXiv March 2022, NeurIPS 2022) trained over 400
> language models, from 70M to over 16B parameters on 5B to 500B tokens, and
> found that for a fixed compute budget, model size and training tokens should
> grow in equal proportion. Kaplan et al. (2020) had advised growing the model
> much faster than the data, so models such as GPT-3 and Gopher were
> under-trained. To test this, DeepMind trained **Chinchilla** (70B parameters,
> 1.4T tokens) with about the same compute as Gopher (280B parameters, 300B
> tokens). Chinchilla beat Gopher, GPT-3 and Megatron-Turing NLG on most
> benchmarks (MMLU 67.5%, over 7 points above Gopher).

**The Chinchilla insight:**

```
  Before Chinchilla (models trained 2020–22):
  ───────────────────────────────────────────
  "Want a better model? Make it BIGGER!"
  GPT-3:  175B params, 300B tokens   ← 1.7 tokens per param
  Gopher: 280B params, 300B tokens   ← 1.1 tokens per param
  PaLM:   540B params, 780B tokens   ← 1.4 tokens per param

  After Chinchilla:
  ─────────────────────────
  "Want a better model? Grow the DATA as fast as the model!"
  Chinchilla: 70B params, 1.4T tokens  ← 20 tokens per param

  Chinchilla (70B) beat Gopher (280B) on the same compute:
  4× smaller model, trained on 4.7× more data.

  The rule of thumb from Chinchilla:
  ┌──────────────────────────────────────────────────┐
  │  Optimal tokens ≈ 20 × number of parameters      │
  │                                                  │
  │  70B model → train on ~1.4 trillion tokens       │
  │  7B model  → train on ~140 billion tokens        │
  └──────────────────────────────────────────────────┘
```

**After Chinchilla — two twists:**

- **PaLM 2 (2023)** confirmed the rule at larger budgets: data and model size should grow roughly 1:1, and its largest model is "significantly smaller" than PaLM yet stronger.
- **"20 tokens per parameter" minimises training compute only.** A model that will be served billions of times is deliberately trained far past it — Llama 3 8B saw about 15T tokens, roughly 1,900 per parameter — because a smaller model is cheaper to run. The calculator and the fitted loss formula are in [Ch 17 §3.7](#content/17_llm).

</details>

---

### More Google & DeepMind Papers Worth Knowing

One line each — enough to recognise the name and the idea in an interview. Follow the link for the full explanation.

| Year | Paper (lab, venue) | The one idea | Learn it in |
|------|--------------------|--------------|-------------|
| 2013 | **word2vec** — Mikolov et al. (Google) | Learn one vector per word so that similar words sit close together (king − man + woman ≈ queen) | [Ch 17b §10](#content/17b_llm_applications) |
| 2014 | **Sequence to Sequence** — Sutskever, Vinyals, Le (Google; NeurIPS) | One LSTM reads the input, another writes the output — the encoder-decoder idea the Transformer kept | [Ch 16 §3.2](#content/16_deep_learning) |
| 2015 | **Distilling the Knowledge in a Neural Network** — Hinton, Vinyals, Dean (Google) | A small "student" model learns from a big "teacher" model's softened probabilities | [Ch 17c §3.4](#content/17c_llm_systems) |
| 2015 | **Hidden Technical Debt in ML Systems** — Sculley et al. (Google; NeurIPS) | The model code is a small box inside a big system; entanglement, hidden feedback loops, glue code and data dependencies make ML systems costly to maintain | [Ch 26](#content/26_ml_system_design) |
| 2017 | **Outrageously Large Neural Networks** (sparsely-gated Mixture-of-Experts) — Shazeer et al. (Google; ICLR) | A router sends each token to a few "expert" sub-networks: far more parameters for the same compute per token | [Ch 17 §4.8](#content/17_llm) |
| 2019 | **Multi-Query Attention** — Shazeer (Google); **Grouped-Query Attention** — Ainslie et al. (Google; EMNLP 2023) | Query heads share keys and values, so the KV cache shrinks and decoding gets faster | [Ch 17 §2.4](#content/17_llm) |
| 2020 | **ViT: An Image is Worth 16x16 Words** — Dosovitskiy et al. (Google; ICLR 2021) | Cut an image into 16×16 patches and treat each patch as a token: a 224×224 image becomes 196 tokens | [Ch 16 §2.4](#content/16_deep_learning) |
| 2021 | **Switch Transformer** — Fedus, Zoph, Shazeer (Google; JMLR 2022) | MoE with only ONE expert per token; up to 7× faster pre-training than a dense T5 for the same compute, and trillion-parameter models | [Ch 17 §4.8](#content/17_llm) |
| 2021 | **AlphaFold 2** — Jumper et al. (DeepMind; Nature) | Predicts a protein's 3D shape from its amino-acid sequence; Demis Hassabis and John Jumper shared the 2024 Nobel Prize in Chemistry for it | — |
| 2022 | **Chain-of-Thought Prompting** — Wei et al. (Google; NeurIPS) | Worked steps in the prompt unlock multi-step reasoning in large models | [Ch 17 §3.9](#content/17_llm) |
| 2022 | **Speculative Decoding** — Leviathan, Kalman, Matias (Google; ICML 2023) | A small model drafts several tokens and the big model checks them in one pass: 2–3× faster with identical outputs | [Ch 17c §2.5](#content/17c_llm_systems) |
| 2024 | **Gemma** — Gemma Team (Google DeepMind) | Open-weight models built from Gemini research; Gemma 4 is the 2026 generation | [Ch 17 §4.6](#content/17_llm) |

---

# SECTION 6: QUICK REFERENCE

![One-page infographic of Google's ML stack as of Nov 2026: research papers (Transformer, BERT, T5, PaLM, Gemini, Chinchilla, Wide & Deep, YouTube DNN) flow into software (JAX transforms jit, grad, vmap and shard_map on the XLA compiler, plus Flax NNX, Optax, Orbax, Keras 3 on JAX, TF or PyTorch, and TorchTPU), which flows into chips and platform (TPU slices and pods linked by ICI, and Agent Platform, formerly Vertex AI), with the example Transformer paper to Gemini trained with JAX on TPU pods to Model Garden. A TPU table gives BF16 TFLOPS, HBM and pod size: v5e 197, 16 GB, 256; v5p 459, 95 GiB, 8,960; v6e 918, 32 GB, 256; TPU7x 2,307, 192 GiB, 9,216. An Agent Platform card lists Pipelines, Feature Store, Model Registry, Endpoints, Monitoring with threshold 0.3, and Agents. The trap: TPUs are rented, from Google Cloud today and Oracle Cloud (OCI) from 2027.](diagrams/gml30_info_ecosystem_quick_reference_ai.png)

---

## 6.1 TPU Cheat Sheet

```
  ┌────────────────────────────────────────────────────────────────────┐
  │                        TPU QUICK REFERENCE                         │
  ├────────────────────────────────────────────────────────────────────┤
  │  What: Google's custom AI chip (an ASIC) built for big matrix      │
  │    multiplies                                                      │
  ├────────────────────────────────────────────────────────────────────┤
  │  Inside a chip:                                                    │
  │    • MXUs — systolic arrays, the matrix-multiply engines (§1.3)    │
  │    • BF16 native — FP32's range in half the bits                   │
  │    • HBM — on-package memory that feeds the MXUs                   │
  │    • SparseCores — speed up embedding lookups (recommenders)       │
  │  Between chips:                                                    │
  │    • ICI links chips into a slice or a pod (3D torus on v4, v5p    │
  │      and TPU7x; 2D torus on v5e and v6e)                           │
  │    • Bigger jobs span several slices over the data-centre network  │
  │      (Multislice)                                                  │
  ├────────────────────────────────────────────────────────────────────┤
  │  Key numbers per chip (Google Cloud TPU docs, Nov 2026):           │
  │           BF16 TFLOPS     HBM      HBM speed     Pod size          │
  │    v5e        197        16 GB     0.82 TB/s       256 chips       │
  │    v5p        459        95 GiB    2.77 TB/s     8,960 chips       │
  │    v6e        918        32 GB     1.64 TB/s       256 chips       │
  │    TPU7x    2,307       192 GiB    7.38 TB/s     9,216 chips       │
  │    (TPU7x = Ironwood; 4,614 TFLOPS in FP8)                         │
  ├────────────────────────────────────────────────────────────────────┤
  │  Software: XLA compiles JAX, or PyTorch through TorchTPU;          │
  │    TensorFlow is not supported on TPU7x                            │
  │  When to use:                                                      │
  │    ✓ Large Transformer training and high-volume serving            │
  │    ✓ JAX code, or PyTorch via TorchTPU (it replaced PyTorch/XLA,   │
  │      Oct 2026)                                                     │
  │    ✗ Code that depends on custom CUDA kernels — use GPUs           │
  │    ✗ Small experiments — one GPU or a Colab TPU is enough          │
  │    ✗ Hardware in your own data centre — TPUs are rented: Google    │
  │      Cloud today, Oracle Cloud (OCI) announced for 2027            │
  │  Access: Google Cloud TPU VMs or GKE; the Colab free tier offers   │
  │    one TPU v5e chip (v5e-1), subject to availability               │
  └────────────────────────────────────────────────────────────────────┘
```

## 6.2 JAX Transformation Cheat Sheet

| Transform | What it does | One-liner |
|-----------|--------------|-----------|
| `jit` | Trace once, compile with XLA; recompiles for new shapes | `fast_f = jax.jit(f)` |
| `grad` | Exact gradient of a scalar function | `df = jax.grad(loss)` |
| `vmap` | Auto-batch: write for one example, run on many | `jax.vmap(f)(xs)` |
| `jit` + shardings | Global view: you place the data, XLA splits the work across devices | `jax.device_put(x, NamedSharding(mesh, P('data')))` |
| `shard_map` | Per-device code with explicit collectives (`psum`); replaces `pmap` | `jax.shard_map(f, mesh=mesh, in_specs=P('data'), out_specs=P('data'))` |
| Compose! | They stack — e.g. compiled per-example gradients | `jax.jit(jax.vmap(jax.grad(loss), in_axes=(None, 0)))` |

**Rules:** pure functions (no side effects), immutable arrays (`x.at[i].set(v)` returns a new array), explicit PRNG keys (`key = jax.random.key(0)`, then split it before each use). `pmap` still runs — it has been rebuilt on `jit` + `shard_map` (the default since JAX 0.8, the only version since 0.10) — but it is in maintenance mode; write new multi-device code with shardings or `shard_map`.

## 6.3 Vertex AI Cheat Sheet

```
  ┌────────────────────────────────────────────────────────────────────┐
  │            VERTEX AI → GEMINI ENTERPRISE AGENT PLATFORM            │
  ├────────────────────────────────────────────────────────────────────┤
  │  Renamed 22 April 2026: same services under new names. The Python  │
  │    SDK is still google-cloud-aiplatform (import vertexai), and     │
  │    many docs and interviewers still say "Vertex AI".               │
  ├────────────────────────────────────────────────────────────────────┤
  │  Pipelines      → reproducible DAG of containerized steps (KFP 2   │
  │                   or TFX); unchanged steps are cached              │
  │  Feature Store  → BigQuery offline store + online serving;         │
  │                   point-in-time joins stop training-serving skew   │
  │                   (the Legacy Feature Store shuts down 17 Feb      │
  │                   2027)                                            │
  │  Model Registry → numbered versions + aliases ("default" goes on   │
  │                   the first version)                               │
  │  Endpoints      → online predictions; each deployed model has its  │
  │                   own autoscaled replicas (minimum 1); traffic     │
  │                   split between versions                           │
  │  Monitoring     → skew (vs training data) and drift (vs an         │
  │                   earlier window); L-infinity for categories,      │
  │                   Jensen-Shannon for numbers; default alert        │
  │                   threshold 0.3                                    │
  │  AutoML         → no-code training, tabular and image data only    │
  │  Model Garden   → 200+ models (Gemini, Gemma, Claude, open         │
  │                   models); Vector Search for embeddings            │
  │  Agents         → ADK (code), Agent Studio (low-code), Agent       │
  │                   Runtime (managed) — Ch 19 §19.12                 │
  │  Retired        → Data Labeling (shut down 2024); Explainable AI   │
  │                   (deprecated, shutdown Mar 2027 — use SHAP or     │
  │                   LIME)                                            │
  ├────────────────────────────────────────────────────────────────────┤
  │  Think of it as: GitHub + CI/CD + Docker, for models and agents    │
  └────────────────────────────────────────────────────────────────────┘
```

## 6.4 Key Papers — One-Line Summaries

| Paper | Year | Lab | One-line summary |
|-------|------|-----|------------------|
| Attention Is All You Need | 2017 | Google Brain / Google Research | The Transformer: self-attention replaces recurrence; the base of every modern LLM |
| BERT | 2018 | Google AI Language | Masked-word pre-training that reads both directions; great for understanding and embeddings |
| T5 | 2019 | Google | Every task is text in, text out; C4 dataset; encoder-decoder up to 11B |
| PaLM | 2022 | Google | 540B dense model on 6,144 TPU v4 chips at 46.2% MFU; strong chain-of-thought reasoning |
| Gemini 1.0 / 1.5 | 2023 / 2024 | Google DeepMind | Natively multimodal; 1.5 Pro adds a sparse MoE design and a 1M-token context |
| Wide & Deep | 2016 | Google | Memorize crosses (wide) + generalize with embeddings (deep) in one joint model; +3.9% app installs |
| YouTube DNN | 2016 | Google (YouTube) | Retrieve hundreds of videos from millions, then rank by expected watch time |
| Chinchilla | 2022 | DeepMind | For a fixed budget grow parameters and tokens together — about 20 tokens per parameter |
| Scaling Laws (for contrast) | 2020 | OpenAI — not Google | Loss falls as a power law in N, D and C; the advice Chinchilla corrected |

More one-liners (word2vec, distillation, MoE and Switch, ViT, chain-of-thought, speculative decoding, Gemma) are in the "More Google & DeepMind Papers Worth Knowing" table at the end of Section 5.

---

## 6.5 How Everything Connects

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                GOOGLE'S ML ECOSYSTEM — THE BIG PICTURE                 │
  ├────────────────────────────────────────────────────────────────────────┤
  │  RESEARCH (ideas)        SOFTWARE (code)          CHIPS & PLATFORM     │
  │                                                                        │
  │  Transformer, BERT,   ─► JAX + XLA             ─► TPU slices and pods, │
  │  T5, PaLM, Gemini,       (Flax NNX, Optax,        linked by ICI        │
  │  Chinchilla, MoE,        Orbax)                                        │
  │  ViT, chain-of-          Keras 3 (on JAX,      ─► Agent Platform       │
  │  thought prompting,      TensorFlow or            (formerly Vertex     │
  │  Wide & Deep,            PyTorch)                 AI): Pipelines,      │
  │  YouTube DNN             TensorFlow: tf.data,     Feature Store,       │
  │                          LiteRT on devices        Registry, Endpoints, │
  │                          PyTorch via TorchTPU     agents               │
  │                                                                        │
  │  Ideas ──────────────────► Code ─────────────────► Chips & platform    │
  │                                                                        │
  │  Example: the Transformer paper → Gemini, trained with JAX on TPU      │
  │  pods → offered to companies through Agent Platform's Model Garden     │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

```
╔══════════════════════════════════════════════════════════════════════╗
║  GOOGLE ML ECOSYSTEM — WHAT TO REMEMBER                              ║
╠══════════════════════════════════════════════════════════════════════╣
║  TPUs (custom silicon)                                               ║
║  • MXU = weight-stationary systolic array: weights load once, data   ║
║    streams through, partial sums flow on; utilization M/(M+K+N−2),   ║
║    so tiny batches leave it idle                                     ║
║  • BF16: FP32's exponent range with fewer mantissa bits — stable     ║
║    training, usually without loss scaling                            ║
║  • HBM feeds each chip (TPU7x: 192 GiB at 7.38 TB/s); ICI links      ║
║    chips into slices and pods (TPU7x: 9,216 chips); Multislice       ║
║    joins slices over the data-centre network                         ║
║  • XLA compiles the whole step into one TPU program: keep shapes     ║
║    static and sizes in multiples of 128 — every new input shape is   ║
║    a new compile                                                     ║
║  • Software: JAX first; PyTorch through TorchTPU (replaced           ║
║    PyTorch/XLA, Oct 2026); TensorFlow is not supported on TPU7x      ║
║  • Access: Google Cloud today, Oracle Cloud (OCI) from 2027; GPUs    ║
║    for custom CUDA kernels or hardware you own                       ║
╠══════════════════════════════════════════════════════════════════════╣
║  JAX (functional, composable transforms)                             ║
║  • jit → trace once, compile with XLA; the first call is slow,       ║
║    later calls reuse the program; no fixed speed-up                  ║
║  • grad → exact autodiff; vmap → auto-batching; they compose:        ║
║    jit(vmap(grad(loss), in_axes=(None, 0))) gives per-example        ║
║    gradients whose mean is the batch gradient                        ║
║  • Many devices: jit + NamedSharding (the compiler inserts the       ║
║    all-reduce) or shard_map (per-device code + lax.pmean); pmap is   ║
║    in maintenance mode                                               ║
║  • Pure functions, immutable arrays (x.at[i].set(v)), explicit PRNG  ║
║    keys (split, never reuse); JAX runs async — time with             ║
║    block_until_ready()                                               ║
║  • Ecosystem: Flax NNX (models), Optax (optimizers), Orbax           ║
║    (checkpoints), Grain (data), MaxText (reference LLM code)         ║
╠══════════════════════════════════════════════════════════════════════╣
║  TensorFlow / Keras                                                  ║
║  • Keras 3 = one high-level API on JAX, TensorFlow or PyTorch:       ║
║    define → compile → fit → predict                                  ║
║  • Save as .keras; model.export() writes a TF SavedModel, LiteRT     ║
║    (formerly TFLite), ONNX or torch format; tf.data overlaps input   ║
║    with training                                                     ║
║  • TensorFlow is in maintenance mode since 2.21 (Mar 2026); Google   ║
║    points new GenAI work to Keras 3, JAX or PyTorch                  ║
╠══════════════════════════════════════════════════════════════════════╣
║  Vertex AI → Gemini Enterprise Agent Platform (renamed 22 Apr 2026)  ║
║  • Same MLOps services, renamed: Pipelines, Feature Store, Model     ║
║    Registry, Endpoints, Model Monitoring; SDK still                  ║
║    google-cloud-aiplatform                                           ║
║  • Feature Store on BigQuery with point-in-time joins (no            ║
║    training-serving skew); Registry versions + aliases; Endpoints    ║
║    autoscale and split traffic                                       ║
║  • Model Monitoring: skew (vs training) and drift (vs earlier        ║
║    traffic); L-infinity for categories, Jensen-Shannon for numbers;  ║
║    default threshold 0.3                                             ║
║  • Agents: ADK (code), Agent Studio (low-code), Agent Runtime        ║
║    (managed)                                                         ║
╠══════════════════════════════════════════════════════════════════════╣
║  Key papers                                                          ║
║  • Transformer (2017), BERT (2018), T5 (2019): attention,            ║
║    bidirectional pre-training, text-to-text                          ║
║  • PaLM (2022): 540B on 6,144 TPU v4 chips at 46.2% MFU; Gemini      ║
║    (2023): natively multimodal                                       ║
║  • Wide & Deep + YouTube DNN (2016): memorize + generalize;          ║
║    retrieve, then rank by expected watch time                        ║
║  • Chinchilla (DeepMind, 2022): ~20 tokens per parameter for a       ║
║    fixed budget (the 2020 Kaplan laws are OpenAI's)                  ║
║  • Also know one line each: word2vec, distillation, MoE / Switch,    ║
║    MQA / GQA, ViT, chain-of-thought, speculative decoding, Gemma,    ║
║    AlphaFold, Hidden Technical Debt                                  ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## Review Questions

**1. Your TPU training job slows down badly when you feed it sentences of many different lengths. Why, and what is the fix?**

<details>
<summary>Answer</summary>

XLA compiles one program per input shape, so every new length triggers a fresh compile. Pad or bucket the sequences into a few fixed lengths, and keep sizes in multiples of 128 so the MXUs are not filled with padding.
</details>

**2. How do you get per-example gradients in JAX, and how do they relate to the usual batch gradient?**

<details>
<summary>Answer</summary>

`jax.vmap(jax.grad(loss), in_axes=(None, 0, 0))` — the weights are shared, the batch is on axis 0 — usually wrapped in `jax.jit`. The result has one gradient per example; their mean equals the gradient of the mean loss (DP-SGD clips these per-example rows before averaging).
</details>

**3. In data parallelism across 4 chips, why does averaging the chips' local gradients give the full-batch gradient, and when does it fail?**

<details>
<summary>Answer</summary>

Each chip computes the mean gradient of its shard. With equal-sized shards, the mean of those shard means equals the global mean. With uneven shards you would have to weight each by its size — which is why `shard_map` requires the batch to divide evenly across the mesh.
</details>

**4. What roles do Flax NNX and Optax play in a JAX training step?**

<details>
<summary>Answer</summary>

Flax NNX defines the model and holds its parameters; `nnx.value_and_grad` computes the loss and the gradients; Optax, wrapped by `nnx.Optimizer`, turns gradients into updates such as AdamW; `nnx.jit` compiles the whole step.
</details>

**5. Why does JAX use explicit PRNG keys instead of a global random seed?**

<details>
<summary>Answer</summary>

Hidden global state would break `jit` (the function is traced once), `vmap` and sharding (which device would advance the state?). Explicit keys make randomness a pure, reproducible input. Split a key before each use — reusing one gives identical "random" numbers, such as the same dropout mask every step.
</details>

**6. Your JAX benchmark reports 0.1 ms for a large matrix multiply. What is probably wrong?**

<details>
<summary>Answer</summary>

JAX dispatches work asynchronously, so the timer stopped when the work was queued, not when it finished. Call `.block_until_ready()` on the result, and leave the first (compiling) call out of the timing.
</details>

**7. A team wants to start a new generative-AI project in TensorFlow. What do you tell them?**

<details>
<summary>Answer</summary>

Since TensorFlow 2.21 (March 2026) Google only maintains TensorFlow — security and bug fixes, dependency updates — and recommends Keras 3, JAX or PyTorch for new generative-AI work. On TPUs, use JAX (with Flax NNX and Optax) or PyTorch through TorchTPU; TensorFlow does not run on TPU7x at all.
</details>

**8. A device feature's training mix is mobile 60% / desktop 30% / tablet 10%; this week it is 25% / 65% / 10%. With default settings, does Model Monitoring alert, and why?**

<details>
<summary>Answer</summary>

Yes. For a categorical feature the score is the L-infinity distance — the largest change in any one category's share: max(0.35, 0.35, 0) = 0.35, above the default threshold of 0.3. Because the comparison is with the training data it is reported as skew; compared with an earlier production window it would be drift.
</details>

**9. PaLM 540B trained at 238.3K tokens per second on 6,144 TPU v4 chips (275 TFLOP/s each). Roughly what MFU is that, and why does the number matter?**

<details>
<summary>Answer</summary>

Useful maths ≈ 6 × 540B FLOPs per token × 238.3K tokens/s ≈ 7.7×10¹⁷ FLOP/s; peak = 6,144 × 275×10¹² ≈ 1.69×10¹⁸ FLOP/s; MFU ≈ 45.7% (46.2% when attention FLOPs are counted). MFU is the share of the peak you pay for that does model work — halve it and the same run costs twice as much. PaLM's figure was well above GPT-3's 21.3% and Gopher's 32.5%.
</details>

**10. Why did YouTube train its ranking model with positive examples weighted by watch time, and what does the model then predict?**

<details>
<summary>Answer</summary>

Ranking by click probability promotes clickbait that people abandon. If each clicked impression is weighted by its watch time and each skip by 1, the learned odds become Σ watch time ÷ (impressions − clicks) = E[T] / (1 − CTR), close to the expected watch time per impression. Serving ranks by e^(Wx+b), so videos people actually watch rise to the top.
</details>

**11. You have a training budget of 5.88×10²³ FLOPs. What model size and token count does Chinchilla suggest, and why might you still pick a smaller model?**

<details>
<summary>Answer</summary>

With C ≈ 6·N·D and D ≈ 20·N, N = √(C / 120) = √(4.9×10²¹) = 7.0×10¹⁰ — a 70B model on 1.4T tokens (exactly Chinchilla). The 20:1 rule minimises training compute only; if the model will serve billions of requests, a smaller model trained on more tokens (like Llama 3 8B on about 15T) gives similar quality at a much lower serving cost.
</details>

**12. Which Google paper would you cite for (a) shrinking the KV cache, (b) 2–3× faster decoding with identical outputs, (c) why ML systems are expensive to maintain?**

<details>
<summary>Answer</summary>

(a) Multi-Query Attention (Shazeer, 2019) and its generalisation Grouped-Query Attention (Ainslie et al., 2023): query heads share keys and values. (b) Speculative Decoding (Leviathan, Kalman, Matias, 2022): a small model drafts, the large model verifies. (c) Hidden Technical Debt in ML Systems (Sculley et al., 2015): entanglement, hidden feedback loops, glue code and data dependencies.
</details>

---

*End of Chapter 30 — Google's ML Ecosystem*
