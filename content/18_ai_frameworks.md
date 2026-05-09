# Chapter 18 — AI Frameworks & Engineering

> The tools and frameworks you use to build production AI applications — from LangChain to MLOps, RAG to observability.

---

## 6b. LangChain Ecosystem — The Most Popular AI Framework

> **LangChain** is an open-source framework that provides composable abstractions for building LLM-powered applications — chains, agents, tools, memory, and retrieval — so you wire components together instead of writing everything from scratch.

Think of LangChain as the "React of AI apps." You don't build a web app by writing raw DOM manipulation — you use React components. Similarly, LangChain gives you pre-built components (retrievers, prompt templates, output parsers, agents) that snap together.

### Core Concepts

```
  ┌─────────────────────────────────────────────────────────────┐
  │                    LANGCHAIN ARCHITECTURE                    │
  │                                                              │
  │  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐ │
  │  │  Prompt   │──►│   LLM    │──►│  Output  │──►│  Result  │ │
  │  │ Template  │   │  (GPT,   │   │  Parser  │   │         │ │
  │  │          │   │  Gemini, │   │  (JSON,  │   │         │ │
  │  │          │   │  Claude) │   │  Pydantic)│   │         │ │
  │  └──────────┘   └──────────┘   └──────────┘   └─────────┘ │
  │       ▲                                                     │
  │       │                                                     │
  │  ┌────┴─────┐   ┌──────────┐   ┌──────────┐               │
  │  │ Memory   │   │Retriever │   │  Tools   │               │
  │  │(history) │   │(vector DB│   │(search,  │               │
  │  │          │   │ + docs)  │   │ APIs)    │               │
  │  └──────────┘   └──────────┘   └──────────┘               │
  └─────────────────────────────────────────────────────────────┘
```

| Concept | What it does | Example |
|---|---|---|
| **Chain** | A sequence of steps: prompt → LLM → parse | Summarization chain, Q&A chain |
| **Agent** | An LLM that decides which tools to call and in what order | "Search the web, then summarize results" |
| **Tool** | A function the agent can invoke | Web search, calculator, database query, API call |
| **Memory** | Stores conversation history for multi-turn chat | Buffer memory, summary memory, vector memory |
| **Retriever** | Fetches relevant documents from a vector DB | ChromaDB retriever, FAISS retriever |
| **Prompt Template** | A parameterized prompt with variables | `"Summarize this: {text}"` |
| **Output Parser** | Parses LLM output into structured format | JSON parser, Pydantic parser |
| **Callback** | Hooks into chain execution for logging/tracing | LangSmith, custom logging |

### LCEL — LangChain Expression Language (Modern Syntax)

The old `Chain` classes are deprecated. Modern LangChain uses LCEL — a pipe-based syntax:

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Modern LCEL: pipe components together
chain = (
    ChatPromptTemplate.from_template("Explain {topic} in 3 bullet points")
    | ChatOpenAI(model="gpt-4o", temperature=0)
    | StrOutputParser()
)

result = chain.invoke({"topic": "gradient descent"})
print(result)
```

### RAG with LangChain (5 lines of real code)

```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA

# Load docs into vector DB (one-time)
vectorstore = Chroma.from_documents(documents, OpenAIEmbeddings())

# Create RAG chain
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4o"),
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
)

answer = qa.invoke("What is Flash Attention?")
```

### LangGraph — Stateful Multi-Step Agents

> **LangGraph** extends LangChain for agents that need explicit state management, cycles, and conditional branching — things a simple chain can't do.

Use LangChain for linear workflows. Use LangGraph when the agent needs to loop, branch, or maintain complex state across steps.

```python
from langgraph.graph import StateGraph, START, END

