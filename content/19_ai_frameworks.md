# Chapter 19 — AI Frameworks & Engineering

> The toolkit a 2026 AI engineer reaches for: agent frameworks, RAG stacks, vector DBs, evaluation tools, inference servers, and the MLOps glue around them.

You can build an LLM app with the raw OpenAI SDK and 100 lines of code. You can also build a house with a hammer and nails. Frameworks exist because at some point you stop wanting to re-implement retrieval, tracing, retries, structured output parsing, and tool dispatch on every project. This chapter is a tour of what's standard in 2026 — what each tool does, when to reach for it, and the smallest possible "hello world" so the names stop being abstract. Library versions and APIs were checked against the official docs in **November 2026**.

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

- Pick the right agent framework for a given task (LangChain, LlamaIndex, DSPy, Pydantic AI, CrewAI, Microsoft Agent Framework, ADK).
- Write a working hello-world for each major framework.
- Choose a vector DB and design a modern RAG pipeline.
- Set up evaluation, tracing, and observability the way production teams actually do it.
- Serve LLMs efficiently with vLLM and know why TGI is no longer the default.
- Talk fluently about the MLOps lifecycle in a Google ML system design interview.
- Recognise common framework pitfalls before they cost you a week.

---

## 19.1 The 2026 AI Framework Landscape

![Infographic of the AI framework stack as of Nov 2026: five layers top to bottom (UI: Gradio, Streamlit, Next.js; API: FastAPI; frameworks: LangChain + LangGraph, LlamaIndex + Workflows, Pydantic AI and Instructor, DSPy, multi-agent LangGraph, CrewAI, MS Agent Framework, Google ADK; model and inference: HF transformers, vLLM, Ollama, APIs; vector DB, experiment tracking, eval, tracing and MLOps tools), a restaurant analogy, and a pick-by-question table of sensible defaults per layer.](diagrams/fw19_info_framework_landscape_ai.png)

<details>
<summary><strong>Read as text</strong> — the restaurant analogy, the layer map and the sensible defaults</summary>

**Simple explanation:** an LLM app is a stack of layers, like a restaurant. The dining room is the UI, the waiter is the API, the recipes are the frameworks, the stove is the model and its server, and the pantry and the inspectors are the vector database, evaluation, tracing and MLOps. Each layer has a few standard tools; this map shows which tool sits where.

```
                     ┌──────────────────────────────────────────────┐
                     │             USER-FACING APP / UI             │
                     │         (Gradio, Streamlit, Next.js)         │
                     └───────────────────────┬──────────────────────┘
                                             │
                     ┌───────────────────────▼──────────────────────┐
                     │             API LAYER (FastAPI)              │
                     └───────────────────────┬──────────────────────┘
                                             │
         ┌─────────────────┬─────────────────┼─────────────────┬─────────────────┐
         ▼                 ▼                 ▼                 ▼                 ▼
  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
  │    AGENT    │   │  RAG / DATA │   │    TYPED    │   │    PROMPT   │   │ MULTI-AGENT │
  │  FRAMEWORK  │   │             │   │    AGENTS   │   │   COMPILE   │   │             │
  │             │   │             │   │             │   │             │   │             │
  │  LangChain  │   │  LlamaIndex │   │ Pydantic AI │   │     DSPy    │   │  LangGraph  │
  │ + LangGraph │   │ + Workflows │   │  Instructor │   │             │   │    CrewAI   │
  │             │   │             │   │             │   │             │   │ MS Agent Fwk│
  │             │   │             │   │             │   │             │   │  Google ADK │
  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
         └─────────────────┴─────────────────┼─────────────────┴─────────────────┘
                                             │
                     ┌───────────────────────▼──────────────────────┐
                     │           MODEL LAYER & INFERENCE            │
                     │                                              │
                     │    HF transformers │ vLLM │ Ollama │ APIs    │
                     └───────────────────────┬──────────────────────┘
                                             │
         ┌─────────────────┬─────────────────┼─────────────────┬─────────────────┐
         ▼                 ▼                 ▼                 ▼                 ▼
  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
  │  VECTOR DB  │   │  EXPERIMENT │   │     EVAL    │   │  TRACING /  │   │    MLOPS    │
  │             │   │   TRACKING  │   │             │   │OBSERVABILITY│   │             │
  │   pgvector  │   │             │   │    Ragas    │   │             │   │   MLflow 3  │
  │   Pinecone  │   │   MLflow 3  │   │   DeepEval  │   │  LangSmith  │   │    Agent    │
  │    Qdrant   │   │     W&B     │   │  promptfoo  │   │   Langfuse  │   │   Platform  │
  │   Weaviate  │   │             │   │             │   │   Phoenix   │   │   Kubeflow  │
  │    Milvus   │   │             │   │             │   │             │   │   Airflow   │
  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

*MS Agent Fwk* = Microsoft Agent Framework, the successor to AutoGen (§19.6). LangGraph appears twice: it is the runtime under LangChain agents *and* the usual way to wire several agents together.

| Layer | The question it answers | Sensible default (November 2026) |
|---|---|---|
| UI and API | How do people and other systems call it? | Gradio or Streamlit for demos; FastAPI for the service |
| Framework | Who runs the prompt → tool → answer loop? | LangChain `create_agent`; LangGraph when the flow has state, loops or approvals |
| Model and inference | Which model, served where? | A hosted API; vLLM for open weights ([§19.11](#content/19_ai_frameworks)) |
| Data | Where does the knowledge come from? | pgvector or a managed vector DB ([§19.9](#content/19_ai_frameworks)) |
| Quality | Is it good, and what happened on a bad run? | One eval tool + one tracing tool ([§19.10](#content/19_ai_frameworks)) |

There are dozens of tools in this space, but only a dozen or so keep showing up in production stacks. We cover each below.

</details>

---

## 19.2 LangChain & LangGraph

> **LangChain** is an open-source framework that gives you composable components — prompt templates, retrievers, output parsers, model wrappers, agents — so you stop writing the same glue code on every project.

![Infographic on LangChain and LangGraph: an LCEL chain prompt template to chat model to output parser, and a LangGraph graph START to draft to review to an approved? check, yes to END and no back to draft, with state saved after every step under thread_id essay-1 and an interrupt for human approval; key versions as of Nov 2026 (1.0 GA Oct 2025, now LangChain 1.4 and LangGraph 1.2), a table of durable execution, persistence and human-in-the-loop, and when to use or skip LangChain.](diagrams/fw19_info_langchain_langgraph_ai.png)

<details>
<summary><strong>Read as text</strong> — parts box vs graph engine, and what changed in 1.0</summary>

**Simple explanation:** LangChain is a box of standard parts (model wrappers, prompt templates, tools, retrievers) plus one ready-made agent loop. **LangGraph** is the engine underneath: it runs your steps as a graph, saves the state after every step, and can pause to wait for a human.

**LangChain 1.0** and **LangGraph 1.0** went generally available together in **October 2025**; as of November 2026 the current releases are LangChain 1.4 and LangGraph 1.2. The big shift in 1.0: LangChain became thinner. Its centrepiece is `create_agent`, the standard way to build a single agent (it replaced `langgraph.prebuilt.create_react_agent`). You customise it with **middleware** — hooks that run before or after each model or tool call, with built-ins to summarise long histories, redact PII or require human approval. Older chains, retrievers and the prompt hub moved to a separate **`langchain-classic`** package. LangGraph is where you go when you need state, cycles, branching, persistence or human-in-the-loop. LangChain also ships **Deep Agents**, a ready-made harness (planning, sub-agents, a file system) built on LangGraph.

</details>

### Hello world — a chain (LCEL)

<details>
<summary><strong>Read as text</strong> — prompt → model → string with the pipe syntax</summary>

LCEL ("LangChain Expression Language") is the pipe-syntax way to compose components. It looks Unix-y on purpose:

> Model IDs in this chapter were checked in November 2026 against the vendors' model pages ([Ch 17 §4](#content/17_llm)). Swap in whatever is current when you read this.

```python
# Runs locally: pip install langchain-openai; needs OPENAI_API_KEY
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

MODEL = "gpt-6-luna"  # OpenAI's low-cost tier as of Nov 2026

chain = (
    ChatPromptTemplate.from_template("Explain {topic} in 3 bullets.")
    | ChatOpenAI(model=MODEL)
    | StrOutputParser()
)

print(chain.invoke({"topic": "gradient descent"}))
```

That's a complete program: prompt → model → string. Swap any piece without touching the others. (There is no `temperature=0`: some reasoning models reject custom sampling settings, so the example keeps the defaults.)

</details>

### Hello world — an agent (`create_agent`)

<details>
<summary><strong>Read as text</strong> — a one-tool agent where you never write the loop</summary>

```python
# Runs locally: pip install langchain langchain-openai; needs OPENAI_API_KEY
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

@tool
def get_weather(city: str) -> str:
    """Look up current weather for a city."""
    return f"It's 22°C and sunny in {city}."

agent = create_agent(
    model=ChatOpenAI(model="gpt-6-luna", use_responses_api=True),  # OpenAI wants the Responses API for tools
    tools=[get_weather],
    system_prompt="You are a concise travel assistant.",
)

result = agent.invoke({"messages": [{"role": "user", "content": "What's the weather in Tokyo?"}]})
print(result["messages"][-1].text)
```

The agent picks the tool, calls it, and uses the result — you didn't write the loop. (The loop itself, and how a tool call travels over the API, are in [Ch 18 §18.2](#content/18_ai_agents) and [Ch 17b §9.3](#content/17b_llm_applications).)

</details>

### Hello world — a stateful graph (LangGraph)

<details>
<summary><strong>Read as text</strong> — a draft → review loop with saved state, and the headline features</summary>

When the workflow has loops or branches (`research → draft → review → maybe revise → publish`), you want LangGraph:

```python
# Runs locally: pip install langgraph   (no API key: the steps are plain Python)
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver

class State(TypedDict):
    topic: str
    draft: str
    approved: bool

def draft_step(state: State):
    return {"draft": f"A short essay on {state['topic']}."}

def review_step(state: State):
    return {"approved": "essay" in state["draft"]}

graph = StateGraph(State)
graph.add_node("draft", draft_step)
graph.add_node("review", review_step)
graph.add_edge(START, "draft")
graph.add_edge("draft", "review")
graph.add_conditional_edges("review", lambda s: "done" if s["approved"] else "draft",
                            {"done": END, "draft": "draft"})

app = graph.compile(checkpointer=InMemorySaver())     # saves the state after every step
config = {"configurable": {"thread_id": "essay-1"}}   # this run's ID: reuse it to resume
print(app.invoke({"topic": "attention", "draft": "", "approved": False}, config))
```

LangGraph's headline features are the ones you would otherwise hack together yourself:

| Feature | What it means | How you get it |
|---|---|---|
| **Durable execution** | A crashed run restarts from its last finished step, not from scratch | Compile with a checkpointer — a database one such as `PostgresSaver` in production (`InMemorySaver` is lost on restart) |
| **Persistence** | Pick a conversation or job up again days later | Call the graph again with the same `thread_id` |
| **Human-in-the-loop** | Pause before a risky step and wait for a person | A node calls `interrupt(...)`; you resume with `Command(resume=...)` |

</details>

### LangSmith — the debugging layer

<details>
<summary><strong>Read as text</strong> — full traces of every prompt, doc and tool call</summary>

When a chain returns nonsense, **LangSmith** shows you the full trace: every prompt sent, every retrieved doc, every tool call, every token of output. It's the single most useful tool for debugging an agent that's "almost working" and you can't tell why. LangChain and LangGraph runs are traced automatically once `LANGSMITH_TRACING=true` and `LANGSMITH_API_KEY` are set; any other function can opt in with a decorator:

```python
# Runs locally: pip install langsmith; set LANGSMITH_TRACING=true and LANGSMITH_API_KEY first
from langsmith import traceable

@traceable  # each call becomes a trace in the LangSmith UI: inputs, output, latency, errors
def answer(question: str) -> str:
    return f"(your pipeline's answer to: {question})"

answer("How does PagedAttention work?")
```

The wider choice of eval and tracing tools (Langfuse, Phoenix, MLflow, Weave…) is in [§19.10](#content/19_ai_frameworks).

</details>

### When to reach for LangChain

<details>
<summary><strong>Read as text</strong> — when to use it and when to reach elsewhere</summary>

| Use LangChain when... | Reach elsewhere when... |
|---|---|
| Building RAG, chatbots, agents, multi-step pipelines | You need maximum control of every byte (use raw SDK) |
| You want fast model/provider switching | Pure prompt-optimization research (use DSPy) |
| You want a standard the next engineer will recognise | Heavy data-ingest RAG with hundreds of file types (LlamaIndex) |
| You'll need tracing and evals later | A 50-line script (raw SDK is simpler) |

</details>

---

## 19.3 LlamaIndex & Workflows

> **LlamaIndex** is a data framework specialised for **connecting LLMs to your data** — ingestion, parsing, chunking, indexing, retrieval. **Workflows** is its agent layer.

![Infographic on LlamaIndex and Workflows: RAG over a folder (PDF, DOCX, PPTX, MD files to SimpleDirectoryReader to VectorStoreIndex to query engine to answer) and an event-driven Workflow (start event to step write to draft event to step check to stop event); Workflows 1.0 June 2025, now its own 2.x package as of Nov 2026; a LangChain vs LlamaIndex table and the trap of trusting default chunk size, overlap and top-k.](diagrams/fw19_info_llamaindex_workflows_ai.png)

<details>
<summary><strong>Read as text</strong> — the data specialist and its Workflows package</summary>

If LangChain is the generalist, LlamaIndex is the data specialist. **Workflows 1.0** shipped in **June 2025** as an event-driven, async-first runtime — small surface area, type-safe, built on Python `asyncio`. It now lives in its own package, `llama-index-workflows` (version 2.x as of November 2026, imported as `workflows`), so you can use it with or without the rest of LlamaIndex.

</details>

### Hello world — RAG over a folder

<details>
<summary><strong>Read as text</strong> — a working RAG pipeline in three lines</summary>

```python
# Runs locally: pip install llama-index; needs OPENAI_API_KEY (the default LLM and embedding model are OpenAI's)
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("./data").load_data()  # .pdf, .docx, .pptx, .md, .csv...; anything else as text
index = VectorStoreIndex.from_documents(documents)        # chunk + embed + index (in memory)

query_engine = index.as_query_engine()
print(query_engine.query("What were Q3 revenue drivers?"))
```

That's a working RAG pipeline. Three lines, no prompt template, no retriever config — sensible defaults all the way down. The defaults are a starting point, not a design: chunk size, overlap and top-k still need tuning on your data ([§19.9](#content/19_ai_frameworks)).

</details>

### Hello world — a Workflow

<details>
<summary><strong>Read as text</strong> — events in, events out: a write → check workflow</summary>

```python
# Runs locally: pip install llama-index-workflows llama-index-llms-openai; needs OPENAI_API_KEY
import asyncio
from workflows import Workflow, step
from workflows.events import Event, StartEvent, StopEvent
from llama_index.llms.openai import OpenAI

class DraftEvent(Event):
    draft: str

class AnswerFlow(Workflow):
    llm = OpenAI(model="gpt-6-luna")

    @step
    async def write(self, ev: StartEvent) -> DraftEvent:       # runs first: receives run(...) kwargs
        reply = await self.llm.acomplete(f"Answer briefly: {ev.question}")
        return DraftEvent(draft=str(reply))

    @step
    async def check(self, ev: DraftEvent) -> StopEvent:        # runs when a DraftEvent appears
        reply = await self.llm.acomplete(f"Fix any factual errors in: {ev.draft}")
        return StopEvent(result=str(reply))

async def main():
    print(await AnswerFlow(timeout=60).run(question="What is RAG?"))

