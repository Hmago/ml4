# Chapter 5 — Data Preprocessing

> "Data preparation accounts for about 80% of the work of data scientists."
> — Forbes, 2016

---

## What You'll Learn

After reading this chapter, you will be able to:
- Explain why data preprocessing takes ~80% of a data scientist's time
- Handle missing values using the right strategy for each situation
- Detect and deal with outliers using IQR and Z-score methods
- Choose between Label Encoding, One-Hot Encoding, and Ordinal Encoding
- Apply Min-Max Normalization vs Standardization and know when to use each
- Avoid data leakage when scaling features

---

## Why Preprocess Data?

### Simple Explanation
Imagine trying to bake a cake with dirty eggs, wrong measurements, and missing ingredients.
It won't turn out right! Data preprocessing is about **cleaning and organizing** your data
before feeding it to a model, so the model has the best chance of learning properly.

```
RAW DATA (messy!)                  CLEAN DATA (ready!)
─────────────────────              ─────────────────────────────
Age: 25, ?, 99, -3, "twenty"  →    Age: 25, 28, 35, 30, 22

City: "NY", "new york", "nyc" →    City: "new_york"

Price: 100, 50000, 75, 200    →    Price: 0.02, 9.9, 0.015, 0.04
(all different scales!)             (normalized 0 to 1)

Has_Pet: "yes", 1, "Y", True  →    Has_Pet: 1, 1, 1, 1
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Raw (Messy) Data", "Clean (Preprocessed) Data"],
    "datasets": [
      {
        "label": "Model Accuracy (%)",
        "data": [58, 89],
        "backgroundColor": ["rgba(239, 68, 68, 0.6)", "rgba(34, 197, 94, 0.7)"],
        "borderColor": ["rgba(239, 68, 68, 1)", "rgba(34, 197, 94, 1)"],
        "borderWidth": 1
      },
      {
        "label": "Training Time (relative)",
        "data": [90, 40],
        "backgroundColor": ["rgba(234, 88, 12, 0.5)", "rgba(99, 102, 241, 0.5)"],
        "borderColor": ["rgba(234, 88, 12, 1)", "rgba(99, 102, 241, 1)"],
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Why Preprocess? — Better Accuracy AND Faster Training" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Score" }, "beginAtZero": true, "max": 100 }
    }
  }
}
```

---

## The Data Preprocessing Pipeline

```
Raw Data
   │
   ▼
┌────────────────────┐
│ 1. Handle Missing  │  Fill in or remove empty values
│    Values          │
└────────────────────┘
   │
   ▼
┌────────────────────┐
│ 2. Remove          │  Get rid of duplicate rows,
│    Duplicates      │  irrelevant columns
└────────────────────┘
   │
   ▼
┌────────────────────┐
│ 3. Handle          │  Deal with extreme unusual values
│    Outliers        │
└────────────────────┘
   │
   ▼
┌────────────────────┐
│ 4. Encode          │  Convert text categories to numbers
│    Categorical     │
│    Features        │
└────────────────────┘
   │
   ▼
┌────────────────────┐
│ 5. Scale/Normalize │  Bring all numbers to same range
│    Features        │
└────────────────────┘
   │
   ▼
┌────────────────────┐
│ 6. Feature         │  Create new useful features,
│    Engineering     │  remove useless ones
└────────────────────┘
   │
   ▼
Clean, Ready Data!
```

---

## Step 1: Handling Missing Values ★★

### Why Data Goes Missing
```
Types of Missing Data:
─────────────────────────────────────────────────────────────
MCAR  │ Missing Completely At Random — sensor glitch
      │ Example: Random form fields skipped accidentally

MAR   │ Missing At Random — depends on other data
      │ Example: Older people less likely to share income

MNAR  │ Missing Not At Random — missing for a reason!
      │ Example: Sickest patients left the study (dropout)
```

### What to Do About Missing Values

