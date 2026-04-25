# Chapter 10 — Neural Networks & Deep Learning

---

## What You'll Learn

After this chapter you will be able to:
- Explain how an artificial neuron computes a weighted sum, applies an activation, and produces output
- Describe input, hidden, and output layers and reason about depth vs width trade-offs
- Choose the right activation function for every layer
- Walk through forward pass, loss computation, backpropagation, and weight update
- Diagnose vanishing and exploding gradients and apply fixes
- Apply Dropout, Batch Normalization, and weight decay to regularize a network
- Explain how CNNs extract spatial features, how RNNs model sequences, and how Transformers use self-attention
- Decide when deep learning beats traditional ML and when it does not

---

## 10.1 What Is a Neural Network?

> An **artificial neural network (ANN)** is a computational graph of parameterized functions organized into layers, where each connection carries a learnable weight. The network maps inputs to outputs by composing simple non-linear transformations, and learns by adjusting weights to minimize a loss function via gradient-based optimization.

A biological neuron collects electrical signals through dendrites, processes them in the cell body, and fires an output down the axon when the combined signal exceeds a threshold. An artificial neuron does the same thing with arithmetic: multiply each input by a weight, sum everything up, add a bias, and pass the result through a non-linear activation function.

```
BIOLOGICAL NEURON                 ARTIFICIAL NEURON (PERCEPTRON)
─────────────────                 ──────────────────────────────
   dendrites (inputs)                x₁, x₂, x₃  (features)
        │                                │   │   │
   cell body (sum + threshold)      w₁·x₁ + w₂·x₂ + w₃·x₃ + b
        │                                     │
   axon (output)                       activation f(z)
        │                                     │
   next neuron                            output ŷ
```

$$z = \sum_{i=1}^{n} w_i x_i + b, \qquad \hat{y} = f(z)$$

The single-neuron model is the **perceptron** (Rosenblatt, 1958). It can learn linearly separable patterns — AND, OR — but fails on XOR. Stack neurons into layers with non-linear activations and that limitation disappears: a network with one hidden layer of sufficient width can approximate any continuous function (Universal Approximation Theorem).

Real-world example: a single neuron could learn "if pixel brightness > threshold, classify as white." Stacking thousands of neurons lets you classify entire chest X-rays as pneumonia vs. healthy.

---

## 10.2 Architecture: Layers and Neurons

> A **feedforward neural network** consists of an input layer, one or more hidden layers, and an output layer. Data flows forward from input to output with no cycles. The number of hidden layers is the network's **depth**; the number of neurons per layer is its **width**.

```
INPUT LAYER         HIDDEN LAYERS           OUTPUT LAYER
───────────         ─────────────           ────────────
 x₁ ────┐           ┌───┐   ┌───┐          ┌───┐
         ├──────────►│ h │──►│ h │─────────►│ o │ → P(cat)  = 0.90
 x₂ ────┤           │   │   │   │          │   │ → P(dog)  = 0.07
         ├──────────►│ h │──►│ h │─────────►│ o │ → P(bird) = 0.03
 x₃ ────┤           │   │   │   │          └───┘
         ├──────────►│ h │──►│ h │
 x₄ ────┘           └───┘   └───┘

 Raw features       Non-linear             Task-specific
                    transformations         prediction
```

**Depth vs width** — Two levers for model capacity:

| Lever | Effect | Trade-off |
|-------|--------|-----------|
| More layers (deeper) | Learns hierarchical features; each layer builds on the last | Harder to train (vanishing gradients), slower per step |
| More neurons (wider) | More capacity per layer, captures more patterns in parallel | More parameters, higher memory, risk of overfitting |

A 784 → 512 → 256 → 10 network (e.g., MNIST digit classifier) has $784 \times 512 + 512 \times 256 + 256 \times 10 = 534{,}272$ weights. Each arrow in the diagram is one learnable weight.

```mermaid
graph LR
    subgraph Input
        I1((x₁))
        I2((x₂))
        I3((x₃))
    end
    subgraph Hidden 1
        H1((h₁))
        H2((h₂))
        H3((h₃))
        H4((h₄))
    end
    subgraph Hidden 2
        H5((h₅))
        H6((h₆))
        H7((h₇))
    end
    subgraph Output
        O1((ŷ₁))
        O2((ŷ₂))
    end
    I1 --> H1 & H2 & H3 & H4
    I2 --> H1 & H2 & H3 & H4
    I3 --> H1 & H2 & H3 & H4
    H1 --> H5 & H6 & H7
    H2 --> H5 & H6 & H7
    H3 --> H5 & H6 & H7
    H4 --> H5 & H6 & H7
    H5 --> O1 & O2
    H6 --> O1 & O2
    H7 --> O1 & O2
```

---

## 10.3 Activation Functions

> An **activation function** is a non-linear function applied element-wise to a neuron's pre-activation value $z$. Without it, any stack of linear layers collapses to a single linear transformation, regardless of depth.

Without activations, layer 2's output is $W_2(W_1 x + b_1) + b_2 = W'x + b'$ — still linear. A 100-layer network would have the same representational power as a single layer. Activations break this linearity, letting deep networks approximate arbitrarily complex functions.

### ReLU — The Default

$$\text{ReLU}(z) = \max(0, z)$$

Output range: $[0, \infty)$. Simple, fast, no saturation for positive inputs. Default choice for hidden layers in MLPs and CNNs. Downside: neurons receiving only negative inputs permanently output zero ("dying ReLU").

### Sigmoid

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

Output range: $(0, 1)$. Useful for binary classification output layers and LSTM gates (where you need a 0-to-1 probability or gate value). Saturates at extremes — gradients approach zero for large $|z|$.

### Tanh

$$\tanh(z) = \frac{e^z - e^{-z}}{e^z + e^{-z}}$$

Output range: $(-1, 1)$. Zero-centered, which can help optimization. Used for RNN/LSTM hidden states and value computations.

### Softmax

