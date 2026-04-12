# Chapter 4 — Core Concepts & Terminology

> "A language that doesn't affect the way you think about programming is not worth knowing."
> — Alan Perlis. The same is true of ML vocabulary: these concepts shape how you *think*.

---

## What You'll Learn

After reading this chapter, you will be able to:
- Distinguish between features, labels, and data splits (train / validation / test)
- Explain the full training loop (forward pass, loss, backward pass, weight update)
- Choose the right loss function for regression vs classification
- Explain gradient descent and why learning rate matters
- Recognize overfitting vs underfitting and know how to fix each
- Describe the bias-variance tradeoff in simple terms
- Compare optimizers (SGD, Momentum, Adam) and know when to use each

---

## Chapter Map

```
  2.1  Data                   — what we learn from
  2.2  Features & Labels      — inputs and outputs
  2.3  Train / Val / Test     — how we split data
  2.4  The Model              — what we're building
  2.5  The Training Loop      — how learning actually works  ★ new
  2.6  Epochs, Batches, Iters — the units of training        ★ new
  2.7  Loss Functions         — how we measure "wrong"
  2.8  Gradient Descent       — how we fix "wrong"
  2.9  Optimizers             — smarter ways to fix "wrong"   ★ new
  2.10 Overfitting/Underfitting— the central tension
  2.11 Bias–Variance Tradeoff — formalizing that tension
  2.12 Regularization         — tools to prevent overfitting
  2.13 Generalization         — the actual goal of ML         ★ new
  2.14 Probability in ML      — predictions as confidence     ★ new
  2.15 No Free Lunch Theorem  — why no algorithm rules all    ★ new
```

---

## 2.1 Data: The Foundation of ML

### Simple Explanation
Think of data like ingredients for cooking. A bad cook with great ingredients makes a decent meal.
A great cook with rotten ingredients makes terrible food. **ML is the same — garbage in, garbage out.**

### What Does Data Look Like?

```
┌──────────────────────────────────────────────────────────────────┐
│                      A DATASET (Table)                          │
├───────────┬───────────┬──────────────┬───────────┬──────────────┤
│ House ID  │ Sq Feet   │  # Bedrooms  │  Age(yrs) │ Price ($)    │
│           │ (feature) │  (feature)   │ (feature) │ ← LABEL      │
├───────────┼───────────┼──────────────┼───────────┼──────────────┤
│    1      │   1,500   │      3       │    10     │  250,000     │
│    2      │   2,200   │      4       │     5     │  370,000     │
│    3      │     900   │      2       │    30     │  150,000     │
│    4      │   3,100   │      5       │     2     │  520,000     │
│   ...     │    ...    │     ...      │    ...    │    ...       │
└───────────┴───────────┴──────────────┴───────────┴──────────────┘
  ↑                                                      ↑
Each row = one example / data point / observation    This is what
                                                     we're predicting
```

### Data Quality Matters More Than Algorithm Choice

```
  Low-quality data + best algorithm  →  mediocre results
  High-quality data + simple algorithm → often great results

  Common data problems:
  ┌─────────────────────────────────────────────────────────────┐
  │ Missing values     │ Some cells are empty                   │
  │ Noise              │ Random errors in measurements          │
  │ Duplicates         │ Same row appears multiple times        │
  │ Imbalance          │ 990 "not fraud" : 10 "fraud" rows      │
  │ Distribution shift │ Training data ≠ real-world data        │
  │ Label errors       │ Data was mislabeled by humans          │
  └─────────────────────────────────────────────────────────────┘
```

---

## 2.2 Features and Labels

### Features (X) — The Inputs

**Simple:** Features are the *clues* you give the model. Like the clues a detective uses.

**Official Definition:**
> A **feature** (also called input variable, predictor, or attribute) is an individual
> measurable property of the phenomenon being observed. Features are the independent
> variables fed as input to a model.

```
Types of Features:
─────────────────────────────────────────────────────────────────
Continuous   │ Any number in a range
Numerical    │ Examples: age=25.3, price=450.99, height=180.2cm
─────────────────────────────────────────────────────────────────
Discrete     │ Whole numbers only
Numerical    │ Examples: bedrooms=3, clicks=100, page_views=42
─────────────────────────────────────────────────────────────────
Categorical  │ Named groups with NO natural order (nominal)
             │ Examples: color=red, city=London, brand=Nike
─────────────────────────────────────────────────────────────────
Ordinal      │ Categories WITH a natural order/ranking
             │ Examples: size=Small/Medium/Large, rating=1-5 stars
─────────────────────────────────────────────────────────────────
Binary       │ Only 2 possible values
             │ Examples: spam=Yes/No, is_active=True/False
─────────────────────────────────────────────────────────────────
Temporal     │ Date/time — treat carefully (cyclical!)
             │ Examples: hour=14, day_of_week=3, month=11
             │ Tip: hour 23 and hour 0 are CLOSE, not far apart!
             │ Use sin/cos encoding for cyclical patterns
─────────────────────────────────────────────────────────────────
Text/Image   │ Unstructured data — needs conversion first
             │ Text → word embeddings (dense number vectors)
             │ Images → pixel arrays or CNN feature maps
```

### Labels (y) — The Output / Target

**Simple:** The label is the *answer* the model is learning to predict.

**Official Definition:**
> A **label** (also called target variable, dependent variable, or output) is what we are
> trying to predict. In supervised learning, the training data includes both features and labels.
> In unsupervised learning, there are no labels.

