# Chapter 7 — Unsupervised Learning

---

## What You'll Learn

After reading this chapter, you will be able to:
- Explain what unsupervised learning is and how it differs from supervised learning
- Describe the Curse of Dimensionality and why it matters
- Compare K-Means, Hierarchical Clustering, DBSCAN, and GMM
- Choose K using the Elbow method and Silhouette score
- Explain PCA, t-SNE, and UMAP for dimensionality reduction
- Identify anomalies using Isolation Forest
- Understand self-supervised learning as a modern paradigm

---

## Chapter Map

```
  5.1  What is Unsupervised Learning?
  5.2  The Curse of Dimensionality        — why high-D is hard             ★
  5.3  Clustering Overview
  5.4  K-Means Clustering
  5.5  Hierarchical Clustering            — dendrograms, agglomerative      ★
  5.6  DBSCAN
  5.7  Gaussian Mixture Models            — soft/probabilistic clustering   ★
  5.8  Evaluating Clusters                — silhouette score, elbow method  ★
  5.9  Dimensionality Reduction Overview
  5.10 PCA
  5.11 t-SNE
  5.12 UMAP                               — modern alternative to t-SNE     ★
  5.13 Autoencoders                       — neural network compression       ★
  5.14 Anomaly Detection                  — Isolation Forest, methods        ★
  5.15 Association Rule Learning          — "people who buy X also buy Y"    ★
  5.16 Self-Supervised Learning           — the modern paradigm              ★
  5.17 Applications
```

---

## 5.1 What is Unsupervised Learning?

### Simple Explanation
Unsupervised learning is like being handed a box of random LEGO bricks with no
instructions — you organize them yourself. You might group by color, size, or shape.
Nobody told you the right grouping exists — **you discover structure on your own**.

```
  SUPERVISED                          UNSUPERVISED
  ────────────────────────────        ─────────────────────────────────
  Data + Labels                       Data ONLY
  Model learns to predict             Model discovers hidden structure
  known outputs                       on its own

  Like a student with                 Like a scientist exploring
  an answer key                       an unmapped territory

  Example tasks:                      Example tasks:
  - "Is this email spam?"             - "What types of customers do I have?"
  - "Will this patient survive?"      - "Are there natural groups in my data?"
```

**Official Definition:**
> **Unsupervised Learning** discovers patterns, structure, or representations in data
> without labeled responses. Goals include: finding clusters, learning a compact
> representation, generating new samples, or estimating the underlying data distribution.

---

## 5.2 The Curse of Dimensionality ★

### Simple Explanation
Imagine you're searching for a friend in a city. 1D = searching along one street (easy!).
2D = searching across an entire city grid (harder). 3D = searching every floor of every
building (much harder). With 100 features, you're searching in 100-dimensional space —
there's so much empty space that data points are impossibly far apart.

This is called the "curse of dimensionality" — adding more features makes every
ML algorithm's job exponentially harder.

### What Happens as Dimensions Increase?

```
  Think of filling a space with evenly spaced dots:

  1D (a line — 1 feature):
  ├──────────────────────────────────────────┤
  10 evenly spaced dots → covers the line nicely ✓

  2D (a square — 2 features):
  ┌──────────────────────────┐
  │  .  .  .  .  .  .  .  . │  Need 100 dots for the same coverage
  │  .  .  .  .  .  .  .  . │
  │  .  .  .  .  .  .  .  . │
  └──────────────────────────┘

  10D (10 features — impossible to draw):
  Need 10^10 = 10 BILLION dots for the same density!

  With 100 features:
  Need 10^100 = more atoms than exist in the observable universe!
```

### Why This Hurts ML

```
  PROBLEM 1: Distance loses meaning
  ─────────────────────────────────────────────────────────────
  In low dimensions:                In high dimensions (1000 features):
  Points that are "close"           ALL points are roughly the same
  are meaningfully similar          distance from each other!

  KNN breaks down because "nearest neighbor" becomes meaningless.

  PROBLEM 2: Data becomes extremely sparse
  ─────────────────────────────────────────────────────────────
  In 2D, 1000 points feel dense.
  In 100D, 1000 points are tiny isolated islands in a vast void.
  The model sees almost no examples "near" any new data point.

  PROBLEM 3: Model training needs exponentially more data
  ─────────────────────────────────────────────────────────────
  Roughly need at least 5 examples per dimension.
  10 features  → need 50 examples
  100 features → need 500 examples
  1000 features → need 5,000 examples
  10000 features → need 50,000 examples
```

### Solutions

```
  ┌────────────────────────────────────────────────────────────┐
  │  1. Feature Selection  — remove uninformative features     │
  │  2. PCA / UMAP         — compress to fewer dimensions      │
  │  3. Regularization     — penalize using many features      │
  │  4. More data          — fill the space better             │
  │  5. Domain knowledge   — engineer meaningful features      │
  └────────────────────────────────────────────────────────────┘
```

---

## 5.3 Clustering Overview

### What is Clustering?

```
  BEFORE:                                AFTER:
  ────────────────────────────           ─────────────────────────────────
  . * . * . . * .                        ●●●●● ■■■  ▲▲▲▲
  * . . * . *                            ●●●●● ■■■  ▲▲▲▲
  . . * * . * .      →                   ●●●   ■■■■ ▲▲
  . . * .   .                            ●●●   ■■■  ▲▲▲
  * . . . * * .                          ●●●   ■■■  ▲▲▲▲

  No labels known!                       Groups discovered automatically!
                                         ● = Customer segment A
                                         ■ = Customer segment B
                                         ▲ = Customer segment C
```