asyncio.run(main())
```

Workflows are events-in, events-out. Each `@step` declares, through its type hints, which event it accepts and which it emits; the framework wires the steps together and checks the wiring before running. Branches are ordinary `if` statements that return different events, loops are a step that emits an event an earlier step handles, and pause/resume falls out naturally — no graph DSL to learn, just async Python.

</details>

### LangChain vs LlamaIndex

<details>
<summary><strong>Read as text</strong> — generalist vs data specialist, and using both</summary>

| Dimension | LangChain | LlamaIndex |
|---|---|---|
| Sweet spot | Agents, multi-step apps, broad integrations | Document-heavy RAG, knowledge assistants |
| Mental model | Composable components / graph | Indexes + query engines + event-driven workflows |
| Document parsing | Functional but basic | Strong: many built-in readers, plus LlamaParse (a hosted service) for messy PDFs, tables and slides |
| Best for | Generalist AI app | "Chat with my N PDFs / wiki / data warehouse" |

Many production stacks use **both**: LlamaIndex for ingestion and retrieval, LangChain (or LangGraph) for the agent and tool-use layer.

</details>

---

## 19.4 DSPy — Programming, Not Prompting

> **DSPy** (from Stanford NLP) treats prompts as code that the framework **compiles and optimises** for you. You declare *what* you want; DSPy figures out the prompt that gets the best score on your eval set.

![Infographic on DSPy compiling prompts: signature email to intent, ChainOfThought module, an optimizer (MIPROv2 or GEPA) that scores 20 candidate prompts, and a compiled program saved as classifier.json; formula best prompt = argmax over p of the mean metric on n labelled examples; toy result hand-written demos train 0.67 dev 0.75 vs compiled demos train 0.83 dev 1.00; DSPy paper gains over 25 and over 65 percent vs few-shot; trap: with tiny data the best prompt may be the luckiest.](diagrams/fw19_info_dspy_compile_ai.png)

<details>
<summary><strong>Read as text</strong> — prompt search, the argmax formula and the paper's gains</summary>

**Simple explanation:** instead of you rewording a prompt and eyeballing the answers, DSPy tries many candidate prompts — different instructions and different worked examples — scores each one on your labelled examples, and keeps the winner. It is hyper-parameter search where the "parameters" are the prompt's words and examples.

> **Maths in one line:** `best prompt = argmax over candidates p of (1/n) Σᵢ metric(yᵢ, LLM_p(xᵢ))` — run each candidate prompt on your n labelled examples, average your metric, keep the highest scorer.

This is a different paradigm. Instead of hand-tweaking `"You are a helpful expert. Think step by step. Format as JSON..."`, you write a **signature** (input and output fields), wrap it in a **module** (`Predict`, `ChainOfThought`, `ReAct`…), then run an **optimizer** that searches the prompt space.

The latest release is **DSPy 3.4** (September–October 2026). How much it helps depends on the task: the original DSPy paper (2023) reported compiled pipelines beating standard few-shot prompting by over 25% with GPT-3.5 and over 65% with Llama-2-13B-chat on its benchmarks. Read that as "the gain can be large", not as a promise for your task — only your own eval set can tell you.

</details>

### Hello world

<details>
<summary><strong>Read as text</strong> — signature → module → run, in code</summary>

```python
# Runs locally: pip install dspy; needs OPENAI_API_KEY
from typing import Literal
import dspy

dspy.configure(lm=dspy.LM("openai/gpt-6-luna"))

# 1. Declare the task as a signature
class ClassifyEmail(dspy.Signature):
    """Classify customer emails by intent."""
    email: str = dspy.InputField()
    intent: Literal["refund", "complaint", "question", "other"] = dspy.OutputField()

# 2. Wrap it in a module
classify = dspy.ChainOfThought(ClassifyEmail)

# 3. Run it (DSPy writes the prompt under the hood)
print(classify(email="My order arrived broken, I want my money back.").intent)  # e.g. 'refund'
```

</details>

### Compiling a prompt with MIPROv2

<details>
<summary><strong>Read as text</strong> — MIPROv2 and GEPA search for the best instructions and demos</summary>

The big idea: give DSPy a few dozen labelled examples and a metric, and it will search combinations of prompt instructions and demonstrations to maximise that metric. **MIPROv2** bootstraps candidate demos by running your program on the training set, asks an LM to propose candidate instructions, then uses Bayesian optimisation to pick the best combination.

```python
# Runs locally: pip install dspy; needs OPENAI_API_KEY. It makes many LLM calls: it is a search
import json
from typing import Literal
import dspy

dspy.configure(lm=dspy.LM("openai/gpt-6-luna"))

class ClassifyEmail(dspy.Signature):
    """Classify customer emails by intent."""
    email: str = dspy.InputField()
    intent: Literal["refund", "complaint", "question", "other"] = dspy.OutputField()

labelled = json.load(open("labelled_emails.json"))  # 50+ [email, intent] pairs from real tickets
trainset = [dspy.Example(email=e, intent=i).with_inputs("email") for e, i in labelled]

def metric(gold, pred, trace=None):  # DSPy passes a trace while bootstrapping demos
    return gold.intent == pred.intent

optimizer = dspy.MIPROv2(metric=metric, auto="light")  # light / medium / heavy search budget
compiled = optimizer.compile(dspy.ChainOfThought(ClassifyEmail), trainset=trainset)
compiled.save("classifier.json")  # the chosen instructions + demos: reusable and versionable
```

**GEPA** (2025) is DSPy's newer *reflective* optimizer: a second LM reads the program's failures — plus any written feedback your metric returns, not just a score — and rewrites the instructions, which lets it find strong prompts in relatively few trial runs. With only about 10 examples, the DSPy docs suggest starting with the simpler `BootstrapFewShot`.

</details>

### What "compiling" does — a toy optimizer you can run

<details>
<summary><strong>Read as text</strong> — what the toy optimizer searches</summary>

The real optimizers call an LLM hundreds of times. The toy below keeps only the idea: a fake "model" that copies the label of the most similar demo, a pool of six labelled emails, and a search over every 3-demo prompt, scored on a training set and checked on a dev set it never saw.

</details>

```python
# What "compiling" a prompt means: try every few-shot demo set, score each on a trainset, keep the best
from itertools import combinations

def words(text):
    return set(text.lower().replace(",", " ").replace(".", " ").split())

def fake_llm(demos, email):
    # Toy stand-in for a model reading a few-shot prompt: copy the label of the most similar demo
    overlap = [len(words(email) & words(d)) for d, _ in demos]
    best = max(range(len(demos)), key=lambda i: overlap[i])
    return demos[best][1] if overlap[best] > 0 else "other"

def accuracy(demos, data):
    return sum(fake_llm(demos, e) == y for e, y in data) / len(data)

pool = [  # labelled examples the optimizer may pick as demos
    ("I want my money back for this order", "refund"),
    ("The parcel arrived broken and nobody answers", "complaint"),
    ("Where is my order right now", "question"),
    ("Please refund the charge on my card", "refund"),
    ("Your support team was rude to me", "complaint"),
    ("Do you ship to Canada", "question"),
]
trainset = [("Refund my order please", "refund"), ("The box was broken", "complaint"),
            ("Do you ship on Sundays", "question"), ("I want my money back now", "refund"),
            ("Support never answers my emails", "complaint"), ("Where is the invoice", "question")]
devset = [("Can I get a refund on my card", "refund"), ("The screen arrived broken", "complaint"),
          ("Do you ship to Mexico", "question"), ("Nobody answers the phone", "complaint")]

hand_written = pool[:3]                    # what a person might paste in first
candidates = list(combinations(pool, 3))   # the search space: every 3-demo prompt
scores = [accuracy(c, trainset) for c in candidates]
best_i = max(range(len(candidates)), key=lambda i: scores[i])
compiled = candidates[best_i]

print(f"candidate prompts tried: {len(candidates)}")
print(f"hand-written demos: train {accuracy(hand_written, trainset):.2f}, dev {accuracy(hand_written, devset):.2f}")
print(f"compiled demos    : train {scores[best_i]:.2f}, dev {accuracy(compiled, devset):.2f}")
print("chosen demos:", [d[0] for d in compiled])
assert scores[best_i] >= accuracy(hand_written, trainset)
```

**Output:**

```
candidate prompts tried: 20
hand-written demos: train 0.67, dev 0.75
compiled demos    : train 0.83, dev 1.00
chosen demos: ['The parcel arrived broken and nobody answers', 'Please refund the charge on my card', 'Do you ship to Canada']
```

<details>
<summary><strong>Read as text</strong> — continued: train vs dev, and the luckiest prompt</summary>

The search tried 20 prompts and picked demos that scored 0.83 on the training set, against 0.67 for the first three examples a person would paste in. The dev set — data the search never saw — is the real test (1.00 versus 0.75 here). That is why DSPy wants a held-out set: with tiny data, the "best" prompt can simply be the luckiest one.

</details>

### When to use DSPy

<details>
<summary><strong>Read as text</strong> — when DSPy pays off and when to skip it</summary>

- You have an eval set and care about quality numbers, not vibes.
- You switch models often — re-compile for the new model instead of re-tuning prompts by hand.
- You're building a multi-stage pipeline (retrieve → reason → answer) and tuning each stage by hand is tedious.

Skip DSPy when you don't have evals — there's nothing for the optimizer to optimise against.

</details>

---

## 19.5 Pydantic AI — Type-Safe Agents

> **Pydantic AI** is an agent framework built around Pydantic's type system. Inputs, outputs, dependencies, and tool signatures are typed; your IDE and type checker catch most agent bugs at write-time instead of runtime.

![Infographic on Pydantic AI typed agents: the question What's the weather in Lisbon? goes to an agent with output type WeatherReport, which calls get_temperature and gets 19.5, returns a JSON reply that passes a VALIDATE gate to give WeatherReport city Lisbon, temperature_c 19.5, condition sunny, with a red retry arrow carrying the validation error back; versions 1.0 Sep 2025 and 2.0 Jun 2026 and example model openai:gpt-6.1-sol as of Nov 2026; a table of what you write vs what Pydantic AI does; trap: a valid shape is not a true answer.](diagrams/fw19_info_pydantic_ai_typed_agents_ai.png)

<details>
<summary><strong>Read as text</strong> — who makes it and its production defaults</summary>

From the Pydantic team (the validation library most Python projects already use); version 1.0 shipped in September 2025 and 2.0 in June 2026. Production-friendly defaults: structured output validation with auto-retry, dependency injection, durable-execution integrations, MCP support.

</details>

### Hello world — a typed agent with a tool and structured output

<details>
<summary><strong>Read as text</strong> — a typed weather agent and what it does for free</summary>

```python
# Runs locally: pip install pydantic-ai; needs OPENAI_API_KEY
from pydantic import BaseModel
from pydantic_ai import Agent

class WeatherReport(BaseModel):
    city: str
    temperature_c: float
    condition: str

agent = Agent(
    "openai:gpt-6.1-sol",
    output_type=WeatherReport,
    instructions="You are a weather assistant. Use get_temperature; invent a plausible condition.",
)

@agent.tool_plain
def get_temperature(city: str) -> float:
    """Return the current temperature in °C for a city."""
    return {"Lisbon": 19.5, "Tokyo": 23.0}.get(city, 15.0)

result = agent.run_sync("What's the weather in Lisbon?")
print(result.output)        # WeatherReport(city='Lisbon', temperature_c=19.5, condition='sunny')
print(result.output.city)   # typed: your IDE autocompletes .city
```

Three things happen without extra code:

| You wrote | Pydantic AI does |
|---|---|
| `output_type=WeatherReport` | Asks the model for that JSON shape and validates the reply; on a validation error it re-prompts the model with the error |
| A function with type hints and a docstring | Turns them into the tool's JSON schema, so the model knows how to call it |
| `instructions=` | Sends them as the system-level instructions for this agent (the docs recommend `instructions` rather than `system_prompt`) |

The validate-and-retry loop in the first row is simple enough to write yourself — [§19.8](#content/19_ai_frameworks) builds it in plain Python.

**Instructor** is the cousin library if you don't need a full agent framework — it wraps an LLM client so calls return Pydantic models, with retry-on-validation-error. LangChain models offer the same through `with_structured_output(...)`.

</details>

---

## 19.6 Multi-Agent Frameworks: LangGraph, CrewAI, Agent Framework, ADK

> **Multi-agent system**: multiple LLM-powered agents that collaborate by passing messages, calling each other as tools, or executing a defined workflow.

![Infographic comparing multi-agent frameworks as of Nov 2026: LangGraph (state graph, GA since 1.0 Oct 2025), CrewAI (role-based crews and Flows, 1.x), Microsoft Agent Framework (merges Semantic Kernel and AutoGen, GA 1.0 Apr 2026), Google ADK (code-first on Google Cloud, 2.x) and AutoGen stamped archived with the AG2 fork; formula calls = agents x rounds and input tokens about m x N(N-1)/2; worked example 4 agents x 5 rounds = 20 calls with tokens read per turn 0, 800, 1,800, 2,800, 3,800, totalling 38,000 vs 3,800 when passing only the last message; a how-to-pick table.](diagrams/fw19_info_multi_agent_frameworks_ai.png)

<details>
<summary><strong>Read as text</strong> — who decides the next step, the cost formula and the frameworks</summary>

**Simple explanation:** one agent is one LLM in a loop with tools. A multi-agent system splits the work between several such loops — a researcher, a writer, a reviewer — that hand results to each other. The frameworks differ mainly in *who decides the next step*: you (a graph you draw), a fixed role pipeline, or the agents themselves in a group chat. Whether to split into several agents at all is a design question covered in [Ch 18 §18.5](#content/18_ai_agents).

> **Maths in one line:** `calls = agents × rounds`, and when every turn re-reads the whole chat, `input tokens ≈ m × N(N−1)/2` for N turns of m new tokens each — cost grows with the *square* of the conversation length.

| Framework | Mental model | Sweet spot | Status (November 2026) |
|---|---|---|---|
| **LangGraph** | Explicit state graph; you draw the workflow | Production agents needing durability, branching, human approval | **GA** since 1.0 (Oct 2025) |
| **CrewAI** | Role-based "crews" (researcher, writer, reviewer), orchestrated by event-driven "Flows" | Pipeline-style workflows, low learning curve | Active (1.x) |
| **Microsoft Agent Framework** | Agents plus graph-based workflows; merges Semantic Kernel's enterprise base with AutoGen's multi-agent patterns | Python or .NET teams on Azure; anyone leaving AutoGen | **GA** 1.0 (April 2026) |
| **Google ADK** | Code-first, multi-agent native, deploys to Google Cloud | GCP shops | Active (2.x) — see [§19.12](#content/19_ai_frameworks) |
| **AutoGen** | Conversational `GroupChat`, emergent coordination | Reading old code only | **Archived** by Microsoft (no bug or security fixes); the community fork **AG2** continues separately |

</details>

### Hello world — CrewAI

<details>
<summary><strong>Read as text</strong> — a two-agent researcher → writer crew</summary>

```python
# Runs locally: pip install crewai; needs OPENAI_API_KEY
from crewai import Agent, Task, Crew, Process

MODEL = "gpt-6-luna"
researcher = Agent(role="Researcher", goal="Find accurate facts on a topic",
                   backstory="A careful analyst who checks sources.", llm=MODEL)
writer = Agent(role="Writer", goal="Write a tight summary",
               backstory="A technical writer who hates fluff.", llm=MODEL)

research = Task(description="Research how transformers use attention.",
                expected_output="5-10 factual bullet points", agent=researcher)
summary = Task(description="Summarise the research for an engineer.",
               expected_output="Exactly 5 bullets", agent=writer, context=[research])

crew = Crew(agents=[researcher, writer], tasks=[research, summary], process=Process.sequential)
print(crew.kickoff())
```

About fifteen lines and you have a two-agent pipeline (`expected_output` is required on every task: it tells the agent what "done" looks like). CrewAI's strength is *speed of expression*; the cost is less control than LangGraph.

</details>

### How to pick

<details>
<summary><strong>Read as text</strong> — which framework when, and why multi-agent is expensive</summary>

| Pick | When |
|---|---|
| **LangGraph** | Production reliability matters and the workflow has loops, branches or approvals |
| **CrewAI** | You naturally describe the work as roles ("a researcher finds, a writer summarises") |
| **Microsoft Agent Framework** | You are on .NET or Azure, or migrating from AutoGen or Semantic Kernel |
| **Google ADK** | You deploy on Google Cloud ([§19.12](#content/19_ai_frameworks)) |
| **Raw OpenAI / Claude / Gemini SDK** | You want zero abstraction tax |

**A real warning — multi-agent is expensive.** A 4-agent debate over 5 rounds is 4 × 5 = **20 LLM calls**. If each turn adds 200 tokens and every agent re-reads the whole chat, turn *t* reads (t − 1) × 200 tokens, so the run reads 200 × (0 + 1 + … + 19) = **38,000 input tokens** — 10× the 3,800 of a pipeline in which each agent reads only the previous message. Quantify before adopting.

</details>

---

## 19.7 Hugging Face — The GitHub of Models

> **Hugging Face** hosts over 3 million models, about 1.1 million datasets and 1.5 million demo apps (Spaces), according to its Hub statistics at the end of October 2026. The `transformers` library is the unified API to load and run most of them.

![Infographic on Hugging Face tooling: the Hub (over 3M models, about 1.1M datasets, 1.5M Spaces, end of Oct 2026), the libraries transformers, datasets, trl, peft and accelerate, and LoRA on a frozen q_proj 1024 to 2048 with adapters A 1024 x 16 and B 16 x 2048 giving 49,152 parameters; formula LoRA params = r x (d_in + d_out); worked table for Qwen3-0.6B at r = 16: q_proj 49,152 + v_proj 32,768 = 81,920 per layer, x 28 layers about 2.3M (about 0.4 percent); trap: transformers 5 has no summarization pipeline.](diagrams/fw19_info_hugging_face_tooling_ai.png)

<details>
<summary><strong>Read as text</strong> — the five core libraries</summary>

The core libraries you'll meet (`transformers` 5, released January 2026, is the current major version):

| Library | What it does |
|---|---|
| `transformers` | Load and run pretrained models (text, vision, audio, multimodal) |
| `datasets` | Stream/load any HF dataset |
| `trl` | Post-train models — SFT, DPO, GRPO, reward modelling |
| `peft` | Parameter-efficient fine-tuning (LoRA, QLoRA, prompt tuning) |
| `accelerate` | Multi-GPU / multi-node launch glue |

</details>

### Hello world — inference

<details>
<summary><strong>Read as text</strong> — classify and chat with two pipelines</summary>

```python
# Runs locally: pip install "transformers[torch]"; downloads the models on first run, no API key
from transformers import pipeline