$$\text{softmax}(z_i) = \frac{e^{z_i}}{\sum_{j} e^{z_j}}$$

Converts a vector of raw logits into a probability distribution that sums to 1. Used as the output activation for multi-class classification.

### Leaky ReLU

$$f(z) = \begin{cases} z & z > 0 \\ \alpha z & z \le 0 \end{cases}, \quad \alpha = 0.01$$

Fixes dying ReLU by allowing a small gradient for negative inputs. The neuron is never completely dead.

### GELU (Gaussian Error Linear Unit)

$$\text{GELU}(z) = z \cdot \Phi(z)$$

where $\Phi$ is the standard Gaussian CDF. Smooth approximation of ReLU — no hard zero cutoff. Used in BERT, GPT, and most modern Transformers. Smoother gradients lead to more stable training in very deep networks.

```chart
{
  "type": "line",
  "data": {
    "labels": [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6],
    "datasets": [
      {
        "label": "Sigmoid",
        "data": [0.002,0.007,0.018,0.047,0.119,0.269,0.500,0.731,0.881,0.953,0.982,0.993,0.998],
        "borderColor": "rgba(99, 102, 241, 1)",
        "tension": 0.4, "pointRadius": 0, "borderWidth": 2, "fill": false
      },
      {
        "label": "Tanh",
        "data": [-1.00,-1.00,-0.999,-0.995,-0.964,-0.762,0.000,0.762,0.964,0.995,0.999,1.00,1.00],
        "borderColor": "rgba(234, 88, 12, 1)",
        "tension": 0.4, "pointRadius": 0, "borderWidth": 2, "fill": false
      },
      {
        "label": "ReLU",
        "data": [0,0,0,0,0,0,0,1,2,3,4,5,6],
        "borderColor": "rgba(34, 197, 94, 1)",
        "tension": 0, "pointRadius": 0, "borderWidth": 2, "fill": false
      },
      {
        "label": "Leaky ReLU (α=0.1)",
        "data": [-0.6,-0.5,-0.4,-0.3,-0.2,-0.1,0,1,2,3,4,5,6],
        "borderColor": "rgba(168, 85, 247, 1)",
        "tension": 0, "pointRadius": 0, "borderWidth": 2, "borderDash": [5,3], "fill": false
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Activation Functions Compared" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Output" }, "min": -1.5, "max": 6 },
      "x": { "title": { "display": true, "text": "Input z" } }
    }
  }
}
```

### When to Use Which

```
┌──────────────────────┬──────────────────────────────────────────────┐
│ Location             │ Recommended Activation                       │
├──────────────────────┼──────────────────────────────────────────────┤
│ Hidden (MLP/CNN)     │ ReLU (default); Leaky ReLU if dying neurons │
│ Hidden (Transformer) │ GELU                                         │
│ Output: binary       │ Sigmoid → P(y=1)                             │
│ Output: multi-class  │ Softmax → probability distribution           │
│ Output: multi-label  │ Sigmoid per output (independent probs)       │
│ Output: regression   │ None / Linear                                │
│ RNN/LSTM gates       │ Sigmoid (0 = closed, 1 = open)               │
│ RNN/LSTM values      │ Tanh (centered around 0)                     │
└──────────────────────┴──────────────────────────────────────────────┘
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Cat", "Dog", "Bird"],
    "datasets": [
      {
        "label": "Raw Logits (before softmax)",
        "data": [2.0, 1.0, 0.1],
        "backgroundColor": "rgba(200, 200, 200, 0.7)",
        "borderColor": "rgba(160, 160, 160, 1)", "borderWidth": 1
      },
      {
        "label": "Probabilities (after softmax)",
        "data": [0.65, 0.24, 0.11],
        "backgroundColor": ["rgba(34,197,94,0.8)", "rgba(99,102,241,0.6)", "rgba(99,102,241,0.4)"],
        "borderColor": ["rgba(34,197,94,1)", "rgba(99,102,241,1)", "rgba(99,102,241,1)"], "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Softmax Converts Logits to Probabilities (Sum = 1)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Value" }, "beginAtZero": true },
      "x": {}
    }
  }
}
```

---

## 10.4 Forward Pass & Loss Functions

> The **forward pass** computes the network's prediction by propagating inputs through each layer sequentially. A **loss function** (objective function) quantifies the discrepancy between the prediction $\hat{y}$ and the true label $y$.

The forward pass is straightforward: for each layer $l$, compute $z^{(l)} = W^{(l)} a^{(l-1)} + b^{(l)}$, then $a^{(l)} = f(z^{(l)})$, where $f$ is the activation. The final layer's output is the prediction.

### Common Loss Functions

**Binary Cross-Entropy** (binary classification):

$$L = -\frac{1}{N}\sum_{i=1}^{N}\left[y_i \log(\hat{y}_i) + (1 - y_i)\log(1 - \hat{y}_i)\right]$$

**Categorical Cross-Entropy** (multi-class):

$$L = -\frac{1}{N}\sum_{i=1}^{N}\sum_{c=1}^{C} y_{i,c} \log(\hat{y}_{i,c})$$

**Mean Squared Error** (regression):

$$L = \frac{1}{N}\sum_{i=1}^{N}(y_i - \hat{y}_i)^2$$

Real-world example: a speech recognition system's forward pass transforms a spectrogram through convolutional and recurrent layers to produce a probability distribution over characters. The cross-entropy loss measures how far those probabilities are from the true transcript.

---

## 10.5 Backpropagation & Gradient Descent

> **Backpropagation** is the algorithm that computes the gradient of the loss with respect to every weight in the network by recursively applying the chain rule of calculus, propagating error signals from the output layer back to the input layer.

### The Training Loop

```
┌─────────────────────────────────────────────────────────┐
│ 1. FORWARD PASS   → compute prediction ŷ               │
│ 2. COMPUTE LOSS   → L(ŷ, y)                            │
│ 3. BACKWARD PASS  → ∂L/∂w for every weight (chain rule)│
│ 4. UPDATE WEIGHTS → w ← w − α · ∂L/∂w                 │
│                                                         │
│ Repeat for thousands of mini-batches × epochs.          │
└─────────────────────────────────────────────────────────┘
```

