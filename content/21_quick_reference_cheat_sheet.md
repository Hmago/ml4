# Quick Reference Cheat Sheet

> Your one-stop revision page. Every formula, definition, comparison, and pattern from all chapters — organized for rapid lookup. Bookmark this. Come back often.

---

## 1 — ML Fundamentals

```
Traditional Programming:  Input + Rules  = Output
Machine Learning:         Input + Output = Rules (learned)

AI  >  Machine Learning  >  Deep Learning  >  Generative AI
```

| Term | Definition |
|------|-----------|
| Feature (X) | Input variable / column. Types: continuous, categorical, ordinal, temporal |
| Label (y) | Target output to predict. Only in supervised learning |
| Parameter | Learned FROM data during training (weights, biases) |
| Hyperparameter | Set BEFORE training (learning rate, depth, dropout, batch size) |
| Epoch | One full pass through the entire training dataset |
| Batch | Subset of data for one gradient update. Typical: 32, 64, 128, 256 |
| Iteration | One forward + backward pass on one batch. Iterations/epoch = N / batch_size |
| Inference | Using a trained model to make predictions on new data |

### Three Types of ML

| Type | Data | Goal | Examples |
|------|------|------|----------|
| **Supervised** | Labeled (X, y) | Predict output | Spam filter, price prediction, image classification |
| **Unsupervised** | Unlabeled (X only) | Find structure | Clustering, PCA, anomaly detection |
| **Reinforcement** | Rewards/penalties | Maximize cumulative reward | Game AI, robotics, RLHF for LLMs |

### Data Splits

```
Training (70-80%)    Validation (10-15%)      Test (10-15%)
Learn weights        Tune hyperparameters     Final unbiased eval
Change every epoch   Used during development  NEVER peek until done
```

**Golden rule:** Information NEVER flows from test/validation into training decisions.

### Overfitting vs Underfitting

| Condition | Train Error | Val Error | Gap | Bias | Variance | Fix |
|-----------|------------|-----------|-----|------|----------|-----|
| Underfit | High | High | Small | High | Low | More complex model, more features, train longer, less regularization |
| Good fit | Low | Low | Small | Balanced | Balanced | Ship it |
| Overfit | Very low | High | Large | Low | High | Regularization, more data, dropout, early stopping, simpler model |

**Bias-Variance Decomposition:**

```
Expected Error = Bias^2 + Variance + Irreducible Noise
                 ------   --------   ------------------
                 Wrong     Sensitive   Can never
                 assump-   to data     remove
                 tions     changes
```

---

## 2 — Math Essentials

### Linear Algebra

| Operation | Formula | Used In |
|-----------|---------|---------|
| Dot Product | a . b = a1*b1 + a2*b2 + ... + an*bn | Neurons, attention, similarity |
| L1 Norm (Manhattan) | \|\|v\|\|_1 = Sum(\|vi\|) | L1 regularization, sparsity |
| L2 Norm (Euclidean) | \|\|v\|\|_2 = sqrt(Sum(vi^2)) | L2 regularization, distance |
| Cosine Similarity | cos(a,b) = (a . b) / (\|\|a\|\| * \|\|b\|\|) | Embedding similarity, RAG retrieval |
| Matrix Multiply | (m x n) * (n x p) = (m x p) | Every neural network layer |
| Transpose | A^T swaps rows and columns | Attention: Q * K^T |
| Eigendecomposition | A * v = lambda * v | PCA (eigenvectors = principal components) |
| SVD | A = U * Sigma * V^T | Compression, LoRA, recommendations |

**Key L2 norm example:** \|\|[3, 4]\|\| = sqrt(9 + 16) = sqrt(25) = **5**

### Calculus

| Concept | Formula | Why It Matters |
|---------|---------|---------------|
| Derivative | f'(x) = rate of change | Tells which direction to move weights |
| Chain Rule | d/dx[f(g(x))] = f'(g(x)) * g'(x) | **Foundation of backpropagation** |
| Gradient | nabla f = [df/dx1, df/dx2, ...] | Points UPHILL; descend opposite to minimize loss |
| d/dx(e^x) | = e^x (its own derivative) | Why e is the natural base in ML |

### Probability & Statistics

| Formula | Expression | Key Fact |
|---------|-----------|----------|
| Bayes' Theorem | P(A\|B) = P(B\|A) * P(A) / P(B) | Posterior = Likelihood * Prior / Evidence |
| Gaussian (Normal) | N(mu, sigma^2) | 68% within +/- 1sigma, 95% within +/- 2sigma, 99.7% within +/- 3sigma |
| Expected Value | E[X] = Sum(xi * P(xi)) | Weighted average of all outcomes |
| Variance | Var(X) = E[(X - mu)^2] | Spread around the mean |
| Standard Deviation | sigma = sqrt(Variance) | Same units as original data |
| CLT | Sample means -> Normal as n -> inf | Works for ANY original distribution |
| KL Divergence | KL(P\|\|Q) = Sum(P * log(P/Q)) | 0 = identical. Used in RLHF penalty |
| Entropy | H(X) = -Sum(P(x) * log P(x)) | Measures uncertainty. 0 = certain |
| Cross-Entropy | H(P,Q) = -Sum(P(x) * log Q(x)) | THE classification loss function |
| MLE | theta* = argmax P(data\|theta) | Training a neural net IS doing MLE |

---

## 3 — Optimization & Training Loop

### The Training Loop

```
1. Forward Pass  -->  Compute predictions y_hat = f(X; W)
2. Loss          -->  L = loss(y, y_hat)       "how wrong?"
3. Backward Pass -->  dL/dW via chain rule      "who's responsible?"
4. Update        -->  W = W - alpha * dL/dW     "fix it"
5. Repeat for all batches, all epochs
```

### Gradient Descent Update Rule

```
w_new = w_old - alpha * dL/dw
        -----   -----   -----
        current  step    direction of
        weight   size    steepest decrease
```

### Optimizers Comparison

| Optimizer | Key Idea | Hyperparams | When to Use |
|-----------|----------|-------------|-------------|
| **SGD** | Basic gradient step | alpha | Simplest baseline |
| **SGD + Momentum** | Accumulates velocity (smooths zigzags) | alpha, beta=0.9 | Vision models (final training) |
| **RMSProp** | Per-parameter adaptive rate (divides by sqrt of running avg of grad^2) | alpha, beta=0.9 | Predecessor of Adam |
| **Adam** | Momentum + RMSProp + bias correction | alpha=1e-3, beta1=0.9, beta2=0.999 | **Default choice for everything** |
| **AdamW** | Adam + decoupled weight decay | alpha, lambda | **Standard for Transformers** |

**Adam update (know this):**

```
m_t = beta1 * m_{t-1} + (1 - beta1) * g         (1st moment: mean of gradients)
v_t = beta2 * v_{t-1} + (1 - beta2) * g^2        (2nd moment: mean of squared grads)
m_hat = m_t / (1 - beta1^t)                       (bias correction)
v_hat = v_t / (1 - beta2^t)                       (bias correction)
w = w - alpha * m_hat / (sqrt(v_hat) + epsilon)   (final update)
```

### Learning Rate

```
Too small  -->  Slow convergence, may get stuck in local minimum
Too large  -->  Overshoots, loss oscillates or diverges to NaN
Just right -->  Smooth, steady convergence
```

**Schedules:** Step decay | Cosine annealing | **Warmup + cosine decay** (Transformer standard)

### Loss Functions

| Loss | Formula | Use Case |
|------|---------|----------|
| **MSE** | (1/n) * Sum(y - y_hat)^2 | Regression. Penalizes large errors heavily. |
| **MAE** | (1/n) * Sum(\|y - y_hat\|) | Regression. Robust to outliers. |
| **Binary Cross-Entropy** | -[y*log(y_hat) + (1-y)*log(1-y_hat)] | Binary classification (sigmoid output) |
| **Categorical Cross-Entropy** | -Sum(y_i * log(y_hat_i)) | Multi-class classification (softmax output) |
| **Focal Loss** | -(1-p_t)^gamma * log(p_t) | **Imbalanced data** (down-weights easy examples) |
| **Hinge Loss** | max(0, 1 - y * y_hat) | SVM |
| **Triplet Loss** | max(0, d(a,p) - d(a,n) + margin) | Embedding/similarity learning (face recognition) |
| **Contrastive Loss** | Pull same-class close, push different-class apart | Self-supervised learning (SimCLR, CLIP) |

---

## 4 — Regularization Techniques

