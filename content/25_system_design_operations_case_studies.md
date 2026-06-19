# Chapter 25 — System Design — Part 3: Operations & Case Studies

> "Hope is not a strategy." — Google SRE Book

**What this chapter covers:**
The production reality of system design — reliability and fault tolerance (redundancy, retries, chaos engineering, circuit breakers, error budgets, hedged requests), security (AuthN/AuthZ, OAuth 2.0 + OIDC, JWT, encryption at rest / in transit / end‑to‑end, OWASP Top 10, mTLS, threat modelling with STRIDE), observability (logs/metrics/traces, SLI/SLO/SLA, OpenTelemetry, golden signals, exemplars), deployment (containers, K8s, service mesh, CI/CD, GitOps, progressive delivery), search and supporting building blocks (inverted index, geo‑indexes, ID generation, autocomplete, webhooks, feature flags), multi‑region architecture, cost & capacity engineering (FinOps), the recurring anti‑patterns to spot in a design discussion, and a full end‑to‑end Instagram worked example.

This is **Part 3** of the three‑chapter System Design series, picking up from **[Chapter 24 — Data & Distributed Systems](24_system_design_data_distributed.md)**. If you skipped **[Chapter 23 — Foundations & Protocols](23_system_design_fundamentals_deep_dive.md)**, some references to load balancers, caching, and HTTP/TLS will assume that context.

**How to read it:**
Same shape as the previous two chapters — *Simple Explanation → Official Definition → How it works (with ASCII diagrams) → Variants → Trade‑offs → Interview takeaway.* ~3 hours cover‑to‑cover. The final three Parts (20–22) are case‑study material that ties everything together — read after at least skimming Parts 13–19 of this chapter and the two preceding chapters.

The §X.Y numbering is continuous with Ch 23 and Ch 24 (this chapter contains §13.1 … §22.x). Cross‑chapter pointers are prefixed (e.g. "Ch 23, §4.8" or "Ch 24, §9.9").

---

## Table of Contents

| Part | Section | Building Blocks |
|------|---------|-----------------|
| 13 | Reliability & Fault Tolerance | Redundancy, retries, chaos engineering, circuit breakers, hedged requests, error budgets |
| 14 | Security | AuthN/AuthZ, OAuth 2.0 + OIDC, JWT, crypto, OWASP Top 10, mTLS, defence in depth, STRIDE |
| 15 | Observability | Logs, metrics, traces, SLI/SLO/SLA, OpenTelemetry, golden signals, exemplars, RED & USE |
| 16 | Deployment & Infrastructure | Containers, K8s, service mesh, CI/CD, GitOps, progressive delivery, k8s probes, statefulness |
| 17 | Search & Building Blocks | Inverted index, geo‑indexes, distributed IDs, service discovery, webhooks, autocomplete, feature flags |
| 18 | Multi‑Region Architecture | Active‑active / active‑passive, traffic steering, split‑brain, data sovereignty, cost |
| 19 | Cost & Capacity Engineering (FinOps) | Cost iceberg, pricing models, right‑sizing, capacity planning |
| 20 | Common Anti‑Patterns | Distributed monolith, premature sharding, retry storms, snowflake servers, and more |
| 21 | Worked Example — Designing Instagram | End‑to‑end design exercising every prior part |
| 22 | Putting It All Together | A reusable interview framework, Jeff Dean's latency numbers, reference designs |

---

# PART 13: RELIABILITY & FAULT TOLERANCE

## 13.1 Redundancy patterns

```
   ACTIVE-ACTIVE          ACTIVE-PASSIVE              N+1
   ─────────────          ─────────────               ────
   Both nodes serve       One serves; standby idle    N working,
   traffic at all times    until primary dies         +1 spare ready
   Fastest failover       Cheaper, slower failover   Common in racks
   Needs conflict          Common for stateful        and clusters
   resolution              services (DB primary)
```

## 13.2 Failover

```
   normal:    LB ──▶ primary  (replica idle)
   crash:     LB detects → promote replica → flip DNS / VIP

   Targets:
     RTO (Recovery Time Objective)  — how fast you must recover
     RPO (Recovery Point Objective) — how much data loss is acceptable
```

## 13.3 Retry strategies (and how to retry without crashing the world)

```
   Naive retry:           1s, 1s, 1s, 1s ...      — thundering herd
   Exponential backoff:   1s, 2s, 4s, 8s, 16s     — calms the herd
   + Jitter:              random ± 50%            — desynchronizes clients
```

Always: **exponential backoff + jitter + a cap + a max attempts**. AWS SDKs do this by default.

## 13.4 Graceful degradation

When something fails, return a *useful subset* rather than an error. Netflix shows you cached recommendations when the recommender is down. Reddit shows "served from cache" banner when DB is slow.

## 13.5 Chaos engineering

Deliberately break things in production to verify your system *actually* survives. Started by Netflix (Chaos Monkey kills random instances; Chaos Kong takes down a region). The discipline includes a hypothesis, a blast radius, and learning loops — it's *not* random destruction.

## 13.6 Disaster Recovery (DR) strategies

```
   Cold standby     Backups in another region, restore on demand     hours-days
   Warm standby     Smaller replica running, scale up on failover    minutes
   Hot standby      Full replica live, can take traffic now           seconds
   Multi-active     Both regions serving live traffic                 zero downtime
   ▲ cheap                                                              ▼ $$$$
```

## 13.7 Hedged requests — defeating the tail

> **Idea (Jeff Dean, "The Tail at Scale"):** Issue a request to one server; if it hasn't responded by some threshold (e.g., p95), send the *same* request to a second server. Use whichever responds first.

```
   t=0      ─▶ replica A
   t=p95    ─▶ replica B    (hedge)
   t=...    ◀── first response from either; cancel the other
```

Result: p99 collapses toward p50 at the cost of ~5 % extra requests. Used everywhere inside Google, BigTable, and Spanner clients.

## 13.8 Cascading failures and how systems die

```
   1. Downstream service slows down
   2. Upstream calls take longer → threads pile up
   3. Upstream connection pool exhausts → it rejects requests
   4. Its callers retry → traffic doubles or triples
   5. Healthy services downstream now overload too
   6. Whole system is on fire
```

Defences:
- **Circuit breakers** (Ch 23, §4.8) — fail fast when downstream is unhealthy.
- **Timeouts everywhere** — never an "infinite" call.
- **Retry budgets** — limit retries to e.g. 10 % of normal RPS.
- **Load shedding** — return 503 to *some* requests to save the rest.
- **Bulkheads** (Ch 23, §4.9) — isolate so one bad tenant can't drown the pool.
- **Backpressure** — push back upstream when overwhelmed.

> **Google SRE rule:** "A retry is the same as a new request." Every retry must obey the same rate limit.

## 13.9 Runbooks and game days

A **runbook** is a step-by-step doc for an oncall to follow when an alert fires: *symptom → diagnostic queries → mitigation → escalation.* Every alert without one is a half-built alert.

**Game days** (chaos drills) periodically test the runbook — and the team — under realistic incident pressure. Without practice, written DR plans rot silently.

## 13.10 Postmortems — the blameless culture

After every incident, write a **blameless postmortem**: timeline, contributing factors, action items. The goal is *learning*, not blame. Google's SRE book is the canonical reference.

## 13.11 Error budgets and freeze policies

```
   SLO    = 99.9 % over 30 days
   Budget = 0.1 % = ~43.2 minutes/month of allowable downtime

   If you've already burned the budget this month:
     • Feature freezes; only reliability work ships.
     • Force a postmortem-driven prioritization session.

   If you haven't burned any:
     • Take more risks; ship faster.
```

The budget is an **explicit currency** that aligns product velocity with reliability. It turns "should we ship?" from politics into math.

---

# PART 14: SECURITY

## 14.1 Authentication vs Authorization

> **Simple Explanation:** *AuthN* answers "who are you?" *AuthZ* answers "what can you do?" You log in (AuthN), then the system checks if you can delete that file (AuthZ).

## 14.2 OAuth 2.0 & OIDC (in plain English)

OAuth 2.0 is **delegated authorization**: "let app X access my data on Y without giving X my password."

```
   1. User clicks "Sign in with Google"
   2. App redirects to Google with a client_id and scope
   3. User logs in & consents
   4. Google redirects back with an authorization code
   5. App swaps the code for an access token (server-to-server)
   6. App uses the access token to call Google APIs on user's behalf
```

**OIDC** sits on top of OAuth and adds an ID token (JWT) that proves identity, not just access.

### Common grant types