The chain rule lets you decompose the gradient through layers:

$$\frac{\partial L}{\partial w_1} = \frac{\partial L}{\partial \hat{y}} \cdot \frac{\partial \hat{y}}{\partial z^{(2)}} \cdot \frac{\partial z^{(2)}}{\partial a^{(1)}} \cdot \frac{\partial a^{(1)}}{\partial z^{(1)}} \cdot \frac{\partial z^{(1)}}{\partial w_1}$$

### Worked Example (Single Neuron)

Neuron: $z = wx + b$ with $w=2, b=1$, activation $\sigma$, input $x=1$.

$$z = 2(1) + 1 = 3 \quad \Rightarrow \quad \hat{y} = \sigma(3) = 0.95$$

True label $y = 0$. Binary cross-entropy loss:

$$L = -[0 \cdot \log(0.95) + 1 \cdot \log(0.05)] = 3.0$$

Backward pass:

$$\frac{\partial L}{\partial \hat{y}} = \frac{1-y}{1-\hat{y}} = \frac{1}{0.05} = 20, \quad \frac{\partial \hat{y}}{\partial z} = 0.95 \times 0.05 = 0.047, \quad \frac{\partial z}{\partial w} = x = 1$$

$$\frac{\partial L}{\partial w} = 20 \times 0.047 \times 1 = 0.95$$

Update with learning rate $\alpha = 0.1$:

$$w_{\text{new}} = 2.0 - 0.1 \times 0.95 = 1.905$$

### Optimizers

**SGD (Stochastic Gradient Descent):** Update using gradient from a random mini-batch. Simple but can be slow and oscillate in narrow valleys.

$$w \leftarrow w - \alpha \nabla L$$

**SGD + Momentum:** Accumulates a velocity term that smooths oscillations and accelerates along consistent gradient directions.

$$v \leftarrow \beta v + \nabla L, \qquad w \leftarrow w - \alpha v$$

**Adam (Adaptive Moment Estimation):** Maintains per-parameter adaptive learning rates using first and second moment estimates of the gradient. The de facto default optimizer for most deep learning. Use learning rate $\approx 3 \times 10^{-4}$.

**AdamW:** Adam with decoupled weight decay. Preferred for Transformer training because it regularizes more cleanly than Adam's L2 penalty.

```chart
{
  "type": "line",
  "data": {
    "labels": [0,5,10,15,20,25,30,35,40,45,50],
    "datasets": [
      {
        "label": "SGD",
        "data": [2.5,2.1,1.8,1.5,1.3,1.1,0.95,0.82,0.72,0.64,0.58],
        "borderColor": "rgba(239, 68, 68, 1)",
        "fill": false, "tension": 0.3, "pointRadius": 0, "borderWidth": 2
      },
      {
        "label": "SGD + Momentum",
        "data": [2.5,1.8,1.3,0.9,0.65,0.48,0.36,0.28,0.22,0.18,0.15],
        "borderColor": "rgba(234, 88, 12, 1)",
        "fill": false, "tension": 0.3, "pointRadius": 0, "borderWidth": 2
      },
      {
        "label": "Adam",
        "data": [2.5,1.5,0.85,0.52,0.35,0.24,0.18,0.14,0.11,0.09,0.08],
        "borderColor": "rgba(34, 197, 94, 1)",
        "fill": false, "tension": 0.3, "pointRadius": 0, "borderWidth": 2
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Optimizer Convergence — SGD vs Momentum vs Adam" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Training Loss" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "Epoch" } }
    }
  }
}
```

---

## 10.6 Vanishing & Exploding Gradients

> The **vanishing gradient problem** occurs when gradients shrink exponentially as they propagate back through many layers, causing early layers to learn extremely slowly or not at all. The **exploding gradient problem** is the inverse: gradients grow exponentially, causing unstable weight updates.

During backpropagation through $L$ layers, the gradient for the first layer involves a product of $L$ terms:

$$\frac{\partial L}{\partial w_1} \propto \prod_{l=1}^{L} \frac{\partial a^{(l)}}{\partial z^{(l)}} \cdot W^{(l)}$$

**Vanishing:** Sigmoid's maximum gradient is 0.25. Through 10 layers: $0.25^{10} \approx 10^{-6}$. Early layers receive near-zero gradients and stop learning. This is why deep sigmoid networks were historically impossible to train.

**Exploding:** If weight magnitudes push each gradient factor above 1, the product grows exponentially. Weight updates become enormous, loss jumps to NaN, and training crashes. Common in RNNs processing long sequences.

```chart
{
  "type": "line",
  "data": {
    "labels": [1,2,3,4,5,6,7,8,9,10],
    "datasets": [
      {
        "label": "Vanishing (Sigmoid: 0.25^n)",
        "data": [0.25,0.0625,0.0156,0.0039,0.00098,0.00024,0.00006,0.000015,0.0000038,0.00000095],
        "borderColor": "rgba(239, 68, 68, 1)",
        "backgroundColor": "rgba(239, 68, 68, 0.1)",
        "fill": true, "tension": 0.3, "pointRadius": 3, "borderWidth": 2
      },
      {
        "label": "Stable (ReLU: gradient = 1 for z > 0)",
        "data": [1,1,1,1,1,1,1,1,1,1],
        "borderColor": "rgba(34, 197, 94, 1)",
        "borderDash": [5,3],
        "fill": false, "tension": 0, "pointRadius": 0, "borderWidth": 2
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Gradient Magnitude vs Network Depth" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Gradient Magnitude" }, "beginAtZero": true, "max": 1.1 },
      "x": { "title": { "display": true, "text": "Layers Deep" } }
    }
  }
}
```

### Solutions

