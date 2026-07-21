# ML Curriculum — Quick Revision

> This is a condensed revision recap of **Chapters 07–15** (the ML Curriculum group). Use it to skim key ideas before an interview or exam instead of re-reading every chapter in full. Formulas, decision rules, algorithm comparisons, and "must-know" flashcard facts are preserved; worked examples, full proofs, and deep coding walkthroughs live in the source chapters. Start here; go deeper in the originals for anything that feels fuzzy.

---

## Contents

- [Ch 07 — Introduction to ML](#ch-07--introduction-to-ml)
- [Ch 08 — Core Concepts & Terminology](#ch-08--core-concepts--terminology)
- [Ch 09 — Data Preprocessing](#ch-09--data-preprocessing)
- [Ch 10 — Supervised Learning](#ch-10--supervised-learning)
- [Ch 11 — Unsupervised Learning](#ch-11--unsupervised-learning)
- [Ch 12 — Key Algorithms Deep Dive](#ch-12--key-algorithms-deep-dive)
- [Ch 13 — Model Evaluation & Tuning](#ch-13--model-evaluation--tuning)
- [Ch 14 — Neural Networks & Deep Learning](#ch-14--neural-networks--deep-learning)
- [Ch 15 — Reinforcement Learning](#ch-15--reinforcement-learning)
- [One-page cheat recap](#one-page-cheat-recap)

---

## Ch 07 — Introduction to ML

> 💡 **In a sentence —** ML inverts traditional programming — instead of writing explicit rules, you supply labeled examples and let an algorithm discover the mapping from input to output.

### What ML Actually Is

> **Machine Learning is a subfield of AI in which algorithms learn patterns from data instead of being explicitly programmed with rules.** — Arthur Samuel (1959): "gives computers the ability to learn without being explicitly programmed."

```
Traditional Programming          Machine Learning
─────────────────────            ─────────────────────
Rules + Input → Output           Input + Output → Rules
(human writes the logic)         (algorithm discovers it)
```

A spam filter the traditional way: an engineer writes hundreds of `if "free prize" in email → spam` rules. An ML spam filter: show it 10,000 labeled (email, spam/not-spam) pairs; it learns the rules automatically. When new spam tactics emerge, you just add more training data — no rule rewriting.

### The AI Family Tree

```
┌──────────────────────────────────────────────┐
│  ARTIFICIAL INTELLIGENCE  (goal: appear smart)│
│  ┌──────────────────────────────────────────┐ │
│  │  MACHINE LEARNING  (learned from data)   │ │
│  │  ┌──────────────────────────────────┐    │ │
│  │  │  DEEP LEARNING  (neural nets)    │    │ │
│  │  │  ┌──────────────────────────┐    │    │ │
│  │  │  │  GENERATIVE AI           │    │    │ │
│  │  │  │  (makes new content)     │    │    │ │
│  │  │  └──────────────────────────┘    │    │ │
│  │  └──────────────────────────────────┘    │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

Key distinction: Classical ML needs **hand-designed features** (a human decides which features to extract); Deep Learning **learns its own features** from raw pixels, audio waveforms, or text tokens.

### The Four Types of ML

| Type | Input | Learning signal | Flagship example |
|---|---|---|---|
| **Supervised** | Features + labels (X, y) | Human-labeled targets | Gmail spam filter |
| **Unsupervised** | Features only (X) | Hidden structure | Customer segmentation |
| **Self-supervised** | Raw data only (X) | Labels generated from data itself | GPT / BERT pre-training |
| **Reinforcement** | Environment state | Scalar reward via trial-and-error | AlphaGo, ChatGPT RLHF |

Self-supervised is the secret behind LLMs: take a sentence, hide one word, predict it. Repeat on billions of sentences. No human annotation required — the data labels itself.

### When to Use ML vs When NOT To

**Use ML when:**
- Problem is too complex for hand-coded rules (image recognition, speech)
- Rules change frequently (spam tactics evolve, fraud patterns shift)
- Problem involves large volumes of data with hidden patterns
- You can accept probabilistic, "usually correct" answers

**Do NOT use ML when:**
- A simple rule works (if age >= 18 → adult)
- Very little data (< a few hundred examples → rule-based or prior knowledge)
- Every decision must be 100% explainable (some legal/medical contexts)
- The cost of errors is catastrophic and training data is unreliable

### The 7-Step ML Workflow

```
STEP 1 — DEFINE THE PROBLEM
         Metric? Binary clf? Regression? What's "good enough"?

STEP 2 — COLLECT DATA
         Databases, APIs, web scraping, crowdsourced labeling

STEP 3 — EXPLORE & CLEAN (EDA)
         Missing values, outliers, class imbalance, distributions

STEP 4 — FEATURE ENGINEERING
         Normalize, encode, create ratios, decompose dates

STEP 5 — SPLIT & TRAIN
         Train/Val/Test split; fit model; tune hyperparameters

STEP 6 — EVALUATE
         Metrics on held-out test set; is it good enough?

STEP 7 — DEPLOY & MONITOR
         Serve as REST API; log predictions; detect data drift
```

> **The 80% rule:** practitioners spend ~80% of their time on Steps 2–4 (data collection, cleaning, feature engineering) and only ~10–20% on actual modeling. Model selection rarely matters as much as data quality.

### Classical ML vs Deep Learning — Decision Guide

```
Use CLASSICAL ML when:                Use DEEP LEARNING when:
───────────────────────               ────────────────────────────
Tabular/structured data               Images, audio, text, video
< 100K training examples              Millions of examples available
Need interpretability                 Cutting-edge accuracy matters
Limited compute budget                GPUs / TPUs available
Quick iteration required              Data is raw / unstructured
```

Surprising fact: on tabular data, Gradient Boosting (XGBoost, LightGBM) still wins most Kaggle competitions — even in the deep learning era. Deep learning's edge is almost entirely in unstructured data.

---

> ✅ **Must-remember**
>
> - ML = Input + Output → Rules (inverted vs traditional programming)
> - AI ⊃ ML ⊃ Deep Learning ⊃ Generative AI (Russian nesting dolls)
> - 4 types: supervised (labels), unsupervised (structure), self-supervised (self-labeling), RL (reward)
> - 80% of data-science time is data preparation, not modeling
> - For tabular data, gradient boosting usually beats deep learning

---

## Ch 08 — Core Concepts & Terminology

> 💡 **In a sentence —** This chapter is the vocabulary of ML training — features, loss functions, gradient descent, optimizers, the bias-variance tradeoff, and regularization — the plumbing behind every model.

### Features, Labels, Splits

**Feature** ($x$): a measurable input variable (age, pixel value, word count). Feature types: continuous (height), discrete (number of rooms), categorical/nominal (color), ordinal (rating 1–5), binary (spam/not-spam), temporal (timestamp).

**Label** ($y$): the target output being predicted. Regression: continuous number. Classification: discrete category.

| Split | Purpose | Typical size |
|---|---|---|
| **Training** | Fit model parameters | 60–80% |
| **Validation** | Tune hyperparameters; model selection | 10–20% |
| **Test** | Final unbiased performance estimate | 10–20% |

Rules: small data (<10K) → 70/15/15; medium (100K) → 80/10/10; large (>1M) → 98/1/1 (1% of 1M = 10K test samples, plenty).

**Parameters** = numbers *inside* the model, learned from data (weights $w$, biases $b$).  
**Hyperparameters** = settings *you* choose before training (learning rate $\alpha$, number of layers, batch size, regularization strength $\lambda$).

Parameters are found by optimization. Hyperparameters are found by search (grid, random, Bayesian).

### The Training Loop (6 Lines of Math)

```
FOR each mini-batch (X_batch, y_batch):
  STEP 1 — FORWARD PASS:    ŷ = f(X_batch; W)
  STEP 2 — COMPUTE LOSS:    L = loss(ŷ, y_batch)
  STEP 3 — BACKWARD PASS:   compute ∂L/∂W via chain rule
  STEP 4 — UPDATE WEIGHTS:  W ← W − α × ∂L/∂W
  REPEAT until convergence
```

**Epoch** = one complete pass through the entire training dataset.  
**Batch (mini-batch)** = the subset of training data used for one weight update.  
**Iteration** = one forward + backward pass on one batch.  
Iterations per epoch = ⌈dataset_size / batch_size⌉.

### Loss Functions

| Loss | Task | Formula | Key property |
|---|---|---|---|
| **MAE** | Regression | $\frac{1}{n}\sum|\hat{y}-y|$ | Robust to outliers |
| **MSE** | Regression | $\frac{1}{n}\sum(\hat{y}-y)^2$ | Penalizes large errors heavily |
| **RMSE** | Reporting | $\sqrt{\text{MSE}}$ | Same units as target; most reported |
| **Huber** | Regression | MSE if $|e|<\delta$ else MAE-scaled | Best of both worlds |
| **Binary Cross-Entropy** | Binary clf | $-[y\log\hat{y}+(1-y)\log(1-\hat{y})]$ | Pair with sigmoid |
| **Categorical CE** | Multi-class | $-\sum_i y_i\log\hat{y}_i$ | Pair with softmax |
| **KL Divergence** | Distribution matching | $\sum P\log(P/Q)$ | VAEs, knowledge distillation, RLHF |
| **Hinge** | Binary clf (SVM) | $\max(0, 1 - y\hat{y})$ | Max-margin classifiers |

> Cross-entropy punishes **confident wrong answers severely**: predicting 0.01 when truth is 1 costs $-\log(0.01) \approx 4.6$; predicting 0.9 costs $-\log(0.9) \approx 0.1$. This logarithmic penalty drives networks toward calibrated confident predictions.

### Gradient Descent — Core Intuition

The loss surface is a hilly landscape over weight space. Gradient descent walks downhill by repeatedly subtracting the gradient:

$$W_{\text{new}} = W_{\text{old}} - \alpha \cdot \frac{\partial L}{\partial W}$$

The gradient $\partial L/\partial W$ is a vector pointing uphill (direction of steepest increase). We subtract it to go downhill. $\alpha$ (learning rate) controls step size.

**Learning rate effects:**
```
Too small (α=0.00001): correct direction, glacially slow
Just right (α=0.001):  smooth convergence ✓
Too large (α=10):      overshoots the minimum, diverges
```

**Three variants:**

| Variant | Examples per update | Noise | Use |
|---|---|---|---|
| Batch GD | All N | Smooth; exact gradient | Convex problems with small data |
| SGD (stochastic) | 1 | Very noisy; can escape local minima | Rarely used bare |
| **Mini-batch GD** | 32–512 | Balanced; GPU-friendly | **De-facto standard** |

Mini-batch size 32–256 is typical. Larger batch → less noisy gradient but needs more memory; smaller → noisier but can escape local minima better.

### Optimizers

**SGD (baseline):** $w \leftarrow w - \alpha g$

**SGD + Momentum** (adds "rolling ball" physics):
$$v \leftarrow \beta v + g \qquad w \leftarrow w - \alpha v \quad (\beta \approx 0.9)$$
Momentum carries the optimizer through narrow valleys and over small bumps.

**Adam** (Adaptive Moment Estimation):
$$m_t = \beta_1 m_{t-1} + (1-\beta_1)g_t \quad \text{(1st moment)}$$
$$v_t = \beta_2 v_{t-1} + (1-\beta_2)g_t^2 \quad \text{(2nd moment)}$$
$$\hat{m} = m_t/(1-\beta_1^t); \quad \hat{v} = v_t/(1-\beta_2^t) \quad \text{(bias-corrected)}$$
$$w \leftarrow w - \alpha\frac{\hat{m}}{\sqrt{\hat{v}}+\epsilon}$$

Adam defaults: $\alpha=0.001$, $\beta_1=0.9$, $\beta_2=0.999$, $\epsilon=10^{-8}$.

Each parameter gets its own adaptive learning rate — frequently-updated features get smaller rates (prevents overshooting), rarely-updated features get larger rates (encourages learning).

**AdamW** = Adam + decoupled weight decay. Preferred for Transformers and LLMs (GPT, BERT, T5).

**Rule of thumb:** Start with Adam (lr=0.001). SGD + Momentum if tuning for final 1% of accuracy. AdamW for Transformers.

### Weight Initialization

Poor initialization → vanishing (all weights near zero → all activations near zero → gradients near zero) or exploding gradients.

| Scheme | Formula | Use with |
|---|---|---|
| **Xavier / Glorot** | $W \sim U\!\left[-\sqrt{6/(n_\text{in}+n_\text{out})},\,\sqrt{6/(n_\text{in}+n_\text{out})}\right]$ | Tanh, sigmoid activations |
| **He (Kaiming)** | $W \sim \mathcal{N}(0,\, 2/n_\text{in})$ | ReLU and its variants |

Xavier preserves gradient variance for tanh/sigmoid; He accounts for the fact that ReLU kills half its inputs (hence the ×2 factor in the variance).

> **Rule:** He initialization for ReLU networks; Xavier for sigmoid/tanh. Batch Normalization reduces sensitivity to initialization.

### Overfitting, Underfitting, the Goldilocks Problem

```
UNDERFITTING              JUST RIGHT               OVERFITTING
(High Bias)               (Balanced)               (High Variance)
─────────────────         ─────────────────         ─────────────────
Train acc: 60%            Train acc: 91%            Train acc: 99.8%
Val   acc: 59%            Val   acc: 89% ← GOAL     Val   acc: 63%
Both curves low           Close together            Large gap
Model too simple          Captures real pattern     Memorizes training data
```

### The Bias-Variance Decomposition

$$\text{Total Error} = \underbrace{\text{Bias}^2}_{\text{underfitting}} + \underbrace{\text{Variance}}_{\text{overfitting}} + \underbrace{\text{Irreducible Noise}}_{\text{inherent randomness}}$$

- **Bias²**: error from wrong model assumptions. Simple models: high bias (straight line fitting a curve).
- **Variance**: sensitivity to fluctuations in training data. Complex models: high variance (tiny change in training data → very different model).
- **Irreducible noise**: sensor noise, labeling errors — no model can eliminate this.

You cannot drive both bias and variance to zero simultaneously with a fixed dataset. The tradeoff: adding complexity reduces bias but increases variance.

### Learning Rate Schedules

A fixed learning rate is rarely optimal. Common schedules:

- **Step decay:** halve LR every N epochs
- **Cosine annealing:** $\eta_t = \eta_\text{min} + \frac{1}{2}(\eta_\text{max}-\eta_\text{min})(1+\cos(\pi t/T))$ — smooth decay, easy restart
- **Warmup + decay:** start with small LR, ramp up for first few thousand steps, then decay (used in Transformers — prevents large early updates before embeddings stabilize)
- **OneCycleLR (super-convergence):** one cycle up then down; trains in fewer epochs with larger max LR

General rule: higher LR early (fast progress on loss plateau) → lower LR later (fine-grained convergence).

### Regularization Techniques

**L2 (Ridge):** $L = L_{\text{data}} + \lambda\sum_i w_i^2$

Adds a smooth quadratic penalty. All weights shrink toward (but not exactly to) zero. Handles collinear features by spreading weight. Best when all features contribute.

**L1 (Lasso):** $L = L_{\text{data}} + \lambda\sum_i |w_i|$

The absolute-value penalty has a corner at zero — optimizer easily drives irrelevant weights to *exactly* zero. Built-in feature selection. Best when few features truly matter.

**Elastic Net:** $L = L_{\text{data}} + \lambda_1\sum|w_i| + \lambda_2\sum w_i^2$

Combines sparsity (L1) with stability under correlated features (L2).

**Dropout:** randomly zero out fraction $p$ of neurons each training forward pass. Network cannot rely on any single neuron; builds redundant representations. At inference: all neurons active, outputs scale by $(1-p)$. Typical $p$: 0.3–0.5 for dense layers, 0.1–0.2 for convolutional.

**Early Stopping:** monitor validation loss every epoch; stop when it starts increasing; save the best checkpoint. Free regularization — the simplest technique that reliably works.

```
val loss
  │       ← best checkpoint here
  │      ╱
  │─────╱         ← save this
  │    ╱
  │───────────────────────────── epoch
    ↑ stop here (val loss rising = overfitting)
```

> Rule: L1 if you want feature selection (many irrelevant features exist). L2 if features are correlated or all contribute. Dropout for neural networks. Early stopping always.

---

> ✅ **Must-remember**
>
> - Parameters learned from data; hyperparameters set by you
> - Training loop: forward → loss → backward → update; repeat per mini-batch
> - Total Error = Bias² + Variance + Noise; complex models trade bias for variance
> - Adam (lr=0.001) is the default optimizer; AdamW for Transformers
> - L1 → exact zeros (Lasso, feature selection); L2 → shrinks all (Ridge, handles collinearity)
> - Early stopping is the simplest regularizer: monitor val loss, save best checkpoint

---

## Ch 09 — Data Preprocessing

> 💡 **In a sentence —** Data preprocessing is 80% of the job — clean, well-encoded, appropriately scaled data beats any algorithm upgrade, and bad preprocessing silently destroys models.

### The 6-Step Preprocessing Pipeline

```
Raw Data
  ──► 1. Handle Missing Values   (impute or drop strategically)
  ──► 2. Remove Duplicates        (identical rows fool training)
  ──► 3. Handle Outliers          (IQR or Z-score detection)
  ──► 4. Encode Categoricals      (OHE, ordinal, target encoding)
  ──► 5. Scale/Normalize Features (standardize or min-max)
  ──► 6. Feature Engineering      (create new, remove useless)
  ──► Clean Features ✓
```

### Missing Values

Three root causes with very different implications:

| Type | Meaning | Risk | Strategy |
|---|---|---|---|
| **MCAR** (Missing Completely At Random) | Random glitch; no pattern | Low | Drop row or impute mean |
| **MAR** (Missing At Random) | Depends on other observed data | Moderate | Model-based imputation |
| **MNAR** (Missing Not At Random) | Depends on the missing value itself | High — biased | Add indicator column; use domain knowledge |

**Imputation strategies:**

| Strategy | When to use |
|---|---|
| Drop row | < 5% missing; MCAR; row has little predictive value |
| Fill mean | Symmetric continuous; no outliers |
| Fill median | Skewed distribution or outliers present (robust) |
| Fill mode | Categorical features |
| Add indicator column | Missingness is informative (MNAR) |
| Drop column | > 30–40% missing and low predictive value |

```python
# Median imputation — robust to outliers
from sklearn.impute import SimpleImputer
imp = SimpleImputer(strategy='median')
X_train_imp = imp.fit_transform(X_train)   # fit on train only!
X_test_imp  = imp.transform(X_test)        # apply to test
```

### Outlier Detection

**IQR (Interquartile Range) Method:**

$$IQR = Q3 - Q1$$
$$\text{Lower fence} = Q1 - 1.5 \times IQR \qquad \text{Upper fence} = Q3 + 1.5 \times IQR$$

Values outside these fences are flagged as outliers. Robust — unaffected by extreme values themselves.

**Z-score method:**

$$Z = \frac{x - \mu}{\sigma} \qquad |Z| > 3 \Rightarrow \text{likely outlier}$$

Assumes approximately normal distribution. Modified Z-score uses median absolute deviation (MAD) for robustness.

**Outlier handling options:** remove row (only if genuine measurement error), cap/winsorize (replace with fence value), transform (log transforms compress extreme values), keep (if the extreme value is a valid rare event).

### Encoding Categorical Features

| Method | When to use | Pitfall |
|---|---|---|
| **Label Encoding** | Ordinal data only (Small=0, Med=1, Large=2) | Creates fake ordering for nominal data |
| **One-Hot Encoding** | Nominal, low-cardinality (< ~20 categories) | Adds many columns for high-cardinality; multicollinearity (drop one column) |
| **Ordinal Encoding** | Ordered categories; manually specify order | Must define order correctly |
| **Target Encoding** | High-cardinality (cities, zip codes, user IDs) | Leakage risk; compute on training split only |
| **Frequency Encoding** | High-cardinality; fast alternative | Doesn't encode target relationship |
| **Hashing Trick** | Very-high-cardinality; online learning | Collisions possible |
| **Embeddings** | Neural networks; dense learned representation | Needs enough data per category |

> For 10,000 unique zip codes: one-hot → 10,000 new columns (memory disaster). Target encoding → 1 column with learned signal. Always compute target encoding statistics from **training fold only** to avoid leakage.

### Feature Scaling

**Why it matters:** algorithms that use distances (KNN, K-Means) or gradient descent (linear models, neural nets, SVM) are sensitive to feature scale. A feature in millions (salary) will dominate one in units (age) without scaling.

**Min-Max Normalization** — scales to [0, 1]:

$$X_{\text{scaled}} = \frac{X - X_{\min}}{X_{\max} - X_{\min}}$$

Use for: neural networks (pixel values), KNN, K-Means. Sensitive to outliers (one 300-cm-tall person distorts the entire scale).

**Standardization (Z-score)** — transforms to mean=0, std=1:

$$X_{\text{scaled}} = \frac{X - \mu}{\sigma}$$

Use for: linear models, SVM, PCA, most sklearn estimators. Robust to moderate outliers. **Default choice** when unsure.

**Robust Scaler** — uses median and IQR instead of mean/std. Best for heavy outliers.

> **CRITICAL — The Golden Rule of Scaling:**
> ```
> WRONG: scaler.fit(X_all_data)   → test statistics leak into training
> RIGHT: scaler.fit(X_train)      → transform X_train and X_test separately
> ```
> Fitting on all data is silent data leakage — your test metrics will be optimistically biased.

### Feature Engineering

**Transformations:** log for right-skewed data (house prices, income, counts); Box-Cox; square root.

**Date decomposition:** from one datetime column → year, month, day_of_week, hour, is_weekend, is_holiday, days_since_event.

**Interaction terms:** multiply or divide features; e.g., `price_per_sqft = price / sqft`.

**Binning:** convert continuous to ordinal (age → "young/middle/senior").

### Feature Selection — When to Remove Features

Remove: near-zero variance features (same value in 99% of rows), highly correlated features (keep one from each correlated pair), features with no correlation to the target.

Methods: filter (correlation, chi-squared, mutual information), wrapper (recursive feature elimination — RFE), embedded (Lasso, tree feature importances).

### Feature Selection in Practice

Three tiers of feature selection:

**Filter methods** (model-agnostic, fast): variance threshold (remove near-constant columns), Pearson correlation (remove features correlated > 0.95 with another), mutual information / chi-squared score (rank features by dependency on target). Run before fitting any model.

**Wrapper methods** (fit model, measure impact): Recursive Feature Elimination (RFE) — fit model, remove weakest feature, refit, repeat. Slow but accurate. Best for moderate feature counts (< 500).

**Embedded methods** (regularization inside model training): Lasso drives irrelevant feature weights to exactly zero during training. Tree-based feature importance (Random Forest, XGBoost) ranks features by impurity reduction or permutation importance. Fastest for high-dimensional data.

### Top 5 Preprocessing Mistakes

1. **Scaling before splitting** → test statistics leak into training → inflated metrics
2. **Dropping all rows with missing values** → lose massive signal if MNAR; shrinks dataset
3. **OHE for high-cardinality features** → 1,000 cities → 1,000 columns (memory/overfitting)
4. **Not handling outliers before scaling** → one extreme value distorts min-max for everyone
5. **Label encoding nominal data** → algorithm "learns" `blue > red` because 2 > 1

---

> ✅ **Must-remember**
>
> - IQR fence: $Q1-1.5 \times IQR$ to $Q3+1.5 \times IQR$; Z-score: $|Z|>3$
> - One-hot for nominal; ordinal for ordered; target encoding for high-cardinality
> - Fit scaler on **training data only**, then transform both train and test
> - Log-transform right-skewed targets/features before modeling
> - Feature engineering (combining, decomposing, transforming) often matters more than model choice

---

## Ch 10 — Supervised Learning

> 💡 **In a sentence —** Supervised learning trains a mapping $f: X \rightarrow y$ from labeled examples — classification (discrete output) or regression (continuous output) — and the choice of algorithm depends on data size, interpretability needs, and the shape of the decision boundary.

### Classification vs Regression

```
             SUPERVISED LEARNING
                      │
          ┌───────────┴────────────┐
          ▼                        ▼
    CLASSIFICATION             REGRESSION
    Discrete output            Continuous output
    Loss: Cross-Entropy        Loss: MSE / MAE
    Metrics: F1, AUC, Acc      Metrics: RMSE, MAE, R²
```

Classification subtypes:
- **Binary**: one sigmoid output → threshold at 0.5 (adjustable per domain cost)
- **Multi-class**: softmax, K outputs that sum to 1 (only one class can be true at once)
- **Multi-label**: K independent sigmoid outputs — multiple labels can all be true (movie can be action AND comedy)

### Data Splitting and Leakage

Why three splits, not two: training to fit → validation to tune → **test to honestly report**. Tuning on the test set inflates metrics; the test set must be invisible until the final report.

**K-fold cross-validation:** split into K folds; each fold serves as val once; average K scores gives more reliable estimate than one val split. K=5 is default; K=10 for small datasets.

**Always use Stratified K-fold for classification** — preserves class distribution per fold. Without stratification, a fold could have zero examples of a rare class.

**Common data leakage patterns:**
```
1. Scaling/encoding on ALL data before splitting
   → test statistics contaminate training (silent!)

2. Feature engineering on the full dataset
   → e.g., computing "average salary by city" includes test labels

3. Random train/test split on time series
   → model "sees" the future during training

4. Same entity duplicated in both train and test
   → model memorizes individual examples
```

### Logistic Regression

The go-to classification baseline — interpretable, fast, well-calibrated probability outputs.

$$z = w_0 + \sum_{i=1}^n w_i x_i \qquad \hat{y} = \sigma(z) = \frac{1}{1+e^{-z}}$$

Properties of sigmoid: outputs $\in (0,1)$; $\sigma(0)=0.5$; decision boundary at $z=0$ is always a linear hyperplane. Cannot model XOR or any non-linear boundary without feature engineering.

Multiclass extension: **One-vs-Rest (OvR)** trains K binary classifiers (fast, common); **Softmax/Multinomial** trains one unified model with $P(k|x) = e^{z_k}/\sum_j e^{z_j}$.

Threshold tuning: lower threshold → more positives flagged (↑ Recall, ↓ Precision, ideal for cancer detection); raise it → stricter (↑ Precision, ↓ Recall, ideal for spam filter where false positives lose real mail).

### K-Nearest Neighbours (KNN)

Stores all training data. At prediction time: find K nearest training points by distance; majority vote (classification) or average (regression). No explicit training step ("lazy learner").

**Distance metrics:** Euclidean ($\sqrt{\sum(x_i-y_i)^2}$, default), Manhattan ($\sum|x_i-y_i|$, better for high-dim sparse), Cosine (angle between vectors, NLP).

**K selection:** K=1 → jagged, overfitting boundary. K=N → always predicts the majority class. Rule of thumb: K=√n, always odd for binary classification.

**Must scale features** — a feature in thousands dominates a binary feature entirely.

Complexity: O(nd) per prediction, O(1) training, O(nd) memory. Impractical beyond ~100K samples or high dimensions.

### Decision Trees — Split Mechanics

At each node, try every (feature, threshold) pair; pick the one that maximally reduces impurity:

$$\text{Gini}(S) = 1 - \sum_{c=1}^C p_c^2 \qquad \text{Entropy}(S) = -\sum_{c=1}^C p_c \log_2 p_c$$

$$\text{Information Gain} = \text{Entropy}(\text{parent}) - \sum_k \frac{|S_k|}{|S|} \text{Entropy}(S_k)$$

Both metrics peak at maximum uncertainty (uniform distribution) and reach zero for pure nodes. In practice, Gini and Entropy produce identical trees > 98% of the time. Gini is faster (no logarithm).

Key hyperparameters: `max_depth` (depth 5–10 prevents overfitting), `min_samples_leaf` (prevents tiny over-specific leaves), `max_features` (for randomized trees).

**Strengths:** fully interpretable; no feature scaling needed; handles mixed types; fast predictions.  
**Weaknesses:** high variance (small data change → very different tree); prone to overfit without pruning.

### SVM (Support Vector Machine)

Finds the hyperplane with maximum margin between the classes. Only the nearest training points (support vectors) influence the boundary.

```
     × × ×             × × ×
      × ×              × × ×
       Margin ←→         ←→ ← Support vectors
      ○ ○                ○ ○ ○
     ○ ○ ○              ○ ○ ○
```

**Kernel trick:** implicitly maps data to higher-dimensional space where classes are linearly separable, without computing the transformation explicitly.

$$K_{\text{RBF}}(x,z) = \exp\!\left(-\gamma\|x-z\|^2\right) \quad \text{(most popular)}$$

$\gamma$ large → tight/wiggly boundary (overfit); $\gamma$ small → smooth boundary (underfit).  
$C$ large → hard margin (few misclassified, overfit risk); $C$ small → soft margin (allows some errors, better generalization).

SVM training: O(n² to n³) — impractical beyond ~50K samples. Use linear SVM or logistic regression for large datasets.

### Naive Bayes

$$P(y|x_1,...,x_n) \propto P(y)\prod_{i=1}^n P(x_i|y)$$

"Naive" because it assumes features are conditionally independent given the class — an almost-never-true assumption that empirically works very well for text. **Laplace smoothing**: add 1 to every count to avoid zero-probability for unseen words: $P(w|c) = (count(w,c)+1)/(count(c)+|V|)$.

### Ensemble Methods — Bagging and Boosting

**Random Forest (Bagging):**
```
N training examples
  → B bootstrap samples (sample N rows with replacement)
  → train B independent decision trees IN PARALLEL
  → each split: try only √p features at random
  → prediction: majority vote (clf) / average (reg)
EFFECT: REDUCES VARIANCE
```

The key insight: averaging many trees reduces variance (like averaging noisy measurements). But if trees are identical, averaging doesn't help. Random feature subsets **decorrelate the trees** — each tree is different and their errors partially cancel.

Key hyperparameters: `n_estimators` (200–500 usually enough), `max_depth`, `max_features` (√p for clf, p/3 for reg), `min_samples_leaf`. OOB (out-of-bag) score uses the ~37% of samples not drawn per tree as a free validation estimate.

**Gradient Boosting:**

Each new tree fits the **pseudo-residuals** (negative gradient of loss w.r.t. current ensemble predictions):

```
F₀ = mean(y)
For m = 1, 2, ..., M:
    rᵢ = −∂L(yᵢ, Fₘ₋₁(xᵢ))/∂Fₘ₋₁(xᵢ)   ← pseudo-residuals
    Train tree hₘ on {(xᵢ, rᵢ)}
    Fₘ = Fₘ₋₁ + η·hₘ                       ← η = learning rate
EFFECT: REDUCES BIAS
```

Small learning rate (0.05–0.1) + more trees + early stopping = dominant regularization.

| Library | Growth strategy | Key advantage |
|---|---|---|
| **XGBoost** | Level-wise (full depth first) | Regularized, GPU, early Kaggle champion |
| **LightGBM** | Leaf-wise (deepest leaf first) | 10–30× faster on large data |
| **CatBoost** | Symmetric (balanced) trees | Native categorical handling, no preprocessing |

**Bagging vs Boosting comparison:**

| Property | Bagging (Random Forest) | Boosting (XGBoost) |
|---|---|---|
| Trees built | Parallel | Sequential |
| Reduces | Variance | Bias |
| Sensitive to noise? | No (robust) | Yes (noisy labels hurt) |
| Overfit risk | Low | Higher (needs careful tuning) |
| Speed | Parallelizable | Sequential; LightGBM compensates |

### Algorithm Selection for Supervised Learning

| Situation | First Choice | Why |
|---|---|---|
| Regulatory/interpretability required | Logistic Regression or Decision Tree | Fully explainable coefficients |
| Quick baseline | Logistic Regression | Minutes to fit; calibrated probabilities |
| Text classification | Logistic Regression or Naive Bayes | Sparse linear models dominate |
| Structured tabular, max accuracy | XGBoost or LightGBM | State of the art for tabular data |
| Many categorical features | CatBoost | Native categorical handling |
| Very small dataset (<1K) | SVM or KNN | Effective in low-data regimes |
| High-dimensional sparse (NLP) | Logistic Regression or SVM (linear) | Efficient with sparse features |
| Images, audio, video | CNN (deep learning) | Needs learned spatial features |

### Class Imbalance — The 99% Trap

In fraud detection (0.1% fraud), spam filtering, or medical diagnosis, a model that always predicts the majority class gets 99.9% accuracy but catches nothing.

**Solutions:**

| Approach | How it works | Best for |
|---|---|---|
| **Adjust threshold** | Lower decision boundary to catch more positives | Any model with probability outputs |
| **Class weight** | Multiply loss by $N_\text{neg}/N_\text{pos}$ for minority class | Sklearn `class_weight='balanced'` |
| **SMOTE (oversample)** | Synthesize new minority class points by interpolating between neighbors | Small minority class |
| **Undersample** | Randomly remove majority class rows | Very large majority class |
| **Ensemble approaches** | BalancedRandomForest, EasyEnsemble | Robust to imbalance |

Always use Stratified K-fold and AUC-PR (not accuracy or AUC-ROC) to evaluate imbalanced models.

---

> ✅ **Must-remember**
>
> - Classification predicts discrete labels; regression predicts continuous values — both learn $f: X \rightarrow y$ from labeled pairs.
> - Prevent leakage: split first, then fit scalers/encoders on **train only**; use Stratified K-fold for imbalanced classes.
> - Linear baselines (Logistic Regression, Linear/Ridge/Lasso) are interpretable and fast — always try one before reaching for complex models.
> - Trees overfit alone → ensemble them: **Bagging** (Random Forest, parallel, cuts variance) vs **Boosting** (XGBoost/LightGBM, sequential, cuts bias).
> - SVM maximizes the margin (kernel trick for non-linear boundaries); KNN is lazy and distance-based, so scale features first.
> - Class-imbalance "99% trap": never trust raw accuracy — use AUC-PR / F1, class weights, or SMOTE.

---

## Ch 11 — Unsupervised Learning

> 💡 **In a sentence —** Unsupervised learning discovers hidden structure in unlabeled data — grouping similar examples, compressing representations, detecting anomalies, or finding associations — no labels required.

### The Curse of Dimensionality

As the number of dimensions $d$ grows:
- Volume of the feature space grows exponentially ($2^d$ for binary; scales with $r^d$ for hyperspheres)
- Points become increasingly equidistant — distance metrics lose meaning
- A nearest-neighbor in 1000 dimensions might be no closer than a random point

$$\lim_{d \to \infty} \frac{\text{dist}_{\max} - \text{dist}_{\min}}{\text{dist}_{\min}} \to 0 \quad \text{(all distances converge)}$$

Consequence: KNN accuracy degrades, K-Means clusters become arbitrary, density estimates break. Rule of thumb: need 5–10× more data per added dimension.

Remedy: PCA/UMAP to reduce dimensions first; feature selection; regularization.

### K-Means Clustering

Minimize within-cluster sum of squares (WCSS/inertia):

$$J = \sum_{k=1}^{K}\sum_{\mathbf{x}_i \in C_k}\|\mathbf{x}_i - \boldsymbol{\mu}_k\|^2$$

**Algorithm (Lloyd's):**
```
1. Initialize K centroids (K-Means++ preferred)
2. Assign each point to nearest centroid
3. Recompute centroids as cluster means
4. Repeat 2–3 until centroids stop moving
```

**K-Means++ initialization:** first centroid random; each subsequent centroid chosen with probability $\propto D(\mathbf{x})^2$ where $D$ is distance to nearest existing centroid. Spreads centroids apart; prevents bad initializations; is the sklearn default.

**Assumptions (when K-Means fails):**
```
✓ Works:   Spherical clusters of similar size and density
✗ Fails:   Elongated clusters, varying density, non-convex shapes,
            very different cluster sizes, many outliers
```

**Complexity:** O(nKId) where I = iterations — fast; scales to millions of points. Reinitialize K-Means several times and keep the best result (lowest inertia), since it can get stuck in local optima.

### Hierarchical Clustering

Build a tree (dendrogram) of all merge decisions. Cut at any height to get K clusters — you don't need to specify K before running.

**Linkage criteria** (how to measure distance between two clusters):

| Linkage | Distance measure | Behavior |
|---|---|---|
| Single | min(dist of any pair) | Chaining effect; elongated clusters |
| Complete | max(dist of any pair) | Compact, equal-sized clusters |
| Average | mean of all pairs | Compromise between single and complete |
| **Ward's** | minimize increase in within-cluster variance | Best general default; compact clusters |

Complexity: O(n³) time, O(n²) space — impractical beyond ~10K samples. For large data: use K-Means or DBSCAN.

### DBSCAN (Density-Based Spatial Clustering)

Parameters: $\varepsilon$ (radius) and `minPts` (min neighbors for a core point).

```
CORE POINT:   ≥ minPts neighbors within ε radius
BORDER POINT: within ε of a core point, but < minPts neighbors itself
NOISE POINT:  not within ε of any core point (outlier)
```

Clusters = connected regions of core points. DBSCAN naturally:
- Finds the number of clusters automatically
- Handles arbitrary shapes (crescent, rings, XOR-like)
- Marks isolated points as noise (good for anomaly detection)

**Weakness:** struggles with clusters of varying density (all clusters must satisfy the same ε/minPts).  
**HDBSCAN** fixes this: builds a cluster hierarchy; extracts stable clusters regardless of density variation. Use `min_cluster_size` instead of ε.

### Spectral Clustering

1. Build a similarity graph from the data (edges = RBF kernel similarities)
2. Compute the graph Laplacian $L = D - W$ (degree matrix minus adjacency)
3. Take the bottom K eigenvectors of L — this is the "spectral embedding"
4. Run K-Means in the K-dimensional embedding space

**Why it works:** eigenvectors of the Laplacian encode cluster membership in a space where linear separation is easy. Can detect non-convex shapes (interlocking rings, concentric circles) that K-Means misses entirely.

**Cost:** O(n³) naive — slow for large data; approximations exist (Nyström, landmark spectral clustering).

### GMM (Gaussian Mixture Model)

$$p(\mathbf{x}) = \sum_{k=1}^{K}\pi_k\,\mathcal{N}(\mathbf{x}|\boldsymbol{\mu}_k, \boldsymbol{\Sigma}_k)$$

Each cluster is modeled as a Gaussian with its own mean, covariance, and mixing weight $\pi_k$.  
**Soft assignment**: every point belongs to every cluster with a probability (responsibility vector). More flexible than K-Means (which has hard assignments and spherical clusters only).

Fit with **EM algorithm**: E-step (compute responsibilities), M-step (update $\mu_k$, $\Sigma_k$, $\pi_k$ using weighted sums). Repeat until convergence.

Use **BIC or AIC** to select the number of components K: BIC favors simpler models (penalizes parameters more).

K-Means is a special case of GMM: spherical covariances ($\Sigma_k = \sigma^2 I$), hard assignments.

### Cluster Evaluation Metrics

**Silhouette Score:**

$$s(i) = \frac{b(i) - a(i)}{\max(a(i),\,b(i))} \in [-1,\,1]$$

where $a(i)$ = mean distance to same-cluster points (cohesion), $b(i)$ = mean distance to nearest other cluster (separation).

- $s \approx +1$: well-clustered; $s \approx 0$: on cluster boundary; $s < 0$: likely assigned to wrong cluster
- Average $s > 0.70$ → strong; $> 0.50$ → reasonable; $< 0.25$ → probably no meaningful clusters

**Elbow Method:** plot inertia vs K; the "elbow" is where additional clusters stop providing much benefit. Subjective; use with Silhouette to confirm.

**Davies-Bouldin Index:** $DB = \frac{1}{K}\sum_i\max_{j\neq i}\frac{s_i+s_j}{d_{ij}}$ — **lower is better**. Penalizes clusters that are wide relative to inter-cluster distance.

> Always combine at least two metrics: Elbow (visual) + Silhouette (quantitative) + Davies-Bouldin (adversarial view).

### Dimensionality Reduction

| Method | Linear? | What it preserves | Best for | Scalability |
|---|---|---|---|---|
| **PCA** | Yes | Global variance (direction of most spread) | Feature reduction, preprocessing | Very fast O(min(n,p)²×max(n,p)) |
| **t-SNE** | No | Local neighbor relationships | 2D / 3D visualization only | Slow O(n²); use on ≤ 50K points |
| **UMAP** | No | Local structure + some global | Visualization + downstream ML | Medium; faster than t-SNE |
| **Autoencoder** | No | Learned compressed representation | Complex non-linear structure | Slow to train; fast at inference |

**PCA in detail:**
1. Center data: $\tilde{X} = X - \bar{X}$
2. Compute covariance matrix: $C = \frac{1}{n-1}\tilde{X}^\top\tilde{X}$
3. Eigendecompose: $C = V\Lambda V^\top$ — columns of $V$ are principal components
4. Project: $Z = \tilde{X}V_k$ (keep top k columns by eigenvalue)

Scree plot: plot each PC's explained variance; choose k at the "elbow" or where cumulative variance ≥ 95%.

**t-SNE vs UMAP:**
```
t-SNE:  perplexity controls local neighborhood size
        slow (O(n log n) with Barnes-Hut, O(n²) exact)
        cannot add new points after training
        NOT suitable for downstream ML features

UMAP:   n_neighbors + min_dist parameters
        faster; scales to millions of points
        can transform new points after training
        preserves more global structure than t-SNE
        CAN be used as preprocessing for ML
```

### Association Rules (Unsupervised)

Market basket analysis: find items that co-occur frequently.

$$\text{Support}(A \Rightarrow B) = \frac{\text{count}(A \cup B)}{N}$$
$$\text{Confidence}(A \Rightarrow B) = \frac{\text{count}(A \cup B)}{\text{count}(A)}$$
$$\text{Lift}(A \Rightarrow B) = \frac{\text{Confidence}(A \Rightarrow B)}{\text{Support}(B)}$$

Lift > 1 means A and B co-occur more often than by chance. Algorithms: **Apriori** (level-wise candidate generation), **FP-Growth** (frequent-pattern tree, 10–100× faster than Apriori).

### Anomaly Detection

**Isolation Forest:** builds random trees that isolate each point. Anomalies need fewer splits (shorter path = more isolated = higher anomaly score). No need to label anomalies during training.

**Use cases:** fraud detection, network intrusion, manufacturing defect detection, equipment failure prediction.

### Self-Supervised Learning

Creates labels from the data's own structure — no human annotation.

- **BERT:** mask 15% of tokens randomly; train model to predict the masked words
- **GPT:** predict the next token given all previous tokens (autoregressive)
- **SimCLR:** create two augmented views of each image; train model to agree on both views (contrastive)

The resulting representations transfer powerfully to downstream tasks. Pre-train on 100B tokens → fine-tune on 1K labeled examples → outperforms full supervised on 1M labels.

---

> ✅ **Must-remember**
>
> - K-Means: specify K, spherical only, fast; K-Means++ prevents bad centroids; uses inertia
> - DBSCAN: auto K, arbitrary shapes, marks noise; HDBSCAN for varying density
> - Silhouette > 0.5 is reasonable; use Elbow + Silhouette + Davies-Bouldin together
> - PCA: linear, global variance, use scree plot for k; fit on train only
> - t-SNE: local only, visualization only; UMAP: local + global, faster, use for features too
> - Self-supervised = labels from data structure; powers BERT, GPT, SimCLR

---

## Ch 12 — Key Algorithms Deep Dive

> 💡 **In a sentence —** This chapter opens up the "black box" of each major algorithm — the mathematics, the assumptions, and the hyperparameters that matter — so you can confidently tune and debug models.

### Linear Regression — Two Routes to Fit

$$\hat{\mathbf{y}} = \mathbf{X}\mathbf{w} = w_0 + w_1x_1 + \cdots + w_px_p$$

**Ordinary Least Squares (Normal Equation)** — closed-form, exact:

$$\mathbf{w}^* = (X^\top X)^{-1} X^\top \mathbf{y}$$

One-shot solution. Requirements: $X^\top X$ must be invertible (fails for collinear features); complexity O(np² + p³) — impractical when p > a few thousand.

**Gradient Descent** — iterative, scalable:

$$w_j \leftarrow w_j - \frac{2\eta}{n}\sum_{i=1}^n(\hat{y}_i - y_i)x_{ij}$$

Works for any size dataset, naturally supports regularization, allows online learning.

**Five assumptions (violation → unreliable coefficient estimates):**
```
1. LINEARITY           y is linear in the features
2. INDEPENDENCE        observations are independent (violated: time series)
3. HOMOSCEDASTICITY    constant error variance (violated: variance grows with ŷ)
4. NORMALITY           errors are normally distributed (needed for CIs/p-values)
5. NO MULTICOLLINEARITY features are not highly correlated (Ridge fixes this)
```

**Regularized variants:**

| Method | Penalty | Effect on weights | Best when |
|---|---|---|---|
| **Ridge (L2)** | $\lambda\sum w_j^2$ | Shrinks all; none to exactly zero | Many features, all contribute; correlated features |
| **Lasso (L1)** | $\lambda\sum|w_j|$ | Drives some to exactly zero | Few features matter; built-in feature selection |
| **Elastic Net** | $\lambda_1\sum|w_j|+\lambda_2\sum w_j^2$ | Sparse + stable | Correlated features + need feature selection |

```
λ = 0        → no regularization → standard OLS (may overfit)
λ = small    → light regularization
λ = optimal  → best bias-variance tradeoff (find via cross-validation)
λ → ∞        → all weights → 0 → model always predicts the mean (extreme underfit)
```

### Logistic Regression — Full Mechanics

Sigmoid function and its derivative:

$$\sigma(z) = \frac{1}{1+e^{-z}} \qquad \sigma'(z) = \sigma(z)\bigl(1-\sigma(z)\bigr) \leq 0.25$$

Loss: Binary cross-entropy — a convex function with a single global minimum. Gradient descent is guaranteed to find the optimal solution (no local minima issue unlike neural nets).

The maximum gradient of sigmoid is 0.25 (at z=0) — this is why sigmoid is prone to vanishing gradients in deep networks.

**Multiclass strategies:**

- **OvR (One-vs-Rest):** train K binary classifiers; pick class with highest probability. Fast; works for any binary classifier.
- **Softmax (Multinomial):** one model, K outputs; $P(y=k|x) = e^{z_k}/\sum_j e^{z_j}$; probabilities sum to 1; more principled.

**C parameter (inverse of λ):** large C → less regularization (may overfit); small C → strong regularization (underfit). `C=1.0` is sklearn default.

### Decision Trees — CART Deep Dive

**CART (Classification and Regression Trees):** greedy algorithm, binary splits, recursively applied.

```
        (feature ≤ threshold)?
              /          \
           YES             NO
      (sub-tree)       (sub-tree)
           ↓                ↓
      ... until max_depth or min_samples_leaf reached
```

**Gini impurity intuition:** probability of misclassifying a randomly chosen sample if it were labeled according to class distribution.

$$G = 1 - \sum_{c}p_c^2 \quad \text{Range: 0 (pure) to } \frac{K-1}{K} \text{ (uniform)}$$

For binary: $G = 2 \times p(1-p)$, maximum 0.5 at p=0.5.

**Pruning:** reduce max_depth; increase min_samples_leaf; use min_impurity_decrease. Alternatively, post-hoc cost-complexity pruning (alpha parameter in sklearn).

### Random Forest — Why Averaging Helps

N uncorrelated models with individual accuracy $p$ and pairwise correlation $\rho$:

$$\text{Ensemble Variance} = \rho\sigma^2 + \frac{1-\rho}{n}\sigma^2 \xrightarrow[n\to\infty]{} \rho\sigma^2$$

If trees were identical ($\rho=1$): no reduction. If perfectly uncorrelated ($\rho=0$): variance → 0 as n → ∞. Random feature subsets reduce $\rho$ — each tree's errors are partially independent.

**Tuning Random Forest:**
```
n_estimators:    200–500 (more = better, diminishing returns after ~200)
max_features:    √p for classification; p/3 for regression (controls correlation)
max_depth:       3–15 (None = full tree; deeper = lower bias, higher variance)
min_samples_leaf: 1–20 (higher = smoother, more regularized)
```

OOB score uses ~36.8% of samples not selected per tree as a free validation estimate — no need for a separate validation split when using Random Forest.

### Gradient Boosting Family

**XGBoost innovations over vanilla gradient boosting:**
- Second-order Taylor expansion of loss (Newton-Raphson, not just first-order gradient)
- Explicit L1 + L2 regularization on tree structure
- Column subsampling per tree and per level
- Weighted quantile sketch for efficient split finding
- GPU acceleration

**LightGBM leaf-wise growth vs XGBoost level-wise:**
```
Level-wise (XGBoost):          Leaf-wise (LightGBM):
Grow all leaves at each level  Grow the leaf with max loss reduction
More balanced trees            Deeper but more focused trees
Better for small data          10-30x faster on large data (>100K rows)
```

**CatBoost ordered boosting:** uses ordered statistics to prevent target leakage when encoding categoricals. Symmetric trees make predictions O(depth) instead of O(leaves) — fast inference.

### KNN Practical Details

Prediction cost O(n × d) per query — K-D trees or ball trees reduce to O(d log n) for low dimensions. Use brute force for d > ~20 (tree advantage disappears).

**When KNN excels:** small dataset, local patterns matter, no clear parametric form, recommendation systems (item-based CF).

**When KNN fails:** high dimensions, large n, need prediction speed, features on different scales.

### Naive Bayes Variants

| Type | Feature distribution assumed | Best for |
|---|---|---|
| **Gaussian NB** | $P(x_i|y) = \mathcal{N}(\mu_{iy}, \sigma_{iy}^2)$ | Continuous features |
| **Multinomial NB** | Multinomial (word counts) | Text classification (term counts) |
| **Bernoulli NB** | Bernoulli (word present/absent) | Text classification (binary features) |
| **Complement NB** | Modified complement classes | Imbalanced text classification |

---

> ✅ **Must-remember**
>
> - Normal equation: $\mathbf{w}^* = (X^\top X)^{-1}X^\top\mathbf{y}$ — exact but O(p³); use for small p
> - Lasso → exact zeros (feature selection); Ridge → all shrunk (correlated features ok)
> - Gini: $1-\sum p_c^2$; entropy: $-\sum p_c\log_2 p_c$; nearly identical in practice
> - Random Forest: √p features per split; OOB score is free validation; n_estimators 200–500
> - Gradient Boosting: sequential residual fitting; LightGBM faster; CatBoost for categoricals
> - XGBoost / LightGBM are the starting point for any tabular ML competition

---

## Ch 13 — Model Evaluation & Tuning

> 💡 **In a sentence —** Choosing the wrong evaluation metric is worse than choosing the wrong model — a perfect-accuracy classifier that never catches fraud is failing catastrophically while looking great on paper.

### The Confusion Matrix

```
                      PREDICTED POSITIVE   PREDICTED NEGATIVE
ACTUAL POSITIVE            TP                    FN
ACTUAL NEGATIVE            FP                    TN
```

- **TP (True Positive):** correctly flagged positive — we want these high
- **TN (True Negative):** correctly dismissed negative — we want these high
- **FP (False Positive / Type I Error):** false alarm — costly in spam filtering (deletes real mail)
- **FN (False Negative / Type II Error):** miss — costly in medical diagnosis (misses cancer)

The relative cost of FP vs FN is domain-specific and determines which metric to optimize.

### Classification Metrics — All Formulas

$$\text{Accuracy} = \frac{TP+TN}{TP+TN+FP+FN}$$

$$\text{Precision} = \frac{TP}{TP+FP} \quad \text{"of all I flagged positive, what fraction truly were?"}$$

$$\text{Recall (Sensitivity, TPR)} = \frac{TP}{TP+FN} \quad \text{"of all true positives, what fraction did I catch?"}$$

$$\text{Specificity (TNR)} = \frac{TN}{TN+FP} \quad \text{"of all true negatives, what fraction did I correctly dismiss?"}$$

$$\text{F1} = \frac{2 \times P \times R}{P + R} = \frac{2\,TP}{2\,TP + FP + FN}$$

$$F_\beta = (1+\beta^2)\frac{P \times R}{\beta^2 P + R}$$

$F_2$: recall weighted 2× more (cancer detection). $F_{0.5}$: precision weighted 2× more (spam filter).

**Why accuracy fails for imbalanced data:** 99.9% of transactions are legitimate. A model that predicts "not fraud" for every transaction gets 99.9% accuracy but catches zero fraud.

**Precision-Recall tradeoff:**
```
threshold = 0.3 (low):  more positives predicted → ↑ Recall, ↓ Precision
threshold = 0.5:        default balance
threshold = 0.8 (high): fewer positives predicted → ↑ Precision, ↓ Recall
```

### ROC Curve and AUC

The ROC curve plots TPR (Recall) vs FPR at every possible threshold.

```
TPR (Recall)
  1.0 ─────────────────────────── Perfect Classifier
      │    ╭────────────────────
      │   ╱
      │  ╱  ← typical good model
      │ ╱
  0.5 │/ ← random (diagonal line; AUC = 0.5)
      │
  0.0 ───────────────────── FPR
      0.0                  1.0
```

**AUC = area under the ROC curve.**

| AUC | Interpretation |
|---|---|
| 1.0 | Perfect classifier |
| 0.9–0.99 | Excellent |
| 0.8–0.9 | Good |
| 0.7–0.8 | Fair |
| 0.5 | Random guessing |
| < 0.5 | Worse than random (flip predictions!) |

> **AUC intuition:** randomly sample one positive and one negative; AUC = probability the model assigns a higher score to the positive. AUC is threshold-independent — one number summarizes the model across all operating points.

**AUC-PR (Precision-Recall AUC):** better metric for **imbalanced datasets** (rare disease, fraud). The random baseline for PR curves = prevalence (e.g., 1% for fraud), not 0.5 like ROC.

**ROC vs PR choice table:**
```
Balanced classes (50/50 or 60/40) → ROC-AUC
Imbalanced (fraud, cancer, anomaly) → AUC-PR
Care about both classes equally → ROC-AUC
Care about minority class quality → AUC-PR
```

### Regression Metrics

| Metric | Formula | Interpretation | Outlier sensitivity |
|---|---|---|---|
| **MAE** | $\frac{1}{n}\sum|y_i-\hat{y}_i|$ | Average error; same units as target | Low (linear penalty) |
| **MSE** | $\frac{1}{n}\sum(y_i-\hat{y}_i)^2$ | Squared units; penalizes big errors | High (quadratic) |
| **RMSE** | $\sqrt{\text{MSE}}$ | Same units; most commonly reported | High |
| **R²** | $1 - SS_\text{res}/SS_\text{tot}$ | Fraction of variance explained [0,1] | Moderate |
| **MAPE** | $\frac{1}{n}\sum|(y_i-\hat{y}_i)/y_i|$ | Percentage error; unit-free | Low (fails at $y=0$) |

$R^2 = 1.0$: perfect fit. $R^2 = 0.0$: model is equivalent to always predicting the mean. $R^2 < 0$: model worse than predicting the mean (yes, this does happen).

If RMSE >> MAE, you have a few very large errors dominating — investigate those samples.

### Cross-Validation Strategies

| Strategy | When to use | Notes |
|---|---|---|
| **K-Fold (K=5 or 10)** | Default; regression or balanced classification | Standard choice |
| **Stratified K-Fold** | Always for classification | Preserves class distribution per fold |
| **LOOCV (K=N)** | Tiny datasets (< 100 samples) | N× more expensive; high variance |
| **Repeated K-Fold** | Extra stability needed | Run K-fold multiple times, average |
| **TimeSeriesSplit** | Time-ordered data | Train always before test in time; never shuffle |

**TimeSeriesSplit — the expanding window pattern:**
```
Fold 1: train [1..100]    test [101..120]
Fold 2: train [1..120]    test [121..140]
Fold 3: train [1..140]    test [141..160]
```

Never shuffle time series data before splitting — information from the future would "leak" into training.

### Hyperparameter Tuning Methods

| Method | How it works | When to use |
|---|---|---|
| **Grid Search** | Try all combinations exhaustively | Small grids (3 params × 3 values = 27 combos) |
| **Random Search** | Sample randomly from distributions | Larger spaces; better coverage of key params |
| **Bayesian Optimization** | Surrogate model (GP) learns which regions to try; balances exploitation vs exploration | Expensive evaluations; want best results with fewest trials |

**Why random search often beats grid search:** typically only 1–2 hyperparameters matter for any given model. Grid search wastes budget at fixed values for the unimportant ones; random search varies all parameters every trial.

**Bayesian optimization tools:** Optuna (state of the art, easy to use), Hyperopt, scikit-optimize.

```python
# Optuna example (Bayesian optimization)
import optuna
def objective(trial):
    lr = trial.suggest_float('lr', 1e-5, 1e-1, log=True)
    n_est = trial.suggest_int('n_estimators', 100, 1000)
    model = XGBClassifier(learning_rate=lr, n_estimators=n_est)
    return cross_val_score(model, X_train, y_train, cv=5).mean()
study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=100)
```

### Learning Curve Diagnosis

```
HIGH VARIANCE (overfitting)      HIGH BIAS (underfitting)
────────────────────────         ─────────────────────────
Train: 97%, Val: 68%             Train: 72%, Val: 70%
Large gap between curves         Both curves low; close together
Fix: add data; regularize;       Fix: more features; bigger model;
     dropout; simpler model           less regularization
```

Learning curve plots model performance vs training set size. If both curves plateau (high bias): more data won't help — change the model. If gap persists (high variance): more data helps until gap closes.

### 8 Common Evaluation Mistakes

1. **Data leakage** — fit preprocessing on all data; **always split first**
2. **Evaluating on training data** — perfect score means nothing; use held-out data
3. **Accuracy on imbalanced data** — 99% accuracy on 1% fraud class = predicts nothing
4. **No stratified splits** for classification — fold with 0% positive class is useless
5. **Tuning on the test set** — it becomes a second training set; report once only
6. **Ignoring confidence intervals** — two models within CI margin are tied
7. **Shuffling time series before splitting** — future leaks into past; optimistic metrics
8. **Comparing models evaluated on different splits** — splits must be identical for fair comparison

---

> ✅ **Must-remember**
>
> - Precision = "alarm reliability" TP/(TP+FP); Recall = "coverage" TP/(TP+FN)
> - F1 = harmonic mean of P and R; penalizes extreme imbalance between them
> - ROC-AUC for balanced; AUC-PR for imbalanced/rare positives
> - R² = 0 means model = mean predictor; R² < 0 means worse than mean
> - Always Stratified K-Fold for classification; TimeSeriesSplit for time-ordered data
> - Random search often outperforms grid search with same compute budget

---

## Ch 14 — Neural Networks & Deep Learning

> 💡 **In a sentence —** Neural networks compose many nonlinear transformations layer by layer, learning hierarchical features from raw inputs — the magic is in depth and the math is mostly matrix multiply + nonlinearity + chain rule.

### The Artificial Neuron

$$z = \sum_{i=1}^n w_i x_i + b \qquad \hat{y} = f(z)$$

- **Weight** $w_i$: learned importance of input $x_i$
- **Bias** $b$: shifts the activation threshold
- **Activation function** $f$: adds nonlinearity; without it, any depth collapses to a single linear layer

> **Universal Approximation Theorem:** a feedforward neural network with one hidden layer and sufficient width can approximate any continuous function on a compact subset of $\mathbb{R}^n$ to arbitrary precision (given enough neurons).

Width alone isn't enough in practice — depth enables learning compositional, hierarchical features more efficiently.

### Architecture Anatomy

```
INPUT LAYER      HIDDEN LAYERS              OUTPUT LAYER
────────────     ─────────────────────      ─────────────────
One node         Each neuron connects       Binary: 1 sigmoid
per feature      to all previous layer      Multi-class: K softmax
                 neurons (fully connected)  Regression: 1 linear
x₁ ───┐
x₂ ───┤──► [Layer 1] ──► [Layer 2] ──► ... ──► ŷ
x₃ ───┘
```

**Depth** (number of layers): learns more abstract hierarchical features; depth 4 LeNet → depth 50+ ResNet. Too deep → vanishing gradients (without fixes).

**Width** (neurons per layer): more neurons = more patterns at that level. Too wide → overfitting; too narrow → underfitting.

### Activation Functions Compared

| Activation | Formula | Range | Use where |
|---|---|---|---|
| **ReLU** | $\max(0,z)$ | $[0,\infty)$ | Default for hidden layers; gradient=1 for z>0 |
| **Leaky ReLU** | $z$ if $z>0$ else $\alpha z$ ($\alpha$=0.01) | ℝ | When dying ReLU (0-gradient for z<0) is a problem |
| **ELU** | $z$ if $z>0$ else $\alpha(e^z-1)$ | ℝ | Smooth negative region; mean activations near 0 |
| **Sigmoid** | $1/(1+e^{-z})$ | $(0,1)$ | Binary output layer; LSTM gates |
| **Tanh** | $(e^z-e^{-z})/(e^z+e^{-z})$ | $(-1,1)$ | RNN hidden state; zero-centered vs sigmoid |
| **Softmax** | $e^{z_i}/\sum_j e^{z_j}$ | $(0,1)$, sums to 1 | Multi-class output layer |
| **GELU** | $z\cdot\Phi(z)$ | ℝ | Transformer hidden layers (BERT, GPT) |

**Dying ReLU problem:** a neuron stuck at z<0 outputs 0 always and receives 0 gradient — never recovers. Leaky ReLU, ELU, and careful initialization prevent this.

### Backpropagation — Chain Rule All the Way Down

Forward pass computes $\hat{y}$ and loss $L$. Backward pass computes gradients via chain rule:

$$\frac{\partial L}{\partial w_1^{(1)}} = \frac{\partial L}{\partial \hat{y}} \cdot \frac{\partial \hat{y}}{\partial z^{(2)}} \cdot \frac{\partial z^{(2)}}{\partial a^{(1)}} \cdot \frac{\partial a^{(1)}}{\partial z^{(1)}} \cdot \frac{\partial z^{(1)}}{\partial w_1^{(1)}}$$

Each term is a local gradient. Error flows backward through each layer; every weight's contribution to the final loss is computed efficiently. Complexity: $O(P)$ where $P$ = number of parameters — same as one forward pass.

Weight update: $w \leftarrow w - \alpha\,\partial L/\partial w$ for every weight simultaneously.

### Vanishing and Exploding Gradients

**Vanishing:** sigmoid max gradient is 0.25. Multiply through 10 layers: $0.25^{10} \approx 10^{-6}$. The first layer's weights barely change — the network learns nothing in its early layers.

**Exploding:** weight factor > 1 multiplied across layers → loss becomes NaN.

| Problem | Cause | Solution |
|---|---|---|
| Vanishing (activations) | Sigmoid/tanh squash gradients | Use ReLU family |
| Vanishing (depth) | Gradient shrinks across layers | Batch Normalization |
| Vanishing (sequences) | Gradients over time steps | LSTM / GRU gating |
| Vanishing (very deep) | 50+ layer networks | Residual / skip connections |
| Exploding | Large weight products | Gradient clipping: $g \leftarrow g \cdot \min(1, \text{clip\_val}/\|g\|)$ |

### Neural Network Regularization

**Dropout:**
```
Training:  randomly set fraction p of neurons to 0
           different mask each forward pass
           forces network to build redundant pathways

Inference: all neurons active; scale by (1-p)
           [or equivalently: scale training weights by (1-p)]
```

Typical p: 0.3–0.5 for dense/FC layers; 0.1–0.2 for convolutional layers; 0.1 for Transformers.

**Batch Normalization:**

$$\hat{x}_i = \frac{x_i - \mu_\mathcal{B}}{\sqrt{\sigma_\mathcal{B}^2 + \epsilon}} \qquad y_i = \gamma\hat{x}_i + \beta$$

Normalizes each mini-batch to $\mu=0$, $\sigma=1$; learnable scale $\gamma$ and shift $\beta$ let the network undo normalization if needed. Benefits: enables higher learning rates; reduces sensitivity to weight initialization; acts as mild regularizer.

For Transformers → **Layer Normalization** (normalize over features, not batch). Modern LLMs → **RMSNorm** (simpler: $\hat{x}_i = x_i/\text{RMS}(x)$, no mean centering).

**Weight Decay (L2):** $L_\text{total} = L_\text{data} + \lambda\sum_j w_j^2$. AdamW separates weight decay from gradient adaptation — the correct way to do L2 regularization with Adam.

### Convolutional Neural Networks (CNNs)

A **convolutional layer** slides a $k\times k$ filter over the input, computing dot products:

$$\text{Output}[i,j] = \sum_{m,n} W[m,n] \cdot \text{Input}[i+m,j+n]$$

One filter = one feature map. Stack $F$ filters → $F$ feature maps. Hierarchical feature learning:

```
Layer 1:  edges, gradients            (low-level spatial features)
Layer 3:  textures, corners, curves   (mid-level composition)
Layer 5:  eyes, wheels, faces         (high-level semantics)
```

**Key architectural components:**
- **Stride:** pixels skipped per convolution step — larger stride = smaller output
- **Padding:** add zeros around border to control output size
- **Pooling:** downsample feature maps (max pool: take max in each region — keeps strongest activation)
- **Skip connections (ResNet):** $y = F(x) + x$ — adds input directly to output; gradient highway; enables training of 100–1000 layer networks

Famous architectures: LeNet-5 (1998), AlexNet (2012, won ImageNet), VGG (2014, 3×3 stacks), ResNet (2015, skip connections), EfficientNet (2019, compound scaling).

### RNNs, LSTMs, GRUs

**RNN:** hidden state carries context across time steps:

$$h_t = f(W_x x_t + W_h h_{t-1} + b) \qquad \hat{y}_t = g(W_y h_t + b_y)$$

Problem: gradients through time multiply $W_h$ repeatedly → vanish (small $W_h$) or explode (large $W_h$) for sequences > ~20 steps.

**LSTM** (Long Short-Term Memory) — 3 gates control a cell state $C_t$ that acts as a gradient highway:

$$f_t = \sigma(\cdot) \quad \text{(forget: what to erase from }C_{t-1}\text{)}$$
$$i_t = \sigma(\cdot), \quad \tilde{C}_t = \tanh(\cdot) \quad \text{(input: new candidate content)}$$
$$C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t \quad \text{(cell state update)}$$
$$o_t = \sigma(\cdot), \quad h_t = o_t \odot \tanh(C_t) \quad \text{(output gate + hidden state)}$$

The additive cell state update $C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t$ avoids the multiplicative gradient vanishing of plain RNNs.

**GRU** (Gated Recurrent Unit): 2 gates (update + reset), no separate cell state; ~25% fewer parameters than LSTM; similar performance on most tasks.

Modern recommendation: use Transformer for language/sequence tasks with full data. RNN/LSTM for streaming low-latency time series (one step at a time).

### The Transformer and Self-Attention

$$\text{Attention}(Q,K,V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$

- **Q (Query):** "what am I looking for?"
- **K (Key):** "what do I contain?"
- **V (Value):** "what content do I carry if selected?"

$QK^\top$ scores relevance of every token to every other token. Divide by $\sqrt{d_k}$ to prevent dot products from growing too large (which would collapse softmax to near one-hot). Resulting weights used to take a weighted sum of Values.

**Multi-head attention:** run H attention heads in parallel; each learns different relationship types (syntax, coreference, semantic). Concatenate heads → project down to model dimension.

**Positional encoding:** self-attention is permutation-invariant (can't distinguish "dog bites man" from "man bites dog" without position). Add sine/cosine positional encodings to embeddings.

| Architecture | Attention | Pre-training | Best for |
|---|---|---|---|
| **Encoder-only (BERT)** | Bidirectional (sees all tokens) | Masked LM | Classification, NER, QA |
| **Decoder-only (GPT)** | Causal (past only) | Next-token prediction | Generation, chatbots |
| **Encoder-Decoder (T5)** | Cross-attention between enc and dec | Span corruption / seq2seq | Translation, summarization |

### Transfer Learning

**Pre-train** on massive data (ImageNet, Wikipedia+Books) → model learns rich general representations.  
**Fine-tune** on your small task-specific dataset.

```
Small dataset + domain similar to pre-training:
  → Freeze all early layers; retrain only the final head (classifier)
  → Risk of overfitting; few parameters to update

Large dataset + domain different from pre-training:
  → Fine-tune all layers with small learning rate
  → Most flexible; can adapt representations fully

Small dataset + very different domain:
  → Fine-tune only last 1–2 layers; may need more pre-training data
```

---

> ✅ **Must-remember**
>
> - Without activation functions, deep networks = single linear layer regardless of depth
> - ReLU for hidden layers (gradient=1 for z>0); Sigmoid for binary output; Softmax for multi-class
> - Vanishing gradient: $0.25^{10} \approx 10^{-6}$; fix with ReLU, BatchNorm, skip connections, LSTM
> - LSTM cell state $C_t$ is an additive highway — prevents multiplicative gradient decay
> - Transformer: $\text{softmax}(QK^\top/\sqrt{d_k})V$; all tokens attend simultaneously (no sequential bottleneck)
> - AdamW + weight decay + dropout are the standard regularization recipe for Transformers

---

## Ch 15 — Reinforcement Learning

> 💡 **In a sentence —** An RL agent learns to take good actions by trial-and-error — it interacts with an environment, receives reward signals, and adjusts its behavior to maximize cumulative future reward, with no labeled dataset required.

### The RL Framework

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌─────────┐  action a_t   ┌───────────────────┐  │
│   │  AGENT  │──────────────►│  ENVIRONMENT      │  │
│   │ (policy)│               │  (world / game /  │  │
│   └─────────┘◄──────────────│   simulator)      │  │
│                state s_t,   └───────────────────┘  │
│                reward r_t                           │
└─────────────────────────────────────────────────────┘
```

| Component | Supervised Learning | Reinforcement Learning |
|---|---|---|
| Learning signal | Label per example | Scalar reward (delayed, sparse) |
| Data source | Fixed labeled dataset | Agent generates its own by interacting |
| Feedback timing | Immediate | Often delayed (end of episode) |
| Goal | Predict y for each x | Maximize cumulative reward $G_t$ |

**Six RL primitives:**
- **Agent**: the learner/decision-maker
- **Environment**: everything the agent interacts with
- **State** $s$: current situation (what the agent observes)
- **Action** $a$: what the agent can do
- **Reward** $r$: scalar feedback signal (immediate)
- **Policy** $\pi$: the agent's strategy mapping states to actions (or action probabilities)

**Episode**: a complete trajectory from start to terminal state. **Return** $G_t = \sum_{k=0}^\infty \gamma^k r_{t+k+1}$ = sum of discounted future rewards.

### Markov Decision Processes (MDPs)

Formal framework for RL problems. Defined by the tuple $(S, A, P, R, \gamma)$:
- $S$: state space
- $A$: action space
- $P(s'|s,a)$: state transition probability
- $R(s,a,s')$: reward function
- $\gamma \in [0,1]$: discount factor

**Markov property:** $P(s_{t+1}|s_t,a_t) = P(s_{t+1}|s_0,...,s_t,a_0,...,a_t)$

The future depends only on the current state — full history is irrelevant (given current state). This is what makes RL computationally tractable. When it doesn't hold naturally, engineer state to include relevant history (frame stacking in DQN).

**Discount factor intuition:**
```
γ = 0.0: myopic — only care about next immediate reward
γ = 0.9: reward 10 steps later counts as 0.9^10 ≈ 0.35 times immediate
γ = 0.99: far-sighted — patient, cares about long-term outcomes
γ = 1.0: undiscounted — all future rewards equal (only for episodic tasks)
```

### Value Functions and Bellman Equations

**State-value function** under policy $\pi$:

$$V^\pi(s) = \mathbb{E}_\pi\!\left[\sum_{t=0}^\infty \gamma^t r_{t+1}\,\bigg|\,s_0=s\right]$$

**Action-value (Q) function** under policy $\pi$:

$$Q^\pi(s,a) = \mathbb{E}_\pi\!\left[\sum_{t=0}^\infty \gamma^t r_{t+1}\,\bigg|\,s_0=s,\,a_0=a\right]$$

Key relationship: $V^\pi(s) = \sum_a \pi(a|s)\,Q^\pi(s,a)$

**Bellman Optimality Equations:**

$$V^*(s) = \max_a\!\left[R(s,a) + \gamma\sum_{s'}P(s'|s,a)\,V^*(s')\right]$$

$$Q^*(s,a) = R(s,a) + \gamma\sum_{s'}P(s'|s,a)\max_{a'}Q^*(s',a')$$

Intuition: "the value of being here = what I earn now + the best discounted value of where I land." Once you know $Q^*$, the optimal policy is trivially $\pi^*(s) = \arg\max_a Q^*(s,a)$.

### Exploration vs Exploitation

The central dilemma: use the best known action (exploit) vs. try new actions to discover better ones (explore).

**ε-greedy:** with probability ε take a random action (explore); with probability 1-ε take the greedy action (exploit). Decay ε from 1.0 → 0.05 over training: explore early, exploit later.

**UCB (Upper Confidence Bound):**

$$a_t = \arg\max_a\left[Q(a) + c\sqrt{\frac{\ln t}{N(a)}}\right]$$

Exploration bonus shrinks as action $a$ is tried more ($N(a)$ grows). Principled; provably efficient for multi-armed bandit problems.

**Boltzmann/Softmax exploration:** $P(a) = e^{Q(a)/\tau}/\sum_{a'}e^{Q(a')/\tau}$ — temperature $\tau$ controls randomness; $\tau \to 0$ = greedy, $\tau \to \infty$ = uniform.

### Q-Learning — The TD Learning Workhorse

Off-policy, model-free: learns the optimal Q function without knowing the environment dynamics.

$$Q(s,a) \leftarrow Q(s,a) + \alpha\underbrace{\left[r + \gamma\max_{a'}Q(s',a') - Q(s,a)\right]}_{\text{TD error (surprise)}}$$

- TD error > 0: outcome was better than expected → increase Q(s,a)
- TD error < 0: outcome was worse than expected → decrease Q(s,a)
- **Off-policy:** can learn optimal Q while following any behavior policy (e.g., ε-greedy)
- **Model-free:** doesn't learn $P(s'|s,a)$ or $R(s,a)$ explicitly

Convergence guaranteed for tabular Q-learning with proper learning rate decay and sufficient exploration.

### Deep Q-Network (DQN)

Q-table requires storing Q(s,a) for every state-action pair. For Atari: $|\text{states}| \approx 10^{56}$ — impossible. Solution: use a neural network (CNN) as a function approximator:

$$Q(s,a;\theta) \approx Q^*(s,a)$$

**Two key innovations that make DQN stable:**

1. **Experience Replay:** store transitions $(s_t, a_t, r_t, s_{t+1})$ in a replay buffer. Sample random mini-batches to break temporal correlations. Without it: consecutive correlated samples create feedback loops → training diverges.

2. **Target Network:** a frozen copy $\theta^-$ of the online network, updated every $C$ steps: $\theta^- \leftarrow \theta$. Use $\theta^-$ for TD targets:
$$\mathcal{L} = \mathbb{E}\!\left[\left(r + \gamma\max_{a'}Q(s',a';\theta^-) - Q(s,a;\theta)\right)^2\right]$$
Without it: both prediction and target change simultaneously → "chasing a moving target" → divergence.

DQN milestones: 2013 Atari paper trained on raw pixels (84×84 grayscale), frame stacking (last 4 frames) for velocity/motion perception, reward clipping ±1.

### Policy Gradient Methods

Instead of estimating Q, directly optimize the policy $\pi_\theta(a|s)$:

$$\nabla_\theta J(\theta) = \mathbb{E}_{\pi_\theta}\!\left[\nabla_\theta \log\pi_\theta(a_t|s_t) \cdot G_t\right]$$

Actions that led to high returns ($G_t > 0$) have their log-probability increased; bad actions decrease. Works naturally for **continuous action spaces** (where you can't take argmax over Q) and stochastic policies.

**REINFORCE (Monte Carlo policy gradient):** collect full episode, compute returns $G_t$ from end. High variance (same action in same state → very different $G_t$ depending on rest of episode).

### Actor-Critic Methods and PPO

**Actor-Critic:** two cooperating networks:
- **Actor** $\pi_\theta(a|s)$: the policy (what action to take)
- **Critic** $V_\phi(s)$: estimates state value (how good is this state?)

**Advantage function:** $A(s_t,a_t) = r_t + \gamma V(s_{t+1}) - V(s_t)$

Using advantage instead of raw return $G_t$ dramatically reduces variance. The critic provides a "baseline" — instead of asking "was this a good episode?" we ask "was this action better than expected given this state?".

**PPO (Proximal Policy Optimization):** clips the policy update to prevent destructively large steps:

$$L^\text{CLIP}(\theta) = \mathbb{E}\!\left[\min\!\left(\frac{\pi_\theta(a|s)}{\pi_{\theta_\text{old}}(a|s)}\hat{A},\;\text{clip}\!\left(\frac{\pi_\theta(a|s)}{\pi_{\theta_\text{old}}(a|s)},\,1-\varepsilon,\,1+\varepsilon\right)\hat{A}\right)\right]$$

The clip prevents ratio $\pi_\theta/\pi_{\theta_\text{old}}$ from getting too large. No trust-region constraint needed (unlike TRPO) — simpler to implement, slightly less efficient but more stable.

PPO is one of the most widely deployed RL algorithms: Gymnasium (formerly OpenAI Gym), robotics, game AI, **RLHF**.

### RLHF — Reinforcement Learning from Human Feedback

The pipeline that transforms a raw language model into ChatGPT/Claude/Gemini:

```
STAGE 1 — SUPERVISED FINE-TUNING (SFT):
  Base LLM + (prompt, ideal response) pairs written by human experts
  → fine-tune LLM to follow instructions and preferred format

STAGE 2 — REWARD MODEL TRAINING:
  Generate multiple responses to same prompt
  Humans rank them: response A > B > C
  Train reward model: RM(prompt, response) → scalar score
  Loss: -log σ(r(y_w) - r(y_l))   [preferred y_w > rejected y_l]

STAGE 3 — PPO OPTIMIZATION:
  Treat LLM as RL policy; reward = RM score − β·KL_penalty
  PPO updates LLM to maximize expected reward
  KL penalty prevents "reward hacking" (drifting far from SFT model)
```

$$R(x,y) = r_\theta(x,y) - \beta \cdot D_{\text{KL}}\bigl[\pi_\phi(y|x) \,\|\, \pi_{\text{SFT}}(y|x)\bigr]$$

The KL penalty is essential — without it, the LLM finds degenerate outputs that score high on the reward model (which is an imperfect proxy) but are actually low-quality.

**DPO (Direct Preference Optimization):** skips the reward model; reparameterizes the RLHF objective so the LLM is trained directly on preference pairs. Simpler implementation; widely used.

**GRPO / RLVR (2025):** RL with *verifiable* rewards (math/code correctness), optimized with **GRPO** — critic-free, group-relative (advantage = reward − group mean), from DeepSeek-R1. Powers the reasoning models (DeepSeek-R1, OpenAI o1/o3). Modern post-training stack: SFT → DPO → RLVR.

### Model-Based vs Model-Free RL

| Property | Model-Free (DQN, PPO, SAC) | Model-Based (AlphaZero, MuZero) |
|---|---|---|
| Learns | Q or $\pi$ from experience | Environment dynamics $P(s'|s,a)$ |
| Sample efficiency | Low (needs many interactions) | High (simulates before acting) |
| Accuracy risk | None of wrong model | Plans fail if model inaccurate |
| Best for | Complex environments hard to model; cheap simulation | Expensive real-world data; well-structured games |

### Multi-Armed Bandit — RL Lite

The simplest RL setting: K slot machines (arms) each with unknown reward distribution. Pull an arm, observe reward, decide what to pull next. No state or transition dynamics — just pure exploration vs exploitation.

**ε-greedy bandit:** maintain $Q(a)$ = estimated mean reward for each arm. With probability ε: pull random arm (explore); with 1-ε: pull arm with highest $Q(a)$ (exploit). Update: $Q(a) \leftarrow Q(a) + \frac{1}{N(a)}[r - Q(a)]$ where $N(a)$ is number of times arm $a$ was pulled.

**UCB1:** adds uncertainty bonus $\sqrt{2\ln t / N(a)}$ to $Q(a)$. Never ignores any arm forever; pulls under-tried arms even if their current mean looks low.

Bandits are used in A/B testing (web optimisation), clinical trials (adaptive allocation), and recommendation systems.

### Famous RL Milestones

```
1992: TD-Gammon — backgammon at human level (TD learning + NN)
2013: DQN — human-level Atari from raw pixels
2016: AlphaGo — beats Lee Sedol (MCTS + policy/value nets + RL from self-play)
2017: AlphaZero — masters chess, shogi, Go from zero human data via self-play
2019: OpenAI Five — beats Dota 2 world champions (PPO at massive scale)
2020: MuZero — masters games without knowing the rules (learns dynamics)
2022: ChatGPT — RLHF aligns LLM to human preferences at scale
2024: AlphaProof — IMO silver-medal performance in mathematical reasoning
2025: DeepSeek-R1 / OpenAI o-series — RL from verifiable rewards (GRPO) unlocks reasoning models
```

**When to use RL — the litmus test:**
- Sequential decisions where each choice affects future options → RL ✓
- Clear reward signal exists (score, task completion) → RL ✓
- Simulator or cheap interaction available → RL ✓
- Single-shot prediction with labeled data → use supervised learning instead
- No clear reward signal → use unsupervised or supervised instead

---

> ✅ **Must-remember**
>
> - MDP = (S, A, P, R, γ); Markov property: future depends only on current state
> - Bellman: $Q^*(s,a) = R + \gamma\,\mathbb{E}[\max_{a'} Q^*(s',a')]$
> - Q-Learning: TD error = $r + \gamma\max Q(s',a') - Q(s,a)$; off-policy, model-free
> - DQN: experience replay (breaks correlation) + target network (stabilizes training)
> - PPO: clipped policy ratio prevents destructive large updates; workhorse of modern RL
> - RLHF = SFT → Reward Model → PPO with KL penalty; KL prevents reward hacking
> - ε-greedy: start ε=1.0 (full exploration) → decay to 0.05 (mostly exploit)

---

## One-page cheat recap

| Chapter | Single most important fact / formula |
|---|---|
| **Ch 07 — Intro to ML** | ML = Input + Output → Rules. AI ⊃ ML ⊃ Deep Learning ⊃ Gen AI. For tabular data, gradient boosting (XGBoost/LightGBM) beats deep learning. 80% of time is data prep. |
| **Ch 08 — Core Concepts** | Total Error = **Bias² + Variance + Noise**. Training loop: forward → loss → backprop → $w \leftarrow w - \alpha\,\partial L/\partial w$. Adam (lr=0.001) is default. L1→zeros (feature selection); L2→shrinks all (Ridge). |
| **Ch 09 — Data Preprocessing** | **Fit scaler on training data ONLY**, then transform test. IQR fence: $Q1-1.5\cdot IQR$ to $Q3+1.5\cdot IQR$. OHE for nominal; target encoding for high-cardinality. Scaling before splitting = silent leakage. |
| **Ch 10 — Supervised Learning** | Bagging (Random Forest) **reduces variance**; Boosting (XGBoost) **reduces bias**. Logistic Regression = linear boundary + calibrated probs. Always Stratified K-fold for classification. K=√n for KNN. |
| **Ch 11 — Unsupervised Learning** | K-Means: specify K, spherical only, K-Means++ init. DBSCAN: auto K, arbitrary shapes, marks noise. Silhouette $s=(b-a)/\max(a,b)$ ∈ [-1,1]; > 0.5 = good. PCA linear; t-SNE local viz only; UMAP local+global. |
| **Ch 12 — Key Algorithms** | Normal equation: $\mathbf{w}^* = (X^\top X)^{-1}X^\top\mathbf{y}$ (exact, O(p³)). Lasso → exact zeros. Gradient Boosting: each tree fits residuals. XGBoost level-wise; LightGBM leaf-wise (10–30× faster for large data). |
| **Ch 13 — Model Evaluation** | Precision = TP/(TP+FP); Recall = TP/(TP+FN); F1 = harmonic mean. **AUC-PR for imbalanced; AUC-ROC for balanced**. R² < 0 = worse than mean. Never tune on test set. TimeSeriesSplit for time-ordered data. |
| **Ch 14 — Neural Networks** | Transformer: $\text{softmax}(QK^\top/\sqrt{d_k})V$. Vanishing: sigmoid $0.25^{10}=10^{-6}$ → fix with ReLU + BatchNorm + skip connections. LSTM cell state $C_t$ = additive highway. ReLU for hidden; Softmax for multi-class output. |
| **Ch 15 — Reinforcement Learning** | Bellman: $Q^*(s,a) = R + \gamma\max_{a'}Q^*(s',a')$. Q-learning TD error: $r + \gamma\max Q(s') - Q(s,a)$. DQN: experience replay + target network. **PPO** = clipped policy ratio; backbone of RLHF. RLHF = SFT → RM → PPO + KL penalty. |
