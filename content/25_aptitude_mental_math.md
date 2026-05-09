# Chapter 25 — Aptitude & Mental Math for Engineers

> "The ability to estimate quickly and reason logically under pressure separates good engineers from great ones."

Technical interviews test more than algorithms. When a system design interviewer asks "how much storage does this need?" or "what's the expected QPS?", you need to estimate quickly — no calculator, no Google. Aptitude and mental math are muscles. This chapter is your gym. Each section gives you the formulas, shows worked examples, then throws problems at you in escalating difficulty. The goal: 30 minutes of daily practice until these calculations become reflexive.

---

## What You'll Learn

- Mental math shortcuts that let you estimate in seconds
- Number series and pattern recognition techniques
- Percentage, ratio, and proportion tricks used in business logic
- Time-speed-distance and time-work problem strategies
- Probability and combinatorics from first principles
- Logical reasoning frameworks for interview puzzles
- Data interpretation — reading charts fast and accurately
- Fermi estimation — the single most important skill for system design interviews
- Classic brain teasers and how to approach them
- A daily practice plan to build lasting speed

---

## 25.1 Mental Math Shortcuts & Number Sense

Every engineer should have a set of numbers burned into memory. These are the constants you reach for when estimating system capacity, algorithm complexity, or back-of-envelope calculations.

### Powers of 2 — The Engineer's Multiplication Table

```
┌──────┬──────────────┬────────────────────┐
│ 2^n  │ Exact Value  │ Approximation      │
├──────┼──────────────┼────────────────────┤
│ 2^10 │ 1,024        │ ~1 Thousand (1 KB) │
│ 2^16 │ 65,536       │ ~65 Thousand       │
│ 2^20 │ 1,048,576    │ ~1 Million (1 MB)  │
│ 2^30 │ 1,073,741,824│ ~1 Billion (1 GB)  │
│ 2^32 │ 4,294,967,296│ ~4 Billion         │
│ 2^40 │ ~1.1 Trillion│ ~1 Trillion (1 TB) │
│ 2^50 │              │ ~1 Quadrillion(1PB)│
└──────┴──────────────┴────────────────────┘
```

### Quick Multiplication Tricks

**Multiply by 11:**
$$ 11 \times N = \text{split digits of N, insert their sum in the middle} $$
Example: $11 \times 36$ → split 3 and 6, insert $3+6=9$ → **396**
For carry: $11 \times 87$ → $8+7=15$ → insert 5, carry 1 → **957**

**Multiply by 25:**
$$ 25 \times N = \frac{N}{4} \times 100 $$
Example: $25 \times 48 = 12 \times 100 = 1200$

**Multiply by 99 or 999:**
$$ 99 \times N = 100N - N $$
Example: $99 \times 37 = 3700 - 37 = 3663$

**Squaring numbers near 50:**
$$ N^2 = (25 + (N - 50)) \times 100 + (N - 50)^2 $$
Example: $53^2 = (25 + 3) \times 100 + 9 = 2809$

**Squaring numbers near 100:**
$$ N^2 = N + (N - 100) \text{ (first two digits)} \times 100 + (N - 100)^2 $$
Example: $103^2 = (103 + 3) \times 100 + 9 = 10609$

**Squaring any two-digit number (general):**
$$ (a \cdot 10 + b)^2 = a^2 \times 100 + 2ab \times 10 + b^2 $$

### Percentage Shortcuts

```
┌─────────────────────────────────────────────────────────┐
│ 10% of X  = X ÷ 10                                     │
│ 5% of X   = half of 10%                                │
│ 15% of X  = 10% + 5% = 10% + half of 10%              │
│ 20% of X  = X ÷ 5                                      │
│ 25% of X  = X ÷ 4                                      │
│ 33% of X  ≈ X ÷ 3                                      │
│ 1% of X   = X ÷ 100                                    │
│ Tip: 17.5% of X = 10% + 5% + 2.5%                     │
└─────────────────────────────────────────────────────────┘
```

### Fraction-Decimal-Percent Conversions (Memorize These)

```
┌──────────┬──────────┬──────────┐
│ Fraction │ Decimal  │ Percent  │
├──────────┼──────────┼──────────┤
│ 1/2      │ 0.5      │ 50%      │
│ 1/3      │ 0.333    │ 33.3%    │
│ 1/4      │ 0.25     │ 25%      │
│ 1/5      │ 0.2      │ 20%      │
│ 1/6      │ 0.167    │ 16.7%    │
│ 1/7      │ 0.143    │ 14.3%    │
│ 1/8      │ 0.125    │ 12.5%    │
│ 1/9      │ 0.111    │ 11.1%    │
│ 1/10     │ 0.1      │ 10%      │
│ 1/12     │ 0.083    │ 8.3%     │
│ 3/8      │ 0.375    │ 37.5%    │
│ 5/8      │ 0.625    │ 62.5%    │
│ 7/8      │ 0.875    │ 87.5%    │
└──────────┴──────────┴──────────┘
```

### Rule of 72

$$ \text{Doubling time} = \frac{72}{\text{rate \%}} $$

At 8% annual growth, money doubles in $72/8 = 9$ years.
At 6% growth, $72/6 = 12$ years.

This works for anything that grows exponentially — user base, data volume, compound interest.

### Engineer's Numbers (Memorize)

```
┌───────────────────────────────────────────────────────┐
│ Seconds in a minute      : 60                         │
│ Seconds in an hour       : 3,600                      │
│ Seconds in a day         : 86,400 ≈ 10^5              │
│ Seconds in a year        : 31,536,000 ≈ 3 × 10^7     │
│ 1M users × 1 KB each     = 1 GB                      │
│ 1M users × 1 MB each     = 1 TB                      │
│ 1 Gbps network           = ~125 MB/s                  │
│ 1 SSD read               = ~500 MB/s                  │
│ 1 HDD read               = ~100 MB/s                  │
│ DNS lookup                = ~10 ms                    │
│ Round trip same datacenter= ~0.5 ms                   │
│ Round trip US coast to coast = ~40 ms                 │
│ Round trip US ↔ Europe    = ~80 ms                    │
│ 1 million QPS             = ~12 per second per server │
│                             (with ~80K servers)       │
└───────────────────────────────────────────────────────┘
```

### Practice Problems

**P1 (Easy).** What is $2^{17}$?

<details><summary>Answer</summary>

$2^{17} = 2^{10} \times 2^7 = 1024 \times 128 = 131,072$. In interviews, saying "about 128K" is perfectly fine.
</details>

**P2 (Easy).** Calculate $25 \times 84$ mentally.

<details><summary>Answer</summary>

$25 \times 84 = 84/4 \times 100 = 21 \times 100 = 2100$
</details>

**P3 (Easy).** What is 15% of 240?

<details><summary>Answer</summary>

10% of 240 = 24. 5% = 12. Total = 24 + 12 = **36**
</details>

**P4 (Easy).** A dataset grows at 12% per year. How long until it doubles?

<details><summary>Answer</summary>

Rule of 72: $72/12 = 6$ years.
</details>

**P5 (Easy).** Convert 5/8 to a percentage.

<details><summary>Answer</summary>

$5/8 = 0.625 = 62.5\%$
</details>

**P6 (Medium).** Calculate $11 \times 78$ mentally.

<details><summary>Answer</summary>

Split 7 and 8, sum = 15. Insert 5, carry 1. → $7+1 = 8$, so **858**.
</details>

**P7 (Medium).** Calculate $47^2$ mentally.

<details><summary>Answer</summary>

$47 = 50 - 3$. Using the near-50 shortcut: $(25 + (-3)) \times 100 + (-3)^2 = 22 \times 100 + 9 = 2209$.
</details>

**P8 (Medium).** Your service handles 1 billion requests per day. What is the average QPS?

<details><summary>Answer</summary>

$10^9 / 10^5 = 10^4 = 10{,}000$ QPS (using seconds-in-a-day ≈ $10^5$). More precisely: $10^9 / 86400 \approx 11{,}574$ QPS.
</details>

**P9 (Medium).** You store 500 million user profiles at 2 KB each. How much storage?

<details><summary>Answer</summary>

$500 \times 10^6 \times 2 \times 10^3 = 10^{12}$ bytes = **1 TB**
</details>

**P10 (Medium).** Calculate $99 \times 56$ mentally.

<details><summary>Answer</summary>

$99 \times 56 = 100 \times 56 - 56 = 5600 - 56 = 5544$
</details>

**P11 (Medium).** $17.5\%$ of 800?

<details><summary>Answer</summary>

$10\% = 80$. $5\% = 40$. $2.5\% = 20$. Total = $80 + 40 + 20 = 140$.
</details>

**P12 (Hard).** Approximate $\sqrt{150}$ without a calculator.

<details><summary>Answer</summary>

$12^2 = 144$, $13^2 = 169$. So $\sqrt{150}$ is between 12 and 13, closer to 12. Linear interpolation: $12 + (150-144)/(169-144) = 12 + 6/25 = 12.24$. Actual: $12.247...$
</details>

**P13 (Hard).** A system writes 50 MB/s continuously. How much storage per month?

<details><summary>Answer</summary>

Seconds per month ≈ $30 \times 86400 \approx 2.6 \times 10^6$. Storage = $50 \times 2.6 \times 10^6 = 1.3 \times 10^8$ MB = $130$ TB.
</details>

**P14 (Hard).** Calculate $103^2$ mentally.

<details><summary>Answer</summary>

$(103 + 3) \times 100 + 3^2 = 106 \times 100 + 9 = 10609$
</details>

**P15 (Hard).** If a model processes 1 token every 20ms, how many tokens per second? If a response averages 500 tokens, what's the latency?

<details><summary>Answer</summary>

$1000/20 = 50$ tokens/second. For 500 tokens: $500/50 = 10$ seconds.
</details>

---

## 25.2 Number Series & Pattern Recognition

Pattern recognition is a core reasoning skill. In interviews and aptitude tests, you see a sequence and must find the rule. The strategy is systematic: compute differences, look for known patterns, and check your rule against all given terms.

### Key Formulas

**Arithmetic Progression (AP):**
$$ a_n = a + (n-1)d \qquad S_n = \frac{n}{2}[2a + (n-1)d] = \frac{n(a + l)}{2} $$

Where $a$ = first term, $d$ = common difference, $l$ = last term.

**Geometric Progression (GP):**
$$ a_n = ar^{n-1} \qquad S_n = \frac{a(r^n - 1)}{r - 1} \quad (r \neq 1) $$

**Sum of first $n$ natural numbers:** $\frac{n(n+1)}{2}$

**Sum of squares:** $\frac{n(n+1)(2n+1)}{6}$