classifier = pipeline("text-classification",
                      model="distilbert/distilbert-base-uncased-finetuned-sst-2-english")
print(classifier("This chapter is incredibly helpful!"))  # [{'label': 'POSITIVE', 'score': 0.99...}]

chat = pipeline("text-generation", model="HuggingFaceTB/SmolLM2-1.7B-Instruct")
messages = [{"role": "user", "content": "Summarise in one sentence: LoRA trains small adapter matrices."}]
reply = chat(messages, max_new_tokens=60)
print(reply[0]["generated_text"][-1]["content"])  # the assistant's newest message
```

`transformers` 5 no longer has a separate `summarization` pipeline: summarising is just a prompt to a chat model through `text-generation`, as above.

</details>

### Hello world — LoRA fine-tuning with TRL + PEFT

<details>
<summary><strong>Read as text</strong> — the LoRA parameter count and an SFT run</summary>

LoRA freezes the base model and trains two small low-rank matrices beside chosen weight matrices. How and why it works — and QLoRA — are taught in [Ch 17b §9.4](#content/17b_llm_applications); this is the tooling.

> **Maths in one line:** `trainable params per adapted matrix = r × (d_in + d_out)` — for Qwen3-0.6B with r = 16 on `q_proj` (1024 → 2048) and `v_proj` (1024 → 1024): 16 × 3,072 + 16 × 2,048 = 81,920 per layer, × 28 layers ≈ **2.3M** trainable weights, about 0.4% of the model.

```python
# Runs locally (a GPU helps): pip install trl peft datasets; downloads Qwen3-0.6B, no API key
from datasets import load_dataset
from peft import LoraConfig
from trl import SFTConfig, SFTTrainer

dataset = load_dataset("trl-lib/Capybara", split="train[:1000]")  # chat-format examples

lora = LoraConfig(
    r=16, lora_alpha=32, lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"],
    task_type="CAUSAL_LM",
)

trainer = SFTTrainer(
    model="Qwen/Qwen3-0.6B",
    train_dataset=dataset,
    peft_config=lora,
    args=SFTConfig(output_dir="./lora-out", num_train_epochs=1, learning_rate=1e-4),
)
trainer.train()
trainer.save_model()  # saves only the adapter: ~2.3M weights, a few MB
```

**QLoRA** is the same recipe with the frozen base loaded in 4-bit, which fits a 7B fine-tune on one 16–24 GB consumer GPU ([Ch 17b §9.4](#content/17b_llm_applications)).

</details>

---

## 19.8 Prompt Engineering Patterns

> **Prompt engineering**: the practice of designing and structuring inputs to LLMs to get reliable, high-quality outputs.

![Infographic on prompts as code: a versioned template v3d962e20 with an email slot feeds the model, a VALIDATE gate checks the Intent schema and a red arrow sends the error back for a retry; worked table: I want my money back passes first time (1 call), Refund me NOW fails on label and confidence then passes (2 calls), Do you ship to Canada? fails twice on confidence then passes (3 calls), total 3 emails 6 calls; formula expected calls per item = 1/(1 - f), f = 0.2 gives 1.25; table of the four patterns templates, versioning, structured output, optimisation; trap: a schema guarantees shape, not truth.](diagrams/fw19_info_prompt_patterns_in_code_ai.png)

<details>
<summary><strong>Read as text</strong> — prompts as code and the four patterns</summary>

**The basics live in [Ch 17b §5](#content/17b_llm_applications)** — zero-shot, few-shot, chain-of-thought, system prompts, ReAct and prompt injection. This section covers what changes when prompts become part of a *codebase*.

**Simple explanation:** in a script, a prompt is a string you edit until the answer looks right. In a product, a prompt is code: it has inputs (template slots), an output contract (a schema), a version number, and tests. Four framework-level patterns follow from that:

| Pattern | What it means | Tooling |
|---|---|---|
| **Templates** | Fixed instructions plus named slots (`{email}`) for the variable parts; user data goes into slots, never spliced into the instructions | LangChain `ChatPromptTemplate`, Jinja, plain f-strings |
| **Versioning** | Every template has an ID or hash, logged with each call and tied to its eval score | Prompts in git; prompt registries in MLflow, LangSmith, Langfuse — see [§19.10](#content/19_ai_frameworks) |
| **Structured output** | The model must return a schema; the app validates the reply and retries on failure | Provider structured outputs, Instructor, Pydantic AI, LangChain `with_structured_output` |
| **Optimisation** | A search picks instructions and examples by measured score instead of by taste | DSPy ([§19.4](#content/19_ai_frameworks)) |

A note on chain-of-thought: with 2026 reasoning models (GPT-6, Claude 5.5, Gemini 4) you rarely need to write "think step by step" — they reason internally, and you control how much with an effort or thinking-level setting ([Ch 17 §4](#content/17_llm)).

</details>

### Structured output — constrain to a schema

<details>
<summary><strong>Read as text</strong> — a Pydantic schema the provider enforces</summary>

Don't parse free text. OpenAI, Anthropic and Gemini all accept a JSON Schema (in Python, a Pydantic model) and constrain the reply to it; how that constraint works token by token is in [Ch 17b §8.6](#content/17b_llm_applications). With OpenAI's Responses API:

```python
# Runs locally: pip install openai pydantic; needs OPENAI_API_KEY
from typing import Literal
from openai import OpenAI
from pydantic import BaseModel

class Intent(BaseModel):
    label: Literal["refund", "complaint", "question", "other"]
    confidence: float

resp = OpenAI().responses.parse(
    model="gpt-6-luna",
    input=[{"role": "user", "content": "Classify: 'I want a refund.'"}],
    text_format=Intent,
)
print(resp.output_parsed)  # Intent(label='refund', confidence=0.97)
```

**Instructor**, **Pydantic AI** ([§19.5](#content/19_ai_frameworks)) and LangChain's `with_structured_output` give you the same thing behind one Pydantic-typed API across providers. A schema guarantees *shape*, not *truth*: `label` will be one of the four strings, but it can still be the wrong one — keep evaluating.

</details>

### Validate and retry — the loop the libraries hide

<details>
<summary><strong>Read as text</strong> — why validate in code, and the expected-calls formula</summary>

When the provider cannot enforce your rules — an open model without constrained decoding, or a rule a schema cannot express — you validate in code and re-prompt with the error. That loop is the core of what Instructor and Pydantic AI do for you.

> **Maths in one line:** `expected calls per item = 1 / (1 − f)` when a fraction f of replies fail validation independently — f = 0.2 costs 1.25 calls per item; cap the retries so a stuck model cannot loop forever.

The program below runs that loop against a scripted "model" whose replies are written out in advance, with a versioned template:

</details>

```python
# A versioned prompt template + schema validation + retry with the error (what Instructor / Pydantic AI automate)
import hashlib, json
from typing import Literal
from pydantic import BaseModel, Field, ValidationError

class Intent(BaseModel):
    label: Literal["refund", "complaint", "question", "other"]
    confidence: float = Field(ge=0, le=1)

TEMPLATE = ("Classify the customer email as refund, complaint, question or other.\n"
            'Reply only with JSON: {{"label": ..., "confidence": 0-1}}\n'
            "Email: {email}")
PROMPT_VERSION = hashlib.sha256(TEMPLATE.encode()).hexdigest()[:8]  # log this with every call

replies = iter([  # a scripted "model": its replies, in order
    '{"label": "refund", "confidence": 0.93}',        # email 1: valid
    'Sure! {"label": "Refund", "confidence": 93}',    # email 2: chatty, wrong case, wrong scale
    '{"label": "refund", "confidence": 0.9}',         # email 2, retry: fixed
    '{"label": "question"}',                          # email 3: field missing
    '{"label": "question"}',                          # email 3, retry: same mistake
    '{"label": "question", "confidence": 0.7}',       # email 3, 2nd retry: fixed
])

def classify(email, max_retries=2):
    prompt = TEMPLATE.format(email=email)
    for attempt in range(1, max_retries + 2):
        raw = next(replies)                               # = llm(prompt) in real code
        try:
            intent = Intent(**json.loads(raw[raw.find("{"):]))  # skip chatter before the JSON
            print(f"   attempt {attempt}: ok -> {intent.label} (confidence {intent.confidence:.2f})")
            return intent, attempt
        except (json.JSONDecodeError, ValidationError) as err:
            bad = [e["loc"][0] for e in err.errors()] if isinstance(err, ValidationError) else ["json"]
            print(f"   attempt {attempt}: rejected, bad fields {bad}")
            prompt += f"\nYour last reply was invalid ({bad}). Reply with valid JSON only."
    raise RuntimeError("gave up after retries")

print(f"prompt version {PROMPT_VERSION}")
calls = 0
for email in ["I want my money back", "Refund me NOW", "Do you ship to Canada?"]:
    print(repr(email))
    intent, used = classify(email)
    calls += used
print(f"3 emails -> {calls} model calls")
assert calls == 6 and intent.label == "question"
```

**Output:**

```
prompt version 3d962e20
'I want my money back'
   attempt 1: ok -> refund (confidence 0.93)
'Refund me NOW'
   attempt 1: rejected, bad fields ['label', 'confidence']
   attempt 2: ok -> refund (confidence 0.90)
'Do you ship to Canada?'
   attempt 1: rejected, bad fields ['confidence']
   attempt 2: rejected, bad fields ['confidence']
   attempt 3: ok -> question (confidence 0.70)
3 emails -> 6 model calls
```

<details>
<summary><strong>Read as text</strong> — continued: three habits in one small loop</summary>

Three habits in one small loop. The template's hash (`3d962e20`) is logged, so any trace shows which prompt version produced it. The schema rejects a capitalised label and a confidence of 93 (a percentage, not a 0–1 score). And the error goes back into the retry prompt, so the model knows what to fix. The third email needed three calls — in production, cap retries and track them as a cost metric.

</details>

### The big four prompt sins

<details>
<summary><strong>Read as text</strong> — the four mistakes to avoid</summary>

1. Asking the model to do too much in one call (split into steps).
2. Not showing examples when the task is non-obvious.
3. Burying the key instruction in the middle of a long context. Models use the start and end of a long input best ("lost in the middle"), so put long documents first and the question and critical instructions last ([Ch 17 §2.7](#content/17_llm)).
4. Treating prompt strings as throwaway. **Version them like code** ([§19.10](#content/19_ai_frameworks)).

</details>

---

## 19.9 Vector Databases & Modern RAG

![Infographic on vector databases and hybrid search as of Nov 2026: six options (pgvector, Qdrant, Weaviate, Pinecone, Milvus and Zilliz, Google's Vector Search on Gemini Enterprise Agent Platform, formerly Vertex AI Vector Search, whose 2.0 adds hybrid) with one line each; formula RRF(d) = sum over rankers of 1/(k + rank), k = 60; worked example for the query refund for SKU-4417: keyword top-3 d4, d1, d0 and vector top-3 d0, d4, d2 fuse to d4 0.0325, d0 0.0323, d1 0.0318; a pick-by-size table (under 10M on Postgres pgvector, otherwise Pinecone; 10M to 1B self-hosted Qdrant, Weaviate or Milvus, managed Pinecone or Google's Vector Search; over 1B Milvus or Vespa, managed Zilliz or Google's Vector Search); trap: vector-only search misses exact IDs.](diagrams/fw19_info_vector_db_hybrid_search_ai.png)

<details>
<summary><strong>Read as text</strong> — a search index for meaning, and where the basics live</summary>

**Simple explanation:** a vector database is a search index for *meaning*. Every chunk of your documents is stored as a list of numbers (an embedding); a question is turned into the same kind of list, and the database returns the chunks whose numbers are closest. RAG (retrieval-augmented generation) pastes those chunks into the prompt so the model answers from your documents. The basics — embeddings, similarity, why a vector DB, the RAG pipeline — are in [Ch 17b §10](#content/17b_llm_applications); index internals (HNSW, IVF-PQ), chunking and search metrics are in [Ch 28](#content/28_semantic_search). This section is about **which tools to pick** and **the upgrades that fix vanilla RAG**. A sensible starting point for chunking is 256–512 tokens per chunk with 50–100 tokens of overlap (Ch 28), then tune on your own eval set.

</details>

### The vector DB landscape (2026)

<details>
<summary><strong>Read as text</strong> — eight vector DBs and what each is best for</summary>

| DB | Best for | Notes |
|---|---|---|
| **pgvector** | Up to millions of vectors, already on Postgres | Right default for most teams: one less system to run, and rows, vectors and permissions live in one database. For hybrid search, combine it with Postgres full-text search |
| **Qdrant** | High-throughput open source | Rust-based; rich payload filtering; dense + sparse hybrid queries |
| **Weaviate** | Hybrid search out of the box | Vector + BM25 + filters in one query |
| **Pinecone** | Managed service, zero ops | Serverless; usage-based pricing |
| **Milvus / Zilliz** | Billions of vectors | Distributed; many index types, including disk-based DiskANN; Zilliz is the managed version |
| **Vector Search** (Gemini Enterprise Agent Platform; formerly Vertex AI Vector Search) | Managed, on Google Cloud | Built on Google's ScaNN; version 2.0 (renamed Agent Retrieval) adds built-in full-text and hybrid search |
| **Chroma** | Local dev, prototyping | In-process; great for notebooks |
| **Vespa** | Search + ranking + ML in one | Spun out of Yahoo; complex but powerful |

</details>

### Picking one

<details>
<summary><strong>Read as text</strong> — the pick-by-size tree and why hybrid beats pure vector</summary>

```
                                 How many vectors?
                                         │
              ┌──────────────────────────┼───────────────────────────┐
              ▼                          ▼                           ▼
            < 10M                    10M – 1B                      > 1B
              │                          │                           │
        On Postgres?                Self-host?                  Self-host?
        ┌─────┴─────┐              ┌─────┴──────┐              ┌─────┴──────┐
        │           │              │            │              │            │
       yes         no             yes          no             yes          no
        │           │              │            │              │            │
        ▼           ▼              ▼            ▼              ▼            ▼
    pgvector    Pinecone       Qdrant /    Pinecone /      Milvus /     Zilliz /
               (Chroma to     Weaviate /    Google's         Vespa      Google's
               prototype)       Milvus    Vector Search               Vector Search
```

A 2026 reality check: **pure vector search usually underperforms hybrid search** (vector + keyword/BM25 + metadata filters). Names, IDs, version numbers and SKUs need exact match; meaning needs vectors. Use both, and merge the two ranked lists with **reciprocal rank fusion (RRF)**. Most vector DBs now ship hybrid search natively (Weaviate, Qdrant, Milvus, Vespa, Pinecone, Google's Vector Search); with pgvector you pair it with Postgres full-text search.

</details>

### Hybrid search in code — reciprocal rank fusion

<details>
<summary><strong>Read as text</strong> — the RRF formula and the six-document setup</summary>

> **Maths in one line:** `RRF(d) = Σ over rankers r of 1 / (k + rank_r(d))`, with k = 60 — a document scores well if it sits near the top of *several* lists; only ranks are used, so BM25 scores and cosine similarities never need to be put on the same scale.

Six documents, one query that mixes an exact ID (`SKU-4417`) with a meaning ("refund"). TF-IDF stands in for BM25, and tiny hand-made 4-number vectors stand in for real embeddings:

</details>

```python
# Hybrid search: fuse a keyword (TF-IDF) ranking and a vector ranking with reciprocal rank fusion (RRF)
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

docs = ["Refund policy: refunds are issued within 14 days",          # d0
        "SKU-4417 wireless mouse: battery and pairing guide",        # d1
        "How to return an item and get your money back",            # d2
        "Shipping times for international orders",                   # d3
        "Order SKU-4417 refund requests need the original receipt", # d4
        "Reset your account password"]                               # d5
query = "refund for SKU-4417"

# Keyword ranking: exact words and IDs count
tfidf = TfidfVectorizer(stop_words="english").fit(docs)
kw_scores = (tfidf.transform(docs) @ tfidf.transform([query]).T).toarray().ravel()

# Vector ranking: toy 4-number "embeddings" = [money back, product, shipping, account]
emb = np.array([[0.9, 0.1, 0.0, 0.1], [0.0, 1.0, 0.1, 0.0], [1.0, 0.1, 0.2, 0.0],
                [0.1, 0.0, 1.0, 0.0], [0.8, 0.5, 0.0, 0.0], [0.0, 0.0, 0.0, 1.0]])
