// tools/diagram-prompts.js
//
// One entry per retained PNG architecture diagram in Chapters 35-37.
// `svgBase` names diagrams/<svgBase>_ai.png for the optional generation workflow.
// The chapters' editable Mermaid diagrams and current prose define the corrected
// designs; existing PNGs are retained unchanged for manual review. Updating these
// prompts does NOT regenerate images or remove the chapter's image-review notes.
// `existingImageLine` preserves caption metadata and the generator's legacy SVG
// insertion anchor. Normal regeneration replaces the existing PNG reference;
// the old SVG files are no longer present as fresh-insertion anchors.
//
// Prompt bodies describe the corrected components, flow, assumptions, and failure
// boundaries rather than prescribing visual styling. Keep them aligned with the
// corresponding case, especially durable acknowledgement and ownership semantics.
//
// buildPrompt(target) composes the final prompt string sent to the API.
// Targets use rawBody; the legend/blocks/flow form remains supported for callers
// authoring a target interactively. Never assume a generated image proves that
// the described protocol establishes its claimed guarantees.

function buildPrompt(target) {
  const opening = `Please create an engineering architectural flow diagram for ${target.title} with below data --`;
  if (target.rawBody) return `${opening}\n\n${target.rawBody}`;
  const parts = [opening];
  if (target.legend) parts.push(`Legend: ${target.legend}`);
  parts.push(`Block by block:\n\n${target.blocks.map(b => `${b}`).join('\n')}`);
  if (target.flow) parts.push(`${target.flowLabel || 'Numbered flow:'} ${target.flow}`);
  return parts.join('\n\n');
}

