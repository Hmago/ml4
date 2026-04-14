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
Imagine you are learning to tell apart different fruits. Your mom sits next to you and holds
up an apple: "This is an apple." Then she holds up a banana: "This is a banana." She does
this over and over -- hundreds of fruits -- always telling you the right answer. After a while,
she holds up a fruit you have never seen before and asks, "What is this?" Because you learned
the patterns (round and red = apple, long and yellow = banana), you can guess correctly even
though nobody told you the answer for that one.

That is exactly what supervised learning is! The "teacher" (your mom, in this story) gives the
computer tons of examples *with the correct answers already written on them*, and the computer
figures out the pattern so it can answer on its own next time.

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

### Simple Explanation
Think about two different kinds of questions your teacher might ask you.

**Classification** is like a sorting game: "Which bucket does this go in?" Imagine you have a
big pile of Halloween candy and three buckets labeled "Chocolate," "Gummy," and "Hard Candy."
You pick up each piece and drop it into the right bucket. There are only a few buckets to choose
from -- you are putting things into groups.

**Regression** is like a guessing-a-number game: "How many jellybeans are in this jar?" There is
no bucket -- the answer is a number, and it could be anything: 42, 119, 2,006. You are not sorting
into groups; you are predicting a specific amount.

So: classification = "Which group?" and regression = "What number?"

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

### Simple Explanation
Classification is all about sorting things into groups. Sometimes there are only two groups
(like "yes" or "no"), sometimes there are many groups (like picking which animal is in a photo),
and sometimes one thing can belong to several groups at once (like a song that is both "pop"
AND "dance" at the same time). Let's look at each kind.

### Binary Classification — Two Classes

**Simple Explanation:**
Binary means "two." Think of it like a light switch -- it is either ON or OFF, nothing in between.
A binary classifier looks at something and decides: "Is this one thing or the other?" For example,
your email app looks at every message and asks one simple question: "Is this spam or not spam?"
Only two possible answers, just like a true-or-false quiz at school.

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

**Simple Explanation:**
Now imagine a multiple-choice test instead of true-or-false. You see a picture of an animal and
have to pick ONE answer: is it a cat, a dog, a bird, or a fish? There are more than two choices,
but you can only pick exactly one. That is multi-class classification -- many groups to choose
from, but each thing goes in only one group, like putting each student into exactly one classroom.

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

**Simple Explanation:**
Think about describing your best friend. Your friend is not just ONE thing -- they might be
"funny" AND "smart" AND "good at soccer" all at the same time! Multi-label classification
works the same way. Instead of picking just one label, the computer can stick as many labels
as it wants onto a single thing. A photo of a beach at sunset could be tagged "beach" AND
"sunset" AND "ocean" AND "nature" -- all at once.

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

**Simple Explanation:**
Imagine you are at recess and need to split the playground so that soccer players are on one
side and basketball players are on the other. If you can just stretch a jump rope across the
middle in a straight line and everyone ends up on the correct side, that is a *linear* boundary
-- nice and simple! But what if the soccer players are scattered all around and the basketball
players are clumped in the middle? You would need to draw a wiggly circle or a weird curvy line
to separate them. That is a *non-linear* boundary -- harder, but sometimes the only way to do it.

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

**Simple explanation:**
Imagine you are trying to decide if you should bring an umbrella to school. You think about a
few clues: "Are there dark clouds?" (big clue!), "Did the weather app say rain?" (another big
clue), "Is it windy?" (small clue). You give each clue a score for how important it is, add
them all up, and if the total is high enough you think, "Yep, it is probably going to rain --
I should bring my umbrella!" Logistic Regression works the same way: it adds up weighted clues,
then squashes the total through a special S-shaped curve (called the sigmoid) that turns it into
a percentage between 0% and 100% -- a probability of "yes" or "no."

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

**Simple explanation:**
Picture this: you are the new kid at school and nobody knows which friend group you belong to.
How do people figure it out? They look at who you hang out with! If your three closest friends
all love art, people will guess you probably love art too. That is exactly how KNN works --
"you are judged by the company you keep!" To classify something new, the computer looks at the
K most similar examples it already knows about, and whatever group most of those neighbors belong
to, that is the group the new thing gets put into. It is like a vote: ask your nearest neighbors,
and the majority wins.

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