| Technique | How It Works | Effect | Use When |
|-----------|-------------|--------|----------|
| **L1 (Lasso)** | Loss + lambda * Sum(\|w\|) | Many weights -> exactly 0 | Feature selection; suspect irrelevant features |
| **L2 (Ridge)** | Loss + lambda * Sum(w^2) | All weights -> small | All features somewhat relevant |
| **Elastic Net** | L1 + L2 combined | Best of both | Correlated features |
| **Dropout** | Zero p% of neurons randomly during training | Prevents co-adaptation; implicit ensemble of 2^N networks | FC layers (p=0.3-0.5), Conv (p=0.1-0.2) |
| **Batch Norm** | Normalize: x_hat = (x-mu)/sigma, then learnable scale and shift | Stabilizes training, allows higher LR | CNNs (per batch) |
| **Layer Norm** | Same but per-sample across features | Doesn't depend on batch | **Transformers** (per token) |
| **Early Stopping** | Stop when val loss stops improving for 'patience' epochs | Equivalent to L2; limits how far weights move from init | Always use as safety net |
| **Data Augmentation** | Flip, rotate, crop, color jitter, mixup, cutout | More data diversity without collection | Vision models especially |
| **Weight Decay** | Directly shrink weights: w = w * (1 - lambda) each step | Simpler than L2 in optimizer | AdamW separates this correctly |

### Why L1 Gives Sparsity (Common Google Follow-up)

```
L1 constraint = DIAMOND shape         L2 constraint = CIRCLE shape
Loss contours touch diamond at         Loss contours touch circle at
CORNERS (axis) where some w = 0        arbitrary point, nothing = 0
--> Automatic feature selection         --> Weights shrink but never reach 0
```

---

## 5 — Data Preprocessing

### Missing Data Strategy

| Missing % | Strategy |
|-----------|----------|
| < 5% | Drop rows (if MCAR) |
| 5-30% | Impute: mean (symmetric), median (skewed/outliers), mode (categorical), KNN, MICE |
| > 30% | Drop column, or add is_missing indicator |
| Any | Consider: is missingness itself informative? Add binary is_missing column |

**Critical:** Fit imputer on TRAIN set only. Transform both train and test with train statistics.

### Feature Scaling

| Method | Formula | When to Use |
|--------|---------|-------------|
| **StandardScaler** | z = (x - mean) / std | **Default.** Handles outliers, centers at 0 |
| **MinMaxScaler** | x' = (x - min) / (max - min) | Need bounded [0,1] (images, neural nets) |
| **RobustScaler** | (x - median) / IQR | Heavy outliers |

**Required for:** KNN, SVM, Logistic Reg, Neural Nets. **Not needed for:** Trees, Random Forest, XGBoost, Naive Bayes.

### Encoding Categoricals

| Method | How | When | Watch Out |
|--------|-----|------|-----------|
| **One-Hot** | [red,blue,green] -> [1,0,0],[0,1,0],[0,0,1] | Nominal, < 20 categories | Curse of dimensionality with high cardinality |
| **Label** | [S,M,L] -> [0,1,2] | Ordinal only | Creates false ordering for nominal data |
| **Target Encoding** | Category -> mean(target) for that category | High cardinality | Leakage risk! Use with regularization |
| **Embeddings** | Category -> learned dense vector | Deep learning | Needs training data |

### Data Leakage (Silent Killer)

```
WRONG: Scale all data --> then split into train/test  (test stats leak!)
RIGHT: Split first  --> fit scaler on train --> transform both

WRONG: Include future features (e.g., "was_treated" predicting "has_disease")
RIGHT: For each feature ask: "Would I have this at PREDICTION time?"

If your model gets AUC > 0.99 on a hard problem --> CHECK FOR LEAKAGE FIRST
```

### Class Imbalance

| Approach | How | Level |
|----------|-----|-------|
| **Class weights** | weight_i = n_total / (n_classes * n_class_i) | Algorithm |
| **SMOTE** | Create synthetic minority samples by interpolating between neighbors | Data |
| **Threshold tuning** | Adjust decision threshold using PR curve (not just 0.5) | Post-training |
| **Focal Loss** | Down-weight easy examples, focus on hard ones | Loss function |
| **Undersampling** | Remove majority class samples (Tomek Links for boundary) | Data |
| **Ensemble** | BalancedRandomForest, EasyEnsemble | Algorithm |

**Never use accuracy for imbalanced data.** Use Precision, Recall, F1, AUC-PR instead.

---

## 6 — Supervised Learning Algorithms

### Algorithm Selection Guide

```
Start here: What kind of data?

TABULAR DATA (structured, rows & columns):
  --> Baseline: Logistic Regression (classification) or Linear Regression (regression)
  --> Beat it: Random Forest
  --> Win: XGBoost / LightGBM  <-- BEST for tabular, wins Kaggle consistently
  --> Only if XGBoost fails: Neural Network

IMAGES:
  --> CNN (ResNet, EfficientNet) or Vision Transformer (ViT)

TEXT / NLP:
  --> Baseline: Naive Bayes / TF-IDF + LogReg
  --> Win: Transformer (BERT for understanding, GPT for generation)

SMALL DATA (< 1000 samples):
  --> Simple models: LogReg, KNN, Naive Bayes, Decision Tree
  --> Transfer learning if applicable
```

### Algorithm Comparison Table

| Algorithm | Train | Predict | Scaling? | Interpretable? | Best For |
|-----------|-------|---------|----------|---------------|----------|
| **Linear/Logistic Reg** | O(np^2) | O(p) | Yes | Yes | Baseline, interpretability |
| **Decision Tree** | O(np log n) | O(depth) | No | Yes | Explainability, feature importance |
| **Random Forest** | parallel trees | O(K*d) | No | Moderate | Robust default, noisy data |
| **XGBoost/LightGBM** | sequential | O(K*d) | No | Moderate (SHAP) | **Best tabular performance** |
| **SVM** | O(n^2-n^3) | O(SV*p) | Yes | No | Clear margin, medium data (< 10K) |
| **KNN** | O(1) | O(np) | Yes | Yes | Small data, non-parametric |
| **Naive Bayes** | O(np) | O(p) | No | Moderate | Text/NLP, fast baseline, small data |

### Key Formulas

```
Logistic Regression:  y_hat = sigmoid(z) = 1 / (1 + e^(-z))     range: (0, 1)
                      z = w0 + w1*x1 + w2*x2 + ... + b

Decision Tree Splits:
  Gini Impurity:      G = 1 - Sum(p_i^2)           pure=0, worst=0.5
  Entropy:            H = -Sum(p_i * log2(p_i))     pure=0, worst=1.0
  Information Gain:   IG = H(parent) - Sum(n_j/N * H(child_j))

SVM:  Maximize margin between classes. Kernel trick for non-linear boundaries.
      C small = soft margin (tolerates errors). C large = hard margin (tight fit).
      Kernels: Linear, Polynomial, RBF (Gaussian, most popular).
```

### Bagging vs Boosting

```
BAGGING (Random Forest)               BOOSTING (XGBoost, LightGBM)
------------------------------         --------------------------------
Trees trained INDEPENDENTLY            Trees trained SEQUENTIALLY
  in PARALLEL on bootstrap samples       each corrects errors of previous
Uses DEEP trees (low bias)             Uses SHALLOW trees (low variance)
  -> average reduces VARIANCE            -> sum reduces BIAS
Robust, hard to overfit                Can overfit with too many rounds
Parallelizable (fast training)         Sequential (slower training)
  
Random Forest extras:                  XGBoost extras:
  - Random feature subsets per split     - Regularized objective (L1/L2 on leaves)
  - OOB error = free validation          - Built-in missing value handling
  - sqrt(p) features for classification  - Learning rate shrinkage (eta)

LightGBM: Leaf-wise growth (faster). CatBoost: Native categoricals.
```

### Feature Importance Methods

| Method | How | Reliability |
|--------|-----|------------|
| **Tree-based (MDI)** | Sum impurity reduction from each feature across splits | Biased toward high-cardinality features |
| **Permutation** | Shuffle one feature, measure accuracy drop | More reliable, model-agnostic |
| **SHAP** | Per-prediction additive explanations based on game theory | Gold standard. Interpretable + consistent |

---

## 7 — Unsupervised Learning

### Clustering Comparison

