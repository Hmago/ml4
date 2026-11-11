# Practical Machine Learning — From Zero to Production

> "The best way to learn ML is to DO ML. Theory without practice is useless.
> Practice without theory is dangerous."

**What this document covers:**
A hands-on guide to building ML models — from installing Python to training, evaluating, deploying and monitoring them — organized from beginner to advanced.

> ▶ Blocks that use NumPy, pandas, scikit-learn or matplotlib run in your browser (older sandbox versions; each **Output:** is exactly what they print). Blocks starting `# Runs locally:` need your own machine.

---

## What You'll Learn

After working through this guide, you will be able to:
- Set up a clean ML environment (uv or venv + pip)
- Load datasets from scikit-learn, files, Kaggle, Hugging Face and more
- Explore and visualize data to understand its structure
- Preprocess data (handle missing values, encode, scale)
- Train and evaluate 10+ ML algorithms with real code
- Tune hyperparameters (grid search, random search, Optuna)
- Build end-to-end ML pipelines
- Debug common ML problems (overfitting, data leakage, class imbalance)
- Train basic neural networks with PyTorch and Keras 3
- Save, serve and monitor models in production

---

## Table of Contents

| Part | Topic | Difficulty |
|------|-------|-----------|
| 1 | Environment Setup & Installation | Beginner |
| 2 | Loading & Downloading Datasets | Beginner |
| 3 | Exploratory Data Analysis (EDA) | Beginner |
| 4 | Data Preprocessing (Complete Guide) | Beginner-Intermediate |
| 5 | Your First ML Model (Step by Step) | Beginner |
| 6 | Supervised Learning Algorithms (8 algorithms + comparison) | Intermediate |
| 7 | Unsupervised Learning (K-Means, PCA, DBSCAN, Silhouette) | Intermediate |
| 8 | Model Evaluation (Metrics, CV, Learning Curves, Imbalance) | Intermediate |
| 9 | Hyperparameter Tuning (Grid, Random Search, Optuna) | Intermediate |
| 10 | Feature Engineering (with runnable examples) | Intermediate-Advanced |
| 11 | ML Pipelines (Production-Ready Code) | Intermediate-Advanced |
| 12 | Neural Networks (PyTorch + Keras 3) | Advanced |
| 13 | End-to-End Projects (Classification + Regression) | All Levels |
| 14 | Common Errors & Debugging Guide | All Levels |
| 15 | Algorithm Selection Cheat Sheet | Reference |
| 16 | Saving & Loading Models | Reference |
| 17 | Progressive Practice Challenges (10 projects) | All Levels |
| 18 | From Notebook to Production (MLOps) | Advanced |

---

# PART 1: ENVIRONMENT SETUP & INSTALLATION

---

## 1.1 What You Need

![Cheat card for setting up a clean ML environment: the rule of one isolated environment per project with Python 3.13 as the safe pick as of Nov 2026 because TensorFlow 2.21 wheels stop at 3.13; a stack of the five libraries to install now (NumPy, pandas, matplotlib, scikit-learn, JupyterLab) plus boosting libraries for Part 6 and PyTorch and Keras 3 for Part 12; four routes: uv (recommended: uv init, uv add, uv run), venv plus pip, conda via Miniforge, and Google Colab; a GPU check with nvidia-smi and torch.cuda.is_available() returning True; and the trap that ModuleNotFoundError after installing means pip used another Python.](diagrams/pml27_info_environment_setup_ai.png)

<details>
<summary><strong>Read as text</strong> — the five libraries to install now, the ones that come later, and TensorFlow's status</summary>

Five libraries cover almost all classic ML; add the rest when a later Part needs them.

| Library | Job | Install |
|---|---|---|
| **NumPy** | maths on arrays | now |
| **pandas** | tables: load, clean, group, join | now |
| **matplotlib** | plots | now |
| **scikit-learn** | classic models, preprocessing, metrics | now |
| **JupyterLab** | notebooks | now |
| **XGBoost / LightGBM / CatBoost** | gradient boosting for tables | Part 6 |
| **PyTorch**, **Keras 3** | neural networks | Part 12 |

As of Nov 2026 TensorFlow is in maintenance mode; Google recommends Keras 3, JAX or PyTorch for new work.

