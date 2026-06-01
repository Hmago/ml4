# Practical Machine Learning — From Zero to Production

> "The best way to learn ML is to DO ML. Theory without practice is useless.
> Practice without theory is dangerous."

**What this document covers:**
A complete hands-on guide to building ML models. Starting from installing Python, all the way through training, evaluating, and deploying models. Every section includes real code you can copy-paste and run. Organized from beginner to advanced.

---

## What You'll Learn

After working through this guide, you will be able to:
- Set up a complete ML development environment from scratch
- Load datasets from multiple sources (sklearn, Kaggle, CSV, APIs)
- Explore and visualize data to understand its structure
- Preprocess data (handle missing values, encode, scale)
- Train and evaluate 10+ ML algorithms with real code
- Tune hyperparameters using Grid Search and Random Search
- Build end-to-end ML pipelines
- Debug common ML problems (overfitting, data leakage, class imbalance)
- Train basic neural networks with PyTorch/TensorFlow

---

## Table of Contents

| Part | Topic | Difficulty |
|------|-------|-----------|
| 1 | Environment Setup & Installation | Beginner |
| 2 | Loading & Downloading Datasets | Beginner |
| 3 | Exploratory Data Analysis (EDA) | Beginner |
| 4 | Data Preprocessing (Complete Guide) | Beginner-Intermediate |
| 5 | Your First ML Model (Step by Step) | Beginner |
| 6 | Supervised Learning Algorithms (7 algorithms + comparison) | Intermediate |
| 7 | Unsupervised Learning (K-Means, PCA, DBSCAN, Silhouette) | Intermediate |
| 8 | Model Evaluation (Metrics, CV, Learning Curves, Imbalance) | Intermediate |
| 9 | Hyperparameter Tuning (Grid + Random Search) | Intermediate |
| 10 | Feature Engineering (with runnable examples) | Intermediate-Advanced |
| 11 | ML Pipelines (Production-Ready Code) | Intermediate-Advanced |
| 12 | Neural Networks (PyTorch + Keras) | Advanced |
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

```
  THE ML TECH STACK:
  ┌────────────────────────────────────────────────────────────┐
  │                                                            │
  │  LANGUAGE:    Python (the standard for ML)                 │
  │                                                            │
  │  CORE LIBRARIES:                                           │
  │  ┌──────────────┬─────────────────────────────────────┐    │
  │  │ NumPy        │ Fast math on arrays/matrices         │    │
  │  │ Pandas       │ Data loading, cleaning, manipulation │    │
  │  │ Matplotlib   │ Basic plotting and charts            │    │
  │  │ Seaborn      │ Beautiful statistical visualizations │    │
  │  │ Scikit-learn │ THE ML library (models, metrics,     │    │
  │  │              │  preprocessing, everything)          │    │
  │  └──────────────┴─────────────────────────────────────┘    │
  │                                                            │
  │  ADVANCED (install later when needed):                     │
  │  ┌──────────────┬─────────────────────────────────────┐    │
  │  │ XGBoost      │ Gradient boosting (Kaggle winner)    │    │
  │  │ LightGBM     │ Fast gradient boosting (large data)  │    │
  │  │ PyTorch      │ Deep learning framework (research)   │    │
  │  │ TensorFlow   │ Deep learning framework (production) │    │
  │  │ Jupyter      │ Interactive notebooks                │    │
  │  └──────────────┴─────────────────────────────────────┘    │
  │                                                            │
  └────────────────────────────────────────────────────────────┘
```

---

## 1.2 Installation — Step by Step

### Option A: Using pip (simplest)

```python
# Step 1: Install Python 3.9+ from python.org
# During installation, CHECK "Add Python to PATH"

# Step 2: Open terminal/command prompt and verify
python --version     # should show Python 3.9+
pip --version        # should show pip 21+

# Step 3: Install core libraries
pip install numpy pandas matplotlib seaborn scikit-learn jupyter

# Step 4: Install advanced libraries (optional, do when needed)
pip install xgboost lightgbm
pip install torch torchvision       # PyTorch
pip install tensorflow              # TensorFlow

# Step 5: Launch Jupyter Notebook
jupyter notebook
# This opens a browser window where you can write and run code
```

### Option B: Using Anaconda (recommended for beginners)

```python
# Step 1: Download Anaconda from anaconda.com
# It comes with Python + most ML libraries pre-installed

# Step 2: Open Anaconda Prompt and create an environment
conda create -n ml_env python=3.11
conda activate ml_env

# Step 3: Install libraries
conda install numpy pandas matplotlib seaborn scikit-learn jupyter
conda install -c conda-forge xgboost lightgbm

# Step 4: Launch Jupyter
jupyter notebook
```

### Option C: Google Colab (zero install — runs in browser)

```
  Go to: https://colab.research.google.com
  
  - FREE (with GPU!)
  - All libraries pre-installed
  - Works from any browser
  - Saves to Google Drive
  - Perfect for learning and prototyping
  
  Most libraries are already available. If you need one:
  !pip install xgboost
```

### Verify Everything Works

```python
# Run this in a Jupyter cell or Python script to verify:
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import load_iris

print(f"NumPy:        {np.__version__}")
print(f"Pandas:       {pd.__version__}")
print(f"Scikit-learn: loaded successfully")
print(f"Matplotlib:   loaded successfully")
print(f"Seaborn:      loaded successfully")

# Quick test: load a dataset and plot it
iris = load_iris()
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df['species'] = iris.target
print(f"\nIris dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
print("Setup complete!")
```

---

# PART 2: LOADING & DOWNLOADING DATASETS

---

## 2.1 Where to Get Datasets

```
  ┌───────────────────────────────────────────────────────────────────┐
  │  SOURCE               │ WHAT / WHEN TO USE                        │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ sklearn.datasets      │ Built-in toy datasets. Perfect for        │
  │                       │ learning. No download needed.             │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ Kaggle                │ Thousands of real-world datasets.         │
  │ kaggle.com/datasets   │ Competitions with prizes. Best for        │
  │                       │ portfolio projects.                       │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ UCI ML Repository     │ Classic academic datasets. Iris, Wine,    │
  │                       │ Adult Income. Good for textbook examples. │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ Hugging Face          │ NLP datasets, pre-trained models.         │
  │ huggingface.co        │ Best for text/language tasks.             │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ Google Dataset Search │ Search across millions of datasets.       │
  │                       │ Great for finding niche data.             │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ Your own CSV/Excel    │ Real company data. Most common in         │
  │                       │ actual work.                              │
  └───────────────────────┴───────────────────────────────────────────┘
```

---

## 2.2 Loading Datasets — Code for Every Source

### Method 1: Scikit-learn Built-in Datasets (easiest)

```python
from sklearn.datasets import (
    load_iris,           # Classification: 3 flower species (150 rows)
    load_wine,           # Classification: 3 wine types (178 rows)
    load_breast_cancer,  # Classification: malignant vs benign (569 rows)
    load_digits,         # Classification: handwritten digits 0-9 (1797 rows)
    load_diabetes,       # Regression: disease progression (442 rows)
    load_boston,          # Regression: house prices (506 rows) [deprecated]
    fetch_california_housing,  # Regression: house prices (20640 rows)
    make_classification, # Generate synthetic classification data
    make_regression,     # Generate synthetic regression data
)

# --- LOAD A CLASSIFICATION DATASET ---
iris = load_iris()

# Convert to Pandas DataFrame (much easier to work with)
import pandas as pd
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df['target'] = iris.target
df['species'] = df['target'].map({0: 'setosa', 1: 'versicolor', 2: 'virginica'})

print(df.head())
#    sepal length (cm)  sepal width (cm)  ...  target    species
# 0                5.1               3.5  ...       0     setosa
# 1                4.9               3.0  ...       0     setosa

# --- LOAD A REGRESSION DATASET ---
housing = fetch_california_housing()
df_housing = pd.DataFrame(housing.data, columns=housing.feature_names)
df_housing['price'] = housing.target
print(df_housing.head())

# --- GENERATE SYNTHETIC DATA (great for experiments) ---
from sklearn.datasets import make_classification
X, y = make_classification(
    n_samples=1000,    # number of rows
    n_features=20,     # number of features
    n_informative=10,  # features that actually matter
    n_classes=2,       # binary classification
    random_state=42    # reproducibility
)
print(f"Synthetic data: {X.shape[0]} samples, {X.shape[1]} features")
```

### Method 2: Load from CSV / Excel File

```python
import pandas as pd

# --- FROM CSV ---
df = pd.read_csv("data/my_dataset.csv")
# Common parameters:
df = pd.read_csv(
    "data/my_dataset.csv",
    sep=",",                # delimiter (use "\t" for TSV)
    header=0,               # row number for column names (None if no header)
    na_values=["?", "N/A"], # treat these as missing values
    dtype={"zip": str},     # force column types
    nrows=10000,            # only read first N rows (for large files)
)

# --- FROM EXCEL ---
df = pd.read_excel("data/my_dataset.xlsx", sheet_name="Sheet1")

# --- FROM URL (any CSV on the internet) ---
url = "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/titanic.csv"
df = pd.read_csv(url)
print(df.head())
print(f"Shape: {df.shape}")
```

### Method 3: Download from Kaggle

```python
# Step 1: Install the Kaggle API
# pip install kaggle

# Step 2: Get your API key:
# Go to kaggle.com -> Your Profile -> Account -> Create New Token
# This downloads kaggle.json. Place it in:
#   Windows: C:\Users\<username>\.kaggle\kaggle.json
#   Mac/Linux: ~/.kaggle/kaggle.json

# Step 3: Download a dataset via command line
# kaggle datasets download -d <dataset-path>

# Example: Download the Titanic dataset
# kaggle competitions download -c titanic

# Step 4: In Python, unzip and load
import zipfile
import pandas as pd

with zipfile.ZipFile("titanic.zip", "r") as z:
    z.extractall("titanic_data/")

df = pd.read_csv("titanic_data/train.csv")
print(df.head())

# --- OR USE KAGGLE API DIRECTLY IN PYTHON ---
# In Google Colab, you can upload kaggle.json and run:
# !kaggle competitions download -c titanic
```

### Method 4: Seaborn Built-in Datasets

```python
import seaborn as sns

# List all available datasets
print(sns.get_dataset_names())
# ['anagrams', 'anscombe', 'attention', 'brain_networks', 'car_crashes',
#  'diamonds', 'dots', 'exercise', 'flights', 'fmri', 'geyser', 'glue',
#  'healthexp', 'iris', 'mpg', 'penguins', 'planets', 'seaice',
#  'taxis', 'tips', 'titanic', ...]

# Load one
tips = sns.load_dataset("tips")
titanic = sns.load_dataset("titanic")
diamonds = sns.load_dataset("diamonds")
penguins = sns.load_dataset("penguins")

print(tips.head())
```

### Recommended Starter Datasets (by difficulty)

```
  ┌─────────────────────────────────────────────────────────────────┐
  │  BEGINNER:                                                       │
  │  Iris (classification, 150 rows, 4 features) — your first model │
  │  Tips (regression, 244 rows) — predict tip amount               │
  │  Penguins (classification, 344 rows) — cleaner version of Iris  │
  │                                                                  │
  │  INTERMEDIATE:                                                    │
  │  Titanic (classification, 891 rows) — survival prediction        │
  │  California Housing (regression, 20K rows) — house prices       │
  │  Diamonds (regression, 54K rows) — predict diamond price        │
  │                                                                  │
  │  ADVANCED:                                                        │
  │  Adult Income (classification, 48K rows) — income > 50K?        │
  │  MNIST (classification, 70K images) — handwritten digit images  │
  │  Credit Card Fraud (classification, 284K rows, imbalanced!)     │
  └─────────────────────────────────────────────────────────────────┘
```

---

# PART 3: EXPLORATORY DATA ANALYSIS (EDA)

---

## 3.1 The First 10 Commands You Should Always Run

```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load your data
df = sns.load_dataset("titanic")

# ─── STEP 1: Basic shape and structure ───
print(df.shape)           # (891, 15) — 891 rows, 15 columns
print(df.head())          # First 5 rows
print(df.dtypes)          # Data types of each column
print(df.info())          # Non-null counts + types (spot missing values!)
print(df.describe())      # Statistics for numeric columns (mean, std, min, max)

# ─── STEP 2: Check for missing values ───
print(df.isnull().sum())  # Count of missing values per column
print(df.isnull().sum() / len(df) * 100)  # Percentage missing

# ─── STEP 3: Check for duplicates ───
print(f"Duplicates: {df.duplicated().sum()}")

# ─── STEP 4: Check target variable distribution ───
print(df['survived'].value_counts())           # Counts
print(df['survived'].value_counts(normalize=True))  # Percentages

# ─── STEP 5: Check unique values in categorical columns ───
for col in df.select_dtypes(include='object').columns:
    print(f"{col}: {df[col].nunique()} unique values")
    print(df[col].value_counts().head())
    print()
```

---

## 3.2 Visualization — See Your Data

### Distribution of Numeric Features

```python
# Histogram for every numeric column
df.hist(figsize=(12, 8), bins=30)
plt.tight_layout()
plt.show()

# Distribution of one column with KDE
sns.histplot(df['age'], kde=True, bins=30)
plt.title("Age Distribution")
plt.show()

# Box plots to spot outliers
sns.boxplot(data=df[['age', 'fare']])
plt.title("Box Plot — Age and Fare")
plt.show()
```