```
   Missing Value Detected!
           │
    ┌──────┴───────┐
    ▼              ▼
 Few rows      Many rows
 missing?      missing?
(< 5%)        (> 30%)
    │              │
    ▼              ▼
 Delete         Consider
 those rows     dropping
                the column!
    │
    ▼
 Can you fill it in?
 ┌──────────────────────────────────────────────────────┐
 │ Numerical: Fill with MEAN or MEDIAN                  │
 │   Use MEAN when data is symmetric (bell-shaped)      │
 │   Use MEDIAN when data has outliers                  │
 │   Age: [25, ?, 30, 28, ?] → fill with median=28     │
 │                                                      │
 │ Categorical: Fill with MODE (most common value)      │
 │   City: [NY, ?, London, NY, ?] → fill with "NY"     │
 │                                                      │
 │ Advanced: Predict missing values using a model!      │
 │                                                      │
 │ SPECIAL CASE: Sometimes missing IS informative!      │
 │   e.g., no income entered on a loan form might       │
 │   signal the applicant wants to hide something.      │
 │   → Add a new binary column: "Income_was_missing"=1  │
 └──────────────────────────────────────────────────────┘
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Drop Row", "Fill with Mean", "Fill with Median", "Fill with Mode", "Forward Fill"],
    "datasets": [{
      "label": "When to use (relative frequency in practice)",
      "data": [15, 35, 25, 15, 10],
      "backgroundColor": ["rgba(239,68,68,0.6)","rgba(99,102,241,0.7)","rgba(34,197,94,0.7)","rgba(234,88,12,0.6)","rgba(200,200,200,0.6)"],
      "borderColor": ["rgba(239,68,68,1)","rgba(99,102,241,1)","rgba(34,197,94,1)","rgba(234,88,12,1)","rgba(160,160,160,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Missing Value Strategies — Fill with Mean/Median Most Common" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Usage (%)" }, "beginAtZero": true }
    }
  }
}
```

---

## Step 2: Handling Outliers

### Simple Explanation
An outlier is a value that is **far away** from the rest. Like if you're measuring heights
of 5th graders and one row says "300cm" — that's probably a typo!

```
Data: [160, 162, 155, 158, 163, 161, 350, 159]
                                        ▲
                                    OUTLIER!
                                    (typo or error)

           Visualization:
           ──────────────
     │ * * * * * * * *              *
     │_____________________________|_____________
    155                160         350   Height (cm)
     └────────────────┘            └──┘
         Normal range             Outlier
```

### How to Find Outliers

**Method 1: IQR (Interquartile Range)**

$$IQR = Q3 - Q1$$

$$\text{Lower Bound} = Q1 - 1.5 \times IQR$$

$$\text{Upper Bound} = Q3 + 1.5 \times IQR$$

```
  Sort data: 10, 15, 18, 20, 22, 25, 27, 28, 35, 100

  Q1 = 25th percentile = 18    ←── Middle of lower half
  Q3 = 75th percentile = 27    ←── Middle of upper half
  IQR = Q3 - Q1 = 9

  Lower Bound = Q1 - 1.5 × IQR = 18 - 13.5 = 4.5
  Upper Bound = Q3 + 1.5 × IQR = 27 + 13.5 = 40.5

  Value 100 > 40.5  →  OUTLIER! Flag it.
```

**Method 2: Z-Score**

$$Z = \frac{\text{value} - \text{mean}}{\text{standard deviation}}$$

```
  If |Z| > 3  →  likely an outlier

  Example:
    Mean = 50, Std = 10
    Value = 95
    Z = (95 - 50) / 10 = 4.5  →  OUTLIER!
```

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
    "plugins": { "title": { "display": true, "text": "Spotting the Outlier — Value 100 is Way Outside the Normal Range" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Value" }, "beginAtZero": true }
    }
  }
}
```

---

## Step 3: Encoding Categorical Features ★★

### Simple Explanation
Computers only understand numbers, not words like "red" or "small."
Encoding converts words into numbers.

### Method 1: Label Encoding
```
  Color: ["red", "blue", "green", "red", "blue"]
           ▼
           0      1       2       0      1

  GOOD FOR: Ordinal data (Small=0, Medium=1, Large=2)
  BAD FOR:  Nominal data — model may think blue > red!