```
  Feature vector (x)            Label (y)

  [SqFt=1500, Beds=3, Age=10] → Price = $250,000   (regression)
  [Email text, sender, links]  → Spam = Yes/No      (classification)
  [Pixel values of image]      → Cat / Dog / Bird   (classification)
  [Daily sales history]        → Next week sales    (time series)
```

---

## 2.3 Training, Validation & Test Sets

### Simple Explanation
Imagine studying for an exam:
- **Training set** = your textbook (learn from this)
- **Validation set** = practice questions (self-check while studying)
- **Test set** = the REAL exam (see this ONCE at the very end)

```
                    YOUR FULL DATASET (100%)
    ┌──────────────────────────────────────────────────┐
    │  [████████████████] [████████] [████████]        │
    └──────────────────────────────────────────────────┘
              │                │           │
              ▼                ▼           ▼
          Training         Validation    Test
            Set               Set        Set
           70%               15%         15%

          Teach the         Tune        Measure FINAL
          model             model       performance
                                        (untouched!)

  KEY RULE: Never let test data influence training decisions!
  If you peek at test results and re-tune, the test set
  is no longer a fair measure — you've contaminated it.
```

**Official Definition:**
> The **training set** fits the model parameters.
> The **validation set** tunes hyperparameters and selects the best model architecture.
> The **test set** provides an unbiased estimate of final model performance on unseen data.

### Typical Split Strategies

```
  ┌────────────────────────────────────────────────────────────┐
  │  Small dataset (< 10K rows)                                │
  │  → 70 / 15 / 15 split, or use cross-validation            │
  │                                                            │
  │  Medium dataset (10K – 1M rows)                           │
  │  → 80 / 10 / 10 split                                     │
  │                                                            │
  │  Large dataset (> 1M rows)                                │
  │  → 98 / 1 / 1 split is fine                               │
  │  (1% of 1M = 10,000 rows — plenty for validation)         │
  └────────────────────────────────────────────────────────────┘
```

---

## 2.4 The Model

### Simple Explanation
A model is a **mathematical function** that transforms input features into a prediction.
It contains learned parameters (weights) that are adjusted during training.

```
              ┌──────────────────────────────────┐
              │                                  │
Features ──►  │    f(X) = prediction             │ ──► Prediction
  (X)         │    where f is learned from data  │       (ŷ)
              │    and shaped by parameters W    │
              │                                  │
              └──────────────────────────────────┘
```

**Official Definition:**
> A **model** is a mathematical representation that maps inputs to outputs using a set of
> learned parameters. The form of the model (linear, tree, neural net) is called the
> **model architecture** or **hypothesis class**.

### Inductive Bias — Every Model Makes Assumptions

```
  Every algorithm assumes something about the shape of the solution.
  This built-in assumption is called INDUCTIVE BIAS.

  ┌──────────────────┬─────────────────────────────────────────────┐
  │ Linear Regression│ Assumes relationship between X and y is a  │
  │                  │ straight line (linear)                      │
  ├──────────────────┼─────────────────────────────────────────────┤
  │ Decision Tree    │ Assumes data can be split by axis-aligned   │
  │                  │ rectangular boundaries                      │
  ├──────────────────┼─────────────────────────────────────────────┤
  │ KNN              │ Assumes similar inputs have similar outputs │
  │                  │ (nearby points in space are in same class)  │
  ├──────────────────┼─────────────────────────────────────────────┤
  │ Neural Network   │ Makes weak assumptions — can learn almost   │
  │                  │ any pattern given enough data and neurons   │
  │                  │ (called a "universal approximator")         │
  └──────────────────┴─────────────────────────────────────────────┘

  Choosing a model = choosing what assumptions you're comfortable with.
  Wrong assumptions → even infinite data won't help!
```

---

## 2.5 Parameters vs Hyperparameters

```
┌─────────────────────────────────────────────────────────────────────┐
│                 PARAMETERS vs HYPERPARAMETERS                       │
├──────────────────────────────┬──────────────────────────────────────┤
│ PARAMETERS                   │ HYPERPARAMETERS                      │
├──────────────────────────────┼──────────────────────────────────────┤
│ Numbers INSIDE the model     │ Settings you choose BEFORE training  │
│ Learned from data            │ NOT learned from data — you set them │
│ Change during training       │ Fixed during a single training run   │
│                              │                                      │
│ Examples:                    │ Examples:                            │
│  - Weights in a neural net   │  - Learning rate: 0.001             │
│    w₁=0.34, w₂=-1.2         │  - # trees in random forest: 100    │
│  - Coefficients in linear    │  - Max depth of decision tree: 5    │
│    regression: 150.3, 20000  │  - # layers in neural network: 3    │
│  - Split thresholds in trees │  - Dropout rate: 0.3                │
│                              │                                      │
│ Analogy: the volume level    │ Analogy: choosing a speaker vs       │
│ that adjusts itself to       │ headphones — you decide BEFORE       │
│ fill the room perfectly      │ you start listening                  │
└──────────────────────────────┴──────────────────────────────────────┘
```

---

## 2.6 The Training Loop ★

This is the most important section in this chapter. Understanding the training loop
means you understand *how* machine learning actually works.

### Simple Explanation
Training a model is like practicing free throws in basketball:
1. Take a shot (**forward pass**)
2. See how far off you were (**compute loss**)
3. Figure out what adjustment to make (**backward pass**)
4. Adjust your technique (**update weights**)
5. Repeat thousands of times until accurate

