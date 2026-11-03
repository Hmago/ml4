# Chapter 25 — System Design — Part 3: Operations & Case Studies

> "Hope is not a strategy." — Google SRE Book

**What this chapter covers:**
The production reality of system design — reliability and fault tolerance (redundancy, retries, chaos engineering, circuit breakers, error budgets, hedged requests), security (AuthN/AuthZ, OAuth 2.0 + OIDC, JWT, encryption at rest / in transit / end‑to‑end, OWASP Top 10, mTLS, threat modelling with STRIDE), observability (logs/metrics/traces, SLI/SLO/SLA, OpenTelemetry, golden signals, exemplars), deployment (containers, K8s, service mesh, CI/CD, GitOps, progressive delivery), search and supporting building blocks (inverted index, geo‑indexes, ID generation, autocomplete, webhooks, feature flags), multi‑region architecture, cost & capacity engineering (FinOps), the recurring anti‑patterns to spot in a design discussion, and a full end‑to‑end Instagram worked example.

This is **Part 3** of the three‑chapter System Design series, picking up from **[Chapter 24 — Data & Distributed Systems](#content/24_system_design_data_distributed)**. If you skipped **[Chapter 23 — Foundations & Protocols](#content/23_system_design_fundamentals_deep_dive)**, some references to load balancers, caching, and HTTP/TLS will assume that context.

**How to read it:**
Same shape as the previous two chapters — *Simple Explanation → Official Definition → How it works (with ASCII diagrams) → Variants → Trade‑offs → Interview takeaway.* ~3 hours cover‑to‑cover. The final three Parts (20–22) — anti‑patterns, the Instagram worked example and the interview framework — tie everything together; read them after at least skimming Parts 13–19 of this chapter and the two preceding chapters.

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

![Redundancy and failover infographic: a component with no backup is a single point of failure (SPOF); three redundancy patterns drawn side by side — active-active (LB → Node A and Node B both serving), active-passive (LB → serving primary, standby replica kept in sync) and N+1 (four nodes + one spare); a failover timeline Primary crashes → Health check fails → Promote replica → Repoint DNS / VIP → Serving again bracketed as RTO ≈ 5 min, with the last 30 s of writes lost = RPO ≈ 30 s (async lag); a pattern/how/strength/catch comparison table; when to use / not use; trap: RPO = 0 needs synchronous replication, which adds write latency.](diagrams/sd25_info_redundancy-failover_ai.png)

<details>
<summary><strong>Read as text</strong> — single points of failure and the three redundancy patterns</summary>

> **Simple Explanation:** keep more than one of anything whose failure would take you down. A component with no backup is a **single point of failure (SPOF)**.

```
   ACTIVE-ACTIVE            ACTIVE-PASSIVE              N+1
   ─────────────            ──────────────              ───
   Both nodes serve         One serves; standby idle    N nodes carry the
   traffic at all times     until the primary dies      load, +1 spare ready
   Fastest failover         Cheaper, slower failover    Common in racks
   Needs conflict           Common for stateful         and clusters
   resolution if both       services (DB primary)
   accept writes
```

</details>

## 13.2 Failover

<details>
<summary><strong>Read as text</strong> — detect, promote, repoint — and the RTO / RPO targets</summary>

```
   normal:    LB ──▶ primary  (replica kept in sync, not serving)
   crash:     health check fails → promote replica → repoint DNS / VIP
              (VIP = virtual IP address that can move between machines)

   Targets:
     RTO (Recovery Time Objective)  — how fast you must recover
     RPO (Recovery Point Objective) — how much data loss is acceptable
```

Example: async replication that lags ~30 s gives an RPO of ~30 s (the last 30 s of writes can be lost); if detection + promotion + DNS switch take ~5 min, the RTO is ~5 min. RPO = 0 needs synchronous replication, which adds write latency.

</details>

## 13.3 Retry strategies (and how to retry without crashing the world)

![Retry strategies infographic: naive retries (waits 1 s, 1 s, 1 s, 1 s) make every client retry together — a thundering herd; three timeline rows of 5 clients' retry dots show Naive (stacked, thundering herd), Exponential (waits 1, 2, 4, 8, 16 s, still in lockstep) and Exponential + jitter (scattered, spread out); formulas backoff(n) = min(cap, base × 2ⁿ), full jitter (AWS) sleep = random(0, backoff(n)) and ±50 % jitter; a bar chart for base = 1 s, cap = 30 s giving 1, 2, 4, 8, 16, 30, 30 s; graceful degradation examples (Netflix shows popular / cached titles, a shop hides 'people also bought' while checkout keeps working); retry only transient failures (timeouts, 503, 429) on idempotent operations; trap: backoff without jitter keeps clients synchronised.](diagrams/sd25_info_retries-degradation_ai.png)

<details>
<summary><strong>Read as text</strong> — naive vs exponential vs jitter, and the backoff formula</summary>

```
   Naive retry:           1s, 1s, 1s, 1s ...    — thundering herd: all clients retry together
   Exponential backoff:   1s, 2s, 4s, 8s, 16s   — less load, but clients still in lockstep
   + Jitter:              randomise each delay  — spreads the clients out in time
```

The formula (attempt n = 0, 1, 2, …; `base` = first delay, `cap` = longest delay):

```
   backoff(n) = min(cap, base × 2ⁿ)
   full jitter (AWS):  sleep = random(0, backoff(n))
   ±50 % jitter:       sleep = backoff(n) × random(0.5, 1.5)

   base = 1 s, cap = 30 s  →  backoff = 1, 2, 4, 8, 16, 30, 30 … s
```

Always: **exponential backoff + jitter + a cap + a max attempts**. Retry only *transient* failures (timeouts, `503`, `429`) and only operations that are safe to repeat (idempotent, or carrying an idempotency key). AWS and Google Cloud client libraries do this by default.

</details>

## 13.4 Graceful degradation

<details>
<summary><strong>Read as text</strong> — returning a useful subset instead of an error</summary>

When something fails, return a *useful subset* rather than an error. Netflix shows you popular / cached titles when the personalised recommender is down. A shop hides the "people also bought" row when its recommender is slow, but checkout keeps working.

</details>

## 13.5 Chaos engineering

![Chaos engineering and disaster-recovery comparison infographic: a 4-step chaos loop (1 hypothesis — if one cache node dies, p99 stays under 200 ms; 2 small blast radius — start with 1 % of traffic or one zone; 3 inject the failure in production; 4 learn & fix, then re-run) with Netflix's Chaos Monkey (kills random instances) and Chaos Kong (simulates losing a whole region); a staircase of four DR tiers for the 2nd region — cold standby (backups only, hours–days, $), warm standby (smaller replica, minutes, $$), hot standby (full live replica, seconds, $$$), multi-active (both regions serve, ~zero downtime, $$$$) — labelled faster recovery → higher cost; a pick-by-RTO table; common mix-ups; trap: no hypothesis and no blast-radius limit = an outage you caused.](diagrams/sd25_info_chaos-dr_ai.png)

<details>
<summary><strong>Read as text</strong> — hypothesis, blast radius and learning loops</summary>

Deliberately break things in production to verify your system *actually* survives. Started by Netflix (Chaos Monkey kills random instances; Chaos Kong simulates losing a whole region). The discipline includes a **hypothesis** ("if one cache node dies, p99 stays under 200 ms"), a small **blast radius** (how much can break if you are wrong — start with 1 % of traffic or one zone), and **learning loops** (fix what you found, then re-run) — it's *not* random destruction.

</details>

## 13.6 Disaster Recovery (DR) strategies

<details>
<summary><strong>Read as text</strong> — cold, warm, hot and multi-active standby compared</summary>

```
   STRATEGY       WHAT RUNS IN THE 2nd REGION              RECOVERY TIME   COST
   Cold standby   Backups only; restore on demand          hours–days      $
   Warm standby   Smaller replica running; scale it up     minutes         $$
   Hot standby    Full replica live, can take traffic now  seconds         $$$
   Multi-active   Both regions serve live traffic          ~zero downtime  $$$$
```

</details>

## 13.7 Hedged requests — defeating the tail

![Hedged requests and cascading failure infographic: a sequence diagram (Client, Replica A, Replica B) — t=0 send to A, at t=p95 hedge to B, B's first response wins, cancel A — from Dean & Barroso's 'The Tail at Scale' (2013), where a hedge after 10 ms cut BigTable p99.9 from 1,800 ms to 74 ms for +2 % requests and only the slowest ~5 % get hedged (~5 % extra load); six tipping dominoes show how a cascade kills a system (downstream slows → threads pile up → pool exhausts, rejects requests → callers retry, traffic 2–3× → healthy services overload → whole system on fire); a defences table (circuit breaker, timeouts everywhere, retry budget ~10 %, load shedding 503, bulkheads, backpressure); hedge only idempotent reads; trap: unbounded retries turn a slowdown into an outage.](diagrams/sd25_info_hedging-cascades_ai.png)

<details>
<summary><strong>Read as text</strong> — a second copy after p95, and the first answer wins</summary>

> **Idea (Jeff Dean & Luiz Barroso, "The Tail at Scale", 2013):** Issue a request to one server; if it hasn't responded by some threshold (e.g., the p95 latency — the time 95 % of requests beat), send the *same* request to a second replica. Use whichever responds first.

```
   t=0      ─▶ replica A
   t=p95    ─▶ replica B    (hedge — only if A hasn't answered yet)
   t=...    ◀── first response from either; cancel the other
```

Result: because the hedge fires only for the slowest ~5 % of requests, it costs only ~5 % extra load but cuts the tail sharply. In the paper's BigTable benchmark, a hedge sent after 10 ms cut the 99.9th-percentile latency from 1,800 ms to 74 ms with just 2 % more requests. Use it only for idempotent reads; gRPC and Envoy support hedging natively.

</details>

## 13.8 Cascading failures and how systems die

<details>
<summary><strong>Read as text</strong> — the six steps of a cascade and the defences</summary>

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
- **Retry budgets** — cap retries at e.g. 10 % of normal requests (the Google SRE book's per-client example).
- **Load shedding** — return 503 to *some* requests to save the rest.
- **Bulkheads** (Ch 23, §4.9) — isolate so one bad tenant can't drown the pool.
- **Backpressure** — push back upstream when overwhelmed.

> **SRE principle:** a retry is extra load exactly like a new request — count it against the same rate limits and budgets.

</details>

## 13.9 Runbooks and game days

![Error budgets, runbooks and blameless postmortems infographic: error budget = 100 % − SLO, so SLO 99.9 % over 30 days = 0.1 % of 43,200 min = 43.2 min/month (or 1 failure per 1,000 requests), drawn as a fuel gauge with 'budget left → ship faster' and 'empty → feature freeze'; an incident loop Alert → Runbook (symptom → diagnose → mitigate → escalate) → Blameless postmortem (timeline · factors · actions) → Game day → Alert; a table of SLO vs error budget (99 % 7.2 hours, 99.9 % 43.2 minutes, 99.95 % 21.6 minutes, 99.99 % 4.32 minutes, 99.999 % ~26 seconds; each extra nine = 10× smaller); avoid alerts with no runbook and blame; trap: written DR plans rot silently without practice.](diagrams/sd25_info_error-budgets_ai.png)

<details>
<summary><strong>Read as text</strong> — what oncall follows and how drills keep it fresh</summary>

A **runbook** is a step-by-step doc for an oncall to follow when an alert fires: *symptom → diagnostic queries → mitigation → escalation.* Every alert without one is a half-built alert.

**Game days** (chaos drills) periodically test the runbook — and the team — under realistic incident pressure. Without practice, written DR plans rot silently.

</details>

## 13.10 Postmortems — the blameless culture

<details>
<summary><strong>Read as text</strong> — timeline, contributing factors and action items — no blame</summary>

After every incident, write a **blameless postmortem**: timeline, contributing factors, action items. The goal is *learning*, not blame. Google's SRE book is the canonical reference.

</details>

## 13.11 Error budgets and freeze policies

<details>
<summary><strong>Read as text</strong> — the budget maths, the freeze policy and the SLO table</summary>

```
   SLO    = 99.9 % over 30 days
   Budget = 100 % − 99.9 % = 0.1 % of the 43,200 minutes in 30 days
          = 43.2 minutes/month of allowable downtime
            (or, counted in requests: 1 failure per 1,000 requests)

   If you've already burned the budget this month:
     • Feature freezes; only reliability work ships.
     • Force a postmortem-driven prioritization session.

   If you haven't burned any:
     • Take more risks; ship faster.
```

| SLO (30 days) | Error budget |
|---------------|--------------|
| 99 % | 7.2 hours |
| 99.9 % | 43.2 minutes |
| 99.95 % | 21.6 minutes |
| 99.99 % | 4.32 minutes |
| 99.999 % | ~26 seconds |

Each extra "nine" shrinks the budget 10×.

The budget is an **explicit currency** that aligns product velocity with reliability. It turns "should we ship?" from politics into math.

</details>

---

# PART 14: SECURITY

## 14.1 Authentication vs Authorization

![OAuth 2.0 and OIDC infographic: AuthN = who are you?, AuthZ = what are you allowed to do?, OAuth 2.0 = delegated authorization (the app gets an access token, not your password), OIDC adds an ID token (a JWT) = who the user is; a 4-lane swimlane (User / Browser, App X, Google authorization server, Google API) of the authorization code flow — 1 click 'Connect your Google Drive', 2 redirect with client_id, redirect_uri, scope, state, 3 log in & consent, 4 redirect back with one-time code, 5 swap code → access token (+ client secret or PKCE), 6 call API with access token; a grant-types table (authorization code + PKCE, client credentials, device code ✓; implicit / password ✗ deprecated by RFC 9700, Jan 2025) with the OAuth 2.1 draft note; valet-key analogy; trap: never treat an access token as proof of identity.](diagrams/sd25_info_oauth-oidc_ai.png)

<details>
<summary><strong>Read as text</strong> — who are you vs what are you allowed to do</summary>

> **Simple Explanation:** *Authentication (AuthN)* answers "who are you?" *Authorization (AuthZ)* answers "what are you allowed to do?" You log in (AuthN), then the system checks if you can delete that file (AuthZ).

</details>

## 14.2 OAuth 2.0 & OIDC (in plain English)

<details>
<summary><strong>Read as text</strong> — the six-step authorization-code flow and the ID token</summary>

OAuth 2.0 is **delegated authorization**: "let app X access my data on Y without giving X my password."

```
   1. User clicks "Connect your Google Drive" in app X
   2. App redirects the browser to Google with client_id, redirect_uri,
      scope (what it wants) and state (anti-CSRF value)
   3. User logs in at Google & consents
   4. Google redirects back to redirect_uri with a one-time authorization code
   5. App swaps the code for an access token at Google's /token endpoint,
      proving it is the same app (client secret on a server, or PKCE — §14.11)
   6. App uses the access token to call Google APIs on the user's behalf
```

**OIDC (OpenID Connect)** sits on top of OAuth and adds an **ID token** (a JWT, §14.3) that tells the app *who the user is* — that is what "Sign in with Google" uses. An access token says what the app may *do*; never treat it as proof of identity.

</details>

### Common grant types

<details>
<summary><strong>Read as text</strong> — which grant to use, and the OAuth 2.1 draft</summary>

| Grant | Use |
|-------|-----|
| **Authorization code + PKCE** | Web/mobile/SPA apps with a user (modern default) |
| **Client credentials** | Service-to-service, no user involved |
| **Device code** | TVs, CLIs (no browser on the device) |
| ~~Implicit~~ / ~~Password~~ | Deprecated by the OAuth 2.0 Security BCP (RFC 9700, Jan 2025) — don't use |

**OAuth 2.1** (still an IETF draft in Nov 2026) folds these best practices into one spec: PKCE required for every authorization-code flow, implicit and password grants removed, exact redirect-URI matching.

</details>

## 14.3 JWT (JSON Web Token)

![JWT and encryption infographic: a JWT drawn as three blocks header . payload . signature (each part Base64URL-encoded) with the decoded {"alg":"HS256","typ":"JWT"}, {"sub":"42","exp":1767225600,"aud":"api.example.com"} and HMAC-SHA256 signature, a magnifying glass showing anyone can read the payload, and hard-to-revoke fixes (short TTL + refresh tokens, jti denylist, rotate keys); three columns SIGN (JWT, HMAC — proves who sent it, detects tampering), ENCRYPT (two-way: TLS 1.2+ in transit, disk / envelope + KMS / column-level PII at rest, end-to-end like Signal and WhatsApp) and HASH (one-way: bcrypt / scrypt / Argon2 + per-user salt); a JWT pitfall → fix table (pin the alg, validate exp/nbf/iss/aud, ≥ 256-bit secret or RS256/ES256/EdDSA, 5–15 min tokens, HttpOnly; Secure; SameSite cookies); when to use / not use; trap: secrets in a JWT payload are only Base64.](diagrams/sd25_info_jwt-encryption_ai.png)

<details>
<summary><strong>Read as text</strong> — the three parts, the trade-offs and the common pitfalls</summary>

> **Simple Explanation:** a JWT is a small signed note — "this is user 42, valid until 10:15" — that a server can check with a key, without looking anything up in a database.

```
   header.payload.signature        (each part Base64URL-encoded, joined by ".")
   ───────────────────────────────────────────────────────────────────────────
   header    {"alg":"HS256","typ":"JWT"}
   payload   {"sub":"42","exp":1767225600,"aud":"api.example.com"}
   signature HMAC-SHA256(base64url(header) + "." + base64url(payload), secret)
```

- **Stateless** — server doesn't store sessions; the token *is* the proof.
- **Signed**, not encrypted by default — anyone can Base64-decode and read the payload, so don't put secrets in it.
- **Hard to revoke** — strategies: short TTL + refresh tokens, a denylist of token IDs (the `jti` claim), or rotate signing keys.

**Common JWT pitfalls:**

- **Trusting the header's `alg`** — attackers send `alg: none` (no signature) or switch RS256 → HS256 so the server verifies with its *public* key as an HMAC secret. Fix: the server pins the expected algorithm and key; never read them from the token.
- **Checking the signature but not the claims** — always validate `exp` (expiry), `nbf` (not before), `iss` (issuer) and `aud` (audience: is this token meant for *me*?).
- **Weak HS256 secret** — a short secret can be brute-forced offline from one token. Use ≥ 256 random bits, or asymmetric keys (RS256 / ES256 / EdDSA) so services that only *verify* never hold the signing key.
- **Long-lived access tokens** — keep them to minutes (e.g. 5–15 min) and use refresh tokens.
- **Storing tokens in `localStorage`** — any XSS can steal them. In browsers prefer `HttpOnly; Secure; SameSite` cookies, or keep tokens on a backend (the "backend-for-frontend" pattern).

**Use** for short-lived access tokens between services and APIs. **Avoid** if you need instant revocation (use server-side sessions or opaque tokens that are looked up).

</details>

## 14.4 Encryption — at rest vs in transit

<details>
<summary><strong>Read as text</strong> — in transit, at rest and end-to-end</summary>

- **In transit** — TLS 1.2+ (1.3 preferred). HTTPS, gRPC-TLS, encrypted database connections.
- **At rest** — disk-level (AWS EBS encryption), application-level (envelope encryption with a KMS — §14.12), column-level (encrypt PII fields).
- **End-to-end** — only the endpoints (not the server) can decrypt. Signal, WhatsApp.

</details>

### Hashing vs Encryption

<details>
<summary><strong>Read as text</strong> — one-way vs two-way, and how to store passwords</summary>

```
   HASH    one-way; can't recover input         passwords (with salt+bcrypt/argon2)
   ENCRYPT two-way; needs key to recover        secrets, sensitive payloads
```

Never store raw passwords. Use **bcrypt / scrypt / Argon2** (slow on purpose) with a per-user salt.

</details>

## 14.5 OWASP Top 10 (web vulnerabilities)

![OWASP Top 10:2025 infographic: a 2 × 5 grid of numbered tiles in the 2025 order — 1 Broken access control (now includes SSRF), 2 Security misconfiguration, 3 Software supply chain failures (NEW in 2025), 4 Cryptographic failures, 5 Injection, 6 Insecure design, 7 Authentication failures, 8 Software & data integrity failures, 9 Security logging & alerting failures, 10 Mishandling of exceptional conditions (NEW in 2025) — each with a short example; a quick-defences table (SQL injection → parameterized queries, XSS → encode output + CSP, CSRF → SameSite cookies + anti-CSRF tokens, CORS → explicit origin allowlist, Clickjacking → X-Frame-Options / CSP frame-ancestors, abuse → rate-limit per IP + per user + per endpoint); trap: quoting the 2021 list.](diagrams/sd25_info_owasp-2025_ai.png)

<details>
<summary><strong>Read as text</strong> — the ten risks on the 2025 list</summary>

The current list is the **OWASP Top 10:2025** (it replaced the 2021 edition):

1. **Broken access control** — users reaching data or actions they shouldn't (now also includes **SSRF**: the server fetches an attacker-chosen URL).
2. **Security misconfiguration** — default creds, open S3 buckets, verbose errors.
3. **Software supply chain failures** — vulnerable or compromised dependencies, build systems and distribution (log4shell, malicious packages). *New; widens 2021's "vulnerable components".*
4. **Cryptographic failures** — weak crypto, missing TLS.
5. **Injection** (SQLi, NoSQLi, command injection, XSS) — untrusted input executed.
6. **Insecure design** — missing threat modelling.
7. **Authentication failures** — credential stuffing, weak MFA.
8. **Software & data integrity failures** — unsigned updates, unsafe deserialization.
9. **Security logging & alerting failures** — can't detect or respond to breaches.
10. **Mishandling of exceptional conditions** — bad error handling, "failing open" (e.g. allow access when the auth service errors). *New.*

</details>

### Quick defenses cheat-sheet

<details>
<summary><strong>Read as text</strong> — one defence per common web attack</summary>

```
   SQL injection ─── parameterized queries / prepared statements (always)
   XSS ───────────── encode output, Content-Security-Policy headers
   CSRF ──────────── SameSite cookies, anti-CSRF tokens
   CORS ──────────── explicit origin allowlist; never echo back any Origin with credentials
   Clickjacking ──── X-Frame-Options / CSP frame-ancestors
   Rate-limit ────── per IP + per user + per endpoint
```

</details>

## 14.6 Zero-trust architecture

![Zero-trust infographic: never trust, always verify (Google BeyondCorp); an Internal CA (SPIRE) issues short-lived certs (hours, auto-rotated) to two pods, orders and payments-api, each with an app talking plain HTTP to a sidecar proxy, joined by a padlocked mTLS link; a 6-step mTLS handshake ladder (ClientHello, server cert + CertificateRequest, client checks server cert, client cert + CertificateVerify, server checks client cert and reads spiffe://prod/ns/payments/sa/api, both derive session keys); DDoS defence chevrons (edge scrubbing with Cloudflare / AWS Shield / Cloud Armor → anycast → WAF → rate limiting + CAPTCHA → return 503s fast); a regular TLS vs mTLS table; secrets from Vault / AWS Secrets Manager / GCP Secret Manager; trap: trusting a request because it comes from inside the network.](diagrams/sd25_info_zero-trust-mtls_ai.png)

<details>
<summary><strong>Read as text</strong> — never trust, always verify</summary>

> "Never trust, always verify." No implicit trust just because a service is "inside the network." Every request is authenticated, authorized, and encrypted, even between internal services. Google's BeyondCorp pioneered this.

</details>

## 14.7 DDoS protection

<details>
<summary><strong>Read as text</strong> — the defence layers and graceful overload</summary>

Layers: **edge scrubbing** (Cloudflare, AWS Shield, Google Cloud Armor), **rate limiting**, **anycast** (one IP announced from many points of presence (POPs), so attack traffic is spread across all of them), **CAPTCHA challenges**, **WAF rules** (web application firewall). Critical: design for *graceful overload* — return 503s quickly rather than collapse.

</details>

## 14.8 Secrets management

<details>
<summary><strong>Read as text</strong> — fetch at runtime, rotate and audit</summary>

Don't bake secrets into images, configs, or git. Use **Vault, AWS Secrets Manager, GCP Secret Manager** — fetch at runtime, rotate regularly, audit access.

</details>

## 14.9 mTLS — mutual TLS in detail

<details>
<summary><strong>Read as text</strong> — the two-way handshake and workload identity</summary>

- **Regular TLS:** only the server proves its identity (its certificate); the client checks it and stays anonymous at the TLS layer.
- **mTLS:** *both* sides prove identity with certificates.

```
   1. Client → Server   ClientHello
   2. Server → Client   server certificate + proof it owns the private key,
                        plus a CertificateRequest ("show me yours")
   3. Client            checks the server cert chains to a trusted CA
   4. Client → Server   client certificate + CertificateVerify
                        (a signature proving it owns the client private key)
   5. Server            checks the client cert chains to the internal CA and
                        reads the identity, e.g. spiffe://prod/ns/payments/sa/api
   6. Both              derive session keys → encrypted channel
```

Standard pattern inside zero-trust architectures:
- Every workload gets a short-lived X.509 cert (hours, auto-rotated) issued by an internal CA — e.g. SPIRE, the reference implementation of the SPIFFE workload-identity standard.
- A service-mesh proxy (e.g. the Envoy sidecar in Istio) does the mTLS handshake automatically — the app talks plain HTTP to its local proxy.
- Identity is **cryptographic**, not "you're on this subnet."

Network position is *not* identity. Google's internal services follow the same idea with **ALTS** (Application Layer Transport Security), Google's own mutual-authentication protocol.

</details>

## 14.10 Cryptography primer for engineers

![Crypto toolkit infographic: an Authorization Code + PKCE sequence across App, Browser and Auth server — 1 code_verifier = random 43–128 chars and code_challenge = BASE64URL(SHA256(code_verifier)), 2 /authorize with code_challenge and code_challenge_method=S256 (only the hash travels via the browser), 3 redirect back with code + state, 4 POST /token with code + code_verifier checked as BASE64URL(SHA256(code_verifier)) == stored challenge, 5 access_token (short-lived) + refresh_token; envelope encryption chain (key-encryption key in KMS / HSM never leaves → encrypts data key → encrypts data); a primitives table (AES-256-GCM / ChaCha20-Poly1305, RSA / X25519 / ECDSA, SHA-256 / BLAKE3, bcrypt / scrypt / Argon2id, HMAC-SHA256, Ed25519 / RSA-PSS) with the 2026 hybrid X25519 + ML-KEM (FIPS 203) note; key rotation every 90 days with kid in JWTs; trap: without PKCE a stolen authorization code can be redeemed.](diagrams/sd25_info_crypto-pkce_ai.png)

<details>
<summary><strong>Read as text</strong> — the primitives, two iron rules and post-quantum TLS</summary>

| Primitive | What it does | Common algos | Use |
|-----------|--------------|--------------|-----|
| **Symmetric encryption** | Same key encrypts / decrypts | AES-256-GCM, ChaCha20-Poly1305 | Bulk data after key exchange |
| **Public-key (asymmetric)** | Key pair: public key encrypts / verifies, private key decrypts / signs | RSA, elliptic-curve (X25519, ECDSA) | Key exchange (ECDHE in TLS), signatures |
| **Hash** | One-way digest | SHA-256, BLAKE3 | Integrity, content addressing |
| **Password hash** | Slow hash with salt | bcrypt, scrypt, Argon2id | Storing passwords |
| **HMAC** | Hash + secret key | HMAC-SHA256 | API request signing |
| **Digital signature** | Hash + private key | Ed25519, RSA-PSS | Software updates, JWTs |
| **Key derivation** | Stretch a key/password | HKDF, PBKDF2 | Derive session keys |

**Two iron rules:** never invent your own crypto, and never store passwords in anything other than bcrypt / scrypt / Argon2.

**2026 note — post-quantum:** TLS key exchange is moving to *hybrid* X25519 + ML-KEM (the NIST post-quantum standard FIPS 203, 2024), already on by default in Chrome and Cloudflare. Use your TLS library's defaults rather than pinning old cipher lists.

</details>

## 14.11 OAuth 2.0 Authorization Code + PKCE — step by step

<details>
<summary><strong>Read as text</strong> — the five steps, the verifier / challenge pair and the RFC example</summary>

PKCE (Proof Key for Code Exchange, RFC 7636 — say "pixy") protects public clients (mobile, SPA) that cannot keep a client secret. Current guidance (RFC 9700; required in the OAuth 2.1 draft) is to use it for *every* client.

```
   1. Client generates a fresh secret per login:
        code_verifier  = random 43–128 chars (A–Z a–z 0–9 - . _ ~)
        code_challenge = BASE64URL( SHA256(code_verifier) )   (no "=" padding)

   2. Browser → /authorize?response_type=code&client_id=...&redirect_uri=...
                 &state=...&code_challenge=...&code_challenge_method=S256

   3. User logs in & consents → redirect to redirect_uri?code=AUTH_CODE&state=...
      (client checks state matches what it sent)

   4. Client → /token  POST
        grant_type=authorization_code & code=AUTH_CODE
        & redirect_uri=... & client_id=... & code_verifier=...
      Server checks BASE64URL(SHA256(code_verifier)) == the stored code_challenge

   5. Server returns access_token (short-lived) + refresh_token (longer-lived)
```

Example (from RFC 7636, Appendix B):

```
   code_verifier  = dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
   code_challenge = E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
```

Only the hash travels through the browser in step 2; the verifier itself is sent only in step 4, directly to the token endpoint. A stolen auth code is useless without the original verifier. **Always use PKCE for SPAs and mobile apps** — and, per current guidance, for server apps too.

</details>

## 14.12 Key rotation and secret hygiene

<details>
<summary><strong>Read as text</strong> — rotation, key IDs, envelope encryption and log hygiene</summary>

- **Rotate** signing / encryption keys regularly (90 days is a common cadence; high-value keys more often).
- Use **key IDs** in JWTs (`kid`) so multiple keys can validate during rotation windows.
- Use **envelope encryption**: each piece of data is encrypted with its own *data key*; that data key is itself encrypted by a *key-encryption key* kept in a KMS (key management service). The key-encryption key lives in an HSM (hardware security module) and never leaves it.
- **Never log secrets.** Scrub logs of headers like `Authorization`, `Cookie`.
- Use short-lived tokens (minutes/hours), with refresh tokens stored securely.

</details>

## 14.13 Defence in depth

![Defence in depth and STRIDE infographic: four castle-wall layers from outside in — Edge (WAF, DDoS scrubbing, rate limits, geo blocks), LB (TLS termination, mTLS to backends, SNI routing), App (AuthN/Z, input validation, parameterized SQL), Data (encryption at rest, KMS, row-level security) — flanked by Audit (tamper-evident logs, alerting) and Mgmt (least privilege, MFA, access review) pillars, with an attacker arrow blocked layer by layer; a STRIDE table (Spoofing → authentication, MFA; Tampering → HMAC, signatures, TLS; Repudiation → audit logs, signed events; Information disclosure → encryption, access controls; Denial of service → rate limits, autoscaling, shedding; Elevation of privilege → RBAC, least privilege); an attack → one-line defence table (parameterized queries, escapeHtml, SameSite=Lax + anti-CSRF tokens, outbound allowlist, yaml.safe_load, hmac.compare_digest); trap: relying on a single layer.](diagrams/sd25_info_defence-stride_ai.png)

<details>
<summary><strong>Read as text</strong> — six layers, each buying time if another fails</summary>

```
   ┌───────────────────────────────────────────────────────────┐
   │ Edge:    WAF, DDoS scrubbing, rate limits, geo blocks     │
   │ LB:      TLS termination, mTLS to backends, SNI routing   │
   │ App:     AuthN/Z, input validation, parameterized SQL     │
   │ Data:    Encryption at rest, KMS, row-level security      │
   │ Audit:   Tamper-evident logs, alerting on access patterns │
   │ Mgmt:    Least privilege, MFA, regular access review      │
   └───────────────────────────────────────────────────────────┘
```

If any one layer fails, the others still buy you time. "Trust nothing, verify everything."

</details>

## 14.14 Common attack patterns (and the line of code that stops each)

<details>
<summary><strong>Read as text</strong> — the one-line defence for each attack</summary>

| Attack | One-line defence |
|--------|------------------|
| SQL injection | Use parameterized queries — *never* string-concat SQL |
| XSS | Encode user input on output: `escapeHtml(input)` |
| CSRF | `SameSite=Lax` cookies + anti-CSRF tokens on state-changing forms |
| SSRF | Allowlist outbound destinations; never fetch user-supplied URLs blindly |
| Insecure deserialization | Never unpickle / Java-deserialize untrusted bytes; parse JSON into plain data and validate it against a schema; load YAML with a safe loader (`yaml.safe_load`) |
| Timing attacks on tokens | Use constant-time comparison (`hmac.compare_digest`) |
| Mass assignment | Explicit field allowlist on input — never `Model.update(request.body)` |
| Open redirect | Validate the redirect URL is in an allowlist of paths |

</details>

## 14.15 Threat modelling (STRIDE)

<details>
<summary><strong>Read as text</strong> — the six threat types and their defences</summary>

Before you ship anything sensitive, walk through STRIDE:

```
   S  Spoofing identity        → authentication, MFA
   T  Tampering with data      → integrity (HMAC, signatures, TLS)
   R  Repudiation              → audit logs, signed events
      ("I never did that")
   I  Information disclosure   → encryption, access controls
   D  Denial of service        → rate limits, autoscaling, shedding
   E  Elevation of privilege   → RBAC (role-based access control), least privilege
```

Five minutes per feature catches what fuzzing won't.

</details>

---

# PART 15: OBSERVABILITY

## 15.1 The three pillars

![Three pillars of observability infographic: logs say what, metrics say how much, traces say where; a trace waterfall for req-123 (162 ms end-to-end, traceparent: trace_id) — frontend 162 ms, auth-svc 12 ms, orders-svc 145 ms containing db.query 130 ms (the culprit, red) and cache.get 2 ms, email-svc 18 ms async drawn dashed off the critical path — with 162 ms = 5 ms frontend work + 12 ms auth + 145 ms orders; bad free-text log vs good structured log logger.info("payment", user_id=42, amount=19.99, order_id=7) queryable as amount > 100; a Prometheus metric-types table (counter, gauge, histogram, summary) with pull vs push; trap: averaging per-instance summary p99s instead of adding histogram buckets.](diagrams/sd25_info_three-pillars_ai.png)

<details>
<summary><strong>Read as text</strong> — logs, metrics and traces — what each tells you</summary>

```
   ┌──────────────────────────────────────────────────────────┐
   │ LOGS    — discrete events   ("user 42 logged in at T")   │
   │ METRICS — aggregates        ("requests/sec = 1200")      │
   │ TRACES  — request lifelines ("svc A→B→C, 12ms total")    │
   └──────────────────────────────────────────────────────────┘
```

You need all three. Logs tell you *what* happened, metrics tell you *how much*, traces tell you *where* the time went.

</details>

## 15.2 Metrics — Prometheus model

<details>
<summary><strong>Read as text</strong> — the four metric types, histograms and pull vs push</summary>

```
   counter   monotonically increasing             http_requests_total
   gauge     value that goes up and down          memory_bytes
   histogram counts per latency bucket            request_duration_seconds
   summary   quantiles precomputed in the app     request_duration_seconds
```

Prefer **histograms** for latency: bucket counts from many instances can be added up and a fleet-wide p99 computed from them, whereas per-instance summary quantiles cannot be averaged into a correct overall p99.

**Pull model** (Prometheus scrapes each service's `/metrics` endpoint) vs **push model** (StatsD, or apps sending OTLP to an OpenTelemetry Collector). Prometheus-style pull is the classic choice for infrastructure; push is common for short-lived jobs and OpenTelemetry-instrumented apps.

</details>

## 15.3 Logs — structured > unstructured

<details>
<summary><strong>Read as text</strong> — key-value log lines vs free text</summary>

```
   bad:   logger.info("user 42 paid $19.99 for order 7")
   good:  logger.info("payment", user_id=42, amount=19.99, order_id=7)
```

Structured logs (JSON) are queryable (`amount > 100`) and aggregatable. Centralize them via ELK (Elasticsearch + Logstash + Kibana), Loki, or a cloud logging service.

</details>

## 15.4 Distributed tracing

<details>
<summary><strong>Read as text</strong> — spans, the trace ID and finding the slow hop</summary>

> **Problem:** request `req-123` touched 17 services. Which one was slow?

A trace is a tree of **spans** — one span per timed operation (name, start/end time, parent span) — all sharing one `trace_id`. Propagate the `trace_id` in HTTP headers (`traceparent` in the W3C Trace Context standard) so each service can attach its own spans.

```
   Trace req-123   (162 ms end-to-end)
   └─ frontend               162 ms
      ├─ auth-svc             12 ms
      ├─ orders-svc          145 ms
      │   ├─ db.query        130 ms   ◀── the culprit
      │   └─ cache.get         2 ms
      └─ email-svc            18 ms   (async — not on the critical path)
```

162 ms = 5 ms of frontend work + 12 ms auth + 145 ms orders; the async email call does not add to it.

Tools: **OpenTelemetry** (the standard SDK/protocol), Jaeger, Tempo, Honeycomb, Datadog APM, Google Cloud Trace.

</details>

## 15.5 SLI, SLO, SLA — Google's reliability vocabulary

![SLOs, burn-rate alerts and health checks infographic: nested rings SLI (good / total) inside SLO (internal target) inside SLA (contract + refunds), with the SLA set looser (SLO 99.95 % → SLA 99.9 %); error budget = 100 % − SLO = 0.1 % = 43.2 min / 30 days; an error-budget-left chart where burn rate 1 empties the budget at 30 days and burn rate 14.4 empties it at 50 h → PAGE (SLO 99.9 % allows 0.1 %, observed 1.44 % → burn rate 14.4; 720 h ÷ 14.4 = 50 h); liveness ✗ → restart, readiness ✗ → out of LB pool, not killed, startup → wait; Google SRE Workbook defaults table: 2 % of budget in 1 h (burn 14.4) PAGE, 5 % in 6 h (burn 6) PAGE, 10 % in 3 days (burn 1) TICKET; trap: paging on CPU > 80 % (a cause) instead of error-budget burn (a symptom).](diagrams/sd25_info_slo-alerting_ai.png)

<details>
<summary><strong>Read as text</strong> — indicator, objective, agreement and error budget</summary>

| Term | What it is |
|------|------------|
| **SLI** | Service Level *Indicator* — a measurement (e.g., availability = good responses / total) |
| **SLO** | Service Level *Objective* — your target (e.g., 99.9% over 30 days) |
| **SLA** | Service Level *Agreement* — contract with consequences if you miss it (refunds) |
| **Error budget** | 100% − SLO = how much failure you can spend before freezing releases |

Set the external SLA *looser* than the internal SLO (e.g. SLO 99.95 %, SLA 99.9 %) so you are warned and can react before you owe customers money.

If your SLO is 99.9% and you've already burned the month's budget, *stop deploying risky changes* and shore up reliability instead (budget math and freeze policy: §13.11).

</details>

## 15.6 Alerting principles

<details>
<summary><strong>Read as text</strong> — symptoms over causes, and burn-rate paging</summary>

- Alert on **symptoms** users feel (latency, error rate), not on causes (CPU > 80%).
- Every alert must be **actionable** — if a human can't do something, delete it.
- Page on **fast-burn SLO violations**; ticket on slow-burn.

**Burn rate** = how fast you are spending the error budget, relative to "exactly on schedule":

```
   burn rate = observed error rate ÷ error rate the SLO allows

   SLO 99.9 % → allowed error rate 0.1 %.  Observed 1.44 % → burn rate 14.4
   burn rate 1    → the budget lasts exactly the 30 days
   burn rate 14.4 → whole budget gone in 50 h  (720 h ÷ 14.4)

   Google SRE Workbook defaults (30-day SLO):
     2 % of budget spent in 1 h   (burn rate 14.4) → PAGE
     5 % of budget spent in 6 h   (burn rate 6)    → PAGE
     10 % of budget spent in 3 d  (burn rate 1)    → TICKET
```

</details>

## 15.7 Health checks (revisited for observability)

<details>
<summary><strong>Read as text</strong> — liveness, readiness and startup</summary>

- **Liveness** — am I alive? If no, kill me (kubernetes restarts).
- **Readiness** — am I ready to serve? If no, take me out of the LB pool, but don't kill me.
- **Startup** — give slow-starting services time before liveness checks count.

Kubernetes probe configuration and the common mistakes: §16.10.

</details>

## 15.8 RED and USE — two monitoring frameworks

![What to dashboard and keeping telemetry affordable infographic: a dashboard of the four golden signals (Latency p50 / p95 / p99, Traffic RPS, Errors %, Saturation CPU · memory · queue) tagged RED (Rate · Errors · Duration, per endpoint) and USE (Utilization · Saturation · Errors, per resource); an OpenTelemetry pipeline App code → OTel SDK → OTel Collector (tail sampling: keep errors + slow + 1 %) → any backend (Jaeger · Tempo · Datadog · Honeycomb · Prometheus · Loki); metric cardinality 5 methods × 10 status codes × 50 routes = 2,500 series vs + user_id (1 M users) → 2.5 billion series → out of memory; exemplar links a latency bucket to a trace_id; head-based vs tail-based vs priority sampling table; trap: user_id as a metric label.](diagrams/sd25_info_dashboards-telemetry_ai.png)

<details>
<summary><strong>Read as text</strong> — what to chart per endpoint and per resource</summary>

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

</details>

## 15.9 Sampling strategies for traces

<details>
<summary><strong>Read as text</strong> — head-based, tail-based and priority sampling</summary>

Tracing every request at high QPS is too expensive. Three strategies:

- **Head-based sampling** — decide at the entry point (e.g., 1 %). Simple, but you may miss the rare slow request.
- **Tail-based sampling** — keep the trace only after seeing the full request (e.g., keep all errors, all slow requests, plus 1 % of normal). Requires holding spans in memory briefly.
- **Probabilistic with priorities** — always keep errors and high-value endpoints; sample background traffic.

Tail-based sampling usually runs in the OpenTelemetry Collector (its tail-sampling processor) or a vendor proxy such as Honeycomb Refinery. Useful telemetry > 100 % telemetry.

</details>

## 15.10 Metric cardinality — the silent killer

<details>
<summary><strong>Read as text</strong> — why label values multiply, and where high-cardinality data belongs</summary>

Each unique combination of label values is a separate time series, so the series count is the *product* of each label's distinct values: 5 methods × 10 status codes × 50 routes = 2,500 series. Add `user_id` with 1 M users → 2.5 billion series → Prometheus runs out of memory.

```
   Good:   http_requests_total{method="GET", status="200", route="/api/orders"}
   Bad:    http_requests_total{user_id="42", request_id="abc-..."}
```

Rule of thumb: only use labels with a small, bounded set of values (tens, not millions). Put high-cardinality fields (user ID, request ID) in **logs or traces** (which are designed for it), not metrics.

**Exemplars** connect the two: a histogram bucket can carry a sample `trace_id`, so a latency spike on the dashboard links straight to one real slow trace.

</details>

## 15.11 OpenTelemetry — one SDK to rule them all

<details>
<summary><strong>Read as text</strong> — one SDK, a collector and any backend</summary>

OTel is the vendor-neutral standard for emitting traces, metrics, and logs. The mental model:

```
   App code  ──▶ OTel SDK  ──▶ OTel Collector  ──▶ any backend
                                                    (Jaeger, Tempo,
                                                     Datadog, Honeycomb,
                                                     Prometheus, Loki, ...)
```

Adopting OTel decouples your code from your observability vendor — switch back-ends without touching app code. This is now the default in most new services.

</details>

## 15.12 The four golden signals (Google SRE)

<details>
<summary><strong>Read as text</strong> — latency, traffic, errors and saturation</summary>

For every user-facing service, dashboard the four:

1. **Latency** — how long requests take (split successful vs error).
2. **Traffic** — how much demand (RPS).
3. **Errors** — rate of failed requests.
4. **Saturation** — how "full" the service is (CPU, memory, queues).

If you measure only four things, measure these.

</details>

---

# PART 16: DEPLOYMENT & INFRASTRUCTURE

## 16.1 Containers — what changed

![Containers, Kubernetes and service mesh infographic: VM stack (App, Libs, Guest OS — heavy, Hypervisor, Host OS / hardware; GB image, seconds–minutes to boot) beside a container stack (App, Libs, Container runtime, Host OS with shared kernel; MB image, ms–seconds to start); a Kubernetes cluster with a control plane (API server · scheduler · etcd) over three nodes of pods, managed by Deployments / StatefulSets and exposed via Services / Ingress; a service mesh where pod A's sidecar proxy talks mTLS to pod B's sidecar proxy (Istio / Envoy, Linkerd / Rust proxy, Cilium / eBPF); what Kubernetes gives for free; VM vs container table; note that Kubernetes runs OCI images via containerd or CRI-O (Docker Engine support dropped in v1.24, 2022); trap: treating a container like a VM.](diagrams/sd25_info_containers-k8s_ai.png)

<details>
<summary><strong>Read as text</strong> — containers vs VMs, and OCI images</summary>

> **Simple Explanation:** A container packages your app + its dependencies into a runnable image that behaves the same on every machine. It's not a VM (no kernel of its own), but it feels like one.

```
   VM                              CONTAINER
   ┌──────────────┐                ┌──────────────┐
   │ App          │                │ App          │
   │ Libs         │                │ Libs         │
   │ Guest OS     │  ← heavy       ├──────────────┤
   ├──────────────┤                │ Container    │
   │ Hypervisor   │                │ runtime      │
   ├──────────────┤                ├──────────────┤
   │ Host OS /    │                │ Host OS      │
   │ hardware     │                │ (shared      │
   │              │                │  kernel)     │
   └──────────────┘                └──────────────┘
   GB image, seconds–minutes       MB image, milliseconds–
   to boot                         seconds to start
```

Docker popularised the format. Today images follow the **OCI** (Open Container Initiative) standard, and Kubernetes runs them with **containerd** or **CRI-O** (it dropped its built-in Docker Engine support in v1.24, 2022) — images built with Docker still run unchanged.

</details>

## 16.2 Kubernetes — the minimum viable mental model

<details>
<summary><strong>Read as text</strong> — cluster, nodes, pods and what you get for free</summary>

```
   ┌──────────────────────────────────────────────────────┐
   │ Cluster                                              │
   │   ├─ Control plane (API server, scheduler, etcd)     │
   │   └─ Nodes (workers)                                 │
   │        └─ Pods (1+ containers that share network)    │
   │             managed by Deployments / StatefulSets    │
   │             exposed via Services / Ingress           │
   └──────────────────────────────────────────────────────┘
```

What k8s gives you for free: scheduling, self-healing (restart crashed pods), rolling updates, secrets/configmaps, service discovery, autoscaling (HPA), declarative infra (YAML).

</details>

## 16.3 Service mesh

<details>
<summary><strong>Read as text</strong> — sidecar proxies, and the sidecar-less modes</summary>

A proxy next to every pod (a *sidecar*) handles mTLS, retries, circuit breakers, observability, and traffic shaping — *without changing app code*. Examples: Istio (Envoy proxies), Linkerd (its own Rust proxy), Cilium (eBPF). Newer "sidecar-less" modes (Istio ambient mode, Cilium) move the proxy into a per-node component to cut the memory and latency cost of one proxy per pod.

```
   ┌──────── pod A ────────┐                ┌──────── pod B ────────┐
   │ app ──▶ sidecar proxy │ ═══ mTLS ═══▶  │ sidecar proxy ──▶ app │
   └───────────────────────┘                └───────────────────────┘
```

</details>

## 16.4 CI/CD

![CI/CD, deployment strategies and infrastructure as code infographic: pipeline Commit → CI (build · tests · lint · security scan) → artifact → CD (dev → stage → prod with gates) with trunk-based dev, small frequent commits, automated rollback, deploy many times a day; five rollout columns — Rolling (a few pods at a time, K8s default 25 %; simple / slow rollback), Blue/green (LB flipped to green; instant rollback / 2× cost), Canary (1 % → 5 % → 25 % → 100 %; risk-aware / needs metrics), Shadow (copy of live traffic to the new version, response dropped; safe testing in prod / beware duplicate writes), Feature flag (deploy dark, enable per user / tenant; decouples deploy from release); a 'pick by need' table; mix-ups: a PodDisruptionBudget does not limit rolling updates (maxSurge / maxUnavailable, default 25 % each) and only guards voluntary evictions; IaC Terraform / Pulumi / CloudFormation → git → PR → apply; trap: shadow traffic writing to real databases.](diagrams/sd25_info_cicd-deploys_ai.png)

<details>
<summary><strong>Read as text</strong> — the pipeline from commit to prod, and the practices</summary>

```
   Commit ──▶ CI (build + tests + lint + security scan) ──▶ artifact
       └─▶ CD (auto-deploy to dev → stage → prod with gates)
```

Practices: **trunk-based dev**, **small frequent commits**, **automated rollback**, **deployments multiple times per day**.

</details>

## 16.5 Deployment strategies

<details>
<summary><strong>Read as text</strong> — rolling, blue/green, canary, shadow and feature flags</summary>

```
   ROLLING       replace a few pods at a time            Simple, slow rollback
                 (K8s default: 25 %)
   BLUE/GREEN    spin up green, flip LB                  Instant rollback, 2× cost
   CANARY        send 1% → 5% → 25% → 100%               Risk-aware, needs metrics
   SHADOW        send mirrored traffic, drop response    Safe testing in prod
                                                         (beware duplicate writes)
   FEATURE FLAG  deploy dark, enable per user/tenant     Decouple deploy from release
```

In Kubernetes the pace of a rolling update is set by the Deployment's `maxSurge` / `maxUnavailable` (default 25 % each). A **PodDisruptionBudget** does *not* limit rolling updates — it only guards *voluntary* disruptions that go through the eviction API, such as node drains during upgrades or autoscaler scale-down.

</details>

## 16.6 Infrastructure as Code (IaC)

<details>
<summary><strong>Read as text</strong> — infrastructure defined in code and versioned in git</summary>

Define infra in code (Terraform, Pulumi, CloudFormation), version it in git, apply via PRs. Eliminates "snowflake servers." Enables disaster recovery (rebuild the cluster from a repo).

</details>

## 16.7 Autoscaling

![Autoscaling, GitOps and progressive delivery infographic: GitOps loop Developer → PR → merge to Git → ArgoCD / Flux detects change → applies the manifests → cluster matches Git state, with git revert = rollback (auditable, reversible, disaster recovery); Argo Rollouts / Flagger progressive delivery 1 % → 5 % → 25 % → 100 % with a 'golden signals OK?' gate at each step and unhealthy → instant rollback, paired with feature flags (deploy ≠ release); autoscalers HPA → pods, Cluster Autoscaler → nodes, VPA → pod size, scale on queue depth / RPS not latency; comparison table of HPA, Cluster Autoscaler, VPA (often recommend-only) and predictive autoscaling; trap: scaling on latency.](diagrams/sd25_info_autoscale-gitops_ai.png)

<details>
<summary><strong>Read as text</strong> — HPA, Cluster Autoscaler, VPA and predictive scaling</summary>

- **Horizontal Pod Autoscaler (HPA)** — add/remove pods based on CPU/memory/custom metrics.
- **Cluster Autoscaler** — add/remove nodes based on pending pods.
- **Vertical Pod Autoscaler (VPA)** — adjusts a pod's CPU/memory *requests* (limits scale in proportion); traditionally by restarting the pod, so it is often run in "recommend only" mode.
- **Predictive autoscaling** — ML-based, scale up *before* the spike (e.g., daily peak).

Always scale on a **leading indicator** (queue depth, RPS) not a lagging one (latency).

</details>

## 16.8 GitOps

<details>
<summary><strong>Read as text</strong> — git as the source of truth, reconciled by a controller</summary>

> **Idea:** Git is the source of truth. A controller continuously reconciles the cluster to match what's in the repo.

```
   Developer ──▶ PR ──▶ merge ──▶ ArgoCD/Flux detects change
                                       │
                                       ▼
                                  applies the manifests (like kubectl apply)
                                       │
                                       ▼
                                  Cluster matches Git state
```

Benefits:
- **Auditable** — every change is a git commit.
- **Reversible** — `git revert` rolls back the cluster.
- **Disaster recovery** — rebuild a cluster by pointing the controller at the repo.

Standard tools: ArgoCD, Flux, Atlantis (for Terraform).

</details>

## 16.9 Progressive delivery — beyond rolling deploys

<details>
<summary><strong>Read as text</strong> — automated canary steps with instant rollback</summary>

```
   ┌──────────────────────────────────────────────────────────┐
   │ Argo Rollouts / Flagger:                                 │
   │   1. Deploy new version as a "canary" alongside stable   │
   │   2. Route 1 % of traffic                                │
   │   3. Check golden signals (latency, error rate)          │
   │   4. If healthy: 5 % → 25 % → 100 %                      │
   │   5. If unhealthy: instant rollback                      │
   └──────────────────────────────────────────────────────────┘
```

Pair with **feature flags** (LaunchDarkly, Unleash, OpenFeature) so the *deployment* and the *release* are decoupled — ship dark, flip on later, segment by user/tenant.

</details>

## 16.10 Kubernetes probes — get them right

![Running on Kubernetes infographic: a pod's app container with three probes — liveness ✗ → restart, readiness ✗ → removed from Service, startup → wait for warm-up — and a crossed-out 'never' wire from liveness to the DB (a DB hiccup would restart every pod in a loop); pod patterns Sidecar (log shipper / mesh proxy), Ambassador (retries, circuit breaking for external calls), Adapter (metrics exporter / log format); a StatefulSet db-0, db-1, db-2 each with its own PersistentVolume (EBS / PD / Ceph), operators (Postgres-operator, Strimzi for Kafka, Vitess-operator) or a managed DB (RDS, Cloud SQL, Aurora); image checklist: multi-stage build, distroless / scratch, USER 1000, pinned digest not :latest, one process per container, requests AND limits; trap: a liveness probe that checks the database.](diagrams/sd25_info_k8s-ops_ai.png)

<details>
<summary><strong>Read as text</strong> — the three probes and the common mistakes</summary>

```
   livenessProbe:    am I alive?            fails → kubelet restarts container
   readinessProbe:   am I ready to serve?   fails → removed from Service endpoints
   startupProbe:     am I done starting?    protects slow boots from liveness kill
```

Common mistakes:
- Using the same endpoint for liveness *and* readiness — if it checks the DB, a DB hiccup restarts every pod (a restart loop) instead of just taking them out of rotation.
- Liveness probes that check downstream services (cascading failure).
- No startup probe on JVM apps → kubelet kills them mid-warmup.

</details>

## 16.11 Container best practices

<details>
<summary><strong>Read as text</strong> — small, non-root, pinned images with requests and limits</summary>

- **Multi-stage builds** — keep final images small (`FROM ... AS builder` → `FROM distroless`).
- **Distroless or scratch base images** — fewer CVEs, smaller attack surface.
- **Non-root user** — `USER 1000` in your Dockerfile.
- **Pinned image digests**, not `:latest` (reproducible builds, security).
- **One process per container** — let the orchestrator manage processes.
- **Resource requests AND limits** — without requests, the scheduler can over-pack nodes; without limits, one pod can starve the rest.

</details>

## 16.12 Sidecar, ambassador, adapter — the three k8s patterns

<details>
<summary><strong>Read as text</strong> — the three helper-container patterns</summary>

```
   SIDECAR     auxiliary container in the same pod     log shipper, mesh proxy
   AMBASSADOR  proxy that wraps external calls         retries, circuit breaking
   ADAPTER     normalizes the app's outputs            metrics exporter, log format
```

The service mesh sidecar (Envoy) is the most famous example, but the pattern is general — anywhere you'd patch app code, consider a sidecar instead.

</details>

## 16.13 Statefulness — the elephant in the cluster

<details>
<summary><strong>Read as text</strong> — StatefulSets, volumes, operators — or a managed database</summary>

Kubernetes is great at stateless. For stateful (databases, brokers), it's *acceptable* but never effortless:

- **StatefulSets** — stable network IDs and persistent volumes per pod.
- **PersistentVolumes** — backed by EBS / PD / Ceph — failover requires the volume to be re-attachable.
- **Operators** — controllers that codify operational knowledge (Postgres-operator, Strimzi for Kafka, Vitess-operator).

Many teams (correctly) **run databases as managed services** (RDS, Cloud SQL, Aurora) and only run stateless workloads in K8s.

</details>

---

# PART 17: SEARCH & MISC BUILDING BLOCKS

## 17.1 Full-text search & inverted index

![Comparison infographic of three specialised indexes: an inverted index built from doc1 'the cat sat', doc2 'the dog ran', doc3 'the cat ran' where the query cat AND ran intersects [doc1, doc3] and [doc2, doc3] to give doc3; geo indexes (Geohash, Quadtree, R-tree, S2, H3) for 'within 1 km' lookups; and distributed IDs with the 64-bit Snowflake layout (1 | 41-bit ms time | 10-bit machine | 12-bit seq giving about 69 years, 1,024 machines and 4,096 IDs per ms per machine), an ID-scheme table (auto-increment, UUIDv4, UUIDv7, Snowflake, ULID, KSUID), a pick-by-need table, common mix-ups and the trap that random UUIDv4 primary keys scatter inserts across the index.](diagrams/sd25_info_indexes-ids_ai.png)

<details>
<summary><strong>Read as text</strong> — the inverted index and a worked query</summary>

> **Idea:** Flip the table — instead of "document → words," build "word → documents that contain it."

```
   Documents:                       Inverted index:
   doc1: "the cat sat"              "cat"  → [doc1, doc3]
   doc2: "the dog ran"              "dog"  → [doc2]
   doc3: "the cat ran"              "ran"  → [doc2, doc3]
                                    "sat"  → [doc1]
                                    ("the" dropped as a stop word)
   Query "cat AND ran" → intersect [doc1, doc3] ∩ [doc2, doc3] → [doc3]
```

Elasticsearch / OpenSearch / Solr / Lucene build on this with relevance ranking (TF-IDF, BM25), analyzers (tokenization, stemming), and aggregations.

</details>

## 17.2 Geo-spatial indexes

<details>
<summary><strong>Read as text</strong> — geohash, quadtree, R-tree, S2 and H3</summary>

| Structure | How | Used by |
|-----------|-----|---------|
| **Geohash** | Encode lat/lon to a string; shared prefix = nearby area | Redis GEO, Elasticsearch |
| **Quadtree** | Recursively subdivide 2D space into 4 quadrants (split dense areas more) | In-memory "nearby" services (classic Yelp-style design) |
| **R-tree** | Hierarchical bounding rectangles | PostGIS, SQLite R*Tree |
| **S2** | Google's spherical geo-indexing (hierarchical cells) | Google Maps, MongoDB `2dsphere` |
| **H3** | Uber's hexagonal grid | Uber dispatch & pricing |

"Find restaurants near me within 1 km" → geo-index lookup, not a full scan.

</details>

## 17.3 Distributed unique IDs

<details>
<summary><strong>Read as text</strong> — the ID schemes compared, and the Snowflake bit layout</summary>

| Scheme | Looks like | Pros | Cons |
|--------|------------|------|------|
| **Auto-increment** | 1, 2, 3 | Simple, sortable | Centralized, doesn't shard |
| **UUIDv4** | random 128-bit | Decentralized, no coordination | Random → bad index locality |
| **UUIDv7** | 128-bit, millisecond-time prefix + random | Sortable + decentralized | 128 bits; standardised only in 2024 (RFC 9562), so older libraries lack it |
| **Snowflake** (Twitter) | 64-bit `[41-bit ms time][10-bit machine][12-bit seq]` | Sortable, fits in a `long` | Needs machine ID coordination; clock skew |
| **ULID** | 128-bit, 26 chars Crockford base32 | Sortable + URL-safe | Twice the size of a 64-bit ID; not an IETF standard |
| **KSUID** | 160-bit, 27 chars base62 | Time-sortable | Larger still; second-level time precision |

Snowflake's layout gives 2¹² = 4,096 IDs per millisecond per machine, 2¹⁰ = 1,024 machines, and 2⁴¹ ms ≈ 69 years before the clock field wraps.

**Modern default:** UUIDv7 (now built into e.g. PostgreSQL 18 as `uuidv7()`) or Snowflake-style.

</details>

## 17.4 Service discovery

![Map infographic of how services find and call each other: service discovery (client-side registry Consul / etcd, server-side stable LB via Kubernetes kube-proxy, DNS-based b.default.svc.cluster.local), an API gateway taking Web / iOS / Android traffic through 8 features (AuthN/AuthZ, rate limits + quotas, transform, caching, routing / versioning, BFF aggregation, observability, WAF), webhook (Stripe POST to your /stripe-events, no open connection) versus server push (open WebSocket / SSE to a user's browser, live score ticker) with a comparison table, four webhook tips (HMAC sign, retry with backoff, idempotency keys, allow-list against SSRF), a pick-by-question table and the trap that receivers that don't dedupe create duplicates on retry.](diagrams/sd25_info_discovery-gateway_ai.png)

<details>
<summary><strong>Read as text</strong> — client-side, server-side and DNS-based</summary>

How does service A find an instance of service B in a cluster where pods come and go every minute?

- **Client-side** — clients query a registry (Consul, etcd) and pick an instance.
- **Server-side** — clients hit a stable LB endpoint that routes to a live instance (Kubernetes Services do this via kube-proxy).
- **DNS-based** — registry exposes records via DNS (in Kubernetes: `<service>.<namespace>.svc.cluster.local`, e.g. `b.default.svc.cluster.local`).

</details>

## 17.5 API gateway features (consolidated)

<details>
<summary><strong>Read as text</strong> — everything a gateway does, and the BFF pattern</summary>

```
   ┌────────────────────────────────────────────┐
   │ AuthN/AuthZ (validate JWT/OAuth)           │
   │ Rate limiting + quotas                     │
   │ Request/response transformation            │
   │ Caching                                    │
   │ Routing / versioning                       │
   │ Aggregation (BFF pattern)                  │
   │ Observability (logging, tracing)           │
   │ WAF integration                            │
   └────────────────────────────────────────────┘
   Examples: Kong, Apigee, AWS API GW, Envoy, GCP API GW
```

(BFF = backend-for-frontend: one gateway per client type — web, iOS, Android — that combines several backend calls into the one response that screen needs.)

</details>

## 17.6 Webhooks

<details>
<summary><strong>Read as text</strong> — server-to-server callbacks and four tips</summary>

The inverse of polling: the server calls *you* when something happens. Tips:
- **Sign** the payload (HMAC) so receivers can verify origin (see §17.11).
- **Retry** with backoff on non-2xx.
- **Idempotency** keys so receivers can dedupe.
- **Allow-list** outgoing destinations to avoid SSRF.

</details>

### Webhook vs server push — what's the difference?

<details>
<summary><strong>Read as text</strong> — between systems vs to a user who is online</summary>

Both are "server-initiated," but they push to *different* receivers:

- **Webhook** — *server-to-server*. Your backend sends an HTTP `POST` to *another system's* public URL when an event happens (e.g. Stripe → your `/stripe-events` endpoint). There's no persistent connection; the receiver just has to be a reachable HTTP endpoint. Best for cross-system, asynchronous integrations.
- **Server push** (SSE / WebSocket, Ch 23 §3.18–3.19) — *server-to-connected-client*. Your server pushes data down an *already-open* connection to a browser or app the user has live right now (e.g. a live score ticker). It needs a long-lived connection that you maintain.

Rule of thumb: a **webhook** delivers an event *between systems*; **server push** delivers an update *to a user who is online at this moment*.

</details>

## 17.7 Pagination — the right way

![Concept infographic on pagination and Big-O at scale: offset pagination (?page=42&size=20) scans and throws away every earlier row, O(offset), while a cursor (base64 of the last row's (created_at, id)) does an index seek, O(log N + page); a scale ladder 1 user → 1k → 100k → 1M → 100M → 1B with the fix at each step; seven complexity chips from O(1) cache lookup to O(N²) cross join with '1 core ≈ 10⁸ ops/s → O(N²) stays interactive only to N ≈ 10⁴'; an offset / cursor / keyset compare table, when to use cursors, and the trap of offset pagination for infinite scroll.](diagrams/sd25_info_pagination-bigo_ai.png)

<details>
<summary><strong>Read as text</strong> — offset vs cursor vs keyset, and how a cursor works</summary>

```
   Offset-based  ?page=42&size=20   simple, slow for big offsets,
                                    unstable when items are inserted
   Cursor-based  ?cursor=opaque     fast (uses index), stable, opaque to client
   Keyset        ?after_id=12345    fast, requires sortable key
```

For infinite scroll / API consumers, **cursor or keyset**, not offset.

**How a cursor actually works:** the cursor is an opaque token — usually a base64-encoded copy of the last row's sort key, e.g. `(created_at, id)`. The next page runs `WHERE (created_at, id) < (:last_created, :last_id) ORDER BY created_at DESC, id DESC LIMIT 20`, which is an **indexed seek**. So it stays **O(log N + page)** no matter how deep you scroll, while offset is **O(offset)** — the database must count and throw away every earlier row. A cursor is also *stable*: rows inserted while you page don't shift results or create duplicates. The trade-off: you can only move next/previous, not jump straight to "page 500."

</details>

## 17.8 Big-O for the system designer

<details>
<summary><strong>Read as text</strong> — the ladder of scale from 1 user to 1B</summary>

A rough ladder of scale — at each tier the bottleneck (and the fix) changes:

```
   1 user            anything works
   1k users          a single server + DB is fine
   100k users        add a cache and a CDN
   1M users          replicas + maybe one shard, queue for async work
   100M users        sharding, multi-region, fan-out
   1B users          dedicated infra, custom protocols, regional autonomy
```

</details>

### The complexities that actually bite at scale

<details>
<summary><strong>Read as text</strong> — the cost per operation and the one-second rule</summary>

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

</details>

## 17.9 Search relevance — TF-IDF and BM25

![Concept infographic on search relevance and geohash precision: an IDF bar chart for the three example docs (the: ln(3/3) = 0, cat: ln(3/2) ≈ 0.41, sat: ln(3/1) ≈ 1.10), a score-vs-term-frequency graph where TF-IDF keeps rising and BM25 saturates (k1 ≈ 1.2, b = 0.75, Lucene default since 6.0), nested geohash cells for lengths 4–8 (each extra char ≈ 32× finer), a 3 × 3 grid with 'me' in the centre and a driver 10 m away in a neighbour cell, a geohash precision table from ~39 km × 20 km (city) to ~38 m × 19 m (building), and the trap of querying only your own geohash cell.](diagrams/sd25_info_relevance-geohash_ai.png)

<details>
<summary><strong>Read as text</strong> — the formulas and a worked IDF example</summary>

How does Elasticsearch decide "doc A is more relevant than doc B" for a query?

```
   TF-IDF score(term, doc) = TF(term, doc) × IDF(term)

      TF  = how often the term appears in the doc (more = more relevant)
      IDF = log(total_docs / docs_containing_term)
            common words ("the") have low IDF; rare words have high IDF
```

Using the three documents from §17.1 (natural log): "the" is in all 3 docs → IDF = ln(3/3) = 0, so it never helps; "cat" is in 2 → ln(3/2) ≈ 0.41; "sat" is in 1 → ln(3/1) ≈ 1.10. A match on the rare word "sat" counts almost 3× more than a match on "cat".

**BM25** is the modern default (Lucene since 6.0). It dampens TF growth (a 100× repeated word isn't 100× more relevant) and normalizes for document length:

```
   BM25 term score = IDF × tf × (k1 + 1) / (tf + k1 × (1 − b + b × docLen / avgDocLen))
                     k1 ≈ 1.2 (how fast TF saturates), b = 0.75 (length normalisation)
```

Most search systems use it under the hood.

Modern search adds a *second stage*: neural ranking with embeddings (RAG-style semantic search) on top of BM25 candidates. See [Ch 28](#content/28_semantic_search).

</details>

## 17.10 Geohash — the precision table

<details>
<summary><strong>Read as text</strong> — cell size per hash length and the neighbour query</summary>

A geohash string represents a rectangle on Earth. Each character refines the rectangle ~32× (5 bits).

| Length | Cell size | Use case |
|--------|-----------|----------|
| 4 | ~39 km × 20 km | City |
| 5 | ~4.9 km × 4.9 km | Neighbourhood |
| 6 | ~1.2 km × 0.6 km | Block |
| 7 | ~153 m × 153 m | Building cluster |
| 8 | ~38 m × 19 m | Building |

"Find drivers near me" → compute the geohash of my location, query that cell + the 8 neighbours (a driver 10 m away can sit just across a cell edge, with a different prefix), then sort by exact distance.

</details>

## 17.11 Webhook security in practice

![Map infographic of four building blocks: a signed webhook (sender computes sig = HMAC_SHA256(secret, ts + "." + body) with X-Timestamp / X-Signature headers; receiver rejects if older than 5 min, uses a constant-time compare else 403, and acks-and-skips seen event ids), a notification pipeline (event → user prefs → template per channel → provider queues APNs / FCM / SES / Twilio → track delivery → throttle per user, with pitfalls), feature flags (kill switch, targeted rollout to 1 % of users, A/B test; LaunchDarkly, Unleash, Flagsmith, OpenFeature), and typeahead (trie a → m → a → z branching to amazon 1e8, amazing 1e6, amazonbasics, amazfit; cached top results per prefix, under 50 ms, amaz0n → amazon), plus a pick-by-question table and the trap of signing only the body.](diagrams/sd25_info_webhooks-flags_ai.png)

<details>
<summary><strong>Read as text</strong> — sign timestamp + body, block replays, compare in constant time</summary>

```
   SENDER
     ts  = now()
     sig = HMAC_SHA256(secret, ts + "." + body)
     POST body  with headers  X-Timestamp: ts,  X-Signature: sig

   RECEIVER
     if |now() − ts| > 5 min                          → reject      (replay)
     expected = HMAC_SHA256(secret, ts + "." + body)
     if !constant_time_eq(sig, expected)              → reject 403  (forged / tampered)
     if event id already processed                    → ack, skip   (idempotency)
```

The timestamp is *inside* the signed string; otherwise an attacker could replay an old request with a fresh timestamp header (Stripe and Slack sign `timestamp + body` for this reason).

**What is HMAC?** HMAC (Hash-based Message Authentication Code) is a fingerprint of a message that *also* proves who sent it. You feed two things into a hash function (like SHA-256): the message **body** and a **shared secret** that only the two parties know. Anyone can hash the body, but only someone who holds the secret can produce the *correct* HMAC. So a matching value proves two things at once: (1) the body wasn't tampered with in transit, and (2) it really came from someone who has the secret. HMAC is *symmetric* (both sides share the same secret) and very fast — that's the difference from a digital signature, which uses a private/public key pair instead. (Internally HMAC hashes twice with the key mixed in; always call a library `HMAC` function — a home-made `sha256(secret + body)` is open to length-extension attacks.)

GitHub, Stripe, and Slack all sign their webhook payloads with HMAC-SHA256. Always use a **constant-time** comparison to avoid timing attacks, and always check the timestamp to block replays.

</details>

## 17.12 Notification systems — the building blocks

<details>
<summary><strong>Read as text</strong> — the five steps and the common pitfalls</summary>

```
   Event ──▶ Notification service:
              1. Lookup user preferences (channels: push / email / SMS / in-app)
              2. Render template per channel
              3. Push to per-channel provider queue (APNs / FCM / SES / Twilio)
              4. Track delivery + bounces + opens
              5. Apply throttling per user (don't spam)
```

Common pitfalls: synchronous send (ruins request latency), no deduplication (sends the same alert 5×), no rate limits per user (user disables your app).

</details>

## 17.13 Feature flags — the senior engineer's safety net

<details>
<summary><strong>Read as text</strong> — kill switch, targeted rollout and A/B testing</summary>

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

</details>

## 17.14 The autocomplete / typeahead building block

<details>
<summary><strong>Read as text</strong> — a trie, popularity scores and a per-prefix cache</summary>

```
   user types "amaz"      → query → prefix matches sorted by popularity
                                     "amazon"      (popularity: 1e8)
                                     "amazing"     (popularity: 1e6)
                                     "amazonbasics"
                                     "amazfit"
```

Standard implementation: **Trie** (in-RAM, per shard) + **score** per leaf. Update score offline (batch job over search logs). Cache the top results per prefix. Sub-50 ms response is the bar.

Personalization adds a re-ranking step using user history. Typos are handled with fuzzy matching (edit distance: `amaz0n` → `amazon`), and modern systems add embeddings for semantic matches.

</details>

---

# PART 18: MULTI-REGION ARCHITECTURE

## 18.1 Why go multi-region

![Comparison infographic on going multi-region: a world map joining Tokyo and Virginia with '≈ 150 ms round trip' (light in fibre alone ≈ 110 ms, ~11,000 km each way), three real reasons (latency, disaster recovery, compliance such as GDPR, India's DPDP Act and China's data-localisation rules) and the wrong reason 'it sounds robust'; three topology columns (active-passive with DNS flip + DB promote taking minutes, active-active sharded by user with user42 in EU and user43 in US, active-active fully replicated with conflicts); a data-replication table (primary → replica, multi-primary, sharded by user, global DB such as Spanner / Cosmos / Yugabyte); a pick-by-need table, common mix-ups and the trap of going multi-region before an SLO demands it.](diagrams/sd25_info_multiregion-topologies_ai.png)

<details>
<summary><strong>Read as text</strong> — latency, disaster recovery, compliance — and the wrong reason</summary>

Three real reasons (and the wrong fourth):

1. **Latency** — users in Tokyo shouldn't round-trip to Virginia (~150 ms per round trip in practice; light in fibre alone needs ~110 ms for the ~11,000 km each way).
2. **Disaster recovery** — an entire region (yes, an entire AWS region) can go down.
3. **Compliance / data sovereignty** — laws restrict where personal data may be stored or sent (EU GDPR transfer rules, India's DPDP Act, China's data-localisation rules).

Wrong reason: **"because it sounds robust."** Multi-region at least doubles complexity and cost. Don't do it before you have an SLO that demands it.

</details>

## 18.2 The three topologies

<details>
<summary><strong>Read as text</strong> — active-passive, active-active sharded and fully replicated</summary>

```
   ┌──────────────────────────────────────────────────────────────────┐
   │ ACTIVE-PASSIVE         one region serves; another stands by      │
   │   Simplest. Fastest to ship. Wasted standby capacity.            │
   │   Failover = DNS flip + DB promote (minutes).                    │
   │                                                                  │
   │ ACTIVE-ACTIVE (sharded by user)                                  │
   │   Each user "lives" in one home region. Cross-region only for    │
   │   admin / global queries. Most modern global apps do this.       │
   │                                                                  │
   │ ACTIVE-ACTIVE (fully replicated)                                 │
   │   Every region can serve every user with full data replication.  │
   │   Highest complexity (conflict resolution, write fan-out).       │
   │   Used by truly global products (Twitter, Spanner-backed apps).  │
   └──────────────────────────────────────────────────────────────────┘
```

</details>

## 18.3 Data replication topologies

<details>
<summary><strong>Read as text</strong> — primary-replica, multi-primary, home region and global DB</summary>

```
   PRIMARY → REPLICA (per region)         all writes hit one primary; replicas
                                          serve reads. Simple, but writes are
                                          slow for far-away users.

   MULTI-PRIMARY (per region)             each region accepts writes locally;
                                          replicate to others async. Need
                                          conflict resolution (CRDTs, LWW,
                                          per-row sharding).

   SHARDED-BY-USER (home region)          user42 lives in EU; user43 in US.
                                          Writes for user42 always go EU.
                                          Crossover requires a redirect.

   GLOBAL DB (Spanner, Cosmos, Yugabyte)  the DB itself handles cross-region
                                          consistency. Slowest writes,
                                          strongest semantics.
```

</details>

## 18.4 Traffic steering — getting users to the right region

![Map-style infographic on running multi-region: a traffic-steering table (GeoDNS via AWS Route 53 / Cloudflare with failover waiting on DNS TTLs, Anycast IP where BGP picks the nearest site, health-aware GSLB, client-side region lists) with the plan 'EU down → EU users rerouted to US, US users unaffected'; split-brain shown as EU and US both shouting 'I'm primary!' across a partition versus an EU/US/witness triangle with 'Quorum: 2 of 3', plus four defences (quorum election, asymmetric authority, fence tokens, CRDTs); data sovereignty with EU and US profile + behaviour data sending only anonymised aggregates (no PII) to global analytics; and the five costs of being global (egress, 2× storage, idle standby, engineering, schema migrations).](diagrams/sd25_info_multiregion-ops_ai.png)

<details>
<summary><strong>Read as text</strong> — GeoDNS, anycast, GSLB and client-side discovery</summary>

```
   METHOD                  EXAMPLES                     HOW IT PICKS / FAILS OVER
   GeoDNS                  AWS Route 53, Cloudflare     answers by the resolver's location;
                                                        failover waits for DNS TTLs
                                                        (seconds–minutes)
   Anycast IP              CDNs, public DNS resolvers   one IP announced from many sites;
                                                        BGP routing picks the nearest
   GSLB (Global Server LB) F5, NetScaler, cloud LBs     health-aware: sends traffic only
                                                        to healthy regions
   Client-side discovery   mobile apps with a           the app holds the region list and
                           region list                  chooses / retries itself
```

Plan your **failover behaviour** in advance: if EU goes down, do US users notice (they shouldn't) and do EU users get rerouted to US (latency hit, better than nothing)?

</details>

## 18.5 Split-brain — the multi-region nightmare

<details>
<summary><strong>Read as text</strong> — two primaries after a partition, and the defences</summary>

> A network partition between regions can let both sides think they're the primary. They both accept writes. Now you have *two* divergent histories that must merge.

Defences:
- **Quorum-based leader election across regions** (requires odd number — 3 regions or 2+1 witness).
- **Asymmetric authority** — one region is always the writer; others read-only until manual failover.
- **Fence tokens** — old primaries are rejected by storage layer after a new one is elected.
- **CRDTs** — conflict-free merge by construction (only works for compatible data types).

</details>

## 18.6 Data sovereignty patterns

<details>
<summary><strong>Read as text</strong> — keep PII in its region, export only aggregates</summary>

```
   ┌───────────────────────────────────────────────────────────────┐
   │ EU user                  US user                              │
   │   ├─ profile in EU         ├─ profile in US                   │
   │   ├─ behaviour data in EU  ├─ behaviour data in US            │
   │   └─ encrypted aggregates → global analytics (no PII)         │
   └───────────────────────────────────────────────────────────────┘
```

Modern GDPR/DPDP-compliant designs **shard PII by region** and only export *anonymized aggregates* globally. Differential privacy and federated analytics are increasingly used to satisfy regulators.

</details>

## 18.7 The cost of being global

<details>
<summary><strong>Read as text</strong> — egress, storage, standby, engineering and migrations</summary>

| Cost | Why it shows up |
|------|-----------------|
| **Egress fees** | Every byte replicated between regions is billed per GB, around the clock — on top of normal internet egress |
| **Replicated storage** | 2× regions ≈ 2× DB storage |
| **Idle standby** | Active-passive wastes one region's compute |
| **Engineering** | DR drills, runbooks, multi-region testing, observability per region |
| **Schema migrations** | Now N×harder; must be backward and forward compatible |

Estimate it before committing. Often the right answer is "we'll go multi-region *next year*, once revenue justifies it."

</details>

---

# PART 19: COST & CAPACITY ENGINEERING (FinOps)

## 19.1 Why cost is a system-design concern

![Comparison infographic on cloud cost: an iceberg with instance hours, RDS and managed services above the waterline and seven hidden costs below it (egress & cross-AZ traffic, S3 request counts, CloudWatch log ingestion, idle dev/staging, over-provisioned reserved instances, old snapshots/AMIs/EBS, Lambda + API Gateway at high request rates); a stacked capacity-over-time chart of Reserved (baseline), Savings Plans (steady growth), Spot (batch/dev/CI) and On-demand (spikes); five pricing-model columns with discounts vs on-demand (0 %, ~30–40 %, ~50–60 % with AWS max 72 %, Savings Plans up to 66 % / 72 %, Spot up to 90 % with a 2-minute AWS / 30 s GCP warning); eight architecture cost killers; and an 'If you need … → use …' table.](diagrams/sd25_info_finops-costs_ai.png)

<details>
<summary><strong>Read as text</strong> — architecture decisions dominate the cloud bill</summary>

The cheapest line of code is the one you didn't write. The cheapest server is the one you didn't provision. At any non-trivial scale, **architectural decisions dominate the cloud bill** — choices like programming language or tooling usually matter far less.

</details>

## 19.2 The cost iceberg

<details>
<summary><strong>Read as text</strong> — the costs teams see and the ones they miss</summary>

```
   Visible (most teams measure):
     EC2 / K8s instance hours, RDS, managed services

   Hidden (often missed):
     Egress and cross-AZ traffic
     S3 list/get/put request counts (not bytes)
     CloudWatch ingestion (logs are expensive!)
     Idle dev/staging environments
     Over-provisioned reserved instances
     Snapshots, AMIs, old EBS volumes
     Lambda + API Gateway combo at high request rates
```

The first FinOps win is *always* deleting things — unused volumes, old snapshots, idle dev clusters.

</details>

## 19.3 Instance pricing models — pick the right mix

<details>
<summary><strong>Read as text</strong> — on-demand, reserved, savings plans and spot</summary>

| Model | Discount vs on-demand | Trade-off |
|-------|----------------------|-----------|
| **On-demand** | 0 % | No commit; full price |
| **Reserved (1-year)** | ~30–40 % | 1-year commitment; standard RIs are tied to an instance family and region |
| **Reserved (3-year)** | ~50–60 % (AWS max 72 %) | Long commit; risk of obsolescence |
| **Savings Plans** | similar to RIs (AWS: up to 66 % flexible, 72 % instance-family) | Commit to $/hour instead of an instance type; more flexible |
| **Spot / Preemptible** | up to 90 % | Can be reclaimed at short notice (2-minute warning on AWS, 30 s on GCP); need retryable workloads |

GCP's equivalents are *committed-use discounts* (1 or 3 years) and Spot VMs.

**Modern recipe:** Reserved for baseline, Savings Plans for steady growth, Spot for batch/dev/CI, on-demand for spikes.

</details>

## 19.4 Architecture-level cost killers

<details>
<summary><strong>Read as text</strong> — eight architecture choices that burn money</summary>

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

</details>

## 19.5 Right-sizing — the silent waste

![Infographic on right-sizing and the capacity-planning worksheet: a CPU gauge showing 10–20 % actual versus a 60 % target (3–6× more capacity than needed); a seven-step worked example 10 M DAU × 20 actions = 200 M/day ÷ 86,400 ≈ 2,300 RPS × 3 peak ≈ 7,000 RPS × 20 ms CPU = 140 busy cores ÷ 9.6 usable cores per 16-core server at 60 % ≈ 14.6 → 15 servers + 1 spare, with a side branch 1 KB per action → 200 GB/day ≈ 73 TB/year; a worksheet formula table (RPS, peak, servers, storage, egress, cost); right-sizing tools (VPA recommend mode, Karpenter / Cluster Autoscaler, stopping dev/staging nights and weekends); and tagging every resource by owner, service and environment for a monthly bill per team.](diagrams/sd25_info_capacity-planning_ai.png)

<details>
<summary><strong>Read as text</strong> — idle headroom and the tools that reclaim it</summary>

Many prod workloads run at 10–20 % CPU utilization "for headroom." If they could safely run at ~60 %, that is 3–6× more capacity than needed. Use:

- **Vertical Pod Autoscaler** (recommend mode) — learn the right requests/limits over time.
- **Karpenter / Cluster Autoscaler** — pack pods densely; scale down nodes overnight.
- **Stop dev/staging clusters on nights/weekends** — single biggest non-prod win.

</details>

## 19.6 Capacity planning — the back-of-envelope worksheet

<details>
<summary><strong>Read as text</strong> — the nine-step worksheet and a worked example</summary>

```
   1. Users:           ___M total, ___% daily active = ___M DAU
   2. Action freq:     ___ actions/user/day
   3. Total actions:   DAU × freq = ___/day → ÷ 86,400 = ___ RPS
   4. Peak factor:     2-3× average = ___ peak RPS
   5. Per-action cost: ___ ms CPU, ___ KB storage, ___ network bytes
   6. Server count:    peak RPS × CPU-seconds per request ÷ (cores per server × target util) = N
   7. Storage:         actions/day × KB × retention_days = ___ TB
   8. Egress:          users × responses × KB = ___ TB/month
   9. Cost:            N × $/hr × 720 + storage $/GB-mo + egress $/GB
```

Worked example (steps 2–7): 10 M DAU × 20 actions = 200 M actions/day ÷ 86,400 ≈ 2,300 RPS; × 3 peak ≈ 7,000 RPS. At 20 ms CPU each: 7,000 × 0.02 s = 140 busy cores. With 16-core servers at 60 % target utilisation (9.6 usable cores each): 140 ÷ 9.6 ≈ 14.6 → **15 servers** (+1 spare for N+1). Storage at 1 KB per action: 200 GB/day ≈ 73 TB/year.

Run it for the next 12, 24, and 36 months. The shape (linear? exponential? S-curve?) tells you whether to invest in efficiency now or later.

</details>

## 19.7 The single most useful FinOps practice

<details>
<summary><strong>Read as text</strong> — tag every resource and show each team its bill</summary>

> **Tag every resource with `owner`, `service`, `environment`.** Show each team their bill monthly. Visibility alone changes behaviour — once a team sees its own line item, idle resources get deleted and oversized ones right-sized, with no other mandate.

</details>

---

# PART 20: COMMON ANTI-PATTERNS

These are the recurring mistakes that look reasonable on a whiteboard but cause real production pain. Spotting them in a design discussion is what separates a senior from a staff engineer.

## 20.1 "Microservices first"

![Recap grid of eight design anti-patterns, each with its symptom and fix: microservices first (20 services before product-market fit → modular monolith), distributed monolith (6 services deployed in lockstep, shared DB, sync chains 4+ deep → schema boundaries, async events, contract tests), premature sharding (→ scale up first, Postgres ~10 TB on one box, read replicas, shard at a measured write ceiling), cache as source of truth (→ cache must be rebuildable), synchronous everywhere (→ async for emails, analytics, recommendations, webhooks), the 'eventually consistent' hand-wave (→ 'feed lags writes by < 5 s p99, no duplicates, no lost likes'), logs as a database (→ events table or warehouse) and one queue for everything (30 days vs 1 hour retention conflict → one topic per event type per producer), plus a 'Pick by Question' review table.](diagrams/sd25_info_antipatterns-design_ai.png)

<details>
<summary><strong>Read as text</strong> — start with a modular monolith</summary>

Splitting into 20 services before you have product-market fit. You pay all the costs (network, observability, deploys, data-consistency) for none of the benefits (independent teams, clear bounded contexts). Start with a **modular monolith**; split when team or scale demands it — *not* because microservices are fashionable.

</details>

## 20.2 The distributed monolith

<details>
<summary><strong>Read as text</strong> — lockstep deploys, the telltale signs and the fix</summary>

You split into microservices, but every change requires coordinated deploys of 6 services in lockstep. Telltale signs: shared DB across services, synchronous chains 4+ deep, no service can be deployed independently. Fix: enforce schema boundaries, async events, contract tests.

</details>

## 20.3 Premature sharding

<details>
<summary><strong>Read as text</strong> — scale up and replicate before you shard</summary>

Sharding a database that doesn't yet need it. Now every query is harder, every join is impossible, and you've doubled ops complexity for no benefit. **Postgres can comfortably handle 10 TB on a single beefy box.** Vertical-scale first, replicate for reads, *then* shard when you've measurably hit a write ceiling.

</details>

## 20.4 Cache as the source of truth

<details>
<summary><strong>Read as text</strong> — a cache must be rebuildable from the source</summary>

"We'll just keep it in Redis." Then Redis fails — and you discover the DB hasn't had that data for weeks. **A cache must be reproducible from the source of truth.** If it isn't, it's a database with a misleading name.

</details>

## 20.5 Synchronous everywhere

<details>
<summary><strong>Read as text</strong> — latencies add up — make late work async</summary>

Every action waits for every downstream. Latencies sum. One slow dependency = whole-site outage. Default to async for anything that can be late: emails, analytics, recommendations, webhooks.

</details>

## 20.6 "It's eventually consistent" hand-wave

<details>
<summary><strong>Read as text</strong> — say how eventual, and what users see meanwhile</summary>

Saying "eventually consistent" without specifying *how* eventual (seconds? minutes? hours?) and what the user sees during inconsistency. **Be specific:** "user feed lags writes by < 5s p99, never shows duplicates, and never loses likes."

</details>

## 20.7 Logs as a database

<details>
<summary><strong>Read as text</strong> — use an events table or a warehouse instead</summary>

Querying logs to answer business questions. Logs are append-only, expensive to query, and not your system of record. If you find yourself running grep over CloudWatch to compute revenue, you need a proper events table or warehouse.

</details>

## 20.8 One queue to rule them all

<details>
<summary><strong>Read as text</strong> — one topic per event type per producer</summary>

A single Kafka topic for "all events." Consumers get bottlenecks, ordering breaks, retention conflicts (analytics wants 30 days; auth wants 1 hour). **One topic per event type per producer**; group consumption by purpose.

</details>

## 20.9 No timeouts

![Recap grid of seven resilience and ops anti-patterns with symptom and fix: no timeouts (library defaults infinite → connect 1 s, read 3–10 s, overall ≤ caller's SLA / 2), read-after-write surprise (user pays and sees the old balance → read-your-writes, Ch 24 §8.6), retry storms (A retries B, load multiplies, B stays down → exponential backoff + jitter, retry budgets, circuit breakers), 'idempotency later' (double charges → idempotency keys from day one), the ops gap (→ SLOs, golden-signal dashboards, runbook, trained oncall), 'just use Lambda' (15-min cap, cold starts, connection pools, fan-out cost → containers / VMs for steady high RPS) and snowflake servers (→ IaC, everything in git, cattle not pets), plus a 'Pick by Question' table.](diagrams/sd25_info_antipatterns-ops_ai.png)

<details>
<summary><strong>Read as text</strong> — explicit connect, read and overall timeouts</summary>

Every HTTP/gRPC call without an explicit timeout is a future production outage. Default timeouts in many libraries are *infinite*. Always: connect timeout (1 s), read timeout (3-10 s), overall request timeout (≤ caller's SLA / 2).

</details>

## 20.10 Read-after-write surprises

<details>
<summary><strong>Read as text</strong> — reading a lagging replica right after a write</summary>

Writing to a DB then immediately reading from a replica that hasn't caught up. User pays, sees old balance, panics. Fix with Ch 24, §8.6 strategies — don't ignore it.

</details>

## 20.11 Retry storms

<details>
<summary><strong>Read as text</strong> — retries that keep a failing service down</summary>

Service B fails → service A retries → A's retries multiply the load on B → B stays down longer → more retries. Always: exponential backoff + jitter, retry budgets, circuit breakers.

</details>

## 20.12 "Idempotency, we'll add it later"

<details>
<summary><strong>Read as text</strong> — bake idempotency keys in from day one</summary>

You won't. By the time you need it (double charges, duplicate emails), you'll have refactor-debt across every endpoint. Bake idempotency keys in from day one for state-changing operations.

</details>

## 20.13 The Ops gap

<details>
<summary><strong>Read as text</strong> — what the definition of done must include</summary>

A new service ships without dashboards, alerts, or a runbook. The first oncall page is a ten-step debugging odyssey. **Definition of Done** includes: SLOs defined, golden-signal dashboards, runbook published, oncall trained.

</details>

## 20.14 "Just use Lambda"

<details>
<summary><strong>Read as text</strong> — the workloads serverless suits and the ones it does not</summary>

Serverless for the wrong workloads: long-running jobs (15-min cap), database-heavy work (cold-start + connection pool issues), or chatty fan-out (cost explodes). Use Lambda for true event-driven, sporadic work. Use containers/VMs for steady high-RPS workloads.

</details>

## 20.15 Snowflake servers

<details>
<summary><strong>Read as text</strong> — hand-built servers vs everything in git</summary>

Production servers configured by hand, no IaC, no reproducibility. The day they die, you discover the prior engineer's config tweaks aren't documented. **Everything in git.** Cattle, not pets.

</details>

---

# PART 21: WORKED EXAMPLE — DESIGNING INSTAGRAM

A full walk-through that exercises every previous section. Treat it as the template for any "design X" interview.

## 21.1 Step 1 — Clarify requirements

![Case-at-a-glance infographic for designing Instagram (part 1): requirements (upload photos and short videos, followers' feed, like/comment/hashtag search, DMs; 99.9 % reads, 99.99 % upload acks, p99 feed < 200 ms, strong consistency for follows, eventual for feed/likes/counts, regional residency); scale (500M DAU, 143M uploads/day ≈ 1,650/s peak 5,000/s, 75B views/day ≈ 870K/s peak 2.6M/s, ≈ 525 views per upload, 71 TB/day ≈ 26 PB/year of photos, 143 GB/day ≈ 52 TB/year of metadata); a four-layer architecture (edge: Client → CDN → API Gateway → L7 LB Envoy; stateless Upload, Feed, Like, Comment, Search services; S3, Redis, Cassandra, Postgres, Elasticsearch; Kafka fanning out to fan-out workers, transcoder, search indexer, Flink analytics, notifications); a key-decisions table and the seven-endpoint API sketch with Idempotency-Key and cursor pagination.](diagrams/sd25_info_instagram-design_ai.png)

<details>
<summary><strong>Read as text</strong> — functional and non-functional requirements</summary>

**Functional:**
- Users upload photos (and short videos).
- Followers see a chronological / ranked feed.
- Like, comment, search by hashtag.
- Direct messages.

**Non-functional:**
- Read-heavy (hundreds of photo views per upload — ≈ 500:1 by the estimates in §21.2).
- 99.9 % availability for reads; 99.99 % for upload acks.
- p99 feed load < 200 ms globally.
- Strong consistency for follows; eventual for feed/likes/comment counts.
- Global, must comply with regional data residency.

</details>

## 21.2 Step 2 — Estimates (back-of-envelope)

<details>
<summary><strong>Read as text</strong> — uploads, views, the read:write ratio and storage</summary>

```
   500M DAU
   × 2 photo uploads/user/week ÷ 7 = ~143M uploads/day = ~1,650 uploads/sec
   peak factor 3× = ~5,000 uploads/sec

   Reads (feed loads):  500M × 5 sessions × 30 photos = 75B photo views/day
                        ÷ 86,400 = ~870K views/sec
   peak (3×): ~2.6M views/sec
   read:write = 75B ÷ 143M ≈ 525 views per upload

   Storage per photo:   ~500 KB (compressed original; resized copies extra)
   Daily upload bytes:  143M × 500 KB ≈ 71 TB/day ≈ 26 PB/year (+ thumbnails)
   Metadata per photo:  ~1 KB → 143M × 1 KB ≈ 143 GB/day ≈ 52 TB/year
```

(Photos only — short videos would multiply the storage figures many times over.)

</details>

## 21.3 Step 3 — API sketch

<details>
<summary><strong>Read as text</strong> — the seven endpoints, idempotency keys and cursors</summary>

```
   POST   /v1/photos/upload-url        get a presigned S3 upload URL (§21.6)
   POST   /v1/photos/commit            save metadata after upload, returns photoId
   GET    /v1/feed?cursor=...          paginated feed
   POST   /v1/follow/{userId}          follow
   POST   /v1/like/{photoId}           like
   POST   /v1/comments                 comment
   GET    /v1/search?q=...&type=tag    search
```

All write endpoints take `Idempotency-Key`. Reads use cursor pagination.

</details>

## 21.4 Step 4 — Data model

<details>
<summary><strong>Read as text</strong> — the tables, their stores and QUORUM for follows</summary>

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

Follows need strong consistency (§21.1), so follow reads and writes use Cassandra's `QUORUM` level (with 3 replicas: write to 2, read from 2 — the read and write sets always overlap).

</details>

## 21.5 Step 5 — High-level architecture

<details>
<summary><strong>Read as text</strong> — edge, services, data and events</summary>

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

</details>

## 21.6 Step 6 — Photo upload flow

![Case-at-a-glance infographic for Instagram part 2: the hard part (big photos, celebrity fan-out), requirements (99.99 % upload acks, p99 feed load < 200 ms, eventual feeds and like counts) and scale (~1,650 uploads/sec, peak ~5,000; ~500 KB per photo; peak bytes 5,000 × 500 KB ≈ 2.5 GB/s sent straight to S3; ~525 views per upload); a photo-upload architecture where the client (1) POSTs /v1/photos/upload-url to the API and gets a write-only presigned URL (~5 min), (2) PUTs the bytes straight to S3, (3) POSTs /v1/photos/commit to the photo service, which writes metadata to Cassandra, emits photo.uploaded to Kafka and returns 201 Created {photoId}, then (4) async consumers (transcoder to thumbnail / medium / large → S3 → CDN, feed fan-out, search indexer, notification) react; push vs pull vs hybrid feed generation (push for users under 10k followers, pull big accounts at read time and merge, Redis sorted set per user); a key-decisions table; six 'what if it dies?' fallbacks (Cassandra 3 replicas + QUORUM 2 of 3, pull-only feed on Redis outage, other region's S3 copy via CDN, Kafka buffering to local disk, serving the original if the transcoder is behind, DNS-shifting users when a region is down); and the trap of proxying uploads through API servers.](diagrams/sd25_info_instagram-flows_ai.png)

<details>
<summary><strong>Read as text</strong> — presigned URL, commit, then async consumers</summary>

The key trick: the client uploads the photo **directly to S3**, not through your servers — which offloads a huge amount of bandwidth. Your API only hands out a temporary permission slip (a *presigned URL*) and records the metadata.

```
   1. Client → POST /v1/photos/upload-url   "I want to upload a photo"
        API checks auth + rate limit, then generates a short-lived S3
        presigned URL (write-only, expires in ~5 min) and returns it.

   2. Client → PUT <presigned-url>          uploads the raw bytes straight to S3
        Your servers never touch the file → no bandwidth cost, no proxying.

   3. Client → POST /v1/photos/commit       { s3Key, caption, location }
        Photo service:
          a. Validates the S3 object exists and is a real image
          b. Writes metadata to Cassandra (photoId, userId, s3Key, caption…)
          c. Emits "photo.uploaded" to Kafka
          d. Returns 201 Created { photoId }   ← the user sees success right away

   4. Async consumers react to "photo.uploaded":
          • Transcoder     → thumbnail / medium / large → S3 (served via the CDN)
          • Feed fan-out   → push photoId into followers' feeds (§21.7)
          • Search indexer → add caption + tags to Elasticsearch
          • Notification   → "X posted a new photo"
```

**Why split it into `upload-url` + `commit`?** The slow, big upload and the fast, small metadata write are separated, so a connection dropped mid-upload never leaves a half-written row in your database. The photo only "exists" once the client commits.

**Idempotency:** send an `Idempotency-Key` on `/commit` so a retry after a flaky response doesn't create a duplicate post.

**Hand-off to feed generation:** the `photo.uploaded` event is the bridge to feed generation (§21.7). The upload path returns immediately, and the expensive **fan-out runs in the background** — so the poster is never blocked while the post is pushed into millions of followers' feeds.

</details>

## 21.7 Step 7 — Feed generation (the heart of the system)

<details>
<summary><strong>Read as text</strong> — push, pull and the hybrid</summary>

Three strategies; large social feeds (Twitter's is the best-documented case) use a hybrid:

```
   PUSH (fan-out on write)   on upload, push photoId to every follower's
                             feed cache. Read = O(1). Write = O(followers).
                             Great for normal users; terrible for celebrities.

   PULL (fan-out on read)    on feed load, query last N photos from every
                             followee and merge. Read = O(followees × log N).
                             Cheap for celeb posts; expensive at read time.

   HYBRID (the standard answer)
                             Push for normal users (e.g. < 10k followers).
                             Pull for "big accounts" — read combines pushed
                             feed + recently fetched celeb posts.
```

Feed cache: Redis sorted set per user, scored by `created_at + ranking_signal`.

</details>

## 21.8 Step 8 — Scaling considerations

<details>
<summary><strong>Read as text</strong> — each scaling concern and its mitigation</summary>

| Concern | Mitigation |
|---------|------------|
| Hot celebrities | Hybrid feed; separate "big-account" cache shard |
| Hot photo (viral) | CDN absorbs reads; like counter sharded across keys and merged |
| Spam / abuse | Rate-limit uploads per user (token bucket); ML moderation queue |
| Search at scale | Elasticsearch with hashtag-sharded indices |
| Multi-region | Photo + follow stored in user's home region; cross-region reads via CDN |
| Sudden 10× traffic spike (live event) | Pre-scale, autoscale, shed non-critical (e.g., delay analytics ingestion) |
| Like fan-out storm | Aggregate likes in 1-second windows; flush to DB as deltas |

</details>

## 21.9 Step 9 — Failure modes (the senior bit)

<details>
<summary><strong>Read as text</strong> — what happens when each component dies</summary>

```
   • Cassandra node dies        → 3 replicas + QUORUM writes (2 of 3) keep accepting
                                  writes; hinted handoff + repair catch the node up
   • Redis cluster outage       → degrade to pull-only feed (slower but works)
   • S3 outage in one region    → reads fall back to the other region's copy
                                  (S3 cross-region replication) via the CDN
   • Kafka cluster unreachable  → buffer events to local disk; backfill on recovery
   • Transcoder pipeline behind → serve original; transcoded version "soon"
   • Region down                → DNS-shift users to nearest healthy region
```

Every component is asked: *what happens if you die?* And: *what do users see?*

</details>

## 21.10 Step 10 — Trade-offs called out

<details>
<summary><strong>Read as text</strong> — what the design gives up and why that is acceptable</summary>

- **Eventual consistency on like counts** → user may see N then N+1 briefly. Acceptable.
- **Feeds may lag uploads by seconds** during fan-out backlog. Acceptable for social media; would NOT be for financial systems.
- **Hybrid feed adds complexity** but is the only way to handle both Joe Public and Beyoncé.
- **Storing originals in S3** is durable + cheap, but transcoding costs CPU; caching the resized copies in the CDN spreads that cost over millions of views.
- **Each user's writes go to one home region** (active-active sharded by user, §18.2) — not multi-master. That satisfies data residency and avoids cross-region conflict resolution; the cost is extra latency for travelling users and a failover step if a home region dies. Revisit multi-master only when the product truly needs it.

</details>

---

# PART 22: PUTTING IT ALL TOGETHER

## 22.1 A reusable interview framework

![Interview-toolkit map: the 8-step framework cards (1 CLARIFY reqs and scale, 2 ESTIMATE QPS/storage/bandwidth, 3 API 3–5 key endpoints, 4 DATA entities and store, 5 HIGH-LEVEL client → LB → service → cache → DB, 6 DEEP DIVE the 2 hardest components, 7 BOTTLENECKS cache/shard/queue, 8 TRADE-OFFS CAP / PACELC); a 14-rung Dean / Norvig (~2010) latency ladder from L1 cache 0.5 ns to a California ↔ Netherlands round trip 150 ms, with main memory (100 ns) tagged 200× L1, datacenter round trip (0.5 ms) tagged 5,000× memory and the cross-continent trip tagged 300× datacenter; an estimation cheat-sheet (1 day = 86,400 s ≈ 10⁵ s, 1 month ≈ 2.5 × 10⁶ s, 1 year ≈ 3 × 10⁷ s, 100M users × 10 actions/day = 10⁹/day ≈ 12k/sec, peak 2–3× ≈ 23–35k/sec, × 1 KB ≈ 1 TB/day ≈ 365 TB/year); and a pick-by-question table.](diagrams/sd25_info_interview-toolkit_ai.png)

<details>
<summary><strong>Read as text</strong> — the eight steps from clarify to trade-offs</summary>

```
   1. CLARIFY     — functional & non-functional reqs, scale numbers
   2. ESTIMATE    — QPS, storage/year, bandwidth (back-of-envelope)
   3. API         — define the 3-5 most important endpoints
   4. DATA        — entities, schemas, choose the data store
   5. HIGH-LEVEL  — boxes & arrows: client → LB → service → cache → DB
   6. DEEP DIVE   — pick the 2 hardest components, design them well
   7. BOTTLENECKS — identify, then mitigate (cache? shard? queue?)
   8. TRADE-OFFS  — name what you sacrificed; reason about CAP/PACELC
```

</details>

## 22.2 Latency numbers every engineer should know (Jeff Dean, updated)

<details>
<summary><strong>Read as text</strong> — the classic table and the two lessons</summary>

The classic list (Jeff Dean / Peter Norvig, ~2010 hardware):

```
   L1 cache reference                           0.5 ns
   Branch mispredict                              5 ns
   L2 cache reference                             7 ns
   Mutex lock/unlock                             25 ns
   Main memory reference                        100 ns
   Compress 1 KB with Snappy (Zippy)          3,000 ns  =   3 µs
   Send 1 KB over 1 Gbps network             10,000 ns  =  10 µs
   Read 4 KB randomly from SSD              150,000 ns  = 150 µs
   Read 1 MB sequentially from memory       250,000 ns  = 250 µs
   Round trip within same datacenter        500,000 ns  = 0.5 ms
   Read 1 MB sequentially from SSD        1,000,000 ns  =   1 ms
   Disk seek                             10,000,000 ns  =  10 ms
   Read 1 MB sequentially from disk      20,000,000 ns  =  20 ms
   Round trip California ↔ Netherlands  150,000,000 ns  = 150 ms
```

**The update:** modern NVMe SSDs and memory are several times faster than these figures, but spinning-disk seeks and the speed of light have barely moved — so the *ordering* still holds, and interviewers still expect these orders of magnitude.

Two lessons: (1) every step down the ladder costs orders of magnitude — main memory is 200× slower than L1, a datacenter round trip 5,000× slower than memory, and a cross-continent round trip 300× slower again. (2) batch + sequential ≫ random.

</details>

## 22.3 Back-of-envelope estimation cheat-sheet

<details>
<summary><strong>Read as text</strong> — time conversions and a worked estimate</summary>

```
   1 day        = 86,400 s    ≈ 10⁵ s
   1 month      ≈ 2.5 × 10⁶ s
   1 year       ≈ 3 × 10⁷ s

   100M users, 10 actions/day  ≈ 10⁹ actions/day  ≈ 12k actions/sec  (peak 2–3× ≈ 23–35k)
   Each action 1KB                                 ≈ 1 TB/day, ~365 TB/year
```

Multiply users × actions × size → storage. Divide by 86,400 → RPS.

</details>

## 22.4 Five reference designs (apply everything above)

![Map of five reference designs: A URL shortener (API → ID gen with ranges / Snowflake → Cassandra / DynamoDB + Redis → CDN redirect; 301 browser-cached with lost analytics vs 302; base62, 7 chars = 62⁷ ≈ 3.5 trillion URLs), B news feed (pull slow if you follow many, push bad for celebrities, hybrid push normal / pull celebs), C chat (WebSockets → per-user inbox until delivered → Cassandra history, per-user last-delivered offset, end-to-end encryption with the Signal protocol), D rate limiter (token bucket per (user, endpoint) in Redis with an atomic Lua script; fail closed for billing, open for serving), E Dropbox-style file storage (4 MB chunks → content hash dedupe → S3 → Postgres metadata → sync notifications; rsync-style delta uploads); a pick-by-question table; the senior engineer's 10 heuristics as numbered chips; and the trap that a 301 is cached by browsers so you lose click analytics.](diagrams/sd25_info_reference-designs_ai.png)

### A. URL shortener (TinyURL)

<details>
<summary><strong>Read as text</strong> — ID generation, storage and 301 vs 302</summary>

```
   Components: API → ID gen (counter handed out in ranges, or Snowflake) →
               KV store (Cassandra / DynamoDB) as the source of truth +
               Redis cache for hot links, CDN-cached redirects.
   Key choice: 301 vs 302 (301 is cached by browsers → fewer hits on you
               but lost click analytics), TTL on cache,
               base62 IDs (7 chars = 62⁷ ≈ 3.5 trillion URLs).
```

</details>

### B. News feed (Twitter)

<details>
<summary><strong>Read as text</strong> — pull, push and the hybrid</summary>

```
   Three strategies:
     • Pull (fan-out on read)  — merge followees' posts at read time;
                                 slow for users who follow many accounts
     • Push (fan-out on write) — precompute feeds; bad for celebrities
     • Hybrid                  — push for normal users, pull for celebs
```

</details>

### C. Chat (WhatsApp)

<details>
<summary><strong>Read as text</strong> — WebSockets, inboxes and end-to-end encryption</summary>

```
   WebSockets (persistent conn) → per-user inbox that stores messages until
   delivered → Cassandra for history. Per-user "last delivered" offset.
   Use end-to-end encryption (Signal protocol).
```

</details>

### D. Rate limiter

<details>
<summary><strong>Read as text</strong> — a token bucket in Redis, fail open vs fail closed</summary>

```
   Token-bucket per (user, endpoint) in Redis, atomic Lua script.
   Fail open vs fail closed? — usually closed for billing, open for serving.
```

</details>

### E. Distributed file storage (Dropbox)

<details>
<summary><strong>Read as text</strong> — chunking, dedupe and delta sync</summary>

```
   Chunk files (4MB) → content-hash for dedupe → object store (S3) →
   metadata DB (Postgres) → notification service for sync.
   Use rsync-style delta uploads to save bandwidth.
```

</details>

## 22.5 The senior engineer's heuristics

<details>
<summary><strong>Read as text</strong> — ten rules of thumb</summary>

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

</details>

## 22.6 Where to go next in this repo

- **Ch 35–37** — System Design Case Studies (real-time & comms; search, geo & media; scale, infra & money) — full designs that apply this toolkit
- **Ch 21** — Design Fundamentals (SOLID, patterns, Java specifics)
- **Ch 26** — ML System Design (recsys, ranking, feature stores)
- **Ch 22** — Engineering Tools (Kafka, Redis, Spark, K8s in depth)

This chapter is the **map**; those chapters are the **terrain**.

---

## Quick-Reference Cheat Card

```
   ┌────────────────────────────────────────────────────────────────────┐
   │ NEED LOWER LATENCY?       → Cache, CDN, edge compute, denormalize  │
   │ NEED HIGHER THROUGHPUT?   → Shard, async queue, batch, parallelize │
   │ NEED HIGHER AVAILABILITY? → Replicas, multi-AZ/region, retries     │
   │ NEED STRONG CONSISTENCY?  → Single-leader, quorum reads, Spanner   │
   │ EVENTUAL CONSISTENCY OK?  → Async replication, CRDTs, gossip       │
   │ NEED RELIABLE EVENTS?     → Kafka + idempotent consumers + DLQ     │
   │ NEED FAST WRITES?         → LSM stores (Cassandra), append-only    │
   │ NEED FAST READS?          → B-tree DBs + cache + read replicas     │
   │ NEED SECURE BY DEFAULT?   → mTLS + zero trust + secrets manager    │
   │ NEED PROOF IT WORKS?      → SLO + error budget + chaos drills      │
   └────────────────────────────────────────────────────────────────────┘
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
  • Know the OWASP Top 10 (2025 list) and the one-line defense for each.
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
    high-level design → deep dive → bottlenecks → trade-offs.
  • Memorize the latency numbers + back-of-envelope math.
```

---

> **End of the three‑chapter System Design series.** Continue your study with:
>
> - **[Chapter 21 — Design Fundamentals](#content/21_design_fundamentals)** — SOLID, design patterns, Java specifics.
> - **[Chapter 26 — ML System Design](#content/26_ml_system_design)** — recsys, ranking, feature stores.
> - **[Chapter 22 — Engineering Tools](#content/22_engineering_tools)** — Kafka, Redis, Spark, K8s in depth.
> - **Chapters 35–37 — System Design Case Studies** — start with **[Chapter 35 — Real-Time & Communication](#content/35_system_design_cases_realtime)**.
>
> The three System Design chapters are the **map**; those chapters are the **terrain**.
