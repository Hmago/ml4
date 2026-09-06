# Chapter 38b — Modern Java: Language, Concurrency & Ecosystem

> "Java didn't stand still. Two LTS releases landed while you were away, and between them they changed how you model data and how you handle concurrency."

---

## What You'll Learn

After this chapter you will be able to:
- Write `var`, text blocks and switch expressions without looking them up
- Replace a 40-line data class with a one-line **record**, and know when not to
- Model a closed set of types with **sealed** interfaces and switch over them exhaustively
- Destructure nested records in a `switch`, with `when` guards
- Use sequenced collections, and `Optional` the way it was intended
- Explain **virtual threads** — what they fix, when they don't help, and what "pinning" means
- Name what changed between Spring Boot 2 and Boot 3, and why `jakarta.*` broke everyone's build
- Read a modern `pom.xml` / `build.gradle.kts`, write JUnit 5 tests, and reason about G1 vs ZGC

**Markers:** ★★★ = know cold for interviews · ★★ = high priority · ★ = good to know.
**Quick check** boxes are retrieval practice — attempt before revealing.
**Interview** boxes give the question, what to say, and the follow-up trap.

> **This is the "catch me up" half.** Its companion, [Ch 38 — Java Refresher: Core & DSA Toolkit](#content/38_java_refresher), reloads the fundamentals you need for algorithm work — arrays, strings, collections, comparators and the traps. If your immediate goal is a coding interview, read that one and [Ch 31](#content/31_dsa_coding) first; this chapter is what you need to be *employable on a 2026 codebase*.

> ⚠️ **On running the code.** The in-app runner compiles against **JDK 22**, so records, sealed types, pattern matching and sequenced collections all execute normally. Two categories do not: anything that starts a **thread** (the sandbox forbids OS threads) and anything still in **preview** at Java 22 — scoped values, which finalised in Java 25, and structured concurrency, which is *still* in preview as of Java 25 (JEP 505, fifth preview). Those blocks are marked read-only, with their behaviour described inline.

---

## 38b.1 Syntax You Missed — `var`, Text Blocks, Switch Expressions ★★

Three small features landed between Java 10 and Java 14, and together they change the *texture* of everyday Java more than any single big feature. None of them is conceptually hard. All three are things a 2026 reviewer will silently expect, and their absence is the fastest way to make code look like it was written in 2019.

| Feature | Arrived in | What it replaces |
|---|---|---|
| `var` | Java 10 (2018) | `Map<String, List<Order>> x = new HashMap<>();` |
| Text blocks | Java 15 (2020) | `"\"line\\n\" +` string concatenation soup |
| Switch expressions | Java 14 (2020) | `switch` statement + `break` + a mutable local |
| `yield` | Java 14 (2020) | assigning to a temp inside a `switch` arm |

---

### `var` — local type inference

#### Simple Explanation

`var` is not dynamic typing and it is not JavaScript's `var`. The variable still has one fixed type forever; you are just declining to write it out because the compiler can already read it off the right-hand side.

Think of it as the same deal you already accepted with the diamond operator in Java 7. When you wrote `new HashMap<>()` you let the compiler fill in the type arguments. `var` extends that from the right of the `=` to the left of it.

> **`var`** is local variable type inference: the compiler infers the static type of a local variable from its initialiser, and the variable is as strongly typed as if you had written the type by hand.

```java
// 2022 — how you'd have written it
Map<String, List<Order>> ordersByCustomer = new HashMap<String, List<Order>>();
BufferedReader reader = new BufferedReader(new FileReader(path));
for (Map.Entry<String, List<Order>> e : ordersByCustomer.entrySet()) { }

// 2026 — how you'd write it now
var ordersByCustomer = new HashMap<String, List<Order>>();
var reader = new BufferedReader(new FileReader(path));
for (var e : ordersByCustomer.entrySet()) { }
```

**Where it is not allowed.** `var` needs an initialiser it can read a type from, and it only works for locals. These are all compile errors:

```
var field = 1;          // fields — no
void f(var x) { }       // parameters — no
var x;                  // no initialiser — no
var x = null;           // null has no useful type — no
var f = () -> "hi";     // bare lambda — no target type
var a = { 1, 2, 3 };    // array initialiser shorthand — no
```

Real output from JDK 22 for the first two of those:

```
<source>:3: error: 'var' is not allowed here
    var field = 1;                       // no fields
    ^
<source>:5: error: 'var' is not allowed here
    static void take(var x) { }          // no parameters
                     ^
2 errors
```

**The style rule that actually matters:** use `var` when the right-hand side already names the type, and write the type out when it doesn't. `var users = new ArrayList<User>()` is obvious. `var result = process(input)` is not — the reader now has to go find `process`. That is the whole guideline.

---

### Text blocks — the end of escaped string soup

#### Simple Explanation

A text block is a string literal delimited by `"""` that may span lines. Inside it, newlines are newlines and quotes are just quotes. It exists because embedding JSON, SQL, HTML or XML in Java used to require escaping every `"` and hand-concatenating every line, which meant the literal in your source looked nothing like the text it produced.

The one subtle part is **incidental whitespace**. Java looks at every non-blank line *and* the closing `"""`, finds the smallest common indentation, and strips exactly that much from every line. So you can indent the block to match the surrounding code and it costs you nothing in the output.

> A **text block** is a multi-line string literal that avoids most escape sequences and automatically strips incidental leading whitespace.

```java
// 2022 — how you'd have written it
String json = "{\n"
            + "  \"user\": \"ada\",\n"
            + "  \"roles\": [\"admin\", \"dev\"],\n"
            + "  \"active\": true\n"
            + "}";

// 2026 — how you'd write it now
String json = """
        {
          "user": "ada",
          "roles": ["admin", "dev"],
          "active": true
        }""";
```

Two details worth knowing. Putting the closing `"""` on the same line as the last character (as above) means **no trailing newline**; putting it on its own line adds one. And a trailing `\` suppresses the line break, which is how you write one long line legibly:

```java
String sql = """
        SELECT id, name FROM users \
        WHERE active = true \
        ORDER BY name""";
```

Verified output (`C_syntax.java`, JDK 22):

```
{
  "user": "ada",
  "roles": ["admin", "dev"],
  "active": true
}
starts with brace? true
line count = 5
SELECT id, name FROM users WHERE active = true ORDER BY name
```

The `\` version really is a single line — the indentation was stripped, then the continuations joined.

---

### Switch expressions — `switch` that returns a value

#### Simple Explanation

The old `switch` was a *statement*: it did something, and you collected the result in a mutable variable you declared beforehand. Forget a `break` and control fell into the next case, silently. Forget a case entirely and your variable kept whatever it had.

The new arrow form is an *expression*: it evaluates to a value, so you assign or `return` it directly. There is no fall-through, the variable no longer needs to be mutable, and when you switch over an `enum` the compiler checks you covered every constant.

> A **switch expression** produces a value; each arm uses `->`, there is no fall-through, and it must be exhaustive over its input type.

```java
// 2022 — how you'd have written it
static int retryDelay2022(Status s) {
    int delay;
    switch (s) {
        case NEW:
        case ACTIVE:
            delay = 0;
            break;
        case SUSPENDED:
            delay = 30;
            break;
        case CLOSED:
            delay = -1;
            break;
        default:
            throw new IllegalStateException("unknown: " + s);
    }
    return delay;
}

// 2026 — how you'd write it now
static int retryDelay2026(Status s) {
    return switch (s) {
        case NEW, ACTIVE -> 0;
        case SUSPENDED   -> 30;
        case CLOSED      -> -1;
    };
}
```

Fourteen lines become five, the `default` disappears because the compiler can see all four enum constants are covered, and — the real prize — if someone adds a `PENDING` constant to `Status`, the 2026 version stops compiling while the 2022 version quietly starts throwing at runtime.

When an arm needs more than one expression, use a block and `yield` to hand back the value:

```java
static String httpBucket(int code) {
    return switch (code) {
        case 200, 201, 204 -> "ok";
        case 404 -> "missing";
        default -> {
            var side = code >= 500 ? "server" : "client";
            yield side + " error " + code;
        }
    };
}
```

Verified output:

```
NEW -> 0 / 0
ACTIVE -> 0 / 0
SUSPENDED -> 30 / 30
CLOSED -> -1 / -1
ok
missing
server error 503
```

> **Interview —** *"What's the practical difference between a switch statement and a switch expression?"*
> **Say:** An expression yields a value and must be exhaustive, so the compiler enforces that every input is handled; a statement doesn't, so a missing case is a silent runtime bug. Arrow arms also remove fall-through, which removes the classic missing-`break` defect class. Then add the real motivation: exhaustiveness is what makes pattern matching over sealed types safe, so switch expressions are the foundation the Java 21 features are built on.
> **They follow up with:** *"Does `default` help or hurt?"* — On a closed enum or a sealed hierarchy it hurts. A `default` makes the switch trivially exhaustive, so adding a new case compiles cleanly and silently falls into `default` instead of failing the build. Omit it and let the compiler find every switch you need to update.

<details>
<summary><strong>Quick check.</strong> `var x = switch (n) { case 1 -> "one"; default -> 2; };` — what type is `x`, and does it compile?</summary>

It compiles, and `x` is inferred as the least upper bound of `String` and `Integer` — which is roughly `Comparable<?> & Serializable`. That type is nearly useless: you can't call `length()` or do arithmetic on it. It's a good illustration of why `var` plus a heterogeneous expression is a bad combination — the compiler will happily infer a type nobody wanted. Give mixed-type expressions an explicit type, or don't mix types.
</details>

---

## 38b.2 Records — The Biggest Day-to-Day Change ★★★

#### Simple Explanation

A record is a class whose entire job is to hold a few values, where you declare the values and the compiler writes everything else.

You have written this class hundreds of times: some final fields, a constructor that assigns them, a getter each, then `equals`, `hashCode` and `toString` that your IDE generated and nobody has read since. It is forty lines of code carrying about eight characters of actual information — the field names and their types. Worse, it is forty lines that can *rot*: add a field, forget to update `equals`, and you have a bug that only shows up when the object goes into a `HashSet`.

A record says: here are the components, that is the whole state, generate the rest. Lombok existed to paper over this; records make Lombok's `@Value` redundant, and they do it in the language rather than with annotation processing.

> A **record** is a transparent, shallowly immutable carrier for a fixed set of components; the compiler derives the canonical constructor, an accessor per component, and `equals`, `hashCode` and `toString` from the component list.

### The before/after that sells it

```java
// 2022 — how you'd have written it
final class Point {
    private final int x;
    private final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int getX() { return x; }
    public int getY() { return y; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Point other = (Point) o;
        return x == other.x && y == other.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }

    @Override
    public String toString() {
        return "Point[x=" + x + ", y=" + y + "]";
    }
}
```

```java
// 2026 — how you'd write it now
record Point(int x, int y) { }
```

Both files were run. The 2022 version prints:

```
Point[x=3, y=4]
a.equals(b) = true
same hash   = true
set size    = 1
```

The record prints the same thing, plus a `HashMap` lookup by an equal-but-different instance:

```
Point[x=3, y=4]
a.x()       = 3
a.equals(b) = true
same hash   = true
set size    = 1
lookup by b = origin-ish
```

Note the `toString` format matched exactly — because the hand-written one was copying what records already produce.

### What the compiler generates

| You write `record Point(int x, int y)` | Compiler emits |
|---|---|
| the header | `private final int x; private final int y;` |
| the header | canonical constructor `Point(int x, int y)` |
| the header | accessors `x()` and `y()` — **not** `getX()` |
| the header | `equals` comparing all components |
| the header | `hashCode` derived from all components |
| the header | `toString` as `Point[x=3, y=4]` |
| the header | `final class` extending `java.lang.Record` |

The accessor naming is the one thing that trips people up in review: a record has `x()`, not `getX()`. Frameworks caught up years ago — Jackson, JPA-adjacent mappers and Spring all read record components fine now.

There is a mental shift buried in that table, and it is worth naming. In 2022 a data class was a *class you happened to use as data*: it had encapsulation, it could grow behaviour, and its identity semantics were whatever you last generated. A record is a declaration that this type **is** its components — nothing hidden, nothing derived, equality by value. The compiler will hold you to that, which is precisely why it can generate the rest safely. If you were using Lombok's `@Value` or `@Data` to fake this, records replace it with a language feature that needs no annotation processor, no IDE plugin, and no build-order surprises.

One more consequence: because a record's state is fully described by its component list, the compiler can also take one *apart* again. That is what makes record patterns in §38b.3 possible. Records and pattern matching were designed as one feature and shipped in two halves — the destructuring only works because the construction is transparent.

### Compact constructors — validation without repetition

You rarely want to rewrite the whole canonical constructor. The **compact form** omits the parameter list and the assignments; you only write the checks and any normalisation, and the compiler appends `this.x = x;` for each component at the end.

```java
record Money(String currency, long cents) implements Priced {

    Money {                                  // compact constructor
        Objects.requireNonNull(currency, "currency");
        if (cents < 0) throw new IllegalArgumentException("negative: " + cents);
        currency = currency.toUpperCase();   // reassign the PARAMETER
    }

    static Money usd(long cents) { return new Money("usd", cents); }

    Money plus(Money other) {
        if (!currency.equals(other.currency))
            throw new IllegalArgumentException("mixed currency");
        return new Money(currency, cents + other.cents);
    }
}
```

Note `currency = currency.toUpperCase()` assigns to the *parameter*, not the field — that is how normalisation works in a compact constructor. Records can implement interfaces, declare static factories, and add any instance methods you like.

Verified output:

```
Money[currency=USD, cents=1999] -> $19.99
$20.00
rejected: negative: -5
```

The lowercase `"usd"` came out as `USD`, and the negative amount was rejected before the object existed.

### What records cannot do

| Restriction | Why | Workaround |
|---|---|---|
| Cannot extend a class | Records are implicitly `final` and already extend `Record` | Implement an interface instead |
| Cannot be subclassed | Same reason — identity by value, not by type | Use a **sealed interface** over several records (§38b.3) |
| No extra instance fields | The component list *is* the state — that's what makes `equals` trustworthy | Compute it in a method, or add a `static` field |
| Immutability is **shallow** | A `final List` reference can still point at a mutable list | Defensive copy in the compact constructor |

That last one is the trap worth demonstrating. `record Order(String id, List<String> items)` gives you a final *reference*, not an immutable list:

```java
// leaks: caller keeps a handle on the list you stored
record LeakyOrder(String id, List<String> items) { }

// safe: List.copyOf in the compact constructor
record Order(String id, List<String> items) {
    Order {
        items = List.copyOf(items);
    }
}
```

Verified output after the caller mutates the original list:

```
leaky = LeakyOrder[id=A1, items=[pen, SMUGGLED]]
safe  = Order[id=A2, items=[pen]]
```

`List.copyOf` both copies and returns an unmodifiable list, so it closes the hole from both directions. Do the same with `Set.copyOf`, `Map.copyOf`, or `array.clone()`.

### Where records earn their keep

- **DTOs and API payloads.** Request and response bodies are exactly "a fixed set of values." This is the single most common use.
- **Map and set keys.** You get a correct `equals`/`hashCode` pair for free — which quietly removes one of the top sources of "the value I just put in isn't there" bugs. A `record Cell(int row, int col)` as a `HashMap` key is a genuinely useful trick even in algorithm work.
- **Multiple return values.** No more out-parameters, `int[]` of length two, or a generic `Pair` class:

```java
record MinMax(int min, int max) { }

static MinMax scan(int[] xs) {
    int lo = xs[0], hi = xs[0];
    for (int v : xs) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
    return new MinMax(lo, hi);
}
```

- **Local records.** A record can be declared *inside a method*, scoped to that method alone. This is perfect for a temporary shape you need for one sort or one grouping and don't want polluting the package:

```java
record Entry(String word, int count) { }   // declared inside main()
```

Verified output from both:

```
MinMax[min=-3, max=12]
[Entry[word=b, count=3], Entry[word=a, count=2],
Entry[word=c, count=1]]
```

> **Interview —** *"When would you NOT use a record?"*
> **Say:** Four cases. When the type has identity rather than value — a JPA `@Entity` with a lifecycle and a generated id is the classic one, and it also needs a no-arg constructor and mutable fields. When you need mutability, such as a builder or an accumulator. When the state isn't fully captured by the components — records give you no place to hide a lazily computed cache or a derived field. And when you need inheritance, since records are implicitly final. Then add the honest caveat: a record publishes its whole state through accessors, so if the fields are an implementation detail you intend to change, a normal class keeps that freedom.
> **They follow up with:** *"Is a record immutable?"* — Shallowly. The component fields are final, but a `List` or array component is still mutable through the reference you were handed and the one you hand back. `List.copyOf` in the compact constructor is the fix, and it's a real review comment, not a theoretical one.

<details>
<summary><strong>Quick check.</strong> Why does <code>record Point(int x, int y)</code> work correctly as a <code>HashMap</code> key when the equivalent hand-written class so often doesn't?</summary>

Because `equals` and `hashCode` are derived from the component list by the compiler, so they cannot drift out of sync with the fields. In a hand-written class the usual failure is adding a field and updating `equals` but not `hashCode` (or neither) — the object then lands in a different bucket from its equal twin and `get` returns `null` for a key you just inserted. A record makes that bug unrepresentable, because there is no way to add state the generated methods don't see.
</details>

---

## 38b.3 Sealed Types and Pattern Matching ★★★

#### Simple Explanation

This is the section that matters most, and it is really one idea wearing three hats.

Records let you say "this data is exactly these values." Sealed types let you say "this thing is exactly one of these cases." Pattern matching lets you take such a value apart and branch on which case it is — and because the compiler knows the case list is closed, it can *prove* you handled all of them.

The analogy: a normal `interface` is an open invitation — anyone anywhere can implement it, so the compiler can never tell you what the possibilities are. A `sealed` interface is a guest list. Once the compiler has the guest list, `switch` stops being a lookup table and becomes a total function over the possibilities, checked at compile time.

If you've used Kotlin's sealed classes, Rust's `enum`, TypeScript's discriminated unions, or Scala's case classes, this is the same idea. Java calls the combination *algebraic data types*, and it is the largest conceptual addition to the language since generics.

> A **sealed** type restricts which classes may extend or implement it; **pattern matching** tests a value's shape, binds its parts to variables, and — over a sealed hierarchy — lets the compiler verify a `switch` is exhaustive.

Build it in five steps.

### 1. `instanceof` patterns (Java 16) — the cast disappears

Every `instanceof` you ever wrote was followed by a cast to the type you just tested. The compiler always knew the cast was safe; it just had no syntax to say so. Now it does.

```java
// 2022 — how you'd have written it
if (o instanceof String) {
    String s = (String) o;
    if (s.length() > 2) return "long string: " + s.toUpperCase();
    return "short string: " + s;
} else if (o instanceof Integer) {
    Integer i = (Integer) o;
    return "int doubled: " + (i * 2);
}

// 2026 — how you'd write it now
if (o instanceof String s && s.length() > 2)
    return "long string: " + s.toUpperCase();
if (o instanceof String s)
    return "short string: " + s;
if (o instanceof Integer i)
    return "int doubled: " + (i * 2);
```

The binding `s` is in scope wherever the compiler can prove the test passed — including after a negated early return, which is the idiom that makes guard clauses read well:

```java
static boolean sameText(Object a, Object b) {
    if (!(a instanceof String s)) return false;   // negation flips scope
    return b instanceof String t && s.equalsIgnoreCase(t);
}
```

Both versions were run side by side and produce identical results:

```
short string: hi  ||  short string: hi
long string: HELLO  ||  long string: HELLO
int doubled: 42  ||  int doubled: 42
array of 3  ||  array of 3
unknown  ||  unknown
```

### 2. Sealed types (Java 17) — you own the hierarchy

```java
sealed interface Shape permits Circle, Square, Triangle { }

record Circle(double radius) implements Shape { }
record Square(double side) implements Shape { }
record Triangle(double base, double height) implements Shape { }
```

```
        sealed interface Shape
      permits Circle, Square, Triangle
                    |
      +-------------+-------------+
      |             |             |
   Circle        Square       Triangle
  (radius)       (side)     (base,height)

  The compiler knows this list is COMPLETE.
  A switch covering all three needs no default -
  and adding a fourth breaks the build, on purpose.
```

The rules, briefly. Every permitted subtype must be in the same module (or same package for unnamed modules), and each one must itself declare whether it is `final`, `sealed`, or `non-sealed` — `non-sealed` deliberately re-opens that branch. Records are implicitly `final`, so a sealed interface over records needs no extra keywords, which is why the two features are almost always used together. If the subtypes are in the same file, you can omit `permits` entirely and the compiler infers it.

`non-sealed` is the escape hatch, and it is more useful than it first looks. You can seal the top of a hierarchy — so the *categories* are fixed — while leaving one category open for extension. A `sealed interface Response permits Ok, Redirect, Error` where `Error` is `non-sealed` says "there are exactly three kinds of response, and errors are extensible." Switches still get exhaustiveness over the three categories.

The other thing a sealed type buys you is documentation that cannot go stale. `permits Circle, Square, Triangle` is the complete list of what this abstraction can be, written in the one place a reader is guaranteed to look, and enforced by the compiler rather than by a comment.

### 3. Pattern matching for `switch` (Java 21) — and exhaustiveness

```java
// 2022 — how you'd have written it
static double area2022(Shape s) {
    if (s instanceof Circle) {
        return Math.PI * ((Circle) s).radius() * ((Circle) s).radius();
    } else if (s instanceof Square) {
        double side = ((Square) s).side();
        return side * side;
    } else if (s instanceof Triangle) {
        Triangle t = (Triangle) s;
        return 0.5 * t.base() * t.height();
    }
    throw new IllegalStateException("unknown shape: " + s);
}

// 2026 — how you'd write it now. No default: the compiler proves
// the switch covers every permitted subtype.
static double area2026(Shape s) {
    return switch (s) {
        case Circle c   -> Math.PI * c.radius() * c.radius();
        case Square q   -> q.side() * q.side();
        case Triangle t -> 0.5 * t.base() * t.height();
    };
}
```

That final `throw` in the 2022 version is the tell. It exists because the author could not prove the chain was complete, so they left a runtime trapdoor for a case they hoped would never happen. The 2026 version doesn't need one — and *cannot* have one, because there is no fourth possibility.

**Here is the property worth the entire feature.** Add `Pentagon` to `permits` and leave the switch alone. It doesn't compile:

```
<source>:13: error: the switch expression does not cover
all possible input values
        return switch (s) {
               ^
1 error
```

That is a real JDK 22 error from `C_exhaustive_fail.java`. Extending the model turns every incomplete switch in the codebase into a compile error with a file and line number. In the 2022 version, the same change compiles cleanly and throws in production the first time a pentagon shows up. Exhaustiveness converts a class of runtime bug into a build failure — which is the same trade generics made in Java 5, applied to control flow instead of containers.

There is one runtime backstop worth knowing about. Exhaustiveness is checked when the switch is compiled, so if the sealed interface is later recompiled with a new subtype and the switch is *not* recompiled against it, the guarantee has a hole. Java 21 closed it with `java.lang.MatchException`: a pattern switch that finds no matching case at runtime throws rather than silently returning garbage. You should never see one in a normally built project — it means your compiled artefacts are out of step — but it explains why the compiler is comfortable letting you omit `default`.

### 4. Record patterns (Java 21) — destructuring

A type pattern binds the whole object. A **record pattern** takes it apart and binds the components, and it nests:

```java
record Point(int x, int y) { }

sealed interface Figure permits Line, Dot, Poly { }
record Line(Point from, Point to) implements Figure { }
record Dot(Point at) implements Figure { }
record Poly(List<Point> vertices) implements Figure { }

static String describe(Figure f) {
    return switch (f) {
        case Line(Point(var x1, var y1), Point p2)
                when x1 == p2.x() -> "vertical line at x=" + x1;
        case Line(Point(var x1, var y1), Point(var x2, var y2))
                -> "line (" + x1 + "," + y1 + ")->(" + x2 + "," + y2 + ")";
        case Dot(Point(var x, var y)) -> "dot at " + x + "," + y;
        case Poly(List<Point> vs)     -> "poly with " + vs.size();
    };
}
```

`Line(Point(var x1, var y1), Point p2)` reaches two levels down in one pattern, and you can mix depths freely — destructure the first component, keep the second whole. `var` inside a pattern is idiomatic and carries no ambiguity, because the record already declares the component type.

### 5. `when` guards and `case null`

A guard adds a boolean test to a pattern. Cases are tried in order, so the specific ones go first:

```java
static String band(Object o) {
    return switch (o) {
        case null                      -> "nothing at all";
        case Integer i when i > 100    -> "big int " + i;
        case Integer i when i > 10     -> "medium int " + i;
        case Integer i                 -> "small int " + i;
        case String s when s.isBlank() -> "blank string";
        case String s                  -> "string of " + s.length();
        default                        -> "other: "
                                          + o.getClass().getSimpleName();
    };
}
```

The compiler enforces the ordering: put `case Integer i` before `case Integer i when i > 100` and it rejects the second as unreachable — a dominance check you get for free.

**Null.** The old `switch` threw `NullPointerException` on a null selector, always. A pattern switch keeps that default *unless* you write `case null`, which lets you fold the null branch into the same construct instead of guarding around it. Verified output:

```
vertical line at x=2
line (0,0)->(3,4)
dot at 7,7
poly with 3
nothing at all
big int 500
medium int 42
small int 3
blank string
string of 5
other: Double
strict(null) threw NullPointerException
```

The last line is a switch with no `case null` — the NPE is still there when you don't ask for null handling.

### Putting it together: an expression evaluator

Sealed interface, records for the cases, pattern switch for every operation. This is the canonical shape of the whole feature set:

```java
sealed interface Expr permits Num, Neg, Add, Mul, Div { }
record Num(double value)             implements Expr { }
record Neg(Expr operand)             implements Expr { }
record Add(Expr left, Expr right)    implements Expr { }
record Mul(Expr left, Expr right)    implements Expr { }
record Div(Expr left, Expr right)    implements Expr { }

static double eval(Expr e) {
    return switch (e) {
        case Num(double v)       -> v;
        case Neg(Expr inner)     -> -eval(inner);
        case Add(Expr l, Expr r) -> eval(l) + eval(r);
        case Mul(Expr l, Expr r) -> eval(l) * eval(r);
        case Div(Expr l, Expr r) -> {
            double d = eval(r);
            if (d == 0) throw new ArithmeticException("divide by zero");
            yield eval(l) / d;
        }
    };
}
```

Constant folding is where destructuring really pays, because you match on the *shape* of the tree rather than interrogating it:

```java
static Expr simplify(Expr e) {
    return switch (e) {
        case Add(Num(double a), Num(double b)) -> new Num(a + b);
        case Mul(Num(double a), Num(double b)) -> new Num(a * b);
        case Mul(Num(double a), Expr r) when a == 0 -> new Num(0);
        case Mul(Num(double a), Expr r) when a == 1 -> simplify(r);
        case Add(Expr l, Expr r) -> new Add(simplify(l), simplify(r));
        case Mul(Expr l, Expr r) -> new Mul(simplify(l), simplify(r));
        case Neg(Expr inner)     -> new Neg(simplify(inner));
        case Div(Expr l, Expr r) -> new Div(simplify(l), simplify(r));
        case Num n               -> n;
    };
}
```

Verified output for `(2 + 3) * -(10 / 4)`, a constant fold, and the divide-by-zero guard:

```
((2 + 3) * -(10 / 4)) = -12.5
simplified: 5
visitor result: 10.0
caught: divide by zero
```

### This replaces the Visitor pattern

That third line is the point. The same expression was also evaluated through a hand-written Visitor — the `ExprV` / `Visitor<R>` / `accept` machinery taught in [Ch 21](#content/21_design_fundamentals). It took roughly 30 lines of interface plumbing plus a `visitXxx` method per node type, and every new node type meant editing the visitor interface and every implementation of it.

Visitor exists to solve exactly one problem: adding a new *operation* over a fixed set of types, in a language that can't switch over types. Java can now switch over types. So the double-dispatch ceremony collapses into a `switch`, and you get the same compile-time completeness guarantee that made Visitor worth the ceremony in the first place.

The trade-off is the classic **expression problem**, and it is worth being able to state it:

| | Adding a new *type* | Adding a new *operation* |
|---|---|---|
| Visitor / sealed switch | edit every operation | just write a new method |
| Polymorphic methods on the interface | just write a new class | edit every class |

Sealed types plus pattern matching pick the first column, and the compiler tells you exactly which switches to edit. Ordinary polymorphism picks the second. Choose by which axis your model actually changes: a closed domain model with many operations wants sealed types; an open plugin-style hierarchy still wants interface methods.

> **Interview —** *"Why does exhaustiveness matter? Couldn't you just add a `default` that throws?"*
> **Say:** A `default` moves the failure from compile time to run time, and worse, it makes the switch *look* complete to the compiler, so adding a subtype produces no warning anywhere. With a sealed hierarchy and no `default`, adding a case turns every switch that needs updating into a build error with a line number — the compiler becomes the checklist. That's the same guarantee Rust's `match` and Kotlin's exhaustive `when` give you, and it's the reason sealed types and pattern matching shipped together rather than separately.
> **They follow up with:** *"What if the hierarchy has to stay open?"* — Then don't seal it; use `non-sealed` on the branch that must be extensible, or keep polymorphic methods on the interface. Sealing is a modelling decision about whether the set of cases is closed, not a default to apply everywhere.

<details>
<summary><strong>Quick check.</strong> You have <code>sealed interface Shape permits Circle, Square</code> and an exhaustive switch with no <code>default</code>. A colleague adds <code>Triangle</code>. What happens, and what would have happened in Java 11?</summary>

The build breaks with "the switch expression does not cover all possible input values", pointing at every switch that needs a new arm. You fix them, and you are done — the compiler enumerated the work for you.

In Java 11 the equivalent `if / else if` chain would compile without complaint. The new triangle would fall through to whatever the final `else` did: return a wrong default, or throw an `IllegalStateException` in production. The bug ships, and you find it from a stack trace instead of from a build log.
</details>

---

## 38b.4 Sequenced Collections and `Optional` Done Right ★★

#### Simple Explanation

Two long-standing rough edges, one closed by the language and one closed only by discipline.

The first: Java's collections have always had a notion of order, but no shared vocabulary for it. `List` had `get(0)`; `Deque` had `getFirst()`; `LinkedHashSet` had neither and made you copy the whole set or iterate it to reach an end. Java 21 finally added the interfaces that should have existed in 1998.

The second: `Optional` has been around since Java 8, but the habits around it are still wrong more often than right — usually because people treat it as a null-safe *container* rather than as a return-type contract that says "this lookup may find nothing."

> **Sequenced collections** (Java 21) add `SequencedCollection`, `SequencedSet` and `SequencedMap`, giving every ordered collection a uniform first/last/reverse API.

### Sequenced collections

| Interface | Implemented by | Key methods |
|---|---|---|
| `SequencedCollection` | `List`, `Deque`, `LinkedHashSet`, `SortedSet` | `getFirst`, `getLast`, `addFirst`, `addLast`, `removeFirst`, `removeLast`, `reversed` |
| `SequencedSet` | `LinkedHashSet`, `SortedSet` | same, plus `reversed()` returns a `SequencedSet` |
| `SequencedMap` | `LinkedHashMap`, `SortedMap` | `firstEntry`, `lastEntry`, `putFirst`, `putLast`, `sequencedKeySet`, `reversed` |

```java
// 2022 — how you'd have written it
String last = list.get(list.size() - 1);
List<String> rev = new ArrayList<>(list);
Collections.reverse(rev);                       // copy, then mutate
String setFirst = new ArrayList<>(set).get(0);  // full copy just to peek
String setLast = null;
for (String s : set) setLast = s;               // full scan just to peek

// 2026 — how you'd write it now
String last = list.getLast();
List<String> rev = list.reversed();
String setFirst = set.getFirst();
String setLast = set.getLast();
```

The `set` operations went from $O(n)$ with an allocation to $O(1)$ with none. Verified output:

```
[zero, a, b, c, d, end] reversed=[end, d, c, b, a, zero]
x z [z, y, x]
{zero=0, one=1, two=2}
zero=0 / two=2 / {two=2, one=1, zero=0}
view after backing.add(4) = [4, 3, 2, 1]
```

That last line matters: `reversed()` returns a **live view**, not a copy. Adding `4` to the backing list made it appear at the front of the reversed view. Cheap, but aliasing — copy it if you need a snapshot.

### `Optional`, done right

The rules are short and they are the ones that come up in review:

| Do | Don't |
|---|---|
| Return `Optional` from a lookup that may find nothing | Take `Optional` as a **parameter** — overload or accept null instead |
| Chain with `map`, `flatMap`, `filter` | Store `Optional` in a **field** — it isn't `Serializable` and adds a wrapper per instance |
| End with `orElse`, `orElseGet`, `orElseThrow`, `ifPresentOrElse` | Call `get()` without `isPresent()` — it's just an NPE with extra steps |
| Use it for a single missing value | Return `Optional<List<T>>` — return an empty list |

```java
// 2022 — how you'd have written it
User u = DB.get("u1");
String domain = "unknown";
if (u != null && u.email() != null) {
    int at = u.email().indexOf('@');
    if (at >= 0) domain = u.email().substring(at + 1);
}

// 2026 — how you'd write it now
String domain = findUser("u1")
        .map(User::email)
        .filter(e -> e.contains("@"))
        .map(e -> e.substring(e.indexOf('@') + 1))
        .orElse("unknown");
```

**`orElse` vs `orElseGet` is the one people get wrong.** `orElse` takes a *value*, so its argument is evaluated eagerly — every time, even when the `Optional` is present. `orElseGet` takes a *supplier*, invoked only when empty. With a constant it doesn't matter; with a database call or an object allocation it very much does. Proof, with a default that announces itself:

```
orElse on a present value:
   [expensiveDefault() ran]
orElseGet on a present value:
orElseGet on an empty value:
   [expensiveDefault() ran]
a=ada@example.com b=ada@example.com c=fallback@example.com
```

`orElse` ran the expensive default even though the value was present and the result was thrown away. Rule of thumb: if the default is a literal or an already-computed constant, use `orElse`; if it is a call, use `orElseGet`.

> **Interview —** *"Why shouldn't a method take an `Optional` parameter?"*
> **Say:** Because it doesn't remove a case, it adds one — the caller can now pass a present value, an empty one, or `null` itself, so you've turned two states into three and still have to null-check. `Optional` was designed as a return type: a way for a method to say in its signature that it may find nothing. For inputs, an overload or a documented nullable parameter is clearer.
> **They follow up with:** *"So is `Optional` in a field wrong too?"* — Effectively yes. It isn't `Serializable`, it costs an extra object per instance, and frameworks that populate fields reflectively don't expect it. Keep the field nullable and return `Optional.ofNullable(field)` from the getter.

<details>
<summary><strong>Quick check.</strong> <code>opt.orElse(computeDefault())</code> vs <code>opt.orElseGet(this::computeDefault)</code> — when is the difference a bug rather than a style nit?</summary>

Whenever `computeDefault()` is expensive or has side effects. `orElse` evaluates its argument before `orElse` is even called — Java is strict, so the argument is computed regardless of whether the `Optional` is present, and the result is then discarded. If that call hits a database, allocates, logs, or increments a counter, you get real cost or a real side effect on the happy path where it should never have run. `orElseGet` defers it behind a `Supplier` and only invokes it when the `Optional` is empty.
</details>

---

## 38b.5 Streams — What You Half-Remember, Corrected ★★

Be honest about where this belongs. Streams are close to irrelevant for algorithm interviews: across the 400-plus Java problems in [Ch 31](#content/31_dsa_coding), `stream()` appears exactly **once**. Under time pressure a `for` loop is faster to write, faster to debug and easier to talk through. But open any backend repository written since 2018 and streams are everywhere. So learn this for the job, not for the whiteboard.

#### Simple Explanation

A stream is a one-shot pipeline over a sequence of values. You describe the transformation as a chain of steps rather than as a loop with an accumulator, and the library runs it.

The one thing to internalise is **laziness**. Intermediate operations like `filter` and `map` don't do anything when you call them — they just build up a description. Nothing traverses the source until a terminal operation asks for a result. This is why a pipeline with no terminal op silently does nothing, and why a stream can't be reused: consuming it is what runs it.

> A **stream** is a lazily evaluated sequence of elements supporting a pipeline of intermediate operations followed by exactly one terminal operation.

```
  source            intermediate (lazy)      terminal (eager)
  ------            -------------------      ----------------
  list.stream()     filter(pred)             toList()
  Arrays.stream(a)  map(fn)                  count()
  Stream.of(...)    flatMap(fn)              collect(...)
  IntStream.range   sorted() distinct()      forEach(...)
  Files.lines(p)    limit(n) skip(n)         reduce(...)
                                             anyMatch(...)

    nothing above runs until a terminal op appears,
    and a stream can only be consumed once
```

Verified proof of laziness — the pipeline is built, nothing prints, then `count()` triggers the whole traversal:

```
pipeline built, nothing printed yet
  testing ada
  testing linus
  testing grace
  testing alan
  testing edsger
count = 3
```

### The workhorses, and the collectors

```java
List<String> engs = STAFF.stream()
        .filter(e -> e.dept().equals("eng"))
        .sorted(Comparator.comparingInt(Emp::salary).reversed())
        .map(Emp::name)
        .toList();                     // Java 16+
```

`Stream.toList()` (Java 16) replaces `collect(Collectors.toList())` and is what you should write now — with one surprise: **it returns an unmodifiable list**, whereas `Collectors.toList()` returned an `ArrayList` you could mutate. Code that collected and then added will throw. If you need a mutable result, say so explicitly with `collect(Collectors.toCollection(ArrayList::new))`. `Collectors.toUnmodifiableList()` also exists and does the same thing as `toList()`; it predates it and is now mostly redundant, though unlike `toList()` it rejects nulls.

The collectors that carry real weight are `groupingBy`, `partitioningBy`, `joining` and `toMap`:

```java
Map<String, List<String>> byDept = STAFF.stream()
        .collect(Collectors.groupingBy(Emp::dept,
                 Collectors.mapping(Emp::name, Collectors.toList())));

Map<String, Integer> payroll = STAFF.stream()
        .collect(Collectors.groupingBy(Emp::dept,
                 Collectors.summingInt(Emp::salary)));
```

`toMap` has a sharp edge worth memorising: **duplicate keys throw**, they don't overwrite. Supply a merge function when collisions are possible.

Verified output, including the real exception message:

```
engs = [grace, ada, linus]
Stream.toList() is UNMODIFIABLE
byDept = {sales=[alan, edsger], eng=[ada, linus, grace]}
payroll = {sales=250, eng=530}
split = {false=2, true=3}
joined = [ada, linus, grace, alan, edsger]
toMap duplicate -> Duplicate key eng (attempted merging values
ada and linus)
merged = {sales=alan|edsger, eng=ada|linus|grace}
flat = [1, 2, 3]
```

`flatMap` is the one that takes a moment: it maps each element to a *stream* and concatenates the results, flattening exactly one level. `List<List<Integer>>` becomes `List<Integer>`.

### `IntStream` and boxing

`Stream<Integer>` boxes every element. `IntStream`, `LongStream` and `DoubleStream` don't, and they carry numeric terminals that `Stream` lacks:

```java
int total = STAFF.stream().mapToInt(Emp::salary).sum();
IntSummaryStatistics stats =
        STAFF.stream().mapToInt(Emp::salary).summaryStatistics();
List<Integer> squares = IntStream.rangeClosed(1, 5)
        .map(i -> i * i).boxed().toList();
```

`mapToInt` enters the primitive world, `boxed()` and `mapToObj` leave it. Verified:

```
total = 780
stats = IntSummaryStatistics{count=5, sum=780, min=120,
average=156.000000, max=200}
squares = [1, 4, 9, 16, 25]
distinct+limit = [1, 2, 3]
```

### When not to use a stream

This is the part experience teaches and tutorials skip.

| Situation | Use instead | Why |
|---|---|---|
| Tight numeric loop over an array | `for` loop | Boxing and megamorphic lambda call sites cost real time; the JIT handles the loop better |
| Early exit on a complex condition | `for` + `break` | `findFirst` and `anyMatch` cover the simple cases; anything else contorts |
| Mutating an accumulator or index | `for` loop | Side effects in `forEach` are the anti-pattern streams were meant to remove |
| Two collections in lockstep | indexed `for` | Streams have no clean zip; `IntStream.range` over indices is a workaround, not an improvement |
| Anything inside a coding interview | `for` loop | A stack trace from a stream is unreadable, and you can't step through it on a whiteboard |

The rule that survives contact with real code: use a stream when the pipeline reads as a *description of the result* — filter these, group by that, sum the other. The moment you find yourself reaching for a mutable variable outside the pipeline, you wanted a loop.

`parallelStream()` deserves one line of warning: it uses the common `ForkJoinPool`, it only pays off on large, CPU-bound, side-effect-free work over a cheaply splittable source, and it is a common source of "why is my request thread starving." Measure before reaching for it, and never use it for I/O.

> **Interview —** *"When would you choose a loop over a stream?"*
> **Say:** When the work is index-based, mutates state, exits early on a condition streams express awkwardly, or is a hot numeric path where boxing matters. Streams win when the code reads as a declarative description of the result — filter, group, aggregate — and especially when it replaces a nested loop with a `groupingBy`. Then add the operational point: stream stack traces are hard to read and you can't set a breakpoint mid-pipeline, so in code that gets debugged at 3am a plain loop is sometimes the kinder choice.
> **They follow up with:** *"Is a stream slower than a loop?"* — For a simple traversal of a primitive array, usually yes, mostly from boxing and less predictable inlining. For a large pipeline of several stages the difference narrows because the source is traversed once either way. It's rarely the bottleneck; choose on readability and only optimise with a measurement in hand.

<details>
<summary><strong>Quick check.</strong> <code>list.stream().map(String::trim);</code> — what does this line do?</summary>

Nothing. `map` is an intermediate operation, so it only builds a description of the pipeline; with no terminal operation the source is never traversed and the lambda never runs. It also doesn't modify `list` — streams never mutate their source. The line you wanted is `var trimmed = list.stream().map(String::trim).toList();`. A pipeline whose result is discarded is always a bug, and it's the most common one beginners write.
</details>

## 38b.6 Virtual Threads and Modern Concurrency ★★★

[Ch 21 — Design Fundamentals](#content/21_design_fundamentals) already teaches the concurrency you half-remember, and teaches it well: §3.2 covers races, `synchronized` and `AtomicInteger`, §3.3 covers `ConcurrentHashMap`, `ExecutorService` and producer–consumer with a `BlockingQueue`, and §3.4 covers deadlock, livelock and starvation. **None of that has changed and none of it is repeated here.** Go read it if it feels rusty — it is still exactly what an interviewer probes when they ask "is this thread-safe?"

This section starts where that one stops. What changed since 2022 is not the memory model or the locks. It is **the cost of a thread** — and that single change quietly invalidated a whole architectural fashion.

> ⚠️ **Concurrency examples in this section are read-only.** The in-app runner cannot create OS threads at all — starting a `Thread`, an `ExecutorService` or a virtual thread dies with `pthread_create failed (EAGAIN)`. Expected behaviour is described inline as a comment and clearly labelled. The one block below that is plain single-threaded Java *was* compiled and run, and shows its real output.

---

### The problem you left behind

In the Java you knew, `new Thread(...)` was a thin wrapper over an OS thread: one Java thread, one kernel thread, scheduled by the operating system. The JVM reserves around 1 MB of stack for each (`-Xss` defaults to 512 KB–1 MB), creation costs on the order of a millisecond, and every context switch goes through the kernel. That is why you pooled them — `Executors.newFixedThreadPool(200)` was not a style choice, it was rationing a scarce resource.

Now do the arithmetic that actually bites. Little's Law says the number of concurrent things in flight is $L = \lambda W$: arrival rate times time-in-system. Invert it. If a request spends 100 ms waiting on a database and two downstream services, and you have 200 threads, your throughput ceiling is $200 / 0.1 = 2{,}000$ requests per second — no matter how idle your CPUs are.

```
  2022: one request = one OS thread, and the thread just waits

  ┌──────────┐  pool of 200 platform threads, ~1 MB stack each
  │ request  │──▶ [T1] ──── blocked on JDBC ──── idle
  │ request  │──▶ [T2] ──── blocked on HTTP ──── idle
  │  ...     │──▶  ...
  │ request  │──▶ [T200] ─── blocked on JDBC ─── idle
  │ request  │──▶ (queued: no thread free, latency climbs)
  └──────────┘

  Threads in use: 200.  CPU actually working: nearly zero.
```

Your server was not out of CPU. It was out of *threads to block*. And the industry's answer, from roughly 2016 to 2022, was: **stop blocking**. Chain `CompletableFuture`s. Adopt WebFlux, Reactor, RxJava. Never hold a thread while you wait.

It worked, and it cost a fortune in comprehensibility. Stack traces stopped describing your program, debugger stepping stopped following the logic, and thread-locals — and therefore MDC logging and security contexts — quietly broke. A five-line business rule became a twenty-line pipeline of lambdas that no junior could safely modify.

#### Simple Explanation

Picture a call centre where every agent needs their own permanent desk, and the building only has 2,000 desks. Most of the day an agent is on hold, listening to music, occupying a desk while doing nothing at all. You cannot take more calls than you have desks, even though almost every desk is idle.

The reactive answer was to ban waiting: an agent who gets put on hold writes their place on a sticky note, hands the call off, and picks up something else. Throughput soars. But now no single agent has the story of any single customer, and when something goes wrong, nobody can reconstruct what happened.

Virtual threads take the third option. Give each agent a **locker** instead of a desk. When they're put on hold, their notes go in the locker and the desk is freed instantly. When the other side finally answers, they grab any free desk and carry on mid-sentence. A million lockers, a couple of dozen desks, and — this is the point — **the agent's script is still written top to bottom, exactly as before.**

> A **virtual thread** is a `java.lang.Thread` scheduled by the JVM rather than the operating system: it is *mounted* on a platform *carrier* thread to run, and *unmounted* onto the heap as a continuation whenever it blocks.

### What actually changes

| | Platform thread | Virtual thread |
|---|---|---|
| Backed by | one OS thread | a heap continuation |
| Stack cost | ~1 MB reserved | a few hundred bytes, grows |
| Creation | ~1 ms — so you pool | ~1 µs — so you don't |
| Practical count | a few thousand | millions |
| Scheduled by | the OS kernel | a JVM `ForkJoinPool` |
| On blocking I/O | the OS thread stalls | it unmounts, carrier freed |
| Pool them? | yes, always | **never** |
| Good for | CPU-bound work | I/O-bound work |

```
  1,000,000 virtual threads       2 carrier (platform) threads
  ┌────────────────────────┐      ┌───────────────────────────┐
  │ vt#1  RUNNABLE   ──────┼─────▶│ carrier-0  (running vt#1) │
  │ vt#2  RUNNABLE   ──────┼─────▶│ carrier-1  (running vt#2) │
  │ vt#3  parked on heap   │      └───────────────────────────┘
  │ vt#4  parked on heap   │       blocking unmounts the vt
  │ ...                    │       and frees its carrier at once
  └────────────────────────┘
```

The carrier pool is sized to `Runtime.availableProcessors()` by default. Two carriers can host a million virtual threads, because at any instant nearly all of them are parked on a socket read.

### The API — three shapes, one of which you'll actually use

```java
// 1. Fire one off.
Thread t = Thread.startVirtualThread(() -> handle(request));
t.join();

// 2. Builder: gives you naming and an unstarted thread.
Thread named = Thread.ofVirtual()
                     .name("req-", 0)      // req-0, req-1, ...
                     .start(() -> handle(request));

// 3. The one you'll write in server code.
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    for (Request r : batch) {
        exec.submit(() -> handle(r));      // one vthread per task
    }
}   // close() blocks until every task finishes — an implicit join

// expected (read-only — the sandbox forbids OS threads):
// 10,000 tasks each get their own virtual thread, all in flight
// at once, multiplexed over ~availableProcessors() carriers.
```

Two details worth noticing. `ExecutorService` became `AutoCloseable` in Java 19, which is why try-with-resources works and gives you "wait for all of these" for free. And `newVirtualThreadPerTaskExecutor()` is **not a pool** — it mints a fresh virtual thread per task and discards it afterwards.

### Before and after: the same fan-out, twice

Fetching a user's orders and preferences concurrently, then combining them.

```java
// 2022 — how you'd have written it
ExecutorService pool = Executors.newFixedThreadPool(32);

CompletableFuture<User> user = CompletableFuture
        .supplyAsync(() -> users.byId(id), pool);

CompletableFuture<List<Order>> orders = user
        .thenComposeAsync(u -> CompletableFuture
                .supplyAsync(() -> orderSvc.forUser(u.id()), pool), pool);

CompletableFuture<Prefs> prefs = CompletableFuture
        .supplyAsync(() -> prefSvc.byId(id), pool);

Profile profile = orders
        .thenCombine(prefs, Profile::new)
        .exceptionally(ex -> Profile.empty())
        .get(2, TimeUnit.SECONDS);
```

```java
// 2026 — how you'd write it now
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    Future<List<Order>> orders = exec.submit(() -> ordersFor(id));
    Future<Prefs>       prefs  = exec.submit(() -> prefSvc.byId(id));
    return new Profile(orders.get(), prefs.get());   // blocking is fine
} catch (ExecutionException e) {
    return Profile.empty();
}

