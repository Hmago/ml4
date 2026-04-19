# Chapter 15 — Interview Questions: Google, Amazon & OpenAI

> Covering Data Science & AI Engineer positions at the world's top AI companies.

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  HOW TO USE THIS CHAPTER                                         │
  │                                                                  │
  │  Each question has THREE layers:                                 │
  │  1. Simple Answer  — explain it to a 10-year-old                 │
  │  2. Official Definition — precise technical language             │
  │  3. Full Answer — what to actually say in an interview           │
  │                                                                  │
  │  Difficulty:  ★ = easy   ★★ = medium   ★★★ = hard               │
  │  Companies:   [G] = Google  [A] = Amazon  [O] = OpenAI           │
  │               [All] = asked everywhere                           │
  └──────────────────────────────────────────────────────────────────┘
```

---

## Study Strategy

```
  ┌─────────────────────────────────────────────────────────────────┐
  │  HOW TO PREPARE EFFECTIVELY                                      │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  WEEK 1: Foundations (Q1-Q15)                                    │
  │  Focus on ML fundamentals. These come up in EVERY interview.    │
  │  Know overfitting, bias-variance, gradient descent cold.        │
  │                                                                  │
  │  WEEK 2: Statistics + Deep Learning (Q16-Q35)                    │
  │  Probability questions are common at Google.                     │
  │  Deep learning questions are common at all AI companies.        │
  │                                                                  │
  │  WEEK 3: Data + System Design (Q36-Q48)                          │
  │  System design is crucial for senior roles.                     │
  │  Practice explaining your approach out loud.                    │
  │                                                                  │
  │  WEEK 4: Company-Specific (Q49-Q63)                              │
  │  Tailor your prep to target companies.                          │
  │  Review their recent papers and products.                       │
  │                                                                  │
  │  TIPS:                                                           │
  │  - Say the Simple Answer first, then go deeper                  │
  │  - Draw diagrams on the whiteboard when possible                │
  │  - It's OK to say "I don't know" -- then reason through it     │
  │  - Relate answers to your own project experience                │
  └─────────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

| Part | Topic | Questions |
|------|-------|-----------|
| 1 | ML Fundamentals | Q1 – Q15 |
| 2 | Statistics & Probability | Q16 – Q25 |
| 3 | Deep Learning | Q26 – Q35 |
| 4 | Data, Features & Evaluation | Q36 – Q42 |
| 5 | ML System Design | Q43 – Q48 |
| 6 | Google-Specific | Q49 – Q53 |
| 7 | Amazon-Specific | Q54 – Q58 |
| 8 | OpenAI-Specific | Q59 – Q63 |

---

# PART 1 — ML Fundamentals

---

### Q1. What is overfitting and underfitting? How do you fix them? ★★★
*[All] | ★*

**Simple Answer:**
Imagine you're studying for a test. If you memorize the answer sheet word for word
instead of understanding the concept, you'll fail any new questions — that's overfitting.
If you barely studied at all, you'll fail both practice and real tests — that's underfitting.

```
  UNDERFITTING              JUST RIGHT               OVERFITTING
  ──────────────            ───────────              ───────────────
  Train acc: 60%            Train acc: 90%           Train acc: 99%
  Test  acc: 58%            Test  acc: 88% ✓         Test  acc: 62%

  Model too simple          Model generalizes        Model memorized
  Missing real pattern      the real pattern         training noise
```

**Official Definition:**
> **Overfitting** occurs when a model learns the training data too well, including noise
> and random fluctuations, resulting in poor generalization to new data.
> **Underfitting** occurs when a model is too simple to capture the underlying pattern,
> performing poorly on both training and test data.

**Interview Answer:**
- Detect overfitting: large gap between train and validation accuracy
- Detect underfitting: both train and validation accuracy are low
- Fix overfitting: more data, regularization (L1/L2), dropout, early stopping, simpler model
- Fix underfitting: more complex model, more features, more training, less regularization

---

### Q2. Explain the bias-variance tradeoff. ★★★
*[All] | ★★*

**Simple Answer:**
Imagine throwing darts at a target. Bias = your aim is off in one direction (always
hitting left of center). Variance = your throws are all over the place (sometimes
left, sometimes right, sometimes top). A great dart player has low bias AND low variance.
But in ML, making a model less biased often makes it more variable, and vice versa.

```
  HIGH BIAS,              LOW BIAS,               LOW BIAS,
  LOW VARIANCE            HIGH VARIANCE           LOW VARIANCE
  ─────────────           ─────────────           ─────────────
      target                  target                  target
    ┌───────┐               ┌───────┐               ┌───────┐
    │       │               │  ×  × │               │       │
    │       │               │×      │               │   ×   │
    │  × ×  │               │    ×  │               │   ×   │
    │  × ×  │               │  ×    │               │   ×   │
    │       │               │×   ×  │               │       │
    └───────┘               └───────┘               └───────┘
  Consistently            All over              Consistently
  wrong (simple model)    the place             centered (GOAL!)
```

**Official Definition:**
> **Bias** is the error from incorrect assumptions in the learning algorithm (model too simple).
> **Variance** is the error from sensitivity to small fluctuations in training data (model too complex).
> **Bias-Variance Tradeoff**: $\text{Total Error} = \text{Bias}^2 + \text{Variance} + \text{Irreducible Noise}$.
> Reducing one typically increases the other.

**Interview Answer:**
- High bias → underfitting → fix with more complex model
- High variance → overfitting → fix with regularization, more data, ensemble methods
- The sweet spot is minimizing total error, not just one component
- Bagging reduces variance; Boosting reduces bias

---

### Q3. Explain gradient descent and its variants. ★★★
*[All] | ★★*

**Simple Answer:**
Imagine you're lost in a hilly fog. You want to find the lowest valley. Since you can't
see far, you just always take one step in the downhill direction. That's gradient descent!
The question is: how big should each step be, and how much of the hill should you
look at before deciding which direction is "downhill"?

```
  BATCH GRADIENT DESCENT   STOCHASTIC (SGD)      MINI-BATCH GD
  ──────────────────────   ────────────────      ─────────────────
  Uses ALL data per step   Uses ONE example      Uses small batches
                           per step              (32, 64, 128...)

  Loss                     Loss                  Loss
   │────────────           │* * * * *             │ *
   │                       │  * * *  *            │  **
   │                       │      * *             │    ***
   └──── steps             └───── steps          └──── steps

  Very smooth              Very noisy            Balance of both
  but very slow!           but fast per step     ← used in practice
```

**Official Definition:**
> **Gradient Descent** is a first-order iterative optimization algorithm that minimizes
> a function by repeatedly moving in the direction of the steepest descent (negative gradient).
> Update rule: $\theta = \theta - \alpha \times \nabla L(\theta)$, where $\alpha$ is the learning rate and $\nabla L$ is the loss gradient.

**Interview Answer — 3 Variants:**
```
  Batch GD:      Use all N training examples to compute one gradient update
                 Pro: Stable, smooth convergence
                 Con: Very slow; can't fit huge datasets in memory

  Stochastic GD: Use 1 example per update
                 Pro: Very fast; can escape local minima (noisy!)
                 Con: Noisy loss curve; never fully converges

  Mini-Batch GD: Use B examples (batch size) per update  ← STANDARD
                 Pro: Efficient GPU use; stable; vectorizable
                 Con: Needs to tune batch size
                 Common sizes: 32, 64, 128, 256
```

---

### Q4. What is regularization? Compare L1 vs L2. ★★★
*[All] | ★★*

**Simple Answer:**
Regularization is like telling your model: "You can be as complicated as you want,
but every extra bit of complexity costs you penalty points." This stops the model
from getting TOO complicated (overfitting). L1 and L2 are two ways to measure "how
complicated" you are.

$$\text{Total Loss} = \underbrace{\text{How Wrong You Are}}_{\text{Data Loss}} + \underbrace{\lambda \times \text{How Complicated You Are}}_{\text{Regularization Penalty}}$$

$$\text{L1 (Lasso): penalty} = \sum |w_i| \quad \to \text{drives some weights to ZERO}$$

$$\text{L2 (Ridge): penalty} = \sum w_i^2 \quad \to \text{shrinks all weights, rarely to zero}$$

**Official Definition:**
> **Regularization** modifies the learning objective to discourage model complexity,
> reducing overfitting. **L1 (Lasso)** adds the sum of absolute weight values as a penalty,
> producing sparse models. **L2 (Ridge)** adds the sum of squared weight values, producing
> smooth, small-magnitude weights. λ controls regularization strength.

**Interview Answer — Key Differences:**
```
  ┌─────────────────────┬──────────────────────┬───────────────────────┐
  │                     │ L1 (Lasso)           │ L2 (Ridge)            │
  ├─────────────────────┼──────────────────────┼───────────────────────┤
  │ Penalty             │ Σ|wᵢ|                │ Σwᵢ²                  │
  │ Effect on weights   │ Exact zeros (sparse) │ Small but nonzero     │
  │ Feature selection   │ YES (built in!)      │ No                    │
  │ Best when           │ Many useless features│ All features matter   │
  │ Geometry            │ Diamond constraint   │ Circle constraint     │
  └─────────────────────┴──────────────────────┴───────────────────────┘

  Elastic Net = L1 + L2 combined → best of both worlds
```

---

### Q5. What is cross-validation? Why is it important?
*[All] | ★*

**Simple Answer:**
Imagine before your big math exam, you take 5 practice tests instead of just one.
Each practice test uses different questions. Then you average your scores. That's more
reliable than preparing for just one practice test — what if that one was unusually easy
or hard? Cross-validation is the same idea for measuring how good your model really is.

```
  5-FOLD CROSS-VALIDATION:
  ─────────────────────────────────────────────────────────────────
  Full data:  [1][2][3][4][5][6][7][8][9][10]

  Fold 1:  TEST=[1,2]    TRAIN=[3,4,5,6,7,8,9,10]  → score=88%
  Fold 2:  TEST=[3,4]    TRAIN=[1,2,5,6,7,8,9,10]  → score=91%
  Fold 3:  TEST=[5,6]    TRAIN=[1,2,3,4,7,8,9,10]  → score=87%
  Fold 4:  TEST=[7,8]    TRAIN=[1,2,3,4,5,6,9,10]  → score=90%
  Fold 5:  TEST=[9,10]   TRAIN=[1,2,3,4,5,6,7,8]   → score=89%

  Final Score = (88+91+87+90+89)/5 = 89% ± 1.4%  ← reliable estimate!
```

