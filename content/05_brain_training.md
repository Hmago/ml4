# Chapter 5 — Brain Training: Memory, Focus & Effective Learning

> Only strategies supported by peer-reviewed cognitive science and neuroscience research. No pseudoscience, no gimmicks. Every claim cites a primary source you can verify.

This chapter is a meta-skill toolkit. The other chapters teach you machine learning; this one teaches you how to *learn machine learning* (or anything else) faster, deeper, and more durably. The frameworks below are drawn from cognitive science (Ebbinghaus, Bjork, Sweller, Paivio), neuroscience (Hebb, Draganski, Erickson), behavior change (Gollwitzer, Clear, Duhigg), and clinical psychology (Cuijpers, Beck) — and updated with the **2026 AI-tutor reality**: Gemini Notebook (called NotebookLM until July 2026), Khanmigo, Anki + LLM workflows, Socratic dialogue with frontier models, and the 2025 evidence on when AI help turns into a crutch.

---

## What You'll Learn

By the end of this chapter you'll be able to:

- Diagnose **why** something you studied last week feels gone today (it's not your fault — it's the forgetting curve, §5.1).
- Pick the **right technique** for the task: active recall vs spaced repetition vs deliberate practice (§5.2).
- Apply **desirable difficulties** and **Cognitive Load Theory** to design a study session for hard ML topics (§5.3).
- Use **chunking, dual coding and mnemonics** — and know when they don't help (§5.4).
- Build a **note-taking system** that compounds (Cornell, Zettelkasten — §5.5).
- Know why **sleep and exercise** matter for memory and focus (§5.6–§5.7), and protect **deep work** (§5.8).
- Engineer **habits** that survive bad days using implementation intentions and identity-based change (§5.9).
- Counter **demotivation and low mood** with evidence-based behavioural strategies — and know when to get help (§5.10).
- Use **AI tutors** (Gemini Notebook, Khanmigo, Claude/GPT) the way a 2026 top student does — without letting them do your thinking (§5.11).
- Recognise the **myths** (learning styles, Mozart effect, brain-training apps) most candidates still believe (§5.12).
- Apply this whole stack specifically to **ML and DSA interview prep** (§5.13–§5.15).

---

## 5.1 How Memory Works — The Science

> **Memory** isn't a single thing. It's a multi-stage pipeline: information passes through sensory memory, into working memory, and only some of it is consolidated into long-term memory. Most of what you "study" never makes it past stage 2.

![Infographic of how memory works: sensory memory under 1 s, attention into working memory of about 4 chunks lasting seconds, encode into long-term memory with no known capacity limit, most information lost unless actively encoded; Ebbinghaus 1885 savings bars 58% at 20 min, 44% at 1 hour, 34% at 1 day, 25% at 6 days, 21% at 31 days; toy model R = e^(-t/S) where spacing 5 sessions over days 0, 1, 3, 7, 14 keeps 70% at day 30 versus 0% for cramming, which wins day 1 with 75% versus 37%.](diagrams/brain05_info_memory_pipeline_ai.png)

<details>
<summary><strong>Read as text</strong> — the key numbers: 4 chunks, and two-thirds gone after a day</summary>

> **Key number:** working memory holds only about **4 chunks** at once (Cowan, 2001), and one day after learning a list Ebbinghaus had to redo about **two-thirds** of the original study work to relearn it (1885).

</details>

### The three-stage model (Atkinson & Shiffrin, 1968)

<details>
<summary><strong>Read as text</strong> — the office analogy, the three stores and three details</summary>

Think of a busy office: sensory memory is everyone walking past the door, working memory is the few people you can talk to at your desk right now, and long-term memory is the archive. Only what you deliberately "file" reaches the archive.

```
   ENCODING                 STORAGE                  RETRIEVAL
   (getting it in)          (keeping it)             (getting it out)

   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
   │ SENSORY      │ atten-│ WORKING      │ encode│ LONG-TERM    │
   │ MEMORY       │ tion  │ MEMORY       │       │ MEMORY       │
   │              │ ────> │              │ ────> │              │
   │ < 1 s (sight)│       │ ~4 chunks    │       │ no known     │
   │ a few s      │       │ (Cowan 2001; │       │ capacity     │
   │ (sound)      │       │ Miller 1956: │       │ limit; can   │
   │              │       │ "7 ± 2")     │       │ last a       │
   │ most of it   │       │              │       │ lifetime     │
   │ is never     │       │ lasts seconds│       │              │
   │ noticed      │       │ unless       │       │              │
   │              │       │ rehearsed    │       │              │
   └──────────────┘       └──────┬───────┘       └──────────────┘
                                 │
                                 ▼
                      most info is LOST here unless you
                      actively encode it (recall it, explain
                      it, connect it, space the reviews)
```

Three details worth knowing for an interview-prep brain:

| Idea | What the research says |
|---|---|
| **Working memory** | Atkinson & Shiffrin called the middle box the *short-term store*. Baddeley & Hitch (1974) reframed it as **working memory** — an active workspace where you hold *and manipulate* ideas (e.g. tracing a recursion in your head), not just a waiting room. |
| **Capacity: 7 or 4?** | Miller (1956) popularised "the magical number seven, plus or minus two". Cowan (2001), reviewing tasks where people cannot rehearse or regroup items, put the real limit at about **3–5 chunks**. A *chunk* is any unit you already know: a phone number is hard as 10 separate digits but easy as 3 chunks (415 · 555 · 0134). |
| **How long without rehearsal?** | Seconds. In Peterson & Peterson (1959), recall of three-consonant strings fell from about 80% after 3 s to under 10% after 18 s when people had to count backwards (so they could not rehearse). |

</details>

### The forgetting curve (Ebbinghaus, 1885)

<details>
<summary><strong>Read as text</strong> — Ebbinghaus's savings curve, what it means and the toy model</summary>

Hermann Ebbinghaus learned lists of 13 nonsense syllables until he could recite them perfectly twice, then relearned them after a delay and measured the **time he saved** the second time. That *savings* score is his memory measure: 100% = nothing forgotten, 0% = start from scratch.

```
   Savings (share of the original learning still 'in there')

   20 min  █████████████████████████████                       58%
   1 hour  ██████████████████████                              44%
   9 hours ██████████████████                                  36%
   1 day   █████████████████                                   34%
   2 days  ██████████████                                      28%
   6 days  ████████████                                        25%
   31 days ██████████                                          21%
           0%          25%         50%         75%        100%
```

What to take from it:

1. **Forgetting is fastest right after learning, then slows.** More than half the work was lost within an hour; between day 6 and day 31 only a few more points went. So the first review should come soon — within about a day.
2. **It is a worst case.** Nonsense syllables have no meaning to hook onto; material you understand and connect fades more slowly. The curve itself is solid: a 2015 replication found the same shape (Murre & Dros, *PLoS ONE*).
3. **Each successful review makes the next decline slower.** That is the whole idea behind spaced repetition (§5.2.2).

**Toy model — spacing vs cramming.** A common way to model one memory is $R = e^{-t/S}$: the chance of recall *R* falls with time *t* since your last review, and the *stability* *S* (in days) says how slowly you forget. Spaced-repetition schedulers build on the same idea: FSRS, the modern scheduler available in Anki, gives every card a stability and fits its forgetting curve (a power curve rather than this simple exponential) to your own review history (§5.11). The program below adds one assumption: a review raises *S* more when you had forgotten more (*R* was lower). It places the **same five study sessions** two ways — crammed into one evening, or spread over two weeks. The numbers are illustrative, **not study results**.

</details>

```python
# Toy model: the same 5 study sessions, cramming vs spacing (NOT study data)
import math

def recall(sessions, test_day, s0=1.0, base=1.3, gain=3.0):
    """Forgetting curve R = exp(-t/S). A review multiplies stability S by
    base + gain * (1 - R): the more you had forgotten, the bigger the boost."""
    done = [d for d in sessions if d < test_day]
    s, last = s0, done[0]
    for day in done[1:]:
        r = math.exp(-(day - last) / s)
        s *= base + gain * (1 - r)
        last = day
    return math.exp(-(test_day - last) / s), s

schedules = {
    "spaced: days 0,1,3,7,14": [0, 1, 3, 7, 14],
    "cram: 5x on night 0":     [0, 0.02, 0.04, 0.06, 0.08],
    "study once":              [0],
}
print("TOY MODEL: R = exp(-t/S), S in days")
print(f"{'schedule':<25}{'R day 1':>8}{'R day 30':>9}{'S day 30':>9}")
r30 = {}
for name, days in schedules.items():
    r1, _ = recall(days, 1)
    r30[name], s = recall(days, 30)
    print(f"{name:<25}{r1:>8.0%}{r30[name]:>9.0%}{s:>8.0f}d")

assert r30["spaced: days 0,1,3,7,14"] > 0.5 > r30["cram: 5x on night 0"]
```

**Output:**

```
TOY MODEL: R = exp(-t/S), S in days
schedule                  R day 1 R day 30 S day 30
spaced: days 0,1,3,7,14       37%      70%      45d
cram: 5x on night 0           75%       0%       3d
study once                    37%       0%       1d
```

<details>
<summary><strong>Read as text</strong> — continued: cramming wins tomorrow, spacing wins the month</summary>

Read it like this: **cramming wins the next morning** (75% vs 37%) — which is exactly why it *feels* like it works. **A month later the spaced learner keeps about 70% and the crammer almost nothing**, because each spaced review happened after some forgetting and so raised stability far more. Real data are less extreme than this toy, but point the same way (spaced vs massed retrieval practice: *g* = 0.74, Latimier et al., 2021 — §5.2.2).

</details>

### Neuroplasticity — your brain physically changes

<details>
<summary><strong>Read as text</strong> — Hebbian learning, myelin, structural change and the 85% rule</summary>

```
   Three mechanisms with solid evidence:

   1. HEBBIAN LEARNING (Hebb, 1949)
      Hebb's idea: when cell A repeatedly helps fire cell B, the
      A→B connection gets stronger. The slogan "cells that fire
      together wire together" came later (Löwel & Singer; Shatz, 1992).
      First time you trace a BFS:    slow, effortful.
      Tenth time:                    fast, near-automatic.

   2. MYELINATION
      Myelin insulates axons; myelinated axons conduct signals
      far faster (roughly 1 m/s unmyelinated vs up to ~100 m/s).
      In mice, learning a new motor skill needs NEW myelin-making
      cells (McKenzie et al., 2014, Science).

   3. STRUCTURAL CHANGE
      3 months of juggling practice → grey matter grew in
      visual-motion areas, then shrank back after practice
      stopped (Draganski et al., 2004, Nature). Use it or lose it.
      Aerobic exercise for 1 year → hippocampus ~2% larger in
      older adults (Erickson et al., 2011) — see §5.6 and Ch 5B.
      New neurons in the ADULT human hippocampus? Debated for
      years; a 2025 study found dividing neural progenitor cells
      in adults (Dumitru et al., Science) — how much they matter
      for memory is still unknown.

   THE CHALLENGE SWEET SPOT — the "85% rule":
      Wilson et al. (2019, Nature Communications) showed that
      learning algorithms trained by gradient descent learn
      fastest when about 15% of answers are wrong (~85% right).
      A useful rule of thumb for people too — not a law:
      ▸ about 85% right   →  sweet spot: keep going
      ▸ ~100% right       →  too easy; make it harder or move on
      ▸ mostly wrong      →  too hard; fill a prerequisite first
```

</details>

---

## 5.2 The Big Six Evidence-Based Techniques

> Dunlosky et al. (2013, *Psychological Science in the Public Interest*) reviewed the evidence for **10 popular study techniques** and rated each one's utility. Only **two** were rated "high utility" — and both lead this list.

![Infographic comparing the two high-utility techniques from Dunlosky et al. 2013: a tier list of 10 study techniques (high: practice testing, distributed practice; moderate: elaborative interrogation, self-explanation, interleaved practice; low: summarisation, highlighting, keyword mnemonic, imagery for text, rereading); an active recall loop study, close the book, write what you remember, check the gaps, with classroom quizzing g about 0.50; a spaced repetition timeline with reviews on days 1, 4, 11, 25, 55, 115 and spaced vs massed g = 0.74; the rule of thumb gap of 10 to 20 percent of the time until you need it; and a toy daily-load table where 10 new cards a day grows to 70 cards in about 9 min and 20 a day to 140 cards in about 19 min.](diagrams/brain05_info_retrieval_and_spacing_ai.png)

<details>
<summary><strong>Read as text</strong> — the key number, effect sizes and Dunlosky's ratings</summary>

> **Key number:** quizzing yourself raises real classroom results by *g* ≈ 0.50 (Yang et al., 2021: 222 studies, 48,478 students). In plain words: the average student who practised with quizzes scored higher than about 69% of the comparison group.

*An effect size* (Hedges' *g* or Cohen's *d*) *is the gap between two groups measured in standard deviations: about 0.2 is small, 0.5 medium, 0.8 large.*

| Dunlosky rating | Techniques | Where in this chapter |
|---|---|---|
| **High** | Practice testing · Distributed practice | §5.2.1 Active recall · §5.2.2 Spaced repetition |
| **Moderate** | Elaborative interrogation · Self-explanation · Interleaved practice | §5.2.5 · §5.2.3 (the Feynman technique builds on self-explanation) · §5.2.4 |
| **Low** | Summarisation · Highlighting/underlining · Keyword mnemonic · Imagery for text · Rereading | Helpers only — fine for a first pass, never the main method (§5.4) |

"Low utility" does not mean useless: these techniques helped only for some materials, some learners or short delays. **Deliberate practice** (§5.2.6) was not part of Dunlosky's review — it comes from expertise research and is about *skills* (coding, system design) rather than facts.

</details>

### 5.2.1 Active Recall (Retrieval Practice) — HIGH UTILITY

<details>
<summary><strong>Read as text</strong> — why retrieval works and three ways to do it</summary>

> The most effective study technique for durable memory. Karpicke & Blunt (2011, *Science*): practising retrieval beat building concept maps on a test one week later. Adesope et al. (2017) meta-analysed 272 effect sizes: practice tests beat restudying and every other comparison. Yang et al. (2021) found the same in real classrooms (*g* ≈ 0.50).

```
   WHAT: Close the book. Try to retrieve what you just learned from memory.
   WHY:  Retrieval STRENGTHENS memory traces far more than re-reading.
         Testing yourself isn't just assessment — it IS the learning.

   THREE METHODS:

   1. BLANK PAGE
      After studying, close everything.
      Write what you remember on a blank page.
      Check what you missed. Study only the gaps. Repeat.

   2. SELF-QUIZZING
      "What were the key ideas?"
      "Can I explain this without looking?"
      "What would I say if asked about this in an interview?"

   3. TEACH IT (the Feynman Technique — see 5.2.3)
      Explain out loud as if teaching someone unfamiliar.
      Where you stumble = where your understanding has gaps.

   ALWAYS CHECK THE ANSWER afterwards — corrective feedback is
   one of the factors that makes quizzing work better
   (Yang et al., 2021).
```

</details>

### 5.2.2 Spaced Repetition — HIGH UTILITY

<details>
<summary><strong>Read as text</strong> — the evidence, the 10–20% rule, a schedule and flashcard rules</summary>

> The best way to retain information long-term. Ebbinghaus (1885) first showed it; Cepeda et al. (2006) reviewed 839 assessments from 317 experiments; Latimier et al. (2021) found spaced retrieval practice beat massed retrieval practice by *g* = 0.74.

> **Rule of thumb:** space reviews at roughly **10–20% of the time until you need the knowledge**. Cepeda et al. (2008, more than 1,350 people) found the best gap was 20–40% of a 1-week test delay and 5–10% of a 1-year delay. For an interview 8 weeks away, that means reviewing each topic about once a week.

```
   WHAT: Review at increasing intervals instead of cramming.
   WHY:  Each successful review slows the next decline
         (see the toy model in §5.1).

   A TYPICAL EXPANDING SCHEDULE (a rough guide — FSRS
   personalises the gaps for every card, §5.11):
      Review 1: 1 day after learning
      Review 2: 3 days after Review 1
      Review 3: 7 days after Review 2
      Review 4: 14 days after Review 3
      Review 5: 30 days after Review 4
      Then:     60 d → 120 d → ...

   DOES THE EXPANDING PATTERN MATTER? Less than you'd think:
   expanding vs equal gaps showed no significant difference
   overall (Latimier et al., 2021). Spacing at all is what counts.

   TOOLS: Anki (free; the FSRS scheduler is built in since
          Anki 23.10 — switch it on in deck options), RemNote, Mochi.
   TIME:  10 new cards/day ≈ 70 cards/day ≈ 9 min once the
          schedule fills up (toy estimate below).

   GOOD FLASHCARD RULES (from Wozniak's "20 rules", 1999):
      ▸ Don't memorise what you don't understand (rule 1).
      ▸ One idea per card (the "minimum information principle").
      ▸ Use YOUR words and examples, not copy-paste.
      ▸ Add the WHY, not just the WHAT.
      Bad:   Q: "What is ReLU?" A: "max(0,x)"
      Good:  Q: "Why does ReLU help with vanishing gradients?"
             A: "Its gradient is 1 for x>0, so it doesn't shrink
                 as you backprop through many layers."
```

**How much daily time does that cost?** With the schedule above, a card you add today comes back on days 1, 4, 11, 25, 55 and 115 (the gaps added up). Once the schedule fills up, every day holds one batch of cards at each of those 6 stages, so **daily cards ≈ new cards per day × (1 + 6)**. The toy estimate below ignores forgotten cards (which add extra reviews) and assumes about 8 seconds per card — check your own Anki statistics for your real number.

</details>

