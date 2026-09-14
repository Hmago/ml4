# Chapter 40 — Python for ML & AI: Libraries, Models & Azure LLMs

> "Knowing which algorithm to pick is half the job. The other half is being fluent enough with NumPy, pandas and scikit-learn that the code stops getting in the way."

---

## What You'll Learn

After this chapter you will be able to:
- Set up a reproducible ML environment and know what each library in the stack is for
- Drive **NumPy** — shapes, slicing, boolean masks, broadcasting, vectorisation
- Drive **pandas** — `.loc` vs `.iloc`, filtering, `groupby`, joins, missing data
- Recognise the **one scikit-learn API** (`fit` / `predict` / `transform`) behind every model
- Build leak-proof supervised and unsupervised workflows with `Pipeline`
- Call **Azure OpenAI** from Python — chat, streaming, JSON output, embeddings, retries and cost control

**Markers:** ★★★ = know cold for interviews · ★★ = high priority · ★ = good to know.

> **How this chapter relates to the others.** [Ch 27 — Practical ML](#content/27_practical_ml) teaches **which algorithm to choose and why** — eight supervised algorithms, clustering, feature engineering, MLOps. This chapter teaches **how to drive the libraries** underneath it, then goes somewhere Ch 27 doesn't: calling LLMs from Python via Azure. If you want the algorithm deep dives, go there; §40.5 links to the exact sections. For Python the *language*, see [Ch 39 — Python Refresher](#content/39_python_refresher).

> ▶ **The NumPy, pandas and scikit-learn blocks run live in your browser.** Press **Run**. The library versions in the sandbox are numpy 1.26, pandas 1.5, scikit-learn 1.3 — every output in the comments was captured from those exact versions. The Azure blocks in §40.6 need network access and API keys, so they show a "copy this locally" note instead.

---

## 40.1 Setup & the Library Map ★★

**In this section**

- What each library in the stack actually does
- A reproducible environment in four commands
- The import aliases everyone uses

### The stack

| Library | Job | You reach for it when |
|---|---|---|
| **NumPy** | n-dimensional numeric arrays | any math on vectors/matrices; every other library is built on it |
| **pandas** | labelled tables (`DataFrame`) | loading CSVs, cleaning, joining, grouping |
| **matplotlib** | plots | looking at your data before modelling it |
| **scikit-learn** | classical ML + preprocessing | anything that isn't deep learning |
| **PyTorch** / **TensorFlow** | deep learning, GPU tensors | neural networks — see [Ch 27 Part 12](#content/27_practical_ml) |
| **openai** (Azure) | LLM calls | text generation, embeddings — §40.6 |

The dependency order matters: **pandas is built on NumPy, and scikit-learn consumes both.** A `DataFrame` column is a NumPy array with a label, and `model.fit(X, y)` converts whatever you hand it into arrays. Learn NumPy first and the other two stop being mysterious.

### Reproducible environment

```
python -m venv .venv
.venv\Scripts\activate          # Windows;  source .venv/bin/activate on macOS/Linux
pip install numpy pandas matplotlib scikit-learn jupyter
pip freeze > requirements.txt
```

Four rules that prevent most "works on my machine" tickets:

- **One virtual environment per project.** Never `pip install` into the system Python.
- **Pin versions** with `pip freeze > requirements.txt`, and commit it. `pip install -r requirements.txt` rebuilds it exactly.
- **Never commit the `.venv` folder** — add it to `.gitignore`. It is rebuildable and large.
- **`uv` is the fast modern alternative** to pip/venv (same commands, ~10× faster). `conda` is still common in scientific setups where you need non-Python binaries.

### Import aliases

These are conventions, not requirements — but every codebase, tutorial and interviewer uses them, so deviating just adds friction.

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split   # sklearn: import what you need
```

---

## 40.2 NumPy — Arrays, Shapes & Vectorisation ★★★

**In this section**

- Arrays, shapes, and the `axis` argument everyone gets wrong
- Boolean masks and `np.where` — filtering without loops
- Broadcasting, and why vectorised code is ~12× faster

#### Simple Explanation

A Python list is a **shopping bag**: it can hold anything, in any mix, and each item is a separate object scattered across memory. Flexible, but the computer has to chase a pointer for every single element.

A NumPy array is an **egg carton**: every slot is the same size and type, laid out in one contiguous block. That rigidity is the whole point — the CPU can process a whole row in one instruction instead of chasing pointers one at a time.

This is why the golden rule of NumPy is **never write a Python loop over an array**. If you find yourself writing `for i in range(len(arr))`, there is almost always an operation that does it for you, in compiled C, on the entire array at once.

> A **NumPy array** (`ndarray`) is a fixed-size, homogeneously typed, n-dimensional block of contiguous memory, described by a `shape` tuple and a `dtype`.

### Creating and inspecting

```python
import numpy as np

a = np.array([1, 2, 3, 4, 5, 6])
print(a.shape, a.ndim)        # (6,) 1        <- shape is a TUPLE

g = a.reshape(2, 3)           # 2 rows, 3 cols — no data copied, just re-labelled
print(g)                      # [[1 2 3]
                              #  [4 5 6]]
print(g.shape, g.T.shape)     # (2, 3) (3, 2)   <- .T transposes

print(np.zeros(3))            # [0. 0. 0.]
print(np.arange(0, 10, 3))    # [0 3 6 9]      <- like range(), but an array
print(np.linspace(0, 1, 5))   # [0. 0.25 0.5 0.75 1.]   <- N points, endpoints included
print(np.arange(5, dtype=float).dtype)   # float64
```

`shape` is the single most useful debugging tool in ML. When something breaks, print the shape first — the overwhelming majority of errors are a `(n, 1)` where a `(n,)` was expected, or a transpose.

### Indexing, slicing and masks

```python
import numpy as np
a = np.array([1, 2, 3, 4, 5, 6])
g = a.reshape(2, 3)

print(a[1:4], a[-2:])         # [2 3 4] [5 6]
print(g[1, 2])                # 6        <- [row, col], NOT g[1][2]
print(g[:, 0])                # [1 4]    <- every row, column 0
print(g[0, :])                # [1 2 3]  <- row 0, every column

mask = a > 3
print(mask)                   # [False False False  True  True  True]
print(a[mask])                # [4 5 6]           <- filter by boolean array
print(a[(a > 2) & (a < 5)])   # [3 4]             <- & and |, NOT `and`/`or`
print(np.where(a > 3, a, 0))  # [0 0 0 4 5 6]     <- vectorised if/else
```

Three things to bank:

- **`g[row, col]`, not `g[row][col]`.** The comma form is one indexing operation; the chained form builds a temporary array first.
- **Combine masks with `&` and `|`, and parenthesise each side.** Python's `and`/`or` try to convert the array to a single `True`/`False` and raise.
- **`np.where(cond, a, b)` is a vectorised ternary** — the array equivalent of `a if cond else b`.

### Aggregation and the `axis` argument

```python
import numpy as np
g = np.array([[1, 2, 3], [4, 5, 6]])
print(g.sum())                # 21      <- everything
print(g.sum(axis=0))          # [5 7 9]     <- collapses ROWS, one result per column
print(g.sum(axis=1))          # [6 15]      <- collapses COLUMNS, one result per row
print(g.mean(), g.max(), g.argmax())   # 3.5 6 5   <- argmax gives the INDEX
```

The reliable way to remember `axis`: **`axis=n` is the dimension that disappears.** `g` is shape `(2, 3)`; `sum(axis=0)` removes the 2 and leaves `(3,)`. Column statistics — the usual thing you want per feature — are `axis=0`.

### Broadcasting

```python
import numpy as np
g = np.array([[1, 2, 3], [4, 5, 6]])     # shape (2, 3)

print(g * 10)                            # scalar -> every element
# [[10 20 30]
#  [40 50 60]]
print(g + np.array([10, 20, 30]))        # row (3,) added to each row
# [[11 22 33]
#  [14 25 36]]
print(g + np.array([[100], [200]]))      # column (2,1) added to each column
# [[101 102 103]
#  [204 205 206]]

try:
    g + np.array([1, 2])
except ValueError as e:
    print("ValueError:", e)
# ValueError: operands could not be broadcast together with shapes (2,3) (2,)
```

The rule: compare shapes **right to left**; each pair must be equal, or one of them must be 1. `(2,3)` vs `(3,)` aligns as `(2,3)` vs `(1,3)` → fine. `(2,3)` vs `(2,)` aligns as `(2,3)` vs `(1,2)` → 3 ≠ 2, error. The fix for that last case is `reshape(2, 1)` to say "this is a column".

### Why vectorisation matters

```python
import numpy as np, time
n = 1_000_000
xs  = [float(i) for i in range(n)]
arr = np.arange(n, dtype=float)

t0 = time.perf_counter(); s1 = sum(x*x for x in xs);  t1 = time.perf_counter()
t2 = time.perf_counter(); s2 = (arr*arr).sum();       t3 = time.perf_counter()

print("same result:", np.isclose(s1, s2))                           # True
print(f"loop {(t1-t0)*1000:.0f} ms | numpy {(t3-t2)*1000:.0f} ms")  # loop 60 ms | numpy 5 ms
```

Roughly 12× here, and the gap widens with size. The loop pays Python interpreter overhead per element; NumPy runs one compiled loop over contiguous memory.

> ⚠️ **Two traps worth knowing now.** A **slice is a view, not a copy** — `row = g[0]; row[0] = 99` modifies `g`. Use `.copy()` when you need independence. And **integer arrays can silently overflow**: summing squares of a million 32-bit integers wraps to a wrong answer with no warning. Use `dtype=float` or `.astype(np.int64)` for large sums.

---

## 40.3 pandas — DataFrames That Do the Work ★★★

**In this section**

- `.loc` vs `.iloc` vs `[]` — the table that ends the confusion
- Filtering, deriving columns, `groupby`, joining, missing data
- `SettingWithCopyWarning` and what it is actually telling you

#### Simple Explanation

If a NumPy array is an egg carton, a **DataFrame is a spreadsheet**: same rectangular grid, but the rows and columns have *names*, and different columns can hold different types.

Two objects, and the relationship between them is the whole mental model:

- A **`Series`** is one column — a NumPy array plus an index (row labels).
- A **`DataFrame`** is a dict of Series sharing one index.

So `df["salary"]` hands you a Series, and every Series operation is vectorised exactly like NumPy. You are still never writing a loop.

### Building and inspecting

```python
import pandas as pd

df = pd.DataFrame({
    "name":   ["Ada", "Linus", "Guido", "Bea"],
    "team":   ["ml", "infra", "ml", "infra"],
    "salary": [120, 95, 140, 105],
    "years":  [5, 12, 20, 3],
})
print(df.shape)                              # (4, 4)
print(list(df.columns))                      # ['name', 'team', 'salary', 'years']
print(df["salary"].mean())                   # 115.0
print(df["team"].value_counts().to_dict())   # {'ml': 2, 'infra': 2}
```

Your first four commands on any new dataset, in order: `df.shape` (how big?), `df.head()` (what does a row look like?), `df.info()` (types and nulls), `df.describe()` (distributions and obvious outliers).

### Selection — the table that ends the confusion

| You write | You get | Use it for |
|---|---|---|
| `df["salary"]` | a **Series** (one column) | grabbing a single column |
| `df[["name", "salary"]]` | a **DataFrame** (note double brackets) | a subset of columns |
| `df.loc[0, "name"]` | value by **label** | labels, and boolean masks |
| `df.iloc[0, 0]` | value by **integer position** | positional access |
| `df.loc[mask, "name"]` | filtered rows, named column | **the one you'll use most** |
| `df[df.salary > 100]` | filtered rows, all columns | quick filtering |

```python
import pandas as pd
df = pd.DataFrame({"name": ["Ada", "Linus", "Guido", "Bea"],
                   "team": ["ml", "infra", "ml", "infra"],
                   "salary": [120, 95, 140, 105], "years": [5, 12, 20, 3]})

print(df.loc[0, "name"], df.iloc[0, 0])                  # Ada Ada   <- same cell, two routes
print(df.loc[df["team"] == "ml", "name"].tolist())       # ['Ada', 'Guido']
print(df.iloc[0:2, 0:2].to_dict("records"))
# [{'name': 'Ada', 'team': 'ml'}, {'name': 'Linus', 'team': 'infra'}]
```

The distinction in one line: **`.loc` is labels, `.iloc` is integer positions.** They coincide on a default 0..n index, which is exactly why the difference stays invisible until you filter or sort and the labels no longer match the positions.

### Filtering and deriving columns

```python
import pandas as pd, numpy as np
df = pd.DataFrame({"name": ["Ada", "Linus", "Guido", "Bea"],
                   "team": ["ml", "infra", "ml", "infra"],
                   "salary": [120, 95, 140, 105], "years": [5, 12, 20, 3]})

print(df[(df.salary > 100) & (df.years < 10)]["name"].tolist())   # ['Ada', 'Bea']
print(df[df["team"].isin(["ml"])]["name"].tolist())               # ['Ada', 'Guido']

df2 = df.assign(
    senior=df["years"] > 10,
    band=lambda d: np.where(d.salary >= 120, "high", "std"),
)
print(df2[["name", "senior", "band"]].to_dict("records"))
# [{'name': 'Ada',   'senior': False, 'band': 'high'},
#  {'name': 'Linus', 'senior': True,  'band': 'std'},
#  {'name': 'Guido', 'senior': True,  'band': 'high'},
#  {'name': 'Bea',   'senior': False, 'band': 'std'}]
```

Same masking rules as NumPy: `&` and `|`, each side parenthesised. `.assign()` returns a new DataFrame rather than mutating, which keeps chains readable and sidesteps the warning below.

> **Prefer vectorised operations over `.apply()`.** `df["x"] * 2` and `np.where(...)` run in compiled code; `df.apply(lambda row: ..., axis=1)` runs your Python function once per row and is typically 10–100× slower. Reach for `.apply` only when there is genuinely no vectorised equivalent.

### Grouping and joining

```python
import pandas as pd
df = pd.DataFrame({"name": ["Ada", "Linus", "Guido", "Bea"],
                   "team": ["ml", "infra", "ml", "infra"],
                   "salary": [120, 95, 140, 105]})

print(df.groupby("team")["salary"].mean().to_dict())
# {'infra': 100.0, 'ml': 130.0}

print(df.groupby("team").agg(n=("name", "count"), avg=("salary", "mean")).to_dict("index"))
# {'infra': {'n': 2, 'avg': 100.0}, 'ml': {'n': 2, 'avg': 130.0}}

teams = pd.DataFrame({"team": ["ml", "infra"], "lead": ["Yann", "Kelsey"]})
print(df.merge(teams, on="team", how="left")[["name", "lead"]].to_dict("records"))
# [{'name': 'Ada', 'lead': 'Yann'}, {'name': 'Linus', 'lead': 'Kelsey'},
#  {'name': 'Guido', 'lead': 'Yann'}, {'name': 'Bea', 'lead': 'Kelsey'}]
```

`groupby` is split → apply → combine. The named-aggregation form (`agg(n=("name","count"))`) is worth defaulting to, because it labels the output columns instead of leaving you a MultiIndex to unpick. For joins, `how=` takes `left` / `right` / `inner` / `outer` with the same meanings as SQL — and `how="left"` is the safe default when you are enriching a table and must not lose rows.

### Missing data

```python
import pandas as pd
df = pd.DataFrame({"name": ["Ada", "Linus", "Guido"],
                   "salary": [120, None, 140]})
print(df.isna().sum().to_dict())                             # {'name': 0, 'salary': 1}
print(df["salary"].fillna(df["salary"].median()).tolist())   # [120.0, 130.0, 140.0]
print(df.dropna().shape)                                     # (2, 2)
```

`df.isna().sum()` is the one-liner that tells you where the holes are. Then decide deliberately: **drop** rows if they are few and random, **fill** with a median/mode if not, and — critically — compute that fill value from the **training set only**, which is what `SimpleImputer` inside a `Pipeline` does for you (§40.5).

> ⚠️ **`SettingWithCopyWarning`.** `sub = df[df.team == "ml"]` may return a *view*, so `sub["salary"] = 0` might modify `df`, or might not — pandas can't tell, so it warns. It is a real bug warning, not noise. The fix is explicit: `sub = df[df.team == "ml"].copy()`.

---

## 40.4 matplotlib — Look at the Data First ★

Four plots answer most questions, and the `fig, ax` form is the one to learn — it is what every tutorial beyond the basics assumes.

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
fig, ax = plt.subplots(figsize=(6, 3))
ax.plot(x, np.sin(x), label="sin")
ax.scatter([2, 4, 6], [0.9, -0.8, -0.3], color="red", label="points")
ax.set_xlabel("x"); ax.set_ylabel("y"); ax.set_title("Trend")
ax.legend()
plt.show()
```

| Plot | Call | Answers |
|---|---|---|
| Line | `ax.plot(x, y)` | how does this change over time? |
| Scatter | `ax.scatter(x, y)` | are these two variables related? |
| Histogram | `ax.hist(values, bins=30)` | what's the distribution? outliers? |
| Bar | `ax.bar(labels, heights)` | how do categories compare? |

`fig, ax = plt.subplots()` gives you the figure (the canvas) and the axes (the plot). Everything else is a method on `ax`. `plt.subplots(1, 2)` returns an array of axes for side-by-side comparisons.

---

## 40.5 scikit-learn — One API for Every Model ★★★

**In this section**

- The four-method contract that every estimator implements
- A complete supervised workflow, and a complete unsupervised one
- `Pipeline` — and a demo of what data leakage actually costs you

#### Simple Explanation

scikit-learn's real achievement is not its algorithms — it's that **every one of them has the same few methods**. Swapping a logistic regression for a random forest is a one-line change, because both answer to `fit` and `predict`.

Think of it as a power-tool system with one battery mount. The drill, the sander and the saw all do different jobs, but they clip onto the same base — so learning the base once means you can use any tool in the range.

| Method | What it does | Who has it |
|---|---|---|
| `fit(X, y)` | learn from training data | every estimator (`y` omitted when unsupervised) |
| `predict(X)` | produce predictions | models |
| `predict_proba(X)` | class probabilities | classifiers that support it |
| `transform(X)` | reshape/clean features | preprocessors (scalers, encoders, PCA) |
| `fit_transform(X)` | `fit` then `transform`, in one call | preprocessors — **training data only** |

The shape convention is fixed: **`X` is 2-D `(n_samples, n_features)`, `y` is 1-D `(n_samples,)`.** The most common beginner error is passing a single sample as `(n_features,)` — reshape it to `(1, n_features)`.

### A complete supervised workflow

```python
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, confusion_matrix

X, y = load_breast_cancer(return_X_y=True, as_frame=True)
print("shape:", X.shape)                                # shape: (569, 30)

X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)
print("train/test:", X_tr.shape[0], X_te.shape[0])      # train/test: 455 114

pipe = Pipeline([
    ("scale", StandardScaler()),
    ("clf",   LogisticRegression(max_iter=5000)),
])
pipe.fit(X_tr, y_tr)

pred = pipe.predict(X_te)
print("accuracy:", round(accuracy_score(y_te, pred), 4))     # accuracy: 0.9825
print("confusion:", confusion_matrix(y_te, pred).tolist())   # [[41, 1], [1, 71]]

scores = cross_val_score(pipe, X, y, cv=5, scoring="accuracy")
print("cv mean:", round(scores.mean(), 4))                   # cv mean: 0.9807
```

Three arguments in there carry most of the weight:

- **`random_state=42`** makes the split reproducible. Without it, your accuracy changes on every run and you cannot tell a real improvement from noise.
- **`stratify=y`** keeps the class balance identical in train and test. Skip it on imbalanced data and your test set can end up with almost none of the minority class.
- **`cross_val_score(..., cv=5)`** trains 5 times on different splits. A single split can be lucky; report the mean, and look at the spread before believing a small improvement.

### `Pipeline` — and what leakage actually costs

A `Pipeline` chains preprocessing and a model into one estimator. That is not a style preference; it is the **structural fix for data leakage**, because `pipe.fit()` fits each step on the training fold only, and `cross_val_score` re-does that per fold.

Here is what happens when preprocessing sees the whole dataset first — using **pure random noise**, where the honest accuracy is 50% by construction:

```python
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline

rng = np.random.default_rng(0)
X = rng.normal(size=(100, 5000))    # pure noise
y = rng.integers(0, 2, size=100)    # random labels -> true accuracy is 50%

# WRONG: features selected using ALL the data, then cross-validated
Xs = SelectKBest(f_classif, k=20).fit_transform(X, y)
print("leaky  CV accuracy:", round(cross_val_score(
    LogisticRegression(max_iter=2000), Xs, y, cv=5).mean(), 3))      # 0.85

# RIGHT: selection happens inside the pipeline, refit per fold
pipe = Pipeline([("sel", SelectKBest(f_classif, k=20)),
                 ("clf", LogisticRegression(max_iter=2000))])
print("honest CV accuracy:", round(cross_val_score(pipe, X, y, cv=5).mean(), 3))   # 0.48
```

**85% accuracy on data that contains no signal whatsoever.** That is what leakage looks like: not a crash, a *great-looking number* that evaporates in production. The pipeline version reports 48% — correctly identifying that there is nothing to learn.

### Mixed data types — `ColumnTransformer`

Real tables have numeric and categorical columns needing different treatment. `ColumnTransformer` routes each group to its own preprocessing.

```python
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier

df = pd.DataFrame({
    "age":    [25, 32, 47, 51, 62, 28, 40, 35, 29, 55],
    "income": [50, 64, None, 82, 90, 45, 70, None, 52, 88],
    "city":   ["ldn", "nyc", "ldn", "sf", "nyc", "sf", "ldn", "nyc", "sf", "ldn"],
    "churn":  [0, 0, 1, 1, 1, 0, 1, 0, 0, 1],
})
X, y = df.drop(columns="churn"), df["churn"]

pre = ColumnTransformer([
    ("num", Pipeline([("impute", SimpleImputer(strategy="median")),
                      ("scale",  StandardScaler())]), ["age", "income"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["city"]),
])
pipe = Pipeline([("pre", pre),
                 ("clf", RandomForestClassifier(n_estimators=50, random_state=0))])
pipe.fit(X, y)
print(list(pipe.named_steps["pre"].get_feature_names_out()))
# ['num__age', 'num__income', 'cat__city_ldn', 'cat__city_nyc', 'cat__city_sf']
```

`handle_unknown="ignore"` matters in production: a city the model never saw during training would otherwise raise at predict time. Persist the **whole pipeline**, never just the model — `joblib.dump(pipe, "model.joblib")` — so the exact preprocessing travels with it.

### A complete unsupervised workflow

```python
import numpy as np
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

X, _ = load_iris(return_X_y=True)
Xs = StandardScaler().fit_transform(X)   # scaling is MANDATORY for distance-based methods

km = KMeans(n_clusters=3, n_init=10, random_state=42).fit(Xs)
print("cluster sizes:", np.bincount(km.labels_).tolist())    # [53, 50, 47]

for k in range(2, 6):                    # choose k by silhouette, not by eye
    labels = KMeans(n_clusters=k, n_init=10, random_state=42).fit_predict(Xs)
    print(f"  k={k} silhouette={silhouette_score(Xs, labels):.3f}")
#   k=2 silhouette=0.582
#   k=3 silhouette=0.460
#   k=4 silhouette=0.387
#   k=5 silhouette=0.346

p = PCA(n_components=2).fit(Xs)
print("explained variance:", p.explained_variance_ratio_.round(3).tolist())   # [0.73, 0.229]
print("total:", round(p.explained_variance_ratio_.sum(), 3))                  # 0.958
```

Note the honest result: **silhouette prefers k=2, even though iris has 3 species.** Two of the three species overlap heavily, so the geometry really does look like two clusters. That is the standard lesson of unsupervised learning — the metric measures *cluster separation*, not *correctness*, because there are no labels to be correct against. Use it to narrow candidates, then apply domain knowledge.

PCA reports that 2 components retain **95.8%** of the variance in 4 dimensions — enough to plot the data honestly in 2-D.

> **Which algorithm should you actually pick?** That question is [Ch 27 Part 6](#content/27_practical_ml) (eight supervised algorithms with trade-offs) and [Part 7](#content/27_practical_ml) (clustering), plus [Ch 13 — Model Evaluation](#content/13_model_evaluation) for metrics beyond accuracy. This section deliberately teaches the *harness*, not the algorithm zoo.

> **Interview —** *"How do you make sure your reported accuracy is real?"*
>
> **Say:**
> - **Split before you touch anything** — all preprocessing is fitted on train only, which is what a `Pipeline` enforces structurally.
> - **Cross-validate** rather than trusting one split, and report the spread alongside the mean.
> - **Stratify** the split on the target, so class balance is preserved.
> - **Pick the metric before looking at results** — accuracy is misleading on imbalanced data; use precision/recall/AUC as the problem demands.
>
> **They follow up with:** *"Where does leakage sneak in even with a pipeline?"* — Time-series data, where a random split lets the model see the future (use `TimeSeriesSplit`); duplicate or near-duplicate rows spanning both sides of the split; and features computed from the full dataset *before* splitting, like a group-level average or a target encoding.

---

## 40.6 LLMs via Azure OpenAI ★★★

**In this section**

- What Azure adds over calling OpenAI directly — and the four concepts that confuse everyone
- Chat, streaming, JSON output and embeddings
- Retries, token budgets and cost control

> ℹ️ **These blocks need network access and API keys**, so pressing Run shows a "copy this locally" note rather than executing. Install with `pip install openai` — the same SDK serves both OpenAI and Azure.

#### Simple Explanation

Azure OpenAI is the **same models, re-hosted inside your company's cloud tenancy**. The model weights are identical; what changes is everything around them — who holds the data, which region it is processed in, how you authenticate, and who you pay.

That single difference is why it exists. A bank cannot send customer data to a US endpoint when regulation requires it stay in-region, but it can run the same model in an Azure region it controls, under its existing enterprise agreement and identity system.

The practical consequence for your code is small but sharp: you don't ask for a *model*, you ask for a **deployment** — a named instance of a model that you (or your platform team) created in a specific region.

### The four concepts that trip everyone up

| Concept | What it is | Gotcha |
|---|---|---|
| **Resource** | your Azure OpenAI instance, in one region | gives you the endpoint URL |
| **Deployment name** | the name *you* chose when deploying a model | you pass **this**, not `"gpt-4o"` — the #1 error |
| **Endpoint** | `https://<resource>.openai.azure.com/` | region-specific; wrong region = wrong data residency |
| **API version** | a dated string, e.g. `2024-10-21` | pinned per feature; new features need newer versions |

| | OpenAI direct | Azure OpenAI |
|---|---|---|
| Client | `OpenAI()` | `AzureOpenAI()` |
| You pass | `model="gpt-4o"` | `model="<your-deployment-name>"` |
| Auth | API key | API key **or** Entra ID (managed identity) |
| Newest models | day one | weeks later |
| Data residency | provider-controlled | **you pin the region** |

### Setup and the first call

Never hardcode a key. Read it from the environment, and in production prefer **managed identity** so there is no key to leak at all.

```python
import os
from openai import AzureOpenAI

client = AzureOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],   # https://<resource>.openai.azure.com/
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version="2024-10-21",
)

resp = client.chat.completions.create(
    model=os.environ["AZURE_OPENAI_DEPLOYMENT"],   # DEPLOYMENT name, not model name
    messages=[
        {"role": "system", "content": "You are a terse assistant. Answer in one sentence."},
        {"role": "user",   "content": "What is a confusion matrix?"},
    ],
    temperature=0.2,
    max_tokens=200,
)

print(resp.choices[0].message.content)
print(resp.usage.prompt_tokens, resp.usage.completion_tokens, resp.usage.total_tokens)
```

The keyless version, which is what you want in production:

```python
import os
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from openai import AzureOpenAI

token_provider = get_bearer_token_provider(
    DefaultAzureCredential(), "https://cognitiveservices.azure.com/.default")

client = AzureOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    azure_ad_token_provider=token_provider,     # no API key anywhere
    api_version="2024-10-21",
)
```

The three message roles, which are the whole prompt API:

- **`system`** — persistent instructions: tone, format, constraints. Set once, first.
- **`user`** — the actual request.
- **`assistant`** — previous replies. **The API is stateless**, so multi-turn chat means resending the whole list each time; that is also why cost grows with conversation length.

Two parameters do most of the work: **`temperature`** (0 for extraction and classification where you want determinism, 0.7–1.0 for creative writing) and **`max_tokens`** (a hard cap on the reply — your primary defence against a runaway bill).

### Streaming

Set `stream=True` and you get chunks as they are generated. Total time is the same; *perceived* latency is far lower, which is why every chat UI does it.

```python
import os
from openai import AzureOpenAI

client = AzureOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version="2024-10-21",
)

stream = client.chat.completions.create(
    model=os.environ["AZURE_OPENAI_DEPLOYMENT"],
    messages=[{"role": "user", "content": "List three uses of PCA."}],
    stream=True,
)
for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

Note the guard: some chunks carry no content (role announcements, the final stop chunk), so `chunk.choices[0].delta.content` can be `None`. Skipping that check is the most common streaming bug.

### Structured output — getting JSON you can trust

Asking politely for JSON gets you JSON *most* of the time, which is not good enough for a pipeline. Two mechanisms make it reliable:

```python
import os, json
from openai import AzureOpenAI

client = AzureOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version="2024-10-21",
)

resp = client.chat.completions.create(
    model=os.environ["AZURE_OPENAI_DEPLOYMENT"],
    messages=[
        {"role": "system", "content": "Extract entities. Reply with JSON only."},
        {"role": "user",   "content": "Ada Lovelace worked in London in 1843."},
    ],
    response_format={"type": "json_object"},    # JSON mode: output is guaranteed parseable
    temperature=0,
)
try:
    data = json.loads(resp.choices[0].message.content)
    print(data)
except json.JSONDecodeError:
    print("model returned unparseable JSON — decide what to do here")
```

- **JSON mode** (`{"type": "json_object"}`) guarantees *syntactically valid* JSON — but not your schema. The word "JSON" must appear in your prompt, and you should still validate the parsed result.
- **Structured outputs** (`{"type": "json_schema", ...}`, newer API versions) guarantee the output matches a **schema you supply**, so fields and types are enforced. Prefer this when available; pair it with a Pydantic model and you get validated Python objects.

Either way: **wrap the `json.loads` in a `try/except`** and decide what a malformed reply should do. It will happen eventually.

### Embeddings

Embeddings turn text into vectors whose distance means semantic similarity — the foundation of search, clustering and RAG.

```python
import os
import numpy as np
from openai import AzureOpenAI

client = AzureOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version="2024-10-21",
)

emb = client.embeddings.create(
    model=os.environ["AZURE_OPENAI_EMBED_DEPLOYMENT"],   # e.g. text-embedding-3-small
    input=["a dog on the beach", "a puppy by the sea", "quarterly revenue report"],
)
vecs = np.array([d.embedding for d in emb.data])
print(vecs.shape)                           # (3, 1536)

def cosine(a, b):
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

print(round(cosine(vecs[0], vecs[1]), 3))   # ~0.8  — near-synonyms
print(round(cosine(vecs[0], vecs[2]), 3))   # ~0.1  — unrelated
```

Three practical points: **batch your inputs** (pass a list — one request beats N requests by a wide margin), **embeddings are far cheaper than chat** (usually orders of magnitude), and **you cannot mix models** — vectors from different embedding models are not comparable, so changing the model means re-embedding your whole corpus.

That distance function is exactly the retrieval step of RAG: embed the documents once, embed the question at query time, return the nearest chunks, and paste them into the prompt. [Ch 28 — Building Semantic Search](#content/28_semantic_search) builds the full pipeline.

### Errors, retries and cost

Production LLM code is mostly error handling. Rate limits are normal traffic, not exceptions.

```python
import os, time, random
from openai import AzureOpenAI, RateLimitError, APIError

client = AzureOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version="2024-10-21",
)