| Algorithm | Need K? | Cluster Shape | Detects Outliers? | Speed |
|-----------|---------|--------------|-------------------|-------|
| **K-Means** | Yes | Spherical/globular | No (sensitive) | Fast |
| **K-Means++** | Yes | Spherical | No | Fast (better init) |
| **DBSCAN** | No (eps, minPts) | **Arbitrary** | **Yes** | Medium |
| **GMM** | Yes | **Elliptical** | Somewhat | Slow (EM) |
| **Hierarchical** | No (cut dendrogram) | Any | Sensitive | Slow O(n^2) |

**K-Means Algorithm:** Init centroids (K-Means++) -> Assign points to nearest -> Recompute centroids -> Repeat until stable.

**Choosing K:** Elbow method (inertia vs K) + Silhouette score (S = (b-a)/max(a,b), range [-1,1], >0.7 strong).

**DBSCAN:** Core point (>= minPts within radius eps) | Border point (within eps of core) | Noise (neither). No K needed. Finds any shape.

**GMM:** Soft assignment — each point has probability of belonging to each cluster. Trained via EM (Expectation-Maximization).

### Dimensionality Reduction

| Method | Type | Preserves | Speed | Use For |
|--------|------|-----------|-------|---------|
| **PCA** | Linear | Global (max variance) | Very fast | Preprocessing, denoising, feature reduction |
| **t-SNE** | Non-linear | Local (neighbors) | Slow O(n^2) | **VISUALIZATION ONLY** (never as features!) |
| **UMAP** | Non-linear | Local + Global | Fast | Viz AND feature engineering |

**PCA Steps:** Center data -> Covariance matrix -> Eigenvectors/values -> Top-k by eigenvalue -> Project. Keep enough for 90-95% cumulative variance.

**Curse of Dimensionality:** In high dimensions, all points are roughly equidistant. Distance metrics break down. KNN fails. Need exponentially more data.

---

## 8 — Neural Networks & Deep Learning

### Single Neuron

```
z = w1*x1 + w2*x2 + ... + wn*xn + b     (weighted sum + bias)
output = activation(z)                     (nonlinearity)
```

### Activation Functions

| Function | Formula | Range | Gradient Issue | Use |
|----------|---------|-------|---------------|-----|
| **Sigmoid** | 1/(1+e^(-z)) | (0, 1) | Max 0.25 -> vanishes | Binary output, LSTM gates |
| **Tanh** | (e^z - e^(-z))/(e^z + e^(-z)) | (-1, 1) | Better than sigmoid | RNN hidden states |
| **ReLU** | max(0, z) | [0, inf) | 0 for z<0 (dead neurons) | **Default hidden layers** |
| **Leaky ReLU** | z if z>0, else 0.01z | (-inf, inf) | Fixes dead neurons | When ReLU has dying neurons |
| **GELU** | z * CDF(z) | ~(-0.17, inf) | Smooth | **Modern Transformers (GPT, BERT)** |
| **Softmax** | e^(zi) / Sum(e^(zj)) | (0,1), sum=1 | N/A | Multi-class output layer |

### Backpropagation (4 Steps, Know Cold)

```
1. FORWARD:   y_hat = f(X; W)              compute predictions
2. LOSS:      L = loss_fn(y, y_hat)         single number "how wrong"
3. BACKWARD:  dL/dW via chain rule          propagate blame backward
4. UPDATE:    W = W - alpha * dL/dW         adjust weights

Chain rule through layers:
  dL/dw1 = (dL/dy_hat) * (dy_hat/dh3) * (dh3/dh2) * (dh2/dh1) * (dh1/dw1)
           -----------   -----------   ----------   ----------   ----------
           output loss   layer 4       layer 3      layer 2      layer 1
```

### Vanishing & Exploding Gradients

| Problem | Cause | Through 10 Layers | Fix |
|---------|-------|-------------------|-----|
| **Vanishing** | Sigmoid max grad = 0.25 | 0.25^10 = 0.000001 | ReLU, BatchNorm, skip connections, LSTM |
| **Exploding** | Grad > 1 compounds | 2^10 = 1024 -> NaN | Gradient clipping, proper init, BatchNorm |

### Weight Initialization

| Method | Variance | For Activation |
|--------|----------|---------------|
| **Xavier/Glorot** | 2 / (n_in + n_out) | Sigmoid, Tanh |
| **He** | 2 / n_in | **ReLU** (doubles variance to compensate for zeroed half) |

Never initialize all weights to zero (all neurons identical, never diverge).

### CNN Cheat Sheet

```
Convolution:  Slide filter, compute dot products -> detect patterns (edges, textures, objects)
Pooling:      Max/avg in window -> reduce spatial size, add translation invariance
Stride:       Step size (stride=2 halves dimensions like pooling)
Skip Conn:    y = F(x) + x -> gradient highway, enables 150+ layer networks (ResNet)
```

| Architecture | Year | Innovation |
|-------------|------|-----------|
| AlexNet | 2012 | ReLU, GPU, dropout -> ImageNet revolution |
| VGG | 2014 | Deep stacked 3x3 convs |
| ResNet | 2015 | **Skip connections** -> 152 layers |
| EfficientNet | 2019 | Compound scaling (depth + width + resolution) |
| ViT | 2020 | Image patches as tokens -> Transformer for vision |

### RNN / LSTM / GRU

```
RNN:   h_t = tanh(W_x * x_t + W_h * h_{t-1} + b)    <- vanishes over long sequences

LSTM:  3 gates (forget, input, output) + cell state (gradient highway)
       C_t = f_t * C_{t-1} + i_t * C_hat_t             <- long-term memory
       h_t = o_t * tanh(C_t)                            <- short-term output

GRU:   2 gates (reset, update). Simpler LSTM. Similar performance. Faster.
```

---

## 9 — Transformers & Attention

### Self-Attention Formula (KNOW THIS COLD)

```
Attention(Q, K, V) = softmax( Q * K^T / sqrt(d_k) ) * V

Q (Query)   = "What am I looking for?"           W_Q * input
K (Key)     = "What do I contain/offer?"          W_K * input
V (Value)   = "What information do I carry?"      W_V * input
sqrt(d_k)   = scaling to prevent softmax saturation
softmax     = convert scores to probabilities (per row, sum to 1)
```

### Multi-Head Attention

```
H heads run in PARALLEL, each with different W_Q, W_K, W_V projections
Each head captures different relationships:
  Head 1: syntactic (subject-verb)
  Head 2: coreference ("it" -> "cat")
  Head 3: positional (nearby words)
  ...

Output = Concat(head_1, ..., head_H) * W_O

Cost: SAME as single-head with full dimension (heads split d into d/H each)
```

### Positional Encoding

Attention is permutation-invariant ("dog bites man" = "man bites dog"). Must add position info.

| Method | How | Used By |
|--------|-----|---------|
| Sinusoidal | sin/cos functions at different frequencies | Original Transformer |
| Learned | Trainable position embeddings | BERT, GPT-2 |
| **RoPE (Rotary)** | Encode position as rotation in complex space | **LLaMA, Gemini, Mistral** (2024+) |

### Architecture Variants

| Type | Masking | Training Objective | Models | Best For |
|------|---------|-------------------|--------|----------|
| **Encoder-only** | Bidirectional | Masked Language Model | BERT, RoBERTa | Understanding: classification, NER, QA |
| **Decoder-only** | Causal (left->right) | Next-token prediction | **GPT, LLaMA, Gemini, Claude** | **Generation: text, code, reasoning** |
| **Encoder-Decoder** | Both | Seq2seq | T5, BART | Translation, summarization |

### Transformer Block (what stacks N times)

```
Input -> Self-Attention -> Add & LayerNorm -> FFN -> Add & LayerNorm -> Output
         (who to attend)                      (store knowledge, apply nonlinearity)

FFN = two linear layers with activation: FFN(x) = W2 * GELU(W1 * x + b1) + b2
      Typically 4x expansion: d_model -> 4*d_model -> d_model
      FFN stores ~2/3 of model parameters. Research suggests it stores factual knowledge.
```

### Complexity

```
Self-attention: O(n^2 * d)     <- quadratic in sequence length
FFN:            O(n * d^2)     <- linear in sequence length

Bottleneck for long sequences is attention. Solutions:
  Flash Attention:   Tiled computation, O(n) memory instead of O(n^2), 2-4x faster
  Sparse Attention:  Only attend to local window + global tokens
  Sliding Window:    Fixed window per layer (Mistral)
  Ring Attention:    Distribute across devices for very long contexts
```

---

## 10 — Large Language Models (LLMs)

### LLM Training Pipeline