### Types of Clustering

```
  ┌────────────────────────────────────────────────────────────────────┐
  │  PARTITIONAL         K-Means, GMM                                  │
  │  Each point belongs to exactly one cluster.                        │
  │  Fast, works well for globular clusters.                           │
  ├────────────────────────────────────────────────────────────────────┤
  │  HIERARCHICAL        Agglomerative, Divisive                       │
  │  Builds a TREE of clusters at multiple scales.                    │
  │  No need to pre-specify K. Produces a dendrogram.                  │
  ├────────────────────────────────────────────────────────────────────┤
  │  DENSITY-BASED       DBSCAN, HDBSCAN                               │
  │  Finds arbitrarily shaped clusters. Identifies noise/outliers.    │
  ├────────────────────────────────────────────────────────────────────┤
  │  SOFT / PROBABILISTIC  GMM                                         │
  │  Each point has a PROBABILITY of belonging to each cluster.        │
  │  (rather than a hard assignment)                                   │
  └────────────────────────────────────────────────────────────────────┘
```

---

## 5.4 K-Means Clustering

### Simple Explanation
Place K flags on a field. Everyone runs to their nearest flag. Move flags to the center
of their group. Repeat until nobody moves.

### The Algorithm

```
  STEP 1: Initialize K centroids (randomly or K-means++)
  ┌──────────────────────────────────────────────────┐
  │  . . . .  ★₁                                     │
  │  . . .                                           │
  │  . . . .       ★₂                                │
  │  . . .  ★₃                                       │
  │  . . . . .                                       │
  └──────────────────────────────────────────────────┘

  STEP 2: Assign each point to nearest centroid
  ┌──────────────────────────────────────────────────┐
  │  ● ● ● ●  ★₁      ● = assigned to cluster 1     │
  │  ● ● ●             ■ = assigned to cluster 2     │
  │  ▲ ▲ ▲ ▲      ★₂  ▲ = assigned to cluster 3     │
  │  ■ ■ ■  ★₃                                       │
  │  ■ ■ ■ ■ ■                                       │
  └──────────────────────────────────────────────────┘

  STEP 3: Move each centroid to mean of its cluster
  ┌──────────────────────────────────────────────────┐
  │  ● ● ● ●                                         │
  │  ● ●★₁●   ← centroid moved to center of ●s       │
  │  ▲ ▲ ▲ ▲                                         │
  │  ■ ■ ■★₃  ← centroid moved to center of ■s       │
  │  ■ ■ ■ ■ ■                                       │
  │  ▲ ▲★₂▲   ← centroid moved to center of ▲s       │
  └──────────────────────────────────────────────────┘

  STEP 4: Repeat steps 2–3 until centroids stop moving
```

**Official Definition:**
> **K-Means** partitions n observations into K clusters by minimizing the within-cluster
> sum of squared distances (inertia). It alternates between assigning points to the
> nearest centroid and recomputing centroids as cluster means until convergence.

### Choosing K — Elbow Method

```
  Inertia = Σ (distance from each point to its centroid)²
  Lower inertia = tighter, better-defined clusters

  Inertia
     │
  20K│ ●
     │  ●
  15K│    ●
     │      ●
  10K│        ●
     │           ● ●
   5K│                 ● ● ● ● ←  adding more K gives little benefit
     └────────────────────────────── K
         1  2  3  4  5  6  7  8

              ↑ "elbow" at K=4 → choose K=4
```

### K-Means++ — Better Initialization

```
  Problem with random initialization: centroids may start close
  together → slow convergence or poor result.

  K-Means++ solution: spread initial centroids apart!

  Step 1: Choose first centroid randomly from data points
  Step 2: Choose next centroid with probability ∝ distance²
          from nearest existing centroid
          (far-away points are more likely to be chosen)
  Step 3: Repeat until K centroids chosen
  Step 4: Proceed normally

  Result: 2-10× faster convergence, consistently better clusters
  This is the default in scikit-learn.
```

**Strengths / Weaknesses:**
```
  ✓ Simple and fast (O(nKI) — n points, K clusters, I iterations)
  ✓ Scales to large datasets
  ✓ Works well when clusters are roughly globular, equal-sized
  ✗ Must specify K in advance
  ✗ Sensitive to outliers (outliers pull centroids)
  ✗ Assumes globular (circular/spherical) clusters
  ✗ Results vary with initialization (run multiple times!)
```

---

## 5.5 Hierarchical Clustering ★

### Simple Explanation
Instead of picking K upfront, hierarchical clustering builds a family tree of clusters.
You can cut the tree at any height to get any number of groups.

### Agglomerative (Bottom-Up) Clustering

```
  START: every point is its own cluster
  ─────────────────────────────────────
  Points: A  B  C  D  E

  Step 1: Merge the two CLOSEST points/clusters
          A  B merged (they were nearest) → [AB]
          [AB]  C  D  E

  Step 2: Merge next closest pair
          C  D merged → [CD]
          [AB]  [CD]  E

  Step 3: Merge next
          [AB] merges with [CD] → [ABCD]
          [ABCD]  E

  Step 4: Final merge
          [ABCD]  E → [ABCDE] (entire dataset)
```

### The Dendrogram — Reading the Tree