```python
# Review-load estimate: what N new cards/day costs you later (toy schedule, not Anki's)
gaps = [1, 3, 7, 14, 30, 60]          # days between reviews (the schedule above)
review_offsets = []                   # days after learning when each review falls
day = 0
for g in gaps:
    day += g
    review_offsets.append(day)        # 1, 4, 11, 25, 55, 115

def daily_cards(new_per_day, on_day):
    """Cards due on `on_day` if you add new_per_day cards every day from day 0."""
    reviews = sum(new_per_day for off in review_offsets if on_day - off >= 0)
    return new_per_day + reviews

sec_per_card = 8                      # assumption: check your own Anki stats
print(f"review offsets (days after learning): {review_offsets}")
for new in (10, 20):
    for d in (7, 30, 120):
        n = daily_cards(new, d)
        print(f"{new} new/day, day {d:>3}: {n:>3} cards ~ {n * sec_per_card / 60:.0f} min")

assert daily_cards(20, 120) == 20 * (1 + len(gaps))   # steady state = new x (1 + reviews)
```

**Output:**

```
review offsets (days after learning): [1, 4, 11, 25, 55, 115]
10 new/day, day   7:  30 cards ~ 4 min
10 new/day, day  30:  50 cards ~ 7 min
10 new/day, day 120:  70 cards ~ 9 min
20 new/day, day   7:  60 cards ~ 8 min
20 new/day, day  30: 100 cards ~ 13 min
20 new/day, day 120: 140 cards ~ 19 min
```

<details>
<summary><strong>Read as text</strong> — continued: the review load keeps growing for months</summary>

The trap this shows: the load **keeps growing for months** after you start. Twenty new cards a day feels like 8 minutes in week 1 but becomes about 19 minutes by month 4. Pick your new-cards-per-day for the load you can sustain at steady state, not for how week 1 feels.

</details>

### 5.2.3 The Feynman Technique — Learn by Teaching

> Named after physicist Richard Feynman, famous for explaining hard ideas simply. The popular line "If you can't explain it simply, you don't understand it" has no known source (it is also pinned on Einstein). The documented story: Feynman once tried to prepare a freshman-level lecture on a hard topic, failed, and concluded, "That means we really don't understand it" (Goodstein, 1989). The four-step "technique" is a modern summary; its evidence base is **self-explanation** (Dunlosky et al.: moderate utility) and **learning by teaching** (Fiorella & Mayer, 2013).

![Infographic of four more study techniques in a 2 by 2 grid: the Feynman technique (explain to a 12-year-old, spot where you stumble, fix only that gap, repeat); interleaving (blocked T T T T G G G G versus mixed T D G T D G, g = 0.42 overall and 0.34 for maths); asking why twice (BatchNorm stabilises training, normalises over the mini-batch with learned gamma and beta, smoother loss landscape per Santurkar 2018); and deliberate practice (specific goal, full focus, fast feedback, stretch zone about 85 percent right, plus a coach). Bars show deliberate practice explains 26 percent of performance differences in games, 21 in music, 18 in sports, 4 in education and under 1 in professions (Macnamara 2014).](diagrams/brain05_info_four_more_techniques_ai.png)

<details>
<summary><strong>Read as text</strong> — the five steps, why it works and the AI-crutch warning</summary>

```
   STEP 1: Study the topic.
   STEP 2: Explain it as if to a curious 12-year-old.
   STEP 3: Notice where you stumble or hand-wave — those are gaps.
   STEP 4: Go back to the source for ONLY the gap.
   STEP 5: Repeat until the explanation is smooth and complete.

   WHY IT WORKS:
      ▸ Forces deep processing (elaborative encoding).
      ▸ Exposes the illusion of competence.
      ▸ Produces durable memories through active generation.

   2026 UPGRADE — explain it to an AI:
      Open Claude or Gemini Notebook. Type YOUR explanation first.
      Ask: "Where am I being vague? Where would a senior
            interviewer push back?" The AI plays the
            Socratic interlocutor for free, on demand.
      Rule: the AI asks, YOU answer. Never let it write the
            explanation for you (see the warning below).
```

**Warning — AI as a crutch.** In a 2025 field experiment with high-school maths students, plain GPT-4 access raised practice scores by 48%, but on the later exam *without* AI those students scored 17% lower than students who never had it. A tutor version that gave hints instead of answers largely removed the harm (Bastani et al., *PNAS* 2025). More on using AI well in §5.11.

</details>

### 5.2.4 Interleaving — Mix Your Topics

<details>
<summary><strong>Read as text</strong> — blocked vs mixed practice, why it works and a compromise</summary>

> Moderate utility (Dunlosky et al., 2013). Rohrer & Taylor (2007) showed it with maths problems; Brunmair & Richter (2019) meta-analysed 59 studies: *g* = 0.42 overall and 0.34 for maths problems — but **blocking won for learning word lists** (*g* = −0.39).

```
   BLOCKED PRACTICE (less effective):
      Study: Trees Trees Trees Trees → Graphs Graphs Graphs Graphs

   INTERLEAVED PRACTICE (more effective):
      Study: Trees → DP → Graphs → Trees → DP → Graphs

   WHY:  Forces the brain to distinguish BETWEEN concepts,
         not just recognise them. Builds the "which technique
         applies here?" skill — the actual interview test.
         Helps most when the categories look alike
         (BFS vs DFS vs Dijkstra problems).

   FEELS:
      Slower and harder. That's the point — interleaving is a
      "desirable difficulty" (see 5.3). Pain in the moment,
      durable retention later.

   PRACTICAL COMPROMISE:
      Learn a brand-new pattern with 2–3 problems in a row,
      then mix it with older patterns from then on.

   This is why LeetCode-style mixed practice beats doing
   50 tree problems in a row.
```

</details>

### 5.2.5 Elaborative Interrogation — Ask "Why?"

<details>
<summary><strong>Read as text</strong> — asking "why?" twice, with the BatchNorm example</summary>

> Moderate utility (Dunlosky et al., 2013). Works best when you already know a little about the topic, so you can produce a good answer to "why?".

```
   WHAT: For every fact, ask "Why is this true?" and answer it.
   WHY:  Connects new info to existing knowledge, creating
         richer, more retrievable memory traces.

   EXAMPLE:
      Fact:    Batch normalisation stabilises training.
      Why?     It normalises each layer's inputs over the
               mini-batch to zero mean and unit variance, then
               rescales them with a learned scale γ and shift β.
      Why does THAT help?
               The 2015 paper credited reducing "internal
               covariate shift". Santurkar et al. (NeurIPS 2018)
               showed the bigger effect is a smoother loss
               landscape, which allows higher learning rates.

   Asking "why?" twice took you from a fact to the mechanism —
   and to the caveat a senior interviewer hopes you know.
```

