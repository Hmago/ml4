# Chapter 5B — Upgrade Your Brain in 30 Days: A Practical Program

> A concrete, time-boxed 30-day plan that turns the *science* from Chapter 5 into a *daily routine*. **[← Chapter 5 — Brain Training](05_brain_training.md)** gives you the "why" (the cognitive-science evidence). This chapter gives you the "what to do today", in ~45 minutes a day. No pseudoscience, no nootropic hype — every routine below is an application of a peer-reviewed effect cited in Chapter 5.

---

## Simple Explanation

Think of your brain like an athlete training for a season. You don't get fitter by reading about exercise — you get fitter by doing a structured program: warm-up, progressive overload, recovery days, and tracking. This chapter is that program for your *mind*. For 30 days you run a small, repeatable daily loop that exercises five capacities at once:

1. **Reasoning** (high-IQ thinking routines)
2. **Curiosity & range** (mind-expanding prompts)
3. **Input quality** (advanced reading material)
4. **Retention** (memory-enhancing techniques)
5. **Recovery** (strategic rest habits)

Each capacity has a famous result behind it — spacing, retrieval, elaboration, sleep-dependent consolidation — but you don't need to think about the theory while you run it. You just follow the day card.

## Official Definition

> A **cognitive training program** is a structured, progressive schedule of effortful mental tasks combined with deliberate recovery, designed to produce *durable* improvement in targeted skills. The evidence is clear on one boundary: training transfers to the **specific skills you practice and to closely related tasks (near transfer)**, but broad "general IQ" gains from puzzle apps are **not** supported (Owen et al., 2010, *Nature*; Simons et al., 2016, *Psychological Science in the Public Interest*). This program is therefore built around skills that *do* transfer to engineering and interview performance: reasoning under uncertainty, durable recall of technical material, and sustained focus — not abstract "brain games."

