# Chapter 10 — Neural Networks & Deep Learning

---

## What You'll Learn

After reading this chapter, you will be able to:
- Explain how an artificial neuron works (weighted sum + activation)
- Describe the architecture of a neural network (input, hidden, output layers)
- Choose the right activation function for each layer
- Walk through backpropagation step by step
- Explain how CNNs process images using convolution and pooling
- Describe how RNNs and LSTMs handle sequential data
- Apply regularization techniques (Dropout, Batch Normalization) to prevent overfitting
- Know when neural networks are overkill vs when they shine

---

## What is a Neural Network?

### Simple Explanation
Your brain has ~86 billion neurons (nerve cells) connected to each other.
When you see a cat, signals fire between neurons until your brain says "CAT!"

Artificial Neural Networks (ANNs) are a simplified **software imitation** of this.
Instead of biological neurons, we have mathematical functions connected together.

```
BIOLOGICAL NEURON:              ARTIFICIAL NEURON:
────────────────────────        ──────────────────────────────
      signals in                   inputs (x₁, x₂, x₃)
      /    │    \                      │    │    │
 ────/─────┼─────\───               w₁   w₂   w₃
     \     │     /          multiply by weights
  Dendrites     (receive)
          │                    z = w₁x₁ + w₂x₂ + w₃x₃ + b
          │ Cell body                       │
          │ (processes)               activation f(z)
          │                                │
    Axon  │ (output)                       ▼
          ▼                          output (e.g. 0.85)
     next neurons
```

**Official Definition:**
> An **Artificial Neural Network (ANN)** is a computational model inspired by biological
> neural networks. It consists of layers of interconnected nodes (neurons), where each
> connection has a weight. The network learns by adjusting these weights to minimize
> prediction error through backpropagation.

---

## 8.1 The Architecture: Layers

```
INPUT LAYER          HIDDEN LAYERS          OUTPUT LAYER
────────────         ─────────────          ────────────

 x₁ ──────┐          ┌───┐   ┌───┐          ┌───┐
           ├─────────►│   ├──►│   ├─────────►│   │ → "Cat"  (0.90)
 x₂ ──────┤          │   │   │   │          │   │
           ├─────────►│   ├──►│   ├─────────►│   │ → "Dog"  (0.07)
 x₃ ──────┤          │   │   │   │          │   │
           ├─────────►│   ├──►│   ├─────────►│   │ → "Bird" (0.03)
 x₄ ──────┘          └───┘   └───┘          └───┘

 Takes raw           Transforms data;        Final
 features            learns complex          prediction
                     patterns step           (softmax gives
                     by step                 probabilities)

 Each arrow = one WEIGHT (a number learned from training data)
```

### Fully Connected (Dense) Layer

```
Every neuron in layer L connects to EVERY neuron in layer L+1:

Layer A (3 neurons):         Layer B (4 neurons):

    ●──────────────────────── ●
    ●────────────────────────  ●
    ●────────────────────────  ●
       ╲╲╲──────────────────── ●
    (3 × 4 = 12 weights in this one layer pair)

Total weights in a network = sum of (layerₙ × layerₙ₊₁) for all layers.
A 784→512→256→10 network has 784×512 + 512×256 + 256×10 = 534,272 weights!
```

---

## 8.2 Activation Functions

### Why They Matter

```
WITHOUT activation functions:
  Layer 1: output = W₁·x + b₁
  Layer 2: output = W₂·(W₁·x + b₁) + b₂
                  = (W₂W₁)·x + (W₂b₁+b₂)
                  = W·x + b   ← still just a linear function!

  No matter how many layers you stack, it collapses to one linear function.
  A single neuron could replace the entire network!

WITH activation functions:
  f(W·x + b) is non-linear → deep networks can learn ANY function.
```

### The Main Activation Functions

```
  SIGMOID                              ReLU (Rectified Linear Unit)
  ───────                              ─────────────────────────────
  σ(z) = 1 / (1 + e^(-z))             f(z) = max(0, z)
  Output: (0, 1)                       Output: [0, ∞)

  1.0│             ────────            5│              /
  0.8│          ──/                    4│             /
  0.5│─────────/   ← S-curve          3│            /
  0.2│        /                        2│           /
  0.0│────────                         1│          /
     └──────────── z                   0│──────────────── z
      -6   -3   0   3   6              -3 -2 -1   0  1  2  3

  Use for: output layer (binary   Use for: hidden layers — default!
  classification), gates in LSTM  Simple, fast, doesn't saturate
  Problem: saturates at extremes  Problem: "Dying ReLU" (see below)

  ─────────────────────────────────────────────────────────────────

  TANH                                 SOFTMAX
  ────                                 ───────
  f(z) = (eᶻ − e⁻ᶻ) / (eᶻ + e⁻ᶻ)    Converts raw scores to
  Output: (−1, 1)                      probabilities (sum = 1)

   1│            ─────                 [2.0, 1.0, 0.1]  ← raw logits
    │          /                            ↓ softmax
   0│─────────/                       [0.65, 0.24, 0.11]
    │        /                          Cat   Dog  Bird ← PICK CAT
  -1│────────                            65%   24%  11%
    └──────── z
                                     Use for: multi-class output layer
  Use for: RNN/LSTM hidden states    Each class gets a probability!
```

### Dying ReLU Problem & Leaky ReLU

```
  DYING ReLU:
  ──────────────────────────────────────────────────────────
  If a neuron's input is always negative:
    ReLU output = max(0, z) = 0 for all inputs
    Gradient = 0 → weight never updates → neuron is "dead"

  Dead neurons are useless — they contribute nothing.
  This can happen to 10–40% of neurons in deep networks.

  SOLUTION: Leaky ReLU
  ──────────────────────────────────────────────────────────
  f(z) = z        if z > 0
       = α × z    if z ≤ 0   (α is small, e.g. 0.01)

  5│              /
  2│             /
  0│────────────/──────── z
 -1│   ╲ slope α           small slope instead of flat 0
 -3│    ╲                  keeps gradient flowing!

  Keeps ALL neurons trainable. Used when you see dead neurons.
```

### GELU (Modern Transformers)

