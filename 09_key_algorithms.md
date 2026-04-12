# Chapter 9 — Key ML Algorithms Deep Dive

---

## What You'll Learn

After reading this chapter, you will be able to:
- Implement and interpret Linear and Logistic Regression
- Explain how Decision Trees choose splits (Gini, Entropy)
- Describe how Random Forest uses randomness to improve predictions
- Compare Gradient Boosting variants (XGBoost, LightGBM, CatBoost)
- Explain SVM and the kernel trick for non-linear boundaries
- Know when to use Naive Bayes and why it works despite its "naive" assumption
- Choose the right algorithm for any given problem using a decision framework

---

## Overview: The Algorithm Landscape

```
                        MACHINE LEARNING ALGORITHMS
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
   LINEAR MODELS             TREE MODELS              PROBABILISTIC
   ────────────              ───────────              ─────────────
   Linear Regression         Decision Tree            Naive Bayes
   Logistic Regression       Random Forest            Gaussian NB
   Ridge / Lasso             Gradient Boosting
   SVM (linear)              XGBoost / LightGBM

         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
  INSTANCE-BASED           NEURAL NETWORKS           UNSUPERVISED
  ──────────────           ───────────────           ────────────
  K-Nearest Neighbors      MLP / CNN / RNN           K-Means
  (lazy learner)           Transformer               DBSCAN
                           (see Chapter 8)           (see Chapter 5)
```

**How to navigate:**
- This chapter: Linear/Logistic Regression, Decision Tree, Random Forest, Gradient Boosting, SVM, KNN, Naive Bayes
- Deep-dive on splits/Gini/Entropy/bagging: [Chapter 6](06_supervised_learning.md) (Supervised Learning)
- Clustering (K-Means, DBSCAN, GMM): [Chapter 7](07_unsupervised_learning.md) (Unsupervised Learning)
- Neural networks: [Chapter 10](10_neural_networks.md)

---

## 7.1 Linear Regression — In Depth

### The Equation
```
  ŷ = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ

  ŷ  = predicted value
  w₀ = intercept (bias)
  w₁...wₙ = weights (coefficients)
  x₁...xₙ = feature values
```

### Worked Example: Predicting House Price

```
  TRAINING DATA:
  ──────────────────────────────────────────────────────────────
  SqFt (x₁)  │ Bedrooms (x₂) │ Age (x₃) │ Price (y)
  ───────────┼───────────────┼──────────┼──────────
    1500     │       3        │   10     │  $250,000
    2200     │       4        │    5     │  $370,000
     900     │       2        │   30     │  $150,000

  LEARNED MODEL:
  ──────────────────────────────────────────────────────────────
  Price = 50,000 + (120 × SqFt) + (15,000 × Bedrooms) − (1,000 × Age)

  PREDICTION for 1800 sqft, 3 bed, 8 years old:
  Price = 50,000 + (120×1800) + (15,000×3) − (1,000×8)
        = 50,000 + 216,000 + 45,000 − 8,000
        = $303,000
```

### How Weights Are Learned

```
  Goal: Find w that minimizes MSE:
  MSE = (1/n) × Σ (ŷᵢ − yᵢ)²

  RESIDUALS:
  y (price)
     │     *               Residual = distance between
  400K│   * |               actual point (*) and line (ŷ)
     │ * ─ ─ ─
  200K│      ← line = model
     └────────── x (sqft)

  TWO WAYS TO MINIMIZE:
  ──────────────────────────────────────────────────────────
  OLS (Ordinary Least Squares) — closed-form, one step:
    w = (XᵀX)⁻¹ Xᵀy
    Fast for small/medium data. Fails if XᵀX not invertible.

  Gradient Descent — iterative (see Chapter 2, Section 2.9):
    Used when n > ~100K rows or for regularized variants.
```

### Regularized Variants

```
  RIDGE REGRESSION (L2):
    Loss = MSE + λ × Σ wᵢ²
    Shrinks all weights toward zero. Keeps all features.
    Use when: all features likely matter, just need smaller weights.

  LASSO REGRESSION (L1):
    Loss = MSE + λ × Σ |wᵢ|
    Drives some weights to exactly 0 (automatic feature selection!).
    Use when: you suspect only a few features actually matter.

  ELASTIC NET:
    Loss = MSE + λ₁ × Σ |wᵢ| + λ₂ × Σ wᵢ²
    Combines Ridge + Lasso. Best when features are correlated.

  λ (lambda): regularization strength. Higher = simpler model.
              Too high = underfitting. Tune via cross-validation.
```

---

## 7.2 Logistic Regression — Deep Dive

### Simple Explanation
Linear regression predicts a number. Logistic regression squashes that number into a
probability between 0 and 1 — then decides: above 0.5 = YES, below 0.5 = NO.

