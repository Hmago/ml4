# Chapter 19 — Google's ML Ecosystem: TPUs, JAX, Vertex AI & Key Papers

> "We are not just using machine learning — we are building the infrastructure
> to make machine learning accessible to everyone."
> — Jeff Dean, Google Senior Fellow

**How to read this chapter:** Each topic starts with a story a 10-year-old could follow, then the official definition and technical details. The key papers section at the end ties everything together — those papers created the ideas that power the tools described here.

---

## What You'll Learn

After reading this chapter, you will be able to:
- Explain what a TPU is and why Google built a special chip just for AI
- Describe how TPUs differ from GPUs (BF16, systolic arrays, memory bandwidth, TPU pods)
- Understand JAX and its four functional transformations (jit, vmap, pmap, grad)
- Know when to use JAX vs. TensorFlow/Keras
- Describe Vertex AI and its core platform concepts (pipelines, feature store, endpoints)
- Summarize seven landmark Google research papers that shaped modern AI

---

## Table of Contents

| Section | Topic | Key Concepts |
|---------|-------|--------------|
| 1 | TPUs — Google's Custom AI Chips | BF16, systolic arrays, HBM, TPU pods, TPU vs GPU |
| 2 | JAX — Functional ML at Google | jit, vmap, pmap, grad, XLA, Flax/Optax |
| 3 | TensorFlow & Keras | Ecosystem, eager mode, tf.data, SavedModel |
| 4 | Vertex AI — Google's ML Platform | Pipelines, Feature Store, endpoints, model registry |
| 5 | Key Google Research Papers | Transformer, BERT, T5, PaLM/Gemini, Wide & Deep, YouTube DNN, Scaling Laws |
| 6 | Quick Reference | Cheat sheets and decision guides |

---

# SECTION 1: TPUs — GOOGLE'S CUSTOM AI CHIPS

---

## 1.1 The Simple Explanation

### The LEGO Factory Analogy

Imagine you need to build a million identical LEGO houses. You have two choices:

**Option A: A General Workshop (GPU)**
Your workshop has amazing workers who can build anything — houses, castles, spaceships, robots. They're incredibly versatile. But when you need a million identical houses, they have to read the instructions every time and figure out what to do next.

**Option B: A House-Building Factory (TPU)**
You build a factory with a single conveyor belt designed ONLY for making houses. Every station on the belt does one step — snap the walls together, add the roof, attach the door. The factory can't make spaceships, but it churns out houses ridiculously fast because every step is hardwired.

A **TPU (Tensor Processing Unit)** is Google's custom-built factory for one job: multiplying big grids of numbers (matrix multiplication). That happens to be the single most common operation in machine learning. By building a chip that does this one thing brilliantly, Google made AI training much faster and cheaper.

```
  ┌─────────────────────────────────────────────────────────┐
  │              CPU vs GPU vs TPU                          │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │  CPU (Brain)              GPU (Army)         TPU (Factory)
  │  ┌───┐                   ┌─┬─┬─┬─┐         ┌──────────┐│
  │  │ ● │ Few powerful       │●│●│●│●│         │ ■ ■ ■ ■  ││
  │  │ ● │ cores. Great       │●│●│●│●│         │ ■ ■ ■ ■  ││
  │  └───┘ at everything.     │●│●│●│●│         │ ■ ■ ■ ■  ││
  │                           │●│●│●│●│         │ ■ ■ ■ ■  ││
  │  4-128 cores              └─┴─┴─┴─┘         └──────────┘│
  │  Jack of all trades       Thousands of       Systolic    │
  │                           small cores.       array.      │
  │                           Good at parallel   Built ONLY  │
  │                           math.              for matrix  │
  │                                              multiply.   │
  └─────────────────────────────────────────────────────────┘
```

---

## 1.2 Official Definition

> **TPU (Tensor Processing Unit):** A custom-designed application-specific
> integrated circuit (ASIC) developed by Google specifically to accelerate
> machine learning workloads. TPUs are optimized for high-volume, low-precision
> matrix computations central to training and inference of neural networks.

---

## 1.3 How TPUs Differ from GPUs

There are four key differences. Let's take each one.

---

### Difference 1: Systolic Arrays (The Conveyor Belt)

This is the biggest difference and the hardest to understand. Let's make it simple.

**The 10-year-old version:**

Imagine you're in a classroom. The teacher gives student #1 a math problem. Student #1 solves part of it and passes it to student #2. Student #2 adds their part and passes it to student #3. By the time it reaches the last student, the whole problem is solved — and student #1 has ALREADY started on the next problem!

Nobody waits. Everybody is always busy. That's a **systolic array**.

**The technical version:**

A systolic array is a grid of simple processing units (called PEs) arranged in rows and columns. Data flows through the grid in a rhythmic, pulsing pattern (like a heartbeat — "systolic" comes from the Greek word for heartbeat).

```
  How a Systolic Array Multiplies Matrices
  ─────────────────────────────────────────

  Matrix A values flow RIGHT →
  Matrix B values flow DOWN ↓
  Each cell multiplies what it receives and adds to a running total.

          b₁    b₂    b₃
          ↓     ↓     ↓
   a₁ → [PE] → [PE] → [PE]     Each PE does ONE thing:
          ↓     ↓     ↓            multiply + accumulate
   a₂ → [PE] → [PE] → [PE]
          ↓     ↓     ↓         All PEs work at the SAME time.
   a₃ → [PE] → [PE] → [PE]     No waiting. No idle units.

  Result: C = A × B  (computed as the values "wash through" the grid)

  TPU v4 systolic array: 128 × 128 = 16,384 PEs
  All 16,384 PEs doing math EVERY clock cycle!
```

**Why this matters for ML:**

Neural networks are basically long chains of matrix multiplications:

```
  output = activation( W₃ × activation( W₂ × activation( W₁ × input )))
                       ─────           ─────           ─────
                       matrix          matrix          matrix
                       multiply        multiply        multiply
```

A TPU's systolic array is a hardware-level matrix multiplication engine. GPUs also do matrix math well, but they use a more general-purpose architecture (CUDA cores + shared memory) that adds overhead.

```
  GPU approach:  read data → compute → write back → read → compute → write back
                      (memory round trips between each step)

  TPU approach:  data flows through the array continuously
                      (minimal memory access during computation)
```

---

### Difference 2: BF16 — Brain Floating Point

**The 10-year-old version:**

When you write the number 3.14159265, do you really need all those decimal places? Most of the time, "3.14" is close enough. BF16 is Google's way of saying: "Let's use shorter numbers so we can do math faster and fit more numbers in memory."

**The technical version:**

BF16 (Brain Float 16) is a 16-bit floating-point number format that Google designed specifically for deep learning.

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

**Why BF16 is brilliant for ML:**

| Property | FP32 | FP16 | BF16 |
|----------|------|------|------|
| Bits | 32 | 16 | 16 |
| Exponent bits | 8 | 5 | **8** |
| Range | ±3.4×10³⁸ | ±65,504 | **±3.4×10³⁸** |
| Precision (digits) | ~7 | ~3.3 | ~2.4 |
| Memory per number | 4 bytes | 2 bytes | **2 bytes** |

The key insight: neural network gradients need **range** more than **precision**. Gradients can be very large or very small (10⁻³⁰ to 10³⁰), but you don't need many decimal places. BF16 keeps the same range as FP32 while using half the memory.