**Sum of cubes:** $\left[\frac{n(n+1)}{2}\right]^2$

### Strategy: Always Compute Differences First

```
Sequence:    2,  5, 10, 17, 26, ?
Diff 1:        3,  5,  7,  9, ?
Diff 2:          2,  2,  2
```

If first differences are constant → AP. If second differences are constant → quadratic pattern. If differences form a GP → the original is related to a GP.

### Common Pattern Types

| Pattern | Example | Rule |
|---------|---------|------|
| AP | 3, 7, 11, 15, ... | +4 each time |
| GP | 2, 6, 18, 54, ... | ×3 each time |
| Squares | 1, 4, 9, 16, 25, ... | $n^2$ |
| Cubes | 1, 8, 27, 64, ... | $n^3$ |
| Fibonacci-like | 1, 1, 2, 3, 5, 8, ... | each = sum of previous two |
| Prime-based | 2, 3, 5, 7, 11, ... | consecutive primes |
| Alternating | 1, -2, 3, -4, 5, ... | alternating sign |
| Factorial | 1, 2, 6, 24, 120, ... | $n!$ |
| Triangular | 1, 3, 6, 10, 15, ... | $n(n+1)/2$ |

### Solved Examples

**Example 1:** Find the next term: 3, 8, 15, 24, 35, ?

Differences: 5, 7, 9, 11 → increasing by 2. Next difference = 13. Answer = $35 + 13 = 48$.
Pattern: $n^2 + 2n$ gives $3, 8, 15, 24, 35, 48$.

**Example 2:** Find the next term: 2, 6, 18, 54, ?

Each term × 3 = next term. GP with $r=3$. Answer = $54 \times 3 = 162$.

**Example 3:** Find the next term: 1, 4, 13, 40, 121, ?

Differences: 3, 9, 27, 81 → these are powers of 3. Next difference = 243. Answer = $121 + 243 = 364$.

### Practice Problems

**P1 (Easy).** 5, 11, 17, 23, 29, ?

<details><summary>Answer</summary>

AP with $d = 6$. Next = $29 + 6 = 35$.
</details>

**P2 (Easy).** 3, 6, 12, 24, 48, ?

<details><summary>Answer</summary>

GP with $r = 2$. Next = $48 \times 2 = 96$.
</details>

**P3 (Easy).** 1, 4, 9, 16, 25, ?

<details><summary>Answer</summary>

Perfect squares: $n^2$. Next = $6^2 = 36$.
</details>

**P4 (Easy).** 2, 3, 5, 7, 11, 13, ?

<details><summary>Answer</summary>

Prime numbers. Next prime = **17**.
</details>

**P5 (Easy).** 1, 1, 2, 3, 5, 8, 13, ?

<details><summary>Answer</summary>

Fibonacci. $8 + 13 = 21$.
</details>

**P6 (Medium).** 2, 5, 11, 23, 47, ?

<details><summary>Answer</summary>

Pattern: $\times 2 + 1$. $2 \to 5, 5 \to 11, 11 \to 23, 23 \to 47$. Next = $47 \times 2 + 1 = 95$.
</details>

**P7 (Medium).** 4, 7, 12, 19, 28, ?

<details><summary>Answer</summary>

Differences: 3, 5, 7, 9 → AP with $d=2$. Next diff = 11. Answer = $28 + 11 = 39$.
</details>

**P8 (Medium).** 1, 2, 6, 24, 120, ?

<details><summary>Answer</summary>

Factorials: $1!, 2!, 3!, 4!, 5!$. Next = $6! = 720$.
</details>

**P9 (Medium).** 0, 1, 1, 2, 4, 7, 13, ?

<details><summary>Answer</summary>

Tribonacci: each term = sum of previous 3. $4 + 7 + 13 = 24$.
</details>

**P10 (Medium).** 3, 5, 9, 17, 33, ?

<details><summary>Answer</summary>

Differences: 2, 4, 8, 16 → powers of 2. Next diff = 32. Answer = $33 + 32 = 65$.
Alternatively: $a_n = 2a_{n-1} - 1$. $2 \times 33 - 1 = 65$.
</details>

**P11 (Medium).** 2, 12, 36, 80, 150, ?

<details><summary>Answer</summary>

$n(n+1)^2$: $1 \times 4 = 4$... Let's check differences.
Diff 1: 10, 24, 44, 70. Diff 2: 14, 20, 26. Diff 3: 6, 6.
Next diff 2 = $26 + 6 = 32$. Next diff 1 = $70 + 32 = 102$. Answer = $150 + 102 = 252$.
Pattern: $n^2(n+1)$: $1, 12, 36, 80, 150, 252$. ✓
</details>

**P12 (Medium).** 5, 10, 13, 26, 29, 58, ?

<details><summary>Answer</summary>

Alternating operations: $\times 2, +3, \times 2, +3, \times 2, ...$
$5 \xrightarrow{\times 2} 10 \xrightarrow{+3} 13 \xrightarrow{\times 2} 26 \xrightarrow{+3} 29 \xrightarrow{\times 2} 58 \xrightarrow{+3} 61$. Answer = **61**.
</details>

**P13 (Hard).** 1, 5, 14, 30, 55, ?

<details><summary>Answer</summary>

These are pyramidal numbers: $\frac{n(n+1)(2n+1)}{6}$. For $n=6$: $6 \times 7 \times 13 / 6 = 91$.
Alternatively, differences: 4, 9, 16, 25 → perfect squares! Next diff = $36$. Answer = $55 + 36 = 91$.
</details>

**P14 (Hard).** 2, 1, 2, 4, 8, 32, ?

<details><summary>Answer</summary>

Each term = product of previous two. $1 \times 2 = 2, 2 \times 4 = 8, 4 \times 8 = 32, 8 \times 32 = 256$.
</details>

**P15 (Hard).** 6, 11, 21, 36, 56, ?

<details><summary>Answer</summary>

Differences: 5, 10, 15, 20 → AP with $d=5$. Next diff = 25. Answer = $56 + 25 = 81$.
</details>

**P16 (Hard).** What is the sum of the first 50 terms of the AP: 3, 7, 11, 15, ...?

<details><summary>Answer</summary>

$a = 3, d = 4, n = 50$. $S_{50} = \frac{50}{2}[2(3) + 49(4)] = 25[6 + 196] = 25 \times 202 = 5050$.
</details>

**P17 (Hard).** 0, 6, 24, 60, 120, 210, ?

<details><summary>Answer</summary>

$n^3 - n = n(n-1)(n+1)$: $0, 6, 24, 60, 120, 210$. For $n=7$: $343 - 7 = 336$.
</details>

**P18 (Hard).** The 5th term of an AP is 23 and the 12th term is 58. Find the 20th term.

<details><summary>Answer</summary>

$a + 4d = 23$ and $a + 11d = 58$. Subtracting: $7d = 35 \Rightarrow d = 5$. So $a = 23 - 20 = 3$.
$a_{20} = 3 + 19 \times 5 = 3 + 95 = 98$.
</details>

---

## 25.3 Percentages, Profit & Loss, Ratios

These come up in business logic, A/B testing analysis, and surprisingly often in system design discussions ("if we reduce latency by 20%, what's the impact on throughput?").

### Key Formulas

$$ \text{Profit \%} = \frac{\text{SP} - \text{CP}}{\text{CP}} \times 100 $$

$$ \text{Discount \%} = \frac{\text{MP} - \text{SP}}{\text{MP}} \times 100 $$

**Successive percentage changes:** For two successive changes of $a\%$ and $b\%$:
$$ \text{Net change} = a + b + \frac{ab}{100} \quad \% $$

**Tip:** For successive discounts of 20% and 10%, don't add to 30%. It's $1 - 0.8 \times 0.9 = 1 - 0.72 = 0.28 = 28\%$.

**Ratio shortcut:** If $A:B = 3:4$ and $B:C = 2:5$, make $B$ common: $A:B = 6:8$ and $B:C = 8:20$, so $A:B:C = 6:8:20 = 3:4:10$.

**Mixture/Alligation Rule:** To find the ratio for mixing two items at prices $C_1$ and $C_2$ to get a mixture at price $C_m$:

```
     C₁          C₂
      \          /
       \        /
        \      /
          Cm
        /      \
       /        \
      /          \
  |C₂ - Cm| : |Cm - C₁|
```

### Solved Examples

**Example 1:** An item costs $80 (CP). It's marked up to $120 (MP) and sold at a 10% discount. Find the profit%.

SP = $120 \times 0.9 = 108$. Profit = $108 - 80 = 28$. Profit% = $28/80 \times 100 = 35\%$.

**Example 2:** A price increases by 20% then decreases by 20%. What's the net change?

Net = $20 + (-20) + \frac{20 \times (-20)}{100} = 0 - 4 = -4\%$. The price is 4% lower than the original.

**Example 3:** Mix milk at $40/liter with water (free) to get a mixture worth $30/liter. What ratio?

Alligation: milk:water = $(30 - 0) : (40 - 30) = 30:10 = 3:1$.

### Practice Problems

**P1 (Easy).** A shirt bought for $50 is sold for $65. What is the profit%?

<details><summary>Answer</summary>

Profit = $15. Profit% = $15/50 \times 100 = 30\%$.
</details>

**P2 (Easy).** What is 35% of 600?

<details><summary>Answer</summary>

$35\% = 30\% + 5\% = 180 + 30 = 210$.
</details>

**P3 (Easy).** If A:B = 2:3 and B:C = 4:5, find A:C.

<details><summary>Answer</summary>

$A:B = 8:12$, $B:C = 12:15$. So $A:B:C = 8:12:15$. $A:C = 8:15$.
</details>

**P4 (Easy).** A product is marked at $200 and sold at a 15% discount. Find the selling price.

<details><summary>Answer</summary>

$SP = 200 \times 0.85 = 170$.
</details>

**P5 (Easy).** A number is increased by 25%. By what percent must it be decreased to get back to the original?

<details><summary>Answer</summary>

New = $1.25x$. To get back: decrease by $\frac{0.25x}{1.25x} \times 100 = 20\%$.
</details>

**P6 (Medium).** Successive discounts of 20%, 10%, and 5%. What is the equivalent single discount?

<details><summary>Answer</summary>

Effective price = $0.8 \times 0.9 \times 0.95 = 0.684$. Discount = $1 - 0.684 = 31.6\%$.
</details>

**P7 (Medium).** If $A$ is 20% more than $B$, by what percent is $B$ less than $A$?

<details><summary>Answer</summary>

$A = 1.2B$. $B$ is less than $A$ by $\frac{A - B}{A} = \frac{0.2B}{1.2B} = 1/6 = 16.67\%$.
</details>

