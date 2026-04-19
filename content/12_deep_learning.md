# Chapter 12 — Deep Learning: Complete Reference

> "Deep learning is a superpower. With it, you can build an AI that figures out
> things even its creator doesn't fully understand." — Andrew Ng

**How to read this chapter:** Every topic follows the same pattern — a plain-English story first, then the technical details. Skip straight to the diagrams if you want. Come back for the math when you're ready.

---

## What You'll Learn

After reading this chapter, you will be able to:
- Walk through backpropagation with actual numbers
- Compare optimizers (SGD, Adam, AdaGrad) and know when to use each
- Explain CNN architectures (convolution, pooling, famous nets like ResNet)
- Understand the Transformer architecture and self-attention mechanism
- Describe how language models work (GPT, BERT)
- Explain generative models (GANs, VAEs, Diffusion)
- Apply practical techniques: learning rate scheduling, mixed precision, transfer learning

---

## Table of Contents

| Part | Topic |
|------|-------|
| 1 | Training Deep Networks |
| 2 | Computer Vision |
| 3 | Attention & Transformers |
| 4 | Language Models & LLMs |
| 5 | Generative Models |
| 6 | Specialized Architectures |
| 7 | Practical Deep Learning |

---

# PART 1: TRAINING DEEP NETWORKS

---

## 1.1 Backpropagation

**In one sentence:** After the network makes a wrong prediction, backprop figures out which weights caused the mistake and by how much — so we can fix each one.

### The Story

Imagine you're tuning a guitar with 100 pegs. You play a chord, it sounds wrong. You need to figure out which pegs to turn, and how much. Backpropagation is exactly this — except instead of ears, it uses calculus.

The key question it answers: **"If I change this one weight slightly, how much does the total error change?"** When you know that for every weight, you can nudge each one in the right direction.

The math tool it uses is called the **chain rule** — a way to break a big question ("how does weight W1 affect the final error?") into a chain of smaller questions ("how does W1 affect layer 2? how does layer 2 affect layer 3? how does layer 3 affect the error?"). Multiply those small answers together and you get the big answer.

### Worked Example — Forward Pass

Here's a tiny network. Two inputs, one hidden layer with two neurons, one output.

```
  INPUT          HIDDEN           OUTPUT
  x₁ = 0.5  →   h₁ (ReLU)   →   ŷ (sigmoid)
  x₂ = 0.3  →   h₂ (ReLU)
  True y = 1

  Layer 1 weights:  W₁₁=0.4  W₁₂=0.2
                    W₂₁=0.3  W₂₂=0.5
  Layer 2 weights:  v₁=0.6   v₂=0.8
```

**Step 1 — Calculate hidden layer values:**

$$z^{(1)}_1 = 0.4 \times 0.5 + 0.2 \times 0.3 = 0.26$$

$$h_1 = \text{ReLU}(0.26) = 0.26$$

$$z^{(1)}_2 = 0.3 \times 0.5 + 0.5 \times 0.3 = 0.30$$

$$h_2 = \text{ReLU}(0.30) = 0.30$$

**Step 2 — Calculate output:**

$$z^{(2)} = 0.6 \times 0.26 + 0.8 \times 0.30 = 0.396$$

$$\hat{y} = \sigma(0.396) = 0.598$$

**Step 3 — Calculate loss (how wrong we are):**

$$L = -\log(0.598) = 0.514$$

(true label was 1, we predicted 0.598 — off by ~0.4)

### Worked Example — Backward Pass

Now we go backwards. Each step answers: *"If I increase this number slightly, does the loss go up or down?"*

**Step A — How does loss react to our prediction $\hat{y}$?**

$$\frac{\partial L}{\partial \hat{y}} = \frac{-1}{0.598} = -1.672$$

Negative means: increasing $\hat{y}$ REDUCES the loss. Makes sense — the true answer is 1, so we should predict higher.

**Step B — How does $\hat{y}$ react to $z^{(2)}$ (the pre-sigmoid value)?**

$$\frac{\partial \hat{y}}{\partial z^{(2)}} = 0.598 \times (1 - 0.598) = 0.240$$

$$\text{Combined: } \frac{\partial L}{\partial z^{(2)}} = -1.672 \times 0.240 = -0.401$$

**Step C — Gradients for Layer 2 weights:**

$$\frac{\partial L}{\partial v_1} = -0.401 \times h_1 = -0.401 \times 0.26 = -0.104$$

(increase $v_1$ to reduce loss)

$$\frac{\partial L}{\partial v_2} = -0.401 \times h_2 = -0.401 \times 0.30 = -0.120$$

**Step D — How much blame does each hidden neuron get?**

$$\frac{\partial L}{\partial h_1} = -0.401 \times v_1 = -0.401 \times 0.6 = -0.241$$

$$\frac{\partial L}{\partial h_2} = -0.401 \times v_2 = -0.401 \times 0.8 = -0.321$$

h₂ gets more blame because it had a stronger connection (v₂=0.8) to the output.

**Step E — Through ReLU** (if input was positive, gradient passes straight through):

$z^{(1)}_1 = 0.26 > 0$, so $\frac{\partial L}{\partial z^{(1)}_1} = -0.241$ (unchanged)

$z^{(1)}_2 = 0.30 > 0$, so $\frac{\partial L}{\partial z^{(1)}_2} = -0.321$ (unchanged)

If z had been negative (ReLU would have output 0), the gradient would be zero — that neuron gets NO update. This is the "dead ReLU" problem.

**Step F — Gradients for Layer 1 weights:**

$$\frac{\partial L}{\partial W_{11}} = -0.241 \times x_1 = -0.241 \times 0.5 = -0.121$$

$$\frac{\partial L}{\partial W_{12}} = -0.241 \times x_2 = -0.241 \times 0.3 = -0.072$$

$$\frac{\partial L}{\partial W_{21}} = -0.321 \times x_1 = -0.321 \times 0.5 = -0.161$$

$$\frac{\partial L}{\partial W_{22}} = -0.321 \times x_2 = -0.321 \times 0.3 = -0.096$$

**Step G — Update all weights** (learning rate = 0.1):

$$v_{1}^{\text{new}} = 0.6 - 0.1 \times (-0.104) = 0.610$$

$$v_{2}^{\text{new}} = 0.8 - 0.1 \times (-0.120) = 0.812$$

$$W_{11}^{\text{new}} = 0.4 - 0.1 \times (-0.121) = 0.412$$

Every weight moved in the direction that reduces the loss. That's ONE training step. Repeat thousands of times.

---

## 1.2 Optimizers ★★★

**In one sentence:** Optimizers are different strategies for deciding how much to move each weight after each training step.

### The Problem with Plain Gradient Descent

Plain gradient descent takes the same-sized step in every direction. This causes two problems:

1. **Zigzagging** — in a narrow valley, it bounces side-to-side instead of heading straight down
2. **One-size-fits-all** — some weights need big updates, others need tiny ones

The optimizers below each solve one or both of these problems.

---

### SGD — Plain Gradient Descent

The simplest version. Just multiply the gradient by the learning rate and subtract.

$$w \leftarrow w - \alpha \times \nabla w$$

where $\alpha$ = learning rate (e.g., 0.01)

**Problem:** Same step size for everything. Zigzags a lot. Slow.

---

### SGD + Momentum

**The idea:** Keep moving in the direction you've been going. Like a ball rolling downhill — it builds speed on long slopes and doesn't zigzag.

$$v \leftarrow 0.9 \times v + 0.1 \times \nabla w$$

$$w \leftarrow w - \alpha \times v$$

(90% old direction, 10% new)

**What β=0.9 means:** The current direction is 90% "where I've been going" and 10% "where the gradient says to go now." Over ~10 steps, the direction gets smoothed out.

**Result:** Faster convergence, less zigzagging.

---

### AdaGrad — Different Rates for Different Weights

**The idea:** Weights that get updated often (common features) should get smaller steps. Weights that rarely get updated (rare features) should get bigger steps.

**Example:** The word "the" appears in every sentence — its embedding gets updated constantly. The word "photosynthesis" appears rarely — it needs a bigger nudge when it does appear.

$$G \leftarrow G + (\nabla w)^2$$

$$w \leftarrow w - \frac{\alpha}{\sqrt{G}} \times \nabla w$$

(G = running sum of squared gradients — grows forever)

**The problem:** G only ever grows. Eventually the learning rate reaches zero and the weight stops learning entirely. Fine for short training, breaks for long training.

---

### RMSProp — AdaGrad That Forgets the Past

