# Chapter 21 — Object-Oriented Design, SOLID & Design Patterns (Java)

> "Any fool can write code that a computer can understand. Good programmers write code
> that humans can understand." — Martin Fowler

**What this chapter covers:**
The object-oriented design foundation a senior engineer is expected to reason about fluently: the **SOLID** principles, the supporting design principles (DRY, KISS, YAGNI, composition over inheritance, coupling & cohesion), the most important **design patterns**, and essential **Java concurrency**. All code examples use **Java** (Google's primary backend language). Written to be understood by anyone, but deep enough for interviews at Google, Amazon, Meta, and top-tier companies.

**Why Java?** Google's backend is predominantly Java (and C++/Go). Demonstrating clean Java in design interviews signals fluency with Google's ecosystem.

> **Scope note:** This chapter used to also cover system design, databases, distributed systems, infrastructure tooling, and security. Those now live in dedicated, deeper chapters (**22–26**) — see **Where to Go Next** near the end. Keeping each topic in one place stops the same concept from drifting out of sync across chapters.

---

## What You'll Learn

After reading this chapter, you will be able to:
- Apply the SOLID principles and know when each one matters most
- Spot violations of SRP, OCP, LSP, ISP, and DIP in real code — and fix them
- Recognize and implement the most important creational, structural, and behavioral design patterns
- Reach for the right principle (DRY, KISS, YAGNI, composition over inheritance, Law of Demeter) instead of over-engineering
- Reason about thread safety, locks, atomics, executors, and the classic concurrency pitfalls in Java

---

## Table of Contents

| Part | Topic | Key Concepts |
|------|-------|--------------|
| 1 | Software Design Principles | SOLID, DRY, KISS, YAGNI, Composition over Inheritance, Coupling & Cohesion, Separation of Concerns, Law of Demeter |
| 2 | Design Patterns | Creational, Structural, Behavioral (incl. Strategy, Observer, Decorator, State, Template Method) |
| 3 | Java Concurrency (Google Must-Know) | Thread safety, `synchronized`, `AtomicInteger`, `ConcurrentHashMap`, `ExecutorService`, `CompletableFuture`, deadlocks |
| 4 | Review Questions | Self-test with detailed answers |

> System design, databases, distributed systems, infrastructure tooling, and security are covered in **Chapters 22–26** — see the cross-reference table at the end of this chapter.

---

# PART 1: SOFTWARE DESIGN PRINCIPLES

---

## 1.1 Why Design Principles Matter

### Simple Explanation
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

### The Cost of Bad Design

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

---

## 1.2 SOLID Principles

SOLID is a set of five principles that make software designs more understandable,
flexible, and maintainable. Created by Robert C. Martin ("Uncle Bob").

```
  S — Single Responsibility Principle
  O — Open/Closed Principle
  L — Liskov Substitution Principle
  I — Interface Segregation Principle
  D — Dependency Inversion Principle
```

---

### S — Single Responsibility Principle (SRP)

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

---

### O — Open/Closed Principle (OCP)

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
> existing, already-tested code.

---

### L — Liskov Substitution Principle (LSP)

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
  2. Does the subclass strengthen preconditions? (bad!)
  3. Does the subclass weaken postconditions? (bad!)
  4. Would existing tests pass if you swap parent for child?
```

**Official Definition:**
> Objects of a superclass should be replaceable with objects of its subclasses
> without affecting the correctness of the program.

---

### I — Interface Segregation Principle (ISP)

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

---

### D — Dependency Inversion Principle (DIP)

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

  // GOOD: Both depend on abstractions (Dependency Injection)
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
  OrderService service = new OrderService(new PostgresDatabase(), new SendGridMailer());  // ← no code change!
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

---

## 1.3 Other Key Design Principles

### DRY — Don't Repeat Yourself

```java
  // "Every piece of knowledge must have a single, unambiguous,
  //  authoritative representation within a system."

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
      double tax = salary * TAX_RATE;
      return String.format("Tax: %.2f", tax);
  }

  // CAUTION: DRY is about KNOWLEDGE, not just code.
  // Two methods that look similar but represent different
  // business rules should NOT be merged. They'll diverge later.
```

### KISS — Keep It Simple, Stupid

```java
  // The simplest solution that works IS the best solution.

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

  // Both correct. One is maintainable. One is a riddle.