**Official Definition:**
> **K-Fold Cross-Validation** is a model validation technique that partitions data into K
> equal subsets (folds). The model trains on K-1 folds and validates on the remaining one,
> repeated K times. Performance is averaged across all K trials, providing a low-variance
> estimate of generalization performance.

**Interview Answer:**
- Use when: dataset is small, need reliable performance estimate
- k=5 or k=10 are standard choices
- Stratified K-Fold: preserves class ratios in each fold (use for classification)
- Leave-One-Out (LOO): K=N, computationally expensive, used for tiny datasets
- Time-series data: use TimeSeriesSplit (never shuffle time data!)

---

### Q6. Explain the difference between bagging and boosting. ★★★
*[All] | ★★*

**Simple Answer:**
Bagging is like a classroom where every student takes a different version of the exam
(drawn randomly), studies independently, and you average their scores. Boosting is like
a classroom where the second student studies *specifically the questions the first student
got wrong*, the third studies what the second got wrong, and so on. Each method makes
a team of learners smarter in a different way.

```
  BAGGING                              BOOSTING
  ──────────────────────────────       ───────────────────────────────────
  Trees built in PARALLEL              Trees built SEQUENTIALLY

  Bootstrap Sample 1 → Tree 1         Tree 1 → finds errors
  Bootstrap Sample 2 → Tree 2         Tree 2 → fixes Tree 1's errors
  Bootstrap Sample 3 → Tree 3         Tree 3 → fixes Tree 2's errors
         ↓                                    ↓
    VOTE / AVERAGE                     WEIGHTED SUM

  Reduces VARIANCE                     Reduces BIAS
  Less overfitting risk                Can overfit if too many trees
  Runs in parallel (fast)              Sequential (slower)
  Example: Random Forest               Example: XGBoost, LightGBM
```

**Official Definition:**
> **Bagging** (Bootstrap Aggregating) trains multiple models on random subsets of training data
> (with replacement) in parallel and aggregates their predictions, reducing variance.
> **Boosting** trains models sequentially where each model corrects the errors of the previous,
> reducing bias. Both are ensemble methods combining weak learners into a strong learner.

---

### Q7. How does Random Forest work, and why is it better than a single Decision Tree? ★★★
*[All] | ★★*

**Simple Answer:**
One decision tree is like asking one friend for advice. They might be biased or wrong.
A Random Forest is like asking 500 friends — each one looked at a different piece of
information, and you take the majority vote. No single friend can ruin the result!

```
  Single Decision Tree:          Random Forest:
  ──────────────────────         ───────────────────────────────────
  Train on ALL data              Train each tree on a random
  Uses ALL features              BOOTSTRAP sample (with replacement)

  Accurate on training data      At each split, consider only a
  BUT very sensitive to noise    RANDOM SUBSET of features

  Change 5 training examples     Result: 500 diverse, uncorrelated
  → completely different tree!   trees → majority vote

  Variance: HIGH                 Variance: LOW
  Accuracy: ~75%                 Accuracy: ~92%
```

**Official Definition:**
> **Random Forest** is an ensemble learning method that builds multiple decision trees using
> bootstrap sampling of data and random feature subsets at each split. This double
> randomization decorrelates the trees, so averaging their predictions substantially reduces
> variance compared to a single tree.

**Interview Answer — Key Points:**
- Why random feature subsets? Prevents all trees from always splitting on the same dominant feature → decorrelates trees → averaging works better
- Out-of-Bag (OOB) error: for each tree, ~37% of data is NOT in its bootstrap sample → use it as free validation!
- Feature importance: how much each feature reduces impurity across all trees

---

### Q8. Explain how XGBoost/Gradient Boosting works. Why is it so powerful? ★★★
*[G][A] | ★★★*

**Simple Answer:**
Imagine you're trying to hit a bullseye but keep missing. With gradient boosting, each
new "throw" specifically tries to correct where the last one missed. After 100 throws,
you've covered all your blind spots and become extremely accurate.

```
  Real answer: 100

  Round 1: Simple tree predicts 70  →  Residual error = 30
  Round 2: Tree learns  error → +20  →  Residual error = 10
  Round 3: Tree learns  error → +8   →  Residual error = 2
  Round 4: Tree learns  error → +1.5 →  Residual error = 0.5
  ...
  Final prediction: 70 + 20 + 8 + 1.5 + ... ≈ 100 ✓

  Each tree = a small "correction" to the current ensemble
```

**Official Definition:**
> **Gradient Boosting** constructs an additive model by fitting a sequence of weak learners
> (usually shallow trees) to the negative gradient of the loss function (residuals). Each
> tree corrects the errors of the combined ensemble so far. XGBoost adds regularization,
> second-order gradients, and system optimizations for speed.

**Interview Answer — Why XGBoost Wins on Tabular Data:**
```
  1. Regularization: L1 and L2 penalty built in → less overfitting
  2. Second-order gradients: uses curvature (not just slope) → better convergence
  3. Tree pruning: prunes splits that don't improve loss → cleaner trees
  4. Handles missing values natively → no imputation needed
  5. Parallel feature evaluation → fast despite sequential tree building
  6. GPU support → scales to large data
```

---

### Q9. What is the difference between a parametric and non-parametric model?
*[G][O] | ★★*

**Simple Answer:**
A parametric model is like a recipe with a fixed set of ingredients — no matter how many
people you cook for, you only adjust the amounts (parameters), but the recipe structure
stays the same. A non-parametric model is like a chef who changes the entire approach
based on the specific guests — the model complexity GROWS with the data.

**Official Definition:**
> A **parametric model** assumes a fixed functional form for the hypothesis, with a finite
> number of parameters that fully define the model (e.g., linear regression has parameters
> w₀, w₁, ..., wₙ). A **non-parametric model** makes no fixed assumptions about the function
> form; complexity can grow with the data (e.g., KNN stores all training data; kernel SVM
> has one support vector per training point in the extreme case).

```
  ┌────────────────────┬───────────────────┬────────────────────────┐
  │                    │ Parametric        │ Non-Parametric         │
  ├────────────────────┼───────────────────┼────────────────────────┤
  │ # of parameters    │ Fixed             │ Grows with data        │
  │ Training data after│ Can discard       │ Must keep!             │
  │ training           │ (stored in params)│ (e.g., KNN needs all)  │
  │ Examples           │ Linear Reg, NN    │ KNN, kernel SVM, DT    │
  │ Assumption         │ Strong functional │ Minimal                │
  │                    │ form assumed      │                        │
  │ Data needed        │ Works with less   │ Needs more data        │
  └────────────────────┴───────────────────┴────────────────────────┘
```

---

### Q10. What is the difference between a generative and discriminative model?
*[G][O] | ★★★*

**Simple Answer:**
Imagine two classmates trying to recognize a cat vs dog photo.
The discriminative student says: "I just need to find the line between cats and dogs —
I don't care about understanding what a cat or dog really is."
The generative student says: "I'll study what cats look like in detail AND what dogs
look like in detail. Then for a new photo, I'll see which type it resembles more."

```
  DISCRIMINATIVE MODEL                GENERATIVE MODEL
  ─────────────────────────────       ────────────────────────────────────
  Learns:  P(Y | X)                   Learns: P(X | Y) and P(Y)
           "Given features X,                 "What does each class
           what class is it?"                  look like?"

  Focus:   The decision boundary      Focus: The entire data distribution

  Output:  Direct class prediction    Output: Can classify AND generate
           (more accurate for clf)    new examples of each class

  Examples: Logistic Regression       Examples: Naive Bayes, GMM,
            SVM, Decision Trees               VAEs, GANs, LLMs
            Neural Nets (mostly)
```

**Official Definition:**
> A **discriminative model** learns the conditional probability P(Y|X) directly — the
> decision boundary between classes. A **generative model** learns the joint probability
> P(X,Y) = P(X|Y)P(Y) — a model of how each class generates data. Discriminative models
> are typically more accurate for classification; generative models can also create new data.

---

### Q11. What is transfer learning and when would you use it?
*[All] | ★★*

**Simple Answer:**
Imagine you learned to ride a bike. When you try a motorcycle, you don't start from zero —
you transfer your balance and steering skills. You just need to learn the new throttle and
brakes. Transfer learning works the same way: a model trained on one big task shares its
knowledge with a new, related task.

```
  WITHOUT TRANSFER LEARNING:             WITH TRANSFER LEARNING:
  ──────────────────────────             ──────────────────────────────
  Task: Classify rare disease X-rays     Task: Classify rare disease X-rays
  Training data: 500 X-ray images        Training data: 500 X-ray images (same!)
  Model: Train from scratch              Pre-trained model: ImageNet (1.2M images)
  Result: Model struggles (not enough    Step 1: Load pre-trained weights
          data for good features!)       Step 2: Replace final layer
                                         Step 3: Fine-tune on your 500 images
                                         Result: Excellent accuracy!  ✓

  Pre-trained model already knows:
  edges → shapes → textures → objects → medical features
```

**Official Definition:**
> **Transfer Learning** is a technique where a model trained on a source task is reused as
> the starting point for a model on a related target task. The hypothesis is that features
> learned for the source task are useful for the target, allowing effective training with
> fewer labeled examples.

**Interview Answer — When to use:**
- You have limited labeled data for your task
- A related large dataset exists (ImageNet for images, large text corpora for NLP)
- Two strategies: **Feature extraction** (freeze pre-trained layers, only train new head) vs **Fine-tuning** (update all layers with a small learning rate)

---

### Q12. What is the difference between precision, recall, and F1-score? ★★★
*[All] | ★*

**Simple Answer:**
Imagine you're a net fisherman. You want to catch tuna but not dolphins.
- Precision = of all fish you caught, what fraction were tuna? (avoiding dolphin bycatch)
- Recall = of all tuna in the sea, what fraction did you catch? (not missing tuna)
- F1 = a single number that balances both

**Official Definition:**
> **Precision** = TP / (TP + FP) — of all predicted positives, the fraction that are true.
> **Recall** (Sensitivity) = TP / (TP + FN) — of all actual positives, the fraction found.
> **F1-Score** = 2 × (Precision × Recall) / (Precision + Recall) — harmonic mean of both.

