# Brain Training — Memory, Focus & Effective Learning

> Only strategies supported by peer-reviewed cognitive science and neuroscience research. No pseudoscience, no gimmicks.

---

## Table of Contents

| Part | Topic |
|------|-------|
| 1 | How Memory Works — The Science |
| 2 | The 5 Evidence-Based Study Techniques |
| 3 | Physical Foundation — Sleep, Exercise & Nutrition |
| 4 | Focus & Deep Work |
| 5 | Cognitive Biases That Sabotage Learning |
| 6 | Common Mistakes & Quick Reference |

---

# PART 1: HOW MEMORY WORKS

---

## The Three Stages of Memory

```
  ENCODING              STORAGE               RETRIEVAL
  (getting it in)       (keeping it)          (getting it out)

  ┌──────────┐      ┌──────────────┐      ┌────────────┐
  │ Sensory  │ ──>  │  Working     │ ──>  │ Long-Term  │
  │ Memory   │      │  Memory      │      │  Memory    │
  │ ~0.5 sec │      │  ~20-30 sec  │      │ Lifetime   │
  │          │      │  7 +/- 2     │      │ Unlimited  │
  │ 90%      │      │  items       │      │ capacity   │
  │ filtered │      └──────────────┘      └────────────┘
  └──────────┘            │                     ▲
                    Most is LOST here            │
                    unless you actively ──────────┘
                    transfer it
```

## The Forgetting Curve (Ebbinghaus, 1885)

```
  Without review, we forget at a predictable rate:

  100%|█████
     |████      After 20 min:  ~58% retained
     |███       After 1 hour:  ~44%
  50%|██        After 1 day:   ~34%
     |█         After 1 week:  ~25%
     |█         After 1 month: ~21%
   0%|─────────────────────────────>
     0    1h    1d    1w    1m

  This is why SPACED REVIEW exists — each review
  resets the curve and makes it decay slower.
```

## Neuroplasticity — Your Brain Physically Changes

```
Key facts supported by research:

1. Neurons that fire together WIRE together (Hebb's Rule, 1949)
   First time you solve a BFS problem: weak, slow connection
   10th time: strong, fast, almost automatic

2. Myelin sheath thickens around active pathways
   More myelin = signal travels up to 100x faster
   This is literally what "getting good" feels like

3. Neurogenesis — new neurons grow in the hippocampus
   Exercise is the #1 trigger via BDNF protein (Roig et al., 2012)
   Sleep consolidates these new connections

CHALLENGE SWEET SPOT (Yerkes-Dodson Law):
   If solving 60-80% correctly → optimal learning zone
   If > 95% → too easy, move to harder material
   If < 30% → too hard, build prerequisites first
```

---

# PART 2: THE 5 EVIDENCE-BASED STUDY TECHNIQUES

> Dunlosky et al. (2013) reviewed 10 common study techniques across 700+ studies. Only 2 were rated "high utility." Both are listed first below.

---

## 2.1 Active Recall (Retrieval Practice) — HIGH UTILITY

> **The single most effective study technique.** (Dunlosky et al., 2013; Karpicke & Blunt, 2011; Roediger & Butler, 2011)

```
WHAT: Close the book. Try to recall what you just learned from memory.
WHY:  Retrieval STRENGTHENS memory traces far more than re-reading.
      Testing yourself isn't just assessment — it IS the learning.

THE EVIDENCE:
  Karpicke & Blunt (2011): Students who used retrieval practice
  outperformed those who used elaborative concept mapping —
  even when the final test required making concept maps.

  Meta-analysis (Adesope et al., 2017, 272 studies):
  Retrieval practice had a medium-to-large effect (d = 0.50)
  across all age groups, content domains, and test types.
```

### How to Practice Active Recall

```
METHOD 1: BLANK PAGE
  After studying a topic, close everything.
  Write down everything you can remember on a blank page.
  Check what you missed. Study ONLY the gaps. Repeat.

METHOD 2: SELF-QUIZZING
  After each section, ask yourself:
  "What were the key ideas?"
  "Can I explain this without looking?"
  "What would I say if asked about this in an interview?"

METHOD 3: TEACH IT
  Explain the concept out loud as if teaching someone.
  Where you stumble = where your understanding has gaps.
  (This is the core of the Feynman Technique.)
```

---

## 2.2 Spaced Repetition — HIGH UTILITY

> **The best way to retain information long-term.** (Ebbinghaus, 1885; Cepeda et al., 2006; meta-analysis d = 0.54)

