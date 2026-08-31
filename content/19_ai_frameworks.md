# Chapter 19 — AI Frameworks & Engineering

> The toolkit a 2026 AI engineer reaches for: agent frameworks, RAG stacks, vector DBs, evaluation tools, inference servers, and the MLOps glue around them.

You can build an LLM app with the raw OpenAI SDK and 100 lines of code. You can also build a house with a hammer and nails. Frameworks exist because at some point you stop wanting to re-implement retrieval, tracing, retries, structured output parsing, and tool dispatch on every project. This chapter is a tour of what's standard in 2026 — what each tool does, when to reach for it, and the smallest possible "hello world" so the names stop being abstract.

---

## Where you are

**Layer: SYSTEMS — *how you run it at scale*.** Part of **Deep Learning & LLMs** (Ch 16–20). ~145 min — the densest chapter in the section.

| | |
|---|---|
| **Read this before** | [Ch 17](#content/17_llm), [Ch 17b](#content/17b_llm_applications) and [Ch 18](#content/18_ai_agents) — this chapter names tools, those chapters explain the ideas |
| **On Track C** (shipping) | Essential — this is your toolbox |
| **On Track A** (interview) | Optional. Skim §19.9–§19.11 and §19.14 only; framework trivia is rarely asked, but **RAG design, evaluation and cost/latency are** |
| **Shelf life** | Shortest in the book. Framework versions move fast — trust the *decision trees*, not the version numbers |

**Full section map, tracks and the L1–L4 depth ladder → [Ch 16 — Deep Learning Reference](#content/16_deep_learning).**

### Covered in depth elsewhere

| If you are asked about… | Go to |
|---|---|
| Vector index internals — HNSW, IVF-PQ, hybrid search, reranking | [Ch 28 — Semantic Search](#content/28_semantic_search) |
| How the serving engines actually work — batching, KV cache, quantization, evaluation | [Ch 17c — LLM Systems](#content/17c_llm_systems) |
| GPU/TPU hardware, parallelism, serving throughput and cost per token | [Ch 29 — GPUs, TPUs & Infrastructure](#content/29_gpus_tpus_infrastructure) |
| General engineering tooling — Docker, Kubernetes, Terraform, CI | [Ch 22 — Engineering Tools](#content/22_engineering_tools) |
| Production ML practice — drift, monitoring, retraining | [Ch 27 — Practical ML](#content/27_practical_ml) |
| Real serving case studies at scale | [Ch 37 — Scale & Infra Cases](#content/37_system_design_cases_scale_infra) |

---

## What You'll Learn

By the end of this chapter you'll be able to:

- Pick the right agent framework for a given task (LangChain, LlamaIndex, DSPy, Pydantic AI, CrewAI, ADK).
- Write a working hello-world for each major framework.
- Choose a vector DB and design a modern RAG pipeline.
- Set up evaluation, tracing, and observability the way production teams actually do it.
- Serve LLMs efficiently with vLLM and know why TGI is no longer the default.
- Talk fluently about the MLOps lifecycle in a Google ML system design interview.
- Recognise common framework pitfalls before they cost you a week.

---

## 19.1 The 2026 AI Framework Landscape

A quick map of the territory, because the framework zoo grew fast:

```
                    ┌──────────────────────────────────────────┐
                    │           USER-FACING APP / UI           │
                    │       (Gradio, Streamlit, Next.js)       │
                    └────────────────────┬─────────────────────┘
                                         │
                    ┌────────────────────▼─────────────────────┐
                    │           API LAYER (FastAPI)            │
                    └────────────────────┬─────────────────────┘
                                         │
        ┌──────────────────┬─────────────┼──────────────┬──────────────────┐
        ▼                  ▼             ▼              ▼                  ▼
  ┌───────────┐     ┌────────────┐  ┌──────────┐  ┌────────────┐    ┌────────────┐
  │  AGENT    │     │   RAG /    │  │  TYPED   │  │   PROMPT   │    │ MULTI-AGENT│
  │FRAMEWORK  │     │   DATA     │  │  AGENTS  │  │  COMPILE   │    │FRAMEWORK   │
  │           │     │            │  │          │  │            │    │            │
  │LangChain  │     │LlamaIndex  │  │Pydantic  │  │   DSPy     │    │ LangGraph  │
  │ + LangGraph│    │ Workflows  │  │   AI     │  │            │    │ CrewAI     │
  │           │     │            │  │Instructor│  │            │    │ AutoGen/AG2│
  │           │     │            │  │          │  │            │    │ Google ADK │
  └─────┬─────┘     └──────┬─────┘  └────┬─────┘  └────┬───────┘    └─────┬──────┘
        └──────────────────┴─────────────┼─────────────┴──────────────────┘
                                         │
                    ┌────────────────────▼─────────────────────┐
                    │       MODEL LAYER & INFERENCE            │
                    │                                          │
                    │  HF transformers │ vLLM │ Ollama │ APIs  │
                    └────────────────────┬─────────────────────┘
                                         │
        ┌──────────────────┬─────────────┼──────────────┬──────────────────┐
        ▼                  ▼             ▼              ▼                  ▼
  ┌───────────┐     ┌────────────┐  ┌──────────┐  ┌────────────┐    ┌────────────┐
  │  VECTOR   │     │ EXPERIMENT │  │   EVAL   │  │TRACING /   │    │   MLOPS    │
  │     DB    │     │  TRACKING  │  │          │  │OBSERVABILITY│   │            │
  │           │     │            │  │ Ragas    │  │            │    │ MLflow 3.0 │
  │ pgvector  │     │ MLflow 3   │  │ DeepEval │  │ LangSmith  │    │ Vertex AI  │
  │ Pinecone  │     │ W&B Weave  │  │ promptfoo│  │ Phoenix    │    │ Kubeflow   │
  │ Qdrant    │     │ Neptune    │  │          │  │ Helicone   │    │ Airflow    │
  │ Weaviate  │     │            │  │          │  │            │    │            │
  └───────────┘     └────────────┘  └──────────┘  └────────────┘    └────────────┘
```

There are 50+ tools in this space; you only need to know the dozen that show up in 80% of production stacks. We cover each below.

---

## 19.2 LangChain 1.0 & LangGraph 1.0

> **LangChain** is an open-source framework that gives you composable components — prompt templates, retrievers, output parsers, model wrappers, agents — so you stop writing the same glue code on every project.

**LangChain 1.0** went generally available on **October 22, 2025**, alongside **LangGraph 1.0**. The big shift: LangChain itself is now thinner — its centerpiece is `create_agent`, the standard way to build a single agent. LangGraph is where you go when you need state, cycles, branching, persistence, or human-in-the-loop. Together they cover most of what you'd build.

### Hello world — a chain (LCEL)

LCEL ("LangChain Expression Language") is the pipe-syntax way to compose components. It looks Unix-y on purpose:

> Model IDs in examples are illustrative — swap in your current frontier/mini model (e.g. GPT-5.6, Claude Opus 4.8, Gemini 3.5 Pro).

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

chain = (
    ChatPromptTemplate.from_template("Explain {topic} in 3 bullets.")
    | ChatOpenAI(model="gpt-5.6", temperature=0)
    | StrOutputParser()
)

print(chain.invoke({"topic": "gradient descent"}))
```

That's a complete program: prompt → model → string. Swap any piece without touching the others.

### Hello world — an agent (`create_agent`)

```python
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """Look up current weather for a city."""
    return f"It's 72°F and sunny in {city}."

agent = create_agent(
    model=ChatOpenAI(model="gpt-4o"),
    tools=[get_weather],
    prompt="You are a concise travel assistant.",
)

result = agent.invoke({"messages": [("user", "What's the weather in Tokyo?")]})
print(result["messages"][-1].content)
```

The agent picks the tool, calls it, and uses the result — you didn't write the loop.

### Hello world — a stateful graph (LangGraph)

When the workflow has loops or branches (`research → draft → review → maybe revise → publish`), you want LangGraph:

```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict

class State(TypedDict):
    topic: str
    draft: str
    approved: bool

def draft_step(state):    return {"draft": f"A short essay on {state['topic']}."}
def review_step(state):   return {"approved": "essay" in state["draft"]}

graph = StateGraph(State)
graph.add_node("draft", draft_step)
graph.add_node("review", review_step)
graph.add_edge(START, "draft")
graph.add_edge("draft", "review")
graph.add_conditional_edges(
    "review",
    lambda s: "done" if s["approved"] else "draft",
    {"done": END, "draft": "draft"},
)
app = graph.compile()
print(app.invoke({"topic": "attention", "draft": "", "approved": False}))
```

LangGraph 1.0's headline features are **durable state** (the graph picks up where it left off after a crash), **built-in persistence** (resume agent runs days later), and **first-class human-in-the-loop pauses** for approvals — all things you'd otherwise hack together yourself.

### LangSmith — the debugging layer

When a chain returns nonsense, **LangSmith** shows you the full trace: every prompt sent, every retrieved doc, every tool call, every token of output. It's the single most useful tool for debugging an agent that's "almost working" and you can't tell why.

```python
import os
os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = "..."
# Now every chain/agent run shows up in the LangSmith UI automatically.
```

### When to reach for LangChain

| Use LangChain when... | Reach elsewhere when... |
|---|---|
| Building RAG, chatbots, agents, multi-step pipelines | You need maximum control of every byte (use raw SDK) |
| You want fast model/provider switching | Pure prompt-optimization research (use DSPy) |
| You want a standard the next engineer will recognise | Heavy data-ingest RAG with hundreds of file types (LlamaIndex) |
| You'll need tracing and evals later | A 50-line script (raw SDK is simpler) |

---

## 19.3 LlamaIndex Workflows 1.0

> **LlamaIndex** is a data framework specialised for **connecting LLMs to your data** — ingestion, parsing, chunking, indexing, retrieval. **Workflows** is its agent layer.

If LangChain is the generalist, LlamaIndex is the data specialist. **Workflows 1.0** shipped in **June 2025** as an event-driven, async-first agent runtime — small surface area, type-safe, built on top of Python `asyncio`.

### Hello world — RAG over a folder

```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("./data").load_data()  # auto-parses PDF, docx, md, html
index = VectorStoreIndex.from_documents(documents)        # chunk + embed + index

query_engine = index.as_query_engine()
print(query_engine.query("What were Q3 revenue drivers?"))
```

That's a working RAG pipeline. Three lines, no prompt template, no retriever config — sensible defaults all the way down.

### Hello world — a Workflow

```python
from llama_index.core.workflow import Workflow, StartEvent, StopEvent, step

class SimpleWorkflow(Workflow):
    @step
    async def respond(self, ev: StartEvent) -> StopEvent:
        return StopEvent(result=f"You asked: {ev.query}")

w = SimpleWorkflow()
result = await w.run(query="what is RAG?")
print(result)
```

Workflows are events-in, events-out. Each `@step` listens for a specific event type and emits the next one. That makes branching, parallel fan-out, and pause/resume natural — no graph DSL to learn, just async Python.

### LangChain vs LlamaIndex

| Dimension | LangChain | LlamaIndex |
|---|---|---|
| Sweet spot | Agents, multi-step apps, broad integrations | Document-heavy RAG, knowledge assistants |
| Mental model | Composable components / graph | Indexes + query engines + workflows |
| Document parsing | Functional but basic | Excellent (LlamaParse, 200+ format support) |
| Best for | Generalist AI app | "Chat with my N PDFs / wiki / data warehouse" |

Many production stacks use **both**: LlamaIndex for ingestion and retrieval, LangChain (or LangGraph) for the agent and tool-use layer.

---

## 19.4 DSPy — Programming, Not Prompting

> **DSPy** (Stanford NLP) treats prompts as code that the framework **compiles and optimises** for you. You declare *what* you want; DSPy figures out the prompt that gets the best score on your eval set.

This is a different paradigm. Instead of hand-tweaking `"You are a helpful expert. Think step by step. Format as JSON..."`, you write a **signature** (input → output types) and a **module**, then run an **optimizer** that searches the prompt space.

Latest stable is **DSPy 3.2.x** (April 2026). Reported gains: 10–40% quality improvement vs hand-written prompts on the same task.

### Hello world

```python
import dspy

dspy.configure(lm=dspy.LM("openai/gpt-4o-mini"))

# 1. Declare the task as a signature
class ClassifyEmail(dspy.Signature):
    """Classify customer emails by intent."""
    email: str = dspy.InputField()
    intent: str = dspy.OutputField(desc="one of: refund, complaint, question, other")

# 2. Wrap it in a module
classify = dspy.ChainOfThought(ClassifyEmail)

# 3. Run it (DSPy generates the prompt under the hood)
print(classify(email="My order arrived broken, I want my money back.").intent)
# -> 'refund'
```

### Compiling a prompt with MIPROv2

The big idea: give DSPy 20 labelled examples and an evaluator, and it will search prompt-instruction + demonstration combinations to maximise your metric.

```python
trainset = [dspy.Example(email=e, intent=i).with_inputs("email") for e, i in labelled_data]

optimizer = dspy.MIPROv2(metric=lambda gold, pred, trace: gold.intent == pred.intent)
compiled = optimizer.compile(classify, trainset=trainset)

compiled.save("classifier.json")  # Reusable optimised prompt
```

### When to use DSPy

- You have an eval set and care about quality numbers, not vibes.
- You want the prompt to keep working when you swap GPT-4o → Gemini → Claude.
- You're building a multi-stage pipeline (retrieve → reason → answer) and tuning each stage by hand is tedious.

Skip DSPy when you don't have evals — there's nothing for the optimizer to optimise against.

---

## 19.5 Pydantic AI — Type-Safe Agents

> **Pydantic AI** is an agent framework built around Pydantic's type system. Inputs, outputs, dependencies, and tool signatures are typed; your IDE and type checker catch most agent bugs at write-time instead of runtime.

From the Pydantic team (the validation library every Python project already uses). Production-friendly defaults: structured output validation with auto-retry, dependency injection, durable runs, MCP integration.

### Hello world — a typed agent with structured output

```python
from pydantic import BaseModel
from pydantic_ai import Agent

class WeatherReport(BaseModel):
    city: str
    temperature_c: float
    condition: str

agent = Agent(
    "openai:gpt-4o",
    output_type=WeatherReport,
    system_prompt="You are a weather assistant. Make up plausible numbers.",
)

result = agent.run_sync("What's the weather in Lisbon?")
print(result.output)            # WeatherReport(city='Lisbon', temperature_c=19.5, ...)
print(result.output.city)        # IDE autocomplete works
```

If the model returns invalid JSON or the wrong shape, Pydantic AI re-prompts the model with the validation error automatically. That alone removes a category of production bugs.

### Hello world — a tool

```python
@agent.tool_plain
def lookup_population(city: str) -> int:
    """Return the population of a city."""
    return {"Lisbon": 545000, "Tokyo": 13960000}.get(city, 0)
```

The tool's docstring + type hints become the JSON schema sent to the model. No manual schema writing.

**Instructor** is the cousin library if you don't need a full agent framework — it just wraps any OpenAI-compatible client to return Pydantic models with retry-on-validation-error.

---

## 19.6 Multi-Agent Frameworks: CrewAI vs AutoGen vs LangGraph

> **Multi-agent system**: multiple LLM-powered agents that collaborate by passing messages, calling each other as tools, or executing a defined workflow.

Three main frameworks. They model collaboration differently:

| Framework | Mental model | Sweet spot | 2026 status |
|---|---|---|---|
| **LangGraph** | Explicit state graph; you draw the workflow | Production agents needing durability, branching, HIL | **GA / production-ready** |
| **CrewAI** | Role-based "crews" (researcher, writer, reviewer) | Pipeline-style workflows, low learning curve | Active, growing |
| **AutoGen / AG2** | Conversational `GroupChat`, emergent coordination | Research, code-gen experiments | **Maintenance mode** (Microsoft pivoted to Agent Framework) |
| **Google ADK** | Code-first, multi-agent native, Vertex deploy | Enterprise GCP shops | Active (see §19.12) |

### Hello world — CrewAI

```python
from crewai import Agent, Task, Crew

researcher = Agent(role="Researcher", goal="Find facts on a topic", backstory="...")
writer     = Agent(role="Writer",     goal="Write a tight summary",  backstory="...")

t1 = Task(description="Research transformers.",         agent=researcher)
t2 = Task(description="Summarise in 5 bullets.", agent=writer, context=[t1])

crew = Crew(agents=[researcher, writer], tasks=[t1, t2])
print(crew.kickoff())
```

20 lines and you have a two-agent pipeline. CrewAI's strength is *speed of expression*; the cost is less control than LangGraph.

### How to pick

- **LangGraph** when production reliability matters and the workflow has loops/branches.
- **CrewAI** when you naturally describe the work as roles ("a researcher finds, a writer summarises").
- **AutoGen** if you're doing research; for new production work, prefer LangGraph or Microsoft's newer Agent Framework.
- **Raw OpenAI / Claude SDK** when you want zero abstraction tax.

A real warning: every agent turn in a `GroupChat` re-sends the full history. A 4-agent debate over 5 rounds = 20+ LLM calls. Multi-agent is expensive — quantify before adopting.

---

## 19.7 Hugging Face — The GitHub of Models

> **Hugging Face** hosts 1M+ pretrained models, 200K+ datasets, and thousands of demos (Spaces). The `transformers` library is the unified API to load and run almost any of them.

The core libraries you'll meet:

| Library | What it does |
|---|---|
| `transformers` | Load and run pretrained models (text, vision, audio, multimodal) |
| `datasets` | Stream/load any HF dataset |
| `trl` | Train models — SFT, DPO, GRPO, RLHF |
| `peft` | Parameter-efficient fine-tuning (LoRA, QLoRA, prompt tuning) |
| `accelerate` | Multi-GPU / multi-node launch glue |

### Hello world — inference

```python
from transformers import pipeline

classifier = pipeline("sentiment-analysis")
print(classifier("This chapter is incredibly helpful!"))
# [{'label': 'POSITIVE', 'score': 0.9998}]

summariser = pipeline("summarization", model="facebook/bart-large-cnn")
print(summariser(long_text, max_length=80)[0]["summary_text"])
```

### Hello world — LoRA fine-tuning with TRL + PEFT

LoRA freezes the base model and trains tiny rank-decomposition matrices on attention layers. Fewer than 1% of parameters trained, ~90% memory savings, near-equivalent quality.

```python
from datasets import load_dataset
from trl import SFTTrainer, SFTConfig
from peft import LoraConfig

dataset = load_dataset("HuggingFaceH4/instruction-dataset", split="train[:1000]")

lora = LoraConfig(
    r=16, lora_alpha=32, lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"],
    task_type="CAUSAL_LM",
)

trainer = SFTTrainer(
    model="meta-llama/Llama-3.2-1B",
    train_dataset=dataset,
    peft_config=lora,
    args=SFTConfig(output_dir="./lora-out", num_train_epochs=1, learning_rate=2e-4),
)
trainer.train()
trainer.save_model()  # Saves only the adapter — a few MB
```

**QLoRA** is the same recipe with the base model loaded in 4-bit — enough to fine-tune a 7B model on a single 24 GB GPU.

---

## 19.8 Prompt Engineering Patterns

> **Prompt engineering**: the practice of designing and structuring inputs to LLMs to get reliable, high-quality outputs.

DSPy is great when you have evals; before you do, you'll be writing prompts by hand. The patterns that matter:

### Zero-shot — describe the task, no examples

```
Classify this email as refund, complaint, question, or other.
Email: "My package never arrived."
Answer:
```

Works on strong models for common tasks. Fails on niche taxonomies.

### Few-shot — show the model 2–8 examples

```
Classify emails. Examples:
"Where is my order?" -> question
"This is broken." -> complaint
"I want my money back." -> refund

Classify: "Cancel my subscription, please."
Answer:
```

Few-shot is the single biggest quality lever after model choice. Almost always worth trying.

### Chain-of-Thought (CoT) — ask for reasoning before the answer

```
Q: A bat and ball cost $1.10. The bat costs $1 more than the ball. How much is the ball?
A: Let's think step by step.
```

CoT trades latency and tokens for accuracy on multi-step reasoning. With 2026 reasoning models (GPT-5.6, Claude Opus 4.8, Gemini 3.5 Thinking) it's often built in — you don't need to ask.

### Structured output — constrain to a schema

Don't parse free text. All major providers now support strict JSON schemas:

```python
from openai import OpenAI
from pydantic import BaseModel

class Intent(BaseModel):
    label: str
    confidence: float

resp = OpenAI().beta.chat.completions.parse(  # Pydantic parse helper lives under .beta
    model="gpt-5.6",
    messages=[{"role": "user", "content": "Classify: 'I want a refund.'"}],
    response_format=Intent,
)
print(resp.choices[0].message.parsed)  # Intent(label='refund', confidence=0.97)
```

Anthropic shipped strict JSON-schema **Structured Outputs** in 2025; Gemini 2.5+ supports full JSON Schema; **Instructor** wraps all three behind one Pydantic-typed API.

### The big four prompt sins

1. Asking the model to do too much in one call (split into steps).
2. Not showing examples when the task is non-obvious.
3. Burying the instruction in the middle of long context (models attend to ends — put critical instructions at the bottom).
4. Treating prompt strings as throwaway. **Version them like code.** MLflow 3 and LangSmith both have prompt registries.

---

## 19.9 Vector Databases & Modern RAG

### The vector DB landscape (2026)

| DB | Best for | Notes |
|---|---|---|
| **pgvector** | <10M vectors, already on Postgres | Right default for most teams; one less system to run |
| **Qdrant** | High-throughput open source | Fastest open-source p99 (~12 ms at 10M); Rust-based |
| **Weaviate** | Hybrid search out of the box | Vector + BM25 + filters native |
| **Pinecone** | Managed service, zero ops | Easiest to operate; usage-based pricing |
| **Milvus / Zilliz** | Billions of vectors | Distributed deployments at scale |
| **Chroma** | Local dev, prototyping | In-process; great for notebooks |
| **Vespa** | Search + ranking + ML in one | What Yahoo built; complex but powerful |

### Picking one

```
                            How many vectors?
                                   │
                ┌──────────────────┼───────────────────┐
                ▼                  ▼                   ▼
              <10M              10M–1B               >1B
                │                  │                   │
        Already on Postgres?      Self-host?         Self-host?
            │       │             │     │             │     │
           yes      no           yes    no           yes    no
            │       │             │     │             │     │
        pgvector  Pinecone   Qdrant /   Pinecone    Milvus  Zilliz
                  / Chroma   Weaviate /            / Vespa  Cloud
                             Milvus
```

A 2026 reality check: **pure vector search underperforms hybrid** (vector + BM25 + metadata filters) on most workloads. Names, IDs, version numbers, and SKUs need exact match; meaning needs vectors. Use both. Weaviate, Vespa, and Qdrant ship hybrid natively.

### Modern RAG — beyond vanilla

Vanilla RAG is `chunk → embed → top-k → stuff into prompt`. By 2026, every step has a sharper alternative for a specific failure mode:

| Vanilla fails when... | Modern fix | What it does |
|---|---|---|
| Question and doc use different words | **HyDE** | Generate a hypothetical answer; embed *that*; retrieve against it |
| Vector match misses an exact ID/SKU | **Hybrid search** | Vector + BM25 union |
| Top-5 by similarity ≠ top-5 by meaning | **Reranking** | Cross-encoder rescores top 20 → keep best 3 |
| Chunk is meaningless on its own | **Contextual chunking** | Prepend doc summary to each chunk |
| Question is vague or multi-part | **Query rewriting** | LLM splits into sub-queries; retrieve per sub-query |
| Not every Q needs retrieval | **Agentic RAG** | LLM decides *whether* and *what* to retrieve, as a tool call |
| Facts are relational | **Graph RAG** | Retrieve subgraphs from a knowledge graph |

You don't need all seven. Bolt them on as you hit each failure.

> **Going deeper on retrieval itself:** the index internals — HNSW graph construction, IVF-PQ, BM25, and **reciprocal rank fusion (RRF)** for merging hybrid results — live in **[Ch 28 — Semantic Search](#content/28_semantic_search)**. **Semantic caching** (skipping the model entirely on similar questions) is in [Ch 17c §2.4](#content/17c_llm_systems). This section is about *which tool to pick*; those chapters are about *how it works*.

### GraphRAG, multimodal RAG and fine-tuned embeddings ★★

Three variants worth more than the one-line entries above.

**GraphRAG** — for questions vanilla RAG structurally cannot answer.

Vector RAG retrieves the *k* chunks most similar to the query. That fails on **global** questions ("what are the main themes across these 500 documents?") because no single chunk contains the answer, and on **multi-hop** questions ("which of our suppliers is affected by the port closure?") where the answer requires joining facts that live in different documents.

```
  Vanilla RAG:   query ──▶ top-k similar chunks ──▶ answer
                 (fails when the answer is spread across many chunks)

  GraphRAG:      documents ──▶ extract entities + relations ──▶ knowledge graph
                            ──▶ cluster into communities
                            ──▶ pre-summarise each community
                 query ──▶ traverse graph / read community summaries ──▶ answer
```

The build step is expensive — an LLM pass over the whole corpus to extract entities and relationships, then community detection and summarisation. **Use it when the corpus is stable and the questions are global or relational.** For "find the passage that answers this", vanilla RAG plus a reranker wins on both cost and latency.

**Multimodal RAG** — when the answer is in a chart, not the prose. Two approaches: caption every image with a vision model and index the captions (simple, lossy), or use a **multimodal embedding model** to put images and text in one vector space and retrieve directly (better, and it handles diagrams and screenshots that captioning flattens). Document-heavy domains — finance, engineering, medical — are usually the ones that need it.

**Fine-tuning the embedding model** — the retrieval lever people forget. Off-the-shelf embeddings are trained on general text and can be poor at domain vocabulary where two terms look similar to a general model but mean different things to a specialist. Fine-tune with **contrastive learning** on (query, relevant passage, irrelevant passage) triples. You need surprisingly few — a few thousand pairs, and you can bootstrap them from click logs or by generating synthetic queries per chunk with an LLM. Ordering of effort: **better base embedding model → reranker → fine-tuned embeddings**, because the first two are far cheaper.

### Choosing an embedding model ★★★


"Just use OpenAI embeddings" is the answer that ends an interview early. The real decision has five axes:

| Axis | Question to ask | Why it bites |
|---|---|---|
| **Task match** | Retrieval, or semantic similarity? | They are *different* MTEB tasks. A model that tops STS can underperform on retrieval |
| **Domain** | Legal, medical, code, multilingual? | General-purpose models degrade sharply on specialised vocabulary |
| **Dimension** | 384 / 768 / 1536 / 3072? | Storage and query latency scale with it. Many models now support Matryoshka truncation — take the first 512 dims and lose very little |
| **Max sequence length** | Does it truncate your chunks? | A 512-token limit silently cuts long chunks in half |
| **Hosting** | API or self-hosted? | Embeddings are called on *every* document *and* every query — the volume is far higher than generation |

**MTEB** (Massive Text Embedding Benchmark) is the standard leaderboard. Use it correctly:

- Filter to the **Retrieval** task, not the overall average — the average blends in tasks you don't care about.
- Treat gaps under ~2 points as noise, then choose on dimension, latency and cost.
- **Always re-rank the shortlist on your own data.** Public benchmarks are broad; your corpus is narrow. A 50-query hand-labelled set beats the leaderboard every time.

> **Interview soundbite:** "I'd shortlist from MTEB's retrieval task rather than the overall average, filter by max sequence length and dimension for my latency budget, then evaluate the top two or three on a small hand-labelled set from my own corpus — because leaderboard rank rarely survives a domain shift. Switching to a stronger embedding model and adding a reranker are the two highest-leverage RAG changes."

### The production concerns nobody demos ★★★

Every RAG demo ignores these. Every RAG *system* has to solve them.

| Concern | The problem | The approach |
|---|---|---|
| **Multi-tenancy & ACLs** | User A must never retrieve User B's documents — and a vector search has no natural notion of permission | Store tenant and ACL as **metadata**, filter *before* or during search, not after. Post-filtering silently shrinks your top-k and can return nothing. For strong isolation use a namespace or collection per tenant |
| **Right to erasure (GDPR)** | A user demands deletion. Their text is in chunks, in embeddings, and possibly in a cache | Keep a source-document → chunk-ID mapping so deletes are surgical. Verify the vector store *hard*-deletes rather than tombstoning. Purge caches keyed on that content too |
| **Freshness** | The index is a snapshot; the source moves | Incremental upsert on change events rather than nightly full rebuilds; store a version or timestamp per chunk and expose it in citations |
| **Citation integrity** | The model cites a chunk that doesn't support the claim | Return chunk IDs with the answer and validate that quoted spans actually appear in the retrieved text |

**The ACL mistake worth remembering:** filtering *after* retrieval. If you retrieve the top 20 globally and then drop the ones the user can't see, a user with narrow permissions may end up with two results — or zero — while the system reports success. Filter inside the query.

### Hello world — RAG with reranking (LangChain + Cohere Rerank)

```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.retrievers import ContextualCompressionRetriever
from langchain_cohere import CohereRerank

base = Chroma.from_documents(docs, OpenAIEmbeddings()).as_retriever(search_kwargs={"k": 20})
reranker = ContextualCompressionRetriever(
    base_compressor=CohereRerank(top_n=3, model="rerank-v3.5"),
    base_retriever=base,
)
hits = reranker.invoke("How does PagedAttention work?")
```

Retrieve 20, rerank to 3, send to the LLM. Single biggest quality win after switching to a stronger embedding model.

---

## 19.10 Evaluation & Observability

> **LLM evaluation**: measuring the quality, safety, and cost of LLM outputs without a closed-form correctness test.

LLM apps don't have a "right vs wrong" oracle. You need three layers:

1. **Offline evals** — curated test set, run every release.
2. **Online evals** — LLM-as-judge sampling live traffic.
3. **Tracing** — see every prompt, retrieval, tool call, and intermediate step.

### The 2026 toolbox

| Tool | What it's good for |
|---|---|
| **MLflow 3.0** | Unified ML + GenAI lifecycle, 50+ metrics, prompt registry, OpenTelemetry tracing |
| **W&B Weave** | Evals + tracing + dashboards; great for teams already on W&B |
| **LangSmith** | Tracing + evals, deepest LangChain integration |
| **Ragas** | Reference-free RAG metrics (faithfulness, relevance, context quality) |
| **DeepEval** | Pytest-style LLM unit tests; CI/CD friendly |
| **promptfoo** | CLI prompt testing, regression detection, red-team |
| **Arize Phoenix** | Open-source tracing, OpenTelemetry-native |
| **Langfuse** | Open-source, self-hostable tracing + evals + prompt management — the usual pick when data cannot leave your infrastructure |
| **Braintrust** | Enterprise eval dashboards + experiment tracking |

The pattern most teams converge on: **one CI tool + one platform.** Pair Ragas/DeepEval (gating in CI) with LangSmith/Braintrust (annotation, regressions, dashboards).

> **The self-hosting fork.** LangSmith, Braintrust and Weave are hosted SaaS — every prompt and completion you trace leaves your network. In regulated environments that is a blocker, and **Langfuse** or **Arize Phoenix** (both open-source and self-hostable) become the answer. Ask "can traces leave our VPC?" before choosing, because migrating an observability stack later is painful. Both emit **OpenTelemetry**, so instrument against OTel semantics rather than a vendor SDK and the switch stays cheap.

### Prompt versioning — treat prompts as deployable artefacts ★★

A prompt is the highest-leverage, least-governed thing in an LLM system. One person edits one line and behaviour changes for every user, with no build, no review and no rollback.

| Practice | Why |
|---|---|
| **Version every prompt** with an ID and hash | So a trace can record *which* prompt produced it |
| **Store prompts in git**, not in a database someone edits live | You get review, blame, and revert for free |
| **Tie prompt version to eval results** | "v7 scored 0.82 on the golden set" is the only basis for promoting it |
| **Pin the model version alongside it** | A prompt that works on one snapshot may regress on the next |
| **Roll out like code** — canary, then full | A prompt change is a production deploy, not a config tweak |

A **prompt registry** (MLflow 3, LangSmith and Langfuse all provide one) gives you the version-plus-eval-plus-trace linkage in one place. The minimum viable version is prompts in git with the hash logged on every request.

> **The incident question this answers:** "quality dropped at 14:00 — what changed?" Without prompt versioning you cannot distinguish a prompt edit from a model update from a retrieval regression. With it, that is one query.

### Hello world — Ragas RAG eval

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision
from datasets import Dataset

data = Dataset.from_dict({
    "question":          ["What is PagedAttention?"],
    "answer":            ["A memory-efficient KV-cache algorithm in vLLM."],
    "contexts":          [["PagedAttention partitions the KV cache into fixed-size blocks..."]],
    "ground_truth":      ["KV cache partitioning method introduced by vLLM."],
})

scores = evaluate(data, metrics=[faithfulness, answer_relevancy, context_precision])
print(scores)  # {'faithfulness': 0.95, 'answer_relevancy': 0.91, 'context_precision': 0.88}
```

### Hello world — DeepEval (Pytest)

```python
from deepeval import assert_test
from deepeval.metrics import AnswerRelevancyMetric
from deepeval.test_case import LLMTestCase

def test_relevance():
    case = LLMTestCase(
        input="What's the capital of France?",
        actual_output="Paris is the capital.",
    )
    assert_test(case, [AnswerRelevancyMetric(threshold=0.7)])
```

Run with `deepeval test run test_app.py` — same workflow as `pytest`.

### Hello world — MLflow 3.0 GenAI tracing

```python
import mlflow

mlflow.openai.autolog()              # one line, traces every call
mlflow.set_experiment("rag-pipeline")

with mlflow.start_run():
    answer = chain.invoke({"question": "What is PagedAttention?"})
    # Trace, prompt, response, latency, cost — all logged automatically.
```

### Standard agent benchmarks (cite the date — scores drift)

| Benchmark | Measures | April 2026 frontier |
|---|---|---|
| **SWE-bench Verified** | Real GitHub bug fixes (Python) | Claude Opus 4.7 ~87.6%; GPT-5 Codex ~85% |
| **GAIA** | General assistant tasks (browser + tools) | Low-40s%, scaffolding-sensitive |
| **WebArena / VisualWebArena** | Long-horizon web navigation | Still unsolved |
| **OSWorld** | Full computer use | 30–40% |
| **τ-bench** (TAU) | Multi-turn tool use | Strong on τ-retail, weaker on τ-airline |

---

## 19.11 Inference Servers — Serving LLMs at Scale

> **Inference server**: a process that loads model weights and exposes a request/response API, optimised for throughput, latency, and GPU memory.

### The 2026 hierarchy

```
  ┌─────────────────────────────────────────────────────────────┐
  │  LOCAL DEV / SINGLE USER                                    │
  │  ──────────────────────────────────────────────────────     │
  │  Ollama        — easiest, "docker run a model"              │
  │  llama.cpp     — CPU-friendly, GGUF                          │
  │  LM Studio     — GUI for the above                           │
  │                                                              │
  │  PRODUCTION SERVING                                          │
  │  ──────────────────────────────────────────────────────     │
  │  vLLM          — DEFAULT. PagedAttention, broad HW support   │
  │  SGLang        — fast for structured/agent workloads         │
  │  TensorRT-LLM  — peak NVIDIA performance, complex setup      │
  │  TGI           — ⚠ MAINTENANCE MODE since 2026; migrate      │
  │                                                              │
  │  ORCHESTRATION                                               │
  │  ──────────────────────────────────────────────────────     │
  │  Ray Serve, Triton, NVIDIA Dynamo                            │
  └─────────────────────────────────────────────────────────────┘
```

**Big news in 2026: HuggingFace put TGI into maintenance mode** and explicitly recommends vLLM, SGLang, or llama.cpp instead. If you're still on TGI in production, plan the migration.

### vLLM is the default — why?

**PagedAttention**: vLLM partitions the KV cache into fixed-size blocks (like OS virtual memory pages) so requests can share memory without fragmentation. Net effect: 5–10× throughput on the same GPU under concurrent load. Red Hat benchmark on identical hardware: vLLM peaked at **793 tokens/sec** vs Ollama's 41 (Ollama is a single-user/local runtime, so this is apples-to-oranges — it isn't built for concurrent serving); p99 time-to-first-token **80 ms** vs 673 ms. Stripe cut inference cost 73% migrating to vLLM.

### Hello world — Ollama (local dev)

```bash
ollama pull llama3.2
ollama run llama3.2 "Explain attention in 3 bullets."
```

Or as an API:

```python
import requests
r = requests.post("http://localhost:11434/api/generate",
                  json={"model": "llama3.2", "prompt": "Hi", "stream": False})
print(r.json()["response"])
```

### Hello world — vLLM (production)

```bash
pip install vllm
python -m vllm.entrypoints.openai.api_server \
    --model meta-llama/Llama-3.1-8B-Instruct \
    --port 8000
```

Now hit `http://localhost:8000/v1/chat/completions` with the **OpenAI client** — vLLM is OpenAI-API-compatible:

```python
from openai import OpenAI
c = OpenAI(base_url="http://localhost:8000/v1", api_key="not-needed")
print(c.chat.completions.create(
    model="meta-llama/Llama-3.1-8B-Instruct",
    messages=[{"role":"user","content":"Hi"}],
).choices[0].message.content)
```

Most teams: **Ollama for dev, vLLM for prod.**

---

## 19.12 The Google AI Engineer Stack

If you're interviewing at Google, you must know this stack — they invented half of it.

### Vertex AI (now Gemini Enterprise Agent Platform)

At **Google Cloud Next 2026**, Google rebranded Vertex AI to **Gemini Enterprise Agent Platform** and merged it with Agentspace. The components you'll talk about:

| Component | What it is |
|---|---|
| **Agent Development Kit (ADK)** | Open-source, code-first agent framework (Python, Go, Java, TS); multi-agent native |
| **Agent Engine** | Managed runtime — handles deployment, scaling, sessions, memory |
| **Agent Builder** | Console + low-code surface for non-engineers |
| **Vertex AI Pipelines** | Kubeflow pipelines, managed |
| **Vertex AI Feature Store** | Online/offline feature serving |
| **Model Garden** | Curated model catalog (Gemini, Llama, Mistral, Anthropic) |
| **Genkit** | Lighter open-source GenAI framework — broad model support, simpler than ADK |

### Hello world — ADK agent

```python
from google.adk import Agent
from google.adk.tools import google_search

root_agent = Agent(
    name="search_assistant",
    model="gemini-3.5-flash",
    description="Answers questions using Google Search.",
    instruction="Be concise and cite sources.",
    tools=[google_search],
)

# Local dev:
# adk run search_assistant
# Deploy:
# adk deploy agent_engine --project=my-gcp --region=us-central1
```

ADK's strength is **enterprise scale + GCP-native**: deploy with one command, get authenticated tools, IAM, audit logs, and Vertex tracing for free. Genkit is the lighter option when you don't need multi-agent orchestration.

### When ADK vs Genkit vs LangChain

- **ADK** — multi-agent, enterprise compliance, deploying on Google Cloud.
- **Genkit** — single agents or pipelines, broad model support, minimal ceremony.
- **LangChain** — neutral framework, multi-cloud, biggest community.

---

## 19.12a Model Access — Bedrock vs Azure OpenAI vs Vertex ★★★

**In one line:** most enterprises do not call OpenAI or Anthropic directly — they call them *through* a cloud provider, and the reason is almost never price.

**Why it exists.** Job descriptions ask for "AWS Bedrock" or "Azure OpenAI" far more often than they ask for the raw provider SDKs. The reason is procurement and compliance: the model already sits inside a cloud account you have a contract, a security review and a data-processing agreement with.

| Route | Models it fronts | Why teams pick it |
|---|---|---|
| **AWS Bedrock** | Anthropic, Meta, Mistral, Cohere, Amazon Nova | The standard path to Claude in an AWS shop. Contractual guarantee that prompts are not used for training; stays inside your VPC |
| **Azure OpenAI** | OpenAI models | **Region pinning.** You choose the deployment region, which is what makes EU data-residency commitments possible |
| **Google Vertex AI** | Gemini, plus a model garden | Native fit for GCP; the only first-party route to Gemini at enterprise scale |
| **Direct provider API** | Whatever that provider ships | Newest features first, simplest to start, best docs |

**The trade-off worth stating:** going through a cloud provider costs you *time to newest model* — a new frontier release often lands on the direct API weeks before it appears in Bedrock or Azure — and buys you compliance, a single bill, existing IAM, and private networking. Startups take the direct API; regulated enterprises take the cloud route; plenty of teams run both behind a routing layer.

### Data residency, air-gapped and the questions procurement will ask

| Requirement | What it actually means | How it is met |
|---|---|---|
| **Data residency** | Prompts and completions must be processed in a named region | Azure OpenAI region-pinned deployments; Bedrock in-region endpoints. **Not** satisfiable on most direct APIs |
| **No training on our data** | The provider must not train on your inputs | Enterprise tiers and cloud routes contract for this; free tiers frequently do not |
| **Private networking** | Traffic must never traverse the public internet | VPC endpoints / Private Link |
| **Air-gapped** | No external network at all — defence, classified, some healthcare | Self-hosted open-weight models only. No API is an option here |
| **SOC 2 / ISO 27001** | Audited controls, evidenced | Inherit the provider's attestations, but *your* application still needs its own |

> **The interview answer that lands:** "I'd choose the model access route from the compliance requirement first and the model quality second, because a model I'm contractually not allowed to send this data to has quality zero. Region pinning via Azure, or Bedrock for Claude inside AWS. If the requirement is genuinely air-gapped, no API is viable and I'm self-hosting an open-weight model — which changes the whole architecture, so it's the first question I'd ask, not the last."

---

## 19.12b Governance — OWASP, Model Cards & Documentation ★★

**In one line:** the artefacts you produce so that someone else can audit what you shipped.

### OWASP Top 10 for LLM Applications

The standard vocabulary for LLM risk. You are expected to recognise the list and name the top entry:

| ID | Risk | Where it is covered here |
|---|---|---|
| **LLM01** | **Prompt injection** — still number one | [Ch 18b §18.10](#content/18b_agents_in_production) |
| LLM02 | Sensitive information disclosure | §19.12a above; PII filtering |
| LLM03 | Supply chain (models, adapters, MCP servers) | [Ch 18 §18.3](#content/18_ai_agents) — tool poisoning, rug pulls |
| LLM04 | Data and model poisoning | Training-data provenance |
| LLM05 | Improper output handling | Treat model output as untrusted input — escape it, never `eval` it |
| LLM06 | Excessive agency | [Ch 18b §18.14](#content/18b_agents_in_production) — least privilege, approval gates |
| LLM07 | System prompt leakage | Assume the prompt is public; never put secrets in it |
| LLM08 | Vector and embedding weaknesses | [Ch 19 §19.9](#content/19_ai_frameworks) — multi-tenant ACLs |
| LLM09 | Misinformation | Grounding, citations, abstention |
| LLM10 | Unbounded consumption | Budgets and rate limits |

**LLM05 is the one engineers under-rate.** Model output routinely flows into a shell, a SQL string, an HTML page or a downstream API call. It is user-controlled data from an untrusted source — the same class of bug as XSS or SQL injection, and it gets treated as trusted because it "came from our model".

### Model cards and the paper trail

A **model card** documents what a model is for: intended use, out-of-scope uses, training-data summary, evaluation results **broken out by relevant subgroup**, known limitations, and version. A **system card** does the same for the whole application, including the guardrails around the model.

They matter for three practical reasons: EU AI Act transparency obligations for general-purpose models, enterprise procurement that will ask for one, and the internal question "which version shipped, evaluated how?" during an incident.

| Artefact | Answers |
|---|---|
| Model card | What is this model for, and where does it fail? |
| System card | What does the whole product do, and what guards it? |
| Eval report | How do we know it works, on which data, at which version? |
| Data sheet | Where did the training or retrieval data come from, and may we use it? |

---

## 19.12c The Rest of the Stack — Data, Infra and the Job Itself ★★

Job descriptions for AI engineers ask for a good deal that is not an LLM framework. This section closes that gap; each item links to its full treatment.

### The data layer

Retrieval has to be fed, and evaluation has to be measured — both need somewhere to put data.

| Tool | Role in an AI system | Depth |
|---|---|---|
| **PostgreSQL + pgvector** | The most common vector store in practice — one database for rows *and* embeddings, no new infrastructure | [Ch 19 §19.9](#content/19_ai_frameworks) · [Ch 24](#content/24_system_design_data_distributed) |
| **Snowflake / BigQuery** | Content warehouse feeding the embedding pipeline; where the source of truth for documents usually lives | [Ch 24](#content/24_system_design_data_distributed) |
| **ClickHouse** | OLAP store for traces, token counts and eval results — the thing your quality dashboards query | [Ch 24](#content/24_system_design_data_distributed) |
| **Kafka / streaming** | Change events that trigger incremental re-indexing, so retrieval stays fresh | [Ch 24](#content/24_system_design_data_distributed) |

**The pattern worth naming:** documents live in the warehouse, embeddings live in the vector store, traces and metrics live in the OLAP store. Conflating them — especially putting traces in your transactional database — is a common early mistake that gets expensive quickly.

### The infrastructure layer

| Skill | Why an AI engineer needs it | Depth |
|---|---|---|
| **Docker** | The unit of deployment for every serving stack | [Ch 22](#content/22_engineering_tools) |
| **Kubernetes** | How GPU workloads are scheduled and scaled in most companies | [Ch 22](#content/22_engineering_tools) · [Ch 25](#content/25_system_design_operations_case_studies) |
| **Terraform / IaC** | GPU quota, VPC endpoints and IAM are infrastructure — clicking them in a console is not reproducible | [Ch 22](#content/22_engineering_tools) |
| **CI/CD** | Where your golden-set evals run and block a bad prompt from shipping | [Ch 22](#content/22_engineering_tools) |

### Compliance you will be asked about

**SOC 2** is the audit most enterprise buyers require: evidence that you have controls over security, availability and confidentiality, and that you *follow* them. For an AI feature the questions that actually get asked are concrete — where does prompt data go, who can read traces, how long are they retained, is the provider contractually barred from training on your data, and can you delete a customer's data on request ([§19.9](#content/19_ai_frameworks)). Inheriting a provider's SOC 2 covers the model endpoint; it does **not** cover your application.

### The role itself

The JD landscape shifted, and knowing the vocabulary helps you target the right posting:

| Profile | What they actually do |
|---|---|
| **AI Product Engineer** | The dominant 2026 hiring profile: full-stack plus LLMs plus evals plus RAG. Ships user-facing features end to end |
| **AI Platform Engineer** | Builds the shared internal layer — gateway, eval harness, tracing, model routing — that product teams build on |
| **ML / Research Engineer** | Training, fine-tuning, post-training. The chapter's distributed-training and post-training material targets this |
| **Forward Deployed Engineer (FDE)** | Embeds with a customer, builds the integration and the evals against *their* data, feeds requirements back. Heavy travel, high ambiguity, growing fast |
| **Inference / Performance Engineer** | Serving throughput and cost — [Ch 17c](#content/17c_llm_systems) is the chapter for this role |

> **Reading the JD:** "evals" and "RAG" in the requirements means product engineering. "Distributed training", "FSDP" or "CUDA" means research or infra. "Customer-facing" plus "travel" means FDE. The same title covers all of these, so read the responsibilities rather than the heading.

---

## 19.13 MLOps — The Production Discipline

> **MLOps**: the practice of deploying, monitoring, and maintaining ML/AI systems in production reliably and at scale — DevOps for ML.

The lifecycle, expanded:

```
  ┌─────────────────────────────────────────────────────────────┐
  │   ┌──────┐    ┌───────┐    ┌────────┐    ┌──────┐    ┌────┐ │
  │   │ Data │ ──►│ Train │ ──►│Evaluate│ ──►│Deploy│ ──►│Mon-│ │
  │   │      │    │       │    │        │    │      │    │itor│ │
  │   └──┬───┘    └───┬───┘    └────────┘    └──────┘    └─┬──┘ │
  │      │            │                                      │   │
  │      ▼            ▼                                      │   │
  │   ┌─────────┐  ┌──────────┐                              │   │
  │   │ Feature │  │ Experim. │              ┌─────────┐     │   │
  │   │  Store  │  │ Tracking │ ◄───────────►│  Drift  │ ◄───┘   │
  │   │  (Feast)│  │ (MLflow) │              │Detection│         │
  │   └─────────┘  └──────────┘              └────┬────┘         │
  │                                                │              │
  │                              ┌─────────────────┘              │
  │                              ▼                                │
  │                          Retrain ──────────────────► loop     │
  └─────────────────────────────────────────────────────────────┘
```

### The toolkit by stage

| Stage | Tools |
|---|---|
| Data versioning | DVC, LakeFS |
| Feature store | Feast, Tecton, Vertex AI Feature Store |
| Experiment tracking | **MLflow 3.0**, W&B, Neptune |
| Training | PyTorch, JAX, TensorFlow |
| Model registry | MLflow, Vertex AI Model Registry |
| Serving | FastAPI, **vLLM**, TF Serving, Triton |
| Monitoring | Evidently AI, Whylabs, Arize |
| Pipeline orchestration | Kubeflow, Airflow, Vertex Pipelines, Dagster |
| CI/CD for ML | GitHub Actions, Jenkins, **CML** (Continuous ML) |

### Hello world — FastAPI model serving

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class PredictRequest(BaseModel):
    text: str

@app.post("/predict")
def predict(req: PredictRequest):
    return {"prediction": model.predict(req.text), "confidence": 0.95}

# uvicorn main:app --host 0.0.0.0 --port 8000
```

### Hello world — Gradio demo

```python
import gradio as gr

def classify(text):
    return classifier(text)[0]

gr.Interface(fn=classify, inputs="text", outputs="json").launch()
```

Built-in support for images, audio, video, file upload — perfect for ML demos.

### Hello world — Streamlit dashboard

```python
import streamlit as st

st.title("Model Demo")
text = st.text_input("Enter text")
if text:
    st.json(classifier(text))
```

Better than Gradio for data dashboards and internal tools.

### Hello world — MLflow experiment tracking

```python
import mlflow

mlflow.set_experiment("churn-model")
with mlflow.start_run():
    mlflow.log_param("lr", 0.001)
    mlflow.log_metric("auc", 0.92)
    mlflow.sklearn.log_model(model, "model")
```

The interview tip every Google ML system design candidate should internalise: **always mention monitoring and retraining**. "Deploy and forget" is the single biggest red flag in a system design interview.

---

## 19.14 Cost, Latency, Reliability

> **Production LLM system**: an LLM app that has to meet real-world SLOs on cost, latency, and reliability — not just demo quality.

### Cost levers (in order of impact)

| Lever | Typical savings | How |
|---|---|---|
| **Prompt caching** | 50–90% on repeated prefixes | Claude, OpenAI, Gemini all support |
| **Model routing** | 30–80% | Easy queries → Haiku/Flash/GPT-5.6 nano; hard ones → Opus/Pro/GPT-5.6 |
| **Batch APIs** | 50% | Async batches on Anthropic / OpenAI |
| **Provider failover** | varies | OpenRouter, LiteLLM cascade across providers |
| **Smaller embedding model** | 5–10× retrieval cost | Often within 1% quality |

### Latency levers

- **Streaming** — send tokens as they're generated; faster TTFT.
- **Parallel tool calls** — independent calls fire concurrently.
- **KV-cache reuse** — across multi-turn conversations (vLLM, SGLang).
- **Edge inference** — small local models for hot paths (Llama 3.2 1B/3B, Gemini Nano, Phi-4-mini).

### Reliability patterns

- **Structured outputs** — strict JSON schema; eliminates parser failures.
- **Guardrails** — input/output filters (NeMo Guardrails, Llama Guard, Claude built-ins).
- **Fallback cascade** — on timeout → cheaper model → different provider.
- **Timeout budgets** — per step, per task, per session.
- **Idempotency keys** — on tools that cost money (don't double-charge a card if the agent retries).

---

## 19.15 Decision Tree — Pick the Right Tool

```
  What are you building?
            │
            ├── Single LLM call, 50 lines        → Raw OpenAI/Anthropic SDK
            │
            ├── Chat-with-my-PDFs / wiki         → LlamaIndex
            │
            ├── Agent with tools, prod-grade     → LangChain + LangGraph
            │
            ├── Multi-agent with roles           → CrewAI
            │
            ├── Multi-agent with conversation    → AutoGen (research) or LangGraph (prod)
            │
            ├── Type-safe agent, validation      → Pydantic AI or Instructor
            │
            ├── Optimise prompts with evals      → DSPy
            │
            ├── Building on Google Cloud         → ADK + Agent Engine
            │
            ├── Fine-tune / LoRA                 → HuggingFace TRL + PEFT
            │
            └── Serve a model at scale           → vLLM
```

---

## 19.16 What Goes Wrong (Pitfalls)

1. **Adopting a framework before you have evals.** You'll churn through three frameworks before realising the problem was your prompt or your retrieval.
2. **Multi-agent for everything.** Every agent turn is an LLM call. A 4-agent debate is 20× the cost of a single well-prompted agent. Justify the agents.
3. **Treating prompts as throwaway strings.** Version them, eval them, store them in a registry (MLflow, LangSmith).
4. **Skipping reranking in RAG.** Single biggest quality win after embeddings.
5. **Vector-only retrieval.** Hybrid (vector + BM25) wins on real workloads.
6. **TGI in new projects.** It's in maintenance mode. Use vLLM.
7. **No monitoring.** "Deploy and forget" gets red-flagged in interviews and breaks in production within weeks.
8. **Mocking the LLM in eval.** Production drift will fool you. Hit the real model with cached responses if you must.

---

## 19.17 Interview Questions

**Q1. When would you choose LangGraph over LangChain?**
LangChain is enough for linear chains and a single-agent loop with tools. Use LangGraph when the workflow needs cycles, branching, durable state across crashes, or human-in-the-loop pauses — e.g. a multi-day approval workflow or an agent that loops between research and refine until a check passes.

**Q2. LangChain vs LlamaIndex — when each?**
LangChain is the generalist (agents, tools, broad integrations). LlamaIndex is specialised for connecting LLMs to data — better document parsing, chunking, and retrieval primitives. Many production stacks use LlamaIndex for the RAG layer and LangChain/LangGraph for the agent layer.

**Q3. Why is DSPy interesting?**
It treats prompts as code that gets compiled. You declare a signature (input → output types) and provide an eval set; DSPy's optimisers (MIPROv2, BootstrapFewShot) search the prompt space. Reported 10–40% quality gains over hand-written prompts and the prompt keeps working when you swap models.

**Q4. Why has TGI fallen out of favour in 2026?**
HuggingFace formally moved TGI into maintenance mode and recommends vLLM, SGLang, or llama.cpp. New features and model support land elsewhere. vLLM's PagedAttention also gives 5–10× throughput vs older serving stacks.

**Q5. Walk me through evaluating a RAG system.**
Three layers. **Offline**: a curated test set scored on faithfulness (answer matches sources), context precision (relevant chunks retrieved), answer relevancy. Tools: Ragas, DeepEval. **Online**: LLM-as-judge sampling live traffic. Tools: LangSmith, Braintrust. **Tracing**: every retrieval, prompt, tool call. Tools: LangSmith, Phoenix, MLflow 3.

**Q6. How would you choose a vector DB?**
Three axes: scale, ops, hybrid-search needs. <10M vectors and already on Postgres → pgvector. 10M–1B → Qdrant/Weaviate/Milvus self-hosted, or Pinecone managed. >1B → Vespa or distributed Milvus. If exact-match (IDs, names, version numbers) matters, prefer one with native hybrid search (Weaviate, Qdrant, Vespa).

**Q7. Name three failure modes of vanilla RAG and the fix for each.**
- Wording mismatch → **HyDE** (generate hypothetical answer, embed *that*).
- Top-k by similarity ≠ top-k by meaning → **reranker** (Cohere Rerank, BGE).
- Multi-part question → **query rewriting** (LLM splits into sub-queries).

**Q8. What's prompt caching and why does it matter?**
Providers charge ~90% less for tokens that hit a cached prefix (system prompt, long instructions, retrieved docs). For a chatbot whose system prompt is 2,000 tokens, this is the single biggest cost lever. Anthropic, OpenAI, and Gemini all support it.

**Q9. Walk me through deploying a fine-tuned LLM at Google.**
Fine-tune with HuggingFace TRL + PEFT (LoRA/QLoRA) → log experiments to MLflow / W&B → register in Vertex AI Model Registry → deploy to Vertex AI Endpoint or Agent Engine → monitor with Vertex AI Model Monitoring (data drift, prediction drift) → retrain on schedule or trigger.

**Q10. What's the role of structured outputs in production?**
LLM responses constrained to a JSON Schema at decode time. Eliminates parser failures, JSON fence noise, and the "sometimes the model decides to add a preamble" class of bugs. OpenAI Structured Outputs, Anthropic Structured Outputs (2025 GA), Gemini JSON Schema, and Pydantic AI / Instructor as cross-provider wrappers.

---

## 19.18 Key Takeaways

- **Frameworks are leverage, not a substitute for taste.** Pick by mental model fit, not popularity.
- **LangChain 1.0 + LangGraph 1.0** (Oct 2025) are the safe production default for general agents.
- **LlamaIndex** wins when the value is in the data, not the agent loop.
- **DSPy** if you have evals and care about prompt quality numbers.
- **Pydantic AI** if you want types and validation in your agent.
- **vLLM** is the default inference server. **TGI is in maintenance mode** — migrate.
- **Hybrid search beats pure vector** on most production RAG workloads.
- **Reranking** is the single biggest RAG quality win after embeddings.
- **Prompt caching** is the single biggest cost lever after model choice.
- **MLflow 3.0** unified ML and GenAI lifecycles in 2025 — one tool for both.
- "Deploy and forget" is a system design red flag. **Always plan monitoring and retraining.**

---

## 19.19 Review Questions

1. You're building a "chat with my company's 10K PDFs" app. Which framework do you reach for first, and why?
2. A junior engineer wires every feature through CrewAI by default. What's the cost concern, and when *should* you choose CrewAI?
3. Your RAG pipeline retrieves the right document but the model answers wrong. List three things you'd check first.
4. Your team has 50M monthly chatbot calls. Two cost levers above all else — which?
5. You're standing up a vector DB for an internal app (~5M docs, team already runs Postgres). Pick one and defend it.
6. A teammate says "we'll evaluate after launch." Why is that wrong, and what minimum bar should you ship with?
7. Why is TGI no longer the default inference server in 2026? What replaced it and why?
8. Walk through the MLOps lifecycle of a production GenAI app, naming a tool for each stage.
9. When does Pydantic AI beat raw `openai.chat.completions.parse(...)` with a Pydantic schema?
10. You hit `lost-in-the-middle` on a 200K-token prompt. Three concrete fixes.

---

**Previous:** [Chapter 18 — AI Agents & Tool Use](18_ai_agents.md) | **Next:** [Chapter 20 — The 2026 AI Landscape](20_2026_landscape.md)