| Problem | Solution | Why it works |
|---------|----------|--------------|
| Vanishing (activation saturation) | Use ReLU | Gradient = 1 for $z > 0$, no decay |
| Vanishing (deep networks) | Batch Normalization | Keeps activations in a healthy range |
| Vanishing over time (RNNs) | LSTM / GRU gating | Cell state acts as gradient highway |
| Vanishing (50+ layers) | Residual / skip connections | Gradient flows directly to early layers |
| Exploding gradients | Gradient clipping | Scale gradient down if $\|\nabla\| >$ threshold |
| Both | Proper weight initialization | He init (ReLU), Xavier init (sigmoid/tanh) |

---

## 10.7 Regularization: Dropout, Batch Norm, Weight Decay

### Dropout

> **Dropout** is a regularization technique that randomly sets each neuron's output to zero with probability $p$ during training, forcing the network to learn redundant, distributed representations rather than relying on any single neuron.

```
TRAINING (dropout p=0.5):
Full layer:    ● ● ● ● ● ● ● ●
After drop:    ● ✗ ● ✗ ● ● ✗ ●     (✗ = zeroed out)

INFERENCE:
All neurons active; outputs scaled by (1 − p) to compensate.
(PyTorch uses inverted dropout: scales during training instead,
 so inference code requires no change.)
```

Typical rates: 0.3-0.5 for fully connected layers, 0.1-0.2 for convolutional layers, 0.1 for Transformers. Never apply to the output layer.

### Batch Normalization

> **Batch Normalization** normalizes each layer's pre-activations to zero mean and unit variance over the current mini-batch, then applies learnable scale ($\gamma$) and shift ($\beta$) parameters.

$$\hat{x}_i = \frac{x_i - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}, \qquad y_i = \gamma \hat{x}_i + \beta$$

Benefits: enables higher learning rates, reduces sensitivity to initialization, adds mild regularization via batch statistics noise. Standard in CNNs. For Transformers, **Layer Normalization** (normalizing across features instead of across the batch) is preferred.

### Weight Decay (L2 Regularization)

> **Weight decay** adds a penalty proportional to the squared magnitude of weights to the loss function, discouraging large weight values and reducing overfitting.

$$L_{\text{total}} = L_{\text{data}} + \lambda \sum_i w_i^2$$

Equivalent to shrinking every weight toward zero by a factor of $\lambda$ each update. Typical $\lambda$: $10^{-4}$ to $10^{-2}$.

---

## 10.8 CNNs — Convolutional Neural Networks

> A **Convolutional Neural Network (CNN)** is a neural network that uses convolution operations — sliding learned filters over spatial input — to automatically extract hierarchical features. The architecture exploits spatial locality and translation invariance, making it the standard for image and spatial data tasks.

### How Convolution Works

A small filter (kernel), typically $3 \times 3$ or $5 \times 5$, slides across the input image. At each position, the element-wise product is summed to produce one output value. Each filter detects one type of pattern (vertical edge, horizontal edge, corner, etc.). A CNN learns many filters per layer.

```
IMAGE PATCH (5×5)         FILTER (3×3)          OUTPUT VALUE
┌─────────────────┐       ┌───────────┐
│  1  0  1  0  1  │       │  1  0 -1  │         Σ(element-wise
│  0  1  0  1  0  │   *   │  1  0 -1  │   =     products)
│  1  0  1  0  1  │       │  1  0 -1  │         → single number
│  0  1  0  1  0  │       └───────────┘
│  1  0  1  0  1  │
└─────────────────┘
Slide filter across entire image → produces a feature map.
```

**Stride** = how many pixels the filter moves per step. Stride 2 halves the spatial dimensions.

**Padding** = zeros added around the border. "Same" padding preserves the input size; "valid" padding (no padding) shrinks it.

### Pooling

Max pooling takes the maximum value in each spatial window, reducing dimensions while preserving the strongest activations. A $2 \times 2$ max pool with stride 2 halves width and height. Adds translation invariance: a cat shifted a few pixels still produces the same pooled features.

### Feature Hierarchy

This is the key insight behind CNNs — each successive layer detects increasingly complex features:

```
Layer 1: edges, gradients       (low-level)
Layer 3: textures, corners      (mid-level)
Layer 5: eyes, wheels, windows  (high-level)
Layer 7: faces, cars, buildings (semantic)

This hierarchy emerges automatically from training.
You do not hand-design these features — they are learned.
```

### Key Architectures

| Architecture | Year | Depth | Key Innovation |
|---|---|---|---|
| LeNet-5 | 1998 | 5 | Proved CNNs work for digit recognition |
| AlexNet | 2012 | 8 | ReLU + GPU training; won ImageNet |
| VGG-16 | 2014 | 16 | Small $3\times3$ filters stacked deep |
| ResNet | 2015 | 50-152 | Skip connections; solved degradation |
| EfficientNet | 2019 | variable | Compound scaling of depth/width/resolution |

### Skip Connections (ResNet)

The critical idea: instead of learning $y = F(x)$, learn the residual $F(x) = y - x$:

$$y = F(x) + x$$

If the optimal transformation is close to identity, the network only needs to learn a small residual rather than the entire mapping. Gradient flows directly through the skip connection, enabling training of 152+ layer networks.

```chart
{
  "type": "line",
  "data": {
    "labels": [8, 14, 20, 34, 50, 56, 110, 152],
    "datasets": [
      {
        "label": "Plain Network (no skip connections)",
        "data": [91.5, 93.0, 93.2, 92.0, 90.5, 89.8, 87.0, 84.0],
        "borderColor": "rgba(239, 68, 68, 1)",
        "fill": false, "tension": 0.3, "pointRadius": 3, "borderWidth": 2
      },
      {
        "label": "ResNet (with skip connections)",
        "data": [91.5, 93.2, 94.2, 95.0, 95.8, 96.0, 96.3, 96.5],
        "borderColor": "rgba(34, 197, 94, 1)",
        "fill": false, "tension": 0.3, "pointRadius": 3, "borderWidth": 2
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Deeper Networks Degrade Without Skip Connections" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Accuracy (%)" }, "min": 82, "max": 98 },
      "x": { "title": { "display": true, "text": "Network Depth (layers)" } }
    }
  }
}
```