```
  Why FP16 can be dangerous for training:

  Learning rate = 0.001
  Gradient = 0.000001

  FP16 max range: ±65,504    ← small range
  If gradient × weight > 65,504 → OVERFLOW → training crashes! 💥

  BF16 max range: ±3.4×10³⁸  ← same range as FP32
  No overflow risk. Training stays stable. ✓
```

**TPUs have native BF16 support** — the hardware itself is designed to do BF16 math at full speed. GPUs added BF16 support later (starting with NVIDIA A100), but TPUs were BF16-first from the beginning.

---

### Difference 3: High Memory Bandwidth (HBM)

**The 10-year-old version:**

Imagine your brain is super fast at math, but your hands are slow at picking up numbers from a table. You'd spend most of your time picking up numbers instead of doing math. **Memory bandwidth** is how fast the chip can pick up numbers. TPUs have very fast hands.

**The technical version:**

Memory bandwidth is the rate at which a processor can read from or write to memory. In ML, the data (weights, activations, gradients) is often too large to fit in the chip's local cache, so it must be streamed from High Bandwidth Memory (HBM).

```
  Memory Bandwidth Comparison (approximate)
  ──────────────────────────────────────────
  NVIDIA A100 GPU:    2.0 TB/s  (HBM2e, 80 GB)
  NVIDIA H100 GPU:    3.35 TB/s (HBM3, 80 GB)
  Google TPU v4:      1.2 TB/s  (HBM2e, 32 GB)
  Google TPU v5e:     1.6 TB/s  (HBM, 16 GB)
  Google TPU v5p:     4.8 TB/s  (HBM, 95 GB)

  Higher bandwidth = less time waiting for data = faster training
```

**Why this matters:**

Modern large models are **memory-bound**, not compute-bound. The processors can crunch numbers faster than memory can feed them. Think of it like a restaurant kitchen:

```
  Compute-bound:  The chefs are too slow        (rare in modern ML)
  Memory-bound:   The waiters can't bring        (THIS is the bottleneck)
                  ingredients fast enough

  Solution: wider "highways" between memory and processor
            = higher memory bandwidth
```

TPU v5p's 4.8 TB/s bandwidth means it can stream almost 5 terabytes of data to its processors every second — that's roughly 1,000 full-length movies per second.

---

### Difference 4: TPU Pods (The Supercomputer)

**The 10-year-old version:**

One TPU chip is fast. But to train GPT-4 or Gemini, one chip isn't enough — you need thousands working together. A **TPU pod** is like connecting thousands of LEGO factories with super-fast highways so they can build one giant LEGO city together.

**The technical version:**

A TPU pod is a cluster of TPU chips connected via high-speed custom interconnects (ICI — Inter-Chip Interconnect), enabling them to function as a single massive accelerator.

```
  TPU Pod Architecture
  ────────────────────

  Single TPU chip:          One systolic array + HBM
  Single TPU board:         4 chips connected via ICI
  Single TPU host:          1 board + 1 CPU host
  TPU pod slice:            Multiple hosts in a rack
  Full TPU pod:             Thousands of chips in a datacenter

  ┌────────────────────────────────────────────────────┐
  │  TPU v4 Pod                                        │
  │                                                    │
  │  ┌──────┐  ICI  ┌──────┐  ICI  ┌──────┐          │
  │  │ Chip │◄─────►│ Chip │◄─────►│ Chip │  ...      │
  │  │  1   │       │  2   │       │  3   │          │
  │  └──┬───┘       └──┬───┘       └──┬───┘          │
  │     │ICI           │ICI           │ICI            │
  │  ┌──┴───┐       ┌──┴───┐       ┌──┴───┐          │
  │  │ Chip │◄─────►│ Chip │◄─────►│ Chip │  ...      │
  │  │  4   │       │  5   │       │  6   │          │
  │  └──────┘       └──────┘       └──────┘          │
  │     .               .               .             │
  │     .               .               .             │
  │                                                    │
  │  Up to 4,096 chips in a v4 pod                    │
  │  Connected in a 3D torus topology                 │
  └────────────────────────────────────────────────────┘

  3D Torus: every chip connects to 6 neighbors
  (up/down, left/right, front/back)
  Any chip can talk to any other chip in very few hops.
```

| TPU Version | Chips per Pod | Peak PFLOPS (BF16) | HBM per Chip | Year |
|-------------|---------------|---------------------|--------------|------|
| TPU v2 | 512 | ~11.5 | 16 GB (HBM) | 2017 |
| TPU v3 | 1,024 | ~100+ | 32 GB (HBM2) | 2018 |
| TPU v4 | 4,096 | ~1,100+ | 32 GB (HBM2e) | 2022 |
| TPU v5e | 256 | ~100 | 16 GB (HBM) | 2023 |
| TPU v5p | 8,960 | ~4,600+ | 95 GB (HBM) | 2023 |

---

## 1.4 TPU vs GPU — When to Use Which?

```
  ┌──────────────────────────────────────────────────────────┐
  │              Choose Your Hardware                        │
  ├────────────────────┬────────────────────┬────────────────┤
  │     TPU            │     GPU            │     CPU        │
  ├────────────────────┼────────────────────┼────────────────┤
  │ Large-scale        │ General deep       │ Data preproc-  │
  │ training           │ learning           │ essing         │
  │                    │                    │                │
  │ Google Cloud only  │ Any cloud /        │ Everywhere     │
  │                    │ on-premise         │                │
  │                    │                    │                │
  │ JAX / TensorFlow   │ PyTorch / TF /     │ Scikit-learn   │
  │ best support       │ JAX all work       │ Pandas/NumPy   │
  │                    │                    │                │
  │ BF16 native        │ BF16 on A100+      │ FP32/FP64      │
  │                    │                    │                │
  │ Best for:          │ Best for:          │ Best for:      │
  │  - Transformer     │  - Custom models   │  - Classical   │
  │    training        │  - Research        │    ML          │
  │  - LLM training    │  - Gaming/render   │  - Small data  │
  │  - Batch inference │  - Multi-framework │  - Feature eng │
  └────────────────────┴────────────────────┴────────────────┘
```

| Factor | TPU Wins | GPU Wins |
|--------|----------|----------|
| Cost efficiency for large models | Yes — Google subsidizes for Cloud users | — |
| Framework flexibility | — | Yes — PyTorch dominates research |
| Availability | Google Cloud only | Everywhere (AWS, Azure, on-prem) |
| Custom/non-standard ops | — | Yes — CUDA ecosystem is massive |
| Scaling to 1000+ chips | Yes — ICI interconnect is purpose-built | Requires InfiniBand (expensive) |
| BF16/Int8 native | Yes — built for this | A100+ (added later) |

---

# SECTION 2: JAX — FUNCTIONAL ML AT GOOGLE

---

## 2.1 The Simple Explanation

### The Magic Wand Analogy

Imagine you write a recipe for chocolate cake on a piece of paper. Now imagine you have four magic wands:

1. **Speed Wand (jit):** Wave it over your recipe and the cake bakes 10x faster — the wand pre-figures-out every step so there's no hesitation.

2. **Clone Wand (vmap):** Wave it and suddenly your recipe works on 100 cakes at once — without you having to rewrite anything. One recipe, any batch size.

3. **Army Wand (pmap):** Wave it and your recipe splits across 8 kitchens, each baking part of the order — all working in parallel, all sharing results at the end.

4. **Reverse Wand (grad):** Wave it and you magically learn "if I add more sugar, how much sweeter does the cake get?" — it computes the exact relationship between every input and every output.