**P8 (Medium).** A shopkeeper cheats by giving 900g instead of 1kg. What is the effective profit%?

<details><summary>Answer</summary>

He sells 900g at the price of 1000g. Profit% = $\frac{100}{900} \times 100 = 11.11\%$.
</details>

**P9 (Medium).** In what ratio should rice at $30/kg and $45/kg be mixed to get a mixture at $36/kg?

<details><summary>Answer</summary>

Alligation: $(45 - 36) : (36 - 30) = 9:6 = 3:2$. So 3 parts of $30 rice to 2 parts of $45 rice.
</details>

**P10 (Medium).** A's salary is 40% of B's. B's salary is 60% of C's. A's salary is what percent of C's?

<details><summary>Answer</summary>

$A = 0.4B = 0.4 \times 0.6C = 0.24C$. So A is **24%** of C.
</details>

**P11 (Medium).** CP of 15 items = SP of 12 items. Find the profit%.

<details><summary>Answer</summary>

$15 \times CP = 12 \times SP$. $SP/CP = 15/12 = 5/4$. Profit% = $(5/4 - 1) \times 100 = 25\%$.
</details>

**P12 (Medium).** A population grows from 10,000 to 13,310 in 3 years. What is the annual growth rate?

<details><summary>Answer</summary>

$10000 \times (1+r)^3 = 13310$. $(1+r)^3 = 1.331 = 1.1^3$. So $r = 10\%$.
</details>

**P13 (Hard).** A dealer marks up goods by 50% and gives two successive discounts of $x\%$ and $x\%$, making 8% profit. Find $x$.

<details><summary>Answer</summary>

SP = $1.5 \times CP \times (1 - x/100)^2 = 1.08 \times CP$. $(1 - x/100)^2 = 1.08/1.5 = 0.72$.
$1 - x/100 = \sqrt{0.72} \approx 0.8485$. $x \approx 15.15\%$. Approximately **15%**.
</details>

**P14 (Hard).** Three partners A, B, C invest in ratio 2:3:5. After 6 months, A doubles his investment. If total annual profit is $4800, find A's share.

<details><summary>Answer</summary>

A's share: $2 \times 6 + 4 \times 6 = 12 + 24 = 36$ (months × investment units).
B's share: $3 \times 12 = 36$. C's share: $5 \times 12 = 60$.
Ratio = $36:36:60 = 3:3:5$. A's share = $\frac{3}{11} \times 4800 \approx 1309.09$.
</details>

**P15 (Hard).** A milk-water solution has 60% milk. How much water must be added to 40 liters to make it 40% milk?

<details><summary>Answer</summary>

Milk = $0.6 \times 40 = 24L$. After adding $x$ liters of water: $24/(40 + x) = 0.4$.
$24 = 0.4(40 + x) = 16 + 0.4x$. $0.4x = 8$. $x = 20$ liters.
</details>

**P16 (Hard).** In an A/B test, variant A has 5% conversion rate and variant B has 6%. What is the percentage increase in conversion from A to B?

<details><summary>Answer</summary>

Percentage increase = $\frac{6 - 5}{5} \times 100 = 20\%$. Not 1% — the relative increase is 20%.
This distinction matters in ML: "accuracy improved by 2 percentage points" vs. "accuracy improved by 4%" (from 50% to 52%).
</details>

**P17 (Hard).** Three successive percentage increases of 10%, 20%, and 25% are equivalent to a single increase of what percent?

<details><summary>Answer</summary>

$1.1 \times 1.2 \times 1.25 = 1.65$. Equivalent single increase = **65%**.
</details>

**P18 (Hard).** If the price of an item increases by 40%, by what percent should consumption decrease so expenditure increases by only 12%?

<details><summary>Answer</summary>

Let original price = $p$, consumption = $c$. Original expenditure = $pc$.
New: $1.4p \times (1 - x/100) \times c = 1.12pc$. $1.4(1 - x/100) = 1.12$. $1 - x/100 = 0.8$. $x = 20\%$.
</details>

---

## 25.4 Time, Speed & Distance

### Key Formulas

$$ \text{Speed} = \frac{\text{Distance}}{\text{Time}} \qquad \text{Distance} = \text{Speed} \times \text{Time} $$

**Average speed** for two equal distances at speeds $a$ and $b$:
$$ \text{Average Speed} = \frac{2ab}{a + b} \quad (\text{harmonic mean, NOT arithmetic mean}) $$

**Relative speed:**
- Same direction: $|a - b|$
- Opposite direction: $a + b$

**Trains:**
- Time to cross a pole: $\frac{\text{length of train}}{\text{speed}}$
- Time to cross a platform: $\frac{\text{length of train + length of platform}}{\text{speed}}$
- Two trains crossing each other: $\frac{\text{sum of lengths}}{\text{relative speed}}$

**Boats & streams:**
- Upstream speed = $b - s$ (boat speed − stream speed)
- Downstream speed = $b + s$
- Still water speed $b = \frac{\text{downstream + upstream}}{2}$
- Stream speed $s = \frac{\text{downstream} - \text{upstream}}{2}$

**Tip:** If speeds are in ratio $a:b$, times for the same distance are in ratio $b:a$.

### Solved Examples

**Example 1:** A car travels 120 km at 40 km/h and returns at 60 km/h. Average speed?

Average = $\frac{2 \times 40 \times 60}{40 + 60} = \frac{4800}{100} = 48$ km/h. (Not 50!)

**Example 2:** A train 150m long passes a pole in 15 seconds. What is its speed?

Speed = $150/15 = 10$ m/s $= 10 \times 3.6 = 36$ km/h.

### Practice Problems

**P1 (Easy).** A person walks at 5 km/h. How far does he walk in 2.5 hours?

<details><summary>Answer</summary>

Distance = $5 \times 2.5 = 12.5$ km.
</details>

**P2 (Easy).** Convert 72 km/h to m/s.

<details><summary>Answer</summary>

$72 \times \frac{1000}{3600} = 72 \times \frac{5}{18} = 20$ m/s. (Shortcut: multiply by 5/18.)
</details>

**P3 (Easy).** Two cars start from the same point and travel in opposite directions at 60 km/h and 40 km/h. How far apart after 3 hours?

<details><summary>Answer</summary>

Relative speed = $60 + 40 = 100$ km/h. Distance = $100 \times 3 = 300$ km.
</details>

**P4 (Medium).** A train 200m long crosses a platform 300m long in 25 seconds. Find the speed.

<details><summary>Answer</summary>

Total distance = $200 + 300 = 500$m. Speed = $500/25 = 20$ m/s $= 72$ km/h.
</details>

**P5 (Medium).** A boat goes 24 km downstream in 2 hours and returns in 3 hours. Find the speed of the stream.

<details><summary>Answer</summary>

Downstream = $24/2 = 12$ km/h. Upstream = $24/3 = 8$ km/h.
Stream speed = $(12 - 8)/2 = 2$ km/h.
</details>

**P6 (Medium).** A person covers half the distance at 30 km/h and the other half at 50 km/h. Find the average speed.

<details><summary>Answer</summary>

Average = $\frac{2 \times 30 \times 50}{30 + 50} = \frac{3000}{80} = 37.5$ km/h.
</details>

**P9 (Hard).** A man rows 30 km upstream and 44 km downstream in 10 hours. He also rows 40 km upstream and 55 km downstream in 13 hours. Find his speed in still water.

<details><summary>Answer</summary>

Let upstream speed = $u$, downstream = $d$.
$30/u + 44/d = 10$ ... (1)
$40/u + 55/d = 13$ ... (2)

Let $1/u = x, 1/d = y$. $30x + 44y = 10$ and $40x + 55y = 13$.
From (1) × 4: $120x + 176y = 40$. From (2) × 3: $120x + 165y = 39$.
Subtracting: $11y = 1 \Rightarrow y = 1/11$, so $d = 11$.
$30x + 4 = 10 \Rightarrow x = 1/5$, so $u = 5$.
Still water speed = $(11 + 5)/2 = 8$ km/h.
</details>

**P10 (Hard).** Two trains start at the same time from stations 200 km apart, heading toward each other. They meet in 2 hours. If one is 10 km/h faster than the other, find both speeds.

<details><summary>Answer</summary>

$a + b = 200/2 = 100$ km/h. $a - b = 10$. So $a = 55$ km/h, $b = 45$ km/h.
</details>

**P11 (Hard).** A thief is spotted and starts running at 8 km/h. A policeman starts chasing from 200m behind at 10 km/h. When does the policeman catch the thief?

<details><summary>Answer</summary>

Relative speed = $10 - 8 = 2$ km/h $= 2000/3600$ m/s.
Time = $200 / (2000/3600) = 200 \times 3600/2000 = 360$ seconds $= 6$ minutes.
</details>

**P12 (Hard).** A plane flies 600 km with tailwind in 2 hours and returns against the wind in 3 hours. Find the wind speed.

<details><summary>Answer</summary>

With wind: $600/2 = 300$ km/h. Against wind: $600/3 = 200$ km/h.
Wind speed = $(300 - 200)/2 = 50$ km/h. Plane speed = $250$ km/h.
</details>

**P13 (Hard).** A walks at 3/4 of his normal speed and is 20 minutes late. What is his usual time?

<details><summary>Answer</summary>

At 3/4 speed, time becomes 4/3 of normal. Extra time = $4/3 \cdot T - T = T/3 = 20$ min. $T = 60$ minutes.
</details>

---

## 25.5 Time & Work

### Key Formulas

If A does work in $X$ days, A's rate = $\frac{1}{X}$ per day.

$$ \text{Combined rate} = \frac{1}{A} + \frac{1}{B} \qquad \text{Days together} = \frac{AB}{A + B} $$

**Pipes & cisterns:** Inlet adds (positive rate), outlet subtracts (negative rate).

**Efficiency method (LCM trick):** Assume total work = LCM of individual times. Then rates are simple whole numbers.

**Tip:** Always convert to rates (work per day). Never try to work with "days" directly.

### Solved Examples

**Example 1:** A can do a job in 10 days, B in 15 days. How long working together?

LCM(10, 15) = 30 units. A does 3 units/day, B does 2 units/day. Together = 5 units/day. Time = $30/5 = 6$ days.

**Example 2:** A pipe fills a tank in 6 hours. A drain empties it in 8 hours. If both are open, how long to fill?

LCM(6, 8) = 24 units. Fill rate = 4, drain rate = 3. Net = 1 unit/hour. Time = 24 hours.

### Practice Problems

**P1 (Easy).** A finishes work in 12 days, B in 18 days. How long together?

<details><summary>Answer</summary>

LCM(12,18) = 36. A = 3/day, B = 2/day. Together = 5/day. Time = $36/5 = 7.2$ days.
Or: $\frac{12 \times 18}{12 + 18} = \frac{216}{30} = 7.2$ days.
</details>

