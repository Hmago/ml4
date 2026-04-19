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

### Simple Explanation
Imagine you are selling lemonade. You notice that on hotter days, you sell more cups. So you draw a line on a piece of graph paper: temperature on the bottom, cups sold on the side. Your line goes up from left to right because hotter = more lemonade. Now, if someone tells you tomorrow will be 90 degrees, you slide your finger along the line to see how many cups you will probably sell. That line is your model!

Linear Regression is just drawing the best straight line through a bunch of dots. Each dot is a real example you already know about (like "it was 85 degrees and I sold 40 cups"). The computer tries millions of slightly different lines and picks the one that gets closest to ALL the dots at once. Once you have that line, you can use it to predict new answers you have never seen before -- like how many cups you will sell when it is 95 degrees.

### The Equation

$$\hat{y} = w_0 + w_1 x_1 + w_2 x_2 + \cdots + w_n x_n$$

```
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

Goal: Find $w$ that minimizes MSE:

$$\text{MSE} = \frac{1}{n} \sum_{i=1}^{n} (\hat{y}_i - y_i)^2$$

```
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
```

$$\mathbf{w} = (X^\top X)^{-1} X^\top \mathbf{y}$$

```
    Fast for small/medium data. Fails if XᵀX not invertible.

  Gradient Descent — iterative (see Chapter 2, Section 2.9):
    Used when n > ~100K rows or for regularized variants.
```

### Regularized Variants

**RIDGE REGRESSION (L2):**

$$\text{Loss} = \text{MSE} + \lambda \sum w_i^2$$

Shrinks all weights toward zero. Keeps all features.
Use when: all features likely matter, just need smaller weights.

**LASSO REGRESSION (L1):**

$$\text{Loss} = \text{MSE} + \lambda \sum |w_i|$$

Drives some weights to exactly 0 (automatic feature selection!).
Use when: you suspect only a few features actually matter.

**ELASTIC NET:**

$$\text{Loss} = \text{MSE} + \lambda_1 \sum |w_i| + \lambda_2 \sum w_i^2$$

Combines Ridge + Lasso. Best when features are correlated.

$\lambda$ (lambda): regularization strength. Higher = simpler model. Too high = underfitting. Tune via cross-validation.

```chart
{
  "type": "scatter",
  "data": {
    "datasets": [
      {
        "label": "Training Data",
        "data": [{"x":900,"y":150},{"x":1200,"y":200},{"x":1500,"y":250},{"x":1800,"y":303},{"x":2000,"y":330},{"x":2200,"y":370},{"x":2500,"y":410},{"x":2800,"y":440}],
        "backgroundColor": "rgba(99, 102, 241, 0.7)",
        "borderColor": "rgba(99, 102, 241, 1)",
        "pointRadius": 6
      },
      {
        "label": "Best Fit Line (Linear Regression)",
        "data": [{"x":800,"y":140},{"x":1000,"y":165},{"x":1500,"y":230},{"x":2000,"y":305},{"x":2500,"y":385},{"x":3000,"y":460}],
        "borderColor": "rgba(239, 68, 68, 1)",
        "backgroundColor": "transparent",
        "showLine": true,
        "borderWidth": 2,
        "pointRadius": 0,
        "tension": 0
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Linear Regression — Best Fit Line Through House Price Data" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Price ($K)" }, "min": 100, "max": 500 },
      "x": { "title": { "display": true, "text": "Square Footage" }, "min": 700, "max": 3100 }
    }
  }
}
```

---

## 7.2 Logistic Regression — Deep Dive

### Simple Explanation
Picture a school nurse who checks if a kid is sick enough to go home. She looks at a few things: temperature, how many times you coughed, if your eyes are watery. Each clue adds up to a "sickness score." But she does not send you home because your score is 47 -- she needs a simple YES or NO: "sick enough to go home, or stay in class?"

So she has a magic rule: if the score is above a certain line, you go home. Below the line, you stay. Logistic Regression works exactly like this. It adds up all the clues (features) into one score, then squishes that score through a special funnel (called the "sigmoid") that turns any number into a probability between 0 and 1. If the probability is above 0.5, the answer is YES. Below 0.5, the answer is NO.

In short: Linear Regression predicts a number (like "how many cups of lemonade?"). Logistic Regression predicts a yes-or-no answer (like "will this email be spam?") by squashing that number into a probability.

### The Sigmoid Function

**STEP 1:** Compute a linear score (like Linear Regression):

$$z = w_0 + w_1 x_1 + w_2 x_2 + \cdots + w_n x_n$$

**STEP 2:** Squash $z$ into $[0, 1]$ with the sigmoid function.
Think of it like a gate that slowly opens: very negative $z$ leads to nearly 0,
very positive $z$ leads to nearly 1, and $z = 0$ gives exactly 0.5.

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

```
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