**The idea:** Fix AdaGrad's "memory is forever" problem. Instead of adding ALL past squared gradients, use a decaying average — recent history matters more, old history fades.

Think of it like short-term memory. You remember what happened last week more than what happened last year.

$$E[g^2] \leftarrow 0.99 \times E[g^2] + 0.01 \times (\nabla w)^2$$

$$w \leftarrow w - \frac{\alpha}{\sqrt{E[g^2] + \epsilon}} \times \nabla w$$

The `0.99 × E[g²]` slowly "forgets" old gradients. The `0.01 × gradient²` adds the fresh information. This keeps the learning rate from hitting zero.

**Best for:** RNNs and non-stationary problems.

---

### Adam — The Default Choice ★★★

**The idea:** Combine Momentum + RMSProp. Track both the direction AND the size of recent gradients.

Adam keeps two running averages for each weight:
- **m** = average gradient (direction — like Momentum)
- **v** = average gradient² (size — like RMSProp)

$$m \leftarrow 0.9 \times m + 0.1 \times \nabla w$$

$$v \leftarrow 0.999 \times v + 0.001 \times (\nabla w)^2$$

**Bias correction** — why it's needed: m and v both start at zero. In the first few steps, they're dragged down toward zero, making updates too small. The correction inflates them to their proper size:

$$\hat{m} = \frac{m}{1 - 0.9^t}$$

At step 1: divides by 0.1, makes it 10x bigger

$$\hat{v} = \frac{v}{1 - 0.999^t}$$

Correction fades as $t$ grows (irrelevant after ~1000 steps)

Final update:

$$w \leftarrow w - 0.001 \times \frac{\hat{m}}{\sqrt{\hat{v}} + 10^{-8}}$$

**Why everyone uses it:** Works well on the first try with default settings. Handles sparse gradients, adapts per-weight.

---

### AdamW — Adam with Proper Weight Decay ★★★

**The problem with Adam + L2 regularization:** When you add weight decay to the gradient before Adam processes it, Adam's adaptive scaling weakens it — heavily-updated weights barely get regularized.

**AdamW** separates weight decay from the gradient update:

$$w \leftarrow w - \alpha \times \frac{\hat{m}}{\sqrt{\hat{v}} + \epsilon} - \alpha \times \lambda \times w$$

The first term is the adapted gradient update; the second term is weight decay (fixed %).

The decay term now shrinks every weight by a fixed percentage each step, regardless of gradient size. This is the correct way to regularize Adam.

**Standard for:** BERT, GPT, LLaMA, and all modern Transformers.

---

### Optimizer Cheat Sheet

| Optimizer | Adapts per weight? | Uses momentum? | Best for |
|-----------|-------------------|----------------|---------|
| SGD | No | No | Simple problems |
| SGD+Momentum | No | Yes | CNNs (often beats Adam!) |
| AdaGrad | Yes | No | Sparse data (short training) |
| RMSProp | Yes | No | RNNs |
| Adam | Yes | Yes | General deep learning |
| AdamW | Yes | Yes | Transformers, LLMs |

```chart
{
  "type": "bar",
  "data": {
    "labels": ["SGD", "SGD+Momentum", "AdaGrad", "RMSProp", "Adam", "AdamW"],
    "datasets": [
      {
        "label": "Adapts Per Weight",
        "data": [0, 0, 1, 1, 1, 1],
        "backgroundColor": "rgba(99, 102, 241, 0.7)",
        "borderColor": "rgba(99, 102, 241, 1)", "borderWidth": 1
      },
      {
        "label": "Uses Momentum",
        "data": [0, 1, 0, 0, 1, 1],
        "backgroundColor": "rgba(34, 197, 94, 0.7)",
        "borderColor": "rgba(34, 197, 94, 1)", "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Optimizers — Adam/AdamW Combine Both Adaptive Rates AND Momentum" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Has Feature (1=Yes)" }, "beginAtZero": true, "max": 1.2 },
      "x": {}
    }
  }
}
```

---

## 1.3 Loss Functions

**In one sentence:** The loss function is a scorecard — one number that measures how wrong the model's prediction was. Lower = better.

### Why Different Tasks Need Different Loss Functions

Predicting a house price (any number) is fundamentally different from classifying an email (yes/no) or detecting all objects in an image (many classes, unbalanced data). Each needs a different scorecard.

---

### Standard Losses

**For regression (predicting numbers):**

- **MSE** (Mean Squared Error): squares each error. A prediction off by 10 costs 100. Off by 1 costs 1. Very sensitive to outliers.
- **MAE** (Mean Absolute Error): takes the raw gap. Off by 10 costs 10. Off by 1 costs 1. More robust.
- **Huber**: uses MSE for small errors (smooth), MAE for large errors (ignores outliers).

**For classification (predicting categories):**

Binary Cross-Entropy (yes/no tasks):

$$L = -\left[ y \log(\hat{y}) + (1 - y) \log(1 - \hat{y}) \right]$$

Categorical Cross-Entropy (multiple classes):

$$L = -\sum_{i} y_i \log(\hat{y}_i)$$

(sum over all classes, $y_i = 1$ for the correct class)

Cross-entropy punishes confident wrong answers very heavily. If the correct answer is "cat" and you say "definitely cat" (0.99 confidence) → tiny loss. If you say "barely cat" (0.01 confidence) → huge loss. The message: be confident when you're right.

---

### Focal Loss — For When One Class Is Rare

**Problem:** Imagine a dataset that is 99% "no tumor" and 1% "tumor." A model can get 99% accuracy by always predicting "no tumor" — without learning anything useful.

Standard cross-entropy weights all examples equally, so the model gets lazy on easy "no tumor" examples.

**Focal Loss** down-weights easy examples (high-confidence correct predictions) and up-weights hard examples (low-confidence or wrong predictions):

$$FL = -(1 - p_t)^\gamma \times \log(p_t)$$

where $(1 - p_t)^\gamma$ is the focusing weight: $\gamma = 0$ gives normal cross-entropy; $\gamma = 2$ means confident correct answers barely count.

**Example with γ=2:**
- Easy example (model 95% confident and correct): weight = (1−0.95)² = 0.0025 → nearly ignored
- Hard example (model 20% confident): weight = (1−0.2)² = 0.64 → still heavily penalized

**Used for:** Object detection (RetinaNet), medical diagnosis, any severely imbalanced task.

---

### Triplet Loss — For Learning Similarity

**Goal:** Teach the model that photos of the same person should be near each other in embedding space, and photos of different people should be far apart.

**Three examples per step:**
- **Anchor**: a photo of person X
- **Positive**: a different photo of the same person X
- **Negative**: a photo of someone else

$$L = \max\left(0,\; d(A, P) - d(A, N) + \text{margin}\right)$$

where $d(A, P)$ should be small (same person) and $d(A, N)$ should be large (different person).

The `max(0, ...)` means: if the positive is already closer than the negative by at least `margin`, loss is 0 — we don't need to update. We only update when things are wrong.

**Used for:** Face recognition (FaceNet), image similarity search, product recommendations.

---

### NT-Xent Loss — For Self-Supervised Learning

**Goal:** Learn useful representations without any labels, just by saying "these two images show the same thing."

Take one image, create two slightly different crops/colorings of it. They should have similar embeddings. All other images in the batch should have different embeddings.

$$L = -\log \frac{\text{sim}(v_1, v_2)}{\sum_{k} \text{sim}(v_1, v_k)}$$

**τ (temperature):** A sharpness dial. Low τ = model must be very confident about which pair matches. High τ = more lenient.

**Key insight:** More images in the batch = more negative examples = harder task = better learned representations.

---

## 1.4 Normalization ★★

**In one sentence:** Normalization keeps the numbers flowing through the network in a healthy range so training doesn't collapse.

### Why It Matters

Imagine a neural network as water flowing through a series of pipes. Without normalization, the water pressure (activation values) can:
- Spike too high → saturates activation functions → gradients vanish
- Drop too low → no signal reaches early layers → nothing learns
- Vary wildly between features → training becomes unstable

Normalization is the pressure regulator.

---

### Batch Normalization ★★

**What it does:** For each feature, look at all the values in the current batch. Shift them so the average is 0. Scale them so the spread is 1.

**When to use it:** CNNs, large batch sizes.

```
  Example — batch of 4 samples, feature "height":
  Values: [2.0, 3.0, 1.0, 4.0]
  Mean = 2.5, Std = 1.12

  Normalized: [−0.45, +0.45, −1.34, +1.34]
  → now centered at 0, spread of 1
```

Each feature gets normalized ACROSS the batch. Two learnable parameters (γ, β) let the network rescale/shift if it needs a different range.