```
┌─────────────────────────────────────────────────────────────────────┐
│                     THE TRAINING LOOP                               │
│                                                                     │
│  For each mini-batch of training data:                              │
│                                                                     │
│  ┌─────────────┐                                                    │
│  │  STEP 1     │  FORWARD PASS                                      │
│  │             │  Feed inputs (X) through the model                 │
│  │  X ──► f(X) │  Compute predictions (ŷ)                          │
│  │       = ŷ  │                                                    │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  STEP 2     │  COMPUTE LOSS                                      │
│  │             │  Compare predictions ŷ to true labels y            │
│  │  L = loss   │  Produce a single number: "how wrong are we?"      │
│  │  (ŷ, y)    │                                                    │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  STEP 3     │  BACKWARD PASS (Backpropagation)                   │
│  │             │  Use calculus (chain rule) to compute              │
│  │  ∂L/∂W      │  gradient of loss with respect to every weight W   │
│  │             │  "Which direction should each weight move          │
│  │             │   to reduce the loss?"                             │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  STEP 4     │  UPDATE WEIGHTS                                    │
│  │             │  W = W - learning_rate × gradient                  │
│  │  W ← W-α∇L │  Each weight nudged in the direction that          │
│  │             │  reduces the loss (gradient descent step)          │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         └──────────── repeat for next mini-batch ──────────────────┘
│                                                                     │
│  After ALL batches in the dataset = 1 EPOCH complete                │
│  Repeat for many epochs until loss stops improving                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Concrete Walk-Through (Tiny Example)

```
  Task: predict if temperature > 20°C means "ice cream day" (1) or not (0)

  Model: y = sigmoid(w × temp + b)   (logistic regression, one weight)
  Initial: w = 0.0,  b = 0.0

  ─────── Training example: temp=25, label=1 ──────────────────────────

  STEP 1 — Forward pass:
    raw = 0.0 × 25 + 0.0 = 0.0
    ŷ = sigmoid(0.0) = 0.5       ← model is 50/50 unsure

  STEP 2 — Compute loss (binary cross-entropy):
    loss = -[1 × log(0.5) + 0 × log(0.5)] = 0.693  ← quite wrong!

  STEP 3 — Backward pass:
    ∂loss/∂w = (ŷ - y) × temp = (0.5 - 1) × 25 = -12.5
    ∂loss/∂b = (ŷ - y)        = (0.5 - 1)       = -0.5

  STEP 4 — Update (learning_rate = 0.01):
    w = 0.0 - 0.01 × (-12.5) = 0.125   ← w increased!
    b = 0.0 - 0.01 × (-0.5)  = 0.005

  ─────── Next forward pass with updated weights: ─────────────────────
    raw = 0.125 × 25 + 0.005 = 3.13
    ŷ = sigmoid(3.13) = 0.958  ← now 96% confident! Loss decreased.
```

---

## 2.7 Epochs, Batches, and Iterations ★

These three terms are constantly confused. Here is exactly what each means.

```
YOUR TRAINING DATA: 1,000 examples, batch size = 100

┌─────────────────────────────────────────────────────────────────────┐
│                          EPOCH 1                                    │
│                                                                     │
│  Iteration 1:  examples [1–100]    → forward → loss → update       │
│  Iteration 2:  examples [101–200]  → forward → loss → update       │
│  Iteration 3:  examples [201–300]  → forward → loss → update       │
│  ...                                                                │
│  Iteration 10: examples [901–1000] → forward → loss → update       │
│                                                                     │
│  ← 1 EPOCH = all 10 iterations = model saw all 1,000 examples once │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼ (repeat)
┌─────────────────────────────────────────────────────────────────────┐
│                          EPOCH 2                                    │
│  (data is usually shuffled before each epoch)                       │
│  Iteration 11: examples [543–642]  → forward → loss → update       │
│  ...                                                                │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────┬───────────────────────────────────────────────┐
│ TERM                │ DEFINITION                                    │
├─────────────────────┼───────────────────────────────────────────────┤
│ Epoch               │ One complete pass through the ENTIRE          │
│                     │ training dataset.                             │
│                     │ Typical: train for 10–1000 epochs.            │
├─────────────────────┼───────────────────────────────────────────────┤
│ Batch (Mini-batch)  │ A small subset of training data used for      │
│                     │ one weight update.                            │
│                     │ Common batch sizes: 32, 64, 128, 256          │
├─────────────────────┼───────────────────────────────────────────────┤
│ Iteration           │ One forward + backward pass on one batch.     │
│                     │ iterations per epoch = dataset_size/batch_size│
│                     │ e.g., 1000 examples ÷ 100 batch = 10 iters   │
└─────────────────────┴───────────────────────────────────────────────┘

  Quick formula:
  Total weight updates = epochs × (dataset_size / batch_size)
  e.g., 50 epochs × (10,000 / 32) ≈ 15,625 weight updates
```

### Why Not Use the Full Dataset Each Update?

```
  BATCH GRADIENT DESCENT       STOCHASTIC GD (SGD)       MINI-BATCH GD
  (all data at once)            (one example at a time)    (small batches)
  ──────────────────────        ────────────────────────   ─────────────────
  Loss                          Loss                       Loss
   │ ─────────────              │ * * * * *                │  *
   │                            │*  * * * * *               │   **
   │   very smooth              │      * *  *               │     **
   └──────────────              └───────────────            └──────────────
  + Stable, smooth              + Very fast per update      + Fast + stable
  - Very slow per update        - Very noisy, jumpy         - Best of both!
  - Needs all data in RAM       - Can escape local minima   - Used in practice

  USED IN PRACTICE: Mini-batch GD (just called "SGD" in most libraries)
  PyTorch/TensorFlow default: mini-batch with Adam optimizer