**P2 (Easy).** A can do 1/3 of a job in 5 days. How long for the full job?

<details><summary>Answer</summary>

Full job = $5 \times 3 = 15$ days.
</details>

**P3 (Easy).** 10 workers finish a job in 6 days. How many workers to finish in 4 days?

<details><summary>Answer</summary>

Work = $10 \times 6 = 60$ worker-days. Workers needed = $60/4 = 15$.
</details>

**P4 (Medium).** A does a job in 20 days, B in 30 days. They work together for 6 days, then A leaves. How many more days for B alone?

<details><summary>Answer</summary>

LCM(20,30) = 60 units. A = 3/day, B = 2/day.
6 days together = $6 \times 5 = 30$ units done. Remaining = 30 units. B alone = $30/2 = 15$ days.
</details>

**P5 (Medium).** A pipe fills a tank in 12 hours, another in 15 hours, and a drain empties in 20 hours. All three open — how long to fill?

<details><summary>Answer</summary>

LCM(12,15,20) = 60 units. Rates: $5 + 4 - 3 = 6$ units/hour. Time = $60/6 = 10$ hours.
</details>

**P6 (Medium).** A is twice as efficient as B. Together they finish in 12 days. How long would B take alone?

<details><summary>Answer</summary>

Let B's rate = $x$, A's = $2x$. Together = $3x$. $12 \times 3x = 1$, so $x = 1/36$. B takes **36 days**.
</details>

**P7 (Medium).** A does a job in 10 days. After working 4 days, B joins and together they finish in 3 more days. How long would B take alone?

<details><summary>Answer</summary>

A does $4/10 = 2/5$ alone. Remaining = $3/5$. In 3 days: A does $3/10$, so B does $3/5 - 3/10 = 3/10$. B's rate = $1/10$ per day. B takes **10 days** alone. Wait, let me recheck.
B does $3/10$ in 3 days → B's daily rate = $1/10$. B alone = 10 days.
</details>

**P8 (Hard).** A and B can do a job in 8 days. B and C in 12 days. A and C in 16 days. How long for all three together?

<details><summary>Answer</summary>

$\frac{1}{A} + \frac{1}{B} = \frac{1}{8}$, $\frac{1}{B} + \frac{1}{C} = \frac{1}{12}$, $\frac{1}{A} + \frac{1}{C} = \frac{1}{16}$.
Adding all: $2(\frac{1}{A} + \frac{1}{B} + \frac{1}{C}) = \frac{1}{8} + \frac{1}{12} + \frac{1}{16} = \frac{6 + 4 + 3}{48} = \frac{13}{48}$.
Combined rate = $\frac{13}{96}$. Time = $96/13 \approx 7.38$ days.
</details>

**P10 (Hard).** 3 men and 4 women finish a job in 6 days. 5 men and 2 women finish in 5 days. How long for 1 man and 1 woman?

<details><summary>Answer</summary>

$6(3m + 4w) = 5(5m + 2w)$, where $m$ and $w$ are daily rates.
$18m + 24w = 25m + 10w$. $14w = 7m$. $m = 2w$.
Total work = $6(3 \times 2w + 4w) = 6 \times 10w = 60w$.
1 man + 1 woman = $2w + w = 3w$ per day. Time = $60w / 3w = 20$ days.
</details>

**P13 (Hard).** A and B can do a job in 12 days. B and C in 15. C and A in 20. They all work for 5 days, then B and C leave. How many more days does A need?

<details><summary>Answer</summary>

LCM(12,15,20) = 60 units. A+B = 5, B+C = 4, C+A = 3 units/day.
Adding: $2(A+B+C) = 12$, so $A+B+C = 6$ units/day.
$A = 6-4 = 2, B = 6-3 = 3, C = 6-5 = 1$.
5 days of all three: $5 \times 6 = 30$ units. Remaining = 30. A alone = $30/2 = 15$ days.
</details>

**P12 (Hard).** A works at half rate every alternate day. He can finish a job at full rate in 10 days. How long does it actually take?

<details><summary>Answer</summary>

Full rate = $1/10$ per day. Every 2-day cycle: $1/10 + 1/20 = 3/20$.
Number of cycles for full job: $20/3 \approx 6.67$ cycles = $13.33$ days.
After 6 cycles (12 days): $6 \times 3/20 = 18/20 = 9/10$ done. Remaining = $1/10$.
Day 13 (full rate): $1/10$ done. Total = **13 days**.
</details>

---

## 25.6 Probability

Probability is everywhere in ML — from naive Bayes to dropout to sampling. If you understand probability deeply, half of machine learning becomes intuitive.

### Key Formulas

$$ P(A) = \frac{\text{favorable outcomes}}{\text{total outcomes}} \qquad 0 \le P(A) \le 1 $$

$$ P(A \cup B) = P(A) + P(B) - P(A \cap B) $$

$$ P(A \mid B) = \frac{P(A \cap B)}{P(B)} $$

**Complement rule:**
$$ P(\text{at least one}) = 1 - P(\text{none}) $$

**Independent events:** $P(A \cap B) = P(A) \cdot P(B)$

**Bayes' Theorem:**
$$ P(A \mid B) = \frac{P(B \mid A) \cdot P(A)}{P(B)} $$

**Counting:**
- Permutations: $nPr = \frac{n!}{(n-r)!}$
- Combinations: $nCr = \frac{n!}{r!(n-r)!}$

**Fun fact:** The birthday paradox says only 23 people are needed for a 50% chance of a shared birthday. With 70 people, it's 99.9%.

### Solved Examples

**Example 1 (Bayes):** 1% of emails are spam. A filter catches 99% of spam and has a 5% false positive rate. If an email is flagged, what's the probability it's actually spam?

$P(\text{spam} \mid \text{flagged}) = \frac{P(\text{flagged} \mid \text{spam}) \cdot P(\text{spam})}{P(\text{flagged})}$

$P(\text{flagged}) = 0.99 \times 0.01 + 0.05 \times 0.99 = 0.0099 + 0.0495 = 0.0594$

$P(\text{spam} \mid \text{flagged}) = \frac{0.0099}{0.0594} = 0.167 = 16.7\%$

Only 16.7%! This is why P(spam|word) in Naive Bayes is literally what the classifier computes — and why a single signal is rarely enough.

**Example 2:** What's the probability of getting at least one 6 in 4 rolls of a die?

$P(\text{at least one 6}) = 1 - P(\text{no sixes}) = 1 - (5/6)^4 = 1 - 625/1296 \approx 0.518$

### Practice Problems

**P1 (Easy).** A fair die is rolled. What's the probability of getting a number greater than 4?

<details><summary>Answer</summary>

Favorable: {5, 6}. $P = 2/6 = 1/3$.
</details>

**P2 (Easy).** Two coins are tossed. What's the probability of at least one head?

<details><summary>Answer</summary>

$P(\text{at least one H}) = 1 - P(\text{no H}) = 1 - (1/2)^2 = 1 - 1/4 = 3/4$.
</details>

**P3 (Easy).** A bag has 3 red and 5 blue balls. One is drawn. P(red)?

<details><summary>Answer</summary>

$P = 3/8$.
</details>

**P4 (Easy).** Two dice are rolled. What's the probability the sum is 7?

<details><summary>Answer</summary>

Favorable: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6 outcomes. Total = 36. $P = 6/36 = 1/6$.
</details>

**P5 (Medium).** A card is drawn from a standard 52-card deck. P(heart or face card)?

<details><summary>Answer</summary>

Hearts = 13. Face cards = 12. Heart face cards = 3. $P = (13 + 12 - 3)/52 = 22/52 = 11/26$.
</details>

**P6 (Medium).** 3 unbiased coins are tossed. P(exactly 2 heads)?

<details><summary>Answer</summary>

$\binom{3}{2} \times (1/2)^3 = 3/8$.
</details>

**P7 (Medium).** A box has 6 defective items out of 20. Two items are drawn without replacement. P(both defective)?

<details><summary>Answer</summary>

$P = \frac{6}{20} \times \frac{5}{19} = \frac{30}{380} = \frac{3}{38} \approx 0.079$.
</details>

**P8 (Medium).** A fair die is rolled 3 times. What's the probability of all different numbers?

<details><summary>Answer</summary>

$P = 1 \times \frac{5}{6} \times \frac{4}{6} = \frac{20}{36} = \frac{5}{9} \approx 0.556$.
</details>

**P9 (Medium).** In a class of 30, what's the approximate probability that at least two share a birthday? (Birthday paradox)

<details><summary>Answer</summary>

$P = 1 - \frac{365!}{365^{30} \times (365-30)!} \approx 1 - \prod_{k=1}^{29}(1 - k/365)$.
Quick calculation: $\approx 1 - e^{-29 \times 30/(2 \times 365)} = 1 - e^{-1.19} \approx 1 - 0.304 = 0.696 \approx 70\%$.
</details>

**P10 (Medium).** A machine has P(defective) = 0.02. In 100 items, what's the expected number of defective items? What's the probability of 0 defectives?

<details><summary>Answer</summary>

Expected = $100 \times 0.02 = 2$. $P(0) = (0.98)^{100} \approx e^{-2} \approx 0.135 = 13.5\%$.
</details>

**P11 (Medium).** Events A and B are independent. P(A) = 0.4, P(B) = 0.3. Find P(A or B).

<details><summary>Answer</summary>

$P(A \cup B) = 0.4 + 0.3 - 0.4 \times 0.3 = 0.7 - 0.12 = 0.58$.
</details>

**P12 (Hard).** A test is 95% accurate for a disease that affects 1 in 1000 people. If you test positive, what's the probability you actually have the disease?

<details><summary>Answer</summary>

$P(\text{disease} \mid +) = \frac{0.95 \times 0.001}{0.95 \times 0.001 + 0.05 \times 0.999} = \frac{0.00095}{0.00095 + 0.04995} = \frac{0.00095}{0.0509} \approx 1.87\%$.
Despite 95% accuracy, there's only ~2% chance you're actually sick. This is a classic base-rate fallacy.
</details>

**P13 (Hard).** 5 people sit randomly in a row. What's the probability that two specific people sit next to each other?

<details><summary>Answer</summary>

Total arrangements = $5! = 120$. Treat the pair as one unit: $4! \times 2! = 48$ (the pair can swap).
$P = 48/120 = 2/5$.
</details>

**P14 (Hard).** A bag has 4 red and 6 blue balls. 3 are drawn. P(at least 2 red)?

<details><summary>Answer</summary>