**Problem:** Needs a decent batch size to work well. Fails for RNNs (variable sequence lengths). Statistics change during training.

---

### Layer Normalization ★★

**What it does:** For each individual sample, normalize across all its features. Each sample is handled independently — doesn't care about other samples at all.

**When to use it:** Transformers, BERT, GPT, RNNs. Works even with batch size = 1.

```
  Example — one sample with 3 features: [2.0, 0.1, 5.0]
  Mean = 2.37, Std = 2.04
  Normalized: [−0.18, −1.11, +1.29]
  → this sample's features are now centered and scaled
```

**Why Transformers use this:** Each sentence can have different length. BatchNorm would mix up the statistics of different sentences. LayerNorm handles each token independently.

---

### Other Normalization Types

| Method | Normalizes over | Use when |
|--------|----------------|---------|
| Batch Norm | across samples per feature | CNNs, large batches |
| Layer Norm | across features per sample | Transformers, RNNs |
| Group Norm | groups of channels per sample | Small batch vision |
| RMS Norm | same as Layer Norm, simpler | LLaMA, modern LLMs |

**RMS Norm** skips the mean subtraction step (just divides by root-mean-square). Slightly faster, similar quality. Used in LLaMA and many modern LLMs.

---

## 1.5 Gradient Clipping

**In one sentence:** Cap the gradient's size before updating weights, so one bad step can't throw training off a cliff.

### The Problem

Sometimes during training — especially in RNNs or early in Transformer training — the gradient suddenly becomes enormous. Without clipping, the next weight update is huge, throwing weights completely off course (often to NaN, meaning "not a number," which crashes training).

### The Solution

Think of it like a speed limit. Gradients can point any direction, but their speed (magnitude) is capped.

**Norm clipping** (the standard way):

1. Compute the total size of all gradients:

$$\|g\| = \sqrt{\sum g_i^2}$$

2. If $\|g\| > \text{max norm}$ (e.g., 1.0):

$$g \leftarrow g \times \frac{1.0}{\|g\|}$$

3. If $\|g\| \leq \text{max norm}$: do nothing

Importantly, this **preserves direction** — the gradient still points the right way, it just moves slower. Like slowing your car, not turning it.

```python
  # PyTorch
  torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
```

**Value clipping** (simpler, worse): clips each gradient element separately. This can distort direction because some elements are clipped and others aren't. Avoid unless you have a specific reason.

**Standard settings:** max_norm=1.0 for Transformers and RNNs.

---

## 1.6 Mixed Precision Training

**In one sentence:** Use smaller numbers (16-bit instead of 32-bit) for most calculations to make training 2-4x faster and use half the memory.

### The Idea

Normally each parameter is a 32-bit float. Using 16-bit floats is like switching from verbose longhand to shorthand — faster to write, slightly less precise, but good enough for most math.

The tricky part: 16-bit numbers have a limited range (up to ~65,504). Very small gradients can round to zero. The solution is to keep weight updates in 32-bit, and only do forward/backward passes in 16-bit.

### The Process

```
  1. Forward pass:     float16  (fast)
  2. Compute loss:     float16
  3. Scale loss × big number   (prevents tiny gradients from rounding to 0)
  4. Backward pass:    float16  (fast)
  5. Unscale gradients back
  6. Skip update if NaN/Inf found
  7. Update weights:   float32  (precise — always kept in full precision)
```

**BF16 (Brain Float 16):** Same range as float32, slightly less precision than float16. Better for training (no overflow risk). Used on Google TPUs and NVIDIA A100/H100 GPUs. Most modern LLM training uses BF16.

```python
  # PyTorch AMP
  with torch.autocast(device_type='cuda', dtype=torch.bfloat16):
      output = model(input)
```

---

# PART 2: COMPUTER VISION

---

## 2.1 CNN Architecture Evolution ★★★

**In one sentence:** CNNs for images have evolved from 5-layer networks (1998) to 150+ layer networks (2015+) through a series of key breakthroughs.

### The Story of Progress

Think of CNN evolution like car engineering. Each generation solved a specific problem the previous generation had. The jump from LeNet to AlexNet was like going from a horse carriage to a car. ResNet was like inventing the highway interchange — suddenly traffic (information) could flow efficiently through hundreds of layers.

---

### LeNet-5 (1998) — Proof of Concept

**What it solved:** Handwritten digit recognition. First proof that CNNs work.

**Think of it as:** The Wright Brothers' plane. It flew! That was enough.

```
  Input(32×32)
    → Conv 5×5 (6 filters)
    → Pool 2×2
    → Conv 5×5 (16 filters)
    → Pool 2×2
    → Fully Connected (120)
    → Fully Connected (84)
    → Output (10 digits)
```

60,000 parameters. A modern smartphone app has billions.

---

### AlexNet (2012) — The Revolution

**What it solved:** Large-scale image recognition (1000 classes, 1.2M images).

**Think of it as:** The first muscle car. Same basic design, but with a much bigger engine (GPU) and better fuel (ReLU activations).

**Why it was historic:** Won the 2012 ImageNet competition with 15.3% error. Second place had 26.2%. That gap shocked the entire field and started the deep learning revolution.

**Key innovations:**
- **ReLU** instead of sigmoid → solved vanishing gradients, trained 6x faster
- **Dropout** → first time used in vision, reduced overfitting
- **GPU training** → two GTX 580 cards working in parallel
- **Data augmentation** → random crops and flips during training

60 million parameters.

---

### VGG (2014) — Simple and Deep

**What it solved:** Can simpler be deeper and better?

**Think of it as:** A very orderly library. Everything is the same size (only 3×3 filters), stacked neatly. Easy to understand and extend.

**The key insight:** Two 3×3 conv layers see the same area as one 5×5 layer, but with fewer parameters and more non-linearity (two ReLUs instead of one).

```
  VGG-16 structure:
  [3×3 conv × 2] → Pool
  [3×3 conv × 2] → Pool
  [3×3 conv × 3] → Pool
  [3×3 conv × 3] → Pool
  [3×3 conv × 3] → Pool
  → FC(4096) → FC(4096) → FC(1000)
```

138 million parameters. Still used as a baseline today.

---

### ResNet (2015) — The Breakthrough Architecture ★★

**What it solved:** Why does making networks deeper make them WORSE?

**Think of it as:** Adding GPS to a car. The car doesn't have to figure out how to get somewhere from scratch — it just has to figure out small corrections from the last known position.

Before ResNet, adding more than ~20 layers made accuracy drop. This wasn't because of overfitting — the training loss itself got worse. The culprit: gradients vanished before reaching early layers.

**The fix — skip connections:**

```
  input x
     │
     ├─────────────────────┐   (shortcut — just passes x through unchanged)
     ▼                     │
  Conv → BN → ReLU         │
     ↓                     │
  Conv → BN                │
     ↓                     │
    (+) ←──────────────────┘   (add shortcut back in)
     ↓
  ReLU
  output
```

Instead of learning a full transformation, each block only needs to learn the small **residual** (what to change). If a layer isn't useful, the shortcut lets the gradient bypass it entirely.

ResNet-152 (152 layers!) trained successfully. This was previously impossible.

---

### EfficientNet (2019) — Scale Smarter

**What it solved:** What's the best way to make a model bigger?

**Think of it as:** Tuning a car engine. You can't just increase fuel injection without also increasing airflow and ignition timing. Everything needs to be balanced.

Previous work scaled networks by making them deeper, or wider, or feeding them bigger images — but each separately. EfficientNet found the right ratio between all three:

$$\text{depth} \propto 1.2^\phi$$

$$\text{width} \propto 1.1^\phi$$

$$\text{resolution} \propto 1.15^\phi$$

where $\phi$ is a compound scaling coefficient you choose.

**Result:** EfficientNet-B7 achieved state-of-the-art ImageNet accuracy with 8× fewer parameters than the next-best model.

---

## 2.2 Object Detection — YOLO

**In one sentence:** YOLO detects every object in an image in a single pass — finding what each object is AND where it is simultaneously.

### The Problem YOLO Solved

Older methods (R-CNN) worked in two stages: first propose 2000 candidate regions, then classify each one. This was too slow for real-time use.

YOLO's insight: do everything in one shot.

### How It Works

```
  1. Divide image into a 7×7 grid (49 cells)
  2. Each cell simultaneously predicts:
     - Is there an object centered here?
     - Where exactly? (x, y, width, height)
     - What class is it? (dog? car? person?)

  ┌──────────────────────┐
  │  .  .  .  .  .  .  .│
  │  .  .  ┌────┐  .  . │
  │  .  .  │dog!│  .  . │  ← one grid cell detected a dog
  │  .  .  └────┘  .  . │
  │  .  .  .  .  .  .  .│
  └──────────────────────┘

  ONE forward pass through the network → all detections at once
```