> **In plain English:** practising a Sudoku app makes you better at *Sudoku* — not smarter in general. ("Near transfer" just means a skill carries over to *similar* tasks; "far transfer" to *unrelated* ones, and that mostly doesn't happen.) So instead of brain-game puzzles, this program drills the skills you *actually* want: thinking clearly, remembering technical material, and staying focused.

> ⚠️ **Honest expectation-setting.** You cannot raise a validated IQ score by 15 points in 30 days; anyone selling that is selling snake oil. What you *can* do in 30 days: build retrieval-practice and spacing habits that measurably improve how much you retain, sharpen specific reasoning routines, fix the sleep/focus leaks that quietly cap your performance, and read deeper material than you currently do. Those are real, and they compound.

---

## What You'll Build in 30 Days

By Day 30 you will have:

- A running **Anki / spaced-repetition deck** you actually review daily (the single highest-ROI habit here).
- A repertoire of **5 thinking routines** you can deploy on any hard problem.
- A **reading habit** of one dense source per week, processed with active recall — not passive skimming.
- A **memory palace** you can build on demand, plus working knowledge of major/peg systems.
- A **sleep and rest protocol** that protects the consolidation your daytime effort depends on.
- A **metrics log** showing your retention %, focus minutes, and reading throughput trending up.

---

## The Core Principle: It's a Loop, Not a List

Most "brain upgrade" plans fail because they're a pile of unrelated tips. This one is a single **daily loop** repeated 30 times, with the *content* changing as you progress. The loop is deliberately short so it survives bad days (see Chapter 5 on implementation intentions and the 5-minute rule).

```
   THE DAILY 45-MINUTE LOOP  (the engine of the whole program)

   ┌──────────────────────────────────────────────────────────────┐
   │  0–10 min   RECALL     Review spaced-repetition cards (Anki)   │
   │                        → retrieval practice = the #1 lever     │
   ├──────────────────────────────────────────────────────────────┤
   │  10–15 min  PROMPT     One mind-expanding prompt, write 5 lines│
   │                        → divergent thinking + writing-to-learn │
   ├──────────────────────────────────────────────────────────────┤
   │  15–35 min  DEEP WORK  One thinking routine on hard material   │
   │                        (read advanced source OR solve problem) │
   │                        → effortful, single-tasked, timed       │
   ├──────────────────────────────────────────────────────────────┤
   │  35–45 min  ENCODE     Turn today's insight into 2–4 new cards │
   │                        + 3-line Feynman explanation            │
   │                        → generation effect closes the loop     │
   └──────────────────────────────────────────────────────────────┘
              ▲                                          │
              └─────────  tomorrow's RECALL reviews ─────┘
                          what you ENCODED today
```

**Why this exact order works (Chapter 5 cross-refs):**

| Block | Technique applied | Evidence (see Ch 5) |
|-------|-------------------|---------------------|
| Recall | Active recall + spaced repetition | Roediger & Karpicke 2006; Ebbinghaus 1885 |
| Prompt | Elaborative interrogation, writing-to-learn | Pressley et al. 1992 |
| Deep Work | Deliberate practice, desirable difficulty | Ericsson 1993; Bjork & Bjork |
| Encode | Generation effect, dual coding, Feynman | Slamecka & Graf 1978; Paivio |

Everything else in this chapter — the routines, prompts, reading list, rest protocol — is just *what you pour into the loop* each day.

### What one day actually looks like (a worked example)

Theory is abstract, so here is the loop filled in with real content. Say it's **Day 9** and you're prepping for an ML interview:

| Block | What you actually do on Day 9 |
|-------|-------------------------------|
| **RECALL** (10 min) | Anki shows you 18 cards that are "due" today. One asks: *"Why does dropout reduce overfitting?"* You say the answer out loud from memory, **then** flip the card to check. You got 16 of 18 right. |
| **PROMPT** (5 min) | Today's prompt: *"Explain backpropagation using a cooking metaphor."* You write 5 lines: gradients are like tasting a sauce, deciding it's too salty, and adjusting the recipe a little each time. |
| **DEEP WORK** (20 min) | You read 4 pages on batch normalization. Then you apply the **Inversion** routine (below): *"How could batch norm make training **worse**?"* — and you discover the small-batch edge case. |
| **ENCODE** (10 min) | You make 3 new cards (e.g., *"What does batch norm normalize, and over which axis?"*) and write a 3-sentence plain-English summary of what you learned. |

Total: **~45 minutes.** Tomorrow, those 3 new cards show up in RECALL — so today's effort gets reviewed automatically, and the loop compounds. That's the whole machine.

---

## Week-by-Week Arc

The 30 days are organized as four progressive weeks. Difficulty and autonomy ramp up; the daily time stays ~45 min.

```
  WEEK 1  FOUNDATIONS     Install the loop. Build the deck. Fix sleep.
  WEEK 2  REASONING       Add thinking routines. Harder reading. Memory palace.
  WEEK 3  RANGE           Mind-expanding prompts. Cross-domain reading. Interleave.
  WEEK 4  INTEGRATION     Full loop on real interview/ML material. Test yourself.
        ───────────────────────────────────────────────────────────
        Throughout: spaced review compounds; rest protocol is non-negotiable.
```

| Week | Theme | New skill added | Reading target |
|------|-------|-----------------|----------------|
| 1 | Foundations | Daily recall + encode habit; sleep protocol | 1 accessible deep article |
| 2 | Reasoning | 5 thinking routines; memory palace | 1 dense technical chapter |
| 3 | Range | Mind-expanding prompts; interleaving | 1 cross-domain primary source |
| 4 | Integration | Self-testing under exam conditions | 1 research paper (full) |

---

## Part 1 — High-IQ Thinking Routines

> **Simple version:** Smart problem-solving is less about raw horsepower and more about having *reusable routines* you run instead of staring blankly. Below are five routines used by strong engineers and forecasters. Learn one per day in Week 2, then keep all five in rotation.

> **Official:** These routines come from research on how people make good judgments and decisions — especially **calibration and probabilistic reasoning** (Tetlock & Gardner, *Superforecasting*, 2015), the split between fast-intuitive and slow-deliberate thinking (**System 1 / System 2**, Kahneman, 2011), and the **structured analytic techniques** used by professional analysts. Because they're "near-transfer" skills — you practise the *exact* kind of reasoning you'll use on real problems and in interviews — they're the kind of training the evidence actually supports.

### Routine 1 — First-Principles Decomposition

Strip a problem down to the handful of facts you're *sure* of, then build back up from there — instead of copying how everyone else does it. Ask: *"What do I actually know to be true here?"*

```
  Problem:  "Design a system to detect fraud in real time."
  ❌ By analogy:        "Just copy what Company X did."
  ✅ First principles:  What even IS fraud here (a yes/no label)?
                        What signal shows up BEFORE the fraud happens?
                        How fast must we answer (latency budget)?
                        What's worse — a false alarm (flagging a good user)
                        or a miss (letting fraud through)?
                        → Once you list the real constraints, the design
                          almost writes itself.
```

> *(A "false alarm" is a **false positive**; a "miss" is a **false negative**. Deciding which is more costly drives the whole design.)*

### Routine 2 — Inversion ("Think Backwards")

Instead of asking *"How do I succeed?"*, ask *"What would guarantee failure?"* — then avoid those things. The mathematician Jacobi's advice was *"invert, always invert"*; the investor Charlie Munger made it famous.

> Daily use: before any plan, list the top 3 ways it could fail. You'll catch most problems while you're still designing, instead of after they blow up.

```
  Example — your plan is "I'll prepare for my interview in 4 weeks."
  Invert it → "What would guarantee I FAIL?"
    • I cram only theory and never practise coding out loud → fix: do mock interviews early.
    • I burn out by week 2 → fix: schedule rest days from the start.
    • I skip the topics I dislike → fix: begin with my weakest area, not my favourite.
  Each failure mode just handed you a to-do item.
```

### Routine 3 — Fermi Estimation

Take any scary unknown number and break it into smaller numbers you *can* guess, then multiply. (There's a whole chapter of these — see **[Chapter 4 — Aptitude & Mental Math](04_aptitude_mental_math.md)**.) The steps: break it down → guess each piece roughly → multiply → check the answer "feels" the right size.

```
  Example — "How many piano tuners are in Chicago?"  (a classic)
    ~3,000,000 people ÷ ~3 per household        = ~1,000,000 households
    ~1 in 20 households owns a piano             = ~50,000 pianos
    each tuned once a year; one tuner does ~1,000/yr
    50,000 ÷ 1,000                               ≈ 50 tuners
  You'll never be exact — but ~50 is the right ballpark, and that's the goal.
```

### Routine 4 — Steelman Before You Argue

Before you reject an idea, first describe the **strongest** possible version of it (a "steelman" — the opposite of a "strawman", where you attack a weak, easy-to-beat version). This is the fastest way to actually understand something you dislike, and it kills *confirmation bias* (only noticing evidence that you were already right).

```
  Example — you believe "writing unit tests on a prototype is a waste of time."
  Steelman the OPPOSITE first: "Tests document what the code is supposed to do,
  they catch breakage when I refactor fast, and prototypes that 'just ship' often
  silently become production." Now you understand WHEN tests are worth it — and
  your own opinion comes out sharper, not weaker.
```

### Routine 5 — Calibrated Forecasting

Attach a probability to your predictions, then check them later. Say *"I'm 70% sure this refactor lands by Friday."* The goal: of all the things you call "70% likely," about 70% should actually happen. If you keep saying "90%" but only half come true, you're **overconfident** — and now you know it.

```
  Example log (check it a week later):
    "80% this PR passes review today"   → it did     ✅
    "60% I finish the design doc"        → I didn't   ❌
    "90% tonight's build is green"       → it was     ✅
  After ~20 predictions you can SEE whether your "90%"s really happen ~90% of
  the time. (Scoring this formally is called a *Brier score* — just a number for
  "how close were my probabilities to reality." Lower is better. You don't need
  the formula; the habit of writing the % down is what trains your judgment.)
```

```
  THINKING-ROUTINE CHEAT CARD (keep visible during Deep Work)

   Stuck on a problem?  → First-Principles Decomposition
   Making a plan?       → Inversion (how could this fail?)
   Unknown number?      → Fermi Estimation
   Disagree with X?     → Steelman X first
   Predicting outcome?  → Attach a probability, log it
```

**How to train them:** In Week 2, spend the Deep Work block deliberately applying one routine per day to a real problem (a LeetCode design question, an ML system-design prompt from Chapter 26, or a decision in your own work). Write the routine's output in your log. By Day 14 you'll reach for them automatically.

---

## Part 2 — Mind-Expanding Prompts

> **Simple version:** A good prompt is a key that opens a room in your mind you don't usually visit. Spend 5 minutes a day writing a short answer to one. The point isn't the answer — it's the *mental stretch* and the **writing-to-learn** effect.

> **Official:** This is **elaborative interrogation** and **self-explanation** (Pressley et al., 1992; Chi et al., 1994) plus **divergent-thinking** practice (coming up with *many* different ideas, not one "right" answer). Writing forces you to make fuzzy, half-formed thoughts explicit, which both deepens understanding and exposes the gaps. Pairing the prompt with a frontier LLM as a **Socratic partner** (one that asks you probing questions instead of just handing you the answer) is the 2026 high-leverage version — see Chapter 5's AI-tutor section. The rule: you write *first*, then let the AI critique — never read its answer cold.

### A 30-prompt bank (one per day)

**Reasoning & models**
1. Explain today's hardest concept to a 12-year-old in 4 sentences. (Feynman)
2. What's a belief you held a year ago that you've since updated? What changed your mind?
3. Pick a technology you use daily. How would you rebuild it from first principles?
4. What's the strongest argument *against* something you believe about ML/AI?
5. If you had to remove one feature from a system you know well, which, and what breaks?

**Range & analogy**
6. Find a non-obvious analogy between a biological system and a software system.
7. What does this ML concept have in common with something in economics?
8. Describe backpropagation using only a cooking metaphor.
9. What's a question in your field that no one seems to be asking?
10. Connect two chapters of this course you'd never normally link.

**Inversion & risk**
11. What would have to be true for your current main project to fail completely?
12. What's a "best practice" that's probably wrong in some contexts? When?
13. If your future self looked back at this week, what would they wish you'd done?
14. What are you avoiding because it's hard, not because it's unimportant?

**Estimation & scale**
15. Estimate how many GPUs your favorite LLM needed to train. Show your reasoning.
16. How much would it cost to store every email you've ever sent? Estimate.
17. What's the smallest change that would 10x your learning speed this month?

**Self-model & metacognition**
18. When do you think most clearly during the day? What's your evidence?
19. What's one thing you "know" but have never actually verified?
20. Describe your own biggest reasoning blind spot.
21. What did you learn this week that you'll still use in five years?

**Creative recombination**
22. Combine two unrelated tools/ideas into a product that shouldn't exist but might work.
23. Rewrite a problem you're stuck on as a different *kind* of problem.
24. What would you build if compute and money were free for one year?
25. Steelman the technology you're most skeptical of.

**Frontier & future**
26. What becomes possible if context windows become effectively infinite?
27. Which of your current skills will matter *more* as AI improves, not less?
28. What's a second-order consequence of cheap, ubiquitous AI agents?
29. If you could ask a superintelligence one question, what would it be — and why that one?
30. What's the single most important thing you learned in this 30-day program?

> **How to run it:** Pick the day's prompt, set a 5-minute timer, write at least 5 lines. On Week 3+, paste your answer into an LLM with *"Critique this reasoning. Find the weakest assumption. Don't be nice."* and respond to its pushback. Save the best answers — by Day 30 you have a personal idea journal.

```
  Example of the write-then-critique loop (using Prompt #4):
  You write:  "The strongest argument against scaling up LLMs is that we'll
               simply run out of high-quality training data."
  You paste it to an LLM: "Critique this. Find the weakest assumption."
  It replies: "You're assuming DATA is the binding limit — but compute cost and
               energy may run out first, and synthetic data may relax the data
               limit entirely."
  → In 60 seconds you found a hole in your OWN thinking. That's the point — not
    to be told an answer, but to have your reasoning stress-tested.
```

---

## Part 3 — Advanced Reading Material

> **Simple version:** You become what you read. Skimming social feeds trains a shallow, twitchy mind; one dense source per week, read *actively*, trains depth. The trick is not to read *more* — it's to read *harder things, more slowly, with retrieval*.

> **Official:** Reading comprehension and knowledge growth follow the **"rich get richer" / Matthew effect** (Stanovich, 1986): the more background knowledge you already have, the easier new dense material is — so knowledge snowballs. *(Example: once you truly understand gradient descent, every optimizer paper you read afterwards goes faster, because you're only learning the new twist, not the whole foundation.)* The technique that actually converts reading into durable knowledge is **retrieval after reading** (closing the book and recalling it — the "testing effect"), **not** re-reading or highlighting. Highlighting in particular is among the *least* effective strategies ever studied (Dunlosky et al., 2013) — it feels productive but mostly just colours the page.

### The active-reading protocol (use on every source)

```
  BEFORE:  Skim headings. Write the 1 question you want answered. (2 min)
  DURING:  Read in one focused block. Mark only what surprises you. (no highlighting marathons)
  AFTER:   Close the source. Write — from memory — the 3 key ideas + 1 thing
           you disagree with or didn't understand. (this is the retrieval rep)
  ENCODE:  Turn the 3 ideas into Anki cards. Schedule a re-read of the hard part in 3 days.
```

### A graded reading ladder (pick to match the week)

You don't need to buy anything exotic — much is free and open-access. Choose **one** per week and go deep rather than sampling many.

| Tier | Type | Examples (author / venue — find the latest editions) |
|------|------|------------------------------------------------------|
| Accessible (Wk 1) | Popular science on cognition & reasoning | Kahneman, *Thinking, Fast and Slow*; Tetlock & Gardner, *Superforecasting*; Duhigg, *The Power of Habit* |
| Technical (Wk 2) | This course's own dense chapters | Ch 14 (Neural Networks), Ch 16 (Deep Learning), Ch 24 (Distributed Systems) |
| Cross-domain (Wk 3) | Primary sources outside your specialty | A classic essay (e.g., Hamming, *"You and Your Research"*); a paper from an adjacent field (economics, biology, info theory) |
| Frontier (Wk 4) | Read a full research paper, properly | A foundational ML paper (e.g., *"Attention Is All You Need"*, Vaswani et al. 2017) using the three-pass method below |

> **Note:** Titles above are recommendations to seek out from legitimate sources (libraries, publishers, open-access archives like arXiv). This course does not reproduce their contents — read the originals.

### The three-pass method for research papers (Keshav, 2007)

```
  PASS 1 (5–10 min):  Title, abstract, intro, headings, conclusion, references you know.
                      Goal: can you state the paper's category, contribution, and claims?
  PASS 2 (~1 hr):     Read the body, ignore proofs. Note figures, mark references to read.
                      Goal: could you summarize it to a peer with supporting evidence?
  PASS 3 (several hrs): Re-implement it mentally (or actually). Challenge every assumption.
                      Goal: you could reproduce or critique it. (Reserve for the most important papers.)
```

Most days you stop at Pass 1–2. Reserve Pass 3 for the Week-4 paper.

---

## Part 4 — Memory-Enhancing Techniques

> **Simple version:** Your memory isn't "good" or "bad" — it's *trained* or *untrained*. Two tools do 90% of the work: **spaced repetition** (so you don't forget) and **mnemonic encoding** (so things stick the first time). World memory champions aren't born with photographic memory; they use these systems.

> **Official:** Spaced repetition exploits the **spacing effect** and **testing effect** (Ebbinghaus 1885; Cepeda et al. 2006; Roediger & Karpicke 2006). Mnemonics exploit **dual coding** (pairing words with vivid mental pictures) and the **method of loci** (remembering things by placing them along a familiar route — more on this in Tool B). Their power shows up even in the brain: memory athletes have distinctive connectivity that *complete novices can acquire with just six weeks of training* (Dresler et al., 2017, *Neuron*). Memory is one of the most reliably *trainable* skills there is.

### Tool A — Spaced Repetition (the daily engine)

This is the **0–10 min RECALL** block of your loop. Use Anki (free; its **FSRS** scheduler — the part that decides *when* to show each card again — automatically learns *your* personal forgetting speed; see Chapter 5).

```
  CARD-WRITING RULES (the difference between a useless and a powerful deck)
  1. One fact per card. (Don't cram "define + example + history" onto one card.)
  2. Ask a QUESTION, don't show a statement.
       Good front: "Why does dropout reduce overfitting?"
       Bad  front: "Dropout reduces overfitting."   ← nothing to recall
  3. Make it RETRIEVAL, not recognition — no multiple choice on your own cards.
       (Recognising the right answer is easy; pulling it from memory is what sticks.)
  4. Use a "cloze" (a fill-in-the-blank) for definitions:
       "FSRS adapts review intervals to your {{c1::forgetting curve}}."
       ← Anki hides the {{c1::...}} part and asks you to fill it in.
  5. If you can't answer a card in under ~10 seconds, it's too big — split it.
```

Add **2–4 cards per day** (the ENCODE block). Never bulk-import 500 cards — a deck you dread is a deck you abandon. By Day 30 you'll have ~60–120 high-quality cards and a daily review habit that lasts for years.

### Tool B — The Memory Palace (method of loci)

For ordered lists, sequences, and speeches. Build one in Week 2.

```
  HOW TO BUILD ONE
  1. Pick a route you know cold (your home, your commute). Fix 10 "stations" in order.
  2. For each item to remember, place a VIVID, absurd, moving image at a station.
     (Absurd + emotional + in-motion = memorable. Bland = forgotten.)
  3. To recall: walk the route mentally; the images are waiting where you left them.

  Example — remembering the ML pipeline stages along your hallway:
    Front door  → a giant DATASET pouring out as you open it      (data collection)
    Coat rack   → coats being SCRUBBED clean                       (preprocessing)
    Kitchen     → a chef SPLITTING a cake into 3 uneven slices     (train/val/test split)
    Stairs      → a robot doing push-ups on each step              (training)
    Bathroom    → a scale weighing the robot                        (evaluation)
```

### Tool C — Major System & Pegs (for numbers)

Numbers are hard to remember because they're abstract. The trick: turn each digit into a consonant *sound*, glue the sounds into a word, then picture that word. The standard code is:

```
  0 = s/z    1 = t/d    2 = n     3 = m     4 = r
  5 = l      6 = j/sh   7 = k/g   8 = f/v   9 = p/b   (vowels are free filler)

  Example:  "314"  →  3=m, 1=t, 4=r  →  "m_t_r"  →  "MOTOR"  →  picture a motor.
  Now you can't forget that π ≈ 3.14 — just see the motor.
```

Great for constants, dates, phone numbers, and the magnitude facts in Chapter 4 (e.g., picture a vivid image for "1024" to lock in 2¹⁰).

### Tool D — Elaborative & Dual Encoding

When learning anything new, ask *"What does this connect to that I already know?"* (elaboration) and *"What's the picture?"* (dual coding). A concept tied to five existing memories and an image has six retrieval routes instead of one.

```
  MEMORY TECHNIQUE → USE WHEN
  Spaced repetition (Anki) → facts, definitions, vocab, anything you must retain long-term
  Memory palace            → ordered lists, processes, a talk you must deliver
  Major/peg system         → numbers, constants, dates
  Elaboration + dual coding→ conceptual understanding (the default for new ideas)
```

---

## Part 5 — Strategic Rest Habits

> **Simple version:** You don't build muscle in the gym — you build it while resting afterward. Memory is identical: the *consolidation* of everything you studied today happens mostly while you **sleep**. Skimping on rest doesn't give you more learning time; it deletes the learning you already did. Rest is part of the training, not a break from it.

> **Official:** Sleep, especially the interplay of **slow-wave (deep) sleep** and **REM (dreaming) sleep**, drives **memory consolidation** — the brain replays the day's learning and moves it from the hippocampus (think of it as the brain's short-term "inbox") into the neocortex (long-term storage) (Walker, 2017; Rasch & Born, 2013). Sleep deprivation hurts you *twice*: a tired brain *learns* about 40% less, **and** it *consolidates* what it did learn far worse. Even short **naps** and quiet **wakeful rest** give measurable consolidation. That's why this program treats rest as a real training input, not a luxury.

### The non-negotiable rest protocol

```
  SLEEP (the highest-leverage cognitive enhancer that exists)
  • Target 7–9 hours. Consistency of TIMING matters as much as duration.
  • Fixed wake time, 7 days a week — anchors your circadian clock.
  • Last screen 30–60 min before bed; last caffeine ~8–10 hrs before bed
    (caffeine half-life ≈ 5–6 hrs).
  • Study the hardest material EARLIER; let sleep consolidate it.

  WITHIN-DAY RECOVERY
  • Pomodoro: ~25 min focus / 5 min real break (walk, look far, no feed-scrolling).
  • After ~90 min, take a longer 15–20 min break (ultradian rhythm).
  • The 10–20 min nap: consolidates without grogginess (avoid >30 min midday).
  • "Active rest" (a walk, no podcast) lets default-mode network connect ideas.

  WEEKLY
  • 1 full rest day from the program. Compounding needs recovery; burnout erases gains.
  • Aerobic exercise 3×/week — the single best-supported booster of memory and BDNF
    (Erickson et al., 2011 — aerobic exercise grew hippocampal volume in adults).
```

### Strategic rest *inside* the 30 days

| Cue | Strategic rest move |
|-----|---------------------|
| Just finished hard Deep Work | 5-min walk before encoding — don't power through |
| Studied a tough concept at night | Sleep on it *before* the quiz; recall is better the next morning |
| Feeling foggy / re-reading the same line | Stop. 20-min nap or walk beats 60 min of fog |
| End of Week | Take the rest day — it's scheduled, not a failure |
| Stuck on a problem | Deliberately disengage; incubation often solves it (the "shower effect") |

> ⚠️ If low mood, anhedonia, or disrupted sleep persists **3+ weeks**, that's beyond the scope of any productivity program — see Chapter 5's note on behavioral activation and seeking a professional. Rest habits help a tired brain; they are not a treatment for clinical depression.

---

## The Full 30-Day Schedule

Each day = the ~45-min loop, with these specifics. Days are light by design so the habit survives. Adapt the material to your goals (ML interview prep, a new domain, etc.).

### Week 1 — Foundations (install the loop)

| Day | Recall | Prompt | Deep Work (20 min) | Encode | Rest focus |
|-----|--------|--------|--------------------|--------|------------|
| 1 | Install Anki; make 3 cards | #1 | Read accessible source, active-reading protocol | 3 cards | Set fixed wake time |
| 2 | Review | #2 | Continue source; 3-pass Pass 1 on anything dense | 3 cards | No caffeine after 2pm |
| 3 | Review | #3 | Finish source; write 3-idea summary from memory | 4 cards | First 7–9 hr night, logged |
| 4 | Review | #11 | Learn Pomodoro; do 1 focused cycle on weak topic | 2 cards | 20-min walk break |
| 5 | Review | #18 | Feynman-explain Week-1 source to an LLM, fix gaps | 3 cards | Screens off 45 min pre-bed |
| 6 | Review | #19 | Light: tidy deck, fix any oversized cards | 2 cards | Aerobic exercise 30 min |
| 7 | Review | — | **Rest day** — no deep work | — | Full rest; reflect on Week 1 |

### Week 2 — Reasoning (add the thinking routines + memory palace)

| Day | Routine of the day | Prompt | Deep Work | Memory focus |
|-----|--------------------|--------|-----------|--------------|
| 8 | First-Principles | #3 | Apply it to a real design problem; log output | Read memory-palace section |
| 9 | Inversion | #12 | List 3 failure modes of your current project | Build your palace (10 stations) |
| 10 | Fermi | #15 | Estimate a quantity end-to-end (see Ch 4) | Place 5 facts in the palace |
| 11 | Steelman | #4 | Steelman a view you reject; write it convincingly | Walk the palace from memory |
| 12 | Calibrated forecast | #13 | Make 3 dated predictions w/ probabilities | Add major-system to a constant |
| 13 | All five in rotation | #20 | Dense technical chapter, 3-pass Pass 1–2 | Encode chapter into cards |
| 14 | — | — | **Rest day** | Reflect; review forecasts later |

### Week 3 — Range (mind-expanding + interleaving)

| Day | Prompt | Deep Work | Interleaving move |
|-----|--------|-----------|-------------------|
| 15 | #6 | Cross-domain primary source, active-reading protocol | Mix 2 topics in today's review |
| 16 | #7 | Find 3 analogies between your field and the source's | Shuffle card order, don't block |
| 17 | #22 | Creative recombination: design something that "shouldn't exist" | Interleave easy + hard cards |
| 18 | #9 | Identify an unasked question; sketch how you'd investigate it | — |
| 19 | #25 | Steelman the tech you're most skeptical of; LLM critiques you | Mix old + new material |
| 20 | #26 | Frontier prompt → 1-page written exploration | — |
| 21 | — | **Rest day** | Reflect on Week 3 |

### Week 4 — Integration (full loop on real target material + self-test)

| Day | Prompt | Deep Work | Self-testing |
|-----|--------|-----------|--------------|
| 22 | #27 | Research paper, 3-pass Pass 1 | — |
| 23 | #28 | Paper Pass 2 (body, figures) | Closed-book recall of Pass-1 claims |
| 24 | #16 | Paper Pass 3 on the key contribution | Re-derive a result from memory |
| 25 | #5 | Apply paper's idea to a problem you care about | Teach it to an LLM; it grades you |
| 26 | #21 | Mixed practice: routines + recall on weak spots | Take a Mock Test (see app) |
| 27 | #17 | Review every prediction from Day 12 — Brier check | Re-test the cards you fail most |
| 28 | #29 | Synthesize: write what changed in how you think | Full closed-book self-quiz |
| 29 | #30 | Plan Days 31+: which habits stay, which deck grows | Calibration review |
| 30 | — | **Graduation:** write your 30-day retrospective | Lock in the keepers |

> **Days 31+:** The only habits proven to *compound* are the ones you keep. Drop the scaffolding (the day cards) and keep the **engine**: daily Anki review, one deep source a week, the thinking routines, and the sleep protocol. That's the maintenance dose.

---

## Track It (or it didn't happen)

You can't improve what you don't measure. Keep a one-line daily log — a spreadsheet or a note. Three numbers, ten seconds:

```
  DATE | ANKI retention % | focused minutes | source read (y/n) | sleep hrs
  ─────┼──────────────────┼─────────────────┼───────────────────┼──────────
  Anki shows your retention % automatically. Watch it climb past ~85–90%.
  Focused minutes: trend matters more than any single day.
  Sleep hrs: if this dips, expect retention to dip 1–2 days later — proof rest is training.
```

| Metric | Where it comes from | Healthy trend |
|--------|--------------------|----------------|
| Retention % | Anki stats | Stabilizes 85–90%+ |
| Cards mature | Anki | Grows steadily, not in spikes |
| Focused minutes | Your timer | Up and consistent |
| Forecast Brier score | Your prediction log | Down over weeks (better calibration) |
| Sleep hours | Log / wearable | Steady 7–9, consistent timing |

---

## Common Failure Modes (and the fix)

| You're doing this | Why it fails | Fix |
|-------------------|--------------|-----|
| Importing huge premade decks | You dread review and quit | Make 2–4 of your *own* cards/day |
| Re-reading & highlighting | Feels productive, builds little (Dunlosky 2013) | Replace with closed-book recall |
| Skipping the rest day | Burnout erases the month's gains | Rest is scheduled — take it |
| Cutting sleep to study more | A tired brain learns ~40% less | Protect sleep first, then study |
| Passive AI use (read its answer) | It's re-reading in disguise | Write first, then let AI critique |
| Doing puzzle/brain-game apps | Near-zero far transfer (Owen 2010) | Train real skills: recall, reasoning, reading |
| Chasing 50 tips at once | Nothing becomes a habit | Run the *one* loop; change only the content |

---

## Chapter Summary

```
╔════════════════════════════════════════════════════════════════════╗
║  UPGRADE YOUR BRAIN IN 30 DAYS — ONE-PAGE PLAN                     ║
╠════════════════════════════════════════════════════════════════════╣
║  THE ENGINE: a ~45-min daily loop, run 30 times                   ║
║    RECALL (10) → PROMPT (5) → DEEP WORK (20) → ENCODE (10)         ║
╠════════════════════════════════════════════════════════════════════╣
║  WEEK 1 Foundations  install loop, build Anki deck, fix sleep      ║
║  WEEK 2 Reasoning    5 thinking routines + memory palace          ║
║  WEEK 3 Range        mind-expanding prompts + interleaving         ║
║  WEEK 4 Integration  real paper, full loop, self-test             ║
╠════════════════════════════════════════════════════════════════════╣
║  FIVE THINKING ROUTINES                                           ║
║    First-principles · Inversion · Fermi · Steelman · Forecast     ║
╠════════════════════════════════════════════════════════════════════╣
║  MEMORY STACK                                                     ║
║    Spaced repetition (daily engine) · Memory palace · Major sys   ║
║    · Elaboration + dual coding (default for new ideas)            ║
╠════════════════════════════════════════════════════════════════════╣
║  READING                                                          ║
║    1 dense source/week · active-reading protocol · 3-pass papers  ║
║    · retrieve after reading (NOT highlight/re-read)               ║
╠════════════════════════════════════════════════════════════════════╣
║  REST IS TRAINING                                                 ║
║    7–9 hr sleep, fixed wake time · naps 10–20 min · walks         ║
║    · aerobic 3×/wk · 1 full rest day/week                         ║
╠════════════════════════════════════════════════════════════════════╣
║  TRACK: retention % · focus minutes · sleep hrs · Brier score     ║
║  HONEST: no 15-point IQ jump; but real, compounding skill gains   ║
╚════════════════════════════════════════════════════════════════════╝
```

The science is in **[Chapter 5](05_brain_training.md)**; this chapter is the *program*. Run the loop, protect your sleep, and let 30 days of small, effortful, well-spaced reps compound.

---

**Previous:** [Chapter 05 — Brain Training & Memory](05_brain_training.md) &middot; **Next:** [Chapter 06 — Math Fundamentals](06_math_fundamentals.md) &middot; **See also:** [Chapter 04 — Aptitude & Mental Math](04_aptitude_mental_math.md) &middot; [Ch 00 Cheat Sheet](00_quick_reference_cheat_sheet.md)
