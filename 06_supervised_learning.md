# Chapter 6 — Supervised Learning

> "Supervised learning is the workhorse of machine learning."
> — Andrew Ng

---

## What You'll Learn

After reading this chapter, you will be able to:
- Explain the difference between classification and regression with examples
- Distinguish binary, multi-class, and multi-label classification
- Describe how Logistic Regression, KNN, Decision Trees, and SVMs work
- Explain how ensemble methods (Bagging, Boosting, Stacking) improve single models
- Read and interpret feature importance and SHAP values
- Choose the right algorithm for a given problem

---

## Chapter Map

```
  4.1  What is Supervised Learning?
  4.2  Classification vs Regression       — the two problem types
  4.3  Classification in Depth            — binary, multi-class, multi-label
  4.4  Classification Algorithms          — LogReg, KNN, DT, RF, SVM, GBM
  4.5  Decision Tree Splits               — Gini, Entropy, worked example  ★
  4.6  Ensemble Methods                   — Bagging, Boosting, Stacking     ★
  4.7  Feature Importance                 — what the model learned           ★
  4.8  Regression in Depth                — types, algorithms, comparison    ★
  4.9  Class Imbalance                    — the 99% trap and how to fix it   ★
  4.10 Algorithm Comparison               — when to use what
```

---

## 4.1 What is Supervised Learning?

### Simple Explanation
Supervised learning is like learning with a teacher. The teacher shows you many examples
*with the correct answers* and you learn to figure out the pattern.

```
  Training Phase:
  ───────────────────────────────────────────────────────────────────
  Example 1:  [25°C, Sunny]    →  "Wear t-shirt"   ✓ (correct answer)
  Example 2:  [5°C,  Cloudy]   →  "Wear jacket"    ✓
  Example 3:  [15°C, Rainy]    →  "Wear raincoat"  ✓
  Example 4:  [30°C, Sunny]    →  "Wear t-shirt"   ✓
                   │
                   │  Model learns the pattern from (input, answer) pairs
                   ▼
  Prediction Phase:
  ─────────────────────────────────────────────────────────────────
  New input:  [22°C, Sunny]    →  "Wear t-shirt"   ← predicted!
```

**Official Definition:**
> **Supervised Learning** is a type of ML where the algorithm learns from a *labeled* training
> dataset. Each training example is an (input, desired output) pair. The algorithm learns a
> function f: X → Y and is evaluated on its ability to generalize to unseen inputs.

---

## 4.2 Classification vs Regression

```
                      SUPERVISED LEARNING
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
       CLASSIFICATION                    REGRESSION
              │                               │
  Output = discrete category           Output = continuous number
              │                               │
  "What box does this belong to?"      "What number is this?"
              │                               │
  ┌─────────────────────┐            ┌──────────────────────┐
  │ Examples:           │            │ Examples:            │
  │ - Spam / Not Spam   │            │ - House price: $250K  │
  │ - Cat / Dog / Bird  │            │ - Temperature: 23.5°C │
  │ - Benign / Malignant│            │ - Stock price: $142   │
  │ - Positive sentiment│            │ - Age: 34.2 years     │
  └─────────────────────┘            └──────────────────────┘
              │                               │
  Measured by:                       Measured by:
  Accuracy, F1, AUC                  MAE, RMSE, R²
```

---

## 4.3 Classification in Depth

### Binary Classification — Two Classes

```
  Input features → Model → ONE of TWO classes

  ┌──────────────┐         ┌──────────────────────────┐
  │ Email text,  │         │  P(spam) = 0.95           │
  │ sender, links│ ──────► │  P(not spam) = 0.05       │  →  SPAM
  │              │         │                           │
  └──────────────┘         │  Decision threshold = 0.5 │
                           │  0.95 ≥ 0.5 → SPAM ✓      │
                           └──────────────────────────┘

  Adjusting the threshold:
  ─────────────────────────────────────────────────────────────────
  threshold = 0.5  →  balanced (default)
  threshold = 0.3  →  more spam caught (↑ recall, ↓ precision)
  threshold = 0.8  →  only very confident positives flagged (↑ precision, ↓ recall)

  Choose threshold based on what costs more: false alarms or misses.
```

### Multi-class Classification — Three or More Classes

```
  One input can belong to exactly ONE of N classes.

  Model output: raw scores (called **logits** — just numbers showing
  which class the model leans toward, before converting to percentages)
               → softmax → probabilities

  Input: flower measurements
  ┌───────────────────────────────────────────────────────────────┐
  │  Logits:       Setosa=-0.5   Versicolor=1.2   Virginica=3.1  │
  │                     ↓ softmax                                 │
  │  Probabilities: Setosa=2%    Versicolor=18%   Virginica=80%  │
  │                                                 ↑             │
  │  Prediction: Virginica  (80% confidence)                      │
  └───────────────────────────────────────────────────────────────┘
```

$$P(\text{class}_i) = \frac{e^{\text{logit}_i}}{\sum_j e^{\text{logit}_j}}$$

Guarantees: all probabilities positive, sum to 1.0

### Multi-label Classification — Multiple Classes at Once ★

```
  One input can belong to MULTIPLE classes simultaneously.

  ┌───────────────────────────────────────────────────────────────────┐
  │  Example: movie genre tagging                                     │
  │                                                                   │
  │  Input: movie description                                         │
  │  Output: Action=0.92 ✓  Comedy=0.04 ✗  Thriller=0.87 ✓          │
  │                                                                   │
  │  ← this movie is BOTH Action AND Thriller!                        │
  │                                                                   │
  │  Other examples:                                                  │
  │  - Medical diagnosis: patient has diabetes AND hypertension       │
  │  - Image tagging: photo contains cat AND grass AND outdoors       │
  │  - Document tagging: article covers politics AND economics        │
  └───────────────────────────────────────────────────────────────────┘

  KEY DIFFERENCE from multi-class:
  Multi-class:  exactly 1 label   → use Softmax + Categorical Cross-Entropy
  Multi-label:  0 or more labels  → use Sigmoid per class + Binary Cross-Entropy

  Each output neuron is an INDEPENDENT binary classifier!
  Class probabilities do NOT need to sum to 1.
```