```

---

## 2.8 Loss Functions — Measuring "How Wrong"

### Simple Explanation
The loss function measures **how wrong** your model is on a given prediction.
Training the model = finding the parameters that minimize this number.

```
  Reality:    House actually costs  $300,000
  Prediction: Model says            $250,000
  Error:      $50,000 off  ← one loss value

  With 3 houses:
    Error 1: |250K − 300K| = 50K
    Error 2: |380K − 370K| = 10K
    Error 3: |140K − 200K| = 60K
    MAE = (50K + 10K + 60K) / 3 = $40,000 average error

  Goal: minimize this average error over the entire training set.
```

**Official Definition:**
> A **loss function** (or cost function) maps a prediction and a ground-truth label to a
> scalar representing "how bad" the prediction is. Training optimizes model parameters to
> minimize the expected loss over the training distribution.

### Regression Loss Functions

```
┌──────────────────────────────────────────────────────────────────────┐
│  MAE — Mean Absolute Error                                           │
│  ─────────────────────────                                           │
│  MAE = (1/n) × Σ |ŷᵢ − yᵢ|                                        │
│                                                                      │
│  Intuition: Average of absolute errors. Easy to interpret.           │
│  All errors weighted equally. Robust to outliers.                    │
│                                                                      │
│  Error 5:  |·····|         → contributes 5 to MAE                  │
│  Error 50: |··················|→ contributes 50 to MAE             │
├──────────────────────────────────────────────────────────────────────┤
│  MSE — Mean Squared Error                                            │
│  ──────────────────────────                                          │
│  MSE = (1/n) × Σ (ŷᵢ − yᵢ)²                                       │
│                                                                      │
│  Intuition: Squaring PUNISHES big errors much more than small ones. │
│                                                                      │
│  Error 5:  5²  = 25        → contributes 25 to MSE                 │
│  Error 50: 50² = 2500      → contributes 2500 to MSE! (100×more)   │
│                                                                      │
│  Use MSE when large errors are especially bad.                       │
│  RMSE (√MSE) brings units back to original scale.                   │
└──────────────────────────────────────────────────────────────────────┘
```

### Classification Loss Functions

```
┌──────────────────────────────────────────────────────────────────────┐
│  BINARY CROSS-ENTROPY (Log Loss)                                     │
│  ──────────────────────────────                                      │
│  Used when: predicting one of two classes (spam/not spam)            │
│                                                                      │
│  Loss = −[y × log(ŷ) + (1−y) × log(1−ŷ)]                          │
│                                                                      │
│  Where:  y  = true label (0 or 1)                                   │
│          ŷ  = predicted probability of class 1                       │
│                                                                      │
│  Example — model predicts spam probability = 0.9, actual = spam(1): │
│    Loss = −[1 × log(0.9) + 0 × log(0.1)]                           │
│         = −log(0.9) = 0.105   ← small loss, model is right!         │
│                                                                      │
│  Example — model predicts 0.1 for spam, actual = spam(1):           │
│    Loss = −[1 × log(0.1) + 0 × log(0.9)]                           │
│         = −log(0.1) = 2.303   ← large loss, model is very wrong!    │
│                                                                      │
│  KEY INSIGHT: Cross-entropy severely punishes confident wrong        │
│  predictions (predicting 0.01 when answer is 1 → loss = 4.6!)       │
├──────────────────────────────────────────────────────────────────────┤
│  CATEGORICAL CROSS-ENTROPY                                           │
│  ─────────────────────────                                           │
│  Used when: predicting one of many classes (cat/dog/bird)            │
│                                                                      │
│  Loss = −Σ yᵢ × log(ŷᵢ)    (sum over all classes)                 │
│                                                                      │
│  Example: true class = Cat, model output after softmax:             │
│    Cat: 0.70,  Dog: 0.20,  Bird: 0.10                               │
│    Loss = −[1×log(0.70) + 0×log(0.20) + 0×log(0.10)]               │
│         = −log(0.70) = 0.357   ← moderate, correct but unsure       │
│                                                                      │
│  If model was more confident (Cat: 0.95):                            │
│    Loss = −log(0.95) = 0.051   ← low loss, confident and right!     │
└──────────────────────────────────────────────────────────────────────┘
```

### Loss Comparison at a Glance

```
┌───────────────────┬──────────────┬───────────────────────────────────┐
│ Loss Function     │ Task         │ When to Use                       │
├───────────────────┼──────────────┼───────────────────────────────────┤
│ MAE               │ Regression   │ Outliers present, easy interpret  │
│ MSE / RMSE        │ Regression   │ Large errors matter most          │
│ Huber Loss        │ Regression   │ MAE+MSE hybrid, robust to outlier │
│ Binary Cross-Ent. │ 2-class clf  │ Sigmoid output, 0/1 target        │
│ Categorical C-E   │ N-class clf  │ Softmax output, one-hot target    │
│ KL Divergence     │ Distributions│ VAEs, distillation, generative    │
└───────────────────┴──────────────┴───────────────────────────────────┘
```

---

## 2.9 Gradient Descent — How We Minimize Loss

### Simple Explanation
Imagine you're blindfolded on a hilly landscape and want to find the lowest valley.
You can only feel the slope of the ground beneath your feet. So you take small steps
**in the downhill direction**. Eventually you reach the bottom — that's gradient descent!

```
Loss (y-axis)                                   ← we want to minimize this
 │
 │   ●  ← start (random weights, high loss)
 │    \
 │     \  ← each step follows the gradient (slope)
 │      \
 │       ○  ← local minimum (can get trapped!)
 │
 │              ○  ← global minimum (ideal!)
 │
 └───────────────────────────────── Model Weights (x-axis)

  At each step:
    gradient = slope of loss at current position
    step direction = opposite of gradient (downhill)
    step size = learning_rate × gradient
