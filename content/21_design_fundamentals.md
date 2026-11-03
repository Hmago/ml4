# Chapter 21 — Object-Oriented Design, SOLID & Design Patterns (Java)

> "Any fool can write code that a computer can understand. Good programmers write code
> that humans can understand." — Martin Fowler

**What this chapter covers:**
The object-oriented design foundation a senior engineer is expected to reason about fluently: the four **OOP pillars** and **UML** notation, the **SOLID** principles, the supporting design principles (DRY, KISS, YAGNI, composition over inheritance, coupling & cohesion), the most important **design patterns**, and essential **Java concurrency**. Every principle and pattern comes with a complete, runnable **Java** program and its exact output. Written to be understood by anyone, but deep enough for interviews at Google, Amazon, Meta, and top-tier companies.

**Why Java?** Google's production backends are written mainly in C++, Java and Go (with Python for ML and tooling). Java is the usual language for object-oriented design interviews because interfaces, access modifiers and generics make design ideas visible in the code itself.

> **Scope note:** This chapter used to also cover system design, databases, distributed systems, infrastructure tooling, and security. Those now live in dedicated, deeper chapters (**22–26**) — see **Where to Go Next** near the end. Keeping each topic in one place stops the same concept from drifting out of sync across chapters.

---

## What You'll Learn

After reading this chapter, you will be able to:
- Explain the four OOP pillars and read or draw a UML class diagram on a whiteboard
- Apply the SOLID principles and know when each one matters most
- Spot violations of SRP, OCP, LSP, ISP, and DIP in real code — and fix them
- Recognize and implement the most important creational, structural, and behavioral design patterns
- Tell the look-alike patterns apart (Adapter vs Facade vs Decorator vs Proxy)
- Reach for the right principle (DRY, KISS, YAGNI, composition over inheritance, Law of Demeter) instead of over-engineering
- Reason about thread safety, locks, atomics, executors, and the classic concurrency pitfalls in Java

---

## Table of Contents

| Part | Topic | Key Concepts |
|------|-------|--------------|
| 1 | Software Design Principles | OOP pillars & UML notation, SOLID, DRY, KISS, YAGNI, Composition over Inheritance, Separation of Concerns, Law of Demeter, Coupling & Cohesion |
| 2 | Design Patterns | Creational (Singleton, Factory, Abstract Factory, Builder), Structural (Adapter, Facade, Decorator, Proxy, Composite + a look-alike comparison), Behavioral (Observer, Strategy, Command, State, Template Method, Chain of Responsibility) |
| 3 | Java Concurrency (Google Must-Know) | Thread safety, `synchronized`, `AtomicInteger`, `ConcurrentHashMap`, producer-consumer, `ExecutorService`, `CompletableFuture`, read-write locks, deadlocks (virtual threads → Ch 38b) |
| 4 | Review Questions | Self-test with answers to all 10 questions |

> System design, databases, distributed systems, infrastructure tooling, and security are covered in **Chapters 22–26** — see the cross-reference table at the end of this chapter.

---

# PART 1: SOFTWARE DESIGN PRINCIPLES

![Map infographic of the OO design chapter: a cost-of-change graph (Bad design = exponential cost, Good design = near-constant cost over Time / Project Size); without vs with principles timeline ('It works!' day 1 → 'Rewrite everything' year 1 vs 'Still maintainable' year 3); the chapter in 4 layers (Vocabulary: 4 OOP pillars + UML; Principles: SOLID, DRY, KISS, YAGNI, composition, SoC, Law of Demeter, cohesion/coupling; Patterns: Creational / Structural / Behavioral; Java concurrency); and a pick-by-symptom table (e.g. 'Every new case edits an if/else' → OCP, 'count++ shared by threads' → AtomicInteger / synchronized).](diagrams/ood21_info_chapter_map_ai.png)

---

## 1.1 Why Design Principles Matter

<details>
<summary><strong>Read as text</strong> — the analogy and the payoff over time</summary>

**Simple Explanation:**
Imagine building a house. You COULD just start nailing boards together randomly.
It might even stand up for a while. But the first time you need to add a room,
fix plumbing, or survive a storm — it falls apart.

Design principles are the architectural rules that make your code survive
real-world change. Code that's easy to change is code that lasts.

```
  WITHOUT PRINCIPLES:                WITH PRINCIPLES:
  ───────────────────────            ──────────────────────────
  "It works!" (day 1)               "It works!" (day 1)
  "It's fragile" (month 1)          "It's clean" (month 1)
  "Don't touch it" (month 6)        "Easy to extend" (month 6)
  "Rewrite everything" (year 1)     "Still maintainable" (year 3)
```

</details>

### The Cost of Bad Design

<details>
<summary><strong>Read as text</strong> — the cost-of-change graph</summary>

```
  Cost of
  Change
     |                        * <- Bad design
     |                    *       (exponential cost)
     |                *
     |            *
     |        *  ___________  <- Good design
     |    *  /                   (near-constant cost)
     |  * /
     | */
     |/
     +-----------------------> Time / Project Size
```

</details>

---

## 1.1b OOP Pillars & UML Notation — The Vocabulary

![OOP pillars and UML infographic: the four pillars (encapsulation, abstraction, inheritance, polymorphism) in plain words; a UML class box for «abstract» Card with visibility symbols; a class diagram of the program (Card and GiftVoucher implement «interface» PaymentMethod, DebitCard and CreditCard extend Card) tagged with each pillar and m.pay(50) fanning out to three results; the program output (DebitCard pay(50) → paid 50.00 from debit, CreditCard → paid 51.00 incl. fee, GiftVoucher → voucher covers 50.00, pay(80) → declined, balance 50.00); and a legend of the six UML arrows with strength uses < knows < has < owns.](diagrams/ood21_info_oop_pillars_uml_ai.png)

<details>
<summary><strong>Read as text</strong> — why these two vocabularies come first</summary>

**Simple Explanation:**
Before the principles, two pieces of vocabulary. The **four pillars** are the four tools every
object-oriented language gives you; every principle and pattern in this chapter is just a
disciplined way of using them. **UML** (Unified Modeling Language) is the box-and-arrow drawing
people use on a whiteboard to show classes and how they relate. In an object-oriented design
interview you will draw it, so you need to read it fluently.

</details>

### The Four OOP Pillars

<details>
<summary><strong>Read as text</strong> — the four pillars, the diagram and the definition</summary>

| Pillar | Plain words | Java tool | In the program below |
|---|---|---|---|
| **Encapsulation** | Hide the data; only the object's own methods may change it, so its rules can't be broken from outside | `private` fields + methods | `Card.balance` is private; `withdraw()` refuses an overdraft |
| **Abstraction** | Show WHAT something does, hide HOW | `interface`, `abstract class` | callers only know `PaymentMethod.pay(amount)` |
| **Inheritance** | Reuse a parent's code by saying "X IS-A Y" | `extends` | `DebitCard` and `CreditCard` extend `Card` |
| **Polymorphism** | One call, many behaviours: the object's real class decides at runtime which code runs | method overriding + interface types | `m.pay(50)` gives three different results in one loop |

```
  PaymentMethod «interface»        ABSTRACTION: callers only know pay(amount)
      △            △
      ┆            ┆               dashed line + hollow triangle = "implements"
      ┆        GiftVoucher
      ┆
  Card «abstract»                  ENCAPSULATION: private balance, changed only
      △            △               through withdraw(), which refuses overdrafts
      │            │
      │            │               solid line + hollow triangle = "extends"
  DebitCard    CreditCard          INHERITANCE: both reuse Card's balance code

  POLYMORPHISM: one call, three behaviours
  for (PaymentMethod m : methods) m.pay(50);
      DebitCard   → "paid 50.00 from debit"
      CreditCard  → "paid 51.00 incl. fee"
      GiftVoucher → "voucher covers 50.00"
```

**Official Definition:**
> **Encapsulation** bundles data with the methods that operate on it and restricts direct access
> to that data. **Abstraction** exposes only an object's essential behaviour through a public
> interface. **Inheritance** lets a class acquire the fields and methods of a parent class (an
> "is-a" relationship). **Polymorphism** lets one interface stand for many forms: the method that
> runs is chosen at runtime from the object's actual class (dynamic dispatch).

</details>

**Java — the four pillars in one tiny program:**

```java
import java.util.*;

public class OopPillarsDemo {
    // ABSTRACTION: callers only see WHAT a payment method does, not HOW
    interface PaymentMethod {
        String pay(double amount);
    }

    // ENCAPSULATION: balance is private; the only way to change it is a checked method
    static abstract class Card implements PaymentMethod {
        private double balance;
        Card(double balance) { this.balance = balance; }
        protected boolean withdraw(double amount) {
            if (amount <= 0 || amount > balance) return false;   // the class guards its own rule
            balance -= amount;
            return true;
        }
        double balance() { return balance; }
    }

    // INHERITANCE: both cards reuse Card's balance logic (each IS-A Card)
    static class DebitCard extends Card {
        DebitCard(double balance) { super(balance); }
        public String pay(double amount) {
            return withdraw(amount) ? String.format("paid %.2f from debit", amount) : "declined";
        }
    }

    static class CreditCard extends Card {
        CreditCard(double limit) { super(limit); }
        public String pay(double amount) {
            double withFee = amount * 1.02;                      // 2% card fee
            return withdraw(withFee) ? String.format("paid %.2f incl. fee", withFee) : "declined";
        }
    }

    static class GiftVoucher implements PaymentMethod {          // not a Card at all
        public String pay(double amount) { return String.format("voucher covers %.2f", amount); }
    }

    static void pay(PaymentMethod m, double amount) {
        String type = m.getClass().getSimpleName();
        System.out.printf("%-11s pay(%.0f) -> %s%n", type, amount, m.pay(amount));
    }

    public static void main(String[] args) {
        DebitCard debit = new DebitCard(100);

        // POLYMORPHISM: the same call, three different behaviours
        for (PaymentMethod m : List.of(debit, new CreditCard(500), new GiftVoucher())) {
            pay(m, 50);
        }
        pay(debit, 80);                                          // only 50 left on the card
        System.out.printf("%-11s balance -> %.2f%n", "DebitCard", debit.balance());
    }
}
```

**Output:**

```
DebitCard   pay(50) -> paid 50.00 from debit
CreditCard  pay(50) -> paid 51.00 incl. fee
GiftVoucher pay(50) -> voucher covers 50.00
DebitCard   pay(80) -> declined
DebitCard   balance -> 50.00
```

### UML Class-Diagram Cheat Sheet

<details>
<summary><strong>Read as text</strong> — the class box, the six arrows and the definition</summary>

**Simple Explanation:**
A class is drawn as a box with three parts: name, fields, methods. The lines between boxes say
how classes relate — from the weakest link (a dependency: "uses it for a moment") to the
strongest (composition: "owns it, and it dies with me").

```
  ┌──────────────────────────────┐
  │ «abstract» Card              │  ← name; «interface» or «abstract» on top
  ├──────────────────────────────┤
  │ - balance: double            │  ← fields:  visibility name: type
  ├──────────────────────────────┤
  │ + pay(amount): String        │  ← methods: visibility name(params): type
  │ # withdraw(amount): boolean  │
  └──────────────────────────────┘
  Visibility:  + public    - private    # protected    ~ package-private
```

| Relationship | How it's drawn | Means | Java example |
|---|---|---|---|
| **Inheritance** | `DebitCard ───▷ Card` (solid line, hollow triangle at the parent) | is-a (`extends`) | `class DebitCard extends Card` |
| **Implementation** | `Card - - -▷ PaymentMethod` (dashed line, hollow triangle) | fulfils a contract (`implements`) | `class Card implements PaymentMethod` |
| **Association** | `Order ───> Customer` (solid line; arrow = who knows whom) | holds a long-lived reference | a `Customer customer` field in `Order` |
| **Aggregation** | `Team ◇─── Player` (hollow diamond at the whole) | has-a; the part can outlive the whole | a `Team` holds `Player`s created elsewhere |
| **Composition** | `Order ◆─── OrderLine` (filled diamond at the whole) | owns-a; the part dies with the whole | an `Order` creates its own `OrderLine`s |
| **Dependency** | `OrderService - - -> Mailer` (dashed arrow) | uses it briefly (a parameter or local variable) | `void notify(Mailer m)` |
| **Multiplicity** | `Order 1 ◆─── 1..* OrderLine` (numbers on the line ends) | how many on each end: `1`, `0..1`, `*`, `1..*` | one order has one or more lines |

```
  Strength of the link (weakest → strongest):
  dependency  <  association  <  aggregation  <  composition
  (uses)         (knows)          (has)           (owns)
```

**Interview tip:** in a 45-minute design round, draw boxes with names and the key methods only,
and get the arrow types right — that is what the interviewer reads. Skip getters and setters.

**Official Definition:**
> UML (Unified Modeling Language) is a standard visual notation, maintained by the Object
> Management Group (OMG), for specifying and documenting software designs. A class diagram shows
> classes with their attributes and operations, and the relationships between them
> (generalization, realization, association, aggregation, composition, dependency) with
> multiplicities.

</details>

---

## 1.2 SOLID Principles