```
  GELU (Gaussian Error Linear Unit):
  f(z) = z × Φ(z)    where Φ is the Gaussian CDF

  Shape: similar to ReLU but smooth, no hard zero.
  Used in: BERT, GPT-2, GPT-3, ViT, and most modern Transformers.
  Why: smoother gradient → stabler training in very deep networks.
```

### When to Use Which

```
┌──────────────────┬─────────────────────────────────────────────────┐
│ Location         │ Recommended Activation                          │
├──────────────────┼─────────────────────────────────────────────────┤
│ Hidden layers    │ ReLU (default), Leaky ReLU if dying neurons     │
│ (MLP/CNN)        │ GELU for Transformer-like architectures         │
├──────────────────┼─────────────────────────────────────────────────┤
│ Output: binary   │ Sigmoid (outputs P(y=1))                        │
│ classification   │                                                 │
├──────────────────┼─────────────────────────────────────────────────┤
│ Output: multi-   │ Softmax (outputs probability distribution)      │
│ class            │                                                 │
├──────────────────┼─────────────────────────────────────────────────┤
│ Output: multi-   │ Sigmoid per output (probabilities independent)  │
│ label            │                                                 │
├──────────────────┼─────────────────────────────────────────────────┤
│ Output:          │ None / Linear (predict any real number)         │
│ regression       │                                                 │
├──────────────────┼─────────────────────────────────────────────────┤
│ RNN/LSTM gates   │ Sigmoid (gates: 0=close, 1=open)               │
│ RNN/LSTM values  │ Tanh (values: −1 to 1, centered)               │
└──────────────────┴─────────────────────────────────────────────────┘
```

---

## 8.3 How Networks Learn: Backpropagation

### The 4-Step Training Loop

```
STEP 1: FORWARD PASS — make a prediction
─────────────────────────────────────────────────────────────
  Input x ──► Layer 1 ──► Layer 2 ──► Output ŷ

STEP 2: COMPUTE LOSS — measure how wrong we are
─────────────────────────────────────────────────────────────
  Loss = f(ŷ, y)   (e.g., cross-entropy or MSE)

STEP 3: BACKWARD PASS — compute how each weight contributed
─────────────────────────────────────────────────────────────
  Propagate error BACKWARDS using the chain rule:

  dLoss/dw₁ = dLoss/dŷ × dŷ/dLayer2 × dLayer2/dLayer1 × dLayer1/dw₁
                ────────────────────────────────────────────────────
                    multiply partial derivatives through layers

STEP 4: UPDATE WEIGHTS — nudge weights to reduce loss
─────────────────────────────────────────────────────────────
  w ← w − α × dLoss/dw    (gradient descent)

Repeat for thousands of batches × epochs until loss is small.
```

### Worked Example (One Neuron)

```
  Neuron: z = 2×x + 1   (w=2, b=1)
  Activation: sigmoid σ(z)
  Input: x = 1.0 → z = 3.0 → ŷ = σ(3.0) = 0.95
  True label: y = 0.0
  Loss (BCE): L = −[0×log(0.95) + 1×log(0.05)] = 3.0

  Backward pass (chain rule):
  dL/dŷ  = −y/ŷ + (1−y)/(1−ŷ) = 0 + 1/0.05 = 20.0
  dŷ/dz  = σ(z)(1−σ(z)) = 0.95×0.05 = 0.047
  dz/dw  = x = 1.0

  dL/dw  = 20.0 × 0.047 × 1.0 = 0.95

  Update (α = 0.1):
  w_new = 2.0 − 0.1 × 0.95 = 1.905  ← weight moved slightly!
```

---

## 8.4 Vanishing & Exploding Gradients

### Simple Explanation
Imagine a game of telephone with 50 people in a chain. You whisper a message at one end.
By the time it reaches the other end, it might be completely silent (vanished) or
distorted into shouting (exploded). Neural networks have the same problem!

When training, error signals travel backwards through all the layers. If they shrink
a tiny bit at each layer, by the time they reach the first layers they're basically zero —
those layers learn nothing. If they grow at each layer, they explode into chaos.
Both break the network.

### Why It Happens

```
  During backprop through L layers, gradient multiplies L times:

  dL/dw₁ ≈ δₗ × δₗ₋₁ × δₗ₋₂ × ... × δ₁
             └──────────────────────────┘
                   L multiplications

  VANISHING (common with sigmoid/tanh):
  ──────────────────────────────────────────────────────────────
  σ'(z) = σ(z)(1−σ(z)) ≤ 0.25      (max gradient of sigmoid)
  Through 10 layers: 0.25^10 ≈ 0.000001

  Layer 1 gets gradient ≈ 0 → learns nothing → stuck!
  RNNs suffer this over many time steps.

  EXPLODING (can happen with large weights or deep networks):
  ──────────────────────────────────────────────────────────────
  If gradient > 1, e.g., 2.0 per layer:
  Through 10 layers: 2^10 = 1024

  Weights explode → NaN → training crashes.
  Common in RNNs trained on long sequences.
```

### Solutions

```
┌──────────────────────────┬──────────────────────────────────────────┐
│ Problem                  │ Solution                                 │
├──────────────────────────┼──────────────────────────────────────────┤
│ Vanishing gradients      │ Use ReLU instead of sigmoid/tanh         │
│ (activation saturation)  │ (ReLU gradient = 1 for z > 0, no decay) │
├──────────────────────────┼──────────────────────────────────────────┤
│ Vanishing gradients      │ Batch Normalization                       │
│ (deep networks)          │ Keeps activations in good range          │
├──────────────────────────┼──────────────────────────────────────────┤
│ Vanishing over time      │ LSTM / GRU (gating mechanisms)           │
│ (RNNs with long seqs.)   │ Cell state highway bypasses gradient     │
├──────────────────────────┼──────────────────────────────────────────┤
│ Vanishing in very deep   │ Residual / Skip connections (ResNet)     │
│ networks (50+ layers)    │ Gradient flows directly to early layers  │
├──────────────────────────┼──────────────────────────────────────────┤
│ Exploding gradients      │ Gradient Clipping                        │
│                          │ if ‖grad‖ > threshold: scale it down    │
├──────────────────────────┼──────────────────────────────────────────┤
│ Both                     │ Careful weight initialization            │
│                          │ (Xavier for tanh, He for ReLU)          │
└──────────────────────────┴──────────────────────────────────────────┘
```