### Relationship Between Features

```python
# Correlation matrix heatmap (numeric columns only)
plt.figure(figsize=(10, 8))
numeric_df = df.select_dtypes(include='number')
sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', center=0, fmt='.2f')
plt.title("Correlation Matrix")
plt.show()

# Scatter plot: two features colored by target
sns.scatterplot(data=df, x='age', y='fare', hue='survived', alpha=0.6)
plt.title("Age vs Fare by Survival")
plt.show()

# Pair plot (all combinations — powerful but slow for many features)
sns.pairplot(df[['age', 'fare', 'pclass', 'survived']], hue='survived')
plt.show()
```

### Categorical Features vs Target

```python
# Bar plot: survival rate by class
sns.barplot(data=df, x='pclass', y='survived')
plt.title("Survival Rate by Passenger Class")
plt.ylabel("Survival Rate")
plt.show()

# Count plot: how many in each category
sns.countplot(data=df, x='pclass', hue='survived')
plt.title("Survival Counts by Class")
plt.show()

# Cross-tabulation
print(pd.crosstab(df['pclass'], df['survived'], margins=True))
```

### How to READ Your Visualizations

```
  WHAT TO LOOK FOR IN EACH PLOT:
  ┌─────────────────────────────────────────────────────────────────┐
  │ HISTOGRAM          │ Is it bell-shaped (normal)? Skewed right  │
  │                    │ (long tail to the right)? Bimodal (two    │
  │                    │ peaks = possibly two populations)?        │
  │                    │ Skewed? -> consider log transform.        │
  ├────────────────────┼────────────────────────────────────────────┤
  │ BOX PLOT           │ Dots outside the whiskers = outliers.     │
  │                    │ Many outliers? -> investigate. Typos?     │
  │                    │ Real extreme values? -> cap or remove.    │
  ├────────────────────┼────────────────────────────────────────────┤
  │ CORRELATION HEATMAP│ Values near +1 or -1 = strong correlation.│
  │                    │ Two features at 0.95? -> drop one (they   │
  │                    │ carry the same info = multicollinearity). │
  │                    │ Feature correlated with target? -> good   │
  │                    │ predictor!                                │
  ├────────────────────┼────────────────────────────────────────────┤
  │ SCATTER PLOT       │ Clear clusters by color (hue) = that      │
  │                    │ feature helps separate classes.           │
  │                    │ Random cloud = feature may not be useful. │
  ├────────────────────┼────────────────────────────────────────────┤
  │ BAR PLOT (target)  │ Tall bar for one category = that category │
  │                    │ has a strong effect on the target.        │
  │                    │ All bars similar height = feature has     │
  │                    │ little predictive power.                  │
  └────────────────────┴────────────────────────────────────────────┘
```

### EDA Checklist

```
  ┌──────────────────────────────────────────────────────────────┐
  │  BEFORE building any model, answer these questions:           │
  │                                                               │
  │  [ ] How many rows and columns?                               │
  │  [ ] What are the data types? (numeric, categorical, text)    │
  │  [ ] Any missing values? How much? Which columns?             │
  │  [ ] Any duplicate rows?                                      │
  │  [ ] Is the target variable balanced or imbalanced?           │
  │  [ ] What do the distributions look like? Any outliers?       │
  │  [ ] Which features are correlated with the target?           │
  │  [ ] Which features are correlated with each other?           │
  │  [ ] Any obvious data quality issues? (wrong types, errors)   │
  └──────────────────────────────────────────────────────────────┘
```

### Try It Yourself -- EDA Challenge

```
  Load the "penguins" dataset and answer these questions:
  
  1. How many rows and columns? Any missing values?
  2. What species are in the dataset? Is it balanced?
  3. Which numeric feature is most correlated with body_mass_g?
  4. Create a scatter plot of flipper_length vs body_mass, colored by species.
     Can you visually separate the species?
  5. Are there any outliers in bill_depth_mm?
```

```python
# Starter code:
import seaborn as sns
penguins = sns.load_dataset("penguins")
# YOUR CODE HERE — answer the 5 questions above
```

---

# PART 4: DATA PREPROCESSING (COMPLETE GUIDE)

---

## 4.1 Handle Missing Values

```python
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer

df = sns.load_dataset("titanic")

# ─── SEE WHAT'S MISSING ───
print(df.isnull().sum())
# age         177  (19.9%)
# deck        688  (77.2%)   <-- too much! consider dropping
# embark_town   2  (0.2%)

# ─── STRATEGY 1: Drop rows (when very few are missing) ───
df_clean = df.dropna(subset=['embark_town'])  # only 2 rows lost

# ─── STRATEGY 2: Drop column (when > 50% missing) ───
df_clean = df.drop(columns=['deck'])  # 77% missing, not useful

# ─── STRATEGY 3: Fill with median (numeric, has outliers) ───
df['age'] = df['age'].fillna(df['age'].median())

# ─── STRATEGY 4: Fill with mode (categorical) ───
df['embark_town'] = df['embark_town'].fillna(df['embark_town'].mode()[0])

# ─── STRATEGY 5: Using sklearn SimpleImputer (recommended for pipelines) ───
imputer_num = SimpleImputer(strategy='median')   # for numeric
imputer_cat = SimpleImputer(strategy='most_frequent')  # for categorical

# ─── STRATEGY 6: Create a "was_missing" indicator column ───
df['age_missing'] = df['age'].isnull().astype(int)
df['age'] = df['age'].fillna(df['age'].median())
# Now the model knows WHICH rows had missing age
```

### When to Use Which Strategy

```
  ┌─────────────────────────────────────────────────────────────┐
  │  % Missing  │  Strategy                                      │
  ├─────────────┼───────────────────────────────────────────────┤
  │  < 5%       │  Drop rows OR fill with median/mode           │
  │  5% - 30%   │  Fill with median/mode + add "was_missing" col│
  │  30% - 50%  │  Use a model to predict missing values (KNN)  │
  │  > 50%      │  Drop the column (unless domain-important)    │
  └─────────────┴───────────────────────────────────────────────┘
```

---

## 4.2 Encode Categorical Variables

```python
import pandas as pd
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, OrdinalEncoder

df = sns.load_dataset("titanic")

# ─── METHOD 1: Label Encoding (ordinal categories) ───
# Use when categories have a natural ORDER
# Example: "low" < "medium" < "high"
le = LabelEncoder()
df['sex_encoded'] = le.fit_transform(df['sex'])
# female -> 0, male -> 1

# ─── METHOD 2: One-Hot Encoding (nominal categories) ───
# Use when categories have NO natural order
# Example: "red", "blue", "green" — no ordering
df_encoded = pd.get_dummies(df, columns=['embark_town'], drop_first=True)
# Creates: embark_town_Queenstown, embark_town_Southampton
# drop_first=True avoids the "dummy variable trap" (multicollinearity)

# ─── METHOD 3: Ordinal Encoding (custom order) ───
# Use when you want to specify the exact order
oe = OrdinalEncoder(categories=[['Third', 'Second', 'First']])
df['class_encoded'] = oe.fit_transform(df[['class']])
# Third -> 0, Second -> 1, First -> 2

# ─── METHOD 4: Target Encoding (high cardinality) ───
# Replace each category with the mean of the target for that category
# Great when a column has 100+ categories (one-hot would explode)
target_means = df.groupby('embark_town')['survived'].mean()
df['embark_target_encoded'] = df['embark_town'].map(target_means)
# Cherbourg -> 0.55, Queenstown -> 0.39, Southampton -> 0.34
```

### When to Use Which Encoding

```
  ┌──────────────────────────────────────────────────────────────┐
  │  Encoding          │  When to Use                             │
  ├────────────────────┼──────────────────────────────────────────┤
  │  One-Hot           │  Nominal (no order), < 10 categories     │
  │  Label / Ordinal   │  Ordinal (has order), tree-based models  │
  │  Target Encoding   │  High cardinality (100+ categories)      │
  │  Binary Encoding   │  Medium cardinality (10-100 categories)  │
  └────────────────────┴──────────────────────────────────────────┘

  WARNING: Tree models (Random Forest, XGBoost) can handle
  Label Encoding even for nominal features. Linear models CANNOT
  — they'll think category 3 > category 1, which is wrong.
  Use One-Hot for linear models, logistic regression, SVM.
```

---

## 4.3 Feature Scaling

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import train_test_split

# ─── STEP 1: ALWAYS split BEFORE scaling (prevent data leakage!) ───
X = df[['age', 'fare', 'pclass']].dropna()
y = df.loc[X.index, 'survived']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ─── METHOD 1: StandardScaler (Z-score: mean=0, std=1) ───
# Best for: linear models, SVM, neural networks
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)   # fit on TRAIN only!
X_test_scaled = scaler.transform(X_test)          # transform test with TRAIN stats

# ─── METHOD 2: MinMaxScaler (scale to 0-1) ───
# Best for: neural networks, KNN, algorithms sensitive to magnitude
scaler = MinMaxScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

```
  ╔══════════════════════════════════════════════════════════════╗
  ║  CRITICAL RULE: FIT ON TRAIN, TRANSFORM BOTH                ║
  ║                                                              ║
  ║  WRONG: scaler.fit_transform(ALL_DATA)    <- DATA LEAKAGE!  ║
  ║  RIGHT: scaler.fit(X_train)               <- learn from     ║
  ║         scaler.transform(X_train)            train only      ║
  ║         scaler.transform(X_test)          <- apply same      ║
  ║                                              stats to test   ║
  ╚══════════════════════════════════════════════════════════════╝
```

### Which Algorithms Need Scaling?

```
  ┌──────────────────────────────────────────────────────────────┐
  │  NEEDS SCALING:              │  DOESN'T NEED SCALING:        │
  ├──────────────────────────────┼───────────────────────────────┤
  │  Linear Regression           │  Decision Tree                │
  │  Logistic Regression         │  Random Forest                │
  │  SVM                         │  XGBoost / LightGBM           │
  │  KNN                         │  Naive Bayes                  │
  │  K-Means                     │  CatBoost                     │
  │  PCA                         │                               │
  │  Neural Networks             │  (Tree models split on values │
  │  Gradient Descent-based      │   so scale doesn't matter)    │
  └──────────────────────────────┴───────────────────────────────┘
```

---

# PART 5: YOUR FIRST ML MODEL (STEP BY STEP)

---

## 5.1 Complete Beginner Walkthrough — Iris Classification

```python
# ══════════════════════════════════════════════════════════════════
#  YOUR FIRST ML MODEL: Predicting Iris Flower Species
#  Dataset: 150 flowers, 4 measurements, 3 species
# ══════════════════════════════════════════════════════════════════

# ─── STEP 1: Import libraries ───
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# ─── STEP 2: Load and explore the data ───
iris = load_iris()
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df['species'] = iris.target_names[iris.target]

print("Shape:", df.shape)
print("\nFirst 5 rows:")
print(df.head())
print("\nClass distribution:")
print(df['species'].value_counts())
# setosa        50
# versicolor    50
# virginica     50  (perfectly balanced!)

# ─── STEP 3: Prepare features (X) and target (y) ───
X = df[iris.feature_names]    # 4 feature columns
y = iris.target               # 0, 1, or 2

# ─── STEP 4: Split into training and test sets ───
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,      # 80% train, 20% test
    random_state=42,     # for reproducibility
    stratify=y           # keep class balance in both splits
)
print(f"\nTrain: {X_train.shape[0]} samples")
print(f"Test:  {X_test.shape[0]} samples")

# ─── STEP 5: Scale features ───
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ─── STEP 6: Train the model ───
model = KNeighborsClassifier(n_neighbors=5)
model.fit(X_train_scaled, y_train)  # THIS IS WHERE LEARNING HAPPENS
print("\nModel trained!")

# ─── STEP 7: Make predictions ───
y_pred = model.predict(X_test_scaled)

# ─── STEP 8: Evaluate ───
accuracy = accuracy_score(y_test, y_pred)
print(f"\nAccuracy: {accuracy:.2%}")  # should be ~96-100%

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=iris.target_names))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# ─── STEP 9: Visualize the confusion matrix ───
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=iris.target_names,
            yticklabels=iris.target_names)
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix')
plt.show()
```

```
  WHAT JUST HAPPENED — STEP BY STEP:
  ────────────────────────────────────────────────────────

  Load Data → Explore → Split → Scale → Train → Predict → Evaluate
       │          │        │       │       │        │          │
       ▼          ▼        ▼       ▼       ▼        ▼          ▼
  150 flowers  Check     80/20  Normalize  KNN    Model    Accuracy
  4 features   for       split  features  learns  guesses   = 97%
  3 species    issues                     pattern species

  This workflow is THE SAME for every ML project.
  Only the model and preprocessing change.
```

### Try It Yourself -- First Model Challenge

```
  Now do it on your own! Load the breast cancer dataset and build a classifier.

  1. Load: from sklearn.datasets import load_breast_cancer
  2. Convert to DataFrame, explore with .shape, .describe(), .value_counts()
  3. Split 80/20 with stratify
  4. Scale features
  5. Train a KNeighborsClassifier
  6. Print accuracy and classification report
  7. BONUS: Try K=1, 3, 5, 7, 9 — which K gives the best accuracy?
```