### Decision Boundary — What Separates Classes

```
  LINEAR boundary              NON-LINEAR boundary
  (Logistic Regression)        (Neural Net, RBF-SVM, DT)
  ─────────────────────        ────────────────────────────
  Feature 2                    Feature 2
     │ ○ ○ ○ /  ■ ■               │ ○ ○ ○ ╭────╮ ■ ■
     │ ○ ○ /    ■ ■               │ ○ ○ ╭─╯    ╰─╮ ■
     │ ○ /   ■  ■ ■               │ ○ ╭─╯ ■ ■ ■  ╰╮
     │ /  ■ ■   ■ ■               │   ╰────────────╯
     └──────────────              └────────────────────
       Feature 1                    Feature 1

  Simple, may underfit         More flexible, can overfit
```

---

## 4.4 Classification Algorithms

### 1. Logistic Regression ★★★

**Simple explanation:** Takes a weighted sum of features, squashes it through a sigmoid
function to produce a probability between 0 and 1.

$$z = w_0 + w_1 x_1 + w_2 x_2 + \dots + w_n x_n$$

$$\hat{y} = \sigma(z) = \frac{1}{1 + e^{-z}}$$

```
  Example — spam detection:
    z = -3.0 + (0.8 × has_word_FREE)
             + (1.2 × has_word_MONEY)
             + (0.3 × num_links)
             + (-0.5 × is_known_sender)

    email: FREE=1, MONEY=1, links=5, known=0
    z = -3.0 + 0.8 + 1.2 + 1.5 - 0 = 0.5
    ŷ = σ(0.5) = 0.622   →  62% spam probability  →  SPAM

  Learned weights tell you WHICH features matter most:
    MONEY (1.2) > FREE (0.8) > links (0.3) > known (-0.5)
```

**The Sigmoid (S-Curve):**
```
  Output
  1.0  │                    ───────────────
       │                  /
  0.5  │                /   ← threshold (default 0.5)
       │              /
  0.0  │────────────/
       └───────────────────────────── Input (z)
        -10     -5      0      5     10

  Interpretation:
  z >> 0  →  confident class 1  (probability near 1)
  z = 0   →  completely uncertain  (probability = 0.5)
  z << 0  →  confident class 0  (probability near 0)
```

```chart
{
  "type": "line",
  "data": {
    "labels": [-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10],
    "datasets": [{
      "label": "σ(z) = 1 / (1 + e⁻ᶻ)",
      "data": [0.00005,0.0001,0.0003,0.0009,0.0025,0.0067,0.018,0.047,0.119,0.269,0.500,0.731,0.881,0.953,0.982,0.993,0.998,0.999,0.9997,0.9999,0.99995],
      "borderColor": "rgba(99, 102, 241, 1)",
      "backgroundColor": "rgba(99, 102, 241, 0.1)",
      "fill": true,
      "tension": 0.4,
      "pointRadius": 0
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "The Sigmoid Function — Squashes Any Input to (0, 1)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Probability" }, "min": 0, "max": 1 },
      "x": { "title": { "display": true, "text": "z (weighted sum of inputs)" } }
    }
  }
}
```

**Official Definition:**
> **Logistic Regression** is a linear classifier that models the probability of class membership
> using the logistic (sigmoid) function. It finds a linear decision boundary in feature space
> and is trained by maximizing the log-likelihood (minimizing binary cross-entropy loss).

**Strengths / Weaknesses:**
```
  ✓ Fast to train and predict         ✗ Only linear decision boundaries
  ✓ Outputs well-calibrated probs     ✗ Needs feature engineering for
  ✓ Highly interpretable weights        non-linear problems
  ✓ Works well on high-dim text       ✗ Assumes features are independent
```

---

### 2. K-Nearest Neighbors (KNN) ★

**Simple explanation:** "You are judged by the company you keep!"
Classify a new point by majority vote of its K nearest neighbors.

```
  Feature 2
     │                    K=3: who are the 3 nearest?
     │  ○ ○                ○ ○
     │  ○   ○  ○           ○   ○  ← neighbor 1 (class ○)
     │          ★          ← NEW POINT
     │     ●  ●   ○            ●  ← neighbor 2 (class ●)
     │  ●        ●             ●  ← neighbor 3 (class ●)
     └──────────────── Feature 1

  Vote: ○=1, ●=2  →  Predict class ●  (majority wins!)

  K=1: noisy, overfits          K=15: smooth, may underfit
  K=5: usually a good start     K=√n: common rule of thumb
```

**Official Definition:**
> **KNN** is a non-parametric (makes no assumptions about data shape), lazy (stores all
> training data instead of learning a formula) algorithm. At prediction time it finds the K
> training points nearest to the query (by Euclidean or other distance), and returns the
> majority class (classification) or mean value (regression).

**Key properties:**
```
  "Lazy learner" — no training phase, entire dataset is the model
  Prediction cost: O(n × d) per query (slow on large datasets!)
  Solution: KD-trees or Ball trees for approximate fast lookup

  ✓ Simple, no assumptions about data         ✗ Slow at prediction time
  ✓ Works for any decision boundary shape     ✗ Memory-intensive (stores all data)
  ✓ Naturally multi-class                     ✗ Hurt by irrelevant features
  ✓ Easy to update (just add new data)        ✗ Needs feature scaling!
```

