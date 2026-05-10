# Chapter 03 — Aptitude & Mental Math for Engineers

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

## 3.1 Mental Math Shortcuts & Number Sense

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

## 3.2 Number Series & Pattern Recognition

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

## 3.3 Percentages, Profit & Loss, Ratios

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

## 3.4 Time, Speed & Distance

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

## 3.5 Time & Work

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

## 3.6 Probability

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

## 3.7 Combinatorics & Counting

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

## 3.8 Logical Reasoning

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

## 3.9 Data Interpretation

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

## 3.10 Fermi Estimation (System Design Essential)

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
│ POPULATION & USAGE                             │
│ World population:           ~8 billion         │
│ US population:              ~330 million       │
│ India population:           ~1.4 billion       │
│ Internet users:             ~5 billion         │
│ Smartphone users:           ~4.5 billion       │
│ Google searches/day:        ~8.5 billion       │
│ YouTube uploads/minute:     ~500 hours         │
│ Emails sent/day:            ~300 billion       │
│ WhatsApp messages/day:      ~100 billion       │
│                                                │
│ DATA SIZES                                     │
│ Average webpage size:       ~2-3 MB            │
│ Average photo (phone):      ~3-5 MB            │
│ Average email size:         ~75 KB             │
│ 1 minute of HD video:       ~130 MB            │
│ 1 tweet (with metadata):    ~1-2 KB            │
│ 1 token (English text):     ~4 chars / ~0.75 wd │
│ Average human reads:        ~250 words/min     │
│ Average typing speed:       ~40 words/min      │
└───────────────────────────────────────────────┘
```

### AI / ML Engineer's Numbers (2026)

By 2026 every system-design interview either *is* an AI system or includes an AI component. Memorise these the way you memorise powers of 2.

```
┌────────────────────────────────────────────────────────────┐
│ MODELS & PARAMETERS                                         │
│ 1 parameter (BF16 / FP16):          2 bytes                │
│ 1 parameter (INT8):                 1 byte                 │
│ 1 parameter (INT4):                 0.5 bytes              │
│ 7B model in BF16:                   ~14 GB                 │
│ 7B model in INT4:                   ~3.5 GB (fits a phone) │
│ 70B model in BF16:                  ~140 GB                │
│ 70B model in INT4:                  ~35 GB (fits 1 H100)   │
│ Frontier MoE (e.g. DeepSeek V4):    ~1.6 T total / 49 B act│
│                                                             │
│ HARDWARE                                                    │
│ NVIDIA H100 HBM:                    80 GB                  │
│ NVIDIA B200 HBM:                    192 GB                 │
│ Google TPU v7 (Ironwood) HBM:       192 GB                 │
│ Ironwood pod (9,216 chips):         ~42.5 exaFLOPS         │
│ One H100 inference (Llama 8B BF16): ~30-100 tokens/sec     │
│ vLLM throughput vs naive:           ~5-10×                 │
│                                                             │
│ TOKENS & COSTS (May 2026)                                   │
│ 1 English word ≈                    ~1.3 tokens            │
│ 1 page of text ≈                    ~500 tokens            │
│ Frontier API (Gemini 3 Pro):        $2 in / $12 out per M │
│ Cheap API (Flash / Haiku tier):     ~$0.05-0.15 per M tok │
│ "GPT-4 quality" cost (2026):        ~$0.06 per M tok       │
│ Token price drop 2022 → 2026:       ~1000×                 │
│                                                             │
│ CONTEXT & LATENCY                                           │
│ Standard context window (2026):     1-2 M tokens           │
│ Llama 4 Scout context:              10 M tokens            │
│ TTFT for 8B model on H100:          ~50-100 ms             │
│ Reasoning model thinking budget:    1 K - 100 K tokens     │
│                                                             │
│ TRAINING (rule-of-thumb)                                    │
│ Compute-optimal tokens per param:   ~20 (Chinchilla)       │
│ FLOPs to train: ~6 × params × tokens  (Kaplan 2020)        │
│ GPT-4-class training compute:       ~10^25 FLOPs           │
│ Cost to train a 70B model in 2026:  ~$1-5 M USD            │
└────────────────────────────────────────────────────────────┘
```

### Solved Example: How much does it cost to serve an LLM chatbot?

A startup wants to serve 100K daily active users on a Llama-3.1-8B chatbot. Estimate monthly inference cost.

1. DAUs: 100K. Sessions/user/day: ~3. Messages/session: ~5. → **1.5 M messages/day**.
2. Avg input tokens/message: ~500 (system prompt + history + query). Output: ~200.
3. Daily tokens: $1.5\text{M} \times 700 \approx 10^9$ tokens/day = **30 B tokens/month**.
4. **Option A — hosted API (e.g. Gemini 3 Flash)**: ~$0.10 per M tokens blended → $30\text{B} \times \$0.10/\text{M} = \$3{,}000/\text{month}$.
5. **Option B — self-host on vLLM + 1 H100** ($2/hour): one H100 sustains ~50 tok/s output × 86,400 s = **~4.3 M tok/day**. You need $30\text{B}/(30 \times 4.3\text{M}) \approx 230$ GPU-hours/day, or ~10 H100s running 24/7. $10 \times \$2 \times 24 \times 30 = \$14{,}400/\text{month}$.
6. **Conclusion**: hosted API is ~5× cheaper at this scale. Self-host wins above ~10–100× this volume, or for privacy-critical workloads.

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

## 3.11 Puzzles & Brain Teasers

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

The trick: each time the 4-min ends, you've created a 1-min "remainder" of sand in the 7-min hourglass that you can then flip and re-use.

Start both at t = 0.
- **t = 4** — 4-min finishes. Flip it.
- **t = 7** — 7-min finishes. Flip it. (The 4-min has 1 min left.)
- **t = 8** — 4-min finishes. Flip the 7-min *again* — only 1 min of sand has fallen into the bottom since t=7, so the flipped hourglass has just 1 min of sand on top.
- **t = 9** — that 1 min runs out. **Total elapsed: 9 minutes.** ✓
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

**P10 (Hard).** There are 5 pirates (ranked 1-5, 5 is most senior) dividing 100 gold coins. Same rules as P20 in section 3.8 but with a twist: if a pirate is indifferent (gets the same either way), they vote to throw the proposer overboard. What changes?

<details><summary>Answer</summary>

Now ties go against the proposer. With 2 pirates: Pirate 2 proposes (100, 0). Pirate 1 gets 0, is indifferent compared to... there's no "next round" if only 1 pirate. Pirate 1 votes no (indifferent → throw overboard). Pirate 2 is thrown overboard. Pirate 1 gets 100.
With 3 pirates: Pirate 3 needs pirate 1 or 2 to vote yes. Pirate 2 gets 100 if pirate 3 is eliminated (only 2 left, and pirate 1 eliminates pirate 2 → pirate 2 gets 0). Wait, with 2 pirates and the spite rule, pirate 2 gets thrown overboard. So pirate 2 gets 0 if pirate 3 is eliminated. Offer pirate 2 one coin: (0, 1, 99). Pirate 2 votes yes (1 > 0).
With 4: Pirate 4 needs 2 votes. If pirate 4 is gone, pirate 3 proposes (0,1,99). Pirate 1 gets 0 then. Offer pirate 1 one coin: (1, 0, 0, 99). Two yes votes (pirate 1 and pirate 4).
With 5: Pirate 5 needs 3 votes. If pirate 5 goes, pirate 4 does (1,0,0,99). Pirate 2 and 3 get 0. Offer them 1 each. **(0, 1, 1, 0, 98).**
</details>

---

## 3.12 Calendar & Clocks

> Two classical aptitude topics that show up in nearly every campus test and occasionally in interview puzzle rounds (e.g., "if today is Wednesday, what day will it be in 1000 days?").

### 3.12.1 Calendar Arithmetic

```
   KEY FACTS:
      ▸ Ordinary year: 365 days = 52 weeks + 1 odd day.
      ▸ Leap year: 366 days = 52 weeks + 2 odd days.
      ▸ Leap rule: divisible by 4, except centuries unless divisible by 400.
                   1900: NOT leap. 2000: leap. 2024: leap.
      ▸ A century has 24 leap years (76 ordinary): 76 + 2×24 = 124 odd days = 17×7 + 5.
        So 100 years = 5 odd days. 200 years = 3. 300 years = 1. 400 years = 0.

   ALGORITHM (find day of any date):
      1. Count odd days from a known reference (e.g., 1 Jan 1900 was Monday).
      2. Add odd days for full centuries, partial years, months in current year, and the date.
      3. Mod 7. Map 0→Sunday, 1→Monday, ..., 6→Saturday.
