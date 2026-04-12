# Math Fundamentals for Machine Learning & AI

> "Don't panic. Math is just counting, measuring, and finding patterns.
> You already do it every day — you just don't call it math."

**What this document covers:**
Every math concept you need for ML and AI — from vectors to backpropagation, from Bayes' theorem to Adam optimizer. Each concept is explained first like you're 10, then with the real formula, then with a step-by-step example.

**How to use this document:**
- Each section starts with a **Simple Explanation** (a story or analogy)
- Then the **Official Math** (formula and definition)
- Then a **Step-by-Step Example** (plug in real numbers)
- Then **Where It's Used in ML** (why you should care)

---

## Table of Contents

| Part | Topic | Key Concepts |
|------|-------|--------------|
| 1 | Linear Algebra | Vectors, matrices, dot product, matrix multiplication, norms, eigenvalues, SVD, PCA |
| 2 | Calculus | Derivatives, partial derivatives, chain rule, gradients, backpropagation |
| 3 | Probability & Statistics | Distributions, Bayes' theorem, expected value, variance, correlation, CLT, MLE, hypothesis testing |
| 4 | Optimization | Gradient descent, learning rate, momentum, Adam, regularization |
| 5 | Information Theory | Entropy, cross-entropy, KL divergence |
| 6 | Numerical Methods | Floating point, log-sum-exp trick, mixed precision |
| 7 | Quick Reference | All formulas in one table |

---

# PART 1: LINEAR ALGEBRA

> Linear algebra is the language of data. Every image, every sentence, every dataset
> is stored as numbers in rows and columns. Every ML operation is just math on those numbers.

---

## 1.1 Scalars, Vectors, Matrices, and Tensors

**Simple Explanation:**
Think of organizing your toys.

A **scalar** is ONE toy. Just one thing. Like the number 5.

A **vector** is a row of toys on a shelf. Like [red car, blue car, green car] — it's a list in order.

A **matrix** is a whole toybox with rows and columns — like a grid of cubbies, each holding one toy.

A **tensor** is a room full of toyboxes. A toybox of toyboxes. It goes as many layers deep as you want.

```
  SCALAR: A single number.
  ────────────────────────────────────────────
  x = 5
  Learning rate = 0.001
  Temperature = 0.7
  
  Just one value. Like your age, or the temperature outside.


  VECTOR: A list of numbers (in order).
  ────────────────────────────────────────────
  v = [3, 7, 1]          (3 numbers → "3-dimensional")
  w = [0.2, -0.5, 0.8]   (3 numbers in a row)

  Think of it as a recipe: [flour, sugar, eggs] = [2 cups, 1 cup, 3]
  The ORDER matters — you can't swap them around.

  In ML: a word embedding is a vector of 768-12288 numbers
  that captures the "meaning" of a word.


  MATRIX: A grid of numbers (rows x columns).
  ────────────────────────────────────────────
  A = | 1  2  3 |       This is a 2x3 matrix (2 rows, 3 columns)
      | 4  5  6 |

  Think of it as a spreadsheet:
  Row 1 = Student 1's scores: Math=1, Science=2, English=3
  Row 2 = Student 2's scores: Math=4, Science=5, English=6

  In ML: your entire dataset is a matrix.
  Rows = samples (people, images, sentences)
  Columns = features (height, weight, age)


  TENSOR: A stack of matrices. Or a cube. Or higher.
  ────────────────────────────────────────────
  Think of it like this:
  0D = one number           (a single grade)
  1D = a list               (one student's grades)
  2D = a spreadsheet         (all students' grades)
  3D = a binder of spreadsheets (grades for every class)
  4D = a shelf of binders    (grades for every school)

  In ML:
  - A color photo = 3D (height x width x 3 colors)
  - A batch of photos = 4D (batch x height x width x 3 colors)
  - A batch of sentences = 3D (batch x words x embedding size)

  PyTorch and TensorFlow are named after tensors!
```

---

## 1.2 Vector Operations

### Vector Addition and Subtraction

**Simple Explanation:**
You and your friend both have piggy banks. You have [5 dollars, 3 quarters] and your friend has [2 dollars, 7 quarters]. Together you have [5+2, 3+7] = [7 dollars, 10 quarters]. Just add matching slots!

```
  a = [1, 3, 5]
  b = [2, 4, 6]

  a + b = [1+2, 3+4, 5+6] = [3, 7, 11]
  a - b = [1-2, 3-4, 5-6] = [-1, -1, -1]

  In ML: Adding bias to a layer: output = Wx + b
```

### Scalar Multiplication

**Simple Explanation:**
If you have [2 apples, 4 oranges, 6 bananas] and someone says "triple it," you get [6 apples, 12 oranges, 18 bananas]. Multiply every item by the same number.

```
  a = [2, 4, 6]
  3 x a = [6, 12, 18]

  In ML: Learning rate x gradient = how much to adjust weights.
  weights = weights - 0.01 x gradient
```

### Dot Product — The Most Important Operation in ML

**Simple Explanation:**
Imagine you're at a store. You buy 3 apples at $1 each, 2 bananas at $0.50 each, and 1 milk at $3.

Your items: [3, 2, 1]. Prices: [$1, $0.50, $3].

Total cost = (3 x $1) + (2 x $0.50) + (1 x $3) = $3 + $1 + $3 = $7.

That's a dot product! Multiply matching items, add them all up, get ONE number.

**Formula:** a . b = a1xb1 + a2xb2 + a3xb3 + ...

```
  a = [1, 2, 3]
  b = [4, 5, 6]

  a . b = (1x4) + (2x5) + (3x6) = 4 + 10 + 18 = 32

  WHY IT'S EVERYWHERE IN ML:
  ─────────────────────────
  1. NEURONS: output = dot(weights, inputs) + bias
     weights = [0.5, -0.3, 0.8]
     inputs  = [1.0, 2.0, 0.5]
     output  = (0.5x1.0) + (-0.3x2.0) + (0.8x0.5) = 0.5 - 0.6 + 0.4 = 0.3

  2. ATTENTION in Transformers: score = dot(query, key)

  3. SIMILARITY: cosine similarity uses dot product

  4. PREDICTION: linear regression y = dot(w, x) + b
```

### Vector Norms — Measuring Length

**Simple Explanation:**
A "norm" is just a fancy word for "how big is this vector?" Like asking "how far from home are you?"

There are different ways to measure distance:
- **L1 norm** = Manhattan distance. Like walking on a city grid — count every block.
  Go 3 blocks east, then 4 blocks north = 3 + 4 = 7 blocks total.
- **L2 norm** = Straight-line distance. Like a bird flying directly.
  3 blocks east and 4 blocks north = 5 blocks (Pythagorean theorem: 3-4-5 triangle!)