```

**Official Definition:**
> **Gradient Descent** is a first-order iterative optimization algorithm for finding a local
> minimum of a differentiable function. It steps repeatedly in the direction of the negative
> gradient of the function at the current point.

### Concrete Numerical Example

```
  Model: one weight w, loss function L(w) = (w − 5)²
  Goal: find w that minimizes L (answer: w = 5, loss = 0)

  ┌──────┬──────┬─────────────────────┬───────────────────────────────┐
  │ Step │  w   │  Loss = (w−5)²      │  Update: w ← w − 0.1 × grad  │
  ├──────┼──────┼─────────────────────┼───────────────────────────────┤
  │  0   │ 0.0  │ (0−5)²  = 25.00     │ grad=−10, w = 0 − 0.1×(−10)  │
  │  1   │ 1.0  │ (1−5)²  = 16.00     │ grad= −8, w = 1 − 0.1×(−8)   │
  │  2   │ 1.8  │ (1.8−5)² = 10.24   │ grad=−6.4, w = 1.8 − 0.1×(−6.4)│
  │  3   │ 2.44 │ (2.44−5)² = 6.55   │ ...                           │
  │ ...  │ ...  │  ...                │  ...                          │
  │ 30   │ 4.96 │ (4.96−5)² ≈ 0.002  │  nearly converged!            │
  └──────┴──────┴─────────────────────┴───────────────────────────────┘

  Formula: w_new = w_old − α × ∂L/∂w   (α = learning rate = 0.1)
```

### Learning Rate — The Step Size

```
  Too SMALL (α = 0.0001):        Too LARGE (α = 10):        Just right (α = 0.1):
  ─────────────────────          ──────────────────         ──────────────────────
  Loss │* * * * * * *            Loss │  *       *          Loss │*
       │          **                  │    *   *                  │  **
       │            *                 │      *  (bounces!)        │    ***
       │             *                │    *   *                  │      ****
       └─────────────                 └──────────                 └──────────────
  Tiny steps → very slow           Overshoots → never           Smooth, fast
  (may take 100× longer)            converges                    convergence ✓
```

---

## 2.10 Optimizers — Smarter Gradient Descent ★

Plain gradient descent has problems: it treats all weights equally and gets stuck in
bumpy terrain. Optimizers are improved algorithms that adapt the step size.

```
                    OPTIMIZER FAMILY TREE
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     Plain SGD       Momentum-based   Adaptive LR
     ─────────        ─────────────    ──────────
     Simple,         SGD+Momentum     Adagrad
     slow            Nesterov         RMSProp
                     NAG              Adam ← most popular
                                      AdamW
```

### SGD — Stochastic Gradient Descent (the baseline)

```
  w ← w − α × ∂L/∂w

  Pros: Simple, memory efficient
  Cons: Same learning rate for all weights, sensitive to scale,
        noisy, slow to converge on ill-conditioned problems
```

### SGD with Momentum

```
  Think of a ball rolling downhill — it builds up speed (momentum)
  and rolls right through small bumps!

  velocity ← β × velocity + ∂L/∂w    (β ≈ 0.9, accumulates gradient)
  w        ← w − α × velocity

  Pros: Smoother, faster, escapes shallow local minima
  Cons: One extra hyperparameter (β)

  Loss with plain SGD:              Loss with Momentum:
  │* * * *                          │*
  │       * * *                     │  ***
  │            * *                  │     *****
  │              * * * * * * *      │          ***********
  └────────────────────────         └────────────────────
    Zigzags, slow                     Smooth, fast ✓
```

### Adam — Adaptive Moment Estimation (the default choice)

```
  Adam = Momentum + Adaptive learning rates per parameter

  Intuition:
  - Parameters that rarely get updated → give them bigger steps
  - Parameters that get frequent large updates → shrink their steps
  - Like a GPS that adjusts speed for each road type

  The math (conceptually):
  ┌─────────────────────────────────────────────────────────────────┐
  │  m ← β₁ × m + (1−β₁) × grad          [1st moment: mean grad]  │
  │  v ← β₂ × v + (1−β₂) × grad²         [2nd moment: mean grad²] │
  │  m̂ = m/(1−β₁ᵗ)                       [bias correction]        │
  │  v̂ = v/(1−β₂ᵗ)                       [bias correction]        │
  │  w ← w − α × m̂ / (√v̂ + ε)          [adaptive step]          │
  └─────────────────────────────────────────────────────────────────┘

  Default hyperparameters (work well in almost all cases):
    α  = 0.001   (learning rate)
    β₁ = 0.9     (momentum decay)
    β₂ = 0.999   (variance decay)
    ε  = 1e-8    (tiny constant to prevent division by zero)
```

### Optimizer Comparison

```
┌────────────────┬──────────┬───────────────────┬───────────────────────┐
│ Optimizer      │ Tuning   │ Convergence Speed │ Best For              │
├────────────────┼──────────┼───────────────────┼───────────────────────┤
│ SGD            │ Easy     │ Slow              │ Large-scale linear    │
│ SGD+Momentum   │ Medium   │ Medium-Fast       │ CNNs with tuning      │
│ RMSProp        │ Medium   │ Fast              │ RNNs, non-stationary  │
│ Adam           │ Easy     │ Fast              │ Default for most tasks│
│ AdamW          │ Easy     │ Fast              │ Transformers (LLMs!)  │
└────────────────┴──────────┴───────────────────┴───────────────────────┘

  RULE OF THUMB: Start with Adam (lr=0.001). It rarely fails badly.
  Switch to SGD+Momentum if you need the last 1% of performance.