```
STAGE 1: Pre-training
  Data:     Internet-scale text (trillions of tokens)
  Task:     Next-token prediction (maximize log P(data|params))
  Result:   General language understanding + world knowledge
  Cost:     Millions of dollars, weeks of GPU/TPU time

STAGE 2: Supervised Fine-Tuning (SFT)
  Data:     Human-written instruction-response pairs (10K-100K)
  Task:     Learn to follow instructions and produce helpful responses
  Result:   Conversational ability, format adherence

STAGE 3: Alignment (RLHF or DPO)
  RLHF:    Train reward model from human preference rankings
            -> Use PPO to maximize reward while staying close to SFT model (KL penalty)
  DPO:     Directly optimize with preference pairs (simpler, no reward model)
            -> Largely superseding RLHF in 2025/2026 for stability
  Result:  Helpful, harmless, honest
```

### Tokenization

```
BPE (Byte Pair Encoding):
  Start with characters -> repeatedly merge most frequent adjacent pair
  "playing" -> ["play", "ing"]     "unbelievable" -> ["un", "believe", "able"]
  Vocab size: ~32K-50K tokens     1 token ~ 0.75 words
```

### Decoding Strategies

| Parameter | Effect | Value |
|-----------|--------|-------|
| **Temperature** | 0 = greedy (deterministic). 1 = natural. >1 = more random/creative | 0-2 |
| **Top-k** | Sample from top-k most probable tokens | 10-100 |
| **Top-p (nucleus)** | Sample from smallest set with cumulative prob >= p | 0.8-0.95 |
| **Beam search** | Keep K best partial sequences, explore multiple paths | K = 4-8 |

### Key LLM Concepts

| Concept | What It Does | Key Numbers |
|---------|-------------|-------------|
| **RAG** | Retrieve docs -> feed as context -> reduces hallucination | Chunks: 256-512 tokens |
| **LoRA** | Freeze base weights, add small trainable A*B matrices | ~0.1-1% params trained |
| **QLoRA** | LoRA + 4-bit quantized base | 70B model on single 48GB GPU |
| **MoE** | Many expert sub-networks; router selects top-K per token | Total huge, active small (e.g., 671B total / 37B active) |
| **KV Cache** | Store Key/Value from prior tokens, avoid recomputing | Without: O(n^2) total. With: O(n) |
| **Flash Attention** | IO-aware tiled attention computation | O(n) memory vs O(n^2). 2-4x faster |
| **GQA** | Share K,V across groups of Q heads | ~4x less KV cache memory |
| **RoPE** | Rotary positional embeddings in complex space | Supports context extrapolation |
| **Quantization** | FP32 -> INT8 (4x smaller) or INT4 (8x smaller) | ~3-5% quality loss for INT4 |
| **Speculative Decoding** | Fast draft model proposes, large model verifies in parallel | 2-3x faster, zero quality loss |
| **Scaling Laws** | Loss ~ 1/N^alpha. Chinchilla: ~20 tokens per param | 70B model needs ~1.4T tokens |
| **Agents** | LLM + tools in think-act-observe loop | ReAct pattern |

### Hallucinations

```
Cause:   Model predicts likely-sounding tokens, not factually verified ones
Types:   Fabricated facts, fake citations, logical inconsistencies
Fix:     RAG (ground in documents) + lower temperature + output validation
         + chain-of-thought + constrained generation + fine-tune on factual data
```

### Prompt Engineering

| Technique | Pattern | When |
|-----------|---------|------|
| Zero-shot | "Translate to Spanish: [text]" | Simple, clear tasks |
| Few-shot | 2-3 examples then task | Teach format/pattern |
| Chain-of-thought | "Let's think step by step" | Math, logic, reasoning |
| ReAct | "Thought: ... Action: ... Observation: ..." | Tool-using agents |

---

## 11 — Evaluation Metrics

### Classification Metrics (FROM CONFUSION MATRIX)

```
                    Predicted
                    +         -
Actual  +          TP        FN     <- Recall    = TP / (TP + FN)  "did I catch it?"
        -          FP        TN     <- Precision = TP / (TP + FP)  "is my alarm right?"

Accuracy = (TP + TN) / (TP + TN + FP + FN)    <- MISLEADING for imbalanced data!
F1 = 2 * Precision * Recall / (Precision + Recall)  <- harmonic mean
Specificity = TN / (TN + FP)
```

### When to Use Which Metric

| Scenario | Prioritize | Why | Example |
|----------|-----------|-----|---------|
| FP is costly | **Precision** | Don't cry wolf | Spam filter (blocking real emails is bad) |
| FN is costly | **Recall** | Don't miss it | Cancer screening (missing disease is fatal) |
| Both matter | **F1 Score** | Balanced tradeoff | NER, information extraction |
| Balanced classes | **Accuracy** | Works when classes are roughly equal | MNIST digit recognition |
| Compare models | **AUC-ROC** | Threshold-independent ranking quality | 1.0 = perfect, 0.5 = random |
| Imbalanced data | **AUC-PR** | Focuses on minority class performance | Fraud (0.1% positive) |
| Ranking quality | **NDCG** | Penalizes relevant items ranked low | Search, recommendations |

### Regression Metrics

| Metric | Formula | Property |
|--------|---------|----------|
| **MAE** | avg(\|y - y_hat\|) | Robust to outliers. Interpretable units. |
| **RMSE** | sqrt(avg((y - y_hat)^2)) | Penalizes large errors. Same units as y. |
| **R^2** | 1 - SS_res / SS_tot | 1.0 = perfect. 0 = predicting mean. <0 = worse than mean. |

### Cross-Validation

```
K-Fold: Split into K folds. Each fold takes a turn as validation. Average K scores.
        More reliable than a single train/test split. Typical K = 5 or 10.

Stratified K-Fold: Maintains class proportions in each fold.
                   ESSENTIAL for imbalanced datasets.
```

### Hyperparameter Tuning Priority

| Algorithm | Most Important Hyperparameter | Typical Range |
|-----------|------------------------------|---------------|
| Linear/Logistic | C or alpha (regularization) | 0.001 - 1000 (log scale) |
| Decision Tree | max_depth | 3 - 20 |
| Random Forest | n_estimators | 100 - 500 |
| XGBoost | learning_rate + n_estimators (together) | eta: 0.01-0.3, trees: 100-1000 |
| SVM | C (most important), then kernel, then gamma | C: 0.001-1000 (log scale) |
| KNN | K (n_neighbors) | 1-20 (cross-validate, odd for binary) |
| Neural Net | Learning rate | 1e-5 to 1e-2 |

---

## 12 — Reinforcement Learning

```
Agent observes STATE -> takes ACTION -> receives REWARD -> updates POLICY
```

| Concept | Definition |
|---------|-----------|
| Policy pi(s) | Mapping from state to action (the learned strategy) |
| Value V(s) | Expected cumulative reward from state s onward |
| Q-value Q(s,a) | Expected cumulative reward taking action a in state s |
| Discount gamma | 0 = short-sighted (only immediate). 0.99 = plans ahead |
| Epsilon-greedy | With prob epsilon: random (explore). With 1-epsilon: best known (exploit). Decay epsilon over time. |

### Q-Learning Update (Bellman Equation)

```
Q(s,a) = Q(s,a) + alpha * [ reward + gamma * max_a' Q(s', a') - Q(s,a) ]
                           |<------------ TD target ------------->|
                           |<------------- TD error --------------------------->|

alpha = learning rate (0-1)
gamma = discount factor (0-1)
```

**Deep Q-Network (DQN):** Replace Q-table with neural network for large/continuous state spaces (Atari from pixels).

**Policy Gradient (REINFORCE):** Directly optimize policy. Better for continuous actions. theta <- theta + alpha * G * grad(log pi(a|s,theta)).

**Actor-Critic:** Actor (policy) proposes actions. Critic (value) evaluates. More stable. PPO is most popular variant. PPO is used in RLHF.

### RLHF Pipeline (How ChatGPT/Claude are trained)

```
1. SFT:           Fine-tune on human-written (prompt, ideal response) pairs
2. Reward Model:  Humans rank response pairs. Train model to predict preference.
3. PPO:           LLM = agent. Reward model = environment. Response = action.
                  Maximize reward score while staying close to SFT model (KL penalty).
```

---

## 13 — ML System Design (8-Step Framework)