**Non-Maximum Suppression (NMS):** Multiple nearby cells might each detect the same dog. NMS removes duplicates by keeping only the highest-confidence box and removing any boxes that overlap it by more than 50%.

**IOU (Intersection over Union):** The standard measure of "are these boxes detecting the same thing?"

$$\text{IOU} = \frac{\text{Area of Overlap}}{\text{Area of Union}}$$

IOU > 0.5 means same object -- keep only the higher-confidence box.

**YOLOv8 runs in real-time on a phone.** Used in self-driving cars, security cameras, robotics.

---

## 2.3 Semantic Segmentation — U-Net

**In one sentence:** Label every single pixel in the image with a category (cat, background, road, sky...).

### What Makes It Different

- Image classification: one label for the whole image ("there's a cat")
- Object detection: one box per object ("cat at position X, Y")
- Semantic segmentation: one label per pixel ("this pixel is cat, this pixel is background")

### U-Net Architecture

U-Net gets its name from its shape — an encoder that shrinks the image, a decoder that expands it back, connected by bridges.

```
  ENCODER (shrinks, learns what is where):
  572×572 → 284×284 → 142×142 → 71×71 → 35×35
  (each step: 2 convolutions + max pooling)

  DECODER (expands, predicts label per pixel):
  35×35 → 71×71 → 142×142 → 284×284 → output
  (each step: upsample + 2 convolutions)

  BRIDGES (skip connections — horizontal lines in the U):
  Each decoder level receives features from the matching encoder level
```

**Why skip connections matter:** The encoder learns "where things are" but loses spatial detail (from pooling). The decoder needs that spatial detail to label pixels precisely. Skip connections pass the fine-grained location information directly to the decoder.

Originally designed for medical images (where labeled data is very scarce). Now used for: satellite image analysis, self-driving car road segmentation, industrial inspection.

---

## 2.4 Vision Transformer (ViT)

**In one sentence:** Apply the Transformer architecture (designed for text) to images by treating each image patch as a "word."

### The Idea

Transformers process sequences. Images aren't sequences — they're grids. ViT converts a grid into a sequence by chopping the image into small square patches.

```
  Step 1: Chop 224×224 image into 16×16 patches
          → 196 patches (14×14 grid of patches)

  Step 2: Flatten each patch (16×16×3 colors = 768 numbers)
          + pass through a linear layer → patch embedding

  Step 3: Add a special [CLS] token at the start
          + add positional embeddings (which patch is which)

  Step 4: Feed the 197 tokens through a standard Transformer

  Step 5: The [CLS] token's final output → classifier
```

**The advantage:** From layer 1, every patch can attend to every other patch. CNNs need many layers to "see" the whole image — a cat's tail in one corner and its face in another are only connected after many pooling steps. ViT connects them immediately.

**The limitation:** Needs enormous training data to work well (100M+ images). CNNs are more data-efficient. The solution is to pre-train on massive datasets, then fine-tune on smaller ones.

---

## 2.5 Data Augmentation

**In one sentence:** Artificially expand your dataset by creating modified copies of your training images.

### Why It Helps

The model should recognize a cat whether it's flipped, slightly darker, or cropped differently. By training on all those variations, you make the model robust to them.

**Standard image augmentations:**

| Type | Example |
|------|---------|
| Spatial | Horizontal flip, random crop, rotation ±15° |
| Color | Brightness ±20%, contrast, hue jitter |
| Noise | Gaussian blur, random erasing |

**Advanced techniques:**
- **CutOut**: randomly mask a square region with zeros
- **MixUp**: blend two images together (`x = 0.5×image1 + 0.5×image2`), blend their labels too
- **CutMix**: paste a crop from one image onto another, blend labels by area proportion
- **RandAugment**: randomly pick 2 augmentations from a list — simple and effective

**For text (NLP augmentation):**
- Replace words with synonyms
- Back-translate (English → French → English) to paraphrase
- Random word deletion or swapping

---

# PART 3: ATTENTION & TRANSFORMERS

---

## 3.1 Seq2Seq + Bahdanau Attention ★★★

**In one sentence:** The attention mechanism that preceded Transformers — it lets the decoder focus on different parts of the input at each step.

### The Problem It Solved

Early translation models compressed an entire sentence into a single vector. "The movie I watched last Tuesday with my three friends was absolutely wonderful" → one vector → decoder generates translation. Long sentences lost information.

**Bahdanau Attention (2015)** kept ALL encoder hidden states and let the decoder query them at each step:

```
  Encoding "Je suis étudiant":
  Je → h₁    suis → h₂    étudiant → h₃

  When generating "I" (step 1):
  Score how relevant each encoder word is:
    "Je":       9.1  → after softmax: 0.85
    "suis":     1.2  → after softmax: 0.05
    "étudiant": 2.1  → after softmax: 0.08

  Context = 0.85 × h₁ + 0.05 × h₂ + 0.08 × h₃
  → 85% attention on "Je" when generating "I" ✓
```

This was the direct predecessor of self-attention — the key insight that you can learn WHERE to look.

---

## 3.2 Self-Attention ★★★

**In one sentence:** Every word in a sentence simultaneously asks "which other words should I pay attention to?" and gathers context from them.

### The Story

In a meeting room, everyone can hear everyone else at once. Each person decides: "I'll weight Alice's comment at 70% and Bob's at 30% when forming my opinion." Self-attention is the mathematical version of this simultaneous listening.

In Bahdanau attention, only the decoder asks about encoder words. In self-attention, EVERY word asks about EVERY other word (including itself) — in both directions, all at once.

### Q, K, V — The Three Roles

Each word plays three roles simultaneously:

- **Query (Q):** "What information am I looking for?"
- **Key (K):** "What information do I contain?"
- **Value (V):** "What information do I actually give to others?"

Each word's embedding is multiplied by three learned weight matrices (Wq, Wk, Wv) to produce its Q, K, V vectors.

### Worked Example

```
  Sentence: "cat sat mat"  (embedding dimension = 4, simplified to d_k = 2)

  Token embeddings:
  cat → x₁ = [1, 0, 1, 0]
  sat → x₂ = [0, 1, 0, 1]
  mat → x₃ = [1, 1, 0, 0]

  After multiplying by Wq, Wk, Wv (learned matrices):
  cat: q₁=[2,1]  k₁=[0,2]  v₁=[2,0]
  sat: q₂=[0,2]  k₂=[2,0]  v₂=[0,2]
```

**For "cat" — how much attention to pay to each word:**

```
  score(cat→cat) = q₁ · k₁ = [2,1]·[0,2] = 2
  score(cat→sat) = q₁ · k₂ = [2,1]·[2,0] = 4   ← cat pays most attention to sat!
  score(cat→mat) = ...

  Scale by 1/√2 (prevents scores from getting too large):
  scores = [1.41, 2.83, ...]

  Softmax → attention weights = [0.22, 0.65, 0.13]
```

**Output for "cat" — a blend of all values, weighted by attention:**

```
  output = 0.22 × v_cat + 0.65 × v_sat + 0.13 × v_mat
         = 0.22×[2,0] + 0.65×[0,2] + ...
         = [0.44, 1.30, ...]
```

"cat" now contains information about "sat" and "mat." Its representation is enriched by context.

**The matrix formula (all tokens at once):**

$$\text{Output} = \text{softmax}\!\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$$

This computes attention for ALL tokens simultaneously using matrix multiplication. Very GPU-friendly.

---

## 3.3 BERT ★★★

**In one sentence:** A pre-trained language model that reads text in both directions simultaneously, pre-trained on "fill in the blank" and "do these sentences connect?" tasks.

### How to Think About It

BERT reads a sentence the way a careful editor does — going back and forth, using context from both before AND after a word to understand it. A detective doesn't just read forward; they re-read the whole file. BERT does this at every layer.

### Architecture

- **BERT-base:** 12 Transformer layers, 12 attention heads, 768 dimensions → 110M parameters
- **BERT-large:** 24 layers, 16 heads, 1024 dimensions → 340M parameters
- Every token can attend to EVERY other token (unlike GPT, which can only look backwards)

### Pre-Training Tasks

BERT is trained on two tasks (no manual labels needed — the labels come from the text itself):

**Task 1 — Masked Language Modeling (MLM):**

```
  Input:  "The [MASK] sat on the [MASK]"
  Target: "The cat   sat on the mat"
```