---

## 8.5 Weight Initialization

### Simple Explanation
You can't start with all weights = 0! Every neuron would compute the same output,
receive the same gradient, and update identically. They'd never become different.
It's like a class where every student copies the exact same answer — no diversity.

### The Zero-Init Problem (Symmetry Breaking)

```
  All weights = 0:
  ─────────────────────────────────────────────────────────────
  z₁ = 0×x₁ + 0×x₂ = 0      All neurons in layer get z = 0
  z₂ = 0×x₁ + 0×x₂ = 0      All activations are equal
                              All gradients are equal
  ↓                           All weights update identically
  Every hidden neuron         → they're all still the same!
  stays identical forever     Network has effectively 1 neuron.
```

### Xavier / Glorot Initialization (for sigmoid, tanh)

```
  Goal: keep the variance of activations roughly the same across layers.
  If weights are too large → activations explode.
  If weights are too small → activations shrink to 0.

  Xavier: initialize weights from:
    Uniform: w ~ U[−√(6/(nᵢₙ+nₒᵤₜ)), +√(6/(nᵢₙ+nₒᵤₜ))]
    Normal:  w ~ N(0, √(2/(nᵢₙ+nₒᵤₜ)))

    where nᵢₙ = neurons in previous layer, nₒᵤₜ = neurons in current

  Works well for: sigmoid, tanh (activations symmetric around 0)
```

### He Initialization (for ReLU)

```
  ReLU kills ~50% of neurons (outputs 0 for negative z).
  This effectively halves the variance at each layer.
  Xavier doesn't account for this.

  He: w ~ N(0, √(2/nᵢₙ))   ← doubles the variance to compensate

  Works well for: ReLU, Leaky ReLU, GELU

  Rule: use He for ReLU networks, Xavier for sigmoid/tanh.
        Modern frameworks (PyTorch, Keras) do this automatically!
```

---

## 8.6 Dropout

### Simple Explanation
During training, randomly turn off (drop) some neurons. The network can't rely
on any single neuron — it must learn redundant representations. It's like training
a sports team by randomly benching players — everyone has to learn every position!

### How Dropout Works

```
  TRAINING (dropout active):
  ─────────────────────────────────────────────────────────────
  Full layer (8 neurons):   ● ● ● ● ● ● ● ●
                                 ↓  dropout p=0.5
  After dropout (4 kept):   ● ✗ ● ✗ ● ● ✗ ●
                                ✗ = set to 0

  Forward pass uses ONLY the surviving neurons.
  Backward pass only updates surviving neurons.
  A different random subset is dropped each training step!

  INFERENCE (dropout OFF):
  ─────────────────────────────────────────────────────────────
  ALL neurons are active.
  To compensate (neurons weren't dropped during inference),
  scale outputs by (1 − p):

  If p = 0.5: output × 0.5   ← halve activations at test time
  (PyTorch uses "inverted dropout": scale during training instead,
   so inference code doesn't change — more convenient)
```

### Typical Dropout Rates

```
┌──────────────────────────────┬────────────────────────────────────┐
│ Layer Type                   │ Typical Dropout Rate               │
├──────────────────────────────┼────────────────────────────────────┤
│ Fully connected hidden layer │ 0.3 – 0.5                         │
│ Convolutional layer          │ 0.1 – 0.2 (lower; fewer params)   │
│ Output layer                 │ 0 (never drop output neurons!)     │
│ Transformer (attention/FFN)  │ 0.1                                │
└──────────────────────────────┴────────────────────────────────────┘

Too high dropout → underfitting (not enough neurons to learn)
Too low dropout → overfitting (neurons still co-adapt)
```

**Official Definition:**
> **Dropout** is a regularization technique where each neuron is independently set to
> zero during training with probability p. This prevents neurons from co-adapting and
> forces the network to learn more robust distributed representations. At inference,
> all neurons are active and outputs are scaled to match expected values.

---

## 8.7 Batch Normalization

### Simple Explanation
Each layer's inputs should be stable — not wildly different in scale each batch.
Batch Norm normalizes each layer's activations to mean ≈ 0, std ≈ 1, then lets
the network learn the best scale and shift via trainable parameters γ and β.

```
WITHOUT Batch Norm:            WITH Batch Norm:
────────────────────────       ────────────────────────────────
Layer 1 output: [0.1, 900, 3]  Layer 1 output: [−0.5, 1.2, 0.1]
                                                (normalized!)
Layer 2 gets huge range →      Layer 2 gets stable inputs →
slow/unstable training         faster, more stable training

FORMULA (for a mini-batch B):
──────────────────────────────────────────────────────────────
  μ_B  = (1/m) Σ xᵢ              ← batch mean
  σ²_B = (1/m) Σ (xᵢ − μ_B)²    ← batch variance
  x̂ᵢ  = (xᵢ − μ_B) / √(σ²_B + ε)  ← normalize (ε prevents ÷0)
  yᵢ  = γ × x̂ᵢ + β              ← scale + shift (learned!)

γ and β are learned — the network can choose to undo normalization
if that turns out to be optimal (flexible, not forced).
```

**Why Batch Norm helps:**
- Allows higher learning rates → faster training
- Reduces sensitivity to weight initialization
- Acts as mild regularization (adds noise via batch stats)
- Used in virtually every modern CNN; also in Transformers (as Layer Norm)

---

## 8.8 Learning Rate Schedules

### Why a Constant Learning Rate is Not Ideal

```
  EARLY TRAINING: need large steps to escape bad initial weights
  LATE TRAINING:  need small steps to converge precisely into minimum

  ┌───────────────────────────────────────────────────────────────┐
  │ Large LR throughout → oscillates around minimum, won't settle │
  │ Small LR throughout → very slow, gets stuck in bad positions  │
  │ Scheduled LR      → fast start, precise finish               │
  └───────────────────────────────────────────────────────────────┘
```

### Common Schedules