```python
# Starter code:
from sklearn.datasets import load_breast_cancer
data = load_breast_cancer()
# YOUR CODE HERE — follow the 7 steps above
```

---

# PART 6: SUPERVISED LEARNING ALGORITHMS

For each algorithm: what it is, when to use it, advantages/disadvantages,
and complete runnable code.

### Setup Code (run this FIRST before any algorithm below)

```python
# ═══ RUN THIS CELL FIRST — sets up data for all algorithm examples ═══
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report

# Load Iris dataset
iris = load_iris()
X = pd.DataFrame(iris.data, columns=iris.feature_names)
y = iris.target

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scaled versions (for algorithms that need scaling)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"Ready! Train: {X_train.shape}, Test: {X_test.shape}")
```

---

## 6.1 Logistic Regression

```
  WHAT: Predicts probability of belonging to a class (0 or 1).
        Despite the name, it's for CLASSIFICATION, not regression.
  
  WHEN TO USE:
  - Binary classification (spam/not spam, yes/no)
  - You need interpretable results (which features matter?)
  - Baseline model (always try this first!)
  - Linear decision boundary is sufficient
  
  ADVANTAGES:                        DISADVANTAGES:
  + Fast to train and predict        - Only linear boundaries
  + Highly interpretable             - Needs feature scaling
  + Outputs probabilities            - Struggles with complex patterns
  + Works well with high-dim text    - Assumes feature independence
  + Good baseline for any project
```

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# Train
model = LogisticRegression(max_iter=1000, random_state=42)
model.fit(X_train_scaled, y_train)

# Predict
y_pred = model.predict(X_test_scaled)
y_prob = model.predict_proba(X_test_scaled)  # probabilities

# Evaluate
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2%}")
print(classification_report(y_test, y_pred))

# See which features matter most
for name, coef in zip(iris.feature_names, model.coef_[0]):
    print(f"  {name}: {coef:.3f}")
```

---

## 6.2 Decision Tree

```
  WHAT: Learns a series of if/else rules to classify or predict.
        Like a flowchart — follow the path to the answer.
  
  WHEN TO USE:
  - You need full interpretability (show the tree to stakeholders)
  - Mixed feature types (numeric + categorical)
  - Non-linear relationships
  - As building block for ensembles (Random Forest, XGBoost)
  
  ADVANTAGES:                        DISADVANTAGES:
  + Easy to understand and visualize + Prone to overfitting (deep trees)
  + No scaling needed                - Unstable (small data change =
  + Handles non-linear patterns        completely different tree)
  + Fast training                    - Usually lower accuracy than
  + Works with mixed types             ensemble methods
```

```python
from sklearn.tree import DecisionTreeClassifier, plot_tree

# Train
model = DecisionTreeClassifier(
    max_depth=3,           # limit depth to prevent overfitting
    min_samples_split=10,  # need at least 10 samples to split
    random_state=42
)
model.fit(X_train, y_train)  # no scaling needed for trees!

# Predict & evaluate
y_pred = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2%}")

# Visualize the tree!
plt.figure(figsize=(15, 8))
plot_tree(model, feature_names=iris.feature_names,
          class_names=iris.target_names, filled=True, rounded=True)
plt.title("Decision Tree for Iris Classification")
plt.show()

# Feature importance
for name, imp in sorted(zip(iris.feature_names, model.feature_importances_),
                         key=lambda x: x[1], reverse=True):
    print(f"  {name}: {imp:.3f}")
```

---

## 6.3 Random Forest

```
  WHAT: Trains many decision trees on random subsets of data,
        then lets them vote. Wisdom of the crowd beats any individual.
  
  WHEN TO USE:
  - Almost ANY classification or regression problem
  - When you want good accuracy without much tuning
  - When you need feature importance
  - First "serious" model to try after baseline
  
  ADVANTAGES:                        DISADVANTAGES:
  + High accuracy out of the box     - Slower than single tree
  + Resistant to overfitting         - Less interpretable (100 trees)
  + No scaling needed                - Large memory for many trees
  + Handles missing values (some     - Can be slow on very large data
    implementations)
  + Built-in feature importance
```

```python
from sklearn.ensemble import RandomForestClassifier

# Train
model = RandomForestClassifier(
    n_estimators=100,      # 100 trees
    max_depth=5,           # limit each tree's depth
    min_samples_leaf=5,    # each leaf needs at least 5 samples
    random_state=42,
    n_jobs=-1              # use all CPU cores (parallel!)
)
model.fit(X_train, y_train)

# Predict & evaluate
y_pred = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2%}")

# Feature importance (very useful!)
importance = pd.Series(model.feature_importances_, index=iris.feature_names)
importance.sort_values(ascending=True).plot.barh()
plt.title("Feature Importance (Random Forest)")
plt.xlabel("Importance")
plt.show()
```

---

## 6.4 XGBoost / LightGBM (Gradient Boosting)

```
  WHAT: Builds trees sequentially — each tree fixes the errors
        of the previous ones. The go-to algorithm for structured data.
  
  WHEN TO USE:
  - Tabular/structured data (spreadsheets, databases)
  - Kaggle competitions (wins most tabular challenges)
  - When you need the best accuracy possible
  - Medium to large datasets
  
  ADVANTAGES:                        DISADVANTAGES:
  + Best accuracy on tabular data    - More hyperparameters to tune
  + Handles missing values natively  - Can overfit if not tuned
  + Built-in regularization          - Slower training than RF
  + Supports GPU acceleration        - Less interpretable
```

```python
# pip install xgboost lightgbm

# ─── XGBOOST ───
from xgboost import XGBClassifier

model = XGBClassifier(
    n_estimators=100,
    max_depth=4,
    learning_rate=0.1,     # smaller = more careful learning
    subsample=0.8,         # use 80% of data per tree
    colsample_bytree=0.8,  # use 80% of features per tree
    random_state=42,
    eval_metric='mlogloss'
)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
print(f"XGBoost Accuracy: {accuracy_score(y_test, y_pred):.2%}")

# ─── LIGHTGBM (faster for large data) ───
from lightgbm import LGBMClassifier

model = LGBMClassifier(
    n_estimators=100,
    max_depth=4,
    learning_rate=0.1,
    num_leaves=31,         # LightGBM's main param instead of max_depth
    random_state=42,
    verbose=-1
)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
print(f"LightGBM Accuracy: {accuracy_score(y_test, y_pred):.2%}")
```

---

## 6.5 Support Vector Machine (SVM)

```
  WHAT: Finds the best boundary (hyperplane) that separates classes
        with the widest margin. Can handle non-linear boundaries
        using the "kernel trick."
  
  WHEN TO USE:
  - Small to medium datasets (slow on large data)
  - High-dimensional data (text classification)
  - When you need a strong non-linear classifier (RBF kernel)
  - Binary classification especially
  
  ADVANTAGES:                        DISADVANTAGES:
  + Strong on high-dim data          - Slow on large datasets O(n^2)
  + Effective with clear margins     - Needs feature scaling
  + Kernel trick for non-linear      - Memory intensive
  + Robust to overfitting (in        - Hard to interpret
    high dimensions)                 - Sensitive to hyperparams (C, gamma)
```

```python
from sklearn.svm import SVC

# Train (always scale for SVM!)
model = SVC(
    kernel='rbf',       # 'linear', 'rbf', 'poly'
    C=1.0,              # regularization (higher = less regularization)
    gamma='scale',      # kernel coefficient
    probability=True,   # enable predict_proba (slower)
    random_state=42
)
model.fit(X_train_scaled, y_train)

y_pred = model.predict(X_test_scaled)
print(f"SVM Accuracy: {accuracy_score(y_test, y_pred):.2%}")
```

---

## 6.6 K-Nearest Neighbors (KNN)

```
  WHAT: Classifies a new point by majority vote of its K closest neighbors.
        No training phase — stores all data and computes at prediction time.
  
  WHEN TO USE:
  - Small datasets
  - When you need a simple, non-parametric baseline
  - Recommendation systems (similar items/users)
  
  ADVANTAGES:                        DISADVANTAGES:
  + Very simple to understand        - Slow at prediction (scans all data)
  + No training phase                - Needs feature scaling
  + Works for any decision boundary  - Sensitive to irrelevant features
  + Easy to update (just add data)   - Curse of dimensionality
```

```python
from sklearn.neighbors import KNeighborsClassifier

# Train (always scale for KNN!)
model = KNeighborsClassifier(n_neighbors=5, metric='minkowski')
model.fit(X_train_scaled, y_train)

y_pred = model.predict(X_test_scaled)
print(f"KNN Accuracy: {accuracy_score(y_test, y_pred):.2%}")

# Find the best K
from sklearn.model_selection import cross_val_score
k_range = range(1, 31)
k_scores = [cross_val_score(KNeighborsClassifier(n_neighbors=k),
            X_train_scaled, y_train, cv=5, scoring='accuracy').mean()
            for k in k_range]

plt.plot(k_range, k_scores)
plt.xlabel('K')
plt.ylabel('Cross-Validated Accuracy')
plt.title('KNN: Finding the Best K')
plt.show()
best_k = k_range[np.argmax(k_scores)]
print(f"Best K: {best_k}")
```

---

## 6.7 Naive Bayes

```
  WHAT: Applies Bayes' theorem with the "naive" assumption that
        features are independent. Surprisingly effective!
  
  WHEN TO USE:
  - Text classification (spam, sentiment) — the classic use case
  - Very fast training needed (large datasets, real-time)
  - Small training set (low variance)
  - Multi-class classification
  
  ADVANTAGES:                        DISADVANTAGES:
  + Extremely fast                   - Assumes feature independence
  + Works well with small data       - Can't learn feature interactions
  + Great for text / NLP             - Probability estimates unreliable
  + Handles many features            - Poor on complex relationships
```

```python
from sklearn.naive_bayes import GaussianNB, MultinomialNB

# GaussianNB for continuous features
model = GaussianNB()
model.fit(X_train_scaled, y_train)
y_pred = model.predict(X_test_scaled)
print(f"Naive Bayes Accuracy: {accuracy_score(y_test, y_pred):.2%}")

# MultinomialNB is for text (with word counts / TF-IDF)
# from sklearn.feature_extraction.text import TfidfVectorizer
# vectorizer = TfidfVectorizer()
# X_text = vectorizer.fit_transform(text_data)
# model = MultinomialNB()
# model.fit(X_text, y_labels)
```

---

## 6.8 Linear Regression (for Regression Problems)

```python
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.datasets import fetch_california_housing

# Load regression dataset
housing = fetch_california_housing()
X = pd.DataFrame(housing.data, columns=housing.feature_names)
y = housing.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ─── Plain Linear Regression ───
model = LinearRegression()
model.fit(X_train_scaled, y_train)
y_pred = model.predict(X_test_scaled)

print(f"MAE:  {mean_absolute_error(y_test, y_pred):.4f}")
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.4f}")
print(f"R2:   {r2_score(y_test, y_pred):.4f}")

# ─── Ridge Regression (L2 regularization) ───
model = Ridge(alpha=1.0)
model.fit(X_train_scaled, y_train)

# ─── Lasso Regression (L1 regularization — feature selection) ───
model = Lasso(alpha=0.01)
model.fit(X_train_scaled, y_train)

# Show which features Lasso kept (non-zero weights)
for name, coef in zip(housing.feature_names, model.coef_):
    status = "KEPT" if abs(coef) > 0.001 else "DROPPED"
    print(f"  {name}: {coef:.4f} ({status})")
```

---

## 6.9 Algorithm Comparison Template

```python
# Compare multiple models on the same dataset in one run
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import cross_val_score

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Decision Tree":       DecisionTreeClassifier(max_depth=5),
    "Random Forest":       RandomForestClassifier(n_estimators=100, n_jobs=-1),
    "Gradient Boosting":   GradientBoostingClassifier(n_estimators=100),
    "SVM (RBF)":           SVC(kernel='rbf'),
    "KNN (K=5)":           KNeighborsClassifier(n_neighbors=5),
    "Naive Bayes":         GaussianNB(),
}

print(f"{'Model':<25} {'CV Accuracy':>12} {'Std':>8}")
print("-" * 48)

results = {}
for name, model in models.items():
    scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='accuracy')
    results[name] = scores.mean()
    print(f"{name:<25} {scores.mean():>11.2%} {scores.std():>7.2%}")

# Visualize
pd.Series(results).sort_values().plot.barh(figsize=(10, 5))
plt.xlabel("Cross-Validated Accuracy")
plt.title("Model Comparison")
plt.show()
```

---

# PART 7: UNSUPERVISED LEARNING ALGORITHMS

---

## 7.1 K-Means Clustering

```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# Scale features first (K-Means uses distance!)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ─── Find optimal K using Elbow Method ───
inertias = []
K_range = range(1, 11)
for k in K_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(X_scaled)
    inertias.append(km.inertia_)

plt.plot(K_range, inertias, 'bo-')
plt.xlabel('Number of Clusters (K)')
plt.ylabel('Inertia')
plt.title('Elbow Method — Choose K at the "bend"')
plt.show()

# ─── Train with chosen K ───
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
clusters = kmeans.fit_predict(X_scaled)