### The Sigmoid Function

```
  STEP 1: Compute a linear score (like Linear Regression):
    z = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ

  STEP 2: Squash z into [0, 1] with sigmoid:
    Think of it like a gate that slowly opens: very negative z → nearly 0,
    very positive z → nearly 1, z=0 → exactly 0.5.

    σ(z) = 1 / (1 + e^(-z))

  SIGMOID SHAPE:
  P(y=1)
    1.0 │                    ─────────────
    0.8 │              ─────╱
    0.5 │─────────────╱       ← threshold (usually 0.5)
    0.2 │        ─────╱
    0.0 │────────
        └─────────────────────────────────── z (score)
        -6     -3      0      3      6

  Output = probability that the sample belongs to class 1.
```

**Official Definition:**
> **Logistic Regression** models the probability of a binary outcome using the logistic
> (sigmoid) function applied to a linear combination of features. It is trained by
> maximizing the log-likelihood (equivalent to minimizing binary cross-entropy loss).

### Decision Boundary

```
  Feature 2
      │   ╲  ○ ○ ○        Decision boundary is where:
      │    ╲ ○ ○             w₀ + w₁x₁ + w₂x₂ = 0
   ○  │  ● ●╲● ○           (P(y=1) = 0.5)
      │ ● ● ●╲             ● = class 1, ○ = class 0
      └─────────── Feature 1

  Key: the boundary is ALWAYS a straight line (linear model).
  If data is not linearly separable → use kernels or neural networks.
```

### Multiclass: One-vs-Rest (OvR) Strategy

```
  For 3 classes: Cat, Dog, Bird

  Train 3 separate binary classifiers:
  ┌─────────────────────────────────────────────────┐
  │ Classifier 1: "Is it a Cat?"   → P(Cat)  = 0.7  │
  │ Classifier 2: "Is it a Dog?"   → P(Dog)  = 0.2  │
  │ Classifier 3: "Is it a Bird?"  → P(Bird) = 0.3  │
  └─────────────────────────────────────────────────┘

  Pick the class with the HIGHEST probability → Cat! 🐱

  Note: probabilities don't need to sum to 1 in OvR.
  For true probabilities use softmax (multinomial logistic regression).
```

### Threshold Tuning

```
  Default threshold = 0.5, but you can change it!

  High threshold (e.g., 0.8):
    Model only predicts POSITIVE if very confident.
    → Higher precision, lower recall
    → Use when false positives are costly (spam filter)

  Low threshold (e.g., 0.2):
    Model predicts POSITIVE even when uncertain.
    → Lower precision, higher recall
    → Use when false negatives are costly (cancer screening)

  See Chapter 9 for ROC curve and optimal threshold selection.
```

---

## 7.3 Decision Trees — Deep Dive

### Simple Explanation
A decision tree is like 20 Questions — it asks yes/no questions about your data
until it reaches an answer. The key challenge is: which question to ask first?

### How Splits Are Chosen

```
  At each node, try EVERY possible split on EVERY feature.
  Pick the split that creates the most "pure" child nodes.

  Two measures of purity (covered in detail in Chapter 4):
  ─────────────────────────────────────────────────────────
  Gini Impurity:   G = 1 − Σ pᵢ²
  Entropy:         H = −Σ pᵢ × log₂(pᵢ)

  Both answer: "how mixed are the classes in this node?"
  Lower = purer = better split.

  See Chapter 4, Section 4.3 for a worked numerical example
  with the Play Tennis dataset.
```

### The Depth Problem

```
  Depth 2 tree (simple, may underfit):       Depth 10 tree (may overfit):
  ─────────────────────────────────          ────────────────────────────
          [Age > 30?]                         [Age > 30?]
         /          \                        /           \
   [Income>50K?]  [Job=Tech?]         [Income>50K?]  [Complex...]
   /     \         /     \            /      \
  YES    NO      YES     NO         ...   [More splits]...
                                              │
  Fewer splits = general rules.        Memorizes every training
  Better on new data.                  example. Fails on new data.

  SOLUTION: CONTROL TREE DEPTH with hyperparameters (see 7.10)
```

### Pre-Pruning (Most Common)
Stop the tree from growing too deep during training:

```
  max_depth       = 5      ← never go deeper than 5 levels
  min_samples_split = 20   ← only split if node has ≥ 20 samples
  min_samples_leaf  = 10   ← leaves must have ≥ 10 samples
  max_features      = 10   ← only consider 10 features per split

  These hyperparameters PREVENT memorizing training data.
```

### Post-Pruning: Cost-Complexity Pruning