Real-world applications: medical imaging (detecting tumors in CT scans), self-driving cars (object detection with YOLO/Faster R-CNN built on CNN backbones), facial recognition (Face ID on smartphones).

---

## 10.9 RNNs, LSTMs & GRUs

> A **Recurrent Neural Network (RNN)** processes sequential data by maintaining a hidden state $h_t$ that is updated at each time step, incorporating information from both the current input and the previous hidden state. This gives the network a form of memory over the sequence.

$$h_t = f(W_x x_t + W_h h_{t-1} + b)$$

Standard RNNs suffer severely from vanishing gradients over long sequences. If the sentence is "Mary, who grew up in Paris and studied at the Sorbonne, loves ___", the gradient must flow back 15+ steps. Each step multiplies by $W_h$ — if its eigenvalues are less than 1, the gradient decays to near zero.

### LSTM (Long Short-Term Memory)

> **LSTM** is an RNN variant with a gated cell state that acts as a long-term memory highway. Three gates (forget, input, output) control what information is erased, written, or read from the cell state, allowing gradients to flow across many time steps.

```
Cell State Cₜ ═══════════════════════════════════════►
                 ↑ forget old    ↑ add new      ↑ read
                 ×  fₜ          +  iₜ·C̃ₜ       × oₜ
```

**Forget gate:** $f_t = \sigma(W_f [h_{t-1}, x_t] + b_f)$ — what to erase from memory

**Input gate:** $i_t = \sigma(W_i [h_{t-1}, x_t] + b_i)$ — what new info to write

**Candidate:** $\tilde{C}_t = \tanh(W_c [h_{t-1}, x_t] + b_c)$

**Cell update:** $C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t$

**Output gate:** $o_t = \sigma(W_o [h_{t-1}, x_t] + b_o)$, then $h_t = o_t \odot \tanh(C_t)$

The cell state acts as a highway — gradients can flow through multiplication by $f_t$ (which is close to 1 for information the network wants to remember), bypassing the vanishing gradient bottleneck.

### GRU (Gated Recurrent Unit)

> **GRU** simplifies the LSTM to two gates (update and reset) by merging the forget and input gates and eliminating the separate cell state. Fewer parameters, faster training, similar performance on many tasks.

**Update gate:** $z_t = \sigma(W_z [h_{t-1}, x_t])$

**Reset gate:** $r_t = \sigma(W_r [h_{t-1}, x_t])$

**Output:** $h_t = (1 - z_t) \odot h_{t-1} + z_t \odot \tanh(W[r_t \odot h_{t-1}, x_t])$

```
┌────────────┬─────────────────────┬─────────────────────┐
│            │ GRU                 │ LSTM                │
├────────────┼─────────────────────┼─────────────────────┤
│ Gates      │ 2 (update, reset)   │ 3 (forget, in, out) │
│ Parameters │ Fewer (~25% less)   │ More                │
│ Speed      │ Faster              │ Slower              │
│ Cell state │ No (hidden only)    │ Yes (separate)      │
│ Use when   │ Shorter sequences,  │ Long sequences,     │
│            │ less data           │ complex dependencies│
└────────────┴─────────────────────┴─────────────────────┘
```

Practical guidance: for most modern NLP, use a Transformer instead. RNNs/LSTMs remain useful for streaming time-series tasks (e.g., real-time speech recognition) where you process one step at a time and latency matters.

---

## 10.10 The Transformer

> The **Transformer** (Vaswani et al., 2017) processes sequences using **self-attention** — a mechanism that lets each token compute a weighted combination of all other tokens' representations in parallel, without recurrence. It has replaced RNNs as the dominant architecture for NLP, and increasingly for vision and audio.

For a thorough treatment, see Chapter 13 (LLMs & Transformers). Here we cover the core mechanics.

### Self-Attention: Q, K, V

Each token is projected into three vectors using learned weight matrices:
- **Query (Q):** "What am I looking for?"
- **Key (K):** "What do I contain?"
- **Value (V):** "What content do I provide if selected?"

$$\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right) V$$

The $QK^\top$ dot product measures similarity between every pair of tokens. Division by $\sqrt{d_k}$ prevents the softmax from saturating. The result is a weighted sum of value vectors — each token's representation becomes a blend of information from the most relevant other tokens.

**Multi-head attention** runs $H$ parallel attention operations with different weight matrices, then concatenates results. Each head can capture a different type of relationship (syntactic, semantic, positional). Typical: 8-16 heads in medium models, up to 96+ in large models.

### Positional Encoding

Self-attention is permutation-invariant — it treats "cat sat" and "sat cat" identically. Positional encodings inject order information:

$$PE(\text{pos}, 2i) = \sin\!\left(\frac{\text{pos}}{10000^{2i/d}}\right), \qquad PE(\text{pos}, 2i+1) = \cos\!\left(\frac{\text{pos}}{10000^{2i/d}}\right)$$

```mermaid
graph TB
    A[Token Embeddings + Positional Encoding] --> B[Multi-Head Self-Attention]
    B --> C[Add & Layer Norm]
    C --> D[Feed-Forward Network]
    D --> E[Add & Layer Norm]
    E -->|Repeat N times| B
    E --> F[Output]
```

### Encoder vs Decoder

| | Encoder-only (BERT) | Decoder-only (GPT) |
|---|---|---|
| Attention | Bidirectional (sees all tokens) | Causal (sees only past tokens) |
| Training | Masked language modeling | Next-token prediction |
| Best for | Classification, NER, QA | Text generation, chatbots |
| Examples | BERT, RoBERTa, DeBERTa | GPT-4, Claude, LLaMA, Gemini |