| Grant | Use |
|-------|-----|
| **Authorization code + PKCE** | Web/mobile apps (modern default) |
| **Client credentials** | Service-to-service, no user involved |
| **Device code** | TVs, CLIs |
| ~~Implicit~~ / ~~Password~~ | Deprecated — don't use |

## 14.3 JWT (JSON Web Token)

```
   header.payload.signature      (Base64 url-encoded)
   ─────────────────────────
   {alg:HS256}.{sub:42,exp:...}.HMAC(header+payload, secret)
```

- **Stateless** — server doesn't store sessions; the token *is* the proof.
- **Signed**, not encrypted by default — don't put secrets in the payload.
- **Hard to revoke** — strategies: short TTL + refresh tokens, a blocklist of jti, or rotate signing keys.

**Use** for service-to-service or SPA APIs. **Avoid** if you need easy revocation (use server-side sessions or opaque tokens).

## 14.4 Encryption — at rest vs in transit

- **In transit** — TLS 1.2+ (1.3 preferred). HTTPS, gRPC-TLS, encrypted database connections.
- **At rest** — disk-level (AWS EBS encryption), application-level (envelope encryption with KMS), column-level (encrypt PII fields).
- **End-to-end** — only the endpoints (not the server) can decrypt. Signal, WhatsApp.

### Hashing vs Encryption

```
   HASH    one-way; can't recover input         passwords (with salt+bcrypt/argon2)
   ENCRYPT two-way; needs key to recover        secrets, sensitive payloads
```

Never store raw passwords. Use **bcrypt / scrypt / Argon2** (slow on purpose) with a per-user salt.

## 14.5 OWASP Top 10 (web vulnerabilities)

1. **Broken access control** — users accessing what they shouldn't.
2. **Cryptographic failures** — weak crypto, missing TLS.
3. **Injection** (SQLi, NoSQLi, XSS) — untrusted input executed.
4. **Insecure design** — missing threat modelling.
5. **Security misconfiguration** — default creds, open S3 buckets.
6. **Vulnerable components** — out-of-date deps (log4shell).
7. **Identification & authN failures** — credential stuffing, weak MFA.
8. **Software & data integrity failures** — unsigned updates.
9. **Logging & monitoring failures** — can't detect breaches.
10. **Server-side request forgery (SSRF)** — server fetches attacker-controlled URLs.

### Quick defenses cheat-sheet

```
   SQL injection ─── parameterized queries / prepared statements (always)
   XSS ───────────── encode output, Content-Security-Policy headers
   CSRF ──────────── SameSite cookies, anti-CSRF tokens
   CORS ──────────── explicit allowlist; never "*" + credentials
   Clickjacking ──── X-Frame-Options / CSP frame-ancestors
   Rate-limit ────── per IP + per user + per endpoint
```

## 14.6 Zero-trust architecture

> "Never trust, always verify." No implicit trust just because a service is "inside the network." Every request is authenticated, authorized, and encrypted, even between internal services. Google's BeyondCorp pioneered this.

## 14.7 DDoS protection

Layers: **edge scrubbing** (Cloudflare, AWS Shield), **rate limiting**, **anycast** (absorb traffic across many POPs), **CAPTCHA challenges**, **WAF rules**. Critical: design for *graceful overload* — return 503s quickly rather than collapse.

## 14.8 Secrets management

Don't bake secrets into images, configs, or git. Use **Vault, AWS Secrets Manager, GCP Secret Manager** — fetch at runtime, rotate regularly, audit access.

## 14.9 mTLS — mutual TLS in detail

> **Regular TLS:** server proves identity (cert), client trusts it.
> **mTLS:** *both* sides prove identity with certificates.

Standard pattern inside zero-trust architectures:
- Every workload gets a short-lived X.509 cert (issued by an internal CA — e.g., SPIFFE/SPIRE).
- Service mesh (Envoy sidecar) terminates mTLS automatically — apps see plain HTTP.
- Identity is **cryptographic**, not "you're on this subnet."

This is how Google's internal services authenticate each other. Network position is *not* identity.

## 14.10 Cryptography primer for engineers

| Primitive | What it does | Common algos | Use |
|-----------|--------------|--------------|-----|
| **Symmetric encryption** | Same key encrypts / decrypts | AES-256-GCM, ChaCha20-Poly1305 | Bulk data after key exchange |
| **Asymmetric encryption** | Public encrypts, private decrypts | RSA, ECC | Key exchange, signatures |
| **Hash** | One-way digest | SHA-256, BLAKE3 | Integrity, content addressing |
| **Password hash** | Slow hash with salt | bcrypt, scrypt, Argon2id | Storing passwords |
| **HMAC** | Hash + secret key | HMAC-SHA256 | API request signing |
| **Digital signature** | Hash + private key | Ed25519, RSA-PSS | Software updates, JWTs |
| **Key derivation** | Stretch a key/password | HKDF, PBKDF2 | Derive session keys |

**Two iron rules:** never invent your own crypto, and never store passwords in anything other than bcrypt / scrypt / Argon2.

## 14.11 OAuth 2.0 Authorization Code + PKCE — step by step

PKCE (Proof Key for Code Exchange) protects public clients (mobile, SPA) where there's no client secret.

```
   1. Client generates:
        code_verifier  = random 43–128 char string
        code_challenge = SHA256(code_verifier) base64url

   2. Browser → /authorize?client_id=...&code_challenge=...&method=S256

   3. User logs in & consents → redirect with ?code=AUTH_CODE

   4. Client (mobile app) → /token  POST
        code=AUTH_CODE & code_verifier=...
      Server checks SHA256(code_verifier) == stored challenge

   5. Server returns access_token (short) + refresh_token (long)
```

A stolen auth code is useless without the original verifier. **Always use PKCE for SPAs and mobile apps.**

## 14.12 Key rotation and secret hygiene

- **Rotate** signing / encryption keys regularly (90 days is a common cadence; some Google services daily).
- Use **key IDs** in JWTs (`kid`) so multiple keys can validate during rotation windows.
- Encrypt secrets with a KMS (envelope encryption) — *the key encrypting your keys* never leaves the HSM.
- **Never log secrets.** Scrub logs of headers like `Authorization`, `Cookie`.
- Use short-lived tokens (minutes/hours), with refresh tokens stored securely.

## 14.13 Defence in depth

```
   ┌─────────────────────────────────────────────────────────┐
   │ Edge:    WAF, DDoS scrubbing, rate limits, geo blocks     │
   │ LB:      TLS termination, mTLS to backends, SNI routing   │
   │ App:     AuthN/Z, input validation, parameterized SQL     │
   │ Data:    Encryption at rest, KMS, row-level security      │
   │ Audit:   Tamper-evident logs, alerting on access patterns │
   │ Mgmt:    Least privilege, MFA, regular access review       │
   └─────────────────────────────────────────────────────────┘
```

If any one layer fails, the others still buy you time. "Trust nothing, verify everything."

## 14.14 Common attack patterns (and the line of code that stops each)

| Attack | One-line defence |
|--------|------------------|
| SQL injection | Use parameterized queries — *never* string-concat SQL |
| XSS | Encode user input on output: `escapeHtml(input)` |
| CSRF | `SameSite=Lax` cookies + anti-CSRF tokens on state-changing forms |
| SSRF | Allowlist outbound destinations; never fetch user-supplied URLs blindly |
| Insecure deserialization | Never deserialize untrusted JSON/YAML/Pickle into typed objects without schema validation |
| Timing attacks on tokens | Use constant-time comparison (`hmac.compare_digest`) |
| Mass assignment | Explicit field allowlist on input — never `Model.update(request.body)` |
| Open redirect | Validate the redirect URL is in an allowlist of paths |

## 14.15 Threat modelling (STRIDE)

Before you ship anything sensitive, walk through STRIDE:

```
   S poofing identity      → authentication, MFA
   T ampering with data    → integrity (HMAC, signatures, TLS)
   R epudiation            → audit logs, signed events
   I nformation disclosure → encryption, access controls
   D enial of service      → rate limits, autoscaling, shedding
   E levation of privilege → RBAC, least privilege
```

Five minutes per feature catches what fuzzing won't.

---

# PART 15: OBSERVABILITY

## 15.1 The three pillars

```
   ┌────────────────────────────────────────────────────────┐
   │ LOGS    — discrete events  ("user 42 logged in at T")  │
   │ METRICS — aggregates       ("requests/sec = 1200")     │
   │ TRACES  — request lifelines("svc A→B→C, 12ms total")   │
   └────────────────────────────────────────────────────────┘
```