```
  After training a full tree, work BACKWARDS removing branches
  that don't improve accuracy enough to justify their complexity.

  Score = Error on validation set + α × (number of leaves)
            ─────────────────────   ─────────────────────
               reward accuracy           penalize complexity

  Increase α → remove more branches → simpler tree
  Decrease α → keep more branches  → complex tree
  (sklearn calls this parameter: ccp_alpha)
```

**Official Definition:**
> **Decision Tree** is a non-parametric supervised learning algorithm that partitions the
> feature space into axis-aligned regions by recursively choosing splits that maximize an
> impurity criterion (e.g., Gini or Information Gain). Predictions are the majority class
> (classification) or mean value (regression) in each leaf node.

---

## 7.4 Random Forest — Deep Dive

### Simple Explanation
Instead of trusting one decision tree, train 100 trees — each on a slightly different
random sample of the data. They all vote. The majority wins. One confused tree gets
outvoted. Smart trees agree. The result is surprisingly robust!

### The Two Sources of Randomness

```
  RANDOMNESS 1: Bootstrap Sampling (Bagging)
  ───────────────────────────────────────────
  Original data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  Tree 1 trains on: [2, 2, 5, 7, 3, 9, 1, 4, 4, 6]  (sample with replacement)
  Tree 2 trains on: [8, 1, 3, 3, 7, 2, 9, 5, 6, 6]  (different sample)
  Tree 3 trains on: [4, 7, 1, 8, 2, 5, 3, 9, 7, 1]  (yet another sample)

  Each tree sees a different "view" of the data → diverse opinions!

  RANDOMNESS 2: Feature Subsampling
  ───────────────────────────────────────────
  At each split, only consider a RANDOM SUBSET of features:
  Classification: √(total features)   e.g., √20 ≈ 4 features
  Regression:     total features / 3  e.g., 20/3 ≈ 6 features

  Why? If one feature is very strong, every tree would use it at
  the top → trees become correlated → defeats the purpose of voting!
  Forcing different features = diverse trees = better ensemble.
```

### Out-of-Bag (OOB) Error

```
  When building each tree via bootstrap sampling,
  ~37% of samples are NOT used for that tree.
  These are called "out-of-bag" samples for that tree.

  Original: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  Tree 1 trains on: [2, 2, 5, 7, 3, 9, 1, 4, 4, 6]
  Tree 1 OOB:       [8, 10]  ← these were never seen by Tree 1

  OOB Error:
  ─────────────────────────────────────────────────────
  For each sample, collect predictions ONLY from trees
  that did NOT train on it (its OOB trees).
  Average those predictions → OOB accuracy.

  This is essentially a FREE cross-validation estimate!
  You don't need to hold out a separate validation set.
  Use oob_score=True in sklearn's RandomForestClassifier.
```

### n_estimators vs Performance

```
  Accuracy
      │             ─ ─ ─ ─ ─ ─ ─  plateau
      │         ────
      │      ───
      │   ───
      │───
      └─────────────────────────────── n_estimators (trees)
       10  50  100  200  500

  More trees = better accuracy UP TO A POINT.
  After ~100-200 trees: minimal gain, but training takes longer.
  Rule of thumb: start with 100, increase if time allows.
```

**Official Definition:**
> **Random Forest** is an ensemble method that builds multiple decision trees using
> bootstrap sampling and random feature subsets (bagging + feature randomization).
> The final prediction aggregates tree outputs: majority vote (classification) or
> mean (regression). The decorrelation between trees reduces variance significantly.

---

## 7.5 Gradient Boosting — The Competition Champion

### Simple Explanation
Gradient Boosting is like correcting a student's homework. The first model makes
predictions. The second model *only learns from the mistakes* of the first. The third
learns from the mistakes of the combined first+second. Keep going. Final answer = sum.

```
  BOOSTING IDEA:
  ──────────────────────────────────────────────────────────────
  Real answer: 100

  Tree 1 (weak): predicts 70   → Residual error = 30
                                        │
  Tree 2 predicts residual: 20  → Residual error = 10
                                        │
  Tree 3 predicts residual: 8   → Residual error = 2
                                        │
  Final = 70 + 20 + 8 = 98 ≈ 100  (close!)

  Each tree CORRECTS the errors of all previous trees!
```

**Official Definition:**
> **Gradient Boosting** builds an ensemble of weak learners (shallow decision trees)
> sequentially. Each new tree is fit to the negative gradient of the loss function
> (equivalent to the residuals for MSE). The final prediction is the sum of all
> trees' outputs, each scaled by a learning rate η.

### The Learning Rate Tradeoff

```
  Final model = η×tree₁ + η×tree₂ + η×tree₃ + ...

  Large η (e.g., 0.3): learns fast, fewer trees needed,
                       but can overshoot the minimum → overfit

  Small η (e.g., 0.01): learns slowly, needs many more trees,
                        but more accurate and robust

  KEY RULE: learning_rate × n_estimators ≈ constant
  e.g., η=0.1 + 100 trees ≈ η=0.01 + 1000 trees (similar accuracy)

  Best practice: use small η + many trees + early stopping.
```

