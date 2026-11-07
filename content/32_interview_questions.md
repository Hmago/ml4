# Chapter 32 — ML Interview Questions

> The classical machine-learning questions asked in Data Scientist, ML Engineer and AI Engineer
> interviews at Google, Amazon, OpenAI and other top AI companies — fundamentals, statistics,
> deep learning, data and evaluation, ML system design, company-specific questions and ranking metrics.

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  HOW TO USE THIS CHAPTER                                         │
  │                                                                  │
  │  Every question has the same layers, in this order:              │
  │  1. Simple Answer       — the idea with an everyday analogy      │
  │  2. Official Definition — the precise technical wording          │
  │  3. Interview Answer    — "Say this first (30 sec)", then the    │
  │                           key mechanism, trade-offs and numbers  │
  │  4. Likely follow-ups   — what the interviewer asks next         │
  │  5. Trap                — the classic wrong answer, corrected    │
  │  6. Go deeper           — the chapter that teaches it in full    │
  │  Some answers add "Maths in one line" or a runnable example.     │
  │                                                                  │
  │  Two kinds of stars:                                             │
  │  ### Q2. Explain the bias-variance tradeoff. ★★★  ← PRIORITY     │
  │  *[All] | ★★*                        ← tag line: DIFFICULTY      │
  │                                                                  │
  │  Priority:    ★★★ asked in almost every ML interview             │
  │               ★★ asked often      no stars = good to know        │
  │  Difficulty:  ★ easy      ★★ medium      ★★★ hard                │
  │                                                                  │
  │  Companies:   [G] = Google    [A] = Amazon    [O] = OpenAI       │
  │               [All] = asked everywhere                           │
  │               Q37 (G) … Q48 (O) = company-specific questions     │
  └──────────────────────────────────────────────────────────────────┘
```

---

## Study Strategy

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  HOW TO PREPARE — FOUR WEEKS                                     │
  ├──────────────────────────────────────────────────────────────────┤
  │  WEEK 1  Foundations (Q1–Q15)                                    │
  │          Asked in every interview. Know overfitting,             │
  │          bias-variance and gradient descent cold.                │
  │                                                                  │
  │  WEEK 2  Statistics + Deep Learning (Q16–Q30)                    │
  │          Statistics and A/B tests: core for data-science roles.  │
  │          Deep learning: core for ML and AI engineer roles.       │
  │                                                                  │
  │  WEEK 3  Data, Evaluation + System Design (Q31–Q36)              │
  │          System design matters most for senior roles.            │
  │          Practise talking through a design out loud.             │
  │                                                                  │
  │  WEEK 4  Company-Specific + Ranking (Q37–Q49)                    │
  │          Tailor your prep to the target company: read its        │
  │          recent papers and product launches.                     │
  ├──────────────────────────────────────────────────────────────────┤
  │  EVERY ANSWER HAS THE SAME SHAPE                                 │
  │  Say this first (30 sec) → mechanism → real numbers →            │
  │  trade-off → expect the follow-ups → avoid the trap              │
  │                                                                  │
  │  TIPS                                                            │
  │  - Say each 30-second answer out loud, and time it               │
  │  - Draw the picture (curve, tree, table) on the whiteboard       │
  │  - "I don't know" is fine — then reason through it aloud         │
  │  - Tie each answer to a project you have built                   │
  └──────────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

| Part | Topic | Questions |
|------|-------|-----------|
| 1 | ML Fundamentals | Q1 – Q15 |
| 2 | Statistics & Probability | Q16 – Q22 |
| 3 | Deep Learning | Q23 – Q30 |
| 4 | Data, Features & Evaluation | Q31 – Q33 |
| 5 | ML System Design | Q34 – Q36 |
| 6 | Google-Specific | Q37 – Q40 |
| 7 | Amazon-Specific | Q41 – Q43 |
| 8 | OpenAI-Specific | Q44 – Q48 |
| 9 | Ranking & Retrieval Metrics | Q49 |

> **Related banks:** LLM interview questions — [Ch 33](#content/33_llm_interview_questions) and
> [Ch 33b](#content/33b_llm_interview_questions_part2) · Google's ten most-asked ML topics in depth —
> [Ch 34](#content/34_google_top10_ml_interview) and [Ch 34b](#content/34b_google_top10_ml_interview_part2) ·
> the behavioral round — [Ch 02](#content/02_behavioral_interview).

---

# PART 1 — ML Fundamentals

---

### Q1. What is overfitting and underfitting? How do you fix them? ★★★
*[All] | ★*

![Interview card for Q1 Overfitting vs Underfitting: three panels compare an underfit flat line (train 60%, test 58%), a just-right curve (90%, 88%) and an overfit wiggly curve (99%, 62%, gap 37), with the generalization-gap formula, measured polynomial MSEs (degree 1: 0.332/0.301, degree 3: 0.036/0.127, degree 15: 0.012/0.661), follow-ups and the gap trap.](diagrams/iq32_info_q01_overfitting_underfitting_ai.png)

**Simple Answer:**

Imagine studying for a test. If you memorize the practice answers word for word instead of
understanding the ideas, you ace the practice test but fail any new question — that is
**overfitting**. If you barely study, you fail both — that is **underfitting**. The goal is the
student who understood the subject, and the only way to tell them apart is a test they have not seen.

```
  UNDERFITTING              JUST RIGHT                OVERFITTING
  ────────────              ──────────                ───────────
  Train acc: 60%            Train acc: 90%            Train acc: 99%
  Test  acc: 58%            Test  acc: 88%  ✓         Test  acc: 62%
  gap:  2 points            gap:  2 points            gap: 37 points

  too simple: misses        learned the               memorized the
  the real pattern          real pattern              training noise

  FIX: add capacity         ship it, then             FIX: add constraints
  bigger model, better      monitor for drift         more data, L1/L2,
  features, less reg.                                 dropout, early stopping
```

**Official Definition:**

> **Overfitting** is when a model fits its training data — including the noise — so closely that
> it generalizes poorly: low training error, much higher validation error. **Underfitting** is when
> a model is too simple or too constrained to capture the real pattern, so training and validation
> error are both high. Both are judged on data the model never trained on.

> **Maths in one line:** `generalization gap = validation error − training error` — a large gap
> means overfitting; a small gap with high error on both sets means underfitting.

**Interview Answer:**

**Say this first (30 sec):** Overfitting is memorizing: the training score is high and the
validation score much lower — say 99% vs 62%. Underfitting is not learning enough: both scores are
low and close, like 60% and 58%. I diagnose from the train–validation gap and the learning curves,
then apply opposite fixes: constrain an overfit model, add capacity to an underfit one.

| | Overfitting (high variance) | Underfitting (high bias) |
|---|---|---|
| Symptom | Train ≫ validation (99% vs 62%) | Both low and close (60% vs 58%) |
| Loss vs epochs | Validation loss turns up while training loss keeps falling | Both flatten out high |
| Fixes | More data or augmentation, L1/L2, dropout, early stopping, simpler model | Bigger model, better features, train longer, less regularization |
| Will more data help? | Yes — the gap shrinks | Rarely — you need a better model (check a learning curve vs data size) |

- **Measured (Ch 8 §8.13):** 20 noisy sine points, noise floor 0.09 MSE. Train / test MSE: degree 1 = 0.332 / 0.301 (underfit), degree 3 = 0.036 / 0.127, degree 15 = 0.012 / 0.661 (overfit).
- **Overfitting is relative to data size:** the same 10-million-parameter network overfits 1,000 rows and generalizes on 10 million.
- **Diagnose before you fix:** the two cures are opposites — dropout makes an underfitting model worse.

**Likely follow-ups:**

- *Train 99%, validation 98%, production 61% — overfitting?* — No. There is no train–validation gap, so the validation data was contaminated too: that is data leakage or distribution shift, and regularization cannot fix it.
- *In what order do you try the fixes for overfitting?* — Cheapest and safest first: more data or augmentation, early stopping, L2 or dropout, then a simpler model ([Ch 8 §8.15](#content/08_core_concepts)).
- *Don't huge neural networks always overfit?* — Not necessarily: past the point where a model can memorize its data, test error can fall again (deep double descent), and LLMs see most training tokens only once.

**Trap:** Calling a high training score "overfitting" — the signal is the *gap*: 99% train with 62% validation is overfitting, while 99% with 98% is healthy (or leakage, if production then collapses).

**Go deeper:** [Ch 8 §8.13](#content/08_core_concepts) · [Ch 8 §8.4](#content/08_core_concepts) · [Ch 8 §8.14](#content/08_core_concepts) · [Ch 13 §13.9](#content/13_model_evaluation)

---

### Q2. Explain the bias-variance tradeoff. ★★★
*[All] | ★★*

![Interview card for Q2 The Bias-Variance Tradeoff: a 2 by 2 grid of dartboards (low or high bias versus low or high variance: the goal, overfitting, underfitting, worst of both), a chart where bias squared falls and variance rises so total error bottoms out at degree 3 with 0.109 above the 0.09 noise floor, the decomposition formula, a table of bias squared, variance and test MSE for polynomial degrees 1, 3, 9 and 15, follow-ups and the trap.](diagrams/iq32_info_q02_bias_variance_ai.png)

**Simple Answer:**

Picture four darts players aiming at a bullseye. **Bias** is aiming at the wrong spot: every throw
lands in a tight cluster, but off to one side — consistently wrong. **Variance** is a shaky hand: the
throws scatter, and a new round lands somewhere else entirely. A simple model is the steady player
with the wrong aim; a very flexible model is the shaky player. You want the steady hand aimed at the
middle — and in ML, making a model more flexible usually fixes the aim but shakes the hand.

```
                    LOW VARIANCE             HIGH VARIANCE
                    (throws agree)           (throws scatter)
                  ┌───────────────┐        ┌───────────────┐
  LOW BIAS        │               │        │  ×        ×   │
  (aimed at the   │      ×××      │        │      +   ×    │
  bullseye +)     │      ×+×      │        │   ×           │
                  │               │        │        ×    × │
                  └───────────────┘        └───────────────┘
                    ✓ THE GOAL               OVERFITTING
                  ┌───────────────┐        ┌───────────────┐
  HIGH BIAS       │ ×××           │        │ ×   ×         │
  (aimed off      │ ×××   +       │        │       +       │
  the bullseye)   │               │        │×   ×          │
                  │               │        │  ×            │
                  └───────────────┘        └───────────────┘
                    UNDERFITTING             WORST OF BOTH
```

**Official Definition:**

> For squared-error loss, a model's expected error at a point x — averaged over many training sets
> drawn from the same distribution — splits into three parts. **Bias²** is how far the *average*
> model is from the truth (error from wrong assumptions); **variance** is how much models trained on
> different samples disagree (error from sensitivity to the data); **noise** σ² is randomness in the
> label that no model can remove. More flexibility usually lowers bias and raises variance.

> **Maths in one line:** `E[(y − f̂(x))²] = (E[f̂(x)] − f(x))² + Var[f̂(x)] + σ²` — expected test
> error = bias² + variance + irreducible noise, where the average E is over training sets.

**Interview Answer:**

**Say this first (30 sec):** Bias is error from wrong assumptions — a model too simple for the
pattern, wrong in the same way whatever data it sees. Variance is error from sensitivity to the
particular training set — a flexible model that changes a lot when the data changes. For squared
error, expected test error = bias² + variance + noise, so as complexity grows bias falls, variance
rises, and I tune complexity on validation data to minimize the sum.

| Polynomial fit, 20 noisy sine points (Ch 8 §8.14) | Bias² | Variance | + noise 0.09 = test MSE |
|---|---|---|---|
| Degree 1 — too simple | 0.193 | 0.007 | 0.290 |
| Degree 3 — the sweet spot | 0.005 | 0.014 | 0.109 |
| Degree 9 | 0.000 | 0.033 | 0.124 |
| Degree 15 — too flexible | 0.000 | 0.071 | 0.161 |

- **Diagnose:** high bias = training error high and close to validation error (underfitting); high variance = a large train–validation gap (overfitting) — see Q1.
- **Lower bias:** a more flexible model, better features, less regularization, boosting.
- **Lower variance:** more data, regularization, bagging/averaging, early stopping, dropout, fewer features.
- **Fine print:** the split is exact only for squared error (0-1 loss and cross-entropy have no clean additive version); "noise" is irreducible only *given these features*.

**Likely follow-ups:**

- *Which ensemble attacks which term?* — Bagging averages deep, high-variance trees, so it cuts variance; boosting adds shallow trees fitted to the remaining errors, so it cuts bias (Q6).
- *Why doesn't a 100-billion-parameter LLM just overfit?* — It trains on trillions of tokens, mostly seen once (Chinchilla's rule of thumb is about 20 tokens per parameter), and past the interpolation threshold test error can fall again — deep double descent.
- *How would you measure bias and variance?* — Refit the model on many resampled training sets, predict the same test points, then bias² = (mean prediction − truth)² and variance = the spread of the predictions (the Ch 8 §8.14 program does exactly this).

**Trap:** Saying "error = bias + variance" or "lowering one always raises the other" — it is bias² + variance + noise, and more data lowers variance without adding bias (better features can lower bias without adding variance).

**Go deeper:** [Ch 8 §8.14](#content/08_core_concepts) · [Ch 8 §8.13](#content/08_core_concepts) · [Ch 13 §13.9](#content/13_model_evaluation) · [Ch 10 §10.8](#content/10_supervised_learning) · [Ch 34 Topic 1](#content/34_google_top10_ml_interview)

---

### Q3. Explain gradient descent and its variants. ★★★
*[All] | ★★*

![Interview card for Q3 Gradient Descent and Its Variants: three loss-versus-updates charts compare batch GD (smooth, 1 update per epoch), SGD (jagged, 1,000 updates per epoch) and mini-batch (B = 32 to 512, 16 updates per epoch at B = 64, what everyone runs), the update rule w minus alpha times the averaged batch gradient, a learning-rate strip on (w - 5) squared, a table of loss after 1 epoch on 1,000 rows (1.716, 0.243, 0.273, floor 0.241), follow-ups and the SGD convergence trap.](diagrams/iq32_info_q03_gradient_descent_ai.png)

**Simple Answer:**

You are lost on a hill in thick fog and want to reach the lowest valley. You can't see far, but you
can feel which way the ground slopes under your feet, so you take a step downhill, feel again, and
repeat. That is gradient descent. Two choices define the variants: **how big each step is** (the
learning rate) and **how much of the hill you feel before each step** — all the data, one example,
or a small batch.

```
  BATCH GD                 STOCHASTIC GD (SGD)      MINI-BATCH GD
  all N rows per update    1 row per update         B rows per update
                                                    (B = 32–512 typical)

  loss                     loss                     loss
  │╲                       │╲ ╱╲                    │╲
  │ ╲                      │ ╲  ╲╱╲                 │ ╲
  │  ╲                     │       ╲╱╲╱╲╱╲╱╲╱       │  ╲╱╲
  │   ╲__________          │                        │     ╲__________
  └─────────── updates     └─────────── updates     └─────────── updates

  smooth, exact gradient,  cheap, noisy steps;      averages away most
  but only 1 update per    keeps bouncing at a      of the noise; fills
  pass over the data       fixed learning rate      a GPU ← what everyone runs
```

**Official Definition:**

> **Gradient descent** is a first-order iterative method that minimizes a differentiable loss by
> repeatedly stepping against its gradient, scaled by a learning rate α. The variants differ in how
> many training examples estimate each gradient — all N (**batch**), one (**stochastic**) or a
> mini-batch of B (**mini-batch**) — and in the update rule built on top (**momentum**, **Adam**,
> **AdamW**).

> **Maths in one line:** `w ← w − α · (1/B) Σᵢ ∇Lᵢ(w)` — average the gradient over a batch of B
> examples and step downhill by α; B = N is batch GD, B = 1 is SGD, anything between is mini-batch.

**Interview Answer:**

**Say this first (30 sec):** Gradient descent trains a model by repeatedly stepping against the
gradient of the loss: w ← w − α∇L(w). The variants differ in how much data estimates each gradient:
batch GD uses all N examples — exact, but one update per pass; SGD uses one — cheap but noisy;
mini-batch uses 32–512 and is what everyone runs, usually with Adam or AdamW on top. The learning
rate α is the knob that matters most.

| Same 1,000 rows, lr 0.1 (Ch 8 §8.11) | Rows per update | Updates per epoch | Training loss after 1 epoch (floor 0.241) |
|---|---|---|---|
| Batch GD | 1,000 | 1 | 1.716 — still 0.265 after 10 epochs |
| Mini-batch | 64 | 16 | 0.243 |
| SGD | 1 | 1,000 | 0.273 — then bounces between 0.25 and 0.44 |

- **Learning rate:** on L(w) = (w − 5)², α = 0.1 closes 20% of the gap per step, α = 0.01 still has loss 11.1 after 20 steps, and α > 1 diverges.
- **Optimizers on top:** momentum (β = 0.9 ≈ remembers the last 10 gradients); Adam adds per-weight step sizes (defaults α 0.001, β₁ 0.9, β₂ 0.999); AdamW adds decoupled weight decay — the Transformer default.
- **Batch size and learning rate move together:** k× the batch → about k× the learning rate for SGD, √k× for Adam, with warmup; gradient noise only falls as 1/√B.
- **Scale:** classic models use B = 32–512 examples; LLMs count tokens — Llama 3 405B grew from 4M to 16M tokens per step.

**Likely follow-ups:**

- *Does gradient descent find the global minimum?* — Only for convex losses (linear and logistic regression, SVMs). Neural-network losses are non-convex; saddle points, not local minima, are the usual stalls, and momentum carries you through them.
- *You move from batch 64 on one GPU to 512 on eight. What else changes?* — Raise the learning rate (×8 for SGD, about ×2.8 for Adam) with warmup; you also get 8× fewer updates per epoch.
- *Adam or AdamW?* — AdamW. In Adam an L2 penalty is divided by the same √v̂ as the gradient, so heavily updated weights barely decay; AdamW applies the decay to the weight directly.

**Trap:** "SGD never converges" — at a fixed learning rate it keeps bouncing around the minimum, but with a decaying learning-rate schedule it settles; and the "SGD" in PyTorch or Keras is really mini-batch SGD.

**Go deeper:** [Ch 8 §8.9](#content/08_core_concepts) · [Ch 8 §8.10](#content/08_core_concepts) · [Ch 8 §8.11](#content/08_core_concepts) · [Ch 16 §1.2](#content/16_deep_learning) · [Ch 16 §1.3](#content/16_deep_learning) · [Ch 34 Topic 2](#content/34_google_top10_ml_interview)

---

### Q4. What is regularization? Compare L1 vs L2. ★★★
*[All] | ★★*

![Interview card for Q4 Regularization L1 vs L2: a diamond L1 constraint whose corner meets the loss ellipse on an axis (w1 = 0 exactly) beside a circular L2 constraint touched between the axes, six example weights after L1 (subtract 0.4, stop at 0: three become 0) and L2 (divide by 1.25, none become 0), the formula total loss = data loss + lambda times penalty, a comparison table (pull, result, duplicated feature 1.6 and 0.0 versus 0.889 and 0.889, shape), follow-ups and the trap that L2 does not select features.](diagrams/iq32_info_q04_l1_vs_l2_ai.png)

**Simple Answer:**

Regularization tells the model: "be as complicated as you like, but every bit of complexity costs
penalty points." That stops it from bending itself around the noise in the training data. L1 and
L2 are two ways of charging for complexity: L1 is a teacher who says "cross out every fact you don't
truly need"; L2 says "keep all your facts, but tone down the dramatic ones".

```
  total loss = data loss + λ × penalty        λ = the price of complexity

  The same six weights, the same strength (Ch 8 §8.15):
  before      2.10    0.30   −4.20   0.050    1.80  −0.010
  L1          1.70    0.00   −3.80   0.000    1.40   0.000   ← subtract 0.4, stop at 0
  L2          1.68    0.24   −3.36   0.040    1.44  −0.008   ← divide by 1.25, never 0

  Why: L1 pulls every weight toward 0 with the same force ±λ, all the way;
       L2 pulls with force 2λw, which fades as the weight shrinks.
```

**Official Definition:**

> **Regularization** is any change to training that reduces overfitting by limiting the model's
> effective complexity; the classic form adds a penalty on the weights to the loss. **L1 (Lasso)**
> adds λ Σ|wᵢ| and drives some weights to exactly zero — a sparse model with built-in feature
> selection. **L2 (Ridge, or weight decay)** adds λ Σwᵢ² and shrinks all weights smoothly toward
> zero. The strength λ is a hyperparameter chosen on validation data.

> **Maths in one line:** `total loss = data loss + λ × penalty(w)`, with penalty `Σ|w|` for L1 or
> `Σw²` for L2 — the model must now trade fitting the data against keeping its weights small, and λ
> sets the exchange rate.

**Interview Answer:**

**Say this first (30 sec):** Regularization trades a little training fit for better generalization
by adding a complexity penalty: loss + λ × penalty. L2 adds λΣw² and shrinks every weight smoothly —
it is the default, and with plain SGD it is exactly weight decay. L1 adds λΣ|w|; its constant pull
drives weak weights to exactly zero, so it doubles as feature selection. I choose λ by
cross-validation, after standardizing the features.

| | L1 (Lasso) | L2 (Ridge / weight decay) |
|---|---|---|
| Pull on each weight (penalty gradient) | Constant ±λ, all the way to 0 | 2λw — fades as w shrinks |
| Result | Exact zeros: sparse, built-in feature selection | All weights small, none exactly 0 |
| Two copies of one feature (Ch 8 §8.15) | 1.6 and 0.0 — keeps one, arbitrarily | 0.889 and 0.889 — shares it |
| Shape of the constraint | Diamond — its corners lie on the axes | Circle — no corners |
| Bayesian view (MAP estimate) | Laplace prior on the weights | Gaussian prior on the weights |

- **Elastic Net** mixes both (scikit-learn's `l1_ratio`): L1's sparsity plus L2's stability when features are correlated.
- **Scale first:** the penalty depends on units — a length in millimetres needs a 1,000× smaller weight than in metres. Standardize inside a Pipeline.
- **scikit-learn names:** `alpha` = λ in Ridge and Lasso; `C` = 1/λ in LogisticRegression and SVC. LogisticRegression is L2-regularized by default (C = 1.0); since version 1.8, `l1_ratio` replaces the deprecated `penalty`.
- **Neural networks:** weight decay (with AdamW), dropout (p ≈ 0.1 in Transformers, 0.3–0.5 in big dense layers), early stopping and data augmentation do the same job.

**Likely follow-ups:**

- *Why does L1 give exact zeros and L2 doesn't?* — L1's gradient is a constant ±λ, so it pulls at full strength until the weight reaches zero, and solvers pin it there (soft-thresholding). L2's pull 2λw shrinks with the weight, so it approaches zero but never arrives.
- *2,000 rows, 5,000 candidate features, only a few matter — which one?* — L1 (Elastic Net if the features are correlated): it zeroes the useless features, while L2 keeps all 5,000 non-zero.
- *Is L2 the same as weight decay?* — With plain SGD, yes: w ← (1 − 2ηλ)·w − η·∇loss (η = learning rate). Under Adam the penalty is rescaled per weight, so use AdamW, which decays the weight directly.

**Trap:** Saying L2 "removes useless features" — it shrinks weights toward zero but almost never exactly to zero; only L1's constant pull produces exact zeros, so only L1 selects features.

**Go deeper:** [Ch 8 §8.15](#content/08_core_concepts) · [Ch 10 §10.9](#content/10_supervised_learning) · [Ch 12 §12.3](#content/12_key_algorithms) · [Ch 14 §14.7](#content/14_neural_networks) · [Ch 34 Topic 3](#content/34_google_top10_ml_interview)

---

### Q5. What is cross-validation? Why is it important?
*[All] | ★*

![Interview card for Q5 Cross-Validation: a 5-fold grid where the TEST block moves diagonally across Fold 1 to Fold 5 with scores 88, 91, 87, 90 and 89 percent averaging to 89 percent plus or minus 1.4, a wide range bar for a single 80/20 split (0.750 to 0.967) versus a narrow one for the 5-fold CV mean (0.830 to 0.867) over 100 reshuffles of 300 rows, the averaging formula, a table picking StratifiedKFold, GroupKFold, TimeSeriesSplit or LOOCV, follow-ups and the leakage trap (0.98 leaky vs 0.49 in a Pipeline).](diagrams/iq32_info_q05_cross_validation_ai.png)

**Simple Answer:**

Before a big exam, one practice test can mislead you — maybe it happened to be unusually easy. Take
five different practice tests and average the scores, and you know far better where you stand.
Cross-validation does this for a model: it rotates which part of the data plays the exam, so every
row is tested once and one lucky split cannot fool you.

```
  5-FOLD CROSS-VALIDATION on 10 rows (each fold holds out 2 rows)
  ─────────────────────────────────────────────────────────────────
  Full data:  [1][2][3][4][5][6][7][8][9][10]

  Fold 1:  TEST=[1,2]    TRAIN=[3,4,5,6,7,8,9,10]  → score 88%
  Fold 2:  TEST=[3,4]    TRAIN=[1,2,5,6,7,8,9,10]  → score 91%
  Fold 3:  TEST=[5,6]    TRAIN=[1,2,3,4,7,8,9,10]  → score 87%
  Fold 4:  TEST=[7,8]    TRAIN=[1,2,3,4,5,6,9,10]  → score 90%
  Fold 5:  TEST=[9,10]   TRAIN=[1,2,3,4,5,6,7,8]   → score 89%

  CV score = (88 + 91 + 87 + 90 + 89) / 5 = 89% ± 1.4%
             (± = std across the 5 folds; every row tested exactly once)
```

**Official Definition:**

> **K-fold cross-validation** splits the data into K roughly equal folds, trains the model K times —
> each time on K − 1 folds — and scores it on the held-out fold, so every row is tested exactly once.
> The mean of the K scores estimates how the whole *modelling recipe* performs on unseen data, with
> much less variance than a single train/test split. It is used to compare models and choose
> hyperparameters; an untouched test set still gives the number you report.

> **Maths in one line:** `CV score = (score₁ + score₂ + … + score_K) / K` — train K times, score
> each time on a different held-out fold, and average; every row is tested exactly once.

**Interview Answer:**

**Say this first (30 sec):** Cross-validation estimates how a model will do on unseen data by
rotating the test set: split the data into K folds — usually 5 or 10 — train on K − 1, score on the
held-out fold, repeat K times and average. Every row gets tested once, so the estimate no longer
hinges on one lucky or unlucky split. I use it to compare models and tune hyperparameters, then
confirm once on an untouched test set.

| Data | Splitter (scikit-learn) | Why |
|---|---|---|
| Classification, independent rows | `StratifiedKFold`, K = 5 or 10 | Keeps the class ratio in every fold (5% fraud → about 5% per fold) |
| Several rows per patient or user | `GroupKFold` | The same entity never lands on both sides |
| Time series | `TimeSeriesSplit` — never shuffle | Always train on the past, test on the next block |
| Fewer than ~100 rows | LOOCV, or repeated stratified K-fold | Trains on almost all the data; LOOCV costs N fits |

- **Cost:** K training runs (5-fold = 5×). Nested CV — tune in an inner loop, score in an outer one — costs 5 × 5 × 20 configurations = 500 fits.
- **Everything that learns goes inside the fold:** on pure noise, selecting features on all rows before CV scored 0.98; the same steps in a Pipeline scored an honest 0.49 (Ch 13 §13.7).
- **scikit-learn defaults:** `cross_val_score(model, X, y, cv=5)` uses StratifiedKFold for classifiers; `KFold` does not shuffle unless `shuffle=True`.
- **The ± is not a confidence interval:** the K training sets overlap, so the fold spread understates the true uncertainty — no unbiased estimator of K-fold CV's variance exists (Bengio & Grandvalet, 2004).

**Worked example:** 5-fold CV written out by hand, then the same data reshuffled 100 times to see how far a single 80/20 split and the 5-fold average move.

```python
# A single 80/20 split is luck: 5-fold CV by hand, then 100 reshuffles of the same 300 rows
import numpy as np

rng = np.random.default_rng(0)
n = 300                                          # 300 rows, 5 features, noisy labels
X = rng.normal(size=(n, 5))
y = (X @ np.array([1.0, -1.0, 0.5, 0.0, 0.0]) + rng.normal(0, 1, n) > 0).astype(int)

def fit_score(train, test):                      # least-squares linear classifier; test accuracy
    A = np.c_[X[train], np.ones(len(train))]
    w = np.linalg.lstsq(A, 2 * y[train] - 1, rcond=None)[0]
    return np.mean((np.c_[X[test], np.ones(len(test))] @ w > 0) == y[test])

def kfold_scores(k, seed):                       # shuffle, cut into k folds; each fold is the test set once
    folds = np.array_split(np.random.default_rng(seed).permutation(n), k)
    return [fit_score(np.concatenate(folds[:i] + folds[i + 1:]), folds[i]) for i in range(k)]

scores = kfold_scores(5, seed=0)
print("5-fold scores: " + ", ".join(f"{s:.3f}" for s in scores)
      + f"  ->  mean {np.mean(scores):.3f} ± {np.std(scores):.3f} (std across folds)")

runs = [kfold_scores(5, seed) for seed in range(100)]   # reshuffle the rows 100 times
single = [r[0] for r in runs]                    # a single 80/20 split = one fold on its own (60 test rows)
cv5 = [np.mean(r) for r in runs]                 # the 5-fold average
for name, v in [("single 80/20 split", single), ("5-fold CV mean", cv5)]:
    print(f"{name:18s} over 100 reshuffles: {min(v):.3f} to {max(v):.3f}  (std {np.std(v):.3f})")

p = np.mean(cv5)                                 # binomial error bar for accuracy on 60 test rows
print(f"rule of thumb: std = sqrt(p(1-p)/n_test) = sqrt({p:.2f} x {1 - p:.2f} / 60)"
      f" = {np.sqrt(p * (1 - p) / 60):.3f}")
assert np.std(cv5) < np.std(single) / 2          # averaging the 5 folds removes most of the luck
```

**Output:**

```
5-fold scores: 0.867, 0.867, 0.833, 0.817, 0.850  ->  mean 0.847 ± 0.019 (std across folds)
single 80/20 split over 100 reshuffles: 0.750 to 0.967  (std 0.040)
5-fold CV mean     over 100 reshuffles: 0.830 to 0.867  (std 0.007)
rule of thumb: std = sqrt(p(1-p)/n_test) = sqrt(0.85 x 0.15 / 60) = 0.046
```

A single 80/20 split scored anywhere from 0.750 to 0.967 — a 22-point lottery decided by which 60
rows happened to be tested. The 5-fold average stayed between 0.830 and 0.867, and the binomial rule
predicts the single split's wobble (0.046) before you run anything.

**Likely follow-ups:**

- *Why K = 5 or 10 rather than leave-one-out?* — Larger K trains on more data (a less pessimistic estimate) but costs more fits, and LOOCV's estimate is noisy; 5–10 is the usual sweet spot, LOOCV only for tiny datasets.
- *How do you tune hyperparameters and still report an honest score?* — Nested CV, or tune with CV on the training data and touch a held-out test set exactly once.
- *After CV, which model do you ship?* — None of the K fold models: refit the chosen configuration on all the training data. CV scored the recipe, not one particular model.

**Trap:** Scaling, selecting features or oversampling on the full dataset and *then* cross-validating — every test fold has already been seen; put those steps in a Pipeline so they are refit inside each training fold.

**Go deeper:** [Ch 13 §13.7](#content/13_model_evaluation) · [Ch 13 §13.8](#content/13_model_evaluation) · [Ch 8 §8.3](#content/08_core_concepts) · [Ch 8 §8.4](#content/08_core_concepts) · [Ch 13 §13.10](#content/13_model_evaluation)

---

### Q6. Explain the difference between bagging and boosting. ★★★
*[All] | ★★*

![Interview card Q6 Bagging vs Boosting: bagging trains deep trees in parallel on bootstrap samples and averages them, cutting variance from 0.093 to 0.043; boosting chains shallow trees that each fit the residuals and sums them, cutting bias squared from 0.058 to 0.002. Shows Var = rho sigma squared + (1 - rho) sigma squared / B and F_m(x) = F_(m-1)(x) + eta h_m(x), a bias and variance table for 1 stump, 200 boosted stumps, 1 deep tree and 50 bagged trees, follow-ups and the weak-learner trap.](diagrams/iq32_info_q06_bagging_vs_boosting_ai.png)

**Simple Answer:**

Both build a team of models. **Bagging** is a crowd guessing the number of sweets in a jar: each
person looks from a slightly different angle, guesses independently, and you average — the too-high
and too-low guesses cancel out. **Boosting** is a relay of tutors: the first answers everything, the
second studies only what the first got wrong, the third what is still wrong, and their answers are
added up. Bagging steadies a jittery model; boosting sharpens a crude one.

```
  BAGGING (e.g. Random Forest)          BOOSTING (e.g. XGBoost, LightGBM)
  ────────────────────────────          ─────────────────────────────────
  trees built in PARALLEL               trees built in SEQUENCE

  bootstrap sample 1 → deep tree 1      shallow tree 1 → errors left
  bootstrap sample 2 → deep tree 2      shallow tree 2 fits them → errors
  bootstrap sample 3 → deep tree 3      shallow tree 3 fits what is left
           ↓                                     ↓
     VOTE / AVERAGE                     SUM: F = F₀ + η·h₁ + η·h₂ + η·h₃

  each tree: low bias, high variance    each tree: high bias, low variance
  averaging cuts VARIANCE               each round cuts BIAS
  adding trees does not overfit         too many rounds overfit → early stop
  shrugs off noisy labels               chases noisy labels
```

**Official Definition:**

> **Bagging** (bootstrap aggregating; Breiman, 1996) trains the same high-variance learner — usually
> a deep decision tree — on B bootstrap samples (N rows drawn with replacement) independently, then
> averages or votes; it mainly reduces **variance**. **Boosting** trains weak learners — usually
> shallow trees — one after another, each focused on the current ensemble's errors (re-weighted rows
> in AdaBoost, residuals or negative gradients in gradient boosting), and adds them with weights; it
> mainly reduces **bias**. Only boosting is built from *weak* learners.

> **Maths in one line:** bagging `Var(average of B trees) = ρσ² + (1 − ρ)σ²/B`; boosting
> `F_m(x) = F_{m−1}(x) + η · h_m(x)` — averaging shrinks only the part of the trees' error they do
> not share (ρ = their correlation), while boosting adds a small step η toward whatever is still wrong.

**Interview Answer:**

**Say this first (30 sec):** Both combine many trees, but they attack opposite halves of the error.
Bagging trains deep, high-variance trees in parallel on bootstrap samples and averages them, which
cuts variance — that is Random Forest. Boosting trains shallow, high-bias trees in sequence, each
fitting what the ensemble still gets wrong, which cuts bias — XGBoost, LightGBM, CatBoost. Boosting
usually has the higher accuracy ceiling on tabular data but needs early stopping and tuning; a
Random Forest is the robust, low-tuning baseline.

| | Bagging (Random Forest) | Boosting (XGBoost, LightGBM) |
|---|---|---|
| Base learner | Deep tree: low bias, high variance | Shallow tree (depth 3–8; AdaBoost uses stumps): high bias |
| How the trees relate | Independent bootstrap samples — trainable in parallel | Sequential: each tree fits the current residuals (negative gradients) |
| Main effect | Variance ↓ — but never below ρσ² | Bias ↓ — each round removes part of what is still wrong |
| Overfitting | Adding trees does not overfit; out-of-bag error is free validation | Too many rounds overfit → early stopping on a validation set |
| Noisy labels | Robust | Chases them (AdaBoost up-weights them every round) |

- **Why Random Forest decorrelates its trees:** with ρ = 0.3, even 100 trees keep 0.3 + 0.7/100 = 0.307 of one tree's variance; random feature subsets at each split (√p features for classification) lower ρ.
- **Boosting recipe:** learning rate 0.1 (then 0.03), a generous tree count and early stopping; η = 0.1 with 100 trees behaves much like η = 0.01 with 1,000.
- **Speed:** boosting rounds are sequential, but XGBoost and LightGBM parallelize the split search inside each tree across CPU cores.
- **2026 practice:** gradient-boosted trees are still the default for tabular data; tabular foundation models such as TabPFN now lead on small tables (Ch 12 §12.10).

**Worked example:** refit four tree models on 30 fresh training sets from a noisy sine curve and split each model's error into bias² and variance.

```python
# Bagging cuts variance, boosting cuts bias: 4 tree models refit on 30 fresh training sets
import numpy as np

rng = np.random.default_rng(0)
def f(x):
    return np.sin(2 * np.pi * x)                 # true pattern; label noise 0.3 -> error floor 0.3² = 0.09
x_test = np.linspace(0.05, 0.95, 50)

def stump(x, r):                                 # best one-split tree for targets r (least squares)
    o = np.argsort(x); xs, c, k = x[o], np.cumsum(r[o]), np.arange(1, len(x))
    left, right = c[:-1] / k, (c[-1] - c[:-1]) / (len(x) - k)
    i = np.argmax(k * left**2 + (len(x) - k) * right**2)   # = the split with the smallest squared error
    return lambda z: np.where(z <= (xs[i] + xs[i + 1]) / 2, left[i], right[i])

def deep_tree(x, y):                             # fully grown 1-D tree: one training row per leaf
    o = np.argsort(x)
    return lambda z: y[o][np.searchsorted((x[o][:-1] + x[o][1:]) / 2, z)]

def boosting(x, y, rounds=200, eta=0.1):         # each stump fits what is still wrong (the residuals)
    F, F_test = np.full(len(x), y.mean()), np.full(len(x_test), y.mean())
    for _ in range(rounds):
        h = stump(x, y - F)
        F, F_test = F + eta * h(x), F_test + eta * h(x_test)
    return F_test

def bagging(x, y, trees=50):                     # each deep tree sees a bootstrap sample; average them
    samples = [rng.integers(0, len(x), len(x)) for _ in range(trees)]
    return np.mean([deep_tree(x[s], y[s])(x_test) for s in samples], axis=0)

models = {"1 stump": lambda x, y: stump(x, y)(x_test), "boosting: 200 stumps": boosting,
          "1 deep tree": lambda x, y: deep_tree(x, y)(x_test), "bagging: 50 deep trees": bagging}
preds = {name: [] for name in models}
for _ in range(30):                              # 30 training sets of 100 noisy rows
    x = rng.uniform(0, 1, 100)
    y = f(x) + rng.normal(0, 0.3, 100)
    for name, fit_predict in models.items():
        preds[name].append(fit_predict(x, y))

print(f"{'model':24s}{'bias²':>7s}{'variance':>10s}{'test MSE':>10s}")   # test MSE = bias² + variance + 0.09
res = {}
for name, P in preds.items():
    P = np.array(P)                              # 30 training sets x 50 test points
    res[name] = (np.mean((P.mean(axis=0) - f(x_test)) ** 2), np.mean(P.var(axis=0)))
    print(f"{name:24s}{res[name][0]:7.3f}{res[name][1]:10.3f}{sum(res[name]) + 0.09:10.3f}")
assert res["boosting: 200 stumps"][0] < res["1 stump"][0] / 5         # boosting removed most of the bias
assert res["bagging: 50 deep trees"][1] < res["1 deep tree"][1] / 2    # bagging removed over half the variance
```

**Output:**

```
model                     bias²  variance  test MSE
1 stump                   0.058     0.034     0.181
boosting: 200 stumps      0.002     0.014     0.106
1 deep tree               0.003     0.093     0.186
bagging: 50 deep trees    0.002     0.043     0.134
```

Boosting cut the stump's bias² from 0.058 to 0.002; bagging cut the deep tree's variance from 0.093
to 0.043 — about half, not to zero, because trees grown on overlapping bootstrap samples are
correlated (the ρσ² floor). With a small learning rate, boosting lowered variance here too.

**Likely follow-ups:**

- *Which do you try first on tabular data?* — A Random Forest as a strong baseline (little tuning, a free out-of-bag score), then LightGBM or XGBoost with early stopping for the higher ceiling (Q7, Q8).
- *Why doesn't bagging help a linear model or a stump much?* — They are stable, high-bias learners: averaging many near-identical predictions changes little. Bagging pays off for unstable, high-variance learners such as deep trees.
- *AdaBoost vs gradient boosting?* — AdaBoost re-weights misclassified rows and gives each learner a vote α = ½ ln((1 − ε)/ε); gradient boosting fits each tree to the negative gradient of any differentiable loss — AdaBoost is its exponential-loss special case.

**Trap:** "Bagging and boosting both combine weak learners" — boosting does; bagging needs low-bias, high-variance learners such as deep trees, because averaging weak stumps just gives an averaged stump with the same bias.

**Go deeper:** [Ch 10 §10.8](#content/10_supervised_learning) · [Ch 12 §12.5](#content/12_key_algorithms) · [Ch 12 §12.6](#content/12_key_algorithms) · [Ch 12 §12.10](#content/12_key_algorithms) · [Ch 8 §8.14](#content/08_core_concepts)

---

### Q7. How does Random Forest work, and why is it better than a single Decision Tree? ★★★
*[All] | ★★*

![Interview card Q7 Random Forest vs One Tree: training data fans out to bootstrap samples (about 63.2% distinct rows, 36.8% out-of-bag), each grows a tree with random sqrt(p) features per split, and all trees feed a vote or average. One deep tree scores 79.8% test accuracy with 10.8% of predictions flipping when 5 of 500 labels flip; the 100-tree forest scores 89.4%, 2.6% flip, out-of-bag 88.2%. Formula Var = rho sigma squared + (1 - rho) sigma squared / B, with random features shrinking the first term and more trees the second.](diagrams/iq32_info_q07_random_forest_ai.png)

**Simple Answer:**

One deep decision tree is like asking one confident friend: they know the facts they studied, but their quirks decide the answer, and a few different facts would change their mind completely.

A Random Forest asks a few hundred friends instead. Each one studied a different random sample of the facts and, at every decision, was allowed to look at only a few random clues. Their personal mistakes point in different directions and cancel when you take the vote; the signal they all share survives.

```
  SINGLE DEEP TREE                      RANDOM FOREST (100 trees)
  ────────────────────────────────      ─────────────────────────────────────
  Trains on all N rows                  Each tree: a BOOTSTRAP sample
                                        (N rows drawn with replacement:
                                         ~63.2% distinct, ~36.8% left out)
  Every split may use every feature     Each split: a RANDOM SUBSET of
                                        features (√p for classification)
  Low bias, but memorises noise         Same low bias, errors cancel in the vote

  Flip 5 of 500 training labels:        Flip the same 5 labels:
  10.8% of test predictions change      2.6% of test predictions change

  Test accuracy 79.8%                   Test accuracy 89.4%  (OOB said 88.2%)
  Variance HIGH                         Variance LOW

  (one synthetic dataset; the program in Ch 10 §10.8 reproduces these numbers)
```

**Official Definition:**

> **Random Forest** (Breiman, 2001) is an ensemble of decision trees, each grown on a bootstrap sample of the rows and choosing every split from a random subset of the features. The forest predicts by majority vote (classification) or by averaging (regression). The two sources of randomness decorrelate the trees, so averaging cuts variance while adding little bias.

> **Maths in one line:** `Var(average of B trees) = ρσ² + (1 − ρ)σ²/B` — with B trees of variance σ² and pairwise correlation ρ, more trees shrink only the second term; only making the trees disagree (smaller ρ) shrinks the first.

**Interview Answer:**

**Say this first (30 sec):** A Random Forest trains a few hundred deep trees, each on a bootstrap sample of the rows and with only a random subset of features allowed at each split, then votes or averages. A deep tree has low bias but high variance; averaging many *decorrelated* trees keeps the low bias and cuts the variance. On Ch 10's dataset that took test accuracy from 79.8% to 89.4% and made the model about 4× more stable.

- **Why random features, not just bootstrap:** if one feature dominates, every bagged tree splits on it first, so the trees stay alike (high ρ). Allowing only √p features per split forces different trees.
- **Out-of-bag (OOB) error:** each tree misses ~36.8% of the rows ((1 − 1/N)^N → e⁻¹); scoring each row with only the trees that missed it is free validation (0.882 vs 0.894 test).
- **Feature importance:** the default (impurity, MDI) favours high-cardinality columns — a random ID scored top MDI 0.439 in Ch 12 but only +0.018 permutation importance. Report permutation importance or SHAP.
- **Costs:** a forest of deep trees is large and slower to serve than one tree, loses the single tree's readability, and its "probabilities" are vote shares that need calibration.

| Knob (scikit-learn) | Default | What it does |
|---|---|---|
| `n_estimators` | 100 | More trees never overfit; returns fade after a few hundred |
| `max_features` | `'sqrt'` (classifier), `1.0` (regressor) | The decorrelation knob: lower = less ρ, more bias; try ~0.33 for regression |
| `max_depth`, `min_samples_leaf` | `None`, 1 | Cap them when the data are noisy |
| `oob_score` | `False` | Set `True` for the free validation estimate |

**Likely follow-ups:**

- *Random Forest or gradient boosting?* — RF averages deep, independent trees (cuts variance, almost no tuning); boosting adds shallow, dependent trees (cuts bias, usually more accurate on tabular data, needs early stopping) — see Q6 and Q8.
- *Can a random forest overfit?* — Adding trees cannot make it overfit. Very deep trees on noisy labels still memorise, so raise `min_samples_leaf` or cap depth and watch the OOB score.
- *Are its probabilities trustworthy?* — Not directly. scikit-learn averages the trees' leaf class fractions, which pulls scores toward the middle; calibrate with Platt or isotonic on held-out data ([Ch 13 §13.12](#content/13_model_evaluation)).

**Trap:** Saying "more trees keep reducing variance" — B only shrinks the (1 − ρ)σ²/B term; the ρσ² floor drops only when the trees disagree, which is exactly what random feature subsets are for.

**Go deeper:** [Ch 12 §12.5](#content/12_key_algorithms) · [Ch 10 §10.8](#content/10_supervised_learning) · [Ch 13 §13.12](#content/13_model_evaluation)

---

### Q8. Explain how XGBoost/Gradient Boosting works. Why is it so powerful? ★★★
*[G][A] | ★★★*

![Interview card Q8 Gradient Boosting and XGBoost: a staircase where tree 1 predicts 70 for a house worth 100 and each next tree fits the error still left, adding 22, 6 and 1.5 to reach 99.5. Shows F_m(x) = F_(m-1)(x) + eta h_m(x) with h_m fit to the negative gradient, an XGBoost log-loss leaf worked by hand (labels 1, 1, 1, 0 at p = 0.5, G = -1.0, H = 1.0, lambda = 1, w* = -G / (H + lambda) = +0.5), a table of what XGBoost adds (regularized objective, shrinkage, missing values, histogram speed), follow-ups and the trees-are-sequential trap.](diagrams/iq32_info_q08_gradient_boosting_xgboost_ai.png)

**Simple Answer:**

Think of a team of editors fixing an essay. The first writes a rough draft; each next editor reads only what is still wrong and fixes a little of it; nobody rewrites the whole thing. After a few hundred small fixes the essay is very good.

Gradient boosting works the same way: a weak first guess, then a chain of small trees, each trained on the errors still left, each added in at a small learning rate. Stop too late and the editors start "fixing" noise.

```
  One house, true price 100 (illustrative numbers)

  Tree 1 (shallow, weak):  predicts 70     → still wrong by 30
  Tree 2 fits that error:  adds     22     → still wrong by  8
  Tree 3 fits that error:  adds      6     → still wrong by  2
  Tree 4 fits that error:  adds      1.5   → still wrong by  0.5
  ─────────────────────────────────────────────────────────────
  Final = 70 + 22 + 6 + 1.5 = 99.5

  Real libraries also SHRINK each correction by a learning rate η:
  F_m(x) = F_{m−1}(x) + η · h_m(x)
  Ch 12's 4 apartments, η = 0.5: sum of squared errors 4.25 → 1.25 → 0.50 → 0.3125
  (the floor is 0.25 — noise the model must NOT chase: stop early)
```

**Official Definition:**

> **Gradient boosting** (Friedman, 2001) builds an additive model one shallow tree at a time: each new tree is fit to the negative gradient of the loss at the current predictions (for squared error, simply the residuals), and only a small step η of it is added. **XGBoost** (Chen & Guestrin, 2016) is a regularized, second-order implementation: it picks splits and leaf values from each row's gradient *and* curvature (Hessian), penalizes the number of leaves and the leaf weights, and adds systems engineering — histogram split search, learned handling of missing values, multithreading and GPUs.

> **Maths in one line:** `F_m(x) = F_{m−1}(x) + η · h_m(x)`, with h_m fit to `r_i = −∂L/∂F(x_i)` (= y − F for squared error) — each tree is one gradient-descent step taken in "function space", shrunk by η.

**Interview Answer:**

**Say this first (30 sec):** Gradient boosting builds trees sequentially: each new shallow tree is fit to what the ensemble still gets wrong — the negative gradient of the loss — and added with a small learning rate, so bias falls step by step. XGBoost makes this accurate and fast: Newton steps that use curvature, L1/L2 penalties on leaf weights plus a cost per leaf, learned directions for missing values, and parallel histogram split search. With early stopping, boosted trees (XGBoost, LightGBM, CatBoost) remain the default for tabular data in 2026.

| What XGBoost adds | How it works | Default |
|---|---|---|
| Second-order (Newton) step | Leaf value `w* = −G / (H + λ)`: sum of gradients over sum of curvatures in the leaf | — |
| Regularized objective | `Ω = γT + ½λ Σ w²` (`alpha` adds an L1 term); a split whose gain is below γ is pruned | λ = 1, α = 0, γ = 0 |
| Shrinkage and sampling | `eta` scales every tree; `subsample`, `colsample_bytree` add randomness | eta 0.3, max_depth 6 |
| Missing values | Each split learns a default branch for missing values from the training loss | NaN = missing |
| Speed | Histogram split search, multithreaded within each tree; `device="cuda"` for GPUs | `hist` since 2.0 |

- **One leaf by hand (log-loss):** labels 1, 1, 1, 0 at p = 0.5 → G = Σ(p − y) = −1.0 and H = Σ p(1 − p) = 1.0, so w* = 1.0 / (1.0 + λ) = +0.5 log-odds at λ = 1.
- **Why it wins on tabular data:** trees need no scaling and capture interactions; boosting removes bias; early stopping caps variance. On small tables, also try a tabular foundation model such as TabPFN ([Ch 12 §12.10](#content/12_key_algorithms)).
- **Tuning order:** fix η (0.1, later 0.03) and let early stopping choose the tree count, rolling back to the best iteration; then depth / `num_leaves`; then subsampling 0.6–0.9; then `reg_alpha` / `reg_lambda`.
- **Costs:** trees cannot be built in parallel, many interacting knobs, and it will fit label noise if you let it run.

**Likely follow-ups:**

- *XGBoost vs LightGBM vs CatBoost?* — Same core loop. LightGBM grows leaf-wise on histograms (fastest on large data); CatBoost uses ordered target statistics for high-cardinality categoricals; XGBoost grows level-wise by default and is the most battle-tested.
- *Why does boosting cut bias while bagging cuts variance?* — Boosting adds shallow, dependent trees, each fixing the remaining error; bagging averages deep, independent trees so their errors cancel (Q6, Q7).
- *Why is it called "gradient" boosting?* — For any differentiable loss, the residual generalizes to the negative gradient: log-loss gives y − p, ranking losses (LambdaMART) give pairwise gradients — one loop, any loss.

**Trap:** Saying "XGBoost trains its trees in parallel" — the trees are strictly sequential, because each one needs the previous ensemble's errors; the parallelism is inside one tree's split search.

**Go deeper:** [Ch 12 §12.6](#content/12_key_algorithms) · [Ch 10 §10.8](#content/10_supervised_learning) · [Ch 12 §12.10](#content/12_key_algorithms)

---

### Q9. What is the difference between a parametric and non-parametric model?
*[G][O] | ★★*

![Interview card Q9 Parametric vs Non-Parametric: a log-scale bar chart of how many numbers each model keeps on 3 features as rows grow from 100 to 1,000 to 10,000 - logistic regression stays at 4, an unpruned tree grows 11, 105, 1,084 splits, and k-NN stores 400, 4,000, 40,000 numbers. Shows parametric size = f(d) versus non-parametric size = f(n, d), notes that trees predict from splits only while k-NN keeps every row, a compare table of examples, data kept, assumptions and failures, follow-ups and the trees-do-not-keep-data trap.](diagrams/iq32_info_q09_parametric_nonparametric_ai.png)

**Simple Answer:**

A parametric model is a fixed recipe with a few adjustable amounts: whether you cook for 10 guests or 10 million, you only tune the same handful of numbers. A non-parametric model has no fixed recipe size: it adds detail as the data grows — a decision tree adds more splits, and k-NN simply keeps every example and looks up the closest ones.

"Non-parametric" does not mean "no parameters". It means their *number* is not fixed before you see the data.

```
  ┌──────────────────────┬──────────────────────────┬─────────────────────────────┐
  │                      │ PARAMETRIC               │ NON-PARAMETRIC              │
  ├──────────────────────┼──────────────────────────┼─────────────────────────────┤
  │ Number of parameters │ Fixed by the model form  │ Grows with the data         │
  │ Size in the program  │ logistic reg.: 4 numbers │ unpruned tree: 11 → 1,084   │
  │ (n = 100 → 10,000)   │ at every n               │ splits; k-NN: 400 → 40,000  │
  ├──────────────────────┼──────────────────────────┼─────────────────────────────┤
  │ Keeps training data  │ No                       │ k-NN, GPs: all rows         │
  │ to predict?          │                          │ kernel SVM: support vectors │
  │                      │                          │ trees, forests: NO (splits) │
  ├──────────────────────┼──────────────────────────┼─────────────────────────────┤
  │ Examples             │ linear / logistic reg.,  │ k-NN, decision trees,       │
  │                      │ naive Bayes, neural nets │ random forests, kernel SVM, │
  │                      │                          │ Gaussian processes          │
  ├──────────────────────┼──────────────────────────┼─────────────────────────────┤
  │ Assumption           │ Strong: a fixed form     │ Weak: shape learned         │
  │ Data needed          │ Less                     │ More (worse in high dims)   │
  │ Typical failure      │ Wrong form → underfits   │ Memorises noise if uncapped │
  └──────────────────────┴──────────────────────────┴─────────────────────────────┘
```

**Official Definition:**

> A **parametric model** assumes a fixed functional form with a fixed, finite number of parameters that does not depend on the training-set size (linear regression with d features: w₀, w₁, …, w_d). A **non-parametric model** does not fix that number in advance — its effective complexity grows with the data: k-NN stores every training point, a kernel SVM keeps its support vectors (up to all n), a Gaussian process conditions on all n points, and an unpruned decision tree adds splits as n grows.

> **Maths in one line:** `parametric size = f(d)`, e.g. d + 1 numbers for logistic regression; `non-parametric size = f(n, d)`, e.g. k-NN keeps n × (d + 1) numbers — the test is "does the model get bigger when I add data?"

**Interview Answer:**

**Say this first (30 sec):** A parametric model commits to a fixed form with a fixed number of parameters — logistic regression on 3 features keeps 4 numbers whether it trains on 100 rows or 10 million. A non-parametric model lets its complexity grow with the data: k-NN keeps every row, and an unpruned tree adds splits as rows arrive. The trade-off is assumptions versus data: parametric is fast and data-efficient but wrong if its form is wrong; non-parametric is flexible but needs more data and memory, and can memorise noise.

- **Who keeps the training data:** k-NN (every row), kernel SVMs (the support vectors) and Gaussian processes (all n points). Trees and forests do *not* — they predict from learned splits and leaf values alone.
- **Prediction cost:** a linear model is O(d) per query; brute-force k-NN is O(n·d) per query (KD-trees or approximate-nearest-neighbour indexes help); a tree is O(depth).
- **Data hunger:** methods that rely on local neighbourhoods need far more data as dimensions grow — the curse of dimensionality ([Ch 11 §11.2](#content/11_unsupervised_learning)).
- **Grey zone:** capping a tree (max_depth = 4 → at most 15 splits) makes its size fixed again; neural networks are parametric by definition, yet flexible enough to fit almost anything.

**Worked example:** fit four models on 100, 1,000 and 10,000 rows and count what each must store.

```python
# Parametric vs non-parametric: how many numbers each model keeps as the data grow
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

rng = np.random.default_rng(0)

def make_data(n):                  # 3 features, a curved true boundary, some label noise
    X = rng.normal(size=(n, 3))
    y = (X[:, 0] + X[:, 1] ** 2 + rng.normal(0, 0.5, n) > 1).astype(int)
    return X, y

def splits(tree):                  # one (feature, threshold) pair per internal node
    return int((tree.tree_.feature >= 0).sum())

print(f"{'rows n':>7} {'logistic reg':>13} {'tree splits':>12} {'depth-4 tree':>13} {'k-NN stores':>12}")
kept = {}
for n in [100, 1_000, 10_000]:
    X, y = make_data(n)
    logreg = LogisticRegression().fit(X, y)
    tree = DecisionTreeClassifier(random_state=0).fit(X, y)      # grown until leaves are pure
    capped = DecisionTreeClassifier(max_depth=4, random_state=0).fit(X, y)
    knn = KNeighborsClassifier(n_neighbors=5).fit(X, y)
    kept[n] = (logreg.coef_.size + logreg.intercept_.size, splits(tree), splits(capped),
               knn.n_samples_fit_ * (X.shape[1] + 1))            # every row: 3 features + label
    print(f"{n:>7,} {kept[n][0]:>13} {kept[n][1]:>12,} {kept[n][2]:>13} {kept[n][3]:>12,}")

assert kept[100][0] == kept[10_000][0] == 4              # parametric: 3 weights + 1 bias
assert kept[100][1] < kept[1_000][1] < kept[10_000][1]   # unpruned tree grows with n
assert max(v[2] for v in kept.values()) <= 15            # depth cap: at most 2**4 - 1 splits
assert kept[10_000][3] == 100 * kept[100][3]             # k-NN keeps every training row
```

**Output:**

```
 rows n  logistic reg  tree splits  depth-4 tree  k-NN stores
    100             4           11             7          400
  1,000             4          105            14        4,000
 10,000             4        1,084            15       40,000
```

Logistic regression never grows; the unpruned tree grows about 10× per 10× data, but needs only those splits to predict. k-NN must carry all 40,000 numbers into production.

**Likely follow-ups:**

- *Is a neural network parametric?* — Yes. The architecture fixes the weight count before training; more data does not add weights, however flexible the network is.
- *Is a random forest parametric?* — No: its unpruned trees grow with n. But, like one tree, it keeps only splits and leaf values, not training rows.
- *When would you choose non-parametric?* — Few dimensions, plenty of data and no good guess of the functional form — e.g. k-NN as a baseline, or a Gaussian process for a small, expensive experiment.

**Trap:** Listing decision trees under "must keep the training data" — a tree is non-parametric because its splits grow with n, but it predicts from those splits alone; k-NN, kernel-SVM support vectors and Gaussian processes are the ones that keep training points.

**Go deeper:** [Ch 08 §8.6](#content/08_core_concepts) · [Ch 12 §12.8](#content/12_key_algorithms) · [Ch 11 §11.2](#content/11_unsupervised_learning)

---

### Q10. What is the difference between a generative and discriminative model?
*[G][O] | ★★★*

![Interview card Q10 Generative vs Discriminative on one feature, weight in kg: logistic regression learns an S-curve P(dog | x) with boundary 6.03 kg, while the generative model learns a Gaussian for cats (mean about 4) and dogs (mean about 8) crossing at 5.98 kg, can sample a new cat, and flags a 20 kg animal as an outlier with P(x) = 7.6e-33. Shows Bayes rule P(y | x) = P(x | y) P(y) / P(x), a key-numbers table (P(dog) at 6 kg 0.523 vs 0.472), example models, follow-ups on LDA and naive Bayes, and the discriminative-is-always-better trap.](diagrams/iq32_info_q10_generative_discriminative_ai.png)

**Simple Answer:**

Two classmates learn to tell cat photos from dog photos. The discriminative student only learns the dividing line: "big ears and a long snout → dog". The generative student learns what a typical cat photo and a typical dog photo look like, then asks which description fits the new photo better.

The first student is often the sharper classifier. Only the second can *draw* a new cat, or notice that a photo looks like neither animal.

```
  DISCRIMINATIVE                        GENERATIVE
  ──────────────────────────────────    ──────────────────────────────────────
  Learns   P(y | x), or just a          Learns   P(x | y) and P(y), i.e. P(x, y)
           boundary                              (or just P(x) with no labels)

  Asks     "Given this photo:           Asks     "What does a cat photo look
           cat or dog?"                          like? And a dog photo?"

  Predicts directly                     Predicts with Bayes' rule:
                                                 P(y | x) ∝ P(x | y) · P(y)

  Extras   none                         Extras   sample new data, score P(x)
                                                 (outliers), cope with missing x

  Wins     with plenty of data          Wins     with very little data, or
           (lower final error)                   when you need the extras

  Examples logistic regression,         Examples naive Bayes, LDA, GMM, HMM,
           SVM, trees / GBMs,                    VAEs, GANs, diffusion models,
           BERT-style classifiers                GPT-style LLMs
```

**Official Definition:**

> A **discriminative model** learns the conditional distribution P(y | x) — or only a decision boundary — directly. A **generative model** learns how the data are produced: the joint distribution P(x, y) = P(x | y) P(y) (or P(x) when there are no labels), and classifies with Bayes' rule. Because it models x itself, a generative model can also sample new data, score how likely an input is, and handle missing features.

> **Maths in one line:** `P(y | x) = P(x | y) · P(y) / P(x)` — a generative model learns the right-hand side and derives the left; a discriminative model fits the left-hand side directly.

**Interview Answer:**

**Say this first (30 sec):** A discriminative model learns P(y | x), the boundary between classes, directly — logistic regression, SVMs, boosted trees and most neural classifiers. A generative model learns how each class produces data, P(x | y) and P(y), and classifies with Bayes' rule — naive Bayes, Gaussian mixture models and hidden Markov models, and at scale VAEs, GANs, diffusion models and LLMs. With plenty of data, discriminative usually classifies better; generative wins with very little data, or when you also need to sample, detect outliers or handle missing inputs.

| | Discriminative | Generative |
|---|---|---|
| Small training set | Needs more examples | Reaches its best error faster: O(log n) vs O(n) examples, n = features (Ng & Jordan, 2001) |
| Large training set | Lower final error | Higher final error when its assumptions (e.g. independence) are wrong |
| Extra abilities | None beyond P(y \| x) | Sampling, P(x) for outliers, missing features, unlabelled data |

- **Generative–discriminative pairs:** linear discriminant analysis (LDA) and Gaussian naive Bayes with shared variances produce logistic regression's sigmoid-of-a-line posterior, but fit it through the joint likelihood instead of the conditional one.
- **LLMs are generative:** they model P(text) as a product of P(next token | earlier tokens) and sample from it. A BERT encoder fine-tuned to output labels is discriminative.
- **Vocabulary trap:** "generative AI" means large models that produce content; a naive Bayes spam filter is a generative *classifier* ([Ch 07](#content/07_introduction)).

**Worked example:** one feature (weight in kg); a Gaussian per class versus logistic regression.

```python
# Generative vs discriminative on one feature (weight in kg, illustrative numbers)
import numpy as np
from sklearn.linear_model import LogisticRegression

rng = np.random.default_rng(0)
cats, dogs = rng.normal(4, 1, 300), rng.normal(8, 1, 300)      # weight in kg
x = np.concatenate([cats, dogs])
y = np.r_[np.zeros(300), np.ones(300)]                          # 1 = dog

# Generative: learn P(x | y) = one Gaussian per class (shared sd), and the prior P(y)
mu_cat, mu_dog = cats.mean(), dogs.mean()
sd = np.sqrt((((cats - mu_cat) ** 2).sum() + ((dogs - mu_dog) ** 2).sum()) / (len(x) - 2))
prior_dog = y.mean()
pdf = lambda v, mu: np.exp(-0.5 * ((v - mu) / sd) ** 2) / (sd * np.sqrt(2 * np.pi))
joint = lambda v: (pdf(v, mu_cat) * (1 - prior_dog), pdf(v, mu_dog) * prior_dog)  # P(x, y)

# Discriminative: learn P(y | x) directly, nothing about x itself
logreg = LogisticRegression(C=1e6).fit(x.reshape(-1, 1), y)

# 1) Bayes' rule turns the Gaussians into a sigmoid too: a generative-discriminative pair
w = (mu_dog - mu_cat) / sd ** 2
b = (mu_cat ** 2 - mu_dog ** 2) / (2 * sd ** 2) + np.log(prior_dog / (1 - prior_dog))
w_lr, b_lr = logreg.coef_[0, 0], logreg.intercept_[0]
print(f"generative  : P(dog|x) = sigmoid({w:.2f}x {b:+.2f})  -> boundary {-b / w:.2f} kg")
print(f"logistic reg: P(dog|x) = sigmoid({w_lr:.2f}x {b_lr:+.2f})  -> boundary {-b_lr / w_lr:.2f} kg")

# 2) Only the generative model can create new examples: sample from P(x | cat)
print("three new 'cats' sampled:", ", ".join(f"{v:.1f} kg" for v in rng.normal(mu_cat, sd, 3)))

# 3) Only the generative model knows how unusual an input is: P(x) for a 20 kg animal
for v in (6.0, 20.0):
    c, d = joint(v)
    p_lr = logreg.predict_proba([[v]])[0, 1]
    print(f"x = {v:4.0f} kg: logistic P(dog) = {p_lr:.3f}   "
          f"generative P(dog) = {d / (c + d):.3f}, P(x) = {c + d:.1e}")
assert abs(-b / w - 6.0) < 0.2 and abs(-b_lr / w_lr - 6.0) < 0.2
assert sum(joint(20.0)) < 1e-20 < sum(joint(6.0))              # 20 kg: an outlier, not a sure dog
```

**Output:**

```
generative  : P(dog|x) = sigmoid(4.04x -24.14)  -> boundary 5.98 kg
logistic reg: P(dog|x) = sigmoid(3.31x -19.99)  -> boundary 6.03 kg
three new 'cats' sampled: 2.8 kg, 2.6 kg, 3.7 kg
x =    6 kg: logistic P(dog) = 0.472   generative P(dog) = 0.523, P(x) = 5.2e-02
x =   20 kg: logistic P(dog) = 1.000   generative P(dog) = 1.000, P(x) = 7.6e-33
```

Both models put the boundary near 6 kg, but with different weights — same form, different fitting. Only the generative model can sample new "cats", and only it sees that a 20 kg animal is about 10³¹ times less likely than a 6 kg one; logistic regression just answers "dog, 100%".

**Likely follow-ups:**

- *Is linear discriminant analysis discriminative?* — No, despite the name: it fits one Gaussian per class with a shared covariance, then applies Bayes' rule. It is logistic regression's generative twin.
- *When can naive Bayes beat logistic regression?* — With few training examples: it estimates each feature's statistics separately, so it reaches its (higher) final error much sooner. It is also a strong 5-minute text baseline.
- *Is a GAN a generative model if it has no likelihood?* — Yes. It learns to sample from the data distribution implicitly, without ever writing P(x) down; VAEs, diffusion models and LLMs give (bounds on) likelihoods.

**Trap:** Saying "discriminative models are always better" — with little data a generative model can win (Ng & Jordan), and only a generative model can sample or flag inputs unlike anything it was trained on; the real difference is what is modelled: P(x, y) versus P(y | x).

**Go deeper:** [Ch 10 §10.6](#content/10_supervised_learning) · [Ch 12 §12.9](#content/12_key_algorithms) · [Ch 11 §11.8](#content/11_unsupervised_learning) · [Ch 16 §5.1](#content/16_deep_learning) · [Ch 17 §2.6](#content/17_llm)

---

### Q11. What is transfer learning and when would you use it?
*[All] | ★★*

![Interview card Q11 Transfer Learning: 30-second answer, cyclist-to-motorcycle analogy, new head = 2,048 x 5 + 5 = 10,245 trainable weights (about 0.04% of ResNet-50's 25.6M), a ResNet-50 stack on 500 labelled X-rays with a frozen ImageNet backbone of 23.5M weights (edges, textures, object parts) whose 1,000-class head of 2,049,000 weights is swapped for a 5-class head, a table comparing feature extraction, partial and full fine-tuning and LoRA, follow-ups and the learning-rate trap.](diagrams/iq32_info_q11_transfer_learning_ai.png)

**Simple Answer:**

If you can ride a bicycle, learning a motorcycle does not start from zero: balance and steering transfer, and you only learn the throttle and the brakes. Transfer learning does the same for models: take a network that already learned general features from a huge dataset, keep that knowledge, and train only the task-specific part on your small dataset.

```
  WITHOUT TRANSFER                    WITH TRANSFER
  ────────────────────────────────    ────────────────────────────────────────
  Task:  5 lung conditions,           Same 500 X-rays
         500 labelled X-rays
  Start: ResNet-50, random weights    Start: ResNet-50 pretrained on ImageNet
  Learn: all 25.6M weights                   (~1.28M photos, 1,000 classes)
         from 500 images              1. Keep the backbone (23.5M weights)
  Result: usually memorises           2. Swap the 1,000-class head (2,049,000)
          the 500, generalises           for a 5-class head (10,245 weights)
          poorly                      3. Train only the head, backbone frozen
                                      4. Maybe unfreeze the top block with a
                                         small learning rate
                                      Result: usually far better than scratch;
                                      measure it on unseen patients

  What the pretrained layers already detect (generic, not medical):
  early → edges, colours    middle → textures, shapes    late → object parts
```

**Official Definition:**

> **Transfer learning** reuses a model trained on a large source task as the starting point for a related target task. Its learned representations — edges and textures for images, grammar and world knowledge for text — carry over, so the target task needs far fewer labelled examples and far less compute. **Fine-tuning** is the usual way to do it: keep training some or all of the pretrained weights on the target data, with a small learning rate.

> **Maths in one line:** `new head = features × classes + classes` → 2,048 × 5 + 5 = 10,245 trainable weights on top of 23.5M frozen ones — about 0.04% of ResNet-50's 25.6M.

**Interview Answer:**

**Say this first (30 sec):** Transfer learning starts from a model pretrained on a large dataset and adapts it to your task, so you inherit general features and only learn what is task-specific. Use it when labelled data are scarce and a related pretrained model exists — a ResNet-50 swaps its 1,000-class head for a 5-class one and trains 10,245 weights instead of 25.6 million. It is now the default starting point: application teams rarely train vision or language models from scratch.

| Strategy | What trains | When it fits |
|---|---|---|
| Feature extraction (linear probe) | Only the new head; backbone frozen | Little data, similar domain — the baseline to beat |
| Partial fine-tuning | Head + top block(s), small learning rate | More data, or a somewhat different domain |
| Full fine-tuning | Every weight, small learning rate (often lower for the backbone) | Plenty of data, or a large domain shift |
| Parameter-efficient (LoRA) | Small low-rank adapters, the base stays frozen | Large Transformers and LLMs; one base model, many tasks |

- **Recipe:** match the pretrained model's preprocessing (input size, normalisation, tokenizer); train the head first; then unfreeze the top blocks and keep the change only if validation improves.
- **When it fails:** a large domain gap can make the source features useless (negative transfer), and a high learning rate overwrites them (catastrophic forgetting).
- **LLMs are transfer learning at scale:** pretraining is the source task; adapt by prompting, RAG, LoRA or full fine-tuning. LoRA on a 4096 × 4096 layer at rank 16 trains 131,072 numbers (0.8%).

**Likely follow-ups:**

- *Which layers do you freeze?* — Early layers detect generic edges and textures, so freeze them; the head and top blocks are task-specific. Unfreeze more only while validation keeps improving.
- *Feature extraction vs fine-tuning vs domain adaptation?* — Feature extraction freezes the backbone; fine-tuning updates it; domain adaptation keeps the task but shifts the input distribution, often with unlabelled target data.
- *Why does ImageNet help with X-rays at all?* — Low-level features (edges, textures, shapes) are shared across images. The gap is still large, so compare against a from-scratch or self-supervised medical baseline.

**Trap:** Saying "just fine-tune the whole network at the normal learning rate" — large updates erase the pretrained features you came for; train the new head first, then unfreeze gradually with a small learning rate.

**Go deeper:** [Ch 14 §14.11](#content/14_neural_networks) · [Ch 17 §3.8](#content/17_llm) · [Ch 17b §9.4](#content/17b_llm_applications)

---

### Q12. What is the difference between precision, recall, and F1-score? ★★★
*[All] | ★*

![Interview card Q12 Precision, Recall and F1: 30-second answer, tuna-fishing analogy, formulas Precision = TP / (TP + FP), Recall = TP / (TP + FN), F1 = 2 x P x R / (P + R), a cancer-screen confusion matrix for 1,000 patients (TP 90, FN 10, FP 15, TN 885) with precision 90 / 105 = 85.7%, recall 90 / 100 = 90.0% and F1 0.878, a threshold slider, a table of F0.5 0.865, F2 0.891, F1 0.878 and MCC 0.864, follow-ups and the swapped-denominator trap.](diagrams/iq32_info_q12_precision_recall_f1_ai.png)

**Simple Answer:**

You fish for tuna with a net, and dolphins sometimes get caught too.

- **Precision:** of everything in your net, what fraction is tuna? (Few dolphins caught = high precision.)
- **Recall:** of all the tuna in the sea, what fraction did you catch? (Few tuna missed = high recall.)
- **F1:** one score that is high only when both are high.

A bigger net catches more tuna (recall up) but also more dolphins (precision down) — that tension is the whole topic.

```
  Cancer screening, 1,000 patients (Ch 13's running example)

                              PREDICTED
                         Cancer       No cancer
  ACTUAL   Cancer        TP = 90      FN = 10      recall = 90 / (90 + 10) = 90.0%
           No cancer     FP = 15      TN = 885
                         ───────
                         precision = 90 / (90 + 15) = 85.7%

  F1       = 2 × 0.857 × 0.900 / (0.857 + 0.900) = 0.878
  Accuracy = (90 + 885) / 1,000 = 97.5%   ← looks great, hides 10 missed cancers

  FP = false alarm (Type I error)          FN = missed case (Type II error)

  PRECISION MATTERS                        RECALL MATTERS
  Spam filter: losing a real email         Cancer screening: a missed cancer
  costs more than letting one spam in      is far worse than an extra test
  → keep FP low                            → keep FN low
```

**Official Definition:**

> **Precision** = TP / (TP + FP): of everything the model labelled positive, the fraction that truly is positive. **Recall** (sensitivity, true positive rate) = TP / (TP + FN): of everything truly positive, the fraction the model found. The **F1 score** = 2 · P · R / (P + R) is their harmonic mean. All three ignore true negatives and depend on the decision threshold.

> **Maths in one line:** `Precision = TP/(TP+FP)`, `Recall = TP/(TP+FN)`, `F1 = 2·P·R/(P+R)` — precision checks the alarms you raised, recall checks the positives that exist, and F1 is high only when both are.

**Interview Answer:**

**Say this first (30 sec):** Precision asks "when the model says positive, how often is it right?" — TP / (TP + FP). Recall asks "of all real positives, how many did it find?" — TP / (TP + FN). F1 is their harmonic mean, high only when both are. In Ch 13's cancer screen (TP 90, FP 15, FN 10), precision is 85.7%, recall 90% and F1 0.878, while accuracy reads 97.5% and hides the 10 missed cancers.

| Situation | Favour | What to report (cancer example) |
|---|---|---|
| A false alarm is costly (spam filter, auto-ban) | Precision | Precision at a recall floor, or F0.5 (0.865) |
| A miss is costly (cancer screen, fraud) | Recall | Recall at a precision floor, or F2 (0.891) |
| Both matter, positives are rare | Balance | F1 (0.878), plus PR-AUC across thresholds |
| True negatives matter too | All four cells | MCC (0.864) |

- **The threshold sets the trade-off:** raise it and the model flags fewer cases — recall can only fall, precision usually rises. Choose it from error costs on validation data.
- **Why a harmonic mean:** precision 1.0 with recall 0.01 averages to 0.505, but F1 = 0.02 — the weaker number dominates.
- **F-beta:** `F_β = (1 + β²)·P·R / (β²·P + R)`. β = 2 weights recall more (cancer screening); β = 0.5 weights precision more (spam).
- **Multi-class:** macro-F1 averages per-class F1, so rare classes count equally; micro-F1 pools the counts and equals accuracy for single-label problems.

**Likely follow-ups:**

- *Why not just use accuracy?* — With 10% positives, a model that always says "no cancer" scores 90% accuracy and 0% recall.
- *Recall is too low — what do you do?* — Lower the threshold first (cheapest), then add class weights or more positive examples, and check precision stays acceptable (Q39).
- *Precision vs specificity?* — Specificity = TN / (TN + FP) counts negatives correctly cleared (98.3% here). Precision falls as positives get rarer, even when specificity stays the same.

**Trap:** Mixing up the denominators — precision divides by everything the model *called* positive (TP + FP), recall by everything that *is* positive (TP + FN); and an F1 quoted without its threshold and positive class means little.

**Go deeper:** [Ch 13 §13.3](#content/13_model_evaluation) · [Ch 13 §13.5](#content/13_model_evaluation) · [Ch 10 §10.11](#content/10_supervised_learning) · Q13 (ROC-AUC) · Q20 (Type I/II errors) · Q33 (imbalanced data)

---

### Q13. What is ROC-AUC and when do you use it? ★★★
*[All] | ★★*

![Interview card Q13 ROC-AUC: 30-second answer, spam-filter analogy, AUC = (pairs where the positive outscores the negative + 0.5 x ties) / (n_pos x n_neg), an ROC staircase for 8 scores (.95 P, .85 P, .70 N, .60 P, .55 N, .40 P, .30 N, .20 N) with shaded area AUC = 0.8125 against a dashed random diagonal, a 4 by 4 grid of positive-negative pairs with 13 ticks giving 13 / 16 = 0.8125, a which-metric table (ROC-AUC, PR-AUC, precision recall F1, calibration), follow-ups and the class-ratio trap.](diagrams/iq32_info_q13_roc_auc_ai.png)

**Simple Answer:**

A spam filter gives every email a score, and you choose the cut-off. A strict cut-off blocks few real emails but lets spam through; a loose one catches more spam but blocks more real mail. The **ROC curve** draws every possible cut-off at once: the share of spam caught (up) against the share of real emails wrongly blocked (right).

**AUC** is the area under that curve, and it has a plain meaning: pick one random spam and one random real email — AUC is the chance that the model gives the spam the higher score. 1.0 is a perfect ranking; 0.5 is a coin flip.

```
  Scores high → low:  .95 P  .85 P  .70 N  .60 P  .55 N  .40 P  .30 N  .20 N
  Lower the threshold past each score: a P steps UP 1/4, an N steps RIGHT 1/4

  TPR (recall)
  1.00 │               ┏━━━━━━━━━━━━━━━━  (1, 1): threshold 0, flag everyone
       │               ┃           /
  0.75 │       ┏━━━━━━━┛       /
       │       ┃           /
  0.50 ┏━━━━━━━┛       /    / = random scores, AUC 0.5
       ┃           /
  0.25 ┃       /      area under the staircase = AUC = 0.8125
       ┃   /
  0.00 ┗────────────────────────────────
       0      0.25    0.50    0.75    1.00   FPR (false-alarm rate)

  Pairs: 4 P × 4 N = 16. The positives beat 4 + 4 + 3 + 2 = 13 of the negatives
         → AUC = 13 / 16 = 0.8125, the same number as the area
```

**Official Definition:**

> The **ROC curve** (Receiver Operating Characteristic) plots the true positive rate, TPR = TP / (TP + FN), against the false positive rate, FPR = FP / (FP + TN), as the decision threshold sweeps from high to low. **ROC-AUC** is the area under it. It equals the probability that a randomly chosen positive is scored above a randomly chosen negative (ties count half): the Mann–Whitney U statistic divided by n_pos · n_neg.

> **Maths in one line:** `AUC = (pairs where the positive outscores the negative + ½ · tied pairs) / (n_pos · n_neg)` — the fraction of positive–negative pairs the model puts in the right order: 1.0 is perfect, 0.5 is a coin flip, below 0.5 means the scores are upside down.

**Interview Answer:**

**Say this first (30 sec):** ROC-AUC measures how well a model *ranks* positives above negatives across every threshold: it is the probability that a random positive outscores a random negative, so 0.5 is a coin flip and 1.0 is perfect. I use it to compare models before choosing a threshold. When positives are rare I also report PR-AUC, because ROC-AUC can stay high while most alarms are false.

- **How it is built:** sort by score; each positive steps the curve up 1/P, each negative right 1/N. The area equals the pair count (13/16 = 0.8125 above).
- **Only the order matters:** squaring every score leaves AUC unchanged. So a high AUC says nothing about the right threshold or whether the probabilities are calibrated.
- **Rare positives:** with 5 frauds in 100 transactions, 20 false alarms are FPR 20/95 = 0.21 but precision 4/24 = 0.17. Add 10× more legitimate traffic: ROC-AUC stays 0.854, average precision falls 0.493 → 0.143.
- **Reading a value:** roughly 0.9+ excellent, 0.8–0.9 good, 0.7–0.8 fair — but the real bar is the current system or a simple baseline. Credit scoring reports Gini = 2·AUC − 1.

| Question you are answering | Metric |
|---|---|
| Which model ranks better, before a threshold is chosen? | ROC-AUC |
| Positives are rare and every alarm costs review time | PR-AUC / average precision; its random baseline is the positive rate (Q33) |
| How good is the model at the threshold we will ship? | Precision, recall and F1 at that threshold (Q12) |
| Does a score of 0.7 really mean 70%? | Calibration: reliability plot, Brier score |

**Likely follow-ups:**

- *AUC or F1 — which do you report?* — Both, for different jobs: AUC compares ranking across all thresholds, F1 scores one operating point. Pick the model with AUC, then report F1 (or precision and recall) at the chosen threshold.
- *How do you choose the threshold?* — From the costs: on validation data, pick the point that minimises expected cost or meets a target such as "precision ≥ 90%". 0.5 is a default, not a law.
- *AUC for more than two classes?* — One-vs-rest: one AUC per class against all the others, then average them (scikit-learn `roc_auc_score(..., multi_class="ovr")`).

**Trap:** "I use ROC-AUC *because* the classes are imbalanced" — ROC-AUC ignores the class ratio, which is exactly why it flatters a model on rare positives; add PR-AUC, whose random baseline is the positive rate, not 0.5.

**Go deeper:** [Ch 13 §13.4](#content/13_model_evaluation) (by hand, plus a program computing AUC three ways) · [Ch 13 §13.5](#content/13_model_evaluation) (ROC vs PR in numbers) · [Ch 13 §13.12](#content/13_model_evaluation) (calibration) · Q12 and Q33 in this chapter

---

### Q14. What is feature engineering? Give examples. ★★
*[All] | ★*

![Interview card Q14 Feature Engineering: 30-second answer, crude-oil refinery analogy, key numbers ln(5,000) = 8.52, 23:00 is 0.261 from midnight on a 24-hour circle (noon 2.0), and a y depends on x squared signal with correlation 0.062 but mutual information 0.940, a RAW to ENGINEERED panel (date parts, hour sin and cos on a clock, LogPrice 8.52 and PricePerM2 100, OrdersLast30d from past rows only), a leakage warning and a feature store feeding training and serving, a recipes table, follow-ups and the leakage trap.](diagrams/iq32_info_q14_feature_engineering_ai.png)

**Simple Answer:**

Raw data is like crude oil: valuable, but not usable until it is refined. Feature engineering is the refining. You turn raw columns into signals the model can use directly — a timestamp becomes "hour of day" and "is weekend", a birth year becomes "age", a skewed price becomes its logarithm.

A good feature does work the model would otherwise need lots of data to learn, or could not learn at all: a linear model can never divide price by floor area on its own.

```
  RAW DATA                            ENGINEERED FEATURES
  ────────────────────────────────    ──────────────────────────────────────
  Date: 2024-01-15                    Year=2024, Month=1, DayOfWeek=Mon,
                                      IsWeekend=0, Quarter=1

  Time: 23:00                         HourSin=-0.259, HourCos=0.966
                                      (0.261 from midnight, not 23 apart)

  BirthYear: 1990, Year: 2024         Age=34, AgeGroup="26-40"

  Price: 5000, Area: 50 m²            LogPrice=ln(5000)=8.52, PricePerM2=100

  Latitude: 40.7, Longitude: -74.0    DistanceToCityCenter=5.2 km

  Orders table (one row per order)    OrdersLast30d=4, AvgOrderValue30d=62
                                      (from PAST orders only)

  Text: "I love this product!"        WordCount=4, HasExclamation=1,
                                      or a sentence embedding
```

**Official Definition:**

> **Feature engineering** is the process of using domain knowledge to transform raw data into input variables (features) that expose the patterns relevant to the prediction task — by transforming, combining, aggregating or encoding raw fields — so that the model learns faster, generalises better and is easier to explain.

**Interview Answer:**

**Say this first (30 sec):** Feature engineering turns raw data into inputs that make the pattern easy to learn: ratios, log transforms, date parts, cyclical encodings, aggregates over a user's history, encodings of categories. On tabular data it is often worth more than switching algorithms. Two rules keep it honest: use only information available at prediction time, and compute each feature the same way in training and in serving.

| Recipe | Example | Why it helps |
|---|---|---|
| Transform | ln(price): 5,000 → 8.52 | tames a right-skewed column, so a few huge values stop dominating |
| Combine | price ÷ area; clicks ÷ impressions | a linear model cannot divide one feature by another |
| Cyclical | hour → (sin, cos): 23:00 is 0.261 from midnight, noon is 2.0 | 23:00 and 00:00 become neighbours |
| Aggregate | a user's orders in the past 30 days | turns history into one row; use past rows only |
| Encode | city → one-hot, or a target mean computed out-of-fold | turns categories into numbers ([Ch 09 Step 3](#content/09_data_preprocessing)) |

- **Know your model:** trees split on the order of values, so a log transform changes nothing for them, but ratios and aggregates still help. Linear models and k-NN need transforms and scaling.
- **Leakage is the main danger:** a feature built from the future or the label (a "refund issued" flag for fraud, target encoding fitted on all rows) looks brilliant offline and fails live (Q31).
- **Training–serving skew:** compute each feature from one shared definition — a feature store — so batch training and online serving cannot drift apart.
- **Then prune:** drop near-constant and duplicate columns. Mutual information catches non-linear signals that correlation misses: in Ch 09's demo, where y depends on x², x scores correlation 0.062 but mutual information 0.940.

**Likely follow-ups:**

- *How do you know a new feature helps?* — Compare cross-validated scores with and without it on the same folds, and check its permutation importance on held-out data. A suspiciously large jump usually means leakage.
- *How would you encode a category with 10,000 values?* — Not one-hot (10,000 sparse columns). Use smoothed target encoding fitted out-of-fold, the hashing trick, or a learned embedding.
- *Feature engineering vs feature learning?* — Engineering is hand-crafted from domain knowledge; feature learning lets a network learn representations (CNN filters, embeddings) from raw data. Images and text moved to feature learning; tabular data still rewards hand-built features.

**Trap:** The best-looking new feature is often leakage — if it uses information you will not have at prediction time (future rows, the label, fields filled in after the outcome), it will collapse in production.

**Go deeper:** [Ch 09 Step 5](#content/09_data_preprocessing) (recipes + feature selection program) · [Ch 08 §8.4](#content/08_core_concepts) (leakage) · [Ch 26 — Features](#content/26_ml_system_design) (feature stores, training–serving skew) · Q31 in this chapter

---

### Q15. What is the difference between correlation and causation?
*[All] | ★*

![Interview card Q15 Correlation vs Causation: 30-second answer, ice-cream and drownings analogy, r = Cov(X, Y) / (sigma_X x sigma_Y), a confounder diagram where hot weather drives both ice-cream sales and drownings (r = 0.70, falling to -0.06 at the same temperature), Simpson's paradox bars for kidney stones (Charig 1986) where open surgery A wins for small stones 93% vs 87% and large stones 73% vs 69% but loses overall 78% vs 83% because 263 of its 350 patients had large stones, a counts table with same-mix rates 83.3% vs 77.9%, follow-ups and the measured-confounders trap.](diagrams/iq32_info_q15_correlation_causation_ai.png)

**Simple Answer:**

When ice-cream sales go up, so do drownings. Ice cream does not cause drowning: hot weather drives both — more people buy ice cream, and more people swim. **Correlation** means two things move together; **causation** means that changing one would change the other.

ML models learn correlations. That is fine for *prediction* ("high sales today → expect more drownings") but wrong for *decisions* ("ban ice cream to stop drownings").

```
  A CONFOUNDER: one hidden cause, two effects

                      HOT WEATHER
                     /           \
                    ▼             ▼
         ice-cream sales  ~~~~~~  drownings
                   correlated (r ≈ 0.7),
                   but no arrow between them

  Compare only days with the SAME temperature → the correlation vanishes (≈ 0)

  SIMPSON'S PARADOX: kidney stones (Charig et al., BMJ 1986), success rate

                   A: open surgery    B: keyhole (PCNL)    better
  small stones      81/87  = 93%       234/270 = 87%         A
  large stones     192/263 = 73%        55/80  = 69%         A
  all patients     273/350 = 78%       289/350 = 83%         B ?!

  Why: A got the hard cases. 263 of its 350 patients had large stones (B: 80).
  Stone size drives both the treatment chosen and the outcome: a confounder.
```

**Official Definition:**

> **Correlation** measures how strongly two variables move together; Pearson's r runs from −1 to +1 and captures only straight-line association. **Causation** means that intervening on X — setting it, not just observing it — changes Y. Correlation does not imply causation: the association can come from a confounder (a common cause), reverse causation, selection bias or chance.

> **Maths in one line:** `r = Cov(X, Y) / (σ_X · σ_Y)` — how tightly X and Y move together along a straight line, from −1 to +1; nothing in it says which way, if any, a causal arrow points.

**Interview Answer:**

**Say this first (30 sec):** Correlation means two variables move together; causation means changing one changes the other. A correlation can come from a confounder — heat drives both ice-cream sales and drownings — from reverse causation, from selection bias or from chance. To show causation I randomize, which is what an A/B test does; when I can't, I use a quasi-experiment such as difference-in-differences and state the assumption it rests on.

| Why X and Y move together | Example | How to rule it out |
|---|---|---|
| Confounder | heat → ice cream and drownings; stone size → treatment and success | randomize, or compare like with like (stratify, adjust) |
| Reverse causation | "daily app users stay longer" — or do loyal users open it daily? | randomize; check which came first |
| Selection bias | a recommender trained only on items the old model chose to show | keep a small slice of randomly chosen items |
| Chance | Nicolas Cage films vs US pool drownings, 1999–2009: r = 0.666 | fix the hypothesis first; replicate on new data |

- **Gold standard:** a randomized experiment (Q17). A coin flip decides who is treated, so no confounder can sit behind the difference.
- **When you cannot randomize:** difference-in-differences (assumes parallel trends), instrumental variables, regression discontinuity, propensity-score matching — each rests on an assumption you must defend.
- **Why ML engineers care:** models exploit shortcuts. Pneumonia CNNs recognised the hospital system of an X-ray for over 99.9% of images, and did significantly worse at outside hospitals in 3 of 5 comparisons (Zech et al., PLOS Medicine 2018).
- **Feature importance is not a causal effect:** it says what the model used, not what would happen if you changed that feature.

**Worked example:** a confounder creates a correlation of 0.70 that disappears once temperature is held fixed; then Simpson's paradox on the real kidney-stone counts.

```python
# Correlation without causation: a hidden common cause, then Simpson's paradox on real data
import numpy as np

rng = np.random.default_rng(0)
temp = rng.uniform(5, 35, 365)                          # the confounder: daily temperature (deg C)
ice_cream = 20 * temp + rng.normal(0, 60, 365)          # sales depend on temperature only
drownings = 0.1 * temp + rng.normal(0, 0.8, 365)        # drownings depend on temperature only

def minus_temp(y):                                      # what is left of y once temperature is explained
    slope, intercept = np.polyfit(temp, y, 1)
    return y - (slope * temp + intercept)

r_raw = np.corrcoef(ice_cream, drownings)[0, 1]
r_fixed = np.corrcoef(minus_temp(ice_cream), minus_temp(drownings))[0, 1]
print(f"corr(ice cream, drownings)        = {r_raw:.2f}")
print(f"same, with temperature held fixed = {r_fixed:.2f}")
assert r_raw > 0.5 and abs(r_fixed) < 0.15

# Kidney stones (Charig et al., BMJ 1986): (successes, patients) by treatment and stone size
data = {"A (open)": {"small": (81, 87), "large": (192, 263)},
        "B (PCNL)": {"small": (234, 270), "large": (55, 80)}}
patients = {s: sum(data[t][s][1] for t in data) for s in ("small", "large")}   # 357 and 343
mix = {s: n / sum(patients.values()) for s, n in patients.items()}             # one case mix for both
print(f"\n{'treatment':10s}{'small':>7s}{'large':>7s}{'overall':>9s}{'same mix':>10s}{'large share':>13s}")
res = {}
for t, g in data.items():
    rate = {s: k / n for s, (k, n) in g.items()}
    n_all = sum(n for _, n in g.values())
    overall = sum(k for k, _ in g.values()) / n_all
    adjusted = sum(mix[s] * rate[s] for s in mix)       # as if both had treated the same patients
    res[t] = (rate["small"], rate["large"], overall, adjusted)
    print(f"{t:10s}{rate['small']:7.1%}{rate['large']:7.1%}{overall:9.1%}{adjusted:10.1%}"
          f"{g['large'][1] / n_all:13.0%}")
a, b = res["A (open)"], res["B (PCNL)"]
assert a[0] > b[0] and a[1] > b[1] and a[2] < b[2] and a[3] > b[3]   # A wins both groups, "loses" overall
```

**Output:**

```
corr(ice cream, drownings)        = 0.70
same, with temperature held fixed = -0.06

treatment   small  large  overall  same mix  large share
A (open)    93.1%  73.0%    78.0%     83.3%          75%
B (PCNL)    86.7%  68.8%    82.6%     77.9%          23%
```

Judged on the same mix of patients (51% small, 49% large stones), A is better, 83.3% vs 77.9%. The raw totals mostly compare who got the hard cases.

**Likely follow-ups:**

- *What is Simpson's paradox?* — A trend that holds in every subgroup reverses when the groups are pooled, because a confounder (stone size) is spread unevenly between them. Compare within groups, or adjust for the confounder.
- *Can an ML model find causes on its own?* — Not from observational correlations alone. Causal inference adds assumptions (a causal graph, no hidden confounders) or uses experiments; uplift models estimate a treatment's effect per user, ideally trained on randomized data.
- *Why do causal features generalise better?* — A causal link survives a change of population; a correlation that runs through a confounder can vanish or flip — the hospital shortcut failed at new hospitals.

**Trap:** "We controlled for everything we measured, so the effect is causal" — adjusting removes only the confounders you measured; randomization also handles the ones you did not.

**Go deeper:** [Ch 6 §3.3](#content/06_math_fundamentals) (covariance and correlation) · [Ch 26 — A/B Testing](#content/26_ml_system_design) · Q17 in this chapter

---

# PART 2 — Statistics & Probability

---

### Q16. What is a p-value? What does "statistically significant" mean?
*[All] | ★★*

![Interview card Q16, the p-value: a 30-second answer (p is the probability of data this extreme if there is no real effect; below a preset alpha of 0.05 it is significant; it is not the probability H0 is true nor the effect size), a coin analogy (60 heads in 100 flips happens about 5.7% of the time with a fair coin), the formula p = P(T >= t_obs given H0), a bell curve of heads in 100 fair flips with 2.8% in each tail beyond 40 and 60 and 94.3% between, one-sided p 0.028 and two-sided p 0.057, a table showing the same 60% heads gives p 0.75 at 10 flips, 0.057 at 100 and 2.7e-10 at 1,000 while 50.2% of a million gives 0.00006, follow-ups, and the trap that p is P(data given H0), not P(H0 given data).](diagrams/iq32_info_q16_p_value_ai.png)

**Simple Answer:**

You flip a coin 100 times and get 60 heads. Is the coin biased, or was that luck? The p-value answers one narrow question: *if the coin were fair, how often would luck alone give a result at least this far from 50?* For 60 heads the answer is about 5.7% (60 or more heads, or 40 or fewer).

A small p-value means "this would be surprising if nothing were going on", so it counts as evidence against "nothing is going on". It is **not** the probability that the coin is fair.

```
  H0 = "the coin is fair".  Heads in 100 fair flips: mean 50, standard deviation 5

     heads:    ≤ 40      41 ... 59      ≥ 60
             ┌───────┬───────────────┬───────┐
     chance  │ 2.8%  │     94.3%     │ 2.8%  │
             └───────┴───────────────┴───────┘
               tail       expected      tail   ← we saw 60

  one-sided p = P(≥ 60 heads)       = 0.028   "biased towards heads?"
  two-sided p = P(≥ 60) + P(≤ 40)   = 0.057   "biased either way?"  → not below 0.05

  WHAT p = 0.03 MEANS, AND WHAT IT DOES NOT
  ✓ "If H0 were true, data at least this extreme would turn up 3% of the time."
  ✗ "There is a 3% chance that H0 is true."       (that is P(H0 | data): Bayes, Q18)
  ✗ "The effect is big."          (a million flips with 50.2% heads give p ≈ 0.00006)
  ✗ "p = 0.06, so there is no effect."     (not enough evidence; maybe too few samples)
```

**Official Definition:**

> A **p-value** is the probability, computed assuming the null hypothesis H0 is true, of getting a test statistic at least as extreme as the one observed. A result is **statistically significant** at level α (commonly 0.05, fixed before seeing the data) when the p-value is below α, and we then reject H0. α is the false-positive (Type I error) rate we accept when H0 is actually true.

> **Maths in one line:** `p = P(T ≥ t_obs | H0)`, two-sided `p = P(|T| ≥ |t_obs| | H0)` — how often a world with no effect would produce a test statistic T at least as extreme as the one you observed.

**Interview Answer:**

**Say this first (30 sec):** A p-value is the probability of seeing data at least as extreme as ours if the null hypothesis — "no effect" — were true. If it falls below a threshold α set in advance, usually 0.05, we call the result statistically significant and reject the null, accepting a 5% false-positive rate when there is truly no effect. It is not the probability that the null is true, and it says nothing about how big or important the effect is.

- **The recipe:** state H0 and H1 → fix α, one- or two-sided, and the sample size before looking → compute the test statistic and p → report the effect size and a confidence interval alongside it.
- **p mixes effect and sample size:** 60% heads gives p = 0.75 with 10 flips, 0.057 with 100 and 2.7e-10 with 1,000.
- **Significant ≠ important:** a million flips with 50.2% heads give p ≈ 0.00006 for a bias nobody cares about. The ASA's 2016 statement: a p-value "does not measure the size of an effect or the importance of a result".
- **Many tests:** 20 metrics with no real effect, each tested at α = 0.05, give a 1 − 0.95²⁰ = 64% chance that at least one looks significant. Correct with Bonferroni (α / m) or Benjamini–Hochberg.
- **Not significant ≠ no effect:** the test may simply lack power (a Type II error, Q20).

**Worked example:** the coin's p-value exactly and by simulation, then how the number of flips, not the size of the bias, drives p.

```python
# p-value for "60 heads in 100 flips": exact, by simulation, and why p is not the effect size
import numpy as np
from scipy.stats import binom

def p_values(heads, n):                                # H0: fair coin, p(heads) = 0.5
    one = binom.sf(heads - 1, n, 0.5)                  # P(X >= heads | H0)
    return one, min(1.0, 2 * one)                      # symmetric, so two-sided = 2 x one-sided

one, two = p_values(60, 100)
print(f"60 heads in 100: one-sided p = {one:.3f}, two-sided p = {two:.3f}")

rng = np.random.default_rng(0)
heads = rng.binomial(100, 0.5, 200_000)                # 200,000 experiments with a FAIR coin
sim = np.mean(np.abs(heads - 50) >= 10)                # as far from 50 as we saw, either way
print(f"simulated: {sim:.1%} of fair-coin runs land >= 10 heads from 50")
assert abs(sim - two) < 0.003 and one < 0.05 < two

print("\nsame 60% heads, more flips:")
for n in (10, 100, 1000):
    print(f"  {n * 6 // 10:4d} of {n:5,d}: two-sided p = {p_values(n * 6 // 10, n)[1]:.2g}")

tiny = p_values(502_000, 1_000_000)[1]                 # a 0.2-point bias nobody would care about
print(f"\n502,000 of 1,000,000 (50.2%): two-sided p = {tiny:.1g}")
print(f"20 useless metrics at alpha 0.05: P(>= 1 'significant') = {1 - 0.95 ** 20:.0%}")
assert tiny < 0.001
```

**Output:**

```
60 heads in 100: one-sided p = 0.028, two-sided p = 0.057
simulated: 5.7% of fair-coin runs land >= 10 heads from 50

same 60% heads, more flips:
     6 of    10: two-sided p = 0.75
    60 of   100: two-sided p = 0.057
   600 of 1,000: two-sided p = 2.7e-10

502,000 of 1,000,000 (50.2%): two-sided p = 6e-05
20 useless metrics at alpha 0.05: P(>= 1 'significant') = 64%
```

The same 60% heads is "nothing" at 10 flips and overwhelming at 1,000, while a trivial 50.2% is "highly significant" at a million. That is why you report the effect size with its confidence interval, not the p-value alone.

**Likely follow-ups:**

- *One-sided or two-sided?* — Two-sided, unless you decided before seeing the data that only one direction matters. Switching after the fact halves p — here 0.057 becomes 0.028 — which is a form of p-hacking.
- *p-value or confidence interval?* — For the usual tests, a 95% interval that excludes 0 matches p < 0.05 two-sided, but it also shows how big the effect is and how uncertain (Q22). Report it.
- *What is p-hacking?* — Trying many metrics, segments, stopping times or tests and reporting the one under 0.05. Fix the analysis plan in advance and correct for multiple tests.

**Trap:** "p = 0.03 means a 3% chance the null hypothesis is true" — p is computed *assuming* H0 is true, so it is P(data this extreme | H0), not P(H0 | data).

**Go deeper:** [Ch 6 §3.7](#content/06_math_fundamentals) (hypothesis testing) · Q20 (Type I and II errors), Q22 (confidence intervals) and Q17 (A/B tests) in this chapter

---

### Q17. Explain A/B testing. How do you design one?
*[G][A] | ★★*

![Interview card Q17, designing an A/B test: a 30-second answer (random user split at the same time; fix metric, minimum effect, sample size and ship rule first; randomize by user, run whole weeks, no peeking), a coin-flip analogy, the sample-size formula n per group about 2 sigma squared times (z for 1 minus alpha/2 plus z for 1 minus beta) squared over delta squared, about 16 sigma squared over delta squared, a flow from users through hash(user_id) to a 50% control at CTR 10.0% and a 50% treatment at CTR 11.0%, a seven-step design strip (hypothesis, metrics, size about 14,100 per group, randomize by user, run whole weeks, analyze with a 95% CI of +0.3 to +1.7 points, decide), a pitfalls table (peeking about 19% false positives, 20 metrics 64% false win, sample-ratio mismatch chi-square 1,440, novelty), follow-ups on per-user randomization and CUPED, and the peeking trap.](diagrams/iq32_info_q17_ab_testing_ai.png)

**Simple Answer:**

An online shop wants to know whether a new "Buy Now" button gets more clicks. Instead of guessing, it shows the old button to a random half of its users (control) and the new button to the other half (treatment), at the same time. Because a coin flip decided who saw which, the only systematic difference between the groups is the button — so a clear gap in click rate was caused by the button.

Designing the test means deciding everything **before** it starts: what to measure, the smallest lift worth detecting, how many users that needs, and the rule for shipping.

```
  users ─► hash(user_id) ─┬─► 50% CONTROL    old button ─► CTR 10.0%
                          └─► 50% TREATMENT  new button ─► CTR 11.0% ?
                               same weeks, same kind of traffic

  1 HYPOTHESIS  H0: CTR unchanged             H1: CTR changes (two-sided)
  2 METRICS     primary: CTR    guardrails: latency, revenue/user, complaints
  3 SIZE        detect 10% → 11%, α = 0.05, power 80%  →  ≈ 14,100 per group
  4 RANDOMIZE   by user, sticky (same user = same version); check the split
  5 RUN         to the planned size, in whole weeks (at least 1–2); no peeking
  6 ANALYZE     z-test for two proportions + 95% CI of the lift; segments later
  7 DECIDE      ship if CI excludes 0, lift is worth it, no guardrail regresses
```

**Official Definition:**

> **A/B testing** (an online controlled experiment) randomly assigns units — usually users — to a control (A) and one or more treatments (B) at the same time, and compares pre-chosen metrics between the groups. Randomization makes the groups alike in everything except the change, so a statistically significant difference can be attributed to the change; a hypothesis test and a confidence interval separate it from noise.

> **Maths in one line:** `n per group ≈ 2σ²(z₁₋α/₂ + z₁₋β)² / δ²` with σ² = p(1 − p) for a rate — at α = 0.05 (1.96) and 80% power (0.84) the z-term is 2.8² = 7.84, so n ≈ 16σ²/δ²: halving the effect δ you want to detect needs 4× the users.

**Interview Answer:**

**Say this first (30 sec):** An A/B test randomly splits users between the current version and the change, runs both at the same time and compares a pre-chosen metric; randomization is what makes the difference causal. Designing one means fixing everything up front: the hypothesis, one primary metric plus guardrails, the smallest effect worth detecting and the sample size it needs — about 14,100 users per group to see a click-through rate move from 10% to 11% — randomization by user, a run of whole weeks, and the ship rule.

- **Sample size for the example:** 2 × 0.09 × 7.84 / 0.01² ≈ 14,100 per group (≈ 14,750 if each arm uses its own variance, as in Ch 17c §4.4); a 2-point lift needs ≈ 3,500. +1 point on 10% is a 10% *relative* lift — say which you mean.
- **Duration:** users needed ÷ eligible users per day, rounded up to whole weeks so that weekdays and weekends both count.
- **Analysis:** if treatment shows 11.0% vs 10.0% with 14,100 per group, z ≈ 2.7, p ≈ 0.006, and the 95% CI for the lift is about +0.3 to +1.7 points.
- **Variance reduction:** CUPED adjusts each user's metric using their own pre-experiment value; at Bing it cut variance by about 50%, like doubling traffic (Deng et al., 2013).

| Pitfall | What goes wrong | Fix |
|---|---|---|
| Peeking | stopping at the first daily p < 0.05: about 19% false positives with 10 looks instead of 5% | fixed sample size, or a sequential test |
| Many metrics | 20 metrics at α = 0.05: 64% chance of at least one false win | one primary metric; correct the rest |
| Sample-ratio mismatch | 50.6% / 49.4% of 10M users: χ² = 1,440, far above 3.84 → assignment or logging bug | check the split before reading any result |
| Novelty effect | users click on anything new, and the lift fades | run 2+ weeks; compare new and returning users |
| Interference | users affect each other (social apps, marketplaces) | randomize by cluster or region (Q43) |

**Likely follow-ups:**

- *Why randomize by user, not by page view?* — Each user should see one consistent version, and one user's page views are not independent. Randomize and analyse per user (or use the delta method), or the variance is underestimated.
- *The result is significant but the lift is tiny. Ship?* — Compare the confidence interval with the smallest lift that pays for the change; statistical significance is not business significance.
- *Clicks are up but revenue per user is down?* — That is what guardrails are for: a guardrail regression blocks the launch, and it may mean clicks were the wrong primary metric.

**Trap:** "Run it until p drops below 0.05, then stop" — with 10 daily looks that turns a 5% false-positive rate into about 19%; fix the sample size in advance or use a sequential test built for continuous monitoring.

**Go deeper:** [Ch 17c §4.4](#content/17c_llm_systems) (sample-size and peeking simulation) · [Ch 26 — A/B Testing](#content/26_ml_system_design) (SRM, interleaving, long-term holdouts) · [Ch 6 §3.7](#content/06_math_fundamentals) · Q43 (A/B testing at Amazon's scale) in this chapter

---

### Q18. Explain Bayes' Theorem. How is it used in ML?
*[All] | ★★*

![Interview card Q18, Bayes' theorem: a 30-second answer (posterior = likelihood x prior / evidence; for a rare disease a positive on a 99% test means only 9%; used in Naive Bayes, MAP, Bayesian optimization and prior shift), a detective analogy, the odds form posterior odds = prior odds x likelihood ratio with 1 : 999 x 99 = 99 : 999, giving 99 / 1,098 = 9.0%, a natural-frequency tree where 100,000 people split into 100 sick (99 positive, 1 negative) and 99,900 healthy (999 positive, 98,901 negative) and the 1,098 positives are 9.0% sick, a table of prevalence 0.1%, 1% and 10% giving 9.0%, 50% and 91.7% plus 90.8% after a second positive, follow-ups on naive independence and rescaling odds from 0.9 to 0.083, and the base-rate fallacy trap.](diagrams/iq32_info_q18_bayes_theorem_ai.png)

**Simple Answer:**

A test for a rare disease catches 99% of sick people and wrongly flags only 1% of healthy people. You test positive. Are you 99% likely to be sick? No — only about **9%**. The disease is so rare (1 person in 1,000) that the few true positives are swamped by false alarms from the huge healthy crowd.

Bayes' theorem is the rule for that update: start from a belief (the **prior**: 0.1% of people are sick), weigh the evidence (a positive test), and get a new belief (the **posterior**: 9%).

```
  100,000 PEOPLE TAKE THE TEST
  ├── 100 have the disease (0.1%)
  │     ├──     99 test POSITIVE    ← true positives (99% sensitivity)
  │     └──      1 tests negative
  └── 99,900 are healthy
        ├──    999 test POSITIVE    ← false positives (1% false-positive rate)
        └── 98,901 test negative

  positives = 99 + 999 = 1,098   →   P(disease | positive) = 99 / 1,098 = 9.0%
  a second, independent positive:  prior 9.0%  →  posterior ≈ 91%
```

**Official Definition:**

> **Bayes' theorem** gives the probability of a hypothesis A after seeing evidence B: $P(A \mid B) = P(B \mid A) \, P(A) \,/\, P(B)$. P(A) is the **prior** (the belief before the evidence), P(B | A) the **likelihood** (how probable the evidence is if A is true), P(B) the **evidence** (how probable B is overall, summed over every possibility) and P(A | B) the **posterior** (the updated belief).

On the disease example:

$$P(\text{Disease} \mid +) = \frac{0.99 \times 0.001}{0.99 \times 0.001 + 0.01 \times 0.999} = \frac{0.00099}{0.01098} \approx 0.090$$

> **Maths in one line:** `posterior odds = prior odds × likelihood ratio` — the same theorem in odds form: 1 : 999 × (0.99 / 0.01 = 99) = 99 : 999, so P(disease | +) = 99 / 1,098 = 9.0%.

**Interview Answer:**

**Say this first (30 sec):** Bayes' theorem updates a prior belief with evidence: posterior = likelihood × prior ÷ evidence. With a test that catches 99% of cases and has a 1% false-positive rate, for a disease 1 in 1,000 people have, a positive result means only a 9% chance of disease, because false alarms from the healthy majority outnumber true cases 10 to 1. In ML it is behind Naive Bayes, MAP estimation (regularization is a prior), Bayesian optimization, and correcting a model's probabilities when class frequencies change.

| Where Bayes shows up | The prior | What the update gives you |
|---|---|---|
| Naive Bayes ([Ch 12 §12.9](#content/12_key_algorithms)) | class frequencies, e.g. 20% spam | P(spam \| words) ∝ P(spam) × Π P(word \| spam) |
| MAP estimation ([Ch 6 §3.6](#content/06_math_fundamentals)) | Gaussian prior on weights = L2; Laplace prior = L1 | the most probable weights = MLE + regularization |
| Bayesian optimization ([Ch 13 §13.8](#content/13_model_evaluation)) | a surrogate of score vs hyperparameters (Gaussian process or TPE) | updated after every trial; picks the most promising next trial |
| New class mix in production | the training set's class frequencies | probabilities re-scaled to the production frequencies |

- **The prior decides a lot when the condition is rare:** the same test gives 9.0% at 0.1% prevalence, 50% at 1% and 91.7% at 10%.
- **Updates chain:** today's posterior is tomorrow's prior; a second independent positive takes 9.0% to about 91%.
- **It is precision in disguise:** P(disease | positive) is the test's precision (positive predictive value), which is why precision collapses on rare classes even for a good model.

**Worked example:** the disease example by formula and by counting people, how the prior changes the answer, a second test, and re-scaling a model's score for a new class mix.

```python
# Bayes for a rare disease: formula, counting people, the prior's power, and a second test
def posterior(prior, sens=0.99, fpr=0.01):              # P(disease | positive test)
    evidence = sens * prior + fpr * (1 - prior)          # P(positive) = true + false positives
    return sens * prior / evidence

p1 = posterior(0.001)
print(f"formula : P(disease | +) = 0.00099 / 0.01098 = {p1:.1%}")

people = 100_000                                         # the same thing as counts
sick = people // 1000                                    # 0.1% prevalence -> 100 sick
true_pos = round(0.99 * sick)                            # 99 caught
false_pos = round(0.01 * (people - sick))                # 999 healthy people flagged
print(f"counting: {true_pos} true vs {false_pos} false positives -> "
      f"{true_pos / (true_pos + false_pos):.1%} of positives are sick")
assert abs(p1 - true_pos / (true_pos + false_pos)) < 1e-12

print("\nsame test, different prevalence (the prior):")
for prior in (0.001, 0.01, 0.10):
    print(f"  prevalence {prior:5.1%} -> P(disease | +) = {posterior(prior):5.1%}")

p2 = posterior(p1)                                       # yesterday's posterior is today's prior
print(f"\nsecond independent positive: {p1:.1%} -> {p2:.1%}")
odds = (0.001 / 0.999) * (0.99 / 0.01) ** 2              # odds form: prior odds x LR x LR
assert abs(p2 - odds / (1 + odds)) < 1e-12

for score in (0.5, 0.9):                                 # model trained on 50/50, deployed at 1%
    shifted = score / (1 - score) * (0.01 / 0.99)        # odds x (new prior odds / old prior odds)
    print(f"score {score} under a 50/50 training prior -> {shifted / (1 + shifted):.3f} at 1% prevalence")
```

**Output:**

```
formula : P(disease | +) = 0.00099 / 0.01098 = 9.0%
counting: 99 true vs 999 false positives -> 9.0% of positives are sick

same test, different prevalence (the prior):
  prevalence  0.1% -> P(disease | +) =  9.0%
  prevalence  1.0% -> P(disease | +) = 50.0%
  prevalence 10.0% -> P(disease | +) = 91.7%

second independent positive: 9.0% -> 90.8%
score 0.5 under a 50/50 training prior -> 0.010 at 1% prevalence
score 0.9 under a 50/50 training prior -> 0.083 at 1% prevalence
```

**Likely follow-ups:**

- *Why is Naive Bayes "naive"?* — It assumes the features are independent given the class. Its probabilities come out over-confident, but its ranking is often good enough, e.g. for spam.
- *A model trained on balanced 50/50 data is deployed where 1% are positive. What happens to its scores?* — They are inflated. Multiply the odds by (0.01/0.99) ÷ (0.5/0.5): a score of 0.9 becomes 0.083. Or recalibrate on held-out data with the real class mix ([Ch 13 §13.12](#content/13_model_evaluation)).
- *Frequentist or Bayesian?* — Frequentists treat parameters as fixed and probability as long-run frequency (p-values, confidence intervals); Bayesians put a prior on parameters and report a posterior (credible intervals) — see Q22.

**Trap:** Treating P(positive | disease) = 99% as if it were P(disease | positive) — the base-rate fallacy; always ask how common the condition is before trusting the test.

**Go deeper:** [Ch 6 §3.4](#content/06_math_fundamentals) (Bayes step by step) · [Ch 8 §8.16](#content/08_core_concepts) (Bayes and precision) · [Ch 04 §3.20](#content/04_aptitude_mental_math) (mental Bayes) · Q10 and Q22 in this chapter

---

### Q19. What is the Central Limit Theorem? Why does it matter?
*[All] | ★★*

![Interview card Q19, the Central Limit Theorem: a 30-second answer (averages of independent draws become approximately normal, centred on the true mean with error sigma over root n, powering confidence intervals, p-values and A/B z-tests), an app-session analogy, the formula X-bar approximately N(mu, sigma squared over n) so SE = sigma over root n, a lopsided histogram of minutes in one session (39%, 24%, 15%, 9%, 5%, 3%, 5% with a long right tail) turning into a bell-shaped histogram of averages of 30 sessions (mean 1, SE 0.18, skew 0.37), widths 1.00, 0.18 and 0.10 for n = 1, 30 and 100, a table of SD of averages, skewness and tail rates for n = 1, 30, 100 and 1,000, follow-ups on the law of large numbers and when the CLT fails, and the trap that the CLT does not make the data normal.](diagrams/iq32_info_q19_central_limit_theorem_ai.png)

**Simple Answer:**

Time how long people spend in your app. Most sessions are short and a few are very long, so the raw data are badly lopsided. Now pick 30 random sessions, write down their average, and repeat thousands of times. The pile of *averages* is almost a symmetric bell curve centred on the true mean.

That is the Central Limit Theorem: averages (and sums) of many independent random values are approximately normal, whatever the shape of the raw data, as long as the data have a finite variance. The bell also narrows as you average more — its width shrinks with √n, so 4× the data halves it.

```
  RAW DATA: minutes in ONE session          AVERAGE of 30 sessions
  exponential: mean 1, σ = 1, skew 2        mean 1, width σ/√30 = 0.18, skew 0.37
  ────────────────────────────────────      ─────────────────────────────────────
  0.0–0.5  ████████████████████ 39%         below 0.7  ██ 4%
  0.5–1.0  ████████████ 24%                 0.7–0.8    █████ 10%
  1.0–1.5  ███████ 15%                      0.8–0.9    █████████ 17%
  1.5–2.0  ████ 9%                          0.9–1.0    ███████████ 22%
  2.0–2.5  ███ 5%                           1.0–1.1    ██████████ 20%
  2.5–3.0  ██ 3%                            1.1–1.2    ███████ 14%
  3.0 +    ███ 5%  ← long right tail        1.2–1.3    ████ 8%
                                            1.3 +      ███ 6%
  lopsided: no bell at all                  nearly a bell around the true mean 1.0

  1 block = 2% of all values.   Width of the average = σ/√n:
  n = 1 → 1.00     n = 30 → 0.18     n = 100 → 0.10     (4× the data → half the width)
```

**Official Definition:**

> The **Central Limit Theorem (CLT)** says that if $X_1, \dots, X_n$ are independent and identically distributed with mean $\mu$ and finite variance $\sigma^2 > 0$, the standardised sample mean $\sqrt{n}\,(\bar{X}_n - \mu)/\sigma$ converges in distribution to the standard normal $\mathcal{N}(0, 1)$ as $n \to \infty$, whatever the shape of the original distribution. In practice: for large $n$, $\bar{X}_n$ is approximately $\mathcal{N}(\mu, \sigma^2/n)$.

> **Maths in one line:** `X̄ₙ ≈ N(μ, σ²/n), so SE = σ/√n` — the average is centred on the true mean, its error is bell-shaped, and the typical error shrinks with the square root of the sample size.

**Interview Answer:**

**Say this first (30 sec):** The CLT says the average of n independent draws from almost any distribution — anything with a finite variance — is approximately normal, centred on the true mean with standard error σ/√n. That is why we can put "± 1.96 standard errors" around an accuracy or a conversion rate, and run z-tests in A/B tests, even when per-user data are badly skewed. Because of the √n, four times the data only halves the error bar.

- **What it buys you:** a known error shape for any average, so confidence intervals (Q22), p-values (Q16) and A/B z-tests (Q17) need only a mean and a standard error. 91.0% accuracy on 1,000 rows → SE = √(0.91 × 0.09 / 1,000) = 0.9 points → 95% CI 89.2–92.8%, almost exactly Ch 13's bootstrap (89.1–92.7%).
- **Conditions:** independent rows, a finite variance, a large enough n. Many sessions from one user, or a time series, break independence: the naive SE is usually too small, so resample whole users (cluster bootstrap).
- **How large is "large"?** "n ≥ 30" only suits mild skew. The average's skewness falls as skew/√n: exponential data (skew 2) still has 0.37 at n = 30. Heavy-tailed metrics such as revenue per user can need thousands of rows.
- **In ML training:** a mini-batch gradient is the average of B per-example gradients, so its noise shrinks like 1/√B — 4× the batch only halves the noise ([Ch 8 §8.11](#content/08_core_concepts)).

**Worked example:** average n skewed values 20,000 times — the spread matches σ/√n and the skew fades; then a Cauchy variable, where averaging does nothing.

```python
# CLT by simulation: averages of a skewed variable become bell-shaped, with spread sigma / sqrt(n)
import numpy as np

rng = np.random.default_rng(0)

def skewness(x):
    z = (x - x.mean()) / x.std()
    return (z ** 3).mean()

# Minutes per session ~ Exponential with mean 1 and sigma 1: badly skewed (skewness 2)
mu, sigma = 1.0, 1.0
print(f"{'n':>4}{'SD of means':>13}{'sigma/sqrt(n)':>15}{'skewness':>10}{'low tail':>10}{'high tail':>11}")
for n in (1, 5, 30, 100, 1000):
    means = rng.exponential(mu, size=(20_000, n)).mean(axis=1)
    se = sigma / np.sqrt(n)
    low = (means < mu - 1.96 * se).mean()          # a normal curve puts 2.5% in each tail
    high = (means > mu + 1.96 * se).mean()
    print(f"{n:4d}{means.std():13.3f}{se:15.3f}{skewness(means):10.2f}{low:10.1%}{high:11.1%}")
    if n >= 30:
        assert abs(means.std() / se - 1) < 0.03

# Contrast: Cauchy has no finite variance, so averaging does not help at all
for n in (1, 1000):
    means = rng.standard_cauchy(size=(5_000, n)).mean(axis=1)
    q25, q75 = np.percentile(means, [25, 75])
    print(f"Cauchy, n = {n:4d}: middle 50% of the averages is {q75 - q25:.2f} wide")
```

**Output:**

```
   n  SD of means  sigma/sqrt(n)  skewness  low tail  high tail
   1        0.994          1.000      2.01      0.0%       5.2%
   5        0.450          0.447      0.91      0.0%       4.2%
  30        0.183          0.183      0.37      1.4%       3.6%
 100        0.100          0.100      0.20      2.1%       3.0%
1000        0.032          0.032      0.05      2.4%       2.5%
Cauchy, n =    1: middle 50% of the averages is 1.99 wide
Cauchy, n = 1000: middle 50% of the averages is 1.97 wide
```

At n = 30 the spread already matches σ/√n, but the tails beyond ± 1.96 SE are still lopsided (1.4% and 3.6% instead of 2.5% each); by n = 1,000 they are 2.4% and 2.5%. The Cauchy averages are as wide at n = 1,000 as at n = 1.

**Likely follow-ups:**

- *CLT vs the law of large numbers?* — The law of large numbers says the average converges to μ. The CLT says how the remaining error is distributed: normal, with size σ/√n.
- *Is σ/√n itself the CLT?* — No. Var(X̄) = σ²/n holds for any n by simple algebra on independent values. The CLT adds that the *shape* becomes normal, which is what lets you use 1.96.
- *When does it fail?* — Infinite variance (Cauchy, extreme tails: the averages never tighten) or dependent rows (one user's sessions, time series). Use a median or trimmed mean, a log transform, or a bootstrap over users.

**Trap:** Saying "the CLT makes the data normal" or "n = 30 is always enough" — only the distribution of the *average* becomes normal, it needs independence and a finite variance, and skewed metrics may need thousands of rows.

**Go deeper:** [Ch 6 §3.5](#content/06_math_fundamentals) · [Ch 13 §13.10](#content/13_model_evaluation) · [Ch 17c §4.4](#content/17c_llm_systems)

---

### Q20. What are Type I and Type II errors?
*[All] | ★*

![Interview card Q20, Type I vs Type II errors: a 2 x 2 grid of truth versus decision with Type I error (false alarm, alpha 5%), true positive (power 1 minus beta 80%), true negative (1 minus alpha 95%) and Type II error (missed effect, beta 20%), the power formula, and a table for an A/B test of 60% to 62% showing power 87.6%, 80.0% and 58.9% at alpha 0.10, 0.05 and 0.01 with 9,333 sessions per arm, and 97.7% with 18,666.](diagrams/iq32_info_q20_type_i_ii_errors_ai.png)

**Simple Answer:**

A fire alarm that rings when there is no fire makes a Type I error — a false alarm. An alarm that stays silent during a real fire makes a Type II error — a missed detection. Make the alarm less sensitive and you get fewer false alarms but miss more fires; the only way to cut both is a better detector — in statistics, more data.

In an A/B test, a Type I error ships a change that does nothing; a Type II error kills a change that really works. Which one hurts more depends on the situation.

```
                                        TRUTH (you never see it)
                             H₀ true: no real effect      H₀ false: real effect
                          ┌───────────────────────────┬───────────────────────────┐
  YOU reject H₀           │ TYPE I ERROR              │ Correct: true positive    │
  "it works!"             │ false alarm, rate = α     │ rate = power = 1 − β      │
                          │ usually α = 5%            │ usually designed at 80%   │
                          ├───────────────────────────┼───────────────────────────┤
  YOU fail to reject H₀   │ Correct: true negative    │ TYPE II ERROR             │
  "no proof yet"          │ rate = 1 − α = 95%        │ missed effect, rate = β   │
                          │                           │ usually β = 20%           │
                          └───────────────────────────┴───────────────────────────┘
  Classifier view (Ch 13 §13.2): Type I = false positive (FP), Type II = false negative (FN)
  Fire alarm: Type I = rings with no fire;  Type II = stays silent during a real fire
```

**Official Definition:**

> A **Type I error** is rejecting a null hypothesis $H_0$ that is true (a false positive); its probability is the significance level $\alpha = P(\text{reject } H_0 \mid H_0 \text{ true})$, fixed before the test. A **Type II error** is failing to reject $H_0$ when it is false (a false negative); its probability $\beta$ depends on the true effect size, the sample size and $\alpha$. **Power** $= 1 - \beta$ is the probability of detecting an effect of a given size.

> **Maths in one line:** `power ≈ Φ(|δ| / SE − z₁₋α/₂)`, with `SE ∝ 1/√n` — power rises with the true effect δ and with the sample size, and falls when you make α stricter (Φ = the standard normal CDF; two-sided test).

**Interview Answer:**

**Say this first (30 sec):** A Type I error is a false positive — rejecting a true null, like shipping an A/B "winner" that does nothing; its rate is α, usually 5%. A Type II error is a false negative — missing a real effect; its rate is β, and power = 1 − β is usually designed at 80%. At a fixed sample size they trade off — tightening α from 0.05 to 0.01 drops power from 80% to 59% in a typical test — so the real fix is enough data, chosen by a power analysis before the test starts.

The trade-off in numbers — Ch 17c's test of a 60% → 62% success rate, sized at 9,333 sessions per arm:

| Setting | Type I rate (α) | Power (1 − β) | Type II rate (β) |
|---|---|---|---|
| α = 0.10 | 10% | 87.6% | 12.4% |
| α = 0.05 (standard) | 5% | 80.0% | 20.0% |
| α = 0.01 | 1% | 58.9% | 41.1% |
| α = 0.05, half the sessions (4,666) | 5% | 50.8% | 49.2% |
| α = 0.05, double the sessions (18,666) | 5% | 97.7% | 2.3% |

- **Which is worse depends on cost:** in cancer screening or fraud, a miss (Type II) is expensive, so accept more false alarms; for a risky launch, a false win (Type I) is. For a classifier this is the threshold choice between recall and precision (Q12).
- **Why 5% and 80%?** Conventions: α = 0.05 goes back to R. A. Fisher; Cohen's 80% power treats a miss as 4× more tolerable than a false alarm (β : α = 0.20 : 0.05). Set them from real costs, not habit.
- **What secretly inflates Type I:** peeking daily (5.4% → 19.2% false positives in Ch 17c §4.4) and many metrics (20 at α = 0.05 → 1 − 0.95²⁰ = 64% chance of a false win). Fix: one primary metric; Bonferroni (α/m) or Benjamini–Hochberg.
- **Cutting β without raising α:** more users or a longer run, a lower-variance metric (CUPED, paired designs), or accepting a larger minimum detectable effect.

**Likely follow-ups:**

- *Is α the chance that a "significant" result is wrong?* — No: α = P(reject | H₀ true). The share of wins that are false depends on how many ideas really work. Illustrative: if 100 of 1,000 ideas work, 80% power finds 80 and α = 5% adds 45 false wins — 36% of all wins are false (Bayes again, Q18).
- *How do you choose the sample size?* — Fix α, power and the minimum detectable effect first: n per arm ≈ (z₁₋α/₂ + z₁₋β)² × [p₁(1 − p₁) + p₂(1 − p₂)] ÷ (p₂ − p₁)² = 9,333 for 60% → 62% (Q17, [Ch 17c §4.4](#content/17c_llm_systems)).
- *"Not significant" — so the change has no effect?* — Not necessarily; an underpowered test misses real effects half the time (50.8% power at half the sessions). Report the confidence interval of the effect (Q22).

**Trap:** Saying "just lower α to be safe" — at a fixed sample size that raises β (power 80% → 59% at α = 0.01); only more data, or a less noisy metric, lowers both error rates.

**Go deeper:** [Ch 6 §3.7](#content/06_math_fundamentals) · [Ch 17c §4.4](#content/17c_llm_systems) · [Ch 13 §13.2](#content/13_model_evaluation)

---

### Q21. What is maximum likelihood estimation (MLE)?
*[G][O] | ★★★*

![Interview card Q21 Maximum Likelihood Estimation: 30-second answer, detective analogy, the formula theta star = argmax of the sum of log P(x_i given theta), a bar chart of the coin likelihood p^7 (1 - p)^3 for 7 heads in 10 peaking at p = 0.7 (2.22 vs 0.98 for a fair coin), a Gaussian fit to five plant heights (mean 2.02, sigma 0.172 vs 0.192 with n - 1), a table mapping MSE, cross-entropy, L2 and L1 to MLE or MAP, follow-ups and the likelihood-is-not-a-probability-of-theta trap.](diagrams/iq32_info_q21_mle_ai.png)

**Simple Answer:**

You flip a coin 10 times and get 7 heads. Which coin best explains that — one with P(heads) = 0.5, 0.7 or 0.9? Score each candidate by how probable it makes the flips you actually saw, and keep the winner: p = 0.7 makes this exact sequence 2.3× more likely than a fair coin does. That is maximum likelihood estimation — a detective picking the story that best explains the evidence.

Training most ML models is the same idea: the "story" is the model's weights, and the loss you minimise is minus the log-likelihood.

```
  COIN: 7 heads, 3 tails.   Score each candidate p with L(p) = p⁷ (1 − p)³
  (the probability of this exact sequence of flips)

   p     L(p) × 1,000
  0.3    0.08  ▏
  0.4    0.35  ██
  0.5    0.98  ██████          ← fair coin
  0.6    1.79  ███████████
  0.7    2.22  █████████████   ← MAXIMUM: p = 7/10, 2.3× the fair coin
  0.8    1.68  ██████████
  0.9    0.48  ███
  1.0    0.00                  ← impossible: a tail was seen

  GAUSSIAN: plant heights 2.1, 1.8, 2.3, 2.0, 1.9 (n = 5)
  best mean = sample mean = 2.02      best σ = √[(1/n) Σ (xᵢ − 2.02)²] = 0.172
  (the usual n − 1 formula gives 0.192: MLE divides by n)
```

**Official Definition:**

> **Maximum Likelihood Estimation (MLE)** chooses the parameters $\theta$ that maximise the likelihood $L(\theta) = P(\text{data} \mid \theta) = \prod_i P(x_i \mid \theta)$ for independent observations. Because the logarithm is increasing, this is the same as maximising the log-likelihood $\sum_i \log P(x_i \mid \theta)$, or minimising the negative log-likelihood (NLL) — which turns products into sums and avoids numerical underflow.

> **Maths in one line:** `θ* = argmax_θ Σᵢ log P(xᵢ | θ)` — choose the settings under which the data you actually saw are most probable (Ch 6 §3.6 writes it the same way).

**Interview Answer:**

**Say this first (30 sec):** MLE picks the parameter values that make the observed data most probable — maximise the product of P(xᵢ | θ), in practice the sum of log-probabilities. For 7 heads in 10 flips it gives p = 0.7; for a Gaussian, the sample mean and the divide-by-n variance. It is the principle behind most training losses: minimising MSE is MLE under Gaussian noise, and minimising cross-entropy is MLE for a classifier — including every LLM's next-token loss.

| You minimise… | …which is MLE (or MAP) for | Used in |
|---|---|---|
| MSE | Gaussian noise with a fixed σ | linear regression |
| MAE | Laplace noise | robust regression |
| Cross-entropy (log-loss) | Bernoulli / categorical labels | logistic regression, LLM pre-training |
| Loss + λ‖w‖² (L2) | MAP with a Gaussian prior on the weights | ridge, weight decay |
| Loss + λ‖w‖₁ (L1) | MAP with a Laplace prior on the weights | lasso |

- **Recipe:** write the likelihood, take logs, set the derivative to zero — coin: 7/p − 3/(1 − p) = 0 gives p = 0.7. With no closed form (logistic regression, neural nets), minimise the NLL with gradient descent or L-BFGS.
- **Good properties:** with enough data, under regularity conditions, MLE is consistent (it converges to the true θ) and asymptotically normal with the smallest possible variance — where standard errors come from.
- **Weak spots:** it can be biased — the variance divides by n (σ = 0.172 here vs 0.192 with n − 1) — and it overfits tiny data: 3 heads in 3 flips gives p = 1.0, "tails is impossible". A prior fixes that (MAP, below).

**Worked example:** the coin by grid search, the plant heights (the NLL and the MSE pick the same mean), MAP on 3 flips, and why we sum logs.

```python
# MLE three ways: a coin (7 heads in 10), five plant heights (Gaussian), and why we add logs
import numpy as np

# 1) Coin: log L(p) = heads * log(p) + tails * log(1 - p), searched over a fine grid of p
heads, tails = 7, 3
p = np.linspace(0.001, 0.999, 999)
p_hat = p[np.argmax(heads * np.log(p) + tails * np.log(1 - p))]
L = lambda q: q ** heads * (1 - q) ** tails              # probability of this exact sequence
print(f"coin: p_hat = {p_hat:.3f}  L(0.7) = {L(0.7):.5f}  L(0.5) = {L(0.5):.5f}  ratio {L(0.7) / L(0.5):.2f}")
assert abs(p_hat - heads / (heads + tails)) < 1e-9

# 2) Gaussian: closed form mu_hat = mean, sigma_hat^2 = (1/n) * sum (x - mean)^2
x = np.array([2.1, 1.8, 2.3, 2.0, 1.9])
mu_hat = x.mean()
sigma_hat = np.sqrt(((x - mu_hat) ** 2).mean())          # MLE divides by n
s = x.std(ddof=1)                                         # the unbiased version divides by n - 1
print(f"plants: mu_hat = {mu_hat:.2f}  sigma_MLE = {sigma_hat:.3f}  s (n - 1) = {s:.3f}")

def gaussian_nll(m, sig):                                 # -log L of all five heights
    return len(x) * np.log(sig * np.sqrt(2 * np.pi)) + ((x - m) ** 2).sum() / (2 * sig ** 2)

mus = np.linspace(1.5, 2.5, 1001)
best_nll = mus[np.argmin([gaussian_nll(m, sigma_hat) for m in mus])]
best_mse = mus[np.argmin([((x - m) ** 2).mean() for m in mus])]
print(f"grid search: lowest NLL at mu = {best_nll:.2f}, lowest MSE at mu = {best_mse:.2f}")
assert abs(best_nll - mu_hat) < 1e-9 and best_nll == best_mse

# 3) Tiny data: 3 heads in 3 flips. MAP with a Beta(2, 2) prior = one imaginary head and tail
h, n = 3, 3
print(f"3 of 3 heads: MLE = {h / n:.2f}  MAP = {(h + 1) / (n + 2):.2f}")

# 4) Why logs: 1,100 fair-coin flips. The product underflows to 0; the sum of logs is fine
print(f"product = {0.5 ** 1100}  sum of logs = {1100 * np.log(0.5):.1f}")
assert 0.5 ** 1100 == 0.0
```

**Output:**

```
coin: p_hat = 0.700  L(0.7) = 0.00222  L(0.5) = 0.00098  ratio 2.28
plants: mu_hat = 2.02  sigma_MLE = 0.172  s (n - 1) = 0.192
grid search: lowest NLL at mu = 2.02, lowest MSE at mu = 2.02
3 of 3 heads: MLE = 1.00  MAP = 0.80
product = 0.0  sum of logs = -762.5
```

**Likely follow-ups:**

- *MLE vs MAP vs fully Bayesian?* — MLE maximises P(data | θ). MAP maximises P(data | θ) · P(θ), so the prior acts as a regulariser: Beta(2, 2) turns 3/3 into (3 + 1)/(3 + 2) = 0.8, the add-one smoothing of Naive Bayes. Fully Bayesian keeps the whole posterior, which gives credible intervals (Q22).
- *Why minimise the NLL instead of maximising L?* — Same optimum, but sums are numerically safe and easy to differentiate: 0.5¹¹⁰⁰ underflows to 0.0 in float64, while its log is −762.5.
- *Why does the MLE variance divide by n?* — It measures spread around the sample mean, which was fitted to the same points, so it underestimates; n − 1 (Bessel's correction) removes the bias. The gap vanishes as n grows.

**Trap:** Saying "the likelihood is the probability that θ is correct" — L(θ) = P(data | θ) is a function of θ, not a probability distribution over θ; getting P(θ | data) needs a prior and Bayes' theorem (Q18).

**Go deeper:** [Ch 6 §3.6](#content/06_math_fundamentals) · [Ch 6 §5.2](#content/06_math_fundamentals) · [Ch 12 §12.3](#content/12_key_algorithms)

---

### Q22. Explain confidence intervals. What is the difference from a credible interval?
*[G] | ★★*

![Interview card Q22 Confidence vs Credible Intervals: 30-second answer, a net-throwing analogy, the formulas CI = estimate plus or minus 1.96 x SE versus credible = middle 95% of P(theta given data), ten sample intervals around a fixed true mean of 170 cm with one red interval 165.4-169.3 missing it (9,462 of 10,000 contain 170), prior times likelihood giving a Beta(911, 91) posterior with 95% credible interval 0.891-0.926, a table of Wald versus flat-prior credible intervals for 910/1,000, 3/10 and 0/20, follow-ups and the 95%-chance trap.](diagrams/iq32_info_q22_confidence_vs_credible_ai.png)

**Simple Answer:**

You measure 100 people: average 170 cm, standard deviation 10 cm, so the standard error is 10/√100 = 1 cm and the 95% confidence interval is 170 ± 1.96 ≈ [168, 172] cm. Think of it as a net: you used a net-throwing method that catches the true average 95% of the time. The true average is fixed; it is the net that lands somewhere different with every new sample.

It does NOT mean "there is a 95% chance the true average is in [168, 172]" — that sentence belongs to a Bayesian **credible interval**, which starts from a prior belief, updates it with the data, and then really does put a probability on the parameter.

```
  CONFIDENCE INTERVAL — the true mean is fixed; the interval moves with each sample
  (10 samples of 100 people, each with its own 95% CI = mean ± 1.96 × SE)

                166     168     170     172     174  cm
  sample 1                   ├───┼──────────┤           168.9–172.7  ✓
  sample 2             ├─────────┼─────┤                167.6–171.4  ✓
  sample 3         ├─────────────┼──┤                   166.4–170.8  ✓
  sample 4              ├────────┼─────┤                167.8–171.4  ✓
  sample 5               ├───────┼────────┤             168.0–172.3  ✓
  sample 6                ├──────┼──────┤               168.2–171.8  ✓
  sample 7               ├───────┼───────┤              168.1–172.0  ✓
  sample 8            ├──────────┼────┤                 167.2–171.2  ✓
  sample 9                 ├─────┼────┤                 168.5–171.4  ✓
  sample 10    ├──────────────┤  │                      165.4–169.3  ✗ misses 170
                                 ▲
                      true mean 170 cm (fixed)
  Over 10,000 samples, 9,462 intervals (94.6%) contain 170: the "95%" describes the METHOD.

  CREDIBLE INTERVAL — the data are fixed; the parameter gets a probability
  prior belief × likelihood of the data → posterior → keep its middle 95%
  910 of 1,000 correct, flat prior → posterior Beta(911, 91) → 95% credible 0.891–0.926
```

**Official Definition:**

> A **95% confidence interval** comes from a procedure that, over repeated samples, contains the fixed true parameter 95% of the time; the probability describes the procedure, and any one computed interval either contains the parameter or does not. A **95% credible interval** is a range holding 95% of the posterior distribution $P(\theta \mid \text{data}) \propto P(\text{data} \mid \theta)\,P(\theta)$: given the prior and the data, the parameter lies inside it with probability 0.95.

> **Maths in one line:** `CI = estimate ± 1.96 × SE` (with `SE = s/√n`) versus `credible = middle 95% of P(θ | data)` — the first is a statement about the method, the second about the parameter.

**Interview Answer:**

**Say this first (30 sec):** A 95% confidence interval comes from a procedure that captures the fixed true value in 95% of repeated samples — the 95% belongs to the method, not to this one interval. A 95% credible interval is Bayesian: given a prior and the data, the parameter has a 95% probability of being inside — the statement people usually want to make. With plenty of data and a flat prior they almost coincide (91.0% accuracy on 1,000 rows: 89.2–92.8% vs 89.1–92.6%); they differ with small samples or strong priors.

| | Confidence interval (frequentist) | Credible interval (Bayesian) |
|---|---|---|
| What is random? | the interval — it changes with the sample | the parameter — it has a distribution |
| What "95%" means | 95% of intervals built this way contain the true value | 95% posterior probability that the value is inside |
| Needs a prior? | no | yes — and with little data it matters |
| How to compute | estimate ± 1.96 SE, a t-interval, or bootstrap percentiles | quantiles of the posterior (closed form such as Beta, or MCMC samples) |
| 3 successes in 10 | Wald 0.016–0.584 | flat prior 0.109–0.610; Beta(20, 80) prior 0.139–0.289 |

- **Width shrinks as 1/√n** (SE = s/√n; the CLT of Q19 supplies the 1.96): halving an interval needs 4× the data.
- **Metrics with no formula** (AUC, F1, p95 latency): bootstrap — resample the test rows 1,000 times with replacement and take the 2.5th and 97.5th percentiles ([Ch 13 §13.10](#content/13_model_evaluation)).
- **Rates near 0 or 1:** the normal (Wald) formula breaks — 0 errors in 20 tests gives [0, 0]. Use Wilson, Clopper–Pearson or a Beta posterior (0.001–0.161); the rule of three gives a quick 95% upper bound of 3/n = 15%.
- **When the Bayesian view helps:** small samples, real prior knowledge, or "probability that B beats A" decisions. Always state the prior: on 10 trials, Beta(20, 80) narrows 0.109–0.610 to 0.139–0.289.

**Worked example:** 10,000 repeated samples show what CI coverage means; then Wald and credible intervals for 910/1,000, 3/10 and 0/20.

```python
# What "95%" means: confidence-interval coverage by simulation, then Bayesian credible intervals
import numpy as np
from scipy.stats import beta

# 1) The true mean is FIXED at 170 cm; every new sample of 100 people gives a different interval
rng = np.random.default_rng(0)
true_mu, sd, n = 170.0, 10.0, 100
samples = rng.normal(true_mu, sd, size=(10_000, n))
m = samples.mean(axis=1)
se = samples.std(axis=1, ddof=1) / np.sqrt(n)             # about 10 / sqrt(100) = 1 cm
lo, hi = m - 1.96 * se, m + 1.96 * se
hit = (lo <= true_mu) & (true_mu <= hi)
for i in (0, 9):
    print(f"sample {i + 1:2d}: 95% CI {lo[i]:.1f} - {hi[i]:.1f}   contains 170? {'yes' if hit[i] else 'no'}")
print(f"{int(hit.sum()):,} of 10,000 intervals contain the true 170 cm")
assert 9_300 <= hit.sum() <= 9_700

# 2) A rate: normal-approximation (Wald) CI vs a credible interval from a flat Beta(1, 1) prior
def wald(k, n):
    p = k / n
    half = 1.96 * np.sqrt(p * (1 - p) / n)
    return max(p - half, 0.0), min(p + half, 1.0)

def credible(k, n, a=1, b=1):                             # the posterior is Beta(a + k, b + n - k)
    return beta.ppf([0.025, 0.975], a + k, b + n - k)

for k, n in [(910, 1000), (3, 10), (0, 20)]:
    w, c = wald(k, n), credible(k, n)
    print(f"{k:>3}/{n:<4}  Wald CI {w[0]:.3f}-{w[1]:.3f}   credible (flat prior) {c[0]:.3f}-{c[1]:.3f}")
c = credible(3, 10, a=20, b=80)                           # prior: past rate near 20%, worth 100 trials
print(f"  3/10    credible with a Beta(20, 80) prior {c[0]:.3f}-{c[1]:.3f}")
assert wald(0, 20) == (0.0, 0.0) and credible(0, 20)[1] > 0.15
```

**Output:**

```
sample  1: 95% CI 168.9 - 172.7   contains 170? yes
sample 10: 95% CI 165.4 - 169.3   contains 170? no
9,462 of 10,000 intervals contain the true 170 cm
910/1000  Wald CI 0.892-0.928   credible (flat prior) 0.891-0.926
  3/10    Wald CI 0.016-0.584   credible (flat prior) 0.109-0.610
  0/20    Wald CI 0.000-0.000   credible (flat prior) 0.001-0.161
  3/10    credible with a Beta(20, 80) prior 0.139-0.289
```

With 1,000 rows the two intervals agree within 0.002; with 10 rows the prior moves the answer; with 0 successes the Wald interval collapses to a useless [0, 0].

**Likely follow-ups:**

- *Two models' 95% CIs overlap — so no significant difference?* — Not necessarily. Test the difference itself, ideally paired: in Ch 13 §13.10 the separate CIs (0.891–0.927 and 0.902–0.936) overlap, but the paired CI of B − A is +0.002 to +0.019.
- *Is the CI where 95% of people's heights fall?* — No, that is a prediction interval: 170 ± 1.96 × 10 × √(1 + 1/100) ≈ 150–190 cm, ten times wider than the CI for the mean.
- *Why 94.6% and not 95% in the simulation?* — Mostly the 1.96: it assumes σ is known. With σ estimated from 100 people the exact multiplier is the t value 1.98; 1.96 gives 94.7% in theory, and 10,000 repeats wobble by about ± 0.2 points.

**Trap:** Saying "there is a 95% chance the true mean is in [168, 172]" — that is the credible-interval reading. For a confidence interval say "95% of intervals built this way contain the true mean"; and overlapping intervals do not prove "no difference".

**Go deeper:** [Ch 13 §13.10](#content/13_model_evaluation) · [Ch 13 §13.11](#content/13_model_evaluation) · [Ch 6 §3.4](#content/06_math_fundamentals)

---

# PART 3 — Deep Learning

---

### Q23. How does backpropagation work? ★★★
*[All] | ★★★*

![Interview card Q23 Backpropagation: 30-second answer, salty-cake analogy, the layer recursion delta_l = (W_l+1 transpose delta_l+1) times f prime of z_l and dL/dW_l = delta_l times a_l-1 transpose, a worked sigmoid neuron (x = 1, w = 2, b = 1, y = 0) with a blue forward row z = 3, y-hat = 0.953, L = 3.049 and a red backward row 21.09 x 0.045 x 1 = 0.953, an update with alpha 0.1 taking w from 2 to 1.905 and the loss 3.049 to 2.518, a cost table (backward about 2x forward, 6 vs 2 FLOPs per parameter per token, checkpointing), follow-ups and the backprop-does-not-update-weights trap.](diagrams/iq32_info_q23_backpropagation_ai.png)

**Simple Answer:**

Imagine you baked a terrible cake and need to work out what went wrong. You trace back through the steps: too salty → the salt came in at step 3 → because the measurement at step 1 was wrong. Backpropagation does the same for a network: it starts from the error at the output and passes the blame backwards, layer by layer, until every weight knows how much it contributed and which way to move.

It needs two passes. The forward pass makes a prediction and remembers every intermediate number; the backward pass multiplies small local slopes (the chain rule) from the loss back to each weight.

```
  One sigmoid neuron (Ch 14 §14.5): x = 1, w = 2, b = 1, true label y = 0

  FORWARD (keep every value)         BACKWARD (multiply the local slopes)
  ───────────────────────────────    ───────────────────────────────────────
  z = w·x + b      = 3               ∂L/∂ŷ = 1 / (1 − ŷ)        = 21.09
  ŷ = σ(z)         = 0.953           ∂ŷ/∂z = ŷ · (1 − ŷ)        =  0.045
  L = −log(1 − ŷ)  = 3.049           ∂z/∂w = x                  =  1
                                     ∂L/∂w = 21.09 × 0.045 × 1  =  0.953
                                     (shortcut: ŷ − y = 0.953)

  UPDATE, α = 0.1:   w ← 2 − 0.1 × 0.953 = 1.905      b ← 1 − 0.1 × 0.953 = 0.905
  Repeat:            loss 3.049 → 2.868 → 2.691 → 2.518

  A DEEP NET — one backward sweep; each layer reuses the signal from above:
    δ_out   = ŷ − y                          error at the output
    δ_l     = (W_{l+1}ᵀ δ_{l+1}) ⊙ f′(z_l)   sent back through the weights
    ∂L/∂W_l = δ_l · a_{l−1}ᵀ                 × the input the weight multiplied
```

**Official Definition:**

> **Backpropagation** (popularised for neural networks by Rumelhart, Hinton & Williams, 1986) computes the gradient of the loss with respect to every parameter by applying the chain rule backwards through the network's computation graph — reverse-mode automatic differentiation. Each node multiplies the gradient arriving from above by its own local derivative and passes the result down; where a value feeds several nodes, the incoming gradients add. An optimizer such as SGD or Adam then uses these gradients to update the weights.

> **Maths in one line:** `δ_l = (W_{l+1}ᵀ δ_{l+1}) ⊙ f′(z_l)` and `∂L/∂W_l = δ_l · a_{l−1}ᵀ` — a layer's error signal is the next layer's signal sent back through its weights, times this layer's activation slope; a weight's gradient is that signal times the input it multiplied.

**Interview Answer:**

**Say this first (30 sec):** Backpropagation is the chain rule applied efficiently. The forward pass computes the loss and stores every intermediate value; the backward pass starts at the loss and, layer by layer, multiplies the incoming gradient by each layer's local derivative, so one sweep gives the gradient of every weight. It costs about two forward passes, so a training step is roughly three — and then an optimizer uses those gradients to update the weights.

- **Why it is cheap:** each layer's signal δ is computed once and reused by every weight below it. Finite differences would need N + 1 forward passes for N weights — 7 billion passes per step for a 7B model.
- **Cost:** a linear layer's backward pass is two matrix multiplies (δ·aᵀ for the weights, Wᵀ·δ for the layer below) against one forward, so backward ≈ 2× forward. Hence training ≈ 6 FLOPs per parameter per token, inference ≈ 2.
- **Memory is the price:** every forward activation stays in memory until the backward pass uses it. Activation checkpointing recomputes them instead: about 30% more compute for 5–10× less activation memory.
- **Reverse mode, not forward mode:** one scalar loss and millions of parameters, so one backward sweep gives all gradients; forward-mode differentiation would need one pass per parameter.
- **Branches add:** when a value feeds two layers, its gradient is the sum of both paths — forgetting that sum is the classic hand-derivation bug.
- **Check it:** compare with a central difference `(L(w+ε) − L(w−ε)) / 2ε`; a relative error below about 10⁻⁶ passes. [Ch 16 §1.1](#content/16_deep_learning) runs this check on every weight of its 2-2-1 network.

**Likely follow-ups:**

- *Backprop vs gradient descent?* — Backprop only computes the gradients; gradient descent (or Adam) is the rule that uses them to change the weights. You can backprop without updating, e.g. for a gradient check or a saliency map.
- *What goes wrong in very deep networks?* — The gradient is a product of one factor per layer, so it can vanish or explode (Q24); ReLU-family activations, residual connections, normalization, good initialization and clipping keep it near 1.
- *How do you backprop through ReLU's kink or a discrete choice?* — Frameworks use ReLU′(0) = 0. A sampling or argmax step has no useful gradient: use a straight-through estimator, Gumbel-softmax or REINFORCE.

**Trap:** Saying "backprop updates the weights" — it only computes ∂L/∂w for every weight; the optimizer updates afterwards, and only once the whole backward pass is done (updating W₂ before computing W₁'s gradient mixes two different networks).

**Go deeper:** [Ch 14 §14.5](#content/14_neural_networks) · [Ch 16 §1.1](#content/16_deep_learning) · [Ch 06 §2.3](#content/06_math_fundamentals)

---

### Q24. What are vanishing and exploding gradients? How do you fix them? ★★★
*[All] | ★★★*

![Interview card Q24 Vanishing and Exploding Gradients: 30-second answer, a whispered-message analogy, the formula dL/dw1 proportional to the product over layers of f prime of z_l times W_l, a chart of three curves (factor 0.25 vanishes to 0.000001 after 10 layers, factor 1 stays at 1, factor 1.5 explodes to about 3,300 after 20), a plain 50-layer stack giving 10^-100 versus 50 residual blocks giving 1.01^50 = 1.64 through the identity path, five fix chips, a table of 10-layer nets (sigmoid + Xavier 2.9 x 10^-7, ReLU + He 1.58, ReLU with 1.5 x He weights 91), follow-ups and the clipping-does-not-fix-vanishing trap.](diagrams/iq32_info_q24_vanishing_exploding_gradients_ai.png)

**Simple Answer:**

Imagine passing a message along a line of 100 people. If each person whispers it a little quieter (×0.5), by person 100 it is gone: 0.5¹⁰⁰ ≈ 8 × 10⁻³¹. That is a **vanishing** gradient — the learning signal never reaches the early layers, so they stop learning. If each person shouts louder (×2), it becomes deafening: 2¹⁰⁰ ≈ 1.3 × 10³⁰. That is an **exploding** gradient — the updates are huge and the loss jumps to NaN.

Backprop multiplies the gradient by one factor per layer, so the fix is to keep every factor close to 1.

```
  Gradient reaching layer 1  ≈  (factor per layer) ^ depth

  factor 0.25 (sigmoid's largest slope), 10 layers:   0.25¹⁰ ≈ 0.000001   VANISHES
  factor 1    (active ReLU),             10 layers:      1¹⁰ = 1          STABLE
  factor 1.5  (weights too large),       20 layers:   1.5²⁰  ≈ 3,300      EXPLODES

  Real 10-layer nets, width 64 — a gradient of 1 sent back (Ch 14 §14.6):
    sigmoid + Xavier init      →  2.9 × 10⁻⁷ at layer 1   (early layers frozen)
    ReLU + He init             →  1.58                    (healthy)
    ReLU, weights 1.5 × He     →  91                      (1.5¹⁰ ≈ 58 × 1.58)

  Residual block  y = x + F(x)   →   ∂y/∂x = 1 + F′(x)   (an identity highway)
    50 plain layers,     local slope 0.01 each:   0.01⁵⁰ = 10⁻¹⁰⁰
    50 residual blocks,  slope 1 + 0.01 each:     1.01⁵⁰ ≈ 1.64     (Ch 16 §2.1)
```

**Official Definition:**

> **Vanishing gradients** occur when gradients shrink exponentially as they are propagated back through many layers (or many time steps in an RNN), so early layers learn extremely slowly or not at all. **Exploding gradients** are the reverse: gradients grow exponentially, giving huge, unstable updates and often NaN losses. Both come from the chain rule multiplying one factor per layer — an activation slope times a weight matrix.

> **Maths in one line:** `∂L/∂w₁ ∝ Π_l f′(z⁽ˡ⁾) · W⁽ˡ⁾` — one factor per layer: if the factors are below 1 on average the product shrinks like 0.25¹⁰ ≈ 10⁻⁶; above 1 it grows like 1.5²⁰ ≈ 3,300.

**Interview Answer:**

**Say this first (30 sec):** Backprop multiplies the gradient by one factor per layer — an activation slope times the weights — so in a deep network or a long RNN it shrinks or grows exponentially. Ten sigmoid layers can leave only 0.25¹⁰ ≈ one-millionth of the signal (vanishing); factors of 1.5 over 20 layers multiply it by about 3,300 (exploding). The fixes keep every factor near 1: ReLU-family activations with He initialization, residual connections, normalization, gated RNNs, and gradient clipping for explosions.

| Fix | How it keeps the factor near 1 | Mainly fixes |
|---|---|---|
| ReLU-family activation + He init | Slope 1 when active; `Var(w) = 2/n_in` keeps the signal's size per layer | Vanishing (init: both) |
| Residual connections | `∂y/∂x = 1 + F′(x)`: the gradient always has an identity path | Vanishing in deep nets |
| Normalization (BatchNorm, LayerNorm, RMSNorm) | Re-scales activations at every layer, so slopes stay out of flat regions | Both |
| LSTM / GRU gates | Cell state is updated by adding; along it the gradient is scaled only by the forget gate | Vanishing through time |
| Gradient clipping | `g ← g · min(1, c/‖g‖)`: same direction, length capped (c = 1.0 in LLM recipes) | Exploding only |

- **Diagnose it:** log the gradient norm per layer. Vanishing: early layers' norms are orders of magnitude below the last layers' and the loss plateaus. Exploding: norm spikes, loss jumps, then NaN.
- **Why sigmoid and tanh hurt:** σ′ ≤ 0.25 everywhere, and both slopes approach 0 once |z| is large (saturation). ReLU's slope is exactly 1 when active.
- **2026 practice:** large Transformers stack pre-norm RMSNorm, residual paths, careful init, learning-rate warmup and clipping at 1.0; loss spikes still happen, so recipes add QK-norm and z-loss ([Ch 16 §7.2](#content/16_deep_learning)).

**Likely follow-ups:**

- *Why do RNNs suffer most?* — The same weights multiply the gradient at every time step: a factor of 0.9 leaves 0.9¹⁰⁰ ≈ 0.00003 after 100 steps. An LSTM's forget gate near 1 keeps it: f = 0.99 leaves 0.37.
- *Does ReLU solve it?* — Only the activation part. The weight factors still matter (1.58 → 91 just by scaling weights 1.5×), and a ReLU stuck at z < 0 passes zero gradient (dead ReLU).
- *Why does He initialization use 2/n_in?* — Each neuron sums n_in inputs, so `Var(z) ≈ n_in · Var(w) · Var(x)`; ReLU zeroes half the signal, so doubling `1/n_in` keeps the size constant ([Ch 14 §14.6](#content/14_neural_networks)).

**Trap:** Saying "gradient clipping fixes vanishing gradients" — clipping only shrinks gradients that are too large; a vanishing gradient needs a better path (ReLU, residuals, normalization, gating, initialization).

**Go deeper:** [Ch 14 §14.6](#content/14_neural_networks) · [Ch 16 §1.6](#content/16_deep_learning) · [Ch 16 §1.8](#content/16_deep_learning) · [Ch 16 §2.1](#content/16_deep_learning) · [Ch 16 §3.1](#content/16_deep_learning)

---

### Q25. What is the attention mechanism and how do Transformers work? ★★★
*[G][O] | ★★★*

![Interview card Q25 Attention and Transformers: 30-second answer, the it-refers-to-animal analogy, the formula Attention(Q, K, V) = softmax(Q K transpose / sqrt(d_k)) V, the sentence The animal did not cross the street because it was tired with an arrow from it to animal (weight 0.85) and a bar list of illustrative weights (street 0.05, others 0.02, 0.01, 0.00), one pre-norm Transformer block x, Norm, multi-head attention, add, Norm, FFN, add with two residual arrows, stacked 6 times in the 2017 base model and 32 in Llama 2 7B, a key-numbers table (d_k = 64, BERT-base 12 x 64 = 768, Llama 2 7B 32 x 128 = 4,096, FFN about 2/3 of weights, O(n^2 d) with 67M scores at n = 8,192), follow-ups and the Q = K = V trap.](diagrams/iq32_info_q25_attention_transformers_ai.png)

**Simple Answer:**

Read "The animal didn't cross the street because it was tired." To understand "it", you glance back at "animal" and "street" and pick the one that can be tired. Swap "tired" for "wide" and you pick "street" instead.

Attention does this for every word at once: each word scores every other word for relevance and builds its new meaning as a weighted blend of them. A Transformer stacks many layers of this, each followed by a small per-word network, and processes all the words in parallel instead of one after another like an RNN.

```
  "The animal didn't cross the street because it was tired"
  One head's weights for the token "it" (illustrative; they sum to 1)

    animal                      █████████████████  0.85   ← "tired" fits an animal
    street                      █                  0.05
    The, the, because                              0.02 each
    didn't, cross, was, tired                      0.01 each
    it (itself)                                    0.00

    new vector for "it" = 0.85·v(animal) + 0.05·v(street) + ...
    Google's 2017 demo: with "too wide" instead, the weight moved to "street".

  ONE BLOCK, stacked N times (6 in the 2017 base model; 32 in Llama 2 7B)

    x ─┬─► Norm ─► Multi-head attention ─► (+) ─┬─► Norm ─► FFN ─► (+) ─► next block
       │                                    ▲   │                   ▲
       └──────────── residual ──────────────┘   └───── residual ────┘
    (modern "pre-norm" order; the 2017 paper applied the norm after each addition)
```

**Official Definition:**

> **Attention** computes each output as a weighted average of **value** vectors, with weights given by a softmax over the similarity of a **query** with every **key**. In **self-attention** the queries, keys and values are three learned projections of the same sequence: `Q = X·W_Q`, `K = X·W_K`, `V = X·W_V`. A **Transformer** (Vaswani et al., 2017) stacks N identical blocks — multi-head self-attention, then a position-wise feed-forward network, each wrapped in a residual connection and layer normalization — and injects position information, because attention by itself ignores word order. With no recurrence, all positions are processed in parallel.

> **Maths in one line:** `Attention(Q, K, V) = softmax(Q·Kᵀ / √d_k) · V` — score every key against every query, divide by √d_k so the softmax does not saturate, turn each row of scores into weights that sum to 1, and take the weighted average of the values.

**Interview Answer:**

**Say this first (30 sec):** Attention lets each token build a new representation as a weighted average of every token's value vector, with the weights a softmax of its query's dot products with all the keys, scaled by √d_k. A Transformer stacks N blocks of multi-head self-attention plus a per-token feed-forward network, each with a residual connection and normalization. With no recurrence, every token is processed in parallel and is one hop from every other — at a cost that grows as n² with sequence length.

| Part | What it does | Numbers to quote |
|---|---|---|
| Q, K, V projections | What I look for / what I contain / what I hand over | d_k = 64 per head (2017 model, BERT-base) |
| Multi-head attention | h heads attend in parallel on d_model/h slices; `W_O` mixes them | BERT-base 12 × 64 = 768; Llama 2 7B 32 × 128 = 4,096 |
| Feed-forward network | The same 2-layer MLP applied to each token, about 4 × d_model wide | About 2/3 of a block's weights (8d² of 12d²) |
| Residual + norm | `x + sublayer(norm(x))` keeps gradients flowing through deep stacks | LLMs: pre-norm RMSNorm |
| Positions | Attention is order-blind, so positions are added or rotated in | Sinusoidal (2017), learned (BERT), RoPE (Llama, Gemma) |

- **Why it replaced RNNs:** n sequential steps become a few large matrix multiplies, and token 1 is one hop from token n instead of n − 1. The 2017 big model reached 28.4 BLEU on WMT 2014 English→German after 3.5 days on 8 P100 GPUs.
- **The price:** `O(n²·d)` work per layer and an n × n score matrix per head — 67M scores at n = 8,192 — plus a KV cache that grows with every generated token ([Q7 in Ch 33](#content/33_llm_interview_questions)).
- **Three shapes:** encoder-only (BERT: bidirectional, for classification and embeddings), decoder-only with a causal mask (GPT, Gemini, Llama: generation), encoder–decoder (T5 and the original translation model).

**Likely follow-ups:**

- *Why divide by √d_k?* — A dot product of d_k unit-variance terms has a standard deviation of √d_k (8 at d_k = 64); unscaled, the softmax turns nearly one-hot and its gradients vanish.
- *How does a decoder avoid seeing the future?* — A causal mask sets the scores of later positions to −∞ before the softmax, so token t attends only to tokens ≤ t.
- *Does each head learn one job, like syntax or coreference?* — Some heads do: Clark et al. (2019) found BERT heads tracking direct objects and coreferent mentions. But many heads are redundant: Michel et al. (2019) removed a large share at test time with little loss.

**Trap:** Saying "in self-attention Q = K = V = the input" — they are three different learned projections of the input (`X·W_Q`, `X·W_K`, `X·W_V`); without them a token could not separately learn what to look for, what to advertise and what to pass on.

**Go deeper:** [Q2, Q3 and Q8 in Ch 33](#content/33_llm_interview_questions) · [Ch 16 §3.3](#content/16_deep_learning) · [Ch 17 §2.4](#content/17_llm) · [Ch 14 §14.10](#content/14_neural_networks)

---

### Q26. What is word2vec/embeddings? What is the intuition behind them?
*[G][O] | ★★*

![Interview card for Q26 word2vec and word embeddings: 30-second answer, house-in-a-city analogy, the skip-gram negative-sampling loss, a three-panel diagram (skip-gram window 2 on 'the cat drinks warm milk', negative sampling with k = 3 random pairs, and a 2-D map where cos(cat, dog) goes from -0.20 to +0.99), a skip-gram vs CBOW comparison table, follow-ups on GloVe and fastText, and the king - man + woman trap.](diagrams/iq32_info_q26_word2vec_embeddings_ai.png)

**Simple Answer:**

Imagine every word is a house in a city. Words with similar meanings live in the same neighbourhood: "king" next to "queen", "cat" next to "dog", far from the royals. An embedding is a word's address — a list of a few hundred numbers — and similar meanings get nearby addresses.

word2vec finds the addresses with one idea: "you shall know a word by the company it keeps" (J. R. Firth, 1957). It reads billions of sentences and nudges the vectors so that each word can predict the words around it. "Cat" and "dog" keep the same company (drinks, milk, chases, ball), so they end up neighbours even if they never appear in the same sentence.

```
  SKIP-GRAM, window 2 — slide over "the cat drinks warm milk"; center word = cat
      cat → the      cat → drinks      cat → warm      ("milk" is 3 away: outside)
  CBOW, same window — average the neighbours, predict the middle
      [the, drinks, warm] → cat

  NEGATIVE SAMPLING, k = 3 — one real pair against 3 random words
      (cat, drinks)   real     push σ(u_drinks · v_cat) up, toward 1
      (cat, crown)    random   push σ(u_crown · v_cat) down, toward 0
      (cat, rules)    random   down
      (cat, land)     random   down

  RESULT — "cat" and "dog" never share a window, but share neighbours
  (drinks, milk, chases, ball), so their vectors line up:
      cos(cat, dog):  −0.20 at the random start  →  +0.99 after training

  FAMOUS: king − man + woman ≈ queen
          (the nearest neighbour once the 3 input words are excluded)
```

**Official Definition:**

> **Word embeddings** are dense vectors — typically 100–300 numbers per word — learned so that words used in similar contexts get nearby vectors. **word2vec** (Mikolov et al., Google, 2013) learns them with a shallow model that has no hidden non-linearity: **skip-gram** predicts each word inside a window from the center word; **CBOW** (continuous bag of words) predicts the center word from the average of its neighbours' vectors. **Negative sampling** replaces a softmax over the whole vocabulary with k + 1 binary "real pair or random pair?" logistic regressions, which makes training on billions of words cheap.

> **Maths in one line:** `loss = −log σ(u_o · v_c) − Σᵢ₌₁ᵏ log σ(−u_i · v_c)` — the real context word o must score high with the center word c, and k noise words drawn with probability ∝ count^0.75 must score low; v holds the center ("input") vectors, u the context ("output") vectors.

**Interview Answer:**

**Say this first (30 sec):** Word embeddings map each word to a dense vector — typically 300 numbers — so that words used in similar contexts end up close by cosine similarity. word2vec learns them self-supervised from raw text: skip-gram predicts the words around each word, CBOW predicts a word from its neighbours, and negative sampling turns each prediction into a few cheap logistic regressions. Google's 2013 release had 300-dimensional vectors for 3 million words and phrases, trained on about 100 billion words of news.

| | Skip-gram | CBOW |
|---|---|---|
| Predicts | Each neighbour from the center word | The center word from its averaged neighbours |
| Speed | Slower: one prediction per (center, neighbour) pair | Faster: one prediction per position |
| Strength | Better vectors for rare words | Speed on large corpora |
| Typical window | About 10 | About 5 |

- **Negative sampling:** each pair costs k + 1 dot products instead of a softmax over all 3 million words and phrases. The paper's advice: k = 5–20 on small data, 2–5 on large; noise ∝ count^0.75, so rare words are drawn more than their raw share.
- **Subsampling frequent words:** each occurrence is dropped with probability `1 − √(t / f)`, t ≈ 10⁻⁵. A word that makes up 5% of the text, like "the", is dropped 98.6% of the time; words rarer than t are always kept.
- **Limits:** one vector per word ("bank" is the same in river bank and bank loan), no vector for unseen words, analogies that hold only for some relations, and biases absorbed from the text.
- **Today:** contextual models (BERT, LLMs) give each occurrence its own vector, and sentence-embedding models power search and RAG ([Q32 in Ch 33](#content/33_llm_interview_questions)). An LLM's embedding table is still a word2vec-style lookup.

**Worked example:** skip-gram with negative sampling trained on eight three-word sentences. "cat" and "dog" never share a window, yet their vectors end up almost parallel; "cat" and "king" stay unrelated.

```python
# Skip-gram with negative sampling on 8 toy sentences: words that share contexts get similar vectors
import numpy as np

sentences = ["cat drinks milk", "dog drinks milk", "cat chases ball", "dog chases ball",
             "king rules land", "queen rules land", "king wears crown", "queen wears crown"]
words = sorted({w for s in sentences for w in s.split()})
idx = {w: i for i, w in enumerate(words)}
pairs = [(idx[s[i]], idx[s[j]]) for s in map(str.split, sentences)       # (center, context), window 2
         for i in range(len(s)) for j in range(len(s)) if i != j and abs(i - j) <= 2]
print(f"{len(words)} words, {len(pairs)} pairs; cat's contexts: {[words[o] for c, o in pairs if c == idx['cat']]}")
assert (idx["cat"], idx["dog"]) not in pairs                              # cat and dog never share a window

rng = np.random.default_rng(0)
V, d, k, lr = len(words), 8, 3, 0.05                                      # vocab, dims, negatives, step
counts = np.bincount([c for c, _ in pairs], minlength=V)
p_neg = counts ** 0.75 / (counts ** 0.75).sum()                           # word2vec's unigram^(3/4) noise
W_in, W_out = rng.normal(0, 0.1, (V, d)), rng.normal(0, 0.1, (V, d))     # center and context vectors
c, o = np.array(pairs).T
sig = lambda x: 1 / (1 + np.exp(-x))
cos = lambda a, b: W_in[idx[a]] @ W_in[idx[b]] / np.linalg.norm(W_in[idx[a]]) / np.linalg.norm(W_in[idx[b]])
print(f"before: cos(cat, dog) = {cos('cat', 'dog'):+.2f}   cos(cat, king) = {cos('cat', 'king'):+.2f}")

for epoch in range(1, 301):                                               # full-batch gradient descent
    neg = rng.choice(V, size=(len(pairs), k), p=p_neg)                    # k random "fake" contexts per pair
    v, s_pos, s_neg = W_in[c], (W_out[o] * W_in[c]).sum(1), np.einsum("nkd,nd->nk", W_out[neg], W_in[c])
    if epoch in (1, 300):                                                 # SGNS loss: -log s(pos) - sum log s(-neg)
        print(f"epoch {epoch:3d}: loss = {(-np.log(sig(s_pos)) - np.log(sig(-s_neg)).sum(1)).mean():.3f}")
    g_pos, g_neg = sig(s_pos) - 1, sig(s_neg)                             # d loss / d score
    grad_in = g_pos[:, None] * W_out[o] + np.einsum("nk,nkd->nd", g_neg, W_out[neg])
    np.add.at(W_out, o, -lr * g_pos[:, None] * v)
    np.add.at(W_out, neg, -lr * g_neg[:, :, None] * v[:, None, :])
    np.add.at(W_in, c, -lr * grad_in)

print(f"after:  cos(cat, dog) = {cos('cat', 'dog'):+.2f}   cos(king, queen) = {cos('king', 'queen'):+.2f}"
      f"   cos(cat, king) = {cos('cat', 'king'):+.2f}")
for w in ("cat", "queen", "milk"):
    print(f"nearest to {w:5s}: {max((x for x in words if x != w), key=lambda x: cos(w, x))}")
assert cos("cat", "dog") > 0.8 and cos("king", "queen") > 0.8 and cos("cat", "king") < 0.3
```

**Output:**

```
12 words, 48 pairs; cat's contexts: ['drinks', 'milk', 'chases', 'ball']
before: cos(cat, dog) = -0.20   cos(cat, king) = -0.22
epoch   1: loss = 2.771
epoch 300: loss = 1.261
after:  cos(cat, dog) = +0.99   cos(king, queen) = +0.99   cos(cat, king) = -0.01
nearest to cat  : dog
nearest to queen: king
nearest to milk : drinks
```

The first loss is close to 4 × ln 2 = 2.77: at the random start each of the 1 + k = 4 yes/no decisions is a coin flip. Nothing told the model that cats and dogs are alike — shared contexts did.

**Likely follow-ups:**

- *word2vec vs GloVe?* — GloVe (Stanford, 2014) fits vectors to the logarithm of global co-occurrence counts by weighted least squares; word2vec streams local windows. Levy & Goldberg (2014) showed that skip-gram with negative sampling implicitly factorises a shifted PMI matrix (PMI − log k), so the two are close cousins.
- *What about words not in the vocabulary?* — word2vec has no vector for them. fastText builds a word's vector from its character n-grams, so new or misspelled words still get one; LLMs sidestep the problem with subword tokens.
- *How do you evaluate embeddings?* — Intrinsically, by correlation with human word-similarity ratings and by analogy accuracy; extrinsically — the test that matters — by whether a downstream task improves.

**Trap:** Saying word2vec "understands" meaning or that king − man + woman equals queen exactly — it learns co-occurrence statistics; the analogy is a nearest-neighbour result with the three input words excluded, it holds only for some relations, and the same arithmetic surfaces social biases learned from the text.

**Go deeper:** [Ch 17 §2.3](#content/17_llm) · [Q32 in Ch 33](#content/33_llm_interview_questions) · [Ch 17b §10.1](#content/17b_llm_applications) · [Ch 16 §4.1](#content/16_deep_learning)

---

### Q27. What is batch normalization? Why does it help?
*[All] | ★★*

![Interview card for Q27 batch normalization: 30-second answer, factory standardiser analogy, the 2015 paper's 72.2% accuracy in 2.1M steps instead of 31M, the formula x-hat = (x - mean) / sqrt(variance + eps) and y = gamma x-hat + beta, a four-step pipeline on the batch 2, 4, 6, 8 (mean 5, variance 5, std 2.24, normalized -1.34, -0.45, 0.45, 1.34), train vs eval lanes (input 6.0 gives +0.45, -1.34 or 0.00 in training and always +0.39 in eval), a BatchNorm vs LayerNorm vs RMSNorm table, follow-ups and the model.eval() trap.](diagrams/iq32_info_q27_batch_normalization_ai.png)

**Simple Answer:**

Imagine a factory line where each worker passes parts to the next. If worker 1 sends parts that are randomly huge one day and tiny the next, worker 2 wastes effort re-adjusting instead of doing the real job. Batch normalization puts a standardiser between the workers: every layer receives its inputs at a consistent scale, so each layer can learn without chasing the ones before it.

During training it measures the scale from the current mini-batch; at test time it uses averages remembered from training, so one example's answer never depends on the others in its batch.

```
  One neuron, a mini-batch of 4 (Ch 14 §14.7):  x = [2, 4, 6, 8]

  1. mean           μ_B  = (2 + 4 + 6 + 8) / 4  = 5
  2. variance       σ²_B = (9 + 1 + 1 + 9) / 4  = 5     (std 2.24)
  3. normalize      x̂    = (x − 5) / 2.24       = [−1.34, −0.45, 0.45, 1.34]
  4. scale, shift   y    = γ · x̂ + β            (γ = 1, β = 0 at start; learned)

  TRAIN: this batch's statistics           EVAL: running averages from training
  input 6.0 → +0.45, −1.34 or 0.00         input 6.0 → always +0.39
  (depends on its batch-mates)             (running ← 0.9 × running + 0.1 × batch)

  WHICH NUMBERS ARE AVERAGED?
  BatchNorm   one feature (CNN: channel) across the batch   → CNNs
  LayerNorm   one example (token) across its features       → Transformers
  RMSNorm     LayerNorm without the mean (÷ RMS)            → modern LLMs
```

**Official Definition:**

> **Batch Normalization** (Ioffe & Szegedy, Google, 2015) standardises each feature — each channel in a CNN, pooled over batch and pixels — to zero mean and unit variance using the statistics of the current mini-batch, then applies a learned scale γ and shift β so the layer can still reach any range it needs. At inference it uses running averages of the mean and variance collected during training, so it becomes a fixed per-channel scale and shift.

> **Maths in one line:** `x̂ = (x − μ_B) / √(σ²_B + ε),  y = γ·x̂ + β` — subtract the batch mean, divide by the batch standard deviation (ε ≈ 10⁻⁵ only prevents division by zero), then let the learned γ and β set the final scale and centre.

**Interview Answer:**

**Say this first (30 sec):** BatchNorm normalizes each feature to zero mean and unit variance over the mini-batch, then applies a learned scale and shift. It lets deep CNNs train with much higher learning rates and less careful initialization — the 2015 paper matched Inception's accuracy in 14× fewer steps — and the batch noise adds mild regularization. At inference it switches to running averages, which is where most BatchNorm bugs come from.

- **Why it helps (hedge this):** the paper credited reducing "internal covariate shift". Santurkar et al. (NeurIPS 2018) showed that has little to do with it: BatchNorm makes the loss surface smoother, so gradients are more predictive and larger steps are safe.
- **The paper's numbers (Inception, ImageNet):** with BatchNorm and 5× the learning rate it reached Inception's 72.2% accuracy in 2.1M steps instead of 31M; at 30× it peaked at 74.8%. With sigmoids it trained to 69.8%, where plain Inception stayed at chance.
- **Train vs eval:** `model.eval()` switches to running statistics (PyTorch momentum 0.1). Small batches make the batch statistics noisy — the batch mean wobbles by σ/√B, ±71% of σ at B = 2 — so below about 16–32 examples per device use GroupNorm or LayerNorm.
- **Placement and cost:** the paper puts it after the linear or conv layer, before the activation; that layer's bias becomes redundant (β replaces it). At inference γ, β, μ and σ fold into the preceding conv's weights, so it costs nothing.
- **Why Transformers do not use it:** variable lengths and padding make "one feature across the batch" ill-defined, and statistics would leak between sequences. They use LayerNorm or RMSNorm, which normalize each token on its own.

**Likely follow-ups:**

- *BatchNorm vs LayerNorm?* — BatchNorm averages one feature down the batch; LayerNorm averages one example across its features, so it has no batch dependence, no running statistics and works at batch size 1.
- *Can it replace dropout?* — Sometimes: the paper removed dropout from BN-Inception without more overfitting, and ResNets use BatchNorm without dropout. It is a mild regularizer, not a guaranteed substitute.
- *What goes wrong in distributed training or fine-tuning?* — With a few examples per GPU each device's statistics are noisy: use SyncBatchNorm to share them across devices, or freeze the BatchNorm statistics when fine-tuning with small batches.

**Trap:** Saying BatchNorm behaves the same in training and inference — training uses the current batch's statistics and inference the running averages, so forgetting `model.eval()` makes a prediction change with its batch-mates (6.0 → +0.45 or −1.34 in Ch 14's example).

**Go deeper:** [Ch 14 §14.7](#content/14_neural_networks) · [Ch 16 §1.5](#content/16_deep_learning)

---

### Q28. Explain dropout. Why does it work as regularization? ★★★
*[All] | ★★*

![Interview card for Q28 dropout: 30-second answer, coach benching random players analogy, co-adapted weights +12 / -10 fitting as well as +1 / +1, the formula E of loss with dropout = MSE + p/(1-p) x sum of w_j squared x mean of x_j squared, a training network with p = 0.5 (two hidden units kept x2, two dropped) beside an inference network with every unit on, the activation example 0.9, 0.4, 0.7, 0.2, 0.6, 0.8 with mask 1, 0, 1, 0, 0, 1 giving 1.8, 0, 1.4, 0, 0, 1.6, a why-it-works table (1.27 x 10^30 sub-networks, 117x dropout loss, weight sum 2.01 to 1.34, rates), follow-ups and the model.eval() trap.](diagrams/iq32_info_q28_dropout_ai.png)

**Simple Answer:**

Dropout is like a coach who benches random players at every practice: nobody can lean on one star teammate, so everyone learns to be useful with whoever is on the field. During training, each step switches off a random subset of neurons (about half when p = 0.5), so the network cannot build fragile "A works only if B fixes its mistakes" partnerships and has to learn redundant features that generalise. At test time every neuron plays.

```
  TRAINING, step 1 (p = 0.5)          TRAINING, step 2 (a new random mask)
  ──────────────────────────          ────────────────────────────────────
  input        hidden                 input        hidden
    ●──────────● kept    ×2             ●──────────○ dropped
    ●──────────○ dropped                ●──────────● kept    ×2
    ●──────────● kept    ×2             ●──────────● kept    ×2
    ●──────────○ dropped                ●──────────○ dropped

  INFERENCE: every unit on, no mask, no rescaling (inverted dropout)

  One hidden layer a = [0.9, 0.4, 0.7, 0.2, 0.6, 0.8], p = 0.5, keep mask [1,0,1,0,0,1]:
    training   → [1.8, 0, 1.4, 0, 0, 1.6]        survivors ÷ (1 − p), i.e. ×2
    inference  → [0.9, 0.4, 0.7, 0.2, 0.6, 0.8]  = the AVERAGE training output
```

**Official Definition:**

> **Dropout** (Hinton et al., 2012; Srivastava et al., 2014) sets each unit's output to zero independently with probability p on every training forward pass: ã = a · m / (1 − p), with m = 1 (keep) with probability 1 − p. Dividing the survivors by the keep probability (**inverted dropout**, the PyTorch and Keras convention) keeps E[ã] = a, so inference uses the full network unchanged. The 2014 paper did the opposite (no scaling in training, weights multiplied by the keep probability at test time); both give the same expected activation.

> **Maths in one line:** `E[loss with dropout] = MSE + p/(1−p) · Σⱼ wⱼ² · mean(xⱼ²)` — on a linear model, dropout on the inputs is exactly an L2 (ridge) penalty, scaled by each feature's size (Srivastava et al. 2014, section 9.1); p = 0.5 makes the penalty weight 1, p = 0.1 makes it 0.11.

**Interview Answer:**

**Say this first (30 sec):** "Dropout randomly zeroes each unit with probability p during training (0.1 in Transformers, up to 0.5 on big fully connected layers) and scales the survivors by 1/(1 − p), so inference simply uses the whole network. It regularises because no unit can rely on a particular partner, because every step trains a different thinned sub-network so the final net behaves like an average of exponentially many, and because on a linear model it is exactly an L2 penalty."

| Why it works | What it means | Number |
|---|---|---|
| Ensemble | N droppable units give 2ᴺ thinned sub-networks that share weights; the full net at test time approximates their average | 100 units → 1.27 × 10³⁰ sub-networks |
| No co-adaptation | A unit cannot count on a partner to cancel its errors, so features must be useful on their own | Two copies of a feature with weights +12 / −10: about the same plain MSE as +1 / +1 (0.099 vs 0.092), but 117× the dropout loss (program below) |
| Noise = L2 | Multiplicative Bernoulli noise on activations; in linear regression it equals a feature-scaled ridge penalty | p = 0.5 shrinks the best weights from a sum of 2.01 to 1.34 |

- **Rates (tune on validation):** 0.1 in Transformers (the 2017 base model's setting); 0.3–0.5 on large fully connected layers; at most about 0.2 on inputs (the 2014 paper's MNIST nets kept 80% of input units); usually 0 for LLM pre-training.
- **Where:** on hidden activations, plus attention weights and residual branches in Transformers; never on the final predictions.
- **Costs:** gradients get noisier, so training slows (the 2014 paper: typically 2–3× longer); on tiny datasets it may not help at all (no gain on 100–500 MNIST examples in the same paper).
- **Train vs eval mode:** forget `model.eval()` and predictions stay random; dropout placed before BatchNorm shifts the variance BatchNorm learned ("variance shift", Li et al., 2019), so put it after the last BatchNorm or use less.

**Worked example:** two near-copies of one feature. Without dropout, least squares lets the copies fight (+2.93 and −0.92); with dropout a cancelling pair is punished hard, so the copies share the work evenly — the "no co-adaptation" story in numbers. The price is shrinkage: p = 0.5 on the inputs pulls the total weight from 2.01 to 1.34, which is why input dropout is kept small.

```python
# Dropout on a linear model = an L2 penalty, so weights that cancel each other out get punished
import numpy as np

rng = np.random.default_rng(0)
n, p = 500, 0.5                                          # 500 rows, drop probability p = 0.5
x1 = rng.normal(0, 1, n)
X = np.column_stack([x1, x1 + rng.normal(0, 0.01, n)])   # two near-copies of one signal
y = 2 * x1 + rng.normal(0, 0.3, n)

def plain_mse(w):
    return np.mean((y - X @ w) ** 2)

def dropout_mse(w, draws=2000):                          # average over random masks (inverted dropout)
    keep = rng.random((draws, n, 2)) >= p
    return np.mean((y - (X * keep / (1 - p)) @ w) ** 2)

def formula(w):                                          # plain MSE + p/(1-p) * sum_j w_j^2 * mean(x_j^2)
    return plain_mse(w) + p / (1 - p) * np.mean(X ** 2, axis=0) @ w ** 2

print(f"{'weights':14s}{'plain MSE':>10s}{'dropout MSE':>13s}{'formula':>9s}")
losses = []
for w in ([1.0, 1.0], [12.0, -10.0]):                    # "share the work" vs "co-adapted, cancelling"
    w = np.array(w)
    sim, f = dropout_mse(w), formula(w)
    losses.append(f)
    print(f"{str(w.tolist()):14s}{plain_mse(w):10.3f}{sim:13.2f}{f:9.2f}")
    assert abs(sim - f) / f < 0.03                       # the simulation agrees with the closed form
print(f"same fit, but the cancelling pair costs {losses[1] / losses[0]:.0f}x more under dropout")

# Best weights WITH dropout = ridge whose penalty on w_j is scaled by sum(x_j^2)
w_ols = np.linalg.lstsq(X, y, rcond=None)[0]
print(f"no dropout : w = {np.round(w_ols, 2).tolist()}, sum {w_ols.sum():.2f}")
G = X.T @ X
for p_drop in (0.1, 0.5):
    lam = p_drop / (1 - p_drop)
    w_drop = np.linalg.solve(G + lam * np.diag(np.diag(G)), X.T @ y)
    print(f"dropout {p_drop}: w = {np.round(w_drop, 2).tolist()}, sum {w_drop.sum():.2f}")
    assert abs(w_drop[0] - w_drop[1]) < 0.05             # the two copies now share the work evenly
```

**Output:**

```
weights        plain MSE  dropout MSE  formula
[1.0, 1.0]         0.092         2.14     2.15
[12.0, -10.0]      0.099       250.05   250.98
same fit, but the cancelling pair costs 117x more under dropout
no dropout : w = [2.93, -0.92], sum 2.01
dropout 0.1: w = [0.95, 0.95], sum 1.90
dropout 0.5: w = [0.67, 0.67], sum 1.34
```

**Likely follow-ups:**

- *Why scale by 1/(1 − p) during training instead of at test time?* — The expected value is the same either way; inverted dropout leaves the serving graph untouched, so nobody has to remember p at inference ([Ch 14 §14.7](#content/14_neural_networks) runs the numbers).
- *Can dropout give uncertainty estimates?* — Yes: Monte Carlo dropout (Gal & Ghahramani, 2016) keeps dropout on at inference, runs many stochastic passes and reads the spread of the predictions as approximate Bayesian uncertainty.
- *Why do LLMs use little or no dropout?* — Pre-training sees most tokens about once, so overfitting is rare and dropout only slows learning; small fine-tuning sets bring it back (LoRA dropout 0.05 is a common default).
- *Which variants should I know?* — DropConnect (drop weights), spatial dropout (whole CNN channels), and DropPath / stochastic depth (whole residual blocks, used in ViT and ConvNeXt training).

**Trap:** Saying "at inference you still drop units" or "you multiply by (1 − p) at test time in PyTorch" — with inverted dropout, inference uses every unit with no rescaling; forgetting `model.eval()` leaves dropout on and makes predictions random.

**Go deeper:** [Ch 14 §14.7](#content/14_neural_networks) · [Ch 8 §8.15](#content/08_core_concepts) · [Ch 16 Hyperparameter Starting Points](#content/16_deep_learning)

---

### Q29. What is the difference between CNN, RNN, and Transformer? When to use each? ★★★
*[All] | ★★★*

![Interview card for Q29 CNN vs RNN vs Transformer: 30-second answer, magnifying glass / running notes / whole table analogy, an RNN gradient fading as 0.9^100 = 0.00003, per-layer work O(n^2 d) for attention, O(n d^2) recurrent and O(k n d^2) convolution with the n < d crossover (d = 768: 512 tokens 0.67x, 8,192 tokens about 11x), three lanes showing a 3-wide CNN filter with shared weights, an RNN chain h1 to h8 with 7 hand-offs, and a Transformer token attending to all 8 positions in 1 hop (64 scores per head), a comparison table, follow-ups on Mamba and CNN weight sharing (36,928 parameters), and the trap that Transformers have not replaced CNNs everywhere.](diagrams/iq32_info_q29_cnn_rnn_transformer_ai.png)

**Simple Answer:**

Each architecture builds in a different assumption about the data. A **CNN** slides one small magnifying glass over every neighbourhood, so it is perfect when nearby things belong together and a pattern means the same wherever it appears (pixels). An **RNN** reads one step at a time and keeps running notes, which suits streams but is slow to train and forgets over long spans. A **Transformer** spreads everything on the table and lets every position look at every other position at once: the most flexible, but it has to learn structure from data, and its cost grows with the square of the length.

```
  CNN — one small filter slides along, with the SAME weights everywhere
     [x1 x2 x3]x4 x5 x6 x7 x8      output 1 = w · (x1, x2, x3)
      x1[x2 x3 x4]x5 x6 x7 x8      output 2 = the same w · (x2, x3, x4)
     one layer sees 3 neighbours; L stacked 3×3 layers (stride 1) see
     (2L+1)×(2L+1) pixels, so 5 layers see 11×11

  RNN — one step at a time, carrying a fixed-size memory h
     h1 ──► h2 ──► h3 ──► h4 ──► h5 ──► h6 ──► h7 ──► h8
     ▲      ▲      ▲      ▲      ▲      ▲      ▲      ▲
     x1     x2     x3     x4     x5     x6     x7     x8
     x1 reaches h8 only through 7 hand-offs; step t waits for step t−1

  Transformer — every position attends to every position in ONE layer
     x8 ──► x1  x2  x3  x4  x5  x6  x7  x8     one hop to anything
     all 8 positions computed at once; 8 × 8 = 64 scores per head
     double the length → 4× the scores
```

**Official Definition:**

> A **CNN** applies small learned filters with weights shared across positions (convolution), which builds in locality and translation equivariance. An **RNN** applies the same cell at every time step, updating a hidden state h_t = f(x_t, h_{t−1}); LSTM and GRU add gates so information and gradients survive longer. A **Transformer** stacks self-attention and feed-forward blocks: every position computes a weighted mix of all positions, and order is supplied by positional encodings.

> **Maths in one line:** per layer, self-attention costs `O(n²·d)` work, `O(1)` sequential steps and an `O(1)` path between any two positions; a recurrent layer `O(n·d²)`, `O(n)`, `O(n)`; a convolution `O(k·n·d²)`, `O(1)`, `O(n/k)` (`O(log_k n)` if dilated) — Vaswani et al. 2017, Table 1 (n = length, d = width, k = kernel size).

**Interview Answer:**

**Say this first (30 sec):** "They differ in the structure they assume. CNNs assume locality and translation equivariance, which is ideal for images and other grids. RNNs process a sequence step by step with a fixed-size memory: cheap per step and streaming-friendly, but sequential to train and weak at long-range links. Transformers connect every pair of positions in one layer and train in parallel, so they dominate language and, with enough pre-training, vision and speech, at a cost that grows as n² with sequence length."

| | CNN | RNN / LSTM | Transformer |
|---|---|---|---|
| Built-in assumption | Nearby inputs belong together; a pattern means the same anywhere | Order matters; the past fits in one state vector | Almost none; order comes only from positional encodings |
| First → last of n inputs | O(n/k) stacked layers (O(log_k n) dilated) | n − 1 steps; the gradient fades (0.9¹⁰⁰ ≈ 0.00003) | 1 hop |
| Training | Parallel | Sequential over time | Parallel |
| Best fit (2026) | Images on phones and edge devices, detection backbones, audio front-ends | Short streams with tight latency on small devices | Text and LLMs, large-scale vision and speech, multimodal |

- **Cost crossover:** a self-attention layer beats a recurrent one only while n < d. With d = 768, 512 tokens cost 0.67× an RNN layer and 8,192 tokens about 11×. Transformers won on parallel training and one-hop paths, not on FLOPs (Q25).
- **Fewer assumptions need more data:** ViT trained on ImageNet-1k (1.3M images) lost to ResNets and won only after pre-training on 300M images; DeiT closed the gap on ImageNet-1k with heavy augmentation and distillation.
- **CNNs are not dead:** ConvNeXt (2022), a ResNet rebuilt with Transformer-era training, matched Swin Transformers with no attention at all; CNNs remain the practical choice on phones and edge devices.
- **Hybrids are normal:** ViT's patch embedding is mathematically a 16×16, stride-16 convolution; Google's Conformer puts convolutions inside Transformer blocks for speech; long-context LLMs mix attention with state-space or linear-attention layers (Mamba, Gated DeltaNet).
- **Tabular data and forecasting:** usually none of the three; start with gradient-boosted trees and simple baselines.

**Likely follow-ups:**

- *Why does a CNN need so few parameters for images?* — Weight sharing: a 3×3 convolution from 64 to 64 channels has 36,928 parameters whatever the image size, while a dense layer from a 224×224×3 image to just 1,000 units needs about 150 million.
- *Is Mamba a kind of Transformer?* — No. It is a selective state-space model: a linear-time, RNN-like scan with a fixed-size state and no KV cache. It is weaker at exact recall, so production models pair it with some attention layers ([Ch 16 §6.2](#content/16_deep_learning)).
- *When would you still choose an LSTM?* — Short sensor or audio streams on small devices, where a fixed-size state and constant per-step cost matter more than long-range context; for most text tasks a pre-trained Transformer wins.
- *How does a Transformer know word order?* — It doesn't by default: attention is permutation-equivariant, so positions are added (sinusoidal or learned) or rotated into the queries and keys (RoPE) ([Ch 16 §3.4](#content/16_deep_learning)).

**Trap:** Saying "Transformers have replaced CNNs and RNNs everywhere" — they dominate language and large pre-trained vision models, but CNNs still win on small data and on-device, recurrent-style state-space layers are back for very long sequences, and the strongest systems are often hybrids.

**Go deeper:** [Ch 16 §2.1](#content/16_deep_learning) · [Ch 16 §2.4](#content/16_deep_learning) · [Ch 16 §3.1](#content/16_deep_learning) · [Ch 16 §6.2](#content/16_deep_learning) · [Q2 in Ch 33](#content/33_llm_interview_questions)

---

### Q30. What is RLHF? Why is it important for language models? ★★★
*[O][G] | ★★★*

![Interview card for Q30 RLHF: 30-second answer, judge-two-essays analogy, raters preferring 1.3B InstructGPT over 175B GPT-3, the objective max E of r(x, y) - beta x KL(policy || reference) with beta 0.01-0.1, a three-step pipeline (SFT, reward model ranking 4-9 answers with loss -log sigmoid(r_w - r_l), PPO) and a PPO loop prompt, policy, answer, reward model, score r with an update arrow back to the policy and a frozen SFT reference as KL anchor, OpenAI and Google notes, an InstructGPT numbers table (13K, 33K, 31K prompts), follow-ups on DPO and reward hacking, and the RLHF-is-not-PPO trap.](diagrams/iq32_info_q30_rlhf_ai.png)

**Simple Answer:**

People find it hard to *write* the perfect answer but easy to say which of two answers is better. RLHF turns those comparisons into a judge (a reward model) and lets the LLM practise against the judge, making high-scoring answers more likely. A leash (the KL penalty) keeps the LLM close to where it started, so it improves instead of learning tricks that fool the judge.

```
  STEP 1  SFT           fine-tune on human-written demonstrations
                        (InstructGPT: ~13 K prompts)

  STEP 2  Reward model  labellers RANK 4–9 answers per prompt → 6–36 pairs
                        (~33 K prompts); loss = −log σ( r(x, y_w) − r(x, y_l) ):
                        the winner y_w must outscore the loser y_l

  STEP 3  PPO           prompt ──▶ policy ──▶ answer ──▶ reward model ──▶ score r
                                      ▲                                     │
                                      └──── update to raise r − β·KL ◀──────┘
                                            (~31 K prompts, no new labels)

  RESULT  raters preferred 1.3B InstructGPT over 175B GPT-3 (100× fewer parameters)
```

**Official Definition:**

> **RLHF** (Reinforcement Learning from Human Feedback) aligns a language model with human preferences: a reward model is trained on human comparisons of model outputs (a Bradley–Terry loss), then the model is optimised with reinforcement learning, classically PPO, to maximise that reward minus a KL-divergence penalty that keeps it close to the supervised (SFT) model.

> **Maths in one line:** `max over π_θ of  E[ r(x, y) ] − β · KL( π_θ ‖ π_ref )` — earn as much reward-model score as you can, but pay β (typically 0.01–0.1) for every nat the policy drifts from the frozen SFT reference.

**Interview Answer:**

**Say this first (30 sec):** "Pre-training optimises 'plausible next token', not 'helpful, honest and harmless'. RLHF closes that gap: humans rank the model's answers, a reward model learns those rankings, and PPO pushes the LLM toward high reward minus a KL penalty to the SFT model. That is why OpenAI's 1.3B InstructGPT was preferred over 175B GPT-3, and it is the recipe ChatGPT launched with in 2022."

- **Why rank, not score:** people agree on "A beats B" far more than on "7 out of 10", and ranking K answers yields K(K−1)/2 training pairs from one labelling task.
- **Why the KL leash:** without it the policy finds text the reward model over-scores (reward hacking: longer, more flattering answers). Real-world cousin: OpenAI rolled back an April 2025 GPT-4o update after an added reward from users' thumbs-up/down feedback helped make it sycophantic.
- **Cost:** PPO keeps four models in memory (policy, frozen reference, reward model, critic) and samples answers during training, which is why many teams switched to DPO: Llama 3 used SFT, rejection sampling and DPO, with no PPO.
- **OpenAI angle:** ChatGPT used the InstructGPT method with dialogue data, ranking alternative completions and running several rounds of PPO.
- **Google angle:** scale the labels and harden the judge. RLAIF (Lee et al., Google, 2023) matched RLHF on summarisation and dialogue using AI-written preferences; Gemma 3's RL stage uses weight-averaged reward models (WARM) trained on human feedback, plus code-execution and maths-answer rewards.

**Likely follow-ups:**

- *RLHF or DPO?* — DPO optimises the same KL-regularised objective directly on preference pairs: no reward model, no sampling, two models instead of four. PPO stays online, learning from its own current mistakes ([Q15 in Ch 33](#content/33_llm_interview_questions)).
- *How do you detect reward hacking?* — Reward keeps climbing while the KL grows, answers get longer and held-out human evaluations stall; respond with a larger β, early stopping, length control or reward-model ensembles.
- *What does a 2026 post-training pipeline look like?* — SFT, then a preference step (DPO or PPO-RLHF), then RL with verifiable rewards (GRPO/RLVR) for maths and code, often with AI feedback for scale ([Ch 17 §3.5c](#content/17_llm)).

**Trap:** Saying "RLHF = PPO" — RLHF is the whole human-feedback → reward → policy recipe; PPO is just one optimiser for its last step (Llama 3 used DPO instead), and humans train only the reward model, which is exactly why the policy can game it.

**Go deeper:** [Q14 in Ch 33](#content/33_llm_interview_questions) (full answer) · [Ch 17 §3.4](#content/17_llm) · [Ch 17 §3.5c](#content/17_llm) · [Q54 in Part 2](#content/33b_llm_interview_questions_part2) (alignment) · Q48 (AI safety)

---

# PART 4 — Data, Features & Evaluation

---

### Q31. What is data leakage and how do you prevent it?
*[All] | ★★*

![Interview card for Q31 data leakage: 30-second answer, answer-key analogy, the leaky diabetes model scoring 97.4% on test and 67.6% in production, key numbers (294 papers in 17 fields, 97.8% train vs 97.4% test, 97% to 76% after dropping the dominant feature), a 2 x 2 grid of the four leak types (target, temporal, group 100% to 53%, preprocessing 91% to 47%) with the safe order split, fit on train, transform, test once, a prevention table with TimeSeriesSplit, GroupKFold and Pipeline, follow-ups and the leakage-is-not-overfitting trap.](diagrams/iq32_info_q31_data_leakage_ai.png)

**Simple Answer:**

A student who has seen the answer key scores 100% on the practice test and fails the real exam. Data leakage is your model seeing the answer key: information in training (or in model selection) that will not exist at the moment of a real prediction. The offline score looks brilliant, so nobody investigates, until production.

```
  FOUR WAYS IT SNEAKS IN                  (numbers: the Ch 8 §8.4 simulations)
  ─────────────────────────────────────────────────────────────────────────────
  1. TARGET      a feature created AFTER the outcome
                 diabetes model with "takes_insulin": test 97.4% → production 67.6%
                 (the always-"no" baseline is 67.4%)
  2. TEMPORAL    a random split of time data lets the future train the past
                 fix: train Jan–Sep, test Oct–Dec
  3. GROUP       the same patient on both sides of the split
                 5 X-rays per patient: random split 100% → split by patient 53%
  4. PREPROCESS  scaler / selector / encoder fitted on ALL rows, then split
                 scaler: 0.820 either way (a habit bug); picking 20 of 5,000
                 pure-noise features on all rows: 91% CV accuracy → 47% done right
```

**Official Definition:**

> **Data leakage** is the use, during training or model selection, of information that would not legitimately be available at prediction time. It inflates validation scores and fails in production. It is widespread even in published research: Kapoor & Narayanan (2023) documented leakage affecting 294 papers in 17 scientific fields.

**Interview Answer:**

**Say this first (30 sec):** "Leakage is training on information you won't have at prediction time: a feature caused by the label, future rows in a random split, the same user on both sides, or preprocessing fitted on test data. It makes offline scores look great and production collapse; in Ch 8's demo a leaky diabetes model scores 97.4% on test and 67.6% in production. I prevent it structurally: split first (by time or group), fit every step inside a Pipeline, and audit each feature's timestamp."

| Leak | Prevention |
|---|---|
| Target | For every feature ask "do I know this value at prediction time?"; build features from point-in-time snapshots |
| Temporal | Split chronologically (`TimeSeriesSplit`); compute features only from data before the cut-off; leave a gap when labels arrive late |
| Group / duplicates | De-duplicate first, then split by user, patient or session (`GroupKFold`, `GroupShuffleSplit`) |
| Preprocessing / tuning | Put imputers, scalers, encoders and feature selectors inside a `Pipeline` (SMOTE inside imbalanced-learn's) so they refit per fold; tune on validation or nested CV; touch the test set once |

- **How to catch it:** a suspiciously high score on a hard problem; one feature dominating importance (drop it: 97% → 76% in the diabetes demo); IDs or timestamps that overlap across the split.
- **Leakage is not overfitting:** overfitting shows a train–test gap; leakage often shows none (97.8% train vs 97.4% test), because the shortcut works on the test set too.
- **Label-aware steps leak worst:** a scaler learns only a mean and spread, so its leak is tiny; feature selection, target encoding and oversampling look at the labels and can invent accuracy from noise.
- **Production cousin:** training–serving skew, where a feature is computed differently offline and online; a feature store with point-in-time-correct joins prevents both (Q36).
- **Real-world cost:** in Kapoor & Narayanan's civil-war case study, complex ML models' claimed advantage over logistic regression disappeared once the leakage was fixed.

**Likely follow-ups:**

- *Your first model is 99% accurate. What do you check?* — Feature importances and each top feature's timestamp, ID or duplicate overlap across the split, and whether any preprocessing step was fitted before splitting.
- *Is fitting a scaler on all the data really a problem?* — Usually a mild one (0.820 either way in Ch 8), but still a bug. Label-aware steps are severe: selecting 20 of 5,000 noise columns on all rows turned coin-flip labels into 91% accuracy.
- *How do you cross-validate a time series?* — Expanding-window folds (`TimeSeriesSplit`): train on the past, validate on the next block, never shuffle ([Ch 13 §13.7](#content/13_model_evaluation)).

**Trap:** Saying "leakage is just overfitting" — overfitting shows a train–test gap and is cured by regularisation; leakage often shows no gap (the shortcut works on the test set too) and is cured only by fixing the features and the split.

**Go deeper:** [Ch 8 §8.4](#content/08_core_concepts) · [Ch 9 — A Leakage-Safe Pipeline](#content/09_data_preprocessing) · [Ch 13 §13.7](#content/13_model_evaluation) · [Ch 13 §13.11](#content/13_model_evaluation)

---

### Q32. How do you handle missing data?
*[All] | ★*

![Interview card for Q32 missing data: 30-second answer (ask why, MCAR, MAR or MNAR; impute on train only with a was_missing flag; or NaN-aware boosted trees), skipped-survey analogy, the rule std after mean-filling is about std x sqrt(share observed) so 30% gaps shrink 15.0 to 12.5, a WHY IS IT MISSING decision panel with matching fixes, true vs mean-filled income histograms with a spike at 60.1, share-missing rules (under 5%, 5 to 30%, over 30%), a worked example table of 10,000 incomes (MCAR R2 0.486, MNAR 0.375 rising to 0.488 with the flag, no gaps 0.690), follow-ups and the mean-filling trap.](diagrams/iq32_info_q32_missing_data_ai.png)

**Simple Answer:**

Missing data is a survey where some people skipped questions. Before filling anything in, ask *why* they skipped: by accident, because of something else you know about them, or because of the answer itself (high earners skipping "income"). The reason decides whether you can drop those rows, fill the gaps, or must treat "skipped" as information in its own right.

```
  WHY IS IT MISSING?                 SAFE MOVES
  ────────────────────────────────────────────────────────────────────────
  MCAR  pure chance                  drop rows (if few) or a simple fill:
        (a sensor glitch)            unbiased, but you lose data or spread
  MAR   explained by columns you     fill FROM those columns (KNN or
        have (older people skip)     iterative imputation), or a NaN-aware model
  MNAR  depends on the missing       no fill can fix it: add a was_missing
        value itself (rich skip)     flag and find out why

  SHARE MISSING (rules of thumb from Ch 9, not laws)
  < 5%     drop those rows, if MCAR
  5–30%    impute + add a was_missing flag
  > 30%    keep only the flag, or drop the column
  numbers: median if skewed, mean if symmetric · categories: mode or "Unknown"
  time series: forward-fill (never back-fill: it copies the future into the past)
```

**Official Definition:**

> **Missing-data handling** chooses between deletion, imputation and modelling the missingness itself, guided by the missingness mechanism (Rubin, 1976): **MCAR** (missing completely at random), **MAR** (missingness depends only on observed columns) or **MNAR** (missingness depends on the unobserved value). Imputation is a learned preprocessing step, so its statistics must come from the training split only.

> **Maths in one line:** `std after mean-filling ≈ std × √(share observed)` — filling 30% of a column with its mean shrinks its spread by √0.7 ≈ 0.84 (15.0 → 12.5 in the program below) and weakens every correlation with it.

**Interview Answer:**

**Say this first (30 sec):** "First I find out why the data is missing (MCAR, MAR or MNAR), because that decides what is safe. Then I pick the cheapest fix that doesn't bias the model: drop a few MCAR rows; impute with the median, the mode or a model fitted on the training split only, plus a was-missing flag; or use a model that takes NaN natively, like gradient-boosted trees. When missingness depends on the value itself, the gap is information, so the flag itself becomes a useful feature."

| Method | Use when | Watch out |
|---|---|---|
| Drop rows | Few rows (< 5%) and MCAR | Biased if not MCAR; production will still send NaN |
| Mean / median / mode + flag | Quick baseline; median for skew or outliers | Shrinks variance and correlations; fit on train only |
| KNN / iterative (MICE-style) | MAR, with correlated columns | Slower; scikit-learn's `IterativeImputer` is still experimental |
| Native NaN handling | XGBoost, LightGBM, `HistGradientBoosting*`; current scikit-learn trees and random forests too | Learns which branch NaN follows, so the gap itself becomes a split |
| Drop the column / keep only a flag | > 30% missing and a weak signal | Check the flag's signal before dropping |

- **Imputation is part of the model:** learn fill values inside the `Pipeline` on each training fold; filling with full-data statistics leaks test information (Q31).
- **Serving:** the online path must apply the same fitted imputer, and each feature's missing rate is a monitoring signal; a sudden jump usually means a broken upstream feed, not a change in the world.
- **For statistics, not just prediction:** one imputed copy understates uncertainty; multiple imputation (several imputed datasets pooled with Rubin's rules) gives honest confidence intervals.

**Worked example:** 10,000 incomes, 30% missing two ways. Random gaps (MCAR) keep the right fill value but shrink the spread and the R²; when high earners skip (MNAR) the fill value is wrong, and a was-missing flag lifts R² from 0.375 back to the random-gap level (0.488).

```python
# Mean imputation under MCAR vs MNAR: the spread shrinks, the fill can be wrong, and a flag helps
import numpy as np

rng = np.random.default_rng(0)
n = 10_000
income = rng.normal(60, 15, n)                      # thousands
spend = 0.5 * income + rng.normal(0, 5, n)          # the target we want to predict

def r2(features, y):                                # R^2 of a least-squares fit with an intercept
    A = np.column_stack([np.ones(len(y))] + features)
    resid = y - A @ np.linalg.lstsq(A, y, rcond=None)[0]
    return 1 - resid.var() / y.var()

cases = {
    "MCAR: 30% at random": rng.random(n) < 0.30,
    "MNAR: rich skip it": rng.random(n) < np.where(income > 70, 0.70, 0.15),
}
print(f"true income: mean {income.mean():.1f}, std {income.std():.1f};  R2 with no gaps {r2([income], spend):.3f}")
print(f"{'case':21s}{'missing':>8s}{'fill':>6s}{'std':>6s}{'R2 filled':>10s}{'R2 + flag':>10s}")
for name, miss in cases.items():
    fill = income[~miss].mean()                     # learned from the rows we can see
    filled = np.where(miss, fill, income)
    flag = miss.astype(float)                       # "income_was_missing"
    a, b = r2([filled], spend), r2([filled, flag], spend)
    print(f"{name:21s}{miss.mean():8.0%}{fill:6.1f}{filled.std():6.1f}{a:10.3f}{b:10.3f}")
    if name.startswith("MCAR"):
        assert abs(filled.std() - income.std() * np.sqrt(1 - miss.mean())) < 0.2   # std x sqrt(share seen)
        assert b - a < 0.005                        # random gaps: the flag carries no signal
    else:
        assert fill < income.mean() - 3 and b - a > 0.05   # wrong fill value; the flag recovers signal
```

**Output:**

```
true income: mean 60.1, std 15.0;  R2 with no gaps 0.690
case                  missing  fill   std R2 filled R2 + flag
MCAR: 30% at random       30%  60.1  12.5     0.486     0.486
MNAR: rich skip it        30%  56.2  11.0     0.375     0.488
```

**Likely follow-ups:**

- *Why not always fill with the mean?* — It shrinks the variance (30% gaps: spread × 0.84), weakens correlations, and under MNAR it fills the wrong value (56.2 against a true mean of 60.1 above).
- *Mean or median?* — Median when the column is skewed or has outliers: ages 25, 30, 28, 27 and a typo of 290 give a mean of 80.0 but a median of 28.0 ([Ch 9](#content/09_data_preprocessing)).
- *How can you tell MCAR from MAR or MNAR?* — Compare rows with and without the gap on the other columns (no difference suggests MCAR; Little's test formalises this). MNAR cannot be proven from the data alone; it needs domain knowledge or follow-up collection.

**Trap:** Saying "just fill with the mean, it's harmless" — mean-filling shrinks variance and correlations, leaks test statistics if computed before the split, and is biased when the gap depends on the value (MNAR); fit the fill on training data and add a was-missing flag.

**Go deeper:** [Ch 9 Step 1](#content/09_data_preprocessing) · [Ch 9 — A Leakage-Safe Pipeline](#content/09_data_preprocessing) · [Ch 8 §8.4](#content/08_core_concepts)

---

### Q33. What metrics do you use for imbalanced datasets? ★★★
*[All] | ★★*

![Interview card for Q33 metrics for imbalanced data: 30-second answer (not accuracy, precision and recall at the threshold, PR-AUC with a prevalence baseline), silent smoke-detector analogy, the MCC formula, two confusion matrices for 1,000 transactions with 10 fraud (lazy always-normal TP 0, FN 10, FP 0, TN 990 at 99.0% accuracy vs useful TP 8, FN 2, FP 40, TN 950 at 95.8%), a random-ranker PR-AUC of 0.01 not 0.5, a metric table (recall 0.00 vs 0.80, precision 0.17, F1 0.28, MCC 0.35), follow-ups on ROC-AUC 0.97 and F1 vs MCC, and the ROC-AUC handles imbalance trap.](diagrams/iq32_info_q33_imbalanced_metrics_ai.png)

**Simple Answer:**

If 99% of transactions are normal, a model that always answers "normal" is 99% accurate and catches no fraud at all. On imbalanced data you need metrics that look at the rare class: of the alarms we raised, how many were real (precision)? Of the real cases, how many did we catch (recall)? And, across all thresholds, how well does the model rank the rare cases on top?

```
  1,000 transactions: 990 normal, 10 fraud (1%)

                  LAZY: always "normal"     USEFUL: flags 48, 8 real
                  TP 0    FN 10             TP 8    FN 2
                  FP 0    TN 990            FP 40   TN 950
  ──────────────────────────────────────────────────────────────────
  Accuracy        99.0%   ← looks best      95.8%   ← looks worse!
  Recall          0.00                      0.80
  Precision       — (no alarms)             0.17
  F1              0.00                      0.28
  MCC             0.00                      0.35
  Balanced acc.   0.50                      0.88

  PR-AUC of a random ranker = the fraud rate = 0.01, not 0.5
```

**Official Definition:**

> On imbalanced data, evaluate the **minority class**: **precision** = TP/(TP+FP), **recall** = TP/(TP+FN), their harmonic mean **F1** (or F-beta to weight one of them more), and **MCC**, which uses all four cells of the confusion matrix. To compare models across thresholds, use **PR-AUC** (average precision), whose random baseline is the positive rate, alongside **ROC-AUC**, which ignores the class ratio.

> **Maths in one line:** `MCC = (TP·TN − FP·FN) / √((TP+FP)(TP+FN)(TN+FP)(TN+FN))` — the correlation between predictions and truth: +1 perfect, 0 no better than chance, −1 always wrong; the lazy model scores 0 (formally 0/0, reported as 0).

**Interview Answer:**

**Say this first (30 sec):** "Not accuracy: on 99/1 data the do-nothing model scores 99%. I report precision and recall on the minority class at the operating threshold (or F-beta if one error costs more), PR-AUC to compare models across thresholds, remembering its baseline is the positive rate rather than 0.5, and the business view, such as precision in the k alerts analysts can review per day. ROC-AUC is still a fine ranking metric, but it hides the false-alarm load."

| Question you are answering | Metric | Watch out |
|---|---|---|
| Are the alarms worth acting on? Did we catch the rare cases? | Precision and recall at the chosen threshold | Report both; choose the threshold on validation data from the costs |
| One number at that threshold | F1 / F2 / F0.5, or MCC | F1 ignores true negatives; MCC can't be gamed by predicting one class |
| Which model ranks the rare class better? | PR-AUC (average precision) | Baseline = prevalence; compare only at the same prevalence |
| Ranking quality whatever the class ratio | ROC-AUC | Unchanged by 10× more negatives, so it flatters the alert load |
| Limited review capacity | Precision@k, recall at a fixed false-positive rate | Matches how the alerts are actually used |

- **Multi-class:** macro-averaging gives a rare class a full vote; micro-F1 equals accuracy in single-label problems, so it adds nothing ([Ch 13 §13.3](#content/13_model_evaluation)).
- **PR-AUC is not a free win:** McDermott et al. (NeurIPS 2024) showed it is not generally superior under imbalance; it rewards gains among the top-scored cases and can favour subgroups with more positives. Report it with ROC-AUC and the operating point.
- **Probabilities:** if decisions use P(fraud) itself, also check log loss, Brier score and calibration; class weights inflated the mean P(fraud) to 0.169 against a true rate of 0.010 in [Ch 10 §10.11](#content/10_supervised_learning).
- **Fix the model, not the metric:** move the threshold first (free), then class weights, then resampling, and recalibrate after the last two (Q39).

**Likely follow-ups:**

- *ROC-AUC is 0.97, but the fraud team says the model is useless. How?* — FPR divides by the huge negative class, so thousands of false alarms barely move it; analysts live with precision. In Ch 13, 10× more legitimate traffic leaves ROC-AUC at 0.854 while average precision falls from 0.493 to 0.143.
- *F1 or MCC?* — F1 when only the positive class matters; MCC when both classes matter or the majority could be "positive": labelling everything positive at 95% prevalence scores F1 0.974 but MCC 0.
- *How do you pick the threshold?* — From costs: with calibrated probabilities, flag when `p > C_FP / (C_FP + C_FN)`, so a miss costing 9× a false alarm gives 0.1; otherwise sweep the PR curve on validation data ([Ch 10 §10.11](#content/10_supervised_learning)).

**Trap:** Saying "use ROC-AUC because it handles imbalance" — ROC-AUC is unaffected by the class ratio, which is exactly why it hides how many false alarms each catch costs; pair it with PR-AUC and precision/recall at the operating point.

**Go deeper:** [Ch 13 §13.3](#content/13_model_evaluation) · [Ch 13 §13.5](#content/13_model_evaluation) · [Ch 10 §10.11](#content/10_supervised_learning)

---

# PART 5 — ML System Design

---

### Q34. How would you design a recommendation system?
*[G][A] | ★★★*

![Interview card for Q34 designing a recommendation system: 30-second answer (satisfaction label not raw clicks, retrieve-rank-re-rank funnel, recall@k, NDCG and an A/B test), hiring-funnel analogy, the two-tower score u dot v with 128-number vectors, a narrowing funnel from 800M items through two-tower ANN retrieval (about 10 ms) to about 1,000, a multi-task DCN-v2 ranker (about 20 ms) to about 100, and a diversity, freshness and safety re-rank (about 10 ms) to about 25 shown, all under 300 ms, a two-tower inset, StreamFlix key numbers (30-day retrain window, 1 to 5% exploration, about 3M users per arm to detect 5.00% to 5.05%), follow-ups and the deep-model-on-clicks trap.](diagrams/iq32_info_q34_recommendation_system_ai.png)

**Simple Answer:**

A recommender is a matchmaker with far too many candidates to interview. It can ask "what do people with your taste enjoy?" (collaborative filtering), "what is similar to what you already liked?" (content-based filtering), or both (hybrid).

At scale it works like a hiring funnel: a cheap screen cuts hundreds of millions of items to about a thousand, a careful interview picks the best hundred, and a final check makes the shortlist varied, fresh and safe.

```
  COLLABORATIVE FILTERING — "people with your taste also liked…"
              Movie1  Movie2  Movie3  Movie4
     UserA      5       4       ?       1
     UserB      4       5       4       1     ← agrees with A (5,4,1 vs 4,5,1)
     UserC      ?       3       5       2
     A has not seen Movie3; users who agree with A rated it 4 and 5 → show it

  CONTENT-BASED — "more like this": item features (genre, text, image)
     matched to a user profile → works even for a brand-new item
  HYBRID — learn user and item vectors from IDs AND content (two-tower)

  THE FUNNEL — Ch 26's StreamFlix: 800M videos, whole request < 300 ms
  800M items
     │  RETRIEVAL  two-tower embeddings + ANN search (ScaNN)      ~10 ms
     ▼             cheap, high recall
  ~1,000 candidates
     │  RANKING    multi-task net (DCN-v2 / Wide & Deep):         ~20 ms
     ▼             P(click), watch time, P(like) → one score
  ~100
     │  RE-RANK    diversity, freshness, dedupe, policy & safety  ~10 ms
     ▼
  ~25 shown
```

**Official Definition:**

> A **recommender system** ranks items for a user by predicting the value of showing each one — usually the probability or amount of engagement (click, watch, purchase) — from past interactions and features. **Collaborative filtering** learns only from the user–item interaction matrix (e.g. matrix factorization: predicted rating = p_u · q_i); **content-based** methods use item and user features; production systems combine both and serve them through a multi-stage retrieval → ranking → re-ranking cascade.

> **Maths in one line:** `score(user, item) = u · v` — two towers turn the user and the item into 128-number vectors; a large dot product means a good match, so retrieval becomes a nearest-neighbour search over item vectors computed offline.

**Interview Answer:**

**Say this first (30 sec):** I'd pin down the goal and the label first — long-term satisfaction, not raw clicks — then build a funnel: a two-tower model retrieves ~1,000 candidates from hundreds of millions of items with approximate nearest-neighbour search in about 10 ms, a heavier multi-task ranker scores them, and a re-ranker adds diversity, freshness and safety. I'd check it offline with recall@k and NDCG on a time-based split, then prove it with an A/B test.

| Step | What I'd choose | Numbers (Ch 26) |
|---|---|---|
| Label | composite: click + meaningful watch + like − "not interested" | clicks alone breed clickbait |
| Retrieval | two-tower trained with in-batch softmax + popularity correction; ANN index (ScaNN, HNSW, FAISS) | 800M → ~1,000 in ~10 ms |
| Ranking | multi-task DCN-v2 / Wide & Deep with user × item cross features | ~1,000 → ~100 in ~20 ms |
| Re-rank | diversity, freshness, dedupe, policy filters | ~100 → ~25 shown |
| Proof | offline recall@k + NDCG@k; online A/B with guardrails | ~3M users per arm to detect 5.00% → 5.05% |

- **Cold start:** new users get popularity, onboarding picks and context (country, device); new items are embedded from content (title, category, image) by the item tower, plus 1–5% exploration traffic.
- **Feedback loops:** the model only learns from what it showed. Reserve exploration traffic, weight examples by 1 / P(shown), and train with a position feature set to a constant at serving.
- **Freshness:** retrain daily on a rolling window (StreamFlix: 30 days); session features update on every request.

**Likely follow-ups:**

- *Why not one heavy model over every item?* — A heavy model over 800M items per request cannot fit 300 ms. Two towers keep item vectors precomputed, so each request encodes only the user, then runs one ANN lookup.
- *Matrix factorization or two-tower?* — MF is a two-tower whose only inputs are IDs. Adding content and context features lets the tower embed new items and react to the current session.
- *How do you evaluate retrieval on its own?* — Recall@k of the ~1,000 candidates against items the user later engaged with: the ranker can never recover an item retrieval dropped (Q49 covers NDCG and MRR).

**Trap:** Jumping straight to "train a deep model on clicks" — state the label, the funnel and the metrics first, and split the data by time: a random split leaks the future into training.

**Go deeper:** [Ch 26 — Two-Tower](#content/26_ml_system_design) · [Ch 26 — The Funnel That Powers Google](#content/26_ml_system_design) · [Ch 26 — Three Hard Realities](#content/26_ml_system_design) · [Ch 28 §24.9](#content/28_semantic_search) · Q38, Q41 and Q49 in this chapter

---

### Q35. How would you detect fraud in real-time?
*[A][G] | ★★★*

![Interview card for Q35 real-time fraud detection: 30-second answer (streaming velocity and history features under 100 ms, rules plus gradient-boosted trees giving P(fraud), cost-based approve, challenge or block thresholds), bank-guard analogy, 0.1% fraud where approve-everything is 99.9% accurate, the threshold t* = C_FP / (C_FP + C_FN) giving 0.1 when a miss costs 9x a false decline, a five-step pipeline (transaction, feature store with 1 / 5 / 60 min velocity, rules + GBDT model, block / step-up / approve decision, chargeback labels 30 to 90 days later feeding retraining) under 100 ms, a metrics table (PR-AUC, recall at fixed FPR, amount-weighted recall, review-queue precision), follow-ups and the 99.9% accuracy or SMOTE-first trap.](diagrams/iq32_info_q35_realtime_fraud_ai.png)

**Simple Answer:**

Imagine a bank guard who has seen thousands of scams. They notice "this is the third foreign purchase in five minutes" or "this amount is ten times what this customer usually spends". A fraud model learns the same patterns from data, but it must decide in milliseconds, against criminals who change tactics, and it only learns the truth weeks later, when the customer disputes the charge.

```
  Transaction arrives          whole decision < 100 ms (Ch 26)
        │
        ▼
  FEATURES  from a streaming feature store (same code as in training)
   • velocity : transactions on this card in the last 1 / 5 / 60 min
   • history  : amount vs this user's usual, new country, odd hour
   • device / IP / merchant risk scores
   • graph    : card shares a device or address with known fraud
        │
        ▼
  MODEL     hard rules + gradient-boosted trees → p = P(fraud)
        │
        ▼
  DECISION  thresholds come from costs, not a fixed 0.5
   p ≥ t_high          → block
   t_low ≤ p < t_high  → step-up check (one-time code) or human review
   p < t_low           → approve
        │
        ▼
  LABELS    chargebacks arrive 30–90 days later → retrain on matured labels

  Base rate 0.1%: "approve everything" is 99.9% accurate and catches nothing.
```

**Official Definition:**

> **Real-time fraud detection** scores each transaction with the probability that it is fraudulent inside the payment's latency budget, then maps that score to an action (approve, challenge, block) with cost-based thresholds. It is an imbalanced, adversarial and non-stationary classification problem whose true labels arrive with a long delay.

> **Maths in one line:** `block when p > t* = C_FP / (C_FP + C_FN)` — act when the expected loss of letting fraud through, p × C_FN, beats the cost of insulting a good customer, (1 − p) × C_FP. If a miss costs 9× a false decline, t* = 0.1. Because C_FN grows with the amount, large purchases get a lower threshold.

**Interview Answer:**

**Say this first (30 sec):** I'd treat it as cost-sensitive, imbalanced classification served in under 100 ms: streaming velocity and history features from a feature store, gradient-boosted trees behind a few hard rules, and thresholds that turn the fraud probability into approve, challenge or block by expected cost. With 0.1% fraud I'd judge it by PR-AUC and recall at a fixed false-positive rate — never accuracy — and retrain often, because fraudsters adapt and labels arrive 30–90 days late.

- **Features beat model choice:** velocity counts, deviation from the user's own habits, device and IP reputation, and graph links between cards, devices and addresses (fraud rings).
- **Model:** gradient-boosted trees (XGBoost, LightGBM) are the tabular workhorse and fast on CPU; a heavier sequence or graph model can rescore only the borderline band.
- **Imbalance:** class weights (`scale_pos_weight`) and a threshold chosen on validation data first; SMOTE last, inside training folds only (Ch 10 §10.11).
- **Label delay and selection bias:** train only on labels that have matured; blocked payments never get a label, so let a tiny random sample through or use challenge outcomes as labels.

| Metric | Why |
|---|---|
| PR-AUC | ranking quality when only 0.1% are positive; ROC-AUC flatters |
| Recall at a fixed false-positive rate | matches the real limit: customer friction and review capacity |
| Amount-weighted recall (losses caught) | a missed 5,000-dollar fraud costs more than a missed 5-dollar one |
| Review-queue precision | humans can check only so many cases a day |

**Likely follow-ups:**

- *Labels take 60 days — how do you retrain weekly?* — Train on the window whose labels have matured, add fast proxy labels (customer-reported fraud, failed challenges), and watch feature and score drift in the meantime.
- *Why not a deep network on everything?* — Latency and data: trees on good features are fast and strong on tabular data. Sequence or graph models pay off for behaviour histories and fraud rings, often as a second stage.
- *How do you set the two thresholds?* — From costs and capacity: t_high where expected fraud loss beats the cost of a false block; the challenge band sized to how many one-time codes and reviews you can afford; re-check on recent data.

**Trap:** Quoting "99.9% accuracy" or reaching for SMOTE first — with 0.1% fraud, accuracy rewards approving everything; talk PR-AUC, recall at a fixed false-positive rate, cost-based thresholds, and class weights before resampling.

**Go deeper:** [Ch 26 — Fraud Detection](#content/26_ml_system_design) · [Ch 10 §10.11](#content/10_supervised_learning) · [Ch 13 §13.5](#content/13_model_evaluation) · [Ch 26 — The Pantry and the #1 Silent Killer](#content/26_ml_system_design) · Q33 and Q39 in this chapter

---

### Q36. How do you deploy and monitor a machine learning model in production?
*[All] | ★★★*

![Interview card for Q36 Deploy and Monitor a Model: 30-second answer (versioned artifact, rollout ladder, four-layer monitoring), restaurant analogy, PSI formula with 0.1 and 0.25 thresholds, a rollout staircase Offline eval, Shadow, Canary 1-5% of users, Ramp plus A/B 5% to 20% to 50% to 100% with auto-rollback to the old model, a Watch Four Layers panel (system latency and errors over 1%, data PSI over 0.25, prediction score distribution, outcomes on delayed labels) with a retrain loop, a drift comparison table, follow-ups and the trap of only watching accuracy.](diagrams/iq32_info_q36_deploy_monitor_ai.png)

**Simple Answer:**

Deploying a model is like opening a restaurant. You test the kitchen first (offline evaluation), cook for staff without serving guests (shadow mode), open a few tables (canary), then the whole room (full rollout) — and you keep watching for complaints, because tastes and suppliers change.

The hardest part isn't building the model — it's keeping it right. A model never crashes when the world changes; it just quietly gets worse, so you must watch its inputs and outputs, not only the servers.

```
  SHIP SAFELY — the rollout ladder (Ch 26)
  1. Offline eval   beat the current model on a recent, time-based holdout
  2. Shadow         new model scores live traffic; users see only the old one
  3. Canary         1–5% of users; watch errors, latency, guardrails
  4. Ramp + A/B     5% → 20% → 50% → 100%; prove the business metric moved
     auto-rollback at steps 2–4 if any guardrail breaks
     (blue-green: keep the old stack warm so rollback is one switch)

  WATCH FOUR LAYERS
  System       p50 / p95 / p99 latency, error rate (alert > 1%), throughput
  Data         schema, missing values, PSI per feature (> 0.25 = big shift)
  Predictions  score distribution, share predicted positive
  Outcomes     AUC / recall on delayed labels, business KPIs, per-slice

  FIX DECAY
  scheduled retrain (StreamFlix: daily, rolling 30 days)
  triggered retrain (drift or a metric drop)
  online learning   (ads: trained continuously on the last 24–48 h)
  → always validate against the current model before promoting
```

**Official Definition:**

> **Deployment** packages a trained model together with its exact preprocessing as a versioned artifact and serves it online (per request), in batch, or on device. **Monitoring** continuously compares live inputs, predictions and outcomes with the training baseline to catch data drift (P(x) changes), concept drift (P(y | x) changes), prediction drift and training–serving skew, and triggers rollback or retraining.

> **Maths in one line:** `PSI = Σ (live% − train%) × ln(live% / train%)` over the bins of one feature — below 0.1 stable, 0.1–0.25 moderate, above 0.25 a significant shift (some teams alert at 0.2).

**Interview Answer:**

**Say this first (30 sec):** I'd ship the model and its preprocessing as one versioned artifact from a registry, then walk it up a rollout ladder — offline evaluation, shadow, a 1–5% canary, then a ramped A/B test — with automatic rollback on guardrails such as p99 latency and error rate. In production I'd monitor four layers — system, data, predictions and outcomes — because accuracy labels often arrive days late, and I'd retrain on a schedule or when drift such as PSI above 0.25 appears.

| Problem | What changes | How to detect | Example (Ch 26) |
|---|---|---|---|
| Data drift | P(x) | PSI or KS test per feature | a new viral video format floods uploads |
| Concept drift | P(y given x) | metrics on fresh labels | what users find "good" shifts |
| Prediction drift | P(ŷ) | score distribution | a broken pipeline sends zeros; "love it" jumps to 30% |
| Training–serving skew | features differ between training and serving | log served features, recompute offline, compare | Python batch code vs C++ online code |

- **Skew is the #1 cause of "great offline, bad live":** compute features through one shared definition (a feature store) and still monitor them.
- **Shadow vs canary vs A/B:** shadow tests correctness with zero user risk; a canary catches crashes and latency on real users; only an A/B test measures business impact.
- **Batch or online:** batch for nightly scores (cheap, stale), online when a user waits (latency target); most systems mix both.
- **Reproducibility:** version data, code, config and model so any release can be rebuilt or rolled back in one step (MLOps levels 0–2, Ch 27 §18.11).

**Likely follow-ups:**

- *Accuracy dropped 5% overnight — what do you check first?* — The plumbing before the world: schema changes, a feature stuck at zero or null, a recent deploy. Overnight drops are usually bugs, not concept drift.
- *A feature drifted but metrics look fine — retrain?* — Not automatically. Check the feature's importance and the model's performance on the drifted slice; retrain when performance degrades, and fix the pipeline if the data is wrong.
- *What is a champion–challenger setup?* — The current model (champion) keeps serving while retrained candidates (challengers) run in shadow or on a small slice; a challenger is promoted only if it wins on held-out and live metrics.

**Trap:** "Deploy, then watch accuracy" — labels often arrive days or months later, so monitor inputs and predictions from day one, and never send 100% of traffic to a new model without a tested rollback path.

**Go deeper:** [Ch 26 — Drift](#content/26_ml_system_design) · [Ch 26 — Retraining & Safe Deployment](#content/26_ml_system_design) · [Ch 27 §18.8](#content/27_practical_ml) (PSI and KS code) · [Ch 27 §18.10](#content/27_practical_ml) · Q17 (A/B testing) in this chapter

---

# PART 6 — Google-Specific Questions

---

### Q37 (G). How does PageRank work?
*[G] | ★★★*

![Interview card for Q37 PageRank: 30-second answer (a link is a vote weighted by the voter's rank, random surfer follows a link 85 percent and jumps 15 percent, power iteration), voting analogy, the formula PR(A) = (1 - d)/N + d x sum of PR(T)/C(T), a five-page link graph A to B, A to C, B to C, C to A, D to C with ranks C 0.380, A 0.359, B 0.189, D and E 0.036, power iteration converging in 45 iterations, an in-links table, follow-ups on dangling pages and billions of pages, and the trap about counting in-links and misreading d.](diagrams/iq32_info_q37_pagerank_ai.png)

**Simple Answer:**

Imagine every web page is a person, and a link from one page to another is a vote. Not all votes are equal: a vote from a famous, trusted page counts more than one from an unknown blog, and a page that links to 100 others splits its vote 100 ways. PageRank counts the votes AND weighs who is voting.

Another way to see it: a bored surfer clicks random links forever, and now and then jumps to a random page. The pages where the surfer spends the most time are the important ones.

```
            ┌──────────────── C → A ─────────────────┐
            ▼                                        │
       ┌─────────┐       A → C        ┌─────────┐    │
       │ A 0.359 │───────────────────►│ C 0.380 │────┘
       └────┬────┘                    └─────────┘
            │ A → B                     ▲     ▲
            ▼                           │     │ D → C
       ┌─────────┐       B → C          │   ┌─┴───────┐    ┌─────────┐
       │ B 0.189 │──────────────────────┘   │ D 0.036 │    │ E 0.036 │
       └─────────┘                          └─────────┘    └─────────┘
                                            no in-links    no links at all

  PageRank with d = 0.85 (the program below computes these numbers):
  • C has the most in-links (3) and the top rank.
  • A and B each have ONE in-link, but A gets all of C's vote while B gets
    half of A's → A 0.359 vs B 0.189: who votes matters more than how many.
  • D and E get only the jump share (1 − 0.85) / 5 = 0.03, plus a sliver
    from E, whose rank is spread over every page because it links nowhere.
```

**Official Definition:**

> **PageRank** (Brin & Page, 1998) scores web pages from the link graph alone. A page's PageRank is the long-run probability that a random surfer is on it, where at every step the surfer follows a random out-link with probability d (usually 0.85) or jumps to a random page with probability 1 − d. The scores are the stationary distribution of this Markov chain — the principal eigenvector of the "Google matrix".

> **Maths in one line:** `PR(A) = (1 − d)/N + d × Σ PR(T)/C(T)`, summed over every page T that links to A — a jump share for every page, plus the rank of each linking page T split over its C(T) out-links; with N pages the ranks sum to 1.

**Interview Answer:**

**Say this first (30 sec):** PageRank scores a page by how often a random surfer would be on it: with probability d = 0.85 the surfer clicks a random link on the current page, otherwise jumps to a random page. So a link is a vote, weighted by the voter's own rank and split across the voter's out-links. You compute it by power iteration — the original 322-million-link graph converged in about 52 iterations.

- **Power iteration:** start every page at 1/N, apply the formula to all pages at once, repeat until the ranks stop changing. This finds the principal eigenvector of G = d·M + (1 − d)/N.
- **Why the jump (damping):** without it, rank drains into dead ends and loops that link only to each other. With it, the chain has one unique answer, and the error shrinks by at least ×d per iteration.
- **Dangling pages** (no out-links) would leak rank out of the system; spread their rank evenly over all pages, as page E does above.
- **Link spam:** link farms inflate rank; defences include teleporting only to trusted pages (TrustRank-style), `nofollow` links and learned spam classifiers.
- **Today:** Google calls PageRank one of its core ranking systems, "evolved a lot" since launch and used alongside many others (BERT, neural matching, freshness, spam systems).

**Worked example:** power iteration on the 5-page web above, checked against the eigenvector, then the cost of a larger d.

```python
# PageRank by power iteration on a 5-page web, checked against the eigenvector
import numpy as np

pages = ["A", "B", "C", "D", "E"]
links = {"A": ["B", "C"], "B": ["C"], "C": ["A"], "D": ["C"], "E": []}   # E links nowhere
N = len(pages)
M = np.zeros((N, N))                     # M[i, j] = chance a surfer on page j clicks to page i
for j, src in enumerate(pages):
    for dst in links[src]:
        M[pages.index(dst), j] = 1 / len(links[src])
M[:, pages.index("E")] = 1 / N           # dangling page: its surfer jumps to a random page

def pagerank(d, tol=1e-10):
    r, steps = np.full(N, 1 / N), 0      # start: every page 1/N
    while True:
        steps += 1
        new = (1 - d) / N + d * (M @ r)  # PR(A) = (1-d)/N + d * sum PR(T)/C(T)
        if np.abs(new - r).sum() < tol:
            return new, steps
        r = new

r, steps = pagerank(0.85)
print("in-links:", {p: sum(p in v for v in links.values()) for p in pages})
print("PageRank:", {p: round(float(x), 3) for p, x in zip(pages, r)}, f"sum={r.sum():.3f}")

G = 0.85 * M + 0.15 / N                  # the "Google matrix": every column sums to 1
vals, vecs = np.linalg.eig(G)
v = np.real(vecs[:, np.argmax(np.real(vals))])
v = v / v.sum()
assert np.allclose(v, r, atol=1e-8)      # power iteration = principal eigenvector
assert r[0] > r[1] and abs(r.sum() - 1) < 1e-9

for d in (0.5, 0.85, 0.95):
    print(f"d={d:.2f}: converged in {pagerank(d)[1]:3d} iterations")
```

**Output:**

```
in-links: {'A': 1, 'B': 1, 'C': 3, 'D': 0, 'E': 0}
PageRank: {'A': 0.359, 'B': 0.189, 'C': 0.38, 'D': 0.036, 'E': 0.036} sum=1.000
d=0.50: converged in  23 iterations
d=0.85: converged in  45 iterations
d=0.95: converged in  59 iterations
```

A larger d trusts the links more but converges more slowly: the only guarantee is that the error shrinks by at least ×d per round.

**Likely follow-ups:**

- *What is personalized PageRank?* — Jump only to a chosen set (a user's own pages, a topic's seed pages) instead of all pages. The ranks then measure closeness to that set — used for "who to follow" and graph-based recommendations.
- *How do you run it on billions of pages?* — Never build the dense matrix: each round, every page sends PR/C to its out-links as a sparse, distributed message pass (MapReduce or Pregel style); tens of rounds are enough.
- *Is PageRank still how Google ranks results?* — It is one link-analysis signal among many systems. Relevance to the query, freshness, quality and spam systems decide the final order.

**Trap:** Saying "PageRank counts in-links" or "d is the chance of jumping" — each link is weighted by the voter's rank divided by its out-links, and d = 0.85 is the chance of following a link (the jump is 1 − d = 0.15).

**Go deeper:** [Ch 06 §1.4](#content/06_math_fundamentals) (eigenvectors) · [Ch 36 — Case 6 Web Crawler](#content/36_system_design_cases_search_media) (link graph, crawl priority) · [Ch 26 — Search Ranking](#content/26_ml_system_design)

---

### Q38 (G). How would you build a YouTube recommendation system?
*[G] | ★★★*

![Interview card for Q38 YouTube Recommendations: 30-second answer (softmax next-watch candidate generation with nearest-neighbour serving, ranking by expected watch time, valued watch time surveys since 2021), scout-and-judge analogy, the weighted logistic regression identity odds = sum of T_i / (N - k) approximately E(T), a two-stage funnel from millions of videos through candidate generation (softmax over 1M videos) to hundreds, then ranking (1024, 512, 256 ReLU) to dozens shown, a CTR versus watch time panel (clickbait 10 percent x 1 min = 0.10 min, lecture 4 percent x 8 min = 0.32 min per impression), a paper-insights table, follow-ups and the trap of ranking by click-through rate.](diagrams/iq32_info_q38_youtube_recs_ai.png)

**Simple Answer:**

YouTube has to pick a handful of videos for you from a library of billions, in a fraction of a second. Think of a shop with two staff: a fast scout who grabs a few hundred videos that people with your history tend to watch next, and a careful judge who orders them by how long you would actually keep watching — not by how tempting the thumbnail is.

```
  "Deep Neural Networks for YouTube Recommendations" (Covington et al., 2016)

  millions of videos
     │  CANDIDATE GENERATION — deep collaborative filtering
     │   inputs : averaged embeddings of up to 50 recent watches and
     │            50 recent searches, region, device, age, gender,
     │            "example age"
     │   train  : softmax over 1M videos: "which video is watched next?"
     │            (several thousand sampled negatives, >100× faster)
     │   serve  : user vector · video vectors → nearest-neighbour lookup
     ▼
  hundreds
     │  RANKING — hundreds of features, 1024 → 512 → 256 ReLU layers
     │   features: your history with this channel and topic, time since
     │             last watch, times already shown, which source nominated it
     │   label   : weighted logistic regression → expected WATCH TIME
     ▼
  dozens shown
```

**Official Definition:**

> The 2016 YouTube system splits recommendation into **candidate generation** — an extreme multiclass classifier that learns a user embedding u so that P(next watch = video i) = softmax(v_i · u), served by nearest-neighbour search over the video vectors v_i — and **ranking** — a deeper network over hundreds of features trained with weighted logistic regression, so that its output approximates expected watch time per impression.

> **Maths in one line:** `odds = Σ T_i / (N − k) ≈ E[T] × (1 + P) ≈ E[T]` — weight every clicked impression by its watch time T_i and every unclicked one by 1, and the learned odds e^(wx + b) become the expected watch time (N impressions, k clicks, P = click rate, which is small).

**Interview Answer:**

**Say this first (30 sec):** Two stages. Candidate generation treats "which video will this user watch next?" as a softmax over millions of videos, learns a user embedding from watch and search history, and serves it with nearest-neighbour search to get a few hundred candidates. A ranking network with hundreds of features then orders them by expected watch time rather than click-through rate, which demotes clickbait. YouTube has since added satisfaction signals: surveys measure "valued watch time".

| Paper insight | Why it matters |
|---|---|
| Predict the NEXT watch from earlier history only ("rollback") | a random held-out watch leaks the future; series are watched in order |
| "Example age" feature, set to 0 at serving | the model learns how popularity changes over time, so fresh videos are not under-predicted |
| A fixed number of training examples per user | a few very active users cannot dominate the loss |
| Search history as an unordered bag of tokens | stops the model from replaying your last search page |
| Watch-time-weighted logistic regression | equal weights raised the watch-time-weighted loss by 4.1% |

- **Since 2016 (public papers):** two-tower retrieval trained with in-batch softmax and a streaming popularity correction (Yi et al., 2019); multitask ranking with Multi-gate Mixture-of-Experts plus a shallow tower that absorbs position and selection bias (Zhao et al., 2019).
- **The objective kept moving:** clicks (until 2011) → watch time (2012; views fell 20% at once) → "valued watch time" from 1–5-star surveys, plus shares, likes, dislikes and demotion of borderline content (YouTube blog, 2021).
- **Worked numbers (Ch 30's program):** clickbait at 10% CTR × 1 minute per click earns 0.10 minutes per impression; a lecture at 4% × 8 minutes earns 0.32. CTR ranks the clickbait first; the watch-time model ranks the lecture first.

**Likely follow-ups:**

- *Why a softmax over videos instead of predicting ratings?* — Watches are orders of magnitude more plentiful than explicit ratings and closer to the product goal; sampled softmax makes millions of classes trainable.
- *How does a brand-new video get recommended?* — Content features (title, thumbnail, channel) let the item tower embed it, the example-age feature favours fresh uploads, and exploration traffic collects its first signals.
- *Why is offline evaluation hard here?* — The choice of surrogate label matters most, and the paper found it "very difficult to measure with offline experiments" — decide with A/B tests on watch time and satisfaction.

**Trap:** Saying YouTube ranks by click-through rate — CTR rewards clickbait; the ranker predicts expected watch time (and today satisfaction signals too), after a candidate generator has narrowed millions of videos to hundreds.

**Go deeper:** [Ch 30 — Paper 6: YouTube Recommendations](#content/30_google_ml_ecosystem) (runnable weighted-logistic-regression program) · [Ch 26 — Two-Tower](#content/26_ml_system_design) · [Ch 26 — Ranking](#content/26_ml_system_design) · Q34 in this chapter

---

### Q39 (G). How would you improve a classifier that has 95% accuracy but low recall?
*[G] | ★★*

![Interview card for Q39 95 percent accuracy but low recall: 30-second answer (check the base rate, lower the threshold with the PR curve and costs, class weights and better features judged by PR-AUC), silent smoke-detector analogy, the cost threshold t* = C_FP / (C_FP + C_FN) giving 0.1 when a miss costs 9x a false alarm, two confusion matrices on 1,000 cases with 50 positives (always negative: 95.0 percent accuracy, 0 percent recall; your model: 95.0 percent accuracy, 20 percent recall, 50 percent precision), a five-rung fix ladder from measuring to resampling last, Ch 10 numbers (recall 0.28 at threshold 0.5, 0.61 at 0.1, 0.98 with balanced weights at precision 0.08), follow-ups and the trap of reaching for SMOTE first.](diagrams/iq32_info_q39_low_recall_ai.png)

**Simple Answer:**

A smoke detector that never beeps is "right" almost every day in a building that rarely burns — and useless. If only 5% of cases are positive, a model that answers "no" to everything already scores 95% accuracy. Low recall means the model misses most of the real positives. The fix usually starts with the decision threshold and the cost of a miss, not with a fancier model.

```
  1,000 cases, 50 positive (5%)          Predicted +    Predicted −
  "always negative"    Actual + (50)          0 TP          50 FN
                       Actual − (950)         0 FP         950 TN
     accuracy 950/1,000 = 95.0%    recall 0/50 = 0%

  your model           Actual + (50)         10 TP          40 FN
                       Actual − (950)        10 FP         940 TN
     accuracy 950/1,000 = 95.0%    recall 10/50 = 20%    precision 10/20 = 50%
  (illustrative counts: same accuracy, very different usefulness)

  THE FIX LADDER — cheapest first (Ch 10 §10.11 measures each step)
  1. Measure honestly    confusion matrix, recall, precision, PR-AUC
  2. Move the threshold  below 0.5, picked on the PR curve (free, no retraining)
  3. Re-weight classes   class_weight="balanced" / scale_pos_weight
  4. Better signal       features, more positive labels, cleaner labels
  5. Resample last       SMOTE / undersampling, inside training folds only
```

**Official Definition:**

> **Recall** (sensitivity) = TP / (TP + FN): the share of actual positives the model catches. **Accuracy** = (TP + TN) / all cases. On imbalanced data accuracy is dominated by the majority class, so high accuracy with low recall means the model — or its decision threshold — rarely predicts the positive class.

> **Maths in one line:** `t* = C_FP / (C_FP + C_FN)` — with calibrated probabilities, flag a case when the expected cost of missing it beats the cost of a false alarm; if a miss costs 9× a false alarm, the threshold is 0.1, not 0.5.

**Interview Answer:**

**Say this first (30 sec):** First I'd check the base rate: if 5% of cases are positive, predicting "negative" every time already scores 95%, so the model may be barely better than doing nothing. Then, cheapest first: lower the decision threshold using the precision–recall curve and the real cost of a miss, add class weights, then improve features and labels — and judge the result by recall at an acceptable precision, or PR-AUC, not accuracy.

- **Threshold first, it's free:** on Ch 10's 99/1 fraud data, moving the threshold from 0.5 to 0.1 lifted recall from 0.28 to 0.61, while PR-AUC stayed 0.45 — the ranking was fine, the cut-off wasn't.
- **Class weights:** balanced weights pushed recall to 0.98, but precision fell to 0.08 — weights act like a much lower threshold and inflate probabilities, so recalibrate afterwards.
- **Let the business pick the operating point:** "recall ≥ 90% at precision ≥ 30%", or maximise F2 when misses cost more; tune on validation data, report once on test.
- **If PR-AUC itself is low,** no threshold helps: add better features, more and cleaner positive labels, or a stronger model (e.g. gradient boosting), and check recall per slice.
- **Resample last:** SMOTE and undersampling distort probabilities and often add little over a threshold shift; apply them only inside training folds.

**Likely follow-ups:**

- *Which metric would you optimise?* — Train on log loss (weighted if needed), select models by PR-AUC, then choose the threshold that meets the recall or precision target (or maximises F-beta, with β = 2 when misses matter more).
- *Recall went up, precision collapsed — now what?* — That is the trade-off moving along one curve. Send the uncertain middle band to human review, or improve the model; only a higher PR-AUC means the model itself got better.
- *Would ROC-AUC tell you this?* — Not clearly: with many negatives, a small false-positive rate still hides many false alarms; PR-AUC and precision show them (Q13, Q33).

**Trap:** Reaching for SMOTE or a bigger model first — check the base rate and move the threshold first: it costs nothing, needs no retraining, and tells you whether the model's ranking was already good enough.

**Go deeper:** [Ch 10 §10.11](#content/10_supervised_learning) (runnable program) · [Ch 8 §8.16](#content/08_core_concepts) · [Ch 13 §13.3](#content/13_model_evaluation) · [Ch 13 §13.5](#content/13_model_evaluation) · Q12 and Q33 in this chapter

---

### Q40 (G). What are distributed training strategies for large models?
*[G][O] | ★★★*

![Interview card for Q40 Distributed Training: 30-second answer (data parallel with all-reduce, shard with FSDP or ZeRO when it does not fit, add tensor and pipeline parallelism), bridge-crew analogy, the formula memory per GPU (ZeRO-3) about 16 bytes x params / N, a 2x2 grid of data parallel (GPUs on examples 0-15, 16-31, 32-47 with all-reduce), FSDP / ZeRO-3 shards, tensor parallel split inside one NVLink node and pipeline parallel over layers 1-20 to 61-80 with bubble (p - 1)/(m + p - 1), Llama 3 405B on 16,384 H100s with TP 8 x PP 16 x DP 128 at MFU 41 percent, a 70B-on-64-GPUs table (plain DP 1,120 GB, ZeRO-1 293 GB, ZeRO-2 155 GB, ZeRO-3 17.5 GB), follow-ups and the trap that plain data parallel does not cut memory.](diagrams/iq32_info_q40_distributed_training_ai.png)

**Simple Answer:**

Training a huge neural network on one chip would take years — or simply not fit. Distributed training splits the work across many chips, like a crew building a bridge. You can give every worker the full blueprint and a different pile of bricks (data parallelism), give each worker one section of the bridge (pipeline parallelism), let several workers carry one giant beam together (tensor parallelism), or tear the blueprint into pages so nobody carries the whole thing (sharding: ZeRO / FSDP).

```
  DATA PARALLEL (DP) — copy the model, split the batch
    GPU0: examples 0-15   ┐
    GPU1: examples 16-31  ├─► all-reduce (average) the gradients → same update
    GPU2: examples 32-47  ┘
    limit: weights + gradients + Adam state must fit on ONE GPU
           (mixed-precision Adam ≈ 16 bytes/param → a 7B model = 112 GB)

  FSDP / ZeRO-3 — data parallel, but each GPU keeps only 1/N of the
    weights, gradients and Adam state; a layer's weights are gathered
    just in time → memory per GPU ≈ 16 bytes × params / N

  TENSOR PARALLEL (TP) — split each big matrix
    attention by heads, MLP by columns then rows → all-reduces inside
    every layer → needs NVLink-class links → stays inside one 8-GPU node

  PIPELINE PARALLEL (PP) — split the layers
    GPU0: layers 1-20 → GPU1: 21-40 → GPU2: 41-60 → GPU3: 61-80
    micro-batches keep the stages busy; idle "bubble" = (p − 1)/(m + p − 1):
    4 stages with 4 micro-batches idle 43% of the time, with 32 only 9%

  + CONTEXT parallel (split very long sequences) · EXPERT parallel (MoE)

  Llama 3 405B on 16,384 H100s: TP 8 × PP 16 × DP 128 (FSDP) → BF16 MFU 41%
```

**Official Definition:**

> **Distributed training** spreads one training job over many accelerators. **Data parallelism** replicates the model and averages gradients with all-reduce; **model parallelism** partitions the model itself — by tensor (the matrices inside each layer), by pipeline stage (groups of layers), by sequence or by expert; **sharded data parallelism** (ZeRO / FSDP) partitions optimizer states, gradients and weights across the data-parallel workers. Large runs combine them (3D / 4D parallelism) so that each kind of traffic runs on a network fast enough for it.

> **Maths in one line:** `memory per GPU (ZeRO-3) ≈ 16 bytes × params / N` — mixed-precision Adam keeps 2 (BF16 weights) + 2 (gradients) + 12 (FP32 master copy, momentum, variance) bytes per parameter; sharding over N GPUs divides all of it. Activations come on top.

**Interview Answer:**

**Say this first (30 sec):** Start with data parallelism — a model copy per GPU, a different slice of each batch, gradients averaged with all-reduce — and move to sharded data parallelism (FSDP / ZeRO) once the ~16 bytes per parameter of Adam training state no longer fits. When single layers or activations are too big, add tensor parallelism inside a node and pipeline parallelism across nodes: Llama 3 405B used TP 8 × PP 16 × DP 128 on 16,384 H100 GPUs at about 41% model FLOPs utilization.

| Strategy | What is split | Communication | Use when |
|---|---|---|---|
| DP (PyTorch DDP) | the batch | all-reduce every gradient each step | the model fits on one GPU |
| FSDP / ZeRO | Adam states, gradients, weights | gather + reduce-scatter per layer; ZeRO-3 ≈ 1.5× DP traffic | training state does not fit |
| Tensor (TP) | matrices inside each layer | all-reduces inside every layer | huge layers; within one NVLink node |
| Pipeline (PP) | groups of layers | activations to the next stage only | many layers; across nodes |
| Context / Expert | the sequence / MoE experts | exchange keys and values (e.g. ring attention) / all-to-all | long context / MoE models |

- **Memory first:** plain DP keeps all 16 bytes per parameter on every GPU — 1,120 GB for a 70B model. On 64 GPUs, ZeRO-1 / 2 / 3 cut that to 293 / 155 / 17.5 GB per GPU (Ch 29 §24.6).
- **Communication decides placement:** all-reduce sends 2(N − 1)/N × the gradient size per GPU, nearly flat as N grows. Per direction, H100 NVLink (450 GB/s) is ~9× the network (50 GB/s), so TP stays inside a node and DP crosses nodes.
- **Activations:** checkpointing recomputes them for ~33% more compute — a 7B model at 4,096 tokens drops from ~18.3 GB to 1.6 GB (Ch 29 §24.3); context parallelism splits long sequences.
- **Efficiency metric:** MFU = achieved model FLOPs ÷ peak, at ~6 × params FLOPs per token; well-tuned large runs land around 35–50% (Llama 3 405B: 38–43%).
- **Google's way:** TPU pods linked by the inter-chip interconnect (ICI); in JAX you annotate how arrays are sharded over a device mesh and XLA's GSPMD inserts the collectives; Pathways runs one job across pods. PaLM: 6,144 TPU v4 chips in two pods, no pipeline parallelism, 46.2% MFU.

**Likely follow-ups:**

- *DDP or FSDP?* — DDP replicates everything: simplest and fastest when it fits. FSDP (PyTorch's `fully_shard`) shards it and gathers weights layer by layer, trading about 1.5× the communication for N× less memory.
- *Synchronous or asynchronous updates?* — Large runs are synchronous (one all-reduce per step) for stable, reproducible convergence; asynchronous parameter servers apply stale gradients. The global batch grows with N, so retune the learning rate and warm-up.
- *A chip fails mid-run — then what?* — Restart from the latest checkpoint; at this scale failures are routine. Gemini kept redundant in-memory copies of the model state to recover fast and raised goodput from 85% to 97%.

**Trap:** Saying "more GPUs in data parallelism means less memory per GPU" — plain DP keeps a full copy of the weights, gradients and Adam state (~16 bytes per parameter) on every GPU; only sharding (ZeRO / FSDP) or splitting the model (tensor, pipeline) shrinks that per-GPU model state.

**Go deeper:** [Ch 29 §24.6](#content/29_gpus_tpus_infrastructure) (TP and pipeline-bubble programs, ZeRO table) · [Ch 29 §24.6a](#content/29_gpus_tpus_infrastructure) (ring all-reduce program) · [Ch 29 §24.6c](#content/29_gpus_tpus_infrastructure) (MFU) · [Ch 17 §3.6](#content/17_llm) (will-it-fit calculator) · [Ch 30 §1.3](#content/30_google_ml_ecosystem) (TPU pods, XLA) · [Ch 16 §1.7](#content/16_deep_learning) (mixed precision)

---

# PART 7 — Amazon-Specific Questions

---

### Q41 (A). How does Amazon's recommendation engine work at scale?
*[A] | ★★★*

![Interview card Q41 on Amazon item-to-item collaborative filtering: 30-second answer, bookseller analogy, the score formula (observed minus expected co-buyers) divided by sqrt(expected), an offline lane building the similar-items table (camera to memory card 1.22, tripod 0.41; novel to cookbook 0.82) and an online lane doing 2 look-ups to recommend memory card and cookbook, the camera-row table from 8 customers (batteries scores 0), follow-ups and the user-based trap.](diagrams/iq32_info_q41_amazon_item_to_item_ai.png)

**Simple Answer:**

Picture a bookseller who keeps, for every book, a card listing the other books its buyers
bought unusually often. When you walk in with a camera in your basket, she does not hunt
through her memory for customers like you — she reads the camera's card: memory card,
tripod. Amazon has done this for millions of items since 1998. The expensive part, writing
every item's card, runs offline; showing you recommendations is a few quick look-ups.

```
  OFFLINE — batch job, all purchases        ONLINE — every page view
  ──────────────────────────────────        ──────────────────────────────
  for each item X: score every Y that       you bought: camera, novel
  X's buyers also bought; keep the best          │ 2 look-ups, 1 per item
                                                 ▼
  SIMILAR-ITEMS TABLE                       camera → memory card  1.22
    camera   → memory card 1.22                      tripod       0.41
               tripod      0.41             novel  → cookbook     0.82
    novel    → cookbook    0.82                  │ add up, drop owned items
    cookbook → novel       0.82                  ▼
    ...                                     recommend: memory card, cookbook

  cost: items × customers, paid offline     cost: grows only with YOUR history
  score = (observed − expected co-buyers) / √expected      (program below)
```

**Official Definition:**

> **Item-to-item collaborative filtering** (Linden, Smith & York, IEEE Internet Computing, 2003;
> launched at Amazon in 1998) builds a similar-items table offline: for each item, the items its
> buyers purchase unusually often, scored for example by the cosine between item vectors whose
> dimensions are customers. At request time it looks up the rows for the items in a customer's
> history or cart, merges and ranks them and removes items already owned, so the online cost depends
> only on the size of that history — not on the number of customers or items.

> **Maths in one line:** `score(X, Y) = (N_XY − E_XY) / √E_XY` — customers who bought both X and Y,
> minus how many would have by chance (simplest estimate E_XY = N_X · N_Y / customers), scaled so
> that neither best-sellers nor rare items win by default (Smith & Linden, 2017).

**Interview Answer:**

**Say this first (30 sec):** Amazon's classic engine is item-to-item collaborative filtering:
instead of searching for customers like you at request time, it precomputes for every item the
items its buyers unusually often also buy. A page view then looks up the rows for what is in your
history or cart, merges them and drops what you already own — so serving cost depends on your
history, not on hundreds of millions of customers or tens of millions of items. It reacts to a new
purchase at once and explains itself: "because you bought X".

| | User-based CF | Item-to-item CF (Amazon) |
|---|---|---|
| Work per request | Compare you with millions of customers | One look-up per item in your history |
| Heavy work | At request time, or sample and lose quality | Offline: O(N²M) worst case, about O(NM) in practice (N items, M customers) |
| Why it stays valid | Neighbours shift with every purchase | Item-to-item relations change slowly, so a batch rebuild keeps up |
| Explanation | "People like you bought …" | "Because you bought X" |

- **What "related" means:** 2003 used cosine; the 2017 follow-up compares observed with chance co-buyers. N − E favours best-sellers, (N − E)/E obscure items; (N − E)/√E balances them.
- **Heavy buyers skew counts:** a 1,000-purchase customer is ~50× likelier than a 20-purchase one to be among any item's buyers, so each purchase counts as one chance to buy Y.
- **Views ≠ purchases; time matters:** shoppers view many TVs, buy one, then a wall mount. Same-day pairs beat pairs months apart; order matters (camera → memory card, not back).
- **Where it sits today:** one candidate source in Q34's retrieve-then-rank funnel; Amazon's 2017 paper describes ML and online experiments tuning the scores with clicks and purchases.
- **Impact:** a Microsoft Research report estimated that 30% of Amazon's page views came from recommendations (cited by Smith & Linden, 2017).

**Worked example:** a 6-item similar-items table built from 8 customers, then recommendations served by look-up.

```python
# Item-to-item collaborative filtering: build the similar-items table offline, recommend by lookup online
import numpy as np

items = ["camera", "memory card", "tripod", "novel", "cookbook", "batteries"]
B = np.array([[1, 1, 1, 0, 0, 1],       # rows = 8 customers, columns = items, 1 = bought
              [1, 1, 0, 0, 0, 1],
              [1, 1, 1, 0, 0, 1],
              [1, 0, 0, 1, 0, 1],
              [0, 0, 1, 0, 0, 1],
              [0, 0, 0, 1, 1, 1],
              [0, 0, 0, 1, 1, 1],
              [0, 0, 0, 0, 1, 1]])      # batteries: everyone buys them
M = len(B)
N = B.T @ B                             # N[x, y] = customers who bought both x and y
n = np.diag(N)                          # buyers of each item
E = np.outer(n, n) / M                  # co-buyers expected if x and y were unrelated
cosine = N / np.sqrt(np.outer(n, n))    # 2003 paper: cosine of item vectors over customers
chi = (N - E) / np.sqrt(E)              # 2017 paper: observed vs expected, balanced score

# OFFLINE: the "camera" row of the similar-items table under three scores
x = items.index("camera")
print(f"{'with camera':12s}{'co-buyers':>10s}{'cosine':>8s}{'(N-E)/sqrt(E)':>15s}")
for y in np.argsort(-chi[x]):
    if y != x and N[x, y] > 0:
        print(f"{items[y]:12s}{N[x, y]:10d}{cosine[x, y]:8.2f}{chi[x, y]:15.2f}")
others = [y for y in range(len(items)) if y != x]
assert max(others, key=lambda y: N[x, y]) == items.index("batteries")    # raw count: the bestseller
assert max(others, key=lambda y: chi[x, y]) == items.index("memory card")
assert abs(chi[x, items.index("batteries")]) < 1e-9                      # bought by all: no signal

# ONLINE: one table lookup per item the customer owns; add scores, drop what they own
def recommend(history, k=2):
    owned = [items.index(h) for h in history]
    score = np.clip(chi[owned], 0, None).sum(axis=0)
    score[owned] = -np.inf
    return [items[y] for y in np.argsort(-score) if score[y] > 0][:k], len(owned)

for history in (["camera"], ["novel"], ["camera", "novel"]):
    recs, lookups = recommend(history)
    print(f"bought {str(history):22s} -> {recs}  ({lookups} lookup{'s' * (lookups > 1)})")
```

**Output:**

```
with camera  co-buyers  cosine  (N-E)/sqrt(E)
memory card          3    0.87           1.22
tripod               2    0.58           0.41
batteries            4    0.71           0.00
novel                1    0.29          -0.41
bought ['camera']             -> ['memory card', 'tripod']  (1 lookup)
bought ['novel']              -> ['cookbook']  (1 lookup)
bought ['camera', 'novel']    -> ['memory card', 'cookbook']  (2 lookups)
```

Raw co-buyer counts would put batteries — bought by everyone — first. Cosine damps them but still
ranks them above the tripod; observed-versus-expected scores them exactly 0, and scores the novel
below 0 (bought with a camera less often than chance). Serving costs one look-up per item owned,
however large the catalog.

**Likely follow-ups:**

- *How do you recommend a brand-new item?* — It has no co-purchases yet: find neighbours from content (title, category, embeddings) and reserve some slots for exploration so it can earn data.
- *Do recommendations really drive 35% of Amazon's revenue?* — That is an unsourced 2013 McKinsey line that Amazon never confirmed; Amazon's own authors cite a Microsoft Research estimate of 30% of page views.
- *How do you evaluate it?* — Offline: recall@k and NDCG on later purchases with a time split (Q49). Online: an A/B test on sales per visitor (Q43).

**Trap:** "Amazon recommends what customers similar to you bought" — that is user-based filtering; Amazon's engine relates *items*. And ranking by raw co-purchase counts recommends best-sellers to everyone — compare with what chance predicts.

**Go deeper:** Q34 (recommender design) and Q38 (YouTube's two-stage funnel) in this chapter · [Ch 26 — Two-Tower and the Funnel](#content/26_ml_system_design) · [Ch 11 §11.16](#content/11_unsupervised_learning) (lift and the best-seller trap) · [Ch 28 §24.9](#content/28_semantic_search) (ranking metrics)

---

### Q42 (A). How would you build a demand forecasting system for Amazon?
*[A] | ★★★*

![Interview card Q42 on demand forecasting at Amazon: 30-second answer (one global model with quantile loss, forecast quantiles, buy the cost-balancing quantile), warehouse analogy, MAPE versus WAPE formulas, a pipeline from sales history, calendar and price inputs into one global model, a demand bell curve with P10 68, P50 100, P75 117 and P90 132 and a shaded 25% stock-out tail, a BUY P75 = 117 decision from the critical ratio 6 / (6 + 2) = 0.75, cost bars 79.8 versus 63.4, a MAPE/sMAPE/WAPE table for a fast and a slow seller, follow-ups and the order-the-mean trap.](diagrams/iq32_info_q42_demand_forecasting_ai.png)

**Simple Answer:**

Amazon needs to know: "How many red sneakers in size 9 will be ordered in Seattle next week?"
Guess too high and money sits in a warehouse as unsold stock; guess too low and customers see
"out of stock" and buy elsewhere. Across hundreds of millions of products, small errors add up fast.
So instead of one guess, a good forecast says how likely each amount is — and the business
then buys the amount that balances the two kinds of mistake.

```
  ONE PRODUCT × ONE REGION × NEXT WEEK

  INPUTS                      MODEL                   OUTPUT: a distribution
  ──────                      ─────                   ──────────────────────
  sales: last 7/28/365 days,  ONE global model        P10  P50  P75  P90
    same week last year       for millions of          68  100  117  132
  calendar: weekday,          products, trained       (units next week)
    holidays, Prime Day       with quantile loss                │
  price, promotions,                                            ▼
    stock-out days            BUY the P75 = 117 units when a missed sale
  product: category, age,     costs 6 and a leftover unit costs 2:
    similar items' launches   critical ratio 6 / (6 + 2) = 0.75
  region: fulfilment centre
```

**Official Definition:**

> **Demand forecasting** predicts how many units of each product will be ordered per location and
> period, usually for several periods ahead. At retail scale the forecasts are **probabilistic** —
> quantiles or a full distribution, not one number — because inventory decisions weigh the cost of
> a stock-out against the cost of leftover stock. Models are trained with **quantile (pinball)
> loss**, scored with errors such as WAPE and quantile loss, and validated by backtesting on
> time-ordered splits.

> **Maths in one line:** `MAPE = (100/n) · Σ |yᵢ − ŷᵢ| / |yᵢ|` but `WAPE = 100 · Σ |yᵢ − ŷᵢ| / Σ |yᵢ|` —
> MAPE averages each day's percentage error, so a single zero-sales day makes it undefined; WAPE
> divides total error by total demand, so it is always defined and weighted by volume.

**Interview Answer:**

**Say this first (30 sec):** I'd train one global, probabilistic model on all products at once,
with quantile loss, to forecast each product × region several weeks ahead as quantiles such as
P50 and P90. Inventory then buys the quantile that balances a stock-out against leftover stock: if
a missed sale costs 6 and a leftover unit 2, buy the P75. That is the path Amazon took — from
per-series textbook models to quantile random forests to neural nets trained on quantile loss
(MQ-CNN, then MQ-Transformer).

| Step | Model | Why |
|---|---|---|
| Baseline | Seasonal naive (same week last year), moving average | The bar every model must beat |
| Per series | ETS, ARIMA, Prophet | Few, regular series; weak on new products and spikes |
| Global trees | LightGBM on lag, rolling-window, calendar and price features | One model for millions of series; won the M5 Walmart-sales competition (2020) |
| Global deep, probabilistic | DeepAR (autoregressive RNN), MQ-CNN / MQ-Transformer | Amazon's line; DeepAR reported ~15% better accuracy than earlier methods |
| Pretrained | Chronos-2 (Amazon, Oct 2025, 120M parameters) | Zero-shot quantile forecasts: cold starts and quick baselines |

- **One global model:** pooling products gives "statistical strength" across categories. Amazon's switch to a network trained on quantile loss replaced a dozen specialised systems.
- **New products:** no history, so learn from how similar products sold at launch (a new laptop from past laptop launches).
- **Sales ≠ demand:** on stock-out days sales understate demand; mask or model those days, or the model learns to forecast low.
- **Score what the business pays for:** quantile loss at the quantiles you buy at, WAPE for overall error (weighted by units — weight by revenue if money matters, as M5 did), and bias — never MAPE alone.
- **Backtest honestly:** rolling-origin, time-ordered splits, never shuffled ([Ch 13 §13.7](#content/13_model_evaluation)).

**Worked example:** MAPE, sMAPE and WAPE on a fast and a slow seller, then the order quantity from a probabilistic forecast.

```python
# Forecast metrics (MAPE, sMAPE, WAPE) on a fast and a slow seller, then turning a forecast into an order
import numpy as np

def mape(y, f):                     # (100/n) * sum |y - f| / |y| -- undefined if any actual is 0
    return np.inf if np.any(y == 0) else 100 * np.mean(np.abs(y - f) / np.abs(y))
def smape(y, f):                    # M4 definition, bounded 0-200%
    return 100 * np.mean(np.abs(y - f) / ((np.abs(y) + np.abs(f)) / 2))
def wape(y, f):                     # total absolute error / total demand: weighted by volume
    return 100 * np.sum(np.abs(y - f)) / np.sum(np.abs(y))

fast_y, fast_f = np.array([100, 120, 90, 110]), np.array([110, 115, 100, 100])   # 4 days of sales
slow_y, slow_f = np.array([2, 0, 1, 3]), np.array([1, 1, 1, 1])
print(f"{'series':13s}{'MAPE':>10s}{'sMAPE':>8s}{'WAPE':>8s}")
for name, y, f in [("fast seller", fast_y, fast_f), ("slow seller", slow_y, slow_f),
                   ("both", np.r_[fast_y, slow_y], np.r_[fast_f, slow_f])]:
    m = mape(y, f)
    m_txt = "undefined" if np.isinf(m) else f"{m:.1f}%"
    print(f"{name:13s}{m_txt:>10s}{smape(y, f):7.1f}%{wape(y, f):7.1f}%")
assert np.isinf(mape(slow_y, slow_f)) and round(wape(fast_y, fast_f), 1) == 8.3

# Newsvendor: order the c_u / (c_u + c_o) quantile of the demand forecast, not its mean
rng = np.random.default_rng(0)
demand = rng.normal(100, 25, 100_000).clip(min=0)   # probabilistic forecast for next week
c_u, c_o = 6.0, 2.0                                 # cost per unit short (lost margin), per unit left over
ratio = c_u / (c_u + c_o)

def expected_cost(q):
    return np.mean(c_u * np.maximum(demand - q, 0) + c_o * np.maximum(q - demand, 0))

q_star = np.quantile(demand, ratio)
best = min(range(60, 161), key=expected_cost)
print(f"\ncritical ratio {c_u:.0f}/({c_u:.0f}+{c_o:.0f}) = {ratio:.2f} -> order the P{ratio * 100:.0f} "
      f"= {q_star:.0f} units (forecast mean 100)")
for q in (100, round(q_star)):
    print(f"order {q:3d}: expected cost {expected_cost(q):5.1f}, "
          f"P(stock-out) {np.mean(demand > q):.0%}")
print(f"grid search over 60-160 units picks {best}")
assert abs(best - q_star) <= 1
```

**Output:**

```
series             MAPE   sMAPE    WAPE
fast seller        8.6%    8.5%    8.3%
slow seller   undefined   91.7%   66.7%
both          undefined   50.1%    9.2%

critical ratio 6/(6+2) = 0.75 -> order the P75 = 117 units (forecast mean 100)
order 100: expected cost  79.8, P(stock-out) 50%
order 117: expected cost  63.4, P(stock-out) 25%
grid search over 60-160 units picks 117
```

One zero-sales day makes MAPE undefined. sMAPE treats both series equally (50.1%); WAPE weights by
volume, so the slow seller's 66.7% error barely moves the total (9.2%). Ordering the forecast mean
runs out half the time; ordering the P75 cuts the expected cost by about a fifth.

**Likely follow-ups:**

- *Why not just report MAPE?* — It is undefined at zero sales (common for slow sellers), explodes near zero and rewards forecasting low; use WAPE or sMAPE plus quantile loss ([Ch 13 §13.6](#content/13_model_evaluation)).
- *Why train with quantile loss instead of MSE?* — MSE is minimised by the mean; pinball loss at τ by the τ-quantile, the order the newsvendor rule wants. The newsvendor cost equals (c_u + c_o) × pinball loss at τ = c_u / (c_u + c_o).
- *How do you handle Prime Day or a sudden spike?* — Give the model known future inputs (event calendar, planned price and promotions); after a one-off shock, flag those days so they do not distort the baseline.

**Trap:** "Forecast one number and order exactly that" — the mean runs out half the time. When a missed sale costs 3× a leftover unit, buying the P75 (117, not 100) cuts the expected cost from 79.8 to 63.4.

**Go deeper:** [Ch 13 §13.6](#content/13_model_evaluation) (MAPE and its traps) · [Ch 13 §13.7](#content/13_model_evaluation) (time-series cross-validation) · [Ch 12 §12.6](#content/12_key_algorithms) (gradient boosting) · Q31 (data leakage) in this chapter

---

### Q43 (A). What is A/B testing at Amazon's scale? What unique challenges exist?
*[A] | ★★★*

![Interview card Q43 on A/B testing at Amazon scale: 30-second answer (interference, many tests, short versus long term), battery-twin analogy, expected false wins = 0.05 x 10,000 null experiments = 500, a product-by-product split where discounted Brand A sells 110 and control Brand B 94 with 6 units stolen giving a naive +10.4 (2.6 times too big) versus a cluster split of 104 and 100 per product giving +4.2 close to the true +4, a challenge-fix-evidence table, follow-ups and the huge-sample trap.](diagrams/iq32_info_q43_ab_testing_at_scale_ai.png)

**Simple Answer:**

An A/B test is a fair coin flip: half the traffic sees the old version, half the new, and you
compare. Amazon runs tens of thousands of these a year on one shared store, and at that scale
the simple recipe breaks in three ways. Units affect each other — a discount on one battery
brand steals sales from its untreated twin. Thousands of tests mean some "wins" are pure luck.
And what wins this week (more e-mails, a flashier widget) can lose customers over months.

```
  WHY AMAZON PRICE TESTS RANDOMIZE PRODUCTS — AND CLUSTER THEM
  Every customer sees the same price, so the treatment is a set of PRODUCTS.
  Brands A and B of AA batteries are substitutes: 100 units a week each.

  PRODUCT-BY-PRODUCT SPLIT                 CLUSTER SPLIT (twins together)
  A discounted   100 + 4 new + 6 from B    pair A+B discounted   104 each
  B control      100 − 6 lost to A         pair C+D control      100 each
  A − B = +16, mostly B's loss             difference = +4, the true effect
  over 500 pairs: +10.4 (2.6× too big)     over 500 pairs: +4.2

  (illustrative numbers — the program below)
```

**Official Definition:**

> **A/B testing at scale** runs many randomized controlled experiments at once on shared traffic
> and shared inventory. Beyond the basics — randomize, size the test, pick one primary metric (Q17)
> — it must handle **interference** (one unit's treatment changes another unit's outcome, breaking
> the no-interference assumption, SUTVA), **multiplicity** (many tests and metrics inflate false
> wins), **time effects** (novelty, carry-over, seasonality) and the gap between short-term metrics
> and long-term customer value.

> **Maths in one line:** `expected false wins ≈ α × (experiments with no real effect)` — at
> α = 0.05, 10,000 do-nothing experiments still produce about 500 "significant" wins, so control the
> false-discovery rate instead of trusting each p < 0.05.

**Interview Answer:**

**Say this first (30 sec):** Amazon runs tens of thousands of experiments a year on one shared
marketplace, so the Q17 basics are not enough. I'd add three things: a design that respects
interference — price tests randomize products, with substitutes clustered together; control of
false discoveries, because at α = 0.05 one in twenty do-nothing tests "wins"; and a decision metric
tied to long-term customer value, backed by guardrails and long-term holdouts.

| Challenge | At Amazon | Fix |
|---|---|---|
| Interference (spillover) | Price tests randomize products (no price discrimination); a discounted item takes sales from untreated substitutes | Cluster related products (about 30% less bias in Amazon's study); crossover designs |
| Many tests → false wins | Tens of thousands of experiments a year; few meet the launch bar | One pre-registered primary metric; Benjamini–Hochberg FDR control; re-test surprising wins |
| Short-term ≠ long-term | More e-mail raised revenue and unsubscribes; pricing in each unsubscribe's lost value turned over half the "winning" campaigns negative | A decision metric (OEC) that predicts lifetime value; guardrails; long-term holdouts |
| Novelty and carry-over | New widgets draw curiosity clicks; this week's price shapes next week's demand | Run 2+ weeks; compare new vs returning users; blackout weeks in crossovers |
| Traffic spent on losers | Most experiments will never ship | Stop for futility: Amazon's 2024 service saves about 2 weeks on ~10% of experiments |

- **Heavy-tailed revenue:** a few huge orders dominate the variance; cap (winsorize) outliers and use CUPED, which halved variance at Bing (Q17).
- **Data beats opinion:** a senior VP forbade shopping-cart recommendations; Greg Linden ran the A/B test anyway, and the feature won by a wide margin and launched.
- **Sources to name:** Cooprider & Nassiri (2023, Amazon's Pricing Labs), Liu et al. (WWW 2025, futility stopping), Ron Kohavi, ex-Amazon (the e-mail example).

**Worked example:** a price test on 500 pairs of substitute products — randomized product by product, then pair by pair.

```python
# Spillover in a product-randomized price test: substitutes make the naive A/B estimate too big
import numpy as np

rng = np.random.default_rng(0)
pairs = 500                       # 500 pairs of substitute products, e.g. two brands of AA batteries
base, own, steal = 100.0, 4.0, 6.0   # illustrative weekly units: a discount brings 4 new buyers and
                                     # takes 6 from the twin if the twin is NOT discounted

def weekly_units(treated):        # treated: array (pairs, 2) of True/False
    twin = treated[:, ::-1]
    units = base + own * treated + steal * (treated & ~twin) - steal * (~treated & twin)
    return units + rng.normal(0, 5, treated.shape)

true_effect = own                 # discount EVERY product: nobody is left to steal from

# 1) The usual split: each product independently to treatment or control
t = rng.random((pairs, 2)) < 0.5
u = weekly_units(t)
naive = u[t].mean() - u[~t].mean()

# 2) Cluster randomization: both twins always land in the same arm
c = np.repeat(rng.random((pairs, 1)) < 0.5, 2, axis=1)
u = weekly_units(c)
cluster = u[c].mean() - u[~c].mean()

print(f"{'true effect (discount everything)':38s}: +{true_effect:.1f} units per product per week")
print(f"{'product-by-product randomization':38s}: +{naive:.1f}  ({naive / true_effect:.1f}x the truth)")
print(f"{'cluster randomization (twins together)':38s}: +{cluster:.1f}")
assert naive > 2 * true_effect and abs(cluster - true_effect) < 1.5
```

**Output:**

```
true effect (discount everything)     : +4.0 units per product per week
product-by-product randomization      : +10.4  (2.6x the truth)
cluster randomization (twins together): +4.2
```

A bigger sample would not help the first design: it measures sales moving *between* the arms, not
new sales. Keeping substitutes in the same arm removes that transfer, so the estimate lands on the
true +4.

**Likely follow-ups:**

- *Why not randomize prices by customer?* — Amazon does not price-discriminate, so every customer sees the same price; the experimental unit is the product (or product × time period).
- *How does a crossover design work?* — Group A is treated for the first half and B for the second; each product is compared with itself, and the first week after each switch is dropped to absorb carry-over.
- *Benjamini–Hochberg in one line?* — Sort the m p-values; reject the k smallest, where k is the largest i with p₍ᵢ₎ ≤ (i/m)·q. The expected share of false discoveries stays at most q.

**Trap:** "At Amazon's scale every test is well powered, so ship whatever is significant" — about 5% of do-nothing tests come out significant anyway, and if treated and control units interact, even a huge sample measures the wrong thing (+10.4 instead of +4 above).

**Go deeper:** Q17 (A/B test design) and Q16 (p-values) in this chapter · [Ch 26 — A/B Testing](#content/26_ml_system_design) (SRM, interleaving, long-term holdouts) · [Ch 17c §4.4](#content/17c_llm_systems) (sample size and peeking) · [Ch 6 §3.7](#content/06_math_fundamentals) (hypothesis testing)

---

# PART 8 — OpenAI-Specific Questions

> **Currency note (Nov 2026):** OpenAI's flagship models are reasoning models. Since o1 (2024) they are trained with reinforcement learning to "think" in hidden tokens before answering, and since GPT-5 (Aug 2025) the thinking is built into the main line as a reasoning-effort setting; the lineup as of Nov 2026 is GPT-6 Astra, GPT-6.1 Sol and Terra, and GPT-6 Luna ([Ch 20 §20.1](#content/20_2026_landscape)). When a question touches chain-of-thought or benchmarks, answer with the effort dial and current evals — Terminal-Bench 4.0, OSWorld 2.0, Humanity's Last Exam, ARC-AGI-3, Arena — not saturated MMLU or GSM8K. The answers below are the short, OpenAI-flavoured versions; the full ones live in Ch 33 and 33b.

---

### Q44 (O). How do large language models (LLMs) work?
*[O] | ★★★*

![Interview card Q44 on how large language models work: 30-second answer (decoder-only Transformer, pre-training on trillions of tokens, post-training with SFT, RLHF and RL), well-read autocomplete analogy, the next-token cross-entropy loss, a pipeline from trillions of tokens through pre-training to a base text-continuer and post-training to an assistant, an input/target example The cat sat on the mat, a generation loop prompt to Transformer to probabilities to pick token to append, vocabulary 50K to 260K tokens, an OpenAI path table GPT-3 2020 to GPT-5 2025, follow-ups and the ChatGPT-is-pre-trained trap.](diagrams/iq32_info_q44_how_llms_work_ai.png)

**Simple Answer:**

An LLM is a very well-read autocomplete. It reads your text as tokens (pieces of words), predicts
the most likely next token, appends it and repeats. Trained this way on trillions of tokens of
web pages, books and code, it has to learn grammar, facts and patterns of reasoning to keep
guessing right. A second round of training then turns this text-continuer into an assistant
that follows instructions.

```
  1. PRE-TRAINING: predict the next token, trillions of times (no labels)
     text:    "The cat sat on the mat"
     input:    The   cat   sat   on    the
     target:   cat   sat   on    the   mat      ← every position is a lesson

  2. POST-TRAINING: turn the text-continuer into an assistant
     SFT on instruction examples → RLHF or DPO on human preferences
     → RL on checkable answers (maths, code) for reasoning models

  3. GENERATION: one token at a time
     prompt → Transformer layers (attention + feed-forward) → a probability
     for each of ~50K–260K vocabulary tokens → pick one → append → repeat

  OpenAI's path:  GPT-1 2018 (117M) → GPT-2 2019 (1.5B) → GPT-3 2020 (175B,
  few-shot) → InstructGPT / ChatGPT 2022 (RLHF) → GPT-4 2023 → o1 2024
  (RL reasoning) → GPT-5 2025 (thinking built in) → GPT-6 family 2026
```

**Official Definition:**

> A **Large Language Model** is a neural network — almost always a decoder-only Transformer —
> pre-trained by self-supervised next-token prediction on trillions of tokens, so it models
> P(xₜ | x₁, …, xₜ₋₁) over a fixed vocabulary, then post-trained (SFT, preference tuning, RL on
> verifiable answers) to follow instructions and reason. It generates autoregressively: one
> forward pass per new token, sampling from the predicted distribution.

> **Maths in one line:** `L = −(1/T) · Σₜ log p(xₜ | x₁ … xₜ₋₁)` — at each of the T positions, take
> the probability the model gave the token that really came next, take minus its log and average;
> pre-training is pushing this one number down.

**Interview Answer:**

**Say this first (30 sec):** An LLM is a decoder-only Transformer trained to predict the next token
on trillions of tokens; doing that well forces it to learn language, facts and reasoning patterns.
Post-training makes it an assistant — OpenAI's InstructGPT showed that SFT plus RLHF made a 1.3B
model preferred over the 175B GPT-3 — and since o1 (2024), reinforcement learning on checkable
answers teaches models to think before they answer.

- **Inside one step:** tokens → embeddings → stacked self-attention and feed-forward layers → a score for every vocabulary token → softmax → sample (Q25 in this chapter).
- **Two phases at inference:** the prompt is read in one parallel pass (prefill); then one forward pass per new token (decode), reusing cached keys and values ([Q7 in Ch 33](#content/33_llm_interview_questions)).
- **Scale:** GPT-3 trained 175B parameters on 300B tokens; Llama 3.1 405B saw 15.6T tokens. How to split compute between the two is Q45.
- **Reasoning models:** hidden thinking tokens, billed as output, set by `reasoning.effort` on OpenAI's API; they help on maths and code, waste tokens on look-ups.

**Likely follow-ups:**

- *Base model vs ChatGPT?* — A base model only continues text ("Write a poem about autumn" may get "Write a poem about winter"); SFT and RLHF make it follow instructions ([Q13 in Ch 33](#content/33_llm_interview_questions)).
- *Why decoder-only?* — One causal stack handles any text-to-text task through the prompt, and next-token training turns every position into a label ([Q5 in Ch 33](#content/33_llm_interview_questions)).
- *Why does it hallucinate?* — It generates likely tokens from patterns in its weights; it keeps no searchable copy of its training data. Ground facts with retrieval (RAG).

**Trap:** "ChatGPT is the pre-trained model" — pre-training gives a text-continuer; the instruction-following, refusals and step-by-step reasoning come from post-training.

**Go deeper:** [Q1 and Q13 in Ch 33](#content/33_llm_interview_questions) · [Ch 17 §2.4](#content/17_llm) (Transformer) · [Ch 17 §3.1](#content/17_llm) (pre-training) · [Ch 17 §4.1](#content/17_llm) (GPT family) · Q25 (attention) and Q30 (RLHF) in this chapter

---

### Q45 (O). What are scaling laws in ML?
*[O] | ★★★*

![Interview card Q45 on neural scaling laws: 30-second answer (power law in N, D and C, small runs predict big ones, about 20 tokens per parameter), recipe-card analogy, C = 6 x N x D and D_opt = 20 x N giving N_opt = sqrt(C / 120), a log-log loss versus compute chart where small runs extend to a GPT-4 star predicted from up to 10,000 times smaller runs and flatten towards an irreducible loss floor, a tokens-per-parameter bar chart (GPT-3 1.7, Chinchilla 20, Llama 3 8B about 1,875), a model table GPT-3, Gopher, Chinchilla and Llama 3 8B, follow-ups and the no-plateau trap.](diagrams/iq32_info_q45_scaling_laws_ai.png)

**Simple Answer:**

Scaling laws are a recipe card written after hundreds of test bakes: every 10× more ingredients and
oven time makes the cake better by a predictable — and shrinking — amount. Labs train many small
models, plot loss against compute on log–log paper, see the points fall on a straight line, and
read off how good a run 100× bigger will be *before* paying for it. The same fits say how to split
the budget between a bigger model and more training data.

```
  N = parameters    D = training tokens    C ≈ 6·N·D training FLOPs

  KAPLAN et al. (OpenAI, 2020)   loss falls as a power law in N, D and C
     double N → loss × 2^−0.076 ≈ 0.95;   10× compute → about 11% lower loss
     advice then: grow the model fastest → GPT-3: 175B params, 300B tokens

  CHINCHILLA (DeepMind, 2022)    for a fixed budget, grow N and D together
     N_opt ∝ C^0.5 and D_opt ∝ C^0.5 → about 20 tokens per parameter
     Chinchilla 70B on 1.4T tokens beat Gopher 280B on 300B (similar compute)

  GPT-4 (OpenAI, 2023)           fit L(C) = a·C^b + c   (c = irreducible loss)
     on runs with up to 10,000× less compute → predicted GPT-4's final loss

  o1 (OpenAI, 2024)              a second axis: accuracy also rises with
     test-time compute (thinking longer), not only with training compute
```

**Official Definition:**

> **Neural scaling laws** are empirical power laws linking a language model's test loss to its
> parameter count N, training tokens D and training compute C (Kaplan et al., OpenAI, 2020).
> Hoffmann et al. (2022, "Chinchilla") refitted them as L(N, D) = E + A/N^α + B/D^β — an irreducible
> floor E plus a penalty for too few parameters and one for too few tokens — and found that
> compute-optimal training grows N and D in equal proportion, about 20 tokens per parameter.

> **Maths in one line:** `C ≈ 6·N·D` and `D_opt ≈ 20·N` give `N_opt = √(C / 120)` — GPT-3's budget
> (3.15 × 10²³ FLOPs) would have bought about 51B parameters on 1.0T tokens, not 175B on 0.3T.

**Interview Answer:**

**Say this first (30 sec):** Scaling laws say test loss falls as a smooth power law in parameters,
data and compute, so you can predict a big run from small ones — OpenAI's Kaplan et al. found this
in 2020, and the GPT-4 report predicted the final loss from runs using up to 10,000× less compute.
Chinchilla corrected the split to about 20 tokens per parameter, which made GPT-3 under-trained.
Today labs also over-train smaller models for cheap serving, and scale test-time compute.

- **Diminishing returns:** the exponents are small — 10× compute buys about 11% lower loss — and the curve flattens towards an irreducible loss, never to zero.
- **Over-training pays at serving time:** Llama 3 8B saw ~15T tokens, about 1,875 per parameter, because inference cost grows with N.
- **Loss ≠ skills:** a smooth loss curve can look like sudden "emergent" jumps on all-or-nothing metrics such as exact match.
- **Limits in 2026:** good text is finite — repeated data helps only up to ~4 epochs (Muennighoff et al., 2023) — so labs add filtering, synthetic data, RL and test-time compute.

**Likely follow-ups:**

- *Why does a lab like OpenAI care so much?* — A frontier run costs months of compute. A fitted law picks N and D up front, and an early loss prediction checks the infrastructure before the money is spent.
- *Is "compute-optimal" the best model to ship?* — Only for training compute. Counting inference, a smaller model trained on more tokens is cheaper overall ([Q20 in Ch 33](#content/33_llm_interview_questions), with a program).
- *What is test-time compute scaling?* — Spending more inference compute (hidden reasoning tokens, sampling and voting) to raise accuracy ([Q62 in Part 2](#content/33b_llm_interview_questions_part2)).

**Trap:** "Bigger models keep getting better with no plateau" — loss approaches an irreducible floor, each 10× buys less, and a bigger model without more data is under-trained.

**Go deeper:** [Q20 in Ch 33](#content/33_llm_interview_questions) · [Ch 17 §3.7](#content/17_llm) · [Ch 20 §20.2](#content/20_2026_landscape) (test-time compute) · [Q62 in Part 2](#content/33b_llm_interview_questions_part2)

---

### Q46 (O). How would you evaluate a language model?
*[O] | ★★★*

![Interview card for Q46, evaluating a language model: a six-layer evaluation ladder from perplexity, public benchmarks (shortlist only) and a 50 to 200 case golden set up to an LLM judge, red-teaming and an online A/B test; the error-bar formula margin = 1.96 x sqrt(p(1-p)/n) showing 90% on 200 cases is plus or minus 4.2 points; saturated (MMLU, GSM8K, HumanEval) versus current benchmarks as of Nov 2026; a key-numbers table for MMLU, HumanEval, Arena and GDPval; follow-ups and the leaderboard trap.](diagrams/iq32_info_q46_evaluating_llms_ai.png)

**Simple Answer:**

Evaluating an LLM is hard because language is open-ended: "What is 2 + 2?" is easy to score,
"Write me a poem about autumn" is not. So you test it like a job candidate. Public benchmarks are
the CV — they get a model onto the shortlist. Your own exam built from real cases, a reviewer for
open-ended answers, a safety check and finally real users decide whether it gets the job.

```
  LAYER              ASKS                       EXAMPLES
  ─────              ────                       ────────
  Intrinsic          predicts text well?        perplexity (lower = better)
  Public benchmarks  broadly capable?           shortlist only; they saturate
  Golden set         does YOUR task?            50–200 real cases: exact
                                                match, pass@k, faithfulness
  Judges             open-ended output good?    LLM judge calibrated on
                                                human labels; Arena votes
  Safety             harmful or over-cautious?  red-teaming; jailbreak and
                                                over-refusal rates
  Online A/B test    real users better off?     task success, cost, latency
```

**Official Definition:**

> **LLM evaluation** measures a model — or the whole system around it — against the task it serves.
> It combines **intrinsic metrics** (perplexity: how well it predicts held-out text), **task
> metrics** (exact match, F1, pass@k, faithfulness), **preference judgements** (human raters, a
> calibrated LLM judge, Arena-style ratings), **safety evaluations** and **online product
> metrics** from A/B tests. Offline evaluation gates each change; online evaluation confirms users
> are better off.

> **Maths in one line:** `margin ≈ ± 1.96 × √(p(1 − p) / n)` — the 95% error bar on a pass rate p
> over n cases: 90% on a 200-case golden set is ± 4.2 points, so a 2-point "gain" there is noise.

**Interview Answer:**

**Say this first (30 sec):** There is no single number — I evaluate in layers, on my own task:
assertions and a versioned golden set of real cases on every change, an LLM judge calibrated on
human labels for open-ended quality, red-teaming for safety, and an online A/B test before launch.
Public benchmarks only shortlist models, and they wear out: MMLU and GSM8K are saturated, and
OpenAI retired its own SWE-bench Verified in Feb 2026.

| Then (saturated: top models 90%+) | Now (as of Nov 2026) |
|---|---|
| MMLU (57 subjects, ~14K test questions), GSM8K, HumanEval (164 Python problems), HellaSwag | Terminal-Bench 4.0, OSWorld 2.0, Humanity's Last Exam, ARC-AGI-3, Arena |

- **Benchmarks break:** OpenAI retired SWE-bench Verified in Feb 2026 (saturated/contaminated); it then recommended SWE-bench Pro, but retracted that on 8 Jul 2026 after finding ~30% of Pro tasks broken.
- **OpenAI's own evals measure real work and honesty:** GDPval (Sep 2025) has experts in 44 occupations grade outputs head-to-head; SimpleQA scores right, wrong and "I don't know" separately.
- **Arena** (formerly Chatbot Arena) fits pairwise human votes onto an Elo scale: it measures preference, rewards style, and a 19-point gap is only a 53% win rate.

**Likely follow-ups:**

- *How do you grade answers with no reference?* — Check what can be checked (format, citations), then use a pairwise LLM judge calibrated on 100–200 human labels ([Q50 in Part 2](#content/33b_llm_interview_questions_part2)).
- *How do you know the model has not seen the test?* — Look for n-gram overlap, use fresh or private sets, and compare with look-alike rewrites ([Q52 in Part 2](#content/33b_llm_interview_questions_part2)).
- *What would you measure for safety?* — Jailbreak success and over-refusal together, from red-teaming and refusal evals ([Q59 in Part 2](#content/33b_llm_interview_questions_part2)).

**Trap:** "The model with the best leaderboard score is the best for my product" — leaderboards only shortlist; a 2-point lead on a few hundred items is inside the error bars, and only your golden set and an A/B test decide.

**Go deeper:** [Q48–Q53 in Part 2](#content/33b_llm_interview_questions_part2) · [Ch 17c §4.1–4.4](#content/17c_llm_systems) · [Ch 17c §4.8](#content/17c_llm_systems) (benchmarks and Arena) · [Ch 20 §20.13](#content/20_2026_landscape)

---

### Q47 (O). What is in-context learning and prompt engineering?
*[O] | ★★*

![Interview card for Q47, in-context learning and prompt engineering: a few-shot sentiment prompt with three labelled examples feeding a frozen-weights model that outputs Positive; an illustrative chain-of-thought panel where the direct guess of 2.5 hours is wrong and the steps 120 / 2 = 60 km/h and 300 / 60 = 5 hours are right; a reasoning-effort dial; the formula y_hat = argmax p_theta(y given k examples and the query); a table comparing zero-shot, few-shot, chain-of-thought and self-consistency; the 2B extra tokens a day cost of 20 shots; follow-ups and the think-step-by-step trap.](diagrams/iq32_info_q47_icl_prompting_ai.png)

**Simple Answer:**

Imagine hiring a contractor and, instead of training them for weeks, showing them three examples:
"Here's a bad email, here's how I'd fix it. Here's another. Now fix this one." They pick up the
task from those examples alone, and forget it when the conversation ends. That is in-context
learning: the model's weights never change; the examples simply sit in the prompt. Prompt
engineering is writing that brief well — the goal, the context, the examples and the format you
want back.

```
  FEW-SHOT PROMPT (in-context learning, weights frozen)
    Classify the sentiment.
    "I love this product!"   → Positive
    "This is terrible."      → Negative
    "It was okay."           → Neutral
    "Amazing, 5 stars!"      → ???          model continues: Positive
    3 examples taught the labels AND the output format, with no training

  CHAIN-OF-THOUGHT (illustrative)
    Q: A train travels 120 km in 2 hours. How long for 300 km?
    direct answer:      "2.5 hours"                       ✗ a one-jump guess
    step by step:       speed = 120 / 2 = 60 km/h
                        time  = 300 / 60 = 5 hours        ✓
    reasoning models do these steps internally: raise the effort setting
```

**Official Definition:**

> **In-context learning (ICL)** is a model performing a task from instructions and demonstrations
> placed in its prompt at inference time, with no gradient updates — OpenAI's GPT-3 paper
> (Brown et al., 2020) showed it emerging at scale. **Prompt engineering** is designing and
> iteratively testing everything sent to the model — instructions, context, examples and output
> format — so that it reliably produces the output you need, without changing its weights.

> **Maths in one line:** `ŷ = argmax_y p_θ(y | x₁, y₁, …, x_k, y_k, x_q)` — the weights θ stay
> frozen; only the text the model conditions on changes: k demonstrations (xᵢ, yᵢ) followed by the
> new query x_q.

**Interview Answer:**

**Say this first (30 sec):** In-context learning is the model picking up a task from instructions
and examples in its prompt while its weights stay frozen; GPT-3 showed it emerges with scale.
Prompt engineering is designing that input — clear instructions, the context the model cannot
know, a few balanced examples and an explicit output format — and re-testing it on a golden set
after every change. With today's reasoning models you state the goal and success criteria and raise
the reasoning effort, rather than writing "think step by step".

| Technique | What you do | When |
|---|---|---|
| Zero-shot | Instruction only | Clear, common tasks — always start here |
| Few-shot | Add 3–5 balanced input → output examples | Custom labels, formats or tone |
| Chain-of-thought | Show worked steps, or ask for them | Multi-step maths and logic on non-reasoning models |
| Self-consistency | Sample several answers, majority-vote | Accuracy matters more than cost |
| ReAct | Interleave reasoning with tool calls | Agents |

- **Examples cost tokens on every call:** 20 shots × 100 tokens × 1M calls a day = 2B extra input tokens a day — cache them or fine-tune ([Q26 in Ch 33](#content/33_llm_interview_questions)).
- **Reasoning models:** OpenAI's guidance is to skip chain-of-thought prompts and set `reasoning.effort`; the thinking tokens are billed as output ([Q25 in Ch 33](#content/33_llm_interview_questions)).
- **ICL is fragile:** example order, format and label balance swing accuracy, so measure on a golden set, 3–5 runs per case.

**Likely follow-ups:**

- *ICL or fine-tuning?* — ICL is instant and easy to change but pays for its examples on every call; high volume, strict formats or tight latency favour fine-tuning ([Q26 in Ch 33](#content/33_llm_interview_questions)).
- *Why does chain-of-thought help?* — Each token gets one fixed-depth forward pass; written steps become context, so many easy steps replace one hard jump.
- *Does the model really learn from the examples?* — Partly: much is recognising a known task (random labels in the demos barely hurt), but large models can also follow flipped labels.

**Trap:** "Adding 'Let's think step by step' always helps" — it helps mainly large non-reasoning models on multi-step problems; reasoning models already think, and on easy tasks it only adds tokens.

**Go deeper:** [Q23–Q26 in Ch 33](#content/33_llm_interview_questions) · [Ch 17 §3.9](#content/17_llm) (in-context learning) · [Ch 17b §5.1–5.4](#content/17b_llm_applications) (prompting) · [Q28 and Q30 in Ch 33](#content/33_llm_interview_questions) (ReAct, self-consistency)

---

### Q48 (O). What is AI safety and alignment? Why does OpenAI care about it?
*[O] | ★★★*

![Interview card for Q48, AI safety and alignment: three boxes from what we want to what we can measure to what the model learns, with the outer gap and inner gap marked between them; failure tiles for reward hacking (CoastRunners 2016), sycophancy (GPT-4o update rolled back in Apr 2025) and goal misgeneralization (CoinRun 2022, go right); the KL-leash objective maximise E of proxy reward minus beta x KL to the reference policy; a table of OpenAI methods from RLHF (2022) to rule-based rewards, deliberative alignment and chain-of-thought monitoring; follow-ups and the refusal trap.](diagrams/iq32_info_q48_ai_safety_alignment_ai.png)

**Simple Answer:**

Ask a genie to "make everyone happy" and it might put everyone into a permanent happy dream —
goal technically met, horribly wrong. Alignment is making AI pursue what we *mean*, not the
stand-in we can measure (a thumbs-up, a reward model, a passing test), because a strong optimiser
finds every gap between the two. Safety is the wider job: keep systems honest, hard to misuse and
under human control as they grow more capable. OpenAI's stated mission — AGI that benefits all of
humanity — makes this central, not optional.

```
  WHAT WE WANT  ──►  WHAT WE CAN MEASURE  ──►  WHAT THE MODEL LEARNS
  (the real goal)    (reward, ratings, tests)   (its actual behaviour)

  FAILURE                REAL EXAMPLE
  ───────                ────────────
  Reward hacking         CoastRunners (OpenAI, 2016): the boat circles a
                         lagoon hitting the same targets, never finishing
                         Reasoning agents (OpenAI, 2025): made coding tasks
                         "pass" by subverting or skipping the unit tests
  Sycophancy             GPT-4o update (Apr 2025): an added thumbs-up reward
                         made it overly agreeable; rolled back within days
  Goal misgeneralization CoinRun (2022): the coin always sat on the right in
                         training, so the agent learned "go right"
```

**Official Definition:**

> **AI alignment** is making an AI system's goals and behaviour match the intentions of its
> designers and users, not merely the objective it was trained on: **outer alignment** asks whether
> the training objective captures what we want; **inner alignment** asks whether the model actually
> pursues it rather than a proxy that fit the training data. **AI safety** is the broader field:
> alignment plus misuse prevention, robustness, monitoring and governance of frontier risks.

> **Maths in one line:** `maximise E[proxy reward] − β · KL(π ‖ π_ref)` — RLHF's KL leash keeps the
> model close to its starting point, so it cannot chase a flawed reward model too far (Goodhart's
> law).

**Interview Answer:**

**Say this first (30 sec):** Alignment means getting a model to pursue what we intend rather than
the proxy we can measure; safety means keeping it honest, hard to misuse and controllable as
capability grows. OpenAI cares because its mission is AGI that benefits everyone, and a stronger
optimiser exploits a flawed objective harder — its April 2025 GPT-4o update turned sycophantic and
was rolled back. Its toolkit runs from RLHF to rule-based rewards, deliberative alignment,
chain-of-thought monitoring, red-teaming and the Preparedness Framework.

| OpenAI method | Idea | Limit |
|---|---|---|
| RLHF (InstructGPT, 2022) | Reward model from human comparisons, then PPO with a KL leash | Inherits rater taste for length and agreement |
| Rule-based rewards (2024) | Written rules, graded by a model, add a safety reward; used since GPT-4's launch | Only as good as the rules |
| Deliberative alignment (Dec 2024) | o-series models learn the text of safety specs and reason over them before answering | Assumes the visible reasoning is faithful |
| Chain-of-thought monitoring (2025) | GPT-4o read a stronger model's reasoning and caught reward hacking better than actions alone | Penalising "bad thoughts" taught the model to hide its intent |
| Preparedness Framework (v2, Apr 2025) | Tracks biological and chemical, cyber and AI self-improvement capabilities; high capability requires safeguards before deployment | Thresholds are set by the lab itself |

- **Alignment ≠ guardrails:** alignment shapes the model's own behaviour; guardrails are filters around it. Production needs both ([Q60 in Part 2](#content/33b_llm_interview_questions_part2)).

**Likely follow-ups:**

- *Outer vs inner misalignment, with examples?* — Outer: the reward model prefers long answers, so the model pads. Inner: CoinRun's agent learned "go right", not "get the coin".
- *Why does RLHF breed sycophancy?* — People reward answers that agree with them; fix with sycophancy evals as launch gates and less weight on instant approval.
- *Why not train the chain of thought to look safe?* — OpenAI found it drives misbehaviour out of sight (obfuscated reward hacking); keep reasoning monitorable ([Ch 17 §15.1b](#content/17_llm)).

**Trap:** "Alignment means making the model refuse harmful requests" — refusal is one behaviour; alignment covers the whole gap between intended goal and learned behaviour, including sycophancy, reward hacking, deception and over-refusal.

**Go deeper:** [Q54 in Part 2](#content/33b_llm_interview_questions_part2) (alignment) · [Q55, Q59 and Q60 in Part 2](#content/33b_llm_interview_questions_part2) (Constitutional AI, red-teaming, guardrails) · Q30 (RLHF) in this chapter · [Ch 17 §3.4](#content/17_llm) · [Ch 17 §3.5c](#content/17_llm) (reward hacking) · [Ch 20 §20.11](#content/20_2026_landscape)

---

# PART 9 — Ranking & Retrieval Metrics

---

### Q49. What are NDCG, MRR, and MAP? Why do Search, Ads, and YouTube use ranking metrics instead of accuracy?
*[All] | ★★*

![Interview card for Q49, NDCG, MRR and MAP: one query with five results marked relevant, not, relevant, relevant, not, with log discount weights 1.000, 0.631, 0.500, 0.431 and 0.387 beside the ideal order; callouts NDCG@5 = 1.931 / 2.131 = 0.906, AP = (1/1 + 2/3 + 3/4) / 3 = 0.806 and MRR = 1.000; the NDCG formula with a 2^rel - 1 gain and log2(i + 1) discount; a table showing one relevant page among 1,000 at ranks 1, 3, 10 and 100 where ROC-AUC barely moves (1.000 to 0.901) while NDCG@10 falls to 0; follow-ups on LambdaMART and click position bias; the AUC trap.](diagrams/iq32_info_q49_ranking_metrics_ai.png)

**Simple Answer:**

Accuracy asks "did the model label each result correctly?" Ranking metrics ask "did the model put the right results at the top?" People read a results page from the top and most stop after a few lines, so the same relevant page is worth a lot at position 1 and almost nothing at position 100.

Each metric asks the list one question. **MRR:** how high is the *first* good result? **MAP:** were *all* the good results found, and found early? **NDCG:** are the *best* results at the very top, when results can be perfect, good or only fair?

```
  One query, five results.   ✓ = relevant   ✗ = not   (3 relevant documents exist)

  rank i                     1        2        3        4        5
  result                     ✓        ✗        ✓        ✓        ✗
  weight 1 / log₂(i + 1)   1.000    0.631    0.500    0.431    0.387
  precision at each ✓       1/1               2/3      3/4

  NDCG@5   Are the good ones at the very top?
           DCG  = 1.000 + 0.500 + 0.431              = 1.931
           IDCG = 1.000 + 0.631 + 0.500   (✓✓✓✗✗)   = 2.131   ← the best possible order
           NDCG = 1.931 ÷ 2.131                      = 0.906

  AP       Precision at each ✓, averaged over all 3 relevant documents
           (1/1 + 2/3 + 3/4) ÷ 3                     = 0.806   MAP = mean AP over queries

  MRR      How high is the FIRST ✓?   This query: 1/1 = 1.000
           3 queries, first ✓ at ranks 1, 3, 2:  (1 + 1/3 + 1/2) ÷ 3 = 0.611
```

**Official Definition:**

> **Ranking metrics** score an ordered list against relevance labels and give more weight to higher positions. **MRR** (Mean Reciprocal Rank) averages 1/rank of the first relevant result over queries. **MAP** (Mean Average Precision) averages, over queries, the precision at the rank of each relevant document, divided by the number of relevant documents. **NDCG@k** (Normalized Discounted Cumulative Gain) adds up each top-k result's gain divided by log₂(rank + 1), then divides by the same sum for the ideal order, so 1.0 is a perfect ranking.

> **Maths in one line:** `NDCG@k = DCG@k / IDCG@k`, with `DCG@k = Σ_{i=1..k} (2^rel_i − 1) / log₂(i + 1)` — a result's gain shrinks with its rank (rank 3 counts half as much as rank 1), and dividing by the ideal order makes 1.0 perfect on every query. With 0/1 labels, 2^rel − 1 is simply rel.

**Interview Answer:**

**Say this first (30 sec):** Ranking metrics grade the order of a list and weight the top most, because users read only the first few results. MRR asks how high the first relevant result is (rank 3 scores 1/3); MAP averages the precision at every relevant hit; NDCG@k handles graded labels with a 1/log₂(rank + 1) discount and divides by the ideal order, so 1.0 is perfect. Accuracy and ROC-AUC barely see position: one relevant page at rank 100 of 1,000 still scores AUC 0.90, while NDCG@10 is 0.

| Metric | Question it answers | Labels | Typical use |
|---|---|---|---|
| MRR@k | How high is the first relevant result? | binary | one right answer: QA, navigational queries; MS MARCO passage ranking reports MRR@10 |
| MAP | Were all relevant results found, early? | binary | classic TREC evaluation; legal and patent search, where every relevant document counts |
| NDCG@k | Are the best results at the very top? | graded, e.g. 0–3 | web search, recommendations; BEIR and the TREC Deep Learning track report nDCG@10 |
| Recall@k | Did the relevant results reach the top k at all? | binary | first-stage retrieval and RAG, before a reranker orders them |

- **The discount:** NDCG weighs ranks 1, 2, 3 and 10 at 1.00, 0.63, 0.50 and 0.29, so the top slot is worth 3.3× rank 9. MRR falls faster: 1, 0.5, 0.33, 0.1.
- **Say which gain and which k:** scikit-learn's `ndcg_score` uses the label as the gain; LightGBM's lambdarank uses 2^rel − 1 (0, 1, 3, 7, …). Labels [2, 3, 1, 0] score 0.922 one way, 0.843 the other.
- **Normalize by every judged relevant document**, not only the retrieved ones: a 4th relevant page that was never retrieved drops NDCG@5 from 0.906 to 0.754 and AP from 0.806 to 0.604.
- **Ads are different:** the auction needs the click probability itself, not just an order. Google's ad click-prediction paper (McMahan et al. 2013) tracks log loss and 1 − AUC and calibrates its predictions ([Ch 13 §13.12](#content/13_model_evaluation)).
- **Offline is a proxy; the A/B test decides.** YouTube's 2016 recommender paper used offline precision, recall and ranking loss, but decided with live A/B tests: "live A/B results are not always correlated with offline experiments".

**Worked example:** the picture's numbers, a relevant document that was never retrieved, graded labels under both gains, and one relevant page sliding down a 1,000-item list.

```python
# Ranking metrics by hand: NDCG (binary and graded), MRR, AP, and why ROC-AUC barely sees the top of a list
import numpy as np

def dcg(rels, k, exp_gain=False):
    r = np.asarray(rels[:k], dtype=float)
    gain = 2 ** r - 1 if exp_gain else r                          # 2^rel - 1 equals rel when labels are 0/1
    return float(np.sum(gain / np.log2(np.arange(2, len(r) + 2))))   # discount 1 / log2(rank + 1)

def ndcg(rels, k, judged=None, exp_gain=False):
    ideal = sorted(rels if judged is None else judged, reverse=True)  # IDCG: best order of ALL judged docs
    return dcg(rels, k, exp_gain) / dcg(ideal, k, exp_gain)

def average_precision(rels, n_relevant):
    hits = np.cumsum(rels)                                        # relevant docs seen so far at each rank
    return float(sum(hits[i] / (i + 1) for i, r in enumerate(rels) if r) / n_relevant)

ranked = [1, 0, 1, 1, 0]                                          # relevant at ranks 1, 3 and 4
print(f"NDCG@5 = {dcg(ranked, 5):.3f} / {dcg([1, 1, 1, 0, 0], 5):.3f} = {ndcg(ranked, 5):.3f}")
print(f"AP     = (1/1 + 2/3 + 3/4) / 3 = {average_precision(ranked, 3):.3f}")
print(f"a 4th relevant doc was never retrieved: NDCG@5 = {ndcg(ranked, 5, judged=ranked + [1]):.3f}, "
      f"AP = {average_precision(ranked, 4):.3f}")
first_hit = np.array([1, 3, 2])                                   # rank of the first relevant result, 3 queries
mrr = float(np.mean(1 / first_hit))
print(f"MRR    = {mrr:.3f} -> 1/MRR = {1 / mrr:.2f}, but the mean first-hit rank is {first_hit.mean():.1f}")
assert round(ndcg(ranked, 5), 3) == 0.906 and round(mrr, 3) == 0.611

graded = [2, 3, 1, 0]                                             # labels 0-3: the perfect result sits at rank 2
print(f"graded NDCG@4: linear gain {ndcg(graded, 4):.3f} vs 2^rel-1 gain {ndcg(graded, 4, exp_gain=True):.3f}")

n = 1000                                                          # 1,000 candidates, exactly one relevant
print(f"\n{'rank of the relevant doc':>24}{'ROC-AUC':>9}{'MRR':>7}{'NDCG@10':>9}")
for pos in (1, 3, 10, 100):
    rels = [0] * n
    rels[pos - 1] = 1
    auc = (n - pos) / (n - 1)                                     # share of the 999 negatives ranked below it
    print(f"{pos:>24}{auc:>9.3f}{1 / pos:>7.3f}{ndcg(rels, 10):>9.3f}")
assert ndcg(rels, 10) == 0.0 and auc > 0.9                        # rank 100: AUC 0.90, the user sees nothing
```

**Output:**

```
NDCG@5 = 1.931 / 2.131 = 0.906
AP     = (1/1 + 2/3 + 3/4) / 3 = 0.806
a 4th relevant doc was never retrieved: NDCG@5 = 0.754, AP = 0.604
MRR    = 0.611 -> 1/MRR = 1.64, but the mean first-hit rank is 2.0
graded NDCG@4: linear gain 0.922 vs 2^rel-1 gain 0.843

rank of the relevant doc  ROC-AUC    MRR  NDCG@10
                       1    1.000  1.000    1.000
                       3    0.998  0.333    0.500
                      10    0.991  0.100    0.289
                     100    0.901  0.010    0.000
```

Reading it: sliding the only relevant page from rank 1 to rank 10 costs 0.009 of ROC-AUC but 0.711 of NDCG@10 — AUC counts a swap deep in the list the same as one at the top. And 1/MRR (1.64) is not the average rank (2.0): queries answered at rank 1 dominate it.

**Likely follow-ups:**

- *NDCG involves sorting, so it has no useful gradient — how do you train for it?* — Learning to rank: LambdaMART (Burges 2010) scales each pair's gradient by how much swapping the two would change NDCG. LightGBM ships it as `objective="lambdarank"`.
- *Where do relevance labels come from?* — Human raters with written guidelines (graded, costly; Google ran 719,326 rater-based search quality tests in 2023), click logs (cheap but position-biased; correct with randomization or inverse-propensity weighting, Joachims et al. 2017), or an LLM judge on a 0–3 scale.
- *NDCG rose offline but click-through fell in the A/B test — why?* — Position bias in the logged labels, a proxy mismatch (relevance is not satisfaction), leakage or training–serving skew ([Ch 26 — When the Two Dashboards Disagree](#content/26_ml_system_design)).

**Trap:** "ROC-AUC is 0.99, so the ranking is great" — AUC weighs a swap at rank 900 the same as one at rank 1, so it barely sees the top of the list (the only relevant page at rank 10 of 1,000 still scores AUC 0.991, NDCG@10 just 0.289); report a top-weighted metric at the k users actually see.

**Go deeper:** [Ch 28 §24.9](#content/28_semantic_search) (formulas, code, building an evaluation set) · [Ch 13 §13.10](#content/13_model_evaluation) (which metric for which problem) · [Ch 26 — Metrics](#content/26_ml_system_design) (offline vs online) · [Q36 in Ch 33](#content/33_llm_interview_questions) (recall@k and MRR for RAG, with a program) · Q13 (ROC-AUC) and Q38 (YouTube) in this chapter

---

# Quick-Reference Summary Tables

![ML interview cheat sheet map: nine part cards with question ranges and one rule each - Fundamentals Q1 to Q15 (97.5% accuracy can hide F1 0.878), Statistics Q16 to Q22 (a positive test for a 1-in-1,000 disease is only 9% likely), Deep Learning Q23 to Q30 (0.25^10 is about 10^-6), Data and Evaluation Q31 to Q33, System Design Q34 to Q36, Google Q37 to Q40 (PageRank 0.85), Amazon Q41 to Q43 (use WAPE when y = 0), OpenAI Q44 to Q48 (about 20 tokens per parameter), Ranking Q49; a pick-by-question table and the six-step answer pattern from Say this first to Trap.](diagrams/iq32_info_q00_ml_cheat_sheet_map_ai.png)

Every question in this chapter, grouped by part — use it to revise, or to find a weak spot fast.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ALL 49 QUESTIONS BY TOPIC   (Parts 1–9)                   │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ ML FUNDAMENTALS  (Q1–Q8)             │ ML FUNDAMENTALS  (Q9–Q15)            │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Overfitting vs underfitting       Q1 │ Parametric vs non-parametric      Q9 │
│ Bias-variance trade-off           Q2 │ Generative vs discriminative     Q10 │
│ Gradient descent variants         Q3 │ Transfer learning                Q11 │
│ L1 vs L2 regularization           Q4 │ Precision, recall, F1            Q12 │
│ Cross-validation                  Q5 │ ROC-AUC                          Q13 │
│ Bagging vs boosting               Q6 │ Feature engineering              Q14 │
│ Random forest                     Q7 │ Correlation vs causation         Q15 │
│ Gradient boosting, XGBoost        Q8 │                                      │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ STATISTICS & PROBABILITY             │ DEEP LEARNING                        │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ p-value, significance            Q16 │ Backpropagation                  Q23 │
│ A/B test design                  Q17 │ Vanishing / exploding gradients  Q24 │
│ Bayes' theorem                   Q18 │ Attention, Transformers          Q25 │
│ Central Limit Theorem            Q19 │ word2vec, embeddings             Q26 │
│ Type I vs Type II errors         Q20 │ Batch normalization              Q27 │
│ Maximum likelihood (MLE)         Q21 │ Dropout                          Q28 │
│ Confidence vs credible interval  Q22 │ CNN vs RNN vs Transformer        Q29 │
│                                      │ RLHF                             Q30 │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ DATA & EVALUATION                    │ ML SYSTEM DESIGN                     │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Data leakage                     Q31 │ Recommendation system            Q34 │
│ Missing data                     Q32 │ Real-time fraud detection        Q35 │
│ Metrics for imbalanced data      Q33 │ Deploy and monitor a model       Q36 │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ GOOGLE  (G)                          │ AMAZON  (A)                          │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ PageRank                         Q37 │ Recommendations at scale         Q41 │
│ YouTube recommendations          Q38 │ Demand forecasting               Q42 │
│ 95% accuracy, low recall         Q39 │ A/B testing at scale             Q43 │
│ Distributed training             Q40 │                                      │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ OPENAI  (O)                          │ RANKING & RETRIEVAL                  │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ How LLMs work                    Q44 │ NDCG, MRR, MAP                   Q49 │
│ Scaling laws                     Q45 │ ROC-AUC, for contrast            Q13 │
│ Evaluating a language model      Q46 │                                      │
│ In-context learning, prompting   Q47 │                                      │
│ AI safety and alignment          Q48 │                                      │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         KEY TERMS — QUICK CLARIFIER                          │
├─────────────────────────────────┬────────────────────────────────────────────┤
│ Precision vs recall             │ Precision = TP / (TP + FP): right alarms   │
│                                 │ Recall = TP / (TP + FN): positives found   │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ ROC-AUC vs PR-AUC               │ ROC = ranking quality; ignores class ratio │
│                                 │ PR = honest when positives are rare; its   │
│                                 │      random baseline = the positive rate   │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ L1 vs L2 regularization         │ L1 = sparse: some weights exactly 0        │
│                                 │ L2 = shrinks every weight, none to 0       │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Bagging vs boosting             │ Bagging = parallel, cuts variance          │
│                                 │ Boosting = sequential, cuts bias           │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Parametric vs non-parametric    │ Parametric = fixed number of parameters    │
│                                 │ Non-param = grows with the data (k-NN)     │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Generative vs discriminative    │ Gen = learns P(x | y)·P(y): can sample     │
│                                 │ Disc = learns P(y | x): the boundary       │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Correlation vs causation        │ Correlation = X and Y move together        │
│                                 │ Causation = changing X changes Y;          │
│                                 │             prove it by randomizing        │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Type I vs Type II error         │ I = false alarm, rate α (usually 5%)       │
│                                 │ II = missed effect, rate β; power = 1 − β  │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Confidence vs credible interval │ Confidence = the METHOD covers θ in 95%    │
│                                 │              of repeated samples           │
│                                 │ Credible = P(θ in interval | data) = 95%   │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ MLE vs MAP estimate             │ MLE = argmax P(data | θ)                   │
│                                 │ MAP = argmax P(data | θ)·P(θ): + a prior   │
│                                 │ L2 = Gaussian prior; ≠ Q49's MAP metric    │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ CNN vs RNN vs Transformer       │ CNN = local patterns, shared filters       │
│                                 │ RNN = reads in order, one hidden state     │
│                                 │ Transformer = attention over all tokens    │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ NDCG vs MRR vs MAP              │ NDCG = graded labels, log discount         │
│                                 │ MRR = 1 / rank of the FIRST relevant hit   │
│                                 │ MAP = precision at EVERY relevant hit      │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ Offline vs online metric        │ Offline = held-out data: NDCG@k, PR-AUC    │
│                                 │ Online = A/B test: CTR, watch time         │
└─────────────────────────────────┴────────────────────────────────────────────┘
```

---

## Final Interview Tips

**Answer pattern:** Say this first → mechanism → numbers → trade-off → follow-ups → trap.

```
╔════════════════════════════════════════════════════════════════════╗
║ HOW TO ANSWER ML INTERVIEW QUESTIONS                               ║
╟────────────────────────────────────────────────────────────────────╢
║ EVERY ANSWER (the pattern each question in this chapter follows):  ║
║ 1. Say this first — 2–3 sentences that fully answer, with a number ║
║ 2. Mechanism      — how it works: one picture or one formula       ║
║ 3. Numbers        — a real figure (recall 90%, F1 0.878: Q12)      ║
║ 4. Trade-off      — what it costs, and when you would not use it   ║
║ 5. Follow-ups     — pre-empt the obvious next question             ║
║ 6. Trap           — name the common wrong answer and correct it    ║
║ Clarify a vague question first; tie answers to your projects.      ║
╟────────────────────────────────────────────────────────────────────╢
║ ML SYSTEM DESIGN (Ch 26's six steps in a 45-minute round):         ║
║ 1. Frame the problem  ~5 min  goal, label, scale, latency          ║
║ 2. Metrics            ~5 min  offline NDCG@k, PR-AUC; online A/B   ║
║ 3. Data & features    ~8 min  labels, leakage, position bias       ║
║ 4. Model             ~10 min  baseline first, then retrieve → rank ║
║ 5. Serving           ~10 min  latency budget, batch vs real-time   ║
║ 6. Monitoring         ~7 min  drift, retraining, safe rollout      ║
║ Say the trade-offs out loud — there is no perfect design.          ║
╟────────────────────────────────────────────────────────────────────╢
║ COMMON MISTAKES:                                                   ║
║ • Maths before intuition — or intuition with no maths at all       ║
║ • A definition with no number, no example and no trade-off         ║
║ • Accuracy on imbalanced data; ROC-AUC for a top-10 ranking        ║
║ • Choosing a model before the metric and the data                  ║
╟────────────────────────────────────────────────────────────────────╢
║ WHAT THE COMPANY PARTS PROBE:                                      ║
║ • Google (Q37–Q40): depth at scale — PageRank, YouTube's funnel,   ║
║   distributed training. Hiring scores four attributes: cognitive   ║
║   ability, leadership, role knowledge, Googleyness (Ch 02 §1.1).   ║
║ • Amazon (Q41–Q43): customer and business impact — behavioural     ║
║   questions map to its 16 Leadership Principles, starting with     ║
║   Customer Obsession.                                              ║
║ • OpenAI (Q44–Q48): how LLMs work, scaling, evaluation and safety  ║
║   — answer them in depth with Ch 33 and Ch 33b.                    ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Key Takeaways

**Fundamentals (Q1–Q15)**

- **Read the gap before you fix anything:** a large train–validation gap is overfitting (more data, regularization, early stopping); two low, close scores is underfitting (more capacity). Expected error = bias² + variance + noise (Q1–Q2).
- **L1 zeros weights, L2 shrinks them:** L1 pulls every weight by a constant ±λ, L2 by 2λw, which fades near zero — so only L1 makes exact zeros (Q4).
- **Ensembles attack opposite halves of the error:** bagging averages decorrelated deep trees, Var = ρσ² + (1 − ρ)σ²/B (Ch 10: test accuracy 79.8% → 89.4%); boosting adds shallow trees fit to the residuals and cuts bias (Q6–Q8).
- **Accuracy hides the errors that matter:** Ch 13's cancer screen reads 97.5% accuracy but precision 85.7%, recall 90% and F1 0.878. ROC-AUC is the chance a random positive outscores a random negative (Q12–Q13).

**Statistics (Q16–Q22)**

- **A p-value is P(data at least this extreme | no effect)**, not P(no effect | data): 60 heads in 100 flips gives p = 0.057, two-sided (Q16).
- **Size an A/B test before it starts:** n per group ≈ 2σ²(1.96 + 0.84)²/δ² ≈ 16σ²/δ² — about 14,100 users per group to detect a click-through rate moving from 10% to 11%; halving δ needs 4× the users (Q17).
- **Base rates rule Bayes:** a test that catches 99% of cases with 1% false positives, for a disease 1 in 1,000 people have, makes a positive result only 9% likely to be real (Q18).
- **Error bars shrink with √n:** SE = σ/√n, so 4× the data halves them; at a fixed sample size, tightening α from 0.05 to 0.01 drops power from 80% to 59% (Q19–Q20).
- **Most training losses are maximum likelihood:** MSE under Gaussian noise, cross-entropy for a classifier — including every LLM's next-token loss (Q21).

**Deep learning (Q23–Q30)**

- **Gradients multiply through the layers:** sigmoid slopes of at most 0.25 leave 0.25¹⁰ ≈ 10⁻⁶ after 10 layers; ReLU, careful initialization, normalization and residual connections keep them alive (Q23–Q24).
- **Attention is `softmax(QKᵀ/√d_k)·V`:** every token reads every other token, at a cost that grows as n² with sequence length (Q25, Q29).
- **Regularize the network:** inverted dropout scales the kept activations by 1/(1 − p) — ×2 at p = 0.5 — so inference needs no change; batch norm standardizes a layer's inputs over the mini-batch, then learns a scale and shift (Q27–Q28).
- **Post-training aligns the model:** supervised fine-tuning, then preference tuning — RLHF (a reward model plus PPO) or DPO — in depth in [Ch 33 Q14–Q15](#content/33_llm_interview_questions) (Q30).

**Data, evaluation and system design (Q31–Q36)**

- **Leakage manufactures signal:** selecting features on all rows before cross-validation scored 0.98 on random labels; the same selection inside a Pipeline scored 0.49 (Ch 13) (Q31).
- **Rare positives need PR-AUC:** its random baseline is the positive rate, not 0.5. Add 10× more negatives and ROC-AUC stays 0.854 while average precision falls from 0.493 to 0.143 (Q13, Q33).
- **System design is six steps in about 45 minutes** — frame 5, metrics 5, data 8, model 10, serving 10, monitoring 7 — and the metric comes before the model (Q34–Q36).

**Company questions (Q37–Q48)**

- **Google:** PageRank is a random surfer who follows a link with probability 0.85 (the damping factor) and jumps anywhere otherwise; YouTube's 2016 recommender generates hundreds of candidates, then ranks them by expected watch time per impression (Q37–Q38).
- **95% accuracy can mean no skill:** with 5% positives, "always negative" scores 95% with recall 0 — move the threshold, weight the classes and judge by PR-AUC (Q39).
- **Amazon:** item-to-item collaborative filtering (Linden et al. 2003) builds its similar-items table offline, so serving is a lookup; MAPE = (100/n) · Σ |y − ŷ| / |y| breaks when y = 0 — use WAPE (Q41–Q42).
- **OpenAI:** training compute ≈ 6·N·D, and Chinchilla's compute-optimal mix is about 20 tokens per parameter; Q44–Q48 link to [Ch 33](#content/33_llm_interview_questions) and [Ch 33b](#content/33b_llm_interview_questions_part2) for depth.

**Ranking (Q49)**

- **Rank metrics weight the top of the list:** NDCG@5 = 1.931 / 2.131 = 0.906, AP = 0.806, and MRR over first hits at ranks 1, 3 and 2 = 0.611. With the only relevant page at rank 100 of 1,000, ROC-AUC still reads 0.90 but NDCG@10 is 0 (Q49).

**Every answer:** Say this first → mechanism → numbers → trade-off → follow-ups → trap.

---

> **End of Chapter 32.** Next: LLM interview questions in [Ch 33](#content/33_llm_interview_questions) · Google's ten most-asked ML topics in depth in [Ch 34](#content/34_google_top10_ml_interview).

---

**Back to Start:** [README — Table of Contents](#README)
