# Chapter 11 — Model Evaluation & Tuning

> "Without a good evaluation strategy, you're flying blind."

---

## What You'll Learn

After reading this chapter, you will be able to:
- Read and interpret a confusion matrix (TP, TN, FP, FN)
- Calculate and choose between Accuracy, Precision, Recall, and F1
- Understand the Precision-Recall tradeoff and when to prioritize each
- Interpret ROC curves and AUC scores
- Apply cross-validation to get reliable performance estimates
- Use grid search and random search for hyperparameter tuning
- Recognize when your model is overfitting or underfitting from learning curves

---

## Why Evaluation Matters

### Simple Explanation
Imagine studying really hard for a test but the teacher gives you the same questions
you already practiced. You'd ace it! But that doesn't mean you actually learned.
Model evaluation checks if your model is truly smart or just memorized the training data.

```
THE PROBLEM:
────────────────────────────────────────────────
  Train accuracy: 99%   ← Model aced its "practice"
  Test accuracy:  62%   ← But FAILED the "real exam"!

  This model is OVERFITTING (just memorized training data)

THE GOAL:
────────────────────────────────────────────────
  Train accuracy: 88%   ← Good performance on training
  Test accuracy:  86%   ← Similarly good on unseen data!

  This model is GENERALIZING well!
```

---

## Evaluation Metrics for Classification

### The Confusion Matrix — The Foundation of Everything ★★

```
                    PREDICTED
                  ┌──────────┬──────────┐
                  │ Positive │ Negative │
       ┌──────────┼──────────┼──────────┤
ACTUAL │ Positive │    TP    │    FN    │
       │          │  (True   │  (False  │
       │          │ Positive)│Negative) │
       ├──────────┼──────────┼──────────┤
       │ Negative │    FP    │    TN    │
       │          │  (False  │  (True   │
       │          │ Positive)│Negative) │
       └──────────┴──────────┴──────────┘

  TP = Model said YES, was actually YES  ← Correct!
  TN = Model said NO, was actually NO   ← Correct!
  FP = Model said YES, was actually NO  ← Wrong! (Type I error)
  FN = Model said NO, was actually YES  ← Wrong! (Type II error)

EXAMPLE (Cancer Detection):
────────────────────────────────────────────────────────
              │ Predicted: Cancer │ Predicted: No Cancer
──────────────┼───────────────────┼─────────────────────
Actual: Cancer│    TP = 90        │      FN = 10
              │   (caught it!)    │ (DANGEROUS: missed!)
──────────────┼───────────────────┼─────────────────────
Actual: No    │    FP = 5         │      TN = 895
Cancer        │ (false alarm)     │    (correct!)
```

---

## The Four Key Metrics ★★★

### 1. Accuracy

$$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$

From our example:

$$\text{Accuracy} = \frac{90 + 895}{90 + 895 + 5 + 10} = \frac{985}{1000} = 98.5\%$$

```
  Sounds great! BUT...
  What if 99% of people don't have cancer?
  A model that ALWAYS predicts "No Cancer" gets 99% accuracy!
  Accuracy is MISLEADING on imbalanced datasets!
```

### 2. Precision — "When you say yes, how often are you right?"

$$\text{Precision} = \frac{TP}{TP + FP} = \frac{90}{90 + 5} = \frac{90}{95} = 94.7\%$$

"Of all the people I flagged as having cancer, 94.7% actually did."

```
  HIGH PRECISION is important when:
  FALSE POSITIVES are costly
  Cancer: unnecessary surgery/chemo on a healthy patient is harmful
  Spam filter: marking a real (important) email as spam is annoying

  ↑ Precision = fewer false alarms, but you might miss real cases
```

### 3. Recall (Sensitivity) — "Of all actual positives, how many did you catch?"

$$\text{Recall} = \frac{TP}{TP + FN} = \frac{90}{90 + 10} = \frac{90}{100} = 90\%$$

"Of all the people who actually had cancer, I caught 90% of them."
The other 10% were missed (False Negatives) -- dangerous!

```
  HIGH RECALL is important when:
  FALSE NEGATIVES are costly
  Cancer: missing a real cancer = patient goes untreated
  Fraud: missing real fraud = financial loss

  ↑ Recall = catch more real cases, but you get more false alarms
```

### 4. F1 Score — The Balance