```chart
{
  "type": "bar",
  "data": {
    "labels": ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "tired"],
    "datasets": [{
      "label": "Attention weight from token 'it'",
      "data": [0.02, 0.85, 0.01, 0.01, 0.02, 0.05, 0.02, 0.00, 0.01, 0.01],
      "backgroundColor": ["rgba(99,102,241,0.3)","rgba(239,68,68,0.85)","rgba(99,102,241,0.3)","rgba(99,102,241,0.3)","rgba(99,102,241,0.3)","rgba(99,102,241,0.4)","rgba(99,102,241,0.3)","rgba(99,102,241,0.2)","rgba(99,102,241,0.3)","rgba(99,102,241,0.3)"],
      "borderColor": ["rgba(99,102,241,1)","rgba(239,68,68,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Self-Attention: Where Does 'it' Look? → 'animal'" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Attention Weight" }, "beginAtZero": true, "max": 1.0 },
      "x": { "title": { "display": true, "text": "Token" } }
    }
  }
}
```

---

## 10.11 Transfer Learning & Fine-Tuning

> **Transfer learning** is the practice of reusing a model trained on a large source task as the starting point for a different target task. The model's learned representations — edges, textures, grammar, world knowledge — transfer to the new domain, dramatically reducing the data and compute needed.

The process has two stages:

**Stage 1 — Pre-training** (done by large labs): Train a large model on a massive dataset. ResNet on ImageNet (1.2M images). BERT on Wikipedia + BookCorpus. GPT on internet-scale text. This takes weeks of GPU/TPU time.

**Stage 2 — Fine-tuning** (done by you): Take the pre-trained model, replace or adapt the final layer(s), and train on your smaller dataset.

```
┌────────────────────────────────────────────────────────────┐
│  Your data size / similarity       Strategy                │
├────────────────────────────────────────────────────────────┤
│  Small + similar to pre-training → Feature extraction only │
│  Small + different domain        → Fine-tune top few layers│
│  Large + similar                 → Fine-tune all layers    │
│  Large + different               → Fine-tune all + more LR│
└────────────────────────────────────────────────────────────┘
```

Real-world example: a hospital has 500 labeled chest X-ray images — far too few to train a CNN from scratch. They take a ResNet pre-trained on ImageNet, freeze the early layers (which detect universal edges and textures), replace the final classification head, and fine-tune on their X-rays. Accuracy jumps from ~60% (random init) to ~90% (transfer learning).

In NLP, fine-tuning a pre-trained BERT model on 1,000 labeled movie reviews for sentiment classification takes minutes on a single GPU and achieves accuracy comparable to training from scratch on 100x more data.

---

## 10.12 GANs — Generative Adversarial Networks

> A **Generative Adversarial Network (GAN)** consists of two networks trained adversarially: a **generator** $G$ that maps random noise to synthetic data, and a **discriminator** $D$ that classifies inputs as real or fake. Training is a minimax game where $G$ tries to fool $D$ and $D$ tries to catch $G$.

```mermaid
graph LR
    Z[Random Noise z] --> G[Generator G]
    G -->|Fake sample x̂| D[Discriminator D]
    R[Real data x] --> D
    D --> P["P(real) ∈ {0,1}"]
```

$$\min_G \max_D \; \mathbb{E}_{x}[\log D(x)] + \mathbb{E}_{z}[\log(1 - D(G(z)))]$$

At convergence, $G$ produces samples so realistic that $D$ outputs 0.5 (cannot distinguish real from fake).

**Applications:**
- Image synthesis: generating photorealistic faces (StyleGAN)
- Medical imaging: augmenting rare pathology training data
- Super-resolution: upscaling low-resolution images (SRGAN)
- Style transfer: converting photos to painting styles

**Challenges:**
- **Mode collapse:** $G$ learns to produce only one type of output that fools $D$
- **Training instability:** If $D$ becomes too strong too quickly, $G$ gets no useful gradient signal
- **Evaluation difficulty:** No single loss metric reliably measures generation quality; FID and IS are common proxies

---

## 10.13 Practical Tips: Learning Rate Schedules, Early Stopping, Data Augmentation

### Learning Rate Schedules

A constant learning rate is rarely optimal. Large steps early help escape bad initializations; small steps late enable precise convergence.

**Step decay:** Divide LR by 10 every $N$ epochs. Simple and effective.

**Cosine annealing:** Smooth decay following a cosine curve.

$$\text{LR}_t = \text{LR}_{\min} + \frac{1}{2}(\text{LR}_{\max} - \text{LR}_{\min})\left(1 + \cos\frac{\pi t}{T}\right)$$

**Warmup + cosine decay:** Start with very small LR, ramp up linearly over the first few thousand steps, then cosine decay. Standard for Transformer training — large initial LR with random weights causes exploding updates, so warmup lets weights stabilize first.

```chart
{
  "type": "line",
  "data": {
    "labels": [0,5,10,15,20,25,30,35,40,45,50],
    "datasets": [
      {
        "label": "Step Decay",
        "data": [0.1,0.1,0.1,0.01,0.01,0.01,0.01,0.001,0.001,0.001,0.001],
        "borderColor": "rgba(99, 102, 241, 1)",
        "fill": false, "tension": 0, "pointRadius": 0, "borderWidth": 2
      },
      {
        "label": "Cosine Annealing",
        "data": [0.1,0.095,0.08,0.06,0.04,0.025,0.015,0.008,0.004,0.002,0.001],
        "borderColor": "rgba(234, 88, 12, 1)",
        "fill": false, "tension": 0.4, "pointRadius": 0, "borderWidth": 2
      },
      {
        "label": "Warmup + Cosine",
        "data": [0.001,0.05,0.1,0.09,0.07,0.05,0.035,0.02,0.01,0.004,0.001],
        "borderColor": "rgba(34, 197, 94, 1)",
        "fill": false, "tension": 0.3, "pointRadius": 0, "borderWidth": 2
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Learning Rate Schedules Over Training" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Learning Rate" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "Epoch" } }
    }
  }
}
```