- **Max norm** = The biggest single step. 3 east and 4 north → max is 4.

```
  L1 NORM (Manhattan distance):
  |v| = |v1| + |v2| + ... + |vn|

  v = [3, -4, 5]
  |v|_1 = |3| + |-4| + |5| = 3 + 4 + 5 = 12

  In ML: L1 regularization — pushes many weights to exactly zero (sparse models).


  L2 NORM (Euclidean / straight-line distance):
  |v| = sqrt(v1^2 + v2^2 + ... + vn^2)

  v = [3, 4]
  |v|_2 = sqrt(9 + 16) = sqrt(25) = 5

  In ML: L2 regularization — pushes all weights to be small.


  MAX NORM:
  |v|_inf = max(|v1|, |v2|, ..., |vn|)

  v = [3, -7, 5]
  |v|_inf = max(3, 7, 5) = 7

  In ML: Gradient clipping — cap the biggest gradient value.
```

### Cosine Similarity

**Simple Explanation:**
Imagine two flashlights shining from the same spot. Cosine similarity asks: "Are they pointing in the same direction?" It doesn't care how bright they are (vector length) — only which way they point (direction).

- Both pointing the same way = 1 (identical direction)
- Pointing at right angles = 0 (completely unrelated)
- Pointing opposite ways = -1 (opposite meaning)

This is how computers decide if two words mean similar things!

```
  cosine_sim(a, b) = (a . b) / (|a| x |b|)

  EXAMPLE:
  a = [1, 2, 3]
  b = [2, 4, 6]     (b is just 2x bigger than a — same direction!)

  a . b = (1x2) + (2x4) + (3x6) = 2 + 8 + 18 = 28
  |a| = sqrt(1+4+9) = sqrt(14) = 3.742
  |b| = sqrt(4+16+36) = sqrt(56) = 7.483

  cosine_sim = 28 / (3.742 x 7.483) = 28 / 28 = 1.0  (perfect match!)

  EXAMPLE 2:
  a = [1, 0]      (pointing right)
  b = [0, 1]      (pointing up)

  a . b = 0
  cosine_sim = 0   (completely unrelated — right angles)

  In ML: Embedding similarity (are two words/sentences related?),
  recommendation systems, RAG retrieval, search engines.
```

---

## 1.3 Matrix Operations

### Matrix Multiplication — The Core Operation

**Simple Explanation:**
Imagine you're ordering food for a party. You need food for 2 groups:
- Group 1 wants: 1 pizza, 2 sodas, 3 cookies
- Group 2 wants: 4 pizzas, 5 sodas, 6 cookies

Prices are: pizza=$7, soda=$2, cookie=$1.

Group 1 total = (1x$7) + (2x$2) + (3x$1) = $7 + $4 + $3 = $14
Group 2 total = (4x$7) + (5x$2) + (6x$1) = $28 + $10 + $6 = $44

That's matrix multiplication! Each row of orders times the column of prices = a total.

**The rule:** To multiply A x B, A's number of columns must equal B's number of rows. Each answer cell = dot product of a row from A with a column from B.

```
  A = | 1  2  3 |    (2x3 matrix — 2 groups, 3 items)
      | 4  5  6 |

  B = | 7   8 |      (3x2 matrix — 3 items, 2 price scenarios)
      | 9  10 |
      | 11 12 |

  Result is (2x2):

  C[0][0] = (1x7) + (2x9) + (3x11)  = 7+18+33  = 58
  C[0][1] = (1x8) + (2x10) + (3x12) = 8+20+36  = 64
  C[1][0] = (4x7) + (5x9) + (6x11)  = 28+45+66 = 139
  C[1][1] = (4x8) + (5x10) + (6x12) = 32+50+72 = 154

  C = | 58   64 |
      | 139  154 |

  WHY THIS IS THE HEART OF ML:
  ─────────────────────────────
  EVERY neural network layer = a matrix multiplication.
  Input [1, 2, 3] x Weight matrix = Output [1.4, 3.2]

  GPT-4 does BILLIONS of these per second.
```

### Transpose

**Simple Explanation:**
Imagine your spreadsheet has students as rows and subjects as columns. The transpose FLIPS it — now subjects are rows and students are columns. You turn the table sideways.

```
  A = | 1  2  3 |       A^T = | 1  4 |
      | 4  5  6 |              | 2  5 |
                               | 3  6 |

  (2x3) becomes (3x2). Rows become columns.

  In ML: Used in attention (Q^T x K), computing gradients,
  and converting between row and column vectors.
```

### Identity Matrix and Inverse

**Simple Explanation:**
The **identity matrix** is the "do nothing" matrix. Multiply anything by it and you get the same thing back. It's like multiplying a number by 1 — nothing changes.

The **inverse matrix** is the "undo" matrix. If matrix A transforms your data, then A-inverse puts it back the way it was. Like Ctrl+Z for math.

```
  IDENTITY MATRIX (the number "1" for matrices):
  I = | 1  0  0 |
      | 0  1  0 |
      | 0  0  1 |

  A x I = A    (just like 5 x 1 = 5)


  INVERSE MATRIX (the "undo" button):
  A x A^(-1) = I

  Not all matrices have an inverse!
  If a matrix has NO inverse, it's called "singular" —
  it squishes things flat and you can't unsquish.

  In ML: Linear regression closed-form solution uses matrix inverse.
```

### Determinant

**Simple Explanation:**
The determinant is a single number that tells you: "Does this matrix squish things or not?"

- Determinant = 0 means the matrix SQUISHES everything flat (like pressing a 3D object into a pancake). Information is lost. BAD.
- Determinant != 0 means the matrix is healthy — it transforms things without squishing. GOOD.
- The bigger the determinant, the more the matrix stretches things.

```
  For a 2x2 matrix:
  det | a  b | = ad - bc
      | c  d |

  EXAMPLE:
  det | 3  2 | = (3x5) - (2x4) = 15 - 8 = 7
      | 4  5 |

  Determinant is 7 (not zero) → this matrix is invertible!

  EXAMPLE:
  det | 2  4 | = (2x2) - (4x1) = 4 - 4 = 0
      | 1  2 |

  Determinant is 0 → this matrix SQUISHES things flat. Not invertible!
  (Notice row 1 = 2 x row 2 — they carry the same information.)

  In ML: Checking if covariance matrices are valid,
  Gaussian distribution formula uses determinant.
```

---

## 1.4 Eigenvalues and Eigenvectors

**Simple Explanation:**
Imagine you have a magic stretchy mirror. When you hold up most objects, the mirror changes both their size AND direction. But some special objects — the "eigenvectors" — only change SIZE, not direction. They point the same way, just bigger or smaller.