```

---

## 2.11 Overfitting and Underfitting

### The Goldilocks Problem

```
UNDERFITTING              JUST RIGHT               OVERFITTING
────────────              ──────────               ───────────
Model too simple          Model fits               Model too complex
("lazy student")          the real pattern         ("memorizer")

  y                         y                         y
  │  * *  *                 │  * *  *                 │  *  *  *
  │     *  *                │    ╭──╮                 │  *╮  ╭╗╮*
  │        *                │   /  \*                 │ *  ╰╯ ╰╯ *
  │─────────                │──╯    ╰──               │╯           ╰
  └────────── x             └──────────  x            └──────────── x
  Flat line misses          Curve captures            Curve follows
  all pattern               the pattern               every tiny bump

  Train acc: 60%            Train acc: 90%            Train acc: 99%
  Test  acc: 58%            Test  acc: 88%  ← GOAL    Test  acc: 62%
```

**Official Definitions:**
> **Overfitting**: model learns training data too well, including noise, failing to generalize.
> **Underfitting**: model is too simple to capture the underlying pattern in the data.

### How to Detect: The Learning Curve

```
  OVERFITTING                   UNDERFITTING
  ─────────────────────         ─────────────────────────────
  Accuracy                      Accuracy
    │    ──── train (99%)         │  ──── train (70%)
    │                             │       ···· val  (68%)
    │    ···· val  (63%)          │
    │                             │  Gap is small but
    │    Large GAP between        │  both scores are LOW.
    │    train and val            │
    └──────────────── epochs      └──────────────── epochs

  Gap (train acc − val acc) > 10%  →  probably overfitting
  Both accuracies low              →  probably underfitting
```

---

## 2.12 The Bias–Variance Tradeoff

### Simple Explanation
Every model's error can be broken down into two sources:
- **Bias**: the model is systematically wrong (wrong assumptions)
- **Variance**: the model is inconsistently right (too sensitive to data)

```
                              TOTAL ERROR
                              ────────────
                         Bias²   +   Variance   +   Irreducible Noise
                           │             │                 │
                    Error from      Error from         Random noise
                    wrong           sensitivity to     in data —
                    assumptions     the specific       can NEVER
                    (too simple)    training set       be removed
                                    (too complex)

  CONCRETE EXAMPLE:
  ─────────────────────────────────────────────────────────────────
  Predicting house prices from square footage.

  HIGH BIAS model (straight horizontal line):
    Predicts $250K for every house regardless of size.
    Always wrong in the same systematic way.

  HIGH VARIANCE model (wiggly curve through every training point):
    Predicts $248K for a 1,500 sqft house trained on set A.
    Predicts $301K for the same house trained on set B.
    Very sensitive to which houses happened to be in training.

  GOOD model (smooth curve):
    Consistently predicts ~$252K for a 1,500 sqft house
    regardless of which training set was used. ✓
```

### The Tradeoff Visualized

```
  Error
    │
    │ \                        ← Bias² (decreases with complexity)
    │  \
    │   \         /            ← Variance (increases with complexity)
    │    \       /
    │     \     /
    │      \   /
    │       \ /
    │        ●  ← sweet spot! (min total error)
    │        |
    └────────┼─────────────────────────── Model Complexity
          Simple               Complex
       (Decision Stump)   (Deep Neural Net)

  BIAS      ██████████░░░░░░░░░  shrinks →
  VARIANCE  ░░░░░░░░░░██████████  grows →
  TOTAL     ██████████░░░░░██████
                          ↑
                      Best complexity
```

**Official Definition:**
> The **Bias–Variance Tradeoff** describes the property of a model that the variance of the
> parameter estimates across samples can be reduced by increasing the bias in the estimated
> parameters. Total expected error = Bias² + Variance + Irreducible Noise.

---

## 2.13 Regularization — Controlling Complexity

### Simple Explanation
Regularization adds a **complexity penalty** to the loss function.
The model gets punished for being unnecessarily complicated.

```
  Total Loss = Data Loss + λ × Complexity Penalty
               ─────────   ───────────────────────
               "How wrong  "How complicated are you?"
               are you?"

  λ (lambda) controls the tradeoff:
    λ = 0     → no regularization (overfitting risk)
    λ = large → heavy penalty (underfitting risk)
    λ = small → gentle penalty (usually best)