```
1. CLARIFY    -> Business goal, users, scale, latency, constraints
2. FRAME      -> Classification? Ranking? What is the label/target?
3. DATA       -> Sources, labeling strategy, quality issues, privacy
4. FEATURES   -> User/item/context features, feature store, online vs offline
5. MODEL      -> Start simple (logistic reg), iterate to complex. Training infra.
6. EVALUATE   -> Offline (AUC, NDCG) + Online (A/B test) + Guardrails
7. SERVE      -> Batch (pre-compute) vs Real-time (on-demand) vs Hybrid
8. MONITOR    -> Data drift, model decay, retraining triggers, feedback loops
```

### Recommendation Pipeline

```
1B items --> RETRIEVAL (Two-Tower, ANN search)  --> ~1K candidates
         --> FILTERING (business rules)          --> ~500
         --> RANKING (Wide&Deep / Transformer)   --> ~50
         --> RE-RANKING (diversity, freshness)    --> ~10 shown
```

### Key System Design Concepts

| Concept | One-Liner |
|---------|-----------|
| **Feature Store** | Single source of truth for features. Offline (batch, BigQuery) + Online (real-time, Redis). Prevents training-serving skew. |
| **Two-Tower** | Separate user & item encoders. Pre-compute item embeddings. ANN search at serving for O(log N) retrieval. |
| **Wide & Deep** | Wide (linear, memorization of cross-features) + Deep (neural, generalization from embeddings). |
| **Position Bias** | Top items get clicked more regardless of quality. Debias with randomization or position features. |
| **Training-Serving Skew** | Feature computation differs between training and serving -> model degrades silently. Feature store fixes this. |
| **Data Drift** | Input distribution changes over time (e.g., COVID shifts shopping). Detect with PSI / KL divergence. |
| **Concept Drift** | Feature-target relationship changes. Harder to detect. Monitor delayed labels + prediction distribution. |
| **Feedback Loop** | Model predictions influence future training data. Fix: exploration/exploitation, inject randomness. |
| **Guardrail Metric** | Must NOT degrade even if primary metric improves. E.g., revenue guardrail on a CTR experiment. |
| **Model Cascade** | Cheap model filters 90% traffic. Expensive model handles remaining 10%. Saves compute. |
| **A/B Test** | Random 50/50 split. Run 1-2 weeks. Measure primary + guardrails. Gradual rollout: 1% -> 5% -> 25% -> 100%. |
| **NDCG** | Ranking metric. Penalizes relevant items ranked too low. Standard for search & recommendations. |

### Batch vs Real-Time Serving

| | Batch | Real-Time | Hybrid (most common) |
|-|-------|-----------|---------------------|
| When | Predictions stable, latency relaxed | Depends on immediate context | Best of both |
| Latency | Hours (ok) | < 100ms | Batch retrieval + real-time ranking |
| Example | Email recommendations | Search ranking | YouTube: batch candidates + real-time re-rank |

---

## 14 — Design Fundamentals

### SOLID Principles

| Letter | Principle | Rule |
|--------|-----------|------|
| **S** | Single Responsibility | One class = one reason to change |
| **O** | Open/Closed | Open for extension, closed for modification |
| **L** | Liskov Substitution | Subclass must substitute for parent without breaking |
| **I** | Interface Segregation | Many small interfaces > one fat interface |
| **D** | Dependency Inversion | Depend on abstractions, not concrete implementations |

### Design Patterns (Top 5 for Interviews)

| Pattern | Purpose | When |
|---------|---------|------|
| **Factory** | Create objects without specifying exact class | Runtime type selection |
| **Observer** | Notify dependents when state changes | Event bus, pub/sub |
| **Strategy** | Swap algorithms at runtime | Pricing strategies, sorting |
| **State** | Behavior changes per state (replace if/else) | Order: pending/shipped/delivered |
| **Command** | Encapsulate request as object | Undo/redo, task queues |

### Distributed Systems

| Concept | Key Point |
|---------|-----------|
| **CAP Theorem** | During partition, choose Consistency OR Availability. P is mandatory. CP = banking. AP = social media. |
| **Consistent Hashing** | Ring topology. Only ~1/N keys move on server change. Virtual nodes fix imbalance. |
| **Saga Pattern** | Distributed transactions with compensating actions. Choreography (events) vs Orchestration (coordinator). |
| **CQRS** | Separate read (denormalized, optimized for queries) and write (normalized) models. |
| **Rate Limiting** | Token bucket: add tokens at steady rate, each request takes one, empty = reject. Allows bursts. |
| **Circuit Breaker** | Stop calling failing service. Return fallback. Prevent cascade failures. States: Closed -> Open -> Half-Open. |
| **N+1 Problem** | 1 query for list + N queries for details = N+1 round trips. Fix: JOINs, batch fetch, DataLoader. |
| **Idempotency** | Same request twice = same result. Use idempotency keys. Critical for payments. |
| **Database Sharding** | Split data across machines by hash(key). Consistent hashing minimizes reshuffling. |
| **Normalization** | 1NF (no repeating groups), 2NF (no partial deps), 3NF (no transitive deps). Reduces redundancy. |

---

## 15 — DSA Patterns (Keyword -> Technique)

| When You See... | Pattern | Data Structure | Time |
|----------------|---------|---------------|------|
| "two numbers sum to", "find pair" | **HashMap lookup** | HashMap | O(n) |
| "subarray sum", "continuous sum" | **Prefix Sum** | HashMap | O(n) |
| "longest substring", "at most k" | **Sliding Window** | Two pointers | O(n) |
| "sorted array", "search" | **Binary Search** | Array | O(log n) |
| "shortest path" (unweighted) | **BFS** | Queue | O(V+E) |
| "all paths", "connected components" | **DFS** | Stack/recursion | O(V+E) |
| "prerequisites", "ordering" | **Topological Sort** | In-degree + Queue | O(V+E) |
| "how many ways", "minimum cost" | **Dynamic Programming** | Array/table | Varies |
| "connected?", "union groups" | **Union-Find** | Parent array | O(alpha(n)) ~ O(1) |
| "next greater/smaller" | **Monotonic Stack** | Stack | O(n) |
| "top k", "kth largest" | **Heap** | PriorityQueue | O(n log k) |
| "prefix", "autocomplete" | **Trie** | Trie | O(word length) |

### DP Recipe (5 Steps)

```
1. DEFINE STATE:     dp[i] = "answer for subproblem of size i"
2. RECURRENCE:       dp[i] = f(dp[i-1], dp[i-2], ...)
3. BASE CASES:       dp[0] = ..., dp[1] = ...
4. FILL ORDER:       Left to right (bottom up)
5. RETURN:           dp[n] or dp[n-1]
```

### Key Complexities

| Operation | Time | Space |
|-----------|------|-------|
| Array access | O(1) | O(n) |
| HashMap get/put | O(1) avg | O(n) |
| Binary Search | O(log n) | O(1) |
| Merge/Quick Sort | O(n log n) | O(n) / O(log n) |
| BFS / DFS | O(V + E) | O(V) |
| Dijkstra (heap) | O((V+E) log V) | O(V) |
| Union-Find | O(alpha(n)) ~ O(1) amortized | O(n) |
| Heap insert/remove | O(log n) | O(n) |

---

## 16 — Google ML Ecosystem

| Technology | What It Is | When to Use |
|------------|-----------|-------------|
| **TPU** | Custom AI chip. Systolic arrays for matrix multiply. BF16 precision. | Large-scale training on GCP |
| **JAX** | NumPy + jit + vmap + pmap + grad. All composable. | Research, custom models, TPU training (Gemini, AlphaFold) |
| **TensorFlow/Keras** | Production ML framework. tf.data pipelines. SavedModel deployment. | Production (powers Search, Ads, Gmail) |
| **Vertex AI** | GCP ML platform. Pipelines + Feature Store + Endpoints + Registry. | End-to-end ML lifecycle on Google Cloud |

### Key Google Papers

| Paper | Year | Contribution |
|-------|------|-------------|
| **Attention Is All You Need** | 2017 | Transformer architecture. Foundation for all modern LLMs. |
| **BERT** | 2018 | Bidirectional pre-training via masked LM. Revolutionized NLU. |
| **T5** | 2019 | Text-to-text unified framework for all NLP tasks. |
| **Wide & Deep** | 2016 | Memorization + generalization for Google Play recommendations. |
| **YouTube DNN** | 2016 | Two-tower retrieval + ranking pipeline. Still the standard. |
| **Chinchilla** | 2022 | Scaling law: balance model size and data (~20 tokens per param). |

---

## 17 — Behavioral Interview

### STAR Method (Aim for 2.5 minutes per answer)