# ─── Visualize (using first 2 features) ───
plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=clusters, cmap='viridis', alpha=0.6)
plt.scatter(kmeans.cluster_centers_[:, 0], kmeans.cluster_centers_[:, 1],
            marker='X', s=200, c='red', label='Centroids')
plt.title('K-Means Clustering')
plt.legend()
plt.show()
```

---

## 7.2 PCA (Dimensionality Reduction)

```python
from sklearn.decomposition import PCA

# Reduce from 4 dimensions to 2 for visualization
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

print(f"Explained variance: {pca.explained_variance_ratio_}")
print(f"Total explained: {sum(pca.explained_variance_ratio_):.2%}")

# Visualize
plt.scatter(X_pca[:, 0], X_pca[:, 1], c=y, cmap='viridis', alpha=0.7)
plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.1%} variance)')
plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.1%} variance)')
plt.title('PCA — Iris Dataset in 2D')
plt.colorbar(label='Species')
plt.show()

# ─── How many components to keep? ───
pca_full = PCA()
pca_full.fit(X_scaled)
cumulative = np.cumsum(pca_full.explained_variance_ratio_)
plt.plot(range(1, len(cumulative)+1), cumulative, 'bo-')
plt.axhline(y=0.95, color='r', linestyle='--', label='95% threshold')
plt.xlabel('Number of Components')
plt.ylabel('Cumulative Explained Variance')
plt.title('How Many Components to Keep?')
plt.legend()
plt.show()
# Keep enough components to explain 95% of variance
```

---

## 7.3 DBSCAN (Density-Based Clustering)

```
  WHAT: Finds clusters based on density — groups of points packed together.
        Automatically determines the number of clusters.
        Marks isolated points as NOISE (outliers).
  
  WHEN TO USE:
  - You don't know how many clusters exist
  - Clusters have irregular/non-spherical shapes
  - You need outlier detection
  
  K-MEANS: assumes round clusters, must specify K
  DBSCAN:  finds any shape, K is automatic, handles noise
```

```python
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_moons

# Generate crescent-shaped data (K-Means would fail on this!)
X_moons, y_moons = make_moons(n_samples=300, noise=0.1, random_state=42)

# DBSCAN
db = DBSCAN(eps=0.2, min_samples=5)
clusters = db.fit_predict(X_moons)

# Visualize
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.scatter(X_moons[:, 0], X_moons[:, 1], c=clusters, cmap='viridis', alpha=0.7)
plt.title(f'DBSCAN: {len(set(clusters)) - (1 if -1 in clusters else 0)} clusters found')
# Note: -1 = noise points

plt.subplot(1, 2, 2)
from sklearn.cluster import KMeans
km_clusters = KMeans(n_clusters=2, random_state=42, n_init=10).fit_predict(X_moons)
plt.scatter(X_moons[:, 0], X_moons[:, 1], c=km_clusters, cmap='viridis', alpha=0.7)
plt.title('K-Means (fails on crescents!)')

plt.tight_layout()
plt.show()
```

---

## 7.4 Evaluating Clusters — Silhouette Score

```python
from sklearn.metrics import silhouette_score

# Try different K values and measure quality
from sklearn.cluster import KMeans

sil_scores = []
K_range = range(2, 11)
for k in K_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, labels)
    sil_scores.append(score)
    print(f"K={k}: Silhouette = {score:.3f}")

plt.plot(K_range, sil_scores, 'bo-')
plt.xlabel('Number of Clusters (K)')
plt.ylabel('Silhouette Score')
plt.title('Silhouette Score — Higher is Better (max = 1.0)')
plt.show()

# Best K = the one with highest silhouette score
best_k = list(K_range)[np.argmax(sil_scores)]
print(f"Best K by Silhouette Score: {best_k}")
```

```
  INTERPRETING SILHOUETTE SCORE:
  ┌────────────────────────────────────────────────────────────┐
  │ Score > 0.7   │ Strong cluster structure                   │
  │ Score > 0.5   │ Reasonable structure                       │
  │ Score > 0.25  │ Weak — clusters may be overlapping         │
  │ Score < 0.25  │ No meaningful structure found               │
  └───────────────┴────────────────────────────────────────────┘

  USE BOTH the Elbow Method (inertia) AND Silhouette Score
  together for the most reliable choice of K.
```

### Try It Yourself -- Clustering Challenge

```
  Load the wine dataset and cluster the wines:
  
  1. from sklearn.datasets import load_wine
  2. Scale the features
  3. Use the Elbow Method to find the best K
  4. Use Silhouette Score to confirm your choice
  5. Train K-Means with your chosen K
  6. Compare your clusters to the real wine labels (wine.target)
     Hint: use sklearn.metrics.adjusted_rand_score
```

---

# PART 8: MODEL EVALUATION & METRICS

---

## 8.1 Classification Metrics

```python
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score, roc_curve
)

# After making predictions...
y_pred = model.predict(X_test_scaled)
y_prob = model.predict_proba(X_test_scaled)[:, 1]  # probability of positive class

# ─── All metrics at once ───
print(classification_report(y_test, y_pred))
#               precision    recall  f1-score   support
# 
#            0       0.95      0.97      0.96        65
#            1       0.93      0.89      0.91        35
# 
#     accuracy                           0.94       100
#    macro avg       0.94      0.93      0.93       100
# weighted avg       0.94      0.94      0.94       100

# ─── ROC Curve and AUC (binary classification only) ───
fpr, tpr, thresholds = roc_curve(y_test, y_prob)
auc = roc_auc_score(y_test, y_prob)

plt.plot(fpr, tpr, label=f'AUC = {auc:.3f}')
plt.plot([0, 1], [0, 1], 'k--', label='Random (AUC = 0.5)')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve')
plt.legend()
plt.show()
```

### Which Metric to Use

```
  ┌────────────────────────────────────────────────────────────────┐
  │  SITUATION                       │ USE THIS METRIC              │
  ├──────────────────────────────────┼──────────────────────────────┤
  │  Balanced classes, general use   │ Accuracy or F1               │
  │  Imbalanced classes              │ F1, Precision, Recall, AUC   │
  │  False positives are costly      │ Precision                    │
  │    (spam filter, fraud alert)    │                              │
  │  False negatives are costly      │ Recall                       │
  │    (cancer detection, security)  │                              │
  │  Need to compare models overall  │ AUC-ROC                      │
  │  Regression: general use         │ RMSE                         │
  │  Regression: outlier-robust      │ MAE                          │
  │  Regression: proportion explained│ R-squared                    │
  └──────────────────────────────────┴──────────────────────────────┘
```

---

## 8.2 Cross-Validation (Don't Trust a Single Split)

```python
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100, random_state=42)

# ─── Basic 5-fold cross-validation ───
scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='accuracy')
print(f"CV Scores:  {scores}")
print(f"Mean:       {scores.mean():.2%}")
print(f"Std:        {scores.std():.2%}")
print(f"95% CI:     {scores.mean():.2%} +/- {scores.std() * 2:.2%}")

# ─── Stratified K-Fold (preserves class balance in each fold) ───
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X_train_scaled, y_train, cv=skf, scoring='f1_macro')
print(f"Stratified CV F1: {scores.mean():.2%} +/- {scores.std():.2%}")
```

```
  WHY CROSS-VALIDATION MATTERS:
  ──────────────────────────────────────────────────────────────
  Single train/test split:   accuracy = 94%  (lucky? unlucky?)
  5-fold cross-validation:   94% +/- 2%     (reliable estimate!)

  ALWAYS report CV scores, not single-split scores.
  If CV std is high (> 5%), your model is unstable — investigate.
```

---

## 8.3 Learning Curves — Diagnose Overfitting vs Underfitting

```
  Learning curves show train and validation scores as training
  data INCREASES. They're the best way to diagnose your model.
```

```python
from sklearn.model_selection import learning_curve

def plot_learning_curve(model, X, y, title="Learning Curve"):
    train_sizes, train_scores, val_scores = learning_curve(
        model, X, y,
        train_sizes=np.linspace(0.1, 1.0, 10),
        cv=5, scoring='accuracy', n_jobs=-1
    )

    train_mean = train_scores.mean(axis=1)
    train_std = train_scores.std(axis=1)
    val_mean = val_scores.mean(axis=1)
    val_std = val_scores.std(axis=1)

    plt.figure(figsize=(8, 5))
    plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.1)
    plt.fill_between(train_sizes, val_mean - val_std, val_mean + val_std, alpha=0.1)
    plt.plot(train_sizes, train_mean, 'o-', label='Training Score')
    plt.plot(train_sizes, val_mean, 'o-', label='Validation Score')
    plt.xlabel('Training Set Size')
    plt.ylabel('Accuracy')
    plt.title(title)
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.show()

# Compare a simple vs complex model
from sklearn.tree import DecisionTreeClassifier

plot_learning_curve(
    DecisionTreeClassifier(max_depth=2),
    X_train_scaled, y_train,
    "Underfitting (max_depth=2)"
)

plot_learning_curve(
    DecisionTreeClassifier(max_depth=None),
    X_train_scaled, y_train,
    "Overfitting (no depth limit)"
)

plot_learning_curve(
    RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42),
    X_train_scaled, y_train,
    "Good Fit (Random Forest)"
)
```

```
  HOW TO READ LEARNING CURVES:
  ┌────────────────────────────────────────────────────────────────┐
  │                                                                │
  │  OVERFITTING:            UNDERFITTING:        GOOD FIT:        │
  │                                                                │
  │  Train ──────── high     Train ──────── low   Train ─── high   │
  │                          Val   ──────── low   Val   ─── high   │
  │  Val   ──────── low                           (close together) │
  │  (big gap)               (both low)                            │
  │                                                                │
  │  FIX: more data,         FIX: more complex    You're done!     │
  │  regularize, simpler     model, more features Just optimize    │
  │  model, dropout          less regularization  hyperparams.     │
  │                                                                │
  │  If train AND val both increase with more data -> get more data│
  │  If val plateaus even with more data -> need a better model    │
  └────────────────────────────────────────────────────────────────┘
```

---

## 8.4 Handling Class Imbalance

```
  PROBLEM: Dataset has 95% class A, 5% class B.
  A model that ALWAYS predicts class A gets 95% accuracy!
  But it catches ZERO of the important class B cases.

  This is extremely common in:
  - Fraud detection (0.1% fraud)
  - Medical diagnosis (rare diseases)
  - Spam detection (mostly ham)
  - Anomaly detection (mostly normal)
```

```python
# ─── METHOD 1: class_weight='balanced' (simplest, try this first) ───
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators=100,
    class_weight='balanced',  # automatically up-weights minority class
    random_state=42
)
model.fit(X_train, y_train)

# ─── METHOD 2: SMOTE — Generate synthetic minority samples ───
# pip install imbalanced-learn
from imblearn.over_sampling import SMOTE

smote = SMOTE(random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
print(f"Before SMOTE: {pd.Series(y_train).value_counts().to_dict()}")
print(f"After SMOTE:  {pd.Series(y_train_resampled).value_counts().to_dict()}")
# SMOTE creates synthetic examples of the minority class
# so both classes have equal representation

model.fit(X_train_resampled, y_train_resampled)

# ─── METHOD 3: Adjust decision threshold ───
y_prob = model.predict_proba(X_test)[:, 1]
# Default threshold = 0.5
# Lower threshold to catch more positives (higher recall, lower precision)
threshold = 0.3
y_pred_adjusted = (y_prob >= threshold).astype(int)
```

```
  WHICH METHOD TO USE:
  ┌────────────────────────────────────────────────────────────────┐
  │  Method             │ When to Use                               │
  ├─────────────────────┼───────────────────────────────────────────┤
  │  class_weight=      │ ALWAYS try this first. Zero extra code.  │
  │  'balanced'         │ Works with most sklearn classifiers.     │
  ├─────────────────────┼───────────────────────────────────────────┤
  │  SMOTE              │ When you need more training data for the │
  │                     │ minority class. Use ONLY on training set! │
  ├─────────────────────┼───────────────────────────────────────────┤
  │  Threshold tuning   │ When you want to trade precision for     │
  │                     │ recall (or vice versa) after training.   │
  ├─────────────────────┼───────────────────────────────────────────┤
  │  Undersample        │ When you have tons of majority class data│
  │  majority class     │ and can afford to throw some away.       │
  └─────────────────────┴───────────────────────────────────────────┘

  CRITICAL: NEVER apply SMOTE to the test set! Only to training data.
  Test set must reflect real-world class distribution.
```

---

# PART 9: HYPERPARAMETER TUNING

---

## 9.1 Grid Search vs Random Search

```python
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier

# ─── GRID SEARCH: Try EVERY combination (exhaustive) ───
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [3, 5, 10, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 5],
}
# Total combinations: 3 x 4 x 3 x 3 = 108

grid_search = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    cv=5,                  # 5-fold cross-validation
    scoring='accuracy',
    n_jobs=-1,             # use all cores
    verbose=1
)
grid_search.fit(X_train, y_train)

print(f"Best params: {grid_search.best_params_}")
print(f"Best CV accuracy: {grid_search.best_score_:.2%}")

# Use the best model
best_model = grid_search.best_estimator_
y_pred = best_model.predict(X_test)

