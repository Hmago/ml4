# Chapter 8 — Reinforcement Learning

---

## What You'll Learn

After reading this chapter, you will be able to:
- Explain the RL loop: agent, environment, state, action, reward
- Distinguish exploration vs exploitation and describe epsilon-greedy
- Explain Q-Learning and the Bellman equation with a concrete example
- Describe how DQN scales Q-Learning to complex problems
- Understand Policy Gradient methods and why they exist
- Explain Actor-Critic as combining value and policy approaches
- Connect RLHF to how modern LLMs (ChatGPT, Claude) are trained

---

## What is Reinforcement Learning?

### Simple Explanation
Imagine training a puppy. You don't tell it exactly what to do step by step.
Instead:
- When the puppy sits when told → **Treat!** (reward)
- When the puppy chews your shoes → **"No!"** (penalty)

Over time, the puppy learns which actions lead to treats. That's Reinforcement Learning!

```
             THE REINFORCEMENT LEARNING LOOP
             ─────────────────────────────────

                    ┌─────────────┐
                    │ ENVIRONMENT │
                    │ (the world) │
                    └─────────────┘
                     ↑           │
              Action │           │ State + Reward
                     │           ↓
                    ┌─────────────┐
                    │    AGENT    │
                    │ (the model) │
                    └─────────────┘

  Agent SEES state → Takes ACTION → Gets REWARD → Learns from it
```

**Official Definition:**
> **Reinforcement Learning (RL)** is a type of ML where an agent learns to make decisions by
> interacting with an environment. The agent takes actions, receives rewards (positive or negative),
> and learns a policy (strategy) that maximizes cumulative long-term reward. Unlike supervised
> learning, there is no labeled dataset — the agent learns through trial and error.

---

## The Core Components of RL

```
┌────────────────────────────────────────────────────────────────┐
│                    RL COMPONENTS                               │
├─────────────────┬──────────────────────────────────────────────┤
│ AGENT           │ The learner / decision maker                 │
│                 │ Examples: Robot, Game AI, Trading bot        │
├─────────────────┼──────────────────────────────────────────────┤
│ ENVIRONMENT     │ The world the agent interacts with           │
│                 │ Examples: Chess board, city streets, market  │
├─────────────────┼──────────────────────────────────────────────┤
│ STATE (s)       │ The current situation the agent observes     │
│                 │ Examples: Board position, car's position     │
├─────────────────┼──────────────────────────────────────────────┤
│ ACTION (a)      │ What the agent can do                        │
│                 │ Examples: Move left/right, buy/sell          │
├─────────────────┼──────────────────────────────────────────────┤
│ REWARD (r)      │ Feedback signal (+ good, - bad)              │
│                 │ Examples: +1 for winning, -1 for losing      │
├─────────────────┼──────────────────────────────────────────────┤
│ POLICY (π)      │ The agent's strategy: state → action         │
│                 │ What to do in each situation                 │
├─────────────────┼──────────────────────────────────────────────┤
│ VALUE FUNCTION  │ Expected total reward from a state           │
│                 │ "How good is it to be in this situation?"    │
└─────────────────┴──────────────────────────────────────────────┘
```

---

## RL in Action: Training a Game-Playing Agent

```
GAME: Simple grid world
Goal: Reach the treasure, avoid the pit!

  ┌───┬───┬───┬───┐
  │ S │   │   │   │    S = Start
  ├───┼───┼───┼───┤    T = Treasure (+10 reward)
  │   │ ■ │   │   │    ■ = Wall (can't go here)
  ├───┼───┼───┼───┤    P = Pit (-10 reward)
  │   │   │ P │ T │
  └───┴───┴───┴───┘

EPISODE 1 (random moves):
─────────────────────────
  Start → Down → Down → Right → FELL IN PIT!
  Total reward: -10  ← Bad!

EPISODE 2 (random moves):
─────────────────────────
  Start → Right → Right → Right → Down → Down → TREASURE!
  Total reward: +10  ← 

EPISODE 1000 (learned policy):
──────────────────────────────
  Start → Right → Right → Right → Down → Down → TREASURE!
  Agent learned the OPTIMAL path!

Agent's learned policy (arrows = best action to take):
  ┌───┬───┬───┬───┐
  │ → │ → │ → │ ↓ │
  ├───┼───┼───┼───┤
  │ ↓ │ ■ │ → │ ↓ │
  ├───┼───┼───┼───┤
  │ → │ → │ ↑ │ T │
  └───┴───┴───┴───┘
```