// expected (read-only): both calls run concurrently on virtual
// threads; total latency ≈ max(orders, prefs), not the sum.
```

The second version is not merely shorter. It has a real stack trace when it fails, works with ordinary `try`/`catch`/`finally`, shows up correctly in a profiler, and steps through in a debugger — and it is *just as concurrent*: both calls are in flight at once, so total latency is the max of the two, not the sum.

### `CompletableFuture` has not gone away

It is still the right tool in four situations, and still fair interview game:

- A library hands you an async API you don't control — `HttpClient.sendAsync` returns a `CompletableFuture` whether you like it or not.
- You need `orTimeout(...)` / `completeOnTimeout(...)`, which have no clean blocking equivalent.
- You want to **deduplicate in-flight work**: a `ConcurrentHashMap<K, CompletableFuture<V>>` with `computeIfAbsent` means a hundred simultaneous cache misses trigger exactly one load. No virtual-thread replacement for that trick.
- You're on an API boundary and must not block a caller's thread you don't own.

The core vocabulary, unchanged: `supplyAsync` starts work, `thenApply` transforms a result, `thenCompose` chains a call that itself returns a future (flat-map — this is the one people get wrong), `thenCombine` joins two independent futures, `allOf` waits for many, `exceptionally` recovers.

Already-completed stages run inline on the calling thread, which means a small composition needs no executor at all. **This block was verified on JDK 22 and its output is real:**

```java
import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        CompletableFuture<String>  a = CompletableFuture.completedFuture("ada");
        CompletableFuture<Integer> b = CompletableFuture.completedFuture(7);

        String out = a.thenCombine(b, (name, n) -> name + ":" + n)
                      .thenApply(String::toUpperCase)
                      .join();

        System.out.println(out);
        System.out.println("ran on: " + Thread.currentThread().getName());
        System.out.println("is virtual? " + Thread.currentThread().isVirtual());
    }
}
// ADA:7
// ran on: main
// is virtual? false
```

Two traps a returning developer walks into. `thenApply` runs the callback on whichever thread completed the stage — possibly the one that called `complete()`, possibly the caller — while `thenApplyAsync` moves it to the common `ForkJoinPool`. And `join()` throws unchecked `CompletionException` while `get()` throws checked `ExecutionException`; mixing them produces surprising catch blocks.

### Where virtual threads do *not* help

**CPU-bound work.** You still have $N$ cores. A million virtual threads multiplying matrices is a million ways to thrash the cache and lengthen every latency tail. Keep a fixed platform-thread pool sized near `availableProcessors()` for compute, and use virtual threads for the waiting.

**Pinning — the #1 real-world gotcha.** A virtual thread that blocks *inside a `synchronized` block* cannot unmount, because the monitor is associated with the carrier. The carrier is stuck for the duration. Enough pinned carriers and your throughput collapses, or deadlocks outright — a server that behaves perfectly at 100 users and freezes at 5,000.

```java
// Pins the carrier on Java 21: the vthread cannot unmount here.
synchronized (this) {
    return jdbc.query(sql);           // blocking I/O under a monitor
}