---

### 3. Decision Trees ★★★

**Simple explanation:** A game of 20 questions! Each internal node asks a yes/no
question about one feature. Follow the path until you reach a leaf (prediction).

```
                       Is outlook = Sunny?
                      /                    \
                    YES                     NO
                     │                      │
            Is humidity > 70?         Is outlook = Overcast?
             /          \               /              \
           YES            NO          YES               NO
            │              │           │                 │
      "Don't play"    "Play!"     "Play!"          Is wind = Strong?
                                                    /           \
                                                  YES             NO
                                                   │               │
                                            "Don't play"       "Play!"
```

**Official Definition:**
> A **Decision Tree** partitions the feature space recursively using axis-aligned splits.
> Each internal node selects the feature and threshold that best separates the target
> classes (measured by impurity). Leaf nodes hold the predicted class or value.

---

## 4.5 Decision Tree Splits — How the Algorithm Chooses ★

### Simple Explanation
At each node, the tree must decide: "Which question best separates my data?"
It tries every feature and every possible threshold, picks the split that
creates the "purest" child nodes.

### Gini Impurity

$$\text{Gini} = 1 - \sum_i p_i^2$$

where $p_i$ = fraction of class $i$ in the node.

```
  Pure node (all one class):     Gini = 1 - (1² + 0²)    = 0.0
  Mixed 50/50:                   Gini = 1 - (0.5² + 0.5²) = 0.5
  Mixed 70/30:                   Gini = 1 - (0.7² + 0.3²) = 0.42

  LOWER Gini = PURER node = BETTER split
```

### Information Gain (Entropy-based)

$$\text{Entropy} = -\sum_i p_i \times \log_2(p_i)$$

$$\text{Information Gain} = \text{Parent Entropy} - \text{Weighted Avg Child Entropy}$$

```
  Pure node:     Entropy = -(1×log₂1 + 0×log₂0)     = 0.0  bits
  50/50 split:   Entropy = -(0.5×log₂0.5 + 0.5×log₂0.5) = 1.0  bits
  70/30 split:   Entropy = -(0.7×log₂0.7 + 0.3×log₂0.3) = 0.88 bits

  HIGHER info gain = BETTER split
```

```chart
{
  "type": "line",
  "data": {
    "labels": ["0%","10%","20%","30%","40%","50%","60%","70%","80%","90%","100%"],
    "datasets": [
      {
        "label": "Gini Impurity",
        "data": [0.0, 0.18, 0.32, 0.42, 0.48, 0.50, 0.48, 0.42, 0.32, 0.18, 0.0],
        "borderColor": "rgba(99, 102, 241, 1)",
        "backgroundColor": "rgba(99, 102, 241, 0.1)",
        "fill": true,
        "tension": 0.4,
        "pointRadius": 2
      },
      {
        "label": "Entropy (scaled to 0–1)",
        "data": [0.0, 0.47, 0.72, 0.88, 0.97, 1.0, 0.97, 0.88, 0.72, 0.47, 0.0],
        "borderColor": "rgba(234, 88, 12, 1)",
        "backgroundColor": "rgba(234, 88, 12, 0.1)",
        "fill": true,
        "tension": 0.4,
        "pointRadius": 2
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Gini vs Entropy — Both Peak at 50/50 Mix, Zero When Pure" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Impurity Score" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "% of Class 1 in Node" } }
    }
  }
}
```

### Worked Example: Which Feature to Split On?

```
  Dataset: 10 examples, predicting "Play tennis?" (6 Yes, 4 No)
  Considering two possible first splits:

  ┌────────────────────────────────────────────────────────────────┐
  │  OPTION A: Split on Outlook                                    │
  │                                                                │
  │  Parent: [6Y, 4N]  →  Entropy = 0.971                        │
  │                                                                │
  │  Sunny  branch: [2Y, 3N]  Entropy = 0.971                     │
  │  Overcast branch: [4Y, 0N] Entropy = 0.0    ← pure!           │
  │  Rainy  branch: [3Y, 1N]  Entropy = 0.811                     │
  │                                                                │
  │  Weighted avg = (5/10)×0.971 + (4/10)×0 + (4/10)*0.811       │
  │               = 0.693                                          │
  │  Info Gain    = 0.971 − 0.693 = 0.278                         │
  ├────────────────────────────────────────────────────────────────┤
  │  OPTION B: Split on Wind                                       │
  │                                                                │
  │  Weak  branch: [6Y, 2N]  Entropy = 0.811                      │
  │  Strong branch: [3Y, 3N] Entropy = 1.0                        │
  │                                                                │
  │  Weighted avg = (8/10)×0.811 + (6/10)×1.0 = 1.249 ← BUG      │
  │  Info Gain    = 0.971 − weighted = 0.048                       │
  └────────────────────────────────────────────────────────────────┘

  Info Gain(Outlook)=0.278 > Info Gain(Wind)=0.048
  → Choose OUTLOOK as the first split! ✓
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Outlook", "Wind"],
    "datasets": [{
      "label": "Information Gain",
      "data": [0.278, 0.048],
      "backgroundColor": ["rgba(34,197,94,0.8)", "rgba(239,68,68,0.5)"],
      "borderColor": ["rgba(34,197,94,1)", "rgba(239,68,68,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Which Feature to Split First? Outlook Wins (5.8× More Info Gain)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Information Gain (bits)" }, "beginAtZero": true, "max": 0.35 },
      "x": { "title": { "display": true, "text": "Candidate Feature" } }
    }
  }
}
```