def ask(messages, retries=5):
    for attempt in range(retries):
        try:
            return client.chat.completions.create(
                model=os.environ["AZURE_OPENAI_DEPLOYMENT"],
                messages=messages, timeout=30, max_tokens=500,
            )
        except RateLimitError:
            wait = (2 ** attempt) + random.random()     # exponential backoff + jitter
            print(f"429, retrying in {wait:.1f}s")
            time.sleep(wait)
        except APIError as e:
            if attempt == retries - 1:
                raise
            print(f"transient API error: {e}")
    raise RuntimeError("exhausted retries")
```

| Failure | Meaning | Response |
|---|---|---|
| `429 RateLimitError` | over your quota (TPM/RPM) | exponential backoff **with jitter** — never a fixed sleep |
| `400 BadRequest` | bad input, or content filter | don't retry; fix the request |
| `401 / 403` | bad key, or missing role assignment | check credentials, not code |
| `500 / 503` | transient service error | retry a few times, then fail loudly |
| Context-length error | prompt + reply exceed the window | truncate history, or summarise it |

Five habits that control spend:

- **Set `max_tokens` on every call.** It is a hard ceiling on the expensive half of the bill.
- **Route by difficulty** — a small cheap model handles most traffic; escalate only hard cases.
- **Cache** repeated prompts. Identical questions should not be paid for twice.
- **Trim conversation history** — summarise old turns instead of resending everything forever.
- **Log `resp.usage`** per call. You cannot manage a cost you are not measuring.

> **Interview —** *"Why would a team choose Azure OpenAI over calling OpenAI directly?"*
>
> **Say:**
> - **Data residency and compliance** — you pin the region, so prompts and completions stay where regulation requires.
> - **Enterprise identity** — Entra ID and managed identity mean no API keys in config, plus existing RBAC and audit trails.
> - **Commercial and operational fit** — it lands on the existing Azure agreement, with private networking and provisioned throughput available.
> - The honest trade-off: **new models arrive later** than on the frontier API, and you manage deployments and quota yourself.
>
> **They follow up with:** *"What actually changes in the code?"* — Very little. Same SDK, but `AzureOpenAI` instead of `OpenAI`, plus an endpoint and `api_version` — and `model=` takes your **deployment name**, not the model name. That last one is the mistake everybody makes once.

---

## Key Takeaways

```
╔════════════════════════════════════════════════════════════════╗
║  PYTHON FOR ML & AI — WHAT TO REMEMBER                         ║
║  ────────────────────────────────────────────────────────────  ║
║  NUMPY                                                         ║
║  Never loop over an array — vectorise (~12x faster at 1M)      ║
║  shape is your debugger: print it first when something breaks  ║
║  axis=n is the dimension that DISAPPEARS (axis=0 = per column) ║
║  Masks use & and |, each side parenthesised — not and/or       ║
║  A slice is a VIEW, not a copy. Use .copy() for independence   ║
║  ────────────────────────────────────────────────────────────  ║
║  PANDAS                                                        ║
║  .loc = labels, .iloc = integer positions                      ║
║  df["c"] -> Series;  df[["c"]] -> DataFrame                    ║
║  Vectorise instead of .apply(axis=1) — 10-100x faster          ║
║  SettingWithCopyWarning is a real bug: add .copy()             ║
║  First four commands: shape, head, info, describe              ║
║  ────────────────────────────────────────────────────────────  ║
║  SCIKIT-LEARN                                                  ║
║  One API: fit / predict / transform / fit_transform            ║
║  X is 2-D (n_samples, n_features); y is 1-D                    ║
║  fit_transform on TRAIN, transform only on TEST                ║
║  Pipeline is the structural fix for leakage — not a nicety     ║
║  Leakage demo: 85% accuracy on pure noise vs 48% honest        ║
║  Always random_state (reproducible) + stratify (balance)       ║
║  Persist the whole PIPELINE, never just the model              ║
║  ────────────────────────────────────────────────────────────  ║
║  AZURE OPENAI                                                  ║
║  model= takes your DEPLOYMENT name, not "gpt-4o"               ║
║  Same SDK: AzureOpenAI() + endpoint + api_version              ║
║  Keys from env; managed identity in prod — never hardcode      ║
║  The API is STATELESS — resend history, so cost grows          ║
║  429 is normal: exponential backoff WITH jitter                ║
║  Always max_tokens; log resp.usage; cache; route by difficulty ║
║  Batch embeddings; never mix embedding models                  ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Review Questions