**Simple explanation:**
Have you ever played the game "20 Questions"? Someone thinks of something and you ask yes-or-no
questions to narrow it down: "Is it alive?" Yes. "Is it bigger than a dog?" No. "Does it have
fur?" Yes. "Is it a cat?" Yes! A Decision Tree works exactly like that game. The computer builds
a flowchart of yes/no questions about the data. Each question splits the answers into smaller and
smaller groups until the computer reaches the end and says, "I know the answer!" You can even
draw the whole tree on paper and follow the path with your finger -- that is why people love
Decision Trees: they are easy to understand and explain.

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
Imagine you are sorting a big mixed bag of M&Ms and Skittles into two bowls. You could sort by
color, by size, or by whether they have an "M" printed on them. Which rule would separate them
the fastest? Sorting by the "M" stamp would give you a nearly perfect split -- one bowl is all
M&Ms, the other is all Skittles. Sorting by color would leave both bowls still mixed up. The
tree tries *every possible sorting rule* and picks the one that makes the two groups as "pure"
as possible -- meaning each group has mostly one type of candy, not a messy mix.

At each node, the tree must decide: "Which question best separates my data?"
It tries every feature and every possible threshold, picks the split that
creates the "purest" child nodes.

### Gini Impurity

**Simple Explanation:**
Think of Gini Impurity as a "messiness score." If you reach into a bowl and every piece of candy
is a chocolate bar, the bowl is perfectly sorted -- not messy at all (Gini = 0). But if the bowl
is half chocolate bars and half gummy bears all mixed together, it is maximally messy (Gini = 0.5
for two groups). The tree wants to make splits that create the *least messy* groups possible, so
it picks the question that drives the Gini score as close to zero as it can.

$$\text{Gini} = 1 - \sum_i p_i^2$$

where $p_i$ = fraction of class $i$ in the node.

```
  Pure node (all one class):     Gini = 1 - (1² + 0²)    = 0.0
  Mixed 50/50:                   Gini = 1 - (0.5² + 0.5²) = 0.5
  Mixed 70/30:                   Gini = 1 - (0.7² + 0.3²) = 0.42

  LOWER Gini = PURER node = BETTER split
```

### Information Gain (Entropy-based)

**Simple Explanation:**
Entropy is another way to measure messiness, but think of it as "surprise." If you know a bowl
is 100% chocolate, there is zero surprise when you pull out a chocolate -- boring! (Entropy = 0.)
But if the bowl is 50/50 chocolate and gummy bears, every time you reach in you have no idea
what you will get -- maximum surprise! (Entropy = 1.) Information Gain asks: "How much did this
question REDUCE my surprise?" If asking "Is it round?" takes you from maximum surprise to almost
no surprise, that question has high information gain -- it is a really useful question to ask!

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
Imagine you are on a game show, and you can either ask ONE person for the answer or ask a crowd
of 100 people and go with whatever most of them say. One person might be wrong, but when you
ask a whole crowd and take the most popular answer, the mistakes tend to cancel out and you get
the right answer way more often. This is called the "wisdom of the crowd."

Ensemble methods do exactly this with machine learning models. One decision tree is like asking
one person -- it might make silly mistakes. But if you train *hundreds* of trees, each one
looking at the problem from a slightly different angle, and then let them all vote, the group
is much smarter and more reliable than any single tree.

**Ensemble methods combine multiple weak models into one strong one.**

```
  INDIVIDUAL TREE (high variance):     ENSEMBLE (stable, accurate):
  ──────────────────────────────        ───────────────────────────────
  Change 3 training examples →          Change 3 training examples →
  totally different tree!               barely changes the prediction!

  Accuracy: ~75%                        Accuracy: ~92%
```

### Bagging — Parallel Independent Trees

**Simple Explanation:**
Imagine your class has to study for a big test, but there is way too much material for one
person to memorize. So everyone takes a *different* random mix of study notes and learns from
those. On test day, everyone writes down their answer and you go with whatever most people said.
Since each person studied a slightly different set of notes, their mistakes are in different
places, and the group answer is almost always better than any single person's answer. That is
Bagging: give each tree a different random sample of the data, let them all learn separately (at
the same time!), and then combine their answers.

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

**Simple Explanation:**
Think of learning to ride a bike. On your first try, you keep falling when you turn left.
So you practice left turns over and over. Once you fix that, you notice you wobble going
uphill -- so you practice hills next. Each time you focus on whatever you are *still doing
wrong*. That is Boosting! The first tree makes its best guesses. Then the second tree looks
ONLY at the mistakes the first tree made and tries to fix those. The third tree fixes whatever
the second one still got wrong. And so on. Each new tree is like a tutor who specializes in
the questions you keep getting wrong, and together they make a super-strong team.

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