The "eigenvalue" is HOW MUCH bigger or smaller. An eigenvalue of 3 means the eigenvector gets stretched to 3x its original length. An eigenvalue of 0.5 means it shrinks to half.

**Official Math:** A x v = lambda x v

"When matrix A multiplies eigenvector v, the result is just v scaled by eigenvalue lambda."

```
  EXAMPLE:
  A = | 2  1 |    v = | 1 |    lambda = 3
      | 1  2 |        | 1 |

  Check: A x v = | 2x1 + 1x1 | = | 3 | = 3 x | 1 | = lambda x v  YES!
                 | 1x1 + 2x1 |   | 3 |       | 1 |

  The vector [1, 1] still points in the same direction after A.
  It just got 3x longer.


  FINDING EIGENVALUES:
  Solve: det(A - lambda x I) = 0

  A - lambda x I = | 2-lambda    1      |
                   | 1           2-lambda|

  det = (2-lambda)^2 - 1 = lambda^2 - 4*lambda + 3 = 0
  (lambda-1)(lambda-3) = 0
  lambda = 1 or lambda = 3


  WHY THIS MATTERS:
  ─────────────────
  1. PCA: Eigenvectors = the "important directions" in your data
     Eigenvalues = how important each direction is

  2. STABILITY: If eigenvalues > 1, things EXPLODE (exploding gradients)
     If eigenvalues < 1, things VANISH (vanishing gradients)

  3. GOOGLE PAGERANK: PageRank = the dominant eigenvector of the web link matrix!
```

---

## 1.5 SVD (Singular Value Decomposition)

**Simple Explanation:**
SVD is like taking apart a LEGO castle into its basic building steps. Any matrix (no matter how complicated) can be broken into 3 simple pieces:

1. **Rotate** the data
2. **Stretch** it (make some directions bigger, some smaller)
3. **Rotate** it again

The stretching amounts (called "singular values") tell you which directions are important. Big stretch = important direction. Tiny stretch = not important, can be thrown away.

This is how Netflix recommends movies! SVD on the "users x movies" rating matrix finds hidden patterns like "action lover" or "comedy fan."

**Formula:** A = U x Sigma x V^T

```
  A = U x Sigma x V^T

  U = rotation 1
  Sigma = stretch amounts (diagonal, sorted biggest to smallest)
  V^T = rotation 2

  WHY SVD MATTERS:
  ────────────────
  1. COMPRESSION: Keep only the top-k stretch amounts → approximate
     the original matrix with WAY fewer numbers.
     A 1000x1000 image with rank-50 SVD = 10x compression!

  2. RECOMMENDATION SYSTEMS: Netflix Prize used SVD

  3. LoRA fine-tuning: LoRA decomposes weight updates into two
     small matrices — this IS truncated SVD. This is how you
     fine-tune a 70B model on a laptop!
```

---

## 1.6 PCA (Principal Component Analysis)

**Simple Explanation:**
Imagine you're looking at a cloud of dots in 3D space, but the cloud is actually FLAT — like a frisbee floating in the air at an angle. PCA figures out which direction the frisbee is tilted, then flattens everything onto 2D. You went from 3 numbers per dot to 2, and barely lost any information!

PCA answers: "What are the most important directions in my data?" Then it throws away the unimportant directions to simplify things.

```
  STEP-BY-STEP:
  ─────────────
  1. CENTER the data (subtract the average from everything)
  2. COMPUTE the covariance matrix (how do features move together?)
  3. FIND eigenvectors and eigenvalues of the covariance matrix
  4. PICK the top-k eigenvectors (the most important directions)
  5. PROJECT the data onto those directions → fewer dimensions!

  EXAMPLE:
  Data has 2 features. Eigenvalues are 8.88 and 0.18.
  First direction explains 8.88 / (8.88 + 0.18) = 98% of the variance!
  Keep just 1 dimension. Drop from 2D to 1D. Lose only 2% of info.

  USED FOR:
  - Reduce 1000 features to 50 (speeds up training dramatically)
  - Visualize high-dimensional data (project to 2D for plotting)
  - Remove noise (small eigenvalues = noise)
  - Face recognition (Eigenfaces)
```

---

# PART 2: CALCULUS — HOW MODELS LEARN

> Calculus answers one question: "If I change this setting a tiny bit, how much does the result change?"
> This is how models figure out which way to adjust their settings to get better.

---

## 2.1 Derivatives — The Rate of Change

**Simple Explanation:**
You're in a car. The **speedometer** shows your derivative — how fast your position is changing.

- Position = where you are (the function)
- Speed = how fast position changes (the derivative)
- Acceleration = how fast speed changes (the second derivative)

A derivative tells you: "If I nudge the input a tiny bit, how much does the output move?"

If the derivative is BIG, a small nudge causes a big change.
If the derivative is ZERO, you're at a flat spot (a peak, valley, or plateau).

```
  THE BASIC IDEA:
  f(x) = x^2      (a simple curve)
  f'(x) = 2x      (the derivative — how steep the curve is at each point)

  At x=3: f'(3) = 6
  Meaning: the curve is going UP steeply (slope of 6)

  At x=0: f'(0) = 0
  Meaning: the curve is FLAT (the bottom of the bowl!)


  COMMON DERIVATIVES (cheat sheet):
  ──────────────────────────────────
  f(x) = 5 (constant)  → f'(x) = 0       (flat line, no change)
  f(x) = x             → f'(x) = 1       (straight line, constant slope)
  f(x) = x^2           → f'(x) = 2x      (parabola)
  f(x) = x^n           → f'(x) = n*x^(n-1) (power rule — the most useful!)
  f(x) = e^x           → f'(x) = e^x     (e is special — its own derivative!)
  f(x) = ln(x)         → f'(x) = 1/x


  RULES FOR COMBINING:
  ────────────────────
  Sum rule:     (f + g)' = f' + g'           (add derivatives)
  Product rule: (f x g)' = f'g + fg'         (more complex)
  Chain rule:   (f(g(x)))' = f'(g(x)) x g'(x)  (MOST IMPORTANT for ML!)

  EXAMPLE:
  f(x) = 3x^2 + 5x - 7
  f'(x) = 6x + 5

  WHY THIS MATTERS: Derivatives tell the model which direction to adjust
  each weight to reduce the error. That's the heart of all ML training.
```

---

## 2.2 Partial Derivatives — Multiple Variables

**Simple Explanation:**
Imagine a thermostat that depends on TWO dials: one for the heater and one for the air conditioner. A partial derivative asks: "If I turn JUST the heater dial a tiny bit (keeping the AC fixed), how much does the temperature change?"