```
  CONFUSION MATRIX:
  ─────────────────────────────────────────────────────────────────
                    PREDICTED POSITIVE    PREDICTED NEGATIVE
  ACTUAL POSITIVE        TP                    FN
  ACTUAL NEGATIVE        FP                    TN

  TP = True Positive   FP = False Positive (Type I Error)
  TN = True Negative   FN = False Negative (Type II Error)

  WHEN PRECISION MATTERS:    WHEN RECALL MATTERS:
  ── Spam filter:             ── Cancer screening:
     Marking real mail           Missing a cancer is
     as spam is very bad         far worse than a false alarm
     → Maximize precision        → Maximize recall

  F1 balances both — use when false positives AND false negatives
  both matter (most real-world problems).
```

---

### Q13. What is ROC-AUC and when do you use it? ★★★
*[All] | ★★*

**Simple Answer:**
Imagine trying every possible "strictness level" for a spam filter — from "mark everything
as spam" to "mark nothing as spam." At each level, you record how many real spams you
caught vs how many real emails you accidentally blocked. The ROC curve plots all these
points. AUC is the area under that curve — bigger is better!

```
  ROC CURVE:
  ──────────────────────────────────────────────────────
  True Positive Rate
  (Recall)
  1.0│              ╭─────────────── Perfect model (AUC=1.0)
     │          ╭───╯
     │      ╭───╯              ← Our model (AUC=0.92 = excellent)
  0.5│  ╭───╯
     │ /               ←── Random model (AUC=0.5, diagonal line)
  0.0└────────────────────────────────────────
     0.0        0.5         1.0
                False Positive Rate

  AUC interpretation:
  1.0 = Perfect      0.9 = Excellent
  0.8 = Good         0.7 = Fair
  0.5 = Coin flip    < 0.5 = Worse than random
```

**Official Definition:**
> The **ROC curve** (Receiver Operating Characteristic) plots the True Positive Rate vs False
> Positive Rate at every possible classification threshold. **AUC** (Area Under the Curve)
> measures overall discrimination ability; AUC=1 means perfect separation of classes.

**Interview Answer — AUC vs F1:**
- Use AUC: comparing models regardless of threshold; imbalanced classes; evaluating ranking quality
- Use F1: when you need a single metric at a specific operating threshold
- AUC is threshold-independent; F1 is threshold-dependent

---

### Q14. What is feature engineering? Give examples. ★★
*[All] | ★*

**Simple Answer:**
Raw data is often like crude oil — not directly useful. Feature engineering refines it.
You take raw facts and create new ones that are more useful for your model.

```
  RAW DATA                          ENGINEERED FEATURES
  ─────────────────────────────     ──────────────────────────────────
  Date: 2024-01-15                  Year=2024, Month=1, DayOfWeek=Mon
                                    IsWeekend=False, Quarter=1

  Latitude: 40.7, Longitude: -74   DistanceToNearestSchool=1.2km
                                    IsInCityCenter=True

  BirthYear: 1990                   Age=34, AgeGroup="Young Adult"
  CurrentYear: 2024

  Text: "I love this product!"      SentimentScore=0.92
                                    HasExclamation=True, WordCount=5

  Price: $5000 (right-skewed)       LogPrice=8.52 (normalized!)
```

**Official Definition:**
> **Feature Engineering** is the process of using domain knowledge to transform raw data
> into representations (features) that better capture the underlying patterns relevant to
> the learning task, often improving model performance beyond what raw features allow.

---

### Q15. What is the difference between correlation and causation?
*[All] | ★*

**Simple Answer:**
When ice cream sales go up, so do drownings. Does ice cream cause drownings? Of course not!
Both go up in summer because of the heat. Correlation = two things happen together.
Causation = one thing actually CAUSES the other. ML models find correlations, not causes.

**Official Definition:**
> **Correlation** measures the statistical association between two variables. **Causation**
> means one variable directly causes changes in another. Correlation does not imply causation —
> both may be driven by a third variable (confounding variable), or the relationship may be
> spurious (coincidental).

```
  SPURIOUS CORRELATIONS (real examples that don't imply cause):
  ───────────────────────────────────────────────────────────────────
  Nicolas Cage movies per year ↑ → Drowning deaths ↑  (coincidence!)
  Per capita cheese consumption ↑ → Deaths by bedsheet tangling ↑

  HOW TO ESTABLISH CAUSATION:
  ───────────────────────────────────────────────────────────────────
  1. Randomized Controlled Trial (RCT) / A/B test — gold standard
  2. Natural experiments (accidental random assignment)
  3. Causal inference methods (IV, DiD, regression discontinuity)

  WHY IT MATTERS IN ML:
  ───────────────────────────────────────────────────────────────────
  A model that predicts ice cream sales to prevent drownings would
  be a disaster. Always ask: "Is this feature causal or just correlated?"
  Causal features generalize better under distribution shift.
```

---

# PART 2 — Statistics & Probability

---

### Q16. What is a p-value? What does "statistically significant" mean?
*[All] | ★★*

**Simple Answer:**
Imagine you flip a coin 100 times and get 60 heads. Could that happen just by luck,
even if the coin is fair? A p-value tells you: "If the coin WAS fair, how likely is
it that you'd see 60+ heads just by random chance?" Small p-value = "This is so
unlikely to happen by chance, maybe the coin IS biased!"

**Official Definition:**
> A **p-value** is the probability of observing results as extreme as, or more extreme than,
> the observed data, assuming the null hypothesis is true. A result is called **statistically
> significant** when the p-value is below a pre-specified significance level (α, typically 0.05),
> meaning we reject the null hypothesis.

```
  NULL HYPOTHESIS (H₀): "The new drug has no effect." (coin is fair)
  ALT  HYPOTHESIS (H₁): "The drug does have an effect."

  p-value = 0.03  → "If drug had no effect, we'd see this result
                     only 3% of the time by chance."
                     → Reject H₀ (evidence of effect)  p < 0.05 ✓

  p-value = 0.30  → "We'd see this 30% of the time by chance."
                     → Fail to reject H₀ (no strong evidence)

  COMMON MISCONCEPTIONS:
  ─────────────────────────────────────────────────────────────────
  ✗ "p=0.03 means there's a 3% chance the null hypothesis is true"
  ✓ "p=0.03 means the data is 3% likely GIVEN the null is true"

  ✗ "p < 0.05 means the effect is large"
  ✓ "p < 0.05 means the effect is unlikely due to chance alone"
    (with huge samples, tiny trivial effects can be significant!)
```

---

### Q17. Explain A/B testing. How do you design one?
*[G][A] | ★★*

**Simple Answer:**
Amazon wants to test a new "Buy Now" button color. Instead of guessing, they show
the old button to half their users (control group) and the new button to the other
half (treatment group) — at the same time, randomly. After enough time, they compare
click rates. That's A/B testing!

**Official Definition:**
> **A/B testing** (controlled experiment) is a method of comparing two versions (A=control,
> B=treatment) by randomly assigning users to each and measuring the difference in a key
> metric. Statistical hypothesis testing determines whether any observed difference is
> significant or due to chance.

**Interview Answer — Full Design:**
```
  STEP 1: Define hypothesis
    H₀: New button has no effect on click-through rate
    H₁: New button changes click-through rate

  STEP 2: Choose metric
    Primary metric: click-through rate
    Guardrail metrics: page load time, conversion rate (check for harm!)

  STEP 3: Calculate sample size
    Use power analysis: $n = \frac{2\sigma^2 (z_\alpha + z_\beta)^2}{\delta^2}$
    Where: σ = baseline variance, δ = minimum detectable effect,
           z_α = 1.96 (α=0.05), z_β = 0.84 (power=80%)
    Example: CTR=10%, want to detect +1% improvement, need ~3,600/group

  STEP 4: Random assignment
    Randomly assign each user to A or B (not by time — avoids day-of-week bias!)
    Ensure independence: same user always sees same version

  STEP 5: Run the test
    Run until you hit your sample size (don't peek early! p-hacking risk)

  STEP 6: Analyze
    Use t-test or z-test for proportions
    Check for novelty effect, network effects, cookie churn

  STEP 7: Decision
    p < 0.05 AND practical significance? → Ship it!
    p < 0.05 but tiny effect size? → Consider costs
```

---

### Q18. Explain Bayes' Theorem. How is it used in ML?
*[All] | ★★*

**Simple Answer:**
Imagine you have a medical test for a rare disease. The test is 99% accurate. If you
test positive, are you 99% likely to have the disease? NOT necessarily — because the
disease is very rare! Bayes' theorem tells you how to properly update your belief when
you get new evidence.

**Official Definition:**
> **Bayes' Theorem** states: $P(A|B) = P(B|A) \times P(A) \,/\, P(B)$
> Where P(A) is the **prior** (belief before evidence), P(B|A) is the **likelihood**
> (probability of evidence given A), and P(A|B) is the **posterior** (updated belief
> after seeing evidence B).

**Disease Example:**
- $P(\text{Disease}) = 0.001$ (rare disease: 0.1% of population)
- $P(\text{Test+} \mid \text{Disease}) = 0.99$ (test is 99% sensitive)
- $P(\text{Test+} \mid \text{No Disease}) = 0.01$ (1% false positive rate)

$$P(\text{Disease} \mid \text{Test+}) = \frac{P(\text{Test+} \mid \text{Disease}) \times P(\text{Disease})}{P(\text{Test+})}$$

$$P(\text{Test+}) = 0.99 \times 0.001 + 0.01 \times 0.999 = 0.00099 + 0.00999 = 0.01098$$

$$P(\text{Disease} \mid \text{Test+}) = \frac{0.99 \times 0.001}{0.01098} = 0.090 \approx 9\%!$$

Only 9% chance of disease despite a positive test! Why? The disease is so rare that false positives outnumber true positives.

**ML Applications:**
- Naive Bayes classifier (spam detection)
- Bayesian hyperparameter optimization
- Bayesian neural networks (uncertainty estimation)
- Probabilistic graphical models

---

### Q19. What is the Central Limit Theorem? Why does it matter?
*[All] | ★★*

**Simple Answer:**
Imagine measuring the height of 10 people at a time, computing the average, and repeating
this 1,000 times. Even if heights in the population are not normally distributed,
the distribution of your AVERAGES will look like a bell curve! That's the Central Limit Theorem —
averages of large enough samples are always approximately normal.

**Official Definition:**
> The **Central Limit Theorem (CLT)** states that the sampling distribution of the mean
> of n independent, identically distributed random variables with finite mean μ and variance σ²
> converges to a Normal distribution $\mathcal{N}(\mu, \sigma^2/n)$ as $n \to \infty$, regardless of the original distribution.