q_emb = np.array([1.0, 0.3, 0.0, 0.0])           # meaning of the query: mostly "money back"
vec_scores = emb @ q_emb / (np.linalg.norm(emb, axis=1) * np.linalg.norm(q_emb))

def ranking(scores):
    return [int(i) for i in np.argsort(-scores, kind="stable")]

def rrf(rankings, k=60):
    fused = {}
    for r in rankings:
        for rank, d in enumerate(r, start=1):
            fused[d] = fused.get(d, 0.0) + 1 / (k + rank)
    return sorted(fused, key=lambda d: -fused[d]), fused

kw, vec = ranking(kw_scores), ranking(vec_scores)
order, fused = rrf([kw, vec])
print("keyword top-3:", [f"d{d}" for d in kw[:3]])
print("vector  top-3:", [f"d{d}" for d in vec[:3]])
print("RRF     top-3:", [f"d{d} ({fused[d]:.4f})" for d in order[:3]])
print(f"d4 = 1/(60+{kw.index(4) + 1}) + 1/(60+{vec.index(4) + 1}) = {fused[4]:.4f}")
assert order[0] == 4 and kw[0] != vec[0]
```

**Output:**

```
keyword top-3: ['d4', 'd1', 'd0']
vector  top-3: ['d0', 'd4', 'd2']
RRF     top-3: ['d4 (0.0325)', 'd0 (0.0323)', 'd1 (0.0318)']
d4 = 1/(60+1) + 1/(60+2) = 0.0325
```

<details>
<summary><strong>Read as text</strong> — continued: why d4 wins the fused list</summary>

Keyword search puts d4 first because it contains both `SKU-4417` and "refund"; vector search prefers d0, the refund policy, which matches the meaning but not the ID. d4 wins the fused list because it is near the top of *both* lists: 1/61 + 1/62 = 0.0325, just ahead of d0 (1/63 + 1/61 = 0.0323). The fused scores are close together — RRF is a gentle vote, which is why it is so robust. How it compares with weighted score fusion is in [Ch 28](#content/28_semantic_search).

</details>

### Modern RAG — beyond vanilla

![Infographic on modern RAG upgrades: the vanilla pipeline chunk, embed, top-k, stuff into prompt with seven failures each mapped to a fix (HyDE, hybrid search with RRF, reranking top 20 to 3, contextual chunking, query rewriting, agentic RAG, GraphRAG); key numbers 50-100-token contextual notes and Anthropic's 49 percent fewer failed retrievals, 67 percent with reranking; a table of contextual retrieval vs late chunking; the GraphRAG build documents to entities and relations to knowledge graph to communities to summaries; effort order better embedding, reranker, fine-tuned embeddings.](diagrams/fw19_info_modern_rag_upgrades_ai.png)

![Seven upgrades that fix vanilla RAG's specific failure modes](diagrams/fw19_ragfixes_ai.png)

![GraphRAG answers global and multi-hop questions vanilla RAG cannot](diagrams/fw19x_graphrag_ai.png)

<details>
<summary><strong>Read as text</strong> — seven failures and their fixes, and contextual chunking</summary>

Vanilla RAG is `chunk → embed → top-k → stuff into prompt`. By 2026, every step has a sharper alternative for a specific failure mode:

| Vanilla fails when... | Modern fix | What it does |
|---|---|---|
| Question and doc use different words | **HyDE** | Generate a hypothetical answer; embed *that*; retrieve against it |
| Vector match misses an exact ID/SKU | **Hybrid search** | Vector + BM25, fused with RRF (above) |
| Top-5 by similarity ≠ top-5 by meaning | **Reranking** | Cross-encoder rescores top 20 → keep best 3 |
| Chunk is meaningless on its own | **Contextual chunking** | Prepend a short document-level context to each chunk before embedding |
| Question is vague or multi-part | **Query rewriting** | LLM splits into sub-queries; retrieve per sub-query |
| Not every Q needs retrieval | **Agentic RAG** | LLM decides *whether* and *what* to retrieve, as a tool call |
| Facts are relational | **Graph RAG** | Retrieve subgraphs from a knowledge graph |

You don't need all seven. Bolt them on as you hit each failure.

**Two contextual-chunking techniques worth naming.** A chunk such as "Revenue grew 3% over the previous quarter" is useless without knowing *which* company and *which* quarter.

| Technique | How it works | Cost and evidence |
|---|---|---|
| **Contextual retrieval** (Anthropic, 2024) | An LLM writes a 50–100-token note placing each chunk in its document; the note is prepended before both embedding and BM25 indexing | One extra LLM pass over the corpus at index time; Anthropic reported 49% fewer failed retrievals, and 67% fewer when combined with reranking |
| **Late chunking** (Jina AI, 2024) | Embed the *whole* document with a long-context embedding model first, then average the token vectors inside each chunk, so every chunk vector has "seen" its neighbours | No extra LLM calls; needs an embedding model whose context fits the document |

> **Going deeper on retrieval itself:** the index internals — HNSW graph construction, IVF-PQ, BM25, and how RRF compares with weighted fusion — live in **[Ch 28 — Semantic Search](#content/28_semantic_search)**. **Semantic caching** (skipping the model entirely on similar questions) is in [Ch 17c §2.4](#content/17c_llm_systems). This section is about *which tool to pick*; those chapters are about *how it works*.

</details>

### GraphRAG, multimodal RAG and fine-tuned embeddings ★★

<details>
<summary><strong>Read as text</strong> — GraphRAG, multimodal RAG and fine-tuning the embedder</summary>

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

This is the design behind Microsoft Research's **GraphRAG** (2024). The build step is expensive — an LLM pass over the whole corpus to extract entities and relationships, then community detection and summarisation. **Use it when the corpus is stable and the questions are global or relational.** For "find the passage that answers this", vanilla RAG plus a reranker wins on both cost and latency.

**Multimodal RAG** — when the answer is in a chart, not the prose. Two approaches: caption every image with a vision model and index the captions (simple, lossy), or use a **multimodal embedding model** to put images and text in one vector space and retrieve directly (better, and it handles diagrams and screenshots that captioning flattens). A third option skips text extraction altogether: embed each page *image* with a vision-language retriever such as ColPali (2024), which matches query tokens against patches of the page. Document-heavy domains — finance, engineering, medical — are usually the ones that need it.

**Fine-tuning the embedding model** — the retrieval lever people forget. Off-the-shelf embeddings are trained on general text and can be poor at domain vocabulary where two terms look similar to a general model but mean different things to a specialist. Fine-tune with **contrastive learning** on (query, relevant passage, irrelevant passage) triples. You need surprisingly few — a few thousand pairs, and you can bootstrap them from click logs or by generating synthetic queries per chunk with an LLM. Ordering of effort: **better base embedding model → reranker → fine-tuned embeddings**, because the first two are far cheaper.

</details>

### Choosing an embedding model ★★★

![Infographic on shipping RAG to production: formula results after post-filtering about fetch x p (top-20 at 3 percent keeps 0.6 results); two funnels for a user who may see 28 of 1,000 chunks, post-filter of a global top-20 giving 0 of 5 results vs pre-filter giving 5 of 5; worked table post-filter top-5, top-20, top-100 give 0, 0 and 3 of 5 while pre-filter gives 5 of 5; a retrieve 20, rerank, keep 3 strip (e.g. Cohere rerank-v5.0-fast as of Nov 2026); five axes for choosing an embedding model; production concerns ACLs, erasure, freshness and citations.](diagrams/fw19_info_embeddings_and_production_rag_ai.png)

![Five axes for choosing an embedding model, not just 'use OpenAI'](diagrams/fw19_embeddingaxes_ai.png)

<details>
<summary><strong>Read as text</strong> — the five axes, reading MTEB and the interview soundbite</summary>

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

</details>

### The production concerns nobody demos ★★★

<details>
<summary><strong>Read as text</strong> — ACLs, erasure, freshness, citations and the post-filter trap</summary>

Every RAG demo ignores these. Every RAG *system* has to solve them.

| Concern | The problem | The approach |
|---|---|---|
| **Multi-tenancy & ACLs** | User A must never retrieve User B's documents — and a vector search has no natural notion of permission | Store tenant and ACL as **metadata**, filter *before* or during search, not after. Post-filtering silently shrinks your top-k and can return nothing. For strong isolation use a namespace or collection per tenant |
| **Right to erasure (GDPR)** | A user demands deletion. Their text is in chunks, in embeddings, and possibly in a cache | Keep a source-document → chunk-ID mapping so deletes are surgical. Verify the vector store *hard*-deletes rather than tombstoning. Purge caches keyed on that content too |
| **Freshness** | The index is a snapshot; the source moves | Incremental upsert on change events rather than nightly full rebuilds; store a version or timestamp per chunk and expose it in citations |
| **Citation integrity** | The model cites a chunk that doesn't support the claim | Return chunk IDs with the answer and validate that quoted spans actually appear in the retrieved text |

**The ACL mistake worth remembering:** filtering *after* retrieval. If you retrieve the top 20 globally and then drop the ones the user can't see, a user with narrow permissions may end up with two results — or zero — while the system reports success. Filter inside the query.

> **Maths in one line:** `expected results after post-filtering ≈ fetch × p`, where p is the share of the index the user may see — fetch the global top-20 for a user who can see 3% of it and you keep 20 × 0.03 = 0.6 results on average.

</details>

```python
# Why ACLs must filter INSIDE the search: post-filtering a global top-k starves narrow-permission users
import numpy as np

rng = np.random.default_rng(0)
n_chunks, dim, k = 1000, 32, 5
emb = rng.normal(size=(n_chunks, dim))
emb /= np.linalg.norm(emb, axis=1, keepdims=True)
tenant = rng.choice(["acme", "globex", "initech"], size=n_chunks, p=[0.03, 0.67, 0.30])
query = rng.normal(size=dim)
query /= np.linalg.norm(query)
scores = emb @ query
user_tenant = "acme"                      # this user may only see acme's chunks (3% of the index)

def post_filter(fetch):                   # search everything, then drop what the user can't see
    top = np.argsort(-scores)[:fetch]
    return [i for i in top if tenant[i] == user_tenant][:k]

def pre_filter():                         # filter inside the search: only allowed chunks compete
    allowed = np.flatnonzero(tenant == user_tenant)
    return list(allowed[np.argsort(-scores[allowed])][:k])

print(f"acme chunks in the index: {int((tenant == user_tenant).sum())} of {n_chunks}")
for fetch in (5, 20, 100):
    print(f"post-filter, fetch top-{fetch:<3} -> {len(post_filter(fetch))} of {k} results")
print(f"pre-filter                  -> {len(pre_filter())} of {k} results")
assert len(pre_filter()) == k and len(post_filter(20)) < k
```

**Output:**

```
acme chunks in the index: 28 of 1000
post-filter, fetch top-5   -> 0 of 5 results
post-filter, fetch top-20  -> 0 of 5 results
post-filter, fetch top-100 -> 3 of 5 results
pre-filter                  -> 5 of 5 results
```

<details>
<summary><strong>Read as text</strong> — continued: why fetching more does not fix post-filtering</summary>

Fetching more (top-100) only partly rescues post-filtering, and it wastes work on chunks the user can never see. Filtering inside the search returns a full top-5 every time.

</details>

### Hello world — RAG with reranking (LangChain + Cohere Rerank)

<details>
<summary><strong>Read as text</strong> — retrieve 20, rerank to 3, in code</summary>

```python
# Runs locally: pip install langchain-openai langchain-classic langchain-cohere; needs OPENAI_API_KEY and COHERE_API_KEY
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_cohere import CohereRerank

texts = ["PagedAttention stores the KV cache in fixed-size blocks, like OS memory pages.",
         "Continuous batching adds new requests to a running batch at every decoding step.",
         "Speculative decoding lets a small draft model propose tokens that the big model verifies."]
store = InMemoryVectorStore.from_texts(texts, OpenAIEmbeddings(model="text-embedding-3-small"))

retriever = ContextualCompressionRetriever(
    base_retriever=store.as_retriever(search_kwargs={"k": 20}),   # recall: cast a wide net
    base_compressor=CohereRerank(model="rerank-v5.0-fast", top_n=3),  # precision: a cross-encoder reorders
)
for doc in retriever.invoke("How does PagedAttention work?"):
    print(doc.page_content)
```

Retrieve 20, rerank to 3, send to the LLM. Together with a stronger embedding model, adding a reranker is one of the two highest-leverage changes to a RAG pipeline. (The old `langchain.retrievers` module moved to `langchain-classic` in LangChain 1.0; with only three texts here, k = 20 simply returns all of them.)

</details>

---

## 19.10 Evaluation & Observability

> **LLM evaluation**: measuring the quality, safety, and cost of LLM outputs without a closed-form correctness test.

![Infographic of the three LLM eval layers: offline evals in CI with Ragas or DeepEval, an online LLM judge on a 1% sample, and tracing with Langfuse, LangSmith, Phoenix or MLflow 3. Shows the 95% margin formula margin = 1.96 x sqrt(p(1 - p) / n) and a table for 1M requests a day at p = 0.90: 0.1% sampled gives plus or minus 1.86 points for 4 USD a day, 1% gives 0.59 points for 40 USD, 5% gives 0.26 points for 200 USD, 100% gives 0.06 points for 4,000 USD. Also a pick-by-question list (self-host Langfuse or Phoenix if traces cannot leave the VPC), prompt versioning chip, and agent benchmarks as of Nov 2026.](diagrams/fw19_info_eval_observability_tools_ai.png)

<details>
<summary><strong>Read as text</strong> — the three eval layers, and where the concepts are taught</summary>

LLM apps don't have a "right vs wrong" oracle. You need three layers:

1. **Offline evals** — curated test set, run every release.
2. **Online evals** — LLM-as-judge sampling live traffic.
3. **Tracing** — see every prompt, retrieval, tool call, and intermediate step.

This section is about the **tools**. The ideas behind them — the four-layer eval stack, LLM-as-judge and its biases, golden sets, A/B tests — are taught in [Ch 17c §4.1](#content/17c_llm_systems); evaluating agents (trajectories, pass^k) is in [Ch 18b §18.12](#content/18b_agents_in_production).

</details>

### The 2026 toolbox

<details>
<summary><strong>Read as text</strong> — the nine tools, and the self-hosting fork</summary>

As of November 2026:

| Tool | What it's good for | Where your traces live |
|---|---|---|
| **MLflow 3** (3.18, Nov 2026) | One tool for classic ML *and* GenAI: OpenTelemetry-compatible tracing, `mlflow.genai.evaluate` with LLM-judge scorers, prompt registry | Open source — self-host, or managed on Databricks |
| **W&B Weave** | Evals + tracing + dashboards; natural if you already track training runs in W&B | Hosted SaaS |
| **LangSmith** | Tracing + evals; deepest LangChain / LangGraph integration, but works without them | Hosted SaaS; self-hosting is an enterprise-plan option |
| **Ragas** (0.4) | RAG metrics — faithfulness, context precision and recall, answer relevancy | Open-source library |
| **DeepEval** | Pytest-style LLM unit tests (`deepeval test run`); CI-friendly | Open-source library (optional Confident AI cloud) |
| **promptfoo** | CLI prompt regression tests and red-teaming. OpenAI agreed to buy it in March 2026; the open-source CLI continues | Open-source CLI |
| **Arize Phoenix** | Tracing + evals, built on OpenTelemetry | Open source, self-hostable |
| **Langfuse** | Tracing + evals + prompt management. Bought by ClickHouse in January 2026; the core stays MIT-licensed | Open source, self-hostable |
| **Braintrust** | Eval experiments, scoring and dashboards for product teams | Hosted SaaS (hybrid option) |

The pattern most teams converge on: **one CI tool + one platform.** Pair Ragas/DeepEval (gating in CI) with LangSmith/Braintrust/Langfuse (annotation, regressions, dashboards).

> **The self-hosting fork.** By default LangSmith, Braintrust and Weave are hosted SaaS — every prompt and completion you trace leaves your network, and their self-hosted or hybrid deployments are enterprise-plan options. In regulated environments that is often a blocker, and **Langfuse** or **Arize Phoenix** (both open source and self-hostable at no licence cost) become the answer. Ask "can traces leave our VPC?" before choosing, because migrating an observability stack later is painful. Most of these platforms now ingest **OpenTelemetry** traces, so instrument against OTel (and its GenAI semantic conventions) rather than a vendor SDK and the switch stays cheap.

</details>

### Online evals — how much traffic to judge

<details>
<summary><strong>Read as text</strong> — the sampling idea and the margin formula</summary>

An online judge does not need to score every response. It only needs enough of them to see a regression.

> **Maths in one line:** `margin ≈ 1.96 × √(p(1 − p) / n)` — the 95% error bar on a pass rate `p` measured from `n` judged responses. At p = 0.90 and n = 10,000 the margin is ±0.59 points, so a 2-point drop stands out.

The program below prices it for one million requests a day and an illustrative mid-tier judge (2 dollars per million input tokens, 10 per million output):

</details>

```python
# Online evals: what share of live traffic should an LLM judge score? Margin of error vs judge cost
import numpy as np

