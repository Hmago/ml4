# Chapter 38b — Modern Java: Language, Concurrency & Ecosystem

> "Java didn't stand still. Two LTS releases landed while you were away, and between them they changed how you model data and how you handle concurrency."

---

## What You'll Learn

After this chapter you will be able to:
- Write `var`, text blocks and switch expressions without looking them up
- Use the small Java 22–25 additions: `_` for unused variables, statements before `super(...)`, and `void main()`
- Replace a 40-line data class with a one-line **record**, and know when not to
- Model a closed set of types with **sealed** interfaces and switch over them exhaustively
- Destructure nested records in a `switch`, with `when` guards
- Use sequenced collections, and `Optional` the way it was intended
- Explain **virtual threads** — what they fix, when they don't help, and what "pinning" means
- Name what changed from Spring Boot 2 to Boot 3 and Boot 4, and why `jakarta.*` broke everyone's build
- Read a modern `pom.xml` / `build.gradle.kts`, write JUnit tests, and reason about G1 vs ZGC

**Markers:** ★★★ = know cold for interviews · ★★ = high priority · ★ = good to know.

**Quick check** boxes are retrieval practice — attempt before revealing.

**Interview** boxes give the question, what to say, and the follow-up trap.

> **This is the "catch me up" half.** Its companion, [Ch 38 — Java Refresher: Core & DSA Toolkit](#content/38_java_refresher), reloads the fundamentals you need for algorithm work — arrays, strings, collections, comparators and the traps. If your immediate goal is a coding interview, read that one and [Ch 31](#content/31_dsa_foundations) first; this chapter is what you need to be *employable on a 2026 codebase*.

> ⚠️ **On running the code.** Java on this page is **read-only**: the app's ▶ Run button runs Python only. (The [DSA practice](#dsa-practice) problems do run Java, on JDK 22.) Every Java block followed by **Output** is a complete program whose output was checked on **JDK 25**. To run one yourself, save it as `Name.java` and type `java Name.java` — a single source file needs no separate `javac` step. Short snippets have no Output. Two kinds of code need more than a plain JDK 25: **structured concurrency** (§38b.6) is still a *preview* API — seventh preview in Java 27 — so it needs `--enable-preview`; and the Spring, Maven/Gradle and JUnit code (§38b.7–38b.8) needs those libraries.

**Where each feature landed.** "Final" means usable without any flag. LTS = long-term-support release.

| Java (released) | Final features covered in this chapter | Section |
|---|---|---|
| 10 (Mar 2018) | `var` | §38b.1 |
| 14 (Mar 2020) | switch expressions and `yield` | §38b.1 |
| 15 (Sep 2020) | text blocks | §38b.1 |
| 16 (Mar 2021) | records, `instanceof` patterns, `Stream.toList()` | §38b.2, §38b.3, §38b.5 |
| **17 LTS** (Sep 2021) | sealed types | §38b.3 |
| **21 LTS** (Sep 2023) | pattern matching for `switch`, record patterns, virtual threads, sequenced collections | §38b.3, §38b.4, §38b.6 |
| 22 (Mar 2024) | unnamed variables and patterns (`_`) | §38b.1, §38b.3 |
| 24 (Mar 2025) | `synchronized` no longer pins virtual threads | §38b.6 |
| **25 LTS** (Sep 2025) | scoped values, statements before `super(...)`, module imports, `void main()` source files | §38b.1, §38b.6 |
| 26 (Mar 2026), 27 (Sep 2026) | no new final language features; structured concurrency and primitive patterns are still previews | §38b.6 |

As of November 2026, **Java 25 is the current LTS** and Java 27 is the newest release; the next LTS is planned for Java 29 in September 2027.

---

## 38b.1 Syntax You Missed — `var`, Text Blocks, Switch Expressions ★★

![Cheat-card infographic of four modern Java syntax features as before-and-after code: var (Java 10) replacing a long Map generic declaration, text blocks (Java 15) replacing escaped quotes and newline concatenation, switch expressions (Java 14) with case NEW, ACTIVE -> 0 and the compile error when PENDING is added, and Java 25 void main() with IO.println; a timeline of Java 10, 14, 15, 22 and 25; a pick-by-need table; and the trap that var with new ArrayList<>() gives ArrayList<Object>.](diagrams/java38b_info_syntax_you_missed_ai.png)

<details>
<summary><strong>Read as text</strong> — three features, when each landed and what it replaces</summary>

Three small features landed between Java 10 and Java 15, and together they change the *texture* of everyday Java more than any single big feature. None of them is conceptually hard. All three are things a 2026 reviewer will silently expect, and their absence is the fastest way to make code look like it was written in 2019. Four even smaller additions from Java 22–25 close the section.

| Feature | Arrived in | What it replaces |
|---|---|---|
| `var` | Java 10 (2018) | `Map<String, List<Order>> x = new HashMap<>();` |
| Text blocks | Java 15 (2020) | `"\"line\\n\" +` string concatenation soup |
| Switch expressions | Java 14 (2020) | `switch` statement + `break` + a mutable local |
| `yield` | Java 14 (2020) | assigning to a temp inside a `switch` arm |

</details>

---

### `var` — local type inference

#### Simple Explanation

<details>
<summary><strong>Read as text</strong> — what var is, where it is banned, the diamond trap and the style rule</summary>

`var` is not dynamic typing and it is not JavaScript's `var`. The variable still has one fixed type forever; you are just declining to write it out because the compiler can already read it off the right-hand side.

Think of it as the same deal you already accepted with the diamond operator in Java 7. When you wrote `new HashMap<>()` you let the compiler fill in the type arguments. `var` extends that from the right of the `=` to the left of it.

> **`var`** is local variable type inference: the compiler infers the static type of a local variable from its initialiser, and the variable is as strongly typed as if you had written the type by hand.

```java
// 2022 — how you'd have written it
Map<String, List<Order>> ordersByCustomer = new HashMap<>();
BufferedReader reader = new BufferedReader(new FileReader(path));
for (Map.Entry<String, List<Order>> e : ordersByCustomer.entrySet()) { }

// 2026 — how you'd write it now
var ordersByCustomer = new HashMap<String, List<Order>>();   // type arguments move to the right
var reader = new BufferedReader(new FileReader(path));
for (var e : ordersByCustomer.entrySet()) { }
```

**Where it is not allowed.** `var` needs an initialiser it can read a type from, and it only works for local variables (including `for` loops and try-with-resources). Each line below is a compile error; the right-hand column is the real message from javac 25:

| You write | javac says |
|---|---|
| `var field = 1;` (a field) | `'var' is not allowed here` |
| `void f(var x) { }` (a method parameter) | `'var' is not allowed here` |
| `var x;` | `cannot infer type for local variable x` (cannot use 'var' on variable without initializer) |
| `var x = null;` | same error (variable initializer is 'null') |
| `var f = () -> "hi";` | same error (lambda expression needs an explicit target-type) |
| `var a = { 1, 2, 3 };` | same error (array initializer needs an explicit target-type) |

Two facts people forget. `var` also works for lambda parameters — `(var a, var b) -> a + b` (Java 11) — which is useful only because it lets you annotate them. And `var` is a reserved type name, not a keyword, so old code with a variable *named* `var` still compiles.

> **Trap — `var` plus diamond.** `var list = new ArrayList<>();` compiles, but the diamond has nothing to infer from, so `list` is an `ArrayList<Object>` and `String s = list.get(0);` fails with "Object cannot be converted to String". With `var`, write the type argument on the right: `new ArrayList<String>()`.

**The style rule that actually matters:** use `var` when the right-hand side already names the type, and write the type out when it doesn't. `var users = new ArrayList<User>()` is obvious. `var result = process(input)` is not — the reader now has to go find `process`. That is the whole guideline.

</details>

---

### Text blocks — the end of escaped string soup

#### Simple Explanation

<details>
<summary><strong>Read as text</strong> — the idea, incidental whitespace and three details</summary>

A text block is a string literal delimited by `"""` that may span lines. Inside it, newlines are newlines and quotes are just quotes. It exists because embedding JSON, SQL, HTML or XML in Java used to require escaping every `"` and hand-concatenating every line, which meant the literal in your source looked nothing like the text it produced.

The one subtle part is **incidental whitespace**. Java looks at every non-blank line — plus the closing `"""` if it sits on its own line — finds the smallest common indentation, and strips exactly that much from every line. So you can indent the block to match the surrounding code and it costs you nothing in the output.

> A **text block** is a multi-line string literal that avoids most escape sequences and automatically strips incidental leading whitespace.

Three details worth knowing. Putting the closing `"""` right after the last character means **no trailing newline**; putting it on its own line adds one. A `\` at the end of a line **suppresses the line break**, which is how you write one long line legibly. And text blocks have no interpolation — fill in values with `.formatted(...)`. The program below puts the 2022 way and the 2026 way side by side and checks they produce the same string:

</details>

```java
// Text blocks: indentation is stripped, quotes need no escaping, a trailing \ joins lines
public class TextBlocks {
    public static void main(String[] args) {
        String old = "{\n"                                   // 2022 — how you'd have written it
                   + "  \"user\": \"ada\",\n"
                   + "  \"roles\": [\"admin\", \"dev\"],\n"
                   + "  \"active\": true\n"
                   + "}";
        String json = """
                {
                  "user": "ada",
                  "roles": ["admin", "dev"],
                  "active": true
                }""";
        String sql = """
                SELECT id, name FROM users \
                WHERE active = true \
                ORDER BY name""";
        String greeting = """
                Hello, %s!
                You have %d new messages.
                """.formatted("Ada", 3);

        System.out.println(json);
        System.out.println("same as the old literal? " + json.equals(old));
        System.out.println("line count = " + json.lines().count());
        System.out.println(sql);
        System.out.print(greeting);
        System.out.println("greeting ends with a newline? " + greeting.endsWith("\n"));
        if (!json.equals(old) || sql.contains("\n")) throw new AssertionError("text block mismatch");
    }
}
```

**Output:**

```
{
  "user": "ada",
  "roles": ["admin", "dev"],
  "active": true
}
same as the old literal? true
line count = 5
SELECT id, name FROM users WHERE active = true ORDER BY name
Hello, Ada!
You have 3 new messages.
greeting ends with a newline? true
```

<details>
<summary><strong>Read as text</strong> — continued: what the output shows and the string-template trap</summary>

The 16 spaces of indentation in the source were stripped, and the `\` version really is a single line — the indentation was removed, then the continuations joined. `greeting` ends with a newline because its closing `"""` sits on its own line.

> **Trap — string templates.** Blog posts from 2023 show `STR."Hello \{name}"`. That feature was a preview in Java 21 and 22 and was then **withdrawn** in Java 23; it does not exist in Java 25. Use `"...".formatted(...)` or `String.format`.

</details>

---

### Switch expressions — `switch` that returns a value

#### Simple Explanation

<details>
<summary><strong>Read as text</strong> — statement vs expression, the PENDING compile error and yield</summary>

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

The fourteen-line `switch` statement becomes a five-line expression, the `default` disappears because the compiler can see all four enum constants are covered, and — the real prize — if someone adds a `PENDING` constant to `Status`, the 2026 version stops compiling while the 2022 version quietly starts throwing at runtime. This is the real javac 25 error after adding `PENDING`:

```text
Pending.java:4: error: the switch expression does not cover all possible input values
        return switch (s) {
               ^
```

When an arm needs more than one expression, use a block and `yield` to hand back the value. A switch over an `int` or a `String` can never list every value, so there a `default` is required:

</details>

```java
// Switch expressions: arrow arms (no fall-through), several labels per case, and yield from a block
public class SwitchExpressions {
    enum Status { NEW, ACTIVE, SUSPENDED, CLOSED }

    static int retryDelay(Status s) {
        return switch (s) {          // no default: the compiler checks all four constants are covered
            case NEW, ACTIVE -> 0;
            case SUSPENDED   -> 30;
            case CLOSED      -> -1;
        };
    }

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

    public static void main(String[] args) {
        for (Status s : Status.values())
            System.out.printf("%-9s -> delay %d%n", s, retryDelay(s));
        for (int code : new int[] {204, 404, 503, 418})
            System.out.println(code + " -> " + httpBucket(code));
        if (retryDelay(Status.SUSPENDED) != 30) throw new AssertionError("SUSPENDED");
        if (!httpBucket(418).equals("client error 418")) throw new AssertionError("418");
    }
}
```

**Output:**

```
NEW       -> delay 0
ACTIVE    -> delay 0
SUSPENDED -> delay 30
CLOSED    -> delay -1
204 -> ok
404 -> missing
503 -> server error 503
418 -> client error 418
```

<details>
<summary><strong>Read as text</strong> — continued: the interview answer and the default trap</summary>

> **Interview —** *"What's the practical difference between a switch statement and a switch expression?"*
>
> **Say:** An expression yields a value and must be exhaustive, so the compiler enforces that every input is handled; a statement doesn't, so a missing case is a silent runtime bug. Arrow arms also remove fall-through, which removes the classic missing-`break` defect class. Then add the real motivation: exhaustiveness is what makes pattern matching over sealed types safe, so switch expressions are the foundation the Java 21 features are built on.
>
> **They follow up with:** *"Does `default` help or hurt?"* — On a closed enum or a sealed hierarchy it hurts. A `default` makes the switch trivially exhaustive, so adding a new case compiles cleanly and silently falls into `default` instead of failing the build. Omit it and let the compiler find every switch you need to update.

</details>

<details>
<summary><strong>Quick check.</strong> <code>var x = switch (n) { case 1 -&gt; "one"; default -&gt; 2; };</code> — what type is <code>x</code>, and does it compile?</summary>

It compiles. The `2` is boxed to `Integer`, and `x` gets the closest type that both `String` and `Integer` share — an intersection type that javac 25 prints as `Object & Serializable & Comparable<…> & Constable & ConstantDesc`. That type is nearly useless: `x.length()` fails with "cannot find symbol", and you can't do arithmetic on it either. It's a good illustration of why `var` plus a mixed-type expression is a bad combination — the compiler will happily infer a type nobody wanted. Give mixed-type expressions an explicit type, or don't mix types.
</details>

---

### Newer small syntax — Java 22 to 25

#### Simple Explanation

<details>
<summary><strong>Read as text</strong> — the four additions, with snippets and an interview tip</summary>

Four smaller changes became final after Java 21. None of them changes how you design code; each one removes a piece of ceremony that used to force you to write something you did not mean. You will see them in Java 25 codebases, so you should be able to read them.

> An **unnamed variable** `_` is a declaration that can never be read; **flexible constructor bodies** allow statements before `super(...)` or `this(...)`, as long as they do not read the object being built; a **module import** imports every package a module exports; a **compact source file** holds top-level methods and fields that the compiler wraps in an implicit class.

| Feature | Final in | Before | Now |
|---|---|---|---|
| Unnamed variable `_` | Java 22 | `catch (NumberFormatException e)` with `e` never used | `catch (NumberFormatException _)` |
| Statements before `super(...)` ("flexible constructor bodies") | Java 25 | validate inside `super(check(age))` with a static helper | `if (age < 18) throw ...;` then `super(...)` |
| Module import | Java 25 | a dozen `import java.util.*;`-style lines | `import module java.base;` |
| Compact source file + instance `main` | Java 25 | `public class Hello { public static void main(String[] args) { ... } }` | `void main() { IO.println("Hello"); }` |

```java
// Java 22+: _ marks a variable you must declare but never use
for (var _ : List.of(1, 2, 3)) count++;
try { return Integer.parseInt(s); } catch (NumberFormatException _) { return -1; }
map.computeIfAbsent(key, _ -> new ArrayList<>()).add(value);

// Java 25: validate BEFORE calling the superclass constructor (fail fast)
class Employee extends Person {
    Employee(String name, int age) {
        if (age < 18) throw new IllegalArgumentException("too young: " + age);
        super(name, age);            // code above super(...) may not call methods or read fields
    }
}
```

A **compact source file** is a whole program with no class declaration. It imports all of `java.base` (so `List`, `Map` and friends need no imports), and `IO.println` is the short form of `System.out.println`:

```java
// Hello.java — a complete Java 25 program. Run it with: java Hello.java
void main() {
    var words = List.of("pear", "fig", "apple");
    IO.println(words.stream().sorted().toList());   // prints [apple, fig, pear]
}
```

Both blocks were compiled and run on JDK 25 (the first one inside a small test class). With `--release 21`, javac rejects `_` with "unnamed variables are not supported in -source 21". `_` also works inside patterns, which is where you will use it most — see §38b.3.

> **Interview tip.** Write the classic `public static void main(String[] args)` in a coding interview unless you know the judge runs Java 25+. Online editors often run an older JDK, and a compile error on line 1 is a bad start.

</details>

<details>
<summary><strong>Quick check.</strong> Can code that runs before <code>super(...)</code> call an instance method of the object being built?</summary>

No. Code before `super(...)` or `this(...)` may validate arguments, compute local variables and (since Java 25) assign the class's own fields, but it may not otherwise use `this` — no instance method calls and no reading fields — because the superclass part of the object does not exist yet. Calling an instance method `describe()` there fails in javac 25 with "cannot reference describe() before supertype constructor has been called".
</details>

---

## 38b.2 Records — The Biggest Day-to-Day Change ★★★

![Infographic on Java records: a 30-line 2022 Point class with fields, constructor, getters, equals, hashCode and toString becomes record Point(int x, int y) in Java 16; the compiler emits private final fields, the canonical constructor, x() and y(), equals, hashCode and toString Point(x=3, y=4); a compact constructor turns Money.usd(1999) into Money(currency=USD, cents=1999) and rejects -5; a worked table where a == b is false but a.equals(b) is true and the set size is 1; when to use and not use records; and the trap that a List component leaks unless copied with List.copyOf.](diagrams/java38b_info_records_ai.png)

#### Simple Explanation

<details>
<summary><strong>Read as text</strong> — the idea and the definition</summary>

A record is a class whose entire job is to hold a few values, where you declare the values and the compiler writes everything else.

You have written this class hundreds of times: some final fields, a constructor that assigns them, a getter each, then `equals`, `hashCode` and `toString` that your IDE generated and nobody has read since. It is forty lines of code carrying about eight characters of actual information — the field names and their types. Worse, it is forty lines that can *rot*: add a field, forget to update `equals`, and you have a bug that only shows up when the object goes into a `HashSet`.

A record says: here are the components, that is the whole state, generate the rest. Records became final in Java 16, so every LTS from Java 17 on has them. Lombok existed to paper over this boilerplate; records replace most uses of Lombok's `@Value`, and they do it in the language rather than with annotation processing.

> A **record** is a transparent, shallowly immutable carrier for a fixed set of components; the compiler derives the canonical constructor, an accessor per component, and `equals`, `hashCode` and `toString` from the component list.

</details>

### The before/after that sells it

<details>
<summary><strong>Read as text</strong> — the 30-line 2022 class vs the one-line record</summary>

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

Now run it. Two separate `Point` objects with the same values behave as one value — in `equals`, in a `HashSet`, and as a `HashMap` key:

</details>

```java
// What a one-line record gives you: toString, accessors, and value-based equals/hashCode
import java.util.*;

public class RecordPoint {
    record Point(int x, int y) { }

    public static void main(String[] args) {
        Point a = new Point(3, 4);
        Point b = new Point(3, 4);                 // a different object with the same values

        Set<Point> set = new HashSet<>();
        set.add(a);
        set.add(b);                                // equal to a, so not added again
        Map<Point, String> names = new HashMap<>();
        names.put(a, "corner");

        System.out.println(a);
        System.out.println("a.x()       = " + a.x());
        System.out.println("a == b      = " + (a == b));
        System.out.println("a.equals(b) = " + a.equals(b));
        System.out.println("same hash   = " + (a.hashCode() == b.hashCode()));
        System.out.println("set size    = " + set.size());
        System.out.println("lookup by b = " + names.get(b));
        if (!a.equals(b) || set.size() != 1 || names.get(b) == null)
            throw new AssertionError("value equality broken");
    }
}
```

**Output:**

```
Point[x=3, y=4]
a.x()       = 3
a == b      = false
a.equals(b) = true
same hash   = true
set size    = 1
lookup by b = corner
```

<details>
<summary><strong>Read as text</strong> — continued: what the run shows</summary>

`a == b` is `false` (two objects), but everything that matters for data says "same value". The hand-written 2022 class gives the same `toString`, `equals`, hash and set-size results — its `toString` was copying the format records produce.

</details>

### What the compiler generates

<details>
<summary><strong>Read as text</strong> — the generated members, accessor naming and the mental shift</summary>

| From `record Point(int x, int y)` the compiler emits | Looks like |
|---|---|
| one `private final` field per component | `private final int x; private final int y;` |
| the canonical constructor | `Point(int x, int y)` |
| one accessor per component — **not** `getX()` | `x()` and `y()` |
| `equals` comparing every component | `new Point(3, 4).equals(new Point(3, 4))` is `true` |
| `hashCode` combining every component | equal points give equal hashes |
| `toString` listing every component | `Point[x=3, y=4]` |
| the class itself | a `final class` extending `java.lang.Record` |

The accessor naming is the one thing that trips people up in review: a record has `x()`, not `getX()`. Frameworks caught up years ago — Jackson and Spring read record components fine, and JPA can use records for query results and embedded values (never as entities — see §38b.7).

There is a mental shift buried in that table, and it is worth naming. In 2022 a data class was a *class you happened to use as data*: it had encapsulation, it could grow behaviour, and its identity semantics were whatever you last generated. A record is a declaration that this type **is** its components — nothing hidden, nothing derived, equality by value. The compiler will hold you to that, which is precisely why it can generate the rest safely. If you were using Lombok's `@Value` to fake this, records replace it with a language feature that needs no annotation processor, no IDE plugin, and no build-order surprises.

One more consequence: because a record's state is fully described by its component list, the compiler can also take one *apart* again. That is what makes record patterns in §38b.3 possible. Records and pattern matching were designed as one feature and shipped in two halves — records in Java 16, record patterns in Java 21 — and the destructuring only works because the construction is transparent.

</details>

### Compact constructors — validation without repetition

<details>
<summary><strong>Read as text</strong> — how the compact form works</summary>

You rarely want to rewrite the whole canonical constructor. The **compact form** omits the parameter list and the assignments; you only write the checks and any normalisation, and the compiler appends `this.x = x;` for each component at the end.

</details>

```java
// Compact constructor: validate and normalise the arguments before the fields are assigned
import java.util.*;

public class MoneyRecord {
    interface Priced { String display(); }

    record Money(String currency, long cents) implements Priced {
        Money {                                              // compact constructor: no parameter list
            Objects.requireNonNull(currency, "currency");
            if (cents < 0) throw new IllegalArgumentException("negative: " + cents);
            currency = currency.toUpperCase(Locale.ROOT);    // reassign the PARAMETER
        }                                                    // compiler adds: this.currency = currency; this.cents = cents;

        static Money usd(long cents) { return new Money("usd", cents); }

        Money plus(Money other) {
            if (!currency.equals(other.currency))
                throw new IllegalArgumentException("mixed currency");
            return new Money(currency, cents + other.cents);
        }

        public String display() { return String.format("%s %d.%02d", currency, cents / 100, cents % 100); }
    }

    public static void main(String[] args) {
        Money price = Money.usd(1999);
        System.out.println(price + " -> " + price.display());
        System.out.println(price.plus(Money.usd(1)).display());
        try {
            new Money("usd", -5);
            throw new AssertionError("a negative amount was accepted");
        } catch (IllegalArgumentException e) {
            System.out.println("rejected: " + e.getMessage());
        }
        try {
            price.plus(new Money("eur", 100));
            throw new AssertionError("mixed currencies were added");
        } catch (IllegalArgumentException e) {
            System.out.println("rejected: " + e.getMessage());
        }
        if (!price.currency().equals("USD")) throw new AssertionError("not normalised");
    }
}
```

**Output:**

```
Money[currency=USD, cents=1999] -> USD 19.99
USD 20.00
rejected: negative: -5
rejected: mixed currency
```

<details>
<summary><strong>Read as text</strong> — continued: normalisation and the final-field rule</summary>

The lowercase `"usd"` came out as `USD`, and the negative amount was rejected before the object existed. Note `currency = currency.toUpperCase(Locale.ROOT)` assigns to the *parameter*, not the field — that is how normalisation works in a compact constructor. Writing `this.cents = cents;` there instead is a compile error ("cannot assign a value to final variable cents"), because the compiler does that assignment for you. Records can implement interfaces, declare static factories, and add any instance methods you like.

</details>

### What records cannot do

<details>
<summary><strong>Read as text</strong> — the five restrictions and the two traps</summary>

| Restriction | Why | Workaround |
|---|---|---|
| Cannot extend a class | Every record already extends `java.lang.Record` | Implement an interface instead |
| Cannot be subclassed | Records are implicitly `final`, so value equality stays simple | Use a **sealed interface** over several records (§38b.3) |
| No extra instance fields | The component list *is* the state — that's what makes `equals` trustworthy (javac: "field declaration must be static") | Compute it in a method, or add a `static` field |
| Immutability is **shallow** | A `final List` reference can still point at a mutable list | Defensive copy in the compact constructor |
| An array component breaks `equals` | Arrays compare by reference, not by contents | Use a `List`, or override `equals`/`hashCode` with `Arrays.equals`/`Arrays.hashCode` |

The last two rows are the traps worth demonstrating. `record Order(String id, List<String> items)` gives you a final *reference*, not an immutable list — and an `int[]` component makes two records with the same numbers unequal:

</details>

```java
// Records are only SHALLOWLY immutable: a List component leaks unless copied; an array breaks equals
import java.util.*;

public class RecordTraps {
    record LeakyOrder(String id, List<String> items) { }

    record Order(String id, List<String> items) {
        Order { items = List.copyOf(items); }      // defensive copy, and the copy is unmodifiable
    }

    record Scores(int[] values) { }                // array component: equals compares references

    public static void main(String[] args) {
        List<String> cart = new ArrayList<>(List.of("pen"));
        var leaky = new LeakyOrder("A1", cart);
        var safe  = new Order("A2", cart);
        cart.add("SMUGGLED");                      // the caller still holds the original list
        System.out.println("leaky = " + leaky);
        System.out.println("safe  = " + safe);
        try {
            safe.items().add("x");
        } catch (UnsupportedOperationException e) {
            System.out.println("safe.items().add(...) -> UnsupportedOperationException");
        }

        var s1 = new Scores(new int[] {1, 2});
        var s2 = new Scores(new int[] {1, 2});
        System.out.println("s1.equals(s2)      = " + s1.equals(s2));
        System.out.println("Arrays.equals(...) = " + Arrays.equals(s1.values(), s2.values()));
        if (safe.items().size() != 1 || leaky.items().size() != 2 || s1.equals(s2))
            throw new AssertionError("unexpected record behaviour");
    }
}
```

**Output:**

```
leaky = LeakyOrder[id=A1, items=[pen, SMUGGLED]]
safe  = Order[id=A2, items=[pen]]
safe.items().add(...) -> UnsupportedOperationException
s1.equals(s2)      = false
Arrays.equals(...) = true
```

<details>
<summary><strong>Read as text</strong> — continued: why List.copyOf closes the hole</summary>

`List.copyOf` both copies and returns an unmodifiable list, so it closes the hole from both directions: the caller's later changes don't reach the record, and nobody can change the list through the accessor. (It also rejects `null` elements with a `NullPointerException`.) Use `Set.copyOf` and `Map.copyOf` the same way. For an array, `clone()` in the compact constructor stops the leak but not the `equals` problem — prefer a `List`.

</details>

### Where records earn their keep

<details>
<summary><strong>Read as text</strong> — DTOs, keys, multiple returns, local records, and when not to use one</summary>

- **DTOs and API payloads.** Request and response bodies are exactly "a fixed set of values." This is the single most common use.
- **Map and set keys.** You get a correct `equals`/`hashCode` pair for free — which quietly removes one of the top sources of "the value I just put in isn't there" bugs (the hand-written version of that bug is in [Ch 38 §38.7](#content/38_java_refresher)). A `record Cell(int row, int col)` as a `HashMap` key or in a `visited` set is a genuinely useful trick even in algorithm work.
- **Multiple return values.** No more out-parameters, `int[]` of length two, or a generic `Pair` class:

```java
record MinMax(int min, int max) { }

static MinMax scan(int[] xs) {
    int lo = xs[0], hi = xs[0];
    for (int v : xs) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
    return new MinMax(lo, hi);
}
// scan(new int[] {4, -3, 12, 0})  ->  MinMax[min=-3, max=12]
```

- **Local records.** A record can be declared *inside a method*, scoped to that method alone. This is perfect for a temporary shape you need for one sort or one grouping and don't want polluting the package. A local record is implicitly `static`, so it cannot read the method's local variables:

```java
record Entry(String word, int count) { }   // declared inside main()
var top = new ArrayList<>(List.of(new Entry("a", 2), new Entry("b", 3), new Entry("c", 1)));
top.sort(Comparator.comparingInt(Entry::count).reversed());
// [Entry[word=b, count=3], Entry[word=a, count=2], Entry[word=c, count=1]]
```

> **Interview —** *"When would you NOT use a record?"*
>
> **Say:** Four cases. When the type has identity rather than value — a JPA `@Entity` with a lifecycle and a generated id is the classic one, and it also needs a no-arg constructor and mutable fields. When you need mutability, such as a builder or an accumulator. When the state isn't fully captured by the components — records give you no place to hide a lazily computed cache or a derived field. And when you need inheritance, since records are implicitly final. Then add the honest caveat: a record publishes its whole state through accessors, so if the fields are an implementation detail you intend to change, a normal class keeps that freedom.
>
> **They follow up with:** *"Is a record immutable?"* — Shallowly. The component fields are final, but a `List` or array component is still mutable through the reference you were handed and the one you hand back. `List.copyOf` in the compact constructor is the fix, and it's a real review comment, not a theoretical one. Bonus point: an array component also makes `equals` compare references, so two records holding the same numbers are not equal.

</details>

<details>
<summary><strong>Quick check.</strong> Why does <code>record Point(int x, int y)</code> work correctly as a <code>HashMap</code> key when the equivalent hand-written class so often doesn't?</summary>

Because `equals` and `hashCode` are derived from the component list by the compiler, so they cannot drift out of sync with the fields. In a hand-written class the usual failure is adding a field and updating `equals` but not `hashCode` (or neither) — the object then lands in a different bucket from its equal twin and `get` returns `null` for a key you just inserted. A record makes that bug unrepresentable, because there is no way to add state the generated methods don't see.
</details>

---

## 38b.3 Sealed Types and Pattern Matching ★★★

![Infographic on Java sealed types and pattern matching: sealed interface Expr permits Num, Neg, Add, Mul, Div drawn as a tree; a switch over it with record patterns and no default that the compiler checks for all 5 cases; adding a new subtype breaks a 2022 if-else chain at run time with IllegalStateException but fails the 2026 sealed switch at build time with 'does not cover all possible input values'; a version timeline 16, 17, 21, 22, 27; worked outputs eval of ((2 + 3) * -(10 / 4)) = -12.5 and simplify to (5 * -(10 / 4)); and the trap that a default silences the exhaustiveness check.](diagrams/java38b_info_sealed_pattern_matching_ai.png)

#### Simple Explanation

<details>
<summary><strong>Read as text</strong> — one idea in three hats, the exhaustiveness rule and the version table</summary>

This is the section that matters most, and it is really one idea wearing three hats.

Records let you say "this data is exactly these values." Sealed types let you say "this thing is exactly one of these cases." Pattern matching lets you take such a value apart and branch on which case it is — and because the compiler knows the case list is closed, it can *prove* you handled all of them.

The analogy: a normal `interface` is an open invitation — anyone anywhere can implement it, so the compiler can never tell you what the possibilities are. A `sealed` interface is a guest list. Once the compiler has the guest list, `switch` stops being a lookup table and becomes a total function over the possibilities, checked at compile time.

If you've used Kotlin's sealed classes, Rust's `enum`, TypeScript's discriminated unions, or Scala's case classes, this is the same idea. In type-theory terms a record is a *product type* (this AND that) and a sealed interface is a *sum type* (this OR that); together they give Java **algebraic data types**, and the Java team calls the style built on them *data-oriented programming*. It is arguably the biggest change to how you model data since generics.

> A **sealed** type restricts which classes may extend or implement it; **pattern matching** tests a value's shape, binds its parts to variables, and — over a sealed hierarchy — lets the compiler verify a `switch` is exhaustive.

> **Maths in one line:** `exhaustive ⇔ every permitted subtype has an unguarded case` — the compiler reads the `permits` list and checks you handled each entry; a case with a `when` guard never counts, because the guard might be false.

Build it in five steps. The pieces arrived over several releases; steps 1–5 are all final in Java 21, so any LTS from 21 on (21 or the current 25) has them:

| Step | Feature | Final in |
|---|---|---|
| 1 | `instanceof` patterns — test and bind in one go | Java 16 |
| 2 | Sealed classes and interfaces | Java 17 |
| 3 | Pattern matching for `switch` + exhaustiveness | Java 21 |
| 4 | Record patterns — destructuring | Java 21 |
| 5 | `when` guards and `case null` | Java 21 |
| — | Unnamed pattern `_` ("match, don't bind") | Java 22 |
| — | Primitive type patterns (`case int i`) | **still preview** in Java 27 (JEP 532, Sept 2026) |

Primitive patterns need `--enable-preview`, so keep them out of production code and interview answers unless asked.

</details>

### 1. `instanceof` patterns (Java 16) — the cast disappears

<details>
<summary><strong>Read as text</strong> — test-and-bind, the negated early return and the || scope trap</summary>

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

Both versions of the first example behave identically: `"hi"` gives `short string: hi`, `"hello"` gives `long string: HELLO`, and `21` gives `int doubled: 42`.

The one scope trap: `&&` works because the right side only runs when the test passed, but `o instanceof String s || s.isEmpty()` does not compile ("cannot find symbol: variable s") — on the right of `||` the test has *failed*, so there is no `s`.

</details>

### 2. Sealed types (Java 17) — you own the hierarchy

<details>
<summary><strong>Read as text</strong> — permits, final / sealed / non-sealed and why records fit</summary>

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

The rules, briefly. Every permitted subtype must be in the same module as the sealed type (or, if your code is not in a named module — most applications — the same package), and each one must itself declare whether it is `final`, `sealed`, or `non-sealed` — `non-sealed` deliberately re-opens that branch. Records are implicitly `final`, so a sealed interface over records needs no extra keywords, which is why the two features are almost always used together. If the subtypes are in the same file, you can omit `permits` entirely and the compiler infers it.

`non-sealed` is the escape hatch, and it is more useful than it first looks. You can seal the top of a hierarchy — so the *categories* are fixed — while leaving one category open for extension. A `sealed interface Response permits Ok, Redirect, Error` where `Error` is `non-sealed` says "there are exactly three kinds of response, and errors are extensible." Switches still get exhaustiveness over the three categories.

The other thing a sealed type buys you is documentation that cannot go stale. `permits Circle, Square, Triangle` is the complete list of what this abstraction can be, written in the one place a reader is guaranteed to look, and enforced by the compiler rather than by a comment.

</details>

### 3. Pattern matching for `switch` (Java 21) — and exhaustiveness

<details>
<summary><strong>Read as text</strong> — 2022 if-chain vs 2026 switch, the build error, guards and MatchException</summary>

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

That final `throw` in the 2022 version is the tell. It exists because the author could not prove the chain was complete, so they left a runtime trapdoor for a case they hoped would never happen. The 2026 version doesn't need one, because there is no fourth possibility. The compiler would still *accept* a `default` there — and that is exactly why you should leave it out (see the Interview box at the end of this section).

**Here is the property worth the entire feature.** Add `Pentagon` to `permits` and leave the switch alone. It doesn't compile — this is the real JDK 25 error:

```text
Shapes.java:10: error: the switch expression does not cover all possible input values
        return switch (s) {
               ^
1 error
```

Extending the model turns every incomplete switch in the codebase into a compile error with a file and line number. In the 2022 version, the same change compiles cleanly and throws in production the first time a pentagon shows up. Exhaustiveness converts a class of runtime bug into a build failure — which is the same trade generics made in Java 5, applied to control flow instead of containers.

**Guards don't count.** A switch whose only `Integer` arm is `case Integer i when i > 0` fails with the same "does not cover all possible input values" error, because the compiler cannot know the guard is always true. Every type needs one unguarded arm (or a `default`).

There is one runtime backstop worth knowing about. Exhaustiveness is checked when the switch is compiled, so if the sealed interface is later recompiled with a new subtype and the switch is *not* recompiled against it, the guarantee has a hole. Java 21 closed it with `java.lang.MatchException`: a pattern switch that finds no matching case at runtime throws rather than silently returning garbage. You should never see one in a normally built project — it means your compiled artefacts are out of step — but it explains why the compiler is comfortable letting you omit `default`.

</details>

### 4. Record patterns (Java 21) — destructuring

<details>
<summary><strong>Read as text</strong> — a type pattern vs a record pattern</summary>

A type pattern binds the whole object. A **record pattern** takes it apart and binds the components, and it nests:

</details>

```java
// Record patterns: take nested records apart inside a switch, with a when-guard
import java.util.List;

public class FigureDemo {
    record Point(int x, int y) { }
    sealed interface Figure permits Line, Dot, Poly { }
    record Line(Point from, Point to) implements Figure { }
    record Dot(Point at) implements Figure { }
    record Poly(List<Point> vertices) implements Figure { }

    static String describe(Figure f) {
        return switch (f) {
            case Line(Point(var x1, _), Point p2)          // _ = match, don't bind
                    when x1 == p2.x() -> "vertical line at x=" + x1;
            case Line(Point(var x1, var y1), Point(var x2, var y2))
                    -> "line (" + x1 + "," + y1 + ")->(" + x2 + "," + y2 + ")";
            case Dot(Point(var x, var y)) -> "dot at " + x + "," + y;
            case Poly(List<Point> vs)     -> "poly with " + vs.size() + " vertices";
        };
    }

    public static void main(String[] args) {
        List<Figure> figures = List.of(
                new Line(new Point(2, 0), new Point(2, 9)),
                new Line(new Point(0, 0), new Point(3, 4)),
                new Dot(new Point(7, 7)),
                new Poly(List.of(new Point(0, 0), new Point(4, 0), new Point(0, 3))));
        for (Figure f : figures) System.out.println(describe(f));

        String first = describe(figures.get(0));
        if (!first.startsWith("vertical")) throw new AssertionError("guarded case must win");
    }
}
```

**Output:**

```
vertical line at x=2
line (0,0)->(3,4)
dot at 7,7
poly with 3 vertices
```

<details>
<summary><strong>Read as text</strong> — continued: nested patterns, var, _ and the guarded arm first</summary>

`Line(Point(var x1, _), Point p2)` reaches two levels down in one pattern, and you can mix depths freely — destructure the first component, keep the second whole. `var` inside a pattern is idiomatic and carries no ambiguity, because the record already declares the component type. The `_` (Java 22+) matches a component you don't need, so no unused variable is declared. The guarded `Line` arm comes first; the unguarded `Line` arm after it is what makes the switch exhaustive. Record patterns work in `instanceof` too: `if (o instanceof Point(int x, int y))` tests and unpacks in one step.

</details>

### 5. `when` guards and `case null`

<details>
<summary><strong>Read as text</strong> — guards in order, the dominance check, the band table and case null</summary>

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

The compiler enforces the ordering: put `case Integer i` before `case Integer i when i > 100` and it rejects the second with "this case label is dominated by a preceding case label" — a dominance check you get for free.

What `band` returns, checked on JDK 25:

| Input | Arm that fires | Result |
|---|---|---|
| `null` | `case null` | `nothing at all` |
| `500` | first guard | `big int 500` |
| `42` | second guard | `medium int 42` |
| `3` | unguarded `Integer` | `small int 3` |
| `"  "` | guarded `String` | `blank string` |
| `"hello"` | unguarded `String` | `string of 5` |
| `2.5` | `default` | `other: Double` |

**Null.** The old `switch` threw `NullPointerException` on a null selector, always. A pattern switch keeps that default *unless* you write `case null`, which lets you fold the null branch into the same construct instead of guarding around it. Leave `case null` out and the NPE is still there:

```java
static String strict(Object o) {
    return switch (o) {            // no case null
        case Integer i -> "int";
        default        -> "other";
    };
}
// strict(null) throws NullPointerException — default does NOT catch null
```

When null and "anything else" should share an arm, write `case null, default -> ...`.

</details>

### Putting it together: an expression evaluator

<details>
<summary><strong>Read as text</strong> — three operations, five node types, zero default arms</summary>

Sealed interface, records for the cases, pattern switch for every operation. This is the canonical shape of the whole feature set. `eval` computes a value; `simplify` does constant folding, which is where destructuring really pays, because you match on the *shape* of the tree rather than interrogating it; `show` prints it. Three operations, five node types, zero `default` arms:

</details>

```java
// A sealed Expr tree: eval and simplify are exhaustive switches over record patterns
public class ExprDemo {
    sealed interface Expr permits Num, Neg, Add, Mul, Div { }
    record Num(double value)          implements Expr { }
    record Neg(Expr operand)          implements Expr { }
    record Add(Expr left, Expr right) implements Expr { }
    record Mul(Expr left, Expr right) implements Expr { }
    record Div(Expr left, Expr right) implements Expr { }

    static double eval(Expr e) {
        return switch (e) {                        // no default: the compiler checks all 5
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

    static Expr simplify(Expr e) {                 // match on the SHAPE of the tree
        return switch (e) {
            case Add(Num(double a), Num(double b))  -> new Num(a + b);
            case Mul(Num(double a), Num(double b))  -> new Num(a * b);
            case Mul(Num(double a), _) when a == 0  -> new Num(0);
            case Add(Expr l, Expr r) -> new Add(simplify(l), simplify(r));
            case Mul(Expr l, Expr r) -> new Mul(simplify(l), simplify(r));
            case Div(Expr l, Expr r) -> new Div(simplify(l), simplify(r));
            case Neg(Expr inner)     -> new Neg(simplify(inner));
            case Num n               -> n;
        };
    }

    static String show(Expr e) {
        return switch (e) {
            case Num(double v)       -> v % 1 == 0 ? String.valueOf((long) v) : String.valueOf(v);
            case Neg(Expr x)         -> "-" + show(x);
            case Add(Expr l, Expr r) -> "(" + show(l) + " + " + show(r) + ")";
            case Mul(Expr l, Expr r) -> "(" + show(l) + " * " + show(r) + ")";
            case Div(Expr l, Expr r) -> "(" + show(l) + " / " + show(r) + ")";
        };
    }

    public static void main(String[] args) {
        Expr e = new Mul(new Add(new Num(2), new Num(3)), new Neg(new Div(new Num(10), new Num(4))));
        Expr s = simplify(e);
        System.out.println(show(e) + " = " + eval(e));
        System.out.println("simplified: " + show(s) + " = " + eval(s));
        System.out.println("0 * x  ->  " + show(simplify(new Mul(new Num(0), e))));
        if (eval(s) != eval(e)) throw new AssertionError("simplify must not change the value");
        try { eval(new Div(new Num(1), new Num(0))); }
        catch (ArithmeticException ex) { System.out.println("caught: " + ex.getMessage()); }
    }
}
```

**Output:**

```
((2 + 3) * -(10 / 4)) = -12.5
simplified: (5 * -(10 / 4)) = -12.5
0 * x  ->  0
caught: divide by zero
```

<details>
<summary><strong>Read as text</strong> — continued: reading the simplify and divide-by-zero lines</summary>

Read the second line closely: `simplify` folded `(2 + 3)` into `5` but left `10 / 4` alone, because there is no `Div(Num, Num)` arm — the patterns say exactly which shapes get folded. The third line is the `Mul(Num(double a), _) when a == 0` arm: zero times anything folds to `0` without even looking at the right side. The divide-by-zero check matters because Java's `double` division would otherwise quietly return `Infinity`.

</details>

### This replaces the Visitor pattern

<details>
<summary><strong>Read as text</strong> — double dispatch, the expression problem and the interview answer</summary>

Before Java 21, the textbook way to add operations like `eval`, `simplify` and `show` to a fixed set of node types was the **Visitor** pattern: a `Visitor<R>` interface with one `visitNum`, `visitAdd`, … method per node type, an `accept(Visitor<R> v)` method on every node that calls back the right one (*double dispatch*), and one visitor class per operation. That is a few dozen lines of plumbing before any real logic, and every new node type means editing the visitor interface and every implementation of it.

Visitor exists to solve exactly one problem: adding a new *operation* over a fixed set of types, in a language that can't switch over types. Java can now switch over types. So the double-dispatch ceremony collapses into a `switch`, and you get the same compile-time completeness guarantee that made Visitor worth the ceremony in the first place.

The trade-off is the classic **expression problem**, and it is worth being able to state it:

| | Adding a new *type* | Adding a new *operation* |
|---|---|---|
| Visitor / sealed switch | edit every operation | just write a new method |
| Polymorphic methods on the interface | just write a new class | edit every class |

Sealed types plus pattern matching pick the first column, and the compiler tells you exactly which switches to edit. Ordinary polymorphism picks the second. Choose by which axis your model actually changes: a closed domain model with many operations wants sealed types; an open plugin-style hierarchy still wants interface methods.

> **Interview —** *"Why does exhaustiveness matter? Couldn't you just add a `default` that throws?"*
>
> **Say:** A `default` moves the failure from compile time to run time, and worse, it makes the switch *look* complete to the compiler, so adding a subtype produces no warning anywhere. With a sealed hierarchy and no `default`, adding a case turns every switch that needs updating into a build error with a line number — the compiler becomes the checklist. That's the same guarantee Rust's `match` and Kotlin's exhaustive `when` give you, and it's why sealed types (Java 17) were designed hand in hand with pattern matching for `switch` (Java 21).
>
> **They follow up with:** *"What if the hierarchy has to stay open?"* — Then don't seal it; use `non-sealed` on the branch that must be extensible, or keep polymorphic methods on the interface. Sealing is a modelling decision about whether the set of cases is closed, not a default to apply everywhere.

</details>

<details>
<summary><strong>Quick check.</strong> You have <code>sealed interface Shape permits Circle, Square</code> and an exhaustive switch with no <code>default</code>. A colleague adds <code>Triangle</code>. What happens, and what would have happened in Java 11?</summary>

The build breaks with "the switch expression does not cover all possible input values", pointing at every switch that needs a new arm. You fix them, and you are done — the compiler enumerated the work for you.

In Java 11 the equivalent `if / else if` chain would compile without complaint. The new triangle would fall through to whatever the final `else` did: return a wrong default, or throw an `IllegalStateException` in production. The bug ships, and you find it from a stack trace instead of from a build log.
</details>

---

## 38b.4 Sequenced Collections and `Optional` Done Right ★★

![Infographic on Java 21 sequenced collections and Optional: the list zero, a, b, c, end with getFirst() and getLast() at its ends and reversed() shown as a live O(1) view end, c, b, a, zero that also shows a later list.add of an exclamation mark; an Optional pipeline findUser, map(User::email), filter, map(domain), orElse(unknown) where u1 gives example.com and u2 with a null email and missing u9 give unknown; a table showing orElse ran the default 1x when present while orElseGet ran it 0x when present and 1x when empty; and the trap that reversed() is a view, not a copy.](diagrams/java38b_info_sequenced_optional_ai.png)

#### Simple Explanation

<details>
<summary><strong>Read as text</strong> — two rough edges, what sequenced means and the O(1) view</summary>

Two long-standing rough edges, one closed by the language and one closed only by discipline.

The first: Java's collections have always had a notion of order, but no shared vocabulary for it. `List` had `get(0)`; `Deque` had `getFirst()`; `LinkedHashSet` had neither and made you copy the whole set or iterate it to reach an end. Java 21 finally added the interfaces that should have existed in 1998.

The second: `Optional` has been around since Java 8, but the habits around it are still wrong more often than right — usually because people treat it as a null-safe *container* rather than as a return-type contract that says "this lookup may find nothing."

> **Sequenced collections** (Java 21) add `SequencedCollection`, `SequencedSet` and `SequencedMap`, giving every ordered collection a uniform first/last/reverse API.

> **Maths in one line:** `set.getLast()` on a `LinkedHashSet`: $O(n)$ scan → $O(1)$; `list.reversed()`: $O(n)$ copy → $O(1)$ view — the reverse is a window onto the same data, not a new list.

</details>

### Sequenced collections

<details>
<summary><strong>Read as text</strong> — the API table, 2022 vs 2026 and the three traps</summary>

| Interface | Implemented by | Key methods |
|---|---|---|
| `SequencedCollection` | `List`, `Deque`, `LinkedHashSet`, `SortedSet` | `getFirst`, `getLast`, `addFirst`, `addLast`, `removeFirst`, `removeLast`, `reversed` |
| `SequencedSet` | `LinkedHashSet`, `SortedSet` | same, plus `reversed()` returns a `SequencedSet` |
| `SequencedMap` | `LinkedHashMap`, `SortedMap` | `firstEntry`, `lastEntry`, `pollFirstEntry`, `putFirst`, `putLast`, `sequencedKeySet`, `reversed` |

`HashSet` and `HashMap` are **not** sequenced — they have no defined order, so there is no "first" to get.

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

On a `LinkedHashSet` the peeks went from $O(n)$ with an allocation to $O(1)$ with none (on a `TreeSet`, `getFirst` is the old `first()`, $O(\log n)$). Each result below was checked on JDK 25:

```java
List<String> list = new ArrayList<>(List.of("a", "b", "c"));
list.addFirst("zero");                    // [zero, a, b, c]
list.addLast("end");                      // [zero, a, b, c, end]
List<String> rev = list.reversed();       // [end, c, b, a, zero]  — a live VIEW
list.add("!");                            // rev is now [!, end, c, b, a, zero]

var set = new LinkedHashSet<>(List.of("x", "y", "z"));
set.getFirst(); set.getLast();            // "x", "z" — O(1), no copy
set.addFirst("z");                        // existing element MOVES: [z, x, y]

var map = new LinkedHashMap<String, Integer>();
map.put("one", 1); map.put("two", 2);
map.putFirst("zero", 0);                  // {zero=0, one=1, two=2}
map.firstEntry(); map.lastEntry();        // zero=0, two=2
map.reversed();                           // {two=2, one=1, zero=0}
```

The traps, in the order they bite:

1. **`reversed()` is a live view, not a copy.** Adding `"!"` to the backing list made it appear at the front of `rev`, and writes through the view land in the original. Cheap, but aliasing — wrap it in `new ArrayList<>(...)` if you need a snapshot.
2. **`getFirst()` on an empty collection throws `NoSuchElementException`.** `Deque.peekFirst()` is still the null-returning version.
3. **`addFirst` / `addLast` throw `UnsupportedOperationException`** on unmodifiable lists (`List.of(...)`) and on sorted collections (`TreeSet`), where the comparator, not you, decides the position.

</details>

### `Optional`, done right

<details>
<summary><strong>Read as text</strong> — the do / don't table, newer methods and orElse vs orElseGet</summary>

The rules are short and they are the ones that come up in review:

| Do | Don't |
|---|---|
| Return `Optional` from a lookup that may find nothing | Take `Optional` as a **parameter** — overload or accept null instead |
| Chain with `map`, `flatMap`, `filter` | Store `Optional` in a **field** — it isn't `Serializable` and adds a wrapper per instance |
| End with `orElse`, `orElseGet`, `orElseThrow`, `ifPresentOrElse` | Call `get()` blind — on an empty `Optional` it throws `NoSuchElementException`, the null check you forgot with extra steps |
| Use it for a single missing value | Return `Optional<List<T>>` — return an empty list |

If you last used `Optional` on Java 8, five methods arrived since: `or` and `ifPresentOrElse` and `stream` (Java 9), no-argument `orElseThrow()` (Java 10 — the honest name for `get()`), and `isEmpty` (Java 11).

The old way, for comparison:

```java
// 2022 — how you'd have written it
User u = DB.get("u1");
String domain = "unknown";
if (u != null && u.email() != null) {
    int at = u.email().indexOf('@');
    if (at >= 0) domain = u.email().substring(at + 1);
}
```

The 2026 version is the `domain` method in the program below. It also settles the question people get wrong most often.

**`orElse` vs `orElseGet`.** `orElse` takes a *value*, so its argument is evaluated eagerly — every time, even when the `Optional` is present. `orElseGet` takes a *supplier*, invoked only when empty. With a constant it doesn't matter; with a database call or an object allocation it very much does. Proof, with a default that counts its own calls:

</details>

```java
// Optional as a return type: chain map/filter, end with orElse - and see that orElse is EAGER
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

public class OptionalDemo {
    record User(String name, String email) { }
    static final Map<String, User> DB = Map.of(
            "u1", new User("ada", "ada@example.com"),
            "u2", new User("alan", null));
    static int defaultCalls = 0;

    static Optional<User> findUser(String id) { return Optional.ofNullable(DB.get(id)); }

    static String expensiveDefault() { defaultCalls++; return "fallback"; }

    static String domain(String id) {
        return findUser(id)
                .map(User::email)                 // a null email becomes empty
                .filter(e -> e.contains("@"))
                .map(e -> e.substring(e.indexOf('@') + 1))
                .orElse("unknown");
    }

    public static void main(String[] args) {
        for (String id : new String[] {"u1", "u2", "u9"})
            System.out.println(id + " -> " + domain(id));

        Optional<String> present = Optional.of("ada@example.com");
        Optional<String> empty = Optional.empty();
        present.orElse(expensiveDefault());
        System.out.println("orElse,    present: default ran " + defaultCalls + "x");
        defaultCalls = 0;
        present.orElseGet(OptionalDemo::expensiveDefault);
        System.out.println("orElseGet, present: default ran " + defaultCalls + "x");
        empty.orElseGet(OptionalDemo::expensiveDefault);
        System.out.println("orElseGet, empty:   default ran " + defaultCalls + "x");
        if (defaultCalls != 1) throw new AssertionError("orElseGet must be lazy");

        try { empty.get(); }
        catch (NoSuchElementException ex) { System.out.println("empty.get() -> " + ex.getMessage()); }
    }
}
```

**Output:**

```
u1 -> example.com
u2 -> unknown
u9 -> unknown
orElse,    present: default ran 1x
orElseGet, present: default ran 0x
orElseGet, empty:   default ran 1x
empty.get() -> No value present
```

<details>
<summary><strong>Read as text</strong> — continued: the null email, the eager default and the interview answer</summary>

Two things to notice. `u2` exists but has a null email: `map(User::email)` turns that null into an empty `Optional`, so the chain needs no null check at all. And `orElse` ran the expensive default even though the value was present and the result was thrown away. Rule of thumb: if the default is a literal or an already-computed constant, use `orElse`; if it is a call, use `orElseGet`.

> **Interview —** *"Why shouldn't a method take an `Optional` parameter?"*
>
> **Say:** Because it doesn't remove a case, it adds one — the caller can now pass a present value, an empty one, or `null` itself, so you've turned two states into three and still have to null-check. `Optional` was designed as a return type: a way for a method to say in its signature that it may find nothing. For inputs, an overload or a documented nullable parameter is clearer.
>
> **They follow up with:** *"So is `Optional` in a field wrong too?"* — Effectively yes. It isn't `Serializable`, it costs an extra object per instance, and JPA cannot map it as a column. Keep the field nullable and return `Optional.ofNullable(field)` from the getter.

</details>

<details>
<summary><strong>Quick check.</strong> <code>opt.orElse(computeDefault())</code> vs <code>opt.orElseGet(this::computeDefault)</code> — when is the difference a bug rather than a style nit?</summary>

Whenever `computeDefault()` is expensive or has side effects. `orElse` evaluates its argument before `orElse` is even called — Java is strict, so the argument is computed regardless of whether the `Optional` is present, and the result is then discarded. If that call hits a database, allocates, logs, or increments a counter, you get real cost or a real side effect on the happy path where it should never have run. `orElseGet` defers it behind a `Supplier` and only invokes it when the `Optional` is empty.
</details>

---

## 38b.5 Streams — What You Half-Remember, Corrected ★★

![Infographic on Java streams as lazy pipelines: the names ada, linus, grace, alan and edsger flow through filter(len > 3), map(upper) and findFirst(); ada stops at the filter, linus becomes LINUS, and grace, alan and edsger are never touched, giving trace = (filter ada, filter linus, map linus); a Java 24 gatherer windowSliding(2) turns prices 100, 103, 101, 108 into changes (3, -2, 7); a collectors table with groupingBy, payroll eng=530 and sales=250, partitioningBy false=2 and true=3, and toMap's duplicate key error; and the trap that count() may skip map entirely.](diagrams/java38b_info_streams_ai.png)

<details>
<summary><strong>Read as text</strong> — why streams matter for the job, not the whiteboard</summary>

Be honest about where this belongs. Streams are close to irrelevant for algorithm interviews: across all the Java solutions in [Ch 31](#content/31_dsa_foundations)–31d, a stream appears in only a handful of lines. Under time pressure a `for` loop is faster to write, faster to debug and easier to talk through. But open any backend repository written since 2018 and streams are everywhere. So learn this for the job, not for the whiteboard.

</details>

#### Simple Explanation

<details>
<summary><strong>Read as text</strong> — laziness, one element at a time and the pipeline shape</summary>

A stream is a one-shot pipeline over a sequence of values. You describe the transformation as a chain of steps rather than as a loop with an accumulator, and the library runs it.

The one thing to internalise is **laziness**. Intermediate operations like `filter` and `map` don't do anything when you call them — they just build up a description. Nothing traverses the source until a terminal operation asks for a result. This is why a pipeline with no terminal op silently does nothing, and why a stream can't be reused: consuming it is what runs it.

The second thing follows from the first: elements flow through the pipeline **one at a time**. The first element goes through `filter`, then `map`, then into the terminal op, before the second element is even read — it is one fused loop, not one loop per step. So a *short-circuiting* terminal like `findFirst` or `anyMatch` can stop after touching only part of the source.

> A **stream** is a lazily evaluated sequence of elements supporting a pipeline of intermediate operations followed by exactly one terminal operation.

> **Maths in one line:** `work = elements the terminal op pulls through, not the source size` — `findFirst` on 5 names stops after 2 if the 2nd matches; `count()` on a sized source may run nothing at all.

```
  source            intermediate (lazy)      terminal (eager)
  ------            -------------------      ----------------
  list.stream()     filter(pred)             toList()
  Arrays.stream(a)  map(fn)                  count()
  Stream.of(...)    flatMap(fn)              collect(...)
  IntStream.range   sorted() distinct()      forEach(...)
  Files.lines(p)    limit(n) skip(n)         reduce(...)
                    gather(g)  (Java 24)     anyMatch(...) findFirst()

    nothing above runs until a terminal op appears,
    and a stream can only be consumed once
```

Proof of all three claims — lazy, one element at a time, single use — plus one surprise:

</details>

```java
// Streams are lazy: nothing runs before the terminal op, elements flow one at a time,
// short-circuit ops stop early, and a stream can be consumed only once
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public class LazyStreams {
    public static void main(String[] args) {
        List<String> names = List.of("ada", "linus", "grace", "alan", "edsger");
        List<String> trace = new ArrayList<>();

        Stream<String> pipeline = names.stream()
                .filter(n -> { trace.add("filter " + n); return n.length() > 3; })
                .map(n -> { trace.add("map " + n); return n.toUpperCase(); });
        System.out.println("pipeline built, trace = " + trace);

        String first = pipeline.findFirst().orElseThrow();
        System.out.println("findFirst = " + first);
        System.out.println("trace = " + trace);
        if (trace.size() != 3) throw new AssertionError("must stop after the first match");

        try {
            pipeline.count();
        } catch (IllegalStateException e) {
            System.out.println("reuse -> " + e.getMessage());
        }

        trace.clear();
        long n = names.stream().map(x -> { trace.add(x); return x; }).count();
        System.out.println("count = " + n + ", but map ran " + trace.size() + " times");
    }
}
```

**Output:**

```
pipeline built, trace = []
findFirst = LINUS
trace = [filter ada, filter linus, map linus]
reuse -> stream has already been operated upon or closed
count = 5, but map ran 0 times
```

<details>
<summary><strong>Read as text</strong> — continued: reading the trace and the count() surprise</summary>

Read the trace: `ada` failed the filter, `linus` passed and went straight on to `map`, and `findFirst` stopped there — `grace`, `alan` and `edsger` were never touched. The last line is the surprise: since Java 9, `count()` may skip the pipeline entirely when it can get the size from the source (`map` doesn't change the size), so side effects inside `map` or `peek` are **not guaranteed to run**. Never rely on side effects in a stream.

</details>

### The workhorses, and the collectors

<details>
<summary><strong>Read as text</strong> — Stream.toList() and the two collector sharp edges</summary>

`Stream.toList()` (Java 16) replaces `collect(Collectors.toList())` and is what you should write now — with one surprise: **it returns an unmodifiable list**, whereas `Collectors.toList()` in practice gives you an `ArrayList` you can mutate (its spec promises nothing either way). Code that collected and then added will throw. If you need a mutable result, say so explicitly with `collect(Collectors.toCollection(ArrayList::new))`. `Collectors.toUnmodifiableList()` (Java 10) also exists and is now mostly redundant; the one difference is that it throws on `null` elements while `toList()` accepts them.

The collectors that carry real weight are `groupingBy`, `partitioningBy`, `joining` and `toMap`. Two sharp edges to memorise first:

- **`toMap` throws on duplicate keys** — it doesn't overwrite. Supply a merge function when collisions are possible.
- **`groupingBy` builds a `HashMap` by default**, so key order is not defined. Pass `TreeMap::new` as the middle argument when you need sorted, repeatable output.

</details>

```java
// The collectors that do real work: groupingBy, partitioningBy, joining, toMap (+ merge)
import java.util.*;
import java.util.stream.Collectors;

public class CollectorsDemo {
    record Emp(String name, String dept, int salary) { }
    static final List<Emp> STAFF = List.of(
            new Emp("ada", "eng", 180),    new Emp("linus", "eng", 150),
            new Emp("grace", "eng", 200),  new Emp("alan", "sales", 120),
            new Emp("edsger", "sales", 130));

    public static void main(String[] args) {
        List<String> engs = STAFF.stream()
                .filter(e -> e.dept().equals("eng"))
                .sorted(Comparator.comparingInt(Emp::salary).reversed())
                .map(Emp::name)
                .toList();                                   // Java 16+, unmodifiable
        System.out.println("engs = " + engs);
        try { engs.add("x"); }
        catch (UnsupportedOperationException e) { System.out.println("engs.add -> UnsupportedOperationException"); }

        Map<String, List<String>> byDept = STAFF.stream().collect(Collectors.groupingBy(
                Emp::dept, TreeMap::new, Collectors.mapping(Emp::name, Collectors.toList())));
        Map<String, Integer> payroll = STAFF.stream().collect(Collectors.groupingBy(
                Emp::dept, TreeMap::new, Collectors.summingInt(Emp::salary)));
        Map<Boolean, Long> highPaid = STAFF.stream().collect(
                Collectors.partitioningBy(e -> e.salary() >= 150, Collectors.counting()));
        String joined = STAFF.stream().map(Emp::name).collect(Collectors.joining(", ", "[", "]"));
        System.out.println("byDept   = " + byDept);
        System.out.println("payroll  = " + payroll);
        System.out.println("highPaid = " + highPaid);
        System.out.println("joined   = " + joined);

        try { STAFF.stream().collect(Collectors.toMap(Emp::dept, Emp::name)); }
        catch (IllegalStateException e) { System.out.println("toMap -> " + e.getMessage()); }
        Map<String, String> merged = STAFF.stream().collect(Collectors.toMap(
                Emp::dept, Emp::name, (a, b) -> a + "|" + b, TreeMap::new));
        System.out.println("merged   = " + merged);
        if (payroll.get("eng") != 530) throw new AssertionError("eng payroll should be 530");
    }
}
```

**Output:**

```
engs = [grace, ada, linus]
engs.add -> UnsupportedOperationException
byDept   = {eng=[ada, linus, grace], sales=[alan, edsger]}
payroll  = {eng=530, sales=250}
highPaid = {false=2, true=3}
joined   = [ada, linus, grace, alan, edsger]
toMap -> Duplicate key eng (attempted merging values ada and linus)
merged   = {eng=ada|linus|grace, sales=alan|edsger}
```

<details>
<summary><strong>Read as text</strong> — continued: checking the numbers by hand and flatMap</summary>

Check the numbers by hand: eng is 180 + 150 + 200 = 530, sales is 120 + 130 = 250, and three people earn at least 150. `partitioningBy` always returns both keys, `false` and `true`, even if one side is empty. The comparator chain is covered in [Ch 38 §38.5](#content/38_java_refresher).

`flatMap` is the one that takes a moment: it maps each element to a *stream* and concatenates the results, flattening exactly one level. `List<List<Integer>>` becomes `List<Integer>`:

```java
List.of(List.of(1, 2), List.of(3)).stream()
        .flatMap(List::stream)
        .toList();                       // [1, 2, 3]
```

</details>

### `IntStream` and boxing

<details>
<summary><strong>Read as text</strong> — primitive streams, mapToInt and OptionalInt</summary>

`Stream<Integer>` boxes every element. `IntStream`, `LongStream` and `DoubleStream` don't, and they carry numeric terminals that `Stream` lacks:

```java
int total = STAFF.stream().mapToInt(Emp::salary).sum();          // 780
IntSummaryStatistics stats =
        STAFF.stream().mapToInt(Emp::salary).summaryStatistics(); // count=5, sum=780, min=120, average=156.0, max=200
List<Integer> squares = IntStream.rangeClosed(1, 5)
        .map(i -> i * i).boxed().toList();                        // [1, 4, 9, 16, 25]
```

`mapToInt` enters the primitive world, `boxed()` and `mapToObj` leave it. Two small traps: `Stream<Integer>` has no `sum()` (use `mapToInt(...).sum()` or `reduce(0, Integer::sum)`), and `IntStream.max()` returns an `OptionalInt`, so you finish with `getAsInt()` — the `Arrays.stream(piles).max().getAsInt()` idiom you will meet in Ch 31's binary-search problems.

</details>

### Gatherers (Java 24) — custom intermediate operations

<details>
<summary><strong>Read as text</strong> — gather(), the five built-in gatherers and neighbour pairs</summary>

For ten years the set of intermediate operations was fixed: if you needed "group into batches of 3" or "compare each element with the previous one", you dropped back to a loop. **Stream gatherers** (JEP 485, previewed in Java 22–23, final in Java 24, so available on the Java 25 LTS) add one general-purpose intermediate op, `stream.gather(gatherer)`, that can keep state, emit zero or many outputs per input, and stop early. `java.util.stream.Gatherers` ships five ready-made ones:

| Gatherer | What it emits | Example |
|---|---|---|
| `windowFixed(2)` | non-overlapping batches; the last may be short | `1,2,3,4,5` → `[[1, 2], [3, 4], [5]]` |
| `windowSliding(2)` | overlapping windows, step 1 | `1,2,3,4` → `[[1, 2], [2, 3], [3, 4]]` |
| `scan(() -> 0, Integer::sum)` | every running total (prefix sum) | `1,2,3,4` → `[1, 3, 6, 10]` |
| `fold(() -> 0, Integer::sum)` | one final result, in order | `1,2,3,4` → `[10]` |
| `mapConcurrent(n, fn)` | `fn` applied on up to `n` virtual threads, order kept | I/O fan-out — see [§38b.6](#content/38b_java_modern) |

The everyday win is "pairs of neighbours" without index arithmetic (checked on JDK 25):

```java
// Java 24+
List<Integer> prices = List.of(100, 103, 101, 108);
List<Integer> changes = prices.stream()
        .gather(Gatherers.windowSliding(2))          // [100,103] [103,101] [101,108]
        .map(w -> w.get(1) - w.get(0))
        .toList();                                   // [3, -2, 7]
```

Reach for a built-in gatherer when a loop would need a "previous element" variable or a batch buffer; writing your own `Gatherer` is rare in application code. There is still no built-in `zip`.

</details>

### When not to use a stream

<details>
<summary><strong>Read as text</strong> — the loop-vs-stream table, parallelStream caveats and the interview answer</summary>

This is the part experience teaches and tutorials skip.

| Situation | Use instead | Why |
|---|---|---|
| Tight numeric loop over an array | `for` loop | Boxing and megamorphic lambda call sites cost real time; the JIT handles the loop better |
| Early exit on a complex condition | `for` + `break` | `findFirst` and `anyMatch` cover the simple cases; anything else contorts |
| Mutating an accumulator or index | `for` loop | Side effects in `forEach` are the anti-pattern streams were meant to remove |
| Two collections in lockstep | indexed `for` | Streams have no clean zip; `IntStream.range` over indices is a workaround, not an improvement |
| Anything inside a coding interview | `for` loop | A stream stack trace is hard to read, and you can't talk a whiteboard through a fused pipeline step by step |

The rule that survives contact with real code: use a stream when the pipeline reads as a *description of the result* — filter these, group by that, sum the other. The moment you find yourself reaching for a mutable variable outside the pipeline, you wanted a loop.

**`parallelStream()` — four caveats before you type it:**

1. **Shared pool.** Every parallel stream in the JVM runs on the one common `ForkJoinPool` (about one thread per core), so a slow parallel stream in one request starves every other request that uses one.
2. **CPU-bound only.** It pays off only for large, CPU-heavy, side-effect-free work over a cheaply splittable source (`ArrayList`, arrays, `IntStream.range` — not `LinkedList` or `Stream.iterate`). Never use it for I/O; blocking calls tie up the few pool threads. For concurrent I/O inside a stream, use `Gatherers.mapConcurrent` or virtual threads ([§38b.6](#content/38b_java_modern)).
3. **Order and shared state.** `forEach` runs in no particular order (use `forEachOrdered` if order matters), and adding to a shared `ArrayList` from a parallel lambda is a data race — let a collector build the result.
4. **Measure first.** Splitting and merging have a cost; on small inputs parallel is usually *slower*.

> **Interview —** *"When would you choose a loop over a stream?"*
>
> **Say:** When the work is index-based, mutates state, exits early on a condition streams express awkwardly, or is a hot numeric path where boxing matters. Streams win when the code reads as a declarative description of the result — filter, group, aggregate — and especially when it replaces a nested loop with a `groupingBy`. Then add the operational point: stream stack traces are deep and noisy, and stepping through a fused pipeline needs breakpoints inside each lambda (or the IDE's stream-trace tool), so in code that gets debugged at 3am a plain loop is sometimes the kinder choice.
>
> **They follow up with:** *"Is a stream slower than a loop?"* — For a simple traversal of an array, usually a little: a `Stream<Integer>` pays for boxing, and even an `IntStream` pays for pipeline setup and less predictable inlining. For a pipeline of several stages the gap narrows because the stages are fused into one pass over the source either way. It's rarely the bottleneck; choose on readability and only optimise with a measurement in hand.

</details>

<details>
<summary><strong>Quick check.</strong> <code>list.stream().map(String::trim);</code> — what does this line do?</summary>

Nothing. `map` is an intermediate operation, so it only builds a description of the pipeline; with no terminal operation the source is never traversed and the lambda never runs. It also doesn't modify `list` — streams never mutate their source. The line you wanted is `var trimmed = list.stream().map(String::trim).toList();`. A pipeline whose result is discarded is always a bug, and it's the most common one beginners write.
</details>

## 38b.6 Virtual Threads and Modern Concurrency ★★★

![Virtual threads infographic: a pool of 200 platform threads with about 1 MB stacks each sits blocked on JDBC and HTTP and caps throughput at 200 / 0.1 s = 2,000 req/s by Little's Law, while 1,000,000 virtual threads parked on the heap share two carrier threads and unmount when they block. Worked numbers for 10,000 tasks x 10 ms: one by one 100,000 ms, a pool of 200 at least 500 ms, virtual threads about 0.1 s. Tips: cap DB calls with Semaphore(20), ThreadLocal is per-request state; trap: blocking inside synchronized pins the carrier on Java 21-23, use ReentrantLock (fixed in Java 24, JEP 491).](diagrams/java38b_info_virtual_threads_ai.png)

<details>
<summary><strong>Read as text</strong> — what Ch 21 already covers, and the one thing that changed</summary>

[Ch 21 — OO Design & SOLID (Java)](#content/21_design_fundamentals) already teaches the concurrency you half-remember, and teaches it well: §3.2 covers races, `synchronized`, `AtomicInteger` and `ConcurrentHashMap`; §3.3 covers producer–consumer with a `BlockingQueue`, `ExecutorService` and `Future`, and `CompletableFuture` chains; §3.4 covers deadlock, livelock and starvation. **None of that has changed and none of it is repeated here.** Go read it if it feels rusty — it is still exactly what an interviewer probes when they ask "is this thread-safe?"

This section starts where that one stops. What changed since 2022 is not the memory model or the locks. It is **the cost of a thread** — and that single change quietly invalidated a whole architectural fashion.

> **Maths in one line:** `throughput ≤ threads ÷ wait per request` (Little's Law, $L = \lambda W$) — with 200 threads and 100 ms of waiting per request you cap at 200 ÷ 0.1 s = 2,000 requests per second, however idle the CPUs are. Virtual threads remove the cap on *threads*; the other limits stay.

> ⚠️ **Java on this page is read-only.** The app runs Python, not Java, so there is no ▶ Run button here (the DSA practice page has a Java runner, but its online sandbox forbids creating threads anyway). Blocks followed by an **Output** block are complete programs that were run on JDK 25 and show their real output — save one as `<ClassName>.java` and run `java <ClassName>.java` to try it. Blocks without Output are fragments; their expected behaviour is written as a comment.

</details>

---

### The problem you left behind

<details>
<summary><strong>Read as text</strong> — the 200-thread ceiling and the reactive detour</summary>

In the Java you knew, `new Thread(...)` was a thin wrapper over an OS thread: one Java thread, one kernel thread, scheduled by the operating system. Each one reserves its own stack — about 1 MB by default on 64-bit Linux and Windows (`-Xss`) — starting one is a kernel call that costs tens to hundreds of microseconds, and every context switch goes through the kernel. That is why you pooled them — `Executors.newFixedThreadPool(200)` was not a style choice, it was rationing a scarce resource.

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

</details>

#### Simple Explanation

<details>
<summary><strong>Read as text</strong> — desks, lockers and the definition</summary>

Picture a call centre where every agent needs their own permanent desk, and the building only has 200 desks. Most of the day an agent is on hold, listening to music, occupying a desk while doing nothing at all. You cannot take more calls than you have desks, even though almost every desk is idle.

The reactive answer was to ban waiting: an agent who gets put on hold writes their place on a sticky note, hands the call off, and picks up something else. Throughput soars. But now no single agent has the story of any single customer, and when something goes wrong, nobody can reconstruct what happened.

Virtual threads take the third option. Give each agent a **locker** instead of a desk. When they're put on hold, their notes go in the locker and the desk is freed instantly. When the other side finally answers, they grab any free desk and carry on mid-sentence. A million lockers, a couple of dozen desks, and — this is the point — **the agent's script is still written top to bottom, exactly as before.**

> A **virtual thread** is a `java.lang.Thread` scheduled by the JVM rather than the operating system: it is *mounted* on a platform *carrier* thread to run, and *unmounted* onto the heap as a continuation whenever it blocks.

</details>

### What actually changes

<details>
<summary><strong>Read as text</strong> — platform vs virtual threads, and the carriers</summary>

| | Platform thread | Virtual thread |
|---|---|---|
| Backed by | one OS thread | a heap object (a continuation) |
| Stack | ~1 MB reserved up front | stack chunks on the heap — starts at a few hundred bytes, grows and shrinks |
| Start cost | tens–hundreds of µs (kernel call) — so you pool | ~1 µs — so you don't |
| Practical count | thousands | millions |
| Scheduled by | the OS kernel | a JVM `ForkJoinPool` of carriers |
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

</details>

### The API — three shapes, one of which you'll actually use

<details>
<summary><strong>Read as text</strong> — three ways to start one, and why the executor is not a pool</summary>

```java
// 1. Fire one off.
Thread t = Thread.startVirtualThread(() -> handle(request));
t.join();

// 2. Builder: adds naming; use .unstarted(...) instead of .start(...)
//    if you want to start it later.
Thread named = Thread.ofVirtual()
                     .name("req-", 0)      // req-0, req-1, ...
                     .start(() -> handle(request));

// 3. The one you'll write in server code.
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    for (Request r : batch) {
        exec.submit(() -> handle(r));      // one vthread per task
    }
}   // close() blocks until every task finishes — an implicit join

// expected: every task gets its own virtual thread, all in flight
// at once, multiplexed over ~availableProcessors() carriers.
```

Two details worth noticing. `ExecutorService` became `AutoCloseable` in Java 19, which is why try-with-resources works and gives you "wait for all of these" for free. And `newVirtualThreadPerTaskExecutor()` is **not a pool** — it mints a fresh virtual thread per task and discards it afterwards.

</details>

**See it run.** Ten thousand tasks, each blocking for 10 ms — think of a 10 ms database call. Done one after another that is 10,000 × 10 ms = 100 seconds. A pool of 200 platform threads can only wait on 200 at a time, so Little's Law gives it a hard floor of 10,000 ÷ 200 = 50 rounds × 10 ms = 500 ms. Virtual threads wait on all 10,000 at once. The program checks both claims and prints only the check results, because the raw timings change from machine to machine:

```java
// 10,000 blocking tasks: virtual threads overlap the waits; a 200-thread pool queues them.
import java.time.Duration;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

public class VirtualThreadsDemo {
    static final int TASKS = 10_000;
    static final Duration WAIT = Duration.ofMillis(10);   // stands in for a 10 ms DB call

    // Runs TASKS blocking tasks on the executor; returns elapsed ms.
    static long run(ExecutorService exec, AtomicInteger done) {
        long start = System.nanoTime();
        try (exec) {                                       // close() = wait for all tasks
            for (int i = 0; i < TASKS; i++) {
                exec.submit(() -> {
                    Thread.sleep(WAIT);                    // blocking: a vthread unmounts here
                    done.incrementAndGet();
                    return null;
                });
            }
        }
        return (System.nanoTime() - start) / 1_000_000;
    }

    public static void main(String[] args) {
        int poolSize = 200;
        long oneByOneMs = TASKS * WAIT.toMillis();                 // 100,000 ms
        long poolFloorMs = (TASKS / poolSize) * WAIT.toMillis();   // 50 rounds x 10 ms = 500 ms

        AtomicInteger vDone = new AtomicInteger(), pDone = new AtomicInteger();
        long virtualMs = run(Executors.newVirtualThreadPerTaskExecutor(), vDone);
        long poolMs = run(Executors.newFixedThreadPool(poolSize), pDone);

        if (vDone.get() != TASKS || pDone.get() != TASKS) throw new AssertionError("lost tasks");
        if (poolMs < poolFloorMs) throw new AssertionError("pool beat Little's Law?");
        if (virtualMs >= poolMs) throw new AssertionError("virtual threads did not overlap");

        System.out.printf("tasks: %,d, each blocking %d ms%n", TASKS, WAIT.toMillis());
        System.out.printf("one thread, one by one : %,d ms (computed)%n", oneByOneMs);
        System.out.printf("pool of %d threads     : at least %,d ms -> %b%n",
                poolSize, poolFloorMs, poolMs >= poolFloorMs);
        System.out.printf("virtual threads        : faster than the pool -> %b%n", virtualMs < poolMs);
    }
}
```

**Output:**

```
tasks: 10,000, each blocking 10 ms
one thread, one by one : 100,000 ms (computed)
pool of 200 threads     : at least 500 ms -> true
virtual threads        : faster than the pool -> true
```

<details>
<summary><strong>Read as text</strong> — continued: the measured timings and the CPU-bound contrast</summary>

On the laptop this was verified on, the virtual-thread run took about 0.1 s and the pool about 0.6 s — the 10 ms waits overlap, and what is left is mostly the cost of creating 10,000 threads. Swap `Thread.sleep` for a CPU loop and the advantage disappears: there are still only as many carriers as cores.

</details>

### Before and after: the same fan-out, twice

<details>
<summary><strong>Read as text</strong> — the same fan-out as a CompletableFuture chain and as plain blocking code</summary>

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
    Future<List<Order>> orders = exec.submit(
            () -> orderSvc.forUser(users.byId(id).id()));  // dependent calls: just sequential
    Future<Prefs>       prefs  = exec.submit(() -> prefSvc.byId(id));
    return new Profile(orders.get(), prefs.get());        // blocking is fine
} catch (ExecutionException e) {
    return Profile.empty();
}

// expected: the two branches run concurrently on virtual threads;
// total latency ≈ max(user + orders, prefs), not the sum of all three.
```

The second version is not merely shorter. The dependent pair (look up the user, *then* their orders) is two ordinary lines instead of a `thenCompose`. It has a real stack trace when it fails, works with ordinary `try`/`catch`/`finally`, shows up correctly in a profiler, and steps through in a debugger — and it is *just as concurrent*: both branches are in flight at once, so total latency is the slower branch, not the sum.

One thing it does not do yet is the 2-second timeout. `orders.get(2, TimeUnit.SECONDS)` stops *you* waiting, but `close()` still waits for the slow task to finish unless you `cancel(true)` it. Tying the children's lifetime and cancellation to the block is exactly what structured concurrency (below) adds.

</details>

### `CompletableFuture` has not gone away

<details>
<summary><strong>Read as text</strong> — the four cases where you still reach for it</summary>

The API itself — `supplyAsync`, `thenApply` vs `thenCompose` (map vs flat-map), `exceptionally` — is taught in [Ch 21 §3.3](#content/21_design_fundamentals) with a runnable example; it has not changed. What changed is *when you reach for it*. It is still the right tool in four situations, and still fair interview game:

- A library hands you an async API you don't control — `HttpClient.sendAsync` returns a `CompletableFuture` whether you like it or not.
- You want the timeout or fallback to be part of the pipeline — `orTimeout(...)` / `completeOnTimeout(...)` — rather than a thread sitting in `get(timeout)`.
- You want to **deduplicate in-flight work**: a `ConcurrentHashMap<K, CompletableFuture<V>>` with `computeIfAbsent` means a hundred simultaneous cache misses trigger exactly one load. Virtual threads have no built-in replacement for that trick.
- You're on an API boundary and must not block a caller's thread you don't own.

Already-completed stages run their callbacks inline on the calling thread, which means a small composition needs no executor at all — while the `...Async` variants always hop to a pool thread:

</details>

```java
// Callbacks on an already-completed future run inline on the caller; *Async ones hop to a pool thread.
import java.util.concurrent.CompletableFuture;

public class CompletedFutureDemo {
    public static void main(String[] args) {
        CompletableFuture<String>  a = CompletableFuture.completedFuture("ada");
        CompletableFuture<Integer> b = CompletableFuture.completedFuture(7);
        String[] ranOn = new String[2];

        String out = a.thenCombine(b, (name, n) -> name + ":" + n)
                      .thenApply(s -> {
                          ranOn[0] = Thread.currentThread().getName();
                          return s.toUpperCase();
                      })
                      .join();

        a.thenApplyAsync(s -> ranOn[1] = Thread.currentThread().getName())  // default: common pool
         .join();

        if (!out.equals("ADA:7")) throw new AssertionError(out);
        if (!ranOn[0].equals("main")) throw new AssertionError(ranOn[0]);

        System.out.println("result                  : " + out);
        System.out.println("thenApply ran on        : " + ranOn[0]);
        System.out.println("thenApplyAsync ran on main? " + ranOn[1].equals("main"));
    }
}
```

**Output:**

```
result                  : ADA:7
thenApply ran on        : main
thenApplyAsync ran on main? false
```

<details>
<summary><strong>Read as text</strong> — continued: the two traps a returning developer walks into</summary>

Two traps a returning developer walks into. `thenApply` runs the callback on whichever thread completed the stage — the caller, as here, if it was already done; otherwise the thread that called `complete()` — while `thenApplyAsync` moves it to the common `ForkJoinPool` unless you pass an executor. And `join()` throws unchecked `CompletionException` while `get()` throws checked `ExecutionException`; mixing them produces surprising catch blocks.

</details>

### Where virtual threads do *not* help

<details>
<summary><strong>Read as text</strong> — CPU-bound work, pinning by Java version, and why you never pool them</summary>

**CPU-bound work.** You still have $N$ cores. A million virtual threads multiplying matrices is a million ways to thrash the cache and lengthen every latency tail. Keep a fixed platform-thread pool sized near `availableProcessors()` for compute, and use virtual threads for the waiting.

**Pinning — the #1 real-world gotcha on Java 21.** On Java 21–23, a virtual thread that blocks *inside a `synchronized` block* cannot unmount, because the JVM records the *carrier* platform thread — not the virtual thread — as the monitor's owner. The carrier is stuck for the duration. Enough pinned carriers and your throughput collapses, or deadlocks outright — a server that behaves perfectly at 100 users and freezes at 5,000.

```java
// Pins the carrier on Java 21–23: the vthread cannot unmount here.
// Fine on Java 24+ (JEP 491).
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

Be precise about versions, because this is exactly where an interviewer probes:

| Java version | Blocking inside `synchronized` | How to find pinning |
|---|---|---|
| 21 – 23 | **pins** the carrier | `-Djdk.tracePinnedThreads=full`, or the JFR event `jdk.VirtualThreadPinned` |
| 24, 25 LTS and later | no longer pins (JEP 491) | JFR `jdk.VirtualThreadPinned` (the trace property was removed in 24) |
| any | still pins when native code (a `native` method or an FFM call) calls back into Java that blocks | JFR `jdk.VirtualThreadPinned` |

Plenty of production services in 2026 still run Java 21, so the safe answer is: on 21, prefer `ReentrantLock` around blocking I/O on hot paths and look for pinning events; on 25, choose between `synchronized` and `ReentrantLock` on their merits.

**Don't pool them.** Pooling amortises expensive creation; virtual threads are cheap. To *limit* concurrency against a downstream — say 20 connections to Postgres — use a `Semaphore` around the call, not a small thread pool. The distinction matters because the bottleneck has moved: your limit is now connection pools, downstream rate limits and memory. A team that flips on virtual threads without resizing HikariCP just relocates the queue.

</details>

```java
// 1,000 requests on 1,000 virtual threads, but a Semaphore lets only 20 query the DB at once.
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicInteger;

public class SemaphoreLimitDemo {
    public static void main(String[] args) {
        int requests = 1_000, dbConnections = 20;
        Semaphore permits = new Semaphore(dbConnections);
        AtomicInteger inFlight = new AtomicInteger(), peak = new AtomicInteger();
        AtomicInteger done = new AtomicInteger();

        try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < requests; i++) {
                exec.submit(() -> {
                    permits.acquire();              // waiting here parks the vthread, not a carrier
                    try {
                        peak.accumulateAndGet(inFlight.incrementAndGet(), Math::max);
                        Thread.sleep(5);            // the "query"
                        inFlight.decrementAndGet();
                    } finally {
                        permits.release();
                    }
                    done.incrementAndGet();
                    return null;
                });
            }
        }

        if (done.get() != requests) throw new AssertionError("lost requests");
        if (peak.get() > dbConnections) throw new AssertionError("limit broken: " + peak.get());
        System.out.printf("requests handled       : %,d (one virtual thread each)%n", done.get());
        System.out.printf("peak concurrent queries: at most %d -> %b%n",
                dbConnections, peak.get() <= dbConnections);
    }
}
```

**Output:**

```
requests handled       : 1,000 (one virtual thread each)
peak concurrent queries: at most 20 -> true
```

<details>
<summary><strong>Read as text</strong> — continued: go easy on ThreadLocal</summary>

**Go easy on `ThreadLocal`.** It was a sane cache when threads were few and long-lived — one `SimpleDateFormat` per thread, reused a million times. With a million short-lived virtual threads it is a million copies and no reuse at all. It still *works*; just treat it as per-request state, never as a cache — and for request context, prefer scoped values (below).

</details>

### Structured concurrency and scoped values — Java 25+

<details>
<summary><strong>Read as text</strong> — children that cannot outlive their scope, still a preview</summary>

Look again at the try-with-resources fan-out. The tasks are still loose: if one fails, the other keeps running until someone cancels it, and nothing in the language ties the children's lifetime to the block.

**Structured concurrency** fixes that by making concurrency obey the same rule as a code block: children cannot outlive the scope that created them, and a failure cancels the siblings automatically.

```java
// Preview API in Java 25, 26 and 27 — compile and run with --enable-preview.
// This basic shape is the same in all three (JEP 505 / 525 / 533).
try (var scope = StructuredTaskScope.open()) {      // default policy: all must succeed

    Subtask<List<Order>> orders = scope.fork(() -> ordersFor(id));   // child vthread
    Subtask<Prefs>       prefs  = scope.fork(() -> prefSvc.byId(id));

    scope.join();                 // waits for both; if either failed,
                                  // cancels the other one and throws
    return new Profile(orders.get(), prefs.get());
}
// expected: identical result to the Future version above, but a
// failure in either child cancels its sibling immediately.
```

Two honest caveats. First, this API has churned through seven previews: the Java 21 shape was `new StructuredTaskScope.ShutdownOnFailure()` with `scope.throwIfFailed()`; Java 25 replaced the constructors with `StructuredTaskScope.open(...)`; and the exception `join()` throws changed from `StructuredTaskScope.FailedException` (25) to a checked `ExecutionException` (27). Second, contrary to a lot of blog posts: **structured concurrency is still a preview feature — in Java 25 LTS (JEP 505) and still in Java 27 (JEP 533, seventh preview, September 2026).** Don't put it in production code you can't recompile.

What *did* finalise in Java 25 is **scoped values (JEP 506)** — the replacement for `ThreadLocal` in this world: an immutable value bound for the dynamic extent of a call, readable anywhere below it, inherited by subtasks forked in a `StructuredTaskScope`, and unbound automatically when the call returns.

</details>

```java
// Java 25+: a ScopedValue is bound only inside where(...).run(...), and unbound again afterwards.
import java.util.NoSuchElementException;

public class ScopedValueDemo {
    static final ScopedValue<String> CURRENT_USER = ScopedValue.newInstance();

    static String handleRequest() {                 // deep in the call stack: no parameter needed
        return "handled for " + CURRENT_USER.get();
    }

    public static void main(String[] args) {
        String[] seen = new String[3];
        ScopedValue.where(CURRENT_USER, "alice").run(() -> {
            seen[0] = handleRequest();
            ScopedValue.where(CURRENT_USER, "admin")         // nested rebinding...
                       .run(() -> seen[1] = handleRequest());
            seen[2] = handleRequest();                       // ...restored on exit
        });

        boolean boundAfter = CURRENT_USER.isBound();
        String outside;
        try {
            outside = CURRENT_USER.get();
        } catch (NoSuchElementException e) {
            outside = "NoSuchElementException";
        }
        if (boundAfter || !seen[2].equals(seen[0])) throw new AssertionError("binding leaked");

        System.out.println("inside      : " + seen[0]);
        System.out.println("nested      : " + seen[1]);
        System.out.println("after nested: " + seen[2]);
        System.out.println("bound after run()? " + boundAfter + "; get() -> " + outside);
    }
}
```

**Output:**

```
inside      : handled for alice
nested      : handled for admin
after nested: handled for alice
bound after run()? false; get() -> NoSuchElementException
```

<details>
<summary><strong>Read as text</strong> — continued: why scoped values beat ThreadLocal, and the interview answer</summary>

No `remove()` to forget, no leak into a pooled thread, no `set()` that some other code can change behind your back — and the code's own structure (the `run(...)` call) tells you exactly where the binding is valid.

> **Interview —** *"Virtual threads or a reactive stack — which would you pick for a new I/O-heavy service, and why?"*
>
> **Say:** Virtual threads, on Java 21+ (25 LTS if I can choose). Both solve the same problem — not burning an OS thread while waiting — but reactive pays for it with a programming model that discards stack traces, debuggers, `try`/`finally` and thread-locals. Virtual threads deliver the same scalability with plain blocking code, so the code stays readable and the operational tooling keeps working. I'd stay reactive only where I genuinely need backpressure semantics across a streaming pipeline, or where the codebase is already Reactor and rewriting it buys nothing.
>
> **They follow up with:** *"What breaks when you turn virtual threads on in an existing service?"* — Pinning under `synchronized` if you're on Java 21 (use `ReentrantLock` on hot paths; find offenders with JFR's `jdk.VirtualThreadPinned` events), `ThreadLocal`-based caches that assumed thread reuse, and pool sizing: threads stop being the bottleneck, so the database connection pool and downstream rate limits become the real limit — cap them with a `Semaphore` or resize the pool deliberately.

</details>

<details>
<summary><strong>Quick check.</strong> A service handles 200 req/s, each request blocking ~500 ms on I/O. It runs on a 200-thread pool and throughput is stuck at 200 req/s. You switch to virtual threads and throughput doesn't improve. Name two plausible causes.</summary>

First: **pinning**. If the blocking call sits inside a `synchronized` block and you're on Java 21, every waiting virtual thread holds its carrier hostage, so your effective parallelism is the carrier count — about the number of cores, likely *worse* than 200. Confirm with JFR's `jdk.VirtualThreadPinned` events (or `-Djdk.tracePinnedThreads=full` on 21–23), fix with `ReentrantLock` — or move to Java 24+.

Second: **the bottleneck moved and you didn't follow it**. With $L = \lambda W$ you need $200 \times 0.5 = 100$ concurrent operations, which the old 200-thread pool could already supply. So threads were never the limit — something else is: a 100-connection HikariCP pool (100 ÷ 0.5 s = exactly 200 req/s), a downstream rate limit, or the downstream service's own latency. Virtual threads make you *able* to have a million requests in flight; they do not make the database faster.

A third, rarer cause: the work isn't actually I/O-bound. If those 500 ms are CPU, 200 req/s needs 100 cores' worth of work, and no scheduler change helps — you need more cores or less work.
</details>

---

## 38b.7 Spring Boot 4 — What Changed Since Boot 2 ★★

> **Spring code here is framework code.** It needs a Spring Boot project (a `pom.xml` or `build.gradle.kts`, §38b.8) to run, so read it as reference; it is written for Spring Boot 4.1 on Spring Framework 7. The one plain-Java program — the DTO ↔ entity mapping — was run on JDK 25 and shows its real output.

![Spring Boot 2 to 3 to 4 comparison drawn as three rooms of one building: Boot 2 (March 2018, javax.*, Java 8+, Spring Cloud Sleuth, Tomcat pool of 200 threads), Boot 3 (Nov 2022, jakarta.* EE 9/10, Java 17+, Micrometer Tracing, SecurityFilterChain bean) and Boot 4 (Nov 2025, Framework 7, jakarta.* EE 11, modular starters, Jackson 3, @MockBean removed), with a thick big-jump arrow for the javax to jakarta rename and a thin smaller-jump arrow. Shows the spring.threads.virtual.enabled=true switch (Boot 3.2+, Java 21+), a next-step table (latest 2.7 then 3.5 with OpenRewrite, clear deprecations then 4, resize the Hikari pool), common mix-ups, and the trap that a blind javax to jakarta replace breaks javax.sql and javax.crypto. As of Nov 2026 Boot 4.1 is current.](diagrams/java38b_info_spring_boot_2_to_4_ai.png)

#### Simple Explanation

<details>
<summary><strong>Read as text</strong> — the renumbered building, and where things stand in November 2026</summary>

You have come back to the same building. The layout is familiar, the furniture is where you left it — and every single room has been renumbered. That renumbering is `javax.*` becoming `jakarta.*` in Boot 3, and it is the whole reason that upgrade was painful rather than routine: not one new idea, just thousands of import lines that had to change at once.

Beyond the renumbering, three things are genuinely different. The building refuses entry to anyone below Java 17. There is a light switch by the door that makes every worker essentially free — `spring.threads.virtual.enabled`. And the furniture you carry data around in is now a record instead of a forty-line bean.

Boot 4 was a second, smaller move: the building was split into separate wings — you now ask for exactly the wings you use (modular starters) — and the mail room changed supplier (Jackson 3). Painful for a week, not for a quarter.

> **Spring Boot 3** (November 2022) is the Jakarta EE generation of Spring Boot: Java 17 is the minimum, every `javax.*` enterprise API is now `jakarta.*`, and since 3.2 the servlet container can serve each request on a virtual thread. **Spring Boot 4** (November 2025, on Spring Framework 7) keeps the Java 17 floor and moves to Jakarta EE 11, Jackson 3 and small, modular starters.

**Where things stand (November 2026):** the current line is Boot 4.1 (4.1.2), Boot 4.2 is at release candidate, and Boot 3.5 — the last 3.x — left free open-source support on 30 June 2026. New work starts on Boot 4.

</details>

### The delta table

<details>
<summary><strong>Read as text</strong> — Boot 2 vs Boot 3 vs Boot 4, row by row</summary>

| Concern | Boot 2 | Boot 3 | Boot 4 |
|---|---|---|---|
| First release | March 2018 | November 2022 | November 2025 |
| Spring Framework | 5.x | 6.x | **7.x** |
| Java baseline | 8+ | **17+** | 17+ (latest LTS, 25, recommended) |
| Enterprise APIs | `javax.*` | **`jakarta.*`** (Jakarta EE 9/10) | `jakarta.*` (Jakarta EE 11, Servlet 6.1) |
| Threading | Tomcat pool, `threads.max=200` | `spring.threads.virtual.enabled=true` (3.2+, Java 21+) | same property |
| Tracing | Spring Cloud Sleuth | **Micrometer Tracing** (Sleuth is dead) | Micrometer Tracing + an OpenTelemetry starter |
| Security config | `WebSecurityConfigurerAdapter` | a `SecurityFilterChain` `@Bean`, lambda DSL | same; lambda DSL now required (Security 7) |
| JSON | Jackson 2 | Jackson 2 | **Jackson 3** (`tools.jackson.*`) |
| Starters | a few big ones | a few big ones | **modular**: one per technology, plus a test starter each |
| Test mocks | `@MockBean` | `@MockitoBean` (3.4+; `@MockBean` deprecated) | `@MockBean` **removed** |
| Test infra | H2 in-memory | **Testcontainers** + `@ServiceConnection` (3.1+) | same (Testcontainers 2) |
| DTOs | Lombok `@Data` beans | **records** (§38b.2) | records |

</details>

### One property, thread-per-request restored

<details>
<summary><strong>Read as text</strong> — one property, and the new ceiling it exposes</summary>

```yaml
spring:
  threads:
    virtual:
      enabled: true      # Boot 3.2+, on Java 21+
```

That is the entire migration for most MVC applications. Tomcat's request executor becomes a virtual-thread-per-task executor, and so do `@Async`, `@Scheduled` tasks, and the Kafka and RabbitMQ listener containers. Your controllers, services and repositories don't change a line — they were already blocking code, which is now the correct thing to be.

Delete your `server.tomcat.threads.max` tuning afterwards; it governs nothing now (`server.tomcat.max-connections`, default 8,192, still caps open connections). Then go and look at `spring.datasource.hikari.maximum-pool-size`, because that is your new ceiling (§38b.6). To cap one hot method without hand-writing a `Semaphore`, Spring Framework 7 adds `@ConcurrencyLimit(20)` (switched on with `@EnableResilientMethods`) — its documentation calls this out as particularly useful with virtual threads.

</details>

### `javax` → `jakarta`, precisely

<details>
<summary><strong>Read as text</strong> — what moves, what stays, and the new security configuration</summary>

Search and replace, but know what *doesn't* move. The Jakarta EE packages change: `javax.persistence` → `jakarta.persistence`, `javax.servlet` → `jakarta.servlet`, `javax.validation` → `jakarta.validation`, `javax.annotation.PostConstruct` → `jakarta.annotation.PostConstruct`.

The JDK's own `javax` packages **stay exactly as they are**: `javax.sql.DataSource`, `javax.crypto`, `javax.naming`, `javax.net.ssl`. A blind project-wide replace breaks all of those, and it is a genuinely common self-inflicted wound. Use the OpenRewrite recipe `org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0` rather than a regex. Stragglers matter more now: Spring Framework 7 no longer processes the old `javax.annotation` and `javax.inject` annotations at all, so a leftover `@javax.annotation.PostConstruct` simply stops being called.

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
            .csrf(csrf -> csrf.disable())     // only for a stateless, token-authenticated API
            .build();
    }
}
```

The adapter base class was removed in Spring Security 6 (Boot 3); you publish a `SecurityFilterChain` **bean** instead, `antMatchers` became `requestMatchers`, and every `.and()` chain became a lambda — which Spring Security 7 (Boot 4) now *requires*: `.and()` is gone, so the old chained style no longer compiles. Same security model, different surface — and because it is now a bean, you can compose or conditionally register chains like any other configuration.

</details>

### Boot 3 → Boot 4: the second, smaller jump

<details>
<summary><strong>Read as text</strong> — modular starters, Jackson 3, test changes and the two-hop route</summary>

Boot 4 has no `jakarta`-sized rename. Most applications need five kinds of change:

1. **Modular starters.** Boot was split into small modules, one per technology, each with a matching test starter. `spring-boot-starter-web` is now `spring-boot-starter-webmvc` (the old name still works but is deprecated), and features that used to switch on just because a library was present — Flyway, Liquibase — now need their own starter (`spring-boot-starter-flyway`). To get running first and tidy up later, `spring-boot-starter-classic` (and `spring-boot-starter-test-classic`) brings back the old everything-on-the-classpath setup.
2. **Jackson 3.** The JSON library changed packages: `com.fasterxml.jackson.databind` → `tools.jackson.databind`. The annotations (`@JsonProperty`, `@JsonIgnore`) keep their old `com.fasterxml.jackson.annotation` package, so most DTOs don't change; custom serializers and `ObjectMapper` set-up do.
3. **Tests.** `@MockBean` and `@SpyBean` are removed — use `@MockitoBean` and `@MockitoSpyBean` — and a plain `@SpringBootTest` no longer sets up `MockMvc`; add `@AutoConfigureMockMvc`.
4. **Removals.** Undertow is gone (it does not support Servlet 6.1), leaving Tomcat 11 and Jetty 12.1. Everything deprecated in 3.x is deleted.
5. **New in Spring Framework 7, worth knowing by name:** `@Retryable` and `@ConcurrencyLimit` in core Spring, built-in API versioning, HTTP service clients (annotate an interface with `@HttpExchange` and Spring implements the HTTP calls), and JSpecify null-safety annotations (`org.jspecify.annotations.Nullable`).

The recommended route is two hops: move to the latest 3.5.x and clear every deprecation warning, then upgrade to 4.x. The OpenRewrite recipe `org.openrewrite.java.spring.boot4.UpgradeSpringBoot_4_0` automates most of the second hop, and the `spring-boot-properties-migrator` dependency reports renamed configuration properties at startup (remove it afterwards).

</details>

### A controller, with a record as the DTO

![Modern Spring Boot service infographic: a request flows from JSON to a record CreateOrder(@NotBlank String sku, @Positive int qty), a @RestController with constructor injection, a @Service @Transactional that maps entity to record, and an @Entity Order class with a no-arg constructor, into an orders table. The N+1 panel shows queries = 1 + N: 500 orders fire up to 501 queries, while join fetch or @EntityGraph needs 1. Output card: OrderResponse with id=1001, sku=SKU-42, qty=3, status=NEW and equals expected? true. A table lists the bites (N+1, LazyInitializationException with open-in-view, @Transactional proxy self-calls, checked exceptions commit) and tests use @WebMvcTest + @MockitoBean, @DataJpaTest and Testcontainers + @ServiceConnection.](diagrams/java38b_info_spring_service_jpa_ai.png)

<details>
<summary><strong>Read as text</strong> — records as request and response bodies, and constructor injection</summary>

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

</details>

### Spring Data JPA and the three things that bite

<details>
<summary><strong>Read as text</strong> — N+1 selects, LazyInitializationException and the @Transactional proxy</summary>

> **Maths in one line:** `queries = 1 + N` — one query loads the list, then one more per lazily loaded association you touch: 500 orders → up to 501 queries; with a `join fetch` → 1.

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

**1. N+1 selects.** You fetch 500 orders in one query, then the serializer touches `order.getCustomer()` on each — up to 500 more queries, one per distinct customer. The tell is a page that is fast with ten rows of test data and times out in production. Fix with `@EntityGraph(attributePaths = ...)`, a `join fetch` query, or a projection selecting only the columns you need. Turn on `spring.jpa.properties.hibernate.generate_statistics=true` in a test to *count* queries rather than guess.

**2. `LazyInitializationException`.** The persistence context closes at the transaction boundary; touching a lazy association afterwards throws. Boot ships with `spring.jpa.open-in-view=true`, which hides the problem by holding the session open for the whole request — a default most experienced teams switch **off**, because it turns lazy loading into invisible query storms in the view layer. Set it `false` and map to DTOs inside the service, within the transaction.

**3. `@Transactional` boundaries.** It is implemented with a proxy, which produces three silent failures: calling a `@Transactional` method from another method of the *same bean* bypasses the proxy entirely (self-invocation, no transaction); putting it on a `private` or `final` method does nothing; and by default only *unchecked* exceptions roll back, so a checked exception commits your half-finished work unless you write `rollbackFor`. Use `@Transactional(readOnly = true)` on queries — it lets Hibernate skip dirty-checking.

</details>

### Records as DTOs, classes as entities

<details>
<summary><strong>Read as text</strong> — why an entity cannot be a record</summary>

An `@Entity` **cannot** be a record: JPA needs a no-arg constructor and mutable fields so it can hydrate and dirty-check instances. A DTO should be a record for exactly the opposite reasons. So you map between them — a small, boring, testable function. This one is plain Java, so it runs without Spring:

</details>

```java
// Records for the wire (DTOs), a mutable class for JPA, and two tiny mapping functions between them.
public class OrderMappingDemo {
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
        entity.assignId(1001L);                   // pretend the database assigned the id

        OrderResponse dto = toDto(entity);
        boolean same = dto.equals(new OrderResponse(1001L, "SKU-42", 3, "NEW"));
        if (!same) throw new AssertionError("mapping lost a field: " + dto);

        System.out.println(dto);                  // record toString, free
        System.out.println("equals expected? " + same);   // record equals, free
    }
}

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
```

**Output:**

```
OrderResponse[id=1001, sku=SKU-42, qty=3, status=NEW]
equals expected? true
```

<details>
<summary><strong>Read as text</strong> — continued: what the record gives you for free</summary>

Note what the record gave you free: a readable `toString` for logging and a correct `equals` for testing — the two things you used to hand-write or hand to Lombok.

</details>

### Configuration

<details>
<summary><strong>Read as text</strong> — a record bound to application.yml, and profiles</summary>

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

A record binds directly as configuration properties — constructor binding, immutable result, `@Validated` still applies. Register it with `@ConfigurationPropertiesScan` (or `@EnableConfigurationProperties(BillingProps.class)`). Profiles are activated with `SPRING_PROFILES_ACTIVE`; profile-specific values can live as extra `---` documents in one `application.yml`, as above, or in separate `application-<profile>.yml` files — pick one style per project.

</details>

### Testing

<details>
<summary><strong>Read as text</strong> — slice tests, Testcontainers, native images and the migration interview answer</summary>

`@SpringBootTest` starts the entire context — the honest integration test, and slow, so use it sparingly for wiring and the happy path end-to-end. In Boot 4 it no longer sets up `MockMvc` on its own; add `@AutoConfigureMockMvc` when you want it.

Reach for **slice tests** by default. `@WebMvcTest(OrderController.class)` loads the web layer only and gives you `MockMvc`, with collaborators supplied as `@MockitoBean` — Spring Framework's replacement for Boot's `@MockBean`, which Boot 3.4 deprecated and Boot 4 removed. `@DataJpaTest` loads JPA and the repositories only, and rolls back each test.

**Testcontainers is the modern default** for anything touching a real database or broker — a throwaway Postgres or Kafka in Docker, so tests exercise the database you actually deploy on rather than H2 pretending. Since Boot 3.1, `@ServiceConnection` wires the container's URL and credentials into the context automatically, deleting the `@DynamicPropertySource` boilerplate everyone used to copy around. See [Ch 22 — Engineering Tools](#content/22_engineering_tools) for Docker itself.

Two more worth knowing by name. **GraalVM native images** compile a Boot app ahead of time: startup in tens of milliseconds and a fraction of the memory, at the cost of build-time reflection configuration and no dynamic class loading — attractive for serverless, still niche for long-running services (Boot 4 needs GraalVM 25 or later). And **Micrometer** is now the whole observability story: metrics, and since Boot 3 tracing too (Micrometer Tracing), exporting to Prometheus and OpenTelemetry — Boot 4 adds a `spring-boot-starter-opentelemetry` that wires up OTLP export in one dependency.

> **Interview —** *"What's involved in migrating a Spring Boot 2 service to Boot 4?"*
>
> **Say:** Two hops, never one: from the latest 2.7 to 3.5, then from 3.5 to 4. The first hop is the big one. Mechanical: Java 17 baseline and the `javax` → `jakarta` namespace change, which is best done with OpenRewrite rather than a regex because the JDK's own `javax.sql` and `javax.crypto` must *not* move. Behavioural: `WebSecurityConfigurerAdapter` is gone in favour of a `SecurityFilterChain` bean, and Sleuth is replaced by Micrometer Tracing. Then clear every deprecation warning on 3.5, because Boot 4 deletes them all. The second hop is smaller: modular starters (`spring-boot-starter-webmvc`), Jackson 3's new packages, `@MockBean` → `@MockitoBean`, and the lambda-only Security 7 DSL. Opportunity along the way: on Java 21+ you flip `spring.threads.virtual.enabled=true` and get thread-per-request back — then immediately re-check the connection pool, because threads stop being the bottleneck.
>
> **They follow up with:** *"How would you know the migration didn't break anything?"* — Integration tests on Testcontainers rather than H2, so the database behaviour is real; a query-count assertion on the hot endpoints to catch a fetch strategy that silently changed into an N+1; JSON contract tests, because a serializer change (Jackson 3) can alter output without failing compilation; and canary the deploy while watching p99 latency and connection-pool saturation.

</details>

<details>
<summary><strong>Quick check.</strong> Your `/orders` endpoint returns 200 orders and each includes its customer's name. It passes every test and takes 4 seconds in production. What is happening, and what are two fixes?</summary>

Classic **N+1**: one query loads the 200 orders, then serializing each `order.getCustomer().getName()` triggers a lazy load — up to 201 queries. It passed tests because the test fixture had three rows, and it didn't throw `LazyInitializationException` because `spring.jpa.open-in-view` is `true` by default, keeping the session open through rendering and hiding the problem.

Fix one: fetch the association eagerly for this query only — `@EntityGraph(attributePaths = "customer")` on the repository method, or `join fetch` in a `@Query`. Fix two, usually better: don't return entities at all. Query a projection or map to an `OrderView` record inside the transactional service method, selecting just the columns the endpoint needs.

Then set `open-in-view: false` so the next one fails loudly in a test instead of silently in production.
</details>

---

## 38b.8 Build Tools and Testing ★★

> **Read-only section.** Build files and tests need Maven or Gradle plus the test libraries, so read them as reference and try them in your own project. The one exception is the plain-Java program in the JUnit section: it needs only a JDK (`java MessageOrderTrap.java`).

![Build tools and testing comparison: Maven (pom.xml, declarative XML, fixed lifecycle compile, test, package; pick for a standard app under about 20 modules; 3.9.x and 3.10.x, Maven 4 still a release candidate) versus Gradle (build.gradle.kts, Kotlin DSL task graph that skips unchanged steps; incremental builds and build cache; 9.x, needs Java 17+), with a badge to commit the ./mvnw and ./gradlew wrapper. A JUnit 4 to 5/6 trap table shows assertEquals with a String and ints is a compile error, three Strings always fail, and assertNotNull with the message first passes even when name is null; the fix assertNotNull(name, message) fails and catches the bug. Also: JUnit 6 is JUnit 5's API on Java 17+ and needs Surefire 3.0+, Mockito 5 uses inline mocks, Gradle 9 needs junit-platform-launcher.](diagrams/java38b_info_build_tools_testing_ai.png)

#### Simple Explanation

<details>
<summary><strong>Read as text</strong> — build tools, the wrapper and JUnit 6 in plain words</summary>

A build tool is the written recipe that turns a folder of source files into something shippable: fetch these ingredients at these versions, compile, test, package. Maven writes the recipe as a fixed sequence everyone already knows. Gradle writes it as a graph of steps it can skip whenever nothing has changed.

The **wrapper** is the part people undervalue: it ships the *oven* along with the recipe. A colleague clones the repo, runs `./mvnw`, and gets your exact build-tool version rather than whatever happens to be on their laptop.

Testing changed less than you'd fear. JUnit 5 is the same idea with better annotations, and JUnit 6 (September 2025) keeps that same API while raising the floor to Java 17. AssertJ replaced a pile of `assertEquals` calls with one readable sentence per assertion.

> A **build tool** resolves dependencies, compiles, tests and packages a project from a declarative description; a **wrapper** script pins that tool's own version inside the repository.

</details>

### Maven or Gradle in 2026

<details>
<summary><strong>Read as text</strong> — Maven vs Gradle, a POM, a Gradle build and the wrapper</summary>

Both are healthy; the choice is about build *size*, not fashion.

| | Maven | Gradle |
|---|---|---|
| Model | declarative XML, fixed lifecycle | build script (Kotlin DSL), task graph |
| Strength | predictable, universally readable | incremental builds, build cache |
| Weakness | verbose, awkward custom steps | more moving parts to understand |
| Pick when | standard app, < ~20 modules | large multi-module, build time is a cost |
| Current (Nov 2026) | 3.9.x and 3.10.x; Maven 4 is still a release candidate | 9.x (9.8); needs Java 17+ to run |
| Also | every library on Maven Central ships a POM, so you read them anyway | default for Android and for new projects on start.spring.io |

Rough rule: if your build is a normal service and nobody complains about build time, Maven — its boringness is the feature. If you have a monorepo where CI minutes are a budget line, Gradle's caching and incremental compilation pay for the extra complexity.

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>orders</artifactId>
  <version>1.0.0</version>

  <properties>
    <maven.compiler.release>25</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>6.1.3</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.assertj</groupId>
      <artifactId>assertj-core</artifactId>
      <version>3.27.7</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>  <!-- pin it: JUnit 6 needs Surefire 3.0 or newer -->
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.6.1</version>
      </plugin>
    </plugins>
  </build>
</project>
```

**`release`, not `source`/`target`.** `<maven.compiler.release>` (JDK 9+) checks your code against the target version's real API, not just its syntax. The old `source`/`target` pair never did, which is how projects shipped code that compiled fine and threw `NoSuchMethodError` on an older JRE. If an old POM still has the pair, replace it.

```kotlin
// build.gradle.kts — the Kotlin DSL is the default for new builds
plugins {
    java
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories { mavenCentral() }

dependencies {
    testImplementation(platform("org.junit:junit-bom:6.1.3"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")  // Gradle 9: no longer added for you
    testImplementation("org.assertj:assertj-core:3.27.7")
}

tasks.test { useJUnitPlatform() }
```

The Kotlin DSL has been the default for new Gradle builds since 8.2 (2023), largely because the IDE can autocomplete it. Two more details trip people up:

1. **Toolchains.** Gradle compiles and tests with a JDK 25 even when `JAVA_HOME` points somewhere else. It uses an installed JDK that matches; it *downloads* one only if `settings.gradle.kts` applies a toolchain resolver plugin such as `id("org.gradle.toolchains.foojay-resolver-convention")`.
2. **The JUnit launcher.** Gradle 9 stopped putting `junit-platform-launcher` on the test classpath automatically. Without the `testRuntimeOnly` line, `./gradlew test` fails with "Failed to load JUnit Platform".

**Commit the wrapper.** `./mvnw` and `./gradlew`, plus their `.mvn/wrapper/` and `gradle/wrapper/` directories, belong in git. They pin the exact build-tool version, so a fresh clone and a CI runner with nothing installed produce identical builds, and a build-tool upgrade becomes a reviewed one-line diff instead of an untracked change on someone's laptop. Generate them with `mvn wrapper:wrapper` (the wrapper is now an official Apache Maven project) or `gradle wrapper`; upgrade Gradle's with `./gradlew wrapper --gradle-version=9.8.2`.

</details>

### JUnit 5 and 6

<details>
<summary><strong>Read as text</strong> — what JUnit 6 changed, a full test class and the JUnit 4 traps</summary>

JUnit 6.0 (30 September 2025; 6.1.3 is current as of November 2026) is an evolution, not a rewrite. The `org.junit.jupiter.api` package, the annotations and the assertions below are the same in 5 and 6. What changed:

| JUnit 6 change | What it means for you |
|---|---|
| Java 17 minimum | same baseline as Spring Boot 3 and 4 |
| One version number for every artifact | no more Platform 1.x next to Jupiter 5.x |
| JSpecify nullability annotations | IDEs and Kotlin see which arguments may be `null` |
| Maven Surefire / Failsafe 3.0+ required | pin the plugin, as in the POM above |
| Vintage engine (runs JUnit 4 tests) deprecated | use it only while you migrate |

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

| JUnit 4 | JUnit 5 / 6 | Watch out |
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

That message move is the one that bites, and how it bites depends on the argument types (checked against JUnit 6.1.3):

| JUnit 4 call, ported unchanged | How JUnit 5/6 reads it | Result |
|---|---|---|
| `assertEquals("should be two", 2, count)` | no `(String, int, int)` overload exists | **compile error** — the lucky case |
| `assertEquals("user", "alice", name)` | expected `"user"`, actual `"alice"`, message `name` | **always fails**, with a baffling message |
| `assertNotNull("name is set", name)` | checks the literal `"name is set"`; `name` becomes the message | **always passes**, even when `name` is null |

The last row is the dangerous one: a green test that checks nothing. This plain-Java program copies the two parameter orders into tiny methods so you can watch it happen:

</details>

```java
// JUnit 4 -> 5/6 port: the message moved LAST, so an unchanged assertNotNull checks the message
public class MessageOrderTrap {
    // JUnit 4 order:   assertNotNull(String message, Object object)
    static void assertNotNull4(String message, Object object) {
        if (object == null) throw new AssertionError(message);
    }
    // JUnit 5/6 order: assertNotNull(Object actual, String message)
    static void assertNotNull5(Object actual, String message) {
        if (actual == null) throw new AssertionError(message);
    }

    static String outcome(Runnable test) {
        try { test.run(); return "PASS"; }
        catch (AssertionError e) { return "FAIL (" + e.getMessage() + ")"; }
    }

    public static void main(String[] args) {
        String name = null;                                  // the bug this test exists to catch
        String before = outcome(() -> assertNotNull4("name is set", name));
        String ported = outcome(() -> assertNotNull5("name is set", name));  // same call, new order
        String fixed  = outcome(() -> assertNotNull5(name, "name is set"));

        System.out.printf("JUnit 4, original call  : %s%n", before);
        System.out.printf("JUnit 5/6, ported as-is : %s%n", ported);
        System.out.printf("JUnit 5/6, message last : %s%n", fixed);

        if (!ported.equals("PASS")) throw new AssertionError("expected the silent pass");
        if (!fixed.startsWith("FAIL")) throw new AssertionError("the fixed call must catch the bug");
    }
}
```

**Output:**

```
JUnit 4, original call  : FAIL (name is set)
JUnit 5/6, ported as-is : PASS
JUnit 5/6, message last : FAIL (name is set)
```

<details>
<summary><strong>Read as text</strong> — continued: why the port compiles and how to migrate</summary>

The ported call compiles because `name` is a `String`, so it fits the `message` slot. Do the migration with an automated recipe (OpenRewrite has a JUnit 4 → 5 one) rather than by hand, then upgrade 5 → 6.

</details>

### AssertJ

<details>
<summary><strong>Read as text</strong> — fluent assertions and why AssertJ won</summary>

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

</details>

### Mockito

<details>
<summary><strong>Read as text</strong> — mocks, Mockito 5, Testcontainers and the interview answer</summary>

```java
OrderRepository repo = mock(OrderRepository.class);
when(repo.findById(1L)).thenReturn(Optional.of(order));

var service = new OrderService(repo);
service.ship(1L);

verify(repo).save(argThat(o -> "SHIPPED".equals(o.status())));
```

Verify the outcome you care about (`save`), not every call. With a plain `mock()`, adding `verifyNoMoreInteractions(repo)` here would *fail*: the stubbed `findById` call counts as an interaction too, and blanket "nothing else happened" checks make tests brittle anyway.

Since Mockito 5 (2023) the inline mock maker is the default, so `mock()` works on final classes and `mockStatic()` on static methods without an extra extension — a 2022-era workaround you can now delete. One newer detail: on JDK 21+ Mockito prints a warning that it is "self-attaching" an agent, because the JDK now warns about agents loaded at runtime and a future release will block them by default. The fix, from Mockito's own docs, is a few lines of Surefire or Gradle config that pass `mockito-core` to the test JVM as `-javaagent`.

The judgement call hasn't changed: mock the collaborators you own, and use a real Postgres in Testcontainers rather than a mock `DataSource`, because mocked SQL only proves your mock agrees with itself.

**One-liners worth knowing:** *Testcontainers* — real dependencies (Postgres, Kafka…) in throwaway Docker containers. Version 2.0 (October 2025) renamed the modules to `testcontainers-<name>` (e.g. `testcontainers-postgresql`) and dropped JUnit 4 support; Spring Boot wires containers in with `@ServiceConnection` (§38b.7 Testing), and Docker itself is in [Ch 22](#content/22_engineering_tools). *JaCoCo* — coverage reporting; a smoke detector, not a target. *Spotless* / *google-java-format* / *Checkstyle* — formatting enforced in CI, so pull requests stop arguing about braces.

> **Interview —** *"How do you decide what to unit test versus integration test?"*
>
> **Say:** Unit-test the logic that has branches and edge cases — pricing rules, validation, state machines — with no framework and minimal mocks, because those tests must be fast enough to run on every save. Integration-test the seams where I'd otherwise just be asserting that my mock agrees with itself: SQL and mapping, serialization, HTTP contracts, transaction boundaries. Testcontainers makes that second bucket cheap enough that mocking a database is no longer defensible.
>
> **They follow up with:** *"What coverage number do you aim for?"* — None, as a target. Coverage tells you what is definitely *untested*; the moment it becomes a goal, people write assertion-free tests to hit it. I'd rather look at mutation testing, or at whether the critical paths have meaningful assertions.

</details>

<details>
<summary><strong>Quick check.</strong> You port a JUnit 4 test unchanged: <code>assertEquals("user name", "alice", user.name());</code>. <code>user.name()</code> really is <code>"alice"</code>, yet the test fails with <code>alice ==&gt; expected: &lt;user name&gt; but was: &lt;alice&gt;</code>. Why, and what is the more dangerous sibling of this bug?</summary>

In JUnit 4 the message came **first**: `assertEquals(String message, Object expected, Object actual)`. JUnit 5 and 6 moved it **last**: `assertEquals(Object expected, Object actual, String message)`. All three arguments here are `String`s, so the old call still compiles — but now `"user name"` is the *expected* value, `"alice"` is the *actual* value, and `user.name()` is just the failure message. It can never pass. The correct form is `assertEquals("alice", user.name(), "user name")`.

With an `int` it would not even compile (there is no `(String, int, int)` overload) — that is the lucky case. The dangerous sibling is `assertNotNull("name is set", name)`: it checks the literal string, which is never null, so it passes even when `name` is null (the program above shows it). A green build hides it, which is why the migration is worth doing with an automated recipe rather than by hand.
</details>

---

## 38b.9 The JVM in Ten Minutes — Memory, GC, and Diagnostics ★★

![JVM infographic: the JVM process holds a shared heap (Young: Eden, S0, S1 and Old), metaspace, code cache, one ~1 MB stack per platform thread and direct buffers; a minor GC copies survivors from Eden to S0/S1 and to Old after 15 copies, so allocating 1 GB and keeping 2% alive copies about 20 MB. JIT warm-up climbs from interpreter to C1 at ~200 calls and C2 at ~5,000 calls, with deoptimise back to the interpreter; an AOT cache cut Spring PetClinic start from 4.486 s to 2.604 s. A 2 GB pod gets 512 MB of heap by default (25%); -XX:MaxRAMPercentage=75 gives 1.5 GB heap plus 0.5 GB non-heap. Collector table: G1 default (goal 200 ms), ZGC under 1 ms, Shenandoah, Parallel, Serial. Trap: StackOverflowError is not OutOfMemoryError.](diagrams/java38b_info_jvm_memory_gc_ai.png)

#### Simple Explanation

<details>
<summary><strong>Read as text</strong> — stack, heap and metaspace as a restaurant</summary>

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

A virtual thread's stack is not in that "STACKS" region: when it blocks, its frames are moved to the **heap** as an ordinary object and its carrier thread is freed. That is the entire trick behind §38b.6, and why a million virtual threads is a heap-sizing question rather than an OS one.

</details>

### Generational GC in one picture

<details>
<summary><strong>Read as text</strong> — generations, the collectors, container heap sizing and the flags</summary>

```
  new object
      │
      ▼
  ┌────────┐  minor GC  ┌───────┐  survived N  ┌────────┐
  │  Eden  │ ─────────▶ │ S0/S1 │ ───────────▶ │  Old   │
  └────────┘  copy the  └───────┘   copies     └────────┘
   most die   survivors           (default 15)  major GC:
   right here                                   rare, costly
```

> **Maths in one line:** `minor-GC work ≈ live young objects, not bytes allocated` — allocate 1 GB, keep 2% alive, and the collector copies about 20 MB.

The weak generational hypothesis: **most objects die young.** A minor GC copies only the live objects out of Eden and wipes the rest in bulk, so its cost tracks what survives, not what you allocated — which is why short-lived allocation is far cheaper than 2022-you assumes. (Every boxed `Integer` is one such heap object; hence the Integer cache in [Ch 38](#content/38_java_refresher).) The picture is the logical view: G1 and ZGC split the heap into many equal-sized regions, and each region plays the Eden, survivor or old role.

| Collector | Typical pause | Pick it when | Switch on with |
|---|---|---|---|
| **G1** | tens of ms (default goal 200 ms) | the default: balanced throughput and latency for most heaps | (default) `-XX:+UseG1GC` |
| **ZGC** | < 1 ms | latency SLOs matter; large heaps. Generational only since 24 | `-XX:+UseZGC` |
| **Shenandoah** | short, not tied to heap size | low-latency alternative in most OpenJDK builds (not Oracle's) | `-XX:+UseShenandoahGC` |
| **Parallel** | long, but most throughput | batch jobs where throughput beats pause time | `-XX:+UseParallelGC` |
| **Serial** | long, one thread | tiny containers, one core, short-lived CLI tools | `-XX:+UseSerialGC` |

**Which one you get without a flag.** G1 has been the default since Java 9 — except that up to Java 26 the JVM silently picks **Serial** when it sees 1 CPU or less than 1792 MB of RAM, which surprises people in small containers. Java 27 (September 2026, JEP 523) makes G1 the default everywhere. ZGC version note: generational mode arrived in 21, became the default in 23 and the only mode in 24, so `-XX:+ZGenerational` is obsolete — `-XX:+UseZGC` alone is correct.

**Sizing the heap in a container.** Since JDK 10 the JVM reads the container's memory limit, and by default it takes only **25%** of it for the heap (`MaxRAMPercentage = 25`). A 2 GB pod therefore gets a 512 MB heap. Raise it to about 75% (1.5 GB) and leave the rest for metaspace, thread stacks, code cache and direct buffers — if heap plus non-heap memory exceeds the limit, the kernel kills the process (exit code 137, "OOMKilled") with no Java exception and no heap dump.

| Flag | What it does |
|---|---|
| `-XX:MaxRAMPercentage=75` | max heap as a share of the container limit; prefer it to `-Xmx` under Kubernetes |
| `-Xms` / `-Xmx` | initial / max heap in bytes; on a fixed-size host set them equal to avoid resize pauses |
| `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps` | a crash leaves evidence |
| `-Xlog:gc*:file=gc.log` | GC log: every pause, its cause and duration |
| `-Xss512k` | stack size per platform thread (default about 1 MB) |
| `-XX:+UseCompactObjectHeaders` | 8-byte instead of 12-byte object headers: less heap. Product in 25, default in 27 |

Plain Java, standard library only. Each thread gets its own fixed-size stack; objects go to the shared heap. The program gives two threads different stack sizes (like `-Xss256k` and `-Xss4m`) and recurses until each overflows:

</details>

```java
// Stack vs heap: each thread's stack is small and fixed; objects live on the shared heap
public class StackVsHeap {
    static int depth;
    static void recurse() { depth++; recurse(); }

    static int maxDepth(long stackBytes) throws InterruptedException {
        int[] result = new int[1];
        Thread t = new Thread(null, () -> {
            depth = 0;
            try { recurse(); }                        // each call pushes a frame
            catch (StackOverflowError e) { result[0] = depth; }
        }, "probe", stackBytes);
        t.start();
        t.join();
        return result[0];
    }

    public static void main(String[] args) throws InterruptedException {
        int small = maxDepth(256 * 1024);             // like -Xss256k
        int big = maxDepth(4 * 1024 * 1024);          // like -Xss4m, 16x bigger
        System.out.println("both threads hit StackOverflowError : " + (small > 0 && big > 0));
        System.out.println("16x bigger stack recursed deeper    : " + (big > small));

        byte[] blob = new byte[8 * 1024 * 1024];      // 8 MB object on the shared heap
        System.out.println("heap allocation after the overflows : " + blob.length + " bytes");
        blob = null;                                  // unreachable now: garbage
        System.gc();                                  // a hint, never a command

        if (big <= small) throw new AssertionError("a bigger stack should allow deeper recursion");
    }
}
```

**Output:**

```
both threads hit StackOverflowError : true
16x bigger stack recursed deeper    : true
heap allocation after the overflows : 8388608 bytes
```

<details>
<summary><strong>Read as text</strong> — continued: StackOverflowError is not OutOfMemoryError</summary>

The exact depths depend on the JDK and on whether the JIT has compiled `recurse` yet, so the program prints only the comparison. Note the two failures are unrelated: `StackOverflowError` means one thread recursed too deep and says nothing about the heap — the 8 MB allocation right after it works; `OutOfMemoryError` means the heap, metaspace or the OS is exhausted.

</details>

### JIT warm-up and the AOT cache

<details>
<summary><strong>Read as text</strong> — interpreter, C1, C2, deoptimisation and the AOT cache</summary>

Your code starts slow and gets fast. `javac` produces bytecode; the JVM first **interprets** it while counting calls and loop iterations. A method that gets warm is compiled by **C1**, a quick compiler that also records a profile (which branches run, which types show up). A method that gets hot is recompiled by **C2** using that profile — inlining, escape analysis, loop optimisations. If a profile assumption later breaks (say, a second implementation of an interface appears), the JVM **deoptimises** that method back to the interpreter and starts over.

```
  bytecode ──▶ INTERPRETER       counts calls and loop iterations
                   │ ~200 calls
                   ▼
               C1  (tier 3)      quick compile + record a profile
                   │ ~5,000 calls
                   ▼
               C2  (tier 4)      optimise using the profile: inlining,
                   │             escape analysis, loop optimisations
                   │ an assumption breaks (e.g. a new subclass loads)
                   ▼
               deoptimise ──▶ back to the interpreter, profile again
```

The ~200 and ~5,000 are HotSpot's default call thresholds (`Tier3InvocationThreshold`, `Tier4InvocationThreshold`); loop iterations and compile-queue length also count, so read them as orders of magnitude. Two consequences: the first requests after a deploy are slow, and a hand-written `System.nanoTime()` loop measures warm-up instead of your code — use JMH for microbenchmarks.

Startup and warm-up have changed a lot since 2022:

| Option | What it skips at startup | Catch | Since |
|---|---|---|---|
| CDS (class data sharing) | parsing the JDK's own classes | none — a default archive ships with the JDK | default archive since JDK 12 |
| AOT cache (Project Leyden) | reading, parsing, loading and linking your classes; from 25 also early method profiles | one training run; production must use the same JDK, OS, CPU architecture and class path | JDK 24, one-step in 25, any GC in 26 |
| GraalVM native image | the JVM itself: compiled to a native binary | closed world: reflection config, no runtime class loading, slow builds | separate GraalVM toolchain (§38b.7) |

```bash
java -XX:AOTCacheOutput=app.aot -cp app.jar com.example.App   # JDK 25+ training run: exercise normal startup, writes the cache
java -XX:AOTCache=app.aot -cp app.jar com.example.App         # every production start reads it
```

For scale, the JEP 483 measurement: Spring PetClinic started in 4.486 s on JDK 23 and 2.604 s on JDK 24 with an AOT cache (42% faster). The JEPs are 483 (JDK 24, class loading and linking), 514 (JDK 25, the one-step `AOTCacheOutput`), 515 (JDK 25, method profiles) and 516 (JDK 26, works with ZGC too).

</details>

### Diagnosing a sick JVM

<details>
<summary><strong>Read as text</strong> — jcmd, JFR, heap dumps, the causes of OutOfMemoryError and the interview answer</summary>

| Tool | The question it answers |
|---|---|
| `jcmd <pid> Thread.print` | what is every platform thread doing *right now*? |
| `jcmd <pid> Thread.dump_to_file -format=json dump.json` | the same, **including virtual threads** (`Thread.print` and `jstack` leave them out) |
| `jcmd <pid> GC.heap_info` | how big is the heap and how full is it? |
| `jcmd <pid> VM.native_memory` | where did non-heap memory go? (needs `-XX:NativeMemoryTracking=summary`) |
| `jmap -histo:live <pid>` | which classes hold the most live objects? |
| `jstack <pid>` | thread dump; finds deadlocks |
| **JFR** (`jcmd <pid> JFR.start duration=60s filename=app.jfr`) | low-overhead always-on profile of allocation, locks, I/O; read it in JDK Mission Control or with `jfr view` |
| heap dump + Eclipse MAT | which object graph is *retaining* the memory? |

`jcmd` has quietly absorbed most of the others — learn it first. JFR is the one that changes how you work: its default settings typically cost under 1% overhead, so it is safe to leave on in production, and it answers "what was this process doing at 03:14?" after the fact.

**What actually causes `OutOfMemoryError`**, roughly by frequency: an unbounded cache (a `HashMap` with no eviction — use Caffeine with a `maximumSize`); an unbounded read (`findAll()` on a 20-million-row table, or a queue with no capacity bound); a `ThreadLocal` value in a pooled thread that is never destroyed; and classloader leaks on hot redeploy.

One variant isn't a heap problem at all: `OutOfMemoryError: unable to create native thread` means the OS refused you another platform thread — a process or container thread limit, or no memory left for one more ~1 MB stack. Thousands of blocked platform threads are the classic cause, and the strongest argument for the virtual threads of §38b.6.

> **Interview —** *"A service's p99 latency spikes every few minutes. How do you find out whether it's GC?"*
>
> **Say:** Correlate first, tune never. Turn on GC logging (`-Xlog:gc*`) or read the JFR recording and line the pause events up against the latency spikes — if they're GC pauses, they match to the second. If they do, ask *why*: a rising allocation rate, a growing cache so every collection copies more live data, or a heap too small for the working set. Only then consider a collector change. If the pauses *don't* line up it was never GC, and JFR will usually show lock contention or a slow downstream call instead.
>
> **They follow up with:** *"When would you not use ZGC?"* — When throughput matters more than pause time. ZGC does more concurrent work, costing CPU and memory headroom to buy short pauses; for a batch job, Parallel or G1 finishes sooner.

</details>

<details>
<summary><strong>Quick check.</strong> A service restarts every few hours with <code>OutOfMemoryError: Java heap space</code>. Heap usage climbs steadily and never falls, even after a full GC. Where do you look first, and with what?</summary>

"Never falls after a full GC" is the diagnosis: this is not garbage the collector failed to reach, it is memory something still **holds a reference to**. A leak, not a tuning problem.

Get a heap dump — `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps` so the *next* crash produces one automatically, or `jcmd <pid> GC.heap_dump /dumps/heap.hprof` on a live process. Open it in Eclipse MAT and read the **dominator tree**, which ranks objects by *retained* size: the memory freed if that one object went away. That names the owner directly.

In practice it is nearly always a static `Map` cache with no eviction, an unbounded query result, or a `ThreadLocal` in a pooled thread. Raising `-Xmx` only changes how long you wait for the same crash.
</details>

---

## Key Takeaways

```
╔════════════════════════════════════════════════════════════════╗
║  MODERN JAVA — WHAT TO REMEMBER                                ║
║  ────────────────────────────────────────────────────────────  ║
║  LTS releases you missed: Java 21 (Sep 2023), 25 (Sep 2025)    ║
║  Newest release: Java 27 (Sep 2026). Next LTS: 29, Sep 2027    ║
║  ────────────────────────────────────────────────────────────  ║
║  SYNTAX                                                        ║
║  var = local inference only. No fields, params, or null        ║
║  Text blocks (triple-quoted) end escaped JSON and SQL soup     ║
║  switch EXPRESSIONS return a value: arrow form, yield,         ║
║  no fall-through, and exhaustiveness is checked                ║
║  _ for unused variables (22). Java 25: code before super(),    ║
║  import module, and void main() in compact source files        ║
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
║  Primitive types in patterns: still PREVIEW in 27              ║
║  ────────────────────────────────────────────────────────────  ║
║  Sequenced collections: getFirst/getLast/reversed              ║
║  orElse is EAGER; orElseGet is lazy. Never bare get()          ║
║  Stream.toList() returns an UNMODIFIABLE list                  ║
║  Gatherers (final in 24): windowSliding, scan, fold            ║
║  ────────────────────────────────────────────────────────────  ║
║  VIRTUAL THREADS                                               ║
║  Cheap: millions of them. Blocking parks a continuation        ║
║  instead of an OS thread, so thread-per-request works again    ║
║  For I/O ONLY. CPU-bound work is still bounded by cores        ║
║  Never pool them. Do not lean on ThreadLocal                   ║
║  Cap a downstream with a Semaphore(20), not a small pool       ║
║  Pinning: synchronized blocked unmounting (Java 21) — use      ║
║  ReentrantLock. Java 24 (JEP 491) removed most of this.        ║
║  Find pinning with the JFR event jdk.VirtualThreadPinned       ║
║  Scoped values: FINAL in 25. Structured concurrency: still     ║
║  PREVIEW in 27 (seventh preview, JEP 533)                      ║
║  ────────────────────────────────────────────────────────────  ║
║  SPRING BOOT                                                   ║
║  Boot 3 needs Java 17+ and javax.* became jakarta.*            ║
║  Boot 4 (Nov 2025, Framework 7) is current — still Java 17+    ║
║  Boot 4 work: webmvc starter, Jackson 3, @MockitoBean          ║
║  Migrate 2.7 -> 3.5 -> 4 with OpenRewrite recipes, not regex   ║
║  Virtual threads in Boot: spring.threads.virtual.enabled=true  ║
║  Entities cannot be records. DTOs should be                    ║
║  Watch N+1 selects: @EntityGraph or join fetch                 ║
║  ────────────────────────────────────────────────────────────  ║
║  BUILD & TEST                                                  ║
║  Commit the wrapper (mvnw / gradlew): it pins the build tool   ║
║  JUnit 6 = JUnit 5's API on Java 17+. Message goes LAST:       ║
║  a ported assertNotNull("msg", s) checks the literal           ║
║  Gradle 9: declare junit-platform-launcher yourself            ║
║  ────────────────────────────────────────────────────────────  ║
║  JVM                                                           ║
║  G1 is the default (everywhere from 27); ZGC: < 1 ms pauses    ║
║  Container heap default = 25% of the limit. Set                ║
║  MaxRAMPercentage, and leave room for non-heap memory          ║
║  JIT: interpreter -> C1 -> C2. AOT cache (24+) cuts startup    ║
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

`Stream.toList()` (Java 16) returns an **unmodifiable** list — this differs from the older `collect(Collectors.toList())`, which in practice returns a mutable `ArrayList` (its spec promises nothing about mutability). It's a common surprise when modernising old code, because the migration looks like a pure simplification.

If you need mutability, use `collect(Collectors.toCollection(ArrayList::new))` or wrap it. If you don't, `toList()` is the better default: it's shorter and communicates that the result isn't meant to be modified.
</details>

**7.** Your service runs in a Kubernetes pod with a 2 GB memory limit and no heap flags. How big is the heap, and what goes wrong if you "fix" it with `-Xmx2g`?

<details>
<summary>Answer</summary>

By default the JVM takes **25% of the container limit** for the heap (`MaxRAMPercentage = 25`), so the heap tops out at **512 MB** — the service hits `OutOfMemoryError` long before the pod is full.

`-Xmx2g` overshoots the other way. The heap is not the whole process: metaspace, one stack per platform thread, the JIT's code cache, direct buffers and the GC's own bookkeeping all live outside it. Once heap plus non-heap memory passes 2 GB, the kernel kills the process (exit code 137, "OOMKilled") — no Java exception, no heap dump. The fix is `-XX:MaxRAMPercentage=75`: about 1.5 GB of heap, roughly 500 MB left for everything else, and the setting follows the pod if its limit changes. `jcmd <pid> VM.native_memory` (with Native Memory Tracking on) shows where the non-heap memory goes.
</details>

**8.** A record has a `List<String> tags` field. Is it immutable?

<details>
<summary>Answer</summary>

**Only shallowly.** The *reference* is final, so nobody can point `tags` at a different list — but the list itself is fully mutable, and a caller who kept a reference to the list they passed in can still add to it, mutating your "immutable" record from the outside.

Fix it in the **compact constructor**: `tags = List.copyOf(tags);` — this both copies and returns an unmodifiable list, so neither the caller's reference nor the accessor's return value can be used to modify it. Note `List.copyOf` rejects nulls, which is usually desirable and occasionally surprising.
</details>

**9.** What may and may not appear before `super(...)` in a Java 25 constructor, and why?

<details>
<summary>Answer</summary>

**Allowed:** validating arguments, computing local variables, and assigning the class's *own* fields. **Not allowed:** calling instance methods or reading fields — javac rejects it with "cannot reference … before supertype constructor has been called".

The reason is initialisation order: the superclass part of the object does not exist yet, so nothing may observe the half-built object. Flexible constructor bodies (final in Java 25) let you fail fast *before* an expensive superclass constructor runs, instead of squeezing validation into a static helper inside the `super(...)` argument list.
</details>

**10.** You need day-over-day changes from a `List<Integer>` of prices without index arithmetic. What do you write, and what does `[100, 103, 101, 108]` give?

<details>
<summary>Answer</summary>

```java
prices.stream()
      .gather(Gatherers.windowSliding(2))
      .map(w -> w.get(1) - w.get(0))
      .toList();                          // [3, -2, 7]
```

`windowSliding(2)` emits the overlapping pairs `[100, 103]`, `[103, 101]`, `[101, 108]`, and the `map` turns each pair into a difference. Gatherers are final in Java 24, so this needs Java 24+ (the Java 25 LTS is fine). In a coding interview a plain indexed loop is still perfectly acceptable.
</details>

**11.** After every deploy, a service takes several seconds to start and its first few hundred requests are slow. What causes each effect, and what do JDK 24–26 offer?

<details>
<summary>Answer</summary>

**Slow start** is mostly finding, parsing, loading and linking thousands of classes (plus framework start-up work). **Slow first requests** are JIT warm-up: code starts in the interpreter, becomes C1-compiled after roughly 200 calls and C2-optimised after roughly 5,000, so the first traffic runs the slow tiers.

Project Leyden's **AOT cache** attacks both. Do a training run with `-XX:AOTCacheOutput=app.aot` (one step since JDK 25), then start production with `-XX:AOTCache=app.aot`. The cache holds classes already loaded and linked (JDK 24, JEP 483 — Spring PetClinic went from 4.486 s to 2.604 s) and, from JDK 25, method profiles so C2 can start compiling sooner (JEP 515); from JDK 26 it works with any GC, including ZGC (JEP 516). The catch: production must use the same JDK, OS, CPU architecture and class path as the training run. If you need startup in milliseconds and can live with a closed world, the alternative is a GraalVM native image.
</details>

**12.** You are moving a Spring Boot 3.5 service to Boot 4. Name three changes that commonly break the build or the tests.

<details>
<summary>Answer</summary>

1. **Modular starters.** `spring-boot-starter-web` becomes `spring-boot-starter-webmvc`, and features such as Flyway now need their own starter (`spring-boot-starter-classic` is a temporary bridge).
2. **Jackson 3.** `com.fasterxml.jackson.databind` moves to `tools.jackson.databind` (the annotations keep their old package), which breaks custom serializers and `ObjectMapper` configuration.
3. **Tests.** `@MockBean` and `@SpyBean` are gone — use `@MockitoBean` / `@MockitoSpyBean` — and `@SpringBootTest` no longer sets up `MockMvc` without `@AutoConfigureMockMvc`.

Also: APIs deprecated in 3.x are deleted, Undertow is dropped, and Spring Security 7 accepts only the lambda DSL. Upgrade to the latest 3.5.x first and clear every deprecation warning, then move to 4 with the OpenRewrite `UpgradeSpringBoot_4_0` recipe rather than by regex.
</details>

**13.** 1,000 requests run on virtual threads, but the database allows 20 connections. How do you stop them all hitting it at once, and why not a 20-thread pool?

<details>
<summary>Answer</summary>

Wrap the call in a `Semaphore(20)` — or `@ConcurrencyLimit(20)` in Spring Framework 7. A virtual thread waiting on the semaphore parks and frees its carrier, so you keep one cheap thread per request and plain blocking code, while at most 20 are inside the database call at any moment.

A 20-thread pool would bring back exactly what virtual threads removed: a queue in front of a fixed number of threads, and request handling capped by pool size rather than by the real bottleneck.
</details>

---

**Next:** [Ch 31 — DSA & ML Coding (Java)](#content/31_dsa_foundations) to put the language to work, or revisit [Ch 21 — OO Design & SOLID (Java)](#content/21_design_fundamentals) now that sealed types and records change how you'd model several of those patterns.