**Strengths / Weaknesses:**
```
  ✓ Completely interpretable (can visualize the tree)
  ✓ No feature scaling needed
  ✓ Handles mixed feature types
  ✓ Fast training and prediction
  ✗ Prone to overfitting (deep trees memorize data)
  ✗ Unstable: small data change → very different tree
  ✗ Biased toward features with many unique values
```

---

## 4.6 Ensemble Methods ★★★

### Simple Explanation
One tree is unreliable. Hundreds of trees, each trained differently, voting together
are much more robust. **Ensemble methods combine multiple weak models into one strong one.**

```
  INDIVIDUAL TREE (high variance):     ENSEMBLE (stable, accurate):
  ──────────────────────────────        ───────────────────────────────
  Change 3 training examples →          Change 3 training examples →
  totally different tree!               barely changes the prediction!

  Accuracy: ~75%                        Accuracy: ~92%
```

### Bagging — Parallel Independent Trees

```
  "Bootstrap Aggregating"

  Training Data (N examples)
         │
         │  Create B bootstrap samples
         │  (sample N examples WITH REPLACEMENT)
         ├─────────────────────────────────┐
         │                                 │
  Sample 1 (some dups, some missing) ... Sample B
         │                                 │
      Tree 1                            Tree B
         │                                 │
         └─────────────────────────────────┘
                           │
               AGGREGATE:
               Classification → majority VOTE
               Regression     → AVERAGE predictions

  KEY IDEA: Each tree sees a different "version" of the data,
  so they make different errors. Averaging cancels them out!

  ● Also randomly selects a SUBSET of features at each split
    (reduces correlation between trees!)
```

**Random Forest = Bagging + Random Feature Subsets at each split**

```
  Why random feature selection helps:
  ─────────────────────────────────────────────────────────────
  Without it: all trees would split on the same strong feature
  first → highly correlated trees → averaging doesn't help much

  With it: trees are forced to find different patterns
  → diverse trees → uncorrelated errors → averaging works!

  Standard: try √(total features) at each split for classification
            try total/3 features at each split for regression
```

### Boosting — Sequential Error Correction

```
  Trees built ONE AT A TIME. Each tree focuses on where the
  previous trees were WRONG.

  Round 1: Train tree on original data
           ┌──────┐
           │Tree 1│ → predictions → Errors: examples 3, 7, 12 wrong
           └──────┘
                 │
                 ↓ Increase weight of misclassified examples
  Round 2: Train tree on REWEIGHTED data (hard examples get more attention)
           ┌──────┐
           │Tree 2│ → focuses on examples 3, 7, 12
           └──────┘
                 │
                 ↓ Reweight again
  Round 3: Train tree focusing on new errors
           ┌──────┐
           │Tree 3│
           └──────┘
                 │
  Final: Weighted sum of all tree predictions
         (better trees get higher vote weight)
```

### Bagging vs Boosting — Side by Side

```
┌────────────────────┬──────────────────────┬──────────────────────┐
│ Property           │ BAGGING              │ BOOSTING             │
├────────────────────┼──────────────────────┼──────────────────────┤
│ Trees built        │ In PARALLEL          │ SEQUENTIALLY         │
│ Each tree focuses  │ Random subset        │ Previous errors      │
│ Main benefit       │ Reduces VARIANCE     │ Reduces BIAS         │
│ Best for           │ High-variance models │ Weak models          │
│ Overfitting risk   │ Low                  │ Higher (can overfit) │
│ Speed              │ Fast (parallel)      │ Slower (sequential)  │
│ Example            │ Random Forest        │ XGBoost, LightGBM    │
└────────────────────┴──────────────────────┴──────────────────────┘
```

### Gradient Boosting — The Modern Standard ★★★

```
  Extends boosting: each new tree predicts the GRADIENT of the loss,
  not just which examples were misclassified.

  Loss surface:         Each tree moves predictions
  (high = wrong)        in the direction that REDUCES loss most

  Iteration 1:  prediction = 50  |  true = 100  |  residual = 50
  Iteration 2:  tree predicts residual → adds 30  |  residual = 20
  Iteration 3:  tree predicts residual → adds 15  |  residual = 5
  Iteration 4:  tree adds 4    |  residual = 1
  ...
  Final:        50 + 30 + 15 + 4 + ... ≈ 100  ✓

  Popular implementations:
  ┌────────────┬────────────────────────────────────────────────┐
  │ XGBoost    │ Level-wise growth, regularized, GPU support    │
  │ LightGBM   │ Leaf-wise growth, fastest on large data        │
  │ CatBoost   │ Best native handling of categorical features   │
  └────────────┴────────────────────────────────────────────────┘
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Iter 1", "Iter 2", "Iter 3", "Iter 4", "Iter 5", "Iter 6"],
    "datasets": [
      {
        "label": "Prediction (cumulative)",
        "data": [50, 80, 95, 99, 99.8, 99.95],
        "backgroundColor": "rgba(34, 197, 94, 0.7)",
        "borderColor": "rgba(34, 197, 94, 1)",
        "borderWidth": 1
      },
      {
        "label": "Remaining Residual",
        "data": [50, 20, 5, 1, 0.2, 0.05],
        "backgroundColor": "rgba(239, 68, 68, 0.7)",
        "borderColor": "rgba(239, 68, 68, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Gradient Boosting — Each Tree Shrinks the Residual (Target = 100)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Value" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "Boosting Iteration" } }
    }
  }
}
```

### Stacking — Ensembling Different Model Types