In ML, the "temperature" is the loss (error), and the "dials" are the model's weights. There might be billions of dials! A partial derivative tells you what happens when you turn just ONE dial.

```
  f(x, y) = x^2 + 3xy + y^2

  Partial derivative with respect to x (treat y as a constant):
  df/dx = 2x + 3y

  Partial derivative with respect to y (treat x as a constant):
  df/dy = 3x + 2y

  At (x=1, y=2):
  df/dx = 2(1) + 3(2) = 8    (turning the x-dial changes f by ~8)
  df/dy = 3(1) + 2(2) = 7    (turning the y-dial changes f by ~7)

  ML CONNECTION:
  Loss L depends on ALL weights (w1, w2, ..., wn).
  dL/dw3 = "How much does the loss change if I adjust just w3?"
  
  GPT-3 has 175 BILLION weights.
  We compute 175 billion partial derivatives every training step!
```

---

## 2.3 The Chain Rule — The Engine of Backpropagation

**Simple Explanation:**
Imagine a chain of dominoes: Push domino A, which hits B, which hits C, which hits D.

If pushing A makes B move 3x as far, and B makes C move 2x as far, and C makes D move 5x as far... then pushing A makes D move 3 x 2 x 5 = 30x as far.

That's the chain rule! To find how the beginning affects the end, multiply all the "effects" along the chain.

A neural network IS a chain of layers. The chain rule lets you figure out how changing a weight in the first layer affects the final output.

```
  THE FORMULA:
  If y = f(g(x)), then:
  dy/dx = (dy/dg) x (dg/dx)

  "Multiply the effects along the chain"


  NEURAL NETWORK EXAMPLE:
  x → [layer 1] → a → [layer 2] → b → [loss] → L

  dL/dx = (dL/db) x (db/da) x (da/dx)

  Each factor is a local effect. Multiply them all = total effect.


  THIS IS BACKPROPAGATION:
  ─────────────────────────
  Forward pass:  x → compute a → compute b → compute Loss
  Backward pass: dL/dL=1 → dL/db → dL/da → dL/dx

  Each layer computes its local derivative and passes it backward.
  That's why it's called "BACK-propagation" — chain rule going backwards.


  NUMERICAL EXAMPLE:
  ──────────────────
  Input x = 2
  Layer 1: a = 3x + 1 = 7        (da/dx = 3)
  Layer 2: b = a^2 = 49           (db/da = 2a = 14)
  Loss:    L = b - 50 = -1        (dL/db = 1)

  Backprop:
  dL/db = 1
  dL/da = dL/db x db/da = 1 x 14 = 14
  dL/dx = dL/da x da/dx = 14 x 3 = 42

  Meaning: if x increases by 0.01, Loss increases by 0.42.
```

---

## 2.4 Gradients — The Direction to Walk

**Simple Explanation:**
You're blindfolded on a hilly field and want to find the lowest valley. You can feel the ground under your feet and tell which direction is downhill.

The **gradient** is a compass that always points UPHILL. To go downhill (reduce the loss), walk in the OPPOSITE direction of the gradient.

```
  The GRADIENT = a vector of ALL partial derivatives.
  It points in the direction of steepest INCREASE.

  For f(x, y) = x^2 + y^2:
  gradient = [2x, 2y]

  At point (3, 4): gradient = [6, 8]   (uphill is this way!)
  To go DOWNHILL: walk in direction [-6, -8]


  GRADIENT DESCENT (how models learn):
  ────────────────────────────────────
  new_weights = old_weights - learning_rate x gradient

  At (3, 4) with learning_rate = 0.1:
  new_x = 3 - 0.1 x 6 = 2.4
  new_y = 4 - 0.1 x 8 = 3.2

  f(3, 4) = 9 + 16 = 25
  f(2.4, 3.2) = 5.76 + 10.24 = 16.0

  Loss decreased from 25 to 16! Repeat thousands of times → reach the valley.
```

---

## 2.5 Jacobian and Hessian

**Simple Explanation:**
The **Jacobian** is a big table of first derivatives when you have multiple inputs AND multiple outputs. It tells you: "If I tweak each input a little, how does each output change?"

The **Hessian** is a table of SECOND derivatives. It tells you about the SHAPE of the landscape — is it a bowl (good, minimum nearby), a hilltop (bad), or a saddle (tricky)?

```
  JACOBIAN (first derivatives, multi-input multi-output):
  f1(x,y) = x^2 + y
  f2(x,y) = xy

  J = | df1/dx  df1/dy | = | 2x  1 |
      | df2/dx  df2/dy |   |  y  x |

  In ML: Each layer's backward pass computes a Jacobian-vector product.


  HESSIAN (second derivatives — curvature):
  f(x,y) = x^2 + 3xy + 2y^2

  H = | d^2f/dx^2    d^2f/dxdy | = | 2  3 |
      | d^2f/dydx    d^2f/dy^2 |   | 3  4 |

  Tells you the SHAPE of the loss surface:
  - Bowl shape (positive definite) → you're near a minimum
  - Hilltop (negative definite) → you're at a maximum
  - Saddle (mixed) → flat but not a minimum, need to escape

  In ML: Second-order optimizers use the Hessian for faster convergence.
  But it's expensive (n^2 elements), so most people use Adam instead.
```

---

## 2.6 Backpropagation — A Complete Example

**Simple Explanation:**
Backpropagation is just the chain rule applied step-by-step through a neural network. Each layer asks: "How much did I contribute to the final error?" and then adjusts its weights to contribute less error next time.

Think of it like a relay race. If your team lost by 10 seconds, you figure out how many seconds EACH runner lost, and each runner practices to improve by that amount.

```
  FORWARD PASS (compute the prediction):
  ────────────────────────────────────────
  Input:      x = 2
  Weights:    w1 = 0.5,  w2 = -0.3,  b1 = 0.1,  b2 = 0.2
  Target:     1.0

  Hidden:     h = w1*x + b1 = 0.5*2 + 0.1 = 1.1
  Activation: a = ReLU(h) = max(0, 1.1) = 1.1
  Output:     o = w2*a + b2 = -0.3*1.1 + 0.2 = -0.13
  Loss:       L = (o - target)^2 = (-0.13 - 1.0)^2 = 1.277

  BACKWARD PASS (figure out who's responsible):
  ──────────────────────────────────────────────
  dL/do  = 2(o - target) = 2(-1.13) = -2.26

  dL/dw2 = dL/do x a     = -2.26 x 1.1 = -2.486
  dL/db2 = dL/do x 1     = -2.26

  dL/da  = dL/do x w2    = -2.26 x (-0.3) = 0.678
  dL/dh  = dL/da x 1     = 0.678  (ReLU derivative = 1 when h > 0)

  dL/dw1 = dL/dh x x     = 0.678 x 2 = 1.356
  dL/db1 = dL/dh x 1     = 0.678

  UPDATE WEIGHTS (learning rate = 0.01):
  ──────────────────────────────────────
  w1 = 0.5   - 0.01 x 1.356   = 0.4864
  b1 = 0.1   - 0.01 x 0.678   = 0.0932
  w2 = -0.3  - 0.01 x (-2.486) = -0.275
  b2 = 0.2   - 0.01 x (-2.26)  = 0.2226

  Repeat for millions of examples. The model learns!
```

