# Chapter 22 — Data & Infra Engineering Tools Every Senior Engineer Should Know

Every senior engineer eventually hits the same wall: the code is fine, but the *system around the code* is what makes or breaks the product. Hadoop, Kafka, Redis, Cassandra, Spark, Kubernetes — these are not buzzwords on a résumé. They are the load-bearing walls of every large system you will ever touch. This chapter explains each one in plain language, shows you *when* (and when **not**) to use it, and ranks them by how much they matter in **2025–2026**.

The goal is not to make you an expert in all of them — nobody is. The goal is to give you a **mental map** so that when someone says "we'll put a queue in front of it and cache the hot keys," you know exactly what they mean and can push back intelligently.

---

## 22.1 The Big Picture — Why These Tools Exist

![Map infographic of infra tools: four jobs in a restaurant-style pipeline INGEST (Kafka, Flink) → STORE (S3/HDFS, Postgres, Cassandra, Snowflake) → PROCESS (Spark/Flink, dbt/Hadoop, Airflow) → SERVE (Redis, Postgres, Cassandra, Elasticsearch); four priority tiers from Tier 1 must-know (Docker, Kubernetes, Kafka, Redis/Valkey, PostgreSQL, MongoDB, Cloud+S3, Spark) to Tier 4 legacy Hadoop; biggest 2025–2026 shifts (Hadoop out, lakehouse in; Kafka + Flink); and a pick-by-question table (e.g. make a slow read instant → SERVE → Redis / Valkey).](diagrams/sd22_info_four_jobs_tiers_ai.png)

<details>
<summary><strong>Read as text</strong> — the restaurant analogy and the four jobs</summary>

> **Simple Explanation:** Imagine a restaurant. Orders come in (ingestion), the kitchen stores ingredients (storage), cooks prepare meals (processing), and waiters serve customers fast (serving). When one cook can no longer keep up, you don't hire a *faster* cook — you reorganize the kitchen. Infrastructure tools are the reorganization patterns that let a system serve millions instead of dozens.

> **Official Definition:** Distributed data infrastructure refers to the collection of systems that handle the **ingestion, storage, processing, and serving** of data at a scale beyond what a single machine can handle, while providing guarantees around availability, durability, consistency, and latency.

Almost every tool in this chapter exists to solve **one** of these four jobs:

```
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │   INGEST     │   │    STORE     │   │   PROCESS    │   │    SERVE     │
   │ get data in  │──▶│  keep it     │──▶│ transform /  │──▶│ answer       │
   │ reliably     │   │  durably     │   │ analyze it   │   │ queries fast │
   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
        Kafka            S3 / HDFS          Spark / Flink       Redis
        Flink            Postgres           dbt / Hadoop        Postgres
                         Cassandra          Airflow             Cassandra
                         Snowflake                              Elasticsearch
```

If you can place any new tool you meet into one of these four boxes, you already understand 80% of what it does. The rest is details.

</details>

---

## 22.2 The Priority Tiers (2025–2026)

<details>
<summary><strong>Read as text</strong> — the four tiers and the biggest 2025–2026 shift</summary>

Not every tool deserves equal attention. Here is the honest ranking based on current industry demand. Learn top-down.

```
 ┌─────────────────────────────────────────────────────────────────────┐
 │ TIER 1 — MUST-KNOW  (you will meet these everywhere)                │
 │   Docker · Kubernetes · Kafka · Redis/Valkey · PostgreSQL ·         │
 │   MongoDB · Cloud+S3 · Spark                                        │
 ├─────────────────────────────────────────────────────────────────────┤
 │ TIER 2 — HIGH PRIORITY  (the modern data stack)                     │
 │   Snowflake/Databricks · dbt · Parquet · Iceberg/Delta · Flink ·    │
 │   Airflow · Terraform · Prometheus+Grafana · Ray                    │
 ├─────────────────────────────────────────────────────────────────────┤
 │ TIER 3 — SITUATIONAL  (know WHEN, not necessarily HOW)              │
 │   Cassandra/ScyllaDB · Elasticsearch/OpenSearch · gRPC/GraphQL ·    │
 │   Vector DBs (pgvector/Qdrant/Pinecone) · Distributed SQL           │
 │   (CockroachDB/Spanner/TiDB)                                        │
 ├─────────────────────────────────────────────────────────────────────┤
 │ TIER 4 — LEGACY  (learn only to maintain old systems)               │
 │   Hadoop (HDFS / MapReduce / Hive)                                  │
 └─────────────────────────────────────────────────────────────────────┘
```

**The single biggest shift of 2025–2026:** Hadoop is out, the **lakehouse** is in. Cloud object storage (S3/GCS) plus open table formats (Iceberg/Delta) have replaced the old HDFS world. For streaming, **Kafka (transport) + Flink (processing)** is the modern pairing. AI features are now baked into every data platform. The AI era also added a new class of situational must-knows: **vector databases** for embedding search and **distributed SQL** for when you outgrow single-node Postgres.

</details>

---

## 22.3 TIER 1 — The Must-Know Tools

### Docker — Package Once, Run Anywhere

![Docker infographic: the 'works on my machine' problem (arm64 image → exec format error on an amd64 server), the lunchbox analogy, and the pipeline Dockerfile → build → Image (read-only cached layers) → run → Containers on a shared host kernel; VM (full guest OS, GBs, minutes) vs container (app + libs, MBs, ms); layer-order fix COPY package*.json → RUN npm ci → COPY . .; multi-stage golang:1.27 builder → only /app → distroless ~20 MB with USER nonroot; a 6-row symptom → fix table; when to use / not use; trap: :latest tag and running as root.](diagrams/sd22_info_docker_ai.png)

<details>
<summary><strong>Read as text</strong> — images, layers, pro Dockerfiles and common issues</summary>

> **Simple Explanation:** Docker is a **lunchbox** for your software. It seals your app together with everything it needs — the exact runtime, libraries, and config — into one portable **image** that runs identically on your laptop, a teammate's machine, CI, and production. It kills the oldest excuse in software: *"but it works on my machine."*

> **Official Definition:** Docker is a containerization platform that packages an application and its dependencies into a portable, isolated **image**. A running instance of that image is a **container** — an isolated process that shares the host OS kernel (unlike a virtual machine, which virtualizes a whole guest OS), making it far lighter and faster to start.

```
   Dockerfile  ──build──▶  Image (read-only layers)  ──run──▶  Container(s)
   (the recipe)            cached + shareable                  isolated process

   VM:        virtualizes hardware → each carries a full Guest OS  (GBs, boots in minutes)
   Container: shares the host kernel → just your app + libs        (MBs, starts in ms)
```

- **Use it when:** Almost always — packaging any app for consistent local dev, CI, and deploy. The image is the unit that Kubernetes, ECS, Cloud Run, and Nomad all run.
- **Avoid / don't over-reach when:** You need VM-grade isolation for untrusted or multi-tenant code (containers share the host kernel — use microVMs like Firecracker/gVisor or real VMs), or a tiny static site where a buildpack/PaaS is simpler.
- **Senior gotcha:** An image is only as good as its `Dockerfile`. The two things that bite teams hardest: (1) **bloated images** (slow builds and pulls, larger attack surface) and (2) **broken layer caching** (copying source *before* installing dependencies busts the cache on every code change).

**Going deeper — the vocabulary and mechanics:**

| Term | Plain words |
|---|---|
| **Image** | The sealed, read-only package (app + deps). Built once, run anywhere. |
| **Container** | A running (or stopped) instance of an image — an isolated process. |
| **Dockerfile** | The recipe: each instruction (`FROM`, `COPY`, `RUN`) adds a cached **layer**. |
| **Layer** | A cached filesystem diff. Unchanged layers are reused → fast rebuilds. |
| **Registry** | Where images live (Docker Hub, GHCR, ECR, Artifact Registry); you `push`/`pull`. |
| **Volume** | Persistent storage that outlives the container (containers are ephemeral). |
| **Tag** | A label for an image version (`my-api:1.4.2`). Avoid `:latest` in production. |

**The two techniques that separate a pro Dockerfile:**

1. **Order layers cheap → expensive.** Copy dependency manifests and install *before* copying source, so a one-line code edit doesn't re-run the whole install:

```dockerfile
# ✅ The dependency layer stays cached until package.json actually changes
COPY package*.json ./
RUN npm ci
COPY . .            # source edits no longer bust the install layer above
```

2. **Multi-stage builds** — compile in a fat "builder" stage, ship only the artifact in a tiny runtime image:

```dockerfile
FROM golang:1.27 AS build
WORKDIR /src
COPY . .
RUN go build -o /app ./cmd/api

FROM gcr.io/distroless/base AS runtime   # ~20 MB, no shell, tiny attack surface
COPY --from=build /app /app
USER nonroot
ENTRYPOINT ["/app"]
```

- **Slim / distroless bases** (`-slim`, `distroless`, `alpine`) cut images from ~1 GB to tens of MB.
- **`.dockerignore`** keeps `node_modules`, `.git`, and secrets out of the build context — a missing one ships gigabytes to the daemon and can leak credentials into layers.
- **Don't run as root** — add a non-root `USER`; a container escape as root becomes a host-level risk.
- **One process per container** — log to stdout/stderr, configure via env vars (the **12-factor** model). For multi-container local dev, use **Docker Compose**.
- **BuildKit / `docker buildx`** is the modern builder: parallel layers, cache mounts, and **multi-arch** images (`linux/amd64` + `linux/arm64`) from one command — essential now that Apple Silicon (arm64) developers deploy to amd64 servers.

**Common issues developers hit:**

| Symptom | Real cause | Fix |
|---|---|---|
| `exec format error` on deploy | Image built on Apple Silicon (arm64), server is amd64 | Build multi-arch: `docker buildx build --platform linux/amd64,linux/arm64` |
| Every build re-runs `npm`/`pip install` | Source copied before deps → cache busted each time | Copy manifests + install first, then `COPY . .` |
| Final image is 1.5 GB | Full base + build tools shipped to production | Multi-stage build with a slim/distroless final stage |
| Container exits immediately | No long-running foreground process (PID 1 ended) | Run the app in the foreground; don't background it; set a proper `CMD` |
| "No space left on device" | Dangling images, build cache, and stopped containers pile up | `docker system prune -af --volumes` (review first) |
| Data gone after re-running the container | The container's writable layer is ephemeral | Persist state in a **volume**, not the container layer |
| Secret leaked in image | A secret was `COPY`'d or `ENV`'d into a layer | Use build secrets / runtime env; never bake secrets; audit `docker history` |
| Build crawls: "sending build context… 2 GB" | No `.dockerignore` | Add one (exclude `node_modules`, `.git`, datasets, build output) |

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Eliminates "works on my machine"; near-instant startup and a tiny footprint vs. VMs; the universal packaging unit every orchestrator (K8s, ECS, Cloud Run, Nomad) consumes; layer caching makes rebuilds fast; reproducible local-dev environments.
- **Cons:** Shares the host kernel → weaker isolation than a VM; Dockerfile authoring has real gotchas (cache order, image bloat, running as root); stateful data needs volumes (containers are ephemeral); image sprawl eats disk if never pruned.
- **Limitations:** Not a security boundary for untrusted multi-tenant code (use microVMs — Firecracker/gVisor); Linux containers need a Linux kernel (on macOS/Windows they run inside a lightweight VM); GPU/hardware passthrough needs extra runtime config (e.g., NVIDIA Container Toolkit).
- **Unsupported / anti-patterns:** Many processes crammed into one container (use one-per-container + Compose/K8s); treating the container layer as durable storage; baking secrets into images; using `:latest` in production (non-reproducible deploys).

</details>

---

### Kubernetes — Orchestrating Containers at Scale

![Kubernetes infographic: the problem of placing and healing thousands of containers, the lunchroom-manager analogy, and a reconciliation loop (Desired: replicas = 3 vs Actual: 2 running, 1 crashed → start 1 new pod); traffic flows outside HTTP → Gateway API / Ingress → Service → pods on Nodes 1–3; object chips (Pod, Deployment, Service, Ingress → Gateway API, ConfigMap / Secret, Namespace) and scalers (HPA every 15 s, VPA, KEDA on Kafka lag, Cluster Autoscaler); three gotchas (CPU limit 200m = 20 ms per 100 ms → throttling, :latest → digest + PDB minAvailable: 2, Secret = base64); a 5-row symptom/cause/fix table (CrashLoopBackOff … OOMKilled exit 137) with limits ~5,000 nodes, 110 pods/node, 150,000 pods, etcd ~8 GB; trap: liveness probe that checks the DB.](diagrams/sd22_info_kubernetes_ai.png)

<details>
<summary><strong>Read as text</strong> — objects, self-healing, scaling and the 3 a.m. gotchas</summary>

> **Simple Explanation:** If **Docker** (above) is a lunchbox that seals your app so it runs identically everywhere, **Kubernetes** is the lunchroom manager for thousands of lunchboxes: it decides which table (machine) each container sits at, replaces any that get dropped, and orders more tables when the room fills up.

> **Official Definition:** *Kubernetes (K8s)* is a container orchestration system that automates deployment, scaling, healing, and networking of containers (typically Docker/OCI images) across a cluster of machines. You declare the *desired state*; a control loop continuously reconciles reality to match it.

Note: Kubernetes runs the *images* Docker builds, but not the Docker Engine itself — since v1.24 (dockershim removed) each node runs containers through a CRI runtime such as **containerd** or **CRI-O**. Your Dockerfiles and images work unchanged.

```
   Docker / OCI images  ─▶  scheduled onto a Kubernetes cluster:
   ┌─────────────────────────────────────────────────────┐
   │  Node 1          Node 2          Node 3             │
   │  [pod][pod]      [pod][pod]      [pod]              │
   │     ▲ K8s restarts a crashed pod, adds pods under   │
   │     load, and load-balances traffic automatically.  │
   └─────────────────────────────────────────────────────┘
```

- **Use it when:** You run more than one service, need zero-downtime deploys, autoscaling, or self-healing. This is the default for nearly all modern backends.
- **Avoid / don't over-reach when:** You have a single small app — a managed platform (Cloud Run, Fly.io, Render, ECS Fargate) is simpler. Kubernetes has a famously steep learning curve; don't adopt it just for résumé reasons.
- **Senior gotcha:** "We need Kubernetes" is often premature. The cost is operational complexity (YAML, networking, RBAC). Reach for it when you genuinely have many services or scaling needs.

**Going deeper — the vocabulary you'll actually use:**

| Object | What it is (plain words) |
|---|---|
| **Pod** | The smallest unit — one or more containers that live and die together. |
| **Deployment** | "Keep N copies of this pod running, and roll out new versions safely." |
| **Service** | A stable internal address + load balancer in front of pods (pods come and go; the Service stays). |
| **Ingress** | The front door — routes outside HTTP traffic to the right Service. Successor for new clusters: **Gateway API** (ingress-nginx was retired in March 2026). |
| **ConfigMap / Secret** | Configuration and passwords, injected into pods (kept out of the image). |
| **Namespace** | A folder to isolate teams/environments inside one cluster. |

**How self-healing works:** You declare *desired state* ("3 replicas"). A control loop constantly compares desired vs. actual and fixes the difference — pod crashes → it starts a new one; node dies → it reschedules elsewhere. You describe the *what*, not the *how*.

```yaml
# A Deployment: "always run 3 copies of my-api, restart any that die"
apiVersion: apps/v1
kind: Deployment
metadata: { name: my-api }
spec:
  replicas: 3
  selector: { matchLabels: { app: my-api } }
  template:
    metadata: { labels: { app: my-api } }
    spec:
      containers:
        - name: my-api
          image: myrepo/my-api:1.4.2
          ports: [{ containerPort: 8080 }]
          resources:
            requests: { cpu: "250m", memory: "256Mi" }   # guaranteed
            limits:   { cpu: "1",    memory: "512Mi" }    # ceiling
```