**JAX** gives you these four magic wands for math functions. You write a normal Python function, then transform it with `jit`, `vmap`, `pmap`, or `grad`.

```
  ┌──────────────────────────────────────────────────────┐
  │  JAX = NumPy + Magic Wands                           │
  │                                                      │
  │  import jax                                          │
  │  import jax.numpy as jnp     ← works like NumPy     │
  │                                                      │
  │  def f(x):                                           │
  │      return jnp.sin(x) ** 2 + jnp.cos(x) ** 2       │
  │                                                      │
  │  fast_f   = jax.jit(f)      ← Speed Wand            │
  │  batch_f  = jax.vmap(f)     ← Clone Wand            │
  │  multi_f  = jax.pmap(f)     ← Army Wand             │
  │  grad_f   = jax.grad(f)     ← Reverse Wand          │
  └──────────────────────────────────────────────────────┘
```

---

## 2.2 Official Definition

> **JAX** is a Python library developed by Google Research for high-performance
> numerical computing and machine learning. It provides composable function
> transformations — `jit` (just-in-time compilation), `grad` (automatic
> differentiation), `vmap` (automatic vectorization), and `pmap` (parallel
> mapping across devices) — over a NumPy-compatible API. JAX programs compile
> to XLA (Accelerated Linear Algebra) for execution on CPUs, GPUs, and TPUs.

JAX is increasingly the preferred framework at **Google Research** and **Google DeepMind**. Major projects like Gemini, AlphaFold, and PaLM were trained using JAX.

---

## 2.3 The Four Transformations — Deep Dive

### Transformation 1: `jit` — Just-In-Time Compilation

**What it does:** Takes your Python function, traces it, and compiles it to optimized machine code (via XLA) that runs directly on the hardware.

**Why it matters:** Normal Python is slow because it interprets one line at a time. `jit` looks at the whole function at once and optimizes everything — removes unnecessary steps, fuses operations, optimizes memory layout.

```
  Without jit (Python interpreter):
  ─────────────────────────────────
  Line 1: read → interpret → execute → store result
  Line 2: read → interpret → execute → store result
  Line 3: read → interpret → execute → store result
  (each line has overhead)

  With jit (compiled by XLA):
  ────────────────────────────
  All lines → analyze → optimize → compile once → RUN FAST
  (one-time compile cost, then blazing fast on every call)
```

**Code example:**

```python
import jax
import jax.numpy as jnp

def slow_function(x):
    """Runs in normal Python — interpreted line by line."""
    y = jnp.sin(x)
    z = jnp.cos(x)
    return y * y + z * z

fast_function = jax.jit(slow_function)   # compile it!

x = jnp.ones(1000000)
# First call: slow (compiling)
# Every call after: 10-100x faster
result = fast_function(x)
```

**Key rule:** `jit` traces your function with abstract values. This means:
- No Python `if/else` that depends on array VALUES (only shapes/dtypes)
- No Python `for` loops over data (use `jax.lax.scan` instead)
- Think of it as: `jit` needs to know the road map before driving

---

### Transformation 2: `vmap` — Automatic Vectorization

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
  │  x₁ → f → y₁       │
  │  x₂ → f → y₂       │    All computed in ONE vectorized
  │  x₃ → f → y₃       │    operation on the hardware.
  │  ...                 │    No Python loop!
  │  xₙ → f → yₙ       │
  └─────────────────────┘

  vmap doesn't loop — it rewrites the function to process
  all items simultaneously using vector instructions.
```

---

### Transformation 3: `pmap` — Parallel Mapping Across Devices

**What it does:** Takes a function and runs it on MULTIPLE devices (TPUs, GPUs) at the same time, automatically splitting the data and combining the results.

**Why it matters:** Distributed training usually requires hundreds of lines of boilerplate code. `pmap` does it in one line.

```
  pmap Visualized
  ────────────────

  You have 4 TPU chips. You have 1000 data points.

  pmap automatically:
  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │  TPU 0     │  │  TPU 1     │  │  TPU 2     │  │  TPU 3     │
  │            │  │            │  │            │  │            │
  │ data[0:250]│  │data[250:500│  │data[500:750│  │data[750:   │
  │            │  │           ]│  │           ]│  │       1000]│
  │  compute   │  │  compute   │  │  compute   │  │  compute   │
  │  result_0  │  │  result_1  │  │  result_2  │  │  result_3  │
  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
        │               │               │               │
        └───────────────┴───────────────┴───────────────┘
                              │
                      combined result
```

**Code example:**

```python
import jax

# Train on 8 TPUs in parallel — ONE line change
@jax.pmap
def train_step(params, batch):
    loss, grads = jax.value_and_grad(loss_fn)(params, batch)
    # Average gradients across all devices
    grads = jax.lax.pmean(grads, axis_name='devices')
    return update_params(params, grads), loss

# Data is split across devices automatically
# Results are gathered automatically
```

---

### Transformation 4: `grad` — Automatic Differentiation

**What it does:** Takes any function and returns a NEW function that computes the gradient (derivative) of the original. This is the heart of how neural networks learn.

**Why it matters:** In deep learning, we need to compute "how much does changing each weight affect the loss?" for millions of weights. Writing derivatives by hand would be impossible. `grad` does it automatically for ANY function.

```
  grad Visualized
  ────────────────

  You have:   f(x) = x²

  Math says:  f'(x) = 2x     (the derivative)

  JAX does:   grad_f = jax.grad(f)
              grad_f(3.0) → 6.0     ✓  (2 × 3 = 6)

  This works for ANY function, no matter how complex:

  def messy_function(x):
      y = jnp.sin(x ** 2)
      z = jnp.log(y + 1) * jnp.tanh(x)
      return z.sum()

  gradient_fn = jax.grad(messy_function)
  # JAX automatically figures out the chain rule!
```

**Composability — the real power:**

The magic of JAX is that transformations **compose**. You can stack them:

```python
# Gradient of a function
jax.grad(f)

# JIT-compiled gradient
jax.jit(jax.grad(f))

# JIT-compiled gradient, batched over examples
jax.jit(jax.vmap(jax.grad(f)))

# All of the above, across 8 TPUs
jax.pmap(jax.jit(jax.vmap(jax.grad(f))))
```

```
  Composability Diagram
  ──────────────────────

  f(x) ──► grad ──► vmap ──► jit ──► pmap
           │        │        │        │
           │        │        │        └─ runs on 8 TPUs
           │        │        └─ compiled to fast XLA code
           │        └─ batched over 1000 examples
           └─ computes gradients automatically

  You write ONE function. JAX transforms it into a distributed,
  batched, compiled, differentiable program.
```

---

## 2.4 JAX Ecosystem — Libraries Built on JAX

JAX itself is a low-level library. The community and Google have built higher-level tools on top:

```
  ┌──────────────────────────────────────────────────────┐
  │                     JAX Ecosystem                    │
  │                                                      │
  │   Your Model Code                                    │
  │        │                                             │
  │   ┌────┴─────────────────────────────────────┐       │
  │   │  Flax / NNX     — neural network layers  │       │
  │   │  Optax          — optimizers (Adam, SGD)  │       │
  │   │  Orbax          — checkpointing           │       │
  │   │  CLU            — data loading             │       │
  │   │  T5X / MaxText  — LLM training frameworks │       │
  │   └────┬─────────────────────────────────────┘       │
  │        │                                             │
  │   ┌────┴──────────┐                                  │
  │   │   JAX Core    │  jit, vmap, pmap, grad           │
  │   └────┬──────────┘                                  │
  │        │                                             │
  │   ┌────┴──────────┐                                  │
  │   │    XLA        │  Accelerated Linear Algebra      │
  │   └────┬──────────┘  (the compiler)                  │
  │        │                                             │
  │   ┌────┴──────────┐                                  │
  │   │ TPU / GPU /CPU│  Hardware                        │
  │   └───────────────┘                                  │
  └──────────────────────────────────────────────────────┘