```

### The Four Main Regularization Techniques

```
┌────────────────────────────────────────────────────────────────────┐
│  L1 REGULARIZATION (Lasso)                                         │
│  Loss = data_loss + λ × Σ|w|                                       │
│                                                                    │
│  Effect: Forces many weights to exactly ZERO.                      │
│  Result: Automatic feature selection!                              │
│  Use when: you suspect only a few features truly matter.           │
│                                                                    │
│  Weights before L1: [2.1, 0.3, -4.2, 0.05, 1.8, -0.01]           │
│  Weights after  L1: [1.9,  0,  -4.0,   0,  1.6,    0 ]           │
│                             ↑ sparse — many exact zeros!           │
├────────────────────────────────────────────────────────────────────┤
│  L2 REGULARIZATION (Ridge)                                         │
│  Loss = data_loss + λ × Σw²                                        │
│                                                                    │
│  Effect: Shrinks all weights toward zero, but rarely to zero.      │
│  Result: Smooth, small weights — less sensitive model.             │
│  Use when: all features probably matter a little.                  │
│                                                                    │
│  Weights before L2: [2.1, 0.3, -4.2, 0.05, 1.8, -0.01]           │
│  Weights after  L2: [1.6, 0.2, -3.1, 0.04, 1.4, -0.009]          │
│                       ↑ all shrunk, none zero                      │
├────────────────────────────────────────────────────────────────────┤
│  DROPOUT (for neural networks)                                     │
│                                                                    │
│  During training: randomly set 20–50% of neurons to zero          │
│  During inference: use all neurons (scaled)                        │
│                                                                    │
│  Training pass:        Another training pass:                      │
│  ● ● ●  ● ●           ●  ●  ●  ●  ●                               │
│    ↓ ↓  ↓             ↓  ↓     ↓                                  │
│  ● ○ ●  ○ ●  ← drop   ●  ●  ○  ●  ○  ← different dropped          │
│    ↓    ↓             ↓        ↓                                  │
│  ●   ●    ●           ●    ●       ●                               │
│                                                                    │
│  Effect: Network can't rely on any single neuron → more robust.   │
│  Analogy: Studying for an exam without knowing which              │
│  questions you'll get → can't memorize one answer path.            │
├────────────────────────────────────────────────────────────────────┤
│  EARLY STOPPING                                                    │
│                                                                    │
│  Loss                                                              │
│   │ ───── train loss                                               │
│   │         ···· val loss                                          │
│   │                                                                │
│   │         val loss starts         ← STOP HERE                   │
│   │         going UP here    ↑                                     │
│   └──────────────────────────────── Epochs                        │
│               epoch 15    epoch 30                                 │
│                                                                    │
│  Save the model weights at epoch 15 (best validation loss).       │
│  Cheap regularization — no formula changes, just monitor and stop.│
└────────────────────────────────────────────────────────────────────┘
```

---

## 2.14 Generalization — The Actual Goal of ML ★

### Simple Explanation
The whole point of ML is not to do well on the training data —
it's to do well on **data you've never seen before**.
This ability is called generalization.

```
  MODEL A                               MODEL B
  ────────────────────────────          ────────────────────────────
  Training accuracy: 99.9%             Training accuracy: 92%
  Test accuracy:     65%               Test accuracy:     91%

  Model A MEMORIZED the training data.   Model B GENERALIZED. ✓
  It is useless in the real world.       It will work on new data.
```

**Official Definition:**
> **Generalization** is a model's ability to produce accurate predictions on new, unseen
> data drawn from the same distribution as the training data. It is the fundamental goal
> of supervised machine learning. Generalization gap = training error − test error.

### What Helps Generalization?

```
  MORE DATA                SIMPLER MODEL             REGULARIZATION
  ──────────               ─────────────             ───────────────
  More diverse examples    Fewer parameters          L1/L2, Dropout,
  → model learns the       → less chance of          Early Stopping
  real pattern, not noise  memorizing noise           penalize complexity

  DATA AUGMENTATION        CROSS-VALIDATION          DIVERSE FEATURES
  ─────────────────        ────────────────           ────────────────
  Artificially expand      Evaluate on multiple       Redundant features
  training data with       held-out subsets           help the model
  transforms (flips,       → reliable estimate        average over noise
  crops, noise)            of true performance
```

### Train / Test Distribution Mismatch (Covariate Shift)

```
  A model trained on one distribution may fail on another!

  TRAINING DATA:              REAL-WORLD DATA:
  ─────────────────           ─────────────────────────
  Photos taken in daylight    Photos taken at night / in rain
  Healthy adults              Patients with comorbidities
  English text 2020-2022      Slang from 2025

  This is called "distribution shift" or "covariate shift."
  Always verify your training data looks like the data you'll see!
```

---

## 2.15 Probability in ML ★

### Simple Explanation
ML models rarely say "the answer IS X." They say "I think there is a 94% chance
the answer is X." Understanding probability helps you read model outputs correctly.

```
  ┌───────────────────────────────────────────────────────────────┐
  │  MODEL OUTPUT (classification)                                │
  │                                                               │
  │  Input: photo of a furry animal                               │
  │                                                               │
  │  Raw scores (logits): Cat=3.2,  Dog=1.1,  Bird=-0.5          │
  │                           ↓ softmax                           │
  │  Probabilities:        Cat=0.87, Dog=0.12, Bird=0.01          │
  │                         ────                                  │
  │  Prediction: CAT  (87% confident)                             │
  │                                                               │
  │  These probabilities MUST sum to 1.0: 0.87+0.12+0.01 = 1.0  │
  └───────────────────────────────────────────────────────────────┘
```

### Calibration — Are the Probabilities Trustworthy?

```
  A model is WELL-CALIBRATED if when it says "70% confident",
  it is actually correct about 70% of the time.

  Well-calibrated model:          Overconfident model:
  ─────────────────────           ─────────────────────────
  Predicted | Actual              Predicted | Actual
  prob      | accuracy            prob      | accuracy
  ──────────┼──────────           ──────────┼──────────
  10%       |  10%                10%       |  10%
  30%       |  31%                50%       |  35%   ← says 50%, only 35%
  50%       |  49%                80%       |  60%   ← says 80%, only 60%
  70%       |  70%                95%       |  72%   ← way overconfident
  90%       |  91%  ✓             95%       |  72%   ✗

  Overconfident models are dangerous in medicine and finance.
  Fix with: Temperature Scaling, Platt Scaling.