**1.** Your model scores 95% in cross-validation and 60% in production. Name the three most likely causes.

<details>
<summary>Answer</summary>

**Leakage** is the first suspect: preprocessing (scaling, imputation, feature selection, target encoding) fitted on the full dataset before splitting, so the model saw test information during training. The fix is structural — put every step inside a `Pipeline`, which refits per fold.

**Distribution shift** is second: production data no longer resembles the training set, whether from seasonality, a changed upstream source, or a population the training data never contained.

**A wrong or unrepresentative split** is third — a random split on time-series data lets the model see the future (`TimeSeriesSplit` fixes it), and duplicate rows spanning train and test inflate the score the same way.

The noise demo in §40.5 shows the magnitude: leakage produced **85%** accuracy on data with no signal at all, where the honest answer was 48%.
</details>

**2.** What is the difference between `.loc` and `.iloc`, and why does it only bite you later?

<details>
<summary>Answer</summary>

`.loc` selects by **label** (the index value); `.iloc` selects by **integer position**.

On a freshly built DataFrame the index is `0, 1, 2, …`, so label and position are identical and the two appear interchangeable. The moment you filter, sort, or concatenate, the index keeps its original labels while positions renumber — now `df.loc[0]` and `df.iloc[0]` can return different rows, and code that guessed right by accident starts returning wrong data silently.