### Early Stopping

Monitor validation loss during training. When it stops improving for a set number of epochs (the "patience"), stop training and restore the best checkpoint. Prevents overfitting without requiring you to guess the optimal number of epochs.

```
Epoch  Train Loss  Val Loss   Action
  1       2.50       2.45     ─
  5       1.20       1.15     ─ (improving)
 10       0.60       0.58     ─ (best so far ✓)
 15       0.30       0.62     ─ (val rising, patience counting)
 18       0.15       0.70     ─ STOP, restore epoch 10 weights
```

### Data Augmentation

Artificially expand your training set by applying label-preserving transformations. For images: random horizontal flips, rotations, crops, color jitter, cutout. For text: synonym replacement, back-translation, random deletion. For audio: time stretching, pitch shifting, noise injection.

Data augmentation is free data — it reduces overfitting and improves generalization, especially when your dataset is small. In medical imaging, where labeled data is scarce and expensive, augmentation can be the difference between a usable model and a failed experiment.

### Weight Initialization

You cannot start with all weights equal to zero — every neuron would compute the same gradient and update identically (symmetry problem). Proper initialization:

| Activation | Initialization | Formula |
|---|---|---|
| Sigmoid, Tanh | Xavier/Glorot | $w \sim \mathcal{N}(0, \sqrt{2/(n_{in}+n_{out})})$ |
| ReLU, Leaky ReLU, GELU | He/Kaiming | $w \sim \mathcal{N}(0, \sqrt{2/n_{in}})$ |

Modern frameworks handle this automatically — but knowing *why* matters for debugging.

---

## 10.14 Deep Learning vs Traditional ML — When to Use What

> Deep learning excels when data is abundant, the input is unstructured (images, text, audio), and compute is available. Traditional ML (tree ensembles, linear models) often wins on structured/tabular data, small datasets, and when interpretability matters.

```
┌───────────────────────────┬─────────────────────────────────────┐
│ Data Type                 │ Best Approach                       │
├───────────────────────────┼─────────────────────────────────────┤
│ Tabular / structured      │ XGBoost / LightGBM (usually wins)  │
│ Images                    │ CNN or Vision Transformer           │
│ Text / NLP                │ Transformer (BERT / GPT family)     │
│ Audio / speech            │ Transformer (Whisper) or CNN        │
│ Time series               │ Try trees first, then LSTM/Transf.  │
│ Video                     │ 3D CNN + Transformer (ViViT)        │
│ Protein / molecules       │ Graph Neural Network or Transformer │
└───────────────────────────┴─────────────────────────────────────┘
```

### Dataset Size Considerations

| Dataset size | Recommendation |
|---|---|
| < 1K samples | Traditional ML almost always; DL overfits fast |
| 1K-10K | Either; transfer learning can make DL viable |
| 10K-1M | Both competitive; DL starts to pull ahead |
| > 1M | Deep learning's sweet spot; scales better |

### Architecture Comparison

```
┌──────────────┬───────────────┬───────────────┬──────────────────┐
│              │ CNN           │ RNN / LSTM    │ Transformer      │
├──────────────┼───────────────┼───────────────┼──────────────────┤
│ Best for     │ Images, video │ Short seqs,   │ Text, long seqs, │
│              │ spatial data  │ time series   │ vision, audio    │
├──────────────┼───────────────┼───────────────┼──────────────────┤
│ Key idea     │ Local filters │ Hidden state  │ Self-attention   │
│              │ + pooling     │ (memory)      │ (all-to-all)     │
├──────────────┼───────────────┼───────────────┼──────────────────┤
│ Parallelism  │ Yes           │ No (seq.)     │ Yes (fully)      │
├──────────────┼───────────────┼───────────────┼──────────────────┤
│ Long-range   │ Limited by    │ LSTM helps;   │ Excellent        │
│ dependencies │ receptive     │ still hard    │ (direct path)    │
│              │ field         │ past ~500     │                  │
├──────────────┼───────────────┼───────────────┼──────────────────┤
│ Memory cost  │ O(1) per seq  │ O(T)          │ O(T²)            │
├──────────────┼───────────────┼───────────────┼──────────────────┤
│ Famous       │ ResNet, VGG,  │ Seq2Seq,      │ BERT, GPT,       │
│ examples     │ EfficientNet  │ DeepSpeech    │ ViT, Whisper     │
└──────────────┴───────────────┴───────────────┴──────────────────┘
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["CNN", "RNN/LSTM", "Transformer"],
    "datasets": [
      {
        "label": "Parallelizable (5 = fully)",
        "data": [5, 1, 5],
        "backgroundColor": "rgba(34, 197, 94, 0.7)",
        "borderColor": "rgba(34, 197, 94, 1)", "borderWidth": 1
      },
      {
        "label": "Long-Range Dependencies (5 = best)",
        "data": [2, 3, 5],
        "backgroundColor": "rgba(99, 102, 241, 0.7)",
        "borderColor": "rgba(99, 102, 241, 1)", "borderWidth": 1
      },
      {
        "label": "Data Efficiency (5 = least data needed)",
        "data": [4, 4, 2],
        "backgroundColor": "rgba(234, 88, 12, 0.7)",
        "borderColor": "rgba(234, 88, 12, 1)", "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Architecture Comparison — CNN vs RNN vs Transformer" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Rating (1-5)" }, "beginAtZero": true, "max": 5 },
      "x": {}
    }
  }
}
```

Self-driving cars use all three: CNNs for camera perception (object detection), LSTMs for predicting pedestrian trajectories over time, and Transformers for end-to-end planning. The right architecture depends on the data modality and problem structure.

---

## Key Takeaways