---

# PART 3: PROBABILITY & STATISTICS

> Probability is how models deal with uncertainty. "I'm 90% sure this is a cat" is a probability.
> Every prediction is a probability. Every training step uses probability.

---

## 3.1 Random Variables

**Simple Explanation:**
A random variable is just a number that depends on chance. Flip a coin — you might get 0 (tails) or 1 (heads). Roll a dice — you get 1 through 6. That's a random variable.

**Discrete** = can only be certain values (1, 2, 3... like number of siblings)
**Continuous** = can be ANY value (your exact height, like 170.347cm)

```
  DISCRETE EXAMPLE:
  X = number of heads in 3 coin flips
  P(X=0) = 1/8     (TTT — only one way)
  P(X=1) = 3/8     (HTT, THT, TTH — three ways)
  P(X=2) = 3/8     (HHT, HTH, THH — three ways)
  P(X=3) = 1/8     (HHH — only one way)

  CONTINUOUS EXAMPLE:
  X = height of a random person
  P(X = exactly 170.000cm) = 0   (any EXACT value = zero probability)
  P(170 < X < 175) = some %      (a RANGE has real probability)
```

---

## 3.2 Probability Distributions

### Bernoulli — One Coin Flip

**Simple Explanation:**
One coin flip. One try. Yes or no. Heads or tails. Spam or not spam. That's Bernoulli.

```
  P(success) = p
  P(failure) = 1 - p

  Fair coin: p = 0.5
  Spam detector: p = 0.3 (30% chance it's spam)

  Mean: p        Variance: p(1-p)

  In ML: Binary classification output. "Is this email spam? 73% yes."
```

### Binomial — Many Coin Flips

**Simple Explanation:**
Flip a coin 10 times. How many heads? That's binomial. It's just "do a Bernoulli trial N times and count the successes."

```
  P(k successes in n trials) = C(n,k) x p^k x (1-p)^(n-k)

  C(n,k) = n! / (k! x (n-k)!)  ("n choose k" — how many ways to arrange k wins in n trials)

  EXAMPLE: Flip fair coin 10 times. P(exactly 7 heads)?
  P = C(10,7) x 0.5^7 x 0.5^3 = 120 x 0.0078 x 0.125 = 0.117 (11.7%)

  Mean: np = 10 x 0.5 = 5 (expect 5 heads on average)

  In ML: Model accuracy over N test samples follows a binomial distribution.
```

### Gaussian (Normal) — The Bell Curve

**Simple Explanation:**
This is THE most famous distribution. It looks like a bell — most values are near the middle, and extreme values are rare. Heights, test scores, measurement errors — they all follow a bell curve.

Why? Because whenever something is the SUM of many small random effects (genetics + nutrition + environment for height), the result is always a bell curve. Always! This is called the Central Limit Theorem and it's like magic.

```
  Two settings control the bell:
  mu (mean) = where the center is
  sigma (std dev) = how wide the bell is

  THE 68-95-99.7 RULE:
  68% of data within mu +/- 1 sigma
  95% of data within mu +/- 2 sigma
  99.7% of data within mu +/- 3 sigma

  If average height = 170cm and sigma = 10cm:
  68% of people are between 160-180cm
  95% of people are between 150-190cm
  99.7% of people are between 140-200cm

  In ML: Weight initialization, noise modeling, batch normalization,
  variational autoencoders. It's EVERYWHERE.
```

### Poisson — Counting Rare Events

**Simple Explanation:**
How many text messages do you get per hour? Some hours 0, some hours 3, rarely 10. Poisson models this kind of "how many times does something happen in a fixed time?"

```
  lambda = average number of events per period

  EXAMPLE: Average 3 website hits per second. P(exactly 5)?
  P(X=5) = (3^5 x e^(-3)) / 5! = 243 x 0.0498 / 120 = 10.1%

  Fun fact: Mean = Variance = lambda (both equal!)

  In ML: Modeling count data (word frequencies, event logs).
```

### Categorical — Multiple Choices

**Simple Explanation:**
A loaded dice with K faces. Or picking a word from a dictionary. Each choice has a different probability, and they all add up to 100%.

```
  P("the") = 0.05, P("cat") = 0.02, ..., P("Paris") = 0.40

  This IS what an LLM outputs — a probability for every word
  in its vocabulary (~50,000 words). Pick one based on probabilities.

  In ML: Softmax output = categorical distribution over classes.
```

---

## 3.3 Expected Value, Variance, and Correlation

### Expected Value (Average)

**Simple Explanation:**
If you played a game 1000 times, how much would you win ON AVERAGE? That's the expected value. It's the "center of gravity" of all possible outcomes.

```
  E[X] = sum of (each value x its probability)

  EXAMPLE: Roll a fair dice.
  E[X] = (1 x 1/6) + (2 x 1/6) + (3 x 1/6) + (4 x 1/6) + (5 x 1/6) + (6 x 1/6)
       = 21/6 = 3.5

  You'd never actually roll 3.5, but on average over many rolls, that's the center.
```

### Variance (Spread)

**Simple Explanation:**
Two archers both hit the target on average (same expected value). But one is consistent (arrows close together) and one is wild (arrows all over). Variance measures how SPREAD OUT the results are.

Low variance = predictable, consistent.
High variance = unpredictable, all over the place.

```
  Var(X) = E[(X - mean)^2] = "average of squared distances from the mean"

  EXAMPLE:
  Values: 1, 2, 3, 4 (each with probability 0.25)
  Mean = 2.5
  Var = [(1-2.5)^2 + (2-2.5)^2 + (3-2.5)^2 + (4-2.5)^2] / 4
      = [2.25 + 0.25 + 0.25 + 2.25] / 4 = 1.25

  Standard deviation = sqrt(1.25) = 1.118 (same units as the data)
```

### Covariance and Correlation

**Simple Explanation:**
**Covariance** asks: "When one thing goes up, does the other go up too?"

- Taller people tend to weigh more → positive covariance
- More exercise tends to mean less body fat → negative covariance
- Shoe size and favorite color → zero covariance (no relationship)