// Safe on every version: a virtual thread parks and releases
// its carrier while waiting for a ReentrantLock.
lock.lock();
try {
    return jdbc.query(sql);
} finally {
    lock.unlock();
}
```

Be precise about versions, because this is exactly where an interviewer probes. **JEP 491 (Java 24) made `synchronized` no longer pin** in the common cases, so on Java 24/25 the first block is fine. But most production estates in 2026 are still on **Java 21**, where it pins — and pinning still occurs on *any* version when a virtual thread blocks inside a native frame (JNI or the FFM API). The safe answer: prefer `ReentrantLock` on hot I/O paths, and run with `-Djdk.tracePinnedThreads=full` on 21 to find the offenders.

**Don't pool them.** Pooling amortises expensive creation; virtual threads are cheap. To *limit* concurrency against a downstream — say 20 connections to Postgres — use a `Semaphore` around the call, not a small thread pool. The distinction matters because the bottleneck has moved: your limit is now connection pools, downstream rate limits and memory. A team that flips on virtual threads without resizing HikariCP just relocates the queue.

**Go easy on `ThreadLocal`.** It was a sane cache when threads were few and long-lived — one `SimpleDateFormat` per thread, reused a million times. With a million short-lived virtual threads it is a million copies and no reuse at all. It still *works*; just treat it as per-request state, never as a cache.

### Structured concurrency and scoped values — Java 25, read-only

Look again at the try-with-resources fan-out. The tasks are still loose: if one fails, the other keeps running until someone cancels it, and nothing in the language ties the children's lifetime to the block.

**Structured concurrency** fixes that by making concurrency obey the same rule as a code block: children cannot outlive the scope that created them, and a failure cancels the siblings automatically.

```java
// Read-only twice over: preview API, and the sandbox has no threads.
// Java 25 shape (JEP 505). Needs --enable-preview.
// import java.util.concurrent.StructuredTaskScope.Joiner;