```
  HEIGHT
  (distance
  between     │           ┌─────────────────────────────┐
  merged      │           │ CUT HERE → 2 clusters        │
  clusters)   │     ┌─────┤                             ├──────┐
              │     │     └─────────────────────────────┘      │
            3 │  ┌──┴──┐                                    ┌──┴──┐
              │  │     │                                    │     │
            2 │ ┌┴┐  ┌─┴─┐                                ┌┴┐  ┌─┴─┐
              │ │ │  │   │                                │ │  │   │
            1 │ A B  C   D                                E F  G   H

              Choose where to CUT the dendrogram:
              ─────────────────────────────────────────────────
              Cut at height 4 → 2 clusters: {A,B,C,D} and {E,F,G,H}
              Cut at height 2 → 4 clusters: {A,B}, {C,D}, {E,F}, {G,H}
              Cut at height 1 → 8 clusters: each point alone

              The dendrogram lets you explore ALL possible K
              without re-running the algorithm!
```

**Official Definition:**
> **Agglomerative Hierarchical Clustering** starts with n singleton clusters and
> iteratively merges the two closest clusters until one cluster remains. The merge
> history forms a binary tree called a dendrogram.

### Linkage Criteria — How to Measure "Closest Clusters"

```
  When merging clusters, "distance between clusters" is ambiguous.
  Different linkage methods give very different results:

  ┌────────────────┬──────────────────────────────────────────────────┐
  │ SINGLE LINKAGE │ Distance = closest pair of points                 │
  │                │ ● ─ ─ ─ ─ ─ ─ ─ ─ ●   ─ ─ ─ ─ ─ ─ ─ ○         │
  │                │ Tends to produce "chained" elongated clusters    │
  ├────────────────┼──────────────────────────────────────────────────┤
  │ COMPLETE       │ Distance = farthest pair of points               │
  │ LINKAGE        │ ● ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ○       │
  │                │ Tends to produce compact, equal-sized clusters   │
  ├────────────────┼──────────────────────────────────────────────────┤
  │ AVERAGE        │ Distance = mean of all pairwise distances         │
  │ LINKAGE        │ Compromise between single and complete           │
  ├────────────────┼──────────────────────────────────────────────────┤
  │ WARD'S METHOD  │ Merge clusters that increase total inertia least │
  │ (default)      │ Tends to produce equal-sized, compact clusters   │
  │                │ Best general-purpose choice                      │
  └────────────────┴──────────────────────────────────────────────────┘
```

---

## 5.6 DBSCAN — Density-Based Clustering

### Simple Explanation
DBSCAN finds groups based on **density** — regions where points are packed close together.
It can find clusters of any shape and explicitly marks isolated points as **noise**.

### Three Types of Points

```
  ┌────────────────────────────────────────────────────────────────┐
  │                                                                │
  │  CORE POINT (●):  Has ≥ minPts neighbors within radius ε      │
  │                   The "dense center" of a cluster             │
  │                                                                │
  │  BORDER POINT (○): Has < minPts neighbors within ε,           │
  │                    but IS within ε of a core point            │
  │                   "On the edge" of a cluster                   │
  │                                                                │
  │  NOISE POINT (×):  Not within ε of any core point             │
  │                   Doesn't belong to any cluster               │
  │                                                                │
  └────────────────────────────────────────────────────────────────┘

  Example (minPts=3, ε=1 unit):

  Before:                   After:
  * * * * * *               ■ ■ ■ ■ ■ ■  ← cluster 1 (dense region)
  * * * * *                 ■ ■ ■ ■ ■
  * * *                     ■ ■ ■
  * * * * * *    * *         ● ● ● ● ● ●  ← cluster 2
  * * * *                   ● ● ● ●
                *            ×            ← noise (isolated point)
```

**Official Definition:**
> **DBSCAN** groups points that are closely packed (high density) and marks outliers in
> low-density regions as noise. It requires two parameters: ε (neighborhood radius) and
> minPts (minimum points to form a dense region).

### DBSCAN vs K-Means

```
┌──────────────────────────┬────────────────────────────────────┐
│ K-Means                  │ DBSCAN                             │
├──────────────────────────┼────────────────────────────────────┤
│ Must specify K           │ K is automatic (density decides)   │
│ Only globular clusters   │ Finds ANY shape cluster            │
│ All points assigned       │ Noise points explicitly flagged    │
│ Sensitive to outliers    │ Robust to outliers                 │
│ Fast: O(nKI)             │ Slower: O(n log n) with indexing   │
│ Deterministic*           │ Deterministic (border pts vary)    │
└──────────────────────────┴────────────────────────────────────┘

Cluster shapes DBSCAN handles that K-Means cannot:

   Ring:         Crescents:    Interleaved:
   ·●●●●·        ·●●●·         ●●●  ○○○
  ●·····●         ·●●●·  ○○○  ●●●  ○○○
  ●·····●         ·●●●·   ○○○  ●●●  ○○○
   ·●●●●·        ·●●●·
```

### Choosing ε and minPts

```
  Rule of thumb for minPts:
  → Use minPts = 2 × dimensions (e.g., 2D data → minPts = 4)

  Choose ε using a k-distance plot:
  1. For each point, compute distance to its k-th nearest neighbor
  2. Sort and plot these distances
  3. Look for the "elbow" — that's your ε

  k-distance
     │                           ● ← ε too large (one big cluster)
  0.8│                       ● ●
  0.6│                   ● ●        ← good ε (elbow here!)
  0.4│               ●●
  0.2│      ●●●●●●●●
     └─────────────────────────── points (sorted)
```