**Correlation** is covariance but scaled to always be between -1 and +1, so it's easier to compare.

```
  Cov(X, Y) > 0: X and Y increase together
  Cov(X, Y) = 0: X and Y are unrelated
  Cov(X, Y) < 0: when X goes up, Y goes down

  CORRELATION (Pearson's r) = Cov(X,Y) / (std(X) x std(Y))
  Range: -1 to +1

  r = +1.0  Perfect positive (X up → Y up, always)
  r = +0.7  Strong positive
  r =  0.0  No relationship
  r = -0.7  Strong negative
  r = -1.0  Perfect negative (X up → Y down, always)

  CAUTION: Correlation does NOT mean causation!
  Ice cream sales and drowning are correlated.
  But ice cream doesn't cause drowning. Both increase in summer.

  In ML: Feature selection, understanding data, detecting multicollinearity.
```

---

## 3.4 Bayes' Theorem — Updating Beliefs with Evidence

**Simple Explanation:**
You hear a barking sound. Before looking, you think "probably a dog" (your PRIOR belief — 90% dog, 10% something else). Then you look and see a leash on the ground. A leash makes dogs MORE likely (EVIDENCE). Now you update to "99% sure it's a dog" (your POSTERIOR belief).

Bayes' theorem is the math for updating beliefs when new evidence arrives.

```
  P(A|B) = P(B|A) x P(A) / P(B)

  P(A)   = PRIOR — what you believed before seeing evidence
  P(B|A) = LIKELIHOOD — how likely the evidence is IF A is true
  P(A|B) = POSTERIOR — your updated belief AFTER seeing evidence
  P(B)   = EVIDENCE — total probability of seeing this evidence

  EXAMPLE: Medical test
  - Disease affects 1% of population:  P(disease) = 0.01
  - Test is 99% accurate when sick:    P(positive | disease) = 0.99
  - Test has 5% false positive rate:   P(positive | healthy) = 0.05

  You test positive. P(actually sick)?

  P(disease | positive) = P(positive | disease) x P(disease) / P(positive)
  P(positive) = 0.99 x 0.01 + 0.05 x 0.99 = 0.0099 + 0.0495 = 0.0594
  P(disease | positive) = 0.0099 / 0.0594 = 16.7%

  Even with a positive test, you're probably fine!
  (Because the disease is rare, most positives are false alarms.)

  In ML: Naive Bayes classifier, Bayesian optimization for hyperparameters,
  MAP estimation, in-context learning in LLMs.
```

---

## 3.5 Central Limit Theorem (CLT)

**Simple Explanation:**
This is the closest thing to magic in statistics. Take ANY random process — dice rolls, coin flips, weird distributions, anything. Average enough of them together, and the result ALWAYS looks like a bell curve.

It doesn't matter what the original shape is! Average enough random numbers and you get a bell curve. Always. This is why the Gaussian distribution is everywhere.

```
  THE THEOREM:
  Average of N random samples → Gaussian as N gets large.
  Works for ANY starting distribution!

  VISUAL:
  Original (uniform):   ████████████        (flat)
  Average of 2:         ▄██████▄            (triangle-ish)
  Average of 5:         ▂▄██████▄▂          (bell-ish)
  Average of 30:        ▁▂▃▅████▅▃▂▁        (very Gaussian!)

  The average is centered at the true mean, with spread = sigma / sqrt(N).
  More samples → tighter bell → more precise estimate!

  WHY IT MATTERS FOR ML:
  1. Mini-batch gradient: average gradient over batch is approximately correct
  2. Confidence intervals for model metrics
  3. A/B testing relies on CLT
  4. Why Gaussian assumptions work so well in practice
```

---

## 3.6 MLE (Maximum Likelihood Estimation)

**Simple Explanation:**
You find a coin and flip it 10 times: 7 heads, 3 tails. What's the probability of heads for THIS coin?

MLE says: "Find the probability that makes the data you SAW most likely." If you saw 7/10 heads, then p=0.7 makes that data most likely. That's your answer!

```
  MLE: Find parameters that maximize P(data | parameters)

  In practice, maximize log-likelihood (easier math, same answer):
  theta* = argmax SUM of log P(each data point | theta)

  THIS IS LLM PRE-TRAINING:
  theta* = argmax SUM of log P(next_word | previous_words, theta)
         = argmin SUM of -log P(next_word | previous_words, theta)
         = argmin cross-entropy loss

  MLE + a prior belief about parameters = MAP (Maximum A Posteriori):
  L2 regularization = assuming weights should be small (Gaussian prior)
  L1 regularization = assuming many weights should be zero (Laplace prior)
```

---

## 3.7 Hypothesis Testing — Is This Result Real or Luck?

**Simple Explanation:**
You change your model and accuracy goes from 92% to 93%. Is this a real improvement, or just random luck? Hypothesis testing answers this.

Think of it like a court trial:
- **Null hypothesis (H0)** = "The defendant is innocent" (no real difference)
- You look at the evidence (the data)
- **P-value** = "How likely is this evidence if the defendant IS innocent?"
- If the p-value is tiny (< 0.05), you reject innocence → "The improvement is real!"
- If the p-value is big, you can't be sure → "Not enough evidence"

```
  STEP 1: H0 = "No real difference" vs H1 = "There IS a difference"
  STEP 2: Choose threshold (alpha = 0.05 means "I accept 5% chance of being wrong")
  STEP 3: Compute p-value
  STEP 4: If p-value < 0.05 → "Statistically significant!"

  EXAMPLE:
  Model A: 920/1000 correct (92.0%)
  Model B: 935/1000 correct (93.5%)

  P-value = 0.197 (19.7%)
  0.197 > 0.05 → NOT significant!
  The 1.5% improvement could easily be random noise.
  Need more data or a bigger improvement.

  COMMON MISTAKES:
  ────────────────
  - p-value is NOT "probability the null is true"
  - "Not significant" means "not enough evidence," NOT "no effect"
  - Statistical significance does NOT mean practical significance
    (p=0.001 with 0.01% accuracy gain is useless)

  In ML: Comparing models, A/B testing in production,
  validating that improvements are real and not noise.
```

---

# PART 4: OPTIMIZATION — MAKING MODELS LEARN

---

## 4.1 Gradient Descent

**Simple Explanation:**
You're blindfolded on a mountain and want to reach the valley. You can feel the slope under your feet. Strategy: always take a step downhill. Keep going until you stop going down. That's gradient descent!

The question is: how BIG should each step be?