```chart
{
  "type": "line",
  "data": {
    "labels": [1,50,100,200,300,400,500,600,700,800,900,1000],
    "datasets": [{
      "label": "Average Reward per Episode",
      "data": [-8,-5,-2,0,2,4,5.5,6.5,7.5,8.2,8.8,9.2],
      "borderColor": "rgba(99, 102, 241, 1)",
      "backgroundColor": "rgba(99, 102, 241, 0.1)",
      "fill": true,
      "tension": 0.4,
      "pointRadius": 2
    }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "RL Agent Learning — Reward Increases Over Episodes (Grid World)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Average Reward" }, "min": -10, "max": 10 },
      "x": { "title": { "display": true, "text": "Episode" } }
    }
  }
}
```

---

## Key RL Concept: Exploration vs. Exploitation

### Simple Explanation
Imagine you're in a new city with 10 restaurants. You've found one you love.
Do you keep going to your favorite (exploitation), or try new ones in case there's
an even better one (exploration)?

```
EXPLOITATION only:                EXPLORATION only:
──────────────────────            ──────────────────────
Always pick the best              Always try something new
known action                      even if you found the best

   Agent is GREEDY                Agent is RANDOM
   (can miss better               (never uses what it
   options!)                       has learned!)

              BALANCE IS KEY!
              ─────────────────────────────
              ε-greedy strategy:
              - With probability ε → explore (random)
              - With probability 1-ε → exploit (best known)

              Start with high ε (lots of exploration)
              Decay ε over time (shift to exploitation)

  ε = 1.0                    ε = 0.1
  ████████████████       ██░░░░░░░░░░░░░░░░
  All exploration         Mostly exploitation
  (early training)        (late training)
```

```chart
{
  "type": "line",
  "data": {
    "labels": [0,100,200,300,400,500,600,700,800,900,1000],
    "datasets": [
      {
        "label": "Epsilon (exploration rate)",
        "data": [1.0,0.90,0.80,0.65,0.50,0.35,0.22,0.14,0.09,0.06,0.05],
        "borderColor": "rgba(234, 88, 12, 1)",
        "backgroundColor": "rgba(234, 88, 12, 0.1)",
        "fill": true,
        "tension": 0.4,
        "pointRadius": 0
      },
      {
        "label": "Exploitation rate (1 - epsilon)",
        "data": [0.0,0.10,0.20,0.35,0.50,0.65,0.78,0.86,0.91,0.94,0.95],
        "borderColor": "rgba(99, 102, 241, 1)",
        "backgroundColor": "rgba(99, 102, 241, 0.1)",
        "fill": true,
        "tension": 0.4,
        "pointRadius": 0
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Epsilon Decay — Start Exploring, Gradually Shift to Exploiting" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Rate" }, "min": 0, "max": 1.0 },
      "x": { "title": { "display": true, "text": "Episode" } }
    }
  }
}
```

---

## Q-Learning ★

### Simple Explanation
Q-Learning is like building a cheat sheet (a Q-table) that tells you:
"From state S, if I take action A, I expect to get this much total reward."

```
Q-TABLE EXAMPLE (Grid World):
──────────────────────────────────────────────
State     │  Go Up  │ Go Down │ Go Left │ Go Right
──────────┼─────────┼─────────┼─────────┼────────
(0,0)     │  -0.5   │   0.8   │  -1.0   │   0.9
(0,1)     │   0.3   │   0.2   │   0.1   │   1.5  ← Best!
(1,1)     │  WALL   │   2.0   │  -0.3   │  WALL
...

Arrow shows the best action from each state:
The agent just looks up its state and picks
the action with the highest Q-value!
```

**The Bellman Equation (the heart of Q-Learning):**