# ─── RANDOM SEARCH: Sample random combinations (faster) ───
from scipy.stats import randint, uniform

param_distributions = {
    'n_estimators': randint(50, 300),
    'max_depth': randint(3, 20),
    'min_samples_split': randint(2, 20),
    'min_samples_leaf': randint(1, 10),
}

random_search = RandomizedSearchCV(
    RandomForestClassifier(random_state=42),
    param_distributions,
    n_iter=50,             # try 50 random combinations
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    random_state=42
)
random_search.fit(X_train, y_train)
print(f"Best params: {random_search.best_params_}")
print(f"Best CV accuracy: {random_search.best_score_:.2%}")
```

```
  GRID SEARCH vs RANDOM SEARCH:
  ┌──────────────────────┬──────────────────────────────────────┐
  │ Grid Search          │ Random Search                         │
  ├──────────────────────┼──────────────────────────────────────┤
  │ Tries ALL combos     │ Tries N random combos                 │
  │ Guaranteed to find   │ Might miss the best, but usually     │
  │ best in the grid     │ finds near-optimal much faster        │
  │ Slow: 3^4=81 combos  │ Fast: 50 random combos               │
  │ Use for: few params  │ Use for: many params, large ranges    │
  └──────────────────────┴──────────────────────────────────────┘
  
  RULE OF THUMB: Start with Random Search (n_iter=50-100).
  Then narrow the range and do Grid Search in the promising zone.
```

---

# PART 10: FEATURE ENGINEERING

---

## 10.1 Practical Feature Engineering Techniques

All examples below use real datasets you can run immediately.

```python
import pandas as pd
import numpy as np
import seaborn as sns

# Using the Titanic dataset for feature engineering examples
df = sns.load_dataset("titanic")

# ─── 1. CREATE INTERACTION FEATURES ───
# Combine existing features into new meaningful ones
df['family_size'] = df['sibsp'] + df['parch'] + 1
df['is_alone'] = (df['family_size'] == 1).astype(int)
df['fare_per_person'] = df['fare'] / df['family_size']

# ─── 2. BINNING / DISCRETIZATION ───
# Turn continuous variables into categories
df['age'] = df['age'].fillna(df['age'].median())
df['age_group'] = pd.cut(df['age'],
    bins=[0, 12, 18, 35, 50, 100],
    labels=['child', 'teen', 'young_adult', 'middle_aged', 'senior'])

df['fare_bin'] = pd.qcut(df['fare'], q=4, labels=['low', 'medium', 'high', 'premium'])

# ─── 3. LOG TRANSFORM (for skewed distributions) ───
# Fare is right-skewed (many cheap tickets, few expensive ones)
df['log_fare'] = np.log1p(df['fare'])  # log(1+x) handles zeros safely
print(f"Fare skewness: {df['fare'].skew():.2f} -> Log fare: {df['log_fare'].skew():.2f}")

# ─── 4. POLYNOMIAL FEATURES ───
from sklearn.preprocessing import PolynomialFeatures
X_sample = df[['age', 'fare']].dropna().values
poly = PolynomialFeatures(degree=2, interaction_only=False, include_bias=False)
X_poly = poly.fit_transform(X_sample)
print(f"Original: {X_sample.shape[1]} features -> Polynomial: {X_poly.shape[1]} features")
# Creates: age, fare, age^2, fare^2, age*fare

# ─── 5. BOOLEAN / INDICATOR FEATURES ───
df['is_child'] = (df['age'] < 12).astype(int)
df['has_cabin'] = df['deck'].notna().astype(int)
df['is_female'] = (df['sex'] == 'female').astype(int)
df['is_first_class'] = (df['pclass'] == 1).astype(int)

# ─── 6. AGGREGATION FEATURES ───
# "How does this passenger compare to their group?"
df['avg_fare_by_class'] = df.groupby('pclass')['fare'].transform('mean')
df['fare_vs_class_avg'] = df['fare'] - df['avg_fare_by_class']
# Positive = paid more than class average, Negative = paid less
```

### Datetime Feature Engineering (common pattern)

```python
# When you have date/time columns, extract useful parts
# Example with a sample date column:
dates = pd.to_datetime(['2024-01-15', '2024-06-22', '2024-12-25', '2024-07-04'])
date_df = pd.DataFrame({'date': dates})

date_df['year'] = date_df['date'].dt.year
date_df['month'] = date_df['date'].dt.month
date_df['day_of_week'] = date_df['date'].dt.dayofweek  # 0=Monday
date_df['is_weekend'] = date_df['day_of_week'].isin([5, 6]).astype(int)
date_df['quarter'] = date_df['date'].dt.quarter
date_df['day_of_year'] = date_df['date'].dt.dayofyear
print(date_df)
```

### Feature Selection -- Remove Useless Features

```python
from sklearn.feature_selection import SelectKBest, f_classif

# Select top K features by statistical test
selector = SelectKBest(score_func=f_classif, k=5)
X_selected = selector.fit_transform(X_train, y_train)

# See which features were selected
selected_mask = selector.get_support()
selected_features = X_train.columns[selected_mask].tolist()
print(f"Selected features: {selected_features}")

# Alternatively: remove low-variance features
from sklearn.feature_selection import VarianceThreshold
selector = VarianceThreshold(threshold=0.01)  # remove near-constant features
X_filtered = selector.fit_transform(X_train)
print(f"Before: {X_train.shape[1]} features -> After: {X_filtered.shape[1]} features")
```

---

# PART 11: ML PIPELINES (PRODUCTION-READY CODE)

---

## 11.1 Why Pipelines Matter

```
  WITHOUT PIPELINE:                   WITH PIPELINE:
  ──────────────────                  ─────────────────
  scaler.fit(X_train)                pipe.fit(X_train, y_train)
  X_train = scaler.transform(X_train) y_pred = pipe.predict(X_test)
  imputer.fit(X_train)
  X_train = imputer.transform(X_train) # ONE object. No data leakage.
  model.fit(X_train, y_train)          # Easy to save, deploy, reproduce.
  X_test = scaler.transform(X_test)
  X_test = imputer.transform(X_test)
  y_pred = model.predict(X_test)
  # Error-prone, data leakage risk!
```

## 11.2 Building a Complete Pipeline

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

# ─── DEFINE COLUMN TYPES ───
numeric_features = ['age', 'fare', 'sibsp', 'parch']
categorical_features = ['sex', 'embarked', 'pclass']

# ─── BUILD PREPROCESSING PIPELINES ───
numeric_pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler()),
])

categorical_pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(handle_unknown='ignore')),
])

# ─── COMBINE INTO COLUMN TRANSFORMER ───
preprocessor = ColumnTransformer([
    ('numeric', numeric_pipeline, numeric_features),
    ('categorical', categorical_pipeline, categorical_features),
])

# ─── BUILD FULL PIPELINE (preprocessing + model) ───
full_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42)),
])

# ─── USE IT (one line!) ───
full_pipeline.fit(X_train, y_train)
y_pred = full_pipeline.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Pipeline Accuracy: {accuracy:.2%}")

# ─── CROSS-VALIDATE THE ENTIRE PIPELINE ───
scores = cross_val_score(full_pipeline, X_train, y_train, cv=5, scoring='accuracy')
print(f"CV Accuracy: {scores.mean():.2%} (+/- {scores.std():.2%})")

# ─── SAVE THE PIPELINE (for deployment) ───
import joblib
joblib.dump(full_pipeline, 'model_pipeline.pkl')

# ─── LOAD AND USE LATER ───
loaded_pipeline = joblib.load('model_pipeline.pkl')
predictions = loaded_pipeline.predict(new_data)
```

---

# PART 12: NEURAL NETWORKS (INTRO TO DEEP LEARNING)

---

## 12.1 Your First Neural Network with PyTorch

```python
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# ─── PREPARE DATA ───
iris = load_iris()
X, y = iris.data, iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Convert to PyTorch tensors
X_train_t = torch.FloatTensor(X_train)
y_train_t = torch.LongTensor(y_train)
X_test_t = torch.FloatTensor(X_test)
y_test_t = torch.LongTensor(y_test)

# ─── DEFINE THE MODEL ───
class IrisNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer1 = nn.Linear(4, 16)    # 4 inputs -> 16 hidden neurons
        self.relu1 = nn.ReLU()
        self.layer2 = nn.Linear(16, 8)    # 16 -> 8 hidden neurons
        self.relu2 = nn.ReLU()
        self.output = nn.Linear(8, 3)     # 8 -> 3 classes

    def forward(self, x):
        x = self.relu1(self.layer1(x))
        x = self.relu2(self.layer2(x))
        x = self.output(x)
        return x

model = IrisNet()

# ─── DEFINE LOSS AND OPTIMIZER ───
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.01)

# ─── TRAINING LOOP ───
epochs = 100
for epoch in range(epochs):
    # Forward pass
    outputs = model(X_train_t)
    loss = criterion(outputs, y_train_t)

    # Backward pass
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 20 == 0:
        print(f"Epoch {epoch+1}/{epochs}, Loss: {loss.item():.4f}")

# ─── EVALUATE ───
model.eval()
with torch.no_grad():
    outputs = model(X_test_t)
    _, predicted = torch.max(outputs, 1)
    accuracy = (predicted == y_test_t).sum().item() / len(y_test_t)
    print(f"\nTest Accuracy: {accuracy:.2%}")
```

---

## 12.2 Your First Neural Network with Keras/TensorFlow (simpler)

```python
# pip install tensorflow
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# ─── PREPARE DATA ───
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42
)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# ─── DEFINE MODEL (Sequential API — easiest) ───
model = keras.Sequential([
    layers.Dense(16, activation='relu', input_shape=(4,)),  # 4 inputs -> 16 hidden
    layers.Dense(8, activation='relu'),                      # 16 -> 8 hidden
    layers.Dense(3, activation='softmax'),                   # 8 -> 3 classes
])

# ─── COMPILE ───
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',  # for integer labels (0,1,2)
    metrics=['accuracy']
)

model.summary()  # print architecture

# ─── TRAIN ───
history = model.fit(
    X_train, y_train,
    epochs=50,
    batch_size=16,
    validation_split=0.2,  # use 20% of training data for validation
    verbose=1
)

# ─── EVALUATE ───
test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"\nTest Accuracy: {test_acc:.2%}")

# ─── PLOT TRAINING HISTORY ───
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Val Loss')
plt.title('Loss Over Epochs')
plt.xlabel('Epoch')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['accuracy'], label='Train Acc')
plt.plot(history.history['val_accuracy'], label='Val Acc')
plt.title('Accuracy Over Epochs')
plt.xlabel('Epoch')
plt.legend()

plt.tight_layout()
plt.show()

# If val_loss starts going UP while train_loss goes down = OVERFITTING
# Solution: add Dropout layers or early stopping
```

```
  PYTORCH vs KERAS — WHEN TO USE WHICH:
  ┌──────────────────────┬──────────────────────────────────────┐
  │ Keras (TensorFlow)   │ PyTorch                               │
  ├──────────────────────┼──────────────────────────────────────┤
  │ Simpler, less code   │ More flexible, more control           │
  │ Better for beginners │ Better for research & custom models   │
  │ Strong deployment    │ Dominant in academia & research papers │
  │ (TF Serving, TFLite) │ Growing in production (TorchServe)    │
  │ Higher-level API     │ Lower-level, explicit training loop   │
  │ Faster prototyping   │ Easier debugging (Python-native)      │
  └──────────────────────┴──────────────────────────────────────┘
  
  START with Keras for learning. Move to PyTorch when you need
  custom training loops, research architectures, or more control.
```

---

# PART 13: END-TO-END PROJECTS

---

```python
# ══════════════════════════════════════════════════════════════
#  COMPLETE PROJECT: Predict Titanic Survival
#  This is the code you'd submit to Kaggle
# ══════════════════════════════════════════════════════════════

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report
import warnings
warnings.filterwarnings('ignore')

# ═══ 1. LOAD DATA ═══
df = sns.load_dataset("titanic")
print(f"Shape: {df.shape}")
print(f"\nMissing values:\n{df.isnull().sum()}")

# ═══ 2. FEATURE ENGINEERING ═══
# Extract title from name
df['title'] = df['who']  # 'man', 'woman', 'child'

# Family size
df['family_size'] = df['sibsp'] + df['parch'] + 1
df['is_alone'] = (df['family_size'] == 1).astype(int)

# Age groups
df['age'] = df['age'].fillna(df['age'].median())
df['age_group'] = pd.cut(df['age'], bins=[0, 12, 18, 35, 50, 100],
                          labels=['child', 'teen', 'young', 'middle', 'senior'])

# Fare per person
df['fare'] = df['fare'].fillna(df['fare'].median())
df['fare_per_person'] = df['fare'] / df['family_size']

# ═══ 3. SELECT AND ENCODE FEATURES ═══
features = ['pclass', 'sex', 'age', 'sibsp', 'parch', 'fare',
            'family_size', 'is_alone', 'fare_per_person']

df_model = df[features + ['survived']].copy()

# Encode sex
df_model['sex'] = LabelEncoder().fit_transform(df_model['sex'])

# Handle remaining missing
df_model = df_model.dropna()

X = df_model.drop('survived', axis=1)
y = df_model['survived']

# ═══ 4. SPLIT ═══
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ═══ 5. TRAIN MULTIPLE MODELS ═══
models = {
    'Random Forest': RandomForestClassifier(n_estimators=200, max_depth=6, random_state=42),
    'Gradient Boosting': GradientBoostingClassifier(n_estimators=150, max_depth=4, random_state=42),
}

for name, model in models.items():
    scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
    print(f"{name}: CV={scores.mean():.2%} (+/- {scores.std():.2%})")

# ═══ 6. TRAIN BEST MODEL AND EVALUATE ON TEST SET ═══
best_model = GradientBoostingClassifier(n_estimators=150, max_depth=4, random_state=42)
best_model.fit(X_train, y_train)
y_pred = best_model.predict(X_test)

print(f"\nTest Accuracy: {accuracy_score(y_test, y_pred):.2%}")
print(classification_report(y_test, y_pred))

# ═══ 7. FEATURE IMPORTANCE ═══
importance = pd.Series(best_model.feature_importances_, index=X.columns)
importance.sort_values(ascending=True).plot.barh(figsize=(8, 5))
plt.title('Feature Importance — What Predicts Survival?')
plt.xlabel('Importance')
plt.tight_layout()
plt.show()
```