```
  Why use 3 decision trees when you could combine a tree,
  a neural network, AND a linear model?

  LAYER 1 (base learners — trained on training data):
  ┌────────────┐  ┌─────────────┐  ┌────────────────┐
  │Random Forest│  │Neural Network│  │Logistic Regr.  │
  │pred: 0.82  │  │pred: 0.91   │  │pred: 0.75      │
  └────────────┘  └─────────────┘  └────────────────┘
         │               │                 │
         └───────────────┼─────────────────┘
                         ↓
  LAYER 2 (meta-learner — trained on layer 1 predictions):
                  ┌─────────────┐
                  │ Final Model │  →  Final prediction: 0.88
                  │(learns which│
                  │base learners│
                  │to trust)    │
                  └─────────────┘

  Often gives the best results but is complex to implement.
  Commonly used in ML competitions (Kaggle).
```

---

## 4.7 Feature Importance ★

### Simple Explanation
After training a tree-based model, you can ask: "Which features did the model
use the most?" This tells you what's actually driving predictions.

### Tree-Based Feature Importance

```
  How it works: track how much each feature REDUCES impurity
  across all splits in all trees. Average it. Normalize to sum=1.

  Example output (Random Forest, house price prediction):
  ┌─────────────────────────────────────────────────────────────┐
  │  Feature Importance                                         │
  │                                                             │
  │  Square Feet:  ████████████████████  0.42  ← most important!│
  │  Location:     ██████████████        0.28                   │
  │  # Bedrooms:   ████████              0.16                   │
  │  Age:          █████                 0.09                   │
  │  # Bathrooms:  ██                    0.05                   │
  │                                                             │
  │  Interpretation: square footage explains 42% of prediction  │
  │  variation. Location is second most important at 28%.        │
  └─────────────────────────────────────────────────────────────┘

  WARNING: This importance is biased toward high-cardinality features!
  A feature with 1000 unique values looks more important than it is.
  Use PERMUTATION IMPORTANCE or SHAP for more reliable estimates.
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Square Feet", "Location", "# Bedrooms", "Age", "# Bathrooms"],
    "datasets": [{
      "label": "Feature Importance",
      "data": [0.42, 0.28, 0.16, 0.09, 0.05],
      "backgroundColor": ["rgba(99,102,241,0.8)","rgba(99,102,241,0.65)","rgba(99,102,241,0.5)","rgba(99,102,241,0.35)","rgba(99,102,241,0.2)"],
      "borderColor": "rgba(99, 102, 241, 1)",
      "borderWidth": 1
    }]
  },
  "options": {
    "indexAxis": "y",
    "plugins": { "title": { "display": true, "text": "Random Forest Feature Importance — House Price Prediction" } },
    "scales": {
      "x": { "title": { "display": true, "text": "Importance (sums to 1.0)" }, "beginAtZero": true, "max": 0.5 }
    }
  }
}
```

### Permutation Importance (More Reliable)

```
  IDEA: randomly shuffle one feature column and see how much
  the model's accuracy drops. Big drop = important feature.

  Original accuracy:        88%
  Shuffle Square Feet:      61%  → importance = 27%  ← crucial!
  Shuffle Location:         74%  → importance = 14%
  Shuffle # Bedrooms:       82%  → importance = 6%
  Shuffle Age:              86%  → importance = 2%
  Shuffle # Bathrooms:      87%  → importance = 1%

  Why more reliable: tests actual predictive contribution,
  not just how often the tree happened to use the feature.
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Original", "Shuffle Sq Feet", "Shuffle Location", "Shuffle Bedrooms", "Shuffle Age", "Shuffle Bathrooms"],
    "datasets": [{
      "label": "Accuracy After Shuffling (%)",
      "data": [88, 61, 74, 82, 86, 87],
      "backgroundColor": ["rgba(34,197,94,0.7)","rgba(239,68,68,0.8)","rgba(234,88,12,0.7)","rgba(99,102,241,0.6)","rgba(99,102,241,0.4)","rgba(99,102,241,0.3)"],
      "borderColor": ["rgba(34,197,94,1)","rgba(239,68,68,1)","rgba(234,88,12,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Permutation Importance — Bigger Drop = More Important Feature" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Accuracy (%)" }, "min": 50, "max": 95 },
      "x": {}
    }
  }
}
```

### SHAP Values — Per-Prediction Explanations

```
  Feature importance gives one global score per feature.
  SHAP (SHapley Additive exPlanations) explains EACH prediction.

  "Why did the model predict $320K for THIS specific house?"

  Base value (avg prediction):     $250,000
  + Square Feet = 2100 sqft        + $40,000  (large → pushes up)
  + Location = Downtown            + $35,000  (premium area)
  + Age = 25 years                 - $15,000  (older → pushes down)
  + Bedrooms = 4                   + $8,000
  + Bathrooms = 2                  + $2,000
  ─────────────────────────────────────────
  Final prediction:                $320,000  ✓

  SHAP is the gold standard for model explainability.
  Works with any model (not just trees).
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Base Value", "+ Sq Feet", "+ Location", "- Age", "+ Bedrooms", "+ Bathrooms"],
    "datasets": [{
      "label": "SHAP Contribution ($K)",
      "data": [250, 40, 35, -15, 8, 2],
      "backgroundColor": ["rgba(99,102,241,0.5)","rgba(34,197,94,0.7)","rgba(34,197,94,0.7)","rgba(239,68,68,0.7)","rgba(34,197,94,0.6)","rgba(34,197,94,0.5)"],
      "borderColor": ["rgba(99,102,241,1)","rgba(34,197,94,1)","rgba(34,197,94,1)","rgba(239,68,68,1)","rgba(34,197,94,1)","rgba(34,197,94,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "SHAP — Why Did the Model Predict $320K for This House?" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Contribution ($K)" } },
      "x": {}
    }
  }
}
```