- **Scaling:** the **Horizontal Pod Autoscaler (HPA)** adds/removes pods based on CPU or custom metrics; the **Vertical Pod Autoscaler (VPA)** right-sizes CPU/memory requests (since **in-place pod resize** went GA in v1.35, Dec 2025, a pod's CPU/memory can change without recreating it); **KEDA** (Kubernetes Event-Driven Autoscaler) scales on external signals like Kafka lag or queue depth — useful for ML inference workloads; the **Cluster Autoscaler** adds/removes whole machines (nodes).
- **Ecosystem to know:** **Helm** (package manager — install apps from reusable "charts"), **kubectl** (the CLI), and managed control planes (**EKS / GKE / AKS**) so you don't run the control plane yourself.
- **Container images:** K8s runs the Docker/OCI images covered in the **Docker** section above — keep them small (slim/distroless bases, multi-stage builds) so pods schedule and pull faster and present a smaller attack surface.

**Advanced K8s patterns:**

- **StatefulSets** are Deployments for stateful apps (databases, Kafka, etcd). Each pod gets a stable hostname (`kafka-0`, `kafka-1`), its own persistent volume that survives pod restarts, and ordered start-up/shutdown. Contrast with Deployments, where pods are interchangeable.
- **Operators** encode complex operational knowledge into a custom controller. An "Operator" watches a custom resource (e.g., `kind: KafkaCluster`) and reconciles reality to it — provisioning storage, running rolling upgrades, managing secrets. Major data tools (Strimzi/Kafka, Postgres Operator, Spark Operator) all ship Operators.
- **GitOps** (Flux, Argo CD) — rather than running `kubectl apply` from CI, a Git repo is the single source of truth for cluster state, and a controller inside the cluster continuously syncs the live state to match it. Drift is auto-corrected and every change is a git commit. Argo CD is the de facto standard.

```
   GitOps loop:
   Git repo ──▶ Argo CD controller (in cluster)
                  │  detects drift between desired (git) and actual (cluster)
                  └─▶ reconciles → applies missing changes automatically
```

- **Interview soundbite:** "Kubernetes declarative reconciliation extends to your whole infrastructure with GitOps — the cluster self-heals to match a git commit, giving you auditability and disaster recovery for free."

**Common issues developers hit:**

| Symptom | Real cause | Fix |
|---|---|---|
| `CrashLoopBackOff` | App crashes on startup (bad config, missing env/secret, failed migration) | `kubectl logs <pod> --previous`; fix the crash — the restart loop is a symptom |
| `ImagePullBackOff` / `ErrImagePull` | Wrong image name/tag, or no credentials for a private registry | Fix the tag; add an `imagePullSecret` |
| Pod stuck `Pending` | No node has enough CPU/memory to fit the pod's `requests` | Lower requests, add nodes, or enable the Cluster Autoscaler |
| `OOMKilled` (exit code 137) | Container exceeded its memory **limit** | Raise the limit or fix the leak; set requests ≈ limits for stable scheduling |
| Liveness probe restarts a healthy pod | Probe too aggressive — slow startup counted as failure | Add a `startupProbe` or raise `initialDelaySeconds` |
| Service routes to nothing | Service `selector` labels don't match the pod labels | Align labels; check `kubectl get endpoints` |
| Config change didn't take effect | ConfigMap updated, but pods weren't restarted | `kubectl rollout restart` (or a checksum annotation to auto-roll) |

**Senior gotchas & anti-patterns — worked examples:**

The mistakes below pass code review and then page you at 3 a.m.

**1. CPU *limits* cause throttling — even on an idle node.**
```yaml
# ❌ ANTI-PATTERN: a tight CPU limit throttles the app via the Linux CFS
# (Completely Fair Scheduler) quota. 200m = 0.2 CPU = 20 ms of CPU per 100 ms
# period; a burst that needs more is paused until the next period, so p99 latency
# spikes while `kubectl top` shows low AVERAGE CPU. Baffling.
resources:
  requests: { cpu: "200m", memory: "512Mi" }
  limits:   { cpu: "200m", memory: "512Mi" }

# ✅ FIX: request for scheduling, but leave CPU UNLIMITED so the pod can burst
# into spare node capacity. Memory is incompressible, so keep limit = request
# (over-limit memory = OOMKilled, not throttled).
resources:
  requests: { cpu: "200m", memory: "512Mi" }
  limits:   { memory: "512Mi" }            # note: no cpu limit
```

**2. A liveness probe that checks dependencies turns a slow DB into a full outage.**
```yaml
# ❌ ANTI-PATTERN: liveness hits an endpoint that pings the database/downstream.
# When the DB slows, EVERY pod fails liveness and restarts in lockstep — the
# restart loop amplifies the incident instead of containing it.
livenessProbe:
  httpGet: { path: /health/deep, port: 8080 }   # checks DB, cache, downstream

# ✅ FIX: liveness = "is my process wedged?" (a restart fixes it).
#        readiness = "should I get traffic right now?" (pull from LB, don't restart).
livenessProbe:
  httpGet: { path: /healthz, port: 8080 }        # process-local, no dependencies
readinessProbe:
  httpGet: { path: /ready, port: 8080 }          # dependency checks live HERE
```

**3. `:latest` tags and missing PodDisruptionBudgets bite during routine ops.**
```yaml
# ❌ image: myrepo/api:latest  → two nodes can run different builds; rollback impossible.
# ✅ image: myrepo/api@sha256:9b2c...  → immutable digest: reproducible + auditable.
---
# ✅ A PodDisruptionBudget stops a node drain (upgrade/autoscaler) from evicting
#    ALL replicas at once and causing a self-inflicted outage.
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: my-api-pdb }
spec:
  minAvailable: 2
  selector: { matchLabels: { app: my-api } }
```

**4. Limitation — `Secret` is base64, *not* encryption.** A K8s `Secret` is only base64-encoded in etcd; anyone with etcd access or `get secret` RBAC reads it in plaintext. Enable **encryption-at-rest** (`EncryptionConfiguration`) or use an external manager (External Secrets Operator, Vault, a cloud KMS CSI driver). Never commit a `Secret` manifest to git and `kubectl apply` it.

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Universal deploy target — works on every cloud and on-prem; strong self-healing and autoscaling primitives; rich ecosystem (Helm, Argo CD, KEDA, Operators); declarative model simplifies rollbacks and audits.
- **Cons:** Steep operational curve (YAML sprawl, RBAC, networking, storage classes); significant initial complexity overhead for small teams; debugging failures requires expertise across multiple layers.
- **Limitations:** etcd (the cluster state store) has a practical size cap (~8 GB) limiting cluster scale; the documented tested limits are ~5,000 nodes, 110 pods per node and 150,000 pods per cluster; the HPA re-evaluates metrics every 15 s by default and new pods must still pull and start, so autoscaling reacts in tens of seconds to minutes, not milliseconds.
- **Unsupported / anti-patterns:** Does not provide application-level business logic or stateful-data durability — that's your app's job; Docker containers share the host kernel (weaker isolation than a VM — not suitable where VM-level isolation is required); over-engineering for a single small service that Cloud Run or Fargate would serve adequately.

</details>

---

### Kafka — The Central Nervous System

![Kafka infographic: the coupling problem, the conveyor-belt analogy, and producers (web app, mobile, sensors) appending to topic 'orders' with Partitions 0–2 of [m0][m1]… and an offset marker, read independently by billing svc, analytics and fraud check; brokers with RF=3, acks=all, min.insync.replicas=2; rules '6 partitions → up to 6 consumers in one group' and 'ordering only within a partition'; ZooKeeper vs Kafka 4.0 (March 2025) KRaft controller nodes; delivery semantics (at-most-once, at-least-once, exactly-once ~3% throughput cost); three gotchas (auto-commit, slow poll loop, 10,000 partitions → size at ≈2–4× consumers); alternatives table (Redpanda, WarpStream ~0.5–1 s, Apache Pulsar, NATS JetStream); trap: a null key breaks per-order ordering.](diagrams/sd22_info_kafka_ai.png)

<details>
<summary><strong>Read as text</strong> — partitions, delivery semantics, KRaft, gotchas and alternatives</summary>

> **Simple Explanation:** Kafka is a **conveyor belt** for events. Producers drop messages ("user clicked", "order placed") onto the belt; many independent consumers read from it at their own pace. Because the belt *keeps* the messages (a durable log), a consumer can crash, restart, and replay everything it missed. It decouples "who produces data" from "who uses data."

> **Official Definition:** Apache Kafka is a distributed, partitioned, replicated **commit log** used as a publish/subscribe messaging system and event-streaming platform. It provides durable, ordered, high-throughput, and replayable event streams.

```
   Producers                Kafka Topic ("orders")               Consumers
   ┌─────────┐   ┌───────────────────────────────────────┐   ┌──────────────┐
   │ web app │─▶ │ Partition 0:  [m0][m1][m2][m3]...     │─▶ │ billing svc  │
   │ mobile  │─▶ │ Partition 1:  [m0][m1][m2]...         │─▶ │ analytics    │
   │ sensors │─▶ │ Partition 2:  [m0][m1]...             │─▶ │ fraud check  │
   └─────────┘   └───────────────────────────────────────┘   └──────────────┘
                  messages are KEPT (replayable log)          each reads independently
```

- **Use it when:** Decoupling services, building event-driven systems, streaming data pipelines, log aggregation, or you need high throughput (millions of events/sec) with replay.
- **Avoid when:** You just need a simple task queue for a handful of background jobs — a lighter broker (RabbitMQ, AWS SQS, Redis Streams) is far less operational burden. (Kafka 4.2, Feb 2026, made **share groups** — "Kafka Queues", KIP-932 — production-ready, so Kafka can now do queue-style consumption with per-message acks; that helps when you already run Kafka, but it is not a reason to adopt it for a small queue.)
- **Senior gotcha:** Ordering is guaranteed **only within a partition**, not across the whole topic. Choosing the right partition key (e.g., `user_id`) is a critical design decision. Managed options (Confluent Cloud, AWS MSK, Redpanda) remove most of the operational pain.

**Going deeper — the core concepts:**

| Term | Meaning |
|---|---|
| **Topic** | A named stream of events (e.g., `orders`). |
| **Partition** | A topic is split into partitions for parallelism; each is an ordered append-only log. |
| **Offset** | The position of a message in a partition (0, 1, 2, …). Consumers track "where they've read up to." |
| **Consumer group** | A set of consumers sharing the work; each partition is read by exactly one consumer in the group. |
| **Broker** | A Kafka server. A cluster is many brokers. |
| **Replication factor** | How many brokers hold a copy of each partition. RF=3 keeps the data through 2 broker failures; with `min.insync.replicas=2`, writes keep flowing through 1 failure. |

**Why it's so fast:** Kafka writes events *sequentially* to disk (append-only log) and lets the OS page cache do the heavy lifting — sequential disk I/O is nearly as fast as memory. A single cluster routinely handles **millions of events/sec**.

**Delivery semantics** (know these for interviews):
- **At-most-once** — fast, may drop messages.
- **At-least-once** — the common default; may *duplicate*, so consumers should be **idempotent**.
- **Exactly-once (EOS)** — achieved by combining (1) an **idempotent producer** (each message has a sequence number; the broker deduplicates retries), (2) **transactions** (`beginTransaction` / `commitTransaction` spanning multiple partitions/topics), and (3) consumers reading only committed data (`isolation.level=read_committed`). Combined with `acks=all` (the leader waits until every **in-sync replica** — ISR, explained just below — has the message) this gives exactly-once for **read-from-Kafka → process → write-to-Kafka** pipelines; side effects outside Kafka (a DB write, an email) still need idempotency. Since Kafka 3.0, producers default to `acks=all` and `enable.idempotence=true`. The throughput cost of transactions is modest — Confluent measured ~3% vs. an at-least-once `acks=all` producer (100 ms transactions, 1 KB messages); the bigger costs are extra latency and complexity — so reserve it for financial or billing pipelines, not high-volume telemetry.

**ISR (In-Sync Replicas):** the subset of replicas fully caught up with the leader. A message is "committed" only once all ISR members have it. If a replica falls behind, it's dropped from the ISR. `acks=all` combined with `min.insync.replicas=2` is the standard durability configuration.

**KRaft — ZooKeeper is gone (Kafka 4.0, March 2025):**

Until KRaft became production-ready (Kafka 3.3, 2022), every cluster needed a separate Apache ZooKeeper ensemble to hold cluster metadata (which broker leads which partition, controller election). **Kafka 4.0 completely removed ZooKeeper**. The replacement, **KRaft** (Kafka Raft), embeds metadata management directly into designated **controller nodes** using a Raft-based replicated log — the same append-only log mechanism Kafka already uses for data. Kafka 3.9 was the final bridge release supporting both modes (and the migration path from ZooKeeper).

```
   Old (pre-4.0):                     New (Kafka 4.0 KRaft):
   ZooKeeper ensemble                 Controller nodes (Kafka itself)
        │  cluster metadata                │  metadata via Raft log
        ▼                                  ▼
   Kafka brokers                      Kafka brokers
   (extra ops, latency, outages)      (simpler, faster metadata, fewer moving parts)
```

Benefits: near-instant controller failover (standby controllers already hold the metadata log, instead of a new controller reloading everything from ZooKeeper), one fewer system to operate, and support for **millions** of partitions per cluster vs. hundreds of thousands before.

**Tiered storage:** offloads older log segments to object storage (S3/GCS), decoupling retention from broker disk — early access in Kafka 3.6, production-ready since 3.9 (not yet for compacted topics). Long retention (months) without huge brokers — important for event sourcing and audit logs.

**Retention & compaction:** Kafka keeps messages for a configured time/size (e.g., 7 days), *independent of whether they were read* — that's what makes **replay** possible. **Log compaction** instead keeps only the latest value per key (great for "current state" topics).

```
Scaling rule of thumb: parallelism = number of partitions.
  6 partitions  →  up to 6 consumers working in parallel in one group.
  Want more throughput? Add partitions (but you can't easily reduce them later).
```

- **Connect & Streams:** **Kafka Connect** moves data in/out of external systems (DBs, S3) with no code; **Kafka Streams** / **ksqlDB** do lightweight in-Kafka processing.

**Common issues developers hit:**

| Symptom | Real cause | Fix |
|---|---|---|
| Consumer lag keeps growing | Consumers slower than producers, or too few partitions | Add partitions + consumers in the group; speed up / batch processing |
| Endless rebalancing ("rebalance storm") | Processing exceeds `max.poll.interval.ms` → consumer is evicted | Process faster or off-thread; tune `max.poll.records` / interval; move to the incremental KIP-848 protocol (`group.protocol=consumer`, GA in Kafka 4.0) |
| Messages appear "out of order" | Ordering is guaranteed **per partition**, not per topic | Key related events so they land on the same partition |
| One partition is hot / huge | Skewed partition key (e.g., one giant customer) | Pick a higher-cardinality key, or a custom partitioner |
| Duplicate side effects downstream | At-least-once delivery re-delivers on retries | Make consumers **idempotent**; use EOS for financial paths |
| `RecordTooLargeException` | Payload exceeds the ~1 MB default | Raise `max.message.bytes`, or store the blob in S3 and send a pointer |
| Under-replicated partitions | A broker is down/slow; the ISR shrank | Restore the broker; run `acks=all` with `min.insync.replicas=2` |

**Senior gotchas & anti-patterns — worked examples:**

**1. A null key silently destroys ordering.**
```java
// ❌ ANTI-PATTERN: no key → messages round-robin across partitions. Two events for
// the same order can land on different partitions and be processed out of order
// (e.g. "order.shipped" handled before "order.created").
producer.send(new ProducerRecord<>("orders", orderEvent));

// ✅ FIX: key by the entity whose order must hold. All events for order 42 now
// share one partition → strict per-order ordering.
producer.send(new ProducerRecord<>("orders", order.getId(), orderEvent));
```

**2. Auto-commit turns at-least-once into accidental message loss.**
```properties
# ❌ ANTI-PATTERN: offsets commit on a timer, BEFORE your handler finishes.
# Crash after the commit but before processing = the message is gone forever.
enable.auto.commit=true
auto.commit.interval.ms=5000
```
```java
// ✅ FIX: disable auto-commit; advance the offset only AFTER successful processing.
props.put("enable.auto.commit", "false");
for (var record : consumer.poll(Duration.ofMillis(100))) {
    process(record);                 // do the work first
}
consumer.commitSync();               // then commit (at-least-once)
// process() MUST be idempotent — at-least-once means you WILL see replays.
```

**3. Slow work in the poll loop triggers a rebalance storm.**
```java
// ❌ If the time between poll() calls exceeds max.poll.interval.ms, the broker
// assumes the consumer died and rebalances — with the classic protocol that
// PAUSES the whole group (KIP-848's incremental protocol only moves the affected
// partitions, but the slow consumer still loses its partitions).
// A batch of 500 records making slow network calls is the usual cause.

// ✅ Cap the batch so poll() is called often enough, or offload slow work:
props.put("max.poll.records", "100");   // smaller batches
// For genuinely slow handlers: hand records to a worker pool and pause()/resume().
```

**4. Over-partitioning is a one-way door.**
```
❌ "More partitions = more throughput" → 10,000 partitions for a 3-consumer service.
   Each partition costs memory, open file handles, and slows leader election &
   rebalances. And you CANNOT reduce the count later — raising it re-buckets keys
   and breaks per-key ordering for in-flight data.
✅ Size partitions to target consumer parallelism + headroom (≈2–4× consumers),
   not to a number you think you'll "never outgrow".
```

**5. Limitation — retention is a silent data-loss clock.** A consumer group offline longer than `retention.ms` (default 7 days) finds its next messages deleted — and its committed offsets also expire after `offsets.retention.minutes` (default 7 days) — so it restarts at `auto.offset.reset`: `latest` silently skips the gap, `earliest` replays everything still retained — both surprising in production. And Kafka is a log, not a database: don't use it for request/reply RPC or as a queryable source of truth.

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Extremely high throughput (millions of events/sec per cluster); durable, replayable log enables event sourcing and consumer decoupling; KRaft (Kafka 4.0) removes ZooKeeper complexity; tiered storage extends retention cheaply to object storage.
- **Cons:** High operational weight (cluster sizing, partition tuning, consumer-group management); classic-protocol rebalances pause consumers and spike latency (the KIP-848 protocol makes them incremental); exactly-once adds latency and complexity (throughput cost is modest, ~3% in Confluent's benchmark).
- **Limitations:** Partition count can be increased but not easily decreased; ordering is guaranteed only within a partition, not across a topic; default max message size is ~1 MB (built for small, frequent messages, not payloads); no native per-message TTL — retention is per-topic; with the classic group protocol a rebalance pauses processing for all consumers in the group.
- **Unsupported / anti-patterns:** Not a request/response RPC mechanism; not suited for large binary blobs or video payloads; no random-access query capability (it is a log, not a database); not a replacement for a lightweight task queue in low-throughput scenarios where SQS/RabbitMQ suffices.

**Kafka alternatives — know when to reach for them:**

| Alternative | What it is | Use it when |
|---|---|---|
| **Redpanda** | C++, Raft-native, no JVM, no ZooKeeper, Kafka-API compatible | Lower latency, simpler ops, same Kafka clients work |
| **WarpStream** | S3-backed, zero local disk, Kafka-compatible (acquired by Confluent 2024) | Near-zero infra cost; tolerate higher latency (default ~0.5–1 s end-to-end) |
| **Apache Pulsar** | Segmented storage (BookKeeper), multi-tenant, geo-replication built-in | Multi-tenant SaaS, need fine-grained topic-level policies |
| **NATS / NATS JetStream** | Lightweight, sub-millisecond, Go-native | IoT, edge, simple pub/sub without Kafka's operational weight |

The interview answer: "Kafka is the right default for high-throughput event streaming. I'd consider Redpanda for operational simplicity with the same API, or WarpStream if we want near-zero disk cost at the cost of latency."

</details>

---

### Redis / Valkey — The Speed Layer

![Redis / Valkey infographic: the repeated-slow-read problem (app → database 10 ms), the whiteboard analogy and the 4-step cache-aside pattern with ttl=300; app → Redis 0.2 ms on a hit; six data structures with commands (String, Hash HSET user:42 name Ana age 30, List, Set, Sorted Set, Stream); cache-stampede demo with 50 requests and a 200 ms DB query (naive 50 DB queries vs single-flight lock SET lock:key NX EX 10 → 1 DB query; cached → 0) and TTL jitter expiries at 301, 307, 315, 317, 347 s; 2026 engine choice (Valkey, ElastiCache for Valkey 20% / ~33% cheaper, Memorystore, Redis 8 vector sets, Dragonfly); senior facts table (SCAN not KEYS *, eviction policies, AOF everysec ~1 s loss, 16384 hash slots + CROSSSLOT, Redlock caveats); trap: keys with no TTL.](diagrams/sd22_info_redis_valkey_ai.png)

<details>
<summary><strong>Read as text</strong> — data structures, cache-aside, stampedes and the Valkey fork</summary>

> **Simple Explanation:** Redis is a **whiteboard next to your desk**. Instead of walking to the filing cabinet (the database) for every answer, you jot down frequently needed facts on the whiteboard for instant access. It lives in memory (RAM), so reads/writes take microseconds.

> **Official Definition:** Redis is an in-memory data-structure store used as a cache, database, and message broker. It supports strings, hashes, lists, sets, sorted sets, streams, and more, with optional persistence to disk. **Valkey** is the Linux Foundation fork of Redis (BSD-licensed), now offered as a managed engine by AWS ElastiCache and Google Cloud Memorystore.

```
   Without cache:                With Redis cache:
   app ──▶ database (10 ms)      app ──▶ Redis (0.2 ms)  ✓ hit
                                   │
                                   └─▶ database (10 ms) only on a miss
```

- **Common uses:** Caching (the #1 use), session storage, rate limiting, leaderboards (sorted sets), distributed locks, pub/sub, and lightweight queues (Redis Streams).
- **Use it when:** A slow query or computation is read repeatedly; you need sub-millisecond lookups; you need a shared, fast scratchpad across servers.
- **Avoid when:** Data must never be lost and is larger than RAM, or you need it as your *only* source of truth. Redis is memory-bound and primarily a *speed layer*, not a system of record.
- **Senior gotcha:** The hard parts of caching are **invalidation** (when does cached data go stale?) and the **thundering herd** (many requests rebuilding the same expired key at once). Always set TTLs and consider cache-stampede protection.

**Going deeper — pick the right data structure:**

| Structure | Use it for | Example commands |
|---|---|---|
| **String** | Simple cache, counters | `SET user:42 "..."`, `INCR views` |
| **Hash** | An object with fields | `HSET user:42 name Ana age 30` |
| **List** | Queues, recent items | `LPUSH`, `RPOP` |
| **Set** | Unique membership | `SADD online 42`, `SISMEMBER` |
| **Sorted Set** | Leaderboards, rankings | `ZADD board 999 player1`, `ZRANGE` |
| **Stream** | Event/log queue (Kafka-lite) | `XADD`, `XREADGROUP` |

**The cache-aside pattern** (the one you'll write most):

```
read(key):
  v = redis.get(key)
  if v is not None: return v          # cache HIT (fast)
  v = db.query(key)                   # cache MISS → go to DB
  redis.set(key, v, ttl=300)          # store with 5-min expiry
  return v
```

**Things seniors must know:**
- **Persistence:** **RDB** (periodic snapshots) and **AOF** (append-only log of every write). Use them if you can't fully rebuild from the DB — but Redis is still a *speed layer*, not a system of record.
- **Eviction policy:** when memory fills, Redis evicts per policy — `allkeys-lru` (drop least-recently-used) is common for a pure cache; `noeviction` errors on writes (safer for a datastore).
- **Single-threaded core:** command execution is single-threaded, so one slow command (e.g., `KEYS *` on a huge keyspace) blocks everyone — use `SCAN` instead.
- **Redis Cluster** shards the keyspace across nodes using **16384 hash slots** — each key maps to a slot (`CRC16(key) mod 16384`), and each node owns a slice of slots. A client must route to the right node (client-side or via `MOVED` redirects). Replicas provide HA per shard.
- **Redlock** is the Redis algorithm for distributed locks across multiple independent Redis nodes. Despite widespread use, it has correctness caveats under network partitions and clock drift (see the Martin Kleppmann / Salvatore Sanfilippo debate). For critical correctness, a CP system (etcd, ZooKeeper) is safer.

**The Redis ecosystem in 2026:**

In **March 2024**, Redis Ltd. changed the license from BSD to a dual SSPL/RSALv2 (not OSI-approved open source). The Linux Foundation responded by forking Redis 7.2 as **Valkey** (BSD license), backed by AWS, Google, Oracle, and Ericsson. Since then:
- **AWS ElastiCache** and **Google Cloud Memorystore** added Valkey as a managed engine; AWS prices it 20% below Redis OSS on nodes and ~33% below on serverless.
- **Valkey 8.0** (Sept 2024) added multi-threaded I/O, making it measurably faster than the Redis 7.2 baseline on multi-core hardware; **Valkey 9.0** (Oct 2025) added atomic slot migration (safer resharding), per-field hash expiry, and numbered databases in cluster mode.
- **Redis 8 (May 2025)** added **AGPLv3** as a third license option alongside RSALv2/SSPLv1 (OSI-approved open source again, though copyleft — not permissive like BSD), folded the former Redis Stack modules (JSON, search, time series) into the core, and added **vector sets** (native ANN support).
- **Dragonfly** is a multi-threaded, Redis/Memcached-compatible in-memory store that sidesteps the single-threaded bottleneck by using a shared-nothing architecture per CPU core — its vendor benchmarks claim up to 25× higher throughput on large instances; mainly relevant at extreme scale.

```
   Decision tree (2026):
   Need Redis-compatible in-memory store?
     ├─ Self-hosted / cloud-neutral → Valkey (BSD, Linux Foundation)
     ├─ AWS managed                → ElastiCache for Valkey (cheapest engine)
     ├─ GCP managed                → Memorystore for Valkey
     ├─ Need vector sets / full Redis features → Redis 8 (AGPL option)
     └─ Extreme single-node throughput → Dragonfly
```

- **Scaling:** **replicas** for read scaling/HA; Redis/Valkey Cluster for sharding. Managed: ElastiCache, Memorystore, Redis Cloud, Upstash (serverless).

**Common issues developers hit:**

| Symptom | Real cause | Fix |
|---|---|---|
| Latency spike, the server "freezes" | A blocking `KEYS *` / big `SMEMBERS` on a large keyspace | Use `SCAN`; never run `KEYS` in production |
| DB gets hammered when a key expires | **Cache stampede** — many requests rebuild the same key at once | Add TTL jitter, a rebuild lock, or stale-while-revalidate |
| Memory full, writes start failing | `noeviction` policy with dataset > `maxmemory` | Set `allkeys-lru` for a pure cache; size RAM; shard |
| One "big key" causes periodic stalls | A single huge hash/list/set blocks the single thread | Split big keys; avoid million-element structures |
| Hot key overloads one shard/node | All traffic hits one key (or one hash slot) | Add an in-process/local cache in front; replicate the key |
| ~1 second of writes lost on crash | AOF `everysec` (or RDB) durability window | `appendfsync always` for critical data — or don't use Redis as the source of truth |
| Stale data served after an update | Cache wasn't invalidated on write | Invalidate/update on write; keep TTLs short |

**Senior gotchas & anti-patterns — worked examples:**

**1. `KEYS` and other O(N) commands freeze every client.**
```
# ❌ ANTI-PATTERN: O(N) over the whole keyspace on the single-threaded core —
# blocks EVERY other client until it finishes.
KEYS user:*
SMEMBERS huge_set            # same trap on any large collection
HGETALL huge_hash

# ✅ FIX: incremental, cursor-based iteration that never blocks for long.
SCAN 0 MATCH user:* COUNT 100
SSCAN huge_set 0 COUNT 100
```

**2. Cache stampede (thundering herd) hammers the DB on expiry.** The program below runs both versions against in-memory stand-ins for Redis and the database (no servers needed): 50 requests hit one key at the same instant, and the database is slow (200 ms), so every request that misses piles in before the first rebuild finishes.

The naive version sends all 50 requests to the database; the single-flight version sends exactly 1 (the lock winner re-checks the cache after taking the lock, so a late caller cannot trigger a second rebuild), and the jitter spreads the five rebuilt keys' expiries across 300–360 s instead of all at 300 s.

**3. Keys without a TTL are a slow memory leak; cross-slot ops break in Cluster.**
```
# ❌ Session/cache data written with no expiry accumulates until maxmemory →
#    evictions or write failures. Always bound cache/session keys:
SET session:abc "..."            # ❌ no expiry
SET session:abc "..." EX 1800    # ✅ 30-min TTL

# ❌ In Redis Cluster these keys hash to different slots → CROSSSLOT error:
MGET user:1 user:2 user:3
# ✅ Co-locate them on one slot with a hash tag {...}:
MGET {user}:1 {user}:2 {user}:3
```

**4. Limitation — Redlock is not safe for correctness-critical locks.** Under GC pauses, clock drift, or partitions a lock can be held by two clients at once. For "must never double-execute" paths (payments), use a CP store (etcd/ZooKeeper) or a **fencing token** the resource validates. Remember Redis is a speed layer: with `appendfsync everysec` you can lose ~1s of writes on crash, so never make it the durable source of truth.

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Sub-millisecond read/write latency; rich data structures (sorted sets, streams, pub/sub) cover many use-cases beyond plain caching; Valkey is BSD-licensed and offered by the major managed services (and priced below Redis OSS on AWS); Dragonfly provides multi-threaded throughput for extreme scale.
- **Cons:** All data must fit in RAM — cost scales with dataset size; AOF everysec durability can lose ~1 second of writes on crash; Redlock distributed locks have correctness caveats under network partitions and clock drift.
- **Limitations:** Single-threaded command execution means one slow command (e.g., `KEYS *` on a large keyspace) blocks all other clients; Redis Cluster cannot execute multi-key operations across different hash slots unless keys share a hash tag; dataset size is bounded by available RAM on the cluster.
- **Unsupported / anti-patterns:** Not a system of record for data that must survive memory loss; cannot serve relational joins or complex aggregations; not suitable for guaranteed-durable financial commits without careful AOF+fsync configuration; not a replacement for a database when data exceeds RAM budget.

</details>

**Python — cache stampede, naive vs single-flight (runnable):**

```python
import random
import threading
import time


# ❌ ANTI-PATTERN: thousands of concurrent requests miss the SAME expired key and
# all rebuild it against the database at the same instant.
def get_naive(key):
    v = redis.get(key)
    if v is not None: return v
    v = db.query(key)
    redis.set(key, v, ex=300)        # everyone expires at T+300 → synchronized stampede
    return v


# ✅ FIX: jittered TTL + a short single-flight lock so only one caller rebuilds.
def get(key):
    v = redis.get(key)
    if v is not None: return v
    if redis.set(f"lock:{key}", "1", nx=True, ex=10):    # only one winner rebuilds
        v = redis.get(key)           # re-check: a previous winner may have just finished
        if v is None:
            v = db.query(key)
            redis.set(key, v, ex=300 + random.randint(0, 60))  # jitter de-syncs expiry
        redis.delete(f"lock:{key}")
        return v
    time.sleep(0.05)                 # others back off and retry the cache
    return get(key)


# --- In-memory stand-ins so the demo runs without a Redis server or a database ---
class FakeRedis:
    """A dict of key -> (value, ttl). One mutex makes SET NX atomic, as in Redis."""
    def __init__(self):
        self.data, self.mu = {}, threading.Lock()

    def get(self, key):
        with self.mu:
            item = self.data.get(key)
            return item[0] if item else None

    def set(self, key, value, ex=None, nx=False):
        with self.mu:
            if nx and key in self.data: return False
            self.data[key] = (value, ex)
            return True

    def delete(self, key):
        with self.mu:
            self.data.pop(key, None)

    def ttl(self, key):
        return self.data[key][1]


class FakeDB:
    def __init__(self):
        self.queries, self.mu = 0, threading.Lock()

    def query(self, key):
        with self.mu:
            self.queries += 1
        time.sleep(0.2)              # a slow query = the window in which the herd piles in
        return f"row:{key}"


def burst(fn, n, cached=False):
    """Fire n concurrent requests for one key; an empty cache = the key just expired."""
    global redis, db
    redis, db = FakeRedis(), FakeDB()
    if cached: redis.set("user:42", "row:user:42", ex=300)
    start, results = threading.Barrier(n), []

    def request():
        start.wait()                 # release all n requests at the same instant
        results.append(fn("user:42"))

    threads = [threading.Thread(target=request) for _ in range(n)]
    for t in threads: t.start()
    for t in threads: t.join()
    ok = all(r == "row:user:42" for r in results)
    q = db.queries
    return f"{q} DB {'query' if q == 1 else 'queries'}, all {n} callers got the row: {ok}"


if __name__ == "__main__":
    random.seed(42)
    print("naive,         50 requests, key expired ->", burst(get_naive, 50))
    print("single-flight, 50 requests, key expired ->", burst(get, 50))
    print("single-flight, 50 requests, key cached  ->", burst(get, 50, cached=True))
    redis, db = FakeRedis(), FakeDB()
    keys = [f"user:{i}" for i in range(1, 6)]
    for k in keys: get(k)            # rebuild 5 keys one after another
    print("single-flight, rebuild 5 keys -> TTLs", [redis.ttl(k) for k in keys])
```

**Output:**

```
naive,         50 requests, key expired -> 50 DB queries, all 50 callers got the row: True
single-flight, 50 requests, key expired -> 1 DB query, all 50 callers got the row: True
single-flight, 50 requests, key cached  -> 0 DB queries, all 50 callers got the row: True
single-flight, rebuild 5 keys -> TTLs [307, 301, 347, 317, 315]
```

---

### PostgreSQL — The Default Database

![Comparison infographic of PostgreSQL vs document stores: PostgreSQL as the do-everything filing cabinet (ACID, B-tree/GIN/GiST/HNSW indexes, MVCC + VACUUM) with a 6-rung scaling ladder from indexes + fix queries up to sharding with Citus / CockroachDB / Spanner; MongoDB / Cosmos DB as flexible folders with one order document { user, items[ ], status }, embed vs reference, the 16 MB document cap, w:1 vs w:majority, the Cosmos consistency slider Strong → Bounded Staleness → Session (default) → Consistent Prefix → Eventual and an RU/s gauge hitting 429; an at-a-glance table (model, scaling, consistency knob, best for) for PostgreSQL, MongoDB and Cosmos DB; a pick-by-need table; common mix-ups (N+1 = 101 round-trips → one JOIN, OFFSET 100000 → keyset, createdAt/country shard key → hashed userId, unbounded $push → bucket pattern); trap: schemaless still has a schema.](diagrams/sd22_info_postgres_vs_documents_ai.png)

<details>
<summary><strong>Read as text</strong> — indexes, MVCC, the scaling ladder and query gotchas</summary>

> **Simple Explanation:** Postgres is the **reliable, do-everything filing cabinet**. It stores your data safely, never loses a committed write, enforces rules (this column must be a valid email), and answers complex questions with SQL. When in doubt about which database to start with, the answer is almost always "Postgres."

> **Official Definition:** PostgreSQL is an open-source, ACID-compliant relational database management system (RDBMS) supporting SQL, transactions, complex joins, JSON documents, full-text search, and rich extensions (e.g., PostGIS for geospatial, pgvector for embeddings).

- **Why it dominates in 2025–2026:** It does far more than "rows and tables." With `pgvector` it stores AI embeddings; with JSONB it acts like a document store; extensions add time-series, geospatial, and more. "Just use Postgres" is a genuine architecture strategy.
- **ACID** = Atomicity, Consistency, Isolation, Durability — the guarantees that make money and orders safe.
- **Use it when:** Almost any transactional workload — users, orders, payments, inventory. Default choice for a new system.
- **Avoid when:** You need to scale writes horizontally across regions beyond what one primary can handle (then look at Cassandra, Spanner, CockroachDB), or your workload is pure large-scale analytics (then a warehouse like Snowflake/BigQuery fits better).
- **Senior gotcha:** A single Postgres instance scales reads (via replicas) far more easily than writes. Know the difference between **vertical scaling** (bigger box), **read replicas**, and **sharding** before you need them.

**Going deeper — what makes it fast and safe:**

- **Indexes** are the #1 performance lever. A **B-tree** index turns a full-table scan into a fast lookup. Specialized indexes: **GIN** (JSONB, full-text, arrays), **GiST** (geospatial), and **HNSW** (vector similarity via pgvector). The first thing to check on a slow query is "is there an index for this `WHERE`/`JOIN`?"
- **`EXPLAIN ANALYZE`** shows the query plan and where time goes — the single most useful debugging tool.

```sql
-- Without an index this scans every row; with one it's a fast lookup.
CREATE INDEX idx_orders_user ON orders (user_id);
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
```

- **MVCC (Multi-Version Concurrency Control):** readers never block writers and vice-versa, because Postgres keeps multiple row versions. The cost is **bloat** — old versions need `VACUUM` (autovacuum usually handles it).
- **Transaction isolation levels:** `READ COMMITTED` (default) → `REPEATABLE READ` → `SERIALIZABLE` (strongest, prevents subtle anomalies at some performance cost). Knowing these prevents real concurrency bugs.
- **Scaling path, in order:** (1) add **indexes** and fix queries → (2) **vertical** scale (bigger machine) → (3) **read replicas** for read-heavy load → (4) **partition** big tables by date/range → (5) **connection pooling** (PgBouncer — Postgres connections are expensive, each costs ~5–10 MB) → (6) only then **shard** or reach for Citus/CockroachDB/Spanner.
- **Beyond rows:** `JSONB` (indexed document storage), `LISTEN/NOTIFY` (pub/sub), full-text search, and `pgvector` for AI embeddings — often you don't need a second database at all.

**Replication deep-dive:**

Postgres replication is **streaming replication** (physical WAL — Write-Ahead Log — replayed on standby). The standby can be:
- **Hot standby** (read-only queries allowed) — good for offloading reports.
- **Synchronous** (primary waits for standby to ack before committing) → zero data loss, lower write throughput.
- **Asynchronous** (default) → minimal lag, but a few seconds of data can be lost if the primary crashes.
- **Logical replication** decodes the WAL into row-level changes and can replicate a subset of tables to a heterogeneous target (different Postgres major version, or a downstream consumer).

**Table partitioning:**

Declarative partitioning (Postgres 10+) splits a large table into child tables managed automatically. Common strategies:

```sql
-- Range partition by month — old months stay on cheap storage
CREATE TABLE events (id bigint, ts timestamptz, payload jsonb)
  PARTITION BY RANGE (ts);
CREATE TABLE events_2026_06 PARTITION OF events
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
```

Queries with a `WHERE ts BETWEEN ...` filter will touch only matching partitions (partition pruning). Pair with `pg_partman` extension for automatic monthly partition creation and archival.

**When to leave Postgres for distributed SQL:**

| Signal | What it means |
|---|---|
| Write throughput maxes a single primary | Vertical scaling topped out; shard or switch |
| Multi-region active-active writes | Postgres replication is single-primary only |
| Table rows > ~500M and partitioning gets unwieldy | Sharding wins |
| Must survive a whole-region outage with zero data loss and keep taking writes | Spanner / CockroachDB / Aurora DSQL |

The rule of thumb: exhaust the Postgres scaling ladder before adding distributed SQL's operational and consistency complexity. Most applications never need it.

**Common issues developers hit:**

| Symptom | Real cause | Fix |
|---|---|---|
| A query is suddenly slow | Missing index, or the planner switched to a sequential scan | `EXPLAIN ANALYZE`; add the right index; refresh stats with `ANALYZE` |
| "too many connections" / "remaining connection slots" | App opens connections directly; each costs ~5–10 MB | Put **PgBouncer** in front; pool connections |
| Queries or writes mysteriously hang | Lock contention or `idle in transaction` sessions holding locks | Inspect `pg_stat_activity`; keep transactions short |
| Table and disk keep growing, scans slow down | MVCC dead tuples (**bloat**); autovacuum can't keep up | Tune autovacuum; `VACUUM` / `pg_repack` |
| A page fires hundreds of tiny queries | **N+1** query pattern from the ORM | Eager-load / batch (`IN (...)`, joins) |
| Read replica returns stale rows | Asynchronous replication lag | Read critical-after-write from the primary; monitor lag |
| Seq scan despite an index existing | Function wrapping the column, or a type mismatch in `WHERE` | Match types; add an expression index |

**Senior gotchas & anti-patterns — worked examples:**

**1. N+1 queries from the ORM.**
```sql
-- ❌ ANTI-PATTERN: 1 query for the list + 1 per row = 101 round-trips for 100 orders.
SELECT * FROM orders WHERE user_id = 42;          -- then, per order returned:
SELECT * FROM order_items WHERE order_id = $1;    -- ×100

-- ✅ FIX: one round-trip with a join (or a single IN (...) batch).
SELECT o.*, i.*
FROM orders o
JOIN order_items i ON i.order_id = o.id
WHERE o.user_id = 42;
```

**2. A function on the column makes the index unusable (sargability).**
```sql
-- ❌ Wrapping the column forces a full sequential scan — the B-tree index is ignored.
SELECT * FROM users  WHERE lower(email) = 'ada@x.com';
SELECT * FROM events WHERE date(created_at) = '2026-06-21';

-- ✅ Keep the column bare with a matching expression index, or use a range.
CREATE INDEX idx_users_email_lower ON users (lower(email));   -- now the 1st query uses it
SELECT * FROM events                                          -- range beats date():
WHERE created_at >= '2026-06-21' AND created_at < '2026-06-22';
-- Always confirm with EXPLAIN (ANALYZE, BUFFERS) — read the plan, don't guess.
```

**3. `OFFSET` pagination degrades on deep pages.**
```sql
-- ❌ OFFSET 100000 still scans and throws away 100k rows — slower the deeper you page.
SELECT * FROM events ORDER BY id LIMIT 20 OFFSET 100000;

-- ✅ Keyset ("seek") pagination: remember the last id and jump straight to it.
SELECT * FROM events WHERE id > $last_seen_id ORDER BY id LIMIT 20;
```

**4. Direct connections exhaust the server — pool them.**
```
❌ A 200-pod service each opening 50 direct Postgres connections = 10,000 backends,
   each ~5–10 MB → the DB OOMs or throws "remaining connection slots are reserved".
✅ Put PgBouncer (transaction pooling) in front; the app talks to the pooler, which
   multiplexes a few hundred real backends. And keep transactions SHORT — an
   "idle in transaction" session pins a backend AND holds its locks.
```

**5. Limitation — a long-running transaction blocks `VACUUM` (bloat + wraparound risk).** MVCC keeps old row versions until no transaction can still see them. One forgotten `BEGIN;` or an idle analytics session holds the `xmin` horizon back, so autovacuum can't reclaim dead tuples — tables bloat, indexes degrade, and in the extreme you approach transaction-ID wraparound. Watch `pg_stat_activity` for long `xact_start`; never leave a session `idle in transaction`.

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** ACID compliance; enormously rich feature set (JSONB, pgvector, PostGIS, full-text search, logical replication); strong extension ecosystem; "just use Postgres" is a genuine architecture strategy for most applications.
- **Cons:** Single-primary write ceiling (vertical scaling only, natively); connections are expensive — PgBouncer is practically mandatory at scale; MVCC bloat requires regular VACUUM to prevent table bloat and index degradation.
- **Limitations:** No native horizontal write sharding — requires Citus or a migration to distributed SQL; multi-region active-active writes are not supported by the native replication model; large analytical full-table scans are significantly slower than columnar warehouses; each connection consumes ~5–10 MB of memory, limiting raw connection count.
- **Unsupported / anti-patterns:** Petabyte-scale OLAP — online analytical processing, i.e. big scans and aggregations (use Snowflake/Databricks); multi-region active-active transactional writes (use Spanner/CockroachDB); workloads requiring horizontal write sharding without external tools.

</details>

---

### MongoDB & Cosmos DB — Document & Multi-Model NoSQL

<details>
<summary><strong>Read as text</strong> — documents, shard keys, consistency levels and RU/s</summary>

> **Simple Explanation:** If Postgres is a filing cabinet of rigid, identical forms (every row has the same columns), **MongoDB** is a box of **flexible folders** — each document can hold a different shape of data (nested objects, arrays, optional fields), stored as JSON. You keep an order *and everything about it* — line items, address, history — in **one document**, and read it back in a single call. **Cosmos DB** is Microsoft's fully-managed, globally-distributed cousin that speaks MongoDB's language (and several others) with a turnkey SLA.

> **Official Definition:** MongoDB is a source-available (SSPL-licensed), document-oriented NoSQL database that stores data as flexible BSON (binary JSON) documents grouped into collections, with secondary indexes, an aggregation pipeline, horizontal scaling via sharding, and replica-set high availability. Azure Cosmos DB is a fully-managed, globally-distributed, multi-model database exposing several wire-compatible APIs (NoSQL, MongoDB, Cassandra, Gremlin graph, Table) with turnkey multi-region replication and well-defined consistency levels.

| | **MongoDB** | **Azure Cosmos DB** |
|---|---|---|
| Model | Document (JSON/BSON) | Multi-model (document, key-value, graph, wide-column) |
| Operated by | You self-host, or **Atlas** (managed) | Fully managed by Azure only |
| Scaling | You design the **shard key** | Auto-partitioning by **partition key** |
| Pricing | Cluster / instance size | **Request Units (RU/s)** — provisioned or serverless |
| Global writes | Configurable, more setup | Turnkey multi-region, multi-write |
| Mental model | "flexible JSON database" | "managed, planet-scale JSON database" |

- **Why they're popular in 2025–2026:** Document databases map directly onto the objects in your code — no object-relational friction, no migration to add a field. MongoDB is a perennial top-5 database (DB-Engines) and a default for Node/JS apps, content/catalog systems, and rapid-iteration products. Cosmos DB is the go-to managed NoSQL for Azure-centric shops that need a global, low-latency, SLA-backed store without running servers.
- **Use them when:** Flexible or evolving schemas; hierarchical/nested data (product catalogs, user profiles, CMS content, IoT/event payloads, game state); rapid prototyping; or read-by-id-heavy access where the whole entity lives in one document. Cosmos specifically when you need turnkey global distribution with a latency/availability SLA on Azure.
- **Avoid when:** Data is highly relational with many-to-many joins and ad-hoc analytical queries across entities (Postgres is simpler and cheaper), or you need high-rate multi-document ACID transactions. Large-scale analytics belong in a warehouse, not in Mongo/Cosmos.
- **Senior gotcha:** "Schemaless" does **not** mean "no schema" — it means the schema lives in your application and your access patterns. The #1 design decision is the **shard key (MongoDB) / partition key (Cosmos)**; a poor choice creates a **hot partition** that throttles throughput and is painful to change later. In Cosmos, both your bill and your throttling (`429 Too Many Requests`) are governed by **Request Units (RU/s)** — model access patterns to the RU budget.

**Going deeper — modeling for documents, not tables:**

- **Embed vs. reference (the core modeling choice):** *Embed* related data in one document when it's read together and bounded (order + its line items). *Reference* (store an id, look up separately) when data is large, unbounded, or shared (a user referenced by thousands of posts). Embedding favors single-read performance; referencing avoids unbounded growth — MongoDB's hard limit is **16 MB per document**.
- **The aggregation pipeline** is MongoDB's analytical workhorse — a staged `$match → $group → $sort → $lookup` flow (the rough equivalent of SQL `WHERE / GROUP BY / ORDER BY / JOIN`). `$lookup` does joins, but they are far weaker than a relational engine's — design to avoid needing them.
- **Indexes are mandatory, exactly like Postgres:** an unindexed query is a full **collection scan**. Back your filter and sort fields with single-field, **compound**, text, geospatial, or **TTL** indexes (TTL auto-expires documents — great for sessions/events). `explain()` is the `EXPLAIN ANALYZE` equivalent.
- **Consistency & durability:** tune **write concern** (`w:1` fast vs. `w:majority` durable) and **read preference** (primary vs. secondaries). A **replica set** gives automatic failover; **sharding** scales writes horizontally across the shard key.
- **Cosmos DB's five consistency levels** are its signature feature — a spectrum from **Strong → Bounded Staleness → Session → Consistent Prefix → Eventual**. Stronger = higher latency and RU cost; **Session** (the default) is the pragmatic sweet spot for most apps. This explicit, tunable knob is something most databases hide.
- **Cosmos RU/s model:** every read, write, and query costs Request Units; you provision RU/s (or use serverless/autoscale). Under-provision → throttling (`429`); over-provision → wasted money. It is the direct analog of "right-sizing a Snowflake warehouse."

```javascript
// MongoDB: one document holds the whole order — no joins to read it back
db.orders.insertOne({
  _id: "ord_1001",
  user:  { id: 42, name: "Ada" },          // embedded sub-document
  items: [                                  // embedded array
    { sku: "A1", qty: 2, price: 9.99 },
    { sku: "B7", qty: 1, price: 19.99 }
  ],
  status: "paid", createdAt: new Date()
});

// Index the fields you filter/sort on, then aggregate (spend = qty × price per item)
db.orders.createIndex({ "user.id": 1, createdAt: -1 });
db.orders.aggregate([
  { $match: { status: "paid" } },
  { $unwind: "$items" },                                   // one row per line item
  { $group: { _id: "$user.id",
              spent: { $sum: { $multiply: ["$items.qty", "$items.price"] } } } },
  { $sort:  { spent: -1 } }
]);
```

**Common issues developers hit:**

| Symptom | Real cause | Fix |
|---|---|---|
| Queries slow down as data grows | No index → full collection scan | Add single/compound indexes on filter+sort fields; check `explain()` |
| One shard/partition is hot, throughput capped | Low-cardinality or monotonically-increasing shard/partition key | Pick a high-cardinality, evenly-distributed key; avoid raw timestamps/sequential ids |
| A document grows until it errors | Unbounded array embedded in one document (16 MB cap) | Reference instead of embed; bucket or cap the array |
| Cosmos returns `429 Too Many Requests` | RU/s budget exceeded by the workload | Raise RU/s, enable autoscale, or rewrite queries to cost fewer RUs |
| Read right after write returns stale data | Reading a secondary / weak consistency | Use `w:majority` + primary read, or Cosmos Session/Strong consistency |
| `$lookup` joins are slow | Using Mongo like a relational DB | Re-model: embed, or denormalize what is read together |
| Surprise Cosmos bill | Over-provisioned RU/s or extra replicated regions | Right-size RU/s (autoscale/serverless); limit regions to what you need |

**Senior gotchas & anti-patterns — worked examples:**

**1. An unbounded embedded array eventually hits the 16 MB document cap.**
```javascript
// ❌ ANTI-PATTERN: append events forever into one document → it grows until it errors,
// and EVERY update rewrites the whole (ever-larger) document.
db.devices.updateOne({ _id: d }, { $push: { readings: reading } });   // unbounded

// ✅ FIX: the "bucket pattern" — cap each document (e.g. one bucket per hour) so
// documents stay small and writes stay cheap.
db.readings.updateOne(
  { device: d, hour: "2026-06-21T13", count: { $lt: 1000 } },
  { $push: { values: reading }, $inc: { count: 1 } },
  { upsert: true });
```

**2. A bad shard / partition key creates a hot partition.**
```javascript
// ❌ Monotonically-increasing or low-cardinality keys funnel writes to ONE shard.
sh.shardCollection("app.events", { createdAt: 1 });   // all new writes hit the newest chunk
sh.shardCollection("app.events", { country:   1 });   // 80% of traffic = one country = one shard

// ✅ High-cardinality, evenly-distributed key (often hashed) spreads writes across shards.
sh.shardCollection("app.events", { userId: "hashed" });
```

**3. Using `$lookup` like a relational JOIN.**
```javascript
// ❌ Joining two big collections on every read — far weaker and slower than a SQL engine.
db.orders.aggregate([{ $lookup: {
  from: "users", localField: "userId", foreignField: "_id", as: "user" }}]);

// ✅ Embed (or denormalize) what is read together, so the read is a single document.
db.orders.insertOne({ _id: "ord_1", user: { id: 42, name: "Ada" }, items: [/* ... */] });
```

**4. Limitation — RU/s (Cosmos) and missing indexes drive cost and `429`s.** In Cosmos DB every read, write, and query costs Request Units; an unindexed or cross-partition query burns RUs and triggers `429 Too Many Requests` under load. Index the fields you filter/sort on (`explain()` is the `EXPLAIN ANALYZE` equivalent), keep queries within one partition key where you can, and size RU/s with autoscale. The same "index your access patterns" rule keeps plain MongoDB queries off full collection scans.

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Flexible schema maps directly to application objects (no migration to add a field); single-document reads/writes are fast and atomic; horizontal scaling via sharding/partitioning; rich secondary indexes and aggregation pipeline; MongoDB Atlas and Cosmos DB offer fully-managed, multi-region operation; Cosmos adds turnkey global distribution with explicit, SLA-backed consistency levels.
- **Cons:** Cross-document joins are weak and discouraged — relational analytics are painful; the shard/partition key is a hard-to-reverse, performance-critical decision; "schemaless" pushes schema enforcement into application code; Cosmos's RU/s model makes cost and throttling a constant tuning concern; Cosmos is Azure-only (vendor lock-in).
- **Limitations:** MongoDB documents are capped at 16 MB; multi-document ACID transactions exist but add latency and don't scale like single-document writes; large `$lookup` joins degrade at scale; Cosmos throughput is bounded by provisioned RU/s and per-partition limits; strong global consistency trades away latency and RU budget.
- **Unsupported / anti-patterns:** Highly relational workloads with many-to-many joins (use Postgres); large-scale ad-hoc analytical querying across entities (use a warehouse/lakehouse); low-cardinality or monotonically-increasing shard/partition keys; treating a document store as a drop-in for complex transactional relational integrity.

</details>

---

### Cloud + Object Storage (S3 / GCS / Azure Blob) — The Foundation

![Infographic on object storage (S3 / GCS / Blob): files stored as objects (data + metadata + key) in a flat namespace over HTTP with 11 nines (99.999999999%) durability and strong read-after-write consistency; a storage-class panel (Express One Zone single-digit ms, then the lifecycle Standard → Standard-IA after 30 days → Glacier after 90 → expire at day 365); the lakehouse stack S3 / GCS / ADLS + Iceberg / Delta + Spark / Snowflake / Flink replacing HDFS; a partitioned key s3://lake/events/dt=2026-06-21/region=eu/part-0001.parquet for pruning; presigned URL, multipart and least-privilege IAM mini-panels; and a symptom → cause → fix table (503 SlowDown, surprise bill, AccessDenied, scans everything, tiny files).](diagrams/sd22_info_object_storage_ai.png)

<details>
<summary><strong>Read as text</strong> — storage classes, key design, IAM and lifecycle rules</summary>

> **Simple Explanation:** Object storage is an **infinite, cheap warehouse** where you throw files (images, logs, datasets, model checkpoints) and never worry about running out of space or losing them. Amazon **S3** is the archetype. It's the bedrock the entire modern data stack sits on.

> **Official Definition:** Object storage is a highly durable, virtually unlimited storage system that manages data as **objects** (file + metadata + unique key) in a flat namespace, accessed over HTTP APIs. S3 advertises 99.999999999% ("eleven nines") durability.

```
   The modern "lakehouse" foundation:
   ┌──────────────────────────────────────────────┐
   │  S3 / GCS / ADLS  (cheap, infinite, durable) │  ← raw files (Parquet)
   │     +  Table format (Iceberg / Delta)        │  ← adds DB-like powers
   │     +  Engine (Spark / Snowflake / Flink)    │  ← reads & processes
   └──────────────────────────────────────────────┘
   This stack REPLACED Hadoop's HDFS.
```

- **Use it when:** Storing anything large or unstructured — datasets, backups, logs, ML artifacts, static assets — and as the storage layer for a data lake/lakehouse.
- **Avoid when:** You need low-latency, transactional row-level access (use a database). Object storage is for *blobs and bulk*, not for serving individual records in 1 ms.
- **Senior gotcha:** Cloud fluency (IAM permissions, regions, egress costs) is assumed in most senior roles. **Egress fees** (paying to move data *out*) are a notorious budget killer — design to minimize cross-region/cross-cloud transfer.

**Going deeper — what separates a pro from a beginner here:**

- **Storage classes = cost vs. access speed.** Hot data → S3 Standard; rarely accessed → Infrequent Access; archives → Glacier Instant/Flexible/Deep Archive (cheap to store, progressively slower/costlier to retrieve). **Lifecycle rules** auto-move old objects to cheaper tiers. **S3 Express One Zone** (launched late 2023) is a high-performance class: stored in a single **Availability Zone** (AZ — one data-center group within a region), consistent single-digit-millisecond access (up to ~10× faster than Standard), much cheaper requests after the April 2025 price cuts, but a higher per-GB storage price — purpose-built for ML training data access, Spark shuffle, and analytics hot paths where you need speed but tolerate single-AZ durability.
- **File format matters enormously.** Store analytics data as **Parquet** (columnar, compressed), not CSV/JSON. A query reading 2 of 50 columns touches only those 2 columns on disk — often **10–100× less data scanned** = faster and cheaper.

```
CSV  : row-by-row, uncompressed   →  scan everything, every query
Parquet: columnar + compressed    →  read only needed columns + skip row-groups
         (this is why warehouses/lakes standardize on it)
```

- **Key/prefix design:** the object "path" is just a key. Partition data by useful prefixes so engines can **prune** what they read:
  `s3://bucket/events/dt=2026-06-03/region=eu/part-0001.parquet`
- **Access patterns:** **presigned URLs** let a browser upload/download directly (no proxying through your server); **IAM roles/policies** grant least-privilege access. Never bake static keys into code.
- **Multipart upload:** for objects > 100 MB, split the file into parts (minimum 5 MB each, up to 10,000 parts) uploaded in parallel, then assembled server-side with `CompleteMultipartUpload`. Mandatory for objects > 5 GB (the single-`PUT` limit); a single object can be up to 50 TB (raised from 5 TB in Dec 2025). Benefits: parallelism, retry individual parts on failure, and start uploading before the full file is known. Most SDKs do this automatically with a threshold you configure.
- **Consistency:** modern S3 is **strongly read-after-write consistent** (since Dec 2020) — after a successful write, the next read *and* `LIST` see it (older "eventual consistency" caveats are gone).

**Common issues developers hit:**

| Symptom | Real cause | Fix |
|---|---|---|
| `503 SlowDown` under heavy load | Too many requests concentrated on one key prefix | Spread keys across prefixes — S3 scales per prefix (~3,500 writes + 5,500 reads per second each) |
| Surprise huge bill | **Egress** + per-request cost on millions of small reads | Minimize cross-region transfer; batch into larger objects (Parquet) |
| `AccessDenied` | IAM policy/role missing the exact action or resource ARN | Grant least-privilege `s3:GetObject`/`PutObject` on the right ARN |
| Bucket accidentally public | Misconfigured bucket policy/ACL | Enable **Block Public Access**; audit policies |
| `LIST` is slow / paginates forever | Millions of objects under one prefix | Partition by prefix; keep a manifest/catalog (Iceberg/Delta) |
| Queries scan everything and cost a lot | Data stored as CSV/JSON instead of columnar | Convert to **Parquet** and partition for pruning |
| "Tiny files" problem kills performance | Millions of small objects → per-request overhead dominates | Compact into larger files |

**Senior gotchas & anti-patterns — worked examples:**

**1. Least-privilege IAM — never `s3:*` on `*`.**
```json
// ❌ ANTI-PATTERN: god-mode — every action on every bucket. One leaked key = total compromise.
{ "Effect": "Allow", "Action": "s3:*", "Resource": "*" }

// ✅ FIX: grant the exact actions on the exact bucket/prefix.
{ "Effect": "Allow",
  "Action":   ["s3:GetObject", "s3:PutObject"],
  "Resource": "arn:aws:s3:::my-data-lake/uploads/*" }
```

**2. Lifecycle rules auto-tier cold data (don't pay Standard forever).**
```json
// ✅ Age objects into cheaper classes, then expire them — set once, runs automatically.
{ "Rules": [{
    "ID": "archive-old-events", "Status": "Enabled",
    "Filter": { "Prefix": "events/" },
    "Transitions": [
      { "Days": 30, "StorageClass": "STANDARD_IA" },
      { "Days": 90, "StorageClass": "GLACIER" }
    ],
    "Expiration": { "Days": 365 }
}]}
```

**3. Presigned URLs — let clients transfer directly, not through your server.**
```python
# ❌ Proxying a 2 GB upload THROUGH your API wastes its bandwidth and memory.
# ✅ Hand the browser a short-lived presigned URL; it talks straight to S3.
url = s3.generate_presigned_url(
    "put_object",
    Params={"Bucket": "my-data-lake", "Key": f"uploads/{file_id}"},
    ExpiresIn=300)          # 5-minute window; never ship static keys to clients
```

**4. Partition the key layout for pruning; avoid tiny files and in-place edits.**
```
❌ s3://lake/events/part-0001.csv          (one flat prefix · CSV · millions of files)
   → every query LISTs + scans everything; per-request cost dominates.
✅ s3://lake/events/dt=2026-06-21/region=eu/part-0001.parquet   (Parquet · partitioned)
   → WHERE dt='2026-06-21' AND region='eu' reads ONLY that slice.
   • Compact small files into ~128 MB–1 GB objects.
   • Objects are immutable: to change one byte you rewrite the whole object —
     use a table format (Iceberg/Delta) when you need row-level updates.
```

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Virtually unlimited scale and eleven-nines durability; decoupled from compute (storage scales and bills independently); the universal foundation for lakehouses, ML artifact stores, and data archives; native integration with every major cloud service.
- **Cons:** Tens-to-hundreds of milliseconds baseline latency (except Express One Zone); LIST operations are slow and costly on large prefixes; per-request pricing makes high-frequency small reads expensive; egress fees for cross-region/cross-cloud transfers can dominate budgets.
- **Limitations:** Objects are immutable — no in-place edits (only S3 Express One Zone supports appends); you must rewrite the entire object to change any byte; no cross-object transactions; LIST at massive scale (millions of objects per prefix) is slow — it pages 1,000 keys per call.
- **Unsupported / anti-patterns:** Low-latency single-record serving (use Redis or a database); row-level transactional updates (use a table format like Iceberg on top); POSIX file-locking semantics; small, frequent random writes (the per-request cost and latency make this antieconomical).

</details>

---

### Apache Spark — The Heavy-Lifting Processor

![Infographic on Apache Spark: one huge dataset (terabytes) split into four partitions, each processed by an executor in RAM and merged into one combined result, with a driver sending tasks and a lazy plan read → filter → groupBy → write = ACTION; an AQE panel (on by default since 3.2) contrasting fixed 200 shuffle partitions (10 TB → 200 tasks of ~50 GB → OOM; 10 MB → 200 tasks of ~50 KB → overhead) with runtime coalescing, broadcast-join switching and skew splitting; shuffle vs broadcast(small); a 'US 90%' skewed key salted into US·0 … US·15 (16 parallel tasks); and a symptom → cause → fix table.](diagrams/sd22_info_spark_ai.png)

<details>
<summary><strong>Read as text</strong> — lazy plans, shuffles, AQE and data skew</summary>

> **Simple Explanation:** Spark is a **team of workers splitting a giant task**. To count words in a library too big for one person, you hand each worker a few shelves; they count in parallel, then combine totals. Spark splits huge datasets across many machines and processes them together — far faster than one machine, and it does most of the work in memory.

> **Official Definition:** Apache Spark is a distributed, in-memory data-processing engine for large-scale batch and (micro-batch) stream processing, machine learning, and SQL analytics. It distributes computation across a cluster and is the de facto successor to Hadoop MapReduce.

```
   One huge dataset (terabytes)
            │  Spark splits it into partitions
   ┌────────┼────────┬────────┐
   ▼        ▼        ▼        ▼
 [worker] [worker] [worker] [worker]   ← process in parallel (mostly in RAM)
   └────────┴────┬───┴────────┘
                 ▼
            combined result
```

- **Why it beat Hadoop:** Hadoop's MapReduce wrote intermediate results to disk after every step; Spark keeps them in memory, making it 10–100× faster for many jobs, with a far nicer API (DataFrames, SQL, **PySpark**).
- **Use it when:** Transforming/aggregating large datasets (gigabytes to petabytes), big-data ETL, training on large data, or running heavy SQL analytics on a lake.
- **Avoid when:** Your data fits comfortably on one machine — plain Python/pandas or DuckDB is simpler and often faster. Spark's overhead only pays off at scale.
- **Senior gotcha:** Spark is **batch / micro-batch** first. For true event-by-event, sub-second streaming with rich state, reach for **Flink** (see Tier 2) — Spark 4.1's new Real-Time Mode (Dec 2025) narrows the gap only for simple stateless pipelines. Managed Spark = Databricks, AWS EMR, GCP Dataproc.

**Going deeper — the mental model that prevents slow jobs:**

- **DataFrame** is the API you'll use (think "a distributed pandas/SQL table"). Under the hood it's partitioned across workers.
- **Transformations are lazy; actions trigger work.** `filter`, `select`, `join` just *build a plan*. Nothing runs until an **action** (`count`, `write`, `collect`). Spark's **Catalyst optimizer** then optimizes the whole plan before executing.

```python
df = spark.read.parquet("s3://data/events/")     # lazy
daily = (df.filter(df.country == "US")           # lazy
           .groupBy("date").count())             # lazy
daily.write.parquet("s3://data/daily/")          # ACTION → now it all runs
```

- **The #1 performance killer is the SHUFFLE.** Operations like `groupBy`, `join`, and `distinct` move data across the network between workers. Minimize shuffles; **broadcast** small tables in joins (`broadcast(small_df)`) so the big table doesn't move.
- **Partitions = parallelism.** Too few → idle workers; too many tiny ones → scheduling overhead. **Data skew** (one key has most of the rows) makes one worker the bottleneck — a classic interview topic.
- **The cluster anatomy:** a **driver** plans the job and hands **tasks** to **executors** (the workers). Spark also gives you **MLlib** (ML) and **Structured Streaming** (micro-batch streaming) on the same engine.

**Adaptive Query Execution (AQE) — the 2020+ game-changer:**

AQE (enabled by default since Spark 3.2) lets Spark **re-optimize the query plan at runtime** based on statistics it collects during execution — not just from estimates beforehand. Key capabilities:

```
   Without AQE:  every shuffle uses a fixed spark.sql.shuffle.partitions (200),
                 and join strategies are chosen from (often stale) size estimates
                   10 TB shuffled → 200 tasks of ~50 GB each → spill / OOM
                   10 MB shuffled → 200 tiny ~50 KB tasks → pure scheduling overhead
   With AQE:     after the shuffle, Spark sees the actual partition sizes and:
                  • coalesces small post-shuffle partitions → fewer, larger tasks
                  • switches a sort-merge join to a broadcast join if one
                    side turns out to be small
                  • detects skewed partitions and splits them
```

Three AQE features to know: **(1) dynamic coalescing** of post-shuffle partitions (kills the "too many tiny tasks" problem — set a high starting partition count and let AQE merge them down), **(2) skew join optimization** (automatically splits oversized partitions of a join), **(3) dynamic join selection** (switches to a broadcast join at runtime when one side turns out small). It is on by default since 3.2 (`spark.sql.adaptive.enabled=true`).

**Structured Streaming** runs the same DataFrame/SQL API for streaming data. It processes Kafka/file streams as an **unbounded table** where new data is appended. By default the engine runs micro-batches back-to-back (or on a trigger interval you set), maintaining checkpoints in S3/HDFS so that, with a replayable source and an idempotent or transactional sink, results are exactly-once. Typical latency is sub-second to a few seconds; Spark 4.1 (Dec 2025) added a **Real-Time Mode** that reaches millisecond-level latency, initially only for stateless, single-stage queries. Contrast with Flink: Structured Streaming is good for pipelines already on Spark; use Flink when you need true event-time, per-event latency, or complex stateful logic.

**Common issues developers hit:**

| Symptom | Real cause | Fix |
|---|---|---|
| One task OOMs while the rest finish | **Data skew** — one key holds most of the rows | Enable AQE skew-join (joins); salt the key; broadcast the small side |
| Driver runs out of memory | `collect()` pulled a huge result back to the driver | Write to storage instead; only `collect()` small results |
| A stage is painfully slow | A massive **shuffle** from `groupBy` / `join` | Broadcast small tables; filter early; repartition sensibly |
| "Too many tiny tasks" / slow writes | Thousands of small partitions or output files | Let AQE coalesce post-shuffle partitions; compact output |
| `Spill to disk` warnings | Shuffle/aggregation exceeds executor memory | Add memory or partitions; reduce per-task data |
| Small job slower than plain pandas | JVM + cluster overhead on small data | Stay on one machine: pandas/Polars while data fits in RAM, DuckDB up to a few hundred GB |
| Code "ran" but nothing happened | Transformations are lazy until an action | Trigger with an action (`write`/`count`) — this is by design |

**Senior gotchas & anti-patterns — worked examples:**

**1. `collect()` drags the whole result into the driver → driver OOM.**
```python
# ❌ ANTI-PATTERN: pulls every row into the driver's single JVM heap.
rows = big_df.collect()
for r in rows: ...

# ✅ FIX: keep work distributed — write it out, or collect only a bounded sample.
big_df.write.parquet("s3://out/")
sample = big_df.limit(1000).collect()
```

**2. Not caching a reused DataFrame recomputes the entire lineage each action.**
```python
# ❌ Each action re-runs the WHOLE plan from S3 — the expensive join executes 3×.
joined = a.join(b, "id").filter(...)
print(joined.count())
joined.write.parquet("s3://out/")
top = joined.orderBy("score").limit(10).collect()

# ✅ Materialize once when it's reused across multiple actions.
joined = a.join(b, "id").filter(...).cache()
joined.count()        # populates the cache
joined.write.parquet("s3://out/")
```

**3. Joining a big table to a small one without broadcasting shuffles both sides.**
```python
# ❌ A sort-merge join moves BOTH sides across the network — the dominant cost.
big.join(small_dim, "country_code")

# ✅ Broadcast the small table so only it ships; the big table never moves.
from pyspark.sql.functions import broadcast
big.join(broadcast(small_dim), "country_code")
```

**4. Data skew makes one task run for hours while the cluster idles.**
```python
# ❌ One key ("US") holds 90% of rows → in a join, every "US" row is shuffled to the
# SAME task, so one straggler bottlenecks the stage. (A plain groupBy().sum()/count()
# suffers less: Spark pre-aggregates on each partition before the shuffle.)
big.join(other_big, "country")

# ✅ Easiest: let AQE split the skewed join partitions automatically (on by default):
#    spark.sql.adaptive.enabled=true ; spark.sql.adaptive.skewJoin.enabled=true
# ✅ Manual salting when AQE isn't enough: give each big-side row a random salt
#    0..15, copy every other-side row 16× (one per salt), join on (country, salt).
from pyspark.sql.functions import array, explode, floor, lit, rand
N = 16
left   = big.withColumn("salt", floor(rand() * N))             # hot key → 16 buckets
right  = other_big.withColumn("salt", explode(array(*[lit(i) for i in range(N)])))
result = left.join(right, ["country", "salt"]).drop("salt")   # 16 parallel tasks
```

**5. Python UDFs defeat the optimizer; tiny output files cripple later reads.**
```python
# ❌ A row-at-a-time Python UDF serializes every row JVM↔Python and is opaque to Catalyst.
@udf("double")
def to_c(f): return (f - 32) / 1.8
df.withColumn("c", to_c("f"))

# ✅ Use native columnar expressions (vectorized, optimized, no Python hop):
from pyspark.sql.functions import col
df.withColumn("c", (col("f") - 32) / 1.8)

# Tiny-files trap: writing thousands of small files cripples downstream reads.
# Compact before writing — df.repartition(200).write... — or let AQE coalesce.
```

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Handles petabyte-scale batch and micro-batch workloads on a single unified API (DataFrame/SQL/Streaming/MLlib); AQE auto-tunes query plans at runtime; runs on every major cloud (Databricks, EMR, Dataproc); 10–100× faster than Hadoop MapReduce.
- **Cons:** JVM startup and shuffle overhead make small-data jobs slower than DuckDB or pandas; heavy memory tuning required (executor heap, off-heap, shuffle memory); data skew on a single partition can bottleneck the entire stage.
- **Limitations:** Structured Streaming micro-batch latency is typically sub-second to seconds — the new Real-Time Mode (Spark 4.1) only covers simple stateless queries so far; shuffle is the dominant bottleneck in joins/aggregations and cannot be fully eliminated; on-heap JVM GC pauses can affect latency-sensitive stages.
- **Unsupported / anti-patterns:** Sub-second per-event streaming with complex state (use Flink); OLTP (online transaction processing — many small single-row reads/writes) point-lookups or row-level updates; interactive single-row queries; any job where data fits comfortably on one machine (DuckDB or pandas will be simpler and often faster).

</details>

---

## 22.4 TIER 2 — The Modern Data Stack

<details>
<summary><strong>Read as text</strong> — from building blocks to a data platform</summary>

TIER 1 gave you the building blocks; TIER 2 is how they assemble into an end-to-end **data platform**. Before meeting the tools one by one, it pays to see the whole assembly line — because almost every modern data system, from a three-person startup to Netflix or a bank, is the *same handful of stages* wired together. Learn the shape of the flow once, and every tool below snaps into a slot.

</details>

### How Data Flows Through a Big Data System

![Infographic of the modern data platform assembly line: SOURCES (apps, databases, APIs, logs, sensors) → 1 INGEST (Kafka, CDC, Fivetran / Airbyte) → 2 STORE (S3 / GCS / ADLS + Iceberg / Delta = LAKEHOUSE) → 3 PROCESS (Spark, dbt, Flink, Ray) → 4 SERVE (Snowflake / Databricks, Redis / Postgres), framed by ORCHESTRATE (Airflow / Dagster / Prefect) and OBSERVE + PROVISION (Prometheus, Grafana, OpenTelemetry, Terraform / OpenTofu); one order ord_1001 (total 39.97) entering Kafka topic orders and forking into a real-time lane (Flink fraud check → Redis live counters → live ops dashboard, seconds) and a nightly batch lane (S3 Parquet → Iceberg raw.orders → Airflow → dbt + Spark → Snowflake analytics.daily_revenue → BI dashboard); plus a batch-vs-streaming comparison table.](diagrams/sd22_info_data_flow_ai.png)

<details>
<summary><strong>Read as text</strong> — the stages, batch vs streaming and one order end to end</summary>

> **Simple Explanation:** Think of a bottling factory. Trucks drop raw ingredients at the loading dock (**ingest**), everything is kept in a giant warehouse (**store**), machines clean and mix it into product (**process / transform**), and finished bottles go to a storefront where customers grab them instantly (**serve**). A floor manager keeps the lines running in order (**orchestrate**), cameras watch for jams (**observe**), and the building itself was built from a blueprint (**provision**). A data platform is exactly this factory — for data instead of bottles.

> **Official Definition:** A modern data platform is a pipeline of loosely-coupled stages — **ingestion → storage → processing/transformation → serving** — wrapped by cross-cutting concerns of **orchestration, observability, and provisioning**. Each stage is independently scalable and swappable, connected by open formats (Parquet) and open table specs (Iceberg/Delta) so no single vendor owns the flow.

```
   ┌──────────────────── ORCHESTRATION   ·   Airflow / Dagster / Prefect ─────────────────────┐
   │               schedules, sequences, retries & backfills every stage below                │
   └──────────────────────────────────────────────────────────────────────────────────────────┘

       SOURCES           1 · INGEST         2 · STORE         3 · PROCESS         4 · SERVE
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │ apps         │   │ Kafka        │   │ S3/GCS/ADLS  │   │ BATCH: Spark │   │ Snowflake /  │
   │ databases    │ ▶ │ CDC          │ ▶ │ + Iceberg /  │ ▶ │        dbt   │ ▶ │ Databricks   │
   │ APIs · logs  │   │ Fivetran     │   │   Delta      │   │ STREAM:Flink │   │ (warehouse)  │
   │ sensors      │   │ Airbyte      │   │ = LAKEHOUSE  │   │ ML:    Ray   │   │ → Redis/PG   │
   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
                      └─ real-time path:  Kafka ─▶ Flink  →  process each event on arrival

   ┌──────────────────────────────── OBSERVE   +   PROVISION ─────────────────────────────────┐
   │ Prometheus · Grafana · OpenTelemetry watch every stage   ·   Terraform builds the infra  │
   └──────────────────────────────────────────────────────────────────────────────────────────┘
```

Every tool in this tier owns one slot in that picture. Here is the map, stage by stage:

| Stage | Its one job | Popular tools (this tier + the TIER 1 foundation) |
|---|---|---|
| **1. Ingest** | Get data in reliably, in real time or in batches | **Kafka** (event backbone), CDC — change data capture, streaming every row change out of a database (Debezium), Fivetran / Airbyte (managed extract-load) |
| **2. Store** | Keep it durably and cheaply, with table semantics | **S3 / GCS / ADLS** (object storage) **+ Iceberg / Delta** (table format) = the **lakehouse** |
| **3. Process / Transform** | Clean, join, aggregate, model, and train on it | **Spark** (batch), **dbt** (SQL transforms), **Flink** (streaming), **Ray** (ML) |
| **4. Serve / Analyze** | Answer queries fast for BI, apps, and dashboards | **Snowflake / Databricks** (warehouse/lakehouse), **Redis / Postgres** (app serving) |
| **Orchestrate** | Run the stages in order; retry and backfill | **Airflow / Dagster / Prefect** |
| **Observe** | Know it is healthy; alert when it breaks | **Prometheus + Grafana + OpenTelemetry** |
| **Provision** | Build the infra it all runs on, as code | **Terraform / OpenTofu** |

**Two paths through the middle — batch and streaming.** This is the single most important idea in the diagram:

- **Batch path (the default):** data lands in the lakehouse first, then is processed on a schedule — Spark/dbt transform it every hour or every night. Simple, cheap, and fault-tolerant. The vast majority of analytics live here.
- **Streaming path (when latency matters):** events flow **Kafka → Flink** and are processed the instant they arrive — fraud checks, live dashboards, real-time personalization. More powerful, but operationally harder; reach for it only when *seconds* genuinely matter.

Many real systems run **both** (a "Lambda"-style architecture): a fast streaming path for fresh-but-approximate numbers, plus a batch path that recomputes the exact source of truth.

**A worked example — one e-commerce order, from tap to dashboard.** A shopper taps **"Buy."** Watch the path that *single* order event takes: it immediately **forks into two lanes** — a real-time lane that answers in seconds, and a batch lane that rebuilds the exact source of truth on a schedule.

```
   1) TAP "Buy"
       │   the app emits an order event:
       │   { id: "ord_1001", user: 42, items: [...], total: 39.97, ts }
       ▼
   2) KAFKA  ·  topic "orders"   — one event, read independently by two consumers
       │
       ├──▶  REAL-TIME LANE   (answers in seconds)
       │        3) FLINK    fraud-check the card  +  count "sales this minute"
       │              ▼
       │        4) REDIS    serves the live counters
       │              ▼
       │        5) LIVE OPS DASHBOARD    fraud alerts + sales-right-now
       │
       └──▶  BATCH LANE   (the exact source of truth, rebuilt nightly)
                3) S3       the raw event is written as a Parquet file
                     ▼
                4) ICEBERG  ·  table  raw.orders   (DB-like table on object storage)
                     ▼      ← AIRFLOW triggers the nightly run
                5) dbt + SPARK    transform  raw.orders ──▶ analytics.daily_revenue
                     ▼
                6) SNOWFLAKE ──▶ BI DASHBOARD    revenue by day & region

   ─── observed throughout by  PROMETHEUS + GRAFANA   ·   infra built by  TERRAFORM ───
```

Reading the diagram:

- **Steps 1–2 (shared):** the tap emits an event, and **Kafka** stores it once in its log while two consumers read it independently — this decoupling is the whole reason to put a log in the middle.
- **Real-time lane (seconds):** **Flink** fraud-checks the card and counts sales-per-minute → **Redis** holds the live values → a **live ops dashboard** reacts within seconds.
- **Batch lane (nightly):** the same raw event lands in **S3** as Parquet → registered in an **Iceberg** table `raw.orders` → **Airflow** triggers **dbt + Spark** to build `analytics.daily_revenue` in **Snowflake** → an analyst's **BI dashboard** shows revenue by day and region.
- **Always-on:** **Prometheus + Grafana** watch the health of every box, on infrastructure that **Terraform** provisioned.

Notice how the *same* event feeds both an instant answer and the durable, exact history — and how every box in the generic diagram above now maps to a concrete tool doing a concrete job.

The rest of TIER 2 now walks these stages in order — starting with the **storage foundation** (the lakehouse), then the **engines** that process and serve it, then the cross-cutting layers that **orchestrate, provision, and observe** the whole thing.

</details>

---

### Apache Parquet — The Columnar File Format

![Infographic of the lakehouse stack as a 4-storey building: 1 Parquet files (column stripes with min/max, row groups ~128 MB, footer: schema + min/max), 2 Iceberg / Delta metadata (metadata file → snapshot → manifest list → manifests), 3 Snowflake / Databricks (storage and compute scale and bill separately), 4 dbt models linked by ref() arrows in a DAG; a row-vs-column inset (CSV reads every field vs Parquet reads only price + region; WHERE price > 100 skips row groups with max(price) ≤ 100; often 10–100× less I/O); snapshots v1 → v2 → v3 with time travel and copy-on-write vs merge-on-read; and a layer table (File / Table / Engine / Transform with what each gives and its trap).](diagrams/sd22_info_lakehouse_stack_ai.png)

<details>
<summary><strong>Read as text</strong> — columns, row groups and predicate pushdown</summary>

> **Simple Explanation:** A CSV stores a table **row by row**, so reading just the `price` column still drags across every other field on every line. Parquet stores it **column by column** — a query that wants only `price` and `region` reads *just those two stripes* and skips the rest. Each column compresses tightly (same-type values), and per-chunk "min/max" stats let a reader skip whole blocks without opening them.

> **Official Definition:** Apache Parquet is an open-source, **columnar** storage file format optimized for analytical (OLAP) workloads. It stores data column-by-column within row groups, applies per-column encoding and compression, and embeds metadata (schema + per-column statistics) that engines use for **column pruning** and **predicate pushdown** — reading only the columns and row groups a query needs.

```
   ROW format (CSV/JSON)              COLUMNAR format (Parquet)
   id │ region │ price │ ...          id      │ region  │ price
    1 │  eu    │  9.90 │ ...          1,2,3.. │ eu,us.. │ 9.90 ..
    2 │  us    │ 12.00 │ ...          read "price" → touch ONE stripe,
   read "price" → scans every          skip the rest + per-column
   field of every row off disk         compression + min/max skipping
```

- **Use it when:** Storing data for analytics, ML training, or batch processing in a lake/lakehouse — it is the default file format under Iceberg, Delta, Spark, Snowflake, BigQuery, DuckDB, and pandas/Polars. Ideal when queries read a few columns out of many or filter on a sortable key.
- **Avoid when:** You need row-by-row **OLTP** writes or single-record lookups (use Postgres) — Parquet files are **immutable**, written once and never updated in place. Also poor for tiny datasets, per-event streaming sinks (the *small-files problem*), or human-readable interchange (it is binary).
- **Senior gotcha:** Parquet is a **file** format, not a **table** format. A directory of Parquet files has no transactions or atomic updates — that is the gap Iceberg/Delta (below) fill by adding metadata on top of Parquet.

**Going deeper — layout & tuning:**

- A file splits into **row groups** (horizontal slices, ~128 MB); each holds one **column chunk** per column, made of encoded+compressed **pages**. A **footer** (read first) stores the schema, offsets, and per-chunk **min/max** stats.
- **Predicate pushdown:** `WHERE price > 100` skips any row group whose `max(price) ≤ 100` without decoding it — sorting data on filter columns makes this far more effective.
- **Encodings** (per column, before compression): **dictionary** (low-cardinality strings), **run-length + bit-packing**, **delta** (sorted ints/timestamps). **Codecs:** `snappy` (fast default), `zstd` (best ratio/speed), `gzip` (smallest).
- **Tuning:** large row groups compress and scan better but use more memory; many tiny files wreck performance — compact them. Parquet also stores typed, **nested** schemas (structs/lists/maps).
- **Cousins:** **ORC** (similar columnar, Hive world); **Avro** (*row*-oriented — great for Kafka messages, poor for column scans); **Arrow** (the *in-memory* columnar standard, Parquet's on-disk counterpart). Rule of thumb: **Avro to move records, Parquet to store/scan them, Arrow to process them in memory.**

**At a glance:** **Pros** — scans only the columns/row groups a query needs (often **10–100× less I/O** than CSV/JSON), excellent compression, open and read by every analytics engine, self-describing. **Cons / limits** — binary, immutable (updates rewrite files), full-row reads slower than a row store, and on its own no transactions or row-level update/delete (needs a table format). **Anti-patterns** — operational/transactional storage, sub-ms single-record serving, append-per-event sinks without compaction.

</details>

---

### Apache Iceberg & Delta Lake — Open Table Formats

<details>
<summary><strong>Read as text</strong> — snapshots, atomic metadata, catalogs and updates</summary>

> **Simple Explanation:** Raw files in S3 are like a pile of loose pages. A **table format** is the binder, index, and table-of-contents that turns that pile into a real, queryable table — with the ability to update rows, undo mistakes, and have many engines read it safely at once.

> **Official Definition:** Open table formats (Apache **Iceberg**, **Delta Lake**, Apache Hudi) add a metadata layer over Parquet files in object storage, providing ACID transactions, schema evolution, "time travel" (querying past versions), and engine-agnostic access — the core of the **lakehouse**.

- **Why they matter:** They give cheap object storage the powers of a database (transactions, updates, rollback) **without locking you into one vendor**. Iceberg is the fastest-rising and now supported by Snowflake, Databricks, AWS, GCP, and every major query engine.
- **Time travel** lets you query "the table as it looked yesterday" — invaluable for debugging and reproducibility.
- **The table-format war is largely settled — Iceberg became the cross-vendor default** (circa 2025–2026). Its neutrality (no single vendor controls the spec), multi-engine support (Spark, Flink, Trino, DuckDB, Snowflake, BigQuery all read it natively), and REST catalog standardization beat out Delta Lake's historically Databricks-centric governance — Databricks itself bought Tabular (the company founded by Iceberg's creators) in 2024 and now supports Iceberg too. Delta Lake still thrives within the Databricks ecosystem but is no longer the cross-vendor default.
- **Senior gotcha:** Choosing a table format is a long-term, hard-to-reverse decision. Default to Iceberg for new lakehouses unless the team is all-in on Databricks.

**Going deeper — how a "table" lives on top of plain files:**

```
   METADATA (the magic)                              DATA (plain files)
   ┌───────────────────────┐
   │ table metadata file   │  schema · partition spec · list of snapshots
   └───────────┬───────────┘
               ▼  current snapshot (= one version of the table)
        manifest list ──▶ manifests (file paths + min/max stats) ──▶ Parquet data files

   A query reads metadata first → knows EXACTLY which files to open (file skipping).
```

- **Snapshots** are the unit of "version." Every write creates a new snapshot, which is why **time travel** and **rollback** work (`... VERSION AS OF 12` / restore a previous snapshot).
- **ACID via atomic metadata swap:** a commit succeeds only when the new metadata pointer is swapped in atomically — so concurrent readers always see a consistent table, never half-written data.
- **Hidden partitioning (Iceberg's edge):** you partition by `day(timestamp)` once, and queries filtering on the timestamp get pruned automatically — no brittle `WHERE dt='...'` strings, and you can change the partition scheme without rewriting data.
- **Schema evolution:** add/rename/drop columns safely by ID (old data still reads correctly).
- **Copy-on-write vs. merge-on-read:** two strategies for handling row-level updates/deletes. **Copy-on-write (CoW)**: on each update, rewrite the entire data file — reads are fast (no merging needed), but writes amplify. **Merge-on-read (MoR)**: write a small delete/change file alongside the original; merge at read time — writes are fast and cheap, reads do more work. Iceberg supports both; choose CoW for read-heavy tables, MoR for frequent small updates (CDC/GDPR).
- **Catalog options (how other engines find your tables):** REST catalog (Iceberg's standard wire protocol — engine-agnostic), **Apache Polaris** (a vendor-neutral REST catalog implementation that became an Apache Software Foundation top-level project in Feb 2026 — now the preferred open catalog), **AWS Glue** (AWS-native), **Nessie** (git-like branching for tables). The trend is REST catalog + Polaris as the default for multi-engine shops.
- **DuckLake (2025):** from the DuckDB team — a separate, simpler lakehouse table format (not Iceberg) that keeps all table metadata (snapshots, file lists, stats) in an ordinary SQL database (Postgres, MySQL, SQLite or DuckDB) instead of metadata files in S3; the data stays as Parquet. Attractive for smaller teams that already run Postgres, but its ecosystem is far younger than Iceberg's.
- **The small-files problem & MERGE:** streaming writes create many tiny files that slow reads → run periodic **compaction**. Row-level `MERGE`/`UPDATE`/`DELETE` (for GDPR deletes, CDC upserts) is the big thing plain Parquet *can't* do but table formats can.

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Adds database-grade ACID transactions, time travel, and schema evolution to cheap object storage; engine-agnostic (Iceberg reads natively from Spark, Flink, Trino, DuckDB, Snowflake, BigQuery); hidden partitioning eliminates partition-column maintenance; atomic metadata swap prevents readers from seeing partial writes.
- **Cons:** Streaming writes create a small-files problem that requires periodic compaction jobs; metadata layer adds overhead for simple, infrequent-write workloads; hard-to-reverse architectural choice once embedded in a data platform.
- **Limitations:** Not designed for transactional row-by-row OLTP serving — high concurrent-write conflicts degrade throughput; point-lookup latency (single-row reads) is far higher than a row-store database; compaction must be scheduled externally (no auto-compaction built into the spec).
- **Unsupported / anti-patterns:** Replacing an OLTP database for transactional serving; sub-second single-record reads; high-frequency individual row updates at OLTP rates; use cases where a simple partitioned Parquet directory without metadata overhead suffices.

</details>

---

### Snowflake & Databricks — Cloud Warehouses & Lakehouses

<details>
<summary><strong>Read as text</strong> — separate storage and compute, and the idle-credit trap</summary>

**Rentable analytics super-computers** where storage and compute scale (and bill) **separately** — you load data, fire huge analytical/BI queries, and pay only for the compute you use. *Snowflake* leads for SQL/BI teams; *Databricks* (Spark + Delta Lake + MLflow) leads for data engineering and ML — pick one ecosystem and go deep. Use them for large-scale analytics and dashboards without running infrastructure; reach for Postgres/Redis instead for small data or low-latency OLTP serving. **Senior gotcha:** idle or oversized warehouses silently burn credits — cost control is the real skill.

</details>

---

### dbt — Transforming Data with Just SQL

<details>
<summary><strong>Read as text</strong> — SQL models, ref() and the DAG</summary>

**dbt brings software engineering to SQL.** You write `SELECT` models that reference each other with `ref()`; dbt works out the run order (a **DAG** — directed acyclic graph: a dependency graph with no loops), builds them **inside the warehouse**, and tests and documents every step — the **T** in **ELT** (Extract → Load raw data → Transform it inside the warehouse). It is the de facto transformation standard, always paired with a warehouse (Snowflake/BigQuery/Databricks). **Senior gotcha:** dbt only *transforms* data already loaded — it does not ingest it (that is Fivetran/Airbyte) and does not schedule itself at scale (that is Airflow/Dagster).

</details>

---

### Apache Flink — True Real-Time Streaming

![Infographic on Apache Flink: events arriving out of order on an arrival axis (10:01, 10:03, a late 10:02, 10:04, 10:06, 10:05) with a watermark line that closes the window; tumbling (every 1 min, no overlap), sliding (last 5 min, every 1 min) and session (bursts split by gaps) windows; Kafka (transport) → Flink operator keyBy(user) with state per key → action / alert; checkpoints to durable storage with restore + replay = exactly-once; the example 'count logins per user per 1-minute event-time window'; and a Spark Structured Streaming vs Flink comparison table (micro-batches vs event at a time, sub-second to seconds vs milliseconds).](diagrams/sd22_info_flink_ai.png)

<details>
<summary><strong>Read as text</strong> — windows, watermarks, state and checkpoints</summary>

> **Simple Explanation:** If Spark is a team that processes data in **batches** (every few seconds/minutes), Flink processes **each event the instant it arrives**. For fraud detection or live dashboards where milliseconds matter, Flink reacts event-by-event and remembers context ("this card was used in 3 countries in 5 minutes").

> **Official Definition:** Apache Flink is a distributed **stream-processing** engine for stateful computations over unbounded data streams, offering true event-at-a-time processing, event-time semantics, exactly-once guarantees, and low-latency stateful operations.

```
   Kafka (transport) ──▶ Flink (process each event in real time) ──▶ action/alert
                              ▲ keeps "state" per key (windows, counts, sessions)
```

- **Use it when:** Real-time fraud detection, live metrics, anomaly detection, instant personalization — anywhere sub-second latency and per-key state matter.
- **Avoid when:** Periodic batch jobs are good enough — Spark or a scheduled SQL job is simpler. Streaming is operationally harder than batch; don't pay that cost without a real latency requirement.
- **Senior gotcha:** Kafka + Flink is the canonical modern streaming pair: Kafka moves the events, Flink computes on them.

**Going deeper — the four ideas that make streaming hard (and how Flink solves them):**

- **Windows** — you can't "sum forever" on an endless stream, so you bucket events into windows: **tumbling** (fixed, non-overlapping: every 1 min), **sliding** (overlapping: last 5 min, updated every 1 min), and **session** (group bursts of activity with gaps between them).
- **Event time vs. processing time + watermarks** — events arrive late and out of order (mobile networks!). Flink uses the **event's own timestamp** and a **watermark** ("I've probably seen all events up to time T") to decide when a window is complete. This is the single biggest reason Flink beats naive streaming.
- **State** — Flink remembers things per key (running counts, last-seen value, session data) in an embedded **state backend** (often RocksDB on local disk for large state).
- **Checkpoints → exactly-once** — Flink periodically snapshots all state to durable storage; on failure it restores from the last checkpoint and replays, achieving **exactly-once** results without double-counting.

```
"Count logins per user per 1-minute window, using each event's real timestamp":
  stream.keyBy(user)
        .window(Tumbling 1 minute, on EVENT time)
        .aggregate(count)   →  emits when the watermark passes the window end
```

- **Easier entry point:** **Flink SQL** lets you express much of this in SQL instead of Java/Scala. Managed options: Confluent Flink, AWS Managed Service for Apache Flink, Ververica.
- **2026 status:** **Flink 2.0** (March 2025, the first major release in nine years) added **disaggregated state** — state can live in object storage (the ForSt backend) instead of only on local disk, making rescaling and recovery of terabyte-scale state much faster — and removed old deprecated APIs (e.g., the DataSet batch API).

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** True event-at-a-time processing with event-time semantics and watermarks; exactly-once guarantees via checkpointing; rich stateful operations per key (windows, sessions, running aggregates); Kafka+Flink is the canonical modern streaming architecture.
- **Cons:** Significant operational complexity — cluster management, state backend tuning (RocksDB), checkpoint configuration, and debugging are all harder than batch; steeper learning curve than Spark Structured Streaming.
- **Limitations:** Large stateful computations need state-backend tuning (RocksDB on local SSD, or Flink 2.0's remote ForSt state) — badly sized state degrades performance; debugging distributed streaming failures is substantially harder than batch; managed options (Confluent Flink, AWS Managed Service for Apache Flink) reduce but don't eliminate ops burden.
- **Unsupported / anti-patterns:** Batch jobs with no latency requirement — Spark or scheduled SQL is simpler and cheaper; use cases where Spark Structured Streaming's seconds-level latency is already sufficient; teams without streaming expertise should not pay Flink's operational cost without a confirmed sub-second requirement.

</details>

---

### Ray — Distributed Python for ML

![Infographic on Ray, distributed Python for ML: a laptop with '@ray.remote def train_fold(...)' sending ray.get([train_fold.remote(i, config) for i in range(8)]) to 8 parallel workers (fold 0 … fold 7) whose outputs merge into one list of 8 results; a layered stack of Ray Core (tasks + actors) with Train, Tune, Serve and Data on top, plus PyTorch Foundation (Oct 2025) and KubeRay on Kubernetes badges; and a library table (Train: PyTorch, XGBoost, Hugging Face; Tune: thousands of trials, Optuna / HyperOpt; Serve: request batching, LLM serving with vLLM; Data: reads Parquet, Arrow).](diagrams/sd22_info_ray_ai.png)

<details>
<summary><strong>Read as text</strong> — tasks, actors and the Ray AI libraries</summary>

> **Simple Explanation:** Ray lets you take an ordinary Python function or class and say "run this on *some* machine in the cluster." Add one decorator, and the 8 model-training runs you would have run one after another on your laptop run side by side on 8 machines — with Ray handling where each runs and collecting the results for you.

> **Official Definition:** Ray is an open-source distributed computing framework for Python that scales ML workloads — training, hyperparameter tuning, inference, and data processing — from a laptop to a multi-node cluster using a unified API.

**How it works:** Ray provides two primitives: **remote functions** (tasks — stateless, parallelized automatically) and **actors** (stateful objects running on a remote process). On top of these primitives, the Ray AI Libraries add:

```
   Ray Core (tasks + actors)
     ├── Ray Train    — distributed training (PyTorch, XGBoost, Hugging Face)
     ├── Ray Tune     — hyperparameter search (integrates with Optuna, HyperOpt)
     ├── Ray Serve    — scalable model serving with request batching
     └── Ray Data     — distributed data preprocessing (reads Parquet, Arrow)
```

**When to use:**
- Scaling a Python ML pipeline beyond one machine without Spark's JVM overhead
- Parallel hyperparameter search (Ray Tune runs thousands of trials across a cluster)
- Model inference serving that needs auto-scaling and batching
- LLM serving pipelines (Ray Serve's LLM APIs wrap vLLM, and vLLM can use Ray to spread one model across several machines)

**When not to use:** General-purpose big data ETL (Spark is more mature); simple batch jobs a single machine handles; non-Python stacks.

**2026 status:** Ray is the distributed compute layer in many modern LLM stacks. In Oct 2025 it moved to the vendor-neutral **PyTorch Foundation** (Linux Foundation), next to PyTorch and vLLM; Anyscale (Ray's original developer) still sells managed Ray clusters. MLflow integrates with Ray Train/Tune for experiment tracking, and Ray is increasingly run on Kubernetes (the KubeRay operator deploys Ray clusters on K8s).

```python
import ray
ray.init()

@ray.remote
def train_fold(fold_id, config):
    # runs on a separate worker process / node
    return train_model(fold_id, config)

# launch 8 training jobs in parallel across the cluster
results = ray.get([train_fold.remote(i, config) for i in range(8)])
```

**Interview soundbite:** "For distributed Python ML — parallel training, hyperparameter search, or LLM inference — Ray is the standard choice. It's the distributed layer under many modern LLM serving stacks."

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Unified distributed Python API that scales seamlessly from a laptop to a multi-node cluster; Ray AI Libraries cover the full ML lifecycle (training, tuning, serving, data); Python-native without JVM overhead; a widely used distributed layer for LLM inference (Ray Serve + vLLM).
- **Cons:** Python-centric — non-Python workloads are not a first-class use case; cluster operations and debugging distributed Ray programs is complex; object-store memory pressure can cause difficult-to-diagnose failures.
- **Limitations:** Primarily Python — not suited for JVM or Go-heavy compute workloads; Ray's distributed object store can exhaust memory under heavy in-flight data; cluster observability and debugging is substantially harder than single-machine debugging.
- **Unsupported / anti-patterns:** General-purpose big data ETL where Spark's maturity and fault tolerance are preferred; simple batch jobs that a single machine handles fine (overkill adds latency and complexity); non-Python stacks; use cases where Kubernetes + simple multiprocessing is sufficient.

</details>

---

### Airflow / Dagster / Prefect — Orchestration

![Infographic of the ops layer in three panels: Orchestrate (Airflow / Dagster / Prefect running a five-task DAG with retry + backoff, backfill and alerts, every task idempotent), Provision (Terraform / OpenTofu: main.tf → terraform plan '+2 create ~1 change -0 destroy' → review like a PR → terraform apply, with remote state + lock on S3) and Observe (Prometheus pulling /metrics every 15–30 s → Grafana p95 latency dashboard and Alertmanager → Slack / PagerDuty, plus App → OTLP → OTel Collector → Prometheus / Tempo / Loki; RED for services, USE for resources), a layer/tool/core-loop/trap table, and the trap of console drift and alert fatigue.](diagrams/sd22_info_ops_layer_ai.png)

<details>
<summary><strong>Read as text</strong> — DAGs, retries and idempotent tasks</summary>

**The conductor of the data orchestra.** An orchestrator schedules a pipeline's many steps, runs them in dependency order (a **DAG**), **retries** failures with backoff, and alerts you when something breaks — everything cron cannot do safely. Use it for multi-step, scheduled batch pipelines. *Airflow* has the largest ecosystem and job-market footprint; *Dagster* and *Prefect* are modern, more data-aware, and easier to test locally. **Golden rule:** make every task **idempotent** so retries and backfills are always safe.

</details>

---

### Terraform — Infrastructure as Code

<details>
<summary><strong>Read as text</strong> — plan, apply, remote state and drift</summary>

> **Simple Explanation:** Instead of clicking around a cloud console to create servers, databases, and networks (and forgetting what you did), you **write it down as code**. Terraform reads that code and builds the exact infrastructure — repeatably, reviewable in pull requests, and identical across dev/staging/prod.

> **Official Definition:** Terraform is an open-source Infrastructure-as-Code (IaC) tool that provisions and manages cloud resources declaratively. You describe the desired end-state; Terraform computes and applies the changes to reach it.

- **Use it when:** Managing any non-trivial cloud infrastructure. IaC is the standard for reproducible, auditable environments.
- **Senior gotcha:** **State management** is the classic footgun — Terraform tracks reality in a "state file" that must be stored remotely and locked, or teammates will clobber each other's changes. (Note licensing: Terraform moved to the source-available BSL in 2023 and HashiCorp is now part of IBM; **OpenTofu** is the open-source fork under the Linux Foundation.)

**Going deeper — the workflow and building blocks:**

| Concept | Meaning |
|---|---|
| **Provider** | A plugin for a platform (AWS, GCP, Azure, Cloudflare, …). |
| **Resource** | One thing to create (a VM, bucket, database). |
| **Variable / Output** | Inputs to and results from your config. |
| **Module** | A reusable package of resources (e.g., a standard "VPC" you call repeatedly). |
| **State** | Terraform's record of what it has built, mapping config → real resources. |

**The core loop:** `terraform plan` shows a **diff** ("will create 2, change 1, destroy 0") *before* anything happens → you review it like a PR → `terraform apply` makes reality match the code. Because it's **declarative**, you describe the desired end-state and Terraform figures out the steps.

```hcl
resource "aws_s3_bucket" "data" {
  bucket = "my-company-data-lake"
}
resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id           # references the bucket above
  versioning_configuration { status = "Enabled" }
}
```

- **Remote state + locking:** store state in S3/GCS with a lock so two engineers can't apply simultaneously and corrupt it — on S3 use the native lock file (`use_lockfile = true`, GA in Terraform 1.11; the older DynamoDB lock table is deprecated). **Never** edit infrastructure by hand after Terraform owns it (causes "drift").
- **Mental contrast:** declarative IaC (Terraform — *what*) vs. imperative config tools (Ansible — *how/steps*). For provisioning cloud resources, declarative wins.

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Declarative, version-controlled infrastructure that is reviewable, reproducible across environments, and self-documenting; provider ecosystem covers every major cloud and SaaS; `terraform plan` gives a safe diff before any change is applied.
- **Cons:** State-file management is the classic operational footgun — corrupted or out-of-sync state causes dangerous plan/apply behavior; drift from manual console changes breaks the model; slow on very large state files (thousands of resources).
- **Limitations:** The state file must be stored remotely with locking (S3 with its native lock file, GCS, or HCP Terraform — formerly Terraform Cloud) — local-only state is unsafe for teams; Terraform does not manage data or application-layer config inside resources, only the resources themselves; BSL license (1.6+) prompted the OpenTofu fork for strict open-source environments.
- **Unsupported / anti-patterns:** Imperative step-by-step server configuration within a host (use Ansible/Chef); managing data or records inside a database or S3 bucket (Terraform manages the resource, not its contents); rapid iterative changes to live production resources without careful plan review.

</details>

---

### Prometheus + Grafana — Observability

<details>
<summary><strong>Read as text</strong> — pull scraping, PromQL, alerting and OpenTelemetry</summary>

> **Simple Explanation:** **Prometheus** is the system that constantly takes your application's vital signs (requests/sec, error rate, latency, memory). **Grafana** is the screen of dashboards and alarms that displays those vitals and pages you at 3 a.m. when something is wrong. You cannot operate a serious system blind.

> **Official Definition:** *Prometheus* is a time-series database and monitoring system that scrapes and stores numeric metrics and evaluates alerting rules. *Grafana* is a visualization and dashboarding tool that renders those metrics and manages alerts. Together they are the open-source observability standard.

- **The three pillars of observability:** **Metrics** (Prometheus — numbers over time), **Logs** (e.g., ELK/Loki — text records of events), and **Traces** (e.g., Jaeger/OpenTelemetry — following one request across services).
- **Use it when:** Always, for any production system. "If you can't measure it, you can't operate it."
- **Senior gotcha:** Alert on **symptoms users feel** (latency, error rate — the "golden signals"), not on every internal metric, or you'll drown in noise and ignore real pages (alert fatigue).

**Going deeper — how it actually works:**

- **Pull model:** Prometheus *scrapes* an HTTP `/metrics` endpoint on each service on a fixed interval (commonly 15–30 s; the built-in default is 1 min). Apps expose metrics via client libraries; infrastructure exposes them via **exporters** (node_exporter for machines, etc.).
- **Four metric types:** **Counter** (only goes up — total requests), **Gauge** (up/down — memory in use), **Histogram** (bucketed distribution — request latencies), **Summary** (client-side quantiles).
- **PromQL** is the query language. The key skill is computing rates and percentiles:

```promql
# requests per second over the last 5 minutes, per endpoint
rate(http_requests_total[5m])

# 95th-percentile latency from a histogram
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

- **Alerting:** Prometheus evaluates alert rules and fires to **Alertmanager**, which deduplicates, groups, and routes to Slack/PagerDuty/email.
- **Two famous frameworks for *what* to measure:** **RED** (Rate, Errors, Duration — for request-driven services) and **USE** (Utilization, Saturation, Errors — for resources like CPU/disk). Pair Prometheus (metrics) with **Loki** (logs) and **Tempo/Jaeger** (traces) for full observability.

**OpenTelemetry (OTel) — graduated as CNCF standard (2026):**

OpenTelemetry is now the **de facto vendor-neutral standard** for instrumenting applications to emit traces, metrics, and logs. It provides a unified SDK (all major languages), the **OTel Collector** (a sidecar/daemon that receives, processes, and exports telemetry to any backend — Prometheus, Jaeger, Datadog, Honeycomb, etc.), and a standardized wire format (OTLP). In May 2026 OTel became a **CNCF graduated** project (the foundation's top maturity level), with stable traces, metrics, and logs; Prometheus 3.0 (Nov 2024) can also ingest OTLP directly. The practical result: instrument once, send to any backend; switch backends without re-instrumenting.

```
   App  ──(OTLP)──▶  OTel Collector  ──▶  Prometheus (metrics)
                                      ──▶  Jaeger / Tempo (traces)
                                      ──▶  Loki / Elasticsearch (logs)
```

**Long-term metric storage:** Prometheus's local TSDB is not designed for years of data. Common solutions:
- **Thanos** — multi-cluster Prometheus federation with object-storage (S3) backend; uses the Prometheus query API.
- **Grafana Mimir** — horizontally scalable, Prometheus-compatible, purpose-built for long-term storage.
- **VictoriaMetrics** — high-performance, low-resource alternative to Prometheus + Thanos; single binary for smaller setups.

**Cardinality pitfall:** a label with many unique values (e.g., `user_id`, `request_id`) creates a separate time-series per unique value, exploding storage and query time. Rule: labels should have bounded cardinality (status codes, endpoints, regions — yes; user IDs — never).

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Pull-based scraping model is simple and reliable; PromQL is expressive for rate/percentile calculations; large ecosystem of pre-built exporters; OTel Collector enables vendor-neutral instrumentation; Grafana dashboards are the industry standard.
- **Cons:** Single-node by default — Prometheus local TSDB is not horizontally scalable (requires Thanos/Mimir/VictoriaMetrics for HA and long-term retention); high-cardinality labels blow up in-memory storage and query performance; short-lived jobs need Pushgateway workaround.
- **Limitations:** Prometheus stores metrics only — no native log or trace storage; local TSDB default retention is 15 days and not designed for multi-year time ranges without external storage backends; cardinality explosions from high-cardinality labels can OOM the process.
- **Unsupported / anti-patterns:** High-cardinality event-level or log storage (use Loki/Elasticsearch); long-term retention out of the box without Thanos or Mimir; structured log querying or distributed tracing (those require separate systems even in a full OTel stack).

</details>

---

## 22.5 TIER 3 — Situational Tools (Know *When*, Not Necessarily *How*)

### Cassandra / ScyllaDB — Write-Heavy, Always-On

![Comparison infographic of Cassandra / ScyllaDB versus Elasticsearch / OpenSearch: a leaderless ring of 6 nodes where any node takes writes, the LSM write path (write → commit log + memtable → flush → SSTable-1 → SSTable-2 → compaction → fewer SSTables), the read path with Bloom filters and a ONE / QUORUM / ALL consistency dial; versus a document 'Running wireless headphones' passing through an analyzer (lowercase, stop-words, stem running → run) into an inverted index (headphones → doc 3, doc 9), BM25-ranked results and shards with replicas; plus an 'If you need → use' table and common mix-ups (LSM vs B-tree, partition vs clustering key, fixed primary shard count).](diagrams/sd22_info_cassandra_elasticsearch_ai.png)

<details>
<summary><strong>Read as text</strong> — partition keys, tunable consistency and LSM-trees</summary>

> **Simple Explanation:** Cassandra is built for systems that must **never go down** and absorb **massive write volume** — think IoT sensor data, message history, or activity feeds. It spreads data across many equal nodes with no single leader, so any node can take writes and the loss of a few doesn't bring the system down.

> **Official Definition:** Apache Cassandra is a distributed, wide-column NoSQL database optimized for high write throughput and high availability via a masterless, peer-to-peer architecture with tunable consistency. ScyllaDB is a C++ rewrite of Cassandra with the same model and higher performance.

- **Use it when:** Enormous write volume, multi-region high availability, time-series/event data, and you can model queries up-front.
- **Avoid when:** You need flexible ad-hoc queries or joins (Cassandra makes you design tables *around* specific queries), or your scale doesn't justify the operational complexity — most apps are better served by Postgres.
- **Senior gotcha:** Cassandra trades consistency for availability (**AP** in the CAP theorem) and forces **query-first data modeling**. It's strategic but **niche** — cloud-native databases (Spanner, CockroachDB, DynamoDB) compete hard here.

**Going deeper — the model that trips people up:**

- **Primary key = partition key + clustering key.** The **partition key** decides *which node* holds the row (data is spread by hashing it); the **clustering key** decides the *sort order within* that partition. You design tables **around the exact query** you'll run — joins and ad-hoc filtering aren't supported the way they are in SQL.
- **Tunable consistency:** per query you choose how many replicas must respond — `ONE` (fast, weak) up to `QUORUM` (majority) or `ALL` (strong, slower). The classic trick: `QUORUM` reads **+** `QUORUM` writes = strong consistency on an otherwise-AP system.
- **Replication factor** = copies per data center; combined with consistency level, this is how you tune the availability/consistency dial.
- **Why writes are so fast — what an LSM-tree actually is:** A traditional SQL database uses a **B-tree**, which updates rows *in place* — every write hunts down the right spot on disk and overwrites it (slow random I/O). An **LSM-tree (Log-Structured Merge-tree)** never overwrites. A write just appends to a commit log and an in-memory sorted table (the **memtable**); when that fills up it's flushed *sequentially* to a new immutable file on disk called an **SSTable**. Sequential appends are dramatically faster than random in-place updates, which is why Cassandra (and RocksDB, LevelDB, ScyllaDB) sustain huge write throughput.

  ```
   WRITE PATH (fast — pure append)
     write → commit log (durability) + memtable (in-RAM, sorted)
            memtable full → flush → SSTable-1 (immutable) → SSTable-2 → ...

   READ PATH (must check several places)
     look in memtable, then newest SSTable → ... → oldest
     (a Bloom filter skips SSTables that can't hold the key)

   COMPACTION (background cleanup)
     merge many SSTables → fewer, drop overwritten rows + tombstones
  ```

  The trade-off is **read amplification** — a single key may live in several SSTables, so reads check more places (mitigated by Bloom filters and in-memory indexes) — plus periodic **compaction**, a background job that merges SSTables and discards superseded values and deleted-row **tombstones**. In short: **LSM = optimized for writes, B-tree = optimized for reads.**

```sql
-- Designed for ONE query: "get a user's messages, newest first"
CREATE TABLE messages (
  user_id uuid, sent_at timestamp, body text,
  PRIMARY KEY (user_id, sent_at)            -- partition by user, sort by time
) WITH CLUSTERING ORDER BY (sent_at DESC);
```

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Extremely high write throughput via LSM-tree storage; masterless peer-to-peer architecture means no single point of failure; tunable consistency per-query; multi-datacenter replication built-in; ScyllaDB C++ rewrite offers lower latency at high throughput vs. the JVM-based original.
- **Cons:** Query-first data modeling is a hard paradigm shift — tables are designed around specific access patterns; operational burden is significant; eventual consistency by default requires careful application design.
- **Limitations:** No joins or ad-hoc queries — data model must match access pattern exactly, and changing query patterns can require table rewrites; tombstones from deletes accumulate and degrade read/compaction performance; secondary indexes are weak and not recommended for high-cardinality filtering (Cassandra 5.0's Storage-Attached Indexes, 2024, help but don't make it a query engine); aggregations are limited and slow.
- **Unsupported / anti-patterns:** Ad-hoc analytical queries or flexible reporting; relational joins across tables; small-scale applications where the operational overhead is unjustified; use cases where strong consistency on every read is required (Postgres or distributed SQL is better suited).

</details>

---

### Elasticsearch / OpenSearch — Search & Log Analytics

<details>
<summary><strong>Read as text</strong> — the inverted index, analyzers, BM25 and shards</summary>

> **Simple Explanation:** When you need a real **search box** ("find products matching 'wireless noise-cancel headphones'", ranked by relevance, with typo tolerance and filters), a normal database is painfully slow. Elasticsearch is purpose-built to index text and return ranked results in milliseconds. It's also the go-to for searching mountains of logs.

> **Official Definition:** Elasticsearch (and its open fork OpenSearch) is a distributed search and analytics engine built on Apache Lucene, providing full-text search, relevance ranking, aggregations, and near-real-time indexing over large document sets.

- **Use it when:** Full-text/relevance search, log analytics (the "E" in the ELK stack), or fast aggregations over semi-structured data.
- **Avoid when:** It's your only datastore — it's a search index, not a system of record. Keep the source of truth in a real database and index *into* Elasticsearch.
- **Senior gotcha:** For modern **semantic/vector** search (AI embeddings), Elasticsearch now supports vectors, but dedicated vector DBs (pgvector, Pinecone, Milvus) or hybrid search are often considered (see Ch 28).

**Going deeper — why search is fast and how to think about it:**

- **The inverted index** is the core idea: instead of "doc → words," it stores "word → list of docs containing it." Searching "headphones" jumps straight to the list of matching documents — no scanning. (It's the same idea as the index at the back of a textbook.)
- **Analyzers** decide how text becomes searchable tokens: lowercase, remove stop-words, **stemming** ("running" → "run"), and synonyms. Get the analyzer wrong and relevance suffers — this is most of the tuning work.
- **Relevance ranking** uses **BM25** (a refined TF-IDF) so the most relevant docs sort to the top — not just "contains the word."
- **Sharding & replicas:** an index is split into **shards** (for scale) each with **replicas** (for HA + read throughput). Choosing the primary shard count up front matters (changing it later means `_split`/`_shrink` or a reindex); too many small shards hurt performance.

```json
// Query DSL: match the text, but only among in-stock products
{ "query": { "bool": {
    "must":   { "match": { "title": "wireless headphones" } },
    "filter": { "term":  { "in_stock": true } }
}}}
```

- **Aggregations** turn it into a fast analytics engine (facets, histograms over logs) — the "Kibana dashboard" experience in the ELK/Elastic stack.

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Best-in-class full-text search with BM25 relevance ranking, analyzers, and typo tolerance; fast aggregations over large document sets; near-real-time indexing; the "E" in the widely deployed ELK stack; OpenSearch is the Apache-2.0-licensed fork (now run by the Linux Foundation's OpenSearch Software Foundation), and Elasticsearch itself added an AGPLv3 option in 2024.
- **Cons:** Not a system of record — data can be lost (index corruption, accidental deletes) and re-indexing from a primary source is painful; JVM heap is hungry and must be sized carefully; the primary shard count is set at index creation — `_split` (to a multiple of the current count) or `_shrink` (to a factor of it) can change it on a read-only index; any other count needs a full reindex.
- **Limitations:** Primary shard count is fixed per index — under-sizing means a split or a costly reindex later (many teams use time-based indices or rollover instead); near-real-time indexing has a default refresh interval (~1 second) so freshly indexed documents are not instantly visible; JVM GC pauses can cause query latency spikes under memory pressure.
- **Unsupported / anti-patterns:** Primary transactional datastore — it is a search index, not a system of record; strong consistency guarantees; very frequent document updates (reindexing individual documents at high frequency is expensive); replacing a database for data you cannot afford to lose or rebuild.

</details>

---

### gRPC & GraphQL — Beyond REST APIs

![Comparison infographic of REST, gRPC and GraphQL: REST as the universal cacheable JSON default (weak spot over/under-fetching), gRPC with a .proto contract generating typed client and server over HTTP/2 and four call styles (unary, server-streaming, client-streaming, bidirectional; weak spot not browser-native), GraphQL with one endpoint and a query tree user(id: 42) → name, orders → total (weak spot HTTP caching); a worked N+1 example where naive resolvers make 101 round-trips for 100 orders and a DataLoader batches ids 1…100 into WHERE id IN (…) for 2 round-trips; an 'If you need → use' table and the trap of cargo-culting a new style.](diagrams/sd22_info_grpc_graphql_ai.png)

<details>
<summary><strong>Read as text</strong> — contracts, call styles and the N+1 trap</summary>

> **Simple Explanation:** REST is the familiar way services talk over HTTP. **gRPC** is a faster, stricter dialect for **service-to-service** calls (compact binary, strongly typed, great for microservices). **GraphQL** lets a **client ask for exactly the fields it wants** in one request, instead of calling five REST endpoints and over-fetching.

> **Official Definition:** *gRPC* is a high-performance RPC framework using Protocol Buffers (binary serialization) over HTTP/2, ideal for internal microservice communication. *GraphQL* is a query language for APIs that lets clients specify precisely the data they need from a single endpoint.

| | **REST** | **gRPC** | **GraphQL** |
|---|---|---|---|
| Best for | Public/simple APIs | Internal microservices | Flexible client data needs |
| Format | JSON / text | Protobuf / binary | JSON, client-shaped |
| Strength | Universal, cacheable | Fast, typed, streaming | No over/under-fetching |

- **Senior gotcha:** Don't cargo-cult. REST is still the right default for most public APIs. Reach for gRPC when internal latency/throughput matters; reach for GraphQL when many clients have divergent data needs (and accept its caching/complexity costs).

**Going deeper:**

**gRPC** — you define the API in a `.proto` **contract**; code for client and server is *generated* from it, so both sides are strongly typed and stay in sync. The binary Protobuf format + HTTP/2 makes it compact and fast, and it supports **4 call styles**: unary (request→response), server-streaming, client-streaming, and bidirectional streaming.

```protobuf
service UserService {
  rpc GetUser (GetUserRequest) returns (User);   // typed contract → generated code
}
message GetUserRequest { int32 id = 1; }
```

**GraphQL** — one endpoint, a typed **schema**, and the client asks for exactly the fields it wants. Each field is backed by a **resolver** function on the server.

```graphql
# Client gets exactly these fields in ONE request — no over-fetching
query { user(id: 42) { name, orders { total } } }
```

- **GraphQL's classic trap — the N+1 problem (worked example):** Take the query above, `user(id: 42) { name, orders { total } }`. The server runs **1** query to load the user, then the `orders` resolver fires — and if that user has 100 orders, a naive resolver runs **one query per order** to fetch each `total`. That's **1 + N = 101** database round-trips for a single request. Scale it to a list of 50 users each with orders and the query count explodes into the thousands — the page crawls and the database melts, even though the GraphQL query *looks* tiny.

  ```
   NAIVE (N+1):                          BATCHED (DataLoader):
     SELECT * FROM users WHERE id=42       SELECT * FROM users WHERE id=42
     SELECT total FROM orders WHERE id=1   ── collect ids: 1,2,3,...,100 ──
     SELECT total FROM orders WHERE id=2   SELECT total FROM orders
     ... 98 more queries ...                 WHERE id IN (1,2,...,100)
     = 101 round-trips                     = 2 round-trips
  ```

  **The fix — a DataLoader:** instead of querying immediately, each resolver *registers* the id it needs. The DataLoader waits one tick of the event loop, **collects all the ids**, and fires a single batched query (`WHERE id IN (...)`), then hands each resolver its slice back. It also **caches** within the request so the same id is never fetched twice. Result: 101 queries collapse to 2. The interview soundbite: *"GraphQL's flexibility pushes the N+1 problem onto the server, so you batch with a DataLoader per request."*
- **Rule of thumb:** REST for public/cacheable APIs; **gRPC** for fast internal service-to-service; **GraphQL** when diverse front-ends need flexible, tailored data.

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** gRPC — compact binary Protobuf + HTTP/2 gives lower latency and higher throughput than JSON/REST for internal services; strongly typed contract enforced at compile time; built-in bidirectional streaming. GraphQL — single endpoint eliminates over/under-fetching; self-documenting schema; ideal for diverse multi-client APIs.
- **Cons:** gRPC — binary format is not human-readable (harder to debug without tooling); not natively browser-compatible (requires grpc-web or a proxy). GraphQL — HTTP caching is hard (most requests are POST); N+1 query problem requires DataLoader discipline; query cost/complexity security is an additional concern.
- **Limitations:** gRPC: not natively supported in browsers without grpc-web/proxy; no built-in HTTP caching layer (proxies can't cache binary frames); Protobuf schema evolution requires careful field numbering discipline. GraphQL: every field resolver can trigger database queries — without DataLoader batching, deep queries generate explosive backend load.
- **Unsupported / anti-patterns:** gRPC for public browser-facing APIs where simplicity and broad tool compatibility matter (REST is better); GraphQL when straightforward cacheable REST endpoints already suffice and the flexibility overhead adds complexity without benefit; neither replaces a pub/sub or streaming system for event-driven architectures.

</details>

---

### Vector Databases — AI Similarity Search

![Comparison infographic of the two 'outgrew Postgres' moves: vector databases (embedding scatter with a query vector and its top-K nearest neighbours by cosine, text / image → embedding model → ANN index (HNSW, IVF) → top-K, hybrid search ANN + BM25 + filters → RRF merge → re-rank, exact search O(N×d), 1536-dim ~4× a 384-dim model; pgvector, Qdrant, Pinecone, Milvus, Weaviate, Chroma) versus distributed SQL (a single-primary write bottleneck vs nodes holding ranges that vote via Raft / Paxos, TrueTime ± uncertainty (1–7 ms) → commit wait → external consistency, ~1–5 ms per commit in-region; CockroachDB, YugabyteDB, TiDB, Spanner, Aurora DSQL), a 'Start with → Graduate to' table (pgvector → Qdrant / Milvus at ~10M vectors; Postgres + replicas + PgBouncer → CockroachDB / YugabyteDB / Spanner when one primary's writes max out) and the trap of adopting either too early.](diagrams/sd22_info_vector_distributed_sql_ai.png)

<details>
<summary><strong>Read as text</strong> — embeddings, ANN indexes and which store to pick</summary>

> **Simple Explanation:** An embedding model turns a sentence or image into a list of numbers (a **vector**) so that things with similar *meaning* get nearby vectors. A vector database is a store that, given a new vector, quickly finds the stored ones closest to it — "find documents that *mean* the same thing," not just ones that share the same words.

> **Official Definition:** A vector database stores high-dimensional embedding vectors and provides Approximate Nearest Neighbor (ANN) search — retrieving the K most semantically similar vectors to a query vector in milliseconds, even over billions of embeddings.

This is the storage layer for **semantic search, RAG (Retrieval-Augmented Generation), recommendation systems, and image similarity**. See Chapter 28 (Semantic Search) for ANN index details (HNSW, IVF). This section covers the landscape.

**How ANN search works (brief):** Embeddings from a model (e.g., text-embedding-3-small) are stored as float vectors. Query = embed the input → find K closest stored vectors by cosine similarity or dot product. Exact search is O(N×d) — too slow at scale. ANN indexes (HNSW, IVF) trade tiny accuracy loss for orders-of-magnitude speed.

**The landscape in 2026:**

| System | Best for | Notes |
|---|---|---|
| **pgvector** | Already running Postgres; < ~10M vectors | HNSW + IVFFlat indexes, zero extra infra; where most teams start |
| **Qdrant** | High-performance OSS, Rust, on-prem or cloud | Strong filtering + ANN; excellent for self-hosted production |
| **Pinecone** | Serverless managed, team wants zero ops | Proprietary, expensive at scale, but easiest to start |
| **Milvus** | Billion-scale, cloud-native | LF AI & Data Foundation project, supports GPU-accelerated indexing |
| **Weaviate** | Hybrid search (vector + BM25) + GraphQL | Multi-modal, schema-first |
| **Chroma** | Local dev, prototyping | Simplest to embed in a Python app; less proven at large scale |

**Decision heuristic:**

```
   Already running Postgres?
     YES → start with pgvector. Migrate if you hit ~10M vectors or need
           advanced filtering at high QPS.
     NO  → Qdrant (self-hosted OSS) or Pinecone (managed, no infra).
   Billion+ vectors? → Milvus.
```

**Hybrid search** (vector similarity + keyword + filters) is the production pattern: run an ANN query and a BM25 keyword query side by side, apply metadata filters, merge the two ranked lists (e.g., Reciprocal Rank Fusion), and optionally re-rank the top results with a cross-encoder model. Most production RAG pipelines use pgvector or Qdrant for this.

**Interview soundbite:** "For RAG or semantic search, I'd start with pgvector if we're already on Postgres — it handles most AI workloads without adding infrastructure. I'd graduate to Qdrant or Milvus once we hit scale limits."

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Enables semantic/embedding-based similarity search at scale; most systems support hybrid search (ANN + metadata filters + BM25); pgvector requires zero additional infrastructure if Postgres is already running; dedicated systems (Qdrant, Milvus) offer GPU-accelerated indexing and billion-scale operation.
- **Cons:** ANN index build time and memory cost grow significantly with dataset size; heavy metadata filtering alongside ANN can degrade recall and increase latency; managed options (Pinecone) are expensive at scale.
- **Limitations:** ANN search is approximate by definition — recall is < 100% and decreases as filtering constraints tighten; index build + memory consumption grows with dimensionality (e.g., 1536-dim OpenAI embeddings are ~4× more expensive than 384-dim models); pgvector's HNSW index is single-node bounded by Postgres memory.
- **Unsupported / anti-patterns:** Exact relational or transactional queries — vector DBs are not a replacement for a general-purpose database; keyword/BM25 full-text search where semantic similarity is not needed (Elasticsearch is simpler and more accurate for pure keyword matching); storing structured relational data alongside vectors in a dedicated vector DB (use pgvector or a hybrid system instead).

</details>

---

### Distributed SQL / NewSQL — Horizontally-Scalable Strong Consistency

<details>
<summary><strong>Read as text</strong> — ranges, consensus, TrueTime and when to adopt</summary>

> **Simple Explanation:** Imagine Postgres, but instead of one machine taking every write, the tables are cut into many small ranges spread over many machines (even across continents), and each range keeps three or more copies that *vote* on every change. You still write normal SQL with transactions — the database hides the splitting and the voting from you.

> **Official Definition:** Distributed SQL (NewSQL) databases provide the full ACID guarantees and SQL interface of a relational database while scaling writes horizontally across shards and regions, using consensus protocols (Raft/Paxos) and automatic sharding to eliminate the single-primary bottleneck.

**When to use:** You've exhausted the Postgres scaling ladder — reads are covered by replicas, but write throughput saturates a single primary, OR you need multi-region active-active writes with strong consistency.

**When not to use:** Your scale doesn't justify the added latency (consensus adds ~1–5 ms per commit), operational complexity, and cost. Most teams should hit this wall after years of growth.

**The main players:**

| System | Compatibility | Consensus | Multi-region | Notes |
|---|---|---|---|---|
| **CockroachDB** | PostgreSQL wire | Raft | Yes (geo-partitioning) | Serializable isolation, cloud and self-hosted |
| **YugabyteDB** | PostgreSQL (YSQL) + Cassandra-style (YCQL) | Raft | Yes | Fully open-source, strong Postgres compatibility |
| **TiDB** | MySQL wire | Raft (TiKV) | Yes | HTAP (OLTP + analytics in one), China-origin, widely deployed |
| **Google Spanner** | GoogleSQL + PostgreSQL dialect | Paxos + TrueTime timestamps | Native, all regions | External consistency; proprietary; the gold standard for global |
| **Amazon Aurora DSQL** | PostgreSQL wire | Custom | Active-active (multi-region) | Serverless, auto-scaling, no instance management |

**Google Spanner's TrueTime** is the defining innovation: GPS receivers and atomic clocks in every Google datacenter give each server the current time *plus a bounded uncertainty* (a few ms; the 2012 paper reported 1–7 ms). Each commit is stamped with a TrueTime timestamp, and Spanner then **waits out the uncertainty** ("commit wait") before reporting success — so if transaction A finishes before B starts anywhere on Earth, A's timestamp is smaller. That is **external consistency**. Read-write transactions still take locks; the payoff is that read-only transactions and snapshot reads at a timestamp need **no locks** at all.

```
   Single-primary Postgres:                Distributed SQL (CockroachDB/Spanner):
   ┌──────────┐                            ┌─────┐ ┌─────┐ ┌─────┐
   │ Primary  │  ← all writes go here      │Node │ │Node │ │Node │  ← any node
   └──────────┘    single point of         └─────┘ └─────┘ └─────┘    accepts
        │          write bottleneck              Raft consensus          writes
   [replicas]                                  (slightly higher latency)
```

**Interview soundbite:** "I reach for distributed SQL when we've confirmed that a single Postgres primary is the write bottleneck and vertical scaling is maxed out, or when we need multi-region active-active. Before that, Postgres + PgBouncer + read replicas handles most systems."

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Full ACID + SQL with horizontal write scale and multi-region active-active — the capabilities Postgres cannot provide natively; automatic sharding eliminates manual partitioning; Spanner provides external consistency via TrueTime (atomic clocks); CockroachDB and YugabyteDB are Postgres-wire-compatible.
- **Cons:** Consensus protocol adds ~1–5 ms latency per commit (cross-region commits pay full round-trip latency); higher operational cost and complexity than single-node Postgres; not 100% feature-compatible with vanilla Postgres/MySQL (subtle query behavior differences).
- **Limitations:** Every commit requires consensus — cross-region transactions pay full network round-trip latency (tens to hundreds of ms); in Raft/Paxos a commit waits for the nearest *majority* of replicas, so the round-trip to that majority sets the latency floor; feature compatibility gaps with vanilla Postgres mean some extensions and query patterns require testing.
- **Unsupported / anti-patterns:** Premature adoption when a single Postgres primary with replicas and PgBouncer can still scale (adds unnecessary complexity and cost); ultra-low-latency single-node workloads where the consensus overhead is noticeable; workloads that do not require multi-region writes or horizontal write scale.

</details>

---

## 22.6 TIER 4 — Legacy: Hadoop

![Recap infographic from Hadoop to today: THEN (2010) data → HDFS (on-prem cluster) → MapReduce (disk at every step) versus NOW (2026) data → S3 + Iceberg/Delta → Spark / Flink / warehouse (Spark 10–100× faster); six Hadoop piece cards (HDFS 128 MB blocks replicated 3×, NameNode, MapReduce, YARN, Hive, HBase); an 11-step learning order from Docker + Kubernetes to Ray; a 'Pick by Question' table (PostgreSQL not Redis as source of truth, Redis / Valkey not a bigger DB box, Kafka, Spark, Flink, Elasticsearch / OpenSearch not LIKE '%...%'); a URL-shortener example (client → Redis serve → Postgres store, reads ~100:1, click events → Kafka → analytics) and five interview rules.](diagrams/sd22_info_hadoop_decision_map_ai.png)

<details>
<summary><strong>Read as text</strong> — HDFS, MapReduce and why it lost</summary>

> **Simple Explanation:** Hadoop was the **original** big-data system (mid-2000s): store huge files across many cheap machines (**HDFS**) and process them with **MapReduce**. It was revolutionary — and it is now largely **retired** for new projects, replaced by Spark + cloud object storage + lakehouse formats.

> **Official Definition:** Apache Hadoop is an older framework for distributed storage (**HDFS**) and batch processing (**MapReduce**), with an ecosystem including Hive (SQL-on-Hadoop), HBase, and YARN. It pioneered commodity-cluster big data but has been superseded by faster, cloud-native tools.

```
   THEN (2010):  data ──▶ HDFS (on-prem cluster) ──▶ MapReduce (disk-heavy, slow)
   NOW  (2026):  data ──▶ S3 (cloud) + Iceberg/Delta ──▶ Spark / Flink / warehouse
```

- **Why it declined:** MapReduce writes to disk at every step (slow); on-prem clusters are costly and inflexible vs. elastic cloud; Spark is 10–100× faster with a nicer API. New data platforms are built on cloud object storage, not HDFS; HDFS survives mainly in existing on-prem clusters.
- **Should you learn it?** Only enough to **maintain or migrate** legacy systems. Do **not** invest heavily for new skills — that time is far better spent on Spark, cloud storage, and lakehouse formats.
- **Interview note:** If asked, say clearly: "Hadoop pioneered big data, but new systems use Spark on cloud object storage with open table formats." That signals you're current.

**Going deeper — what the pieces were (so you recognize them in legacy systems):**

| Component | Role |
|---|---|
| **HDFS** | Distributed file system — splits big files into **blocks** (e.g., 128 MB), replicated 3× across machines. |
| **NameNode** | The master that tracks where every block lives (a single point of failure historically). **DataNodes** store the actual blocks. |
| **MapReduce** | The processing model: **Map** (process pieces in parallel) → **Shuffle** (group by key across the network) → **Reduce** (aggregate). |
| **YARN** | The cluster resource manager / scheduler. |
| **Hive** | SQL-on-Hadoop — compiles SQL into MapReduce/Tez jobs. |
| **HBase** | A NoSQL wide-column store on top of HDFS (the open-source Bigtable). |

**Why it lost:** MapReduce writes intermediate results to disk between *every* Map and Reduce stage — enormous I/O. Spark keeps them in memory (10–100× faster) with a far nicer API. And tying storage to compute on fixed on-prem clusters can't compete with the cloud's elastic "scale storage and compute independently" model. The concepts (blocks, replication, map/shuffle/reduce) still live on inside Spark and cloud systems — which is the real reason to understand them.

**At a glance — strengths, tradeoffs, and hard limits**
- **Pros:** Pioneered the commodity-cluster big-data model; HDFS replication provides fault tolerance across machines; MapReduce's simplicity made it easy to reason about; Hive brought SQL-like access to large datasets — all concepts that live on in modern tools.
- **Cons:** MapReduce writes to disk at every stage (10–100× slower than Spark's in-memory processing); on-prem clusters tie storage to compute (inflexible vs. elastic cloud); NameNode is a historical SPOF; high operational burden.
- **Limitations:** Disk-heavy MapReduce I/O is a hard architectural ceiling on performance — no configuration changes fix it; NameNode stores all filesystem metadata in memory (single machine memory ceiling on namespace size); on-prem cluster provisioning cannot match cloud elasticity for burst workloads.
- **Unsupported / anti-patterns:** Greenfield or new projects — use Spark + S3 + Iceberg instead; real-time or interactive workloads (MapReduce is batch-only, minimum latency is minutes); any scenario where the team does not already have legacy Hadoop infrastructure to maintain.

</details>

---

## 22.7 Decision Cheat-Sheet — "I need to ___, what do I reach for?"

<details>
<summary><strong>Read as text</strong> — the need → tool → not-this table</summary>

| I need to... | Reach for | Not |
|---|---|---|
| Store users, orders, payments safely | **PostgreSQL** | Redis as source of truth |
| Store flexible / nested JSON documents | **MongoDB** (or Atlas) | a rigid relational schema for fast-evolving data |
| Globally-distributed managed NoSQL on Azure | **Cosmos DB** | self-managing Mongo replication across regions |
| Make a slow read instant | **Redis / Valkey** (cache) | bigger DB box |
| Move events between services reliably | **Kafka** | direct service calls |
| Store huge files / datasets cheaply | **S3 / object storage** | a relational DB |
| Store analytics data for fast column scans | **Parquet** (columnar) | CSV / JSON |
| Crunch terabytes of data | **Spark** | pandas on one box |
| React to events in milliseconds | **Flink** | batch Spark |
| Run big analytical/BI queries | **Snowflake / Databricks** | Postgres at scale |
| Transform data in the warehouse | **dbt** | hand-rolled SQL scripts |
| Give a lake DB-like tables | **Iceberg / Delta** | raw Parquet alone |
| Schedule multi-step pipelines | **Airflow / Dagster** | cron + hope |
| Package an app to run anywhere | **Docker** | "works on my machine" |
| Deploy & scale containers | **Kubernetes** | manual servers |
| Provision cloud infra repeatably | **Terraform / OpenTofu** | console clicking |
| Monitor & alert on production | **Prometheus + Grafana + OTel** | log-grepping |
| Absorb massive writes, never go down | **Cassandra / ScyllaDB** | single Postgres |
| Power a search box / log search | **Elasticsearch / OpenSearch** | `LIKE '%...%'` |
| Scale Postgres writes across regions | **CockroachDB / Spanner / Aurora DSQL** | sharding Postgres manually |
| AI similarity / semantic search | **pgvector** (start), then Qdrant/Milvus | Elasticsearch alone for vector search |
| Distributed Python ML / LLM serving | **Ray** | rolling your own multiprocessing |

</details>

---

## 22.8 A Practical Learning Order

<details>
<summary><strong>Read as text</strong> — the 11-step path and depth over breadth</summary>

You do not learn these all at once. A sensible path for a senior engineer:

```
   1. Docker + Kubernetes      ← everything runs here
   2. PostgreSQL (deeply)      ← the default datastore
      └ MongoDB / Cosmos DB    ← when data is document-shaped or schema-flexible
   3. Cloud + S3 (object storage) ← the foundation everything sits on
   4. Redis / Valkey           ← the universal speed layer
   5. Kafka                    ← event-driven backbone (now KRaft, no ZooKeeper)
   6. Spark                    ← large-scale processing (+ AQE, Structured Streaming)
   7. Snowflake OR Databricks  ← pick ONE ecosystem, go deep
   8. dbt + Parquet + Iceberg/Delta ← columnar files + the transform/table layer
   9. Flink                    ← when real-time becomes a requirement
  10. Terraform + Prometheus/Grafana + OTel ← operate it all reliably
  11. Ray                      ← when ML workloads outgrow one machine
   ── Situational, on demand: Cassandra, Elasticsearch, gRPC/GraphQL
   ── Situational, AI context: pgvector → Qdrant/Milvus (vector search)
   ── Situational, growth: CockroachDB/Spanner (when Postgres writes max out)
   ── Skip for new work: Hadoop (only for legacy maintenance)
```

**Depth over breadth:** It is far more valuable to deeply understand Postgres, Kafka, Redis, and Kubernetes than to name-drop twenty tools. Senior engineers are hired for **judgment** — knowing *which* tool fits *which* problem, and the tradeoffs — more than for memorizing configuration flags.

</details>

---

## 22.9 Interview Angle

<details>
<summary><strong>Read as text</strong> — the signals that read as senior, with a worked example</summary>

When a system-design interviewer hears you casually and *correctly* place these tools, your seniority reads instantly. Strong signals:

- **Justify, don't name-drop.** "I'd put Kafka here to decouple ingestion from processing and allow replay" beats "I'd use Kafka."
- **Start simple.** Propose Postgres + a cache before reaching for Cassandra or a Spark cluster. Over-engineering is a red flag (see the *Common Anti-Patterns* section of Ch 25).
- **Know the tradeoffs.** Every choice costs something: Kafka adds operational weight; caching adds invalidation bugs; Kubernetes adds complexity; Cassandra trades consistency for availability.
- **Be current.** Mention that the field moved from Hadoop/HDFS to **lakehouse** (S3 + Iceberg/Delta + Spark/Flink), and that Kafka + Flink is the modern streaming pair. This signals you track the industry, not a 2015 textbook.
- **Place tools in the four-job frame out loud.** When you reach for a tool, say *which job* it does — "Kafka to **ingest** and buffer, S3 + Iceberg to **store**, Flink to **process**, Redis to **serve** hot reads." Narrating the ingest→store→process→serve pipeline shows you have a mental model, not a list of brand names.
- **Name the failure mode, then the mitigation.** Seniority shows up when you volunteer what breaks: "Redis is in-memory, so on a node loss I lose the cache and cold-start the DB — I'd warm it and set sane TTLs," or "Kafka consumer lag spikes under a poison message, so I'd add a dead-letter topic." Pairing every tool with its sharp edge is the strongest signal you've run these in production.
- **Anchor choices in numbers.** Tie the tool to a back-of-envelope estimate: "~50k writes/sec write-heavy and append-only → that's a Cassandra/LSM workload, not Postgres." Capacity math (QPS, payload size, storage growth) turns an opinion into a defensible decision.
- **Worked example — "design a URL shortener."** A senior answer sounds like: "Reads dominate ~100:1, so I'd **serve** from Redis in front of the DB; **store** mappings in Postgres (or Cassandra if we expect billions of keys); generate ids with a counter or hash, not random retries; and **ingest** click events into Kafka so analytics never slows the redirect path." Notice every tool is justified by a job and a tradeoff — never name-dropped.

</details>

---

## 22.10 Summary

- Every tool maps to one of four jobs: **ingest, store, process, serve.** Place any new tool in that frame and it stops being scary.
- **Tier 1 (learn first):** Docker, Kubernetes, Kafka, Redis/Valkey, PostgreSQL, **MongoDB**, Cloud+S3, Spark — you will meet these everywhere.
- **Tier 2 (modern stack):** Snowflake/Databricks, dbt, **Parquet**, Iceberg/Delta, Flink, Airflow, Terraform, Prometheus+Grafana, **Ray**.
- **Tier 3 (situational):** Cassandra/ScyllaDB, Elasticsearch, gRPC/GraphQL, **Vector DBs** (pgvector/Qdrant/Milvus), **Distributed SQL** (CockroachDB/Spanner/TiDB) — know *when*, learn *how* on demand.
- **Tier 4 (legacy):** Hadoop — maintain/migrate only; don't invest for new skills.
- **The 2025–2026 shifts:**
  - Hadoop → lakehouse (S3 + Iceberg — Iceberg became the cross-vendor table format; Apache Polaris as the open REST catalog).
  - Kafka 4.0 removed ZooKeeper entirely (KRaft) and made the incremental KIP-848 rebalance protocol GA; Kafka 4.2 added production-ready queues (share groups); Redpanda and WarpStream are credible alternatives.
  - Redis forked to **Valkey** (BSD) after the 2024 license change; Valkey is now offered (and priced lower) by the big managed services, and Redis 8 added an AGPL option.
  - **OpenTelemetry graduated** in CNCF (May 2026) as the vendor-neutral observability standard (traces + metrics + logs via OTel Collector).
  - **Vector databases** became a standard component for any AI-powered feature (RAG, semantic search).
  - **Ray** is a standard distributed Python layer in modern LLM stacks (now under the PyTorch Foundation).
  - **Distributed SQL** (Spanner, CockroachDB, Aurora DSQL) matures as the upgrade path when Postgres writes saturate.
- **Seniority = judgment.** The win is knowing which tool fits which problem and naming the tradeoffs — not memorizing all of them.

---

## Key Takeaways

```
DATA & INFRA ENGINEERING TOOLS — WHAT TO REMEMBER
═══════════════════════════════════════════════════════════════

THE MENTAL MODEL
  • Every tool does one of four jobs: ingest, store,
    process, serve. Frame any new tool that way.
  • Pick by access pattern + tradeoff, not by hype.
  • Seniority = naming which tool fits which problem.

TIER 1 — LEARN FIRST (you meet these everywhere)
  • Docker: package once, run anywhere; layer caching.
  • Kubernetes: declarative orchestration, self-healing.
  • Kafka: durable append-only log, the nervous system.
  • Redis/Valkey: in-memory speed layer (cache, queues).
  • PostgreSQL: the default DB; reach for it first.
  • MongoDB/Cosmos: document/multi-model NoSQL.
  • Cloud object storage (S3/GCS/Blob): the foundation.
  • Spark: distributed batch heavy-lifting.

TIER 2 — MODERN DATA STACK
  • Iceberg/Delta: open table formats on object storage.
  • Snowflake/Databricks: warehouse + lakehouse.
  • dbt: transform data with plain SQL.
  • Flink: true low-latency stream processing.
  • Ray: distributed Python for ML/LLM workloads.
  • Airflow/Dagster/Prefect: orchestration (DAGs).
  • Terraform: infrastructure as code.
  • Prometheus + Grafana: metrics + dashboards.

TIER 3 — SITUATIONAL (know WHEN, learn HOW on demand)
  • Cassandra/ScyllaDB: write-heavy, always-on.
  • Elasticsearch/OpenSearch: search + log analytics.
  • gRPC/GraphQL: beyond REST (perf / flexible queries).
  • Vector DBs (pgvector/Qdrant/Milvus): AI similarity.
  • Distributed SQL (CockroachDB/Spanner/TiDB): scale-out.

TIER 4 — LEGACY
  • Hadoop: maintain/migrate only; don't invest new.

2025–2026 SHIFTS
  • Hadoop → lakehouse (S3 + Iceberg, the default format).
  • Kafka 4.0 removed ZooKeeper (KRaft).
  • Redis → Valkey (BSD) after the license change.
  • OpenTelemetry graduated as the observability standard.
  • Vector DBs are now standard for AI features (RAG).
```