**Go deeper:** [Ch 40 §40.1](#content/40_python_ml_ai) (the library map) · [Ch 30 §3.4](#content/30_google_ml_ecosystem) (TensorFlow vs JAX vs PyTorch)

</details>

---

## 1.2 Installation — Step by Step

<details>
<summary><strong>Read as text</strong> — one environment per project, and why Python 3.13 is the safe pick</summary>

Use **one isolated environment per project**, and the newest Python all your libraries support. As of Nov 2026 that is **3.13**: Python 3.15 is out, but TensorFlow 2.21 ships wheels only up to 3.13 (CatBoost: 3.14).

</details>

### Option A: uv (recommended — fast, and it installs Python for you)

<details>
<summary><strong>Read as text</strong> — the uv commands: init, add, run</summary>

```bash
# Install uv once — Windows: powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
#                   macOS/Linux: curl -LsSf https://astral.sh/uv/install.sh | sh
uv init ml-project --python 3.13              # fetches Python 3.13 if missing
cd ml-project
uv add numpy pandas matplotlib scikit-learn   # pins versions in pyproject.toml + uv.lock
uv run python train.py                        # runs in the project's .venv
uv run --with jupyter jupyter lab
```

</details>

### Option B: venv + pip (built into Python)

<details>
<summary><strong>Read as text</strong> — the venv + pip commands and requirements.txt</summary>

```bash
python -m venv .venv                          # with Python 3.13 from python.org
.venv\Scripts\activate                        # macOS/Linux: source .venv/bin/activate
python -m pip install numpy pandas matplotlib scikit-learn jupyterlab
python -m pip freeze > requirements.txt       # commit this file, never .venv
jupyter lab
```

</details>

### Option C: conda (optional — for non-Python binaries)

<details>
<summary><strong>Read as text</strong> — Miniforge commands and the Anaconda licence note</summary>

```bash
# Miniforge = conda with the free conda-forge channel
conda create -n ml -c conda-forge python=3.13 numpy pandas matplotlib scikit-learn jupyterlab
conda activate ml
```

Anaconda's own `defaults` channel is paid for companies with more than 200 employees (as of Nov 2026).

</details>

### Option D: Google Colab (zero install)

<details>
<summary><strong>Read as text</strong> — what Colab gives you and its 12-hour limit</summary>

[Colab](https://colab.research.google.com): a free hosted notebook, libraries preinstalled, GPUs/TPUs when available. Sessions last at most 12 hours and idle machines are wiped — save to Google Drive.

</details>

### Later: boosting, deep learning, GPU check

<details>
<summary><strong>Read as text</strong> — installing boosting and PyTorch, and the one-line GPU check</summary>

```bash
uv add xgboost lightgbm catboost      # Part 6
uv add torch                          # Part 12; NVIDIA GPU build: use the command from pytorch.org/get-started
nvidia-smi                                                   # does the driver see an NVIDIA GPU?
python -c "import torch; print(torch.cuda.is_available())"   # True = PyTorch can use it
```

On Apple Silicon check `torch.backends.mps.is_available()`. TensorFlow's GPU support on native Windows ended with 2.10 — use WSL2.

</details>

### Verify Everything Works

```python
# Smoke test: the core libraries import and a bundled dataset loads (versions vary, so no fixed output)
import matplotlib
import numpy
import pandas
import sklearn
from sklearn.datasets import load_iris

for lib in (numpy, pandas, sklearn, matplotlib):
    print(f"{lib.__name__:<11} {lib.__version__}")
X, y = load_iris(return_X_y=True)
assert X.shape == (150, 4)
print("Setup OK")
```

<details>
<summary><strong>Read as text</strong> — continued: the ModuleNotFoundError trap</summary>

**Trap:** a `ModuleNotFoundError` right after installing means pip used another Python — activate the env, or use `python -m pip` / `uv run`.

**Go deeper:** [Ch 40 §40.1](#content/40_python_ml_ai) (reproducible environments) · [Ch 39 §39.1](#content/39_python_refresher) (Python versions)

</details>

---

# PART 2: LOADING & DOWNLOADING DATASETS

---

## 2.1 Where to Get Datasets

![Cheat card on where datasets come from and how to load them: a source map of six loaders with what they need, where only scikit-learn load_* datasets work offline and fetch_*, OpenML, Kaggle (kagglehub plus a token), Hugging Face Hub (load_dataset) and UCI (fetch_ucirepo) need the internet; the bundled dataset sizes (iris 150 x 4, wine 178 x 13, breast_cancer 569 x 30, digits 1797 x 64, diabetes 442 x 10); a read_csv before and after example where dtype keeps the zip code 02134 and na_values turns the question mark into nan; the Kaggle token steps; and the traps that NA counts as missing by default and load_boston was removed in scikit-learn 1.2.](diagrams/pml27_info_loading_datasets_ai.png)

<details>
<summary><strong>Read as text</strong> — nine data sources, their loaders, and which ones work offline</summary>

| Source | Load it with | Note |
|---|---|---|
| scikit-learn `load_*` | `load_iris(as_frame=True)` | bundled, works offline |
| scikit-learn `fetch_*` | `fetch_california_housing()` | downloaded once, then cached |
| OpenML | `fetch_openml("titanic", version=1)` | curated tables with fixed IDs |
| Kaggle | `kagglehub.dataset_download("owner/name")` | real-world data, competitions |
| Hugging Face Hub | `load_dataset("stanfordnlp/imdb")` | text, image and audio |
| UCI ML Repository | `fetch_ucirepo(id=2)` | classic academic tables |
| seaborn | `sns.load_dataset("titanic")` | small demo tables |
| Google Dataset Search | datasetsearch.research.google.com | finds data anywhere |
| Your own files | `pd.read_csv(...)`, `pd.read_parquet(...)` | most real work |

Only bundled `load_*` data works in the ▶ Run sandbox (no network).

</details>

---

## 2.2 Loading Datasets — Code for Every Source

### Method 1: Scikit-learn Built-in Datasets (easiest)

```python
# Bundled datasets ship inside scikit-learn: no download, and they load in this app too
import pandas as pd                      # as_frame=True returns pandas objects
from sklearn.datasets import (load_breast_cancer, load_diabetes, load_digits,
                              load_iris, load_wine, make_classification)

for loader in [load_iris, load_wine, load_breast_cancer, load_digits, load_diabetes]:
    X, y = loader(return_X_y=True)
    print(f"{loader.__name__:<19} {X.shape[0]:>5} rows x {X.shape[1]:>2} features")

df = load_iris(as_frame=True).frame      # features + target in one DataFrame
print("iris frame:", df.shape, "| rows per class:", df["target"].value_counts().sort_index().tolist())

X, y = make_classification(n_samples=1000, n_features=20, n_informative=10,
                           weights=[0.9, 0.1], random_state=42)
print(f"make_classification: {X.shape[0]} rows, {y.mean():.1%} positives")
assert df.shape == (150, 5)
```

**Output:**

```
load_iris             150 rows x  4 features
load_wine             178 rows x 13 features
load_breast_cancer    569 rows x 30 features
load_digits          1797 rows x 64 features
load_diabetes         442 rows x 10 features
iris frame: (150, 5) | rows per class: [50, 50, 50]
make_classification: 1000 rows, 10.3% positives
```

<details>
<summary><strong>Read as text</strong> — continued: regression vs classification sets, and the load_boston trap</summary>

`load_diabetes` is regression. `weights=[0.9, 0.1]` gives ~10% positives (10.3%: `flip_y` relabels 1% at random).

> ⚠️ **`load_boston` is gone** — removed in scikit-learn 1.2 over an ethically problematic feature. Use `fetch_california_housing` or `load_diabetes`.

</details>

### Method 2: Load from CSV / Excel / Parquet

```python
# read_csv knobs on a tiny in-memory CSV (the same call works on a file path or a URL)
import io
import pandas as pd

raw = "id;zip;signup;age;plan\n1;02134;2026-01-05;34;pro\n2;94105;2026-02-11;?;free\n3;00501;2026-03-20;29;NA\n"
naive = pd.read_csv(io.StringIO(raw), sep=";")
df = pd.read_csv(io.StringIO(raw), sep=";", na_values=["?"], dtype={"zip": str}, parse_dates=["signup"])
print("zip    :", naive["zip"].tolist(), "->", df["zip"].tolist())
print("age    :", naive["age"].tolist(), "->", df["age"].tolist())
print("missing:", df.isna().sum().to_dict())
print("month  :", df["signup"].dt.month.tolist())
assert df["zip"].tolist()[0] == "02134"
```

**Output:**

```
zip    : [2134, 94105, 501] -> ['02134', '94105', '00501']
age    : ['34', '?', '29'] -> [34.0, nan, 29.0]
missing: {'id': 0, 'zip': 0, 'signup': 0, 'age': 1, 'plan': 1}
month  : [1, 2, 3]
```

<details>
<summary><strong>Read as text</strong> — continued: the four read_csv knobs, and Excel / Parquet</summary>

| Knob | Why |
|---|---|
| `dtype={"zip": str}` | keeps leading zeros |
| `na_values=["?"]` | extra missing markers (one `?` made `age` text) |
| `keep_default_na=False` | keeps a real "NA" (missing by default — see `plan`) |
| `parse_dates=["signup"]` | real dates, so `.dt.month` works |

Excel: `pd.read_excel` (needs `openpyxl`). Parquet, the usual big-data format: `pd.read_parquet` (needs `pyarrow`).

</details>

### Method 3: Download from Kaggle, OpenML, Hugging Face and UCI

<details>
<summary><strong>Read as text</strong> — download code for OpenML, Kaggle, Hugging Face and UCI, and the Kaggle token</summary>

```python
# Runs locally (internet + a Kaggle token): pip install kagglehub datasets ucimlrepo scikit-learn pandas
import pandas as pd
import kagglehub
from datasets import load_dataset
from sklearn.datasets import fetch_openml
from ucimlrepo import fetch_ucirepo

titanic = fetch_openml("titanic", version=1, as_frame=True).frame     # OpenML id 40945: 1,309 rows, cached

# Kaggle (for a competition, accept its rules on kaggle.com first)
fraud = pd.read_csv(kagglehub.dataset_download("mlg-ulb/creditcardfraud") + "/creditcard.csv")   # 284,807 rows
train = pd.read_csv(kagglehub.competition_download("titanic", path="train.csv"))                 # 891 rows

imdb = load_dataset("stanfordnlp/imdb", split="train").to_pandas()   # Hugging Face: 25,000 reviews

adult = fetch_ucirepo(id=2)                                          # UCI Adult income: 48,842 rows
X, y = adult.data.features, adult.data.targets
```

**Kaggle token:** kaggle.com → Settings → API → *Generate New Token*; save it as `~/.kaggle/access_token` or in `KAGGLE_API_TOKEN` (old `kaggle.json` keys still work). Never commit it.

</details>

### Recommended Starter Datasets (by difficulty)

<details>
<summary><strong>Read as text</strong> — eight starter datasets from beginner to advanced</summary>

| Level | Dataset (task) | Size | Where |
|---|---|---|---|
| Beginner | Iris (3 classes) | 150 rows | `load_iris` |
| Beginner | Penguins (3 classes) | 344 rows, 11 with gaps | seaborn |
| Beginner | Tips (regression) | 244 rows | seaborn |
| Intermediate | Titanic (survival) | 891 rows (1,309 on OpenML) | Kaggle, seaborn |
| Intermediate | California Housing (regression) | 20,640 rows | `fetch_california_housing` |
| Advanced | Adult Income (income > 50K?) | 48,842 rows | UCI, OpenML |
| Advanced | MNIST (digit images) | 70,000 | `fetch_openml("mnist_784")` |
| Advanced | Credit Card Fraud (imbalanced) | 284,807 rows, 0.17% fraud | Kaggle |

**Go deeper:** [Ch 40 §40.3](#content/40_python_ml_ai) (pandas)

</details>

---

# PART 3: EXPLORATORY DATA ANALYSIS (EDA)

> **Exploratory data analysis (EDA)**: counting, summarizing and plotting data to learn its structure and problems *before* modelling (John Tukey, 1977).

---

## 3.1 The First 10 Commands You Should Always Run

![Cheat card for the EDA first look: ten numbered questions with their pandas commands, from df.shape for how big to df.corr(numeric_only=True) for which numbers move together; a worked Titanic table comparing 12 real rows with all 891 rows (age missing 25% vs 19.9%, deck missing 75% vs 77.2% so drop deck, duplicate rows 1 vs 107, survived 58.3% vs 38.4%, women and men survival 1.00 and 0.00 vs 74.2% and 18.9%); and three traps: look-alike duplicates may be real passengers, pandas 3 stores text as str so select it with exclude number, and seaborn's alive column leaks the target.](diagrams/pml27_info_eda_first_look_ai.png)

<details>
<summary><strong>Read as text</strong> — the ten questions and the command that answers each</summary>

| Question | Command |
|---|---|
| How big? | `df.shape` |
| What does a row look like? | `df.head()` |
| Types, non-null counts? | `df.info()` (text is `str` in pandas 3, `object` in pandas 2) |
| Ranges and odd values? | `df.describe()` |
| Where are the holes? | `df.isna().sum()` |
| Duplicate rows? | `df.duplicated().sum()` |
| Is the target balanced? | `df["target"].value_counts(normalize=True)` |
| Text columns? | `df.select_dtypes(exclude="number")` |
| Does a category move the target? | `df.groupby(col)["target"].mean()` |
| Which numbers move together? | `df.corr(numeric_only=True)` (§3.2) |

</details>

```python
# EDA first look: 12 real Titanic rows (seaborn's copy: rows 0-9, 32 and 47)
import numpy as np
import pandas as pd

nan = np.nan
df = pd.DataFrame({
    "survived": [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
    "sex":  list("MFFFMMMMFFFF"),                     # M = male, F = female
    "age":  [22, 38, 26, 35, 35, nan, 54, 2, 27, 14, nan, nan],
    "deck": [nan, "C", nan, "C", nan, nan, "E", nan, nan, nan, nan, nan],
})

print(f"Shape: {df.shape[0]} rows x {df.shape[1]} columns")
print("Text columns:", df.select_dtypes(exclude="number").columns.tolist())   # pandas 2 and 3
missing = df.isna().sum()
for col, n in missing[missing > 0].items():
    print(f"Missing {col}: {n} of {len(df)} ({n / len(df):.0%})")
print("Duplicate rows:", df.duplicated().sum())
print(f"Target: {df['survived'].mean():.1%} survived")
by_sex = df.groupby("sex")["survived"].mean()
print("Survival by sex:", ", ".join(f"{k} {v:.2f}" for k, v in by_sex.items()))
print("deck values:", ", ".join(sorted(df["deck"].dropna().unique())))
assert df.duplicated().sum() == 1
```

**Output:**

```
Shape: 12 rows x 4 columns
Text columns: ['sex', 'deck']
Missing age: 3 of 12 (25%)
Missing deck: 9 of 12 (75%)
Duplicate rows: 1
Target: 58.3% survived
Survival by sex: F 1.00, M 0.00
deck values: C, E
```

<details>
<summary><strong>Read as text</strong> — continued: the full 891 rows, and three traps (look-alike duplicates, leakage, pandas 3 text)</summary>

All 891 rows, less extreme: `age` 19.9% missing, `deck` 77.2% (drop it), 38.4% survived — women 74.2%, men 18.9%.

| Trap | Titanic example | Do |
|---|---|---|
| A duplicate may be real | 107 duplicates in the full data: different passengers who look alike without names (rows 32, 47) | drop only true repeats (same ID) |
| A column leaks the target | `alive` ("yes"/"no") is `survived` in words | drop anything unknown at prediction time |
| pandas 3 text dtype | text columns are `str`, not `object` | select with `exclude="number"` (`include="object"` is deprecated for them) |

**Go deeper:** [Ch 9 Step 1](#content/09_data_preprocessing) (missing values) · [Ch 8 §8.4](#content/08_core_concepts) (leakage)

</details>

---

## 3.2 Visualization — See Your Data

![Maths-style infographic on four EDA plots for the breast cancer data (569 rows, target 1 = benign): the Pearson correlation formula r = cov(x, y) / (sigma x times sigma y) with labelled parts and the 1.5 IQR outlier rule; a box-plot fence worked step by step (Q1 420.3, Q3 782.7, IQR 362.4, upper fence 1326.3, 25 outliers above 1326); a right-skewed histogram of mean area with median 551 left of mean 655 (skew 1.65, try np.log1p); to-scale bars of correlation with the target (worst concave points -0.79, mean radius -0.73, mean area -0.71, mean texture -0.42) and r(mean radius, mean area) = 0.99; a how-to-read table; and the parabola y = x squared where r = 0 although y depends fully on x.](diagrams/pml27_info_eda_visualization_ai.png)

<details>
<summary><strong>Read as text</strong> — the four plots, Pearson r and the 1.5·IQR outlier rule</summary>

Summary numbers hide shape. Four plots answer most questions: **histogram** (shape), **box plot** (outliers), **correlation heatmap** (what moves together), **scatter coloured by class** (what separates the classes).

> **Maths in one line:** `r = cov(x, y) / (σx · σy)` — Pearson correlation runs from −1 to +1 and sees only *straight-line* links; a box plot draws as dots every point below `Q1 − 1.5·IQR` or above `Q3 + 1.5·IQR` (IQR = Q3 − Q1).

</details>

```python
# EDA on the bundled breast-cancer data: the numbers, then the four plots
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.datasets import load_breast_cancer

df = load_breast_cancer(as_frame=True).frame        # 569 rows; target 0 = malignant, 1 = benign
cols = ["mean radius", "mean texture", "mean area", "worst concave points", "target"]
corr = df[cols].corr()
print("r with target:", ", ".join(f"{c} {v:+.2f}" for c, v in corr["target"].drop("target").items()))
print(f"r(mean radius, mean area) = {corr.loc['mean radius', 'mean area']:.2f}  <- near-duplicates")

area = df["mean area"]
q1, q3 = area.quantile([0.25, 0.75])
iqr = q3 - q1
outliers = ((area < q1 - 1.5 * iqr) | (area > q3 + 1.5 * iqr)).sum()
print(f"mean area: Q1 {q1:.0f}, Q3 {q3:.0f}, IQR {iqr:.0f} -> {outliers} outliers above {q3 + 1.5 * iqr:.0f}")
print(f"mean area: mean {area.mean():.0f} > median {area.median():.0f} (skew {area.skew():.2f})")
assert outliers == 25

fig, ax = plt.subplots(2, 2, figsize=(10, 8))
ax[0, 0].hist(area, bins=30)
ax[0, 0].set_title("Histogram: mean area")
ax[0, 1].boxplot([area[df["target"] == 0], area[df["target"] == 1]])
ax[0, 1].set_title("Box plot: mean area (left malignant, right benign)")
im = ax[1, 0].imshow(corr, cmap="coolwarm", vmin=-1, vmax=1)
ax[1, 0].set_xticks(range(len(cols)))
ax[1, 0].set_xticklabels(cols, rotation=90)
fig.colorbar(im, ax=ax[1, 0])
ax[1, 1].scatter(df["mean radius"], df["worst concave points"], c=df["target"], cmap="coolwarm", s=8)
ax[1, 1].set_title("Scatter: radius vs concave points, by class")
fig.tight_layout()
```

**Output:**

```
r with target: mean radius -0.73, mean texture -0.42, mean area -0.71, worst concave points -0.79
r(mean radius, mean area) = 0.99  <- near-duplicates
mean area: Q1 420, Q3 783, IQR 362 -> 25 outliers above 1326
mean area: mean 655 > median 551 (skew 1.65)
```

<details>
<summary><strong>Read as text</strong> — continued: why every r is negative here</summary>

Every r is negative because 1 means *benign*: big, irregular cells point to malignant. (Jupyter and this app draw the figure; a plain script needs `plt.show()`.)

</details>

### How to READ Your Visualizations

<details>
<summary><strong>Read as text</strong> — what to look for in each plot, and the low-r trap</summary>

| Plot | Look for | Then |
|---|---|---|
| Histogram | a long tail, two peaks | long right tail (mean 655 > median 551) → try `np.log1p` for linear models; two peaks → two populations? |
| Box plot | dots beyond the whiskers | typo → fix; real extreme → keep or cap |
| Heatmap | r near ±1 | two features at 0.99 → keep one for linear models; strong r with the target → useful |
| Scatter by class | separate colour clouds | those features separate the classes |
| Bar: target rate per category | uneven bars | the category matters |

**Trap — low r does not mean useless.** For x = −2, −1, 0, 1, 2 and y = x², y depends completely on x, yet r = 0. Look at a scatter before dropping a feature; trees use curved signal.

**Go deeper:** [Ch 6 §3.3](#content/06_math_fundamentals) (correlation) · [Ch 9 Step 2](#content/09_data_preprocessing) (outliers) · [Ch 40 §40.4](#content/40_python_ml_ai) (matplotlib)

</details>

### Try It Yourself -- EDA Challenge

```
  Load load_wine(as_frame=True).frame and answer:

  1. How many rows and columns? Any missing values?
  2. Wines per class (target 0, 1, 2)? Balanced?
  3. Which feature is most correlated with alcohol?
  4. Scatter flavanoids vs proline, coloured by class. Do the classes separate?
  5. How many magnesium values are outliers by the 1.5 x IQR rule?
```

```python
# Starter code:
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.datasets import load_wine

df = load_wine(as_frame=True).frame
# YOUR CODE HERE — answer the 5 questions above
```

<details>
<summary><strong>Answers</strong></summary>

1. 178 rows × 14 columns (13 features + `target`), no missing values.
2. 59 / 71 / 48 — mildly imbalanced: split with `stratify=y`.
3. `proline` (r = +0.64).
4. Mostly: class 0 has high proline (mean 1116), class 2 low flavanoids (0.78), class 1 neither (520, 2.08).
5. 4 (above the 135.5 fence).

</details>

---

# PART 4: DATA PREPROCESSING (COMPLETE GUIDE)

Models need clean numbers. The rule for every step: **split first, then learn fill values, categories and scales from the training rows only.** Theory: [Ch 09](#content/09_data_preprocessing).

---

## 4.1 Handle Missing Values

![Cheat card for handling missing values: bars measuring gaps in a 10-passenger table (age 3 missing 30%, embarked 1 missing 10%, deck 7 missing 70% so drop deck); a rule-of-thumb strategy by share missing (under 5% drop rows or fill, 5 to 30% median or mode plus a was-missing flag, over 30% consider dropping the column or a model that accepts NaN); a split-first diagram where the first 8 rows train and the last 2 test, train ages 2, 22, 26, 35, 38, 54 give median (26 + 35) / 2 = 30.5 while the all-rows median 27.0 would leak; test rows become 27.0 with flag 0 and 30.5 with flag 1; key APIs df.isna().sum() and SimpleImputer with add_indicator; and the pandas 3 trap that inplace fillna on a column changes nothing.](diagrams/pml27_info_missing_values_ai.png)

<details>
<summary><strong>Read as text</strong> — what to count and when to fill</summary>

**What & when:** count the gaps per column, pick a strategy by how much is missing, and learn fill values *after* the split.

</details>

```python
# Missing values: measure them, then fill with numbers learned from TRAIN only
import io
import pandas as pd
from sklearn.impute import SimpleImputer

csv = """age,fare,sex,embarked,deck,survived
22,7.25,male,S,,0
38,71.28,female,C,C,1
26,7.92,female,S,,1
35,53.10,female,S,C,1
,8.46,male,Q,,0
54,51.86,male,S,E,0
2,21.08,male,S,,0
,7.23,female,,,1
27,11.13,female,S,,1
,30.07,female,C,,1"""
df = pd.read_csv(io.StringIO(csv))
for col, n in df.isna().sum().items():
    if n:
        print(f"{col:<9}{n} missing ({n / len(df):.0%})")

train, test = df.iloc[:8], df.iloc[8:]            # split FIRST
imp = SimpleImputer(strategy="median", add_indicator=True).fit(train[["age"]])
print(f"train median age {imp.statistics_[0]:.1f} (all 10 rows: {df['age'].median():.1f} - a leak)")
for age, flag in imp.transform(test[["age"]]):
    print(f"test row -> age {age:.1f}, was_missing {flag:.0f}")
assert imp.statistics_[0] == 30.5
```

**Output:**

```
age      3 missing (30%)
embarked 1 missing (10%)
deck     7 missing (70%)
train median age 30.5 (all 10 rows: 27.0 - a leak)
test row -> age 27.0, was_missing 0
test row -> age 30.5, was_missing 1
```

<details>
<summary><strong>Read as text</strong> — continued: where the 30.5 comes from</summary>

Train ages 2, 22, 26, 35, 38, 54 → median (26 + 35) / 2 = 30.5. The test passenger with no age gets 30.5 plus flag 1, so "age unknown" stays usable as a signal.

</details>

### When to Use Which Strategy

<details>
<summary><strong>Read as text</strong> — the strategy table and the pandas 3 trap</summary>

| Missing (rule of thumb) | Strategy |
|---|---|
| under 5% | drop those rows (only if the gaps are random), or fill |
| 5–30% (age) | median (numbers) or mode (categories) + a was-missing flag (`add_indicator=True`) |
| over 30% (deck) | consider dropping the column; if it matters, `KNNImputer` / `IterativeImputer`, or a model that accepts NaN (HistGradientBoosting, XGBoost, LightGBM) |

**Trap:** fill values computed on all rows leak the test set (27.0 instead of 30.5). In pandas 3 (Copy-on-Write), `df["age"].fillna(x, inplace=True)` only warns and changes nothing — write `df = df.fillna({"age": x})`.

**Go deeper:** [Ch 09 Step 1 — Missing Values](#content/09_data_preprocessing).

</details>

---

## 4.2 Encode Categorical Variables

![Infographic: encoding categories by column type. One-hot turns port S, C into port_C and port_S columns, with an unseen port Q becoming all zeros; ordinal encoding uses your order low 0, medium 1, high 2 instead of the alphabetical default; smoothed target encoding with m = 2 and global mean 0.50 pulls port C from 1.00 to 0.75 and port S from 0.25 to 0.33. Includes the formula enc(c) = (n_c times mean_c + m times global mean) / (n_c + m), a pick-by-column table and the LabelEncoder trap.](diagrams/pml27_info_categorical_encoding_ai.png)

<details>
<summary><strong>Read as text</strong> — what encoding does and the target-encoding formula</summary>

**What & when:** turn text categories into numbers; pick the encoder by the kind of column.

> **Maths in one line:** target encoding `enc(c) = (n_c · ȳ_c + m · ȳ) / (n_c + m)` — a category's mean label, pulled toward the global mean ȳ when it has few rows n_c (m = smoothing).

</details>

```python
# Encoding: one-hot (no order), ordinal (your order), smoothed target mean (many values)
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder

train = pd.DataFrame({"port": ["S", "C", "S", "S", "C", "S"],
                      "fare": ["low", "high", "low", "medium", "high", "low"],
                      "survived": [0, 1, 1, 0, 1, 0]})
test = pd.DataFrame({"port": ["C", "Q"], "fare": ["medium", "high"]})   # port Q never seen

ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False).fit(train[["port"]])
print("one-hot", [str(c) for c in ohe.get_feature_names_out()], "-> C, Q:",
      ohe.transform(test[["port"]]).astype(int).tolist())
oe = OrdinalEncoder(categories=[["low", "medium", "high"]]).fit(train[["fare"]])
print("ordinal medium, high ->", oe.transform(test[["fare"]]).ravel().tolist())
print("default order:", [str(c) for c in OrdinalEncoder().fit(train[["fare"]]).categories_[0]])

m, g = 2, train["survived"].mean()                  # smoothing strength, global mean
s = train.groupby("port")["survived"].agg(["mean", "count"])
enc = (s["count"] * s["mean"] + m * g) / (s["count"] + m)
for port in enc.index:
    print(f"target-encode {port}: raw {s.loc[port, 'mean']:.2f} (n={s.loc[port, 'count']}) -> {enc[port]:.2f}")
assert round(enc["C"], 2) == 0.75
```

**Output:**

```
one-hot ['port_C', 'port_S'] -> C, Q: [[1, 0], [0, 0]]
ordinal medium, high -> [1.0, 2.0]
default order: ['high', 'low', 'medium']
target-encode C: raw 1.00 (n=2) -> 0.75
target-encode S: raw 0.25 (n=4) -> 0.33
```

<details>
<summary><strong>Read as text</strong> — continued: why port C shrinks to 0.75</summary>

Port C (2 rows, both survived) is shrunk from 1.00 to (2 · 1.0 + 2 · 0.5) / 4 = 0.75 — two rows are not trusted blindly. The unseen port Q becomes all zeros.

</details>

### When to Use Which Encoding

<details>
<summary><strong>Read as text</strong> — the encoder chooser and four traps</summary>

| Column | Encoder |
|---|---|
| no order, few values (port) | `OneHotEncoder(handle_unknown="ignore")` — needed by linear models, SVM, KNN, nets |
| real order (low < medium < high) | `OrdinalEncoder(categories=[[...]])` — give the order yourself |
| hundreds of values (city, ID) | `TargetEncoder` (scikit-learn ≥ 1.3; smooths and cross-fits) |
| any, with boosted trees | native pandas `category` support: HistGradientBoosting, LightGBM, XGBoost (default since 3.3), CatBoost (`cat_features=`) |

**Trap:** `LabelEncoder` is for the target y — on features it sorts alphabetically (high 0, low 1, medium 2), a false order. `pd.get_dummies` forgets the training categories, so test columns can differ. Target means computed on all rows leak the label. `drop="first"` matters only for unregularised linear regression.

**Go deeper:** [Ch 09 Step 3 — Encoding](#content/09_data_preprocessing).

</details>

---

## 4.3 Feature Scaling

![Infographic: scale on train, apply everywhere. StandardScaler formula z = (x minus train mean) / train std with MinMax and Robust variants; worked example with train ages 20, 30, 40, 50, 60 (mean 40, std 14.14) giving test age 44 = 0.28 and age 90 = 3.54, MinMax 0.6 and 1.75, Robust 0.2 and 2.5, and a leak warning that fitting on train plus test moves the mean from 40.0 to 47.7. A ColumnTransformer flow imputes and scales age and fare, imputes and one-hot encodes sex and embarked, makes 8 features and feeds LogisticRegression; a missing test age becomes median 30.5 then 0.05. Table of which models need scaling, with wine KNN 72.2% raw vs 96.3% scaled.](diagrams/pml27_info_scaling_pipeline_ai.png)

<details>
<summary><strong>Read as text</strong> — what scaling does and the three formulas</summary>

**What & when:** bring numeric features to comparable ranges for models that use distances or gradients. Fit on train; transform train *and* test.

> **Maths in one line:** `z = (x − μ_train) / σ_train` (StandardScaler, the default) · `(x − min) / (max − min)` (MinMax, bounded inputs) · `(x − median) / IQR` (Robust, outliers).

</details>

```python
# Scaling: learn the numbers on TRAIN, reuse them on TEST
import numpy as np
from sklearn.preprocessing import MinMaxScaler, RobustScaler, StandardScaler

train = np.array([[20.0], [30.0], [40.0], [50.0], [60.0]])   # ages
test = np.array([[44.0], [90.0]])                              # 90 is outside the train range
for scaler in [StandardScaler(), MinMaxScaler(), RobustScaler()]:
    scaler.fit(train)                                          # fit on train only
    print(f"{type(scaler).__name__:<15} test {scaler.transform(test).ravel().round(2).tolist()}")

mu = StandardScaler().fit(train).mean_[0]
leaky = StandardScaler().fit(np.vstack([train, test])).mean_[0]   # WRONG: test rows shape the mean
print(f"mean from train {mu:.1f} vs from train + test {leaky:.1f}")
assert mu == 40.0
```

**Output:**

```
StandardScaler  test [0.28, 3.54]
MinMaxScaler    test [0.6, 1.75]
RobustScaler    test [0.2, 2.5]
mean from train 40.0 vs from train + test 47.7
```

<details>
<summary><strong>Read as text</strong> — continued: reading the numbers and the fit-on-train rule</summary>

Age 44 → (44 − 40) / 14.14 = 0.28. Test values may leave the training range (90 → 1.75 under MinMax) — that is correct.

```
  ╔══════════════════════════════════════════════════════════════╗
  ║  CRITICAL RULE: FIT ON TRAIN, TRANSFORM BOTH                 ║
  ║                                                              ║
  ║  WRONG: scaler.fit_transform(ALL_DATA)    <- DATA LEAKAGE!   ║
  ║  RIGHT: scaler.fit(X_train)               <- learn from      ║
  ║         scaler.transform(X_train)            train only      ║
  ║         scaler.transform(X_test)          <- apply same      ║
  ║                                              stats to test   ║
  ╚══════════════════════════════════════════════════════════════╝
```

</details>

### Which Algorithms Need Scaling?

<details>
<summary><strong>Read as text</strong> — which models need scaling, and the trap</summary>

**Need it:** linear/logistic regression, Ridge, Lasso, SVM, KNN, K-Means, PCA, neural nets — anything using distances, penalties or gradient descent. **Don't:** trees, random forests, gradient boosting, Naive Bayes — trees split on thresholds, so units don't matter. On the wine data the same KNN scores 72.2% raw vs 96.3% scaled; a tree scores 94.4% either way.

**Trap:** scaling before the split or before cross-validation — keep the scaler inside a `Pipeline` (§4.4).

**Go deeper:** [Ch 09 Step 4 — Feature Scaling](#content/09_data_preprocessing) (with the wine experiment).

</details>

---

## 4.4 Put It Together — One Leakage-Safe Preprocessor

<details>
<summary><strong>Read as text</strong> — why one ColumnTransformer inside a Pipeline</summary>

**What & when:** real tables mix numbers and text. A `ColumnTransformer` gives each column group its own steps; inside a `Pipeline` with the model, one `fit` learns everything from the training rows, and `cross_val_score` refits it in every fold.

</details>

```python
# One leakage-safe preprocessor: impute + scale numbers, impute + one-hot categories
import io
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

csv = """age,fare,sex,embarked,deck,survived
22,7.25,male,S,,0
38,71.28,female,C,C,1
26,7.92,female,S,,1
35,53.10,female,S,C,1
,8.46,male,Q,,0
54,51.86,male,S,E,0
2,21.08,male,S,,0
,7.23,female,,,1
27,11.13,female,S,,1
,30.07,female,C,,1"""
df = pd.read_csv(io.StringIO(csv))
X, y = df[["age", "fare", "sex", "embarked"]], df["survived"]   # deck (70% missing) left out
X_train, X_test, y_train = X.iloc[:8], X.iloc[8:], y.iloc[:8]

pre = ColumnTransformer([
    ("num", make_pipeline(SimpleImputer(strategy="median", add_indicator=True),
                          StandardScaler()), ["age", "fare"]),
    ("cat", make_pipeline(SimpleImputer(strategy="most_frequent"),
                          OneHotEncoder(handle_unknown="ignore", sparse_output=False)), ["sex", "embarked"]),
])
model = make_pipeline(pre, LogisticRegression()).fit(X_train, y_train)   # learns from train only

print("features:", [str(c) for c in pre.get_feature_names_out()])
for row in pre.transform(X_test).round(2).tolist():
    print("test row:", row)
print("P(survived):", model.predict_proba(X_test)[:, 1].round(2).tolist())
assert pre.transform(X_test).shape == (2, 8)
```

**Output:**

```
features: ['num__age', 'num__fare', 'num__missingindicator_age', 'cat__sex_female', 'cat__sex_male', 'cat__embarked_C', 'cat__embarked_Q', 'cat__embarked_S']
test row: [-0.2, -0.71, -0.58, 1.0, 0.0, 0.0, 0.0, 1.0]
test row: [0.05, 0.06, 1.73, 1.0, 0.0, 1.0, 0.0, 0.0]
P(survived): [0.69, 0.79]
```

<details>
<summary><strong>Read as text</strong> — continued: 4 columns become 8 features, and the trap</summary>

4 input columns → 8 features. The missing test age → train median 30.5 → standardised 0.05 (the 0/1 flag is standardised too, harmlessly).

**Trap:** `fit_transform` on the full table before splitting, or `pd.get_dummies` outside the pipeline. Part 11 grows this into a full pipeline with cross-validation and saving.

**Go deeper:** [Ch 09 — A Leakage-Safe Pipeline](#content/09_data_preprocessing).

</details>

---

# PART 5: YOUR FIRST ML MODEL (STEP BY STEP)

---

## 5.1 Complete Beginner Walkthrough — Iris Classification

![Infographic: your first model, Iris in seven steps. Load 150 flowers with 4 features and 3 species, explore 50 per species, split 120 / 30 with stratify, scale fitted on train only, train KNN with K = 5, predict 30 test flowers, evaluate 93.3% (28 of 30). Shows precision = TP / (TP + FP) and recall = TP / (TP + FN), the 3 by 3 confusion matrix 10 0 0, 0 10 0, 0 2 8 with the 2 virginica called versicolor circled, versicolor precision 10 / 12 = 0.83, virginica recall 8 / 10 = 0.80, and a classification report table.](diagrams/pml27_info_first_model_iris_ai.png)

<details>
<summary><strong>Read as text</strong> — the task and the seven steps</summary>

**What:** predict a flower's species (setosa, versicolor or virginica) from 4 measurements in cm with K-nearest neighbours (KNN). Every supervised project follows these steps.

</details>

```python
# Your first model: KNN on Iris - load, explore, split, scale, train, predict, evaluate
import numpy as np
from sklearn.datasets import load_iris
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

# Steps 1-2: load and explore - 150 flowers, 4 measurements in cm, 3 species
iris = load_iris()
X, y = iris.data, iris.target
print(f"X shape {X.shape}; species {iris.target_names.tolist()}")
print(f"flowers per species: {np.bincount(y).tolist()}")
print(f"first flower: {X[0].tolist()} -> {iris.target_names[y[0]]}")

# Step 3: split 80/20; stratify keeps 10 of each species in the test set
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)
print(f"train {len(X_train)} rows, test {len(X_test)} rows")

# Step 4: scale - learn mean and std on TRAIN only, apply to both
scaler = StandardScaler().fit(X_train)
X_train_s, X_test_s = scaler.transform(X_train), scaler.transform(X_test)

# Step 5: train - KNN simply stores the 120 scaled training flowers
model = KNeighborsClassifier(n_neighbors=5).fit(X_train_s, y_train)

# Steps 6-7: predict the 30 unseen flowers and evaluate
y_pred = model.predict(X_test_s)
acc = accuracy_score(y_test, y_pred)
print(f"\ntest accuracy {acc:.1%} ({(y_pred == y_test).sum()} of {len(y_test)} correct)\n")
print(classification_report(y_test, y_pred, target_names=iris.target_names))
print("confusion matrix (rows = true, columns = predicted):")
print(confusion_matrix(y_test, y_pred))
assert acc > 0.9
```

**Output:**

```
X shape (150, 4); species ['setosa', 'versicolor', 'virginica']
flowers per species: [50, 50, 50]
first flower: [5.1, 3.5, 1.4, 0.2] -> setosa
train 120 rows, test 30 rows

test accuracy 93.3% (28 of 30 correct)

              precision    recall  f1-score   support

      setosa       1.00      1.00      1.00        10
  versicolor       0.83      1.00      0.91        10
   virginica       1.00      0.80      0.89        10

    accuracy                           0.93        30
   macro avg       0.94      0.93      0.93        30
weighted avg       0.94      0.93      0.93        30

confusion matrix (rows = true, columns = predicted):
[[10  0  0]
 [ 0 10  0]
 [ 0  2  8]]
```

<details>
<summary><strong>Read as text</strong> — continued: reading the report and the step-by-step recap</summary>

Setosa is perfect; both errors are virginica called versicolor (their petals overlap), so virginica recall = 8 / 10 = 0.80 and versicolor precision = 10 / 12 = 0.83. One test flower = 3.3 points, so a single split is noisy. To plot it: `ConfusionMatrixDisplay.from_predictions(y_test, y_pred)` then `plt.show()`.

```
  WHAT JUST HAPPENED — STEP BY STEP:
  ────────────────────────────────────────────────────────

  Load Data → Explore → Split → Scale → Train → Predict → Evaluate
       │          │        │       │       │        │          │
       ▼          ▼        ▼       ▼       ▼        ▼          ▼
  150 flowers  50 per   120/30  fit on   KNN     30 test   Accuracy
  4 features   species  split   train    stores  flowers   = 93.3%
  3 species    balanced         only     rows    guessed   (28/30)

  This workflow is THE SAME for every ML project.
  Only the model and preprocessing change.
```

**Go deeper:** [Ch 40 §40.5](#content/40_python_ml_ai) · [Ch 13 §13.2](#content/13_model_evaluation).

</details>

### Try It Yourself -- First Model Challenge

```
  Now do it on your own! Load the breast cancer dataset and build a classifier.

  1. Load: from sklearn.datasets import load_breast_cancer
  2. Convert to DataFrame, explore with .shape, .describe(), .value_counts()
  3. Split 80/20 with stratify=y and random_state=42
  4. Scale features (fit on train only, or use make_pipeline)
  5. Train a KNeighborsClassifier
  6. Print accuracy and classification report
  7. BONUS: Try K=1, 3, 5, 7, 9 with cross_val_score on the TRAIN set,
     then check only the winner on the test set.
```

```python
# Starter code:
from sklearn.datasets import load_breast_cancer
data = load_breast_cancer()
# YOUR CODE HERE — follow the 7 steps above
```

---

# PART 6: SUPERVISED LEARNING ALGORITHMS

Each algorithm: what & when, the maths, the knobs, one runnable example, the trap. Every example is self-contained: Iris, the same stratified 80/20 split (`random_state=42`; 120 train / 30 test flowers), and the scaler inside a `Pipeline` where needed. One test flower = 3.3 points, so pick models by cross-validation (§6.9). Selection guide: [Ch 10 §10.12](#content/10_supervised_learning).

---

## 6.1 Logistic Regression

![Infographic comparing four classifiers from simple to strong. Logistic regression p = 1 / (1 + e^-z), Iris test 93.3%, largest weights petal width +2.49 for virginica and petal length -1.80 for setosa. Decision tree with Gini G = 1 - sum of p_k squared, root 40 / 40 / 40 gives 0.667, no depth cap train 100% test 93.3% vs max_depth=3 train 98.3% test 96.7%, first rule petal length at most 2.45 means setosa. Random forest variance formula, 200 trees out-of-bag 95.0%, test 90.0%, petal width impurity 0.41 vs permutation 0.09. Gradient boosting F_m = F_(m-1) + eta times h_m, breast cancer 569 tumours, early stop at 63 of 500 trees, test 94.7%. Pick-by-need table and the early-stopping-on-test trap.](diagrams/pml27_info_linear_tree_boosting_ai.png)

<details>
<summary><strong>Read as text</strong> — what & when, the sigmoid and the knobs</summary>

**What & when:** a linear model that outputs class probabilities — the first baseline for any classifier, and the pick when you must explain predictions. Needs scaling.

> **Maths in one line:** `p = 1 / (1 + e^(−z))`, `z = w₀ + w₁x₁ + … + w_p·x_p` — the weighted sum is the log-odds; the sigmoid squashes it into 0–1 (softmax for 3+ classes).

| Knob | Effect | Start with |
|---|---|---|
| `C` | inverse regularisation — smaller = simpler | 1.0, then a log grid |
| `l1_ratio` | 0 = L2, 1 = L1 (with `solver="saga"`); replaces `penalty` (deprecated in scikit-learn 1.8) | 0 (default) |
| `class_weight` | `"balanced"` upweights a rare class | `None` |

</details>

```python
# Logistic regression on Iris: accuracy, probabilities, the strongest weight per class
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X_train, y_train)
print(f"test accuracy {model.score(X_test, y_test):.1%}")
print("P(each species), test flower 0:", model.predict_proba(X_test[:1])[0].round(3).tolist())
for species, w in zip(iris.target_names, model[-1].coef_):
    top = abs(w).argmax()
    print(f"  {species:<10} largest weight: {iris.feature_names[top]} ({w[top]:+.2f})")
```

**Output:**

```
test accuracy 93.3%
P(each species), test flower 0: [0.979, 0.021, 0.0]
  setosa     largest weight: petal length (cm) (-1.80)
  versicolor largest weight: petal width (cm) (-0.81)
  virginica  largest weight: petal width (cm) (+2.49)
```

<details>
<summary><strong>Read as text</strong> — continued: reading the weights, and the trap</summary>

On scaled inputs a weight is the log-odds change per standard deviation: longer petals push *away* from setosa (−1.80).

**Trap:** comparing weights of unscaled or correlated features (petal length and width share credit unpredictably). A ConvergenceWarning means: raise `max_iter`.

**Go deeper:** [Ch 12 §12.3](#content/12_key_algorithms).

</details>

---

## 6.2 Decision Tree

<details>
<summary><strong>Read as text</strong> — what & when, Gini and the knobs</summary>

**What & when:** if/else questions learned from the data — use it to *show* the rules; it is the building block of forests and boosting. No scaling; accepts NaN (scikit-learn ≥ 1.3).

> **Maths in one line:** Gini `G = 1 − Σ pₖ²`; each split maximises `G(parent) − Σₖ (nₖ / n) · G(childₖ)`. The Iris root (40 / 40 / 40) has G = 1 − 3 · (1/3)² = 0.667.

| Knob | Effect | Start with |
|---|---|---|
| `max_depth` | caps the questions on any path | 3–10 |
| `min_samples_leaf` | minimum rows per leaf | 5–20 |
| `ccp_alpha` | prunes weak branches after growing | tune with CV |

</details>

```python
# Decision tree: unlimited depth vs max_depth=3, and the learned rules as text
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target)
for depth in [None, 3]:
    tree = DecisionTreeClassifier(max_depth=depth, random_state=42).fit(X_train, y_train)
    print(f"max_depth={str(depth):<4} leaves {tree.get_n_leaves():>2}  "
          f"train {tree.score(X_train, y_train):.1%}  test {tree.score(X_test, y_test):.1%}")
names = [n.replace(" (cm)", "") for n in iris.feature_names]
print(export_text(tree, feature_names=names, class_names=iris.target_names.tolist()))
```

**Output:**

```
max_depth=None leaves  8  train 100.0%  test 93.3%
max_depth=3    leaves  5  train 98.3%  test 96.7%
|--- petal length <= 2.45
|   |--- class: setosa
|--- petal length >  2.45
|   |--- petal width <= 1.65
|   |   |--- petal length <= 4.95
|   |   |   |--- class: versicolor
|   |   |--- petal length >  4.95
|   |   |   |--- class: virginica
|   |--- petal width >  1.65
|   |   |--- petal length <= 4.85
|   |   |   |--- class: virginica
|   |   |--- petal length >  4.85
|   |   |   |--- class: virginica
```

<details>
<summary><strong>Read as text</strong> — continued: why depth 3 wins, and the trap</summary>

Unlimited depth memorises the training set (100%) but tests worse than depth 3. The last split sends both sides to virginica — purer leaves, same answer. `plot_tree(tree, filled=True)` draws it.

**Trap:** deep trees overfit and are unstable (a small data change → a different tree). Cap the depth or leaf size, and judge on validation data.

**Go deeper:** [Ch 12 §12.4](#content/12_key_algorithms) · [Ch 10 §10.7](#content/10_supervised_learning).

</details>

---

## 6.3 Random Forest

<details>
<summary><strong>Read as text</strong> — what & when, the variance formula and the knobs</summary>

**What & when:** many trees vote, each trained on a bootstrap sample of the rows with a random subset of features per split — the low-effort default for tabular data. No scaling; accepts NaN (scikit-learn ≥ 1.4).

> **Maths in one line:** `Var(average of B trees) = ρσ² + (1 − ρ)σ²/B` — more trees shrink the second term; random feature subsets lower the tree correlation ρ in the first.

| Knob | Effect | Start with |
|---|---|---|
| `n_estimators` | more trees: never worse, only slower | 200–500 |
| `max_features` | features tried per split (fewer = more diverse trees) | `"sqrt"` (default) |
| `oob_score=True` | free validation score from the rows each tree never saw | on |

</details>

```python
# Random forest: 200 voting trees, the free out-of-bag score, two kinds of importance
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target)
rf = RandomForestClassifier(n_estimators=200, oob_score=True, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)
print(f"out-of-bag accuracy {rf.oob_score_:.1%} | test accuracy {rf.score(X_test, y_test):.1%}")
perm = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=42)
for name, imp, p in sorted(zip(iris.feature_names, rf.feature_importances_, perm.importances_mean),
                           key=lambda r: -r[1]):
    print(f"  {name:<18} impurity {imp:.2f}   permutation {p:.2f}")
```

**Output:**

```
out-of-bag accuracy 95.0% | test accuracy 90.0%
  petal length (cm)  impurity 0.45   permutation 0.36
  petal width (cm)   impurity 0.41   permutation 0.09
  sepal length (cm)  impurity 0.12   permutation -0.05
  sepal width (cm)   impurity 0.02   permutation -0.04
```

<details>
<summary><strong>Read as text</strong> — continued: out-of-bag vs test, and the importance trap</summary>

The out-of-bag score comes free, without the test set. The test score (27 of 30) is two flowers below the depth-3 tree — noise on 30 rows. Shuffling petal width barely hurts: the correlated petal length carries the same signal.

**Trap:** impurity-based `feature_importances_` favour many-valued features (IDs) and split credit among correlated ones — report `permutation_importance` on held-out data.

**Go deeper:** [Ch 12 §12.5](#content/12_key_algorithms).

</details>

---

## 6.4 XGBoost / LightGBM (Gradient Boosting)

<details>
<summary><strong>Read as text</strong> — what & when, the update rule, the knobs and the libraries</summary>

**What & when:** trees built in sequence, each fitting what the previous ones still get wrong — usually the most accurate choice for tabular data. No scaling; NaN handled natively.

> **Maths in one line:** `F_m(x) = F_{m−1}(x) + η · h_m(x)` — each small tree h_m fits the current errors (the loss's negative gradient); the model steps only η toward it.

| Knob | Effect | Start with |
|---|---|---|
| learning rate η | smaller = better generalisation, more trees | 0.05–0.1 |
| number of trees | let early stopping on a **validation** set choose | 1,000, stop after 50 bad rounds |
| tree size | `max_depth` (XGBoost, CatBoost) or `num_leaves` / `max_leaf_nodes` (LightGBM, scikit-learn) | depth 4–6 / 15–63 leaves |

| Library (as of Nov 2026) | Pick it for |
|---|---|
| scikit-learn 1.9 `HistGradientBoosting*` | no extra install; NaN + categoricals; runs in this app |
| XGBoost 3.4 | GPU via `device="cuda"`; pandas categoricals on by default since 3.3 |
| LightGBM 4.7 | the fastest on large data (leaf-wise trees) |
| CatBoost 1.2 | many text categories, little tuning (`cat_features=`) |

</details>

```python
# Gradient boosting in scikit-learn: HistGradientBoosting with early stopping
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import train_test_split

X, y = load_breast_cancer(return_X_y=True)          # 569 tumours, 30 features, 2 classes
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)
gb = HistGradientBoostingClassifier(learning_rate=0.1, max_iter=500, max_leaf_nodes=15,
                                    early_stopping=True, validation_fraction=0.15,
                                    n_iter_no_change=20, random_state=42).fit(X_train, y_train)
print(f"trees built: {gb.n_iter_} of 500 (early stopping on a 15% validation split)")
print(f"test accuracy {gb.score(X_test, y_test):.1%}")
```

**Output:**

```
trees built: 63 of 500 (early stopping on a 15% validation split)
test accuracy 94.7%
```

<details>
<summary><strong>Read as text</strong> — continued: XGBoost, LightGBM and CatBoost code, and the trap</summary>

scikit-learn ≥ 1.9 bins features slightly differently, so it stops at 56 trees (same 94.7%). The three big libraries, with their current APIs:

```python
# Runs locally: pip install xgboost lightgbm catboost   (XGBoost 3.4, LightGBM 4.7, CatBoost 1.2 - Nov 2026)
from catboost import CatBoostClassifier
from lightgbm import LGBMClassifier, early_stopping
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

X, y = load_breast_cancer(return_X_y=True)
X_rest, X_test, y_rest, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
X_tr, X_val, y_tr, y_val = train_test_split(X_rest, y_rest, test_size=0.2, random_state=42, stratify=y_rest)

xgb = XGBClassifier(n_estimators=1000, learning_rate=0.05, max_depth=4, subsample=0.8,
                    colsample_bytree=0.8, early_stopping_rounds=50, random_state=42)  # device="cuda" for GPU
xgb.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], verbose=False)
lgbm = LGBMClassifier(n_estimators=1000, learning_rate=0.05, num_leaves=15, random_state=42, verbose=-1)
lgbm.fit(X_tr, y_tr, eval_X=X_val, eval_y=y_val,           # LightGBM < 4.7: eval_set=[(X_val, y_val)]
         callbacks=[early_stopping(50, verbose=False)])
cat = CatBoostClassifier(iterations=1000, learning_rate=0.05, depth=6, early_stopping_rounds=50,
                         random_seed=42, verbose=0)          # cat_features=[...] for text columns
cat.fit(X_tr, y_tr, eval_set=(X_val, y_val))

for name, m in [("XGBoost", xgb), ("LightGBM", lgbm), ("CatBoost", cat)]:
    print(f"{name:<9} test accuracy {m.score(X_test, y_test):.1%}")
```

**Trap:** early stopping on the *test* set makes the test score dishonest. Hold out a separate validation split (as above); touch the test set once.

**Go deeper:** [Ch 12 §12.6](#content/12_key_algorithms).

</details>

---

## 6.5 Support Vector Machine (SVM)

![Infographic: SVM, KNN, Naive Bayes, linear regression and a fair bake-off. SVM on Iris: C=0.01 gives 120 support vectors and test 86.7%, C=1 47 and 96.7%, C=100 25 and 96.7%. KNN chosen by 5-fold CV: K=1 94.2%, K=5 96.7% best, K=25 90.0%. Naive Bayes: GaussianNB 96.7% on Iris; spam filter gives free cash P(spam) 0.87 and notes for the meeting 0.15. Linear regression on 442 diabetes patients: R squared 0.453, MAE 42.8; Lasso alpha=5 keeps 5 of 10 features, R squared 0.465. A to-scale bar chart of the wine bake-off with 5-fold CV: SVM 98.6%, logistic regression 97.9%, random forest 97.9%, Naive Bayes 97.2%, HistGradientBoosting 95.8%, KNN 95.1%, decision tree 90.2%, and KNN without scaling 70.5% in red.](diagrams/pml27_info_svm_knn_nb_bakeoff_ai.png)

<details>
<summary><strong>Read as text</strong> — what & when, the margin formula and the knobs</summary>

**What & when:** the widest-margin boundary between classes; the kernel trick lets it curve. Strong on small-to-medium data with many features. Needs scaling; training grows roughly O(n²)–O(n³), so it is impractical beyond about 50K rows.

> **Maths in one line:** `min ½‖w‖² + C · Σᵢ max(0, 1 − yᵢ(w·xᵢ + b))` — keep the margin (width 2/‖w‖) wide, paying a hinge penalty for each point inside it or on the wrong side; C sets the price.

| Knob | Effect | Start with |
|---|---|---|
| `kernel` | `"rbf"` (curved), `"linear"`, `"poly"` | `"rbf"` (default) |
| `C` | small = wide, soft margin; big = fit every point | 1, then a log grid |
| `gamma` | RBF reach — big = wiggly boundary | `"scale"` (default) |

</details>

```python
# SVM with an RBF kernel: C trades a wide margin against fitting every point
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target)
for C in [0.01, 1, 100]:
    svm = make_pipeline(StandardScaler(), SVC(kernel="rbf", C=C)).fit(X_train, y_train)
    print(f"C={C:<5} support vectors {svm[-1].n_support_.sum():>3}  "
          f"train {svm.score(X_train, y_train):.1%}  test {svm.score(X_test, y_test):.1%}")
```

**Output:**

```
C=0.01  support vectors 120  train 90.0%  test 86.7%
C=1     support vectors  47  train 97.5%  test 96.7%
C=100   support vectors  25  train 99.2%  test 96.7%
```

<details>
<summary><strong>Read as text</strong> — continued: underfitting at C = 0.01, and the trap</summary>

At C = 0.01 violations are so cheap that all 120 training flowers become support vectors — underfitting.

**Trap:** `SVC(probability=True)` is deprecated in scikit-learn 1.9 (removal planned for 1.11); for probabilities use `CalibratedClassifierCV(SVC(), ensemble=False)`. For big data use `LinearSVC` or `SGDClassifier`.

**Go deeper:** [Ch 12 §12.7](#content/12_key_algorithms).

</details>

---

## 6.6 K-Nearest Neighbors (KNN)

<details>
<summary><strong>Read as text</strong> — what & when, the vote and the knobs</summary>

**What & when:** a new point takes the majority vote of its K nearest training rows — a baseline for small, low-dimensional data, and the idea behind similarity search. Needs scaling; predictions get slow on big data.

> **Maths in one line:** `ŷ(q) = majority class of the K training points nearest to q`, with `d(q, x) = √Σⱼ (qⱼ − xⱼ)²` — measure, keep the K closest, vote.

| Knob | Effect | Start with |
|---|---|---|
| `n_neighbors` (K) | small = jumpy boundary; large = smooth | pick by CV (odd K avoids ties with 2 classes) |
| `weights` | `"distance"` lets closer neighbours count more | `"uniform"` |

</details>

```python
# KNN: choose K by 5-fold cross-validation on the TRAIN set, then test once
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target)
scores = {}
for k in [1, 3, 5, 7, 9, 15, 25]:
    knn = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))
    scores[k] = cross_val_score(knn, X_train, y_train, cv=5).mean()
    print(f"K={k:<3} CV accuracy {scores[k]:.1%}")
best_k = max(scores, key=scores.get)
final = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=best_k))
print(f"best K = {best_k} -> test accuracy {final.fit(X_train, y_train).score(X_test, y_test):.1%}")
```

**Output:**

```
K=1   CV accuracy 94.2%
K=3   CV accuracy 95.8%
K=5   CV accuracy 96.7%
K=7   CV accuracy 95.8%
K=9   CV accuracy 95.8%
K=15  CV accuracy 95.8%
K=25  CV accuracy 90.0%
best K = 5 -> test accuracy 93.3%
```

<details>
<summary><strong>Read as text</strong> — continued: choosing K, and the trap</summary>

K = 1 follows noise; K = 25 smooths too much.

**Trap:** picking K by test accuracy makes the reported score optimistic — choose by CV on the training rows, then test once. In high dimensions all points look about equally far apart, and KNN weakens.

**Go deeper:** [Ch 12 §12.8](#content/12_key_algorithms).

</details>

---

## 6.7 Naive Bayes

<details>
<summary><strong>Read as text</strong> — what & when, Bayes' rule and the variants</summary>

**What & when:** Bayes' rule plus the "naive" assumption that features are independent given the class. One-pass training, fine with tiny data, the classic for text (spam, sentiment); it cannot learn feature interactions.

> **Maths in one line:** `ĉ = argmax_c P(c) · Πⱼ P(xⱼ | c)` — prior × the probability of every clue under that class (in practice, add logs).

| Variant | Features | Knob |
|---|---|---|
| `GaussianNB` | continuous measurements | `var_smoothing` |
| `MultinomialNB` / `ComplementNB` | word counts or TF-IDF (Complement: imbalanced text) | `alpha` (Laplace smoothing, 1.0) |
| `BernoulliNB` | present / absent (0/1) features | `alpha` |

</details>

```python
# Naive Bayes: GaussianNB for measurements, MultinomialNB for word counts
from sklearn.datasets import load_iris
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB, MultinomialNB

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target)
print(f"GaussianNB on Iris: test accuracy {GaussianNB().fit(X_train, y_train).score(X_test, y_test):.1%}")

texts = ["win cash now", "cheap pills win", "free cash offer",
         "meeting at noon", "lunch at noon tomorrow", "project meeting notes"]
labels = [1, 1, 1, 0, 0, 0]                        # 1 = spam
vec = CountVectorizer().fit(texts)
nb = MultinomialNB(alpha=1.0).fit(vec.transform(texts), labels)
for msg in ["free cash", "notes for the meeting"]:
    print(f"  '{msg}' -> P(spam) = {nb.predict_proba(vec.transform([msg]))[0, 1]:.2f}")
```

**Output:**

```
GaussianNB on Iris: test accuracy 96.7%
  'free cash' -> P(spam) = 0.87
  'notes for the meeting' -> P(spam) = 0.15
```

<details>
<summary><strong>Read as text</strong> — continued: why "free cash" looks like spam, and the trap</summary>

"free" and "cash" appear only in spam; unseen words ("for", "the") are ignored.

**Trap:** Naive Bayes probabilities are over-confident — calibrate (`CalibratedClassifierCV`) if you need real ones. `MultinomialNB` needs non-negative inputs (counts, TF-IDF), never standardised features.

**Go deeper:** [Ch 12 §12.9](#content/12_key_algorithms).

</details>

---

## 6.8 Linear Regression (for Regression Problems)

<details>
<summary><strong>Read as text</strong> — what & when and the Ridge / Lasso penalties</summary>

**What & when:** a number as a weighted sum of features — the baseline for every regression. Ridge and Lasso add a weight penalty, so they need scaling and a tuned `alpha` (`RidgeCV`, `LassoCV`).

> **Maths in one line:** minimise `Σ(yᵢ − ŷᵢ)²`, plus `α·Σwⱼ²` (Ridge: shrinks every weight) or `α·Σ|wⱼ|` (Lasso: pushes weak weights to exactly 0, selecting features).

</details>

```python
# Linear, Ridge and Lasso regression on the bundled diabetes data (442 patients, 10 features)
import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.linear_model import Lasso, LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

data = load_diabetes()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.2, random_state=42)
for name, reg in [("Linear", LinearRegression()), ("Ridge a=1", Ridge(alpha=1.0)),
                  ("Lasso a=5", Lasso(alpha=5.0))]:
    model = make_pipeline(StandardScaler(), reg).fit(X_train, y_train)
    pred = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, pred))   # = root_mean_squared_error (sklearn >= 1.4)
    print(f"{name:<10} MAE {mean_absolute_error(y_test, pred):5.1f}  RMSE {rmse:5.1f}  "
          f"R2 {r2_score(y_test, pred):.3f}")
kept = [f for f, w in zip(data.feature_names, model[-1].coef_) if w != 0]
print(f"Lasso kept {len(kept)} of 10 features: {kept}")
```

**Output:**

```
Linear     MAE  42.8  RMSE  53.9  R2 0.453
Ridge a=1  MAE  42.8  RMSE  53.8  R2 0.454
Lasso a=5  MAE  43.5  RMSE  53.3  R2 0.465
Lasso kept 5 of 10 features: ['sex', 'bmi', 'bp', 's3', 's5']
```

<details>
<summary><strong>Read as text</strong> — continued: reading MAE, RMSE and R², and the trap</summary>

Target: disease progression one year later. MAE 42.8 = the average miss; RMSE weights big misses more; R² 0.453 = 45% of the variation explained. Lasso dropped half the features and still scored slightly better.

**Trap:** `mean_squared_error(..., squared=False)` was removed in scikit-learn 1.6 — use `root_mean_squared_error` (≥ 1.4) or `np.sqrt` as above, which works on every version.

**Go deeper:** [Ch 12 §12.2](#content/12_key_algorithms) · [Ch 13 §13.6](#content/13_model_evaluation).

</details>

---

## 6.9 Algorithm Comparison Template

<details>
<summary><strong>Read as text</strong> — the fair-comparison recipe</summary>

**What & when:** the honest way to choose: same folds for every model, preprocessing inside each pipeline, test set untouched until there is a winner. Typical order: baseline (logistic regression) → forest or boosting → tune the top one or two (Part 9).

</details>

```python
# Compare 7 classifiers fairly: same stratified folds, scaling inside each pipeline
from sklearn.datasets import load_wine
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

X, y = load_wine(return_X_y=True)                      # 178 wines, 13 features, 3 cultivars
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)   # the test set waits for the winner
models = {
    "Logistic Regression": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
    "Decision Tree":       DecisionTreeClassifier(max_depth=5, random_state=42),
    "Random Forest":       RandomForestClassifier(n_estimators=100, random_state=42),
    "HistGradientBoosting": HistGradientBoostingClassifier(random_state=42),
    "SVM (RBF)":           make_pipeline(StandardScaler(), SVC()),
    "KNN (K=5)":           make_pipeline(StandardScaler(), KNeighborsClassifier()),
    "Naive Bayes":         GaussianNB(),
    "KNN, NO scaling":     KNeighborsClassifier(),            # contrast row
}
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
print(f"{'Model':<22}{'CV mean':>9}{'std':>7}")
for name, model in models.items():
    s = cross_val_score(model, X_train, y_train, cv=cv, scoring="accuracy")
    print(f"{name:<22}{s.mean():>9.1%}{s.std():>7.1%}")
```

**Output:**

```
Model                   CV mean    std
Logistic Regression       97.9%   2.8%
Decision Tree             90.2%   5.9%
Random Forest             97.9%   2.8%
HistGradientBoosting      95.8%   3.4%
SVM (RBF)                 98.6%   1.7%
KNN (K=5)                 95.1%   3.5%
Naive Bayes               97.2%   2.6%
KNN, NO scaling           70.5%   3.9%
```

<details>
<summary><strong>Read as text</strong> — continued: reading the table, and the trap</summary>

With a 2–3 point spread (std) across folds, the leaders are statistically tied — prefer the simplest or fastest. The last row is §4.3 again: without scaling, KNN drops from 95.1% to 70.5%.

**Trap:** scaling `X_train` once *before* `cross_val_score` leaks each validation fold into the scaler — keep it inside the pipeline. On imbalanced data, score with F1 or PR-AUC, not accuracy (Part 8).

**Go deeper:** [Ch 12 §12.10](#content/12_key_algorithms) · [Ch 13 §13.7](#content/13_model_evaluation).

</details>

---

# PART 7: UNSUPERVISED LEARNING ALGORITHMS

![Infographic comparing four unsupervised tools after scaling with StandardScaler: a K-Means elbow chart on scaled iris (inertia 600.0, 222.4, 139.8, 114.1, 90.9, 81.5, elbow at K = 2 to 3), PCA variance bars (0.73, 0.229, 0.037, 0.005; 2 PCs keep 95.8 percent; unscaled PC1 92.5 percent), DBSCAN eps 0.2 finding both moons (ARI 1.00) versus a straight K-Means cut (ARI 0.25), and a silhouette table where K = 2 scores best (0.582) but K = 3 matches the species (ARI 0.620).](diagrams/pml27_info_unsupervised_toolkit_ai.png)

<details>
<summary><strong>Read as text</strong> — no labels, so scale the features first</summary>

No labels: the algorithm finds groups (clustering) or fewer axes (PCA) itself. All four methods use distances — **scale the features first**.

</details>

---

## 7.1 K-Means Clustering

<details>
<summary><strong>Read as text</strong> — what K-Means does and the inertia formula</summary>

**What & when:** assign each point to its nearest centroid (cluster centre), move each centroid to its points' mean, repeat. Fast segmentation of round blobs when you can guess K. Pass `n_init=10` (the default `'auto'` = one k-means++ start since scikit-learn 1.4) and `random_state`.

> **Maths in one line:** `inertia = Σᵢ ‖xᵢ − μ(cluster of i)‖²` — the total squared distance from each point to its centroid; K-Means minimises it, and it keeps falling as K grows — so look for the bend, not the minimum.

</details>

```python
# K-Means on scaled iris: inertia for K = 1..6 — look for the elbow
import warnings
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
warnings.filterwarnings("ignore", message="libc not found")   # harmless notice in the browser build

X = StandardScaler().fit_transform(load_iris().data)   # distances need comparable units
inertias = []
for k in range(1, 7):
    inertias.append(KMeans(n_clusters=k, n_init=10, random_state=42).fit(X).inertia_)
    change = f"   ({inertias[-1] / inertias[-2] - 1:+.0%})" if k > 1 else ""
    print(f"K={k}: inertia = {inertias[-1]:5.1f}{change}")
assert round(inertias[0]) == 150 * 4      # K=1: 150 rows x 4 features of variance 1
```

**Output:**

```
K=1: inertia = 600.0
K=2: inertia = 222.4   (-63%)
K=3: inertia = 139.8   (-37%)
K=4: inertia = 114.1   (-18%)
K=5: inertia =  90.9   (-20%)
K=6: inertia =  81.5   (-10%)
```

<details>
<summary><strong>Read as text</strong> — continued: reading the elbow and the pitfall</summary>

Big drops at K = 2 and 3, then 20% or less: the elbow is K = 2–3 — blurry, as real elbows are, so confirm with the silhouette (§7.4).

**Pitfall:** K-Means *always* returns K round groups — even in pure noise or on crescents (§7.3).

**Go deeper:** [Ch 11 §11.4](#content/11_unsupervised_learning)

</details>

---

## 7.2 PCA (Dimensionality Reduction)

<details>
<summary><strong>Read as text</strong> — what PCA keeps and the variance-ratio formula</summary>

**What & when:** PCA rotates the data onto new axes (principal components, PCs) ordered by the variance they capture, and keeps the first few — to plot in 2-D, compress correlated features or speed up a model. `n_components` takes a count (`2`) or a fraction (`0.95`).

> **Maths in one line:** `explained variance ratio of PC k = λₖ / (λ₁ + … + λ_d)` — λ are the covariance matrix's eigenvalues, so each ratio is that PC's share of the total spread.

</details>

```python
# PCA on iris: variance kept per component, scaled vs unscaled
import numpy as np
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

X_raw = load_iris().data
X = StandardScaler().fit_transform(X_raw)

ratios = PCA().fit(X).explained_variance_ratio_
print("Variance ratio per PC:", [round(float(r), 3) for r in ratios])
print("Cumulative:           ", [round(float(c), 3) for c in np.cumsum(ratios)])

pca = PCA(n_components=0.95)            # keep just enough PCs for 95% of the variance
X_small = pca.fit_transform(X)
print(f"PCs kept for 95%: {pca.n_components_}  ->  shape {X.shape} -> {X_small.shape}")

raw = PCA().fit(X_raw).explained_variance_ratio_
print(f"Unscaled PC1 alone: {raw[0]:.1%}  (petal length's large spread dominates)")
assert abs(ratios.sum() - 1) < 1e-9
```

**Output:**

```
Variance ratio per PC: [0.73, 0.229, 0.037, 0.005]
Cumulative:            [0.73, 0.958, 0.995, 1.0]
PCs kept for 95%: 2  ->  shape (150, 4) -> (150, 2)
Unscaled PC1 alone: 92.5%  (petal length's large spread dominates)
```

<details>
<summary><strong>Read as text</strong> — continued: two PCs keep 95.8% and the unscaled trap</summary>

Two PCs keep 95.8%, so a 2-D plot of iris loses little. Unscaled, PC1's 92.5% just reflects petal length's wide spread in cm — units, not structure.

**Pitfall:** fit PCA on training data only (in a Pipeline after the scaler); it is linear — for curved structure use t-SNE or UMAP.

**Go deeper:** [Ch 11 §11.11](#content/11_unsupervised_learning)

</details>

---

## 7.3 DBSCAN (Density-Based Clustering)

<details>
<summary><strong>Read as text</strong> — DBSCAN vs K-Means and the core-point rule</summary>

**What & when:** DBSCAN grows clusters out of dense regions and labels isolated points as noise (`-1`). Use it when you don't know K, clusters have odd shapes, or you want outliers flagged.

> **Maths in one line:** `p is a core point ⇔ |{q : dist(p, q) ≤ eps}| ≥ min_samples` (p counts itself) — a cluster is core points chained within eps plus the border points they reach; the rest is noise.

| | K-Means | DBSCAN |
|---|---|---|
| Number of clusters | you choose K | found from the data |
| Cluster shape | round blobs | any shape |
| Outliers | forced into a cluster | labelled noise (`-1`) |
| Key knobs | `n_clusters` | `eps` (radius), `min_samples` (default 5) |

</details>

```python
# DBSCAN vs K-Means on two crescents, and what eps does
import warnings
from sklearn.datasets import make_moons
from sklearn.cluster import DBSCAN, KMeans
from sklearn.metrics import adjusted_rand_score
warnings.filterwarnings("ignore", message="libc not found")   # harmless notice in the browser build

X, y_true = make_moons(n_samples=300, noise=0.1, random_state=42)

def summary(labels):
    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)   # -1 = noise
    ari = adjusted_rand_score(y_true, labels)
    return f"{n_clusters:2d} clusters, {int((labels == -1).sum()):3d} noise, ARI = {ari:.2f}"

for eps in (0.05, 0.2, 0.5):
    print(f"DBSCAN eps={eps:<4}:", summary(DBSCAN(eps=eps, min_samples=5).fit_predict(X)))
km_labels = KMeans(n_clusters=2, n_init=10, random_state=42).fit_predict(X)
print("K-Means K=2     :", summary(km_labels))
assert adjusted_rand_score(y_true, km_labels) < 0.5    # a straight cut can't follow crescents
```

**Output:**

```
DBSCAN eps=0.05:  1 clusters, 294 noise, ARI = 0.00
DBSCAN eps=0.2 :  2 clusters,   0 noise, ARI = 1.00
DBSCAN eps=0.5 :  1 clusters,   0 noise, ARI = 0.00
K-Means K=2     :  2 clusters,   0 noise, ARI = 0.25
```

<details>
<summary><strong>Read as text</strong> — continued: what eps does and the pitfall</summary>

ARI (adjusted Rand index): 1 = same grouping as the true labels, about 0 = random. eps = 0.2 finds both crescents; too small makes almost everything noise, too large merges everything; K-Means cuts straight across.

**Pitfall:** one `eps` cannot fit clusters of different density (and it depends on scale) — try `sklearn.cluster.HDBSCAN` (scikit-learn ≥ 1.3), which needs no eps.

**Go deeper:** [Ch 11 §11.6](#content/11_unsupervised_learning)

</details>

---

## 7.4 Evaluating Clusters — Silhouette Score

<details>
<summary><strong>Read as text</strong> — the silhouette formula</summary>

**What & when:** with no labels there is no accuracy; the silhouette scores how much closer each point is to its own cluster than to the next. Use it with the elbow to pick K.

> **Maths in one line:** `s(i) = (b − a) / max(a, b)` — a = mean distance to the point's own cluster, b = to the nearest other cluster; averaged over all points it runs from −1 (wrong clusters) to +1 (tight, well separated).

</details>

```python
# Choosing K on scaled iris: silhouette (no labels) vs ARI against the real species
import warnings
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, adjusted_rand_score
warnings.filterwarnings("ignore", message="libc not found")   # harmless notice in the browser build

iris = load_iris()
X = StandardScaler().fit_transform(iris.data)
sil = {}
for k in range(2, 7):
    labels = KMeans(n_clusters=k, n_init=10, random_state=42).fit_predict(X)
    sil[k] = silhouette_score(X, labels)
    ari = adjusted_rand_score(iris.target, labels)
    print(f"K={k}: silhouette = {sil[k]:.3f}   ARI vs species = {ari:.3f}")

best_k = max(sil, key=sil.get)
print("Best K by silhouette:", best_k)
assert best_k == 2      # geometry sees 2 groups, although iris has 3 species
```

**Output:**

```
K=2: silhouette = 0.582   ARI vs species = 0.568
K=3: silhouette = 0.460   ARI vs species = 0.620
K=4: silhouette = 0.387   ARI vs species = 0.473
K=5: silhouette = 0.346   ARI vs species = 0.435
K=6: silhouette = 0.317   ARI vs species = 0.450
Best K by silhouette: 2
```

<details>
<summary><strong>Read as text</strong> — continued: silhouette vs species and the rule of thumb</summary>

The silhouette picks K = 2, yet iris has 3 species and the ARI peaks at K = 3: versicolor and virginica overlap. Metrics suggest K; the problem decides. Rule of thumb (Kaufman & Rousseeuw): above 0.70 strong, above 0.50 reasonable, above 0.25 weak, below that no structure.

**Pitfall:** O(n²) pairwise distances — pass `sample_size=10_000` on big data; it also favours round blobs.

**Go deeper:** [Ch 11 §11.9](#content/11_unsupervised_learning)

</details>

### Try It Yourself -- Clustering Challenge

```
  Cluster the wine dataset (178 wines, 13 features, 3 cultivars):
  1. Load it (sklearn.datasets.load_wine) and scale the features
  2. Find the elbow (inertia, K = 1..8) and confirm with the silhouette
  3. Train K-Means with your K and compare with wine.target
     using sklearn.metrics.adjusted_rand_score
```

---

# PART 8: MODEL EVALUATION & METRICS

---

## 8.1 Classification Metrics

![Infographic on classification metrics for breast cancer with malignant as the positive class: a confusion matrix of 143 test rows (TP 49, FN 4, FP 1, TN 89), step-by-step precision 49/50 = 0.980, recall 49/53 = 0.925 and F1 98/103 = 0.951, ROC-AUC 0.996 against a random 0.5 and PR-AUC 0.994 against a random 0.37 = 53/143, and a table choosing precision, recall, PR-AUC, ROC-AUC or RMSE / MAE / R2 by the cost of each mistake.](diagrams/pml27_info_classification_metrics_ai.png)

<details>
<summary><strong>Read as text</strong> — the four outcomes and precision, recall, F1</summary>

**What & when:** count a classifier's four outcomes — true/false positives and negatives (TP, FP, FN, TN) — and pick the summary that matches the cost of each mistake.

> **Maths in one line:** `precision = TP / (TP + FP)`, `recall = TP / (TP + FN)`, `F1 = 2·P·R / (P + R)` — how many alarms were real, how many real cases were caught, and their harmonic mean.

</details>

```python
# Classification metrics on breast cancer, positive class = malignant
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, f1_score, roc_auc_score, average_precision_score

X, y = load_breast_cancer(return_X_y=True)
y = 1 - y            # sklearn codes malignant as 0; make 1 = the class we must catch
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=42)

model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X_train, y_train)
y_pred = model.predict(X_test)                # labels at threshold 0.5
y_prob = model.predict_proba(X_test)[:, 1]    # P(malignant), needed for the AUCs

tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
precision, recall = tp / (tp + fp), tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)
print(f"TP={tp} FP={fp} FN={fn} TN={tn}")
print(f"precision = {tp}/{tp + fp} = {precision:.3f}   recall = {tp}/{tp + fn} = {recall:.3f}   F1 = {f1:.3f}")
print(f"ROC-AUC = {roc_auc_score(y_test, y_prob):.3f}   PR-AUC = {average_precision_score(y_test, y_prob):.3f}")
assert abs(f1 - f1_score(y_test, y_pred)) < 1e-12     # by-hand formula = sklearn
```

**Output:**

```
TP=49 FP=1 FN=4 TN=89
precision = 49/50 = 0.980   recall = 49/53 = 0.925   F1 = 0.951
ROC-AUC = 0.996   PR-AUC = 0.994
```

<details>
<summary><strong>Read as text</strong> — continued: ROC-AUC vs PR-AUC</summary>

`classification_report(y_test, y_pred)` prints these for every class; `RocCurveDisplay.from_predictions(y_test, y_prob)` draws the curve. **ROC-AUC** = the chance a random positive scores above a random negative (0.5 = coin flip). **PR-AUC** (average precision) has the positive rate as its random baseline (53/143 = 0.37), so it stays honest when positives are rare.

</details>

### Which Metric to Use

| Situation | Use this metric |
|---|---|
| Balanced classes, general use | Accuracy or F1 |
| Imbalanced classes | PR-AUC, recall at a fixed precision, F1 — never accuracy alone |
| False positives costly (spam filter hiding real mail) | Precision |
| False negatives costly (cancer screening, fraud, security) | Recall |
| Compare models across all thresholds | ROC-AUC (PR-AUC if positives are rare) |
| Probabilities must be trustworthy | Log loss or Brier score + a calibration check |
| Regression: general / robust to outliers / variance explained | RMSE / MAE / R² |

**Pitfall:** metrics treat label 1 as positive — in `load_breast_cancer` 1 is *benign*, hence the flip.

**Go deeper:** [Ch 13 §13.3–13.5](#content/13_model_evaluation); calibration in §13.12.

---

## 8.2 Cross-Validation (Don't Trust a Single Split)

![Infographic on 5-fold stratified cross-validation of a StandardScaler plus LogisticRegression pipeline on breast cancer: a 5 by 5 grid where the TEST fold moves diagonally, fold accuracies 0.974, 0.947, 0.965, 0.991 and 0.991 averaged step by step to 0.974 plus or minus 0.017, a table of recall, F1, ROC-AUC and average precision with their fold spreads, and the three splitters StratifiedKFold, GroupKFold and TimeSeriesSplit.](diagrams/pml27_info_cross_validation_ai.png)

<details>
<summary><strong>Read as text</strong> — why K folds and the mean ± std score</summary>

**What & when:** one split is one roll of the dice. K-fold cross-validation (CV) trains K times, each time testing on a different fold, so every row is tested once — for comparing and tuning models. Splitters: `StratifiedKFold` (classification), `GroupKFold` (a user's rows stay together), `TimeSeriesSplit` (train on the past, test on the future).

> **Maths in one line:** `CV score = (s₁ + … + s_K) / K`, reported as mean ± std over the folds — the std shows how much the score moves with the split.

</details>

```python
# 5-fold stratified CV of a leakage-safe pipeline: mean ± std, several metrics at once
from sklearn.datasets import load_breast_cancer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score, cross_validate

X, y = load_breast_cancer(return_X_y=True)
y = 1 - y                                    # 1 = malignant
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))  # scaler re-fit inside each fold
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scores = cross_val_score(model, X, y, cv=cv, scoring="accuracy")
print("Fold accuracies:", [round(float(s), 3) for s in scores])
print(f"Accuracy = {scores.mean():.3f} ± {scores.std():.3f}  (mean ± std over 5 folds)")

metrics = ["recall", "f1", "roc_auc", "average_precision"]
res = cross_validate(model, X, y, cv=cv, scoring=metrics)
for m in metrics:
    print(f"{m:>17} = {res['test_' + m].mean():.3f} ± {res['test_' + m].std():.3f}")
assert len(scores) == cv.get_n_splits()
```

**Output:**

```
Fold accuracies: [0.974, 0.947, 0.965, 0.991, 0.991]
Accuracy = 0.974 ± 0.017  (mean ± std over 5 folds)
           recall = 0.944 ± 0.052
               f1 = 0.963 ± 0.024
          roc_auc = 0.995 ± 0.005
average_precision = 0.994 ± 0.006
```

<details>
<summary><strong>Read as text</strong> — continued: the fold spread and the leakage pitfall</summary>

Folds span 0.947–0.991 — one split could have shown either. The ± is the **spread between folds**, not a 95% confidence interval (folds share training rows).

**Pitfall:** anything fitted on all rows before CV (scaler, feature selection, oversampling) leaks the validation folds — keep every step inside the Pipeline.

**Go deeper:** [Ch 13 §13.7](#content/13_model_evaluation)

</details>

---

## 8.3 Learning Curves — Diagnose Overfitting vs Underfitting

![Infographic on learning curves for the digits dataset with 5-fold CV at 143, 574 and 1437 training rows: a depth-2 tree underfits (training 0.40, 0.32, 0.32; validation 0.28, 0.32, 0.32), an unlimited tree overfits (training 1.00; validation 0.56, 0.75, 0.86, gap 0.44 to 0.14 and still rising) and an SVC fits well (validation 0.82, 0.96, 0.99, gap 0.01), with the formula gap = training score minus validation score and a table of fixes.](diagrams/pml27_info_learning_curves_ai.png)

<details>
<summary><strong>Read as text</strong> — training vs validation as data grows, and the gap</summary>

**What & when:** training and validation scores as the training set **grows** — shows whether more data, a bigger model or more regularisation will help.

> **Maths in one line:** `gap = training score − validation score` — a big gap means high variance (overfitting); both scores low with a small gap means high bias (underfitting).

</details>

```python
# Learning curves on digits, in numbers: underfit vs overfit vs good fit
from sklearn.datasets import load_digits
from sklearn.model_selection import learning_curve, StratifiedKFold
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC

X, y = load_digits(return_X_y=True)          # 1,797 8x8 images of digits, 10 classes
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
models = {"Tree max_depth=2  (underfit)": DecisionTreeClassifier(max_depth=2, random_state=42),
          "Tree no depth limit (overfit)": DecisionTreeClassifier(random_state=42),
          "SVC rbf kernel     (good fit)": SVC()}
for name, model in models.items():
    sizes, train_sc, val_sc = learning_curve(model, X, y, cv=cv, train_sizes=[0.1, 0.4, 1.0])
    print(name)
    for n, tr, va in zip(sizes, train_sc.mean(axis=1), val_sc.mean(axis=1)):
        print(f"   n={n:4d}  train={tr:.2f}  val={va:.2f}  gap={tr - va:.2f}")
assert val_sc.mean(axis=1)[-1] > 0.95       # the SVC generalises
```

**Output:**

```
Tree max_depth=2  (underfit)
   n= 143  train=0.40  val=0.28  gap=0.12
   n= 574  train=0.32  val=0.32  gap=0.00
   n=1437  train=0.32  val=0.32  gap=0.00
Tree no depth limit (overfit)
   n= 143  train=1.00  val=0.56  gap=0.44
   n= 574  train=1.00  val=0.75  gap=0.25
   n=1437  train=1.00  val=0.86  gap=0.14
SVC rbf kernel     (good fit)
   n= 143  train=0.99  val=0.82  gap=0.17
   n= 574  train=1.00  val=0.96  gap=0.04
   n=1437  train=1.00  val=0.99  gap=0.01
```

<details>
<summary><strong>Read as text</strong> — continued: the three patterns and their fixes</summary>

| Pattern | Training | Validation | Fix |
|---|---|---|---|
| Underfitting | low (0.32) | low, small gap (0.32) | bigger model, more features, less regularisation |
| Overfitting | high (1.00) | much lower (0.86) | more data, regularise (`max_depth`, dropout), simpler model |
| Good fit | high (1.00) | high and close (0.99) | done — tune hyperparameters |

Validation still rising at full size (0.56 → 0.75 → 0.86) → more data helps; flat (0.32) → change the model. Plot it with `LearningCurveDisplay.from_estimator(model, X, y)` (scikit-learn ≥ 1.2).

**Go deeper:** [Ch 13 §13.9](#content/13_model_evaluation)

</details>

---

## 8.4 Handling Class Imbalance

![Infographic on class imbalance with 54 positives in 1000 test rows: always predicting negative is 94.6 percent accurate with recall 0, the balanced class weight n_samples / (n_classes x n_c) gives a positive 10 and a negative about 0.53, a real precision-recall curve marks thresholds 0.5, 0.3 and 0.1 and class_weight balanced (precision 0.972, 0.909, 0.518, 0.378; recall 0.648, 0.741, 0.796, 0.833) with PR-AUC 0.815 vs 0.816, and a cheapest-first order: metric, threshold, class weights, then SMOTE inside training folds.](diagrams/pml27_info_class_imbalance_ai.png)

<details>
<summary><strong>Read as text</strong> — why accuracy lies and the balanced-weight formula</summary>

**What & when:** when one class is rare — fraud, rare diseases, defects — "always predict the common class" looks accurate and catches nothing.

> **Maths in one line:** `class_weight='balanced'` gives class c the weight `n_samples / (n_classes × n_c)` — with 5% positives each positive counts 10 and each negative ≈ 0.53, so both classes carry equal total weight.

</details>

```python
# 5% positives: accuracy lies; class weights or a lower threshold buy recall
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, average_precision_score

X, y = make_classification(n_samples=4000, n_features=10, weights=[0.95], class_sep=0.8, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=42)
print(f"Test set: {y_test.sum()} positives of {len(y_test)} ({y_test.mean():.1%})")

def show(name, pred, score=None):
    ap = "" if score is None else f"  PR-AUC={average_precision_score(y_test, score):.3f}"
    print(f"{name:<24} acc={accuracy_score(y_test, pred):.3f}  prec={precision_score(y_test, pred, zero_division=0):.3f}"
          f"  recall={recall_score(y_test, pred):.3f}{ap}")

dummy = DummyClassifier().fit(X_train, y_train).predict(X_test)      # always the majority class
show("always 'negative'", dummy)
plain = LogisticRegression(max_iter=1000).fit(X_train, y_train)
p = plain.predict_proba(X_test)[:, 1]
show("plain, threshold 0.5", plain.predict(X_test), p)
weighted = LogisticRegression(max_iter=1000, class_weight="balanced").fit(X_train, y_train)
show("class_weight='balanced'", weighted.predict(X_test), weighted.predict_proba(X_test)[:, 1])
for t in (0.3, 0.1):                  # real work: choose t on validation data, never on test
    show(f"plain, threshold {t}", (p >= t).astype(int), p)
assert recall_score(y_test, dummy) == 0 and accuracy_score(y_test, dummy) > 0.94
```

**Output:**

```
Test set: 54 positives of 1000 (5.4%)
always 'negative'        acc=0.946  prec=0.000  recall=0.000
plain, threshold 0.5     acc=0.980  prec=0.972  recall=0.648  PR-AUC=0.815
class_weight='balanced'  acc=0.917  prec=0.378  recall=0.833  PR-AUC=0.816
plain, threshold 0.3     acc=0.982  prec=0.909  recall=0.741  PR-AUC=0.815
plain, threshold 0.1     acc=0.949  prec=0.518  recall=0.796  PR-AUC=0.815
```

<details>
<summary><strong>Read as text</strong> — continued: weights vs thresholds, the methods and the test-set rule</summary>

"Always negative" is 94.6% accurate with zero recall. Class weights lift recall 0.648 → 0.833 (precision 0.378); a 0.1 threshold gets 0.796 with no retraining. PR-AUC barely moves — both slide along the same trade-off; neither ranks better.

| Method | When to use |
|---|---|
| Threshold tuning | First — it is free. Choose it on validation data; `TunedThresholdClassifierCV` (scikit-learn ≥ 1.5) does it with CV |
| `class_weight='balanced'` | One argument (`scale_pos_weight` in XGBoost / LightGBM) |
| SMOTE / oversampling | Weak models; inside CV via `imblearn.pipeline.make_pipeline(SMOTE(), model)`. With a strong model + tuned threshold it rarely helps (Elor & Averbuch-Elor, 2022) |
| Undersampling | Huge majority class — faster, but discards data |

**CRITICAL:** never resample the test set — it must keep the real class ratio. Weights and resampling also distort probabilities; recalibrate if you need them.

**Go deeper:** [Ch 10 §10.11](#content/10_supervised_learning)

</details>

---

# PART 9: HYPERPARAMETER TUNING

---

## 9.1 Grid Search vs Random Search

![Grid vs random search cheat card: fits = values per knob multiplied x folds (4 x 4 x 5 = 80 fits; 3 x 4 x 3 x 3 = 108 settings x 5 = 540 fits); on wine data with StandardScaler + SVC a 4 x 4 grid finds C=1, gamma=0.01 (CV 0.993, test 1.000) while 16 random log-scale samples find C=45.7, gamma=0.0985 (CV 0.986, test 0.972); key APIs GridSearchCV, RandomizedSearchCV, loguniform, svc__C; trap: best_score_ is optimistic, use nested CV](diagrams/pml27_info_hyperparameter_search_ai.png)

<details>
<summary><strong>Read as text</strong> — what tuning is, the cost formula and the search options</summary>

**What & when:** hyperparameters are knobs you set *before* training (`C`, `max_depth`, learning rate). Tuning keeps the setting with the best **cross-validated** score; the test set waits until the end.

> **Maths in one line:** `fits = (values per knob, multiplied) × folds` — the 4 × 4 grid below with 5 folds is 80 fits; a 3 × 4 × 3 × 3 random-forest grid is 108 × 5 = 540. Random search costs `n_iter × folds` however many knobs you add.

| Argument | Meaning | Typical |
|---|---|---|
| `param_grid` / `param_distributions` | Values to try / distributions to sample | `{"svc__C": [0.1, 1, 10]}` |
| `n_iter` | Random search: settings sampled | 20–100 |
| `cv`, `scoring` | Folds (stratified for classifiers), metric | 5, `"average_precision"` if imbalanced |

</details>

```python
# Grid vs random search over a leakage-safe Pipeline (scaler + SVM), 16 settings x 5 folds each
from scipy.stats import loguniform
from sklearn.datasets import load_wine
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = load_wine(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42)
pipe = Pipeline([("scale", StandardScaler()), ("svc", SVC())])   # scaler refit in every fold

param_grid = {"svc__C": [0.1, 1, 10, 100],            # step__param names a Pipeline knob
              "svc__gamma": [0.001, 0.01, 0.1, 1]}    # 4 x 4 = 16 settings
grid = GridSearchCV(pipe, param_grid, cv=5, scoring="accuracy").fit(X_train, y_train)

param_dist = {"svc__C": loguniform(1e-2, 1e3),        # log scale: 0.01-0.1 as likely as 100-1000
              "svc__gamma": loguniform(1e-4, 1e1)}
rand = RandomizedSearchCV(pipe, param_dist, n_iter=16, cv=5, scoring="accuracy",
                          random_state=42).fit(X_train, y_train)

for name, s in (("grid  ", grid), ("random", rand)):
    p = s.best_params_
    print(f"{name}: {len(s.cv_results_['params'])} settings x 5 folds | best C={p['svc__C']:.3g}, "
          f"gamma={p['svc__gamma']:.3g} | CV {s.best_score_:.3f} | test {s.score(X_test, y_test):.3f}")
assert len(grid.cv_results_["params"]) == 16 and grid.best_score_ > 0.95
```

**Output:**

```
grid  : 16 settings x 5 folds | best C=1, gamma=0.01 | CV 0.993 | test 1.000
random: 16 settings x 5 folds | best C=45.7, gamma=0.0985 | CV 0.986 | test 0.972
```

<details>
<summary><strong>Read as text</strong> — continued: which search wins, the optimism trap and Optuna</summary>

With two knobs that both matter, the grid wins; random search pays off when many knobs exist and few matter. One test mistake in 36 rows costs 2.8 points, so choose by CV and report the test score once.

**Pitfall:** `best_score_` is the best of many noisy scores, so it is optimistic; nested CV gives an unbiased estimate. Never tune on the test set.

**Smarter search:** Optuna (5.0, September 2026) picks each trial from earlier results: `optuna.create_study(direction="maximize").optimize(objective, n_trials=100)`, where `objective(trial)` returns a CV score. **Go deeper:** [Ch 13 §13.8](#content/13_model_evaluation) — why random beats grid, Bayesian search, successive halving.

</details>

---

# PART 10: FEATURE ENGINEERING

---

## 10.1 Practical Feature Engineering Techniques

![Feature engineering infographic: log1p(fare) = ln(1 + fare) squeezes the long tail (512 to 6.24, 7.25 to 2.11, fare skew 4.79 to 0.39 on all 891 Titanic rows); one passenger worked through 5 recipes (family 3 + 1 + 1 = 5, fare per person 21.075 / 5 = 4.21, age 2 child, ln(1 + 21.075) = 3.09, fare minus class-3 mean +10.43); months on a sin/cos circle so Dec (-0.50, +0.87) sits next to Jan (0.00, +1.00); breast-cancer selection: SelectKBest top 5 of 30, VarianceThreshold(0.01) 30 to 14 drops 2 of the top 5 (variance 0.0045); trap: fit learned statistics on training rows only](diagrams/pml27_info_feature_engineering_ai.png)

<details>
<summary><strong>Read as text</strong> — what to engineer and the log-transform maths</summary>

**What & when:** turn raw columns into signals a model can use — ratios, bins, logs, flags, group statistics, date parts. Linear models and small datasets gain most.

> **Maths in one line:** `log1p(fare) = ln(1 + fare)` — squeezes the long tail (512 → 6.24, 7.25 → 2.11); on all 891 Titanic rows fare skew drops from 4.79 to 0.39.

</details>

```python
# Six feature recipes on the first 10 Titanic passengers (real rows from the 891-row dataset)
import numpy as np
import pandas as pd
from sklearn.preprocessing import PolynomialFeatures

df = pd.DataFrame({
    "pclass": [3, 1, 3, 1, 3, 3, 1, 3, 3, 2],
    "age":    [22, 38, 26, 35, 35, np.nan, 54, 2, 27, 14],
    "sibsp":  [1, 1, 0, 1, 0, 0, 0, 3, 0, 1],
    "parch":  [0, 0, 0, 0, 0, 0, 0, 1, 2, 0],
    "fare":   [7.25, 71.2833, 7.925, 53.1, 8.05, 8.4583, 51.8625, 21.075, 11.1333, 30.0708],
    "deck":   [None, "C", None, "C", None, None, "E", None, None, None],
})
# 1. Interactions / ratios
df["family_size"] = df["sibsp"] + df["parch"] + 1
df["is_alone"] = (df["family_size"] == 1).astype(int)
df["fare_per_person"] = df["fare"] / df["family_size"]
# 2. Binning: pd.cut intervals are right-closed, so age 12 is a child and 18 a teen
age = df["age"].fillna(df["age"].median())          # real project: median of TRAIN rows only
df["age_group"] = pd.cut(age, bins=[0, 12, 18, 35, 50, 100],
                         labels=["child", "teen", "young_adult", "middle_aged", "senior"])
# 3. Log transform for a right-skewed column
df["log_fare"] = np.log1p(df["fare"])
# 4. Flags (indicator features)
df["has_cabin"] = df["deck"].notna().astype(int)
# 5. Group aggregate: fare compared with the passenger's class average
df["fare_vs_class"] = df["fare"] - df.groupby("pclass")["fare"].transform("mean")

print(f"fare skew {df['fare'].skew():.2f} -> log_fare skew {df['log_fare'].skew():.2f}")
for i in (0, 1, 7):
    r = df.loc[i]
    print(f"row {i}: family {r['family_size']}, alone {r['is_alone']}, fare/person "
          f"{r['fare_per_person']:.2f}, {r['age_group']}, log_fare {r['log_fare']:.2f}, "
          f"cabin {r['has_cabin']}, vs class {r['fare_vs_class']:+.2f}")

# 6. Polynomial features: every square and pairwise product
poly = PolynomialFeatures(degree=2, include_bias=False).fit(df[["age", "fare"]].dropna())
print("poly:", list(poly.get_feature_names_out(["age", "fare"])))
assert df["family_size"].tolist() == [2, 2, 1, 2, 1, 1, 1, 5, 3, 2]
```

**Output:**

```
fare skew 0.93 -> log_fare skew 0.38
row 0: family 2, alone 0, fare/person 3.62, young_adult, log_fare 2.11, cabin 0, vs class -3.40
row 1: family 2, alone 0, fare/person 35.64, middle_aged, log_fare 4.28, cabin 1, vs class +12.53
row 7: family 5, alone 0, fare/person 4.21, child, log_fare 3.09, cabin 0, vs class +10.43
poly: ['age', 'fare', 'age^2', 'age fare', 'fare^2']
```

<details>
<summary><strong>Read as text</strong> — continued: learned statistics must come from training rows</summary>

**Pitfalls:** medians, group means and target encodings (Part 4.2) are *learned* — compute them on training rows only, inside a Pipeline (Part 11), or the test set leaks in. Degree-2 polynomials explode: 30 columns → 495.

</details>

### Datetime Feature Engineering (common pattern)

```python
# Date parts + a cyclical month (sin, cos), so December sits next to January
import numpy as np
import pandas as pd

d = pd.DataFrame({"date": pd.to_datetime(["2024-01-15", "2024-06-22", "2024-07-04", "2024-12-25"])})
d["day_of_week"] = d["date"].dt.day_of_week               # Monday = 0 ... Sunday = 6
d["is_weekend"] = (d["day_of_week"] >= 5).astype(int)
angle = 2 * np.pi * (d["date"].dt.month - 1) / 12          # January -> angle 0
d["month_sin"], d["month_cos"] = np.sin(angle), np.cos(angle)
for r in d.itertuples():
    print(f"{r.date:%Y-%m-%d %a}: day_of_week {r.day_of_week}, weekend {r.is_weekend}, "
          f"month (sin, cos) = ({r.month_sin:+.2f}, {r.month_cos:+.2f})")
assert d["is_weekend"].tolist() == [0, 1, 0, 0]
```

**Output:**

```
2024-01-15 Mon: day_of_week 0, weekend 0, month (sin, cos) = (+0.00, +1.00)
2024-06-22 Sat: day_of_week 5, weekend 1, month (sin, cos) = (+0.50, -0.87)
2024-07-04 Thu: day_of_week 3, weekend 0, month (sin, cos) = (+0.00, -1.00)
2024-12-25 Wed: day_of_week 2, weekend 0, month (sin, cos) = (-0.50, +0.87)
```

December (−0.50, +0.87) now sits next to January (0.00, +1.00), 11 apart as raw numbers. Keep both columns: January and July share sine 0.00. Write `.dt.day_of_week` — pandas 3.1 deprecates `.dt.dayofweek`.

### Feature Selection -- Remove Useless Features

```python
# Feature selection on the breast-cancer data: F-test top 5 vs a variance cut-off (fit on TRAIN only)
from sklearn.datasets import load_breast_cancer
from sklearn.feature_selection import SelectKBest, VarianceThreshold, f_classif
from sklearn.model_selection import train_test_split

data = load_breast_cancer(as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.2, stratify=data.target, random_state=42)

kbest = SelectKBest(score_func=f_classif, k=5).fit(X_train, y_train)
top5 = list(X_train.columns[kbest.get_support()])
print("SelectKBest(k=5):", top5)

vt = VarianceThreshold(threshold=0.01).fit(X_train)       # looks at X only, never at y
dropped = list(X_train.columns[~vt.get_support()])
print(f"VarianceThreshold(0.01): {X_train.shape[1]} -> {X_train.shape[1] - len(dropped)} features")
print("  dropped top-5 features:", [f for f in top5 if f in dropped])
print(f"  e.g. variance of 'worst concave points' = {X_train['worst concave points'].var():.4f}")
assert X_train.shape[1] == 30 and "worst concave points" in top5
```

**Output:**

```
SelectKBest(k=5): ['mean perimeter', 'mean concave points', 'worst radius', 'worst perimeter', 'worst concave points']
VarianceThreshold(0.01): 30 -> 14 features
  dropped top-5 features: ['mean concave points', 'worst concave points']
  e.g. variance of 'worst concave points' = 0.0045
```

**Pitfall:** variance depends on units — concave-points values lie between 0 and 0.3, so a strong predictor looks "near-constant". Use `VarianceThreshold()` (threshold 0) only for truly constant columns, and fit any selector inside the Pipeline.

**Go deeper:** [Ch 09 — Step 5: Feature Engineering](#content/09_data_preprocessing) (cyclical features, mutual information, wrapper and embedded selection).

---

# PART 11: ML PIPELINES (PRODUCTION-READY CODE)

---

## 11.1 Why Pipelines Matter

![Pipeline plus ColumnTransformer cheat card: full_pipeline sends age and fare through SimpleImputer (median) and StandardScaler, and sex, embarked, pclass through SimpleImputer (most_frequent) and OneHotEncoder (ignore unknown), into a RandomForest with 100 trees and depth 5; 5-fold CV refits every step, giving CV 0.779 +/- 0.026 and test 0.792 on 600 simulated passengers with 20% ages missing; the saved model_pipeline.joblib predicts female, class 1, port C at 0.87 and male, class 3, unseen port Z at 0.11 without crashing](diagrams/pml27_info_sklearn_pipeline_ai.png)

<details>
<summary><strong>Read as text</strong> — the recipe-card idea, with vs without a Pipeline, and the hidden CV leak</summary>

**Simple Explanation:** a Pipeline is a recipe card — all preprocessing steps plus the model in ONE object. `fit` learns every step's numbers from training rows only; `predict` replays them on new rows.

```
  WITHOUT PIPELINE                        WITH PIPELINE
  ────────────────                        ─────────────
  imputer.fit(X_train)                    pipe.fit(X_train, y_train)
  X_tr = imputer.transform(X_train)       y_pred = pipe.predict(X_test)
  scaler.fit(X_tr)
  X_tr = scaler.transform(X_tr)           ONE object:
  model.fit(X_tr, y_train)                - CV refits every step per fold
  X_te = imputer.transform(X_test)        - identical steps when serving
  X_te = scaler.transform(X_te)           - one file to save and deploy
  y_pred = model.predict(X_te)
  8 lines to keep in sync
```

The hidden leak: fit the scaler on all training rows, *then* run `cross_val_score`, and every validation fold has shaped the preprocessing. Give CV the Pipeline instead.

</details>

## 11.2 Building a Complete Pipeline

<details>
<summary><strong>Read as text</strong> — the three building blocks and their key options</summary>

| Piece | Job | Key option |
|---|---|---|
| `SimpleImputer` | Fill gaps with a training statistic | `strategy="median"` / `"most_frequent"` |
| `OneHotEncoder` | One 0/1 column per category | `handle_unknown="ignore"`: unseen → all zeros |
| `ColumnTransformer` | Send each column group to its own steps | `remainder="drop"` (default) |

</details>

```python
# End-to-end Pipeline on Titanic-like data: impute + scale + one-hot + model, CV, save, load
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

rng = np.random.default_rng(42)                      # 600 simulated passengers
n = 600
pclass = rng.choice([1, 2, 3], n, p=[0.25, 0.2, 0.55])
sex = rng.choice(["female", "male"], n, p=[0.35, 0.65])
age = rng.normal(30, 14, n).clip(1, 80).round()
logit = 3.5 * (sex == "female") - 1.5 * (pclass - 2) - 0.05 * (age - 30) - 1.2
y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
X = pd.DataFrame({"age": age, "fare": (rng.lognormal(2.5, 0.6, n) * (4 - pclass)).round(2), "sex": sex,
                  "embarked": rng.choice(["S", "C", "Q"], n, p=[0.72, 0.19, 0.09]), "pclass": pclass})
X.loc[rng.random(n) < 0.2, "age"] = np.nan           # 20% missing ages, like the real data
X.loc[[3, 7], "embarked"] = np.nan

numeric_pipeline = Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())])
categorical_pipeline = Pipeline([("imputer", SimpleImputer(strategy="most_frequent")),
                                 ("encoder", OneHotEncoder(handle_unknown="ignore"))])
preprocessor = ColumnTransformer([("numeric", numeric_pipeline, ["age", "fare"]),
                                  ("categorical", categorical_pipeline, ["sex", "embarked", "pclass"])])
full_pipeline = Pipeline([("preprocessor", preprocessor),
                          ("classifier", RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42))])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
scores = cross_val_score(full_pipeline, X_train, y_train, cv=5)    # refits EVERY step inside each fold
full_pipeline.fit(X_train, y_train)
print(f"CV accuracy {scores.mean():.3f} +/- {scores.std():.3f} | test {full_pipeline.score(X_test, y_test):.3f}")

joblib.dump(full_pipeline, "model_pipeline.joblib")   # ONE file: preprocessing + model
loaded = joblib.load("model_pipeline.joblib")         # only load files YOU created (Part 16)
new_data = pd.DataFrame({"age": [np.nan, 40], "fare": [80.0, 7.9], "sex": ["female", "male"],
                         "embarked": ["C", "Z"], "pclass": [1, 3]})     # "Z" never seen in training
for row, p in zip(new_data.itertuples(), loaded.predict_proba(new_data)[:, 1]):
    print(f"  {row.sex}, class {row.pclass}, embarked {row.embarked}: P(survive) = {p:.2f}")
assert (loaded.predict(X_test) == full_pipeline.predict(X_test)).all()
```

**Output:**

```
CV accuracy 0.779 +/- 0.026 | test 0.792
  female, class 1, embarked C: P(survive) = 0.87
  male, class 3, embarked Z: P(survive) = 0.11
```

<details>
<summary><strong>Read as text</strong> — continued: why nothing crashed and the save-the-whole-pipeline trap</summary>

The missing age became the training median and the unseen port "Z" became all zeros — no crash.

**Pitfall:** save the WHOLE pipeline, not just the model; re-coding preprocessing for serving causes training-serving skew ([Ch 26 — The Pantry and the #1 Silent Killer](#content/26_ml_system_design)). **Go deeper:** [Ch 09 — A Leakage-Safe Pipeline](#content/09_data_preprocessing).

</details>

---

# PART 12: NEURAL NETWORKS (INTRO TO DEEP LEARNING)

---

## 12.1 Your First Neural Network with PyTorch

![First neural network comparison: one iris network 4 to 16 to 8 to 3 with parameters = inputs x outputs + outputs per dense layer (4 x 16 + 16 = 80, 16 x 8 + 8 = 136, 8 x 3 + 3 = 27, total 243); PyTorch loop of forward + loss, zero_grad, backward, step for 100 epochs with CrossEntropyLoss on raw logits and Adam lr 0.01; Keras 3 compile, fit, evaluate with EarlyStopping patience 10 where val_loss turns up while loss keeps falling; compare table of style, best use and deploy targets (as of Nov 2026: PyTorch 2.15, Keras 3.15, TorchServe archived Aug 2025)](diagrams/pml27_info_first_neural_network_ai.png)

<details>
<summary><strong>Read as text</strong> — when to use a network, the parameter count, the PyTorch training loop and common bugs</summary>

**What & when:** neural networks shine on images, text, audio and huge datasets; on small tables, tree ensembles usually match them with less effort ([Ch 14 §14.14](#content/14_neural_networks)).

> **Maths in one line:** `parameters per dense layer = inputs × outputs + outputs` — 4→16→8→3 gives 80 + 136 + 27 = **243**.

```python
# Runs locally: pip install torch scikit-learn   (PyTorch 2.15, October 2026)
import torch
from torch import nn
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

torch.manual_seed(42)
X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler().fit(X_train)                       # fit on train only
X_train_t = torch.tensor(scaler.transform(X_train), dtype=torch.float32)
X_test_t = torch.tensor(scaler.transform(X_test), dtype=torch.float32)
y_train_t = torch.tensor(y_train, dtype=torch.long)          # class ids must be int64
y_test_t = torch.tensor(y_test, dtype=torch.long)

model = nn.Sequential(nn.Linear(4, 16), nn.ReLU(),           # 4 inputs -> 16 hidden
                      nn.Linear(16, 8), nn.ReLU(),           # 16 -> 8 hidden
                      nn.Linear(8, 3))                       # 3 raw class scores (logits)
criterion = nn.CrossEntropyLoss()                            # applies softmax itself
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

model.train()
for epoch in range(1, 101):                                  # full batch: all 120 rows each step
    loss = criterion(model(X_train_t), y_train_t)            # forward pass + loss
    optimizer.zero_grad()                                    # clear old gradients
    loss.backward()                                          # backpropagation
    optimizer.step()                                         # update the weights
    if epoch % 20 == 0:
        print(f"epoch {epoch:3d}  loss {loss.item():.4f}")

model.eval()
with torch.no_grad():
    accuracy = (model(X_test_t).argmax(dim=1) == y_test_t).float().mean().item()
print(f"test accuracy {accuracy:.2%} | parameters {sum(p.numel() for p in model.parameters())}")
```

**Common bugs:** softmax before `CrossEntropyLoss` (it wants raw logits); no `optimizer.zero_grad()` (gradients pile up); labels not int64; skipping `model.eval()` + `torch.no_grad()` at test time. On real data, feed mini-batches of 32–256 rows with a `DataLoader`. No framework? scikit-learn's `MLPClassifier(hidden_layer_sizes=(16, 8))` trains the same network.

**Go deeper:** [Ch 14 §14.7a](#content/14_neural_networks) (a first network, step by step) · [Ch 16 §1.1–1.2](#content/16_deep_learning) (backprop, optimizers).

</details>

---

## 12.2 Your First Neural Network with Keras 3 (simpler)

<details>
<summary><strong>Read as text</strong> — the Keras 3 version, early stopping and Keras vs PyTorch</summary>

Keras 3 runs one codebase on a PyTorch, JAX or TensorFlow backend (TensorFlow 2.21 is maintenance-focused). Declare layers, `compile`, `fit` — no hand-written loop.

```python
# Runs locally: pip install keras torch scikit-learn   (Keras 3.15; "jax" or "tensorflow" also work as backend)
import os
os.environ["KERAS_BACKEND"] = "torch"                # set BEFORE importing keras
import keras
from keras import layers
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

keras.utils.set_random_seed(42)
X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler().fit(X_train)
X_train, X_test = scaler.transform(X_train), scaler.transform(X_test)

model = keras.Sequential([
    keras.Input(shape=(4,)),                         # Keras 3: declare the input (not input_shape=)
    layers.Dense(16, activation="relu"),
    layers.Dense(8, activation="relu"),
    layers.Dense(3, activation="softmax"),
])
model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.01),
              loss="sparse_categorical_crossentropy",   # integer labels 0, 1, 2
              metrics=["accuracy"])
model.summary()                                      # Total params: 243
early_stop = keras.callbacks.EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True)
history = model.fit(X_train, y_train, epochs=100, batch_size=16, validation_split=0.2,
                    callbacks=[early_stop], verbose=0)
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print(f"trained {len(history.history['loss'])} epochs | test accuracy {test_acc:.2%}")
```

Plot `history.history["loss"]` against `["val_loss"]` (Part 8.3): validation loss rising while training loss falls = overfitting, which `EarlyStopping` catches.

| | Keras 3 | PyTorch |
|---|---|---|
| Style | `compile` → `fit` → `evaluate` | You write the training loop |
| Best for | Quick prototypes, standard models | Most papers and jobs; custom models; Hugging Face |
| Deploy | `model.export()`: SavedModel, ONNX, LiteRT (on-device) | `torch.export`, ONNX, ExecuTorch (on-device); LLMs on vLLM / SGLang |

**Which first?** PyTorch for interviews and most jobs; Keras 3 for a quick baseline. (TorchServe, still named in older guides, was archived in August 2025.) **Go deeper:** [Ch 16 §7.4](#content/16_deep_learning) · [Ch 19](#content/19_ai_frameworks).

</details>

---

# PART 13: END-TO-END PROJECTS

---

## 13.1 End-to-End Classification — Titanic Survival

![End-to-end Titanic classification in 7 steps: load 891 rows with 174 ages missing, add family_size and is_alone, split first 712 train and 179 test, pipeline with impute + scale and impute + one-hot, compare 3 models with 5-fold CV (Logistic Regression 0.757, Gradient Boosting 0.749, Random Forest 0.736), test once (0.754 vs baseline 1 - 67/179 = 0.626), explain with permutation importance (sex 0.182, is_alone 0.023, pclass 0.016); on the real Titanic gradient boosting wins with CV 0.817 and test 0.782](diagrams/pml27_info_titanic_end_to_end_ai.png)

<details>
<summary><strong>Read as text</strong> — the task, the baseline maths and the stand-in data</summary>

**What & when:** predict yes/no from a table mixing numbers, text categories and missing values — §11.2's pipeline, end to end. Kaggle's Titanic (891 passengers, 38% survived) is the classic first project.

> **Maths in one line:** `baseline accuracy = share of the biggest class` — here 1 − 67/179 = 0.626 on the test set ("everyone died"); a model is useful only above it.

▶ Run cannot download files, so step 1 builds a stand-in with Titanic's columns and patterns. Locally, use `sns.load_dataset("titanic")` — nothing else changes.

</details>

```python
# 13.1 End-to-end classification: split first -> Pipeline -> compare with CV -> test ONCE -> explain
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# 1. LOAD - a stand-in with Titanic's columns and patterns. Real data: sns.load_dataset("titanic")
rng = np.random.default_rng(42)
n = 891
df = pd.DataFrame({
    "pclass": rng.choice([1, 2, 3], n, p=[0.24, 0.21, 0.55]),
    "sex": rng.choice(["male", "female"], n, p=[0.65, 0.35]),
    "age": rng.normal(30, 14, n).clip(1, 75).round(),
    "sibsp": rng.choice([0, 1, 2, 3, 4], n, p=[0.68, 0.23, 0.04, 0.02, 0.03]),
    "parch": rng.choice([0, 1, 2, 3, 5], n, p=[0.76, 0.13, 0.09, 0.01, 0.01]),
    "embarked": rng.choice(["S", "C", "Q"], n, p=[0.72, 0.19, 0.09]),
})
df["fare"] = (rng.lognormal(2.1, 0.5, n) * df["pclass"].map({1: 7.0, 2: 1.8, 3: 1.0})).round(2)
female, child = df["sex"].eq("female"), df["age"] < 13
p = np.select([female & (df["pclass"] < 3), female, child, df["pclass"] == 1],
              [0.95, 0.50, 0.50, 0.37], default=0.14)        # women and children first
p = np.where(df["sibsp"] + df["parch"] >= 4, p * 0.3, p)      # big families rarely made it
df["survived"] = (rng.random(n) < p).astype(int)
df.loc[rng.random(n) < 0.2, "age"] = np.nan                   # ~20% of ages unknown
df.loc[rng.choice(n, 2, replace=False), "embarked"] = np.nan
print(f"{n} passengers, {df['survived'].mean():.1%} survived, {df['age'].isna().sum()} ages missing")

# 2. FEATURES - row-by-row formulas use no other rows, so they are safe before the split
df["family_size"] = df["sibsp"] + df["parch"] + 1
df["is_alone"] = (df["family_size"] == 1).astype(int)
num, cat = ["age", "fare", "family_size", "is_alone", "pclass"], ["sex", "embarked"]

# 3. SPLIT FIRST - the test set stays locked until step 6
X_train, X_test, y_train, y_test = train_test_split(
    df[num + cat], df["survived"], test_size=0.2, random_state=42, stratify=df["survived"])

# 4. PREPROCESS INSIDE THE PIPELINE - medians and categories come from training folds only
ohe = OneHotEncoder(drop="first", handle_unknown="ignore", sparse_output=False)  # k categories -> k-1 columns
prep = ColumnTransformer([
    ("num", make_pipeline(SimpleImputer(strategy="median"), StandardScaler()), num),
    ("cat", make_pipeline(SimpleImputer(strategy="most_frequent"), ohe), cat)])
models = {"Logistic Regression": LogisticRegression(max_iter=1000),
          "Random Forest": RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42),
          "Gradient Boosting": GradientBoostingClassifier(n_estimators=50, max_depth=2, random_state=42)}

# 5. COMPARE WITH 5-FOLD STRATIFIED CV (training rows only)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_acc = {}
for name, model in models.items():
    s = cross_val_score(make_pipeline(prep, model), X_train, y_train, cv=cv)
    cv_acc[name] = s.mean()
    print(f"{name:<20} CV accuracy {s.mean():.3f} +/- {s.std():.3f}")

# 6. REFIT THE WINNER ON ALL TRAINING ROWS, TEST ONCE
best = max(cv_acc, key=cv_acc.get)
pipe = make_pipeline(prep, models[best]).fit(X_train, y_train)
acc, baseline = pipe.score(X_test, y_test), 1 - y_test.mean()     # baseline = always "died"
print(f"{best}: test accuracy {acc:.3f} vs baseline {baseline:.3f}")
assert acc > baseline

# 7. EXPLAIN - shuffle one column at a time; the accuracy drop is its importance
imp = permutation_importance(pipe, X_test, y_test, n_repeats=5, random_state=42)
for col, drop in sorted(zip(num + cat, imp.importances_mean), key=lambda t: -t[1])[:3]:
    print(f"  {col:<12} accuracy drop {drop:.3f}")
```

**Output:**

```
891 passengers, 37.5% survived, 174 ages missing
Logistic Regression  CV accuracy 0.757 +/- 0.031
Random Forest        CV accuracy 0.736 +/- 0.025
Gradient Boosting    CV accuracy 0.749 +/- 0.041
Logistic Regression: test accuracy 0.754 vs baseline 0.626
  sex          accuracy drop 0.182
  is_alone     accuracy drop 0.023
  pclass       accuracy drop 0.016
```

<details>
<summary><strong>Read as text</strong> — continued: how to read the scores, the leakage trap and further reading</summary>

**How to read it:** with a few strong, mostly additive signals, logistic regression wins and holds up on the test set; shuffling `sex` costs 18 points. On the real data the same code (scikit-learn 1.9.1) picks gradient boosting (CV 0.817, test 0.782).

**Pitfall:** filling `age` with the whole table's median before splitting leaks test rows; in the pipeline the median comes from training folds only. `LabelEncoder` is for targets, not features; `OneHotEncoder(sparse=...)` was removed in scikit-learn 1.4 — use `sparse_output`.

**Go deeper:** [Ch 09 — A Leakage-Safe Pipeline](#content/09_data_preprocessing) · [Ch 13 §13.7 Cross-Validation](#content/13_model_evaluation)

</details>

---

## 13.2 End-to-End Regression — Diabetes Progression

![End-to-end regression infographic on the diabetes table (442 patients, 10 measurements, target 25 to 346, split 353 train / 89 test): formulas MAE = mean|y - y-hat|, RMSE = sqrt(mean((y - y-hat)^2)), R^2 = 1 - sum(y - y-hat)^2 / sum(y - y-bar)^2; the mean baseline predicts y-bar so R^2 = 1 - 1 = 0 (CV -0.027); 5-fold CV R^2 bars to scale: Linear Regression 0.480 wins over Random Forest 0.430 and Gradient Boosting 0.423; tested once: MAE 42.8, RMSE 53.9, R^2 0.453; with 20,640 California districts boosting wins 0.835 vs linear 0.576; trap: scaling before cross_val_score leaks across folds](diagrams/pml27_info_regression_end_to_end_ai.png)

<details>
<summary><strong>Read as text</strong> — the task and the MAE, RMSE and R² formulas</summary>

**What & when:** predict a number. scikit-learn's bundled diabetes table (442 patients, 10 pre-scaled measurements) asks how far the disease progresses in a year (target 25 to 346).

> **Maths in one line:** `MAE = mean|y − ŷ|`, `RMSE = √mean((y − ŷ)²)`, `R² = 1 − Σ(y − ŷ)² / Σ(y − ȳ)²` — MAE is the typical miss, RMSE punishes big misses (so RMSE ≥ MAE), R² = 0 means "no better than the mean".

</details>

```python
# 13.2 End-to-end regression: baseline + 3 models compared with CV, winner tested ONCE
from sklearn.datasets import load_diabetes
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_validate, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_diabetes(return_X_y=True)                  # 442 patients x 10 features; y = progression
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
models = {
    "Baseline (mean)": DummyRegressor(),
    "Linear Regression": make_pipeline(StandardScaler(), LinearRegression()),
    "Random Forest": RandomForestRegressor(n_estimators=100, min_samples_leaf=5, random_state=42),
    "Gradient Boosting": GradientBoostingRegressor(n_estimators=200, max_depth=2, learning_rate=0.05,
                                                   random_state=42),
}
cv = KFold(n_splits=5, shuffle=True, random_state=42)
cv_r2 = {}
for name, model in models.items():
    s = cross_validate(model, X_train, y_train, cv=cv, scoring=("neg_mean_absolute_error", "r2"))
    cv_r2[name] = s["test_r2"].mean()
    print(f"{name:<18} CV MAE {-s['test_neg_mean_absolute_error'].mean():5.1f} | CV R2 {cv_r2[name]:6.3f}")

best = max(cv_r2, key=cv_r2.get)
y_pred = models[best].fit(X_train, y_train).predict(X_test)
mae, rmse = mean_absolute_error(y_test, y_pred), mean_squared_error(y_test, y_pred) ** 0.5
print(f"{best} on test: MAE {mae:.1f} | RMSE {rmse:.1f} | R2 {r2_score(y_test, y_pred):.3f}")
assert rmse >= mae                                     # big misses weigh more in RMSE
```

**Output:**

```
Baseline (mean)    CV MAE  66.9 | CV R2 -0.027
Linear Regression  CV MAE  45.0 | CV R2  0.480
Random Forest      CV MAE  47.6 | CV R2  0.430
Gradient Boosting  CV MAE  47.6 | CV R2  0.423
Linear Regression on test: MAE 42.8 | RMSE 53.9 | R2 0.453
```

<details>
<summary><strong>Read as text</strong> — continued: why linear wins here, when boosting wins, and the RMSE version trap</summary>

**How to read it:** the mean-only baseline scores R² ≈ 0, as the formula says. With 353 training rows, linear regression beats the forest and boosting. On the 20,640 districts of `fetch_california_housing()` (a download — run it locally) the order flips: linear R² 0.576 vs `HistGradientBoostingRegressor` 0.835. Boosting needs rows.

**Pitfall:** keep the scaler inside the pipeline so CV refits it per fold. `mean_squared_error(...) ** 0.5` works in every version; `root_mean_squared_error` needs scikit-learn ≥ 1.4, and `squared=False` was removed in 1.6.

**Go deeper:** [Ch 13 §13.6 Regression Metrics](#content/13_model_evaluation)

</details>

---

# PART 14: COMMON ERRORS & DEBUGGING GUIDE

---

Error texts are the libraries' own (scikit-learn 1.9, pandas 3.1).

| Symptom or error | Likely cause | Fix |
|---|---|---|
| Train 0.99, test 0.60 | Overfitting | Simpler model, more regularisation or data; early stopping or dropout for nets |
| Train 0.55, test 0.53 | Underfitting | Better features, a more flexible model, less regularisation |
| Test score suspiciously high | Leakage: a feature recorded after the outcome, or preprocessing fitted before the split | Score each feature alone (AUC ≥ 0.95 is suspect); split first, fit everything in a `Pipeline` |
| High accuracy, no positive ever caught | Class imbalance + the 0.5 threshold | `class_weight="balanced"`, tune the threshold, report PR-AUC and recall (§8.4) |
| `could not convert string to float: 'male'` | Text categories reached the model | `OneHotEncoder` in a `ColumnTransformer` |
| `Input X contains NaN.` | Missing values reached a model that can't take them | `SimpleImputer`, or `HistGradientBoosting*` (trees and forests accept NaN from scikit-learn 1.4) |
| `ConvergenceWarning: lbfgs failed to converge` | Unscaled features or too few iterations | `StandardScaler`, then raise `max_iter` |
| `The feature names should match those that were passed during fit.` | Columns renamed, reordered or missing at predict time | Save and reuse the whole pipeline (Part 16) |
| `Found unknown categories ['Q'] in column 0 during transform` | A category never seen in training | `OneHotEncoder(handle_unknown="ignore")` |
| `df[col][row] = x` changes nothing (pandas 3 warns `ChainedAssignmentError`) | Copy-on-Write: chained assignment never writes to `df` | `df.loc[row, col] = x` |
| Scores swing between runs | Small data, one lucky split | Stratified 5–10-fold CV; report mean ± std |
| Feature importance looks wrong | Impurity importance favours many-valued and correlated features | Permutation importance on held-out data (§13.1) |
| Training takes forever | Big data or a slow model | Subsample while iterating, `HistGradientBoosting*` or LightGBM, `n_jobs=-1` |

**Go deeper:** [Ch 08 — Debugging Flow](#content/08_core_concepts) · [Ch 13 §13.11 Common Evaluation Mistakes](#content/13_model_evaluation)

---
# PART 15: WHAT TO USE WHEN — ALGORITHM CHEAT SHEET

---

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                                                                         │
  │  ALGORITHM SELECTION FLOWCHART                                          │
  │                                                                         │
  │  What's your task?                                                      │
  │       │                                                                 │
  │       ├── CLASSIFICATION (predict a category)                           │
  │       │    │                                                            │
  │       │    ├── Need a baseline?                                         │
  │       │    │   → Logistic Regression                                    │
  │       │    │                                                            │
  │       │    ├── Tabular data, want best accuracy?                        │
  │       │    │   → Gradient boosting: XGBoost, LightGBM or CatBoost       │
  │       │    │                                                            │
  │       │    ├── Need interpretability?                                   │
  │       │    │   → Logistic Regression or a shallow Decision Tree         │
  │       │    │                                                            │
  │       │    ├── Text data?                                               │
  │       │    │   → Baseline: TF-IDF + Logistic Regression / Naive Bayes   │
  │       │    │   → Best: fine-tuned transformer, or embeddings + LR       │
  │       │    │                                                            │
  │       │    ├── Image data?                                              │
  │       │    │   → Fine-tune a pretrained CNN or ViT (transfer learning)  │
  │       │    │                                                            │
  │       │    └── Small dataset, no tuning time?                           │
  │       │        → Random Forest                                          │
  │       │                                                                 │
  │       ├── REGRESSION (predict a number)                                 │
  │       │    │                                                            │
  │       │    ├── Need a baseline?                                         │
  │       │    │   → Linear Regression (Ridge if features correlate)        │
  │       │    │                                                            │
  │       │    ├── Tabular data, want best accuracy?                        │
  │       │    │   → XGBoost or LightGBM                                    │
  │       │    │                                                            │
  │       │    ├── Suspect only some features matter?                       │
  │       │    │   → Lasso (L1) or Elastic Net                              │
  │       │    │                                                            │
  │       │    └── Non-linear relationship?                                 │
  │       │        → Gradient boosting or Random Forest                     │
  │       │                                                                 │
  │       ├── CLUSTERING (find groups, no labels)                           │
  │       │    │                                                            │
  │       │    ├── Know the number of groups?                               │
  │       │    │   → K-Means                                                │
  │       │    │                                                            │
  │       │    ├── Unknown number, odd shapes or noise points?              │
  │       │    │   → DBSCAN / HDBSCAN or Hierarchical Clustering            │
  │       │    │                                                            │
  │       │    └── Need soft (probabilistic) assignments?                   │
  │       │        → Gaussian Mixture Model (GMM)                           │
  │       │                                                                 │
  │       └── ANOMALY DETECTION (rare oddities, few or no labels)           │
  │            → Isolation Forest (or Local Outlier Factor)                 │
  │                                                                         │
  └─────────────────────────────────────────────────────────────────────────┘
```

### Quick Reference Table

| Algorithm | Speed | Accuracy (tables) | Interpretability | Scaling? |
|---|---|---|---|---|
| Linear / Logistic Regression | Fast | Low–Medium | High | Yes if regularised |
| Decision Tree | Fast | Low | Very high | No |
| Random Forest | Medium | Medium | Low | No |
| XGBoost / LightGBM / CatBoost | Medium | High | Low | No |
| SVM (RBF) | Slow beyond ~50K rows | Medium | Low | Yes |
| KNN | Slow to predict | Medium | Medium | Yes |
| Naive Bayes | Very fast | Low | Medium | No |
| Neural network | Slow | Medium (best on images/text) | Very low | Yes |

**Go deeper:** [Ch 12 §12.10 The Bake-Off](#content/12_key_algorithms)

---

## Review Questions — Test Your Understanding

1. You have a CSV with 10,000 rows, some missing values, and you want to predict a binary target. Walk through your complete workflow from loading to evaluation.
2. Your Random Forest gets 98% train accuracy but 72% test accuracy. What's wrong? Name 3 things you'd try.
3. When should you use StandardScaler vs MinMaxScaler? Which algorithms don't need scaling at all?
4. You have a "city" column with 500 unique cities. Why is One-Hot encoding a bad idea? What alternatives exist?
5. Write the code to compare 5 algorithms using 5-fold cross-validation and plot the results.
6. Your dataset has 100,000 rows and 200 features but your model is slow. What would you try to speed it up?

<details>
<summary>Answers</summary>

1. Load (`pd.read_csv`) → EDA (shape, dtypes, missing values, target balance) → **split first** (`stratify=y`) → `Pipeline`: `ColumnTransformer` (impute + scale numbers, impute + one-hot categories) + model, fitted on training rows only → baseline, then compare models with stratified 5-fold CV (F1 or PR-AUC if imbalanced) → tune (`RandomizedSearchCV`) → evaluate ONCE on the test set → save the pipeline (§13.1).

2. Overfitting. Try: (a) lower `max_depth` / raise `min_samples_leaf`, (b) fewer or better features, (c) more data, (d) tune with cross-validation instead of one split.

3. StandardScaler (mean 0, std 1): the default for linear models, SVM, KNN, PCA and neural nets. MinMaxScaler (0–1): when you need a bounded range (e.g. pixels) and there are no big outliers. Heavy outliers: RobustScaler. No scaling needed: decision trees, Random Forest, XGBoost, LightGBM, Naive Bayes (trees split one feature at a time on thresholds).

4. 500 sparse columns: slow, and rare cities have too few rows to learn from (overfitting). Alternatives: target encoding computed out-of-fold (`TargetEncoder`, scikit-learn ≥ 1.3; in-sample means leak the label), frequency encoding, hashing, grouping rare cities into "Other", native categorical support (LightGBM, CatBoost), or embeddings (neural nets).

5. See the "Algorithm Comparison Template" in §6.9 — `cross_val_score` in a loop plus a bar chart.

6. (a) `HistGradientBoosting*` or LightGBM instead of Random Forest (histogram binning is much faster), (b) `n_jobs=-1`, (c) subsample while experimenting, (d) drop useless features or PCA 200 → ~50 for linear/KNN/SVM models, (e) avoid kernel SVM and KNN at this size.

</details>

---

# PART 16: SAVING & LOADING MODELS

---

## 16.1 Save the Whole Pipeline (joblib)

![Save-the-whole-pipeline cheat card: iris_pipeline.joblib holds StandardScaler and LogisticRegression in one file, with iris_pipeline.json storing the scikit-learn version and feature names; joblib.load (trusted files only) turns raw input 5.1, 3.5, 1.4, 0.2 cm into setosa (p = 0.985) with the same predictions on all 150 rows; a pickle jar whose __reduce__ calls print shows that loading = running code; exact output lines; key APIs joblib.dump, joblib.load, InconsistentVersionWarning; trap: saving only the model means the scaler gets forgotten](diagrams/pml27_info_save_whole_pipeline_ai.png)

<details>
<summary><strong>Read as text</strong> — what to save and why it must be the whole pipeline</summary>

**What & when:** save the trained model so a server or batch job can predict without retraining — the **whole pipeline** in one file, so nobody forgets the scaler.

</details>

```python
# 16.1 Save the WHOLE pipeline, reload it, prove nothing changed - and see why pickles are risky
import json
import pickle
import joblib
import sklearn
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

iris = load_iris()
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(iris.data, iris.target)
joblib.dump(pipe, "iris_pipeline.joblib")                     # scaler + model in ONE file
with open("iris_pipeline.json", "w") as f:                    # what you need to rebuild it later
    json.dump({"sklearn": sklearn.__version__, "features": iris.feature_names}, f)

loaded = joblib.load("iris_pipeline.joblib")                  # only ever load files YOU made
proba = loaded.predict_proba([[5.1, 3.5, 1.4, 0.2]])[0]       # raw cm values, no manual scaling
print(f"Prediction: {iris.target_names[proba.argmax()]} (p = {proba.max():.3f})")
assert (loaded.predict(iris.data) == pipe.predict(iris.data)).all()
print("Same predictions on all 150 rows after reload")

class Payload:                                                # unpickling may CALL any function
    def __reduce__(self):
        return (print, ("!! this ran just because a pickle was loaded",))
pickle.loads(pickle.dumps(Payload()))                         # joblib.load has the same power
```

**Output:**

```
Prediction: setosa (p = 0.985)
Same predictions on all 150 rows after reload
!! this ran just because a pickle was loaded
```

<details>
<summary><strong>Read as text</strong> — continued: the two pitfalls — untrusted pickles and version mismatches</summary>

**Pitfalls:**

1. **Never load a pickle or joblib file you did not create** — loading can run any code (the last line proves it with a harmless `print`).
2. **Same versions on both sides.** Loading under another scikit-learn version is unsupported (you get `InconsistentVersionWarning`). Pin versions, keep the metadata file, retrain when you upgrade.

</details>

## 16.2 Formats and Safety — skops, ONNX, safetensors

![Model file format comparison: a decision flow asks who could have touched the file (only me, then what loads it: Python with the same versions gives joblib / pickle, no Python gives ONNX with onnxruntime; someone else gives skops with trusted types only) plus a neural-net weights branch to safetensors, PyTorch state_dict and Keras .keras; a 7-row table shows only joblib / pickle runs code on load, while skops, ONNX, safetensors, PyTorch .pt (weights_only=True since 2.6), Keras .keras (safe_mode=True) and XGBoost JSON do not; trap: weights_only=False or safe_mode=False brings the pickle risk back](diagrams/pml27_info_model_formats_safety_ai.png)

<details>
<summary><strong>Read as text</strong> — the format table: what each is for, how to save and load, and whether loading runs code</summary>

| Format | Use it for | Save → load | Runs code on load? |
|---|---|---|---|
| joblib / pickle | scikit-learn objects you made | `joblib.dump(pipe, "m.joblib")` → `joblib.load(...)` | **Yes** — same versions needed |
| skops | scikit-learn files from others | `sio.dump(pipe, "m.skops")` → `sio.load("m.skops", trusted=[...])` (review `sio.get_untrusted_types` first) | No — unknown types refused |
| ONNX | Serving without Python, any language | `to_onnx(pipe, X[:1].astype(np.float32))` → `onnxruntime.InferenceSession` | No (still sandbox it) |
| safetensors | Neural-net weights (PyTorch, Hugging Face) | `save_file(model.state_dict(), "m.safetensors")` → `model.load_state_dict(load_file(...))` | No — tensors only |
| PyTorch `.pt` | Weights only; rebuild the class first | `torch.save(model.state_dict(), "m.pt")` → `model.load_state_dict(torch.load("m.pt"))` | No: `weights_only=True` by default since PyTorch 2.6 |
| Keras `.keras` | Whole Keras 3 models; `model.export("m_export")` writes a SavedModel for serving (ONNX, LiteRT also) | `model.save("m.keras")` → `keras.saving.load_model("m.keras")` | No: `safe_mode=True` by default |
| XGBoost native | Boosted trees, long-term storage | `model.save_model("m.json")` → `load_model(...)` | No — loads in later versions too |

§18.3 serves the saved pipeline behind an API.

</details>

---

# PART 17: PROGRESSIVE PRACTICE CHALLENGES

Build these in order. "Download" datasets need internet (run them locally); the rest ship with scikit-learn.

| # | Challenge | Dataset | Skills | Target |
|---|---|---|---|---|
| **Beginner** | | | | |
| 1 | Iris species | `load_iris()` | Split, scale, KNN, evaluate | Accuracy > 95% |
| 2 | Penguin species | `sns.load_dataset("penguins")` (download) | Missing values, encode `sex`, compare models | Accuracy > 95% |
| 3 | Restaurant tips (regression) | `sns.load_dataset("tips")` (download) | First regression, MAE / RMSE | R² > 0.4 |
| **Intermediate** | | | | |
| 4 | Titanic survival | `sns.load_dataset("titanic")` (download) | Feature engineering, Pipeline, compare 5+ models, tune | Accuracy > 80% |
| 5 | California house prices | `fetch_california_housing()` (download) | Regression, learning curves, Ridge vs Lasso vs boosting | R² > 0.8 |
| 6 | Wine cultivar (3 grape varieties) | `load_wine()` | Multi-class, PCA plot, CV, confusion matrix | Accuracy > 95% |
| **Advanced** | | | | |
| 7 | Credit-card fraud | Kaggle "Credit Card Fraud Detection" (download) | 0.17% fraud: `class_weight`, threshold tuning, PR-AUC (accuracy is useless) | F1 > 0.75 on fraud |
| 8 | Handwritten digits | `load_digits()` or MNIST (download) | Pixels as features, a neural net or CNN, confusion matrix | Accuracy > 97% |
| 9 | Customer segments | Kaggle "Mall Customer Segmentation Data" (download) | K-Means, DBSCAN, silhouette, naming segments | Silhouette > 0.5 |
| 10 | Full pipeline + deployment | Any of the above | `ColumnTransformer` pipeline, `RandomizedSearchCV`, save and reload, predict from one raw row | Same predictions after reload |

**How to use them:** try each without looking at solutions; when stuck, re-read the relevant Part; afterwards note the pattern ("When I see X, I do Y").

---

# PART 18: FROM NOTEBOOK TO PRODUCTION (MLOps)

---

**MLOps** (machine-learning operations) is the discipline of moving trained models into reliable, monitored production systems. A 92%-accurate notebook is worthless if nobody can call it or it silently degrades. As Google's "Hidden Technical Debt in Machine Learning Systems" (NIPS 2015) shows, the model code is a small box among much bigger ones — data, validation, serving, monitoring.

> **Google Cloud naming:** Google's managed ML platform is **Gemini Enterprise Agent Platform** ("Agent Platform" for short), called **Vertex AI** until April 2026. The services were renamed, but the `google-cloud-aiplatform` SDK and its code did not change ([Ch 30 §4](#content/30_google_ml_ecosystem)).

---

## 18.1 The Production ML Loop

![Production ML loop map: six steps clockwise, 1 DATA (pipeline, feature store), 2 TRAIN + TRACK (params, metrics, data + code version), 3 REGISTER (version + alias champion), 4 SERVE (online API or batch job), 5 MONITOR (latency, errors, drift PSI, live metrics), 6 RETRAIN (drift, metric drop or schedule) back to DATA, with CI/CD gates tests, eval vs champion, shadow, canary; serving modes Online (ms to a few hundred ms, FastAPI, BentoML, Agent Platform Online Inference), Batch (minutes to hours, Spark, BigQuery ML, Agent Platform Batch Inference), Streaming (seconds, Pub/Sub or Kafka + Beam on Dataflow); pick-by-question table; trap: training-serving skew, ship one Pipeline or use a feature store](diagrams/pml27_info_production_loop_serving_ai.png)

<details>
<summary><strong>Read as text</strong> — the six-step loop, where the CI/CD gates sit and further reading</summary>

A production model is not a file but a loop that repeats for as long as the model lives: CI/CD gates every hand-off, and monitoring triggers retraining.

```
  1 DATA ───────► 2 TRAIN + TRACK ───► 3 REGISTER ───────► 4 SERVE
  pipeline,       params, metrics,     version + alias     online API
  feature store   data + code version  ("champion")        or batch job
       ▲                                                        │
       │          CI/CD gates every hand-off: tests,            ▼
       │          eval vs champion, shadow → canary        5 MONITOR
       │                                                   latency, errors,
       └──────── 6 RETRAIN ◄─── drift, metric drop ─────── drift (PSI),
                                or schedule                live metrics
```

**Go deeper:** [Ch 26 — ML System Design](#content/26_ml_system_design) (the interview view) · [Ch 30 §4](#content/30_google_ml_ecosystem) (on Google Cloud).

</details>

---

## 18.2 Model Serving — Online vs Batch

<details>
<summary><strong>Read as text</strong> — online, batch and streaming in one line</summary>

**Online serving** answers each request within a latency budget; **batch serving** scores a whole table on a schedule and stores the results; **streaming** sits in between. Most real systems are a hybrid: precompute what is stable, compute the rest per request.

</details>

| Mode | Latency | Use when | Examples (open source · Google Cloud) |
|---|---|---|---|
| **Online** | ms to a few hundred ms | someone is waiting: search ranking, fraud check | FastAPI, BentoML, Ray Serve, KServe · Agent Platform Online Inference |
| **Batch** | minutes to hours | scores can be precomputed: nightly churn scores | Spark or pandas job, BigQuery ML · Agent Platform Batch Inference |
| **Streaming** | seconds | features follow live events: "5 card uses in 10 minutes" | Pub/Sub or Kafka + Beam (Dataflow) or Flink |

<details>
<summary><strong>Read as text</strong> — continued: the training-serving skew trap and further reading</summary>

**Pitfall — training-serving skew:** serving computes a feature differently from training (other code, units, freshness), so a great offline model is poor live. Ship preprocessing + model as one Pipeline (Parts 11, 16) or use a feature store.

**Go deeper:** [Ch 26 Part 5 — Ship It](#content/26_ml_system_design) (latency budget, caching).

</details>

---

## 18.3 FastAPI Serving Endpoint

![FastAPI serving cheat card: rule validate the input, load the model once, log every prediction, expose /health; request flow client JSON POST /predict, Pydantic gate (HTTP 422 for pclass 5, port Z or an extra key), the Titanic Pipeline model_pipeline.joblib loaded once at startup that imputes missing age or embarked, p1 >= THRESHOLD tuned in Part 8, response with prediction, probability and model_version v1.2.3, logged for drift monitoring; /health for load balancers and Kubernetes probes, /docs for interactive docs; key pieces ConfigDict(extra=forbid, allow_inf_nan=False), Field(ge=1, le=3), .model_dump(), fastapi run serve.py --port 8080; trap: keep a plain def, not async def, for the CPU-bound model call](diagrams/pml27_info_fastapi_endpoint_ai.png)

<details>
<summary><strong>Read as text</strong> — the endpoint code, the 422 check and the async and Pydantic traps</summary>

A minimal production-shaped endpoint for the Titanic Pipeline saved in §11.2 (`model_pipeline.joblib`: impute + scale + one-hot + model in one file): validate the input, load the model once, log every prediction, expose a health check.

```python
# Runs locally: pip install "fastapi[standard]" scikit-learn pandas joblib   (FastAPI 0.16x, Pydantic v2)
# serve.py
import logging
from typing import Literal

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field

logger = logging.getLogger("serve")
app = FastAPI(title="Titanic survival API", version="1.0")

# Load once at startup, never per request. joblib/pickle can run code: load only files you made (Part 16).
pipeline = joblib.load("model_pipeline.joblib")
MODEL_VERSION = "v1.2.3"
THRESHOLD = 0.5                   # use the threshold you tuned in Part 8, not a default

class PredictRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)   # reject unknown keys, NaN, inf
    age: float | None = Field(default=None, ge=0, le=120)    # missing -> the pipeline's median imputer
    fare: float = Field(ge=0)
    sex: Literal["male", "female"]
    embarked: Literal["S", "C", "Q"] | None = None           # missing -> the most frequent port
    pclass: int = Field(ge=1, le=3)

class PredictResponse(BaseModel):
    prediction: int
    probability: float            # P(survived = 1)
    model_version: str

@app.get("/health")               # load balancers and Kubernetes probes call this
def health():
    return {"status": "ok", "model_version": MODEL_VERSION}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):  # plain def: FastAPI runs it in a thread pool
    try:
        data = {k: (np.nan if v is None else v) for k, v in req.model_dump().items()}   # None -> NaN
        p1 = float(pipeline.predict_proba(pd.DataFrame([data]))[0, 1])
    except Exception:
        logger.exception("prediction_error")
        raise HTTPException(status_code=500, detail="Prediction failed")
    logger.info("prediction", extra={"input": req.model_dump(), "p1": p1, "version": MODEL_VERSION})
    return PredictResponse(prediction=int(p1 >= THRESHOLD), probability=round(p1, 4),
                           model_version=MODEL_VERSION)

# Run: fastapi run serve.py --port 8080    (or: uvicorn serve:app --host 0.0.0.0 --port 8080)
```

A request with `"pclass": 5` or `"embarked": "Z"` gets HTTP 422 before your code runs; leaving out `age` or `embarked` is fine — the Pipeline imputes them. Interactive docs appear at `/docs`. The logged inputs feed drift monitoring (§18.8).

**Pitfalls:** a CPU-bound model call inside `async def` blocks every other request — keep a plain `def`, which FastAPI runs in a thread pool. And FastAPI 0.128+ requires Pydantic v2: `.model_dump()` and `@field_validator`, not `.dict()` and `@validator`.

**Go deeper:** [Ch 25 §16.10](#content/25_system_design_operations_case_studies) (Kubernetes probes) · Part 16 (safer formats than pickle).

</details>

---

## 18.4 Experiment Tracking

![Track, register, gate cheat card: log every run (git commit, data version, n_estimators 200 and max_depth 6 for run rf-depth6, environment, f1 and accuracy, model file); the CancerClassifier registry keeps immutable versions v1, v2 champion (serving) and v3 challenger (canary), where promote = move champion to v3 and roll back = move it back to v2; four CI/CD gates (code tests, data validation, train + evaluate beating the floor and the champion, deploy via shadow, canary and ramp) each with its fail action; key calls mlflow.log_params, mlflow.sklearn.log_model with name=model, mlflow.sklearn.autolog, set_registered_model_alias, models:/CancerClassifier@champion; trap: CI that tests only code can still ship a worse model](diagrams/pml27_info_track_register_gate_ai.png)

<details>
<summary><strong>Read as text</strong> — what to log for every run</summary>

Experiment tracking records every run so you can reproduce it. Log **code version** (git commit), **data version**, **parameters**, **environment**, **metrics** and the **model file**.

</details>

### MLflow (open source, self-hosted)

<details>
<summary><strong>Read as text</strong> — the MLflow 3 run and the autolog shortcut</summary>

```python
# Runs locally: pip install mlflow scikit-learn   (MLflow 3.x)
import mlflow
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split

mlflow.set_tracking_uri("sqlite:///mlflow.db")   # a database store; the registry (§18.5) needs one
mlflow.set_experiment("cancer-classifier")

X, y = load_breast_cancer(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

with mlflow.start_run(run_name="rf-depth6"):
    params = {"n_estimators": 200, "max_depth": 6, "random_state": 42}
    mlflow.log_params(params)
    model = RandomForestClassifier(**params).fit(X_train, y_train)
    y_pred = model.predict(X_test)
    f1 = f1_score(y_test, y_pred)
    mlflow.log_metrics({"f1": f1, "accuracy": accuracy_score(y_test, y_pred)})
    mlflow.sklearn.log_model(model, name="model",            # MLflow 3: name= replaces artifact_path=
                             input_example=X_train.head(3),  # the signature is inferred from it
                             registered_model_name="CancerClassifier")
    print(f"Run logged. F1 = {f1:.4f}")
# Compare runs in the browser: mlflow ui --backend-store-uri sqlite:///mlflow.db
```

Shortcut: `mlflow.sklearn.autolog()` before `fit` logs parameters, training metrics and the model automatically.

</details>

### Same Calls in W&B and Agent Platform Experiments

<details>
<summary><strong>Read as text</strong> — the same calls in W&amp;B and Agent Platform, and the test-set trap</summary>

| Tracker | Start a run | Log parameters and metrics |
|---|---|---|
| **Weights & Biases** (hosted) | `with wandb.init(project="cancer-classifier", config=params) as run:` | parameters go in `config`; `run.log({"f1": f1})` |
| **Agent Platform Experiments** (formerly Vertex AI Experiments) | `aiplatform.init(project="my-gcp-project", location="us-central1", experiment="cancer-classifier")`, then `with aiplatform.start_run("rf-depth6"):` | `aiplatform.log_params(params)`, `aiplatform.log_metrics({"f1": f1})` |

**Pitfall:** picking the best of 100 runs by *test* F1 turns the test set into a tuning set. Choose by validation or CV score; use the test set once.

</details>

---

## 18.5 Model Registry & Versioning

<details>
<summary><strong>Read as text</strong> — versions, aliases, promote and roll back</summary>

A **model registry** records every model version, the run that produced it, and which version is live. Versions are immutable; you promote and roll back by moving an **alias** (`champion`, `challenger`). MLflow deprecated its Staging / Production stages in 2.9 in favour of aliases; Google's Model Registry uses aliases too.

Example: v2 is `champion` (serving), v3 is `challenger` (in canary). Promote = move `champion` to v3; roll back = move it back to v2. Serving loads `models:/CancerClassifier@champion`, never a hard-coded version.

```python
# Runs locally: pip install mlflow scikit-learn   (uses the registry filled by the §18.4 run)
import mlflow
from mlflow import MlflowClient

mlflow.set_tracking_uri("sqlite:///mlflow.db")
client = MlflowClient()
name = "CancerClassifier"

for mv in client.search_model_versions(f"name='{name}'"):
    print(f"version {mv.version}  run {mv.run_id}  aliases {mv.aliases}")

client.set_registered_model_alias(name, "champion", "1")      # promote (or roll back) = move the alias
champion = client.get_model_version_by_alias(name, "champion")
model = mlflow.sklearn.load_model(f"models:/{name}@champion")
print(f"serving version {champion.version}")
```

**Pitfall:** `model_final_v2_REALLY_final.pkl` copied to a server cannot say which data or code made it. Deploy from the registry, by alias.

**Go deeper:** [Ch 30 §4.3](#content/30_google_ml_ecosystem) (Concept 4: Model Registry on Google Cloud).

</details>

---

## 18.6 CI/CD for ML

<details>
<summary><strong>Read as text</strong> — the four gates, a GitHub Actions workflow and the champion check</summary>

ML CI/CD must test **code, data and model**, and Google's MLOps guide adds **CT (continuous training)**: a deployed pipeline that retrains and validates automatically. Every stage is a gate.

| Stage | What runs | If it fails |
|---|---|---|
| 1. Code tests | unit tests on feature transforms; input-schema checks | block the merge |
| 2. Data validation | schema, missing values, ranges, drift (§18.8) | stop the pipeline, alert |
| 3. Train + evaluate | metric must beat a floor **and** the champion, overall and per segment | do not register |
| 4. Deploy | `challenger` → shadow → canary → ramp (§18.10) | automatic rollback |

A minimal GitHub Actions workflow for stages 1–3:

```yaml
# .github/workflows/ml_ci.yml
name: ML CI
on: [push, pull_request]

jobs:
  test-and-train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v7
        with:
          python-version: "3.13"   # a version every library you pin supports
          cache: pip
      - run: pip install -r requirements.txt
      - name: Unit and data tests
        run: pytest tests/ -q
      - name: Train and validate
        run: python train.py --validate-thresholds   # exits non-zero if F1 < floor or < champion
      - name: Register as challenger (main branch only)
        if: github.ref == 'refs/heads/main'
        run: python register_model.py --alias challenger
```

**Pitfall:** a pipeline can pass every unit test and still ship a worse model — stage 3 must compare against the champion on the same evaluation data.

**Go deeper:** [Ch 30 §4.3](#content/30_google_ml_ecosystem) (Concept 1: Pipelines on Google Cloud).

</details>

---

## 18.7 Monitoring — Operational Metrics

![Monitoring infographic: four golden signals with example alerts (p99 latency above 200 ms for 5 min, traffic below 50% of normal, 5xx errors above 1%, CPU above 90%); PSI = sum over bins of (a_i - e_i) x ln(a_i / e_i) with below 0.1 stable, 0.1-0.25 watch, above 0.25 significant shift, and KS D = the biggest gap between the cumulative curves; worked example on age (training N(35, 10), live N(52, 15)): top bin (0.636 - 0.100) x ln(6.36) = 0.536 x 1.850 = 0.992, other 9 bins add 0.668, PSI 1.660 = drift, with a to-scale bar chart of training versus live bin shares; results table age 1.660 / 0.545 drift, fare 0.005 / 0.017 / p 0.775 stable, age +0.5 yr with n = 200k 0.003 / 0.021 / p < 0.001 stable; four kinds of drift table; trap: judge drift by size, not p-value](diagrams/pml27_info_monitoring_drift_ai.png)

<details>
<summary><strong>Read as text</strong> — the four golden signals, Prometheus metrics and the label trap</summary>

Operational monitoring answers "is the service up and fast?" Start from Google SRE's **four golden signals** and alert on what users feel, before they notice.

| Signal | Metric | Example alert (tune to your SLO) |
|--------|--------|-----------------|
| Latency | p95 / p99 response time | p99 above the SLO (e.g. 200 ms) for 5 min |
| Traffic | requests per second | below 50% of normal |
| Errors | share of HTTP 5xx | above 1% |
| Saturation | CPU, GPU, memory, queue length | CPU above 90%, memory above 85% |

```python
# Runs locally: pip install "fastapi[standard]" prometheus-client
import time

from fastapi import FastAPI
from prometheus_client import Counter, Histogram, make_asgi_app

app = FastAPI()
app.mount("/metrics", make_asgi_app())    # Prometheus scrapes this URL

REQUESTS = Counter("model_requests_total", "Prediction requests", ["status"])
LATENCY = Histogram("model_request_latency_seconds", "Prediction latency",
                    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0])

@app.post("/predict")
def predict(x: float):
    with LATENCY.time():                   # records the duration even if the model raises
        try:
            time.sleep(0.02)               # stand-in for pipeline.predict_proba(...)
            score = 0.5
        except Exception:
            REQUESTS.labels(status="error").inc()
            raise
    REQUESTS.labels(status="success").inc()
    return {"score": score}

# p99 latency in PromQL: histogram_quantile(0.99, rate(model_request_latency_seconds_bucket[5m]))
```

**Pitfall:** never use `user_id` or a raw input as a metric label — each distinct value is a new time series. Per-request detail belongs in logs.

**Go deeper:** [Ch 25 §15.12](#content/25_system_design_operations_case_studies) (the four golden signals).

</details>

---

## 18.8 Data Drift & Concept Drift Detection

<details>
<summary><strong>Read as text</strong> — the four kinds of drift</summary>

Operational metrics say the service is up; drift detection says whether the **model is still right**.

| What changes | Formally | Example | Detect with |
|---|---|---|---|
| Data drift (covariate shift) | inputs P(X) | age ~ N(35, 10) in training, N(52, 15) live | PSI or KS test per feature |
| Concept drift | the rule P(Y ∣ X) | after an economic shock, high earners churn *less* | metrics on fresh (delayed) labels |
| Prediction drift | outputs P(ŷ) | "will churn" jumps from 10% to 40% overnight | the score distribution |
| Training-serving skew | serving ≠ training features | serving sends fare in cents | logged serving features vs training |

</details>

### Detecting Data Drift — PSI and KS Test

<details>
<summary><strong>Read as text</strong> — the binning idea and the PSI and KS formulas</summary>

**Simple explanation:** cut one feature's training values into 10 equal-count bins and drop live values into the same bins. About 10% per bin means nothing moved; 40% in the top bin means drift. The **Population Stability Index (PSI)** turns that into one number; the **Kolmogorov–Smirnov (KS) test** compares the cumulative distributions.

> **Maths in one line:** `PSI = Σᵢ (aᵢ − eᵢ) · ln(aᵢ / eᵢ)`, with eᵢ the training share and aᵢ the live share in bin i — below 0.1 stable, 0.1–0.25 watch, above 0.25 a significant shift (some teams alert at 0.2). KS: `D = maxₓ |F_train(x) − F_live(x)|`, the biggest gap between the two cumulative curves.

</details>

```python
# Drift check: PSI and the KS test per feature, training data (reference) vs last week's traffic
import numpy as np
from scipy.stats import ks_2samp

def compute_psi(reference, current, n_bins=10, eps=1e-4):
    """PSI over the reference's quantile bins. Higher = more drift."""
    edges = np.unique(np.quantile(reference, np.linspace(0, 1, n_bins + 1)))
    edges[0], edges[-1] = -np.inf, np.inf     # open-ended: keep live values outside the training range
    ref = np.histogram(reference, edges)[0] / len(reference)
    cur = np.histogram(current, edges)[0] / len(current)
    ref, cur = np.clip(ref, eps, None), np.clip(cur, eps, None)   # empty bin -> avoid log(0)
    return float(np.sum((cur - ref) * np.log(cur / ref)))

rng = np.random.default_rng(42)
checks = {   # feature: (training sample, live sample)
    "age":  (rng.normal(35, 10, 5_000), rng.normal(52, 15, 2_000)),        # users got older
    "fare": (rng.lognormal(3, 0.8, 5_000), rng.lognormal(3, 0.8, 2_000)),  # same distribution
    "age, +0.5 yr, n=200k": (rng.normal(35, 10, 200_000), rng.normal(35.5, 10, 200_000)),
}
print(f"{'feature':<22}{'PSI':>7}{'KS D':>7}{'KS p':>9}  verdict")
psi = {}
for name, (train, live) in checks.items():
    psi[name] = compute_psi(train, live)
    d, p = ks_2samp(train, live)
    verdict = "stable" if psi[name] < 0.1 else ("watch" if psi[name] < 0.25 else "DRIFT")
    p_txt = f"{p:.3f}" if p >= 0.001 else "<0.001"
    print(f"{name:<22}{psi[name]:>7.3f}{d:>7.3f}{p_txt:>9}  {verdict}")

train_age, live_age = checks["age"]
outside = np.mean(live_age > train_age.max())
print(f"live ages above the oldest training age: {outside:.1%}")
assert psi["age"] > 0.25 and psi["fare"] < 0.1
```

**Output:**

```
feature                   PSI   KS D     KS p  verdict
age                     1.660  0.545   <0.001  DRIFT
fare                    0.005  0.017    0.775  stable
age, +0.5 yr, n=200k    0.003  0.021   <0.001  stable
live ages above the oldest training age: 13.5%
```

<details>
<summary><strong>Read as text</strong> — continued: what the numbers show — judge size, not p-value, and keep bins open</summary>

**What to notice:**

1. **age** drifted (PSI 1.66); **fare** did not (PSI 0.005).
2. **The big-sample trap:** with 200,000 rows a harmless half-year shift gives KS p < 0.001 while PSI is 0.003. At production volumes almost everything is "significant" — judge the *size* (PSI or D), not the p-value.
3. **Open-ended bins:** 13.5% of live ages exceed the oldest training age. Bins that stop at the training min and max make `np.histogram` silently drop exactly those values. For a categorical feature, use each category as a bin.

</details>

### Feature and Label Monitoring

<details>
<summary><strong>Read as text</strong> — what to check, how often, and the delayed-label trap</summary>

| Check | How often | Needs labels? | Catches |
|---|---|---|---|
| PSI per input feature vs training | daily | no | data drift, pipeline and unit bugs |
| Prediction distribution (mean score, positive rate) | hourly to daily | no | prediction drift, broken upstream features |
| KS statistic D on key features | weekly | no | shape changes coarse PSI bins hide |
| F1 / AUC / calibration on delayed labels | when labels arrive | yes | concept drift — the only direct check of "still right" |

**Pitfall:** a churn label may settle 30+ days after the prediction, so accuracy alone warns you a month late — label-free checks are the early warning.

**Go deeper:** [Ch 26 — Drift: The World Moves On](#content/26_ml_system_design) · [Ch 34 Topic 10](#content/34_google_top10_ml_interview) (PSI in numbers) · [Ch 30 §4.3](#content/30_google_ml_ecosystem) (Concept 5: Google's Model Monitoring).

</details>

---

## 18.9 Retraining Triggers

![Retrain and roll out safely infographic: A/B sample size n = 2 x (1.96 + 0.84)^2 x p(1 - p) / delta^2, about 16 x p(1 - p) / delta^2, worked for a click rate moving from 10% to 11%: 15.68 x 0.09 / 0.0001 = about 14,100 users per group, and halving delta needs 4x the users; a rollout ladder from offline eval to shadow (users see v1), canary 1-5%, 20%, 50%, 100% with a guardrail breach rolling back; sticky hash routing bucket = sha256(salt:user_id) mod 100, v2 if bucket < pct, shown as a 10 x 10 grid of buckets with 5 for v2 at 5% and 15 added at 20%, giving 497, 1,938 and 4,874 of 10,000 users at 5%, 20% and 50% and 0 users moved back; retraining triggers table (data drift PSI above 0.25, performance drop below the floor, daily to monthly schedule, known events); trap: Python's built-in hash() is randomised per process](diagrams/pml27_info_retrain_rollout_ai.png)

<details>
<summary><strong>Read as text</strong> — the four triggers and the broken-feature trap</summary>

Retrain too often and you waste compute; too rarely and the model decays. Combine a schedule with event triggers.

| Trigger | Signal | Action |
|---|---|---|
| Data drift | PSI above 0.25 on a key feature for days | check data quality first; if real, retrain |
| Performance drop | delayed-label F1 / AUC below the floor | retrain now, or roll back |
| Schedule | daily (fast rankers) to monthly (stable domains) | retrain on the freshest window |
| Known event | launch, policy change, pandemic | manual retrain |

The retrained model must beat the champion on a recent held-out slice, then ship through §18.10.

**Pitfall:** if drift comes from a broken upstream feature (all zeros, wrong units), retraining teaches the model the bug. Find the cause first.

**Go deeper:** [Ch 26 — Retraining & Safe Deployment](#content/26_ml_system_design).

</details>

---

## 18.10 Safe Rollout — Shadow, Canary, A/B

<details>
<summary><strong>Read as text</strong> — shadow, canary and A/B, and the sample-size formula</summary>

Never flip 100% of traffic at once. Walk the model up a ladder — offline evaluation → shadow → canary → ramp, usually as an A/B test — with automatic rollback if a guardrail breaks.

```
  SHADOW — v2 sees real traffic; users only ever see v1
    request ──► v1 ──► response to the user
       └─copy─► v2 ──► logged only: compare its scores and latency with v1

  CANARY — a few real users get v2
    1–5% of users ──► v2    watch p99 latency, errors, guardrails;
    the rest      ──► v1    ramp 5% → 20% → 50% → 100%; breach → roll back

  A/B TEST — measure business impact
    hash(user_id) ──► group A (v1) or group B (v2); run to the planned size
```

A canary catches breakage but is too small to measure business impact — that is the A/B test's job.

> **Maths in one line:** users per A/B group `n ≈ 2 · (1.96 + 0.84)² · p(1 − p) / δ² ≈ 16 · p(1 − p) / δ²` (5% significance, 80% power) — to detect a click rate moving from 10% to 11% (δ = 0.01) you need 15.68 × 0.09 / 0.0001 ≈ 14,100 users per group; halving δ needs 4× the users.

Route users by **hashing** their id: the same user always gets the same model, with nothing to store.

</details>

```python
# Canary routing: hash each user id into 100 buckets -> sticky, the right share, nothing to store
import hashlib

def bucket(user_id: str, salt: str = "churn-v2-rollout") -> int:
    """Stable bucket 0-99. A new salt per experiment re-shuffles users independently."""
    digest = hashlib.sha256(f"{salt}:{user_id}".encode()).hexdigest()
    return int(digest, 16) % 100

def route_to_model(user_id: str, canary_pct: int = 5) -> str:
    return "v2" if bucket(user_id) < canary_pct else "v1"

users = [f"user_{i}" for i in range(10_000)]
for pct in (5, 20, 50):
    on_v2 = sum(route_to_model(u, pct) == "v2" for u in users)
    print(f"canary_pct = {pct:>2}%  ->  {on_v2:>5,} of 10,000 users on v2 ({on_v2 / len(users):.1%})")

# Sticky: the same user always gets the same model (no flip-flopping between requests)
assert all(route_to_model(u) == route_to_model(u) for u in users)
# Ramping 5% -> 20% only ADDS users: nobody who saw v2 is moved back to v1
moved_back = sum(route_to_model(u, 5) == "v2" and route_to_model(u, 20) == "v1" for u in users)
print(f"users moved back to v1 when ramping 5% -> 20%: {moved_back}")
assert moved_back == 0
```

**Output:**

```
canary_pct =  5%  ->    497 of 10,000 users on v2 (5.0%)
canary_pct = 20%  ->  1,938 of 10,000 users on v2 (19.4%)
canary_pct = 50%  ->  4,874 of 10,000 users on v2 (48.7%)
users moved back to v1 when ramping 5% -> 20%: 0
```

<details>
<summary><strong>Read as text</strong> — continued: the built-in hash() trap and further reading</summary>

**Pitfall:** never bucket with Python's built-in `hash()` — it is randomised per process for strings, so a user lands in different groups on different servers.

**Go deeper:** [Ch 26 — A/B Testing](#content/26_ml_system_design) · [Ch 34 Topic 7](#content/34_google_top10_ml_interview) (A/B design, worked).

</details>

---

## 18.11 MLOps Maturity Levels

![MLOps maturity levels and tool map: three rising steps, Level 0 manual process (nothing automated, you deploy a trained model), Level 1 ML pipeline automation (continuous training, you deploy the training pipeline) and Level 2 CI/CD pipeline automation (you deploy the pipeline via CI/CD), with the big jump at level 0 to 1; a tool table as of Nov 2026 with open-source and managed options for experiment tracking, model registry, online and batch serving, orchestration, drift detection and feature store, for example MLflow, FastAPI, Airflow, Evidently and Feast versus Agent Platform services; which level fits which team; mix-ups: level 1 is continuous training, Agent Platform was Vertex AI until April 2026, TorchServe archived in August 2025](diagrams/pml27_info_mlops_maturity_tools_ai.png)

<details>
<summary><strong>Read as text</strong> — the three maturity levels and the big jump</summary>

Google's MLOps guide (Cloud Architecture Center) grades teams by **what is automated**:

| Level | What is automated | What you deploy | Fits |
|---|---|---|---|
| **0 — Manual process** | nothing: notebooks hand a model file to engineers | a trained model | a few rarely changed models |
| **1 — ML pipeline automation** | **continuous training**: a triggered pipeline retrains and validates data and model | the training pipeline | data that keeps changing |
| **2 — CI/CD pipeline automation** | level 1 + CI/CD that tests and deploys the pipeline code itself | the pipeline, via CI/CD | many models, frequent changes |

The big jump is to level 1: you stop shipping a model and start shipping the pipeline that makes models.

</details>

### Tool Reference

<details>
<summary><strong>Read as text</strong> — open-source and Google Cloud tools for each job</summary>

As of November 2026:

| Category | Open source | Managed (cloud) |
|----------|-------------|-----------------|
| Experiment tracking | MLflow, DVC | Agent Platform Experiments, W&B, Comet |
| Model registry | MLflow Model Registry | Agent Platform Model Registry |
| Serving (online) | FastAPI, BentoML, Ray Serve, KServe, NVIDIA Dynamo-Triton (formerly Triton Inference Server); LLMs: vLLM ([Ch 19 §19.11](#content/19_ai_frameworks)) | Agent Platform Online Inference (Endpoints) |
| Serving (batch) | Spark, a scheduled pandas job | Agent Platform Batch Inference |
| Orchestration | Apache Airflow, Kubeflow Pipelines | Agent Platform Pipelines |
| Drift detection | Evidently, whylogs; Alibi Detect (source-available) | Agent Platform Model Monitoring |
| Feature store | Feast | Agent Platform Feature Store |

AWS offers the same set under **Amazon SageMaker AI**. TorchServe was archived in August 2025 — do not start new projects on it.

**Go deeper:** [Ch 30 §4.4](#content/30_google_ml_ecosystem) (the whole loop on Google Cloud).

</details>

---

## Key Takeaways

1. **Setup:** one isolated environment per project (uv, or venv + a pinned `requirements.txt`); as of Nov 2026 Python 3.13 is the safe pick — TensorFlow 2.21 ships wheels only up to 3.13.
2. **Data and EDA:** only bundled `load_*` datasets work offline (`fetch_*`, Kaggle, Hugging Face and OpenML download); set `dtype` and `na_values` in `read_csv`; drop target-leaking columns such as Titanic's `alive`.
3. **Workflow:** load → explore → split → preprocess → train → evaluate → tune → ship → monitor — and print a dummy baseline first (Titanic "everyone died" = 0.626).
4. **No leakage:** split first, then put imputing, scaling and encoding in a `ColumnTransformer` inside a `Pipeline` — CV refits it in every fold, and unseen categories become all zeros instead of crashing.
5. **Preprocessing choices:** scale for KNN, SVM, linear models and neural nets, not trees; one-hot for few categories, target encoding (inside CV) for many; `OrdinalEncoder` with an explicit order for ordered features — `LabelEncoder` is for y only.
6. **Unsupervised:** scale before K-Means, PCA and DBSCAN; pick K with the elbow plus the silhouette, but let the problem decide (on iris the silhouette prefers K = 2; there are 3 species).
7. **Model family:** tabular → gradient-boosted trees (XGBoost, LightGBM, CatBoost), though with few rows (353) a linear model can win; images and text → fine-tune a pretrained model after a classical baseline.
8. **Evaluate for the decision:** report CV as mean ± std; imbalanced classes → PR-AUC and a threshold tuned on validation data before trying resampling; regression → MAE (typical miss), RMSE (punishes big misses), R² = 0 means "no better than the mean".
9. **Tune honestly:** `best_score_` is optimistic (the maximum of noisy scores) — report the test set once or use nested CV; fight overfitting with more data, regularization, a simpler model or early stopping.
10. **Ship one versioned artifact:** preprocessing + model in one file with its library versions; joblib for your own files, skops / ONNX / safetensors for shared ones — never unpickle a file you did not create.
11. **Serve and monitor:** Pydantic v2 rejects bad input (HTTP 422); log every prediction with its model version; watch the service (latency, traffic, errors, saturation) and the model (PSI above 0.25 = significant shift; at scale judge drift by size, not p-value).
12. **Ship gradually:** shadow → 1–5% canary → ramp or A/B test, with automatic rollback; bucket users by a stable hash of their id.

---

**Back to Start:** [README — Table of Contents](../README.md)