You need all three. Logs tell you *what* happened, metrics tell you *how much*, traces tell you *where* the time went.

## 15.2 Metrics — Prometheus model

```
   counter   monotonically increasing             http_requests_total
   gauge     value that goes up and down          memory_bytes
   histogram bucketed distribution                request_duration_seconds
   summary   precomputed quantiles                request_duration_seconds
```

**Pull model** (Prometheus scrapes endpoints) vs **push model** (StatsD, OpenTelemetry collector). Modern stacks usually do pull for infra and push for application events.

## 15.3 Logs — structured > unstructured

```
   bad:   logger.info("user 42 paid $19.99 for order 7")
   good:  logger.info("payment", user_id=42, amount=19.99, order_id=7)
```

Structured logs (JSON) are queryable (`amount > 100`) and aggregatable. Centralize them via ELK (Elasticsearch + Logstash + Kibana), Loki, or a cloud logging service.

## 15.4 Distributed tracing

> **Problem:** request `req-123` touched 17 services. Which one was slow?

A trace is a tree of **spans**, each with start/end timestamps and a `trace_id`. Propagate the `trace_id` in HTTP headers (`traceparent` in W3C) so each service can attach its own spans.

```
   Trace req-123  (180ms total)
   ├─ frontend     5ms
   ├─ auth-svc     12ms
   ├─ orders-svc   145ms
   │   ├─ db.query 130ms  ◀── the culprit
   │   └─ cache    2ms
   └─ email-svc    18ms (async)
```

Tools: **OpenTelemetry** (the standard SDK/protocol), Jaeger, Tempo, Honeycomb, Datadog APM, Google Cloud Trace.

## 15.5 SLI, SLO, SLA — Google's reliability vocabulary

| Term | What it is |
|------|------------|
| **SLI** | Service Level *Indicator* — a measurement (e.g., availability = good responses / total) |
| **SLO** | Service Level *Objective* — your target (e.g., 99.9% over 30 days) |
| **SLA** | Service Level *Agreement* — contract with consequences if you miss SLO (refunds) |
| **Error budget** | 100% − SLO = how much failure you can spend before freezing releases |

If your SLO is 99.9% and you've already burned the month's budget, *stop deploying risky changes* and shore up reliability instead.

## 15.6 Alerting principles

- Alert on **symptoms** users feel (latency, error rate), not on causes (CPU > 80%).
- Every alert must be **actionable** — if a human can't do something, delete it.
- Page on **fast-burn SLO violations**; ticket on slow-burn.

## 15.7 Health checks (revisited for observability)

- **Liveness** — am I alive? If no, kill me (kubernetes restarts).
- **Readiness** — am I ready to serve? If no, take me out of the LB pool, but don't kill me.
- **Startup** — give slow-starting services time before liveness checks count.

## 15.8 RED and USE — two monitoring frameworks

| Method | Stands for | Best for |
|--------|------------|----------|
| **RED** | **R**ate, **E**rrors, **D**uration | Request-driven services (APIs) |
| **USE** | **U**tilization, **S**aturation, **E**rrors | Resources (CPU, disk, queue) |

A solid service dashboard has, *per endpoint*:
- **Rate** — requests / sec.
- **Errors** — error rate (count and %).
- **Duration** — p50, p95, p99 latency.

For each resource it consumes:
- **Utilization** — % busy.
- **Saturation** — queue depth or wait time.
- **Errors** — disk read errors, OOM kills, etc.

These two lenses together catch almost every incident.

## 15.9 Sampling strategies for traces

Tracing every request at high QPS is too expensive. Three strategies:

- **Head-based sampling** — decide at the entry point (e.g., 1 %). Simple, but you may miss the rare slow request.
- **Tail-based sampling** — keep the trace only after seeing the full request (e.g., keep all errors, all slow requests, plus 1 % of normal). Requires holding spans in memory briefly.
- **Probabilistic with priorities** — always keep errors and high-value endpoints; sample background traffic.

Modern tracers (Tempo, Honeycomb) lean tail-based. Useful telemetry > 100 % telemetry.

## 15.10 Metric cardinality — the silent killer

Each unique combination of label values is a separate time series. Add `user_id` as a label → millions of series → Prometheus OOM.

```
   Good:   http_requests_total{method="GET", status="200", route="/api/orders"}
   Bad:    http_requests_total{user_id="42", request_id="abc-..."}
```

Rule of thumb: keep cardinality < 100 k series per metric. Put high-cardinality fields in **logs or traces** (which are designed for it), not metrics.

## 15.11 OpenTelemetry — one SDK to rule them all

OTel is the vendor-neutral standard for emitting traces, metrics, and logs. The mental model:

```
   App code  ──▶ OTel SDK  ──▶ OTel Collector  ──▶ any backend
                                                    (Jaeger, Tempo,
                                                     Datadog, Honeycomb,
                                                     Prometheus, Loki, ...)
```

Adopting OTel decouples your code from your observability vendor — switch back-ends without touching app code. This is now the default in most new services.

## 15.12 The four golden signals (Google SRE)

For every user-facing service, dashboard the four:

1. **Latency** — how long requests take (split successful vs error).
2. **Traffic** — how much demand (RPS).
3. **Errors** — rate of failed requests.
4. **Saturation** — how "full" the service is (CPU, memory, queues).

If you measure only four things, measure these.

---

# PART 16: DEPLOYMENT & INFRASTRUCTURE

## 16.1 Containers — what changed

> **Simple Explanation:** A container packages your app + its dependencies into a runnable image that behaves the same on every machine. It's not a VM (no kernel of its own), but it feels like one.

```
   VM                              CONTAINER
   ┌────────────┐                   ┌────────────┐
   │   App      │                   │   App      │
   │   Libs     │                   │   Libs     │
   │   Guest OS │  ← heavy          ├────────────┤
   ├────────────┤                   │  Shared    │
   │ Hypervisor │                   │  Host OS   │
   ├────────────┤                   ├────────────┤
   │  Host OS   │                   │  Host OS   │
   └────────────┘                   └────────────┘
   GB image, minutes                MB image, seconds
   to boot                          to boot
```

Docker is the dominant image format and runtime.

## 16.2 Kubernetes — the minimum viable mental model

```
   ┌─────────────────────────────────────────────────────┐
   │ Cluster                                              │
   │   ├─ Control plane (API server, scheduler, etcd)     │
   │   └─ Nodes (workers)                                 │
   │        └─ Pods (1+ containers that share network)    │
   │             managed by Deployments / StatefulSets     │
   │             exposed via Services / Ingress            │
   └─────────────────────────────────────────────────────┘
```

What k8s gives you for free: scheduling, self-healing (restart crashed pods), rolling updates, secrets/configmaps, service discovery, autoscaling (HPA), declarative infra (YAML).

## 16.3 Service mesh

A sidecar proxy (Envoy) next to every pod handles mTLS, retries, circuit breakers, observability, and traffic shaping — *without changing app code*. Examples: Istio, Linkerd, Cilium.

```
   pod                                pod
   ┌─────────────┐                    ┌─────────────┐
   │ app  ──▶ sidecar ──── mTLS ────▶ sidecar ◀── app │
   └─────────────┘                    └─────────────┘
```

## 16.4 CI/CD

```
   Commit ──▶ CI (build + tests + lint + security scan) ──▶ artifact
       └─▶ CD (auto-deploy to dev → stage → prod with gates)
```

Practices: **trunk-based dev**, **small frequent commits**, **automated rollback**, **deployments multiple times per day**.

## 16.5 Deployment strategies

```
   ROLLING       replace 10% of pods at a time         Simple, slow rollback
   BLUE/GREEN    spin up green, flip LB                Instant rollback, 2× cost
   CANARY        send 1% → 5% → 25% → 100%             Risk-aware, needs metrics
   SHADOW        send mirrored traffic, drop response  Safe testing in prod
   FEATURE FLAG  deploy dark, enable per user/tenant   Decouple deploy from release
```

## 16.6 Infrastructure as Code (IaC)

Define infra in code (Terraform, Pulumi, CloudFormation), version it in git, apply via PRs. Eliminates "snowflake servers." Enables disaster recovery (rebuild the cluster from a repo).

## 16.7 Autoscaling

- **Horizontal Pod Autoscaler (HPA)** — add/remove pods based on CPU/memory/custom metrics.
- **Cluster Autoscaler** — add/remove nodes based on pending pods.
- **Vertical Pod Autoscaler** — change pod CPU/memory limits (rarely used at runtime).
- **Predictive autoscaling** — ML-based, scale up *before* the spike (e.g., daily peak).