```
  STEP DECAY:
  ─────────────────────────────────────────────────────────────
  LR
  0.1│──────────────┐
  0.01│              └────────────┐
  0.001│                          └──────────────
       └─────────────────────────────── epoch
        0   10   20   30   40   50

  Divide LR by 10 every N epochs. Simple, widely used.

  COSINE ANNEALING:
  ─────────────────────────────────────────────────────────────
  LR
  0.1│╲
  0.05│  ╲__
  0.01│      ╲___________
  0.001│                   ╲_____________
       └─────────────────────────────── epoch

  LR = LR_min + 0.5 × (LR_max − LR_min) × (1 + cos(πt/T))
  Smooth decay. Popular in CV and NLP.

  WARMUP + COSINE DECAY (Transformer standard):
  ─────────────────────────────────────────────────────────────
  LR
      │      ╱╲
      │     ╱  ╲___________
      │    ╱               ╲_______
      │   ╱                        ╲____
      └───────────────────────────────── step
          ↑ warmup ↑ cosine decay

  Start with very small LR, ramp up, then decay.
  Why warmup? Large initial LR + random weights = exploding updates.
  Warmup lets weights settle first.
```

---

## 8.9 Convolutional Neural Networks (CNN)

### When to Use
Images, video, audio spectrograms — any data with **spatial structure**
where nearby values are related (pixels near each other often share features).

### How Convolution Works

```
  IMAGE PATCH (4×4):         FILTER/KERNEL (3×3):   OUTPUT (one value):
  ─────────────────          ────────────────────   ──────────────────
  ┌───────────────┐          ┌─────────────┐
  │  1  2  3  4  │          │  1   0  −1  │         Sum of
  │  5  6  7  8  │    ×     │  1   0  −1  │  ──►   elementwise
  │  9 10 11 12  │          │  1   0  −1  │         products
  │ 13 14 15 16  │          └─────────────┘
  └───────────────┘
  Slide filter across entire image (step = stride), computing one
  output value per position. Each filter detects ONE pattern.
  A CNN learns MANY filters (edges, curves, textures, faces...).
```

### Pooling

```
  After convolution: feature maps are still large.
  Pooling REDUCES spatial size while keeping important information.

  MAX POOLING (2×2, stride 2):
  ──────────────────────────────────────────────
  Input (4×4):              Output (2×2):
  ┌─────────────────┐       ┌──────────┐
  │  1   3 │  2   4 │       │   3  │  4│
  │  5   6 │  8   2 │  ──►  │   6  │  8│
  ├─────────────────┤       └──────────┘
  │  3   7 │  1   9 │
  │  2   4 │  6   5 │
  └─────────────────┘
  Take MAX value in each window. Halves width and height.
  Keeps strongest signal, discards weak activations.
  Adds translation invariance: cat shifted 2 pixels → same output.
```

### Feature Hierarchy

```
  This is CNN's most powerful property — each layer detects MORE complex features:

  Input Image ──► Early Layers ──► Middle Layers ──► Late Layers ──► Output
  (raw pixels)    Edges, lines    Textures, curves  Eyes, wheels,   "Cat"
                                                    faces, shapes

  Layer 1 neurons respond to: /  \  —  |  (oriented edges)
  Layer 3 neurons respond to: curves, circles, fur texture
  Layer 5 neurons respond to: eyes, ears, cat face
  Layer 7 neurons respond to: entire cat concept

  This hierarchy emerges automatically from training!
  You don't design these features — they're learned.
```

### Stride and Padding

```
  STRIDE = how many pixels the filter moves each step
  ──────────────────────────────────────────────────────
  Stride 1: slide one pixel at a time → large output, fine detail
  Stride 2: slide two pixels → half the output size (like pooling)

  PADDING = adding zeros around the image border
  ──────────────────────────────────────────────────────
  Without padding: each convolution SHRINKS the output
    Input 5×5, filter 3×3, stride 1 → output 3×3

  With "same" padding (zeros around border):
    Input 5×5, filter 3×3, stride 1 → output 5×5 (same size!)
    Lets you stack many conv layers without shrinking to nothing.
```

### ResNet: Skip Connections

```
  PROBLEM: Very deep networks (50+ layers) are HARDER to train,
  not easier. Vanishing gradients kill early layers. Even accuracy
  on training data gets worse with more layers!

  SOLUTION: Skip connections (residual connections)

  Without skip:                 With skip (ResNet):
  ─────────────────             ──────────────────────────────
  x ──► Layer ──► y             x ──► Layer ──► (+) ──► y
                                │                ▲
                                └────────────────┘
                                       x is ADDED to the output

  What does this do?
  ─────────────────────────────────────────────────────────
  The layer only needs to learn the RESIDUAL (the change):
    y = F(x) + x   → F(x) = y − x   (just the adjustment)

  If F(x) ≈ 0: layer passes input unchanged (identity shortcut)
  Gradient can flow directly through the skip connection →
  no vanishing even in 152-layer deep networks!

  ResNet-50 (2015) → won ImageNet. Skip connections are now
  standard in all deep networks (CNNs, Transformers, etc.)
```

---

## 8.10 Recurrent Neural Networks (RNN) & LSTM

### When to Use
Sequences where ORDER matters: text, time series, audio, video.
Standard neural networks treat all inputs independently — they can't
remember that "Paris" appeared 10 words ago and matters now.

```
  STANDARD NN:                    RNN:
  ─────────────────               ──────────────────────────────────
  Input → Output                  "I love ___"
  (each input independent)              │
                                        ▼
                                ┌───────────────┐  ← hidden state
                     "I"  ────► │   RNN Cell    │    (memory)
                                │               │
                   "love" ────► │    hₜ = f(    │
                                │     Wₓxₜ +    │
                    "___" ────► │     Wₕhₜ₋₁)  │ ──► "pizza"
                                └───────────────┘

  The cell has MEMORY — hₜ (hidden state) carries info forward.
```

### Vanishing Gradient in RNNs

```
  For a sequence of length T, backprop multiplies gradient T times:

  "Mary, who grew up in Paris and studied at the Sorbonne, loves ___"
   ▲                                                              │
   └─────────── gradient must flow back 15+ steps ───────────────┘
                multiplied by Wₕ^T at each step

  If max eigenvalue of Wₕ < 1: gradient → 0 (RNN forgets Mary)
  If max eigenvalue of Wₕ > 1: gradient → ∞ (explodes)

  Solution: LSTM (below) and GRU (Section 8.11).
```

### LSTM (Long Short-Term Memory)