REQUESTS_PER_DAY = 1_000_000
TRUE_PASS = 0.90                      # today's real share of good answers
JUDGE_IN, JUDGE_OUT = 1_500, 100      # tokens per judgment: answer + rubric in, verdict out
PRICE_IN, PRICE_OUT = 2.00, 10.00     # illustrative mid-tier judge, USD per 1M tokens
rng = np.random.default_rng(0)

cost_per_judgment = (JUDGE_IN * PRICE_IN + JUDGE_OUT * PRICE_OUT) / 1e6
print(f"Judge cost per response: {cost_per_judgment * 100:.2f} US cents")
print(f"{'sampled':>8} {'judged/day':>11} {'USD/day':>8} {'95% margin':>11} {'observed today':>15}")
margins = {}
for rate in [0.001, 0.01, 0.05, 1.0]:
    n = int(REQUESTS_PER_DAY * rate)
    margin = 1.96 * np.sqrt(TRUE_PASS * (1 - TRUE_PASS) / n)
    observed = rng.binomial(n, TRUE_PASS) / n
    margins[rate] = margin
    print(f"{rate:>8.1%} {n:>11,} {n * cost_per_judgment:>8,.0f} {margin * 100:>7.2f} pts {observed:>14.2%}")

# A 2-point drop (90% -> 88%) is visible once the margin is well under 1 point.
assert margins[0.01] < 0.01 < margins[0.001]
print("1% sampling resolves a 2-point regression; judging everything costs 100x more for little extra.")
```

**Output:**

```
Judge cost per response: 0.40 US cents
 sampled  judged/day  USD/day  95% margin  observed today
    0.1%       1,000        4    1.86 pts         90.80%
    1.0%      10,000       40    0.59 pts         89.98%
    5.0%      50,000      200    0.26 pts         89.98%
  100.0%   1,000,000    4,000    0.06 pts         90.01%
1% sampling resolves a 2-point regression; judging everything costs 100x more for little extra.
```

<details>
<summary><strong>Read as text</strong> — continued: why a small sample is enough</summary>

Cost grows with `n`, but the margin shrinks only with `√n`: going from 1% to 100% multiplies the bill by 100 and shrinks the error bar by 10. Sample a small random share, then oversample the risky slices (new prompt version, a big customer, flagged sessions) — the tracing platforms above let you set a sampling rate on online evaluators.

</details>

### Prompt versioning — treat prompts as deployable artefacts ★★

<details>
<summary><strong>Read as text</strong> — five practices, the prompt registry and the incident question</summary>

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

</details>

### Hello world — Ragas RAG eval

<details>
<summary><strong>Read as text</strong> — a Ragas 0.4 faithfulness and context-precision check</summary>

```python
# Runs locally: pip install "ragas>=0.4" openai; needs OPENAI_API_KEY (Ragas 0.4 "collections" metrics API)
from openai import AsyncOpenAI
from ragas.llms import llm_factory
from ragas.metrics.collections import ContextPrecision, Faithfulness

JUDGE_MODEL = "gpt-6-luna"   # any model your key can call; Ragas uses it as the judge
llm = llm_factory(JUDGE_MODEL, client=AsyncOpenAI())

question = "What is PagedAttention?"
contexts = ["PagedAttention splits the KV cache into fixed-size blocks, like pages in OS virtual memory."]
answer = "A vLLM technique that stores the KV cache in fixed-size blocks, like memory pages."
reference = "vLLM's method of allocating the KV cache in fixed-size blocks."

faith = Faithfulness(llm=llm).score(user_input=question, response=answer, retrieved_contexts=contexts)
prec = ContextPrecision(llm=llm).score(user_input=question, reference=reference, retrieved_contexts=contexts)
print(f"faithfulness={faith.value:.2f}  context_precision={prec.value:.2f}")
```

**Faithfulness** = claims in the answer that the retrieved context supports ÷ all claims in the answer: if the judge splits an answer into 2 claims and only 1 is backed by the context, faithfulness is 0.5. The older `from ragas.metrics import faithfulness` + `evaluate(Dataset)` style still appears in tutorials; Ragas 0.4 deprecates it.

</details>

### Hello world — DeepEval (Pytest)

<details>
<summary><strong>Read as text</strong> — a Pytest-style test that fails the CI build</summary>

```python
# Runs locally: pip install deepeval; needs OPENAI_API_KEY (the default judge). Save as test_app.py
from deepeval import assert_test
from deepeval.metrics import AnswerRelevancyMetric
from deepeval.test_case import LLMTestCase

def test_relevance():
    case = LLMTestCase(
        input="What's the capital of France?",
        actual_output="Paris is the capital.",   # in a real test, call your app here
    )
    assert_test(case, [AnswerRelevancyMetric(threshold=0.7)])
```

Run with `deepeval test run test_app.py` — same workflow as `pytest`, so a failing metric fails the CI build.

</details>

### Hello world — MLflow 3 GenAI tracing

<details>
<summary><strong>Read as text</strong> — one autolog line turns every call into a trace</summary>

```python
# Runs locally: pip install mlflow openai; needs OPENAI_API_KEY and a server started with: mlflow server --port 5000
import mlflow
from openai import OpenAI

mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("rag-pipeline")
mlflow.openai.autolog()              # one line: every OpenAI call below becomes a trace

client = OpenAI()
reply = client.chat.completions.create(
    model="gpt-6-luna",
    messages=[{"role": "user", "content": "What is PagedAttention? One sentence."}],
)
print(reply.choices[0].message.content)
# The trace (prompt, response, latency, token counts) appears in the experiment's Traces tab.
```

</details>

### Standard agent benchmarks (cite the date — scores drift)

<details>
<summary><strong>Read as text</strong> — six agent benchmarks and their status in Nov 2026</summary>

Status as of November 2026. Always quote the harness and the date with a score; the current numbers are in [Ch 20 §20.13](#content/20_2026_landscape), and how to build your *own* agent eval is [Ch 18b §18.12](#content/18b_agents_in_production).

| Benchmark | Measures | Status (Nov 2026) |
|---|---|---|
| **SWE-bench Verified** | Real GitHub bug fixes in Python repos | **Retired** by OpenAI in Feb 2026 (flawed tests, contamination) |
| **SWE-bench Pro** | A harder set of real repository tasks | OpenAI found ~30% of tasks broken and retracted its recommendation on 8 Jul 2026; some labs still report it, so treat scores as rough |
| **Terminal-Bench 4.1** | Command-line tasks in a sandboxed terminal | Active; 4.1 (9 Nov 2026) keeps 4.0's tasks but hardens the verifiers, and a new major version or harness changes the score, so 3.0 and 4.x results don't compare |
| **OSWorld-Verified** | Full desktop computer use, checked by scripts | The best self-reported scores now pass the ~72% human baseline; compare only runs with the same harness and step budget |
| **τ-bench / τ²-bench** | Multi-turn tool use with a simulated customer (retail, airline; τ² adds telecom) | Active; report pass^k (all k tries succeed), not just pass@1 |
| **GAIA** | General-assistant questions that need browsing and tools | Near saturated — official top entries are around 90%, close to the 92% human baseline |

</details>

---

## 19.11 Inference Servers — Serving LLMs at Scale

> **Inference server**: a process that loads model weights and exposes a request/response API, optimised for throughput, latency, and GPU memory.

![Infographic comparing inference server tiers as of Nov 2026: local dev (Ollama, llama.cpp, MLX, LM Studio), production serving (vLLM as the default, SGLang, TensorRT-LLM, TGI archived Mar 2026) and orchestration (NVIDIA Dynamo, llm-d, Ray Serve, Dynamo-Triton). Shows throughput = concurrent requests x tokens/s per request (32 users x 25 tokens/s = about 800 tokens/s), and the Red Hat Aug 2025 benchmark on one A100 40 GB with Llama 3.1 8B: vLLM 793 vs Ollama 41 output tokens/s and P99 time-to-first-token 80 ms vs 673 ms, plus a need-to-tool table.](diagrams/fw19_info_inference_servers_ai.png)

<details>
<summary><strong>Read as text</strong> — where serving is taught, and the batching maths</summary>

How serving works — prefill vs decode, the KV cache, continuous batching, PagedAttention, speculative decoding — is taught in [Ch 17c §1–2](#content/17c_llm_systems), and the engine-by-engine comparison is [Ch 17c §5.1](#content/17c_llm_systems). This section is about the software you install.

> **Maths in one line:** `throughput ≈ concurrent requests × tokens/s per request` — batching is the whole game: 32 users decoding at 25 tokens/s each is about 800 tokens/s from one GPU (close to the vLLM peak below); serve them one at a time and you get 25.

</details>

### The 2026 hierarchy

<details>
<summary><strong>Read as text</strong> — the three tiers, and why TGI is retired</summary>

```
  ┌────────────────────────────────────────────────────────────────┐
  │  LOCAL DEV / SINGLE USER                                       │
  │  ────────────────────────────────────────────────────────────  │
  │  Ollama        — easiest: pull a model, run it                 │
  │  llama.cpp     — CPU or laptop GPU, GGUF quantized files       │
  │  MLX           — native on Apple silicon                       │
  │  LM Studio     — desktop GUI over llama.cpp / MLX              │
  │                                                                │
  │  PRODUCTION SERVING                                            │
  │  ────────────────────────────────────────────────────────────  │
  │  vLLM          — DEFAULT. PagedAttention, broad hardware       │
  │  SGLang        — RadixAttention; agents, heavy prefix reuse    │
  │  TensorRT-LLM  — peak NVIDIA performance, more setup           │
  │  TGI           — ARCHIVED Mar 2026 (maintenance Dec 2025)      │
  │                                                                │
  │  ORCHESTRATION (many GPUs / nodes)                             │
  │  ────────────────────────────────────────────────────────────  │
  │  NVIDIA Dynamo, llm-d, Ray Serve, Dynamo-Triton (ex-Triton)    │
  └────────────────────────────────────────────────────────────────┘
```

**TGI is retired.** Hugging Face put Text Generation Inference into maintenance mode on 11 December 2025 and archived its GitHub repository (read-only) on 21 March 2026. It recommends vLLM or SGLang for servers, and llama.cpp or MLX locally. If you still run TGI in production, plan the migration — the replacements expose an OpenAI-compatible API, so clients barely change.

</details>

### vLLM is the default — why?

<details>
<summary><strong>Read as text</strong> — PagedAttention, the V1 engine and the Red Hat benchmark</summary>

**PagedAttention** stores the KV cache in fixed-size blocks (like operating-system memory pages), so many requests share GPU memory with almost no waste; with **continuous batching** that lets one GPU serve many users at once. The vLLM paper reported about 2–4× the throughput of earlier serving systems at the same latency ([Ch 17c §2.1–2.2](#content/17c_llm_systems)). Since v0.8 (2025) vLLM runs its rewritten **V1 engine**, ships an OpenAI-compatible server, and supports NVIDIA, AMD, Intel and Google TPU hardware.

A Red Hat benchmark (August 2025; one A100 40 GB GPU, Llama 3.1 8B) shows why a laptop runtime is not a server: under rising load vLLM peaked at **793 output tokens/s** against Ollama's 41, with a P99 time-to-first-token of **80 ms** against 673 ms. That comparison is apples-to-oranges by design — Ollama is built for one user on one machine, not for concurrent serving.

</details>

### Hello world — Ollama (local dev)

<details>
<summary><strong>Read as text</strong> — pull and run a model from the shell or from Python</summary>

```bash
ollama pull gemma4
ollama run gemma4 "Explain attention in 3 bullets."
```

Or from Python, with the official client (Ollama also serves an OpenAI-compatible API at `http://localhost:11434/v1`):

```python
# Runs locally: pip install ollama; needs the Ollama app running and `ollama pull gemma4` done
import ollama

reply = ollama.chat(model="gemma4", messages=[{"role": "user", "content": "Hi"}])
print(reply["message"]["content"])
```

</details>

### Hello world — vLLM (production)

<details>
<summary><strong>Read as text</strong> — serve a model and call it with the OpenAI client</summary>

```bash
pip install vllm
vllm serve Qwen/Qwen2.5-1.5B-Instruct --port 8000
```

Now hit `http://localhost:8000/v1/chat/completions` with the **OpenAI client** — vLLM is OpenAI-API-compatible:

```python
# Runs locally: pip install openai; needs the vLLM server above running on port 8000
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="not-needed")
reply = client.chat.completions.create(
    model="Qwen/Qwen2.5-1.5B-Instruct",
    messages=[{"role": "user", "content": "Hi"}],
)
print(reply.choices[0].message.content)
```

Most teams: **Ollama for dev, vLLM for prod.**

</details>

---

## 19.12 The Google AI Engineer Stack

![Infographic of Google Gemini Enterprise Agent Platform, formerly Vertex AI, renamed at Google Cloud Next on 22 Apr 2026 (as of Nov 2026). Layered diagram: Model Garden (Gemini, Gemma, Claude, 200+ models), Build (ADK in Python, TypeScript, Go, Java, or low-code Agent Studio), Run (Agent Runtime, formerly Agent Engine, with Sessions and Memory Bank), Govern and Measure (Agent Identity, Registry, Gateway, Agent Evaluation, Observability), plus classic MLOps Pipelines, Feature Store and Model Registry. Shows an ADK agent as name + model + instruction + tools with gemini-3.5-flash and adk deploy agent_engine, and a pick-by-question table for ADK, Genkit, LangChain and Agent Studio.](diagrams/fw19_info_google_agent_platform_ai.png)

<details>
<summary><strong>Read as text</strong> — what this section covers, and where the rest lives</summary>

If you're interviewing at Google, expect questions on this stack. This section is the developer view; the Gemini model line-up and TPU v7 Ironwood are in [Ch 20 §20.12](#content/20_2026_landscape), and the classic Vertex AI MLOps concepts (pipelines, feature store, endpoints, model registry) are taught in [Ch 30 §4](#content/30_google_ml_ecosystem).

</details>

### Vertex AI (now Gemini Enterprise Agent Platform)

<details>
<summary><strong>Read as text</strong> — the April 2026 rename and the platform components</summary>