```
  ORIGINAL DISTRIBUTION                SAMPLING DISTRIBUTION OF MEANS
  (can be any shape)                   (always bell-shaped for large n)
  ─────────────────────────            ────────────────────────────────
  Uniform:  ████████████               n=30:     ╭──────╮
             1  2  3  4  5                       /        \
                                               ─╯          ╰─
  Skewed:   *
            **                         n=100:      ╭────╮
            * * *                                /        \
            * * * * * *                       ──╯          ╰──
                                                 (narrower!)

  WHY IT MATTERS:
  ─────────────────────────────────────────────────────────────────
  - Justifies using t-tests and z-tests (they assume normality of means)
  - Foundation for confidence intervals
  - Explains why averaging reduces noise in ML (ensembles work!)
  - Allows statistical inference even when raw data is not normal
```

---

### Q20. What are Type I and Type II errors?
*[All] | ★*

**Simple Answer:**
A fire alarm that goes off when there's no fire = Type I error (false alarm).
A fire alarm that doesn't go off when there IS a fire = Type II error (missed detection).
Both are bad, but which is worse depends on the situation.

**Official Definition:**
> A **Type I error** (false positive, α) is rejecting a true null hypothesis — concluding
> there is an effect when there isn't. A **Type II error** (false negative, β) is failing
> to reject a false null hypothesis — missing a real effect.
> **Power** (1−β) is the probability of correctly detecting a real effect.

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                     ACTUAL REALITY                              │
  │               H₀ TRUE           H₀ FALSE (effect exists)       │
  ├─────────────────────────────────────────────────────────────────┤
  │ DECIDE       Correct decision   TYPE II ERROR (β)               │
  │ H₀ TRUE      (True Negative)    (False Negative)                │
  │              ✓                  Miss real effect — dangerous!   │
  ├─────────────────────────────────────────────────────────────────┤
  │ DECIDE       TYPE I ERROR (α)   Correct decision                │
  │ H₀ FALSE     (False Positive)   (True Positive)                 │
  │              False alarm!       ✓ (Power = 1-β)                 │
  └─────────────────────────────────────────────────────────────────┘

  REAL EXAMPLES:
  ─────────────────────────────────────────────────────────────────
  Type I (false alarm):    Wrongly concluding A/B test won → ship bad feature
  Type II (missed effect): Concluding test failed → miss a good feature

  Reduce Type I: lower α (0.05 → 0.01)   trade-off: increases Type II
  Reduce Type II: larger sample size, larger effect size (power analysis)
```

---

### Q21. What is maximum likelihood estimation (MLE)?
*[G][O] | ★★★*

**Simple Answer:**
Imagine you flip a coin 10 times and get 7 heads. What's the most likely value
for the coin's probability of heads? Not 0.5, and not 1.0 — it's exactly 0.7!
Maximum Likelihood Estimation finds the parameter value that makes the observed
data most probable.

**Official Definition:**
> **Maximum Likelihood Estimation (MLE)** is a method of estimating model parameters by
> finding the parameter values that maximize the likelihood function L(θ; X) = P(X | θ) —
> the probability of observing the data given the parameters. Equivalently, it maximizes
> the log-likelihood to simplify computation.

**Example:** Estimating a Gaussian distribution from data

Data: $[2.1, 1.8, 2.3, 2.0, 1.9]$ — observed heights of 5 plants

Model: each observation $\sim \mathcal{N}(\mu, \sigma^2)$. Find $\mu$ and $\sigma$ that maximize $P(\text{data} \mid \mu, \sigma)$.

**MLE solution:**

$$\mu_{\text{MLE}} = \text{sample mean} = \frac{2.1+1.8+2.3+2.0+1.9}{5} = 2.02 \qquad \sigma_{\text{MLE}} = 0.19$$

**Connection to ML loss functions:**

| Minimizing... | Is equivalent to... |
|---------------|---------------------|
| MSE | MLE for Gaussian noise |
| Cross-Entropy | MLE for Bernoulli/categorical distributions |
| Adding L2 regularization | Maximum A Posteriori (MAP) with Gaussian prior |

So training a neural network with cross-entropy loss IS doing MLE — you're finding weights that make the data most probable under the model!

---

### Q22. Explain confidence intervals. What is the difference from a credible interval?
*[G] | ★★*

**Simple Answer:**
If you measure 100 people's heights and compute a 95% confidence interval of
[168cm, 172cm], it means: if you repeated this sampling process 100 times,
about 95 of those intervals would contain the true average height.
(It does NOT mean the true value is 95% likely to be in THIS interval — a common mistake!)

**Official Definition:**
> A **confidence interval** at level (1−α)% contains the true parameter with probability
> (1−α) across repeated experiments. It is a frequentist concept: the parameter is fixed
> (not random); the interval is random. A **credible interval** (Bayesian) gives the range
> in which the parameter lies with (1−α) probability given the observed data.

**95% Confidence Interval:**

Sample mean = 170cm, SEM = 2cm

$$\text{CI} = \text{mean} \pm 1.96 \times \text{SEM} = 170 \pm 3.92 = [166.1,\ 173.9]$$

If we collected 100 different samples and built 100 intervals, about 95 of them would contain the true population mean.

- WRONG: "There's a 95% chance the true mean is in [166, 174]"
- RIGHT: "This procedure produces intervals that capture the true mean 95% of the time across repeated samples"

The distinction matters in interviews! Bayesian credible intervals DO have the intuitive interpretation: "95% probability the parameter is in this range, given the data."

---

# PART 3 — Deep Learning

---

### Q23. How does backpropagation work? ★★★
*[All] | ★★★*

**Simple Answer:**
Imagine you baked a terrible cake and need to figure out what went wrong. You trace
back through every step: "Too salty — where did the salt come from? Step 3, too much.
Why? Because step 1 measurement was wrong." Backpropagation does the same — it traces
the error backward through every layer to figure out how much each weight contributed
to the mistake.

**Official Definition:**
> **Backpropagation** is an algorithm for computing gradients of the loss function with
> respect to every weight in a neural network, using the chain rule of calculus. Gradients
> flow backward from the output layer to the input layer, enabling gradient descent to
> update all weights efficiently.

```
  FORWARD PASS:    Input → Layer 1 → Layer 2 → Output → Loss
                                                          ↓
  BACKWARD PASS:   ∂L/∂W₁ ← ∂L/∂W₂ ← ∂L/∂Output ← Loss

  CHAIN RULE:
  ─────────────────────────────────────────────────────────────────
  ∂L/∂W₁ = ∂L/∂Output × ∂Output/∂Layer2 × ∂Layer2/∂Layer1 × ∂Layer1/∂W₁

  Each term is easy to compute locally.
  The chain rule multiplies them to get the total gradient.

  CONCRETE EXAMPLE (one neuron):
  ─────────────────────────────────────────────────────────────────
  Forward:  z = wx + b  →  a = relu(z)  →  L = (a - y)²
  Backward: ∂L/∂w = ∂L/∂a × ∂a/∂z × ∂z/∂w
                   = 2(a-y) × relu'(z) × x
  Update:   w = w - α × ∂L/∂w
```

---

### Q24. What are vanishing and exploding gradients? How do you fix them? ★★★
*[All] | ★★★*

**Simple Answer:**
Imagine passing a message through 100 people. If each person whispers it quieter
(×0.5), by person 100 the message is nearly silent (0.5^100 ≈ 0). That's vanishing
gradients — the signal to learn disappears in early layers. Exploding gradients are
the opposite: each person shouts louder (×2), and by person 100 it's deafening (2^100).

**Official Definition:**
> **Vanishing gradients** occur when gradients become exponentially small during
> backpropagation through many layers, preventing early layers from learning.
> **Exploding gradients** occur when gradients become exponentially large, causing
> unstable weight updates. Both stem from repeated multiplication of small or large values
> through the chain rule.

```
  WHY VANISHING HAPPENS (sigmoid example):
  ─────────────────────────────────────────────────────────────────
  Sigmoid derivative: σ'(z) = σ(z)(1-σ(z)) ≤ 0.25 always!

  Through 10 layers: gradient × 0.25^10 = gradient × 0.000001
  Signal effectively DISAPPEARS before reaching early layers!

  SOLUTIONS:
  ┌──────────────────────────────────────────────────────────────┐
  │  VANISHING:                                                  │
  │  ✓ ReLU activation (gradient = 1 for z > 0, not compressed) │
  │  ✓ Residual connections / Skip connections (ResNet)          │
  │  ✓ LSTM/GRU for RNNs (gates protect gradient flow)          │
  │  ✓ Batch Normalization (keeps activations in good range)     │
  │  ✓ Careful weight initialization (Xavier, He)                │
  ├──────────────────────────────────────────────────────────────┤
  │  EXPLODING:                                                  │
  │  ✓ Gradient clipping: if ‖grad‖ > threshold, scale it down  │
  │  ✓ Weight regularization (L2)                                │
  │  ✓ Smaller learning rate                                     │
  │  ✓ Batch Normalization                                        │
  └──────────────────────────────────────────────────────────────┘