```

| Library | Purpose | Analogy |
|---------|---------|---------|
| **Flax / NNX** | Define neural network layers | Like PyTorch's `nn.Module` |
| **Optax** | Optimizers and learning rate schedules | Like `torch.optim` |
| **Orbax** | Save and load model checkpoints | Like `torch.save/load` |
| **T5X** | Train sequence-to-sequence models | Like HuggingFace Trainer |
| **MaxText** | Train LLMs on TPU pods | Google's internal LLM framework |
| **Pax** | Large-scale model training (PaLM) | Predecessor to MaxText |

---

## 2.5 Key JAX Concepts to Remember

**JAX is functional.** Unlike PyTorch (which uses classes and mutable state), JAX favors pure functions:

```
  PyTorch style (stateful — model carries its own weights):
  ──────────────────────────────────────────────────────────
  model = MyNetwork()           # weights live INSIDE model
  output = model(input)         # model mutates internal state
  loss.backward()               # gradients stored inside model
  optimizer.step()              # weights updated in-place

  JAX style (functional — weights are passed around explicitly):
  ──────────────────────────────────────────────────────────
  params = init_network(key)    # weights are just a dict
  output = apply(params, input) # params passed in, nothing mutated
  grads = jax.grad(loss)(params)# gradients are a new dict
  params = update(params, grads)# new params = old params + update
```

**Why functional matters:**
- Pure functions have no side effects → easier to reason about
- No hidden state → `jit`, `vmap`, `pmap` can safely transform them
- Immutable data → safer distributed computing (no race conditions)

---

# SECTION 3: TENSORFLOW & KERAS

---

## 3.1 The Simple Explanation

**TensorFlow** is Google's original ML framework, like a big workshop with every tool you could ever need. **Keras** is the simple instruction manual that makes using that workshop easy.

Think of it this way: TensorFlow is like a professional kitchen with every appliance — industrial ovens, blast chillers, sous vide machines. You CAN make amazing food, but it's complicated. Keras is like a simple cookbook that says "Step 1, Step 2, Step 3, Done!" — it uses all those fancy appliances behind the scenes, but you don't need to know how they work.

```
  ┌─────────────────────────────────────────────────┐
  │  TensorFlow Ecosystem                           │
  │                                                 │
  │  ┌───────────────────────────────┐              │
  │  │  Keras (High-level API)      │  ← Start here│
  │  │  model.fit(), model.predict()│              │
  │  └───────────────┬───────────────┘              │
  │                  │                              │
  │  ┌───────────────┴───────────────┐              │
  │  │  TensorFlow Core             │              │
  │  │  tf.function, tf.data,       │              │
  │  │  tf.distribute, SavedModel   │              │
  │  └───────────────┬───────────────┘              │
  │                  │                              │
  │  ┌───────────────┴───────────────┐              │
  │  │  XLA Compiler / Hardware     │              │
  │  │  CPU, GPU, TPU               │              │
  │  └───────────────────────────────┘              │
  └─────────────────────────────────────────────────┘
```

---

## 3.2 Official Definition

> **TensorFlow** is an open-source platform for machine learning developed by
> the Google Brain team. It provides a comprehensive ecosystem of tools,
> libraries, and community resources for building and deploying ML models
> at scale. Keras is TensorFlow's high-level API for building and training
> neural networks with a focus on user-friendliness and fast prototyping.

---

## 3.3 TensorFlow/Keras — Key Concepts

### Keras: Build a Model in 5 Lines

```python
import tensorflow as tf

# Define the model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu'),    # hidden layer
    tf.keras.layers.Dense(64, activation='relu'),     # hidden layer
    tf.keras.layers.Dense(10, activation='softmax')   # output (10 classes)
])

# Compile — set the optimizer, loss, and metric
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Train — one line!
model.fit(train_data, train_labels, epochs=10, validation_split=0.2)

# Predict
predictions = model.predict(test_data)
```

### tf.data — Efficient Data Pipelines

```python
# Build an input pipeline that loads, shuffles, batches, and prefetches
dataset = tf.data.Dataset.from_tensor_slices((features, labels))
dataset = dataset.shuffle(10000)         # randomize order
dataset = dataset.batch(32)              # group into batches of 32
dataset = dataset.prefetch(tf.data.AUTOTUNE)  # load next batch while training

# This pipeline runs in parallel with training — GPU never waits for data!
```

### SavedModel — Package and Deploy

```python
# Save entire model (architecture + weights + optimizer state)
model.save('my_model')

# Load it anywhere — different machine, different language, even a phone
loaded_model = tf.keras.models.load_model('my_model')

# Convert to TFLite for mobile/edge devices
converter = tf.lite.TFLiteConverter.from_saved_model('my_model')
tflite_model = converter.convert()
```

---

## 3.4 TensorFlow vs JAX vs PyTorch — When to Use Which

```
  ┌────────────────────────────────────────────────────────────┐
  │         Framework Decision Guide                           │
  ├──────────────┬──────────────┬──────────────┬──────────────┤
  │              │ TensorFlow/  │    JAX       │   PyTorch    │
  │              │ Keras        │              │              │
  ├──────────────┼──────────────┼──────────────┼──────────────┤
  │ Primary user │ Production   │ Google       │ Academic     │
  │              │ engineers    │ Research /   │ researchers  │
  │              │              │ DeepMind     │              │
  ├──────────────┼──────────────┼──────────────┼──────────────┤
  │ Strengths    │ Deployment   │ Functional   │ Flexibility  │
  │              │ ecosystem    │ transforms,  │ ease of use, │
  │              │ (TFServing,  │ TPU scaling, │ community    │
  │              │ TFLite)      │ composability│              │
  ├──────────────┼──────────────┼──────────────┼──────────────┤
  │ TPU support  │ Good         │ Best         │ Improving    │
  │              │              │ (native)     │ (via XLA)    │
  ├──────────────┼──────────────┼──────────────┼──────────────┤
  │ Learning     │ Low (Keras)  │ Medium-High  │ Low-Medium   │
  │ curve        │              │              │              │
  ├──────────────┼──────────────┼──────────────┼──────────────┤
  │ Used for     │ Gmail spam,  │ Gemini,      │ ChatGPT,     │
  │              │ Google Ads,  │ AlphaFold,   │ Stable       │
  │              │ YouTube recs │ PaLM         │ Diffusion    │
  └──────────────┴──────────────┴──────────────┴──────────────┘