---

## 4.8 Regression in Depth ★

### Regression vs Classification — Revisited

```
  CLASSIFICATION:   "Is this tumor malignant?"   → Yes / No
  REGRESSION:       "How large will the tumor be?" → 2.3 cm

  Both use the same algorithms (mostly) — different loss functions!
  Classification → cross-entropy loss
  Regression     → MAE / MSE / RMSE
```

### Types of Regression Problems

Simple: $y = w_1 x_1 + w_0$

Multiple: $y = \sum w_i x_i + w_0$

Polynomial: $y = w_0 + w_1 x + w_2 x^2 + w_3 x^3$

Multivariate: $Y = XW + B$

```
┌──────────────────────────────────────────────────────────────────┐
│ SIMPLE REGRESSION       │ One feature → one output               │
│  y = w₁x₁ + w₀          │ Price = 150 × SqFt + 30,000           │
├─────────────────────────┼───────────────────────────────────────┤
│ MULTIPLE REGRESSION     │ Many features → one output             │
│  y = Σwᵢxᵢ + w₀         │ Price = 150×SqFt + 20K×Beds - 1K×Age  │
├─────────────────────────┼───────────────────────────────────────┤
│ POLYNOMIAL REGRESSION   │ Non-linear (add x², x³ as features)   │
│  y = w₀+w₁x+w₂x²+w₃x³  │ Curve fits non-linear relationships    │
├─────────────────────────┼───────────────────────────────────────┤
│ MULTIVARIATE REGRESSION │ Many features → MANY outputs           │
│  Y = XW + B              │ Predict [price, days_on_market] at once│
└─────────────────────────┴───────────────────────────────────────┘
```

### Regression Algorithms Compared

**Linear Regression (baseline)**

$$\hat{y} = w_0 + w_1 x_1 + \dots + w_n x_n$$

```
  Price
    │                         ★ ← new house (prediction)
    │               ╱ ← learned line
    │         * * ╱
    │     * ╱
    │ * ╱
    └──────────────── SqFt

  Assumes:  LINEAR relationship between X and y
  Use when: data roughly follows a straight-line pattern
```

```chart
{
  "type": "line",
  "data": {
    "labels": [500, 800, 1000, 1200, 1500, 1800, 2000, 2200, 2500, 3000],
    "datasets": [
      {
        "label": "Linear Fit (y = 150x + 30K)",
        "data": [105, 150, 180, 210, 255, 300, 330, 360, 405, 480],
        "borderColor": "rgba(99, 102, 241, 1)",
        "fill": false, "tension": 0, "pointRadius": 0, "borderWidth": 2
      },
      {
        "label": "Actual Prices (scattered)",
        "data": [95, 140, 190, 195, 270, 310, 320, 380, 420, 510],
        "borderColor": "transparent",
        "backgroundColor": "rgba(234, 88, 12, 0.8)",
        "showLine": false, "pointRadius": 5
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Linear Regression — House Price ($K) vs Square Footage" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Price ($K)" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "Square Feet" } }
    }
  }
}
```

**Regularized Linear Regression**

$$\text{Ridge (L2):} \quad \text{MSE} + \lambda \sum w_i^2$$

$$\text{Lasso (L1):} \quad \text{MSE} + \lambda \sum |w_i|$$

$$\text{Elastic Net:} \quad \text{MSE} + \lambda_1 \sum |w_i| + \lambda_2 \sum w_i^2$$

```
  Ridge (L2):  → Shrinks all weights, keeps all features
               → Best when many features all contribute a little

  Lasso (L1):  → Drives some weights to exactly ZERO
               → Built-in feature selection!
               → Best when only a few features truly matter

  Elastic Net: → Hybrid of Ridge + Lasso
               → Best when features are correlated

  As λ increases:  model gets simpler → less overfitting
                   but may underfit if λ too large
```

**Decision Tree Regression**
```
  Same tree structure as classification, but:
  - Leaf nodes output the MEAN of training examples in that region
  - Split criterion: minimize MSE (not Gini/Entropy)

  Feature 2
     │  Region A │  Region B │   Region C
     │  ŷ=$180K  │  ŷ=$310K  │   ŷ=$450K
     │  * * *    │ * * * *   │   * * *
     │───────────┤           ├──────────
     │           │ * * * *   │
     └──────────────────────────────── Feature 1
  (splits partition the space into rectangular regions)
```

**Support Vector Regression (SVR)**
```
  Regular SVM finds a margin between classes.
  SVR finds a "tube" that captures most training points.

  y
  │   * *              *
  │  ─────────────────────  ← upper tube bound
  │     * * * * * * *        ← tube: errors inside don't count
  │  ─────────────────────  ← lower tube bound
  │ *
  └──────────────── x

  Only points OUTSIDE the tube affect the model (support vectors).
  Width of tube (ε) = hyperparameter: wider = simpler model.
  Robust to outliers compared to linear regression.
```

**Tree-Based Regression (Random Forest / Gradient Boosting)**
```
  Same ensemble ideas as classification, but predicting numbers.

  Random Forest Regression:
  → Each tree predicts a number
  → Final prediction = AVERAGE of all tree predictions

  Gradient Boosting Regression:
  → Each tree predicts the RESIDUAL (remaining error)
  → Final prediction = sum of all trees' contributions

  These are the best general-purpose regression algorithms
  for tabular data (beating linear regression on most datasets).
```

### Regression Algorithm Comparison