---

## 5.7 Gaussian Mixture Models (GMM) ★

### Simple Explanation
K-Means makes hard assignments: "This point belongs to cluster 2."
GMM makes soft assignments: "This point is 70% cluster 2, 25% cluster 3, 5% cluster 1."

```
  K-MEANS (hard assignment):          GMM (soft / probabilistic):
  ────────────────────────────        ──────────────────────────────────
  Point ★ belongs to cluster A.       Point ★ belongs to:
                                        Cluster A with prob 0.75
     ● ● ● ★ ○ ○ ○                     Cluster B with prob 0.20
         A | B                          Cluster C with prob 0.05
                                      It's near the boundary — GMM
                                      expresses this uncertainty!
```

### What is a Gaussian Mixture?

```
  Each cluster is modeled as a Gaussian (bell curve) distribution,
  defined by its mean (center) and covariance (shape/size/rotation).

  1D example — two overlapping clusters:

  Probability
  Density
     │          ╭──╮           ← Cluster A (mean=2, std=0.8)
     │         /    \
     │    ╭──╮/      \╭──╮    ← Cluster B (mean=5, std=1.2)
     │   /    X        X  \
     │  /     \       /    \
     └─────────────────────── x
         1   2   3   4   5   6

  The X marks are overlapping regions — points there could
  plausibly belong to either cluster.
  GMM assigns PROBABILITIES instead of forcing a binary choice.
```

**Official Definition:**
> A **Gaussian Mixture Model (GMM)** represents the data distribution as a weighted sum of
> K Gaussian distributions. It is trained with the Expectation-Maximization (EM) algorithm
> to find cluster means, covariances, and mixing weights that maximize data likelihood.

### GMM vs K-Means

```
┌────────────────────────┬──────────────────────────────────────────┐
│ K-Means                │ GMM                                      │
├────────────────────────┼──────────────────────────────────────────┤
│ Hard cluster assignment│ Soft (probabilistic) assignment          │
│ Circular clusters only │ Elliptical clusters (any shape/rotation) │
│ Minimizes inertia      │ Maximizes data likelihood (log-likelihood)│
│ Fast (simple update)   │ Slower (EM algorithm)                    │
│ Deterministic          │ May converge to local optima             │
│ No uncertainty output  │ Outputs cluster probabilities per point  │
└────────────────────────┴──────────────────────────────────────────┘

Use GMM when:
  - Clusters overlap significantly
  - You need uncertainty estimates (not hard assignments)
  - Clusters are elliptical (not round)
  - You want a proper probabilistic model of your data
```

---

## 5.8 Evaluating Clusters ★

### The Challenge: No Ground Truth

```
  In supervised learning: "Is prediction correct?" → check against label.
  In clustering:  "Are these good clusters?" → no labels to compare to!

  We need INTERNAL evaluation metrics that measure cluster
  quality from the data itself.
```

### Silhouette Score — The Best Single Metric

```
  For each point i, compute:
  ──────────────────────────────────────────────────────────────────
  a(i) = average distance to other points IN its own cluster
         (how well it fits its cluster)

  b(i) = average distance to all points in the NEAREST other cluster
         (how different it is from the best alternative cluster)

  Silhouette(i) = [b(i) - a(i)] / max(a(i), b(i))

  Interpretation:
    s(i) = +1.0  → Point is perfectly placed, far from other clusters
    s(i) =  0.0  → Point is on the boundary between clusters
    s(i) = -1.0  → Point is probably in the WRONG cluster!

  Average silhouette score over all points:
  ┌──────────────────────────────────────────────────────────────┐
  │ Score > 0.7   → Strong cluster structure              ✓✓    │
  │ Score > 0.5   → Reasonable cluster structure          ✓     │
  │ Score > 0.25  → Weak cluster structure, use carefully  ~    │
  │ Score < 0.25  → No substantial structure found         ✗    │
  └──────────────────────────────────────────────────────────────┘
```

### Silhouette Plot — Diagnosing Cluster Quality

```
  Each bar = one data point's silhouette score.
  Bars grouped by cluster, sorted by score within each.

  Cluster 1  Cluster 2  Cluster 3
  ┌──────────────────────────────────────────────────────────────┐
  │  ████████████████ ← long bars = points fit well              │
  │  ████████████████                                            │
  │  ██████████████                                              │
  │  █████████         -- dashed line = avg score = 0.63         │
  │  ████████████████                                            │
  │  █████████████████████ ← cluster 2 fits even better!         │
  │  █████████████████████                                        │
  │  ███████   ← short = borderline points                       │
  │  ██████████████████                                          │
  │  ████████████████████                                        │
  │  ███  ← negative bar = probably misassigned!                 │
  └──────────────────────────────────────────────────────────────┘

  Red flags: clusters with very different sizes, many negative bars,
  or bars much shorter than average → consider different K.
```

### Choosing K — Elbow + Silhouette Together

```
  DON'T rely on just the elbow. Use BOTH:

  K │ Inertia │ Silhouette │ Verdict
  ──┼─────────┼────────────┼────────────────────────────────
  2 │  8,500  │   0.71     │ Good but might be too broad
  3 │  5,200  │   0.68     │ Good
  4 │  3,800  │   0.74     │ ← Best silhouette, also elbow!
  5 │  3,300  │   0.61     │ Marginal gain, worse coherence
  6 │  3,100  │   0.55     │ Diminishing returns

  Choose K=4 (elbow AND highest silhouette agree)  ✓
```