```
╔═══════════════════════════════════════════════════════════════════════╗
║  NEURAL NETWORKS CHEAT SHEET                                        ║
║  ─────────────────────────────────────────────────────────────       ║
║  Neuron = weighted sum → activation → output                        ║
║  Layers: input → hidden (non-linear) → output (task-specific)       ║
║  Activation: ReLU (hidden), Sigmoid (binary), Softmax (multi-class) ║
║  GELU for Transformers; Leaky ReLU to fix dying neurons             ║
║  ─────────────────────────────────────────────────────────────       ║
║  Backprop = chain rule; computes ∂L/∂w for every weight             ║
║  Optimizers: Adam (default), AdamW (Transformers), SGD+mom (CNNs)   ║
║  Vanishing grads → ReLU, BatchNorm, skip connections                ║
║  Exploding grads → gradient clipping (max_norm=1)                   ║
║  ─────────────────────────────────────────────────────────────       ║
║  CNN = local filters → pooling → feature hierarchy → ResNet         ║
║  RNN/LSTM = sequential memory via hidden state + cell state         ║
║  GRU = simpler LSTM (2 gates vs 3), fewer params, often competitive ║
║  Transformer = self-attention (Q,K,V) + positional encoding         ║
║  ─────────────────────────────────────────────────────────────       ║
║  Transfer learning = pre-train big, fine-tune small                 ║
║  GANs = generator vs discriminator (adversarial game)               ║
║  Regularize with: Dropout, Batch/LayerNorm, weight decay            ║
║  Practical: LR schedules, early stopping, data augmentation         ║
║  Tabular data → trees; images → CNN; text → Transformer             ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## Review Questions

**1.** Why do neural networks need activation functions? What happens without them?

<details>
<summary>Answer</summary>

Without activation functions, every layer is a linear transformation. Stacking any number of linear layers collapses to a single linear function ($W_2 W_1 x + b' = Wx + b$). The network cannot learn non-linear patterns — it has the same power as logistic regression. Activations add non-linearity, enabling the network to approximate arbitrarily complex functions.
</details>

**2.** You observe that 30% of your ReLU neurons have died (always output zero). What do you do?

<details>
<summary>Answer</summary>

Switch to Leaky ReLU (or Parametric ReLU). Leaky ReLU allows a small gradient ($\alpha z$ where $\alpha \approx 0.01$) for negative inputs, so neurons never fully die. You might also check if your learning rate is too high (which can push many neurons into the dead zone permanently) and consider reducing it.
</details>

**3.** Explain backpropagation in three sentences to a non-technical colleague.

<details>
<summary>Answer</summary>

The network makes a prediction and we measure how wrong it is with a number called "loss." Then we work backwards through the network to figure out which connections contributed most to the error. Finally, we adjust each connection's strength slightly in the direction that would reduce the error, and repeat thousands of times.
</details>

**4.** You need to classify handwritten digits (0-9). What architecture and what output activation?

<details>
<summary>Answer</summary>

Use a CNN — it exploits the spatial structure of images via learned filters that detect edges, curves, and digit shapes. The output layer should have 10 neurons with softmax activation, producing a probability distribution over the 10 digit classes. Cross-entropy loss for training.
</details>

**5.** Training loss keeps decreasing but validation loss increases after epoch 10. Diagnose and prescribe.

<details>
<summary>Answer</summary>

This is overfitting — the model memorizes training data rather than learning generalizable patterns. Prescriptions: (1) Early stopping at epoch 10, (2) increase dropout rate, (3) add weight decay, (4) collect more training data or apply data augmentation, (5) reduce model capacity (fewer layers or neurons). Apply these in combination.
</details>

**6.** Compare Dropout and Batch Normalization. Can you use both?

<details>
<summary>Answer</summary>

Dropout randomly zeros neurons during training, preventing co-adaptation and acting as an implicit ensemble. Batch Normalization normalizes layer inputs to zero mean and unit variance, stabilizing and accelerating training. Yes, you can use both — typically apply BatchNorm before the activation and Dropout after. In practice, BatchNorm's mild regularization sometimes reduces the need for heavy dropout.
</details>

**7.** Why do Transformers need positional encoding? What happens without it?

<details>
<summary>Answer</summary>

Self-attention computes pairwise similarity between tokens regardless of their position — it is permutation-invariant. Without positional encoding, "the cat sat on the mat" and "mat the on sat cat the" would produce identical representations. Positional encodings (sinusoidal or learned) inject order information so the model knows which token is first, second, etc.
</details>

**8.** When would you use transfer learning instead of training from scratch?

<details>
<summary>Answer</summary>

When your target dataset is small (hundreds to low thousands of examples) or when your task is similar to one a large model was pre-trained on. Transfer learning lets you inherit general features (edges, grammar, world knowledge) from the pre-trained model, requiring far less labeled data and compute to achieve strong performance. It is now the default approach in both NLP and computer vision.
</details>

**9.** A GAN's generator is producing the same image regardless of input noise. What is happening?

<details>
<summary>Answer</summary>

This is mode collapse. The generator found a single output that reliably fools the discriminator and stopped exploring other modes of the data distribution. Fixes include: Wasserstein loss (WGAN) for smoother gradients, mini-batch discrimination so the discriminator can detect lack of diversity, progressive training (start low-res, gradually increase), or training the discriminator less aggressively so the generator gets useful gradient signal.
</details>

**10.** For each data type, name the go-to architecture: (a) tabular data, (b) images, (c) text, (d) audio.

<details>
<summary>Answer</summary>

(a) Tabular: gradient boosted trees (XGBoost, LightGBM) — consistently outperform neural networks on structured data. (b) Images: CNN (ResNet, EfficientNet) or Vision Transformer (ViT) for large datasets. (c) Text: Transformer (BERT for understanding tasks, GPT for generation). (d) Audio: Transformer (Whisper) or CNN on mel-spectrograms. In all cases, start with a pre-trained model and fine-tune.
</details>

---

**Previous:** [Chapter 9 — Key Algorithms Deep Dive](09_key_algorithms.md) | **Next:** [Chapter 11 — Model Evaluation & Tuning](11_model_evaluation.md)