```

**Inside Google specifically:**
- **TensorFlow/Keras** — still powers most production services (Search, Ads, Gmail, YouTube). The deployment ecosystem (TF Serving, TFX pipelines) is deeply integrated.
- **JAX** — the tool of choice for large-scale research (Gemini, PaLM, AlphaFold). If you're training a massive model from scratch on TPU pods, JAX is the way.
- Both coexist — TF for production serving, JAX for research and training. Many teams use JAX to train, then convert to TF SavedModel to serve.

---

# SECTION 4: VERTEX AI — GOOGLE'S ML PLATFORM

---

## 4.1 The Simple Explanation

### The Restaurant Kitchen Analogy

Building ML models is like cooking a meal. But in a big company, you're not just cooking one meal — you're running a whole restaurant. You need:

1. **Fresh ingredients** organized and ready (Feature Store)
2. **Recipes** that run the same way every time (Pipelines)
3. **A serving window** where waiters pick up finished plates (Endpoints)
4. **Quality checks** to make sure the food tastes right (Model Monitoring)
5. **A menu board** tracking all your dishes (Model Registry)

**Vertex AI** is Google Cloud's complete restaurant management system for ML. It handles everything from organizing your data to serving predictions to millions of users.

```
  ┌──────────────────────────────────────────────────────────┐
  │                    VERTEX AI PLATFORM                    │
  │                                                          │
  │   DATA              BUILD             DEPLOY             │
  │   ────              ─────             ──────             │
  │   Feature     →    Training     →    Model        →     │
  │   Store            Jobs              Registry            │
  │                                                          │
  │   Datasets    →    Pipelines    →    Endpoints     →     │
  │                                                          │
  │   Labeling    →    AutoML /     →    Batch         →     │
  │   Service          Custom            Prediction          │
  │                    Training                              │
  │                                                          │
  │   ──────────────────────────────────────────────────     │
  │   MONITOR: Model Monitoring, Explainability, Logging     │
  └──────────────────────────────────────────────────────────┘
```

---

## 4.2 Official Definition

> **Vertex AI** is Google Cloud's unified machine learning platform that
> provides tools and infrastructure for the entire ML lifecycle — from
> data preparation and feature engineering, through model training and
> evaluation, to deployment, serving, and monitoring in production.

---

## 4.3 Vertex AI — Core Concepts Deep Dive

### Concept 1: Pipelines

**The 10-year-old version:**

A pipeline is like a set of dominoes. You set them up once, and then you knock over the first one — all the rest fall automatically in order. In ML, the dominoes are steps like "load data → clean data → train model → test model → deploy model."

**The technical version:**

A Vertex AI Pipeline is a directed acyclic graph (DAG) of containerized steps that automate and orchestrate ML workflows. Built on Kubeflow Pipelines or TFX, each step runs in its own container, making the pipeline reproducible and portable.

```
  ML Pipeline Example
  ────────────────────

  ┌──────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐
  │  Ingest  │───►│ Transform │───►│   Train   │───►│ Evaluate │
  │  Data    │    │   Data    │    │   Model   │    │  Model   │
  └──────────┘    └───────────┘    └───────────┘    └────┬─────┘
                                                         │
                                               accuracy > 0.95?
                                                    │         │
                                                   YES        NO
                                                    │         │
                                               ┌────┴─────┐   │
                                               │  Deploy  │   ├──► alert team
                                               │  to      │   │    & retrain
                                               │ Endpoint │   │
                                               └──────────┘   │

  Each box is a separate container.
  The pipeline can be scheduled to run daily/weekly.
  If the model isn't good enough, it doesn't get deployed.
```

**Why pipelines matter:**
- **Reproducibility** — same pipeline, same result every time
- **Automation** — retrain models on new data without human intervention
- **Versioning** — every run is tracked with its inputs, outputs, and parameters
- **Collaboration** — team members build different steps independently

```python
# Vertex AI Pipeline example (simplified)
from kfp.v2 import dsl

@dsl.pipeline(name='my-training-pipeline')
def training_pipeline(dataset_uri: str, epochs: int = 10):

    # Step 1: Load and preprocess data
    preprocess_task = preprocess_component(dataset_uri=dataset_uri)

    # Step 2: Train model (depends on step 1)
    train_task = train_component(
        data=preprocess_task.outputs['processed_data'],
        epochs=epochs
    )

    # Step 3: Evaluate (depends on step 2)
    eval_task = evaluate_component(
        model=train_task.outputs['model'],
        test_data=preprocess_task.outputs['test_data']
    )

    # Step 4: Deploy only if accuracy is high enough
    with dsl.Condition(eval_task.outputs['accuracy'] > 0.95):
        deploy_component(model=train_task.outputs['model'])
```

---

### Concept 2: Feature Store

**The 10-year-old version:**

Imagine you have a giant organized toy box where every toy has a label, and you always know exactly where to find it. A Feature Store is like that — but for data facts about your users, products, or whatever your ML model needs.

Without a Feature Store, every team computes the same facts (like "how many times did this user click last week?") independently. With a Feature Store, you compute it ONCE and everyone shares it.

**The technical version:**

A Feature Store is a centralized repository for storing, managing, and serving ML features. It provides:
- **Consistent features** between training and serving (avoiding training-serving skew)
- **Point-in-time correctness** for historical training data
- **Low-latency serving** for real-time predictions

```
  Feature Store Architecture
  ──────────────────────────

  ┌─────────────────────────────────────────────────────────┐
  │                   Feature Store                         │
  │                                                         │
  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
  │  │ Entity Type: │  │ Entity Type:  │  │ Entity Type: │  │
  │  │   User       │  │   Product     │  │   Session    │  │
  │  ├─────────────┤  ├──────────────┤  ├──────────────┤  │
  │  │ user_id     │  │ product_id   │  │ session_id   │  │
  │  │ age         │  │ price        │  │ page_views   │  │
  │  │ click_rate  │  │ category     │  │ duration     │  │
  │  │ last_login  │  │ avg_rating   │  │ cart_value   │  │
  │  │ ltv_score   │  │ stock_count  │  │ device_type  │  │
  │  └─────────────┘  └──────────────┘  └──────────────┘  │
  │                                                         │
  │  Write Path (batch/streaming):                          │
  │    BigQuery / Dataflow → Feature Store                  │
  │                                                         │
  │  Read Path:                                             │
  │    Training: batch read historical features             │
  │    Serving:  low-latency online lookup (< 10ms)         │
  └─────────────────────────────────────────────────────────┘
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

  Same feature, same computation, same result. Always. ✓
```

---

### Concept 3: Endpoints

**The 10-year-old version:**

An endpoint is like a drive-through window. You pull up, say your order (send data), and get your food (prediction) back. You don't need to know what's happening in the kitchen — you just talk to the window.

**The technical version:**

A Vertex AI Endpoint is a deployed model resource that serves online (real-time) predictions via a REST API or gRPC. It handles scaling, load balancing, and versioning automatically.

```
  Endpoint Architecture
  ──────────────────────

  Client Request                          Vertex AI Endpoint
  ─────────────────                       ──────────────────

  POST /predict                    ┌──────────────────────────┐
  {                                │      Load Balancer       │
    "instances": [                 └──────────┬───────────────┘
      {"age": 25,                             │
       "clicks": 12,              ┌───────────┼───────────────┐
       "device": "mobile"}        │           │               │
    ]                           ┌─┴──┐     ┌──┴─┐         ┌──┴─┐
  }                             │ v2 │     │ v2 │         │ v2 │
                                │90% │     │90% │         │90% │
          ──────────►           ├────┤     ├────┤         ├────┤
                                │ v3 │     │ v3 │         │ v3 │
          ◄──────────           │10% │     │10% │         │10% │
                                └────┘     └────┘         └────┘
  Response:                     Replica 1  Replica 2      Replica 3
  {
    "predictions": [            Traffic split: 90% to model v2
      {"will_purchase": 0.87}                 10% to model v3 (canary)
    ]
  }