try (var scope = StructuredTaskScope.open(Joiner.allSuccessfulOrThrow())) {

    var orders = scope.fork(() -> ordersFor(id));   // child vthread
    var prefs  = scope.fork(() -> prefSvc.byId(id));

    scope.join();                 // throws if either child failed,
                                  // and cancels the other one
    return new Profile(orders.get(), prefs.get());
}
// expected: identical result to the Future version above, but a
// failure in either child cancels its sibling immediately.
```

Two honest caveats. This API has churned through five previews — the Java 21 shape was `new StructuredTaskScope.ShutdownOnFailure()` with `scope.throwIfFailed()`. And, contrary to a lot of blog posts: in **Java 25 structured concurrency is still a preview feature (JEP 505)**. What *did* finalise in Java 25 is **scoped values (JEP 506)** — the replacement for `ThreadLocal` in this world: an immutable value bound for the dynamic extent of a call, inherited by forked children, unbound when the scope exits.

```java
// Read-only. Java 25, final API.
private static final ScopedValue<User> CURRENT = ScopedValue.newInstance();

ScopedValue.where(CURRENT, authenticatedUser)
           .run(() -> handleRequest(req));   // CURRENT.get() works
                                             // anywhere inside, and
                                             // in any child task
```

No `remove()` to forget, no leak into a pooled thread, and — unlike `ThreadLocal` — the compiler-visible scope tells you exactly where the binding is valid.

> **Interview —** *"Virtual threads or a reactive stack — which would you pick for a new I/O-heavy service, and why?"*
> **Say:** Virtual threads, on Java 21+. Both solve the same problem — not burning an OS thread while waiting — but reactive pays for it with a programming model that discards stack traces, debuggers, `try`/`finally` and thread-locals. Virtual threads deliver the same scalability with plain blocking code, so the code stays readable and the operational tooling keeps working. I'd stay reactive only where I genuinely need backpressure semantics across a streaming pipeline, or where the codebase is already Reactor and rewriting it buys nothing.
> **They follow up with:** *"What breaks when you switch a Boot 2 app over?"* — Pinning under `synchronized` on Java 21 (use `ReentrantLock` on hot paths and `-Djdk.tracePinnedThreads=full` to find them), `ThreadLocal`-based caches that assumed thread reuse, and pool sizing: threads stop being the bottleneck, so the database connection pool and downstream rate limits become the real limit and usually need resizing.

<details>
<summary><strong>Quick check.</strong> A service handles 200 req/s, each request blocking ~500 ms on I/O. It runs on a 200-thread pool and is at its ceiling. You switch to virtual threads and throughput doesn't improve. Name two plausible causes.</summary>

First: **pinning**. If the blocking call sits inside a `synchronized` block and you're on Java 21, every waiting virtual thread holds its carrier hostage, so your effective parallelism is the carrier count — likely *worse* than 200. Confirm with `-Djdk.tracePinnedThreads=full`, fix with `ReentrantLock`.

Second: **the bottleneck moved and you didn't follow it**. With $L = \lambda W$ you need $200 \times 0.5 = 100$ concurrent operations, which the old pool could already supply. If throughput is flat, the limit was never threads — it's a 10-connection HikariCP pool, a downstream rate limit, or the downstream service's own latency. Virtual threads make you *able* to have a million requests in flight; they do not make the database faster.

A third, rarer cause: the work isn't actually I/O-bound. If those 500 ms are CPU, no scheduler change helps — you need more cores or less work.
</details>

---

## 38b.7 Spring Boot 3 — What Changed Since Boot 2 ★★

> **Everything in this section is read-only.** Spring is not on the sandbox classpath, so none of these snippets can be run in the app — read them as reference. The single exception is the DTO/entity mapping example, which is plain Java; it was compiled and run on JDK 22 and shows its real output.

#### Simple Explanation

You have come back to the same building. The layout is familiar, the furniture is where you left it — and every single room has been renumbered. That renumbering is `javax.*` becoming `jakarta.*`, and it is the whole reason the Boot 3 upgrade was painful rather than routine: not one new idea, just thousands of import lines that had to change at once.

Beyond the renumbering, three things are genuinely different. The building refuses entry to anyone below Java 17. There is a light switch by the door that makes every worker essentially free — `spring.threads.virtual.enabled`. And the furniture you carry data around in is now a record instead of a forty-line bean.

> **Spring Boot 3** is the Jakarta EE 9+ generation of Spring Boot: Java 17 is the minimum, every `javax.*` enterprise API is now `jakarta.*`, and since 3.2 the servlet container can serve each request on a virtual thread.

### The delta table

| Concern | Boot 2 (2022) | Boot 3 (2026) |
|---|---|---|
| Java baseline | 8 or 11 | **17 minimum**, 21/25 recommended |
| Namespace | `javax.*` | **`jakarta.*`** (Jakarta EE 9+) |
| Threading | Tomcat pool, `threads.max=200` | `spring.threads.virtual.enabled=true` |
| Tracing | Spring Cloud Sleuth | **Micrometer Tracing** (Sleuth is dead) |
| Metrics | Micrometer | Micrometer + OpenTelemetry export |
| Security config | `WebSecurityConfigurerAdapter` | a `SecurityFilterChain` `@Bean`, lambda DSL |
| Native images | experimental | supported via GraalVM + AOT processing |
| DTOs | Lombok `@Data` beans | **records** (§38b.2) |
| Test mocks | `@MockBean` | `@MockitoBean` (3.4+) |
| Test infra | H2 in-memory | **Testcontainers** + `@ServiceConnection` |

### One property, thread-per-request restored

```yaml
spring:
  threads:
    virtual:
      enabled: true      # Boot 3.2+, on Java 21+