---

## 5.9 Dimensionality Reduction Overview

```
  WHY REDUCE DIMENSIONS?

  Original data: 784 features (28×28 pixel image of a digit)
  ─────────────────────────────────────────────────────────────
  784D → hard to visualize, slow to train on, sparse

  After PCA: 50 features capturing 95% of variance
  ─────────────────────────────────────────────────────────────
  50D → faster training, less overfitting, still accurate

  After t-SNE: 2 features (for visualization only)
  ─────────────────────────────────────────────────────────────
  2D → can plot it! Reveals cluster structure visually.

  ┌──────────────────────────────────────────────────────────────┐
  │  METHOD     │ USE FOR             │ LINEAR? │ SPEED          │
  ├─────────────┼─────────────────────┼─────────┼────────────────┤
  │ PCA         │ Features for models │ YES     │ Fast           │
  │ t-SNE       │ Visualization only  │ NO      │ Slow           │
  │ UMAP        │ Viz + features      │ NO      │ Medium         │
  │ Autoencoder │ Features for models │ NO      │ Slow (training)│
  │ LDA         │ Supervised dimred   │ YES     │ Fast           │
  └──────────────┴─────────────────────┴─────────┴────────────────┘
```

---

## 5.10 PCA — Principal Component Analysis

### Simple Explanation
PCA finds the directions in which the data varies the **most** and projects everything
onto those directions. Like finding the best angle to photograph a 3D sculpture so it
looks most informative in 2D.

```
  ORIGINAL DATA (2D):               AFTER PCA (1D — projected):
  ─────────────────────────         ────────────────────────────────
  Feature 2                          PC1 axis (direction of max variance)
     │         * *
     │      *     *                  ──●──●───●──●●──●─●──
     │    *    *                           All data collapsed
     │  *    *                             onto one axis
     │     *   *
     └──────────── Feature 1          Kept ~87% of original variance!
       ↑
       Arrow = PC1 (direction data spreads most)
       PC2 would be perpendicular to PC1
```

**Official Definition:**
> **PCA** is a linear dimensionality reduction technique that finds an orthogonal
> transformation to a new coordinate system where axes (principal components) are
> ordered by variance explained. PC1 captures maximum variance, PC2 the next most,
> all PCs are uncorrelated.

### PCA Step by Step

```
  1. Center the data:  X = X - mean(X)
     (shift so data is centered at origin)

  2. Compute covariance matrix:  C = (1/n) XᵀX
     (captures how features vary together)

  3. Compute eigenvectors and eigenvalues of C:
     C v = λ v
     Eigenvectors = principal component directions
     Eigenvalues  = amount of variance explained

  4. Sort eigenvectors by eigenvalue (largest first)

  5. Keep top K eigenvectors → reduced dimension matrix

  6. Project: X_reduced = X × [top K eigenvectors]
```

### Scree Plot — How Many Components to Keep?

```
  % Variance Explained
  (per component)
     │
  40%│ ████████
  28%│ ████████ ████████
  18%│ ████████ ████████ ████████
  8% │ ████████ ████████ ████████ ████████
  4% │ ████████ ████████ ████████ ████████ ████████
     └────────────────────────────────────────────────── PC#
           PC1      PC2      PC3      PC4      PC5

  Cumulative: 40% → 68% → 86% → 94% → 98%

  Common rules:
  → Keep enough PCs to explain 90-95% of variance (here: PC1+PC2+PC3)
  → Look for "elbow" in scree plot (here: PC3 → PC4 is big drop)
```

---

## 5.11 t-SNE — For Visualization

### Simple Explanation
t-SNE is a **visualization tool** for high-dimensional data. It crushes your
100-feature dataset into 2D while keeping similar points nearby — perfect for
seeing if there are natural groups.

```
  High-dimensional data                    2D t-SNE plot:
  (784 features per MNIST digit image)
                │                      Feature 2
                ▼ t-SNE                  │  00000  9999
                                         │  00000   9999
                                         │   1111  8888
                                         │   1111   888
                                         │     22222
                                         │      22222  66666
                                         └──────────────────── Feature 1

                                         Each cluster = one digit!
                                         0s cluster together,
                                         1s cluster together, etc.

  ⚠ WARNING: t-SNE is for VISUALIZATION ONLY
  ──────────────────────────────────────────────────────────────
  WHY: t-SNE distorts distances non-uniformly.
  It preserves LOCAL neighborhood structure (nearby = nearby)
  but GLOBAL distances are MEANINGLESS in the plot.
  "Cluster A looks far from Cluster B" does NOT mean they
  are actually far apart in the original feature space.
  Never use t-SNE output as features for another model!
```

### t-SNE Hyperparameters

```
  PERPLEXITY (5–50, default 30):
  Controls how many neighbors each point "cares about."
  Low perplexity → local structure, tiny clusters
  High perplexity → more global view, blobs merge

  Same data, different perplexity:
  perplexity=5:   [many tiny scattered dots]  ← too local
  perplexity=30:  [distinct clear clusters]   ← good!
  perplexity=100: [one big blob]              ← too global

  RUN t-SNE MULTIPLE TIMES: results vary between runs.
  If clusters appear consistently across runs → likely real.
```

---

## 5.12 UMAP — Uniform Manifold Approximation ★