---

## 13.2 End-to-End Regression -- California House Prices

```python
# ══════════════════════════════════════════════════════════════
#  COMPLETE REGRESSION PROJECT: Predict California House Prices
# ══════════════════════════════════════════════════════════════

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# ═══ 1. LOAD DATA ═══
housing = fetch_california_housing()
df = pd.DataFrame(housing.data, columns=housing.feature_names)
df['Price'] = housing.target
print(f"Shape: {df.shape}")
print(df.describe())

# ═══ 2. EDA ═══
# Check target distribution
plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
df['Price'].hist(bins=50)
plt.title('House Price Distribution')
plt.subplot(1, 2, 2)
sns.heatmap(df.corr()[['Price']].sort_values(by='Price', ascending=False),
            annot=True, cmap='coolwarm')
plt.title('Correlation with Price')
plt.tight_layout()
plt.show()

# ═══ 3. PREPARE ═══
X = df.drop('Price', axis=1)
y = df['Price']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ═══ 4. TRAIN & COMPARE MODELS ═══
models = {
    'Linear Regression': LinearRegression(),
    'Ridge (L2)':        Ridge(alpha=1.0),
    'Random Forest':     RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42),
    'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42),
}

print(f"{'Model':<25} {'CV MAE':>10} {'CV R2':>10}")
print("-" * 48)
for name, model in models.items():
    mae_scores = -cross_val_score(model, X_train_scaled, y_train, cv=5,
                                   scoring='neg_mean_absolute_error')
    r2_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='r2')
    print(f"{name:<25} {mae_scores.mean():>9.4f} {r2_scores.mean():>9.4f}")

# ═══ 5. FINAL EVALUATION ═══
best_model = GradientBoostingRegressor(n_estimators=200, max_depth=5, random_state=42)
best_model.fit(X_train_scaled, y_train)
y_pred = best_model.predict(X_test_scaled)

print(f"\nFinal Test Results:")
print(f"  MAE:  ${mean_absolute_error(y_test, y_pred)*100000:.0f}")
print(f"  RMSE: ${np.sqrt(mean_squared_error(y_test, y_pred))*100000:.0f}")
print(f"  R2:   {r2_score(y_test, y_pred):.4f}")

# ═══ 6. ACTUAL VS PREDICTED PLOT ═══
plt.figure(figsize=(8, 6))
plt.scatter(y_test, y_pred, alpha=0.3, s=10)
plt.plot([0, 5], [0, 5], 'r--', label='Perfect Prediction')
plt.xlabel('Actual Price (x$100K)')
plt.ylabel('Predicted Price (x$100K)')
plt.title('Actual vs Predicted House Prices')
plt.legend()
plt.show()
```

---

# PART 14: COMMON ERRORS & DEBUGGING GUIDE

---

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ERROR / PROBLEM           │ CAUSE                │ FIX                  │
├────────────────────────────┼──────────────────────┼──────────────────────┤
│ Train acc: 99%             │ Overfitting          │ More data, regularize│
│ Test acc: 60%              │                      │ simpler model, dropout│
├────────────────────────────┼──────────────────────┼──────────────────────┤
│ Train acc: 55%             │ Underfitting          │ More features, more  │
│ Test acc: 53%              │                      │ complex model, less  │
│                            │                      │ regularization       │
├────────────────────────────┼──────────────────────┼──────────────────────┤
│ Model takes forever        │ Too much data or     │ Subsample data, use  │
│ to train                   │ complex model        │ LightGBM, reduce     │
│                            │                      │ features, use GPU    │
├────────────────────────────┼──────────────────────┼──────────────────────┤
│ "Could not convert         │ Categorical data     │ Encode strings to    │
│  string to float"          │ not encoded          │ numbers first        │
├────────────────────────────┼──────────────────────┼──────────────────────┤
│ Very high accuracy on      │ Data leakage!        │ Check: is a feature  │
│ test set (suspicious)      │                      │ derived from target? │
│                            │                      │ Did you scale before │
│                            │                      │ splitting?           │
├────────────────────────────┼──────────────────────┼──────────────────────┤
│ Model always predicts      │ Class imbalance      │ Use class_weight=    │
│ the majority class         │                      │ 'balanced', SMOTE,   │
│                            │                      │ or threshold tuning  │
├────────────────────────────┼──────────────────────┼──────────────────────┤
│ NaN in predictions         │ NaN in input data    │ Check for missing    │
│                            │                      │ values, impute first │
├────────────────────────────┼──────────────────────┼──────────────────────┤
│ Feature importance shows   │ Correlated features  │ Remove highly        │
│ unexpected results         │ or high cardinality  │ correlated features, │
│                            │                      │ use permutation imp. │
├────────────────────────────┼──────────────────────┼──────────────────────┤
│ Validation score varies    │ Small dataset or     │ Use K-fold CV (5-10) │
│ wildly between runs        │ unstable split       │ instead of single    │
│                            │                      │ train/test split     │
└────────────────────────────┴──────────────────────┴──────────────────────┘
```

---

# PART 15: WHAT TO USE WHEN — ALGORITHM CHEAT SHEET

---

```
  ┌───────────────────────────────────────────────────────────────────────┐
  │  ALGORITHM SELECTION FLOWCHART                                        │
  │                                                                       │
  │  What's your task?                                                    │
  │       │                                                               │
  │       ├── CLASSIFICATION (predict a category)                         │
  │       │    │                                                          │
  │       │    ├── Need a baseline?                                       │
  │       │    │   → Logistic Regression                                  │
  │       │    │                                                          │
  │       │    ├── Tabular data, want best accuracy?                      │
  │       │    │   → XGBoost or LightGBM                                  │
  │       │    │                                                          │
  │       │    ├── Need interpretability?                                  │
  │       │    │   → Decision Tree or Logistic Regression                 │
  │       │    │                                                          │
  │       │    ├── Text data?                                             │
  │       │    │   → Naive Bayes (simple) or Transformer (advanced)       │
  │       │    │                                                          │
  │       │    ├── Image data?                                            │
  │       │    │   → CNN (Convolutional Neural Network)                   │
  │       │    │                                                          │
  │       │    └── Small dataset, no tuning time?                         │
  │       │        → Random Forest                                        │
  │       │                                                               │
  │       ├── REGRESSION (predict a number)                               │
  │       │    │                                                          │
  │       │    ├── Need a baseline?                                       │
  │       │    │   → Linear Regression                                    │
  │       │    │                                                          │
  │       │    ├── Tabular data, want best accuracy?                      │
  │       │    │   → XGBoost or LightGBM                                  │
  │       │    │                                                          │
  │       │    ├── Suspect only some features matter?                     │
  │       │    │   → Lasso (L1) or Elastic Net                            │
  │       │    │                                                          │
  │       │    └── Non-linear relationship?                               │
  │       │        → Random Forest or Neural Network                      │
  │       │                                                               │
  │       └── CLUSTERING (find groups, no labels)                         │
  │            │                                                          │
  │            ├── Know number of groups?                                  │
  │            │   → K-Means                                              │
  │            │                                                          │
  │            ├── Don't know number of groups?                            │
  │            │   → DBSCAN or Hierarchical Clustering                    │
  │            │                                                          │
  │            └── Need soft (probabilistic) assignments?                  │
  │                → Gaussian Mixture Model (GMM)                         │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
```

### Quick Reference Table

```
  ┌────────────────────┬──────────┬───────────┬───────────┬──────────────┐
  │ Algorithm          │ Speed    │ Accuracy  │ Interp.   │ Scaling?     │
  ├────────────────────┼──────────┼───────────┼───────────┼──────────────┤
  │ Linear/Logistic Reg│ Fast     │ Low-Med   │ High      │ YES          │
  │ Decision Tree      │ Fast     │ Medium    │ Very High │ No           │
  │ Random Forest      │ Medium   │ High      │ Medium    │ No           │
  │ XGBoost/LightGBM   │ Med-Fast │ Very High │ Low       │ No           │
  │ SVM                │ Slow     │ High      │ Low       │ YES          │
  │ KNN                │ Pred:Slow│ Medium    │ Medium    │ YES          │
  │ Naive Bayes        │ Very Fast│ Low-Med   │ Medium    │ Depends      │
  │ Neural Network     │ Slow     │ Very High │ Very Low  │ YES          │
  └────────────────────┴──────────┴───────────┴───────────┴──────────────┘
```

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

1. Load CSV (pd.read_csv) -> EDA (shape, dtypes, missing values, distributions) -> Preprocess (impute missing, encode categoricals, scale numerics) -> Split (train_test_split with stratify) -> Train baseline (LogisticRegression) -> Evaluate (accuracy, F1, confusion matrix) -> Try better models (RandomForest, XGBoost) -> Tune hyperparameters (RandomizedSearchCV) -> Final evaluation on test set.

2. Overfitting. Try: (a) Reduce max_depth / increase min_samples_leaf, (b) Use fewer features (feature selection), (c) Get more training data, (d) Add regularization, (e) Use cross-validation to tune hyperparameters instead of fitting to one split.

3. StandardScaler (mean=0, std=1): when data has outliers or is approximately normal. MinMaxScaler (0-1): when you need bounded values, for neural networks, KNN. Don't need scaling: Decision Trees, Random Forest, XGBoost, LightGBM, Naive Bayes (tree-based models split on thresholds, not distances).

4. 500 cities = 500 new columns. This massively increases dimensionality, slows training, and can cause overfitting (sparse features). Alternatives: Target Encoding (replace city with mean target value), Frequency Encoding (replace with count), Hashing (hash into fixed bins), or Embeddings (neural network).

5. See the "Algorithm Comparison Template" code in Part 6.9 — it does exactly this with cross_val_score and a bar chart.

6. Speed-ups: (a) Use LightGBM instead of RandomForest (much faster), (b) PCA to reduce from 200 features to ~50, (c) Feature selection (remove low-variance or uncorrelated features), (d) Subsample data for initial experiments, (e) Use n_jobs=-1 for parallel processing, (f) Use a smaller model first to find which features matter, then train the big model on only those.

</details>

---

---

# PART 16: SAVING & LOADING MODELS

---

```python
import joblib

# ─── METHOD 1: joblib (recommended for sklearn) ───
# Save
joblib.dump(model, 'my_model.pkl')
joblib.dump(scaler, 'my_scaler.pkl')

# Load
loaded_model = joblib.load('my_model.pkl')
loaded_scaler = joblib.load('my_scaler.pkl')

# Use
new_data_scaled = loaded_scaler.transform(new_data)
predictions = loaded_model.predict(new_data_scaled)

# ─── METHOD 2: Save entire pipeline (best practice) ───
# If you built a Pipeline (Part 11), save the whole thing:
joblib.dump(full_pipeline, 'production_pipeline.pkl')
# One file contains preprocessing + model. No mismatch possible.

# ─── METHOD 3: PyTorch models ───
# Save
import torch
torch.save(model.state_dict(), 'model_weights.pth')

# Load
model = IrisNet()  # must define same architecture first!
model.load_state_dict(torch.load('model_weights.pth'))
model.eval()

# ─── METHOD 4: Keras/TensorFlow models ───
# Save
model.save('my_keras_model.keras')