```
  THE FORMULA:
  new_weights = old_weights - learning_rate x gradient

  THREE VERSIONS:
  ────────────────

  BATCH: Look at ALL examples, compute average slope, take one step.
  + Smooth, reliable direction
  - VERY slow (must see every example before one step)

  SGD (Stochastic): Look at ONE random example, step immediately.
  + Very fast
  - Noisy! Zigzags a lot because one example is a poor guide

  MINI-BATCH (the standard): Look at a small group (32-256 examples), step.
  + Best of both worlds: fast AND reasonably smooth
  + GPU-friendly (batch matrix operations)
  This is what everyone actually uses.
```

---

## 4.2 Learning Rate

**Simple Explanation:**
The learning rate controls how big each step is. Like walking vs running vs jumping.

Too small = taking baby steps. You'll get there eventually, but it takes forever.
Too big = jumping. You overshoot the valley and bounce around wildly. May never arrive!
Just right = normal walking. Steady progress toward the valley.

```
  TOO SMALL (lr = 0.00001): Takes forever to converge.
  TOO LARGE (lr = 10):      Overshoots, bounces, may diverge!
  JUST RIGHT (lr = 0.001):  Converges smoothly.

  LEARNING RATE SCHEDULES:
  Start big (explore), then shrink (fine-tune near the answer).

  Warmup: Start near 0, ramp up, then decay.
  This "warmup + cosine decay" is used by nearly all modern LLMs.

  learning rate
  |      /--\
  |     /    \___
  |    /         \____
  |   / warmup  decay  \______
  |__/                         
  └─────────────────────────────  training step
```

---

## 4.3 Momentum

**Simple Explanation:**
Imagine rolling a ball down a bumpy hill. Without momentum, the ball stops at every tiny bump. WITH momentum, the ball builds up speed and rolls right over small bumps.

Momentum remembers which direction you've been going and keeps rolling that way, even if the current gradient is noisy or bumpy.

```
  SGD with Momentum:
  velocity = 0.9 x old_velocity + gradient
  weights = weights - learning_rate x velocity

  The 0.9 means "remember 90% of the previous direction."
  This smooths out the zigzagging of regular SGD.
```

---

## 4.4 Adam Optimizer

**Simple Explanation:**
Adam is the "smart" optimizer that most people use. It combines two ideas:

1. **Momentum** — remember which direction you've been going (smooths out noise)
2. **Adaptive rate** — give each weight its OWN learning rate. Weights that get big gradients take smaller steps. Weights that get tiny gradients take bigger steps.

It's like having a personal trainer for each of your billions of weights.

```
  Adam = Adaptive Moment Estimation

  Default settings (almost always work):
  learning_rate = 0.001
  beta1 = 0.9  (momentum)
  beta2 = 0.999 (adaptive rates)

  WHY ADAM IS GREAT:
  - Adaptive: each parameter gets its own learning rate
  - Momentum: smooths noisy gradients
  - Works out of the box with default settings
  - Used for training GPT, BERT, LLaMA, most LLMs

  WHEN TO USE WHAT:
  ─────────────────
  Adam/AdamW:  Default choice. Fast. Works with default params.
  SGD+Momentum: Sometimes generalizes better. Needs more tuning.
```

---

## 4.5 Regularization — Preventing Overfitting

**Simple Explanation:**
Imagine a student who memorizes every answer in the textbook word-for-word. They ace the practice test (training data) but fail the real exam (test data) because they never actually UNDERSTOOD the material. That's overfitting.

Regularization is like telling the student: "You're not allowed to memorize. Keep your notes SHORT (small weights). Only write down what's actually important."

```
  L1 REGULARIZATION (Lasso):
  ──────────────────────────
  Add sum of |weights| to the loss.
  Effect: pushes many weights to EXACTLY ZERO.
  "Only keep the most important features. Delete the rest."
  
  weights = [0.5, 0.001, -0.8, 0.002, 0.3]
  After L1: [0.4, 0, -0.7, 0, 0.2]  (tiny weights became zero!)


  L2 REGULARIZATION (Ridge / Weight Decay):
  ──────────────────────────────────────────
  Add sum of weights^2 to the loss.
  Effect: pushes all weights to be SMALL (but not zero).
  "Don't let any single weight get too powerful."
  
  weights = [0.5, 0.001, -0.8, 0.002, 0.3]
  After L2: [0.3, 0.0008, -0.5, 0.001, 0.2]  (all shrunk)


  DROPOUT (for neural networks):
  ──────────────────────────────
  During training, randomly "turn off" some neurons (set to 0).
  This forces the network to NOT rely on any single neuron.
  Like studying with random pages torn out — you learn to be robust.
```

---

## 4.6 Convex vs Non-Convex

**Simple Explanation:**
A **convex** function is shaped like a bowl. No matter where you start, rolling downhill always leads to the one and only bottom. Easy!

A **non-convex** function is like a mountain range with many valleys. Rolling downhill might trap you in a small valley, when the REAL bottom is somewhere else entirely.

Neural networks have non-convex loss surfaces. But the good news: in practice, most valleys are "good enough" — nearly as good as the absolute best.

```
  CONVEX:          NON-CONVEX:
    \    /          \   /\  /\   /
     \  /            \ /  \/  \ /
      \/              \/      \/
   (one min)    (local min)(saddle)(global min)

  Linear/logistic regression = convex (guaranteed to find the best answer)
  Neural networks = non-convex (might find a "pretty good" answer)
```

---

# PART 5: INFORMATION THEORY

> Information theory measures surprise and uncertainty. How surprised are you
> when something happens? That surprise IS information.

---

## 5.1 Entropy — Measuring Uncertainty

**Simple Explanation:**
Entropy measures how UNCERTAIN or SURPRISING something is.

If tomorrow's weather is ALWAYS sunny (100% chance), there's zero surprise. Zero entropy. Boring.

If tomorrow could be sunny, rainy, snowy, or a tornado — each equally likely — that's maximum surprise. Maximum entropy. Very unpredictable!

```
  H(X) = -SUM of P(x) x log2(P(x))

  EXAMPLE:
  Fair coin:  P = [0.5, 0.5]
  H = -(0.5 x log2(0.5) + 0.5 x log2(0.5)) = 1.0 bit   (maximum uncertainty!)

  Loaded coin: P = [0.99, 0.01]
  H = -(0.99 x log2(0.99) + 0.01 x log2(0.01)) = 0.08 bits (very predictable)

  In ML: Decision trees maximize information gain (= reduce entropy).
  Perplexity = 2^entropy (how "confused" a language model is).
```

---

## 5.2 Cross-Entropy — THE Training Loss

**Simple Explanation:**
Cross-entropy measures how WRONG your model's predictions are.

If the right answer is "cat" and your model says "cat" with 99% confidence, cross-entropy is tiny (good!). If the model says "cat" with only 10% confidence, cross-entropy is big (bad!).