```

### Method 2: One-Hot Encoding
```
  Original:                One-Hot Encoded:
  ─────────               ─────────────────────────────
  Color                   Color_red  Color_blue  Color_green
  ─────                   ─────────  ──────────  ───────────
  red            →            1          0           0
  blue           →            0          1           0
  green          →            0          0           1
  red            →            1          0           0

  GOOD FOR: Nominal categories (no natural order)
  WARNING:  Creates many columns if too many categories!
            (100 cities = 100 new columns!)

  HIGH-CARDINALITY ALTERNATIVES (many unique categories):
  ────────────────────────────────────────────────────────
  Target Encoding   → Replace category with mean of target
                      e.g., city → average house price in that city
  Frequency Encoding→ Replace category with how often it appears
  Hashing           → Hash categories into a fixed number of bins
  Embedding         → Let a neural network learn a dense representation
```

### Method 3: Ordinal Encoding
```
  Size:  Small  →  0
         Medium →  1
         Large  →  2
         XLarge →  3

  GOOD FOR: Data with natural order (Small < Medium < Large)
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Label Encoding", "One-Hot Encoding", "Ordinal Encoding", "Target Encoding"],
    "datasets": [{
      "label": "Typical Usage (%)",
      "data": [15, 45, 20, 20],
      "backgroundColor": ["rgba(200, 200, 200, 0.6)", "rgba(99, 102, 241, 0.7)", "rgba(34, 197, 94, 0.6)", "rgba(234, 88, 12, 0.6)"],
      "borderColor": ["rgba(160, 160, 160, 1)", "rgba(99, 102, 241, 1)", "rgba(34, 197, 94, 1)", "rgba(234, 88, 12, 1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Encoding Methods — One-Hot is Most Common for Nominal Categories" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Usage (%)" }, "beginAtZero": true }
    }
  }
}
```

---

## Step 4: Feature Scaling / Normalization ★★

### Why Scale?

```
BEFORE SCALING:                     AFTER SCALING:
──────────────────────────          ──────────────────────────
Feature A: [1, 2, 3, 4]            Feature A: [0.0, 0.33, 0.67, 1.0]
Feature B: [1000, 2000, 3000, 4000] Feature B: [0.0, 0.33, 0.67, 1.0]

Feature B DOMINATES the model      All features have EQUAL importance!
because its numbers are bigger!     Model learns better.
```

### Method 1: Min-Max Normalization (scales to 0–1)

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

### Method 2: Standardization / Z-score Scaling (mean=0, std=1)

$$X_{\text{scaled}} = \frac{X - \text{mean}}{\text{std deviation}}$$

```
  Example:  Scores = [60, 70, 80, 90, 100]
            Mean = 80,  Std = 15.8

            60 → (60-80)/15.8 = -1.27
            70 → (70-80)/15.8 = -0.63
            80 → (80-80)/15.8 =  0.00
            90 → (90-80)/15.8 =  0.63
           100 →(100-80)/15.8 =  1.27

  Result: Centered around 0, spread ±1
```

### CRITICAL: Fit the Scaler on Training Data ONLY

```
  ╔══════════════════════════════════════════════════════════════╗
  ║  DATA LEAKAGE WARNING                                        ║
  ╠══════════════════════════════════════════════════════════════╣
  ║  WRONG (leaks test info into training):                      ║
  ║    scaler.fit(ALL data)                                      ║
  ║    X_train_scaled = scaler.transform(X_train)               ║
  ║    X_test_scaled  = scaler.transform(X_test)                ║
  ║                                                              ║
  ║  CORRECT:                                                    ║
  ║    scaler.fit(X_train ONLY)   ← learn mean/min from train   ║
  ║    X_train_scaled = scaler.transform(X_train)               ║
  ║    X_test_scaled  = scaler.transform(X_test)  ← apply only  ║
  ╚══════════════════════════════════════════════════════════════╝

  Why? If you fit on ALL data, the test set's stats (mean, min, max)
  "leak" into training — your model cheats! In real life you won't
  have test data when you train, so only use training stats.