```

### YAGNI — You Aren't Gonna Need It

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

### Composition Over Inheritance

```java
  // Prefer HAS-A over IS-A relationships.

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
  public interface Flyable   { void fly(); }
  public interface Swimmable { void swim(); }

  public class Eagle implements Flyable {
      public void fly() { System.out.println("Soaring high!"); }
  }

  public class Penguin implements Swimmable {
      public void swim() { System.out.println("Swimming fast!"); }
  }

  public class FlyingFish implements Flyable, Swimmable {  // ← mix and match!
      public void fly()  { System.out.println("Gliding!"); }
      public void swim() { System.out.println("Swimming!"); }
  }
```

### Separation of Concerns (SoC)

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

### Law of Demeter (Principle of Least Knowledge)

```java
  // "Don't talk to strangers." A method should only call methods on:
  // 1. Its own object (this)
  // 2. Objects passed as parameters
  // 3. Objects it creates
  // 4. Its direct fields

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

### Coupling and Cohesion — The Two Most Important Quality Metrics

These are the most fundamental measures of design quality. Every other principle (SOLID, DRY, SoC) exists to improve coupling and cohesion.

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
  // Everything is about auth.
  // One clear purpose.              // Random grab-bag of unrelated functions.

  Ask yourself: "If I describe what this module does,
  do I need the word AND?"
  
  "Handles authentication" → high cohesion ✓
  "Handles auth AND email AND tax AND images" → low cohesion ✗
```

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
  │   HIGH COHESION   +   LOW COUPLING   =   GREAT DESIGN       │
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

### Principle Summary

```
┌───────────────────┬──────────────────────────────────────────────────┐
│ Principle         │ One-Line Summary                                  │
├───────────────────┼──────────────────────────────────────────────────┤
│ SRP               │ One class, one reason to change                  │
│ OCP               │ Extend behavior without modifying existing code  │
│ LSP               │ Subtypes must be substitutable for base types    │
│ ISP               │ Many specific interfaces > one general interface │
│ DIP               │ Depend on abstractions, not implementations      │
│ DRY               │ Single source of truth for every piece of logic  │
│ KISS              │ Simplest solution that works wins                 │
│ YAGNI             │ Don't build it until you need it                 │
│ Composition > Inh │ Prefer HAS-A over IS-A relationships             │
│ SoC               │ Each module handles one concern                   │
│ Law of Demeter    │ Don't reach through objects to their internals   │
└───────────────────┴──────────────────────────────────────────────────┘
```

---

# PART 2: DESIGN PATTERNS

---

## 2.1 What Are Design Patterns?

### Simple Explanation
Design patterns are **proven solutions to common problems** in software design.
They're like recipes — you don't reinvent pasta from scratch every time you cook.
Someone already figured out the best way to do it.

```
  ┌──────────────────────────────────────────────────────────────┐
  │                    DESIGN PATTERN CATEGORIES                  │
  ├─────────────────┬────────────────────┬───────────────────────┤
  │   CREATIONAL    │    STRUCTURAL      │     BEHAVIORAL        │
  │ (how to create  │ (how to compose    │ (how objects          │
  │  objects)       │  classes/objects)   │  communicate)         │
  ├─────────────────┼────────────────────┼───────────────────────┤
  │ Singleton       │ Adapter            │ Observer              │
  │ Factory Method  │ Facade             │ Strategy              │
  │ Abstract Factory│ Decorator          │ Command               │
  │ Builder         │ Proxy              │ State                 │
  │ Prototype       │ Composite          │ Chain of Resp.        │
  │                 │ Bridge             │ Template Method       │
  │                 │                    │ Iterator              │
  └─────────────────┴────────────────────┴───────────────────────┘
```

---

## 2.2 Creational Patterns

### Singleton — One Instance Only

```
  PROBLEM: You need exactly ONE instance of a class.
  Examples: database connection pool, logger, configuration manager.

  ┌─────────────────────────────────────────────────┐
  │  Application                                     │
  │                                                  │
  │  Module A ──┐                                    │
  │             │                                    │
  │  Module B ──┼──► DatabasePool.getInstance()      │
  │             │         │                          │
  │  Module C ──┘         ▼                          │
  │                  ┌──────────┐                    │
  │                  │ SINGLE   │                    │
  │                  │ INSTANCE │  (shared by all)   │
  │                  └──────────┘                    │
  └─────────────────────────────────────────────────┘

  // Thread-safe Singleton (important for Google-scale concurrency!)
  public class DatabasePool {
      private static volatile DatabasePool instance;

      private DatabasePool() { }    // private constructor

      public static DatabasePool getInstance() {
          if (instance == null) {                      // first check (no lock)
              synchronized (DatabasePool.class) {
                  if (instance == null) {              // second check (with lock)
                      instance = new DatabasePool();
                  }
              }
          }
          return instance;
      }
  }

  // OR: Use an enum (Josh Bloch's recommended approach — simplest, thread-safe):
  public enum DatabasePool {
      INSTANCE;
      public Connection getConnection() { ... }
  }

  CAUTION: Singletons are often overused. They're essentially
  global state — harder to test, harder to parallelize.
  At Google, prefer dependency injection (Guice/Dagger) over singletons.