```

That is the entire migration for most MVC applications. Tomcat's request executor becomes a virtual-thread-per-task executor, and so do `@Async`, `@Scheduled` tasks, and the Kafka and RabbitMQ listener containers. Your controllers, services and repositories don't change a line — they were already blocking code, which is now the correct thing to be.

Delete your `server.tomcat.threads.max` tuning afterwards; it governs nothing now. Then go and look at `spring.datasource.hikari.maximum-pool-size`, because that is your new ceiling (§38b.6).

### `javax` → `jakarta`, precisely

Search and replace, but know what *doesn't* move. The Jakarta EE packages change: `javax.persistence` → `jakarta.persistence`, `javax.servlet` → `jakarta.servlet`, `javax.validation` → `jakarta.validation`, `javax.annotation.PostConstruct` → `jakarta.annotation.PostConstruct`.

The JDK's own `javax` packages **stay exactly as they are**: `javax.sql.DataSource`, `javax.crypto`, `javax.naming`, `javax.net.ssl`. A blind project-wide replace breaks all of those, and it is a genuinely common self-inflicted wound. Use the OpenRewrite `UpgradeSpringBoot_3` recipe rather than a regex.

The other API that moved out from under you is security configuration:

```java
// 2022 — how you'd have written it
@Configuration
class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
            .antMatchers("/public/**").permitAll()
            .anyRequest().authenticated()
            .and().csrf().disable();
    }
}
```

```java
// 2026 — how you'd write it now
@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    SecurityFilterChain chain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()
                .anyRequest().authenticated())
            .csrf(csrf -> csrf.disable())
            .build();
    }
}
```

The adapter base class is gone; you publish a `SecurityFilterChain` **bean** instead, `antMatchers` became `requestMatchers`, and every `.and()` chain became a lambda. Same security model, different surface — and because it is now a bean, you can compose or conditionally register chains like any other configuration.

### A controller, with a record as the DTO

```java
// Wire contract: immutable, validated, one line each (§38b.2).
record CreateOrder(@NotBlank String sku, @Positive int qty) {}
record OrderView(long id, String sku, int qty, String status) {}