# Load
loaded_model = keras.models.load_model('my_keras_model.keras')
```

---

# PART 17: PROGRESSIVE PRACTICE CHALLENGES

Build these projects in order. Each one teaches new skills.

---

```
  ┌────────────────────────────────────────────────────────────────────┐
  │  LEVEL 1: BEGINNER (just follow the steps)                         │
  ├────────────────────────────────────────────────────────────────────┤
  │                                                                    │
  │  Challenge 1: Iris Classification                                  │
  │  Dataset: sklearn load_iris()                                      │
  │  Task: Classify 3 flower species                                   │
  │  Skills: Load data, split, scale, train KNN, evaluate              │
  │  Target: > 95% accuracy                                           │
  │                                                                    │
  │  Challenge 2: Penguin Species                                      │
  │  Dataset: sns.load_dataset("penguins")                             │
  │  Task: Classify penguin species from measurements                  │
  │  Skills: Handle missing values, encode sex column, compare models  │
  │  Target: > 95% accuracy                                           │
  │                                                                    │
  │  Challenge 3: Tips Regression                                      │
  │  Dataset: sns.load_dataset("tips")                                 │
  │  Task: Predict tip amount from bill, party size, time, etc.        │
  │  Skills: First regression model, MAE/RMSE evaluation               │
  │  Target: R2 > 0.4                                                 │
  │                                                                    │
  ├────────────────────────────────────────────────────────────────────┤
  │  LEVEL 2: INTERMEDIATE (think about decisions)                     │
  ├────────────────────────────────────────────────────────────────────┤
  │                                                                    │
  │  Challenge 4: Titanic Survival                                     │
  │  Dataset: sns.load_dataset("titanic")                              │
  │  Task: Predict who survives                                        │
  │  Skills: Feature engineering (family_size, is_alone), handle       │
  │  missing values, compare 5+ algorithms, tune hyperparameters       │
  │  Target: > 80% accuracy                                           │
  │                                                                    │
  │  Challenge 5: California House Prices                               │
  │  Dataset: sklearn fetch_california_housing()                       │
  │  Task: Predict median house value                                  │
  │  Skills: Regression, feature importance, learning curves,          │
  │  Ridge/Lasso comparison, pipeline                                  │
  │  Target: R2 > 0.8                                                 │
  │                                                                    │
  │  Challenge 6: Wine Quality                                         │
  │  Dataset: sklearn load_wine()                                      │
  │  Task: Classify wine type from chemical properties                 │
  │  Skills: Multi-class, PCA for visualization, model comparison,    │
  │  cross-validation, confusion matrix analysis                       │
  │  Target: > 95% accuracy with the right algorithm                  │
  │                                                                    │
  ├────────────────────────────────────────────────────────────────────┤
  │  LEVEL 3: ADVANCED (real-world complexity)                         │
  ├────────────────────────────────────────────────────────────────────┤
  │                                                                    │
  │  Challenge 7: Credit Card Fraud Detection                          │
  │  Dataset: Kaggle "Credit Card Fraud Detection"                     │
  │  Task: Detect fraudulent transactions                              │
  │  Skills: Extreme class imbalance (0.17% fraud!), SMOTE,           │
  │  class_weight, precision-recall tradeoff, AUC-ROC, threshold      │
  │  tuning. Accuracy is USELESS here — use F1 and recall.            │
  │  Target: F1 > 0.75 on fraud class                                 │
  │                                                                    │
  │  Challenge 8: MNIST Digit Recognition                              │
  │  Dataset: sklearn load_digits() or Keras MNIST                    │
  │  Task: Classify handwritten digits (0-9) from images              │
  │  Skills: Image data, neural networks, CNN if using full MNIST,    │
  │  confusion matrix to see which digits get confused                │
  │  Target: > 97% accuracy                                           │
  │                                                                    │
  │  Challenge 9: Customer Segmentation (Unsupervised)                 │
  │  Dataset: Kaggle "Mall Customer Segmentation Data"                │
  │  Task: Find natural customer groups for marketing                 │
  │  Skills: K-Means, DBSCAN, Silhouette Score, PCA visualization,   │
  │  interpreting clusters for business meaning                       │
  │  Target: Silhouette > 0.5, 3-5 meaningful segments               │
  │                                                                    │
  │  Challenge 10: Full Pipeline + Deployment                          │
  │  Dataset: Any of the above                                         │
  │  Task: Build a complete sklearn Pipeline with ColumnTransformer,  │
  │  tune with RandomizedSearchCV, save with joblib, load and         │
  │  predict on new data. Write a function that takes raw input       │
  │  and returns a prediction.                                        │
  │  Skills: Everything combined. Production-ready code.              │
  │                                                                    │
  └────────────────────────────────────────────────────────────────────┘

  HOW TO USE THESE CHALLENGES:
  ──────────────────────────────────────────────────────
  1. Try each challenge WITHOUT looking at solutions first
  2. Get stuck? Re-read the relevant Part of this guide
  3. Compare your approach to the end-to-end projects (Part 13)
  4. After completing a challenge, ask: "What would I do differently?"
  5. Keep a notebook of patterns: "When I see X, I do Y"
```

---

# PART 18: FROM NOTEBOOK TO PRODUCTION (MLOps)

---

MLOps is the discipline of moving trained models into reliable, monitored production systems. A notebook prototype that achieves 92% accuracy is worthless if nobody can call it, it returns garbage after a data shift, or it silently degrades over six months. This section covers the full deployment loop: serving, registries, CI/CD, experiment tracking, drift detection, and safe rollout.

---

## 18.1 The Production ML Loop

```
  ┌──────────────────────────────────────────────────────────────────────┐
  │                   PRODUCTION ML DEPLOYMENT LOOP                      │
  │                                                                      │
  │  Data         Experiment     Model         Serving      Monitoring   │
  │  Pipeline     Tracking       Registry      Layer        & Alerting   │
  │     │              │             │             │              │      │
  │  raw data    log runs &    version &       REST API /    drift +     │
  │  feature     metrics to    tag models      batch job     perf        │
  │  store       MLflow/W&B    (stage: dev     FastAPI /     metrics     │
  │                            / staging /     Vertex AI                 │
  │                            production)                               │
  │     │              │             │             │              │      │
  │     └──────────────┴─────────────┴──────┬──────┘              │      │
  │                                         │                     │      │
  │                      CI/CD Pipeline     │    retraining       │      │
  │                      (test + validate   │◄────trigger ────────┘      │
  │                       + deploy)         │                            │
  └─────────────────────────────────────────┴────────────────────────────┘
```

---

## 18.2 Model Serving — Online vs Batch

**Online (real-time) serving** answers one request at a time with a latency SLO (e.g., < 100 ms). Use it when the downstream consumer is a user or live system.

**Batch serving** scores large datasets offline on a schedule. Use it when you can tolerate hours of latency and want to amortize infrastructure cost.

```
  ONLINE SERVING                       BATCH SERVING
  ─────────────────────────────        ────────────────────────────────
  Request → API endpoint → model       Trigger (cron / event)
             ↓                         → load data from storage
          Response in milliseconds     → run model on entire dataset
                                       → write predictions back to storage

  Use when:                            Use when:
  - user-facing (search rank,          - nightly churn scores
    fraud check, recommendation)       - weekly risk scoring
  - SLA on latency                     - pre-computing embeddings
  - single or small batch of rows      - large-scale re-scoring

  Examples:                            Examples:
  - FastAPI / Flask endpoint           - Spark / pandas batch job
  - Vertex AI Prediction endpoint      - Vertex AI Batch Prediction
  - TorchServe / BentoML               - Dataflow / BigQuery ML
```

---

## 18.3 FastAPI Serving Endpoint

A minimal but production-viable endpoint. Input validation with Pydantic prevents malformed data from ever reaching the model.

```python
# serve.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator
import joblib
import numpy as np
import logging

app = FastAPI(title="ML Model API", version="1.0")
logger = logging.getLogger(__name__)

# Load artifact once at startup — never inside a request handler
pipeline = joblib.load("production_pipeline.pkl")
MODEL_VERSION = "v1.2.3"

# ── Input schema with validation ──────────────────────────────────────
class PredictRequest(BaseModel):
    age: float = Field(..., ge=0, le=120, description="Passenger age in years")
    fare: float = Field(..., ge=0, description="Ticket fare (non-negative)")
    pclass: int = Field(..., ge=1, le=3, description="Passenger class 1/2/3")
    sex: str = Field(..., pattern="^(male|female)$")

    @validator("fare")
    def fare_not_nan(cls, v):
        if np.isnan(v):
            raise ValueError("fare must not be NaN")
        return v

class PredictResponse(BaseModel):
    prediction: int
    probability: float
    model_version: str

# ── Health check (required by load balancers) ─────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "model_version": MODEL_VERSION}

# ── Prediction endpoint ───────────────────────────────────────────────
@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    import pandas as pd
    try:
        row = pd.DataFrame([req.dict()])
        pred = int(pipeline.predict(row)[0])
        prob = float(pipeline.predict_proba(row)[0][pred])
        logger.info("prediction", extra={"pred": pred, "prob": prob,
                                          "input": req.dict()})
        return PredictResponse(prediction=pred, probability=prob,
                                model_version=MODEL_VERSION)
    except Exception as e:
        logger.error("prediction_error", exc_info=True)
        raise HTTPException(status_code=500, detail="Prediction failed")

# Run: uvicorn serve:app --host 0.0.0.0 --port 8080
```

Key practices above:
- Schema validation with Pydantic rejects bad input before it reaches the model.
- Model loaded once at startup; per-request I/O is negligible.
- Structured logging enables downstream drift monitoring.
- `/health` endpoint required by Kubernetes liveness probes and load balancers.

---

## 18.4 Experiment Tracking

Experiment tracking records every training run: hyperparameters, metrics, data versions, and artifacts. Without it you cannot reproduce results or explain which model you deployed.

### MLflow (open source, self-hosted)

```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score

mlflow.set_experiment("titanic-survival")

with mlflow.start_run(run_name="rf-depth6"):
    # Log hyperparameters
    params = {"n_estimators": 200, "max_depth": 6, "random_state": 42}
    mlflow.log_params(params)

    model = RandomForestClassifier(**params)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    # Log metrics
    f1 = f1_score(y_test, y_pred)
    mlflow.log_metrics({"f1": f1, "accuracy": (y_pred == y_test).mean()})

    # Log model artifact + sklearn signature
    signature = mlflow.models.infer_signature(X_train, model.predict(X_train))
    mlflow.sklearn.log_model(model, "model", signature=signature,
                              registered_model_name="TitanicSurvivor")
    print(f"Run logged. F1={f1:.4f}")
```

### Weights & Biases (hosted, strong visualization)

```python
import wandb

wandb.init(project="titanic-survival", config={"n_estimators": 200, "max_depth": 6})
config = wandb.config

model = RandomForestClassifier(n_estimators=config.n_estimators,
                                max_depth=config.max_depth)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
wandb.log({"f1": f1_score(y_test, y_pred),
            "accuracy": (y_pred == y_test).mean()})
wandb.finish()
```

### Vertex AI Experiments (GCP-native)

```python
from google.cloud import aiplatform

aiplatform.init(project="my-gcp-project", location="us-central1",
                experiment="titanic-survival")

with aiplatform.start_run("rf-depth6"):
    aiplatform.log_params({"n_estimators": 200, "max_depth": 6})
    aiplatform.log_metrics({"f1": 0.83, "accuracy": 0.81})
```

---

## 18.5 Model Registry & Versioning

A model registry is the system of record for trained models. It stores artifacts, links them to the experiment run that produced them, and tracks lifecycle stage (staging → production → archived).

```
  MODEL LIFECYCLE IN A REGISTRY:
  ┌──────────────────────────────────────────────────────────┐
  │  Training run  →  Registered  →  Staging  →  Production  │
  │  (experiment       (artifact      (human       (serving   │
  │   tracked)          stored,        review,      traffic)  │
  │                     tagged)        tests)                  │
  │                                       ↓                    │
  │                                   Archived                 │
  │                             (superseded but kept           │
  │                              for rollback)                 │
  └──────────────────────────────────────────────────────────┘
```

```python
# Promote a model from Staging to Production in MLflow
import mlflow
from mlflow.tracking import MlflowClient

client = MlflowClient()
model_name = "TitanicSurvivor"

# List all versions in Staging
for mv in client.search_model_versions(f"name='{model_name}'"):
    if mv.current_stage == "Staging":
        print(f"Version {mv.version}: {mv.run_id}")

# Promote version 3 to Production, archive the old one
client.transition_model_version_stage(
    name=model_name, version=3, stage="Production",
    archive_existing_versions=True
)

# Load the current production model
model_uri = f"models:/{model_name}/Production"
prod_model = mlflow.sklearn.load_model(model_uri)
```

---

## 18.6 CI/CD for ML

A CI/CD pipeline for ML runs automated tests on every commit that touches model code or training data. It gates deployments behind validation checks, preventing regressions from reaching production silently.

```
  ML CI/CD PIPELINE (GitHub Actions / Vertex Pipelines / Kubeflow):

  Code push / PR
       │
       ▼
  ┌──────────────┐    fail → block merge
  │  Unit tests  │─────────────────────────────────────┐
  │  (transform  │                                     │
  │   functions, │                                     │
  │   schema)    │                                     │
  └──────┬───────┘                                     │
         │ pass                                        │
         ▼                                             │
  ┌──────────────────┐    fail → block merge           │
  │  Train on        │─────────────────────────────────┤
  │  reference data  │                                 │
  │  + eval metrics  │                                 │
  │  vs threshold    │                                 │
  └──────┬───────────┘                                 │
         │ pass                                        │
         ▼                                             │
  ┌──────────────────┐    fail → alert                 │
  │  Bias / fairness │─────────────────────────────────┤
  │  checks          │                                 │
  └──────┬───────────┘                                 │
         │ pass                                        │
         ▼                                             │
  ┌──────────────────┐                                 │
  │  Deploy to       │                                 │
  │  Staging →       │                                 │
  │  shadow / canary │                                 │
  │  → Production    │                                 │
  └──────────────────┘◄────────────────────────────────┘