```

### Factory — Encapsulate Object Creation

```
  PROBLEM: You need to create objects but don't know the exact
  type until runtime.

  EXAMPLE: A notification system that sends via different channels.

  // Without Factory (brittle):
  Notifier notifier;
  if (channel.equals("email"))     notifier = new EmailNotifier();
  else if (channel.equals("sms")) notifier = new SMSNotifier();
  else if (channel.equals("push"))notifier = new PushNotifier();  // ← must modify every time!

  // With Factory (extensible):
  public class NotificationFactory {
      private static final Map<String, Supplier<Notifier>> FACTORIES = Map.of(
          "email", EmailNotifier::new,
          "sms",   SMSNotifier::new,
          "push",  PushNotifier::new
      );

      public static Notifier create(String channel) {
          Supplier<Notifier> factory = FACTORIES.get(channel);
          if (factory == null) throw new IllegalArgumentException("Unknown: " + channel);
          return factory.get();
      }
  }

  Notifier notifier = NotificationFactory.create("email");
  notifier.send("Hello!");

  // To add Slack notifications: just add one entry. No if/else chain.
```

**Note:** The map-based version above is the *Simple Factory* idiom — one place builds
objects so callers never name concrete classes. The classic GoF **Factory Method**
pattern reaches the same goal differently: it declares a `create()` method that
**subclasses override** to choose the concrete type (e.g., `DialogWindows` and
`DialogWeb` each return their own `Button`). Use Simple Factory for a quick registry;
use Factory Method when the *creator itself* is part of a class hierarchy.

### Builder — Construct Complex Objects Step by Step

```
  PROBLEM: Object has many optional parameters. Constructor
  becomes unwieldy.

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

  // Implementation:
  public class User {
      private final String name;
      private final String email;
      private final int age;
      // ... more fields

      private User(Builder builder) {
          this.name = builder.name;
          this.email = builder.email;
          this.age = builder.age;
      }

      public static Builder builder() { return new Builder(); }

      public static class Builder {
          private String name;
          private String email;
          private int age;

          public Builder name(String name)   { this.name = name; return this; }
          public Builder email(String email) { this.email = email; return this; }
          public Builder age(int age)        { this.age = age; return this; }

          public User build() {
              Objects.requireNonNull(name, "name is required");
              Objects.requireNonNull(email, "email is required");
              return new User(this);
          }
      }
  }

  // Each step is clear. Optional fields can be skipped.
  // The .build() method validates and returns an immutable object.
  // REAL-WORLD: Protocol Buffers (Google's standard), Guava ImmutableList.builder(),
  // HTTP request builders, SQL query builders.
```

---

## 2.3 Structural Patterns

### Adapter — Make Incompatible Interfaces Work Together

```
  PROBLEM: You have an existing class that doesn't match the
  interface your code expects. Like using a US power plug in
  a European outlet — you need an ADAPTER.

  // Your code expects:           Third-party library provides:
  // ─────────────────            ──────────────────────────────
  public interface PaymentGateway {     public class StripeAPI {
      void charge(double amount,            void createCharge(int cents,
                  String currency);                           String currencyCode);
  }                                     }

  public class StripeAdapter implements PaymentGateway {
      private final StripeAPI stripe;

      public StripeAdapter(StripeAPI stripe) { this.stripe = stripe; }

      @Override
      public void charge(double amount, String currency) {
          int cents = (int)(amount * 100);    // convert dollars to cents
          stripe.createCharge(cents, currency.toUpperCase());
      }
  }

  // Your code works with ANY PaymentGateway:
  PaymentGateway gateway = new StripeAdapter(new StripeAPI());
  gateway.charge(29.99, "usd");

  // Tomorrow: switch to PayPal? Write PayPalAdapter. Zero changes elsewhere.