Always scale on a **leading indicator** (queue depth, RPS) not a lagging one (latency).

## 16.8 GitOps

> **Idea:** Git is the source of truth. A controller continuously reconciles the cluster to match what's in the repo.

```
   Developer ──▶ PR ──▶ merge ──▶ ArgoCD/Flux detects change
                                       │
                                       ▼
                                  kubectl apply (declaratively)
                                       │
                                       ▼
                                  Cluster matches Git state
```

Benefits:
- **Auditable** — every change is a git commit.
- **Reversible** — `git revert` rolls back the cluster.
- **Disaster recovery** — rebuild a cluster by pointing the controller at the repo.

Standard tools: ArgoCD, Flux, Atlantis (for Terraform).

## 16.9 Progressive delivery — beyond rolling deploys

```
   ┌──────────────────────────────────────────────────────────┐
   │ Argo Rollouts / Flagger:                                  │
   │   1. Deploy new version as a "canary" alongside stable     │
   │   2. Route 1 % of traffic                                 │
   │   3. Check golden signals (latency, error rate)            │
   │   4. If healthy: 5 % → 25 % → 100 %                        │
   │   5. If unhealthy: instant rollback                        │
   └──────────────────────────────────────────────────────────┘
```

Pair with **feature flags** (LaunchDarkly, Unleash, OpenFeature) so the *deployment* and the *release* are decoupled — ship dark, flip on later, segment by user/tenant.

## 16.10 Kubernetes probes — get them right

```
   livenessProbe:    am I alive?            fails → kubelet restarts container
   readinessProbe:   am I ready to serve?   fails → removed from Service endpoints
   startupProbe:     am I done starting?    protects slow boots from liveness kill
```

Common mistakes:
- Using the same endpoint for liveness *and* readiness (a DB hiccup turns a load-shed event into a restart loop).
- Liveness probes that check downstream services (cascading failure).
- No startup probe on JVM apps → kubelet kills them mid-warmup.

## 16.11 Container best practices

- **Multi-stage builds** — keep final images small (`FROM ... AS builder` → `FROM distroless`).
- **Distroless or scratch base images** — fewer CVEs, smaller attack surface.
- **Non-root user** — `USER 1000` in your Dockerfile.
- **Pinned image digests**, not `:latest` (reproducible builds, security).
- **One process per container** — let the orchestrator manage processes.
- **Resource requests AND limits** — without requests, the scheduler can over-pack nodes; without limits, one pod can starve the rest.

## 16.12 Sidecar, ambassador, adapter — the three k8s patterns

```
   SIDECAR     auxiliary container in the same pod    log shipper, mesh proxy
   AMBASSADOR  proxy that wraps external calls         retries, circuit break
   ADAPTER     normalizes the app's outputs            metrics scraper, log fmt
```

The service mesh sidecar (Envoy) is the most famous example, but the pattern is general — anywhere you'd patch app code, consider a sidecar instead.

## 16.13 Statefulness — the elephant in the cluster

Kubernetes is great at stateless. For stateful (databases, brokers), it's *acceptable* but never effortless:

- **StatefulSets** — stable network IDs and persistent volumes per pod.
- **PersistentVolumes** — backed by EBS / PD / Ceph — failover requires the volume to be re-attachable.
- **Operators** — controllers that codify operational knowledge (Postgres-operator, Strimzi for Kafka, Vitess-operator).

Many teams (correctly) **run databases as managed services** (RDS, Cloud SQL, Aurora) and only run stateless workloads in K8s.

---

# PART 17: SEARCH & MISC BUILDING BLOCKS

## 17.1 Full-text search & inverted index

> **Idea:** Flip the table — instead of "document → words," build "word → documents that contain it."

```
   Documents:                       Inverted index:
   doc1: "the cat sat"              "cat"  → [doc1, doc3]
   doc2: "the dog ran"              "dog"  → [doc2]
   doc3: "the cat ran"              "ran"  → [doc2, doc3]
                                    "sat"  → [doc1]
   Query "cat AND ran" → intersect → [doc3]
```

Elasticsearch / OpenSearch / Solr / Lucene build on this with relevance ranking (TF-IDF, BM25), analyzers (tokenization, stemming), and aggregations.

## 17.2 Geo-spatial indexes

| Structure | How |
|-----------|-----|
| **Geohash** | Encode lat/lon to a string; prefix = nearby area | Redis GEO, Elastic |
| **Quadtree** | Recursively subdivide 2D space into 4 quadrants | Google Maps, Uber |
| **R-tree** | Hierarchical bounding rectangles | PostGIS |
| **S2** | Google's spherical geo-indexing (hierarchical cells) | Google Maps, Foursquare |
| **H3** | Uber's hexagonal grid | Uber dispatch |

"Find restaurants near me within 1 km" → geo-index lookup, not a full scan.

## 17.3 Distributed unique IDs

| Scheme | Looks like | Pros | Cons |
|--------|------------|------|------|
| **Auto-increment** | 1, 2, 3 | Simple, sortable | Centralized, doesn't shard |
| **UUIDv4** | random 128-bit | Decentralized, no coordination | Random → bad index locality |
| **UUIDv7** | time-prefixed UUID | Sortable + decentralized | Newer, library support |
| **Snowflake** (Twitter) | `[time][machine][seq]` | Sortable, k-sorted | Needs machine ID coordination |
| **ULID** | crockford base32 | Sortable + URL-safe | Slightly larger than uint64 |
| **KSUID** | k-sortable + entropy | Time-sortable | 27 chars |

**Modern default:** UUIDv7 or Snowflake-style.

## 17.4 Service discovery

How does service A find an instance of service B in a cluster where pods come and go every minute?

- **Client-side** — clients query a registry (Consul, etcd) and pick an instance.
- **Server-side** — clients hit a stable LB endpoint that routes to a live instance (Kubernetes Services do this via kube-proxy).
- **DNS-based** — registry exposes records via DNS (e.g., `b.svc.cluster.local`).

## 17.5 API gateway features (consolidated)

```
   ┌────────────────────────────────────────────┐
   │ AuthN/AuthZ (validate JWT/OAuth)            │
   │ Rate limiting + quotas                       │
   │ Request/response transformation              │
   │ Caching                                     │
   │ Routing / versioning                         │
   │ Aggregation (BFF pattern)                   │
   │ Observability (logging, tracing)             │
   │ WAF integration                             │
   └────────────────────────────────────────────┘
   Examples: Kong, Apigee, AWS API GW, Envoy, GCP API GW
```

## 17.6 Webhooks

The inverse of polling: the server calls *you* when something happens. Tips:
- **Sign** the payload (HMAC) so receivers can verify origin (see §17.11).
- **Retry** with backoff on non-2xx.
- **Idempotency** keys so receivers can dedupe.
- **Allow-list** outgoing destinations to avoid SSRF.

### Webhook vs server push — what's the difference?

Both are "server-initiated," but they push to *different* receivers:

- **Webhook** — *server-to-server*. Your backend sends an HTTP `POST` to *another system's* public URL when an event happens (e.g. Stripe → your `/stripe-events` endpoint). There's no persistent connection; the receiver just has to be a reachable HTTP endpoint. Best for cross-system, asynchronous integrations.
- **Server push** (SSE / WebSocket, Ch 23 §3.18–3.19) — *server-to-connected-client*. Your server pushes data down an *already-open* connection to a browser or app the user has live right now (e.g. a live score ticker). It needs a long-lived connection that you maintain.

Rule of thumb: a **webhook** delivers an event *between systems*; **server push** delivers an update *to a user who is online at this moment*.

## 17.7 Pagination — the right way

```
   Offset-based  ?page=42&size=20   simple, slow for big offsets,
                                     unstable when items are inserted
   Cursor-based  ?cursor=opaque     fast (uses index), stable, opaque to client
   Keyset        ?after_id=12345    fast, requires sortable key
```

For infinite scroll / API consumers, **cursor or keyset**, not offset.

**How a cursor actually works:** the cursor is an opaque token — usually a base64-encoded copy of the last row's sort key, e.g. `(created_at, id)`. The next page runs `WHERE (created_at, id) < (:last_created, :last_id) ORDER BY created_at DESC, id DESC LIMIT 20`, which is an **indexed seek**. So it stays **O(log N + page)** no matter how deep you scroll, while offset is **O(offset)** — the database must count and throw away every earlier row. A cursor is also *stable*: rows inserted while you page don't shift results or create duplicates. The trade-off: you can only move next/previous, not jump straight to "page 500."