A related trap: `.loc` slices are **inclusive** of the endpoint (`df.loc[0:2]` gives three rows), whereas `.iloc` follows normal Python half-open slicing (`df.iloc[0:2]` gives two).
</details>

**3.** Why must `fit_transform` be used on the training set but only `transform` on the test set?

<details>
<summary>Answer</summary>

`fit` is what *learns the parameters* — a `StandardScaler` learns the mean and standard deviation, a `SimpleImputer` learns the median, an encoder learns the category list. `transform` merely applies them.

Calling `fit_transform` on the test set would learn a *new* mean and standard deviation from test data, which does two bad things: it leaks test information into your pipeline, and it scales the two sets differently, so the model receives features on a different scale than it trained on.

In practice, put the steps in a `Pipeline` and the question disappears — `pipe.fit(X_train, y_train)` fits every step on training data, and `pipe.predict(X_test)` calls only `transform` on the way through.
</details>

**4.** You call Azure OpenAI with `model="gpt-4o"` and get a 404. What's wrong?

<details>
<summary>Answer</summary>

On Azure, `model=` takes the **deployment name** — the label chosen when the model was deployed into your resource — not the underlying model name. If the deployment is called `prod-chat`, then `model="prod-chat"` is correct and `model="gpt-4o"` is a 404 unless someone happened to name the deployment identically.

This is the single most common Azure OpenAI error, and it exists because a resource can host several deployments of the same model with different quotas, regions or content-filter settings, so the deployment is the real addressable unit.

Worth checking alongside it: the `azure_endpoint` must be your resource's URL (`https://<resource>.openai.azure.com/`), and `api_version` must be recent enough for the features you are using — an older version returns an error for newer parameters like `json_schema` structured outputs.
</details>

---

**Next:** [Ch 27 — Practical ML](#content/27_practical_ml) for the algorithm deep dives, [Ch 28 — Semantic Search](#content/28_semantic_search) to build a full RAG pipeline, or [Ch 39 — Python Refresher](#content/39_python_refresher) for the language itself.