```
  Key notation:
    σ    = sigmoid: outputs (0, 1) — used as "gates" (0=close, 1=open)
    tanh = hyperbolic tangent: outputs (−1, 1) — used for values

  LSTM has a CELL STATE (long-term memory) + THREE GATES:
  ──────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────┐
  │                         LSTM CELL                              │
  │   Cell State: Cₜ ─────────────────────────────────────────►  │
  │               (long-term memory, information "highway")        │
  │                    ↑modify              ↑modify                │
  │                                                                │
  │  FORGET GATE  "What old memory should I erase?"               │
  │  fₜ = σ(Wf·[hₜ₋₁, xₜ] + bf)   → (0, 1)                     │
  │  0 = erase completely, 1 = keep fully                          │
  │  Example: just saw end of paragraph → forget old topic         │
  │                                                                │
  │  INPUT GATE   "What new info should I write to memory?"        │
  │  iₜ = σ(Wi·[hₜ₋₁, xₜ] + bi)   → (0, 1) decide relevance    │
  │  C̃ₜ = tanh(Wc·[hₜ₋₁, xₜ] + bc) → (−1,1) candidate value   │
  │  Add: iₜ × C̃ₜ to cell state                                  │
  │  Example: new subject introduced → store it                    │
  │                                                                │
  │  CELL UPDATE:  Cₜ = fₜ × Cₜ₋₁ + iₜ × C̃ₜ                   │
  │  (forget some old, add some new)                               │
  │                                                                │
  │  OUTPUT GATE  "What to output this step?"                      │
  │  oₜ = σ(Wo·[hₜ₋₁, xₜ] + bo)   → (0, 1) gate                │
  │  hₜ = oₜ × tanh(Cₜ)            → filtered cell state         │
  │  Example: predicting next word → output relevant memory        │
  └────────────────────────────────────────────────────────────────┘
```

**Official Definition:**
> **LSTM** is an RNN variant with a gated cell state (long-term memory) and three
> multiplicative gates (forget, input, output) that control information flow.
> The cell state acts as a direct pathway for gradients, resolving the vanishing
> gradient problem in standard RNNs over long sequences.

---

## 8.11 GRU (Gated Recurrent Unit)

### Simple Explanation
LSTM with THREE gates is powerful but complex. GRU simplifies it to TWO gates
by merging the forget and input gates into one "update gate." Fewer parameters,
faster training, similar performance on many tasks.

```
  GRU CELL (two gates):
  ─────────────────────────────────────────────────────────────────
  UPDATE GATE:  zₜ = σ(Wz·[hₜ₋₁, xₜ])    "How much to update?"
  RESET GATE:   rₜ = σ(Wr·[hₜ₋₁, xₜ])    "How much past to forget?"

  Candidate: h̃ₜ = tanh(W·[rₜ × hₜ₋₁, xₜ])
  Output:    hₜ = (1 − zₜ) × hₜ₋₁ + zₜ × h̃ₜ
                  ──────────────────   ─────────
                  keep old hidden       add new candidate
                  (weighted by 1−zₜ)   (weighted by zₜ)

  GRU vs LSTM:
  ┌────────────┬──────────────────────────────────────────────────┐
  │            │ GRU                       │ LSTM                 │
  ├────────────┼───────────────────────────┼──────────────────────┤
  │ Gates      │ 2 (reset, update)         │ 3 (forget, input,    │
  │            │                           │ output)              │
  ├────────────┼───────────────────────────┼──────────────────────┤
  │ Parameters │ Fewer                     │ More                 │
  ├────────────┼───────────────────────────┼──────────────────────┤
  │ Speed      │ Faster to train           │ Slower               │
  ├────────────┼───────────────────────────┼──────────────────────┤
  │ Memory     │ No separate cell state    │ Cell state + hidden  │
  ├────────────┼───────────────────────────┼──────────────────────┤
  │ When to use│ Less data, faster iter.   │ Long sequences,      │
  │            │ speech, time series       │ complex language     │
  └────────────┴───────────────────────────┴──────────────────────┘

  Rule: Try GRU first. Only upgrade to LSTM if GRU falls short.
  (For most modern NLP: use Transformer, not RNN at all!)
```

---

## 8.12 Transformer

### Why Transformers Replaced RNNs

```
  RNN PROBLEMS:
  ──────────────────────────────────────────────────────────────
  1. Sequential computation → can't parallelize → slow training
  2. Still struggles with very long sequences despite LSTM
  3. Information bottleneck: all context crammed into one vector

  TRANSFORMER SOLUTION:
  ──────────────────────────────────────────────────────────────
  1. Processes ALL tokens simultaneously (fully parallelizable!)
  2. Any token can directly attend to ANY other token (no distance limit)
  3. Self-attention: each token decides which others matter to it
```

### Self-Attention: Q, K, V

```
  Every token becomes THREE vectors via learned weight matrices:
  ─────────────────────────────────────────────────────────────
  Q (Query):  "What information am I looking for?"
  K (Key):    "What information do I offer?"
  V (Value):  "What content do I contribute if selected?"

  ANALOGY: Search engine
  ─────────────────────────────────────────────────────────────
  Q = your search query ("cat photos")
  K = webpage title/tags ("cute cats", "dog videos", "news")
  V = actual webpage content

  Attention score = how well your query matches each key.
  Final output = weighted sum of values, weighted by attention scores.

  FORMULA:
  ─────────────────────────────────────────────────────────────
  Attention(Q, K, V) = softmax(QKᵀ / √d_k) × V

    QKᵀ         = dot product of queries and keys (similarity scores)
    / √d_k      = scale down (prevents dot products from being too large)
    softmax(·)  = convert scores to probabilities (sum = 1)
    × V         = weighted sum of value vectors

  EXAMPLE: Sentence "The animal didn't cross the street because it was tired"
  ─────────────────────────────────────────────────────────────
  Token "it" attends to all other tokens:
  The  animal  didn't  cross  the  street  because  it   was  tired
  0.02  0.85    0.01   0.01  0.02   0.05    0.02   0.00  0.01  0.01
               ▲
          High attention! "it" refers to "animal"
```

### Multi-Head Attention