@RestController
@RequestMapping("/orders")
class OrderController {

    private final OrderService service;

    // Single constructor: no @Autowired needed since Spring 4.3.
    OrderController(OrderService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    OrderView byId(@PathVariable long id) {
        return service.view(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    OrderView create(@Valid @RequestBody CreateOrder body) {
        return service.create(body);
    }
}
```

Jackson binds JSON straight into a record through its canonical constructor, so records work as `@RequestBody` *and* as response bodies with no extra configuration. Bean-validation annotations go on the record component and are enforced by `@Valid`.

**Constructor injection is the norm now**, and field injection is discouraged for reasons worth reciting: a constructor-injected field can be `final` (immutable, provably fully-initialised); the class can be instantiated in a unit test with `new`, no Spring context and no reflection; and a nine-parameter constructor is a design smell you can *see*, whereas nine `@Autowired` fields hide it. Circular dependencies also fail loudly at startup instead of half-working.

### Spring Data JPA and the three things that bite

```java
@Entity
@Table(name = "orders")          // "order" is a reserved SQL word
class Order {
    @Id @GeneratedValue
    private Long id;
    private String sku;
    private int qty;
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    private Customer customer;

    protected Order() { }        // JPA requires a no-arg constructor
    // + getters, and setters only where genuinely needed
}

interface OrderRepository extends JpaRepository<Order, Long> {

    // Derived query — the method name IS the query.
    List<Order> findByCustomerIdAndStatus(long customerId, String status);

    // Fixes the N+1 below by fetching the association in one query.
    @EntityGraph(attributePaths = "customer")
    List<Order> findByStatus(String status);

    @Query("select o from Order o join fetch o.customer where o.qty > :n")
    List<Order> bigOrders(@Param("n") int n);
}
```

**1. N+1 selects.** You fetch 500 orders in one query, then the serializer touches `order.getCustomer()` on each — 500 more queries. The tell is a page that is fast with ten rows of test data and times out in production. Fix with `@EntityGraph(attributePaths = ...)`, a `join fetch` query, or a projection selecting only the columns you need. Turn on `spring.jpa.properties.hibernate.generate_statistics=true` in a test to *count* queries rather than guess.

**2. `LazyInitializationException`.** The persistence context closes at the transaction boundary; touching a lazy association afterwards throws. Boot ships with `spring.jpa.open-in-view=true`, which hides the problem by holding the session open for the whole request — a default most experienced teams switch **off**, because it turns lazy loading into invisible query storms in the view layer. Set it `false` and map to DTOs inside the service, within the transaction.

**3. `@Transactional` boundaries.** It is implemented with a proxy, which produces three silent failures: calling a `@Transactional` method from another method of the *same bean* bypasses the proxy entirely (self-invocation, no transaction); putting it on a `private` or `final` method does nothing; and by default only *unchecked* exceptions roll back, so a checked exception commits your half-finished work unless you write `rollbackFor`. Use `@Transactional(readOnly = true)` on queries — it lets Hibernate skip dirty-checking.

### Records as DTOs, classes as entities

An `@Entity` **cannot** be a record: JPA needs a no-arg constructor and mutable fields so it can hydrate and dirty-check instances. A DTO should be a record for exactly the opposite reasons. So you map between them — a small, boring, testable function. **This block is plain Java, verified on JDK 22:**

```java
record CreateOrderRequest(String sku, int qty) {}
record OrderResponse(long id, String sku, int qty, String status) {}

class OrderEntity {                       // what JPA persists
    private Long id;
    private String sku;
    private int qty;
    private String status;

    protected OrderEntity() { }           // required by JPA

    OrderEntity(String sku, int qty) {
        this.sku = sku;
        this.qty = qty;
        this.status = "NEW";
    }
    void assignId(long id) { this.id = id; }
    Long getId()       { return id; }
    String getSku()    { return sku; }
    int getQty()       { return qty; }
    String getStatus() { return status; }
}

public class Main {
    static OrderEntity fromDto(CreateOrderRequest req) {
        return new OrderEntity(req.sku(), req.qty());
    }
    static OrderResponse toDto(OrderEntity e) {
        return new OrderResponse(e.getId(), e.getSku(),
                                 e.getQty(), e.getStatus());
    }
    public static void main(String[] args) {
        var req = new CreateOrderRequest("SKU-42", 3);
        var entity = fromDto(req);
        entity.assignId(1001L);

        OrderResponse dto = toDto(entity);
        System.out.println(dto);
        System.out.println(dto.equals(
            new OrderResponse(1001L, "SKU-42", 3, "NEW")));
    }
}
// OrderResponse[id=1001, sku=SKU-42, qty=3, status=NEW]
// true
```

Note what the record gave you free: a readable `toString` for logging and a correct `equals` for testing — the two things you used to hand-write or hand to Lombok.

### Configuration

```yaml
# application.yml
billing:
  api-key: ${BILLING_KEY}       # relaxed binding: api-key -> apiKey
  timeout: 2s                   # parsed into a Duration
  retries: 3

---
spring:
  config:
    activate:
      on-profile: local
billing:
  api-key: dev-key
```

```java
@ConfigurationProperties(prefix = "billing")
record BillingProps(String apiKey, Duration timeout, int retries) { }
```

A record binds directly as configuration properties — constructor binding, immutable result, `@Validated` still applies. Enable it with `@ConfigurationPropertiesScan`. Profiles are activated with `SPRING_PROFILES_ACTIVE`, and the modern preference is one `application.yml` with profile documents rather than a scatter of `application-*.yml` files.

### Testing

`@SpringBootTest` starts the entire context — the honest integration test, and slow, so use it sparingly for wiring and the happy path end-to-end.

Reach for **slice tests** by default. `@WebMvcTest(OrderController.class)` loads the web layer only and gives you `MockMvc`, with collaborators supplied as `@MockitoBean` (the Boot 3.4 rename of `@MockBean`). `@DataJpaTest` loads JPA and the repositories only, and rolls back each test.

**Testcontainers is the modern default** for anything touching a real database or broker — a throwaway Postgres or Kafka in Docker, so tests exercise the database you actually deploy on rather than H2 pretending. Since Boot 3.1, `@ServiceConnection` wires the container's URL and credentials into the context automatically, deleting the `@DynamicPropertySource` boilerplate everyone used to copy around. See [Ch 22 — Engineering Tools](#content/22_engineering_tools) for Docker itself.

Two more worth knowing by name. **GraalVM native images** compile a Boot app ahead of time: ~50 ms startup and a fraction of the memory, at the cost of build-time reflection configuration and no dynamic class loading — attractive for serverless, still niche for long-running services. And **Micrometer** is now the whole observability story: metrics, and since Boot 3 tracing too, exporting to Prometheus and OpenTelemetry.

> **Interview —** *"What's involved in migrating a Spring Boot 2 service to Boot 3?"*
> **Say:** Three buckets. Mechanical: Java 17 baseline and the `javax` → `jakarta` namespace change, which is best done with OpenRewrite rather than a regex because the JDK's own `javax.sql` and `javax.crypto` must *not* move. Behavioural: `WebSecurityConfigurerAdapter` is gone in favour of a `SecurityFilterChain` bean, and Sleuth is replaced by Micrometer Tracing. Opportunity: on Java 21 you flip `spring.threads.virtual.enabled=true` and get thread-per-request back — then immediately re-check the connection pool, because threads stop being the bottleneck.
> **They follow up with:** *"How would you know the migration didn't break anything?"* — Integration tests on Testcontainers rather than H2, so the database behaviour is real; a query-count assertion on the hot endpoints to catch a fetch strategy that silently changed into an N+1; and canary the deploy while watching p99 latency and connection-pool saturation.

<details>
<summary><strong>Quick check.</strong> Your `/orders` endpoint returns 200 orders and each includes its customer's name. It passes every test and takes 4 seconds in production. What is happening, and what are two fixes?</summary>

Classic **N+1**: one query loads the 200 orders, then serializing each `order.getCustomer().getName()` triggers a lazy load — 201 queries. It passed tests because the test fixture had three rows, and it didn't throw `LazyInitializationException` because `spring.jpa.open-in-view` is `true` by default, keeping the session open through rendering and hiding the problem.

Fix one: fetch the association eagerly for this query only — `@EntityGraph(attributePaths = "customer")` on the repository method, or `join fetch` in a `@Query`. Fix two, usually better: don't return entities at all. Query a projection or map to an `OrderView` record inside the transactional service method, selecting just the columns the endpoint needs.

Then set `open-in-view: false` so the next one fails loudly in a test instead of silently in production.
</details>

---

## 38b.8 Build Tools and Testing ★★

> **Read-only section.** Neither Maven, Gradle, JUnit nor Mockito is on the sandbox classpath, so nothing below can be run in the app.

#### Simple Explanation

A build tool is the written recipe that turns a folder of source files into something shippable: fetch these ingredients at these versions, compile, test, package. Maven writes the recipe as a fixed sequence everyone already knows. Gradle writes it as a graph of steps it can skip whenever nothing has changed.

The **wrapper** is the part people undervalue: it ships the *oven* along with the recipe. A colleague clones the repo, runs `./mvnw`, and gets your exact build-tool version rather than whatever happens to be on their laptop.

Testing changed less than you'd fear. JUnit 5 is the same idea with better annotations, and AssertJ replaced a pile of `assertEquals` calls with one readable sentence per assertion.

> A **build tool** resolves dependencies, compiles, tests and packages a project from a declarative description; a **wrapper** script pins that tool's own version inside the repository.

### Maven or Gradle in 2026

Both are healthy; the choice is about build *size*, not fashion.

| | Maven | Gradle |
|---|---|---|
| Model | declarative XML, fixed lifecycle | imperative/DSL, task graph |
| Strength | predictable, universally readable | incremental builds, build cache |
| Weakness | verbose, awkward custom steps | more moving parts to understand |
| Pick when | standard app, < ~20 modules | large multi-module, build time is a cost |
| Also | Spring's own docs default to it | the default for Android |

Rough rule: if your build is a normal service and nobody complains about build time, Maven — its boringness is the feature. If you have a monorepo where CI minutes are a budget line, Gradle's caching and incremental compilation pay for the extra complexity.

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>orders</artifactId>
  <version>1.0.0</version>

  <properties>
    <maven.compiler.release>21</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.11.3</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.assertj</groupId>
      <artifactId>assertj-core</artifactId>
      <version>3.26.3</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

One delta from 2022: `<maven.compiler.release>` replaces the old `source`/`target` pair. `release` also verifies you haven't called an API newer than the target version — `source`/`target` never did, which is how projects shipped code that compiled fine and threw `NoSuchMethodError` on an older JRE.
```kotlin
// build.gradle.kts — the Kotlin DSL is the default now
plugins {
    java
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories { mavenCentral() }

dependencies {
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.3")
    testImplementation("org.assertj:assertj-core:3.26.3")
}

tasks.test { useJUnitPlatform() }
```

The Kotlin DSL replaced Groovy as the recommended default, largely because the IDE can autocomplete it. **Toolchains** are the other change worth knowing: Gradle locates or downloads JDK 21 for you, so the build no longer depends on whatever `JAVA_HOME` happens to be.

**Commit the wrapper.** `./mvnw` and `./gradlew`, plus their `.mvn/wrapper/` and `gradle/wrapper/` directories, belong in git. They pin the exact build-tool version, so a fresh clone and a CI runner with nothing installed produce identical builds, and a build-tool upgrade becomes a reviewed one-line diff instead of an untracked change on someone's laptop. Maven's wrapper is now official: `mvn wrapper:wrapper`.

### JUnit 5

```java
class OrderServiceTest {

    private OrderService service;

    @BeforeEach
    void setUp() { service = new OrderService(new InMemoryRepo()); }

    @Test
    @DisplayName("rejects an order with zero quantity")
    void rejectsZeroQty() {
        var ex = assertThrows(IllegalArgumentException.class,
                              () -> service.create("SKU-1", 0));
        assertTrue(ex.getMessage().contains("qty"));
    }

    @ParameterizedTest
    @ValueSource(ints = {-5, -1, 0})
    void rejectsNonPositiveQty(int qty) {
        assertThrows(IllegalArgumentException.class,
                     () -> service.create("SKU-1", qty));
    }

    @ParameterizedTest
    @CsvSource({ "SKU-1, 2, 20", "SKU-2, 3, 45" })
    void computesTotal(String sku, int qty, int expected) {
        assertEquals(expected, service.create(sku, qty).total());
    }

    @Test
    void populatesEveryField() {
        var o = service.create("SKU-1", 2);
        assertAll("order",
            () -> assertEquals("SKU-1", o.sku()),
            () -> assertEquals(2, o.qty()),
            () -> assertNotNull(o.id()));
    }

    @Nested
    @DisplayName("when the warehouse is empty")
    class WhenEmpty {
        @Test void backorders() { /* ... */ }
    }
}
```

`assertAll` reports *every* failing assertion in one run rather than stopping at the first, which turns three debug cycles into one. `@Nested` lets a test class mirror the shape of the behaviour instead of being a flat list of 40 methods.

Here is what will trip you coming from JUnit 4:

| JUnit 4 | JUnit 5 | Watch out |
|---|---|---|
| `@Before` | `@BeforeEach` | pure rename |
| `@BeforeClass` | `@BeforeAll` | still `static` by default |
| `@Ignore` | `@Disabled` | pure rename |
| `@Test(expected = X.class)` | `assertThrows(X.class, ...)` | returns the exception, so you can assert on it |
| `@Test(timeout = 1000)` | `@Timeout` / `assertTimeout` | separate concern now |
| `@RunWith` / `@Rule` | `@ExtendWith` | one extension model |
| `@Category` | `@Tag` | plain strings |
| `Assert.assertEquals(msg, a, b)` | `assertEquals(a, b, msg)` | **the message moved to last** |
| `public class` + `public void` | package-private is fine | drop the `public` |

That message-argument move is the one that silently bites: `assertEquals("expected two", 2, count)` still compiles under a different overload and now compares the wrong things.

### AssertJ

```java
assertThat(orders)
    .hasSize(2)
    .extracting(Order::sku)
    .containsExactly("SKU-1", "SKU-2");

assertThat(order.status()).isEqualTo("SHIPPED");

assertThatThrownBy(() -> service.create("SKU-1", 0))
    .isInstanceOf(IllegalArgumentException.class)
    .hasMessageContaining("qty");
```

AssertJ won because a single `assertThat(...)` entry point plus autocomplete surfaces only the assertions valid for that type, the actual value comes first so it reads left to right, and failures show a real diff instead of "expected: true but was: false".

### Mockito

```java
OrderRepository repo = mock(OrderRepository.class);
when(repo.findById(1L)).thenReturn(Optional.of(order));

var service = new OrderService(repo);
service.ship(1L);

verify(repo).save(argThat(o -> "SHIPPED".equals(o.status())));
verifyNoMoreInteractions(repo);
```

Since Mockito 5 the inline mock maker is the default, so final classes and static methods are mockable without an extra extension — a 2022-era workaround you can now delete. The judgement call hasn't changed: mock the collaborators you own, and use a real Postgres in Testcontainers rather than a mock `DataSource`, because mocked SQL only proves your mock agrees with itself.

**One-liners worth knowing:** *Testcontainers* — real dependencies in Docker for tests (see [Ch 22](#content/22_engineering_tools)). *JaCoCo* — coverage reporting; a smoke detector, not a target. *Spotless* / *google-java-format* / *Checkstyle* — formatting enforced in CI, so pull requests stop arguing about braces.

> **Interview —** *"How do you decide what to unit test versus integration test?"*
> **Say:** Unit-test the logic that has branches and edge cases — pricing rules, validation, state machines — with no framework and minimal mocks, because those tests must be fast enough to run on every save. Integration-test the seams where I'd otherwise just be asserting that my mock agrees with itself: SQL and mapping, serialization, HTTP contracts, transaction boundaries. Testcontainers makes that second bucket cheap enough that mocking a database is no longer defensible.
> **They follow up with:** *"What coverage number do you aim for?"* — None, as a target. Coverage tells you what is definitely *untested*; the moment it becomes a goal, people write assertion-free tests to hit it. I'd rather look at mutation testing, or at whether the critical paths have meaningful assertions.

<details>
<summary><strong>Quick check.</strong> You port a JUnit 4 test and this passes every time: <code>assertEquals("should be two", 2, count);</code> — even when <code>count</code> is 7. Why?</summary>

In JUnit 4 that was `assertEquals(String message, long expected, long actual)`. In JUnit 5 the message moved to the **last** parameter, so this call now resolves to `assertEquals(Object expected, Object actual, ...)`-style overloads with `"should be two"` as the *expected* value — or, worse, to a three-arg overload where the semantics silently differ from what you intended.

The correct JUnit 5 form is `assertEquals(2, count, "should be two")`. This is the single most common porting bug, and it is invisible in a green build — which is why the JUnit 4 → 5 migration is worth doing with an automated recipe (OpenRewrite has one) rather than by hand.
</details>

---

## 38b.9 The JVM in Ten Minutes — Memory, GC, and Diagnostics ★★

#### Simple Explanation

Think of a restaurant. Each waiter carries a **notepad** — the *stack*: private to that waiter, torn off page by page, gone at the end of the shift. The kitchen has a shared **storeroom** — the *heap*: everyone puts things there, everyone can reach them, and someone must periodically clear out what nobody will use again. That someone is the garbage collector.

There's also a **recipe binder** — *metaspace*: class metadata, loaded once, held in native memory outside the heap, growing only if you keep generating classes at runtime (dynamic proxies, hot redeploys).

> The **heap** holds all objects and is garbage-collected; each **thread stack** holds frames, locals and references; **metaspace** holds class metadata in native memory.

```
  ┌──────────────── JVM process ────────────────────┐
  │ HEAP  (shared, collected)      -Xms .. -Xmx     │
  │  ┌──── Young ──────────────┐  ┌──── Old ─────┐  │
  │  │ Eden      │ S0 │ S1     │  │  tenured     │  │
  │  └─────────────────────────┘  └──────────────┘  │
  │                                                 │
  │ METASPACE   class metadata (native memory)      │
  │ CODE CACHE  JIT-compiled machine code           │
  │ STACKS      one per *platform* thread, ~1 MB    │
  │ DIRECT      ByteBuffer.allocateDirect, FFM      │
  └─────────────────────────────────────────────────┘
```

A virtual thread's stack is not in that "STACKS" region — it lives on the **heap** as a continuation object. That is the entire trick behind §38b.6, and why a million virtual threads is a heap-sizing question rather than an OS one.

### Generational GC in one picture

```
  new object
      │
      ▼
  ┌────────┐  minor GC  ┌───────┐  survived N  ┌────────┐
  │  Eden  │ ─────────▶ │ S0/S1 │ ───────────▶ │  Old   │
  └────────┘  copy the  └───────┘   copies     └────────┘
   most die   survivors             (tenured)   major GC:
   right here                                   rare, costly
```

The weak generational hypothesis: **most objects die young.** A minor GC copies only the live objects out of Eden and wipes the rest in bulk, so its cost tracks what survives, not what you allocated — which is why short-lived allocation is far cheaper than 2022-you assumes. (Every boxed `Integer` is one such heap object; hence the Integer cache in [Ch 38](#content/38_java_refresher).)

| Collector | Pause | Pick it when |
|---|---|---|
| **G1** | tens of ms | the default since Java 9 — balanced, 4–32 GB heaps |
| **ZGC** | < 1 ms | latency SLOs matter; large heaps, generational since 21 |
| **Parallel** | long but efficient | batch jobs where throughput beats pause time |
| **Serial** | n/a | tiny containers, one core, short-lived CLI tools |

Flags worth memorising: `-Xms` and `-Xmx` (set them **equal** in a container to avoid resize churn), `-XX:MaxRAMPercentage=75` instead of `-Xmx` under Kubernetes so the heap tracks the cgroup limit, `-XX:+UseZGC` to switch collector, and `-XX:+HeapDumpOnOutOfMemoryError` so a crash leaves evidence. Version note: ZGC went generational by default in Java 23 and non-generational mode was removed in 24, so `-XX:+ZGenerational` is obsolete — `-XX:+UseZGC` alone is correct.

Plain Java, **run on JDK 22 — the output below is real** (your numbers will differ; heap size and core count are machine-specific):

```java
public class Main {
    static int depth = 0;
    static void recurse() { depth++; recurse(); }

    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        System.out.println("cores       = " + rt.availableProcessors());
        System.out.println("max heap MB = " + rt.maxMemory() / (1024 * 1024));

        try { recurse(); }                    // frames live on the stack
        catch (StackOverflowError e) {
            System.out.println("caught StackOverflowError - stack is finite");
        }

        byte[] blob = new byte[8 * 1024 * 1024];   // 8 MB on the heap
        System.out.println("allocated bytes on heap = " + blob.length);
        blob = null;                          // now unreachable
        System.gc();                          // a hint, never a command
        System.out.println("after gc hint, still alive");
    }
}
// cores       = 2
// max heap MB = 1881
// caught StackOverflowError - stack is finite
// allocated bytes on heap = 8388608
// after gc hint, still alive
```

Note the two failures are unrelated: `StackOverflowError` means one thread recursed too deep and says nothing about the heap; `OutOfMemoryError` means the heap, metaspace or the OS is exhausted.

### Diagnosing a sick JVM

| Tool | The question it answers |
|---|---|
| `jcmd <pid> Thread.print` | what is every thread doing *right now*? |
| `jcmd <pid> GC.heap_info` | how big is the heap and how full is it? |
| `jcmd <pid> VM.native_memory` | where did non-heap memory go? (needs NMT) |
| `jmap -histo:live <pid>` | which classes hold the most live objects? |
| `jstack <pid>` | thread dump; finds deadlocks |
| **JFR** (`jcmd ... JFR.start`) | low-overhead always-on profile of allocation, locks, I/O |
| heap dump + Eclipse MAT | which object graph is *retaining* the memory? |

`jcmd` has quietly absorbed most of the others — learn it first. JFR is the one that changes how you work: a few percent overhead, safe to leave on in production, and it answers "what was this process doing at 03:14?" after the fact.

**What actually causes `OutOfMemoryError`**, roughly by frequency: an unbounded cache (a `HashMap` with no eviction — use Caffeine with a `maximumSize`); an unbounded read (`findAll()` on a 20-million-row table, or a queue with no capacity bound); a `ThreadLocal` value in a pooled thread that is never destroyed; and classloader leaks on hot redeploy.

One variant isn't a heap problem at all: `OutOfMemoryError: unable to create native thread` means the OS refused you a thread. That is literally the error this app's sandbox produces — and the strongest possible argument for §38b.6.

> **Interview —** *"A service's p99 latency spikes every few minutes. How do you find out whether it's GC?"*
> **Say:** Correlate first, tune never. Turn on GC logging (`-Xlog:gc*`) or read the JFR recording and line the pause events up against the latency spikes — if they're GC pauses, they match to the second. If they do, ask *why*: a rising allocation rate, a growing cache so every collection copies more live data, or a heap too small for the working set. Only then consider a collector change. If the pauses *don't* line up it was never GC, and JFR will usually show lock contention or a slow downstream call instead.
> **They follow up with:** *"When would you not use ZGC?"* — When throughput matters more than pause time. ZGC does more concurrent work, costing CPU and memory headroom to buy short pauses; for a batch job, Parallel or G1 finishes sooner.

<details>
<summary><strong>Quick check.</strong> A service restarts every few hours with <code>OutOfMemoryError: Java heap space</code>. Heap usage climbs steadily and never falls, even after a full GC. Where do you look first, and with what?</summary>

"Never falls after a full GC" is the diagnosis: this is not garbage the collector failed to reach, it is memory something still **holds a reference to**. A leak, not a tuning problem.

Get a heap dump — `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps` so the *next* crash produces one automatically, or `jcmd <pid> GC.heap_dump` on a live process. Open it in Eclipse MAT and read the **dominator tree**, which ranks objects by *retained* size: the memory freed if that one object went away. That names the owner directly.

In practice it is nearly always a static `Map` cache with no eviction, an unbounded query result, or a `ThreadLocal` in a pooled thread. Raising `-Xmx` only changes how long you wait for the same crash.
</details>

---

## Key Takeaways

```
╔════════════════════════════════════════════════════════════════╗
║  MODERN JAVA — WHAT TO REMEMBER                                ║
║  ────────────────────────────────────────────────────────────  ║
║  Two LTS releases landed while you were away:                  ║
║  Java 21 (Sep 2023) and Java 25 (Sep 2025)                     ║
║  ────────────────────────────────────────────────────────────  ║
║  SYNTAX                                                        ║
║  var = local inference only. No fields, params, or null        ║
║  Text blocks (triple-quoted) end escaped JSON and SQL soup     ║
║  switch EXPRESSIONS return a value: arrow form, yield,         ║
║  no fall-through, and exhaustiveness is checked                ║
║  ────────────────────────────────────────────────────────────  ║
║  RECORDS  (the biggest day-to-day change)                      ║
║  40 lines of data class collapse to one line                   ║
║  Accessors are x(), NOT getX(). Implicitly final               ║
║  Free equals/hashCode/toString — so free HashMap keys          ║
║  Compact constructor validates; List.copyOf for deep safety    ║
║  Shallowly immutable only. A List field is still mutable       ║
║  ────────────────────────────────────────────────────────────  ║
║  SEALED + PATTERN MATCHING  (the biggest conceptual change)    ║
║  sealed ... permits closes the hierarchy                       ║
║  switch over a sealed type needs NO default — the compiler     ║
║  PROVES exhaustiveness, and a new subtype breaks the build     ║
║  Record patterns destructure nested data in place              ║
║  when guards add conditions. This replaces Visitor             ║
║  ────────────────────────────────────────────────────────────  ║
║  Sequenced collections: getFirst/getLast/reversed              ║
║  orElse is EAGER; orElseGet is lazy. Never bare get()          ║
║  Stream.toList() returns an UNMODIFIABLE list                  ║
║  ────────────────────────────────────────────────────────────  ║
║  VIRTUAL THREADS                                               ║
║  Cheap: millions of them. Blocking parks a continuation        ║
║  instead of an OS thread, so thread-per-request works again    ║
║  For I/O ONLY. CPU-bound work is still bounded by cores        ║
║  Never pool them. Do not lean on ThreadLocal                   ║
║  Pinning: synchronized blocked unmounting (Java 21) — use      ║
║  ReentrantLock. Java 24 (JEP 491) removed most of this         ║
║  Scoped values: FINAL in 25. Structured concurrency: still     ║
║  PREVIEW as of 25 (JEP 505)                                    ║
║  ────────────────────────────────────────────────────────────  ║
║  Boot 3 needs Java 17+ and javax.* became jakarta.*            ║
║  spring.threads.virtual.enabled=true is the whole migration    ║
║  Entities cannot be records. DTOs should be                    ║
║  Watch N+1 selects: @EntityGraph or join fetch                 ║
║  ────────────────────────────────────────────────────────────  ║
║  G1 is the default; ZGC for sub-ms pauses, generational in 21  ║
║  OOM is usually a leak: unbounded cache or ThreadLocal         ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Review Questions — Test Your Understanding

**1.** You add a fourth type to a sealed interface that three `switch` expressions already handle. What happens, and why is that the point?

<details>
<summary>Answer</summary>

**All three switches stop compiling.** Because the interface is `sealed`, the compiler knows the complete set of subtypes, so it can prove a switch is no longer exhaustive — and it refuses the build.

That is the entire value proposition. In a 2022 `if/else if` chain over `instanceof`, or a switch with a `default`, adding a type compiles fine and fails silently at runtime — usually as a wrong result rather than an exception. Sealing converts a runtime bug into a compile error, and the compiler hands you the exact list of places to update. This is why you should **not** add a `default` branch to a switch over a sealed type: `default` silences the very check you wanted.
</details>

**2.** A colleague replaces a 200-thread pool with `Executors.newVirtualThreadPerTaskExecutor()` on a CPU-bound image-resizing service and sees no improvement. Why not?

<details>
<summary>Answer</summary>

Virtual threads solve **blocking**, not **computing**. A virtual thread that blocks on I/O unmounts from its carrier, freeing that carrier for other work — which is why an I/O-bound service can go from thousands of concurrent requests to millions.

CPU-bound work never blocks; it occupies a carrier thread for its full duration. You still have only as many carriers as cores, so throughput is unchanged — and you've added scheduling overhead. For CPU-bound work, keep a fixed pool sized near the core count.
</details>

**3.** What is "pinning", and how has the answer changed between Java 21 and Java 24?

<details>
<summary>Answer</summary>

Pinning is when a virtual thread **cannot unmount** from its carrier and blocks the underlying OS thread — destroying the scalability benefit. In **Java 21** the main cause was blocking inside a `synchronized` block, so the advice was to use `ReentrantLock` instead on hot paths. With enough pinned threads the carrier pool starves and throughput collapses.

**Java 24 (JEP 491) removed pinning for common `synchronized` usage**, so on a modern JDK the `ReentrantLock` workaround is largely unnecessary. Native frames (JNI) can still pin. The interview-grade answer names the mechanism *and* the version boundary — saying "always avoid `synchronized` with virtual threads" is now outdated advice.
</details>

**4.** Why can a JPA `@Entity` not be a record, when a DTO should be?

<details>
<summary>Answer</summary>

JPA requires a **no-arg constructor** and **mutable fields** — it instantiates an entity reflectively and populates it, and dirty-checking depends on being able to observe field changes. It also needs to subclass entities to build lazy proxies. Records are implicitly final with final fields and only a canonical constructor, so they violate every one of those requirements.

DTOs have the opposite needs: immutable, value-based equality, no identity — exactly what a record provides. The idiomatic modern layering is a mutable `@Entity` at the persistence boundary mapped to an immutable `record` DTO at the API boundary, which also stops lazy-loading proxies escaping into your JSON.
</details>

**5.** `Optional.orElse(expensive())` and `Optional.orElseGet(() -> expensive())` return the same value. Why prefer the second?

<details>
<summary>Answer</summary>

`orElse` takes a **value**, so its argument is evaluated **eagerly — even when the Optional is present** and the value is thrown away. `orElseGet` takes a `Supplier`, invoked only when the Optional is empty.

With a cheap constant it doesn't matter. When the fallback hits a database, makes a network call, or has side effects, `orElse` does that work on every single call — including the common path where it was never needed. Any measurable fallback should be `orElseGet`.
</details>

**6.** `List<String> names = stream.toList(); names.add("x");` throws. Why, and what would you use instead?

<details>
<summary>Answer</summary>

`Stream.toList()` (Java 16) returns an **unmodifiable** list — this differs from the older `collect(Collectors.toList())`, which returns a mutable `ArrayList`. It's a common surprise when modernising old code, because the migration looks like a pure simplification.

If you need mutability, use `collect(Collectors.toCollection(ArrayList::new))` or wrap it. If you don't, `toList()` is the better default: it's shorter and communicates that the result isn't meant to be modified.
</details>

**7.** Your service's old heap grows steadily and never drops after a full GC, ending in `OutOfMemoryError`. Is this a tuning problem?

<details>
<summary>Answer</summary>

**No — it's a leak.** A full GC collects everything unreachable, so memory that survives one is memory something still holds a reference to. Raising `-Xmx` only delays the same crash.

Diagnose with a heap dump — set `-XX:+HeapDumpOnOutOfMemoryError` so the next failure captures one automatically — then read the **dominator tree** in Eclipse MAT, which ranks objects by *retained* size and names the owner directly. In practice it's almost always an unbounded static cache, an unpaginated query result, or a `ThreadLocal` left set on a pooled thread.
</details>

**8.** A record has a `List<String> tags` field. Is it immutable?

<details>
<summary>Answer</summary>

**Only shallowly.** The *reference* is final, so nobody can point `tags` at a different list — but the list itself is fully mutable, and a caller who kept a reference to the list they passed in can still add to it, mutating your "immutable" record from the outside.

Fix it in the **compact constructor**: `tags = List.copyOf(tags);` — this both copies and returns an unmodifiable list, so neither the caller's reference nor the accessor's return value can be used to modify it. Note `List.copyOf` rejects nulls, which is usually desirable and occasionally surprising.
</details>

---

**Next:** [Ch 31 — DSA & ML Coding (Java)](#content/31_dsa_coding) to put the language to work, or revisit [Ch 21 — OO Design & SOLID (Java)](#content/21_design_fundamentals) now that sealed types and records change how you'd model several of those patterns.