15% of tokens are randomly chosen. Of those:
- 80% are replaced with [MASK]
- 10% are replaced with a random wrong word (makes the model robust)
- 10% are kept unchanged (helps the model learn about normal tokens too)

The model must predict the original word. This forces it to use BOTH left and right context — truly bidirectional.

**Task 2 — Next Sentence Prediction (NSP):**

```
  Input: [CLS] "Dogs are great pets." [SEP] "They are loyal." [SEP]
  Label: IsNext  (these sentences belong together)

  Input: [CLS] "Dogs are great pets." [SEP] "The stock market fell." [SEP]
  Label: NotNext  (random, unrelated sentences)
```

Note: Later research showed NSP doesn't help much. RoBERTa (an improved BERT) removed it and did better.

### Fine-Tuning for Your Task

Add a small task-specific layer on top of pre-trained BERT, then train on your labeled data:

| Task | Input | Output |
|------|-------|--------|
| Sentiment analysis | [CLS] + sentence | [CLS] output → positive/negative |
| Named Entity Recognition | [CLS] + tokens | each token output → entity type |
| Question answering | [CLS] + question + [SEP] + paragraph | predict answer start + end positions |

Only the new layer learns from scratch. BERT's weights adjust slightly through fine-tuning.

---

## 3.4 GPT ★★★

**In one sentence:** A model trained to predict the next word — trained billions of times, it learned a surprisingly broad understanding of language.

### The Training Objective

GPT has one job: given all previous words, predict the next word.

```
  Input:  "The cat sat on the"
  Target: "mat"

  During training, all positions are predicted simultaneously using a mask:
  "The" predicts "cat"
  "The cat" predicts "sat"
  "The cat sat" predicts "on"
  etc.
```

**Why only look backwards?** This is called a **causal mask** — each position can only see past tokens. This makes GPT naturally suited for generation: you generate one word, add it to the input, generate the next.

### The Causal Mask

```
  Attention mask (1 = allowed, 0 = blocked):

         The  cat  sat  on
  The  [  1    0    0    0  ]  ← sees only itself
  cat  [  1    1    0    0  ]  ← sees "The" and itself
  sat  [  1    1    1    0  ]  ← sees "The cat sat"
  on   [  1    1    1    1  ]  ← sees everything so far

  Blocked positions → set to -infinity before softmax → e^(-∞) ≈ 0
```

### Scale: GPT-3

GPT-3 showed that scale creates emergent capabilities that smaller models don't have:

| Property | Value |
|----------|-------|
| Parameters | 175 billion |
| Layers | 96 |
| Attention heads | 96 per layer |
| Training tokens | 300 billion |
| Training cost | ~$4.6 million in GPU time |

At this scale, GPT-3 could do few-shot learning, arithmetic, code generation, and chain-of-thought reasoning — none of which were explicitly trained.

---

# PART 4: LANGUAGE MODELS & LLMs

---

## 4.1 Tokenization ★★

**In one sentence:** The process of splitting text into pieces (tokens) that the model can process — each piece gets a unique number.

### Why Not Just Use Words?

Words have problems:
- "run", "running", "ran" — are these three entries or one?
- "antidisestablishmentarianism" — one word, rare in training data
- Code, URLs, emojis — don't fit word boundaries

**Byte Pair Encoding (BPE)** solves this by learning a vocabulary of subwords.

### BPE Algorithm

```
  Start with characters as the vocabulary: {l, o, w, e, r, s, t, _}
  Training data: "low lower lowest"

  Iteration 1: Count pairs → (l,o) appears 3 times → merge to "lo"
  Iteration 2: (lo,w) appears 3 times → merge to "low"
  Iteration 3: (low,e) appears 2 times → merge to "lowe"
  ...continue until vocabulary reaches target size (e.g. 50,000)
```

**Result:**
- Common words → single token: "the" → [the]
- Rare words → subwords: "photosynthesis" → ["photo", "synthesis"]
- Unknown words → characters: "ChatGPT4" → ["Chat", "G", "PT", "4"]

Never hits an "unknown word" error.

### Context Window

Every LLM can only process a limited number of tokens at once. Beyond that limit, it can't "see" the earlier text.

| Model | Context Length |
|-------|---------------|
| GPT-2 | 1,024 tokens |
| GPT-3 | 2,048 tokens |
| GPT-4 | up to 128K tokens |
| Claude 3 | 200,000 tokens |
| LLaMA-3 8B | 8,192 tokens |

1 token ≈ 0.75 English words. 128K tokens ≈ ~100,000 words ≈ 3-4 novels.

---

## 4.2 Fine-Tuning Strategies ★★

**In one sentence:** Take a pre-trained model and continue training it on your specific task so it performs better there.

### The Analogy

Pre-training is like a university education — the model learns broadly about the world. Fine-tuning is like on-the-job training — it specializes for your specific role.

### Full Fine-Tuning

Update all weights in the model on your labeled dataset.

**Good:** Best possible performance on your task.

**Bad:** Requires enormous compute. BERT-base (110M params) is fine on one GPU. LLaMA-7B needs 4-8 high-end GPUs. GPT-3 (175B) is practically impossible.

Also risks **catastrophic forgetting** — the model overwrites general knowledge with task-specific knowledge.

### Adapter Layers

Freeze all original weights. Insert tiny "adapter" modules between the existing layers. Only train the adapters (~0.5% of parameters).

```
  [Frozen Layer] → Adapter (down → non-linear → up) → [Frozen Layer] → ...
```

### Prompt Tuning

Prepend a few "soft prompt" tokens to the input. These aren't real words — just learned embeddings. Train ONLY these tokens (100-1000 parameters). Freeze the entire model.

Surprisingly effective at 7B+ parameter scale.

---

## 4.3 LoRA — Low-Rank Adaptation ★★★

**In one sentence:** Fine-tune a tiny fraction of parameters (0.1%) by learning small updates to existing weight matrices instead of changing the whole matrix.

### The Intuition

When you fine-tune a model, the weight matrices don't change dramatically. The changes (ΔW) are actually "low-rank" — they can be approximated by multiplying two small matrices together.

Think of a shadow on a wall. The shadow is a complex 2D shape, but it's fully described by two simpler things: the 3D object casting it, and the angle of the light. Two simpler things × each other = one complex result. LoRA does the same with weight updates.

### How It Works

Instead of modifying the weight matrix W₀ directly, learn two small matrices A and B whose product approximates the needed change:

$$W_{\text{eff}} = W_0 + B \times A$$

$W_0$ is frozen (never changes). $B$ has shape $(d \times r)$ e.g. $(4096 \times 8)$. $A$ has shape $(r \times d)$ e.g. $(8 \times 4096)$. $r$ = rank, usually 4, 8, or 16.

**Parameter count:**

Full matrix $W_0$: $4096 \times 4096 = 16{,}777{,}216$ parameters

LoRA ($r = 8$): $4096 \times 8 + 8 \times 4096 = 65{,}536$ parameters -- 256x fewer parameters to train.

**At inference time:** Just add B×A to W₀ and use the result. Zero extra compute.

### In Practice

Fine-tuning LLaMA-7B:
- Full fine-tuning: 28 GB GPU memory, 7B trainable parameters
- LoRA (r=8): ~12 GB GPU memory, ~4M trainable parameters (0.06%)
- Quality: within a few percent of full fine-tuning for most tasks

LoRA is applied to the Q and V attention matrices by default, sometimes also K and the feed-forward layers.

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Full Fine-Tuning", "LoRA (r=8)"],
    "datasets": [
      {
        "label": "Trainable Parameters (millions)",
        "data": [7000, 4],
        "backgroundColor": ["rgba(239, 68, 68, 0.7)", "rgba(34, 197, 94, 0.7)"],
        "borderColor": ["rgba(239, 68, 68, 1)", "rgba(34, 197, 94, 1)"],
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "LoRA vs Full Fine-Tuning — 7B Model (99.94% Fewer Trainable Parameters!)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Parameters (millions)" }, "beginAtZero": true },
      "x": {}
    }
  }
}
```

---

## 4.4 RLHF — Reinforcement Learning from Human Feedback ★★★

**In one sentence:** A three-stage pipeline that teaches an LLM to produce outputs humans prefer — not just grammatically correct outputs.

### Why Next-Token Prediction Isn't Enough

A model trained only to predict the next token is fluent, but not necessarily helpful, honest, or harmless. It might generate plausible-sounding nonsense, dodge questions, or say harmful things. RLHF teaches the model what humans actually want.

**The analogy:** You hire a new employee (the pre-trained model). They can write, but not well. You train them with a manual (SFT). Then their manager reviews their work and ranks it (reward model). Then you coach them to always produce top-ranked work (RL fine-tuning).

### Stage 1 — Supervised Fine-Tuning (SFT)

Collect ~10,000 examples of ideal (prompt, response) pairs written by humans. Fine-tune the base LLM on these. Result: a model that follows instructions, but inconsistently.

### Stage 2 — Train a Reward Model

For each prompt, generate 4-9 different responses from the SFT model. Have human labelers rank them (which is better?).

Train a separate "reward model" on these rankings:

```
  Input:  (prompt, response) → Output: one number (quality score)