```
S (Situation)  20% (~30s)   Context. When, where, what was happening.
T (Task)       10% (~15s)   YOUR specific responsibility.
A (Action)     50% (~90s)   What YOU did. Decisions, alternatives, tradeoffs. [THE MEAT]
R (Result)     20% (~30s)   Outcome with NUMBERS. Lessons learned.
```

### Google's 4 Evaluation Dimensions

| Dimension | What They Evaluate | Weight |
|-----------|--------------------|--------|
| General Cognitive Ability | Problem-solving, learning, structured thinking | ~25% |
| Leadership | Ownership, influence without authority, growing others | ~25% |
| Role-Related Knowledge | Technical depth, domain expertise | ~25% |
| Googleyness | Collaboration, humility, user focus, ambiguity tolerance | ~25% |

**Need 3.5+ average to pass. Behavioral is ~50% of your total evaluation!**

### 7 Traits of Googleyness

```
1. Intellectual Humility   -> "I was wrong, here's what I learned"
2. Comfort with Ambiguity  -> "Requirements unclear, so I ran experiments"
3. Bias to Action          -> "Prototyped over the weekend, it worked"
4. Collaboration           -> "Paired with them, they ended up owning it"
5. User Focus              -> "User testing showed X, so we prioritized that"
6. Ethical Awareness        -> "Found bias in model, added fairness metrics"
7. Growth Mindset          -> "Got feedback to improve X, here's how I did"
```

### 8 Stories You Need (Story Bank)

```
1. Led project end-to-end          -> Leadership, ownership, results
2. Resolved conflict/disagreement  -> Collaboration, influence, humility
3. Worked under ambiguity          -> Comfort with ambiguity, bias to action
4. Failed and learned              -> Humility, growth, resilience
5. Went above and beyond           -> Initiative, user focus
6. Mentored someone                -> Growing others, coaching
7. Tough tradeoff under pressure   -> Decision-making, structured thinking
8. Improved a process/system       -> Challenging status quo, impact
```

### Red Flags (Instant Rejection)

- Blaming others, no ownership: "It wasn't my fault"
- No specifics: vague stories without numbers
- No collaboration: "I built the whole thing myself"
- No growth: "I've never failed"

---

## Master Formula Card

```
+-------------------------------------------------------------------+
|  FORMULAS TO KNOW COLD FOR ANY ML INTERVIEW                       |
+-------------------------------------------------------------------+
|                                                                   |
|  Sigmoid:       sigma(z) = 1 / (1 + e^(-z))                      |
|  Softmax:       P(i) = e^(zi) / Sum(e^(zj))                      |
|  ReLU:          f(z) = max(0, z)                                  |
|  GELU:          f(z) = z * CDF(z)                                 |
|                                                                   |
|  Attention:     softmax(Q * K^T / sqrt(d_k)) * V                 |
|  Cross-Entropy: -Sum(yi * log(y_hat_i))                           |
|  MSE:           (1/n) * Sum((y - y_hat)^2)                        |
|                                                                   |
|  Gradient Desc: w = w - alpha * dL/dw                             |
|  Adam:          m, v tracking + bias correction                   |
|  Chain Rule:    dL/dw = (dL/dy)(dy/dz)(dz/dw)                    |
|                                                                   |
|  Bayes:         P(A|B) = P(B|A) * P(A) / P(B)                    |
|  Precision:     TP / (TP + FP)                                    |
|  Recall:        TP / (TP + FN)                                    |
|  F1:            2 * P * R / (P + R)                               |
|                                                                   |
|  Bias-Variance: Error = Bias^2 + Variance + Noise                |
|  Q-Learning:    Q(s,a) += alpha * [r + gamma*maxQ(s') - Q(s,a)]  |
|                                                                   |
|  Gini:          1 - Sum(pi^2)                                     |
|  Entropy:       -Sum(pi * log2(pi))                               |
|  Info Gain:     H(parent) - weighted_avg(H(children))             |
|                                                                   |
|  Cosine Sim:    (a . b) / (||a|| * ||b||)                        |
|  L2 Norm:       sqrt(Sum(vi^2))                                   |
|  PCA:           Top-k eigenvectors of covariance matrix           |
|  NDCG:          DCG / ideal_DCG                                   |
|                                                                   |
|  L1 Reg:        Loss + lambda * Sum(|w|)    -> sparsity           |
|  L2 Reg:        Loss + lambda * Sum(w^2)    -> shrinkage          |
|  Focal Loss:    -(1-pt)^gamma * log(pt)     -> imbalanced data    |
|                                                                   |
|  Scaling Laws:  Loss ~ 1/N^alpha                                  |
|  Chinchilla:    ~20 tokens per parameter for optimal training     |
+-------------------------------------------------------------------+
```

---

## Interview Day Reminders

```
+-------------------------------------------------------------------+
|  GOLDEN RULES FOR THE INTERVIEW                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  1. START SIMPLE, GO DEEP                                         |
|     "Let me explain the intuition first, then derive it."         |
|                                                                   |
|  2. ALWAYS DISCUSS TRADEOFFS                                      |
|     Never say "X is always better." When does X fail?             |
|                                                                   |
|  3. THINK OUT LOUD                                                |
|     Google evaluates your PROCESS, not just the answer.           |
|                                                                   |
|  4. CONNECT TO SCALE                                              |
|     "This works for 1K users, but at Google scale with 1B..."     |
|                                                                   |
|  5. DRAW DIAGRAMS                                                 |
|     "Let me draw this out to make it clearer."                    |
|                                                                   |
|  6. KNOW YOUR GAPS                                                |
|     "I'm not sure about X, but my intuition is..."               |
|     Better than confidently wrong.                                |
|                                                                   |
|  7. QUANTIFY IN BEHAVIORAL                                        |
|     "Reduced latency from 800ms to 200ms, 15% user improvement"  |
|     Not "improved performance."                                   |
|                                                                   |
|  8. CLARIFY BEFORE DESIGNING                                      |
|     Always ask about scale, latency, constraints first.           |
+-------------------------------------------------------------------+
```

---

## 18 — Worked Examples (Quick Numerical Walkthroughs)

### Self-Attention — Worked Example

```
Input: 3 tokens, each projected to Q, K, V of dimension d_k = 2

Q = [[1,0],    K = [[1,1],    V = [[1,2],
     [0,1],         [0,1],         [3,4],
     [1,1]]         [1,0]]         [5,6]]

Step 1: Q * K^T (score matrix — who attends to whom?)
  [[1,0],     [[1,0,1],     [[1, 0, 1],
   [0,1],  *   [1,1,0]]  =   [1, 1, 0],
   [1,1]]                     [2, 1, 1]]

Step 2: Scale by sqrt(d_k) = sqrt(2) = 1.414
  [[0.71, 0.00, 0.71],
   [0.71, 0.71, 0.00],
   [1.41, 0.71, 0.71]]

Step 3: Softmax (row-wise -> probabilities)
  Row 1: [0.40, 0.20, 0.40]  <- token 1 attends to tokens 1 and 3
  Row 2: [0.40, 0.40, 0.20]  <- token 2 attends to tokens 1 and 2
  Row 3: [0.50, 0.25, 0.25]  <- token 3 attends most to token 1

Step 4: Multiply by V (weighted sum of values)
  Output row 1 = 0.40*[1,2] + 0.20*[3,4] + 0.40*[5,6] = [3.0, 4.0]
  Output row 2 = 0.40*[1,2] + 0.40*[3,4] + 0.20*[5,6] = [2.6, 3.6]
  Output row 3 = 0.50*[1,2] + 0.25*[3,4] + 0.25*[5,6] = [2.5, 3.5]

Each token is now a WEIGHTED MIX of all value vectors!
```

### Backpropagation — Worked Example

```
Simple network: x=2 -> [w=0.5] -> z1=w*x=1.0 -> [sigmoid] -> z2=0.731 -> [MSE] -> L=0.072
Target y = 1.0

FORWARD:
  z1 = 0.5 * 2 = 1.0
  z2 = sigmoid(1.0) = 0.731
  L  = (1.0 - 0.731)^2 = 0.072

BACKWARD (chain rule, right to left):
  dL/dz2 = 2*(z2 - y) = 2*(0.731 - 1) = -0.538
  dz2/dz1 = sigmoid(z1)*(1 - sigmoid(z1)) = 0.731 * 0.269 = 0.197
  dz1/dw  = x = 2

  dL/dw = dL/dz2 * dz2/dz1 * dz1/dw
        = -0.538 * 0.197 * 2 = -0.212

UPDATE (learning rate = 0.1):
  w_new = 0.5 - 0.1 * (-0.212) = 0.521   <- weight increased (correct! prediction was too low)
```