```

**Key features of Vertex AI Endpoints:**
- **Auto-scaling:** Spins up more replicas when traffic increases, scales down when idle
- **Traffic splitting:** Route a percentage of traffic to a new model version (canary deployment)
- **A/B testing:** Run multiple model versions simultaneously and compare performance
- **Monitoring:** Track prediction latency, error rates, and feature drift

---

### Concept 4: Model Registry

The Model Registry is a version-controlled catalog of all your trained models. Think of it like a library card catalog — every model is recorded with its metadata, metrics, lineage, and deployment status.

```
  Model Registry
  ──────────────

  ┌──────────────────────────────────────────────────────┐
  │  Model: "click-prediction-v3"                        │
  │  ────────────────────────────────────────────────     │
  │  Version:    3.2.1                                   │
  │  Framework:  TensorFlow 2.15                         │
  │  Created:    2026-03-15                              │
  │  Accuracy:   0.943                                   │
  │  AUC:        0.971                                   │
  │  Training:   Pipeline run #847                       │
  │  Dataset:    gs://my-bucket/data/march-2026/         │
  │  Status:     DEPLOYED (endpoint: prod-click-model)   │
  │  Labels:     team=ads, use_case=ctr_prediction       │
  └──────────────────────────────────────────────────────┘
```

---

## 4.4 Vertex AI — Complete Platform Overview

| Component | What It Does | Analogy |
|-----------|-------------|---------|
| **Datasets** | Manage labeled/unlabeled training data | Your ingredient pantry |
| **Feature Store** | Centralized feature storage & serving | Organized spice rack |
| **Labeling Service** | Human labeling of training data | Taste testers |
| **AutoML** | Train models with no code | Instant ramen (easy!) |
| **Custom Training** | Train with your own code on managed infra | Full recipe from scratch |
| **Pipelines** | Orchestrate multi-step ML workflows | Assembly line |
| **Model Registry** | Version and track all trained models | Library catalog |
| **Endpoints** | Serve real-time predictions | Drive-through window |
| **Batch Prediction** | Serve predictions on large datasets offline | Catering (bulk orders) |
| **Model Monitoring** | Detect drift, skew, and anomalies | Health inspector |
| **Explainability** | Understand why the model made a prediction | "Why did you give me this?" |

---

# SECTION 5: KEY GOOGLE RESEARCH PAPERS

---

## 5.1 Why These Papers Matter

Google has published some of the most influential papers in modern ML. Understanding these papers helps you understand why the tools above exist and how they work. Here's each paper explained simply, then formally.

```
  Timeline of Key Google Papers
  ─────────────────────────────

  2016 ─── Wide & Deep Learning (Google Play recommendations)
    │
  2016 ─── YouTube DNN Paper (deep neural nets for recommendations)
    │
  2017 ─── Attention Is All You Need ★ (the Transformer)
    │
  2018 ─── BERT (bidirectional pre-training)
    │
  2019 ─── T5 (text-to-text transfer)
    │
  2020 ─── Scaling Laws (how models improve with scale)
    │
  2022 ─── PaLM (Pathways Language Model, 540B params)
    │
  2023 ─── Gemini (multimodal, natively trained on text+image+audio+code)