```

### Facade — Simple Interface to Complex Subsystem

```
  PROBLEM: A subsystem has many classes and complex interactions.
  Clients need a simple way to use it.

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

  // WITH FACADE (one simple method):
  // ─────────────────────────────────────────────────────
  public class HomeTheaterFacade {
      private final DVDPlayer dvd;
      private final Amplifier amp;
      private final Projector projector;
      private final TheaterLights lights;

      // constructor takes all dependencies...

      public void watchMovie(String title) {
          lights.dim(30);
          projector.on();
          projector.wideScreenMode();
          amp.on();
          amp.setVolume(8);
          dvd.on();
          dvd.play(title);
      }
  }

  HomeTheaterFacade theater = new HomeTheaterFacade(...);
  theater.watchMovie("Inception");    // one call does everything!

  // REAL-WORLD: SDK wrappers, Google Cloud client libraries, ORM facades.
```

### Decorator — Add Behavior Without Modifying Original

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

  REAL-WORLD: Java I/O streams, Python decorators (@property, @cache),
  middleware in web frameworks, logging wrappers.
```

### Proxy — Control Access to an Object

```
  PROBLEM: You need to control access, add caching, logging,
  or lazy loading to an object without changing it.

  Types of Proxies:
  ┌────────────────┬──────────────────────────────────────────┐
  │ Virtual Proxy  │ Delays creation until actually needed     │
  │                │ (lazy loading heavy resources)            │
  ├────────────────┼──────────────────────────────────────────┤
  │ Protection     │ Controls access based on permissions      │
  │ Proxy          │ (auth check before allowing operation)   │
  ├────────────────┼──────────────────────────────────────────┤
  │ Caching Proxy  │ Stores results of expensive operations    │
  │                │ (return cached result if available)       │
  ├────────────────┼──────────────────────────────────────────┤
  │ Remote Proxy   │ Represents object in a different process  │
  │                │ (RPC, gRPC stubs)                        │
  └────────────────┴──────────────────────────────────────────┘

  // EXAMPLE (Caching Proxy):
  public class CachingWeatherProxy implements WeatherService {
      private final WeatherService realService;
      private final Map<String, Forecast> cache = new ConcurrentHashMap<>();

      public CachingWeatherProxy(WeatherService realService) {
          this.realService = realService;
      }

      @Override
      public Forecast getForecast(String city) {
          return cache.computeIfAbsent(city, realService::getForecast);
      }
  }
```

---

## 2.4 Behavioral Patterns

### Observer — "Something changed! Tell everyone who cares."

```
  PROBLEM: When one object changes state, multiple other objects
  need to be notified automatically.

  ┌─────────────────┐    notify    ┌─────────────────┐
  │                 │ ──────────> │  Email Service   │
  │   ORDER PLACED  │ ──────────> │  Inventory Svc   │
  │   (Subject)     │ ──────────> │  Analytics Svc   │
  │                 │ ──────────> │  Notification Svc│
  └─────────────────┘             └─────────────────┘
       ONE event              MANY listeners (observers)

  public class EventBus<T> {
      private final Map<String, List<Consumer<T>>> listeners = new ConcurrentHashMap<>();

      public void subscribe(String event, Consumer<T> callback) {
          listeners.computeIfAbsent(event, k -> new CopyOnWriteArrayList<>()).add(callback);
      }

      public void publish(String event, T data) {
          listeners.getOrDefault(event, List.of()).forEach(cb -> cb.accept(data));
      }
  }

  // Usage:
  EventBus<Order> bus = new EventBus<>();
  bus.subscribe("order_placed", emailService::sendConfirmation);
  bus.subscribe("order_placed", inventory::reduceStock);
  bus.subscribe("order_placed", analytics::logPurchase);

  bus.publish("order_placed", order);  // all three get notified!

  REAL-WORLD: DOM event listeners, React state management,
  message brokers (Kafka, RabbitMQ), webhooks.
```

### Strategy — Swap Algorithms at Runtime