```

Training objective — push score(winning response) above score(losing response):

$$L = -\log\!\left(\sigma(s_{\text{win}} - s_{\text{lose}})\right)$$

After training, the reward model can score any new response without needing human input.

### Stage 3 — RL Fine-Tuning with PPO

Use the reward model as an automatic judge. The LLM generates responses, the reward model scores them, PPO updates the LLM to generate higher-scoring responses.

**The critical KL constraint:**

$$R_{\text{total}} = R_{\text{reward model}} - \beta \times D_{KL}(\pi \| \pi_{\text{SFT}})$$

The KL term penalizes the model for straying too far from its Stage 1 behavior. Without it, the model finds clever ways to fool the reward model (giving high-scoring gibberish). The KL term keeps it grounded.

**Result:** ChatGPT, Claude, Gemini — models that are actually helpful to use.

---

## 4.5 RAG — Retrieval-Augmented Generation ★★★

**In one sentence:** Instead of memorizing everything, the model looks up relevant information at query time and uses it to answer.

### The Problem

An LLM knows only what it was trained on. It doesn't know your company's internal documents, this week's news, or your private data. And you can't retrain it every time something changes.

**The open-book exam analogy:** Instead of forcing the student to memorize a 10,000-page library, let them bring the library to the exam and look things up.

### The RAG Pipeline

```
  SETUP (done once):
  ─────────────────────────────────────────────
  Your documents (PDFs, emails, docs)
    ↓
  Split into ~500-word chunks
    ↓
  Convert each chunk to a vector (using an embedding model)
    ↓
  Store all vectors in a vector database

  AT QUERY TIME:
  ─────────────────────────────────────────────
  User: "What's our return policy for digital products?"
    ↓
  Convert question to a vector
    ↓
  Find the 3-5 most similar document chunks (nearest neighbor search)
    ↓
  Add those chunks to the prompt:
  "Here are relevant documents: [chunk 1] [chunk 2]
   Question: What's our return policy for digital products?"
    ↓
  LLM generates answer grounded in the retrieved text
```

**Why it works better than fine-tuning for facts:**
- Update documents without retraining the model
- Can cite which document the answer came from
- No risk of hallucinating invented facts (it's reading from real text)

**Vector databases:** Pinecone, Weaviate, Chroma, FAISS (open-source), pgvector (Postgres extension).

---

# PART 5: GENERATIVE MODELS

---

## 5.1 Variational Autoencoders (VAE) ★

**In one sentence:** Learn a compact, organized representation of data that you can sample from to generate new examples.

### The Problem with Regular Autoencoders

A regular autoencoder compresses images to points in a "latent space." The problem: those points are scattered randomly with no structure. Pick a random point and the decoder outputs garbage.

**The filing cabinet analogy:**
- Regular AE: each photo gets filed in a random, unique location. No organization at all.
- VAE: photos get filed in organized neighborhoods. All cat photos are clustered together, all dog photos nearby, and you can interpolate between them.

### What VAE Does Differently

Instead of outputting a single point, the encoder outputs a **range** (a probability distribution):

```
  Regular AE:  input → encoder → z (specific point) → decoder → output
  VAE:         input → encoder → μ, σ (center and spread) → sample z → decoder → output
```

$\mu$ = center of the region, $\sigma$ = how wide it is.

**During generation:** Sample z from a standard normal distribution → decode → new image.

### The Training Objective (ELBO)

The loss has two parts:

1. **Reconstruction loss:** Can the decoder recreate the input from z? (Make the autoencoder accurate)
2. **KL divergence:** How different is the learned distribution from a standard normal?

$$L = L_{\text{reconstruction}} + D_{KL}\!\left(q(z|x) \| p(z)\right)$$

**KL Divergence in plain English:** "How many extra words do you need to describe your distribution, compared to just saying 'standard normal (0,1)'?" Lower KL = your distribution is closer to standard normal = better organized latent space.

The KL term forces all the neighborhoods (distributions for different inputs) to cluster near the center of the space and overlap each other. This creates the smooth, gap-free latent space needed for generation.

### The Reparameterization Trick

**Problem:** You can't backpropagate through a random sample. Gradients can't flow through "and then randomness happened."

**Solution:** Instead of sampling $z$ from $\mathcal{N}(\mu, \sigma)$, rewrite it as:

$$z = \mu + \sigma \times \epsilon \quad \text{where } \epsilon \sim \mathcal{N}(0, 1)$$

Now $z$ depends deterministically on $\mu$ and $\sigma$ (which the network controls).
The randomness ($\epsilon$) is "on the side" -- not part of the computation graph.
Gradients flow through $\mu$ and $\sigma$ normally.

Think of it this way: instead of "roll the dice and do something random," say "here is a fixed random number ε; your action = center + spread × ε." The network can now learn what the best center and spread are.

---

## 5.2 Diffusion Models ★

**In one sentence:** Learn to reverse a noise-adding process — train a network to slowly remove noise step by step, so you can turn pure static into a crisp image.

### The Core Idea

Take a photo. Add a tiny bit of noise. Add more. Keep adding for 1000 steps until it looks like pure TV static. Then train a neural network to reverse this process — given slightly noisy image, predict slightly-less-noisy image.

Once you've learned to reverse all 1000 steps, you can start from pure noise and generate a perfect image from nothing.

### Forward Process (Adding Noise — Fixed, No Training)

```
  Real photo x₀
    → add tiny noise → x₁
    → add more noise → x₂
    → ...
    → pure noise    → x₁₀₀₀
```

The noise added at each step follows a mathematical schedule (small amount early, larger amounts later).

**Key trick:** You can jump directly to any noise level without doing all intermediate steps:

$$x_t = \sqrt{\bar{\alpha}_t} \times x_0 + \sqrt{1 - \bar{\alpha}_t} \times \epsilon$$

$\bar{\alpha}_t$ is the "how much original image remains" factor. At $t = 0$, it's 1 (all original). At $t = 1000$, it's ~0 (pure noise).

### Reverse Process (Removing Noise — Learned)

A UNet is trained to look at a noisy image and predict: "what noise was added to get here?"

```
  UNet Input:  noisy image xₜ + time step t
  UNet Output: predicted noise ε̂
```

Training loss -- how different is predicted noise from actual noise?

$$L = \|\epsilon - \hat{\epsilon}\|^2$$

### Generating New Images

```
  1. Start with pure random noise
  2. For t = 1000, 999, ..., 1:
       Predict noise at this step
       Remove that noise → get slightly cleaner image
  3. After 1000 steps: clean generated image!
```

### Text-to-Image (DALL-E, Stable Diffusion)

To condition on text, add a cross-attention mechanism in the UNet. The text description (encoded by a text model like CLIP) is used to guide the denoising at every step.

```
  "a red cat on a blue chair"
    → text encoder → text embedding
    → cross-attention in UNet at every denoising step
    → each step removes noise guided by the text description
```

---

## 5.3 Contrastive Learning ★

**In one sentence:** Learn useful image representations without labels by teaching the model that two views of the same image should look similar.

### The Insight

Labels are expensive (pay a human to label millions of images). But you can create your own "free" supervision: two differently-cropped versions of the same image should have similar representations. A totally different image should have a different representation.

### SimCLR

```
  1. Take a batch of N images
  2. Apply two different random augmentations to each:
       dog photo → crop A (bright) → view₁
                → crop B (dark, flipped) → view₂
     These two views = "positive pair"
     All other 2(N-1) images in batch = "negatives"

  3. Pass all views through the same encoder
  4. NT-Xent loss:
       Pull view₁ and view₂ together (same image → similar representation)
       Push all negatives apart  (different images → different representations)
```

After training: discard the projection head, use the encoder for any downstream task (classification, retrieval, etc.).

**Key finding:** Batch size matters enormously. More images = more negatives = harder task = better representations. SimCLR used batches of 4096-8192.

### CLIP — Connecting Images and Text

CLIP trains on 400 million (image, text) pairs from the internet. The goal: matching pairs have similar embeddings; non-matching pairs don't.

```
  Image encoder (ViT/ResNet) → image embedding
  Text encoder (Transformer) → text embedding

  For a batch of N pairs:
  Similarity matrix N×N — maximize diagonal, minimize off-diagonal