```

### Practice Problems

**P1 (Easy).** Today is Wednesday. What day will it be 100 days from now?

<details><summary>Answer</summary>

100 mod 7 = 2 (since 14×7 = 98). Wednesday + 2 = **Friday**.
</details>

**P2 (Easy).** Is the year 2100 a leap year?

<details><summary>Answer</summary>

Divisible by 100 but not by 400 → **NOT** a leap year. (Same with 1700, 1800, 1900. But 2000 IS a leap year.)
</details>

**P3 (Medium).** A project started on Monday and runs for 1000 days. What day does it end?

<details><summary>Answer</summary>

1000 mod 7 = 6 (since 142×7 = 994). Monday + 6 = **Sunday**. (Counting day 1 as Monday, day 1000 lands on Sunday.)
</details>

### 3.12.2 Clocks — Angles & Hand Overlaps

```
   KEY FACTS:
      ▸ Hour hand moves 360° / 12 hours = 30°/hour = 0.5°/min.
      ▸ Minute hand moves 360° / 60 min = 6°/min.
      ▸ Relative speed: 6 − 0.5 = 5.5°/min.

   ANGLE BETWEEN HANDS at h:m:
      |30 × h − 5.5 × m|   (take min with 360 minus result if > 180).

   HOW OFTEN DO HANDS OVERLAP?
      Minute hand laps hour hand once per 12/11 hours = ~65.45 min.
      So in 12 hours: 11 overlaps. In 24 hours: 22.
      (NOT 12 — they don't overlap at exactly 12:00 AND 12:60 — there is no 12:60.)
```

### Practice Problems

**P1 (Easy).** What's the angle between the hands at 3:15?

<details><summary>Answer</summary>

|30×3 − 5.5×15| = |90 − 82.5| = **7.5°**. (Counterintuitive — at 3:15 the minute hand is exactly on 3, but the hour hand has moved 7.5° past 3.)
</details>

**P2 (Medium).** At what time between 4 and 5 do the hands first overlap?

<details><summary>Answer</summary>

At 4:00, hour hand is at 120°, minute hand at 0°. Minute hand catches up at 5.5°/min. Time = 120/5.5 = **21.818... min** past 4 ≈ 4:21:49.
</details>

**P3 (Medium).** A clock loses 2 minutes per day. After 30 days, by how much is it wrong?

<details><summary>Answer</summary>

2 × 30 = **60 minutes** = 1 hour slow.
</details>

---

## 3.13 Compound Interest, EMI & Time-Value Math

> The Rule of 72 (§3.1) is the lazy version. Real engineering finance — for ML monetisation, infra cost projections, your own salary negotiation — needs the actual formulas.

### 3.13.1 Compound Interest

```
   AMOUNT after n years at rate r (compounded annually):
      A = P × (1 + r)^n        where r is decimal (5% → 0.05)

   MENTAL APPROXIMATIONS:
      ▸ (1 + r)^n ≈ 1 + n·r           for small r·n (Taylor)
      ▸ (1 + r)^n ≈ e^(n·r)           for any small r
      ▸ Doubling time ≈ ln(2)/r ≈ 0.693/r ≈ 70/rate% (a tighter Rule of 70/72)

   COMPOUNDED m TIMES PER YEAR:
      A = P × (1 + r/m)^(m·n)
   In the limit m → ∞ (continuous compounding): A = P × e^(r·n).
```

### 3.13.2 EMI — Equated Monthly Installment

```
   EMI = P × r × (1+r)^n / ((1+r)^n − 1)
      where r is monthly rate, n is months.

   MENTAL CHECK: for a long loan at low rate, EMI ≈ P/n + P·r/2.
                 For a 30-year mortgage at 6% APR (0.5%/mo, n=360):
                 monthly rate × P ≈ half the EMI; remainder is principal repayment.
```

### 3.13.3 Time-Value Math (NPV)

```
   NPV (Net Present Value) of cashflows C_0, C_1, ..., C_n at discount rate r:
      NPV = Σ C_t / (1 + r)^t

   "Money next year is worth less than money today."

   PERPETUITY (cashflow C every year forever): PV = C / r.
   GROWING PERPETUITY (grows at g): PV = C / (r − g).      [Gordon growth model]
```

### Practice Problems

**P1 (Easy).** $10,000 invested at 6% compound annual, for 12 years. What's it worth?

<details><summary>Answer</summary>

Doubling time ≈ 72/6 = 12 years. So **~$20,000**. (Exact: 10,000 × 1.06^12 ≈ $20,122.)
</details>

**P2 (Medium).** A $100K SaaS contract pays $30K/year for 4 years. At a 10% discount rate, what's its NPV?

<details><summary>Answer</summary>

NPV = 30/1.1 + 30/1.21 + 30/1.331 + 30/1.4641
   ≈ 27.3 + 24.8 + 22.5 + 20.5 ≈ **$95K** (slightly less than $100K nominal).
</details>

**P3 (Medium).** Your startup is offered $1M for X% equity. You estimate the company will generate $200K/year forever. At a 15% discount rate, what's the company worth, and how much equity should you sell for $1M?

<details><summary>Answer</summary>

Perpetuity value: $200K / 0.15 ≈ **$1.33M**. Equity for $1M = 1/1.33 ≈ **75%**. (Brutal — but explains why founders raise smaller rounds.)
</details>

**P4 (Hard).** A model API costs $0.10 per M tokens today, dropping at 30% per year (compound). What does it cost in 5 years?

<details><summary>Answer</summary>

$0.10 × (0.7)^5 = $0.10 × 0.168 ≈ **$0.017 / M tokens** — about 6× cheaper. (Matches the 2022→2026 ~1000× drop pattern.)
</details>

---

## 3.14 Mixtures, Pipes, Boats & Trains

> Four classical aptitude topics that share one common idea: **rates that combine linearly**. Master one and the rest fall.

### 3.14.1 Mixtures & Allegations

```
   ALLEGATION RULE — for two-ingredient mixtures:

       Cheaper            Dearer
        Cprice              Dprice
            \              /
             \            /
              Mean (Mprice)
             /            \
            /              \
       Dprice − Mprice : Mprice − Cprice    ← ratio of cheaper : dearer

   USE: blend two materials with known prices/concentrations to hit a target.
```

### Practice Problems

**P1 (Easy).** Mix coffee at $8/lb and $14/lb to make a blend at $10/lb. In what ratio?

<details><summary>Answer</summary>

Allegation: (14 − 10) : (10 − 8) = 4 : 2 = **2:1** (cheaper to dearer). Use 2 parts $8 coffee for every 1 part $14 coffee.
</details>

**P2 (Medium).** A 60-litre solution is 30% acid. How much pure water must be added to dilute to 20%?

<details><summary>Answer</summary>

Acid is 18 L. After dilution, 18 L = 20% of total → total = 90 L. Water added = **30 L**.
</details>

### 3.14.2 Pipes & Cisterns

> Same as work problems (§3.5) but with inflow vs outflow.

```
   ▸ Pipe A fills tank in a hours → rate 1/a per hour.
   ▸ Pipe B drains in b hours → rate −1/b per hour.
   ▸ Both open: net rate = 1/a − 1/b.
```

**P3 (Medium).** Pipe A fills in 6 hours, pipe B drains in 9 hours. Both open — how long to fill?

<details><summary>Answer</summary>

Net rate = 1/6 − 1/9 = 3/18 − 2/18 = 1/18. Time = **18 hours**.
</details>

### 3.14.3 Boats & Streams

```
   ▸ Boat speed in still water = b
   ▸ Stream speed                = s
   ▸ Downstream:    b + s
   ▸ Upstream:      b − s

   KEY: average speed for round trip is harmonic mean, NOT arithmetic.
        Round-trip avg = 2bd / (d_down + d_up)... or: 2 × (b² − s²) / (2b) = (b² − s²)/b.
```

**P4 (Medium).** A boat does 10 km downstream in 1 hour and 10 km upstream in 2 hours. Find boat and stream speeds.

<details><summary>Answer</summary>

b + s = 10, b − s = 5 → b = 7.5 km/h, s = 2.5 km/h.
</details>

### 3.14.4 Trains

```
   ▸ Time to cross a STATIONARY POINT (pole/man):  L / v       (length / speed)
   ▸ Time to cross a PLATFORM/BRIDGE:              (L_train + L_platform) / v
   ▸ Time for two trains to CROSS in opposite dirs: (L_1 + L_2) / (v_1 + v_2)
   ▸ Time for FASTER to overtake SLOWER:            (L_1 + L_2) / (v_1 − v_2)
```

**P5 (Medium).** A 200m train running at 90 km/h passes a 400m platform. How long?

<details><summary>Answer</summary>

90 km/h × (5/18) = 25 m/s. Total distance = 200 + 400 = 600 m. Time = 600/25 = **24 sec**.
</details>

**P6 (Hard).** Two trains 150m and 200m long run in opposite directions on parallel tracks at 54 km/h and 72 km/h. How long to cross each other?

<details><summary>Answer</summary>

54 + 72 = 126 km/h = 35 m/s. Combined length = 350m. Time = 350/35 = **10 sec**.
</details>

---

## 3.15 Geometry & Mensuration

> Show up in: image-processing math (bounding boxes, ROIs), bin packing, ML data augmentation (rotation/scale), and physical-system Fermi estimates (warehouse, delivery routes).

### Key Formulas (Memorise)

```
   2D AREAS:
      Square (side a):              a²
      Rectangle (l, w):             l × w
      Triangle (base b, height h):  ½ × b × h
      Circle (radius r):            π r²       ≈ 3.14 r²
      Ellipse (a, b):               π a b

   2D PERIMETERS:
      Circle (radius r):            2π r       ≈ 6.28 r

   3D VOLUMES:
      Cube (side a):                a³
      Cuboid (l, w, h):             l × w × h
      Cylinder (r, h):              π r² h
      Cone (r, h):                  ⅓ π r² h
      Sphere (r):                   ⁴⁄₃ π r³
      Pyramid (base A, h):          ⅓ × A × h

   3D SURFACE AREAS:
      Cylinder (r, h):              2π r (r + h)
      Sphere (r):                   4π r²

   PYTHAGORAS:
      For right triangle:           a² + b² = c²
      3-4-5 triple:                 always recognisable
      5-12-13, 8-15-17, 7-24-25:    other useful triples
```

### Practice Problems

**P1 (Easy).** A square has perimeter 40. What's its area?

<details><summary>Answer</summary>

Side = 40/4 = 10. Area = **100**.
</details>

**P2 (Medium).** A cone has base radius 6 and height 8. Find slant height and surface area.

<details><summary>Answer</summary>

Slant ℓ = √(36+64) = √100 = **10**. Surface = π r ℓ + π r² = π·60 + π·36 = **96π ≈ 302**.
</details>

**P3 (Medium).** ML augmentation: an image is rotated 30° and rescaled to 80%. Original 1024×1024. New bounding box?

<details><summary>Answer</summary>

Rotated bbox max = original × (|cos θ| + |sin θ|). cos 30 + sin 30 ≈ 0.866 + 0.5 = 1.366. New side = 1024 × 1.366 × 0.8 ≈ **1119 px**.
</details>

**P4 (Hard).** A ML batch contains 32 images, each 224×224×3 bytes. Total bytes? GPU memory at FP16 if doubled for activations?

<details><summary>Answer</summary>

Per image: 224² × 3 = 150,528 bytes ≈ 150 KB. Batch: 32 × 150 KB ≈ **4.8 MB** raw. FP16 activations through a typical CNN: ~10× input → ~50 MB. Doubled: **~100 MB**. Negligible vs model weights for any modern net.
</details>

---

## 3.16 Logarithms & Exponentials Mental Math

> Logs are the engineer's best friend: they turn multiplication into addition, exponential growth into linear, and "how many bits do I need?" into a one-liner.

### Key Identities & Mental Numbers

```
   IDENTITIES:
      log(a·b)    = log a + log b
      log(a/b)    = log a − log b
      log(a^n)    = n · log a
      log_b(x)    = log_a(x) / log_a(b)        [change of base]

   MEMORISE (base 10):
      log₁₀(1)   = 0
      log₁₀(2)   ≈ 0.301
      log₁₀(3)   ≈ 0.477
      log₁₀(5)   = 1 − log 2 ≈ 0.699
      log₁₀(7)   ≈ 0.845
      log₁₀(10)  = 1

   USEFUL APPROX:
      ln(2) ≈ 0.693
      ln(10) ≈ 2.303         (so log₁₀(x) ≈ ln(x) / 2.303)
      e ≈ 2.718
      log₂(10) ≈ 3.32         (so 10 bits ≈ 3 decimal digits, 20 bits ≈ 6 digits)
```

### Mental Tricks

```
   "How many digits does 2^100 have?"
      log₁₀(2^100) = 100 × 0.301 = 30.1
      → 31 digits.

   "How many bits to represent 1 billion?"
      log₂(10^9) = 9 × log₂(10) ≈ 9 × 3.32 ≈ 30 bits.

   "Doubling time at 5% growth?"
      ln(2) / 0.05 ≈ 0.693 / 0.05 ≈ 14 years. (Rule of 70.)

   "Perplexity 32 — how many bits per token?"
      log₂(32) = 5 bits per token.
```

### Practice Problems

**P1 (Easy).** How many digits in 2^30?

<details><summary>Answer</summary>

30 × 0.301 = 9.03 → **10 digits**. (Exact: 1,073,741,824.)
</details>

**P2 (Medium).** An LLM has perplexity of 16 on a corpus. What does that mean in bits?

<details><summary>Answer</summary>

log₂(16) = **4 bits per token**. (Cross-entropy = log₂(perplexity).)
</details>

**P3 (Medium).** You compress text with 8-bit ASCII to a Huffman code averaging 5 bits per char. Compression ratio?

<details><summary>Answer</summary>

5/8 = **62.5%** of original size, or **37.5% saved**.
</details>

**P4 (Hard).** Approximate ln(50) without a calculator.

<details><summary>Answer</summary>

ln(50) = ln(100/2) = ln(100) − ln(2) = 2·ln(10) − ln(2) ≈ 2(2.303) − 0.693 ≈ **3.91**. (Exact: 3.912.)
</details>

---

## 3.17 Statistics Mental Math

> Speed-running through interview-relevant stats: mean / median / std dev / weighted average / outlier intuition.

### Key Formulas & Tricks

```
   MEAN:        μ = Σ x_i / n
   MEDIAN:      middle value when sorted (n odd)
                    or average of two middle (n even)
   MODE:        most frequent value
   VARIANCE:    σ² = Σ(x_i − μ)² / n
   STD DEV:     σ = √variance

   WEIGHTED AVG: μ_w = Σ w_i · x_i / Σ w_i

   QUICK STD DEV CHECK:
      For symmetric data, σ ≈ (max − min) / 4 to / 6.
      (Empirically: ~95% of data lies within ±2σ of mean.)

   RULE OF THUMB:
      mean > median  →  right-skew (long right tail).
      mean < median  →  left-skew.
      Salary, wealth, latency tails: right-skew → use median.
```

### Practice Problems

**P1 (Easy).** Numbers: 4, 7, 9, 12, 13. Mean? Median?

<details><summary>Answer</summary>

Sum = 45, mean = 9. Sorted middle is 9 → median = **9**.
</details>

**P2 (Medium).** Test scores: A's mean = 80 (n=10); B's mean = 70 (n=20). Combined mean?

<details><summary>Answer</summary>

Weighted: (10·80 + 20·70) / 30 = (800 + 1400) / 30 = 2200/30 ≈ **73.3**.
</details>

**P3 (Medium).** A latency dataset has mean = 100 ms, median = 60 ms. What does this tell you?

<details><summary>Answer</summary>

Mean ≫ median → **right-skewed with long tail** (slow outliers). Use **median or p95** for SLOs, never the mean.
</details>

**P4 (Hard).** ML model accuracies on 5 holdouts: 85, 87, 84, 86, 92. Quick estimate of std dev?

<details><summary>Answer</summary>

Mean ≈ 86.8. Range = 92 − 84 = 8. σ ≈ 8/4 = **~2 percentage points**. (Exact: ≈ 3.0; the rule-of-thumb is loose but useful.)
</details>

---

## 3.18 Sets & Venn Diagrams (Inclusion–Exclusion)

> Used in: SQL JOIN intuition, A/B test analysis, A∪B query estimation, feature overlap.

### Key Formulas

```
   TWO SETS:
      |A ∪ B| = |A| + |B| − |A ∩ B|

   THREE SETS:
      |A ∪ B ∪ C| = |A| + |B| + |C|
                  − |A ∩ B| − |A ∩ C| − |B ∩ C|
                  + |A ∩ B ∩ C|

   COMPLEMENT:    |A^c| = U − |A|
   DEMORGAN:      (A ∪ B)^c = A^c ∩ B^c

   PROBABILITY VERSION:
      P(A ∪ B) = P(A) + P(B) − P(A ∩ B).
      Independent A, B → P(A ∩ B) = P(A)·P(B).
```

### Practice Problems

**P1 (Easy).** 60 students take Math, 50 take Physics, 30 take both. How many take at least one?

<details><summary>Answer</summary>

|M ∪ P| = 60 + 50 − 30 = **80**.
</details>

**P2 (Medium).** A survey: 70% use Gmail, 50% use Outlook, 30% use both. What % use neither?

<details><summary>Answer</summary>

|G ∪ O| = 70 + 50 − 30 = 90%. Neither = **10%**.
</details>

**P3 (Hard).** 100 servers: 80 ran job A, 60 ran job B, 50 ran job C. 40 ran A and B, 30 ran A and C, 20 ran B and C, 10 ran all three. How many servers ran NONE of the jobs?

<details><summary>Answer</summary>

|A∪B∪C| = 80+60+50 −40−30−20 +10 = 110. Wait — that's > 100 unless some servers ran multiple. The inclusion-exclusion gives the count of servers that ran at least one. Check: 110 — but max is 100, so the data is internally inconsistent or my interpretation is off. Assuming 110 is the count *with* multiple-counting handled correctly, |A∪B∪C| = 110 contradicts the universe size. The answer either: data is inconsistent, OR the universe is larger than 100. If we trust the formula and reinterpret universe as {servers used at least once}, then the union = 110 > 100 means at least 10 servers must have run more than what's been accounted — this is one of those puzzles where you flag the inconsistency. **In an interview, point out the contradiction.**
</details>

---

## 3.19 Sequences — AP, GP, HP

> Three sequence types every aptitude test loves. Plus they show up in algorithm analysis (geometric sums in amortised cost) and ML (exponential moving averages).

### Arithmetic Progression (AP)

```
   AP: a, a+d, a+2d, ..., a+(n−1)d.
   ▸ nth term:        T_n = a + (n−1)d
   ▸ Sum of first n:  S_n = n/2 · [2a + (n−1)d]  =  n · (a + L) / 2  (L = last term)

   FAMOUS:  1 + 2 + ... + n = n(n+1)/2
            1² + 2² + ... + n² = n(n+1)(2n+1)/6
            1³ + 2³ + ... + n³ = [n(n+1)/2]²
```

### Geometric Progression (GP)

```
   GP: a, ar, ar², ar³, ..., ar^(n−1).
   ▸ nth term:        T_n = a · r^(n−1)
   ▸ Sum of first n:  S_n = a · (1 − r^n) / (1 − r)         for r ≠ 1
   ▸ Sum to infinity: S_∞ = a / (1 − r)                      for |r| < 1

   FAMOUS:  1/2 + 1/4 + 1/8 + ... = 1
            Bytes in 2^0 + 2^1 + ... + 2^(n-1) = 2^n − 1
```

### Harmonic Progression (HP)

```
   HP: reciprocals form an AP. e.g., 1, 1/2, 1/3, 1/4, ...
   No closed-form sum (the harmonic series diverges, but slowly).

   ▸ HARMONIC MEAN of a, b:   2ab / (a + b)
   ▸ For round-trip avg speed at speeds u, v: HM = 2uv/(u+v).
```

### Practice Problems

**P1 (Easy).** Sum of first 100 natural numbers?

<details><summary>Answer</summary>

100 × 101 / 2 = **5050**. (Famous Gauss-as-a-child anecdote.)
</details>

**P2 (Medium).** A geometric series 2 + 6 + 18 + 54 + ... Find the sum of the first 8 terms.

<details><summary>Answer</summary>

a = 2, r = 3, n = 8. S = 2 · (3^8 − 1) / (3 − 1) = 2 · (6561 − 1) / 2 = **6560**.
</details>

**P3 (Medium).** Round trip: 30 km/h there, 60 km/h back. Average speed?

<details><summary>Answer</summary>

HM = 2·30·60 / (30+60) = 3600/90 = **40 km/h**. (NOT 45 — that's the arithmetic mean.)
</details>

**P4 (Hard).** Amortised analysis: doubling array — costs 1, 2, 4, 8, ..., 2^k after k operations. Total cost? Average per operation?

<details><summary>Answer</summary>

Sum = 2^(k+1) − 1 ≈ 2^(k+1). With ~2^k operations, average = ~2 per op → **O(1) amortised**.
</details>

---

## 3.20 Bayes' Theorem — The ML Engineer's Mental Math

> **Bayes' theorem** updates a prior belief in light of new evidence. It is the single most-asked topic at the intersection of probability and ML interviews. (Ch 12 has the deep dive; this is the mental-math angle.)

```
   P(A | B) = P(B | A) · P(A) / P(B)

   Plain English:
      "How likely is hypothesis A given that I observed B?"
       = (likelihood of B given A) × (prior on A)
       ÷ (overall probability of B).
```

### The base-rate trap (the classic interview question)

> 1% of the population has a disease. A test is 99% accurate (both sensitivity and specificity). You test positive. What's the probability you actually have the disease?

Most people guess **99%**. The right answer is **~50%**.

```
   Mental math, no calculator:
      Imagine 10,000 people.
      ▸ 100 actually have it (1%).      → 99 test positive (true positives)
      ▸ 9,900 don't have it.            → 99 test positive too (1% false positive rate)
      ▸ Total positives: 99 + 99 = 198.
      ▸ P(disease | positive) = 99 / 198 = 50%.

   The base rate (1%) DOMINATES even a 99% accurate test.
   This is "the base-rate fallacy" and it crushes intuition.
```

### Why Bayes shows up everywhere in ML

```
   ▸ ML CLASSIFIER calibration:  what's P(spam | features)?
   ▸ A/B TESTING:                what's P(B better | observed lift)?
   ▸ MEDICAL / FRAUD detection:  rare events + imperfect tests.
   ▸ NAIVE BAYES classifier:     literal application of the theorem.
   ▸ LLM HALLUCINATION:          P(answer correct | model confident)
                                  ≪ P(model confident).
```

### Mental Bayes — the 2-step shortcut

```
   When you hear: "test is X% accurate, base rate is Y%":

   1. Imagine 10,000 people.
   2. Compute true positives, false positives. Add them.
      P(actual | positive) = TP / (TP + FP).

   That's it. Don't try to apply the formula directly under pressure.
```

### Practice Problems

**P1 (Easy).** A spam filter flags 95% of spam and 2% of legitimate emails. 30% of incoming email is spam. Given a flagged email, what's the probability it's actually spam?

<details><summary>Answer</summary>

Out of 10,000 emails: 3,000 spam (95% flagged → 2,850 TP); 7,000 legit (2% flagged → 140 FP). P(spam | flagged) = 2850 / (2850 + 140) ≈ **95.3%**. With a 30% base rate, the filter is reliable.
</details>

**P2 (Medium).** An ML model predicts loan defaults with 80% sensitivity and 90% specificity. Default rate is 5%. A customer is flagged as a default risk. Probability they actually default?

<details><summary>Answer</summary>

10,000 customers: 500 defaulters (80% flagged → 400 TP), 9,500 non-defaulters (10% FP rate → 950 FP). P(default | flagged) = 400 / (400 + 950) ≈ **30%**. Even with a "good" model, low base rate means most flagged customers won't default.
</details>

**P3 (Hard).** Your LLM says "I'm 90% confident this code is correct." On historical data, when it says 90% confident, it's actually correct 70% of the time. What's the calibration gap, and is the model over- or under-confident?

<details><summary>Answer</summary>

Calibration gap = stated confidence (90%) − actual accuracy (70%) = **20 points overconfident**. This is a common LLM pathology — frontier models are typically over-confident at high-stated-confidence levels. Treat any LLM "I'm sure" claim with a Bayesian prior of doubt.
</details>

---

## 3.21 Engineering Math — Latency, Big-O & Bits

> Three more mental-math skills every senior engineer needs at the whiteboard: budgeting latency across a request path, deciding whether an algorithm scales, and reading binary/hex without thinking.

### 3.21.1 Latency Budget Arithmetic

A user-facing request has a fixed budget (commonly **200 ms p99** for web, **100 ms** for autocomplete, **30 ms** for ad serving). Every layer eats into it.

```
   TYPICAL LATENCY BUDGET (~200 ms total):

   ┌────────────────────────────────────────┐
   │  TLS handshake / connection            │  10–30 ms (cached: 0)
   ├────────────────────────────────────────┤
   │  Frontend → API gateway                │  1–5 ms
   ├────────────────────────────────────────┤
   │  API gateway → service mesh            │  1–5 ms
   ├────────────────────────────────────────┤
   │  Service compute                       │  10–50 ms
   ├────────────────────────────────────────┤
   │  Database / cache lookup               │  1–10 ms (cache) / 20–50 ms (DB)
   ├────────────────────────────────────────┤
   │  Response serialization                │  1–5 ms
   ├────────────────────────────────────────┤
   │  Network back to user                  │  20–80 ms (depends on geography)
   └────────────────────────────────────────┘

   Sum of medians ≠ p99. Tail latency adds:
      ▸ p50 sum:   ~80 ms
      ▸ p99 sum:   ~250 ms (each component's tail compounds)
```

**Key reference latencies (memorise):**

```
   L1 cache reference:         ~1 ns
   L2 cache reference:         ~3 ns
   Branch mispredict:          ~5 ns
   Mutex lock/unlock:          ~25 ns
   Main memory reference:      ~100 ns
   SSD random read:            ~150 µs   = 0.15 ms
   Round trip same DC:         ~500 µs   = 0.5 ms
   HDD seek:                   ~10 ms
   Round trip US coast-to-coast: ~40 ms
   Round trip US ↔ Europe:     ~80 ms
   LLM TTFT (frontier API):    ~300-1000 ms
   LLM full response (~500 tok): ~5-10 s
```

### 3.21.2 Big-O Feasibility — Will It Run At This Scale?

When an interviewer says "we have N = 1 billion users," you need to know **instantly** which complexities are feasible.

```
   Rule of thumb on a single modern core (~10^8 ops/sec):

   ┌──────────────┬────────────────────────────────────┐
   │ COMPLEXITY   │  N where it finishes in ~1 second  │
   ├──────────────┼────────────────────────────────────┤
   │ O(1)         │  any N                             │
   │ O(log N)     │  N up to 10^18 (basically any N)   │
   │ O(N)         │  N up to ~10^8                     │
   │ O(N log N)   │  N up to ~10^7                     │
   │ O(N√N)       │  N up to ~10^6                     │
   │ O(N²)        │  N up to ~10^4                     │
   │ O(N³)        │  N up to ~500                      │
   │ O(2^N)       │  N up to ~25                       │
   │ O(N!)        │  N up to ~10                       │
   └──────────────┴────────────────────────────────────┘

   Mental shortcut: if total ops > ~10^9, you can't do it
   on one core in one second. Need parallelism, caching,
   or a better algorithm.
```

**Practice quick-checks**:

- **N = 10^6 users, you want pairwise comparisons?** O(N²) = 10^12. **No.** Need a sublinear method.
- **N = 10^9 entries, you want sorting?** O(N log N) ≈ 3 × 10^10. **No** on one machine. Distribute or sample.
- **N = 10^4 entries, dynamic programming with O(N²)?** 10^8 ops. **Yes**, fits in ~1 second.

### 3.21.3 Bits, Bytes, Hex & Binary — Mental Conversion

```
   ┌──────────┬──────────┬──────────────────────────┐
   │  HEX     │  BIN     │  USE                      │
   ├──────────┼──────────┼──────────────────────────┤
   │  0x10    │  10000   │  16, IPv6 prefix         │
   │  0xFF    │  11111111│  255, max byte           │
   │  0xFFFF  │  16 ones │  65,535, IPv4 mask part  │
   │  0x100   │  9 bits  │  256, common buffer size │
   │  0x1000  │  13 bits │  4,096 = 4 KB page       │
   │  0x10000 │  17 bits │  65,536 = 64 KB          │
   └──────────┴──────────┴──────────────────────────┘

   QUICK TRICKS:
      ▸ Each hex digit = 4 bits. So 0xABCD = 4 hex × 4 = 16 bits.
      ▸ N bytes = N << 3 bits (shift left by 3).
      ▸ 1 KiB = 1024 = 2^10. 1 MiB = 2^20. 1 GiB = 2^30.
      ▸ 8-bit byte: 256 distinct values. UTF-8: variable 1-4 bytes.
      ▸ Color #RRGGBB: 24 bits = 16.7M colors.

   IPv4: 32 bits = 4 bytes = ~4.3B addresses.
   IPv6: 128 bits = 16 bytes = 2^128 ≈ 3.4 × 10^38 addresses.
```

### Practice Problems

**P1 (Easy).** Your service has 5 sequential downstream calls, each with p99 = 50 ms. What's your service's p99?

<details><summary>Answer</summary>

Sequential calls compose by **summing**. Naive answer: 5 × 50 = **250 ms**. (More precisely, p99 of a sum of independent components is somewhat less than the sum of p99s — but for interviews "sum the p99s" is the right back-of-envelope.)
</details>

**P2 (Easy).** What's `0x1A` in decimal?

<details><summary>Answer</summary>

`1A = 1 × 16 + 10 = 26`.
</details>

**P3 (Medium).** N = 10⁶ items. You want to find the top-10 most-similar pairs. Pairwise: O(N²) = 10¹². On one machine, give the budget. Suggest a faster approach.

<details><summary>Answer</summary>

10¹² ops / 10⁸ per sec = ~10⁴ sec = **~3 hours on one core.** Not feasible interactively. Faster approach: LSH (Locality-Sensitive Hashing), MinHash, or ANN index — drops to ~O(N log N) ≈ 2 × 10⁷ ops, sub-second.
</details>

**P4 (Medium).** A service has 4 dependencies, each at p99 = 100 ms. You call them in **parallel**. What's your p99?

<details><summary>Answer</summary>

Parallel calls: your latency is the **maximum** of the 4 p99s. So **~100 ms** in the best case — but tail latency is worse than max-of-medians; common rule of thumb says parallel p99 ≈ 1.2-1.5× single p99 due to tail combination. Plan for ~120-150 ms.
</details>

**P5 (Hard).** You're designing a recommendation system for 100M users × 10K items. You want to compute a similarity matrix. Storage in INT8?

<details><summary>Answer</summary>

10⁸ × 10⁴ × 1 byte = **10¹² bytes = 1 TB**. Will not fit on one machine's RAM. Use sparse representation (most pairs have low similarity), or compute on-demand via approximate methods.
</details>

---

## 3.22 The Birthday Paradox & Hash Collisions

> "How many people in a room before two share a birthday?" The answer (just 23 for >50% probability) is wildly counter-intuitive — and it's the single most important mental-math result for designing hash tables, distributed IDs, and cryptographic hashes.

### The Birthday Paradox

```
   N people, each with one of K possible "buckets" (birthdays: K=365).

   Probability of NO collision after N draws:
      P(no collision) = K! / [(K − N)! · K^N]
                      ≈ exp(−N(N−1) / (2K))     for K ≫ N

   Probability of AT LEAST ONE collision:
      P(collision) ≈ 1 − exp(−N²/(2K))

   "50% collision threshold" (the rule-of-thumb):
      N ≈ √(2K · ln 2) ≈ 1.18 · √K
```

```
   ┌─────────────────────────────────────────────────────────────┐
   │  K (bucket size)        50% threshold N    Quick ≈           │
   ├─────────────────────────────────────────────────────────────┤
   │  365 (birthdays)        23                  ≈ √365 ≈ 19      │
   │  1 million (1 M)        ~1,180              ≈ 1.18 × √1M     │
   │  1 billion (10⁹)        ~37,000             ≈ √10⁹ × 1.18    │
   │  2³² (uint32)           ~77,000             ≈ √(2³²) × 1.18  │
   │  2⁶⁴ (uint64)           ~5 × 10⁹             ≈ √(2⁶⁴) × 1.18  │
   │  2¹²⁸ (UUID, 128-bit)   ~2 × 10¹⁹            ≈ √(2¹²⁸) × 1.18 │
   └─────────────────────────────────────────────────────────────┘

   Mental shortcut: 50% collision threshold ≈ √K.
                    1% collision threshold ≈ √(K/50) ≈ √K / 7.
```

### Why It Matters in Engineering

```
   ▸ HASH TABLES: collisions begin in earnest at √(table size).
                   A 1M-bucket hash with 1K entries is ~50% likely to collide
                   on at least one slot. Plan resolution strategy.

   ▸ DISTRIBUTED IDS: 64-bit random IDs are safe up to ~5 billion entries.
                       128-bit (UUID v4) is safe to roughly 10¹⁹ entries.
                       Snowflake-style IDs (timestamp + machine + counter)
                       avoid this issue entirely.

   ▸ CRYPTO HASHES: SHA-256 has 128-bit second-preimage / 128-bit collision
                     resistance — finding a collision needs ~2¹²⁸ ≈ 10³⁸
                     hash operations. Effectively impossible.

   ▸ MD5 (128-bit, broken): collision findable in ~2⁶⁴ operations,
                             demonstrated in practice — never use for security.
```

### Practice Problems

**P1 (Easy).** A 32-bit hash function. Roughly how many random inputs before you expect a collision?

<details><summary>Answer</summary>

50% threshold ≈ √(2³²) = √(4 × 10⁹) ≈ **65,000**. With 1.18 multiplier ≈ **77,000**. So a 32-bit hash for 100K entries is unsafe.
</details>

**P2 (Medium).** Your service generates 1 million UUIDs per day. How long until you expect a collision with random 64-bit IDs?

<details><summary>Answer</summary>

50% threshold for 64-bit ≈ √(2⁶⁴) ≈ **5 × 10⁹** IDs. At 1M/day = 365M/year, that's **~14 years**. UUIDs (128-bit) make this absurdly long; 64-bit Snowflake-style is fine if structured.
</details>

**P3 (Medium).** A bloom filter has 1 million bits and stores 100K elements with 5 hash functions. Approximate false-positive rate?

<details><summary>Answer</summary>

After inserting 100K × 5 = 500K bits set out of 1M (some collisions). Fraction set ≈ 1 − (1 − 1/10⁶)^(500K) ≈ 1 − e^(−0.5) ≈ 0.39. FPR = (0.39)^5 ≈ **0.9%**. Tunable; rule of thumb is ~10 bits / element for ~1% FPR.
</details>

**P4 (Hard).** A distributed system uses 8-byte random IDs. The team estimates "we'll never have more than a billion." Critique.

<details><summary>Answer</summary>

8 bytes = 64 bits. 50% collision threshold ≈ 5 × 10⁹. **A billion is dangerously close.** Even at 10¹⁰ inserts, expected collisions are several. Use 128-bit IDs, structured IDs (Snowflake), or guarantee uniqueness via central allocator.
</details>

---

## 3.23 Information Theory Mental Math — Entropy, Bits & Compression

> Shannon's information theory underpins ML loss functions (cross-entropy), compression (Huffman), and any "how many bits do I need?" question. The key intuition: **entropy is the number of bits to encode an outcome you don't know.**

### Key Formulas

```
   SHANNON ENTROPY (in bits) of a distribution p:
      H(X) = − Σ p(x) · log₂ p(x)

   Properties:
      ▸ H(X) ≥ 0, always.
      ▸ H(X) maximised by uniform distribution: H_max = log₂ |X|.
      ▸ H(X) = 0 when X is deterministic.

   CROSS-ENTROPY (used as ML loss):
      H(p, q) = − Σ p(x) · log₂ q(x)            [or natural log; both valid]
   This is the "average bits to encode samples from p using a code optimised for q."

   KL DIVERGENCE:
      D_KL(p || q) = H(p, q) − H(p) = Σ p(x) · log [p(x) / q(x)]
   "Extra bits incurred by using the wrong distribution q."

   PERPLEXITY (popular for LLM eval):
      Perplexity = 2^H = exp(cross-entropy in nats).
      Perplexity 32 means "the model is as uncertain as if there were 32 equally
      likely choices per token."
```

### Mental Numbers (Memorise)

```
   ┌────────────────────┬──────────────────┐
   │ TASK                │  BITS / SYMBOL   │
   ├────────────────────┼──────────────────┤
   │ Coin flip (fair)    │  1 bit           │
   │ 6-sided die (fair)  │  log₂ 6 ≈ 2.58   │
   │ Roulette (1 in 38)  │  log₂ 38 ≈ 5.25  │
   │ Random ASCII char   │  log₂ 95 ≈ 6.57  │
   │ English text        │  ~1-1.5 bits/char│
   │   (highly redundant — Huffman / gzip can exploit)│
   │ Random English word │  log₂ 50000 ≈ 15.6 (50k vocab)│
   └────────────────────┴──────────────────┘

   QUICK SHANNON FOR 2-OUTCOME EVENT:
      ▸ p = 0.5:  H = 1 bit
      ▸ p = 0.9:  H ≈ 0.47 bits
      ▸ p = 0.99: H ≈ 0.08 bits
      ▸ p = 0.999: H ≈ 0.011 bits

   "Lower entropy = less surprise = easier to compress."
```

### Practice Problems

**P1 (Easy).** A loaded coin lands heads 75% of the time. What's its entropy?

<details><summary>Answer</summary>

H = −(0.75 · log₂ 0.75 + 0.25 · log₂ 0.25) = −(0.75 · −0.415 + 0.25 · −2) ≈ 0.31 + 0.5 = **0.81 bits**. (Less than the 1 bit of a fair coin — because it's more predictable.)
</details>

**P2 (Medium).** An LLM achieves a perplexity of 8 on a held-out corpus. What's the cross-entropy in bits per token?

<details><summary>Answer</summary>

log₂ 8 = **3 bits/token**. (Means the model treats each token as if it had ~8 equally likely options.)
</details>

**P3 (Medium).** English has ~1.1 bits of entropy per character. A novel of 500K characters — minimum bytes after optimal compression?

<details><summary>Answer</summary>

500K × 1.1 / 8 ≈ **69 KB**. (Real-world gzip on English achieves ~30-40 KB for this; theoretically you could get to ~70 KB.) Compare to ASCII at 500 KB — the ratio gives English's redundancy.
</details>

**P4 (Hard).** A multi-class classifier on 100 classes outputs uniform predictions (worst case). What's its cross-entropy loss?

<details><summary>Answer</summary>

H = log₂(100) ≈ **6.64 bits** (or ln(100) ≈ 4.6 nats). For comparison, a perfect classifier outputs the correct class with p=1, giving H = 0. Random guessing is the upper bound.
</details>

**P5 (Hard).** Your image classifier has 1000 classes, current cross-entropy = 3 nats. How many "effective classes" worth of uncertainty remain?

<details><summary>Answer</summary>

Perplexity = e^3 ≈ **20**. The model has narrowed the choice from 1000 down to ~20 plausible classes per image — meaningful progress, but not yet confident.
</details>

---

## 3.24 Daily Practice Plan

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

## 3.25 Common Pitfalls

1. **Mental math under pressure freezes you.** The fix: practice for speed, not just correctness. Set a 60-second timer per problem during practice.
2. **Order-of-magnitude errors are worse than precision errors.** "About 1 GB" when the real answer is 10 GB or 100 MB is fine; "about 10 GB" when it's 1 PB is a fail.
3. **Forgetting to sanity-check.** "1 trillion users" means you skipped a factor of 1000 somewhere — recompute.
4. **Confusing 10⁹ (billion) and 10¹² (trillion).** Mostly a US-English thing. Always write the exponent.
5. **Confusing 1 GB ≈ 10⁹ bytes (decimal) vs 1 GiB = 2³⁰ bytes (binary).** ~7% gap. Acceptable in Fermi.
6. **Assuming average == p99.** Tail latency dominates user experience. Always ask "p99 or average?" up front.
7. **Bayes intuition without writing it out.** Even experienced engineers blow base-rate problems if they reason verbally instead of imagining 10,000 people.
8. **Skipping units in the chain.** "1 Mbps × 1 hour = ?" Track GB / s × 3600 = GB explicitly.
9. **Treating Big-O as exact.** O(N log N) hides constants — a 50× constant difference is normal. Useful for *feasibility*, not for *which sort is faster*.
10. **Memorising AI numbers without context.** GPT-4-class costs ~$0.06/M tokens *today* (May 2026); cite the date or you'll be wrong in six months.

---

## 3.26 Decision Tree — What to Compute When

```
   Interviewer says "estimate ___"
           │
           ▼
   What kind of estimate?
           │
           ├── Storage / capacity   → §3.10 Fermi + §3.21 bits.
           │
           ├── QPS / throughput     → daily total ÷ 86,400 ≈ ÷ 10^5.
           │                          Then peak ≈ 2-3× average.
           │
           ├── Latency budget       → §3.21.1; sum p99s for serial,
           │                          max-with-buffer for parallel.
           │
           ├── Algorithm feasible?  → §3.21.2 Big-O table.
           │                          Total ops > 10^9 = not in 1 sec.
           │
           ├── Cost (LLM/GPU)       → §3.10 AI numbers; tokens × rate.
           │
           ├── Probability / risk   → Bayes if rare event + imperfect test.
           │                          Always picture 10,000 people.
           │
           └── "How many ___"       → Fermi framework (clarify, break,
                                      estimate, multiply, sanity-check).
```

---

## 3.27 Interview Questions Bank

Ten questions actually asked at Google / Meta / OpenAI / Anthropic in 2025–2026, and the answer skeletons.

**Q1. Estimate Google Search's daily query volume.**
8.5 B searches/day. Average QPS ≈ 8.5 × 10⁹ / 86,400 ≈ **~100 K QPS** average; peak 2-3× → **200-300 K QPS**. (Cite the date — searches drift up over time.)

**Q2. How many H100 GPUs would you need to serve 1 M concurrent users on a Llama-3.1-8B chatbot?**
1 H100 sustains ~50 tok/s output × ~10 concurrent (with continuous batching) = 500 tok/s aggregate. 1 M users × ~1 message every 30 s × 200 output tokens ≈ ~7 M tok/s. **~14,000 H100s** at peak. (Continuous batching + speculative decoding could halve this.)

**Q3. A 7B-param model in BF16 — will it run on a 24 GB consumer GPU?**
7 × 10⁹ × 2 bytes = **14 GB** for weights, plus ~5-10 GB KV cache at production batch size = ~20-25 GB. **Tight on a 24 GB card.** Drop to INT8 (~7 GB weights) for headroom. INT4 fits with KV cache to spare.

**Q4. p99 latency of your service is 200 ms. You're adding a new dependency at p99 = 50 ms. What's your new p99?**
If sequential: ~250 ms (sum the p99s — slightly conservative because the tails aren't perfectly correlated, but close). If parallelizable: ~200 ms unchanged.

**Q5. Your A/B test shows variant B has 5% higher CTR. Sample size 10K users per arm. Statistically significant?**
Standard error ≈ √(p(1-p)/N). With baseline CTR ~5%, SE per arm ≈ √(0.05 × 0.95 / 10K) ≈ 0.22 percentage points. Difference of arms has SE ≈ √2 × 0.22 ≈ 0.31 pp. Observed lift = 5% → 5.25%? Or is "5% higher" relative? **Always clarify**. If absolute 0.25 pp lift / SE 0.31 pp ≈ 0.8 σ → not significant. Need 4× sample size.

**Q6. A drug test is 99% accurate. 0.5% of athletes use the drug. An athlete tests positive. Probability they actually used?**
10,000 athletes: 50 users (49.5 TP); 9,950 clean (99.5 FP). P(user | positive) = 49.5 / 149 ≈ **33%**. The base-rate trap.

**Q7. What's the cost to fine-tune a 7B model with LoRA on 100K examples?**
LoRA trains <1% of params. Compute ≈ 6 × 7 × 10⁹ × 100K × 2K (avg seq len) × 0.01 ≈ ~10¹³ FLOPs. One H100 ≈ 10¹⁵ FLOPs/sec. ~10 seconds of GPU? Way too low — overlooked overhead. Reality: ~5-30 GPU-hours on H100. Cost: ~$10-60.

**Q8. Estimate global internet bandwidth to YouTube during peak hours.**
Peak users: ~1 B simultaneously. Average bitrate: ~5 Mbps (mixed mobile + 1080p). Total = 5 × 10⁹ Mbps = **5 Pbps** = 5,000 Tbps. (Real number is in this ballpark.)

**Q9. You have N = 10⁹ images. You want to find near-duplicates. Algorithm and cost?**
Pairwise O(N²) = 10¹⁸ — impossible. Use perceptual hashing + LSH. Each image gets a 64-bit hash; bucket by hash prefix. Lookup is ~O(N log N). Total: ~3 × 10¹⁰ ops, hours on one machine, minutes distributed.

**Q10. Estimate the carbon footprint of training GPT-4-class.**
Training compute ~10²⁵ FLOPs. H100 TDP ~700 W, ~3 × 10¹⁵ FLOPs/sec → ~3 × 10⁹ GPU-seconds = ~10⁶ GPU-hours. At ~0.7 kW each = ~700 GWh. At ~0.5 kg CO₂/kWh (mixed grid) ≈ **~350,000 tonnes CO₂.** (Real numbers depend heavily on grid — Anthropic and Google use mostly low-carbon grids, dropping this by 5-10×.)

---

## 3.28 FAQ

**Q: Should I memorise all the powers-of-2 table or just key ones?**
Memorise 2¹⁰ = ~1 K, 2²⁰ = ~1 M, 2³⁰ = ~1 G, 2⁴⁰ = ~1 T. Everything else, derive.

**Q: How precise should a Fermi estimate be?**
Within an order of magnitude is the gold standard. "About 100 K" when the real answer is 60 K-300 K is a perfect Fermi estimate.

**Q: I know the math but blank out under pressure. What do I do?**
Talk through your reasoning out loud. The interviewer wants your *process*, not just the number. State your assumptions explicitly: "I'm assuming 8 B people, 50% on the internet…" Even if your final number is wrong, clear assumptions earn full credit.

**Q: Calculator vs mental math in interviews?**
Mental math always wins for the *first* estimate (signals quick reasoning). If the interviewer offers a calculator for refinement, take it. Some companies (Anthropic, OpenAI) explicitly allow scratch paper but rarely calculators.

**Q: What's the single biggest thing to memorise for system design?**
Latency reference numbers (§3.21.1) and the AI/ML numbers table (§3.10). Not optional — without these you can't reason about feasibility at all.

**Q: How many problems should I do per day?**
30 minutes / 5–8 problems is the right rate. More than that, you're cramming; less, you're not building reflexes. 4 weeks of consistent practice produces a measurable speedup.

---

## 3.29 Hello-World Code

### A Fermi-estimate Python helper

```python
def fermi(label, **factors):
    """Multiply named factors, print the chain, return the result."""
    result = 1.0
    print(f"{label}:")
    for name, value in factors.items():
        print(f"  × {name:<25} = {value:>14,.2e}")
        result *= value
    print(f"  ─────────────────────────────")
    print(f"  = {result:,.2e}")
    return result

# Example: storage for a Twitter clone
fermi("Daily storage",
      DAU=2e8,
      tweets_per_user_per_day=2,
      avg_tweet_size_kb=1,
      replication=3)
# Daily storage:
#   × DAU                       =       2.00e+08
#   × tweets_per_user_per_day   =       2.00e+00
#   × avg_tweet_size_kb         =       1.00e+00
#   × replication               =       3.00e+00
#   = 1.20e+09  KB = 1.2 TB/day
```

### Big-O feasibility checker

```python
import math

def feasible(complexity, N, ops_per_sec=1e8, budget_sec=1.0):
    """Will an algorithm of this complexity finish in budget_sec?"""
    cost = {
        "1": 1, "log N": math.log2(N),
        "N": N, "N log N": N * math.log2(N),
        "N sqrt N": N * math.sqrt(N),
        "N^2": N**2, "N^3": N**3,
        "2^N": 2**min(N, 60), "N!": math.factorial(min(N, 20)),
    }[complexity]
    seconds = cost / ops_per_sec
    print(f"{complexity:<10} N={N:,} → {cost:.2e} ops, {seconds:.2e} s",
          "  ✓" if seconds < budget_sec else "  ✗")

feasible("N log N", 10**7)  # ✓
feasible("N^2",     10**5)  # ✗
```

### Latency-budget calculator

```python
def latency_budget(target_p99_ms, components):
    """Check whether a serial chain fits in the budget."""
    total = sum(components.values())
    print(f"Target p99: {target_p99_ms} ms.  Used: {total} ms.")
    for name, ms in components.items():
        share = ms / target_p99_ms * 100
        print(f"  {name:<25} {ms:>5} ms  ({share:>4.0f}%)")
    print("  PASS ✓" if total <= target_p99_ms else "  OVER BUDGET ✗")

latency_budget(200, {
    "TLS":             20,
    "API gateway":      5,
    "Service compute": 50,
    "DB lookup":       30,
    "LLM call":        80,  # ← this one will eat your budget
    "Serialize":        5,
})
```

---

## 3.30 References & Further Reading

- **Powers of 2 reference card** — Jeff Dean's "[Numbers Everyone Should Know](https://gist.github.com/jboner/2841832)" (canonical latency cheat sheet).
- **Fermi estimation** — Sanjoy Mahajan, *The Art of Insight in Science and Engineering* (free MIT Press download).
- **Bayes & base rates** — Daniel Kahneman, *Thinking, Fast and Slow*, chs. 13–18.
- **Big-O & competitive complexity** — Skiena, *The Algorithm Design Manual* (App. A — Big-O reference).
- **System-design estimation** — Alex Xu, *System Design Interview Vol. 1*, ch. 2 (back-of-envelope).
- **Modern LLM pricing & specs** — Artificial Analysis ([https://artificialanalysis.ai](https://artificialanalysis.ai)) — live leaderboard of model price, latency, context.
- **TPU / GPU specs** — Google Cloud TPU docs, NVIDIA H100/B200 datasheets.
- **AI training compute scaling laws** — Hoffmann et al. (2022), "Training Compute-Optimal Large Language Models" (Chinchilla paper).

---

## 3.31 Key Takeaways — One-Page Cheat Sheet

```
   ┌────────────────────────────────────────────────────────────┐
   │  APTITUDE & MENTAL MATH — 1-PAGE CARD                       │
   ├────────────────────────────────────────────────────────────┤
   │                                                              │
   │  POWERS OF 2:                                                │
   │  2^10 ≈ 1 K   2^20 ≈ 1 M   2^30 ≈ 1 G   2^40 ≈ 1 T          │
   │                                                              │
   │  TIME:                                                       │
   │  1 day = 86,400 s ≈ 10^5     1 year ≈ 3 × 10^7 s            │
   │  Rule of 72: doubling time = 72 / rate%                      │
   │                                                              │
   │  AI / ML (May 2026):                                         │
   │  1 BF16 param  = 2 B    1 INT4 param = 0.5 B                 │
   │  H100 / TPU v7 HBM = 80 / 192 GB                             │
   │  GPT-4 quality cost ≈ $0.06 / M tokens (was $20 in 2022)     │
   │  Llama 4 Scout context: 10 M tokens                          │
   │                                                              │
   │  LATENCY:                                                    │
   │  L1 / L2 cache: 1 / 3 ns    Main mem: 100 ns                 │
   │  SSD: 0.15 ms    HDD seek: 10 ms                             │
   │  Same-DC RTT: 0.5 ms    Coast-to-coast: 40 ms                │
   │  Web SLO: ~200 ms p99    Autocomplete: ~100 ms               │
   │                                                              │
   │  BIG-O FEASIBILITY (1 sec, single core, 10^8 ops/s):         │
   │  N: 10^8    N log N: 10^7    N^2: 10^4    2^N: 25            │
   │                                                              │
   │  BAYES SHORTCUT (always):                                    │
   │  Imagine 10,000 people. TP / (TP + FP). Don't reason verbally.│
   │                                                              │
   │  FERMI FRAMEWORK:                                            │
   │  1. Clarify  2. Break  3. Estimate  4. Multiply  5. Sanity   │
   │                                                              │
   │  BAND OF ACCEPTABLE ANSWER:                                  │
   │  Within 1 order of magnitude = correct.                      │
   │  Stated assumptions = full credit even if number is off.     │
   └────────────────────────────────────────────────────────────┘
```

---

**Previous:** [Chapter 02 — Staying Relevant in AI Era](02_staying_relevant_ai_era.md) &middot; **Next:** [Chapter 04 — Brain Training](04_brain_training.md) &middot; **See also:** [Ch 31 Top 10 ML Topics](31_google_top10_ml_interview.md) &middot; [Ch 32 Cheat Sheet](32_quick_reference_cheat_sheet.md)