# Define a graph where the agent can loop between "think" and "act"
graph = StateGraph(dict)
graph.add_node("think", think_fn)
graph.add_node("act", act_fn)
graph.add_edge(START, "think")
graph.add_conditional_edges("think", should_act, {"yes": "act", "no": END})
graph.add_edge("act", "think")  # loop back
app = graph.compile()
```

### LangSmith — Observability & Debugging

LangSmith traces every LLM call, retrieval, and tool invocation in your chain. When your RAG gives a wrong answer, LangSmith shows: which documents were retrieved, what prompt was sent, what the LLM returned, and where it went wrong. Essential for production debugging.

### When to Use LangChain vs Alternatives

```
  ┌──────────────────────┬───────────────────────────────────────────┐
  │ USE LANGCHAIN WHEN   │ DON'T USE LANGCHAIN WHEN                  │
  ├──────────────────────┼───────────────────────────────────────────┤
  │ Building RAG apps    │ Simple API wrapper (just use OpenAI SDK)  │
  │ Multi-step agents    │ You need maximum control over every call  │
  │ Prototyping fast     │ Extremely latency-sensitive (overhead)    │
  │ Integrating many     │ You dislike framework abstractions        │
  │ tools/providers      │                                           │
  │ Team needs standards │ Solo project with simple requirements     │
  └──────────────────────┴───────────────────────────────────────────┘
```

---

## 6c. LlamaIndex — Data Framework for LLMs

> **LlamaIndex** is a data framework that makes it easy to ingest, structure, and query your data with LLMs — optimized specifically for RAG and knowledge retrieval.

If LangChain is a general-purpose AI framework, LlamaIndex is a specialist for **connecting LLMs to your data**. It handles document parsing, chunking, indexing, and retrieval with much less code than building it yourself.

```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

# Load all docs from a folder, chunk, embed, index — one line
documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents)

# Query
engine = index.as_query_engine()
response = engine.query("What are the key findings in the Q3 report?")
```

**LangChain vs LlamaIndex:** LangChain for general AI apps (agents, chains, tools). LlamaIndex for data-heavy RAG where document ingestion quality matters most. Many production systems use both.

---

## 6d. The Modern AI Engineering Toolkit

These tools appear in nearly every production AI system. Know what each does and when to reach for it.

### Hugging Face — The GitHub of ML Models

> **Hugging Face** is the platform where the ML community shares models, datasets, and spaces (hosted demos). The `transformers` library provides a unified API to load and run 400K+ pretrained models.

```python
from transformers import pipeline

# Sentiment analysis in 2 lines
classifier = pipeline("sentiment-analysis")
result = classifier("This chapter is incredibly helpful!")
# [{'label': 'POSITIVE', 'score': 0.9998}]

# Summarization
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
summary = summarizer(long_text, max_length=100)
```

**What to know for interviews:** Hugging Face Hub (model hosting), `transformers` library (load any model), `datasets` library (load any dataset), Spaces (hosted demos with Gradio), PEFT/LoRA (efficient fine-tuning).

### MLflow & Weights & Biases — Experiment Tracking

> **Experiment tracking** logs every training run's hyperparameters, metrics, and artifacts so you can compare runs, reproduce results, and debug regressions.

| Tool | Strengths | Best for |
|---|---|---|
| **MLflow** | Open-source, model registry, deployment | Teams wanting full ML lifecycle, self-hosted |
| **Weights & Biases (W&B)** | Beautiful dashboards, easy setup, collaboration | Experiment tracking, hyperparameter sweeps |

```python
import wandb

wandb.init(project="my-model")
wandb.config = {"lr": 0.001, "epochs": 10, "batch_size": 32}

for epoch in range(10):
    train_loss = train_one_epoch()
    val_acc = evaluate()
    wandb.log({"train_loss": train_loss, "val_acc": val_acc, "epoch": epoch})
# Dashboard at wandb.ai shows curves, comparisons, hyperparameter importance
```

### Gradio & Streamlit — Build ML Demos in Minutes

> **Gradio** and **Streamlit** let you wrap any Python function in a web UI with a few lines of code — essential for demos, prototypes, and internal tools.

```python
# Gradio: ML demo in 4 lines
import gradio as gr