Cross-entropy = -log(how much probability you gave to the RIGHT answer).

More confident on the right answer = lower loss. Simple!

```
  H(P, Q) = -SUM of P(x) x log Q(x)

  EXAMPLE (3 classes, correct answer is class 2):
  True label: P = [0, 1, 0]
  
  Model confident and correct: Q = [0.01, 0.98, 0.01]
  Loss = -log(0.98) = 0.020  (very low! great prediction)

  Model uncertain: Q = [0.1, 0.7, 0.2]
  Loss = -log(0.7) = 0.357  (medium loss)

  Model wrong: Q = [0.7, 0.1, 0.2]
  Loss = -log(0.1) = 2.303  (high loss! bad prediction)

  This is THE standard loss for ALL classification in deep learning.
  Every LLM is trained to minimize cross-entropy.
```

---

## 5.3 KL Divergence

**Simple Explanation:**
KL divergence measures "how different are two probability distributions?" If your model's predictions perfectly match reality, KL = 0. The more different they are, the bigger KL gets.

```
  KL(P || Q) = SUM of P(x) x log(P(x) / Q(x))

  Always >= 0. Zero only when P = Q (identical).

  KEY RELATIONSHIP:
  Cross-Entropy = Entropy + KL Divergence
  
  Since entropy of the true data is fixed (we can't change reality),
  minimizing cross-entropy = minimizing KL divergence.
  Training = making the model's distribution match reality.

  In ML: RLHF/DPO use KL penalty to keep the model close to its original behavior.
```

---

# PART 6: NUMERICAL METHODS — PRACTICAL MATH

---

## 6.1 Floating Point Precision

**Simple Explanation:**
Computers can't store numbers perfectly. It's like trying to write pi (3.14159265...) — you eventually run out of paper. Computers have a fixed amount of "paper" for each number.

- FP32: ~7 decimal digits of precision (good enough for most things)
- FP16: ~3 decimal digits (less precise, but 2x faster)
- BF16: ~3 digits but handles really big/small numbers better

```
  PROBLEMS THAT HAPPEN:
  
  1. OVERFLOW: e^1000 = way too big → computer says "Infinity"
  2. UNDERFLOW: e^(-1000) = way too small → computer rounds to 0
  3. CANCELLATION: 1.0000001 - 1.0000000 = 0.0000001 
     → most meaningful digits cancel, left with garbage
```

---

## 6.2 The Log-Sum-Exp Trick

**Simple Explanation:**
Softmax involves computing e^(big number), which can overflow to infinity. The trick: subtract the biggest number first. The math gives the SAME answer, but now you're computing e^(small number), which is safe.

It's like instead of measuring how tall mountains are from sea level (huge numbers), you measure how tall they are compared to the tallest one (small numbers).

```
  PROBLEM:
  softmax([1000, 1001, 1002])
  e^1000 = Infinity!  Broken.

  THE TRICK: Subtract the max (1002) first.
  softmax([1000-1002, 1001-1002, 1002-1002])
  = softmax([-2, -1, 0])
  = [0.090, 0.245, 0.665]   Safe!

  Mathematically identical. Numerically stable.
  Used in EVERY softmax, EVERY LLM output, EVERY attention score.

  If you see NaN in your model, check this first!
```

---

## 6.3 Mixed Precision Training

**Simple Explanation:**
Use cheap, fast math (16-bit) for most of the work, but keep a precise backup (32-bit) for the important stuff. Like doing rough calculations on a whiteboard (fast!) but keeping the final answer in a precise calculator.

```
  1. Keep master weights in FP32 (precise backup)
  2. Copy to FP16/BF16 for forward + backward pass (fast!)
  3. Compute gradients in FP16 (fast!)
  4. Update the FP32 master copy with FP16 gradients (precise!)

  Result: Speed of FP16 + Accuracy of FP32.
  Used by virtually all modern LLM training.
  
  FP8 (2024-2025): Even faster on H100/H200 GPUs.
  DeepSeek-V3 used FP8 for training.
```

---

# PART 7: QUICK REFERENCE — ALL FORMULAS

---

### Linear Algebra

| Concept | Formula | ML Use |
|---------|---------|--------|
| Dot product | a . b = SUM(ai x bi) | Neurons, attention |
| Cosine similarity | (a . b) / (\|a\| x \|b\|) | Embeddings, search |
| L1 norm | SUM(\|vi\|) | Lasso regularization |
| L2 norm | sqrt(SUM(vi^2)) | Ridge, distance |
| Matrix multiply | Cij = SUM(Aik x Bkj) | Every neural layer |
| Eigenvalue | Av = lambda v | PCA, PageRank |
| SVD | A = U Sigma V^T | Dim reduction, LoRA |

### Calculus

| Concept | Formula | ML Use |
|---------|---------|--------|
| Power rule | (x^n)' = n x^(n-1) | Gradient computation |
| Chain rule | (f(g))' = f'(g) x g' | Backpropagation |
| Gradient | [df/dx1, df/dx2, ...] | Gradient descent |
| Gradient descent | theta = theta - lr x gradient | ALL model training |

### Probability & Statistics

| Concept | Formula | ML Use |
|---------|---------|--------|
| Bayes' theorem | P(A\|B) = P(B\|A)P(A)/P(B) | Classification, RLHF |
| Expected value | E[X] = SUM(xi x P(xi)) | Loss, reward |
| Variance | Var(X) = E[(X-mu)^2] | LayerNorm, stability |
| Gaussian PDF | (1/(sigma sqrt(2pi))) e^(-(x-mu)^2/(2sigma^2)) | Init, noise, VAE |
| MLE | theta* = argmax SUM log P(xi\|theta) | Pre-training |

### Information Theory

| Concept | Formula | ML Use |
|---------|---------|--------|
| Entropy | H = -SUM P log P | Perplexity, temperature |
| Cross-entropy | H(P,Q) = -SUM P log Q | THE training loss |
| KL divergence | KL(P\|\|Q) = SUM P log(P/Q) | RLHF/DPO penalty |

### Optimization

| Concept | Formula | ML Use |
|---------|---------|--------|
| Softmax | e^(xi) / SUM(e^(xj)) | Output layer, attention |
| Sigmoid | 1 / (1 + e^(-x)) | Binary classification |
| ReLU | max(0, x) | Hidden layer activation |
| Adam | theta = theta - lr x m_hat / (sqrt(v_hat) + eps) | Standard optimizer |
| L1 reg | Loss + lambda SUM\|wi\| | Sparsity |
| L2 reg | Loss + lambda SUM(wi^2) | Weight decay |

---

**Related:** For probability fundamentals with more examples, see the LLM chapter.

**Back to Start:** [README — Table of Contents](README.md)