$$F_1 = \frac{2 \times \text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

$$F_1 = \frac{2 \times 0.947 \times 0.90}{0.947 + 0.90} = \frac{2 \times 0.852}{1.847} = 0.923 = 92.3\%$$

$F_1$ is the **harmonic mean** of Precision and Recall.
It's useful when you need to balance both. Good for imbalanced datasets!

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Accuracy", "Precision", "Recall", "F1 Score"],
    "datasets": [{
      "label": "Cancer Detection Metrics (%)",
      "data": [98.5, 94.7, 90.0, 92.3],
      "backgroundColor": ["rgba(99,102,241,0.6)","rgba(34,197,94,0.7)","rgba(234,88,12,0.7)","rgba(168,85,247,0.7)"],
      "borderColor": ["rgba(99,102,241,1)","rgba(34,197,94,1)","rgba(234,88,12,1)","rgba(168,85,247,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Classification Metrics — Cancer Detection (TP=90, FP=5, FN=10, TN=895)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Score (%)" }, "min": 85, "max": 100 },
      "x": {}
    }
  }
}
```

### The Precision-Recall Tradeoff

```
  Can we make BOTH perfect? NO! There's a tradeoff:

  LOWER THRESHOLD (0.3):              HIGHER THRESHOLD (0.7):
  ────────────────────────            ────────────────────────
  Model flags more as positive        Model flags fewer as positive
  ↑ Recall (catches more true pos)   ↓ Recall (misses some)
  ↓ Precision (more false positives) ↑ Precision (more precise)

  Think of it like a net:
  ────────────────────────────────────────────────────────────
  Big net (low threshold):  Catches lots of fish (high recall)
                            But also catches trash (low precision)

  Small net (high threshold): Catches only big fish (high precision)
                               But might miss some fish (low recall)
```

```chart
{
  "type": "line",
  "data": {
    "labels": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    "datasets": [
      {
        "label": "Precision",
        "data": [0.55, 0.62, 0.70, 0.78, 0.85, 0.90, 0.94, 0.97, 0.99],
        "borderColor": "rgba(99, 102, 241, 1)",
        "fill": false, "tension": 0.4, "pointRadius": 3, "borderWidth": 2
      },
      {
        "label": "Recall",
        "data": [0.98, 0.95, 0.90, 0.84, 0.76, 0.65, 0.52, 0.35, 0.15],
        "borderColor": "rgba(234, 88, 12, 1)",
        "fill": false, "tension": 0.4, "pointRadius": 3, "borderWidth": 2
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Precision-Recall Tradeoff — Raising Threshold Helps One, Hurts the Other" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Score" }, "min": 0, "max": 1 },
      "x": { "title": { "display": true, "text": "Classification Threshold" } }
    }
  }
}
```

---

## ROC Curve & AUC ★★★

### Simple Explanation
The ROC curve shows how your model performs at **all possible thresholds**,
from "call everything positive" to "call everything negative."

```
  ROC CURVE:
  ──────────────────────────────────────────────────────────

  True
  Positive
  Rate
  (Recall)
  1.0 │         ╭─────────────────── Perfect model
      │       ╭╯           (area under = 1.0)
      │     ╭╯
  0.5 │   ╭╯  ← Our model (AUC = 0.90 → good!)
      │  ╱
      │╱         ← Random model (area under = 0.5)
  0.0 └─────────────────────────────────────────────
      0.0        0.5        1.0
                False Positive Rate

  AUC (Area Under Curve):
  ┌──────────────────────────────────────────────────┐
  │ AUC = 1.0  → Perfect model                      │
  │ AUC = 0.9  → Excellent                          │
  │ AUC = 0.8  → Good                               │
  │ AUC = 0.7  → Fair                               │
  │ AUC = 0.5  → Random (coin flip!)                │
  │ AUC < 0.5  → Worse than random (flip prediction)│
  └──────────────────────────────────────────────────┘