```

### Which to Use?

```
┌───────────────────────────────────────────────────────────────────┐
│  Min-Max Normalization (0-1)    │  Standardization (Z-score)      │
├─────────────────────────────────┼─────────────────────────────────┤
│ Use when:                       │ Use when:                       │
│ - You need values in [0,1]      │ - Data has outliers             │
│ - Neural networks (images)      │ - Data is approx. normal dist.  │
│ - KNN, K-means                  │ - Linear models, SVM            │
│                                 │ - Most common choice!           │
└─────────────────────────────────┴─────────────────────────────────┘
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Age (20)", "Age (30)", "Age (40)", "Age (50)", "Age (60)"],
    "datasets": [
      {
        "label": "Before Scaling (raw)",
        "data": [20, 30, 40, 50, 60],
        "backgroundColor": "rgba(200, 200, 200, 0.6)",
        "borderColor": "rgba(160, 160, 160, 1)",
        "borderWidth": 1
      },
      {
        "label": "Min-Max (0 to 1)",
        "data": [0.0, 2.5, 5.0, 7.5, 10.0],
        "backgroundColor": "rgba(99, 102, 241, 0.7)",
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 1
      },
      {
        "label": "Z-Score (mean=0, std=1)",
        "data": [0.64, 2.2, 3.8, 5.4, 7.0],
        "backgroundColor": "rgba(34, 197, 94, 0.7)",
        "borderColor": "rgba(34, 197, 94, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Feature Scaling — Raw Values vs Min-Max vs Z-Score (scaled 10x for visibility)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Value" }, "beginAtZero": true }
    }
  }
}
```

---

## Step 5: Feature Engineering ★

### Simple Explanation
Feature engineering is the art of **creating new, more useful features** from existing ones.
It's like being a chef — you take raw ingredients and transform them into something tastier!

### Examples

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

Price: 100               →    LogPrice: 4.6  ← handles skewed data
                               PriceBin: "low"/"medium"/"high"
```

### Feature Selection — Removing Useless Features ★★

```
Removing bad features IMPROVES models!

REASONS TO REMOVE A FEATURE:
─────────────────────────────────────────────────────────
Low Variance    │ Almost always the same value
                │ Example: "Country=USA" when 99% are USA

High Correlation│ Two features say the same thing
with another    │ Example: height_cm and height_inches
feature         │

Not correlated  │ Feature has nothing to do with the target
with target     │ Example: "Customer's favorite color" for
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
    "plugins": { "title": { "display": true, "text": "Feature Selection — Drop Red (useless), Keep One of Yellow (duplicates)" } },
    "scales": {
      "x": { "title": { "display": true, "text": "Importance" }, "min": 0, "max": 1.0 }
    }
  }
}
```

---

## The Full Preprocessing Workflow Summary

