# Chapter 6 — Math Fundamentals for Machine Learning & AI

> "Don't panic. Math is just counting, measuring, and finding patterns.
> You already do it every day — you just don't call it math."

**What this chapter covers:**
Every math concept you need for ML and AI — from vectors to backpropagation, from Bayes' theorem to the Adam optimizer. Each concept is explained first in plain words, then with the real formula, then with a step-by-step example you can check by hand. The key examples also come as small NumPy programs you can run with the ▶ button.

**How to use this chapter:**
- Each section starts with a **Simple Explanation** (a story or analogy)
- Then the **Official Math** (formula and definition), summed up in a one-line **Maths in one line** box
- Then a **Step-by-Step Example** (plug in real numbers)
- Then **Where It's Used in ML** (why you should care), with a link to the chapter that applies it in depth

**Markers:** ★★★ = know cold for interviews · ★★ = high priority · ★ = good to know.

> **How this chapter fits:** this is the home of the *maths*. The applied depth lives elsewhere —
> backpropagation and activations in [Ch 14](#content/14_neural_networks), optimizers and
> normalization in [Ch 16](#content/16_deep_learning), attention and softmax inside an LLM in
> [Ch 17](#content/17_llm), PCA in practice in [Ch 11](#content/11_unsupervised_learning).

---

## Table of Contents

| Part | Topic | Sections | Key Concepts |
|------|-------|----------|--------------|
| 1 | Linear Algebra | §1.1–1.7 | Scalars to tensors, vector operations (dot product, norms, cosine similarity), matrix multiplication and its shape rule, transpose, inverse, determinant, eigenvalues, SVD, PCA, softmax, scaled dot-product & multi-head attention |
| 2 | Calculus | §2.1–2.6 | Derivatives and checking them by nudging (numerical differentiation), partial derivatives, chain rule, gradients, Jacobian & Hessian (minimum, maximum or saddle), backpropagation by hand, matrix-calculus shapes of a linear layer's gradients |
| 3 | Probability & Statistics | §3.1–3.8 | Random variables, independence & joint probability, distributions, expected value, variance, correlation, Bayes' theorem, CLT, MLE, hypothesis testing, bias–variance decomposition |
| 4 | Optimization | §4.1–4.7 | Gradient descent, learning rate, momentum, Adam & AdamW, regularization, convex vs non-convex, batch norm & layer norm |
| 5 | Information Theory | §5.1–5.3 | Entropy, cross-entropy, KL divergence |
| 6 | Numerical Methods | §6.1–6.3 | Floating point, log-sum-exp trick, mixed precision |
| 7 | Quick Reference | — | Every formula in five small tables, then the Key Takeaways |

---

# PART 1: LINEAR ALGEBRA ★★

> Linear algebra is the language of data. Every image, every sentence, every dataset
> is stored as numbers in rows and columns. Every ML operation is just math on those numbers.

**The path through Part 1:** single numbers → lists (vectors) → grids (matrices) → the special directions inside a matrix (eigenvectors, SVD, PCA) → attention, which uses all of them at once.

---

## 1.1 Scalars, Vectors, Matrices, and Tensors

![Infographic on scalars, vectors, matrices and tensors: the formula shape = (n1, n2, ..., nd) and size = n1 x n2 x ... x nd with each symbol labelled; a scalar 5 with shape () and ndim 0, a vector (3, 7, 1) with shape (3,), and a 2 x 3 matrix with shape (2, 3); counting a batch step by step: 32 x 1,024 = 32,768 tokens, x 4,096 = 134,217,728, about 134 million numbers, with a to-scale slab of shape (32, 1024, 4096); a batch of photos: 224 x 224 x 3 = 150,528 numbers per photo, TensorFlow (32, 224, 224, 3) channels last vs PyTorch (32, 3, 224, 224) channels first; where ML uses each object; the trap that axis order is a convention.](diagrams/math06_info_tensors_shapes_ai.png)

<details>
<summary><strong>Read as text</strong> — the toybox picture, shapes, ML examples and axis order</summary>

**Simple Explanation:**
Think of organizing your toys.

A **scalar** is ONE toy. Just one thing. Like the number 5.

A **vector** is a row of toys on a shelf. Like [red car, blue car, green car] — it's a list in order.

A **matrix** is a whole toybox with rows and columns — like a grid of cubbies, each holding one toy.

A **tensor** is a room full of toyboxes. A toybox of toyboxes. It goes as many layers deep as you want.

> **Maths in one line:** a tensor's **shape** lists its size along each axis — a scalar has shape `()`, a vector `(3,)`, a matrix `(2, 3)`, a batch of 32 colour photos `(32, 224, 224, 3)`; the number of axes (`ndim`) is 0, 1, 2 and 4.

**Scalar:** A single number.

$$x = 5 \qquad \text{learning rate} = 0.001 \qquad \text{temperature} = 0.7$$

Just one value. Like your age, or the temperature outside.

**Vector:** A list of numbers (in order).

$$\vec{v} = [3,\ 7,\ 1] \qquad \vec{w} = [0.2,\ {-0.5},\ 0.8]$$

Think of it as a recipe: $[\text{flour},\ \text{sugar},\ \text{eggs}] = [2 \text{ cups},\ 1 \text{ cup},\ 3]$.
The ORDER matters — you can't swap them around.

In ML: an **embedding** is a vector that captures the "meaning" of a token, a sentence or an image. Typical sizes are a few hundred to a few thousand numbers: 768 in BERT-base, 1,536 in OpenAI's `text-embedding-3-small`, 3,072 in `text-embedding-3-large` and in Google's Gemini embedding models. Inside an LLM, each token travels through the layers as a hidden vector of 4,096 numbers (Llama 3 8B) up to 16,384 (Llama 3 405B). Why? Because computers can't read words directly — they need numbers. By turning each word into a list of numbers, the computer can do math on words (like measuring how similar "king" and "queen" are, §1.2).

**Matrix:** A grid of numbers (rows $\times$ columns).

$$A = \begin{pmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{pmatrix} \quad \text{This is a } 2 \times 3 \text{ matrix}$$

Think of it as a spreadsheet:
- Row 1 = Student 1's scores: Math=1, Science=2, English=3
- Row 2 = Student 2's scores: Math=4, Science=5, English=6

In ML: your entire dataset is a matrix. Rows = samples, Columns = features. Why? Because organizing data in a grid lets the computer process thousands of examples at once using fast matrix math, instead of looking at them one by one.

**Tensor:** A stack of matrices. Or a cube. Or higher.

| Dimensions | Analogy | ML Example |
|-----------|---------|------------|
| 0D — Scalar | A single grade | One loss value |
| 1D — Vector | One student's grades | $[0.2, -0.5, 0.8]$ |
| 2D — Matrix | A spreadsheet of all students | Dataset: rows $\times$ columns |
| 3D — Tensor | A binder of spreadsheets | A colour photo: $\text{height} \times \text{width} \times 3$ |
| 4D — Tensor | A shelf of binders | A batch of photos: $\text{batch} \times \text{height} \times \text{width} \times 3$ |

The order of the axes is a convention: TensorFlow puts the 3 colour channels last (as above), PyTorch puts them first — $\text{batch} \times 3 \times \text{height} \times \text{width}$.

In ML: a batch of sentences = 3D tensor ($\text{batch} \times \text{tokens} \times \text{embedding size}$) — for example $32 \times 1{,}024 \times 4{,}096 \approx 134$ million numbers. Why? Because GPUs are built to crunch huge blocks of numbers all at once. Packing data into tensors lets the GPU do millions of calculations in parallel — like having a thousand calculators working at the same time.

TensorFlow is named after tensors, and PyTorch's core data type is `torch.Tensor`.

</details>

---

## 1.2 Vector Operations

![Infographic on vectors: the formula a dot b = sum of a_i b_i = length of a times length of b times cos theta with each symbol labelled; dot product step by step for (1, 2, 3) and (4, 5, 6): 4 + 10 + 18 = 32 with the projection of b onto a; norms of (3, -4, 5): L1 = 12, L2 = sqrt 50 = 7.07, max = 5, and a to-scale city grid (walk 7, fly 5); cosine +1, 0, -1 and +0.714 with arrow pairs; where ML uses each tool; the trap that opposites score high in GloVe (hot-cold 0.80).](diagrams/math06_info_vector_operations_ai.png)

<details>
<summary><strong>Read as text</strong> — the four moves and the dot product in one line</summary>

Four moves cover almost everything you will do with vectors: add them, scale them, take their dot product, and measure their length and angle.

> **Maths in one line:** `a · b = Σ aᵢbᵢ = ‖a‖ ‖b‖ cos θ` — multiply matching entries and add; the result is large when both vectors are long and point the same way, 0 when they are perpendicular, and negative when they point apart.

</details>

### Vector Addition and Subtraction

<details>
<summary><strong>Read as text</strong> — adding matching slots, and the bias</summary>

**Simple Explanation:**
You and your friend both have piggy banks. You have [5 dollars, 3 quarters] and your friend has [2 dollars, 7 quarters]. Together you have [5+2, 3+7] = [7 dollars, 10 quarters]. Just add matching slots!

$$\vec{a} = [1, 3, 5] \qquad \vec{b} = [2, 4, 6]$$

$$\vec{a} + \vec{b} = [1+2,\ 3+4,\ 5+6] = [3,\ 7,\ 11]$$

$$\vec{a} - \vec{b} = [1-2,\ 3-4,\ 5-6] = [-1,\ -1,\ -1]$$

In ML: Adding bias to a layer: $\text{output} = W\vec{x} + \vec{b}$. Why? Every neuron computes a weighted sum of inputs and then adds a bias — that's just vector addition. The bias is like a head start that lets the neuron fire even when all inputs are zero.

</details>

### Scalar Multiplication

<details>
<summary><strong>Read as text</strong> — scaling every entry, and the learning-rate step</summary>

**Simple Explanation:**
If you have [2 apples, 4 oranges, 6 bananas] and someone says "triple it," you get [6 apples, 12 oranges, 18 bananas]. Multiply every item by the same number.

$$\vec{a} = [2, 4, 6] \qquad 3 \times \vec{a} = [6, 12, 18]$$

In ML: $\text{weights} = \text{weights} - 0.01 \times \text{gradient}$. Why? When the model learns, it figures out "which direction should I adjust?" (the gradient) and then takes a small step in that direction. Scalar multiplication controls the step size — too big and you overshoot, too small and you learn forever.

</details>

### Dot Product — The Most Important Operation in ML ★★★

<details>
<summary><strong>Read as text</strong> — the shopping bill, the formula, the angle and where it shows up</summary>

**Simple Explanation:**
Imagine you're at a store. You buy 3 apples at 1 dollar each, 2 bananas at 0.50 dollars each, and 1 milk at 3 dollars.

Your items: [3, 2, 1]. Prices: [1, 0.50, 3].

$\text{Total cost} = (3 \times 1) + (2 \times 0.50) + (1 \times 3) = 3 + 1 + 3 = 7$ dollars.

That's a dot product! Multiply matching items, add them all up, get ONE number.

**Formula:**

$$\vec{a} \cdot \vec{b} = a_1 b_1 + a_2 b_2 + a_3 b_3 + \cdots$$

> **In plain English:** "Multiply each pair of matching numbers, then add all the results together."

**Step-by-Step Example:**

$$\vec{a} = [1, 2, 3] \qquad \vec{b} = [4, 5, 6]$$

$$\begin{aligned}
\vec{a} \cdot \vec{b} &= (1 \times 4) + (2 \times 5) + (3 \times 6) \\
&= 4 + 10 + 18 \\
&= 32
\end{aligned}$$

**The geometric meaning:** the same number equals $\lVert \vec{a} \rVert \, \lVert \vec{b} \rVert \cos\theta$, where $\theta$ is the angle between the two arrows. So its **sign** tells you the direction: positive = roughly the same way, 0 = perpendicular (unrelated), negative = pointing apart. Cosine similarity (below) just divides the lengths out.

**Why it's everywhere in ML:**

1. **Neurons:** $\text{output} = \vec{w} \cdot \vec{x} + b$

$$[0.5,\ {-0.3},\ 0.8] \cdot [1.0,\ 2.0,\ 0.5] = (0.5)(1.0) + (-0.3)(2.0) + (0.8)(0.5) = 0.3$$

2. **Attention** in Transformers: $\text{score} = \vec{q} \cdot \vec{k}$ (§1.7)

3. **Similarity:** cosine similarity uses dot product

4. **Prediction:** linear regression $y = \vec{w} \cdot \vec{x} + b$

</details>

### Vector Norms — Measuring Length

<details>
<summary><strong>Read as text</strong> — L1, L2 and max norm on one vector, and gradient clipping</summary>

**Simple Explanation:**
A "norm" is just a fancy word for "how big is this vector?" Like asking "how far from home are you?"

There are different ways to measure distance:
- **L1 norm** = Manhattan distance. Like walking on a city grid — count every block.
  Go 3 blocks east, then 4 blocks north $= 3 + 4 = 7$ blocks total.
- **L2 norm** = Straight-line distance. Like a bird flying directly.
  3 blocks east and 4 blocks north $= 5$ blocks (Pythagorean theorem: $3\text{-}4\text{-}5$ triangle!)
- **Max norm** = The biggest single step. 3 east and 4 north → $\max = 4$.

Below, all three are measured on the same running example, $\vec{v} = [3, -4, 5]$.

---

**L1 Norm (Manhattan distance):**

$$\lVert \vec{v} \rVert_1 = |v_1| + |v_2| + \cdots + |v_n|$$

> **In plain English:** "Add up the absolute value of each number in the vector."

**Example:** $\vec{v} = [3, -4, 5]$

$$\lVert \vec{v} \rVert_1 = |3| + |{-4}| + |5| = 3 + 4 + 5 = 12$$

In ML: L1 regularization — pushes many weights to exactly zero (sparse models). Why? Imagine your model is using 1000 clues to make a prediction, but only 50 actually matter. L1 adds the "total size" of the weights, $\lambda \sum |w_i|$, to the loss as a penalty, which forces the model to throw away useless clues and keep only the important ones (§4.5).

---

**L2 Norm (Euclidean / straight-line distance):**

$$\lVert \vec{v} \rVert_2 = \sqrt{v_1^2 + v_2^2 + \cdots + v_n^2}$$

> **In plain English:** "Square each number, add them all up, then take the square root."

**Example:** the city walk $[3, 4]$ gives $\sqrt{9 + 16} = \sqrt{25} = 5$. For the running vector $\vec{v} = [3, -4, 5]$:

$$\lVert \vec{v} \rVert_2 = \sqrt{3^2 + (-4)^2 + 5^2} = \sqrt{9 + 16 + 25} = \sqrt{50} \approx 7.07$$

In ML: L2 regularization — pushes all weights to be small. Why? A model with huge weights is like a student who memorizes answers instead of understanding. L2 adds the *squared* L2 norm of the weights, $\lambda \sum w_i^2$, as a penalty — it gently shrinks all weights so no single feature gets too powerful, making the model more balanced and less likely to overfit (§4.5).

---

**Max Norm:**

$$\lVert \vec{v} \rVert_\infty = \max(|v_1|, |v_2|, \ldots, |v_n|)$$

> **In plain English:** "Just pick the biggest number (ignoring the sign)."

**Example:** $\vec{v} = [3, -4, 5]$

$$\lVert \vec{v} \rVert_\infty = \max(3, 4, 5) = 5$$

In ML: **gradient clipping** keeps one exploding gradient from wrecking training. *Clip-by-value* caps every entry at $\pm c$, which is a limit on the max norm — but it bends the gradient's direction. The standard choice, *clip-by-norm*, uses the L2 norm instead: if $\lVert g \rVert_2 > c$, multiply the whole gradient by $c / \lVert g \rVert_2$. With $c = 1$ (the usual LLM setting), the gradient $[3, 4]$ (norm 5) becomes $[0.6, 0.8]$ — same direction, length 1. Details in [Ch 16 §1.6](#content/16_deep_learning).

```chart
{
  "type": "bar",
  "data": {
    "labels": ["L1 (Manhattan)", "L2 (Euclidean)", "Max Norm"],
    "datasets": [{
      "label": "Norm of v = [3, -4, 5]",
      "data": [12, 7.07, 5],
      "backgroundColor": ["rgba(99, 102, 241, 0.7)", "rgba(234, 88, 12, 0.7)", "rgba(34, 197, 94, 0.7)"],
      "borderColor": ["rgba(99, 102, 241, 1)", "rgba(234, 88, 12, 1)", "rgba(34, 197, 94, 1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Three Ways to Measure v = [3, -4, 5] — Same Vector, Different Answers" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Norm Value" }, "beginAtZero": true }
    }
  }
}
```

For every vector, $\lVert \vec{v} \rVert_\infty \le \lVert \vec{v} \rVert_2 \le \lVert \vec{v} \rVert_1$ — here $5 \le 7.07 \le 12$.

</details>

### Cosine Similarity

<details>
<summary><strong>Read as text</strong> — direction not length, three examples and real word vectors</summary>

**Simple Explanation:**
Imagine two flashlights shining from the same spot. Cosine similarity asks: "Are they pointing in the same direction?" It doesn't care how bright they are (vector length) — only which way they point (direction).

- Both pointing the same way = 1 (identical direction)
- Pointing at right angles = 0 (completely unrelated)
- Pointing opposite ways = -1 (opposite direction)

This is how computers decide if two words or sentences mean similar things!

**Formula:**

$$\operatorname{cosine\text{-}sim}(\vec{a}, \vec{b}) = \frac{\vec{a} \cdot \vec{b}}{\lVert \vec{a} \rVert \times \lVert \vec{b} \rVert}$$

> **In plain English:** "Take the dot product of the two vectors, then divide by both of their lengths."

**Example 1:** $\vec{a} = [1, 2, 3]$, $\vec{b} = [2, 4, 6]$ (b is just 2x bigger than a — same direction!)

$$\vec{a} \cdot \vec{b} = (1)(2) + (2)(4) + (3)(6) = 2 + 8 + 18 = 28$$

$$\lVert \vec{a} \rVert = \sqrt{1 + 4 + 9} = \sqrt{14} = 3.742$$

$$\lVert \vec{b} \rVert = \sqrt{4 + 16 + 36} = \sqrt{56} = 7.483$$

$$\operatorname{cosine\text{-}sim} = \frac{28}{3.742 \times 7.483} = \frac{28}{28} = 1.0 \quad \text{(perfect match!)}$$

**Example 2:** $\vec{a} = [1, 0]$ (pointing right), $\vec{b} = [0, 1]$ (pointing up)

$$\vec{a} \cdot \vec{b} = 0 \quad \Rightarrow \quad \operatorname{cosine\text{-}sim} = 0 \quad \text{(completely unrelated)}$$

**Example 3:** $\vec{a} = [1, 0]$ and $\vec{b} = [-1, 0]$ point opposite ways: $\vec{a} \cdot \vec{b} = -1$ and both lengths are 1, so the cosine is $-1$. And $[1, 2, 3]$ vs $[3, 2, 1]$ is in between: $\frac{10}{\sqrt{14} \times \sqrt{14}} = \frac{10}{14} = 0.714$.

In ML: embedding similarity (are two words or sentences related?), recommendation systems, RAG retrieval, search engines. Why? In a search engine or a RAG system, your question and every stored passage are turned into embedding vectors, and cosine similarity ranks the passages by how closely they point the same way as the question — like a librarian who instantly knows which book answers your question.

**What real word vectors look like.** The chart below was computed from GloVe (Pennington et al., 2014), a classic word-vector model trained on Wikipedia and newswire text — 50 numbers per word.

```chart
{
  "type": "bar",
  "data": {
    "labels": ["cat – dog", "car – truck", "hot – cold (opposites)", "king – queen", "happy – sad (opposites)", "cat – car", "apple – rocket"],
    "datasets": [{
      "label": "Cosine similarity",
      "data": [0.92, 0.92, 0.80, 0.78, 0.69, 0.36, 0.19],
      "backgroundColor": ["rgba(34,197,94,0.7)","rgba(34,197,94,0.7)","rgba(245,158,11,0.7)","rgba(34,197,94,0.6)","rgba(245,158,11,0.7)","rgba(200,200,200,0.6)","rgba(200,200,200,0.6)"],
      "borderColor": ["rgba(34,197,94,1)","rgba(34,197,94,1)","rgba(217,119,6,1)","rgba(34,197,94,1)","rgba(217,119,6,1)","rgba(160,160,160,1)","rgba(160,160,160,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "indexAxis": "y",
    "plugins": { "title": { "display": true, "text": "Cosine Similarity Between Real Word Vectors (GloVe, 50 dimensions)" } },
    "scales": {
      "x": { "title": { "display": true, "text": "Similarity (-1 to +1)" }, "min": -1, "max": 1 }
    }
  }
}
```

The surprise: **opposites are not negative.** Hot–cold (0.80) and happy–sad (0.69) score *high*, because word vectors learn from context and opposites appear in the same kinds of sentences ("the water is hot / cold"). In this model only about 2% of pairs among the 5,000 most common words have a negative cosine at all, and none falls much below −0.5. "Cosine −1 = opposite meaning" is true for arrows, not for real embeddings.

**Unit-length vectors make it cheaper.** If every vector has length 1, the denominator is 1 and cosine similarity *is* the dot product. And the squared distance becomes $\lVert \vec{a} - \vec{b} \rVert^2 = 2 - 2\cos\theta$, so cosine, dot product and Euclidean distance give the **same ranking**. Many embedding APIs therefore return unit-length vectors: OpenAI's do, and so do Google's Gemini embeddings at their full 3,072 dimensions. If you shorten a `gemini-embedding-001` vector (Matryoshka truncation), you must re-normalize it yourself; `gemini-embedding-2` does that for you. More in [Ch 17b §10.3](#content/17b_llm_applications).

</details>

**Run it** — every number in this section, then the unit-length shortcut on five random "documents":

```python
# Vector basics on the chapter's own numbers: add, scale, dot, three norms, cosine
import numpy as np

a, b = np.array([1, 3, 5]), np.array([2, 4, 6])
print("a + b =", (a + b).tolist(), "  a - b =", (a - b).tolist(), "  3 * [2, 4, 6] =", (3 * b).tolist())

a, b = np.array([1, 2, 3]), np.array([4, 5, 6])
dot = a @ b                                        # same as np.dot(a, b) and (a * b).sum()
print(f"[1, 2, 3] . [4, 5, 6] = {dot}")
assert dot == 1*4 + 2*5 + 3*6 == 32

w, x, bias = np.array([0.5, -0.3, 0.8]), np.array([1.0, 2.0, 0.5]), 0.0
print(f"neuron w . x + b = {w @ x + bias:.1f}")

v = np.array([3, -4, 5])
l1, l2, linf = np.abs(v).sum(), np.sqrt((v ** 2).sum()), np.abs(v).max()
print(f"v = {v.tolist()}: L1 = {l1}, L2 = {l2:.2f}, max = {linf}")
assert np.isclose(l2, np.linalg.norm(v)) and l1 == np.linalg.norm(v, 1) and linf == np.linalg.norm(v, np.inf)
assert linf <= l2 <= l1                            # true for every vector

g = np.array([3.0, 4.0])                           # clip-by-norm with c = 1
g_clipped = g * min(1.0, 1.0 / np.linalg.norm(g))
print(f"clip {g.tolist()} (norm {np.linalg.norm(g):.0f}) -> {g_clipped.round(2).tolist()}")

def cosine(p, q):
    return (p @ q) / (np.linalg.norm(p) * np.linalg.norm(q))

for p, q, note in [([1, 2, 3], [2, 4, 6], "same direction, 2x longer"),
                   ([1, 0], [0, 1], "right angle"),
                   ([1, 0], [-1, 0], "opposite"),
                   ([1, 2, 3], [3, 2, 1], "partly aligned")]:
    print(f"cos({p}, {q}) = {cosine(np.array(p), np.array(q)):+.3f}   {note}")

# Unit-length vectors: cosine == dot product, and squared distance = 2 - 2*cos -> same ranking
rng = np.random.default_rng(0)
query, docs = rng.standard_normal(8), rng.standard_normal((5, 8))
qn, dn = query / np.linalg.norm(query), docs / np.linalg.norm(docs, axis=1, keepdims=True)
cos_scores = dn @ qn
dist2 = ((dn - qn) ** 2).sum(axis=1)
assert np.allclose(dist2, 2 - 2 * cos_scores)
print("rank by cosine:  ", np.argsort(-cos_scores).tolist())
print("rank by distance:", np.argsort(dist2).tolist())
```

**Output:**

```
a + b = [3, 7, 11]   a - b = [-1, -1, -1]   3 * [2, 4, 6] = [6, 12, 18]
[1, 2, 3] . [4, 5, 6] = 32
neuron w . x + b = 0.3
v = [3, -4, 5]: L1 = 12, L2 = 7.07, max = 5
clip [3.0, 4.0] (norm 5) -> [0.6, 0.8]
cos([1, 2, 3], [2, 4, 6]) = +1.000   same direction, 2x longer
cos([1, 0], [0, 1]) = +0.000   right angle
cos([1, 0], [-1, 0]) = -1.000   opposite
cos([1, 2, 3], [3, 2, 1]) = +0.714   partly aligned
rank by cosine:   [3, 4, 1, 0, 2]
rank by distance: [3, 4, 1, 0, 2]
```

---

## 1.3 Matrix Operations

![Infographic on matrix operations: the shape rule (m x k) times (k x n) gives (m x n) at a cost of about 2 m k n FLOPs, each symbol labelled; multiplying A = (1 2 3; 4 5 6) by B = (7 8; 9 10; 11 12) step by step: 7 + 18 + 33 = 58, then 64, 139 and 154; shape checks for AB, BA and the illegal A times A, and the transpose (AB) transposed = B transposed A transposed; determinant of (3 2; 4 5) = 15 - 8 = 7 drawn to scale as a unit square becoming a parallelogram of area 7, and det of (2 4; 1 2) = 0, squashed flat with no inverse; where ML uses each tool; the trap of duplicate features giving det = 0.](diagrams/math06_info_matrix_operations_ai.png)

<details>
<summary><strong>Read as text</strong> — the shape rule and its cost in one line</summary>

> **Maths in one line:** `(m × k) · (k × n) → (m × n)` — the inner sizes must match; each of the m·n answers is a k-term dot product, so the cost is about `2·m·k·n` floating-point operations (FLOPs).

</details>

### Matrix Multiplication — The Core Operation

<details>
<summary><strong>Read as text</strong> — the party bill, the row-times-column rule, order and cost</summary>

**Simple Explanation:**
Imagine you're ordering food for a party. You need food for 2 groups:
- Group 1 wants: 1 pizza, 2 sodas, 3 cookies
- Group 2 wants: 4 pizzas, 5 sodas, 6 cookies

Prices are: pizza $= 7$ dollars, soda $= 2$ dollars, cookie $= 1$ dollar.

$$\text{Group 1 total} = (1 \times 7) + (2 \times 2) + (3 \times 1) = 14 \text{ dollars}$$

$$\text{Group 2 total} = (4 \times 7) + (5 \times 2) + (6 \times 1) = 44 \text{ dollars}$$

That's matrix multiplication! Each row of orders times the column of prices $=$ a total. In shapes: orders $(2 \times 3)$ times prices $(3 \times 1)$ gives totals $(2 \times 1)$.

**The rule:** To multiply $A \times B$, $A$'s number of columns must equal $B$'s number of rows. Each answer cell $=$ dot product of a row from $A$ with a column from $B$.

$$A = \begin{pmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{pmatrix} \quad B = \begin{pmatrix} 7 & 8 \\ 9 & 10 \\ 11 & 12 \end{pmatrix}$$

Rows and columns are counted from 0, as in NumPy — $C_{10}$ is row 1, column 0:

$$\begin{aligned}
C_{00} &= (1)(7) + (2)(9) + (3)(11) = 58 \\
C_{01} &= (1)(8) + (2)(10) + (3)(12) = 64 \\
C_{10} &= (4)(7) + (5)(9) + (6)(11) = 139 \\
C_{11} &= (4)(8) + (5)(10) + (6)(12) = 154
\end{aligned}$$

$$C = \begin{pmatrix} 58 & 64 \\ 139 & 154 \end{pmatrix}$$

**Order matters:** $(2 \times 3)(3 \times 2)$ gives a $2 \times 2$ matrix, but $B \times A$ is $(3 \times 2)(2 \times 3)$ — a completely different $3 \times 3$ matrix. And $A \times A$ is not allowed at all (inner sizes 3 and 2 differ).

**Why this is the heart of ML:** every neural-network layer is a matrix multiplication. One token passing through a layer that maps 4,096 numbers to 4,096 numbers costs $2 \times 4{,}096 \times 4{,}096 \approx 33.6$ million FLOPs (each multiply-add counts as 2), and a batch simply adds a dimension — $(32 \times 10 \times 512)$ times $(512 \times 256)$ gives $(32 \times 10 \times 256)$ in one call. That is why GPUs and TPUs are built around matrix-multiply units ([Ch 29](#content/29_gpus_tpus_infrastructure)).

</details>

### Transpose

<details>
<summary><strong>Read as text</strong> — turning the table sideways, and Q times K transposed</summary>

**Simple Explanation:**
Imagine your spreadsheet has students as rows and subjects as columns. The transpose FLIPS it — now subjects are rows and students are columns. You turn the table sideways.

$$A = \begin{pmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{pmatrix} \quad \Rightarrow \quad A^T = \begin{pmatrix} 1 & 4 \\ 2 & 5 \\ 3 & 6 \end{pmatrix}$$

$(2 \times 3)$ becomes $(3 \times 2)$. Rows become columns. One rule to remember: $(AB)^T = B^T A^T$ — the order flips.

In ML: used in attention ($QK^T$), computing gradients, and converting between row and column vectors. Why? In attention, $Q$ and $K$ both hold one row per token, so both are $n \times d_k$. Transposing $K$ makes it $d_k \times n$, and now $QK^T$ is $n \times n$ — every query dotted with every key (§1.7). Without the flip, the shapes would not line up.

</details>

### Identity Matrix and Inverse

<details>
<summary><strong>Read as text</strong> — the do-nothing matrix, the undo matrix and the normal equation</summary>

**Simple Explanation:**
The **identity matrix** is the "do nothing" matrix. Multiply anything by it and you get the same thing back. It's like multiplying a number by 1 — nothing changes.

The **inverse matrix** is the "undo" matrix. If matrix A transforms your data, then A-inverse puts it back the way it was. Like Ctrl+Z for math.

**Formulas:**

$$A \times I = A \quad \text{(just like } 5 \times 1 = 5\text{)}$$

$$A \times A^{-1} = I$$

> **In plain English:** "If you apply matrix $A$ and then apply its inverse $A^{-1}$, you end up right back where you started."

$$I = \begin{pmatrix} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \end{pmatrix}$$

Not all matrices have an inverse! If a matrix has NO inverse, it's called "singular" — it squishes things flat and you can't unsquish. Only square matrices can have one.

In ML: the closed-form solution of linear regression, the **normal equation** $\vec{w} = (X^T X)^{-1} X^T \vec{y}$, uses an inverse. Why? Instead of slowly guessing-and-checking (gradient descent), it solves for the best weights in one shot — like having the answer key to a test. In practice, libraries *solve* the system (`np.linalg.solve` or `lstsq`, using a QR or Cholesky factorization) instead of forming the inverse, which is faster and numerically safer ([Ch 12 §12.2](#content/12_key_algorithms)). It only works for linear models; neural networks are too complex for this shortcut.

</details>

### Determinant

<details>
<summary><strong>Read as text</strong> — squish or not, two worked examples and the duplicate-feature trap</summary>

**Simple Explanation:**
The determinant is a single number that tells you: "Does this matrix squish things or not?"

- Determinant = 0 means the matrix SQUISHES everything flat (like pressing a 3D object into a pancake). Information is lost. BAD.
- Determinant $\neq$ 0 means the matrix is healthy — it transforms things without squishing. GOOD.
- Its size, $|\det A|$, is how much the matrix scales areas (in 2-D) or volumes (in 3-D); a negative sign means the space also gets flipped, like a mirror image.

**Formula (for a 2x2 matrix):**

$$\det \begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc$$

> **In plain English:** "Multiply the two diagonals and subtract."

**Example 1:**

$$\det \begin{pmatrix} 3 & 2 \\ 4 & 5 \end{pmatrix} = (3)(5) - (2)(4) = 15 - 8 = 7$$

Determinant is 7 (not zero) → this matrix is invertible, and it makes every area 7 times bigger. For a $2 \times 2$ matrix the inverse has a shortcut: swap $a$ and $d$, flip the signs of $b$ and $c$, divide by the determinant:

$$\begin{pmatrix} 3 & 2 \\ 4 & 5 \end{pmatrix}^{-1} = \frac{1}{7} \begin{pmatrix} 5 & -2 \\ -4 & 3 \end{pmatrix}$$

**Example 2:**

$$\det \begin{pmatrix} 2 & 4 \\ 1 & 2 \end{pmatrix} = (2)(2) - (4)(1) = 4 - 4 = 0$$

Determinant is 0 → this matrix SQUISHES things flat. Not invertible — the shortcut would divide by zero! (Notice row 1 $= 2 \times$ row 2 — they carry the same information.)

In ML: the multivariate Gaussian divides by $\sqrt{\det \Sigma}$, where $\Sigma$ is the covariance matrix, and many methods need $\Sigma^{-1}$. A covariance matrix with determinant 0 means one feature is an exact combination of others — like having "height in cm" and "height in inches" both in your data. It cannot be inverted, so the fix is to drop the duplicate feature or add a small ridge ($\Sigma + \varepsilon I$).

</details>

**Run it** — the party bill, the shape rule, transpose, determinant and inverse:

```python
# Matrix multiply by its shape rule, plus transpose, inverse and determinant on the chapter's matrices
import numpy as np

orders = np.array([[1, 2, 3],                      # group 1: pizzas, sodas, cookies
                   [4, 5, 6]])                     # group 2
prices = np.array([7, 2, 1])                       # dollars per pizza, soda, cookie
print("party totals:", (orders @ prices).tolist())

A = np.array([[1, 2, 3], [4, 5, 6]])               # 2 x 3
B = np.array([[7, 8], [9, 10], [11, 12]])          # 3 x 2
C = A @ B                                          # (2 x 3)(3 x 2) -> 2 x 2
print(f"A {A.shape} @ B {B.shape} -> C {C.shape}:", C.tolist())
assert C[1, 0] == A[1] @ B[:, 0] == 139            # each cell = row of A . column of B
print(f"B @ A has shape {(B @ A).shape}: order matters")
try:
    A @ A                                          # (2 x 3)(2 x 3): inner sizes 3 and 2 differ
except ValueError:
    print("A @ A fails: inner sizes must match")

print(f"A.T has shape {A.T.shape}; (A @ B).T == B.T @ A.T: {np.array_equal(C.T, B.T @ A.T)}")

X = np.ones((32, 10, 512))                         # batch x tokens x features
W = np.ones((512, 256))                            # one layer's weights, shared by every token
print(f"batch {X.shape} @ W {W.shape} -> {(X @ W).shape}")
m, k, n = 1, 4096, 4096                            # one token through a 4096 -> 4096 layer
print(f"cost of (1 x 4096)(4096 x 4096): 2*m*k*n = {2 * m * k * n:,} FLOPs")

M = np.array([[3.0, 2.0], [4.0, 5.0]])
S = np.array([[2.0, 4.0], [1.0, 2.0]])
print(f"det(M) = {np.linalg.det(M):.1f}, det(S) = {abs(np.linalg.det(S)):.1f}")
M_inv = np.linalg.inv(M)
print("7 * inv(M) =", np.rint(7 * M_inv).astype(int).tolist())
assert np.allclose(M @ M_inv, np.eye(2))           # M times its inverse = identity
y = np.array([8.0, 13.0])
print("solve M x = y:", np.linalg.solve(M, y).round(6).tolist())   # prefer solve() over inv(M) @ y
print(f"rank of S = {np.linalg.matrix_rank(S)} (row 1 = 2 x row 2), so S has no inverse")
```

**Output:**

```
party totals: [14, 44]
A (2, 3) @ B (3, 2) -> C (2, 2): [[58, 64], [139, 154]]
B @ A has shape (3, 3): order matters
A @ A fails: inner sizes must match
A.T has shape (3, 2); (A @ B).T == B.T @ A.T: True
batch (32, 10, 512) @ W (512, 256) -> (32, 10, 256)
cost of (1 x 4096)(4096 x 4096): 2*m*k*n = 33,554,432 FLOPs
det(M) = 7.0, det(S) = 0.0
7 * inv(M) = [[5, -2], [-4, 3]]
solve M x = y: [2.0, 1.0]
rank of S = 1 (row 1 = 2 x row 2), so S has no inverse
```

---

## 1.4 Eigenvalues and Eigenvectors ★★

![Infographic on eigenvalues and eigenvectors: the formula A v = lambda v with det(A - lambda I) = 0, each symbol labelled; finding lambda for A = (2 1; 1 2) step by step: (2 - lambda) squared - 1 = lambda squared - 4 lambda + 3 = (lambda - 1)(lambda - 3), so lambda = 1 or 3, with the checks 1 + 3 = 4 = trace and 1 x 3 = 3 = det; checking A times (1, 1) = (3, 3) and A times (1, -1) = (1, -1), while (1, 0) turns into (2, 1), drawn to scale on a grid; repeating 50 times on a log-scale chart: 1.1 to the 50 is about 117, 1.0 stays 1, 0.9 to the 50 is about 0.005; where ML uses it (PCA, exploding and vanishing gradients, PageRank, power iteration); the trap that most vectors are not eigenvectors.](diagrams/math06_info_eigenvalues_eigenvectors_ai.png)

<details>
<summary><strong>Read as text</strong> — the stretchy mirror, solving for lambda, two checks and why it matters</summary>

**Simple Explanation:**
Imagine you have a magic stretchy mirror. When you hold up most objects, the mirror changes both their size AND direction. But some special objects — the "eigenvectors" — only change SIZE, not direction. They point the same way, just bigger or smaller.

The "eigenvalue" is HOW MUCH bigger or smaller. An eigenvalue of 3 means the eigenvector gets stretched to 3x its original length. An eigenvalue of 0.5 means it shrinks to half.

> **Maths in one line:** `A v = λ v`, with the λ's found from `det(A − λI) = 0` — a direction the matrix only stretches, and the factor it stretches by.

**Official Math:**

$$A \vec{v} = \lambda \vec{v}$$

> **In plain English:** "When matrix $A$ multiplies eigenvector $\vec{v}$, the result is just $\vec{v}$ scaled by the eigenvalue $\lambda$ (lambda). The direction stays the same — only the size changes."

**Step-by-Step Example:**

$$A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix} \qquad \vec{v} = \begin{pmatrix} 1 \\ 1 \end{pmatrix} \qquad \lambda = 3$$

$$A\vec{v} = \begin{pmatrix} (2)(1) + (1)(1) \\ (1)(1) + (2)(1) \end{pmatrix} = \begin{pmatrix} 3 \\ 3 \end{pmatrix} = 3 \begin{pmatrix} 1 \\ 1 \end{pmatrix} = \lambda \vec{v} \quad \checkmark$$

The vector $[1, 1]$ still points in the same direction after $A$. It just got $3\times$ longer. Compare $[1, 0]$: $A$ sends it to $[2, 1]$, a different direction — so $[1, 0]$ is *not* an eigenvector.

**Finding eigenvalues:**

To find the eigenvalues, solve $\det(A - \lambda I) = 0$:

$$A - \lambda I = \begin{pmatrix} 2 - \lambda & 1 \\ 1 & 2 - \lambda \end{pmatrix}$$

$$\det = (2 - \lambda)^2 - 1 = \lambda^2 - 4\lambda + 3 = 0$$

$$(\lambda - 1)(\lambda - 3) = 0 \quad \Rightarrow \quad \lambda = 1 \text{ or } \lambda = 3$$

The second eigenvector belongs to $\lambda = 1$: $A \begin{pmatrix} 1 \\ -1 \end{pmatrix} = \begin{pmatrix} 2 - 1 \\ 1 - 2 \end{pmatrix} = \begin{pmatrix} 1 \\ -1 \end{pmatrix}$ — not stretched at all.

**Two checks that always work:** the eigenvalues add up to the **trace** (the diagonal sum: $2 + 2 = 4 = 1 + 3$) and multiply to the **determinant** ($4 - 1 = 3 = 1 \times 3$). And because $A$ is **symmetric** (it equals its own transpose), its eigenvalues are real and its eigenvectors $[1, 1]$ and $[1, -1]$ are perpendicular — the property PCA relies on (§1.6).

**Why this matters:**

1. **PCA:** Eigenvectors of the covariance matrix = the "important directions" in your data. Eigenvalues = how much the data spreads along each one (§1.6).
2. **Stability:** apply the same matrix again and again (an RNN unrolled over time, a deep stack of similar layers) and the part of a vector along each eigenvector gets multiplied by $\lambda$ every step. With $|\lambda| > 1$ it grows like $|\lambda|^t$ — $1.1^{50} \approx 117$, exploding gradients. With $|\lambda| < 1$ it shrinks — $0.9^{50} \approx 0.005$, vanishing gradients ([Ch 14 §14.6](#content/14_neural_networks)).
3. **Google PageRank:** the PageRank scores are the eigenvector with eigenvalue 1 of the "Google matrix" built from the web's links (with damping factor 0.85). It is found by **power iteration** — multiply, renormalize, repeat — the same loop as in the program below. Full worked example: [Ch 32 Q37](#content/32_interview_questions).

</details>

**Run it** — the eigenvalues, both checks, power iteration, and $|\lambda|^{50}$:

```python
# Eigenvalues of the chapter's matrix, two quick checks, and why |lambda| > 1 explodes
import numpy as np

A = np.array([[2.0, 1.0], [1.0, 2.0]])
lams, vecs = np.linalg.eigh(A)                     # eigh: for symmetric matrices, sorted ascending
print("eigenvalues:", lams.round(3).tolist())
for lam, v in zip(lams, vecs.T):                   # each COLUMN of vecs is an eigenvector (length 1)
    v = v if v[0] > 0 else -v                      # an eigenvector times -1 is still one; fix the sign
    print(f"  lambda = {lam:.0f}: v = {v.round(3).tolist()},  A v = {(A @ v).round(3).tolist()}")
    assert np.allclose(A @ v, lam * v)             # the definition A v = lambda v
print(f"sum = {lams.sum():.0f} = trace, product = {lams.prod():.0f} = det")
assert abs(vecs[:, 0] @ vecs[:, 1]) < 1e-12        # symmetric matrix -> perpendicular eigenvectors

x = np.array([1.0, 0.0])                           # NOT an eigenvector: A turns it
print("A [1, 0] =", (A @ x).tolist(), " (direction changed)")

for step in range(20):                             # power iteration: multiply, renormalise, repeat
    x = A @ x
    x = x / np.linalg.norm(x)
rayleigh = x @ A @ x                               # eigenvalue estimate x.Ax for a unit-length x
print(f"power iteration, 20 steps: x = {x.round(3).tolist()}, lambda = {rayleigh:.3f}")
assert np.isclose(rayleigh, 3)

for lam in [1.1, 1.0, 0.9]:                        # the same matrix applied 50 times
    W = lam * np.eye(2)                            # both eigenvalues equal lam
    g = np.linalg.matrix_power(W, 50) @ np.array([1.0, 1.0])
    print(f"lambda = {lam}: length after 50 steps = {np.linalg.norm(g) / np.sqrt(2):.4g} x")
```

**Output:**

```
eigenvalues: [1.0, 3.0]
  lambda = 1: v = [0.707, -0.707],  A v = [0.707, -0.707]
  lambda = 3: v = [0.707, 0.707],  A v = [2.121, 2.121]
sum = 4 = trace, product = 3 = det
A [1, 0] = [2.0, 1.0]  (direction changed)
power iteration, 20 steps: x = [0.707, 0.707], lambda = 3.000
lambda = 1.1: length after 50 steps = 117.4 x
lambda = 1.0: length after 50 steps = 1 x
lambda = 0.9: length after 50 steps = 0.005154 x
```

---

## 1.5 SVD (Singular Value Decomposition) ★★

![Infographic on the SVD: the formula A = U Sigma V transposed with each symbol labelled (rotation, stretches, rotation); singular values of A = (1 2 3; 4 5 6) step by step: A A transposed = (14 32; 32 77), eigenvalues 90.40 and 0.597, sigma1 = 9.508 and sigma2 = 0.773, with a to-scale unit circle stretched into a thin tilted ellipse; the best rank-1 copy (1.57 2.08 2.59; 3.76 4.97 6.17) with error 0.773 and 90.40 / 91.00 = 99.3% kept, and to-scale bars for the two singular values; storage k(m + n + 1): a 1000 x 1000 image with k = 50 needs 100,050 numbers instead of 1,000,000, about 10x smaller, drawn to scale; where ML uses it (LoRA 131,072 vs 16,777,216 = 0.78%, PiSSA, Netflix Prize matrix factorization, PCA, Muon); the trap that LoRA is learned, not computed by SVD.](diagrams/math06_info_svd_low_rank_ai.png)

<details>
<summary><strong>Read as text</strong> — rotate, stretch, rotate, the best rank-1 copy and where low rank pays off</summary>

**Simple Explanation:**
SVD is like taking apart a LEGO castle into its basic building steps. Any matrix (no matter how complicated) can be broken into 3 simple pieces:

1. **Rotate** the data
2. **Stretch** it (make some directions bigger, some smaller)
3. **Rotate** it again

The stretching amounts (called "singular values") tell you which directions are important. Big stretch = important direction. Tiny stretch = not important, can be thrown away.

> **Maths in one line:** `A = U Σ Vᵀ`; keep only the k largest singular values and you get the best possible rank-k copy of A (the Eckart–Young theorem), with an error made of exactly the singular values you dropped.

**Formula:**

$$A = U \Sigma V^T$$

> **In plain English:** "Any matrix $= \text{Rotation 1} \times \text{Stretch} \times \text{Rotation 2}$"

- $U$ = first rotation matrix
- $\Sigma$ = stretch amounts (diagonal matrix, sorted biggest to smallest)
- $V^T$ = second rotation matrix (transposed)

(Strictly, $U$ and $V$ may also include a mirror flip — they are "orthogonal" matrices, which never change lengths or angles.) Unlike eigenvectors, the SVD exists for **every** matrix, square or not. It is tied to §1.4: the singular values of $A$ are the square roots of the eigenvalues of $AA^T$.

**Step-by-Step Example:** take the $2 \times 3$ matrix from §1.1, $A = \begin{pmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{pmatrix}$.

- Its singular values are $\sigma_1 = 9.508$ and $\sigma_2 = 0.773$ — one big stretch, one tiny one.
- Keep only $\sigma_1$: the rank-1 copy $\sigma_1 \vec{u}_1 \vec{v}_1^T = \begin{pmatrix} 1.57 & 2.08 & 2.59 \\ 3.76 & 4.97 & 6.17 \end{pmatrix}$ is already close to $A$.
- The error (the square root of the sum of squared differences) is exactly $\sigma_2 = 0.773$, and the copy keeps $\sigma_1^2 / (\sigma_1^2 + \sigma_2^2) = 99.3\%$ of the matrix's "energy". Keeping the *small* stretch instead would leave an error of $\sigma_1 = 9.508$.

**Why SVD matters:**

1. **Compression:** keep only the top-$k$ stretch amounts → approximate the original matrix with WAY fewer numbers. A rank-$k$ copy of an $m \times n$ matrix stores $k(m + n + 1)$ numbers: for a $1000 \times 1000$ image and $k = 50$ that is $50 \times 2{,}001 = 100{,}050$ numbers instead of $1{,}000{,}000$ — about $10\times$ smaller.
2. **Recommendation systems:** the Netflix Prize (2006–2009) made *matrix factorization* famous — split the sparse users × movies rating matrix into a "user taste" matrix times a "movie profile" matrix, revealing hidden factors like "action lover". The community called it "SVD", though it is fitted by gradient descent on the known ratings only. Netflix put two of the prize's models (matrix factorization and a restricted Boltzmann machine) into production, but not the final winning blend — its offline tests showed the extra accuracy was not worth the engineering cost.
3. **LoRA fine-tuning:** LoRA (Hu et al., 2021) learns a weight *update* as the product of two thin matrices, $\Delta W = BA$ with rank $r$ much smaller than the layer size — the same low-rank idea as a truncated SVD, but learned by gradient descent, not computed by SVD. For one $4{,}096 \times 4{,}096$ weight and $r = 16$: $2 \times 4{,}096 \times 16 = 131{,}072$ trainable numbers instead of $16{,}777{,}216$ (0.78%). Combined with 4-bit weights (QLoRA, 2023), a 65B-parameter model was fine-tuned on a single 48 GB GPU. PiSSA (2024) goes one step further and *starts* the two LoRA matrices from the weight's own top singular vectors. Details: [Ch 17b §9.4](#content/17b_llm_applications).
4. **PCA and optimizers:** PCA is the SVD of the centred data (§1.6). The Muon optimizer (2024) keeps an update's $U$ and $V^T$ and sets every singular value to about 1 ([Ch 16 §1.2](#content/16_deep_learning)).

</details>

**Run it** — the decomposition, the best rank-1 copy, and the two storage counts:

```python
# SVD of the chapter's 2 x 3 matrix: rotate-stretch-rotate, best rank-1 copy, and storage counts
import numpy as np

A = np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
U, s, Vt = np.linalg.svd(A, full_matrices=False)    # U: 2x2, s: 2 values, Vt: 2x3
print("singular values:", s.round(4).tolist())
assert np.allclose(U @ np.diag(s) @ Vt, A)          # A = U Sigma V^T exactly
assert np.allclose(U.T @ U, np.eye(2)) and np.allclose(Vt @ Vt.T, np.eye(2))   # no length changes
eig = np.linalg.eigvalsh(A @ A.T)[::-1]             # singular values = sqrt(eigenvalues of A A^T)
print("sqrt(eigenvalues of A A^T):", np.sqrt(eig).round(4).tolist())

A1 = s[0] * np.outer(U[:, 0], Vt[0])                # keep only the biggest stretch
print("rank-1 copy:", A1.round(2).tolist())
err = np.linalg.norm(A - A1)                        # Frobenius norm of what we threw away
print(f"error = {err:.4f} = sigma_2; energy kept = {s[0] ** 2 / (s ** 2).sum():.1%}")
assert np.isclose(err, s[1])                        # Eckart-Young: no rank-1 matrix does better

A_small = s[1] * np.outer(U[:, 1], Vt[1])           # contrast: keep the SMALL stretch instead
print(f"keep sigma_2 instead: error = {np.linalg.norm(A - A_small):.4f} = sigma_1")

m = n = 1000; k = 50                                # a 1000 x 1000 image, keep 50 stretches
full, kept = m * n, k * (m + n + 1)                 # U_k (m x k) + s_k (k) + V_k (n x k)
print(f"rank-{k}: {kept:,} numbers instead of {full:,} -> {full / kept:.1f}x smaller")

d, r = 4096, 16                                     # LoRA on one 4096 x 4096 weight, rank 16
print(f"LoRA r={r}: {2 * d * r:,} trainable vs {d * d:,} = {2 * d * r / (d * d):.2%}")
```

**Output:**

```
singular values: [9.508, 0.7729]
sqrt(eigenvalues of A A^T): [9.508, 0.7729]
rank-1 copy: [[1.57, 2.08, 2.59], [3.76, 4.97, 6.17]]
error = 0.7729 = sigma_2; energy kept = 99.3%
keep sigma_2 instead: error = 9.5080 = sigma_1
rank-50: 100,050 numbers instead of 1,000,000 -> 10.0x smaller
LoRA r=16: 131,072 trainable vs 16,777,216 = 0.78%
```

---

## 1.6 PCA (Principal Component Analysis) ★★

![Infographic on PCA: the formulas C = Xc transpose Xc / (n - 1), C v = lambda v and kept = lambda_1 / sum of lambdas with each symbol labelled; five points A(1, 2) to E(5, 6) centred on the mean (3, 4) give C = 2.5, 2.25 / 2.25, 2.5; eigenvalues 4.75 and 0.25 so PC1 = (0.707, 0.707) keeps 95%; PC1 scores -2.828, -1.414, 0.707, 0.707, 2.828 with C and D merging; a to-scale scatter with PC1 and PC2 arrows from the mean and a to-scale number line; where ML uses PCA; the units trap (y in cm gives 99.998%, standardising gives back 95%).](diagrams/math06_info_pca_ai.png)

<details>
<summary><strong>Read as text</strong> — the tilted frisbee, five points by hand, the traps and the uses</summary>

**Simple Explanation:**
Imagine you're looking at a cloud of dots in 3D space, but the cloud is actually FLAT — like a frisbee floating in the air at an angle. PCA figures out which direction the frisbee is tilted, then flattens everything onto 2D. You went from 3 numbers per dot to 2, and barely lost any information!

PCA answers: "What are the most important directions in my data?" Then it throws away the unimportant directions to simplify things.

> **Maths in one line:** `C = XcᵀXc / (n − 1)`, then `C v = λ v`; the explained-variance ratio of component i is `λᵢ / Σⱼ λⱼ` — the principal components are the eigenvectors of the covariance matrix, and each eigenvalue is the variance of the data along its component.

**Step-by-step:**

1. **CENTER** the data (subtract the average from everything)
2. **COMPUTE** the covariance matrix (how do features move together?)
3. **FIND** eigenvectors and eigenvalues of the covariance matrix
4. **PICK** the top-$k$ eigenvectors (the most important directions)
5. **PROJECT** the data onto those directions → fewer dimensions!

**Worked example — five points, 2-D down to 1-D:**

| Point | $x$ | $y$ | centred $(x - 3,\ y - 4)$ |
|---|---|---|---|
| A | 1 | 2 | $(-2, -2)$ |
| B | 2 | 3 | $(-1, -1)$ |
| C | 3 | 5 | $(0, 1)$ |
| D | 4 | 4 | $(1, 0)$ |
| E | 5 | 6 | $(2, 2)$ |

1. **Centre.** The means are $\bar{x} = 15/5 = 3$ and $\bar{y} = 20/5 = 4$.
2. **Covariance** (divide by $n - 1 = 4$): the squared centred $x$'s add to 10, the squared $y$'s to 10, and the products $x \cdot y$ to $4 + 1 + 0 + 0 + 4 = 9$, so

$$C = \begin{pmatrix} 10/4 & 9/4 \\ 9/4 & 10/4 \end{pmatrix} = \begin{pmatrix} 2.5 & 2.25 \\ 2.25 & 2.5 \end{pmatrix}$$

3. **Eigen.** $C$ has the same pattern as the matrix in §1.4 (equal diagonal $a$, off-diagonal $b$), so its eigenvectors are again the directions $[1, 1]$ and $[1, -1]$ (scaled to length 1: $[0.707, 0.707]$ and $[0.707, -0.707]$) and its eigenvalues are $a \pm b$: $\lambda_1 = 4.75$ and $\lambda_2 = 0.25$.
4. **How much is kept:**

$$\text{Variance explained by PC1} = \frac{4.75}{4.75 + 0.25} = \frac{4.75}{5} = 95\%$$

5. **Project.** Each point's PC1 score is its centred point dotted with $[0.707, 0.707]$: A $= -2.828$, B $= -1.414$, C $= 0.707$, D $= 0.707$, E $= 2.828$. Two numbers per point became one, and the variance of those scores is exactly $\lambda_1 = 4.75$.

Keep just 1 dimension and you lose only 5% of the variance. Notice what that 5% was: C and D now get the *same* score, because the only thing that told them apart was their position along PC2. Rebuilding the points from PC1 alone leaves a total squared error of $(n - 1)\lambda_2 = 4 \times 0.25 = 1$.

**PCA through SVD (the way libraries do it):** take the SVD of the centred data matrix; its singular values here are $\sqrt{19} = 4.359$ and $1$, and $\sigma^2 / (n - 1)$ gives back $19/4 = 4.75$ and $1/4 = 0.25$ — the same eigenvalues, without ever forming $C$.

**Watch out:**
- **Scale first when units differ.** Measure $y$ in centimetres instead of metres (×100) and PC1 becomes almost exactly the $y$-axis, explaining 99.998% — not because $y$ matters more, but because its numbers are bigger. Standardizing each feature (divide by its standard deviation) brings back the 95% / 5% split.
- **The sign of a component is arbitrary** — $[0.707, 0.707]$ and $[-0.707, -0.707]$ are the same axis; libraries may return either.
- **PCA only finds straight-line structure.** Curved data needs kernel PCA, t-SNE or UMAP ([Ch 11](#content/11_unsupervised_learning)).

**Used for:**
- Reduce $1000$ features to $50$ (often speeds up training a lot)
- Visualize high-dimensional data (project to 2D for plotting)
- Denoising — the smallest-eigenvalue directions are often mostly noise
- Face recognition (Eigenfaces, Turk & Pentland, 1991)

The operational version — a scree plot, choosing $k$, scikit-learn and kernel PCA — is in [Ch 11 §11.11](#content/11_unsupervised_learning).

</details>

**Run it** — the five points through the covariance route and the SVD route, then the units trap:

```python
# PCA on a 5-point 2-D toy set, two ways: eigenvectors of the covariance, and SVD of the centred data
import numpy as np

X = np.array([[1, 2], [2, 3], [3, 5], [4, 4], [5, 6]], dtype=float)   # points A..E as (x, y)
n = len(X)
Xc = X - X.mean(axis=0)                             # 1. centre: subtract the mean (3, 4)
C = Xc.T @ Xc / (n - 1)                             # 2. covariance matrix (2 x 2)
print("mean:", X.mean(axis=0).tolist(), " covariance:", C.tolist())
assert np.allclose(C, np.cov(X, rowvar=False))

lams, V = np.linalg.eigh(C)                         # 3. eigen-decompose (ascending order)
lams, V = lams[::-1], V[:, ::-1]                    # 4. sort biggest first
V = V * np.sign(V[0])                               # fix each sign so the x-part is positive
print("eigenvalues:", lams.round(4).tolist())
print("PC1 =", V[:, 0].round(3).tolist(), " PC2 =", V[:, 1].round(3).tolist())
ratio = lams / lams.sum()
print("explained variance:", " / ".join(f"{r:.0%}" for r in ratio))

z = Xc @ V[:, 0]                                    # 5. project onto PC1: 2 numbers -> 1
print("PC1 scores A..E:", z.round(3).tolist())
print(f"variance of the scores = {z.var(ddof=1):.2f} = lambda_1")
assert np.isclose(z.var(ddof=1), lams[0])

X_back = np.outer(z, V[:, 0]) + X.mean(axis=0)      # rebuild each point from its 1 number
lost = ((X - X_back) ** 2).sum()
print(f"squared error after rebuilding = {lost:.2f} = (n - 1) * lambda_2 = {(n - 1) * lams[1]:.2f}")

s = np.linalg.svd(Xc, compute_uv=False)             # the SVD route: no covariance matrix needed
print("singular values of centred X:", s.round(4).tolist(), "-> s^2/(n-1) =", (s ** 2 / (n - 1)).round(4).tolist())
assert np.allclose(s ** 2 / (n - 1), lams)

X_cm = X * [1, 100]                                 # the units trap: y in cm instead of m
l_cm, V_cm = np.linalg.eigh(np.cov(X_cm, rowvar=False))
pc1 = np.abs(V_cm[:, -1])
print(f"y in cm: PC1 = {pc1.round(3).tolist()}, explains {l_cm[-1] / l_cm.sum():.3%}")
Z = (X_cm - X_cm.mean(axis=0)) / X_cm.std(axis=0, ddof=1)       # standardise each feature
l_z = np.linalg.eigvalsh(np.cov(Z, rowvar=False))
print(f"after standardising: PC1 explains {l_z[-1] / l_z.sum():.0%}")
```

**Output:**

```
mean: [3.0, 4.0]  covariance: [[2.5, 2.25], [2.25, 2.5]]
eigenvalues: [4.75, 0.25]
PC1 = [0.707, 0.707]  PC2 = [0.707, -0.707]
explained variance: 95% / 5%
PC1 scores A..E: [-2.828, -1.414, 0.707, 0.707, 2.828]
variance of the scores = 4.75 = lambda_1
squared error after rebuilding = 1.00 = (n - 1) * lambda_2 = 1.00
singular values of centred X: [4.3589, 1.0] -> s^2/(n-1) = [4.75, 0.25]
y in cm: PC1 = [0.009, 1.0], explains 99.998%
after standardising: PC1 explains 95%
```

---

## 1.7 Scaled Dot-Product & Multi-Head Attention ★★★

![Infographic on scaled dot-product attention: Attention(Q, K, V) = softmax(Q K transpose / sqrt(d_k)) V with each symbol labelled; 3 tokens with Q = K and d_k = 4: dot products 2, 1, 1 give the score matrix 2 1 1 / 1 2 0 / 1 0 2 with a (3 x 4)(4 x 3) = (3 x 3) shape drawing; token 0 scaled to 1, 0.5, 0.5, softmax 2.718 / 6.016 = 0.452 and 1.649 / 6.016 = 0.274, a to-scale bar chart against the unscaled 0.576, 0.212, 0.212; values mixed to output 0.726, 0.548 drawn to scale inside the triangle of v0, v1, v2; table of sqrt(d_k), causal mask, 8 heads x 64, 4 x 512 squared = 1,048,576 parameters and O(n squared) cost; causal row 0.378, 0.622, 0; trap Q K transpose not Q transpose K.](diagrams/math06_info_attention_math_ai.png)

<details>
<summary><strong>Read as text</strong> — the library picture, softmax, the 3-token example, scaling, masking, heads and cost</summary>

**Simple Explanation:**
You walk into a library with a question (the **query**). Every book has a label on its spine (the **key**) and pages inside (the **value**). You compare your question with every label, give each book a relevance score, turn the scores into percentages that add up to 100%, and read that mix of pages. Self-attention does this for every token at once: each token's query is compared with every token's key, and the token's new vector is the weighted average of all the values.

> **Maths in one line:** `Attention(Q, K, V) = softmax(Q Kᵀ / √d_k) V` — score every query against every key with a dot product, scale by √d_k, turn each row of scores into weights that sum to 1, then take the weighted average of the values.

> **Official definition** (Vaswani et al., 2017, "Attention Is All You Need"): an attention function maps a query and a set of key–value pairs to an output. The output is a weighted sum of the values, where the weight of each value comes from a compatibility function of the query with that value's key.

This section is the *maths* view. How attention sits inside an LLM — the code, multi-query and grouped-query attention, FlashAttention and the modern block — is in [Ch 17 §2.4](#content/17_llm); the intuition-first walk-through is in [Ch 16 §3.3](#content/16_deep_learning).

**Softmax — turning scores into weights.** Softmax takes any list of numbers and returns positive weights that add up to 1, keeping the order (the biggest score gets the biggest weight):

$$\text{softmax}(\vec{z})_i = \frac{e^{z_i}}{\sum_j e^{z_j}}$$

For $\vec{z} = [2, 1, 0]$: $e^2 = 7.389$, $e^1 = 2.718$, $e^0 = 1$, which add up to $11.107$, so the weights are $[0.665, 0.245, 0.090]$. Adding the same number to every score changes nothing (it cancels in the fraction) — which is why code subtracts the largest score first to avoid overflow (§6.2). Dividing the scores by a *temperature* before the softmax makes the weights flatter or sharper ([Ch 17 §2.6](#content/17_llm)); the full treatment with a program is in [Ch 17 §1.4](#content/17_llm).

**Scaled dot-product attention:**

$$\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^T}{\sqrt{d_k}}\right) V$$

**Q / K / V — what they are:**

| Matrix | Stands for | Role |
|--------|-----------|------|
| $Q$ | Queries | "What am I looking for?" — the current token asking a question |
| $K$ | Keys | "What do I contain?" — every token advertising its content |
| $V$ | Values | "What should I return?" — the actual information to aggregate |

Stack the $n$ input tokens as the rows of $X$ ($n \times d_\text{model}$). Three learned matrices project it: $Q = XW^Q$, $K = XW^K$, $V = XW^V$, giving $Q, K \in \mathbb{R}^{n \times d_k}$ and $V \in \mathbb{R}^{n \times d_v}$. In **self**-attention all three come from the same $X$; in **cross**-attention the queries come from one sequence (the decoder) and the keys and values from another (the encoder).

**Worked example — 3 tokens by hand.** This is the same toy as [Ch 17 §2.4](#content/17_llm), so you can cross-check. To keep the numbers small, skip the projections and take $Q = K$, with $d_k = 4$ and $d_v = 2$:

| Token | $Q = K$ (4 numbers) | $V$ (2 numbers) |
|---|---|---|
| 0 | [1, 1, 0, 0] | [1, 0] |
| 1 | [0, 1, 1, 0] | [0, 1] |
| 2 | [1, 0, 0, 1] | [1, 1] |

1. **Score.** $QK^T$ is $(3 \times 4)(4 \times 3) = 3 \times 3$ — every query dotted with every key: $\begin{pmatrix} 2 & 1 & 1 \\ 1 & 2 & 0 \\ 1 & 0 & 2 \end{pmatrix}$.
2. **Scale.** Divide by $\sqrt{d_k} = \sqrt{4} = 2$. Token 0's row becomes $[1, 0.5, 0.5]$.
3. **Softmax each row.** $e^1 = 2.718$ and $e^{0.5} = 1.649$ (twice) add up to $6.016$, so token 0's weights are $[0.452, 0.274, 0.274]$.
4. **Mix the values.** $0.452 \cdot [1, 0] + 0.274 \cdot [0, 1] + 0.274 \cdot [1, 1] = [0.726, 0.548]$. The output is $3 \times 2$: one new vector per token.

Skip step 2 and token 0's weights are $\text{softmax}([2, 1, 1]) = [0.576, 0.212, 0.212]$ — already peakier, and it gets much worse as $d_k$ grows.

**Why divide by $\sqrt{d_k}$:**

If the entries of a query and a key are independent with mean 0 and variance 1, each product $q_i k_i$ has variance 1, so their sum $\vec{q} \cdot \vec{k}$ has variance $d_k$ — a spread of about $\pm\sqrt{d_k}$, which is $\pm 8$ at the common $d_k = 64$. Softmax of numbers that far apart is almost one-hot, and an almost one-hot softmax has gradients near zero, so learning slows to a crawl. Dividing by $\sqrt{d_k}$ brings the variance back to 1. Newer models add a second guard, **QK-norm** — normalizing every query and key before the dot product (Gemma 3, Qwen3, OLMo 2; see [Ch 17 §2.4](#content/17_llm)).

**Causal vs bidirectional masking:**

In causal (decoder-only) attention, the upper triangle of the $n \times n$ score matrix is set to $-\infty$ before softmax, so each position can only attend to itself and earlier positions; bidirectional (encoder) attention uses no mask and every position attends to all others. In the example, token 1 keeps the scaled scores $[0.5, 1.0]$ and loses the third, so its weights become $[0.378, 0.622, 0]$. Mask *before* the softmax, never after — otherwise the surviving weights no longer add up to 1.

**Multi-head attention:**

Rather than running one attention function, $h$ separate heads each learn different projections:

$$\text{head}_i = \text{Attention}(QW_i^Q,\; KW_i^K,\; VW_i^V)$$

$$\text{MultiHead}(Q,K,V) = \text{Concat}(\text{head}_1, \ldots, \text{head}_h)\,W^O$$

where $W_i^Q, W_i^K \in \mathbb{R}^{d_\text{model} \times d_k}$, $W_i^V \in \mathbb{R}^{d_\text{model} \times d_v}$ and $W^O \in \mathbb{R}^{hd_v \times d_\text{model}}$. (In this formula from the original paper, $Q$, $K$ and $V$ are the layer's inputs — all equal to $X$ in self-attention.) Different heads are free to learn different patterns — studies of trained models find heads that track the previous token, syntax or coreference, though no single role is guaranteed. The heads run in parallel and their outputs are concatenated then projected back.

**Worked shape example** ($d_\text{model} = 512$, $h = 8$):

```
d_k = d_v = d_model / h = 512 / 8 = 64

Per head:
  Q_i : (n × 512) × (512 × 64) → (n × 64)
  K_i : (n × 64)   [same]
  V_i : (n × 64)   [same]

  Score matrix : (n × 64) × (64 × n) = (n × n)
  After softmax+V: (n × 64)

After concat (8 heads):
  (n × 64) × 8 = (n × 512)

After W^O (512 × 512):
  (n × 512)    ← same shape as input, easy to stack layers

Parameters: W^Q, W^K, W^V, W^O are each 512 × 512 in total
  4 × 512² = 1,048,576 (no biases) — the same for any number of heads
```

Compute cost is $O(n^2 d_k)$ per head, $O(n^2 d_\text{model})$ for all heads together, and the $n \times n$ score matrix takes $O(n^2)$ memory — double the context and this part costs four times as much. That quadratic term is why long context is expensive, and why sliding-window attention (Mistral 7B, Gemma 2 and 3), linear-attention and state-space layers (Mamba-2, Gated DeltaNet — usually mixed with a few full-attention layers) and FlashAttention exist — see [Ch 17 §2.4](#content/17_llm) and [Ch 16 §6.2](#content/16_deep_learning).

</details>

**Run it** — the 3-token example one matrix step at a time, the causal mask, the $\sqrt{d_k}$ variance, and the multi-head shapes:

```python
# Scaled dot-product attention on 3 tokens, one matrix step at a time (same toy as Ch 17 section 2.4)
import numpy as np

def softmax(z):                                     # row-wise; subtracting the row max changes nothing
    e = np.exp(z - z.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

print("softmax([2, 1, 0]) =", softmax(np.array([2.0, 1.0, 0.0])).round(3).tolist())

Q = K = np.array([[1, 1, 0, 0], [0, 1, 1, 0], [1, 0, 0, 1]], dtype=float)   # 3 tokens, d_k = 4
V = np.array([[1, 0], [0, 1], [1, 1]], dtype=float)                          # d_v = 2
d_k = Q.shape[1]

S = Q @ K.T                                         # (3 x 4)(4 x 3) -> 3 x 3 scores
print("Q K^T =", S.astype(int).tolist())
W = softmax(S / np.sqrt(d_k))                       # scale by sqrt(4) = 2, then softmax each row
print("weights:", W.round(3).tolist())
assert np.allclose(W.sum(axis=1), 1)                # every row is a probability distribution
out = W @ V                                         # (3 x 3)(3 x 2) -> 3 x 2
print("output: ", out.round(3).tolist())
print("token 0 without the scaling:", softmax(S[0]).round(3).tolist())

future = np.triu(np.ones((3, 3), dtype=bool), k=1)  # True above the diagonal = a later token
Wc = softmax(np.where(future, -np.inf, S / np.sqrt(d_k)))
print("causal weights:", Wc.round(3).tolist())
assert np.all(Wc[future] == 0) and np.allclose(Wc.sum(axis=1), 1)

rng = np.random.default_rng(0)                      # why sqrt(d_k): var(q.k) = d_k
for d in [4, 64, 512]:
    q, k = rng.standard_normal((10000, d)), rng.standard_normal((10000, d))
    s = (q * k).sum(axis=1)
    print(f"d_k = {d:3d}: var(q.k) = {s.var():6.1f}, var(q.k / sqrt(d_k)) = {(s / np.sqrt(d)).var():.2f}")

n, d_model, h = 3, 512, 8                           # multi-head shapes: 8 heads of d_k = 64
X = np.zeros((n, d_model))
heads = X.reshape(n, h, d_model // h).transpose(1, 0, 2)   # (h, n, d_k)
scores = heads @ heads.transpose(0, 2, 1)                  # (h, n, n): one score matrix per head
print("X", X.shape, "-> heads", heads.shape, "-> scores", scores.shape)
print(f"W_Q, W_K, W_V, W_O: 4 x {d_model}^2 = {4 * d_model ** 2:,} parameters")
```

**Output:**

```
softmax([2, 1, 0]) = [0.665, 0.245, 0.09]
Q K^T = [[2, 1, 1], [1, 2, 0], [1, 0, 2]]
weights: [[0.452, 0.274, 0.274], [0.307, 0.506, 0.186], [0.307, 0.186, 0.506]]
output:  [[0.726, 0.548], [0.494, 0.693], [0.814, 0.693]]
token 0 without the scaling: [0.576, 0.212, 0.212]
causal weights: [[1.0, 0.0, 0.0], [0.378, 0.622, 0.0], [0.307, 0.186, 0.506]]
d_k =   4: var(q.k) =    4.0, var(q.k / sqrt(d_k)) = 1.00
d_k =  64: var(q.k) =   65.3, var(q.k / sqrt(d_k)) = 1.02
d_k = 512: var(q.k) =  509.7, var(q.k / sqrt(d_k)) = 1.00
X (3, 512) -> heads (8, 3, 64) -> scores (8, 3, 3)
W_Q, W_K, W_V, W_O: 4 x 512^2 = 1,048,576 parameters
```

---

# PART 2: CALCULUS — HOW MODELS LEARN ★★

> Calculus answers one question: "If I change this setting a tiny bit, how much does the result change?"
> This is how models figure out which way to adjust their settings to get better.

**The path through this part:** one slope (§2.1) → many dials (§2.2) → a chain of steps (§2.3) → the downhill direction (§2.4) → the shape of the ground (§2.5) → all of it inside a tiny network (§2.6). This is the maths view with tiny numbers. The applied home of backpropagation is [Ch 14 §14.5](#content/14_neural_networks); [Ch 16 §1.1](#content/16_deep_learning) adds the computational graph and what a backward pass costs.

---

## 2.1 Derivatives — The Rate of Change ★★

![Infographic on derivatives: f prime of x = the limit as h goes to 0 of (f(x + h) - f(x)) / h, and f(x + h) is about f(x) + f prime of x times h, with each symbol labelled; where 2x comes from for x squared, with f prime of 3 = 6, of 0 = 0 and of -1 = -2 shown as tangent lines on a to-scale parabola; checking by nudging with h = 0.1: central (9.61 - 8.41) / 0.2 = 6.0 versus one-sided 6.1, and the error table for x cubed at x = 2; partial derivatives of x squared + 3xy + y squared at (1, 2): 8 and 7, a 0.01 nudge gives about 0.08 (exactly 0.0801); a table of common derivatives incl. sigmoid and ReLU; the trap that a gradient check is a test, not a training method.](diagrams/math06_info_derivatives_ai.png)

<details>
<summary><strong>Read as text</strong> — the speedometer, the limit, where 2x comes from and the derivative cheat sheet</summary>

**Simple Explanation:**
You're in a car. The **speedometer** shows your derivative — how fast your position is changing.

- Position = where you are (the function)
- Speed = how fast position changes (the derivative)
- Acceleration = how fast speed changes (the second derivative)

A derivative tells you: "If I nudge the input a tiny bit, how much does the output move — and which way?"

| The derivative is… | What a small nudge to the input does |
|---|---|
| Big (say 6) | Moves the output a lot — about 6 × the nudge |
| Zero | Nothing — you're at a flat spot (a peak, a valley or a plateau) |
| Negative (say −2) | Moves the output the OTHER way — nudge up, output goes down |

> **Official Definition:** The derivative of $f$ at $x$ is the limit of the slope between two nearby points as the gap $h$ between them shrinks to zero. If the limit exists, $f$ is *differentiable* at $x$.

$$f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$

> **Maths in one line:** $f(x+h) \approx f(x) + f'(x)\,h$ — for a small nudge $h$, the output moves by about slope × nudge.

**The basic idea — where $2x$ comes from:**

$$f(x) = x^2: \qquad \frac{(x+h)^2 - x^2}{h} = \frac{2xh + h^2}{h} = 2x + h \;\xrightarrow{\ h \to 0\ }\; f'(x) = 2x$$

At $x=3$: $f'(3) = 6$ — the curve is going UP steeply (slope of 6).

At $x=0$: $f'(0) = 0$ — the curve is FLAT (the bottom of the bowl!).

At $x=-1$: $f'(-1) = -2$ — the curve is going DOWN as $x$ grows.

**Common Derivatives (cheat sheet):**

| Function | Derivative | Why |
|----------|-----------|-----|
| $f(x) = 5$ (constant) | $f'(x) = 0$ | Flat line — never changes |
| $f(x) = x$ | $f'(x) = 1$ | Straight line — constant slope |
| $f(x) = x^2$ | $f'(x) = 2x$ | Parabola |
| $f(x) = x^n$ | $f'(x) = n \cdot x^{n-1}$ | Power rule — the most useful! |
| $f(x) = e^x$ | $f'(x) = e^x$ | e is special — its own derivative! |
| $f(x) = \ln(x)$ | $f'(x) = \frac{1}{x}$ | Natural log (for $x > 0$) |
| $\sigma(x) = \frac{1}{1+e^{-x}}$ (sigmoid) | $\sigma'(x) = \sigma(x)\,(1-\sigma(x))$ | Largest at $x = 0$: $0.5 \times 0.5 = 0.25$ |
| $\text{ReLU}(x) = \max(0, x)$ | $1$ for $x > 0$, $0$ for $x < 0$ | A kink at 0 — frameworks use 0 there |

The activation functions themselves are taught in [Ch 14 §14.3](#content/14_neural_networks).

**Rules for combining:**

| Rule | Formula | In plain English |
|------|---------|-----------------|
| Sum rule | $(f + g)' = f' + g'$ | Just add the derivatives |
| Product rule | $(f \cdot g)' = f'g + fg'$ | (derivative of the first) × second + first × (derivative of the second) |
| Chain rule | $(f(g(x)))' = f'(g(x)) \cdot g'(x)$ | Outside derivative (at the inside value) × inside derivative — multiply the effects along the chain (MOST IMPORTANT for ML!) |

**Examples:**

$$f(x) = 3x^2 + 5x - 7 \quad \Rightarrow \quad f'(x) = 6x + 5, \qquad f'(1) = 11$$

$$f(x) = (3x+1)^2 \quad \Rightarrow \quad f'(x) = 2(3x+1) \cdot 3 = 6(3x+1), \qquad f'(2) = 42$$

The second one is the chain rule at work — you will meet this 42 again in §2.3.

> Derivatives tell the model which direction to adjust each weight to reduce the error. That's the heart of all ML training.

```chart
{
  "type": "line",
  "data": {
    "labels": [-3,-2.5,-2,-1.5,-1,-0.5,0,0.5,1,1.5,2,2.5,3],
    "datasets": [
      {
        "label": "f(x) = x²",
        "data": [9,6.25,4,2.25,1,0.25,0,0.25,1,2.25,4,6.25,9],
        "borderColor": "rgba(99, 102, 241, 1)",
        "backgroundColor": "rgba(99, 102, 241, 0.1)",
        "fill": true,
        "tension": 0.4,
        "pointRadius": 0
      },
      {
        "label": "f'(x) = 2x (derivative)",
        "data": [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6],
        "borderColor": "rgba(234, 88, 12, 1)",
        "borderDash": [5,5],
        "fill": false,
        "tension": 0,
        "pointRadius": 0
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Function f(x) = x² and its Derivative f'(x) = 2x" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Value" }, "min": -7, "max": 10 },
      "x": { "title": { "display": true, "text": "x" } }
    }
  }
}
```

</details>

### Check a Derivative by Nudging (Numerical Differentiation)

<details>
<summary><strong>Read as text</strong> — nudging both ways vs one way on x² at x = 3</summary>

**Simple Explanation:**
You don't have to trust the rules. Nudge $x$ a little to the right and a little to the left, see how far $f$ moved, and divide by the distance. If that measured slope matches your formula, the formula is right. This is exactly how engineers test hand-written gradient code — a **gradient check** (§2.6).

> **Maths in one line:** $f'(x) \approx \dfrac{f(x+h) - f(x-h)}{2h}$ — the *central difference*: nudge both ways and divide by the total gap $2h$. Its error shrinks like $h^2$; the one-sided version $\frac{f(x+h) - f(x)}{h}$ only shrinks like $h$.

**Step-by-Step Example:** $f(x) = x^2$ at $x = 3$, with $h = 0.1$:

$$\text{central: } \frac{3.1^2 - 2.9^2}{0.2} = \frac{9.61 - 8.41}{0.2} = 6.0 \qquad \text{one-sided: } \frac{3.1^2 - 3^2}{0.1} = \frac{9.61 - 9}{0.1} = 6.1$$

The central difference is exact for any parabola; the one-sided one is off by exactly $h = 0.1$.

</details>

```python
# Numerical vs analytic derivative: nudge x by h, measure the slope, compare it with the rule
def f(x):
    return x ** 2                          # the chapter's bowl: f'(x) = 2x

def g(x):
    return 3 * x ** 2 + 5 * x - 7          # the chapter's example: g'(x) = 6x + 5

def cube(x):
    return x ** 3                          # contrast: cube'(x) = 3x^2, so cube'(2) = 12

def forward_diff(fn, x, h):
    return (fn(x + h) - fn(x)) / h             # one-sided nudge: error shrinks like h

def central_diff(fn, x, h):
    return (fn(x + h) - fn(x - h)) / (2 * h)   # two-sided nudge: error shrinks like h^2

# 1. The chapter's numbers: f'(3) = 6 and g'(1) = 11
print(f"f'(3): rule = {2 * 3}, nudging gives {central_diff(f, 3.0, 1e-5):.6f}")
print(f"g'(1): rule = {6 * 1 + 5}, nudging gives {central_diff(g, 1.0, 1e-5):.6f}")
assert abs(central_diff(g, 1.0, 1e-5) - 11) < 1e-6

# 2. Error vs nudge size h: forward error = h for x^2, central is exact for any parabola
print("\n            x^2 at x=3 (true 6)      x^3 at x=2 (true 12)")
print("h           forward    central       forward    central")
for h in [0.1, 0.01, 0.001]:
    ef, ec = abs(forward_diff(f, 3.0, h) - 6), abs(central_diff(f, 3.0, h) - 6)
    cf, cc = abs(forward_diff(cube, 2.0, h) - 12), abs(central_diff(cube, 2.0, h) - 12)
    print(f"{h:<10}  {ef:.6f}   {ec:.1e}       {cf:.6f}   {cc:.6f}")

# 3. Too small a nudge: rounding noise takes over (float64 keeps about 16 digits)
for h in [1e-5, 1e-9, 1e-13]:
    err = abs(central_diff(cube, 2.0, h) - 12)
    print(f"h = {h:.0e}: central error {err:.1e}")
```

**Output:**

```
f'(3): rule = 6, nudging gives 6.000000
g'(1): rule = 11, nudging gives 11.000000

            x^2 at x=3 (true 6)      x^3 at x=2 (true 12)
h           forward    central       forward    central
0.1         0.100000   5.3e-15       0.610000   0.010000
0.01        0.010000   1.3e-13       0.060100   0.000100
0.001       0.001000   6.6e-13       0.006001   0.000001
h = 1e-05: central error 2.1e-10
h = 1e-09: central error 9.9e-07
h = 1e-13: central error 9.6e-03
```

<details>
<summary><strong>Read as text</strong> — continued: error shrinking like h vs h², the rounding floor and why a gradient check is only a test</summary>

**Reading the output:** for $x^3$, the one-sided error falls 10× each time $h$ falls 10× (error ∝ $h$), while the central error falls 100× (∝ $h^2$). For the parabola $x^2$ the central difference is exact — what is left is rounding noise around $10^{-13}$. Don't push $h$ too small: at $h = 10^{-13}$ the two nearly equal values of $f$ cancel and rounding noise takes over (error about 0.01). With 64-bit floats use $h$ around $10^{-5}$ to $10^{-6}$ — PyTorch's `torch.autograd.gradcheck` defaults to $10^{-6}$ and expects double precision. A check costs two evaluations per input, so it is a test, never a way to train ([Ch 16 §1.1](#content/16_deep_learning)).

</details>

---

## 2.2 Partial Derivatives — Multiple Variables

<details>
<summary><strong>Read as text</strong> — the two-dial thermostat, ∂f/∂x = 8 and ∂f/∂y = 7 at (1, 2), and one partial derivative per weight</summary>

**Simple Explanation:**
Imagine a thermostat that depends on TWO dials: one for the heater and one for the air conditioner. A partial derivative asks: "If I turn JUST the heater dial a tiny bit (keeping the AC fixed), how much does the temperature change?"

In ML, the "temperature" is the loss (error), and the "dials" are the model's weights. There might be billions of dials! A partial derivative tells you what happens when you turn just ONE dial.

> **Official Definition:** The partial derivative $\frac{\partial f}{\partial x}$ is the ordinary derivative of $f$ with respect to $x$ while every other input is held fixed: $\frac{\partial f}{\partial x} = \lim_{h \to 0} \frac{f(x+h,\ y) - f(x,\ y)}{h}$.

> **Maths in one line:** $\Delta f \approx \frac{\partial f}{\partial x}\,\Delta x + \frac{\partial f}{\partial y}\,\Delta y$ — small turns of several dials add up, each weighted by its own partial derivative.

**Formula:**

Given $f(x, y) = x^2 + 3xy + y^2$:

$$\frac{\partial f}{\partial x} = 2x + 3y \qquad \frac{\partial f}{\partial y} = 3x + 2y$$

> **In plain English:** The $\partial$ symbol means "partial" — change one variable while pretending the others are frozen. For $\frac{\partial}{\partial x}$ of $3xy$, the frozen $y$ acts like a number, so $3y \cdot x$ has slope $3y$.

**Step-by-Step Example:** At point $(x=1,\ y=2)$, where $f(1, 2) = 1 + 6 + 4 = 11$:

$$\frac{\partial f}{\partial x} = 2(1) + 3(2) = 8 \qquad \frac{\partial f}{\partial y} = 3(1) + 2(2) = 7$$

So nudging $x$ by $0.01$ (with $y$ frozen) raises $f$ by about $8 \times 0.01 = 0.08$ — the exact change is $f(1.01, 2) - f(1, 2) = 0.0801$. Nudging $y$ by $0.01$ instead raises it by about $0.07$.

**ML Connection:**

Loss $L$ depends on ALL weights $(w_1, w_2, \ldots, w_n)$.

$\frac{\partial L}{\partial w_3}$ = "How much does the loss change if I adjust just $w_3$?"

GPT-3 (2020) has 175 billion weights; Meta's open-weight Llama 3.1 405B (July 2024) has 405 billion. Training needs one partial derivative per weight at every step — §2.6 shows how ONE backward pass gets all of them at once, instead of nudging each weight separately.

</details>

---

## 2.3 The Chain Rule — The Engine of Backpropagation

![Infographic on the chain rule: dL/dx = dL/db times db/da times da/dx with each factor labelled; forward pass x = 2, a = 3x + 1 = 7, b = a squared = 49, L = b - 50 = -1 with local slopes 3, 14, 1 on a chain drawing with forward and backward arrows; backward pass 1, 14, 42; a nudge of 0.01 predicts 0.42 versus 0.4209 actual, and a to-scale plot from x = 2 to 3 showing the tangent reaching 41 while L reaches 50 (gap 9 = 9 dx squared); split paths u = 3x and v = x squared add to 3 + 4 = 7; where ML uses it; the trap of forgetting to add paths.](diagrams/math06_info_chain_rule_ai.png)

<details>
<summary><strong>Read as text</strong> — the domino chain, the formula, the backward pass 1 → 14 → 42 and adding split paths</summary>

**Simple Explanation:**
Imagine a chain of dominoes: Push domino A, which hits B, which hits C, which hits D.

If pushing A makes B move 3× as far, and B makes C move 2× as far, and C makes D move 5× as far... then pushing A makes D move $3 \times 2 \times 5 = 30\times$ as far.

That's the chain rule! To find how the beginning affects the end, multiply all the "effects" along the chain.

A neural network IS a chain of layers. The chain rule lets you figure out how changing a weight in the first layer affects the final output.

> **Official Definition:** If $u = g(x)$ is differentiable at $x$ and $f$ is differentiable at $u$, then $y = f(g(x))$ is differentiable at $x$ and $\frac{dy}{dx} = f'(g(x))\, g'(x)$. When $x$ reaches the output along several paths, the multivariable chain rule **adds** the products from each path.

> **Maths in one line:** $\frac{dL}{dx} = \frac{dL}{db} \cdot \frac{db}{da} \cdot \frac{da}{dx}$ — multiply the local slopes along a path; add across paths.

**Formula:**

If $y = f(g(x))$, then:

$$\frac{dy}{dx} = \frac{dy}{dg} \times \frac{dg}{dx}$$

> **In plain English:** "Multiply the effects along the chain."

**Neural network example:**

$$x \rightarrow \boxed{\text{layer 1}} \rightarrow a \rightarrow \boxed{\text{layer 2}} \rightarrow b \rightarrow \boxed{\text{loss}} \rightarrow L$$

$$\frac{dL}{dx} = \frac{dL}{db} \times \frac{db}{da} \times \frac{da}{dx}$$

> Each factor is a local effect. Multiply them all = total effect.

In a real network you want $\frac{dL}{dw}$ for each weight rather than $\frac{dL}{dx}$, but it is the same chain — only the last factor changes ($\frac{\partial a}{\partial w}$ instead of $\frac{da}{dx}$). §2.6 does exactly that.

**This IS backpropagation:**

**Forward pass:** $x \rightarrow a \rightarrow b \rightarrow L$

**Backward pass:** $\frac{dL}{dL}=1 \rightarrow \frac{dL}{db} \rightarrow \frac{dL}{da} \rightarrow \frac{dL}{dx}$

Each layer computes its local derivative and passes it backward. That's why it's called "BACK-propagation" — chain rule going backwards.

**Numerical Example:**

Input $x = 2$

| Step | Computation | Local derivative |
|------|------------|------------------|
| Layer 1 | $a = 3x + 1 = 7$ | $\frac{da}{dx} = 3$ |
| Layer 2 | $b = a^2 = 49$ | $\frac{db}{da} = 2a = 14$ |
| Loss | $L = b - 50 = -1$ | $\frac{dL}{db} = 1$ |

(A toy last step: a real loss is never negative — §2.6 uses a squared error.)

Backprop (chain rule, going backwards):

$$\frac{dL}{db} = 1$$

$$\frac{dL}{da} = \frac{dL}{db} \times \frac{db}{da} = 1 \times 14 = 14$$

$$\frac{dL}{dx} = \frac{dL}{da} \times \frac{da}{dx} = 14 \times 3 = 42$$

Meaning: if $x$ increases by $0.01$, $L$ increases by about $42 \times 0.01 = 0.42$ (exactly $0.4209$ — a derivative is a straight-line prediction, accurate only for small nudges).

**When paths split, add them.** Suppose $x$ feeds two places, $u = 3x$ and $v = x^2$, and $L = u + v$. Then

$$\frac{dL}{dx} = \underbrace{1 \cdot 3}_{\text{via } u} + \underbrace{1 \cdot 2x}_{\text{via } v} = 3 + 4 = 7 \quad \text{at } x = 2$$

Check: $L = 3x + x^2$, so $L' = 3 + 2x = 7$. Forgetting this sum is the classic hand-derivation bug ([Ch 16 §1.1](#content/16_deep_learning) shows it inside a network).

</details>

```python
# Chain rule on the chapter's chain x -> a = 3x + 1 -> b = a^2 -> L = b - 50: multiply local slopes, then check by nudging
x = 2.0
a = 3 * x + 1                      # layer 1
b = a ** 2                         # layer 2
L = b - 50                         # final step
print(f"forward:  a = {a:g}, b = {b:g}, L = {L:g}")

da_dx, db_da, dL_db = 3.0, 2 * a, 1.0   # each step's local derivative
dL_da = dL_db * db_da                   # walk BACKWARDS, multiplying as you go
dL_dx = dL_da * da_dx
print(f"local:    da/dx = {da_dx:g}, db/da = {db_da:g}, dL/db = {dL_db:g}")
print(f"backward: dL/db = {dL_db:g} -> dL/da = {dL_da:g} -> dL/dx = {dL_dx:g}")

def chain(x):
    return (3 * x + 1) ** 2 - 50

h = 1e-5
numeric = (chain(x + h) - chain(x - h)) / (2 * h)
print(f"check by nudging x: {numeric:.6f}")
assert abs(numeric - dL_dx) < 1e-6

# The derivative predicts the change only for SMALL nudges (here the gap is exactly 9 * dx^2)
for dx in [0.01, 0.1, 1.0]:
    actual = chain(x + dx) - chain(x)
    print(f"x + {dx:<4}  predicted {dL_dx * dx:7.4f}   actual {actual:7.4f}   gap {actual - dL_dx * dx:.4f}")
```

**Output:**

```
forward:  a = 7, b = 49, L = -1
local:    da/dx = 3, db/da = 14, dL/db = 1
backward: dL/db = 1 -> dL/da = 14 -> dL/dx = 42
check by nudging x: 42.000000
x + 0.01  predicted  0.4200   actual  0.4209   gap 0.0009
x + 0.1   predicted  4.2000   actual  4.2900   gap 0.0900
x + 1.0   predicted 42.0000   actual 51.0000   gap 9.0000
```

<details>
<summary><strong>Read as text</strong> — continued: the 9·dx² gap and why training takes small steps</summary>

The gap between prediction and reality is exactly $9\,(dx)^2$: tiny for small nudges, huge for big ones. That is why training takes many small steps instead of one giant jump.

</details>

---

## 2.4 Gradients — The Direction to Walk ★★★

![Infographic on gradients and gradient descent: theta_new = theta_old - lr times the gradient of L, and the gradient = the list of partial derivatives, each symbol labelled; for the bowl f = x squared + y squared at (3, 4) the gradient is (6, 8) with length sqrt(100) = 10, drawn to scale on contour circles with uphill and downhill arrows; one step with lr = 0.1 moves to (2.4, 3.2) and the loss falls 25 to 16, with the to-scale descent path toward the minimum (0, 0); each step multiplies the loss by 0.64 so 25 x 0.64 to the 10th = 0.29; mini plots for lr 0.1 (converges to 0.29), 1.0 (bounces at 25) and 1.1 (diverges to 958.44); where ML uses it; the trap that the gradient points uphill.](diagrams/math06_info_gradient_descent_ai.png)

<details>
<summary><strong>Read as text</strong> — the blindfolded walker, ∇f = [6, 8] at (3, 4) and one step from loss 25 to 16</summary>

**Simple Explanation:**
You're blindfolded on a hilly field and want to find the lowest valley. You can feel the ground under your feet and tell which direction is downhill.

The **gradient** is an arrow that points in the direction of steepest UPHILL, and its length tells you how steep that is. To go downhill (reduce the loss), walk in the OPPOSITE direction of the gradient.

> **Official Definition:** The gradient of $f: \mathbb{R}^n \to \mathbb{R}$ at a point is the vector of its partial derivatives, $\nabla f = \left[\frac{\partial f}{\partial x_1}, \ldots, \frac{\partial f}{\partial x_n}\right]$. The slope in a unit direction $u$ is $\nabla f \cdot u$; it is largest when $u$ points along $\nabla f$ (slope $= \lVert \nabla f \rVert$), so $-\nabla f$ is the direction of steepest descent.

> **Maths in one line:** $\theta_{\text{new}} = \theta_{\text{old}} - \text{lr} \times \nabla L$ — step against the gradient of the loss; the learning rate (lr) sets the step size.

**Formula:**

The gradient = a vector of ALL partial derivatives:

$$\nabla f = \left[ \frac{\partial f}{\partial x_1},\ \frac{\partial f}{\partial x_2},\ \ldots \right]$$

> **In plain English:** "Compute the partial derivative for every single variable, and put them all in a list. That list points uphill."

**Step-by-Step Example:**

For $f(x, y) = x^2 + y^2$:

$$\nabla f = [2x,\ 2y]$$

At point $(3, 4)$: $\nabla f = [6, 8]$ — uphill is this way! Its length is $\sqrt{6^2 + 8^2} = 10$: the steepest slope you can find at $(3, 4)$.

To go DOWNHILL: walk in direction $[-6, -8]$.

**Gradient Descent (how models learn):**

$$\theta_{\text{new}} = \theta_{\text{old}} - \text{lr} \times \nabla f$$

> **In plain English:** "Take a step downhill, and the learning rate controls how big the step is."

With $\text{lr} = 0.1$:

$$\begin{aligned}
x_{\text{new}} &= 3 - 0.1 \times 6 = 2.4 \\
y_{\text{new}} &= 4 - 0.1 \times 8 = 3.2
\end{aligned}$$

$$f(3, 4) = 9 + 16 = 25 \quad \rightarrow \quad f(2.4, 3.2) = 5.76 + 10.24 = 16.0$$

Loss decreased from 25 to 16! Each step multiplies both coordinates by $1 - 2 \times 0.1 = 0.8$, so it multiplies the loss by $0.8^2 = 0.64$: after $k$ steps $f = 25 \times 0.64^k$, which is $0.29$ after 10 steps (the chart). Real losses are not perfect bowls, so training takes thousands to millions of steps.

```chart
{
  "type": "line",
  "data": {
    "labels": ["Step 0","Step 1","Step 2","Step 3","Step 4","Step 5","Step 6","Step 7","Step 8","Step 9","Step 10"],
    "datasets": [{
      "label": "f(x,y) = x² + y² (Loss)",
      "data": [25.0, 16.0, 10.24, 6.55, 4.19, 2.68, 1.72, 1.10, 0.70, 0.45, 0.29],
      "borderColor": "rgba(239, 68, 68, 1)",
      "backgroundColor": "rgba(239, 68, 68, 0.1)",
      "fill": true,
      "tension": 0.3,
      "pointRadius": 4
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Gradient Descent in Action — Loss Shrinks Each Step (lr = 0.1)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Loss" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "Step" } }
    }
  }
}
```

The program below measures the gradients of §2.2 and §2.4 by nudging (no formula needed), then runs ten steps with three learning rates:

</details>

```python
# Gradient by nudging one input at a time, then gradient descent on the bowl f(x, y) = x^2 + y^2
import numpy as np

def numerical_gradient(f, p, h=1e-6):
    grad = np.zeros_like(p)
    for i in range(len(p)):                 # one partial derivative per input
        e = np.zeros_like(p)
        e[i] = h
        grad[i] = (f(p + e) - f(p - e)) / (2 * h)
    return grad

f_22 = lambda p: p[0] ** 2 + 3 * p[0] * p[1] + p[1] ** 2     # the function from 2.2
bowl = lambda p: p[0] ** 2 + p[1] ** 2                        # the bowl from 2.4

g = numerical_gradient(f_22, np.array([1.0, 2.0]))
print(f"2.2 at (1, 2): gradient = [{g[0]:.4f}, {g[1]:.4f}]   (rule: [2x + 3y, 3x + 2y] = [8, 7])")
g = numerical_gradient(bowl, np.array([3.0, 4.0]))
print(f"2.4 at (3, 4): gradient = [{g[0]:.4f}, {g[1]:.4f}], length {np.linalg.norm(g):.4f}  (rule: [2x, 2y] = [6, 8])")
assert np.allclose(g, [6, 8], atol=1e-6)

# Gradient descent: p_new = p - lr * gradient, ten steps from (3, 4)
for lr in [0.1, 1.0, 1.1]:
    p = np.array([3.0, 4.0])
    losses = [bowl(p)]
    for step in range(10):
        p = p - lr * np.array([2 * p[0], 2 * p[1]])
        losses.append(bowl(p))
    shown = ", ".join(f"{v:.2f}" for v in losses[:4])
    print(f"lr = {lr}: loss {shown}, ... step 10: {losses[-1]:.2f}")
    if lr == 0.1:
        assert abs(losses[1] - 16.0) < 1e-12 and abs(losses[10] - 25 * 0.64 ** 10) < 1e-9
```

**Output:**

```
2.2 at (1, 2): gradient = [8.0000, 7.0000]   (rule: [2x + 3y, 3x + 2y] = [8, 7])
2.4 at (3, 4): gradient = [6.0000, 8.0000], length 10.0000  (rule: [2x, 2y] = [6, 8])
lr = 0.1: loss 25.00, 16.00, 10.24, 6.55, ... step 10: 0.29
lr = 1.0: loss 25.00, 25.00, 25.00, 25.00, ... step 10: 25.00
lr = 1.1: loss 25.00, 36.00, 51.84, 74.65, ... step 10: 958.44
```

<details>
<summary><strong>Read as text</strong> — continued: lr 0.1 converges, 1.0 bounces, 1.1 diverges</summary>

With $\text{lr} = 0.1$ the loss shrinks smoothly (the chart). With $\text{lr} = 1.0$ each step jumps from $(3, 4)$ to $(-3, -4)$ and back, forever. With $\text{lr} = 1.1$ every jump overshoots further and the loss grows 1.44× per step. On this bowl each step multiplies the position by $1 - 2\,\text{lr}$, so any lr between 0 and 1 converges. Picking and scheduling the learning rate: §4.2; SGD vs mini-batches: §4.1; momentum and Adam: §4.3–§4.4.

</details>

---

## 2.5 Jacobian and Hessian

![Infographic on the Jacobian and Hessian: the second-order Taylor formula f(theta + delta) approx f(theta) + gradient dot delta + one half delta-transpose H delta with each symbol labelled; the Jacobian of f1 = x squared + y and f2 = xy at (3, 4) is 6, 1 over 4, 3 and the vector-Jacobian product with v = (1, 1) gives (10, 4), the gradient that backprop uses; the Hessian of x squared + 3xy + 2y squared is 2, 3 over 3, 4 with det -1 and eigenvalues 6.162 and -0.162, a saddle (f(1, 0) = 1 uphill, f(1, -0.72) = -0.1232 downhill), with bowl, hilltop and saddle surfaces; a to-scale contour plot of the bowl x squared + y squared where one Newton step goes from (3, 4) to (0, 0) and one gradient-descent step with lr 0.1 only reaches (2.4, 3.2); where ML uses VJP, JVP, Hessian eigenvalues, Hessian-vector products, Sophia and Shampoo/SOAP; trap: Newton also jumps onto saddles.](diagrams/math06_info_jacobian_hessian_ai.png)

<details>
<summary><strong>Read as text</strong> — the Jacobian and the VJP, forward vs reverse mode, the saddle Hessian and Newton's step</summary>

**Simple Explanation:**
The **Jacobian** is a big table of first derivatives when you have multiple inputs AND multiple outputs. It tells you: "If I tweak each input a little, how does each output change?"

The **Hessian** is a table of SECOND derivatives. It tells you about the SHAPE of the landscape — is it a bowl (a minimum), a hilltop (a maximum), or a saddle (downhill one way, uphill another)?

> **Official Definition:** For $F: \mathbb{R}^n \to \mathbb{R}^m$, the **Jacobian** is the $m \times n$ matrix $J_{ij} = \frac{\partial F_i}{\partial x_j}$. For $f: \mathbb{R}^n \to \mathbb{R}$, the **Hessian** is the $n \times n$ matrix $H_{ij} = \frac{\partial^2 f}{\partial x_i \partial x_j}$; it is symmetric whenever the second partial derivatives are continuous.

> **Maths in one line:** $f(\theta + \Delta) \approx f(\theta) + \nabla f \cdot \Delta + \tfrac{1}{2}\,\Delta^{\top} H \Delta$ — the gradient gives the slope, the Hessian the curvature.

**Jacobian** (first derivatives, multi-input → multi-output):

Given $f_1(x,y) = x^2 + y$ and $f_2(x,y) = xy$:

$$J = \begin{pmatrix} \frac{\partial f_1}{\partial x} & \frac{\partial f_1}{\partial y} \\ \frac{\partial f_2}{\partial x} & \frac{\partial f_2}{\partial y} \end{pmatrix} = \begin{pmatrix} 2x & 1 \\ y & x \end{pmatrix} \qquad \text{at } (3, 4): \quad J = \begin{pmatrix} 6 & 1 \\ 4 & 3 \end{pmatrix}$$

> **In plain English:** "Each row is one output. Each column is one input. Cell $(i,j)$ = how much output $i$ changes when you nudge input $j$."

**In ML:** a layer with 4,096 inputs and 4,096 outputs has about 16.8 million weights. The Jacobian of its 4,096 outputs with respect to those weights would hold 4,096 × 16.8 million ≈ 69 billion numbers for every example, so frameworks never build it. The backward pass only needs the gradient arriving from above, $v = \frac{\partial L}{\partial F}$, times the Jacobian: a **vector–Jacobian product** $v^{\top} J$ (VJP). Example: if $L = f_1 + f_2$, then $v = [1, 1]$ and $v^{\top} J = [6 + 4,\ 1 + 3] = [10, 4]$ — exactly the gradient of $L = x^2 + y + xy$ at $(3, 4)$, which is $[2x + y,\ 1 + x]$.

**Forward vs reverse mode.** Forward-mode autodiff pushes a nudge of the inputs forward — a Jacobian–vector product $Jv$, one *column* of $J$ per pass — cheap when there are few inputs. Reverse mode pulls a gradient backward — a VJP, one *row* of $J$ per pass — cheap when there are few outputs. Training has billions of inputs (the weights) and ONE output (the loss), so it uses reverse mode: that is backpropagation. In code: `jax.jvp` / `jax.vjp`, or `torch.func.jvp` / `torch.func.vjp`.

---

**Hessian** (second derivatives — curvature):

Given $f(x,y) = x^2 + 3xy + 2y^2$:

$$H = \begin{pmatrix} \frac{\partial^2 f}{\partial x^2} & \frac{\partial^2 f}{\partial x \partial y} \\ \frac{\partial^2 f}{\partial y \partial x} & \frac{\partial^2 f}{\partial y^2} \end{pmatrix} = \begin{pmatrix} 2 & 3 \\ 3 & 4 \end{pmatrix}$$

> **In plain English:** "How curvy is the surface in each direction?"

The Hessian tells you the SHAPE of the loss surface. At a flat point (gradient $= 0$), read the signs of its eigenvalues (§1.4):

| Eigenvalues of $H$ | Shape | The flat point is… |
|---|---|---|
| All positive (positive definite) | Bowl | A minimum |
| All negative (negative definite) | Hilltop | A maximum |
| Mixed signs | Saddle | Neither — downhill still exists in some direction |

For a $2 \times 2$ Hessian there is a shortcut: a negative determinant means a saddle.

**Our example is a saddle.** $\det H = 2 \times 4 - 3 \times 3 = -1 < 0$, and the eigenvalues are $6.162$ and $-0.162$. From the flat point $(0, 0)$, stepping to $(1, 0)$ goes uphill ($f = 1$), but stepping to $(1, -0.72)$ goes downhill ($f = -0.1232$). Compare the bowl $x^2 + y^2$ of §2.4: $H = \begin{pmatrix} 2 & 0 \\ 0 & 2 \end{pmatrix}$, both eigenvalues 2 — a true minimum. Saddles matter in practice: Dauphin et al. (NeurIPS 2014) argued that in high-dimensional losses, saddle points, not bad local minima, are the main thing that slows training, because the gradient near them is tiny.

**Why curvature helps — Newton's step.** $\theta_{\text{new}} = \theta - H^{-1} \nabla f$ divides the slope by the curvature. On the bowl from $(3, 4)$: $(3, 4) - \tfrac{1}{2}(6, 8) = (0, 0)$ — the exact minimum in ONE step, where gradient descent with lr 0.1 reached only $(2.4, 3.2)$. The catch: Newton jumps to the flat point of its quadratic fit, saddle or not — on the saddle example above it lands exactly on $(0, 0)$.

**Why deep learning doesn't use it directly:** the Hessian has $n^2$ entries. One million weights → $10^{12}$ numbers (4 TB in FP32); one billion → $10^{18}$ (4 exabytes) — and inverting it costs about $n^3$ operations. What is used instead:

- **Hessian–vector products** $Hv$ cost a small multiple of one gradient and never build $H$ (Pearlmutter, 1994).
- **Adam** (§4.4) divides each weight's step by the square root of a running average of its squared gradients — a cheap per-weight scale, not the Hessian.
- Optimizers that do use curvature at scale — **Sophia** (a diagonal Hessian estimate) and **Shampoo/SOAP** (one preconditioner per weight matrix) — and **Muon**, which orthogonalizes the update: [Ch 16 §1.2, "Beyond AdamW"](#content/16_deep_learning).

</details>

```python
# Jacobian and Hessian with numbers: J at (3, 4), a vector-Jacobian product, the Hessian's eigenvalues, one Newton step
import numpy as np

def F(p):                                   # two outputs: f1 = x^2 + y, f2 = x*y
    x, y = p
    return np.array([x ** 2 + y, x * y])

p = np.array([3.0, 4.0])
J = np.array([[2 * p[0], 1.0],              # row = output, column = input
              [p[1], p[0]]])
h = 1e-6                                    # numerical Jacobian: nudge one input -> one column
J_num = np.column_stack([(F(p + h * e) - F(p - h * e)) / (2 * h) for e in np.eye(2)])
print("J at (3, 4) =", J.tolist())
assert np.allclose(J, J_num, atol=1e-6)

v = np.array([1.0, 1.0])                    # gradient arriving from above if L = f1 + f2
print("v^T J =", (v @ J).tolist(), " = gradient of L = x^2 + y + xy at (3, 4): [2x + y, 1 + x]")

# Hessian of f = x^2 + 3xy + 2y^2: constant, so the same at every point
H = np.array([[2.0, 3.0],
              [3.0, 4.0]])
eigenvalues = np.linalg.eigvalsh(H)
print(f"H eigenvalues: {eigenvalues[0]:.3f} and {eigenvalues[1]:.3f}, det = {np.linalg.det(H):.0f}  -> mixed signs = SADDLE")
f = lambda x, y: x ** 2 + 3 * x * y + 2 * y ** 2
print(f"f(0, 0) = {f(0, 0)}, f(1, 0) = {f(1, 0)} (uphill), f(1, -0.72) = {f(1, -0.72):.4f} (downhill)")
assert eigenvalues[0] < 0 < eigenvalues[1]

# Contrast: the bowl x^2 + y^2 has H = 2I (both eigenvalues 2) -> a true minimum
H_bowl, grad = 2 * np.eye(2), np.array([6.0, 8.0])
newton = p - np.linalg.solve(H_bowl, grad)  # Newton: divide the gradient by the curvature
gd = p - 0.1 * grad                         # plain gradient descent, lr = 0.1
print(f"from (3, 4): one Newton step -> {newton.tolist()}, one GD step -> {gd.round(2).tolist()}")
assert np.allclose(newton, [0, 0])
```

**Output:**

```
J at (3, 4) = [[6.0, 1.0], [4.0, 3.0]]
v^T J = [10.0, 4.0]  = gradient of L = x^2 + y + xy at (3, 4): [2x + y, 1 + x]
H eigenvalues: -0.162 and 6.162, det = -1  -> mixed signs = SADDLE
f(0, 0) = 0, f(1, 0) = 1 (uphill), f(1, -0.72) = -0.1232 (downhill)
from (3, 4): one Newton step -> [0.0, 0.0], one GD step -> [2.4, 3.2]
```

---

## 2.6 Backpropagation — A Complete Example ★★★

![Infographic on backpropagation by hand: the rule dL/dw = dL/dz times x_in with each symbol labelled; the chain x = 2, times 0.5 plus 0.1, h = 1.1, ReLU, a = 1.1, times -0.3 plus 0.2, o = -0.13, (o - 1) squared, L = 1.2769 with forward arrows in blue and backward gradients in red (-2.26 at o, 0.678 at a and h; w1 1.356, b1 0.678, w2 -2.486, b2 -2.26); the backward pass step by step; one update with lr 0.01 to w1 0.48644, b1 0.09322, w2 -0.27514, b2 0.2226 that lowers the loss from 1.2769 to 1.1465; matrix scale for Y = X W-transpose + b with batch 4, 3 inputs and 2 outputs: dL/dW = G-transpose X (2 x 3), dL/db = sum of G's rows (2,), dL/dX = G W (4 x 3), with grids drawn to shape; trap: the bias gradient must sum the rows of G.](diagrams/math06_info_backprop_by_hand_ai.png)

<details>
<summary><strong>Read as text</strong> — the relay race, the forward pass, the backward pass and one weight update</summary>

**Simple Explanation:**
Backpropagation is just the chain rule applied step-by-step through a neural network. Each layer asks: "How much did I contribute to the final error?" and then adjusts its weights to contribute less error next time.

Think of it like a relay race. If your team lost by 10 seconds, you figure out how many seconds EACH runner lost, and each runner practices to improve by that amount.

> **Official Definition:** Backpropagation is reverse-mode automatic differentiation applied to a network's loss: a forward pass computes and stores every intermediate value, then a backward pass applies the chain rule from the loss towards the inputs, reusing each intermediate gradient, so one pass yields every weight's gradient. Reverse-mode differentiation was described by Seppo Linnainmaa in 1970; Rumelhart, Hinton and Williams (*Nature*, 1986) showed it training the hidden layers of neural networks.

> **Maths in one line:** $\frac{\partial L}{\partial w} = \frac{\partial L}{\partial z} \times x_{\text{in}}$ — a weight's gradient is the error signal at the sum $z$ it feeds into, times the input $x_{\text{in}}$ it multiplied (below: $\frac{dL}{dw_2} = -2.26 \times 1.1$ and $\frac{dL}{dw_1} = 0.678 \times 2$).

The network — one input, one hidden ReLU neuron, one output, squared-error loss:

```
x ──[ ×w1, +b1 ]──► h ──[ ReLU ]──► a ──[ ×w2, +b2 ]──► o ──[ (o − target)² ]──► L
```

**Forward Pass** (compute the prediction):

Given: $x = 2$, $w_1 = 0.5$, $w_2 = -0.3$, $b_1 = 0.1$, $b_2 = 0.2$, target $= 1.0$

$$\begin{aligned}
h &= w_1 \cdot x + b_1 = (0.5)(2) + 0.1 = 1.1 \\
a &= \text{ReLU}(h) = \max(0,\ 1.1) = 1.1 \\
o &= w_2 \cdot a + b_2 = (-0.3)(1.1) + 0.2 = -0.13 \\
L &= (o - \text{target})^2 = (-0.13 - 1.0)^2 = 1.2769
\end{aligned}$$

**Backward Pass** (figure out who's responsible):

$$\frac{dL}{do} = 2(o - \text{target}) = 2(-1.13) = -2.26$$

$$\begin{aligned}
\frac{dL}{dw_2} &= \frac{dL}{do} \times a = (-2.26)(1.1) = -2.486 \\
\frac{dL}{db_2} &= \frac{dL}{do} \times 1 = -2.26
\end{aligned}$$

$$\begin{aligned}
\frac{dL}{da} &= \frac{dL}{do} \times w_2 = (-2.26)(-0.3) = 0.678 \\
\frac{dL}{dh} &= \frac{dL}{da} \times 1 = 0.678 \quad \text{(ReLU derivative = 1 when } h > 0\text{)}
\end{aligned}$$

$$\begin{aligned}
\frac{dL}{dw_1} &= \frac{dL}{dh} \times x = (0.678)(2) = 1.356 \\
\frac{dL}{db_1} &= \frac{dL}{dh} \times 1 = 0.678
\end{aligned}$$

**Update Weights** (learning rate = 0.01):

$$\begin{aligned}
w_1 &= 0.5 - 0.01 \times 1.356 = 0.48644 \\
b_1 &= 0.1 - 0.01 \times 0.678 = 0.09322 \\
w_2 &= -0.3 - 0.01 \times (-2.486) = -0.27514 \\
b_2 &= 0.2 - 0.01 \times (-2.26) = 0.2226
\end{aligned}$$

**Did it learn?** Run the same input through the new weights:

$$h = 0.48644 \times 2 + 0.09322 = 1.0661, \quad a = 1.0661, \quad o = (-0.27514)(1.0661) + 0.2226 = -0.0707, \quad L = (-1.0707)^2 = 1.1465$$

The loss fell from 1.2769 to 1.1465 in one step. Repeat over many examples and many steps — the model learns! The same mechanism with vectors, a sigmoid output, cross-entropy and mini-batches is worked in [Ch 14 §14.5](#content/14_neural_networks).

The program checks every gradient by nudging (a **gradient check**), takes the update, and then feeds $x = -2$:

</details>

```python
# Backprop by hand on the chapter's 2-layer net (x = 2, target = 1): chain rule, gradient check, one update, a dead ReLU
x, target, lr = 2.0, 1.0, 0.01
params = {"w1": 0.5, "b1": 0.1, "w2": -0.3, "b2": 0.2}

def forward(p, x=x):
    h = p["w1"] * x + p["b1"]              # layer 1
    a = max(0.0, h)                        # ReLU
    o = p["w2"] * a + p["b2"]              # layer 2 (output)
    return h, a, o, (o - target) ** 2      # squared-error loss

def backward(p, x=x):
    h, a, o, L = forward(p, x)
    dL_do = 2 * (o - target)
    dL_da = dL_do * p["w2"]
    dL_dh = dL_da * (1.0 if h > 0 else 0.0)  # ReLU slope: 1 if h > 0, else 0
    return {"w1": dL_dh * x, "b1": dL_dh, "w2": dL_do * a, "b2": dL_do}

h, a, o, L = forward(params)
print(f"forward: h = {h:.2f}, a = {a:.2f}, o = {o:.2f}, L = {L:.4f}")
grads = backward(params)
eps = 1e-6
for name, grad in grads.items():           # gradient check: nudge ONE parameter up and down
    up, down = dict(params), dict(params)
    up[name] += eps
    down[name] -= eps
    numeric = (forward(up)[3] - forward(down)[3]) / (2 * eps)
    print(f"dL/d{name}: backprop {grad:+.4f}   nudging {numeric:+.4f}")
    assert abs(grad - numeric) < 1e-6

new = {k: params[k] - lr * grads[k] for k in params}
print("after one step: " + ", ".join(f"{k} = {v:.5f}" for k, v in new.items()))
print(f"loss {L:.4f} -> {forward(new)[3]:.4f}")
assert forward(new)[3] < L

# Contrast: x = -2 makes h = -0.9 < 0, ReLU outputs 0 and blocks the signal to layer 1
g_dead = backward(params, x=-2.0)
print("x = -2 gradients: " + ", ".join(f"{k} {v + 0.0:+.2f}" for k, v in g_dead.items()))
```

**Output:**

```
forward: h = 1.10, a = 1.10, o = -0.13, L = 1.2769
dL/dw1: backprop +1.3560   nudging +1.3560
dL/db1: backprop +0.6780   nudging +0.6780
dL/dw2: backprop -2.4860   nudging -2.4860
dL/db2: backprop -2.2600   nudging -2.2600
after one step: w1 = 0.48644, b1 = 0.09322, w2 = -0.27514, b2 = 0.22260
loss 1.2769 -> 1.1465
x = -2 gradients: w1 +0.00, b1 +0.00, w2 +0.00, b2 -1.60
```

<details>
<summary><strong>Read as text</strong> — continued: the gradient check and the dead ReLU at x = −2</summary>

Every backprop gradient matches the nudging check (PyTorch's built-in version is `torch.autograd.gradcheck`). With $x = -2$, $h = -0.9$, so ReLU outputs 0 and its slope is 0: $w_1$ and $b_1$ get no gradient, and neither does $w_2$, because the value it multiplies ($a$) is 0 — only $b_2$ learns. Being off for one input is normal; a neuron that is off for EVERY input never learns again (a "dying ReLU", [Ch 14 §14.3](#content/14_neural_networks)).

</details>

### Matrix Calculus — Shapes of a Linear Layer's Gradients

<details>
<summary><strong>Read as text</strong> — the shape rule, GᵀX, the summed bias and GW at batch scale</summary>

**Simple Explanation:**
Real layers process a whole batch of vectors at once, so the single numbers above become matrices. The chain rule does not change — but the shapes must line up. One rule does most of the work: **the gradient of the loss with respect to anything has the same shape as that thing.** If you forget a formula, rebuild it by making the shapes fit.

The setup: a linear layer $Y = XW^{\top} + b$, stored the PyTorch `nn.Linear` way (one row of $W$ per output, as in [Ch 14 §14.4](#content/14_neural_networks)), with a batch of $B = 4$ examples, 3 inputs and 2 outputs. The layer above hands back $G = \frac{\partial L}{\partial Y}$, one row per example.

> **Maths in one line:** $\frac{\partial L}{\partial W} = G^{\top} X, \quad \frac{\partial L}{\partial b} = \textstyle\sum_{\text{rows}} G, \quad \frac{\partial L}{\partial X} = G\,W$ — in each case the only product whose shape matches.

| Thing | Shape | Its gradient | Why the shape fits |
|---|---|---|---|
| $X$ (input batch) | (4, 3) | $G\,W$ | (4, 2) @ (2, 3) → (4, 3) |
| $W$ (weights) | (2, 3) | $G^{\top} X$ | (2, 4) @ (4, 3) → (2, 3) |
| $b$ (bias) | (2,) | sum of the rows of $G$ | 4 rows of 2 → (2,) |
| $Y$ (output) | (4, 2) | $G$ (handed down from above) | — |

Three things to notice:

1. **$G^{\top} X$ adds up the batch for free.** The matrix multiply sums the 4 examples' contributions, so $W$'s gradient has the same size for any $B$. If the loss is a *mean*, the $\frac{1}{B}$ is already inside $G$.
2. **Copied forward ⇒ summed backward.** $b$ was added to every row, so its gradient sums the rows — the same "add across paths" rule as §2.3.
3. **$GW$ flows to the layer below** — it is that layer's error signal. In the one-example column notation of Ch 14 and Ch 16 ($z = Wx + b$) the same three results read $\nabla_W L = \delta\,x^{\top}$, $\nabla_b L = \delta$ and $\nabla_x L = W^{\top}\delta$, where $\delta$ is the gradient arriving at $z$.

**The §2.6 output layer is the 1 × 1 case:** $X = a = 1.1$, $W = w_2 = -0.3$, $G = \frac{dL}{do} = -2.26$, so $G^{\top}X = -2.486$, the summed $G$ is $-2.26$, and $GW = 0.678$ — exactly $\frac{dL}{dw_2}$, $\frac{dL}{db_2}$ and $\frac{dL}{da}$ above. A forward pass is one matrix multiply; the backward pass needs two ($G^{\top}X$ and $GW$), which is why backward costs about 2× forward ([Ch 16 §1.1](#content/16_deep_learning)).

</details>

```python
# Gradients of a linear layer Y = X @ W.T + b: every gradient has the same SHAPE as the thing it belongs to
import numpy as np

def linear_grads(X, W, G):                  # G = dL/dY, one row per example
    return G.T @ X, G.sum(axis=0), G @ W    # dL/dW, dL/db, dL/dX

# 1. The chapter's output layer from 2.6 is the 1 x 1 case: o = w2 * a + b2
X, W, b, T = np.array([[1.1]]), np.array([[-0.3]]), np.array([0.2]), np.array([[1.0]])
Y = X @ W.T + b
dW, db, dX = linear_grads(X, W, 2 * (Y - T))    # L = (o - target)^2 -> dL/do = 2(o - target)
print(f"2.6 layer: dL/dw2 = {dW[0, 0]:.3f}, dL/db2 = {db[0]:.2f}, dL/da = {dX[0, 0]:.3f}")

# 2. A real batch: B = 4 examples, 3 inputs, 2 outputs, loss = mean squared error
rng = np.random.default_rng(0)
X, T = rng.normal(size=(4, 3)), rng.normal(size=(4, 2))
W, b = rng.normal(size=(2, 3)), np.zeros(2)     # PyTorch layout: one row per output
loss = lambda W, b: np.mean((X @ W.T + b - T) ** 2)
Y = X @ W.T + b
G = 2 * (Y - T) / Y.size                        # dL/dY for the mean over all 8 numbers
dW, db, dX = linear_grads(X, W, G)
for name, value, grad in [("X", X, dX), ("W", W, dW), ("b", b, db), ("Y", Y, G)]:
    print(f"{name}: value {str(value.shape):7}  gradient {grad.shape}")
assert dW.shape == W.shape and db.shape == b.shape and dX.shape == X.shape

E = np.zeros_like(W)
E[1, 2] = 1e-6                                  # check one entry by nudging it
numeric = (loss(W + E, b) - loss(W - E, b)) / 2e-6
print(f"dL/dW[1,2]: formula {dW[1, 2]:.6f}   nudging {numeric:.6f}")
assert abs(numeric - dW[1, 2]) < 1e-8

# 3. b was added to EVERY row, so its gradient must SUM over the rows (not take row 0)
print(f"db summed over the batch {db.round(4).tolist()}  vs  row 0 only {G[0].round(4).tolist()}")
```

**Output:**

```
2.6 layer: dL/dw2 = -2.486, dL/db2 = -2.26, dL/da = 0.678
X: value (4, 3)   gradient (4, 3)
W: value (2, 3)   gradient (2, 3)
b: value (2,)     gradient (2,)
Y: value (4, 2)   gradient (4, 2)
dL/dW[1,2]: formula -0.234845   nudging -0.234845
db summed over the batch [0.7433, 0.0102]  vs  row 0 only [0.4256, 0.051]
```

<details>
<summary><strong>Read as text</strong> — continued: what the three parts show and the silent bias bug</summary>

Part 1 reproduces §2.6 exactly. Part 2 shows that every gradient has its parameter's shape, and the nudging check agrees to 6 decimals. Part 3 is the classic bias bug: taking one row instead of the sum gives wrong numbers silently — no shape error, because (2,) matches (2,).

</details>

---

# PART 3: PROBABILITY & STATISTICS ★★★

> Probability is how models deal with uncertainty. "I'm 90% sure this is a cat" is a probability.
> A classifier's output is a probability, and the standard training losses (cross-entropy, mean squared error) are negative log-likelihoods (§3.6, §5.2).

Route through this part: random variables (§3.1) → how events combine, including conditional probability and the law of total probability (§3.1b) → the five distributions you meet most (§3.2) → mean, variance and correlation (§3.3) → Bayes' theorem (§3.4).

---

## 3.1 Random Variables

![Infographic on random variables: the formulas sum of P(X = x) = 1 and integral of f(x) dx = 1 with each symbol labelled; the PMF of heads in 3 coin flips, 1/8, 3/8, 3/8, 1/8 (1 + 3 + 3 + 1 = 8 eighths) as bars drawn 1 : 3 : 3 : 1; a bell curve for height with mean 170 cm and sd 10 cm where one exact value has probability 0 and the shaded band from 170 to 175 cm is about 19%; the CDF F(x) = P(X <= x) drawn to scale, reading F(175) - F(170) = 0.691 - 0.500 = 0.191; where ML uses PMF, PDF and CDF; trap: one exact continuous value always has probability 0.](diagrams/math06_info_random_variables_ai.png)

<details>
<summary><strong>Read as text</strong> — PMF, PDF, CDF and the coin and height examples</summary>

**Simple Explanation:**
A random variable is just a number that depends on chance. Flip a coin — you might get 0 (tails) or 1 (heads). Roll a die — you get 1 through 6. That's a random variable.

Think of it like a mystery box. You know what COULD be inside (the possible values), and you know how likely each thing is (the probabilities), but you don't know what you'll actually get until you open it.

| Type | Values | Probabilities come from | Example |
|---|---|---|---|
| **Discrete** | separate values you can list (0, 1, 2, …) | a **PMF** (probability mass function): a probability P(X = x) for each value | number of heads, number of siblings |
| **Continuous** | any value in a range | a **PDF** (probability density function): probability = the **area** under the curve over a range | your exact height, like 170.347 cm |

> **Maths in one line:** `Σ P(X = x) = 1` (discrete) and `∫ f(x) dx = 1` (continuous) — something must happen; for a continuous variable only the area over a range is a probability.

**Discrete example:** $X$ = number of heads in 3 coin flips. There are 8 equally likely outcomes (HHH, HHT, …, TTT), and 1, 3, 3 and 1 of them have 0, 1, 2 and 3 heads:

$$P(X=0) = \tfrac{1}{8} \quad P(X=1) = \tfrac{3}{8} \quad P(X=2) = \tfrac{3}{8} \quad P(X=3) = \tfrac{1}{8}$$

All probabilities add up to 1 (something MUST happen): 1 + 3 + 3 + 1 = 8 eighths.

**Continuous example:** $X$ = height of a random person, bell-shaped with mean 170 cm and standard deviation 10 cm (illustrative numbers; the bell curve is in §3.2).

- $P(X = \text{exactly } 170.000\ldots\text{ cm}) = 0$ — a single exact value has zero width, so zero area.
- $P(170 < X < 175) \approx 0.19$ — a RANGE has real probability: about 19% of people fall in that 5 cm band.
- A density is **not** a probability and can be bigger than 1: a value spread evenly over 0 to 0.5 has density 2 everywhere, because 2 × 0.5 = an area of 1.

The **CDF** (cumulative distribution function) $F(x) = P(X \le x)$ works for both types, and any range is a difference of two CDF values: $P(a < X \le b) = F(b) - F(a)$. Every "what fraction is below…" question — z-tables, percentiles, p-values (§3.7) — is a CDF lookup.

</details>

---

## 3.1b Independence, Joint Probability and the Addition Rule ★★

![Infographic on combining events: the formula P(B given A) = P(A and B) / P(A) with each symbol labelled; cards: 4/52 = 7.7% becomes 3/51 = 5.9% after an ace is drawn, two aces 4/52 x 3/51 = 1/221 = 0.45%, with two 13 x 4 card grids; the addition rule for a heart or a king 13/52 + 4/52 - 1/52 = 16/52 = 30.8% drawn as a bar split 12 : 1 : 3 with the overlap counted twice; a probability tree for two labellers (Asha 60% with 2% wrong = 0.012, Ravi 40% with 5% wrong = 0.020, total 3.2%) and P(Ravi given wrong) = 0.020 / 0.032 = 62.5%; where ML uses it (Naive Bayes, a 10-step agent at 90% = 35%); trap: multiply P(A) x P(B) only for independent events.](diagrams/math06_info_conditional_probability_rules_ai.png)

<details>
<summary><strong>Read as text</strong> — the five rules for AND, OR and GIVEN in one table</summary>

**Simple Explanation:**
Most real questions are about two events at once: "spam AND contains FREE", "a heart OR a king", "the second card is an ace GIVEN the first one was". Five rules cover all of them. Two of them — conditional probability and the law of total probability — are the two halves of Bayes' theorem (§3.4), so learn them here first.

> **Maths in one line:** `P(B | A) = P(A ∩ B) / P(A)` — "given A" means: keep only the cases where A happened, then ask what fraction of those also have B.

| Rule | Formula (in words) | Tiny example |
|---|---|---|
| Conditional | P(B given A) = P(A and B) ÷ P(A) | 2nd card is an ace, given the 1st was: 3/51 ≈ 5.9% |
| Multiplication — always true | P(A and B) = P(A) × P(B given A) | two aces in a row: 4/52 × 3/51 = 1/221 ≈ 0.45% |
| Multiplication — independent only | P(A and B) = P(A) × P(B) | two heads: 0.5 × 0.5 = 0.25 |
| Addition | P(A or B) = P(A) + P(B) − P(A and B) | a heart or a king: 13/52 + 4/52 − 1/52 ≈ 30.8% |
| Total probability | P(B) = sum over routes of P(B given route) × P(route) | a wrong label: 0.6 × 0.02 + 0.4 × 0.05 = 3.2% |

</details>

### Conditional Probability — Shrinking the World

<details>
<summary><strong>Read as text</strong> — shrinking the world, the two-aces example and the multiplication rule</summary>

A deck has 52 cards, 4 of them aces. You draw one card and it is an ace. What is the chance the next card is an ace too? Your world has shrunk to 51 cards, of which 3 are aces, so the answer is 3/51 ≈ 5.9% — lower than the 4/52 ≈ 7.7% you started with.

$$P(B \mid A) = \frac{P(A \cap B)}{P(A)} \qquad \text{(defined when } P(A) > 0\text{)}$$

Read the vertical bar as "given". Rearranged, it becomes the **multiplication rule**, which holds for any two events:

$$P(A \cap B) = P(A) \cdot P(B \mid A) \qquad \text{(always true)}$$

Two aces in a row: $\tfrac{4}{52} \times \tfrac{3}{51} = \tfrac{12}{2652} = \tfrac{1}{221} \approx 0.45\%$.

> **Watch out:** $P(B \mid A)$ and $P(A \mid B)$ are different numbers. $P(\text{positive} \mid \text{disease})$ can be 99% while $P(\text{disease} \mid \text{positive})$ is only 16.7% — §3.4 shows why, and how to turn one into the other.

</details>

### Independence

<details>
<summary><strong>Read as text</strong> — when P(A) × P(B) is allowed, with and without replacement</summary>

Two events are **independent** if knowing one tells you nothing about the other: $P(B \mid A) = P(B)$. Then the multiplication rule simplifies to:

$$P(A \cap B) = P(A) \cdot P(B) \qquad \text{(independent only)}$$

Two coin flips are independent: P(two heads) = 0.5 × 0.5 = 0.25. Drawing two cards *without replacement* is not — the first draw changes what is left. Put the first card back and shuffle, and the draws become independent: two aces then has probability $(4/52)^2 = 1/169 \approx 0.59\%$ instead of 0.45%.

So the always-true formula is the general one; independence is just the special case where $P(B \mid A) = P(B)$.

</details>

### The Addition Rule

<details>
<summary><strong>Read as text</strong> — subtract the overlap once: a heart or a king</summary>

For "A **or** B":

$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$

You subtract the overlap because otherwise it is counted twice. Draw one card: P(heart or king) = 13/52 + 4/52 − 1/52 = 16/52 ≈ 30.8% — the king of hearts is in both groups, so it is removed once. If the events are **mutually exclusive** (they cannot both happen) the overlap is zero and the rule simplifies to $P(A) + P(B)$.

```
            A only    A and B   B only
          ┌─────────┬─────────┬─────────┐
          │         │/////////│         │
          │         │/////////│         │
          └─────────┴─────────┴─────────┘
          ◄────── P(A) ───────►
                    ◄────── P(B) ───────►

  P(A) + P(B) counts the shaded overlap twice, so subtract P(A and B) once
```

</details>

### The Law of Total Probability — Adding Up the Routes

<details>
<summary><strong>Read as text</strong> — adding up the routes: Asha, Ravi and the 3.2% wrong labels</summary>

**Simple Explanation:**
When something can happen by several routes, its total chance is: for each route, (chance of taking that route) × (chance it happens on that route), added up.

Two people label your training images. Asha labels 60% of them and gets 2% wrong; Ravi labels 40% and gets 5% wrong. What fraction of all labels is wrong?

```
  ALL LABELS
  ├── Asha 60% ──► 2% wrong  →  0.60 × 0.02 = 0.012
  └── Ravi 40% ──► 5% wrong  →  0.40 × 0.05 = 0.020
                                P(wrong)    = 0.032 = 3.2%
```

$$P(B) = \sum_i P(B \mid A_i)\,P(A_i)$$

The routes $A_i$ must not overlap and must cover every case — here every label is done by exactly one person.

**Turn it around** and you already have Bayes' theorem: the share of the wrong labels that came from Ravi is $0.020 / 0.032 = 62.5\%$. Ravi did 40% of the labelling but 62.5% of the mistakes. §3.4 is this one division, done carefully.

</details>

### Common Confusions

<details>
<summary><strong>Read as text</strong> — the five classic confusions and the counting check</summary>

| Confusion | Correct rule |
|---|---|
| $P(B \mid A)$ vs $P(A \mid B)$ | **Different numbers.** Swapping them is the base-rate fallacy (§3.4) |
| "Independent" vs "mutually exclusive" | **Opposites, not synonyms.** When both events can happen (probability > 0), mutually exclusive events are *dependent* — if one happens, the other definitely did not |
| Multiplying probabilities of dependent events | Use $P(A)\cdot P(B \mid A)$, not $P(A)\cdot P(B)$ |
| Adding probabilities of overlapping events | Subtract the intersection, or you double-count |
| "Independent given C" vs "independent" | **Not the same.** Two words can be independent *given* the class (spam or not) yet correlated overall, because both are more common in spam |

**Worked example — check every rule by counting.** One million simulated draws and labels; each simulated number should land next to its exact value.

</details>

```python
# Counting beats intuition: conditional probability, the addition rule and the law of total probability
import numpy as np

rng = np.random.default_rng(0)
n = 1_000_000

# Two cards without replacement; cards 0-3 are the four aces
first = rng.integers(0, 52, n)
second = rng.integers(0, 51, n)
second = second + (second >= first)                  # skip the card already in your hand
ace1, ace2 = first < 4, second < 4
p_cond = (ace1 & ace2).mean() / ace1.mean()           # P(B | A) = P(A and B) / P(A)
print(f"P(2nd ace)            = {ace2.mean():.4f}   exact 4/52  = {4 / 52:.4f}")
print(f"P(2nd ace | 1st ace)  = {p_cond:.4f}   exact 3/51  = {3 / 51:.4f}  -> dependent")
print(f"P(two aces)           = {(ace1 & ace2).mean():.4f}   exact 1/221 = {1 / 221:.4f}")

# Addition rule by listing all 52 cards (rank 12 = king)
cards = [(rank, suit) for rank in range(13) for suit in "SHDC"]
hits = sum(1 for rank, suit in cards if suit == "H" or rank == 12)
print(f"P(heart or king)      = {hits}/52 = {hits / 52:.3f}   (13 + 4 - 1)/52 = {(13 + 4 - 1) / 52:.3f}")

# Law of total probability: Asha labels 60% (2% wrong), Ravi 40% (5% wrong)
ravi = rng.random(n) < 0.40
wrong = rng.random(n) < np.where(ravi, 0.05, 0.02)
total = 0.60 * 0.02 + 0.40 * 0.05
print(f"P(wrong label)        = {wrong.mean():.4f}   0.6 x 0.02 + 0.4 x 0.05 = {total:.4f}")
print(f"P(Ravi | wrong label) = {ravi[wrong].mean():.3f}    0.020 / 0.032 = {0.40 * 0.05 / total:.3f}")

assert abs(p_cond - 3 / 51) < 0.003 and abs(wrong.mean() - total) < 0.001
assert hits == 16
```

**Output:**

```
P(2nd ace)            = 0.0771   exact 4/52  = 0.0769
P(2nd ace | 1st ace)  = 0.0588   exact 3/51  = 0.0588  -> dependent
P(two aces)           = 0.0045   exact 1/221 = 0.0045
P(heart or king)      = 16/52 = 0.308   (13 + 4 - 1)/52 = 0.308
P(wrong label)        = 0.0318   0.6 x 0.02 + 0.4 x 0.05 = 0.0320
P(Ravi | wrong label) = 0.626    0.020 / 0.032 = 0.625
```

<details>
<summary><strong>Read as text</strong> — continued: what the simulation shows and why it matters in ML</summary>

Knowing the first card was an ace drops the second card's chance from 7.7% to 5.9%, so the draws are dependent. The simulated labels land within a few thousandths of the formulas — that gap is sampling noise, and it shrinks as n grows.

**Why it matters in ML:** *Naive* Bayes is called naive precisely because it assumes all features are conditionally independent given the class — usually false, but the classifier often works well anyway ([Ch 12 §12.9](#content/12_key_algorithms)). And independence is what makes reliability compound: an agent chaining 10 steps that each succeed 90% of the time, failing independently, succeeds $0.9^{10} \approx 35\%$ of the time overall, because the steps multiply ([Ch 18b §18.10](#content/18b_agents_in_production)).

</details>

---

## 3.2 Probability Distributions

![Infographic on five probability distributions: mean and variance of Bernoulli (p, p(1 - p)), Binomial (np, np(1 - p)), Gaussian (mu, sigma squared) and Poisson (lambda, lambda) with each symbol labelled; Binomial worked example C(10, 7) = 120, 120 x 0.0078 x 0.125 = 11.7% for 7 heads in 10 flips with a to-scale bar chart; Gaussian 170 plus or minus 10 cm with 68.3, 95.4 and 99.7% within 1, 2 and 3 sigma and z = 1.5 at 185 cm so 93.3% are shorter; Poisson with lambda = 3: P(5) = 243 x 0.0498 / 120 = 10.1% with a to-scale bar chart; ML examples (spam p = 0.3 variance 0.21, 900 plus or minus 9.5 of 1,000 images, GPT-2's 50,257 tokens); trap: not everything is normal.](diagrams/math06_info_probability_distributions_ai.png)

<details>
<summary><strong>Read as text</strong> — five shapes and how each number is produced</summary>

**Simple Explanation:**
A distribution is the full "menu" of a random variable: every value it can take and how likely each one is. Five shapes cover most of ML — pick the one that matches how the data are produced:

| How the number is produced | Distribution | ML example |
|---|---|---|
| one yes/no trial | Bernoulli | is this email spam? |
| count of yeses in n trials | Binomial | correct answers out of 1,000 test images |
| sum of many small, roughly independent effects | Gaussian (Normal) | measurement noise, weight initialization |
| count of rare events in a time window | Poisson | requests per second, word counts |
| one of K options | Categorical | the next token an LLM picks |

> **Maths in one line:** `mean and variance — Bernoulli: p, p(1−p) · Binomial: np, np(1−p) · Gaussian: μ, σ² · Poisson: λ, λ` — the two numbers that summarize the center and the spread of each shape (all formulas are collected in the table at the end of this section).

</details>

### Bernoulli — One Coin Flip

<details>
<summary><strong>Read as text</strong> — one yes/no trial, its mean, variance and ML use</summary>

**Simple Explanation:**
One coin flip. One try. Yes or no. Heads or tails. Spam or not spam. That's Bernoulli. It's the simplest probability — something either happens or it doesn't.

$$P(\text{success}) = p \qquad P(\text{failure}) = 1 - p$$

$$\text{Mean} = p \qquad \text{Variance} = p(1-p)$$

Fair coin: $p = 0.5$, variance 0.25 — the largest a yes/no variable can have. Spam detector: $p = 0.3$ (30% chance it's spam), variance 0.3 × 0.7 = 0.21. A sure thing ($p = 0$ or $1$) has variance 0.

In ML: Binary classification output. "Is this email spam? 73% yes." Why? Many real-world questions are yes/no: Is this a cat? Will this customer leave? Is this transaction fraud? Bernoulli is the math behind every yes/no prediction a model makes — and its negative log-likelihood is exactly the binary cross-entropy loss (§5.2).

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Fair Coin (p=0.5)", "Spam Filter (p=0.3)", "Rare Disease (p=0.01)"],
    "datasets": [
      {
        "label": "P(success)",
        "data": [0.50, 0.30, 0.01],
        "backgroundColor": "rgba(99, 102, 241, 0.7)",
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 1
      },
      {
        "label": "P(failure)",
        "data": [0.50, 0.70, 0.99],
        "backgroundColor": "rgba(234, 88, 12, 0.5)",
        "borderColor": "rgba(234, 88, 12, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Bernoulli Distribution — Success vs Failure for Different Events" } },
    "scales": {
      "x": {},
      "y": { "title": { "display": true, "text": "Probability" }, "beginAtZero": true, "max": 1.0 }
    }
  }
}
```

</details>

### Binomial — Many Coin Flips

<details>
<summary><strong>Read as text</strong> — the formula, 7 heads in 10 flips and the 1,000-image test</summary>

**Simple Explanation:**
Flip a coin 10 times. How many heads? That's binomial. It's just "do a Bernoulli trial N times and count the successes."

Like shooting 10 basketball free throws and counting how many go in.

**Formula:**

$$P(k \text{ wins in } n \text{ tries}) = \binom{n}{k} \cdot p^k \cdot (1-p)^{n-k}$$

> Let's unpack each piece:

| Piece | What it means |
|-------|--------------|
| $\binom{n}{k} = \frac{n!}{k!(n-k)!}$ | "n choose k" — how many WAYS can k wins happen in n tries? |
| $p^k$ | Probability that k particular tries all win |
| $(1-p)^{n-k}$ | Probability that the other n − k tries all lose |

**Step-by-Step Example:** Flip a fair coin 10 times. $P(\text{exactly 7 heads})$?

$$\begin{aligned}
\binom{10}{7} &= \frac{10!}{7! \cdot 3!} = 120 \text{ ways} \\
p^7 &= 0.5^7 = 0.0078 \\
(1-p)^3 &= 0.5^3 = 0.125 \\
P &= 120 \times 0.0078 \times 0.125 = 0.117 = 11.7\%
\end{aligned}$$

$\text{Mean} = np = 10 \times 0.5 = 5$ (expect 5 heads on average). $\text{Variance} = np(1-p) = 2.5$, so the standard deviation is $\sqrt{2.5} \approx 1.58$ heads.

In ML: Model accuracy over N test samples follows a binomial distribution. Why? When you test a model on 1,000 images, each prediction is like a coin flip (right or wrong), assuming the images are independent. Binomial tells you how much the score wobbles by luck alone. If the model's true accuracy is 90%, the expected count is 900 with a standard deviation of $\sqrt{1000 \times 0.9 \times 0.1} \approx 9.5$. Getting exactly 912 right has probability only about 1.9%, but getting 912 **or more** happens about 11% of the time — so 91.2% on this test is no evidence that the model beats 90%. Confidence intervals for accuracy are built from this spread ([Ch 32 Q22](#content/32_interview_questions), §3.7).

```chart
{
  "type": "bar",
  "data": {
    "labels": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    "datasets": [{
      "label": "P(X = k)",
      "data": [0.001, 0.010, 0.044, 0.117, 0.205, 0.246, 0.205, 0.117, 0.044, 0.010, 0.001],
      "backgroundColor": "rgba(99, 102, 241, 0.7)",
      "borderColor": "rgba(99, 102, 241, 1)",
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Binomial Distribution — 10 Fair Coin Flips" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Probability" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "Number of Heads" } }
    }
  }
}
```

</details>

### Gaussian (Normal) — The Bell Curve

<details>
<summary><strong>Read as text</strong> — the bell formula, the 68-95-99.7 rule and z-scores</summary>

**Simple Explanation:**
This is THE most famous distribution. It looks like a bell — most values are near the middle, and extreme values are rare. Heights within one group of people, measurement errors and many test scores are roughly bell-shaped.

Why? When something is the SUM of many small, roughly independent random effects (genetics + nutrition + environment for height), the result tends towards a bell curve. That is the Central Limit Theorem (§3.5). It is not a law of nature: incomes, city sizes and web-request latencies are skewed, with a long right tail, so check the shape before assuming "normal".

**Formula** (a density $f(x)$, not a probability — areas under it are probabilities, §3.1):

$$f(x) = \frac{1}{\sigma \sqrt{2\pi}} \cdot e^{\displaystyle -\frac{(x - \mu)^2}{2\sigma^2}}$$

> Don't panic! Here's what each piece means:

| Symbol | Name | What it means |
|--------|------|---------------|
| $\mu$ | mu (mean) | The CENTER of the bell (the average) |
| $\sigma$ | sigma (std dev) | The WIDTH of the bell (how spread out); the variance is $\sigma^2$ |
| $\pi$ | pi | Good old 3.14159... |
| $e$ | Euler's number | 2.71828... |

**The 68-95-99.7 Rule** (the only thing you need to remember):

| Range | % of data (exact) | Example (height: $\mu=170$ cm, $\sigma=10$ cm, illustrative) |
|-------|----------|----------------------------------------|
| $\mu \pm 1\sigma$ | 68% (68.3%) | 160 to 180 cm |
| $\mu \pm 2\sigma$ | 95% (95.4%) | 150 to 190 cm |
| $\mu \pm 3\sigma$ | 99.7% (99.73%) | 140 to 200 cm |

Exactly 95% sits within $\pm 1.96\sigma$ — the 1.96 in every 95% confidence interval ([Ch 32 Q22](#content/32_interview_questions)).

**The z-score** turns any normal value into "how many standard deviations from the mean": $z = (x - \mu)/\sigma$. A 185 cm person has $z = (185 - 170)/10 = 1.5$, and a standard-normal table (the CDF, §3.1) says 93.3% of people are shorter.

In ML: Weight initialization, noise modeling, variational autoencoders ([Ch 16 §5.1](#content/16_deep_learning)); batch normalization rescales activations to mean 0 and variance 1, the standard normal's settings. Why does initialization care? Before training starts, you need to set millions of weights to some starting value. Drawing them from a zero-mean Gaussian gives mostly small weights, with a few bigger ones — and the **width** σ is what matters: too wide and signals explode layer after layer, too narrow and they fade to nothing. He initialization uses variance $2/\text{fan}_{in}$ for ReLU layers ([Ch 16 §1.8](#content/16_deep_learning)).

```chart
{
  "type": "line",
  "data": {
    "labels": [140,145,150,155,160,165,170,175,180,185,190,195,200],
    "datasets": [{
      "label": "Gaussian density (mean=170, std=10)",
      "data": [0.0004,0.0018,0.0054,0.0130,0.0242,0.0352,0.0399,0.0352,0.0242,0.0130,0.0054,0.0018,0.0004],
      "borderColor": "rgba(99, 102, 241, 1)",
      "backgroundColor": "rgba(99, 102, 241, 0.15)",
      "fill": true,
      "tension": 0.4,
      "pointRadius": 2
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Normal Distribution — Height (mean=170cm, std=10cm), peak = 1/(10·√(2π)) ≈ 0.040" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Probability Density (per cm)" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "Height (cm)" } }
    }
  }
}
```

</details>

### Poisson — Counting Rare Events

<details>
<summary><strong>Read as text</strong> — the formula, 5 hits when the average is 3, and over-dispersion</summary>

**Simple Explanation:**
How many text messages do you get per hour? Some hours 0, some hours 3, rarely 10. Poisson models this kind of "how many times does something happen in a fixed time?"

Think of it like counting shooting stars. On average you see 3 per hour, but sometimes you see none, sometimes 5. Poisson tells you the probability of each.

**Formula:**

$$P(X = k) = \frac{\lambda^k \cdot e^{-\lambda}}{k!}$$

| Symbol | What it means |
|--------|---------------|
| $\lambda$ (lambda) | Average number of events per time period |
| $k$ | The specific number you're asking about |
| $k!$ | k factorial ($k \times (k-1) \times \ldots \times 1$) |
| $e^{-\lambda}$ | A shrinking factor that makes probabilities add to 1 |

**Example:** Average 3 website hits per second. $P(\text{exactly } 5)$?

$$P(X=5) = \frac{3^5 \cdot e^{-3}}{5!} = \frac{243 \times 0.0498}{120} = 10.1\%$$

Fun fact: Mean AND Variance both equal $\lambda$!

Poisson is also the binomial for rare events: many chances, each tiny. 10,000 visitors a second, each with a 0.03% chance of hitting your endpoint, gives $\lambda = np = 3$ hits per second.

In ML: Modeling count data (event logs, requests per second, word counts). Why? If you're building a spam filter, you might ask "how many times does the word 'free' appear in this email?" That's a count — and Poisson is the starting model for counts. It tells you what's normal (3 times) vs suspicious (50 times!). **Watch out:** real counts are often *over-dispersed* — the variance is bigger than the mean, because the rate itself varies from document to document or user to user. Word counts are the classic case (Church & Gale, *Poisson mixtures*, Natural Language Engineering, 1995); a negative binomial, which lets λ vary, fits them better.

```chart
{
  "type": "bar",
  "data": {
    "labels": ["0","1","2","3","4","5","6","7","8","9","10"],
    "datasets": [
      {
        "label": "Poisson (λ=2)",
        "data": [0.135,0.271,0.271,0.180,0.090,0.036,0.012,0.003,0.001,0.000,0.000],
        "backgroundColor": "rgba(99, 102, 241, 0.6)",
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 1
      },
      {
        "label": "Poisson (λ=5)",
        "data": [0.007,0.034,0.084,0.140,0.175,0.175,0.146,0.104,0.065,0.036,0.018],
        "backgroundColor": "rgba(234, 88, 12, 0.6)",
        "borderColor": "rgba(234, 88, 12, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Poisson Distribution — Different Average Rates (λ)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Probability" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "Number of Events (k)" } }
    }
  }
}
```

</details>

### Categorical — Multiple Choices

<details>
<summary><strong>Read as text</strong> — softmax, LLM vocabularies and temperature</summary>

**Simple Explanation:**
A loaded die with K faces. Or picking a word from a dictionary. Each choice has a different probability, and they all add up to 100%.

Imagine a spinner wheel where each slice is a different size — bigger slices are more likely to be landed on.

After the prompt "The capital of France is", a language model might give (illustrative numbers):

$$P(\text{Paris}) = 0.40 \quad P(\text{the}) = 0.05 \quad P(\text{a}) = 0.03 \quad \ldots \quad \text{(all K values sum to 1)}$$

This IS what an LLM outputs — a probability for every **token** in its vocabulary: 50,257 tokens for GPT-2, 128,256 for Llama 3, about 262K for Gemma 3 ([Ch 17 §2.2](#content/17_llm)). The model then picks one token according to these probabilities.

In ML: Softmax output = categorical distribution over classes. Why? Softmax turns the network's raw scores (logits) into K positive numbers that sum to 1 — a categorical distribution. Classifiers take the most likely class; an LLM *samples* the next token from it. Dividing the logits by a **temperature** before the softmax sharpens (T < 1) or flattens (T > 1) the distribution without changing which option is most likely: logits 3.2, 1.1, −0.5 give 0.87, 0.11, 0.02 at T = 1 and 0.66, 0.23, 0.10 at T = 2 ([Ch 8 §8.16](#content/08_core_concepts); decoding: [Ch 17 §2.6](#content/17_llm); computing softmax without overflow: §6.2).

</details>

### Summary — Mean, Variance and Where Each One Shows Up

<details>
<summary><strong>Read as text</strong> — the mean and variance table and the sampling check</summary>

| Distribution | Parameters | Mean | Variance | Typical ML use |
|---|---|---|---|---|
| Bernoulli | p | p | p(1 − p) | one binary label; binary cross-entropy; dropout masks |
| Binomial | n, p | np | np(1 − p) | correct answers out of n test items |
| Gaussian | μ, σ | μ | σ² | noise, weight initialization, the MSE loss (§3.6) |
| Poisson | λ | λ | λ | events per time window |
| Categorical | p1 … pK (sum to 1) | — (an unordered label) | — | softmax output, next-token choice |
| Uniform on [a, b] | a, b | (a + b) / 2 | (b − a)² / 12 | random search over a range; uniform initialization |
| Exponential | rate λ | 1 / λ | 1 / λ² | waiting time between Poisson events (3 per second → 1/3 s on average) |
| Beta | α, β | α / (α + β) | αβ / ((α + β)² (α + β + 1)) | a belief about a rate: Bayesian A/B tests, Thompson sampling |

**Worked example — does sampling agree with the formulas?** Draw 200,000 values from each distribution, using this section's own numbers, and compare. Then check the probabilities worked out above, and the 1,000-image test.

</details>

```python
# Sampling vs formula: draw 200,000 values from each distribution and compare with the textbook mean and variance
import numpy as np
from math import comb, erf, exp, factorial, sqrt

rng = np.random.default_rng(0)
N = 200_000
spam = rng.random(N) < 0.3                       # Bernoulli, p = 0.3
heads = rng.binomial(10, 0.5, N)                 # Binomial, 10 fair flips
height = rng.normal(170, 10, N)                  # Gaussian, mean 170 cm, sd 10 cm
hits = rng.poisson(3, N)                         # Poisson, 3 hits per second
u = rng.uniform(0, 1, N)                         # Uniform on [0, 1]
wait = rng.exponential(1 / 3, N)                 # Exponential: seconds between hits at 3 per second

rows = [("Bernoulli p=0.3", spam, 0.3, 0.3 * 0.7), ("Binomial n=10 p=0.5", heads, 5, 2.5),
        ("Gaussian 170, 10", height, 170, 100), ("Poisson lambda=3", hits, 3, 3),
        ("Uniform 0..1", u, 0.5, 1 / 12), ("Exponential rate=3", wait, 1 / 3, 1 / 9)]
print(f"{'distribution':21s}{'mean':>9s}{'formula':>9s}{'variance':>10s}{'formula':>9s}")
for name, x, mean, var in rows:
    x = x.astype(float)
    print(f"{name:21s}{x.mean():9.3f}{mean:9.3f}{x.var():10.3f}{var:9.3f}")
    assert abs(x.mean() - mean) < 0.01 * max(1, mean) and abs(x.var() - var) < 0.02 * var

Phi = lambda z: 0.5 * (1 + erf(z / sqrt(2)))     # standard-normal CDF
print(f"\nP(exactly 7 heads)     simulated {np.mean(heads == 7):.3f}   formula {comb(10, 7) * 0.5 ** 10:.3f}")
print(f"P(exactly 5 hits)      simulated {np.mean(hits == 5):.3f}   formula {3 ** 5 * exp(-3) / factorial(5):.3f}")
print(f"P(170 < height < 175)  simulated {np.mean((height > 170) & (height < 175)):.3f}   formula {Phi(0.5) - 0.5:.3f}")
print(f"P(height < 185)        simulated {np.mean(height < 185):.3f}   formula {Phi(1.5):.3f}")

correct = rng.binomial(1000, 0.9, N)             # 200,000 runs of a 1,000-image test, true accuracy 90%
print(f"\n1,000-image test at 90%: mean {correct.mean():.1f}, sd {correct.std():.2f} "
      f"(formula {sqrt(1000 * 0.9 * 0.1):.2f}), P(912 or more) = {np.mean(correct >= 912):.3f}")
```

**Output:**

```
distribution              mean  formula  variance  formula
Bernoulli p=0.3          0.300    0.300     0.210    0.210
Binomial n=10 p=0.5      5.004    5.000     2.511    2.500
Gaussian 170, 10       170.026  170.000    99.950  100.000
Poisson lambda=3         3.002    3.000     2.996    3.000
Uniform 0..1             0.500    0.500     0.083    0.083
Exponential rate=3       0.333    0.333     0.111    0.111

P(exactly 7 heads)     simulated 0.117   formula 0.117
P(exactly 5 hits)      simulated 0.101   formula 0.101
P(170 < height < 175)  simulated 0.192   formula 0.191
P(height < 185)        simulated 0.933   formula 0.933

1,000-image test at 90%: mean 900.0, sd 9.51 (formula 9.49), P(912 or more) = 0.111
```

<details>
<summary><strong>Read as text</strong> — continued: what the sampling check shows</summary>

Every simulated mean and variance lands within about 1% of its formula, and the worked probabilities (11.7%, 10.1%, 19.1%, 93.3%) reappear. The last line is the binomial wobble from above: a model that is truly 90% accurate scores 912 or more on 11% of 1,000-image tests.

</details>

---

## 3.3 Expected Value, Variance, and Correlation

> **Maths in one line:** `E[X] = Σ x·P(x)`, `Var(X) = E[(X − μ)²]`, `r = Cov(X, Y) / (σ_X · σ_Y)` — the center of a random variable, its spread, and how tightly two variables move together along a straight line.

![Infographic on mean, variance and correlation: the formulas E of X = sum of x times P(x), Var(X) = expected value of (X - mu) squared and r = Cov(X, Y) / (sigma_X sigma_Y) with each symbol labelled; archers step by step, 9.5, 10.2, 9.8, 10.5 give variance 0.58 / 4 = 0.145 and 3, 17, 15, 5 give (49 + 49 + 25 + 25) / 4 = 37, drawn to scale on 0 to 20 number lines; five students, products 4, 0, 0, 0, 2 sum to 6, Cov = 1.2, r = 1.2 / (1.414 x 1.095) = 0.77, with a scatter plot; a to-scale bar chart of r for five cases (0.77, 0.77, 1.00, -0.96, 0.00); where ML uses each tool; the trap that r = 0 does not mean independent.](diagrams/math06_info_expectation_variance_correlation_ai.png)

### Expected Value (Average)

<details>
<summary><strong>Read as text</strong> — the die example and linearity of expectation</summary>

**Simple Explanation:**
If you played a game 1000 times, how much would you win ON AVERAGE? That's the expected value. It's the "center of gravity" of all possible outcomes.

Like if you get 1 dollar for heads and 0 for tails, after 1000 flips you'd expect about 500 dollars total, so 0.50 dollars per flip. That's the expected value.

**Formula:**

$$E[X] = \sum_{i} x_i \cdot P(x_i)$$

> **In plain English:** "Multiply each possible outcome by how likely it is, then add them all up."

**Example:** Roll a fair die.

$$E[X] = \left(1 \times \tfrac{1}{6}\right) + \left(2 \times \tfrac{1}{6}\right) + \left(3 \times \tfrac{1}{6}\right) + \left(4 \times \tfrac{1}{6}\right) + \left(5 \times \tfrac{1}{6}\right) + \left(6 \times \tfrac{1}{6}\right) = \frac{21}{6} = 3.5$$

You'd never actually roll 3.5, but on average over many rolls, that's the center.

**Two rules that save a lot of work** — *linearity of expectation*, true for any random variables, dependent or not:

- $E[aX + b] = a\,E[X] + b$ — rescale the outcome and the average rescales the same way. Win 2 dollars per pip: 2 × 3.5 = 7 dollars per roll on average.
- $E[X + Y] = E[X] + E[Y]$ — the average of a sum is the sum of the averages. Two dice: $3.5 + 3.5 = 7$. This is why a model's expected loss over a batch is just the average of the per-example losses.

</details>

### Variance (Spread)

<details>
<summary><strong>Read as text</strong> — the formula, the archers, combining spreads and n vs n − 1</summary>

**Simple Explanation:**
Two archers both hit the target on average (same expected value). But one is consistent (arrows close together) and one is wild (arrows all over). Variance measures how SPREAD OUT the results are.

- Low variance = predictable, consistent.
- High variance = unpredictable, all over the place.

**Formula:**

$$\text{Var}(X) = E\left[(X - \mu)^2\right]$$

> **In plain English:** "For each outcome, measure how far it is from the average. Square that distance. Then average all those squared distances."
>
> Why square? So that going 5 above and 5 below don't cancel to zero!

**Example:** Values: 1, 2, 3, 4 (each with probability 0.25). Mean $= 2.5$.

$$\text{Var} = \frac{(1-2.5)^2 + (2-2.5)^2 + (3-2.5)^2 + (4-2.5)^2}{4} = \frac{2.25 + 0.25 + 0.25 + 2.25}{4} = 1.25$$

$$\text{Standard deviation} = \sqrt{1.25} = 1.118 \quad \text{(same units as the data)}$$

**Shortcut:** $\text{Var}(X) = E[X^2] - (E[X])^2$. Same example: $E[X^2] = (1 + 4 + 9 + 16)/4 = 7.5$, so $\text{Var} = 7.5 - 2.5^2 = 1.25$. A fair die: $91/6 - 3.5^2 = 35/12 \approx 2.92$.

**The archers in numbers.** Where four arrows land, in cm from the left edge of the target (bullseye at 10):

| Archer | Arrows | Mean | Variance | Standard deviation |
|---|---|---|---|---|
| Consistent | 9.5, 10.2, 9.8, 10.5 | 10 | (0.25 + 0.04 + 0.04 + 0.25) / 4 = 0.145 | 0.38 cm |
| Wild | 3, 17, 15, 5 | 10 | (49 + 49 + 25 + 25) / 4 = 37 | 6.1 cm |

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Low Variance (consistent archer)", "High Variance (wild archer)"],
    "datasets": [
      {
        "label": "Arrow 1",
        "data": [9.5, 3],
        "backgroundColor": "rgba(99, 102, 241, 0.6)"
      },
      {
        "label": "Arrow 2",
        "data": [10.2, 17],
        "backgroundColor": "rgba(99, 102, 241, 0.45)"
      },
      {
        "label": "Arrow 3",
        "data": [9.8, 15],
        "backgroundColor": "rgba(99, 102, 241, 0.3)"
      },
      {
        "label": "Arrow 4",
        "data": [10.5, 5],
        "backgroundColor": "rgba(99, 102, 241, 0.7)"
      },
      {
        "label": "Average",
        "data": [10.0, 10.0],
        "backgroundColor": "rgba(239, 68, 68, 0.8)",
        "borderColor": "rgba(239, 68, 68, 1)",
        "borderWidth": 2
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Variance — Same Average (10), Very Different Spread (variance 0.145 vs 37)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Landing position (cm, bullseye at 10)" }, "beginAtZero": true }
    }
  }
}
```

**Rules for combining spreads:**

| Rule | In words | Example |
|---|---|---|
| Var(aX + b) = a² · Var(X) | shifting adds no spread; scaling by a multiplies the variance by a² | metres → centimetres: variance × 10,000 |
| Var(X + Y) = Var(X) + Var(Y) + 2 Cov(X, Y) | spreads add, plus a term for moving together | two independent dice: 35/12 + 35/12 ≈ 5.83 |
| Var(average of n independent copies) = σ² / n | averaging shrinks the spread; the standard error is σ / √n | the σ/√n behind the CLT (§3.5) |

**Divide by n or by n − 1?** The formulas above divide by the number of outcomes — the *population* variance. When you estimate the variance from a *sample*, dividing by n − 1 (Bessel's correction) removes a small downward bias, because the deviations are measured from the sample's own mean, which sits closer to the points than the true mean does ([Ch 32 Q21](#content/32_interview_questions)). Libraries disagree on the default: NumPy's `np.var` and `np.std` divide by n (`ddof=0`), pandas' `.var()` and `.std()` divide by n − 1 (`ddof=1`), and `np.cov` divides by n − 1. With 5 data points that is a 25% difference — pass `ddof` explicitly.

</details>

### Covariance and Correlation

<details>
<summary><strong>Read as text</strong> — the five students, Pearson's r and the two traps</summary>

**Simple Explanation:**
**Covariance** asks: "When one thing goes up, does the other go up too?"

- Taller people tend to weigh more → positive covariance
- More exercise tends to mean less body fat → negative covariance
- The last digit of your phone number and your height → zero covariance (no relationship)

**Correlation** is covariance but scaled to always be between -1 and +1, so it's easier to compare. Think of it as covariance with a "ruler" so you can compare apples to oranges.

**Formula (covariance):**

$$\text{Cov}(X, Y) = E\big[(X - \mu_X)(Y - \mu_Y)\big]$$

> **In plain English:** "For each data point, multiply how far x is above its mean by how far y is above its mean, then average." Both above (or both below) gives a positive product; one above and one below gives a negative product. $\text{Cov}(X, X) = \text{Var}(X)$.

**Formula (Pearson's r):**

$$r = \frac{\text{Cov}(X, Y)}{\sigma_X \times \sigma_Y}$$

> **In plain English:** "Divide the covariance by both standard deviations to get a number between -1 and +1."

**Worked example — five students.** Hours studied (x) and quiz score out of 10 (y). Means: $\bar{x} = 3$, $\bar{y} = 4$.

| Student | x (hours) | y (score) | x − 3 | y − 4 | product |
|---|---|---|---|---|---|
| 1 | 1 | 2 | −2 | −2 | 4 |
| 2 | 2 | 4 | −1 | 0 | 0 |
| 3 | 3 | 5 | 0 | 1 | 0 |
| 4 | 4 | 4 | 1 | 0 | 0 |
| 5 | 5 | 5 | 2 | 1 | 2 |
| **sum** | | | | | **6** |

- Cov = 6 / 5 = **1.2** (squared deviations: Var(x) = 10 / 5 = 2, Var(y) = 6 / 5 = 1.2)
- r = 1.2 / (√2 × √1.2) = 1.2 / (1.414 × 1.095) = **0.77** — a strong positive relationship
- Measure the score in percent instead (× 10): Cov becomes 12, but r stays 0.77. Covariance depends on the units; correlation does not.

| Value | Meaning |
|-------|---------|
| $r = +1.0$ | Perfect positive (all points on a rising straight line) |
| $r = +0.7$ | Strong positive |
| $r = 0.0$ | No *straight-line* relationship |
| $r = -0.7$ | Strong negative |
| $r = -1.0$ | Perfect negative (all points on a falling straight line) |

> **CAUTION:** Correlation does NOT mean causation! Ice cream sales and drowning are correlated. But ice cream doesn't cause drowning. Both increase in hot weather — a *confounder*. Confounders, Simpson's paradox and how to test for causation: [Ch 32 Q15](#content/32_interview_questions).

**Two more traps interviewers like:**

- **r = 0 does not mean independent.** r only measures straight-line relationships: for x = −2, −1, 0, 1, 2 and y = x², y is completely determined by x, yet r = 0. Independence implies zero correlation, not the other way round. Spearman's rank correlation (Pearson's r computed on the ranks) catches any curve that only goes up or only goes down.
- **One outlier can make or break r.** Plot the data before trusting the number.

In ML: Feature selection, understanding data, detecting multicollinearity. Why? Before training, you want to check if any features are "copies" of each other. If height-in-cm and height-in-inches both go into your model, that's wasted effort. Correlation catches these duplicates (r = 1) so you can drop one and keep your model lean. The **covariance matrix** — every pair's covariance, with variances on the diagonal — is what PCA decomposes (§1.6).

</details>

```python
# Covariance and correlation by hand for 5 students, then four contrast cases
import numpy as np

hours = np.array([1, 2, 3, 4, 5], dtype=float)
score = np.array([2, 4, 5, 4, 5], dtype=float)          # quiz score out of 10

def cov(x, y):                                          # population covariance: divide by n
    return np.mean((x - x.mean()) * (y - y.mean()))

def corr(x, y):
    return cov(x, y) / (x.std() * y.std())              # np.std also divides by n, so the n's cancel

c, r = cov(hours, score), corr(hours, score)
print(f"Cov(hours, score) = {c:.2f} (divide by n);  np.cov gives {np.cov(hours, score)[0, 1]:.2f} (divides by n - 1)")
print(f"r = {c:.2f} / ({hours.std():.3f} x {score.std():.3f}) = {r:.2f};  np.corrcoef gives {np.corrcoef(hours, score)[0, 1]:.2f}")
assert np.isclose(r, np.corrcoef(hours, score)[0, 1])

cases = {
    "score in % (x10)":      (hours, score * 10),               # new units: Cov changes, r does not
    "minutes studied (x60)": (hours, hours * 60),               # a duplicate feature
    "mistakes made":         (hours, np.array([8, 6, 5, 5, 3], dtype=float)),
    "y = x^2, x = -2..2":    (hours - 3, (hours - 3) ** 2),     # fully dependent, but curved
}
print()
for name, (x, y) in cases.items():
    print(f"{name:22s} Cov = {cov(x, y):7.2f}   r = {corr(x, y):5.2f}")
assert np.isclose(corr(*cases["score in % (x10)"]), r) and abs(corr(*cases["y = x^2, x = -2..2"])) < 1e-12
```

**Output:**

```
Cov(hours, score) = 1.20 (divide by n);  np.cov gives 1.50 (divides by n - 1)
r = 1.20 / (1.414 x 1.095) = 0.77;  np.corrcoef gives 0.77

score in % (x10)       Cov =   12.00   r =  0.77
minutes studied (x60)  Cov =  120.00   r =  1.00
mistakes made          Cov =   -2.20   r = -0.96
y = x^2, x = -2..2     Cov =    0.00   r =  0.00
```

<details>
<summary><strong>Read as text</strong> — continued: why the divisor cancels, and the five r values side by side</summary>

The divisor changes the covariance (1.20 vs 1.50) but not r, because it cancels between the top and the bottom of the fraction. The chart shows the five r values side by side.

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Hours vs score", "Hours vs score in % (new units)", "Hours vs minutes (duplicate feature)", "Hours vs mistakes", "x vs x² (curved, fully dependent)"],
    "datasets": [{
      "label": "Pearson Correlation (r)",
      "data": [0.77, 0.77, 1.00, -0.96, 0.00],
      "backgroundColor": ["rgba(34,197,94,0.7)","rgba(34,197,94,0.6)","rgba(34,197,94,0.8)","rgba(239,68,68,0.6)","rgba(200,200,200,0.6)"],
      "borderColor": ["rgba(34,197,94,1)","rgba(34,197,94,1)","rgba(34,197,94,1)","rgba(239,68,68,1)","rgba(160,160,160,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "indexAxis": "y",
    "plugins": { "title": { "display": true, "text": "Correlation r for the Five Students — Units Don't Change r; a Curve Can Hide Behind r = 0" } },
    "scales": {
      "x": { "title": { "display": true, "text": "Correlation (r)" }, "min": -1, "max": 1 }
    }
  }
}
```

</details>

---

## 3.4 Bayes' Theorem — Updating Beliefs with Evidence ★★★

![Infographic on Bayes' theorem: P(A | B) = P(B | A) times P(A) / P(B) with posterior, likelihood, prior and evidence labelled; the medical test step by step, P(+) = 0.0099 + 0.0495 = 0.0594 and P(disease | +) = 0.0099 / 0.0594 = 16.7%, with a to-scale bar showing false alarms outnumber real cases 5 to 1; a 10,000-person tree (100 sick: 99 positive, 1 negative; 9,900 healthy: 495 positive, 9,405 negative) giving 99 / 594 = 16.7%; repeated tests multiply the odds by LR = 19.8, so 1% becomes 16.7%, 79.8% and 98.7%, shown as a to-scale bar chart; where ML uses Bayes; the base-rate trap from the 1978 Harvard survey.](diagrams/math06_info_bayes_theorem_ai.png)

<details>
<summary><strong>Read as text</strong> — prior, likelihood, the medical test, the base-rate fallacy and repeated tests</summary>

**Simple Explanation:**
Alex hears a barking sound. Before looking, Alex thinks "probably a dog" (PRIOR belief — 90% dog, 10% something else). Then Alex looks and sees a leash on the ground. A leash makes dogs MORE likely (EVIDENCE). Now Alex updates to "99% sure it's a dog" (POSTERIOR belief).

Why 99%? Before looking, the odds are 90 : 10, or 9 to 1, for a dog. Suppose a leash is 11 times more likely to be lying there when the barker is a dog than when it is not. Multiply: 9 × 11 = 99 to 1 — that is 99%. (This "odds form" is worked out below.)

Bayes' theorem is the math for updating beliefs when new evidence arrives. It's like being a detective — start with a guess, then update it every time a new clue arrives.

```
  THE BAYES PROCESS:

  ┌──────────┐     New evidence      ┌────────────┐
  │  PRIOR   │ ──── arrives ──────►  │ POSTERIOR  │
  │ (old     │     (something        │ (updated   │
  │  belief) │      observed)        │  belief)   │
  └──────────┘                       └────────────┘
       │                                   │
   "1% of people                    "Given the positive
    have this disease"               test, 16.7% chance
                                     of having disease"

  The belief SHIFTS based on how well the evidence
  fits each possible explanation.
```

**Formula:**

$$P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}$$

> **Maths in one line:** `P(A | B) = P(B | A) · P(A) / P(B)` — new belief = how well the evidence fits × old belief ÷ how common the evidence is overall. Same thing in odds: posterior odds = prior odds × likelihood ratio.

> Let's name each piece:

| Piece | Name | What it means | Analogy |
|-------|------|---------------|---------|
| $P(A)$ | **PRIOR** | What was believed BEFORE seeing evidence | "1% of people have the disease" |
| $P(B \mid A)$ | **LIKELIHOOD** | How likely is this evidence IF A is true? | "If Alex is sick, 99% chance the test says positive" |
| $P(B)$ | **EVIDENCE** | Total probability of seeing this evidence at all | "What % of ALL people test positive (sick or not)?" |
| $P(A \mid B)$ | **POSTERIOR** | The UPDATED belief AFTER seeing evidence | "Given Alex tested positive, what's the chance Alex is actually sick?" |

> **In plain English:** "New belief = (how well the evidence fits × old belief) / how common the evidence is"

The key insight is the **direction flip**: we know $P(B|A)$ (how likely is the evidence given the cause) and we want $P(A|B)$ (how likely is the cause given the evidence). These are NOT the same! Bayes lets us flip from one to the other. It is just the conditional-probability definition from §3.1b used twice: $P(A \cap B) = P(B \mid A)\,P(A) = P(A \mid B)\,P(B)$, then divide by $P(B)$.

---

**Step-by-Step Example 1: Medical test**

Given:
- Disease affects 1 in 100 people: $P(\text{disease}) = 0.01$
- Test catches 99% of sick people: $P(\text{positive} \mid \text{disease}) = 0.99$
- Test has 5% false positive rate: $P(\text{positive} \mid \text{healthy}) = 0.05$

Alex tests positive. What's the chance Alex is actually sick?

**Step 1 — Map to the formula:**

| Piece | In this problem | Value |
|-------|----------------|-------|
| $A$ | Having the disease | — |
| $B$ | Testing positive | — |
| $P(A)$ — Prior | How common is the disease? | 0.01 |
| $P(B \mid A)$ — Likelihood | If sick, chance of positive test? | 0.99 |
| $P(\text{not } A)$ | How common is being healthy? | 0.99 |
| $P(B \mid \text{not } A)$ | If healthy, chance of positive test? (false positive) | 0.05 |

**Step 2 — Compute $P(\text{positive})$ — the total probability of testing positive for ANY reason:**

This is the trickiest part. Someone can test positive in TWO ways: (a) they're sick AND the test caught it, or (b) they're healthy BUT the test gave a false alarm. Add both — this is the law of total probability from §3.1b:

$$P(\text{positive}) = P(\text{pos}|\text{disease}) \cdot P(\text{disease}) + P(\text{pos}|\text{healthy}) \cdot P(\text{healthy})$$

$$= \underbrace{(0.99)(0.01)}_{\text{true positives}} + \underbrace{(0.05)(0.99)}_{\text{false positives}} = 0.0099 + 0.0495 = 0.0594$$

Notice: false positives (0.0495) outnumber true positives (0.0099) five to one! Because healthy people outnumber sick people 99-to-1.

**Step 3 — Apply Bayes' formula:**

$$P(\text{disease} \mid \text{positive}) = \frac{P(\text{pos}|\text{disease}) \times P(\text{disease})}{P(\text{positive})} = \frac{0.99 \times 0.01}{0.0594} = \frac{0.0099}{0.0594} = 16.7\%$$

Even with a positive test, there's only a 16.7% chance Alex is actually sick!

---

**Why is the answer so low? The Base Rate Fallacy**

Most people's gut says "the test is 99% accurate, so Alex is 99% likely to be sick." This is WRONG, and it's one of the most common reasoning mistakes humans make. Here's why:

The disease is very rare (1 in 100). So for every 1 sick person who correctly tests positive, there are roughly 5 healthy people who ALSO test positive (false alarms). The "base rate" — how rare the disease is — drowns out the test accuracy.

Doctors fall for it too. In 1978, Casscells and colleagues asked 60 students and doctors at Harvard Medical School: a disease affects 1 in 1,000 people and the test has a 5% false-positive rate — what is the chance that someone who tests positive has it? Only 11 of 60 gave the right answer, about 2%; the most common answer was 95% (Casscells et al., NEJM 1978). A 2014 repeat with 61 doctors and students in Boston got almost the same result: 14 correct, and 27 answered 95% (Manrai et al., JAMA Internal Medicine 2014).

**The easiest way to see it: think about 10,000 people**

```
  10,000 PEOPLE TAKE THE TEST
  ├── 100 actually have the disease (1%)
  │   ├── 99 test POSITIVE ✓  (true positives — test caught them)
  │   └──  1 tests negative    (false negative — test missed them)
  │
  └── 9,900 are healthy (99%)
      ├── 495 test POSITIVE ✗  (false positives — healthy but test said sick!)
      └── 9,405 test negative   (true negatives — correctly cleared)
```

Total who test positive $= 99 + 495 =$ **594 people**

Of those 594, only **99 are actually sick**.

$$P(\text{sick} \mid \text{positive}) = \frac{99}{594} = 16.7\%$$

Same answer, but now it's easy to SEE. The 495 false alarms flood the 99 real cases. Counting people like this ("natural frequencies") is the format most people reason best in: in Gigerenzer and Hoffrage's experiments, untrained participants reached the Bayesian answer up to about half the time when the numbers were given as frequencies (Psychological Review, 1995), and a 2017 meta-analysis of 35 articles confirmed the advantage (McDowell & Jacobs, Psychological Bulletin).

**The names for these numbers** — you will meet them again in [Ch 8 §8.16](#content/08_core_concepts) and [Ch 13](#content/13_model_evaluation):

| Term | Meaning | In the 10,000 people |
|---|---|---|
| Sensitivity (= recall) | chance a sick person tests positive | 99 / 100 = 99% |
| Specificity | chance a healthy person tests negative | 9,405 / 9,900 = 95% |
| False-positive rate | 1 − specificity | 495 / 9,900 = 5% |
| Precision (= PPV, positive predictive value) | chance a positive is really sick | 99 / 594 = 16.7% |
| NPV (negative predictive value) | chance a negative is really healthy | 9,405 / 9,406 = 99.99% |

So Bayes' answer is simply the test's **precision** — which is why precision collapses on rare classes even for a good classifier. A negative result, on the other hand, is very reassuring.

> **The lesson:** When the thing you're looking for is RARE, even a good test produces mostly false alarms. This is why doctors order a SECOND test after a positive — the second test updates the prior from 16.7% (not 1%), and the answer jumps much higher.

---

**Sequential Updating — Applying Bayes Multiple Times**

What if Alex tests positive TWICE, on two tests whose errors are independent? After the first positive, the belief is 16.7% (exactly 1/6). Now use THAT as the new prior:

$$P(\text{disease} \mid \text{2nd positive}) = \frac{(0.99)(0.1667)}{(0.99)(0.1667) + (0.05)(0.8333)} = \frac{0.1650}{0.1650 + 0.0417} = \frac{0.1650}{0.2067} = 79.8\%$$

Two positive tests → 79.8% chance of disease. A third positive test → 98.7%. Each piece of evidence keeps updating the belief. This is the power of Bayes — beliefs get sharper with more evidence.

**The odds form makes chaining easy.** Odds = P / (1 − P). Each positive result multiplies the odds by the same **likelihood ratio**, LR = sensitivity ÷ false-positive rate = 0.99 / 0.05 = 19.8:

| Step | Odds of disease | Probability |
|---|---|---|
| Before any test | 1 : 99 ≈ 0.0101 | 1% |
| After 1st positive | 0.0101 × 19.8 = 0.20 (1 : 5) | 16.7% |
| After 2nd positive | 0.20 × 19.8 = 3.96 | 79.8% |
| After 3rd positive | 3.96 × 19.8 = 78.4 | 98.7% |

**Watch out:** multiplying likelihood ratios assumes the tests' errors are independent *given* disease status (§3.1b). Re-running the same test on the same sample usually breaks that — whatever fooled it once can fool it again — so in practice the confirmatory test is a different one.

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Prior P(disease)", "After 1st positive test", "After 2nd positive test", "After 3rd positive test"],
    "datasets": [{
      "label": "Probability (%)",
      "data": [1.0, 16.7, 79.8, 98.7],
      "backgroundColor": ["rgba(99, 102, 241, 0.7)", "rgba(234, 88, 12, 0.7)", "rgba(239, 68, 68, 0.7)", "rgba(220, 38, 38, 0.8)"],
      "borderColor": ["rgba(99, 102, 241, 1)", "rgba(234, 88, 12, 1)", "rgba(239, 68, 68, 1)", "rgba(220, 38, 38, 1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Bayes in Action — How Beliefs Sharpen with Repeated Evidence (%)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "P(disease) %" }, "beginAtZero": true, "max": 105 },
      "x": {}
    }
  }
}
```

**Same maths, different numbers.** Other chapters run this example with other inputs. All are correct — the answer swings with the prior and the false-positive rate:

| Prevalence (prior) | Sensitivity | False-positive rate | Chance sick if positive | Where |
|---|---|---|---|---|
| 1% | 99% | 5% | 16.7% | this section |
| 1% | 95% | 5% | 16.1% | [Ch 8 §8.16](#content/08_core_concepts) |
| 1% | 99% | 1% | 50.0% | [Ch 04 §3.20](#content/04_aptitude_mental_math) |
| 0.1% | 99% | 1% | 9.0% | [Ch 32 Q18](#content/32_interview_questions) |
| 0.1% | 100% | 5% | 2.0% | Casscells et al. 1978 (above) |
| 10% | 99% | 5% | 68.8% | — |

**Worked example — the medical test as a program.** Build the 2 × 2 table from 10,000 people, check it against the formula, chain three positive tests with the odds form, then vary the prior.

</details>

```python
# Bayes for a medical test: count 10,000 people, check the formula, chain tests, and vary the prior
prior, sens, fpr = 0.01, 0.99, 0.05                     # P(disease), P(+ | disease), P(+ | healthy)

def posterior(prior, sens=0.99, fpr=0.05):              # P(disease | positive test)
    evidence = sens * prior + fpr * (1 - prior)          # law of total probability: P(positive)
    return sens * prior / evidence

people = 10_000
sick = round(people * prior)                             # 100 people have the disease
tp = round(sick * sens)                                  # 99 caught
fn = sick - tp                                           # 1 missed
fp = round((people - sick) * fpr)                        # 495 false alarms
tn = people - sick - fp                                  # 9,405 correctly cleared
print(f"{'':10s}{'test +':>8s}{'test -':>8s}{'total':>8s}")
print(f"{'sick':10s}{tp:8d}{fn:8d}{sick:8d}")
print(f"{'healthy':10s}{fp:8d}{tn:8,d}{people - sick:8,d}")
print(f"{'total':10s}{tp + fp:8d}{fn + tn:8,d}{people:8,d}")
ppv = tp / (tp + fp)
print(f"\nP(sick | +)    = {tp}/{tp + fp} = {ppv:.1%}   formula {posterior(prior):.1%}")
print(f"P(healthy | -) = {tn:,}/{fn + tn:,} = {tn / (fn + tn):.2%}")
assert abs(ppv - posterior(prior)) < 1e-12

lr = sens / fpr                                          # likelihood ratio of a positive result
odds, p = prior / (1 - prior), prior
print(f"\nlikelihood ratio = {sens} / {fpr} = {lr:.1f}")
for test in (1, 2, 3):                                   # yesterday's posterior is today's prior
    p, odds = posterior(p), odds * lr
    print(f"after positive test {test}: {p:.1%}   (odds {odds:.2f} : 1)")
    assert abs(p - odds / (1 + odds)) < 1e-12

print("\nsame test, different prevalence:")
for prev in (0.001, 0.01, 0.10, 0.50):
    print(f"  prior {prev:5.1%} -> P(sick | +) = {posterior(prev):5.1%}")
print(f"Casscells 1978 (1 in 1,000, 5% false positives, perfect sensitivity): {posterior(0.001, sens=1.0):.2%}")
```

**Output:**

```
            test +  test -   total
sick            99       1     100
healthy        495   9,405   9,900
total          594   9,406  10,000

P(sick | +)    = 99/594 = 16.7%   formula 16.7%
P(healthy | -) = 9,405/9,406 = 99.99%

likelihood ratio = 0.99 / 0.05 = 19.8
after positive test 1: 16.7%   (odds 0.20 : 1)
after positive test 2: 79.8%   (odds 3.96 : 1)
after positive test 3: 98.7%   (odds 78.41 : 1)

same test, different prevalence:
  prior  0.1% -> P(sick | +) =  1.9%
  prior  1.0% -> P(sick | +) = 16.7%
  prior 10.0% -> P(sick | +) = 68.8%
  prior 50.0% -> P(sick | +) = 95.2%
Casscells 1978 (1 in 1,000, 5% false positives, perfect sensitivity): 1.96%
```

<details>
<summary><strong>Read as text</strong> — continued: the lesson, the spam filter and where Bayes shows up in ML</summary>

The test never changed — only the prior did — yet a positive result means anything from 1.9% to 95.2%. Always ask how common the condition is before trusting a positive.

---

**Step-by-Step Example 2: Spam filter**

A simple spam filter sees an email containing the word "FREE."

Given:
- 20% of emails are spam: $P(\text{spam}) = 0.20$
- 80% of spam emails contain "FREE": $P(\text{"FREE"} \mid \text{spam}) = 0.80$
- 10% of normal emails contain "FREE": $P(\text{"FREE"} \mid \text{not spam}) = 0.10$

Is this email spam?

$$P(\text{"FREE"}) = (0.80)(0.20) + (0.10)(0.80) = 0.16 + 0.08 = 0.24$$

$$P(\text{spam} \mid \text{"FREE"}) = \frac{(0.80)(0.20)}{0.24} = \frac{0.16}{0.24} = 66.7\%$$

The word "FREE" bumped the spam probability from 20% (prior) to 66.7% (posterior).

If the email also contains "WINNER," Bayes updates again using 66.7% as the new prior. Suppose "WINNER" appears in 30% of spam and 1% of normal email (made-up numbers), and assume the two words are independent *given the class* — the Naive Bayes assumption. The odds go from 2 : 1 (that is 66.7%) to 2 × (0.30 / 0.01) = 60 : 1, which is 98.4%. Repeating that multiply-by-the-likelihood-ratio step for every word in the email is the whole Naive Bayes classifier ([Ch 12 §12.9](#content/12_key_algorithms)).

---

**Where Bayes shows up in ML:**

| ML Application | Prior | Evidence | Posterior |
|---------------|-------|----------|-----------|
| **Naive Bayes classifier** ([Ch 12 §12.9](#content/12_key_algorithms)) | Class frequency in training data | Features of new input | Predicted class probabilities |
| **Spam filter** | "20% of emails are spam" | Words in the email | "This email is 95% spam" |
| **Bayesian optimization** ([Ch 13 §13.8](#content/13_model_evaluation)) | A surrogate model of how the score depends on the hyperparameters | Result of each trial | Updated surrogate → pick the next trial |
| **MAP estimation** (§3.6) | A prior on the weights: Gaussian prior = L2, Laplace prior = L1 regularization | Training data | The most probable weights |
| **New class mix in production** ([Ch 32 Q18](#content/32_interview_questions)) | The training set's class frequencies | The model's score | Probabilities re-scaled to the deployment frequencies |
| **LLM in-context learning** (one theory) | Model's pretrained knowledge | Few-shot examples in the prompt | Updated predictions — Xie et al. (ICLR 2022) prove this view only in a simplified synthetic setting |

Why? Models constantly need to update what they believe. A spam filter starts thinking "most emails are fine" (prior), then sees the words "FREE MONEY" (evidence) and updates to "probably spam" (posterior). That update step is Bayes' theorem. Bayesian optimization runs the same loop over experiments: each finished trial updates its belief about which settings are best, and that belief picks the next trial.

</details>

---

## 3.5 Central Limit Theorem (CLT)

![Infographic on the Central Limit Theorem: the average of N draws is approximately normal with mean mu and variance sigma squared / N, so SE = sigma / sqrt N, with each symbol labelled; the error bar step by step for one Uniform(0, 1) number (sigma = sqrt(1/12) = 0.289, then 0.204, 0.129 and 0.053 for N = 2, 5, 30) and a to-scale ruler showing 4 times the data halves the error bar (0.0527 vs 0.0264); four to-scale histograms of 100,000 averages turning from flat to triangle to bell to a narrow spike, with the share within 1.96 SE (100%, 95.9%, 95.2%, 95.1%); an accuracy error bar, 91.0% on 1,000 examples gives SE 0.9 points and a 95% interval of 89.2% to 92.8% on a shaded bell; where ML uses the CLT; the trap that the CLT makes the average bell-shaped, not the data.](diagrams/math06_info_central_limit_theorem_ai.png)

<details>
<summary><strong>Read as text</strong> — the dice, the theorem, its two conditions and the numbers</summary>

**Simple Explanation:**
Roll one die: every face from 1 to 6 is equally likely — a flat shape, nothing like a bell. Roll two dice and add them: a total of 7 is now the most common (6 of the 36 combinations) and 2 or 12 the rarest (1 each) — a triangle. Add up ten dice and the totals pile up in a smooth bell around 35.

That is the Central Limit Theorem: **add or average many independent random numbers and the result is close to a bell curve (a Gaussian), whatever shape the single numbers had.** The bell is centred on the true mean and gets *narrower* the more numbers you average — which is why averages can be trusted, and one reason the Gaussian turns up everywhere.

> **Maths in one line:** $\bar{X}_N \approx \mathcal{N}\!\left(\mu,\ \sigma^2/N\right)$, so the standard error is $\text{SE} = \sigma/\sqrt{N}$ — the average of $N$ draws is centred on the true mean $\mu$, and its typical error shrinks with $\sqrt{N}$: 4× the data only halves the error bar.

**The Theorem:**

> If $X_1, \dots, X_N$ are **independent** draws from the same distribution with mean $\mu$ and **finite** variance $\sigma^2$, then as $N$ grows the standardised average $\sqrt{N}\,(\bar{X}_N - \mu)/\sigma$ approaches the standard normal $\mathcal{N}(0, 1)$ — whatever the shape of the original distribution.

Both conditions matter. **Independence:** many sessions from one user, or a time series, break it, and the naive error bar comes out too small. **Finite variance:** very heavy-tailed data (the Cauchy distribution) never settle — an average of 1,000 Cauchy values is as spread out as a single one. How big $N$ must be depends on the skew: mild data look bell-shaped by $N \approx 30$; very skewed metrics such as revenue per user can need thousands ([Ch 32 Q19](#content/32_interview_questions) simulates both).

**With numbers.** One Uniform(0, 1) number — any value from 0 to 1, all equally likely — has $\mu = 0.5$ and $\sigma = \sqrt{1/12} = 0.289$. Average $N$ of them, 100,000 times over:

```
  Averages of N Uniform(0, 1) numbers: axis 0 → 1 in 20 bins (each row scaled to its own peak)

  N = 1    |████████████████████|   flat: every value equally likely       SD 0.289
  N = 2    | ▁▂▃▄▅▅▆▇██▇▆▅▅▄▃▂▁ |   triangle                               SD 0.204
  N = 5    |    ▁▂▃▅▇██▇▅▄▂▁    |   bell                                   SD 0.129
  N = 30   |       ▁▃██▃▁       |   narrow bell around the true mean 0.5   SD 0.053
            0        0.5       1

  SD of the average = σ / √N = 0.289 / √N   →   N = 2: 0.204,  N = 5: 0.129,  N = 30: 0.053
```

**Run it yourself** — the same four rows: the share of averages in each 0.1-wide bin, the measured spread against $\sigma/\sqrt{N}$, and how often the average lands within $\pm 1.96$ SE of 0.5 (a true bell curve puts 95% there).

</details>

```python
# CLT by simulation: averages of N uniform numbers turn into a bell curve with spread sigma / sqrt(N)
import numpy as np

rng = np.random.default_rng(0)
mu, sigma = 0.5, np.sqrt(1 / 12)              # one Uniform(0, 1) number: mean 0.5, SD 0.289
edges = np.linspace(0, 1, 11)                 # ten bins of width 0.1

print("N    share of the averages in each 0.1-wide bin, 0.0-0.1 ... 0.9-1.0   SD     sigma/sqrt(N)  within 1.96 SE")
for N in (1, 2, 5, 30):
    means = rng.uniform(0, 1, size=(100_000, N)).mean(axis=1)    # 100,000 averages of N numbers each
    share = np.histogram(means, edges)[0] / len(means)
    se = sigma / np.sqrt(N)                                      # the CLT's prediction for the spread
    inside = np.mean(np.abs(means - mu) < 1.96 * se)            # a true bell curve puts 95% here
    print(f"{N:<3} " + " ".join(f"{s:4.0%}" for s in share)
          + f"   {means.std():.3f}  {se:.3f}          {inside:.1%}")
    assert abs(means.std() / se - 1) < 0.01                      # spread = sigma / sqrt(N) for every N

# Contrast: 4x the data only halves the error bar
print(f"SE of the average: N = 30 -> {sigma / np.sqrt(30):.4f},  N = 120 -> {sigma / np.sqrt(120):.4f}")
```

**Output:**

```
N    share of the averages in each 0.1-wide bin, 0.0-0.1 ... 0.9-1.0   SD     sigma/sqrt(N)  within 1.96 SE
1    10%  10%  10%  10%  10%  10%  10%  10%  10%  10%   0.288  0.289          100.0%
2     2%   6%  10%  14%  18%  18%  14%  10%   6%   2%   0.204  0.204          95.9%
5     0%   1%   5%  16%  27%  27%  17%   5%   1%   0%   0.129  0.129          95.2%
30    0%   0%   0%   3%  47%  47%   3%   0%   0%   0%   0.053  0.053          95.1%
SE of the average: N = 30 -> 0.0527,  N = 120 -> 0.0264
```

<details>
<summary><strong>Read as text</strong> — continued: reading the output and where ML uses it</summary>

Two things to read off. The spread matches $\sigma/\sqrt{N}$ for *every* $N$ — that part is plain algebra and needs no CLT. What the CLT adds is the *shape*: the "95% within 1.96 SE" rule is wrong for one number (100%: a flat shape has no tails) and already close by $N = 5$ (95.2%).

**Why it matters for ML:**
1. **Mini-batch gradients** are averages of per-example gradients, so their noise shrinks like $1/\sqrt{B}$ for a batch of $B$ examples — 4× the batch only halves it (§4.1 measures it).
2. **Error bars on metrics.** 91.0% accuracy on 1,000 test examples has $\text{SE} = \sqrt{0.91 \times 0.09 / 1000} = 0.009$, i.e. 0.9 points, so the 95% interval is about 89.2–92.8% — a 1-point gap between two models on that test set is inside the noise (§3.7). The same CLT standard error is what Anthropic's *Adding Error Bars to Evals* (Miller, 2024) recommends for LLM benchmarks.
3. **A/B tests** and the z-test of §3.7 rely on the average being bell-shaped.
4. **Gaussian noise assumptions** work well in practice partly because a measurement error made of many small independent effects is close to Gaussian.

> **Watch out:** the CLT makes the *average* bell-shaped, not the data — and "$N \ge 30$ is always enough" is a myth for skewed or heavy-tailed data.

</details>

---

## 3.6 MLE (Maximum Likelihood Estimation) ★★

![Infographic on maximum likelihood: theta* = argmax over theta of the sum of log P(x_i | theta) with each symbol labelled; 7 heads in 10 flips, L(p) = p^7 (1 - p)^3 gives 0.00098 at p = 0.5, 0.00222 at p = 0.7 and 0.00048 at p = 0.9, with a to-scale bar chart peaking at 0.7; calculus step by step, 7/p - 3/(1 - p) = 0 gives p-hat = 0.7, SE 0.145 and a 95% range of 0.42 to 0.98 that includes the fair coin, versus 0.70 plus or minus 0.03 for 1,000 flips; the average negative log-likelihood 0.611 nats equals the cross-entropy, and MAP with a Beta(2, 2) prior gives 0.667 on a to-scale number line; a table linking MSE, cross-entropy, L2 and L1 to MLE and MAP; the trap that the likelihood is not the probability that theta is right.](diagrams/math06_info_maximum_likelihood_ai.png)

<details>
<summary><strong>Read as text</strong> — the coin, the formula, the calculus, the error bar and MAP</summary>

**Simple Explanation:**
You find a coin and flip it 10 times: 7 heads, 3 tails. What's the probability of heads for THIS coin?

MLE says: "Pick the value that makes the data you SAW most likely." Try three candidates. A fair coin ($p = 0.5$) gives this exact sequence of flips the probability $0.5^{10} = 0.00098$; $p = 0.7$ gives $0.7^{7} \times 0.3^{3} = 0.00222$, 2.3× more; $p = 0.9$ gives only $0.9^{7} \times 0.1^{3} = 0.00048$. The winner is $p = 0.7$ — the fraction of heads you saw. That's your answer!

It's like being a detective looking at evidence and asking: "What story best explains all the clues I found?"

> **Maths in one line:** $\theta^{*} = \arg\max_{\theta} \sum_i \log P(x_i \mid \theta)$ — choose the settings $\theta$ under which the observed data are most probable. Taking logs changes nothing about which $\theta$ wins, but turns a product of many tiny probabilities into a sum.

**Formula:**

$$\theta^{*} = \operatorname*{argmax}_{\theta} \sum_{i} \log P(x_i \mid \theta)$$

> **In plain English:** "Find the settings ($\theta$) that make your observed data most probable."

How it works, step by step:
1. For each data point, ask: "How likely is this point given settings $\theta$?"
2. Take the $\log$ of each answer (makes the math easier, same result)
3. Add them all up
4. Find the $\theta$ that makes this sum as BIG as possible

**Worked example — the coin by calculus.** With 7 heads in 10 flips, set the derivative of the log-likelihood to zero:

$$\log L(p) = 7 \log p + 3 \log (1 - p) \qquad \frac{d \log L}{dp} = \frac{7}{p} - \frac{3}{1-p} = 0 \;\Rightarrow\; \hat{p} = \frac{7}{10} = 0.7$$

In general $\hat{p} = k/n$ for $k$ heads in $n$ flips. For a Gaussian the same recipe gives the sample mean $\hat{\mu} = \frac{1}{n}\sum_i x_i$ and the divide-by-$n$ variance $\hat{\sigma}^2 = \frac{1}{n}\sum_i (x_i - \hat{\mu})^2$ — slightly too small on average, which is why the usual sample variance divides by $n - 1$ instead.

**How sure is 0.7?** The sharper the peak of $\log L$, the surer the estimate; its curvature gives the standard error $\sqrt{\hat{p}(1-\hat{p})/n} = \sqrt{0.21/10} = 0.145$. With 10 flips the 95% range is about 0.42 to 0.98 — a fair coin is not ruled out. 700 heads in 1,000 flips gives 0.70 ± 0.03. (That is the CLT of §3.5 again.)

**This is exactly LLM pre-training:**

$$\theta^{*} = \operatorname*{argmax}_{\theta} \sum_{i} \log P(\text{next word} \mid \text{previous words},\ \theta)$$

Which is the SAME as:

$$\theta^{*} = \operatorname*{argmin}_{\theta} \sum_{i} {-\log P(\text{next word} \mid \text{previous words},\ \theta)}$$

> That $-\log P$ is the cross-entropy loss (§5.2). For the coin, the average $-\log P$ at $\hat{p} = 0.7$ is $-(0.7 \ln 0.7 + 0.3 \ln 0.3) = 0.611$ nats — the binary cross-entropy of the ten flips. Minimising MSE is MLE in the same way, when the noise is Gaussian.

**Bonus — adding beliefs about what $\theta$ should look like:**

MLE + a prior belief about $\theta$ = MAP (Maximum A Posteriori): maximise $\log P(\text{data} \mid \theta) + \log P(\theta)$.
- Coin: a Beta(2, 2) prior acts like one imaginary head and one imaginary tail, so MAP $= (7 + 1)/(10 + 2) = 0.667$ — pulled a little towards 0.5
- L2 regularization = believing weights should be small (Gaussian prior)
- L1 regularization = believing many weights should be zero (Laplace prior) — both in §4.5

**Run it yourself** — the coin by search and by calculus, the cross-entropy link, the error bar, MAP, and a Gaussian fit to the five plant heights of [Ch 32 Q21](#content/32_interview_questions).

</details>

```python
# MLE by search and by calculus: the chapter's coin (7 heads in 10), its link to cross-entropy, and a Gaussian
import numpy as np

heads, n = 7, 10
def log_lik(p):                                   # log P(data | p) = 7 log p + 3 log(1 - p)
    return heads * np.log(p) + (n - heads) * np.log(1 - p)

p_grid = np.linspace(0.01, 0.99, 99)
p_hat = p_grid[np.argmax(log_lik(p_grid))]        # brute-force search over p
print(f"grid search: p_hat = {p_hat:.2f}   calculus (7/p - 3/(1-p) = 0): p_hat = {heads / n:.2f}")
for p in (0.5, 0.7, 0.9):
    print(f"  p = {p}: log-likelihood {log_lik(p):7.3f}   likelihood {np.exp(log_lik(p)):.5f}")
assert abs(p_hat - heads / n) < 1e-9

# Average negative log-likelihood at p_hat = binary cross-entropy of the 10 flips
nll = -log_lik(p_hat) / n
bce = -(0.7 * np.log(0.7) + 0.3 * np.log(0.3))
print(f"average NLL at p_hat = {nll:.4f} nats = binary cross-entropy {bce:.4f}")
assert np.isclose(nll, bce)

# How sure is 0.7? Curvature of the log-likelihood -> standard error sqrt(p(1-p)/n)
for k, m in [(7, 10), (700, 1000)]:
    p = k / m
    print(f"  {k} of {m}: p_hat = {p:.2f} +/- {1.96 * np.sqrt(p * (1 - p) / m):.3f} (95%)")

# MAP: a Beta(2, 2) prior = one imaginary head and one imaginary tail
print(f"MAP with a Beta(2, 2) prior: (7 + 1) / (10 + 2) = {(heads + 1) / (n + 2):.3f}")

# Gaussian: the MLE is the sample mean and the divide-by-n spread (plant heights from Ch 32 Q21)
x = np.array([2.1, 1.8, 2.3, 2.0, 1.9])
mu_hat = x.mean()
sigma_mle = np.sqrt(np.mean((x - mu_hat) ** 2))
print(f"heights: mu_hat = {mu_hat:.2f}  sigma_MLE = {sigma_mle:.3f}  (n - 1 version: {x.std(ddof=1):.3f})")
```

**Output:**

```
grid search: p_hat = 0.70   calculus (7/p - 3/(1-p) = 0): p_hat = 0.70
  p = 0.5: log-likelihood  -6.931   likelihood 0.00098
  p = 0.7: log-likelihood  -6.109   likelihood 0.00222
  p = 0.9: log-likelihood  -7.645   likelihood 0.00048
average NLL at p_hat = 0.6109 nats = binary cross-entropy 0.6109
  7 of 10: p_hat = 0.70 +/- 0.284 (95%)
  700 of 1000: p_hat = 0.70 +/- 0.028 (95%)
MAP with a Beta(2, 2) prior: (7 + 1) / (10 + 2) = 0.667
heights: mu_hat = 2.02  sigma_MLE = 0.172  (n - 1 version: 0.192)
```

<details>
<summary><strong>Read as text</strong> — continued: the trap</summary>

> **The trap:** the likelihood $L(\theta) = P(\text{data} \mid \theta)$ is not "the probability that $\theta$ is right" — turning it into $P(\theta \mid \text{data})$ needs a prior and Bayes' theorem (§3.4).

</details>

---

## 3.7 Hypothesis Testing — Is This Result Real or Luck? ★★

![Infographic on hypothesis testing: z = observed gap / SE of the gap and two-sided p = P(|Z| >= |z|), with each part labelled and |z| > 1.96 meaning p < 0.05; the z-test step by step for 920 vs 935 correct out of 1,000 (pooled 0.9275, SE 0.0116, z = 1.29, p = 0.196, not significant); a to-scale standard normal with both tails beyond 1.29 shaded (9.8% each) and the 1.96 cut-offs, and a 95% interval of the gap from -0.8 to +3.8 points that includes 0; a table of the same gap under other tests (10,000 each: z = 4.09, p = 0.00004; paired McNemar 10 vs 25: p = 0.018; 50 vs 65: p = 0.19) and 4,700 examples for 80% power; where ML uses it; the trap that p is P(data | H0), not P(H0 | data).](diagrams/math06_info_hypothesis_testing_ai.png)

<details>
<summary><strong>Read as text</strong> — the court trial, the steps, the z-test and common mistakes</summary>

**Simple Explanation:**
You change your model and accuracy goes from 92% to 93%. Is this a real improvement, or just random luck? Hypothesis testing answers this.

Think of it like a court trial:
- **Null hypothesis** ($H_0$) = "The defendant is innocent" (no real difference)
- You look at the evidence (the data)
- **P-value** = "If the defendant IS innocent, how likely is evidence at least this strong?"
- If the p-value is tiny (below a threshold fixed in advance, usually $0.05$), you reject innocence → "The improvement is real!"
- If not, the verdict is "not proven" — which is not the same as "innocent"

> **Maths in one line:** $z = \dfrac{\text{observed gap}}{\text{SE of the gap}}$ and two-sided $p = P(|Z| \ge |z|)$ — measure the gap in standard errors (from the CLT, §3.5) and ask how often luck alone would produce a gap that large; $|z| > 1.96$ means $p < 0.05$.

**The Steps:**

1. $H_0$: "No real difference" vs $H_1$: "There IS a difference"
2. Fix the threshold $\alpha$ **before** looking at the data — $\alpha = 0.05$ means a 5% false-alarm rate when there truly is no difference (a Type I error)
3. Compute a test statistic (here $z$) and its p-value
4. If p-value $< \alpha$ → "Statistically significant!" — and report the size of the effect with a confidence interval, not just the verdict

**Example:**

Model A: $920/1000$ correct (92.0%). Model B: $935/1000$ correct (93.5%), each scored on its own random sample of 1,000 examples.

If $H_0$ is true, both models share one accuracy, best estimated by pooling: $\bar{p} = 1855/2000 = 0.9275$. Then:

$$\text{SE} = \sqrt{\bar{p}\,(1 - \bar{p})\left(\tfrac{1}{1000} + \tfrac{1}{1000}\right)} = 0.0116 \qquad z = \frac{0.935 - 0.920}{0.0116} = 1.29 \qquad p = 0.196$$

$$0.196 > 0.05 \quad \Rightarrow \quad \text{NOT significant!}$$

The 1.5-point improvement could easily be random noise: the 95% confidence interval of the gap runs from −0.8 to +3.8 points and includes 0. To detect a gain this size reliably (80% power at $\alpha = 0.05$) you would need about 4,700 examples per model; with 10,000 each, the same 1.5-point gap gives $z = 4.09$ and $p \approx 0.00004$.

**Same test set for both models? Use a paired test.** If A and B were scored on the *same* 1,000 rows, the rows they both get right (or both get wrong) say nothing about which is better; only the disagreements count — McNemar's test ([Ch 13 §13.10](#content/13_model_evaluation)). The same 1.5-point gap is significant if they disagree on 35 rows (only A right on 10, only B right on 25: $p = 0.018$) and not if they disagree on 115 (50 vs 65: $p = 0.19$).

**Common Mistakes:**
- p-value is NOT "probability the null is true" — it is computed *assuming* the null is true
- "Not significant" means "not enough evidence," NOT "no effect"
- Statistical significance does NOT mean practical significance: a million coin flips with 50.2% heads give $p \approx 0.00006$ for a bias nobody cares about. The American Statistical Association's 2016 statement: a p-value "does not measure the size of an effect or the importance of a result"
- Testing many metrics, or peeking every day, inflates false alarms: 20 independent metrics with no real effect, each at $\alpha = 0.05$, give a $1 - 0.95^{20} = 64\%$ chance of at least one fluke

**In LLM evaluation (2024–2026 practice):** a benchmark run is an experiment too. Miller (Anthropic, 2024, *Adding Error Bars to Evals*) recommends reporting the CLT standard error, using clustered standard errors when questions come in related groups, comparing two models on **paired, question-level differences** (the paired idea above), and running a power analysis before trusting a small eval.

In ML: Comparing models, A/B testing in production, validating that improvements are real and not noise. Why? You deploy a new recommendation model and click rates go up 2%. Your boss asks "is that real?" Hypothesis testing is how you answer. Without it, you might ship a "better" model that was actually just lucky on that day's data — and waste months wondering why it stopped working. Interview depth: p-values ([Ch 32 Q16](#content/32_interview_questions)), A/B test design (Q17), Type I and II errors and power (Q20).

**Run it yourself** — the chapter's z-test, the same gap with 10× the data, the sample size needed, and the paired (McNemar) view.

</details>

```python
# Is 93.5% really better than 92.0%? A two-proportion z-test, more data, sample size, and a paired check
import numpy as np
from scipy.stats import norm, chi2

def z_test(correct_a, correct_b, n):
    p_a, p_b = correct_a / n, correct_b / n
    p_pool = (correct_a + correct_b) / (2 * n)              # H0: both models share one accuracy
    se = np.sqrt(p_pool * (1 - p_pool) * 2 / n)             # standard error of the gap under H0
    z = (p_b - p_a) / se
    return p_b - p_a, z, 2 * norm.sf(abs(z))                # gap, z, two-sided p-value

# 1. The chapter's example: 920 vs 935 correct out of 1,000 each
gap, z, p = z_test(920, 935, 1000)
se_gap = np.sqrt(0.92 * 0.08 / 1000 + 0.935 * 0.065 / 1000)  # SE for the interval (no H0 assumed)
lo, hi = gap - 1.96 * se_gap, gap + 1.96 * se_gap
print(f"n = 1,000:  gap {gap * 100:.1f} points  z = {z:.2f}  p = {p:.3f}  95% CI {lo * 100:+.1f} to {hi * 100:+.1f} points")
assert 0.05 < p < 0.25 and lo < 0 < hi

# 2. The same 1.5-point gap with 10x the data
gap, z, p = z_test(9200, 9350, 10_000)
print(f"n = 10,000: gap {gap * 100:.1f} points  z = {z:.2f}  p = {p:.1e}")
assert p < 0.001

# 3. Examples needed per model to detect 92.0% -> 93.5% with 80% power at alpha = 0.05
z_alpha, z_power = norm.ppf(0.975), norm.ppf(0.80)
n_needed = (z_alpha + z_power) ** 2 * (0.92 * 0.08 + 0.935 * 0.065) / 0.015 ** 2
print(f"examples needed per model: {n_needed:,.0f}")

# 4. Same 1,000 test rows for both? McNemar: only the rows where the models DISAGREE count
for only_a, only_b in [(10, 25), (50, 65)]:                # B is right on 15 more rows either way
    stat = (abs(only_b - only_a) - 1) ** 2 / (only_a + only_b)
    print(f"disagree on {only_a + only_b:3d} rows (only A right {only_a}, only B right {only_b}): "
          f"chi2 = {stat:.2f}  p = {chi2.sf(stat, df=1):.3f}")
```

**Output:**

```
n = 1,000:  gap 1.5 points  z = 1.29  p = 0.196  95% CI -0.8 to +3.8 points
n = 10,000: gap 1.5 points  z = 4.09  p = 4.3e-05
examples needed per model: 4,688
disagree on  35 rows (only A right 10, only B right 25): chi2 = 5.60  p = 0.018
disagree on 115 rows (only A right 50, only B right 65): chi2 = 1.70  p = 0.192
```

<details>
<summary><strong>Read as text</strong> — continued: the trap</summary>

> **The trap:** "p = 0.03 means a 3% chance the null hypothesis is true." No — p is P(data at least this extreme | $H_0$), not P($H_0$ | data). Going from one to the other needs Bayes (§3.4).

</details>

---

## 3.8 Bias–Variance Decomposition ★★★

![Infographic on the bias-variance decomposition: the formula E of (y minus f-hat) squared = Bias squared + Variance + sigma squared with each symbol labelled; worked example shrinking an average of 5 noisy labels (f = 1, sigma squared = 1): unbiased c = 1.0 gives 0 + 0.200 + 1 = 1.200, shrunk c = 0.833 gives 0.028 + 0.139 + 1 = 1.167 (best), with dartboards; a to-scale U-curve of Bias squared, Variance and their sum over c from 0.5 to 1.0; levers that trade bias for variance; the trap that the unbiased model is not the best.](diagrams/math06_info_bias_variance_ai.png)

<details>
<summary><strong>Read as text</strong> — three sources of error, the derivation and the shrinkage example</summary>

**Simple Explanation:**
Imagine training the same kind of model many times, each time on a fresh training set drawn from the same world, and asking each copy to predict the same new point. The copies' errors come from three places:
- **Bias** — the copies are *consistently* wrong in the same direction: the model is too simple to capture the pattern (an archer whose sight is misaligned).
- **Variance** — the copies *disagree* with each other: the model is so flexible that it chases whatever noise its training set happened to contain (an archer with shaky hands).
- **Noise** — randomness in the labels themselves that no model can predict (wind gusts).

> **Maths in one line:** expected test error $=$ Bias² $+$ Variance $+\ \sigma^2$ — consistently wrong + inconsistent + unpredictable. Only the first two are yours to reduce, and making a model more flexible usually lowers bias but raises variance.

The expected mean squared error of any estimator $\hat{f}(x)$ on a new point can be decomposed exactly into three additive terms:

$$E\!\left[(y - \hat{f}(x))^2\right] = \underbrace{\left(\text{Bias}[\hat{f}(x)]\right)^2}_{\text{systematic error}} + \underbrace{\text{Var}[\hat{f}(x)]}_{\text{sensitivity to data}} + \underbrace{\sigma^2}_{\text{irreducible noise}}$$

where $\text{Bias}[\hat{f}(x)] = E[\hat{f}(x)] - f(x)$ is the gap between the average prediction and the true function, $\text{Var}[\hat{f}(x)] = E[(\hat{f}(x) - E[\hat{f}(x)])^2]$ is how much the prediction fluctuates across different training sets, and $\sigma^2$ is the variance of the label noise inherent in the data-generating process — no model can eliminate it.

**Derivation sketch:**

Let $f = f(x)$ (true function), $\hat{f} = \hat{f}(x)$, $\bar{f} = E[\hat{f}]$, and $y = f + \varepsilon$ with $E[\varepsilon] = 0$, $\text{Var}(\varepsilon) = \sigma^2$, the new label's noise $\varepsilon$ independent of the training set that produced $\hat{f}$.

$$E[(y - \hat{f})^2] = E[(f + \varepsilon - \hat{f})^2] = \sigma^2 + E[(f - \hat{f})^2] + 2\,E[\varepsilon]\,E[f - \hat{f}] = \sigma^2 + E[(f - \hat{f})^2]$$

Now add and subtract $\bar{f}$ inside the remaining square; the cross term is $2(f - \bar{f})\,E[\bar{f} - \hat{f}] = 0$:

$$E[(f - \hat{f})^2] = (f - \bar{f})^2 + E[(\hat{f} - \bar{f})^2] = \text{Bias}^2 + \text{Variance}$$

**Term-by-term interpretation:**

| Term | What drives it | Model behaviour |
|------|---------------|-----------------|
| $\text{Bias}^2$ | Model too simple to capture the true pattern | **Underfitting** — high training error and high test error |
| $\text{Variance}$ | Model too sensitive; memorises training noise | **Overfitting** — low training error, high test error |
| $\sigma^2$ | Noise in the labels themselves | Irreducible; sets the performance ceiling |

**Tie to practice:**

Increasing model capacity (more parameters, deeper network, lower regularisation) reduces bias but raises variance. Regularisation, dropout, early stopping, and ensembling all reduce variance at the cost of some added bias. The optimal model sits at the point where $\text{Bias}^2 + \text{Variance}$ is minimised — the classic bias–variance trade-off.

**The smallest possible example — shrinking an average.** Predict a true value $f = 1$ from $n = 5$ noisy labels (noise $\sigma = 1$) with $\hat{f} = c \times \text{mean}$. The plain mean ($c = 1$) is unbiased. Shrinking it towards 0 ($c < 1$) — exactly what L2 regularisation does to weights — adds bias $(1 - c)$ but cuts the variance to $c^2\sigma^2/n$:

```
  THE TRADE-OFF IN NUMBERS (closed form): f_hat = c × (mean of 5 noisy labels), f = 1, σ² = 1

  more shrinkage = simpler  ◄─────────────────────────────►  less shrinkage = more flexible
  c                 0.5       0.7       0.833     0.9       1.0 (unbiased)
  Bias² (1 − c)²    0.250     0.090     0.028     0.010     0.000     ↓ falls
  Variance 0.2·c²   0.050     0.098     0.139     0.162     0.200     ↑ rises
  + noise σ²        1.000     1.000     1.000     1.000     1.000     never moves
  Total             1.300     1.188     1.167 ★   1.172     1.200     U-shaped: best in the middle
```

The best $c$ is $1/(1 + \sigma^2/(n f^2)) = 1/1.2 = 0.833$: a slightly *biased* estimator beats the unbiased one, because the variance it removes is worth more than the bias it adds. That is the whole case for regularisation (§4.5) in one line.

**Run it yourself** — refit the estimator on 200,000 training sets and measure each term directly.

</details>

```python
# Bias-variance by simulation: shrink an average towards 0 (f_hat = c * mean) and watch the three terms trade off
import numpy as np

rng = np.random.default_rng(0)
f, sigma, n, trials = 1.0, 1.0, 5, 200_000               # true value, label-noise SD, training points, training sets
y_train = f + sigma * rng.standard_normal((trials, n))   # 200,000 training sets of 5 noisy labels each
y_new = f + sigma * rng.standard_normal(trials)          # one fresh test label per training set

print("    c   bias^2  variance  noise  sum     measured test MSE")
results = {}
for c in (0.5, 0.7, 1 / 1.2, 0.9, 1.0):
    f_hat = c * y_train.mean(axis=1)                     # the estimator, refit on every training set
    bias2 = (f_hat.mean() - f) ** 2                      # average prediction vs the truth
    var = f_hat.var()                                    # spread across training sets
    mse = np.mean((y_new - f_hat) ** 2)                  # what you would actually measure on new data
    results[c] = mse
    print(f"{c:5.3f}  {bias2:6.3f}  {var:8.3f}  {sigma**2:5.2f}  {bias2 + var + sigma**2:5.3f}   {mse:.3f}")
    assert abs(bias2 + var + sigma**2 - mse) < 0.02       # the three terms add up to the measured error
    assert abs(bias2 - (1 - c) ** 2) < 0.002 and abs(var - c**2 * sigma**2 / n) < 0.003   # closed forms

best = min(results, key=results.get)
print(f"lowest test error at c = {best:.3f} (theory: 1 / (1 + sigma^2 / (n f^2)) = {1 / (1 + sigma**2 / (n * f**2)):.3f})")
assert best != 1.0                                       # the unbiased estimator is NOT the best one
```

**Output:**

```
    c   bias^2  variance  noise  sum     measured test MSE
0.500   0.250     0.050   1.00  1.299   1.294
0.700   0.090     0.098   1.00  1.187   1.182
0.833   0.028     0.139   1.00  1.166   1.161
0.900   0.010     0.162   1.00  1.172   1.167
1.000   0.000     0.200   1.00  1.200   1.195
lowest test error at c = 0.833 (theory: 1 / (1 + sigma^2 / (n f^2)) = 0.833)
```

<details>
<summary><strong>Read as text</strong> — continued: two caveats and double descent</summary>

The same decomposition measured on polynomials of degree 1 to 15 is in [Ch 8 §8.14](#content/08_core_concepts). Two caveats worth saying in an interview: the split is *exact* only for squared error (for 0-1 loss and cross-entropy the analogue is messier), and very large networks can show **double descent** — test error falls a second time once the model is big enough to fit the training set perfectly (Belkin et al., *PNAS* 2019; same section of Ch 8).

</details>

---

# PART 4: OPTIMIZATION — MAKING MODELS LEARN ★★★

---

## 4.1 Gradient Descent ★★★

![Infographic on gradient descent and the learning rate: the update theta_new = theta_old - lr x gradient of L with each symbol labelled and the rule that a bowl of curvature h converges only if lr < 2/h; worked steps on L = theta squared with lr 0.1 (10 to 8 to 6.4, keeps 80% per step) on a to-scale parabola; a table of six learning rates after 20 steps (0.001 crawls at 9.61, 0.1 gives 0.115, 0.5 lands in one step, 0.9 zigzags, 1.0 bounces at plus or minus 10, 1.1 diverges to 383); mini-batch gradient noise falling as 1 over sqrt B (1.849, 0.457, 0.116 for B = 1, 16, 256) as to-scale bars; typical learning rates and schedules (warmup + cosine, WSD); the trap that too large a rate makes the loss climb.](diagrams/math06_info_gradient_descent_learning_rate_ai.png)

<details>
<summary><strong>Read as text</strong> — the formula, three versions and why mini-batches work</summary>

**Simple Explanation:**
You're blindfolded on a mountain and want to reach the valley. You can feel the slope under your feet. Strategy: always take a step downhill. Keep going until you stop going down. That's gradient descent!

The question is: how BIG should each step be?

> **Maths in one line:** $\theta_{\text{new}} = \theta_{\text{old}} - \text{lr} \times \nabla L(\theta_{\text{old}})$ — the gradient $\nabla L$ points uphill, so step the opposite way, by an amount proportional to the slope (lr = learning rate).

**The Formula:**

$$\theta_{\text{new}} = \theta_{\text{old}} - \text{lr} \times \nabla L$$

> **In plain English:** "Figure out which way is downhill, then take a step in that direction."

**Tiny example.** $L(\theta) = \theta^2$, so the slope is $2\theta$. Start at $\theta = 10$ with $\text{lr} = 0.1$: step 1 gives $10 - 0.1 \times 20 = 8$, step 2 gives $8 - 0.1 \times 16 = 6.4$. Each step keeps 80% of the distance to the minimum, so the steps shrink by themselves as the slope flattens.

**Three Versions:**

| Version | Examples per step | Pros | Cons |
|---------|-------------------|------|------|
| **Batch** | All $N$ | Exact gradient, smooth path | One step needs a full pass over the data |
| **SGD** (stochastic) | 1 random example | Very cheap steps | Noisy, zigzags |
| **Mini-Batch** | A random group of $B$ (e.g. 32–512; LLM pre-training: millions of tokens) | GPU-friendly; noise is $1/\sqrt{B}$ of SGD's. The default — and usually what "SGD" means in practice | One more knob: the batch size couples with the learning rate |

**Why mini-batches work — the CLT again.** A mini-batch gradient is the average of $B$ per-example gradients, so it points the right way on average and its noise shrinks like $1/\sqrt{B}$ (§3.5): 4× the batch halves the noise, for 4× the compute per step. The chart below is computed by the program after it: a linear regression with 1,000 points, learning rate 0.3, 20 steps.

```chart
{
  "type": "line",
  "data": {
    "labels": [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
    "datasets": [
      {
        "label": "SGD — 1 example per step (noisy)",
        "data": [3.18,2.26,2.26,1.65,1.23,1.23,1.27,0.92,0.91,0.69,0.7,0.6,0.38,0.3,0.27,0.44,0.45,0.48,0.33,0.34,0.38],
        "borderColor": "rgba(234, 88, 12, 0.8)",
        "borderWidth": 1.5,
        "tension": 0,
        "pointRadius": 0,
        "fill": false
      },
      {
        "label": "Mini-batch of 32 (smooth)",
        "data": [3.18,2.4,1.64,1.21,0.82,0.67,0.53,0.43,0.4,0.34,0.31,0.3,0.29,0.28,0.27,0.27,0.27,0.27,0.27,0.27,0.27],
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 2,
        "tension": 0.3,
        "pointRadius": 0,
        "fill": false
      },
      {
        "label": "Batch — all 1,000 examples per step",
        "data": [3.18,2.15,1.49,1.06,0.78,0.6,0.48,0.4,0.35,0.32,0.3,0.29,0.28,0.27,0.27,0.27,0.27,0.26,0.26,0.26,0.26],
        "borderColor": "rgba(34, 197, 94, 1)",
        "borderWidth": 1.5,
        "borderDash": [5, 4],
        "tension": 0.3,
        "pointRadius": 0,
        "fill": false
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Gradient Descent — Loss Over Training Steps (computed; lr 0.3, 1,000 points)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Loss (MSE on all 1,000 points)" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "Training Step" } }
    }
  }
}
```

The mini-batch of 32 tracks the full batch almost exactly at 1/31 of the cost per step; from step 12 on, single-example SGD keeps bouncing between about 0.27 and 0.48, because its gradients are $\sqrt{32} = 5.7$× noisier. None can go below 0.26 — the noise in the labels (SD 0.5, so about $0.5^2 = 0.25$), the $\sigma^2$ floor of §3.8.

**Run it yourself** — the noise of a mini-batch gradient for $B = 1$ to 256, then the three training runs in the chart.

</details>

```python
# A mini-batch gradient is an AVERAGE, so the CLT applies: its noise shrinks like 1/sqrt(B). Then train with B = all, 32, 1.
import numpy as np

rng = np.random.default_rng(0)
N = 1000
x = rng.uniform(-1, 1, N)
y = 3.0 * x + rng.normal(0, 0.5, N)                  # true slope 3, label noise 0.5

def loss(w):                                          # mean squared error on all 1,000 points
    return float(np.mean((w * x - y) ** 2))

def grad(w, idx):                                     # average gradient over the examples in idx
    return float(np.mean(2 * (w * x[idx] - y[idx]) * x[idx]))

print(f"full-batch gradient at w = 0: {grad(0.0, np.arange(N)):+.3f}")
sd = {}
for B in (1, 4, 16, 64, 256):
    g = np.array([grad(0.0, rng.integers(0, N, B)) for _ in range(5000)])   # 5,000 random batches of size B
    sd[B] = g.std()
    print(f"B = {B:3d}: average {g.mean():+.3f}   noise SD {sd[B]:.3f}   SD(B=1) / sqrt(B) = {sd[1] / np.sqrt(B):.3f}")
assert abs(sd[64] / (sd[1] / 8) - 1) < 0.05            # 64x the batch -> 1/8 of the noise

def train(B, lr=0.3, steps=20, seed=1):
    r, w, out = np.random.default_rng(seed), 0.0, [loss(0.0)]
    for _ in range(steps):
        idx = np.arange(N) if B == N else r.integers(0, N, B)
        w -= lr * grad(w, idx)
        out.append(loss(w))
    return out

for B, name in [(N, "batch (all 1,000)"), (32, "mini-batch of 32"), (1, "SGD (1 example)")]:
    L = train(B)
    print(f"{name:<18} loss at step 0/5/10/15/20: " + " / ".join(f"{L[k]:.2f}" for k in (0, 5, 10, 15, 20)))
```

**Output:**

```
full-batch gradient at w = 0: -1.947
B =   1: average -1.946   noise SD 1.849   SD(B=1) / sqrt(B) = 1.849
B =   4: average -1.943   noise SD 0.932   SD(B=1) / sqrt(B) = 0.925
B =  16: average -1.953   noise SD 0.457   SD(B=1) / sqrt(B) = 0.462
B =  64: average -1.951   noise SD 0.228   SD(B=1) / sqrt(B) = 0.231
B = 256: average -1.949   noise SD 0.116   SD(B=1) / sqrt(B) = 0.116
batch (all 1,000)  loss at step 0/5/10/15/20: 3.18 / 0.60 / 0.30 / 0.27 / 0.26
mini-batch of 32   loss at step 0/5/10/15/20: 3.18 / 0.67 / 0.31 / 0.27 / 0.27
SGD (1 example)    loss at step 0/5/10/15/20: 3.18 / 1.23 / 0.70 / 0.44 / 0.38
```

<details>
<summary><strong>Read as text</strong> — continued: what the output shows</summary>

Every batch size points the same way on average (about −1.95, the full gradient); only the noise changes, and it follows $1/\sqrt{B}$. Epochs, batch-size rules and the learning-rate coupling are in [Ch 8 §8.11](#content/08_core_concepts).

</details>

---

## 4.2 Learning Rate

<details>
<summary><strong>Read as text</strong> — too small vs too big, the 2/h cliff and schedules</summary>

**Simple Explanation:**
The learning rate controls how big each step is. Like walking vs running vs jumping.

- **Too small** = taking baby steps. You'll get there eventually, but it takes forever.
- **Too big** = jumping. You overshoot the valley and bounce around wildly. May never arrive!
- **Just right** = normal walking. Steady progress toward the valley.

> **Maths in one line:** on a bowl $L = \tfrac{h}{2}\theta^2$ with curvature $h$, each step multiplies the distance to the minimum by $(1 - \text{lr} \cdot h)$, so gradient descent converges only if $\text{lr} < 2/h$ — the steepest direction of the loss sets the largest usable learning rate.

**With numbers.** $L(\theta) = \theta^2$ (so $h = 2$ and the factor is $1 - 2\,\text{lr}$), starting at $\theta = 10$, 20 steps:

| Learning rate | Factor per step | $\theta$ after 20 steps | What happens |
|--------------|-----------------|-------------------------|-------------|
| $\text{lr} = 0.001$ | $0.998$ | $9.61$ | Too small — crawls |
| $\text{lr} = 0.1$ | $0.8$ | $0.115$ | Converges smoothly |
| $\text{lr} = 0.5$ | $0$ | $0$ (after 1 step) | Lands exactly: $\text{lr} = 1/h$ |
| $\text{lr} = 0.9$ | $-0.8$ | $0.115$ | Overshoots every step, still converges |
| $\text{lr} = 1.0$ | $-1$ | $10$ | Bounces between $+10$ and $-10$ forever |
| $\text{lr} = 1.1$ | $-1.2$ | $383$ | Too large — diverges! |

A real loss has millions of directions with different curvatures, and the steepest one caps the learning rate for all of them — the slow, gentle directions then crawl (§4.3 and §4.4 show the cost). Nobody knows $h$ in advance, so the learning rate is found by a short sweep on a log scale ($10^{-4}$, $3\times10^{-4}$, $10^{-3}$, …). Typical starting points: Adam's default $10^{-3}$; about $3\times10^{-4}$ for small Transformers and lower as models grow; $10^{-5}$ to $5\times10^{-5}$ to fine-tune a pre-trained Transformer ([Ch 16 §1.2](#content/16_deep_learning)). The same cliff on $(w-5)^2$, with code: [Ch 8 §8.9](#content/08_core_concepts).

**Learning Rate Schedules:** Start small (warmup), train at the peak, then shrink the rate so the model settles into the minimum. The classic recipe is linear warmup + cosine decay — GPT-3 and Llama 3 used it. Many 2024–2026 pre-training runs switched to **warmup–stable–decay (WSD)**: hold the peak and decay only over the last 10–20% of steps, so a run can be extended without restarting the schedule ([Ch 16 §1.3](#content/16_deep_learning)). After warmup, cosine decay is:

$$\text{lr}_t = \text{lr}_{\min} + \tfrac{1}{2}\left(\text{lr}_{\max} - \text{lr}_{\min}\right)\left(1 + \cos\frac{\pi t}{T}\right)$$

where $t$ counts steps since warmup ended and $T$ is the length of the decay. Halfway ($t = T/2$) the rate sits exactly between peak and floor. The chart: 500 warmup steps (5% of 10,000) up to a peak of $10^{-3}$, then cosine down to $10^{-4}$ (10% of peak):

```chart
{
  "type": "line",
  "data": {
    "labels": [0,500,1000,1500,2000,2500,3000,3500,4000,4500,5000,5500,6000,6500,7000,7500,8000,8500,9000,9500,10000],
    "datasets": [{
      "label": "Warmup + Cosine Decay (computed)",
      "data": [0.0,0.001,0.000994,0.000976,0.000946,0.000905,0.000855,0.000796,0.000731,0.00066,0.000587,0.000513,0.00044,0.000369,0.000304,0.000245,0.000195,0.000154,0.000124,0.000106,0.0001],
      "borderColor": "rgba(234, 88, 12, 1)",
      "backgroundColor": "rgba(234, 88, 12, 0.1)",
      "fill": true,
      "tension": 0.3,
      "pointRadius": 0
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Learning Rate Schedule — 5% Warmup + Cosine Decay to 10% of Peak" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Learning Rate" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "Training Step" } }
    }
  }
}
```

</details>

---

## 4.3 Momentum

![Infographic on momentum, Adam and AdamW: the Adam update theta <- theta - lr x m-hat / (sqrt v-hat + epsilon) with each symbol labelled, plus the momentum average and the AdamW decay term; momentum with beta 0.9 step by step (steady gradient: 0.1, 0.19, 0.271 to 0.958; zigzag: settles at plus or minus 0.05, only 5% survives) with an exact velocity chart; Adam's first step by hand with g = 0.2 (m-hat 0.2, v-hat 0.04, step 0.001 = lr; 3.16x too big without bias correction); GD, momentum and Adam on the valley 0.5(x^2 + 100y^2) drawn to scale (loss after 60 steps 0.80, 0.02, 0.00; GD at lr 0.021 explodes to 741,673); which optimiser to use; the trap that Adam + L2 is not AdamW.](diagrams/math06_info_momentum_adam_adamw_ai.png)

<details>
<summary><strong>Read as text</strong> — the rolling ball, the formula and the numbers</summary>

**Simple Explanation:**
Imagine rolling a ball down a bumpy hill. Without momentum, the ball stops at every tiny bump. WITH momentum, the ball builds up speed and rolls right over small bumps.

Momentum remembers which direction you've been going and keeps rolling that way, even if the current gradient is noisy or bumpy. It's like how a heavy bowling ball keeps going even if it hits a small crack in the lane.

> **Maths in one line:** $v_t = \beta\, v_{t-1} + (1-\beta)\,\nabla L$, then $\theta \leftarrow \theta - \text{lr} \cdot v_t$ — step along a running average of recent gradients instead of the latest one; $\beta = 0.9$ averages roughly the last $1/(1-\beta) = 10$ gradients.

**Formula:**

$$v_t = \beta \cdot v_{t-1} + (1 - \beta) \cdot \nabla L$$

$$\theta = \theta - \text{lr} \times v_t$$

> **In plain English:** "Don't just look at where the slope points NOW. Also remember where you've been heading recently. $\beta = 0.9$ means 90% of the previous direction plus 10% of the new gradient."

> **Two ways to write it.** PyTorch's `SGD(momentum=0.9)` drops the $(1-\beta)$: $v_t = \beta v_{t-1} + \nabla L$. Same idea — its velocity is just 10× larger, so the matching learning rate is 10× smaller. This chapter and [Ch 16 §1.2](#content/16_deep_learning) use the form above.

**With numbers ($\beta = 0.9$):**
- **Steady gradient of $+1$:** $v = 0.1,\ 0.19,\ 0.271,\ \dots$, reaching $0.958$ after 30 steps on its way to $1.0$ — momentum starts slowly (the velocity begins at zero), then moves at full speed along a consistent slope.
- **Zigzag gradient $+1, -1, +1, \dots$:** $v = 0.1,\ -0.01,\ 0.091,\ \dots$, settling at about $\pm 0.05$ — only $(1-\beta)/(1+\beta) = 5\%$ of the back-and-forth survives.

A noisy gradient is a mix of both: the steady part survives and the flipping part is averaged away. In a narrow valley that is exactly what you want — the zigzag across the valley cancels while the push along its floor builds up.

```chart
{
  "type": "line",
  "data": {
    "labels": [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
    "datasets": [
      {
        "label": "Velocity v — steady gradient +1 (keeps building)",
        "data": [0.0,0.1,0.19,0.271,0.344,0.41,0.469,0.522,0.57,0.613,0.651,0.686,0.718,0.746,0.771,0.794,0.815,0.833,0.85,0.865,0.878,0.891,0.902,0.911,0.92,0.928,0.935,0.942,0.948,0.953,0.958],
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 2.5,
        "tension": 0.3,
        "pointRadius": 0,
        "fill": false
      },
      {
        "label": "Velocity v — zigzag gradient (cancels out)",
        "data": [0.0,0.1,-0.01,0.091,-0.018,0.084,-0.025,0.078,-0.03,0.073,-0.034,0.069,-0.038,0.066,-0.041,0.063,-0.043,0.061,-0.045,0.06,-0.046,0.058,-0.047,0.057,-0.048,0.056,-0.049,0.056,-0.05,0.055,-0.05],
        "borderColor": "rgba(234, 88, 12, 1)",
        "borderWidth": 2,
        "tension": 0,
        "pointRadius": 0,
        "fill": false
      },
      {
        "label": "The zigzag gradient itself (+1, −1, +1, …)",
        "data": [null,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,1,-1],
        "borderColor": "rgba(150, 150, 150, 0.6)",
        "borderWidth": 1,
        "borderDash": [4, 4],
        "tension": 0,
        "pointRadius": 0,
        "fill": false
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Momentum (β = 0.9) Smooths the Path — computed velocities" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Gradient / velocity" }, "min": -1.1, "max": 1.1 },
      "x": { "title": { "display": true, "text": "Training Step" } }
    }
  }
}
```

**Nesterov momentum** (`nesterov=True` in PyTorch) evaluates the gradient at the point momentum is about to carry you to — a look-ahead that corrects an overshoot a little earlier. On a valley 100× steeper across than along, plain gradient descent at a learning rate just under its ceiling still has a loss of 0.80 after 60 steps; momentum gets to 0.02 (the program in §4.4).

</details>

---

## 4.4 Adam & AdamW ★★★

<details>
<summary><strong>Read as text</strong> — per-weight steps, bias correction and AdamW</summary>

**Simple Explanation:**
Plain gradient descent and momentum give every weight the same learning rate. Adam gives each weight its own. It keeps two running averages per weight — the average gradient (the *direction*, like momentum) and the average squared gradient (the typical *size*) — and divides one by the square root of the other. A weight whose gradients are tiny gets a relatively big step; one whose gradients are huge gets a relatively small one. The result: every weight moves by roughly the learning rate per step, whatever the scale of its gradient.

> **Maths in one line:** $\theta \leftarrow \theta - \text{lr} \cdot \dfrac{\hat{m}}{\sqrt{\hat{v}} + \epsilon}$ — the smoothed gradient $\hat{m}$ divided by the typical gradient size $\sqrt{\hat{v}}$, so each weight moves about lr per step however large or small its gradient is.

Adam (Adaptive Moment Estimation; Kingma & Ba, ICLR 2015) maintains a per-parameter running estimate of the first moment (mean gradient) and second moment (uncentered variance — the mean of the squared gradient), then divides the update by the square root of the second moment. That is a root-mean-square, not a standard deviation: it measures how big the gradients are, not how much they vary.

**Full Adam update (per step $t$, with gradient $g_t$):**

$$m_t = \beta_1 m_{t-1} + (1 - \beta_1)\, g_t \qquad\qquad v_t = \beta_2 v_{t-1} + (1 - \beta_2)\, g_t^2$$

$$\hat{m}_t = \frac{m_t}{1 - \beta_1^{\,t}} \qquad\qquad \hat{v}_t = \frac{v_t}{1 - \beta_2^{\,t}}$$

$$\theta_t = \theta_{t-1} - \text{lr} \cdot \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}$$

| Hyperparameter | Default | Role |
|---------------|---------|------|
| $\text{lr}$ | $0.001$ | Step size — each weight moves about this much per step |
| $\beta_1$ | $0.9$ | Momentum decay — how much to remember past gradient direction (~10 steps) |
| $\beta_2$ | $0.999$ | Variance decay — how much to remember past squared gradients (~1,000 steps); LLM pre-training often uses $0.95$ |
| $\epsilon$ | $10^{-8}$ | Numerical stability; prevents division by zero (Keras uses $10^{-7}$) |

These are PyTorch's defaults, the same as in the original paper.

**Bias correction — and which way it errs.** $m$ and $v$ start at zero, so for the first steps both understate the true averages: at $t = 1$, $m$ is 10× too small and $v$ is 1,000× too small. Because $v$ sits under a square root, the *uncorrected* step would come out about **3× too large** at $t = 1$ ($0.1/\sqrt{0.001} = 3.16$), not too small — and for a steady gradient the overshoot peaks near 6.6× around step 12. Dividing by $(1 - \beta^t)$ removes the distortion, and is one reason learning-rate warmup is still used with Adam.

**One step by hand.** First gradient $g = 0.2$ at $t = 1$: $m = 0.1 \times 0.2 = 0.02$ and $v = 0.001 \times 0.04 = 0.00004$; corrected, $\hat{m} = 0.02/0.1 = 0.2$ and $\hat{v} = 0.00004/0.001 = 0.04$; the step is $0.001 \times 0.2/\sqrt{0.04} = 0.001$ — exactly the learning rate. A gradient of 0.002 or 20 would also give a first step of 0.001; plain gradient descent's step would scale with the gradient ([Ch 16 §1.2](#content/16_deep_learning) runs it). The price of all this: two extra numbers per weight, 8 bytes per parameter in FP32 — 560 GB of optimizer state for a 70B-parameter model.

**AdamW — decoupled weight decay:**

Under plain SGD, adding an L2 penalty $\tfrac{\lambda}{2}\lVert\theta\rVert^2$ to the loss and decaying the weights are the same thing: the gradient gains $\lambda\theta$, so each step shrinks every weight by the same $\text{lr} \cdot \lambda\theta$. Under Adam they are not. Vanilla Adam applies L2 regularisation by adding $\lambda\theta$ to the gradient before the moment update. This folds weight decay into the adaptive scaling, so the decay a weight actually gets is about $\text{lr} \cdot \lambda\theta/\sqrt{\hat{v}}$: parameters with a large gradient history (large $\sqrt{\hat{v}}$) are barely decayed, and those with tiny gradients are decayed hard — not what "weight decay" is supposed to mean. AdamW (Loshchilov & Hutter) fixes this by applying weight decay directly to the parameters, outside the gradient path:

$$\theta_t = \theta_{t-1} - \text{lr} \cdot \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon} - \text{lr} \cdot \lambda \cdot \theta_{t-1}$$

The $-\text{lr} \cdot \lambda \cdot \theta$ term is a multiplicative shrink of every weight (equivalent to $\theta \leftarrow \theta \cdot (1 - \text{lr} \cdot \lambda)$; PyTorch applies this shrink first, then the Adam step). Because it bypasses the adaptive denominator, every weight receives the same proportional decay regardless of its gradient history. With $\text{lr} = 10^{-3}$ and $\lambda = 0.1$, every weight shrinks by 0.01% per step — to $(1 - 10^{-4})^{2000} = 0.819$ of its size over 2,000 steps if nothing pushes back.

**Why it matters:** Loshchilov & Hutter (ICLR 2019) showed that decoupling makes the best weight decay independent of the learning rate and substantially improves Adam's generalisation — on image classification it closed the gap to SGD with momentum. Decoupled weight decay is now the standard in published Transformer recipes: BERT's reference code already used it, and Llama 2's paper names AdamW with $\beta_2 = 0.95$, weight decay 0.1 and gradient clipping at 1.0 — the same three settings GPT-3 used ([Ch 16 §1.2](#content/16_deep_learning) has the table). PyTorch's `torch.optim.AdamW` defaults to `weight_decay=0.01`.

**When to use what:**

| Optimiser | Use case |
|-----------|----------|
| **AdamW** | Default for transformers and most deep learning; built-in PyTorch (`torch.optim.AdamW`) |
| **Adam** | Fine for small experiments without weight decay; with an L2 penalty the decay is mis-scaled — use AdamW |
| **SGD + Momentum** | CNNs/ResNets: well tuned, it often generalises as well as Adam or better |

> **Beyond AdamW (2024–2026):** **Muon** keeps one momentum per hidden weight matrix and *orthogonalises* it (a few Newton–Schulz iterations), so every direction of the update gets equal strength; Moonshot reported about 2× AdamW's compute efficiency, Kimi K2 trained with it (as MuonClip), and PyTorch ships `torch.optim.Muon` since version 2.9 — [Ch 16 §1.2 "Beyond AdamW"](#content/16_deep_learning) covers it with Lion, Adafactor and Shampoo/SOAP ([Keller Jordan's original write-up](https://kellerjordan.github.io/posts/muon/)).

**Run it yourself** — momentum as an averager, then gradient descent, momentum and Adam on a long valley $L = \tfrac{1}{2}(x^2 + 100y^2)$, 100× steeper across ($y$) than along ($x$). It is the same race as [Ch 8 §8.10](#content/08_core_concepts), which writes momentum in PyTorch's form with $\text{lr} = 0.005$ — the identical run. The learning rates are hand-picked, so read what each update *does*, not a ranking.

</details>

```python
# GD vs momentum vs Adam with the chapter's settings (beta 0.9; Adam 0.9 / 0.999 / 1e-8) on a long valley
import numpy as np

# 1. Momentum is a running average: it keeps a steady push and cancels a zigzag
for name, grads in [("steady +1", np.ones(30)), ("zigzag +1/-1", (-1.0) ** np.arange(30))]:
    v, vs = 0.0, []
    for g in grads:
        v = 0.9 * v + 0.1 * g                       # v <- beta*v + (1 - beta)*g
        vs.append(v)
    print(f"{name:<12}: v = {vs[0]:+.3f}, {vs[1]:+.3f}, {vs[2]:+.3f} ... step 30: {vs[-1]:+.3f}")

# 2. The valley L = 0.5*(x^2 + 100*y^2), starting at (x, y) = (-4, 0.4)
H = np.array([1.0, 100.0])                          # curvature of each direction
def run(kind, lr, steps=60, b1=0.9, b2=0.999, eps=1e-8):
    w, v, m, s = np.array([-4.0, 0.4]), np.zeros(2), np.zeros(2), np.zeros(2)
    losses, moves = [0.5 * float(H @ w**2)], []
    for t in range(1, steps + 1):
        g = H * w                                   # gradient of the valley
        if kind == "GD":
            step = lr * g
        elif kind == "momentum":
            v = b1 * v + (1 - b1) * g
            step = lr * v
        else:                                       # Adam, with bias correction
            m, s = b1 * m + (1 - b1) * g, b2 * s + (1 - b2) * g * g
            step = lr * (m / (1 - b1**t)) / (np.sqrt(s / (1 - b2**t)) + eps)
        w = w - step
        moves.append(-step)
        losses.append(0.5 * float(H @ w**2))
    return np.array(losses), moves[0]

for kind, lr in [("GD", 0.019), ("momentum", 0.05), ("Adam", 0.2)]:
    L, first = run(kind, lr)
    print(f"{kind:<8} lr {lr:<5} first move (x, y) = ({first[0]:+.3f}, {first[1]:+.3f})   loss at step 0/10/20/40/60: "
          + " / ".join(f"{L[k]:.2f}" for k in (0, 10, 20, 40, 60)))

# 3. GD's ceiling: each step multiplies y by (1 - 100*lr), so it is stable only if lr < 2/100
for lr in (0.019, 0.021):
    print(f"GD lr {lr}: y factor {1 - 100 * lr:+.2f} per step, x factor {1 - lr:.3f} -> loss after 60 steps {run('GD', lr)[0][60]:,.2f}")
assert run("GD", 0.021)[0][60] > 16 > run("GD", 0.019)[0][60]
```

**Output:**

```
steady +1   : v = +0.100, +0.190, +0.271 ... step 30: +0.958
zigzag +1/-1: v = +0.100, -0.010, +0.091 ... step 30: -0.050
GD       lr 0.019 first move (x, y) = (+0.076, -0.760)   loss at step 0/10/20/40/60: 16.00 / 6.42 / 3.83 / 1.73 / 0.80
momentum lr 0.05  first move (x, y) = (+0.020, -0.200)   loss at step 0/10/20/40/60: 16.00 / 5.21 / 2.60 / 0.03 / 0.02
Adam     lr 0.2   first move (x, y) = (+0.200, -0.200)   loss at step 0/10/20/40/60: 16.00 / 2.36 / 0.55 / 0.11 / 0.00
GD lr 0.019: y factor -0.90 per step, x factor 0.981 -> loss after 60 steps 0.80
GD lr 0.021: y factor -1.10 per step, x factor 0.979 -> loss after 60 steps 741,673.18
```

<details>
<summary><strong>Read as text</strong> — continued: reading the first moves</summary>

Read the first moves. Gradient descent moves the steep direction 10× more than the gentle one (0.760 vs 0.076) and, capped at $\text{lr} < 2/100$, gains only 1.9% per step along $x$. Momentum starts gently but builds speed along the floor (0.02 after 60 steps). Adam's first move is exactly 0.2 = lr in *both* directions — it ignores how steep each direction is — and reaches 0.00 by step 60, after some wobble on the way (0.11 at step 40). One step past the ceiling ($\text{lr} = 0.021$, factor $-1.1$) and gradient descent explodes.

</details>

---

## 4.5 Regularization — Preventing Overfitting ★★★

![Infographic on L1 vs L2 regularization: J(w) = L(w) + lambda Omega(w) with each symbol labelled, L1 = sum of absolute weights (pull lambda sign w) and L2 = sum of squared weights (pull 2 lambda w); with lambda = 0.1 the pull on a weight of 0.8 is 0.16 and on 0.01 is 0.002, so L1 pulls 50x harder on the tiny weight, with a to-scale chart where the two pulls are equal at 0.5; where the weights end up (soft-thresholding vs divide by 1.2): 0.5 to 0.4 or 0.417, 0.01 to 0 or 0.008, -0.8 to -0.7 or -0.667, 2 exact zeros of 5 for L1, as grouped bars; the diamond vs circle constraint regions with loss contours touching a corner (w1 = 0) or a smooth point (both non-zero); where ML uses each penalty and prior; the trap that L2 = weight decay holds only for plain SGD, so use AdamW with Adam.](diagrams/math06_info_l1_vs_l2_regularization_ai.png)

<details>
<summary><strong>Read as text</strong> — the overfitting analogy, the penalty and how to choose λ</summary>

**Simple Explanation:**
Imagine a student who memorises every answer in the textbook word for word. They ace the practice test (training data) but fail the real exam (test data) because they never understood the material. That is overfitting.

Regularization tells the student: "Keep your notes SHORT — write down only what really matters." For a model, short notes means **small weights**. We add a **penalty** to the loss, so training now balances two goals:

1. **Fit the data** — the original loss $L(\mathbf{w})$.
2. **Keep the weights small** — a penalty $\Omega(\mathbf{w})$, multiplied by a strength $\lambda$.

> **Maths in one line:** $J(\mathbf{w}) = L(\mathbf{w}) + \lambda\,\Omega(\mathbf{w})$ with $\Omega = \sum_i |w_i|$ (L1) or $\Omega = \sum_i w_i^2$ (L2) — every unit of weight size now costs $\lambda$, and the *slope* of the penalty ($\lambda\,\text{sign}(w)$ for L1, $2\lambda w$ for L2) decides whether small weights end up exactly zero.

**What is $\lambda$ (lambda)?** The strength of the penalty — the exchange rate between "fit the data" and "stay small":

| $\lambda$ | What happens | Risk |
|---|---|---|
| $0$ | No penalty — plain training | Overfitting |
| small (e.g. $0.001$) | A gentle pull toward zero; the fit still dominates | Usually a safe start |
| large (e.g. $10$) | Small weights matter more than fitting the data | Underfitting |

$\lambda$ is a hyperparameter: try a log-spaced grid ($10^{-4}, 10^{-3}, 10^{-2}, 10^{-1}$) and keep the value with the best validation score.

> **Where the applied depth lives.** This section is the *maths* of the penalties. Choosing $\lambda$, early stopping and which regularizer to reach for first are in [Ch 08 §8.15](#content/08_core_concepts); dropout and BatchNorm in PyTorch code are in [Ch 14 §14.7](#content/14_neural_networks); weight decay inside AdamW is in §4.4 above and [Ch 16 §1.2](#content/16_deep_learning).

</details>

### L1 (Lasso) — a constant pull toward zero

<details>
<summary><strong>Read as text</strong> — the L1 penalty, its constant-size gradient and one update step</summary>

$$J(\mathbf{w}) = L(\mathbf{w}) + \lambda \sum_i |w_i|$$

> **In plain English:** "Add up the absolute value of every weight, multiply by $\lambda$, and add that to the loss. Every weight that is not zero costs something."

**Worked penalty.** Weights $\mathbf{w} = [0.5,\ 0.01,\ {-0.8}]$, $\lambda = 0.1$, and a data loss of $2.5$:

$$\lambda \sum_i |w_i| = 0.1 \times (0.5 + 0.01 + 0.8) = 0.1 \times 1.31 = 0.131 \qquad J = 2.5 + 0.131 = 2.631$$

**Its gradient.** The slope of $|w|$ is $+1$ when $w > 0$ and $-1$ when $w < 0$ — whatever the size of $w$:

$$\frac{\partial}{\partial w}\,\lambda|w| = \lambda\,\text{sign}(w), \qquad \text{sign}(w) = \begin{cases} +1 & \text{if } w > 0 \\ -1 & \text{if } w < 0 \\ \phantom{+}0 & \text{if } w = 0 \end{cases}$$

(At $w = 0$ the V-shaped corner of $|w|$ has no single slope; any value between $-1$ and $+1$ is a valid *subgradient*, and code usually picks $0$.) One gradient-descent step is therefore

$$w_{\text{new}} = w_{\text{old}} - \text{lr} \times \big(\underbrace{g}_{\text{data gradient}} + \underbrace{\lambda\,\text{sign}(w_{\text{old}})}_{\text{L1 pull, always } \pm\lambda}\big)$$

The pull has **the same size, $\lambda$, for every weight**: $0.1$ for a weight of $0.8$ and also $0.1$ for a weight of $0.01$.

</details>

### L2 (Ridge / Weight Decay) — a pull proportional to the weight

<details>
<summary><strong>Read as text</strong> — the L2 penalty, weight decay and one step of both penalties</summary>

$$J(\mathbf{w}) = L(\mathbf{w}) + \lambda \sum_i w_i^2$$

> **In plain English:** "Square every weight, add them up, multiply by $\lambda$. Squaring makes big weights cost far more than small ones."

**Worked penalty** (same weights): $\lambda \sum_i w_i^2 = 0.1 \times (0.25 + 0.0001 + 0.64) = 0.1 \times 0.8901 = 0.089$, so $J = 2.5 + 0.089 = 2.589$.

**Its gradient** is $2\lambda w$ — proportional to the weight — and the step rearranges into "shrink, then step":

$$w_{\text{new}} = w_{\text{old}} - \text{lr}\,(g + 2\lambda w_{\text{old}}) = \underbrace{(1 - 2\,\text{lr}\,\lambda)}_{0.998 \text{ when lr} = 0.01,\ \lambda = 0.1}\, w_{\text{old}} - \text{lr}\, g$$

Every step first multiplies each weight by the same factor just below 1 — which is why L2 is also called **weight decay**. Libraries write the decay as $w \leftarrow (1 - \text{lr}\cdot\text{wd})\,w$, so a weight-decay setting $\text{wd}$ equals L2 with $\lambda = \text{wd}/2$ under plain SGD. Under Adam the two are *not* the same — that is the AdamW fix in §4.4.

**One step, both penalties** ($\text{lr} = 0.01$, $\lambda = 0.1$, data gradients $g = [0.3,\ 0.02,\ {-0.5}]$ from backpropagation):

| Weight | $g$ | L1 pull $\lambda\,\text{sign}(w)$ | L2 pull $2\lambda w$ | New $w$ with L1 | New $w$ with L2 |
|---|---|---|---|---|---|
| $w_1 = 0.5$ | $0.3$ | $+0.1$ | $+0.1$ | $0.5 - 0.01 \times 0.4 = 0.496$ | $0.5 - 0.01 \times 0.4 = 0.496$ |
| $w_2 = 0.01$ | $0.02$ | $+0.1$ | $+0.002$ | $0.01 - 0.01 \times 0.12 = 0.0088$ | $0.01 - 0.01 \times 0.022 = 0.00978$ |
| $w_3 = -0.8$ | $-0.5$ | $-0.1$ | $-0.16$ | $-0.8 - 0.01 \times (-0.6) = -0.794$ | $-0.8 - 0.01 \times (-0.66) = -0.7934$ |

Read the middle row. For the tiny weight, the L1 pull ($0.1$) is **50×** the L2 pull ($0.002$) and **5×** its own data gradient, so L1 drags it across zero in about 8 more steps like this one, while L2 barely touches it. The two pulls are equal at $|w| = 0.5$ (where $2\lambda|w| = \lambda$): below that L1 pulls harder, above it L2 does — which is why L2 tames the *big* weights.

</details>

### Where the weights end up — exact zeros vs shrinkage

<details>
<summary><strong>Read as text</strong> — soft-thresholding vs proportional shrinkage on five weights</summary>

A gradient step shows the direction; the **minimum** of $J$ shows the destination. Take the simplest regression: standardised, uncorrelated features ($X^\top X / n = I$) and the data loss $\frac{1}{2n}\lVert \mathbf{y} - X\mathbf{w} \rVert^2$. Then $J$ splits into one tiny problem per weight, $\tfrac12 (w - \hat w)^2 + \lambda\,\Omega(w)$, where $\hat w$ is the unregularised least-squares weight. Setting the derivative to zero gives:

$$w^{\text{L1}} = \text{sign}(\hat w)\,\max\big(|\hat w| - \lambda,\ 0\big) \qquad\qquad w^{\text{L2}} = \frac{\hat w}{1 + 2\lambda}$$

- **L1 = soft-thresholding.** For $w > 0$ the derivative is $(w - \hat w) + \lambda = 0$, so $w = \hat w - \lambda$ — valid only while that stays positive. Otherwise the answer is **exactly** $0$: a weight stays at zero whenever $|\hat w| \le \lambda$, that is, whenever the data's pull at zero is no stronger than the penalty's constant pull. (This is exactly scikit-learn's `Lasso(alpha=λ)` objective.)
- **L2 = proportional shrinkage.** The derivative $(w - \hat w) + 2\lambda w = 0$ gives $w = \hat w / (1 + 2\lambda)$: every weight is divided by the same factor, and nothing that started non-zero reaches zero.

With $\lambda = 0.1$ on five weights:

| | $w_1$ | $w_2$ | $w_3$ | $w_4$ | $w_5$ | Exact zeros |
|---|---|---|---|---|---|---|
| Unregularised $\hat w$ | $0.5$ | $0.01$ | $-0.8$ | $0.002$ | $0.3$ | 0 |
| L1: subtract $0.1$ from the size, stop at 0 | $0.4$ | $0$ | $-0.7$ | $0$ | $0.2$ | **2** |
| L2: divide by $1.2$ | $0.417$ | $0.008$ | $-0.667$ | $0.002$ | $0.25$ | 0 |

```
  L1 — a CONSTANT force (λ = 0.1)          L2 — a SPRING (pull 2λw fades near 0)

  |w| = 0.80 ████████ → 0.70  survives     |w| = 0.80 ████████ → 0.667  (÷ 1.2)
  |w| = 0.01 ▏        → 0     erased       |w| = 0.01 ▏        → 0.008  (÷ 1.2), never 0

  The same push for every weight: small    The push shrinks with the weight, so it
  weights cannot resist it → automatic     approaches 0 but never lands on it
  feature selection.                       → smooth shrinkage of everything.
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["w1", "w2", "w3", "w4", "w5"],
    "datasets": [
      {
        "label": "Unregularised",
        "data": [0.5, 0.01, -0.8, 0.002, 0.3],
        "backgroundColor": "rgba(99, 102, 241, 0.6)",
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 1
      },
      {
        "label": "L1 (subtract 0.1, stop at 0)",
        "data": [0.4, 0, -0.7, 0, 0.2],
        "backgroundColor": "rgba(234, 88, 12, 0.6)",
        "borderColor": "rgba(234, 88, 12, 1)",
        "borderWidth": 1
      },
      {
        "label": "L2 (divide by 1.2)",
        "data": [0.417, 0.008, -0.667, 0.002, 0.25],
        "backgroundColor": "rgba(34, 197, 94, 0.6)",
        "borderColor": "rgba(34, 197, 94, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "λ = 0.1 — L1 zeros out the two small weights, L2 shrinks all five by the same factor" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Weight value" } }
    }
  }
}
```

The program builds a 20-row regression whose least-squares answer is exactly these five weights, then minimises both penalised losses numerically: L1 with a gradient step followed by soft-thresholding (the *proximal* step that Lasso solvers use), L2 with ordinary gradient descent. The last row is the trap: L1 with plain `sign()` steps only *hovers* near zero.

</details>

```python
# L1 vs L2 on a tiny regression: L1 (soft-thresholding) gives exact zeros, L2 only divides
import numpy as np

w_hat = np.array([0.5, 0.01, -0.8, 0.002, 0.3])   # the chapter's 5 weights = the unregularised fit
lam, n = 0.1, 20
rng = np.random.default_rng(0)
Q, _ = np.linalg.qr(rng.normal(size=(n, 5)))
X = np.sqrt(n) * Q                  # 5 standardised, uncorrelated features: X.T @ X / n = identity
y = X @ w_hat                       # noise-free, so plain least squares returns w_hat exactly

def grad_data(w):                   # gradient of the data loss (1/2n) * ||y - X w||^2
    return X.T @ (X @ w - y) / n

def soft(z, t):                     # soft-thresholding: shrink |z| by t, stop at 0
    return np.sign(z) * np.maximum(np.abs(z) - t, 0.0)

lr = 0.5
w_l1, w_l2, w_sign = np.zeros(5), np.zeros(5), np.zeros(5)
for _ in range(200):
    w_l1 = soft(w_l1 - lr * grad_data(w_l1), lr * lam)          # L1: gradient step, then soft-threshold
    w_l2 = w_l2 - lr * (grad_data(w_l2) + 2 * lam * w_l2)       # L2: ordinary gradient descent
for _ in range(2000):
    w_sign = w_sign - 0.01 * (grad_data(w_sign) + lam * np.sign(w_sign))   # L1 with plain sign() steps

def show(name, w):
    cells = " ".join(f"{v + 0.0:8.4f}" for v in w)
    print(f"{name:16s}{cells}   exact zeros: {int(np.sum(w == 0))}")

show("no penalty", w_hat)
show("L1 (soft-thr.)", w_l1)
show("L2", w_l2)
show("L1 (sign steps)", w_sign)
print(f"zeroed weights: |w_hat| = {abs(w_hat[1]):.3f} and {abs(w_hat[3]):.3f}, both <= lambda = {lam}")
size = np.abs(w_sign[[1, 3]])
print(f"sign steps leave them bouncing within about lr * lambda = {0.01 * lam:.3f} of 0, never on it")
assert np.allclose(w_l1, soft(w_hat, lam)) and np.allclose(w_l2, w_hat / (1 + 2 * lam))
assert np.sum(w_l1 == 0) == 2 and np.sum(w_l2 == 0) == 0
assert np.all(size > 0) and np.all(size < 2 * 0.01 * lam)
```

**Output:**

```
no penalty        0.5000   0.0100  -0.8000   0.0020   0.3000   exact zeros: 0
L1 (soft-thr.)    0.4000   0.0000  -0.7000   0.0000   0.2000   exact zeros: 2
L2                0.4167   0.0083  -0.6667   0.0017   0.2500   exact zeros: 0
L1 (sign steps)   0.4000   0.0010  -0.7000  -0.0001   0.2000   exact zeros: 0
zeroed weights: |w_hat| = 0.010 and 0.002, both <= lambda = 0.1
sign steps leave them bouncing within about lr * lambda = 0.001 of 0, never on it
```

<details>
<summary><strong>Read as text</strong> — continued: why sign() steps only hover near zero</summary>

Both numerical answers match the closed forms. The sign-step version stays within about $\text{lr} \times \lambda = 0.001$ of zero but bounces around it instead of landing — which is why Lasso solvers use soft-thresholding, and why plain SGD with an L1 term gives *small* rather than *zero* weights.

</details>

### The geometric and Bayesian views

<details>
<summary><strong>Read as text</strong> — the diamond vs circle picture, the Bayesian priors and the side-by-side table</summary>

**Geometry.** Minimising $L$ with a penalty is equivalent to minimising $L$ inside a "budget" region (a Lagrange-multiplier argument; a bigger $\lambda$ means a smaller budget $t$):

```
  L1 region: |w1| + |w2| ≤ t                  L2 region: w1² + w2² ≤ t²

                w2                                          w2
                ▲                                           ▲
                ◆ ◄── corner: w1 = 0                        │
               ╱│╲                                      ╭───┼───╮ ◄── smooth: no corner
              ╱ │ ╲                                    ╱    │    ╲
       ──────◆──┼──◆──────► w1                     ────┼────┼────┼────► w1
              ╲ │ ╱                                    ╲    │    ╱
               ╲│╱                                      ╰───┼───╯
                ◆                                           │
```

Grow the loss contours (ellipses around the unregularised best fit) until they first touch the region. The diamond's corners stick out *on the axes*, so they are usually touched first — and on an axis one weight is exactly $0$. The circle has no corners, so the first touch is almost never on an axis: both weights shrink but stay non-zero.

**Probability.** Regularised training is **MAP estimation** (§3.6): maximise likelihood × prior. With Gaussian noise of variance $\sigma^2$ and a Gaussian prior $w_j \sim \mathcal{N}(0, \tau^2)$ on each weight, the negative log-posterior is

$$-\log p(\mathbf{w} \mid \text{data}) = \frac{1}{2\sigma^2}\sum_i (y_i - \hat y_i)^2 + \frac{1}{2\tau^2}\sum_j w_j^2 + \text{const}$$

Multiply by $2\sigma^2$: the sum of squared errors plus $\lambda \sum_j w_j^2$ with $\lambda = \sigma^2 / \tau^2$. A tighter prior (smaller $\tau$ — "I strongly believe the weights are small") means a larger $\lambda$. A Laplace prior $p(w) \propto e^{-|w|/b}$ gives the L1 penalty in the same way, with $\lambda = 2\sigma^2 / b$; its sharp peak at exactly $0$ is the probabilistic version of the diamond's corners.

**Side by side:**

| | L1 (Lasso) | L2 (Ridge / weight decay) |
|---|---|---|
| Penalty | $\lambda \sum \lvert w_i \rvert$ | $\lambda \sum w_i^2$ |
| Pull on one weight | Constant, $\pm\lambda$ | Proportional, $2\lambda w$ |
| Solution (uncorrelated features) | Subtract $\lambda$ from the size, stop at 0 | Divide by $1 + 2\lambda$ |
| Exact zeros? | Yes — automatic feature selection | No — every weight shrinks |
| Constraint region | Diamond (corners on the axes) | Circle (no corners) |
| Bayesian prior | Laplace | Gaussian |
| Two correlated features | Keeps one, zeros the other (an arbitrary pick) | Shares the weight between them |
| Typical use | Classical ML with many features, few of them useful | Nearly all neural-network training, as weight decay |

**In practice:**

- **Neural networks** use L2 in its weight-decay form, applied the AdamW way (§4.4). LLM recipes commonly use a decay of about $0.1$ (Llama 2 used $0.1$), often not applied to biases and normalisation gains.
- **L1** shines when you want a short list of features — which 10 of 500 medical measurements actually predict the disease?
- **Elastic Net** $= \lambda_1 \sum |w_i| + \lambda_2 \sum w_i^2$ keeps L1's sparsity but shares weight among correlated features ([Ch 12 §12.2](#content/12_key_algorithms)).
- **Standardise features first:** the penalty acts on each weight's size, and that size depends on the feature's units ([Ch 08 §8.15](#content/08_core_concepts)).

</details>

### Dropout — regularising with random masks

![Infographic on inverted dropout: a-tilde = a x m / (1 - p) with each symbol labelled, E of a-tilde = a and Var = a squared x p / (1 - p); the mean step by step for a = 0.9, p = 0.5 (keep gives 1.8, drop gives 0, expectation 0.5 x 1.8 + 0.5 x 0 = 0.9) as a two-branch probability tree; the noise step by step (variance 0.81, std 0.9) with to-scale bars of std / a = 0.33, 1.00, 3.00 for p = 0.1, 0.5, 0.9; the ensemble view (6 units, 2^6 = 64 thinned networks sharing weights); typical dropout rates (about 0.1 in Transformers, 0.3-0.5 on large dense layers, often none in LLM pre-training such as PaLM); the trap of forgetting 1/(1 - p) or leaving dropout on at test time.](diagrams/math06_info_dropout_expectation_ai.png)

<details>
<summary><strong>Read as text</strong> — the random mask, why divide by 1 − p, the ensemble view and typical rates</summary>

**Simple Explanation:**
During training, switch off each neuron at random with probability $p$ — like studying with random pages torn out of the book, so you cannot rely on any single page. At inference every neuron is on.

> **Maths in one line:** $\tilde a = a \cdot \dfrac{m}{1-p}$, where the mask $m = 1$ (keep) with probability $1 - p$ and $m = 0$ otherwise — so $\mathbb{E}[\tilde a] = a$ (the average is unchanged) while $\operatorname{Var}[\tilde a] = a^2\,\dfrac{p}{1-p}$ (the noise that does the regularising).

**Why divide by $1 - p$?** $\tilde a$ takes only two values, so its expectation is a two-term sum (§3.3):

$$\mathbb{E}[\tilde a] = (1-p)\cdot\frac{a}{1-p} + p \cdot 0 = a \qquad \mathbb{E}[\tilde a^2] = (1-p)\cdot\frac{a^2}{(1-p)^2} = \frac{a^2}{1-p} \quad\Rightarrow\quad \operatorname{Var}[\tilde a] = \frac{a^2}{1-p} - a^2 = a^2\,\frac{p}{1-p}$$

**Tiny numbers.** With $a = 0.9$ and $p = 0.5$, $\tilde a$ is $1.8$ or $0$, each half the time: mean $0.9$, standard deviation $0.9$. With $p = 0.1$ the standard deviation is $0.9\sqrt{0.1/0.9} = 0.3$; with $p = 0.9$ it is $0.9 \times 3 = 2.7$. Because the training-time average already equals $a$, inference simply uses $a$ with no rescaling. This is *inverted dropout*, the convention PyTorch's `nn.Dropout` uses.

**The ensemble view.** A layer with $n$ droppable units has $2^n$ possible masks — $64$ for $n = 6$ — so each training step samples a different thinned sub-network, all sharing the same weights. Running the full network at inference averages them: exactly for one linear layer (expectation is linear), approximately once non-linearities follow (Srivastava et al., *JMLR* 2014).

**In practice:** rates around $0.1$ in Transformers and $0.3$–$0.5$ on large fully connected layers are common starting points; large LLM pre-training often uses **no** dropout (PaLM was trained without it, then used $0.1$ for most fine-tuning). Always switch the model to evaluation mode at inference — code and pitfalls are in [Ch 14 §14.7](#content/14_neural_networks).

</details>

```python
# Inverted dropout: the expected output equals a exactly, but the noise grows like p / (1 - p)
import numpy as np

rng = np.random.default_rng(0)
a = np.array([0.9, 0.4, 0.7, 0.2, 0.6, 0.8])     # one layer's activations (the example in Ch 14 §14.7)

for p in (0.1, 0.5, 0.9):
    keep = 1 - p
    mean_exact = keep * (a / keep) + p * 0.0                 # two outcomes: a / keep or 0
    var_exact = keep * (a / keep) ** 2 - mean_exact ** 2     # E[a~^2] - (E[a~])^2
    sims = a * (rng.random((200_000, a.size)) < keep) / keep
    print(f"p = {p}: mean of 200,000 passes = {sims.mean(axis=0).round(2).tolist()}")
    print(f"         std / a: formula sqrt(p/(1-p)) = {np.sqrt(p / keep):.2f}, "
          f"simulated = {np.mean(sims.std(axis=0) / a):.2f}")
    assert np.allclose(mean_exact, a) and np.allclose(var_exact, a ** 2 * p / keep)
    assert np.allclose(sims.mean(axis=0), a, atol=0.02)

masks = rng.random((200_000, a.size)) < 0.5                  # contrast: forget the 1/(1-p)
print("no rescaling, p = 0.5:", (a * masks).mean(axis=0).round(2).tolist(), "<- shrunk to (1-p) * a")

w = np.array([0.5, -1.0, 0.3, 0.8, -0.2, 0.4])              # a next-layer neuron z = w . a~
z = (a * masks / 0.5) @ w
print(f"next layer, p = 0.5: mean of z = {z.mean():.2f}, w . a = {w @ a:.2f}")
assert abs(z.mean() - w @ a) < 0.01
```

**Output:**

```
p = 0.1: mean of 200,000 passes = [0.9, 0.4, 0.7, 0.2, 0.6, 0.8]
         std / a: formula sqrt(p/(1-p)) = 0.33, simulated = 0.33
p = 0.5: mean of 200,000 passes = [0.9, 0.4, 0.7, 0.2, 0.6, 0.8]
         std / a: formula sqrt(p/(1-p)) = 1.00, simulated = 1.00
p = 0.9: mean of 200,000 passes = [0.9, 0.4, 0.7, 0.2, 0.6, 0.8]
         std / a: formula sqrt(p/(1-p)) = 3.00, simulated = 3.00
no rescaling, p = 0.5: [0.45, 0.2, 0.35, 0.1, 0.3, 0.4] <- shrunk to (1-p) * a
next layer, p = 0.5: mean of z = 0.62, w . a = 0.62
```

<details>
<summary><strong>Read as text</strong> — continued: what the simulation shows</summary>

The mean comes back for every $p$, as $\mathbb{E}[\tilde a] = a$ promises, while the noise grows from $0.33a$ to $3a$ — at $p = 0.9$ the network trains on very noisy signals. Without the $1/(1-p)$ the training-time average is only half the inference-time value, so the next layer would see a different scale at test time.

</details>

---

## 4.6 Convex vs Non-Convex

![Infographic on convex vs non-convex functions: the chord rule f(theta a + (1 - theta) b) <= theta f(a) + (1 - theta) f(b) with each part labelled; chord test on the bowl x squared (chord 4 above f(0) = 0, convex) and on g(x) = 0.1x^4 - x^2 + 0.4x (g(-2) = -3.2, g(2) = -1.6, chord -2.4 below g(0) = 0.0, not convex; global minimum -3.41 at x = -2.33, local -1.63 at x = 2.13) drawn to scale; the saddle x^2 - y^2 with Hessian eigenvalues +2 and -2 on a 3D surface; which ML losses are convex; swap argument (loss 0.00, 0.00, halfway 2.00), toy share of minima 49.80%, 2.71%, 0.01%; trap: saddles slow gradient descent (38 vs 76 steps).](diagrams/math06_info_convexity_saddle_points_ai.png)

<details>
<summary><strong>Read as text</strong> — the bowl vs the mountain range, the chord test, convex losses and the swap argument</summary>

**Simple Explanation:**
A **convex** function is shaped like a bowl: wherever you start, rolling downhill leads to the one and only bottom. A **non-convex** function is a mountain range with many valleys: rolling downhill may leave you in a small valley while the deepest one is somewhere else.

> **Maths in one line:** $f\big(\theta a + (1-\theta) b\big) \le \theta f(a) + (1-\theta) f(b)$ for all points $a, b$ and every $0 \le \theta \le 1$ — every straight chord between two points of the curve lies on or above the curve. For smooth functions this is the same as $f''(x) \ge 0$ everywhere; in many dimensions, the Hessian (§2.5) has no negative eigenvalues anywhere.

**The picture-level test — draw a chord.** Take the bowl $f(x) = x^2$ and a two-valley curve $g(x) = 0.1x^4 - x^2 + 0.4x$, and join their points at $x = -2$ and $x = 2$:

| | $f(x) = x^2$ | $g(x) = 0.1x^4 - x^2 + 0.4x$ |
|---|---|---|
| Curve at $x = -2$ and $x = 2$ | $4$ and $4$ | $-3.2$ and $-1.6$ |
| Chord at the midpoint $x = 0$ (their average) | $4$ | $-2.4$ |
| Curve at $x = 0$ | $0$ — below the chord ✓ | $0.0$ — **above** the chord ✗ |
| Second derivative | $f'' = 2 \ge 0$ everywhere | $g''(0) = -2 < 0$ (bends down) |
| Minima | One, at $x = 0$ | Global at $x \approx -2.33$ ($g \approx -3.41$); local at $x \approx 2.13$ ($g \approx -1.63$) |

```chart
{
  "type": "line",
  "data": {
    "labels": [-3.0,-2.5,-2.0,-1.5,-1.0,-0.5,0.0,0.5,1.0,1.5,2.0,2.5,3.0],
    "datasets": [
      {
        "label": "Convex: x²",
        "data": [9.0,6.25,4.0,2.25,1.0,0.25,0.0,0.25,1.0,2.25,4.0,6.25,9.0],
        "borderColor": "rgba(34, 197, 94, 1)",
        "backgroundColor": "rgba(34, 197, 94, 0.1)",
        "fill": false,
        "tension": 0.4,
        "pointRadius": 0
      },
      {
        "label": "Chord of x² from -2 to 2 (above the curve)",
        "data": [null,null,4.0,null,null,null,null,null,null,null,4.0,null,null],
        "borderColor": "rgba(34, 197, 94, 1)",
        "borderDash": [5,5],
        "spanGaps": true,
        "fill": false,
        "tension": 0,
        "pointRadius": 3
      },
      {
        "label": "Non-convex: 0.1x⁴ − x² + 0.4x",
        "data": [-2.1,-3.34,-3.2,-2.34,-1.3,-0.44,0.0,-0.04,-0.5,-1.14,-1.6,-1.34,0.3],
        "borderColor": "rgba(239, 68, 68, 1)",
        "backgroundColor": "rgba(239, 68, 68, 0.1)",
        "fill": false,
        "tension": 0.4,
        "pointRadius": 0
      },
      {
        "label": "Chord of it from -2 to 2 (the curve pokes above)",
        "data": [null,null,-3.2,null,null,null,null,null,null,null,-1.6,null,null],
        "borderColor": "rgba(239, 68, 68, 1)",
        "borderDash": [5,5],
        "spanGaps": true,
        "fill": false,
        "tension": 0,
        "pointRadius": 3
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Convex vs non-convex: a chord never dips below a convex curve" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Loss" } },
      "x": { "title": { "display": true, "text": "Parameter value" } }
    }
  }
}
```

Gradient descent started at $x = 1$ on $g$ sees the slope $g'(1) = -1.2$, rolls right into the shallow valley at $x \approx 2.13$ and stops there; it never learns that a deeper valley exists on the left.

**Which ML losses are convex?**

| Model and loss | Convex? | Consequence |
|---|---|---|
| Linear regression + MSE | Yes (strictly, if $X^\top X$ is invertible) | Gradient descent with a small enough step reaches the global minimum |
| Logistic regression + log-loss | Yes | Same — but on perfectly separable data the minimum sits "at infinity" (weights grow forever); L2 fixes that |
| SVM hinge loss, Lasso, Ridge | Yes (Ridge strictly) | A global optimum; Ridge's is unique |
| Any network with a hidden layer | **No** | You find *a* good minimum, not provably *the* best one |

**Why a neural network cannot be convex — the swap argument.** Swap two hidden units (with their incoming and outgoing weights) and the network computes exactly the same function, so the loss is identical. If the loss were convex, the halfway point between those two minima would also be a minimum. But halfway, the two units become identical averages — usually a worse network. In the program below both versions have loss $0.00$ and the halfway point has loss $2.00$. A layer of $h$ hidden units has $h!$ such copies of every minimum.

**The good news, with care.** Large networks are non-convex, yet the minima SGD finds are usually about as good as each other. Choromanska et al. (AISTATS 2015) showed that, under simplifying assumptions, the low-lying critical points of large networks sit in a narrow band of loss just above the global minimum, and the number of local minima outside that band shrinks exponentially with network size. The bigger practical obstacle is the saddle point (below). The applied view is in [Ch 08 §8.9](#content/08_core_concepts).

</details>

```python
# Convex or not? Test the chord rule on a bowl and on two valleys, then break it with a 2-unit network
import numpy as np

f = lambda x: x ** 2                            # the bowl (green curve in the chart)
g = lambda x: 0.1 * x ** 4 - x ** 2 + 0.4 * x   # two valleys (red curve in the chart)

def chord_violations(h, xs):                    # pairs (a, b) where h(midpoint) > average of h(a), h(b)
    a, b = np.meshgrid(xs, xs)
    return int(np.sum(h((a + b) / 2) > (h(a) + h(b)) / 2 + 1e-12))

xs = np.linspace(-3, 3, 61)
print(f"x^2 : curve above the chord for {chord_violations(f, xs)} of {xs.size ** 2} pairs (a, b)")
print(f"g(x): curve above the chord for {chord_violations(g, xs)} of {xs.size ** 2} pairs (a, b)")
print(f"g(-2) = {g(-2):.1f}, g(2) = {g(2):.1f}: chord midpoint {(g(-2) + g(2)) / 2:.1f} < g(0) = {g(0):.1f}")
print(f"second derivative: f'' = 2 everywhere, g''(0) = {1.2 * 0 ** 2 - 2:.1f} (bends down -> not convex)")

# A neural net: swap its two hidden units -> SAME function, but the halfway point is worse
x = np.array([-2.0, -1.0, 0.0, 1.0, 2.0])
y = np.abs(x)                                   # target |x| = relu(x) + relu(-x)

def loss(w, v):                                 # y_hat = v1 * relu(w1 x) + v2 * relu(w2 x)
    h = np.maximum(np.outer(x, w), 0.0)
    return float(np.mean((h @ v - y) ** 2))

wA, vA = np.array([1.0, -1.0]), np.array([1.0, 1.0])
wB, vB = np.array([-1.0, 1.0]), np.array([1.0, 1.0])   # units 1 and 2 swapped
wM, vM = (wA + wB) / 2, (vA + vB) / 2                  # halfway between the two
print(f"loss A = {loss(wA, vA):.2f}, loss B = {loss(wB, vB):.2f}, loss halfway = {loss(wM, vM):.2f}")
assert chord_violations(f, xs) == 0 and chord_violations(g, xs) > 0
assert loss(wM, vM) > (loss(wA, vA) + loss(wB, vB)) / 2   # convexity would forbid this
```

**Output:**

```
x^2 : curve above the chord for 0 of 3721 pairs (a, b)
g(x): curve above the chord for 2324 of 3721 pairs (a, b)
g(-2) = -3.2, g(2) = -1.6: chord midpoint -2.4 < g(0) = 0.0
second derivative: f'' = 2 everywhere, g''(0) = -2.0 (bends down -> not convex)
loss A = 0.00, loss B = 0.00, loss halfway = 2.00
```

### Saddle points — the real obstacle in high dimensions

<details>
<summary><strong>Read as text</strong> — the mountain pass, why saddles dominate and how they slow gradient descent</summary>

**Simple Explanation:**
A saddle is a mountain pass: downhill along the valley, uphill toward the two peaks. The ground is flat at the centre (gradient zero), so gradient descent slows to a crawl there even though it is not a minimum.

**The smallest example.** $f(x, y) = x^2 - y^2$ has gradient $(2x, -2y) = (0, 0)$ at the origin, and its Hessian $\begin{pmatrix} 2 & 0 \\ 0 & -2 \end{pmatrix}$ has eigenvalues $+2$ (curving up along $x$) and $-2$ (curving down along $y$). Mixed signs mean a saddle.

**Why saddles dominate in high dimensions.** At a point where the gradient is zero, a minimum needs **all** $n$ Hessian eigenvalues to be positive. If each sign were a coin flip, that would happen with probability $2^{-n}$ — about 1 in 1,000 for $n = 10$, and models have billions of parameters. For random symmetric matrices the odds are even worse: they shrink like $e^{-0.27 n^2}$ (Dean & Majumdar, *Phys. Rev. Lett.* 2006). That is a toy model, but Dauphin et al. (NeurIPS 2014) found the same pattern in real networks: critical points with high training error had many directions of negative curvature — they were saddles, not bad local minima.

**Do saddles trap gradient descent?** Rarely for good. From a random start, gradient descent with a small enough step almost surely does not converge to such a saddle (Lee et al., COLT 2016), and adding a little noise escapes them efficiently (Jin et al., ICML 2017). But it can **slow down** a lot nearby: the escape time grows like $\log(1/\text{distance})$, which shows up as long plateaus in training curves — one reason momentum (§4.3) and SGD's noise help.

</details>

```python
# Saddle points: gradient descent slows down near one, and in many dimensions most critical points are saddles
import numpy as np

# 1. f(x, y) = x^2 - y^2 has zero gradient at (0, 0); its Hessian has eigenvalues +2 and -2
H = np.array([[2.0, 0.0], [0.0, -2.0]])
print("Hessian eigenvalues at (0, 0):", np.linalg.eigvalsh(H).tolist(), "-> a saddle")

def descend(x, y, lr=0.1, steps=200):
    for t in range(1, steps + 1):
        x, y = x - lr * 2 * x, y - lr * (-2 * y)   # gradient of x^2 - y^2 is (2x, -2y)
        if abs(y) > 1:
            return t, x
    return None, x

for y0 in (0.0, 1e-6, 1e-3):
    t, x = descend(1.0, y0)
    where = "never leaves the saddle" if t is None else f"escapes (|y| > 1) after {t} steps"
    print(f"start (1, {y0:g}): {where}; x is then {x:.0e}")

# 2. Toy model: a random symmetric Hessian in n dimensions. How often is it a MINIMUM (all eigenvalues > 0)?
rng = np.random.default_rng(0)
for n in (1, 2, 3, 5, 8):
    A = rng.normal(size=(20_000, n, n))
    smallest = np.linalg.eigvalsh((A + A.transpose(0, 2, 1)) / 2)[:, 0]
    print(f"n = {n}: minimum in {np.mean(smallest > 0):6.2%} of cases   (coin-flip guess 0.5^n = {0.5 ** n:6.2%})")
assert np.mean(smallest > 0) < 0.5 ** 8
```

**Output:**

```
Hessian eigenvalues at (0, 0): [-2.0, 2.0] -> a saddle
start (1, 0): never leaves the saddle; x is then 4e-20
start (1, 1e-06): escapes (|y| > 1) after 76 steps; x is then 4e-08
start (1, 0.001): escapes (|y| > 1) after 38 steps; x is then 2e-04
n = 1: minimum in 49.80% of cases   (coin-flip guess 0.5^n = 50.00%)
n = 2: minimum in 14.50% of cases   (coin-flip guess 0.5^n = 25.00%)
n = 3: minimum in  2.71% of cases   (coin-flip guess 0.5^n = 12.50%)
n = 5: minimum in  0.01% of cases   (coin-flip guess 0.5^n =  3.12%)
n = 8: minimum in  0.00% of cases   (coin-flip guess 0.5^n =  0.39%)
```

<details>
<summary><strong>Read as text</strong> — continued: the logarithmic slow-down and the vanishing share of minima</summary>

Starting exactly on the line $y = 0$, gradient descent walks straight into the saddle and stays. Any tiny offset escapes, but starting $1{,}000\times$ closer costs twice the steps ($38 \to 76$) — the logarithmic slow-down. In the toy model the share of minima collapses from $50\%$ at $n = 1$ to $0.01\%$ at $n = 5$, far faster than the coin-flip guess.

</details>

---

## 4.7 Batch Normalization & Layer Normalization ★★★

![Infographic on BatchNorm vs LayerNorm vs RMSNorm: the formula y = gamma times (x - mu) / sqrt(sigma squared + epsilon) + beta with each symbol labelled; BatchNorm down feature 1 of a 4 x 3 batch (2.0, 3.0, 1.0, 4.0: mean 2.5, variance 1.25, std 1.118, output -0.45, +0.45, -1.34, +1.34); LayerNorm across sample 2 (3.0, 1.5, 2.0: mean 2.17, variance 0.39, std 0.62, output +1.34, -1.07, -0.27); RMSNorm of the same sample (mean of squares 5.08, RMS 2.25, output 1.33, 0.67, 0.89, mean 0.96) with before/after bars to scale; the 4 x 3 grid with the column and row highlighted; table of statistics, parameters (2 per feature, 2d, d) and homes; trap: BatchNorm needs a batch of roughly 16-32+ per device.](diagrams/math06_info_batchnorm_layernorm_rmsnorm_ai.png)

<details>
<summary><strong>Read as text</strong> — z-scores inside the network and the one-line formula</summary>

**Simple Explanation:**
Normalisation turns numbers into z-scores — subtract the mean, divide by the standard deviation — *inside* the network, so every layer receives inputs on a steady scale and training stays stable. The methods differ only in **which numbers they average over**. BatchNorm compares a value with the **same feature in the other samples of the batch**; LayerNorm compares it with the **other features of the same sample**; RMSNorm is LayerNorm without the mean step, and is what most modern LLMs use.

> **Maths in one line:** $y = \gamma \cdot \dfrac{x - \mu}{\sqrt{\sigma^2 + \varepsilon}} + \beta$ — compute $\mu$ and $\sigma^2$ down one feature column (BatchNorm) or across one sample's features (LayerNorm), standardise, then let the learned $\gamma$ and $\beta$ set the final scale and shift. RMSNorm keeps only $y = g \cdot x / \text{RMS}(x)$.

The applied home — placement (pre-norm vs post-norm), QK-Norm and the other variants — is [Ch 16 §1.5](#content/16_deep_learning); the modern LLM block is in [Ch 17 §2.4](#content/17_llm).

</details>

### Batch Normalization (BatchNorm)

<details>
<summary><strong>Read as text</strong> — the per-feature batch formulas, worked numbers and the small-batch problem</summary>

Normalises each feature dimension across the mini-batch. For a mini-batch of $m$ samples and feature $j$:

$$\mu_B^{(j)} = \frac{1}{m}\sum_{i=1}^{m} x_i^{(j)} \qquad \sigma_B^{2(j)} = \frac{1}{m}\sum_{i=1}^{m}\!\left(x_i^{(j)} - \mu_B^{(j)}\right)^2$$

$$\hat{x}_i^{(j)} = \frac{x_i^{(j)} - \mu_B^{(j)}}{\sqrt{\sigma_B^{2(j)} + \varepsilon}} \qquad y_i^{(j)} = \gamma^{(j)} \hat{x}_i^{(j)} + \beta^{(j)}$$

**Tiny numbers.** Feature 1 across a batch of four samples is $[2.0,\ 3.0,\ 1.0,\ 4.0]$: $\mu_B = 2.5$, $\sigma_B^2 = (0.25 + 0.25 + 2.25 + 2.25)/4 = 1.25$, so $\sigma_B = 1.118$ and $\hat x = [-0.45,\ +0.45,\ -1.34,\ +1.34]$ (the $\varepsilon \approx 10^{-5}$ is too small to change these digits).

$\gamma$ and $\beta$ are learnable scale and shift parameters (one pair per feature) that let the network undo the normalisation if needed. During **training**, $\mu_B$ and $\sigma_B^2$ come from the current mini-batch. During **inference**, they are replaced by running averages accumulated during training (PyTorch: $\text{running} \leftarrow 0.9 \cdot \text{running} + 0.1 \cdot \text{batch statistic}$), so the output depends only on the single input, not on what else happens to be in the batch.

BatchNorm (Ioffe & Szegedy, 2015) is standard in CNNs (ResNet, EfficientNet) but struggles with small batches — a batch mean wobbles by about $\sigma/\sqrt{B}$, which is $\pm 71\%$ of $\sigma$ at $B = 2$ — and with variable-length sequences, where "the same feature across the batch" is ill-defined.

</details>

### Layer Normalization (LayerNorm)

<details>
<summary><strong>Read as text</strong> — the per-sample formulas, worked numbers and where LayerNorm is used</summary>

Normalises each sample across its own features, completely independently of the rest of the batch:

$$\mu^{(i)} = \frac{1}{d}\sum_{j=1}^{d} x_{ij} \qquad \sigma^{2(i)} = \frac{1}{d}\sum_{j=1}^{d}\!\left(x_{ij} - \mu^{(i)}\right)^2$$

$$\hat{x}_{ij} = \frac{x_{ij} - \mu^{(i)}}{\sqrt{\sigma^{2(i)} + \varepsilon}} \qquad y_{ij} = \gamma_j \hat{x}_{ij} + \beta_j$$

**Tiny numbers.** One sample (one token) with $d = 3$ features, $[3.0,\ 1.5,\ 2.0]$: $\mu = 2.17$, $\sigma^2 = (0.69 + 0.44 + 0.03)/3 = 0.39$, so $\sigma = 0.62$ and $\hat x = [+1.34,\ -1.07,\ -0.27]$.

Because the statistics come from one sample's own features, LayerNorm (Ba, Kiros & Hinton, 2016) behaves identically at training and inference and works at any batch size or sequence length. It is the classic Transformer normaliser — the original Transformer, BERT and GPT-2/3 use it — with $2d$ learned parameters ($\gamma$ and $\beta$).

</details>

### RMSNorm — LayerNorm without the mean

<details>
<summary><strong>Read as text</strong> — dropping the mean, worked numbers, invariances and why LLMs switched</summary>

Most open-weight LLMs since 2023 use **RMSNorm** instead: skip the mean, and divide by the root-mean-square (square every number, average, take the square root):

$$\text{RMS}(\mathbf{x}) = \sqrt{\frac{1}{d}\sum_{j=1}^{d} x_j^2 + \varepsilon} \qquad y_j = g_j \cdot \frac{x_j}{\text{RMS}(\mathbf{x})}$$

**Tiny numbers** (the same sample): the mean of squares is $(9.00 + 2.25 + 4.00)/3 = 5.08$, so $\text{RMS} = 2.25$ and $y = [3.0,\ 1.5,\ 2.0] / 2.25 = [1.33,\ 0.67,\ 0.89]$. The size is fixed (RMS $= 1$) but the mean is $0.96$, not $0$ — and that is fine.

| Property (one sample $\mathbf{x}$) | LayerNorm | RMSNorm |
|---|---|---|
| Scale the sample, $\mathbf{x} \to c\,\mathbf{x}$ with $c > 0$ | Output unchanged | Output unchanged |
| Shift the sample, $\mathbf{x} \to \mathbf{x} + b$ | Output unchanged | Output **changes** |
| Statistics per sample | 2 (mean, variance) | 1 (mean of squares) |
| Learned parameters | $2d$ ($\gamma$, $\beta$) | $d$ ($g$) |

**Why LLMs switched.** Zhang & Sennrich (NeurIPS 2019) argued that LayerNorm's *re-scaling*, not its *re-centring*, is what helps, and found RMSNorm matched LayerNorm's quality while cutting running time by 7–64% across their models. One reduction instead of two and no $\beta$ also make it cheaper on GPUs. Llama, Gemma, Mistral, Qwen and DeepSeek all use RMSNorm, placed *before* each sublayer ("pre-norm"; Gemma 2 and 3 add a second norm after it); Gemini's internal normalisation is not publicly documented. PyTorch ships it as `torch.nn.RMSNorm`.

> **Research to watch (2025):** *Transformers without Normalization* (Zhu, Chen, He, LeCun & Liu, CVPR 2025) replaced every norm layer with an element-wise $\text{DyT}(x) = \gamma \tanh(\alpha x) + \beta$, with a learned scalar $\alpha$, and matched or beat normalised Transformers in their experiments. It is not (yet) the standard recipe.

</details>

### Side by side

<details>
<summary><strong>Read as text</strong> — the rows-vs-columns picture and the three-way comparison table</summary>

```
  Mini-batch: 4 samples, 3 features

  Sample 1:  [a, b, c]
  Sample 2:  [d, e, f]    ← BatchNorm normalises down each COLUMN
  Sample 3:  [g, h, i]       (across the batch, per feature)
  Sample 4:  [j, k, l]
                             LayerNorm and RMSNorm normalise across each ROW
                             (across features, per sample)
```

| Property | BatchNorm | LayerNorm | RMSNorm |
|----------|-----------|-----------|---------|
| Statistics over | One feature, across the batch | One sample, across its features | One sample, across its features, no mean |
| Train vs inference | Different (running averages at inference) | Identical | Identical |
| Output depends on batch-mates | Yes | No | No |
| Learned parameters | 2 per feature (plus 2 running buffers) | $2d$ | $d$ |
| Needs a large batch | Yes — roughly 16–32+ samples per device | No | No |
| Typical home | CNNs (ResNet, EfficientNet) | Original Transformer, BERT, GPT-2/3 | Llama, Gemma, Mistral, Qwen, DeepSeek |

The program normalises the same 4×3 batch as [Ch 16 §1.5](#content/16_deep_learning) three ways, then tests the two properties that matter: does a sample's output depend on its batch-mates, and which shifts and scales does each norm ignore?

</details>

```python
# BatchNorm vs LayerNorm vs RMSNorm on one 4x3 batch: which axis each uses, and what each ignores
import numpy as np

X = np.array([[2.0, 0.1, 5.0],       # 4 samples (rows) x 3 features (columns),
              [3.0, 1.5, 2.0],       # the same grid as Ch 16 §1.5
              [1.0, 0.3, 3.0],
              [4.0, 2.0, 4.0]])
eps = 1e-5

def bn(X):                           # statistics DOWN each column: one feature across the batch
    return (X - X.mean(axis=0)) / np.sqrt(X.var(axis=0) + eps)

def ln(X):                           # statistics ACROSS each row: one sample's own features
    return (X - X.mean(axis=1, keepdims=True)) / np.sqrt(X.var(axis=1, keepdims=True) + eps)

def rms(X):                          # like LayerNorm but no mean: divide by root-mean-square
    return X / np.sqrt((X ** 2).mean(axis=1, keepdims=True) + eps)

fmt = lambda v: "[" + ", ".join(f"{x:+.2f}" for x in v) + "]"
print("BatchNorm, feature 1 (column):", fmt(bn(X)[:, 0]))
print("LayerNorm, sample 2 (row)    :", fmt(ln(X)[1]))
print("RMSNorm,   sample 2 (row)    :", fmt(rms(X)[1]), " row mean", f"{rms(X)[1].mean():.2f}")

X2 = X.copy()
X2[3] = [9.0, 9.0, 9.0]              # change ONLY sample 4, then look at sample 1
print("sample 1, BN before/after:", fmt(bn(X)[0]), "->", fmt(bn(X2)[0]))
print("sample 1, LN before/after:", fmt(ln(X)[0]), "->", fmt(ln(X2)[0]))

same = lambda A, B: bool(np.allclose(A, B, atol=1e-4))
print("LN(3x + 7) = LN(x):", same(ln(3 * X + 7), ln(X)),
      "| RMS(3x) = RMS(x):", same(rms(3 * X), rms(X)),
      "| RMS(x + 7) = RMS(x):", same(rms(X + 7), rms(X)))
assert np.allclose(bn(X).mean(axis=0), 0) and np.allclose(ln(X).mean(axis=1), 0)
assert np.allclose(np.sqrt((rms(X) ** 2).mean(axis=1)), 1, atol=1e-4)
assert not same(bn(X2)[0], bn(X)[0]) and same(ln(X2)[0], ln(X)[0])
```

**Output:**

```
BatchNorm, feature 1 (column): [-0.45, +0.45, -1.34, +1.34]
LayerNorm, sample 2 (row)    : [+1.34, -1.07, -0.27]
RMSNorm,   sample 2 (row)    : [+1.33, +0.67, +0.89]  row mean 0.96
sample 1, BN before/after: [-0.45, -1.10, +1.34] -> [-0.56, -0.72, +0.09]
sample 1, LN before/after: [-0.18, -1.12, +1.31] -> [-0.18, -1.12, +1.31]
LN(3x + 7) = LN(x): True | RMS(3x) = RMS(x): True | RMS(x + 7) = RMS(x): False
```

<details>
<summary><strong>Read as text</strong> — continued: what changing one sample shows</summary>

Changing only sample 4 moves sample 1's BatchNorm output from $[-0.45, -1.10, +1.34]$ to $[-0.56, -0.72, +0.09]$, while its LayerNorm output does not move — that is the whole "batch-mates" difference, and why BatchNorm needs running statistics at inference. LayerNorm ignores both a scale and a shift of a sample; RMSNorm ignores only the scale.

</details>

---

# PART 5: INFORMATION THEORY ★★

> Information theory measures surprise and uncertainty. How surprised are you
> when something happens? That surprise IS information.

Three numbers run through every classifier and every LLM. Learn them as one family:

| Quantity | The question it answers | Formula | Smallest possible value |
|---|---|---|---|
| **Entropy** $H(P)$ | How unpredictable is the truth itself? | $-\sum P \log P$ | 0, when one outcome is certain |
| **Cross-entropy** $H(P, Q)$ | How surprised is my model $Q$ by the truth $P$? | $-\sum P \log Q$ | $H(P)$, when $Q = P$ |
| **KL divergence** $D_{KL}(P \Vert Q)$ | How much EXTRA surprise does my model add? | $\sum P \log \frac{P}{Q}$ | 0, when $Q = P$ |

They fit together as **cross-entropy = entropy + KL divergence** (§5.3).

---

## 5.1 Entropy — Measuring Uncertainty

![Infographic on entropy, cross-entropy and perplexity: the formula H(P, Q) = - sum over x of P(x) log Q(x) with each part labelled; coin entropy step by step (fair 1.0 bit, loaded 0.99/0.01 coin 0.081 bits) on a to-scale entropy curve; cross-entropy for the true class 2 with confidences 0.98, 0.7 and 0.1 giving 0.020, 0.357 and 2.303 nats on the -log curve; perplexity exp(0.893) = 2.44 on a number line between perfect 1 and uniform guess 3 (1.21 without the confident mistake); where ML uses entropy; trap: perplexity depends on the tokenizer.](diagrams/math06_info_entropy_cross_entropy_ai.png)

<details>
<summary><strong>Read as text</strong> — surprise in bits, the coin and die examples, and where ML uses entropy</summary>

**Simple Explanation:**
Entropy measures how UNCERTAIN or SURPRISING something is.

If tomorrow's weather is ALWAYS sunny (100% chance), there's zero surprise. Zero entropy. Boring.

If tomorrow could be sunny, rainy, snowy, or a tornado — each equally likely — that's maximum surprise. Maximum entropy. Very unpredictable!

Think of it like a game show. If you already know the answer, the reveal isn't exciting (low entropy). If the answer could be anything, the reveal is super exciting (high entropy)!

> **Maths in one line:** `H(X) = −Σ P(x) · log₂ P(x)` — the average surprise, where one outcome's surprise is `log₂(1 / P(x))` bits: a fair coin flip carries 1 bit, one roll of a fair die 2.585 bits.

**Formula:**

$$H(X) = - \sum_{x} P(x) \cdot \log_2 P(x)$$

> **In plain English:** "For each possible outcome, multiply its probability by the log of its probability. Add them up. Flip the sign."
>
> Why the log? Because rare events (low probability) carry MORE information when they happen. Seeing a unicorn is more surprising than seeing a dog. A 50/50 event carries $\log_2 2 = 1$ bit; a 1-in-100 event carries $\log_2 100 = 6.64$ bits.

**Units.** With $\log_2$ the unit is the **bit**. With the natural log $\ln$ — what ML code uses — it is the **nat**. 1 nat = 1.443 bits, so divide nats by $\ln 2 = 0.693$ to get bits.

**Example 1:** Fair coin: $P = [0.5, 0.5]$

$$H = -(0.5 \times \log_2 0.5 + 0.5 \times \log_2 0.5) = -(0.5 \times (-1) + 0.5 \times (-1)) = 1.0 \text{ bit}$$

> Maximum uncertainty! Could be either side.

**Example 2:** Loaded coin: $P = [0.99, 0.01]$

$$H = -(0.99 \times \log_2 0.99 + 0.01 \times \log_2 0.01) = -(0.99 \times (-0.0145) + 0.01 \times (-6.644)) = 0.081 \text{ bits}$$

> Very predictable. Almost always heads.

**Example 3:** Fair die: six outcomes, each with $P = 1/6$

$$H = -6 \times \tfrac{1}{6} \log_2 \tfrac{1}{6} = \log_2 6 = 2.585 \text{ bits}$$

> More outcomes, more uncertainty. For $n$ equally likely outcomes $H = \log_2 n$ — the LARGEST entropy any distribution over $n$ outcomes can have. Load the die to $[0.5, 0.1, 0.1, 0.1, 0.1, 0.1]$ and it drops to 2.161 bits.

**A handy reading:** $2^{H}$ is the "effective number of equally likely outcomes" — 2 for the fair coin, 6 for the fair die, about 4.5 for the loaded die and about 1.06 for the loaded coin. Perplexity (§5.2) is the same idea applied to a model's predictions.

**In ML:**

| Where | How entropy is used |
|---|---|
| **Decision trees** | A split is scored by its **information gain** = entropy before − weighted entropy after. Like 20 Questions: the best question removes the most uncertainty. (scikit-learn's default criterion is the similar Gini impurity) — [Ch 10 §10.7](#content/10_supervised_learning) |
| **Language models** | Training minimises **cross-entropy**, and **perplexity** turns it into "how many tokens is the model choosing between?" — lower is better (§5.2) |
| **Sampling** | Temperature raises or lowers the entropy of the next-token distribution (§6.2) |
| **Hallucination detection** | *Semantic entropy* (Farquhar et al., *Nature*, 2024): sample several answers, group them by meaning, and take the entropy over the meanings — high entropy flags a likely made-up answer ([Ch 17b §7](#content/17b_llm_applications)) |

```chart
{
  "type": "line",
  "data": {
    "labels": [0.01,0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.75,0.8,0.85,0.9,0.95,0.99],
    "datasets": [{
      "label": "Entropy H(p) for a coin with P(heads) = p",
      "data": [0.08,0.29,0.47,0.61,0.72,0.81,0.88,0.93,0.97,0.99,1.00,0.99,0.97,0.93,0.88,0.81,0.72,0.61,0.47,0.29,0.08],
      "borderColor": "rgba(99, 102, 241, 1)",
      "backgroundColor": "rgba(99, 102, 241, 0.15)",
      "fill": true,
      "tension": 0.4,
      "pointRadius": 2
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Entropy vs Coin Bias — Maximum Uncertainty at p = 0.5" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Entropy (bits)" }, "beginAtZero": true, "max": 1.1 },
      "x": { "title": { "display": true, "text": "P(heads)" } }
    }
  }
}
```

</details>

**Run it yourself** — the coin, the loaded coin and the die from above, plus the "effective number of outcomes" $2^H$:

```python
# Entropy in bits: a fair coin vs a loaded coin vs a fair die (and a loaded one)
import numpy as np

def entropy_bits(p):
    p = np.asarray(p, dtype=float)
    p = p[p > 0]                                      # convention: 0 * log 0 = 0
    return float((p * np.log2(1 / p)).sum())        # average surprise log2(1/p)

cases = {
    "fair coin   [0.5, 0.5]":    [0.5, 0.5],
    "loaded coin [0.99, 0.01]":  [0.99, 0.01],
    "fair die    6 x 1/6":       [1 / 6] * 6,
    "loaded die  [0.5, 5 x 0.1]": [0.5] + [0.1] * 5,
    "certain     [1, 0]":        [1.0, 0.0],
}
for name, p in cases.items():
    h = entropy_bits(p)
    print(f"{name:<27} H = {h:.3f} bits  ~ {2 ** h:.2f} equally likely outcomes")

print(f"surprise of one die face   = -log2(1/6)  = {-np.log2(1 / 6):.3f} bits")
print(f"surprise of the rare tail  = -log2(0.01) = {-np.log2(0.01):.3f} bits")
print(f"1 nat (natural log) = {1 / np.log(2):.3f} bits")
assert np.isclose(entropy_bits([1 / 6] * 6), np.log2(6))    # uniform over n outcomes -> log2(n), the maximum
assert entropy_bits([0.5] + [0.1] * 5) < np.log2(6)         # any bias lowers the entropy
```

**Output:**

```
fair coin   [0.5, 0.5]      H = 1.000 bits  ~ 2.00 equally likely outcomes
loaded coin [0.99, 0.01]    H = 0.081 bits  ~ 1.06 equally likely outcomes
fair die    6 x 1/6         H = 2.585 bits  ~ 6.00 equally likely outcomes
loaded die  [0.5, 5 x 0.1]  H = 2.161 bits  ~ 4.47 equally likely outcomes
certain     [1, 0]          H = 0.000 bits  ~ 1.00 equally likely outcomes
surprise of one die face   = -log2(1/6)  = 2.585 bits
surprise of the rare tail  = -log2(0.01) = 6.644 bits
1 nat (natural log) = 1.443 bits
```

---

## 5.2 Cross-Entropy — THE Training Loss ★★★

<details>
<summary><strong>Read as text</strong> — the formula, the 3-class losses and why the log</summary>

**Simple Explanation:**
Cross-entropy measures how WRONG your model's predictions are.

If the right answer is "cat" and your model says "cat" with 99% confidence, cross-entropy is tiny (good!). If the model says "cat" with only 10% confidence, cross-entropy is big (bad!).

It's like a teacher grading your confidence. If you're sure about the right answer, you get a good grade. If you're unsure or confidently wrong, bad grade!

> **Maths in one line:** `H(P, Q) = −Σ P(x) · log Q(x)` — the average surprise of the true outcomes, measured with the model's probabilities `Q`; when the truth is a single label it is just `−log Q(correct answer)`.

**Formula:**

$$H(P, Q) = - \sum_{x} P(x) \cdot \log Q(x)$$

| Symbol | Meaning |
|--------|---------|
| $P$ | The TRUE distribution (what the answer actually is) |
| $Q$ | The MODEL's prediction (what the model thinks) |

> **In plain English:** "Look at the correct answer, then check how much probability your model gave to that answer. Take $-\log$ of it."

**Example** (3 classes, correct answer is class 2; natural log, so the losses are in nats):

True label: $P = [0, 1, 0]$. Every term with $P(x) = 0$ drops out, so the sum collapses to one term: $-\log Q(\text{class 2})$.

| Model prediction $Q$ | Loss $= -\log(Q_{\text{correct}})$ | Verdict |
|----------------------|--------------------------------------|---------|
| $[0.01, 0.98, 0.01]$ | $-\log(0.98) = 0.020$ | Very low! Great prediction |
| $[0.1, 0.7, 0.2]$ | $-\log(0.7) = 0.357$ | Medium loss |
| $[0.7, 0.1, 0.2]$ | $-\log(0.1) = 2.303$ | High loss! Bad prediction |

> This is the standard loss for classification in deep learning (for two classes it is called binary cross-entropy or log loss). Every LLM is **pre-trained** by minimising it at every token position: predicting the next token is a classification over the whole vocabulary (about 100K–260K tokens in recent models), and minimising cross-entropy is the same as maximum likelihood (§3.6).

**Why the log?** It punishes confident mistakes hard. Giving the right answer 0.1 costs 2.303; giving it 0.01 costs 4.605; giving it 0 costs infinity. And its gradient with respect to the logits is simply $p - y$ (predicted minus target) — derived in [Ch 16 §1.4](#content/16_deep_learning).

</details>

### Perplexity — Cross-Entropy as "How Many Choices?"

<details>
<summary><strong>Read as text</strong> — perplexity as a count of choices, and the tokenizer trap</summary>

Perplexity turns the average cross-entropy back into a count of options:

$$\text{perplexity} = e^{\,\text{average cross-entropy in nats}} = 2^{\,\text{average cross-entropy in bits}}$$

Read it as "the model is as unsure as if it were picking uniformly among this many options". A perfect model scores 1; uniform guessing over $V$ options scores $V$.

**With the table's three predictions:** the average loss is $(0.020 + 0.357 + 2.303) / 3 = 0.893$ nats, so perplexity $= e^{0.893} = 2.44$ — barely better than guessing uniformly among the 3 classes (perplexity 3). Drop the one confident mistake and it falls to 1.21. One confidently wrong answer dominates the average.

> **Watch out:** perplexity is per token, so it depends on the tokenizer. Compare language models only on the same text with the same tokenizer, or use bits-per-byte — [Ch 17 §1.4](#content/17_llm) and [Ch 17c §4.6](#content/17c_llm_systems).

```chart
{
  "type": "line",
  "data": {
    "labels": [0.01,0.05,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,0.95,0.99],
    "datasets": [{
      "label": "Cross-Entropy Loss = -log(confidence)",
      "data": [4.605,2.996,2.303,1.609,1.204,0.916,0.693,0.511,0.357,0.223,0.105,0.051,0.010],
      "borderColor": "rgba(239, 68, 68, 1)",
      "backgroundColor": "rgba(239, 68, 68, 0.1)",
      "fill": true,
      "tension": 0.4,
      "pointRadius": 3
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Cross-Entropy Loss vs Model Confidence on Correct Class" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Loss (nats)" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "Model Confidence on Correct Answer" } }
    }
  }
}
```

</details>

**Run it yourself** — the three predictions from the table, their loss in nats and bits, and the perplexity:

```python
# Cross-entropy and perplexity for the 3-class example (the true answer is class 2)
import numpy as np

P = np.array([0.0, 1.0, 0.0])                         # one-hot truth
preds = {"confident & right": [0.01, 0.98, 0.01],
         "unsure":            [0.10, 0.70, 0.20],
         "confident & wrong": [0.70, 0.10, 0.20]}

def cross_entropy(p, q):                              # H(P, Q) = -sum P log Q, natural log -> nats
    return float(-(p * np.log(np.asarray(q))).sum())

losses = []
for name, q in preds.items():
    loss = cross_entropy(P, q)
    losses.append(loss)
    print(f"{name:<18} Q = {str(q):<18}  loss = {loss:.3f} nats = {loss / np.log(2):.3f} bits")

mean = float(np.mean(losses))
print(f"average loss = {mean:.3f} nats  ->  perplexity e^{mean:.3f} = {np.exp(mean):.2f}")
print(f"without the confident mistake: perplexity {np.exp(np.mean(losses[:2])):.2f}")
print(f"uniform guess [1/3, 1/3, 1/3]: loss {np.log(3):.3f}  ->  perplexity {np.exp(np.log(3)):.2f}")
print("perfect model:                 loss 0.000  ->  perplexity 1.00")
p_correct = [q[1] for q in preds.values()]
assert np.isclose(np.exp(mean), np.prod(p_correct) ** (-1 / 3))   # = 1 / geometric mean of P(correct)
assert np.isclose(np.exp(mean), 2 ** (mean / np.log(2)))          # same number from bits: 2^(bits)
```

**Output:**

```
confident & right  Q = [0.01, 0.98, 0.01]  loss = 0.020 nats = 0.029 bits
unsure             Q = [0.1, 0.7, 0.2]     loss = 0.357 nats = 0.515 bits
confident & wrong  Q = [0.7, 0.1, 0.2]     loss = 2.303 nats = 3.322 bits
average loss = 0.893 nats  ->  perplexity e^0.893 = 2.44
without the confident mistake: perplexity 1.21
uniform guess [1/3, 1/3, 1/3]: loss 1.099  ->  perplexity 3.00
perfect model:                 loss 0.000  ->  perplexity 1.00
```

---

## 5.3 KL Divergence ★★

![Infographic on KL divergence: the formula D_KL(P || Q) = sum over x of P(x) log(P(x) / Q(x)) with each part labelled; the good model Q1 term by term against the truth P = (0.60, 0.25, 0.10, 0.05) for cat, dog, bird, fish: 0.052 - 0.028 - 0.018 + 0 = 0.006 nats, with to-scale bars; cross-entropy = entropy + KL as stacked bars (1.039 = 1.033 + 0.006 and 2.095 = 1.033 + 1.062); forward vs reverse KL on a two-peak truth (spread model 0.368 vs 0.511, one-peak model 0.703 vs 0.431: mode-covering vs mode-seeking); where ML uses KL (RLHF, DPO, GRPO, distillation, VAEs); trap: KL is not symmetric (1.0615 vs 1.1155).](diagrams/math06_info_kl_divergence_ai.png)

<details>
<summary><strong>Read as text</strong> — the formula, cross-entropy = entropy + KL, and the RLHF leash</summary>

**Simple Explanation:**
KL divergence measures "how different are two probability distributions?" If your model's predictions perfectly match reality, KL = 0. The more different they are, the bigger KL gets.

Think of it like comparing two recipes. If they're identical, KL = 0. The more ingredients differ, the bigger the KL number.

> **Maths in one line:** `D_KL(P ‖ Q) = Σ P(x) · log(P(x) / Q(x))` — the EXTRA surprise you pay, on average, for using the model `Q` when the truth is `P`; never negative, and 0 only when `Q = P`.

**Formula:**

$$D_{KL}(P \| Q) = \sum_{x} P(x) \cdot \log \frac{P(x)}{Q(x)}$$

> **In plain English:** "For each possible outcome, look at the ratio between the true probability and the model's probability. Multiply by the true probability. Add them all up."

Always $\geq 0$. Zero only when $P = Q$ (identical distributions). Infinite if the model gives probability 0 to something that really happens.

**Key relationship:**

$$\underbrace{H(P, Q)}_{\text{cross-entropy}} = \underbrace{H(P)}_{\text{entropy}} + \underbrace{D_{KL}(P \| Q)}_{\text{KL divergence}}$$

Since entropy of the true data is fixed (we can't change reality), minimizing cross-entropy $=$ minimizing KL divergence. Training $=$ making the model's distribution match reality.

**With the chart's numbers** (natural log, nats): the truth $P = [0.60, 0.25, 0.10, 0.05]$ has entropy 1.033. The good model $Q_1$ has cross-entropy 1.039 = 1.033 + KL 0.006; the bad model $Q_2$ has cross-entropy 2.095 = 1.033 + KL 1.062. The entropy part is the same for both — only the KL part tells them apart.

**In ML:** KL is the "leash" that stops a model drifting too far. When you fine-tune a chatbot to be more helpful, you don't want it to forget everything it already knows; KL measures "how far has the model drifted from its original self?" If it drifts too far, the penalty pulls it back — like a dog on a leash that can explore but can't run away.

| Where | What KL does |
|---|---|
| **RLHF (PPO)** | Penalty $\beta \cdot D_{KL}(\pi_\theta \Vert \pi_{\text{ref}})$ keeps the tuned model $\pi_\theta$ near the frozen reference model — [Ch 17 §3.4](#content/17_llm) |
| **DPO** | The same leash is built into the loss through the log-ratios $\log \pi_\theta / \pi_{\text{ref}}$ — [Ch 17 §3.5](#content/17_llm) |
| **GRPO / RLVR** | Usually a KL term to the reference model; some recent recipes drop it — [Ch 17 §3.5b](#content/17_llm) |
| **Knowledge distillation** | The student matches the teacher's soft probabilities: minimise $D_{KL}(\text{teacher} \Vert \text{student})$ — [Ch 29 §24.9](#content/29_gpus_tpus_infrastructure) |
| **VAEs** | A KL term pulls each encoded distribution toward the prior $\mathcal{N}(0, I)$ — [Ch 16 §5.1](#content/16_deep_learning) |

</details>

### Forward vs Reverse KL — Why the Order Matters

<details>
<summary><strong>Read as text</strong> — mode-covering vs mode-seeking, with numbers</summary>

KL is **not symmetric**: $D_{KL}(P \| Q) \neq D_{KL}(Q \| P)$, so it is a *divergence*, not a distance. When the model is too simple to match the truth exactly, the direction you minimise decides what you get:

| Direction | Heavily penalises | Resulting behaviour | Typical use |
|---|---|---|---|
| **Forward** $D_{KL}(P \Vert Q)$ — truth first | $Q \approx 0$ where $P > 0$ | **Mode-covering:** spreads $Q$ over every peak of $P$ | Cross-entropy / MLE training, standard distillation |
| **Reverse** $D_{KL}(Q \Vert P)$ — model first | $Q > 0$ where $P \approx 0$ | **Mode-seeking:** locks $Q$ onto one peak | Variational inference (VAEs), the RLHF penalty $D_{KL}(\pi_\theta \Vert \pi_{\text{ref}})$ |

**With numbers:** the truth has two peaks, $P = [0.45, 0.05, 0.05, 0.45]$. A model that spreads out evenly, $[0.25, 0.25, 0.25, 0.25]$, scores forward KL 0.368, against 0.703 for a model that sits on one peak, $[0.85, 0.05, 0.05, 0.05]$ — forward KL prefers the spread. Reverse KL flips the verdict: 0.511 for the spread against 0.431 for the single peak.

```chart
{
  "type": "bar",
  "data": {
    "labels": ["cat", "dog", "bird", "fish"],
    "datasets": [
      {
        "label": "True Distribution P",
        "data": [0.60, 0.25, 0.10, 0.05],
        "backgroundColor": "rgba(99, 102, 241, 0.7)",
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 1
      },
      {
        "label": "Good Model Q₁ (KL ≈ 0.006 nats)",
        "data": [0.55, 0.28, 0.12, 0.05],
        "backgroundColor": "rgba(34, 197, 94, 0.7)",
        "borderColor": "rgba(34, 197, 94, 1)",
        "borderWidth": 1
      },
      {
        "label": "Bad Model Q₂ (KL ≈ 1.06 nats)",
        "data": [0.10, 0.10, 0.40, 0.40],
        "backgroundColor": "rgba(239, 68, 68, 0.7)",
        "borderColor": "rgba(239, 68, 68, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "KL Divergence — Good Model Matches Reality, Bad Model Doesn't" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Probability" }, "beginAtZero": true, "max": 0.7 }
    }
  }
}
```

</details>

**Run it yourself** — the chart's two models (checking cross-entropy = entropy + KL), then forward vs reverse KL on the two-peak truth:

```python
# KL divergence: the chart's good and bad models, the asymmetry, and forward vs reverse KL
import numpy as np

def kl(p, q):                                         # D_KL(P || Q) = sum P log(P / Q), natural log -> nats
    p, q = np.asarray(p, dtype=float), np.asarray(q, dtype=float)
    m = p > 0                                         # convention: 0 * log(0 / q) = 0
    return float((p[m] * np.log(p[m] / q[m])).sum())

def entropy(p):
    p = np.asarray(p, dtype=float)
    return float(-(p[p > 0] * np.log(p[p > 0])).sum())

P = [0.60, 0.25, 0.10, 0.05]                          # truth over cat, dog, bird, fish
Q1 = [0.55, 0.28, 0.12, 0.05]                         # good model
Q2 = [0.10, 0.10, 0.40, 0.40]                         # bad model
for name, Q in [("good Q1", Q1), ("bad Q2 ", Q2)]:
    ce = -float(np.dot(P, np.log(Q)))
    print(f"{name}: KL(P||Q) = {kl(P, Q):.4f}   KL(Q||P) = {kl(Q, P):.4f}   "
          f"cross-entropy {ce:.4f} = H(P) {entropy(P):.4f} + KL {kl(P, Q):.4f}")
    assert np.isclose(ce, entropy(P) + kl(P, Q))      # H(P, Q) = H(P) + KL(P || Q)
print(f"KL(P||P) = {kl(P, P):.4f}  (zero only when the two match)")

# Forward vs reverse KL: the truth has TWO peaks; a model that can only spread out or pick one peak
P2 = [0.45, 0.05, 0.05, 0.45]
spread = [0.25, 0.25, 0.25, 0.25]
one_peak = [0.85, 0.05, 0.05, 0.05]
for name, Q in [("spread over all ", spread), ("sit on one peak", one_peak)]:
    print(f"{name}: forward KL(P||Q) = {kl(P2, Q):.3f}   reverse KL(Q||P) = {kl(Q, P2):.3f}")
assert kl(P2, spread) < kl(P2, one_peak)              # forward KL prefers covering every peak
assert kl(one_peak, P2) < kl(spread, P2)              # reverse KL prefers locking onto one peak
```

**Output:**

```
good Q1: KL(P||Q) = 0.0056   KL(Q||P) = 0.0058   cross-entropy 1.0388 = H(P) 1.0331 + KL 0.0056
bad Q2 : KL(P||Q) = 1.0615   KL(Q||P) = 1.1155   cross-entropy 2.0946 = H(P) 1.0331 + KL 1.0615
KL(P||P) = 0.0000  (zero only when the two match)
spread over all : forward KL(P||Q) = 0.368   reverse KL(Q||P) = 0.511
sit on one peak: forward KL(P||Q) = 0.703   reverse KL(Q||P) = 0.431
```

---

# PART 6: NUMERICAL METHODS — PRACTICAL MATH

---

## 6.1 Floating Point Precision

![Infographic on floating-point number formats: value = (-1)^sign x 1.mantissa x 2^(exponent - bias) with each part labelled; precision near 1 in FP16 (gap 2^-10 = 0.000977, so 1.0001 rounds back to 1) on a to-scale number line; reading the bits of the largest FP8 E4M3 value, 0 1111 110: (1 + 6/8) x 2^(15 - 7) = 1.75 x 256 = 448; rounding 70,000 (FP16 inf, BF16 70,144, E4M3 448) and 1e-8 (FP16 0, BF16 1.001e-8); to-scale sign/exponent/mantissa bit layouts with largest values for FP32, FP16, BF16, E4M3, E5M2 and E2M1; gap after 1 and uses per format; H100 TFLOPS, MXFP4 and NVFP4 block scales; trap: BF16 has more range but less precision than FP16.](diagrams/math06_info_number_formats_ai.png)

<details>
<summary><strong>Read as text</strong> — the ruler, the bit layouts, the format table, block scales and float pitfalls</summary>

**Simple Explanation:**
Computers can't store numbers perfectly. It's like trying to write pi (3.14159265...) — you eventually run out of paper. Computers have a fixed amount of "paper" for each number.

Think of it like a ruler. A big ruler with lots of tiny marks (FP32) can measure more precisely. A small ruler with fewer marks (FP16) is less precise, but it's lighter and faster to use. Two different things can run out: the LENGTH of the ruler (range — how big or how tiny a number can be) and the SPACING of its marks (precision).

> **Maths in one line:** `value = (−1)^sign × 1.mantissa × 2^(exponent − bias)` — the exponent bits set the RANGE, the mantissa bits set the PRECISION: with `m` mantissa bits the next number after 1 is `1 + 2^−m`.

**With numbers:** FP16 has 10 mantissa bits, so the number after 1 is $1 + 2^{-10} = 1.000977$. The value 1.0001 falls between the two and rounds back to 1.0 — a weight update of 0.0001 simply disappears (§6.3).

| Format | Bits: sign · exponent · mantissa | Largest value | Smallest normal | Gap after 1 | ≈ Decimal digits | Typical use |
|---|---|---|---|---|---|---|
| **FP32** | 1 · 8 · 23 | 3.4 × 10³⁸ | 1.2 × 10⁻³⁸ | 1.2 × 10⁻⁷ | 7 | Master weights, optimizer state |
| **FP16** | 1 · 5 · 10 | 65,504 | 6.1 × 10⁻⁵ | 0.001 | 3 | Older GPUs (V100); needs loss scaling |
| **BF16** | 1 · 8 · 7 | 3.4 × 10³⁸ | 1.2 × 10⁻³⁸ | 0.008 | 2–3 | The training default on TPUs and A100-or-newer GPUs |
| **FP8 E4M3** | 1 · 4 · 3 | 448 | 0.016 | 0.125 | about 1 | Weights and activations in FP8 training and serving |
| **FP8 E5M2** | 1 · 5 · 2 | 57,344 | 6.1 × 10⁻⁵ | 0.25 | about 1 | Gradients (range matters more than precision) |
| **FP4 E2M1** | 1 · 2 · 1 | 6 | 1 | 0.5 | under 1 | Blackwell-class GPUs, always with block scales |

**Read the table as a trade.** BF16 ("brain floating point", created at Google Brain for TPUs) keeps FP32's 8 exponent bits, so it has FP32's range and almost never overflows — it just rounds more coarsely. FP16 spends those bits on precision instead, so it overflows above 65,504 and flushes tiny gradients to zero. That is why BF16 replaced FP16 for training.

**Block scaling — how 8-bit and 4-bit floats survive.** With 6 as the largest FP4 value, one scale for a whole tensor is not enough, so each small block of numbers gets its own scale: **MXFP4** (the OCP Microscaling standard, 2023) packs 32 FP4 values with one shared power-of-two scale; **NVFP4** (NVIDIA Blackwell, 2025) packs 16 values with an FP8 (E4M3) scale, plus one FP32 scale per tensor. OpenAI's gpt-oss models (August 2025) ship their MoE expert weights in MXFP4, which is how gpt-oss-120b fits on a single 80 GB GPU.

**Why fewer bits are faster.** Fewer bytes per number means less memory and bandwidth, and GPUs run low-precision matrix maths on dedicated tensor cores: an H100 peaks at about 989 dense TFLOPS in BF16/FP16 and 1,979 in FP8, against 67 in plain FP32 — [Ch 29 §24.5](#content/29_gpus_tpus_infrastructure).

**Problems that happen:**

| Problem | What goes wrong | Example |
|---------|----------------|---------|
| **Overflow** | Number too big, becomes `inf` | float64: $e^{710} = \infty$ (the limit is about $e^{709.8}$); FP16: 70,000 becomes `inf` |
| **Underflow** | Number too small, becomes 0 | float64: $e^{-1000} = 0$; FP16: a gradient of $10^{-8}$ becomes 0 |
| **Absorption** | A small number added to a big one vanishes | FP16: $1 + 0.0001 = 1$; FP32: $1 + 10^{-8} = 1$ |
| **Cancellation** | Subtracting nearly equal numbers leaves mostly rounding error | FP32: $1.0000001 - 1 = 1.19 \times 10^{-7}$ (true answer $10^{-7}$: 19% off) |
| **Representation** | Most decimals have no exact binary form | $0.1 + 0.2 = 0.30000000000000004 \neq 0.3$ |

The fixes: the log-sum-exp trick for overflow (§6.2), BF16 or loss scaling for underflow, FP32 master weights for absorption (§6.3), and comparing floats with a tolerance (`np.isclose`) instead of `==`.

</details>

**Run it yourself** — the table above computed from the bit layouts (numpy for FP32/FP16, a bit trick for BF16, every value enumerated for FP8/FP4), then five numbers rounded into each format:

```python
# Number formats: exponent bits buy range, mantissa bits buy precision (FP32, FP16, BF16, FP8, FP4)
import numpy as np

def to_bf16(x):                                       # BF16 = top 16 bits of an FP32, rounded to nearest even
    b = np.array([x], dtype=np.float32).view(np.uint32)
    b = (b + np.uint32(0x7FFF) + ((b >> np.uint32(16)) & np.uint32(1))) & np.uint32(0xFFFF0000)
    return float(b.view(np.float32)[0])

def grid(e, m, top_exp, top_mant):                    # every value >= 0 of a tiny float format
    bias = 2 ** (e - 1) - 1
    vals = [k / 2 ** m * 2.0 ** (1 - bias) for k in range(2 ** m)]        # zero and subnormals
    vals += [(1 + k / 2 ** m) * 2.0 ** (E - bias) for E in range(1, top_exp + 1)
             for k in range(2 ** m) if E < top_exp or k <= top_mant]
    return np.array(vals), 2.0 ** (1 - bias), 2.0 ** -m

def round_to(g, x):                                   # nearest grid value; saturate at the largest
    return float(np.sign(x) * g[np.argmin(np.abs(g - min(abs(x), g.max())))])

f32, f16 = np.finfo(np.float32), np.finfo(np.float16)
table = {"FP32": (float(f32.max), float(f32.tiny), float(f32.eps)),
         "FP16": (float(f16.max), float(f16.tiny), float(f16.eps)),
         "BF16": (float(np.array([0x7F7F0000], dtype=np.uint32).view(np.float32)[0]), 2.0 ** -126, 2.0 ** -7)}
small = {"FP8 E4M3": grid(4, 3, 15, 6), "FP8 E5M2": grid(5, 2, 30, 3), "FP4 E2M1": grid(2, 1, 3, 1)}
for name, (g, tiny, eps) in small.items():
    table[name] = (float(g.max()), tiny, eps)

print(f"{'format':<10}{'largest':>11}{'smallest normal':>17}{'gap after 1':>13}{'digits':>8}")
for name, (big, tiny, eps) in table.items():
    print(f"{name:<10}{(f'{big:,.0f}' if big < 1e6 else f'{big:.3g}'):>11}{tiny:>17.3g}{eps:>13.3g}{-np.log10(eps / 2):>8.1f}")
assert table["FP16"][0] == 65504 and table["FP8 E4M3"][0] == 448 and table["FP4 E2M1"][0] == 6

print("\nrounding x into each format (FP8/FP4 saturate at their largest value):")
print(f"{'x':>10}{'FP32':>15}{'FP16':>11}{'BF16':>13}{'E4M3':>8}{'E2M1':>6}")
with np.errstate(over="ignore"):
    for x in [3.14159265, 0.1, 1.0001, 70000.0, 1e-8]:
        print(f"{x:>10.6g}{float(np.float32(x)):>15.8g}{float(np.float16(x)):>11.6g}"
              f"{to_bf16(x):>13.6g}{round_to(small['FP8 E4M3'][0], x):>8.4g}{round_to(small['FP4 E2M1'][0], x):>6.3g}")

print(f"\n0.1 + 0.2 == 0.3 in float64? {0.1 + 0.2 == 0.3}  (0.1 + 0.2 = {0.1 + 0.2!r})")
print(f"FP32: (1 + 1e-8) - 1 = {float(np.float32(1) + np.float32(1e-8) - np.float32(1))}   "
      f"1.0000001 - 1 = {float(np.float32(1.0000001) - np.float32(1)):.4g} (true 1e-07)")
```

**Output:**

```
format        largest  smallest normal  gap after 1  digits
FP32          3.4e+38         1.18e-38     1.19e-07     7.2
FP16           65,504          6.1e-05     0.000977     3.3
BF16         3.39e+38         1.18e-38      0.00781     2.4
FP8 E4M3          448           0.0156        0.125     1.2
FP8 E5M2       57,344          6.1e-05         0.25     0.9
FP4 E2M1            6                1          0.5     0.6

rounding x into each format (FP8/FP4 saturate at their largest value):
         x           FP32       FP16         BF16    E4M3  E2M1
   3.14159      3.1415927    3.14062      3.14062    3.25     3
       0.1            0.1  0.0999756     0.100098  0.1016     0
    1.0001         1.0001          1            1       1     1
     70000          70000        inf        70144     448     6
     1e-08  9.9999999e-09          0  1.00117e-08       0     0

0.1 + 0.2 == 0.3 in float64? False  (0.1 + 0.2 = 0.30000000000000004)
FP32: (1 + 1e-8) - 1 = 0.0   1.0000001 - 1 = 1.192e-07 (true 1e-07)
```

<details>
<summary><strong>Read as text</strong> — continued: reading the rounding rows</summary>

Read the rounding rows: FP16 turns 70,000 into `inf` and $10^{-8}$ into 0, while BF16 keeps both (70,144 and $1.001 \times 10^{-8}$) — range. But both 16-bit formats round 1.0001 back to 1 — precision. FP8 E4M3 saturates 70,000 at 448 and FP4 can only say 3 for π.

</details>

---

## 6.2 The Log-Sum-Exp Trick

![Infographic on the log-sum-exp trick and softmax temperature: the formula LSE(x) = log of the sum of e to the x_i = m + log of the sum of e to the (x_i minus m), with m = max(x) and each symbol labelled; the naive softmax of (1000, 1001, 1002) overflowing because float64 stops near e to the 709.8, drawn on a to-scale exponent line; the stable version step by step: subtract 1002 to get (-2, -1, 0), sum 1.5032, LSE = 1002.4076, softmax 0.090, 0.245, 0.665 as to-scale bars; temperature on scores (2, 1, 0): T = 0.5 gives 0.867, 0.117, 0.016 (0.636 bits), T = 1 gives 0.665, 0.245, 0.090 (1.201 bits), T = 2 gives 0.506, 0.307, 0.186 (1.472 bits), T to infinity uniform 1.585 bits; where ML uses it (log-softmax, cross-entropy from logits, FlashAttention online softmax, LLM sampling, distillation); the trap that T never changes the ranking, so greedy decoding ignores it.](diagrams/math06_info_log_sum_exp_temperature_ai.png)

<details>
<summary><strong>Read as text</strong> — the overflow, the trick, why it is exact and where LSE shows up</summary>

**Simple Explanation:**
Softmax involves computing $e^{\text{big number}}$, which can overflow to infinity. The trick: subtract the biggest number first. The math gives the SAME answer, but now you're computing $e^{\text{small number}}$, which is safe.

It's like measuring mountain heights. Instead of measuring from sea level (huge numbers), you measure how much shorter each mountain is compared to the tallest one (small numbers). Same differences, safer math!

> **Maths in one line:** `LSE(x) = log Σ e^(xᵢ) = m + log Σ e^(xᵢ − m)`, with `m = max(x)` — pull the biggest term out first, so every exponent is ≤ 0: nothing overflows, and the largest term is exactly e⁰ = 1, so the sum can't underflow to 0 either.

**Problem:**

$$\text{softmax}([1000,\ 1001,\ 1002]) \quad \Rightarrow \quad e^{1000} = \infty \quad \text{Broken!}$$

**The Trick:** Subtract the max (1002) first:

$$\text{softmax}([1000{-}1002,\ 1001{-}1002,\ 1002{-}1002]) = \text{softmax}([-2,\ -1,\ 0]) = [0.090,\ 0.245,\ 0.665]$$

**Why it is exact:** $e^{x_i - m} = e^{x_i} \cdot e^{-m}$, and the $e^{-m}$ appears in every term of the top and the bottom of softmax, so it cancels.

**Where log-sum-exp shows up directly:**

- **Log-softmax:** $\log \text{softmax}(x)_i = x_i - \text{LSE}(x)$ — one stable step, never $\log 0$.
- **Cross-entropy from logits:** $L = \text{LSE}(z) - z_{\text{true}}$. That is why PyTorch's `cross_entropy` takes raw logits, not probabilities — [Ch 16 §1.4](#content/16_deep_learning).
- **Adding probabilities kept as logs:** $\log(e^a + e^b) = \text{LSE}([a, b])$, used when summing over many sequences or mixture components.
- **Chunk by chunk:** $\text{LSE}(\text{all}) = \text{LSE}([\text{LSE}(\text{chunk}_1), \text{LSE}(\text{chunk}_2)])$. Keeping a running max and sum this way is the *online softmax* that lets FlashAttention compute exact attention tile by tile — [Ch 17 §2.4](#content/17_llm).

Mathematically identical. Numerically stable. Used in every softmax, every LLM output, every attention score.

If you see NaN in your model, check this first!

```chart
{
  "type": "bar",
  "data": {
    "labels": ["cat", "dog", "bird", "fish", "car"],
    "datasets": [
      {
        "label": "Raw logits (before softmax)",
        "data": [2.0, 1.0, 0.5, -1.0, -2.0],
        "backgroundColor": "rgba(200, 200, 200, 0.6)",
        "borderColor": "rgba(160, 160, 160, 1)",
        "borderWidth": 1
      },
      {
        "label": "After softmax (probabilities)",
        "data": [0.603, 0.222, 0.134, 0.030, 0.011],
        "backgroundColor": "rgba(99, 102, 241, 0.7)",
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Softmax — Turns Raw Scores into Probabilities that Sum to 1" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Value" } }
    }
  }
}
```

</details>

**Run it yourself** — naive vs stable log-sum-exp on normal, huge and very negative inputs, the chart's softmax and loss, and merging two chunks:

```python
# Log-sum-exp: the naive formula overflows (or underflows); subtracting the max fixes both
import numpy as np

def lse_naive(x):
    return float(np.log(np.sum(np.exp(x))))

def lse(x):                                           # LSE(x) = m + log(sum(exp(x - m))), m = max(x)
    x = np.asarray(x, dtype=float)
    m = x.max()
    return float(m + np.log(np.sum(np.exp(x - m))))

def softmax(x):                                       # e^(x_i - LSE(x)) = e^(x_i) / sum_j e^(x_j)
    return np.exp(np.asarray(x, dtype=float) - lse(x))

with np.errstate(over="ignore", divide="ignore"):
    for x in ([1.0, 2.0, 3.0], [1000.0, 1001.0, 1002.0], [-1000.0, -1001.0, -1002.0]):
        print(f"x = {x}:  naive LSE = {lse_naive(x):.4f}   stable LSE = {lse(x):.4f}")

x = [1000.0, 1001.0, 1002.0]
print("softmax([1000, 1001, 1002]) =", np.round(softmax(x), 3).tolist())
assert np.allclose(softmax(x), softmax([-2.0, -1.0, 0.0]))   # shifting every input changes nothing

logits = np.array([2.0, 1.0, 0.5, -1.0, -2.0])        # the chart: cat, dog, bird, fish, car
print("softmax(chart logits)       =", np.round(softmax(logits), 3).tolist())
print(f"loss if 'cat' is true = LSE - z_cat = {lse(logits) - logits[0]:.4f} nats"
      f"  (= -ln {softmax(logits)[0]:.4f})")

# Two chunks at a time (the idea behind FlashAttention's online softmax): LSE of the chunks' LSEs
merged = lse([lse(logits[:2]), lse(logits[2:])])
print(f"LSE of all five = {lse(logits):.4f}   merged from two chunks = {merged:.4f}")
assert np.isclose(merged, lse(logits))
```

**Output:**

```
x = [1.0, 2.0, 3.0]:  naive LSE = 3.4076   stable LSE = 3.4076
x = [1000.0, 1001.0, 1002.0]:  naive LSE = inf   stable LSE = 1002.4076
x = [-1000.0, -1001.0, -1002.0]:  naive LSE = -inf   stable LSE = -999.5924
softmax([1000, 1001, 1002]) = [0.09, 0.245, 0.665]
softmax(chart logits)       = [0.603, 0.222, 0.134, 0.03, 0.011]
loss if 'cat' is true = LSE - z_cat = 0.5063 nats  (= -ln 0.6027)
LSE of all five = 2.5063   merged from two chunks = 2.5063
```

### Softmax with Temperature

<details>
<summary><strong>Read as text</strong> — the confidence dial, the temperature table and where T shows up</summary>

**Simple Explanation:**
Temperature is a "confidence dial" for softmax. Divide every score by a number $T$ before softmax. $T < 1$ makes the winner win bigger (sharper, more predictable); $T > 1$ evens things out (flatter, more surprising).

> **Maths in one line:** `pᵢ = e^(zᵢ / T) / Σⱼ e^(zⱼ / T)` — dividing by `T` multiplies every gap between scores by `1/T`: low `T` → sharper, lower entropy; high `T` → flatter, higher entropy; `T = 1` is the model as trained.

**With numbers** — three scores $z = [2, 1, 0]$ (the same example as [Ch 17 §2.6](#content/17_llm)):

| Token | Score $z$ | $T = 0.5$ (sharper) | $T = 1$ (as trained) | $T = 2$ (flatter) |
|---|---|---|---|---|
| A | 2 | 0.867 | 0.665 | 0.506 |
| B | 1 | 0.117 | 0.245 | 0.307 |
| C | 0 | 0.016 | 0.090 | 0.186 |
| **Entropy** (§5.1) | | 0.636 bits | 1.201 bits | 1.472 bits |

The ranking never changes — only how lopsided the probabilities are. As $T \to 0$ all the probability goes to the top score (argmax, "greedy"); as $T \to \infty$ every option gets the same share, and the entropy rises to its maximum $\log_2 3 = 1.585$ bits.

**Where $T$ shows up:**

| Where | What the temperature does |
|---|---|
| **LLM sampling** | Trades predictability for variety — the decoding maths (with top-k and top-p) is in [Ch 17 §2.6](#content/17_llm); which value for which task in [Ch 17b §8.1](#content/17b_llm_applications) |
| **Knowledge distillation** | A high $T$ softens the teacher's probabilities so the student also learns which wrong answers are "almost right" (Hinton et al., 2015) — [Ch 29 §24.9](#content/29_gpus_tpus_infrastructure) |
| **Calibration** | *Temperature scaling* fits one $T$ on held-out data to fix an over-confident network (Guo et al., 2017) — [Ch 13 §13.12](#content/13_model_evaluation) |
| **Attention** | Dividing by $\sqrt{d_k}$ in $\text{softmax}(QK^T / \sqrt{d_k})$ acts as a fixed temperature (§1.7) |

</details>

**Run it yourself** — the table above plus two extremes, with the entropy at each temperature:

```python
# Softmax with temperature: divide the scores by T, then softmax -- and watch the entropy move
import numpy as np

def softmax_T(z, T):
    z = np.asarray(z, dtype=float) / T
    e = np.exp(z - z.max())                           # max-subtraction, as in the log-sum-exp trick
    return e / e.sum()

def entropy_bits(p):
    p = p[p > 0]
    return float(-(p * np.log2(p)).sum())

z = [2.0, 1.0, 0.0]                                   # scores for tokens A, B, C (same as Ch 17 §2.6)
temps = [0.1, 0.5, 1.0, 2.0, 10.0]
ps = [softmax_T(z, T) for T in temps]
for T, p in zip(temps, ps):
    h = entropy_bits(p)
    print(f"T = {T:<4}  p = {np.round(p, 3).tolist()}  entropy {h:.3f} bits  (~{2 ** h:.2f} choices)")
print(f"upper limit for 3 tokens: log2(3) = {np.log2(3):.3f} bits, reached as T -> infinity")

assert all(int(np.argmax(p)) == 0 for p in ps)        # the ranking never changes
assert all(entropy_bits(a) < entropy_bits(b) for a, b in zip(ps, ps[1:]))   # higher T, more entropy
```

**Output:**

```
T = 0.1   p = [1.0, 0.0, 0.0]  entropy 0.001 bits  (~1.00 choices)
T = 0.5   p = [0.867, 0.117, 0.016]  entropy 0.636 bits  (~1.55 choices)
T = 1.0   p = [0.665, 0.245, 0.09]  entropy 1.201 bits  (~2.30 choices)
T = 2.0   p = [0.506, 0.307, 0.186]  entropy 1.472 bits  (~2.77 choices)
T = 10.0  p = [0.367, 0.332, 0.301]  entropy 1.580 bits  (~2.99 choices)
upper limit for 3 tokens: log2(3) = 1.585 bits, reached as T -> infinity
```

---

## 6.3 Mixed Precision Training

![Infographic on mixed precision training: the rule stored(w + delta w) = w when the update is below half the gap, with each symbol labelled; step by step, the FP16 gap after 1 is 2 to the -10 = 0.000977, half gap 0.000488, so 1 + 0.0001 = 1 in FP16 but 1.0001 in FP32, drawn on a to-scale number line between 1.000 and 1.000977; the training loop: FP32 master weights cast to BF16 for the forward and backward pass, loss in FP32, update with FP32 Adam, and FP16-only loss scaling by 65,536; a to-scale stacked bar of 2 + 2 + 4 + 4 + 4 = 16 bytes per parameter; a table of FP32, BF16, FP16, FP8 E4M3 (DeepSeek-V3, Dec 2024) and NVFP4 (12B model on 10T tokens), as of Nov 2026; the trap that mixed precision does not halve optimizer memory.](diagrams/math06_info_mixed_precision_ai.png)

<details>
<summary><strong>Read as text</strong> — the vanishing update, the four-step recipe, memory and FP8/FP4</summary>

**Simple Explanation:**
Use cheap, fast math (16-bit) for most of the work, but keep a precise backup (32-bit) for the important stuff. Like doing rough calculations on a whiteboard (fast!) but keeping the final answer in a precise calculator.

> **Maths in one line:** `stored(w + Δw) = w` whenever `|Δw|` is below half the gap between neighbouring numbers — near 1 that gap is 0.000977 in FP16 and 0.0078 in BF16, so a typical update of 0.0001 vanishes; in FP32 (gap 1.2 × 10⁻⁷) it survives. That is why the master weights stay in FP32.

1. Keep master weights in FP32 (precise backup)
2. Cast them to BF16 (or FP16) for the forward and backward pass — the matrix multiplies run fast on tensor cores, while softmax, normalisation and the loss stay in FP32
3. FP16 only: multiply the loss by a big scale (for example 65,536) so tiny gradients don't underflow, then divide the gradients by the same scale — **loss scaling**. BF16 has FP32's range and skips this step
4. Update the FP32 master copy (and Adam's FP32 moments) with the gradients

Result: close to 16-bit speed with FP32-level accuracy. BF16 mixed precision is the standard recipe for training LLMs.

**What it saves — and what it doesn't.** Activations (often the biggest memory item) halve and the matrix maths runs several times faster. Weights plus Adam state do NOT shrink: still about 16 bytes per parameter (2-byte BF16 weight + 2-byte gradient + 4-byte FP32 master + 4 + 4 for Adam's two moments).

**FP8 and FP4 (2024–2026).** FP8 training is now widely used. DeepSeek-V3 (December 2024) trained mostly in FP8 E4M3 on Hopper GPUs, giving small blocks of each tensor their own scale and keeping sensitive parts (embeddings, output head, normalisation, attention, MoE gating) in higher precision. NVIDIA's NVFP4 recipe (September 2025) trained a 12-billion-parameter model on 10 trillion tokens in 4-bit with loss and accuracy close to an FP8 baseline. The full recipes, loss-scaling code and the interview trap are in [Ch 16 §1.7](#content/16_deep_learning); hardware rates per format in [Ch 29 §24.5](#content/29_gpus_tpus_infrastructure).

</details>

---

# PART 7: QUICK REFERENCE — ALL FORMULAS

---

### Linear Algebra

| Concept | Formula | What It Means | ML Use |
|---------|---------|---------------|--------|
| Dot product | $\vec{a} \cdot \vec{b} = \sum a_i b_i$ | Multiply matching pairs, add up | Neurons, attention |
| Cosine similarity | $\frac{\vec{a} \cdot \vec{b}}{\lVert a \rVert \lVert b \rVert}$ | How similar is the direction? (for unit vectors = the dot product) | Embeddings, search |
| L1 norm | $\sum \lvert v_i \rvert$ | Add up absolute values | Lasso regularization |
| L2 norm | $\sqrt{\sum v_i^2}$ | Straight-line distance | Ridge, distance |
| Matrix multiply | $C_{ij} = \sum A_{ik} B_{kj}$ | Dot product of row i, col j | Every neural layer |
| Eigenvalue | $A\vec{v} = \lambda\vec{v}$ | Matrix just stretches this vector | PCA, PageRank |
| SVD | $A = U \Sigma V^T$ | Any matrix = rotate, stretch, rotate; top-$k$ = best rank-$k$ copy | Compression; the low-rank idea behind LoRA |
| PCA | $C = \frac{1}{n-1} X_c^{\top} X_c$, keep the top eigenvectors | Directions of greatest spread; $\lambda_k / \sum \lambda$ = share of variance kept | Dim reduction, visualisation |
| Attention | $\text{softmax}(QK^T/\sqrt{d_k})V$ | Weighted value aggregation | Transformers |
| Multi-head | $\text{Concat}(\text{head}_i)W^O$ | Parallel specialised attention | GPT, BERT, Gemini |

### Calculus

| Concept | Formula | What It Means | ML Use |
|---------|---------|---------------|--------|
| Power rule | $(x^n)' = nx^{n-1}$ | Bring power down, reduce by 1 | Gradient computation |
| Central difference | $f'(x) \approx \frac{f(x+h) - f(x-h)}{2h}$ | Nudge both ways, measure the slope | Gradient checking |
| Chain rule | $(f(g))' = f'(g) \cdot g'$ | Multiply effects along the chain | Backpropagation |
| Vector–Jacobian product | $\bar{x} = \bar{y}^{\top} J$, with $J = \frac{\partial y}{\partial x}$ | Pull the gradient back through one step without ever building $J$ (reverse mode) | What every backward pass computes |
| Gradient | $\nabla f = [\frac{\partial f}{\partial x_1}, \frac{\partial f}{\partial x_2}, \ldots]$ | Direction of steepest climb | Gradient descent |
| Linear-layer gradients | $Y = XW^{\top} + b,\ G = \frac{\partial L}{\partial Y}$: $\frac{\partial L}{\partial W} = G^{\top}X$, $\frac{\partial L}{\partial X} = GW$, $\frac{\partial L}{\partial b} = \sum_{\text{rows}} G$ | Each gradient has the shape of what it belongs to (with $W$ stored inputs × outputs, $Y = XW + b$: $X^{\top}G$ and $GW^{\top}$) | Backprop by hand |
| Hessian | $H_{ij} = \frac{\partial^2 f}{\partial x_i \, \partial x_j}$ | Curvature; at a flat point eigenvalues all + = minimum, all − = maximum, mixed = saddle | Newton's method, saddle points |
| Gradient descent | $\theta = \theta - \text{lr} \cdot \nabla f$ | Take a step downhill | ALL model training |

### Probability & Statistics

| Concept | Formula | What It Means | ML Use |
|---------|---------|---------------|--------|
| Conditional probability | $P(B \mid A) = \frac{P(A \cap B)}{P(A)}$ | Keep only the cases where A happened | Every "given the context" model |
| Law of total probability | $P(B) = \sum_i P(B \mid A_i) \, P(A_i)$ | Add up every route to B | Bayes' denominator, mixtures |
| Bayes' theorem | $P(A \mid B) = \frac{P(B \mid A) \, P(A)}{P(B)}$ | Update belief with evidence | Naive Bayes, spam filters, diagnosis |
| Expected value | $E[X] = \sum x_i P(x_i)$ | Weighted average of outcomes | Loss, reward |
| Variance | $\text{Var}(X) = E[(X-\mu)^2]$ | How spread out are the values? | LayerNorm, stability |
| Correlation | $r = \frac{\text{Cov}(X, Y)}{\sigma_X \sigma_Y}$ | Strength of a LINEAR relationship, −1 to 1 | Feature analysis; $r = 0$ is not independence |
| Gaussian | $\frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$ | Bell curve density | Init, noise, VAE |
| z-score | $z = (x - \mu) / \sigma$ | How many standard deviations from the mean | Standardising features, tests |
| CLT | $\bar{X} \approx \mathcal{N}(\mu, \sigma^2 / n)$ | Averages are bell-shaped; their spread shrinks like $1/\sqrt{n}$ | Confidence intervals, A/B tests |
| Two-proportion z-test | $z = \frac{\hat{p}_1 - \hat{p}_2}{\sqrt{\hat{p}(1-\hat{p})(1/n_1 + 1/n_2)}}$ | How many standard errors apart are two accuracies? | A/B tests, model comparison |
| MLE | $\theta^{*} = \operatorname{argmax} \sum \log P(x_i \mid \theta)$ | Best settings for observed data | Pre-training |
| Bias–variance | $E[(y-\hat{f})^2] = \text{Bias}^2 + \text{Var} + \sigma^2$ | Error decomposition | Under/overfitting |

### Information Theory

| Concept | Formula | What It Means | ML Use |
|---------|---------|---------------|--------|
| Entropy | $H(P) = -\sum P \log P$ | How uncertain / surprising? | Decision trees, semantic entropy |
| Cross-entropy | $H(P,Q) = -\sum P \log Q$ | How wrong are predictions? | THE training loss |
| Perplexity | $e^{H(P,Q)}$ with $H$ in nats | Effective number of choices | Language-model evaluation |
| KL divergence | $D_{KL}(P \Vert Q) = \sum P \log \frac{P}{Q}$ | Extra surprise from using Q for P; not symmetric | RLHF/DPO leash, distillation, VAEs |
| The link | $H(P,Q) = H(P) + D_{KL}(P \Vert Q)$ | Minimising cross-entropy = minimising KL | Why training matches the data |

### Optimization

| Concept | Formula | What It Means | ML Use |
|---------|---------|---------------|--------|
| Stable step size | $\text{lr} < 2/h$ ($h$ = curvature of the bowl) | A bigger step overshoots and diverges | Choosing a learning rate |
| Momentum | $v_t = \beta v_{t-1} + (1-\beta)\nabla L,\ \theta = \theta - \text{lr} \cdot v_t$ | Step along a running average of gradients | SGD + momentum |
| Adam | $\theta = \theta - \text{lr} \cdot \frac{\hat{m}}{\sqrt{\hat{v}} + \epsilon}$ | Adaptive moment estimation | Base optimizer |
| AdamW | $\theta = \theta - \text{lr} \cdot \frac{\hat{m}}{\sqrt{\hat{v}}+\epsilon} - \text{lr}\cdot\lambda\cdot\theta$ | Decoupled weight decay | LLM/transformer training |
| Muon | $W = W - \text{lr} \cdot UV^{\top}$ for momentum $M = U \Sigma V^{\top}$ | Orthogonalise the update: every direction gets equal strength | Some frontier pre-training runs — [Ch 16 §1.2](#content/16_deep_learning) |
| L1 reg | $\text{Loss} + \lambda \sum \lvert w_i \rvert$ | Penalize for having any weight | Sparsity |
| L2 reg | $\text{Loss} + \lambda \sum w_i^2$ | Penalize for having big weights | Weight decay |
| BatchNorm | $\hat{x} = (x-\mu_B)/\sqrt{\sigma_B^2+\varepsilon}$, $y=\gamma\hat{x}+\beta$ | Normalise per feature across batch | CNNs |
| LayerNorm | Same formula, over features of each sample | Normalise per sample across features | Transformers |
| RMSNorm | $y = g \odot x / \sqrt{\frac{1}{d}\sum_j x_j^2 + \varepsilon}$ | LayerNorm without the mean subtraction; learned gain $g$ (often written $\gamma$) | Modern LLMs (Llama, Gemma, Mistral, Qwen, DeepSeek) |
| Dropout | $\tilde{a} = a \cdot m / (1 - p)$, $m \sim \text{Bernoulli}(1 - p)$ | Randomly zero units, scale up the rest; same mean. Here $p$ is the DROP probability (PyTorch's `p`); written with a keep probability $q$, scale by $1/q$ | Regularization (training only) |
| Convexity | $f(tx + (1-t)y) \le t f(x) + (1-t) f(y)$ | The chord lies above the curve — one valley | Linear/logistic regression; deep nets are not convex |

### Activations & Numerics

| Concept | Formula | What It Means | ML Use |
|---------|---------|---------------|--------|
| Softmax | $\frac{e^{x_i}}{\sum e^{x_j}}$ | Turn numbers into probabilities | Output layer, attention |
| Softmax with temperature | $\frac{e^{z_i/T}}{\sum_j e^{z_j/T}}$ | Low T sharper, high T flatter | Sampling, distillation, calibration |
| Log-sum-exp | $\log \sum e^{x_i} = m + \log \sum e^{x_i - m}$, $m = \max x$ | Pull out the max before exp | Stable softmax and cross-entropy |
| Sigmoid | $\frac{1}{1 + e^{-x}}$ | Squash any number to 0-1 | Binary classification |
| ReLU | $\max(0, x)$ | Keep positives, zero out negatives | Hidden layers |
| Floating point | $(-1)^s \times 1.m \times 2^{e - \text{bias}}$ | Exponent bits = range, mantissa bits = precision | FP32, BF16, FP16, FP8, FP4 |

---

## Key Takeaways

```
╔════════════════════════════════════════════════════════════════════╗
║  MATH FOUNDATIONS FOR ML — WHAT TO REMEMBER                        ║
╠════════════════════════════════════════════════════════════════════╣
║  LINEAR ALGEBRA                                                    ║
║    • Dot product powers neurons & attention                        ║
║    • Cosine similarity compares direction (embeddings)             ║
║    • Unit vectors: cosine = dot product; |a−b|² = 2 − 2·cos        ║
║    • Top-k SVD = the best rank-k copy (Eckart–Young)               ║
║    • Matmul C[i,j]=sum A[i,k]B[k,j] — every layer                  ║
║    • Eigen/SVD = rotate-stretch; PCA; low-rank idea of LoRA        ║
║    • Attention = softmax(QK^T/√d_k)V                               ║
╠════════════════════════════════════════════════════════════════════╣
║  CALCULUS (HOW MODELS LEARN)                                       ║
║    • Gradient = direction of steepest ascent                       ║
║    • Chain rule is the engine of backpropagation                   ║
║    • Backprop = reverse mode: cache forward, VJPs backward         ║
║    • Check gradients: (f(x+h) − f(x−h))/2h, error shrinks like h²  ║
║    • Linear layer: dW = G^T X, db = Σrows G, dX = G W (same shapes)║
║    • Flat point: Hessian eigenvalues all + = min, mixed = saddle   ║
╠════════════════════════════════════════════════════════════════════╣
║  PROBABILITY & STATISTICS                                          ║
║    • Know Bernoulli/Binomial/Gaussian/Poisson/Categorical          ║
║    • P(B|A) = P(A∩B)/P(A) — and P(B|A) ≠ P(A|B)                    ║
║    • Total probability P(B) = Σ P(B|Ai)·P(Ai) = Bayes' denominator ║
║    • E[X], variance, covariance/correlation                        ║
║    • Bayes updates beliefs with evidence                           ║
║    • CLT → normality; MLE = fit by max log-likelihood              ║
║    • An average's error is σ/√N: 91% on 1,000 is ± 1.8 points      ║
║    • 92.0% vs 93.5% on 1,000 each: p = 0.196 — not significant     ║
║    • Error = Bias^2 + Variance + irreducible noise                 ║
╠════════════════════════════════════════════════════════════════════╣
║  OPTIMIZATION                                                      ║
║    • GD: θ ← θ − lr·∇f; tune the learning rate                     ║
║    • Momentum smooths; Adam/AdamW = adaptive default               ║
║    • On a bowl of curvature h, gradient descent needs lr < 2/h     ║
║    • Adam's uncorrected 1st step is ~3× too LARGE; corrected = lr  ║
║    • Regularize (L1 sparse, L2 decay, dropout) vs overfit          ║
║    • L1 soft-thresholds to exact zeros; L2 only shrinks (÷ 1+2λ)   ║
║    • L2 = Gaussian prior (MAP); L1 = Laplace prior                 ║
║    • Dropout ã = a·m/(1−p): same mean, the noise regularizes       ║
║    • High-dim critical points are mostly saddles, not bad minima   ║
║    • Norms stabilize training; LLMs use RMSNorm (no mean)          ║
╠════════════════════════════════════════════════════════════════════╣
║  INFO THEORY & NUMERICS                                            ║
║    • Entropy = uncertainty; cross-entropy = THE loss               ║
║    • Perplexity = e^(loss in nats) = effective # of choices        ║
║    • Cross-entropy = entropy + KL; KL is NOT symmetric             ║
║    • Forward KL covers every mode; reverse KL picks one            ║
║    • Temperature: softmax(z/T) — low T sharp, high T flat          ║
║    • Log-sum-exp: subtract the max before exp (no NaN)             ║
║    • Exponent bits = range, mantissa bits = precision              ║
║    • BF16 = FP32 range; FP16 needs loss scaling                    ║
║    • Mixed precision: 16-bit maths, FP32 master weights            ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Review Questions

**1.** Two embedding vectors have length 1 and cosine similarity 0.8. What are their dot product and their squared Euclidean distance?

<details>
<summary>Answer</summary>

Dot product = 0.8 (for unit vectors cosine and dot product are the same number), and $\lVert a - b \rVert^2 = 2 - 2(0.8) = 0.4$ — so ranking neighbours by any of the three gives the same order (§1.2).
</details>

**2.** $A = [[1, 2, 3], [4, 5, 6]]$ has singular values 9.508 and 0.773. What is the error of the best rank-1 copy, and what share of the energy does it keep?

<details>
<summary>Answer</summary>

The error is the dropped singular value, $\sigma_2 = 0.773$ (Eckart–Young). The share kept is $\sigma_1^2 / (\sigma_1^2 + \sigma_2^2) = 90.40 / 91.0 \approx 99.3\%$ (§1.5).
</details>

**3.** In 3-token attention with $d_k = 4$, token 0's raw scores are $[2, 1, 1]$. Give its weights with and without the $\sqrt{d_k}$ scaling.

<details>
<summary>Answer</summary>

Scaled: $[1, 0.5, 0.5] \rightarrow [0.452, 0.274, 0.274]$. Unscaled: $[0.576, 0.212, 0.212]$ — peakier, which is why the scores are divided by $\sqrt{d_k}$ (a fixed temperature, §6.2) before the softmax (§1.7).
</details>

**4.** For $f(x) = x^2$ at $x = 3$ with $h = 0.1$, what do the one-sided and central differences give, and why?

<details>
<summary>Answer</summary>

One-sided: $(9.61 - 9)/0.1 = 6.1$ — off by exactly $h$. Central: $(9.61 - 8.41)/0.2 = 6.0$ — exact, because the central difference is exact for any parabola (its error shrinks like $h^2$, the one-sided one only like $h$). Use the central difference for gradient checks (§2.1).
</details>

**5.** A batch $X$ is (32, 10) and a layer outputs 8 features ($W$ is (8, 10)). What are the shapes of $\partial L/\partial W$, $\partial L/\partial b$ and $\partial L/\partial X$, and which products give them?

<details>
<summary>Answer</summary>

$\partial L/\partial W = G^{\top}X$: (8, 32) @ (32, 10) = (8, 10). $\partial L/\partial b$ = $G$ summed over the rows: (8,). $\partial L/\partial X = GW$: (32, 8) @ (8, 10) = (32, 10). Every gradient has the shape of the thing it belongs to (§2.6).
</details>

**6.** Two labellers: Asha does 60% of the labels with a 2% error rate, Ravi 40% with 5%. What fraction of labels is wrong, and what fraction of the wrong labels are Ravi's?

<details>
<summary>Answer</summary>

Law of total probability: $0.6 \times 0.02 + 0.4 \times 0.05 = 0.012 + 0.020 = 0.032$ (3.2%). Ravi's share of the errors is $0.020 / 0.032 = 62.5\%$ — Bayes' theorem, with the law of total probability as the denominator (§3.1b).
</details>

**7.** A model's true accuracy is 90%. On a 1,000-image test it scores 91.2%. Is that evidence it is better than 90%?

<details>
<summary>Answer</summary>

No. The number correct is Binomial(1,000, 0.9): mean 900, standard deviation $\sqrt{1000 \times 0.9 \times 0.1} \approx 9.5$. A score of 912 is only 1.26 standard deviations above the mean, and $P(\ge 912) \approx 11\%$ (§3.2).
</details>

**8.** Two models score 92.0% and 93.5% on separate random samples of 1,000. Is the difference significant at $\alpha = 0.05$?

<details>
<summary>Answer</summary>

No. Pooled $\hat p = 0.9275$, standard error 0.0116, $z = 1.29$, two-sided p-value 0.196; the 95% interval for the gap (−0.8 to +3.8 points) includes 0 (§3.7).
</details>

**9.** Why can the shrunk estimate $\hat f = 0.833 \times$ mean beat the unbiased mean?

<details>
<summary>Answer</summary>

Shrinking adds a little bias but removes more variance: with $\sigma^2 = 1$ and $n = 5$, bias² rises from 0 to 0.028 while the variance falls from 0.200 to 0.139, so the test error drops from 1.200 to 1.167 (§3.8).
</details>

**10.** With $\beta = 0.9$, what velocity does momentum reach for a steady gradient of 1, and for one that flips sign every step?

<details>
<summary>Answer</summary>

A steady gradient drives the velocity to 1.0 (0.958 after 30 steps). A gradient flipping $+1, -1, \dots$ leaves only about $\pm 0.05$ — $(1 - \beta)/(1 + \beta) = 5\%$ of the zigzag survives (§4.3).
</details>

**11.** Is Adam's uncorrected first update too small or too large?

<details>
<summary>Answer</summary>

Too large. At $t = 1$, $m$ is 10× too small but $v$ is 1,000× too small, and $v$ sits under a square root, so $m/\sqrt{v}$ is $0.1/\sqrt{0.001} = 3.16$× the corrected value; bias correction makes the first step exactly lr (§4.4).
</details>

**12.** With $\lambda = 0.1$ and unregularised weights $\hat w = [0.5, 0.01, -0.8]$, what do L1 and L2 return?

<details>
<summary>Answer</summary>

L1 soft-thresholds (subtract $\lambda$, stop at 0): $[0.4, 0, -0.7]$ — an exact zero. L2 divides by $1 + 2\lambda = 1.2$: $[0.417, 0.008, -0.667]$ — everything shrinks, nothing reaches 0 (§4.5).
</details>

**13.** In the Bayesian view of L2, halving the prior's standard deviation $\tau$ does what to $\lambda$?

<details>
<summary>Answer</summary>

Multiplies it by 4, because $\lambda = \sigma^2/\tau^2$: a tighter prior means a stronger pull toward zero (§4.5).
</details>

**14.** Inverted dropout with $a = 0.9$ and $p = 0.5$: what values can $\tilde a$ take, and what are its mean and standard deviation?

<details>
<summary>Answer</summary>

$\tilde a = a \cdot m/(1-p)$ is 1.8 (kept) or 0 (dropped), each with probability 0.5. Mean 0.9 — the same as $a$, so inference needs no rescaling — and standard deviation 0.9 (§4.5).
</details>

**15.** Why are bad local minima less of a worry than saddle points in large networks?

<details>
<summary>Answer</summary>

A minimum needs every one of the $n$ curvatures (Hessian eigenvalues) to be positive, which becomes very unlikely as $n$ grows, so high-loss critical points are almost all saddles — and gradient descent with noise escapes saddles, only slowly (§4.6).
</details>

**16.** Apply RMSNorm (gain 1) to $[3.0, 1.5, 2.0]$.

<details>
<summary>Answer</summary>

RMS $= \sqrt{(9 + 2.25 + 4)/3} = 2.25$, so the output is $[1.33, 0.67, 0.89]$. Its mean is 0.96, not 0 — RMSNorm rescales but does not centre (§4.7).
</details>

**17.** A language model's average cross-entropy on a test set is 2.0 nats per token. What is its perplexity, what is the loss in bits, and what does the number mean?

<details>
<summary>Answer</summary>

Perplexity $= e^{2.0} = 7.39$. In bits the loss is $2.0 / \ln 2 = 2.885$ bits, and $2^{2.885} = 7.39$ — the same perplexity, as it must be. The model is as unsure as if it were choosing uniformly among about 7 tokens at each step. Compare it only with models evaluated on the same text with the same tokenizer (§5.2).
</details>

**18.** The truth has two peaks and your model can only make one bump. Which KL direction gives a model spread over both peaks, and which locks onto one? Why?

<details>
<summary>Answer</summary>

Minimising **forward** KL, $D_{KL}(P \Vert Q)$, spreads $Q$ over both peaks: wherever the truth has probability, a $Q$ near zero makes $\log(P/Q)$ explode, so $Q$ must cover everything (mode-covering — what cross-entropy training does). Minimising **reverse** KL, $D_{KL}(Q \Vert P)$, locks onto one peak: now it is $Q$ putting mass where $P$ is near zero that is punished, so $Q$ hides inside one peak (mode-seeking). In the §5.3 example forward KL prefers the spread (0.368 vs 0.703) and reverse KL the single peak (0.431 vs 0.511).
</details>

**19.** In an FP16 run an activation of 70,000 becomes `inf` and gradients around $10^{-8}$ become 0. Name the two problems and two fixes.

<details>
<summary>Answer</summary>

Overflow (FP16's largest value is 65,504) and underflow (its smallest normal number is about $6 \times 10^{-5}$, and even the subnormals stop near $6 \times 10^{-8}$). Fixes: switch to **BF16**, which has FP32's 8 exponent bits and so its range; or keep FP16 with **dynamic loss scaling** (multiply the loss, then divide the gradients) and run softmax, norms and the loss in FP32. Either way keep FP32 master weights, because a 0.0001 update to a weight of 1 rounds away in both 16-bit formats (§6.1, §6.3).
</details>

**20.** The logits are $[2, 1, 0]$. What happens to the top token's probability and to the entropy at $T = 0.5$ and at $T = 2$? Can temperature change which token is most likely?

<details>
<summary>Answer</summary>

At $T = 0.5$ the top token gets 0.867 and the entropy falls to 0.636 bits; at $T = 2$ it gets 0.506 and the entropy rises to 1.472 bits (1.201 bits at $T = 1$). Temperature never changes the ranking — dividing every score by the same positive $T$ keeps their order — so the most likely token stays the same and greedy decoding is unaffected (§6.2).
</details>

**21.** Compute $\log(e^{1000} + e^{1000})$ without overflowing.

<details>
<summary>Answer</summary>

Use log-sum-exp with $m = 1000$: $1000 + \log(e^{0} + e^{0}) = 1000 + \ln 2 = 1000.693$. The naive formula overflows at $e^{1000}$, because float64 tops out near $e^{709.8}$ (§6.2).
</details>

---

**Related:** The LLM view of these ideas — softmax, cross-entropy, perplexity and KL with runnable examples — is in [Ch 17 §1.4](#content/17_llm).

**Previous:** [Chapter 5B — Build a Sharper, Younger Brain](#content/05b_brain_upgrade_30_days) | **Next:** [Chapter 7 — Introduction to Machine Learning](#content/07_introduction)

**Back to Start:** [README — Table of Contents](#README)
