# Deep Learning & LLMs — Quick Revision

> **Purpose:** This is a fast revision recap of the **Deep Learning & LLMs** section — Ch 16 (Deep Learning), Ch 17 / 17b / 17c (LLMs: how they work, how you use them, how you run them), Ch 18 / 18b (AI Agents, and agents in production), Ch 19 (AI Frameworks) and Ch 20 (the 2026 Landscape). Skim it the night before an interview instead of re-reading the full chapters. Full explanations, worked examples, and diagrams live in the source chapters — treat this as your flashcard deck, not a replacement.

---

## Contents

- [Ch 16 — Deep Learning: Complete Reference](#ch-16--deep-learning-complete-reference)
- [Ch 17 / 17b — Large Language Models](#ch-17--17b--large-language-models)
- [Ch 17c — LLM Systems: Serving, Scaling & Measuring](#ch-17c--llm-systems-serving-scaling--measuring)
- [Ch 18 / 18b — AI Agents & Tool Use](#ch-18--18b--ai-agents--tool-use)
- [Ch 19 — AI Frameworks & Engineering](#ch-19--ai-frameworks--engineering)
- [Ch 20 — The 2026 AI Landscape](#ch-20--the-2026-ai-landscape)
- [One-page cheat recap](#one-page-cheat-recap)

> **The section is now nine chapters.** Ch 17 and Ch 18 were each split so no chapter is a nine-hour read. Full map, the three learning tracks and the L1–L4 depth ladder → [Ch 16](#content/16_deep_learning).

---

## Ch 16 — Deep Learning: Complete Reference

> 💡 **In a sentence —** Deep learning is a toolbox of neural-network architectures and training recipes — backprop + gradient descent + normalization — that share a common structure but differ by what data they process and what structure they exploit.

---

### Part 1: Training Deep Networks

#### Backpropagation

Backprop answers: *"If I change weight W by a tiny amount, how does the total loss change?"*  
It uses the **chain rule** of calculus, multiplying local gradients from the output layer back to the input layer in a single reverse pass.

Key insight: every gradient is computed once and reused by all the weights to its left. Details in [Ch 16 §1.1](#content/16_deep_learning):

- **Computational graph:** frameworks record each op as a node that knows its *local* derivative; `loss.backward()` walks the graph and multiplies. When a value feeds two places the gradients **add** — forgetting that sum is the classic hand-derivation bug.
- **Cost:** all $N$ gradients in one backward pass (backward ≈ 2× forward, so a step ≈ 3 forward passes ≈ 6 FLOPs/param/token) versus $N+1$ forward passes by finite differences. The price is memory: activations stay alive until the backward pass uses them.
- **Gradient check:** $\frac{L(w+\epsilon)-L(w-\epsilon)}{2\epsilon}$ in float64, $\epsilon \approx 10^{-5}$–$10^{-7}$, pass if relative error $< \sim 10^{-6}$. Two forward passes per weight — a debugging tool, never a training method.
- **Vanishing gradients:** the sigmoid slope is ≤ 0.25, so ten sigmoid layers scale the gradient by ≈ $0.25^{10} \approx 10^{-6}$. Cures: ReLU-family activations, residual connections, normalisation, good init, clipping.
- **Dead ReLU:** if a neuron's pre-activation is negative on every example, its output *and* gradient are 0 and the weight never updates again; a leaky or smooth activation lets it recover.

#### Optimizers

| Optimizer | Adapts per weight? | Uses momentum? | Best for |
|-----------|-------------------|----------------|---------|
| SGD | No | No | Simple problems |
| SGD+Momentum | No | Yes | CNNs (well-tuned, matches or beats Adam) |
| AdaGrad | Yes | No | Sparse data, short training |
| RMSProp | Yes (decaying avg) | No | Historically RNNs; superseded by Adam |
| Adam | Yes | Yes | General deep learning |
| AdamW | Yes | Yes | **Transformers, LLMs (standard)** |

**Adam** update ($\beta_1=0.9$, $\beta_2=0.999$, $\alpha=0.001$):

$$m \leftarrow 0.9m + 0.1\nabla w, \quad v \leftarrow 0.999v + 0.001(\nabla w)^2$$

$$w \leftarrow w - 0.001 \cdot \frac{\hat{m}}{\sqrt{\hat{v}} + 10^{-8}}$$

Bias correction: $\hat{m} = m/(1-0.9^t)$, $\hat{v} = v/(1-0.999^t)$.

**AdamW** separates weight decay: $w \leftarrow w - \alpha \frac{\hat{m}}{\sqrt{\hat{v}}+\epsilon} - \alpha\lambda w$. This is correct regularisation for Transformers; plain Adam+L2 underdoes regularisation on frequently-updated weights.

**Bias-correction trap:** at step 1 the *uncorrected* update $m/\sqrt{v}$ is ~3.2× **too large** (peaking ~6.5× around steps 10–15 for a steady gradient), not too small — $v$ is understated 1000× and sits under a square root. Bias correction fixes that systematic error; warmup is still used because $\hat v$ is noisy early on.

**Beyond AdamW (2024–26, [Ch 16 §1.2](#content/16_deep_learning)):** **Muon** orthogonalises the momentum of each 2-D hidden weight matrix with a few Newton–Schulz iterations (embeddings, head and norms stay on AdamW) — used in Kimi K2 (as MuonClip), GLM-4.5/5 and reportedly DeepSeek-V4; Moonshot measured ~2× the compute efficiency of AdamW. **Adafactor** factors the second moment to save memory (T5; PaLM used it *without* the factorisation). **Lion** steps by the sign of momentum (one state buffer; needs a 3–10× smaller LR). LLM pre-training habit: $\beta_2 = 0.95$ (not 0.999) for stability.

#### Loss Functions

- **MSE** — regression, sensitive to outliers. **MAE** — robust. **Huber** — smooth small, robust large.
- **Binary cross-entropy**: $L = -[y\log\hat{y} + (1-y)\log(1-\hat{y})]$
- **Categorical cross-entropy**: $L = -\sum_i y_i \log\hat{y}_i$ (one-hot $y_i$)
- **Focal Loss** (imbalanced): $FL = -\alpha_t(1-p_t)^\gamma \log(p_t)$. With $\gamma=2$, a confident correct example ($p_t=0.95$) is down-weighted 400× (weight 0.0025) while a hard one ($p_t=0.2$) barely changes. RetinaNet used $\gamma=2$, $\alpha=0.25$. Trap: it cannot tell *hard* from *mislabelled*.
- **Triplet Loss** (similarity): $L = \max(0, d(A,P) - d(A,N) + \text{margin})$. Used in face recognition.
- **NT-Xent** (contrastive, SimCLR): softmax over $\exp(\text{sim}/\tau)$ — pick your partner view out of the whole batch; low τ = sharper. (See Part 4.)

#### Normalisation

| Method | Normalises over | Use when |
|--------|----------------|---------|
| Batch Norm | across samples per feature | CNNs, large batches |
| Layer Norm | across features per sample | Transformers, RNNs |
| Group Norm | groups of channels per sample | Small-batch vision |
| RMS Norm | root-mean-square (no mean sub) | LLaMA, modern LLMs |

LayerNorm formula: $\text{LN}(x) = \gamma \cdot \frac{x-\mu}{\sqrt{\sigma^2+\epsilon}} + \beta$. **Pre-LN** (normalise *before* each sub-layer, $x' = x + F(\text{Norm}(x))$) is standard in GPT-2/3, Llama, Qwen, DeepSeek: the residual path stays a clean identity highway, so it needs little warmup — the cost is a residual stream that grows with depth, hence a **final norm** before the head. **QK-Norm** (RMSNorm on each query and key; Gemma 3, Qwen3, OLMo 2) stops attention logits exploding ([Ch 16 §1.5](#content/16_deep_learning)).

#### Gradient Clipping & Mixed Precision

**Gradient clipping (norm clipping):** if $\|g\| > 1.0$, scale $g \leftarrow g \times 1.0/\|g\|$. Preserves direction; prevents exploding gradients. PyTorch: `clip_grad_norm_(params, 1.0)`. Standard for Transformers and RNNs.

**Mixed precision (BF16):** matmuls in 16-bit, FP32 master weights and optimiser state. BF16 has FP32's exponent range, so **no loss scaling** (FP16 needs it). Gives 2×+ faster matmuls and halves *activation* memory — weights + gradients + Adam state stay **16 bytes/param** (2+2+4+4+4; a 7B model = 112 GB before activations). **FP8** is the 2025–26 frontier: NVIDIA's recipe uses E4M3 forward / E5M2 for gradients, while DeepSeek-V3 trained with E4M3 throughout plus block-wise scaling (embeddings, head, norms, attention and gating stayed in higher precision); NVFP4 pushes to 4-bit with a shared FP8 scale per 16 values ([Ch 16 §1.7](#content/16_deep_learning)).

#### Regularisation

**Dropout**: randomly zero out a fraction $p$ of neuron activations during training; at test time, scale activations by $1-p$ (or equivalently scale during training and don't change at test). Acts like ensembling many sub-networks. Typical: $p=0.1$ (Transformers), $0.3$–$0.5$ (large fully-connected layers); use lower values closer to the output or in attention blocks; **0 for LLM pre-training** (Llama).

**L2 / weight decay**: adds $\frac{\lambda}{2}\|W\|^2$ to the loss, pulling weights toward zero. Effective penalty: $w \leftarrow (1-\alpha\lambda)w - \alpha\nabla L$. With Adam, L2 does *not* equal weight decay due to the adaptive scaling — AdamW fixes this with decoupled decay (see Optimizers section). Typical: $10^{-4}$ for CNNs with SGD; 0.01–0.1 for AdamW on Transformers (0.1 in LLM pre-training, not applied to biases/norm gains).

**Early stopping**: monitor validation loss; stop training when it plateaus or starts rising (save the checkpoint from the minimum). Prevents overfitting without changing the objective. The simplest and most reliable regulariser.

**Label smoothing**: replace one-hot targets with $(1-\epsilon)\cdot \mathbf{1}_y + \epsilon/C$. Prevents the model from driving logits to $\pm\infty$ trying to achieve 100% probability on training labels. Improves calibration; $\epsilon=0.1$ is a common default.

**Batch size interaction**: bigger batches mean fewer, noisier-to-signal steps and can generalise worse (the "generalisation gap"). Raise the peak LR with the batch — **linear** rule for SGD (batch ×k → LR ×k; ResNet-50: 0.1 at batch 256 → 3.2 at 8,192), **square-root** rule for Adam (batch ×4 → LR ×2) — and always warm up. Both break down past the **critical batch size** (where extra examples stop reducing the steps needed), so confirm with a short LR sweep ([Ch 16 §1.3](#content/16_deep_learning), [§1.9](#content/16_deep_learning)).

#### Learning Rate Schedules

The LR schedule matters as much as the optimiser:

| Schedule | Shape | Use when |
|----------|-------|---------|
| Constant | flat | Quick experiments only |
| Step decay | drops every N epochs | CNNs on ImageNet |
| Cosine annealing | smooth cosine curve | Standard when the total length is fixed |
| Linear warmup + decay | ramp up, then fall | All large-model training |
| OneCycleLR | one big spike | Fast convergence on smaller models |
| **Warmup–stable–decay (WSD)** | flat, then a short final decay | **Long / open-ended LLM pre-training** — branch a decay at any checkpoint |

LLMs use: linear warmup for ~0.1–2% of steps (Llama 2: 2,000 of ~500K steps; Llama 3.1 405B: 8,000), then cosine decay to 10% of peak (Llama 3: 1%) — or WSD when the run length isn't fixed (peak LR shrinks as models grow: ~3e-4 at 1–13B → ~8e-5 at 405B). Smaller / vision / fine-tuning runs warm up 3–10%. Why warmup? Adam moves *every* weight by ~the full LR on step 1 while $\hat v$ is built from a handful of samples, and a fresh Transformer is at its most fragile; a full-size step then can permanently damage the run.

#### Weight Initialisation & Activation Functions ([Ch 16 §1.8](#content/16_deep_learning))

A layer multiplies the signal's variance by $n_\text{in}\cdot\text{Var}(w)$; init picks $\text{Var}(w)$ so that factor is 1 (20 layers of "0.8× fainter" leave 1%; "1.2× louder" explodes). Zero biases are fine, but **all-equal weights** keep neurons clones (symmetry), so weights must be random.

| Recipe | Variance | Built for |
|---|---|---|
| **Xavier / Glorot** | $2/(\text{fan}_{in}+\text{fan}_{out})$ | tanh, sigmoid, linear |
| **He / Kaiming** | $2/\text{fan}_{in}$ | ReLU — it zeroes half the pre-activations (keeps half the mean square); the 2 wins it back |
| **Transformer (GPT-2 style)** | std 0.02, biases 0, norm gain 1; residual out-projections $0.02/\sqrt{2L}$ | the stream receives $2L$ additions; shrinking each keeps variance bounded at any depth |

PyTorch's `nn.Linear` default is *neither* (variance $1/(3\,\text{fan}_{in})$) — normalisation repairs the scale. **Zero-init the end of a branch** so it starts as "do nothing" (LoRA's $B$, adaLN-Zero in DiT, ControlNet).

**Activations:** sigmoid/tanh saturate (slope ≤ 0.25), so hidden layers use ReLU-family or smooth units. **GELU** (BERT, GPT-2/3, ViT) and **SiLU** are smooth; **gated SwiGLU / GeGLU** is the 2023–26 LLM default (Llama, PaLM, Mistral, Qwen, DeepSeek = SwiGLU; Gemma = GeGLU): $(\text{SiLU}(xW_\text{gate}) \odot xW_\text{up})W_\text{down}$ — three matrices, so the hidden width shrinks to $8d/3$ to match a $4d$ FFN (Llama 2 7B: 11,008). Gating helps empirically; there is no proof.

#### Training Big Models — Accumulation, Checkpointing, EMA ([Ch 16 §1.9](#content/16_deep_learning))

- **Four buckets of memory per step:** weights (2 B/param) + gradients (2) + optimizer state (12) = **16 B/param** (fixed by the model), plus activations (fixed by *you*). A 7B model = 112 GB before activations, so it cannot train on one 80 GB GPU however you tune the batch.
- **Gradient accumulation:** effective batch = micro-batch × accumulation steps × data-parallel GPUs. Divide each micro-batch loss by $k$, step (optimizer, scheduler, clipping) once per $k$, and normalise by real tokens when sequences are padded. Exact for LayerNorm/RMSNorm; **not** for BatchNorm (per-micro-batch statistics).
- **Activation checkpointing:** keep each layer's input and recompute the rest in the backward pass — ≈ **+33% compute** (4F vs 3F; measured 30–40%) for 5–10× less activation memory.
- **EMA of weights:** $\theta_\text{ema} \leftarrow d\,\theta_\text{ema} + (1-d)\,\theta$, $d = 0.999$–$0.9999$ (memory ≈ $1/(1-d)$ steps; DDPM used 0.9999); train the live copy, **evaluate and ship the EMA**.
- **If a 7B model OOMs, in order:** shard the states (ZeRO-3/FSDP, or LoRA / a lighter optimizer) → FlashAttention → activation checkpointing → smaller micro-batch + accumulation.

---

### Part 2: Computer Vision

#### CNN Architecture Evolution

```
LeNet (1998) ──► AlexNet (2012) ──► VGG (2014) ──► ResNet (2015) ──► EfficientNet (2019) ──► ViT (2020) ──► ConvNeXt (2022)
5 layers        8 layers           16-19 layers    18-152 layers    Compound scale      Patch-based
(MNIST)         (ImageNet rev)      (3×3 only)      (skip conn.)     (balanced 3D)       Transformer         (modern CNN ≈ ViT)
```

**ResNet skip connections** (★★★): Each block learns the *residual* $F(x)$, and the output is $F(x) + x$. Fixes an **optimization** problem — deeper plain nets had *higher training error* even with BatchNorm; now "do nothing" is easy ($F=0$) and the gradient always has a direct path of 1. Enabled 152-layer networks (3.57% top-5 on ImageNet 2015, below the ~5.1% human estimate); 50/101/152 use a 1×1–3×3–1×1 **bottleneck** block, so ResNet-152 has fewer parameters than VGG-16.

**EfficientNet compound scaling**: depth $\propto 1.2^\phi$, width $\propto 1.1^\phi$, resolution $\propto 1.15^\phi$ (each +1 in $\phi$ ≈ 2× compute). B7: 84.3% top-1, 8.4× smaller and 6.1× faster than the best ConvNet then (GPipe) — but fewer FLOPs ≠ faster on a GPU (depthwise convs are memory-hungry), hence EfficientNetV2's fused 3×3 convs.

**Convolution arithmetic** ([Ch 16 §2.1](#content/16_deep_learning)): output width $\lfloor (W-K+2P)/S \rfloor + 1$; parameters $K^2 C_{in} C_{out} + C_{out}$ (shared across positions); MACs $= K^2 C_{in} C_{out} H_{out} W_{out}$ — so early layers are cheap in parameters but costly in compute (VGG-16 layer 1: 1,792 params, 87M MACs; 89% of its 138M params sit in three dense layers). Two 3×3 layers see a 5×5 area with 28% fewer weights. Papers often write "FLOPs" and mean MACs.

**ViT (Vision Transformer)**: Chop $224\times224$ into $16\times16$ patches → 196 tokens → standard Transformer. Each patch attends to all others from layer 1. Lacks a CNN's locality bias: the original ViT needed 300M-image pre-training, but **DeiT** matched CNNs on ImageNet-1k alone with strong augmentation + distillation.

#### Object Detection & Segmentation

**YOLO**: the original divides the image into a $7\times7$ grid (each cell: 2 boxes + 20 class scores → a 7×7×30 output); modern versions predict at several scales, anchor-free, and v10/YOLO26 are NMS-free. One forward pass. Non-Maximum Suppression (NMS) keeps the best box and deletes others with IoU above ~0.5 (too low a threshold also deletes two real neighbours). IoU = Area(Overlap)/Area(Union); a box is "correct" if IoU ≥ threshold. **DETR** frames detection as set prediction with one-to-one Hungarian matching — no anchors, no NMS (RT-DETR is real-time).

**U-Net**: Encoder shrinks (learns *what*), decoder expands (predicts per pixel), skip connections bridge them (give the decoder fine-grained spatial info). Designed for medical images; used for satellite, road segmentation, etc. **SAM / SAM 2**: promptable "segment anything" from a click or box, no task training; SAM 2 tracks through video.

#### Efficient CNNs — Depthwise-Separable Convolutions & MobileNet ([Ch 16 §2.6](#content/16_deep_learning))

A standard $K\times K$ conv is split into a per-channel $K\times K$ **depthwise** filter + a $1\times1$ **pointwise** channel mix. Cost ratio $= \frac{1}{C_\text{out}} + \frac{1}{K^2}$ — ≈ **8–9× cheaper** for 3×3 (128 → 128 channels on 56×56: 55M vs 462M MACs; the 1×1 part is ~93% of the separable layer's cost).

| Version | The one fix |
|---|---|
| MobileNet V1 (2017) | stacks of separable blocks; width multiplier $\alpha$ (cost ≈ $\alpha^2$), resolution multiplier $\rho$ ($\rho^2$); 32× fewer params than VGG-16 for −0.9 pt top-1 |
| V2 | **inverted residual** (expand → depthwise → project) with a **linear bottleneck** — no ReLU after the projection, which would destroy information in a thin layer |
| V3 / V4 | V3: squeeze-and-excitation + h-swish + hardware-aware search; V4 (2024): Universal Inverted Bottleneck + Mobile MQA |

EfficientNet's MBConv = the V2 block + SE; ConvNeXt's 7×7 depthwise conv is the same idea. **Trap:** fewer FLOPs ≠ lower latency — depthwise convs are memory-bound.

#### Adversarial Examples ([Ch 16 §2.7](#content/16_deep_learning))

A tiny, worst-case perturbation that flips a confident prediction (Goodfellow et al.: "panda" 57.7% → "gibbon" 99.3%, $\varepsilon = 0.007$). **FGSM:** $x' = x + \varepsilon\,\text{sign}(\nabla_x L)$ — one backward pass w.r.t. the *input*. **Why it works:** the logit shifts by $\Delta z \approx \varepsilon\|w\|_1$, which grows with the number of inputs (150,528 pixels × $|w| \approx 0.01$ × $\varepsilon = 1/255$ ≈ 5.9 — enough to flip 95% → 5%), while random noise of the same size shifts it ~390× less (aligned nudges add like $n$, random like $\sqrt{n}$) — so "survives random noise" says nothing about robustness. **PGD** = many FGSM steps, each clipped back into the $\varepsilon$-ball. **Defences:** adversarial training (min-max with a PGD inner attack; ≈ $K+1$× cost, some clean-accuracy loss, only the trained threat model), randomized smoothing (certified $L_2$ radius); beware **gradient masking** — a defence counts only if adaptive attacks fail. LLM analogues: GCG gradient-searched suffixes and prompt injection.

---

### Part 3: Sequence Models & Transformers

#### LSTM & GRU

Plain RNNs vanish: gradient through $T$ Jacobians of $W_h$ exponentially decays if dominant eigenvalue $< 1$.

**LSTM** has a *cell state* $C_t$ — the gradient highway:
$$C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t, \quad f_t = \sigma(W_f[h_{t-1}, x_t])$$
When $f_t \approx 1$ the gradient flows with near-unit multiplication. All 4 LSTM equations:

$$f_t = \sigma(W_f[h_{t-1},x_t]+b_f), \quad i_t = \sigma(W_i[h_{t-1},x_t]+b_i)$$
$$\tilde{C}_t = \tanh(W_C[h_{t-1},x_t]+b_C), \quad C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t$$
$$o_t = \sigma(W_o[h_{t-1},x_t]+b_o), \quad h_t = o_t \odot \tanh(C_t)$$

**GRU** merges forget+input into one update gate $z_t$, plus a reset gate $r_t$ to partially forget past hidden state. No separate cell state — 3 weight blocks vs 4, so ~25% fewer parameters than an LSTM of the same size (the LSTM has ~33% more). When reset gate ≈ 0, the GRU ignores prior hidden state (fresh start). When update gate ≈ 1, prior state passes through unchanged (long memory).

| | LSTM | GRU | Transformer |
|--|------|-----|------------|
| Memory mechanism | Cell state + gates | Gated hidden state | Self-attention over all past |
| Parallelisable over time? | No | No | **Yes** |
| Parameters | Most | Moderate | Most (but parallelised) |
| Long-range deps | Good | Good | **Excellent** |
| Best 2026 use case | Streaming time-series, edge | Streaming, fast inference | **All language tasks** |

Prefer Transformers for new projects; LSTM/GRU for streaming/low-latency inference on constrained hardware.

#### Self-Attention (★★★)

$$\text{Attention}(Q,K,V) = \text{softmax}\!\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

Each token creates Q (what am I looking for?), K (what do I offer?), V (what do I give?). $\sqrt{d_k}$ prevents large dot products from saturating softmax: a dot product of $d_k$ unit-variance terms has variance $d_k$ (std ≈ 22 at $d_k=512$ → near one-hot softmax, vanishing gradients); dividing restores variance ≈ 1. Complexity $O(n^2)$ in sequence length. **Stable softmax** = subtract the row max before `exp`.

**Multi-Head Attention**:
$$\text{MultiHead}(Q,K,V) = \text{Concat}(\text{head}_1,\ldots,\text{head}_h)W^O, \quad \text{head}_i = \text{Attention}(QW^Q_i,KW^K_i,VW^V_i)$$
$W^O$ mixes information from all heads. Typical: 12 heads (BERT-base), 96 heads (GPT-3). Don't over-read "each head specialises" — many heads can be pruned at test time with little loss.

**GQA/MQA/MLA** (full table: [Ch 17 §2.4](#content/17_llm)): standard MHA caches one K,V set per head ($2\,h\,d_h$ numbers per token per layer). **Multi-Query Attention (MQA)**: all heads share one K,V — ÷$h$ (32× for 32 heads), noticeable quality drop on hard tasks. **Grouped-Query Attention (GQA)**: $g$ KV heads for $h$ query heads — ÷$(h/g)$, quality ≈ MHA (Llama 2 34B/70B, Llama 3, Mistral, Gemma 2/3, Qwen3). **MLA** (DeepSeek-V2/V3): cache a compressed latent (512 + 64 rotary numbers per token per layer ≈ GQA with 2.25 groups) while keeping per-head diversity. MQA/GQA/MLA shrink *bytes per token*; sliding-window shrinks *tokens kept* — they compose (Mistral 7B uses GQA + sliding window).

#### Positional Encodings (★★★)

| Method | Used By | Relative Pos? | Longer than training? |
|--------|---------|--------------|--------------|
| Sinusoidal | Original Transformer | Partially | Defined for any length; degrades in practice |
| Learned | BERT, GPT-2 | No | No (truncates) |
| **RoPE** | **Llama, Gemma, Qwen, Mistral, DeepSeek** | **Yes** | **With scaling (PI / NTK / YaRN) + long-context training** |
| ALiBi | BLOOM, MPT | Yes | Good — designed for it |

**RoPE**: rotates Q and K by a position-dependent angle before $QK^T$. The dot product depends only on relative distance $m-n$, not absolute position. Dominant in 2024–2026 LLMs. Extend context by rescaling the frequencies (Position Interpolation, NTK-aware, YaRN) plus a short fine-tune.

**Sinusoidal**: $PE(\text{pos}, 2i) = \sin(\text{pos}/10000^{2i/d})$; $PE(\text{pos}, 2i+1) = \cos(...)$.

#### BERT vs GPT

| | BERT | GPT |
|--|------|-----|
| Architecture | Encoder-only | Decoder-only |
| Attention | **Bidirectional** (sees all tokens) | **Causal** (sees past only) |
| Pre-training | MLM (fill-in-the-blank); NSP was dropped (RoBERTa) | Next-token prediction |
| Best for | Understanding, classification, NER, Q&A | Generation, chat, code |
| Examples | BERT-base (110M), RoBERTa, DeBERTa | GPT-3/4, LLaMA, Claude, Mistral |

BERT-base: 12 layers, 12 heads, 768 hidden dim, 110M params. BERT-large: 24 layers, 16 heads, 1024 hidden dim, 340M params. **T5 (encoder-decoder)**: span-corruption pre-training, text-to-text — translation, summarisation; Whisper uses the same shape for speech. Almost every large LLM is decoder-only (simple to scale, prompt-everything, cacheable K/V); encoders still power embeddings, reranking and classification (ModernBERT, 2024: RoPE + GeGLU + local/global attention, 8K context).
![BERT vs GPT: encoder-only vs decoder-only architectures](diagrams/dlrev_bertgpt_ai.png)

The full Transformer block: Input → Self-Attention → Add&Norm → FFN → Add&Norm → Output (the 2026 version: pre-norm RMSNorm, RoPE, GQA/MLA, SwiGLU FFN — [Ch 17 §2.4](#content/17_llm)). FFN holds ~2/3 of a layer's parameters ($8d^2$ vs attention's $4d^2$) and much of the factual knowledge. Attention handles token relationships. Parameter rule of thumb: ≈ $12\,L\,d^2$.

#### Transformer Depth by the Numbers

| Model | Layers | Heads | Hidden | Params |
|-------|--------|-------|--------|--------|
| BERT-base | 12 | 12 | 768 | 110M |
| GPT-2 large | 36 | 20 | 1280 | 774M |
| GPT-3 | 96 | 96 | 12288 | 175B |
| LLaMA 3 8B | 32 | 32 | 4096 | 8B |
| LLaMA 3 70B | 80 | 64 | 8192 | 70B |

Context window = maximum input **plus** output tokens: 2K (GPT-3, 2020) → 8K/32K (GPT-4, 2023) → 200K (Claude 2.1) → 1M, later 2M (Gemini 1.5) → 128K (Llama 3.1) → 10M advertised (Llama 4 Scout). As of late 2026 ~128–256K is the floor and 200K–1M is typical at the frontier; *advertised is not effective* ([Ch 17 §2.7](#content/17_llm)). The window is in *tokens*, not words (1M ≈ 750K words).

---

### Part 4: Representation Learning

Learn embeddings without labels, then reuse them for search, zero-shot classification and multimodal encoders.

- **Triplet loss** (faces, similarity): $\max(0,\, d(A,P) - d(A,N) + \text{margin})$ — zero once the negative is far enough.
- **SimCLR / NT-Xent**: two augmented views of each image; a softmax over $\exp(\text{sim}/\tau)$ across the batch must pick the partner. Needs big batches (more negatives).
- **CLIP**: image + text encoders on 400M pairs; maximise the diagonal of the $N \times N$ similarity matrix → zero-shot classification with prompts like "a photo of a {class}".
- **SigLIP**: independent **sigmoid** per image–text pair instead of a batch-wide softmax — no huge batches needed; the vision encoder in PaliGemma and Gemma 3.
- **DINO / DINOv2**: student matches a slow-moving (EMA) teacher; centering + sharpening prevent collapse — **no negatives**. Strong frozen features.
- **MAE**: hide 75% of patches, reconstruct them; the encoder sees only the visible 25%.

---

### Part 5: Generative Models

**VAE**: Encoder outputs $\mu, \sigma$ (a distribution, not a point). Reparameterisation trick: $z = \mu + \sigma \cdot \epsilon$, $\epsilon \sim \mathcal{N}(0,1)$ — makes sampling differentiable. Loss = reconstruction + $D_{KL}(q(z|x) \| p(z))$. Organised latent space enables smooth interpolation.

**Diffusion**: Fixed forward process adds noise 1000 steps ($x_t = \sqrt{\bar\alpha_t} x_0 + \sqrt{1-\bar\alpha_t}\epsilon$). A denoiser (U-Net, now usually a Transformer — DiT) is trained to predict the added noise $\hat\epsilon$ given $x_t$ and step $t$. Generation runs it backwards from pure noise. Production: VAE **latent** space (SD's 512×512×3 → 64×64×4, 48× fewer numbers) + text cross-/joint attention + **classifier-free guidance** $\hat\epsilon = \epsilon_u + w(\epsilon_c - \epsilon_u)$, $w\approx3$–8 (SD default 7.5; two forward passes per step) + 20–50-step samplers. Stable training; strong mode coverage.

**Flow matching / rectified flow**: learn the **velocity** $\epsilon - x_0$ along a straight line $x_t = (1-t)x_0 + t\epsilon$ — plain regression. Straighter paths *can* use fewer steps, but SD3 and FLUX.1 [dev] still default to ~20–50; 1–4 steps come from distilled models (FLUX.1 [schnell]). Used by Stable Diffusion 3 and FLUX.

**GAN**: $\min_G \max_D \mathbb{E}[\log D(x)] + \mathbb{E}[\log(1-D(G(z)))]$. Mode collapse: generator finds one or few outputs that fool D. WGAN replaces JS divergence with Wasserstein (Earth Mover's) distance — smooth gradients even when distributions don't overlap. WGAN-GP adds gradient penalty for Lipschitz constraint.

| Aspect | GAN | Diffusion |
|--------|-----|-----------|
| Speed | Single forward pass (fast) | 20–1000 steps (1–4 when distilled) |
| Stability | Notoriously unstable | Stable |
| Mode coverage | Drops modes | Strong |
| 2026 role | A loss for sharpening VAEs/tokenizers and distilling fast samplers (SDXL-Turbo) | Dominant for image **and** video |

---

### Part 6: Scaling & Specialised Architectures

**MoE** ([Ch 16 §6.1](#content/16_deep_learning); deep dive + NumPy layer: [Ch 17 §4.8](#content/17_llm)): replace the FFN with $E$ experts + a router; $y=\sum_i g_i E_i(x)$ over the token's top-$k$ experts (softmax over just the chosen scores). Mixtral 8x7B: 46.7B total / 12.9B active — *not* 2/8 of 46.7B, because attention, embeddings and the router are shared by every token and only FFNs are replicated. 2024–26 designs use many small experts + a shared expert (DeepSeek-V3: 256 routed, top-8, + 1 shared → 671B / 37B active). Trend: active share fell from 28% (Mixtral) to ~3–6% (2025–26 frontier open models). Experts are *not* topic specialists (routing follows syntax / token type).

**MoE routing & balancing:** left alone, routing collapses (rich-get-richer). The Switch aux loss $\alpha E\sum_i f_iP_i$ is minimal ($=\alpha$) at even load — $f_i$ is a count with no gradient, so the gradient flows through $P_i$. Alternatives: **auxiliary-loss-free** balancing (DeepSeek-V3: a per-expert bias used only when picking the top-$k$, nudged by load), capacity factor + token dropping (or dropless kernels), router z-loss. Compute ≈ active params; **memory** must still hold every expert (DeepSeek-V3 = 671 GB in FP8 — more than one 8×H100 node), tokens cross GPUs in an all-to-all, and at serving batch sizes nearly every expert is touched each step.

**SSM / Mamba**: linear recurrence $h_t = Ah_{t-1} + Bx_t$ → $O(n)$ time, fixed-size state (no KV cache). Mamba makes $A,B$ input-dependent (selective). Weaker at exact recall, so production models are **hybrids**: Jamba, Nemotron-H, Granite 4.0, Qwen3-Next (Gated DeltaNet + attention).

**GNN**: Message passing — each node aggregates neighbour features, applies a small neural net to update. After K rounds, nodes know their K-hop neighbourhood. Used in: drug discovery, social networks, Google Maps ETAs, AlphaFold. Keep them 2–3 layers deep — more causes **over-smoothing** (all nodes converge to the same value). GraphSAGE samples neighbours → inductive, scales to billions of nodes.

---

### Practical Debugging (quick checklist)

1. Check the **initial loss** ≈ $\ln K$ (2.3 for 10 classes; ln 128,256 ≈ 11.8 for a 128K-vocab LM) — far above means oversized last-layer weights, unnormalised inputs or a loss summed instead of averaged.
2. **Overfit one batch** — loss should approach 0; if not, it's a bug, not a modelling problem.
3. Check the data, then monitor per-layer gradient norms; zeros = dead layer, NaN = exploding.
4. Always call `model.eval()` before testing (disables dropout, BatchNorm uses running stats).
5. Read train vs val curves: val rising while train falls = overfitting; both high = underfitting; jagged = LR too high; suspiciously good = leakage. Then an **LR range test**, then tune.
6. LLM loss spike after thousands of healthy steps: roll back + skip the bad batch → lower LR / longer warmup → $\beta_2=0.95$ + clip at 1.0 → QK-norm and z-loss.

**Architecture quick-reference:**

| Data type | Go-to architecture |
|-----------|--------------------|
| Images | ResNet / ConvNeXt (standard), ViT (large dataset or good pre-trained backbone); MobileNet / EfficientNet on edge devices |
| Object detection | YOLO (fastest), DETR family (no NMS) |
| Segmentation | U-Net (fixed classes), SAM (promptable) |
| Text understanding | BERT family (embeddings, reranking, classification) |
| Text generation | Decoder-only GPT/LLaMA family (MoE when you can hold every expert) |
| Sequences (streaming) | LSTM/GRU; very long streams: SSM hybrids |
| Graphs | GNN |
| Tabular | XGBoost first |
| Image / video generation | Diffusion or flow matching |
| Self-supervised image | DINOv2 / MAE; image + text: CLIP / SigLIP |

> ✅ **Must-remember**
>
> - **Backprop** = chain rule, one backward pass computes ALL gradients (backward ≈ 2× forward); verify by central-difference gradient checking.
> - **AdamW** = correct optimizer for Transformers; separates weight decay from gradient update. Uncorrected early Adam steps are too *large*, not too small.
> - **ResNet skip connections** fixed an *optimization* problem, not overfitting — the gradient always has a direct path.
> - **The 2026 LLM block** = RMSNorm (pre-norm) + RoPE + GQA/MLA attention + SwiGLU feed-forward (a MoE feed-forward in many frontier models).
> - **Diffusion / flow matching** dominate image and video generation; **GANs** risk mode collapse and now serve mainly as a sharpening/distillation loss.
> - **Focal Loss** for class imbalance; **Triplet Loss** for similarity learning.
> - **Activation functions** ([§1.8](#content/16_deep_learning)): ReLU is the CNN default (watch for dead units); **GELU** in BERT/GPT-2/3/ViT; **gated SwiGLU/GeGLU** is the LLM default (hidden width $8d/3$); sigmoid only for binary outputs/gates; softmax for multi-class outputs.
> - **Vanishing gradient** flow in order of vulnerability: plain RNN (worst) < LSTM/GRU < ResNet < pre-LN Transformer (best).
> - **Weight initialization** keeps the signal's variance constant through depth: **He** $2/\text{fan}_{in}$ for ReLU; **Xavier** $2/(\text{fan}_{in}+\text{fan}_{out})$ for tanh/sigmoid; Transformers: std 0.02, zero biases, residual out-projections $0.02/\sqrt{2L}$. A wrong init can diverge in the first few steps.
> - **Training big models** ([§1.9](#content/16_deep_learning)): mixed-precision AdamW = 16 B/param (7B → 112 GB before activations). *Effective batch = micro-batch × accumulation × GPUs* — divide each micro-batch loss by $k$. Checkpointing ≈ +33% compute for activation memory. Evaluate the **EMA** weights.
> - **Depthwise-separable conv** ([§2.6](#content/16_deep_learning)) costs ≈ $1/C_\text{out} + 1/K^2$ of a standard conv (≈ 8–9× less for 3×3); MobileNet V2 = inverted residual + linear bottleneck. Fewer FLOPs ≠ lower latency.
> - **Adversarial examples** ([§2.7](#content/16_deep_learning)): FGSM $x + \varepsilon\,\text{sign}(\nabla_x L)$; tiny aligned changes add up in high dimensions ($\Delta z \approx \varepsilon\|w\|_1$). PGD = iterated; adversarial training (min-max) is the main defence.
> - **MoE routing** ([§6.1](#content/16_deep_learning)): top-$k$ gates + a balance loss (or DeepSeek's bias trick) to stop collapse; compute = active params, **memory = all params**.

---

## Ch 17 / 17b — Large Language Models

> **Chapter 17 is now three chapters.** [Ch 17](#content/17_llm) = how an LLM works inside (tokenizer → Transformer → training → families). [Ch 17b](#content/17b_llm_applications) = how you build with one (prompting, hallucinations, RAG, tools, fine-tuning, cost, safety). [Ch 17c](#content/17c_llm_systems) = how you run one at scale — recapped in its own section below.

> 💡 **In a sentence —** An LLM is a massive decoder-only Transformer that learns to predict the next token from a trillion-token corpus; reasoning, code and translation capabilities arise from that single objective (how *sudden* they appear is partly a measurement artefact — see In-Context Learning & Emergent Abilities below).

---

### The Core Idea

Every token an LLM generates is a conditional probability:

$$P(\text{next word} | \text{all previous words})$$

The full sentence probability is the chain rule product:

$$P(w_1,\ldots,w_n) = P(w_1)\cdot P(w_2|w_1)\cdots P(w_n|w_1,\ldots,w_{n-1})$$

Multiplying probabilities makes them tiny; log-probs convert to manageable sums. Training objective (cross-entropy): $\mathcal{L} = -\frac{1}{N}\sum_i \log P(x_i|\text{context}_i,\theta)$; perplexity $= e^{\mathcal{L}}$ (loss 2.3 → ≈ 10; a uniform guess over $V$ tokens has perplexity $V$). **Softmax** must subtract the row max before `exp` (numerical stability).

**KL divergence** (used throughout LLM training; code in [Ch 17 §1.4](#content/17_llm)):

$$D_{KL}(P \| Q) = \sum_x P(x) \log \frac{P(x)}{Q(x)}$$

KL is always ≥ 0 and not symmetric: $D_{KL}(P\|Q) \neq D_{KL}(Q\|P)$. It measures how far a policy drifts from its SFT/reference model in RLHF/PPO, and is the implicit regulariser in DPO.

---

### Tokenization & BPE (★★)

LLMs work on **subword tokens**, not characters or words.

**BPE (Byte Pair Encoding)** — GPT-2/3/4/4o, Llama 3, Qwen, DeepSeek: start from bytes/characters and repeatedly merge the most-frequent adjacent pair until the vocab hits its target (`vocab = base symbols + merges`; GPT-2: 256 + 50,000 + 1 special = 50,257). Encoding replays the learned merges **in merge-rank order**, not letter order (code: [Ch 17 §2.2](#content/17_llm), rung 1). Rare words → subword pieces; byte-level BPE never has an "unknown" token. Vocabularies run 30K–260K: BERT 30.5K, Llama 2 32K, GPT-2/3 50K, GPT-4 ≈100K, GPT-4o ≈200K, Llama 3 128K, Gemma ≈256K — bigger = fewer tokens per text but a larger $V\times d$ embedding table.

**WordPiece** (BERT): likelihood-scored merges, `##` continuation pieces. **Unigram** (T5, ALBERT): prune a huge vocab. **SentencePiece** is a *library* (Llama 1/2, T5, Gemma) that runs BPE or Unigram on raw text (`▁` marks spaces); Llama 3 switched to tiktoken-style byte-level BPE.

1 token ≈ 4 characters ≈ 0.75 English words (code, numbers and other languages cost more). The context window in tokens is a hard limit; going over silently truncates or errors. Many "LLMs can't spell or count" failures are tokenization — the model never sees letters.

Special tokens: `[BOS]`, `[EOS]`, `[PAD]`, `[MASK]`, `<|system|>`, `<|user|>`, `<|assistant|>`, `<|end_of_turn|>` — use the tokenizer's own chat template; the wrong one silently degrades answers.

---

### Transformer Internals (★★★)

Full pipeline for a prompt:

```
Text ──► Tokenise ──► Embed ──► N × Transformer Blocks ──► Head ──► Token probabilities
```

**Embedding**: each token ID → learned vector of size $d_\text{model}$ (768 to 12,288 depending on model).

**Transformer block** (2017 → 2026 differences in brackets):
```
Input
  ↓ Self-Attention (with positional encoding)   [RoPE on Q,K; GQA/MLA]
  ↓ Add & Norm                                   [pre-norm RMSNorm instead of post-LN LayerNorm]
  ↓ FFN (expand 4× → activation → compress)      [SwiGLU, hidden ≈ 8d/3]
  ↓ Add & Norm
Output
```

**Attention formula**: $\text{Attention}(Q,K,V) = \text{softmax}(QK^T/\sqrt{d_k})V$ — the code interviewers ask for most ([Ch 17 §2.4](#content/17_llm): scaled dot-product, multi-head, GQA, sliding-window in NumPy).

**Softmax**: converts raw logits to probabilities summing to 1; larger inputs get disproportionately more weight.

**FFN**: stores much of the factual knowledge. Attention handles relationships. FFN ≈ 2/3 of each layer's parameters ($8d^2$ vs $4d^2$).

**Causal mask** (GPT-style): lower-triangular — token $i$ only attends to positions $\leq i$.

**GQA/MQA/MLA and sliding-window** (details: Part 3 above and [Ch 17 §2.4](#content/17_llm)): GQA cuts the KV cache ÷$(h/g)$ — 4× for 32 → 8 heads, 8× for Llama-3-70B's 64 → 8 — at ≈ MHA quality; MQA is the $g=1$ extreme; MLA caches a low-rank latent. **Sliding-window** attention keeps only the last $W$ tokens (Mistral 7B $W$=4096; Gemma 3: 5 local layers per global one, window 1,024) — a fixed rolling cache, but weak at exact recall of distant facts.

**Modern LLM defaults**: pre-norm, RMSNorm, RoPE, GQA (or MLA), SwiGLU, AdamW (β₂ 0.95) + warmup + cosine or WSD schedule.

#### FlashAttention — Same Maths, Far Less Memory Traffic ([Ch 17 §2.4](#content/17_llm))

Attention is **memory-bound**: the textbook version writes the $n\times n$ score matrix to slow HBM and reads it back several times (8K tokens, 32 heads: ≈ 16 GiB of traffic vs 256 MiB for Q,K,V,O). FlashAttention **tiles** Q,K,V into on-chip SRAM and keeps an **online softmax** — a running max $m$ and sum $l$ per row, rescaling the old sum by $e^{m_\text{old}-m_\text{new}}$ whenever a tile raises the max — so the matrix is never materialised. It is **exact**, needs **$O(n)$** extra memory, recomputes tiles in the backward pass (≈ 3× faster GPT-2 training in v1; v2 parallelism, v3 Hopper + FP8, v4 Blackwell). **Compute is still $O(n^2 d)$** and the KV cache is unchanged. Don't confuse the three: the **KV cache** decides *what* is kept, **PagedAttention** *where* it lives, **FlashAttention** *how the maths reads it*.

#### Context Window, Long Context & Attention Sinks ([Ch 17 §2.7](#content/17_llm))

**Context window** = maximum total tokens (prompt + completion), held in the KV cache; nothing persists across sessions unless you manage memory. Sizes: 2K (GPT-3) → 8K/32K (GPT-4) → 200K (Claude 2.1) → 1M–2M (Gemini 1.5) → 10M advertised (Llama 4 Scout); late 2026: ~128–256K is the floor and the GPT-6, Claude 5.5 and Gemini 4 lineups list ~1M.

**Four problems:** (1) attention compute $\propto n^2$ (16× the tokens → 256× the scores); (2) the KV cache grows **linearly** — 320 KiB/token for a 70B GQA model → **40 GiB at 128K** (≈ 43 GB), 320 GiB at 1M; (3) positions the model never trained on (RoPE angles at 100,000); (4) **lost in the middle** — facts at the start or end of the prompt are found more reliably than in the middle, and RULER shows many models degrade well before their advertised limit. Put key evidence and the question at the ends of the prompt.

**Stretch levers:** RoPE scaling (PI / NTK / YaRN) + a short long-sequence fine-tune; staged long-context training at the end of pre-training (Llama 3 405B: 8K → 128K); local + global attention; a smaller KV cache (GQA/MLA, FP8 cache, eviction); ring attention; or retrieval instead of stuffing.

**Attention sinks (StreamingLLM):** softmax weights sum to 1, so with nothing relevant the model parks surplus attention on the **first tokens**; evict them from a sliding window and quality collapses. Keep ~4 sink tokens + a rolling window → a fixed-size cache over endless streams — stable generation, **not a longer memory**.

**Long context vs RAG:** long context when the whole thing fits and the task needs all of it; RAG when material is huge/changing or only a few passages matter (long prompts cost every query and a slow first token); combine them by retrieving 20–50 chunks into a generous window. **Needle-in-a-haystack is only a smoke test** — RULER, NoLiMa, HELMET and Michelangelo test multi-needle, multi-hop and no-word-overlap retrieval.

---

### Decoding Strategies

**Greedy**: always pick $\arg\max$. Deterministic, can loop ("the the the…").

**Beam search (width B)**: keep top-B sequences; better for translation/summarisation but bland for open-ended chat; width 1 *is* greedy; rank finished hypotheses by length-normalised score, not raw score.

**Top-K sampling**: sample from top-K tokens only; renormalise. K=50 is a common library default.

**Top-P (nucleus) sampling**: include the smallest set of tokens whose cumulative probability ≥ P (typically 0.9) — *including* the token that crosses P. Adapts to model confidence — narrow when confident, wide when uncertain. **Min-p**: keep tokens with $p_i \ge p_\text{base}\cdot p_\text{top}$ (0.01–0.2) — the cut-off scales with confidence and holds up better at high temperature.

**Temperature** rescales logits before softmax: $p_i \propto e^{z_i/T}$; it never changes the ranking, so greedy/beam are unaffected. Order in libraries: penalties → temperature → top-k → top-p → softmax → draw. The code interviewers ask for ([Ch 17 §2.6](#content/17_llm), rung 10): work on *logits* and mask dropped ones with $-\infty$, **not 0** (a logit of 0 still gets probability).

| Temperature | Effect |
|-------------|--------|
| 0 | Special case = greedy (dividing by 0 is undefined) |
| 0.7 | Natural, varied — good default |
| 1.0 | Sample directly from distribution |
| 2.0 | Wild, often incoherent |

Temperature=0 for code/factual Q&A. Temperature=0.7–1.0 for creative tasks. Repetition / presence / frequency penalties push down already-seen tokens but also hurt code identifiers and JSON keys — use lightly.
![Decoding strategies: greedy, beam, top-K, top-P, temperature](diagrams/dlrev_decoding_ai.png)

**Autoregressive loop**: one token per forward pass; the KV cache stores past keys/values so each step computes only the *new* token's K,V and attends over the cache instead of re-processing the whole prefix (it trades memory for time — the cache grows linearly with context).

---

### LLM Training Pipeline (★★★)

**Stage 1 — Pre-training**: next-token prediction on trillions of tokens (Llama 3 ≈ 15T — 15.6T for the 405B; Qwen3 ≈ 36T; GPT-3 only 300B). Compute $C \approx 6ND$ (GPT-3 ≈ 3,640 petaflop/s-days; Llama 3 405B ≈ 3.8·10²⁵ FLOPs; use *active* params for MoE). "GPT-3 cost $4.6M" is a 2020 Lambda Labs estimate of renting V100s at the cheapest cloud price, not OpenAI's bill.

**Data composition and mixing** ([Ch 17 §3.1](#content/17_llm)). Mix shares are *sampling weights*, not corpus sizes: GPT-3 sampled 60% filtered Common Crawl / 22% WebText2 / 8% Books1 / 8% Books2 / 3% Wikipedia — so Wikipedia was seen 3.4× but raw web only 0.44×. Newer labs disclose only coarse splits (**Llama 3 ≈ 50% general knowledge, 25% maths & reasoning, 17% code, 8% multilingual**). Code in the mix also helps non-code reasoning; quality > quantity past a certain scale.

#### The Pretraining Data Pipeline — Crawl, Filter, Deduplicate, Mix ([Ch 17 §3.1b](#content/17_llm))

Raw web text is mostly junk, so a corpus is *manufactured* — often moving quality as much as an architecture change: `crawl → extract text → language ID → heuristic filters → model-based quality filter → deduplicate → PII / toxicity → domain mix (+ synthetic) → decontaminate → order + anneal`.

- **Each stage discards a lot:** GPT-3 45 TB → 570 GB; FineWeb 15T tokens; DCLM-Baseline keeps ≈ 1.6% of a 240T pool (top 10% by a fastText classifier) and a 7B model on it performs similarly to Llama 3 8B with ~6.6× less compute (the DCLM authors' own comparison).
- **Dedup:** URL → exact hash → line → **near-duplicate = MinHash + LSH** (the chance two documents share a min-hash equals their Jaccard similarity $|A\cap B|/|A\cup B|$; LSH buckets avoid comparing all $n^2$ pairs) → **substring** (suffix array). Duplicates waste compute, cause memorisation/regurgitation and over-weight repeated content — but don't dedup blindly, and ≲ 4 epochs of repeated data is nearly as good as fresh.
- **Decontamination:** drop training text overlapping benchmarks — GPT-3 used **13-gram overlap** (and still had a bug). Do it *before* training; you can't un-memorise test data.
- **Synthetic data:** beware **model collapse** when it *replaces* real data (Shumailov, *Nature* 2024); *accumulating* it beside real data avoids it.
- **Order + anneal:** best data last — Llama 3 annealed on its final 40M tokens (LR → 0, upsampled code/maths), after long-context extension (8K → 128K).

**Stage 2 — SFT (Supervised Fine-Tuning)**: same next-token loss, only on the reply tokens (prompt masked); LR 10–100× below pre-training, 2–3 epochs. Hundreds–thousands of examples teach a *format* (LIMA: 1,000; InstructGPT: ~13K); hundreds of thousands (often synthetic; Tulu 3: ~940K) teach *skills*. Teaches the model *how* to be an assistant, not just to continue text.

**Stage 3a — RLHF**: human raters rank 4–9 responses per prompt → reward model (Bradley–Terry) → PPO with a KL constraint (clip ε = 0.2; up to 4 models in memory: policy, reference, reward model, critic):

$$R_\text{total} = R_\text{RM} - \beta D_{KL}(\pi \| \pi_\text{SFT})$$

InstructGPT's headline: raters preferred the **1.3B** aligned model over 175B GPT-3.

**Stage 3b — DPO (alternative)**: the KL-regularised RLHF objective has a closed-form optimum, so the reward is $\beta\log(\pi/\pi_\text{ref})$ and the partition function cancels in the Bradley–Terry loss, leaving

$$\mathcal{L}_\text{DPO} = -\log\sigma\Big(\beta\big[(\log\tfrac{\pi_\theta(y_w)}{\pi_\text{ref}(y_w)}) - (\log\tfrac{\pi_\theta(y_l)}{\pi_\text{ref}(y_l)})\big]\Big),\ \beta\approx0.1$$

on (prompt, chosen, rejected) pairs — no reward model, no RL loop; used by Llama 3, Zephyr, Tulu 3. It is **offline** (never sees the model's own latest mistakes), so tuned PPO can still beat it; weak spots: length bias, the chosen log-prob can fall, over-fitting near-deterministic preferences (→ IPO). Cousins: KTO (thumbs-up/down), SimPO/ORPO (no reference model). Code: [Ch 17 §3.5](#content/17_llm), rung 14.

**Stage 3c — RLVR & GRPO ([Ch 17 §3.5b](#content/17_llm))**: **RLVR** = reward from an *automatic checker* (answer match, unit tests) instead of a hackable learned reward model; **GRPO** is the optimiser that drops PPO's critic — sample $G$ answers per prompt and use $A_i = (r_i - \text{mean}(r))/(\text{std}(r)+\epsilon)$ as the advantage of all of answer $i$'s tokens, with PPO's clipped ratio + a separate KL term. A group that is all right or all wrong has advantage 0 and teaches nothing. DeepSeek-R1-Zero: GRPO straight on the base model with rule-based accuracy + format rewards (AIME 2024: 15.6% → ~71%). Modern stack: **SFT → DPO → RLVR/GRPO**. Code: rung 18. **Pick by the feedback you have:** demonstrations → SFT; chosen/rejected pairs → DPO; thumbs-up/down → KTO; a checker → RLVR; only a rulebook → RLAIF.

**Reward hacking** ([Ch 17 §3.5c](#content/17_llm)): the policy scores high on the proxy without doing what you meant — verbosity is the commonest hack; **proxy reward rising while KL balloons** is the warning light. Defences: KL penalty / β sweep, early stopping on a gold eval, length control, verifiers instead of learned rewards.

**Constitutional AI (Anthropic)**: the model critiques and revises its answers against written principles, then RLAIF (AI-generated preference labels) — no per-example human labels for harmlessness.

---

### Fine-Tuning & Alignment — LoRA, RLHF, DPO (★★★)

**LoRA (★★★)**: Freeze $W_0$; learn low-rank update $\Delta W = BA$ where $B \in \mathbb{R}^{d \times r}$, $A \in \mathbb{R}^{r \times d}$, $r \ll d$; $B$ starts at 0 so fine-tuning begins exactly at the pretrained model. For $d=4096$, $r=8$: 65K trainable params vs 16.7M — 256× fewer. At inference, merge: $W_\text{eff} = W_0 + BA$. Zero extra latency. Applied to q/v projections at minimum, often every linear layer. QLoRA loads base model in 4-bit + trains LoRA adapters: fine-tune a 7B model on a single 24GB GPU.

**RLHF (★★★)**:
1. SFT: fine-tune on high-quality (prompt, response) demonstrations (InstructGPT: ~13K).
![RLHF pipeline: SFT, reward model, PPO+KL, and DPO](diagrams/dlrev_rlhf_ai.png)
2. Reward Model: train on human rankings; objective: push $s_\text{win} - s_\text{lose}$ apart via $L = -\log\sigma(s_\text{win}-s_\text{lose})$.
3. PPO + KL constraint: $R_\text{total} = R_\text{RM} - \beta D_{KL}(\pi \| \pi_\text{SFT})$. KL term prevents reward hacking while keeping the model grounded.

**DPO (★★★)**: Skips the reward model. Directly fine-tunes LLM on (prompt, chosen, rejected) triples with a single loss that increases P(chosen) and decreases P(rejected), with implicit KL regularisation. Simpler, more stable, comparable quality. Used by LLaMA 3, Zephyr.

#### Fine-Tuning Methods Compared

| Method | Trainable Params | VRAM (7B) | Use case |
|--------|-----------------|-----------|---------|
| Full fine-tuning | 100% | ≥112 GB (16 B/param) + activations | When you have multi-GPU and large high-quality dataset |
| LoRA (r=16) | ~0.1–0.5% | 16–24 GB | **Standard choice for most tasks** |
| QLoRA (4-bit + LoRA) | ~0.1–0.5% | **8–12 GB** | Single consumer GPU (RTX 4090) |
| Prompt tuning | <0.01% | Base model VRAM | Very quick adapt, lower quality |
| Prefix tuning | ~0.1% | Base model VRAM | Between prompt and LoRA |
| Adapter layers | ~1% | Close to LoRA | Legacy; LoRA preferred |

**LoRA hyperparams that matter**: rank $r$ (try 8, 16, 32 — higher rank = more expressiveness but more params), alpha $\alpha$ (scale = $\alpha/r$, usually set $\alpha = 2r$), target modules (q_proj, v_proj at minimum; add k_proj, o_proj, gate_proj, up_proj, down_proj for more capacity). Too low a rank underfits domain-specific tasks; too high approaches full fine-tuning cost.

#### Will It Fit? Training Memory & ZeRO/FSDP ([Ch 17 §3.6](#content/17_llm))

Mixed-precision AdamW = **16 bytes/param** (2 BF16 weights + 2 grads + 12 for the FP32 master copy, Adam $m$ and $v$) → 7B = **112 GB**, 70B = 1,120 GB *before* activations; inference needs only the weights (7B = 14 GB). **ZeRO / FSDP** shard that redundancy across $N$ data-parallel GPUs: stage 1 optimizer state ($4+12/N$ B/param), stage 2 + gradients ($2+14/N$), stage 3 = FSDP + weights ($16/N$; 70B on 64 GPUs ≈ 17.5 GB each). Sharding makes the model *fit*, not train faster (ZeRO-3 moves ~1.5× DDP's traffic). Order of attack: DDP if it fits → FSDP/ZeRO-3 → tensor parallel *inside* an NVLink node → pipeline parallel across nodes (bubble ≈ $(p-1)/(m+p-1)$) → context parallel for long sequences, expert parallel for MoE.

---

### Scaling Laws (★★★)

**Kaplan et al. (2020)**: loss scales as a power law in parameters $N$, data $D$, and compute $C$ (exponents ≈ 0.076, 0.095, 0.050 → ≈ 5% lower loss per doubling of $N$):
$$\mathcal{L} \propto N^{-\alpha}, \quad \mathcal{L} \propto D^{-\beta}, \quad \mathcal{L} \propto C^{-\gamma}$$
This justified the push to ever-larger models (Kaplan: spend most extra compute on a bigger model — GPT-3 followed it, 175B on only 300B tokens).

**Chinchilla (Hoffmann et al., 2022)**: for a fixed *training*-compute budget, scale model size and data together. Rule of thumb:

> **Training tokens ≈ 20 × parameters**  (with $C \approx 6ND$: $N_\text{opt} = \sqrt{C/120}$)

Chinchilla (70B, 1.4T tokens) beat GPT-3 (175B, 300B) and Gopher (280B, 300B) at similar compute; LLaMA-13B (**1.0T** tokens, 77 tokens/param) beat GPT-3 on most benchmarks. Data quality and quantity matter as much as scale. **Over-training:** a model is trained once and served billions of times, so labs train smaller models far past 20 tokens/param — Llama 3 8B saw ≈ 15T tokens ≈ 1,900 tokens/param (~94× Chinchilla); inference compute passes training compute after serving ≈ $3D$ tokens. The fitted constants are illustrations (fit on 70M–16B models, hard to replicate), not a planning tool. Other axes: data-constrained scaling (repeat ≲ 4 epochs) and **test-time compute** (reasoning budget) as a third scaling axis.
![Scaling laws: Kaplan power laws and the Chinchilla rule](diagrams/dlrev_chinchilla_ai.png)

#### In-Context Learning & Emergent Abilities ([Ch 17 §3.9](#content/17_llm))

**ICL** = the model learns a task from examples *in the prompt* with **frozen weights**. The mechanism is unsettled: **induction heads** (copy `[A][B]…[A]→[B]`), *task recognition* (works even with wrong labels, doesn't improve with scale) versus *task learning* (a genuinely new mapping; appears with scale), and gradient-descent-like behaviour in toy settings. It is sensitive to **example order** (permuting can swing accuracy from near-SOTA to chance), format, label balance/recency and which examples (retrieve similar ones). **Many-shot** ICL (hundreds–thousands of examples in a 1M window) works, but you pay the example tokens on every call. ICL = change in minutes, fragile, per-call token cost; fine-tune = pay once, stable format/tone, for high volume; use RAG, not either, for new facts.

**Emergent abilities:** Wei et al. (2022) — skills absent in small models that appear at scale (CoT only paid off at ≈ 100B parameters in their model families). **Schaeffer et al. (2023): much of the sharpness is a metric artefact** — if per-token accuracy $p$ improves smoothly, an all-or-nothing score on a $k$-token answer is $p^k$ (a 20-token exact match jumps 0.12 → 0.82 as $p$ goes 0.90 → 0.99), while smooth metrics (log-loss, edit distance) rise gradually. Not all a mirage: users feel the threshold, and Du et al. (2024) report loss-threshold effects. Same arithmetic as agents: 20 steps at 95% each ≈ 36% end-to-end. Hold both views and forecast with continuous metrics.

---

### LLM Families

| Family | Architecture | Best for |
|--------|-------------|---------|
| GPT (OpenAI) | Decoder-only; reasoning is now a dial (`reasoning.effort`), not a separate o-series | Generation, chat, code, agents; GPT-6 family (Astra / Sol / Luna), ~1M context, text + images in |
| BERT (Google) | Encoder-only, bidirectional | Classification, NER, embeddings, reranking, search |
| Llama / Muse (Meta) | Llama 4: decoder-only, MoE, natively multimodal; newer open weights: Muse Spark Open (816B / 42B active, 1M ctx, Oct 2026) | Open-weight; Llama 4 Scout advertises 10M context |
| Claude (Anthropic) | Decoder-only; Claude 5.5 family (Haiku / Sonnet / Opus) + Fable 5.1 | Coding, agents, tool use, computer use, adaptive thinking (`effort`); 1M context; text + images in |
| Gemini (Google) | Sparse-MoE decoder, natively multimodal (Gemini 4 Argon / Carbon) | Text + image + audio + video in; up to 1M context; Google ecosystem |
| T5/BART | Encoder-decoder | Translation, summarisation, seq2seq |

*Names/dates as of early Nov 2026 ([Ch 17 §4.1–4.6](#content/17_llm)) — they date within months; learn the families and ideas, quote versions with a date, and check the vendor model card.*

**Why decoder-only won**: simpler scaling, natural few-shot (examples are input), one architecture for both understanding and generation, cacheable K/V, better compute efficiency per parameter. Evidence is nuanced: encoders do best after fine-tuning; decoders win the prompt-everything regime.

**MoE in modern LLMs** (routing and balancing: Ch 16 Part 6; deep dive + NumPy layer: [Ch 17 §4.8](#content/17_llm)): Llama 4 Scout = 109B total / 17B active (16 experts); DeepSeek-V3/R1 = 671B / 37B (256 routed, top-8, + 1 shared); DeepSeek-V4-Pro = 1.6T / 49B; Kimi K2 ≈ 1T / 32B. Per-token **compute** ≈ a small dense model, but **memory** is the full total (671 GB at FP8) and quality lands between the two, closer to the large one; it needs large serving batches and fast GPU-to-GPU links.

#### Multimodal LLMs — Vision, Audio & Native Multimodality ([Ch 17 §4.9](#content/17_llm))

A multimodal LLM turns non-text inputs into **tokens in the LLM's embedding space**. **Bolt-on:** a pretrained vision encoder (ViT / CLIP / SigLIP) + a small **projector** (MLP, Q-Former, resampler) + the LLM — cheap, but the encoder is a bottleneck (LLaVA, BLIP-2, Qwen-VL). **Native / early fusion:** one Transformer trained on interleaved text, images, audio and video from the start (Gemini, GPT-4o-style "omni", Llama 4, Chameleon; Gemma 4 12B is even encoder-free) — costly, text skills can regress; "native" is a spectrum. **Token arithmetic:** tokens $= \lceil H/p\rceil\lceil W/p\rceil$ — 224² at $p$=16 → 196; LLaVA-1.5's 336² at $p$=14 → **576**; video = frames × tokens/frame (Gemini bills ≈ 263 tokens/s, so an hour ≈ 947K tokens — nearly a whole 1M window). Cut cost with 2×2 neighbour merging (÷4), a 32–64-token resampler, lower resolution or fewer frames. Training: align the projector → multimodal instruction tuning → preference/RL, keeping text data mixed in. Failures: hallucinated objects, **counting** (tokens are patches, not objects), left/right, small text, video timing, and **prompt injection via text inside images**. Most models take images/video in but output text; generating images or speech is a separate model.

#### Is the Visible Reasoning Faithful? ([Ch 17 §15.1b](#content/17_llm))

Reasoning models (RLVR/GRPO + an adjustable thinking budget) print a chain of thought, but it is a *useful trace, not a guaranteed honest explanation*: training rewards the final answer, so nothing forces the text to mention what drove it. **Hint experiment:** plant a hint ("a professor says C"); if the answer flips, the hint caused it — does the CoT admit it? Chen et al. (Anthropic, 2025): Claude 3.7 Sonnet admitted it ≈ **25%** and DeepSeek-R1 ≈ **39%** of the time (lower for "unauthorised access" hints); models that exploited reward hacks did not mention them more. CoT is still a valuable **monitor** (a weaker model reading it catches reward hacking), but training *against* "bad thoughts" teaches models to hide intent. Say: "CoT raises accuracy and helps monitoring, but can omit or rationalise — evidence, not proof; verify answers independently."

#### LLM Key Papers Timeline

| Year | Paper | Impact |
|------|-------|--------|
| 2017 | *Attention Is All You Need* (Vaswani et al.) | Transformer architecture born |
| 2018 | *BERT* (Devlin et al.) | Bidirectional pre-training, fine-tune once |
| 2018 | *GPT-1* (Radford et al.) | Generative pre-training demonstrated |
| 2020 | *Scaling Laws* (Kaplan et al.) | Power-law loss vs N, D, C |
| 2020 | *GPT-3* (Brown et al.) | In-context learning emergent at scale |
| 2021 | *RoPE / RoFormer* (Su et al.) | Positions as rotations → attention sees relative distance |
| 2021 | *LoRA* (Hu et al.) | Fine-tune a low-rank add-on, not the whole model — PEFT standard |
| 2022 | *Chinchilla* (Hoffmann et al.) | Training tokens ≈ 20 × params |
| 2022 | *InstructGPT* (Ouyang et al.) | RLHF for alignment, birth of ChatGPT approach |
| 2022 | *FlashAttention* (Dao et al.) | **Exact** attention via tiling + online softmax; O(N) extra memory, same O(N²) compute |
| 2022 | *Constitutional AI* (Bai et al.) | AI feedback guided by written principles (RLAIF) |
| 2023 | *LLaMA / LLaMA 2* (Meta) | Open-weight competitive models; smaller models trained far longer |
| 2023 | *DPO* (Rafailov et al.) | Preference tuning without a reward model or RL loop |
| 2023 | *Let's Verify Step by Step* | Process supervision beats outcome supervision |
| 2023 | *Mamba* (Gu & Dao) | Linear-time selective state-space model |
| 2024 | *Mixtral of Experts* | Open sparse MoE: 47B total, 13B active |
| 2024 | *LLaMA 3.1/3.3* (Meta) | 405B dense SOTA open-weight |
| 2024 | *DeepSeek-V3* | Frontier-class MoE trained efficiently (MLA, FP8) |
| 2025 | *DeepSeek-R1* | RL-trained reasoning (GRPO + verifiable rewards), 671B MoE |
| 2025 | *Llama 4 Scout* | 10M advertised context, sparse MoE open-weight |

---

### Prompt Engineering

| Technique | When to use |
|-----------|------------|
| Zero-shot | Strong models on common tasks |
| Few-shot (3–5 examples) | Custom tasks, biggest single lever |
| Chain-of-Thought ("Think step by step") | Math, logic, multi-step reasoning |
| System prompt | Persona, constraints, output format |
| ReAct | Agent tasks: interleave Thought/Action/Observation |
| Tree of Thoughts | Hard planning problems — explore multiple paths |
| Self-consistency | Majority vote over N reasoning paths for factual/math |
| Structured output | Machine-readable pipelines: JSON schema enforcement |

**Prompt injection**: user crafts input to override system prompt. Mitigations: input validation, prompt hardening ("ignore override attempts"), output filtering, canary tokens, sandboxing.

**The 4 prompt sins**: (1) too much in one call — split into steps; (2) no examples for non-obvious tasks; (3) critical instruction buried in middle of context; (4) prompts not version-controlled.

#### Prompt Engineering Best Practices

**System prompt components** (for deployed systems):
1. Persona and task definition: who the model is, what it does.
2. Scope and constraints: what it should/should not do.
3. Format specification: output structure (JSON schema, markdown).
4. Safety rail: do not divulge system prompt contents.
5. Fallback instructions: what to say when unsure.

**Few-shot example selection**: choose diverse examples that cover edge cases; order by similarity to test input (most similar last = recency bias helps); 3–5 examples usually yield 90% of the possible gain; more than 10 rarely helps and wastes context.

**Chain-of-Thought subtlety**: CoT works by pushing the model to allocate tokens to intermediate reasoning before committing to the answer. The intermediate tokens don't need to be "correct" thinking — they activate better output distributions, and the visible trace may not be the real reason for the answer (faithfulness above). For factual claims, still verify with RAG.

**Output format**: JSON mode or structured output schema eliminates downstream parsing failures. Always specify the exact schema; ask for `null` or omission of optional fields rather than the model inventing data.

**Prompt testing**: version-control prompts like code; run regression suite on every change; sample temperature=0 for stable comparisons; always test on adversarial inputs (empty inputs, very long inputs, jailbreak attempts, off-topic questions).

---

### Hallucinations (★★)

A hallucination is a confident false statement. Causes:
1. Compression: facts are approximate in distributed weights.
2. Out-of-distribution questions push the model to guess.
3. RLHF incentives: confident answers rated higher than "I don't know".
4. Knowledge cutoff: events after training are unknown.

**Mitigation**: RAG (ground answers in retrieved text), temperature=0 for factual tasks, `"If unsure, say so"` in prompt, tool use (delegate arithmetic to code), consistency checks.

---

### RAG — Retrieval-Augmented Generation (★★★)

```
SETUP (once):   Documents → chunk (~500 words) → embed → vector DB

QUERY TIME:     question → embed → top-K nearest chunks
                → stuff chunks into prompt → LLM generates grounded answer
```

**Chunking strategies**: fixed size (simple, splits sentences), recursive (paragraph→sentence→word), semantic (split at topic boundaries), overlapping (50–100 token overlap prevents gaps).

**Why RAG beats fine-tuning for facts**: update docs without retraining; cite sources; no hallucinated facts (model reads real text).

**Modern RAG improvements** (see Ch 19 for full detail): HyDE, hybrid search (vector + BM25), reranking (cross-encoder), contextual chunking, query rewriting, agentic RAG.

---

### Embeddings & Vector Databases

An embedding model converts text → dense vector (e.g., 1536 dims). Similar meaning → similar vectors. Used for semantic search, RAG retrieval.

$\text{cosine similarity}(A,B) = \frac{A \cdot B}{\|A\|\|B\|}$ — ignores magnitude, measures angle. Range: −1 (opposite) to 1 (identical).

**Vector search algorithms**: brute force $O(n)$; HNSW graph $O(\log n)$; IVF (cluster then search); PQ (compress vectors).

---

### Evaluation

| Metric | What it measures | Notes |
|--------|-----------------|-------|
| **Perplexity** | $e^{\text{loss}}$ (nats) $= 2^{H}$ (bits) — model surprise at test text | Lower = better; compare only models sharing a tokenizer and test text; doesn't directly measure usefulness |
| BLEU | N-gram precision vs reference (translation) | Misses semantic equivalence |
| ROUGE-L | Longest common subsequence recall (summarisation) | ROUGE-1 = unigram, ROUGE-2 = bigram |
| MMLU, HumanEval, GSM8K | Academic knowledge / Python functions / grade-school maths | **Saturated** — no longer separate frontier models |
| SWE-bench Verified | Real GitHub bug fixes | Frontier scored ~88% by mid-2026, but **OpenAI stopped reporting it in Feb 2026** (flawed tests, training-data leakage) and recommends SWE-bench Pro — cite with that caveat |
| GPQA Diamond | Graduate-level science | Active — frontier ~94% |
| Arena (arena.ai; formerly LMArena / Chatbot Arena) | Crowd-sourced head-to-head human preference (Elo) | Best real-world signal, but use with caution; coding/agent benchmarks are self-reported and **scaffold-sensitive** (ARC-AGI-3: 62.7% vs 99.9% depending on the harness) — report model + harness + date |

---

### Inference Optimisation (★★)

**Quantisation**: reduce weight precision from FP32/FP16 to INT8 or INT4.

| Precision | Memory (70B model, weights only) |
|-----------|-------------------|
| FP32 | 280 GB |
| FP16/BF16 | 140 GB |
| INT8 | 70 GB |
| **INT4** | **35 GB** (one 48–80 GB GPU or 2×24 GB — *not* a single 24 GB card — plus KV cache) |

FP16→INT8: <1% quality loss. FP16→INT4: 1–3% loss. Methods: GPTQ (GPU inference), AWQ (activation-aware, better quality), GGUF (CPU/edge, used by llama.cpp).

**KV Cache**: cache Key and Value tensors from prior tokens so each step computes only the new token's K,V and attends over the cache (no re-processing of the prefix). Memory per token $= 2 \times n_\text{layers} \times n_\text{kv-heads} \times d_\text{head} \times \text{bytes}$ — grows **linearly** with context and batch. Use *KV* heads, not query heads (an 8× slip for Llama-3-70B): 320 KiB/token → 2.5 GiB at 8K, 40 GiB at 128K per request (2.5 MiB/token with full MHA).

**FlashAttention**: exact tiled attention with an online softmax; never materialises the $N \times N$ matrix. Extra memory $O(N^2) \to O(N)$; faster (≈ 3× on GPT-2 training) because it moves fewer bytes between HBM and SRAM. Compute is still $O(N^2 d)$ and the KV cache is unchanged. Standard in modern training and prefill.

**Speculative decoding**: small draft model generates K candidate tokens; large model verifies all K in one parallel forward pass; reject and regenerate from first mismatch. Net: 2–3× speedup with zero quality loss.

> ✅ **Must-remember**
>
> - **Chinchilla rule**: training tokens ≈ 20× parameters *for training-compute-optimal* runs; data matters as much as scale. Served-a-lot models are deliberately **over-trained** (Llama 3 8B ≈ 1,900 tokens/param).
> - **Attention** = softmax$(QK^T/\sqrt{d_k})V$, $O(N^2)$ compute. The KV cache grows **linearly** with context (320 KiB/token for a 70B GQA model → 40 GiB at 128K) and spares re-computing the prefix.
> - **FlashAttention** ([§2.4](#content/17_llm)): attention is memory-bound, so tile Q,K,V into SRAM with an online softmax (running max and sum) instead of storing the $N\times N$ matrix — exact, $O(N)$ extra memory, FLOPs unchanged.
> - **Long context** ([§2.7](#content/17_llm)): compute $\propto n^2$, KV cache $\propto n$, untrained positions, lost in the middle; keep the first ~4 **attention-sink** tokens when streaming; advertised ≠ effective length; needle-in-a-haystack is only a smoke test.
> - **Pre-training data pipeline** ([§3.1b](#content/17_llm)): crawl → filter → deduplicate (MinHash + LSH) → decontaminate (13-gram overlap) → mix → anneal. Duplicates ⇒ memorisation; contamination ⇒ inflated benchmarks.
> - **RLHF**: SFT → RM → PPO+KL. **DPO**: closed-form shortcut, direct from preference pairs (offline). **RLVR/GRPO** ([§3.5b](#content/17_llm)): a checker reward + group-relative advantage, no critic — what powers reasoning models.
> - **In-context learning vs emergence** ([§3.9](#content/17_llm)): ICL changes behaviour, not weights, and is order/format-sensitive; "emergence" is partly a metric artefact (exact match on $k$ tokens $= p^k$).
> - **MoE** ([§4.8](#content/17_llm)): top-$k$ gates + a balance loss (or a bias) stop routing collapse; compute = active params, **memory = all params**; experts are not topic specialists.
> - **Multimodal LLM** ([§4.9](#content/17_llm)) = encoder → projector → tokens ($\lceil H/p\rceil\lceil W/p\rceil$: 336² at $p$=14 = 576); video multiplies it; native = one Transformer on all modalities.
> - **Reasoning traces are evidence, not proof** ([§15.1b](#content/17_llm)): models admit a planted hint only ≈ 25–39% of the time; never present CoT as "the explanation".
> - **RAG** = retrieve then generate; grounding beats memorisation for facts.
> - **Temperature, top-p/min-p** control randomness; temperature 0 = greedy (a special case); mask dropped logits with $-\infty$.
> - **INT4 quantisation** shrinks a 70B model to ≈ 35 GB (one 48–80 GB GPU, not a 24 GB card) with ~1–3% quality loss.
> - **BLEU** measures n-gram precision (translation); **ROUGE** measures recall (summarisation). Both fail to capture semantic meaning — they measure surface overlap only.
> - **Arena Elo** is a useful real-world signal; academic benchmarks (MMLU, HumanEval, GSM8K) are saturated, and SWE-bench Verified is contaminated (OpenAI stopped reporting it, Feb 2026).
> - **PagedAttention** (vLLM) makes the KV cache manageable in production by treating it like OS virtual memory.

---

## Ch 17c — LLM Systems: Serving, Scaling & Measuring

> 💡 **In a sentence —** Inference has two phases with opposite bottlenecks (prefill = compute-bound, decode = bandwidth-bound); almost every serving optimisation helps exactly one of them, and evaluation is the four-layer stack that tells you whether any of it worked.

---

### Prefill vs Decode — the master model

| | **Prefill** | **Decode** |
|---|---|---|
| Processes | Whole prompt in parallel | One token at a time |
| Bottleneck | **Compute** (math units) | **Memory bandwidth** |
| Sets | **TTFT** | **TPOT / ITL** |
| Helped by | Chunked prefill, prefix caching, W8A8/FP8 | Batching, weight-only quantization, speculative decoding, GQA |

**Bandwidth ceiling:** max tok/s = per-GPU bandwidth ÷ bytes of weights **per GPU**. A 70B FP16 (140 GB) sharded over 2×H100 → 70 GB each ÷ 3.35 TB/s ≈ **48 tok/s** for one stream. At INT4 (35 GB) on one GPU ≈ **96 tok/s**. Always state the shard count.
![Prefill vs decode and the bandwidth ceiling formula](diagrams/dlrev_bandwidth_ai.png)

### KV cache — the formula to memorise

**KV bytes = 2 × layers × KV-heads × head-dim × seq-len × bytes**

Llama-3-70B (80 layers, 8 KV heads, dim 128, FP16) → **320 KiB/token** (≈ 0.33 MB). With plain MHA (64 KV heads) it would be 2.5 MiB/token — the 8× gap *is* why GQA exists. Use KV heads, not query heads, in the formula, and multiply by concurrent requests.

| Context | 4K | 8K | 32K | 128K |
|---|---|---|---|---|
| KV cache per request (GiB) | 1.25 | 2.5 | 10 | **40** (≈ 43 GB decimal) |

At 128K the cache rivals the quantized weights (35 GB at INT4) and at 1M (320 GiB) it exceeds even the FP16 weights → KV quantization (FP8 halves it) becomes the lever, not weight quantization. The cache grows *linearly* with context; attention *compute* grows quadratically.

### The four metrics

**TTFT** (prefill + queue) · **TPOT/ITL** (decode) · **throughput** (your bill) · **P95/P99** (queueing). Chat targets: TTFT < 300 ms, TPOT < 30 ms. Total = TTFT + TPOT × output tokens. Bigger batch → more throughput, worse TPOT and tail.

### Serving optimisations

| Technique | What it does | Watch out for |
|---|---|---|
| **Continuous batching** | Refills slots at token granularity; ~10–20× throughput | Needs paged KV; raises TPOT under load |
| **PagedAttention** | Block table + free list; utilisation 20–40% → 90%+ | Kernel indirection; block-size trade-off |
| **FlashAttention** | Exact tiled attention + online softmax — never writes the $n\times n$ matrix to HBM | Helps training and prefill most; FLOPs and KV-cache size unchanged (Flash-Decoding for decode) |
| **Chunked prefill** | Interleaves prefill slices with decode | Slightly worse TTFT for the long request |
| **Prefix caching** | Reuses KV of a shared prefix | Put variable content **last**, or it never hits |
| **Semantic caching** | Skips the model on similar questions | Can return a *wrong* answer |
| **Speculative decoding** | Draft + verify; lossless | Needs α > ~0.6; useless at high batch |
| **Disaggregation** | Separate prefill/decode pools | Must ship GB of KV between pools |

**Speculative decoding maths:** E[tokens] = (1 − α^(γ+1))/(1 − α). At α = 0.8, γ = 4 → **3.36 tokens/step**. At α = 0.3 → 1.43, a net loss.

### Quantization — the question people get wrong

- **Weight-only** (GPTQ, AWQ, NF4) → helps **decode** only (fewer bytes streamed)
- **W8A8 / FP8** → helps **both**, because activations are quantized too and the low-precision tensor cores engage
- 70B: FP16 140 GB · FP8 70 GB · INT4 35 GB. Dropping to INT4 on one H100 frees ~45 GB for KV cache — the concurrency win usually beats the hardware saving.
- **Multi-LoRA:** one resident base model, ~30 MB adapters per request; different adapters share a batch because only the low-rank term differs.

### Evaluation stack

```
4. ONLINE      A/B tests, guardrails, cost & latency   ← slowest, truest
3. JUDGE       LLM-as-judge on open-ended output
2. GOLDEN SET  50–200 curated cases, run every change
1. ASSERTIONS  valid JSON? cites source? no PII?        ← fastest
```

**LLM-as-judge biases:** *position* (swap order and average), *verbosity* (length-control), *self-preference* (use a different model family). Prefer **pairwise** over absolute 1–10; calibrate against human labels first.

**Golden sets:** built from **real production failures**, versioned in git, mostly deterministic assertions. Every incident becomes a permanent case.

**A/B traps:** peeking (fix sample size up front), novelty effect, wrong primary metric, high variance. One primary metric + guardrails on latency, cost and escalation rate.

### Cost arithmetic (do this out loud)

1M req/day × (500 in + 200 out) = 500M in + 200M out. At $5/$25 per M → **$7,500/day ≈ $225k/mo**. Self-host: 200M ÷ 86,400 ≈ **2,315 out tok/s** → ~2×8×H100 ≈ **$23k/mo**. Caveats: headcount, peak-vs-mean capacity, quality gap. **Cache first** — 30% hit rate is a day's work and 30% off the bill.

---

## Ch 18 / 18b — AI Agents & Tool Use

> **Chapter 18 is now two chapters.** [Ch 18](#content/18_ai_agents) = how an agent works (loop, tools, MCP, patterns, multi-agent, memory, context engineering). [Ch 18b](#content/18b_agents_in_production) = how you run one safely (failure modes, injection defence, evaluation, human gates, sandboxing, long-running agents).

### Agents in production — the flashcard version

**Five failure modes:** prompt injection · tool misuse · infinite loops · hallucinated tool calls · cost explosion. Each needs a *guard*, not a better prompt.

**Jailbreak vs injection.** Jailbreak attacks the vendor's safety training; injection attacks *your* instructions. Indirect injection (payload inside a page, PDF or RAG chunk the agent reads) is the dangerous one — invisible to the user, and with tools attached it becomes real actions. "Ignore instructions in the input" cannot work: instructions and data share one channel.

**Dual-LLM (CaMeL):** privileged model plans and holds tools but never sees untrusted bytes; quarantined model reads untrusted content but has no tools. Only schema-validated values cross. Same principle as parameterised SQL.

**MCP attacks:** *tool poisoning* (instructions hidden in tool metadata) · *rug pull* (definition changed after approval — hash at approval, re-verify on load) · *cross-server shadowing*.

**Action classification:** read-only → allow · low-risk write → allow + log · high-risk → confirm · irreversible → explicit human approval, always.

**Containment:** process < container < gVisor < Firecracker. Filesystem isolation without a **default-deny egress allowlist** still permits exfiltration. Hard budgets on tokens, steps, time and cost, then escalate.

**Long-running agents:** durable state + checkpoint/resume · **idempotency keys** on side-effecting calls · re-check permissions at point of *use* · re-validate the goal (it may be stale).

**Dashboard:** task success · tool-call error rate · steps p95 · cost per task · escalation rate (two-sided alarm — zero usually means the gate broke) · safety events · **trace replay**.

---


> 💡 **In a sentence —** An AI agent is an LLM operating in a loop — observe → think → act → observe — that uses tools to accomplish multi-step goals autonomously in the real world.

---

### The Agent Loop

```
User Goal
    │
    ▼
Observe (context, results) → Think (LLM reasons) → Act (tool call / API)
                                    ▲                       │
                                    └───────────────────────┘
                               (repeat until done or max steps)
```

**ReAct pattern** (Reason + Act): LLM alternates between `Thought: ...` and `Action: tool(args)` and `Observation: result`. Makes reasoning interpretable; audit trail for debugging. When to use an agent vs simple prompt: if the task requires multiple steps, external data, or trial-and-error — use an agent. If a single LLM call suffices — don't.

---

### Function Calling / Tool Use

The LLM outputs structured JSON specifying which function to call + arguments. Your code executes the function. The LLM never executes anything directly — **critical security boundary**.
![Function calling: the LLM never executes tools directly](diagrams/dlrev_toolcalling_ai.png)

```
App → (message + tool schemas) → LLM
LLM → tool_call JSON → App
App → executes tool → result
App → (result) → LLM
LLM → final answer
```

**Tool design best practices**: specific names, precise descriptions (model reads these), typed parameters with constraints, return structured JSON (not prose), handle errors gracefully, keep tools focused (one action each).

All major providers (OpenAI, Anthropic, Google) follow the same pattern: define schemas → model outputs JSON → you execute.

---

### Model Context Protocol (MCP)

> **MCP** is an open protocol (Anthropic, 2024) standardising how LLM apps connect to tools, data, and services — "USB-C for AI." 97M installs by March 2026; 10,000+ servers.

**Architecture**: Host (your app) → MCP Clients → MCP Servers (GitHub, DB, Slack…) over JSON-RPC 2.0. Replaces N×M custom integrations with N+M.
![MCP architecture: hosts, clients, servers, and three primitives](diagrams/dlrev_mcp_ai.png)

**Three primitives**:
| Primitive | What | Who controls |
|-----------|------|-------------|
| **Tools** | Functions (verbs) | Model-controlled |
| **Resources** | Data (nouns) | App-controlled |
| **Prompts** | Templated workflows (recipes) | User-controlled |

**Transports**: stdio (local/dev, server as subprocess) vs Streamable HTTP (remote/production, SSE streaming). Production: sticky sessions or external state for horizontal scaling.

**Security risks**: prompt injection via tool outputs, excessive permissions, data exfiltration, unauthorised destructive tool calls. MCP 2026 spec: OAuth 2.1 + tool annotations (readOnlyHint, destructiveHint) — but treat server annotations as hints from potentially-untrusted code.

---

### Agent Architecture Patterns

| Pattern | When to use | Key detail |
|---------|------------|-----------|
| **Single agent** | One model + a few tools | Simplest; breaks down with many tools or huge context |
| **Router** | Multiple distinct task types | Cheap model classifies → specialist handles; N×M → N+M cost |
| **Pipeline (sequential)** | Fixed ordered steps | Deterministic; brittle if any step fails |
| **Orchestrator-worker** | Complex tasks with parallel subtasks | Orchestrator plans + delegates; workers execute in parallel |
| **Evaluator-optimiser** | Quality loops | Generator produces, evaluator scores, loop until pass |

57% of enterprise project failures originate in orchestration design (Anthropic analysis of 200+ deployments).

---

### A2A Protocol

> **A2A** (Google, April 2025, now Linux Foundation) standardises **agent-to-agent** communication. MCP = agent-to-tools. A2A = agent-to-agents (cross-org, cross-vendor).

A2A v1.0: Agent Cards (JSON capability metadata + cryptographic verification) + Tasks (structured work units) over HTTP/JSON-RPC. 150+ organisations support it (Google, Microsoft, AWS, Salesforce, SAP, IBM).

---

### Agent Memory & Context Engineering

**Memory types**:
```
Short-term (within session):  context window, tool results, scratchpad
Long-term (across sessions):  vector DB (semantic search), summarised history,
                               user profile, knowledge base
State (multi-step tasks):     checkpoints (LangGraph MemorySaver / PostgresSaver)
```

When context window fills: (1) truncate oldest, (2) summarise older turns, (3) sliding window + retrieval from vector DB.

**Context engineering** (2026 named discipline): designing everything in the context window — system prompt, RAG docs, tool results, history, memory — to maximise output quality. The context stack:

```
1. System prompt  (static, developer-set)
2. Retrieved docs  (RAG, per-query)
3. Tool results  (dynamic, per-step)
4. Conversation history  (growing, per-turn)
5. Structured memory  (persistent, compressed)
6. User message  (current turn)
```

---

### Production Failure Modes

| Failure | Mitigation |
|---------|-----------|
| Prompt injection (malicious tool outputs) | Sanitise outputs; content filtering; judge models |
| Tool misuse / wrong args | User confirmation for destructive tools; strict param validation |
| Infinite loops | Max iterations (e.g., 25); detect repeated identical calls; timeout |
| Hallucinated tool calls | Validate every call against registered tool list |
| Cost explosion | Per-request cost limits; use cheap models for routing |
| Context overflow | Summarise tool outputs; token budgets per section |

**HITL (Human-in-the-Loop)**: pause before irreversible or high-blast-radius actions (delete, deploy, bulk update, financial txns). Serialise full agent state to checkpoint; notify human; resume on approve/deny.

#### Agent Evaluation

Evaluating agents is harder than evaluating single LLM calls because correctness is multi-step and often path-dependent.

**Evaluation hierarchy**:
1. **Unit tests on tools**: does each tool return the right output? Pure, fast, reliable.
2. **Task-level evals**: does the agent complete the goal? Run 50–200 reference tasks; binary pass/fail.
3. **Trajectory evals**: is the agent taking efficient, sensible steps? LLM-as-judge on step-by-step trace.
4. **Safety red-team**: can it be prompted to misuse tools? Run adversarial prompts systematically.

**Key metrics for agent systems**:
- **Task success rate** — gold standard; compare to human baseline.
- **Steps to success** — efficiency proxy; too many steps = cost and reliability risk.
- **Tool call accuracy** — fraction of tool calls that are correctly specified (right tool, valid args).
- **Hallucinated tool calls** — fraction that invoke non-existent tools; should be 0.
- **Cost per task** — total token cost; catches runaway loops before they hit production.

**SWE-bench Verified** was the most widely-cited agent benchmark (2025–2026): 500 real GitHub issues from verified-solvable repositories. Measures end-to-end coding agent performance with patch submission and automated test evaluation. Caveat: OpenAI stopped reporting it in Feb 2026 (flawed tests, training-data leakage); scores also swing with the scaffold.

**LLM-as-judge** for agent evaluation: ask a strong model (GPT-5.6 or Claude Opus) to score the agent's final response and trace against a rubric. Faster and cheaper than human annotation, but suffers from self-preference and verbosity biases — mitigate by using a different model family as the judge.

> ✅ **Must-remember**
>
> - Agent = LLM in a loop with tools; chatbot = single pass.
> - **ReAct** interleaves Thought/Action/Observation — interpretable + more accurate.
> - **MCP** = N+M integrations (not N×M); Tools/Resources/Prompts primitives.
> - **A2A** = agent-to-agent cross-org coordination; MCP = agent-to-tools.
> - Start with one agent; add multi-agent only when a single agent demonstrably fails.
> - Production agents need: max iterations, cost limits, confirm-destructive, logging, HITL path.

---

## Ch 19 — AI Frameworks & Engineering

> 💡 **In a sentence —** The 2026 AI engineering stack layers agent frameworks, RAG tooling, vector databases, evaluation, and inference servers into a production lifecycle; knowing when to use each layer — and when to skip it — is the core skill.

---

### Framework Landscape

```
         LangChain / LangGraph  ←  agents, multi-step, stateful
         LlamaIndex Workflows   ←  document-heavy RAG, data
         DSPy                   ←  prompt optimisation with evals
         Pydantic AI            ←  type-safe agents
         CrewAI / AutoGen       ←  multi-agent roles
         Google ADK             ←  GCP-native enterprise agents
              ↓
         vLLM (production) / Ollama (local dev)
              ↓
         pgvector / Qdrant / Weaviate / Pinecone
              ↓
         MLflow 3 / LangSmith / Ragas / DeepEval
```

---

### LangChain 1.0 + LangGraph 1.0

**LangChain 1.0 GA**: October 22, 2025. LCEL pipe-syntax: `prompt | model | parser`. `create_agent` for single agent with tools. Swap model/provider without touching the rest.

**LangGraph 1.0**: for workflows with cycles, branches, and durability. Graph of state-typed nodes with conditional edges. Headline: durable state (resume after crash), built-in persistence, first-class HITL pauses.

**LangSmith**: traces every prompt, retrieval, tool call, and token. Single most useful debugging tool for "almost working" agents. Enable: `LANGSMITH_TRACING=true`.

**When to reach for LangChain**: RAG, chatbots, agents, multi-step, fast provider switching. Use raw SDK for simple 50-line scripts; use LlamaIndex for heavy document ingestion.

---

### LlamaIndex Workflows 1.0

**LlamaIndex** specialises in connecting LLMs to data. **Workflows 1.0** (June 2025): event-driven, async-first agent runtime. Each `@step` receives typed events and emits typed events — natural fan-out, pause/resume.

Three-line RAG: `SimpleDirectoryReader → VectorStoreIndex → query_engine`. Parses 200+ formats (PDF, docx, md, html).

**vs LangChain**: LlamaIndex wins on data parsing and retrieval primitives; LangChain wins on agent orchestration breadth. Many production stacks combine both.

---

### DSPy — Programming, Not Prompting

**DSPy** (Stanford): declare a `Signature` (input→output types), wrap in a `Module`, run `MIPROv2` optimizer with 20 labelled examples and a metric → it finds the best prompt+demonstrations. 10–40% quality gains over hand-written prompts. Compiled prompts are saved as JSON and survive model swaps.

Use DSPy when you have evals and care about numbers. Skip it when you don't — no eval set = nothing to optimise against.

---

### Pydantic AI

Type-safe agents: inputs, outputs, tool signatures are all Pydantic-typed. If model returns invalid JSON/wrong schema → auto-retry with validation error. Zero manual JSON schema writing. `Instructor` is the cousin for non-agent use cases (wraps any OpenAI-compatible client to return Pydantic models).

---

### Multi-Agent Frameworks

| Framework | Model | Sweet spot | Status |
|-----------|-------|-----------|--------|
| **LangGraph** | Explicit state graph | Production, durability, branching, HIL | **GA** |
| **CrewAI** | Role-based crews | Pipeline-style, low learning curve | Active |
| AutoGen / AG2 | Conversational GroupChat | Research, code-gen experiments | Maintenance mode |
| **Google ADK** | Code-first, GCP-native | Enterprise GCP, multi-agent | Active |

Warning: every agent turn = at least one LLM call. 4-agent debate × 5 rounds = 20+ calls. Quantify cost before adopting multi-agent.

#### HuggingFace Ecosystem

For open-source model work, HuggingFace provides the de-facto standard libraries:

| Library | Purpose | Key APIs |
|---------|---------|---------|
| `transformers` | Load/run any open model | `AutoModelForCausalLM.from_pretrained()` |
| `datasets` | Load/process datasets | `load_dataset("name")` |
| `TRL` | SFT, DPO, PPO training | `SFTTrainer`, `DPOTrainer`, `PPOTrainer` |
| `PEFT` | LoRA, prefix, adapters | `get_peft_model()`, `LoraConfig` |
| `accelerate` | Multi-GPU/multi-node | `Accelerator()`, device map auto |
| `bitsandbytes` | INT8/INT4 quantisation | `load_in_4bit=True` |

**QLoRA fine-tuning checklist**:
```python
# 1. Load model in 4-bit
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.bfloat16
)
# 2. Wrap with LoRA
config = LoraConfig(r=16, lora_alpha=32,
    target_modules=["q_proj","v_proj","k_proj","o_proj"],
    lora_dropout=0.05)
model = get_peft_model(model, config)
# 3. Train with SFTTrainer
trainer = SFTTrainer(model=model, train_dataset=dataset,
    args=TrainingArguments(output_dir="./qlora-output",
        per_device_train_batch_size=4, gradient_accumulation_steps=4,
        num_train_epochs=3, learning_rate=2e-4))
trainer.train()
```

After training, merge LoRA into base weights for single-file deployment: `model.merge_and_unload()`, then save with `model.save_pretrained()`.

---

### Vector Databases

| DB | Best for |
|----|---------|
| **pgvector** | <10M vectors, already on Postgres — default for most teams |
| **Qdrant** | High-throughput open source; fastest p99 at 10M vectors |
| **Weaviate** | Hybrid search (vector + BM25) out of the box |
| **Pinecone** | Managed, zero ops |
| **Milvus/Zilliz** | Billions of vectors, distributed |
| Chroma | Local dev/prototyping |

**Key insight**: pure vector search underperforms **hybrid search** (vector + BM25 + metadata filters) on most real workloads. IDs, names, version numbers need exact match; meaning needs vectors.

---

### Modern RAG

Vanilla RAG: chunk → embed → top-K → stuff into prompt. Fails in specific ways; fix each failure mode:

| Vanilla fails when | Fix | What it does |
|-------------------|-----|-------------|
| Question and doc use different words | **HyDE** | Generate hypothetical answer; embed that; retrieve against it |
| Top-K by similarity ≠ top-K by meaning | **Reranking** | Cross-encoder rescores top-20 → keep best 3 |
| Chunk meaningless alone | **Contextual chunking** | Prepend doc summary to each chunk |
| Multi-part question | **Query rewriting** | LLM splits into sub-queries |
| Not every Q needs retrieval | **Agentic RAG** | LLM decides whether and what to retrieve as a tool call |
| Facts are relational | **Graph RAG** | Retrieve subgraphs from knowledge graph |
| Exact ID/SKU match fails | **Hybrid search** | Vector + BM25 union |

**Biggest quality lever after embeddings: reranking**. Retrieve 20, rerank to 3 with a cross-encoder (e.g., Cohere Rerank).

---

### Evaluation & Observability

**Three layers**: offline evals (curated test set per release), online evals (LLM-as-judge on live traffic samples), tracing (every prompt, retrieval, tool call).

| Tool | Purpose |
|------|---------|
| **Ragas** | Reference-free RAG metrics: faithfulness, context precision, answer relevancy |
| **DeepEval** | pytest-style LLM unit tests; CI/CD friendly |
| **LangSmith** | Tracing + evals; deepest LangChain integration |
| **MLflow 3.0** | Unified ML + GenAI lifecycle; prompt registry; OpenTelemetry tracing |
| **W&B Weave** | Evals + tracing + dashboards |
| **promptfoo** | CLI regression detection, red-team |

**LLM-as-judge failure modes**: verbosity bias (prefers longer), self-preference (GPT-4 prefers GPT-4 outputs), position bias (first option rated higher). Fixes: require span citations, swap order and average, use different model family as judge.

---

### Inference Servers

```
Local dev:       Ollama (easiest, "docker run a model")
                 llama.cpp (CPU/GGUF)
Production:      vLLM (DEFAULT) — PagedAttention, 5–10× throughput
                 SGLang — fast for structured/agent workloads
                 TensorRT-LLM — peak NVIDIA performance, complex setup
                 TGI — ⚠ MAINTENANCE MODE since 2026; migrate
```

**vLLM PagedAttention**: partitions KV cache into fixed-size blocks (like OS virtual memory pages); eliminates fragmentation; 2–10× more concurrent users on same GPU. Red Hat benchmark: vLLM 793 tok/s vs Ollama 41; p99 TTFT 80ms vs 673ms. Stripe saved 73% migrating to vLLM.
![vLLM and PagedAttention versus Ollama benchmarks](diagrams/dlrev_vllm_ai.png)

**Most teams**: Ollama for dev, vLLM for prod.

---

### Google AI Engineer Stack

**Gemini Enterprise Agent Platform** (rebranded from Vertex AI at Cloud Next 2026):

| Component | Role |
|-----------|------|
| **ADK** | Open-source code-first agent framework (Python, Go, Java, TS) |
| **Agent Engine** | Managed runtime — deploy, scale, sessions, memory |
| **Agent Builder** | Console / low-code surface |
| **Vertex Pipelines** | Managed Kubeflow pipelines |
| **Model Garden** | Curated catalogue (Gemini, LLaMA, Mistral, Anthropic) |
| **Genkit** | Lighter open-source GenAI framework |

Key papers from Google: *Attention Is All You Need* (2017), *BERT* (2018), *Chinchilla* (2022), *PaLM/PaLM 2*, Gemini technical reports.

---

### MLOps Lifecycle & Cost/Latency Levers

MLOps cycle: Data versioning (DVC) → Feature store (Feast) → Experiment tracking (**MLflow 3**) → Training (PyTorch/JAX) → Model registry → Serving (**vLLM** / FastAPI) → Monitoring (Evidently AI) → Pipeline orchestration (Kubeflow/Airflow) → retrain.

**Interview red flag**: "deploy and forget." Always mention monitoring and retraining.

**Cost levers (in order of impact)**:

| Lever | Savings |
|-------|---------|
| **Prompt caching** | 50–90% on repeated prefixes (system prompt cached) |
| **Model routing** | 30–80% — easy queries → Flash/Haiku/mini; hard → Opus/Pro/GPT-5.6 |
| Batch APIs | 50% async off-peak |
| Provider failover | LiteLLM, OpenRouter |

**Latency levers**: streaming (TTFT wins), parallel tool calls, KV-cache reuse across turns (vLLM/SGLang), edge inference for hot paths.

**Reliability**: structured outputs (eliminates parser failures), guardrails, fallback cascade (timeout → cheaper model → different provider), idempotency keys on tools that cost money.

> ✅ **Must-remember**
>
> - **LangChain + LangGraph** = safe production default for general agents; LlamaIndex = data-heavy RAG.
> - **vLLM** is the 2026 default inference server; **TGI is in maintenance mode** — migrate.
> - **Hybrid search beats pure vector** on real workloads. Reranking is the #1 RAG quality win.
> - **Prompt caching** is the #1 cost lever after model choice.
> - **DSPy** if you have evals; skip otherwise. **Pydantic AI** for type-safety.

---

## Ch 20 — The 2026 AI Landscape

> ⏱ **Dated snapshot.** The lineup and numbers in this section are the **July 2026** view from [Ch 20](#content/20_2026_landscape). By early November 2026 the flagships had moved on — GPT-6 (Astra / Sol / Luna), Claude 5.5 (Opus / Sonnet / Haiku) + Fable 5.1, Gemini 4 (Argon / Carbon), Muse Spark Open from Meta — see [Ch 17 §4.1–4.6](#content/17_llm); where they disagree, trust the vendor model card. The *shapes* below (no single winner, open weights ≈ 4–6 months behind, price/latency/ecosystem decide) still hold.

> 💡 **In a sentence —** By July 2026 no single model wins everything — GPT-5.6 leads agents, Claude Opus 4.8 leads code/tools (Claude Sonnet 5 the mid-tier default), Gemini 3.5 Pro leads multimodal/value, and open-weight models (DeepSeek, Llama 4, Qwen 3.5) are within ~5 points on most tasks, making model choice primarily a question of price, latency, and ecosystem.

---

### Frontier Model Lineup (July 2026)

```
CLOSED-WEIGHT FRONTIER:
   GPT-5.6 (OpenAI)      — agents leader; Terminal-Bench 82.7%; SWE-bench 88.7%
   Claude Opus 4.8 (Ant) — SWE-bench 87.6%; tool orchestration
   Claude Sonnet 5 (Ant) — mid-tier price/perf default; $2/$10 per M tokens
   Gemini 3.5 Pro (Ggl)  — GPQA 94.3%; cheapest flagship $4/$12 per M tokens

OPEN-WEIGHT (sparse MoE era):
   DeepSeek V4-Pro        — 1.6T/49B active; SWE-bench 83.7%; MIT license
   Llama 4 Scout          — 109B/17B; 10M context window (industry largest)
   Qwen 3.5               — 397B/17B; GPQA 88.4%; Apache 2.0
   Mistral Large 3        — 675B/41B; Apache 2.0
   Gemma 4 31B            — dense; LiveCodeBench 80%; Apache 2.0
```

**Interview tip**: don't memorise exact numbers (they drift monthly). Memorise the *shape*: closed-weight leads by ~3–8 points on agentic/code tasks; within ~3 points at the top means model choice is mostly about price/latency/ecosystem.

---

### Reasoning Models & Test-Time Compute

> A **reasoning model** allocates additional compute *at inference time* — generating hidden "thinking" tokens before the final answer — so accuracy on hard problems scales with thinking budget, not parameters alone.
![Reasoning models and test-time compute budgets](diagrams/dlrev_reasoning_ai.png)

```
Normal LLM:     Input → [one forward pass] → Output (cost: fixed)

Reasoning model: Input → [think… think… think…] → Output (cost: scales with task)
                          (1K to 100K+ hidden tokens)
```

Doubling the thinking budget often beats doubling parameters on math, formal logic, multi-step planning, and hard code generation (Snell et al.: on problems a small model already partly solves, optimally allocated test-time compute can beat a 14× larger model). Control: `reasoning.effort` low → max (OpenAI), the `effort` setting / adaptive thinking (Anthropic; earlier models used `thinking.budget_tokens`), thinking levels (Gemini). By late 2026 thinking is built into the main model lines rather than a separate o-series ([Ch 17 §4.1](#content/17_llm)).

**When reasoning helps**: math, formal logic, complex code with specs, scientific analysis with multiple hypotheses, multi-step planning. **Skip for**: simple Q&A, creative writing, high-throughput classification, real-time voice. Cost trap: reasoning models charge for hidden tokens too — a single `high` call can be 10–50× a normal call.

---

### Open-Weight Race

All flagship open models in 2026 are **sparse MoE** — large total parameter count, small active slice per token. Why it matters:

1. **Cost & sovereignty**: self-host on H100s/TPUs; data never leaves your VPC.
2. **License war**: Apache 2.0 (Qwen 3.5, Mistral, Gemma 4). Llama keeps MAU clause (no commercial use above 700M monthly active users). DeepSeek went MIT.
3. **Quality**: DeepSeek V4 at 83.7% SWE-bench is within 5 points of GPT-5.6 — close enough that self-hosted open-weight + good infra often beats premium API on cost.

**When to pick open-weight**: privacy-critical (health, finance, defence), bulk inference (token cost dominates), long-context RAG (Llama 4 Scout 10M), research reproducibility. **When to pick closed**: top-end agent reliability, latest reasoning frontier, computer-use, zero ops.

---

### Coding Agents & SWE-bench

SWE-bench Verified scores late-2023 → July 2026: ~13% → **88.7%** (but note OpenAI stopped reporting Verified in Feb 2026 — flawed tests and training-data leakage — and recommends SWE-bench Pro, so treat the top scores as inflated; [Ch 17 §15.2](#content/17_llm)). Four compounding factors: (1) stronger base models, (2) test-time compute / reasoning, (3) better scaffolds (file IO, test runners, diff review, persistent state), (4) RL on agentic traces.

Scaffold gap: Augment Code at 72% with Opus 4.6 vs Cursor at 65.7% with Sonnet 4.6 — same model family, better harness wins.
![SWE-bench Verified progress and the scaffold gap](diagrams/dlrev_swebench_ai.png)

**Dev-tool landscape**: Claude Code (terminal agent, multi-file refactors), Cursor (IDE, tight feedback loops), Windsurf (IDE, multi-file Cascade), GitHub Copilot (enterprise), Devin (async cloud agent), Codex CLI (OpenAI-native terminal).

Trend: coding split into **interactive copilots** (tight feedback) and **autonomous agents** (delegated tasks). Both keep human in the review loop.

---

### Multimodal Generation

**Image** (2026 production rule): hosted APIs for quality (DALL-E 3/GPT-Image-1, Imagen 4, Midjourney v7), FLUX/Stable Diffusion for self-host and LoRA customisation.

**Video** (the 2026 explosion):

| Model | Headline |
|-------|---------|
| Sora 2 (OpenAI) | 60-second physics-realistic clips |
| **Veo 3.1 (Google)** | 1-minute + **synchronised audio** (dialogue + SFX) — first model to do so |
| Runway Gen-4 | Editor-friendly, camera/character control |

Veo 3.1's native audio is the biggest leap — bypasses post-production sound.

**Voice (2026)**: end-to-end speech-to-speech models (~300ms latency), natural interruptions. GPT-5.6 Realtime API, Gemini Live (real-time + screen-share), ElevenLabs Conversational. Vs 2024's 3-step pipeline (STT → LLM → TTS): 2026 is one model.

---

### Computer-Use Agents

> An AI that drives a real computer — screenshot → reasons → mouse/keyboard actions.

Claude Computer Use: 14% → **44% on OSWorld** in 18 months. OpenAI Operator (cloud browser), Project Mariner (Google Chrome), Codex Desktop (Mac).

**When to use**: legacy software with no API, one-off cross-app automation, QA testing of flaky internal tools. **When NOT**: high-QPS production (each step = screenshot + LLM call, ~1–3s per step), latency-sensitive UX, anything with a public API (use the API), high blast-radius mistakes.

---

### On-Device AI & Quantisation

By 2026 every major OS ships on-device models: Gemini Nano (Pixel/Android), Apple Intelligence (iOS/macOS), Phi-4 Mini (Copilot+ PCs), Llama 3.2 1B/3B.

**Quantisation enables this**:

```
FP32: 28 GB (7B model)  →  INT4: 3.5 GB  ← fits on a phone
```

GPTQ, AWQ, GGUF (CPU/edge via llama.cpp), MLC, Apple MLX. INT4 loses ~1–3% on benchmarks.

**On-device vs cloud**:
| On-device | Cloud |
|-----------|-------|
| Privacy-critical (health, finance) | Largest frontier models |
| Latency-critical (autocomplete, real-time UX) | Multi-step reasoning beyond on-device |
| Billions of queries (zero marginal cost) | Live external data |
| Offline availability | Computer use, video gen |

---

### Cost Trajectory & Long-Context Era

Token prices fell ~150–1000× between 2022 and 2026 for equivalent quality. Architectures formerly uneconomic (30-LLM-call agent loops, multi-agent debates, hybrid RAG + reranking) are now routine.

**Context window growth**: 2K (GPT-3) → 8K/32K (GPT-4) → 200K (Claude 2.1/3) → 1M, later 2M (Gemini 1.5) → **10M advertised (Llama 4 Scout, 2025)**; by late 2026 the GPT-6, Claude 5.5 and Gemini 4 lineups list ~1M tokens ([Ch 17 §2.7](#content/17_llm)).

**Lost-in-the-middle** still exists — attention degrades on tokens buried in the centre of long contexts, and advertised length ≠ effective length (RULER). A 2026 best practice: retrieve top-50 with hybrid search + reranking, dump into 1M context, let the model reason over retrieved subset.

**Context engineering (7 techniques, in order of impact)**:

| Technique | Impact | How |
|-----------|--------|-----|
| RAG | Very high | Retrieves relevant docs on each turn |
| Tool use | High | Delegates computation, real-time data |
| Conversation summarisation | Medium-high | Compress old turns to fit history |
| Memory systems | Medium | Persistent notes across sessions |
| Context caching | Cost: 50–90% | Cache system prompt + common prefix at API level |
| Structured layout (XML/JSON tags) | Medium | `<instructions>` tags improve model parsing |
| Attention anchoring | Medium | Repeat critical instructions just before generation |

---

### Model Selection Decision Tree

```
Start: What is the task?

  1. Simple Q&A / text gen / translation?
     → Use cheapest model that meets quality bar (Flash, Haiku, mini)
     → If quality insufficient, step up one tier

  2. Hard math / complex code / multi-step logic?
     → Use reasoning model (GPT-5.6, Claude Opus 4.8 extended thinking, Gemini 3.5 Thinking)
     → Watch cost: 10-50× premium; only if quality improvement justifies

  3. Multimodal input (images, documents)?
     → Gemini 3.5 Pro or GPT-5.6 / Claude Opus 4.8

  4. High-volume / privacy-critical / bulk offline?
     → Open-weight: DeepSeek V4, LLaMA 4 Scout, Qwen 3.5
     → Self-host vLLM on H100s for bulk inference

  5. Structured tabular data / CTR / fraud?
     → XGBoost first; LLM only if text context is the main signal

  6. Real-time voice?
     → GPT-5.6 Realtime / Gemini Live (end-to-end, not STT+LLM+TTS)

  7. Coding agent / autonomous dev work?
     → Claude Code (terminal), Cursor (IDE), GitHub Copilot (enterprise)

  8. Multi-step enterprise agent on GCP?
     → Google ADK + Agent Engine + Vertex AI
```

**Classical ML still wins on**:
- Tabular data / fraud / CTR → XGBoost
- Time-series forecasting → Prophet, DeepAR  
- Search ranking → LambdaMART
- Recommendation → matrix factorisation, two-tower
- Small-data classification → logistic regression + feature engineering

The "use LLMs for everything" trap is the most common junior mistake in 2026 system design interviews.

---

### Safety, Bias & Alignment

**Sources of model bias**: biased training data (over-represented demographics get better quality outputs), RLHF feedback from non-representative raters, instruction-following overfit to superficial preference signals.

**Alignment tax** (real but shrinking): earlier aligned models (ChatGPT 3.5 era) were noticeably less capable than base models; modern alignment techniques (Constitutional AI, RLHF with diverse raters, DPO) add <5% quality hit while dramatically improving safety.

**Guardrails architecture**:
```
User input
    ↓
Input guardrail (content classifier — block prohibited topics, PII)
    ↓
LLM generation
    ↓
Output guardrail (factuality checker, toxicity filter, PII redaction)
    ↓
User
```

Key tool categories: NeMo Guardrails (NVIDIA), Llama Guard (Meta, open), Constitutional classifiers (Anthropic). For RAG specifically: hallucination detector on final answer.

**Copyright & data concerns**: LLMs trained on copyrighted text; fair use doctrine unclear globally. EU AI Act requires training-data transparency for GPAI models with >10^25 FLOPs training compute. US: currently no training-data disclosure requirement (2026).

---

### EU AI Act & Regulation

| Date | What changes |
|------|-------------|
| Feb 2, 2025 | Prohibited-AI bans live (social scoring, real-time biometric surveillance) |
| Aug 2, 2025 | General-purpose AI (GPAI) provider obligations apply |
| **Aug 2, 2026** | **Full enforcement + GPAI penalties live** |
| Aug 2, 2027 | High-risk regulated-product rules |

Penalties: up to €35M or 7% global revenue. Headline obligations for foundation-model providers: training-data summaries, copyright respect, transparency docs, systemic-risk evaluations for largest models.

**Google's 7 AI Principles (2018, still cited)**: socially beneficial, avoid bias, safety, accountable, privacy by design, scientific excellence, aligned uses.

---

### Google's 2026 AI Stack

| Tier | Model | Use case |
|------|-------|---------|
| Gemini 3.5 Pro | Flagship | Complex reasoning, multimodal, SWE-bench 80.6%, GPQA 94.3% |
| Gemini 3.5 Flash | High-throughput | Production workhorse |
| Gemini 3 Nano | On-device | Pixel, Android, ChromeOS |
| Gemini Live | Real-time | Bidirectional audio + video |
| Imagen 4 / Veo 3.1 | Generation | Image/video in Vertex |

**TPU v7 "Ironwood"** (GA early 2026): 4,614 FP8 TFLOPS per chip; 192 GB HBM (6× Trillium); pod scale 9,216 chips → 42.5 exaFLOPS; TPU 8t (training) and 8i (serving) were announced in April 2026 ([Ch 16 §7.4](#content/16_deep_learning)). Anthropic announced (Oct 2025) access to up to one million TPUs and well over a gigawatt of capacity coming online in 2026.

---

### 2026 Benchmark Landscape

| Benchmark | Status |
|-----------|--------|
| MMLU, HumanEval, GSM8K | **Saturated** (≥90% frontier) — citing them is a yellow flag |
| **SWE-bench Verified** | Frontier ~88% — but OpenAI stopped reporting it (Feb 2026, leakage / flawed tests) and recommends SWE-bench Pro |
| **Terminal-Bench 2.0** | Active — GPT-5.6 82.7% |
| **OSWorld** | Active — Claude Opus 4.8 ~44% |
| **GPQA Diamond** | Active — frontier ~94% |
| **ARC-AGI-2** | Active — frontier well below humans |
| **FrontierMath** | Active — frontier ~30% |

---

### Common Interview Pitfalls

1. Citing MMLU/HumanEval as quality signals in 2026 — they're saturated.
2. Defaulting to reasoning models for everything — use them only for hard decomposable tasks.
3. Memorising exact leaderboard numbers (they drift monthly) — memorise the shape instead.
4. Treating long context as a substitute for retrieval — lost-in-the-middle is real.
5. Ignoring EU AI Act dates — Aug 2, 2026 enforcement is non-negotiable for EU deployment.
6. Computer-use for high-QPS production — slow and fragile; APIs always win where they exist.
7. Jumping straight to "use a Transformer" for tabular data — XGBoost at 1/100 the cost.
8. Ignoring open-weight for scale — DeepSeek/Llama/Qwen are within 5 points of frontier APIs.

> ✅ **Must-remember**
>
> - No single model wins everything — pick by task (GPT-5.6 for agents, Claude for code, Gemini for multimodal/value).
> - **Test-time compute** (reasoning budget) > parameter scaling for hard decomposable tasks.
> - **SWE-bench** went 13% → 88% in 18 months: better models + reasoning + better scaffolds + RL on traces (Verified is now contaminated — quote it with a date and the scaffold).
> - **EU AI Act enforcement: Aug 2, 2026** — €35M or 7% global revenue.
> - **Veo 3.1** (synchronised audio), **Llama 4 Scout** (10M context), **TPU v7 Ironwood** (42.5 exaFLOPS pod).

---

## One-page cheat recap

| Chapter | Single most important fact/formula |
|---------|-----------------------------------|
| **Ch 16 — Deep Learning** | $\text{Attention}(Q,K,V) = \text{softmax}(QK^T/\sqrt{d_k})V$; **AdamW** = correct optimizer for Transformers (uncorrected early Adam steps are too large); **ResNet skip** solved deep training; init keeps variance constant (He $2/\text{fan}_{in}$, Xavier $2/(\text{fan}_{in}+\text{fan}_{out})$); **RMSNorm + RoPE + SwiGLU** in modern LLMs; mixed-precision AdamW = 16 B/param, accumulation / checkpointing (+33% compute) / EMA; depthwise-separable conv ≈ $1/C_\text{out}+1/K^2$; FGSM = $x+\varepsilon\,\text{sign}(\nabla_xL)$; **flow matching** (SD3, FLUX) = straighter paths; **MoE**: compute ≈ active params, memory = all params. |
| **Ch 17 — LLMs** | **Chinchilla rule**: training tokens ≈ 20× params (but served-a-lot models over-train); **KV cache** grows *linearly* with context, **FlashAttention** is exact with $O(N)$ extra memory and unchanged FLOPs; data pipeline = filter → MinHash dedup → decontaminate → mix → anneal; DPO replaces 3-stage RLHF with one direct preference loss, GRPO/RLVR power reasoning models; ICL changes behaviour not weights, "emergence" is partly the $p^k$ metric; CoT is evidence, not proof (hint admitted ≈ 25–39%); INT4 shrinks 70B to ≈ 35 GB (one 48–80 GB GPU, not 24 GB) with ~1–3% quality loss. |
| **Ch 18 — AI Agents** | An agent = LLM in an observe→think→act loop with tools. **MCP** = N+M (not N×M) integrations via Tools/Resources/Prompts primitives. **A2A** = agent-to-agent cross-org. Critical security rule: the LLM never executes tools directly — your code does. |
| **Ch 19 — Frameworks** | **vLLM** (PagedAttention, 2–10× throughput) is the 2026 default inference server; **TGI is in maintenance mode**. Hybrid search beats pure vector; reranking is the #1 RAG quality lever; prompt caching is the #1 cost lever. LangGraph for production agents; LlamaIndex for data-heavy RAG. |
| **Ch 20 — 2026 Landscape** | No single model wins everything; within ~3 points at the top → model choice is price/latency/ecosystem. **Test-time compute** (reasoning budget) > parameter scaling for hard tasks. **EU AI Act full enforcement: Aug 2, 2026**. **SWE-bench** 13% → 88% in 18 months = better models + reasoning + scaffolds + RL (Verified is now contaminated — quote it with a date). |

---

### What you must be able to code — the 18-rung ladder ([Ch 16 "Start Here"](#content/16_deep_learning))

The problems candidates report implementing from scratch (20–40 min, NumPy or PyTorch tensors). Work top-down; "reported at" is a hint, not a guarantee.

| # | Implement | Where it's explained | Difficulty |
|---|---|---|---|
| 1 | **Byte-Pair Encoding** — train merges, then encode | [Ch 17 §2.2](#content/17_llm) (BPE in code) | Easy |
| 2 | **Sinusoidal positional encoding** | [Ch 16 §3.4](#content/16_deep_learning) | Easy |
| 3 | **RoPE** — rotate Q and K by position | [Ch 16 §3.4](#content/16_deep_learning) | Easy |
| 4 | **RMSNorm** | [Ch 16 §1.5](#content/16_deep_learning) | Easy |
| 5 | **Numerically stable softmax** — subtract the max | [Ch 17 §1.4](#content/17_llm) | Easy |
| 6 | **Scaled dot-product attention** — the most-asked of all | [Ch 17 §2.4](#content/17_llm) (Query, Key, Value) | Medium |
| 7 | **Multi-head attention** — split, attend, concat, project | [Ch 17 §2.4](#content/17_llm) | Medium |
| 8 | **Grouped-query attention** — share K/V across groups | [Ch 17 §2.4](#content/17_llm) | Medium |
| 9 | **KV cache** — append and reuse across decode steps | [Ch 17c §1.2](#content/17c_llm_systems) | Medium |
| 10 | **Sampling** — temperature, top-k, top-p | [Ch 17 §2.6](#content/17_llm) (Sampling from Logits in NumPy) | Medium |
| 11 | **Sliding-window attention** | [Ch 17 §2.4](#content/17_llm) | Medium |
| 12 | **LoRA layer** — low-rank adapter on a frozen weight | [Ch 17b §9.4](#content/17b_llm_applications) | Medium |
| 13 | **KL divergence loss** | [Ch 17 §1.4](#content/17_llm) | Easy |
| 14 | **DPO loss** | [Ch 17 §3.5](#content/17_llm) (Runnable DPO loss) | Hard |
| 15 | **Mixture-of-Experts layer** — routing + top-k gating | [Ch 17 §4.8](#content/17_llm) (a MoE layer in NumPy) | Hard |
| 16 | **Speculative decoding** — draft, verify, accept prefix | [Ch 17c §2.5](#content/17c_llm_systems) | Hard |
| 17 | **Continuous batching** — the scheduler loop | [Ch 17c §2.1](#content/17c_llm_systems) | Hard |
| 18 | **GRPO** — group-relative advantage, no critic | [Ch 17 §3.5b](#content/17_llm) (Runnable GRPO) | Expert |

**Rungs 1–10 are the realistic bar** for product and applied roles; **14–18 are research/infra-lab territory**. Weekend plan: rungs **6, 7, 9, 10** (attention, multi-head, KV cache, sampling) cover most reported LLM coding rounds. Write each once from scratch, then once from memory a week later, and say your tensor shapes out loud. Also L3 in Ch 16: backprop by hand ([§1.1](#content/16_deep_learning)), the Adam update in six lines ([§1.2](#content/16_deep_learning)), IoU + NMS ([§2.2](#content/16_deep_learning)).
