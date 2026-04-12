# Design Fundamentals for Senior Software Engineers — Google Interview Edition

> "Any fool can write code that a computer can understand. Good programmers write code
> that humans can understand." — Martin Fowler

**What this document covers:**
Everything a Senior Software Engineer needs to know about software design — from SOLID principles to system design, from design patterns to distributed systems. All code examples use **Java** (Google's primary backend language). Written to be understood by anyone, but deep enough for interviews at Google, Amazon, Meta, and top-tier companies.

**Why Java?** Google's backend is predominantly Java (and C++/Go). Demonstrating clean Java in design interviews signals fluency with Google's ecosystem.

---

## What You'll Learn

After reading this document, you will be able to:
- Apply SOLID principles and know when each one matters most
- Recognize and implement the most important design patterns
- Design scalable systems handling millions of users
- Choose the right database, caching strategy, and messaging system
- Explain CAP theorem, consistency models, and distributed system tradeoffs
- Design clean APIs (REST, GraphQL, gRPC) and know when to use each
- Structure code using Clean Architecture, DDD, and CQRS
- Ace system design interviews with a repeatable framework

---

## Table of Contents

| Part | Topic | Key Concepts |
|------|-------|--------------|
| 1 | Software Design Principles | SOLID, DRY, KISS, YAGNI, Coupling & Cohesion, Separation of Concerns |
| 2 | Design Patterns | Creational, Structural, Behavioral (incl. State, Template Method) |
| 3 | System Design Fundamentals | Scalability, Latency Percentiles (p50/p95/p99), Availability, CAP, Estimation |
| 4 | API Design & Database Design | REST, GraphQL, gRPC, Normalization (1NF-3NF), N+1 Problem, Pagination, Idempotency, Indexing, Sharding |
| 5 | Distributed Systems | Microservices, API Gateway, Caching, Rate Limiting, Saga Pattern, Consistent Hashing, Messaging, Load Balancing |
| 6 | Architecture Patterns | Clean Architecture, **DDD** (Entities, Aggregates, Bounded Contexts), CQRS, Event Sourcing |
| 7 | Security Fundamentals | Auth, OAuth, JWT, OWASP Top 10 |
| 8 | **Java Concurrency** (Google Must-Know) | Thread safety, synchronized, AtomicInteger, ConcurrentHashMap, ExecutorService, CompletableFuture, deadlocks |
| 9 | **Google Interview Tips** | What Google L5 looks for, scale thinking, trade-offs, Google tech (Bigtable, Spanner, Pub/Sub) |
| 10 | System Design Interview Framework | Step-by-step approach, estimation, common designs |
| 11 | Review Questions | Self-test with detailed answers |

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

### Factory Method — Let Subclasses Decide What to Create

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

# PART 3: SYSTEM DESIGN FUNDAMENTALS

---

## 3.1 Scalability

### Simple Explanation
Scalability is your system's ability to handle growth. Like a restaurant —
can you serve 10 customers? 1,000? 100,000? What changes do you need to make?

### Vertical vs Horizontal Scaling

```
  VERTICAL SCALING (Scale Up)          HORIZONTAL SCALING (Scale Out)
  ──────────────────────────           ─────────────────────────────
  Add more power to ONE machine        Add MORE machines

  ┌──────────────────────┐             ┌──────┐ ┌──────┐ ┌──────┐
  │                      │             │Server│ │Server│ │Server│
  │   BIGGER SERVER      │             │  1   │ │  2   │ │  3   │
  │   More CPU, RAM,     │             └──────┘ └──────┘ └──────┘
  │   faster disks       │             ┌──────┐ ┌──────┐ ┌──────┐
  │                      │             │Server│ │Server│ │Server│
  │                      │             │  4   │ │  5   │ │  6   │
  └──────────────────────┘             └──────┘ └──────┘ └──────┘

  Pros:                                Pros:
  + Simple, no code changes            + Virtually unlimited scale
  + No distributed complexity          + Redundancy (one fails, others work)
                                       + Cost-effective (commodity hardware)
  Cons:
  - Has a hard ceiling                 Cons:
  - Single point of failure            - Complex (distributed systems)
  - Expensive at high end              - Data consistency is harder
  - Downtime during upgrade            - Need load balancing

  USE: Start vertical, go horizontal when you hit limits.
```

### Stateless vs Stateful Services

```
  STATELESS (easy to scale):          STATEFUL (hard to scale):
  ─────────────────────────           ─────────────────────────
  Server stores NO user data          Server stores user sessions

  Request 1 → Server A               Request 1 → Server A (has session)
  Request 2 → Server B  (works!)     Request 2 → Server B  (no session!)
  Request 3 → Server C  (works!)

  Any server can handle any request.  Requests must go to the SAME server.
  Just add more servers!              Need "sticky sessions" or shared state.

  ┌──────────────────────────────────────────────────────────────┐
  │  RULE: Make your application servers STATELESS.              │
  │  Store state in a separate layer:                            │
  │  - Sessions: Redis / Memcached                               │
  │  - Data: Database                                            │
  │  - Files: Object storage (S3)                                │
  └──────────────────────────────────────────────────────────────┘
```

---

## 3.2 Latency and Throughput — The Two Performance Metrics

```
  LATENCY = how long ONE request takes (time)
  THROUGHPUT = how many requests the system handles per second (volume)

  Analogy: A highway.
  Latency = how long it takes ONE car to drive from A to B (speed)
  Throughput = how many cars pass per hour (capacity)

  A wide highway (high throughput) can still have slow traffic (high latency).
  A fast sports car (low latency) doesn't mean the road handles many cars.
```

### Percentile Latency — What Really Matters

```
  AVERAGE latency is MISLEADING.

  Example: 100 requests.
  99 take 50ms each. 1 takes 5000ms (5 seconds!).
  Average = (99×50 + 1×5000) / 100 = 99.5ms
  Looks fine! But one user waited 5 SECONDS.

  PERCENTILES tell the real story:
  ────────────────────────────────────────────────────────
  p50 (median):  50% of requests are faster than this.
                 The "typical" experience.

  p95:           95% of requests are faster. 5% are slower.
                 The "almost everyone" experience.

  p99:           99% of requests are faster. 1% are slower.
                 The "worst case for most users."

  p99.9:         Only 1 in 1000 requests is slower.
                 The "tail latency" that hits your best customers
                 (high-volume users see rare events more often).

  EXAMPLE:
  ┌────────────┬───────────────┬──────────────────────────────┐
  │ Percentile │ Latency       │ What it means                 │
  ├────────────┼───────────────┼──────────────────────────────┤
  │ p50        │ 45ms          │ Half of users wait <45ms      │
  │ p95        │ 200ms         │ 95% of users wait <200ms      │
  │ p99        │ 1200ms        │ 99% of users wait <1.2 sec    │
  │ p99.9      │ 5000ms        │ 1 in 1000 waits 5 seconds!   │
  └────────────┴───────────────┴──────────────────────────────┘

  SLAs (Service Level Agreements) use percentiles:
  "p99 latency must be under 500ms" is a real production target.

  WHY TAIL LATENCY MATTERS:
  ────────────────────────────────────────────────────────
  If a single page load calls 20 microservices:
  P(at least one is slow) = 1 - (0.99)^20 = 18%!
  
  Even with 99% of requests being fast,
  18% of PAGE LOADS will feel slow because of one slow service call.
  This is why p99 and p99.9 matter more than averages.
```

---

## 3.3 Availability & Reliability

```
  AVAILABILITY = % of time the system is operational
  ──────────────────────────────────────────────────────────

  ┌───────────────┬──────────────────────────────────────────┐
  │ Availability  │ Downtime per year                         │
  ├───────────────┼──────────────────────────────────────────┤
  │ 99%    (two 9s)   │ 3.65 days                            │
  │ 99.9%  (three 9s) │ 8.77 hours                           │
  │ 99.99% (four 9s)  │ 52.6 minutes                         │
  │ 99.999%(five 9s)  │ 5.26 minutes                         │
  └───────────────┴──────────────────────────────────────────┘

  Most services target: 99.9% (three nines) to 99.99% (four nines)

  HOW TO IMPROVE AVAILABILITY:
  ────────────────────────────
  1. Redundancy — no single point of failure
  2. Load balancing — distribute traffic
  3. Health checks — detect and remove failed nodes
  4. Failover — automatic switch to backup
  5. Graceful degradation — serve partial results if some services are down
```

### Redundancy Eliminates Single Points of Failure

```
  SINGLE POINT OF FAILURE:           REDUNDANT:
  ──────────────────────────          ──────────────────────────

  Client → [Server] → [DB]           Client → [Load Balancer]
                                              /      |      \
  Server dies = EVERYTHING dies!        [Srv 1] [Srv 2] [Srv 3]
                                              \      |      /
                                          [DB Primary] → [DB Replica]
                                                         [DB Replica]

  Every layer has backups. Any single component can fail
  and the system keeps running.
```

---

## 3.4 CAP Theorem

### Simple Explanation
In a distributed system, when a network partition happens (some servers can't
talk to each other), you can only guarantee TWO out of three properties:

```
  ┌─────────────────────────────────────────────────────────────┐
  │                      CAP THEOREM                             │
  │                                                              │
  │                    Consistency (C)                            │
  │                        /\                                    │
  │                       /  \                                   │
  │                      /    \                                  │
  │                     / PICK \                                 │
  │                    /  TWO   \                                │
  │                   /          \                               │
  │    Availability (A) ──────── Partition Tolerance (P)         │
  │                                                              │
  │  C = Every read receives the most recent write               │
  │  A = Every request receives a response (even if stale)       │
  │  P = System works despite network failures between nodes     │
  └─────────────────────────────────────────────────────────────┘

  In practice, network partitions WILL happen (P is mandatory).
  So the real choice is: CP or AP?

  CP (Consistency + Partition Tolerance):
  ────────────────────────────────────────
  "I'd rather return an error than give you stale data."
  Examples: Banking systems, inventory counts
  Databases: MongoDB (default), HBase, Redis (cluster mode)

  AP (Availability + Partition Tolerance):
  ────────────────────────────────────────
  "I'd rather give you possibly-stale data than no data at all."
  Examples: Social media feeds, shopping carts, DNS
  Databases: Cassandra, DynamoDB, CouchDB
```

### PACELC — The Extended Version

```
  CAP only describes behavior DURING a partition.
  PACELC adds: what about when there's NO partition?

  If Partition → choose A or C
  Else         → choose Latency or Consistency

  ┌───────────────────────────────────────────────────────┐
  │  System      │ During Partition │ Normal Operation     │
  ├──────────────┼─────────────────┼──────────────────────┤
  │ DynamoDB     │ Choose A         │ Choose Latency (EL)  │
  │ Cassandra    │ Choose A         │ Choose Latency (EL)  │
  │ MongoDB      │ Choose C         │ Choose Consistency(EC)│
  │ MySQL/Postgres│ Choose C        │ Choose Consistency(EC)│
  └──────────────┴─────────────────┴──────────────────────┘
```

---

## 3.5 Consistency Models

```
  ┌────────────────────────────────────────────────────────────────┐
  │ STRONG CONSISTENCY                                              │
  │ ────────────────                                               │
  │ Every read sees the latest write. Period.                       │
  │ Like a single database server — everyone sees the same data.   │
  │ Cost: higher latency (must wait for all replicas to agree)     │
  │ Example: bank balance                                          │
  ├────────────────────────────────────────────────────────────────┤
  │ EVENTUAL CONSISTENCY                                            │
  │ ─────────────────                                              │
  │ All replicas will converge to the same value... eventually.    │
  │ Reads may return stale data for a short period.                │
  │ Cost: lower latency (write returns immediately)                │
  │ Example: social media "like" count                             │
  ├────────────────────────────────────────────────────────────────┤
  │ CAUSAL CONSISTENCY                                              │
  │ ──────────────────                                             │
  │ Operations that are causally related are seen in order.        │
  │ Unrelated operations can be in any order.                      │
  │ Example: if I post, then reply to my own post — you'll see    │
  │ the post before the reply (causal order preserved)             │
  ├────────────────────────────────────────────────────────────────┤
  │ READ-YOUR-WRITES                                                │
  │ ────────────────                                               │
  │ A user always sees their own writes immediately.               │
  │ Other users may see a delay.                                   │
  │ Example: you update your profile and immediately see it change │
  └────────────────────────────────────────────────────────────────┘
```

---

## 3.6 Back-of-Envelope Estimation

```
  NUMBERS EVERY ENGINEER SHOULD KNOW:
  ────────────────────────────────────────────────────────────────
  L1 cache reference:                    1 ns
  L2 cache reference:                    4 ns
  Main memory (RAM) reference:          100 ns
  SSD random read:                   15,000 ns  (15 us)
  HDD random read:                2,000,000 ns  (2 ms)
  Send packet CA -> Netherlands:  150,000,000 ns (150 ms)

  THROUGHPUT:
  ────────────────────────────────────────────────────────────────
  Sequential read from SSD:    500 MB/s
  Sequential read from HDD:    100 MB/s
  Network (1 Gbps):            125 MB/s
  Network (10 Gbps):         1,250 MB/s

  SCALE REFERENCE:
  ────────────────────────────────────────────────────────────────
  1 million seconds  =  ~11.5 days
  1 billion seconds  =  ~31.7 years

  QPS (Queries Per Second) estimation:
  ────────────────────────────────────────────────────────────────
  Daily Active Users (DAU): 10 million
  Each user makes 10 requests/day
  Total requests = 100 million/day
  QPS = 100M / 86,400 seconds = ~1,150 QPS
  Peak QPS = 2x to 5x average = ~2,300 to 5,750 QPS

  STORAGE estimation:
  ────────────────────────────────────────────────────────────────
  1 tweet = ~140 chars = ~280 bytes + metadata = ~500 bytes
  500 million tweets/day = 250 GB/day = ~90 TB/year
```

---

# PART 4: API DESIGN & DATABASE DESIGN

---

## 4.1 REST API Design

### Simple Explanation
REST (REpresentational State Transfer) treats everything as a resource
that you can create, read, update, or delete using standard HTTP methods.

```
  THE CORE IDEA: Resources + HTTP Verbs
  ────────────────────────────────────────────────────────────────

  Resource: /users, /orders, /products

  ┌──────────┬──────────────┬──────────────────────────────────┐
  │ HTTP Verb│ Action       │ Example                           │
  ├──────────┼──────────────┼──────────────────────────────────┤
  │ GET      │ Read         │ GET /users/123     (get user 123) │
  │ POST     │ Create       │ POST /users        (create user)  │
  │ PUT      │ Replace      │ PUT /users/123     (replace user) │
  │ PATCH    │ Partial Edit │ PATCH /users/123   (update field) │
  │ DELETE   │ Delete       │ DELETE /users/123  (delete user)  │
  └──────────┴──────────────┴──────────────────────────────────┘

  REST BEST PRACTICES:
  ┌────────────────────────────────────────────────────────────────┐
  │ Use nouns, not verbs:     /users  NOT  /getUsers               │
  │ Use plural names:         /users  NOT  /user                   │
  │ Use nesting for relations: /users/123/orders                   │
  │ Use query params for filtering: /users?role=admin&active=true  │
  │ Version your API:         /v1/users  or  Accept: v1            │
  │ Return proper status codes: 200, 201, 400, 401, 404, 500      │
  │ Use pagination:           /users?page=2&limit=20               │
  │ Use HATEOAS for discoverability (links in responses)           │
  └────────────────────────────────────────────────────────────────┘
```

### HTTP Status Codes

```
  ┌─────────────────────────────────────────────────────────────┐
  │  2xx SUCCESS                                                 │
  │  200 OK             — request succeeded                      │
  │  201 Created        — resource created (after POST)          │
  │  204 No Content     — success, no body (after DELETE)        │
  ├─────────────────────────────────────────────────────────────┤
  │  3xx REDIRECT                                                │
  │  301 Moved Permanently  — resource has a new URL             │
  │  304 Not Modified       — use cached version                 │
  ├─────────────────────────────────────────────────────────────┤
  │  4xx CLIENT ERROR                                            │
  │  400 Bad Request    — malformed request                      │
  │  401 Unauthorized   — not authenticated                      │
  │  403 Forbidden      — authenticated but not allowed          │
  │  404 Not Found      — resource doesn't exist                 │
  │  409 Conflict       — resource conflict (duplicate)          │
  │  429 Too Many Reqs  — rate limited                           │
  ├─────────────────────────────────────────────────────────────┤
  │  5xx SERVER ERROR                                            │
  │  500 Internal Error — server bug                             │
  │  502 Bad Gateway    — upstream server error                  │
  │  503 Service Unavail— server overloaded or in maintenance    │
  └─────────────────────────────────────────────────────────────┘
```

---

## 4.2 REST vs GraphQL vs gRPC

```
┌────────────────┬──────────────────┬──────────────────┬──────────────────┐
│                │ REST             │ GraphQL          │ gRPC             │
├────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Protocol       │ HTTP/JSON        │ HTTP/JSON        │ HTTP/2 + Protobuf│
│ Data fetching  │ Fixed endpoints  │ Client specifies │ Defined in .proto│
│                │ /users returns   │ exactly what     │ file (strict     │
│                │ everything       │ fields it wants  │ contract)        │
│ Over-fetching  │ Common problem   │ Solved!          │ N/A (typed)      │
│ Under-fetching │ Need multiple    │ Solved! One      │ N/A (typed)      │
│                │ requests         │ query gets all   │                  │
│ Performance    │ Good             │ Good             │ Best (binary)    │
│ Caching        │ Easy (HTTP cache)│ Complex          │ No HTTP caching  │
│ Learning curve │ Low              │ Medium           │ Medium-High      │
│ Best for       │ Public APIs,     │ Frontend-heavy   │ Microservice-    │
│                │ simple CRUD      │ apps, mobile     │ to-microservice  │
│                │                  │ (minimize data)  │ (internal APIs)  │
└────────────────┴──────────────────┴──────────────────┴──────────────────┘

  WHEN TO USE WHAT:
  ─────────────────────────────────────────────────────────────────
  Public API for external developers?      -> REST (industry standard)
  Mobile app needing flexible queries?     -> GraphQL (fetch only what you need)
  Internal service-to-service calls?       -> gRPC (fast, typed, streaming)
  Simple CRUD app?                         -> REST (simplest)
  Real-time bidirectional streaming?       -> gRPC (built-in support)
```

---

## 4.3 Database Design — SQL vs NoSQL

```
  SQL (Relational)                     NoSQL (Non-Relational)
  ──────────────────────               ──────────────────────────
  Tables with rows/columns             Various data models
  Fixed schema (must define upfront)   Flexible/dynamic schema
  ACID transactions                    BASE (eventually consistent)
  Complex joins across tables          Denormalized, minimal joins
  Vertical scaling (mainly)            Horizontal scaling (designed for it)

  ┌────────────────────────────────────────────────────────────────┐
  │  SQL DATABASES        │  NoSQL DATABASES                       │
  ├───────────────────────┼────────────────────────────────────────┤
  │ PostgreSQL            │ Document: MongoDB, CouchDB             │
  │ MySQL                 │ Key-Value: Redis, DynamoDB             │
  │ SQL Server            │ Wide-Column: Cassandra, HBase          │
  │ Oracle                │ Graph: Neo4j, Amazon Neptune           │
  │ SQLite                │ Time-Series: InfluxDB, TimescaleDB     │
  └───────────────────────┴────────────────────────────────────────┘
```

### When to Use SQL vs NoSQL

```
  USE SQL WHEN:                       USE NoSQL WHEN:
  ─────────────────────               ──────────────────────────
  Data is highly structured           Schema changes frequently
  Complex queries / joins needed      Need horizontal scaling
  ACID transactions required          High write throughput
  Data integrity is critical          Data is semi/unstructured
  Relational data (users, orders)     Caching (Redis)
  Financial / banking systems         Real-time analytics
  Reporting / analytics               Social graphs (Neo4j)
```

### Database Normalization — Organizing Data to Eliminate Redundancy

Normalization is the process of structuring tables to reduce data duplication and prevent inconsistencies.

```
  UNNORMALIZED (messy — data repeated everywhere):
  ────────────────────────────────────────────────────────

  orders table:
  ┌──────────┬────────────┬──────────────┬───────────────┬────────────┐
  │ order_id │ customer   │ cust_email   │ product       │ product_price│
  ├──────────┼────────────┼──────────────┼───────────────┼────────────┤
  │ 1        │ Alice      │ alice@co.com │ Laptop        │ $999       │
  │ 2        │ Alice      │ alice@co.com │ Mouse         │ $29        │
  │ 3        │ Bob        │ bob@co.com   │ Laptop        │ $999       │
  │ 4        │ Alice      │ alice@co.com │ Keyboard      │ $79        │
  └──────────┴────────────┴──────────────┴───────────────┴────────────┘

  Problems:
  - "Alice" and her email are stored 3 times (redundancy!)
  - "Laptop $999" is stored 2 times
  - If Alice changes her email, you must update 3 rows (risk of inconsistency)
  - If you delete order 3, you lose the fact that Bob exists


  1NF (First Normal Form): Every cell has ONE value. No repeating groups.
  ──────────────────────────────────────────────────────────────────────
  Rule: Each column holds atomic (indivisible) values.

  BAD: address = "123 Main St, NYC, NY 10001"
  GOOD: street = "123 Main St", city = "NYC", state = "NY", zip = "10001"

  BAD: phone_numbers = "555-1234, 555-5678"  (multiple values in one cell)
  GOOD: separate rows or a separate phone_numbers table


  2NF (Second Normal Form): 1NF + every non-key column depends on the WHOLE key.
  ──────────────────────────────────────────────────────────────────────
  Rule: No partial dependencies (where a column depends on only PART of
  a composite primary key).

  BAD (key is [order_id, product_id]):
  product_name depends only on product_id, NOT on order_id!
  → Move product_name to a separate products table.


  3NF (Third Normal Form): 2NF + no column depends on ANOTHER non-key column.
  ──────────────────────────────────────────────────────────────────────
  Rule: No transitive dependencies.

  BAD: orders table has customer_name AND customer_email.
  customer_email depends on customer_name (not on order_id directly).
  → Move customer info to a separate customers table.


  NORMALIZED (clean — no redundancy):
  ────────────────────────────────────────────────────────

  customers:                    products:
  ┌─────┬───────┬─────────────┐ ┌────────┬──────────┬───────┐
  │ id  │ name  │ email       │ │ id     │ name     │ price │
  ├─────┼───────┼─────────────┤ ├────────┼──────────┼───────┤
  │ 1   │ Alice │ alice@co.com│ │ 1      │ Laptop   │ $999  │
  │ 2   │ Bob   │ bob@co.com  │ │ 2      │ Mouse    │ $29   │
  └─────┴───────┴─────────────┘ │ 3      │ Keyboard │ $79   │
                                 └────────┴──────────┴───────┘
  orders:
  ┌──────────┬─────────────┬────────────┐
  │ order_id │ customer_id │ product_id │
  ├──────────┼─────────────┼────────────┤
  │ 1        │ 1           │ 1          │
  │ 2        │ 1           │ 2          │
  │ 3        │ 2           │ 1          │
  │ 4        │ 1           │ 3          │
  └──────────┴─────────────┴────────────┘

  Now: change Alice's email? Update ONE row. Laptop price? ONE row.
  No inconsistency. No redundancy.

  TRADE-OFF: Normalization means you need JOINs to reconstruct the data.
  For read-heavy systems, sometimes DENORMALIZATION (intentional duplication)
  is better for performance. This is a conscious trade-off, not a mistake.
```

### The N+1 Query Problem — The Silent Performance Killer

```
  THE PROBLEM:
  You want to display 10 blog posts with their authors.

  BAD (N+1 queries):
  ────────────────────────────────────────────────────────
  # Query 1: Get all posts
  posts = db.query("SELECT * FROM posts LIMIT 10")    # 1 query

  for post in posts:
      # Query 2-11: Get each post's author (one query per post!)
      author = db.query(f"SELECT * FROM authors WHERE id = {post.author_id}")
      print(f"{post.title} by {author.name}")

  Total: 1 + 10 = 11 queries!
  With 100 posts: 101 queries. With 1000 posts: 1001 queries!

  GOOD (JOIN — 1 query):
  ────────────────────────────────────────────────────────
  results = db.query("""
      SELECT posts.title, authors.name
      FROM posts
      JOIN authors ON posts.author_id = authors.id
      LIMIT 10
  """)

  Total: 1 query! Same result, 10x fewer database round trips.

  GOOD (Eager Loading — 2 queries):
  ────────────────────────────────────────────────────────
  posts = db.query("SELECT * FROM posts LIMIT 10")
  author_ids = [p.author_id for p in posts]
  authors = db.query("SELECT * FROM authors WHERE id IN (?)", author_ids)

  Total: 2 queries regardless of how many posts. Scales perfectly.

  HOW TO DETECT:
  - Enable query logging → see repeated queries with only the ID changing
  - ORMs are common culprits — they lazy-load by default
  - Use SQL EXPLAIN or ORM eager loading (.select_related(), .include())
```

### Pagination Strategies — How to Return Large Result Sets

```
  Returning 1 million records in one response? Bad idea.
  Pagination splits results into manageable pages.

  STRATEGY 1: OFFSET-BASED (simplest, most common)
  ────────────────────────────────────────────────────────
  GET /users?page=3&limit=20

  SQL: SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 40

  Page 1: rows 1-20   (OFFSET 0)
  Page 2: rows 21-40  (OFFSET 20)
  Page 3: rows 41-60  (OFFSET 40)

  Pros: Simple, supports "jump to page 50"
  Cons: SLOW for deep pages! OFFSET 1000000 still scans 1M rows.
        If data changes between pages, items can be skipped or duplicated.


  STRATEGY 2: CURSOR-BASED (better for large datasets)
  ────────────────────────────────────────────────────────
  GET /users?after=user_id_40&limit=20

  SQL: SELECT * FROM users WHERE id > 40 ORDER BY id LIMIT 20

  First page: returns users 1-20, cursor = "user_20"
  Next page:  GET /users?after=user_20&limit=20 → users 21-40

  Pros: Constant performance (no scanning skipped rows!)
        No skipped/duplicate items when data changes.
  Cons: Can't "jump to page 50" — must traverse sequentially.
        Requires a unique, orderable cursor field.


  STRATEGY 3: KEYSET / SEEK (best performance)
  ────────────────────────────────────────────────────────
  GET /users?created_after=2024-01-15T10:30:00&limit=20

  SQL: SELECT * FROM users
       WHERE created_at > '2024-01-15T10:30:00'
       ORDER BY created_at LIMIT 20

  Like cursor-based but uses a meaningful field (timestamp, score).
  Best for infinite scroll, time-series data, sorted feeds.

  ┌──────────────────┬──────────────────┬──────────────────┐
  │                  │ Offset           │ Cursor/Keyset     │
  ├──────────────────┼──────────────────┼──────────────────┤
  │ Deep pages       │ Slow (O(offset)) │ Fast (O(1))       │
  │ Jump to page N   │ Yes              │ No                 │
  │ Data consistency │ Items can shift  │ Stable             │
  │ Implementation   │ Simplest         │ Slightly complex   │
  │ Best for         │ Admin panels,    │ APIs, mobile apps, │
  │                  │ small datasets   │ large datasets     │
  └──────────────────┴──────────────────┴──────────────────┘
```

### Idempotency — Safe to Retry

```
  An operation is IDEMPOTENT if doing it multiple times
  has the same effect as doing it once.

  IDEMPOTENT (safe to retry):
  ────────────────────────────────────────────────────────
  GET  /users/123         → returns same user every time ✓
  PUT  /users/123 {age:30}→ sets age to 30 every time ✓
  DELETE /users/123       → user is deleted (already deleted = no-op) ✓

  NOT IDEMPOTENT (dangerous to retry):
  ────────────────────────────────────────────────────────
  POST /orders {item: laptop}  → creates a NEW order each time!
  POST /payments {amount: 100} → charges $100 each time!

  WHY IT MATTERS: Network failures happen. Requests get retried.
  If "pay $100" runs twice, the customer is charged $200!

  THE FIX: Idempotency Keys
  ────────────────────────────────────────────────────────
  Client generates a unique ID for each operation:

  POST /payments
  Idempotency-Key: "abc-123-def-456"
  Body: {amount: 100}

  Server checks: "Have I seen key abc-123-def-456 before?"
  First time: process payment, store key → return success
  Retry:      find stored key → return same response (no double charge!)

  ┌────────────────────────────────────────────────────────────┐
  │  HTTP Verb │ Idempotent? │ Safe to retry?                  │
  ├────────────┼─────────────┼─────────────────────────────────┤
  │ GET        │ Yes         │ Always                           │
  │ PUT        │ Yes         │ Always                           │
  │ DELETE     │ Yes         │ Always                           │
  │ PATCH      │ Depends     │ If setting absolute values: yes  │
  │            │             │ If incrementing: NO              │
  │ POST       │ No          │ Only with idempotency key        │
  └────────────┴─────────────┴─────────────────────────────────┘

  REAL-WORLD: Stripe uses idempotency keys for all payment APIs.
  AWS APIs are idempotent by design. This is table stakes for production APIs.
```

### Database Indexing

```
  WITHOUT INDEX:                      WITH INDEX:
  ─────────────────────               ──────────────────────────
  "Find user with email               B-Tree index on 'email':
   alice@test.com"
                                      [a-m] ──── [n-z]
  Scan EVERY row:                      /  \        /  \
  Row 1: bob@...     (no)            [a-f] [g-m] [n-s] [t-z]
  Row 2: charlie@... (no)              |
  Row 3: dave@...    (no)            alice@test.com -> Row 47
  ...
  Row 47: alice@... (found!)         Jump directly to Row 47!

  Without index: O(n) — scan all rows
  With index:    O(log n) — binary search through tree

  COSTS OF INDEXES:
  ┌────────────────────────────────────────────────────────────┐
  │ Faster reads, slower writes (must update index on insert)  │
  │ Uses additional storage (index takes disk space)           │
  │ Too many indexes = write performance degradation           │
  │                                                            │
  │ RULE: Index columns you frequently:                        │
  │  - Search on (WHERE clause)                                │
  │  - Sort by (ORDER BY)                                      │
  │  - Join on (foreign keys)                                  │
  │  - Filter on (frequently queried fields)                   │
  └────────────────────────────────────────────────────────────┘
```

### Database Sharding

```
  SHARDING = splitting data across multiple database servers

  WHY: Single database can't handle the load (reads, writes, or storage)

  EXAMPLE: Shard users by user_id
  ────────────────────────────────────────────────────────────

  User request (user_id = 12345)
       │
       ▼
  Shard Key: user_id % 4 = 12345 % 4 = 1
       │
       ├── Shard 0: user_id % 4 == 0  (users 4, 8, 12...)
       ├── Shard 1: user_id % 4 == 1  (users 1, 5, 9...) <-- HERE
       ├── Shard 2: user_id % 4 == 2  (users 2, 6, 10...)
       └── Shard 3: user_id % 4 == 3  (users 3, 7, 11...)

  SHARDING STRATEGIES:
  ┌────────────────┬─────────────────────────────────────────────┐
  │ Hash-based     │ shard = hash(key) % num_shards              │
  │                │ + Even distribution                         │
  │                │ - Hard to add/remove shards (resharding)    │
  ├────────────────┼─────────────────────────────────────────────┤
  │ Range-based    │ shard by date range, alphabet, etc.         │
  │                │ + Easy range queries                        │
  │                │ - Hot spots (all today's data hits one shard)│
  ├────────────────┼─────────────────────────────────────────────┤
  │ Consistent     │ Hash ring with virtual nodes                │
  │ Hashing        │ + Minimal redistribution when adding nodes  │
  │                │ - More complex implementation               │
  └────────────────┴─────────────────────────────────────────────┘
```

### ACID vs BASE

```
  ACID (SQL databases):              BASE (NoSQL databases):
  ─────────────────────              ──────────────────────────
  Atomicity    — all or nothing      Basically Available
  Consistency  — valid state always   Soft state
  Isolation    — concurrent txns      Eventually consistent
                 don't interfere
  Durability   — committed data
                 survives crashes

  ACID example (bank transfer):
  ────────────────────────────────────────────────────────
  BEGIN TRANSACTION
    UPDATE accounts SET balance = balance - 100 WHERE id = 1
    UPDATE accounts SET balance = balance + 100 WHERE id = 2
  COMMIT
  -- Either BOTH succeed or NEITHER does. Never half-done.

  BASE example (social media likes):
  ────────────────────────────────────────────────────────
  User likes a post. Write goes to nearest replica.
  Other replicas will sync... eventually.
  For a few seconds, different users may see different like counts.
  That's OK for likes. NOT OK for bank balances.
```

---

# PART 5: DISTRIBUTED SYSTEMS, CACHING & MESSAGING

---

## 5.1 Microservices vs Monolith

```
  MONOLITH:                           MICROSERVICES:
  ───────────────────────             ──────────────────────────

  ┌──────────────────────┐           ┌──────┐  ┌──────┐  ┌──────┐
  │    ONE BIG APP       │           │ User │  │Order │  │Notif.│
  │                      │           │ Svc  │  │ Svc  │  │ Svc  │
  │  Users  Orders       │           └──┬───┘  └──┬───┘  └──┬───┘
  │  Payments Notifs     │              │         │         │
  │  Analytics           │           ┌──┴───┐  ┌──┴───┐  ┌──┴───┐
  │                      │           │UserDB│  │OrdDB │  │MsgQ  │
  └──────────────────────┘           └──────┘  └──────┘  └──────┘

  ONE deployment unit                MANY independent services
  ONE shared database                EACH owns its own data
  ONE codebase                       SEPARATE codebases per service

  ┌──────────────────────┬───────────────────┬───────────────────┐
  │ Aspect               │ Monolith          │ Microservices     │
  ├──────────────────────┼───────────────────┼───────────────────┤
  │ Deployment           │ All or nothing    │ Independent       │
  │ Scaling              │ Scale everything  │ Scale per service │
  │ Technology           │ One stack         │ Polyglot possible │
  │ Team structure       │ One team          │ Team per service  │
  │ Complexity           │ Simple at start   │ Complex at start  │
  │ Data consistency     │ Easy (one DB)     │ Hard (distributed)│
  │ Debugging            │ Easy (one process)│ Hard (distributed)│
  │ Best for             │ Small teams,      │ Large orgs,       │
  │                      │ early startups    │ complex domains   │
  └──────────────────────┴───────────────────┴───────────────────┘

  RULE: Start with a monolith. Extract microservices when you
  have a specific reason (team scaling, independent deployment,
  different scaling needs).
```

---

## 5.2 Caching

### Simple Explanation
Caching stores frequently accessed data in fast memory so you don't have to
fetch it from a slow source every time. Like keeping your most-used tools
on your desk instead of walking to the shed each time.

```
  WITHOUT CACHE:                     WITH CACHE:
  ──────────────────────             ─────────────────────────
  Client → Server → DB               Client → Server → Cache → hit? → return!
                    (slow)                                │
                                                         miss?
                                                          ↓
                                                         DB → store in cache → return
                                                        (slow, but only first time)

  CACHE HIT RATIO:
  ────────────────────────────────────────────────────────────────
  If 90% of requests hit the cache:
  - 90% are served in 1ms (from cache)
  - 10% are served in 100ms (from DB)
  - Average: 0.9 * 1ms + 0.1 * 100ms = 10.9ms
  - Without cache: 100ms average. That's ~10x improvement!
```

### Caching Strategies

```
  ┌─────────────────────────────────────────────────────────────────┐
  │ CACHE-ASIDE (Lazy Loading) — Most Common                        │
  │ ────────────────────────────────────────                        │
  │ 1. App checks cache first                                      │
  │ 2. Cache miss? Read from DB, then write to cache                │
  │ 3. Cache hit? Return cached data                                │
  │ + Only caches what's needed    - First request is always slow   │
  │ + Cache failures don't break app  - Data can go stale           │
  ├─────────────────────────────────────────────────────────────────┤
  │ WRITE-THROUGH                                                    │
  │ ───────────────                                                 │
  │ Every write goes to BOTH cache and DB simultaneously.           │
  │ + Data always fresh in cache   - Higher write latency           │
  │ + No stale data                - Caches data that may never be read│
  ├─────────────────────────────────────────────────────────────────┤
  │ WRITE-BEHIND (Write-Back)                                        │
  │ ──────────────────────────                                      │
  │ Write to cache only. Cache asynchronously writes to DB later.   │
  │ + Very fast writes             - Risk of data loss if cache dies│
  │ + Reduces DB load              - Complex to implement           │
  └─────────────────────────────────────────────────────────────────┘
```

### Cache Eviction Policies

```
  When the cache is full, WHAT to remove?

  ┌───────────────┬──────────────────────────────────────────────┐
  │ LRU           │ Least Recently Used — remove what hasn't     │
  │               │ been accessed the longest. Most common.      │
  ├───────────────┼──────────────────────────────────────────────┤
  │ LFU           │ Least Frequently Used — remove what's        │
  │               │ accessed the fewest times overall.           │
  ├───────────────┼──────────────────────────────────────────────┤
  │ TTL           │ Time To Live — expire after N seconds.       │
  │               │ Good for data that changes periodically.     │
  ├───────────────┼──────────────────────────────────────────────┤
  │ FIFO          │ First In, First Out — oldest entry removed.  │
  └───────────────┴──────────────────────────────────────────────┘

  "There are only two hard problems in computer science:
   cache invalidation, naming things, and off-by-one errors."
```

### Where to Cache

```
  ┌──────────────────────────────────────────────────────────────┐
  │  LAYER          │ WHAT TO CACHE                               │
  ├─────────────────┼────────────────────────────────────────────┤
  │ Browser         │ Static assets (JS, CSS, images) via HTTP    │
  │                 │ cache headers (Cache-Control, ETag)         │
  ├─────────────────┼────────────────────────────────────────────┤
  │ CDN             │ Static content, media, API responses        │
  │ (CloudFront,    │ Geographically distributed, close to users │
  │  Cloudflare)    │                                            │
  ├─────────────────┼────────────────────────────────────────────┤
  │ Application     │ Frequently queried data (user sessions,    │
  │ (Redis,         │ product catalogs, configuration)           │
  │  Memcached)     │ In-memory, microsecond access              │
  ├─────────────────┼────────────────────────────────────────────┤
  │ Database        │ Query result cache, materialized views      │
  │ (built-in)      │ Transparent to application                 │
  └─────────────────┴────────────────────────────────────────────┘
```

---

## 5.3 Message Queues & Async Processing

### Simple Explanation
Instead of calling Service B directly (and waiting), Service A puts a message
in a queue. Service B picks it up whenever it's ready. Like leaving a voicemail
instead of making someone answer the phone immediately.

```
  SYNCHRONOUS (tight coupling):      ASYNCHRONOUS (loose coupling):
  ─────────────────────────          ─────────────────────────────

  Service A → Service B              Service A → [Queue] → Service B
              │
  A waits for B to respond.          A drops message and moves on.
  If B is slow, A is slow.           If B is slow, messages pile up.
  If B is down, A fails!             If B is down, messages wait in queue.
                                     B processes when ready.
```

### Message Queue Patterns

```
  POINT-TO-POINT (Queue):            PUBLISH-SUBSCRIBE (Topic):
  ─────────────────────────          ─────────────────────────────

  Producer → [Queue] → Consumer      Publisher → [Topic] → Subscriber A
                                                         → Subscriber B
  One message, ONE consumer.                             → Subscriber C
  (work distribution)
                                     One message, MANY consumers.
                                     (event broadcasting)

  Example: processing orders          Example: "order placed" event
  (one worker handles each order)     (email, inventory, analytics ALL react)
```

### Popular Message Systems

```
  ┌──────────────┬────────────────────────────────────────────────────┐
  │ Apache Kafka │ Distributed log. Persistent. Ordered. Replayable. │
  │              │ Best for: event streaming, high throughput,        │
  │              │ data pipelines. Millions of msgs/sec.              │
  ├──────────────┼────────────────────────────────────────────────────┤
  │ RabbitMQ     │ Traditional message broker. Feature-rich routing. │
  │              │ Best for: task queues, complex routing,            │
  │              │ request-reply patterns.                            │
  ├──────────────┼────────────────────────────────────────────────────┤
  │ Amazon SQS   │ Managed queue service. Simple, reliable.          │
  │              │ Best for: AWS workloads, decoupling services,     │
  │              │ no infrastructure management.                     │
  ├──────────────┼────────────────────────────────────────────────────┤
  │ Redis Streams│ Lightweight, fast. In-memory.                      │
  │              │ Best for: real-time use cases, simple event        │
  │              │ streaming when you already have Redis.             │
  └──────────────┴────────────────────────────────────────────────────┘
```

---

## 5.4 API Gateway — The Front Door

```
  An API Gateway is a single entry point for all client requests.
  It sits between clients and your microservices.

  WITHOUT GATEWAY:                   WITH GATEWAY:
  ──────────────────────             ──────────────────────
  
  Client knows about every service:  Client knows ONE endpoint:
  
  Client → User Service              Client → [API Gateway] → User Service
  Client → Order Service                                    → Order Service
  Client → Payment Service                                  → Payment Service
  Client → Notification Service                             → Notification Service
  
  Client must handle:                Gateway handles:
  - Service discovery                - Routing to correct service
  - Auth for each service            - Authentication (once!)
  - Rate limiting itself             - Rate limiting
  - Different protocols              - Protocol translation
  - SSL for each service             - SSL termination

  ┌──────────────────────────────────────────────────────────────┐
  │                    API GATEWAY                                │
  │                                                              │
  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐│
  │  │ Auth    │  │ Rate     │  │ Routing  │  │ Response     ││
  │  │ Check   │→ │ Limiting │→ │ (which   │→ │ Aggregation  ││
  │  │         │  │          │  │  service)│  │ (combine     ││
  │  │ Valid   │  │ Under    │  │          │  │  responses)  ││
  │  │ token?  │  │ limit?   │  │ /users→  │  │              ││
  │  └─────────┘  └──────────┘  │ UserSvc  │  └──────────────┘│
  │                             └──────────┘                    │
  └──────────────────────────────────────────────────────────────┘

  POPULAR API GATEWAYS:
  ┌──────────────┬────────────────────────────────────────────┐
  │ Kong         │ Open-source, plugin-based, high performance│
  │ AWS API GW   │ Managed, integrates with Lambda/ECS        │
  │ Nginx        │ Reverse proxy + API gateway capabilities   │
  │ Envoy        │ Service mesh sidecar, used in Istio        │
  │ Traefik      │ Cloud-native, auto-discovery               │
  └──────────────┴────────────────────────────────────────────┘
```

---

## 5.5 Rate Limiting — Protecting Your Services

```
  Rate limiting controls how many requests a client can make
  in a given time window. Without it:
  - One user can overload your entire system
  - Bots can scrape all your data
  - DDoS attacks bring everything down

  COMMON LIMITS:
  - 100 requests per minute per user
  - 1000 requests per hour per API key
  - 10 login attempts per minute per IP
```

### Rate Limiting Algorithms

```
  TOKEN BUCKET (most common):
  ────────────────────────────────────────────────────────
  Imagine a bucket that holds tokens.
  - Tokens are added at a steady rate (e.g., 10/second)
  - Each request takes 1 token
  - If bucket is empty → request rejected (429 Too Many Requests)
  - Bucket has a max size (allows bursts)

  ┌────────────────────────────────┐
  │  BUCKET (max 10 tokens)        │
  │  ██████████                    │  ← full (10 tokens)
  │                                │
  │  3 requests come in...         │
  │  ███████                       │  ← 7 tokens left
  │                                │
  │  Wait 1 second (10 tokens/sec) │
  │  ██████████                    │  ← refilled to 10
  └────────────────────────────────┘

  Pros: Allows short bursts. Simple. Memory-efficient.
  Used by: AWS, Stripe, most production systems.


  SLIDING WINDOW LOG:
  ────────────────────────────────────────────────────────
  Keep a log of every request timestamp.
  Count requests in the last N seconds.
  If count > limit → reject.

  Window: last 60 seconds, limit: 5 requests
  
  Timestamps: [0:01, 0:15, 0:30, 0:45, 0:50]  → 5 requests, at limit
  New request at 0:55 → 6 requests in window → REJECTED!
  New request at 1:02 → 0:01 falls out of window → 5 requests → ALLOWED

  Pros: Very accurate. Cons: Stores every timestamp (memory heavy).


  FIXED WINDOW COUNTER:
  ────────────────────────────────────────────────────────
  Divide time into fixed windows. Count requests per window.

  Window: 1 minute, limit: 100 requests
  
  12:00:00 - 12:00:59 → counter = 87 (under limit)
  12:01:00 - 12:01:59 → counter resets to 0

  Pros: Memory-efficient (one counter per window)
  Cons: Burst at window boundary (99 at 12:00:59 + 99 at 12:01:00 = 198!)


  SLIDING WINDOW COUNTER (best balance):
  ────────────────────────────────────────────────────────
  Combines fixed window + weighted overlap.
  
  Current window count × weight + Previous window count × (1 - weight)
  where weight = how far into the current window we are.

  Pros: Accurate like log, memory-efficient like counter.
  Used by: Redis-based rate limiters, Cloudflare.
```

---

## 5.6 Saga Pattern — Distributed Transactions Across Services

```
  PROBLEM: In microservices, a single business operation spans multiple services.
  You CAN'T use a traditional database transaction across services.

  EXAMPLE: Placing an order involves:
  1. Order Service → create order
  2. Payment Service → charge customer
  3. Inventory Service → reserve items
  4. Notification Service → send confirmation

  What if Payment succeeds but Inventory fails? 
  You need to UNDO the payment! But it's in a different service/database.
```

### Choreography Saga — Events Trigger Next Steps

```
  Each service listens for events and acts independently.
  No central coordinator.

  ┌──────────┐   OrderCreated   ┌──────────┐  PaymentDone  ┌───────────┐
  │  Order   │ ──────────────> │ Payment  │ ───────────> │ Inventory │
  │ Service  │                  │ Service  │               │ Service   │
  └──────────┘                  └──────────┘               └───────────┘
       ▲                             │                          │
       │        PaymentFailed        │    InventoryReserved     │
       └─────────────────────────────┘          │               │
       (cancel order)                           ▼               │
                                         ┌──────────┐          │
                                         │  Notify  │ <────────┘
                                         │ Service  │
                                         └──────────┘

  If Inventory fails → emits InventoryFailed event
  → Payment Service hears it → refunds payment
  → Order Service hears it → cancels order

  Pros: Simple, loosely coupled, no single point of failure
  Cons: Hard to track the overall flow, complex failure handling
```

### Orchestration Saga — Central Coordinator

```
  A "Saga Orchestrator" tells each service what to do and handles failures.

  ┌──────────────────────────────────────────────────┐
  │              SAGA ORCHESTRATOR                     │
  │                                                    │
  │  Step 1: Call Order Service → create_order()       │
  │  Step 2: Call Payment Service → charge()           │
  │  Step 3: Call Inventory Service → reserve()        │
  │  Step 4: Call Notification Service → notify()      │
  │                                                    │
  │  If Step 3 fails:                                  │
  │    Compensate Step 2: Payment.refund()             │
  │    Compensate Step 1: Order.cancel()               │
  └──────────────────────────────────────────────────┘

  Each step has a COMPENSATING ACTION (undo):
  ┌──────────────────┬──────────────────────────────┐
  │ Action           │ Compensation (undo)           │
  ├──────────────────┼──────────────────────────────┤
  │ create_order()   │ cancel_order()                │
  │ charge()         │ refund()                      │
  │ reserve_stock()  │ release_stock()               │
  │ send_email()     │ (no undo — best effort)       │
  └──────────────────┴──────────────────────────────┘

  Pros: Clear flow, easy to track, centralized error handling
  Cons: Orchestrator is a single point of failure, more coupling
```

---

## 5.7 Consistent Hashing — Distributing Data Evenly

```
  PROBLEM: You have N cache servers. How do you decide which server
  stores which data?

  NAIVE APPROACH: server = hash(key) % N
  ────────────────────────────────────────────────────────
  hash("user_123") % 3 = 1 → Server 1
  hash("user_456") % 3 = 0 → Server 0
  hash("user_789") % 3 = 2 → Server 2

  Works great... until you ADD or REMOVE a server!
  hash("user_123") % 4 = 3 → NOW it goes to Server 3!
  
  Almost ALL keys get reassigned → massive cache miss storm → DB overload!

  CONSISTENT HASHING: Only ~1/N of keys move when a server changes.
  ────────────────────────────────────────────────────────

  Imagine a CIRCLE (hash ring) from 0 to 2^32:

            0
           ╱ ╲
         ╱     ╲
       S1         S2          Servers are placed on the ring
       │           │          at their hash positions.
       │           │
       S3─────────╱           Each KEY goes to the NEXT server
            ╲ ╱               clockwise on the ring.
            2^32

  Key "user_123" → hash to position 42000 → walk clockwise → hits S2
  Key "user_456" → hash to position 98000 → walk clockwise → hits S3

  ADD Server S4 between S1 and S2:
  Only keys between S1 and S4 move to S4. Everything else stays!
  That's ~1/4 of keys, not all of them.

  REMOVE Server S2:
  Only S2's keys move to S3 (next clockwise). Everything else stays!

  VIRTUAL NODES (solving uneven distribution):
  ────────────────────────────────────────────────────────
  3 physical servers → 300 virtual nodes (100 each)
  Each physical server gets 100 positions on the ring.
  This ensures even data distribution even with few servers.

  USED BY: DynamoDB, Cassandra, Memcached, CDNs, load balancers.
```

---

## 5.8 Load Balancing

```
  LOAD BALANCER distributes incoming traffic across multiple servers.

  Clients
    │  │  │  │  │
    ▼  ▼  ▼  ▼  ▼
  ┌──────────────────┐
  │  LOAD BALANCER   │
  └──────────────────┘
    │     │     │
    ▼     ▼     ▼
  [S1]  [S2]  [S3]

  ALGORITHMS:
  ┌───────────────────┬──────────────────────────────────────────┐
  │ Round Robin       │ Rotate through servers in order (1,2,3,1)│
  │                   │ Simple. Assumes equal server capacity.   │
  ├───────────────────┼──────────────────────────────────────────┤
  │ Weighted RR       │ Servers with more capacity get more      │
  │                   │ traffic. S1(3x) gets 3x the requests.   │
  ├───────────────────┼──────────────────────────────────────────┤
  │ Least Connections │ Send to server with fewest active conns. │
  │                   │ Good when requests vary in duration.     │
  ├───────────────────┼──────────────────────────────────────────┤
  │ IP Hash           │ Hash client IP to always route to same   │
  │                   │ server. Ensures session stickiness.      │
  ├───────────────────┼──────────────────────────────────────────┤
  │ Consistent Hash   │ Minimizes redistribution when servers    │
  │                   │ added/removed. Used in distributed caches│
  └───────────────────┴──────────────────────────────────────────┘

  LAYERS OF LOAD BALANCING:
  ─────────────────────────────────────────────────────────────
  L4 (Transport) — routes based on IP/port. Faster, less smart.
  L7 (Application) — routes based on URL, headers, cookies.
                     Smarter, can do content-based routing.
```

---

## 5.9 Resilience Patterns

### Circuit Breaker

```
  PROBLEM: Service B is down. Service A keeps calling it,
  waiting for timeout every time. Cascade failure!

  CIRCUIT BREAKER (like an electrical circuit breaker):
  ─────────────────────────────────────────────────────

  ┌────────┐     calls     ┌────────┐      calls    ┌────────┐
  │Service │ ──────────>   │Circuit │ ──────────>   │Service │
  │   A    │               │Breaker │               │   B    │
  └────────┘               └────────┘               └────────┘

  States:
  ┌──────────────────────────────────────────────────────────┐
  │ CLOSED (normal)                                          │
  │   All requests pass through to Service B.                │
  │   If failures exceed threshold → switch to OPEN          │
  ├──────────────────────────────────────────────────────────┤
  │ OPEN (protecting)                                        │
  │   All requests IMMEDIATELY FAIL (don't call B).          │
  │   Return fallback response or error instantly.           │
  │   After timeout → switch to HALF-OPEN                    │
  ├──────────────────────────────────────────────────────────┤
  │ HALF-OPEN (testing)                                      │
  │   Allow ONE request through to test if B is recovered.   │
  │   If success → switch to CLOSED                          │
  │   If failure → switch back to OPEN                       │
  └──────────────────────────────────────────────────────────┘

  CLOSED ──(failures > threshold)──> OPEN ──(timeout)──> HALF-OPEN
     ^                                                       │
     └──────────────────(success)────────────────────────────┘
```

### Retry with Exponential Backoff

```
  When a request fails, don't just retry immediately.
  Wait longer between each retry to avoid overwhelming the server.

  Attempt 1: fail → wait 1 second
  Attempt 2: fail → wait 2 seconds
  Attempt 3: fail → wait 4 seconds
  Attempt 4: fail → wait 8 seconds
  Attempt 5: fail → give up, return error

  Add JITTER (random delay) to prevent thundering herd:
  All clients retrying at exactly the same time = worse than the original problem!

  wait_time = min(base * 2^attempt + random(0, 1), max_wait)
```

---

# PART 6: ARCHITECTURE PATTERNS

---

## 6.1 Layered Architecture

```
  The most common architecture. Separate code into layers,
  each with a specific responsibility.

  ┌────────────────────────────────────────────┐
  │           PRESENTATION LAYER               │  UI, API controllers
  │  (HTTP handlers, serialization, validation)│
  ├────────────────────────────────────────────┤
  │           BUSINESS LOGIC LAYER             │  Core rules, workflows
  │  (Services, use cases, domain logic)       │
  ├────────────────────────────────────────────┤
  │           DATA ACCESS LAYER                │  Repositories, ORMs
  │  (Database queries, external API calls)    │
  ├────────────────────────────────────────────┤
  │           INFRASTRUCTURE LAYER             │  Frameworks, drivers
  │  (Database, message queues, file system)   │
  └────────────────────────────────────────────┘

  RULE: Dependencies flow DOWNWARD only.
  Presentation depends on Business Logic.
  Business Logic depends on Data Access.
  NEVER the reverse.
```

---

## 6.2 Clean / Hexagonal Architecture

```
  CORE IDEA: Business logic is at the CENTER and depends on NOTHING.
  External concerns (DB, UI, APIs) are on the OUTSIDE and are pluggable.

  ┌──────────────────────────────────────────────────────────────┐
  │                    EXTERNAL WORLD                             │
  │  ┌─────────────────────────────────────────────────────────┐ │
  │  │               ADAPTERS (Ports & Adapters)                │ │
  │  │  ┌──────────────────────────────────────────────────┐   │ │
  │  │  │            APPLICATION SERVICES                   │   │ │
  │  │  │  ┌────────────────────────────────────────────┐  │   │ │
  │  │  │  │                                            │  │   │ │
  │  │  │  │         DOMAIN / BUSINESS LOGIC            │  │   │ │
  │  │  │  │         (Entities, Value Objects,          │  │   │ │
  │  │  │  │          Business Rules)                   │  │   │ │
  │  │  │  │                                            │  │   │ │
  │  │  │  │   NO dependencies on frameworks, DB, UI    │  │   │ │
  │  │  │  └────────────────────────────────────────────┘  │   │ │
  │  │  └──────────────────────────────────────────────────┘   │ │
  │  │                                                         │ │
  │  │  REST API adapter    PostgreSQL adapter    Email adapter│ │
  │  └─────────────────────────────────────────────────────────┘ │
  │  Web UI    CLI    Message Queue    Third-party APIs          │
  └──────────────────────────────────────────────────────────────┘

  The domain NEVER imports Flask, Django, SQLAlchemy, etc.
  It defines INTERFACES (ports). Adapters implement them.

  Want to switch from PostgreSQL to MongoDB?
  Write a new adapter. Domain code stays untouched.
```

---

## 6.3 Domain-Driven Design (DDD) — Modeling Complex Business Logic

DDD is a way of designing software that focuses on the **business domain** — the real-world problem you're solving. The code should mirror how the business actually works.

### Core DDD Concepts

```
  UBIQUITOUS LANGUAGE:
  ────────────────────────────────────────────────────────
  Everyone (developers, product managers, business experts)
  uses the SAME words to describe the same things.

  BAD: Developer says "User entity with order_id FK"
       Business says "Customer places a purchase"
       → Confusion! Translation errors!

  GOOD: Everyone says "Customer places an Order containing Order Items."
       Code uses these EXACT same terms:
       class Customer, class Order, class OrderItem

  The code IS the documentation of the business rules.
```

```
  BOUNDED CONTEXT:
  ────────────────────────────────────────────────────────
  A BOUNDARY within which a specific model and language apply.
  The same word can mean different things in different contexts.

  "Account" in Banking Context → bank account with balance
  "Account" in Auth Context → login credentials, username, password
  "Account" in Marketing Context → customer profile with preferences

  Each bounded context has its own models, its own database,
  and its own team. They communicate through well-defined interfaces.

  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
  │  SALES CONTEXT    │  │  SHIPPING CONTEXT │  │  BILLING CONTEXT │
  │                   │  │                   │  │                  │
  │  Customer         │  │  Recipient        │  │  PayingCustomer  │
  │  Order            │  │  Shipment         │  │  Invoice         │
  │  Product          │  │  Package          │  │  Payment         │
  │                   │  │                   │  │                  │
  │  own database     │  │  own database     │  │  own database    │
  └──────────────────┘  └──────────────────┘  └──────────────────┘
         │                      │                      │
         └──────────── communicate via events/APIs ────┘

  In microservices, each bounded context typically = one microservice.
```

### DDD Building Blocks

```
  ENTITY:
  ────────────────────────────────────────────────────────
  An object with a unique IDENTITY that persists over time.
  Two entities with the same data but different IDs are DIFFERENT.

  Example: User(id=1, name="Alice") ≠ User(id=2, name="Alice")
  Even though names match, they're different users.

  VALUE OBJECT:
  ────────────────────────────────────────────────────────
  An object defined by its ATTRIBUTES, not by identity.
  Two value objects with the same data ARE the same.

  Example: Money(amount=10, currency="USD") = Money(amount=10, currency="USD")
  Address(street="123 Main", city="NYC") = Address(street="123 Main", city="NYC")

  Value objects are IMMUTABLE. To change, create a new one.

  AGGREGATE:
  ────────────────────────────────────────────────────────
  A cluster of entities and value objects treated as a single unit.
  Has one AGGREGATE ROOT — the entry point for all changes.

  Example:
  Order (aggregate root)
    ├── OrderItem (entity)
    ├── OrderItem (entity)
    └── ShippingAddress (value object)

  Rules:
  - External code can ONLY reference the aggregate root (Order)
  - Never reach inside to modify an OrderItem directly
  - All changes go through Order: order.add_item(), order.cancel()
  - One transaction = one aggregate. Never span aggregates in one transaction.

  DOMAIN EVENT:
  ────────────────────────────────────────────────────────
  Something important that happened in the domain.
  Past tense: OrderPlaced, PaymentReceived, ItemShipped.

  class OrderPlaced:
      order_id: str
      customer_id: str
      total: Money
      placed_at: datetime

  Domain events trigger reactions in other parts of the system:
  OrderPlaced → Inventory reserves stock
  OrderPlaced → Email sends confirmation
  OrderPlaced → Analytics logs the sale
```

```
  WHEN TO USE DDD:
  ┌─────────────────────────────────────────────────────────────┐
  │ USE DDD when:                                                │
  │ ✓ Business logic is complex (many rules, edge cases)         │
  │ ✓ Domain experts are available to collaborate                │
  │ ✓ The project will be maintained for years                   │
  │ ✓ Multiple teams work on the same system                     │
  │                                                              │
  │ SKIP DDD when:                                               │
  │ ✗ Simple CRUD app (just forms and database)                  │
  │ ✗ No domain expert access                                    │
  │ ✗ Small team, short project                                  │
  │ ✗ Prototype / MVP                                            │
  └─────────────────────────────────────────────────────────────┘
```

---

## 6.4 Event Sourcing & CQRS

### Event Sourcing

```
  TRADITIONAL: Store the CURRENT state.
  EVENT SOURCING: Store every EVENT that led to the current state.

  TRADITIONAL (bank account):
  ─────────────────────────
  account_balance = $500    <- just the final number

  EVENT SOURCED (bank account):
  ─────────────────────────
  Event 1: AccountOpened(amount=$0)
  Event 2: MoneyDeposited(amount=$1000)
  Event 3: MoneyWithdrawn(amount=$200)
  Event 4: MoneyWithdrawn(amount=$300)
  Current balance: $0 + $1000 - $200 - $300 = $500

  WHY? Full audit trail. Can rebuild state at any point in time.
  Can replay events to fix bugs or migrate to new systems.

  USED IN: Banking, accounting, e-commerce orders, Git (commits are events!)
```

### CQRS (Command Query Responsibility Segregation)

```
  TRADITIONAL: Same model for reads and writes.
  CQRS: Separate models for reads (queries) and writes (commands).

  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │  Commands (writes)          Queries (reads)              │
  │       │                          │                       │
  │       ▼                          ▼                       │
  │  ┌──────────┐             ┌──────────────┐              │
  │  │  Write   │   events    │   Read       │              │
  │  │  Model   │ ──────────> │   Model      │              │
  │  │(normalize│  (sync/     │(denormalized,│              │
  │  │ for      │   async)    │ optimized    │              │
  │  │ integrity│             │ for queries) │              │
  │  └──────────┘             └──────────────┘              │
  │       │                          │                       │
  │       ▼                          ▼                       │
  │  Write DB                   Read DB / Cache              │
  │  (source of truth)         (optimized views)             │
  │                                                          │
  └──────────────────────────────────────────────────────────┘

  WHY? Reads and writes have different optimization needs.
  Reads: denormalized, fast, cached.
  Writes: normalized, validated, consistent.
```

---

# PART 7: SECURITY FUNDAMENTALS

---

## 7.1 Authentication vs Authorization

```
  AUTHENTICATION (AuthN)             AUTHORIZATION (AuthZ)
  ──────────────────────             ──────────────────────
  "WHO are you?"                     "WHAT are you allowed to do?"

  Proving your identity              Checking your permissions
  (username + password,              (admin can delete, user
   fingerprint, token)                can only read)

  Happens FIRST                      Happens AFTER authentication

  Example: Logging into Gmail        Example: Can you access the
  with your password                 "Admin Settings" page?
```

### JWT (JSON Web Token)

```
  JWT = a self-contained token that carries user info.
  The server doesn't need to store session state!

  Structure:
  ───────────────────────────────────────────────────
  HEADER.PAYLOAD.SIGNATURE

  Header:  {"alg": "HS256", "typ": "JWT"}
  Payload: {"user_id": 123, "role": "admin", "exp": 1700000000}
  Signature: HMAC-SHA256(header + "." + payload, secret_key)

  HOW IT WORKS:
  ┌──────────┐  1. Login (username, password)  ┌──────────┐
  │          │ ──────────────────────────────> │          │
  │  Client  │  2. Returns JWT token           │  Server  │
  │          │ <────────────────────────────── │          │
  │          │  3. Every request: sends JWT     │          │
  │          │    in Authorization header       │          │
  │          │ ──────────────────────────────> │          │
  │          │  4. Server validates JWT sig     │          │
  │          │    (no DB lookup needed!)        │          │
  └──────────┘                                 └──────────┘

  PROS: Stateless, scalable, works across services
  CONS: Can't revoke (until expiry), payload is NOT encrypted (just encoded)
```

### OAuth 2.0 — Delegated Authorization

```
  "Let this app access my Google Drive WITHOUT giving it my Google password."

  ┌──────────┐     1. "I want to access       ┌──────────┐
  │          │        user's photos"           │          │
  │ Your App │ ──────────────────────────────> │  Google  │
  │ (Client) │     2. Google asks user:        │ (Auth    │
  │          │        "Allow this app?"        │  Server) │
  │          │                                 │          │
  │          │     3. User clicks "Allow"      │          │
  │          │                                 │          │
  │          │     4. Google gives access_token │          │
  │          │ <────────────────────────────── │          │
  │          │                                 │          │
  │          │     5. Use token to get photos  │  Google  │
  │          │ ──────────────────────────────> │  Photos  │
  │          │     6. Here are the photos      │  (Resource│
  │          │ <────────────────────────────── │  Server) │
  └──────────┘                                 └──────────┘

  Your app NEVER sees the user's Google password.
  The token has LIMITED scope (only photos, not email).
  The token EXPIRES (short-lived).
```

---

## 7.2 Common Security Threats (OWASP Top 10)

```
  ┌─────────────────────────────────────────────────────────────────┐
  │  THREAT                  │ WHAT IT IS           │ PREVENTION     │
  ├──────────────────────────┼──────────────────────┼────────────────┤
  │ SQL Injection            │ Malicious SQL in     │ Parameterized  │
  │                          │ user input           │ queries, ORMs  │
  ├──────────────────────────┼──────────────────────┼────────────────┤
  │ XSS (Cross-Site         │ Injecting scripts    │ Escape output, │
  │  Scripting)              │ into web pages       │ CSP headers    │
  ├──────────────────────────┼──────────────────────┼────────────────┤
  │ Broken Authentication   │ Weak passwords,      │ MFA, rate      │
  │                          │ session hijacking    │ limiting, bcrypt│
  ├──────────────────────────┼──────────────────────┼────────────────┤
  │ Broken Access Control   │ Users accessing       │ RBAC, check    │
  │                          │ unauthorized data    │ permissions    │
  ├──────────────────────────┼──────────────────────┼────────────────┤
  │ CSRF (Cross-Site        │ Forged requests      │ CSRF tokens,   │
  │  Request Forgery)        │ from other sites     │ SameSite cookies│
  ├──────────────────────────┼──────────────────────┼────────────────┤
  │ Sensitive Data Exposure │ Unencrypted PII      │ HTTPS, encrypt │
  │                          │ in transit/at rest   │ at rest, mask  │
  └──────────────────────────┴──────────────────────┴────────────────┘

  SQL INJECTION EXAMPLE:
  ─────────────────────────────────────────────────────
  // BAD (Java):
  String query = "SELECT * FROM users WHERE name = '" + userInput + "'";
  // userInput = "'; DROP TABLE users; --"
  // Result: your entire table is deleted!

  // GOOD (Java — PreparedStatement):
  PreparedStatement stmt = conn.prepareStatement(
      "SELECT * FROM users WHERE name = ?");
  stmt.setString(1, userInput);
  ResultSet rs = stmt.executeQuery();
  // Result: treated as data, not code. Safe!
```

---

# PART 8: JAVA CONCURRENCY ESSENTIALS (Google Interview Must-Know)

---

## 8.1 Why Concurrency Matters at Google

```
  Google serves BILLIONS of requests per day. Every service must handle
  thousands of concurrent connections. Understanding concurrency is
  NON-NEGOTIABLE for a Google Senior Engineer interview.
```

## 8.2 Thread Safety Fundamentals

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

## 8.3 Common Concurrency Patterns

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

## 8.4 Concurrency Pitfalls to Know

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

# PART 9: GOOGLE SYSTEM DESIGN INTERVIEW TIPS

---

## 9.1 What Google Looks For in Senior Engineers

```
  Google Senior Engineer (L5) interviews focus on:

  ┌──────────────────────────────────────────────────────────────────┐
  │ 1. SCALE THINKING                                                 │
  │    "How does this work with 1 billion users?"                     │
  │    Don't design for 1000 users. Design for Google scale.          │
  │                                                                   │
  │ 2. TRADE-OFF ANALYSIS                                             │
  │    Every choice has pros and cons. Discuss them explicitly.        │
  │    "I chose AP over CP because for a social feed, slightly stale  │
  │     data is acceptable but downtime isn't."                       │
  │                                                                   │
  │ 3. DEPTH + BREADTH                                                │
  │    Know the full stack: from DNS → Load Balancer → App → DB.      │
  │    But also go DEEP on any component when asked.                  │
  │                                                                   │
  │ 4. COMMUNICATION                                                  │
  │    Think out loud. Draw diagrams. Ask questions.                   │
  │    A silent candidate who writes a perfect design LOSES to a      │
  │    communicative candidate who explains their reasoning.           │
  │                                                                   │
  │ 5. GOOGLE TECH AWARENESS                                          │
  │    Know Google's systems (don't name-drop, but show you understand│
  │    the concepts behind them):                                      │
  │    - Bigtable → wide-column NoSQL store                            │
  │    - Spanner → globally distributed SQL with strong consistency    │
  │    - MapReduce → batch processing at scale                         │
  │    - Pub/Sub → managed message queue                               │
  │    - Borg/Kubernetes → container orchestration                     │
  │    - Protocol Buffers → binary serialization (like gRPC)           │
  │    - Colossus/GFS → distributed file system                        │
  └──────────────────────────────────────────────────────────────────┘
```

---

# PART 10: SYSTEM DESIGN INTERVIEW FRAMEWORK

---

## The Step-by-Step Approach

```
  ┌─────────────────────────────────────────────────────────────────┐
  │  SYSTEM DESIGN INTERVIEW: 4 STEPS (45 minutes)                  │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                 │
  │  STEP 1: REQUIREMENTS (5 min)                                   │
  │  ─────────────────────────────                                  │
  │  Ask clarifying questions. Don't assume!                        │
  │  - Functional: What features? What can users do?                │
  │  - Non-functional: Scale? Latency? Availability?                │
  │  - Constraints: DAU? QPS? Storage? Read vs write heavy?         │
  │                                                                 │
  │  STEP 2: HIGH-LEVEL DESIGN (15 min)                             │
  │  ──────────────────────────────────                             │
  │  Draw the big boxes and arrows.                                 │
  │  - Client → Load Balancer → App Servers → Database              │
  │  - Identify core components (services, databases, caches)       │
  │  - Define APIs between components                               │
  │                                                                 │
  │  STEP 3: DEEP DIVE (20 min)                                     │
  │  ───────────────────────────                                    │
  │  Interviewer picks 1-2 components to dig into.                  │
  │  - Data model / schema design                                   │
  │  - Scaling bottlenecks and solutions                            │
  │  - Algorithm details (ranking, search, matching)                │
  │  - Caching strategy, database choice, consistency               │
  │                                                                 │
  │  STEP 4: WRAP UP (5 min)                                        │
  │  ────────────────────────                                       │
  │  - Summarize design decisions and tradeoffs                     │
  │  - Mention monitoring, alerting, deployment                     │
  │  - Discuss failure scenarios and mitigation                     │
  │  - Suggest future improvements                                  │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘
```

### Common System Design Problems

```
  ┌───────────────────────┬────────────────────────────────────────┐
  │ Problem               │ Key Components to Discuss               │
  ├───────────────────────┼────────────────────────────────────────┤
  │ URL Shortener         │ Hashing, base62, read-heavy cache      │
  │ (TinyURL)             │ 301 vs 302 redirect, analytics         │
  ├───────────────────────┼────────────────────────────────────────┤
  │ Twitter / News Feed   │ Fan-out on write vs read, timeline     │
  │                       │ service, caching, celebrity problem    │
  ├───────────────────────┼────────────────────────────────────────┤
  │ Chat System           │ WebSockets, presence service,          │
  │ (WhatsApp)            │ message storage, delivery receipts     │
  ├───────────────────────┼────────────────────────────────────────┤
  │ Web Crawler           │ BFS/DFS, URL frontier, politeness,     │
  │                       │ dedup (bloom filter), robots.txt       │
  ├───────────────────────┼────────────────────────────────────────┤
  │ Notification System   │ Push vs pull, delivery guarantees,     │
  │                       │ rate limiting, priority queues         │
  ├───────────────────────┼────────────────────────────────────────┤
  │ Rate Limiter          │ Token bucket, sliding window,          │
  │                       │ distributed Redis counter              │
  ├───────────────────────┼────────────────────────────────────────┤
  │ Distributed Cache     │ Consistent hashing, replication,       │
  │                       │ eviction policies, hot keys            │
  ├───────────────────────┼────────────────────────────────────────┤
  │ Search Autocomplete   │ Trie data structure, ranking,          │
  │                       │ caching popular queries                │
  └───────────────────────┴────────────────────────────────────────┘
```

---

# PART 11: REVIEW QUESTIONS — TEST YOUR UNDERSTANDING

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

## System Design

9. Explain CAP theorem. Your system is an e-commerce cart. Do you choose CP or AP? Why?
10. You have a service handling 10,000 QPS with 50ms average latency. You need to get to 100,000 QPS. What strategies would you consider?
11. Explain the difference between horizontal and vertical scaling. At what point do you NEED horizontal scaling?
12. Your database has 1 billion rows and reads are slowing down. Walk through your troubleshooting steps.

## Database & API

13. When would you choose NoSQL over SQL? Give three specific scenarios.
14. Explain database sharding. What are the challenges?
15. What's the difference between REST, GraphQL, and gRPC? When would you use each?

## Distributed Systems

16. What is a Circuit Breaker? Draw the state diagram.
17. Explain eventual consistency. Give an example where it's acceptable and one where it's not.
18. Compare cache-aside and write-through caching. When would you use each?

## Architecture

19. Explain Clean Architecture in three sentences. What is the Dependency Rule?
20. What is CQRS and when would you use it? What problems does it solve?

<details>
<summary>Selected Answers</summary>

**Q4:** Dependency Inversion means high-level modules depend on abstractions (interfaces), not concrete implementations. This makes testing easier because you can inject mock implementations. Instead of `OrderService` depending on `MySQLDatabase`, it depends on a `Database` interface. In tests, you inject `MockDatabase` — no real DB needed.

**Q7:** Decorator Pattern — wrap the API client in layers: `LoggingDecorator(CachingDecorator(RateLimitDecorator(realClient)))`. Each decorator adds behavior without modifying the original. Alternatively, use Proxy pattern for each concern.

**Q9:** AP for a shopping cart. If there's a network partition, you'd rather let the customer keep adding items (availability) and reconcile any inconsistencies later, than show them an error page. A temporarily stale cart is better than a broken checkout experience.

**Q10:** Strategies for 10x QPS: (1) Add caching layer (Redis) for frequent reads, (2) Horizontal scaling with load balancer, (3) Database read replicas, (4) CDN for static content, (5) Async processing for non-critical work, (6) Connection pooling, (7) Consider sharding if DB is the bottleneck.

**Q12:** Troubleshooting slow reads on 1B rows: (1) Check EXPLAIN plan for slow queries, (2) Add missing indexes on WHERE/JOIN columns, (3) Check for N+1 query problems, (4) Add read replicas for read-heavy workloads, (5) Implement caching for hot data, (6) Consider partitioning/sharding the table, (7) Archive old data to reduce table size.

**Q19:** Clean Architecture organizes code in concentric layers where the innermost layer (domain/business logic) has zero external dependencies. The outer layers (UI, database, frameworks) depend inward. The Dependency Rule: source code dependencies must point INWARD — nothing in an inner circle can know about anything in an outer circle.

</details>

---

## Key Takeaways

```
╔══════════════════════════════════════════════════════════════════════╗
║  DESIGN FUNDAMENTALS CHEAT SHEET                                     ║
║  ────────────────────────────────────────────────────────────────   ║
║                                                                      ║
║  PRINCIPLES:                                                         ║
║  SOLID = SRP + OCP + LSP + ISP + DIP                                ║
║  DRY = don't duplicate knowledge; KISS = simplest solution wins     ║
║  YAGNI = don't build it until you need it                           ║
║  Composition over Inheritance = prefer HAS-A over IS-A              ║
║  High Cohesion + Low Coupling = the ultimate design goal            ║
║                                                                      ║
║  PATTERNS:                                                           ║
║  Factory = create without knowing exact type                        ║
║  Observer = notify many when one changes                            ║
║  Strategy = swap algorithms at runtime                              ║
║  Decorator = add behavior without modifying original                ║
║  Adapter = make incompatible interfaces work together               ║
║                                                                      ║
║  SYSTEM DESIGN:                                                      ║
║  Scale: start vertical, go horizontal when needed                   ║
║  CAP: in practice, choose CP or AP (P is mandatory)                 ║
║  Latency: measure p50/p95/p99, not averages                        ║
║  Cache: cache-aside is most common; LRU for eviction                ║
║  Queues: decouple services; Kafka for streaming, SQS for tasks     ║
║  DB: SQL for consistency + joins; NoSQL for scale + flexibility     ║
║  Normalize DB to 3NF, denormalize intentionally for read speed     ║
║  APIs: make POST idempotent with idempotency keys                  ║
║  Rate limit: token bucket is the standard algorithm                 ║
║                                                                      ║
║  ARCHITECTURE:                                                       ║
║  Start monolith, extract microservices when justified               ║
║  Clean Architecture: domain at center, dependencies point inward    ║
║  DDD: bounded contexts, entities, value objects, aggregates         ║
║  CQRS: separate read and write models when they have different needs║
║  Sagas: orchestration or choreography for distributed transactions  ║
║                                                                      ║
║  INTERVIEWS:                                                         ║
║  Step 1: Requirements → Step 2: High-Level → Step 3: Deep Dive     ║
║  Always discuss TRADEOFFS. There is no perfect design.              ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**Back to Start:** [README — Table of Contents](README.md)