```
  One attention head captures ONE type of relationship.
  But text has MANY types of relationships simultaneously:
  - Syntactic (subject-verb agreement)
  - Semantic (pronoun coreference)
  - Positional (nearby words)

  MULTI-HEAD: run H attention operations in parallel, each with
  different Wq, Wk, Wv weight matrices, then concatenate:

  Head 1 (semantic):  "it" → "animal"  (what does "it" refer to?)
  Head 2 (syntactic): "it" → "was"     (subject-predicate link)
  Head 3 (context):   "it" → "tired"   (adjective link)

  All heads concatenated → linear projection → richer representation

  Typical: 8–16 heads in medium models, up to 96 in GPT-3.
```

### Full Transformer Architecture

```
  Input tokens: "The cat sat"

  ┌─────────────────────────────────────────────────────────────┐
  │   Token Embeddings + Positional Encoding                    │
  │                                                             │
  │   Why Positional Encoding?                                  │
  │   Self-attention is ORDER-BLIND ("cat sat" = "sat cat"!)    │
  │   Positional encoding adds a unique signal per position.    │
  │   Using sin/cos waves of different frequencies:             │
  │   PE(pos, 2i)   = sin(pos / 10000^(2i/d))                  │
  │   PE(pos, 2i+1) = cos(pos / 10000^(2i/d))                  │
  │              ↓                                              │
  │   ┌────────────────────────┐                               │
  │   │   Multi-Head Attention │ ← attend to all positions     │
  │   └────────────────────────┘                               │
  │              ↓                                              │
  │   Add & LayerNorm (residual connection)                     │
  │              ↓                                              │
  │   ┌────────────────────────┐                               │
  │   │   Feed-Forward Network │ ← two linear layers + ReLU   │
  │   │   (per token, same Ws) │                               │
  │   └────────────────────────┘                               │
  │              ↓                                              │
  │   Add & LayerNorm                                           │
  │                           Repeat N times (N=6 in paper)    │
  └─────────────────────────────────────────────────────────────┘
              ↓
        Output representations
```

### BERT vs GPT: Two Ways to Use Transformers

```
  ENCODER-ONLY (BERT style):           DECODER-ONLY (GPT style):
  ──────────────────────────           ─────────────────────────
  Reads ENTIRE input at once           Generates text LEFT to RIGHT
  Bidirectional attention              Causal attention (can only
  (each token sees all others)         see past tokens, not future)

  ┌──────────────────────────┐         ┌──────────────────────────┐
  │  "The [MASK] sat on mat" │         │  "Once upon" → "a" →    │
  │  ← sees full sentence →  │         │  "time" → "there" ...    │
  └──────────────────────────┘         └──────────────────────────┘

  Trained on: masked word prediction   Trained on: next-token prediction
  Best for: classification, NER,       Best for: text generation,
            question answering         chatbots, code generation

  Examples: BERT, RoBERTa, DistilBERT  Examples: GPT-2, GPT-3, GPT-4,
                                                 Claude, LLaMA, Gemini
```

---

## 8.13 Word Embeddings

### Simple Explanation
Computers can't directly use words — they need numbers. Word embeddings are
a "dictionary" that maps every word to a dense vector of numbers. The magic:
similar words get similar vectors, so the math captures meaning!

### Word2Vec Intuition

```
  BAD approach: one-hot encoding
  ─────────────────────────────────────────────────────────────
  "king"  = [1, 0, 0, 0, 0, ...]   (10,000-dim, mostly zeros)
  "queen" = [0, 1, 0, 0, 0, ...]   → no relationship between them!

  GOOD approach: dense embeddings
  ─────────────────────────────────────────────────────────────
  "king"  = [0.2, −0.4, 0.7, 0.1, ...]  (50–300 dim)
  "queen" = [0.1, −0.3, 0.6, 0.2, ...]  → vectors are SIMILAR!

  Distance between vectors ≈ semantic similarity
```

### The Famous Analogy Test

```
  word2vec vectors encode RELATIONSHIPS as directions:

  king − man + woman ≈ queen
  Paris − France + Italy ≈ Rome
  walked − walk + swim ≈ swam

  How this works:
  ─────────────────────────────────────────────────────────────
         gender direction
  king ────────────────► queen
   │                       │
   │ royalty               │ royalty
   ▼                       ▼
  man  ────────────────►  woman

  The "royalty" direction and "gender" direction are
  encoded as separate dimensions in the embedding space!
```

### Training Word2Vec

```
  SKIP-GRAM: given center word, predict surrounding context words
  ──────────────────────────────────────────────────────────────
  Sentence: "The quick brown fox jumps over the lazy dog"
  Center word: "fox"
  Predict: "quick", "brown", "jumps", "over"

  CBOW (Continuous Bag of Words): reverse — predict center from context
  ──────────────────────────────────────────────────────────────
  Context: ["quick", "brown", "jumps", "over"]
  Predict: "fox"

  Skip-gram: better for rare words. CBOW: faster training.

  Modern standard: Subword embeddings (BPE tokenization in GPT)
  and contextual embeddings (different vector per context, BERT-style).
```

---

## 8.14 Transfer Learning

### Simple Explanation
Training a deep network from scratch needs millions of examples and weeks of GPU time.
Transfer learning: take a network already trained on a huge dataset, and adapt it to
your specific problem. You inherit all the feature-detection knowledge for free!

```
  STAGE 1: Pre-Training (done by big labs)
  ─────────────────────────────────────────────────────────────
  Large model + huge dataset + weeks of GPU time
    e.g., ResNet trained on ImageNet (1.2M images, 1000 classes)
          BERT trained on entire Wikipedia + BookCorpus
          GPT-3 trained on most of the internet

  Early layers learn: general features (edges, curves, grammar)
  Later layers learn: task-specific features (dog breeds, syntax)

  STAGE 2: Fine-tuning (done by you, on your data)
  ─────────────────────────────────────────────────────────────
  Take pre-trained model → replace last layer → train on your data

  Full fine-tuning:          Feature extraction only:
  ────────────────           ────────────────────────
  Unfreeze ALL layers        Freeze pre-trained layers
  Update ALL weights         Only train new top layer
  Needs more data             Works with very little data
  (~10K+ examples)           (~100s of examples)

  TRANSFER LEARNING STRATEGIES:
  ┌─────────────────────────────────────────────────────────────┐
  │  Your data: small + similar to original → feature extract   │
  │  Your data: small + different           → fine-tune top few │
  │  Your data: large + similar             → fine-tune all     │
  │  Your data: large + different           → train more layers │
  └─────────────────────────────────────────────────────────────┘
```