```

---

### Q25. What is the attention mechanism and how do Transformers work? ★★★
*[G][O] | ★★★*

**Simple Answer:**
When you read "The dog chased the ball because IT was fast", the word "it" needs to
figure out what it refers to. You look back at "dog" and "ball" and decide "it" = "dog."
Attention is the same idea — every word looks at all other words and decides which ones
are most relevant for understanding its meaning.

**Official Definition:**
> **Attention** computes a weighted sum of all values (V), where the weight of each value
> is determined by the similarity between a query (Q) and its corresponding key (K).
> **Self-attention**: Attention(Q,K,V) = softmax(QKᵀ/√d_k) × V, where Q=K=V=input.
> **Transformers** stack multiple self-attention layers with feed-forward networks, residual
> connections, and layer normalization. They process sequences in parallel (no recurrence).

```
  SELF-ATTENTION IN ACTION:
  ─────────────────────────────────────────────────────────────────
  Input: "The animal didn't cross the street because it was tired"
                                                    ↑
                                            What does "it" mean?

  Attention weights for "it" (each word's relevance):
  The: 0.02  animal: 0.86  didn't: 0.01  cross: 0.01
  the: 0.02  street: 0.05  because: 0.02  was: 0.01  tired: 0.01
                ▲
          "it" attends most to "animal" → "it" = "animal" ✓

  TRANSFORMER ARCHITECTURE:
  ─────────────────────────────────────────────────────────────────
  Input → Embeddings + Positional Encoding
       → [Multi-Head Self-Attention + Residual + LayerNorm] × N
       → [Feed-Forward + Residual + LayerNorm] × N
       → Output

  Multi-Head: Run attention multiple times with different weight matrices
              Each "head" can attend to different types of relationships
              (one head: syntax, another: coreference, another: semantics)

  Why Transformers beat RNNs:
  ─────────────────────────────────────────────────────────────────
  RNN: processes tokens SEQUENTIALLY (slow, vanishing gradient over long distances)
  Transformer: processes ALL tokens IN PARALLEL → fast + captures long-range deps
```

---

### Q26. What is word2vec/embeddings? What is the intuition behind them?
*[G][O] | ★★*

**Simple Answer:**
Imagine every word is a point in a city. Words with similar meanings live in the same
neighborhood: "king" and "queen" live near each other. "Cat" and "dog" live near each
other too, but in a different neighborhood from "king." Embeddings are coordinates
that tell you where each word lives in this city — words with similar meanings have
similar coordinates.

**Official Definition:**
> **Word embeddings** are dense vector representations of words in a continuous vector space
> where semantically similar words are geometrically close. **Word2Vec** learns these by
> training a neural network to either predict a word from its context (CBOW) or predict
> context from a word (Skip-gram), causing semantically related words to cluster together.

```
  WORD2VEC MAGIC — ARITHMETIC ON MEANING:
  ─────────────────────────────────────────────────────────────────
  King − Man + Woman ≈ Queen  ✓
  Paris − France + Italy ≈ Rome  ✓
  Walked − Walk + Swim ≈ Swam  ✓

  EMBEDDING SPACE (conceptual 2D):
  ─────────────────────────────────────────────────────────────────
  Fast  Rapid    King  Queen     Dog  Cat
   ●     ●        ●     ●         ●    ●
   Slow  Steady  Man   Woman   Fish  Bird
    ●     ●       ●      ●        ●    ●

  Words with similar roles cluster together!

  SKIP-GRAM vs CBOW:
  ─────────────────────────────────────────────────────────────────
  Skip-gram: "cat" → predict ["The", "sat", "on", "the", "mat"]
  CBOW:      ["The", "sat", "on", "the", "mat"] → predict "cat"

  Skip-gram: better for rare words
  CBOW: faster training
```

---

### Q27. What is batch normalization? Why does it help?
*[All] | ★★*

**Simple Answer:**
Imagine a factory where each worker passes parts to the next. If worker 1 sends parts
that are randomly huge or tiny, worker 2 has to waste time adjusting instead of doing
their real job. Batch normalization standardizes what each layer receives — everyone
gets parts in a consistent, normal size — so every layer can focus on learning.

**Official Definition:**
> **Batch Normalization** normalizes the inputs to each layer within a mini-batch to have
> zero mean and unit variance, then applies learned scale (γ) and shift (β) parameters.
> This reduces internal covariate shift, allows higher learning rates, acts as regularization,
> and makes training faster and more stable.

```
  FORMULA:
  ─────────────────────────────────────────────────────────────────
  μ_B = (1/m) Σ xᵢ                  ← batch mean
  σ²_B = (1/m) Σ (xᵢ - μ_B)²        ← batch variance
  x̂ᵢ = (xᵢ - μ_B) / √(σ²_B + ε)    ← normalize
  yᵢ = γ x̂ᵢ + β                     ← scale and shift (learned!)

  BENEFITS:
  ─────────────────────────────────────────────────────────────────
  1. Faster training (can use 10× higher learning rates)
  2. Less sensitive to weight initialization
  3. Acts as regularization (reduces need for dropout)
  4. Reduces vanishing/exploding gradients

  INFERENCE vs TRAINING:
  ─────────────────────────────────────────────────────────────────
  Training: compute mean and variance from each mini-batch
  Inference: use running mean/variance accumulated during training
             (can't use batch stats for single predictions!)
```

---

### Q28. Explain dropout. Why does it work as regularization? ★★★
*[All] | ★★*

**Simple Answer:**
Dropout is like studying for an exam while randomly forgetting 50% of your notes
each time you study. You can't just memorize — you have to actually understand the
material from multiple angles. This forces the neural network to learn more robust,
distributed representations instead of relying on a few key neurons.

**Official Definition:**
> **Dropout** randomly sets a fraction p of neuron activations to zero during each
> training forward pass. This prevents co-adaptation (where neurons become overly
> dependent on specific other neurons) and acts as training an ensemble of 2^N thinned
> networks. At inference, all neurons are used and weights are scaled by (1-p).

```
  TRAINING (p=0.5):           DIFFERENT TRAINING PASS:
  ──────────────────────       ──────────────────────────
  ● ─────────────── ●          ● ─────────────── ●
  ● ─────────────── ○ (off)    ○ (off)
  ● ─────────────── ●          ● ─────────────── ●
  ○ (off)                      ● ─────────────── ○ (off)
  ● ─────────────── ●          ● ─────────────── ●

  Each pass uses a different "thinned" network!
  Equivalent to training an ensemble of 2^N sub-networks.

  WHY IT WORKS:
  ─────────────────────────────────────────────────────────────────
  ✓ Forces redundancy: no single neuron can be relied upon
  ✓ Reduces co-adaptation: neurons can't all specialize together
  ✓ Ensemble effect: different networks vote at inference time

  TYPICAL RATES:
  ─────────────────────────────────────────────────────────────────
  Input layer:   dropout = 0.1–0.2
  Hidden layers: dropout = 0.3–0.5
  Output layer:  dropout = NEVER (need all neurons for prediction!)
```

---

### Q29. What is the difference between CNN, RNN, and Transformer? When to use each? ★★★
*[All] | ★★★*

**Simple Answer:**
CNN = a set of detectors that look for local patterns (edges, textures) in a neighborhood.
RNN = reads text like a human — left to right, remembering what came before.
Transformer = reads everything at once and figures out what relates to what.

```
┌────────────────┬──────────────────────────────────────────────────────┐
│ MODEL          │ KEY IDEA + BEST USE CASE                             │
├────────────────┼──────────────────────────────────────────────────────┤
│ CNN            │ Slides filters over local regions → detects local    │
│                │ patterns regardless of position                      │
│ Convolutional  │ Great for: Images, audio spectrograms, 1D sequences  │
│ Neural Net     │ Not good at: long-range dependencies                 │
├────────────────┼──────────────────────────────────────────────────────┤
│ RNN / LSTM     │ Processes sequence step by step, maintains hidden    │
│                │ state ("memory") across time steps                   │
│ Recurrent      │ Great for: Time series, text generation, speech      │
│ Neural Net     │ Not good at: very long sequences (vanishing grad)    │
│                │            parallelization (sequential by design)    │
├────────────────┼──────────────────────────────────────────────────────┤
│ Transformer    │ Every position attends to every other in parallel    │
│                │ Captures any-distance dependencies at once           │
│                │ Great for: NLP, long sequences, multimodal tasks     │
│                │ Not good at: very long sequences (O(n²) attention)  │
│                │             without positional encoding              │
└────────────────┴──────────────────────────────────────────────────────┘

  Modern trend: Transformers replacing both CNNs and RNNs!
  ViT (Vision Transformer): Transformer for images
  Transformer-XL, Mamba: Transformer for very long sequences
```

---

### Q30. What is RLHF? Why is it important for language models? ★★★
*[O][G] | ★★★*

**Simple Answer:**
Imagine teaching a student to write good essays. Instead of giving them a grammar book,
you have experts read their essays and rate them "good" or "bad." A judge model learns
what humans consider "good." Then the student practices to get high scores from the judge.
That's RLHF — the AI learns to be helpful and harmless by getting feedback from humans.

**Official Definition:**
> **Reinforcement Learning from Human Feedback (RLHF)** is a training paradigm that uses
> human preference data to fine-tune language models. A reward model is trained to predict
> human preferences, then the language model is optimized using RL (typically PPO) to
> maximize the reward model's score, subject to a KL-divergence constraint that prevents
> the model from drifting too far from its supervised baseline.

```
  RLHF PIPELINE:
  ─────────────────────────────────────────────────────────────────
  STEP 1: Supervised Fine-Tuning (SFT)
    Human labelers write ideal responses to prompts
    Pre-trained LLM is fine-tuned on these examples
    Result: SFT model (better at following instructions)

  STEP 2: Reward Model Training
    Show labelers pairs of responses → they choose which is better
    Train a classifier to predict human preference
    Input: (prompt, response) → Output: scalar reward score

  STEP 3: RL Fine-Tuning with PPO
    LLM generates responses
    Reward model scores them
    PPO updates LLM weights to increase reward
    KL penalty: keeps LLM close to SFT baseline (prevents gaming)

  WHY RLHF:
  ─────────────────────────────────────────────────────────────────
  Raw LLMs optimize for "plausible next token" not "helpful response"
  They can be harmful, dishonest, or unhelpful
  RLHF aligns the model with human values and intentions
  Used by: ChatGPT, Claude, Gemini, Llama-2-chat, etc.
```

---

# PART 4 — Data, Features & Evaluation

---

### Q31. What is data leakage and how do you prevent it?
*[All] | ★★*

**Simple Answer:**
Imagine a student who gets the answers before the exam. They'll ace it, but you won't
know if they actually learned anything. Data leakage is when information from the future
or from the test set accidentally "leaks" into training — your model looks great in
testing but fails in the real world.

**Official Definition:**
> **Data leakage** occurs when information unavailable at prediction time is used during
> model training, causing the model to appear better than it truly is. Leakage can be
> temporal (using future data to predict the past) or from improper train/test splitting
> (test statistics influencing training decisions).

```
  COMMON FORMS OF DATA LEAKAGE:
  ─────────────────────────────────────────────────────────────────
  1. TEMPORAL LEAKAGE
     Using future data to predict past events
     Wrong:  train on Jan-Dec data, test on Nov data (Nov in train!)
     Right:  train Jan-Oct, test Nov-Dec (strict time ordering)

  2. PREPROCESSING LEAKAGE
     Fitting scaler/encoder on train + test combined
     Wrong:  scaler.fit(X_all)  then split
     Right:  split FIRST, then scaler.fit(X_train) only

  3. TARGET LEAKAGE
     Including features that are CAUSED BY the target
     Wrong:  predicting diabetes using "insulin dosage"
             (you only have insulin dosage AFTER diagnosis!)
     Right:  only include features available BEFORE the event

  4. DUPLICATE LEAKAGE
     Same patient's records appear in both train and test
     The model memorizes the specific patient, not the disease

  HOW TO DETECT LEAKAGE:
  ─────────────────────────────────────────────────────────────────
  → Accuracy suspiciously high? Check for leakage!
  → A feature with 0.99 correlation with target? Suspicious!
  → Model accuracy drops dramatically at deployment? Leakage!
```

---

### Q32. How do you handle missing data?
*[All] | ★*

**Simple Answer:**
Missing data is like a survey where some people skipped questions. You have choices:
skip those people entirely (deletion), guess their answers (imputation), or treat
"skipped" as its own answer (indicator feature).

```
  APPROACHES BY SITUATION:
  ─────────────────────────────────────────────────────────────────
  < 5% missing, MCAR (random):
    → Delete missing rows (safest if small enough)

  5-30% missing, numerical:
    → Mean imputation (symmetric data)
    → Median imputation (skewed data or outliers present)
    → Model-based imputation (predict missing from other features)

  5-30% missing, categorical:
    → Mode imputation (fill with most common value)
    → "Unknown" category (treat missingness as informative)

  > 30% missing:
    → Consider dropping the column
    → Or: create binary "was_missing" indicator feature

  INFORMATIVE MISSINGNESS (don't just fill!):
    → "Income" left blank on loan form → add "income_was_missing" = 1
    → This signal itself may be predictive!

  TREE MODELS (XGBoost, LightGBM):
    → Handle missing values natively, no imputation needed!
```

---

### Q33. What metrics do you use for imbalanced datasets? ★★★
*[All] | ★★*

**Simple Answer:**
If 99% of transactions are normal and 1% are fraud, a model that predicts "normal"
for everything gets 99% accuracy — but catches 0% of frauds! We need metrics that
don't reward lazy majority-class prediction.

```
  METRICS FOR IMBALANCED DATA:
  ─────────────────────────────────────────────────────────────────
  ✗ AVOID:  Accuracy  (misleading on imbalanced classes)

  ✓ USE:
  F1 Score:       Harmonic mean of precision and recall
                  Good single metric for binary imbalanced problems

  Macro F1:       Average F1 per class (treats all classes equally)
  Weighted F1:    Average F1 weighted by class size

  AUC-ROC:        Discrimination ability at all thresholds
                  Useful but can be optimistic with extreme imbalance

  PR-AUC:         Area under Precision-Recall curve
                  Better than ROC-AUC for very imbalanced data!
                  Focus on minority class performance

  MCC:            Matthews Correlation Coefficient
  (best single    Ranges from -1 to +1, handles all 4 confusion matrix
  metric!)        cells. Considered the most informative single metric.

  EXAMPLE:
  ─────────────────────────────────────────────────────────────────
  Fraud dataset: 990 normal, 10 fraud
  Model: predicts all normal (lazy!)
    Accuracy = 99% ← MISLEADING
    Recall   = 0%  ← reveals the problem!
    F1       = 0%
    MCC      ≈ 0   ← also reveals problem
```

---

# PART 5 — ML System Design

---

### Q34. How would you design a recommendation system?
*[G][A] | ★★★*

**Simple Answer:**
Think of a recommendation system like a matchmaker. To recommend Netflix shows, you
could ask: "What do similar users watch?" (collaborative filtering), or "What has
similar content to what this user liked?" (content-based filtering), or combine both.

```
  THREE MAIN APPROACHES:
  ─────────────────────────────────────────────────────────────────
  1. COLLABORATIVE FILTERING
     "Users similar to you also liked X."
     User-Item Matrix:
         Movie1  Movie2  Movie3  Movie4
  UserA:   5       4       ?       1
  UserB:   4       5       4       1
  UserC:   ?       3       5       2

  Find users similar to UserA (e.g., UserB) → recommend Movie3!

  2. CONTENT-BASED FILTERING
     "You liked action movies → recommend similar action movies."
     Item features: genre, director, actors, duration
     User profile: weighted average of liked items' features
     Recommend items similar to user profile

  3. HYBRID (production standard)
     Combine both → Netflix, Spotify, YouTube all use hybrid

  SYSTEM DESIGN (2-stage):
  ─────────────────────────────────────────────────────────────────
  Stage 1: RETRIEVAL (recall)
    100M items → 1,000 candidates
    Fast approximate nearest neighbor search (FAISS, HNSW)
    Embedding-based retrieval (user embedding ≈ item embedding)

  Stage 2: RANKING
    1,000 candidates → top 10-50 to show
    Sophisticated model (deep neural net) ranking by predicted CTR/watch-time
    Features: user history, item features, context (time, device)

  COLD START PROBLEM:
  ─────────────────────────────────────────────────────────────────
  New user: no history → use content-based, ask for preferences, use demographics
  New item: no interactions → use content-based features, item metadata
```

---

### Q35. How would you detect fraud in real-time?
*[A][G] | ★★★*

**Simple Answer:**
Imagine a bank guard who has seen thousands of suspicious transactions. They learn to
spot: "this is the third foreign transaction in 5 minutes," or "this amount is 10×
larger than usual for this customer." Fraud detection uses the same pattern recognition,
but it must happen in milliseconds.

```
  SYSTEM DESIGN:
  ─────────────────────────────────────────────────────────────────
  Transaction
      │
      ▼
  FEATURE EXTRACTION (< 5ms)
  - Historical: avg spend, typical locations, usual hours
  - Real-time: velocity (# transactions in last 1hr, 24hr)
  - Behavioral: device fingerprint, typing speed, IP location
  - Graph features: is this merchant newly registered?

      │
      ▼
  ML MODEL INFERENCE (< 10ms)
  - Stage 1: Fast linear model / tree (< 1ms)
  - Stage 2: Deep neural net for borderline cases (5-10ms)
  - Output: Fraud probability score (0 to 1)

      │
      ▼
  DECISION ENGINE
  Score > 0.9:  Block automatically
  Score > 0.6:  Challenge (send OTP / ask customer to confirm)
  Score < 0.6:  Approve

  CHALLENGES:
  ─────────────────────────────────────────────────────────────────
  Class imbalance: 0.1% fraud → use SMOTE, class weights, PR-AUC
  Concept drift: fraud patterns evolve → retrain frequently
  Latency: must decide in < 100ms → fast feature stores, optimized inference
  Label delay: don't know if fraud for days → delayed feedback learning
  Adversarial: fraudsters adapt to model → need constant monitoring
```

---

### Q36. How do you deploy and monitor a machine learning model in production?
*[All] | ★★★*

**Simple Answer:**
Deploying a model is like launching a new restaurant. First you test the kitchen (staging),
then open the doors (deployment), then watch for customer complaints (monitoring), and
when the menu gets stale, you update it (retraining). The hardest part isn't building —
it's keeping it working over time.

```
  DEPLOYMENT STRATEGIES:
  ─────────────────────────────────────────────────────────────────
  Shadow Mode:    New model runs in parallel, doesn't affect users
                  Compare old vs new predictions silently → safe!

  Canary Release: Route 5% of traffic to new model
                  If metrics look good → increase to 10%, 50%, 100%

  Blue-Green:     Run two identical environments (A and B)
                  Switch all traffic at once, easy rollback

  A/B Test:       Random split of users between old and new model
                  Measure business metrics for both

  MONITORING (what to track):
  ─────────────────────────────────────────────────────────────────
  Data drift:     Input feature distributions changing over time?
  Concept drift:  Relationship between X and y changing?
  Model metrics:  Accuracy, F1, AUC degrading?
  Business metrics: CTR, revenue, user satisfaction
  Latency:        P50, P95, P99 inference time
  Errors:         Rate of 500 errors, timeouts, exceptions

  HANDLING MODEL DRIFT:
  ─────────────────────────────────────────────────────────────────
  Scheduled retraining: retrain weekly/monthly on fresh data
  Triggered retraining: retrain when drift detected automatically
  Online learning: update model continuously from streaming data
```

---

# PART 6 — Google-Specific Questions

---

### Q37 (G). How does PageRank work?
*[G] | ★★★*

**Simple Answer:**
Imagine every website is a person, and a link from one website to another is a vote.
But not all votes are equal — a vote from a famous, trustworthy person (like Wikipedia)
counts more than a vote from an unknown blog. PageRank counts votes AND considers
who is doing the voting.

**Official Definition:**
> **PageRank** is an algorithm that measures the importance of web pages based on the
> structure of links between them. A page's rank is the probability that a random surfer
> clicking links will visit that page. Pages linked from high-rank pages receive more rank.

```
  FORMULA:
  ─────────────────────────────────────────────────────────────────
  PR(A) = (1-d)/N + d × Σ [PR(T)/C(T)]
                     T→A
  Where:
    d = damping factor (0.85) — probability of following a link
    N = total number of pages
    PR(T) = PageRank of page T that links to A
    C(T) = number of outbound links from T

  INTUITION:
  ─────────────────────────────────────────────────────────────────
  PageA links to PageB and PageC (equally shares its rank)
  Many high-rank pages link to PageD → PageD gets high rank!

  Computed iteratively until convergence:
  Initialize all PR = 1/N
  Update every page's PR using above formula
  Repeat until stable

  REAL GOOGLE:
  Modern search uses 200+ signals beyond PageRank:
  freshness, relevance, user behavior, local signals, etc.
```

---

### Q38 (G). How would you build a YouTube recommendation system?
*[G] | ★★★*

**Simple Answer:**
YouTube must answer: "Out of 800 million videos, which 20 should this specific user
see right now?" It uses what you've watched before, what similar users watch, video
features, and even the time of day.

```
  YOUTUBE DNN (Deep Neural Network) ARCHITECTURE:
  ─────────────────────────────────────────────────────────────────
  STAGE 1: CANDIDATE GENERATION (hundreds → hundreds)
    Input: user's watch history, search history, demographics
    Output: hundreds of candidates from millions of videos
    Method: Approximate nearest neighbor in embedding space
            User embedding ≈ softmax over watched videos

  STAGE 2: RANKING (hundreds → top 20)
    Rich features:
    - Video: embeddings, upload time, views, likes/dislikes
    - User: watch time, recent searches, subscription signals
    - Context: time of day, device, prior session
    Deep neural net → predicts expected watch time (not just click!)
    Optimize watch time, not just clicks (reduces clickbait)

  KEY INSIGHTS FROM GOOGLE'S PAPER:
  ─────────────────────────────────────────────────────────────────
  ✓ Treat recommendation as extreme multi-class classification
    (which of 1M videos will the user watch next?)
  ✓ "Example age" feature: model freshness of training data
  ✓ Watch time as label (not binary like/dislike)
  ✓ Withhold future information during training (avoid leakage!)
```

---

### Q39 (G). How would you improve a classifier that has 95% accuracy but low recall?
*[G] | ★★*

```
  DIAGNOSIS:
  ─────────────────────────────────────────────────────────────────
  High accuracy + low recall = model is biased toward negative class.
  It's predicting "negative" too often to stay accurate overall.
  Likely culprits: class imbalance, threshold too high.

  STEP-BY-STEP IMPROVEMENT PLAN:
  ─────────────────────────────────────────────────────────────────
  1. Check class distribution
     Is the data 95% negative class? Then 95% accuracy is trivial!

  2. Lower the decision threshold
     Default: predict positive if P > 0.5
     Try:     predict positive if P > 0.2
     Effect:  ↑ recall (catch more positives)
              ↓ precision (more false alarms)
     Use PR curve to find optimal threshold for your cost function.

  3. Handle class imbalance
     Oversample minority class (SMOTE)
     Add class weights to loss function
     Collect more positive examples

  4. Change the evaluation metric
     Switch from accuracy to F1 or AUC as optimization target

  5. Use a more powerful model or better features
     Gradient boosting captures complex patterns often missed

  6. Cost-sensitive learning
     Tell the model "missing a positive costs 10× more than a false alarm"
```

---

### Q40 (G). What are distributed training strategies for large models?
*[G][O] | ★★★*

**Simple Answer:**
Training a huge neural network on one computer would take years. Distributed training
splits the work across many computers, like hundreds of workers building different
parts of a bridge simultaneously.

```
  THREE MAIN PARALLELISM STRATEGIES:
  ─────────────────────────────────────────────────────────────────
  DATA PARALLELISM:
  ─────────────────
  Same model on each GPU, different data batches
  GPU1: batch 1-32 → gradients
  GPU2: batch 33-64 → gradients     } Average gradients
  GPU3: batch 65-96 → gradients     } Update weights
  ...
  Best for: most CV/NLP tasks
  Limit: entire model must fit on one GPU

  MODEL PARALLELISM:
  ──────────────────
  Different layers on different GPUs
  GPU1: Layers 1-4   →   GPU2: Layers 5-8   →   GPU3: Layers 9-12
  Sequential by nature → GPUs can be idle (pipeline parallelism fixes this)
  Best for: models too large for one GPU (e.g., GPT-4)

  TENSOR PARALLELISM:
  ───────────────────
  Split individual weight matrices across GPUs
  A single attention head's weight matrix → split across 8 GPUs
  Each GPU handles a slice of the computation in parallel
  Best for: very large layers (e.g., huge feed-forward layers in LLMs)

  GOOGLE'S APPROACH:
  ─────────────────────────────────────────────────────────────────
  TPU pods with thousands of chips
  All-reduce for gradient synchronization (Ring-Allreduce)
  Mixed precision training (float16 for compute, float32 for accumulation)
  Gradient checkpointing: recompute activations to save memory
```

---

# PART 7 — Amazon-Specific Questions

---

### Q41 (A). How does Amazon's recommendation engine work at scale?
*[A] | ★★★*

```
  AMAZON ITEM-TO-ITEM COLLABORATIVE FILTERING:
  ─────────────────────────────────────────────────────────────────
  Instead of user-to-user similarity (computationally expensive with
  300M users), Amazon uses item-to-item similarity!

  Pre-compute: "Customers who bought X also bought Y"
  At query time: look up current cart items → find similar items

  WHY ITEM-ITEM (not user-user)?
  ─────────────────────────────────────────────────────────────────
  ✓ Item-item similarity table: computed offline → fast at query time
  ✓ Fewer items than users → smaller similarity matrix
  ✓ Item preferences more stable than user preferences
  ✓ Scales to hundreds of millions of users

  MODERN AMAZON SYSTEM (2024):
  ─────────────────────────────────────────────────────────────────
  Multi-objective:  Optimize both clicks AND purchases AND revenue
  Deep learning:    Session-based attention model (what user did today)
  Exploration:      Show some novel items (not just safe bets)
  Business rules:   Advertiser bids, inventory, Prime eligibility layered on top
```

---

### Q42 (A). How would you build a demand forecasting system for Amazon?
*[A] | ★★★*

**Simple Answer:**
Amazon needs to know: "How many red sneakers in size 9 will be ordered in Seattle
next week?" If they guess too high, they waste money on inventory. Too low, customers
get "out of stock" messages. Good forecasting is worth billions.

```
  SYSTEM DESIGN:
  ─────────────────────────────────────────────────────────────────
  FEATURES:
  Historical: sales last 7/30/365 days, same week last year
  Seasonal:   day of week, month, holidays, Prime Day, Black Friday
  External:   competitor prices, weather, news events
  Product:    price, category, new/existing, reviews
  Location:   warehouse region, population density

  MODELS (in order of complexity):
  ─────────────────────────────────────────────────────────────────
  1. Baseline: naive (last year same week) or moving average
  2. ARIMA/SARIMA: classical time-series (good for stationary data)
  3. Prophet (Facebook): handles seasonality + holidays well
  4. LightGBM with lag features: often best for retail
  5. DeepAR (Amazon): RNN/Transformer, probabilistic forecasts
     → outputs distribution, not just point estimate!

  WHY PROBABILISTIC FORECASTS?
  ─────────────────────────────────────────────────────────────────
  Point: "We'll sell 100 units" → order exactly 100
  Probabilistic: "We'll sell 80-120 units with 80% probability"
  → Order 120 (avoid stockout with acceptable inventory cost)

  EVALUATION:
  MAPE (Mean Absolute Percentage Error) = Σ |actual-pred| / actual
  WAPE: weighted by volume (expensive items matter more)
```

---

### Q43 (A). What is A/B testing at Amazon's scale? What unique challenges exist?
*[A] | ★★★*

```
  CHALLENGES AT AMAZON SCALE:
  ─────────────────────────────────────────────────────────────────
  1. NETWORK EFFECTS
     User A tells User B about a product discovered in the new UI.
     User B (in control group) is now influenced by treatment group.
     Violates independence assumption of standard A/B test.
     Solution: cluster-level randomization (by geography or account)

  2. NOVELTY EFFECT
     Users interact differently with anything new → temporary lift.
     Solution: Run tests longer (2-4 weeks minimum)

  3. MULTIPLE COMPARISONS (p-hacking)
     Amazon tests thousands of features simultaneously.
     Some will be significant by chance at p=0.05.
     Solution: Bonferroni correction, FDR control (Benjamini-Hochberg)

  4. LONG-TERM EFFECTS
     Short test: users love the new recommendation algorithm.
     Long term: recommendation bubble → users buy less.
     Solution: holdout groups maintained for months

  5. METRIC SELECTION
     Optimize for clicks? → Clickbait. Conversions? → Recommendation
     bias. Revenue? → Short-term, ignores lifetime value.
     Amazon uses a hierarchy: primary (revenue), secondary (CTR, cart adds),
     and guardrail metrics (page load time, return rate).
```

---

# PART 8 — OpenAI-Specific Questions

---

### Q44 (O). How do large language models (LLMs) work?
*[O] | ★★★*

**Simple Answer:**
An LLM is like a very smart autocomplete trained on the entire internet. At every
step, it predicts what word should come next, given all the words before it.
After training on trillions of such predictions, it has "read" so much that it
develops a surprisingly deep understanding of language, facts, and reasoning.

**Official Definition:**
> A **Large Language Model** is a transformer-based neural network trained on large text
> corpora using self-supervised next-token prediction. It learns to model the conditional
> probability P(xₜ | x₁, x₂, ..., xₜ₋₁) over a vocabulary and develops emergent
> capabilities in reasoning, translation, summarization, and code generation.

```
  HOW TRAINING WORKS:
  ─────────────────────────────────────────────────────────────────
  Training text: "The cat sat on the mat"
  Input:         "The cat sat on the"
  Target:        "cat sat on the mat"
  (predict the next token at every position — self-supervised!)

  PRE-TRAINING (months on thousands of GPUs):
  Corpus: Common Crawl, books, GitHub, Wikipedia (trillions of tokens)
  Objective: next-token prediction (language modeling)
  Result: model that "knows" language, facts, code, reasoning

  POST-TRAINING (weeks):
  SFT (supervised fine-tuning on instruction examples)
  RLHF (alignment using human feedback)
  Result: helpful, harmless, honest assistant

  SCALING LAWS (OpenAI's key finding):
  ─────────────────────────────────────────────────────────────────
  Model performance improves predictably with:
    - Model parameters (N)
    - Training tokens (D)
    - Compute budget (C = 6ND)

  Bigger models trained on more data = predictably better, no plateau!
  This justified training GPT-3 (175B), GPT-4, etc.
```

---

### Q45 (O). What are scaling laws in ML?
*[O] | ★★★*

**Simple Answer:**
Imagine baking cakes. Scaling laws say: "If you use twice as much batter, add twice
as many eggs, and bake twice as long, the cake is always exactly this much better."
In ML, scaling laws tell researchers exactly how much better a model will get if they
make it bigger or train it longer — before actually spending money to find out.

**Official Definition:**
> **Neural scaling laws** describe power-law relationships between model performance
> (loss) and scale factors: number of parameters (N), dataset size (D), and compute
> budget (C). Discovered by Kaplan et al. (2020) and Hoffmann et al. (2022, "Chinchilla"),
> they enable predicting model performance before training.

```
  KEY FINDINGS:
  ─────────────────────────────────────────────────────────────────
  KAPLAN ET AL. (2020):
    Loss ∝ N^(-0.076)  (model size)
    Loss ∝ D^(-0.095)  (data size)
    Loss ∝ C^(-0.050)  (compute)

  CHINCHILLA SCALING LAW (2022, more accurate):
    For a given compute budget C:
    Optimal N = C^0.5  (scale model and data equally!)

    GPT-3: 175B params, 300B tokens → UNDERTRAINED on data!
    Chinchilla: 70B params, 1.4T tokens → same compute, much better!

  WHY SCALING LAWS MATTER:
  ─────────────────────────────────────────────────────────────────
  ✓ Predict final model quality before running the full expensive training
  ✓ Guide decisions: "Should I train a bigger model or more data?"
  ✓ Justify why bigger models consistently perform better
  ✓ Help plan compute budgets for model development
```

---

### Q46 (O). How would you evaluate a language model?
*[O] | ★★★*

**Simple Answer:**
Evaluating an LLM is hard because language is open-ended. "What is 2+2?" is easy to
score. "Write me a poem about autumn" is not. You need both automatic benchmarks and
human evaluation.

```
  AUTOMATIC EVALUATION:
  ─────────────────────────────────────────────────────────────────
  PERPLEXITY:      How surprised is the model by held-out text?
                   Lower = better language modeling
                   Limitation: doesn't measure usefulness!

  BENCHMARK SUITES:
  MMLU:            57 subjects, 14K multiple-choice questions
                   Measures knowledge breadth
  HellaSwag:       Commonsense reasoning completion
  HumanEval:       Code generation (164 Python problems)
  GSM8K:           Grade-school math word problems
  TruthfulQA:      Does model give truthful answers?
  BIG-Bench:       200+ tasks probing diverse capabilities

  HUMAN EVALUATION:
  ─────────────────────────────────────────────────────────────────
  Pairwise comparison: "Which response A or B is better?"
  → Aggregate into Elo rating (like chess rankings)
  → LMSYS Chatbot Arena: 1M+ human votes comparing models

  Red-teaming:    Try to make the model fail, be harmful, hallucinate
  Constitutional AI: automated evaluation against safety principles

  KEY LIMITATIONS:
  ─────────────────────────────────────────────────────────────────
  ✗ Benchmark contamination: training data may contain benchmark answers
  ✗ Saturation: models are scoring 90%+ on old benchmarks → not informative
  ✗ Benchmarks ≠ real-world usefulness
  ✓ Current frontier: human preference ratings + safety evaluations
```

---

### Q47 (O). What is in-context learning and prompt engineering?
*[O] | ★★*

**Simple Answer:**
Imagine hiring a contractor and instead of training them for weeks, you just show them
3 examples of the kind of work you want: "Here's a bad email, here's how I'd fix it.
Here's another bad email, here's how I'd fix it. Now fix this one." The contractor learns
from just those examples in the conversation. That's in-context learning.

**Official Definition:**
> **In-context learning (ICL)** is the ability of large language models to learn from
> examples provided in the prompt (context) at inference time, without updating model
> weights. **Prompt engineering** is the practice of designing input prompts to elicit
> desired behaviors from LLMs.

```
  FEW-SHOT PROMPTING (In-Context Learning):
  ─────────────────────────────────────────────────────────────────
  Prompt:
    "Classify the sentiment:
    'I love this product!' → Positive
    'This is terrible.' → Negative
    'It was okay.' → Neutral
    'Amazing, 5 stars!' → ???"

  Model: "Positive" ✓
  (Learned the task from 3 examples — no fine-tuning needed!)

  KEY PROMPT TECHNIQUES:
  ─────────────────────────────────────────────────────────────────
  Zero-shot:      Just describe the task, no examples
  Few-shot:       Provide 3-10 examples
  Chain-of-Thought: "Let's think step by step..." → forces reasoning
  ReAct:          Reasoning + Action interleaved (for agents)
  Self-consistency: Sample multiple answers, take majority vote

  CHAIN-OF-THOUGHT EXAMPLE:
  ─────────────────────────────────────────────────────────────────
  Wrong (direct):
  Q: "If a train travels 120km in 2 hours, how long for 300km?"
  A: "2.5 hours"  ← just guessed!

  Right (chain-of-thought):
  Q: (same) "Let's think step by step."
  A: "Speed = 120/2 = 60 km/h. Time = 300/60 = 5 hours."  ✓
```

---

### Q48 (O). What is AI safety and alignment? Why does OpenAI care about it?
*[O] | ★★★*

**Simple Answer:**
Imagine a super-intelligent robot given the goal "make humans happy." Without careful
alignment, it might drug everyone to feel happy, or put everyone in a virtual reality
simulation — technically achieving the goal but horrifyingly. Alignment is making sure
AI systems actually do what we MEAN, not just what we technically asked for.

**Official Definition:**
> **AI Alignment** is the challenge of designing AI systems whose goals, behaviors, and
> values match human intentions and values, especially as systems become more capable.
> **AI Safety** is the broader field studying how to build AI systems that are reliably
> beneficial, honest, and avoid catastrophic or unintended outcomes.

```
  KEY ALIGNMENT PROBLEMS:
  ─────────────────────────────────────────────────────────────────
  REWARD HACKING:      Model finds unintended ways to maximize reward
  Example: game AI learns to collect points by doing something absurd
  that technically scores high but defeats the purpose of the game

  GOAL MISGENERALIZATION: Model learns correct behavior in training
  but pursues a different goal in deployment
  Example: model trained to be helpful in English → ignores safety
  constraints when speaking other languages (distribution shift)

  SYCOPHANCY:          Model tells users what they want to hear
  even if incorrect, to maximize human approval ratings

  OPENAI'S APPROACHES:
  ─────────────────────────────────────────────────────────────────
  RLHF:            Align model behavior with human preferences
  Constitutional AI: Specify principles, have model critique its own outputs
  Scalable Oversight: Use AI to help humans supervise more capable AI
  Interpretability: Understand WHAT the model has learned (sparse autoencoders,
                    activation patching, probing classifiers)
  Red-teaming:     Aggressively find failure modes before deployment

  THE CORE CHALLENGE:
  ─────────────────────────────────────────────────────────────────
  As models become more capable, we need alignment techniques that
  scale with capability. A technique that works for GPT-4 may fail
  for a hypothetical GPT-100. This is the research frontier.
```

---

# Quick-Reference Summary Tables

```
┌─────────────────────────────────────────────────────────────────────────┐
│           TOP 10 MOST ASKED QUESTIONS — BY COMPANY                     │
├────────────────────────┬───────────────────────────┬────────────────────┤
│ GOOGLE                 │ AMAZON                    │ OPENAI             │
├────────────────────────┼───────────────────────────┼────────────────────┤
│ 1. Bias-Variance       │ 1. A/B testing design     │ 1. RLHF            │
│ 2. System design       │ 2. Recommendation system  │ 2. Transformers    │
│ 3. Distributed training│ 3. Demand forecasting     │ 3. Scaling laws    │
│ 4. PageRank            │ 4. Class imbalance        │ 4. LLM evaluation  │
│ 5. Overfitting fix     │ 5. Fraud detection        │ 5. Alignment/safety│
│ 6. YouTube rec system  │ 6. Metrics selection      │ 6. In-context lrng │
│ 7. Gradient descent    │ 7. Data leakage           │ 7. Backpropagation │
│ 8. Precision/Recall    │ 8. Missing data           │ 8. Attention mech. │
│ 9. Transformer arch    │ 9. Production monitoring  │ 9. Embedding space │
│ 10. Feature engineering│ 10. Bagging vs Boosting   │ 10. Prompt engineer│
└────────────────────────┴───────────────────────────┴────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────┐
│              COMMONLY CONFUSED TERMS — QUICK CLARIFIER                  │
├─────────────────────────────────────┬───────────────────────────────────┤
│ Precision vs Recall                 │ Precision = quality of positives  │
│                                     │ Recall = coverage of positives    │
├─────────────────────────────────────┼───────────────────────────────────┤
│ L1 vs L2 regularization             │ L1 = sparsity (zeros out weights) │
│                                     │ L2 = smooth shrinkage (no zeros)  │
├─────────────────────────────────────┼───────────────────────────────────┤
│ Bagging vs Boosting                 │ Bagging = parallel (↓ variance)  │
│                                     │ Boosting = sequential (↓ bias)    │
├─────────────────────────────────────┼───────────────────────────────────┤
│ Correlation vs Causation            │ Together ≠ cause-effect           │
├─────────────────────────────────────┼───────────────────────────────────┤
│ Type I vs Type II error             │ I = false alarm; II = missed hit  │
├─────────────────────────────────────┼───────────────────────────────────┤
│ Parametric vs Non-parametric        │ Parametric = fixed structure      │
│                                     │ Non-param = grows with data       │
├─────────────────────────────────────┼───────────────────────────────────┤
│ Generative vs Discriminative        │ Gen = models P(X,Y); creates data │
│                                     │ Disc = models P(Y|X); boundaries  │
├─────────────────────────────────────┼───────────────────────────────────┤
│ CNN vs RNN vs Transformer           │ CNN = local patterns (images)     │
│                                     │ RNN = sequences (text, time)      │
│                                     │ Transformer = all positions, NLP  │
└─────────────────────────────────────┴───────────────────────────────────┘
```

---

## Final Interview Tips

```
  ╔══════════════════════════════════════════════════════════════════╗
  ║  HOW TO ANSWER ML INTERVIEW QUESTIONS                            ║
  ║  ──────────────────────────────────────────────────────────────  ║
  ║                                                                  ║
  ║  THE INTERVIEW FORMULA THAT WORKS:                               ║
  ║  1. RESTATE the question to confirm understanding               ║
  ║  2. Simple intuition first ("It's like...")                      ║
  ║  3. Formal definition (show you know the math)                   ║
  ║  4. Practical considerations (tradeoffs, when to use)            ║
  ║  5. Concrete example from experience ("In my project, I...")    ║
  ║                                                                  ║
  ║  FOR SYSTEM DESIGN QUESTIONS:                                    ║
  ║  1. Clarify requirements and constraints                         ║
  ║  2. Start simple (baseline), then add complexity                 ║
  ║  3. Discuss metrics BEFORE the model                             ║
  ║  4. Think about: scale, latency, retraining, monitoring          ║
  ║  5. Acknowledge tradeoffs — there's no perfect solution          ║
  ║                                                                  ║
  ║  COMMON MISTAKES TO AVOID:                                       ║
  ║  - Jumping into math without giving intuition first              ║
  ║  - Giving textbook answers without showing understanding        ║
  ║  - Not asking clarifying questions on vague problems             ║
  ║  - Forgetting to mention tradeoffs (every choice has costs)     ║
  ║                                                                  ║
  ║  WHAT THESE COMPANIES LOOK FOR:                                  ║
  ║  Google:  Deep technical depth + large-scale thinking            ║
  ║  Amazon:  Business impact + customer obsession + data decisions  ║
  ║  OpenAI:  Research intuition + safety awareness + frontier ML    ║
  ╚══════════════════════════════════════════════════════════════════╝
```

---

**Back to Start:** [README — Table of Contents](../README.md)