## 17.8 Big-O for the system designer

A rough ladder of scale — at each tier the bottleneck (and the fix) changes:

```
   1 user            anything works
   1k users          a single server + DB is fine
   100k users        add a cache and a CDN
   1M users          replicas + maybe one shard, queue for async work
   100M users        sharding, multi-region, fan-out
   1B users          dedicated infra, custom protocols, regional autonomy
```

### The complexities that actually bite at scale

Big-O isn't just for the coding round — it decides whether a design survives growth. The cost of one operation, multiplied by your traffic, is your bill:

| Operation | Complexity | What it means for the design |
|-----------|------------|------------------------------|
| Hash / cache lookup | O(1) | The target for hot paths (Redis `GET`, hash partition) |
| B-tree index seek | O(log N) | A healthy indexed database read |
| Full table scan | O(N) | Fine on 1k rows, fatal on 1B — the classic missing-index bug |
| Fan-out on write | O(followers) | One celebrity post → millions of writes (§21.7) |
| N+1 / nested loop | O(N × M) | "One query per row" — batch it instead (Ch 24, §7.9) |
| Sort / join without index | O(N log N) | Watch memory; it spills to disk when N is huge |
| Cross join / cartesian | O(N²) | Breaks past ~10⁴ items on a single machine |

**The one-second rule:** a single CPU core does roughly **10⁸ simple operations per second**. So an O(N²) algorithm stays interactive only up to about N ≈ 10⁴; beyond that you need a better algorithm, an index, or more machines. The habit to build: for every hot path, ask *"what's the Big-O per request, and what does it cost when N grows 100×?"*

Order-of-magnitude thinking like this is what saves you from both over-engineering and nasty surprises.

## 17.9 Search relevance — TF-IDF and BM25

How does Elasticsearch decide "doc A is more relevant than doc B" for a query?

```
   TF-IDF score(term, doc) = TF(term, doc) × IDF(term)

      TF  = how often the term appears in the doc (more = more relevant)
      IDF = log(total_docs / docs_containing_term)
            common words ("the") have low IDF; rare words have high IDF
```