```chart
{
  "type": "line",
  "data": {
    "labels": [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6],
    "datasets": [{
      "label": "Sigmoid: P(y=1) = 1/(1+e⁻ᶻ)",
      "data": [0.002,0.007,0.018,0.047,0.119,0.269,0.500,0.731,0.881,0.953,0.982,0.993,0.998],
      "borderColor": "rgba(99, 102, 241, 1)",
      "backgroundColor": "rgba(99, 102, 241, 0.1)",
      "fill": true,
      "tension": 0.4,
      "pointRadius": 2
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Sigmoid Function — Squashes Any Score into a Probability (0 to 1)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "P(y=1)" }, "min": 0, "max": 1 },
      "x": { "title": { "display": true, "text": "z (linear score)" } }
    }
  }
}
```

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

```chart
{
  "type": "line",
  "data": {
    "labels": [0.0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0],
    "datasets": [
      {
        "label": "Precision",
        "data": [0.30,0.45,0.55,0.65,0.72,0.80,0.87,0.92,0.96,0.99,1.00],
        "borderColor": "rgba(99, 102, 241, 1)",
        "fill": false,
        "tension": 0.4,
        "pointRadius": 2
      },
      {
        "label": "Recall",
        "data": [1.00,0.98,0.95,0.90,0.82,0.72,0.58,0.42,0.25,0.10,0.00],
        "borderColor": "rgba(239, 68, 68, 1)",
        "fill": false,
        "tension": 0.4,
        "pointRadius": 2
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Threshold Tuning — Precision vs Recall Trade-off" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Score" }, "min": 0, "max": 1 },
      "x": { "title": { "display": true, "text": "Classification Threshold" } }
    }
  }
}
```

---

## 7.3 Decision Trees — Deep Dive ★★★

### Simple Explanation
Imagine you are playing 20 Questions with your friend. They are thinking of an animal, and you need to figure out what it is. You could start by asking "Is it a mammal?" -- that one question splits ALL the animals in the world into two big groups. Then you ask "Is it bigger than a dog?" -- now each group gets split again. You keep asking smart yes-or-no questions until you narrow it down to one answer: "It's a penguin!"

A Decision Tree works the same way. It looks at your data and asks yes/no questions about the features. "Is the house bigger than 1500 square feet?" "Does it have more than 3 bedrooms?" Each question splits the data into two groups, and it keeps going until each group has a clear answer. The tricky part is figuring out which question to ask FIRST -- you want the question that does the best job of sorting things into neat piles, just like in 20 Questions you want to ask the question that eliminates the most possibilities right away.

### How Splits Are Chosen

```
  At each node, try EVERY possible split on EVERY feature.
  Pick the split that creates the most "pure" child nodes.

  Two measures of purity (covered in detail in Chapter 4):
```

$$G = 1 - \sum p_i^2 \quad \text{(Gini Impurity)}$$

$$H = -\sum p_i \log_2(p_i) \quad \text{(Entropy)}$$