### Simple Explanation
UMAP does what t-SNE does (compress high-D to 2D for visualization) but:
- Runs **much faster** (10-100× faster on large data)
- Better preserves **global structure** (relationships between clusters)
- Can also be used as **feature engineering** (unlike t-SNE!)
- Works for 2D visualization AND reducing to 10-50 dimensions

```
  UMAP vs t-SNE on the same data:

  t-SNE result:                     UMAP result:
  ──────────────────────            ────────────────────────────
  ○○  ●●           □□              ○○○  ●●●      □□□
  ○○   ●●    ●●    □               ○○    ●●    ●●●  □□
      ○○○●●                               ○○○●●   □

  Clusters look similar!            BUT: the DISTANCES between
                                    clusters in UMAP are meaningful.
                                    ○s and ●s being close means
                                    they are actually similar!

  t-SNE: inter-cluster distances meaningless
  UMAP:  inter-cluster distances roughly preserved  ← better!
```

**Official Definition:**
> **UMAP** is a non-linear dimensionality reduction method based on Riemannian geometry
> and algebraic topology. It constructs a fuzzy topological representation of the data
> and optimizes a low-dimensional representation to have a similar topological structure.
> It preserves both local and global structure better than t-SNE.

### UMAP vs t-SNE at a Glance

```
┌────────────────────────┬──────────────────────┬─────────────────────┐
│ Property               │ t-SNE                │ UMAP                │
├────────────────────────┼──────────────────────┼─────────────────────┤
│ Speed                  │ Slow (O(n log n))    │ Faster (O(n^1.14))  │
│ Global structure       │ Poor                 │ Much better         │
│ Local structure        │ Excellent            │ Excellent           │
│ Reproducible           │ No (random init)     │ With random_state   │
│ Use as features        │ NO                   │ YES (with caution)  │
│ Parameters to tune     │ perplexity           │ n_neighbors, min_dist│
│ Best for               │ Visualization only   │ Viz + downstream ML │
└────────────────────────┴──────────────────────┴─────────────────────┘
```

---

## 5.13 Autoencoders ★

### Simple Explanation
An autoencoder is a neural network trained to **compress then decompress** data.
It must learn a compact representation — the "important parts" — because it can't
store everything in the bottleneck. The bottleneck IS the learned representation.

```
  ENCODER                  BOTTLENECK               DECODER
  ─────────────────         ────────────             ──────────────────
  Input (784 dims)                                   Output (784 dims)
  ┌──────────────┐          ┌──────────┐             ┌──────────────┐
  │              │ ──────►  │ 32 dims  │  ──────────►│              │
  │  28×28 image │          │          │             │ Reconstructed│
  │              │          │(compressed              │    image     │
  └──────────────┘          │ code)    │             └──────────────┘
       ↓                    └──────────┘                    ↓
  784 → 256 → 64 → 32    ← bottleneck →   32 → 64 → 256 → 784

  Training goal: output ≈ input
  (reconstruct the input from only 32 numbers)

  What the bottleneck learns: the most important structure in the data.
  After training, USE the bottleneck as a compressed representation!
```

**Official Definition:**
> An **Autoencoder** is a neural network trained to encode its input into a compressed
> (lower-dimensional) representation, then decode it back to the original. The encoder
> learns a dimensionality reduction; the decoder learns its inverse. Trained unsupervised
> by minimizing reconstruction error.

### Variants

```
┌────────────────────────────────────────────────────────────────────┐
│  DENOISING AUTOENCODER                                             │
│  Add noise to input, train to reconstruct CLEAN original.          │
│  Forces the model to learn robust, meaningful features.            │
│  Noisy input: [0.3, 0.8, 0.2, ...] →  Clean output: [0.0, 1.0, 0.0]│
├────────────────────────────────────────────────────────────────────┤
│  VARIATIONAL AUTOENCODER (VAE)                                     │
│  Bottleneck is a DISTRIBUTION (mean + variance) not just a vector. │
│  Can GENERATE new data by sampling from the distribution!          │
│  Used for: image generation, drug molecule design                   │
│  Bottleneck: μ=0.3, σ=0.1 → sample z ~ N(0.3, 0.1) → decode       │
├────────────────────────────────────────────────────────────────────┤
│  SPARSE AUTOENCODER                                                │
│  Bottleneck has many neurons but most are forced to be ZERO.       │
│  Each input activates only a few neurons → interpretable features  │
│  Used in: feature discovery, language model interpretability        │
└────────────────────────────────────────────────────────────────────┘
```

---

## 5.14 Anomaly Detection ★

### Simple Explanation
Anomaly detection finds data points that are **unusually different** from the rest.
No labeled anomalies needed — the model learns what "normal" looks like and flags
anything far from normal.

```
  NORMAL DATA                      ANOMALIES
  ──────────────────────────       ────────────────────────────────
  ●●●●● ●●●●●                      ●●●●● ●●●●●
  ●●●●● ●●●●●     (dense           ●●●●● ●●●●●    ×  ← outlier!
  ●●●●● ●●●●●      region)         ●●●●● ●●●●●
                                                ×     ← outlier!

  "Normal" = belongs to the dense cluster
  "Anomaly" = isolated point far from any cluster
```

### Isolation Forest — The Best General Method