### Gradient Boosting — Step by Step

```
Data: House A=$300K, House B=$500K, House C=$200K

Step 0: Predict mean = $333K for all
  Residuals: A=-33K, B=+167K, C=-133K

Step 1: Fit tree h1 to residuals, get predictions: A=-30K, B=+160K, C=-130K
  Learning rate eta = 0.1
  F1(A) = 333 + 0.1*(-30)  = $330K   (error: 30K, was 33K -> improving)
  F1(B) = 333 + 0.1*(160)  = $349K   (error: 151K, was 167K -> improving)
  F1(C) = 333 + 0.1*(-130) = $320K   (error: 120K, was 133K -> improving)

Step 2: Compute NEW residuals from F1, fit h2 to those...
  Each tree corrects remaining errors. After 100-1000 trees -> converged.
```

### PCA — Worked Example

```
5 data points: (2,4), (4,6), (6,8), (8,10), (10,12)

Step 1: Center -> mean = (6,8)
  Centered: (-4,-4), (-2,-2), (0,0), (2,2), (4,4)

Step 2: Covariance matrix
  C = [[8, 8],
       [8, 8]]

Step 3: Eigenvalues: lambda1 = 16, lambda2 = 0
  Eigenvector1 = [0.707, 0.707]  (diagonal direction)
  Variance explained by PC1: 16/16 = 100% (data lies on a line!)

Step 4: Project onto PC1:
  Reduced 2D -> 1D: [-5.66, -2.83, 0, 2.83, 5.66]
  Lost ZERO information because data was perfectly correlated.
```

---

## 19 — Top 20 Interview Quick Answers

> 30-second answers for the most commonly asked questions. Say these FIRST, then go deeper.

**Q1: "What is overfitting?"**
> Model memorizes training noise instead of learning the true pattern. High train accuracy but low test accuracy. Fix: regularization, more data, dropout, simpler model.

**Q2: "Explain bias-variance tradeoff."**
> Total error = Bias^2 + Variance + Noise. Simple models have high bias (systematic error). Complex models have high variance (sensitive to data). Goal: find the sweet spot.

**Q3: "How does gradient descent work?"**
> Iteratively update weights in the direction that reduces loss: w = w - alpha * gradient. Alpha is learning rate. Gradient points uphill, so we go opposite.

**Q4: "L1 vs L2 regularization?"**
> L1 (Lasso) adds Sum|w| to loss -> drives weights to exactly 0 = feature selection. L2 (Ridge) adds Sum(w^2) -> shrinks all weights, none to 0. Geometric reason: L1 constraint is a diamond, L2 is a circle.

**Q5: "How does a Transformer work?"**
> Self-attention: each token computes relevance to all others via softmax(QK^T/sqrt(dk))*V. Multi-head attention captures different relationships. Add positional encoding, layer norm, FFN. Stack N times.

**Q6: "What is backpropagation?"**
> Apply the chain rule backwards through the network to compute dL/dw for every weight. Each layer multiplies its local gradient. Then update weights via gradient descent.

**Q7: "Random Forest vs XGBoost?"**
> RF: parallel trees, random subsets, reduces variance, hard to overfit. XGBoost: sequential trees, each corrects errors, reduces bias, can overfit. XGBoost usually wins on accuracy, RF is more robust.

**Q8: "Your model has 99% accuracy on fraud detection. Is it good?"**
> Probably not. If only 1% of transactions are fraud, predicting "not fraud" always gives 99% accuracy. Use precision, recall, F1, and AUC-PR for imbalanced data.

**Q9: "What is RLHF?"**
> 3 stages: (1) SFT on human-written responses, (2) train reward model from human preference rankings, (3) use PPO to maximize reward while staying close to SFT model via KL penalty. Makes LLMs helpful, harmless, honest.

**Q10: "What is RAG?"**
> Retrieval-Augmented Generation: embed user query -> search vector DB for relevant docs -> feed docs + query as context to LLM -> generate grounded response. Reduces hallucination, handles knowledge cutoff.

**Q11: "Precision vs Recall — when to prioritize which?"**
> Precision when false positives are costly (spam filter — don't block real emails). Recall when false negatives are costly (cancer screening — don't miss disease). F1 when both matter equally.

**Q12: "What is data leakage?"**
> Using information at training time that wouldn't be available at prediction time. Examples: scaling before split, future features, target leakage. If AUC > 0.99 on a hard problem, suspect leakage.

**Q13: "Bagging vs Boosting?"**
> Bagging: independent parallel models, average to reduce variance (Random Forest). Boosting: sequential models, each corrects errors to reduce bias (XGBoost). Different problems = different choice.

**Q14: "What is the attention mechanism?"**
> For each token, compute how relevant every other token is (via Q*K^T), convert to probabilities (softmax), then take weighted sum of Values. Allows capturing long-range dependencies in parallel.

**Q15: "How do you handle missing data?"**
> First: understand WHY it's missing (MCAR/MAR/MNAR). Then: drop rows (<5%), impute with mean/median/KNN (5-30%), drop column (>30%). Always fit imputer on training data only.

**Q16: "Design a recommendation system."**
> Multi-stage: Retrieval (Two-Tower, ANN search, billions -> thousands) -> Ranking (Wide&Deep, features, thousands -> dozens) -> Re-ranking (diversity, freshness). Feature store for consistency. A/B test before launch.

**Q17: "What is transfer learning?"**
> Use a model pre-trained on a large dataset as starting point for a new task. Freeze early layers (general features), fine-tune later layers (task-specific). Works great with limited data.

**Q18: "Explain KV Cache."**
> During autoregressive generation, cache Key and Value tensors from previous tokens. Without cache: each new token recomputes attention for all N previous tokens (O(N^2)). With cache: only compute for the new token (O(N)).

**Q19: "What is feature engineering?"**
> Creating new informative features from raw data using domain knowledge. Examples: extract day-of-week from timestamp, compute distance from lat/lon, log-transform skewed features. Often matters more than model choice.

**Q20: "How do you evaluate an ML system in production?"**
> Offline metrics (AUC, NDCG) for development. A/B test for real-world validation. Guardrail metrics (revenue, latency) must not degrade. Monitor for data drift, concept drift, feedback loops. Gradual rollout.

---

## 20 — Modern LLM Landscape (2025-2026)

### Major Models Comparison

| Model | Organization | Architecture | Key Strength | Context |
|-------|-------------|-------------|-------------|---------|
| **GPT-4o** | OpenAI | Decoder-only (rumored MoE) | Multimodal (text+image+audio), reasoning | 128K |
| **Claude 4** | Anthropic | Decoder-only | Safety, long context, coding, agentic use | 1M |
| **Gemini 2.5** | Google | Decoder-only (MoE) | Multimodal, natively built for Google ecosystem | 1M+ |
| **LLaMA 4** | Meta | Decoder-only (MoE) | Open-source, natively multimodal | 128K-10M |
| **DeepSeek R1** | DeepSeek | Decoder-only (MoE) | Cost-efficient reasoning (671B total / 37B active) | 128K |
| **Mistral** | Mistral AI | Decoder-only | Efficient, sliding window attention | 128K |

### Key 2025-2026 Trends (Know for Interviews)

| Trend | What Changed |
|-------|-------------|
| **DPO replacing RLHF** | Simpler, more stable, no separate reward model. Industry standard by 2026 |
| **MoE everywhere** | Huge total params, small active per token. Better cost/quality tradeoff |
| **Long context (1M+ tokens)** | RoPE, Ring Attention, sliding window enable million-token contexts |
| **Agents as standard** | LLM + tools (code execution, search, APIs) in think-act-observe loops |
| **PEFT as default** | Full fine-tuning rare for >20B params. LoRA/QLoRA is the industry standard |
| **Multimodal native** | Text + image + audio + video in a single model (not bolted on) |
| **Reasoning models** | o3, DeepSeek R1 — generate hidden "thinking" tokens before final answer |
| **Speculative decoding** | Fast draft model + large verifier = 2-3x faster, zero quality loss |
| **INT4 quantization** | 8x smaller models with ~3-5% quality loss. Enables consumer deployment |
| **Constitutional AI** | AI self-critiques against written principles. Scales alignment beyond human feedback |

---

## 21 — Distributed Training & Inference

### Training Parallelism