```
  PROBLEM: You need different algorithms for the same task,
  and want to switch between them easily.

  EXAMPLE: Different pricing strategies for an e-commerce site.

  public interface PricingStrategy {
      double calculate(double basePrice);
  }

  public class RegularPricing implements PricingStrategy {
      public double calculate(double basePrice) { return basePrice; }
  }

  public class HolidaySale implements PricingStrategy {
      public double calculate(double basePrice) { return basePrice * 0.80; }  // 20% off
  }

  public class VIPPricing implements PricingStrategy {
      public double calculate(double basePrice) { return basePrice * 0.70; }  // 30% off
  }

  public class ShoppingCart {
      private final PricingStrategy strategy;

      public ShoppingCart(PricingStrategy strategy) { this.strategy = strategy; }

      public double checkout(List<Item> items) {
          return items.stream()
              .mapToDouble(item -> strategy.calculate(item.getPrice()))
              .sum();
      }
  }

  // At runtime, pick the strategy:
  ShoppingCart cart = new ShoppingCart(new HolidaySale());     // holiday pricing
  ShoppingCart vipCart = new ShoppingCart(new VIPPricing());   // VIP pricing
  // No if/else chains! Clean, extensible.

  // Java 8+ shortcut using lambdas (Strategy is a functional interface!):
  ShoppingCart cart = new ShoppingCart(price -> price * 0.85); // 15% off

  REAL-WORLD: sorting algorithms, compression algorithms,
  authentication methods, payment processing.
```

### Command — Encapsulate a Request as an Object

```
  PROBLEM: You need to parameterize actions, queue them,
  log them, or support undo/redo.

  ┌────────────────────────────────────────────────────────┐
  │  Without Command:                                       │
  │  button.on_click = editor.bold_text   <- tightly coupled│
  │                                                        │
  │  With Command:                                          │
  │  button.on_click = BoldCommand(editor) <- decoupled!   │
  │  Commands can be queued, undone, logged, replayed       │
  └────────────────────────────────────────────────────────┘

  public interface Command {
      void execute();
      void undo();
  }

  public class BoldCommand implements Command {
      private final Editor editor;
      public BoldCommand(Editor editor) { this.editor = editor; }
      public void execute() { editor.makeBold(); }
      public void undo()    { editor.removeBold(); }
  }

  public class CommandHistory {
      private final Deque<Command> history = new ArrayDeque<>();

      public void execute(Command command) {
          command.execute();
          history.push(command);
      }

      public void undo() {
          if (!history.isEmpty()) {
              history.pop().undo();
          }
      }
  }

  REAL-WORLD: Undo/redo in editors, transaction processing,
  task queues, macro recording, Git commits.
```

### State — Different Behavior Per State

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

  ┌─────────┐  publish   ┌──────────┐  publish   ┌───────────┐
  │  Draft   │ ────────> │  Review  │ ────────> │ Published │
  │         │ <──────── │          │ <──────── │           │
  └─────────┘  reject    └──────────┘  reject    └───────────┘

  Add a new state? Just add a new class. No existing code changes.

  REAL-WORLD: Order status (placed→paid→shipped→delivered),
  TCP connections, game character states, UI components.
```

### Template Method — Define Skeleton, Let Subclasses Fill In Details

```
  PROBLEM: Multiple classes share the same algorithm structure,
  but differ in specific steps.

  EXAMPLE: Generating reports in different formats.

  public abstract class ReportGenerator {              // base class (the "template")

      public final void generate(Data data) {          // the template method (final = can't override!)
          prepareHeader();
          Data processed = processData(data);
          formatOutput(processed);
          sendReport();
      }

      private void prepareHeader() {                   // shared step (same for all)
          System.out.println("Report generated at " + Instant.now());
      }

      protected abstract Data processData(Data data);  // abstract — subclass fills in

      protected abstract void formatOutput(Data data);  // abstract — subclass fills in

      private void sendReport() {                       // shared step (same for all)
          System.out.println("Report sent to stakeholders");
      }
  }

  public class PDFReport extends ReportGenerator {
      protected Data processData(Data data)  { return cleanAndAggregate(data); }
      protected void formatOutput(Data data) { renderToPdf(data); }
  }

  public class ExcelReport extends ReportGenerator {
      protected Data processData(Data data)  { return cleanAndAggregate(data); }
      protected void formatOutput(Data data) { writeToSpreadsheet(data); }
  }

  The ALGORITHM STRUCTURE (prepare → process → format → send) is fixed.
  The DETAILS (how to format) vary by subclass.

  REAL-WORLD: web framework request handling (Django views),
  data pipeline ETL steps, test setup/teardown (setUp/test/tearDown).