**Simple Explanation:**
Imagine you are guessing how many marbles are in a jar. Your first guess is 50, but the real
answer is 100 -- you are off by 50. So your friend helps: they guess you are off by about 30,
and you add that (now you are at 80, only off by 20). Then another friend says you are still
off by about 15 -- add that (now you are at 95, only off by 5!). Each friend focuses on fixing
the *remaining gap* between your guess and the real answer. That gap is called the "residual."
Gradient Boosting works exactly like this: each new tree predicts how far off the previous
answer still is, and you keep adding corrections until you are super close.

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

**Simple Explanation:**
Imagine you need to figure out what a mystery object is. You ask three friends with very
different skills: one friend is amazing at identifying shapes, another is great at recognizing
colors, and the third knows a lot about textures. They each give their best guess. Then you ask
a FOURTH friend -- the smartest one -- to listen to all three guesses and combine them into one
final answer. That fourth friend learns *which of the other friends to trust more* for different
kinds of questions. Stacking works the same way: instead of using the same type of model over
and over, you use completely different types of models and then train a "boss" model on top to
combine their answers in the smartest way.

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
Imagine you just aced a spelling test, and your teacher asks, "What helped you the most?"
You think about it: "Well, reading before bed every night was the biggest help. Flashcards
helped a little. And eating a good breakfast that morning maybe helped a tiny bit." Feature
importance is like asking the computer the same question after it makes a prediction: "Hey
computer, which clues mattered the most when you made your decision?" The computer looks back
at all the questions it asked (its decision-tree splits) and tells you which pieces of information
were the most useful. This is really important because it helps us understand *why* the model
made its choice, not just *what* it chose.

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

**Simple Explanation:**
Here is a fun way to figure out how important each player on your soccer team is: make one
player wear a blindfold during the game (so they are basically playing randomly) and see how
much worse the team does. If you blindfold the star striker and the team barely scores, that
player was SUPER important. If you blindfold the backup goalie and nothing changes, they
were not contributing much. Permutation importance does the same thing with data: it scrambles
(shuffles) one column of information so it becomes random nonsense, and then checks how much
the model's accuracy drops. Big drop = that feature was really important!

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

**Simple Explanation:**
Regular feature importance is like saying "In general, studying is the most helpful thing for
getting good grades." But SHAP is more specific -- it explains a *single* prediction. It is
like your teacher looking at YOUR test and saying: "You got a B+ because: you studied the
vocabulary (+10 points!), you understood the main ideas (+8 points), BUT you rushed through
the essay (-5 points), and you missed a few easy questions (-3 points)." SHAP breaks down
*each individual prediction* into contributions from each feature, telling you exactly what
pushed the answer up and what pulled it down. It is the gold standard for explaining what
a model is thinking.

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

### Simple Explanation
Classification is like sorting mail into mailboxes -- each letter goes into one specific box.
Regression is totally different: it is like guessing someone's height, or how much your
lemonade stand will earn this weekend. The answer is not a category; it is a *number* that
could be anything. How tall is that tree? Maybe 12 feet, maybe 12.5, maybe 13.2 -- the answer
can land anywhere on a number line. Regression models are the computer's way of drawing the
best line (or curve) through a bunch of dots so it can guess the right number for something new.

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

**Simple Explanation:**
Regular linear regression sometimes tries TOO hard to fit every little bump in the data, like
a student who memorizes every single practice question word-for-word instead of understanding the
concept. Regularization is like a teacher saying, "Keep your answers simple! Don't overthink it."
It adds a penalty for making the model too complicated, so the model is forced to find a simpler,
more general pattern that works well on new data it has never seen before. Ridge gently nudges all
the weights to be smaller. Lasso is stricter -- it can force some weights all the way down to zero,
basically saying "these features do not matter at all, ignore them!"

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

### Simple Explanation
Imagine you are training a dog to find a four-leaf clover in a huge field. Almost every clover
has three leaves (99 out of 100), and only 1 in 100 has four leaves. If the dog just says
"three leaves!" for EVERY clover it sniffs, it will be "right" 99% of the time -- but it will
never, ever find the special four-leaf clover, which was the whole point! That is the class
imbalance problem: when one group is way bigger than the other, the model can cheat by always
guessing the common answer and still *look* like it is doing great, even though it is completely
failing at the rare thing you actually care about.

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

### Simple Explanation
Choosing a machine learning algorithm is like choosing which tool to use for a school project.
Need to cut paper? Scissors are fast and easy. Need to cut wood? You need a saw -- slower but
more powerful. Need to carve something really detailed? You might need a special craft knife.
No single tool is the best for everything! Some algorithms are super fast but only work on
simple problems (like scissors for paper). Others are slow but incredibly powerful and can
handle tricky patterns (like a laser cutter). The trick is matching the right tool to your job.

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