```
┌─────────────────────┬──────────┬──────────┬────────────┬──────────────────────┐
│ Algorithm           │ Speed    │ Accuracy │ Interpreta │ Best For             │
│                     │ Training │ (typical)│ -ble?      │                      │
├─────────────────────┼──────────┼──────────┼────────────┼──────────────────────┤
│ Linear Regression   │ Fastest  │ Medium   │ YES        │ Baseline, linear     │
│ Ridge / Lasso       │ Fastest  │ Medium   │ YES        │ When overfitting      │
│ Polynomial Regr.    │ Fast     │ Med-High │ Partial    │ Non-linear, small n  │
│ Decision Tree       │ Fast     │ Medium   │ YES        │ Explainability       │
│ Random Forest       │ Medium   │ HIGH     │ Partial    │ General purpose      │
│ Gradient Boosting   │ Medium   │ HIGHEST  │ Partial    │ Tabular data, comps  │
│ SVR                 │ Slow     │ High     │ Partial    │ Small-medium dataset │
│ Neural Network      │ Slow     │ Varies   │ NO         │ Images, text, complex│
└─────────────────────┴──────────┴──────────┴────────────┴──────────────────────┘
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Linear Regr.", "Ridge/Lasso", "Polynomial", "Decision Tree", "Random Forest", "Grad. Boosting", "SVR", "Neural Net"],
    "datasets": [
      {
        "label": "Speed (5=fastest)",
        "data": [5, 5, 4, 4, 3, 3, 2, 1],
        "backgroundColor": "rgba(34, 197, 94, 0.7)",
        "borderColor": "rgba(34, 197, 94, 1)", "borderWidth": 1
      },
      {
        "label": "Accuracy (5=best)",
        "data": [2, 3, 3, 2, 4, 5, 4, 4],
        "backgroundColor": "rgba(99, 102, 241, 0.7)",
        "borderColor": "rgba(99, 102, 241, 1)", "borderWidth": 1
      },
      {
        "label": "Interpretability (5=most)",
        "data": [5, 5, 3, 5, 2, 2, 2, 1],
        "backgroundColor": "rgba(234, 88, 12, 0.7)",
        "borderColor": "rgba(234, 88, 12, 1)", "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Regression Algorithms — Speed vs Accuracy vs Interpretability" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Rating (1-5)" }, "beginAtZero": true, "max": 5 },
      "x": {}
    }
  }
}
```

---

## 4.9 Class Imbalance ★

### The 99% Trap

```
  Dataset: 10,000 transactions
    9,900 = legitimate  (99%)
      100 = fraud       (1%)

  Dumb model: ALWAYS predict "legitimate"
  Accuracy = 9,900 / 10,000 = 99%  ← looks great!
  Fraud detection rate = 0%         ← completely useless!

  This is the class imbalance problem.
  Accuracy is misleading when classes are unequal.
  Use Precision, Recall, F1, or AUC instead.
```

### Detection: Is My Data Imbalanced?

```
  Class distribution:
  ┌────────────────────────────────────────────────────────────┐
  │  Legitimate: ████████████████████████████████████ 99%     │
  │  Fraud:      ▌ 1%                                         │
  └────────────────────────────────────────────────────────────┘

  Mild imbalance (60/40):  usually fine, monitor F1
  Moderate (80/20):        use class weights
  Severe (95/5):           use resampling techniques
  Extreme (99/1):          need specialized approaches
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Balanced (50/50)", "Mild (60/40)", "Moderate (80/20)", "Severe (95/5)", "Extreme (99/1)"],
    "datasets": [
      {
        "label": "Majority Class %",
        "data": [50, 60, 80, 95, 99],
        "backgroundColor": "rgba(34, 197, 94, 0.7)",
        "borderColor": "rgba(34, 197, 94, 1)",
        "borderWidth": 1
      },
      {
        "label": "Minority Class %",
        "data": [50, 40, 20, 5, 1],
        "backgroundColor": "rgba(239, 68, 68, 0.7)",
        "borderColor": "rgba(239, 68, 68, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Class Imbalance Levels — How Skewed Is Your Data?" } },
    "scales": {
      "x": { "stacked": true },
      "y": { "stacked": true, "title": { "display": true, "text": "% of Dataset" }, "max": 100 }
    }
  }
}
```

### Solutions

```
  ┌─────────────────────────────────────────────────────────────────┐
  │  SOLUTION 1: CLASS WEIGHTS                                      │
  │  Tell the model: "missing a fraud costs 99× more than a         │
  │  false alarm."                                                  │
  │                                                                 │
  │  weight_fraud = n_samples / (n_classes × n_fraud)               │
  │              = 10000 / (2 × 100) = 50                          │
  │                                                                 │
  │  Loss for missing fraud is now 50× larger than missing legit.  │
  │  Model is forced to pay attention to the minority class.        │
  ├─────────────────────────────────────────────────────────────────┤
  │  SOLUTION 2: OVERSAMPLING — create more minority examples       │
  │                                                                 │
  │  Random Oversampling: duplicate minority examples (can overfit) │
  │                                                                 │
  │  SMOTE (Synthetic Minority Over-sampling Technique):            │
  │  Generate SYNTHETIC minority examples by interpolating          │
  │  between existing ones.                                         │
  │                                                                 │
  │  Original fraud:    ●  ●           Synthetic fraud:   ●●●●●    │
  │                    ●    ●          (between real ones): ●●●●●●●│
  │                                                                 │
  │  New example = random point on line between two real examples   │
  ├─────────────────────────────────────────────────────────────────┤
  │  SOLUTION 3: UNDERSAMPLING — remove majority examples           │
  │                                                                 │
  │  Random undersampling: delete majority examples randomly        │
  │  Risk: losing useful information!                               │
  │                                                                 │
  │  Better: NearMiss — remove majority examples closest to         │
  │  minority boundary (keep the most informative ones)             │
  ├─────────────────────────────────────────────────────────────────┤
  │  SOLUTION 4: ADJUST THE DECISION THRESHOLD                      │
  │                                                                 │
  │  Default: predict fraud if P(fraud) > 0.5                       │
  │  Better:  predict fraud if P(fraud) > 0.1  (catch more fraud!) │
  │                                                                 │
  │  Use the Precision-Recall curve to find the optimal threshold   │
  │  for your specific cost of false positives vs false negatives.  │
  └─────────────────────────────────────────────────────────────────┘
```