```

### Pattern Selection Guide

```
┌──────────────────────────────────────────────────────────────────┐
│  WHEN TO USE WHICH PATTERN                                        │
├───────────────────────┬──────────────────────────────────────────┤
│ "I need ONE instance" │ Singleton (or better: DI container)      │
│ "Create without       │ Factory Method / Abstract Factory        │
│  knowing exact type"  │                                          │
│ "Complex construction"│ Builder                                  │
│ "Wrap incompatible    │ Adapter                                  │
│  interfaces"          │                                          │
│ "Simplify complex     │ Facade                                   │
│  subsystem"           │                                          │
│ "Add behavior         │ Decorator                                │
│  dynamically"         │                                          │
│ "React to changes"    │ Observer / Event Bus                     │
│ "Swap algorithms"     │ Strategy                                 │
│ "Undo/redo, queue     │ Command                                  │
│  actions"             │                                          │
│ "Different behavior   │ State                                    │
│  per state"           │                                          │
│ "Control access"      │ Proxy                                    │
└───────────────────────┴──────────────────────────────────────────┘
```

---

# PART 3: JAVA CONCURRENCY ESSENTIALS (Google Interview Must-Know)

---

## 3.1 Why Concurrency Matters at Google

```
  Google serves BILLIONS of requests per day. Every service must handle
  thousands of concurrent connections. Understanding concurrency is
  NON-NEGOTIABLE for a Google Senior Engineer interview.
```

## 3.2 Thread Safety Fundamentals

```java
  // PROBLEM: Two threads incrementing the same counter
  public class UnsafeCounter {
      private int count = 0;

      public void increment() {
          count++;   // NOT atomic! Read → Modify → Write = race condition
      }
  }

  // Thread 1: reads count=5, increments to 6
  // Thread 2: reads count=5 (BEFORE Thread 1 writes!), increments to 6
  // Expected: 7. Actual: 6. Lost update!

  // FIX 1: synchronized
  public class SafeCounter {
      private int count = 0;

      public synchronized void increment() {     // only one thread at a time
          count++;
      }
  }

  // FIX 2: AtomicInteger (lock-free, faster)
  public class AtomicCounter {
      private final AtomicInteger count = new AtomicInteger(0);

      public void increment() {
          count.incrementAndGet();   // atomic compare-and-swap (CAS)
      }
  }

  // FIX 3: ConcurrentHashMap (thread-safe Map)
  // BAD:  HashMap with external synchronization (error-prone)
  // GOOD: ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
  //       map.merge(key, 1, Integer::sum);   // atomic increment per key
```

## 3.3 Common Concurrency Patterns

```java
  // PRODUCER-CONSUMER (with BlockingQueue)
  // ────────────────────────────────────────────────────────
  BlockingQueue<Task> queue = new LinkedBlockingQueue<>(100);

  // Producer thread:
  queue.put(new Task("process-order"));    // blocks if queue is full

  // Consumer thread:
  Task task = queue.take();                // blocks if queue is empty
  task.execute();

  // Used in: Thread pools, message processing, work distribution


  // THREAD POOL (ExecutorService)
  // ────────────────────────────────────────────────────────
  ExecutorService pool = Executors.newFixedThreadPool(10);

  // Submit tasks:
  Future<Result> future = pool.submit(() -> processOrder(order));

  // Get result (blocks until complete):
  Result result = future.get(5, TimeUnit.SECONDS);

  // Google best practice: always set pool sizes explicitly.
  // Avoid Executors.newCachedThreadPool() — unbounded thread creation!


  // COMPLETABLEFUTURE (async composition — modern Java)
  // ────────────────────────────────────────────────────────
  CompletableFuture<User> userFuture = CompletableFuture
      .supplyAsync(() -> userService.getUser(userId))          // async call 1
      .thenCompose(user -> orderService.getOrders(user.getId()))// chain call 2
      .thenApply(orders -> enrichWithRecommendations(orders))   // transform
      .exceptionally(ex -> fallbackResponse());                 // error handling

  // This is how Google services chain RPCs without blocking threads.


  // READ-WRITE LOCK (many readers OR one writer)
  // ────────────────────────────────────────────────────────
  private final ReadWriteLock lock = new ReentrantReadWriteLock();
  private final Map<String, String> cache = new HashMap<>();

  public String get(String key) {
      lock.readLock().lock();       // multiple readers can enter simultaneously
      try { return cache.get(key); }
      finally { lock.readLock().unlock(); }
  }

  public void put(String key, String value) {
      lock.writeLock().lock();      // only ONE writer, blocks all readers
      try { cache.put(key, value); }
      finally { lock.writeLock().unlock(); }
  }
