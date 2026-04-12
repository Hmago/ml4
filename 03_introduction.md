# Chapter 3 — Introduction to Machine Learning

---

## What You'll Learn

After reading this chapter, you will be able to:
- Define machine learning and explain how it differs from traditional programming
- Name the three main types of ML and give an example of each
- Describe the five steps of the ML workflow
- Identify when ML is (and isn't) the right approach to a problem

---

## What is Machine Learning?

### Simple Explanation (for a 10-year-old)

Imagine you want to teach your little brother to recognize cats. You don't give him a rulebook.
Instead, you show him **hundreds of pictures** of cats and say "this is a cat!" After seeing
enough pictures, he starts recognizing cats on his own — even ones he's never seen before!

**Machine Learning works the same way.** Instead of your brother, it's a computer program.
Instead of looking at pictures, it reads numbers. And instead of figuring it out in its
brain, it adjusts thousands of tiny settings called **parameters** (think of them like
tiny dials on a radio — each dial gets tweaked a little until the station comes
in clearly) until it gets good at recognizing the pattern.

```
Traditional Programming         Machine Learning
─────────────────────           ────────────────────
 Input + Rules → Output    vs    Input + Output → Rules (learned!)

 You tell the computer         The computer figures out
 exactly what to do            the rules by itself!
```

### Official Definition

> **Machine Learning (ML)** is a subfield of Artificial Intelligence (AI) that enables systems
> to automatically learn and improve from experience without being explicitly programmed.
> ML focuses on developing computer programs that can access data and use it to learn for themselves.
> — *Tom Mitchell, 1997: "A computer program is said to learn from experience E with respect to some
> task T and some performance measure P, if its performance on T, as measured by P, improves with
> experience E."*

---

## The AI Family Tree

```
┌──────────────────────────────────────────────────────────────────┐
│                    ARTIFICIAL INTELLIGENCE                       │
│  (Computers doing smart things)                                  │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │              MACHINE LEARNING                            │   │
│   │  (Computers learning from data)                          │   │
│   │                                                          │   │
│   │   ┌──────────────────────────────────────────────────┐   │   │
│   │   │              DEEP LEARNING                       │   │   │
│   │   │  (Using many-layered Neural Networks)            │   │   │
│   │   │                                                  │   │   │
│   │   │   ┌──────────────────────────────────────────┐   │   │   │
│   │   │   │     GENERATIVE AI                        │   │   │   │
│   │   │   │  (ChatGPT, Stable Diffusion, etc.)       │   │   │   │
│   │   │   └──────────────────────────────────────────┘   │   │   │
│   │   └──────────────────────────────────────────────────┘   │   │
│   └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## A Brief History of Machine Learning

```
Timeline
─────────────────────────────────────────────────────────────────────

1950 ──► Alan Turing proposes the "Turing Test"
         "Can a machine think?"

1957 ──► Frank Rosenblatt invents the Perceptron
         (First simple neural network!)

1959 ──► Arthur Samuel coins "Machine Learning"
         Teaches a computer to play checkers

1980s ──► Neural networks get popular
          Backpropagation algorithm discovered

1990s ──► Support Vector Machines (SVM) emerge
          Statistical ML becomes dominant

1997 ──► IBM Deep Blue beats chess champion Kasparov

2006 ──► Deep Learning renaissance begins
         Geoffrey Hinton shows deep nets can work!

2012 ──► AlexNet wins ImageNet by huge margin
         Deep learning proves itself on images

2016 ──► AlphaGo beats world Go champion
         RL + Deep Learning combined

2017 ──► Transformer architecture invented (Google)
         "Attention is All You Need" paper

2022 ──► ChatGPT launches
         LLMs become mainstream

2024+ ──► Multimodal AI, AI Agents era begins
```

---

## Why Does Machine Learning Matter?

### Real-World Applications

```
┌─────────────────────────────────────────────────────────────────┐
│                    ML IS EVERYWHERE!                            │
├─────────────────┬───────────────────────────────────────────────┤
│ Healthcare      │ Detecting cancer in X-rays                    │
│ Finance         │ Spotting fraud on your credit card            │
│ Transport       │ Self-driving cars seeing road signs           │
│ Entertainment   │ Netflix recommending your next show           │
│ Shopping        │ Amazon predicting what you'll buy             │
│ Language        │ Google Translate, ChatGPT                     │
│ Science         │ Discovering new drugs, weather forecasting    │
│ Security        │ Face unlock on your phone                     │
└─────────────────┴───────────────────────────────────────────────┘
```

---

## The 3 Types of Machine Learning

```
         HOW DOES THE MODEL LEARN?
         ─────────────────────────

         Do we give it answers?
               /         \
             YES           NO
              │             │
              ▼             ▼
        SUPERVISED     Does it get rewards?
         LEARNING          /        \
                         YES         NO
          Examples:       │           │
          - Spam filter   ▼           ▼
          - Price        REINFORCE-  UNSUPERVISED
            predictor    MENT        LEARNING
                         LEARNING
                                    Examples:
                         Examples:  - Customer groups
                         - Game AI  - Topic detection
                         - Robots   - Anomaly detection
```

### Type 1: Supervised Learning
- You give the model **input + correct answer** pairs
- Model learns to predict the answer from the input
- Like a student with an answer key

### Type 2: Unsupervised Learning
- You give the model **only input** — no answers
- Model finds its own structure and patterns
- Like organizing a messy room without being told how

### Type 3: Reinforcement Learning
- Model learns by **trying things and getting rewards/penalties**
- No dataset — it learns through interaction
- Like training a dog with treats and corrections

---

## The Machine Learning Workflow

```
Step 1       Step 2        Step 3      Step 4       Step 5
────────     ──────────    ────────    ─────────    ──────────
Collect  →   Prepare   →   Train   →   Evaluate →   Deploy
 Data         Data          Model       Model         Model

   │             │             │            │            │
   ▼             ▼             ▼            ▼            ▼
Get raw      Clean,        Feed data    Check on     Use model
data from    transform,    into algo,   test data,   in real
various      normalize     adjust       measure      world
sources      the data      settings     accuracy     apps
```

---

## When to Use Machine Learning?

```
Use ML when...                     Don't use ML when...
──────────────────────────         ──────────────────────────────
✓ Problem is too complex           ✗ Simple rules can solve it
  for manual rules                   (e.g., if x > 5 then ...)

✓ You have lots of data            ✗ You have very little data

✓ Pattern changes over time        ✗ You need to fully explain
  (spam evolves, prices shift)       every decision (law, medicine)

✓ Humans do it well                ✗ The stakes of being wrong
  (image/speech recognition)        are too high without oversight
```

---

## Review Questions — Test Your Understanding

Try to answer these without scrolling up. Then check your answers.

1. In your own words, what is the difference between traditional programming and machine learning?
2. A company wants to predict which customers will cancel their subscription next month. Which type of ML is this? (Supervised / Unsupervised / Reinforcement)
3. You have a dataset of customer purchases but NO labels. You want to find natural groups. Which type of ML would you use?
4. Name the 5 steps of the ML workflow in order.
5. Give one example where ML is NOT the right approach, and explain why.

<details>
<summary>Answers</summary>

1. Traditional programming: you write explicit rules (Input + Rules = Output). ML: the computer discovers the rules from data (Input + Output = Rules).
2. Supervised Learning — you have historical data with labels (cancelled / didn't cancel).
3. Unsupervised Learning — specifically clustering.
4. Collect Data -> Prepare Data -> Train Model -> Evaluate Model -> Deploy Model.
5. Example: Calculating sales tax (simple rule: price x tax_rate). ML is overkill for problems with clear, fixed rules.
</details>

---

## Key Takeaways

```
╔═══════════════════════════════════════════════════════════════╗
║  REMEMBER THESE                                               ║
║  ─────────────────────────────────────────────────────────   ║
║  1. ML = learning patterns from data                         ║
║  2. Three types: Supervised, Unsupervised, Reinforcement     ║
║  3. ML is a subset of AI; Deep Learning is a subset of ML    ║
║  4. Workflow: Collect → Prepare → Train → Evaluate → Deploy  ║
║  5. ML needs DATA — more good data = better results          ║
╚═══════════════════════════════════════════════════════════════╝
```

---

**Next:** [Chapter 4 — Core Concepts & Terminology](04_core_concepts.md)