```

**Zero-shot classification** (no task-specific training needed):

```
  Task: is this image a cat or dog?
  Create text prompts: "a photo of a cat" → embed → t_cat
                       "a photo of a dog" → embed → t_dog
  Embed the image → i
  Compare: cos(i, t_cat) = 0.85, cos(i, t_dog) = 0.12 → CAT
```

Works for any class you can describe in a sentence.

---

# PART 6: SPECIALIZED ARCHITECTURES

---

## 6.1 Graph Neural Networks (GNN)

**In one sentence:** Neural networks designed for data that has a graph structure (nodes connected by edges) rather than tabular or grid structure.

### When to Use

Most ML assumes your data is a table (rows and columns) or a grid (images). Many real problems aren't either:

- Social networks: people (nodes) + friendships (edges)
- Molecules: atoms (nodes) + chemical bonds (edges)
- Maps: cities (nodes) + roads (edges)
- Knowledge graphs: concepts (nodes) + relationships (edges)

### The Message Passing Algorithm

The core idea: each node collects information from its neighbors, combines it with its own information, and produces an updated representation.

```
  Round 1: each node knows only about its direct neighbors
  Round 2: each node knows about neighbors' neighbors
  Round K: each node has a summary of its K-hop neighborhood
```

**The math:**

```
  For each node v:
  step 1 — COLLECT: gather all neighbor nodes' current features
  step 2 — AGGREGATE: combine them (sum / average / max)
  step 3 — UPDATE: combine with own features using a small neural network
  step 4 — REPEAT for K rounds
```

**For graph-level tasks** (e.g., "is this molecule toxic?"): average or sum all node embeddings at the end to get one graph-level vector → classify.

### Real-World Applications

| Application | Nodes | Edges | Task |
|-------------|-------|-------|------|
| Drug discovery | atoms | chemical bonds | predict toxicity/effectiveness |
| Social networks | users | friendships | spam detection, recommendations |
| Google Maps | intersections | roads | predict travel time |
| AlphaFold | amino acids | spatial proximity | predict protein structure |

---

## 6.2 Mixture of Experts (MoE)

**In one sentence:** Split the network into many specialized sub-networks ("experts") and only activate the relevant ones for each input.

### The Idea

A hospital doesn't send every patient to every doctor. A cardiologist handles heart problems; a neurologist handles brain problems. You only see the relevant specialist.

MoE applies this to neural networks: instead of using ALL parameters for every input, route each token to the 2 most relevant "expert" sub-networks.

### How It Works

Replace each feed-forward layer in the Transformer with E expert layers + a router:

```
  Input token x
       ↓
  ROUTER: small network that picks the top-2 experts
  scores = softmax(W_router × x)
  pick expert 3 (score=0.4) and expert 17 (score=0.35)
       ↓
  output = 0.4 × Expert3(x) + 0.35 × Expert17(x)
```

**The math:**
- Total parameters: E × (parameters per expert) → much larger model
- Active parameters per token: 2/E of total → same compute as a smaller model

**Example:** Mixtral-8x7B has 8 experts, uses 2 at a time. Total params: ~46B. Active params per token: ~12B. Speed of a 12B model, quality of a 46B model.

**The routing problem:** Without intervention, all tokens route to the same 1-2 experts (because they're slightly better initially). Fix: add a "load balancing loss" that penalizes routing imbalance, forcing all experts to get roughly equal workload.

---

# PART 7: PRACTICAL DEEP LEARNING

---

## 7.1 Debugging Neural Networks

### Step 1 — Can it overfit one batch?

Take ONE batch of data (say 32 examples). Train on just those 32 examples for 100+ steps. Loss should approach zero.

If it doesn't: you have a bug. Check your architecture, loss function, or data pipeline. **Never skip this step.**

### Step 2 — Look at your data

Print 5 random training examples. Look at them with your eyes.

Common bugs found this way:
- Labels are shifted by 1 (off-by-one error in indexing)
- Images are normalized incorrectly (values out of expected range)
- Data augmentation is applied to the test set (should only be for training)
- Train/test split happens after normalization (causes data leakage)

### Step 3 — Start simple

Build a 1-layer version first. Get it working. Then add complexity. Never debug a complex architecture that was never simple to begin with.

### Step 4 — Monitor loss curves

```
  Healthy:
  loss ╲
       ╲──────────  (decreasing, then leveling off)

  LR too high (oscillating):
  loss ╲  ╱╲  ╱╲  (chaotic, never converging)

  LR too low (stuck):
  loss ╲──────────  (barely changing)

  Overfitting:
  train loss:    ╲────────  (keeps going down)
  val loss:      ╲──────╱   (starts going back up)
```

### Step 5 — Check gradient flow

```python
  for name, param in model.named_parameters():
      if param.grad is not None:
          print(f"{name}: {param.grad.norm():.4f}")
```

- Gradients near zero in early layers → vanishing gradient → add skip connections or BatchNorm
- Gradients are NaN or huge → exploding gradient → add gradient clipping
- A specific layer always has zero gradient → possible bug

### Step 6 — Check initial loss

With random weights, your initial loss should equal the loss of random guessing:

$$\text{2-class: } -\log(0.5) = 0.693$$

$$\text{10-class: } -\log(0.1) = 2.303$$

$$\text{100-class: } -\log(0.01) = 4.605$$

If your initial loss is very different, you have a bug in your loss function or model output.

### Step 7 — Remember train vs eval mode

```python
  model.train()   # activates dropout, uses batch statistics for BatchNorm
  model.eval()    # disables dropout, uses running statistics for BatchNorm
```

Forgetting `model.eval()` during testing is one of the most common bugs. BatchNorm in train mode makes test results unreliable.

### Step 8 — Find the best learning rate

Start with LR=1e-7. Train for 1 epoch, increasing LR exponentially each step. Plot loss vs LR. Choose the LR where loss drops fastest (just before the cliff where it explodes).

### Step 9 — Diagnose over/underfitting

```
  train loss much lower than val loss  →  overfitting
  Fix: more data, dropout, weight decay, data augmentation, smaller model

  train loss = val loss, both high  →  underfitting
  Fix: more layers, more neurons, more epochs, less regularization
```

### Step 10 — Set random seeds

```python
  torch.manual_seed(42)
  np.random.seed(42)
  random.seed(42)
```

If your model gives different results on the same data each run, you have unset seeds. Results must be reproducible.

---

## 7.2 Reading Training Curves

```
  SCENARIO 1: Good training
  train loss: ╲────── ← decreasing smoothly
  val loss:   ╲────── ← both decrease, gap is small

  SCENARIO 2: Overfitting
  train loss: ╲──────── ← keeps decreasing
  val loss:   ╲────╱    ← starts going back up!
  Action: add dropout/weight decay, get more data, use early stopping

  SCENARIO 3: Underfitting
  train loss: ╲────── ← levels off too high
  val loss:   ╲────── ← similar to train (not overfitting, just bad)
  Action: bigger model, more epochs, higher learning rate

  SCENARIO 4: Learning rate too high
  train loss: ╲╱╲╱╲   ← oscillating wildly
  Action: multiply learning rate by 0.1, add warmup

  SCENARIO 5: Learning rate too low
  train loss: ──────   ← barely moving
  Action: multiply learning rate by 10
