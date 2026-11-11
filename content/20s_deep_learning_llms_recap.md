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

> **The section is now eight chapters, plus the Playbook.** Ch 17 and Ch 18 were each split so no chapter is a nine-hour read. Full map, the three learning tracks and the L1–L4 depth ladder → [Ch 16](#content/16_deep_learning).

---

## Ch 16 — Deep Learning: Complete Reference

![Deep Learning on One Page map: training-recipe chips (AdamW with beta2 0.95 for LLMs, weight decay 0.1 not on biases or norms, warmup 0.1-2% of steps then cosine to 10% or WSD, clip gradient norm at 1.0, BF16 plus FP32 master = 16 bytes per parameter, pre-norm RMSNorm, init std 0.02 and He for ReLU); a 4-step fix order when a 7B model runs out of memory (112 GB before activations): shard states with ZeRO-3 or FSDP, FlashAttention, activation checkpointing at +33% compute, smaller micro-batch plus accumulation; an architecture chooser grid for images, edge, detection, segmentation, text understanding, text generation, streams, graphs, tabular and image or video generation; a pick-by-question table; a 3-step debug list (initial loss ln K = 2.3 for 10 classes, overfit one batch, model.eval before testing); trap: a 7B model cannot train on one 80 GB GPU.](diagrams/rec20s_info_ch16_dl_map_ai.png)

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

![Same attention, different mask: three columns for encoder-only (full 4x4 mask grid), decoder-only (lower-triangle causal grid) and encoder-decoder (encoder to decoder via cross-attention) with the formula softmax(QK^T/sqrt(d) + M)V, a pick-by-need table, why decoder-only won, and common mix-ups](diagrams/llm17_info_encoder_decoder_compare_ai.png)

| | BERT | GPT |
|--|------|-----|
| Architecture | Encoder-only | Decoder-only |
| Attention | **Bidirectional** (sees all tokens) | **Causal** (sees past only) |
| Pre-training | MLM (fill-in-the-blank); NSP was dropped (RoBERTa) | Next-token prediction |
| Best for | Understanding, classification, NER, Q&A | Generation, chat, code |
| Examples | BERT-base (110M), RoBERTa, DeBERTa | GPT-3/4, LLaMA, Claude, Mistral |

BERT-base: 12 layers, 12 heads, 768 hidden dim, 110M params. BERT-large: 24 layers, 16 heads, 1024 hidden dim, 340M params. **T5 (encoder-decoder)**: span-corruption pre-training, text-to-text — translation, summarisation; Whisper uses the same shape for speech. Almost every large LLM is decoder-only (simple to scale, prompt-everything, cacheable K/V); encoders still power embeddings, reranking and classification (ModernBERT, 2024: RoPE + GeGLU + local/global attention, 8K context).

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

![How an LLM Works, by the Numbers: inference path Text, Tokenise (BPE, 1 token about 4 characters or 0.75 words), Embed, N x block (RMSNorm, GQA attention + RoPE, RMSNorm, SwiGLU FFN holding about 2/3 of the parameters), softmax over the vocabulary, decode (greedy, top-k, top-p), with attention = softmax(QK^T / sqrt(d_k)) V; a 4-step training staircase pre-train on about 15T tokens, SFT on reply tokens (LIMA 1,000 examples), RLHF or DPO on preference pairs, RLVR / GRPO with a checker reward (R1-Zero AIME 15.6% to about 71%); eight number cards C = 6ND, 20 tokens per parameter, about 1,900 tokens per parameter for Llama 3 8B, 16 bytes per parameter (7B = 112 GB), KV cache 320 KiB per token (40 GiB at 128K), MoE 671B total / 37B active, vocabularies 30K-260K, about 1M-token windows (advertised is not effective); a pick-by-question table; trap: emergence is partly a metric artefact, exact match on k tokens = p^k.](diagrams/rec20s_info_ch17_llm_numbers_map_ai.png)

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

![Output knobs infographic: the temperature softmax p_i = exp(z_i / T) / sum exp(z_j / T); bar charts for 'The capital of France is ___' over Paris, Lyon, Nice, Rome, Berlin at T = 0.5 (Paris 0.769), T = 1 (0.50) and T = 2 (0.340), with top-p 0.9 keeping 3, 4 and 5 tokens; a 1,000-token cap split into 900 thinking and 100 answer tokens; a who-supports-what grid as of Nov 2026 for OpenAI GPT-6, Claude 5.5, Gemini 4 and open-weight models (temperature, effort dial, stop sequences, penalties); frequency and presence penalty arithmetic for 'cat' (2.0 to 0.5 and 1.5); trap: temperature 0 does not guarantee identical output.](diagrams/llm17b_info_output_knobs_ai.png)

**Greedy**: always pick $\arg\max$. Deterministic, can loop ("the the the…").

**Beam search (width B)**: keep top-B sequences; better for translation/summarisation but bland for open-ended chat; width 1 *is* greedy; rank finished hypotheses by length-normalised score, not raw score.

**Top-K sampling**: sample from top-K tokens only; renormalise. K=50 is a common library default.

**Top-P (nucleus) sampling**: include the smallest set of tokens whose cumulative probability ≥ P (e.g. 0.9; API default 1) — *including* the token that crosses P. Adapts to model confidence — narrow when confident, wide when uncertain. **Min-p**: keep tokens with $p_i \ge p_\text{base}\cdot p_\text{top}$ (0.01–0.2) — the cut-off scales with confidence and holds up better at high temperature.

**Temperature** rescales logits before softmax: $p_i \propto e^{z_i/T}$; it never changes the ranking, so greedy/beam are unaffected. Order in libraries: penalties → temperature → top-k → top-p → softmax → draw. The code interviewers ask for ([Ch 17 §2.6](#content/17_llm), rung 10): work on *logits* and mask dropped ones with $-\infty$, **not 0** (a logit of 0 still gets probability).

| Temperature | Effect |
|-------------|--------|
| 0 | Special case = greedy (dividing by 0 is undefined); repeatable, not more *true*, and hosted APIs still don't promise identical output |
| 0.7 | Natural, varied — conversation, writing |
| 1.0 | The model's own distribution (OpenAI's default) |
| 2.0 | Wild, often incoherent |

**In practice** ([Ch 17b §8](#content/17b_llm_applications)): low temperature for extraction, classification and code, 0.7–1.0 for creative work, and tune temperature **or** top-p, not both. **Current frontier reasoning models drop these knobs** (Nov 2026): GPT-6 accepts them only at reasoning effort `none`, the Claude 5.5 family removed them, Gemini 4 and 3.6+ ignore them — you steer with the effort setting, the output cap and a schema instead. Temperature and top-p still control the open-weight models you serve yourself.

Repetition / presence / frequency penalties push down already-seen tokens but also hurt code identifiers and JSON keys — use lightly (OpenAI's range is −2 to 2, in Chat Completions only; Anthropic has neither).

**Autoregressive loop**: one token per forward pass; the KV cache stores past keys/values so each step computes only the *new* token's K,V and attends over the cache instead of re-processing the whole prefix (it trades memory for time — the cache grows linearly with context).

---

### LLM Training Pipeline (★★★)

**Stage 1 — Pre-training**: next-token prediction on trillions of tokens (Llama 3 ≈ 15T — 15.6T for the 405B; Qwen3 ≈ 36T; GPT-3 only 300B). Compute $C \approx 6ND$ (GPT-3 ≈ 3,640 petaflop/s-days; Llama 3 405B ≈ 3.8·10²⁵ FLOPs; use *active* params for MoE). "GPT-3 cost 4.6M USD" is a 2020 Lambda Labs estimate of renting V100s at the cheapest cloud price, not OpenAI's bill.

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

**Stage 3c — RLVR & GRPO ([Ch 17 §3.5b](#content/17_llm))**: **RLVR** = reward from an *automatic checker* (answer match, unit tests) instead of a hackable learned reward model; **GRPO** is the optimiser that drops PPO's critic — sample $G$ answers per prompt and use $A_i = (r_i - \text{mean}(r))/(\text{std}(r)+\epsilon)$ as the advantage of all of answer $i$'s tokens, with PPO's clipped ratio + a separate KL term. A group that is all right or all wrong has advantage 0 and teaches nothing. DeepSeek-R1-Zero: GRPO straight on the base model with rule-based accuracy + format rewards (AIME 2024: 15.6% → 77.9% in the revised paper). Modern stack: **SFT → DPO → RLVR/GRPO**. Code: rung 18. **Pick by the feedback you have:** demonstrations → SFT; chosen/rejected pairs → DPO; thumbs-up/down → KTO; a checker → RLVR; only a rulebook → RLAIF.

**Reward hacking** ([Ch 17 §3.5c](#content/17_llm)): the policy scores high on the proxy without doing what you meant — verbosity is the commonest hack; **proxy reward rising while KL balloons** is the warning light. Defences: KL penalty / β sweep, early stopping on a gold eval, length control, verifiers instead of learned rewards.

**Constitutional AI (Anthropic)**: the model critiques and revises its answers against written principles, then RLAIF (AI-generated preference labels) — no per-example human labels for harmlessness.

---

### Fine-Tuning & Alignment — LoRA, RLHF, DPO (★★★)

**LoRA (★★★, [Ch 17b §9.4](#content/17b_llm_applications))**: Freeze $W_0$ ($d\times k$); learn $h = W_0x + \frac{\alpha}{r}BAx$ with $B \in \mathbb{R}^{d \times r}$, $A \in \mathbb{R}^{r \times k}$, $r \ll \min(d,k)$ — $r(d+k)$ trainable numbers instead of $dk$. $B$ starts at 0, so training begins exactly at the pretrained model. One 4096×4096 matrix at $r=16$: 131,072 vs 16.8M = **0.78%**; Llama-2-7B with LoRA on q_proj + v_proj in all 32 layers: 8.4M trainable ≈ **0.12%**, a ~17 MB adapter. Merge after training ($W' = W_0 + \frac{\alpha}{r}BA$) → **no extra inference latency**; keep adapters unmerged to hot-swap many on one base.

**QLoRA** = frozen 4-bit **NF4** base + double quantization + paged optimizers, adapters in 16-bit: a 7B base is ≈ 3.7 GB (one 16–24 GB GPU); the paper fine-tuned **65B on one 48 GB GPU** (> 780 GB in 16-bit). A 4-bit 70B (≈ 37 GB) does **not** fit a 24 GB card. Hosted fine-tuning is shrinking — OpenAI closed self-serve fine-tuning to new organisations on 7 May 2026 — so most teams tune open weights with TRL + PEFT.

**RLHF (★★★)**:
1. SFT: fine-tune on high-quality (prompt, response) demonstrations (InstructGPT: ~13K).
2. Reward Model: train on human rankings; objective: push $s_\text{win} - s_\text{lose}$ apart via $L = -\log\sigma(s_\text{win}-s_\text{lose})$.
3. PPO + KL constraint: $R_\text{total} = R_\text{RM} - \beta D_{KL}(\pi \| \pi_\text{SFT})$. KL term keeps the policy near the SFT model, which limits reward hacking (it does not rule it out — watch for proxy reward rising while KL balloons).

![RLHF pipeline: SFT, reward model, PPO+KL, and DPO](diagrams/dlrev_rlhf_ai.png)

**DPO (★★★)**: Skips the reward model. Directly fine-tunes LLM on (prompt, chosen, rejected) triples with a single loss that increases P(chosen) and decreases P(rejected), with implicit KL regularisation. Simpler, more stable, comparable quality. Used by LLaMA 3, Zephyr.

#### Fine-Tuning Methods Compared

| Method | Trainable params | Memory for 7B (weights + optimizer state, before activations) | Use case |
|--------|-----------------|-----------|---------|
| Full fine-tuning | 100% | **112 GB** (16 B/param) | Highest ceiling; multi-GPU, large high-quality dataset; most forgetting |
| LoRA (r=16, q+v) | ≈ 0.12% | ≈ 14 GB | **The default** — close to full FT on a narrow task, forgets less |
| QLoRA (4-bit NF4 + LoRA) | ≈ 0.12% | **≈ 3.7 GB** → one 16–24 GB GPU | When GPU memory is the limit |
| DoRA | ≈ LoRA | ≈ LoRA | Drop-in LoRA variant (magnitude + direction), reported to beat LoRA at the same rank |
| Prefix / prompt tuning | Very few | ≈ base model | Learned soft-prompt vectors; usually weaker than LoRA on hard tasks |
| Adapters (2019) / IA3 | Small / fewest | ≈ base model | Adapters add a little inference latency; IA3 only rescales keys, values and FFN activations |

**LoRA hyperparams that matter**: rank $r$ (4–8 often enough for style or format; **16 a common default**; 64+ more capacity with diminishing returns), alpha $\alpha$ (scale $=\alpha/r$ keeps the update size stable when you change $r$; common recipes set $\alpha = 2r$), target modules (q_proj, v_proj at minimum; QLoRA put adapters on every linear layer). Trade-off measured by "LoRA Learns Less and Forgets Less" (2024): LoRA trails full fine-tuning on code and maths but keeps more of the base model's other skills.

#### Will It Fit? Training Memory & ZeRO/FSDP ([Ch 17 §3.6](#content/17_llm))

Mixed-precision AdamW = **16 bytes/param** (2 BF16 weights + 2 grads + 12 for the FP32 master copy, Adam $m$ and $v$) → 7B = **112 GB**, 70B = 1,120 GB *before* activations; inference needs only the weights (7B = 14 GB). **ZeRO / FSDP** shard that redundancy across $N$ data-parallel GPUs: stage 1 optimizer state ($4+12/N$ B/param), stage 2 + gradients ($2+14/N$), stage 3 = FSDP + weights ($16/N$; 70B on 64 GPUs ≈ 17.5 GB each). Sharding makes the model *fit*, not train faster (ZeRO-3 moves ~1.5× DDP's traffic). Order of attack: DDP if it fits → FSDP/ZeRO-3 → tensor parallel *inside* an NVLink node → pipeline parallel across nodes (bubble ≈ $(p-1)/(m+p-1)$) → context parallel for long sequences, expert parallel for MoE.

---

### Scaling Laws (★★★)

![Infographic: scaling laws. Training compute C = 6 x N x D; Chinchilla uses about 20 tokens per parameter. Left chart: predicted loss falls with model size (0.1B 3.49, 1B 2.58, 7B 2.18, 65B 1.94, 1T 1.80) toward the floor E = 1.69. Right chart: tokens per parameter for Gopher 1.1, GPT-3 1.7, Chinchilla 20, LLaMA-13B 77, Llama 3 8B about 1,900. Budget table for 1e21, 1e23 and 1e25 FLOPs.](diagrams/llm17_info_scaling_laws_ai.png)

**Kaplan et al. (2020)**: loss scales as a power law in parameters $N$, data $D$, and compute $C$ (exponents ≈ 0.076, 0.095, 0.050 → ≈ 5% lower loss per doubling of $N$):
$$\mathcal{L} \propto N^{-\alpha}, \quad \mathcal{L} \propto D^{-\beta}, \quad \mathcal{L} \propto C^{-\gamma}$$
This justified the push to ever-larger models (Kaplan: spend most extra compute on a bigger model — GPT-3 followed it, 175B on only 300B tokens).

**Chinchilla (Hoffmann et al., 2022)**: for a fixed *training*-compute budget, scale model size and data together. Rule of thumb:

> **Training tokens ≈ 20 × parameters**  (with $C \approx 6ND$: $N_\text{opt} = \sqrt{C/120}$)

Chinchilla (70B, 1.4T tokens) beat GPT-3 (175B, 300B) and Gopher (280B, 300B) at similar compute; LLaMA-13B (**1.0T** tokens, 77 tokens/param) beat GPT-3 on most benchmarks. Data quality and quantity matter as much as scale. **Over-training:** a model is trained once and served billions of times, so labs train smaller models far past 20 tokens/param — Llama 3 8B saw ≈ 15T tokens ≈ 1,900 tokens/param (~94× Chinchilla); inference compute passes training compute after serving ≈ $3D$ tokens. The fitted constants are illustrations (fit on 70M–16B models, hard to replicate), not a planning tool. Other axes: data-constrained scaling (repeat ≲ 4 epochs) and **test-time compute** (reasoning budget) as a third scaling axis.

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
| Claude (Anthropic) | Decoder-only; Claude 5.5 family (Haiku / Sonnet / Opus) + Fable 5.2 (Nov 2026) | Coding, agents, tool use, computer use, adaptive thinking (`effort`); 1M context; text + images in |
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

![Building with an LLM: Climb the Ladder. A four-rung ladder from the bottom: prompt (role, context, 2-5 examples, input, output format), add RAG for knowledge (chunk 256-512 tokens, retrieve about 20, rerank, keep 3-5), add tools for actions (your code runs each call, result returned by call id), fine-tune for volume or consistency (LoRA: frozen W0 + B x A, B starts at 0). A table of temperature and top-p support as of Nov 2026: GPT-6 only at effort none, Claude 5.5 removed, Gemini 4 ignored, open weights yes. Eight rules of thumb: reasoning models (goal and criteria, raise effort), output cap includes reasoning tokens, JSON Schema guarantees shape not truth, grading rewards guessing, temperature 0 is repeatable not true, prompt injection OWASP LLM01 least privilege first, same embedding model for queries and documents, LoRA trains r(d+k) not dk (0.78% at r = 16). A pick-by-question table ending with QLoRA 65B on one 48 GB GPU; cost card: output about 5x input, about 5.40 vs 540 USD a month by tier, RAG about 240x cheaper per question than a 667K-token prompt; trap: a system prompt is guidance, not a security boundary.](diagrams/rec20s_info_ch17b_building_map_ai.png)

A strong prompt has five parts — role and instructions, context, examples, the input, and the output format ([Ch 17b §5](#content/17b_llm_applications)).

| Technique | When to use |
|-----------|------------|
| Zero-shot | Tasks the model already does well |
| Few-shot (2–5 clear, varied examples, tricky cases included) | Custom tasks or a specific style; balance the labels and mix the order — models lean to the most frequent and the most recent label |
| Chain-of-Thought ("Let's think step by step") | Maths and logic on **non-reasoning** models (Wei 2022: the gain appeared only in very large models) |
| System prompt | Rules for the whole conversation; models give it priority over the user — guidance, **not** a security boundary |
| ReAct | Interleave Thought → Action → Observation; today it is structured tool calls inside the agent loop |
| Tree of Thoughts | Search over partial solutions, keep the best $b$ (Game of 24: CoT 4% → ToT 74%); many model calls |
| Self-consistency | Majority vote over $n$ sampled paths (GSM8K +17.9 points); helps only when mistakes scatter, costs $n$× |
| Structured output | Anything a program parses: enforce a JSON Schema (see Controlling Output below) |

**Prompting reasoning models** (o-series and GPT-5 onwards, Claude with extended/adaptive thinking, Gemini 2.5 onwards): skip "think step by step" and hand-written step lists; give the goal, context, constraints and success criteria, and raise the effort setting (OpenAI `reasoning.effort`, Anthropic `output_config.effort`, Gemini `thinking_level`). On few-shot the vendors differ — OpenAI: try zero-shot first; Google: always include a few — so test both.

**Prompt injection** (OWASP **LLM01**, #1 in both the 2025 and 2026 editions): text the model reads — typed by the user (**direct**) or hidden in a web page, PDF, email, retrieved chunk, tool result or image (**indirect**) — overrides your instructions. Instructions and attacker text share one token stream, so there is no fix like parameterised SQL queries: **limit the damage** in layers — constrain behaviour, validate outputs, filter input and output (+ a canary string), **least privilege (the most important)**, human approval for risky actions, isolate untrusted content, red-team. Break the **lethal trifecta** (private data + untrusted content + a way to send data out) by removing one leg. A jailbreak attacks the vendor's safety rules; an injection attacks *your app's* instructions ([Ch 18b](#content/18b_agents_in_production)).

**The 4 prompt sins**: (1) too much in one call — split into steps; (2) no examples for non-obvious tasks; (3) critical instruction buried in middle of context; (4) prompts not version-controlled.

#### Prompt Engineering Best Practices

**System prompt components** (for deployed systems):
1. Persona and task definition: who the model is, what it does.
2. Scope and constraints: what it should/should not do.
3. Format specification: output structure (JSON schema, markdown).
4. Safety rail: do not divulge system prompt contents.
5. Fallback instructions: what to say when unsure.

**Where it goes:** OpenAI Responses `instructions` (or a `developer` message), Anthropic `system`, Gemini Interactions `system_instruction`. A **role** ("You are a senior Python reviewer") sets tone, vocabulary and focus but adds no knowledge — Zheng et al. (2024) found personas did not improve factual accuracy — so put the real requirements in the instructions.

**Few-shot example selection**: diverse examples that include the tricky cases (retrieving ones similar to the input helps); balance the labels and mix up the order (Zhao et al. 2021: models lean to the majority and the most recent label); examples must agree with the instructions — when they conflict, the model copies the examples. Many-shot (hundreds of examples) works in a 1M window, but you pay those tokens on every call ([Ch 17 §3.9](#content/17_llm)).

**Chain-of-Thought subtlety**: each reasoning token is extra computation the answer can build on, and the answer is conditioned on the worked steps — a mistake has to survive several explicit steps. The visible trace may still not be the real reason for the answer (faithfulness above); for factual claims, ground with RAG.

**Layout**: separate the parts with tags (`<instructions>`, `<document>`, `<example>`); put long documents first and the question last (Anthropic: up to 30% better in its tests).

**Output format**: asking for JSON guarantees nothing, JSON mode guarantees only that it parses, and schema-constrained structured output guarantees the shape (see Controlling Output below). Ask for `null` or omission of optional fields rather than invented data.

**Prompt testing**: version-control prompts like code; keep a small test set with expected answers and re-run it on every prompt or model change — a fix for one case often breaks another (scoring: [Ch 17c §4](#content/17c_llm_systems)); include adversarial inputs (empty, very long, jailbreak attempts, off-topic).

---

### Hallucinations (★★)

A hallucination is a confident false statement — the model has no separate truth check, so when it lacks the fact, plausible and true come apart ([Ch 17b §7](#content/17b_llm_applications)). Causes:
1. **Pre-training — facts seen once aren't learned reliably** (Kalai et al., Sept 2025): if 20% of such facts appear exactly once, expect a base model to hallucinate on at least ~20% of them.
2. **Grading rewards guessing**: right/wrong benchmarks score "I don't know" like a wrong answer, so models learn to guess. Fix the incentive — right = 1, "I don't know" = 0, wrong = $-t/(1-t)$ — and answering beats abstaining only when $P(\text{right}) > t$.
3. Compression (facts spread across weights), rare or out-of-distribution questions, preference training that rewards confident answers, sycophancy (accepting a false premise).
4. Knowledge cutoff: events after training are unknown — retrieve them.

**Types:** **intrinsic** (contradicts the source you gave) vs **extrinsic** (adds unsupported claims, e.g. an invented citation).

**Mitigation** (lower the rate, catch the rest): ground with RAG; require citations or quotes that code checks; tools (search, database, calculator); allow abstention ("If unsure, say so"); consistency checks (sample several answers — disagreement flags invention, SelfCheckGPT); measure groundedness on a golden set. **Not a fix: temperature 0** — it makes the most likely answer repeatable, not true, and frontier reasoning models ignore or reject the setting anyway.

---

### RAG — Retrieval-Augmented Generation (★★★)

```
SETUP (once, then incrementally):
    Documents → chunk (256–512 tokens, 50–100 overlap) → embed → vector DB

QUERY TIME:
    question → embed with the SAME model → nearest chunks
    (retrieve ~20 → rerank → keep the best 3–5)
    → put them in the prompt → LLM writes a grounded, cited answer
```

**Chunk count:** $\lceil (N-\text{overlap}) / (\text{size}-\text{overlap}) \rceil$ — a 2,000-token document at 512 tokens with 100 overlap → ⌈1,900 / 412⌉ = 5 chunks (+20% storage). **Strategies**: fixed size (simple, cuts mid-thought), recursive (paragraph → sentence → word), semantic (split at topic changes; costs embedding calls), overlap (a boundary sentence survives whole in one chunk). Smaller chunks match more sharply but carry less context.

**Why RAG beats fine-tuning for facts** ([Ch 17b §9.1](#content/17b_llm_applications)): edit a document and re-index it instead of retraining; it can cite the source; lower hallucination risk because it reads real text — though it can still misread it or retrieve the wrong chunk. **RAG supplies knowledge, fine-tuning shapes behaviour** (format, tone, a narrow skill). Usual order of attempts: prompt → add retrieval for facts → add tools for actions → fine-tune when volume or consistency justifies it ([§9.2.11](#content/17b_llm_applications)).

**Modern RAG improvements** ([Ch 19 §19.9](#content/19_ai_frameworks); index internals in [Ch 28](#content/28_semantic_search)): hybrid search (vector + BM25, fused with RRF), reranking (cross-encoder), HyDE, contextual chunking, query rewriting, agentic RAG.

---

### Embeddings & Vector Databases

An embedding model converts text (or images, audio) → one dense vector (e.g., 1,536 dims for `text-embedding-3-small`, 3,072 for `gemini-embedding-2`); similar meaning → similar vectors. Trained contrastively; ~20M–8B parameters, about 0.02–0.20 USD per 1M tokens ([Ch 17b §10](#content/17b_llm_applications)).

$\text{cosine similarity}(A,B) = \frac{A \cdot B}{\|A\|\|B\|}$ — ignores magnitude, measures angle. Range: −1 (opposite) to 1 (same direction). On unit vectors $\|A-B\|^2 = 2 - 2\cos$, so cosine, dot product and Euclidean distance give the **same ranking**; an un-normalised dot product rewards long vectors.

**Two production rules:** embed queries and documents with the **same model**; switching models means **re-embedding the whole corpus** (even `gemini-embedding-001` → `-2`). **Matryoshka (MRL)** models let you keep a prefix of the vector: index size $= N \times \text{dims} \times 4$ bytes — 10M chunks at 3,072 dims = 123 GB, at 768 dims = 31 GB, for a small quality cost.

**Vector search algorithms**: brute force $N \times d$ multiply-adds per query (exact); HNSW layered graph (approximate, roughly logarithmic hops); IVF (cluster, search nearby clusters); PQ (compress vectors); hybrid adds BM25. Aim for recall@10 above ~0.95. **pgvector** is the usual default if you already run Postgres; FAISS is a library, not a database.

---

### Controlling Output — Effort, Caps, Schemas & Tool Calls (★★)

Which request parameters still work depends on the model (snapshot Nov 2026, [Ch 17b §8](#content/17b_llm_applications)):

| Parameter | GPT-6 family (Responses API) | Claude 5.5 family | Gemini 4 / 3.6+ | Open weights you serve |
|---|---|---|---|---|
| Temperature, top-p | Only at reasoning effort `none` | Removed — omit | Ignored | Yes |
| Reasoning depth | `reasoning.effort` | `output_config.effort` | `thinking_level` | Model-specific |
| Output cap | `max_output_tokens` (includes reasoning) | `max_tokens` (includes thinking) | `max_output_tokens` | `max_tokens` |
| Schema-constrained JSON | `text.format` + JSON Schema | `output_config.format` | `response_format` + schema | Guided decoding |

**Output cap:** billed output = reasoning + visible tokens ≤ cap — a 1,000-token cap with 900 thinking tokens leaves 100 for the answer, and the text simply stops (OpenAI `incomplete`, Anthropic `stop_reason: "max_tokens"`). Set the cap generously and ask for brevity in the prompt. Stop sequences: Anthropic and Gemini yes, OpenAI's Responses API no.

**Structured output, three levels:** ask in the prompt (no guarantee) → JSON mode (parses; keys and types unchecked) → schema-constrained (required keys, right types, no extra keys). Constrained decoding sets every token the grammar forbids at that position to $-\infty$, then picks as usual. A schema guarantees the **shape, not the truth**, and a safety refusal comes back separately.

**Tool calling** ([Ch 17b §9.3](#content/17b_llm_applications)): send tool definitions (name, description, JSON Schema) → the model returns calls with ids → **your code** validates and runs them (the safety boundary) → send each result back with its call id → repeat until it answers in text. Model calls = sequential tool rounds + 1 — two independent weather lookups plus a subtraction take 3 calls with parallel tool calls, 4 without; every call needs exactly one result; `strict: true` makes the arguments match the schema. Loop design and MCP: the Ch 18 section below.

---

### Cost, Context & Responsible Deployment (★★)

- **Cost** = in_tokens × p_in + out_tokens × p_out (prices per 1M tokens; [Ch 17b §13.3](#content/17b_llm_applications), snapshot 5 Nov 2026). Output costs ≈ 5× input and hidden thinking tokens bill as output. The same traffic (1,000 chats a day, 800 in + 200 out) costs ≈ 5.40 USD a month on GPT-6 Luna and ≈ 540 on GPT-6 Astra — a 100× spread, so route easy queries down. Cached input costs 2.5–10% of the normal price (keep the stable prefix first); batch/flex ≈ 50% off.
- **Context window** = system + history + retrieved + question + **reserved output**; ~1M tokens is standard (GPT-6 ≈ 1.05M, Claude 5.5 1M, Gemini 4 Argon 1,048,576). A 667K-token manual now fits, but each question then costs ≈ 13.36 USD against ≈ 0.055 with RAG (243×), with a slower first token and weaker mid-prompt recall — RAG for repeated Q&A, the long window for one-off "read it all" jobs.
- **Choosing a model**: prototype on a Flash / Sonnet / Luna-tier model and move up only when your eval says so; top tier with the effort dial raised for hard reasoning and code; small open weights (Gemma 4, gpt-oss-20b) on-device or for strict privacy.
- **Responsible AI** ([Ch 17b §14](#content/17b_llm_applications)): test bias with counterfactual swaps (change only the name, gender or dialect); guardrails on input **and** output — independent filters multiply (two that each miss 10% let ~1% through), but they are **not** a security boundary for agents (least-privilege tools and approval gates are); serving energy dominates at scale (median Gemini Apps text prompt ≈ 0.24 Wh vs ≈ 1,287 MWh to train GPT-3 — a billion prompts a day overtake it in ~5 days); ship against a checklist (red-team, evals, bias, hallucination rate, privacy, monitoring, fallback, AI disclosure, rate limits).

---

### Evaluation

Full recap of the eval stack, judges and A/B tests: the Ch 17c section below; benchmark map as of Nov 2026: [Ch 20 §20.13](#content/20_2026_landscape).

| Metric | What it measures | Notes |
|--------|-----------------|-------|
| **Perplexity** | $e^{\text{loss}}$ (nats) $= 2^{H}$ (bits) — model surprise at test text | Lower = better; compare only models sharing a tokenizer and test text; doesn't directly measure usefulness |
| BLEU | N-gram precision vs reference (translation) | Misses semantic equivalence |
| ROUGE-L | Longest common subsequence recall (summarisation) | ROUGE-1 = unigram, ROUGE-2 = bigram |
| MMLU, HumanEval, GSM8K | Academic knowledge / Python functions / grade-school maths | **Saturated** — no longer separate frontier models |
| SWE-bench Verified / Pro | Real GitHub bug fixes | Verified retired by OpenAI Feb 2026 (flawed tests, contamination); Pro: OpenAI found ~30% broken tasks and retracted its recommendation 8 Jul 2026 — treat scores as rough |
| GPQA Diamond | 198 graduate-level science questions | **Saturated** — top score 96.4% (Gemini 4 Argon, Sep 2026) |
| Arena (arena.ai; formerly LMArena / Chatbot Arena) | Crowd-sourced head-to-head human preference (Elo-style) | Measures preference, not correctness; a 19-point gap is only a 53% win rate. Coding/agent benchmarks are self-reported and **harness-sensitive** (ARC-AGI-3: 62.7% vs 99.9% for the same model in two harnesses) — report model + harness + date |

---

### Inference Optimisation (★★)

**Quantisation** ([Ch 17c §3.1](#content/17c_llm_systems)): reduce weight precision from FP32/FP16 to 8 or 4 bits.

| Precision | Memory (70B model, weights only) |
|-----------|-------------------|
| FP32 | 280 GB |
| FP16/BF16 | 140 GB |
| INT8 / FP8 | 70 GB |
| **INT4** | **35 GB** (one 48–80 GB GPU or 2×24 GB — *not* a single 24 GB card — plus KV cache) |

FP8 (W8A8) is near-lossless for most models and the usual default; 4-bit costs a little quality — check on your own eval. **Weight-only** INT4 (GPTQ, AWQ) speeds **decode** only (the matmul still runs in BF16); **W8A8 / FP8** speeds prefill too. GGUF is llama.cpp / Ollama's quantised format for CPU and laptops.

**KV Cache**: cache Key and Value tensors from prior tokens so each step computes only the new token's K,V and attends over the cache (no re-processing of the prefix). Memory per token $= 2 \times n_\text{layers} \times n_\text{kv-heads} \times d_\text{head} \times \text{bytes}$ — grows **linearly** with context and batch. Use *KV* heads, not query heads (an 8× slip for Llama-3-70B): 320 KiB/token → 2.5 GiB at 8K, 40 GiB at 128K per request (2.5 MiB/token with full MHA).

**FlashAttention**: exact tiled attention with an online softmax; never materialises the $N \times N$ matrix. Extra memory $O(N^2) \to O(N)$; faster (≈ 3× on GPT-2 training) because it moves fewer bytes between HBM and SRAM. Compute is still $O(N^2 d)$ and the KV cache is unchanged. Standard in modern training and prefill.

**Speculative decoding** ([Ch 17c §2.5](#content/17c_llm_systems)): a cheap draft proposes $k$ tokens; the large model verifies all of them in one forward pass and keeps them up to the first rejection. **Lossless** — the output distribution is unchanged. Speed-up ≈ $E \div (1+kc)$ with $E = (1-\alpha^{k+1})/(1-\alpha)$: at $k=4$ and a cheap draft, ≈ 2.8× at acceptance α = 0.8 but only ≈ 1.2× at 0.3 — you want α above ~0.6.

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
> - **Prompting reasoning models** ([Ch 17b §5.4](#content/17b_llm_applications)): drop "think step by step" and scripted steps — give the goal, context, constraints and success criteria, and raise the effort setting. Hidden reasoning counts against the output cap and bills as output.
> - **Hallucination** ([Ch 17b §7](#content/17b_llm_applications)) is partly an incentive problem — right/wrong grading rewards guessing. Reduce it with RAG, citations, tools and an abstention path; temperature 0 makes an answer repeatable, not true.
> - **Prompt injection** (OWASP LLM01) is unsolved at the model level — defend architecturally with least privilege and approval gates; filters alone are not a boundary.
> - **RAG** = retrieve then generate (chunks of 256–512 tokens with 50–100 overlap; retrieve ~20, rerank, keep 3–5). RAG supplies knowledge; fine-tuning shapes behaviour.
> - **Structured output**: schema-constrained decoding beats "please reply in JSON" — it guarantees the shape, not the truth.
> - **LoRA** ([Ch 17b §9.4](#content/17b_llm_applications)): $r(d+k)$ trainable numbers instead of $dk$ (0.78% at $d=k=4{,}096$, $r=16$); $B$ starts at 0; merged adapters add no latency. **QLoRA** (4-bit NF4 base) fine-tunes 65B on one 48 GB GPU.
> - **Temperature, top-p/min-p** control randomness on models you serve; temperature 0 = greedy (a special case); tune temperature *or* top-p; mask dropped logits with $-\infty$. Frontier reasoning models (GPT-6 above effort `none`, Claude 5.5, Gemini 4) drop these knobs — steer with effort, the output cap and a schema.
> - **Cost** = in_tokens × p_in + out_tokens × p_out, output ≈ 5× input; the same traffic spans ~100× between a high-volume and a flagship tier. ~1M-token windows fit a whole manual, but RAG is ~240× cheaper per question.
> - **INT4 quantisation** shrinks a 70B model to ≈ 35 GB (one 48–80 GB GPU, not a 24 GB card) at a small quality cost; weight-only INT4 speeds decode, FP8 (W8A8) speeds prefill too.
> - **BLEU** measures n-gram precision (translation); **ROUGE** measures recall (summarisation). Both fail to capture semantic meaning — they measure surface overlap only.
> - **Arena** (Elo-style) measures preference, not correctness. MMLU, HumanEval, GSM8K and GPQA Diamond are saturated; SWE-bench Verified was retired by OpenAI in Feb 2026, and for Pro OpenAI found ~30% broken tasks and retracted its recommendation on 8 Jul 2026.
> - **PagedAttention** (vLLM) makes the KV cache manageable in production by treating it like OS virtual memory.

---

## Ch 17c — LLM Systems: Serving, Scaling & Measuring

![LLM serving map: nine cards (prefill is compute-bound and sets TTFT; decode is bandwidth-bound and sets TPOT; bandwidth ceiling tok/s = bandwidth / weight bytes per GPU, 48 tok/s for 70B FP16 on 2xH100 and 96 tok/s for INT4 on one H100; KV cache formula with Llama-3-70B at 128K = 40 GiB, more than the 35 GB INT4 weights; TTFT under 300 ms and TPOT under 30 ms, sell goodput; continuous batching Orca 36.9x and PagedAttention 20-38% to 90%+ KV use; speculative decoding 3.36 tokens per pass at alpha 0.8, k 4; weight-only quantization helps decode, FP8 helps both; eval stack assertions, golden set, judge, online A/B), a bill strip (1M requests/day at 4 / 20 USD per 1M tokens = 6,000 USD/day; one 8xH100 node about 17,520 USD/month) and a pick-by-question table](diagrams/rec20s_info_ch17c_serving_map_ai.png)

> 💡 **In a sentence —** Inference has two phases with opposite bottlenecks (prefill = compute-bound, decode = bandwidth-bound); almost every serving optimisation helps exactly one of them, and evaluation is the four-layer stack that tells you whether any of it worked.

---

### Prefill vs Decode — the master model

*Home: [Ch 17c §1.1](#content/17c_llm_systems)*

| | **Prefill** | **Decode** |
|---|---|---|
| Processes | Whole prompt in parallel | One token at a time |
| Bottleneck | **Compute** (math units) | **Memory bandwidth** |
| Sets | **TTFT** | **TPOT / ITL** |
| Helped by | Chunked prefill, prefix caching, W8A8/FP8 | Batching, weight-only quantization, speculative decoding, GQA |

**Bandwidth ceiling:** max tok/s = per-GPU bandwidth ÷ bytes of weights **per GPU**. A 70B FP16 (140 GB) sharded over 2×H100 → 70 GB each ÷ 3.35 TB/s ≈ **48 tok/s** for one stream. At INT4 (35 GB) on one GPU ≈ **96 tok/s**. Always state the shard count. More FLOPs at the same bandwidth do nothing for decode; the H200 (4.8 TB/s) decodes ~1.4× faster than the H100.
![Prefill vs decode and the bandwidth ceiling formula](diagrams/dlrev_bandwidth_ai.png)

### KV cache — the formula to memorise

*Home: [Ch 17c §1.2](#content/17c_llm_systems)*

**KV bytes = 2 × layers × KV-heads × head-dim × seq-len × bytes**

Llama-3-70B (80 layers, 8 KV heads, dim 128, FP16) → **320 KiB/token** (≈ 0.33 MB). With plain MHA (64 KV heads) it would be 2.5 MiB/token — the 8× gap *is* why GQA exists (MLA in DeepSeek-V3 caches 576 numbers per token per layer, ÷ 57 vs MHA of its shape). Use KV heads, not query heads, in the formula, and multiply by concurrent requests.

| Context | 4K | 8K | 32K | 128K |
|---|---|---|---|---|
| KV cache per request (GiB) | 1.25 | 2.5 | 10 | **40** (≈ 43 GB decimal) |

At 128K one request's cache is already **bigger** than the INT4 weights (35 GB), and at 1M (320 GiB) it exceeds even the FP16 weights → KV quantization (FP8 halves it) becomes the lever, not weight quantization. The cache grows *linearly* with context; attention *compute* grows quadratically. MoE does not shrink the cache (it depends on attention, not experts), and the cache — not the weights — usually sets your batch size.

### The four metrics

*Home: [Ch 17c §1.3](#content/17c_llm_systems)*

**TTFT** (queue + prefill) · **TPOT/ITL** (decode; watch the worst gaps too) · **throughput** (your bill) · **goodput** (requests/s that meet *every* SLO — the capacity you can actually sell). Report P50 and P99, never just the mean. Chat targets: TTFT < 300 ms, TPOT < 30 ms. Total = TTFT + TPOT × (N − 1): 200 tokens at 300 ms + 25 ms ≈ 5.3 s, 94% of it decode. Bigger batch → more throughput, worse TPOT and tail — and past a point *lower* goodput.

### Serving optimisations

*Home: [Ch 17c §2.1–2.6](#content/17c_llm_systems)*

| Technique | What it does | Watch out for |
|---|---|---|
| **Continuous batching** | Refills slots at token granularity — the biggest throughput win (Orca 36.9× over FasterTransformer; Anyscale ~8× alone, up to 23× with vLLM) | Needs paged KV; raises TPOT under load |
| **PagedAttention** | Block table + free list; KV memory used for real tokens 20–38% → 90%+ (2–4× throughput, vLLM paper) | Kernel indirection; block-size trade-off |
| **FlashAttention** | Exact tiled attention + online softmax — never writes the $n\times n$ matrix to HBM | Helps training and prefill most; FLOPs and KV-cache size unchanged (Flash-Decoding for decode) |
| **Chunked prefill** | Interleaves prefill slices with decode; on by default in vLLM V1 (`max_num_batched_tokens`) | Slightly worse TTFT for the long request |
| **Prefix caching** | Reuses KV of an identical prefix, whole blocks only | Put variable content **last**, or it never hits |
| **Semantic caching** | Skips the model on similar questions | Can return a *wrong* answer (opposite meaning, another user's data) |
| **Speculative decoding** | Draft + verify; lossless | Needs α above ~0.6 and a cheap draft; gains shrink at high batch |
| **Disaggregation** | Separate prefill/decode pools | Must ship GB of KV between pools (~3.3 GB for a 10K-token prompt) |

**Speculative decoding maths:** E[tokens per target pass] = (1 − α^(k+1))/(1 − α); speed-up ≈ E ÷ (1 + k·c) for a draft costing c of a target step. At α = 0.8, k = 4 → **3.36 tokens/pass** (2.80× with a cheap draft). At α = 0.3 → 1.43 tokens: 1.19× with a cheap draft, 0.79× (a net loss) with a costly one.

**Split to fit, replicate to scale:** tensor parallelism inside an NVLink node lowers per-token latency; pipeline parallelism fits a bigger model but does not speed one stream; expert parallelism spreads MoE experts (an all-to-all every layer); replicas add throughput only.

### Quantization — the question people get wrong

*Home: [Ch 17c §3.1–3.3](#content/17c_llm_systems)*

- **Weight-only** (GPTQ, AWQ, NF4) → helps **decode** only (fewer bytes streamed; the matmul still runs in BF16)
- **W8A8 / FP8** → helps **both**, because activations are quantized too and the low-precision tensor cores engage (H100: ~1,979 FP8 vs ~989 BF16 dense TFLOPS); FP4 (NVFP4 / MXFP4) on Blackwell
- 70B: FP16 140 GB · FP8 70 GB · INT4 35 GB. INT4 on one H100 leaves about 39 GiB for KV cache (fifteen 8K requests) — the concurrency win usually beats the hardware saving.
- **Multi-LoRA:** one resident base model, ~30 MB adapters per request (rank 8 on Q and V of a 70B); different adapters share a batch because only the low-rank term differs.

### Evaluation stack

*Home: [Ch 17c §4.1–4.4](#content/17c_llm_systems)*

```
4. ONLINE      A/B tests, guardrails, cost & latency   ← slowest, truest
3. JUDGE       LLM-as-judge on open-ended output
2. GOLDEN SET  50–200 curated cases, run every change
1. ASSERTIONS  valid JSON? cites source? no PII?        ← fastest
```

**LLM-as-judge biases:** *position* (judge both orders; count a win only if it survives the swap, else a tie; report the flip rate), *verbosity* (length-control), *self-preference* (use a different model family). Prefer **pairwise** over absolute 1–10; calibrate against 100–200 human labels first.

**Golden sets:** built from **real production failures**, versioned in git, mostly deterministic assertions; run each case 3–5 times and track its pass rate. Every incident becomes a permanent case.

**A/B traps:** peeking (checking daily for 10 days turns 5% false positives into ~19% — fix the sample size up front), novelty effect, wrong primary metric, high variance. n per arm ≈ 7.85 × [p₁(1−p₁) + p₂(1−p₂)] ÷ Δ² — about 9,333 sessions per arm for 60% → 62%. One primary metric + guardrails on latency, cost and escalation rate.

### Cost arithmetic (do this out loud)

*Home: [Ch 17c §5.2](#content/17c_llm_systems)*

1M req/day × (500 in + 200 out) = 500M in + 200M out. At 4 / 20 USD per 1M tokens (frontier tier, Nov 2026) → **6,000 USD/day ≈ 182,500 USD/month**; the mid tier (2 / 10) halves it.

Self-host a 70B: 200M ÷ 86,400 ≈ **2,315 out tok/s** on average; size for a 3× peak. The workload is input-heavy, so FP8 W8A8 fits it on **one 8×H100 node** (≈ 17,520 USD/month at 3 USD per GPU-hour) where INT4 weight-only needs two. Break-even vs frontier prices ≈ **2B tokens/month** (4.1B vs mid tier). Caveats: headcount, redundancy, peak-vs-mean capacity, quality gap.

**Cache first** — prompt caching bills a repeated prefix at 2.5–10% of the input price, and a semantic cache that answers 30% of requests removes 30% of the bill.

---

## Ch 18 / 18b — AI Agents & Tool Use

![AI agents map: nine cards (agent loop = LLM + tools + loop + state, observe, think, act, 95% per step gives 60% over 10 steps; tool calling where the model emits JSON and your code validates and runs it, the security boundary; MCP with one client per server, N x M to N + M, tools, resources and prompts, stateless since spec 2026-07-28; A2A agent-to-agent delegation with Agent Cards and Tasks; patterns starting from a single agent, multi-agent at about 15x the tokens of a chat; context stack with stable layers first and the moves write, select, compress, isolate; six failure modes each needing a guard in code; action gates allow, log, confirm, human and the sandbox ladder process, container, gVisor, Firecracker; pass@k vs pass^k at p 0.9, k 8 about 100% vs 43%) and a pick-by-question table](diagrams/rec20s_info_ch18_agents_map_ai.png)

> **Chapter 18 is now two chapters.** [Ch 18](#content/18_ai_agents) = how an agent works (loop, tools, MCP, A2A, patterns, multi-agent, memory, context engineering). [Ch 18b](#content/18b_agents_in_production) = how you run one safely (failure modes, injection defence, evaluation, human gates, sandboxing, long-running agents).

> 💡 **In a sentence —** An AI agent is an LLM operating in a loop — observe → think → act → observe — that uses tools to accomplish multi-step goals autonomously in the real world.

---

### The Agent Loop

*Home: [Ch 18 §18.1](#content/18_ai_agents)*

```
User Goal
    │
    ▼
Observe (context, results) → Think (LLM reasons) → Act (tool call / API)
                                    ▲                       │
                                    └───────────────────────┘
                (repeat until done, stuck, or a step/token/time/cost budget runs out)
```

Agent = **LLM + tools + loop + state** — the *model* picks the next step at run time. **ReAct pattern** (Reason + Act, Yao et al. 2022): `Thought → Action → Observation`, repeated; interpretable, an audit trail for debugging. Native tool calling (since mid-2023) replaced regex-parsing "Action:" text, but the loop is the same.

**Single call vs workflow vs agent:** if one LLM call does it, don't loop; if *you* can list the steps, build a workflow (cheaper, faster, testable); use an agent only when the model must choose the steps.

**Reliability compounds:** P(task) ≈ pⁿ — 95% per step is 60% over 10 steps and 36% over 20; 99% per step gives 90% over 10.

---

### Function Calling / Tool Use

*Home: [Ch 18 §18.2](#content/18_ai_agents); request format in [Ch 17b §9.3](#content/17b_llm_applications)*

The LLM outputs structured JSON specifying which function to call + arguments. Your code validates and executes the function. The LLM never executes anything directly — **critical security boundary**.
![Function calling: the LLM never executes tools directly](diagrams/dlrev_toolcalling_ai.png)

```
App → (message + tool schemas) → LLM
LLM → tool_call JSON → App
App → validates, executes tool → result
App → (result) → LLM
LLM → final answer (or another tool call)
```

**Tool design = prompt design:** specific, namespaced names; 3–4-sentence descriptions (the model reads these); typed parameters with enums and formats; small structured JSON output; one coherent job per tool; few tools per agent. Strict mode guarantees the argument *shape*, not sensible values — still validate.

**Same loop, different field names (Nov 2026):** OpenAI `function_call` / `function_call_output` (`call_id`) · Anthropic `tool_use` / `tool_result` (`tool_use_id`) · Gemini `function_call` / `function_result` (`call_id`). With parallel calls, send back one result per call id.

**Errors:** return model-fixable ones (bad argument, unknown tool) as tool results that say what is allowed; stop on ones it cannot fix (expired credentials, quota, server down). Cap retries.

---

### Model Context Protocol (MCP)

![Infographic: MCP, the Model Context Protocol (Anthropic, Nov 2024; Agentic AI Foundation since Dec 2025; spec 2026-07-28, as of Nov 2026). Connectors drop from N x M to N + M (10 apps x 50 services = 500 vs 60 pieces); before MCP 3 apps x 3 services need 9 connectors, with MCP a host runs one client per server, each speaking JSON-RPC 2.0 to GitHub, PostgreSQL and Slack servers; cards for host, client, server, stateless spec, tools = verbs, resources = nouns, prompts = recipes and client features; error answers (isError result, -32602, -32022); function calling is model to host, MCP is host to server.](diagrams/ag18_info_mcp_architecture_ai.png)

> **MCP** is an open protocol introduced by Anthropic (Nov 2024) and governed since 9 Dec 2025 by the **Agentic AI Foundation** (a Linux Foundation fund) — "a USB-C port for AI apps". 10,000+ active public servers by Dec 2025; current spec revision **2026-07-28** ([Ch 18 §18.3](#content/18_ai_agents)).

**Architecture**: Host (your app — owns the model, UI and consent) → one MCP Client **per server** → MCP Servers (GitHub, DB, Slack…) over JSON-RPC 2.0. Replaces N×M custom integrations with N+M (10 apps × 50 services: 500 connectors → 60 pieces).

**MCP vs function calling:** function calling is the model ↔ host contract; MCP is the host ↔ tool-server contract. The host turns MCP tools into the model's tool list — the model never speaks MCP.

**Three primitives**:

| Primitive | What | Who controls |
|-----------|------|-------------|
| **Tools** | Functions (verbs) | Model-controlled |
| **Resources** | Data (nouns) | App-controlled |
| **Prompts** | Templated workflows (recipes) | User-controlled |

**Stateless since 2026-07-28:** no `initialize` handshake, no session, no `Mcp-Session-Id`; every request carries its protocol version and client capabilities in `_meta`, so any replica can answer. State lives behind explicit handles (e.g. a `basket_id` the model passes back). Sampling and Roots are deprecated; Elicitation stays.

**Transports**: stdio (local; the host starts the server as a subprocess) vs Streamable HTTP (remote/production: one HTTP POST per message, the reply a JSON body or an SSE stream; no sticky sessions). The old HTTP+SSE transport is deprecated.

**Security risks**: prompt injection via tool outputs, tool poisoning and rug pulls, over-broad permissions, data exfiltration, unapproved destructive calls, stolen tokens. OAuth 2.1 and tool annotations (`readOnlyHint`, `destructiveHint`) date from the 2025-03-26 revision — treat annotations as hints from potentially untrusted servers, and bind tokens to one server (no token passthrough).

---

### Agent Architecture Patterns

*Home: [Ch 18 §18.4–18.5](#content/18_ai_agents)*

**Reasoning (one agent):** ReAct (decide as you go) · Plan-and-Execute (plan first, re-plan on failure) · Reflexion (self-critique and retry after a failed check).

| Pattern | When to use | Key detail |
|---------|------------|-----------|
| **Single agent** | One model + a few tools — start here | Breaks down as the context fills or tools multiply |
| **Router** | Distinct request types | A cheap model classifies into fixed labels (+ a "general" fallback); a *workflow* — your code picks the path |
| **Pipeline (sequential)** | Fixed stages known in advance | Latency adds up (t₁ + … + tₙ); gates between steps catch early mistakes |
| **Orchestrator-worker** | Subtasks you cannot list in advance | Lead model splits at run time; latency ≈ t_plan + max(tᵢ) + t_synth |
| **Evaluator-optimiser** | Clear criteria, feedback helps | Generate → critique → revise; cap at 2–3 rounds |

Start with the simplest pattern that could work (Anthropic, *Building effective agents*, Dec 2024).

**Multi-agent costs:** Anthropic's multi-agent research system beat a single agent by 90.2% on its internal eval, at ~15× the tokens of a chat (a single agent ~4×). Parallel *writers* make conflicting decisions (Cognition) — keep writes single-threaded; add agents for read-only search and fresh-eyes review.

---

### A2A Protocol

> **A2A** (Agent2Agent; Google, April 2025 → Linux Foundation June 2025 → Agentic AI Foundation Aug 2026) lets independent, *opaque* agents discover each other and delegate work. MCP = agent-to-tools (vertical). A2A = agent-to-agents (horizontal, cross-org, cross-vendor) ([Ch 18 §18.3](#content/18_ai_agents)).

A2A v1.0 (March 2026): an **Agent Card** at `/.well-known/agent-card.json` (skills, endpoint, auth; may be signed) for discovery, then **Tasks** with a lifecycle (`submitted → working → completed`, pausing at `input-required` / `auth-required`) that return **artifacts**. Bindings: JSON-RPC 2.0, gRPC or HTTP+JSON, with SSE streaming and webhook push. Need a function result now → MCP tool; delegating a long-running job to another team's agent → A2A. A remote agent's output is untrusted input.

---

### Agent Memory & Context Engineering

*Home: [Ch 18 §18.8–18.9](#content/18_ai_agents)*

**Memory types** (CoALA): **working** (context window, tool results, scratchpad) · **semantic** (facts about the user or world) · **episodic** (past episodes and outcomes) · **procedural** (how-to: system prompt, Agent Skills, code) — plus **checkpoints** for task state (LangGraph: `InMemorySaver` in tests, `PostgresSaver` in production). Retrieve memories by relevance + recency + importance.

When the context window fills: (1) truncate oldest (silently loses early decisions), (2) **compact** — summarise older turns, (3) keep recent turns and retrieve older ones from a vector DB.

**Context engineering** (the term caught on in mid-2025): designing everything the model sees — the smallest set of high-signal tokens. Room for history = window − system − tools − docs − reserved output. Stable layers go first so the prompt cache can reuse them:

```
1. System prompt          (static, developer-set)
2. Long-term memory       (summarised from past sessions)
3. Retrieved docs         (RAG, per query)
4. Tool results           (per step)
5. Conversation history   (grows every turn)
6. Current user message   (this turn)
```

**Four moves:** write (notes outside the window) · select (RAG, tool search) · compress (compaction, trimmed tool output) · isolate (sub-agents with clean contexts).

**Context rot:** quality drops as the window fills, even on simple tasks (Chroma, 18 LLMs, 2025) — failures are poisoning, distraction, confusion and clash.

**Tool bloat:** selection accuracy degrades past 30–50 tools; tool search loads 3–5 tools at a time and cuts definition tokens by over 85%.

---

### Agents in production — the flashcard version

*Home: [Ch 18b](#content/18b_agents_in_production)*

**Six failure modes:** prompt injection · tool misuse · infinite loops · hallucinated tool calls · cost explosion · context overflow (guards in the table below). Each needs a *guard* in code, not a better prompt.

**Jailbreak vs injection.** Jailbreak attacks the vendor's safety training; injection attacks *your* instructions. Indirect injection (payload inside a page, PDF or RAG chunk the agent reads) is the dangerous one — invisible to the user, and with tools attached it becomes real actions. "Ignore instructions in the input" cannot work: instructions and data share one channel. Injection is **LLM01** in the 2025 and 2026 OWASP LLM lists and **ASI01 Agent Goal Hijack** in OWASP's Agentic Top 10.

**Lethal trifecta** (Willison, 2025): untrusted input + private data + a way to act or communicate out. Meta's **Agents Rule of Two**: give one session at most two of the three, or have a human approve the third.

**Dual-LLM** (Willison, 2023): privileged model plans and holds tools but never sees untrusted bytes; quarantined model reads untrusted content but has no tools. Only schema-validated values cross — same principle as parameterised SQL. **CaMeL** (Google, Google DeepMind and ETH, 2025) hardens it with provenance tags and a policy check at every tool call (77% of AgentDojo tasks with provable security vs 84% undefended).

**MCP attacks:** *tool poisoning* (instructions hidden in tool metadata) · *rug pull* (definition changed after approval — hash at approval, re-verify on load) · *cross-server shadowing*.

**Action classification:** read-only → allow · low-risk write → allow + log · high-risk → confirm · irreversible → explicit human approval, always. Gate when P(wrong) × impact > cost of a review; the risk class lives in *your* registry, not the server's annotations.

**Containment:** process < container < gVisor < Firecracker microVM. Filesystem isolation without a **default-deny egress allowlist** (matching the parsed host exactly) still permits exfiltration. Scoped, short-lived credentials the model never sees. Hard budgets on tokens, steps, time and cost, then escalate.

**Long-running agents:** durable state + checkpoint/resume · retries with capped exponential backoff + jitter · **idempotency keys** (task id + step) on side-effecting calls · re-check permissions at point of *use* · re-validate the goal (it may be stale).

**Dashboard:** task success · tool-call error rate · steps p95 · cost per task · escalation rate (two-sided alarm — zero usually means the gate broke) · safety events · **trace replay**.

---

### Production Failure Modes

*Home: [Ch 18b §18.10, §18.13](#content/18b_agents_in_production)*

| Failure | Guard |
|---------|-----------|
| Prompt injection (page, email or tool result) | Least privilege, approval gates, egress control, dual-LLM split |
| Tool misuse — right tool, wrong target | Your own risk registry; confirmation for destructive calls |
| Infinite loops | Step cap (e.g. 25), repeat detector, timeout |
| Hallucinated tool calls | Validate every call against the registry and its schema |
| Cost explosion | Per-task token and cost budgets |
| Context overflow | Trim or summarise tool output; per-section token budget |

**HITL (Human-in-the-Loop)**: pause before irreversible or high-blast-radius actions (delete, deploy, money leaving, external messages). Checkpoint the full state, notify a human, resume on approve/deny — in LangGraph, `interrupt()` + a checkpointer, resumed with `Command(resume=...)` (the node re-runs from its first line).

#### Agent Evaluation

*Home: [Ch 18b §18.12](#content/18b_agents_in_production)* — harder than evaluating one LLM call: the output is a multi-step trajectory, many paths are valid, and the same agent can pass one run and fail the next.

**Grade both** the **end state** (is the refund in the database? do the tests pass?) and the **trajectory** (which tools, in what order, any policy broken) — never the agent's own claim that it finished. End-to-end tells you *if* it failed; per-step tells you *where*.

**Key metrics**: task success rate · **consistency (pass^k)** · steps to success · tool-call accuracy and invalid-call rate (hallucinated tools should be 0) · cost per task · latency p50/p95.

**pass@k vs pass^k:** pass@k = 1 − (1 − p)^k asks "did *any* try work?" (capability); pass^k = p^k asks "did *every* try work?" (reliability, from τ-bench). At p = 0.9, k = 8 → ≈ 100% vs **43%**. Ship the consistent agent and route what it cannot do to a human.

**Benchmarks:** SWE-bench Verified was retired by OpenAI in Feb 2026 (flawed tests, contamination); for SWE-bench Pro OpenAI found ~30% broken tasks and retracted its recommendation on 8 Jul 2026, so treat its scores as rough. Also name Terminal-Bench (4.0 current), τ-/τ²-bench, OSWorld, GAIA, BrowseComp and AgentDojo — and quote version, scaffold and number of trials.

**LLM-as-judge for agents:** give the judge the full trace (tool calls and results), ask narrow yes/no questions per criterion, make it quote the step it grades, and check in code anything a program can check. Debias it as in [Ch 17c §4.2](#content/17c_llm_systems) — both orders, a different model family.

> ✅ **Must-remember**
>
> - Agent = LLM + tools + loop + state; the model picks the next step. Reliability compounds as pⁿ.
> - **ReAct** interleaves Thought/Action/Observation — interpretable and debuggable.
> - **MCP** = N+M integrations (not N×M) via Tools/Resources/Prompts; stateless since spec 2026-07-28; governed by the Agentic AI Foundation.
> - **A2A** = agent-to-agent delegation (Agent Cards, Tasks); MCP = agent-to-tools.
> - Start with one agent; add multi-agent only with eval evidence (~15× the tokens of a chat).
> - Production agents need: step/token/cost budgets, confirm-destructive, least privilege, egress control, tracing, a HITL path — and pass^k, not just pass@1.

---

## Ch 19 — AI Frameworks & Engineering

![AI engineering stack map as of Nov 2026: nine cards (agent frameworks with LangChain + LangGraph as the production default, CrewAI, MS Agent Framework and Google ADK, AutoGen archived; LlamaIndex + Workflows for document-heavy RAG with 256-512 token chunks and 50-100 overlap; DSPy compiles prompts against an eval set; Pydantic AI / Instructor validate and retry at 1 / (1 - f) calls; fine-tuning with Hugging Face TRL + PEFT, LoRA trains r x (d_in + d_out) per matrix, QLoRA uses a 4-bit base; pgvector under 10M vectors, hybrid search fused by RRF 1/(60 + rank), rerank top-20 to 3; one CI eval tool plus one tracing platform; Ollama for dev, vLLM for prod, SGLang for heavy prefix reuse, TGI archived Mar 2026; cost levers with prompt caching paying above a ~22% hit rate and batch APIs at 50% off), badges for Vertex AI becoming Gemini Enterprise Agent Platform and OWASP 2026 LLM01 prompt injection, and a pick-by-question table](diagrams/rec20s_info_ch19_stack_map_ai.png)

> 💡 **In a sentence —** The 2026 AI engineering stack layers agent frameworks, RAG tooling, vector databases, evaluation, and inference servers into a production lifecycle; knowing when to use each layer — and when to skip it — is the core skill.

---

### Framework Landscape

*Home: [Ch 19 §19.1](#content/19_ai_frameworks)* — sensible defaults as of November 2026:

```
         LangChain + LangGraph   ←  agents; LangGraph for state, loops, approvals
         LlamaIndex + Workflows  ←  document-heavy RAG, data
         DSPy                    ←  prompt optimisation with evals
         Pydantic AI             ←  type-safe agents
         CrewAI / MS Agent Fwk   ←  multi-agent roles / conversations
         Google ADK              ←  GCP-native enterprise agents
              ↓
         Hosted APIs / vLLM (production) / Ollama (local dev)
              ↓
         pgvector / Qdrant / Weaviate / Pinecone / Milvus
              ↓
         MLflow 3 / LangSmith / Langfuse / Ragas / DeepEval
```

*MS Agent Fwk* = Microsoft Agent Framework, the successor to the archived AutoGen.

---

### LangChain & LangGraph

*Home: [Ch 19 §19.2](#content/19_ai_frameworks)*

**LangChain 1.0** and **LangGraph 1.0** went GA together in October 2025 (1.4 / 1.2 in November 2026). LCEL pipe syntax: `prompt | model | parser`. **`create_agent`** is the standard single agent with tools (it replaced `create_react_agent`), customised with **middleware** (summarise history, redact PII, require approval); older chains and retrievers moved to `langchain-classic`. Swap model/provider without touching the rest.

**LangGraph**: steps as a graph of state-typed nodes with conditional edges — for cycles, branches and approvals. Headline: **durable execution** (a checkpointer such as `PostgresSaver` resumes a crashed run from its last finished step), persistence by `thread_id`, and HITL pauses (`interrupt()`, resumed with `Command(resume=...)`).

**LangSmith**: traces every prompt, retrieval, tool call, and token. Single most useful debugging tool for "almost working" agents. Enable: `LANGSMITH_TRACING=true` plus `LANGSMITH_API_KEY`.

**When to reach for LangChain**: RAG, chatbots, agents, multi-step, fast provider switching. Use the raw SDK for a 50-line script; use LlamaIndex for heavy document ingestion.

---

### LlamaIndex & Workflows

*Home: [Ch 19 §19.3](#content/19_ai_frameworks)*

**LlamaIndex** specialises in connecting LLMs to data. **Workflows 1.0** (June 2025): event-driven, async-first agent runtime — each `@step` receives typed events and emits typed events, so branches, loops and pause/resume fall out naturally. It is now a separate package, `llama-index-workflows` (2.x), usable without the rest of LlamaIndex.

Three-line RAG: `SimpleDirectoryReader → VectorStoreIndex → query_engine` — many built-in readers, plus LlamaParse for messy PDFs; chunk size, overlap and top-k still need tuning.

**vs LangChain**: LlamaIndex wins on data parsing and retrieval primitives; LangChain wins on agent orchestration breadth. Many production stacks combine both.

---

### DSPy — Programming, Not Prompting

*Home: [Ch 19 §19.4](#content/19_ai_frameworks)*

**DSPy** (Stanford; 3.4, Sep–Oct 2026): declare a `Signature` (input→output fields), wrap it in a `Module` (`Predict`, `ChainOfThought`, `ReAct`), then run an optimizer on a few dozen labelled examples and a metric — **MIPROv2** (bootstrapped demos + LM-proposed instructions + Bayesian search), **GEPA** (reads failures and rewrites the instructions) or `BootstrapFewShot` for ~10 examples. "Compiling" is a search: keep the candidate prompt with the best mean metric. The DSPy paper reported gains of over 25% (GPT-3.5) and over 65% (Llama-2-13B-chat) against standard few-shot on its tasks — your gain depends on your task. Save the compiled program as JSON; re-compile when you switch models.

Use DSPy when you have evals and care about numbers, and confirm the winner on a held-out dev set (with a dozen examples the top score can be luck). No eval set = nothing to optimise against.

---

### Pydantic AI

*Home: [Ch 19 §19.5](#content/19_ai_frameworks)*

Type-safe agents (1.0 Sep 2025, 2.0 Jun 2026): `output_type` is a Pydantic model, tool schemas come from type hints and docstrings, `instructions=` sets the system-level text. If the model returns the wrong schema → re-prompt with the validation error. `Instructor` is the cousin for non-agent use (wraps an LLM client so calls return Pydantic models). Under both is a capped validate-and-retry loop: at failure rate f it costs 1 / (1 − f) calls per item, and a schema guarantees shape, not correctness.

---

### Multi-Agent Frameworks: LangGraph, CrewAI, Agent Framework, ADK

*Home: [Ch 19 §19.6](#content/19_ai_frameworks)*

| Framework | Model | Sweet spot | Status (Nov 2026) |
|-----------|-------|-----------|--------|
| **LangGraph** | Explicit state graph | Production: durability, branching, human approval | **GA** since 1.0 (Oct 2025) |
| **CrewAI** | Role-based crews + event-driven Flows | Pipeline-style roles, low learning curve | Active (1.x) |
| **Microsoft Agent Framework** | Agents + graph workflows (Semantic Kernel base + AutoGen patterns) | Python/.NET teams on Azure; anyone leaving AutoGen | **GA** 1.0 (Apr 2026) |
| **Google ADK** | Code-first, multi-agent, deploys to Google Cloud | GCP shops | Active (2.x) |
| AutoGen | Conversational `GroupChat` | Reading old code only | **Archived** (community fork AG2 continues) |

Warning: every agent turn = at least one LLM call. 4-agent debate × 5 rounds = 20 calls; if every agent re-reads the whole chat (200 new tokens a turn) that is 38,000 input tokens vs 3,800 for a pipeline — cost grows with the *square* of the conversation. Quantify before adopting multi-agent.

#### Hugging Face Ecosystem

*Home: [Ch 19 §19.7](#content/19_ai_frameworks)* — the Hub hosts 3M+ models and ~1.1M datasets (Oct 2026).

| Library | Purpose | Key APIs |
|---------|---------|---------|
| `transformers` (v5) | Load/run pretrained models | `pipeline(...)`, `AutoModelForCausalLM.from_pretrained()` |
| `datasets` | Load/stream datasets | `load_dataset("name")` |
| `trl` | Post-training: SFT, DPO, GRPO, reward modelling | `SFTTrainer`, `SFTConfig` |
| `peft` | LoRA, QLoRA, prompt tuning | `LoraConfig` |
| `accelerate` | Multi-GPU / multi-node launch | `Accelerator()`, device map auto |
| `bitsandbytes` | 4-bit loading for QLoRA | `BitsAndBytesConfig(load_in_4bit=True)` |

**LoRA fine-tuning with TRL + PEFT** — trainable weights per adapted matrix = r × (d_in + d_out), ≈ 2.3M (0.4%) for Qwen3-0.6B at r = 16 on `q_proj` and `v_proj`:
```python
# Runs locally (a GPU helps): pip install trl peft datasets; downloads Qwen3-0.6B, no API key
from datasets import load_dataset
from peft import LoraConfig
from trl import SFTConfig, SFTTrainer

dataset = load_dataset("trl-lib/Capybara", split="train[:1000]")  # chat-format examples
lora = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
                  target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM")
trainer = SFTTrainer(model="Qwen/Qwen3-0.6B", train_dataset=dataset, peft_config=lora,
                     args=SFTConfig(output_dir="./lora-out", num_train_epochs=1, learning_rate=1e-4))
trainer.train()
trainer.save_model()  # saves only the adapter: a few MB
```

**QLoRA** is the same recipe with the frozen base loaded in 4-bit (NF4), which fits a 7B fine-tune on one 16–24 GB GPU ([Ch 17b §9.4](#content/17b_llm_applications)). After training, merge the adapter (W′ = W + (α/r)·B·A — no extra inference latency) or keep it separate to hot-swap many adapters on one base ([Ch 17c §3.3](#content/17c_llm_systems)).

---

### Vector Databases

*Home: [Ch 19 §19.9](#content/19_ai_frameworks)*

| DB | Best for |
|----|---------|
| **pgvector** | Up to millions of vectors (< 10M), already on Postgres — default for most teams; pair with Postgres full-text search for hybrid |
| **Qdrant** | High-throughput open source (Rust); rich payload filters; dense + sparse hybrid |
| **Weaviate** | Hybrid search (vector + BM25 + filters) in one query |
| **Pinecone** | Managed, serverless, zero ops |
| **Milvus/Zilliz** | Billions of vectors, distributed (Zilliz = managed) |
| **Vector Search** (Agent Platform, formerly Vertex AI) | Managed on Google Cloud (ScaNN); 2.0 (renamed Agent Retrieval) adds hybrid search |
| Chroma | Local dev/prototyping |

**Key insight**: pure vector search underperforms **hybrid search** (vector + BM25 + metadata filters) on most real workloads. IDs, names, version numbers need exact match; meaning needs vectors. Fuse the two rankings with **reciprocal rank fusion**: RRF(d) = Σ 1/(60 + rank) — ranks only, so scores never need rescaling.

**Filter ACLs inside the search:** post-filtering a global top-k leaves about fetch × p results for a user who may see a share p of the index (top-20 at 3% ≈ 0.6 results).

---

### Modern RAG

*Home: [Ch 19 §19.9](#content/19_ai_frameworks)*

Vanilla RAG: chunk (start at 256–512 tokens with 50–100 overlap) → embed → top-K → stuff into prompt. Fails in specific ways; fix each failure mode as you hit it:

| Vanilla fails when | Fix | What it does |
|-------------------|-----|-------------|
| Question and doc use different words | **HyDE** | Generate hypothetical answer; embed that; retrieve against it |
| Exact ID/SKU match fails | **Hybrid search** | Vector + BM25, fused with RRF |
| Top-K by similarity ≠ top-K by meaning | **Reranking** | Cross-encoder rescores top-20 → keep best 3 |
| Chunk meaningless alone | **Contextual chunking** | Prepend a short document-level context to each chunk |
| Multi-part question | **Query rewriting** | LLM splits into sub-queries |
| Not every Q needs retrieval | **Agentic RAG** | LLM decides whether and what to retrieve as a tool call |
| Facts are relational | **Graph RAG** | Retrieve subgraphs from knowledge graph |

**Contextual retrieval** (Anthropic, 2024) prepends an LLM-written 50–100-token note to each chunk before embedding *and* BM25 — 49% fewer failed retrievals, 67% with reranking. **Late chunking** embeds the whole document first, then pools token vectors per chunk (no extra LLM calls).

**Highest-leverage changes: a stronger embedding model and a reranker** — retrieve 20, rerank to 3 with a cross-encoder (e.g., Cohere Rerank). Shortlist embeddings on MTEB's *Retrieval* task, then re-test the top 2–3 on your own data.

---

### Evaluation & Observability

*Home: [Ch 19 §19.10](#content/19_ai_frameworks); the concepts in [Ch 17c §4](#content/17c_llm_systems)*

**Three layers**: offline evals (curated test set per release), online evals (LLM-as-judge on a *sample* of live traffic — about 1% of 1M requests/day pins a 90% pass rate to ±0.6 points), tracing (every prompt, retrieval, tool call).

| Tool | Purpose |
|------|---------|
| **Ragas** | RAG metrics: faithfulness, context precision/recall, answer relevancy |
| **DeepEval** | pytest-style LLM unit tests; CI/CD friendly |
| **LangSmith** | Tracing + evals; deepest LangChain/LangGraph integration (hosted) |
| **MLflow 3** | Classic ML + GenAI in one: OpenTelemetry tracing, LLM-judge scorers, prompt registry |
| **Langfuse / Arize Phoenix** | Open-source, self-hostable tracing + evals |
| **W&B Weave / Braintrust** | Hosted evals, tracing and dashboards |
| **promptfoo** | CLI regression detection, red-team (OpenAI agreed to buy it, Mar 2026) |

Pattern: **one CI tool + one platform**. Ask "can traces leave our VPC?" first, and instrument with OpenTelemetry so switching stays cheap.

**LLM-as-judge failure modes**: position bias (judge both orders; count only verdicts that survive the swap), verbosity bias (length-control), self-preference (a judge favours its own model family — use a different family). Calibrate on 100–200 human labels and make the judge quote its evidence.

---

### Inference Servers

![Infographic comparing inference server tiers as of Nov 2026: local dev (Ollama, llama.cpp, MLX, LM Studio), production serving (vLLM as the default, SGLang, TensorRT-LLM, TGI archived Mar 2026) and orchestration (NVIDIA Dynamo, llm-d, Ray Serve, Dynamo-Triton). Shows throughput = concurrent requests x tokens/s per request (32 users x 25 tokens/s = about 800 tokens/s), and the Red Hat Aug 2025 benchmark on one A100 40 GB with Llama 3.1 8B: vLLM 793 vs Ollama 41 output tokens/s and P99 time-to-first-token 80 ms vs 673 ms, plus a need-to-tool table.](diagrams/fw19_info_inference_servers_ai.png)

*Home: [Ch 19 §19.11](#content/19_ai_frameworks); how serving works in [Ch 17c](#content/17c_llm_systems)*

```
Local dev:       Ollama (easiest: pull a model, run it)
                 llama.cpp (CPU/GGUF) · MLX (Apple silicon) · LM Studio
Production:      vLLM (DEFAULT) — PagedAttention + continuous batching
                 SGLang — RadixAttention; agents, heavy prefix reuse
                 TensorRT-LLM — peak NVIDIA performance, more setup
                 TGI — maintenance since Dec 2025; repo ARCHIVED Mar 2026
Orchestration:   NVIDIA Dynamo, llm-d, Ray Serve, Dynamo-Triton
```

**vLLM PagedAttention**: stores the KV cache in fixed-size blocks (like OS virtual-memory pages), so almost no memory is wasted — about **2–4× the throughput** of earlier serving systems at the same latency (vLLM paper); continuous batching underneath (Anyscale: up to 23× over static batching with vLLM). V1 engine since v0.8, OpenAI-compatible `vllm serve`, NVIDIA/AMD/Intel/TPU. Red Hat benchmark (Aug 2025; one A100, Llama 3.1 8B): vLLM peaked at 793 tok/s vs Ollama's 41, P99 TTFT 80 ms vs 673 ms — apples-to-oranges by design.

**Most teams**: Ollama for dev, vLLM for prod.

---

### Google AI Engineer Stack

*Home: [Ch 19 §19.12](#content/19_ai_frameworks); models and TPUs in [Ch 20 §20.12](#content/20_2026_landscape)*

**Gemini Enterprise Agent Platform** — launched at Google Cloud Next (22 Apr 2026) as "the evolution of Vertex AI"; agents reach employees through the Gemini Enterprise app:

| Component | Role |
|-----------|------|
| **ADK** | Open-source code-first agent framework (Python, TypeScript, Go, Java); multi-agent, A2A and MCP built in |
| **Agent Studio** | Low-code visual builder; export to ADK |
| **Agent Runtime** (formerly Agent Engine) | Managed runtime — deploy, scale, sessions, Memory Bank, long-running agents |
| **Agent Identity, Registry, Gateway** | Governance: every agent gets an identity, is listed, goes through policy |
| **Model Garden** | 200+ models: Gemini, Gemma, third-party models such as Claude |
| **Pipelines, Feature Store, Model Registry** | Classic Vertex AI MLOps, now under the Agent Platform name |
| **Genkit** | Lighter open-source framework for AI features in apps (TypeScript, Go, Python, Dart) |

Key papers from Google: *Attention Is All You Need* (2017), *BERT* (2018), *T5* (2019), *Switch Transformer* (2021), *Chain-of-Thought Prompting* (2022), *Chinchilla* (DeepMind, 2022), *PaLM/PaLM 2*, Gemini technical reports.

---

### Model Access & Governance

*Home: [Ch 19 §19.12a–19.12b](#content/19_ai_frameworks)*

**Route by compliance first:** enterprises mostly reach frontier models through their cloud — Amazon Bedrock (Claude, OpenAI GPT since June 2026, Nova; AgentCore runtime), Microsoft Foundry (OpenAI, Claude), Google's Agent Platform (Gemini, Claude in Model Garden) — for IAM, residency, private networking and one bill. Air-gapped means self-hosted open weights or an on-prem appliance.

**OWASP Top 10 for LLM Applications, 2026 edition** (Aug 2026, eight of ten reordered): LLM01 prompt injection (still #1) · LLM03 excessive agency (up from #6) · LLM10 improper output handling (treat model output as untrusted — never `eval` it). Agents also need OWASP's **Top 10 for Agentic Applications** (Dec 2025): ASI01 agent goal hijack.

---

### MLOps Lifecycle & Cost/Latency Levers

*Home: [Ch 19 §19.13–19.14](#content/19_ai_frameworks)*

MLOps cycle: Data versioning (DVC) → Feature store (Feast) → Experiment tracking (**MLflow 3**) → Training (PyTorch/JAX) → Model registry → Serving (**vLLM** / FastAPI) → Monitoring (Evidently AI, Arize) → Pipeline orchestration (Kubeflow/Airflow) → retrain.

**Interview red flag**: "deploy and forget." Always mention monitoring and retraining.

**Cost levers (in order of impact)**:

| Lever | Savings |
|-------|---------|
| **Prompt caching** | Up to 90% on the cached prefix (hits bill at 10% of input; 5% on Claude Opus/Sonnet 5.5, 2.5% on Fable 5.2) — but writes can cost 1.25×, so it pays only above a ~22% hit rate |
| **Model routing / cascades** | 50–85% in Ch 19's example — easy → Haiku 5.5 / Gemini Flash-Lite / GPT-6 Luna; hard → Opus 5.5 / Gemini 4 Argon / GPT-6 Astra |
| Batch APIs | 50% for work that can wait (results within 24 h) |
| Lower reasoning effort | Large on reasoning models — thinking tokens bill as output |
| Trim the prompt | Proportional — few-shot examples, tool definitions and history grow quietly |

**Latency levers**: streaming (TTFT wins), parallel tool calls, prefix caching (provider caching, vLLM automatic prefix caching, SGLang RadixAttention), lower effort or a smaller tier, edge inference for hot paths.

**Reliability**: structured outputs (eliminates parser failures), guardrails, retries with exponential backoff + jitter, a fallback chain to another model or provider (LiteLLM, OpenRouter), timeout budgets, idempotency keys on tools that cost money. Retries fix blips; fallbacks fix outages (an outage fails every retry).

> ✅ **Must-remember**
>
> - **LangChain + LangGraph** = safe production default for general agents; LlamaIndex = data-heavy RAG; AutoGen is archived → Microsoft Agent Framework.
> - **vLLM** is the default inference server; **TGI** has been in maintenance since Dec 2025 and archived since Mar 2026 — migrate to vLLM or SGLang.
> - **Hybrid search beats pure vector** on real workloads (fuse with RRF); reranking is often the biggest RAG win after embeddings; filter ACLs inside the search.
> - **Prompt caching and model routing** are the biggest cost levers — caching pays only above a ~22% hit rate.
> - **Vertex AI → Gemini Enterprise Agent Platform** (Apr 2026): ADK to build, Agent Runtime to run, Agent Studio for low-code.
> - **DSPy** if you have evals; skip otherwise. **Pydantic AI** for type-safety.

---

## Ch 20 — The 2026 AI Landscape

![2026 AI landscape map as of 5 Nov 2026: a lineup table of three tiers per lab (OpenAI GPT-6 Astra, GPT-6.1 Sol / Terra, GPT-6 Luna; Anthropic Claude Fable 5.1, Opus 5.5 and Sonnet 5.5, Haiku 5.5; Google Gemini 4 Argon, Gemini 3.8 Flash, Gemini 3.5 Flash-Lite; ~1M-token context, top tier ~100x the cheap tier at 10 / 50 vs 0.10 / 0.50 USD per 1M tokens), nine cards (reasoning dial billed as output; open weights about 4 months behind, sparse MoE where memory follows total and compute follows active parameters; coding agents = model x harness x effort, Terminal-Bench 4.0 top 64.8% plus or minus 11 points; OSWorld-Verified 86.1% vs ~72% human, OSWorld 2.0 only 20.6% completed; benchmark status saturated MMLU and GPQA, retired SWE-bench Verified, contested SWE-bench Pro, current Terminal-Bench 4.0, OSWorld 2.0 and HLE; a fixed capability ~10-13x cheaper a year but agents multiply tokens; ~1M context with lost-in-the-middle; EU AI Act dates 2 Aug 2025, 2 Aug 2026, 2 Dec 2027 / 2 Aug 2028 and fines up to EUR 35M or 7%; Google stack Gemini 4 + Agent Platform + TPU7x Ironwood at 42.5 exaFLOPS per pod) and a pick-by-question table](diagrams/rec20s_info_ch20_landscape_map_ai.png)

> ⏱ **Dated snapshot.** Model names and numbers below are the **5 November 2026** view from [Ch 20](#content/20_2026_landscape) (Anthropic's top tier, Arena and FrontierMath updated 11 Nov), in step with [Ch 17 §4](#content/17_llm). They change every few weeks — memorise the *shapes*, say "as of <month, year>", and where a vendor page disagrees, trust the vendor page.

> 💡 **In a sentence —** No single model wins everything: three closed labs each sell a top, a workhorse and a cheap tier with ~1M-token context and a reasoning-effort dial, open weights trail by a few months, and model choice is mostly price, latency, ecosystem and your own eval.

---

### Frontier Model Lineup (Nov 2026)

*Home: [Ch 20 §20.1](#content/20_2026_landscape)*

```
   Tier           OpenAI                 Anthropic                Google
   ────────────   ────────────────────   ──────────────────────   ─────────────────────────
   Top            GPT-6 Astra            Claude Fable 5.2         Gemini 4 Argon
                                                                  (Gemini 4 Carbon: limited)
   Workhorse      GPT-6.1 Sol / Terra    Claude Opus 5.5,         Gemini 3.8 Flash
                                         Claude Sonnet 5.5
   Cheap / fast   GPT-6 Luna             Claude Haiku 5.5         Gemini 3.5 Flash-Lite

   Plus Grok 4.7 (SpaceXSI, formerly xAI). All: ~1M-token context (Grok 500K) + an effort dial.
```

List prices, USD per 1M tokens (input / output): GPT-6 Astra at 10 / 50 · Claude Fable 5.2 at 8 / 40 (from 9 Nov 2026; Fable 5.1 was 10 / 50) · Claude Opus 5.5 at 4 / 20 · GPT-6.1 Sol and Claude Sonnet 5.5 at 2 / 10 · GPT-6 Luna at 0.10 / 0.50. Inside one lab the top tier is ~100× the cheap tier; batch APIs halve most prices.

**Who leads depends on the test:** Claude Opus 5.5 tops Terminal-Bench 4.0; GPT-6 Astra tops ARC-AGI-3 and Humanity's Last Exam; Gemini 4 Carbon tops Arena (text) and the Artificial Analysis index v5.0.

**Interview tip**: don't memorise exact numbers (they drift monthly). Memorise the *shape*: three tiers per lab, the leaders within a few points of each other, open weights a few months behind — so model choice is mostly about price, latency, ecosystem and your own eval.

---

### Reasoning Models & Test-Time Compute

![Infographic of the reasoning-effort dial: a normal call versus a call with 8,000 hidden thinking tokens, a low-to-max effort knob with the OpenAI, Anthropic and Gemini parameter names, the cost formula with thinking billed as output, and worked costs at 2 and 10 USD per 1M tokens where reasoning wins on hard maths (0.184 vs 0.354 USD) but loses on easy lookup (0.104 vs 0.029 USD)](diagrams/land20_info_reasoning_dial_ai.png)

*Home: [Ch 20 §20.2](#content/20_2026_landscape); how they are trained (RLVR, GRPO) in [Ch 17 §3.5b](#content/17_llm)*

> A **reasoning model** allocates additional compute *at inference time* — generating hidden "thinking" tokens before the final answer — so accuracy on hard problems scales with thinking budget, not parameters alone.

```
Normal answer:   Input → [forward passes, one per answer token] → Output
                 (cost grows with the answer length only)

Reasoning:       Input → [think… think… think…] → Output
                          (about 1K to 100K+ hidden tokens; cost grows with
                           how hard the model decides the task is)
```

Thinking is now a **dial on every flagship**, not a separate model line, and models think *adaptively* (fewer tokens on easy prompts). Snell et al. (2024): on problems a small model already partly solves, optimally allocated test-time compute can beat a 14× larger model ([Ch 17](#content/17_llm)). Set it with `reasoning={"effort": ...}` (OpenAI Responses API), `output_config={"effort": ...}` (Anthropic) or `thinking_level` (Gemini). The visible reasoning is a summary, not a guaranteed honest explanation.

**When reasoning helps**: math, formal logic, multi-step planning, hard code generation and long agentic coding, scientific analysis with multiple hypotheses, debugging legacy code. **Skip for**: simple Q&A, creative writing, high-throughput classification, real-time voice, bulk extraction.

**Cost trap**: thinking tokens bill as output — 8,000 hidden tokens before a 300-token answer is ~21× a normal call on a mid-tier model (10–50× is typical). It pays only where a wrong answer is expensive.

---

### Open-Weight Race

*Home: [Ch 20 §20.3](#content/20_2026_landscape)*

Almost every open flagship is a **sparse MoE**: memory follows **total** parameters, compute follows **active** ones (~2 FLOPs per active parameter per token).

| Model (Nov 2026) | Total / active | Licence |
|---|---|---|
| Kimi K3 / K3.1 Pro (Moonshot) | 2.8T / 104B | Custom Kimi licence |
| DeepSeek V4-Pro · V4.1 Flash | 1.6T / 49B · 552B (8B active in prefill, 16B in decode) | MIT |
| Mistral Large 4 | 1.05T / 52B | Modified MIT (model-as-a-service needs a licence) |
| Muse Spark Open (Meta) | 816B / 42B | Muse Model License |
| Qwen 3.5 (Alibaba) | 397B / 17B | Apache 2.0 |
| gpt-oss-120b (OpenAI) | 117B / 5.1B | Apache 2.0 |
| Gemma 4 (Google) | Up to 31B dense / 26B MoE | Apache 2.0 |

The shape: the best open models trail the best closed ones by **about 4 months** (Epoch AI, May 2026), and most come from Chinese labs. Qwen 3.5 needs 13× the memory of Gemma 4 31B yet ~0.55× its compute per token. "Open weights" ≠ open source — training data is almost never released, so check the licence.

**When to pick open-weight**: privacy-critical or sovereign workloads (health, finance, defence), bulk inference where token cost dominates, deep fine-tuning or distillation, research reproducibility.

**When to pick closed**: top-end agent reliability, the newest reasoning frontier, polished computer use, zero ops.

---

### Coding Agents & SWE-bench

![Infographic of coding agents in 2026: agent score as a function of model, harness, effort and task set; a timeline from Devin at about 14 percent (Mar 2024) through SWE-bench Verified (Aug 2024), its retirement (Feb 2026) and SWE-bench Pro's retracted recommendation (Jul 2026); the Terminal-Bench 4.0 leaderboard of 28 Oct 2026 (Claude Opus 5.5 with Claude Code 64.8 percent); and the ARC-AGI-3 harness effect, 54.8 vs 99.9 percent for the same model](diagrams/land20_info_coding_agents_ai.png)

*Home: [Ch 20 §20.4](#content/20_2026_landscape)*

**Agent score = f(model, harness, effort, task set)** — a score without its harness and date is not a fact.

| When | What happened |
|---|---|
| Mar 2024 | Devin solved ~14% of (a sample of) the original SWE-bench |
| Aug 2024 | SWE-bench Verified (500 human-checked tasks); best ~33% at launch |
| Feb 2026 | **Verified retired by OpenAI** — ≥ 59% of the audited hard tasks had flawed tests, and frontier models reproduced gold patches (contamination); it pointed labs to SWE-bench Pro |
| Jul 2026 | **Pro:** OpenAI found ~30% broken tasks and retracted its recommendation (8 Jul 2026) |
| Nov 2026 | Vendors report Terminal-Bench 4.0 (66 tasks): Claude Opus 5.5 + Claude Code 64.8%; the top five sit inside one ±11-point error bar |

**Why scores rose**: (1) stronger base models, (2) test-time reasoning, (3) better harnesses (file tools, test runners, diff review, memory), (4) RL on agentic traces.

**Why to be careful**: contamination and broken tests, plus harness effects — on ARC-AGI-3 GPT-6 Astra reached 99.9% with a harness that keeps its reasoning state between steps, far above its score at the same effort in the standard harness.

**Dev-tool landscape**: Claude Code (terminal agent + apps), Codex (OpenAI: CLI, IDE, cloud), Cursor (AI-native IDE; part of SpaceX since Aug 2026), GitHub Copilot (IDE + a cloud agent that opens PRs), Google's Antigravity 2.0 / Antigravity CLI (Gemini CLI's successor for individuals), Devin and Devin Desktop (Cognition; formerly Windsurf), Kiro (AWS).

Trend: coding split into **interactive copilots** (tight feedback) and **delegated agents** (hand over a ticket, review the PR). Both keep a human in the review loop.

---

### Multimodal Generation

*Home: [Ch 20 §20.5](#content/20_2026_landscape)*

Generation products are **young and short-lived** — build behind your own interface, with stored prompts and an eval set to re-qualify a replacement:

- **Image**: hosted APIs for quality — gpt-image-2 (OpenAI, Apr 2026), Google's Nano Banana models; FLUX.2 / Stable Diffusion for self-host and LoRA customisation.
- **Video**: clips of seconds, not minutes — Gemini Omni Flash (3–10 s, up to 4K), Veo 3.1 (native audio; GA on Agent Platform, its Gemini API preview shut 22 Oct 2026). **Sora was discontinued** (app Apr 2026, API Sep 2026).
- **Voice**: one end-to-end speech-to-speech model answers in a few hundred ms (GPT-4o averaged ~320 ms in 2024) vs 2.8–5.4 s for the old STT → LLM → TTS chain — OpenAI Realtime API / GPT-Live-1, Gemini 3.8 Live, ElevenLabs.

Don't confuse generation (Veo *makes* clips) with understanding (Gemini 4 Argon *reads* video).

---

### Computer-Use Agents

*Home: [Ch 20 §20.6](#content/20_2026_landscape); how the loop works in [Ch 18 §18.6](#content/18_ai_agents)*

> An AI that drives a real computer — screenshot → reasons → mouse/keyboard actions.

**Which OSWorld?** OSWorld (2024; 369 tasks, humans ~72%, best model ~12% at launch) · OSWorld-Verified: best reported 86.1%, above the human baseline, mostly self-reported → near saturated · OSWorld 2.0 (Jun 2026; 108 long workflows, ~318 tool calls each): the best agent completed **20.6%** (54.8% partial score). Vendors often quote partial scores — not comparable with completion rates.

**Products (Nov 2026):** API tools (Anthropic, OpenAI, Gemini computer use) in your own sandboxed VM; ChatGPT agent and Gemini Agent (which absorbed Project Mariner, shut 4 May 2026) in the vendor's cloud; Claude for Chrome and Chrome's auto-browse in your own browser — the highest prompt-injection risk.

**When to use**: legacy software with no API, one-off cross-app automation, QA of flaky internal tools, back-office data entry. **When NOT**: high-QPS production, latency-sensitive UX (seconds per click), anything with a public API (use the API), high blast-radius mistakes. Errors compound (99% per step → ~74% over 30 steps), and a 30-step task costs tens of cents and a minute or two.

---

### On-Device AI & Quantisation

*Home: [Ch 20 §20.7](#content/20_2026_landscape)*

Ships on devices (Nov 2026): **Gemini Nano** via Android AICore (Nano 4 in preview), **Apple Foundation Models 3** (AFM 3 Core ≈ 3B; larger requests go to Private Cloud Compute), **Phi Silica** on Copilot+ PCs, and open Gemma 4 E2B/E4B, small Qwen 3.5 sizes, Llama 3.2 1B/3B.

**Quantisation enables this**:

```
7B model:  FP32 28 GB  →  FP16 14 GB  →  INT8 7 GB  →  INT4 3.5 GB  ← fits on a phone
```

GPTQ, AWQ, GGUF (CPU/edge via llama.cpp), Apple MLX, LiteRT-LM (Android). Well-calibrated 4-bit usually costs a small benchmark drop, but it varies by model and task — long reasoning and maths suffer first, so measure on your own eval.

**The 2026 pattern is a cascade**: a small local model (1–8B, often fine-tuned) handles the common case and escalates the hard tail to a frontier model in the cloud.

| On-device | Cloud |
|-----------|-------|
| Privacy-critical (health, finance, personal context) | Largest frontier models |
| Latency-critical (autocomplete, real-time UX) | Multi-step reasoning beyond on-device |
| Billions of queries (zero marginal cost) | Live external data |
| Offline availability | Computer use, video gen |

---

### Cost Trajectory & Long-Context Era

*Home: [Ch 20 §20.8–20.9](#content/20_2026_landscape)*

**A fixed capability gets ~10–13× cheaper per year**: a16z "LLMflation" measured ~1,000× in 3 years for GPT-3-level quality; Epoch AI (Sep 2026) ~47% per quarter ≈ 13× per year. But top-tier list prices stay high (8–10 / 40–50 USD per 1M tokens) and tokens per task keep growing — a chat feature turned into a 30-call agent costs ~165× more. Architectures formerly uneconomic (30-call agent loops, hybrid RAG + reranking, multi-agent review) are now routine.

**Context window growth**: 4K (ChatGPT, 2022) → 8K/32K (GPT-4, 2023) → 100K–200K (Claude 2/2.1, 2023) → 1M (Gemini 1.5 Pro, 2024; 2M later that year) → **10M advertised (Llama 4 Scout, 2025)** → ~1M standard on frontier APIs in 2026 ([Ch 17 §2.7](#content/17_llm)).

**Lost-in-the-middle** still exists — accuracy dips for material buried mid-prompt, and advertised length ≠ effective length (RULER). Best practice: **use both** — retrieve 20–50 chunks with hybrid search + a reranker and let a large window hold them. Prompt caching makes cached reads ~90–97.5% cheaper. Context engineering itself is in [Ch 18 §18.9](#content/18_ai_agents) (recap above).

---

### Model Selection Decision Tree

*Home: [Ch 20 §20.14–20.15](#content/20_2026_landscape)* — names are a Nov 2026 snapshot; remember the branches.

```
Start: What is the task?

  Real-time mobile autocomplete     → On-device: Gemini Nano / Apple Foundation Models / Gemma 4 E2B-E4B
  High-QPS classification           → Cheap tier (Flash-Lite / GPT-6 Luna / Haiku 5.5) or self-hosted open weights
  Complex code, multi-file changes  → Claude Opus 5.5 or GPT-6.1 Sol inside a harness (Claude Code / Codex / Cursor)
  PhD-level science reasoning       → Top tier (GPT-6 Astra / Fable 5.2 / Gemini 4 Argon), effort dial up
  Long documents (≥ 1M tokens)      → Retrieve + chunk, or a ~1M-window model (Scout's 10M is advertised — test it)
  Browser / desktop automation      → Computer-use tool in a sandboxed VM — but call a real API if one exists
  Real-time voice                   → OpenAI Realtime API / Gemini 3.8 Live / ElevenLabs
  Image generation                  → gpt-image-2 / Nano Banana / FLUX.2 (self-host)
  Video with audio                  → Veo 3.1 or Gemini Omni Flash, behind your own interface
  Privacy / sovereignty / bulk      → Self-host DeepSeek V4.1 Flash / Qwen 3.5 / gpt-oss on vLLM
  Tabular data / CTR / fraud        → Classical ML first (XGBoost); an LLM only if text is the main signal
```

**Default for prototyping**: a Flash / Sonnet / Luna-tier model with the effort dial low; raise it only where your eval shows the task is hard.

**Classical ML still wins on**:
- CTR prediction at web scale, tabular fraud → gradient-boosted trees (XGBoost / LightGBM) + feature engineering
- Recommender candidate generation → two-tower retrieval + ANN
- Time-series forecasting → Prophet, classical statsmodels, lightweight transformers
- Search ranking → LambdaMART + neural rerankers, not LLMs

The "use LLMs for everything" trap is the most common junior mistake in system design interviews: start with the simplest classical approach and add an LLM only where it earns its latency and cost.

---

### Safety, Bias & Alignment

*Home: [Ch 20 §20.11](#content/20_2026_landscape); bias in [Ch 17b §14.1](#content/17b_llm_applications), guardrails in [Ch 17b §14.4](#content/17b_llm_applications)*

**Alignment techniques**: RLHF (human rankings → reward model → PPO) · Constitutional AI (self-critique against written principles) · DPO (optimise directly on chosen/rejected pairs) · RLAIF (AI feedback at scale) · RLVR / GRPO (a program checks the answer — how reasoning models are trained) · red-teaming before every major release.

**Guardrails architecture**:
```
User input
    ↓
Input guardrail (PII, toxicity, prompt-injection / jailbreak detection, topic blocklist)
    ↓
LLM generation
    ↓
Output guardrail (hallucination check against sources, PII leakage, toxicity, format)
    ↓
User
```

Key tools: Guardrails AI, NeMo Guardrails (NVIDIA), Llama Guard 4 and Prompt Guard 2 (Meta, open), ShieldGemma (Google), managed moderation (OpenAI, Model Armor, Bedrock Guardrails, Azure AI Content Safety). Filters are **not** a security boundary against prompt injection — least privilege and approval gates are ([Ch 18b](#content/18b_agents_in_production)).

**Bias, copyright and environmental cost** are real review items — test bias with counterfactual swaps.

---

### EU AI Act & Regulation

*Home: [Ch 20 §20.11](#content/20_2026_landscape)* — dates as amended by the **AI Omnibus** (in force 27 Jul 2026):

| Date | What applies |
|------|-------------|
| Feb 2, 2025 | **Banned practices** — social scoring, untargeted face scraping, emotion recognition at work or school, most real-time remote biometric ID by police |
| Aug 2, 2025 | **GPAI providers**: technical documentation, public summary of training content, copyright policy; systemic-risk models (presumed above 10²⁵ training FLOPs) also need evaluations, incident reporting, cybersecurity |
| **Aug 2, 2026** | **General application**: transparency duties (say it's an AI, label deepfakes); the Commission can fine GPAI providers |
| Dec 2, 2026 | Marking AI-generated content for systems already on the market (postponed by the Omnibus) |
| Aug 2, 2027 | GPAI models placed on the market before 2 Aug 2025 must comply |
| **Dec 2, 2027** | **High-risk systems in Annex III** (hiring, credit scoring, education, law enforcement) — delayed |
| **Aug 2, 2028** | **High-risk AI in regulated products** (Annex I: machinery, toys, medical devices) — delayed |

Penalties: up to €35M or 7% of worldwide turnover (whichever is higher) for banned practices; GPAI breaches up to €15M or 3%.

**Elsewhere (Nov 2026)**: no general US federal AI statute (executive action: the AI Action Plan and EO 14365); California's SB 53 frontier-transparency law since 1 Jan 2026; the UK AI Security Institute tests frontier models before release; China requires CAC filing and AI-content labels (since 1 Sep 2025).

**Google's AI Principles**: the 2018 seven-point list (socially beneficial, avoid unfair bias, safety, accountable, privacy by design, scientific excellence, aligned uses) is historical; the **Feb 2025 revision** removed the explicit weapons and surveillance pledges and pursues AI where likely benefits substantially exceed foreseeable risks — cite that as current.

---

### Google's 2026 AI Stack

*Home: [Ch 20 §20.12](#content/20_2026_landscape)* — Google owns all three layers: models, platform, chips.

| Tier | Model | Use case |
|------|-------|---------|
| Top | Gemini 4 Argon — sparse MoE; text, image, audio, video in; up to 1M tokens | Hardest reasoning, coding, agents |
| Top, limited | Gemini 4 Carbon | Strongest; staged rollout to vetted cyber defenders |
| Workhorse | Gemini 3.8 Flash | High-throughput production default |
| Cheapest | Gemini 3.5 Flash-Lite | Bulk classification and extraction |
| On-device | Gemini Nano (Nano 4 in preview) | Android, through AICore |
| Real-time | Gemini 3.8 Live | Low-latency voice and video agents |
| Generation | Gemini Omni Flash and Veo 3.1 (video), Nano Banana (images), Lyria (music) | Media generation |
| Open weights | Gemma 4 | Self-hosting, on-device, fine-tuning |

Platform: **Gemini Enterprise Agent Platform** (ADK, Agent Studio, Agent Runtime + Memory Bank — see the Ch 19 recap above).

**TPU7x "Ironwood"** (GA): 4,614 FP8 TFLOPS per chip (~10× v5p); 192 GiB HBM (6× Trillium) at 7.38 TB/s; pods of 9,216 chips → 42.5 exaFLOPS FP8. TPU 8t (training) and 8i (serving) were announced in April 2026 ([Ch 16 §7.4](#content/16_deep_learning)). Anthropic announced (Oct 2025) access to up to one million TPUs and well over a gigawatt of capacity coming online in 2026.

---

### 2026 Benchmark Landscape

*Home: [Ch 20 §20.13](#content/20_2026_landscape)* — saturated, contaminated or broken; status as of Nov 2026:

| Benchmark | Status |
|-----------|--------|
| MMLU, HumanEval, GSM8K | **Saturated** (above 90% for years) — citing them is a yellow flag |
| GPQA Diamond | **Saturated** — 96.4% (Gemini 4 Argon) |
| FrontierMath T1–3 · ARC-AGI-2 | Nearly saturated — 95.1% (Claude Fable 5.2, Epoch AI, 9 Nov 2026) · 95.0% (GPT-6 Astra); FrontierMath Tier 4 is topped out too (100%) |
| **SWE-bench Verified** | **Retired** by OpenAI (Feb 2026): flawed tests, contamination |
| **SWE-bench Pro** | **Contested** — OpenAI found ~30% broken tasks and retracted its recommendation (8 Jul 2026); treat scores as rough |
| OSWorld-Verified | Nearly saturated — 86.1%, above the ~72% human baseline (mostly self-reported) |
| **Terminal-Bench 4.0** | Current — 64.8% Claude Opus 5.5 + Claude Code (66 tasks: ±11 points) |
| **OSWorld 2.0** | Current — best agent completed 20.6% of long workflows |
| **Humanity's Last Exam** | Current — 54.8% GPT-6 Astra on the Scale AI / CAIS leaderboard |
| **ARC-AGI-3** | Current — the score depends on the harness |
| **Arena (text)** | Current — measures preference, not correctness; Gemini 4 Carbon 1526, Gemini 4 Argon 1522 — a statistical tie (9 Nov 2026) |

**How to read any score**: which version and split · which harness and effort · who ran it · how many tasks (95% interval ≈ ±1.96·√(p(1−p)/n)) · is it still clean · when.

---

### Common Interview Pitfalls

*Home: [Ch 20 §20.16](#content/20_2026_landscape)*

1. Defaulting to high reasoning effort for everything — 10–50× the cost on simple tasks, with no quality gain.
2. Citing saturated or retired benchmarks (MMLU, HumanEval, GPQA Diamond, SWE-bench Verified) — cite a current one with version, harness, source and date.
3. Memorising exact leaderboard numbers (they drift monthly) — memorise the shape instead.
4. Treating long context as a substitute for retrieval — lost-in-the-middle is real.
5. Quoting the old EU AI Act dates — "high-risk from August 2026" is now wrong (Dec 2027 / Aug 2028).
6. Computer-use for high-QPS production — slow and fragile; APIs always win where they exist.
7. Skipping classical ML — boosted trees on tabular data at a tiny fraction of the cost.
8. Ignoring open weights at scale — DeepSeek, Qwen, gpt-oss or Mistral are only months behind.
9. Confusing video generation (Veo, Gemini Omni Flash) with video understanding (Gemini 4 Argon).
10. Building on one product with no fallback — Sora, Project Mariner and Veo's Gemini API preview were all shut down.

> ✅ **Must-remember**
>
> - No single model wins everything — three tiers per lab, ~1M context, an effort dial everywhere; pick by task fit, price and your own eval.
> - **Test-time compute** is a dial: thinking tokens bill as output, so turn it up only where a wrong answer is expensive.
> - **Coding agents = model × harness × effort.** SWE-bench Verified was retired (Feb 2026) and SWE-bench Pro is contested — quote any score with version, harness and date.
> - **EU AI Act**: GPAI duties since 2 Aug 2025, general application 2 Aug 2026, high-risk moved to 2 Dec 2027 / 2 Aug 2028; fines up to €35M or 7% of turnover.
> - **Google's stack**: Gemini 4 + Gemini Enterprise Agent Platform + TPU7x Ironwood (42.5 exaFLOPS pod).

---

## One-page cheat recap

| Chapter | Single most important fact/formula |
|---------|-----------------------------------|
| **Ch 16 — Deep Learning** | $\text{Attention}(Q,K,V) = \text{softmax}(QK^T/\sqrt{d_k})V$; **AdamW** = correct optimizer for Transformers (uncorrected early Adam steps are too large); **ResNet skip** solved deep training; init keeps variance constant (He $2/\text{fan}_{in}$, Xavier $2/(\text{fan}_{in}+\text{fan}_{out})$); **RMSNorm + RoPE + SwiGLU** in modern LLMs; mixed-precision AdamW = 16 B/param, accumulation / checkpointing (+33% compute) / EMA; depthwise-separable conv ≈ $1/C_\text{out}+1/K^2$; FGSM = $x+\varepsilon\,\text{sign}(\nabla_xL)$; **flow matching** (SD3, FLUX) = straighter paths; **MoE**: compute ≈ active params, memory = all params. |
| **Ch 17 — LLMs** | **Chinchilla rule**: training tokens ≈ 20× params (but served-a-lot models over-train); **KV cache** grows *linearly* with context, **FlashAttention** is exact with $O(N)$ extra memory and unchanged FLOPs; data pipeline = filter → MinHash dedup → decontaminate → mix → anneal; DPO replaces 3-stage RLHF with one direct preference loss, GRPO/RLVR power reasoning models; ICL changes behaviour not weights, "emergence" is partly the $p^k$ metric; CoT is evidence, not proof (hint admitted ≈ 25–39%); INT4 shrinks 70B to ≈ 35 GB (one 48–80 GB GPU, not 24 GB) with ~1–3% quality loss. |
| **Ch 17b — Using LLMs** | System prompts are guidance, **not a security boundary**; reasoning models need no "think step by step" — give goal, context and success criteria, then raise the effort setting. Prompt for behaviour you can describe, **RAG** for knowledge that changes, **fine-tune** for behaviour you can only demonstrate. LoRA trains r·(d + k) numbers per matrix (0.78% at d = k = 4,096, r = 16) and merges back with no extra latency; QLoRA = 4-bit NF4 base. Chunk 256–512 tokens with 50–100 overlap; structured output beats "please reply in JSON". |
| **Ch 17c — LLM Systems** | **Prefill** is compute-bound (sets TTFT), **decode** is bandwidth-bound (sets TPOT): one stream ≈ per-GPU bandwidth ÷ weight bytes per GPU (70B FP16 on 2×H100 ≈ 48 tok/s). KV bytes = 2 × layers × KV-heads × head-dim × tokens × bytes (320 KiB/token → 40 GiB at 128K for Llama-3-70B). Continuous batching + PagedAttention are the big throughput wins; weight-only quantization helps decode, FP8 helps both; speculative decoding is lossless (α = 0.8, k = 4 → 3.36 tokens per pass). Sell **goodput**, not throughput; judge both orders; self-hosting beats frontier API prices only above ~2B tokens/month. |
| **Ch 18 / 18b — AI Agents** | An agent = LLM + tools + loop + state; reliability compounds (0.95¹⁰ ≈ 60%). **MCP** = N+M (not N×M) integrations via Tools/Resources/Prompts, stateless since spec 2026-07-28. **A2A** = agent-to-agent delegation. Critical security rule: the LLM never executes tools directly — your code does. In production, injection is contained, not filtered (least privilege, approval gates, egress allowlist), and you report **pass^k** (0.9⁸ ≈ 43%), not just pass@1. |
| **Ch 19 — Frameworks** | **vLLM** (PagedAttention + continuous batching; ~2–4× throughput in the vLLM paper) is the default inference server; **TGI** is archived (Mar 2026). Hybrid search (fused with RRF) beats pure vector; reranking is often the #1 RAG quality lever; prompt caching and routing are the top cost levers (caching pays above a ~22% hit rate). LangGraph for production agents; LlamaIndex for data-heavy RAG; AutoGen → Microsoft Agent Framework; Vertex AI → Gemini Enterprise Agent Platform. |
| **Ch 20 — 2026 Landscape** | No single model wins everything: three tiers per lab, ~1M context, open weights ~4 months behind → model choice is price/latency/ecosystem and your own eval. **Test-time compute** is a dial billed as output tokens — turn it up for hard tasks only. **EU AI Act**: GPAI duties since 2 Aug 2025, general application 2 Aug 2026, high-risk moved to Dec 2027 / Aug 2028. **SWE-bench Verified** retired (Feb 2026), **Pro** contested (Jul 2026) — quote any score with version, harness and date. |

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