```

A minimal GitHub Actions workflow for testing + training:

```yaml
# .github/workflows/ml_ci.yml
name: ML CI

on: [push, pull_request]

jobs:
  test-and-train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with: { python-version: "3.11" }

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run unit tests
        run: pytest tests/ -v

      - name: Train and validate model
        run: python train.py --validate-thresholds
        # train.py exits non-zero if F1 drops below threshold

      - name: Upload model artifact
        if: github.ref == 'refs/heads/main'
        run: python register_model.py --stage staging
```

---

## 18.7 Monitoring — Operational Metrics

Operational monitoring tracks that the serving infrastructure is functioning. These metrics should alert before users are affected.

| Metric | What it measures | Alert threshold |
|--------|-----------------|-----------------|
| Request latency (P95, P99) | End-to-end response time | > SLA (e.g., 200 ms) |
| Error rate | HTTP 4xx / 5xx per minute | > 1% |
| Prediction throughput | Requests per second | < baseline × 0.5 (drop-off) |
| Model load time | Seconds to warm up | > 30 s |
| GPU/CPU utilization | Compute saturation | > 90% sustained |
| Memory utilization | OOM risk | > 85% |

```python
# Minimal Prometheus-style metrics with the prometheus_client library
from prometheus_client import Counter, Histogram, start_http_server
import time

REQUEST_COUNT = Counter("model_requests_total", "Total prediction requests",
                         ["status"])
REQUEST_LATENCY = Histogram("model_request_latency_seconds",
                             "Prediction latency",
                             buckets=[.01, .05, .1, .25, .5, 1.0])

@app.post("/predict")
def predict(req: PredictRequest):
    start = time.time()
    try:
        result = _run_model(req)
        REQUEST_COUNT.labels(status="success").inc()
        return result
    except Exception as e:
        REQUEST_COUNT.labels(status="error").inc()
        raise
    finally:
        REQUEST_LATENCY.observe(time.time() - start)
```

---

## 18.8 Data Drift & Concept Drift Detection

Operational metrics tell you the infrastructure is up. Drift detection tells you whether the **model is still making good predictions** on real traffic.

### Definitions

> **Data drift (covariate shift):** the distribution of input features P(X) changes after deployment. The model itself is unchanged, but it is now being asked to predict on inputs it was not trained for.

> **Concept drift:** the relationship between inputs and the target P(Y|X) changes. Even if the inputs look the same, the correct answer has shifted — e.g., customer behavior patterns after an economic shock.

```
  DATA DRIFT:                         CONCEPT DRIFT:
  Training: age ~ N(35, 10)           Training: high income → churns more
  Production: age ~ N(52, 15)         Production: high income → churns less
       ↑ user demographics shifted         ↑ behavior pattern changed
  Model still valid but operating     Model predictions are now wrong
  in a range it barely saw            even for normal inputs
```

### Detecting Data Drift — PSI and KS Test

**Population Stability Index (PSI)** quantifies the shift in a feature's distribution between training (reference) and current serving data. Originally from credit risk modeling.

```
  PSI = Σ (Actual% − Expected%) × ln(Actual% / Expected%)
          over N buckets

  Rule of thumb:
  ┌─────────────┬──────────────────────────────────────────┐
  │ PSI < 0.10  │ No significant change — monitor normally │
  │ 0.10–0.20   │ Moderate shift — investigate             │
  │ PSI > 0.20  │ Major shift — retrain or flag for review │
  └─────────────┴──────────────────────────────────────────┘
```

```python
import numpy as np
import pandas as pd

def compute_psi(reference: np.ndarray, current: np.ndarray,
                n_bins: int = 10) -> float:
    """
    Compute Population Stability Index between reference and current
    distributions. Higher PSI = more drift.
    """
    # Build bins from reference distribution
    breakpoints = np.nanpercentile(reference,
                                    np.linspace(0, 100, n_bins + 1))
    breakpoints = np.unique(breakpoints)  # deduplicate edge cases

    ref_counts, _ = np.histogram(reference, bins=breakpoints)
    cur_counts, _ = np.histogram(current,   bins=breakpoints)

    # Convert to proportions, clamp zeros to avoid log(0)
    ref_pct = np.clip(ref_counts / len(reference), 1e-6, None)
    cur_pct = np.clip(cur_counts / len(current),   1e-6, None)

    psi = np.sum((cur_pct - ref_pct) * np.log(cur_pct / ref_pct))
    return float(psi)


# Example: check drift in "age" feature over 7-day windows
train_ages   = X_train["age"].values          # reference (training data)
recent_ages  = recent_traffic["age"].values   # production traffic, last 7 days

psi_age = compute_psi(train_ages, recent_ages)
print(f"Age PSI = {psi_age:.4f}")
if psi_age > 0.20:
    print("ALERT: major distribution shift in 'age' — consider retraining")
```

**Kolmogorov-Smirnov (KS) Test** is a statistical test for whether two samples come from the same distribution. It returns a p-value: low p-value means the distributions are significantly different.

```python
from scipy.stats import ks_2samp

stat, p_value = ks_2samp(train_ages, recent_ages)
print(f"KS statistic = {stat:.4f}, p-value = {p_value:.4f}")
if p_value < 0.05:
    print("ALERT: distributions are significantly different (p < 0.05)")
```

### Feature and Label Monitoring

```python
import pandas as pd

def monitor_features(reference_df: pd.DataFrame,
                     production_df: pd.DataFrame,
                     threshold_psi: float = 0.20) -> pd.DataFrame:
    """Compute PSI for every numeric feature and flag drifters."""
    results = []
    for col in reference_df.select_dtypes(include="number").columns:
        psi = compute_psi(reference_df[col].dropna().values,
                          production_df[col].dropna().values)
        results.append({"feature": col, "psi": psi,
                         "drifted": psi > threshold_psi})
    return pd.DataFrame(results).sort_values("psi", ascending=False)

drift_report = monitor_features(X_train, recent_traffic)
print(drift_report)
#    feature    psi   drifted
#    age        0.23  True      ← needs attention
#    fare       0.08  False
#    pclass     0.03  False

# Label / prediction monitoring (detect concept drift indirectly)
# If ground-truth labels are available with a delay:
from sklearn.metrics import f1_score

daily_f1 = f1_score(ground_truth_labels, production_predictions)
print(f"Rolling F1 (last 24h) = {daily_f1:.4f}")
if daily_f1 < 0.75:
    print("ALERT: model performance degraded below threshold")
```

```
  DRIFT MONITORING STRATEGY:
  ┌──────────────────────────────────────────────────────────────────┐
  │  Daily:     PSI on all input features against training baseline   │
  │  Daily:     prediction distribution shift (expected vs actual %)  │
  │  Weekly:    KS test on key features                               │
  │  When       compute F1/AUC against delayed labels if available    │
  │  labels     (labels often arrive hours/days after prediction)     │
  │  arrive:                                                          │
  └──────────────────────────────────────────────────────────────────┘
```

---

## 18.9 Retraining Triggers

Retraining is not always better. Triggering it too often wastes compute; triggering it too rarely lets the model drift silently. Use a combination of signals:

```
  RETRAINING DECISION TREE:
  ┌───────────────────────────────────────────────────────────────┐
  │                                                               │
  │  Is PSI > 0.20 for any critical feature?                     │
  │  YES → investigate. If data quality OK → schedule retrain.   │
  │  NO  → continue monitoring.                                  │
  │                                                               │
  │  Is rolling F1/AUC below threshold (requires label delay)?   │
  │  YES → immediate retrain pipeline.                           │
  │                                                               │
  │  Is scheduled retrain window reached (e.g., weekly/monthly)? │
  │  YES → retrain on freshest N days of data + validate.        │
  │                                                               │
  │  Is there a known business event (product launch, pandemic)?  │
  │  YES → manual trigger for emergency retrain.                 │
  │                                                               │
  └───────────────────────────────────────────────────────────────┘

  After retraining: VALIDATE before replacing production model.
  Compare new model vs current on a held-out recent slice.
  If new model is worse → do not promote.
```

---

## 18.10 Safe Rollout — Shadow, Canary, A/B

Never flip 100% of traffic to a new model instantly. Use progressive delivery patterns to catch regressions early.

```
  SHADOW DEPLOYMENT
  ─────────────────────────────────────────────────────────────────
  Production   ─── 100% traffic → Model v1 → response to user
  traffic ─┤
  (mirrored)   ─── 100% traffic → Model v2 → /dev/null (no response)

  Purpose: compare v2 predictions and latency to v1 without any
           user impact. Best for high-risk changes.
  ─────────────────────────────────────────────────────────────────

  CANARY DEPLOYMENT
  ─────────────────────────────────────────────────────────────────
  Production   ─── 95% traffic → Model v1
  traffic ─┤
             ─── 5% traffic  → Model v2  (real users, small %)

  Gradually increase v2 %: 5% → 20% → 50% → 100%
  Monitor P95 latency and error rate at each step.
  Roll back if metrics degrade.
  ─────────────────────────────────────────────────────────────────

  A/B TESTING
  ─────────────────────────────────────────────────────────────────
  Assign users deterministically (e.g., hash of user_id):
  Group A (50%) → Model v1
  Group B (50%) → Model v2

  Measure business metric (CTR, revenue, churn) after N days.
  Statistical significance test before declaring a winner.
  A/B is about measuring business impact; canary is about
  catching infrastructure/quality regressions.
  ─────────────────────────────────────────────────────────────────
```

```python
# Simple canary routing in FastAPI
import hashlib

def route_to_model(user_id: str, canary_pct: float = 0.05) -> str:
    """Return 'v2' for canary_pct fraction of users, else 'v1'."""
    # Deterministic: same user always gets same model
    h = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
    return "v2" if (h % 100) < (canary_pct * 100) else "v1"

@app.post("/predict")
def predict(req: PredictRequest, user_id: str = "anonymous"):
    model_version = route_to_model(user_id, canary_pct=0.05)
    model = model_v2 if model_version == "v2" else model_v1
    pred = model.predict(req.to_frame())[0]
    # Log which model version served this prediction for analysis
    logger.info("served", extra={"model_version": model_version,
                                  "prediction": int(pred)})
    return {"prediction": int(pred), "model_version": model_version}
```

---

## 18.11 MLOps Maturity Levels

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  LEVEL 0 — Manual                                                │
  │  Notebook → manual export → ad-hoc deployment → no monitoring   │
  │  Suitable for: one-off analyses, no real users                   │
  │                                                                  │
  │  LEVEL 1 — Automated Training                                    │
  │  Experiment tracking + model registry + scheduled retraining     │
  │  + basic operational monitoring                                  │
  │  Suitable for: internal tools, low-risk models                   │
  │                                                                  │
  │  LEVEL 2 — Automated Pipeline                                    │
  │  + CI/CD for model code + drift detection + canary deployments   │
  │  + label monitoring + auto-retrain triggers                      │
  │  Suitable for: customer-facing models, regulated industries      │
  │                                                                  │
  │  Most teams should target Level 1–2. Level 0 is a liability.     │
  └──────────────────────────────────────────────────────────────────┘
```

### Tool Reference

| Category | Open Source | Managed (Cloud) |
|----------|-------------|-----------------|
| Experiment tracking | MLflow, DVC | Vertex AI Experiments, W&B, Comet |
| Model registry | MLflow Model Registry | Vertex AI Model Registry, SageMaker Registry |
| Serving (online) | FastAPI, BentoML, TorchServe | Vertex AI Prediction, SageMaker Endpoint |
| Serving (batch) | Spark, pandas job | Vertex AI Batch Prediction, SageMaker Batch |
| Orchestration | Apache Airflow, Kubeflow Pipelines | Vertex AI Pipelines, SageMaker Pipelines |
| Drift detection | Evidently AI, Alibi Detect, whylogs | Amazon SageMaker Model Monitor |
| Feature store | Feast | Vertex AI Feature Store, Tecton |

---

## Key Takeaways

```
╔══════════════════════════════════════════════════════════════════════╗
║  PRACTICAL ML CHEAT SHEET                                            ║
║  ────────────────────────────────────────────────────────────────   ║
║                                                                      ║
║  WORKFLOW: Load -> EDA -> Preprocess -> Split -> Train -> Evaluate   ║
║  BASELINE: Always start with Logistic Regression / Linear Regression ║
║  SCALING: Fit on train, transform both. Tree models don't need it.  ║
║  ENCODING: One-Hot for nominal (<10 cats), Target for high-card     ║
║  LEAKAGE: Split BEFORE any preprocessing!                           ║
║  TUNING: RandomizedSearchCV first, then GridSearchCV to refine      ║
║  PIPELINE: Use sklearn Pipeline for clean, reproducible code        ║
║  TABULAR: XGBoost/LightGBM almost always wins                      ║
║  IMAGES: CNN (Convolutional Neural Network)                         ║
║  TEXT: Naive Bayes (simple) or Transformers (state-of-art)          ║
║  EVALUATE: Use F1/AUC for imbalanced data, not just accuracy       ║
║  OVERFIT: More data, regularize, simpler model, cross-validate     ║
║                                                                      ║
║  THE #1 RULE: Your model is only as good as your data.              ║
║  Spend 80% of your time on data quality and feature engineering.    ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**Back to Start:** [README — Table of Contents](../README.md)