### XGBoost vs LightGBM vs CatBoost

```
┌────────────────┬────────────────────────────────────────────────┐
│ XGBoost        │ Level-wise tree growth (balanced)              │
│                │ Regularization built-in (L1 + L2)             │
│                │ Handles missing values natively                │
│                │ Great general performance                      │
├────────────────┼────────────────────────────────────────────────┤
│ LightGBM       │ Leaf-wise tree growth (faster, targets errors) │
│                │ 10x faster training on large datasets          │
│                │ Less memory usage (histogram-based splits)     │
│                │ Best for: large n, fast iteration              │
├────────────────┼────────────────────────────────────────────────┤
│ CatBoost       │ Native categorical feature support             │
│                │ No manual encoding needed (target encoding)    │
│                │ Ordered boosting prevents leakage              │
│                │ Best for: datasets with many categorical cols  │
└────────────────┴────────────────────────────────────────────────┘
```

### Tree Growth Strategy Comparison

```
  Level-wise (XGBoost):           Leaf-wise (LightGBM):
  ──────────────────────          ─────────────────────────
          root                            root
         /    \                          /    \
        A      B        vs             A      B
       / \    / \                     / \
      C   D  E   F                   C   D
                                    / \
                                   G   H  ← always splits highest-error leaf

  Balanced tree.                  Unbalanced but faster convergence.
  Safer on small data.            Can overfit small datasets (tune max_depth).
```

---

## 7.6 Support Vector Machines — Deep Dive

### The Core Idea: Maximum Margin

```
  Many lines can separate two classes.
  SVM finds the ONE line (or hyperplane) with the LARGEST MARGIN.

  Feature 2
      │    ○ ○   ╱  ← margin (as wide as possible!)
      │   ○ ○  ╱╱
      │       ╱╱╱← decision boundary (the middle of the margin)
      │      ╱╱╱╱
      │     ╱╱● ●
      │    ╱  ● ● ●
      └─────────── Feature 1

  Support Vectors: the training points closest to the boundary.
  They "support" (define) the margin. All other points don't matter!

  Why maximize margin?
  Larger margin → more room for new data → better generalization.
```

### Hard Margin vs Soft Margin (C Parameter)

```
  HARD MARGIN (no errors allowed):
    Requires perfectly separable data.
    Rare in practice — one outlier breaks everything!

  SOFT MARGIN (allows some errors):
    C parameter controls the tradeoff:

  Low C (soft margin):          High C (hard margin):
  ─────────────────────         ──────────────────────
  ○ ○  ╱  ─ ─ ─ ╲  ● ●        ○ ○  ╱──╲  ● ●
       ↑ wide margin ↑               ↑ narrow margin ↑
  Allows misclassification.    Fits training data tightly.
  More robust to outliers.     More sensitive to outliers.
  May underfit noisy data.     May overfit.

  Tuning C:
    C too small → underfitting (too many errors allowed)
    C too large → overfitting (memorizes training data)
    Tune with cross-validation! Typical range: 0.001 to 1000.
```

### The Kernel Trick

```
  PROBLEM: Data is NOT linearly separable in 2D!

  Feature 2
     │  ● ● ○ ● ●   ← circles inside ring of squares
     │ ○ ● ● ● ○
     │ ○ ● ● ● ○    Can't draw a straight line!
     └─────────── Feature 1

  SOLUTION: Project to higher dimension!
  Add feature: x₃ = x₁² + x₂²  (distance from center)

  Feature 3
     │
   5 │              ○ ○ ○ ○   ← circles far from center (high x₃)
   2 │  ● ● ● ●             ← dots close to center (low x₃)
     └──────────────── Feature 1

  Now it's linearly separable with a flat plane!

  The Kernel Trick: computes the similarity in high-dimensional
  space WITHOUT explicitly transforming the data. Saves memory!
```

### Kernel Selection Guide

```
┌──────────────────┬────────────────────┬────────────────────────────┐
│ Kernel           │ Formula            │ When to Use                │
├──────────────────┼────────────────────┼────────────────────────────┤
│ Linear           │ K(x,y) = xᵀy       │ Linearly separable,        │
│                  │                    │ high-dimensional (text)    │
├──────────────────┼────────────────────┼────────────────────────────┤
│ Polynomial       │ K(x,y)=(xᵀy+c)ᵈ   │ Polynomial relationships,  │
│                  │                    │ image recognition          │
├──────────────────┼────────────────────┼────────────────────────────┤
│ RBF (Gaussian)   │ K(x,y)=            │ Most popular default.      │
│                  │  e^(-γ·‖x−y‖²)    │ Works well for non-linear  │
│                  │                    │ data. Start here!          │
└──────────────────┴────────────────────┴────────────────────────────┘

  RBF γ parameter:
    High γ: small "reach" — each point only influences close neighbors
            → complex decision boundary → can overfit
    Low γ:  large "reach" — each point influences far-away points
            → smooth decision boundary → can underfit
  Tune γ together with C (grid search both simultaneously).
```