$P(\text{exactly 2 red}) = \frac{\binom{4}{2}\binom{6}{1}}{\binom{10}{3}} = \frac{6 \times 6}{120} = \frac{36}{120}$.
$P(\text{exactly 3 red}) = \frac{\binom{4}{3}}{\binom{10}{3}} = \frac{4}{120}$.
$P(\text{at least 2 red}) = \frac{40}{120} = \frac{1}{3}$.
</details>

**P15 (Hard).** You have 3 classifiers with independent accuracies of 0.7, 0.8, 0.9. Using majority voting, what's the probability the ensemble is correct?

<details><summary>Answer</summary>

Ensemble correct when 2 or 3 are correct.
All 3 correct: $0.7 \times 0.8 \times 0.9 = 0.504$.
Exactly 2 correct: $0.7 \times 0.8 \times 0.1 + 0.7 \times 0.2 \times 0.9 + 0.3 \times 0.8 \times 0.9 = 0.056 + 0.126 + 0.216 = 0.398$.
Total = $0.504 + 0.398 = 0.902 = 90.2\%$. Better than any individual classifier.
</details>

**P16 (Hard).** A biased coin has P(H) = 0.6. What's the probability of getting exactly 3 heads in 5 flips?

<details><summary>Answer</summary>

$P = \binom{5}{3}(0.6)^3(0.4)^2 = 10 \times 0.216 \times 0.16 = 10 \times 0.03456 = 0.3456$.
</details>

**P17 (Hard).** A, B, and C independently try to solve a problem. Their probabilities of success are 1/2, 1/3, and 1/4. What's the probability the problem is solved?

<details><summary>Answer</summary>

$P(\text{solved}) = 1 - P(\text{none solve}) = 1 - (1/2)(2/3)(3/4) = 1 - 6/24 = 1 - 1/4 = 3/4$.
</details>

**P18 (Hard).** In a game, you pick 2 cards from a deck of 52. You win if both are aces. How many games must you play for a >50% chance of winning at least once?

<details><summary>Answer</summary>

$P(\text{2 aces in one draw}) = \frac{\binom{4}{2}}{\binom{52}{2}} = \frac{6}{1326} = \frac{1}{221}$.
Need: $1 - (220/221)^n > 0.5$. $(220/221)^n < 0.5$. $n > \frac{\ln 0.5}{\ln(220/221)} = \frac{0.693}{0.00454} \approx 153$.
You need about **153 games**.
</details>

**P19 (Hard).** In ML: a model predicts positive with P=0.3. True positive rate (recall) is 0.85. False positive rate is 0.1. What's the precision?

<details><summary>Answer</summary>

Using Bayes: Precision = $P(\text{actual+} \mid \text{predicted+})$.
$P(\text{predicted+}) = 0.85 \times 0.3 + 0.1 \times 0.7 = 0.255 + 0.07 = 0.325$.
Precision = $0.255 / 0.325 = 0.785 = 78.5\%$.
</details>

**P20 (Hard).** Two players alternately roll a die. The first to roll a 6 wins. What's the probability the first player wins?

<details><summary>Answer</summary>

$P_1 = 1/6 + (5/6)(5/6)(1/6) + (5/6)^4(1/6) + ...$
$= \frac{1/6}{1 - (5/6)^2} = \frac{1/6}{1 - 25/36} = \frac{1/6}{11/36} = \frac{36}{66} = \frac{6}{11} \approx 54.5\%$.
The first mover has an advantage.
</details>

---

## 25.7 Combinatorics & Counting

### Key Formulas

$$ \text{Permutations: } P(n,r) = \frac{n!}{(n-r)!} \qquad \text{Combinations: } C(n,r) = \frac{n!}{r!(n-r)!} $$

**With repetition:**
- Permutations of $n$ items with repetitions $r_1, r_2, ...$: $\frac{n!}{r_1! \cdot r_2! \cdots}$
- Combinations with repetition: $C(n+r-1, r)$

**Stars and bars:** Distributing $n$ identical items into $k$ distinct bins: $C(n+k-1, k-1)$

**Circular permutations:** $(n-1)!$

**Inclusion-exclusion:** $|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$

**Tip:** Order matters → permutation. Order doesn't matter → combination. If in doubt, ask: is ABC different from CBA?

### Solved Examples

**Example 1:** How many ways to arrange the letters in "MISSISSIPPI"?

Total letters = 11. M=1, I=4, S=4, P=2. Answer = $\frac{11!}{1! \cdot 4! \cdot 4! \cdot 2!} = \frac{39916800}{1 \times 24 \times 24 \times 2} = 34650$.

**Example 2:** Distribute 10 identical candies among 3 children. How many ways?

Stars and bars: $C(10 + 3 - 1, 3 - 1) = C(12, 2) = 66$.

### Practice Problems

**P1 (Easy).** How many ways to choose 3 books from 8?

<details><summary>Answer</summary>

$C(8,3) = \frac{8!}{3!5!} = \frac{8 \times 7 \times 6}{6} = 56$.
</details>

**P2 (Easy).** How many 3-digit numbers can be formed using digits 1-5 without repetition?

<details><summary>Answer</summary>

$P(5,3) = 5 \times 4 \times 3 = 60$.
</details>

**P3 (Easy).** How many ways to arrange 5 people in a row?

<details><summary>Answer</summary>

$5! = 120$.
</details>

**P4 (Medium).** How many ways to form a committee of 5 from 6 men and 4 women if at least 2 women must be included?

<details><summary>Answer</summary>

$C(4,2)C(6,3) + C(4,3)C(6,2) + C(4,4)C(6,1) = 6 \times 20 + 4 \times 15 + 1 \times 6 = 120 + 60 + 6 = 186$.
</details>

**P6 (Medium).** How many ways to distribute 8 identical balls into 3 distinct boxes?

<details><summary>Answer</summary>

Stars and bars: $C(8+3-1, 3-1) = C(10, 2) = 45$.
</details>

**P7 (Hard).** A team of 11 must be chosen from 15 players, including at least 1 of the 2 goalkeepers. How many ways?

<details><summary>Answer</summary>

Total ways without restriction: $C(15,11) = C(15,4) = 1365$.
Ways with 0 goalkeepers: $C(13,11) = C(13,2) = 78$.
With at least 1: $1365 - 78 = 1287$.
</details>

**P10 (Hard).** How many binary strings of length 10 have exactly 4 ones?

<details><summary>Answer</summary>

$C(10,4) = 210$.
</details>

**P11 (Hard).** How many integers between 1 and 1000 are divisible by 3 or 5 or 7?

<details><summary>Answer</summary>

$|A| = \lfloor 1000/3 \rfloor = 333$. $|B| = 200$. $|C| = 142$.
$|A \cap B| = \lfloor 1000/15 \rfloor = 66$. $|A \cap C| = \lfloor 1000/21 \rfloor = 47$. $|B \cap C| = \lfloor 1000/35 \rfloor = 28$.
$|A \cap B \cap C| = \lfloor 1000/105 \rfloor = 9$.
$|A \cup B \cup C| = 333 + 200 + 142 - 66 - 47 - 28 + 9 = 543$.
</details>

**P12 (Hard).** In how many ways can you go from (0,0) to (4,3) on a grid, moving only right or up?

<details><summary>Answer</summary>

You need 4 right moves and 3 up moves in some order. $C(7,3) = 35$.
</details>

**P13 (Hard).** How many ways to place 8 non-attacking rooks on a chessboard?

<details><summary>Answer</summary>

First rook: 8 column choices. Second rook: 7 remaining columns, and 7 remaining rows. This is equivalent to a permutation: $8! = 40320$.
</details>

**P14 (Hard).** A password has 6 characters: 3 lowercase letters followed by 3 digits. How many possible passwords?

<details><summary>Answer</summary>

$26^3 \times 10^3 = 17576 \times 1000 = 17{,}576{,}000$.
</details>

**P15 (Hard).** In how many ways can 12 people be divided into 3 equal groups of 4?

<details><summary>Answer</summary>

$\frac{C(12,4) \times C(8,4) \times C(4,4)}{3!} = \frac{495 \times 70 \times 1}{6} = \frac{34650}{6} = 5775$.
We divide by $3!$ because the groups are unordered.
</details>

---

## 25.8 Logical Reasoning

Logical reasoning tests your ability to structure information and draw valid conclusions. The universal tip: **draw it out**. Every logical reasoning problem becomes manageable when you sketch a diagram.

### Syllogisms

**Rules:**
- "All A are B" + "All B are C" → "All A are C"
- "All A are B" + "Some B are C" → **no valid conclusion about A and C**
- "Some A are B" + "All B are C" → "Some A are C"

Use Venn diagrams. If multiple interpretations are possible, a conclusion must hold in all of them.

### Practice Problems

**P1 (Easy).** All dogs are animals. All animals are living things. Conclusion: All dogs are living things — True or False?

<details><summary>Answer</summary>

**True.** Classic transitive syllogism.
</details>

**P2 (Easy).** Some cats are black. Some black things are bags. Conclusion: Some cats are bags — True or False?

<details><summary>Answer</summary>

**False.** Two "some" statements do not guarantee a link.
</details>

**P3 (Easy).** A is taller than B. C is shorter than B. Who is tallest?

<details><summary>Answer</summary>

$A > B > C$. **A** is tallest.
</details>

**P4 (Easy).** Pointing to a man, a woman says "His mother is my mother's daughter." What is the man to the woman?

<details><summary>Answer</summary>

"My mother's daughter" = the woman herself (or her sister). If it's herself, the man is her **son**.
</details>

**P5 (Medium).** 5 people — A, B, C, D, E — sit in a row. B is to the right of A. C is between A and B. E is not at either end. Who is at the left end?

<details><summary>Answer</summary>

A is to the left of B, C is between them: ...A, C, B...
E is not at an end, so E is in one of the middle positions. D must be at an end.
Possible: D, A, C, B, E or A, C, B, E, D. But E is not at an end → A, E, C, B, D or D, A, C, B, E.
Wait — C must be *between* A and B directly: A_C_B. E not at end.
Left end could be **D**: D, A, C, B, E. But E is at end. Try: A, E, C, B, D? But C must be between A and B.
If A, C, B are consecutive: (D, A, C, B, E) — E is at end (not allowed). (E, A, C, B, D) — E is at end (not allowed).
With gaps: A, _, C, _, B: positions 1,3,5 → A, D, C, E, B or A, E, C, D, B. E is not at end ✓.
**A** is at the left end.
</details>

**P6 (Medium).** If CLOUD is coded as DMPVE, how is RAIN coded?

<details><summary>Answer</summary>

C→D (+1), L→M (+1), O→P (+1), U→V (+1), D→E (+1). Each letter +1.
R→S, A→B, I→J, N→O. Answer: **SBJO**.
</details>