```
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

```chart
{
  "type": "line",
  "data": {
    "labels": [1,2,3,4,5,6,8,10,15,20,30],
    "datasets": [
      {
        "label": "Training Accuracy",
        "data": [65,78,88,93,96,98,99.5,99.9,100,100,100],
        "borderColor": "rgba(99, 102, 241, 1)",
        "fill": false,
        "tension": 0.4,
        "pointRadius": 3
      },
      {
        "label": "Validation Accuracy",
        "data": [64,76,84,88,89,88,85,80,72,65,58],
        "borderColor": "rgba(239, 68, 68, 1)",
        "borderDash": [5,5],
        "fill": false,
        "tension": 0.4,
        "pointRadius": 3
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Decision Tree Depth — Deeper = Better Training, But Validation Peaks Then Falls" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Accuracy (%)" }, "min": 50, "max": 100 },
      "x": { "title": { "display": true, "text": "max_depth" } }
    }
  }
}
```

---

## 7.4 Random Forest — Deep Dive ★★★

### Simple Explanation
Think about the TV show "Who Wants to Be a Millionaire?" where you can "Ask the Audience." If you asked just ONE person in the audience, they might be wrong. But when you ask HUNDREDS of people and go with whatever answer MOST of them picked, the crowd almost always gets it right -- even though each person alone might make mistakes.

Random Forest does the exact same thing. Instead of growing just one decision tree (one person's opinion), it grows 100 or even 500 different trees. Here is the clever part: each tree gets to see a slightly different, shuffled version of the data, so they each develop a slightly different "point of view." When it is time to make a prediction, all the trees vote, and the answer that gets the most votes wins. One confused tree might get it wrong, but it gets outvoted by the many trees that got it right. The wisdom of the crowd beats any single expert!

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

```chart
{
  "type": "line",
  "data": {
    "labels": [1,5,10,20,50,100,200,300,500,1000],
    "datasets": [
      {
        "label": "Random Forest Accuracy",
        "data": [72,80,84,87,89.5,90.8,91.2,91.4,91.5,91.5],
        "borderColor": "rgba(99, 102, 241, 1)",
        "backgroundColor": "rgba(99, 102, 241, 0.1)",
        "fill": true,
        "tension": 0.4,
        "pointRadius": 3
      },
      {
        "label": "Single Decision Tree",
        "data": [72,72,72,72,72,72,72,72,72,72],
        "borderColor": "rgba(239, 68, 68, 1)",
        "borderDash": [5,5],
        "fill": false,
        "tension": 0,
        "pointRadius": 0
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Random Forest — More Trees = Better Accuracy (up to a point)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Accuracy (%)" }, "min": 65, "max": 95 },
      "x": { "title": { "display": true, "text": "Number of Trees (n_estimators)" } }
    }
  }
}
```

**Official Definition:**
> **Random Forest** is an ensemble method that builds multiple decision trees using
> bootstrap sampling and random feature subsets (bagging + feature randomization).
> The final prediction aggregates tree outputs: majority vote (classification) or
> mean (regression). The decorrelation between trees reduces variance significantly.

---

## 7.5 Gradient Boosting — The Competition Champion ★★★

### Simple Explanation
Imagine you are trying to guess how many jellybeans are in a big jar. Your first guess is 500, but the real answer is 800 -- so you were off by 300. Now your friend does not guess the TOTAL number; instead, they try to guess just the MISTAKE you made. Your friend says "I think you were off by about 250." Now you are only off by 50! A third friend looks at the remaining mistake and guesses "off by 40." Now you are only off by 10. Each friend focuses ONLY on fixing the leftover error, and the final answer adds up everyone's contributions: 500 + 250 + 40 = 790, which is really close to 800!

That is exactly how Gradient Boosting works. The first small tree makes a rough guess. The second tree looks at the leftover errors (called "residuals") and tries to predict those. The third tree fixes whatever mistakes remain after the first two. You keep stacking these small corrections on top of each other, and the combined answer keeps getting closer and closer to the truth. It is like a relay team where each runner only has to cover a short distance -- together they cross the whole finish line.

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

### XGBoost vs LightGBM vs CatBoost ★★★

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

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Residual after Tree 1", "Residual after Tree 1+2", "Residual after Tree 1+2+3", "Residual after 10 Trees", "Residual after 50 Trees"],
    "datasets": [{
      "label": "Remaining Error",
      "data": [30, 10, 2, 0.3, 0.01],
      "backgroundColor": ["rgba(239,68,68,0.7)","rgba(234,88,12,0.7)","rgba(200,180,50,0.7)","rgba(99,102,241,0.7)","rgba(34,197,94,0.7)"],
      "borderColor": ["rgba(239,68,68,1)","rgba(234,88,12,1)","rgba(200,180,50,1)","rgba(99,102,241,1)","rgba(34,197,94,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Gradient Boosting — Each Tree Fixes Previous Mistakes (Error Shrinks)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Error" }, "beginAtZero": true }
    }
  }
}
```

---

## 7.6 Support Vector Machines — Deep Dive ★★

### Simple Explanation
Imagine you are on a playground and you need to draw a chalk line on the ground to separate the kickball kids on one side from the jump-rope kids on the other side. You could draw the line anywhere between the two groups, but the SMARTEST place to draw it is right in the middle, as far from both groups as possible. That way, if a few kids wander around a little, they still stay on the correct side.

SVM (Support Vector Machine) draws that "best dividing line." It does not just find ANY line that separates two groups -- it finds the one with the BIGGEST gap (called the "margin") between the line and the closest kids on each side. Those closest kids are the "support vectors" -- they are the ones who matter the most because they define where the line goes.

But what if the kickball kids and jump-rope kids are all mixed up together and you cannot draw a straight line between them? That is where the "kernel trick" comes in. Imagine you could pick up all the kids and lift some of them into the air on a jungle gym. Now, looking from the side, the kickball kids might all be on the ground and the jump-rope kids might all be up high -- and you CAN draw a flat line between them! SVM does something like this mathematically: it lifts the data into a higher dimension where a straight divider works.

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

| Kernel | Formula | When to Use |
|--------|---------|-------------|
| Linear | $K(\mathbf{x}, \mathbf{y}) = \mathbf{x}^\top \mathbf{y}$ | Linearly separable, high-dimensional (text) |
| Polynomial | $K(\mathbf{x}, \mathbf{y}) = (\mathbf{x}^\top \mathbf{y} + c)^d$ | Polynomial relationships, image recognition |
| RBF (Gaussian) | $K(\mathbf{x}, \mathbf{y}) = e^{-\gamma \lVert \mathbf{x} - \mathbf{y} \rVert^2}$ | Most popular default. Works well for non-linear data. Start here! |

```

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

```chart
{
  "type": "line",
  "data": {
    "labels": [0.001, 0.01, 0.1, 1, 10, 100, 1000],
    "datasets": [
      {
        "label": "Training Accuracy",
        "data": [55, 68, 82, 91, 96, 99, 99.5],
        "borderColor": "rgba(99, 102, 241, 1)",
        "fill": false,
        "tension": 0.4,
        "pointRadius": 3
      },
      {
        "label": "Validation Accuracy",
        "data": [54, 67, 81, 90, 88, 78, 65],
        "borderColor": "rgba(239, 68, 68, 1)",
        "borderDash": [5,5],
        "fill": false,
        "tension": 0.4,
        "pointRadius": 3
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "SVM C Parameter — Low C = Underfit, High C = Overfit, Sweet Spot in Middle" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Accuracy (%)" }, "min": 50, "max": 100 },
      "x": { "type": "logarithmic", "title": { "display": true, "text": "C (log scale)" } }
    }
  }
}
```

---

## 7.7 K-Nearest Neighbors — Deep Dive ★

### Simple Explanation
Imagine you just moved to a new school and you do not know anyone. At lunchtime, you sit down and look around at the 5 kids closest to you. Three of them are eating pizza and two are eating salad. "This must be the pizza section!" you think. You are making a decision based on your nearest neighbors.

KNN (K-Nearest Neighbors) works exactly like this. When it sees a new data point it has never met before, it looks at the K closest examples from the training data (K might be 3, 5, or 7 -- you choose). Whatever category most of those neighbors belong to, that is the prediction. If 4 out of 5 nearest neighbors are "cats," the new point is probably a cat too.

The fun thing about KNN is that it does not study ahead of time -- it is the ultimate "I'll figure it out when I get there" algorithm. It stores ALL the training data and only does the hard work when you ask it for an answer. That makes "training" instant, but predictions can be slow because it has to measure the distance to every single stored example every time.

### Distance Metrics

TWO POINTS: $A = (1, 2)$ and $B = (4, 6)$

**Euclidean Distance** (straight-line):

$$d = \sqrt{\sum (x_i - y_i)^2} = \sqrt{(4-1)^2 + (6-2)^2} = \sqrt{9 + 16} = \sqrt{25} = 5$$

**Manhattan Distance** (city blocks):

$$d = \sum |x_i - y_i| = |4-1| + |6-2| = 3 + 4 = 7$$

**Minkowski Distance** (generalizes both):

$$d = \left( \sum |x_i - y_i|^p \right)^{1/p}$$

$p = 1$ gives Manhattan, $p = 2$ gives Euclidean.

```
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

```chart
{
  "type": "line",
  "data": {
    "labels": [1,3,5,7,9,11,13,15,17,19,21],
    "datasets": [{
      "label": "Validation Error",
      "data": [0.28,0.19,0.12,0.10,0.09,0.09,0.10,0.11,0.13,0.15,0.17],
      "borderColor": "rgba(99, 102, 241, 1)",
      "backgroundColor": "rgba(99, 102, 241, 0.1)",
      "fill": true,
      "tension": 0.4,
      "pointRadius": 3
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "KNN — Choosing K: Too Small = Overfit, Too Large = Underfit" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Validation Error" }, "beginAtZero": true, "max": 0.35 },
      "x": { "title": { "display": true, "text": "K (number of neighbors)" } }
    }
  }
}
```

### Weighted KNN

Standard KNN: each of the K neighbors gets equal vote.

Weighted KNN: closer neighbors get MORE influence.

$$\text{weight} = \frac{1}{\text{distance}^2}$$

```

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

## 7.8 Naive Bayes — Deep Dive ★★

### Simple Explanation
Imagine you are a detective trying to figure out who ate the cookies from the cookie jar. You have clues: there are chocolate crumbs on the table, the jar lid is on the floor, and there are tiny footprints. You know from experience that your little brother leaves crumbs 90% of the time, drops lids 80% of the time, and has tiny feet. Your big sister only leaves crumbs 10% of the time, rarely drops lids, and has bigger feet. You multiply all the clues together for each suspect, and whoever has the highest combined score is your best guess. It was probably your little brother!

Naive Bayes works the same way. Given a bunch of evidence (like words in an email), it asks: "What is the probability of seeing all this evidence if it IS spam? And what is the probability if it is NOT spam?" It multiplies together the probability of each individual clue, then picks whichever category gave the higher score.

It is called "naive" because it assumes every clue is independent -- as if the word "free" showing up has nothing to do with the word "money" showing up. In real life, those words obviously go together! But here is the surprising thing: even though that assumption is technically wrong, Naive Bayes still gives really good answers most of the time. It is like a detective who ignores some connections between clues but still catches the right suspect.

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
```

$$P(x \mid \text{class}) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp\!\left(-\frac{(x - \mu)^2}{2\sigma^2}\right)$$

```
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

```chart
{
  "type": "bar",
  "data": {
    "labels": ["free", "money", "click", "meeting", "project", "report"],
    "datasets": [
      {
        "label": "P(word | Spam)",
        "data": [0.90, 0.85, 0.88, 0.05, 0.03, 0.02],
        "backgroundColor": "rgba(239, 68, 68, 0.7)",
        "borderColor": "rgba(239, 68, 68, 1)",
        "borderWidth": 1
      },
      {
        "label": "P(word | Not Spam)",
        "data": [0.05, 0.02, 0.01, 0.60, 0.55, 0.50],
        "backgroundColor": "rgba(34, 197, 94, 0.7)",
        "borderColor": "rgba(34, 197, 94, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Naive Bayes Spam Filter — Word Probabilities by Class" } },
    "scales": {
      "y": { "title": { "display": true, "text": "P(word | class)" }, "beginAtZero": true, "max": 1.0 }
    }
  }
}
```

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

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Naive Bayes", "Logistic Reg", "Decision Tree", "Random Forest", "XGBoost", "SVM (RBF)", "KNN"],
    "datasets": [
      {
        "label": "Training Speed (higher = faster)",
        "data": [98, 90, 85, 70, 55, 20, 99],
        "backgroundColor": "rgba(99, 102, 241, 0.7)",
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 1
      },
      {
        "label": "Prediction Speed (higher = faster)",
        "data": [98, 98, 95, 75, 80, 85, 10],
        "backgroundColor": "rgba(34, 197, 94, 0.7)",
        "borderColor": "rgba(34, 197, 94, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "indexAxis": "y",
    "plugins": { "title": { "display": true, "text": "Algorithm Speed Comparison — Training vs Prediction (higher = faster)" } },
    "scales": {
      "x": { "title": { "display": true, "text": "Speed Score" }, "beginAtZero": true, "max": 100 }
    }
  }
}
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

<table>
  <thead>
    <tr>
      <th>Algorithm</th>
      <th>Speed</th>
      <th>Accuracy</th>
      <th>Memory</th>
      <th>Best For</th>
      <th>Weak Spots</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Linear / Logistic Regression</strong></td>
      <td>5/5 — Very fast</td>
      <td>3/5 — OK</td>
      <td>5/5 — Tiny</td>
      <td>Baseline, linearly separable data</td>
      <td>Non-linear patterns</td>
    </tr>
    <tr>
      <td><strong>Decision Tree</strong></td>
      <td>5/5 — Very fast</td>
      <td>3/5 — OK</td>
      <td>4/5 — Small</td>
      <td>Interpretable, explainable</td>
      <td>Overfits easily, high variance</td>
    </tr>
    <tr>
      <td><strong>Random Forest</strong></td>
      <td>4/5 — Medium</td>
      <td>4/5 — Good</td>
      <td>3/5 — Medium</td>
      <td>General purpose baseline</td>
      <td>Slower prediction than single tree</td>
    </tr>
    <tr>
      <td><strong>XGBoost / LightGBM</strong></td>
      <td>3/5 — Medium</td>
      <td>5/5 — Best</td>
      <td>3/5 — Medium</td>
      <td>Tabular data, competitions</td>
      <td>Many hyperparams to tune</td>
    </tr>
    <tr>
      <td><strong>SVM</strong></td>
      <td>2/5 — Slow</td>
      <td>4/5 — Good</td>
      <td>3/5 — Medium</td>
      <td>Medium datasets, clear margins</td>
      <td>Slow for n &gt; 10K, hard to tune</td>
    </tr>
    <tr>
      <td><strong>KNN</strong></td>
      <td>3/5 — Fast train</td>
      <td>3/5 — OK</td>
      <td>2/5 — Stores all data</td>
      <td>Non-linear, small datasets</td>
      <td>Very slow prediction, needs scaling</td>
    </tr>
    <tr>
      <td><strong>Naive Bayes</strong></td>
      <td>5/5 — Very fast</td>
      <td>3/5 — OK</td>
      <td>5/5 — Tiny</td>
      <td>Text, spam, high-dim data</td>
      <td>Assumes feature independence</td>
    </tr>
  </tbody>
</table>

```chart
{
  "type": "radar",
  "data": {
    "labels": ["Accuracy", "Speed (Training)", "Speed (Prediction)", "Interpretability", "Handles Non-linear"],
    "datasets": [
      {
        "label": "Logistic Regression",
        "data": [60, 95, 98, 90, 20],
        "borderColor": "rgba(99, 102, 241, 1)",
        "backgroundColor": "rgba(99, 102, 241, 0.1)",
        "borderWidth": 2,
        "pointRadius": 3
      },
      {
        "label": "Random Forest",
        "data": [82, 70, 75, 60, 85],
        "borderColor": "rgba(34, 197, 94, 1)",
        "backgroundColor": "rgba(34, 197, 94, 0.1)",
        "borderWidth": 2,
        "pointRadius": 3
      },
      {
        "label": "XGBoost",
        "data": [92, 60, 80, 40, 90],
        "borderColor": "rgba(234, 88, 12, 1)",
        "backgroundColor": "rgba(234, 88, 12, 0.1)",
        "borderWidth": 2,
        "pointRadius": 3
      },
      {
        "label": "KNN",
        "data": [70, 99, 20, 50, 80],
        "borderColor": "rgba(239, 68, 68, 1)",
        "backgroundColor": "rgba(239, 68, 68, 0.1)",
        "borderWidth": 2,
        "pointRadius": 3
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Algorithm Comparison — Each Has Different Strengths" } },
    "scales": {
      "r": { "beginAtZero": true, "max": 100 }
    }
  }
}
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