**Official Definition:**
> **SVM** finds the hyperplane that maximizes the geometric margin between two classes.
> With soft margins (C parameter) it tolerates some misclassifications. The kernel trick
> implicitly maps inputs to high-dimensional feature spaces where linear separation
> is possible, enabling non-linear classification without explicit transformation.

---

## 7.7 K-Nearest Neighbors — Deep Dive

### Simple Explanation
KNN asks: "Who are your K closest neighbors? What class are most of them?"
That's your prediction. No training — all the work happens at prediction time!

### Distance Metrics

```
  TWO POINTS: A = (1, 2)  and  B = (4, 6)

  Euclidean Distance (straight-line):
    d = √[(4−1)² + (6−2)²] = √[9 + 16] = √25 = 5

  Manhattan Distance (city blocks):
    d = |4−1| + |6−2| = 3 + 4 = 7

  Minkowski Distance (generalizes both):
    d = (Σ|xᵢ−yᵢ|^p)^(1/p)
    p=1 → Manhattan,  p=2 → Euclidean

  IMPORTANT: KNN requires feature scaling!
  If age is 0-80 and income is 0-100,000,
  income dominates distance → age becomes irrelevant.
  Always StandardScaler or MinMaxScaler before KNN!
```

### Choosing K

```
  K=1 (overfit):          K=15 (underfit):         K=5 (balanced):
  ─────────────           ──────────────           ──────────────
  Boundary follows         Too smooth, misses        Smooth but
  every single point.      real structure.           captures shape.

  Validation Error
      │
   0.3│ *
      │  *
   0.2│    *
      │      *
   0.1│           * *
      │                 * * * * * *
      └────────────────────────────── K
           1  3  5  7  9 11 13 15

  Rule of thumb: start at K = √(n_training_samples)
  Always use cross-validation to find the best K.
  Use odd K for binary classification (avoids ties).
```

### Weighted KNN

```
  Standard KNN: each of the K neighbors gets equal vote.

  Weighted KNN: closer neighbors get MORE influence.
    weight = 1 / distance²

  Example (K=3):
  ───────────────────────────────────────────────
  Neighbor 1: Class A, distance = 1.0 → weight = 1.00
  Neighbor 2: Class A, distance = 2.0 → weight = 0.25
  Neighbor 3: Class B, distance = 1.1 → weight = 0.83

  Standard: A=2 votes, B=1 vote → Class A
  Weighted: A=1.25, B=0.83 → Class A (but closer vote!)

  Use weights='distance' in sklearn's KNeighborsClassifier.
```

**Official Definition:**
> **K-Nearest Neighbors** is a non-parametric, lazy learning algorithm that classifies
> a new point by majority vote of its K closest training points (by distance). It stores
> the entire training set and defers computation to prediction time. It has no explicit
> training phase — making it simple but slow for large datasets.

---

## 7.8 Naive Bayes — Deep Dive

### Simple Explanation
Given evidence (words in an email), what's the most probable cause (spam or not)?
Naive Bayes multiplies the probabilities of each piece of evidence together.
"Naive" because it assumes each word is independent — obviously not true
("free" and "money" often appear together), but it still works!

### Spam Filter Example

```
  "FREE MONEY CLICK HERE!!!" → Is this spam?

  P(spam | words) ∝ P(spam) × P("free"|spam) × P("money"|spam) × P("click"|spam)
                  ∝  0.40   ×     0.90        ×     0.85        ×     0.88
                  ∝ 0.268

  P(not spam | words) ∝ 0.60 × 0.05 × 0.02 × 0.01
                      ∝ 0.0000006

  Since 0.268 >> 0.0000006 → SPAM ✓
```

### Gaussian Naive Bayes (for continuous features)

```
  Problem: standard NB uses counts/frequencies → only works for
  discrete features (words, categories).

  For continuous features (age, temperature, salary):
  Assume each feature follows a Normal (Gaussian) distribution!

  P(x | class) = (1 / √(2πσ²)) × exp(−(x − μ)²/ 2σ²)

  TRAINING: For each class, compute mean (μ) and std (σ) per feature.
  ─────────────────────────────────────────────────────────────
  Feature: Temperature
  Class "Play Tennis":  μ = 25°C,  σ = 3.5
  Class "Skip Tennis":  μ = 35°C,  σ = 2.1

  PREDICTION: Given temp = 28°C, which class is more likely?
    P(28 | Play) = Gaussian(28; μ=25, σ=3.5) = 0.085
    P(28 | Skip) = Gaussian(28; μ=35, σ=2.1) = 0.001
    → Predicted: "Play Tennis"
```