```

```chart
{
  "type": "line",
  "data": {
    "labels": [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29],
    "datasets": [
      {
        "label": "Good Fit — Train",
        "data": [2.5,1.8,1.3,1.0,0.8,0.65,0.55,0.48,0.42,0.38,0.35,0.33,0.31,0.30,0.29],
        "borderColor": "rgba(34, 197, 94, 1)",
        "fill": false, "tension": 0.3, "pointRadius": 0, "borderWidth": 2
      },
      {
        "label": "Good Fit — Val",
        "data": [2.6,1.9,1.4,1.1,0.9,0.75,0.65,0.58,0.52,0.48,0.45,0.43,0.41,0.40,0.39],
        "borderColor": "rgba(34, 197, 94, 0.5)",
        "borderDash": [5,3],
        "fill": false, "tension": 0.3, "pointRadius": 0, "borderWidth": 2
      },
      {
        "label": "Overfitting — Train",
        "data": [2.5,1.6,1.0,0.6,0.35,0.2,0.12,0.08,0.05,0.03,0.02,0.015,0.01,0.008,0.005],
        "borderColor": "rgba(239, 68, 68, 1)",
        "fill": false, "tension": 0.3, "pointRadius": 0, "borderWidth": 2
      },
      {
        "label": "Overfitting — Val",
        "data": [2.6,1.7,1.2,0.9,0.75,0.7,0.72,0.78,0.85,0.92,1.0,1.05,1.1,1.15,1.2],
        "borderColor": "rgba(239, 68, 68, 0.5)",
        "borderDash": [5,3],
        "fill": false, "tension": 0.3, "pointRadius": 0, "borderWidth": 2
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Training Curves — Good Fit (Green) vs Overfitting (Red: Val Goes Back Up!)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Loss" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "Epoch" } }
    }
  }
}
```

---

## 7.3 Common Failure Modes

| Symptom | Most Likely Cause | Fix |
|---------|------------------|-----|
| Loss = NaN from step 1 | LR too large | Reduce LR by 100× |
| Loss doesn't decrease at all | LR too small, or forgot `.backward()` | Increase LR by 10× |
| 100% train accuracy, low val accuracy | Overfitting or data leakage | Regularize, check data split |
| Model always predicts the same class | Class imbalance | Use class weights or Focal Loss |
| GPU at 20%, training is slow | Data loading bottleneck | Increase `num_workers` |
| Out of memory | Batch too large | Halve batch size |
| Test performance much worse than train | Forgot `model.eval()` | Add `model.eval()` before testing |
| Very deep network won't train | Vanishing gradients | Add skip connections + BatchNorm |
| RNN output degrades after 30+ steps | Vanishing gradients over time | Switch to LSTM/GRU + gradient clipping |

---

## 7.4 Framework Guide

### PyTorch — Recommended for Most Use Cases

- Dynamic computation graph: easy to debug (just print tensors anywhere)
- Industry standard for research papers and production
- Huge ecosystem: Hugging Face, PyTorch Lightning, fastai

```python
  import torch
  import torch.nn as nn

  model = nn.Sequential(nn.Linear(10, 64), nn.ReLU(), nn.Linear(64, 1))
  optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)

  output = model(input)
  loss = criterion(output, target)
  loss.backward()
  optimizer.step()
```

### TensorFlow / Keras — Google's Framework

- Keras API is beginner-friendly (`model.fit()`, `model.predict()`)
- Better mobile/edge deployment with TFLite
- Less popular in research since ~2019, but still common in production

### JAX — Cutting-Edge Research

- NumPy-style API + automatic differentiation
- Extremely fast on TPUs
- `@jax.jit` compiles code to run like C
- Steeper learning curve
- Used at Google DeepMind, Anthropic, and other research labs

### Which to Choose?

| Goal | Recommendation |
|------|---------------|
| Learning deep learning | PyTorch + Hugging Face |
| Academic research | PyTorch (standard in papers) |
| Mobile/edge deployment | TensorFlow Lite |
| Google TPU access | JAX |
| Quick prototyping | Keras |

---

# QUICK REFERENCE

---

## What Architecture Should I Use?

| Data Type | Recommended Architecture |
|-----------|--------------------------|
| Images | ResNet (standard), ViT (large dataset), EfficientNet (efficiency) |
| Image detection | YOLO |
| Image segmentation | U-Net |
| Text understanding | BERT family (classification, NER, Q&A) |
| Text generation | GPT family (chat, summarization, completion) |
| Short sequences | LSTM / GRU |
| Long sequences | Transformer |
| Graphs | GNN (message passing) |
| Tabular data | XGBoost / LightGBM first — neural nets rarely win here |
| Generating images | Diffusion model |
| Learning without labels | SimCLR (images), CLIP (image+text) |

---

## Hyperparameter Starting Points

| Setting | Good starting value |
|---------|-------------------|
| Learning rate (Adam) | 3e-4 |
| Learning rate (SGD) | 0.01 |
| Optimizer (Transformers) | AdamW |
| Optimizer (CNNs) | SGD + Momentum (often beats Adam) |
| Batch size | 32 |
| Weight decay | 0.01 (Transformers), 1e-4 (CNNs) |
| Dropout | 0.1 (Transformers), 0.3-0.5 (FC layers) |
| Gradient clip | max_norm=1.0 |
| LR schedule | Cosine decay; add warmup for Transformers |
| Warmup | 5-10% of total training steps |
| LoRA rank | 8 (start here, try 4 or 16 if needed) |
| Epochs | Use early stopping |

---

## Master Cheat Sheet

```
TRAINING
  Backprop     = chain rule, compute gradient for every weight in one pass
  Adam         = momentum + adaptive rates; AdamW for Transformers
  Focal Loss   = for class imbalance; Triplet Loss = for similarity tasks
  BatchNorm    = for CNNs; LayerNorm = for Transformers
  Gradient clip (norm=1.0) + BF16 = standard LLM training setup

COMPUTER VISION
  LeNet → AlexNet → VGG → ResNet → EfficientNet → ViT  (historical order)
  ResNet skip connections = solved very deep network training
  YOLO = real-time object detection
  U-Net = pixel-level segmentation

TRANSFORMERS & LLMs
  Self-attention: Q,K,V → softmax(QKᵀ/√d) × V
  BERT = reads both directions → best for understanding tasks
  GPT = reads left-to-right → best for generation tasks
  BPE = tokenization that handles any word
  LoRA = fine-tune 0.1% of params, nearly same quality as full training
  RLHF = SFT → Reward Model → PPO (with KL penalty to stay on track)
  RAG = retrieve relevant documents → add to prompt → generate

GENERATIVE MODELS
  VAE = encode to distribution, not a point; reparameterization trick
  Diffusion = learn to reverse noise → DALL-E, Stable Diffusion, Midjourney
  CLIP = image + text trained together → zero-shot classification

DEBUGGING (in order)
  1. Overfit one batch first
  2. Look at your data with your eyes
  3. Check initial loss matches random-chance baseline
  4. Monitor gradient norms per layer
  5. Always call model.eval() before testing
```

---

## Review Questions — Test Your Understanding

1. In backpropagation, what does the chain rule allow us to compute? Why is it necessary?
2. Why is Adam generally preferred over plain SGD? In what situation might SGD with momentum actually work better?
3. Explain what a convolution layer does in a CNN. Why is it better than a fully connected layer for images?
4. What is self-attention? In one sentence, what question does it answer for each token?
5. What's the key difference between an encoder (BERT) and a decoder (GPT) Transformer?
6. Compare GANs and Diffusion Models — how does each generate images?
7. You're fine-tuning a pre-trained ResNet-50 on a small medical imaging dataset (500 images). What should you freeze and what should you train?

<details>
<summary>Answers</summary>

1. The chain rule lets us compute the gradient of the loss with respect to any weight, even weights deep in the network, by multiplying gradients along the path from loss to that weight. It's necessary because weights in early layers don't directly affect the loss — their effect passes through many intermediate layers.
2. Adam adapts the learning rate per-parameter (frequent updates get smaller steps, rare updates get larger steps) and uses momentum. This makes it faster to converge. However, SGD with momentum can sometimes generalize BETTER on large, well-tuned training runs (common finding in image classification benchmarks).
3. A convolution layer slides a small filter (e.g., 3x3) across the image, detecting local patterns (edges, textures). It's better than fully connected because: (a) it shares weights (same filter everywhere = fewer parameters), (b) it captures spatial locality (nearby pixels matter more than distant ones), (c) it's translation-invariant (detects a cat whether it's top-left or bottom-right).
4. Self-attention lets each token look at every other token in the sequence and decide which ones are relevant. It answers: "Given who I am, which other tokens should I pay attention to, and how much?"
5. Encoder (BERT): sees ALL tokens at once (bidirectional), great for understanding/classification. Decoder (GPT): sees only PREVIOUS tokens (autoregressive, left-to-right), great for generation. BERT fills in blanks; GPT predicts what comes next.
6. GANs: two networks compete — a Generator creates fake images, a Discriminator tries to detect fakes. They improve through adversarial training. Diffusion Models: start with pure noise and gradually denoise it step by step into a clean image, guided by a learned denoising network. Diffusion is currently dominant (Stable Diffusion, DALL-E 3) due to more stable training.
7. Freeze all layers except the last few (or just the final classification head). With only 500 images, training the whole network would overfit badly. The early layers already know how to detect edges, textures, and shapes from ImageNet pre-training. Only fine-tune the final layers to adapt those features to your medical task. Also use data augmentation.
</details>

---

**Previous:** [Chapter 11 — Model Evaluation](11_model_evaluation.md)