**Why It Works:**
Low-level features (edges, corners, word n-grams) are universal.
A model trained to recognize 1000 ImageNet categories has learned
extremely powerful general image features that transfer to X-rays,
satellite images, medical scans, and more.

---

## 8.15 Generative Adversarial Networks (GANs)

### Simple Explanation
Two networks compete like a counterfeiter vs. a detective.
The counterfeiter (Generator) tries to make fake images so good the detective
(Discriminator) can't tell them from real ones. The detective gets better,
so the counterfeiter has to get better too. They both improve together!

```
  GAN ARCHITECTURE:
  ─────────────────────────────────────────────────────────────
  Random noise z
       │
       ▼
  ┌──────────────┐           ┌───────────────────┐
  │  GENERATOR G │  fake x̂  │  DISCRIMINATOR D  │ ──► P(real)
  │  (creates    │ ─────────►│  (classifies      │     0 = fake
  │   fake data) │           │   real vs. fake)  │     1 = real
  └──────────────┘           └───────────────────┘
                                      ▲
                              real x ─┘

  TRAINING OBJECTIVE (minimax game):
  ─────────────────────────────────────────────────────────────
  G wants: D(G(z)) → 1   (fool D into thinking fake is real)
  D wants: D(x) → 1      (correctly classify real as real)
           D(G(z)) → 0   (correctly classify fake as fake)

  After training: G produces realistic samples.
  Generator G is thrown away. Discriminator D is thrown away.
  The GENERATED samples are what you actually use.

  APPLICATIONS:
  ─────────────────────────────────────────────────────────────
  Image synthesis (faces, art, photos)    → DALL-E early work
  Data augmentation (medical images)
  Super-resolution (upscale low-res images)
  Video generation
  Style transfer (photo → painting style)

  CHALLENGES:
  Mode collapse: G finds one output D can't detect → keeps repeating it.
  Training instability: D gets too good too fast → G gets no gradient.
  Hard to evaluate: no single loss number to monitor.
```

---

## 8.16 Architecture Comparison

```
┌─────────────────┬──────────────────┬────────────────────┬──────────────────────┐
│ Architecture    │ CNN              │ RNN / LSTM         │ Transformer          │
├─────────────────┼──────────────────┼────────────────────┼──────────────────────┤
│ Best for        │ Images, video,   │ Short sequences,   │ NLP, long text,      │
│                 │ spatial data     │ time series        │ vision, audio        │
├─────────────────┼──────────────────┼────────────────────┼──────────────────────┤
│ Key mechansim   │ Local filters,   │ Hidden state       │ Self-attention:      │
│                 │ shared weights,  │ (memory passed     │ all tokens attend    │
│                 │ pooling          │ step by step)      │ to all tokens        │
├─────────────────┼──────────────────┼────────────────────┼──────────────────────┤
│ Parallelizable? │ Yes              │ No (sequential)    │ Yes (very)           │
├─────────────────┼──────────────────┼────────────────────┼──────────────────────┤
│ Long-range deps │ Limited          │ LSTM handles some; │ Excellent (direct    │
│                 │ (receptive field)│ still hard > 500   │ attention path)      │
├─────────────────┼──────────────────┼────────────────────┼──────────────────────┤
│ Training data   │ Moderate         │ Moderate           │ Very large           │
│ requirement     │                  │                    │ (scales well)        │
├─────────────────┼──────────────────┼────────────────────┼──────────────────────┤
│ Memory per seq  │ O(1)             │ O(seq_len)         │ O(seq_len²)          │
│                 │ (no memory)      │ (hidden state)     │ (attention matrix)   │
├─────────────────┼──────────────────┼────────────────────┼──────────────────────┤
│ Famous examples │ ResNet, VGG,     │ Seq2Seq, LSTMs     │ BERT, GPT, ViT,      │
│                 │ EfficientNet     │ in early NLP       │ Whisper, Claude      │
└─────────────────┴──────────────────┴────────────────────┴──────────────────────┘

WHEN TO USE WHAT:
  Tabular data: Tree models (XGBoost) usually beat neural nets
  Images:       CNN (or Vision Transformer for large data)
  Text/NLP:     Transformer (pretrained BERT/GPT style)
  Time Series:  Try tree models first, then LSTM/Transformer
  Audio:        CNN on spectrogram or Transformer (Whisper)
  Video:        CNN + Transformer (3D CNN or ViT variants)
```

---

## Deep Learning vs Traditional Machine Learning

```
            WHEN TO USE WHAT?
            ─────────────────────────────────────────

    STRUCTURED TABLE DATA    →  XGBoost / LightGBM usually WINS
    IMAGES                   →  CNN or Vision Transformer
    TEXT / NLP               →  Transformer (BERT, GPT)
    AUDIO                    →  Transformer or CNN on spectrograms
    TIME SERIES              →  Try trees first, then Transformer

    ─────────────────────────────────────────
    Data amount
        Small (< 10K) ──────►  Traditional ML (simpler, less overfit)
        Medium (10K-1M) ────►  Either; try both
        Large (> 1M) ───────►  Deep Learning shines

    ─────────────────────────────────────────
    Compute
        Limited  ──────────►  Logistic Regression, XGBoost
        Moderate ──────────►  CNN, small Transformer
        GPU-rich ──────────►  Large Transformer, fine-tune pretrained
```

---

## Deep Learning Applications

```
┌──────────────────────────────────────────────────────────────────┐
│                   DEEP LEARNING IN THE REAL WORLD                │
├──────────────────────┬───────────────────────────────────────────┤
│ IMAGE / VIDEO        │ Face recognition (Face ID on iPhone)      │
│                      │ Medical imaging (cancer detection)        │
│                      │ Self-driving cars (object detection)      │
│                      │ Image generation (DALL-E, Midjourney)     │
├──────────────────────┼───────────────────────────────────────────┤
│ TEXT / LANGUAGE      │ ChatGPT, Claude, Gemini (LLMs)            │
│                      │ Google Translate, document summarization  │
│                      │ Code generation (GitHub Copilot)          │
├──────────────────────┼───────────────────────────────────────────┤
│ AUDIO                │ Siri, Alexa (speech recognition)          │
│                      │ Whisper (OpenAI speech-to-text)           │
│                      │ Music generation (Suno, Udio)             │
├──────────────────────┼───────────────────────────────────────────┤
│ GENERATIVE           │ DALL-E, Stable Diffusion (image gen.)     │
│                      │ Sora, Runway (video generation)           │
│                      │ AlphaFold (protein structure prediction)  │
└──────────────────────┴───────────────────────────────────────────┘
```