### Laplace Smoothing (Zero Probability Problem)

```
  PROBLEM: What if "lottery" never appeared in spam training data?
    P("lottery" | spam) = 0/1000 = 0.0

  Then: P(spam | "free lottery") ∝ 0.268 × 0.0 = 0.0 (entire prediction broken!)

  SOLUTION: Laplace Smoothing (add 1 to every count):
    P("lottery" | spam) = (0 + 1) / (1000 + V)
                              ↑           ↑
                        add 1 count    V = vocabulary size

  This ensures no probability is ever exactly zero.
  α=1 is standard. Use smaller α for less smoothing.
```

**Official Definition:**
> **Naive Bayes** is a probabilistic classifier applying Bayes' theorem with the
> "naive" conditional independence assumption between features. Despite this
> simplification, it achieves competitive accuracy and excels in text classification,
> spam filtering, and high-dimensional discrete data due to fast training and prediction.

---

## 7.9 Time & Space Complexity

```
  n = training samples, p = features, K = neighbors/trees, d = tree depth

┌─────────────────────┬──────────────────┬──────────────┬────────────────┐
│ Algorithm           │ Train Time       │ Predict Time │ Memory         │
├─────────────────────┼──────────────────┼──────────────┼────────────────┤
│ Linear Regression   │ O(np²) or O(n)   │ O(p)         │ O(p)           │
│ (OLS or GD)         │ OLS fast; GD iter│ Instant      │ Tiny           │
├─────────────────────┼──────────────────┼──────────────┼────────────────┤
│ Logistic Regression │ O(n × p × iter)  │ O(p)         │ O(p)           │
│                     │ Iterative        │ Instant      │ Tiny           │
├─────────────────────┼──────────────────┼──────────────┼────────────────┤
│ Decision Tree       │ O(n × p × log n) │ O(depth)     │ O(nodes)       │
│                     │ Sort each feat.  │ Fast         │ Small          │
├─────────────────────┼──────────────────┼──────────────┼────────────────┤
│ Random Forest       │ O(K×n×√p×log n)  │ O(K × depth) │ O(K × nodes)   │
│                     │ Parallelizable   │ Medium       │ Medium         │
├─────────────────────┼──────────────────┼──────────────┼────────────────┤
│ Gradient Boosting   │ O(K×n×p×log n)   │ O(K × depth) │ O(K × nodes)   │
│                     │ Sequential!      │ Medium       │ Medium         │
├─────────────────────┼──────────────────┼──────────────┼────────────────┤
│ SVM (RBF kernel)    │ O(n² to n³)      │ O(SV × p)    │ O(SV × p)      │
│                     │ Slow for n>10K   │ Fast         │ Stores SVs     │
├─────────────────────┼──────────────────┼──────────────┼────────────────┤
│ KNN                 │ O(1) — lazy!     │ O(n × p)     │ O(n × p)       │
│                     │ Just stores data │ SLOW at pred │ Stores all!    │
├─────────────────────┼──────────────────┼──────────────┼────────────────┤
│ Naive Bayes         │ O(n × p)         │ O(p)         │ O(classes × p) │
│                     │ Very fast        │ Instant      │ Tiny           │
└─────────────────────┴──────────────────┴──────────────┴────────────────┘

SV = number of support vectors (can be large in high dimensions)
```

---

## 7.10 Key Hyperparameters Cheat Sheet

```
┌──────────────────────┬──────────────────────────────────────────────────────┐
│ Algorithm            │ Key Hyperparameters (most important first)           │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ Linear/Logistic Reg. │ C or alpha (regularization strength)                │
│                      │ penalty: 'l1', 'l2', 'elasticnet'                   │
│                      │ solver: 'lbfgs', 'saga' (for large n)               │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ Decision Tree        │ max_depth (most impactful, try 3–15)                 │
│                      │ min_samples_split, min_samples_leaf                 │
│                      │ max_features, ccp_alpha (post-pruning)              │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ Random Forest        │ n_estimators (100–500, more = better)               │
│                      │ max_depth, max_features                             │
│                      │ min_samples_leaf, bootstrap                         │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ XGBoost / LightGBM   │ learning_rate (0.01–0.3) + n_estimators together    │
│                      │ max_depth (3–8), subsample (0.6–0.9)                │
│                      │ colsample_bytree, reg_alpha, reg_lambda             │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ SVM                  │ C (0.001–1000, log scale) — MOST important          │
│                      │ kernel: 'rbf', 'linear', 'poly'                     │
│                      │ gamma: 'scale', 'auto', or float (for RBF)          │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ KNN                  │ n_neighbors K (try 1–20, use cross-val)             │
│                      │ weights: 'uniform' or 'distance'                    │
│                      │ metric: 'euclidean', 'manhattan', 'minkowski'       │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ Naive Bayes          │ var_smoothing (Gaussian NB): default 1e-9           │
│                      │ alpha (Laplace smoothing, MultinomialNB): 1.0       │
└──────────────────────┴──────────────────────────────────────────────────────┘

General Tuning Order:
  1. Start with defaults → establish baseline
  2. Tune most impactful hyperparameter first (see above)
  3. Use RandomizedSearchCV then narrow with GridSearchCV
  4. Always tune on VALIDATION set, report final on TEST set
```