def classify(text):
    return classifier(text)[0]

gr.Interface(fn=classify, inputs="text", outputs="json").launch()
```

```python
# Streamlit: data app in 5 lines
import streamlit as st

st.title("ML Model Demo")
text = st.text_input("Enter text:")
if text:
    st.json(classifier(text))
```

**When to use which:** Gradio for ML model demos (built-in support for images, audio, video). Streamlit for data dashboards and internal tools.

### FastAPI — Serving ML Models as APIs

> **FastAPI** is a high-performance Python web framework for building APIs. It's the standard way to serve ML models behind REST endpoints.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class PredictRequest(BaseModel):
    text: str

@app.post("/predict")
def predict(req: PredictRequest):
    result = model.predict(req.text)
    return {"prediction": result, "confidence": 0.95}

# Run: uvicorn main:app --host 0.0.0.0 --port 8000
```

**Why FastAPI over Flask:** Async by default (handles concurrent requests), automatic OpenAPI docs, Pydantic validation, type hints. Flask is simpler but FastAPI is the modern standard for ML serving.

### MLOps — The Bigger Picture

> **MLOps** is the practice of deploying, monitoring, and maintaining ML models in production reliably and at scale — the "DevOps of ML."

```
  THE MLOPS LIFECYCLE:
  ════════════════════════════════════════════════════════

  Data ──► Train ──► Evaluate ──► Deploy ──► Monitor ──► Retrain
   │                                           │            │
   └──── Feature Store                         └── Drift ───┘
                                               Detection

  KEY TOOLS BY STAGE:
  ┌──────────────────┬────────────────────────────────────────┐
  │ Stage            │ Tools                                  │
  ├──────────────────┼────────────────────────────────────────┤
  │ Data versioning  │ DVC, LakeFS                            │
  │ Feature store    │ Feast, Tecton, Vertex AI Feature Store │
  │ Experiment track │ MLflow, W&B, Neptune                   │
  │ Training         │ PyTorch, JAX, TensorFlow               │
  │ Model registry   │ MLflow, Vertex AI Model Registry       │
  │ Serving          │ FastAPI, TF Serving, vLLM, Triton      │
  │ Monitoring       │ Evidently AI, Whylabs, Prometheus      │
  │ Pipeline orch.   │ Kubeflow, Airflow, Vertex Pipelines    │
  │ CI/CD for ML     │ GitHub Actions, Jenkins, CML           │
  └──────────────────┴────────────────────────────────────────┘
```

**Interview tip:** When designing ML systems, always mention monitoring and retraining. "Deploy and forget" is the biggest red flag in a system design interview.

---


---

## 10. Modern RAG & Context Engineering

> **Retrieval-Augmented Generation (RAG)**: at question time, the app **looks up relevant text** from a corpus the model wasn't trained on, then **passes that text along with the question** so the model can answer using information it wouldn't otherwise know.

An LLM knows roughly what was in its training data. It does *not* know your company's wiki, your user's last 30 days of orders, or the PDF the user uploaded 10 seconds ago. RAG closes that gap without fine-tuning — a retrieval step glued to an inference step.

### How vanilla RAG works (2022–2023 baseline)

Two phases.

**Index phase** — done ahead of time:

```
    docs            chunker            embedder              vector DB
┌───────────┐   ┌─────────────┐   ┌───────────────┐   ┌────────────────────┐
│ wiki .md  │──►│ split into  │──►│ one vector    │──►│ id, chunk, vector  │
│ PDF, etc  │   │ 500-token   │   │ per chunk     │   │ stored for fast    │
│           │   │ chunks      │   │ (OpenAI,      │   │ similarity lookup  │
│           │   │             │   │  Cohere, BGE) │   │                    │
└───────────┘   └─────────────┘   └───────────────┘   └────────────────────┘
```

**Query phase** — on every user question:

```
                              embed             cosine search
                          ┌───────────┐     ┌──────────────────┐
  "how do refunds work?" ►│ embedder  │────►│ vector DB returns│
                          └───────────┘     │  top-5 chunks    │
                                            └────────┬─────────┘
                                                     ▼
                              ┌──────────────────────────────────┐
                              │  prompt = system + top-5 chunks  │
                              │         + user question          │
                              │  ──► LLM ──► answer              │
                              └──────────────────────────────────┘
```

That's vanilla RAG — it powered the first wave of "chat with your docs". By 2026 every piece has a sharper alternative, because the baseline fails in predictable ways.

### Why vanilla RAG is no longer the bar

Each modern technique fixes a specific failure mode.

| Vanilla RAG fails when... | The fix | What it does |
|---|---|---|
| Question and doc use different words ("cancel subscription" vs "stop recurring payment") | **HyDE** | Generate a hypothetical answer; embed *that*; retrieve against it |
| A vector match misses an exact-match need (error code, SKU, phone number) | **Hybrid search** | Combine dense-vector search with lexical BM25; union top-k |
| Top-5 by similarity aren't top-5 by meaning | **Reranking** | A cross-encoder rescores top 20 → pick best 3 |
| A chunk is meaningless on its own (starts mid-sentence) | **Contextual chunking** | Prepend a short doc summary to each chunk |
| Question is vague or multi-part | **Query rewriting** | LLM splits into sharper sub-queries; retrieve per sub-query |
| Not every question needs retrieval (trivia, small talk) | **Agentic RAG** | LLM decides *whether* and *what* to retrieve, as a tool call |
| Facts are relational (org chart, product taxonomy) | **Graph RAG** | Retrieve subgraphs from a knowledge graph |

You don't need all seven. Bolt them on as you hit their specific failure modes.

### What is a context window?

> **Context window**: the total number of tokens (≈ word pieces) the LLM sees in a single call — system prompt, conversation history, tool outputs, retrieved docs, **and** the response being generated all share one budget.

Four things to internalize:

- **Tokens ≠ words.** In English, ~4 characters per token. "hello" = 1 token; "internationalization" = ~5. Code and non-English text tokenize worse.
- **Everything counts.** User messages, system prompt, past turns, retrieved docs, tool results, and the output being generated all share one limit.
- **Going over fails.** Providers either silently drop earlier tokens or return an error. Both are bad.
- **Bigger isn't automatically better.** Attention degrades in the middle of very long contexts — the "lost in the middle" effect. A 2 M-token window doesn't mean the model weights all 2 M tokens equally.

Sizes scaled fast: 8 K (GPT-3.5, 2022) → 32 K (GPT-4) → 200 K (Claude 3) → 1 M (Gemini 1.5, Claude Sonnet 4.6 beta) → 10 M (Llama 4 Scout). That growth is why RAG moved from "fit everything you can" to **context engineering** — picking *what* goes in.

### Context engineering

With 200 K–2 M tokens available, the bottleneck stopped being "will it fit" and became "will the model actually read it".

- **Context caching** — reuse prefix tokens across turns (system prompt, long instructions, retrieved docs). All major providers charge ~90% less for cached prefix tokens — biggest cost lever.
- **Context compression** — summarize old turns or distant chunks before they slide out of effective attention.
- **Attention anchoring** — put the most important constraint right before the generation point; models attend more to context ends.
- **Structured layout** — XML/JSON tags (`<document>...</document>`, `<user_question>...`) beat flat prose for recall.
- **Needle-in-haystack evals** — plant known canary facts at different depths; measure whether the model retrieves them.

The through-line: **long context ≠ useful context**. A 2 M-token window is a canvas, not an invitation to paint every pixel.

---

## 11. Evaluation & Observability

> **LLM evaluation**: measuring quality, safety, and cost of LLM outputs without a closed-form correctness test.

LLM apps have no "correct vs wrong" like normal software. You need other ways to check them.

- **Offline evals** — a curated test set, run every release.
- **Online evals** — an LLM-as-judge samples live traffic and scores it.
- **Tracing** — see every tool call, retrieval, and intermediate step.
- **A/B tests** — compare prompts/models on real users.