---

## Key Neural Network Hyperparameters

```
┌──────────────────┬────────────────────────────────────────────────────┐
│ Hyperparameter   │ Guidance                                           │
├──────────────────┼────────────────────────────────────────────────────┤
│ Learning Rate    │ Most important! Default: 3e-4 (Adam). Use LR      │
│                  │ warmup + cosine decay for Transformers.            │
├──────────────────┼────────────────────────────────────────────────────┤
│ Batch Size       │ 32–256 common. Larger batches = faster but may    │
│                  │ generalize worse. Scale LR with batch size.        │
├──────────────────┼────────────────────────────────────────────────────┤
│ # Hidden Layers  │ Start with 2–3. Add depth only if needed.         │
│                  │ Very deep → use batch norm + skip connections.     │
├──────────────────┼────────────────────────────────────────────────────┤
│ # Neurons/Layer  │ Powers of 2: 64, 128, 256, 512, 1024.            │
│                  │ Wider = more capacity = more overfitting risk.     │
├──────────────────┼────────────────────────────────────────────────────┤
│ Dropout Rate     │ 0.1–0.5. Higher for FC layers, lower for conv.   │
│                  │ Use after each FC layer. Never on output layer.   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Optimizer        │ Adam (default, lr=3e-4). AdamW for Transformers.  │
│                  │ SGD + momentum for CNNs (often better than Adam). │
├──────────────────┼────────────────────────────────────────────────────┤
│ Batch Norm       │ Use before activation in CNNs. Use Layer Norm     │
│                  │ (not Batch Norm) in Transformers.                  │
├──────────────────┼────────────────────────────────────────────────────┤
│ Weight Init      │ He for ReLU networks. Xavier for sigmoid/tanh.    │
│                  │ Frameworks (PyTorch, Keras) handle automatically. │
├──────────────────┼────────────────────────────────────────────────────┤
│ Gradient Clip    │ max_norm=1.0 is standard for RNNs and Transformers│
│                  │ Prevents exploding gradients.                      │
└──────────────────┴────────────────────────────────────────────────────┘
```

---

## Key Takeaways

```
╔══════════════════════════════════════════════════════════════════════╗
║  NEURAL NETWORKS CHEAT SHEET                                         ║
║  ──────────────────────────────────────────────────────────────     ║
║  Neurons = weighted sum → activation function → output              ║
║  Layers: input → hidden (non-linear) → output (task-specific)       ║
║  Activation: ReLU (hidden), Sigmoid (binary), Softmax (multiclass) ║
║  GELU for Transformers; Leaky ReLU to fix dying ReLU               ║
║  ──────────────────────────────────────────────────────────────     ║
║  Backprop = chain rule; computes dLoss/dw for every weight          ║
║  Vanishing grads: use ReLU, BatchNorm, skip connections             ║
║  Exploding grads: use gradient clipping (max_norm=1)                ║
║  Weight init: He for ReLU, Xavier for sigmoid/tanh                  ║
║  ──────────────────────────────────────────────────────────────     ║
║  CNN = local filters → pooling → feature hierarchy → ResNet        ║
║  RNN/LSTM = sequential memory via hidden state + cell state         ║
║  GRU = simpler LSTM (2 gates vs 3), faster, similar performance    ║
║  Transformer = self-attention (Q,K,V) + positional encoding        ║
║  BERT = bidirectional encoder; GPT = causal decoder (text gen.)    ║
║  ──────────────────────────────────────────────────────────────     ║
║  Word Embeddings = words as dense vectors; similar words = nearby  ║
║  Transfer Learning = pretrain on big data, fine-tune on yours      ║
║  GANs = Generator vs Discriminator (adversarial training)          ║
║  Dropout = random neuron dropout → regularization                  ║
║  Batch Norm = normalize activations → faster, stabler training     ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## Review Questions — Test Your Understanding

1. Why do neural networks need activation functions? What happens if you remove them all?
2. You're training a network and 30% of the ReLU neurons have died (output is always 0). What activation function should you switch to?
3. Explain backpropagation in 3 sentences as if to a non-technical colleague.
4. You're classifying images of handwritten digits (0-9). What type of neural network architecture would you use? What activation function on the output layer?
5. Your model has a training loss that keeps decreasing, but validation loss starts increasing after epoch 10. What's happening and what should you do?
6. Compare Dropout and Batch Normalization — what does each do, and can you use both?

<details>
<summary>Answers</summary>

1. Without activation functions, every layer is just a linear transformation. Multiple linear layers collapse into one — the network can't learn anything a single-layer model couldn't. Activations add non-linearity, enabling the network to learn complex patterns.
2. Leaky ReLU — it has a small slope for negative inputs (instead of flat zero), so neurons never fully die. The gradient always flows.
3. The network makes a prediction and measures how wrong it is. Then it works backwards through each layer, figuring out which weights contributed most to the error. Finally, it adjusts each weight a tiny bit in the direction that reduces the error.
4. A CNN (Convolutional Neural Network) — designed for spatial/image data. It uses convolution layers to detect patterns (edges, shapes, digits). Output layer: Softmax with 10 outputs (one per digit, probabilities sum to 1).
5. Overfitting — the model is memorizing training data instead of learning general patterns. Solutions: Early stopping (stop at epoch 10), Dropout, L2 regularization, more training data, or data augmentation.
6. Dropout randomly turns off neurons during training (prevents co-adaptation, acts like ensemble). Batch Normalization normalizes layer inputs (stabilizes and speeds up training). Yes, you can use both — in practice, apply BatchNorm before activation and Dropout after activation.
</details>

---

**Previous:** [Chapter 9 — Key Algorithms](09_key_algorithms.md)
**Next:** [Chapter 11 — Model Evaluation & Tuning](11_model_evaluation.md)