```
  IDEA: Anomalies are EASIER to isolate than normal points.
  If you keep randomly splitting the data, anomalies get isolated
  quickly (in few splits). Normal points need many splits.

  Step 1: Pick a random feature and a random split value.
  Step 2: Split the data. Recurse until each point is isolated.
  Step 3: Count splits needed to isolate each point.

  Normal point:    needs many splits to isolate (path length = 15)
  Anomaly point:   isolated in very few splits (path length = 3)

  Anomaly Score = 1 - (avg path length / expected path length)
  Score near 1 = anomaly,   Score near 0 = normal

  WHY IT WORKS:
  ─────────────────────────────────────────────────────────────
  Feature 2
     │  ●●●●
     │  ●●●●  │← a random split here
     │  ●●●●              ×   ← anomaly: only 1-2 splits
     │  ●●●●                    to be completely isolated!
     └──────────────────────── Feature 1
```

### Other Anomaly Detection Methods

```
┌───────────────────────┬──────────────────────────────────────────────┐
│ METHOD                │ HOW IT WORKS                                 │
├───────────────────────┼──────────────────────────────────────────────┤
│ Isolation Forest      │ Anomalies isolated in fewer random splits    │
│ (recommended default) │ Fast, works in high-D, no assumptions        │
├───────────────────────┼──────────────────────────────────────────────┤
│ One-Class SVM         │ Learns a boundary around "normal" data       │
│                       │ Good for low-D, slow on large data           │
├───────────────────────┼──────────────────────────────────────────────┤
│ Local Outlier Factor  │ Compares each point's density to neighbors   │
│ (LOF)                 │ Good for local anomalies in uneven data      │
├───────────────────────┼──────────────────────────────────────────────┤
│ Autoencoder           │ High reconstruction error = anomaly          │
│                       │ Great for images, time series, complex data  │
├───────────────────────┼──────────────────────────────────────────────┤
│ Z-Score               │ Flag points > 3 standard deviations from mean│
│                       │ Only for univariate, normally distributed data│
└───────────────────────┴──────────────────────────────────────────────┘

  Real-world uses:
  - Credit card fraud detection
  - Network intrusion detection (cybersecurity)
  - Manufacturing defect detection
  - Medical: unusual patient readings
  - Server monitoring: unusual traffic patterns
```

---

## 5.15 Association Rule Learning ★

### Simple Explanation
"People who buy diapers also tend to buy beer."
Association rules find items that frequently appear together —
the foundation of recommendation systems and market basket analysis.

```
  SUPERMARKET TRANSACTION DATA:
  ──────────────────────────────────────────────────────────────
  Transaction 1:  [Bread, Milk, Butter]
  Transaction 2:  [Bread, Diaper, Beer]
  Transaction 3:  [Milk, Diaper, Beer, Butter]
  Transaction 4:  [Bread, Milk, Diaper, Beer]
  Transaction 5:  [Bread, Milk, Butter]
  ──────────────────────────────────────────────────────────────

  Discovered rules:
  {Diaper} → {Beer}    confidence: 75%, support: 60%
  {Bread, Milk} → {Butter}  confidence: 66%, support: 60%
```

### Key Metrics

```
  SUPPORT: How often does this combination appear?
  ─────────────────────────────────────────────────────────────
  Support({Diaper, Beer}) = 3/5 = 0.60  (60% of transactions)
  Low support = rare combination → unreliable pattern

  CONFIDENCE: Given A, how often is B also present?
  ─────────────────────────────────────────────────────────────
  Confidence({Diaper} → {Beer}) = P(Beer | Diaper)
    = Support({Diaper, Beer}) / Support({Diaper})
    = 0.60 / 0.80 = 0.75  (75% of diaper buyers also buy beer)

  LIFT: Is this rule better than random chance?
  ─────────────────────────────────────────────────────────────
  Lift = Confidence / Support(consequent)
       = 0.75 / 0.60 = 1.25

  Lift > 1:  positive association (buying A makes B more likely)
  Lift = 1:  independent (A and B have no relationship)
  Lift < 1:  negative association (buying A makes B less likely)
```

### Apriori Algorithm — Finding Rules Efficiently

```
  CHALLENGE: With 1000 products, there are 2^1000 possible itemsets!
  KEY INSIGHT (Apriori principle):
    If an itemset is infrequent, ALL its supersets are also infrequent.
    This lets us prune the search space enormously!

  Step 1: Find all frequent 1-item sets (items with support ≥ threshold)
          {Bread}=0.8, {Milk}=0.8, {Diaper}=0.8, {Beer}=0.6, {Butter}=0.6

  Step 2: Generate candidate 2-itemsets from frequent 1-itemsets
          {Bread,Milk}=0.6 ✓   {Bread,Diaper}=0.4 ✓
          {Diaper,Beer}=0.6 ✓  etc.

  Step 3: Prune infrequent 2-itemsets, generate 3-itemsets...
          Continue until no frequent itemsets remain

  Step 4: Generate rules from frequent itemsets, filter by confidence
```

---

## 5.16 Self-Supervised Learning ★

### Simple Explanation
What if you could turn an UNLABELED dataset into a supervised one — automatically?
Self-supervised learning creates its own labels from the structure of the data itself.

```
  EXAMPLE: Predicting masked words (BERT, GPT)
  ─────────────────────────────────────────────────────────────
  Original text: "The cat sat on the mat"

  Mask some words: "The [MASK] sat on the [MASK]"

  Task: Predict the masked words → "cat", "mat"

  Labels come from the DATA ITSELF — no human annotation needed!
  Learn from billions of internet texts without any labels.

  EXAMPLE: Predicting image patches (MAE — Masked Autoencoders)
  ─────────────────────────────────────────────────────────────
  Original image:  [full cat photo]
  Input:           [75% of patches masked out]
  Task:            Reconstruct the missing patches
  Labels:          The original image pixels → self-supervised!
```