```

---

### Paper 1: "Attention Is All You Need" (2017)

**The 10-year-old version:**

Before this paper, AI read sentences like you read a book on a bumpy bus — one word at a time, trying to remember the beginning by the time you reach the end. The **Transformer** lets AI read the entire page at once, and draw lines between any words that are related — even if they're far apart.

```
  Old way (RNN — reading one word at a time):
  ───────────────────────────────────────────

  "The cat that I saw yesterday at the park was fluffy"

   The → cat → that → I → saw → yesterday → at → the → park → was → fluffy
   ──►   ──►   ──►  ──►  ──►    ──►        ──►  ──►   ──►   ──►   ──►
   (by the time we reach "fluffy", we've nearly forgotten "cat")

  New way (Transformer — looking at all words at once):
  ─────────────────────────────────────────────────────

  "The cat that I saw yesterday at the park was fluffy"

   The ←─────────────────────────────────────→ cat
    ↕         ↕        ↕                ↕       ↕
  that       saw    yesterday          park   fluffy
                                                ↕
   Direct connection: "cat" ←→ "fluffy" (strong attention!)
   The model instantly sees that fluffy describes the cat.
```

**Official definition:**

> The paper introduced the **Transformer architecture**, which replaces
> recurrent and convolutional layers with **self-attention** mechanisms.
> Self-attention computes a weighted relationship between every pair of
> positions in a sequence, enabling parallelization and capturing
> long-range dependencies. The Transformer uses multi-head attention,
> positional encodings, and an encoder-decoder structure.

**Key innovation:** Self-attention computes `Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V`

**Impact:** Every modern LLM (GPT, Claude, Gemini, LLaMA) is built on this architecture.

---

### Paper 2: "BERT" — Bidirectional Encoder Representations from Transformers (2018)

**The 10-year-old version:**

Imagine you're trying to guess a missing word in a sentence:

"I went to the _____ and bought milk."

You'd look at the words BEFORE ("went to the") AND AFTER ("and bought milk") to guess "store." That's what BERT does — it looks in both directions. Before BERT, models could only look in one direction (like covering one eye).

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

**Official definition:**

> BERT is a pre-trained language model based on the Transformer encoder.
> It introduces **Masked Language Modeling (MLM)** — randomly masking 15%
> of input tokens and training the model to predict them using bidirectional
> context. BERT also uses **Next Sentence Prediction (NSP)** to learn
> relationships between sentence pairs. Fine-tuned BERT set new benchmarks
> on 11 NLP tasks upon release.

**Key innovation:** Bidirectional pre-training with masking, rather than left-to-right generation.

**Impact:** Revolutionized NLP — Google Search started using BERT in 2019 to better understand queries.

---

### Paper 3: "T5" — Text-to-Text Transfer Transformer (2019)

**The 10-year-old version:**

What if EVERY task in language was just "turn this text into other text"?

- Translation: "translate English to French: Hello" → "Bonjour"
- Summarization: "summarize: [long article]" → "short version"
- Question answering: "question: What is 2+2?" → "4"
- Sentiment: "classify: I love this movie" → "positive"

T5 says: don't build different models for each task. Build ONE model that takes text in and puts text out. Just change the instructions at the beginning.

```
  T5: Everything is Text-to-Text
  ───────────────────────────────

  ┌─────────────────────────────┐         ┌──────────────────┐
  │ INPUT (always text)         │         │ OUTPUT (text too!)│
  ├─────────────────────────────┤         ├──────────────────┤
  │ "translate to French: Hi"   │  ──►    │ "Salut"          │
  │ "summarize: [long text...]" │  ──►    │ "Short summary"  │
  │ "classify: Great movie!"    │  ──►    │ "positive"       │
  │ "question: Capital of UK?"  │  ──►    │ "London"         │
  │ "grade sentence: Bad grmmr" │  ──►    │ "Bad grammar"    │
  └─────────────────────────────┘         └──────────────────┘

  Same model, same architecture, same training process.
  Only the text prefix changes!
```

**Official definition:**

> T5 (Text-to-Text Transfer Transformer) reframes every NLP task as a
> text-to-text problem — both inputs and outputs are text strings. The
> paper provides a systematic study of transfer learning techniques,
> pre-training objectives, model architectures, and dataset sizes using
> the C4 (Colossal Clean Crawled Corpus) dataset. T5 demonstrated that
> a unified text-to-text framework achieves state-of-the-art results
> across diverse benchmarks.

**Key innovation:** Unified framing — one model, one format, many tasks.

**Impact:** Directly inspired modern instruction-following LLMs and Google's Flan-T5 models.

---

### Paper 4: "PaLM" and "Gemini" — Google's Frontier Models

**The 10-year-old version:**

If the Transformer paper was the blueprint for a car engine, PaLM is a massive truck built with that engine, and Gemini is a flying car that understands pictures, sound, and video too — not just text.

**PaLM (2022):**

```
  PaLM — Pathways Language Model
  ───────────────────────────────

  Size:       540 billion parameters
  Training:   6,144 TPU v4 chips (two full pods!)
  Trained on: 780 billion tokens (web, books, code, math)

  Key breakthrough: "emergent abilities"
  ─────────────────────────────────────
  At small scale:  model can't do multi-step reasoning
  At PaLM scale:   suddenly CAN do multi-step reasoning!

  Example (chain-of-thought reasoning):
  Q: "Roger has 5 tennis balls. He buys 2 cans of 3 balls each.
      How many does he have now?"
  A: "Roger started with 5. He bought 2 × 3 = 6. Total = 5 + 6 = 11."
  (PaLM does this without being explicitly trained on math steps!)
```

**Gemini (2023):**

```
  Gemini — Natively Multimodal
  ─────────────────────────────

  Previous approach:           Gemini approach:
  ┌────────┐  ┌────────┐      ┌───────────────────────┐
  │ Text   │  │ Image  │      │                       │
  │ Model  │  │ Model  │      │   ONE model that      │
  └───┬────┘  └───┬────┘      │   understands text,   │
      │           │           │   images, audio, video│
      └─────┬─────┘           │   and code NATIVELY   │
            │                 │                       │
      ┌─────┴─────┐           │   Trained on all      │
      │ Glue them │           │   modalities from     │
      │ together  │           │   the start           │
      └───────────┘           └───────────────────────┘
      (separate training,      (joint training,
       bolted on later)         deeply integrated)
```

| Model | Params | Modalities | Year | Key Feature |
|-------|--------|-----------|------|-------------|
| PaLM | 540B | Text, Code | 2022 | Emergent reasoning at scale |
| PaLM 2 | Undisclosed | Text, Code, Math | 2023 | Improved multilingual, reasoning |
| Gemini 1.0 | Undisclosed | Text, Image, Audio, Video, Code | 2023 | Natively multimodal |
| Gemini 1.5 | Undisclosed | All + Long context (1M tokens) | 2024 | Million-token context window |

---

### Paper 5: "Wide & Deep Learning" — Recommendations (2016)

**The 10-year-old version:**

When recommending apps on Google Play, you need two things:

1. **Memory (Wide):** "People who downloaded Minecraft also downloaded Roblox." This is simple pattern matching — memorizing specific combinations.

2. **Imagination (Deep):** "This user likes building games with colorful graphics and multiplayer." This is understanding the deeper meaning behind choices.

Wide & Deep combines both — the exact memory of a lookup table AND the creative generalization of a neural network.

```
  Wide & Deep Architecture
  ─────────────────────────

  Input Features
  (user info, app info, context)
        │
        ├──────────────────────────┐
        │                          │
        ▼                          ▼
  ┌──────────────┐          ┌──────────────┐
  │   WIDE       │          │    DEEP      │
  │   Component  │          │    Component │
  │              │          │              │
  │ Cross-product│          │ Dense layers │
  │ features     │          │ (embeddings  │
  │ (memorize    │          │  + hidden    │
  │  combos)     │          │  layers)     │
  │              │          │              │
  │ "installed   │          │ learns       │
  │  app X AND   │          │ general      │
  │  searched Y" │          │ patterns     │
  └──────┬───────┘          └──────┬───────┘
         │                         │
         └────────┬────────────────┘
                  │
                  ▼
           ┌──────────┐
           │ Combined │
           │ Output   │
           │ (sigmoid)│
           └──────────┘
           P(download)
```

**Official definition:**

> Wide & Deep Learning jointly trains a wide linear model (for memorization
> of feature cross-products) and a deep neural network (for generalization
> through learned embeddings). The architecture combines the benefits of
> memorization (precise, specific rules) and generalization (broad patterns)
> for recommender systems. Deployed on Google Play, it improved app
> acquisition rate by 3.9% compared to the wide-only model.

---

### Paper 6: "Deep Neural Networks for YouTube Recommendations" (2016)

**The 10-year-old version:**

YouTube has billions of videos. When you open YouTube, it needs to pick 20 videos for your home screen — out of billions — in less than a second. That's like picking 20 books you'd love from every library in the world, in the blink of an eye.

The trick: do it in two steps.

```
  YouTube Recommendation System
  ─────────────────────────────

  STEP 1: Candidate Generation (the funnel)
  ──────────────────────────────────────────

  Billions of videos
        │
        ▼
  ┌──────────────────┐
  │ Neural Network   │   "Which few hundred videos MIGHT
  │ (fast, rough)    │    this user like?"
  │                  │
  │ Uses: watch      │   Fast but imprecise.
  │ history, search  │   Gets it down to ~hundreds.
  │ history, age,    │
  │ gender, location │
  └────────┬─────────┘
           │
     Hundreds of candidates
           │
           ▼

  STEP 2: Ranking (the fine-tuner)
  ────────────────────────────────

  ┌──────────────────┐
  │ Neural Network   │   "Of these few hundred, which 20
  │ (slow, precise)  │    should we actually show?"
  │                  │
  │ Uses: thumbnail  │   Slower but much more accurate.
  │ impressions,     │   Uses richer features.
  │ video age,       │   Produces the final ranked list.
  │ watch time,      │
  │ channel affinity │
  └────────┬─────────┘
           │
      Top 20 videos → shown to user
```

**Official definition:**

> The paper presents a two-stage deep learning architecture for YouTube
> recommendations: (1) a **candidate generation** network that retrieves
> hundreds of candidates from millions of videos using a deep collaborative
> filtering approach, and (2) a **ranking** network that scores candidates
> using a richer set of features. The system handles the extreme scale of
> YouTube (billions of videos, hundreds of millions of users) by treating
> recommendation as an extreme multi-class classification problem.

**Key insights that changed the field:**
- Use **watch time** as the label (not clicks) — optimizes for satisfaction, not clickbait
- Treat the user's history as a sequence — order matters
- The two-stage funnel (retrieve → rank) became the standard architecture for large-scale recommendations

---

### Paper 7: "Scaling Laws" for Neural Language Models

**The 10-year-old version:**

If you practice piano for 1 hour, you get a bit better. For 10 hours, a lot better. For 1,000 hours, really good. But there's a pattern: the improvement from hour 1 to 10 is bigger than from hour 100 to 110.

Scaling laws discovered the same pattern for AI: as you make models bigger, train on more data, and use more compute, they get better in a **predictable, mathematical way**. This means you can calculate in advance how good a model will be — before spending millions training it.

```
  Scaling Laws — The Key Relationships
  ──────────────────────────────────────

  Loss (how wrong the model is) depends on three things:

  1. N = Number of parameters (model size)
  2. D = Dataset size (tokens trained on)
  3. C = Compute budget (FLOPs spent training)

  The relationships follow POWER LAWS:

  Loss ∝ N^(-0.076)    ← more params → lower loss (but diminishing)
  Loss ∝ D^(-0.095)    ← more data → lower loss (but diminishing)
  Loss ∝ C^(-0.050)    ← more compute → lower loss (but diminishing)

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

**Official definition (multiple papers):**

> Scaling laws (Kaplan et al. 2020, Hoffmann et al. 2022 "Chinchilla")
> describe the empirical power-law relationships between model performance
> (cross-entropy loss) and three factors: model parameter count (N),
> training dataset size (D), and compute budget (C). These laws enable
> **compute-optimal training** — given a fixed compute budget, there is an
> optimal trade-off between model size and data size. The Chinchilla paper
> showed that many large models were under-trained relative to their size:
> a smaller model trained on more data can outperform a larger model
> trained on less data.

**The Chinchilla insight:**

```
  Before Chinchilla (2022):
  ─────────────────────────
  "Want a better model? Make it BIGGER!"
  GPT-3: 175B params, 300B tokens    ← 1.7 tokens per param

  After Chinchilla:
  ─────────────────────────
  "Want a better model? Use MORE DATA (not just bigger)!"
  Chinchilla: 70B params, 1.4T tokens  ← 20 tokens per param

  Chinchilla (70B) outperformed Gopher (280B)!
  4x smaller model, trained on ~5x more data.

  The rule of thumb from Chinchilla:
  ┌──────────────────────────────────────────────────┐
  │  Optimal tokens ≈ 20 × number of parameters     │
  │                                                  │
  │  70B model → train on ~1.4 trillion tokens       │
  │  7B model  → train on ~140 billion tokens        │
  └──────────────────────────────────────────────────┘
```

---

# SECTION 6: QUICK REFERENCE

---

## 6.1 TPU Cheat Sheet

```
  ┌──────────────────────────────────────────────────────────┐
  │                   TPU QUICK REFERENCE                    │
  ├──────────────────────────────────────────────────────────┤
  │                                                          │
  │  What: Custom AI chip by Google (ASIC, not general GPU)  │
  │                                                          │
  │  Key hardware:                                           │
  │    • Systolic array — matrix multiply engine             │
  │    • BF16 native — same range as FP32, half the memory   │
  │    • HBM — high bandwidth memory for fast data streaming │
  │    • ICI — inter-chip interconnect for pod scaling        │
  │                                                          │
  │  When to use:                                            │
  │    ✓ Large model training (Transformers, LLMs)           │
  │    ✓ Google Cloud workloads                              │
  │    ✓ JAX or TensorFlow code                              │
  │    ✗ PyTorch-only projects (improving but GPU is easier) │
  │    ✗ Small experiments (just use a GPU)                  │
  │    ✗ Need on-premise hardware (TPUs are cloud-only)      │
  │                                                          │
  │  Access: Google Cloud → Vertex AI → TPU VMs              │
  │          or Google Colab (free TPU v2, limited)           │
  └──────────────────────────────────────────────────────────┘
```

## 6.2 JAX Transformation Cheat Sheet

```
  ┌───────────┬───────────────────────────┬──────────────────────┐
  │ Transform │ What It Does              │ One-liner Example    │
  ├───────────┼───────────────────────────┼──────────────────────┤
  │ jit       │ Compile for speed         │ jax.jit(f)           │
  │ grad      │ Auto-differentiate        │ jax.grad(f)          │
  │ vmap      │ Auto-batch (vectorize)    │ jax.vmap(f)          │
  │ pmap      │ Parallelize across devices│ jax.pmap(f)          │
  ├───────────┼───────────────────────────┼──────────────────────┤
  │ Compose!  │ grad + vmap + jit + pmap  │ All stack together   │
  └───────────┴───────────────────────────┴──────────────────────┘

  Key rule: JAX functions should be PURE (no side effects, no mutation).
```

## 6.3 Vertex AI Cheat Sheet

```
  ┌──────────────────────────────────────────────────────────┐
  │                VERTEX AI QUICK REFERENCE                 │
  ├──────────────────────────────────────────────────────────┤
  │                                                          │
  │  Feature Store → centralized features, no train/serve skew│
  │  Pipelines     → automated, reproducible ML workflows    │
  │  Endpoints     → deploy model, get predictions via API   │
  │  Model Registry→ version control for trained models      │
  │  AutoML        → train models with zero code             │
  │  Monitoring    → detect drift and anomalies in production│
  │                                                          │
  │  Think of it as: GitHub + CI/CD + Docker, but for ML     │
  └──────────────────────────────────────────────────────────┘
```

## 6.4 Key Papers — One-Line Summaries

```
  ┌──────────────────┬────┬───────────────────────────────────────┐
  │ Paper            │Year│ One-line Summary                      │
  ├──────────────────┼────┼───────────────────────────────────────┤
  │ Attention Is All │2017│ Introduced the Transformer — the      │
  │ You Need         │    │ architecture behind ALL modern LLMs   │
  ├──────────────────┼────┼───────────────────────────────────────┤
  │ BERT             │2018│ Bidirectional pre-training; look left │
  │                  │    │ AND right to understand context       │
  ├──────────────────┼────┼───────────────────────────────────────┤
  │ T5               │2019│ Every NLP task = text in, text out    │
  ├──────────────────┼────┼───────────────────────────────────────┤
  │ PaLM / Gemini    │2022│ Scaled Transformers show emergent     │
  │                  │2023│ reasoning; Gemini adds multimodality  │
  ├──────────────────┼────┼───────────────────────────────────────┤
  │ Wide & Deep      │2016│ Combine memorization (wide) and       │
  │                  │    │ generalization (deep) for recommenders│
  ├──────────────────┼────┼───────────────────────────────────────┤
  │ YouTube DNN      │2016│ Two-stage funnel (retrieve then rank) │
  │                  │    │ for billion-scale recommendations     │
  ├──────────────────┼────┼───────────────────────────────────────┤
  │ Scaling Laws     │2020│ Model performance follows predictable │
  │ / Chinchilla     │2022│ power laws; train longer, not just    │
  │                  │    │ bigger (20 tokens per parameter)      │
  └──────────────────┴────┴───────────────────────────────────────┘
```

---

## 6.5 How Everything Connects

```
  ┌─────────────────────────────────────────────────────────────┐
  │            GOOGLE'S ML ECOSYSTEM — THE BIG PICTURE          │
  │                                                             │
  │   RESEARCH                                                  │
  │   (Papers)              FRAMEWORKS           INFRASTRUCTURE │
  │                                                             │
  │   Transformer ─────►    JAX          ──────► TPU Pods       │
  │   BERT        ─────►    TensorFlow   ──────► TPU VMs        │
  │   T5          ─────►    Keras        ──────► Vertex AI      │
  │   PaLM/Gemini ─────►    Flax/Optax   ──────►               │
  │   Scaling Laws                                              │
  │   Wide & Deep                                               │
  │   YouTube DNN                                               │
  │                                                             │
  │   Ideas ──────────► Code ──────────► Hardware & Platform    │
  │                                                             │
  │   "Attention Is      train with       run on TPU pods,      │
  │    All You Need"     JAX/TF           deploy on Vertex AI   │
  │    (the paper)       (the code)       (the infrastructure)  │
  └─────────────────────────────────────────────────────────────┘
```

---

*End of Chapter 19 — Google's ML Ecosystem*