**P7 (Medium).** A faces north. He turns 90° clockwise, then 180°, then 45° anticlockwise. Which direction is he facing?

<details><summary>Answer</summary>

North → 90° CW → East → 180° → West → 45° ACW → Southwest. Answer: **Southwest**.
</details>

**P8 (Medium).** In a family, A is B's father. C is A's mother. D is C's son. E is D's wife. What is E to B?

<details><summary>Answer</summary>

C's sons: A and D (D is A's brother). E is D's wife = B's aunt. Answer: **Aunt**.
</details>

**P9 (Medium).** 6 friends P, Q, R, S, T, U sit around a circular table. P is between T and U. Q is to the left of T. S is not next to Q. Where does S sit?

<details><summary>Answer</summary>

Around circle: ...U, P, T, Q... Since Q is left of T and P is between T and U.
Arrangement: U, P, T, Q, _, _ where remaining are R and S.
Positions after Q: let's say Q, R, S, U or Q, S, R, U.
S not next to Q → Q, R, S, U, P, T. **S sits between R and U** (opposite to T).
</details>

**P10 (Medium).** If "+" means "÷", "−" means "×", "×" means "+", "÷" means "−", what is: 6 + 3 − 4 × 8 ÷ 2?

<details><summary>Answer</summary>

Replace: $6 \div 3 \times 4 + 8 - 2 = 2 \times 4 + 8 - 2 = 8 + 8 - 2 = 14$.
</details>

**P11 (Hard).** 8 people sit in two parallel rows of 4 each. Row 1 (A,B,C,D) faces south. Row 2 (P,Q,R,S) faces north. Each person in Row 1 faces someone in Row 2. B faces Q. P faces D. S is not at an end. A is at the left end of Row 1.

<details><summary>Answer</summary>

Row 1 (left to right, facing south): A, _, _, D
B faces Q. P faces D.
Row 2 (facing Row 1, left to right from Row 2's perspective = right to left from Row 1's perspective).
Actually, if Row 1 faces south and Row 2 faces north, person at left end of Row 1 faces person at right end of Row 2.
A faces the person at the right end of Row 2. P faces D.
D is at position 4 of Row 1, faces position 1 of Row 2 = P. ✓
A at position 1 faces position 4 of Row 2.
B faces Q — B is in position 2 or 3 of Row 1. Q is somewhere in Row 2.
S not at an end → S is position 2 or 3 in Row 2.
Row 2 positions: P at pos 1 (faces D at pos 4). If B is at pos 2, faces pos 3 of Row 2 = Q.
Row 2: P, _, Q, _ → positions 2 and 4 for R and S. S not at end → S at position 2, R at position 4.
Row 2: P, S, Q, R. Row 1: A, B, C, D.
A faces R. B faces Q. C faces S. D faces P. **C faces S.**
</details>

**P12 (Hard).** A clock shows 3:15. What is the angle between the hour and minute hands?

<details><summary>Answer</summary>

Minute hand at 3 (90°). Hour hand at 3 + 15/60 × 30° = 90° + 7.5° = 97.5°.
Angle = $97.5° - 90° = 7.5°$.
</details>

**P13 (Hard).** Four logicians sit in a row. Each has a hat — red or blue — but can only see the hats in front of them. From back to front: R, B, R, B. They are told there are 2 red and 2 blue hats. The first to know his hat color raises his hand. Who raises it and why?

<details><summary>Answer</summary>

Person 4 (back) sees R, R, B or B, R, B etc. Person 4 sees B, R, B — two blues and one red among the 3 ahead. Since there are exactly 2 of each, person 4 knows he must have **Red**. Person 4 raises hand first.
Actually — Person 4 (back) sees persons 1, 2, 3 in front: B, R, B (front to back). He sees 2 blue and 1 red. Since total is 2 red, 2 blue, he must be Red. **Person 4 (the back)** raises hand.
</details>

**P14 (Hard).** Statement: "All engineers can code. Some coders are artists. No artist is a manager." Which conclusion is valid?
(a) Some engineers are artists
(b) No engineer is a manager
(c) Some coders are not managers
(d) All artists can code

<details><summary>Answer</summary>

**(c)** Some coders are artists (given) + no artist is a manager → those coders who are artists are not managers → some coders are not managers. ✓
(a) is invalid — "some coders are artists" doesn't mean engineer-coders are artists.
(b) is invalid — engineers who are not artists could be managers.
(d) is invalid — only "some coders are artists", not all artists are coders.
</details>

**P15 (Hard).** You have 12 statements. Each says "Exactly N of these 12 statements are false" for N = 0, 1, 2, ..., 11. How many are true?

<details><summary>Answer</summary>

