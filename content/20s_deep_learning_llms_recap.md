# Deep Learning & LLMs — Quick Revision

> **Purpose:** This is a fast revision recap of Chapters 16–20 (Deep Learning, Large Language Models, AI Agents, AI Frameworks, and the 2026 AI Landscape). Skim it the night before an interview instead of re-reading the full chapters. Full explanations, worked examples, and diagrams live in the source chapters — treat this as your flashcard deck, not a replacement.

---

## Contents

- [Ch 16 — Deep Learning: Complete Reference](#ch-16--deep-learning-complete-reference)
- [Ch 17 — Large Language Models](#ch-17--large-language-models)
- [Ch 18 — AI Agents & Tool Use](#ch-18--ai-agents--tool-use)
- [Ch 19 — AI Frameworks & Engineering](#ch-19--ai-frameworks--engineering)
- [Ch 20 — The 2026 AI Landscape](#ch-20--the-2026-ai-landscape)
- [One-page cheat recap](#one-page-cheat-recap)

---

## Ch 16 — Deep Learning: Complete Reference

> 💡 **In a sentence —** Deep learning is a toolbox of neural-network architectures and training recipes — backprop + gradient descent + normalization — that share a common structure but differ by what data they process and what structure they exploit.

---

### Part 1: Training Deep Networks

#### Backpropagation

Backprop answers: *"If I change weight W by a tiny amount, how does the total loss change?"*  
It uses the **chain rule** of calculus, multiplying local gradients from the output layer back to the input layer in a single reverse pass.

Key insight: gradients are cheap to reuse from the forward pass. Dead ReLU problem: if a neuron's pre-activation is negative, ReLU outputs 0, the gradient is 0, and the weight never updates.

#### Optimizers

| Optimizer | Adapts per weight? | Uses momentum? | Best for |
|-----------|-------------------|----------------|---------|
| SGD | No | No | Simple problems |
| SGD+Momentum | No | Yes | CNNs (often beats Adam) |
| AdaGrad | Yes | No | Sparse data, short training |
| RMSProp | Yes (decaying avg) | No | RNNs |
| Adam | Yes | Yes | General deep learning |
| AdamW | Yes | Yes | **Transformers, LLMs (standard)** |

**Adam** update ($\beta_1=0.9$, $\beta_2=0.999$, $\alpha=0.001$):

$$m \leftarrow 0.9m + 0.1\nabla w, \quad v \leftarrow 0.999v + 0.001(\nabla w)^2$$

$$w \leftarrow w - 0.001 \cdot \frac{\hat{m}}{\sqrt{\hat{v}} + 10^{-8}}$$

Bias correction: $\hat{m} = m/(1-0.9^t)$, $\hat{v} = v/(1-0.999^t)$.

**AdamW** separates weight decay: $w \leftarrow w - \alpha \frac{\hat{m}}{\sqrt{\hat{v}}+\epsilon} - \alpha\lambda w$. This is correct regularisation for Transformers; plain Adam+L2 underdoes regularisation on frequently-updated weights.

#### Loss Functions

- **MSE** — regression, sensitive to outliers. **MAE** — robust. **Huber** — smooth small, robust large.
- **Binary cross-entropy**: $L = -[y\log\hat{y} + (1-y)\log(1-\hat{y})]$
- **Categorical cross-entropy**: $L = -\sum_i y_i \log\hat{y}_i$ (one-hot $y_i$)
- **Focal Loss** (imbalanced): $FL = -(1-p_t)^\gamma \log(p_t)$. With $\gamma=2$, easy examples contribute $<0.003\times$ weight. Used in object detection (RetinaNet).
- **Triplet Loss** (similarity): $L = \max(0, d(A,P) - d(A,N) + \text{margin})$. Used in face recognition.
- **NT-Xent** (contrastive, SimCLR): pull positive pairs together, push all negatives apart.

#### Normalisation

| Method | Normalises over | Use when |
|--------|----------------|---------|
| Batch Norm | across samples per feature | CNNs, large batches |
| Layer Norm | across features per sample | Transformers, RNNs |
| Group Norm | groups of channels per sample | Small-batch vision |
| RMS Norm | root-mean-square (no mean sub) | LLaMA, modern LLMs |

LayerNorm formula: $\text{LN}(x) = \gamma \cdot \frac{x-\mu}{\sqrt{\sigma^2+\epsilon}} + \beta$. Pre-LN (normalise before attention/FFN) is now standard in GPT-2+, LLaMA.

#### Gradient Clipping & Mixed Precision

**Gradient clipping (norm clipping):** if $\|g\| > 1.0$, scale $g \leftarrow g \times 1.0/\|g\|$. Preserves direction; prevents exploding gradients. PyTorch: `clip_grad_norm_(params, 1.0)`. Standard for Transformers and RNNs.

**Mixed precision (BF16):** Forward/backward in 16-bit; weight updates in 32-bit. BF16 has the same exponent range as FP32, eliminating overflow. Training is 2–4× faster, uses half the memory. Standard for all modern LLM training.

#### Regularisation

**Dropout**: randomly zero out a fraction $p$ of neuron activations during training; at test time, scale activations by $1-p$ (or equivalently scale during training and don't change at test). Acts like ensembling many sub-networks. Typical: $p=0.1$–$0.5$; use lower values closer to the output or in attention blocks.

**L2 / weight decay**: adds $\frac{\lambda}{2}\|W\|^2$ to the loss, pulling weights toward zero. Effective penalty: $w \leftarrow (1-\alpha\lambda)w - \alpha\nabla L$. With Adam, L2 does *not* equal weight decay due to the adaptive scaling — AdamW fixes this with decoupled decay (see Optimizers section). Typical $\lambda = 10^{-4}$–$10^{-2}$.

**Early stopping**: monitor validation loss; stop training when it plateaus or starts rising (save the checkpoint from the minimum). Prevents overfitting without changing the objective. The simplest and most reliable regulariser.

**Label smoothing**: replace one-hot targets with $(1-\epsilon)\cdot \mathbf{1}_y + \epsilon/C$. Prevents the model from driving logits to $\pm\infty$ trying to achieve 100% probability on training labels. Improves calibration; $\epsilon=0.1$ is a common default.

**Batch size interaction**: large batches have sharp loss landscapes (can generalise poorly) even if they converge faster. Fix: scale LR linearly with batch size (linear scaling rule) and warm up for 5–10% of training steps.

#### Learning Rate Schedules

The LR schedule matters as much as the optimiser:

| Schedule | Shape | Use when |
|----------|-------|---------|
| Constant | flat | Quick experiments only |
| Step decay | drops every N epochs | CNNs on ImageNet |
| Cosine annealing | smooth cosine curve | **Standard for LLMs** |
| Linear warmup + decay | ramp up, then fall | All large-model training |
| OneCycleLR | one big spike | Fast convergence on smaller models |

LLMs use: linear warmup for 1–2% of steps (prevents large early updates when gradients are noisy), then cosine decay to near-zero. Why warmup? Early steps have high gradient variance; a high LR at step 0 can permanently damage the initialisation.

---

### Part 2: Computer Vision

#### CNN Architecture Evolution

```
LeNet (1998) ──► AlexNet (2012) ──► VGG (2014) ──► ResNet (2015) ──► EfficientNet (2019) ──► ViT (2020)
5 layers        8 layers           16-19 layers    18-152 layers    Compound scale      Patch-based
(MNIST)         (ImageNet rev)      (3×3 only)      (skip conn.)     (balanced 3D)       Transformer
```

**ResNet skip connections** (★★★): Each block learns the *residual* $F(x)$, and the output is $F(x) + x$. Solves vanishing gradients — gradient can flow unchanged through the shortcut. Enabled 152-layer networks.

**EfficientNet compound scaling**: depth $\propto 1.2^\phi$, width $\propto 1.1^\phi$, resolution $\propto 1.15^\phi$. Balanced scaling — achieved state-of-the-art with 8× fewer parameters.

**ViT (Vision Transformer)**: Chop $224\times224$ into $16\times16$ patches → 196 tokens → standard Transformer. Each patch attends to all others from layer 1. Needs large pre-training data ($>100M$ images); CNNs are more data-efficient.

#### Object Detection & Segmentation

**YOLO**: divides image into $7\times7$ grid; each cell predicts bounding boxes + classes in ONE forward pass. Non-Maximum Suppression (NMS) removes overlapping boxes. IOU = Area(Overlap)/Area(Union) > 0.5 → same object.

**U-Net**: Encoder shrinks (learns *what*), decoder expands (predicts per pixel), skip connections bridge them (give the decoder fine-grained spatial info). Designed for medical images; used for satellite, road segmentation, etc.

---

### Part 3: Attention & Transformers

#### LSTM & GRU

Plain RNNs vanish: gradient through $T$ Jacobians of $W_h$ exponentially decays if dominant eigenvalue $< 1$.

**LSTM** has a *cell state* $C_t$ — the gradient highway:
$$C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t, \quad f_t = \sigma(W_f[h_{t-1}, x_t])$$
When $f_t \approx 1$ the gradient flows with near-unit multiplication. All 4 LSTM equations:

$$f_t = \sigma(W_f[h_{t-1},x_t]+b_f), \quad i_t = \sigma(W_i[h_{t-1},x_t]+b_i)$$
$$\tilde{C}_t = \tanh(W_C[h_{t-1},x_t]+b_C), \quad C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t$$
$$o_t = \sigma(W_o[h_{t-1},x_t]+b_o), \quad h_t = o_t \odot \tanh(C_t)$$

**GRU** merges forget+input into one update gate $z_t$, plus a reset gate $r_t$ to partially forget past hidden state. No separate cell state — 33% fewer parameters than LSTM. When reset gate ≈ 0, the GRU ignores prior hidden state (fresh start). When update gate ≈ 1, prior state passes through unchanged (long memory).

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

Each token creates Q (what am I looking for?), K (what do I offer?), V (what do I give?). $\sqrt{d_k}$ prevents large dot products from saturating softmax. Complexity $O(n^2)$ in sequence length.

**Multi-Head Attention**:
$$\text{MultiHead}(Q,K,V) = \text{Concat}(\text{head}_1,\ldots,\text{head}_h)W^O, \quad \text{head}_i = \text{Attention}(QW^Q_i,KW^K_i,VW^V_i)$$
$W^O$ mixes information from all heads. Typical: 8 heads (BERT-base), 96 heads (GPT-3).

**GQA/MQA**: Standard MHA caches one K,V set per head. **Multi-Query Attention (MQA)**: all heads share one K,V — 32× less KV cache memory. **Grouped-Query Attention (GQA)**: groups of heads share K,V — sweet spot (LLaMA 2 70B, LLaMA 3, Mistral).

#### Positional Encodings (★★★)

| Method | Used By | Relative Pos? | Extrapolates? |
|--------|---------|--------------|--------------|
| Sinusoidal | Original Transformer | Partially | Yes (fixed) |
| Learned | BERT, GPT-2 | No | No (truncates) |
| **RoPE** | **LLaMA, Gemini, Mistral** | **Yes** | **Good** |
| ALiBi | BLOOM, MPT | Yes | Excellent |

**RoPE**: rotates Q and K by a position-dependent angle before $QK^T$. The dot product depends only on relative distance $m-n$, not absolute position. Dominant in 2024–2026 LLMs.

**Sinusoidal**: $PE(\text{pos}, 2i) = \sin(\text{pos}/10000^{2i/d})$; $PE(\text{pos}, 2i+1) = \cos(...)$.

#### BERT vs GPT

| | BERT | GPT |
|--|------|-----|
| Architecture | Encoder-only | Decoder-only |
| Attention | **Bidirectional** (sees all tokens) | **Causal** (sees past only) |
| Pre-training | MLM (fill-in-the-blank) + NSP | Next-token prediction |
| Best for | Understanding, classification, NER, Q&A | Generation, chat, code |
| Examples | BERT-base (110M), RoBERTa, DeBERTa | GPT-3/4, LLaMA, Claude, Mistral |

BERT-base: 12 layers, 12 heads, 768 hidden dim, 110M params. BERT-large: 24 layers, 16 heads, 1024 hidden dim, 340M params.

The full Transformer block: Input → Self-Attention → Add&Norm → FFN → Add&Norm → Output. FFN stores ~2/3 of parameters and factual knowledge. Attention handles token relationships.

#### Transformer Depth by the Numbers

| Model | Layers | Heads | Hidden | Params |
|-------|--------|-------|--------|--------|
| BERT-base | 12 | 12 | 768 | 110M |
| GPT-2 large | 36 | 20 | 1280 | 774M |
| GPT-3 | 96 | 96 | 12288 | 175B |
| LLaMA 3 8B | 32 | 32 | 4096 | 8B |
| LLaMA 3 70B | 80 | 64 | 8192 | 70B |

Context window determines maximum sequence length: 4K (GPT-3) → 8K (LLaMA 2) → 128K (GPT-4 Turbo) → 200K (Claude 3) → 1M (Gemini 1.5) → 10M (Llama 4 Scout). Window is in *tokens*, not words.

---

### Part 4: Fine-Tuning & Alignment

**LoRA (★★★)**: Freeze $W_0$; learn low-rank update $\Delta W = BA$ where $B \in \mathbb{R}^{d \times r}$, $A \in \mathbb{R}^{r \times d}$, $r \ll d$. For $d=4096$, $r=8$: 65K trainable params vs 16.7M — 256× fewer. At inference, merge: $W_\text{eff} = W_0 + BA$. Zero extra latency. Applied to Q,V (and optionally K, FFN). QLoRA loads base model in 4-bit + trains LoRA adapters: fine-tune a 7B model on a single 24GB GPU.

**RLHF (★★★)**:
1. SFT: fine-tune on ~10K high-quality (prompt, response) pairs.
2. Reward Model: train on human rankings; objective: push $s_\text{win} - s_\text{lose}$ apart via $L = -\log\sigma(s_\text{win}-s_\text{lose})$.
3. PPO + KL constraint: $R_\text{total} = R_\text{RM} - \beta D_{KL}(\pi \| \pi_\text{SFT})$. KL term prevents reward hacking while keeping the model grounded.

**DPO (★★★)**: Skips the reward model. Directly fine-tunes LLM on (prompt, chosen, rejected) triples with a single loss that increases P(chosen) and decreases P(rejected), with implicit KL regularisation. Simpler, more stable, comparable quality. Used by LLaMA 3, Zephyr.

#### Full Fine-Tuning Landscape

| Method | Trainable Params | VRAM (7B) | Use case |
|--------|-----------------|-----------|---------|
| Full fine-tuning | 100% | 80–160 GB | When you have multi-GPU and large high-quality dataset |
| LoRA (r=16) | ~0.1–0.5% | 16–24 GB | **Standard choice for most tasks** |
| QLoRA (4-bit + LoRA) | ~0.1–0.5% | **8–12 GB** | Single consumer GPU (RTX 4090) |
| Prompt tuning | <0.01% | Base model VRAM | Very quick adapt, lower quality |
| Prefix tuning | ~0.1% | Base model VRAM | Between prompt and LoRA |
| Adapter layers | ~1% | Close to LoRA | Legacy; LoRA preferred |

**LoRA hyperparams that matter**: rank $r$ (try 8, 16, 32 — higher rank = more expressiveness but more params), alpha $\alpha$ (scale = $\alpha/r$, usually set $\alpha = 2r$), target modules (q_proj, v_proj at minimum; add k_proj, o_proj, gate_proj, up_proj, down_proj for more capacity). Too low a rank underfits domain-specific tasks; too high approaches full fine-tuning cost.

---

### Part 5: Generative Models

**VAE**: Encoder outputs $\mu, \sigma$ (a distribution, not a point). Reparameterisation trick: $z = \mu + \sigma \cdot \epsilon$, $\epsilon \sim \mathcal{N}(0,1)$ — makes sampling differentiable. Loss = reconstruction + $D_{KL}(q(z|x) \| p(z))$. Organised latent space enables smooth interpolation.

**Diffusion**: Fixed forward process adds noise 1000 steps ($x_t = \sqrt{\bar\alpha_t} x_0 + \sqrt{1-\bar\alpha_t}\epsilon$). UNet trained to predict the added noise $\hat\epsilon$ given $x_t$ and step $t$. At generation: start from pure noise, run 1000 reverse denoising steps. Text conditioning via cross-attention. Dominant for image gen (Stable Diffusion, DALL-E). Stable training; strong mode coverage.

**GAN**: $\min_G \max_D \mathbb{E}[\log D(x)] + \mathbb{E}[\log(1-D(G(z)))]$. Mode collapse: generator finds one or few outputs that fool D. WGAN replaces JS divergence with Wasserstein (Earth Mover's) distance — smooth gradients even when distributions don't overlap. WGAN-GP adds gradient penalty for Lipschitz constraint.

| Aspect | GAN | Diffusion |
|--------|-----|-----------|
| Speed | Single forward pass (fast) | 50–1000 steps (slow) |
| Stability | Notoriously unstable | Stable |
| Mode coverage | Drops modes | Strong |
| Dominance | Largely replaced for images | Dominant (2022–present) |

**CLIP** (contrastive): trains image + text encoder jointly on 400M pairs; matching pairs have high cosine similarity. Enables zero-shot classification: embed image, compare to text prompts "a photo of a cat", pick highest similarity.

**MoE**: Replace FFN with E experts + router. Route top-K experts per token. Mixtral 8x7B: 47B total / 13B active — quality of 47B, cost of 13B. Routing challenge: load-balancing loss prevents all tokens routing to same experts.

**GNN**: Message passing — each node aggregates neighbour features, applies a small neural net to update. After K rounds, nodes know their K-hop neighbourhood. Used in: drug discovery, social networks, Google Maps ETAs, AlphaFold.

---

### Practical Debugging (quick checklist)

1. Overfit one batch first — loss should approach 0.
2. Check initial loss = $-\log(1/\text{num\_classes})$ (random baseline).
3. Monitor per-layer gradient norms; zeros = dead layer, NaN = exploding.
4. Always call `model.eval()` before testing (disables dropout, BatchNorm uses running stats).
5. Check train vs val curves: val loss going back up = overfitting; both stuck high = underfitting.

**Architecture quick-reference:**

| Data type | Go-to architecture |
|-----------|--------------------|
| Images | ResNet (standard), ViT (large dataset) |
| Object detection | YOLO |
| Segmentation | U-Net |
| Text understanding | BERT family |
| Text generation | GPT/LLaMA family |
| Sequences (streaming) | LSTM/GRU |
| Graphs | GNN |
| Tabular | XGBoost first |
| Image generation | Diffusion |
| Self-supervised image | SimCLR / CLIP |

> ✅ **Must-remember**
>
> - **Backprop** = chain rule, one backward pass computes ALL gradients.
> - **AdamW** = correct optimizer for Transformers; separates weight decay from gradient update.
> - **ResNet skip connections** solved very deep training; **LoRA** does PEFT with <1% trainable params.
> - **RLHF**: SFT → Reward Model → PPO+KL; **DPO** is the simpler alternative.
> - **Diffusion** is dominant for image generation; **GANs** risk mode collapse.
> - **Focal Loss** for class imbalance; **Triplet Loss** for similarity learning.
> - **Activation functions**: ReLU is default for CNNs; **GeLU/SiLU** for Transformers/LLMs (smooth gradient prevents dead units); Sigmoid only for binary output gates; Softmax at output layer for classification.
> - **Vanishing gradient** flow in order of vulnerability: plain RNN (worst) < LSTM/GRU < ResNet < pre-LN Transformer (best).
> - **Weight initialization matters**: He init for ReLU layers ($\sigma = \sqrt{2/n}$); Xavier/Glorot for tanh/sigmoid layers ($\sigma = \sqrt{1/n}$); using the wrong init can cause training to diverge in the first few steps.

---

## Ch 17 — Large Language Models

> 💡 **In a sentence —** An LLM is a massive decoder-only Transformer that learns to predict the next token from a trillion-token corpus, producing emergent capabilities (reasoning, code, translation) from a single objective.

---

### The Core Idea

Every token an LLM generates is a conditional probability:

$$P(\text{next word} | \text{all previous words})$$

The full sentence probability is the chain rule product:

$$P(w_1,\ldots,w_n) = P(w_1)\cdot P(w_2|w_1)\cdots P(w_n|w_1,\ldots,w_{n-1})$$

Multiplying probabilities makes them tiny; log-probs convert to manageable sums. Training objective (cross-entropy): $\mathcal{L} = -\frac{1}{N}\sum_i \log P(x_i|\text{context}_i,\theta)$.

---

### Tokenization & BPE (★★)

LLMs work on **subword tokens**, not characters or words.

**BPE (Byte Pair Encoding)** — used by GPT: start with individual characters; repeatedly merge the most-frequent pair until vocab reaches target size (32K–50K). Common words → single token; rare words → subword pieces; unknown words → characters. Never "unknown word" errors.

**WordPiece** (BERT): likelihood-based merge. **SentencePiece** (LLaMA, T5): language-agnostic, handles raw bytes.

1 token ≈ 0.75 English words. Context window in tokens = hard limit; going over silently truncates or errors.

Special tokens: `[BOS]`, `[EOS]`, `[PAD]`, `[MASK]`, `<|system|>`, `<|user|>`, `<|assistant|>`, `<|end_of_turn|>`.

---

### Transformer Internals (★★★)

Full pipeline for a prompt:

```
Text ──► Tokenise ──► Embed ──► N × Transformer Blocks ──► Head ──► Token probabilities
```

**Embedding**: each token ID → learned vector of size $d_\text{model}$ (768 to 12,288 depending on model).

**Transformer block**:
```
Input
  ↓ Self-Attention (with positional encoding)
  ↓ Add & Norm (LayerNorm, pre-LN is standard)
  ↓ FFN (expand 4× → GeLU/SiLU → compress)
  ↓ Add & Norm
Output
```

**Attention formula**: $\text{Attention}(Q,K,V) = \text{softmax}(QK^T/\sqrt{d_k})V$

**Softmax**: converts raw logits to probabilities summing to 1; larger inputs get disproportionately more weight.

**FFN**: stores factual knowledge. Attention handles relationships. FFN ≈ 2/3 of total parameters.

**Causal mask** (GPT-style): lower-triangular — token $i$ only attends to positions $\leq i$.

**GQA/MQA**: GQA (used by LLaMA 3, Mistral) groups heads to share K,V, reducing KV cache 4–32× with minimal quality loss.

**Modern LLM defaults**: Pre-LN, RMSNorm (simpler than LayerNorm), RoPE positional encoding, GQA, GeLU/SiLU activation, AdamW + cosine LR schedule with warmup.

#### Context Window and Memory

**Context window** = maximum total tokens (prompt + completion). LLM holds this in the KV cache; nothing persists across sessions unless you explicitly manage memory. Common sizes: 4K (GPT-3) → 128K (GPT-4 Turbo) → 200K (Claude 3.5 Sonnet) → 1M (Gemini 1.5/Claude 4) → 10M (Llama 4 Scout).

Large contexts are not free: **lost-in-the-middle** effect — LLMs attend well to the beginning and end of a long context, but poorly to the middle. Critical information buried in position 50K of a 200K context may be effectively ignored. Practical fix: put the most important instructions at the start and end; use retrieval to bring relevant chunks to the surface.

**KL divergence** (foundational formula used throughout LLM training):

$$D_{KL}(P \| Q) = \sum_x P(x) \log \frac{P(x)}{Q(x)}$$

KL is always ≥ 0. Used to measure how much a policy drifts from its SFT baseline during RLHF/PPO, and as the regulariser in DPO. Not symmetric: $D_{KL}(P\|Q) \neq D_{KL}(Q\|P)$.

---

### Decoding Strategies

**Greedy**: always pick $\arg\max$. Deterministic, can loop ("the the the…").

**Beam search (width B)**: keep top-B sequences; better for translation/summarisation.

**Top-K sampling**: sample from top-K tokens only; renormalise. K=50 is a common default.

**Top-P (nucleus) sampling**: include the smallest set of tokens whose cumulative probability ≥ P (typically 0.9). Adapts to model confidence — narrow when confident, wide when uncertain.

**Temperature** rescales logits before softmax: $p_i \propto e^{z_i/T}$.

| Temperature | Effect |
|-------------|--------|
| 0 | Deterministic (greedy) |
| 0.7 | Natural, varied — good default |
| 1.0 | Sample directly from distribution |
| 2.0 | Wild, often incoherent |

Temperature=0 for code/factual Q&A. Temperature=0.7–1.0 for creative tasks.

**Autoregressive loop**: one token per forward pass; KV cache stores past keys/values so each step is $O(1)$ not $O(N)$.

---

### LLM Training Pipeline (★★★)

**Stage 1 — Pre-training**: next-token prediction on $\sim$1–15T tokens (Common Crawl ~60%, books, code, Wikipedia, papers). GPT-3 trained on 300B tokens with 175B parameters over ~$4.6M in compute.

**Pre-training data composition matters enormously** (Llama 3 data recipe):

```
Source          | Share  | Why
----------------|--------|------------------------------------
Web (Common Crawl filtered) | ~60% | Scale, diversity
Code (GitHub)   | ~15%   | Reasoning, logic, structured text
Books           | ~10%   | Long-form coherence
Wikipedia       | ~5%    | Factual, high-quality
Scientific papers | ~5%  | Technical depth
Conversations   | ~5%    | Instruction following
```

Data quality > data quantity past a certain scale. Heavy deduplication and quality filtering (perplexity-based, fastText classifier) commonly 3–10× reduces raw crawl size while improving model quality.

**Stage 2 — SFT (Supervised Fine-Tuning)**: fine-tune on ~10K–100K curated (prompt, ideal-response) pairs. Teaches the model *how* to be an assistant, not just to continue text.

**Stage 3a — RLHF**: human raters rank 4–9 responses per prompt → train a reward model → PPO fine-tuning with KL constraint:
$$R_\text{total} = R_\text{RM} - \beta D_{KL}(\pi \| \pi_\text{SFT})$$

**Stage 3b — DPO (alternative)**: directly optimise on (prompt, chosen, rejected) pairs; no reward model needed; simpler and more stable; used by LLaMA 3, Zephyr.

**Constitutional AI (Anthropic)**: model self-critiques against written principles without per-example human labels.

---

### Scaling Laws (★★★)

**Kaplan et al. (2020)**: loss scales as a power law in parameters $N$, data $D$, and compute $C$:
$$\mathcal{L} \propto N^{-\alpha}, \quad \mathcal{L} \propto D^{-\beta}, \quad \mathcal{L} \propto C^{-\gamma}$$
This justified the push to ever-larger models.

**Chinchilla (Hoffmann et al., 2022)**: for a fixed compute budget, optimal training balances model size and data. Rule of thumb:

> **Training tokens ≈ 20 × parameters**

LLaMA (13B, 1.4T tokens) outperformed GPT-3 (175B, 300B tokens). Data quality and quantity matter as much as scale.

**Emergent abilities**: chain-of-thought reasoning appears around 60B parameters; few-shot in-context learning at 100B+. These are not smooth improvements — they appear suddenly at thresholds.

---

### LLM Families

| Family | Architecture | Best for |
|--------|-------------|---------|
| GPT (OpenAI) | Decoder-only | Generation, chat, code, reasoning (o-series) |
| BERT (Google) | Encoder-only, bidirectional | Classification, NER, search, Q&A |
| LLaMA 4 (Meta) | Decoder-only, MoE, multimodal | Open-weight, long context (Scout: 10M) |
| Claude 4 (Anthropic) | Decoder-only | Coding, tool use, extended thinking, computer use |
| Gemini 3.x (Google) | Native multimodal | Multimodal, long context (2M), Google ecosystem |
| T5/BART | Encoder-decoder | Translation, summarisation, seq2seq |

**Why decoder-only won**: simpler scaling, natural few-shot (examples are input), one architecture for both understanding and generation, better compute efficiency per parameter.

**MoE in modern LLMs**: LLaMA 4 Scout = 109B total/17B active (16 experts); DeepSeek R1 = 671B total/37B active (256 experts). Same inference cost as a small dense model, quality of a large one. Challenge: load balancing across experts.

#### LLM Key Papers Timeline

| Year | Paper | Impact |
|------|-------|--------|
| 2017 | *Attention Is All You Need* (Vaswani et al.) | Transformer architecture born |
| 2018 | *BERT* (Devlin et al.) | Bidirectional pre-training, fine-tune once |
| 2018 | *GPT-1* (Radford et al.) | Generative pre-training demonstrated |
| 2020 | *Scaling Laws* (Kaplan et al.) | Power-law loss vs N, D, C |
| 2020 | *GPT-3* (Brown et al.) | In-context learning emergent at scale |
| 2022 | *Chinchilla* (Hoffmann et al.) | Training tokens ≈ 20 × params |
| 2022 | *InstructGPT* (Ouyang et al.) | RLHF for alignment, birth of ChatGPT approach |
| 2022 | *Flash Attention* (Dao et al.) | Tiled attention, O(N) memory |
| 2023 | *LLaMA / LLaMA 2* (Meta) | Open-weight competitive models |
| 2023 | *LoRA* wide adoption | PEFT standard for fine-tuning |
| 2024 | *LLaMA 3.1/3.3* (Meta) | 405B dense SOTA open-weight |
| 2025 | *DeepSeek-R1* | RL-trained reasoning, 671B MoE |
| 2025 | *Llama 4 Scout* | 10M context, sparse MoE open-weight |

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

**Chain-of-Thought subtlety**: CoT works by pushing the model to allocate tokens to intermediate reasoning before committing to the answer. The intermediate tokens don't need to be "correct" thinking — they activate better output distributions. For factual claims, still verify with RAG.

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
| **Perplexity** | $2^{H(\text{cross-entropy})}$ — model surprise at test text | Lower = better; doesn't directly measure usefulness |
| BLEU | N-gram precision vs reference (translation) | Misses semantic equivalence |
| ROUGE-L | Longest common subsequence recall (summarisation) | ROUGE-1 = unigram, ROUGE-2 = bigram |
| MMLU | 57-subject academic knowledge (multiple choice) | **Saturated** ≥90% on frontier models |
| HumanEval | Python function generation | **Saturated** ≥95% |
| SWE-bench Verified | Real GitHub bug fixes | **Active** — frontier ~88% (May 2026) |
| GPQA Diamond | Graduate-level science | Active — frontier ~94% |
| Chatbot Arena | Human ELO preference | Best real-world signal |

---

### Inference Optimisation (★★)

**Quantisation**: reduce weight precision from FP32/FP16 to INT8 or INT4.

| Precision | Memory (70B model) |
|-----------|-------------------|
| FP32 | 280 GB |
| FP16/BF16 | 140 GB |
| INT8 | 70 GB |
| **INT4** | **35 GB** (fits on consumer GPU) |

FP16→INT8: <1% quality loss. FP16→INT4: 1–3% loss. Methods: GPTQ (GPU inference), AWQ (activation-aware, better quality), GGUF (CPU/edge, used by llama.cpp).

**KV Cache**: cache Key and Value tensors from prior tokens — reduces generation from $O(N^2)$ to $O(N)$ computation. Memory cost: $2 \times n_\text{layers} \times n_\text{heads} \times d_\text{head} \times L_\text{seq} \times B \times \text{bytes}$ (can be 10+ GB per request at 4K context).

**Flash Attention**: tiles the $N \times N$ attention matrix in blocks; never materialises the full matrix. Memory $O(N^2) \to O(N)$; 2–4× faster. Enables long context windows. Used universally in modern implementations.

**Speculative decoding**: small draft model generates K candidate tokens; large model verifies all K in one parallel forward pass; reject and regenerate from first mismatch. Net: 2–3× speedup with zero quality loss.

> ✅ **Must-remember**
>
> - **Chinchilla rule**: training tokens ≈ 20× parameters; data matters as much as scale.
> - **Attention** = softmax$(QK^T/\sqrt{d_k})V$; KV cache makes generation $O(N)$ not $O(N^2)$.
> - **RLHF**: SFT → RM → PPO+KL. **DPO**: simpler, direct from preference pairs.
> - **RAG** = retrieve then generate; grounding beats memorisation for facts.
> - **Temperature, Top-P** control randomness; always use temperature=0 for deterministic/factual tasks.
> - **INT4 quantisation** fits a 70B model on a consumer GPU with <3% quality loss.
> - **BLEU** measures n-gram precision (translation); **ROUGE** measures recall (summarisation). Both fail to capture semantic meaning — they measure surface overlap only.
> - **Chatbot Arena ELO** is the best real-world quality signal; academic benchmarks are saturated at the frontier.
> - **KV cache size** grows quadratically with model size and context length; PagedAttention (vLLM) makes it manageable in production by treating it like OS virtual memory.

---

## Ch 18 — AI Agents & Tool Use

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

**SWE-bench Verified** is the most widely-cited agent benchmark (2025–2026): 500 real GitHub issues from verified-solvable repositories. Measures end-to-end coding agent performance with patch submission and automated test evaluation.

**LLM-as-judge** for agent evaluation: ask a strong model (GPT-5.5 or Claude Opus) to score the agent's final response and trace against a rubric. Faster and cheaper than human annotation, but suffers from self-preference and verbosity biases — mitigate by using a different model family as the judge.

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
| **Model routing** | 30–80% — easy queries → Flash/Haiku/mini; hard → Opus/Pro/GPT-5.5 |
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

> 💡 **In a sentence —** By May 2026 no single model wins everything — GPT-5.5 leads agents, Claude Opus 4.7 leads code/tools, Gemini 3.1 Pro leads multimodal/value, and open-weight models (DeepSeek, Llama 4, Qwen 3.5) are within ~5 points on most tasks, making model choice primarily a question of price, latency, and ecosystem.

---

### Frontier Model Lineup (May 2026)

```
CLOSED-WEIGHT FRONTIER:
   GPT-5.5 (OpenAI)      — agents leader; Terminal-Bench 82.7%; SWE-bench 88.7%
   Claude Opus 4.7 (Ant) — SWE-bench 87.6%; tool orchestration
   Gemini 3.1 Pro (Ggl)  — GPQA 94.3%; cheapest flagship $2/$12 per M tokens

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

```
Normal LLM:     Input → [one forward pass] → Output (cost: fixed)

Reasoning model: Input → [think… think… think…] → Output (cost: scales with task)
                          (1K to 100K+ hidden tokens)
```

Doubling the thinking budget often beats doubling parameters on math, formal logic, multi-step planning, and hard code generation. Control: `reasoning_effort=low/medium/high` (OpenAI), `thinking.budget_tokens` (Anthropic), `thinking_config` (Gemini).

**When reasoning helps**: math, formal logic, complex code with specs, scientific analysis with multiple hypotheses, multi-step planning. **Skip for**: simple Q&A, creative writing, high-throughput classification, real-time voice. Cost trap: reasoning models charge for hidden tokens too — a single `high` call can be 10–50× a normal call.

---

### Open-Weight Race

All flagship open models in 2026 are **sparse MoE** — large total parameter count, small active slice per token. Why it matters:

1. **Cost & sovereignty**: self-host on H100s/TPUs; data never leaves your VPC.
2. **License war**: Apache 2.0 (Qwen 3.5, Mistral, Gemma 4). Llama keeps MAU clause (no commercial use above 700M monthly active users). DeepSeek went MIT.
3. **Quality**: DeepSeek V4 at 83.7% SWE-bench is within 5 points of GPT-5.5 — close enough that self-hosted open-weight + good infra often beats premium API on cost.

**When to pick open-weight**: privacy-critical (health, finance, defence), bulk inference (token cost dominates), long-context RAG (Llama 4 Scout 10M), research reproducibility. **When to pick closed**: top-end agent reliability, latest reasoning frontier, computer-use, zero ops.

---

### Coding Agents & SWE-bench

SWE-bench Verified scores late-2023 → May 2026: ~13% → **88.7%**. Four compounding factors: (1) stronger base models, (2) test-time compute / reasoning, (3) better scaffolds (file IO, test runners, diff review, persistent state), (4) RL on agentic traces.

Scaffold gap: Augment Code at 72% with Opus 4.6 vs Cursor at 65.7% with Sonnet 4.6 — same model family, better harness wins.

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

**Voice (2026)**: end-to-end speech-to-speech models (~300ms latency), natural interruptions. GPT-5.5 Realtime API, Gemini Live (real-time + screen-share), ElevenLabs Conversational. Vs 2024's 3-step pipeline (STT → LLM → TTS): 2026 is one model.

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

**Context window growth**: 8K (GPT-3.5) → 32K (GPT-4) → 200K (Claude 3) → 1M (Gemini 1.5/Claude 4) → **10M (Llama 4 Scout, 2025)**.

**Lost-in-the-middle** still exists — attention degrades on tokens buried in the centre of long contexts. A 2026 best practice: retrieve top-50 with hybrid search + reranking, dump into 1M context, let the model reason over retrieved subset.

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
     → Use reasoning model (GPT-5.5, Claude Opus 4.7 extended thinking, Gemini 3.1 Thinking)
     → Watch cost: 10-50× premium; only if quality improvement justifies

  3. Multimodal input (images, documents)?
     → Gemini 3.1 Pro or GPT-5.5 / Claude Opus 4.7

  4. High-volume / privacy-critical / bulk offline?
     → Open-weight: DeepSeek V4, LLaMA 4 Scout, Qwen 3.5
     → Self-host vLLM on H100s for bulk inference

  5. Structured tabular data / CTR / fraud?
     → XGBoost first; LLM only if text context is the main signal

  6. Real-time voice?
     → GPT-5.5 Realtime / Gemini Live (end-to-end, not STT+LLM+TTS)

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
| Gemini 3.1 Pro | Flagship | Complex reasoning, multimodal, SWE-bench 80.6%, GPQA 94.3% |
| Gemini 3 Flash | High-throughput | Production workhorse |
| Gemini 3 Nano | On-device | Pixel, Android, ChromeOS |
| Gemini Live | Real-time | Bidirectional audio + video |
| Imagen 4 / Veo 3.1 | Generation | Image/video in Vertex |

**TPU v7 "Ironwood"** (GA early 2026): 4,614 FP8 TFLOPS per chip; 192 GB HBM (6× Trillium); pod scale 9,216 chips → 42.5 exaFLOPS. Anthropic committed to up to 1 million Ironwood chips in 2026.

---

### 2026 Benchmark Landscape

| Benchmark | Status |
|-----------|--------|
| MMLU, HumanEval, GSM8K | **Saturated** (≥90% frontier) — citing them is a yellow flag |
| **SWE-bench Verified** | Active — frontier ~88% |
| **Terminal-Bench 2.0** | Active — GPT-5.5 82.7% |
| **OSWorld** | Active — Claude Opus 4.7 ~44% |
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
> - No single model wins everything — pick by task (GPT-5.5 for agents, Claude for code, Gemini for multimodal/value).
> - **Test-time compute** (reasoning budget) > parameter scaling for hard decomposable tasks.
> - **SWE-bench** went 13% → 88% in 18 months: better models + reasoning + better scaffolds + RL on traces.
> - **EU AI Act enforcement: Aug 2, 2026** — €35M or 7% global revenue.
> - **Veo 3.1** (synchronised audio), **Llama 4 Scout** (10M context), **TPU v7 Ironwood** (42.5 exaFLOPS pod).

---

## One-page cheat recap

| Chapter | Single most important fact/formula |
|---------|-----------------------------------|
| **Ch 16 — Deep Learning** | $\text{Attention}(Q,K,V) = \text{softmax}(QK^T/\sqrt{d_k})V$; **AdamW** = correct optimizer for Transformers; **ResNet skip** solved deep training; **LoRA** $W_\text{eff}=W_0+BA$ trains <1% of params; **RLHF** = SFT → RM → PPO+KL. |
| **Ch 17 — LLMs** | **Chinchilla rule**: training tokens ≈ 20× params (data matters as much as scale); **KV cache** + Flash Attention reduce generation from $O(N^2)$ to $O(N)$ memory; DPO replaces 3-stage RLHF with one direct preference loss; INT4 quantisation fits 70B on a consumer GPU with <3% quality loss. |
| **Ch 18 — AI Agents** | An agent = LLM in an observe→think→act loop with tools. **MCP** = N+M (not N×M) integrations via Tools/Resources/Prompts primitives. **A2A** = agent-to-agent cross-org. Critical security rule: the LLM never executes tools directly — your code does. |
| **Ch 19 — Frameworks** | **vLLM** (PagedAttention, 2–10× throughput) is the 2026 default inference server; **TGI is in maintenance mode**. Hybrid search beats pure vector; reranking is the #1 RAG quality lever; prompt caching is the #1 cost lever. LangGraph for production agents; LlamaIndex for data-heavy RAG. |
| **Ch 20 — 2026 Landscape** | No single model wins everything; within ~3 points at the top → model choice is price/latency/ecosystem. **Test-time compute** (reasoning budget) > parameter scaling for hard tasks. **EU AI Act full enforcement: Aug 2, 2026**. **SWE-bench** 13% → 88% in 18 months = better models + reasoning + scaffolds + RL. |