```

### Bayes' Theorem — Reasoning with Probability

```
  "Given what I've observed, how should I update my belief?"

  P(A | B) = P(B | A) × P(A) / P(B)
  ────────   ─────────   ────   ────
  Posterior  Likelihood  Prior  Evidence

  EXAMPLE: Medical test for a rare disease (1% of population has it)
  Test is 95% accurate (both sensitivity and specificity).

  P(Disease | Test+) = P(Test+ | Disease) × P(Disease)
                       ─────────────────────────────────
                                 P(Test+)

    = 0.95 × 0.01 / [(0.95 × 0.01) + (0.05 × 0.99)]
    = 0.0095 / (0.0095 + 0.0495)
    = 0.0095 / 0.059
    = 0.161 = 16%

  Even with a positive test, only 16% chance of disease!
  (Because the disease is rare — the prior probability is very low)

  This is why Naive Bayes works, and why ML in medicine is hard.
```

---

## 2.16 The No Free Lunch Theorem ★

### Simple Explanation
There is no single "best" algorithm for all problems. An algorithm that works
great on problem A may fail on problem B. This is not just practical advice —
it's a mathematical theorem.

```
  ┌──────────────────────────────────────────────────────────────┐
  │  THE NO FREE LUNCH THEOREM                                   │
  │  (Wolpert & Macready, 1997)                                  │
  │                                                              │
  │  "Any two optimization algorithms are equivalent when their  │
  │  performance is averaged across ALL possible problems."      │
  │                                                              │
  │  What this means in practice:                                │
  │  ──────────────────────────────────────────────────────      │
  │  XGBoost wins on tabular/structured data                     │
  │  CNNs win on image data                                      │
  │  Transformers win on text data                               │
  │  Naive Bayes wins on simple text with little data            │
  │  KNN wins on some low-dimensional datasets                   │
  │                                                              │
  │  ✗ "Neural networks are always best" — FALSE                 │
  │  ✗ "XGBoost always beats neural nets" — FALSE                │
  │  ✓ "Try multiple approaches, pick what works" — TRUE         │
  └──────────────────────────────────────────────────────────────┘
```

### Practical Consequence: Always Use Baselines

```
  Before building a complex model, always beat a simple baseline.

  BASELINE HIERARCHY:
  ───────────────────────────────────────────────────────────────
  1. Naive baseline    Regression: always predict mean
                       Classification: always predict majority class

  2. Single feature    Use only the most correlated feature

  3. Linear model      Logistic/Linear Regression

  4. Gradient Boosting XGBoost / LightGBM on raw features

  5. Your fancy model  Deep learning, ensemble, etc.

  If step 5 barely beats step 3, your fancy model isn't worth it!
  If step 5 crushes step 3, you've found a real signal.
```

---

## Key Takeaways

```
╔═══════════════════════════════════════════════════════════════════╗
║  CORE CONCEPTS — COMPLETE CHEAT SHEET                             ║
║  ───────────────────────────────────────────────────────────────  ║
║  Data         = examples (rows) described by features (columns)  ║
║  Features (X) = inputs; Labels (y) = what we predict             ║
║  Train/Val/Test = study / tune / final exam (use test ONCE!)     ║
║  Model        = f(X; W) — function with learned parameters W     ║
║  Inductive Bias = assumptions baked into every algorithm         ║
║  Training Loop = forward pass → loss → backward → update W       ║
║  Epoch        = one full pass through all training data          ║
║  Mini-batch   = small subset used per weight update              ║
║  Loss         = scalar measuring how wrong predictions are       ║
║  Cross-Entropy = loss for classification (punishes confidence)   ║
║  Gradient Descent = step downhill to minimize loss               ║
║  Adam         = adaptive optimizer (default choice, lr=0.001)    ║
║  Overfitting  = memorized training data, fails on new data       ║
║  Underfitting = too simple, fails everywhere                     ║
║  Bias         = systematic error from wrong assumptions          ║
║  Variance     = error from sensitivity to training data          ║
║  Regularization = complexity penalty (L1, L2, Dropout, ES)       ║
║  Generalization = performing well on UNSEEN data (true goal!)    ║
║  Probability  = model outputs confidence, not just class         ║
║  No Free Lunch = no algorithm wins everywhere — always baseline  ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## Review Questions — Test Your Understanding

1. You have a dataset of 50,000 rows. What's a reasonable train/validation/test split?
2. What's the difference between a parameter and a hyperparameter? Give one example of each.
3. Your model has 95% training accuracy but 60% test accuracy. What's happening? Name two ways to fix it.
4. Why do we use mini-batches instead of the full dataset for each gradient update?
5. A model predicts house prices. Should you use MAE or Binary Cross-Entropy as your loss function? Why?
6. Explain the learning rate in one sentence. What happens if it's too large? Too small?

<details>
<summary>Answers</summary>

1. 80/10/10 — with 50K rows, 10% = 5,000 examples which is plenty for validation and test.
2. Parameter: learned from data (e.g., weights in a neural net). Hyperparameter: set before training (e.g., learning rate, number of layers).
3. Overfitting. Fix with: more training data, regularization (L1/L2/dropout), simpler model, early stopping.
4. Mini-batches balance speed (one example is noisy) and stability (full dataset is slow). They also utilize GPU parallelism efficiently.
5. MAE — this is a regression task (predicting a continuous number). Binary Cross-Entropy is for classification.
6. The learning rate controls how big each step is during gradient descent. Too large: overshoots and never converges. Too small: converges extremely slowly.
</details>

---

**Previous:** [Chapter 3 — Introduction](03_introduction.md)
**Next:** [Chapter 5 — Data Preprocessing](05_data_preprocessing.md)