---

## 7.11 Algorithm Comparison for Tabular Data

```
┌─────────────────┬───────┬──────────┬───────────┬────────────────────┬──────────────────────┐
│ Algorithm       │ Speed │ Accuracy │ Memory    │ Best For           │ Weak Spots           │
├─────────────────┼───────┼──────────┼───────────┼────────────────────┼──────────────────────┤
│ Linear/Logistic │ ★★★★★ │ ★★★      │ ★★★★★     │ Baseline, linear   │ Non-linear patterns  │
│ Regression      │ Fast  │ OK       │ Tiny      │ separable data     │                      │
├─────────────────┼───────┼──────────┼───────────┼────────────────────┼──────────────────────┤
│ Decision Tree   │ ★★★★★ │ ★★★      │ ★★★★      │ Interpretable,     │ Overfits easily      │
│                 │ Fast  │ OK       │ Small     │ explainability     │ unstable (variance)  │
├─────────────────┼───────┼──────────┼───────────┼────────────────────┼──────────────────────┤
│ Random Forest   │ ★★★★  │ ★★★★     │ ★★★       │ General purpose,   │ Slower than single   │
│                 │ Med   │ Good     │ Med       │ robust baseline    │ tree at prediction   │
├─────────────────┼───────┼──────────┼───────────┼────────────────────┼──────────────────────┤
│ XGBoost/LGBM    │ ★★★   │ ★★★★★    │ ★★★       │ Tabular data,      │ Many hyperparams     │
│                 │ Med   │ Best     │ Med       │ competitions       │ to tune              │
├─────────────────┼───────┼──────────┼───────────┼────────────────────┼──────────────────────┤
│ SVM             │ ★★    │ ★★★★     │ ★★★       │ Medium datasets,   │ Slow for n > 10K,    │
│                 │ Slow  │ Good     │ Med       │ clear margin sep.  │ hard to tune         │
├─────────────────┼───────┼──────────┼───────────┼────────────────────┼──────────────────────┤
│ KNN             │ ★★★   │ ★★★      │ ★★        │ Non-linear, small  │ Very slow prediction │
│                 │ Fast  │ OK       │ Stores    │ datasets           │ on large data        │
│                 │ train │          │ all data  │                    │ needs scaling!       │
├─────────────────┼───────┼──────────┼───────────┼────────────────────┼──────────────────────┤
│ Naive Bayes     │ ★★★★★ │ ★★★      │ ★★★★★     │ Text, spam, fast   │ Assumes independence │
│                 │ Fast  │ OK       │ Tiny      │ high-dim data      │ bad with correl. feat│
└─────────────────┴───────┴──────────┴───────────┴────────────────────┴──────────────────────┘
```

---

## How to Choose an Algorithm

```
  START HERE
      │
      ▼
  ┌──────────────────────────────────────────────┐
  │ What TYPE of problem?                        │
  └──────────────────────────────────────────────┘
      │                       │                       │
      ▼                       ▼                       ▼
  Classification           Regression             Clustering
  (predict category)       (predict number)       (no labels)
      │                       │                       │
      │                   → same flow             See Chapter 5
      ▼
  ┌──────────────────────────────────────────────┐
  │ Do you need INTERPRETABILITY?                │
  └──────────────────────────────────────────────┘
      │                               │
      YES                             NO
      │                               │
      ▼                               ▼
  Logistic Regression            How much DATA?
  or Decision Tree               │
  (explainable to                ├── < 1,000 rows
  stakeholders)                  │       → Logistic Regression
                                 │         Naive Bayes, KNN
                                 │
                                 ├── 1,000 – 100,000 rows
                                 │       → Random Forest or XGBoost
                                 │         (works well out of the box)
                                 │
                                 └── > 100,000 rows
                                         → LightGBM or Linear models
                                           for structured/tabular data
                                           Neural Networks for
                                           images / text / audio
  ┌──────────────────────────────────────────────┐
  │ Special cases:                               │
  │ • Lots of categorical features → CatBoost   │
  │ • Text/NLP → Naive Bayes (baseline),        │
  │              then Transformers              │
  │ • High-dimensional, clear margin → SVM     │
  │ • Survival/time-to-event → CoxPH model     │
  └──────────────────────────────────────────────┘

  UNIVERSAL RULE:
  ─────────────────────────────────────────────────────────
  Always start simple! Logistic Regression baseline → beat it.
  Then Random Forest → beat it.
  Then XGBoost/LightGBM → probably your best tabular model.
  Complex ≠ better. A well-tuned simpler model often wins.
```

