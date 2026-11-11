# Chapter 9 — Data Preprocessing

> **Garbage in, garbage out.** A model can only be as good as the data it learns from. Surveys of data scientists consistently find that data work — collecting, cleaning and preparing data — takes the **biggest share** of the job. The famous "80%" comes from a small 2016 CrowdFlower survey (60% cleaning and organising data + 19% collecting it); Anaconda's larger surveys put loading and cleaning at 38–45% of working time (2020–2022). The whole ML workflow is in [Ch 07](#content/07_introduction).

---

## What You'll Learn

After reading this chapter, you will be able to:
- Explain why data work is the biggest share of an ML project (and why the famous "80%" is a rough survey figure, not a law)
- Name the three kinds of missing data (MCAR, MAR, MNAR) and pick the right strategy for each
- Detect outliers with the IQR rule and Z-scores — and know when the Z-score fails
- Choose between one-hot, ordinal and target encoding, and avoid target-encoding leakage
- Apply Min-Max, Standard and Robust scaling, and know which models need no scaling at all
- Engineer useful features (dates, cycles, logs, ratios) and drop useless ones
- Build a leakage-safe scikit-learn `Pipeline` that fits every step on training data only

---

## Why Preprocess Data?

![Infographic: why preprocess data. A messy-to-clean table (Age 25, ?, 99, -3, twenty becomes 25, 25, 99, 25, 20; City NY, new york, nyc becomes new_york; Price 100, 500, 75, 200 min-max scaled to 0.06, 1.0, 0.0, 0.29), the pipeline 0 Clean + SPLIT, 1 Missing, 2 Outliers, 3 Encode, 4 Scale, 5 Features, Model with steps 1 to 5 fitted on train only, and a bar chart of the same KNN on the wine dataset: 72.2% raw vs 96.3% with StandardScaler or MinMaxScaler.](diagrams/prep09_info_why_preprocess_pipeline_ai.png)

### Simple Explanation

<details>
<summary><strong>Read as text</strong> — the cake analogy, messy vs clean data and the KNN result</summary>

Imagine trying to bake a cake with dirty eggs, wrong measurements, and missing ingredients.
It won't turn out right! Data preprocessing is about **cleaning and organizing** your data
before feeding it to a model, so the model has the best chance of learning properly.

```
RAW DATA (messy!)                  CLEAN DATA (ready!)
─────────────────────────────      ─────────────────────────────────
Age: 25, ?, 99, -3, "twenty"  →    Age: 25, 25, 99, 25, 20
                                   (? and the impossible -3 → median
                                    25; "twenty" → 20; 99 checked: real)

City: "NY", "new york", "nyc" →    City: "new_york" (all three)

Price: 100, 500, 75, 200      →    Price: 0.06, 1.0, 0.0, 0.29
(a different scale from Age!)      (min-max scaled to 0–1)

Has_Pet: "yes", 1, "Y", True  →    Has_Pet: 1, 1, 1, 1
```

One preprocessing step can matter more than the choice of model. The chart shows real results from the program in Step 4: the **same** K-nearest-neighbours classifier on scikit-learn's wine dataset, before and after scaling the features.

```chart
{
  "type": "bar",
  "data": {
    "labels": ["KNN, raw features", "KNN + StandardScaler", "KNN + MinMaxScaler"],
    "datasets": [
      {
        "label": "Test accuracy (%) on the wine dataset",
        "data": [72.2, 96.3, 96.3],
        "backgroundColor": ["rgba(239, 68, 68, 0.6)", "rgba(34, 197, 94, 0.7)", "rgba(99, 102, 241, 0.7)"],
        "borderColor": ["rgba(239, 68, 68, 1)", "rgba(34, 197, 94, 1)", "rgba(99, 102, 241, 1)"],
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Same Model, Same Data — Scaling Alone Lifts KNN from 72% to 96%" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Test accuracy (%)" }, "beginAtZero": true, "max": 100 }
    }
  }
}
```

</details>

---

## The Data Preprocessing Pipeline

<details>
<summary><strong>Read as text</strong> — the six steps and the two rules that matter more than the order</summary>

```
Raw Data
   │
   ▼
┌──────────────────────┐
│ 0. Basic clean-up,   │  Fix types and typos, drop exact
│    then SPLIT        │  duplicate rows, THEN split train/test
└──────────────────────┘
   │   every step below LEARNS from the training rows only
   ▼
┌──────────────────────┐
│ 1. Handle Missing    │  Fill in or remove empty values
│    Values            │
└──────────────────────┘
   │
   ▼
┌──────────────────────┐
│ 2. Handle Outliers   │  Fix, cap or keep extreme values
└──────────────────────┘
   │
   ▼
┌──────────────────────┐
│ 3. Encode Categorical│  Convert text categories to numbers
│    Features          │
└──────────────────────┘
   │
   ▼
┌──────────────────────┐
│ 4. Scale Features    │  Bring numbers to comparable ranges
└──────────────────────┘
   │
   ▼
┌──────────────────────┐
│ 5. Feature           │  Create new useful features,
│    Engineering       │  remove useless ones
└──────────────────────┘
   │
   ▼
Clean, Ready Data → model
```

Two rules matter more than the exact order:

1. **Split first, then fit on train only.** Any step that *learns a number* — a median, a mean, a list of categories, a target average — must learn it from the training rows, then simply apply it to validation and test data. Steps that learn nothing (fixing a typo, dropping an exact duplicate row) are safe before the split; dropping duplicates first also stops one record landing in both train and test. Why this matters: [Ch 08 §8.4](#content/08_core_concepts).
2. **The order is a guide, not a law.** Feature engineering often comes early (pull the month out of a date *before* encoding it), and tree models skip step 4 entirely.

</details>

---

## Step 1: Handling Missing Values ★★

![Infographic: handling missing values. A decision tree (under 5% of rows delete rows, 5-30% impute, over 30% consider dropping the column), a before/after table where Age 25, ?, 30, 28, ? becomes 25, 28, 30, 28, 28 with an Age_was_missing flag 0, 1, 0, 0, 1, a table of MCAR, MAR and MNAR with cause, example and fix, and the typo example where ages 25, 30, 28, 27, 290 give mean 80.0 but median 28.0.](diagrams/prep09_info_missing_values_ai.png)

![Choosing a missing-value strategy](diagrams/prep09_missing_values_ai.png)

### Why Data Goes Missing

<details>
<summary><strong>Read as text</strong> — MCAR, MAR and MNAR, and what each means for you</summary>

The *reason* a value is missing decides what you can safely do about it.

| Type | What drives the gaps | Example | What it means for you |
|---|---|---|---|
| **MCAR** — Missing Completely At Random | Nothing — pure chance | A sensor glitch; a form field skipped by accident | Dropping those rows is unbiased (you only lose data) |
| **MAR** — Missing At Random | Other columns you *can* see | Older people skip the income question more often (age is recorded) | Fill it in using the other columns (KNN or model-based imputation) |
| **MNAR** — Missing Not At Random | The missing value itself | High earners skip the income question; the sickest patients drop out of a study | No fill fully fixes it — add a "was missing" flag and find out why |

</details>

### What to Do About Missing Values

<details>
<summary><strong>Read as text</strong> — delete, impute or drop, the 5% / 30% rules and model-based options</summary>

```
              Missing value detected
                        │
       ┌────────────────┼────────────────────┐
       ▼                ▼                    ▼
  Few rows         Some rows            Most of the
  (< 5%)           (5–30%)              column (> 30%)
       │                │                    │
       ▼                ▼                    ▼
  Delete those     FILL IT IN           Consider dropping
  rows             (impute) ↓           the column
                                        (or keep only a flag)
 ┌──────────────────────────────────────────────────────┐
 │ Numerical: fill with MEAN or MEDIAN                  │
 │   Use MEAN when data is symmetric (bell-shaped)      │
 │   Use MEDIAN when data is skewed or has outliers     │
 │   Age: [25, ?, 30, 28, ?] → fill with median = 28    │
 │                                                      │
 │ Categorical: fill with MODE (most common value)      │
 │   City: [NY, ?, London, NY, ?] → fill with "NY"      │
 │                                                      │
 │ Time series: forward-fill (carry the last value on)  │
 │                                                      │
 │ Advanced: predict it from the other columns          │
 │   (KNNImputer, IterativeImputer)                     │
 │                                                      │
 │ SPECIAL CASE: sometimes missing IS informative!      │
 │   e.g., no income entered on a loan form might       │
 │   signal the applicant wants to hide something.      │
 │   → Add a new binary column: "Income_was_missing"=1  │
 └──────────────────────────────────────────────────────┘
```

The 5% and 30% cut-offs are rules of thumb, not laws — and deleting rows is only unbiased when the data is MCAR. Two more options interviewers like:

- **Let the model handle it.** scikit-learn's `HistGradientBoostingClassifier` / `Regressor`, XGBoost and LightGBM accept `NaN` directly and learn which branch missing values should follow.
- **Time series:** forward-fill (carry the last known value forward). Never back-fill — that copies a *future* value into the past (temporal leakage).

`KNNImputer` fills a gap with the average of the k most similar rows. `IterativeImputer` predicts each column from the others; it is still marked *experimental*, so it needs `from sklearn.experimental import enable_iterative_imputer` first.

</details>

### Missing Values in Code

```python
# Impute the chapter's Age/City example: median, mode and a "was missing" flag
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer

df = pd.DataFrame({
    "Age":  [25, np.nan, 30, 28, np.nan],
    "City": ["NY", np.nan, "London", "NY", np.nan],
})

age_imp = SimpleImputer(strategy="median", add_indicator=True)
age_out = age_imp.fit_transform(df[["Age"]])          # column 0 = Age, column 1 = flag
city_imp = SimpleImputer(strategy="most_frequent")
city_out = city_imp.fit_transform(df[["City"]])

print(f"Median age learned: {age_imp.statistics_[0]:.0f}, most frequent city: {city_imp.statistics_[0]}")
for (age, flag), city in zip(age_out, city_out[:, 0]):
    print(f"  Age={age:4.0f}  Age_was_missing={int(flag)}  City={city}")

# Edge case: one typo drags the MEAN but not the MEDIAN
ages = np.array([25, 30, 28, 27, 290.0])               # 290 is a typo for 29
print(f"\nWith a 290 typo: mean = {ages.mean():.1f}, median = {np.median(ages):.1f}")

# Leakage-safe: learn the fill value on TRAIN, reuse it on TEST
train = np.array([[20.0], [30.0], [np.nan], [40.0]])
test = np.array([[np.nan], [90.0]])
imp = SimpleImputer(strategy="mean").fit(train)       # mean of 20, 30, 40 = 30
print("Test after imputing with the TRAIN mean:", imp.transform(test).ravel().tolist())

assert age_imp.statistics_[0] == 28 and city_imp.statistics_[0] == "NY"
assert imp.transform(test)[0, 0] == 30
```

**Output:**

```
Median age learned: 28, most frequent city: NY
  Age=  25  Age_was_missing=0  City=NY
  Age=  28  Age_was_missing=1  City=NY
  Age=  30  Age_was_missing=0  City=London
  Age=  28  Age_was_missing=0  City=NY
  Age=  28  Age_was_missing=1  City=NY

With a 290 typo: mean = 80.0, median = 28.0
Test after imputing with the TRAIN mean: [30.0, 90.0]
```

<details>
<summary><strong>Read as text</strong> — continued: what fit learned and the leakage rule in miniature</summary>

`fit` learns the fill values (28 and "NY"); `add_indicator=True` adds the was-missing flag so the model can still use the gap as a signal. The last line is the leakage rule in miniature: the missing test value gets the **training** mean, 30 — nothing is computed from the test data.

</details>

---

## Step 2: Handling Outliers

![Infographic: finding outliers with the IQR rule. For the data 10, 15, 18, 20, 22, 25, 27, 28, 35, 100 a schematic box plot shows Q1 = 18, Q3 = 28, IQR = 10 and fences at 3 and 43, so 100 is flagged; a Z-score panel shows mean 30, std 24.28 and Z(100) = 2.88, below 3, so the Z rule misses it. A table lists what to do: fix impossible values, cap real extremes (100 to 43), keep real signal such as fraud, use robust tools when unsure.](diagrams/prep09_info_outliers_ai.png)

![Finding outliers with IQR and Z-score](diagrams/prep09_outliers_ai.png)

### Simple Explanation

<details>
<summary><strong>Read as text</strong> — the 350 cm typo and the IQR fence formula</summary>

An outlier is a value that is **far away** from the rest. Like if you're measuring the heights
of a group of adults and one row says "350 cm" — that's almost certainly a typo!

```
Data: [160, 162, 155, 158, 163, 161, 350, 159]
                                      ▲
                                  OUTLIER!
                              (typo or error)

  ●●●●●●●  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ●
  └──┬──┘                                         │
  7 normal heights                             OUTLIER
  155–163 cm                                   350 cm     (not to scale)
```

> **Maths in one line:** `IQR = Q3 − Q1`, flag x if `x < Q1 − 1.5·IQR` or `x > Q3 + 1.5·IQR` — anything more than one and a half "middle-half widths" beyond the middle half of the data is suspicious.

</details>

### How to Find Outliers

<details>
<summary><strong>Read as text</strong> — the IQR rule, Z-scores and the masking trap</summary>

**Method 1: IQR (Interquartile Range)**

$$IQR = Q3 - Q1$$

$$\text{Lower Bound} = Q1 - 1.5 \times IQR$$

$$\text{Upper Bound} = Q3 + 1.5 \times IQR$$

```
  Sort data: 10, 15, 18, 20, 22, 25, 27, 28, 35, 100

  Q1 = 25th percentile = 18    ←── Middle of lower half (10 15 18 20 22)
  Q3 = 75th percentile = 28    ←── Middle of upper half (25 27 28 35 100)
  IQR = Q3 - Q1 = 10

  Lower Bound = Q1 - 1.5 × IQR = 18 - 15 = 3
  Upper Bound = Q3 + 1.5 × IQR = 28 + 15 = 43

  Value 100 > 43  →  OUTLIER! Flag it.
```

Software computes quartiles slightly differently: numpy and pandas interpolate between points and get Q1 = 18.5, Q3 = 27.75, fences 4.625 and 41.625 — different numbers, same verdict. Why 1.5? On perfectly bell-shaped (normal) data the fences sit at about ±2.7 standard deviations, so only about 0.7% of normal points get flagged.

**Method 2: Z-Score**

$$Z = \frac{\text{value} - \text{mean}}{\text{standard deviation}}$$

```
  If |Z| > 3  →  likely an outlier
  (on normal data only about 0.3% of points have |Z| > 3)

  Example:
    Mean = 50, Std = 10
    Value = 95
    Z = (95 - 50) / 10 = 4.5  →  OUTLIER!
```

**The Z-score trap (masking):** the mean and standard deviation are themselves pulled by the outlier. On the 10 values above, the 100 drags the mean to 30 and the std to 24.28, so Z(100) is only 2.88 and the |Z| > 3 rule **misses it**. In fact, with n points no |Z| can ever exceed √(n − 1) — with 10 points that is exactly 3. Use Z-scores on large, roughly bell-shaped data; prefer the IQR rule for small or skewed data.

```chart
{
  "type": "bar",
  "data": {
    "labels": ["10","15","18","20","22","25","27","28","35","100"],
    "datasets": [{
      "label": "Data Values",
      "data": [10,15,18,20,22,25,27,28,35,100],
      "backgroundColor": ["rgba(99,102,241,0.7)","rgba(99,102,241,0.7)","rgba(99,102,241,0.7)","rgba(99,102,241,0.7)","rgba(99,102,241,0.7)","rgba(99,102,241,0.7)","rgba(99,102,241,0.7)","rgba(99,102,241,0.7)","rgba(99,102,241,0.7)","rgba(239,68,68,0.8)"],
      "borderColor": ["rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(99,102,241,1)","rgba(239,68,68,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Spotting the Outlier — 100 Is Far Above the Upper Fence of 43" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Value" }, "beginAtZero": true }
    }
  }
}
```

</details>

### Outliers in Code

```python
# IQR rule vs Z-score on the chapter's data - and why |Z| > 3 misses the 100
import numpy as np

data = np.array([10, 15, 18, 20, 22, 25, 27, 28, 35, 100])

# By hand, as in the text: Q1 = median of the lower half, Q3 = median of the upper half
q1, q3 = np.median(data[:5]), np.median(data[5:])
iqr = q3 - q1
lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(f"By hand      : Q1={q1:.2f}  Q3={q3:.2f}  IQR={iqr:.2f}  fences=[{lo:.2f}, {hi:.2f}]")
print("  outliers:", data[(data < lo) | (data > hi)].tolist())

# numpy / pandas interpolate between points, so their quartiles differ a little
q1n, q3n = np.percentile(data, [25, 75])
iqrn = q3n - q1n
lon, hin = q1n - 1.5 * iqrn, q3n + 1.5 * iqrn
print(f"np.percentile: Q1={q1n:.2f}  Q3={q3n:.2f}  IQR={iqrn:.2f}  fences=[{lon:.3f}, {hin:.3f}]")
print("  outliers:", data[(data < lon) | (data > hin)].tolist())

# Z-score: the outlier inflates the very std it is measured against (masking)
z = (data - data.mean()) / data.std()
print(f"\nmean={data.mean():.1f}  std={data.std():.2f}  ->  Z(100) = {z[-1]:.2f}")
print("  |Z| > 3 flags:", data[np.abs(z) > 3].tolist(), "<- misses the 100!")
rest = data[:-1]
print(f"  without it: mean={rest.mean():.1f}  std={rest.std():.2f}  ->  100 would be Z = {(100 - rest.mean()) / rest.std():.1f}")
print(f"  with n=10 points no |Z| can ever exceed sqrt(n-1) = {np.sqrt(len(data) - 1):.0f}")

# Capping (winsorising) keeps the row but pulls the value back to the fence
print("\nCapped at the fences:", np.clip(data, lo, hi).tolist())

assert (q1, q3, lo, hi) == (18, 28, 3, 43)
assert np.abs(z).max() < 3
```

**Output:**

```
By hand      : Q1=18.00  Q3=28.00  IQR=10.00  fences=[3.00, 43.00]
  outliers: [100]
np.percentile: Q1=18.50  Q3=27.75  IQR=9.25  fences=[4.625, 41.625]
  outliers: [100]

mean=30.0  std=24.28  ->  Z(100) = 2.88
  |Z| > 3 flags: [] <- misses the 100!
  without it: mean=22.2  std=7.08  ->  100 would be Z = 11.0
  with n=10 points no |Z| can ever exceed sqrt(n-1) = 3

Capped at the fences: [10.0, 15.0, 18.0, 20.0, 22.0, 25.0, 27.0, 28.0, 35.0, 43.0]
```

### What to Do With an Outlier

<details>
<summary><strong>Read as text</strong> — fix, cap, keep or use robust tools</summary>

Detect first, decide second — an outlier can be an error, or the most important row you have.

| Situation | What to do | Example |
|---|---|---|
| Impossible value (a data error) | Fix it, or set it to missing and impute | Height 350 cm, age −3 |
| Real but extreme, and the model is sensitive | Cap it at the fences (winsorise) or log-transform the column | One income 1,000× the rest |
| Real, and it *is* the signal | Keep it (maybe add a flag) | Fraud amounts, machine faults |
| Not sure | Use robust tools: median, `RobustScaler`, tree models, MAE or Huber loss ([Ch 08 §8.8](#content/08_core_concepts)) | — |

The fences are learned numbers too, so compute them on the training data only.

</details>

---

## Step 3: Encoding Categorical Features ★★

![Infographic comparing one-hot, ordinal and target encoding: a one-hot grid for red, blue and green over Color_blue, Color_green and Color_red; ordinal Small 0 < Medium 1 < Large 2 < XLarge 3 versus the alphabetical default; and a target-encoding table with global mean 0.625 and m = 2 where city A 0.750 becomes 0.708, B 0.333 becomes 0.450 and the one-row city C 1.000 becomes 0.750. A pick-by-question table and common mix-ups such as label codes implying red > green > blue.](diagrams/prep09_info_encoding_ai.png)

### Simple Explanation

<details>
<summary><strong>Read as text</strong> — words to numbers, and the one-hot formula</summary>

Computers only understand numbers, not words like "red" or "small."
Encoding converts words into numbers.

> **Maths in one line:** one-hot encoding maps category k of K to the vector `e_k = [0, …, 1, …, 0]` (a 1 only in column k) — every pair of categories is equally far apart, so no fake order is implied.

</details>

### Method 1: Label Encoding

<details>
<summary><strong>Read as text</strong> — label codes, and why they invent a fake order</summary>

```
  Color: ["red", "blue", "green", "red", "blue"]
           ▼
           2      0       1       2      0
  (scikit-learn sorts the categories: blue=0, green=1, red=2)

  GOOD FOR: the target y (that is what LabelEncoder is for), and as
            quick codes for tree models, which can split them in groups
  BAD FOR:  nominal features in linear models, KNN or neural nets —
            the model thinks red(2) > green(1) > blue(0)!
```

For input features, scikit-learn's tool is `OrdinalEncoder` (Method 3); `LabelEncoder` is meant for the label y.

</details>

### Method 2: One-Hot Encoding

<details>
<summary><strong>Read as text</strong> — one column per category, high-cardinality options and OneHotEncoder settings</summary>

```
  Original:          One-Hot Encoded:
  ─────────          ─────────────────────────────────────
  Color              Color_blue  Color_green  Color_red
  ─────              ──────────  ───────────  ─────────
  red       →            0           0            1
  blue      →            1           0            0
  green     →            0           1            0
  red       →            0           0            1

  GOOD FOR: Nominal categories (no natural order)
  WARNING:  K categories = K new columns
            (100 cities = 100 new columns!)

  HIGH-CARDINALITY ALTERNATIVES (many unique categories):
  ────────────────────────────────────────────────────────
  Target Encoding   → Replace category with mean of target
                      e.g., city → average house price in that city
                      (must be smoothed + cross-fitted: Method 4)
  Frequency Encoding→ Replace category with how often it appears
  Hashing           → Hash categories into a fixed number of bins
  Embedding         → Let a neural network learn a dense representation
```

`OneHotEncoder` settings worth knowing (scikit-learn):

| Setting | What it does |
|---|---|
| `handle_unknown="ignore"` | A category never seen in training becomes all zeros. The default, `"error"`, raises an error at prediction time. (`"infrequent_if_exist"` maps it to the "rare" column if you made one.) |
| `min_frequency` / `max_categories` | Lump rare categories into one "infrequent" column |
| `drop="first"` | Drop one column per feature. Only needed for **unregularised** linear models — the K columns always sum to 1, which makes them perfectly collinear (the "dummy-variable trap") |
| `sparse_output=False` | Return a normal (dense) array; the default is a sparse matrix. (Renamed from `sparse` in version 1.2.) |

`pd.get_dummies` is handy for exploring, but it does not remember the training categories, so train and test can end up with different columns. Inside a model, use `OneHotEncoder` in a `Pipeline`.

</details>

### Method 3: Ordinal Encoding

<details>
<summary><strong>Read as text</strong> — giving the order yourself</summary>

```
  Size:  Small  →  0
         Medium →  1
         Large  →  2
         XLarge →  3

  GOOD FOR: Data with natural order (Small < Medium < Large)
```

Give the order yourself: `OrdinalEncoder(categories=[["Small", "Medium", "Large", "XLarge"]])`. The default sorts alphabetically — Large=0, Medium=1, Small=2, XLarge=3 — which scrambles the meaning.

</details>

### Method 4: Target Encoding (Many Categories) ★★

<details>
<summary><strong>Read as text</strong> — the smoothing formula, the leak and cross-fitting</summary>

**Simple Explanation:** replace each category with the average label for that category — "city A → 0.75 of its houses sold within a month". One column, however many categories there are.

$$\text{enc}(c) = \frac{n_c \cdot \bar{y}_c + m \cdot \bar{y}}{n_c + m}$$

Here $\bar{y}_c$ is the category's mean target, $n_c$ its number of rows, $\bar{y}$ the global mean and $m$ the smoothing strength: a rare category is pulled toward the global mean.

**The leak:** a city with a single row gets its own label as its encoding (city C below: 1.000). The model then "predicts" the label from a copy of the label — a great training score and a disappointing test score. Two fixes:

- **Smoothing** shrinks rare categories toward the global mean (the formula above).
- **Cross-fitting** encodes each training row using target means computed on the *other* folds, so a row never sees its own label.

scikit-learn's `TargetEncoder` (since version 1.3) does both: `fit_transform(X_train, y_train)` uses internal cross-fitting, and `transform(X_test)` uses encodings learned from all the training rows. That is why `fit(X, y).transform(X)` does **not** equal `fit_transform(X, y)`.

</details>

### Encoding in Code

```python
# One-hot vs ordinal vs target encoding on the chapter's tiny examples
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder

# One-hot: learn the categories on TRAIN; an unseen colour becomes all zeros
train = pd.DataFrame({"Color": ["red", "blue", "green", "red"]})
ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False).fit(train)
print("One-hot columns:", [str(c) for c in ohe.get_feature_names_out()])
test = pd.DataFrame({"Color": ["blue", "purple"]})          # purple never seen
for colour, row in zip(test["Color"], ohe.transform(test)):
    print(f"  {colour:6s} -> {row.astype(int).tolist()}")

# Ordinal: the default order is ALPHABETICAL - wrong for sizes!
sizes = pd.DataFrame({"Size": ["Small", "Medium", "Large", "XLarge"]})
auto = OrdinalEncoder().fit_transform(sizes)[:, 0].astype(int).tolist()
order = [["Small", "Medium", "Large", "XLarge"]]
fixed = OrdinalEncoder(categories=order).fit_transform(sizes)[:, 0].astype(int).tolist()
print("\nSize        :", sizes["Size"].tolist())
print("Default     :", auto, "<- Large=0 < Medium=1 < Small=2: nonsense")
print("Order given :", fixed)

# Target encoding by hand: city -> share of houses that sold within a month
df = pd.DataFrame({"city": ["A", "A", "A", "A", "B", "B", "B", "C"],
                   "sold": [1, 1, 0, 1, 0, 0, 1, 1]})
prior = df["sold"].mean()
stats = df.groupby("city")["sold"].agg(["mean", "count"])
m = 2                                                       # smoothing strength
stats["smoothed"] = (stats["count"] * stats["mean"] + m * prior) / (stats["count"] + m)
print(f"\nGlobal mean = {prior:.3f}, smoothing m = {m}")
for city, r in stats.iterrows():
    print(f"  city {city}: n={int(r['count'])}  raw mean={r['mean']:.3f}  smoothed={r['smoothed']:.3f}")

assert fixed == [0, 1, 2, 3] and auto == [2, 1, 0, 3]
assert stats.loc["C", "mean"] == 1.0    # one row: its "encoding" IS its own label
```

**Output:**

```
One-hot columns: ['Color_blue', 'Color_green', 'Color_red']
  blue   -> [1, 0, 0]
  purple -> [0, 0, 0]

Size        : ['Small', 'Medium', 'Large', 'XLarge']
Default     : [2, 1, 0, 3] <- Large=0 < Medium=1 < Small=2: nonsense
Order given : [0, 1, 2, 3]

Global mean = 0.625, smoothing m = 2
  city A: n=4  raw mean=0.750  smoothed=0.708
  city B: n=3  raw mean=0.333  smoothed=0.450
  city C: n=1  raw mean=1.000  smoothed=0.750
```

<details>
<summary><strong>Read as text</strong> — continued: how smoothing moves cities A, B and C</summary>

City C has one row, so its raw encoding is a copy of its label (1.000); smoothing pulls it to 0.750, toward the global mean 0.625. City A, with four rows, barely moves (0.750 → 0.708).

</details>

### Which Encoder When?

<details>
<summary><strong>Read as text</strong> — the five encoders compared in one table</summary>

| Encoder | Columns added | Implies an order? | Best for | Watch out |
|---|---|---|---|---|
| One-hot | K (one per category) | No | Nominal features with few categories (colour, plan) | Explodes with thousands of categories; set `handle_unknown` |
| Ordinal | 1 | Yes | Truly ordered features (size, education level) | Give the order explicitly — the default is alphabetical |
| Label / integer codes | 1 | Yes (a fake one) | The target y; quick codes for tree models | Misleads linear models, KNN and neural nets |
| Target | 1 (one per class for multiclass) | No | High-cardinality features (city, product ID) | Leaks unless smoothed and cross-fitted |
| Frequency / hashing / embedding | 1 / fixed number / dense vector | No | Very many categories, streaming data, deep learning | Hash collisions; embeddings need lots of data |

</details>

---

## Step 4: Feature Scaling / Normalization ★★

![Infographic comparing Min-Max, Standard and Robust scaling: ages 20 to 60 min-max scaled to 0, 0.25, 0.5, 0.75, 1; scores 60 to 100 standardized with mean 80 and std 14.14 to -1.41 up to 1.41; a table showing that with incomes 30, 35, 40, 45, 50 and an outlier 40000 Min-Max squashes the normal rows to 0.0, Standard to -0.45, while Robust keeps -1.0, -0.6, -0.2, 0.2, 0.6; a bar chart of the wine dataset where KNN goes from 72.2% raw to 96.3% scaled and a tree stays at 94.4%; and a pick-by-question table.](diagrams/prep09_info_scaling_ai.png)

<details>
<summary><strong>Read as text</strong> — the three scaling formulas in one line</summary>

> **Maths in one line:** min-max `(x − min) / (max − min)`, standard `(x − mean) / std`, robust `(x − median) / IQR` — each subtracts a "centre" and divides by a "spread", both learned from the training data.

</details>

### Why Scale?

<details>
<summary><strong>Read as text</strong> — why scale, and which models need it</summary>

```
BEFORE SCALING:                       AFTER MIN-MAX SCALING:
───────────────────────────────────   ──────────────────────────────────
Feature A: [1, 2, 3, 4]               Feature A: [0.0, 0.33, 0.67, 1.0]
Feature B: [1000, 2000, 3000, 4000]   Feature B: [0.0, 0.33, 0.67, 1.0]

Distances and gradients are           Both features now count on
dominated by B, just because          the same footing.
its numbers are bigger!
```

Who needs scaling?

- **Distance-based models** — KNN, K-means, SVMs with an RBF kernel: a feature measured in thousands swamps one measured in decimals.
- **Gradient-descent models** — linear and logistic regression, neural networks: unscaled features turn the loss surface into a long thin valley and training zig-zags ([Ch 08 §8.9](#content/08_core_concepts)).
- **Regularised models and PCA** — the L1/L2 penalty and the variance PCA maximises both depend on the units.
- **Not tree models** — decision trees, random forests, gradient boosting. A split such as "income > 50K" works the same in any units.

</details>

```python
# KNN on the wine dataset: the same model with and without scaling
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.tree import DecisionTreeClassifier

X, y = load_wine(return_X_y=True)                  # 178 wines, 13 chemical features
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=0, stratify=y)
print(f"proline ranges {X[:, 12].min():.0f}-{X[:, 12].max():.0f}, "
      f"hue ranges {X[:, 10].min():.2f}-{X[:, 10].max():.2f}")

models = {
    "KNN, raw features": KNeighborsClassifier(),
    "KNN + StandardScaler": make_pipeline(StandardScaler(), KNeighborsClassifier()),
    "KNN + MinMaxScaler": make_pipeline(MinMaxScaler(), KNeighborsClassifier()),
    "Tree, raw features": DecisionTreeClassifier(random_state=0),
    "Tree + StandardScaler": make_pipeline(StandardScaler(), DecisionTreeClassifier(random_state=0)),
}
acc = {}
for name, model in models.items():
    acc[name] = model.fit(X_train, y_train).score(X_test, y_test)
    print(f"{name:22s} test accuracy = {acc[name]:.3f}")

assert acc["KNN + StandardScaler"] > acc["KNN, raw features"] + 0.2
assert acc["Tree, raw features"] == acc["Tree + StandardScaler"]   # trees don't care
```

**Output:**

```
proline ranges 278-1680, hue ranges 0.48-1.71
KNN, raw features      test accuracy = 0.722
KNN + StandardScaler   test accuracy = 0.963
KNN + MinMaxScaler     test accuracy = 0.963
Tree, raw features     test accuracy = 0.944
Tree + StandardScaler  test accuracy = 0.944
```

<details>
<summary><strong>Read as text</strong> — continued: what the wine result shows</summary>

Proline (hundreds to over a thousand) dominated every distance, so KNN almost ignored the other 12 features. Scaling lifts the same KNN from 72.2% to 96.3%; the decision tree scores 94.4% either way. The scalers sit inside `make_pipeline`, so they learn their numbers from the training rows only.

</details>

### Method 1: Min-Max Normalization (scales to 0–1)

<details>
<summary><strong>Read as text</strong> — the min-max formula on ages 20 to 60</summary>

$$X_{\text{scaled}} = \frac{X - X_{\min}}{X_{\max} - X_{\min}}$$

```
  Example:  Ages = [20, 30, 40, 50, 60]
            X_min = 20,  X_max = 60

            20 → (20-20)/(60-20) = 0.00
            30 → (30-20)/(60-20) = 0.25
            40 → (40-20)/(60-20) = 0.50
            50 → (50-20)/(60-20) = 0.75
            60 → (60-20)/(60-20) = 1.00
```

</details>

### Method 2: Standardization / Z-score Scaling (mean=0, std=1)

<details>
<summary><strong>Read as text</strong> — the z-score formula on scores 60 to 100, and n vs n − 1</summary>

$$X_{\text{scaled}} = \frac{X - \text{mean}}{\text{std deviation}}$$

```
  Example:  Scores = [60, 70, 80, 90, 100]
            Mean = 80,  Std = √200 = 14.14

            60 → (60-80)/14.14 = -1.41
            70 → (70-80)/14.14 = -0.71
            80 → (80-80)/14.14 =  0.00
            90 → (90-80)/14.14 =  0.71
           100 →(100-80)/14.14 =  1.41

  Result: mean 0, standard deviation 1
```

The std here divides by n (the "population" std), which is what scikit-learn's `StandardScaler` does. Dividing by n − 1 gives 15.81 and z = ±1.26 / ±0.63 — the same idea with slightly different numbers. Standardizing changes the units, not the shape: skewed data stays skewed (it does **not** become a bell curve).

</details>

### Method 3: Robust Scaling (When There Are Outliers)

<details>
<summary><strong>Read as text</strong> — median and IQR, and the income outlier</summary>

$$X_{\text{scaled}} = \frac{X - \text{median}}{IQR}$$

The median and IQR barely move when an outlier appears, so the normal values keep their spread. Example: incomes (in thousands) 30, 35, 40, 45, 50 plus a typo of 40,000. The median is 42.5 and the IQR is 48.75 − 36.25 = 12.5 (numpy's quartiles), so 30 → (30 − 42.5) / 12.5 = −1.0 and 50 → 0.6. Min-max scaling, by contrast, divides by 39,970 and squashes all five normal incomes to about 0.00. `RobustScaler` does this (its default range is the 25th–75th percentile). It does not *remove* the outlier — 40,000 still comes out at 3,196.6 — so cap it too if your model is sensitive.

</details>

### CRITICAL: Fit the Scaler on Training Data ONLY

<details>
<summary><strong>Read as text</strong> — the wrong and the right way to fit a scaler</summary>

```
  ╔══════════════════════════════════════════════════════════════╗
  ║  DATA LEAKAGE WARNING                                        ║
  ╠══════════════════════════════════════════════════════════════╣
  ║  WRONG (leaks test info into training):                      ║
  ║    scaler.fit(ALL data)                                      ║
  ║    X_train_scaled = scaler.transform(X_train)                ║
  ║    X_test_scaled  = scaler.transform(X_test)                 ║
  ║                                                              ║
  ║  CORRECT:                                                    ║
  ║    scaler.fit(X_train ONLY)   ← learn mean/min from train    ║
  ║    X_train_scaled = scaler.transform(X_train)                ║
  ║    X_test_scaled  = scaler.transform(X_test)  ← apply only   ║
  ╚══════════════════════════════════════════════════════════════╝

  Why? If you fit on ALL data, the test set's stats (mean, min, max)
  "leak" into training — your model cheats! In real life you won't
  have test data when you train, so only use training stats.
```

This is the most common form of preprocessing leakage. The four kinds of leakage and how to catch them are in [Ch 08 §8.4](#content/08_core_concepts).

</details>

### Which to Use?

<details>
<summary><strong>Read as text</strong> — the scaler chooser table and the min-max vs standard chart</summary>

| Scaler | Formula | Use when | Weak spot |
|---|---|---|---|
| **StandardScaler** | (x − mean) / std | The usual default: linear and logistic regression, SVM, PCA, KNN, K-means, neural nets on tabular data | The mean and std are pulled by outliers |
| **MinMaxScaler** | (x − min) / (max − min) | You need a fixed 0–1 range (pixels ÷ 255, some neural nets) and there are no big outliers | One outlier squashes everything else toward 0 |
| **RobustScaler** | (x − median) / IQR | Heavy outliers you cannot remove | The output has no fixed range |
| **None** | — | Tree models: decision trees, random forests, gradient boosting | — |

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Age 20", "Age 30", "Age 40", "Age 50", "Age 60"],
    "datasets": [
      {
        "label": "Min-Max (0 to 1)",
        "data": [0.0, 0.25, 0.5, 0.75, 1.0],
        "backgroundColor": "rgba(99, 102, 241, 0.7)",
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 1
      },
      {
        "label": "Standardized (mean 0, std 1)",
        "data": [-1.41, -0.71, 0.0, 0.71, 1.41],
        "backgroundColor": "rgba(34, 197, 94, 0.7)",
        "borderColor": "rgba(34, 197, 94, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Same Five Ages, Two Scalings — Min-Max Spans 0 to 1, Standardizing Centres on 0" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Scaled value" } }
    }
  }
}
```

</details>

### Scaling in Code

```python
# Min-Max, Standard and Robust scaling on the chapter's numbers (+ an outlier)
import numpy as np
from sklearn.preprocessing import MinMaxScaler, RobustScaler, StandardScaler

ages = np.array([[20], [30], [40], [50], [60]], dtype=float)
scores = np.array([[60], [70], [80], [90], [100]], dtype=float)
print("Min-Max ages   :", MinMaxScaler().fit_transform(ages).ravel().round(2).tolist())
std = StandardScaler().fit(scores)
print(f"Scores: mean = {std.mean_[0]:.0f}, std = {std.scale_[0]:.2f} (divides by n, not n-1)")
print("Standard scores:", std.transform(scores).ravel().round(2).tolist())

# Five normal incomes (thousands) + one typo with three extra zeros
inc = np.array([[30], [35], [40], [45], [50], [40000]], dtype=float)
print("\nIncomes:", inc.ravel().astype(int).tolist())
for name, sc in [("MinMax", MinMaxScaler()), ("Standard", StandardScaler()), ("Robust", RobustScaler())]:
    out = sc.fit_transform(inc).ravel()
    print(f"  {name:8s}: normal rows -> {out[:5].round(2).tolist()}  outlier -> {out[5]:.1f}")

# Fit on TRAIN only: test values may land outside [0, 1] - that is expected
train = np.array([[20], [40], [60]], dtype=float)
test = np.array([[10], [80]], dtype=float)
mm = MinMaxScaler().fit(train)
print("\nTest [10, 80] scaled with the TRAIN min/max (20, 60):", mm.transform(test).ravel().round(2).tolist())

assert np.isclose(std.scale_[0], np.sqrt(200))           # population std = 14.14
assert np.allclose(RobustScaler().fit_transform(inc).ravel()[:5], [-1.0, -0.6, -0.2, 0.2, 0.6])
```

**Output:**

```
Min-Max ages   : [0.0, 0.25, 0.5, 0.75, 1.0]
Scores: mean = 80, std = 14.14 (divides by n, not n-1)
Standard scores: [-1.41, -0.71, 0.0, 0.71, 1.41]

Incomes: [30, 35, 40, 45, 50, 40000]
  MinMax  : normal rows -> [0.0, 0.0, 0.0, 0.0, 0.0]  outlier -> 1.0
  Standard: normal rows -> [-0.45, -0.45, -0.45, -0.45, -0.45]  outlier -> 2.2
  Robust  : normal rows -> [-1.0, -0.6, -0.2, 0.2, 0.6]  outlier -> 3196.6

Test [10, 80] scaled with the TRAIN min/max (20, 60): [-0.25, 1.5]
```

<details>
<summary><strong>Read as text</strong> — continued: why only Robust keeps the normal incomes apart</summary>

With one outlier, Min-Max and Standard scaling both crush the five normal incomes into a single value; only Robust scaling keeps them apart. The last line is normal, not a bug: a scaler fitted on train can map new data outside 0–1.

</details>

---

## Step 5: Feature Engineering ★

![Infographic on feature engineering: ingredient-to-recipe rows (Date 2024-01-15 becomes Year 2024, Month 1, DayOfWeek 1, IsWeekend 0; Birth Year 1990 becomes Age 34; Price 100 becomes LogPrice 4.6), a 24-hour clock drawn as a circle where 00:00 is (0, 1), 23:00 is (-0.259, 0.966) only 0.261 away, and 12:00 is (0, -1) at distance 2.0, plus a recipes table of ratio, log, binning, past-only aggregates and text features.](diagrams/prep09_info_feature_engineering_ai.png)

![Turning raw features into useful signals](diagrams/prep09_feature_engineering_ai.png)

### Simple Explanation

<details>
<summary><strong>Read as text</strong> — the chef analogy and the sin/cos formula</summary>

Feature engineering is the art of **creating new, more useful features** from existing ones.
It's like being a chef — you take raw ingredients and transform them into something tastier!

> **Maths in one line:** `hour → (sin(2π·hour/24), cos(2π·hour/24))` — wrap a repeating feature onto a circle so that 23:00 and 00:00 end up neighbours instead of 23 apart.

</details>

### Examples

<details>
<summary><strong>Read as text</strong> — dates, ages, names and prices turned into features</summary>

```
ORIGINAL FEATURES        →    ENGINEERED FEATURES
─────────────────────────     ─────────────────────────────────

Date: 2024-01-15         →    Year: 2024
                               Month: 1 (January)
                               DayOfWeek: 1 (Monday)
                               IsWeekend: 0

Birth Year: 1990         →    Age: 34
Current Year: 2024            AgeGroup: "Young Adult"

Latitude: 40.7           →    DistanceToCityCenter: 5.2 km
Longitude: -74.0

Name: "John Smith"       →    HasMiddleName: 0
                               NameLength: 10

Price: 100               →    LogPrice: 4.6  ← ln(100); handles skewed data
                               PriceBin: "low"/"medium"/"high"
```

DayOfWeek here counts Monday = 1 (the ISO convention); pandas' `.dt.day_of_week` counts Monday = 0.

</details>

### Cyclical Features and Other Recipes

<details>
<summary><strong>Read as text</strong> — hours on a circle, ratios, logs, bins and aggregates</summary>

**Cyclical features.** Hours, weekdays and months wrap around: 23:00 is one hour from midnight, but the raw numbers say 23 apart. Put the value on a circle with the sine and cosine pair from the formula above:

```
  hour  0  →  (sin, cos) = ( 0.000,  1.000)
  hour 23  →  (sin, cos) = (-0.259,  0.966)    distance to midnight = 0.261
  hour 12  →  (sin, cos) = ( 0.000, -1.000)    distance to midnight = 2.000 (farthest)
```

Use both columns: with the sine alone, 01:00 and 11:00 would get the same value (0.259).

| Recipe | Example | Why it helps |
|---|---|---|
| Ratio / interaction | price ÷ square feet → price per square foot | A linear model cannot divide one feature by another on its own |
| Log transform | `np.log1p(income)` | Tames right-skewed money and count features (`log1p` copes with zeros) |
| Binning | age → 18–25 / 26–40 / 41+ | Lets a linear model learn steps instead of one straight line |
| Aggregates | a user's average order value over the past 30 days | Compute from past rows only (training data), or it leaks the future |
| Text | word counts, TF-IDF, embeddings | Turns free text into numbers |

</details>

### Feature Selection — Removing Useless Features ★★

![Infographic on feature selection: three reasons to drop a feature (low variance, country_usa = 1 in 98.8% of rows; duplicate, corr(height_cm, height_in) = 1.000; unrelated, user_id) and paired bars of absolute correlation vs mutual information where x scores 0.062 vs 0.940, height_cm and height_in 0.400 vs 0.254, country_usa 0.069 vs 0.011 and user_id 0.001 vs 0.000, showing correlation misses the x-squared signal; plus filter, wrapper and embedded families with scikit-learn names.](diagrams/prep09_info_feature_selection_ai.png)

![Removing useless or duplicate features](diagrams/prep09_feature_selection_ai.png)

<details>
<summary><strong>Read as text</strong> — three reasons to drop a feature, correlation vs mutual information and the three families</summary>

```
Removing bad features IMPROVES models!

REASONS TO REMOVE A FEATURE:
─────────────────────────────────────────────────────────
Low Variance    │ Almost always the same value
                │ Example: "Country=USA" when 99% are USA

High Correlation│ Two features say the same thing
with another    │ Example: height_cm and height_inches
feature         │

Not related     │ Feature has nothing to do with the target
to target       │ Example: "Customer's favorite color" for
                │ predicting house price
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["UserID", "Favorite Color", "Country (99% same)", "Height (cm)", "Height (inches)", "Age", "Income"],
    "datasets": [{
      "label": "Feature Importance (correlation with target)",
      "data": [0.01, 0.02, 0.03, 0.85, 0.85, 0.42, 0.78],
      "backgroundColor": ["rgba(239,68,68,0.6)","rgba(239,68,68,0.6)","rgba(239,68,68,0.6)","rgba(200,180,50,0.6)","rgba(200,180,50,0.6)","rgba(34,197,94,0.7)","rgba(34,197,94,0.7)"],
      "borderColor": ["rgba(239,68,68,1)","rgba(239,68,68,1)","rgba(239,68,68,1)","rgba(200,180,50,1)","rgba(200,180,50,1)","rgba(34,197,94,1)","rgba(34,197,94,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "indexAxis": "y",
    "plugins": { "title": { "display": true, "text": "Toy Example — Drop Red (useless), Keep One of Yellow (duplicates)" } },
    "scales": {
      "x": { "title": { "display": true, "text": "Importance" }, "min": 0, "max": 1.0 }
    }
  }
}
```

**Watch out:** correlation only sees straight-line relationships. A feature can have almost zero correlation with the target and still be the most useful one — in the program below, y depends on x², so x looks useless to correlation. **Mutual information** measures any kind of dependence and catches it.

| Family | How it works | scikit-learn |
|---|---|---|
| Filter | Score each feature on its own (variance, correlation, mutual information) and keep the best | `VarianceThreshold`, `SelectKBest(mutual_info_classif)` |
| Wrapper | Train the model repeatedly, dropping the weakest feature each round | `RFE`, `SequentialFeatureSelector` |
| Embedded | The model selects while it trains | `Lasso` (L1 sets weights to exactly 0, [Ch 08 §8.15](#content/08_core_concepts)); tree importances via `SelectFromModel` |

Selection looks at the labels, so it also belongs inside the `Pipeline` (fitted on training folds only).

</details>

```python
# Feature selection: near-constant, duplicate and "uncorrelated but useful" features
import numpy as np
import pandas as pd
from sklearn.feature_selection import mutual_info_regression

rng = np.random.default_rng(0)
n = 500
height_cm = rng.normal(170, 10, n)
X = pd.DataFrame({
    "x": rng.uniform(-3, 3, n),                     # matters - but as x squared
    "height_cm": height_cm,
    "height_in": height_cm / 2.54,                  # same information, other unit
    "country_usa": (rng.random(n) < 0.99).astype(int),
    "user_id": np.arange(n).astype(float),          # an ID: pure noise
})
y = X["x"] ** 2 + 0.1 * (X["height_cm"] - 170) + rng.normal(0, 0.3, n)

share = X["country_usa"].mean()
print(f"country_usa = 1 in {share:.1%} of rows -> near-constant, little to learn")
print(f"corr(height_cm, height_in) = {X['height_cm'].corr(X['height_in']):.3f} -> keep only one")

corr = X.corrwith(y).abs()
mi = mutual_info_regression(X, y, random_state=0)
print("\nfeature       |corr with y|   mutual info")
for name, c, m in zip(X.columns, corr, mi):
    print(f"  {name:12s} {c:10.3f} {m:13.3f}")

assert corr["x"] < 0.1 and mi[0] > 0.5            # correlation misses x, MI finds it
assert mi[0] > mi[4] and mi[0] > mi[3]
```

**Output:**

```
country_usa = 1 in 98.8% of rows -> near-constant, little to learn
corr(height_cm, height_in) = 1.000 -> keep only one

feature       |corr with y|   mutual info
  x                 0.062         0.940
  height_cm         0.400         0.254
  height_in         0.400         0.254
  country_usa       0.069         0.011
  user_id           0.001         0.000
```

<details>
<summary><strong>Read as text</strong> — continued: what correlation and mutual information found</summary>

Correlation ranks x near the bottom (0.062); mutual information ranks it first (0.940). The two height columns score identically because they are the same feature in different units — keep one. The ID and the near-constant country column carry almost nothing.

</details>

---

## The Full Preprocessing Workflow Summary

![Infographic of a leakage-safe scikit-learn pipeline: DataFrame into a ColumnTransformer with a numeric branch (SimpleImputer median then StandardScaler) and a categorical branch (SimpleImputer most_frequent then OneHotEncoder with handle_unknown ignore) feeding LogisticRegression, fitted on train and applied to test; the test row with missing age, income 200 and unseen city Paris becomes 0.0, 9.9, 0.0, 0.0; a table of leakage sources and fixes; 5-fold ROC-AUC 0.811 +/- 0.036; and class-imbalance rules for 100 frauds in 10,000 with balanced class weights 50 and 0.51.](diagrams/prep09_info_leakage_safe_pipeline_ai.png)

<details>
<summary><strong>Read as text</strong> — the whole workflow in one diagram</summary>

```
   Raw Data
      │
      ├──► Check for duplicates ──► Remove exact duplicate rows
      │
      ├──► SPLIT train / test   ──► every step below is fit on train
      │
      ├──► Check for missing    ──► Fill (median/mode/model),
      │       values                flag, or drop
      │
      ├──► Check for outliers   ──► Fix, cap, transform or keep
      │
      ├──► Encode categories    ──► One-hot / ordinal / target
      │
      ├──► Scale features       ──► Standard / Min-Max / Robust
      │                             (skip for tree models)
      │
      └──► Engineer features    ──► Create new, more useful features
                                     and remove useless ones
                                            │
                                            ▼
                                     ┌─────────────┐
                                     │  CLEAN DATA │
                                     │  Ready for  │
                                     │  modeling!  │
                                     └─────────────┘
```

</details>

### What About Class Imbalance?

<details>
<summary><strong>Read as text</strong> — split first, rebalance train only, and class weights</summary>

When one class is rare — say 100 frauds among 10,000 transactions — a model can score 99% accuracy by never predicting fraud. Fixing that is part of preparing the data, but it is taught in [Ch 10 §10.11](#content/10_supervised_learning). The preprocessing rules to remember:

- **Split first** (stratified, so both sides keep the 1% fraud rate), then rebalance **only the training data**. Never oversample or SMOTE the test set — copied or synthetic rows would leak across the split.
- **The simplest fix needs no resampling:** `class_weight="balanced"` weights each class by n_samples / (n_classes × n_in_class) — here 10,000 / (2 × 100) = 50 for fraud and 10,000 / (2 × 9,900) ≈ 0.51 for legitimate.
- **Judge the result** with precision, recall and PR-AUC, not accuracy ([Ch 13 §13.5](#content/13_model_evaluation)).

</details>

---

## Putting It Together: A Leakage-Safe Pipeline ★★★

<details>
<summary><strong>Read as text</strong> — why one Pipeline object prevents leakage</summary>

**Simple Explanation:** The reliable way to prevent data leakage isn't to *remember* "fit on train only" for every impute, scale, and encode step — humans forget, and one slip leaks the test set into training. Instead, bundle **every fit-based transform into ONE object** that is fit on the training fold and merely *applied* to validation/test. scikit-learn's `Pipeline` + `ColumnTransformer` do exactly this: because they refit inside each cross-validation fold, leakage is prevented **automatically**, not by discipline.

> **Official Definition:** A **Pipeline** is a single estimator that chains a sequence of transformers with a final model. Calling `.fit(X_train, y_train)` learns *all* parameters — imputation values, scaling statistics, encoding categories, and model weights — **from the training data only**, and `.predict(X_new)` applies those learned parameters in order. This makes the entire workflow leakage-safe, reproducible, and deployable as one object.

</details>

```python
# A leakage-safe Pipeline: impute + scale + one-hot, fit on TRAIN only
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

numeric_features = ["age", "income"]
categorical_features = ["city"]
numeric = Pipeline([("impute", SimpleImputer(strategy="median")),
                    ("scale", StandardScaler())])
categorical = Pipeline([("impute", SimpleImputer(strategy="most_frequent")),
                        ("encode", OneHotEncoder(handle_unknown="ignore", sparse_output=False))])
preprocessor = ColumnTransformer([("num", numeric, numeric_features),
                                  ("cat", categorical, categorical_features)])

train = pd.DataFrame({"age": [25, np.nan, 45, 35], "income": [40, 60, np.nan, 80],
                      "city": ["NY", "SF", "NY", np.nan]})
test = pd.DataFrame({"age": [np.nan], "income": [200], "city": ["Paris"]})
preprocessor.fit(train)                        # medians, means, stds, categories: TRAIN only
print("columns:", [str(c) for c in preprocessor.get_feature_names_out()])
for row in preprocessor.transform(train).round(2).tolist():
    print("  train ->", row)
print("  test  ->", preprocessor.transform(test).round(2).tolist()[0])

# Whole model in one object; cross_val_score refits EVERY step inside each fold
rng = np.random.default_rng(0)
n = 400
X = pd.DataFrame({"age": rng.integers(18, 70, n).astype(float),
                  "income": rng.normal(60, 15, n).round(),
                  "city": rng.choice(["NY", "SF", "LA"], n)})
X.loc[rng.random(n) < 0.1, "income"] = np.nan               # 10% missing
logit = 0.08 * (X["age"] - 44) + 1.0 * (X["city"] == "SF") - 0.5
y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
pipe = Pipeline([("prep", preprocessor), ("model", LogisticRegression(max_iter=1000))])
scores = cross_val_score(pipe, X, y, cv=5, scoring="roc_auc")
print(f"\n5-fold ROC-AUC: {scores.mean():.3f} +/- {scores.std():.3f}")
assert preprocessor.transform(test)[0, 2:].sum() == 0      # unseen city -> all zeros
```

**Output:**

```
columns: ['num__age', 'num__income', 'cat__city_NY', 'cat__city_SF']
  train -> [-1.41, -1.41, 1.0, 0.0]
  train -> [0.0, 0.0, 0.0, 1.0]
  train -> [1.41, 0.0, 1.0, 0.0]
  train -> [0.0, 1.41, 1.0, 0.0]
  test  -> [0.0, 9.9, 0.0, 0.0]

5-fold ROC-AUC: 0.811 +/- 0.036
```

<details>
<summary><strong>Read as text</strong> — continued: reading the rows, the leakage sources and the interview answer</summary>

Read it row by row. The missing training age is filled with the training median, 35, then standardized with the training mean 35 and std 7.07 → 0.0. The missing city becomes the most frequent one, "NY". The test row is handled only with numbers learned from train: its missing age → 35 → 0.0; its income of 200 → (200 − 60) / 14.14 = 9.9, far outside anything seen in training (a hint of drift, but no crash); and the unseen city "Paris" → all zeros, thanks to `handle_unknown="ignore"`. In `cross_val_score`, the imputer, scaler and encoder are refit inside every one of the 5 folds using only that fold's training rows — no leakage.

**Leakage sources beyond scaling**

| Leakage source | The mistake | The fix |
|---|---|---|
| Target leakage | A feature is computed from the label or from the future | Drop it; only use info available at prediction time |
| Temporal leakage | Using future rows to predict the past | Use time-based (chronological) splits, not random |
| Fitting on the full dataset | Imputers/encoders/feature-selectors `.fit()` on all rows | Put them in the Pipeline so they refit per fold |
| Target/mean encoding | Encoding categories on the whole data | Smooth and cross-fit (`TargetEncoder.fit_transform` does both) |
| Resampling before the split | SMOTE or oversampling on all rows | Resample the training fold only |
| Duplicate rows | Same record lands in both train & test | De-duplicate (and group-split) before evaluating |

The four classic kinds of leakage (target, temporal, group, preprocessing) are explained with stories in [Ch 08 §8.4](#content/08_core_concepts); leakage *inside* cross-validation is in [Ch 13 §13.7](#content/13_model_evaluation).

**Interview tip:** Asked *"how do you prevent leakage in preprocessing?"*, the strong answer is: **"wrap all fit-based steps in a `Pipeline`/`ColumnTransformer` and fit inside CV folds"** — so the fix is structural, not a checklist you have to remember.

</details>

---

## Common Mistakes to Avoid

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TOP 5 PREPROCESSING MISTAKES                     │
├────────────────────────────────┬────────────────────────────────────┤
│ MISTAKE                        │ WHY IT'S BAD                       │
├────────────────────────────────┼────────────────────────────────────┤
│ 1. Scaling BEFORE splitting    │ Test data stats leak into training │
│    into train/test             │ -> artificially good results       │
│                                │ -> model fails in production       │
├────────────────────────────────┼────────────────────────────────────┤
│ 2. Dropping all rows with      │ If missingness is informative,     │
│    missing values              │ you're losing signal! Also reduces │
│                                │ dataset size unnecessarily.        │
├────────────────────────────────┼────────────────────────────────────┤
│ 3. One-Hot encoding features   │ 1000 categories = 1000 new columns │
│    with many categories        │ -> slow, sparse, easy to overfit   │
│                                │ Use Target or Frequency encoding.  │
├────────────────────────────────┼────────────────────────────────────┤
│ 4. Not handling outliers       │ One extreme value can dominate the │
│    before scaling              │ entire scale of your features.     │
│                                │ Use RobustScaler, or cap first.    │
├────────────────────────────────┼────────────────────────────────────┤
│ 5. Label Encoding nominal data │ Model thinks blue(0) < green(1)    │
│    (colors, cities)            │ < red(2) -- creates fake ordering  │
│                                │ Use One-Hot for nominal features.  │
└────────────────────────────────┴────────────────────────────────────┘
```

---

## Review Questions — Test Your Understanding

1. You have a column with 40% missing values. Should you drop it, fill it, or something else?
2. What's the difference between Min-Max Normalization and Standardization? When would you choose each?
3. You have a "City" column with 200 unique cities. One-Hot encoding would create 200 columns. What alternatives could you use?
4. Explain data leakage in one sentence. Why is it dangerous?
5. You notice a "Height" value of 900cm in your dataset. How would you detect this as an outlier using the IQR method?
6. A survey's income question is skipped mostly by very high earners. Which type of missing data is this, and why can't filling with the median fix it?
7. On the data 10, 15, 18, 20, 22, 25, 27, 28, 35, 100 the IQR rule flags 100, but the rule |Z| > 3 does not. Why?
8. A teammate standardizes every feature before training a random forest, "to be safe". Does it help?
9. Why does naive target encoding leak, and how does scikit-learn's `TargetEncoder` prevent it?
10. How would you give "hour of day" (0–23) to a linear model, and why not just use the raw number?

<details>
<summary>Answers</summary>

1. 40% is too much to just fill with mean/median — you'd introduce too much bias. Consider: (a) creating a binary "was_missing" indicator column and then filling, (b) using a model to predict missing values (KNN or iterative imputation), (c) using a model that accepts NaN directly (HistGradientBoosting, XGBoost, LightGBM), or (d) dropping the column if it's not very predictive.
2. Min-Max scales to [0,1] — good when you need a bounded range (e.g. image pixels) and there are no big outliers. Standardization centers around 0 with std=1 and is the usual default for linear models, SVMs, KNN, PCA and neural nets. Neither handles heavy outliers well — Standardization is less squashed than Min-Max but its mean and std are still pulled — so use RobustScaler (median and IQR) when outliers are present.
3. Target Encoding (replace city with the average target value for that city — smoothed and cross-fitted), Frequency Encoding (replace with how often each city appears), Hashing (hash into fixed bins), or Embeddings (let a neural network learn representations).
4. Data leakage means information that won't be available at prediction time influences the model during training — it makes your model look better than it actually is, then it fails in production ([Ch 08 §8.4](#content/08_core_concepts)).
5. Sort the Height data, find Q1 (25th percentile) and Q3 (75th percentile), compute IQR = Q3 - Q1, then check if 900 > Q3 + 1.5 * IQR. If yes, it's an outlier.
6. **MNAR** (Missing Not At Random): whether the value is missing depends on the value itself. Filling with the median puts typical incomes where the true values are high, so the column is biased downward. Add an `income_was_missing` flag (the gap itself is a signal) and try to find out why the data is missing.
7. The 100 pulls the mean up to 30 and the std up to 24.28, so its own Z-score is only 2.88 (masking). With 10 points no |Z| can exceed √9 = 3 anyway. The IQR rule uses quartiles, which one extreme value barely moves.
8. No. Trees split on thresholds, and rescaling keeps every value in the same order, so the same splits are found — in the wine program the tree scores 94.4% with and without scaling. It is harmless but wasted work; scaling matters for KNN, SVMs, linear models and neural nets.
9. Each category's encoding is computed from the training labels — including the row's own label. A category with one row gets exactly its own label, so the model learns to read the answer: great training score, worse test score. `TargetEncoder` smooths rare categories toward the global mean and, in `fit_transform`, cross-fits: each row is encoded with means computed on the other folds.
10. Encode it as two columns, sin(2π·hour/24) and cos(2π·hour/24). Raw numbers say 23:00 and 00:00 are 23 apart; on the circle 23:00 → (−0.259, 0.966) and 00:00 → (0, 1), only 0.261 apart.
</details>

---

## Key Takeaways

```
╔═══════════════════════════════════════════════════════════════════╗
║  DATA PREPROCESSING CHEAT SHEET                                   ║
║  ──────────────────────────────────────────────────────────────   ║
║  0. Split FIRST; fit every step on TRAIN only — use a Pipeline    ║
║  1. Missing values: ask WHY (MCAR / MAR / MNAR); fill with        ║
║     median or mode, and add a "was_missing" flag                  ║
║  2. Outliers: IQR rule (fences at Q1 − 1.5·IQR, Q3 + 1.5·IQR);    ║
║     Z-scores fail on small samples; fix errors, cap or keep       ║
║     real extremes                                                 ║
║  3. Encode: one-hot for nominal, ordinal (explicit order) for     ║
║     ordered, smoothed + cross-fitted target encoding for many     ║
║     categories                                                    ║
║  4. Scale: Standard by default, Robust for outliers, Min-Max      ║
║     for 0–1; tree models need no scaling                          ║
║  5. Engineer features (dates, sin/cos cycles, logs, ratios);      ║
║     drop near-constant and duplicate ones; correlation misses     ║
║     non-linear signal — mutual information catches it             ║
║  6. Data work is the biggest share of a project (surveys:         ║
║     roughly 40–80% of the time, depending on what is counted)     ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

**Previous:** [Chapter 8 — Core Concepts](#content/08_core_concepts)

**Next:** [Chapter 10 — Supervised Learning](#content/10_supervised_learning)