```

```chart
{
  "type": "line",
  "data": {
    "labels": [0.0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    "datasets": [
      {
        "label": "Perfect Model (AUC = 1.0)",
        "data": [0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
        "borderColor": "rgba(34, 197, 94, 1)",
        "fill": false, "tension": 0, "pointRadius": 0, "borderWidth": 2, "borderDash": [5,3]
      },
      {
        "label": "Good Model (AUC = 0.90)",
        "data": [0.0, 0.35, 0.55, 0.68, 0.76, 0.86, 0.92, 0.95, 0.97, 0.98, 0.99, 1.0, 1.0],
        "borderColor": "rgba(99, 102, 241, 1)",
        "backgroundColor": "rgba(99, 102, 241, 0.1)",
        "fill": true, "tension": 0.4, "pointRadius": 2, "borderWidth": 2
      },
      {
        "label": "Random Model (AUC = 0.5)",
        "data": [0.0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        "borderColor": "rgba(239, 68, 68, 0.7)",
        "fill": false, "tension": 0, "pointRadius": 0, "borderWidth": 2, "borderDash": [8,4]
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "ROC Curve — Good Model vs Random (Diagonal)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "True Positive Rate (Recall)" }, "min": 0, "max": 1 },
      "x": { "title": { "display": true, "text": "False Positive Rate" } }
    }
  }
}
```

---

## Evaluation Metrics for Regression

```
                      ACTUAL vs PREDICTED
  ─────────────────────────────────────────────────────────────────
  Actual prices:     $300K  $450K  $200K  $500K  $350K
  Predicted prices:  $280K  $460K  $230K  $480K  $400K
  Errors:            -$20K  +$10K  +$30K  -$20K  +$50K
```

### Mean Absolute Error (MAE)

$$\text{MAE} = \frac{1}{n}\sum_{i=1}^{n} |y_i - \hat{y}_i|$$

$$\text{MAE} = \frac{20 + 10 + 30 + 20 + 50}{5} = \frac{130}{5} = \$26{,}000$$

```
  Interpretation: On average, we're off by $26,000.
  Easy to understand! Not sensitive to outliers.
```

### Mean Squared Error (MSE) & RMSE

$$\text{MSE} = \frac{1}{n}\sum_{i=1}^{n} (y_i - \hat{y}_i)^2$$

$$\text{MSE} = \frac{400 + 100 + 900 + 400 + 2500}{5} = \frac{4300}{5} = 860$$

$$\text{RMSE} = \sqrt{\text{MSE}} = \sqrt{860} = \$29{,}326$$

```
  MSE/RMSE: Penalizes BIG errors much more!
  A $100K error counts 100× more than a $10K error.
  (because 100² = 10,000 vs 10² = 100)
```

### R² Score (Coefficient of Determination)

$$R^2 = 1 - \frac{SS_{res}}{SS_{tot}}$$

$R^2$ tells you: "How much of the variance in $y$ does my model explain?"

```
  ┌──────────────────────────────────────────────────┐
  │ R² = 1.0  → Perfect prediction                  │
  │ R² = 0.9  → Model explains 90% of variance      │
  │ R² = 0.5  → Model explains 50% of variance      │
  │ R² = 0.0  → Model is as good as predicting mean │
  │ R² < 0.0  → Model is WORSE than predicting mean │
  └──────────────────────────────────────────────────┘
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["House 1", "House 2", "House 3", "House 4", "House 5"],
    "datasets": [
      {
        "label": "Actual Price ($K)",
        "data": [300, 450, 200, 500, 350],
        "backgroundColor": "rgba(99, 102, 241, 0.7)",
        "borderColor": "rgba(99, 102, 241, 1)", "borderWidth": 1
      },
      {
        "label": "Predicted Price ($K)",
        "data": [280, 460, 230, 480, 400],
        "backgroundColor": "rgba(234, 88, 12, 0.7)",
        "borderColor": "rgba(234, 88, 12, 1)", "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Regression — Actual vs Predicted House Prices" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Price ($K)" }, "beginAtZero": true },
      "x": {}
    }
  }
}
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["House 1 (-$20K)", "House 2 (+$10K)", "House 3 (+$30K)", "House 4 (-$20K)", "House 5 (+$50K)"],
    "datasets": [{
      "label": "Absolute Error ($K)",
      "data": [20, 10, 30, 20, 50],
      "backgroundColor": ["rgba(34,197,94,0.7)","rgba(34,197,94,0.8)","rgba(234,88,12,0.6)","rgba(34,197,94,0.7)","rgba(239,68,68,0.7)"],
      "borderColor": ["rgba(34,197,94,1)","rgba(34,197,94,1)","rgba(234,88,12,1)","rgba(34,197,94,1)","rgba(239,68,68,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Prediction Errors — MAE = $26K (avg), House 5 Is the Biggest Miss" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Absolute Error ($K)" }, "beginAtZero": true },
      "x": {}
    }
  }
}
```

---

## Cross-Validation ★★★

### Simple Explanation
Splitting data once into train/test might be unlucky — maybe you got a bad split.
Cross-validation splits the data **multiple ways** and averages the results.

### K-Fold Cross-Validation

```
  DATA: [1][2][3][4][5][6][7][8][9][10]  (10 examples)

  K=5 folds (5 splits):

  Fold 1: TEST=[1,2]    TRAIN=[3,4,5,6,7,8,9,10]
  Fold 2: TEST=[3,4]    TRAIN=[1,2,5,6,7,8,9,10]
  Fold 3: TEST=[5,6]    TRAIN=[1,2,3,4,7,8,9,10]
  Fold 4: TEST=[7,8]    TRAIN=[1,2,3,4,5,6,9,10]
  Fold 5: TEST=[9,10]   TRAIN=[1,2,3,4,5,6,7,8]

  Each fold gives an accuracy score:
  Fold 1: 88%,  Fold 2: 91%,  Fold 3: 87%,  Fold 4: 90%,  Fold 5: 89%

  Final Score = Average = (88+91+87+90+89)/5 = 89%

  More reliable than a single train/test split!
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Fold 1", "Fold 2", "Fold 3", "Fold 4", "Fold 5"],
    "datasets": [{
      "label": "Accuracy per Fold (%)",
      "data": [88, 91, 87, 90, 89],
      "backgroundColor": ["rgba(99,102,241,0.7)","rgba(99,102,241,0.7)","rgba(99,102,241,0.7)","rgba(99,102,241,0.7)","rgba(99,102,241,0.7)"],
      "borderColor": "rgba(99, 102, 241, 1)",
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": {
      "title": { "display": true, "text": "5-Fold Cross-Validation — Average = 89%" },
      "annotation": {}
    },
    "scales": {
      "y": { "title": { "display": true, "text": "Accuracy (%)" }, "min": 80, "max": 95 },
      "x": {}
    }
  }
}
```

### Stratified K-Fold (for Imbalanced Classes)

```
  PROBLEM with regular K-Fold on imbalanced data:
  ─────────────────────────────────────────────────────────────
  Dataset: 90% Not Spam, 10% Spam

  Regular Fold 1 might get:  TEST = [0% spam!]  ← useless fold!
  Regular Fold 3 might get:  TEST = [25% spam]  ← misleading!

  STRATIFIED K-Fold guarantees each fold mirrors the full ratio:
  ─────────────────────────────────────────────────────────────
  All folds: TEST = [90% not spam, 10% spam]  ← representative!

  DATA (10 examples: 9 not spam ○, 1 spam ●):
  [○][○][○][●][○][○][○][○][○][○]

  Stratified K=5:
  Fold 1: TEST=[○ ●*]  TRAIN=[○ ○ ○ ○ ○ ○ ○ ○]  *proportional
  Fold 2: TEST=[○  ]   TRAIN=[○ ○ ○ ● ○ ○ ○ ○]
  ...

  Always use Stratified K-Fold for classification with
  imbalanced classes. In sklearn: StratifiedKFold()
```

---

## Hyperparameter Tuning ★★

### What Are Hyperparameters Again?

```
  PARAMETERS              vs     HYPERPARAMETERS
  ────────────────────           ─────────────────────────────
  Learned from data              Set by YOU before training

  Neural net weights:            Learning rate: 0.001
  w₁ = 0.34                      Batch size: 32
  w₂ = -1.2                      # Layers: 3
  w₃ = 0.87                      # Trees: 100
  ...                            Max depth: 5
```

### Grid Search
```
  Try EVERY combination of hyperparameters:

  Learning rate: [0.001, 0.01, 0.1]
  Batch size:    [16, 32, 64]

  Grid:
  ─────────────────────────────────────────────────
        │  lr=0.001  │  lr=0.01  │  lr=0.1
  ──────┼────────────┼───────────┼────────────
  bs=16 │    0.82    │   0.88    │  0.71
  bs=32 │    0.85    │   0.91 ★  │  0.73
  bs=64 │    0.84    │   0.89    │  0.70
  ─────────────────────────────────────────────────
  Best: lr=0.01, bs=32 (accuracy=0.91) ← Use this!

  Tries all 3 × 3 = 9 combinations. Slow but thorough!
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["lr=0.001\nbs=16", "lr=0.001\nbs=32", "lr=0.001\nbs=64", "lr=0.01\nbs=16", "lr=0.01\nbs=32", "lr=0.01\nbs=64", "lr=0.1\nbs=16", "lr=0.1\nbs=32", "lr=0.1\nbs=64"],
    "datasets": [{
      "label": "Accuracy",
      "data": [0.82, 0.85, 0.84, 0.88, 0.91, 0.89, 0.71, 0.73, 0.70],
      "backgroundColor": ["rgba(99,102,241,0.5)","rgba(99,102,241,0.5)","rgba(99,102,241,0.5)","rgba(99,102,241,0.6)","rgba(34,197,94,0.85)","rgba(99,102,241,0.6)","rgba(239,68,68,0.5)","rgba(239,68,68,0.5)","rgba(239,68,68,0.5)"],
      "borderColor": ["rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(34,197,94,1)","rgba(99,102,241,1)","rgba(239,68,68,1)","rgba(239,68,68,1)","rgba(239,68,68,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Grid Search — All 9 Combos (Best: lr=0.01, bs=32 → 0.91)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Accuracy" }, "min": 0.6, "max": 1.0 },
      "x": {}
    }
  }
}
```

### Random Search
```
  Instead of every combination, try RANDOM combinations.
  Surprisingly effective!

  Why random is often better than grid:
  ─────────────────────────────────────────────────────────
  Grid (9 trials):                Random (9 trials):
  Each lr value tried 3 times     Each lr sampled independently

  If only lr matters:             More unique lr values explored!
  Grid wastes 2/3 of trials       More likely to find the best
  on batch size variations        lr quickly!