| Strategy | What's Parallelized | When to Use |
|----------|-------------------|-------------|
| **Data Parallelism** | Same model on each GPU, different data batches. Sync gradients after each step. | Model fits on one GPU, need more throughput |
| **Model Parallelism (Tensor)** | Split individual layers across GPUs (e.g., half of attention heads per GPU) | Single layer too big for one GPU |
| **Pipeline Parallelism** | Different layers on different GPUs, data flows through the pipeline | Very deep model, sequential stages |
| **FSDP / ZeRO** | Shard optimizer states + gradients + params across GPUs; all-gather when needed | Standard for large model training (billions of params) |

### Inference Optimization

| Technique | Speedup | Quality Loss | How |
|-----------|---------|-------------|-----|
| **Quantization (INT8)** | ~2x | Minimal | Reduce weight precision from 32-bit to 8-bit |
| **Quantization (INT4)** | ~4x | ~3-5% | 4-bit weights. 70B model fits in ~35GB |
| **KV Cache** | ~10-100x | None | Store K,V from prior tokens, don't recompute |
| **Flash Attention** | ~2-4x | None | Tiled attention, O(n) memory instead of O(n^2) |
| **Speculative Decoding** | ~2-3x | None | Fast draft model + large verifier in parallel |
| **Model Distillation** | ~5-10x | Small | Train small "student" to mimic large "teacher" |
| **Batching** | ~5-20x throughput | None | Group requests, process on GPU together |
| **GQA** | ~4x less KV memory | Minimal | Share K,V heads across Q head groups |

---

## 22 — A/B Testing & Experimentation

### How to Design an A/B Test

```
1. HYPOTHESIS:  "New ranking model increases CTR by 2%"
2. METRICS:     Primary: CTR.  Guardrails: revenue, latency, crash rate
3. SAMPLE SIZE: n = (Z_alpha/2 + Z_beta)^2 * 2 * sigma^2 / delta^2
                (alpha=0.05, beta=0.2 for 80% power)
4. RANDOMIZE:   Split users (not requests!) 50/50 control vs treatment
5. DURATION:    1-2 weeks minimum (capture day-of-week patterns)
6. ANALYZE:     t-test or Mann-Whitney, check p < 0.05, inspect guardrails
7. ROLLOUT:     1% -> 5% -> 25% -> 50% -> 100%
```

### Common Pitfalls (Know These)

| Pitfall | Problem | Fix |
|---------|---------|-----|
| **Peeking** | Checking results early inflates false positive rate | Pre-commit to duration; use sequential testing if must peek |
| **Multiple comparisons** | Testing 20 metrics: ~1 will be "significant" by chance | Bonferroni correction: alpha_adj = alpha / num_tests |
| **Network effects** | User A's experience affects User B (social features) | Cluster randomization (by region, by social graph) |
| **Novelty effect** | Users try new feature just because it's new | Run long enough for effect to stabilize (2+ weeks) |
| **Simpson's paradox** | Aggregate shows improvement but every subgroup shows decline | Always check segment-level analysis |
| **Survivorship bias** | Only analyzing users who stayed, ignoring those who left | Intent-to-treat analysis (analyze everyone assigned) |

### Key Statistical Concepts

| Concept | Definition | Interview Answer |
|---------|-----------|-----------------|
| **p-value** | Probability of seeing this result (or more extreme) if H0 is true | p < 0.05 = reject null hypothesis. NOT probability H0 is true! |
| **Type I error** | False positive (reject H0 when it's true) | Controlled by alpha (typically 0.05) |
| **Type II error** | False negative (fail to reject H0 when it's false) | Controlled by power (1-beta, typically 0.80) |
| **Statistical power** | P(detect real effect when it exists) | 80% standard. More data = more power |
| **Confidence interval** | Range likely containing the true parameter | 95% CI: if we repeat experiment 100 times, ~95 CIs contain truth |

---

## 23 — ML Ethics & Fairness

### Types of Bias in ML

| Type | What It Is | Example |
|------|-----------|---------|
| **Selection bias** | Training data doesn't represent deployment population | Hiring model trained only on past hires (all male) |
| **Measurement bias** | Features measured differently for different groups | Health data less accurate for minorities |
| **Label bias** | Labels reflect human prejudice | Crime prediction trained on biased arrest data |
| **Aggregation bias** | One model for heterogeneous populations | Drug dosage model ignoring genetic differences |
| **Automation bias** | Over-trusting model predictions | Doctor deferring to AI even when it's clearly wrong |

### Fairness Metrics

| Metric | Formula | Meaning |
|--------|---------|---------|
| **Demographic parity** | P(Y_hat=1\|A=0) = P(Y_hat=1\|A=1) | Equal positive rates across groups |
| **Equal opportunity** | P(Y_hat=1\|Y=1,A=0) = P(Y_hat=1\|Y=1,A=1) | Equal TPR across groups |
| **Equalized odds** | Equal TPR AND FPR across groups | Strongest fairness constraint |

**Key tradeoff:** You CANNOT satisfy all fairness definitions simultaneously (impossibility theorem). State which one you chose and why.

### What Google Expects You to Know

- "How would you check for bias in your model?" -> Evaluate metrics per demographic slice. Compare TPR/FPR across groups.
- "How would you mitigate it?" -> Rebalance training data, add fairness constraints, post-process predictions, audit regularly.
- "Is fairness just a technical problem?" -> No. Requires stakeholder input, domain expertise, and ongoing monitoring.

---

## 24 — Google Products x ML Concepts

> When the interviewer asks "give an example," connect to Google products.

| Google Product | ML Concepts Used |
|---------------|-----------------|
| **Google Search** | Ranking (BERT, Transformers), Two-Tower retrieval, NDCG, A/B testing at scale |
| **YouTube Recommendations** | Two-Tower + Wide&Deep, multi-stage pipeline, position bias debiasing, watch-time optimization |
| **Gmail Spam Filter** | Binary classification, model cascade (fast rules + deep model), precision-focused |
| **Google Ads (CTR prediction)** | Wide&Deep, calibrated probabilities (P(click) * bid = ad score), real-time serving |
| **Google Translate** | Seq2seq Transformer, encoder-decoder, attention mechanism, BPE tokenization |
| **Google Photos** | CNN (EfficientNet), face clustering (embeddings + DBSCAN), transfer learning |
| **Google Maps ETA** | Regression, time-series features, GNN on road graph, real-time serving |
| **Google Assistant / Gemini** | Decoder-only Transformer, RLHF/DPO, RAG, agents with tool use, MoE |
| **Waymo (Self-Driving)** | CNN + Transformer for perception, RL for planning, sensor fusion, real-time inference |
| **Google Cloud Vertex AI** | Feature store, model registry, pipeline orchestration, A/B testing, monitoring |

---

## 25 — Common Trick Questions & How to Handle Them

| Trick Question | Why It's Tricky | Correct Response |
|---------------|----------------|-----------------|
| "Your model accuracy is 99%" | Class imbalance hides terrible minority-class performance | "What's the class distribution? I'd check precision, recall, F1, and AUC-PR" |
| "Should we always use deep learning?" | Not for tabular data with limited samples | "XGBoost beats DL on most tabular tasks. DL wins on images, text, and large unstructured data" |
| "More data always helps, right?" | Not if the problem is high bias (underfitting) | "More data helps high variance. For high bias, I need a more complex model or better features" |
| "Is correlation the same as causation?" | Classic trap | "No. Correlation shows association. Causation requires controlled experiments (A/B tests) or causal inference methods" |
| "Why not just use the biggest model?" | Inference cost, latency, diminishing returns | "Bigger models cost more per query. I'd start with the smallest that meets quality requirements, then scale up if needed" |
| "Can you overfit with Random Forest?" | People think ensembles can't overfit | "Yes, with very deep trees on small data. But RF is resistant compared to single trees. Boosting overfits more easily" |
| "Is accuracy a good metric?" | Almost always no for real-world problems | "Only if classes are balanced. For imbalanced: F1, AUC-PR. For ranking: NDCG. Always tie metrics to business goals" |
| "What's wrong with using test data for validation?" | Data leakage | "Optimizing hyperparameters on test data leaks info. Use a separate validation set. Test set is for FINAL evaluation only" |
| "Should you remove all outliers?" | Not always — they could be signal | "Investigate first. Outliers might be errors (remove) or valuable rare events like fraud (keep). Domain context matters" |
| "Why not train forever?" | Overfitting | "Monitor validation loss. Use early stopping. Past the sweet spot, the model memorizes training noise" |