```
   Raw Data
      │
      ├──► Check for duplicates ──► Remove duplicate rows
      │
      ├──► Check for missing  ──► Fill (mean/median/mode) or Drop
      │       values
      │
      ├──► Check for outliers ──► Cap, Remove, or Transform
      │
      ├──► Encode categories  ──► Label Encode or One-Hot Encode
      │
      ├──► Scale features     ──► Normalize or Standardize
      │
      └──► Engineer features  ──► Create new, more useful features
                                     and remove useless ones
                                            │
                                            ▼
                                     ┌─────────────┐
                                     │  CLEAN DATA │
                                     │  Ready for  │
                                     │  modeling!  │
                                     └─────────────┘
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["No Preprocessing", "Handle Missing", "+ Remove Outliers", "+ Encode + Scale", "+ Feature Engineering"],
    "datasets": [{
      "label": "Model Accuracy (%)",
      "data": [62, 71, 76, 84, 91],
      "backgroundColor": ["rgba(239,68,68,0.6)","rgba(234,88,12,0.6)","rgba(200,180,50,0.6)","rgba(99,102,241,0.7)","rgba(34,197,94,0.7)"],
      "borderColor": ["rgba(239,68,68,1)","rgba(234,88,12,1)","rgba(200,180,50,1)","rgba(99,102,241,1)","rgba(34,197,94,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Impact of Each Preprocessing Step on Model Accuracy" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Accuracy (%)" }, "min": 50, "max": 100 }
    }
  }
}
```

---

## Common Mistakes to Avoid

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TOP 5 PREPROCESSING MISTAKES                      │
├────────────────────────────────┬────────────────────────────────────┤
│ MISTAKE                        │ WHY IT'S BAD                        │
├────────────────────────────────┼────────────────────────────────────┤
│ 1. Scaling BEFORE splitting    │ Test data stats leak into training │
│    into train/test             │ -> artificially good results       │
│                                │ -> model fails in production       │
├────────────────────────────────┼────────────────────────────────────┤
│ 2. Dropping all rows with      │ If missingness is informative,     │
│    missing values              │ you're losing signal! Also reduces │
│                                │ dataset size unnecessarily.        │
├────────────────────────────────┼────────────────────────────────────┤
│ 3. One-Hot encoding features   │ 1000 categories = 1000 new columns│
│    with many categories        │ -> model becomes very slow         │
│                                │ Use Target or Frequency encoding.  │
├────────────────────────────────┼────────────────────────────────────┤
│ 4. Not handling outliers       │ One extreme value can dominate the │
│    before scaling              │ entire scale of your features      │
│                                │ Use Standardization or clip first. │
├────────────────────────────────┼────────────────────────────────────┤
│ 5. Label Encoding nominal data │ Model thinks blue(1) < green(2)   │
│    (colors, cities)            │ < red(3) -- creates fake ordering  │
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

<details>
<summary>Answers</summary>

1. 40% is too much to just fill with mean/median — you'd introduce too much bias. Consider: (a) creating a binary "was_missing" indicator column and then filling, (b) using a model to predict missing values, or (c) dropping the column if it's not very predictive.
2. Min-Max scales to [0,1] — good for neural networks and when you need bounded values. Standardization centers around 0 with std=1 — better when data has outliers or is approximately normal. Use Standardization as your default.
3. Target Encoding (replace city with average target value for that city), Frequency Encoding (replace with how often each city appears), Hashing (hash into fixed bins), or Embeddings (let a neural network learn representations).
4. Data leakage means information from outside the training set influences the model — it makes your model look better than it actually is, then it fails in production.
5. Sort the Height data, find Q1 (25th percentile) and Q3 (75th percentile), compute IQR = Q3 - Q1, then check if 900 > Q3 + 1.5 * IQR. If yes, it's an outlier.
</details>

---

## Key Takeaways

```
╔═══════════════════════════════════════════════════════════════╗
║  DATA PREPROCESSING CHEAT SHEET                               ║
║  ─────────────────────────────────────────────────────────   ║
║  1. Handle missing values (impute or drop)                   ║
║  2. Remove outliers (IQR rule or Z-score)                    ║
║  3. Encode categories (One-Hot or Label)                     ║
║  4. Scale features (Min-Max or Standardization)              ║
║  5. Engineer features (create useful, remove useless)        ║
║  6. 80% of a data scientist's time is data prep!             ║
╚═══════════════════════════════════════════════════════════════╝
```

---

**Previous:** [Chapter 4 — Core Concepts](04_core_concepts.md)
**Next:** [Chapter 6 — Supervised Learning](06_supervised_learning.md)