---

## 4.10 Algorithm Comparison

```
┌────────────────────┬──────────┬──────────┬───────┬────────────────────────────┐
│ Algorithm          │ Training │ Accuracy │ Inter │ Ideal Use Case             │
│                    │ Speed    │ Typical  │ pret? │                            │
├────────────────────┼──────────┼──────────┼───────┼────────────────────────────┤
│ Logistic Regr.     │ ★★★★★   │ ★★★      │  ✓✓   │ Binary clf, high-dim text  │
│ KNN                │ ★★★★★   │ ★★★      │  ✓    │ Small data, any shape      │
│ Decision Tree      │ ★★★★★   │ ★★★      │  ✓✓✓  │ Need explainability        │
│ Random Forest      │ ★★★★    │ ★★★★     │  ✓    │ General tabular data       │
│ Gradient Boosting  │ ★★★     │ ★★★★★    │  ✓    │ Tabular competitions       │
│ SVM (linear)       │ ★★★★    │ ★★★★     │  ✓    │ Linear, high-dim data      │
│ SVM (RBF kernel)   │ ★★      │ ★★★★     │  ✗    │ Non-linear, medium data    │
│ Neural Network     │ ★       │ ★★★★★    │  ✗    │ Images, text, audio        │
└────────────────────┴──────────┴──────────┴───────┴────────────────────────────┘

  START HERE for any new problem:
  ──────────────────────────────────────────────────────────────
  1. Establish a naive baseline (always predict most common class)
  2. Try Logistic / Linear Regression (fast, interpretable)
  3. Try Gradient Boosting (XGBoost/LightGBM) — beats most things
  4. Only then consider neural networks if tabular GBM underperforms
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Logistic Regr.", "KNN", "Decision Tree", "Random Forest", "Gradient Boost", "SVM (linear)", "SVM (RBF)", "Neural Network"],
    "datasets": [
      {
        "label": "Training Speed (5=fastest)",
        "data": [5, 5, 5, 4, 3, 4, 2, 1],
        "backgroundColor": "rgba(34, 197, 94, 0.7)",
        "borderColor": "rgba(34, 197, 94, 1)",
        "borderWidth": 1
      },
      {
        "label": "Typical Accuracy (5=best)",
        "data": [3, 3, 3, 4, 5, 4, 4, 5],
        "backgroundColor": "rgba(99, 102, 241, 0.7)",
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Algorithm Comparison — Speed vs Accuracy Trade-off" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Rating (1-5 stars)" }, "beginAtZero": true, "max": 5 },
      "x": {}
    }
  }
}
```

---

## Key Takeaways

```
╔══════════════════════════════════════════════════════════════════╗
║  SUPERVISED LEARNING — COMPLETE CHEAT SHEET                      ║
║  ──────────────────────────────────────────────────────────────  ║
║  Classification = predict a category;  Regression = predict #   ║
║  Multi-label = multiple classes per example (sigmoid per class)  ║
║  Logistic Regression = linear + sigmoid → probability            ║
║  KNN = majority vote from K nearest neighbors                    ║
║  Decision Tree = recursive splits by info gain / Gini            ║
║  Bagging = parallel trees on bootstrap samples (Random Forest)   ║
║  Boosting = sequential trees fixing errors (XGBoost, LightGBM)  ║
║  Stacking = ensembling different model types with a meta-learner ║
║  Feature Importance = what drives the model's predictions        ║
║  SHAP = per-prediction explanation of feature contributions      ║
║  Ridge = L2 penalty, shrinks weights; Lasso = L1, zeros them     ║
║  Class imbalance: use class weights, SMOTE, or threshold tuning  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Review Questions — Test Your Understanding

1. You're building a model to predict whether a customer will churn (yes/no). Is this classification or regression? Binary or multi-class?
2. A movie can be tagged as Action, Comedy, AND Thriller at the same time. Is this multi-class or multi-label? What activation function should the output layer use?
3. Explain the difference between Bagging and Boosting in two sentences.
4. Your Random Forest says "Square Feet" is the most important feature. But you suspect this is biased because it has many unique values. What more reliable method could you use?
5. When would you choose KNN over Logistic Regression? When would you NOT use KNN?

<details>
<summary>Answers</summary>

1. Classification (discrete output: yes/no). Binary classification (only two classes).
2. Multi-label — one input can have multiple labels simultaneously. Use Sigmoid per output (not Softmax), because each label is an independent binary decision.
3. Bagging trains multiple models independently on random subsets, then averages them (reduces variance). Boosting trains models sequentially, each focusing on the previous model's mistakes (reduces bias).
4. Permutation Importance — shuffle the feature column and measure how much accuracy drops. Or SHAP values for per-prediction explanations.
5. Use KNN when: decision boundaries are complex/non-linear, dataset is small, you want no training phase. Avoid KNN when: dataset is very large (prediction is slow O(n)), many irrelevant features exist (distance becomes meaningless), or features aren't scaled.
</details>

---

**Previous:** [Chapter 5 — Data Preprocessing](05_data_preprocessing.md)
**Next:** [Chapter 7 — Unsupervised Learning](07_unsupervised_learning.md)