```

## 3.4 Concurrency Pitfalls to Know

```
  ┌────────────────────┬──────────────────────────────────────────────────┐
  │ Pitfall            │ What It Is                                        │
  ├────────────────────┼──────────────────────────────────────────────────┤
  │ Race Condition     │ Two threads access shared state without sync.     │
  │                    │ Result depends on who runs first. Non-deterministic│
  ├────────────────────┼──────────────────────────────────────────────────┤
  │ Deadlock           │ Thread A holds Lock 1, waits for Lock 2.          │
  │                    │ Thread B holds Lock 2, waits for Lock 1.          │
  │                    │ Both wait forever. Fix: always lock in same order.│
  ├────────────────────┼──────────────────────────────────────────────────┤
  │ Starvation         │ Low-priority thread never gets to run because     │
  │                    │ high-priority threads always grab the lock.       │
  ├────────────────────┼──────────────────────────────────────────────────┤
  │ Livelock           │ Threads keep responding to each other but         │
  │                    │ make no progress (like two people in a hallway    │
  │                    │ both stepping aside to the same side).            │
  ├────────────────────┼──────────────────────────────────────────────────┤
  │ False Sharing      │ Two threads modify different variables that       │
  │                    │ happen to be on the same CPU cache line.          │
  │                    │ Performance tanks due to cache invalidation.      │
  └────────────────────┴──────────────────────────────────────────────────┘

  GOOGLE INTERVIEW TIP: If asked to design a concurrent system,
  always discuss: thread safety, deadlock prevention, and how you'd
  test for race conditions.
```

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
<summary>Selected Answers</summary>

**Q4:** Dependency Inversion means high-level modules depend on abstractions (interfaces), not concrete implementations. This makes testing easier because you can inject mock implementations. Instead of `OrderService` depending on `MySQLDatabase`, it depends on a `Database` interface. In tests, you inject `MockDatabase` — no real DB needed.

**Q7:** Decorator Pattern — wrap the API client in layers: `LoggingDecorator(CachingDecorator(RateLimitDecorator(realClient)))`. Each decorator adds behavior without modifying the original. Alternatively, use Proxy pattern for each concern.

**Q9:** `count++` is read-modify-write — three steps that aren't atomic, so two threads can both read the same value and one increment is lost. Fix with `synchronized` (mutual exclusion) or, better for a counter, `AtomicInteger.incrementAndGet()` (lock-free compare-and-swap). For per-key counts: `ConcurrentHashMap.merge(key, 1, Integer::sum)`.

**Q10:** A deadlock is two threads each holding one lock and waiting for the other's — both wait forever. The simplest prevention is **global lock ordering**: every code path acquires locks in the same total order. Backstops: lock timeouts (`tryLock`) and avoiding nested locks entirely.

</details>

---

## Key Takeaways

```
OO DESIGN, SOLID & PATTERNS — CHEAT SHEET
═════════════════════════════════════════

PRINCIPLES
  SOLID = SRP + OCP + LSP + ISP + DIP
    SRP  one reason to change          OCP  extend, don't modify
    LSP  subtypes substitutable        ISP  many small interfaces
    DIP  depend on abstractions, not implementations
  DRY  one source of truth   ·   KISS  simplest that works   ·   YAGNI  build it when needed
  Composition over inheritance   ·   High cohesion + low coupling = the goal

PATTERNS
  Factory    create without naming the concrete type
  Builder    construct complex objects step by step
  Adapter    bridge incompatible interfaces
  Decorator  add behavior without modifying the original
  Facade     simple front to a complex subsystem
  Observer   notify many when one changes
  Strategy   swap algorithms at runtime
  State      behavior per state — no if/else explosion
  Command    encapsulate an action (undo/redo, queue)

JAVA CONCURRENCY
  count++ is not atomic → synchronized / AtomicInteger / ConcurrentHashMap.merge
  Deadlock → always acquire locks in one global order
  Bounded ExecutorService pools; never unbounded thread creation
  CompletableFuture to compose async calls without blocking

System design · data · distributed systems · security · observability
  → see Chapters 22–26.
```

---

**Back to Start:** [README — Table of Contents](../README.md)