```
WHAT: Review material at increasing intervals instead of cramming.
WHY:  Each review resets the forgetting curve and makes it decay slower.
      After enough reviews, the memory becomes nearly permanent.

OPTIMAL SCHEDULE:
  ┌─────────────────────────────────────────────────────┐
  │  Review 1:  1 day after learning                     │
  │  Review 2:  3 days after Review 1                    │
  │  Review 3:  7 days after Review 2                    │
  │  Review 4:  14 days after Review 3                   │
  │  Review 5:  30 days after Review 4                   │
  │  Then:      60 days, 120 days... (intervals grow)    │
  │                                                      │
  │  TOOLS: Anki (free, gold standard), Quizlet          │
  │  TIME:  10-15 min/day is enough for massive results  │
  └─────────────────────────────────────────────────────┘

GOOD FLASHCARD RULES:
  - One idea per card (atomic)
  - Use YOUR OWN words, not copy-paste
  - Add "why" not just "what"
  - Bad:  "What is ReLU?" → "max(0,x)"
  - Good: "Why does ReLU help with vanishing gradients?"
          → "Gradient is 1 for x>0 (doesn't shrink through layers)"
```

---

## 2.3 The Feynman Technique — Learn by Teaching

> Named after physicist Richard Feynman. "If you can't explain it simply, you don't understand it well enough."

```
STEP 1: Study the topic
STEP 2: Explain it in simple terms, as if teaching a child
STEP 3: Identify where you stumble or get vague — those are gaps
STEP 4: Go back to the source and fill in ONLY the gaps
STEP 5: Repeat until the explanation is smooth and complete

WHY IT WORKS:
  - Forces deep processing (elaborative encoding)
  - Exposes illusion of competence (you think you know it until you try)
  - Produces durable memories through active generation

EXAMPLE:
  Instead of: "I studied Transformers"
  Try:        "A Transformer processes all tokens in parallel using
               self-attention. Each token asks 'who matters to me?'
               via Query-Key dot products, then takes a weighted
               sum of Values. Multi-head means running this in
               parallel with different projections to capture
               different types of relationships..."
  Where you stumble = what to study next.
```

---

## 2.4 Interleaving — Mix Your Topics

> **Moderate utility.** (Rohrer & Taylor, 2007; Pan et al., 2019)

```
WHAT: Alternate between different topics/problem types during study.
WHY:  Forces the brain to distinguish BETWEEN concepts, not just
      recognize them. Builds the "which technique applies HERE?" skill.

BLOCKED PRACTICE (less effective):
  Study: Trees Trees Trees Trees → Graphs Graphs Graphs

INTERLEAVED PRACTICE (more effective):
  Study: Trees → DP → Graphs → Trees → DP → Graphs

THE EVIDENCE:
  Interleaving feels HARDER and SLOWER — but produces
  significantly better long-term retention and transfer.
  (Pan et al., 2019 meta-analysis, d = 0.42)

  This is why LeetCode-style practice (random topics)
  works better than doing 50 tree problems in a row.
```

---

## 2.5 Elaborative Interrogation — Ask "WHY?"

> **Moderate utility.** (Dunlosky et al., 2013)

```
WHAT: For every fact, ask "WHY is this true?" and answer it.
WHY:  Connects new information to existing knowledge.
      Creates richer, more retrievable memory traces.

EXAMPLE:
  Fact:    "Batch normalization stabilizes training."
  Ask WHY: "Because it normalizes each layer's input to
           zero mean and unit variance, preventing
           the distribution from shifting as weights change
           (internal covariate shift). This lets you use
           higher learning rates without diverging."

  You now understand the mechanism, not just the fact.
  The interview answer writes itself.

FACT ALONE:  Stored as isolated data. Easy to forget.
FACT + WHY:  Connected to causal understanding. Durable.
```

---

## Techniques That DON'T Work (Despite Popularity)