At **Google Cloud Next 2026** (22 April 2026) Google launched **Gemini Enterprise Agent Platform** as "the evolution of Vertex AI": every Vertex AI service and future feature now ships inside it, and the agents you build there reach employees through the **Gemini Enterprise** app. Docs and APIs still show the old names in places (the runtime's API resource is still called `ReasoningEngine`). The components you'll talk about:

| Component | What it is |
|---|---|
| **Agent Development Kit (ADK)** | Open-source, code-first agent framework (Python, TypeScript, Go, Java); multi-agent, now with graph-based workflows |
| **Agent Studio** | Low-code visual builder; export to ADK when you need code |
| **Agent Runtime** (formerly Agent Engine) | Managed runtime — deployment, scaling, sessions, Memory Bank, long-running agents |
| **Agent Identity, Registry and Gateway** | Governance: every agent gets an identity, is listed, and goes through policy |
| **Agent Evaluation and Observability** | Evals and full execution traces for agents |
| **Model Garden** | 200+ models: Gemini and Gemma, plus third-party models such as Claude |
| **Pipelines, Feature Store, Model Registry** | The classic Vertex AI MLOps services (Pipelines run Kubeflow), now under the Agent Platform name |
| **Genkit** | Lighter open-source framework (TypeScript, Go, Python, Dart) for AI features inside apps; runs anywhere |

</details>

### Hello world — ADK agent

<details>
<summary><strong>Read as text</strong> — a minimal ADK agent and the one-command deploy</summary>

```python
# Runs locally: pip install google-adk; needs GOOGLE_API_KEY (or Google Cloud credentials)
# Save as search_assistant/agent.py, with search_assistant/__init__.py containing: from . import agent
from google.adk.agents import Agent
from google.adk.tools import google_search

root_agent = Agent(
    name="search_assistant",
    model="gemini-3.5-flash",
    description="Answers questions using Google Search.",
    instruction="Be concise and cite sources.",
    tools=[google_search],
)

# Local dev:  adk run search_assistant      (or `adk web` for a browser UI)
# Deploy:     adk deploy agent_engine --project=my-gcp --region=us-central1 search_assistant
#             (the CLI keeps the old "agent_engine" name; the target is Agent Runtime)
```

ADK's strength is the Google Cloud path: one command deploys to Agent Runtime, which adds IAM, agent identity, sessions, Memory Bank and tracing without extra wiring. ADK itself is open source and can call non-Gemini models. Genkit is the lighter option when you don't need multi-agent orchestration.

</details>

### When ADK vs Genkit vs LangChain

<details>
<summary><strong>Read as text</strong> — which framework for which job</summary>

- **ADK** — multi-agent systems, enterprise governance, deploying on Google Cloud (A2A and MCP built in).
- **Genkit** — AI features inside a web, mobile or backend app; broad model support, minimal ceremony.
- **LangChain / LangGraph** — neutral framework, multi-cloud, biggest community ([§19.2](#content/19_ai_frameworks)).

</details>

---

## 19.12a Model Access — Bedrock vs Azure vs Google Cloud ★★★

**In one line:** most enterprises do not call OpenAI or Anthropic directly — they call them *through* a cloud provider, and the reason is almost never price.

![Infographic comparing four model access routes as of Nov 2026: AWS Bedrock (Claude, GPT, Nova, open models; IAM, PrivateLink, AgentCore), Microsoft Foundry including Azure OpenAI (GPT, Claude, open models; Entra ID, data-zone residency), Google Agent Platform, formerly Vertex AI (Gemini, Claude, Gemma, 200+ models), and the direct provider API (newest models first), on a spectrum from compliance to newest models. A decision ladder: air-gapped means self-host or an on-prem appliance, data residency means a regional endpoint (direct API about +10%), otherwise use your existing cloud; plus a procurement table covering no-training terms, private networking, air-gapped Gemini on Google Distributed Cloud (GA Aug 2025) and SOC 2.](diagrams/fw19_info_model_access_routes_ai.png)

<details>
<summary><strong>Read as text</strong> — why teams go through a cloud, the four routes and the trade-off</summary>

**Why it exists.** AI-engineer job descriptions often ask for "AWS Bedrock" or "Azure OpenAI" rather than the raw provider SDKs. The reason is procurement and compliance: the model already sits inside a cloud account you have a contract, a security review and a data-processing agreement with. By 2026 each big cloud sells the frontier models of *several* labs, so the choice follows your cloud more than your model.

| Route (as of Nov 2026) | Frontier models it fronts | Why teams pick it |
|---|---|---|
| **AWS — Amazon Bedrock** | Anthropic Claude; OpenAI GPT (GPT-5.5 and 5.4 since June 2026); Amazon Nova; Meta, Mistral, Cohere and other open models | The AWS-native route: IAM, PrivateLink, one bill that counts toward AWS commitments. **Bedrock AgentCore** adds a managed agent runtime, memory, tool gateway and identity |
| **Azure — Microsoft Foundry** (formerly Azure AI Foundry; includes **Azure OpenAI**) | OpenAI GPT first-party on Azure; Anthropic Claude (since November 2025); open models | The Microsoft-shop route: Entra ID, regional and data-zone deployments for residency |
| **Google Cloud — Gemini Enterprise Agent Platform** (formerly Vertex AI) | Gemini first-party; Claude, Gemma and 200+ more in Model Garden | Native fit for GCP; the enterprise route to Gemini ([§19.12](#content/19_ai_frameworks)) |
| **Direct provider API** | That provider's own models | Newest models and beta features first, simplest to start, best docs |

**The trade-off worth stating:** going through a cloud provider can cost you *time to the newest model or feature* — a new release or beta tool may reach the provider's own API before a cloud catalogue — and buys you compliance, a single bill, existing IAM, and private networking. Startups take the direct API; regulated enterprises take the cloud route; plenty of teams run both behind a routing layer such as LiteLLM.

</details>

### Data residency, air-gapped and the questions procurement will ask

<details>
<summary><strong>Read as text</strong> — five procurement requirements and the interview answer</summary>

| Requirement | What it actually means | How it is met |
|---|---|---|
| **Data residency** | Prompts and completions must be processed in a named region | Regional endpoints on every cloud (Bedrock regional, Azure regional / data-zone, Google regional and multi-region). OpenAI and Anthropic now sell residency options on their own APIs too — typically at about a 10% price premium |
| **No training on our data** | The provider must not train on your inputs | Enterprise, API and cloud terms contract for this; consumer and free tiers may not |
| **Private networking** | Traffic must never traverse the public internet | VPC endpoints / Private Link |
| **Air-gapped** | No external network at all — defence, classified, some healthcare | Self-hosted open-weight models, or a vendor appliance in your data centre (Gemini on Google Distributed Cloud air-gapped has been GA since August 2025). No public API is an option |
| **SOC 2 / ISO 27001** | Audited controls, evidenced | Inherit the provider's attestations, but *your* application still needs its own |

> **The interview answer that lands:** "I'd choose the model access route from the compliance requirement first and the model quality second, because a model I'm contractually not allowed to send this data to has quality zero. Regional endpoints on our existing cloud — Bedrock in an AWS shop, Foundry on Azure, Agent Platform on Google Cloud — usually settle residency. If the requirement is genuinely air-gapped, no API is viable: I'm self-hosting an open-weight model or buying an on-prem appliance, which changes the whole architecture, so it's the first question I'd ask, not the last."

</details>

---

## 19.12b Governance — OWASP, Model Cards & Documentation ★★

**In one line:** the artefacts you produce so that someone else can audit what you shipped.

![Infographic on LLM governance: the OWASP Top 10 for LLM Applications 2026 edition (as of Nov 2026) as a ranked list LLM01 to LLM10 with each 2025 ID, highlighting prompt injection still number 1, excessive agency up from 6 to 3, unbounded consumption up from 10 to 6, improper output handling down from 5 to 10, and hidden context exposure (was system prompt leakage). An EU AI Act timeline: 2 Aug 2025 general-purpose model duties, 2 Aug 2026 enforceable, 2 Dec 2027 and 2 Aug 2028 high-risk rules. A paper-trail table: model card (Mitchell 2019), system card, eval report and datasheet (Gebru 2018), plus the OWASP Agentic Top 10 from ASI01 goal hijack to ASI10 rogue agents.](diagrams/fw19_info_governance_owasp_model_cards_ai.png)

### OWASP Top 10 for LLM Applications

<details>
<summary><strong>Read as text</strong> — the 2026 ranking, improper output handling and the agentic list</summary>

The standard vocabulary for LLM risk. You are expected to recognise the list and name the top entry. OWASP published a **2026 edition** in August 2026 that reordered eight of the ten entries; many docs and tools still use the 2025 numbers, so the table shows both.

| ID (2026) | Risk | 2025 ID | Where it is covered here |
|---|---|---|---|
| **LLM01** | **Prompt injection** — number one in every edition | LLM01 | [Ch 18b §18.10](#content/18b_agents_in_production) |
| LLM02 | Sensitive information disclosure | LLM02 | §19.12a above; PII filtering |
| **LLM03** | **Excessive agency** — up from sixth | LLM06 | [Ch 18b §18.14](#content/18b_agents_in_production) — least privilege, approval gates |
| LLM04 | Supply chain (models, adapters, MCP servers) | LLM03 | [Ch 18 §18.3](#content/18_ai_agents) — tool poisoning, rug pulls |
| LLM05 | Data and model poisoning | LLM04 | Training-data provenance |
| LLM06 | Unbounded consumption | LLM10 | Budgets and rate limits (§19.14) |
| LLM07 | Misinformation | LLM09 | Grounding, citations, abstention ([Ch 17b §7](#content/17b_llm_applications)) |
| LLM08 | Hidden context exposure (was "system prompt leakage") | LLM07 | Assume prompts, tool schemas and hidden context can leak; never put secrets in them |
| LLM09 | Vector and embedding weaknesses | LLM08 | [Ch 19 §19.9](#content/19_ai_frameworks) — multi-tenant ACLs |
| LLM10 | Improper output handling | LLM05 | Treat model output as untrusted input — escape it, never `eval` it |

**Improper output handling is the one engineers under-rate** (it fell to LLM10 in the 2026 ranking, and its scope grew to cover insecure code that AI assistants write). Model output routinely flows into a shell, a SQL string, an HTML page or a downstream API call. It is user-controlled data from an untrusted source — the same class of bug as XSS or SQL injection, and it gets treated as trusted because it "came from our model".

**Agents have their own list.** The OWASP **Top 10 for Agentic Applications** (published December 2025, labelled 2026) treats the agent as an actor with goals, credentials, tools and memory: ASI01 agent goal hijack through ASI10 rogue agents, including tool misuse, identity and privilege abuse, memory poisoning and cascading failures across agents. Threat-model an agent against both lists; the defences are in [Ch 18b](#content/18b_agents_in_production).

</details>

### Model cards and the paper trail

<details>
<summary><strong>Read as text</strong> — model cards, system cards and why they matter</summary>

A **model card** (Mitchell et al., 2019, *Model Cards for Model Reporting*) documents what a model is for: intended use, out-of-scope uses, training-data summary, evaluation results **broken out by relevant subgroup**, known limitations, and version. A **system card** does the same for the whole application, including the guardrails around the model; frontier labs publish one with each major model.

They matter for three practical reasons:

1. **Regulation.** Under the EU AI Act, providers of general-purpose AI models have had to keep technical documentation, inform downstream deployers and publish a training-data summary since 2 August 2025, and the Commission can enforce those duties from 2 August 2026. The rules for high-risk systems were pushed back to 2 December 2027 and 2 August 2028 by the 2026 "Digital Omnibus" (timeline in [Ch 20 §20.11](#content/20_2026_landscape)).
2. **Procurement.** Enterprise buyers will ask for one.
3. **Incidents.** "Which version shipped, evaluated how?" needs an answer within minutes.

| Artefact | Answers |
|---|---|
| Model card | What is this model for, and where does it fail? |
| System card | What does the whole product do, and what guards it? |
| Eval report | How do we know it works, on which data, at which version? |
| Datasheet (Gebru et al., 2018) | Where did the training or retrieval data come from, and may we use it? |

</details>

---

## 19.12c The Rest of the Stack — Data, Infra and the Job Itself ★★

![Infographic of the rest of the AI-engineer stack in three bands. Data layer: Snowflake or BigQuery documents flow through an embedding pipeline into Postgres + pgvector, Kafka change events trigger re-indexing, and traces go to ClickHouse. Infra layer: Docker as the unit of deployment, Kubernetes for GPU workloads, Terraform for GPU quota, VPC and IAM, CI/CD with golden-set evals. Five roles: AI Product, AI Platform, ML / Research, Forward Deployed and Inference engineers, with a JD keyword-to-role table and SOC 2 questions noting that a provider SOC 2 covers its endpoint, not your app.](diagrams/fw19_info_ai_stack_data_infra_roles_ai.png)

<details>
<summary><strong>Read as text</strong> — why this section exists</summary>

Job descriptions for AI engineers ask for a good deal that is not an LLM framework. This section closes that gap; each item links to its full treatment.

</details>

### The data layer

<details>
<summary><strong>Read as text</strong> — four data tools and where each kind of data lives</summary>

Retrieval has to be fed, and evaluation has to be measured — both need somewhere to put data.

| Tool | Role in an AI system | Depth |
|---|---|---|
| **PostgreSQL + pgvector** | A common default vector store — one database for rows *and* embeddings, no new infrastructure | [Ch 19 §19.9](#content/19_ai_frameworks) · [Ch 24](#content/24_system_design_data_distributed) |
| **Snowflake / BigQuery** | Content warehouse feeding the embedding pipeline; where the source of truth for documents usually lives | [Ch 24](#content/24_system_design_data_distributed) |
| **ClickHouse** | OLAP store for traces, token counts and eval results — the thing your quality dashboards query (Langfuse runs on it, and ClickHouse bought Langfuse in January 2026) | [Ch 24](#content/24_system_design_data_distributed) |
| **Kafka / streaming** | Change events that trigger incremental re-indexing, so retrieval stays fresh | [Ch 24](#content/24_system_design_data_distributed) |

**The pattern worth naming:** documents live in the warehouse, embeddings live in the vector store, traces and metrics live in the OLAP store. Conflating them — especially putting traces in your transactional database — is a common early mistake that gets expensive quickly.

</details>

### The infrastructure layer

<details>
<summary><strong>Read as text</strong> — Docker, Kubernetes, Terraform and CI/CD</summary>

| Skill | Why an AI engineer needs it | Depth |
|---|---|---|
| **Docker** | The unit of deployment for every serving stack | [Ch 22](#content/22_engineering_tools) |
| **Kubernetes** | How GPU workloads are scheduled and scaled in most companies | [Ch 22](#content/22_engineering_tools) · [Ch 25](#content/25_system_design_operations_case_studies) |
| **Terraform / IaC** | GPU quota, VPC endpoints and IAM are infrastructure — clicking them in a console is not reproducible | [Ch 22](#content/22_engineering_tools) |
| **CI/CD** | Where your golden-set evals run and block a bad prompt from shipping | [Ch 25 §16.4](#content/25_system_design_operations_case_studies) · [Ch 17c §4.3](#content/17c_llm_systems) |

</details>

### Compliance you will be asked about

<details>
<summary><strong>Read as text</strong> — SOC 2 and the questions that actually get asked</summary>

**SOC 2** is the audit most enterprise buyers require: evidence that you have controls over security, availability and confidentiality, and that you *follow* them. For an AI feature the questions that actually get asked are concrete — where does prompt data go, who can read traces, how long are they retained, is the provider contractually barred from training on your data, and can you delete a customer's data on request ([§19.9](#content/19_ai_frameworks)). Inheriting a provider's SOC 2 covers the model endpoint; it does **not** cover your application.

</details>

### The role itself

<details>
<summary><strong>Read as text</strong> — five AI-engineer profiles and how to read a JD</summary>

The JD landscape shifted, and knowing the vocabulary helps you target the right posting:

| Profile | What they actually do |
|---|---|
| **AI Product Engineer** | A very common 2026 hiring profile: full-stack plus LLMs plus evals plus RAG. Ships user-facing features end to end |
| **AI Platform Engineer** | Builds the shared internal layer — gateway, eval harness, tracing, model routing — that product teams build on |
| **ML / Research Engineer** | Training, fine-tuning, post-training. The chapter's distributed-training and post-training material targets this |
| **Forward Deployed Engineer (FDE)** | Embeds with a customer, builds the integration and the evals against *their* data, feeds requirements back. Heavy travel, high ambiguity, increasingly common |
| **Inference / Performance Engineer** | Serving throughput and cost — [Ch 17c](#content/17c_llm_systems) is the chapter for this role |

> **Reading the JD:** "evals" and "RAG" in the requirements means product engineering. "Distributed training", "FSDP" or "CUDA" means research or infra. "Customer-facing" plus "travel" means FDE. The same title covers all of these, so read the responsibilities rather than the heading.

</details>

---

## 19.13 MLOps — The Production Discipline

> **MLOps**: the practice of deploying, monitoring, and maintaining ML/AI systems in production reliably and at scale — DevOps for ML.

![Infographic of the MLOps loop: Data, Train, Evaluate, Deploy, Monitor, then Drift Detection triggers Retrain, which loops back to Train, with a Feature Store (Feast) beside Data and Experiment Tracking (MLflow) beside Train. A toolkit-by-stage table as of Nov 2026: DVC and lakeFS for data versioning, MLflow 3, W&B and Comet for experiment tracking, FastAPI, vLLM, SGLang and Dynamo-Triton for serving, Evidently AI and Arize for monitoring, Kubeflow, Airflow and Dagster for orchestration. Demo apps: FastAPI for an API on port 8000, Gradio for a model demo on port 7860, Streamlit for a dashboard; notes that hosted Neptune shut down in Mar 2026 and WhyLabs was wound down.](diagrams/fw19_info_mlops_lifecycle_tools_ai.png)

![The MLOps lifecycle: from data to deployment, with a retrain loop](diagrams/fw19_mlopslifecycle_ai.png)

<details>
<summary><strong>Read as text</strong> — the lifecycle loop as an ASCII diagram</summary>

The lifecycle, expanded:

```
  ┌─────────────────────────────────────────────────────────────┐
  │   ┌──────┐    ┌───────┐    ┌────────┐    ┌──────┐    ┌────┐ │
  │   │ Data │ ──►│ Train │ ──►│Evaluate│ ──►│Deploy│ ──►│Mon-│ │
  │   │      │    │       │    │        │    │      │    │itor│ │
  │   └──┬───┘    └───┬───┘    └────────┘    └──────┘    └─┬──┘ │
  │      │            │                                    │    │
  │      ▼            ▼                                    │    │
  │  ┌─────────┐  ┌──────────┐                             │    │
  │  │ Feature │  │Experiment│              ┌─────────┐    │    │
  │  │  Store  │  │ Tracking │ ◄───────────►│  Drift  │ ◄──┘    │
  │  │ (Feast) │  │ (MLflow) │              │Detection│         │
  │  └─────────┘  └──────────┘              └────┬────┘         │
  │                                              │              │
  │                               ┌──────────────┘              │
  │                               ▼                             │
  │                           Retrain ─────► back to Train      │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
```

</details>

### The toolkit by stage

<details>
<summary><strong>Read as text</strong> — the tools for each stage, as of Nov 2026</summary>

As of November 2026 (hosted Neptune shut down in March 2026 and WhyLabs was wound down after Apple bought it in 2025, so older lists that name them are out of date):

| Stage | Tools |
|---|---|
| Data versioning | DVC (stewarded by lakeFS since Nov 2025), lakeFS |
| Feature store | Feast, the cloud feature stores (Google Agent Platform, SageMaker, Databricks) |
| Experiment tracking | **MLflow 3**, W&B, Comet |
| Training | PyTorch, JAX, TensorFlow |
| Model registry | MLflow, Agent Platform Model Registry (ex-Vertex AI), SageMaker Model Registry |
| Serving | FastAPI, **vLLM**, SGLang, NVIDIA Dynamo-Triton, TF Serving |
| Monitoring | Evidently AI, Arize, the cloud providers' model monitoring |
| Pipeline orchestration | Kubeflow, Airflow, Agent Platform Pipelines (ex-Vertex AI), Dagster |
| CI/CD for ML | GitHub Actions, GitLab CI — with eval gates from §19.10 |

</details>

### Hello world — FastAPI model serving

<details>
<summary><strong>Read as text</strong> — serve a scikit-learn model behind a /predict endpoint</summary>

```python
# Runs locally: pip install fastapi uvicorn scikit-learn; save as main.py, start with: uvicorn main:app --port 8000
from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

# Stand-in for your real model: a tiny sentiment classifier trained at start-up
model = make_pipeline(TfidfVectorizer(), LogisticRegression()).fit(
    ["great product", "love it", "terrible", "waste of money"], [1, 1, 0, 0])

app = FastAPI()

class PredictRequest(BaseModel):
    text: str

@app.post("/predict")
def predict(req: PredictRequest):
    proba = model.predict_proba([req.text])[0]
    return {"prediction": int(proba.argmax()), "confidence": round(float(proba.max()), 3)}
```

</details>

### Hello world — Gradio demo

<details>
<summary><strong>Read as text</strong> — a classifier demo in the browser</summary>

```python
# Runs locally: pip install gradio scikit-learn; opens a demo at http://127.0.0.1:7860
import gradio as gr
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

model = make_pipeline(TfidfVectorizer(), LogisticRegression()).fit(
    ["great product", "love it", "terrible", "waste of money"], [1, 1, 0, 0])

def classify(text):
    p = model.predict_proba([text])[0]
    return {"negative": float(p[0]), "positive": float(p[1])}

gr.Interface(fn=classify, inputs="text", outputs="label").launch()
```

Built-in components for images, audio, video and file upload — handy for ML demos.

</details>

### Hello world — Streamlit dashboard

<details>
<summary><strong>Read as text</strong> — a Streamlit app that trains the model once</summary>

```python
# Runs locally: pip install streamlit scikit-learn; save as app.py, start with: streamlit run app.py
import streamlit as st
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

@st.cache_resource                     # train once, not on every rerun of the script
def load_model():
    return make_pipeline(TfidfVectorizer(), LogisticRegression()).fit(
        ["great product", "love it", "terrible", "waste of money"], [1, 1, 0, 0])

st.title("Model Demo")
text = st.text_input("Enter text")
if text:
    p = load_model().predict_proba([text])[0]
    st.json({"negative": round(float(p[0]), 3), "positive": round(float(p[1]), 3)})
```

Better than Gradio for data dashboards and internal tools.

</details>

### Hello world — MLflow experiment tracking

<details>
<summary><strong>Read as text</strong> — log a parameter, a metric and the model, plus the interview tip</summary>

```python
# Runs locally: pip install mlflow scikit-learn (MLflow 3 API: log_model(..., name=...))
import mlflow
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=0)

mlflow.set_experiment("classifier-demo")
with mlflow.start_run():
    C = 0.1
    model = LogisticRegression(C=C, max_iter=5000).fit(X_tr, y_tr)
    mlflow.log_param("C", C)
    mlflow.log_metric("auc", roc_auc_score(y_te, model.predict_proba(X_te)[:, 1]))
    mlflow.sklearn.log_model(sk_model=model, name="model")
```

The interview tip every Google ML system design candidate should internalise: **always mention monitoring and retraining**. "Deploy and forget" is the single biggest red flag in a system design interview.

</details>

---

## 19.14 Cost, Latency, Reliability

> **Production LLM system**: an LLM app that has to meet real-world SLOs on cost, latency, and reliability — not just demo quality.

![Infographic on LLM cost levers: cost = in_tokens x p_in + out_tokens x p_out, so 500 tokens in and 200 out at 5 and 25 USD per 1M tokens is 0.0075 USD per request, or 7,500 USD a day at 1M requests. Shows a cheap-first cascade flow and a table for a cheap tier 10x cheaper: all big 7,500 USD a day at p95 2.0 s, 4% escalation 1,050 (86% saved, p95 0.6 s), 20% 2,250 (70%, 2.6 s), 40% 3,750 (50%, 2.6 s), break-even at e = 90%. A line chart of caching saving vs hit rate with a 1.25x write premium: -15.6% at 0%, break-even at 22%, +49.1% at 90%, +56.2% at 100%, against a no-write-fee line.](diagrams/fw19_info_llm_cost_levers_ai.png)

<details>
<summary><strong>Read as text</strong> — the cost-per-request formula</summary>

> **Maths in one line:** `cost per request = in_tokens × p_in + out_tokens × p_out` — at 500 tokens in, 200 out and an illustrative 5 and 25 dollars per million tokens that is 0.0075 dollars a request, or 7,500 dollars a day at a million requests (the full capacity-and-cost walk-through is [Ch 17c §5.2](#content/17c_llm_systems)).

</details>

### Cost levers (in order of impact)

<details>
<summary><strong>Read as text</strong> — six levers with typical savings</summary>

As of November 2026:

| Lever | Typical savings | How |
|---|---|---|
| **Prompt caching** | Up to 90% on the cached prefix — more on some models | Put the stable part first (system prompt, tools, documents). Cache hits bill at 10% of the input price on most OpenAI and Claude models (5% on GPT-6.1 Sol and Terra and on Claude Opus and Sonnet 5.5, 2.5% on Fable 5.2), but writes can cost 1.25× ([Ch 17c §2.4](#content/17c_llm_systems)) |
| **Model routing / cascades** | 50–85% in the example below; depends on how much traffic the cheap model can keep | Easy → Haiku 5.5 / Gemini Flash-Lite / GPT-6 Luna; hard → Opus 5.5 / Gemini 4 Argon / GPT-6 Astra |
| **Batch APIs** | 50% | Anthropic, OpenAI and Gemini batch endpoints, for work that can wait (results within 24 h) |
| **Lower reasoning effort** | Large on reasoning models | Thinking tokens bill as output tokens; set the effort dial low for easy calls |
| **Trim the prompt** | Proportional to the tokens removed | Audit few-shot examples, tool definitions and chat history — they grow quietly |
| **Smaller embedding model** | Cheaper embedding and a smaller index | Measure recall@k on your own data before switching |

</details>

### Worked example — a cheap-first cascade

<details>
<summary><strong>Read as text</strong> — cascade vs router and the break-even formula</summary>

A **cascade** sends every request to a cheap model first and escalates the share `e` it cannot handle (low confidence, failed validation) to a big model. A **router** decides up front, so each request pays for one model only.

> **Maths in one line:** `cascade = c_small + e × c_big`, `router = (1 − e) × c_small + e × c_big` — and a cascade only costs more than "always big" once `e > 1 − c_small / c_big`.

The program uses Ch 17c's traffic (1M requests a day, 500 tokens in, 200 out) with illustrative prices: a top tier at 5 and 25 dollars per million tokens and a cheap tier ten times cheaper (real gaps between tiers today are 10–40×).

</details>

```python
# Model cascade: every request tries the cheap model, a share e escalates to the big one
import numpy as np

REQUESTS, TOK_IN, TOK_OUT = 1_000_000, 500, 200        # per day; tokens per request (Ch 17c §5.2)
BIG = {"p_in": 5.00, "p_out": 25.00, "latency": 2.0}    # illustrative top tier: USD per 1M tokens, seconds
SMALL = {"p_in": 0.50, "p_out": 2.50, "latency": 0.6}   # illustrative cheap tier
rng = np.random.default_rng(0)

def per_request(m):
    return (TOK_IN * m["p_in"] + TOK_OUT * m["p_out"]) / 1e6

c_big, c_small = per_request(BIG), per_request(SMALL)
print(f"All big:   {REQUESTS * c_big:>6,.0f} USD/day, every answer {BIG['latency']:.1f} s")
print(f"All small: {REQUESTS * c_small:>6,.0f} USD/day, every answer {SMALL['latency']:.1f} s")
print(f"{'e':>5} {'cascade':>8} {'saving':>7} {'router':>7} {'mean s':>7} {'p50 s':>6} {'p95 s':>6}")
for e in [0.04, 0.20, 0.40]:
    cascade = c_small + e * c_big              # all pay small; e of them pay big as well
    router = (1 - e) * c_small + e * c_big     # a router picks one model up front
    escalated = rng.random(10_000) < e
    lat = np.where(escalated, SMALL["latency"] + BIG["latency"], SMALL["latency"])
    print(f"{e:>5.0%} {REQUESTS * cascade:>8,.0f} {1 - cascade / c_big:>7.0%} {REQUESTS * router:>7,.0f} "
          f"{lat.mean():>7.2f} {np.percentile(lat, 50):>6.1f} {np.percentile(lat, 95):>6.1f}")

break_even = 1 - c_small / c_big            # cascade = all-big when e reaches this
assert abs(break_even - 0.9) < 1e-9 and c_small + 0.2 * c_big < c_big
print(f"Cascade only costs more than all-big if over {break_even:.0%} of requests escalate.")
```

**Output:**

```
All big:    7,500 USD/day, every answer 2.0 s
All small:    750 USD/day, every answer 0.6 s
    e  cascade  saving  router  mean s  p50 s  p95 s
   4%    1,050     86%   1,020    0.68    0.6    0.6
  20%    2,250     70%   2,100    0.98    0.6    2.6
  40%    3,750     50%   3,450    1.40    0.6    2.6
Cascade only costs more than all-big if over 90% of requests escalate.
```

<details>
<summary><strong>Read as text</strong> — continued: the savings, the router and the latency tail</summary>

At 4% escalation the cascade saves 86%; even at 40% it still saves half. A **router** that picks one model up front is a little cheaper (2,100 against 2,250 USD a day at 20%) and avoids the double wait, but it has to predict difficulty before seeing any answer. The catch with a cascade is the tail: once more than 5% of requests escalate, the p95 latency jumps from 0.6 s to 2.6 s, because escalated users wait for both models. The program also leaves out the check that decides to escalate — a validator or small judge adds a little to every request.

</details>

### Worked example — when prompt caching pays

<details>
<summary><strong>Read as text</strong> — the write premium and the break-even hit rate</summary>

Caching is not free. Where the provider charges a cache **write** premium (1.25× the input price for a 5-minute Claude cache and for OpenAI's GPT-6 models), every miss costs *more* than no caching at all. The example: a 2,000-token cached prefix (system prompt and tool definitions), 200 new user tokens and a 200-token answer, at an illustrative 2 and 10 dollars per million tokens.

> **Maths in one line:** `break-even hit rate = (w − 1) / (w − r)` for write multiplier `w` and read multiplier `r` — (1.25 − 1) / (1.25 − 0.10) ≈ 22%.

</details>

```python
# When does prompt caching pay? Bill per request vs cache hit rate, with and without a write premium
PREFIX, USER, OUT = 2_000, 200, 200   # tokens: cached system prompt + tools, new user text, answer
P_IN, P_OUT = 2.00, 10.00             # illustrative mid-tier price, USD per 1M tokens
READ, WRITE = 0.10, 1.25              # cache hit = 10% of the input price; cache write = 125%

def cost(hit_rate, write):
    prefix_mult = hit_rate * READ + (1 - hit_rate) * write    # every miss (re)writes the cache
    return (PREFIX * P_IN * prefix_mult + USER * P_IN + OUT * P_OUT) / 1e6

base = cost(0.0, 1.0)                 # no caching at all
print(f"No caching: {base * 1e6:,.0f} USD per 1M requests")
print(f"{'hit rate':>8} {'write 1.25x':>12} {'no write fee':>13}")
for h in [0.0, 0.15, 0.25, 0.5, 0.9, 1.0]:
    a, b = 1 - cost(h, WRITE) / base, 1 - cost(h, 1.00) / base
    print(f"{h:>8.0%} {a:>+12.1%} {b:>+13.1%}")

break_even = (WRITE - 1) / (WRITE - READ)   # hit rate where the write premium is paid back
assert abs(break_even - 0.2174) < 1e-4 and cost(0.25, WRITE) < base < cost(0.15, WRITE)
print(f"With a {WRITE}x write premium caching only pays above a {break_even:.0%} hit rate.")
print(f"Ceiling: a 100% hit rate saves {1 - cost(1.0, WRITE) / base:.0%}; new user text and the answer are never cached.")
```

**Output:**

```
No caching: 6,400 USD per 1M requests
hit rate  write 1.25x  no write fee
      0%       -15.6%         +0.0%
     15%        -4.8%         +8.4%
     25%        +2.3%        +14.1%
     50%       +20.3%        +28.1%
     90%       +49.1%        +50.6%
    100%       +56.2%        +56.2%
With a 1.25x write premium caching only pays above a 22% hit rate.
Ceiling: a 100% hit rate saves 56%; new user text and the answer are never cached.
```

<details>
<summary><strong>Read as text</strong> — continued: the break-even and the 56% ceiling</summary>

Below a 22% hit rate this setup loses money; above it the saving climbs to a ceiling of 56%. The right-hand column is a provider that charges no write premium — there caching can only help. Hit rate is a traffic property: a cached prefix expires after a few minutes of silence unless you pay for a longer cache, so a prompt used once an hour keeps missing.

</details>

### Latency levers

![Infographic on LLM reliability: retries fix blips, fallbacks fix outages. Formula P(success within k tries) = 1 - p^k, so 1 - 0.08^3 = 99.95% for three tries only if failures are independent. A timeline of one unlucky request: primary try 1 fails, sleep random(0, 0.5 s), try 2 fails, sleep random(0, 1 s), try 3 fails, switch to the secondary, which succeeds, with backoff(n) = min(cap, base x 2^n). Table for 10,000 requests with 8% transient errors and 5% in an outage: one try 87.22% success, 3 tries 94.97% at 1.184 calls per request, 3 tries plus fallback 100.00% at 1.236 calls per request, p99 wait 1.06 s.](diagrams/fw19_info_reliability_retries_fallback_ai.png)

<details>
<summary><strong>Read as text</strong> — five ways to cut latency</summary>

- **Streaming** — send tokens as they're generated; the user sees text at time-to-first-token instead of waiting for the whole answer.
- **Parallel tool calls** — independent calls fire concurrently.
- **Prefix caching** — reuse the KV cache of a shared prefix, which also cuts time-to-first-token (provider prompt caching; vLLM automatic prefix caching; SGLang RadixAttention).
- **Lower reasoning effort or a smaller tier** — fewer thinking tokens, faster answers.
- **Edge inference** — small local models for hot paths (Gemma 4 E2B / E4B, Llama 3.2 1B / 3B, Gemini Nano, Phi-4-mini).

</details>

### Reliability patterns

<details>
<summary><strong>Read as text</strong> — six patterns and what each prevents</summary>

| Pattern | What it prevents |
|---|---|
| **Structured outputs** — a strict JSON schema enforced at decode time ([Ch 17b §8.6](#content/17b_llm_applications)) | Parser failures |
| **Guardrails** — input and output filters (NeMo Guardrails, Llama Guard 4, provider moderation) | Unsafe input reaching the model, unsafe output reaching the user |
| **Retries with exponential backoff + jitter** on 429, 503 and timeouts ([Ch 25](#content/25_system_design_operations_case_studies)) | Brief blips turning into user-visible errors — without causing a retry storm |
| **Fallback chain** — the next model or another provider (LiteLLM, OpenRouter) | One provider's outage taking you down |
| **Timeout budgets** — per step, per task, per session | One slow call hanging the whole request |
| **Idempotency keys** on tools that cost money | Charging a card twice when an agent retries |

</details>

### Worked example — retries vs fallback

<details>
<summary><strong>Read as text</strong> — the setup and the retry maths</summary>

Retries fix blips; fallbacks fix outages. The program sends 10,000 requests to a primary provider with an 8% transient error rate, and requests 4,000–4,499 (5%) arrive while it is down. Waits follow Ch 25: `backoff(n) = min(cap, base × 2ⁿ)` with full jitter, `sleep = random(0, backoff(n))`.

> **Maths in one line:** with independent failures, `P(success within k tries) = 1 − pᵏ` — 1 − 0.08³ = 99.95% for three tries. An outage is not independent, so retries alone can never beat 95% here.

</details>

```python
# Retries fix blips, fallbacks fix outages: a seeded fallback chain with exponential backoff + jitter
import numpy as np

N = 10_000                                        # requests
BASE, CAP = 0.5, 4.0                              # seconds: backoff(n) = min(CAP, BASE * 2**n)
P_FAIL = {"primary": 0.08, "secondary": 0.05}     # transient error rate per call (429 / 503 / timeout)
OUTAGE = range(4_000, 4_500)                      # 5% of requests arrive while the primary is down

def run(chain, seed=0):
    rng = np.random.default_rng(seed)
    ok, calls, waits = 0, 0, np.zeros(N)
    for i in range(N):
        for provider, attempts in chain:
            done = False
            for n in range(attempts):
                calls += 1
                down = provider == "primary" and i in OUTAGE
                if not down and rng.random() >= P_FAIL[provider]:
                    done = True
                    break
                if n < attempts - 1:              # full jitter: sleep a random share of the backoff
                    waits[i] += rng.uniform(0, min(CAP, BASE * 2 ** n))
            if done:
                ok += 1
                break
    return ok / N, calls / N, waits.mean(), np.percentile(waits, 99)

strategies = {"primary, 1 try": [("primary", 1)],
              "primary, 3 tries": [("primary", 3)],
              "primary x3 -> secondary x2": [("primary", 3), ("secondary", 2)]}
print(f"{'strategy':<27} {'success':>8} {'calls/req':>9} {'mean wait':>9} {'p99 wait':>8}")
results = {}
for name, chain in strategies.items():
    results[name] = run(chain)
    s, c, w, p99 = results[name]
    print(f"{name:<27} {s:>8.2%} {c:>9.3f} {w:>8.3f}s {p99:>7.2f}s")

s1, s3, sc = (results[k][0] for k in strategies)
assert s1 < s3 < sc and sc > 0.999
print("Retries rescue the transient 8%; only the fallback rescues the 5% outage.")
```

**Output:**

```
strategy                     success calls/req mean wait p99 wait
primary, 1 try                87.22%     1.000    0.000s    0.00s
primary, 3 tries              94.97%     1.184    0.060s    1.06s
primary x3 -> secondary x2   100.00%     1.236    0.060s    1.06s
Retries rescue the transient 8%; only the fallback rescues the 5% outage.
```

<details>
<summary><strong>Read as text</strong> — continued: what the retries and the fallback each buy</summary>

Three tries lift success from 87% to 95% for about 18% more calls; only the fallback rescues the outage requests. The price is latency for the unlucky few — about a second of backoff at the 99th percentile.

</details>

---

## 19.15 Decision Tree — Pick the Right Tool

![Infographic decision map from What are you building? to twelve job-to-tool cards as of Nov 2026: single LLM call to the raw provider SDK, chat with your PDFs to LlamaIndex, production agent to LangChain + LangGraph, multi-agent with roles to CrewAI, conversational multi-agent to Microsoft Agent Framework (AutoGen archived), typed agent to Pydantic AI or Instructor, prompt optimisation to DSPy, Google Cloud to ADK + Agent Runtime, AWS to Bedrock AgentCore, fine-tuning to TRL + PEFT, evals to Ragas / DeepEval + Langfuse, serving to vLLM. Lists ten pitfalls including multi-agent everywhere at about 15x the tokens of a chat (one agent about 4x), TGI archived, mocking the LLM in evals and unpinned model versions.](diagrams/fw19_info_tool_picker_pitfalls_ai.png)

```
  What are you building?
            │
            ├── Single LLM call, 50 lines        → Raw provider SDK (OpenAI / Anthropic / google-genai)
            │
            ├── Chat-with-my-PDFs / wiki         → LlamaIndex
            │
            ├── Agent with tools, prod-grade     → LangChain + LangGraph
            │
            ├── Multi-agent with roles           → CrewAI
            │
            ├── Multi-agent with conversation    → Microsoft Agent Framework (AutoGen is archived) or LangGraph
            │
            ├── Type-safe agent, validation      → Pydantic AI or Instructor
            │
            ├── Optimise prompts with evals      → DSPy
            │
            ├── Building on Google Cloud         → ADK + Agent Runtime
            │
            ├── Building on AWS                  → Bedrock AgentCore (runs any framework)
            │
            ├── Fine-tune / LoRA                 → HuggingFace TRL + PEFT
            │
            ├── Evals and tracing                → Ragas / DeepEval in CI + Langfuse, LangSmith or Phoenix
            │
            └── Serve a model at scale           → vLLM (SGLang for heavy prefix reuse)
```

---

## 19.16 What Goes Wrong (Pitfalls)

<details>
<summary><strong>Read as text</strong> — ten pitfalls and how to avoid them</summary>

1. **Adopting a framework before you have evals.** You'll churn through three frameworks before realising the problem was your prompt or your retrieval.
2. **Multi-agent for everything.** Every agent turn is an LLM call. Anthropic measured its multi-agent research system using about 15× the tokens of a plain chat (a single agent: about 4×). Justify the agents.
3. **Treating prompts as throwaway strings.** Version them, eval them, store them in a registry (MLflow, LangSmith, Langfuse).
4. **Skipping reranking in RAG.** Often the biggest single quality win after the embedding model ([§19.9](#content/19_ai_frameworks)).
5. **Vector-only retrieval.** Hybrid (vector + BM25) wins on real workloads.
6. **TGI in new projects.** It has been archived (read-only) since March 2026. Use vLLM or SGLang.
7. **No monitoring.** "Deploy and forget" gets red-flagged in interviews and breaks in production within weeks.
8. **Mocking the LLM in evals.** A mock tests your plumbing, not your quality. Run evals against the real, pinned model; cache responses only to make CI reruns cheap, and clear the cache when the prompt or model changes.
9. **Unpinned model versions.** An alias such as `-latest` can change under you. Pin the dated snapshot and re-run the golden set before you move.
10. **Choosing an observability SaaS your data may not enter.** Check "can traces leave our VPC?" first (§19.10) — migrating later is painful.

</details>

---

## 19.17 Interview Questions

**Q1. When would you choose LangGraph over LangChain?**
LangChain is enough for linear chains and a single-agent loop with tools. Use LangGraph when the workflow needs cycles, branching, durable state across crashes, or human-in-the-loop pauses — e.g. a multi-day approval workflow or an agent that loops between research and refine until a check passes.

**Q2. LangChain vs LlamaIndex — when each?**
LangChain is the generalist (agents, tools, broad integrations). LlamaIndex is specialised for connecting LLMs to data — better document parsing, chunking, and retrieval primitives. Many production stacks use LlamaIndex for the RAG layer and LangChain/LangGraph for the agent layer.

**Q3. Why is DSPy interesting?**
It treats prompts as code that gets compiled. You declare a signature (input → output types) and provide an eval set; DSPy's optimisers (MIPROv2, BootstrapFewShot, GEPA) search for better instructions and examples against your metric. The original DSPy paper (2023) reported gains of over 25% (GPT-3.5) and over 65% (Llama-2-13B-chat) against standard few-shot prompting on its tasks; your gain depends on your task and metric. When you swap models you re-compile instead of re-tuning prompts by hand.

**Q4. Why has TGI fallen out of favour?**
Hugging Face moved TGI into maintenance mode in December 2025 and archived the repository in March 2026; it recommends vLLM or SGLang (llama.cpp or MLX locally). New model support and features land there. vLLM is the default: continuous batching plus PagedAttention (the vLLM paper reports about 2–4× the throughput of earlier servers), an OpenAI-compatible API and broad hardware support.

**Q5. Walk me through evaluating a RAG system.**
Three layers. **Offline**: a curated test set scored on faithfulness (answer matches sources), context precision (relevant chunks retrieved), answer relevancy. Tools: Ragas, DeepEval. **Online**: LLM-as-judge sampling live traffic — about 1% of a million daily requests already pins the pass rate to ±0.6 points. Tools: LangSmith, Braintrust, Langfuse. **Tracing**: every retrieval, prompt, tool call. Tools: LangSmith, Langfuse, Phoenix, MLflow 3. The concepts behind each layer are in [Ch 17c §4](#content/17c_llm_systems).

**Q6. How would you choose a vector DB?**
Three axes: scale, ops, hybrid-search needs. <10M vectors and already on Postgres → pgvector. 10M–1B → Qdrant/Weaviate/Milvus self-hosted, or Pinecone managed. >1B → Vespa or distributed Milvus. If exact-match (IDs, names, version numbers) matters, prefer one with native hybrid search (Weaviate, Qdrant, Vespa).

**Q7. Name three failure modes of vanilla RAG and the fix for each.**
- Wording mismatch → **HyDE** (generate hypothetical answer, embed *that*).
- Top-k by similarity ≠ top-k by meaning → **reranker** (Cohere Rerank, BGE).
- Multi-part question → **query rewriting** (LLM splits into sub-queries).

**Q8. What's prompt caching and why does it matter?**
The provider keeps the processed prefix of your prompt (system prompt, tool definitions, long documents) and bills later hits at a fraction of the input price — 10% on OpenAI and most Claude models, as little as 2.5% on some. For a chatbot that resends a 2,000-token system prompt on every turn it is often the biggest single cost lever. The catch: writes can cost 1.25×, so with a 10% read price it only pays above a ~22% hit rate. Anthropic, OpenAI and Gemini all support it.

**Q9. Walk me through deploying a fine-tuned LLM at Google.**
Fine-tune with HuggingFace TRL + PEFT (LoRA/QLoRA) → log experiments to MLflow / W&B → register in the Agent Platform Model Registry (formerly Vertex AI Model Registry) → deploy to an Agent Platform Inference endpoint, or serve it with vLLM on GKE → monitor input drift, quality and cost → retrain on a schedule or a trigger. (Agent Runtime hosts *agents*, not raw model weights.)

**Q10. What's the role of structured outputs in production?**
LLM responses constrained to a JSON Schema at decode time. Eliminates parser failures, JSON fence noise, and the "sometimes the model decides to add a preamble" class of bugs. OpenAI Structured Outputs, Anthropic structured outputs (`output_config.format`, plus `strict` tool inputs), Gemini JSON-schema responses, and Pydantic AI / Instructor as cross-provider wrappers — details in [Ch 17b §8.6](#content/17b_llm_applications).

**Q11. Your LLM provider has a 30-minute outage. What does your app do?**
Retries with exponential backoff and jitter (bounded, honouring `Retry-After`) absorb transient 429s and 503s, but an outage is correlated, so retries alone stall. A fallback chain behind a gateway (LiteLLM, OpenRouter, or your own) moves traffic to a second model or provider, with a circuit breaker so you stop hammering the primary. In the §19.14 simulation, three tries lift success from 87% to 95%; only the fallback rescues the outage traffic. Run the golden set on the fallback model too — prompts do not transfer perfectly.

**Q12. When does prompt caching cost you more than it saves?**
When the hit rate is below break-even: with a 1.25× write price and a 0.1× read price, `(1.25 − 1) / (1.25 − 0.1)` ≈ 22%. Low-traffic prompts expire between uses, and anything variable placed *before* the stable prefix (a timestamp, the user's name) makes every request a miss. Even at a 100% hit rate the saving is capped, because the new user text and the output are never cached — 56% in the §19.14 example.

**Q13. Which OWASP risks do you prioritise for a tool-using agent?**
Prompt injection (LLM01) — especially indirect injection through documents and tool output; excessive agency (LLM03 in the 2026 list, up from sixth) — least privilege, scoped credentials, approval gates; and improper output handling (LLM10) — never pass model output to a shell, SQL or `eval` unchecked. For agents, also threat-model against OWASP's separate Top 10 for Agentic Applications (goal hijack, tool misuse, memory poisoning, rogue agents).

**Q14. Bedrock, Azure Foundry or Google's Agent Platform — how do you choose?**
Start from compliance and the cloud the company already runs on: residency, private networking, "no training on our data" terms and an existing contract decide most of it. Model choice rarely forces the cloud any more — Claude is on all three, OpenAI's GPT models are on Azure and (since June 2026) Bedrock, and Gemini's enterprise route is Google's platform. Use the direct API when you need the newest features first, and a routing layer if you use both.

---

## 19.18 Key Takeaways

- **Frameworks are leverage, not a substitute for taste.** Pick by mental model fit, not popularity.
- **LangChain + LangGraph** (1.0 GA Oct 2025; 1.4 / 1.2 in Nov 2026) are the safe production default for general agents. For conversational multi-agent work, AutoGen is archived — its successor is **Microsoft Agent Framework** (1.0, Apr 2026).
- **LlamaIndex** wins when the value is in the data, not the agent loop.
- **DSPy** if you have evals: "compiling" is a search over instructions and demos scored by your metric — confirm the winner on a held-out dev set, because with a dozen examples the top score can be luck.
- **Pydantic AI** if you want types and validation in your agent. Under every such library is a capped validate-and-retry loop that feeds the error back; at failure rate f it costs 1 / (1 − f) calls per item, and a schema guarantees shape, not correctness.
- **Evals need one CI tool plus one platform** (Ragas or DeepEval in CI; Langfuse, LangSmith, Phoenix or Braintrust for traces). Ask "can traces leave our VPC?" first — Langfuse and Phoenix self-host.
- **Online judges only need a sample**: about 1% of a million daily requests pins a 90% pass rate to ±0.6 points; judging everything costs 100× more.
- **vLLM is the default inference server.** **TGI is archived** (maintenance since Dec 2025, read-only since Mar 2026) — migrate to vLLM or SGLang.
- **Google renamed Vertex AI** to **Gemini Enterprise Agent Platform** (Apr 2026): ADK to build, Agent Runtime (formerly Agent Engine) to run, Agent Studio for low-code.
- **Pick the model-access route from compliance first.** Bedrock, Microsoft Foundry and Google's platform each front several labs' models now; air-gapped means self-hosted open weights or an on-prem appliance.
- **OWASP LLM Top 10, 2026 edition:** prompt injection is still #1 and excessive agency rose to #3; agents also need OWASP's Agentic Top 10.
- **Hybrid search beats pure vector** on most production RAG workloads — fuse the keyword and vector rankings with reciprocal rank fusion, Σ 1/(60 + rank), which needs ranks only. **Reranking** is often the biggest RAG quality win after embeddings.
- **Give chunks their context and filter early:** contextual retrieval or late chunking fixes chunks that lose their subject; apply access-control filters *inside* the search, because post-filtering a global top-50 for a user who may see 2% of the index leaves about one result.
- **Prompt caching and model routing are the biggest cost levers** — but caching with a 1.25× write premium only pays above a ~22% hit rate, and a cascade's saving comes with a slower tail.
- **Retries fix blips; fallbacks fix outages.** Use backoff with jitter, a fallback provider and timeout budgets.
- **MLflow 3** (2025; 3.18 in Nov 2026) covers classic ML and GenAI in one tool.
- "Deploy and forget" is a system design red flag. **Always plan monitoring and retraining.**

---

## 19.19 Review Questions

1. You're building a "chat with my company's 10K PDFs" app. Which framework do you reach for first, and why?
2. A junior engineer wires every feature through CrewAI by default. What's the cost concern, and when *should* you choose CrewAI?
3. Your RAG pipeline retrieves the right document but the model answers wrong. List three things you'd check first.
4. Your team has 50M monthly chatbot calls. Two cost levers above all else — which?
5. You're standing up a vector DB for an internal app (~5M docs, team already runs Postgres). Pick one and defend it.
6. A teammate says "we'll evaluate after launch." Why is that wrong, and what minimum bar should you ship with?
7. Why is TGI no longer an option for new projects? What replaced it and why?
8. Walk through the MLOps lifecycle of a production GenAI app, naming a tool for each stage.
9. When does Pydantic AI beat a raw `client.responses.parse(..., text_format=MyModel)` call with a Pydantic schema?
10. You hit `lost-in-the-middle` on a 200K-token prompt. Three concrete fixes.
11. Your legal team says prompts and traces must never leave your VPC. Which eval/observability tools are still on the table, and why?
12. A cascade sends every request to a cheap model and escalates 20% to a big one that costs 10× more. Roughly what share of the all-big bill do you pay, and what happens to p95 latency?
13. Your cache hit rate is 15% and the provider charges 1.25× for cache writes. Is caching saving money? What would you change?
14. Name the top three entries of the 2026 OWASP LLM Top 10 and one defence for each.
15. Your DSPy-compiled prompt scores 0.95 on its 12 training examples but 0.70 in production. What went wrong, and what do you change?
16. 20% of replies fail schema validation. How many model calls per item do you expect, and what two things must the retry loop do?
17. Doc A is rank 1 in BM25 and rank 3 in vector search; doc B is rank 3 and rank 2. Which wins under reciprocal rank fusion with k = 60?
18. A user can see 2% of a 1M-chunk index. You fetch the global top-50, then drop the chunks they may not see. How many results do you expect, and what is the fix?
19. Why does the chunk "Revenue grew 3% over the previous quarter" retrieve poorly? Name two fixes.

---

**Previous:** [Chapter 18b — Agents in Production](#content/18b_agents_in_production) | **Next:** [Chapter 20 — The 2026 AI Landscape](#content/20_2026_landscape)