Full BatchNorm story: [Ch 16 §1.5](#content/16_deep_learning).

</details>

### 5.2.6 Deliberate Practice — The Skill-Building Engine

<details>
<summary><strong>Read as text</strong> — the key number, four ingredients and the 10,000-hour myth</summary>

> The framework Anders Ericsson developed by studying experts in music, chess and sport (Ericsson, Krampe & Tesch-Römer, 1993; Ericsson & Pool, *Peak*, 2016). **Distinct from regular practice** — and the most useful framework in this chapter for *skills* such as coding and system design.

> **Key number:** practice matters, but it is not everything. In a meta-analysis, deliberate practice explained 26% of the differences in performance in games, 21% in music, 18% in sports, 4% in education and under 1% in professions (Macnamara, Hambrick & Oswald, 2014).

```
   FOUR INGREDIENTS (Ericsson calls these "purposeful practice"):

   1. SPECIFIC GOAL
      Not "get better at DSA". "Solve 5 medium graph problems
      this week without looking at the solution."

   2. FOCUSED EFFORT
      Full attention. No phone. No background podcast.
      Quality of attention beats quantity of hours.

   3. IMMEDIATE FEEDBACK
      Know within minutes whether you're right or wrong.
      Run tests, check the solution, ask an AI tutor to grade.

   4. STRETCH ZONE
      Just outside your comfort zone: you succeed most of the
      time, but not always (≈ 85% right — see §5.1).
      Too easy → no growth.
      Too hard → frustration and avoidance.

   FULL "DELIBERATE" PRACTICE adds a teacher or coach and
   training methods proven in the field. For interviews: mock
   interviews with an experienced interviewer, rubric-based
   feedback, curated problem lists.

   THE 10,000-HOUR RULE IS A POPULARISED MISREADING.
      Malcolm Gladwell's Outliers (2008) turned an average into
      a rule. In Ericsson's 1993 study the best violin students
      had averaged about 10,000 hours of practice by age 20 —
      an average for one elite group, not a threshold. And the
      hours were deliberate practice, not generic time-on-task.
```

</details>

---

## 5.3 Desirable Difficulties & Cognitive Load

![Infographic balancing desirable difficulties (Bjork 1994) against cognitive load (Sweller 1988): a seesaw with add difficulty (test, space, mix) versus remove load (worked example, smaller step, prerequisite) around a sweet spot of about 85 percent right; a working-memory jar of about 4 chunks split into intrinsic load (Q, K, V, dot products, softmax when learning self-attention), extraneous load to cut (the diagram 3 pages away) and germane effort (redraw the diagram from memory); and a feels-versus-retains table where re-reading and highlighting retain poorly, cramming is short-lived, and active recall and spaced repetition retain strongly.](diagrams/brain05_info_difficulty_and_load_ai.png)

<details>
<summary><strong>Read as text</strong> — two opposing frameworks and the rule of thumb</summary>

Two foundational frameworks that make the techniques in §5.2 work. They pull in opposite directions, and good study design balances them.

> **Rule of thumb:** if studying feels smooth, **add** difficulty (test yourself, space it out, mix topics). If you cannot hold the pieces in your head at all, **remove** difficulty (a worked example, a smaller step, the prerequisite first).

</details>

### Desirable difficulties (Robert & Elizabeth Bjork)

<details>
<summary><strong>Read as text</strong> — how it feels vs what it retains, and the catch</summary>

> Robert Bjork coined the term in 1994; with Elizabeth Bjork (2011) he summed it up: **conditions that make learning feel slow and effortful in the moment often produce the most durable retention.** Conditions that feel smooth often produce fragile knowledge.

| Strategy | Feels during learning | Long-term retention |
|---|---|---|
| Re-reading | Easy, fluent | Poor |
| Highlighting | Productive | Poor |
| Massed practice (cramming) | Confident | Short-lived (see the toy model in §5.1) |
| Active recall | Hard, frustrating | Strong |
| Spaced repetition | "I've already forgotten it" | Strong |
| Interleaving | Confusing | Better — especially for look-alike topics |
| Generating an answer before seeing it (the *generation effect*; Slamecka & Graf, 1978) | Difficult | Better |

The lesson: if studying feels **too** smooth, you're not learning — you're admiring familiar material. Productive struggle is the feeling of learning actually happening.

**The catch:** a difficulty is *desirable* only if you can eventually overcome it. If you lack the background to respond to it, it is just a difficulty — frustrating and unproductive. That is why the sweet spot is "mostly right, sometimes wrong" (≈ 85% right, §5.1), not "always lost".

</details>

### Cognitive Load Theory (John Sweller, 1988)

<details>
<summary><strong>Read as text</strong> — the three loads, practical rules and a self-attention example</summary>

> Working memory has a **fixed, narrow capacity** (~4 chunks, §5.1). Anything you ask it to hold beyond that capacity simply isn't processed. Learning materials should be designed to respect this limit.

```
   THREE TYPES OF COGNITIVE LOAD:

   1. INTRINSIC LOAD — inherent to the material itself.
      Backprop derivation has high intrinsic load
      (many pieces that interact). "What's a hash table"
      has low intrinsic load.
      You manage it by chunking and sequencing prerequisites.

   2. EXTRANEOUS LOAD — wasted cognitive effort.
      Confusing notation, distracting layout, irrelevant
      detail, split attention (text far from its diagram).
      You eliminate it by improving how material is presented.

   3. GERMANE LOAD — productive mental effort that builds
      schemas and mental models.
      You maximise it by elaboration, self-explanation,
      and active recall.

   UPDATE: since Sweller (2010), germane load is usually
   treated not as a third load that adds up, but as the share
   of working memory you spend on the intrinsic load. Same
   practical rule: cut the extraneous, so more capacity goes
   to the real material.

   PRACTICAL CONSEQUENCES:
      ▸ Don't study a hard ML topic at the end of a tired day —
        you have no working-memory budget.
      ▸ Worked examples first, problems second
        (Sweller & Cooper, 1985).
      ▸ Then FADE the help: once you know the basics, worked
        examples become redundant and solving problems teaches
        more — the "expertise reversal effect"
        (Kalyuga et al., 2003).
      ▸ Diagrams next to text, not on different pages
        ("split-attention effect").
      ▸ Master one concept before adding another. Stack pre-
        requisites; never skip one.
```

**Worked example — learning self-attention.** *Intrinsic:* Q, K, V, the dot products, the scaling and the softmax all interact, so it is high-load no matter what. *Extraneous:* a paper's dense notation with the diagram three pages away. *Fix:* first study one worked example with tiny numbers ([Ch 17 §2.4](#content/17_llm)), redraw the diagram from memory, then compute a 2-token example yourself without looking.

</details>

---

## 5.4 Mental Models, Chunking & Mnemonics

> **Key number:** 40 days of method-of-loci practice (30 minutes a day) took ordinary people from recalling 26 to 62 words out of a 72-word list, and the gain held 4 months later (Dresler et al., 2017, *Neuron*).

![Infographic on chunking, dual coding and mnemonics: a novice sees six separate items A to F (6 chunks, high load) while an expert sees two patterns ABC and DEF (2 chunks, low load), as chess masters rebuild real but not random positions (Chase and Simon 1973); a phone number as 3 chunks 415 555 0134; a house floor plan with a numbered method-of-loci route 1 to 5; method-of-loci training of 40 days x 30 min raising recall from 26 to 62 of 72 words (Dresler 2017); and a mnemonic toolkit table of acronym, method of loci, peg system and story, with when to use and when not to use mnemonics.](diagrams/brain05_info_chunking_mnemonics_ai.png)

### Chunking — what experts actually do

<details>
<summary><strong>Read as text</strong> — chess masters, novice vs expert, and how to build chunks</summary>

> de Groot (1946) and Chase & Simon (1973): shown a real game position for 5 seconds, chess masters rebuild far more of it than beginners — but when the pieces are placed **at random**, their advantage almost vanishes. Masters don't have better raw memory; they see familiar *patterns* (chunks) where a novice sees 25 separate pieces. Senior engineers do the same: they see "two-tower retrieval," not 50 lines of code.

```
   THE PATH FROM NOVICE TO EXPERT:

   NOVICE:    individual pieces                    (high cognitive load)
   ────────   ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐
              │A│ │B│ │C│ │D│ │E│ │F│
              └─┘ └─┘ └─┘ └─┘ └─┘ └─┘

   EXPERT:    chunked into recognisable patterns   (low cognitive load)
   ────────   ┌─────────┐  ┌──────────┐
              │  A B C  │  │  D E F   │
              │ pattern │  │ pattern  │
              └─────────┘  └──────────┘

   How to build chunks:
      ▸ See many examples until commonalities emerge.
      ▸ Name the pattern. Naming creates a retrievable handle.
      ▸ Apply the pattern to new problems (transfer test).
```

</details>

### Dual Coding (Allan Paivio, 1971)

<details>
<summary><strong>Read as text</strong> — words plus pictures, and the caveat</summary>

> Information encoded in **both verbal and visual form** is remembered better than either alone. The two channels are partially independent, so you get redundancy.

These notes are built on dual coding — every concept has a definition (verbal) plus an ASCII diagram or table (visual). When you study, do the same: read the prose, then sketch the diagram from memory.

**Caveat:** Dunlosky et al. (2013) rated "imagery use for text learning" — only *imagining* pictures while you read — as low utility. The benefit comes from working with a real diagram: study it, then redraw it from memory.

</details>

### Mnemonics — old tricks, real evidence

<details>
<summary><strong>Read as text</strong> — four tricks, when to use them and when not to</summary>

```
   1. ACRONYMS / SENTENCES
      "Every Good Boy Does Fine" — musical staff E G B D F.
      "OSI: Please Do Not Throw Sausage Pizza Away."
      Use for ORDERED lists you must recall verbatim.

   2. METHOD OF LOCI (Memory Palace)
      Place each item to remember at a specific spot
      along a familiar route (your home, your commute).
      Walk the route mentally to retrieve them.
      Described since ancient Greece and Rome; used by
      most of today's memory champions.
      (Maguire et al., 2003: champions had NO special brain
       structure or IQ — the difference was the strategy.
       Dresler et al., 2017: ordinary people can learn it.)

   3. PEG SYSTEM
      Pre-memorised list (1=bun, 2=shoe, 3=tree...).
      Hook each new item to a peg via a vivid image.
      Useful for numbered lists.

   4. STORYTELLING
      Build a wild narrative that strings items together.
      In Bower & Clark (1969), people who linked words into
      stories recalled far more of 12 word lists than people
      who simply rehearsed them.

   When to use mnemonics:
      ▸ Arbitrary sequences (cranial nerves, OSI layers).
      ▸ Lists where order matters.
      ▸ Material with no logical structure to lean on.

   When NOT to use mnemonics:
      ▸ Conceptual material — there understanding > tricks.
      ▸ Anything you'll need to derive, not just recite.
      (Dunlosky et al. rated the keyword mnemonic low utility:
       it works for arbitrary pairs, but those memories fade
       faster and it builds no understanding.)
```

</details>

---

## 5.5 Note-Taking Systems

> The evidence is stronger for **how** you take notes than for any branded system: write in your own words, then **review and test yourself** from the notes (§5.2.1). Pick one system. Don't bounce between them.

![Infographic comparing three note-taking systems: a Cornell page with cue column, notes and a 2-3 sentence summary (Walter Pauk, 1950s); a Zettelkasten web of linked atomic notes (Niklas Luhmann, about 90,000 cards, 1951-1996); and a second brain stack of Obsidian or Logseq, Anki, Gemini Notebook and a markdown blog. Shows the pen-beats-laptop result that did not replicate (142 students, 8 studies, Urry et al., 2021), how linking a cross-entropy note with an MLE note reveals that training with cross-entropy equals MLE, a pick-by-need table, common mix-ups and the trap of bouncing between apps.](diagrams/brain05_info_note_taking_ai.png)

<details>
<summary><strong>Read as text</strong> — the key number: "pen beats laptop" did not replicate</summary>

> **Key number:** the famous "pen beats laptop" result (Mueller & Oppenheimer, 2014) did not replicate: a direct replication with 142 students found no longhand advantage on the quiz, and a mini meta-analysis of 8 similar studies agreed (Urry et al., 2021, *Psychological Science*). The tool matters less than what you do with the notes.

</details>

### Cornell notes (Walter Pauk, 1950s)

<details>
<summary><strong>Read as text</strong> — the page layout and why the summary matters</summary>

Pauk devised the layout at Cornell University in the 1950s and popularised it in *How to Study in College* (1962).

```
   ┌──────────────────────────────────────────┐
   │              TOPIC / DATE                │
   ├──────────────┬───────────────────────────┤
   │              │                           │
   │   CUE        │       NOTES               │
   │   COLUMN     │                           │
   │              │   Your detailed notes     │
   │   Questions  │   from lecture / reading. │
   │   keywords   │   Bullet points are       │
   │   that go    │   fine. Diagrams welcome. │
   │   here       │                           │
   │   AFTER you  │                           │
   │   take notes │                           │
   │              │                           │
   ├──────────────┴───────────────────────────┤
   │                 SUMMARY                  │
   │  2-3 sentences in your own words after   │
   │  the session. The most important step.   │
   └──────────────────────────────────────────┘
```

The summary forces active recall the moment you finish. The cue column makes self-quizzing trivial — cover the right column and recall from the cues.

</details>

### Zettelkasten ("slip-box") — Niklas Luhmann

<details>
<summary><strong>Read as text</strong> — the rules and how linked notes compound</summary>

> A network of atomic notes linked by ideas, not by topic. Sociologist Niklas Luhmann kept about 90,000 cards between 1951 and 1996 (Niklas Luhmann Archive, Bielefeld University) and was famously prolific — commonly cited as 70+ books and nearly 400 articles. Modern tools: Obsidian, Logseq, Roam.

```
   RULES:
      ▸ One idea per note (atomic).
      ▸ Write in your own words (forced elaboration).
      ▸ Link liberally — every related idea gets a link.
      ▸ No rigid topic folders. Luhmann gave each card a
        branching number and linked it to others; the links
        (plus a keyword index) ARE the structure.

   HOW IT COMPOUNDS:
      Note 1 (week 1): "Cross-entropy loss is -log(p_correct)."
      Note 7 (week 3): "MLE = minimise negative log-likelihood."
      Linking these reveals: training with cross-entropy = MLE.

   Connections you discover when you link notes are often
   more valuable than the notes themselves. This is the
   "second brain" idea, popularised by Tiago Forte
   (Building a Second Brain, 2022).
```

</details>

### The "second brain" stack

<details>
<summary><strong>Read as text</strong> — the four-tool 2026 setup</summary>

A 2026 working setup many ML candidates converge on (workflows in §5.11):

```
   ▸ Obsidian / Logseq    — your Zettelkasten / second brain
   ▸ Anki                  — spaced repetition for atomic facts
   ▸ Gemini Notebook       — (ex-NotebookLM) source-grounded
                             summaries of PDFs and papers, plus
                             flashcards and quizzes from them
   ▸ A markdown blog       — public writing as Feynman + portfolio
```

</details>

---

## 5.6 The Physical Foundation

> **Simple version:** studying writes a memory in pencil; **sleep** inks it in, and **exercise** makes the page easier to write on. No technique in §5.2–5.5 survives 5-hour nights. This section keeps only what matters *for learning*. The full lifestyle protocols (exercise plan, food, sleep routine, supplements) live in **[Ch 5B — Build a Sharper, Younger Brain](#content/05b_brain_upgrade_30_days)**, Pillars 1–3 and 7.

![Infographic on the body side of learning: a pipeline from rested brain to encode today, sleep consolidates and recall tomorrow, with callouts for one night without sleep weakening encoding (Yoo 2007), one bout of cardio improving later recall (Roig 2013) and sleep within a few hours improving recall (Gais 2006). A bar chart shows 6 h of sleep for 14 nights causing the same attention lapses as up to 2 nights of no sleep (Van Dongen et al., 2003, n = 48). Key numbers: 7+ h sleep, 150-300 min moderate exercise a week (WHO 2020), brain about 2% of body weight and 20% of resting energy; evidence table (SMD 0.52, hippocampus +2%, Firth 2018, caffeine 400 mg 6 h before bed); learner rules, watch-outs and the all-nighter trap.](diagrams/brain05_info_body_for_learning_ai.png)

<details>
<summary><strong>Read as text</strong> — the key number and where the body plugs into learning</summary>

> **Key number:** sleeping 6 hours a night for 14 days caused cognitive deficits (mostly attention lapses) as large as **up to 2 nights of total sleep deprivation**, yet people rated themselves only a little sleepy (Van Dongen et al., 2003, *Sleep*, n = 48).

```
   WHERE THE BODY PLUGS INTO LEARNING

   rested brain ──► ENCODE today ──► SLEEP consolidates ──► RECALL tomorrow
        ▲                ▲                  ▲
        │                │                  └─ sleep within a few hours of
        │                │                     learning → better recall (Gais 2006)
        │                └─ one bout of cardio near the session
        │                   → better later recall (Roig 2013)
        └─ one night without sleep → weaker hippocampal
           encoding the next day (Yoo 2007)
```

</details>

### 5.6.1 Sleep — the non-negotiable

<details>
<summary><strong>Read as text</strong> — what sleep does for learning, and the evidence</summary>

> Sleep is when the day's learning is stabilised and filed into long-term memory (Diekelmann & Born, 2010, *Nature Reviews Neuroscience*). There is no substitute.

| What sleep does for learning | Best evidence |
|---|---|
| **Before** learning: a rested brain can encode | One night without sleep significantly reduced hippocampal activity while learning and worsened later retention (Yoo et al., 2007, *Nature Neuroscience*) |
| **After** learning: consolidation | Vocabulary was remembered better when sleep followed within a few hours, whatever the time of day (Gais et al., 2006, *Learning & Memory*) |
| **Chronic** short sleep | 6 h a night for 2 weeks ≈ up to 2 nights of no sleep in attention lapses, and you don't notice (Van Dongen et al., 2003) |
| Waste clearance ("glymphatic" flow) | In mice, sleep widened the brain's fluid spaces by ~60% and sped amyloid clearance (Xie et al., 2013, *Science*); a 2024 mouse study found *less* clearance during sleep (Miao et al., *Nature Neuroscience*). Still debated, so don't plan around it |

</details>

```
   SLEEP RULES FOR LEARNERS  (full protocol: Ch 5B Pillar 3)
      ▸ 7+ hours (AASM/SRS adult guideline; most adults do best at 7–9).
      ▸ Same wake time every day, weekends too.
      ▸ Never trade sleep for one more study hour before an exam or
        interview: you lose tonight's consolidation AND tomorrow's encoding.
      ▸ Hardest NEW material when you are most alert; a short
        RETRIEVAL review in the evening, then sleep on it.
      ▸ Morning person or night owl? Put your hardest block in
        YOUR best hours.
      ▸ Caffeine: 400 mg even 6 h before bed still disrupted sleep
        (Drake et al., 2013) → Ch 5B rule: last coffee about 9 h
        before bed (Gardiner et al., 2023 meta-analysis).
      ▸ Sleeping 7–9 h but waking unrefreshed, snoring loudly, or
        someone notices breathing pauses? See a doctor (possible
        sleep apnoea, which is treatable).
```

### 5.6.2 Exercise — the best cognitive enhancer

<details>
<summary><strong>Read as text</strong> — one workout vs months of training, the evidence and the weekly dose</summary>

> **Simple version:** one workout gives a short memory boost; months of workouts build brain health. Of all lifestyle levers, regular aerobic exercise has some of the strongest evidence for brain and cognitive health (Hillman, Erickson & Kramer, 2008, *Nature Reviews Neuroscience*).

| Kind | What happens | Evidence |
|---|---|---|
| **Acute**: one bout of cardio near a study session | Better later recall: a moderate-to-large effect on long-term memory (SMD 0.52) | Roig et al., 2013 meta-analysis (29 acute and 21 long-term studies) |
| **Long-term**: a year of training | Anterior hippocampus **+2%**, reversing about 1–2 years of age-related loss; the stretching control group shrank (~1.4%) | Erickson et al., 2011, *PNAS*: RCT, 120 adults aged 55–80, walking built up to 40 min × 3 per week |
| **Long-term**, all trials pooled | No significant change in *total* hippocampal volume; exercise mainly *prevented* shrinkage (left hippocampus) | Firth et al., 2018, *NeuroImage* meta-analysis (14 trials, 737 people) |
| **Long-term**, memory tests | Small effect on short-term memory (SMD 0.15); no significant effect on long-term memory | Roig et al., 2013 |

SMD = standardised mean difference (difference in averages ÷ spread): about 0.2 is small, 0.5 medium, 0.8 large. Mechanism in one line: more blood flow and more **BDNF**, a growth factor for neurons; in Erickson's trial, bigger hippocampal gains went with higher BDNF.

```
   HOW A LEARNER USES IT
      ▸ A brisk walk or easy jog shortly before or after a hard session.
      ▸ Weekly dose (WHO 2020): 150–300 min moderate OR 75–150 min
        vigorous, plus muscle strengthening on ≥ 2 days
        → the full plan is Ch 5B Pillar 1.
      ▸ "Moderate" = you can talk but not sing.
```

</details>

### 5.6.3 Nutrition — brain fuel

<details>
<summary><strong>Read as text</strong> — the brain's energy use and study-day fuel rules</summary>

```
   YOUR BRAIN: ~2% of body weight, ~20% of the body's resting energy
   (Raichle & Gusnard, 2002, PNAS).

   FOR STUDY DAYS:
      ▸ Regular meals; don't start a deep-work block hungry.
      ▸ Water within reach: even mild dehydration dulls
        attention and memory (Ch 5B Pillar 2).
      ▸ Caffeine helps alertness; mind the timing rule above.

   EVERYTHING ELSE LIVES IN CH 5B:
      brain-food list and diet patterns, alcohol      → Pillar 2
      omega-3, creatine, vitamin D/B12,
      caffeine + L-theanine, what NOT to buy          → Pillar 7
```

</details>

---

## 5.7 Brain-Building Exercises

> **Simple version:** you get better at what you practise. Movement builds the *hardware* (blood flow, brain health, mood); only practising a skill builds that *skill*. No exercise or game replaces solving ML problems, but the right movement keeps the learner in good shape.

![Infographic comparing brain-building activities: hardware from movement (aerobic exercise protects the hippocampus, +2% in 1 year, strong; coordination and dance, mixed; juggling grew grey matter in 3 months, strong; yoga g = 0.33, mixed; slow breathing 5 min a day lifted mood, mixed) versus software from skill practice, with brain-training apps and dual n-back crossed out as weak for IQ. Shows the rule that transfer is narrow, a minimum week of 5 x 30 min brisk walking, 2 strength sessions and 1-3 min slow breathing before a mock interview, a pick-by-goal table, common mix-ups and the n-back IQ trap (Melby-Lervag 2016).](diagrams/brain05_info_brain_building_transfer_ai.png)

<details>
<summary><strong>Read as text</strong> — the rule of thumb: transfer is narrow</summary>

> **Rule of thumb:** transfer is narrow. Train the exact skill you need (ML and DSA problems), and use movement for brain health and mood, not as a shortcut to a higher IQ.

</details>

### 5.7.1 What each activity really does

<details>
<summary><strong>Read as text</strong> — the evidence table for each activity</summary>

| Activity | What the best evidence shows | Strength | Use it for |
|---|---|---|---|
| **Aerobic**: walk, jog, cycle, swim | Protects the hippocampus from age-related shrinkage (+2% in one 1-year RCT, Erickson 2011; mainly prevention across 14 trials, Firth 2018); one bout aids later recall (Roig 2013) | 🟢 strong | The base, most days |
| **Coordination and dance** | Over 12 months, cardio *and* coordination training both improved executive function, through different brain changes (Voelcker-Rehage 2011, n = 44); a 6-month dance programme grew more brain regions than fitness training, but cognition improved equally (Rehfeld 2018, n = 38) | 🟡 small trials | Cardio plus novelty in one |
| **Juggling** or another new motor skill | 3 months of juggling grew grey matter in visual-motion areas, which partly shrank back after practice stopped (Draganski 2004, *Nature*) | 🟢 for "practice reshapes the brain" | Proof that practice changes structure |
| **Yoga, Tai Chi** | Yoga RCTs: moderate effect on cognition, g = 0.33 (Gothe & McAuley 2015 meta-analysis); Tai Chi: executive-function gains in older adults (Wayne 2014, modest-quality trials) | 🟡 | Stress and mobility, with a cognitive bonus |
| **Slow breathing** | 5 min a day for a month lifted mood more than mindfulness meditation, best with long-exhale "cyclic sighing" (Balban 2023, one RCT) | 🟡 | Calming down before an exam (Ch 5B Pillar 5) |
| **Brain-training apps, dual n-back** | You get better at the trained game; no convincing far transfer to reasoning or IQ (Melby-Lervåg 2016 meta-analysis; Simons 2016 review) | 🔴 for IQ | Only if you enjoy it |
| **Instrument, new language** | Musicians' brains differ, but the data are mostly cross-sectional (Schlaug 2005); bilinguals showed dementia ~4 years later in retrospective clinic data (Bialystok 2007) but no lower risk in prospective studies (Mukadam 2017) | 🟡 mixed | Worth learning as skills, not as brain hacks |

</details>

### 5.7.2 A minimum weekly routine

<details>
<summary><strong>Read as text</strong> — the minimum week for a busy learner</summary>

```
   ┌──────────────────────────────────────────────────────┐
   │  MINIMUM WEEK FOR A BUSY LEARNER                     │
   ├──────────────────────────────────────────────────────┤
   │  ▸ 150 min brisk walking (e.g., 5 × 30 min)          │
   │    = the WHO floor for moderate activity.            │
   │  ▸ 2 short strength sessions (body weight is fine).  │
   │  ▸ 1–3 min slow breathing before a hard session      │
   │    or a mock interview.                              │
   ├──────────────────────────────────────────────────────┤
   │  Full weekly template + 12-week plan: Ch 5B.         │
   └──────────────────────────────────────────────────────┘
```

</details>

---

## 5.8 Focus & Deep Work

> **Simple version:** deep focus is like water coming to the boil; every interruption takes the pot off the heat. Protect long, single-task blocks, and plan your breaks instead of letting notifications plan them for you.

![Infographic on focus and deep work: a 90-minute focus block broken by a notification, a detour through two other tasks and a return about 23 minutes later (time to return, not to refocus); a flow chart of challenge versus skill with a FLOW band where challenge roughly equals skill, re-reading notes in the boredom zone, a transformer from scratch on day 2 in the anxiety zone and a graph LeetCode medium with tests in flow. Key numbers: Pomodoro 25 min focus and 5 min break, a 15-30 min long break after 4 cycles, then 50/10 to 90/20. Study table (Biwer 2023, Smits 2025, Mark 2008), defences, watch-outs and the ultradian-rhythm trap.](diagrams/brain05_info_focus_deep_work_ai.png)

<details>
<summary><strong>Read as text</strong> — the key number: about 23 minutes to get back</summary>

> **Key number:** in Gloria Mark's office-shadowing studies, interrupted work was resumed on average **~23 minutes** later, usually after **about two other tasks** in between (Mark, 2006 interview about a 36-person study; peer-reviewed version: 25 min 26 s, Mark, Gonzalez & Harris, 2005, CHI). It measures *time until people returned to the task*, not "time to regain deep focus".

</details>

### Pomodoro and its modern variants

<details>
<summary><strong>Read as text</strong> — classic and modern blocks, and what the small studies say</summary>

```
   CLASSIC POMODORO (Francesco Cirillo, late 1980s):
      25 min focus  →  5 min break  →  repeat
      After 4 cycles → 15–30 min long break.

   AS YOU IMPROVE:
      50 / 10  →  90 / 20 blocks.
      The "90-minute ultradian rhythm" comes from Kleitman's
      Basic Rest–Activity Cycle hypothesis; tests in awake adults
      are mixed. Treat 90 min as a planning choice, not biology.

   TIME BLOCKING (Cal Newport, Deep Work, 2016):
      Give every block of the day a name and ONE outcome.
      Most people overestimate how many "deep" blocks they
      have per day; 2–4 is realistic.
```

What the (small) studies say:

| Study | Set-up | Result |
|---|---|---|
| Biwer et al., 2023, *British Journal of Educational Psychology* | 87 students, 1 day: fixed breaks (24 min study + 6 min break, or 12 + 3) vs self-timed breaks | Fixed breaks: less fatigue and distraction, more concentration and motivation; the same work done in less time |
| Smits, Wenzel & de Bruin, 2025, *Behavioral Sciences* | 94 students, one 2-hour session: Pomodoro 25/5 vs self-timed vs "Flowtime" (break when you choose; break length scales with study time) | No overall difference in fatigue, motivation, productivity, task completion or flow |

> **Takeaway:** planned breaks help many people start and stay fresh, but the exact numbers matter less than (1) one clear goal per block and (2) a break before you are exhausted.

</details>

### Flow state — the peak performance zone

<details>
<summary><strong>Read as text</strong> — the three conditions, the chart and an ML prep example</summary>

> **Flow** (Csikszentmihalyi, 1990): complete absorption in a task, where time seems to disappear. In his model it appears when a few conditions line up (Nakamura & Csikszentmihalyi, 2002).

```
   THE THREE CONDITIONS (+ one practical one)
      1. CHALLENGE ≈ SKILL    a stretch, slightly above your level.
      2. CLEAR GOAL           know exactly what "done" means.
      3. IMMEDIATE FEEDBACK   tests pass/fail, an answer key, running code.
      +  PROTECTED TIME       interruptions break the absorption.

     challenge ▲
               │  ANXIETY           ╱ ╱
               │  (too hard)      ╱ ╱
               │                ╱ ╱  ← FLOW: challenge ≈ skill
               │              ╱ ╱
               │            ╱ ╱        BOREDOM
               │          ╱ ╱          (too easy)
               └──────────────────────────────► skill

   ML PREP EXAMPLE
      Too easy  → re-reading notes on linear regression        (boredom)
      Too hard  → a transformer from scratch on day 2           (anxiety)
      Flow zone → a graph LeetCode medium with tests, or one
                  attention head with a shape check per line
```

> **Watch out:** the popular "make it 4% harder" rule and the "struggle → release → flow → recovery" cycle come from popular books (Steven Kotler), not from controlled studies. The honest version: aim a little above your current level, and expect the first minutes of a hard block to feel effortful.

</details>

### Context-switching cost — the hidden tax

<details>
<summary><strong>Read as text</strong> — what the research found and how to defend a block</summary>

```
   WHAT THE RESEARCH ACTUALLY FOUND
      ▸ Field (Mark, UC Irvine, mid-2000s): people switched "working
        spheres" every ~10.5 min; interrupted work came back
        ~23 min later, after ~2 other tasks.
      ▸ Lab (Mark, Gudith & Klocke, 2008, CHI): interrupted people
        finished just as well and even FASTER, but with more stress,
        frustration and time pressure.
      ▸ Attention residue (Leroy, 2009): after a switch, part of your
        mind stays on the unfinished task, so you do the next one worse.
      ▸ Screens (Mark, Attention Span, 2023): average time on one
        screen before switching fell from ~2.5 min (2004) to
        ~47 s in her recent studies.
      ▸ Notifications you don't even answer still disrupt an
        attention task (Stothart et al., 2015).

   DEFENCE
      ▸ Calendar 90–120 min focus windows for your hardest topic.
      ▸ Notifications OFF / Do Not Disturb during the block.
      ▸ Phone out of sight: the "mere presence" effect is small and
        mixed (Böttger et al., 2023 meta-analysis), but it costs nothing.
      ▸ Batch shallow work (email, chat) into fixed slots.
      ▸ Forced to stop? Write a one-line "ready-to-resume" note
        (where you are + next step). It reduced attention residue
        in Leroy & Glomb (2018).
```

</details>

---

## 5.9 Habit Formation, Goals & Identity

> Motivation is unreliable. Habits are robust. The goal is to make studying so automatic it survives bad days. The tools below are ordered from strongest evidence to weakest.

![Infographic on building habits that survive bad days: the if-then formula with the example of sitting at the desk with the textbook open at 7 a.m. on weekdays (d = 0.65 across 94 tests, Gollwitzer & Sheeran, 2006); a toy-model chart of automaticity versus days for fast, median and slow learners (plateau at 18, 66 and 254 days, Lally et al., 2010) with the 21-day myth marked where the median habit is only 61.4% automatic; James Clear's four laws with study examples; a worked-numbers table (day 21 and day 66: 97.0/100.0, 61.4/95.0, 21.9/54.1 percent) showing one missed day costs 95.0 to 94.8; reminders, watch-outs and the quit-at-week-3 trap.](diagrams/brain05_info_habit_formation_ai.png)

<details>
<summary><strong>Read as text</strong> — the key number: about 66 days, not 21</summary>

> **Key number:** a new daily habit took a median of about **66 days** to become as automatic as it would get, but anywhere from **18 to 254 days**, and missing a single day did not derail it (Lally et al., 2010, *European Journal of Social Psychology*; among participants whose data fitted the model well). A 2024 review found medians of **59–66 days** and a range of 4–335 days (Singh et al., *Healthcare*). The popular "21 days" is not supported.

</details>

### Implementation intentions (Gollwitzer, 1999)

<details>
<summary><strong>Read as text</strong> — the evidence, the if-then formula and why it works</summary>

> One of the best-tested behaviour-change tools. Across 94 tests, a simple if-then plan had a medium-to-large effect on reaching goals (d = 0.65; Gollwitzer & Sheeran, 2006): the average planner did better than about 74% of non-planners. A 2024 update of **642 tests** found effects from d = 0.27 to 0.66 depending on the outcome, largest when the plan is in strict **if-then** form, the goal really matters to you, and you **rehearse** the plan (Sheeran, Listrom & Gollwitzer, 2024).

```
   FORMULA:  "If [time/place/cue], then I will [action]."

   WEAK:     "I'll study ML this week."
   STRONG:   "If it is 7 a.m. on a weekday, then I will sit
              at the desk with the textbook open."

   WHY IT WORKS:
      The plan links a cue to an action in memory. When the cue
      appears, the action starts almost automatically, so you skip
      the "should I? when?" debate.
      (The older "willpower is a fuel tank that runs out" idea,
       ego depletion, shrank to almost nothing in a large
       multi-lab replication: Hagger et al., 2016.)

   MAKE IT STRONGER: write it as IF–THEN, rehearse it a few
      times, and attach it to a goal you actually care about.
```

</details>

### The habit loop (Charles Duhigg) and Atomic Habits (James Clear)

<details>
<summary><strong>Read as text</strong> — the two loops, the four laws and the 2-minute rule</summary>

```
   DUHIGG (2012):  CUE → ROUTINE → REWARD
   CLEAR  (2018):  CUE → CRAVING → RESPONSE → REWARD
                   with "four laws" to build a habit,
                   and their inverse to break one.
```

| Law (build a habit) | Study example | Inverse (break a bad habit) |
|---|---|---|
| 1. Make it **obvious** | Book open on the desk; same chair, same time | Make it invisible: phone in a drawer |
| 2. Make it **attractive** | Pair it with something you like, e.g. a favourite tea only while studying ("temptation bundling", Milkman et al., 2014) | Make it unattractive: track the hours a feed eats |
| 3. Make it **easy** | Start with 2 minutes: "open the textbook" | Make it hard: log out of every social app |
| 4. Make it **satisfying** | Tick a box; keep a streak | Make it unsatisfying: a study buddy who sees your log |

```
   THE 2-MINUTE RULE (James Clear):
      Scale ANY habit down to 2 minutes:
        "Study ML"          → "Open the textbook"
        "Exercise daily"    → "Put on running shoes"
        "Make flashcards"   → "Write one card"
      The goal isn't to do 2 minutes forever;
      it's to become the person who shows up.
```

Clear's laws are a practitioner synthesis. The research core underneath is simple: repeat the same action in the same context, and automaticity grows (Lally et al., 2010).

</details>

### How long until it sticks? A toy habit curve

<details>
<summary><strong>Read as text</strong> — the asymptotic curve behind the toy model</summary>

Lally's data fitted an **asymptotic curve**: big gains in the first weeks, then a slow approach to a plateau. The toy model below copies that shape. Each day you do the habit closes a fixed share of the remaining gap, tuned so the plateau (95%) arrives on day 18, 66 or 254, the fastest, median and slowest people in the study. It is an illustration, not study data.

</details>

```python
# Toy habit curve: why "21 days" misleads and one missed day barely matters (illustrative model, not study data)
def automaticity(days, t95, missed=()):
    """% of your own maximum automaticity after `days` days.
    Each day you do the habit closes a fixed share r of the remaining gap;
    r is set so that 95% is reached after t95 repetitions (Lally's plateau point)."""
    r = 1 - 0.05 ** (1 / t95)
    a = 0.0
    for day in range(1, days + 1):
        if day not in missed:
            a += r * (100 - a)
    return a

# Lally et al. (2010): plateau after 18 (fastest), 66 (median), 254 (slowest) days
for label, t95 in [("fast", 18), ("median", 66), ("slow", 254)]:
    print(f"{label:>6} learner (t95 = {t95:3d} d): day 21 = {automaticity(21, t95):5.1f}%, "
          f"day 66 = {automaticity(66, t95):5.1f}%")

every_day = automaticity(66, 66)
one_miss = automaticity(66, 66, missed={30})
print(f"Median learner on day 66: {every_day:.1f}% (no misses) vs {one_miss:.1f}% (missed day 30)")
assert abs(every_day - 95.0) < 1e-9 and every_day - one_miss < 0.5
```

**Output:**

```
  fast learner (t95 =  18 d): day 21 =  97.0%, day 66 = 100.0%
median learner (t95 =  66 d): day 21 =  61.4%, day 66 =  95.0%
  slow learner (t95 = 254 d): day 21 =  21.9%, day 66 =  54.1%
Median learner on day 66: 95.0% (no misses) vs 94.8% (missed day 30)
```

<details>
<summary><strong>Read as text</strong> — continued: how to read the numbers</summary>

Read it like this: on day 21 the median habit is only ~61% automatic, so judging a habit at "21 days" makes most people quit too early. One missed day costs about 0.2 points here, matching Lally's finding that a single miss did not matter. Long breaks were not tested, so keep gaps short: "never miss twice" (Clear) is a sensible working rule.

</details>

### Identity-based motivation

<details>
<summary><strong>Read as text</strong> — outcome vs process vs identity, and how solid the idea is</summary>

```
   OUTCOME-BASED:  "I want to learn ML."        (fragile)
   PROCESS-BASED:  "I will study 1 hour daily." (better)
   IDENTITY-BASED: "I am the kind of person     (most durable)
                    who studies daily."

   Every action is a vote for an identity:
      Each session = one vote for "disciplined learner."
      Enough votes = that becomes who you are.
```

This is James Clear's framing (2018): intuitive and popular, but a practitioner idea rather than a tested study technique. Use it as a mindset aid on top of the tools above.

</details>

### SMART goals — the practical wrapper

<details>
<summary><strong>Read as text</strong> — the SMART formula, an example and the evidence</summary>

```
   SMART (Doran, 1981):  Specific · Measurable · Achievable ·
                         Relevant · Time-bound

   WEAK:    "Get better at ML."
   SMART:   "Solve 3 medium LeetCode graph problems
            without help by Friday."

   WHY: in decades of goal-setting research, specific and
   challenging goals beat "do your best" goals
   (Locke & Latham, 2002, American Psychologist).

   Pair a SMART goal with an implementation intention:
   "If it is 8 p.m. Mon/Wed/Fri, then I solve one graph problem."
```

</details>

---

## 5.10 Motivation, Demotivation & Depression

> **Important — please read.** This section offers study strategies for low motivation and low mood. It is **not** a diagnosis or a treatment plan. If low mood, loss of interest or hopelessness lasts **2 weeks or more**, talk to a doctor or a mental-health professional (§5.10.6). **If you are thinking about suicide or self-harm, or you are in danger, reach out now:** call your local emergency number or a crisis line. US: call or text **988**. India: **Tele-MANAS 14416**. UK & Ireland: **Samaritans 116 123**. Elsewhere: [findahelpline.com](https://findahelpline.com). Depression is common and treatable, and asking for help is a strong, sensible step.

> **Rule of thumb:** action comes before motivation. Make the first step small enough to start in 5 minutes, and if low mood lasts 2+ weeks, talk to a professional.

![Infographic: Low Motivation and Low Mood, Act First. Myth vs truth (take action, motivation often follows), an avoidance loop (brain predicts pain, anxiety, avoid the task, relief) with a 5-minute start leading to four small steps (open Chapter 6 for 2 min, read the first section for 10 min, write 3 things you remember in 5 min, done), a signals table from bored to 2+ weeks of low mood, evidence for behavioural activation (26 RCTs; as effective as CBT in a 440-adult trial), myth warnings about dopamine detox and cold showers, and a help box: talk to a professional if low mood lasts 2 weeks or more; crisis lines US 988, India Tele-MANAS 14416, UK and Ireland Samaritans 116 123, findahelpline.com.](diagrams/brain05_info_motivation_low_mood_ai.png)

### 5.10.1 Dopamine — what it actually does

<details>
<summary><strong>Read as text</strong> — wanting vs liking, and hard work first</summary>

> Dopamine is mostly about **wanting** (the drive to go after a reward), not **liking** (the pleasure itself) (Berridge & Robinson, 1998, *Brain Research Reviews*). Dopamine neurons also fire when a reward is **better than expected**, a "reward prediction error" (Schultz, Dayan & Montague, 1997, *Science*): the same idea as the temporal-difference (TD) error in [Ch 15 Reinforcement Learning](#content/15_reinforcement_learning).

```
   THE PRACTICAL RULE: hard work first, easy rewards after.

      Bad:  phone → feeds → videos → "now I'll study"
            The easy rewards keep pulling; the study block never starts.
      Good: one deep block first (morning, fresh) → messages and
            feeds AFTER, as the reward.

   WHY IT WORKS (no neuro-hype needed):
      ▸ Apps built for "just one more" capture WANTING.
      ▸ Remove the cue (phone away, tabs closed) and the pull drops.
      ▸ An easy reward after hard work makes the hard work
        more likely to happen again.

   MYTH: a "dopamine detox" resets your brain's baseline.
         That is a pop-science framing, not a tested treatment;
         the useful part is simply fewer tempting cues while you study.
```

</details>

### 5.10.2 Behavioural Activation — action before motivation

<details>
<summary><strong>Read as text</strong> — the evidence and the 5-minute start</summary>

> **Behavioural activation (BA)** is a structured therapy for depression: instead of waiting to feel better, you schedule small, meaningful activities and watch how your mood responds. In 26 RCTs (1,524 people) BA beat control conditions (SMD −0.74; Ekers et al., 2014, *PLoS One*, though many trials were small). In the COBRA trial (440 adults), BA delivered by junior mental-health workers was **as effective as CBT** and needed less costly training (Richards et al., 2016, *Lancet*). In a 241-person RCT, for more severe depression BA matched antidepressant medication (Dimidjian et al., 2006, *Journal of Consulting and Clinical Psychology*).

```
   THE CORE IDEA:
      Don't wait for motivation. ACT first, in a small step.

      MYTH:   feel motivated  →  take action.
      TRUTH:  take action     →  motivation often follows.

   THE 5-MINUTE START:
      Commit to JUST 5 minutes. Not 25, not 60.
      Often you keep going; if not, 5 minutes still beats zero.
      Both count as wins.

   THE STEPS (as used in BA programmes):
      1. Track what you do and your mood (0–10) for a few days.
      2. List activities that used to give pleasure or a sense of
         achievement, or that fit your values.
      3. Schedule one small one per day, like an appointment.
      4. Do it regardless of how you feel.
      5. Rate mood before and after. Notice: mood often lifts AFTER.
```

</details>

For clinical depression, BA works best guided by a trained therapist; the study-motivation version above is a self-help adaptation, not a replacement for care.

### 5.10.3 Breaking the avoidance cycle

<details>
<summary><strong>Read as text</strong> — why we avoid and how to break a task down</summary>

```
   WHY WE AVOID:
      Brain predicts pain → produces anxiety → avoidance
      removes anxiety → brain learns "avoidance = relief".
      This is negative reinforcement, and it is powerful.

   But avoidance INCREASES anxiety long-term:
      ▸ The task grows in your mind.
      ▸ Guilt and shame stack up.
      ▸ You lose evidence that you can handle it.

   BREAK IT DOWN:
      OVERWHELMING:  "Study machine learning for my interview."
      BROKEN DOWN:
        1. Open Chapter 6 (2 min)
        2. Read the first section only (10 min)
        3. Close the book, write 3 things I remember (5 min)
        4. Done. That's today's session.

      Tomorrow, the next section. Progress compounds.
      Small > zero. Always.
```

</details>

### 5.10.4 Practical strategies for dark days

```
   When motivation is at zero and everything feels pointless:

   1. MOVE — even a 10-minute walk.
      Exercise is an effective treatment for depression: walking
      or jogging (g = −0.62), yoga (−0.55) and strength training
      (−0.49) vs active controls, with bigger effects at higher
      intensity, though the evidence quality is low
      (Noetel et al., 2024, BMJ; 218 studies).

   2. DAYLIGHT soon after waking.
      Outdoor morning light anchors your body clock and helps
      that night's sleep (Ch 5B Pillar 3). Clinical bright-light
      therapy improved remission as an ADD-ON treatment for
      depression in a 2025 meta-analysis of RCTs (Menegaz de
      Almeida et al., JAMA Psychiatry); use it with a clinician.

   3. SOCIAL CONTACT — even small.
      Isolation feeds low mood. Text a friend, call, or
      "body-double" study with someone.

   4. SLEEP — fix the wake time first.
      A consistent wake time matters more than bedtime.

   5. WRITE 3 THINGS YOU COMPLETED today.
      Not gratitude (which can feel forced). Real actions:
      "Got out of bed. Took a shower. Read 2 pages."
      Counters the "I did nothing" thought.

   6. OPPOSITE ACTION (a skill from DBT, dialectical
      behaviour therapy).
      Low mood says: stay in bed, isolate, give up.
      Do the small opposite, not because you feel like it,
      but because acting is how the mood starts to shift.
```

> **Myth check — cold showers:** the viral "+250% dopamine, +530% noradrenaline" figures come from **1 hour** of head-out immersion in 14 °C water (Šrámek et al., 2000, *European Journal of Applied Physiology*, young men), not from a 1–3 minute shower, and the study did not measure mood. Cold water is not a depression treatment; if you have a heart condition, ask a doctor before trying cold immersion.

### 5.10.5 When demotivation is a useful signal

```
   ┌────────────────────────┬──────────────────────────────────┐
   │  SIGNAL                │  WHAT IT MEANS                   │
   ├────────────────────────┼──────────────────────────────────┤
   │  Bored, zoning out     │  Material is too easy.           │
   │                        │  Move to harder problems.        │
   ├────────────────────────┼──────────────────────────────────┤
   │  Frozen, can't start   │  Too big or too hard.            │
   │                        │  Break it down.                  │
   ├────────────────────────┼──────────────────────────────────┤
   │  Tired despite sleep   │  Sleep debt, overtraining, or a  │
   │                        │  medical cause (thyroid, sleep   │
   │                        │  apnoea). Rest; see a doctor     │
   │                        │  if it persists.                 │
   ├────────────────────────┼──────────────────────────────────┤
   │  Exhausted + cynical   │  Possible burnout: chronic work  │
   │  about work + getting  │  stress not managed (WHO ICD-11  │
   │  less done             │  occupational phenomenon, not    │
   │                        │  an illness). Cut load; rest.    │
   ├────────────────────────┼──────────────────────────────────┤
   │  2+ weeks: persistent  │  This may be depression.         │
   │  sadness + loss of     │  SEE A PROFESSIONAL (§5.10.6).   │
   │  interest + sleep      │                                  │
   │  changes               │                                  │
   └────────────────────────┴──────────────────────────────────┘
```

### 5.10.6 When to see a professional

```
   Talk to a doctor or mental-health professional if, for 2+ weeks,
   most of the day, nearly every day, you have (NIMH):
      ▸ Persistent sad, anxious or "empty" mood, or hopelessness.
      ▸ Loss of interest or pleasure in things you used to enjoy.
      ▸ Sleeping much less or much more; appetite or weight changes.
      ▸ Tiredness, feeling slowed down, or trouble concentrating,
        remembering or deciding.
      ▸ Feelings of worthlessness or excessive guilt.

   Even a few of these can be worth treating. A doctor can also
   rule out physical causes (for example, thyroid problems).
   Depression is treatable: talk therapy (such as CBT or
   behavioural activation), medication, or both, chosen with a
   clinician. Asking for help is the intelligent response to a
   health problem, not a weakness.
```

> 🆘 **If you are having thoughts of suicide or self-harm, reach out now; don't wait for two weeks.** If you are in immediate danger, call your local emergency number (112 in India and the EU, 911 in the US, 999 in the UK). Free, confidential crisis lines: **US** — call or text **988** (988 Suicide & Crisis Lifeline, 24/7, or chat at [988lifeline.org](https://988lifeline.org)); **India** — **Tele-MANAS 14416** or 1-800-891-4416 (24/7, toll-free, choose your language); **UK & Ireland** — **Samaritans 116 123** (free, any time); **elsewhere** — [findahelpline.com](https://findahelpline.com) lists free helplines by country. Telling someone you trust also helps.

---

## 5.11 The 2026 AI Learning Stack

![Infographic: AI for Learning, a Tutor, Not a Crutch. Problem: plain GPT-4 help left students 17% worse on an exam without AI. Four steps: attempt first, ask for a hint not the answer, close the chat and write what you remember, put key ideas into Anki + FSRS. Split panel Same Tool, Opposite Outcomes from Bastani et al. 2025 (about 1,000 high-school maths students): AI gives the answer, practice +48% but 17% worse without AI; AI makes you generate, practice +127% and about equal without AI. Evidence table (Bastani, Kestin 194 Harvard physics students with median gain more than doubled, Kosmyna 54 adults EEG preprint), tools as of Nov 2026 (learning modes, Gemini Notebook, chatbot as Feynman partner, Anki + FSRS) and the trap of assuming AI help in the interview.](diagrams/brain05_info_ai_learning_stack_ai.png)

<details>
<summary><strong>Read as text</strong> — the tutor-or-crutch idea and the key number</summary>

**Simple explanation.** An AI chatbot is like a brilliant study partner who will happily do your homework for you. If it does the thinking, *it* gets the practice and you get a pleasant feeling of understanding (the fluency illusion). If it makes *you* do the thinking — asks questions, gives hints, checks your answers — it can be one of the best tutors you have ever had. The tool is the same; how you use it decides which one you get.

> **Key number:** in a randomised trial with about 1,000 high-school maths students, plain GPT-4 help raised practice scores by 48% but left students 17% *worse* on a later exam taken without AI; a tutor version that gave hints instead of answers raised practice scores by 127% and largely removed the harm (Bastani et al., *PNAS* 2025).

</details>

### What the 2025 research says about AI and learning

<details>
<summary><strong>Read as text</strong> — four studies, their results and their limits</summary>

Four studies are worth knowing. Read the last column too — each has limits.

| Study | Who and what | Result | Watch out |
|---|---|---|---|
| **Bastani et al. 2025**, *PNAS* (randomised trial) | ≈1,000 high-school maths students in Turkey, four 90-minute sessions: plain GPT-4 chat ("GPT Base"), a hints-only tutor ("GPT Tutor"), or no AI | Practice: +48% (Base), +127% (Tutor). Exam without AI: Base 17% below the no-AI group; Tutor about equal to it (no harm, no gain) | Base users mostly asked for and copied answers, and did not notice they had learned less |
| **Kestin et al. 2025**, *Scientific Reports* (randomised, crossover) | 194 Harvard intro-physics students (fall 2023): a custom GPT-4 tutor built on active-learning principles vs the same lesson as an in-class active-learning session | Median learning gain more than double; effect size 0.73–1.3 standard deviations; median 49 minutes on the tutor vs a 60-minute class | Two lessons in one course, short-term test; the tutor had expert-written prompts and step-by-step solutions |
| **De Simone et al. 2025**, World Bank working paper (randomised) | Secondary students in Nigeria, a 6-week after-school programme using GPT-4 (Microsoft Copilot) with teachers guiding | +0.31 standard deviations on an English assessment | Working paper; structured and supervised use |
| **Kosmyna et al. 2025**, arXiv preprint ("Your Brain on ChatGPT") | 54 adults writing essays with an LLM, a search engine or no tool, with EEG; 18 came back for a fourth session | LLM group: weakest brain connectivity, lowest sense of owning the essay, often could not quote it | Small and not peer-reviewed; a written critique (Stanković et al., arXiv 2601.00856) questions the EEG analysis and reporting |

```
   SAME TOOL, OPPOSITE OUTCOMES

   AI GIVES THE ANSWER             AI MAKES YOU GENERATE
   ───────────────────             ─────────────────────
   you ask → it solves             you try → it hints →
   → you copy and nod              you fix → it checks

   practice score   ↑              practice score   ↑↑
   score WITHOUT AI ↓ (−17%)       score WITHOUT AI ≈ or ↑
   feels easy                      feels harder — a "desirable
                                   difficulty" (§5.3)
```

> **Rule of thumb:** let AI *ask* you questions and *check* your answers — never let it *give* you an answer you have not attempted yet.

</details>

### The tools (as of November 2026)

<details>
<summary><strong>Read as text</strong> — the tools, their best use and their cost</summary>

| Tool | Best use for an ML candidate | Cost |
|---|---|---|
| **Learning modes in chatbots** — ChatGPT *study mode* (July 2025), Gemini *Guided Learning* (August 2025), Claude *learning* style (August 2025) | Socratic tutoring: questions, hints and step-by-step guidance instead of finished answers | Included in the free tiers |
| **Gemini Notebook** (Google; called **NotebookLM** until July 2026) | Chat grounded in YOUR sources, with citations; Audio and Video Overviews; generates quizzes and flashcards | Free tier; higher limits with a paid Google AI plan |
| **General chatbots** (Claude, ChatGPT, Gemini) | Feynman partner, problem generator, code reviewer | Free tier; paid plans for heavier use |
| **Anki + FSRS** (an LLM can draft the cards) | Schedules reviews so you still remember next month | Anki desktop is free; LLM usage if you generate cards |
| **Khanmigo** (Khan Academy) | Socratic tutor built for school-level subjects | 4 USD a month (free for teachers) |

Product names change fast — NotebookLM became Gemini Notebook in July 2026 — but the workflows below do not.

</details>

### Five high-leverage AI workflows

<details>
<summary><strong>Read as text</strong> — five prompts that turn AI into a tutor</summary>

```
   1. THE FEYNMAN PARTNER
      "I'm going to explain X to you. Stop me where my
       explanation is vague, hand-wavy, or wrong, and ask
       me the question a senior interviewer would ask next."

      Then explain. Where the AI pushes back = your real gap.
      Go back to the source for that gap only (§5.2.3).

   2. THE PROBLEM GENERATOR
      "Give me 5 medium graph problems in LeetCode style,
       one at a time. Give a hint only if I ask. Then grade
       my solution and my complexity analysis."

      Run your code on edge cases yourself — AI-written
      problems and gradings can be wrong.

   3. THE NOTE → FLASHCARD PIPELINE
      Paste YOUR notes (not the textbook) into a chatbot.
      "Draft 10 atomic Anki cards. Each back explains WHY,
       not just WHAT. Format: front<TAB>back."

      Edit every card before importing — rewriting is part
      of the learning. Then let FSRS schedule the reviews.

   4. THE SOURCE-GROUNDED QUIZ (Gemini Notebook)
      Add the chapter PDF or your notes as sources.
      Ask: "Quiz me on the 5 hardest concepts. Don't show
            answers until I've tried."
      An Audio Overview on a commute is re-exposure, not
      retrieval — follow it with a quiz.

   5. THE SOCRATIC TUTOR
      Switch on the study / learning mode, or use:
      "You are a tutor. Never give the final answer. Ask
       one question at a time. If I'm stuck, ask a smaller
       question that breaks the problem down."

      This is the "hints, not answers" design that avoided
      the harm in Bastani et al. (2025).
```

</details>

### How AI learning fails

<details>
<summary><strong>Read as text</strong> — the three anti-patterns and their fixes</summary>

```
   The 3 anti-patterns:

   1. PASSIVE READING OF AI ANSWERS
      Asking "explain X" and reading the reply is the modern
      version of re-reading the textbook. Feels like learning,
      isn't.
      Fix: close the chat, write what you remember, compare.

   2. COPY-PASTE COMPLETIONS
      Letting AI write code you could not write yourself.
      Unless your recruiter says otherwise, assume the
      interview gives you no AI assistant.
      Fix: after AI generates, re-derive it line by line,
      then re-solve the problem from a blank file tomorrow.

   3. NO SPACED REPETITION
      AI is great at explaining today and does nothing to
      make you remember next month.
      Fix: put the key ideas into Anki (or RemNote, Mochi).
      AI may draft the cards; FSRS schedules the reviews.
```

</details>

### FSRS — the modern spaced-repetition algorithm

![Infographic: FSRS, review just before you forget. FSRS tracks difficulty, stability and retrievability per card; stability S is the number of days until recall falls to 90%. Formula R(t, S) = (1 + f times t / S) to the power minus w, where f makes R(S, S) = 90% and w is fitted to your reviews. Toy model for S = 10 days: recall 99% on day 1, 90% on day 10 (review here), 81% on day 30, 69% on day 100; bar chart of reviews per card versus the 90% default: 80% 0.3x, 85% 0.5x, 90% 1.0x, 95% 2.5x, 97% 4.5x, 99% 14.6x. Anki setup as of Nov 2026 (turn on FSRS, retention 90% and below 97%, learning steps under 1 day, Optimize about monthly, 5 to 10 new cards a day), SM-2 contrast, and the trap: pressing Hard on a miss makes every interval too long.](diagrams/brain05_info_fsrs_spaced_repetition_ai.png)

<details>
<summary><strong>Read as text</strong> — the idea, SM-2 vs FSRS and the Anki settings</summary>

**Simple explanation.** Every card has its own forgetting clock. FSRS estimates, card by card, the day your chance of remembering it will drop to 90% — and shows it to you then. Earlier wastes your time; much later and you have to relearn it.

> **Rule of thumb:** keep Anki's *desired retention* at the default 90%. For a given card, 95% means about 2.5× as many reviews, 97% about 4.5× and 99% about 15× (toy calculation below); Anki's manual says the workload rises very quickly above 90% and advises staying below 97%.

**The formal version.**

- **SM-2** (Piotr Woźniak, 1987; Anki's older default, now called "legacy"): each card has an *ease factor* that starts at 2.5. The gaps go 1 day → 6 days → previous gap × ease. A grade from 0 to 5 nudges the ease up or down; a failed card starts again.
- **FSRS** (Free Spaced Repetition Scheduler; Ye et al., KDD 2022; Su et al., IEEE TKDE 2023) tracks three numbers per card: **D**ifficulty, **S**tability and **R**etrievability (the "DSR" model). *Stability* is the number of days until your chance of recall falls to 90%. The FSRS-6 forgetting curve is `R(t, S) = (1 + f·t/S)^(−w)`, where f is fixed so that R(S, S) = 90% and the decay w is fitted, together with 20 other parameters, to YOUR review history. Each successful review raises S; a lapse cuts it.
- Anki's manual reports that with FSRS you need fewer reviews than with SM-2 for the same retention, because it predicts forgetting more accurately.

**FSRS in Anki (as of November 2026; current release 26.09):**

| Anki version | What changed |
|---|---|
| 23.10 (2023) | FSRS built in as an option (Deck Options → FSRS) |
| 25.07 (July 2025) | FSRS-6: the forgetting-curve decay is learned per user; "Compute minimum recommended retention" removed |
| 25.09 (September 2025) | Desired retention can be set per deck |

| Step | Setting | Why |
|---|---|---|
| 1 | Turn on **FSRS** at the bottom of Deck Options (one switch for all presets) | It is opt-in; SM-2 is used otherwise |
| 2 | Keep (re)learning steps under one day (the default `1m 10m` is fine) | Steps of a day or more fight FSRS's own scheduling |
| 3 | Desired retention **90%** (the default); stay below 97% | Above 90% the workload climbs fast; the "Help Me Decide" simulator in Deck Options shows your own workload curve |
| 4 | Press **Optimize** once you have a few hundred reviews, then about monthly | The optimizer fits the parameters to your memory and needs data |
| 5 | Press **Again** whenever you forgot; **Hard** means "recalled, with effort" | Pressing Hard on a miss makes every interval too long |
| 6 | Add new cards slowly (start with 5–10 a day) | Anki's manual: 20 new cards a day leads to roughly 200 reviews a day (toy estimate in §5.2.2) |

The program below draws the FSRS-6 forgetting curve for one card and shows why the default of 90% is a sweet spot. Unlike the simple exponential toy curve in §5.1, FSRS uses a power curve whose tail falls more slowly. It is still a toy: it keeps the card's stability fixed, while in real use stability grows after every successful review.

</details>

```python
# FSRS forgetting curve: recall probability R(t, S), and the review gap that hits a desired retention
DECAY_FSRS6 = 0.1542   # FSRS-6 default decay w20 (the optimizer re-fits it to YOUR history)
DECAY_FSRS5 = 0.5      # fixed decay used by FSRS-4.5 and FSRS-5

def factor(decay):
    return 0.9 ** (-1 / decay) - 1              # chosen so that R(S, S) = 0.9

def recall(t, S, decay=DECAY_FSRS6):
    """Probability of recalling a card t days after its last review."""
    return (1 + factor(decay) * t / S) ** (-decay)

def gap(r, S, decay=DECAY_FSRS6):
    """Days until recall falls to the desired retention r (the inverse of recall)."""
    return S / factor(decay) * (r ** (-1 / decay) - 1)

S = 10                                          # stability: 10 days until recall hits 90%
print(f"Card with stability S = {S} days")
for t in [1, 10, 30, 100]:
    print(f"  day {t:>3}: recall {recall(t, S):.0%} (FSRS-6 curve) vs {recall(t, S, DECAY_FSRS5):.0%} (FSRS-5 curve)")

print("\nDesired retention -> next review gap -> how often you see this card (vs 90%)")
for r in [0.80, 0.85, 0.90, 0.95, 0.97, 0.99]:
    g = gap(r, S)
    print(f"  {r:.0%}: review after {g:4.1f} days -> {gap(0.90, S) / g:.1f}x as often")

assert abs(recall(S, S) - 0.9) < 1e-9 and abs(gap(0.9, S) - S) < 1e-9
```

**Output:**

```
Card with stability S = 10 days
  day   1: recall 99% (FSRS-6 curve) vs 99% (FSRS-5 curve)
  day  10: recall 90% (FSRS-6 curve) vs 90% (FSRS-5 curve)
  day  30: recall 81% (FSRS-6 curve) vs 77% (FSRS-5 curve)
  day 100: recall 69% (FSRS-6 curve) vs 55% (FSRS-5 curve)

Desired retention -> next review gap -> how often you see this card (vs 90%)
  80%: review after 33.2 days -> 0.3x as often
  85%: review after 19.1 days -> 0.5x as often
  90%: review after 10.0 days -> 1.0x as often
  95%: review after  4.0 days -> 2.5x as often
  97%: review after  2.2 days -> 4.5x as often
  99%: review after  0.7 days -> 14.6x as often
```

<details>
<summary><strong>Read as text</strong> — continued: coding an SM-2 scheduler</summary>

Interviewers sometimes ask you to code a scheduler. SM-2 fits in about 15 lines; the run below follows one card through seven reviews, including a lapse (grade 1), and then compares an easy card with a hard one.

</details>

```python
# SM-2 (SuperMemo 2, Wozniak 1987): how one card's interval and ease factor evolve
import math

def sm2(card, q):
    """Update a card after one review graded q (0 = blackout ... 5 = perfect)."""
    if q < 3:                               # forgot: start the card again, keep its ease
        card["reps"], card["interval"] = 0, 1
        return card
    card["reps"] += 1
    if card["reps"] == 1:
        card["interval"] = 1
    elif card["reps"] == 2:
        card["interval"] = 6
    else:                                   # SM-2 rounds fractional days UP
        card["interval"] = math.ceil(round(card["interval"] * card["ease"], 6))
    card["ease"] = round(max(1.3, card["ease"] + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), 2)
    return card

def run(grades):
    card, day, rows = {"reps": 0, "interval": 0, "ease": 2.5}, 0, []
    for q in grades:
        sm2(card, q)
        day += card["interval"]
        rows.append((q, card["interval"], card["ease"], day))
    return rows

print("grade | next gap (days) | ease | next review on day")
for q, gap, ease, day in run([5, 4, 4, 3, 1, 4, 5]):
    print(f"{q:>5} | {gap:>15} | {ease:.2f} | {day:>18}")

easy, hard = run([5] * 6), run([3] * 6)
print(f"\nSix 'perfect' reviews reach day {easy[-1][3]}; six 'barely' reviews reach day {hard[-1][3]}")
assert [r[1] for r in easy[:2]] == [1, 6] and easy[-1][3] > hard[-1][3]
```

**Output:**

```
grade | next gap (days) | ease | next review on day
    5 |               1 | 2.60 |                  1
    4 |               6 | 2.60 |                  7
    4 |              16 | 2.60 |                 23
    3 |              42 | 2.46 |                 65
    1 |               1 | 2.46 |                 66
    4 |               1 | 2.46 |                 67
    5 |               6 | 2.56 |                 73

Six 'perfect' reviews reach day 632; six 'barely' reviews reach day 217
```

<details>
<summary><strong>Read as text</strong> — continued: the weakness FSRS fixes</summary>

Notice the weakness FSRS fixes: after the lapse, SM-2 throws away everything it knew about the card and starts again at 1 day, and its ease factor is a fixed formula rather than something learned from your own history.

</details>

---

## 5.12 Cognitive Biases & Learning Myths

> **Key number:** in a survey of 242 teachers in the UK and the Netherlands, more than 80% believed the learning-styles and left-brain/right-brain myths (Dekker et al., 2012). Smart, motivated people believe these too — check the evidence, not the popularity.

![Infographic: 5 biases and 7 myths that waste study time. Key number: more than 80% of 242 UK and Dutch teachers believed the learning-styles and left/right-brain myths (Dekker et al., 2012). Left column, biases with fixes: Dunning-Kruger (bottom scorers at the 12th percentile rated themselves about 62nd, test yourself without notes), illusion of competence (active recall), planning fallacy (predicted 34 days, took 55, plan from past actual times), sunk cost (would I choose this today), confirmation bias (write edge cases first). Right column, myths stamped made up, not supported, myth, mostly false or misreading: learning pyramid, learning styles, 10% of the brain (2% of body weight, 20% of energy), left vs right-brained people (1,011 scans), Mozart effect, brain-training apps (Lumosity paid USD 2 million to the FTC in 2016), 10,000-hour rule (26% games, 21% music, 18% sports, 4% education, under 1% professions).](diagrams/brain05_info_biases_and_myths_ai.png)

### Biases that sabotage learning

<details>
<summary><strong>Read as text</strong> — five biases, the evidence and the fix</summary>

| Bias | How it shows up when you study (evidence) | Fix |
|---|---|---|
| **Dunning–Kruger effect** — over-confidence when skill is low | "I read it, I get it." Bottom-quarter scorers (12th percentile) placed themselves around the 62nd (Kruger & Dunning, 1999). Part of this pattern is a statistical artefact (Gignac & Zajenkowski, 2020), but the lesson stands: feelings are poor judges of skill | Test yourself without notes; trust scores, not feelings |
| **Illusion of competence** (fluency illusion) | Re-reading and highlighting feel productive. In a survey of 177 students most relied on re-reading and few tested themselves (Karpicke, Butler & Roediger, 2009) | Active recall every session (§5.2.1) |
| **Planning fallacy** | "I'll finish the DP chapter by Friday." Thesis students predicted 34 days and took 55; only 30% finished by their own best estimate (Buehler, Griffin & Ross, 1994) | Plan from how long similar work *actually* took you (the "outside view"), then add a buffer |
| **Sunk-cost fallacy** | "I've spent 3 weeks on this course; I can't switch now" (Arkes & Blumer, 1985) | Ask: would I choose this if I were starting today? |
| **Confirmation bias** | You test only the inputs you expect to pass (Nickerson, 1998) | Write the edge cases first: empty input, one element, duplicates, the largest size |

</details>

### Myths to stop believing

<details>
<summary><strong>Read as text</strong> — seven myths and what the evidence says</summary>

All seven are widely repeated, and none holds up.

| Myth | Verdict | What the evidence says |
|---|---|---|
| **Learning pyramid** ("we remember 10% of what we read and 90% of what we teach") | Made up | The percentages come from no study. Versions of the pyramid have circulated for over 160 years without data (Letrud, 2012; Letrud & Hernes, 2018) |
| **Learning styles** (visual / auditory / kinaesthetic) | Not supported | No good evidence that matching teaching to a person's "style" helps (Pashler et al., 2008). A 2024 meta-analysis found a small average effect, but only about a quarter of outcomes showed the predicted pattern and the studies were low quality — "too small and too infrequent" to act on (Clinton-Lisell & Litzinger, 2024). Match the method to the *content* instead — diagrams for architectures, code for algorithms — for everyone |
| **We use only 10% of our brain** | Myth | Brain imaging shows every region active over a day, and damage to almost any area causes problems (Beyerstein, 1999). The brain is about 2% of body weight yet uses about 20% of the body's energy (Raichle & Gusnard, 2002) — an organ that expensive is not 90% idle |
| **Left-brained vs right-brained people** | Myth | Some functions are lateralised (much of language sits on the left), but a scan study of 1,011 people found no "left-brained" or "right-brained" individuals (Nielsen et al., 2013) |
| **Mozart effect** (classical music makes you smarter) | Myth | The 1993 study (36 students) found a short-lived boost on a spatial task, not on IQ (Rauscher et al., 1993). A meta-analysis of about 40 studies (over 3,000 people) found other music works about as well as Mozart and little evidence of a specific effect (Pietschnig et al., 2010); the lift is best explained by arousal and mood (Thompson et al., 2001) |
| **Brain-training apps make you generally smarter** | Mostly false | You get better at the trained games and close variants, with little evidence of gains in everyday thinking (Simons et al., 2016). In 2016 Lumosity's maker paid USD 2 million to settle US Federal Trade Commission charges of deceptive claims. A 20-year follow-up of the ACTIVE trial linked speed-of-processing training plus booster sessions with fewer dementia diagnoses (hazard ratio 0.75; Coe et al., 2026), but it is one result and a reanalysis questions it — see [Ch 5B](#content/05b_brain_upgrade_30_days) |
| **The 10,000-hour rule** | Misreading | Ericsson et al. (1993) reported the *average* practice time of the best violinists, not a rule. Across domains, deliberate practice explains 26% of performance differences in games, 21% in music, 18% in sports, 4% in education and under 1% in professions (Macnamara et al., 2014). Practice matters, but its *quality* (§5.2.6) and other factors matter too |

</details>

---

## 5.13 Common Mistakes That Kill Learning

![Infographic: What to Fix First, a 6-step ladder. Start at the bottom rung and fix the first No before moving up: 1 sleeping 7-9 h with a fixed wake time (same wake time daily for 2 weeks), 2 active recall vs re-reading (blank-page recall after every section), 3 spaced repetition (Anki + FSRS at 90%, add 5-10 cards a day), 4 habit tied to a time and place (an if-cue-then-action plan), 5 attempting problems before asking AI (try first, ask for a hint), 6 about 150 min/week of moderate exercise (30-min brisk walks on 5 days, WHO); all yes means go build the project. A mistakes-to-fixes table (re-reading, cramming, multitasking, asking AI for the answer first, tutorial hell) and the trap of letting AI write code you don't understand.](diagrams/brain05_info_what_to_fix_first_ai.png)

<details>
<summary><strong>Read as text</strong> — 13 mistakes and their fixes</summary>

| Mistake | Fix |
|---|---|
| Re-reading instead of testing yourself | Active recall — close the book, write what you remember |
| Highlighting everything | Write short notes in your own words instead |
| Cramming before the deadline | Spread the same hours over weeks (spaced repetition) |
| Multitasking while studying | Single-task; phone in another room |
| Studying only what you already know | Practise what you are BAD at (deliberate practice) |
| Skimping on sleep | 7–9 hours with a fixed wake time; sleep consolidates memory (§5.6) |
| Learning without applying | Build a small project; solve problems; apply it the same week |
| Tutorial hell (passive watching) | After one tutorial, build something solo |
| No spaced-review system | Anki + FSRS, 10–15 minutes a day |
| Asking AI for the answer before trying | Attempt first; ask for a hint, not the solution |
| Reading AI explanations passively | Close the chat, write what you remember, then compare |
| Letting AI write code you don't understand | Re-derive it line by line; re-solve from a blank file the next day |
| Comparing yourself to others | Compare with yourself 3 months ago |

</details>

---

## 5.14 FAQ

**Q: I'm 35 or 45 — am I too old to learn ML?**

No. The brain stays plastic throughout life: in a randomised trial of 120 adults aged about 55–80, a year of walking increased hippocampus volume by about 2% (Erickson et al., 2011). Learning may feel slower than at 18, but the techniques in §5.2 work at any age, and you bring more prior knowledge to hang new ideas on.

**Q: I have ADHD — does any of this apply to me?**

Yes, with adaptations. The structure in this chapter — short focus blocks, a fixed cue for starting, external reminders, if-then plans and regular exercise — is often helpful, and some has direct evidence: if-then plans improved response inhibition in children with ADHD (Gawrilow & Gollwitzer, 2008). Cut extraneous load hard: one tab, one task. If you suspect ADHD, get a clinical assessment and discuss treatment options with a professional.

**Q: Should I study in the morning or the evening?**

Partly a matter of chronotype, which is partly inherited. Put your hardest work at the time of day you feel sharpest. Whatever your schedule, protect a normal night's sleep after study: sleep after learning helps consolidate it, and an all-nighter does the opposite (§5.6).

**Q: Is "learning while sleeping" (audio under the pillow) real?**

Not for new material. What does have evidence is *targeted memory reactivation*: replaying a cue (a sound or smell) linked to something you studied while awake, during deep non-REM sleep. A meta-analysis of 91 experiments (2,004 people) found a small benefit (Hedges' g = 0.29) and no benefit during REM sleep or wakefulness (Hu et al., 2020). It is a lab technique, not a study plan.

**Q: How long should I study per day?**

Quality beats quantity. Two to four hours of focused, deliberate practice with breaks beats eight hours of shallow study. Even the elite violinists in Ericsson et al. (1993) did only about 3–4 hours of solo practice a day.

**Q: Can I just use AI for everything now?**

Use AI for explanation, problem generation, feedback and Socratic dialogue. You cannot outsource the **retrieval** itself — your brain has to do the remembering. In Bastani et al. (2025) students who let GPT-4 do the work scored 17% lower once it was taken away. AI multiplies good study habits; it replaces none of them.

**Q: I'm preparing for a Google ML interview specifically. What's the minimum stack?**

Sleep 7–9 hours with a fixed wake time. Anki + FSRS, 10–15 minutes a day. Active recall on every chapter. Mixed (interleaved) problem practice — [Ch 31](#content/31_dsa_foundations) and the [DSA practice page](#dsa-practice). One Socratic AI session a week to find blind spots. If you must cut, cut everything else first.

---

## 5.15 Decision Tree — What to Fix First

<details>
<summary><strong>Read as text</strong> — the decision tree, one question at a time</summary>

```
   Where to invest first if you're starting fresh:

       │
       ▼
   Sleeping 7–9 h with a fixed wake time?
       │
       ├── No  → Fix this first: sleep loss directly hurts
       │         attention and memory (§5.6). Same wake time
       │         daily for 2 weeks.
       │
       └── Yes ▼
   Actively recalling material (vs re-reading)?
       │
       ├── No  → Blank-page recall after every section.
       │         Stop highlighting. Stop re-reading.
       │
       └── Yes ▼
   Spaced-repetition system in place?
       │
       ├── No  → Install Anki, enable FSRS, keep 90%.
       │         Add 5–10 cards a day; review every morning.
       │
       └── Yes ▼
   Habit anchored to a specific time and place?
       │
       ├── No  → Write an implementation intention:
       │         "If [cue], then I will [action]."
       │
       └── Yes ▼
   Attempting problems BEFORE asking AI?
       │
       ├── No  → Try first; then ask for a hint, not the
       │         answer. Use a study / learning mode.
       │
       └── Yes ▼
   About 150 min/week of moderate exercise?
       │
       ├── No  → Start with 30-min brisk walks on 5 days
       │         (WHO guideline; protocol in Ch 5B).
       │
       └── Yes → Foundations done. Go build the project.
```

</details>

---

## 5.16 Hello World — Code That Helps You Study

### A Pomodoro planner (Python, no dependencies)

A timer that sleeps for 25 minutes cannot run on this page, so this version plans the session instead: it turns a focus/break pattern into a clock schedule. Change the numbers to plan your own day.

```python
# Pomodoro planner: turn "25/5 x 4, then a long break" into a clock schedule (no timers, no input)
from datetime import datetime, timedelta

def plan(start, work, short_break, long_break, cycles):
    t, rows = datetime.strptime(start, "%H:%M"), []
    for i in range(1, cycles + 1):
        rows.append((t, work, f"focus {i}/{cycles} - phone in another room"))
        t += timedelta(minutes=work)
        rest = long_break if i == cycles else short_break
        rows.append((t, rest, "long break" if i == cycles else "break - stand up, look away"))
        t += timedelta(minutes=rest)
    return rows

def show(title, rows):
    print(title)
    for t, minutes, label in rows:
        end = t + timedelta(minutes=minutes)
        print(f"  {t:%H:%M}-{end:%H:%M}  {label}")
    focus = sum(m for _, m, label in rows if label.startswith("focus"))
    print(f"  focus time: {focus} min of {sum(m for _, m, _ in rows)} min\n")
    return focus

classic = show("Classic 25/5 x 4 (Cirillo)", plan("09:00", 25, 5, 20, 4))
longer = show("Longer blocks 50/10 x 2", plan("09:00", 50, 10, 20, 2))
assert classic == longer == 100
```

**Output:**

```
Classic 25/5 x 4 (Cirillo)
  09:00-09:25  focus 1/4 - phone in another room
  09:25-09:30  break - stand up, look away
  09:30-09:55  focus 2/4 - phone in another room
  09:55-10:00  break - stand up, look away
  10:00-10:25  focus 3/4 - phone in another room
  10:25-10:30  break - stand up, look away
  10:30-10:55  focus 4/4 - phone in another room
  10:55-11:15  long break
  focus time: 100 min of 135 min

Longer blocks 50/10 x 2
  09:00-09:50  focus 1/2 - phone in another room
  09:50-10:00  break - stand up, look away
  10:00-10:50  focus 2/2 - phone in another room
  10:50-11:10  long break
  focus time: 100 min of 130 min
```

Same 100 minutes of focus either way; longer blocks save a few minutes of switching once you can hold attention that long (§5.8).

### Draft Anki cards from your notes (Claude API)

This needs an API key and the network, so it runs on your own machine, not on this page. It drafts tab-separated cards that Anki imports directly — edit them before you study.

```python
# Runs locally: pip install anthropic; needs ANTHROPIC_API_KEY
from pathlib import Path
import anthropic

PROMPT = """Turn the notes below into 10 atomic Anki cards.
Rules: one idea per card; the front asks WHY or HOW, not just WHAT;
the back answers in 1-3 sentences in plain words.
Output ONLY one card per line: front, one tab character, back.

NOTES:
{notes}"""

notes = Path("ch05_notes.md").read_text(encoding="utf-8")
client = anthropic.Anthropic()                     # reads ANTHROPIC_API_KEY
resp = client.messages.create(
    model="claude-sonnet-5-5",                     # verified model ID, Nov 2026 (Ch 17 §4)
    max_tokens=4000,                               # thinking + answer share this cap
    messages=[{"role": "user", "content": PROMPT.format(notes=notes)}],
)
text = "".join(b.text for b in resp.content if b.type == "text")  # skip thinking blocks
rows = [line for line in text.splitlines() if line.count("\t") == 1]
Path("anki_import.txt").write_text("\n".join(rows) + "\n", encoding="utf-8")
print(f"{len(rows)} cards written; in Anki: File > Import, separator = Tab")
```

The reply can start with a `thinking` block before the text, so the code joins only the `text` blocks instead of reading `resp.content[0]`.

---

## 5.17 Quick Reference Cheat Sheet

```
   ┌────────────────────────────────────────────────────────────────────┐
   │  EVIDENCE-BASED LEARNING — 1-PAGE CARD                             │
   ├────────────────────────────────────────────────────────────────────┤
   │                                                                    │
   │  HIGH UTILITY (Dunlosky et al., 2013):                             │
   │  1. Active recall      — close the book, write from memory         │
   │  2. Spaced repetition  — Anki + FSRS, 10–15 min a day              │
   │  SUPPORTING (moderate evidence, or for skills):                    │
   │  3. Feynman technique  — explain it simply (to a person or an AI)  │
   │  4. Interleaving       — mix problem types, don't block them       │
   │  5. Elaboration        — ask "why?" for every fact                 │
   │  6. Deliberate practice — specific goal + feedback + stretch       │
   │                                                                    │
   │  TWO PRINCIPLES:                                                   │
   │  ▸ Desirable difficulty — effortful learning lasts longer          │
   │  ▸ Cognitive load       — ~4 chunks; cut the extraneous            │
   │                                                                    │
   │  PHYSICAL FOUNDATION (protocols: Ch 5B):                           │
   │  Sleep 7–9 h with a fixed wake time.                               │
   │  About 150 min/week of moderate exercise.                          │
   │  Hard work first, easy stimulation after.                          │
   │                                                                    │
   │  FOCUS:                                                            │
   │  Pomodoro 25/5 or 50/10 — one goal per block,                      │
   │  and a break before you are exhausted.                             │
   │  Phone in another room; notifications off.                         │
   │  Interrupted work is resumed ~23–25 min later on                   │
   │  average (Mark) — time to RESUME, not to refocus.                  │
   │                                                                    │
   │  HABITS:                                                           │
   │  If-then plan: "If [cue], then I will [action]."                   │
   │  2-minute rule. Identity: "I am someone who studies daily."        │
   │                                                                    │
   │  AI LEARNING STACK (Nov 2026):                                     │
   │  ▸ Study / learning modes — hints, not answers                     │
   │  ▸ Gemini Notebook (ex-NotebookLM) — quizzes from YOUR notes       │
   │  ▸ Chatbots — Feynman partner, problem generator                   │
   │  ▸ Anki + FSRS (90%) — the scheduler; AI only drafts cards         │
   │  Rule: attempt first, then ask for a hint.                         │
   │                                                                    │
   │  WHEN MOTIVATION = ZERO:                                           │
   │  Action comes before motivation — start with 5 minutes.            │
   │  Move, get daylight, contact someone.                              │
   │  Low mood or lost interest for 2+ weeks → see a professional.      │
   │  Any thoughts of self-harm → your local emergency number           │
   │  or a crisis line now (e.g. US 988, India Tele-MANAS 14416).       │
   │                                                                    │
   │  IF OVERWHELMED, START WITH JUST THREE THINGS:                     │
   │  1. Fix sleep (7–9 h, fixed wake time).                            │
   │  2. Active recall on every chapter (close the book).               │
   │  3. Anki + FSRS, 10–15 min a day. That's it.                       │
   └────────────────────────────────────────────────────────────────────┘
```

---

## 5.18 Review Questions

Questions 1–13 cover the whole chapter; 14–20 test details from §5.1–5.10. Try each one aloud or on paper before opening the answers.

1. Why does re-reading feel productive but produce poor retention? Name two replacements.
2. Your friend says they "learn best as a visual learner." What does the research say, and what should they do instead?
3. You have 30 minutes before an ML interview. Spaced repetition or active recall? Justify.
4. Define an implementation intention and write one for "study every morning."
5. A junior engineer says "I just need to put in 10,000 hours." What's the correction?
6. What's the difference between intrinsic, extraneous and germane cognitive load? Give an example of each when studying transformers.
7. You can't focus on a topic that excites you. List three plausible causes and one fix for each.
8. Walk through one full AI Feynman session. What's the prompt? What do you do with the AI's push-back?
9. A friend has felt low for 3 weeks, sleeps poorly and enjoys nothing. What evidence-based steps can help, and when and how should they get professional help?
10. You're using ChatGPT to "learn ML" by asking it to explain everything. Why is this likely failing, and how do you fix it without abandoning AI?
11. In Bastani et al. (2025), why did plain GPT-4 raise practice scores but lower exam scores, and what design removed the harm?
12. Anki asks for your "desired retention." What does 90% mean, and why not set it to 99%?
13. A colleague says "we only use 10% of our brains — and I'm right-brained anyway." What does the evidence say?
14. Ebbinghaus's famous "about a third after one day" measures what, exactly?
15. You add 20 new Anki cards a day with reviews at +1, 3, 7, 14, 30 and 60 days. Roughly how many cards a day will you face after about 4 months, and why does that matter?
16. A friend says memory champions have bigger hippocampi. Correct them.
17. A friend says "it takes 23 minutes to refocus after a Slack ping." What did the research actually measure?
18. A toy habit model says the median new habit is only about 61% automatic on day 21. What two lessons follow?
19. Name the three conditions for flow, and one popular flow claim that is NOT established science.
20. Why is "cold showers boost dopamine by 250%" misleading?

<details>
<summary><strong>Answers</strong> — short model answers</summary>

1. Re-reading makes the text *familiar*, and familiarity feels like knowing (the fluency illusion), but it never practises *retrieving* the idea — which is what an interview asks for. Replace it with active recall (blank page, self-quiz, flashcards) and spaced reviews.
2. Matching teaching to a "style" has no good support (Pashler et al., 2008); a 2024 meta-analysis found only small, inconsistent effects in weak studies. Everyone learns better from words plus pictures (dual coding, §5.4) and from the format that fits the content.
3. Active recall. Spacing works over days and weeks, so 30 minutes is too late for it; a quick retrieval pass (a blank-page summary of your top topics, a few flashcards) warms up exactly what you will need. Spacing is what you should do in the weeks before.
4. An if-then plan that ties a behaviour to a cue: "If it is 7:00 on a weekday and I have made coffee, then I will sit at my desk and do 15 minutes of Anki before anything else."
5. The figure was an *average* for elite violinists (Ericsson et al., 1993), popularised as a rule. What counts is deliberate practice — specific goals, feedback, stretch — and even that explains only part of performance: 26% in games down to under 1% in professions (Macnamara et al., 2014).
6. Intrinsic: the material's own complexity (how queries, keys and values interact). Extraneous: load from poor presentation (notation that changes between the paper and the code). Germane: effort that builds understanding (drawing the attention flow yourself and explaining why scores are divided by sqrt(d_k)).
7. Too big or too hard → make the first step 5–10 minutes long. Tired or under-slept → fix sleep and schedule hard topics when you are fresh. Phone and cheap stimulation competing → phone in another room, hard work first. If it lasts weeks together with low mood → see §5.10.6.
8. Prompt: "I'll explain X; stop me where I'm vague or wrong and ask what a senior interviewer would ask next." Explain from memory; treat every push-back as a gap; go back to the source only for that gap; explain again; turn the gap into a flashcard.
9. Behavioural activation (schedule small, valued activities and do them whatever the mood), daily movement, morning daylight, regular sleep and wake times, and contact with people. Low mood and lost enjoyment for 2+ weeks is the usual signal to see a doctor or mental-health professional — at 3 weeks, book that appointment now. Any thoughts of self-harm: contact the local emergency number or a crisis line immediately (for example 988 in the US, Tele-MANAS 14416 in India).
10. Reading explanations is passive (like re-reading) and lets the AI do the generating; Bastani et al. (2025) showed that this pattern cuts unaided performance. Keep the AI but flip the roles: attempt first, use a study / learning mode or a "hints only" prompt, close the chat and recall, put the key points into Anki, and test yourself on new problems.
11. With plain GPT-4 most students asked for answers and copied them, so practice scores rose without learning; on the exam without AI they scored 17% below the no-AI group — and they did not notice. The "GPT Tutor" prompt gave hints and would not hand over answers, so students did the work; the harm on the exam largely disappeared.
12. FSRS schedules each card for the day its predicted chance of recall falls to 90%, so you should pass about 9 in 10 due cards. A higher target shortens every gap: in the toy calculation 97% means seeing a card about 4.5 times as often and 99% about 15 times. Anki's manual advises staying below 97%.
13. Imaging shows every brain region is active over a day, damage almost anywhere causes deficits, and the brain uses about 20% of the body's energy at about 2% of its weight — it is not 90% idle. Some functions are lateralised, but a study of 1,011 brain scans found no "left-brained" or "right-brained" people (Nielsen et al., 2013).
14. *Savings*: the share of the original learning time Ebbinghaus did NOT need when he relearned a list of nonsense syllables. It is not the percentage of items recalled.
15. About 20 × (1 + 6) = 140 cards a day — roughly 19 minutes at 8 seconds a card (toy estimate, §5.2.2; Anki's manual says roughly 200 for 20 new cards a day). Choose your new-cards-per-day for the steady-state load, not for how easy week 1 feels.
16. Maguire et al. (2003) found no structural brain differences and no exceptional IQ in memory champions — they used the method of loci. In Dresler et al. (2017), ordinary people who trained the method for 40 days went from 26 to 62 of 72 words.
17. Gloria Mark's office-shadowing studies measured how long until people *returned* to an interrupted task — about 23 minutes on average (25 min 26 s in the 2005 paper), usually after about two other tasks. It is not a measure of how long concentration takes to recover.
18. (1) Judging a habit at "21 days" is too early: the median plateau is about 66 days, with a range of 18–254 (Lally et al., 2010). (2) One missed day barely matters (Lally found no material effect), so aim for "never miss twice" rather than "never miss".
19. Challenge slightly above your current skill, a clear goal, and immediate feedback (Nakamura & Csikszentmihalyi, 2002). The "make it 4% harder" rule and the four-stage flow cycle come from popular books, not controlled studies.
20. The figures come from 1 hour of head-out immersion in 14 °C water (Šrámek et al., 2000), not a short shower, and mood was not measured.

</details>

---

## 5.19 References (selected)

Every study cited in this chapter, grouped by section and verified in November 2026 (journal pages, PubMed, Crossref or the official source).

**Memory and study techniques (§5.1–5.5)**

- Adesope, O. O., Trevisan, D. A., & Sundararajan, N. (2017). Rethinking the use of tests: A meta-analysis of practice testing. *Review of Educational Research*, 87(3), 659–701.
- Atkinson, R. C., & Shiffrin, R. M. (1968). Human memory: A proposed system and its control processes. In K. W. Spence & J. T. Spence (Eds.), *The Psychology of Learning and Motivation* (Vol. 2, pp. 89–195). Academic Press.
- Baddeley, A. D., & Hitch, G. (1974). Working memory. *Psychology of Learning and Motivation*, 8, 47–89.
- Bjork, E. L., & Bjork, R. A. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning. In M. A. Gernsbacher et al. (Eds.), *Psychology and the Real World* (pp. 56–64). Worth.
- Bjork, R. A. (1994). Memory and metamemory considerations in the training of human beings. In J. Metcalfe & A. P. Shimamura (Eds.), *Metacognition: Knowing about Knowing* (pp. 185–205). MIT Press.
- Bower, G. H., & Clark, M. C. (1969). Narrative stories as mediators for serial learning. *Psychonomic Science*, 14(4), 181–182.
- Brunmair, M., & Richter, T. (2019). Similarity matters: A meta-analysis of interleaved learning and its moderators. *Psychological Bulletin*, 145(11), 1029–1052.
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin*, 132(3), 354–380.
- Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T., & Pashler, H. (2008). Spacing effects in learning: A temporal ridgeline of optimal retention. *Psychological Science*, 19(11), 1095–1102.
- Chase, W. G., & Simon, H. A. (1973). Perception in chess. *Cognitive Psychology*, 4(1), 55–81.
- Cowan, N. (2001). The magical number 4 in short-term memory: A reconsideration of mental storage capacity. *Behavioral and Brain Sciences*, 24(1), 87–114.
- de Groot, A. D. (1965). *Thought and Choice in Chess*. Mouton (Dutch original 1946).
- Draganski, B., et al. (2004). Neuroplasticity: Changes in grey matter induced by training. *Nature*, 427, 311–312.
- Dresler, M., et al. (2017). Mnemonic training reshapes brain networks to support superior memory. *Neuron*, 93(5), 1227–1235.
- Dumitru, I., et al. (2025). Identification of proliferating neural progenitors in the adult human hippocampus. *Science*, 389(6755), 58–63.
- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques: Promising directions from cognitive and educational psychology. *Psychological Science in the Public Interest*, 14(1), 4–58.
- Ebbinghaus, H. (1885). *Über das Gedächtnis*. Duncker & Humblot. English translation (1913): *Memory: A Contribution to Experimental Psychology*.
- Ericsson, K. A., Krampe, R. T., & Tesch-Römer, C. (1993). The role of deliberate practice in the acquisition of expert performance. *Psychological Review*, 100(3), 363–406.
- Ericsson, K. A., & Pool, R. (2016). *Peak: Secrets from the New Science of Expertise*. Houghton Mifflin Harcourt.
- Fiorella, L., & Mayer, R. E. (2013). The relative benefits of learning by teaching and teaching expectancy. *Contemporary Educational Psychology*, 38(4), 281–288.
- Forte, T. (2022). *Building a Second Brain*. Atria.
- Gladwell, M. (2008). *Outliers: The Story of Success*. Little, Brown.
- Goodstein, D. L. (1989). Richard P. Feynman, teacher. *Physics Today*, 42(2), 70–75.
- Hebb, D. O. (1949). *The Organization of Behavior*. Wiley.
- Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist*, 38(1), 23–31.
- Karpicke, J. D., & Blunt, J. R. (2011). Retrieval practice produces more learning than elaborative studying with concept mapping. *Science*, 331(6018), 772–775.
- Latimier, A., Peyre, H., & Ramus, F. (2021). A meta-analytic review of the benefit of spacing out retrieval practice episodes on retention. *Educational Psychology Review*, 33(3), 959–987.
- Löwel, S., & Singer, W. (1992). Selection of intrinsic horizontal connections in the visual cortex by correlated neuronal activity. *Science*, 255(5041), 209–212.
- Maguire, E. A., Valentine, E. R., Wilding, J. M., & Kapur, N. (2003). Routes to remembering: The brains behind superior memory. *Nature Neuroscience*, 6(1), 90–95.
- McKenzie, I. A., et al. (2014). Motor skill learning requires active central myelination. *Science*, 346(6207), 318–322.
- Miller, G. A. (1956). The magical number seven, plus or minus two: Some limits on our capacity for processing information. *Psychological Review*, 63(2), 81–97.
- Mueller, P. A., & Oppenheimer, D. M. (2014). The pen is mightier than the keyboard: Advantages of longhand over laptop note taking. *Psychological Science*, 25(6), 1159–1168.
- Murre, J. M. J., & Dros, J. (2015). Replication and analysis of Ebbinghaus' forgetting curve. *PLoS ONE*, 10(7), e0120644.
- Paivio, A. (1971). *Imagery and Verbal Processes*. Holt, Rinehart & Winston.
- Pauk, W. (1962). *How to Study in College*. Houghton Mifflin.
- Peterson, L. R., & Peterson, M. J. (1959). Short-term retention of individual verbal items. *Journal of Experimental Psychology*, 58(3), 193–198.
- Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science*, 35(6), 481–498.
- Santurkar, S., Tsipras, D., Ilyas, A., & Madry, A. (2018). How does batch normalization help optimization? *Advances in Neural Information Processing Systems (NeurIPS)*, 31.
- Shatz, C. J. (1992). The developing brain. *Scientific American*, 267(3), 60–67.
- Slamecka, N. J., & Graf, P. (1978). The generation effect: Delineation of a phenomenon. *Journal of Experimental Psychology: Human Learning and Memory*, 4(6), 592–604.
- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science*, 12(2), 257–285.
- Sweller, J. (2010). Element interactivity and intrinsic, extraneous, and germane cognitive load. *Educational Psychology Review*, 22(2), 123–138.
- Sweller, J., & Cooper, G. A. (1985). The use of worked examples as a substitute for problem solving in learning algebra. *Cognition and Instruction*, 2(1), 59–89.
- Urry, H. L., et al. (2021). Don't ditch the laptop just yet: A direct replication of Mueller and Oppenheimer's (2014) Study 1 plus mini meta-analyses across similar studies. *Psychological Science*, 32(3), 326–339.
- Wilson, R. C., Shenhav, A., Straccia, M., & Cohen, J. D. (2019). The Eighty Five Percent Rule for optimal learning. *Nature Communications*, 10, 4646.
- Wozniak, P. A. (1999). *Effective learning: Twenty rules of formulating knowledge*. SuperMemo.
- Yang, C., Luo, L., Vadillo, M. A., Yu, R., & Shanks, D. R. (2021). Testing (quizzing) boosts classroom learning: A systematic and meta-analytic review. *Psychological Bulletin*, 147(4), 399–435.

**Body, focus, habits and mood (§5.6–5.10)**

- Berridge, K. C., & Robinson, T. E. (1998). What is the role of dopamine in reward: Hedonic impact, reward learning, or incentive salience? *Brain Research Reviews*, 28(3), 309–369.
- Bialystok, E., Craik, F. I. M., & Freedman, M. (2007). Bilingualism as a protection against the onset of symptoms of dementia. *Neuropsychologia*, 45(2), 459–464.
- Biwer, F., Wiradhany, W., oude Egbrink, M. G. A., & de Bruin, A. B. H. (2023). Understanding effort regulation: Comparing "Pomodoro" breaks and self-regulated breaks. *British Journal of Educational Psychology*, 93(S2), 353–367.
- Böttger, T., Poschik, M., & Zierer, K. (2023). Does the brain drain effect really exist? A meta-analysis. *Behavioral Sciences*, 13(9), 751.
- Bull, F. C., et al. (2020). World Health Organization 2020 guidelines on physical activity and sedentary behaviour. *British Journal of Sports Medicine*, 54(24), 1451–1462.
- Cirillo, F. (2006). *The Pomodoro Technique* (book edition: Currency, 2018).
- Clear, J. (2018). *Atomic Habits*. Avery.
- Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience*. Harper & Row.
- Diekelmann, S., & Born, J. (2010). The memory function of sleep. *Nature Reviews Neuroscience*, 11(2), 114–126.
- Dimidjian, S., et al. (2006). Randomized trial of behavioral activation, cognitive therapy, and antidepressant medication in the acute treatment of adults with major depression. *Journal of Consulting and Clinical Psychology*, 74(4), 658–670.
- Doran, G. T. (1981). There's a S.M.A.R.T. way to write management's goals and objectives. *Management Review*, 70(11), 35–36.
- Drake, C., Roehrs, T., Shambroom, J., & Roth, T. (2013). Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. *Journal of Clinical Sleep Medicine*, 9(11), 1195–1200.
- Duhigg, C. (2012). *The Power of Habit*. Random House.
- Ekers, D., et al. (2014). Behavioural activation for depression; an update of meta-analysis of effectiveness and sub group analysis. *PLoS ONE*, 9(6), e100100.
- Erickson, K. I., et al. (2011). Exercise training increases size of hippocampus and improves memory. *PNAS*, 108(7), 3017–3022.
- Gais, S., Lucas, B., & Born, J. (2006). Sleep after learning aids memory recall. *Learning & Memory*, 13(3), 259–262.
- Gallup (2006). Too many interruptions at work? *Gallup Management Journal* (interview with Gloria Mark).
- Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. *American Psychologist*, 54(7), 493–503.
- Gollwitzer, P. M., & Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis of effects and processes. *Advances in Experimental Social Psychology*, 38, 69–119.
- Gothe, N. P., & McAuley, E. (2015). Yoga and cognition: A meta-analysis of chronic and acute effects. *Psychosomatic Medicine*, 77(7), 784–797.
- Hagger, M. S., et al. (2016). A multilab preregistered replication of the ego-depletion effect. *Perspectives on Psychological Science*, 11(4), 546–573.
- Hillman, C. H., Erickson, K. I., & Kramer, A. F. (2008). Be smart, exercise your heart: Exercise effects on brain and cognition. *Nature Reviews Neuroscience*, 9(1), 58–65.
- Kleitman, N. (1982). Basic rest-activity cycle — 22 years later. *Sleep*, 5(4), 311–317.
- Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. *European Journal of Social Psychology*, 40(6), 998–1009.
- Leroy, S. (2009). Why is it so hard to do my work? The challenge of attention residue when switching between work tasks. *Organizational Behavior and Human Decision Processes*, 109(2), 168–181.
- Leroy, S., & Glomb, T. M. (2018). Tasks interrupted: How anticipating time pressure on resumption of an interrupted task causes attention residue and low performance on interrupting tasks and how a "ready-to-resume" plan mitigates the effects. *Organization Science*, 29(3), 380–397.
- Locke, E. A., & Latham, G. P. (2002). Building a practically useful theory of goal setting and task motivation: A 35-year odyssey. *American Psychologist*, 57(9), 705–717.
- Mark, G. (2023). *Attention Span*. Hanover Square Press.
- Mark, G., Gonzalez, V. M., & Harris, J. (2005). No task left behind? Examining the nature of fragmented work. *Proceedings of CHI 2005*, 321–330.
- Mark, G., Gudith, D., & Klocke, U. (2008). The cost of interrupted work: More speed and stress. *Proceedings of CHI 2008*, 107–110.
- Melby-Lervåg, M., Redick, T. S., & Hulme, C. (2016). Working memory training does not improve performance on measures of intelligence or other measures of "far transfer". *Perspectives on Psychological Science*, 11(4), 512–534.
- Menegaz de Almeida, A., et al. (2025). Bright light therapy for nonseasonal depressive disorders: A systematic review and meta-analysis. *JAMA Psychiatry*, 82(1), 38–46.
- Miao, A., et al. (2024). Brain clearance is reduced during sleep and anesthesia. *Nature Neuroscience*, 27(6), 1046–1050.
- Milkman, K. L., Minson, J. A., & Volpp, K. G. M. (2014). Holding the Hunger Games hostage at the gym: An evaluation of temptation bundling. *Management Science*, 60(2), 283–299.
- Mukadam, N., Sommerlad, A., & Livingston, G. (2017). The relationship of bilingualism compared to monolingualism to the risk of cognitive decline or dementia: A systematic review and meta-analysis. *Journal of Alzheimer's Disease*, 58(1), 45–54.
- Nakamura, J., & Csikszentmihalyi, M. (2002). The concept of flow. In C. R. Snyder & S. J. Lopez (Eds.), *Handbook of Positive Psychology* (pp. 89–105). Oxford University Press.
- National Institute of Mental Health. *Depression* (health information page), accessed November 2026.
- Newport, C. (2016). *Deep Work*. Grand Central.
- Noetel, M., et al. (2024). Effect of exercise for depression: Systematic review and network meta-analysis of randomised controlled trials. *BMJ*, 384, e075847.
- Raichle, M. E., & Gusnard, D. A. (2002). Appraising the brain's energy budget. *PNAS*, 99(16), 10237–10239.
- Rehfeld, K., et al. (2018). Dance training is superior to repetitive physical exercise in inducing brain plasticity in the elderly. *PLoS ONE*, 13(7), e0196636.
- Richards, D. A., et al. (2016). Cost and outcome of behavioural activation versus cognitive behavioural therapy for depression (COBRA): A randomised, controlled, non-inferiority trial. *The Lancet*, 388(10047), 871–880.
- Roig, M., Nordbrandt, S., Geertsen, S. S., & Nielsen, J. B. (2013). The effects of cardiovascular exercise on human memory: A review with meta-analysis. *Neuroscience & Biobehavioral Reviews*, 37(8), 1645–1666.
- Schlaug, G., Norton, A., Overy, K., & Winner, E. (2005). Effects of music training on the child's brain and cognitive development. *Annals of the New York Academy of Sciences*, 1060, 219–230.
- Schultz, W., Dayan, P., & Montague, P. R. (1997). A neural substrate of prediction and reward. *Science*, 275(5306), 1593–1599.
- Sheeran, P., Listrom, O., & Gollwitzer, P. M. (2024). The when and how of planning: Meta-analysis of the scope and components of implementation intentions in 642 tests. *European Review of Social Psychology*, 36(1), 162–194.
- Singh, B., Murphy, A., Maher, C., & Smith, A. E. (2024). Time to form a habit: A systematic review and meta-analysis of health behaviour habit formation and its determinants. *Healthcare*, 12(23), 2488.
- Smits, E. J. C., Wenzel, N., & de Bruin, A. (2025). Investigating the effectiveness of Pomodoro, Flowtime, and self-regulated break-taking techniques among students. *Behavioral Sciences*, 15(7), 861.
- Šrámek, P., Šimečková, M., Janský, L., Šavlíková, J., & Vybíral, S. (2000). Human physiological responses to immersion into water of different temperatures. *European Journal of Applied Physiology*, 81(5), 436–442.
- Stothart, C., Mitchum, A., & Yehnert, C. (2015). The attentional cost of receiving a cell phone notification. *Journal of Experimental Psychology: Human Perception and Performance*, 41(4), 893–897.
- Van Dongen, H. P. A., Maislin, G., Mullington, J. M., & Dinges, D. F. (2003). The cumulative cost of additional wakefulness: Dose-response effects on neurobehavioral functions and sleep physiology from chronic sleep restriction and total sleep deprivation. *Sleep*, 26(2), 117–126.
- Voelcker-Rehage, C., Godde, B., & Staudinger, U. M. (2011). Cardiovascular and coordination training differentially improve cognitive performance and neural processing in older adults. *Frontiers in Human Neuroscience*, 5, 26.
- Watson, N. F., et al. (2015). Recommended amount of sleep for a healthy adult: A joint consensus statement of the American Academy of Sleep Medicine and Sleep Research Society. *Sleep*, 38(6), 843–844.
- Wayne, P. M., et al. (2014). Effect of tai chi on cognitive performance in older adults: Systematic review and meta-analysis. *Journal of the American Geriatrics Society*, 62(1), 25–39.
- Xie, L., et al. (2013). Sleep drives metabolite clearance from the adult brain. *Science*, 342(6156), 373–377.
- Yoo, S.-S., Hu, P. T., Gujar, N., Jolesz, F. A., & Walker, M. P. (2007). A deficit in the ability to form new human memories without sleep. *Nature Neuroscience*, 10(3), 385–392.

**AI, spaced-repetition algorithms, biases and myths (§5.11–5.15)**

- Anki Manual (2026). *Deck Options — FSRS*, docs.ankiweb.net; and the Anki release notes 23.10–26.09, github.com/ankitects/anki/releases. Accessed November 2026.
- Arkes, H. R., & Blumer, C. (1985). The psychology of sunk cost. *Organizational Behavior and Human Decision Processes*, 35(1), 124–140.
- Bastani, H., Bastani, O., Sungu, A., Ge, H., Kabakcı, Ö., & Mariman, R. (2025). Generative AI without guardrails can harm learning: Evidence from high school mathematics. *PNAS*, 122(26), e2422633122.
- Beyerstein, B. L. (1999). Whence cometh the myth that we only use 10% of our brains? In S. Della Sala (Ed.), *Mind Myths: Exploring Popular Assumptions about the Mind and Brain*. Wiley.
- Buehler, R., Griffin, D., & Ross, M. (1994). Exploring the "planning fallacy": Why people underestimate their task completion times. *Journal of Personality and Social Psychology*, 67(3), 366–381.
- Clinton-Lisell, V., & Litzinger, C. (2024). Is it really a neuromyth? A meta-analysis of the learning styles matching hypothesis. *Frontiers in Psychology*, 15, 1428732.
- Coe, N. B., et al. (2026). Impact of cognitive training on claims-based diagnosed dementia over 20 years: Evidence from the ACTIVE study. *Alzheimer's & Dementia: Translational Research & Clinical Interventions*, 12(1), e70197.
- Dekker, S., Lee, N. C., Howard-Jones, P., & Jolles, J. (2012). Neuromyths in education: Prevalence and predictors of misconceptions among teachers. *Frontiers in Psychology*, 3, 429.
- De Simone, M. E., et al. (2025). *From Chalkboards to Chatbots: Evaluating the Impact of Generative AI on Learning Outcomes in Nigeria*. World Bank Policy Research Working Paper 11125.
- Dickens, W. T. (2026). Reanalyzing the impact of cognitive training over 20 years in the ACTIVE study: Losing the forest in the trees. *Alzheimer's & Dementia: Translational Research & Clinical Interventions*, 12(2), e70280.
- Federal Trade Commission (2016, January 5). Press release: Lumosity to pay USD 2 million to settle FTC deceptive advertising charges for its "brain training" program.
- Gawrilow, C., & Gollwitzer, P. M. (2008). Implementation intentions facilitate response inhibition in children with ADHD. *Cognitive Therapy and Research*, 32(2), 261–280.
- Gignac, G. E., & Zajenkowski, M. (2020). The Dunning-Kruger effect is (mostly) a statistical artefact: Valid approaches to testing the hypothesis with individual differences data. *Intelligence*, 80, 101449.
- Google (2025, August 6). *Guided Learning in Gemini: From answers to understanding*; Google (2026, July 16). *NotebookLM is now Gemini Notebook*. blog.google.
- Hu, X., Cheng, L. Y., Chiu, M. H., & Paller, K. A. (2020). Promoting memory consolidation during sleep: A meta-analysis of targeted memory reactivation. *Psychological Bulletin*, 146(3), 218–244.
- Karpicke, J. D., Butler, A. C., & Roediger, H. L. (2009). Metacognitive strategies in student learning: Do students practise retrieval when they study on their own? *Memory*, 17(4), 471–479.
- Kestin, G., Miller, K., Klales, A., Milbourne, T., & Ponti, G. (2025). AI tutoring outperforms in-class active learning: An RCT introducing a novel research-based design in an authentic educational setting. *Scientific Reports*, 15, 17458.
- Kosmyna, N., et al. (2025). Your brain on ChatGPT: Accumulation of cognitive debt when using an AI assistant for essay writing task. arXiv:2506.08872 (preprint; v2 December 2025).
- Kruger, J., & Dunning, D. (1999). Unskilled and unaware of it: How difficulties in recognizing one's own incompetence lead to inflated self-assessments. *Journal of Personality and Social Psychology*, 77(6), 1121–1134.
- Letrud, K. (2012). A rebuttal of NTL Institute's learning pyramid. *Education*, 133(1), 117–124.
- Letrud, K., & Hernes, S. (2018). Excavating the origins of the learning pyramid myths. *Cogent Education*, 5(1), 1518638.
- Macnamara, B. N., Hambrick, D. Z., & Oswald, F. L. (2014). Deliberate practice and performance in music, games, sports, education, and professions: A meta-analysis. *Psychological Science*, 25(8), 1608–1618.
- Nickerson, R. S. (1998). Confirmation bias: A ubiquitous phenomenon in many guises. *Review of General Psychology*, 2(2), 175–220.
- Nielsen, J. A., Zielinski, B. A., Ferguson, M. A., Lainhart, J. E., & Anderson, J. S. (2013). An evaluation of the left-brain vs. right-brain hypothesis with resting state functional connectivity magnetic resonance imaging. *PLoS ONE*, 8(8), e71275.
- OpenAI (2025, July 29). *Introducing study mode*. openai.com.
- Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. *Psychological Science in the Public Interest*, 9(3), 105–119.
- Pietschnig, J., Voracek, M., & Formann, A. K. (2010). Mozart effect–Shmozart effect: A meta-analysis. *Intelligence*, 38(3), 314–323.
- Rauscher, F. H., Shaw, G. L., & Ky, K. N. (1993). Music and spatial task performance. *Nature*, 365, 611.
- Simons, D. J., et al. (2016). Do "brain-training" programs work? *Psychological Science in the Public Interest*, 17(3), 103–186.
- Stanković, M., Hirche, E., Kollatzsch, S., & Doetsch, J. N. (2025). Comment on: Your brain on ChatGPT: Accumulation of cognitive debt when using an AI assistant for essay writing tasks. arXiv:2601.00856.
- Su, J., Ye, J., Nie, L., Cao, Y., & Chen, Y. (2023). Optimizing spaced repetition schedule by capturing the dynamics of memory. *IEEE Transactions on Knowledge and Data Engineering*, 35(10), 10085–10097.
- Thompson, W. F., Schellenberg, E. G., & Husain, G. (2001). Arousal, mood, and the Mozart effect. *Psychological Science*, 12(3), 248–251.
- Wozniak, P. A. (1990). *Optimization of Learning* (master's thesis, Poznań University of Technology) — describes the SM-2 algorithm (1987).
- Ye, J., Su, J., & Cao, Y. (2022). A stochastic shortest path algorithm for optimizing spaced repetition scheduling. *Proceedings of KDD 2022*, 4381–4390.

---

## Key Takeaways

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  BRAIN TRAINING — HOW TO LEARN & STAY SHARP                                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  HOW MEMORY WORKS                                                            ║
║    • Sensory → working (~4 chunks, seconds) → long-term                      ║
║    • Forgetting is fastest in the first hour: review within a day            ║
║    • Toy model: cramming wins tomorrow, spacing wins next month              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  THE TECHNIQUES (high utility first)                                         ║
║    • Practice testing (g ≈ 0.50 in classrooms) + spacing: high utility       ║
║    • Spaced retrieval beats massed (g ≈ 0.74); gap ≈ 10–20% of time-to-test  ║
║    • Moderate: interleaving, elaboration, self-explanation (Feynman)         ║
║    • Deliberate practice: goal + feedback + stretch (aim ~85% right)         ║
║    • Practice explains 26% (games) … <1% (jobs): no 10,000-hour rule         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  DESIRABLE DIFFICULTY & LOAD                                                 ║
║    • Effortful retrieval = durable learning (if you can succeed)             ║
║    • Manage intrinsic load; cut extraneous; chunk; words + visuals           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  SLEEP, EXERCISE & FOCUS (protocols: Ch 5B)                                  ║
║    • 6 h/night for 2 weeks ≈ up to 2 nights of no sleep in lapses            ║
║    • One cardio bout near study helps later recall (SMD 0.52)                ║
║    • Transfer is narrow: practise the real skill, not brain games            ║
║    • '23 min' = time to RESUME a task, not to refocus: protect blocks        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  HABITS & MOOD                                                               ║
║    • If-then plans (d ≈ 0.65); habits plateau in ~66 days (18–254)           ║
║    • One missed day doesn't matter — just never miss twice                   ║
║    • Low mood: act first, in 5-minute steps (behavioural activation)         ║
║    • 2+ weeks of low mood or lost interest → see a professional              ║
║    • Thoughts of self-harm → emergency number or crisis line now             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  AI, FSRS & MYTHS (as of Nov 2026)                                           ║
║    • AI that hints helps; AI that answers can hurt (−17% unaided)            ║
║    • Anki + FSRS: 90% retention, steps < 1 day, Again = forgot               ║
║    • Review load ≈ new cards/day × 7: add new cards slowly                   ║
║    • No learning styles, no 10% brain, no Mozart effect                      ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

**Previous:** [Chapter 04 — Aptitude & Mental Math](#content/04_aptitude_mental_math) &middot; **Next:** [Chapter 5B — Build a Sharper, Younger Brain](#content/05b_brain_upgrade_30_days) &middot; **See also:** [★ DL & LLMs Playbook](#content/00p_dl_llm_playbook) &middot; [Ch 00 Cheat Sheet](#content/00_quick_reference_cheat_sheet)