| Technique | Rating | Why It Fails |
|-----------|--------|-------------|
| **Re-reading** | LOW utility | Creates familiarity, not retrievable memory. Feels productive, isn't. |
| **Highlighting** | LOW utility | Passive marking ≠ understanding. No generation, no retrieval. |
| **Summarizing** | LOW utility | Only works if you do it from memory (then it's active recall). |
| **Cramming** | LOW utility | Rapid forgetting after 1-2 days. Zero long-term retention. |
| **"Learning Pyramid"** | MYTH | The 10%/20%/90% retention numbers are fabricated. No study ever produced them. (Letrud, 2012) |

---

# PART 3: THE PHYSICAL FOUNDATION

---

## 3.1 Sleep — The Non-Negotiable

> Sleep is when memory consolidation happens. There is no substitute. (Walker, 2017; Diekelmann & Born, 2010)

```
WHAT SLEEP DOES FOR LEARNING:
  1. Moves memories from short-term (hippocampus) to long-term (cortex)
  2. Strengthens neural connections formed during the day
  3. Clears toxic waste proteins via the glymphatic system
  4. Processes and organizes new information

THE DATA:
  6 hours/night for 2 weeks = cognitive impairment equivalent
  to being legally drunk. And subjects DON'T REALIZE they're
  impaired — they rate themselves as "fine." (Van Dongen et al., 2003)

SLEEP RULES:
  - 7-9 hours (non-negotiable for peak cognition)
  - Consistent schedule (same time every day, including weekends)
  - No caffeine after early afternoon (half-life: 5-6 hours)
  - Cool room: 18-20°C / 65-68°F
  - Study BEFORE sleep — brain consolidates what was last active
  - Naps: 20 min for alertness, 90 min for memory consolidation
```

---

## 3.2 Exercise — The Best Cognitive Enhancer

> More effective than any supplement or brain game for cognition. (Hillman et al., 2008; Roig et al., 2012)

```
WHAT EXERCISE DOES TO YOUR BRAIN:
  1. Increases BDNF (brain-derived neurotrophic factor)
     → grows new neurons in the hippocampus (memory center)
  2. Increases cerebral blood flow → better oxygen and nutrients
  3. Reduces cortisol (stress hormone that impairs memory)
  4. Boosts dopamine, serotonin, norepinephrine → better mood and focus

MINIMUM EFFECTIVE DOSE:
  - 150 min moderate exercise/week (brisk walking counts)
  - OR 75 min vigorous exercise (running, HIIT, swimming)
  - Cardio has the strongest evidence for cognitive benefits
  - Strength training also helps (executive function)

TIMING TIP:
  Exercise BEFORE a study session.
  Acute exercise boosts learning for 2-3 hours after.
  (Roig et al., 2012 meta-analysis of 29 studies)
```

---

## 3.3 Nutrition — Essential Brain Fuel

```
Your brain is 2% of body weight but uses 20% of energy.

KEY NUTRIENTS:
  Omega-3 (DHA) — brain is 60% fat, DHA is the primary structural fat
    Sources: fatty fish, walnuts, flaxseed
  Choline — precursor to acetylcholine (memory neurotransmitter)
    Sources: eggs, liver
  Water — even 2% dehydration impairs attention and working memory

WHAT HURTS:
  - Excess sugar (inflammation, impairs hippocampus)
  - Chronic alcohol (directly toxic to neurons)
  - Skipping meals (brain needs steady glucose)
```

---

## 3.4 Dopamine & Motivation — The Core Principle

> Dopamine is the MOTIVATION chemical, not the pleasure chemical. It drives pursuit of goals. (Berridge & Robinson, 1998)

```
THE ONE RULE THAT MATTERS:

  Don't burn your dopamine on easy activities BEFORE hard work.

  BAD:  Phone scrolling + social media + YouTube → then try to study
        Result: dopamine depleted, studying feels like torture

  GOOD: Hard work FIRST (morning, fresh) → easy activities AFTER
        Result: natural motivation, studying feels manageable

WHY:
  High-dopamine activities (social media, games) set your
  baseline high. Studying can't compete. Everything after
  feels boring by comparison.

  Low-dopamine start (quiet morning, no phone) means
  studying IS the most stimulating thing available.
  Your brain engages because there's nothing better.
```

---

# PART 4: FOCUS & DEEP WORK

---

## The Pomodoro Technique

```
25 min focused work → 5 min break → repeat
After 4 cycles: take a 15-30 min break

WHY IT WORKS:
  - Time-boxing reduces procrastination (commit to just 25 min)
  - Breaks prevent fatigue and maintain attention quality
  - Structure creates rhythm and momentum

AS YOU IMPROVE: extend to 50 min work / 10 min break.
ADVANCED: 90-120 min deep blocks (matches natural focus cycle).
```

## Flow State — The Peak Performance Zone

> (Csikszentmihalyi, 1990; verified by neuroimaging studies)

```
Flow = complete absorption where time disappears and performance peaks.

THE 4 REQUIREMENTS (all needed):
  1. CHALLENGE-SKILL BALANCE — task ~4% harder than current skill
  2. CLEAR GOAL — know exactly what "done" looks like
  3. IMMEDIATE FEEDBACK — see if you're on track moment-to-moment
  4. UNINTERRUPTED FOCUS — 90-120 min minimum (flow takes 15 min to enter)

PRACTICAL:
  - Phone in another room (not just silent — AWAY)
  - Close all tabs except what you need
  - Write ONE goal for this session before starting
  - Push through the first 15 min of resistance — flow comes after

FLOW CYCLE:
  STRUGGLE (frustration, confusion) → RELEASE (step back) →
  FLOW (effortless performance) → RECOVERY (rest, sleep)

  Most people quit during STRUGGLE. That's the entry fee.
```

## Context-Switching Cost

```
After an interruption, it takes ~23 MINUTES to fully regain deep focus.
(Gloria Mark, UC Irvine)

10 interruptions/day = nearly 4 HOURS lost to context-switching.

DEFENSE:
  - Block 2-hour focus windows on your calendar
  - Batch shallow work (email, Slack) into specific time slots
  - Use "Do Not Disturb" mode ruthlessly
```

---

# PART 5: COGNITIVE BIASES THAT SABOTAGE LEARNING

```
┌──────────────────────────┬────────────────────────────────────────┐
│ BIAS                     │ HOW IT HURTS YOU & THE FIX              │
├──────────────────────────┼────────────────────────────────────────┤
│ DUNNING-KRUGER EFFECT    │ Beginners overestimate their skill.     │
│                          │ "I read the chapter, I get it."         │
│                          │ FIX: Test yourself WITHOUT notes.       │
│                          │ If you can't explain it, you don't      │
│                          │ understand it.                          │
├──────────────────────────┼────────────────────────────────────────┤
│ ILLUSION OF COMPETENCE   │ Re-reading feels like learning.         │
│                          │ Highlighting feels productive.          │
│                          │ Neither creates retrievable memory.     │
│                          │ FIX: Active recall, not re-reading.     │
├──────────────────────────┼────────────────────────────────────────┤
│ PLANNING FALLACY         │ Everything takes 3x longer than you     │
│                          │ estimate. Always.                       │
│                          │ FIX: "How long did similar tasks take   │
│                          │ in the past?" Use that, not your gut.   │
├──────────────────────────┼────────────────────────────────────────┤
│ SUNK COST FALLACY        │ "I've spent 3 weeks on this approach,   │
│                          │ I can't switch now." Yes you can.       │
│                          │ FIX: "If starting fresh today, would I  │
│                          │ choose this approach?" If no, switch.   │
└──────────────────────────┴────────────────────────────────────────┘
```

---

# PART 6: COMMON MISTAKES & QUICK REFERENCE

---

## 10 Mistakes That Kill Learning

| Mistake | Fix |
|---------|-----|
| Re-reading instead of testing yourself | Active recall — close the book, write what you remember |
| Highlighting everything | Write notes in your own words instead |
| Cramming before the exam | Space it out over weeks (spaced repetition) |
| Multitasking while studying | Single-task. Phone in another room. |
| Studying only easy material | Study what you're BAD at (deliberate practice) |
| Not sleeping enough | 7-9 hours. Memory consolidation fails without sleep. |
| Learning without applying | Build a project. Solve problems. Apply immediately. |
| Tutorial hell (passive watching) | After 1 tutorial, build something solo |
| No review system | Use Anki. 10 min/day. The compound interest of learning. |
| Comparing yourself to others | Compare to YOU from 3 months ago. Different paths. |

---

## Quick Reference

```
┌────────────────────────────────────────────────────────────────┐
│  EVIDENCE-BASED LEARNING CHEAT SHEET                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  THE BIG 5 TECHNIQUES (sorted by evidence strength):           │
│  1. Active Recall — test yourself, don't re-read               │
│  2. Spaced Repetition — review at 1d, 3d, 7d, 14d, 30d       │
│  3. Feynman Technique — explain it simply to find gaps         │
│  4. Interleaving — mix topics during study sessions            │
│  5. Elaboration — ask "WHY?" for every fact                    │
│                                                                │
│  NEUROPLASTICITY:                                              │
│  Challenge sweet spot = 60-80% success rate                    │
│  Neurons that fire together wire together (Hebb's Rule)        │
│  Effort + Sleep + Exercise = maximum neural rewiring           │
│                                                                │
│  PHYSICAL FOUNDATION:                                          │
│  Sleep 7-9 hrs — memory consolidation happens here             │
│  Exercise 20+ min — BDNF, blood flow, cortisol reduction      │
│  Hydrate — 2% dehydration impairs attention                    │
│  Hard work FIRST, easy dopamine AFTER                          │
│                                                                │
│  FOCUS:                                                        │
│  Pomodoro: 25 min focus / 5 min break (build to 50/10)        │
│  Flow needs: challenge + clear goal + feedback + no interrupt  │
│  Context-switch cost: 23 min to regain deep focus              │
│  Phone AWAY, not just silent                                   │
│                                                                │
│  BIASES TO WATCH:                                              │
│  Dunning-Kruger — test yourself, don't assume understanding    │
│  Illusion of competence — active recall, not re-reading        │
│  Planning fallacy — multiply your time estimate by 3           │
│                                                                │
│  IF OVERWHELMED, START WITH JUST THREE THINGS:                 │
│  1. Fix your sleep (7-9 hours, consistent schedule)            │
│  2. Start Anki (10 min/day of spaced repetition)              │
│  3. Use active recall (close the book, write from memory)      │
│  That's it. Add more later.                                    │
└────────────────────────────────────────────────────────────────┘
```

---

**Back to Start:** [README — Table of Contents](README.md)