**BM25** is the modern default (Lucene since 6.0). It dampens TF growth (a 100× repeated word isn't 100× more relevant) and normalizes for document length. Most search systems use it under the hood.

Modern search adds a *second stage*: neural ranking with embeddings (RAG-style semantic search) on top of BM25 candidates. See Ch 28.

## 17.10 Geohash — the precision table

A geohash string represents a rectangle on Earth. Each character refines the rectangle ~32× (5 bits).

| Length | Cell size | Use case |
|--------|-----------|----------|
| 4 | ~20 km × 20 km | City |
| 5 | ~4.9 km × 4.9 km | Neighbourhood |
| 6 | ~610 m × 610 m | Block |
| 7 | ~76 m × 76 m | Building cluster |
| 8 | ~19 m × 19 m | Building |

"Find drivers near me" → compute the geohash of my location, query that cell + the 8 neighbours, then sort by exact distance.

## 17.11 Webhook security in practice

```
   Sender side:                        Receiver side:
     sig = HMAC_SHA256(body, secret);     expected = HMAC_SHA256(body, secret);
     headers['X-Signature'] = sig;        if !constant_time_eq(sig, expected):
                                              reject 403
                                          verify timestamp within 5 min (replay attack)
                                          dedupe by request id (idempotency)
```

**What is HMAC?** HMAC (Hash-based Message Authentication Code) is a fingerprint of a message that *also* proves who sent it. You feed two things into a hash function (like SHA-256): the message **body** and a **shared secret** that only the two parties know — roughly `HMAC = hash(secret + body)`. Anyone can hash the body, but only someone who holds the secret can produce the *correct* HMAC. So a matching value proves two things at once: (1) the body wasn't tampered with in transit, and (2) it really came from someone who has the secret. HMAC is *symmetric* (both sides share the same secret) and very fast — that's the difference from a digital signature, which uses a private/public key pair instead.

GitHub, Stripe, and Slack — all webhook providers — sign payloads this way. Always use a **constant-time** comparison to avoid timing attacks, and always check the timestamp to block replays.

## 17.12 Notification systems — the building blocks

```
   Event ──▶ Notification service:
              1. Lookup user preferences (channels: push / email / SMS / in-app)
              2. Render template per channel
              3. Push to per-channel provider queue (APNs / FCM / SES / Twilio)
              4. Track delivery + bounces + opens
              5. Apply throttling per user (don't spam)
```

Common pitfalls: synchronous send (ruins request latency), no deduplication (sends the same alert 5×), no rate limits per user (user disables your app).

## 17.13 Feature flags — the senior engineer's safety net

```
   if (flags.isOn("new_pricing_engine", user)) {
       return newEngine.price(cart);
   } else {
       return oldEngine.price(cart);
   }
```

Three levels of value:
1. **Kill switch** — flip off a broken feature instantly without a redeploy.
2. **Targeted rollout** — enable for 1 % of users, internal employees, specific tenants.
3. **A/B testing** — measure impact of variant A vs B.

Tools: LaunchDarkly, Unleash, Flagsmith, OpenFeature (the standard SDK).

## 17.14 The autocomplete / typeahead building block

```
   user types "amaz"      → query → prefix matches sorted by popularity
                                     "amazon"      (popularity: 1e8)
                                     "amazing"     (popularity: 1e6)
                                     "amazonbasics"
                                     "amazfit"
```

Standard implementation: **Trie** (in-RAM, per shard) + **score** per leaf. Update score offline (batch job over search logs). Cache the top results per prefix. Sub-50 ms response is the bar.

Personalization adds a re-ranking step using user history. Modern systems use embeddings for typo tolerance (`amaz0n` → `amazon`) and semantic match.

---

# PART 18: MULTI-REGION ARCHITECTURE

## 18.1 Why go multi-region

Three real reasons (and the wrong fourth):

1. **Latency** — users in Tokyo shouldn't round-trip to Virginia (150 ms minimum).
2. **Disaster recovery** — an entire region (yes, an entire AWS region) can go down.
3. **Compliance / data sovereignty** — GDPR / India's DPDP / China — data must stay in-country.

Wrong reason: **"because it sounds robust."** Multi-region at least doubles complexity and cost. Don't do it before you have an SLO that demands it.

## 18.2 The three topologies

```
   ┌──────────────────────────────────────────────────────────────┐
   │ ACTIVE-PASSIVE         one region serves; another stands by   │
   │   Simplest. Fastest to ship. Wasted standby capacity.         │
   │   Failover = DNS flip + DB promote (minutes).                  │
   │                                                                │
   │ ACTIVE-ACTIVE (sharded by user)                                │
   │   Each user "lives" in one region. Cross-region only for       │
   │   admin / global queries. Most modern global apps do this.     │
   │                                                                │
   │ ACTIVE-ACTIVE (fully replicated)                                │
   │   Every region can serve every user with full data replication. │
   │   Highest complexity (conflict resolution, write fan-out).      │
   │   Used by truly global products (Twitter, Spanner-backed apps). │
   └──────────────────────────────────────────────────────────────┘
```

## 18.3 Data replication topologies

```
   PRIMARY → REPLICA (per region)         all writes hit one primary; replicas
                                          serve reads. Simple, but writes are
                                          slow for far-away users.

   MULTI-PRIMARY (per region)              each region accepts writes locally;
                                          replicate to others async. Need
                                          conflict resolution (CRDTs, LWW,
                                          per-row sharding).

   SHARDED-BY-USER (home region)           user42 lives in EU; user43 in US.
                                          Writes for user42 always go EU.
                                          Crossover requires a redirect.

   GLOBAL DB (Spanner, Cosmos, Yugabyte)   the DB itself handles cross-region
                                          consistency. Slowest writes,
                                          strongest semantics.
```

## 18.4 Traffic steering — getting users to the right region

```
   GeoDNS                         AWS Route 53, Cloudflare    ms-level granularity
   Anycast IP                     CDNs, public DNS resolvers   physics-level
   GSLB (Global Server LB)        F5, NetScaler, cloud LBs     health-aware
   Client-side discovery          mobile apps with region list manual control
```

Plan your **failover behaviour** in advance: if EU goes down, do US users notice (they shouldn't) and do EU users get rerouted to US (latency hit, better than nothing)?

## 18.5 Split-brain — the multi-region nightmare

> A network partition between regions can let both sides think they're the primary. They both accept writes. Now you have *two* divergent histories that must merge.

Defences:
- **Quorum-based leader election across regions** (requires odd number — 3 regions or 2+1 witness).
- **Asymmetric authority** — one region is always the writer; others read-only until manual failover.
- **Fence tokens** — old primaries are rejected by storage layer after a new one is elected.
- **CRDTs** — conflict-free merge by construction (only works for compatible data types).

## 18.6 Data sovereignty patterns

```
   ┌──────────────────────────────────────────────────────────────┐
   │ EU user                  US user                              │
   │   ├─ profile in EU         ├─ profile in US                   │
   │   ├─ behaviour data in EU  ├─ behaviour data in US            │
   │   └─ encrypted aggregates → global analytics (no PII)         │
   └──────────────────────────────────────────────────────────────┘
```

Modern GDPR/DPDP-compliant designs **shard PII by region** and only export *anonymized aggregates* globally. Differential privacy and federated analytics are increasingly used to satisfy regulators.

## 18.7 The cost of being global

| Cost | Why it shows up |
|------|-----------------|
| **Egress fees** | Cross-region transfer is the most expensive networking line item |
| **Replicated storage** | 2× regions ≈ 2× DB storage |
| **Idle standby** | Active-passive wastes one region's compute |
| **Engineering** | DR drills, runbooks, multi-region testing, observability per region |
| **Schema migrations** | Now N×harder; must be backward and forward compatible |

Estimate it before committing. Often the right answer is "we'll go multi-region *next year*, once revenue justifies it."

---

# PART 19: COST & CAPACITY ENGINEERING (FinOps)

## 19.1 Why cost is a system-design concern

The cheapest line of code is the one you didn't write. The cheapest server is the one you didn't provision. At any non-trivial scale, **architectural decisions dominate the cloud bill** — language choice, tooling cost, and even team size are rounding errors.

## 19.2 The cost iceberg

```
   Visible (most teams measure):
     EC2 / K8s instance hours, RDS, managed services

   Hidden (the 70 % nobody measures):
     Egress and cross-AZ traffic
     S3 list/get/put request counts (not bytes)
     CloudWatch ingestion (logs are expensive!)
     Idle dev/staging environments
     Over-provisioned reserved instances
     Snapshots, AMIs, old EBS volumes
     Lambda + API Gateway combo at high request rates
```

The first FinOps win is *always* deleting things — unused volumes, old snapshots, idle dev clusters.

## 19.3 Instance pricing models — pick the right mix

| Model | Discount vs on-demand | Trade-off |
|-------|----------------------|-----------|
| **On-demand** | 0 % | No commit; full price |
| **Reserved (1-year)** | ~40 % | Pay annually; locked to instance family |
| **Reserved (3-year)** | ~60 % | Long commit; risk of obsolescence |
| **Savings Plans** | ~50 % | Flexible across families |
| **Spot / Preemptible** | 70-90 % | Can be killed in 2 minutes; need retryable workloads |

**Modern recipe:** Reserved for baseline, Savings Plans for steady growth, Spot for batch/dev/CI, on-demand for spikes.

## 19.4 Architecture-level cost killers

```
   ✗ Log everything at INFO with full payloads
   ✗ Use a NAT gateway for everything (per-GB charge!)
   ✗ Keep replicas warm in every region "just in case"
   ✗ Use API Gateway + Lambda for high-throughput internal calls
   ✗ Run analytics on the OLTP cluster
   ✗ Forget about S3 lifecycle policies
   ✗ Auto-snapshot daily and never delete
   ✗ Pay for managed Kafka *and* a fleet of Lambdas to process its events
```

Each of these has burned six- and seven-figure bills at real companies. Periodically audit.

## 19.5 Right-sizing — the silent waste

Most prod workloads run at 10-20 % CPU utilization "for headroom." That's 5-10× over-provisioning. Use:

- **Vertical Pod Autoscaler** (recommend mode) — learn the right requests/limits over time.
- **Karpenter / Cluster Autoscaler** — pack pods densely; scale down nodes overnight.
- **Stop dev/staging clusters on nights/weekends** — single biggest non-prod win.

## 19.6 Capacity planning — the back-of-envelope worksheet

```
   1. Users:           ___M total, ___% daily active = ___M DAU
   2. Action freq:     ___ actions/user/day
   3. Total actions:   DAU × freq = ___/day → ÷ 86,400 = ___ RPS
   4. Peak factor:     2-3× average = ___ peak RPS
   5. Per-action cost: ___ ms CPU, ___ KB storage, ___ network bytes
   6. Server count:    peak RPS × per-req CPU ÷ (cores × util) = N
   7. Storage:         actions × KB × retention_days = ___ TB
   8. Egress:          users × responses × KB = ___ TB/month
   9. Cost:            N × $/hr × 720 + storage $/GB-mo + egress $/GB
```

Run it for the next 12, 24, and 36 months. The shape (linear? exponential? S-curve?) tells you whether to invest in efficiency now or later.

## 19.7 The single most useful FinOps practice

> **Tag every resource with `owner`, `service`, `environment`.** Show each team their bill monthly. Costs decrease by 20-30 % within two quarters with *no other action* — visibility alone changes behaviour.

---

# PART 20: COMMON ANTI-PATTERNS

These are the recurring mistakes that look reasonable on a whiteboard but cause real production pain. Spotting them in a design discussion is what separates a senior from a staff engineer.

## 20.1 "Microservices first"

Splitting into 20 services before you have product-market fit. You pay all the costs (network, observability, deploys, data-consistency) for none of the benefits (independent teams, clear bounded contexts). Start with a **modular monolith**; split when team or scale demands it — *not* because microservices are fashionable.

## 20.2 The distributed monolith

You split into microservices, but every change requires coordinated deploys of 6 services in lockstep. Telltale signs: shared DB across services, synchronous chains 4+ deep, no service can be deployed independently. Fix: enforce schema boundaries, async events, contract tests.

## 20.3 Premature sharding

Sharding a database that doesn't yet need it. Now every query is harder, every join is impossible, and you've doubled ops complexity for no benefit. **Postgres can comfortably handle 10 TB on a single beefy box.** Vertical-scale first, replicate for reads, *then* shard when you've measurably hit a write ceiling.

## 20.4 Cache as the source of truth

"We'll just keep it in Redis." Then Redis fails — and you discover the DB hasn't had that data for weeks. **A cache must be reproducible from the source of truth.** If it isn't, it's a database with a misleading name.

## 20.5 Synchronous everywhere

Every action waits for every downstream. Latencies sum. One slow dependency = whole-site outage. Default to async for anything that can be late: emails, analytics, recommendations, webhooks.

## 20.6 "It's eventually consistent" hand-wave

Saying "eventually consistent" without specifying *how* eventual (seconds? minutes? hours?) and what the user sees during inconsistency. **Be specific:** "user feed lags writes by < 5s p99, never shows duplicates, and never loses likes."

## 20.7 Logs as a database

Querying logs to answer business questions. Logs are append-only, expensive to query, and not your system of record. If you find yourself running grep over CloudWatch to compute revenue, you need a proper events table or warehouse.

## 20.8 One queue to rule them all

A single Kafka topic for "all events." Consumers get bottlenecks, ordering breaks, retention conflicts (analytics wants 30 days; auth wants 1 hour). **One topic per event type per producer**; group consumption by purpose.

## 20.9 No timeouts

Every HTTP/gRPC call without an explicit timeout is a future production outage. Default timeouts in many libraries are *infinite*. Always: connect timeout (1 s), read timeout (3-10 s), overall request timeout (≤ caller's SLA / 2).

## 20.10 Read-after-write surprises

Writing to a DB then immediately reading from a replica that hasn't caught up. User pays, sees old balance, panics. Fix with Ch 24, §8.6 strategies — don't ignore it.

## 20.11 Retry storms

Service B fails → service A retries → A's retries multiply the load on B → B stays down longer → more retries. Always: exponential backoff + jitter, retry budgets, circuit breakers.

## 20.12 "Idempotency, we'll add it later"

You won't. By the time you need it (double charges, duplicate emails), you'll have refactor-debt across every endpoint. Bake idempotency keys in from day one for state-changing operations.

## 20.13 The Ops gap

A new service ships without dashboards, alerts, or a runbook. The first oncall page is a ten-step debugging odyssey. **Definition of Done** includes: SLOs defined, golden-signal dashboards, runbook published, oncall trained.

## 20.14 "Just use Lambda"

Serverless for the wrong workloads: long-running jobs (15-min cap), database-heavy work (cold-start + connection pool issues), or chatty fan-out (cost explodes). Use Lambda for true event-driven, sporadic work. Use containers/VMs for steady high-RPS workloads.

## 20.15 Snowflake servers

Production servers configured by hand, no IaC, no reproducibility. The day they die, you discover the prior engineer's config tweaks aren't documented. **Everything in git.** Cattle, not pets.

---

# PART 21: WORKED EXAMPLE — DESIGNING INSTAGRAM

A full walk-through that exercises every previous section. Treat it as the template for any "design X" interview.

## 21.1 Step 1 — Clarify requirements

**Functional:**
- Users upload photos (and short videos).
- Followers see a chronological / ranked feed.
- Like, comment, search by hashtag.
- Direct messages.

**Non-functional:**
- Read-heavy (≈ 100:1 read:write).
- 99.9 % availability for reads; 99.99 % for upload acks.
- p99 feed load < 200 ms globally.
- Strong consistency for follows; eventual for feed/likes/comment counts.
- Global, must comply with regional data residency.

## 21.2 Step 2 — Estimates (back-of-envelope)

```
   500M DAU
   × 2 photo uploads/user/week ÷ 7 = ~143M uploads/day = ~1,650 uploads/sec
   peak factor 3× = ~5,000 uploads/sec

   Reads (feed loads):  500M × 5 sessions × 30 photos = 75B photo views/day
                       ÷ 86,400 = ~870K views/sec
   peak: ~2.5M views/sec

   Storage per photo:   ~500 KB (after compression, multiple sizes cached)
   Daily upload bytes:  143M × 500 KB ≈ 70 TB/day = ~25 PB/year (+ thumbnails)
   Metadata per photo:  ~1 KB → 50 GB/year metadata
```

## 21.3 Step 3 — API sketch

```
   POST   /v1/photos                   upload (multipart, returns photoId)
   GET    /v1/feed?cursor=...          paginated feed
   POST   /v1/follow/{userId}          follow
   POST   /v1/like/{photoId}           like
   POST   /v1/comments                 comment
   GET    /v1/search?q=...&type=tag    search
```

All write endpoints take `Idempotency-Key`. Reads use cursor pagination.

## 21.4 Step 4 — Data model

```
   users(id, handle, name, region, created_at)              — Postgres
   follows(follower_id, followee_id, created_at)            — Cassandra
   photos(id, owner_id, s3_key, caption, created_at, ...)   — Cassandra
   likes(photo_id, user_id, created_at)                     — Cassandra
   feeds(user_id, photo_id, score, ts)                      — Redis (sorted set)
   comments(photo_id, comment_id, user_id, text, ts)        — Cassandra
   search_index                                             — Elasticsearch
   blob storage                                             — S3 (+ CDN)
```

## 21.5 Step 5 — High-level architecture

Read it top-to-bottom as four layers: **edge → services → data → events.**

```
   LAYER 1 — EDGE
     Client → CDN (CloudFront) → API Gateway (auth, rate-limit) → L7 LB (Envoy)

   LAYER 2 — SERVICES   (stateless, auto-scaled microservices)
     Upload  ·  Feed  ·  Like  ·  Comment  ·  Search

   LAYER 3 — DATA   (each service uses the store that fits its job)
     S3 ............ raw + resized photos/videos   → served back via the CDN
     Redis ......... feed cache, hot photos, sessions
     Cassandra ..... photos, follows, likes, comments   (write-heavy)
     Postgres ...... users, billing, anything that needs ACID
     Elasticsearch . the search index

   LAYER 4 — EVENTS   (every write drops an event; workers react in the background)
     Kafka ─▶ Fan-out workers      → push new posts into followers' Redis feeds
           ─▶ Transcoder           → thumbnail / medium / large → S3 → CDN
           ─▶ Search indexer       → Elasticsearch
           ─▶ Analytics (Flink)    → data warehouse
           ─▶ Notification service → "X posted a new photo"
```

**The flow in words:** a request comes in through the CDN and gateway, gets routed to a microservice, which reads or writes the data store that fits the job — media in S3, hot feeds in Redis, write-heavy social data in Cassandra, money in Postgres. Crucially, **every write also drops an event onto Kafka**, and background workers react to it: building feeds, indexing for search, resizing images, and sending notifications. That separation is what lets the user's request return in milliseconds while the slow work happens asynchronously.

## 21.6 Step 6 — Photo upload flow

The key trick: the client uploads the photo **directly to S3**, not through your servers — which offloads a huge amount of bandwidth. Your API only hands out a temporary permission slip (a *presigned URL*) and records the metadata.

```
   1. Client → POST /photos/upload-url      "I want to upload a photo"
        API checks auth + rate limit, then generates a short-lived S3
        presigned URL (write-only, expires in ~5 min) and returns it.

   2. Client → PUT <presigned-url>          uploads the raw bytes straight to S3
        Your servers never touch the file → no bandwidth cost, no proxying.

   3. Client → POST /photos/commit          { s3Key, caption, location }
        Photo service:
          a. Validates the S3 object exists and is a real image
          b. Writes metadata to Cassandra (photoId, userId, s3Key, caption…)
          c. Emits "photo.uploaded" to Kafka
          d. Returns 201 Created { photoId }   ← the user sees success right away

   4. Async consumers react to "photo.uploaded":
          • Transcoder     → thumbnail / medium / large → S3 → invalidate CDN
          • Feed fan-out   → push photoId into followers' feeds (§21.7)
          • Search indexer → add caption + tags to Elasticsearch
          • Notification   → "X posted a new photo"
```

**Why split it into `upload-url` + `commit`?** The slow, big upload and the fast, small metadata write are separated, so a connection dropped mid-upload never leaves a half-written row in your database. The photo only "exists" once the client commits.

**Idempotency:** send an `Idempotency-Key` on `/commit` so a retry after a flaky response doesn't create a duplicate post.

**Hand-off to feed generation:** the `photo.uploaded` event is the bridge to feed generation (§21.7). The upload path returns immediately, and the expensive **fan-out runs in the background** — so the poster is never blocked while the post is pushed into millions of followers' feeds.

## 21.7 Step 7 — Feed generation (the heart of the system)

Three strategies; Instagram uses a hybrid:

```
   PUSH (fan-out on write)   on upload, push photoId to every follower's
                              feed cache. Read = O(1). Write = O(followers).
                              Great for normal users; terrible for celebrities.

   PULL (fan-out on read)    on feed load, query last N photos from every
                              followee and merge. Read = O(followees × log N).
                              Cheap for celebs; expensive at read time.

   HYBRID  (Instagram's choice)
                              Push for normal users (< 10k followers).
                              Pull for "big accounts" — read combines pushed
                              feed + recently fetched celeb posts.
```

Feed cache: Redis sorted set per user, scored by `created_at + ranking_signal`.

## 21.8 Step 8 — Scaling considerations

| Concern | Mitigation |
|---------|------------|
| Hot celebrities | Hybrid feed; separate "big-account" cache shard |
| Hot photo (viral) | CDN absorbs reads; like counter sharded across keys and merged |
| Spam / abuse | Rate-limit uploads per user (token bucket); ML moderation queue |
| Search at scale | Elasticsearch with hashtag-sharded indices |
| Multi-region | Photo + follow stored in user's home region; cross-region reads via CDN |
| Sudden 10× traffic spike (live event) | Pre-scale, autoscale, shed non-critical (e.g., delay analytics ingestion) |
| Like fan-out storm | Aggregate likes in 1-second windows; flush to DB as deltas |

## 21.9 Step 9 — Failure modes (the senior bit)

```
   • Cassandra node dies        → tunable W=2 keeps writes; auto-repair
   • Redis cluster outage       → degrade to pull-only feed (slower but works)
   • S3 outage in one region    → reads fall back to other region via CDN
   • Kafka cluster unreachable  → buffer events to local disk; backfill on recovery
   • Transcoder pipeline behind → serve original; transcoded version "soon"
   • Region down                → DNS-shift users to nearest healthy region
```

Every component is asked: *what happens if you die?* And: *what do users see?*

## 21.10 Step 10 — Trade-offs called out

- **Eventual consistency on like counts** → user may see N then N+1 briefly. Acceptable.
- **Feeds may lag uploads by seconds** during fan-out backlog. Acceptable for social media; would NOT be for financial systems.
- **Hybrid feed adds complexity** but is the only way to handle both Joe Public and Beyoncé.
- **Storing originals in S3** is durable + cheap, but transcoding costs CPU. Cached in CDN amortizes.
- **Single-region writes for now**; revisit when revenue justifies multi-master complexity.

---

# PART 22: PUTTING IT ALL TOGETHER

## 22.1 A reusable interview framework

```
   1. CLARIFY    — functional & non-functional reqs, scale numbers
   2. ESTIMATE   — QPS, storage/year, bandwidth (back-of-envelope)
   3. API        — define the 3-5 most important endpoints
   4. DATA       — entities, schemas, choose the data store
   5. HIGH-LEVEL — boxes & arrows: client → LB → service → cache → DB
   6. DEEP DIVE  — pick the 2 hardest components, design them well
   7. BOTTLENECKS — identify, then mitigate (cache? shard? queue?)
   8. TRADE-OFFS — name what you sacrificed; reason about CAP/PACELC
```

## 22.2 Latency numbers every engineer should know (Jeff Dean, updated)

```
   L1 cache reference                    0.5  ns
   Branch mispredict                       5  ns
   L2 cache reference                      7  ns
   Mutex lock/unlock                      25  ns
   Main memory reference                 100  ns
   Compress 1KB with Snappy              2,000 ns  =   2 µs
   Read 1MB sequentially from memory     3,000 ns  =   3 µs
   SSD random read                      16,000 ns  =  16 µs
   Round trip within same datacenter   500,000 ns  =  0.5 ms
   Read 1MB sequentially from SSD    1,000,000 ns  =  1 ms
   Disk seek                        10,000,000 ns  =  10 ms
   Read 1MB sequentially from disk  20,000,000 ns  =  20 ms
   Round trip US ↔ Europe          150,000,000 ns  = 150 ms
```

Two lessons: (1) network ≫ memory ≫ CPU. (2) batch + sequential ≫ random.

## 22.3 Back-of-envelope estimation cheat-sheet

```
   1 day        = 86,400 s    ≈ 10⁵ s
   1 month      ≈ 2.5 × 10⁶ s
   1 year       ≈ 3 × 10⁷ s

   100M users, 10 actions/day  ≈ 10⁹ actions/day  ≈ 12k actions/sec
   Each action 1KB                                 ≈ 1 TB/day, ~365 TB/year
```

Multiply users × actions × size → storage. Divide by 86,400 → RPS.

## 22.4 Five reference designs (apply everything above)

### A. URL shortener (TinyURL)
```
   Components: API → ID gen (Snowflake) → KV store (Redis primary,
               Cassandra cold), CDN-cached redirects (HTTP 301).
   Key choice: 301 vs 302 (analytics trade-off), TTL on cache, base62 IDs.
```

### B. News feed (Twitter)
```
   Two strategies:
     • Pull (fan-out on read)  — query on read; slow for celeb followers
     • Push (fan-out on write) — precompute feeds; bad for celebrities
     • Hybrid                  — push for normal users, pull for celebs
```

### C. Chat (WhatsApp)
```
   WebSockets (persistent conn) → per-user msg queue (Kafka or custom)
   → Cassandra for history. Per-user "last delivered" offset.
   Use end-to-end encryption (Signal protocol).
```

### D. Rate limiter
```
   Token-bucket per (user, endpoint) in Redis, atomic Lua script.
   Fail open vs fail closed? — usually closed for billing, open for serving.
```

### E. Distributed file storage (Dropbox)
```
   Chunk files (4MB) → content-hash for dedupe → object store (S3) →
   metadata DB (Postgres) → notification service for sync.
   Use rsync-style delta uploads to save bandwidth.
```

## 22.5 The senior engineer's heuristics

1. **Cache aggressively, invalidate explicitly.**
2. **Make it correct first, then make it fast.**
3. **Async by default for anything that can be late.**
4. **Idempotency is not optional in distributed systems.**
5. **Every retry needs backoff and a cap.**
6. **Every queue needs a DLQ.**
7. **Every service needs a health check, a metric, and a runbook.**
8. **No SPOFs in the critical path.**
9. **Design for failure modes you've actually seen, not for ones that look elegant.**
10. **The best architecture is the *simplest* one that meets the SLOs.**

## 22.6 Where to go next in this repo

- **Ch 21** — Design Fundamentals (SOLID, patterns, Java specifics)
- **Ch 26** — ML System Design (recsys, ranking, feature stores)
- **Ch 22** — Engineering Tools (Kafka, Redis, Spark, K8s in depth)

This chapter is the **map**; those three are the **terrain**.

---

## Quick-Reference Cheat Card

```
   ┌──────────────────────────────────────────────────────────────┐
   │ NEED LOWER LATENCY?    → Cache, CDN, edge compute, denormalize│
   │ NEED HIGHER THROUGHPUT?→ Shard, async queue, batch, parallelize│
   │ NEED HIGHER AVAILABILITY?→ Replicas, multi-AZ/region, retries  │
   │ NEED STRONG CONSISTENCY?→ Single-leader, quorum reads, Spanner│
   │ NEED EVENTUAL CONS. OK? → Async replication, CRDTs, gossip    │
   │ NEED RELIABLE EVENTS?   → Kafka + idempotent consumers + DLQ   │
   │ NEED FAST WRITES?       → LSM stores (Cassandra), append-only │
   │ NEED FAST READS?        → B-tree DBs + cache + read replicas  │
   │ NEED SECURE BY DEFAULT? → mTLS + zero trust + secrets manager │
   │ NEED PROOF IT WORKS?    → SLO + error budget + chaos drills    │
   └──────────────────────────────────────────────────────────────┘
```

---

> **Final thought:** None of these building blocks are magic. Each one solves *one specific problem* — and the senior engineer's job is to know which problem they have, pick the smallest set of blocks that fix it, and clearly name the trade-offs. The diagrams in your interview matter less than the *reasoning* behind every box.

---

## Key Takeaways

```
SYSTEM DESIGN PART 3 — OPERATIONS & CASE STUDIES
═══════════════════════════════════════════════════════════════

RELIABILITY & FAULT TOLERANCE
  • Redundancy + failover remove single points of failure.
  • Retry with exponential backoff + jitter; cap attempts.
  • Timeouts everywhere; idempotency makes retries safe.
  • Circuit breakers + graceful degradation stop cascades.
  • Hedged requests cut tail latency; beware retry storms.
  • Chaos engineering + game days prove it before prod does.
  • Error budgets drive freeze policy; postmortems blameless.

SECURITY
  • AuthN = who you are; AuthZ = what you may do.
  • OAuth 2.0 + OIDC for delegated auth; use Auth Code+PKCE.
  • JWT = signed, stateless claims — short-lived, validate.
  • Encrypt at rest AND in transit; hash ≠ encrypt.
  • Know OWASP Top 10 and the one-line defense for each.
  • Zero-trust + mTLS + secrets manager + key rotation.
  • Threat-model with STRIDE; defense in depth.

OBSERVABILITY
  • Three pillars: logs, metrics, traces (structured logs).
  • SLI/SLO/SLA define & promise reliability; budget burns.
  • Four golden signals: latency, traffic, errors, saturation.
  • RED (services) and USE (resources) frameworks.
  • OpenTelemetry = one SDK; watch metric cardinality.

DEPLOYMENT & INFRA
  • Containers + K8s: declarative, self-healing workloads.
  • Get probes right (liveness vs readiness vs startup).
  • Service mesh for mTLS/retries/observability sidecars.
  • Deploy strategies: rolling, blue-green, canary; GitOps.
  • Autoscale on real signals; IaC for repeatable infra.

BUILDING BLOCKS & SCALE-OUT
  • Inverted index for search; geohash for geo queries.
  • Distributed unique IDs (Snowflake), service discovery.
  • Feature flags = decouple deploy from release; safe net.
  • Multi-region: topologies, traffic steering, split-brain,
    data sovereignty — global costs real money (FinOps).

ANTI-PATTERNS & PROCESS
  • Avoid microservices-first, distributed monolith,
    premature sharding, cache as source of truth, no timeouts.
  • Interview framework: clarify → estimate → API → data →
    architecture → scale → failures → trade-offs.
  • Memorize the latency numbers + back-of-envelope math.
```

---

> **End of the three‑chapter System Design series.** Continue your study with:
>
> - **[Chapter 21 — Design Fundamentals](21_design_fundamentals.md)** — SOLID, design patterns, Java specifics.
> - **[Chapter 26 — ML System Design](26_ml_system_design.md)** — recsys, ranking, feature stores.
> - **[Chapter 22 — Engineering Tools](22_engineering_tools.md)** — Kafka, Redis, Spark, K8s in depth.
>
> The three System Design chapters are the **map**; those three are the **terrain**.