```

### Bayesian Optimization
```
  Smarter than random: uses past trial results to GUIDE
  where to search next!

  Trial 1: lr=0.001 → acc=0.82   (meh)
  Trial 2: lr=0.01  → acc=0.91   (great!)
  Trial 3: Try near 0.01! → lr=0.015 → acc=0.93  ← Even better!

  Builds a model of "which hyperparameters seem promising"
  and focuses search there. Much more efficient!
```

---

## Learning Curves — Diagnosing Problems ★★★

```
PROBLEM: OVERFITTING                PROBLEM: UNDERFITTING
──────────────────────────          ──────────────────────────
 Score                               Score
  │                                   │
1.0│  ──── Train                   1.0│
   │                                  │
0.9│                                0.9│
   │                               0.8│
0.8│                                  │  ──── Train
   │   ····Val                     0.7│       ····Val
0.7│                                  │
   └─────────────── Epochs           └─────────────── Epochs

 Train score: 95%                   Train score: 72%
 Val score:   68%                   Val score:   70%
 GAP IS LARGE!                      BOTH ARE LOW!

 Solutions:                          Solutions:
 - More training data                - More complex model
 - Add regularization                - More features
 - Reduce model complexity           - Train longer
 - Dropout                           - Less regularization
```

```chart
{
  "type": "line",
  "data": {
    "labels": [1,5,10,15,20,25,30,35,40,45,50],
    "datasets": [
      {
        "label": "Train (Overfitting)",
        "data": [0.60,0.78,0.88,0.92,0.94,0.95,0.96,0.96,0.97,0.97,0.97],
        "borderColor": "rgba(99, 102, 241, 1)",
        "fill": false, "tension": 0.3, "pointRadius": 0, "borderWidth": 2
      },
      {
        "label": "Validation (Overfitting)",
        "data": [0.55,0.70,0.73,0.72,0.71,0.70,0.69,0.68,0.68,0.67,0.67],
        "borderColor": "rgba(99, 102, 241, 0.5)",
        "borderDash": [5,3],
        "fill": false, "tension": 0.3, "pointRadius": 0, "borderWidth": 2
      },
      {
        "label": "Train (Good Fit)",
        "data": [0.60,0.75,0.82,0.85,0.87,0.88,0.88,0.89,0.89,0.89,0.89],
        "borderColor": "rgba(34, 197, 94, 1)",
        "fill": false, "tension": 0.3, "pointRadius": 0, "borderWidth": 2
      },
      {
        "label": "Validation (Good Fit)",
        "data": [0.55,0.70,0.78,0.82,0.84,0.85,0.86,0.86,0.86,0.86,0.86],
        "borderColor": "rgba(34, 197, 94, 0.5)",
        "borderDash": [5,3],
        "fill": false, "tension": 0.3, "pointRadius": 0, "borderWidth": 2
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Learning Curves — Overfitting (Big Gap) vs Good Fit (Small Gap)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Score" }, "min": 0.5, "max": 1.0 },
      "x": { "title": { "display": true, "text": "Epoch" } }
    }
  }
}
```

---

## Summary: Which Metric to Use?

```
┌────────────────────────────────────────────────────────────────────┐
│                    METRIC SELECTION GUIDE                         │
├─────────────────────────────────────────────────────────────────  ┤
│ SCENARIO                     │ BEST METRIC                        │
├──────────────────────────────┼────────────────────────────────────┤
│ Balanced classes             │ Accuracy                           │
│ Imbalanced classes           │ F1 Score, AUC-ROC                  │
│ FP is costly (spam filter)   │ Precision                          │
│ FN is costly (cancer detect) │ Recall (Sensitivity)               │
│ Compare models overall       │ AUC-ROC                            │
│ Regression (simple)          │ MAE (interpretable)                │
│ Regression (penalize outlier)│ RMSE                               │
│ Regression (% explained)     │ R²                                 │
└──────────────────────────────┴────────────────────────────────────┘
```

---

## Key Takeaways

```
╔═══════════════════════════════════════════════════════════════╗
║  MODEL EVALUATION CHEAT SHEET                                 ║
║  ─────────────────────────────────────────────────────────   ║
║  Confusion matrix: TP, TN, FP, FN                           ║
║  Accuracy: overall % correct (misleading if imbalanced!)    ║
║  Precision: of predicted positive, how many were right?     ║
║  Recall: of actual positives, how many did you catch?       ║
║  F1: harmonic mean of precision & recall                    ║
║  AUC-ROC: overall discrimination power of the model        ║
║  MAE/RMSE/R²: for regression tasks                         ║
║  Cross-validation: average score over multiple splits       ║
║  Stratified K-Fold: for imbalanced class data               ║
║  Learning curves: diagnose over/underfitting                ║
║  Grid/Random/Bayesian search: find best hyperparameters     ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Review Questions — Test Your Understanding

1. Your cancer detection model has 99% accuracy on a dataset where 99% of patients are healthy. Is this model actually good? What metric should you use instead?
2. For a spam filter, which is worse: flagging a real email as spam (FP) or letting spam through (FN)? What metric should you prioritize?
3. Your model has AUC = 0.85. What does this mean in practical terms?
4. You have a small dataset of 500 rows. Should you use a single train/test split or cross-validation? Why?
5. Explain the precision-recall tradeoff using the "net size" analogy.
6. You're tuning 4 hyperparameters, each with 5 possible values. How many combinations does Grid Search try? Would Random Search be better here?

<details>
<summary>Answers</summary>

1. No — a model that always predicts "healthy" gets 99% accuracy too! Use Precision, Recall, F1 Score, or AUC instead. In cancer detection, Recall is critical (catching real cancer cases).
2. Flagging real email as spam (FP) is usually worse — the user misses an important email. Prioritize Precision (when you say it's spam, be sure). But the tradeoff depends on context.
3. AUC = 0.85 means: if you randomly pick one positive and one negative example, the model correctly ranks the positive higher 85% of the time. It's a "good" model (above 0.8).
4. Cross-validation (5-fold or 10-fold). With only 500 rows, a single split might give you a lucky or unlucky test set. CV tests on every data point and gives a more reliable estimate with confidence intervals.
5. Big net (low threshold) = catches lots of fish (high recall) but also trash (low precision). Small net (high threshold) = catches only big fish (high precision) but misses some (low recall). You can't have both perfect.
6. Grid Search: 5^4 = 625 combinations — it tries every single one. Random Search would likely be better — it samples randomly and often finds near-optimal settings in far fewer iterations (e.g., 100 random tries often beats 625 grid tries).
</details>

---

**Previous:** [Chapter 10 — Neural Networks](10_neural_networks.md)
**Next:** [Chapter 12 — Deep Learning](12_deep_learning.md)