const DIAGRAM_TARGETS = [
  {
    id: "arch_reference",
    chapterFile: "content/35_system_design_cases_realtime.md",
    existingImageLine: "![The 4-Layer Reference Architecture — Edge · Services · Data · Async](diagrams/arch_reference.svg)",
    svgBase: "arch_reference",
    title: "the universal 4-layer reference architecture",
    rawBody: "The four-layer reference is a checklist of responsibilities, not a mandatory microservice deployment. Client -> edge authentication and admission -> service validating the business operation -> authoritative durable state. Return success only after the commit required by the API contract. When a committed change requires asynchronous work, write an outbox row with the business state in one transaction, or use an equivalent durable change-log mechanism. Relay committed events to workers, which implement idempotent owned effects, bounded retries and explicit dead-letter/expiry outcomes. Queues buffer work; they do not create capacity. Edge examples are a gateway, suitable L4/L7 load balancer, and CDN for cacheable content. Storage is selected by access pattern and guarantees: transactional store for invariants, partitioned append/range storage for histories, object storage for blobs, and optional caches for derived data. A small system may combine these responsibilities. Real-time gateways keep connection state; do not label all services stateless or assume every database write also needs Kafka."
  },
  {
    id: "notification",
    chapterFile: "content/35_system_design_cases_realtime.md",
    existingImageLine: "![Notification System — high-level architecture (HLD)](diagrams/notification.svg)",
    svgBase: "notification",
    title: "notification system",
    rawBody: "Corrected notification system. Producer supplies an authenticated tenant, stable idempotency key and validated payload. API checks tenant quota and atomically commits a unique (tenant_id, idemKey) request with payloadHash, notifId, accepted state, and an outbox row in its transactional database. Only after commit return 202 accepted. A matching replay returns the same notification/current state; a changed payload with the same key returns a conflict. Redis SETNX is not durable acceptance. Outbox relay publishes with retries into durable transactional/marketing queues. Processor loads preferences from PostgreSQL/cache and versioned templates from object storage, checks opt-out, quiet-hours, delivery deadline and channel choice, and creates unique durable (notifId, channel) jobs. Per-channel workers enforce user and provider quotas with atomic token buckets, and use attempt ownership, bounded retries and DLQs. Reserve urgent worker/provider capacity; separate queue names alone do not protect an OTP. In-app writes dedupe by notification identity. External attempts use provider idempotency where supported; provider success means sent/accepted, not device delivered. Lost replies remain UNKNOWN and require provider query/reconciliation or an explicit duplicate-versus-loss policy. Supported provider receipts and receiving-app telemetry update delivered/opened state; do not invent an FCM opened webhook. Durable usage events support billing. Status events feed the Cassandra TTL audit log, analytics and SLOs. Cache state is optional; inability to commit acceptance must not return success."
  },
  {
    id: "chat",
    chapterFile: "content/35_system_design_cases_realtime.md",
    existingImageLine: "![Chat / Messaging (WhatsApp / Slack) — high-level architecture (HLD)](diagrams/chat.svg)",
    svgBase: "chat",
    title: "chat / messaging application (WhatsApp / Slack style), using WebSocket for the live path with long-poll as a fallback for hostile networks",
    rawBody: "Corrected chat architecture. Clients connect through a WebSocket-capable L4 or L7 load balancer to gateway servers. Redis holds an ephemeral per-(userId, deviceId) gatewayId and sessionToken with independent TTL; renew and delete only the current token. Route a conversation to its current fenced ordering authority. The owner deduplicates (senderId, convId, clientMsgId), assigns a sequence and commits the message and identity through a replicated ordered-log protocol before acknowledging SENT. Old owners cannot append after failover; a conversation without a safe commit quorum keeps new messages pending, while unaffected conversations operate. Materialize committed entries into bounded Cassandra/partitioned history keyed by conversation, time bucket and sequence; sync honors the projection watermark or reads the log tail. A transactional partitioned message store can combine these roles. Live routing uses the registry and best-effort per-gateway pub/sub; loss is recovered by sync on reconnect, conversation-open and periodic head checks. Each device keeps its own contiguous delivered sequence and separate read sequence. Receiving 41 and 43 cannot advance the cursor beyond 41 while 42 is missing. SENT -> DELIVERED -> READ advances only with corresponding evidence. Small groups may fan out inbox references; large rooms use one shared log and per-device cursors, with online network fan-out still required. Presence is disposable. Media uses authorized blob references, privacy-scoped dedupe and CDN. TTL expiration still creates Cassandra tombstones; retention and compaction must be planned. Do not claim SQL is impossible or simultaneous partition-side acceptance preserves strict order."
  },
  {
    id: "video_conf",
    chapterFile: "content/35_system_design_cases_realtime.md",
    existingImageLine: "![Video Conferencing (Zoom / Google Meet) — high-level architecture (HLD)](diagrams/video_conf.svg)",
    svgBase: "video_conf",
    title: "video conferencing system (Zoom / Google Meet style), drawn as two clearly separate planes",
    rawBody: "Video conferencing separates signaling responsibilities from deadline-sensitive media forwarding. Meeting service persists configuration and authorization in PostgreSQL. Signaling uses HTTPS/WebSocket for join, SDP negotiation, ICE candidates and SFU allocation; room/session routing is ephemeral Redis state. Client ICE checks select a working path: preferred direct UDP to an SFU, or TURN relay including a TCP/TLS client-to-relay leg when UDP is blocked. UDP is preferred, not the only supported path. SFU forwards selected encrypted tracks/layers without video transcoding, but packet processing and crypto still cost CPU. Sender upload is the SUM of simulcast-layer rates, independent of participant count. Receiver download is the SUM of selected incoming layers, not always one stream. Example receiver: one 1.5 Mbps speaker plus eight 0.15 Mbps thumbnails plus nine 0.04 Mbps audio streams = 3.06 Mbps. Receiver jitter buffer reorders and smooths packets, then decode/render must meet the playout deadline; reference-frame dependencies require useful recovery or refresh requests. Protect audio first. Cascaded regional SFUs reduce repeated inter-region forwarding. Optional recording subscriber taps media outside the critical live path; recordings go to object storage/CDN. For large view-only webinars, CDN HLS/DASH trades seconds of latency for broadcast scale. Mesh grows each upload with N-1; MCU trades expensive mixing for simpler receiver downloads; SFU trades server egress and receiver decoding for lower server transcoding cost. Retain explicit fallback, latency and capacity assumptions instead of universal participant/TURN percentages."
  },
  {
    id: "collab_editor",
    chapterFile: "content/35_system_design_cases_realtime.md",
    existingImageLine: "![Collaborative Editor (Google Docs) — high-level architecture (HLD)](diagrams/collab_editor.svg)",
    svgBase: "collab_editor",
    title: "collaborative document editor (Google Docs style)",
    rawBody: "Corrected collaborative editor: choose central OT for this illustrated architecture; CRDT is an alternative data model, not an additional mandatory stage. Client applies a local operation optimistically and retains its opId and baseRev in a pending queue. Gateway routes docId to the current fenced document owner. For every operation the owner authorizes, deduplicates document/author/opId with payload binding, transforms against unseen operations, then durably commits transformed op, identity and revision to a replicated log. Only after commit send ACK and broadcast committed APPLY. A lost ACK and retried opId return the existing revision without inserting twice. Other clients transform remote operations and pending local operations together. Snapshot storage contains a durable document at a known committed revision; loading replays the tail. History/offline bases, lagging consumers and dedupe retention constrain reclamation. Presence/cursors are ephemeral; assets live in object storage; export/index/notification work is asynchronous. Example: base abc at rev7; A inserts X at0, commits rev8; B's insert Y at2 transforms to3, commits rev9; final XabYc at rev9. Same-position inserts use a shared operation-ID tie-break in both transform directions. The simplified position-based CRDT alternative uses a:1, b:2, c:3, X:0.5 and Y:2.5, so sorted live text is XabYc. These decimal IDs are teaching notation, not IEEE-float implementation; real structured IDs, causal rules, tombstones and offline-aware garbage collection are required. Convergence does not guarantee every conflicting human intent. Never illustrate broadcast-before-durable-append or final XabYc at revision8."
  },
  {
    id: "autocomplete",
    chapterFile: "content/36_system_design_cases_search_media.md",
    existingImageLine: "![Search Autocomplete / Typeahead — high-level architecture (HLD)](diagrams/autocomplete.svg)",
    svgBase: "autocomplete",
    title: "search autocomplete / typeahead system (like Google Suggest)",
    rawBody: "Draw an editable, clearly labeled system-design diagram for Case 5: Search Autocomplete. Separate ONLINE GLOBAL CANDIDATES, PRIVATE PERSONALIZATION, and OFFLINE INDEX BUILD lanes. Browser waits 60 ms after the last key and tags requests with a sequence; label request-response target <50 ms AFTER debounce, not <50 ms from the last key. Route normalized prefix + language + locale + safety policy + snapshot version to a shared edge/Redis candidate cache. On a miss, route an exact prefix to its owning RAM trie shard, not automatically to all shards. The snapshot precomputes top-M candidates; return K, e.g. M=50 and K=10 for personalization. Cache global candidates only; optional user-history reranking is private and its response uses Cache-Control: private, no-store. Add one-character prefix summaries when two-character ranges are split; bounded fuzzy scatter/merge is a separate path. Offline query logs feed aggregation, decay, privacy/safety filtering, and immutable versioned snapshots in object storage. Each serving replica independently loads shadow memory, validates, flips a local pointer, and drains old readers. Draw three replicas, not replication caused by the pointer flip. Memory inset: illustrative K=10 snapshot 144 GB; three replicas 432 GB; full old+new double buffering 864 GB BEFORE overhead. M=50 requires a larger artifact. Note that anchored SQL prefix lookup can use an index; precomputation avoids repeated broad-prefix ranking. Keep tier labels consistent: cache hits end at cache; snapshot loads target RAM serving."
  },
  {
    id: "crawler",
    chapterFile: "content/36_system_design_cases_search_media.md",
    existingImageLine: "![Web Crawler (Googlebot) — high-level architecture (HLD)](diagrams/crawler.svg)",
    svgBase: "crawler",
    title: "web crawler (Googlebot style)",
    rawBody: "Draw Case 6: Web Crawler with separate NEW DISCOVERY and SCHEDULED RECRAWL/RETRY entry arrows. New links pass normalization, advisory Bloom membership and an exact URL record; first-discovery record plus durable enqueue is atomic. Recrawls bypass discovery seen-set but deduplicate by URL and due-generation. Both enter priority front queues, host-owned FIFO back queues, and a min-heap of eligible idle hosts. Draw durable host state: busy token, attempt id, fetch deadline, nextAllowed. Admission atomically leases one attempt and marks the host busy; remove busy hosts from eligibility. Fetchers check robots, cache DNS, perform conditional GET, and apply bounded fetch timeouts. Completion is owner-token checked, persists result, clears busy and sets nextAllowed=max(finish+delay, Retry-After), retaining the timestamp even if the queue empties. Separate content storage, parser/link graph, near-duplicate sim-hash and new-link loop. Crash arrow: revoke old fetch permission, establish cancellation or conservative bounded timeout plus grace, then cooldown and retry; pause host if termination cannot be established. Tokens fence internal state, not arbitrary remote HTTP effects. Timeline inset: A starts at 0, completes at 3, delay 1.5, next A start >=4.5; host B can run independently. Do not claim FIFO or a bare 1.5-second timer prevents slow-fetch overlap. Bloom inset: 30 billion entries, 9.6 bits/entry at p=1%, about 36 GB plus backing records; positives are probabilistic, not proof of prior fetch."
  },
  {
    id: "proximity",
    chapterFile: "content/36_system_design_cases_search_media.md",
    existingImageLine: "![Proximity / Nearby (Maps / Yelp) — high-level architecture (HLD)](diagrams/proximity.svg)",
    svgBase: "proximity",
    title: "proximity / nearby-search system (like Maps or Yelp nearby search)",
    rawBody: "Draw Case 7: Proximity / Nearby with a query circle crossing cell boundaries. Core flow: point + radius + filters -> COMPLETE REGION COVER -> read covered index ranges/descendants -> deduplicate ids and resolve latest location versions -> exact distance/eligibility filter -> order by (distance,id). Show three index-specific cover methods: geohash enumerates intersecting rectangles at selected precision; quadtree traverses all nodes whose bounds intersect the circle; S2 uses spherical RegionCoverer and descendant/range lookup. Never label center plus eight neighbors as universal. A 3x3 grid is a conditional example only when its outer edges enclose the entire circle; cell widths vary with latitude and adaptive cells vary in size. Static places use a durable spatial index and place metadata; frequently moving points use a versioned, TTL'd RAM grid with last-sequence-wins ingestion. Include an inside-radius point across a cell edge and an outside-radius point inside a covered coarse cell. Inset local coordinates in km: query (-0.01,0); B(0.01,0)=0.02 km; A(-0.41,0)=0.40 km; C(1.80,0)=1.81 km; D(2.19,0)=2.20 km. Radius 2 includes B,A,C only. Separate exact k-NN inset: visit regions by minimum possible distance; stop only when k exist and the smallest unvisited bound is greater than kth distance; explore equality for id tie-breaking. Arbitrary per-cell candidate caps do not preserve exactness. S2 key locality is useful, not a universal distance ordering."
  },
  {
    id: "ride_hailing",
    chapterFile: "content/36_system_design_cases_search_media.md",
    existingImageLine: "![Ride-Hailing (Uber / Lyft) — high-level architecture (HLD)](diagrams/ride_hailing.svg)",
    svgBase: "ride_hailing",
    title: "ride-hailing system (Uber / Lyft style)",
    rawBody: "Draw Case 8: Ride-Hailing, explicitly separating EPHEMERAL LOCATIONS from DURABLE ASSIGNMENTS. Driver GPS -> location ingestion -> versioned TTL RAM geo grid, about 1.25 million updates/s for five million drivers every four seconds. Rider request -> complete nearby-circle cover -> ETA ranking -> assignment authority. The geo grid and optional Redis SET NX lease are candidate/admission optimizations, NOT proof of final ownership. Show a serializable regional driver-and-trip database: driver {state,tripId,offerEpoch,expiresAt}, trip {state,currentOffer,driver}. Reserve atomically if driver available or old OFFERED state expired and trip REQUESTED without a live offer. Push offer with epoch over the WebSocket gateway. Acceptance transaction validates current driver/trip owner, epoch, unexpired offer and expected trip state; writes driver ASSIGNED, trip MATCHED and outbox; only THEN confirm. Accepted assignments do not expire with the offer timer. Decline/timeout releases only matching OFFERED owner+epoch. If advisory Redis exists, release by atomic token comparison and deletion, never unconditional DEL. Race inset: A epoch41 at t0 expires t15; acceptance handler pauses t14 before commit; B epoch42 reserves t16 and commits t17; A resumes t18 and is rejected, leaving B intact. Duplicate committed acceptance returns its result. Outbox relays trip.matched after crashes. Assignment authority unavailable -> pause confirmation. Label first-offer target 2-5 s separately from final match including human waits. Retain trip FSM and surge as a derived per-cell signal."
  },
  {
    id: "news_feed",
    chapterFile: "content/36_system_design_cases_search_media.md",
    existingImageLine: "![News Feed (Twitter / Facebook) — high-level architecture (HLD)](diagrams/news_feed.svg)",
    svgBase: "news_feed",
    title: "news feed system (Twitter / Facebook style)",
    rawBody: "Draw Case 9: News Feed using the single event name post.created everywhere. Create post -> durable post store plus author/time/post-id access path -> committed outbox or CDC -> event bus -> hybrid fan-out policy. Ordinary authors push stable post ids into capped active-reader candidate caches; celebrity posts skip follower-wide writes but remain in the durable author stream, with a replicated recent-post cache. Read flow merges pushed candidates, pulled celebrity posts (durable author index on cache miss), and own recent posts; deduplicate by post id. Rank a bounded candidate set ONCE and store a user-bound ordered snapshot with expiry. Page one and later pages read that immutable list using (snapshotId,lastOrdinal); do not draw offsets into a changing ranking. Snapshot expiry returns refresh-required, not a silently rebuilt page. Chronological alternative inset: descending (createdAt,postId), exclusive tuple continuation handles equal timestamps; a horizon excludes newer posts, while strict fixed membership requires a snapshot. Dataset inset: 100:A@10:00:01, 101:A@10:00:02, 102:B@10:00:03, 103:celebrity@10:00:03. Page size2 -> [103,102], then [101,100] even if 104 arrives after page1. Live push/new-post indication is separate from frozen pagination. Label posts and follow edges AUTHORITATIVE; timeline cache, celebrity cache, live push and snapshots DERIVED. Memory inset 500M x800 x16B=6.4TB payload BEFORE Redis overhead/replicas. Fan-out math sums recipients for each pushed post, not min(averageFollowers,threshold). Personalized pages must not enter a shared public CDN cache."
  },
  {
    id: "video_streaming",
    chapterFile: "content/36_system_design_cases_search_media.md",
    existingImageLine: "![Video Streaming (YouTube / Netflix) — high-level architecture (HLD)](diagrams/video_streaming.svg)",
    svgBase: "video_streaming",
    title: "video streaming platform (YouTube / Netflix style)",
    rawBody: "Draw Case 10: Video Streaming with upload/processing and playback lanes. Creator uploads original directly to object storage; durable finalization triggers PROCESSING. Planner chooses common output boundaries 0,4,8,... seconds and appropriate source decode ranges. Encoder jobs for each time span and applicable rendition decode pre-roll if necessary and force compatible closed-GOP random-access frames at shared output boundaries. Arbitrary source keyframes every five seconds cannot simply be repackaged into independently decodable four-second outputs. Validate timestamps and decodability -> write immutable versioned segments and await durability -> write completed rendition playlists -> publish public master listing READY renditions only. Progressive publication can expose complete 360p before incomplete 1080p; never advertise missing-segment URLs. Delivery: CDN master -> player picks rendition from throughput safety margin and buffer -> aligned segment downloads -> playback. ABR reduces stalls but an outage longer than buffered media or sustained throughput below the lowest rendition still stalls. Use consistent names: 640x360 -> 360p/index.m3u8; 1280x720 -> 720p/index.m3u8. Ladder inset: 0.4+0.8+1.4+2.8+5+16=26.4 Mbit/s; versus illustrative 5 Mbit/s original, outputs 5.28x and total including original 6.28x. A 1080p source excludes 4K, output sum10.4; weight real source mix. Buffer inset: 4s at2.8Mbit/s=11.2Mbit; at1.4Mbit/s download8s, starting buffer6s ->2s stall. Note monolithic MP4 supports CDN/range caching and resume. Count accepted events with deduplicated sharded batching; approximate unique-viewer sketches are a separate metric."
  },
  {
    id: "file_sync",
    chapterFile: "content/36_system_design_cases_search_media.md",
    existingImageLine: "![File Sync & Storage (Drive / Dropbox) — high-level architecture (HLD)](diagrams/file_sync.svg)",
    svgBase: "file_sync",
    title: "file sync and storage system (Google Drive / Dropbox style)",
    rawBody: "Draw Case 11: File Sync with a transactional METADATA AUTHORITY and an immutable BLOCK STORE. Preserve the four-chunk delta example: old [h0,h1,h2,h3], edited [h0,h1,h2a,h3], transfer only h2a when other chunks are authorized and reusable. Client creates intent with fileId, expectedBaseVersion, ordered hashes and a persistent idempotency key. Metadata authorizes file and dedupe scope, pins block generations, and returns scoped upload permissions for missing bytes. Upload only missing blocks; verify hash/length and durable finalization before AVAILABLE registry state. Final commit checks intent ownership/expiry, request digest, head==expectedBaseVersion, authorization and every block's durable AVAILABLE generation plus live pin. One transaction writes new server-assigned version, retained-version refcounts, ordered account journal/outbox and stored idempotent result, then consumes pins. Matching retries return the existing result; changed payload under same key is an error. Show stale-base branch -> preserve conflict copy, never silent overwrite. Device notification is a hint; offline replay uses lastAppliedJournalSeq across files, acknowledged after durable apply; expired history requires snapshot resync. GC inset: refcount0 is insufficient; require no live upload pins plus grace, atomically claim a specific generation DELETING, fence commit/reuse, delete only that object generation. History versions retain refs. Block keys are scoped content hashes, not global access capabilities; authorized file/version references gate downloads. Convergent encryption does not by itself hide existence of guessable content. CDC often preserves later boundaries after insertions but does not guarantee exactly one changed chunk."
  },
  {
    id: "url_shortener",
    chapterFile: "content/36_system_design_cases_search_media.md",
    existingImageLine: "![URL Shortener (TinyURL) — high-level architecture (HLD)](diagrams/url_shortener.svg)",
    svgBase: "url_shortener",
    title: "URL shortener system (TinyURL style)",
    rawBody: "Draw Case 12: URL Shortener as a compact warm-up. Create path: optional custom alias OR unique integer from managed disjoint ranges constrained below62^7 -> base62 candidate -> ATOMIC PUT-IF-ABSENT in one public code namespace -> durable mapping {target,expiresAt,createdAt} -> cache after success. Alias conflict is explicit; generated conflict retries because aliases may occupy allocated strings. Random cryptographic candidates plus conditional retries are an alternative when unpredictability matters. Do not describe Snowflake as unguessable or seven characters by default: seven base62 chars carry about41.7bits, while full63/64-bit Snowflake values may need11; truncation destroys uniqueness. Capacity inset62^7=3.52trillion,100M/day x5years=182.5B about5.2%; random100M draws have about1420 expected colliding pairs before retries. Keep capacity, collision probability and unpredictability as three separate ideas. Redirect path: GET code -> mapping cache or durable KV -> SAME expiry gate on both hit/miss -> absent/expired gives404/410, otherwise default302 + Location + Cache-Control:no-store. Internal cache TTL=min(normalTTL,expiresAt-now), and record retains expiry. Background deletion is not request-time expiry enforcement. Retain expired reservations/tombstones; no code reuse in this design. Async best-effort click events leave the redirect path. Speed-first301 with explicit bounded freshness may offload requests, and302 can also cache if headers allow; neither status guarantees perfect analytics. Do not claim one Redis key has unlimited capacity; hot mappings may use local caches/read replicas."
  },
  {
    id: "rate_limiter",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![Distributed Rate Limiter — high-level architecture (HLD)](diagrams/rate_limiter.svg)",
    svgBase: "rate_limiter",
    title: "distributed rate limiter",
    rawBody: "Distributed rate limiter: authenticated gateway resolves a trusted route/tenant policy, then asks the authoritative owner of that bucket for an atomic decision. Redis Lua obtains TIME, clamps effective time to the stored timestamp, refills up to burst B, spends one token if available, persists on allow or deny, and returns remaining tokens and computed wait. Policy inputs are validated; caller timestamps are not accepted. Expiry must not reset a partially empty bucket before its full-refill horizon. Allowed requests reach the backend; rejected requests receive 429 and a rounded-up Retry-After. Token bucket contract is B+rT, not a strict rolling-window N. Shard different keys; a hot single tenant still has contention. A healthy atomic owner is not durable consensus: Redis failover can lose spent tokens. Strict routes need durable ownership/state and fail-closed handling. Explicit fallback: centrally deducted grants preserve a total budget, or G gateways each with b non-refilling emergency tokens admit at most G*b extras per outage epoch if restart cannot recreate tokens. Unbounded fail-open has no finite overshoot bound. Label all throughput and sub-millisecond latency figures as workload assumptions."
  },
  {
    id: "unique_id",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![Distributed Unique ID Generator (Snowflake) — high-level architecture (HLD)](diagrams/unique_id.svg)",
    svgBase: "unique_id",
    title: "distributed unique ID generator (Snowflake style)",
    rawBody: "Snowflake unique ID generator: coordinator maintains renewable worker ownership plus a DURABLE highest-granted timestamp ceiling per worker. Generator uses a disjoint granted time interval, a conservative monotonic lease deadline, and a lock around the complete timestamp/sequence transition. No network call per ID, but renewal/allocation are real coordination. Bit layout: sign0, 41 timestamp milliseconds since custom epoch, 10 worker bits, 12 sequence bits. Example offset1000, worker7, sequence3 -> 4,194,332,675. Same millisecond increments sequence; after4095 wait for the next millisecond, rechecking lease. Backward clock: wait within a bound or reject and alert; reject timestamps outside grant/epoch range. Check ownership after pauses and before issuance. An expired lease does not kill a paused process; a replacement gets timestamps strictly ABOVE the old durable ceiling, even if unused. If ceiling1100, wait for1101 or use another safe worker. Grants survive lease deletion and prevent old/new allocations minting the same tuple. Coordinator outage permits issuance only within valid ownership and grant bounds, then fail-stop. 4096 IDs/ms is a bit-space ceiling, not measured throughput. IDs are k-sorted, not secret or globally monotonic; database sequences and UUIDv7 remain alternatives."
  },
  {
    id: "topk",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![Top-K / Trending / Heavy Hitters — high-level architecture (HLD)](diagrams/topk.svg)",
    svgBase: "topk",
    title: "top-K / trending / heavy-hitters system, reporting the top-K most frequent keys from a firehose of events",
    rawBody: "Streaming approximate heavy hitters: events with key, event time and identity enter Kafka partitioned BY KEY, so one partition owns a key's entire count. Worker maintains a Count-Min Sketch for the window and an indexed MIN heap of UNIQUE candidate keys, capacity C >= desired K. Update d sketch cells; if key already exists, update its priority; otherwise insert if room or replace the weakest candidate under one deterministic tie order. Key-to-heap-index map changes with swaps/removals. Periodically rescore retained keys, emit candidates with window ID, watermark/version and ownership, and merge compatible partition results into approximate global top-K cached for the API. CMS estimates counts, not key identities; collision changes can leave priorities stale and rescoring cannot recover omitted candidates. Six-event example A,A,B,C,B,A at K2 without collisions ends A3,B2, never two slots for A. Exact local top-K union works under whole-key partitioning and a common total order; arbitrary event partitions can hide global winners. Tumbling windows reset sketch and candidates; one-minute panes approximate sliding60minutes with explicit memory/boundary and recall costs. CMS error epsilon*N is additive per queried key, not guaranteed ordering; batch exact results monitor drift and candidate recall. Do not label this an exact top-K algorithm."
  },
  {
    id: "leaderboard",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![Leaderboard / Ranking — high-level architecture (HLD)](diagrams/leaderboard.svg)",
    svgBase: "leaderboard",
    title: "leaderboard / ranking system",
    rawBody: "Leaderboard: authoritative writer stores each player's season MAXIMUM score and version, deduplicates (season, matchId, player), and records an outbox event in the same durable commit. A projector atomically compares version and updates the Redis sorted set plus version metadata; late v8 cannot overwrite v9. Reads use top-N, zero-based rank and clamped around-me ranges; read-your-writes requires a projection barrier or updating status. Example Ada120 atsecond200, Ben120 at250, Cleo100, Dev95, Eli90; matchM82 raises Dev to125 v9 -> Dev,Ada,Ben,Cleo,Eli. Raw ZINCRBY is not retry-idempotent. Bounded tie encoding score*B+(B-1-t) with B1,000,000, score<=1,000,000 and 0<=t<B stays below2^53 and prevents time outweighing a score point; equal composites use defined member order. If bounds do not fit, use tuple-aware indexing. Global rank sums counts ahead under the full tie order on compatible snapshots. Score-range top100 may require multiple shards if the highest has only40. Histograms are explicitly approximate. Redis is a rebuildable read model, not an uncoordinated second source of truth."
  },
  {
    id: "dist_cache",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![Distributed Cache (Redis / Memcached) — high-level architecture (HLD)](diagrams/dist_cache.svg)",
    svgBase: "dist_cache",
    title: "distributed cache system (designing Redis / Memcached itself)",
    rawBody: "Distributed cache: client routes keys to generic consistent-hash owners with virtual nodes, or an explicitly different Redis Cluster hash-slot model. Replication and bounded near-caches reduce misses and hot-key reads; vnodes balance many keys, not one hot key's traffic. Database remains authoritative. Cache-aside miss uses per-key single-flight, then DB fetch and conditional fill; TTL jitter prevents synchronized expiry, while admission bounds distinct-key misses during cold restart. Stale-fill sequence: R records generationg7, reads DBv7; W commitsv8 then atomically advances fenceg8 and invalidates value; R's fill withg7 is rejected. Preserve fence independently of value and never recreate an old generation after eviction/restart. This does not remove the DB-commit-to-invalidation gap; strict freshness reads the authority or uses a stronger protocol. Versioned CDC is another measured-lag design. Size RAM and throughput independently: four nodes at200kops/s total800k before headroom, not millions. 100GB logical payload plus one full replica is200GB before overhead. A90% hit rate at1Mrps still means100kDBmisses/s, and cold-cache misses may approach all traffic. Bound pressure rather than simply adding cache nodes."
  },
  {
    id: "scheduler",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![Distributed Job Scheduler / Task Queue — high-level architecture (HLD)](diagrams/scheduler.svg)",
    svgBase: "scheduler",
    title: "distributed job scheduler / task queue system",
    rawBody: "Durable scheduler: submit idempotent job/occurrence to a persistent job store with run_at, state, monotonically increasing attempts, lease_until and payload. Due index or rebuildable timing wheel finds work; transactional SKIP LOCKED claim changes ready to leased, increments attempt token and returns payload. Heartbeat and ACK require current jobID, attempt token, leased state and an unexpired lease. Sweeper makes expired work ready for another attempt. Timeline job42: A claims7 at12:00:00 until:30, heartbeat:20 extends:50, expiry:51, Bclaims8, AACK7 at:52 changes zero rows. Never reset attempts/reuse jobID for different work. Queue fencing protects queue state, not an external email/payment; the effect sink dedupes stable job/occurrence identity or enforces fencing. Retrying by attempt number would not dedupe effects. Retry with backoff/jitter and DLQ. Recurrence planner atomically inserts unique(scheduleID,scheduledAt) and advancesnextFire; timezone, DST, misfire and overlap rules are explicit. Timing-wheel bucket metadata may be fixed, but timer entries require O(numberoftimers) memory. Little's Law yields concurrent execution SLOTS, not necessarily machines. Keep queue and delayed index recovery explicit."
  },
  {
    id: "payment",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![Payment System / Digital Wallet — high-level architecture (HLD)](diagrams/payment.svg)",
    svgBase: "payment",
    title: "payment system / digital wallet",
    rawBody: "Payments/digital wallet: API authenticates and validates currency, integer minor units, accounts and positive amount; uniquely binds (tenant,principal,operation,key) to payloadHash and durable transactionT1. Terminal identical replay returns stored result; changed payload conflicts; PENDING/UNKNOWN returns status or resumes the same workflow. Internal same-shard transfer locks transaction and account balances in deterministic order; check funds, append balanced signed entries, UPDATE AUTHORITATIVE BALANCES, write outbox and terminal receipt in ONE ACID transaction. Example Alice5000cents: T30spends3000, commitsbalance2000; T31spends2500 must then fail. No processor HTTP while wallet locks are held. External topup uses stable provider identityT1 with supported provider dedupe window: success permits an idempotent posting stage; decline persists failure; timeout remainsUNKNOWN and is queried/reconciled, not blindly recharged. A completed or unresolved request must not fall through into another posting. Charge-before-ledger crash resumes/queryT1 or completes tracked refund; refund timeout is alsoUNKNOWN. Query and settlement use providerT1, mapped to clientkeyk1. Outbox publication may duplicate; consumers dedupe. Cross-shard transfer uses balanced local clearing legs and funds-in-transit, not an assertion of simultaneous atomic visibility. Ledger corrections are reversing entries, not edits."
  },
  {
    id: "inventory",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![E-commerce Inventory / Flash Sale — high-level architecture (HLD)](diagrams/inventory.svg)",
    svgBase: "inventory",
    title: "e-commerce inventory / flash-sale system",
    rawBody: "Flash-sale inventory: a waiting room controls admitted load. SQL is the stock/reservation authority; Redis is optional admission/cache. One transaction claims a unique order and payload identity, conditionally decrements stock, and creates an ACTIVE reservation plus outbox. Matching retries return the same reservation; changed payloads conflict; insufficient stock produces REJECTED. ACTIVE to CONFIRMED before expiry requires verified payment success. ACTIVE to EXPIRED or RELEASED restores quantity in the same transaction, exactly once. Confirmation and expiry compete conditionally; key expiry alone never increments stock. Example initial stock 2: O17 and O18 each reserve one. If R17 expires and Carol acquires that unit, late payment P17 cannot resurrect R17: acquire a fresh reservation or complete an idempotent refund. UNKNOWN is not decline. Keep terminal records for dedupe. A Redis-authoritative alternative needs acknowledged-hold durability, safe ownership and recovery before reopening sales; reconciliation afterward cannot undo overselling. A named-seat variant has unique event/seat ownership. Distinguish stock ownership from payment/refund state."
  },
  {
    id: "kv_store",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![Distributed Key-Value Store (Dynamo-style) — high-level architecture (HLD)](diagrams/kv_store.svg)",
    svgBase: "kv_store",
    title: "distributed key-value store (Dynamo style, leaderless and highly available)",
    rawBody: "Dynamo-style KV store: any node coordinates GET/PUT. Consistent hashing and vnodes locate N distinct physical failure-domain owners. Send to N, wait for W durable write acknowledgements or R read responses, then resolve version context and repair. Fixed home set A,B,C with N=3, W=R=2: v2 written to A,B overlaps a B,C read under retained-version/no-concurrent-write assumptions. W+R>N proves fixed-set overlap, not unconditional latest-value or linearizability. Partition example: only A and stand-in D can accept v2. Strict mode refuses to acknowledge two home replicas; sloppy mode accepts A,D but B,C may return v1. Concurrent version vectors produce siblings for application merge or potentially lossy LWW. Return causal context with reads and subsequent writes; simple cart union can resurrect removals. Deletion is a versioned tombstone retained until repair/offline rules make reclamation safe. Hinted handoff and Merkle anti-entropy repair after connectivity returns. Availability depends on the participation policy, not merely absence of a leader."
  },
  {
    id: "pastebin",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![Pastebin — high-level architecture (HLD)](diagrams/pastebin.svg)",
    svgBase: "pastebin",
    title: "pastebin system (paste text, get a short shareable link, optional expiry / view-once)",
    rawBody: "Pastebin extends the shortener with payload and authorization. Small text in SQL is a valid baseline. Larger payloads use a private immutable object store plus authoritative metadata: code, owner, ACL, blob version, expiry and consumed state. Finalize the object before publishing metadata; failed metadata writes leave orphans for safe cleanup. Public stable pastes may use a CDN with bounded freshness. Private/view-once content must not bypass authorization through a reusable object URL. An explicit identified retrieval checks current ACL and server-time expiry, conditionally claims unconsumed to consumed, then the API fetches the private object and streams with no-store. Example p7 expires at 12:05; Bob claims at 12:04:59 but the connection fails: one authorized retrieval attempt is spent, not guaranteed human viewing. Denied/expired/consumed requests receive no payload. HEAD and unauthenticated previews do not consume. Define in-flight expiry/revocation semantics; already delivered bytes cannot be recalled."
  },
  {
    id: "amazon",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![E-commerce Platform (Amazon / Flipkart) — high-level architecture (HLD)](diagrams/amazon.svg)",
    svgBase: "amazon",
    title: "a full e-commerce platform (Amazon / Flipkart style)",
    rawBody: "E-commerce capstone: availability-first browse and consistency-first checkout. Begin with indexed SQL; isolate catalog, search projections and optional recommendations when measured pressure justifies it. Committed catalog changes feed search through outbox/CDC. Product pages use bounded-stale price/stock; optional ETA/recommendations fail under separate deadlines. Checkout revalidates price and obtains acceptance for a changed quote. Order O901: Mira buys two shirt-blue-M at price v17, 1999 USD cents each, shipping300 and tax0: total4298. Persist that snapshot, reservation R901 expiring12:05 and stable payment P901. Durable reserve precedes payment; definitive decline releases the hold, timeout remains PAYMENT_UNKNOWN, success must confirm a valid reservation before fulfillment. Expired holds require fresh reservation or tracked refund. A durable saga/outbox resumes partial failures without new charges. Archive only eligible versions: copy, verify checksum/durability, record read-routing manifest, conditionally delete that same hot version. Concurrent refund/version changes prevent deletion. History merges hot and cold records by ID/version. DELIVERED is not immutable forever."
  },
  {
    id: "llm_serving",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![LLM Inference Serving — high-level architecture (HLD)](diagrams/llm_serving.svg)",
    svgBase: "llm_serving",
    title: "LLM inference serving / chatbot platform, where the crux is keeping expensive GPUs continuously busy",
    rawBody: "LLM serving: authenticate, enforce quota, screen input, choose model/adapter version and check a context/permission-scoped response cache. Cache hits still cross the current output gate. Misses enter a bounded queue with deadlines and KV admission for prompt PLUS maximum output. GPU fleet loads registry weights; chunked prefill protects decode deadlines, continuous batches replace finished sequences, and paged KV reduces allocation waste. Screen outputs before SSE delivery; whole-response screening changes the streaming/TTFT contract. EOS/cancellation/disconnect frees KV at safe boundaries. Example A1024 prompt/max4 output, B512/max2; B finishes step2, C256 joins after bounded prefill; A disconnects, reclaim A while C continues. Specific GQA:32 layers*8 KV heads*128 dimension*2 K/V*2 bytes=128KiB/token,4096 tokens=512MiB before other memory. Dense next-token attention still scans context O(t); caching avoids old K/V projection recomputation. Count actively decoding sequences, not open conversations. Use model/workload benchmarks, headroom and separate TTFT/inter-token budgets. Cache identity includes authorization epoch, conversation/system prompt, model/adapter, decoding settings and freshness."
  },
  {
    id: "rag",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![RAG / Semantic Search — high-level architecture (HLD)](diagrams/rag.svg)",
    svgBase: "rag",
    title: "RAG / semantic search system, drawn as two paths: an offline ingest path and an online query path converging at a shared LLM step",
    rawBody: "RAG splits ingest and query. Authorized source documents become stable document/version/chunk IDs, offsets, ACL metadata and embeddings. Publish a current-version manifest only when its lexical/vector index is queryable. Deletion/revocation updates authoritative gates and invalidates caches while physical cleanup may lag. Query: authenticate, permission-filtered hybrid recall, LIVE ACL/version/deletion check before text/context, rerank permitted chunks, enforce token and evidence budget, then abstain or generate with versioned citations. Recheck serving permissions and screen output. Retrieved text is untrusted evidence, not instructions. Maya asks about unopened headphones at20 days: refund/v8/c2 says30 days with receipt; v8/c3 deducts shipping unless defective. Reject superseded v7 and restricted VIP evidence despite higher similarity. Missing current evidence means allowed retry or abstention. Permission authority failure is fail-closed, not permission to use stale ACLs. Budget210ms retrieval/context +500ms generator TTFT +90ms network/slack=800ms. Quality example:20 questions,16 answerable,14 retrieved produces14 grounded answers and6 appropriate abstentions. Track retrieval, citation support, correctness and false answers separately."
  },
  {
    id: "recsys",
    chapterFile: "content/37_system_design_cases_scale_infra.md",
    existingImageLine: "![Recommendation Feed — high-level architecture (HLD)](diagrams/recsys.svg)",
    svgBase: "recsys",
    title: "recommendation feed system, a funnel narrowing from hundreds of millions of items to a final ranked list, with a training loop that keeps it fresh",
    rawBody: "Recommendation feed keeps an eligible popular/trending baseline for cold start. U42 gathers ANN700 + followed300 + trending200 candidates: union/dedup1000, eligibility600, cheap pruning500, feature fetch, heavy rank500, policy/diversity selects20. Example I17 creatorX score.81, I18 creatorX .80, I24 creatorY .73, I31 creatorZ .70: one creator per top3 yields I17,I24,I31. Allocate200ms:20 gateway +35 candidates +35 features +60 ranking +20 policy +15 serialization +15 slack; measure actual joint tails. A09:54 last-click feature is stale at10:00 under a2-minute limit: use a trained missing-value path and flag, or validated lightweight fallback within deadline. Log impression/model/feature versions. Training joins use both event time and feature availability at prediction time: imp81 at10:00 may use f12 available09:59, not a future click or f13 at10:02. Shared definitions alone do not establish point-in-time correctness. Define label maturity, new-user fallback, new-item exposure and quality guardrails for hides/reports, diversity and latency. Versioned training output feeds the ranker."
  },
];

module.exports = { buildPrompt, DIAGRAM_TARGETS };