---

## Common Algorithm Mistakes

```
  ┌─────────────────┬──────────────────────────────────────────────┐
  │ Algorithm       │ Most Common Mistake                          │
  ├─────────────────┼──────────────────────────────────────────────┤
  │ Linear Reg.     │ Not checking residual plots (assumes linear) │
  │ Logistic Reg.   │ Not scaling features, forgetting threshold   │
  │ Decision Tree   │ Not setting max_depth → always overfits      │
  │ Random Forest   │ Using too few trees (n_estimators < 50)      │
  │ XGBoost         │ Not using early stopping → overfits          │
  │ SVM             │ Not scaling features (SVM is distance-based) │
  │ KNN             │ Forgetting to scale → dominated by one feat  │
  │ Naive Bayes     │ Using with continuous features without GNB   │
  └─────────────────┴──────────────────────────────────────────────┘

  THREE FEATURES ALL DISTANCE-BASED ALGORITHMS NEED SCALED:
  SVM, KNN, Logistic Regression, Linear Regression
  (Tree-based: Decision Tree, Random Forest, XGBoost → no scaling needed)
```

---

## Key Takeaways

```
╔═══════════════════════════════════════════════════════════════════╗
║  KEY ALGORITHMS CHEAT SHEET                                       ║
║  ─────────────────────────────────────────────────────────────   ║
║  Linear Regression  → predict numbers (needs feature scaling)   ║
║  Ridge/Lasso        → regularized regression (tune λ)           ║
║  Logistic Regression→ binary/multiclass classification          ║
║  Decision Tree      → interpretable, set max_depth to control   ║
║  Random Forest      → ensemble, robust, OOB error = free CV     ║
║  Gradient Boosting  → sequential, best tabular accuracy         ║
║  XGBoost/LightGBM   → competition winners, tune η+n together    ║
║  SVM                → maximize margin, tune C + γ + kernel      ║
║  KNN                → lazy, slow prediction, scale features!    ║
║  Naive Bayes        → fast, text/NLP, use Gaussian for cont.    ║
║  ─────────────────────────────────────────────────────────────   ║
║  START SIMPLE → BEAT BASELINE → LEVEL UP → USE CROSS-VAL        ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## Review Questions — Test Your Understanding

1. What's the key difference between Ridge (L2) and Lasso (L1) regression? When would you choose Lasso?
2. A Decision Tree with max_depth=20 on a small dataset is overfitting. Name three hyperparameters you could tune to fix this.
3. Explain in one sentence why Random Forest is better than a single Decision Tree.
4. Your dataset has 1 million rows and 200 features. Which gradient boosting library would you try first and why?
5. SVM with a linear kernel can't separate your data. What do you do?
6. Naive Bayes assumes all features are independent (which is almost never true). Why does it still work well in practice?

<details>
<summary>Answers</summary>

1. Ridge shrinks all weights toward zero but keeps all features. Lasso drives some weights to exactly zero, performing automatic feature selection. Choose Lasso when you suspect many features are irrelevant — it will remove them for you.
2. Reduce max_depth (e.g., 5-10), increase min_samples_split (e.g., 20+), increase min_samples_leaf (e.g., 10+). You could also use post-pruning (ccp_alpha).
3. Random Forest averages predictions from many diverse trees, each trained on different random subsets, so individual trees' errors cancel out — giving lower variance and better generalization.
4. LightGBM — it's the fastest on large datasets due to leaf-wise growth and histogram-based splits. XGBoost is also good. CatBoost if you have many categorical features.
5. Use a non-linear kernel (RBF/Gaussian is the default). The kernel trick maps data to a higher-dimensional space where it becomes linearly separable. Alternatively, switch to a different algorithm like Random Forest.
6. Even though the independence assumption is violated, Naive Bayes often gets the ranking of class probabilities right (which class is most likely), even if the exact probabilities are wrong. It also has very low variance, making it robust on small datasets.
</details>

---

**Previous:** [Chapter 8 — Reinforcement Learning](08_reinforcement_learning.md)
**Next:** [Chapter 10 — Neural Networks & Deep Learning](10_neural_networks.md)