![SOLID at a glance: five cards S, O, L, I, D, each with its one-line rule and a before → after sketch (UserManager → Authenticator, UserRepository, EmailService, ReportGenerator; if/else → «interface» Shape with Triangle added; Square extends Rectangle area 16 expected 20 → Shape interface; Worker with 5 methods → Coder, Tester, Designer, Manager; OrderService → MySQLDatabase → OrderService(Database, Mailer)); a history timeline 1987 Liskov, 1988 Meyer, 2000 Martin's paper, ~2004 Feathers coins SOLID; and a pick-by-question table mapping symptoms to each letter.](diagrams/ood21_info_solid_overview_ai.png)

<details>
<summary><strong>Read as text</strong> — the five letters and where they come from</summary>

SOLID is a set of five principles that make software designs more understandable,
flexible, and maintainable. Robert C. Martin ("Uncle Bob") collected and popularised them
(his 2000 paper *Design Principles and Design Patterns*); Michael Feathers coined the
**SOLID** acronym around 2004. Two of the ideas are older: the Open/Closed Principle comes
from Bertrand Meyer (1988) and the Liskov Substitution Principle from Barbara Liskov (1987).

```
  S — Single Responsibility Principle   one class, one reason to change
  O — Open/Closed Principle             add new code instead of editing old code
  L — Liskov Substitution Principle     a subclass must keep the parent's promises
  I — Interface Segregation Principle   many small interfaces, not one fat one
  D — Dependency Inversion Principle    depend on interfaces, not concrete classes
```

</details>

---

### S — Single Responsibility Principle (SRP)

![SRP infographic: UserManager doing login, storage, email and reports is split into Authenticator, UserRepository, EmailService and ReportGenerator — each with one reason to change](diagrams/ood21_info_srp_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Simple Explanation:**
A class should have only ONE reason to change. Like how a chef cooks food but
doesn't also do the accounting. Each person (class) has one job.

```java
  // BAD: One class does everything
  // ────────────────────────────────────────────────────────
  public class UserManager {
      public boolean authenticate(User user, String password) { ... }  // auth logic
      public void saveToDatabase(User user) { ... }                    // database logic
      public void sendWelcomeEmail(User user) { ... }                  // email logic
      public Report generateReport(User user) { ... }                  // reporting logic
  }

  // If email service changes, you modify UserManager.
  // If database changes, you modify UserManager.
  // If auth changes, you modify UserManager.
  // One class, FOUR reasons to change. Fragile!

  // GOOD: Each class has one responsibility
  // ────────────────────────────────────────────────────────
  public class Authenticator {
      public boolean authenticate(User user, String password) { ... }
  }

  public class UserRepository {
      public void save(User user) { ... }
      public Optional<User> findById(long id) { ... }
  }

  public class EmailService {
      public void sendWelcomeEmail(User user) { ... }
  }

  public class ReportGenerator {
      public Report generate(User user) { ... }
  }

  // Now email changes only affect EmailService.
  // Database changes only affect UserRepository.
  // Each class has ONE reason to change.
```

**How to spot SRP violations:**
```
  Ask: "What does this class do?"
  If you use the word "AND" — it probably does too much.

  "This class handles authentication AND sends emails"  ← violation!
  "This class handles authentication"                   ← good
```

**Official Definition:**
> A class should have one, and only one, reason to change. A "reason to change"
> corresponds to a single actor or stakeholder whose needs might evolve.

</details>

**Java — the split design, runnable:**

```java
import java.util.*;

public class SrpDemo {
    record User(long id, String name, String email, String passwordHash) {}

    // GOOD: four small classes, each with ONE reason to change

    static class Authenticator {                       // changes only when login rules change
        boolean authenticate(User user, String password) {
            return user.passwordHash().equals(hash(password));
        }
        static String hash(String password) { return Integer.toHexString(password.hashCode()); }
    }

    static class UserRepository {                      // changes only when storage changes
        private final Map<Long, User> rows = new HashMap<>();
        void save(User user) { rows.put(user.id(), user); }
        Optional<User> findById(long id) { return Optional.ofNullable(rows.get(id)); }
    }

    static class EmailService {                        // changes only when the email provider changes
        String sendWelcomeEmail(User user) {
            return "to " + user.email() + ": Welcome, " + user.name() + "!";
        }
    }

    static class ReportGenerator {                     // changes only when the report format changes
        String generate(User user) {
            return "#" + user.id() + ", " + user.name() + ", " + user.email();
        }
    }

    public static void main(String[] args) {
        Authenticator auth = new Authenticator();
        UserRepository repo = new UserRepository();
        EmailService email = new EmailService();
        ReportGenerator reports = new ReportGenerator();

        User alice = new User(1, "Alice", "alice@example.com", Authenticator.hash("s3cret"));
        repo.save(alice);
        System.out.println("find user 1         -> " + repo.findById(1).map(User::name).orElse("not found"));
        System.out.println("find user 2         -> " + repo.findById(2).map(User::name).orElse("not found"));
        System.out.println("login, right pass   -> " + auth.authenticate(alice, "s3cret"));
        System.out.println("login, wrong pass   -> " + auth.authenticate(alice, "guess"));
        System.out.println("welcome email       -> " + email.sendWelcomeEmail(alice));
        System.out.println("report              -> " + reports.generate(alice));
    }
}
```

**Output:**

```
find user 1         -> Alice
find user 2         -> not found
login, right pass   -> true
login, wrong pass   -> false
welcome email       -> to alice@example.com: Welcome, Alice!
report              -> #1, Alice, alice@example.com
```

---

### O — Open/Closed Principle (OCP)

![Open/Closed Principle infographic: the smell (AreaCalculator's if circle / else if rectangle / else if triangle must be edited for every new shape), the fix (Shape interface with area(); Circle, Rectangle, Triangle implement it; AreaCalculator just returns shape.area()), the power-strip analogy, a before → after UML diagram with Triangle marked NEW — no existing code edited, and the program output: Circle 3.14, Rectangle 20.00, Triangle 9.00, total 32.14.](diagrams/ood21_info_ocp_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Simple Explanation:**
Software entities should be **open for extension, but closed for modification.**
Think of a power strip — you can plug new devices in (extension) without
rewiring the strip itself (modification).

```java
  // BAD: Modifying existing code for every new shape
  // ────────────────────────────────────────────────────────
  public class AreaCalculator {
      public double calculate(Shape shape) {
          if (shape.getType().equals("circle")) {
              return Math.PI * shape.getRadius() * shape.getRadius();
          } else if (shape.getType().equals("rectangle")) {
              return shape.getWidth() * shape.getHeight();
          } else if (shape.getType().equals("triangle")) {  // ← must modify
              return 0.5 * shape.getBase() * shape.getH();   // ← every time!
          }
          throw new IllegalArgumentException("Unknown shape");
      }
  }
  // Adding a new shape = editing AreaCalculator = risk of breaking existing shapes!

  // GOOD: Extending through polymorphism
  // ────────────────────────────────────────────────────────
  public interface Shape {
      double area();
  }

  public class Circle implements Shape {
      private final double radius;
      public Circle(double radius) { this.radius = radius; }
      @Override public double area() { return Math.PI * radius * radius; }
  }

  public class Rectangle implements Shape {
      private final double width, height;
      public Rectangle(double w, double h) { this.width = w; this.height = h; }
      @Override public double area() { return width * height; }
  }

  public class Triangle implements Shape {              // ← just ADD a new class
      private final double base, height;
      public Triangle(double b, double h) { this.base = b; this.height = h; }
      @Override public double area() { return 0.5 * base * height; }
  }

  public class AreaCalculator {
      public double calculate(Shape shape) {
          return shape.area();                           // ← works for ANY shape, forever
      }
  }
```

**The key insight:** Use abstractions (interfaces, base classes) so new behavior
can be added by writing new code, not by changing existing code.

**Official Definition:**
> Software entities (classes, modules, functions) should be open for extension but
> closed for modification — you add new behavior by writing new code, without editing
> existing, already-tested code. (Bertrand Meyer, 1988; Martin's modern reading achieves it
> with interfaces and polymorphism, as above.)

</details>

**Java — the open/closed design, runnable** (`Triangle` was added without touching `AreaCalculator`):

```java
import java.util.*;

public class OcpDemo {
    interface Shape {
        double area();
    }

    record Circle(double radius) implements Shape {
        public double area() { return Math.PI * radius * radius; }
    }

    record Rectangle(double width, double height) implements Shape {
        public double area() { return width * height; }
    }

    record Triangle(double base, double height) implements Shape {   // added later: a NEW class,
        public double area() { return 0.5 * base * height; }         // no existing code edited
    }

    static class AreaCalculator {
        double calculate(Shape shape) { return shape.area(); }       // works for ANY shape, forever
        double total(List<Shape> shapes) {
            return shapes.stream().mapToDouble(this::calculate).sum();
        }
    }

    public static void main(String[] args) {
        AreaCalculator calc = new AreaCalculator();
        List<Shape> shapes = List.of(new Circle(1), new Rectangle(4, 5), new Triangle(6, 3));
        for (Shape s : shapes) {
            System.out.printf("%-32s -> %.2f%n", s, calc.calculate(s));
        }
        System.out.printf("%-32s -> %.2f%n", "total of all three", calc.total(shapes));
    }
}
```

**Output:**

```
Circle[radius=1.0]               -> 3.14
Rectangle[width=4.0, height=5.0] -> 20.00
Triangle[base=6.0, height=3.0]   -> 9.00
total of all three               -> 32.14
```

---

### L — Liskov Substitution Principle (LSP)

![Liskov Substitution Principle infographic: MutableSquare extends MutableRectangle and forces both sides equal, so testArea (setWidth(5), setHeight(4), expect 20) gives 20 for the rectangle but 16 for the square; the fix makes Rectangle and Square immutable implementations of a Shape interface; the program output (MutableSquare: area 16 (expected 20) BROKEN; Rectangle[width=5, height=4] → area 20; Square[side=4] → 16; Square[side=5] → 25); and the 4-question LSP checklist on preconditions and postconditions.](diagrams/ood21_info_lsp_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Simple Explanation:**
If you have a parent class and a child class, you should be able to use the
child ANYWHERE the parent is expected without breaking anything. A child should
be a TRUE substitute for its parent.

```java
  // THE CLASSIC VIOLATION: Square extends Rectangle
  // ────────────────────────────────────────────────────────

  public class Rectangle {
      protected int width, height;
      public void setWidth(int w)  { this.width = w; }
      public void setHeight(int h) { this.height = h; }
      public int area() { return width * height; }
  }

  public class Square extends Rectangle {
      @Override public void setWidth(int w)  {
          this.width = w;
          this.height = w;     // ← forces both to be equal!
      }
      @Override public void setHeight(int h) {
          this.width = h;
          this.height = h;     // ← forces both to be equal!
      }
  }

  // TEST (should work for ANY Rectangle):
  // ────────────────────────────────────────────────────────
  public void testArea(Rectangle rect) {
      rect.setWidth(5);
      rect.setHeight(4);
      assert rect.area() == 20;    // ← PASSES for Rectangle
                                    // ← FAILS for Square! (area = 16)
  }

  // Square VIOLATES LSP because it can't substitute for Rectangle
  // without breaking expectations. Mathematically a square IS a
  // rectangle, but in OOP behavior matters more than "is-a" taxonomy.
```

**How to check LSP:**
```
  1. Can the subclass do everything the parent promises?
  2. Does the subclass demand MORE from callers than the parent did?
     (a stronger precondition, e.g. rejecting inputs the parent accepted) → bad!
  3. Does the subclass promise LESS back than the parent did?
     (a weaker postcondition, e.g. setHeight() no longer leaves the width alone) → bad!
  4. Would the parent's existing tests still pass if you swap in the child?
```

*Precondition* = what a method requires from its caller; *postcondition* = what it guarantees
when it returns.

**The fix:** don't make `Square` a subclass of a *mutable* `Rectangle`. Let both implement a
common `Shape` with `area()` (and make them immutable), so no caller can rely on a promise that
`Square` cannot keep.

**Official Definition:**
> Objects of a superclass should be replaceable with objects of its subclasses
> without affecting the correctness of the program. (Barbara Liskov, 1987; formalised with
> Jeannette Wing in 1994.)

</details>

**Java — the violation and the fix, runnable:**

```java
public class LspDemo {
    // THE VIOLATION: a mutable Square that extends a mutable Rectangle
    static class MutableRectangle {
        protected int width, height;
        void setWidth(int w)  { this.width = w; }
        void setHeight(int h) { this.height = h; }
        int area() { return width * height; }
    }

    static class MutableSquare extends MutableRectangle {
        @Override void setWidth(int w)  { this.width = w; this.height = w; }
        @Override void setHeight(int h) { this.width = h; this.height = h; }
    }

    // The caller's expectation, written for ANY MutableRectangle
    static String testArea(MutableRectangle rect) {
        rect.setWidth(5);
        rect.setHeight(4);
        return rect.area() == 20 ? "area " + rect.area() + " (expected 20) OK"
                                 : "area " + rect.area() + " (expected 20) BROKEN";
    }

    // THE FIX: no setters that a subtype must break; both are just Shapes
    interface Shape { int area(); }
    record Rectangle(int width, int height) implements Shape {
        public int area() { return width * height; }
    }
    record Square(int side) implements Shape {
        public int area() { return side * side; }
    }

    public static void main(String[] args) {
        System.out.println("MutableRectangle: " + testArea(new MutableRectangle()));
        System.out.println("MutableSquare:    " + testArea(new MutableSquare()));
        Shape[] shapes = { new Rectangle(5, 4), new Square(4), new Square(5) };
        for (Shape s : shapes) {
            System.out.println(s + " -> area " + s.area());
        }
    }
}
```

**Output:**

```
MutableRectangle: area 20 (expected 20) OK
MutableSquare:    area 16 (expected 20) BROKEN
Rectangle[width=5, height=4] -> area 20
Square[side=4] -> area 16
Square[side=5] -> area 25
```

---

### I — Interface Segregation Principle (ISP)

![Interface Segregation Principle infographic: one fat Worker interface (code, test, design, managePeople, writeDocumentation) forces JuniorDeveloper to leave 3 methods empty; the fix splits it into Tester, Coder, Designer and Manager, with JuniorDeveloper implementing Tester and Coder and TechLead implementing Coder, Designer and Manager; restaurant-staff analogy; and the program output (codeSprint → junior writes a feature / lead fixes the hard bug, qaPass → junior writes unit tests, designReview → lead sketches the API, oneOnOnes → lead runs the 1:1s; oneOnOnes(junior) does not compile).](diagrams/ood21_info_isp_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Simple Explanation:**
Don't force classes to implement interfaces they don't use. It's like forcing
every restaurant employee to know how to cook, serve, AND do accounting.
The waiter doesn't need to know accounting.

```java
  // BAD: One fat interface forces unnecessary implementations
  // ────────────────────────────────────────────────────────
  public interface Worker {
      void code();
      void test();
      void design();
      void managePeople();
      void writeDocumentation();
  }

  public class JuniorDeveloper implements Worker {
      public void code() { /* OK */ }
      public void test() { /* OK */ }
      public void design() { /* doesn't do this! */ }
      public void managePeople() { /* definitely doesn't do this! */ }
      public void writeDocumentation() { /* forced to implement! */ }
  }

  // GOOD: Split into focused interfaces
  // ────────────────────────────────────────────────────────
  public interface Coder    { void code(); }
  public interface Tester   { void test(); }
  public interface Designer { void design(); }
  public interface Manager  { void managePeople(); }

  public class JuniorDeveloper implements Coder, Tester {
      public void code() { ... }      // ← only what's needed
      public void test() { ... }
  }

  public class TechLead implements Coder, Designer, Manager {
      public void code() { ... }
      public void design() { ... }
      public void managePeople() { ... }
  }
```

**Rule of thumb:** If a class implements an interface but leaves some methods
empty or throws "not supported" exceptions, the interface is too fat. Split it.

**Official Definition:**
> Clients should not be forced to depend on methods they do not use. Prefer many
> small, role-specific interfaces over one general-purpose "fat" interface.

</details>

**Java — role interfaces, runnable** (each client method asks only for the role it needs):

```java
import java.util.*;

public class IspDemo {
    // Small, role-specific interfaces instead of one fat Worker
    interface Coder    { String code(); }
    interface Tester   { String test(); }
    interface Designer { String design(); }
    interface Manager  { String managePeople(); }

    static class JuniorDeveloper implements Coder, Tester {          // only what it really does
        public String code() { return "junior writes a feature"; }
        public String test() { return "junior writes unit tests"; }
    }

    static class TechLead implements Coder, Designer, Manager {
        public String code()         { return "lead fixes the hard bug"; }
        public String design()       { return "lead sketches the API"; }
        public String managePeople() { return "lead runs the 1:1s"; }
    }

    // Each client asks only for the role it needs
    static void codeSprint(List<Coder> coders) {
        coders.forEach(c -> System.out.println("codeSprint   -> " + c.code()));
    }
    static void qaPass(List<Tester> testers) {
        testers.forEach(t -> System.out.println("qaPass       -> " + t.test()));
    }
    static void designReview(Designer d) { System.out.println("designReview -> " + d.design()); }
    static void oneOnOnes(Manager m) { System.out.println("oneOnOnes    -> " + m.managePeople()); }

    public static void main(String[] args) {
        JuniorDeveloper junior = new JuniorDeveloper();
        TechLead lead = new TechLead();
        codeSprint(List.of(junior, lead));
        qaPass(List.of(junior));
        designReview(lead);
        oneOnOnes(lead);
        // oneOnOnes(junior);   // does not compile: a junior is not a Manager, and need not pretend
    }
}
```

**Output:**

```
codeSprint   -> junior writes a feature
codeSprint   -> lead fixes the hard bug
qaPass       -> junior writes unit tests
designReview -> lead sketches the API
oneOnOnes    -> lead runs the 1:1s
```

---

### D — Dependency Inversion Principle (DIP)

![Infographic on the Dependency Inversion Principle: the smell (OrderService does new MySQLDatabase() and new SendGridMailer(), so switching to Postgres means editing it and tests send real email), the 4-step fix with Database and Mailer interfaces and constructor injection, the lamp-and-wall-outlet analogy, a Before/After UML diagram where OrderService depends on «interface» Database implemented by MySqlDatabase, PostgresDatabase and FakeDatabase (arrows point up to the abstraction), and a How It Runs table from the Java output (production -> mysql: INSERT order 42 / sendgrid 'Order placed!' to ann@example.com; switch DB -> postgres; test -> fake db/fake mail; test check saved=1, emailed=[ann@example.com]).](diagrams/ood21_info_dip_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Simple Explanation:**
High-level modules should NOT depend on low-level modules. Both should depend
on abstractions. Think of a lamp and a wall outlet — the lamp doesn't care if
electricity comes from solar, coal, or wind. It depends on the OUTLET (abstraction),
not the power plant (implementation).

```java
  // BAD: High-level depends directly on low-level
  // ────────────────────────────────────────────────────────

  public class OrderService {                       // ← HIGH-LEVEL (business logic)
      private final MySQLDatabase db = new MySQLDatabase();       // ← DIRECTLY depends on MySQL!
      private final SendGridMailer mailer = new SendGridMailer();  // ← DIRECTLY depends on SendGrid!

      public void placeOrder(Order order) {
          db.save(order);
          mailer.send(order.getCustomerEmail(), "Order placed!");
      }
  }

  // Problem: want to switch to PostgreSQL? Must modify OrderService.
  // Want to test without sending real emails? Can't!

  // GOOD: Both depend on abstractions (the DIP principle); the concrete
  // classes are passed in from outside (dependency injection, the technique)
  // ────────────────────────────────────────────────────────

  public interface Database {                       // ← ABSTRACTION
      void save(Object entity);
  }

  public interface Mailer {                         // ← ABSTRACTION
      void send(String to, String message);
  }

  public class OrderService {                       // ← HIGH-LEVEL
      private final Database db;                    // ← depends on ABSTRACTION
      private final Mailer mailer;                  // ← depends on ABSTRACTION

      public OrderService(Database db, Mailer mailer) {   // ← Constructor Injection
          this.db = db;
          this.mailer = mailer;
      }

      public void placeOrder(Order order) {
          db.save(order);
          mailer.send(order.getCustomerEmail(), "Order placed!");
      }
  }

  // Production:
  OrderService service = new OrderService(new MySQLDatabase(), new SendGridMailer());

  // Testing:
  OrderService testService = new OrderService(new MockDatabase(), new MockMailer());  // ← easy!

  // Switch DB:
  OrderService pgService = new OrderService(new PostgresDatabase(), new SendGridMailer());  // ← OrderService unchanged!
```

```
  DEPENDENCY DIRECTION:

  BAD (high depends on low):          GOOD (both depend on abstraction):
  ───────────────────────             ─────────────────────────────────

  OrderService                        OrderService
       │                                   │
       │ depends on                        │ depends on
       ▼                                   ▼
  MySQLDatabase                       <<interface>>
                                       Database
                                        ▲    ▲
                              depends  │    │  depends
                              on       │    │  on
                                MySQL    Postgres
```

**Official Definition:**
> High-level modules should not depend on low-level modules; both should depend on
> abstractions. Abstractions should not depend on details; details should depend on
> abstractions.

**DIP vs DI — not the same thing:** the Dependency Inversion *Principle* is about which way
dependencies point (business logic → interface ← details). *Dependency injection* is one
technique that implements it: something outside the class creates the concrete objects and
passes them in (by constructor, setter, or a container such as Guice or Dagger). You can follow
DIP with plain constructors and no framework — as the program below does — and you can use a DI
framework while still injecting concrete classes, which gives you DI without DIP.

</details>

**Java — DIP via constructor injection, runnable** (the same `OrderService` with real, switched and fake parts):

```java
import java.util.*;

public class DipDemo {
    record Order(int id, String customerEmail, double total) {}

    // ABSTRACTIONS owned by the high-level code
    interface Database { String save(Order order); }
    interface Mailer   { String send(String to, String message); }

    // HIGH-LEVEL business logic: knows only the two interfaces
    static class OrderService {
        private final Database db;
        private final Mailer mailer;
        OrderService(Database db, Mailer mailer) {          // constructor injection
            this.db = db;
            this.mailer = mailer;
        }
        List<String> placeOrder(Order order) {
            return List.of(db.save(order), mailer.send(order.customerEmail(), "Order placed!"));
        }
    }

    // LOW-LEVEL details: each depends on (implements) an abstraction
    static class MySqlDatabase implements Database {
        public String save(Order o) { return "mysql: INSERT order " + o.id(); }
    }
    static class PostgresDatabase implements Database {
        public String save(Order o) { return "postgres: INSERT order " + o.id(); }
    }
    static class SendGridMailer implements Mailer {
        public String send(String to, String msg) { return "sendgrid: '" + msg + "' to " + to; }
    }

    // TEST doubles: no real database, no real email
    static class FakeDatabase implements Database {
        final List<Order> saved = new ArrayList<>();
        public String save(Order o) { saved.add(o); return "fake db: kept order " + o.id(); }
    }
    static class FakeMailer implements Mailer {
        final List<String> sent = new ArrayList<>();
        public String send(String to, String msg) {
            sent.add(to);
            return "fake mail: recorded " + to;
        }
    }

    public static void main(String[] args) {
        Order order = new Order(42, "ann@example.com", 99.50);

        OrderService prod = new OrderService(new MySqlDatabase(), new SendGridMailer());
        System.out.println("production -> " + prod.placeOrder(order));

        OrderService moved = new OrderService(new PostgresDatabase(), new SendGridMailer());
        System.out.println("switch DB  -> " + moved.placeOrder(order));    // OrderService unchanged

        FakeDatabase db = new FakeDatabase();
        FakeMailer mail = new FakeMailer();
        OrderService test = new OrderService(db, mail);
        System.out.println("test       -> " + test.placeOrder(order));
        System.out.println("test check -> saved=" + db.saved.size() + ", emailed=" + mail.sent);
    }
}
```

**Output:**

```
production -> [mysql: INSERT order 42, sendgrid: 'Order placed!' to ann@example.com]
switch DB  -> [postgres: INSERT order 42, sendgrid: 'Order placed!' to ann@example.com]
test       -> [fake db: kept order 42, fake mail: recorded ann@example.com]
test check -> saved=1, emailed=[ann@example.com]
```

---

## 1.3 Other Key Design Principles

![Infographic on DRY, KISS and YAGNI: smells (tax rate 0.30 typed in two methods; an isEven that XORs every binary digit; OAuth, SAML and biometric auth built 'just in case'), fixes (TAX_RATE = 0.30 in one place, n % 2 == 0, ship email + password and add OAuth when asked), a recipe analogy, a three-column Before → After (generateTaxReport() calls calculateEmployeeTax() which uses TAX_RATE; the XOR riddle says 3 is even and 2 is odd; a YAGNI checklist with only email + password ticked — 3 months of work, 90% never used), and How It Runs tables from DryDemo (50000.00 -> tax 15000.00 ...) and KissDemo (riddle is WRONG for n=2 and n=3).](diagrams/ood21_info_dry_kiss_yagni_ai.png)

### DRY — Don't Repeat Yourself

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Simple Explanation:**
Every business rule should live in exactly ONE place. If the tax rate is typed in two places,
someday someone will update one and forget the other.

```java
  // BAD:
  // ────────────────────────────────────────────────────────
  public double calculateEmployeeTax(double salary) {
      return salary * 0.30;    // ← tax rate hardcoded here
  }

  public String generateTaxReport(double salary) {
      double tax = salary * 0.30;     // ← AND duplicated here!
      return String.format("Tax: %.2f", tax);
  }

  // Tax rate changes? Must find EVERY copy. Miss one? Bug.

  // GOOD:
  // ────────────────────────────────────────────────────────
  private static final double TAX_RATE = 0.30;     // ← single source of truth

  public double calculateEmployeeTax(double salary) {
      return salary * TAX_RATE;
  }

  public String generateTaxReport(double salary) {
      double tax = calculateEmployeeTax(salary);   // ← reuse the rule, don't re-type it
      return String.format("Tax: %.2f", tax);
  }
```

**Caution:** DRY is about KNOWLEDGE, not just code. Two methods that look alike but encode
*different* business rules should NOT be merged — they will diverge later, and the shared
helper becomes a tangle of flags.

**Official Definition:**
> "Every piece of knowledge must have a single, unambiguous, authoritative representation
> within a system." — Andy Hunt & Dave Thomas, *The Pragmatic Programmer* (1999)

</details>

**Java — runnable:**

```java
public class DryDemo {
    private static final double TAX_RATE = 0.30;     // single source of truth

    static double calculateEmployeeTax(double salary) {
        return salary * TAX_RATE;
    }

    static String generateTaxReport(double salary) {
        double tax = calculateEmployeeTax(salary);   // reuse the rule, don't re-type it
        return String.format("Tax: %.2f", tax);
    }

    public static void main(String[] args) {
        double[] salaries = { 50_000, 120_000, 0 };
        for (double s : salaries) {
            System.out.printf("salary %9.2f -> tax %9.2f, report \"%s\"%n",
                    s, calculateEmployeeTax(s), generateTaxReport(s));
        }
    }
}
```

**Output:**

```
salary  50000.00 -> tax  15000.00, report "Tax: 15000.00"
salary 120000.00 -> tax  36000.00, report "Tax: 36000.00"
salary      0.00 -> tax      0.00, report "Tax: 0.00"
```

### KISS — Keep It Simple, Stupid

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Simple Explanation:**
The simplest solution that works is the best one. Clever code is harder to read, harder to
review — and hides bugs.

```java
  // BAD:
  // ────────────────────────────────────────────────────────
  public boolean isEven(int n) {
      return IntStream.range(0, Integer.toBinaryString(n).length())
          .map(i -> Character.getNumericValue(Integer.toBinaryString(n).charAt(i)))
          .reduce(0, (a, b) -> a ^ b) == 0;
  }

  // GOOD:
  // ────────────────────────────────────────────────────────
  public boolean isEven(int n) {
      return n % 2 == 0;
  }
```

They are NOT both correct: the "clever" version XORs all the binary digits, which tells you
whether the number of 1-bits is even — not whether the number is. It says 3 (`11`) is even and
2 (`10`) is odd, and nobody notices because nobody can read it. One is maintainable; one is a
riddle with a bug inside.

**Official Definition:**
> Most systems work best if they are kept simple rather than made complicated; simplicity
> should be a key design goal and unnecessary complexity should be avoided. (A design maxim
> noted by the U.S. Navy in 1960 and usually credited to Lockheed engineer Kelly Johnson.)

</details>

**Java — runnable** (both versions side by side):

```java
import java.util.stream.IntStream;

public class KissDemo {
    // The "clever" version from the text
    static boolean isEvenRiddle(int n) {
        return IntStream.range(0, Integer.toBinaryString(n).length())
            .map(i -> Character.getNumericValue(Integer.toBinaryString(n).charAt(i)))
            .reduce(0, (a, b) -> a ^ b) == 0;
    }

    // The simple version
    static boolean isEven(int n) {
        return n % 2 == 0;
    }

    public static void main(String[] args) {
        int[] tests = { 0, 2, 3, 7, -4 };
        for (int n : tests) {
            boolean riddle = isEvenRiddle(n), simple = isEven(n);
            System.out.printf("n=%-3d riddle=%-5b simple=%-5b -> %s%n",
                    n, riddle, simple, riddle == simple ? "same" : "riddle is WRONG");
        }
    }
}
```

**Output:**

```
n=0   riddle=true  simple=true  -> same
n=2   riddle=false simple=true  -> riddle is WRONG
n=3   riddle=true  simple=false -> riddle is WRONG
n=7   riddle=false simple=false -> same
n=-4  riddle=true  simple=true  -> same
```

### YAGNI — You Aren't Gonna Need It

<details>
<summary><strong>Read as text</strong> — the scenario, the YAGNI approach and the definition</summary>

```
  Don't build features until you actually need them.

  REAL SCENARIO:
  ────────────────────────────────────────────────────────
  Task: "Build a user registration form."

  YAGNI violation (over-engineering):
  "Let me also add support for OAuth, SAML, biometric auth,
   multi-tenant organizations, and an admin dashboard...
   just in case we need it someday."

  Result: 3 months of work. Customer just needed email + password.
  90% of that code is never used and now must be maintained.

  YAGNI approach:
  Build email + password registration. Ship it.
  Add OAuth when a customer actually asks for it.

  ┌──────────────────────────────────────────────────────┐
  │  "The best code is code you didn't have to write."   │
  │  Every line of code is a liability, not an asset.    │
  └──────────────────────────────────────────────────────┘
```

**Official Definition:**
> "Always implement things when you actually need them, never when you just foresee that you
> need them." — Ron Jeffries, one of the founders of Extreme Programming (late 1990s)

</details>

### Composition Over Inheritance

![Infographic on Composition Over Inheritance: the smell (Penguin IS-A Bird but can't fly; FlyingFish IS-A Fish but can fly), the fix (Movement interface implemented by Flying, Swimming, Walking, Gliding; Animal HAS a List<Movement>; learn() adds one at runtime), a phone-and-apps analogy, Before → After UML (a broken Animal → Bird/Fish → Penguin/Eagle/FlyingFish tree vs Animal ◆— has-a 0..* «interface» Movement), and a How It Runs table from the Java output (eagle flies, walks; penguin swims, walks; flying fish swims, glides; duck flies, swims, walks; robot walks after learn(Walking) at runtime).](diagrams/ood21_info_composition_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Simple Explanation:**
Prefer HAS-A over IS-A. Instead of inheriting abilities from a parent class, give an object
small "ability" objects and let it delegate to them. Abilities can then be mixed, reused and
even changed at runtime, without a class hierarchy that breaks when the real world doesn't fit.

```java
  // INHERITANCE (rigid, creates coupling):
  // ────────────────────────────────────────────────────────
  // class Animal
  //     ├── class Bird
  //     │    ├── class Penguin       ← Penguin IS-A Bird... but can't fly!
  //     │    └── class Eagle
  //     └── class Fish
  //          └── class FlyingFish    ← FlyingFish IS-A Fish... but can fly?!
  //
  // Inheritance hierarchies become fragile when the real world
  // doesn't fit neat parent-child trees.

  // COMPOSITION (flexible, swappable):
  // ────────────────────────────────────────────────────────
  public interface Movement { String move(); }                 // one small ability
  public class Flying   implements Movement { public String move() { return "flies"; } }
  public class Swimming implements Movement { public String move() { return "swims"; } }

  public class Animal {
      private final List<Movement> movements;                  // ← HAS-A, not IS-A
      public Animal(Movement... movements) { this.movements = new ArrayList<>(List.of(movements)); }
  }

  new Animal(new Swimming(), new Walking());                   // penguin: nothing to override
  new Animal(new Swimming(), new Gliding());                   // flying fish: mix and match
```

Splitting abilities into interfaces (`Flyable`, `Swimmable`) already fixes the broken taxonomy;
composing behaviour *objects* goes one step further — the flying code is written once and
shared, and an object can learn a new ability at runtime.

**Official Definition:**
> "Favor object composition over class inheritance." — Gamma, Helm, Johnson & Vlissides,
> *Design Patterns* (1994). Inheritance is "white-box" reuse (the child sees the parent's
> internals); composition is "black-box" reuse through a small interface.

</details>

**Java — runnable:**

```java
import java.util.*;

public class CompositionDemo {
    // Small behaviour objects: each knows ONE way of moving
    interface Movement { String move(); }
    static class Flying   implements Movement { public String move() { return "flies"; } }
    static class Swimming implements Movement { public String move() { return "swims"; } }
    static class Walking  implements Movement { public String move() { return "walks"; } }
    static class Gliding  implements Movement { public String move() { return "glides"; } }

    // An Animal HAS movements instead of inheriting them from a parent class
    static class Animal {
        private final String name;
        private final List<Movement> movements;
        Animal(String name, Movement... movements) {
            this.name = name;
            this.movements = new ArrayList<>(List.of(movements));
        }
        void learn(Movement m) { movements.add(m); }             // change behaviour at runtime
        String describe() {
            List<String> verbs = movements.stream().map(Movement::move).toList();
            return name + " " + String.join(", ", verbs);
        }
    }

    public static void main(String[] args) {
        Animal eagle = new Animal("eagle", new Flying(), new Walking());
        Animal penguin = new Animal("penguin", new Swimming(), new Walking());  // nothing to break
        Animal flyingFish = new Animal("flying fish", new Swimming(), new Gliding());
        Animal duck = new Animal("duck", new Flying(), new Swimming(), new Walking());
        for (Animal a : List.of(eagle, penguin, flyingFish, duck)) {
            System.out.println(a.describe());
        }
        Animal robot = new Animal("robot");
        robot.learn(new Walking());
        System.out.println(robot.describe() + "  (behaviour added at runtime)");
    }
}
```

**Output:**

```
eagle flies, walks
penguin swims, walks
flying fish swims, glides
duck flies, swims, walks
robot walks  (behaviour added at runtime)
```

### Separation of Concerns (SoC)

![Infographic on Separation of Concerns and the Law of Demeter: the train-wreck smell customer.getWallet().getCreditCard().charge(100), a 4-step fix (one concern per module; call only this, parameters, created objects and own fields; ask customer.charge(100); Customer delegates to Wallet, Wallet to CreditCard), a paperboy analogy, a four-layer stack PRESENTATION (UI) → BUSINESS LOGIC → DATA ACCESS → INFRASTRUCTURE with 'UI redesign? only this layer' and 'Switch databases? only this layer', a Before/After Caller → Customer → Wallet → CreditCard diagram (red dashed jump vs neighbour-only charge(100), pay(100), charge(100)), and a How It Runs table from the Java output (Ann paid 100.0; Ann was declined for 100.0; Ann paid 50.0; Bob was declined for 10.0 — no card, no crash).](diagrams/ood21_info_soc_demeter_ai.png)

<details>
<summary><strong>Read as text</strong> — the layers and the definition</summary>

```
  Each module handles ONE concern (aspect of functionality).

  Web application concerns:
  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │  PRESENTATION (UI)        <- how things look                │
  │       │                                                     │
  │       ▼                                                     │
  │  BUSINESS LOGIC           <- what the app does              │
  │       │                                                     │
  │       ▼                                                     │
  │  DATA ACCESS              <- how data is stored/retrieved   │
  │       │                                                     │
  │       ▼                                                     │
  │  INFRASTRUCTURE           <- external services, networking  │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘

  Each layer can change independently.
  UI redesign? Only touch presentation.
  Switch databases? Only touch data access.
```

**Official Definition:**
> Separation of concerns divides a program into distinct sections, each addressing one
> concern, so that each can be understood, changed and tested on its own. (Term coined by
> Edsger Dijkstra, 1974.)

</details>

### Law of Demeter (Principle of Least Knowledge)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Simple Explanation:**
"Don't talk to strangers." A method should only call methods on:
1. its own object (`this`);
2. objects passed in as parameters;
3. objects it creates itself;
4. its own fields (direct components).

```java
  // BAD (train wreck / chained calls):
  // ────────────────────────────────────────────────────────
  customer.getWallet().getCreditCard().charge(100);

  // You're reaching deep into the internals of Customer,
  // then Wallet, then CreditCard. If ANY of those change,
  // YOUR code breaks.

  // GOOD:
  // ────────────────────────────────────────────────────────
  customer.charge(100);

  // Customer internally delegates to Wallet, which delegates
  // to CreditCard. You only talk to your direct friend.
```

**Not a dot-counting rule:** fluent chains that keep returning the *same* kind of object —
`builder.name("a").age(3).build()`, `list.stream().filter(...).map(...)` — are fine. The smell is
walking through *other objects' internals*.

**Official Definition:**
> A method `m` of an object `O` should invoke only methods of `O` itself, of `m`'s parameters,
> of objects created within `m`, and of `O`'s direct component objects. (Proposed by Ian
> Holland on Northeastern University's Demeter project in 1987; published with Karl Lieberherr
> in 1988–89.)

</details>

**Java — runnable** (the caller only ever talks to `Customer`):

```java
public class DemeterDemo {
    static class CreditCard {
        private double available;
        CreditCard(double limit) { this.available = limit; }
        boolean charge(double amount) {
            if (amount > available) return false;
            available -= amount;
            return true;
        }
    }

    static class Wallet {
        private final CreditCard card;                    // may be null: no card
        Wallet(CreditCard card) { this.card = card; }
        boolean pay(double amount) { return card != null && card.charge(amount); }
    }

    static class Customer {
        private final String name;
        private final Wallet wallet;
        Customer(String name, Wallet wallet) { this.name = name; this.wallet = wallet; }
        // GOOD: callers ask the Customer; only Customer knows a Wallet exists
        String charge(double amount) {
            return name + (wallet.pay(amount) ? " paid " : " was declined for ") + amount;
        }
    }

    public static void main(String[] args) {
        Customer ann = new Customer("Ann", new Wallet(new CreditCard(150)));
        Customer bob = new Customer("Bob", new Wallet(null));
        System.out.println("ann.charge(100) -> " + ann.charge(100));
        System.out.println("ann.charge(100) -> " + ann.charge(100));   // only 50 left
        System.out.println("ann.charge(50)  -> " + ann.charge(50));
        System.out.println("bob.charge(10)  -> " + bob.charge(10));    // no card, no crash
    }
}
```

**Output:**

```
ann.charge(100) -> Ann paid 100.0
ann.charge(100) -> Ann was declined for 100.0
ann.charge(50)  -> Ann paid 50.0
bob.charge(10)  -> Bob was declined for 10.0
```

### Coupling and Cohesion — The Two Most Important Quality Metrics

![Infographic on coupling and cohesion: the smell (a grab-bag Utility class with login(), sendEmail(), calculateTax(), resizeImage(), parseCsv(); an OrderService doing new MySQLDatabase() and new SmtpClient(...)), a 4-step fix (split when you need AND, keep one purpose together, depend on Database and Mailer interfaces, inject them), a LEGO analogy, Before → After rows (low-cohesion Utility vs high-cohesion UserAuthentication with login/logout/resetPassword/validateToken; tightly coupled OrderService tangled with MySQLDatabase, "localhost"/"root"/"pass123", INSERT INTO orders..., SmtpClient("smtp.gmail.com") vs loosely coupled OrderService → «interface» Database and «interface» Mailer), a How It Runs table from the Java output (login(ann, pw1) -> tok-ann; wrong -> none; validateToken -> true; after logout -> false; saved orders [order-7]; sent emails [ann@example.com: Order placed!]), and which principle helps (SRP cohesion, DIP coupling, SoC both, OCP future changes). Footer: HIGH COHESION + LOW COUPLING = GREAT DESIGN.](diagrams/ood21_info_coupling_cohesion_ai.png)

<details>
<summary><strong>Read as text</strong> — the two metrics, the examples and the definition</summary>

These are the most fundamental measures of design quality (introduced by Larry Constantine and
colleagues in *Structured Design*, 1974), and most of the other principles exist to improve them.

**Cohesion = how closely related the things INSIDE a module are.**
High cohesion = good. Everything in the module works toward one purpose.

**Coupling = how much one module depends on another.**
Low coupling = good. Modules can change independently.

```java
  // HIGH COHESION (good):              LOW COHESION (bad):
  // ──────────────────────             ──────────────────────

  public class UserAuthentication {     public class Utility {
      void login() { ... }                  void login() { ... }
      void logout() { ... }                 void sendEmail() { ... }
      void resetPassword() { ... }          double calculateTax() { ... }
      boolean validateToken() { ... }       void resizeImage() { ... }
  }                                         List<String> parseCsv() { ... }
                                        }
  // Everything is about auth.          // Random grab-bag of
  // One clear purpose.                 // unrelated functions.
```

Ask yourself: "If I describe what this module does, do I need the word AND?"

- "Handles authentication" → high cohesion ✓
- "Handles auth AND email AND tax AND images" → low cohesion ✗

```java
  // TIGHT COUPLING (bad):
  // ──────────────────────
  public class OrderService {
      public void placeOrder(Order order) {
          MySQLDatabase db = new MySQLDatabase();
          db.connect("localhost", "root", "pass123");
          db.execute("INSERT INTO orders...");
          SmtpClient smtp = new SmtpClient("smtp.gmail.com");
          smtp.send(order.getEmail(), "Order placed!");
      }
  }
  // Knows EXACTLY which DB, which email server, connection details, SQL syntax...
  // Change ANYTHING → OrderService must change too.

  // LOOSE COUPLING (good):
  // ──────────────────────
  public class OrderService {
      private final Database db;
      private final Mailer mailer;
      public OrderService(Database db, Mailer mailer) {
          this.db = db;
          this.mailer = mailer;
      }
      public void placeOrder(Order order) {
          db.save(order);
          mailer.send(order.getEmail(), "Order placed!");
      }
  }
  // Knows NOTHING about which database or email service.
  // It depends on ABSTRACTIONS. Change database/email → OrderService stays untouched.
```

```
  THE GOAL:
  ┌──────────────────────────────────────────────────────────────┐
  │                                                              │
  │   HIGH COHESION   +   LOW COUPLING   =   GREAT DESIGN        │
  │                                                              │
  │   Each module does     Modules are        Easy to understand,│
  │   ONE thing well.      independent.       change, test, and  │
  │                                           reuse.             │
  │                                                              │
  │   SRP → improves cohesion                                    │
  │   DIP → reduces coupling                                     │
  │   SoC → improves both                                        │
  │   OCP → reduces coupling to future changes                   │
  └──────────────────────────────────────────────────────────────┘
```

**Official Definition:**
> **Cohesion** is the degree to which the elements inside a module belong together.
> **Coupling** is the degree of interdependence between modules. Good designs aim for high
> cohesion and low coupling.

</details>

**Java — runnable** (a cohesive auth class, and an `OrderService` so loosely coupled that two lambdas can replace its database and mailer):

```java
import java.util.*;

public class CouplingCohesionDemo {
    // HIGH COHESION: every method is about one thing, authentication
    static class UserAuthentication {
        private final Map<String, String> passwords = new HashMap<>(Map.of("ann", "pw1"));
        private final Set<String> liveTokens = new HashSet<>();

        Optional<String> login(String user, String password) {
            if (!password.equals(passwords.get(user))) return Optional.empty();
            String token = "tok-" + user;
            liveTokens.add(token);
            return Optional.of(token);
        }
        boolean validateToken(String token) { return liveTokens.contains(token); }
        void logout(String token)           { liveTokens.remove(token); }
    }

    // LOW COUPLING: OrderService knows two tiny interfaces, nothing about real DBs or mail servers
    interface Database { void save(String order); }
    interface Mailer   { void send(String to, String message); }

    static class OrderService {
        private final Database db;
        private final Mailer mailer;
        OrderService(Database db, Mailer mailer) { this.db = db; this.mailer = mailer; }
        void placeOrder(String order, String email) {
            db.save(order);
            mailer.send(email, "Order placed!");
        }
    }

    public static void main(String[] args) {
        UserAuthentication auth = new UserAuthentication();
        String token = auth.login("ann", "pw1").orElse("none");
        System.out.println("login(ann, pw1)    -> " + token);
        System.out.println("login(ann, wrong)  -> " + auth.login("ann", "wrong").orElse("none"));
        System.out.println("validateToken      -> " + auth.validateToken(token));
        auth.logout(token);
        System.out.println("after logout       -> " + auth.validateToken(token));

        // Because coupling is low, plain lambdas can stand in for the database and mailer
        List<String> saved = new ArrayList<>(), sent = new ArrayList<>();
        OrderService orders = new OrderService(saved::add, (to, msg) -> sent.add(to + ": " + msg));
        orders.placeOrder("order-7", "ann@example.com");
        System.out.println("saved orders       -> " + saved);
        System.out.println("sent emails        -> " + sent);
    }
}
```

**Output:**

```
login(ann, pw1)    -> tok-ann
login(ann, wrong)  -> none
validateToken      -> true
after logout       -> false
saved orders       -> [order-7]
sent emails        -> [ann@example.com: Order placed!]
```

### Principle Summary

```
┌───────────────────┬──────────────────────────────────────────────────┐
│ Principle         │ One-Line Summary                                 │
├───────────────────┼──────────────────────────────────────────────────┤
│ SRP               │ One class, one reason to change                  │
│ OCP               │ Extend behavior without modifying existing code  │
│ LSP               │ Subtypes must be substitutable for base types    │
│ ISP               │ Many specific interfaces > one general interface │
│ DIP               │ Depend on abstractions, not implementations      │
│ DRY               │ Single source of truth for every piece of logic  │
│ KISS              │ Simplest solution that works wins                │
│ YAGNI             │ Don't build it until you need it                 │
│ Composition > Inh │ Prefer HAS-A over IS-A relationships             │
│ SoC               │ Each module handles one concern                  │
│ Law of Demeter    │ Don't reach through objects to their internals   │
│ Cohesion/Coupling │ Focused modules, few dependencies between them   │
└───────────────────┴──────────────────────────────────────────────────┘
```

---

# PART 2: DESIGN PATTERNS

---

## 2.1 What Are Design Patterns?

![Catalog infographic of design patterns: the 1994 Gang of Four book by Gamma, Helm, Johnson and Vlissides; three columns CREATIONAL (how to create objects: Singleton, Factory Method, Abstract Factory, Builder, Prototype), STRUCTURAL (how to compose classes/objects: Adapter, Facade, Decorator, Proxy, Composite, Bridge) and BEHAVIORAL (how objects communicate: Observer, Strategy, Command, State, Template Method, Chain of Responsibility, Iterator) with Prototype, Bridge and Iterator greyed as not covered and explained in one line each; and a Pick by Question table (e.g. 'I need ONE instance' → Singleton (or better: DI container); 'Swap algorithms' → Strategy; 'Pass it along until someone handles it' → Chain of Responsibility).](diagrams/ood21_info_pattern_catalog_ai.png)

<details>
<summary><strong>Read as text</strong> — the three categories and the patterns not covered</summary>

**Simple Explanation:**
Design patterns are **proven solutions to common problems** in software design.
They're like recipes — you don't reinvent pasta from scratch every time you cook.
Someone already figured out the best way to do it. Most names come from the 1994
"Gang of Four" (GoF) book *Design Patterns* by Gamma, Helm, Johnson and Vlissides.

```
  ┌──────────────────────────────────────────────────────────────┐
  │                  DESIGN PATTERN CATEGORIES                   │
  ├─────────────────┬────────────────────┬───────────────────────┤
  │   CREATIONAL    │    STRUCTURAL      │     BEHAVIORAL        │
  │ (how to create  │ (how to compose    │ (how objects          │
  │  objects)       │  classes/objects)  │  communicate)         │
  ├─────────────────┼────────────────────┼───────────────────────┤
  │ Singleton       │ Adapter            │ Observer              │
  │ Factory Method  │ Facade             │ Strategy              │
  │ Abstract Factory│ Decorator          │ Command               │
  │ Builder         │ Proxy              │ State                 │
  │ Prototype *     │ Composite          │ Template Method       │
  │                 │ Bridge *           │ Chain of Resp.        │
  │                 │                    │ Iterator *            │
  └─────────────────┴────────────────────┴───────────────────────┘
  * = not covered in this chapter
```

The three marked `*` are not taught here; in one line each:

- **Prototype** — create a new object by copying an existing one (`clone()`, copy constructors).
- **Bridge** — split an abstraction from its implementation so both can vary independently
  (e.g. `Shape` × `Renderer` instead of `RedCircle`, `BlueCircle`, `RedSquare`, …).
- **Iterator** — walk a collection without exposing its internals (Java's `Iterator` and the
  for-each loop already give you this).

</details>

---

## 2.2 Creational Patterns

### Singleton — One Instance Only

![Infographic on the Singleton pattern: the smell (naive lazy getInstance() — if (instance == null) instance = new DatabasePool(); — lets two threads build two pools), the 4-step double-checked-locking fix (private constructor, private static volatile instance, lock-free first check, synchronized block with a second check), a shared room-booking calendar analogy, a How It Works diagram where Module A, B and C call DatabasePool.getInstance() and all get the single shared instance, a 'Why volatile?' panel contrasting allocate → store reference → constructor still running (half-built object) with allocate → construct → publish, simpler options (enum INSTANCE, holder idiom, DI container), and a How It Runs table from the Java output (8 threads, 1 distinct instance, 1 constructor call, enum region eu, same object true).](diagrams/ood21_info_singleton_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Problem:** you need exactly ONE instance of a class, shared by everyone — for example a
database connection pool, a logger, or a configuration manager.

```
  ┌─────────────────────────────────────────────────┐
  │  Application                                    │
  │                                                 │
  │  Module A ──┐                                   │
  │             │                                   │
  │  Module B ──┼──► DatabasePool.getInstance()     │
  │             │         │                         │
  │  Module C ──┘         ▼                         │
  │                  ┌──────────┐                   │
  │                  │ SINGLE   │                   │
  │                  │ INSTANCE │  (shared by all)  │
  │                  └──────────┘                   │
  └─────────────────────────────────────────────────┘
```

**The fix:** make the constructor `private`, keep the one instance in a `static` field, and hand
it out from a `static getInstance()`. The naive lazy version is not thread-safe:

```java
  // BAD: two threads can both see null and build two pools
  public static DatabasePool getInstance() {
      if (instance == null) instance = new DatabasePool();
      return instance;
  }
```

The program below uses **double-checked locking** (thread-safe and lazy: nothing is built until
the first call). Two details matter:

- **Why two checks?** The first check, without a lock, makes every call after creation fast.
  The second check, inside the lock, stops two threads that both passed the first check from
  each creating an instance.
- **Why `volatile`?** `instance = new DatabasePool()` is not one step: the JVM (1) allocates
  memory, (2) runs the constructor, (3) stores the reference in `instance`. Without `volatile`,
  the compiler or CPU may reorder these so the reference is stored *before* the constructor
  has finished. Another thread doing the first, lock-free check then sees a non-null
  `instance`, skips the lock, and uses a half-built object (fields still `null` or `0`). The
  `synchronized` block can't help, because that first read happens outside it. Declaring the
  field `volatile` forbids the reordering and guarantees that any thread which sees the
  reference also sees everything the constructor wrote — this is called *safe publication*.

**Simpler options** — prefer these unless you need a lazily built class with a plain API:

```java
  // Enum singleton (Josh Bloch, Effective Java, Item 3): simplest, thread-safe,
  // and safe even against serialization and reflection tricks
  public enum DatabasePool {
      INSTANCE;
      public Connection getConnection() { ... }
  }

  // Holder idiom: lazy AND thread-safe with no locks — the JVM initialises
  // Holder (and builds INSTANCE) only on the first call to getInstance()
  public class DatabasePool {
      private DatabasePool() { }
      private static class Holder { static final DatabasePool INSTANCE = new DatabasePool(); }
      public static DatabasePool getInstance() { return Holder.INSTANCE; }
  }
```

**Caution:** singletons are often overused. They are global state — harder to test (you can't
swap in a fake) and harder to parallelise. At Google, prefer dependency injection (Guice or
Dagger): the DI container creates one instance and passes it to whoever needs it.

**Official Definition:**
> Ensure a class has only one instance, and provide a global point of access to it.
> (GoF, 1994)

</details>

**Java — runnable** (8 threads race to call `getInstance()` at the same moment):

```java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class SingletonDemo {
    static final AtomicInteger constructorCalls = new AtomicInteger();

    // 1. Lazy, thread-safe: double-checked locking
    static class DatabasePool {
        private static volatile DatabasePool instance;   // volatile: see the explanation above

        private DatabasePool() { constructorCalls.incrementAndGet(); }   // private constructor

        static DatabasePool getInstance() {
            if (instance == null) {                      // first check (no lock): fast path
                synchronized (DatabasePool.class) {
                    if (instance == null) {              // second check (with lock)
                        instance = new DatabasePool();
                    }
                }
            }
            return instance;
        }
    }

    // 2. Enum singleton: the JVM guarantees exactly one INSTANCE
    enum AppConfig {
        INSTANCE;
        private final Map<String, String> values = new ConcurrentHashMap<>(Map.of("region", "us"));
        String get(String key) { return values.get(key); }
        void set(String key, String value) { values.put(key, value); }
    }

    public static void main(String[] args) throws Exception {
        int threads = 8;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<DatabasePool>> results = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            results.add(pool.submit(() -> { start.await(); return DatabasePool.getInstance(); }));
        }
        start.countDown();                               // release all 8 threads at once
        Set<DatabasePool> distinct = Collections.newSetFromMap(new IdentityHashMap<>());
        for (Future<DatabasePool> f : results) distinct.add(f.get());
        pool.shutdown();

        System.out.println("threads calling getInstance() -> " + threads);
        System.out.println("distinct instances returned   -> " + distinct.size());
        System.out.println("constructor calls             -> " + constructorCalls.get());

        AppConfig.INSTANCE.set("region", "eu");          // change through one reference...
        AppConfig sameOne = AppConfig.valueOf("INSTANCE");
        System.out.println("enum: region seen elsewhere   -> " + sameOne.get("region"));
        System.out.println("enum: same object?            -> " + (sameOne == AppConfig.INSTANCE));
    }
}
```

**Output:**

```
threads calling getInstance() -> 8
distinct instances returned   -> 1
constructor calls             -> 1
enum: region seen elsewhere   -> eu
enum: same object?            -> true
```

### Factory — Encapsulate Object Creation

![Infographic on the factory family of creational patterns: the smell (every caller repeats if/else on email, sms, push, so adding Slack edits every copy), the fix in 4 steps (Simple Factory map email → EmailNotifier::new, callers say create("email"), Factory Method subclasses override createButton(), Abstract Factory has one create method per product), a furniture-collection analogy, a three-panel How It Works (NotificationFactory → EmailNotifier/SmsNotifier/PushNotifier with slack → error; abstract Dialog with WindowsDialog and WebDialog returning [ OK ] and <button>OK</button>; «interface» CloudFactory implemented by GcpFactory → Cloud Storage + Pub/Sub and AwsFactory → S3 + SQS, never mixed), and How It Runs tables from both Java outputs (FactoryDemo 6 lines; AbstractFactoryDemo gcp, aws, azure → error: Unknown provider: azure).](diagrams/ood21_info_factories_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Problem:** you need to create objects, but the exact type is only known at runtime (from
config, user input or a message). Example: a notification system with several channels.

```java
  // Without a factory (brittle): every caller repeats this chain
  Notifier notifier;
  if (channel.equals("email"))      notifier = new EmailNotifier();
  else if (channel.equals("sms"))   notifier = new SmsNotifier();
  else if (channel.equals("push"))  notifier = new PushNotifier();  // ← edit every copy for Slack
```

**With a factory:** one class owns a "key → constructor" map. Callers just say
`NotificationFactory.create("email")` and never name a concrete class; adding Slack is one new
map entry, and an unknown channel fails in one place with a clear error.

**Note:** The map-based version is the *Simple Factory* idiom — one place builds
objects so callers never name concrete classes. The classic GoF **Factory Method**
pattern reaches the same goal differently: it declares a `create()` method that
**subclasses override** to choose the concrete type (e.g., `WindowsDialog` and
`WebDialog` each return their own `Button`). Use Simple Factory for a quick registry;
use Factory Method when the *creator itself* is part of a class hierarchy. The program
below shows both.

**Official Definition:**
> **Factory Method:** define an interface for creating an object, but let subclasses decide
> which class to instantiate. (GoF, 1994) The **Simple Factory** is the everyday, non-GoF
> variant: one method that picks the class for you.

</details>

**Java — runnable:**

```java
import java.util.*;
import java.util.function.Supplier;

public class FactoryDemo {
    interface Notifier { String send(String message); }
    static class EmailNotifier implements Notifier {
        public String send(String m) { return "email: " + m; }
    }
    static class SmsNotifier implements Notifier {
        public String send(String m) { return "sms: " + m; }
    }
    static class PushNotifier implements Notifier {
        public String send(String m) { return "push: " + m; }
    }

    // SIMPLE FACTORY: one registry maps a key to a constructor
    static class NotificationFactory {
        private static final Map<String, Supplier<Notifier>> FACTORIES = Map.of(
            "email", EmailNotifier::new,
            "sms",   SmsNotifier::new,
            "push",  PushNotifier::new                   // add Slack = add one line here
        );

        static Notifier create(String channel) {
            Supplier<Notifier> factory = FACTORIES.get(channel);
            if (factory == null) throw new IllegalArgumentException("Unknown channel: " + channel);
            return factory.get();
        }
    }

    // FACTORY METHOD (GoF): a subclass overrides create...() to pick the concrete type
    interface Button { String render(); }
    static abstract class Dialog {
        abstract Button createButton();                  // the factory method
        String show() { return "dialog with " + createButton().render(); }   // shared logic
    }
    static class WindowsDialog extends Dialog {
        Button createButton() { return () -> "[ OK ] (Windows style)"; }
    }
    static class WebDialog extends Dialog {
        Button createButton() { return () -> "<button>OK</button>"; }
    }

    public static void main(String[] args) {
        for (String channel : List.of("email", "sms", "push", "slack")) {
            try {
                Notifier notifier = NotificationFactory.create(channel);
                System.out.printf("%-13s -> %s%n", channel, notifier.send("Hello!"));
            } catch (IllegalArgumentException e) {
                System.out.printf("%-13s -> error: %s%n", channel, e.getMessage());
            }
        }
        System.out.println("WindowsDialog -> " + new WindowsDialog().show());
        System.out.println("WebDialog     -> " + new WebDialog().show());
    }
}
```

**Output:**

```
email         -> email: Hello!
sms           -> sms: Hello!
push          -> push: Hello!
slack         -> error: Unknown channel: slack
WindowsDialog -> dialog with [ OK ] (Windows style)
WebDialog     -> dialog with <button>OK</button>
```

### Abstract Factory — Families of Related Objects

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Simple Explanation:**
Think of buying furniture by collection: pick "Modern" and the chair, sofa and table all
match; pick "Classic" and they all match the other way. An Abstract Factory is the
collection: ONE object with one create-method per product, so everything you get from it
belongs to the same family.

**Problem:** your code needs several related objects that must come from the same family —
for example a blob store AND a message queue from the same cloud. Mixing them (Google Cloud
Storage with Amazon SQS) is a bug that plain `new` won't stop.

```
             «interface» CloudFactory
             + createBlobStore()
             + createQueue()
                △               △
                ┆               ┆   implements
        GcpFactory            AwsFactory
        → Cloud Storage       → S3
        → Pub/Sub             → SQS

  new UploadService(factory)  ← gets BOTH products from ONE factory,
                                so it can never mix GCP and AWS
```

| | Factory Method | Abstract Factory |
|---|---|---|
| Creates | one product | a family of related products |
| How | a subclass overrides one `create()` method | an object with one `create…()` per product |
| Add a new family (e.g. Azure) | add a subclass | add one factory class |
| Add a new product type (e.g. a database) | add a method | change the interface AND every factory |

That last row is the trade-off: new families are cheap, new product types are expensive.

**Official Definition:**
> Provide an interface for creating families of related or dependent objects without
> specifying their concrete classes. (GoF, 1994)

**Real-world:** cross-platform UI toolkits (Windows vs macOS widgets), cloud or database
driver families, and test wiring (a `FakeCloudFactory` that returns in-memory fakes).

</details>

**Java — runnable:**

```java
public class AbstractFactoryDemo {
    // Two PRODUCT interfaces that must always come from the same family
    interface BlobStore    { String put(String key); }
    interface MessageQueue { String publish(String msg); }

    // The ABSTRACT FACTORY: one method per product
    interface CloudFactory {
        BlobStore createBlobStore();
        MessageQueue createQueue();
    }

    // Concrete family 1: Google Cloud
    static class GcpFactory implements CloudFactory {
        public BlobStore createBlobStore() { return key -> "Cloud Storage: stored " + key; }
        public MessageQueue createQueue()  { return msg -> "Pub/Sub: published " + msg; }
    }

    // Concrete family 2: AWS
    static class AwsFactory implements CloudFactory {
        public BlobStore createBlobStore() { return key -> "S3: stored " + key; }
        public MessageQueue createQueue()  { return msg -> "SQS: published " + msg; }
    }

    // Client code: never names a concrete class, so it can't mix families by accident
    static class UploadService {
        private final BlobStore store;
        private final MessageQueue queue;
        UploadService(CloudFactory factory) {
            this.store = factory.createBlobStore();
            this.queue = factory.createQueue();
        }
        String upload(String file) {
            return store.put(file) + " | " + queue.publish("uploaded " + file);
        }
    }

    static CloudFactory factoryFor(String provider) {
        return switch (provider) {
            case "gcp" -> new GcpFactory();
            case "aws" -> new AwsFactory();
            default -> throw new IllegalArgumentException("Unknown provider: " + provider);
        };
    }

    public static void main(String[] args) {
        for (String provider : new String[] { "gcp", "aws", "azure" }) {
            try {
                UploadService svc = new UploadService(factoryFor(provider));
                System.out.printf("%-5s -> %s%n", provider, svc.upload("cat.png"));
            } catch (IllegalArgumentException e) {
                System.out.printf("%-5s -> error: %s%n", provider, e.getMessage());
            }
        }
    }
}
```

**Output:**

```
gcp   -> Cloud Storage: stored cat.png | Pub/Sub: published uploaded cat.png
aws   -> S3: stored cat.png | SQS: published uploaded cat.png
azure -> error: Unknown provider: azure
```

### Builder — Construct Complex Objects Step by Step

![Infographic on the Builder pattern: the smell (telescoping constructor new User("Alice", "alice@email.com", 25, "NYC", "Engineer", true, false, "en", null, "UTC") — what do true, false and null mean?), the 4-step fix (nested Builder with chaining setters, name every field, build() validates name/email required and age >= 0, private constructor copies into final fields with defaults), a custom-pizza analogy, a UML diagram where User.Builder creates an immutable User (defaults city = unknown, role = member) beside a chain .name("Alice") → .email → .age(25) → .city("NYC") → .role("Engineer") → .isActive(true) → build(): validate → immutable User, with 'email missing → error: email is required', and a How It Runs table from the Java output (Alice full User, Bob with defaults age=0 city=unknown role=member active=false, Carol error: email is required, Dan error: age must be >= 0).](diagrams/ood21_info_builder_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Problem:** an object has many optional parameters, so its constructor becomes unreadable.

```java
  // Without Builder (telescoping constructor):
  User user = new User("Alice", "alice@email.com", 25, "NYC",
                        "Engineer", true, false, "en", null, "UTC");
  // What do all these booleans mean?! Unreadable.

  // With Builder (readable, self-documenting):
  User user = User.builder()
      .name("Alice")
      .email("alice@email.com")
      .age(25)
      .city("NYC")
      .role("Engineer")
      .isActive(true)
      .build();
```

**How it works:** a nested `Builder` holds the values while you set them (each setter returns
`this`, so the calls chain). `build()` validates once — required fields present, values in
range — and passes itself to a `private` constructor that copies everything into `final`
fields. The result is immutable, and any optional field you skip gets a default.

**Real-world:** Protocol Buffers (every generated Java message has a builder), Guava
`ImmutableList.builder()`, `HttpRequest.newBuilder()` in `java.net.http`, SQL query builders.

**Official Definition:**
> Separate the construction of a complex object from its representation, so that the same
> construction process can create different representations. (GoF, 1994) In everyday Java
> (Effective Java, Item 2): consider a builder when a constructor would need many parameters.

</details>

**Java — runnable** (required fields and validation are enforced in `build()`):

```java
import java.util.*;

public class BuilderDemo {
    static class User {
        private final String name;          // required
        private final String email;         // required
        private final int age;              // optional fields below
        private final String city;
        private final String role;
        private final boolean active;

        private User(Builder b) {
            this.name = b.name;
            this.email = b.email;
            this.age = b.age;
            this.city = b.city;
            this.role = b.role;
            this.active = b.active;
        }

        static Builder builder() { return new Builder(); }

        @Override public String toString() {
            return "User{" + name + ", " + email + ", age=" + age + ", city=" + city
                    + ", role=" + role + ", active=" + active + "}";
        }

        static class Builder {
            private String name, email, city = "unknown", role = "member";   // defaults
            private int age;
            private boolean active;

            Builder name(String name)       { this.name = name; return this; }
            Builder email(String email)     { this.email = email; return this; }
            Builder age(int age)            { this.age = age; return this; }
            Builder city(String city)       { this.city = city; return this; }
            Builder role(String role)       { this.role = role; return this; }
            Builder isActive(boolean value) { this.active = value; return this; }

            User build() {                                   // validate once, then freeze
                Objects.requireNonNull(name, "name is required");
                Objects.requireNonNull(email, "email is required");
                if (age < 0) throw new IllegalArgumentException("age must be >= 0");
                return new User(this);
            }
        }
    }

    public static void main(String[] args) {
        System.out.println(User.builder().name("Alice").email("alice@email.com").age(25)
                .city("NYC").role("Engineer").isActive(true).build());
        System.out.println(User.builder().name("Bob").email("bob@email.com").build());
        try {
            User.builder().name("Carol").build();
        } catch (NullPointerException e) {
            System.out.println("error: " + e.getMessage());
        }
        try {
            User.builder().name("Dan").email("dan@email.com").age(-3).build();
        } catch (IllegalArgumentException e) {
            System.out.println("error: " + e.getMessage());
        }
    }
}
```

**Output:**

```
User{Alice, alice@email.com, age=25, city=NYC, role=Engineer, active=true}
User{Bob, bob@email.com, age=0, city=unknown, role=member, active=false}
error: email is required
error: age must be >= 0
```

---

## 2.3 Structural Patterns

### Adapter — Make Incompatible Interfaces Work Together

![Infographic on the Adapter pattern: the smell (your code expects charge(double amount, String currency) but Stripe offers createCharge(long cents, String currencyCode) and you can't edit it), the 4-step fix (StripeAdapter implements PaymentGateway, holds StripeApi, translates dollars → cents with Math.round(amount * 100) and usd → USD, delegates; PayPalAdapter does the same), a US-plug/EU-socket analogy, a UML diagram where Client uses «interface» PaymentGateway implemented by StripeAdapter and PayPalAdapter, which hold StripeApi.createCharge(cents, CODE) and PayPalSdk.makePayment(text), and a How It Runs table from the Java output (stripe charged 1999 cents USD; paypal paid 19.99 USD; stripe charged 29 cents EUR; the trap (int) (19.99 * 100) = 1998).](diagrams/ood21_info_adapter_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Problem:** you have an existing class that doesn't match the interface your code expects —
like a US plug and a European socket: you need an ADAPTER between them.

```java
  // Your code expects:                    Third-party library provides:
  // ─────────────────                     ──────────────────────────────
  public interface PaymentGateway {        public class StripeApi {
      String charge(double amount,             String createCharge(long cents,
                    String currency);                              String currencyCode);
  }                                        }
```

**The fix:** write a small class that *implements your interface* and *translates* each call
into the library's shape (dollars → cents, `"usd"` → `"USD"`), then delegates. Your code works
with ANY `PaymentGateway`; switching to PayPal means writing a `PayPalAdapter`, with zero
changes elsewhere.

**Trap — money in a `double`:** converting with `(int) (amount * 100)` truncates. In binary
floating point `19.99 * 100` is `1998.9999999999998`, so the cast gives **1998** cents and the
customer is charged a cent short. Round (`Math.round(amount * 100)`) — or better, keep money as
`long` cents or `BigDecimal` from end to end.

**Official Definition:**
> Convert the interface of a class into another interface clients expect, so that classes
> with incompatible interfaces can work together. (GoF, 1994)

</details>

**Java — runnable** (two adapters behind one interface):

```java
public class AdapterDemo {
    // What OUR code expects
    interface PaymentGateway {
        String charge(double amount, String currency);
    }

    // Third-party SDKs we cannot change (different shapes)
    static class StripeApi {
        String createCharge(long cents, String currencyCode) {
            return "stripe charged " + cents + " cents " + currencyCode;
        }
    }
    static class PayPalSdk {
        String makePayment(String amountText) { return "paypal paid " + amountText; }
    }

    // ADAPTERS: implement our interface, translate, delegate
    static class StripeAdapter implements PaymentGateway {
        private final StripeApi stripe;
        StripeAdapter(StripeApi stripe) { this.stripe = stripe; }
        public String charge(double amount, String currency) {
            long cents = Math.round(amount * 100);       // NOT (int) (amount * 100): see the trap
            return stripe.createCharge(cents, currency.toUpperCase());
        }
    }
    static class PayPalAdapter implements PaymentGateway {
        private final PayPalSdk paypal;
        PayPalAdapter(PayPalSdk paypal) { this.paypal = paypal; }
        public String charge(double amount, String currency) {
            return paypal.makePayment(String.format("%.2f %s", amount, currency.toUpperCase()));
        }
    }

    public static void main(String[] args) {
        PaymentGateway[] gateways = {
            new StripeAdapter(new StripeApi()), new PayPalAdapter(new PayPalSdk())
        };
        for (PaymentGateway g : gateways) {
            System.out.println("charge(19.99, usd) -> " + g.charge(19.99, "usd"));
        }
        System.out.println("charge(0.29, eur)  -> " + gateways[0].charge(0.29, "eur"));
        System.out.println("the trap: (int) (19.99 * 100) = " + (int) (19.99 * 100));
    }
}
```

**Output:**

```
charge(19.99, usd) -> stripe charged 1999 cents USD
charge(19.99, usd) -> paypal paid 19.99 USD
charge(0.29, eur)  -> stripe charged 29 cents EUR
the trap: (int) (19.99 * 100) = 1998
```

### Facade — Simple Interface to Complex Subsystem

![Infographic on the Facade pattern: the smell (every client repeats dvd.on(); dvd.play("Inception"); amp.on(); amp.setVolume(8); projector.on(); projector.wideScreenMode(); lights.dim(30);), the 4-step fix (HomeTheaterFacade holds the four subsystem objects, watchMovie(title) runs the steps in order, endMovie() turns everything off, subsystem classes stay available), a universal-remote analogy, a How It Works diagram where Client makes 1 call to HomeTheaterFacade, which drives TheaterLights, Projector, Amplifier and DvdPlayer in 7 numbered steps beside a remote with one big Movie button, and a How It Runs table from the Java output (watchMovie("Inception"): lights 30%, projector on, projector 16:9, amp on, amp volume 8, dvd on, dvd play 'Inception'; endMovie(): dvd off, amp off, projector off, lights 100%).](diagrams/ood21_info_facade_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Problem:** a subsystem has many classes that must be called in the right order. Every
client repeating that choreography is verbose and error-prone.

```java
  // WITHOUT FACADE (client deals with complexity):
  // ─────────────────────────────────────────────────────
  DVDPlayer dvd = new DVDPlayer();
  Amplifier amp = new Amplifier();
  Projector projector = new Projector();
  TheaterLights lights = new TheaterLights();
  dvd.on(); dvd.play("Inception");
  amp.on(); amp.setVolume(8);
  projector.on(); projector.wideScreenMode();
  lights.dim(30);
```

**The fix:** one class — the facade — holds the subsystem objects and offers a few high-level
methods (`watchMovie(title)`, `endMovie()`) that run the steps in the right order. Clients make
one call; the subsystem classes are still there for anyone who needs fine control.

**Real-world:** SDK wrappers, Google Cloud client libraries (one `Storage` object hides auth,
retries and HTTP), ORM facades, an API gateway in front of many microservices.

**Official Definition:**
> Provide a unified interface to a set of interfaces in a subsystem; the facade defines a
> higher-level interface that makes the subsystem easier to use. (GoF, 1994)

</details>

**Java — runnable** (one call to the facade, seven subsystem steps):

```java
import java.util.*;

public class FacadeDemo {
    // The complex subsystem: four classes, each with its own API (they log what they do)
    static class Device {
        final List<String> log;
        Device(List<String> log) { this.log = log; }
    }
    static class DvdPlayer extends Device {
        DvdPlayer(List<String> log) { super(log); }
        void on() { log.add("dvd on"); }
        void play(String title) { log.add("dvd play '" + title + "'"); }
        void off() { log.add("dvd off"); }
    }
    static class Amplifier extends Device {
        Amplifier(List<String> log) { super(log); }
        void on() { log.add("amp on"); }
        void setVolume(int v) { log.add("amp volume " + v); }
        void off() { log.add("amp off"); }
    }
    static class Projector extends Device {
        Projector(List<String> log) { super(log); }
        void on() { log.add("projector on"); }
        void wideScreenMode() { log.add("projector 16:9"); }
        void off() { log.add("projector off"); }
    }
    static class TheaterLights extends Device {
        TheaterLights(List<String> log) { super(log); }
        void dim(int percent) { log.add("lights " + percent + "%"); }
    }

    // The FACADE: two simple methods that run the right steps in the right order
    static class HomeTheaterFacade {
        private final DvdPlayer dvd;
        private final Amplifier amp;
        private final Projector projector;
        private final TheaterLights lights;

        HomeTheaterFacade(DvdPlayer dvd, Amplifier amp, Projector projector, TheaterLights lights) {
            this.dvd = dvd;
            this.amp = amp;
            this.projector = projector;
            this.lights = lights;
        }

        void watchMovie(String title) {
            lights.dim(30);
            projector.on();
            projector.wideScreenMode();
            amp.on();
            amp.setVolume(8);
            dvd.on();
            dvd.play(title);
        }

        void endMovie() {
            dvd.off();
            amp.off();
            projector.off();
            lights.dim(100);
        }
    }

    static void report(String call, List<String> log) {
        System.out.println(call + " ran " + log.size() + " steps:");
        for (int i = 0; i < log.size(); i++) System.out.println("  " + (i + 1) + ". " + log.get(i));
        log.clear();
    }

    public static void main(String[] args) {
        List<String> log = new ArrayList<>();
        HomeTheaterFacade theater = new HomeTheaterFacade(
                new DvdPlayer(log), new Amplifier(log), new Projector(log), new TheaterLights(log));

        theater.watchMovie("Inception");                  // ONE call for the client...
        report("watchMovie(\"Inception\")", log);          // ...many subsystem steps
        theater.endMovie();
        report("endMovie()", log);
    }
}
```

**Output:**

```
watchMovie("Inception") ran 7 steps:
  1. lights 30%
  2. projector on
  3. projector 16:9
  4. amp on
  5. amp volume 8
  6. dvd on
  7. dvd play 'Inception'
endMovie() ran 4 steps:
  1. dvd off
  2. amp off
  3. projector off
  4. lights 100%
```

### Decorator — Add Behavior Without Modifying Original

![Decorator infographic: SimpleCoffee $2.00 wrapped by MilkDecorator +$0.50 and SugarDecorator +$0.20 gives $2.70 — same interface, layered behaviour, no subclass per combination](diagrams/ood21_info_decorator_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

```
  PROBLEM: You want to add responsibilities to objects dynamically,
  without subclassing.

  EXAMPLE: Adding features to a coffee order.

  Coffee coffee = new SimpleCoffee();                     // $2.00
  coffee = new MilkDecorator(coffee);                     // $2.00 + $0.50
  coffee = new SugarDecorator(coffee);                    // $2.50 + $0.20
  double finalCost = coffee.cost();                       // $2.70

  ┌──────────────────────────────────────────────────────────────┐
  │  SugarDecorator                                              │
  │  ┌────────────────────────────────────────────────────────┐  │
  │  │  MilkDecorator                                         │  │
  │  │  ┌──────────────────────────────────────────────────┐  │  │
  │  │  │  SimpleCoffee ($2.00)                             │  │  │
  │  │  └──────────────────────────────────────────────────┘  │  │
  │  │  + milk ($0.50) = $2.50                                │  │
  │  └────────────────────────────────────────────────────────┘  │
  │  + sugar ($0.20) = $2.70                                     │
  └──────────────────────────────────────────────────────────────┘

  Each decorator wraps the previous one. You can stack them
  in any order. Compare to subclassing:
  - CoffeeWithMilk, CoffeeWithSugar, CoffeeWithMilkAndSugar,
    CoffeeWithDoubleMilk... class explosion!

  REAL-WORLD: Java I/O streams (new BufferedReader(new FileReader(f))),
  middleware in web frameworks, logging and caching wrappers.
```

</details>

**Java — runnable:**

```java
public class DecoratorDemo {
    interface Coffee {
        double cost();
        String description();
    }

    static class SimpleCoffee implements Coffee {
        public double cost() { return 2.00; }
        public String description() { return "coffee"; }
    }

    // A decorator IS-A Coffee (same interface) and HAS-A Coffee (the one it wraps)
    static abstract class CoffeeDecorator implements Coffee {
        protected final Coffee inner;
        CoffeeDecorator(Coffee inner) { this.inner = inner; }
    }

    static class MilkDecorator extends CoffeeDecorator {
        MilkDecorator(Coffee inner) { super(inner); }
        public double cost() { return inner.cost() + 0.50; }          // forward, then add
        public String description() { return inner.description() + " + milk"; }
    }

    static class SugarDecorator extends CoffeeDecorator {
        SugarDecorator(Coffee inner) { super(inner); }
        public double cost() { return inner.cost() + 0.20; }
        public String description() { return inner.description() + " + sugar"; }
    }

    static void show(Coffee c) {
        System.out.printf("%-28s -> $%.2f%n", c.description(), c.cost());
    }

    public static void main(String[] args) {
        show(new SimpleCoffee());
        show(new MilkDecorator(new SimpleCoffee()));
        show(new SugarDecorator(new MilkDecorator(new SimpleCoffee())));
        show(new MilkDecorator(new MilkDecorator(new SugarDecorator(new SimpleCoffee()))));
    }
}
```

**Output:**

```
coffee                       -> $2.00
coffee + milk                -> $2.50
coffee + milk + sugar        -> $2.70
coffee + sugar + milk + milk -> $3.20
```

### Proxy — Control Access to an Object

![Infographic on the Proxy pattern: the problem (caching, permission checks, lazy loading or remote access without changing the object or its callers; every getForecast(city) is a slow network call), the 4-step fix (proxy implements the same WeatherService interface, holds the real object, decides whether/when/how to forward, callers can't tell), a receptionist analogy, a UML diagram where Client uses «interface» WeatherService implemented by CachingWeatherProxy and RemoteWeatherService, the proxy holding the real one via cache.computeIfAbsent (real call at most once per city), the four proxy types (Virtual, Protection, Caching, Remote/gRPC stubs), and a How It Runs table from the Java output (London miss 12 C calls 1; London hit 12 C calls 1; Paris miss 15 C calls 2; London hit 12 C calls 2 — 4 calls, only 2 reach the real service).](diagrams/ood21_info_proxy_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Problem:** you need to control access to an object — add caching, permission checks, lazy
loading or remote access — without changing the object or its callers.

**The fix:** a proxy implements the SAME interface as the real object and holds a reference to
it. Callers can't tell the difference; the proxy decides whether, when and how to forward each
call.

```
  Types of Proxies:
  ┌────────────────┬──────────────────────────────────────────┐
  │ Virtual Proxy  │ Delays creation until actually needed    │
  │                │ (lazy loading heavy resources)           │
  ├────────────────┼──────────────────────────────────────────┤
  │ Protection     │ Controls access based on permissions     │
  │ Proxy          │ (auth check before allowing operation)   │
  ├────────────────┼──────────────────────────────────────────┤
  │ Caching Proxy  │ Stores results of expensive operations   │
  │                │ (return cached result if available)      │
  ├────────────────┼──────────────────────────────────────────┤
  │ Remote Proxy   │ Represents object in a different process │
  │                │ (RPC, gRPC stubs)                        │
  └────────────────┴──────────────────────────────────────────┘
```

The caching proxy below uses `ConcurrentHashMap.computeIfAbsent`, which runs the real call at
most once per key even when many threads ask at the same time (the others wait for that one
result).

**Official Definition:**
> Provide a surrogate or placeholder for another object to control access to it. (GoF, 1994)

</details>

**Java — runnable** (a caching proxy: the real service is called once per city):

```java
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class ProxyDemo {
    record Forecast(String city, int tempC) {}

    interface WeatherService {
        Forecast getForecast(String city);
    }

    // The REAL service: imagine a slow network call
    static class RemoteWeatherService implements WeatherService {
        int calls = 0;
        private final Map<String, Integer> temps = Map.of("London", 12, "Paris", 15);
        public Forecast getForecast(String city) {
            calls++;
            return new Forecast(city, temps.getOrDefault(city, 20));
        }
    }

    // CACHING PROXY: same interface, decides whether the real call is needed
    static class CachingWeatherProxy implements WeatherService {
        private final WeatherService realService;
        private final Map<String, Forecast> cache = new ConcurrentHashMap<>();

        CachingWeatherProxy(WeatherService realService) { this.realService = realService; }

        @Override
        public Forecast getForecast(String city) {
            return cache.computeIfAbsent(city, realService::getForecast);
        }
    }

    public static void main(String[] args) {
        RemoteWeatherService real = new RemoteWeatherService();
        WeatherService weather = new CachingWeatherProxy(real);   // looks like the real one
        for (String city : List.of("London", "London", "Paris", "London")) {
            Forecast f = weather.getForecast(city);
            System.out.printf("%-19s -> %d C, real calls so far = %d%n",
                    "getForecast(" + city + ")", f.tempC(), real.calls);
        }
    }
}
```

**Output:**

```
getForecast(London) -> 12 C, real calls so far = 1
getForecast(London) -> 12 C, real calls so far = 1
getForecast(Paris)  -> 15 C, real calls so far = 2
getForecast(London) -> 12 C, real calls so far = 2
```

### Composite — Treat One and Many the Same Way

![Infographic on the Composite pattern: the smell (separate if (isFolder) … else … code for one thing and a group, repeated in every client), the 4-step fix (one FsNode interface with size() and print(); FileNode leaf returns its own size; Folder composite sums its children's size(); clients call size() on any node), a 'how big is this folder?' analogy, a UML diagram where FileNode (leaf) and Folder (composite) implement «interface» FsNode and Folder holds children 0..*, nested boxes home/ 804 KB containing notes.txt 4 KB, photos/ 800 KB (cat.png 300 KB + dog.png 500 KB) and an empty tmp/ 0 KB (300 + 500 = 800; 4 + 800 + 0 = 804), and a How It Runs table from the Java output (size(home) 804, photos 800, tmp 0, todo.md 2).](diagrams/ood21_info_composite_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Simple Explanation:**
A folder can contain files and other folders. When you ask "how big is this?", you don't care
whether it's one file or a folder holding 10,000 — you ask the same question, and a folder
simply asks its children and adds up the answers. Composite gives a single object (a *leaf*)
and a group of objects (a *composite*) one shared interface, so client code never needs
`if (isFolder)`.

**Problem:** you have a part-whole tree — files and folders, an org chart, UI widgets inside
panels, an arithmetic expression — and clients would otherwise need separate code for "one
thing" and "a group of things".

```
             «interface» FsNode
             + size()   + print()
               △          △
               ┆          ┆   implements
           FileNode     Folder ◆──── children: 0..* FsNode
           (leaf)       (composite: size() = sum of the children's size())

  home/              804 KB   ← Folder
  ├── notes.txt        4 KB   ← FileNode
  ├── photos/        800 KB   ← a Folder inside a Folder
  │   ├── cat.png    300 KB
  │   └── dog.png    500 KB
  └── tmp/             0 KB   ← an empty Folder still works
```

**Trap:** where do `add()`/`remove()` live? Put them only on the composite (the "safe" design —
the compiler stops you adding a child to a file), or on the shared interface (the
"transparent" design — uniform, but a leaf must throw). The program below uses the safe design.

**Official Definition:**
> Compose objects into tree structures to represent part-whole hierarchies; Composite lets
> clients treat individual objects and compositions of objects uniformly. (GoF, 1994)

**Real-world:** file systems, UI component trees (a panel is a component that contains
components), org charts, expression trees in compilers, menus with sub-menus.

</details>

**Java — runnable:**

```java
import java.util.*;

public class CompositeDemo {
    // COMPONENT: what clients see, for a single file AND for a whole folder
    interface FsNode {
        String name();
        long size();
        void print(String indent, StringBuilder out);
    }

    // LEAF: has no children
    record FileNode(String name, long size) implements FsNode {
        public void print(String indent, StringBuilder out) {
            out.append(indent).append(name).append(" (").append(size).append(" KB)\n");
        }
    }

    // COMPOSITE: holds children and forwards the same calls to them
    static class Folder implements FsNode {
        private final String name;
        private final List<FsNode> children = new ArrayList<>();
        Folder(String name, FsNode... kids) { this.name = name; children.addAll(List.of(kids)); }
        public String name() { return name; }
        public long size() {
            return children.stream().mapToLong(FsNode::size).sum();   // recursion through the tree
        }
        public void print(String indent, StringBuilder out) {
            out.append(indent).append(name).append("/ (").append(size()).append(" KB)\n");
            for (FsNode child : children) child.print(indent + "  ", out);
        }
    }

    public static void main(String[] args) {
        Folder photos = new Folder("photos",
                new FileNode("cat.png", 300), new FileNode("dog.png", 500));
        Folder empty = new Folder("tmp");
        Folder root = new Folder("home", new FileNode("notes.txt", 4), photos, empty);

        StringBuilder tree = new StringBuilder();
        root.print("", tree);
        System.out.print(tree);
        for (FsNode n : List.of(root, photos, empty, new FileNode("todo.md", 2))) {
            System.out.printf("%-13s -> %d%n", "size(" + n.name() + ")", n.size());   // any node
        }
    }
}
```

**Output:**

```
home/ (804 KB)
  notes.txt (4 KB)
  photos/ (800 KB)
    cat.png (300 KB)
    dog.png (500 KB)
  tmp/ (0 KB)
size(home)    -> 804
size(photos)  -> 800
size(tmp)     -> 0
size(todo.md) -> 2
```

### Look-alike patterns compared — Adapter vs Facade vs Decorator vs Proxy

![Comparison infographic of four look-alike wrapper patterns: Adapter (Client → Adapter → OldApi; interface changed; wraps 1 object; 'Same job, wrong shape'), Facade (Client → Facade → Part A, Part B, Part C; new, smaller interface; wraps many objects; 'Too many parts, one button'), Decorator (Client → Deco 2 → Deco 1 → Real; same interface; layers stack; 'Same thing, plus extra') and Proxy (Client → Proxy → Real, may NOT forward; same interface; 'Same thing, but guarded'), a 'Pick by Need' table, Common Mix-Ups (Decorator always forwards and adds vs Proxy decides whether to forward; Adapter wraps 1 object vs Facade wraps many), and a How It Runs table from the SMS Java example (adapter/decorator/proxy #1 send 'SMS to 555-0101: hi', proxy #2 'BLOCKED: quota used up', facade 'SMS to 555-0199: order #42 shipped -- Team ML4', audit log [notified ann]).](diagrams/ood21_info_lookalikes_ai.png)

<details>
<summary><strong>Read as text</strong> — the comparison table, the hardest pair and the definitions</summary>

**Simple Explanation:**
All four put a wrapper object in front of something else, so their code looks almost the same:
a class that holds a reference and forwards calls. What differs is the *intent* — and that is
exactly what interviewers ask about.

| Pattern | Intent | Interface changed? | Wraps | Typical use | One-line tell |
|---|---|---|---|---|---|
| **Adapter** | make an existing class fit the interface you expect | **Yes** — old shape → expected shape | 1 object | third-party SDKs, legacy code | "Same job, wrong shape" |
| **Facade** | a simple front door to a complex subsystem | **New, smaller** interface | many objects | SDK wrappers, "one call does it all" | "Too many parts, one button" |
| **Decorator** | add behaviour in stackable layers | **No** — same interface | 1 object (layers can stack) | logging, compression, coffee add-ons | "Same thing, plus extra" |
| **Proxy** | control access to the real object | **No** — same interface | 1 object | caching, auth, lazy loading, RPC stubs | "Same thing, but guarded" |

```
  Adapter    Client ──► [Adapter] ──► OldApi                 different method names
  Decorator  Client ──► [Deco 2] ──► [Deco 1] ──► Real       same interface, layered
  Proxy      Client ──► [Proxy] ──► Real                     same interface, may NOT forward
  Facade     Client ──► [Facade] ──┬──► Part A
                                   ├──► Part B
                                   └──► Part C               new, smaller interface
```

**Decorator vs Proxy — the hardest pair:** both keep the interface. A decorator always forwards
and *adds* something, and the client chooses how to stack them. A proxy *decides* whether to
forward at all (cache hit, permission denied, quota used up), and the client usually doesn't
know it is there.

**Official Definition:**
> All four are GoF structural patterns. **Adapter** converts the interface of a class into the
> one clients expect; **Facade** defines a new, higher-level interface over a subsystem;
> **Decorator** attaches extra responsibilities dynamically behind the same interface;
> **Proxy** provides a surrogate that controls access to an object behind the same interface.

</details>

**Java — all four on one tiny example** (an SMS messenger):

```java
import java.util.*;

public class LookAlikesDemo {
    // The interface our app talks to
    interface Messenger {
        String send(String to, String text);
    }

    // A legacy SDK with the WRONG shape (we can't edit it)
    static class LegacySmsSdk {
        String transmit(String phone, char[] payload) {
            return "SMS to " + phone + ": " + new String(payload);
        }
    }

    // ADAPTER: wraps 1 object, CHANGES the interface (transmit -> send)
    static class SmsAdapter implements Messenger {
        private final LegacySmsSdk sdk;
        SmsAdapter(LegacySmsSdk sdk) { this.sdk = sdk; }
        public String send(String to, String text) { return sdk.transmit(to, text.toCharArray()); }
    }

    // DECORATOR: wraps 1 object, SAME interface, ADDS behaviour (stackable)
    static class SignatureDecorator implements Messenger {
        private final Messenger inner;
        SignatureDecorator(Messenger inner) { this.inner = inner; }
        public String send(String to, String text) { return inner.send(to, text + " -- Team ML4"); }
    }

    // PROXY: wraps 1 object, SAME interface, CONTROLS ACCESS (may refuse to forward)
    static class QuotaProxy implements Messenger {
        private final Messenger inner;
        private int remaining;
        QuotaProxy(Messenger inner, int quota) { this.inner = inner; this.remaining = quota; }
        public String send(String to, String text) {
            if (remaining == 0) return "BLOCKED: quota used up";
            remaining--;
            return inner.send(to, text);
        }
    }

    // FACADE: wraps SEVERAL objects, offers a NEW, simpler interface
    static class OrderNotifications {
        private final Messenger messenger;
        private final Map<String, String> phoneBook;
        private final List<String> auditLog;
        OrderNotifications(Messenger m, Map<String, String> phones, List<String> audit) {
            this.messenger = m;
            this.phoneBook = phones;
            this.auditLog = audit;
        }
        String orderShipped(String user, int orderId) {
            String result = messenger.send(phoneBook.get(user), "order #" + orderId + " shipped");
            auditLog.add("notified " + user);
            return result;
        }
    }

    public static void main(String[] args) {
        Messenger adapter = new SmsAdapter(new LegacySmsSdk());
        System.out.println("adapter   -> " + adapter.send("555-0101", "hi"));

        Messenger decorated = new SignatureDecorator(adapter);
        System.out.println("decorator -> " + decorated.send("555-0101", "hi"));

        Messenger limited = new QuotaProxy(decorated, 1);
        System.out.println("proxy #1  -> " + limited.send("555-0101", "hi"));
        System.out.println("proxy #2  -> " + limited.send("555-0101", "hi again"));

        List<String> audit = new ArrayList<>();
        OrderNotifications facade =
                new OrderNotifications(decorated, Map.of("ann", "555-0199"), audit);
        System.out.println("facade    -> " + facade.orderShipped("ann", 42));
        System.out.println("audit log -> " + audit);
    }
}
```

**Output:**

```
adapter   -> SMS to 555-0101: hi
decorator -> SMS to 555-0101: hi -- Team ML4
proxy #1  -> SMS to 555-0101: hi -- Team ML4
proxy #2  -> BLOCKED: quota used up
facade    -> SMS to 555-0199: order #42 shipped -- Team ML4
audit log -> [notified ann]
```

---

## 2.4 Behavioral Patterns

### Observer — "Something changed! Tell everyone who cares."

![Infographic on the Observer pattern: the smell (an order placement that calls email, inventory and analytics by name, so adding loyalty points edits the order code), the 4-step EventBus fix (subscribe callbacks per event, publish calls each in turn, a new reaction is a new subscription), a newsletter analogy, a fan-out diagram where publish("order_placed") on EventBus (Subject) notifies EmailService, Inventory and Analytics ('ONE event → MANY listeners'), an Observer vs Message Queue table (in-process vs across processes, synchronous vs asynchronous, not durable vs consumers catch up, slow listener blocks publisher vs doesn't; brokers Kafka, Pub/Sub, RabbitMQ), and a How It Runs table from the Java output (order_placed told 3: order #1 confirmed, stock now 7, +1 sale of keyboard; order_cancelled told 1: stock now 10; order_refunded told 0).](diagrams/ood21_info_observer_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Problem:** when one object changes state, several other objects must react — and the object
that changed shouldn't need to know who they are.

```
  ┌─────────────────┐   notify    ┌───────────────────┐
  │                 │ ──────────► │ Email Service     │
  │  ORDER PLACED   │ ──────────► │ Inventory Service │
  │  (Subject)      │ ──────────► │ Analytics Service │
  │                 │ ──────────► │ Notification Svc  │
  └─────────────────┘             └───────────────────┘
       ONE event                  MANY listeners (observers)
```

**The fix:** the subject (here an `EventBus`) keeps a list of callbacks per event. Observers
`subscribe`; the subject `publish`es and calls each one in turn. A new reaction — say, a
loyalty-points service — is added by subscribing; the publisher's code doesn't change.

**Observer vs a message queue:** Observer runs **in-process** and usually **synchronously** —
the publisher waits while each listener runs, so a slow or throwing listener hurts it — and
nothing is persisted. A message broker (Kafka, Pub/Sub, RabbitMQ) is the same idea **across
processes**: asynchronous and durable, and consumers can be offline and catch up later.

**Official Definition:**
> Define a one-to-many dependency between objects so that when one object changes state, all
> its dependents are notified and updated automatically. (GoF, 1994)

**Real-world:** GUI event listeners, `PropertyChangeListener` in Java Beans, webhooks, and —
across processes — pub/sub message brokers.

</details>

**Java — runnable:**

```java
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Consumer;

public class ObserverDemo {
    record Order(int id, String item, int qty) {}

    // SUBJECT: keeps a list of observers per event and calls each one on publish
    static class EventBus<T> {
        private final Map<String, List<Consumer<T>>> listeners = new ConcurrentHashMap<>();

        void subscribe(String event, Consumer<T> callback) {
            listeners.computeIfAbsent(event, k -> new CopyOnWriteArrayList<>()).add(callback);
        }

        int publish(String event, T data) {
            List<Consumer<T>> subs = listeners.getOrDefault(event, List.of());
            subs.forEach(cb -> cb.accept(data));
            return subs.size();                          // how many observers were told
        }
    }

    // OBSERVERS: they don't know each other; the bus knows them only as callbacks
    static class EmailService {
        void sendConfirmation(Order o) {
            System.out.println("  email: order #" + o.id() + " confirmed");
        }
    }
    static class Inventory {
        int stock = 10;
        void reduceStock(Order o) {
            stock -= o.qty();
            System.out.println("  inventory: stock now " + stock);
        }
        void restock(Order o) {
            stock += o.qty();
            System.out.println("  inventory: stock now " + stock);
        }
    }
    static class Analytics {
        void logPurchase(Order o) { System.out.println("  analytics: +1 sale of " + o.item()); }
    }

    public static void main(String[] args) {
        EventBus<Order> bus = new EventBus<>();
        EmailService email = new EmailService();
        Inventory inventory = new Inventory();
        Analytics analytics = new Analytics();

        bus.subscribe("order_placed", email::sendConfirmation);
        bus.subscribe("order_placed", inventory::reduceStock);
        bus.subscribe("order_placed", analytics::logPurchase);
        bus.subscribe("order_cancelled", inventory::restock);

        Order order = new Order(1, "keyboard", 3);
        for (String event : List.of("order_placed", "order_cancelled", "order_refunded")) {
            System.out.println("publish " + event + ":");
            System.out.println("  -> observers told: " + bus.publish(event, order));
        }
    }
}
```

**Output:**

```
publish order_placed:
  email: order #1 confirmed
  inventory: stock now 7
  analytics: +1 sale of keyboard
  -> observers told: 3
publish order_cancelled:
  inventory: stock now 10
  -> observers told: 1
publish order_refunded:
  -> observers told: 0
```

### Strategy — Swap Algorithms at Runtime

![Infographic on the Strategy pattern: the smell (an if/else price method — holiday base * 0.80, vip base * 0.70, else base — edited for every new rule), the 4-step fix (PricingStrategy.calculate(basePrice); RegularPricing, HolidaySale, VipPricing; ShoppingCart calls calculate() without asking which; a lambda price -> price * 0.85 is a strategy too), a maps-app route analogy, a UML diagram where ShoppingCart has-a «interface» PricingStrategy implemented by RegularPricing, HolidaySale, VipPricing and a lambda, a cart (book 100.00 + pen 50.00) with a dial choosing among four totals, and a How It Runs table from the Java output (regular 150.00, holiday 20% off 120.00, VIP 30% off 105.00, lambda 15% off 127.50).](diagrams/ood21_info_strategy_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Problem:** you need different algorithms for the same task and want to switch between them
without an `if/else` chain. Example: pricing rules for an e-commerce site.

```java
  // BAD: every new pricing rule means editing this method
  double price(String customerType, double base) {
      if (customerType.equals("holiday")) return base * 0.80;
      else if (customerType.equals("vip")) return base * 0.70;
      else return base;
  }
```

**The fix:** put each algorithm in its own class behind one interface (`PricingStrategy`), and
give the `ShoppingCart` the strategy to use. The cart calls `strategy.calculate(price)` and
never asks which one it has. Because the interface has a single method, a lambda is a strategy
too: `new ShoppingCart(price -> price * 0.85)`.

**Official Definition:**
> Define a family of algorithms, encapsulate each one, and make them interchangeable; Strategy
> lets the algorithm vary independently from the clients that use it. (GoF, 1994)

**Real-world:** a `Comparator` passed to `List.sort` (the canonical Java strategy), compression
algorithms, retry/backoff policies, authentication methods, payment processing.

</details>

**Java — runnable** (a cart holding a 100.00 book and a 50.00 pen):

```java
import java.util.*;

public class StrategyDemo {
    record Item(String name, double price) {}

    // STRATEGY: one interface, many interchangeable algorithms
    interface PricingStrategy {
        double calculate(double basePrice);
    }

    static class RegularPricing implements PricingStrategy {
        public double calculate(double basePrice) { return basePrice; }
    }
    static class HolidaySale implements PricingStrategy {
        public double calculate(double basePrice) { return basePrice * 0.80; }   // 20% off
    }
    static class VipPricing implements PricingStrategy {
        public double calculate(double basePrice) { return basePrice * 0.70; }   // 30% off
    }

    // CONTEXT: uses whatever strategy it was given, with no if/else on the type
    static class ShoppingCart {
        private final PricingStrategy strategy;
        ShoppingCart(PricingStrategy strategy) { this.strategy = strategy; }
        double checkout(List<Item> items) {
            return items.stream().mapToDouble(item -> strategy.calculate(item.price())).sum();
        }
    }

    public static void main(String[] args) {
        List<Item> items = List.of(new Item("book", 100.00), new Item("pen", 50.00));
        Map<String, PricingStrategy> strategies = new LinkedHashMap<>();
        strategies.put("regular", new RegularPricing());
        strategies.put("holiday (20% off)", new HolidaySale());
        strategies.put("VIP (30% off)", new VipPricing());
        strategies.put("lambda (15% off)", price -> price * 0.85);   // a strategy can be a lambda
        for (var entry : strategies.entrySet()) {
            double total = new ShoppingCart(entry.getValue()).checkout(items);
            System.out.printf("%-17s -> %.2f%n", entry.getKey(), total);
        }
    }
}
```

**Output:**

```
regular           -> 150.00
holiday (20% off) -> 120.00
VIP (30% off)     -> 105.00
lambda (15% off)  -> 127.50
```

### Command — Encapsulate a Request as an Object

![Infographic on the Command pattern: the smell (button → editor.makeBold() runs and is forgotten — no undo, log or replay), the 4-step fix (Command interface with execute() and undo(); TypeCommand and BoldCommand remember how to reverse themselves; the CommandHistory invoker pushes each command on a stack; undo pops and reverses the last one), a restaurant order-ticket analogy, a UML diagram Button → CommandHistory (invoker) holding a stack of «interface» Command, implemented by TypeCommand and BoldCommand which call the Editor (receiver), a history stack of Type Hello, Type world and Bold with push and undo = pop, and a How It Runs table from the Java output (stack size 1, 2, 3, 2, 1, 0; editor shows "Hello", "Hello world", **Hello world**, "Hello world", "Hello", "").](diagrams/ood21_info_command_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Problem:** you need to queue actions, log them, replay them, or undo them. If a button calls
`editor.makeBold()` directly, the action is gone the moment it has run.

```
  ┌───────────────────────────────────────────────────────────┐
  │  Without Command:                                         │
  │  button ──► editor.makeBold()      ← runs, then forgotten │
  │                                                           │
  │  With Command:                                            │
  │  button ──► history.execute(new BoldCommand(editor))      │
  │             the command OBJECT is kept: undo, log, replay │
  └───────────────────────────────────────────────────────────┘
```

**The fix:** wrap each action in an object with `execute()` and `undo()`. An *invoker*
(`CommandHistory`) runs commands and pushes them on a stack; `undo()` pops the last one and
calls its `undo()`. Each command remembers what it needs to reverse itself (the text it typed,
the bold state before it ran). The object doing the real work (`Editor`) is the *receiver*.

**Official Definition:**
> Encapsulate a request as an object, thereby letting you parameterize clients with different
> requests, queue or log requests, and support undoable operations. (GoF, 1994)

**Real-world:** undo/redo in editors, task queues and job schedulers, transaction logs, macro
recording, and every `Runnable`/`Callable` you hand to an `ExecutorService`.

</details>

**Java — runnable:**

```java
import java.util.*;

public class CommandDemo {
    // RECEIVER: the object that does the real work
    static class Editor {
        private final StringBuilder text = new StringBuilder();
        private boolean bold;
        void type(String s)   { text.append(s); }
        void erase(int n)     { text.setLength(text.length() - n); }
        void setBold(boolean b) { bold = b; }
        boolean isBold()      { return bold; }
        String show() { return bold ? "**" + text + "**" : "\"" + text + "\""; }
    }

    // COMMAND: an action packed into an object, so it can be stored, undone, replayed
    interface Command {
        void execute();
        void undo();
    }

    static class TypeCommand implements Command {
        private final Editor editor;
        private final String s;
        TypeCommand(Editor editor, String s) { this.editor = editor; this.s = s; }
        public void execute() { editor.type(s); }
        public void undo()    { editor.erase(s.length()); }
    }

    static class BoldCommand implements Command {
        private final Editor editor;
        private boolean before;                          // remember what to restore
        BoldCommand(Editor editor) { this.editor = editor; }
        public void execute() { before = editor.isBold(); editor.setBold(true); }
        public void undo()    { editor.setBold(before); }
    }

    // INVOKER: runs commands and keeps the history for undo
    static class CommandHistory {
        private final Deque<Command> history = new ArrayDeque<>();
        void execute(Command command) {
            command.execute();
            history.push(command);
        }
        void undo() {
            if (!history.isEmpty()) history.pop().undo();
        }
    }

    public static void main(String[] args) {
        Editor editor = new Editor();
        CommandHistory history = new CommandHistory();

        history.execute(new TypeCommand(editor, "Hello"));
        System.out.println("type \"Hello\"  -> " + editor.show());
        history.execute(new TypeCommand(editor, " world"));
        System.out.println("type \" world\" -> " + editor.show());
        history.execute(new BoldCommand(editor));
        System.out.println("bold          -> " + editor.show());
        history.undo();
        System.out.println("undo          -> " + editor.show());
        history.undo();
        System.out.println("undo          -> " + editor.show());
        history.undo();
        history.undo();                                  // nothing left: safely ignored
        System.out.println("undo, undo    -> " + editor.show());
    }
}
```

**Output:**

```
type "Hello"  -> "Hello"
type " world" -> "Hello world"
bold          -> **Hello world**
undo          -> "Hello world"
undo          -> "Hello"
undo, undo    -> ""
```

### State — Different Behavior Per State

![State pattern infographic: a Document moves Draft → Review → Published with publish and back to Draft with reject — one class per state, the Document only delegates](diagrams/ood21_info_state_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

```
  PROBLEM: An object behaves differently depending on its internal state.
  Without the pattern, you get massive if/else chains.

  EXAMPLE: A document workflow.

  // BAD (if/else explosion):
  // ────────────────────────────────────────────────────────
  public class Document {
      private String state = "draft";
      public void publish() {
          if (state.equals("draft"))          state = "review";
          else if (state.equals("review"))    state = "published";
          else if (state.equals("published")) throw new IllegalStateException("Already published!");
      }
  }
  // Every method needs this if/else chain. Add a new state? Touch EVERY method.

  // GOOD (State Pattern):
  // ────────────────────────────────────────────────────────
  public interface DocumentState {
      void publish(Document doc);
      void reject(Document doc);
  }

  public class DraftState implements DocumentState {
      public void publish(Document doc) {
          doc.setState(new ReviewState());      // transition to review
          System.out.println("Sent for review!");
      }
      public void reject(Document doc) {
          System.out.println("Nothing to reject.");
      }
  }

  public class ReviewState implements DocumentState {
      public void publish(Document doc) {
          doc.setState(new PublishedState());    // transition to published
          System.out.println("Published!");
      }
      public void reject(Document doc) {
          doc.setState(new DraftState());        // back to draft
          System.out.println("Sent back to draft.");
      }
  }

  public class PublishedState implements DocumentState {
      public void publish(Document doc) { System.out.println("Already published!"); }
      public void reject(Document doc)  { doc.setState(new DraftState()); }
  }

  public class Document {
      private DocumentState state = new DraftState();
      public void setState(DocumentState state) { this.state = state; }
      public void publish() { state.publish(this); }   // delegate to current state!
      public void reject()  { state.reject(this); }
  }

  ┌─────────┐   publish   ┌──────────┐   publish   ┌───────────┐
  │  Draft  │ ──────────> │  Review  │ ──────────> │ Published │
  │         │ <────────── │          │             │           │
  └─────────┘   reject    └──────────┘             └───────────┘
       ▲                                                 │
       └──────────────────── reject ─────────────────────┘

  Add a new state? Just add a new class. No existing code changes.

  REAL-WORLD: Order status (placed→paid→shipped→delivered),
  TCP connections, game character states, UI components.
```

</details>

**Java — runnable** (the same design; each state returns a message instead of printing, so `main` can show every transition):

```java
public class StateDemo {
    interface DocumentState {
        String publish(Document doc);    // each method returns what happened
        String reject(Document doc);
        String name();
    }

    static class DraftState implements DocumentState {
        public String publish(Document doc) { doc.setState(new ReviewState()); return "sent for review"; }
        public String reject(Document doc)  { return "nothing to reject"; }
        public String name() { return "Draft"; }
    }

    static class ReviewState implements DocumentState {
        public String publish(Document doc) { doc.setState(new PublishedState()); return "published"; }
        public String reject(Document doc)  { doc.setState(new DraftState()); return "sent back to draft"; }
        public String name() { return "Review"; }
    }

    static class PublishedState implements DocumentState {
        public String publish(Document doc) { return "already published"; }
        public String reject(Document doc)  { doc.setState(new DraftState()); return "unpublished, back to draft"; }
        public String name() { return "Published"; }
    }

    static class Document {
        private DocumentState state = new DraftState();
        void setState(DocumentState state) { this.state = state; }
        String publish() { return state.publish(this); }   // delegate to the current state
        String reject()  { return state.reject(this); }
        String stateName() { return state.name(); }
    }

    public static void main(String[] args) {
        Document doc = new Document();
        String[] actions = { "reject", "publish", "reject", "publish", "publish", "publish" };
        for (String action : actions) {
            String before = doc.stateName();
            String result = action.equals("publish") ? doc.publish() : doc.reject();
            System.out.printf("%-8s %-9s -> %-9s (%s)%n", action, before, doc.stateName(), result);
        }
    }
}
```

**Output:**

```
reject   Draft     -> Draft     (nothing to reject)
publish  Draft     -> Review    (sent for review)
reject   Review    -> Draft     (sent back to draft)
publish  Draft     -> Review    (sent for review)
publish  Review    -> Published (published)
publish  Published -> Published (already published)
```

### Template Method — Define Skeleton, Let Subclasses Fill In Details

![Infographic on the Template Method pattern: the smell (PdfReport and CsvReport each copy header, data, rows, footer, so the copies drift apart), the 4-step fix (a final generate() in ReportGenerator fixes the order; shared header(); abstract processData() and formatRow(); hook includeFooter() defaulting to true), the Hollywood principle ('don't call us, we'll call you'), a UML diagram where PdfReport and CsvReport extend «abstract» ReportGenerator, a skeleton table of the 4 steps (shared/abstract/abstract/hook) showing PDF one total per region with '* US total 300' and footer yes vs CSV every raw row 'US,300' and footer no, and a How It Runs table from the Java output for sales EU 120, US 300, EU 80, APAC 150 (PdfReport: * US total 300, * EU total 200, * APAC total 150, -- 3 rows --; CsvReport: EU,120, US,300, EU,80, APAC,150, no footer; empty PdfReport: -- 0 rows --).](diagrams/ood21_info_template_method_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Problem:** several classes run the same algorithm — the same steps in the same order — but
differ in some of the steps. Copy-pasting the whole algorithm into each class duplicates the
order and lets the copies drift apart.

**The fix:** a base class owns the algorithm in one `final` method (the *template method*) that
calls the steps in order. Shared steps are written once in the base class; the varying steps are
`abstract`, and each subclass fills them in. Optional steps are *hooks*: methods with a default
that a subclass *may* override.

```
  generate(data)    ← final: the ORDER of steps can't be changed
    1. header()            shared     "== PdfReport =="
    2. processData(data)   abstract   PDF: one total per region  │ CSV: every raw row
    3. formatRow(row)      abstract   PDF: "  * US total 300"    │ CSV: "US,300"
    4. includeFooter()     hook       PDF: yes (the default)     │ CSV: no (overridden)
```

This is the "Hollywood principle" — *don't call us, we'll call you*: the base class calls the
subclass's steps, never the other way round.

**Template Method vs Strategy:** both vary part of an algorithm. Template Method uses
inheritance (fixed when you pick the subclass); Strategy uses composition (pass in an object,
swap it at runtime). Prefer Strategy when variants must be mixed or changed at runtime.

**Official Definition:**
> Define the skeleton of an algorithm in an operation, deferring some steps to subclasses;
> Template Method lets subclasses redefine certain steps of an algorithm without changing the
> algorithm's structure. (GoF, 1994)

**Real-world:** `HttpServlet.service()` calling your `doGet`/`doPost`, `java.util.AbstractList`
(implement `get` and `size`, inherit the rest), JUnit's set-up → test → tear-down lifecycle,
ETL pipeline steps.

</details>

**Java — runnable** (sales: EU 120, US 300, EU 80, APAC 150):

```java
import java.util.*;
import java.util.stream.Collectors;

public class TemplateMethodDemo {
    record Sale(String region, int amount) {}

    // The TEMPLATE: the order of steps is fixed and final
    static abstract class ReportGenerator {
        public final String generate(List<Sale> data) {      // the template method
            StringBuilder out = new StringBuilder();
            out.append(header()).append('\n');               // shared step
            List<String> rows = processData(data);           // varies
            for (String row : rows) out.append(formatRow(row)).append('\n');   // varies
            if (includeFooter()) out.append("-- ").append(rows.size()).append(" rows --\n"); // hook
            return out.toString();
        }

        private String header() { return "== " + getClass().getSimpleName() + " =="; }

        protected abstract List<String> processData(List<Sale> data);   // subclass MUST fill in
        protected abstract String formatRow(String row);               // subclass MUST fill in
        protected boolean includeFooter() { return true; }             // HOOK: may override
    }

    // PDF for executives: one total per region, biggest first, as text lines
    static class PdfReport extends ReportGenerator {
        protected List<String> processData(List<Sale> data) {
            Map<String, Integer> byRegion = data.stream()
                .collect(Collectors.groupingBy(Sale::region, TreeMap::new,
                                               Collectors.summingInt(Sale::amount)));
            return byRegion.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .map(e -> e.getKey() + " total " + e.getValue())
                .toList();
        }
        protected String formatRow(String row) { return "  * " + row; }
    }

    // Spreadsheet for analysts: every raw row kept, as CSV, no footer
    static class CsvReport extends ReportGenerator {
        protected List<String> processData(List<Sale> data) {
            return data.stream().map(s -> s.region() + "," + s.amount()).toList();
        }
        protected String formatRow(String row) { return row; }
        @Override protected boolean includeFooter() { return false; }
    }

    public static void main(String[] args) {
        List<Sale> sales = List.of(new Sale("EU", 120), new Sale("US", 300),
                                   new Sale("EU", 80), new Sale("APAC", 150));
        System.out.print(new PdfReport().generate(sales));
        System.out.print(new CsvReport().generate(sales));
        System.out.print(new PdfReport().generate(List.of()));   // edge case: no data
    }
}
```

**Output:**

```
== PdfReport ==
  * US total 300
  * EU total 200
  * APAC total 150
-- 3 rows --
== CsvReport ==
EU,120
US,300
EU,80
APAC,150
== PdfReport ==
-- 0 rows --
```

### Chain of Responsibility — Pass the Request Along Until Someone Handles It

![Infographic on the Chain of Responsibility pattern: the smell (an if (amount <= 1,000) manager… else if (amount <= 10,000) director… else if (amount <= 100,000) vp… chain copied into every client), the 4-step fix (each Approver holds a link to next; approve(amount) handles it if canApprove(amount), else passes it on; the client knows only the first handler; relink to reorder/add/remove), an expense-claim analogy, a UML diagram where Manager (≤ 1,000), Director (≤ 10,000) and VicePresident (≤ 100,000) extend «abstract» Approver with a next (has-a) self-link, the chain approve($5,000) → Manager → can't → Director approved $5,000 → VP → rejected (end of chain), and a How It Runs table from the Java output (500 Manager, 5,000 Director, 50,000 VP, 500,000 nobody can approve it -> rejected).](diagrams/ood21_info_chain_of_responsibility_ai.png)

<details>
<summary><strong>Read as text</strong> — the smell, the fix and the definition</summary>

**Simple Explanation:**
Think of an expense claim: a manager can approve up to $1,000; bigger claims go to a director
(up to $10,000), then a VP (up to $100,000). You hand the claim to the first person in line and
it moves up until someone can sign it — you never need to know who that will be.

**Problem:** a request could be handled by one of several handlers, and the sender shouldn't
hard-code which one, because the rules for who handles what keep changing.

```
  approve($5,000)
       │
       ▼
  ┌─────────┐  can't   ┌──────────┐  can't   ┌───────────┐  can't
  │ Manager │ ───────► │ Director │ ───────► │    VP     │ ───────► rejected
  │ ≤ 1,000 │          │ ≤ 10,000 │          │ ≤ 100,000 │          (end of chain)
  └─────────┘          └──────────┘          └───────────┘
                            │
                            ▼
              handles it: "Director approved $5,000"
```

**The fix:** each handler holds a link to the `next` one. `approve()` handles the request if it
can, otherwise passes it to `next`. The client only knows the first handler; you reorder, add
or remove handlers by relinking the chain — no client changes.

**Trap:** a request can fall off the end. Always decide what happens there — a default handler,
an error, or a clear rejection (like the 500,000 case below).

**Official Definition:**
> Avoid coupling the sender of a request to its receiver by giving more than one object a
> chance to handle the request; chain the receiving objects and pass the request along the
> chain until an object handles it. (GoF, 1994)

**Real-world:** servlet filters and web middleware (auth → rate limit → validation → handler),
logging handlers, support-ticket tiers. In middleware, *every* handler usually runs and any of
them may stop the chain — a common variant of the same idea.

</details>

**Java — runnable:**

```java
public class ChainOfResponsibilityDemo {
    // HANDLER: either handles the request or passes it to the next handler
    static abstract class Approver {
        private Approver next;
        Approver linkWith(Approver next) { this.next = next; return next; }   // build the chain

        String approve(int amount) {
            if (canApprove(amount)) return name() + " approved $" + String.format("%,d", amount);
            if (next == null) return "nobody can approve it -> rejected";
            return next.approve(amount);                         // pass it along
        }
        abstract boolean canApprove(int amount);
        abstract String name();
    }

    static class Manager extends Approver {
        boolean canApprove(int amount) { return amount <= 1_000; }
        String name() { return "Manager"; }
    }
    static class Director extends Approver {
        boolean canApprove(int amount) { return amount <= 10_000; }
        String name() { return "Director"; }
    }
    static class VicePresident extends Approver {
        boolean canApprove(int amount) { return amount <= 100_000; }
        String name() { return "VP"; }
    }

    public static void main(String[] args) {
        Approver chain = new Manager();
        chain.linkWith(new Director()).linkWith(new VicePresident());   // Manager -> Director -> VP

        int[] expenses = { 500, 5_000, 50_000, 500_000 };
        for (int amount : expenses) {
            System.out.printf("expense %,7d -> %s%n", amount, chain.approve(amount));
        }
    }
}
```

**Output:**

```
expense     500 -> Manager approved $500
expense   5,000 -> Director approved $5,000
expense  50,000 -> VP approved $50,000
expense 500,000 -> nobody can approve it -> rejected
```

### Pattern Selection Guide

```
┌──────────────────────────────────────────────────────────────────┐
│  WHEN TO USE WHICH PATTERN                                       │
├───────────────────────┬──────────────────────────────────────────┤
│ "I need ONE instance" │ Singleton (or better: DI container)      │
│ "Create without       │ Factory Method / Simple Factory          │
│  knowing exact type"  │                                          │
│ "Create a matching    │ Abstract Factory                         │
│  family of objects"   │                                          │
│ "Complex construction"│ Builder                                  │
│ "Wrap incompatible    │ Adapter                                  │
│  interfaces"          │                                          │
│ "Simplify complex     │ Facade                                   │
│  subsystem"           │                                          │
│ "Add behavior         │ Decorator                                │
│  dynamically"         │                                          │
│ "Control access"      │ Proxy                                    │
│ "Tree of parts; treat │ Composite                                │
│  one and many alike"  │                                          │
│ "React to changes"    │ Observer / Event Bus                     │
│ "Swap algorithms"     │ Strategy                                 │
│ "Undo/redo, queue     │ Command                                  │
│  actions"             │                                          │
│ "Different behavior   │ State                                    │
│  per state"           │                                          │
│ "Same steps, varying  │ Template Method                          │
│  details"             │                                          │
│ "Pass it along until  │ Chain of Responsibility                  │
│  someone handles it"  │                                          │
└───────────────────────┴──────────────────────────────────────────┘
```

Two patterns look alike? See **Look-alike patterns compared** in §2.3 (Adapter vs Facade vs
Decorator vs Proxy).

---

# PART 3: JAVA CONCURRENCY ESSENTIALS (Google Interview Must-Know)

---

## 3.1 Why Concurrency Matters at Google

<details>
<summary><strong>Read as text</strong> — why it matters and the modern-Java note</summary>

Google serves billions of requests per day, and every service handles thousands of concurrent
requests at once. Concurrency is non-negotiable in a senior engineering interview: you will be
asked to make code thread-safe and to explain *why* your fix works.

> **Modern Java:** this part teaches the classic tools — locks, atomics, thread pools,
> `CompletableFuture` — which interviews still expect. Since Java 21, **virtual threads** let
> plain blocking code scale for I/O-heavy work, and Java 25 previews structured concurrency;
> see [Ch 38b](#content/38b_java_modern) §38b.6 *Virtual Threads and Modern Concurrency*.

</details>

## 3.2 Thread Safety Fundamentals

![Infographic on thread safety: the smell (count++ is read, add 1, write; Thread 1 read 5, Thread 2 read 5, Thread 1 write 6, Thread 2 write 6 → expected 7, got 6), the fix (synchronized, AtomicInteger.incrementAndGet() compare-and-swap, ConcurrentHashMap.merge(key, 1, Integer::sum), guard reads too), a two-cashiers analogy, a two-lane race timeline ending in 'expected 7, got 6 — LOST UPDATE', three fix boxes with what each is best for (CAS: set to 6 only if still 5, else retry), and a How It Runs table from the Java output with 4 threads × 100,000 increments (expected 400000, synchronized 400000, AtomicInteger 400000, unsafe <= expected true (exact value varies), per-key counts {home=8000, search=4000}).](diagrams/ood21_info_thread_safety_ai.png)

<details>
<summary><strong>Read as text</strong> — the race, the three fixes and the definition</summary>

**Simple Explanation:**
`count++` looks like one step but is three: read `count`, add 1, write it back. If two threads
interleave those steps, one update is lost. That is a *race condition*: the result depends on
which thread happens to run first.

```java
  // PROBLEM: Two threads incrementing the same counter
  public class UnsafeCounter {
      private int count = 0;

      public void increment() {
          count++;   // NOT atomic! Read → Modify → Write = race condition
      }
  }
```

```
  Thread 1: read count = 5
  Thread 2: read count = 5      (before Thread 1 has written)
  Thread 1: write 6
  Thread 2: write 6             expected 7, got 6: one update LOST
```

**Three fixes:**

| Fix | How it works | Best for |
|---|---|---|
| `synchronized` methods | a lock lets one thread at a time run the method, and makes its writes visible to the next thread that takes the lock | guarding several fields that must change together |
| `AtomicInteger.incrementAndGet()` | a CPU *compare-and-swap* (CAS): "set to 6 only if it is still 5", retried until it wins — no lock | a single counter or flag (for very hot counters, `LongAdder` is faster still) |
| `ConcurrentHashMap.merge(key, 1, Integer::sum)` | an atomic read-modify-write for one key | per-key counts (hits per page, words, users) |

**Official Definition:**
> A class is **thread-safe** if it behaves correctly when accessed from multiple threads,
> however the runtime schedules or interleaves them, with no extra synchronization by the
> calling code. (After Brian Goetz et al., *Java Concurrency in Practice*, 2006)

</details>

**Java — runnable** (4 threads × 100,000 increments each; the program waits for every thread and
prints only totals, so the output is the same on every run):

```java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class CounterDemo {
    static class UnsafeCounter {
        private int count = 0;
        void increment() { count++; }                    // read -> add 1 -> write: NOT atomic
        int get() { return count; }
    }

    static class SafeCounter {                           // FIX 1: synchronized
        private int count = 0;
        synchronized void increment() { count++; }      // one thread at a time
        synchronized int get() { return count; }        // reads synchronize too (visibility)
    }

    static class AtomicCounter {                         // FIX 2: AtomicInteger (lock-free CAS)
        private final AtomicInteger count = new AtomicInteger();
        void increment() { count.incrementAndGet(); }
        int get() { return count.get(); }
    }

    // Run `threads` threads, each calling `action` `perThread` times; wait for all to finish
    static void hammer(int threads, int perThread, Runnable action) throws InterruptedException {
        List<Thread> workers = new ArrayList<>();
        for (int t = 0; t < threads; t++) {
            Thread w = new Thread(() -> { for (int i = 0; i < perThread; i++) action.run(); });
            workers.add(w);
            w.start();
        }
        for (Thread w : workers) w.join();               // join = wait, and see their writes
    }

    public static void main(String[] args) throws InterruptedException {
        int threads = 4, perThread = 100_000, expected = threads * perThread;

        UnsafeCounter unsafe = new UnsafeCounter();
        SafeCounter safe = new SafeCounter();
        AtomicCounter atomic = new AtomicCounter();
        hammer(threads, perThread, unsafe::increment);
        hammer(threads, perThread, safe::increment);
        hammer(threads, perThread, atomic::increment);

        System.out.println("expected            -> " + expected);
        System.out.println("synchronized        -> " + safe.get());
        System.out.println("AtomicInteger       -> " + atomic.get());
        // The unsafe total changes from run to run, so print only what is always true:
        System.out.println("unsafe <= expected  -> " + (unsafe.get() <= expected)
                + " (exact value varies)");

        // FIX 3 for per-key counts: ConcurrentHashMap.merge is an atomic read-modify-write per key
        Map<String, Integer> hits = new ConcurrentHashMap<>();
        String[] pages = { "home", "search", "home" };
        hammer(threads, 1_000, () -> { for (String p : pages) hits.merge(p, 1, Integer::sum); });
        System.out.println("per-key counts      -> " + new TreeMap<>(hits));
    }
}
```

**Output:**

```
expected            -> 400000
synchronized        -> 400000
AtomicInteger       -> 400000
unsafe <= expected  -> true (exact value varies)
per-key counts      -> {home=8000, search=4000}
```

## 3.3 Common Concurrency Patterns

<details>
<summary><strong>Read as text</strong> — the four building blocks</summary>

Four building blocks cover most interview questions. Each program below waits for its threads
(`join`, `get`, `await`) and prints only final results, so its output is the same on every run.

</details>

### Producer-Consumer with a BlockingQueue

![Infographic on the Producer-Consumer pattern with a BlockingQueue: the smell (threads hand work over directly, a fast producer races ahead), the 4-step fix (one bounded new LinkedBlockingQueue<>(2); put() blocks while FULL; take() blocks while EMPTY; one poison pill per consumer), a restaurant-pass analogy, a diagram Producer → put() → 2-slot BlockingQueue → take() → Consumer 1/2/3 with poison pills, a backpressure comparison (unbounded fills memory vs bounded makes the producer wait), and a How It Runs table from the Java output (capacity 2, 10 orders produced and processed, each exactly once true, revenue 550, queue empty true).](diagrams/ood21_info_producer_consumer_ai.png)

<details>
<summary><strong>Read as text</strong> — the analogy, the queue and the definition</summary>

**Simple Explanation:**
Think of a restaurant pass: cooks (producers) put plates on a shelf with room for N plates;
waiters (consumers) take them. A full shelf makes the cooks wait, an empty one makes the
waiters wait. Nobody coordinates directly — the shelf does it.

```
  Producer ──put()──► [ queue, capacity 2 ] ──take()──► Consumer 1
                       put() blocks when FULL            Consumer 2
                       take() blocks when EMPTY          Consumer 3
```

```java
  BlockingQueue<Task> queue = new LinkedBlockingQueue<>(100);   // bounded!
  queue.put(task);            // producer: blocks if the queue is full
  Task task = queue.take();   // consumer: blocks if the queue is empty
```

A bounded queue gives *backpressure*: a fast producer is slowed to the consumers' pace instead
of filling memory. To stop the consumers cleanly, the producer sends one *poison pill* (a
special "no more work" task) per consumer.

**Official Definition:**
> In the producer-consumer pattern, producers place work items in a shared buffer and consumers
> remove and process them; a blocking, bounded buffer synchronises the two sides and limits how
> far producers can run ahead.

**Used in:** thread pools (an `ExecutorService` is a task queue plus worker threads), log
shippers, message processing.

</details>

**Java — runnable** (1 producer, 3 consumers, 10 orders worth 10, 20, …, 100):

```java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class ProducerConsumerDemo {
    record Task(int orderId, int amount) {}
    static final Task POISON_PILL = new Task(-1, 0);    // tells a consumer "no more work"

    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Task> queue = new LinkedBlockingQueue<>(2);   // bounded: capacity 2
        int consumers = 3, orders = 10;
        AtomicInteger processed = new AtomicInteger(), revenue = new AtomicInteger();
        Set<Integer> seen = ConcurrentHashMap.newKeySet();

        Thread producer = new Thread(() -> {
            try {
                for (int id = 1; id <= orders; id++) {
                    queue.put(new Task(id, id * 10));    // blocks while the queue is full
                }
                for (int c = 0; c < consumers; c++) queue.put(POISON_PILL);
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        });

        List<Thread> workers = new ArrayList<>();
        for (int c = 0; c < consumers; c++) {
            Thread w = new Thread(() -> {
                try {
                    while (true) {
                        Task task = queue.take();        // blocks while the queue is empty
                        if (task == POISON_PILL) return;
                        seen.add(task.orderId());
                        revenue.addAndGet(task.amount());
                        processed.incrementAndGet();
                    }
                } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            });
            workers.add(w);
            w.start();
        }
        producer.start();
        producer.join();
        for (Thread w : workers) w.join();

        System.out.println("queue capacity            -> 2");
        System.out.println("orders produced           -> " + orders);
        System.out.println("orders processed          -> " + processed.get());
        System.out.println("each order exactly once   -> " + (seen.size() == orders));
        System.out.println("revenue (10+20+...+100)   -> " + revenue.get());
        System.out.println("queue empty at the end    -> " + queue.isEmpty());
    }
}
```

**Output:**

```
queue capacity            -> 2
orders produced           -> 10
orders processed          -> 10
each order exactly once   -> true
revenue (10+20+...+100)   -> 550
queue empty at the end    -> true
```

### Thread Pools — ExecutorService and Future

![Infographic on thread pools, Futures and CompletableFuture: the smell (a new Thread per request, future.get() with no timeout), the 4-step fix (newFixedThreadPool(4); submit() returns a Future receipt; future.get(5, TimeUnit.SECONDS); chain with CompletableFuture and always shutdown()), a dry-cleaner ticket analogy, a diagram of a 6-task queue feeding a pool of 4 threads that hands Futures 1–6 to the caller plus a stuck task (100 ms → TimeoutException → cancel(true)), a CompletableFuture chain supplyAsync(getUser, pool) CF<User> → thenCompose(getOrders) CF<List<Order>> → thenApply(enrich) CF<Response> → exceptionally(fallback) CF<Response> with an error path for user 99, and a How It Runs table from both Java outputs (orders 1–6 → 1, 4, 9, 16, 25, 36; stuck task TimeoutException after 100 ms, cancelled = true; pool terminated true; user 1 [book, pen] more like book; user 2 [] bestsellers; user 99 fallback (no user with id 99)).](diagrams/ood21_info_executors_futures_ai.png)

<details>
<summary><strong>Read as text</strong> — the analogy, the API and the definition</summary>

**Simple Explanation:**
Creating a new thread for every task is expensive and has no upper limit. A *thread pool* keeps
a fixed number of worker threads and a queue of tasks. `submit()` returns at once with a
`Future` — a receipt you later exchange for the result with `get()`.

```java
  ExecutorService pool = Executors.newFixedThreadPool(10);
  Future<Result> future = pool.submit(() -> processOrder(order));   // returns immediately
  Result result = future.get(5, TimeUnit.SECONDS);                  // blocks, at most 5 s
```

**Google best practice:** size pools explicitly and always bound a wait with a timeout. Avoid
`Executors.newCachedThreadPool()` for platform threads — under load it creates threads without
limit. Always `shutdown()` a pool you own.

> **Java 21+:** for I/O-bound work (waiting on RPCs or databases),
> `Executors.newVirtualThreadPerTaskExecutor()` gives every task its own cheap *virtual* thread,
> so you no longer size pools around blocking I/O. Fixed pools still matter for CPU-bound work.
> See [Ch 38b](#content/38b_java_modern) §38b.6.

**Official Definition:**
> An `ExecutorService` decouples task submission from execution: it manages worker threads,
> queues submitted tasks, and returns a `Future` for each task — a handle to its pending result
> that can be waited on, timed out, or cancelled.

</details>

**Java — runnable** (6 tasks on 4 threads, then a task that never finishes):

```java
import java.util.*;
import java.util.concurrent.*;

public class ThreadPoolDemo {
    static int processOrder(int orderId) { return orderId * orderId; }   // stand-in for real work

    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(4);           // explicit, bounded size
        try {
            List<Future<Integer>> futures = new ArrayList<>();
            for (int id = 1; id <= 6; id++) {
                final int orderId = id;
                futures.add(pool.submit(() -> processOrder(orderId)));    // returns at once
            }
            for (int i = 0; i < futures.size(); i++) {
                // get() blocks until that task is done; results come back in submission order
                int result = futures.get(i).get(5, TimeUnit.SECONDS);
                System.out.println("order " + (i + 1) + " -> " + result);
            }

            CountDownLatch neverOpened = new CountDownLatch(1);
            Future<String> stuck = pool.submit(() -> { neverOpened.await(); return "done"; });
            try {
                stuck.get(100, TimeUnit.MILLISECONDS);                     // always bound the wait
            } catch (TimeoutException e) {
                System.out.println("stuck task -> TimeoutException after 100 ms, cancelled = "
                        + stuck.cancel(true));
            }
        } finally {
            pool.shutdown();                                               // stop accepting work
            System.out.println("pool terminated -> " + pool.awaitTermination(1, TimeUnit.SECONDS));
        }
    }
}
```

**Output:**

```
order 1 -> 1
order 2 -> 4
order 3 -> 9
order 4 -> 16
order 5 -> 25
order 6 -> 36
stuck task -> TimeoutException after 100 ms, cancelled = true
pool terminated -> true
```

### CompletableFuture — Compose Async Calls Without Blocking

<details>
<summary><strong>Read as text</strong> — the chain, the types and the definition</summary>

**Simple Explanation:**
A plain `Future` makes you wait with `get()`. A `CompletableFuture` lets you say what to do
*next* when the result arrives — "then fetch the orders, then build the response, and if
anything fails use a fallback" — without blocking a thread while you wait.

Each step can change the type; the variable's type is the type of the **last** step:

| Step | The function returns… | Type after this step |
|---|---|---|
| `supplyAsync(() -> userService.getUser(id), pool)` | a value (runs on `pool`) | `CompletableFuture<User>` |
| `.thenCompose(user -> orderService.getOrders(user.id()))` | **another future**, which `thenCompose` flattens | `CompletableFuture<List<Order>>` |
| `.thenApply(orders -> enrichWithRecommendations(orders))` | a plain value | `CompletableFuture<Response>` |
| `.exceptionally(ex -> fallbackResponse(ex))` | a fallback of the same type | `CompletableFuture<Response>` |

- **`thenApply` vs `thenCompose`** — like `map` vs `flatMap`. If the function itself returns a
  future, `thenApply` would give a `CompletableFuture<CompletableFuture<…>>`; `thenCompose`
  flattens it into one future.
- **Errors** — if a step throws, the later `thenCompose`/`thenApply` steps are skipped and
  `exceptionally` receives the error wrapped in a `CompletionException` (unwrap it with
  `getCause()`).
- **Trap** — declaring this chain as `CompletableFuture<User>` does not compile: it ends in a
  `Response`. Also pass your own executor to `supplyAsync`; otherwise tasks share
  `ForkJoinPool.commonPool()`, which blocking calls can starve.

**Official Definition:**
> A `CompletableFuture` is a `Future` that may be completed explicitly and that implements
> `CompletionStage` — a stage of a possibly asynchronous computation that triggers dependent
> stages when it completes.

Chaining like this lets a service call other services without parking a thread per request.
Inside Google, Java code mostly does this with Guava's `ListenableFuture` and
`Futures.transform` / `transformAsync` / `catching` (gRPC's generated future stubs return a
`ListenableFuture`); `CompletableFuture` is the standard-JDK equivalent of the same idea, and the
two map almost one-to-one (`thenApply` ≈ `transform`, `thenCompose` ≈ `transformAsync`,
`exceptionally` ≈ `catching`). With virtual threads (Java 21+), plain blocking code is often a
simpler alternative — see [Ch 38b](#content/38b_java_modern) §38b.6.

</details>

**Java — runnable** (stub services; user 99 does not exist):

```java
import java.util.*;
import java.util.concurrent.*;

public class CompletableFutureDemo {
    record User(int id, String name) {}
    record Order(int id, String item) {}
    record Response(List<String> items, String recommendation) {}

    // Stub services (imagine RPCs)
    static class UserService {                            // blocking call
        User getUser(int id) {
            if (id == 99) throw new NoSuchElementException("no user with id 99");
            return new User(id, id == 1 ? "Ann" : "Bob");
        }
    }

    static class OrderService {                           // already async: returns a future
        private final Executor executor;
        OrderService(Executor executor) { this.executor = executor; }
        CompletableFuture<List<Order>> getOrders(int userId) {
            return CompletableFuture.supplyAsync(() -> userId == 1
                    ? List.of(new Order(7, "book"), new Order(8, "pen"))
                    : List.of(), executor);
        }
    }

    static Response enrichWithRecommendations(List<Order> orders) {
        List<String> items = orders.stream().map(Order::item).toList();
        return new Response(items, items.isEmpty() ? "bestsellers" : "more like " + items.get(0));
    }

    static Response fallbackResponse(Throwable ex) {
        Throwable cause = (ex instanceof CompletionException && ex.getCause() != null)
                ? ex.getCause() : ex;                    // unwrap the async wrapper
        return new Response(List.of(), "fallback (" + cause.getMessage() + ")");
    }

    public static void main(String[] args) {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        UserService userService = new UserService();
        OrderService orderService = new OrderService(pool);

        for (int userId : new int[] { 1, 2, 99 }) {
            CompletableFuture<Response> response = CompletableFuture
                .supplyAsync(() -> userService.getUser(userId), pool)   // CF<User>
                .thenCompose(user -> orderService.getOrders(user.id())) // CF<List<Order>>, flat
                .thenApply(orders -> enrichWithRecommendations(orders)) // CF<Response>
                .exceptionally(ex -> fallbackResponse(ex));             // a failure anywhere above
            System.out.printf("user %-2d -> %s%n", userId, response.join());   // join only in main
        }
        pool.shutdown();
    }
}
```

**Output:**

```
user 1  -> Response[items=[book, pen], recommendation=more like book]
user 2  -> Response[items=[], recommendation=bestsellers]
user 99 -> Response[items=[], recommendation=fallback (no user with id 99)]
```

### Read-Write Lock — Many Readers or One Writer

![Infographic on the read-write lock: the smell (a plain lock makes readers of a read-mostly cache wait for each other), the 4-step fix (get() takes lock.readLock(), put() takes lock.writeLock(), tryPut() uses writeLock().tryLock(), unlock in finally), a museum analogy, two museum panels (2 readers inside looking at 'lang = java' while the painter is blocked: tryPut → false; then the painter inside and 'lang = kotlin': tryPut → true), a who-may-enter table (nobody: reader enters, writer enters; 2 readers: reader enters, writer WAITS; 1 writer: both WAIT), and a How It Runs table from the Java output (put done, readers inside 2, tryPut now false, readers saw [java, java], tryPut after true, get(lang) kotlin).](diagrams/ood21_info_read_write_lock_ai.png)

<details>
<summary><strong>Read as text</strong> — the rules, the traps and the definition</summary>

**Simple Explanation:**
Think of a museum: any number of visitors can look at a painting together, but to repaint it you
must clear the room. A read-write lock allows **many readers at the same time, or one writer
alone**. For read-heavy data (caches, configuration) this gives far more parallelism than a
plain lock that admits one thread at a time.

```
  Currently held by        a new reader      a new writer
  ─────────────────        ────────────      ────────────
  nobody                   enters            enters
  2 readers                enters            WAITS
  1 writer                 WAITS             WAITS
```

**Traps:** unlock in a `finally` block; a thread holding the read lock cannot upgrade to the
write lock (it would wait for itself forever) — release the read lock first; and in the default
non-fair mode a writer can be kept waiting while new readers keep arriving (the fair mode,
`new ReentrantReadWriteLock(true)`, serves threads roughly in arrival order). For a simple shared
map, `ConcurrentHashMap` usually beats any lock.

**Official Definition:**
> A `ReadWriteLock` maintains a pair of associated locks: the read lock may be held
> simultaneously by multiple reader threads as long as there is no writer; the write lock is
> exclusive.

</details>

**Java — runnable** (two readers hold the read lock at once; a writer's `tryLock` fails until
they leave):

```java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ReadWriteLockDemo {
    static class Cache {
        private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
        private final Map<String, String> map = new HashMap<>();   // plain HashMap, guarded by lock

        String get(String key) {
            lock.readLock().lock();                      // many readers may hold this together
            try { return map.get(key); }
            finally { lock.readLock().unlock(); }
        }

        void put(String key, String value) {
            lock.writeLock().lock();                     // only ONE writer, and no readers
            try { map.put(key, value); }
            finally { lock.writeLock().unlock(); }
        }

        boolean tryPut(String key, String value) {       // give up instead of waiting
            if (!lock.writeLock().tryLock()) return false;
            try { map.put(key, value); return true; }
            finally { lock.writeLock().unlock(); }
        }

        // Demo helper: a get() that pauses while holding the read lock, so main can look inside
        String getSlowly(String key, CountDownLatch inside, CountDownLatch release)
                throws InterruptedException {
            lock.readLock().lock();
            try { inside.countDown(); release.await(); return map.get(key); }
            finally { lock.readLock().unlock(); }
        }
        int readersInside() { return lock.getReadLockCount(); }
    }

    public static void main(String[] args) throws Exception {
        Cache cache = new Cache();
        cache.put("lang", "java");
        System.out.println("put(lang, java)              -> done");

        CountDownLatch inside = new CountDownLatch(2), release = new CountDownLatch(1);
        List<String> seen = Collections.synchronizedList(new ArrayList<>());
        List<Thread> readers = new ArrayList<>();
        for (int i = 0; i < 2; i++) {
            Thread r = new Thread(() -> {
                try { seen.add(cache.getSlowly("lang", inside, release)); }
                catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            });
            readers.add(r);
            r.start();
        }
        inside.await();                                  // both readers now hold the read lock
        System.out.println("readers inside at once       -> " + cache.readersInside());
        System.out.println("tryPut(lang, kotlin) now     -> " + cache.tryPut("lang", "kotlin"));
        release.countDown();
        for (Thread r : readers) r.join();
        System.out.println("what the readers saw         -> " + seen);
        System.out.println("tryPut(lang, kotlin) after   -> " + cache.tryPut("lang", "kotlin"));
        System.out.println("get(lang)                    -> " + cache.get("lang"));
    }
}
```

**Output:**

```
put(lang, java)              -> done
readers inside at once       -> 2
tryPut(lang, kotlin) now     -> false
what the readers saw         -> [java, java]
tryPut(lang, kotlin) after   -> true
get(lang)                    -> kotlin
```

## 3.4 Concurrency Pitfalls to Know

![Infographic on concurrency pitfalls and deadlock-free lock ordering: the smell (transfer(from, to) locks from then to; Thread 1 transfer(a, b) holds a, waits for b; Thread 2 transfer(b, a) holds b, waits for a; both wait forever), the 4-step fix (one global order, smaller account id first; backstops tryLock(timeout) and never calling unknown code under a lock), a chopsticks analogy, a red deadlock cycle (Lock A held by Thread 1, which waits for Lock B, held by Thread 2, which waits for Lock A) with Coffman's 4 conditions (1971), the fixed version where both threads lock id 1 then id 2 (no cycle; A 1000, B 1000 — money conserved), five pitfall cards (race condition, deadlock, starvation, livelock, false sharing), and a How It Runs table from the Java output (100000 transfers per thread, both threads done true, balance A, B 1000, 1000, money conserved true).](diagrams/ood21_info_deadlock_pitfalls_ai.png)

<details>
<summary><strong>Read as text</strong> — the pitfalls, the deadlock fix and the definition</summary>

```
  ┌────────────────────┬───────────────────────────────────────────────────┐
  │ Pitfall            │ What It Is                                        │
  ├────────────────────┼───────────────────────────────────────────────────┤
  │ Race Condition     │ Two threads touch shared state without sync.      │
  │                    │ The result depends on who runs first, so it       │
  │                    │ changes from run to run.                          │
  ├────────────────────┼───────────────────────────────────────────────────┤
  │ Deadlock           │ Thread A holds Lock 1, waits for Lock 2.          │
  │                    │ Thread B holds Lock 2, waits for Lock 1.          │
  │                    │ Both wait forever. Fix: always lock in one order. │
  ├────────────────────┼───────────────────────────────────────────────────┤
  │ Starvation         │ A thread never gets the lock or CPU it needs      │
  │                    │ because others keep winning (an unfair lock, or   │
  │                    │ a writer behind an endless stream of readers).    │
  ├────────────────────┼───────────────────────────────────────────────────┤
  │ Livelock           │ Threads keep responding to each other but         │
  │                    │ make no progress (like two people in a hallway    │
  │                    │ both stepping aside to the same side).            │
  ├────────────────────┼───────────────────────────────────────────────────┤
  │ False Sharing      │ Two threads modify different variables that       │
  │                    │ happen to sit on the same CPU cache line.         │
  │                    │ Performance tanks due to cache invalidation.      │
  └────────────────────┴───────────────────────────────────────────────────┘
```

**Deadlock in code — the classic bank transfer:**

```java
  // BAD: the lock order depends on the call, so transfer(a, b) and
  // transfer(b, a) running at the same time can deadlock
  void transfer(Account from, Account to, int amount) {
      synchronized (from) {
          synchronized (to) { ... }
      }
  }
  // Thread 1: transfer(a, b) holds a, waits for b
  // Thread 2: transfer(b, a) holds b, waits for a   → both wait forever
```

**The fix — one global lock order:** always lock the account with the smaller id first,
whatever the direction of the transfer. A cycle of waiting can then never form. Backstops:
`tryLock(timeout)` and retry, and never call unknown code while holding a lock.

**Official Definition:**
> A **deadlock** is a state in which each thread in a group waits for a resource held by another
> thread in the group, so none can proceed. It needs four conditions at once (Coffman, 1971):
> mutual exclusion, hold-and-wait, no preemption and circular wait. A global lock order removes
> circular wait.

</details>

**Java — runnable** (two threads transfer money in opposite directions, 100,000 times each):

```java
import java.util.*;

public class LockOrderingDemo {
    static class Account {
        final int id;
        int balance;
        Account(int id, int balance) { this.id = id; this.balance = balance; }
    }

    // Always lock the account with the SMALLER id first, whatever the transfer direction
    static void transfer(Account from, Account to, int amount) {
        Account first = from.id < to.id ? from : to;
        Account second = (first == from) ? to : from;
        synchronized (first) {
            synchronized (second) {
                from.balance -= amount;
                to.balance += amount;
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Account a = new Account(1, 1_000), b = new Account(2, 1_000);
        int rounds = 100_000;
        Thread t1 = new Thread(() -> { for (int i = 0; i < rounds; i++) transfer(a, b, 1); });
        Thread t2 = new Thread(() -> { for (int i = 0; i < rounds; i++) transfer(b, a, 1); });
        t1.start();
        t2.start();
        t1.join(10_000);                                 // a deadlock would hit this timeout
        t2.join(10_000);

        boolean finished = !t1.isAlive() && !t2.isAlive();
        System.out.println("transfers per thread -> " + rounds);
        System.out.println("both threads done    -> " + finished);
        synchronized (a) {
            synchronized (b) {
                System.out.println("balance A, B         -> " + a.balance + ", " + b.balance);
                System.out.println("money conserved      -> " + (a.balance + b.balance == 2_000));
            }
        }
    }
}
```

**Output:**

```
transfers per thread -> 100000
both threads done    -> true
balance A, B         -> 1000, 1000
money conserved      -> true
```

**Google interview tip:** if asked to design a concurrent system, always discuss thread safety,
deadlock prevention, and how you would test for race conditions (stress tests with many
threads, and tools such as ThreadSanitizer for C++/Go or jcstress for Java).

---

## Where to Go Next — System Design, Data, Infra & Security

This chapter is deliberately scoped to **object-oriented design**: principles, design patterns, and the Java concurrency you're expected to reason about in an interview. The broader "design fundamentals" topics now live in dedicated, deeper chapters — treat those as the single source of truth so the same concept isn't maintained in two places.

| If you're looking for… | Go to |
|---|---|
| Engineering & data tools — Docker, Kubernetes, Kafka, Redis, Spark, Airflow, observability stacks | **Ch 22 — Engineering Tools** |
| Scalability, latency & percentiles, CAP/PACELC, protocols (HTTP/2-3, TCP, gRPC/REST/GraphQL/WebSockets), idempotency, the system-design interview framework | **Ch 23 — System Design Pt 1: Foundations & Protocols** |
| SQL vs NoSQL, ACID/BASE, indexing, normalization, sharding/partitioning, replication, CQRS, event sourcing, sagas, the N+1 problem, consistent hashing | **Ch 24 — System Design Pt 2: Data & Distributed Systems** |
| Reliability (circuit breakers, retries, hedging, failover), security (AuthN/Z, OAuth, JWT, OWASP), observability (logs/metrics/traces, OpenTelemetry, SLOs) | **Ch 25 — System Design Pt 3: Operations & Case Studies** |
| ML-specific system design (training/serving, feature stores, drift) | **Ch 26 — ML System Design** |
| Virtual threads, structured concurrency, records, sealed types — modern Java | [Ch 38b](#content/38b_java_modern) — **Modern Java** (§38b.6 for concurrency) |

The principles and patterns above are the foundation those chapters build on: coupling/cohesion, dependency inversion, and the Strategy / Adapter / Observer patterns show up constantly once you start drawing boxes and arrows for a system.

---

# PART 4: REVIEW QUESTIONS — TEST YOUR UNDERSTANDING

---

## Design Principles

1. Explain the Single Responsibility Principle. Give an example of a class that violates it and show how to fix it.
2. What's the difference between the Open/Closed Principle and the Strategy Pattern? How do they relate?
3. Your colleague argues "Composition over Inheritance" but another says inheritance is fine for an `Animal -> Dog -> GoldenRetriever` hierarchy. Who's right? When?
4. What is Dependency Inversion? Why does it make testing easier?

## Design Patterns

5. When would you use a Factory Pattern instead of just calling `new`?
6. Explain the Observer Pattern. How is it different from a message queue?
7. You need to add logging, caching, and rate-limiting to an API client without modifying its code. Which pattern(s) would you use?
8. What's the difference between Adapter and Facade? Give one example of each.

## Java Concurrency

9. Why is `count++` not thread-safe? Show two different ways to make it safe.
10. What is a deadlock, and what's the simplest discipline that prevents it?

> Looking for system-design, database, distributed-systems, or architecture review questions? Those topics moved to **Chapters 22–26** — each has its own review section.

<details>
<summary>Answers</summary>

**Q1:** A class should have one reason to change — one actor whose needs drive its edits. Violation: a `UserManager` that authenticates, saves to the database, sends welcome emails and builds reports; four different teams can force edits to one class, and a change for one risks breaking the others. Fix: split it into `Authenticator`, `UserRepository`, `EmailService` and `ReportGenerator`, each with one reason to change (see §1.2, SRP).

**Q2:** OCP is a *goal* — add behaviour by adding code, not by editing tested code. Strategy is one concrete *way* to reach it: the `ShoppingCart` depends on the `PricingStrategy` interface, so a new pricing rule is a new class and the cart is never edited. Decorator, Template Method and a plug-in registry (like the Simple Factory map) are other routes to the same goal.

**Q3:** Both, in context. Inheritance is fine when the "is-a" is real and stable and every subclass can keep the parent's promises (LSP) — a `GoldenRetriever` really is a `Dog`. Prefer composition when behaviours vary along independent axes (flying, swimming, walking), when behaviour must change at runtime, or when a subclass would have to disable an inherited method (a `Penguin` that can't `fly()`). Rule of thumb: inherit for the *type*, compose for the *behaviour*, and keep hierarchies shallow.

**Q4:** Dependency Inversion means high-level modules depend on abstractions (interfaces), not concrete implementations. This makes testing easier because you can inject mock implementations. Instead of `OrderService` depending on `MySQLDatabase`, it depends on a `Database` interface. In tests, you inject `MockDatabase` — no real DB needed.

**Q5:** When the concrete type is decided at runtime (config, user input, a message); when creating the object needs logic (validation, caching, pooling, a different implementation per environment); when callers should depend on an interface rather than a concrete class (DIP), so tests can swap in fakes; or when several objects must come from one matching family (Abstract Factory). For a simple value object with one obvious implementation, just call `new`.

**Q6:** Observer: a subject calls its registered observers when its state changes — one-to-many, in-process, usually synchronous (the publisher waits for every listener), nothing persisted. A message queue or broker connects separate processes: asynchronous, durable (a consumer can be down and catch up later), with delivery guarantees, retries, backpressure and consumer groups for scaling. A pub/sub broker is the Observer idea at system scale.

**Q7:** Decorator Pattern — wrap the API client in layers: `LoggingDecorator(CachingDecorator(RateLimitDecorator(realClient)))`. Each decorator adds behavior without modifying the original. Caching and rate-limiting may *skip or refuse* the real call, which is Proxy-like intent; the wrapper code is the same, so either name is fine as long as you explain the intent.

**Q8:** Adapter changes ONE object's interface into the one your code expects — `StripeAdapter` turns `charge(dollars, currency)` into Stripe's `createCharge(cents, CODE)`. Facade puts a NEW, simpler interface over MANY objects — `HomeTheaterFacade.watchMovie()` drives the DVD player, amplifier, projector and lights. Adapter: "same job, wrong shape". Facade: "too many parts, one button".

**Q9:** `count++` is read-modify-write — three steps that aren't atomic, so two threads can both read the same value and one increment is lost. Fix with `synchronized` (mutual exclusion) or, better for a counter, `AtomicInteger.incrementAndGet()` (lock-free compare-and-swap). For per-key counts: `ConcurrentHashMap.merge(key, 1, Integer::sum)`.

**Q10:** A deadlock is two threads each holding one lock and waiting for the other's — both wait forever. The simplest prevention is **global lock ordering**: every code path acquires locks in the same total order. Backstops: lock timeouts (`tryLock`) and avoiding nested locks entirely.

</details>

---

## Key Takeaways

```
OO DESIGN, SOLID & PATTERNS — CHEAT SHEET
═════════════════════════════════════════

FOUNDATIONS
  4 OOP pillars   encapsulation · abstraction · inheritance · polymorphism
  UML arrows      ───▷ extends   - - -▷ implements   ◇ aggregation   ◆ composition   - - -> uses

PRINCIPLES
  SOLID = SRP + OCP + LSP + ISP + DIP
    SRP  one reason to change          OCP  extend, don't modify
    LSP  subtypes substitutable        ISP  many small interfaces
    DIP  depend on abstractions, not implementations
  DRY  one source of truth   ·   KISS  simplest that works   ·   YAGNI  build it when needed
  Composition over inheritance   ·   High cohesion + low coupling = the goal
  Law of Demeter  talk only to your direct friends

PATTERNS
  Singleton         one instance (prefer enum / holder / DI); double-checked locking needs volatile
  Factory           create without naming the concrete type
  Abstract Factory  create a matching FAMILY of objects
  Builder           construct complex objects step by step
  Adapter           bridge incompatible interfaces (changes the interface)
  Facade            simple front to a complex subsystem (new, smaller interface)
  Decorator         add behavior, same interface, stackable
  Proxy             control access, same interface, may not forward the call
  Composite         treat one and many alike (trees)
  Observer          notify many when one changes
  Strategy          swap algorithms at runtime
  Command           encapsulate an action (undo/redo, queue)
  State             behavior per state — no if/else explosion
  Template Method   fixed skeleton, subclasses fill in the steps
  Chain of Resp.    pass the request along until someone handles it

JAVA CONCURRENCY
  count++ is not atomic → synchronized / AtomicInteger / ConcurrentHashMap.merge
  BlockingQueue = producer-consumer with backpressure
  Deadlock → always acquire locks in one global order
  Bounded pools for CPU work; virtual threads for blocking I/O (Ch 38b §38b.6)
  CompletableFuture: thenApply = map, thenCompose = flatMap, exceptionally = fallback
    (Google Java code: Guava ListenableFuture + Futures.transform / transformAsync / catching)
  ReadWriteLock: many readers OR one writer

System design · data · distributed systems · security · observability
  → see Chapters 22–26.
```

---

**Back to Start:** [README — Table of Contents](../README.md)