At most one statement can be true (they're mutually contradictory). If statement $k$ is true ("exactly $k$ are false"), then 11 are false (the other 11) and 1 is true. So $k = 11$. Statement 11 says "Exactly 11 of these are false" — and indeed 11 are false. **Exactly 1 statement is true** (statement 11).
</details>

**P16 (Hard).** Three boxes: one has 2 gold coins, one has 2 silver coins, one has 1 of each. All labels are wrong. You draw 1 coin from the box labeled "Gold-Silver". It's gold. What's in each box?

<details><summary>Answer</summary>

All labels are wrong. Box labeled "Gold-Silver" doesn't have 1 gold + 1 silver. You drew gold, so it must be the **Gold-Gold** box.
Box labeled "Gold-Gold" (label is wrong) must be either Silver-Silver or Gold-Silver.
Box labeled "Silver-Silver" (label is wrong) must be either Gold-Gold or Gold-Silver.
Since Gold-Gold is assigned, labeled "Gold-Gold" is Gold-Silver or Silver-Silver. Labeled "Silver-Silver" gets the other.
Labeled "Gold-Gold" → Silver-Silver. Labeled "Silver-Silver" → Gold-Silver.
</details>

**P17 (Hard).** A says "B lies". B says "C lies". C says "A and B both lie." Who is telling the truth?

<details><summary>Answer</summary>

If A is truthful → B lies → B's statement is false → C is truthful → C says A and B both lie → but A is truthful. Contradiction.
If A lies → B is truthful → C lies → C's statement is false → not both A and B lie. Since A lies, B must be truthful. Consistent! ✓
**B tells the truth.** A and C lie.
</details>

**P18 (Hard).** There are 25 horses and 5 tracks (5 horses per race). What's the minimum number of races to find the top 3 horses? (No stopwatch.)

<details><summary>Answer</summary>

**7 races.** Race 1-5: race all 25 in 5 groups of 5. Race 6: race the 5 group winners. After race 6, the overall winner is found. Race 7: race the 2nd and 3rd from the winner's original group + the 2nd from the race-6 runner-up's group + the race-6 runner-up + the race-6 3rd place. The top 2 of race 7 are the overall 2nd and 3rd.
</details>

**P19 (Hard).** You have 8 balls, one is heavier. You have a balance scale. What's the minimum number of weighings to find the heavy ball?

<details><summary>Answer</summary>

**2 weighings.** Split into 3 groups: 3, 3, 2. Weigh 3 vs 3.
- If equal: heavy ball is in the group of 2. Weigh them → found it.
- If unequal: take the heavier group of 3. Weigh 1 vs 1 of those 3. If equal → it's the third. If unequal → it's the heavier.
</details>

**P20 (Hard).** Five pirates divide 100 gold coins. The most senior proposes a split. All vote. If ≥50% agree, it's accepted. Otherwise, the proposer is thrown overboard and the next proposes. Each pirate is rational and greedy. What does the most senior pirate propose?

<details><summary>Answer</summary>

Work backwards. With 2 pirates: Pirate 2 proposes (100, 0) — he votes yes (50%), accepted.
With 3: Pirate 3 needs 1 more vote. Offer pirate 1 one coin (better than 0 with 2 pirates). Proposal: (0, 0, 100)? No — Pirate 3 proposes (1, 0, 99).
With 4: Pirate 4 needs 2 votes. Pirate 2 gets 0 with 3 pirates, so offer 1. Proposal: (0, 1, 0, 99).
With 5: Pirate 5 needs 3 votes (including own). Pirates 1 and 3 get 0 with 4 pirates. Offer them 1 each.
**Proposal: (1, 0, 1, 0, 98).** Pirate 5 keeps 98 coins.
</details>

---

## 25.9 Data Interpretation

In interviews, you often need to read charts and extract insights quickly. The key skill is knowing when to approximate and when to be precise. If answer choices are 23%, 37%, 52%, 68% — you absolutely do not need exact math.

### Key Formulas

**CAGR (Compound Annual Growth Rate):**
$$ \text{CAGR} = \left(\frac{\text{Final Value}}{\text{Initial Value}}\right)^{1/n} - 1 $$

**Year-over-year growth:** $\frac{V_{current} - V_{previous}}{V_{previous}} \times 100$

**Percentage share:** $\frac{\text{Part}}{\text{Total}} \times 100$

### Chart: Quarterly Revenue by Product Line

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Q1", "Q2", "Q3", "Q4"],
    "datasets": [
      {
        "label": "Product A ($M)",
        "data": [45, 52, 48, 61],
        "backgroundColor": "#42a5f5"
      },
      {
        "label": "Product B ($M)",
        "data": [30, 35, 42, 38],
        "backgroundColor": "#66bb6a"
      },
      {
        "label": "Product C ($M)",
        "data": [20, 18, 25, 30],
        "backgroundColor": "#ffa726"
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Quarterly Revenue by Product Line (2025)" } },
    "scales": { "y": { "title": { "display": true, "text": "Revenue ($M)" } } }
  }
}
```

### Chart: Monthly Active Users Growth

```chart
{
  "type": "line",
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "datasets": [
      {
        "label": "MAU (millions)",
        "data": [10, 11, 12.5, 14, 15, 17, 19, 22, 24, 26, 29, 33],
        "borderColor": "#ef5350",
        "fill": false,
        "tension": 0.3
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Monthly Active Users — 2025" } },
    "scales": { "y": { "title": { "display": true, "text": "MAU (millions)" } } }
  }
}
```

### Chart: Market Share Distribution

```chart
{
  "type": "pie",
  "data": {
    "labels": ["Company X (38%)", "Company Y (27%)", "Company Z (20%)", "Others (15%)"],
    "datasets": [
      {
        "data": [38, 27, 20, 15],
        "backgroundColor": ["#42a5f5", "#66bb6a", "#ffa726", "#ab47bc"]
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Cloud AI Market Share — 2025" } }
  }
}
```

### Practice Problems (Use the charts above)

**P1 (Easy).** What was the total revenue across all products in Q3?

<details><summary>Answer</summary>

$48 + 42 + 25 = 115$ million.
</details>

**P2 (Easy).** Which product had the highest Q4 revenue?

<details><summary>Answer</summary>

Product A at $61M.
</details>

**P3 (Easy).** What was the approximate MAU growth from January to December?

<details><summary>Answer</summary>

From 10M to 33M = 230% growth ($\frac{33-10}{10} \times 100$).
</details>

**P4 (Medium).** What was the quarter-over-quarter growth for Product B from Q2 to Q3?

<details><summary>Answer</summary>

$(42 - 35)/35 \times 100 = 7/35 \times 100 = 20\%$.
</details>

**P5 (Medium).** Product C's share of total revenue changed from Q1 to Q4. By how much?

<details><summary>Answer</summary>

Q1 total = $45+30+20 = 95$. C's share = $20/95 = 21.1\%$.
Q4 total = $61+38+30 = 129$. C's share = $30/129 = 23.3\%$.
Increase of about **2.2 percentage points**.
</details>

**P6 (Medium).** Approximate the CAGR of MAU from January (10M) to December (33M) — treating this as 1 year.

<details><summary>Answer</summary>

For 1 year, CAGR = $(33/10) - 1 = 2.3 = 230\%$. If treated as monthly: $(33/10)^{1/11} - 1 \approx 11.4\%$ per month.
</details>

**P7 (Medium).** If Company X's revenue is $19B total in the market, what is the total market size?

<details><summary>Answer</summary>

Company X = 38%. Total = $19B / 0.38 = 50B$.
</details>

**P8 (Hard).** Revenue from Product A grew from Q1 to Q4. If it maintains the same CAGR (quarter-over-quarter) for 4 more quarters, estimate Q8 revenue.

<details><summary>Answer</summary>

Q1→Q4 growth over 3 quarters: $(61/45)^{1/3} - 1 \approx (1.356)^{0.333} - 1 \approx 1.107 - 1 = 10.7\%$ per quarter.
Q8 = $61 \times 1.107^4 \approx 61 \times 1.50 \approx 91.5M$.
</details>

**P9 (Hard).** MAU doubled from Jan to approximately which month?

<details><summary>Answer</summary>

10M → 20M. Looking at data: Jul=19M, Aug=22M. Doubled around **late July / early August** (~7 months).
</details>

**P10 (Hard).** If Companies Y and Z merge, what would their combined market share be, and how much larger would they be than Company X?

<details><summary>Answer</summary>

Combined = $27 + 20 = 47\%$. Larger than X (38%) by $47 - 38 = 9$ percentage points, or $9/38 \times 100 \approx 23.7\%$ relatively larger.
</details>

---

## 25.10 Fermi Estimation (System Design Essential)

Fermi estimation is the art of making reasonable guesses about quantities you don't know, using facts you do know. Every system design interview starts with estimation: "how much storage?", "what QPS?", "how many servers?". This is arguably the most practically useful section in this chapter.

### The Framework

```
1. Clarify the question
2. Break into smaller, estimable parts
3. Estimate each part
4. Multiply/combine
5. Sanity check the result
```

### Numbers to Memorize

```
┌───────────────────────────────────────────────┐
│ World population:           ~8 billion         │
│ US population:              ~330 million       │
│ India population:           ~1.4 billion       │
│ Internet users:             ~5 billion         │
│ Smartphone users:           ~4.5 billion       │
│ Google searches/day:        ~8.5 billion       │
│ YouTube uploads/minute:     ~500 hours         │
│ Emails sent/day:            ~300 billion       │
│ WhatsApp messages/day:      ~100 billion       │
│ Average webpage size:       ~2-3 MB            │
│ Average photo (phone):      ~3-5 MB            │
│ Average email size:         ~75 KB             │
│ 1 minute of HD video:       ~130 MB            │
│ 1 tweet (with metadata):    ~1-2 KB            │
│ Average human reads:        ~250 words/min     │
│ Average typing speed:       ~40 words/min      │
└───────────────────────────────────────────────┘
```

### Solved Example: How Many Piano Tuners in Chicago?

1. Chicago population: ~2.7 million → ~1 million households
2. % with pianos: ~5% → 50,000 pianos
3. Tuning frequency: ~once per year → 50,000 tunings/year
4. Tuner capacity: ~4 tunings/day × 250 working days = 1,000/year
5. Piano tuners needed: $50{,}000 / 1{,}000 = 50$

**Answer: ~50 piano tuners.** (Actual: ~100. Within an order of magnitude — that's a good Fermi estimate.)

### Solved Example: How Much Storage Does Gmail Need Per Day?

1. Gmail users: ~1.8 billion
2. Active daily users: ~30% → 540 million
3. Emails sent per active user per day: ~5
4. Average email size: ~75 KB
5. Total: $540M \times 5 \times 75KB = 540 \times 10^6 \times 375KB \approx 2 \times 10^{11} KB = 200 TB/day$
6. Plus attachments (~10% of emails, ~2 MB each): $54M \times 2MB = 108 TB$
7. **Total: ~300 TB/day** (and that's just incoming — factor in redundancy and the number triples.)

### Practice Problems

**P1 (Medium).** Estimate the number of gas stations in the US.

<details><summary>Answer</summary>

US population: 330M. Cars: ~280M registered. Average fill-up: once per week. Fill-up time: ~10 min. Station operates: 16 hours = 960 min. Pumps per station: ~8. Customers per pump per day: $960/10 = 96$. Per station: $8 \times 96 \approx 768$/day. Weekly customers: $768 \times 7 = 5376$. Gas stations needed: $280M / 5376 \approx 52{,}000$.
**Estimate: ~50,000–150,000.** (Actual: ~150,000. Our estimate is conservative because we assumed high utilization.)
</details>

**P2 (Medium).** How much data does Netflix store?

<details><summary>Answer</summary>

Content library: ~17,000 titles. Average movie: ~2 hours. Average show: ~10 episodes × 45 min = 7.5 hours. Assume ~5,000 movies (10,000 hrs) and ~12,000 shows (90,000 hrs) = ~100,000 hours total.
Each hour in multiple resolutions (SD, HD, 4K, HDR) and bitrates (~8 profiles) × ~2 GB average per hour per profile.
$100{,}000 \times 8 \times 2 GB = 1.6M GB = 1.6 PB$ for US content. Global (more content): ~10-30 PB.
**Estimate: ~15-30 PB.** (Reported: Netflix uses ~100 PB including all regional content and redundancy.)
</details>

**P3 (Medium).** Estimate QPS for Google Search.

<details><summary>Answer</summary>

8.5 billion searches/day. $8.5 \times 10^9 / 86400 \approx 8.5 \times 10^9 / 10^5 = 85{,}000$ QPS average.
Peak (2-3x average): ~200,000 QPS. **~100K QPS average, ~200K peak.**
</details>

**P4 (Hard).** How many tennis balls fit in this room?

<details><summary>Answer</summary>

Assume a room: $5m \times 4m \times 3m = 60 m^3$. Tennis ball diameter: ~6.5cm, radius ~3.25cm.
Ball volume: $\frac{4}{3}\pi(0.0325)^3 \approx 1.44 \times 10^{-4} m^3$. But packing efficiency: ~64%.
Effective balls: $60 \times 0.64 / 1.44 \times 10^{-4} \approx 267{,}000$.
**Estimate: ~250,000–300,000 tennis balls.**
</details>

**P5 (Hard).** How much storage would you need for a Twitter clone with 500 million users?

<details><summary>Answer</summary>

Daily active users: ~200M (40%). Tweets per DAU: ~2/day. Tweet size (text + metadata): ~1 KB. Media tweets: ~20% with ~500 KB average image.
Daily text: $200M \times 2 \times 1KB = 400 GB$. Daily media: $40M \times 500KB = 20 TB$.
Total daily: ~20 TB. Per year: ~7.3 PB. With 3x replication: ~22 PB/year.
**Estimate: ~20 PB per year.**
</details>

**P6 (Hard).** How many WhatsApp messages are sent per second globally?

<details><summary>Answer</summary>

100 billion messages/day. $100 \times 10^9 / 86400 \approx 1.16 \times 10^6$.
**Estimate: ~1.2 million messages per second.** Peak: likely 2-3x → ~3M/sec.
</details>

**P7 (Hard).** Estimate the total storage needed for YouTube.

<details><summary>Answer</summary>

500 hours of video uploaded per minute. Per day: $500 \times 60 \times 24 = 720{,}000$ hours/day.
Average video size: ~1.5 GB/hour (mixed resolutions). Multiple encodings: ~5 profiles.
Daily upload storage: $720{,}000 \times 1.5 \times 5 = 5.4M GB = 5.4 PB$/day. Per year: ~2 EB (exabytes).
YouTube is ~20 years old but exponential growth means most data is recent. **Total: likely 10-50 EB.**
</details>

**P8 (Hard).** How many engineers does Google need to run Gmail?

<details><summary>Answer</summary>

Gmail serves ~1.8B users with ~300 TB/day new data. Infrastructure: ~500K servers (estimate). Industry ratio: 1 SRE per 1000-10000 servers → 50-500 SREs. Backend engineers: similar count. Frontend, mobile, ML, security: maybe 2-3x SRE count.
**Estimate: 500-2000 engineers.** (This is a wide range — acceptable for Fermi.)
</details>

**P9 (Hard).** How much money does Google make per search query?

<details><summary>Answer</summary>

Google Search ad revenue (~2024): ~$175B/year. Searches: 8.5B/day × 365 = ~3.1 trillion/year.
Revenue per search: $175B / 3.1T \approx $0.056.
**About 5-6 cents per search query.**
</details>

**P10 (Hard).** Estimate the bandwidth needed for a video conferencing service with 10 million simultaneous users.

<details><summary>Answer</summary>

Each user sends + receives video. Assume 720p: ~1.5 Mbps per stream. Average call has ~3 participants.
Each user receives ~2 streams: $2 \times 1.5 = 3$ Mbps down. Sends 1 stream: 1.5 Mbps up.
Total bandwidth: $10M \times (3 + 1.5) Mbps = 45 \times 10^6 Mbps = 45 Tbps$.
**Estimate: ~45 Tbps.** With overhead and redundancy: ~60-100 Tbps.
</details>

---

## 25.11 Puzzles & Brain Teasers

Interviewers use puzzles to see how you think, not whether you've memorized the answer. State your assumptions. Think aloud. Break big problems into smaller ones.

### Strategy

1. **Clarify** — Ask questions about assumptions
2. **Simplify** — Start with a smaller version of the problem
3. **Draw** — Diagrams make everything clearer
4. **Work backwards** — Sometimes the end state reveals the path
5. **Eliminate** — Rule out what's impossible

### Practice Problems

**P1 (Easy).** You have two hourglasses: one measures 7 minutes, the other 4 minutes. How do you measure exactly 9 minutes?

<details><summary>Answer</summary>

Start both. When the 4-min runs out (at t=4), flip it. When the 7-min runs out (at t=7), flip the 4-min (which has 1 minute of sand left, now has 3 minutes). Wait for the flipped 4-min at t=7: it runs for 1 min (the sand remaining from before flipping at t=4). That gives t=8. Hmm, let me reconsider.

Start both at t=0. At t=4, flip the 4-min. At t=7, the 7-min runs out. The 4-min has 1 min left. Flip the 7-min. When the 4-min finishes (t=8), flip the 7-min (it has run 1 min, so 6 left). That's not clean either.

Better approach: Start both. At t=4, flip the 4-min. At t=7, flip the 4-min (has 1 min left, flip it → 3 min of sand on top). At t=7, also start timing. When the 4-min runs out (2 more minutes later at t=9). Wait — the 4-min was flipped at t=7 with 1 min of sand having run since t=4 flip, so 3 min had run and 1 min remains. Flipping gives 3 min. Ends at t=10.

Simplest: Start both. At t=4, flip 4-min. At t=7, 7-min done, 4-min has 1 min left. Wait for 4-min to finish at t=8. Flip 4-min. At t=8+1=t=9... no, flipping a finished 4-min gives 4 more min.

Correct: Start both at t=0. At t=4, flip the 4-min. At t=7, the 7-min finishes. The 4-min has been running for 3 minutes since flip, 1 minute left. Let it run. At t=8, the 4-min finishes. Flip the 4-min. But we wanted 9 min from start. At t=8, flip the 4-min, count 1 more minute? We have no 1-min device.

**Actual answer:** Start both. At t=4, flip 4-min. At t=7, the 4-min has 1 min left. Flip the 7-min hourglass. When the 4-min runs out (t=8), 1 min has passed on the 7-min. Flip the 7-min again. When it runs out, 1 more minute passes. Total: t=8+1 = **9 minutes.** ✓
</details>

**P2 (Easy).** A farmer has to cross a river with a fox, a chicken, and a bag of grain. The boat holds only the farmer + one item. The fox eats the chicken if left alone. The chicken eats the grain if left alone. How?

<details><summary>Answer</summary>

1. Take chicken across.
2. Return alone.
3. Take fox across.
4. Bring chicken back.
5. Take grain across.
6. Return alone.
7. Take chicken across.
**7 trips total.**
</details>

**P3 (Easy).** You have 3 light switches outside a room. One controls a bulb inside. You can enter the room only once. How do you determine which switch controls the bulb?

<details><summary>Answer</summary>

Turn switch 1 ON for 10 minutes. Turn it OFF, turn switch 2 ON. Enter the room.
- Bulb ON → switch 2.
- Bulb OFF but warm → switch 1.
- Bulb OFF and cold → switch 3.
</details>

**P4 (Medium).** You have two water jugs: 5 liters and 3 liters. How do you measure exactly 4 liters?

<details><summary>Answer</summary>

1. Fill the 5L jug.
2. Pour into 3L jug until full → 5L has 2L left, 3L is full.
3. Empty the 3L jug.
4. Pour the 2L from 5L into 3L → 3L has 2L.
5. Fill the 5L jug again.
6. Pour from 5L into 3L (which has 2L, needs 1L more) → 5L now has **4L.** ✓
</details>

**P5 (Medium).** 100 people in a line. Each wears a red or blue hat. Each can see all hats in front but not their own. Starting from the back, each must say "red" or "blue". They can only hear previous answers. They agree on a strategy beforehand. What's the maximum they can guarantee saving?

<details><summary>Answer</summary>

**99 out of 100.** The last person (back of line) counts the number of red hats they see. If odd, they say "red"; if even, "blue" (sacrificing themselves with 50% chance). Each subsequent person can deduce their own hat color by tracking the parity from what they see and what they've heard.
</details>

**P6 (Medium).** You have 1000 wine bottles, one is poisoned. You have 10 prisoners to test. Poison takes exactly 24 hours to kill. You have exactly 24 hours. How do you find the poisoned bottle?

<details><summary>Answer</summary>

Binary encoding. $2^{10} = 1024 > 1000$. Assign each bottle a 10-bit binary number. Prisoner $i$ drinks from all bottles where bit $i$ is 1. After 24 hours, the pattern of dead prisoners gives the binary number of the poisoned bottle.
**10 prisoners can identify 1 bottle among up to 1024.**
</details>

**P7 (Medium).** Two ropes. Each burns in exactly 1 hour but not uniformly (different parts burn at different rates). How do you measure 45 minutes?

<details><summary>Answer</summary>

Light rope 1 from both ends and rope 2 from one end simultaneously.
- Rope 1 burns out in **30 minutes** (both ends burning).
- At that moment, rope 2 has 30 minutes left. Light rope 2 from the other end.
- Rope 2 now burns out in **15 more minutes**.
Total: $30 + 15 = 45$ minutes. ✓
</details>

**P8 (Hard).** You're on a game show with 3 doors. Behind one is a car, behind the other two are goats. You pick door 1. The host (who knows what's behind each door) opens door 3, showing a goat. Should you switch to door 2?

<details><summary>Answer</summary>

**Yes, always switch.** This is the Monty Hall problem. Your initial pick has 1/3 chance. The other two doors collectively have 2/3 chance. The host revealing a goat doesn't change this — it concentrates the 2/3 probability onto the remaining door. Switching gives you **2/3** probability of winning.
</details>

**P9 (Hard).** You drop 2 eggs from a 100-floor building. You need to find the highest safe floor. Minimize the worst-case number of drops. What's the strategy?

<details><summary>Answer</summary>

**14 drops.** Use the first egg at decreasing intervals: floor 14, then 27 (14+13), then 39 (27+12), then 50, 60, 69, 77, 84, 90, 95, 99, 100.
If the first egg breaks at floor $X$, use the second egg to go one by one from the previous checkpoint. The decreasing intervals ensure worst case is always 14.
Mathematically: find smallest $n$ where $n + (n-1) + (n-2) + ... + 1 \geq 100$. $n(n+1)/2 \geq 100$. $n = 14$ (since $14 \times 15/2 = 105$).
**Minimum worst case: 14 drops.**
</details>

**P10 (Hard).** There are 5 pirates (ranked 1-5, 5 is most senior) dividing 100 gold coins. Same rules as P20 in section 25.8 but with a twist: if a pirate is indifferent (gets the same either way), they vote to throw the proposer overboard. What changes?

<details><summary>Answer</summary>

Now ties go against the proposer. With 2 pirates: Pirate 2 proposes (100, 0). Pirate 1 gets 0, is indifferent compared to... there's no "next round" if only 1 pirate. Pirate 1 votes no (indifferent → throw overboard). Pirate 2 is thrown overboard. Pirate 1 gets 100.
With 3 pirates: Pirate 3 needs pirate 1 or 2 to vote yes. Pirate 2 gets 100 if pirate 3 is eliminated (only 2 left, and pirate 1 eliminates pirate 2 → pirate 2 gets 0). Wait, with 2 pirates and the spite rule, pirate 2 gets thrown overboard. So pirate 2 gets 0 if pirate 3 is eliminated. Offer pirate 2 one coin: (0, 1, 99). Pirate 2 votes yes (1 > 0).
With 4: Pirate 4 needs 2 votes. If pirate 4 is gone, pirate 3 proposes (0,1,99). Pirate 1 gets 0 then. Offer pirate 1 one coin: (1, 0, 0, 99). Two yes votes (pirate 1 and pirate 4).
With 5: Pirate 5 needs 3 votes. If pirate 5 goes, pirate 4 does (1,0,0,99). Pirate 2 and 3 get 0. Offer them 1 each. **(0, 1, 1, 0, 98).**
</details>

---

## 25.12 Daily Practice Plan

Aptitude improves with consistent, focused practice. Here is a plan designed for 30 minutes per day, 6 days per week.

### Weekly Rotation

```
┌───────────┬───────────────────────────────────┐
│ Day       │ Focus Area                        │
├───────────┼───────────────────────────────────┤
│ Monday    │ Logical Reasoning + Puzzles       │
│ Tuesday   │ Number Series + Pattern Recog.    │
│ Wednesday │ Percentages + Profit/Loss/Ratios  │
│ Thursday  │ Time-Speed-Distance + Work        │
│ Friday    │ Probability + Combinatorics       │
│ Saturday  │ Fermi Estimation + Data Interp.   │
│ Sunday    │ Rest (or review weak areas)       │
└───────────┴───────────────────────────────────┘
```

### 30-Minute Session Structure

```
┌──────────────────────────────────────────────────┐
│ 0:00 - 2:00   Warmup (mental math drills)        │
│ 2:00 - 7:00   Review formulas for today's topic  │
│ 7:00 - 25:00  Solve 5-8 problems (timed)         │
│ 25:00 - 28:00 Review mistakes, note patterns      │
│ 28:00 - 30:00 Log score, plan next session        │
└──────────────────────────────────────────────────┘
```

### Progress Tracking Template

```
┌──────────┬──────────┬───────┬────────┬──────────┬──────────────────┐
│ Date     │ Topic    │ Tried │ Correct│ Accuracy │ Notes            │
├──────────┼──────────┼───────┼────────┼──────────┼──────────────────┤
│ 04/25    │ Series   │ 8     │ 6      │ 75%      │ Weak on quadratic│
│ 04/26    │ Prob/Loss│ 7     │ 5      │ 71%      │ Successive disc. │
│ ...      │ ...      │ ...   │ ...    │ ...      │ ...              │
└──────────┴──────────┴───────┴────────┴──────────┴──────────────────┘
```

### How This Connects to Your Interview Prep

| Aptitude Skill | Interview Application |
|---|---|
| Mental math & powers of 2 | System design capacity estimation |
| Probability & Bayes | ML model evaluation, A/B testing |
| Fermi estimation | System design back-of-envelope |
| Series & patterns | Algorithm analysis, complexity reasoning |
| Logical reasoning | Debugging, system architecture decisions |
| Combinatorics | Feature engineering, search space analysis |
| Data interpretation | Reading experiment results, dashboards |
| Percentages & ratios | Business metrics, impact analysis |

Every section in this chapter maps directly to a skill you need in technical interviews. Mental math makes you faster. Probability makes you a better ML engineer. Fermi estimation makes you a better system designer. And logical reasoning makes you a better debugger.

Build the habit. 30 minutes a day. Track your progress. In 4 weeks, you will be measurably faster and more confident.

---

**Previous:** [Chapter 24 — GPUs, TPUs & AI Infrastructure](24_misc_topics.md)