### Why Self-Supervised Learning Matters

```
  SUPERVISED:             SELF-SUPERVISED:
  ───────────────────     ──────────────────────────────────
  Need:                   Need:
  1M labeled images       1 billion unlabeled images
  Costs: $500K+ to label  Costs: essentially free!

  Result:                 Result:
  Good model for one task Powerful GENERAL representations
                          that transfer to many tasks!

  Self-supervised pre-training → fine-tune with few labels:
  Pre-trained on 1B texts (no labels) → fine-tune on 1K labeled
  examples → often beats model trained on 100K labeled examples!
```

### Connection to Modern AI

```
  GPT, BERT, Claude, DALL-E all use self-supervised pre-training!

  Language models:                 Vision models:
  Next-token prediction            Masked image patches
  Masked language modeling         Contrastive learning (SimCLR)
  → learns language structure      → learns image structure

  CONTRASTIVE LEARNING (SimCLR, CLIP):
  ─────────────────────────────────────────────────────────────
  Show the model two augmented views of the SAME image →
  train it to give them SIMILAR representations.
  Show it views from DIFFERENT images → train for DISSIMILAR.

  Original image →  Crop + flip + color jitter  →  Views A, B
                                                    (same content!)
  Model learns: A and B should be close in embedding space.
  Other images: should be far from A and B.

  Result: excellent visual representations without any labels!
```

---

## 5.17 Applications

```
┌────────────────────────────────────────────────────────────────────┐
│               UNSUPERVISED LEARNING IN THE REAL WORLD              │
├──────────────────────┬─────────────────────────────────────────────┤
│ Customer Segmentation│ Group customers → personalized marketing    │
│ Anomaly Detection    │ Fraud, intrusion, manufacturing defects     │
│ Topic Modeling       │ Group news articles / documents by theme    │
│ Recommendation       │ "Users like you also liked..." (collab filt)│
│ Image Compression    │ PCA/Autoencoder reduces storage size         │
│ Gene Expression      │ Group genes with similar activation pattern │
│ Social Networks      │ Community detection in friend graphs        │
│ Market Basket        │ Apriori rules → product placement           │
│ Pre-training LLMs    │ Self-supervised learning on raw text        │
│ Drug Discovery       │ Cluster molecules by structural similarity  │
│ Image Generation     │ VAE/GAN creates new realistic images        │
└──────────────────────┴─────────────────────────────────────────────┘
```

---

## Key Takeaways

```
╔══════════════════════════════════════════════════════════════════╗
║  UNSUPERVISED LEARNING — COMPLETE CHEAT SHEET                    ║
║  ──────────────────────────────────────────────────────────────  ║
║  No labels — model discovers structure in data alone            ║
║  Curse of Dimensionality: distances lose meaning as D grows     ║
║  K-Means: K centroids, hard assignment, circular clusters        ║
║  Hierarchical: tree of merges → cut dendrogram for any K        ║
║  DBSCAN: density-based, any shape, marks outliers as noise      ║
║  GMM: soft probabilistic assignment, handles overlapping clusters║
║  Silhouette Score: evaluates cluster quality without labels     ║
║  PCA: linear projection onto max-variance axes                  ║
║  t-SNE: visualization only, preserves local structure           ║
║  UMAP: faster, preserves global + local, can use as features    ║
║  Autoencoder: neural net compresses then reconstructs data      ║
║  Isolation Forest: anomalies isolated with fewer random splits  ║
║  Apriori: finds association rules (support, confidence, lift)   ║
║  Self-supervised: creates labels from data itself (GPT, BERT)   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Review Questions — Test Your Understanding

1. You have customer data with no labels and want to find natural groups. Which clustering algorithm would you start with and why?
2. K-Means gives you circular clusters. But your data has crescent-shaped clusters. What algorithm should you use instead?
3. Explain the Silhouette Score in one sentence. What does a score of -0.2 mean for a specific data point?
4. You have a dataset with 500 features. Your model is performing poorly. What could be happening (think: curse of dimensionality) and what would you try?
5. What's the difference between PCA and t-SNE? When would you use each?

<details>
<summary>Answers</summary>

1. Start with K-Means — it's fast, simple, and works well for globular clusters. Use the Elbow method + Silhouette score to choose K. If clusters aren't round, switch to DBSCAN.
2. DBSCAN — it finds density-based clusters of any shape. K-Means assumes spherical clusters and would fail on crescents.
3. Silhouette Score measures how similar a point is to its own cluster vs the nearest other cluster (range -1 to +1). A score of -0.2 means the point is probably assigned to the wrong cluster.
4. Curse of dimensionality — with 500 features, data is extremely sparse, distances lose meaning, and the model needs exponentially more data. Try: PCA to reduce dimensions, feature selection to remove irrelevant features, or regularization.
5. PCA preserves global variance/structure and is fast (linear). t-SNE preserves local neighborhoods and is great for visualization but slow and non-linear. Use PCA for preprocessing/compression, t-SNE (or UMAP) for visualizing clusters in 2D/3D.
</details>

---

**Previous:** [Chapter 6 — Supervised Learning](06_supervised_learning.md)
**Next:** [Chapter 8 — Reinforcement Learning](08_reinforcement_learning.md)