$$Q_{\text{new}}(s, a) = Q_{\text{old}}(s, a) + \alpha \left[ r + \gamma \max_{a'} Q(s', a') - Q_{\text{old}}(s, a) \right]$$

```
  Where:
    s   = current state
    a   = action taken
    r   = reward received immediately
    s'  = next state (after taking action)
    α   = learning rate (0 to 1 — how fast to update)
    γ   = discount factor (0 to 1 — how much future rewards matter)
          γ close to 1 → agent is far-sighted (plans ahead)
          γ close to 0 → agent is short-sighted (cares only now)

  CONCRETE UPDATE EXAMPLE:
  ─────────────────────────────────────────────────────────────────
    State=(0,0), Action=Right, Reward=0, Next State=(0,1)
    Q_old(0,0, Right) = 0.5,  max Q(0,1) = 1.5,  α=0.1,  γ=0.9

    Target  = r + γ × max Q(s') = 0 + 0.9 × 1.5 = 1.35
    TD Error = Target - Q_old   = 1.35 - 0.5     = 0.85
    Q_new   = 0.5 + 0.1 × 0.85 = 0.585  ← Q-value increased!
```

```chart
{
  "type": "line",
  "data": {
    "labels": [0,10,20,30,40,50,60,70,80,90,100],
    "datasets": [
      {
        "label": "Q(state, Go Right) — learns it's good",
        "data": [0.0,0.1,0.25,0.42,0.55,0.65,0.73,0.80,0.85,0.88,0.90],
        "borderColor": "rgba(34, 197, 94, 1)",
        "fill": false,
        "tension": 0.4,
        "pointRadius": 0
      },
      {
        "label": "Q(state, Go Left) — learns it's bad",
        "data": [0.0,-0.05,-0.15,-0.30,-0.45,-0.55,-0.62,-0.68,-0.72,-0.75,-0.78],
        "borderColor": "rgba(239, 68, 68, 1)",
        "fill": false,
        "tension": 0.4,
        "pointRadius": 0
      },
      {
        "label": "Q(state, Go Down) — neutral",
        "data": [0.0,0.02,0.05,0.08,0.10,0.12,0.13,0.14,0.14,0.15,0.15],
        "borderColor": "rgba(200, 200, 200, 0.8)",
        "fill": false,
        "tension": 0.4,
        "pointRadius": 0
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Q-Values Converge Over Training — Agent Learns Right is Best" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Q-Value" }, "min": -1, "max": 1 },
      "x": { "title": { "display": true, "text": "Training Episode" } }
    }
  }
}
```

---

## Deep Q-Network (DQN)

### Simple Explanation
Q-tables work great for simple games, but for complex ones (like Atari games with
millions of possible states), a table would be impossibly huge. Instead, we use a
**neural network** to approximate the Q-values!

```
REGULAR Q-LEARNING:          DEEP Q-NETWORK (DQN):
────────────────────         ──────────────────────────────
State → TABLE lookup         State → NEURAL NETWORK → Q-values

State (0,1)                  Game screenshot (pixels)
     │                              │
     ▼                              ▼
  Q-Table:                   ┌────────────────┐
  Up:  0.3                   │  Convolutional │
  Down: 0.2                  │  Neural Net    │
  Left: 0.1                  │  (processes    │
  Right: 1.5                 │   images)      │
                              └────────────────┘
Works for small games!              │
                                    ▼
                             Q-values for each action
                             Left: 0.3  Right: 5.1 ← Best!
                             Up: 1.2    Fire: 4.8

                             Works for Atari, complex games!
```

---

## Famous RL Achievements

```
YEAR    │ ACHIEVEMENT
────────┼─────────────────────────────────────────────────────────
1997    │ IBM Deep Blue beats Kasparov at Chess
        │ (Not RL, but showed AI can beat humans)
        │
2013    │ DeepMind's DQN learns to play 49 Atari games
        │ directly from pixels! Superhuman on many.
        │
2016    │ AlphaGo beats world champion Lee Sedol at Go
        │ (Go: 10^170 possible positions! Thought impossible.)
        │
2017    │ AlphaZero learns Chess/Go/Shogi from scratch
        │ in hours, becomes best ever — with NO human data!
        │
2019    │ OpenAI Five beats world champions at Dota 2
        │ (Complex multiplayer game with teamwork)
        │
2022    │ ChatGPT uses RLHF (RL from Human Feedback)
        │ to align language models with human preferences
        │
2023+   │ RL used in robotics, drug discovery, chip design
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Atari (DQN 2013)", "Go (AlphaGo 2016)", "Chess (AlphaZero 2017)", "Dota 2 (OpenAI Five 2019)", "ChatGPT (RLHF 2022)"],
    "datasets": [{
      "label": "Performance vs Best Human (%)",
      "data": [120, 105, 115, 102, 90],
      "backgroundColor": ["rgba(99,102,241,0.7)","rgba(34,197,94,0.7)","rgba(234,88,12,0.7)","rgba(239,68,68,0.7)","rgba(168,85,247,0.7)"],
      "borderColor": ["rgba(99,102,241,1)","rgba(34,197,94,1)","rgba(234,88,12,1)","rgba(239,68,68,1)","rgba(168,85,247,1)"],
      "borderWidth": 1
    }]
  },
  "options": {
    "indexAxis": "y",
    "plugins": { "title": { "display": true, "text": "RL Milestones — Superhuman Performance (100% = Best Human)" } },
    "scales": {
      "x": { "title": { "display": true, "text": "% of Best Human Performance" }, "min": 0, "max": 130 }
    }
  }
}
```

---

## Types of RL Algorithms

```
                    RL ALGORITHMS
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
    MODEL-FREE         MODEL-BASED      POLICY
                                       GRADIENT
         │                │                │
   Learn directly    Build a model    Directly optimize
   from experience   of environment   the policy
         │
    ┌────┴────┐
    ▼         ▼
 VALUE-     POLICY
 BASED      BASED
    │         │
 Q-Learning  REINFORCE
 DQN         algorithm
    │
 Q-values guide
 action selection
```

```chart
{
  "type": "line",
  "data": {
    "labels": ["Step 0 (+1)", "Step 1 (+1)", "Step 2 (+1)", "Step 3 (+1)", "Step 4 (+1)", "Step 5 (+10)"],
    "datasets": [
      {
        "label": "γ = 0.99 (far-sighted — values future)",
        "data": [1.0, 1.0, 1.0, 1.0, 1.0, 10.0],
        "borderColor": "rgba(99, 102, 241, 1)",
        "backgroundColor": "rgba(99, 102, 241, 0.1)",
        "fill": true,
        "tension": 0,
        "pointRadius": 4
      },
      {
        "label": "γ = 0.5 (short-sighted — discounts future)",
        "data": [1.0, 0.5, 0.25, 0.125, 0.063, 0.31],
        "borderColor": "rgba(239, 68, 68, 1)",
        "backgroundColor": "rgba(239, 68, 68, 0.1)",
        "fill": true,
        "tension": 0,
        "pointRadius": 4
      },
      {
        "label": "γ = 0 (greedy — only cares about NOW)",
        "data": [1.0, 0, 0, 0, 0, 0],
        "borderColor": "rgba(200, 200, 200, 0.8)",
        "fill": false,
        "tension": 0,
        "pointRadius": 4
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Discount Factor (γ) — How Much Does the Agent Value Future Rewards?" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Effective Reward Value" }, "beginAtZero": true },
      "x": { "title": { "display": true, "text": "Future Step (reward at each step)" } }
    }
  }
}
```

---

## When to Use Reinforcement Learning?

```
✓ USE RL WHEN:                     ✗ DON'T USE RL WHEN:
──────────────────────────         ──────────────────────────────
Problem = sequential               Simple pattern recognition
decisions over time                (use supervised learning)

Clear reward signal                No clear reward signal
available                          (use unsupervised or
                                   supervised)
Simulation/environment
exists to train in                 You have lots of labeled
                                   data (supervised is faster)
Problem too complex
for hand-coded rules               Stakes are very high and
                                   failures are costly in training
```

---

## The Multi-Armed Bandit Problem

### Simple Explanation
Imagine you're in a casino with 5 slot machines. Each machine pays out at a different
(unknown) rate. You have 100 coins. How do you maximize your winnings?

This is the simplest RL problem — there's no "state" or "sequence of decisions."
Just: which action (machine) gives the best reward?

```
  Machine A: pays out 20% of the time  <- you don't know this!
  Machine B: pays out 45% of the time  <- you don't know this!
  Machine C: pays out 10% of the time  <- you don't know this!
  Machine D: pays out 60% of the time  <- you don't know this! (BEST)
  Machine E: pays out 30% of the time  <- you don't know this!

  Strategy: play each machine a few times (EXPLORE),
  then mostly play the best one you've found (EXPLOIT).

  This is the EXPLORE vs EXPLOIT tradeoff in its purest form!
```

### Real-World Bandits
```
  ┌─────────────────────────────────────────────────────────────┐
  │  A/B Testing    │ Which website button color gets more      │
  │                 │ clicks? (each color = one "arm")          │
  ├─────────────────┼───────────────────────────────────────────┤
  │  Ad Selection   │ Which ad should we show this user?        │
  │                 │ (each ad = one "arm")                     │
  ├─────────────────┼───────────────────────────────────────────┤
  │  Medical Trials │ Which treatment works best?               │
  │                 │ (each treatment = one "arm")              │
  ├─────────────────┼───────────────────────────────────────────┤
  │  Recommendation │ Which article/video to recommend next?    │
  │                 │ (each option = one "arm")                 │
  └─────────────────┴───────────────────────────────────────────┘
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Machine A (20%)", "Machine B (45%)", "Machine C (10%)", "Machine D (60%)", "Machine E (30%)"],
    "datasets": [
      {
        "label": "True Payout Rate (unknown to agent)",
        "data": [20, 45, 10, 60, 30],
        "backgroundColor": ["rgba(200,200,200,0.6)","rgba(200,200,200,0.6)","rgba(200,200,200,0.6)","rgba(34,197,94,0.7)","rgba(200,200,200,0.6)"],
        "borderColor": ["rgba(160,160,160,1)","rgba(160,160,160,1)","rgba(160,160,160,1)","rgba(34,197,94,1)","rgba(160,160,160,1)"],
        "borderWidth": 1
      },
      {
        "label": "Agent's Estimate After 50 Plays",
        "data": [18, 40, 12, 55, 28],
        "backgroundColor": "rgba(99, 102, 241, 0.6)",
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Multi-Armed Bandit — Agent Learns to Identify the Best Machine (D)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Payout Rate (%)" }, "beginAtZero": true, "max": 70 }
    }
  }
}
```

---

## Policy Gradient Methods ★

### Simple Explanation
Q-Learning learns "how good is each action?" and picks the best one.
Policy Gradient methods skip the middleman — they directly learn
"what action should I take?" by adjusting the policy itself.

### Why Do We Need Policy Gradients?
```
  Q-Learning has a problem with CONTINUOUS actions:
  ─────────────────────────────────────────────────────────────
  Discrete actions (Q-Learning works great):
    "Go left, right, up, or down" -- just 4 Q-values to learn!

  Continuous actions (Q-Learning struggles):
    "Turn steering wheel 23.7 degrees" -- infinite possible values!
    Can't have a Q-value for every possible angle.

  Policy Gradient solution:
    Learn a FUNCTION that maps states to actions directly.
    Output = the action itself (or a probability distribution over actions).
```

### The REINFORCE Algorithm
```
  The simplest Policy Gradient method:

  1. Run the agent through an episode (start to finish)
  2. Record every (state, action, reward) triple
  3. For actions that led to HIGH total reward -> increase their probability
  4. For actions that led to LOW total reward  -> decrease their probability

  Intuition: "Do more of what worked, less of what didn't."

  Formula:
```

$$\theta \leftarrow \theta + \alpha \cdot G \cdot \nabla \log \pi(a \mid s, \theta)$$

```
    theta = policy parameters (neural network weights)
    G     = total reward from that point onward
    pi(a|s,theta) = probability of taking action a in state s
    grad(log pi) = direction to adjust to make this action more likely

    If G is high -> push theta to make this action MORE likely
    If G is low  -> push theta to make this action LESS likely
```

---

## Actor-Critic Methods

### Simple Explanation
REINFORCE has a problem: it's very noisy because it waits until the END of an
episode to learn. What if the episode takes 1000 steps? That's a lot of noise!

Actor-Critic fixes this by using TWO networks working together:

```
  ┌───────────────┐           ┌────────────────┐
  │     ACTOR     │           │     CRITIC     │
  │ (the doer)    │           │ (the judge)    │
  │               │           │                │
  │ Decides which │           │ Evaluates how  │
  │ action to take│           │ good that      │
  │ (the policy)  │           │ action was     │
  │               │           │(value function)│
  └───────┬───────┘           └───────┬────────┘
          │                           │
          │    "I'll go left"         │ "Going left from here
          │                           │  is worth +5 reward"
          ▼                           ▼
     Takes action              Provides feedback
     in environment            to improve the actor

  The Actor proposes actions.
  The Critic evaluates them.
  Together they learn faster and more stably than either alone!
```

### Why It's Better Than Pure Policy Gradient
```
  REINFORCE:     Wait until episode ends -> very noisy updates
  Actor-Critic:  Update after EVERY step -> much more stable

  Think of it like:
  REINFORCE = getting your grade only at the end of the semester
  Actor-Critic = getting feedback on every homework assignment
```

### Popular Actor-Critic Algorithms
```
  ┌──────────────┬──────────────────────────────────────────────┐
  │ A2C          │ Advantage Actor-Critic -- baseline version    │
  │ A3C          │ Asynchronous A2C -- runs many agents parallel │
  │ PPO          │ Proximal Policy Optimization -- most popular! │
  │              │ Used to train ChatGPT via RLHF                │
  │ SAC          │ Soft Actor-Critic -- best for continuous      │
  │              │ control (robotics, self-driving)              │
  └──────────────┴──────────────────────────────────────────────┘

  PPO is the most widely used RL algorithm today.
  It's the algorithm behind RLHF in ChatGPT and Claude.
```

```chart
{
  "type": "line",
  "data": {
    "labels": [0,50,100,150,200,250,300,350,400,450,500],
    "datasets": [
      {
        "label": "REINFORCE (noisy, slow)",
        "data": [-8,-6,-5,-3,-4,-2,-3,-1,0,-1,1],
        "borderColor": "rgba(239, 68, 68, 0.7)",
        "borderWidth": 1.5,
        "tension": 0.3,
        "pointRadius": 0,
        "fill": false
      },
      {
        "label": "Actor-Critic / PPO (stable, fast)",
        "data": [-8,-5,-2,0,2,3.5,5,6,7,7.5,8],
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 2.5,
        "tension": 0.4,
        "pointRadius": 0,
        "fill": false
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "REINFORCE vs Actor-Critic (PPO) — PPO Learns Faster & Smoother" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Average Reward" }, "min": -10, "max": 10 },
      "x": { "title": { "display": true, "text": "Episode" } }
    }
  }
}
```

---

## RLHF — How ChatGPT and Claude Learn from Humans ★★★

### Simple Explanation
After pre-training on text, language models can write fluently but might say
harmful, unhelpful, or incorrect things. RLHF (Reinforcement Learning from
Human Feedback) teaches the model to give answers humans actually prefer.

### The Three Steps of RLHF
```
  STEP 1: Supervised Fine-Tuning (SFT)
  ──────────────────────────────────────────────────────
  Train the base LLM on high-quality (prompt, ideal response) pairs.
  Written by humans. This gives the model a good starting point.

  STEP 2: Train a Reward Model
  ──────────────────────────────────────────────────────
  Show the model's responses to humans.
  Humans RANK them: "Response A is better than Response B."

    Prompt: "Explain gravity"
    Response A: "Gravity is the force..." (clear, helpful)
    Response B: "As a physicist would say..." (verbose, confusing)
    Human says: A > B

  Train a REWARD MODEL to predict these human preferences.
  This model assigns a score to any (prompt, response) pair.

  STEP 3: Optimize with RL (PPO)
  ──────────────────────────────────────────────────────
  Use the reward model as the "environment."
  The LLM is the "agent."
  Its "action" is generating a response.
  The "reward" comes from the reward model's score.

  ┌──────────┐     "Explain gravity"      ┌──────────────┐
  │          │ ──────────────────────────> │              │
  │   LLM    │                             │ Reward Model │
  │  (Agent) │ <────────────────────────── │ (Environment)│
  │          │     Score: 0.85 (good!)     │              │
  └──────────┘                             └──────────────┘
       │
       │ PPO updates the LLM to generate responses
       │ that score higher with the reward model
       ▼
  LLM gets better at producing helpful, safe responses!
```

### Why RLHF Matters
```
  Before RLHF:  Model is fluent but unpredictable
                May be helpful OR harmful OR irrelevant

  After RLHF:   Model is helpful, harmless, and honest
                Follows instructions better
                Refuses dangerous requests
                Gives more useful, structured answers

  This is the key difference between a base model
  (like raw GPT-3) and a chat model (like ChatGPT).
```

```chart
{
  "type": "bar",
  "data": {
    "labels": ["Helpfulness", "Harmlessness", "Accuracy", "Following Instructions", "Refusing Dangerous Requests"],
    "datasets": [
      {
        "label": "Base Model (before RLHF)",
        "data": [45, 40, 55, 35, 20],
        "backgroundColor": "rgba(200, 200, 200, 0.6)",
        "borderColor": "rgba(160, 160, 160, 1)",
        "borderWidth": 1
      },
      {
        "label": "After RLHF",
        "data": [88, 90, 78, 92, 95],
        "backgroundColor": "rgba(99, 102, 241, 0.7)",
        "borderColor": "rgba(99, 102, 241, 1)",
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "RLHF Impact — Before vs After on Key Quality Dimensions (%)" } },
    "scales": {
      "y": { "title": { "display": true, "text": "Score (%)" }, "beginAtZero": true, "max": 100 }
    }
  }
}
```

---

## Review Questions — Test Your Understanding

1. In the RL loop, what are the roles of the agent, environment, state, action, and reward? Give an example for a self-driving car.
2. Explain the exploration vs exploitation tradeoff. Why can't you just always exploit?
3. In Q-Learning, what does the discount factor (gamma) control? What happens if gamma = 0 vs gamma = 0.99?
4. When would you use Policy Gradient methods instead of Q-Learning?
5. What are the three steps of RLHF? Why is step 2 (the reward model) necessary — why not just use human feedback directly?

<details>
<summary>Answers</summary>

1. Agent = the self-driving car's AI. Environment = the road, other cars, pedestrians. State = current camera/sensor readings (positions, speeds). Action = steer, accelerate, brake. Reward = +1 for safe driving, -100 for collision, +10 for reaching destination.
2. If you only exploit, you'll stick with the first decent option you find and miss potentially better ones. Early exploration helps discover the best strategy; exploitation uses it. Epsilon-greedy balances both.
3. Gamma controls how much the agent values future vs immediate rewards. Gamma=0: completely short-sighted, only cares about the next immediate reward. Gamma=0.99: far-sighted, plans many steps ahead.
4. Use Policy Gradient when: actions are continuous (steering angles, robot joint torques), the action space is very large, or you want a stochastic policy. Q-Learning works better with discrete, small action spaces.
5. (1) SFT on human-written ideal responses, (2) train a reward model on human preference rankings, (3) optimize the LLM with PPO using the reward model. Step 2 is necessary because you can't have humans rate every response in real-time during training — the reward model automates human judgment so RL can run millions of iterations.
</details>

---

## Key Takeaways

```
╔═══════════════════════════════════════════════════════════════╗
║  REINFORCEMENT LEARNING CHEAT SHEET                           ║
║  ─────────────────────────────────────────────────────────   ║
║  Agent learns by taking actions and getting rewards          ║
║  Policy = strategy (what to do in each state)                ║
║  Q-Learning = table of (state, action) -> expected reward    ║
║  DQN = neural network approximates Q-table (for complex!)    ║
║  epsilon-greedy = balance exploration vs exploitation        ║
║  Bellman equation = heart of Q-learning updates              ║
║  Policy Gradient = directly learn the policy (for continuous)║
║  Actor-Critic = actor proposes, critic evaluates (PPO, SAC)  ║
║  RLHF = RL from human feedback (trains ChatGPT, Claude)     ║
║  Used for games, robots, recommendation systems, LLMs        ║
╚═══════════════════════════════════════════════════════════════╝
```

---

**Previous:** [Chapter 7 — Unsupervised Learning](07_unsupervised_learning.md)
**Next:** [Chapter 9 — Key ML Algorithms](09_key_algorithms.md)