### Tools

| Tool | Focus |
|---|---|
| **LangSmith** | Tracing + evals, deep LangChain integration |
| **Braintrust** | Offline eval + experiment dashboards |
| **Humanloop** | Prompt management + evals |
| **Helicone** | Open-source observability proxy |
| **Arize Phoenix** | Open-source tracing, OpenTelemetry native |
| **Weights & Biases Weave** | Enterprise evals + tracing |

### Common metrics

- **Faithfulness** — answer matches retrieved sources?
- **Relevance** — does it address the question?
- **Groundedness** — free of made-up facts?
- **Tool selection accuracy** — right tool for the job?
- **Step efficiency** — how many LLM and tool calls per task?

### Standard agent benchmarks

| Benchmark | Measures | Top public score (April 2026) |
|---|---|---|
| **SWE-bench Verified** | Real-world GitHub bug fixes (Python) | Claude Opus 4.7 ~87.6%; GPT-5 Codex ~85% |
| **GAIA** | General assistant tasks (browser + tools) | Low-40s%; sensitive to scaffolding |
| **WebArena / VisualWebArena** | Web-navigation tasks | Still unsolved for long horizons |
| **OSWorld** | Full OS computer use | Computer-use agents at 30–40% |
| **TAU-bench** | Tool-use reasoning | Frontier solid on τ-retail, weaker on τ-airline |

Scores drift monthly — always cite the date.

---

## 12. Cost, Latency, and Reliability

> **Production LLM system**: an LLM app that has to meet real-world service-level targets on cost, latency, and reliability — not just demo quality.

### Cost levers

- **Prompt caching** — 10×+ cheaper on repeated prefixes (Claude, OpenAI, Gemini).
- **Model routing** — easy queries → Haiku / Flash / o4-mini; hard ones → Opus / Pro / o3.
- **Batch APIs** — 50% discount for async batches (Anthropic, OpenAI).
- **Provider failover** — **OpenRouter** and **LiteLLM** abstract across providers and cascade on failure.

### Latency levers

- **Streaming** — send tokens as they come; faster time-to-first-token.
- **Parallel tool calls** — run independent calls at the same time.
- **KV-cache reuse** — across multi-turn conversations.
- **Edge inference** — small local models for hot paths (Llama 3.2 1B/3B, Gemini Nano, Phi-4-mini). Llama 4 is open-weight but its MoE layout is hard to ship on-device.

### Reliability: structured outputs

> **Structured output**: an LLM response constrained to a machine-readable schema (usually JSON) the app can parse without LLM-as-judge.

Unstructured text is hostile to pipelines — "sometimes the model forgets the JSON, sometimes it adds ```json fences". Structured outputs fix that at the decoding layer.

| Provider | Feature | Notes |
|---|---|---|
| **OpenAI** | **Structured Outputs** (strict) | JSON Schema; grammar-constrained decoding guarantees conformance. Pydantic / Zod supported. |
| **Anthropic** | **Structured Outputs** (public beta, 2025) | Strict JSON Schema or tool-spec conformance on the Claude Developer Platform. |
| **Google Gemini** | Full JSON Schema on 2.5+ / 3+ | Also via OpenAI-compatibility endpoint; Pydantic works directly. |
| **Cross-provider** | **Instructor** (Python) | Wraps all three, returns a typed Pydantic model; retries on schema failure. |

### Other reliability patterns

- **Guardrails** — input/output filters (NeMo Guardrails, Llama Guard, Claude's built-ins).
- **Fallback cascades** — on timeout → cheaper model → different provider.
- **Timeout budgets** — per step, per task, per session.
- **Idempotency keys** on tools that cost money (don't double-charge a card because the agent retried).

---


---

**Previous:** [Chapter 17 — AI Agents & Tool Use](17_ai_agents.md) | **Next:** [Chapter 19 — The 2026 AI Landscape](19_2026_landscape.md)
