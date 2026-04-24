# Craig

Craig is a local-first autonomous AI software engineer built for real project work.

It takes natural-language product requests, inspects a workspace, edits files, runs commands, and streams execution back through a polished operator console.

This project is designed as a portfolio-grade demonstration of:
- AI product design
- local agent workflows
- streaming UI systems
- tool-using LLMs
- full-stack TypeScript engineering

## What Craig Does

- Accepts software tasks in plain English
- Streams model output in real time
- Reads and writes files inside a configured workspace
- Runs shell commands with safety checks
- Keeps secrets in environment variables instead of hard-coding them
- Uses Ollama locally for private, local-first model inference

## Why This Project Matters

Craig is not just a chatbot UI.

It is a practical autonomous coding agent interface focused on the real workflow of building software:
- understand the request
- inspect the codebase
- make changes
- run commands
- report results

That makes it a strong portfolio project for AI engineer, product engineer, and full-stack roles where you need to show more than static UI work.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vercel AI SDK
- Ollama
- `ollama-ai-provider-v2`

## Current Model

Craig is currently configured to use:

```bash
qwen2.5-coder:7b
```

This is a much better fit for coding tasks than a smaller general chat model.

## Local Setup

Clone the repo and install dependencies:

```bash
npm install
```

Create your local env file if needed:

```bash
cp .env.example .env.local
```

Start Ollama with the compatibility workaround used on this machine:

```bash
env OLLAMA_NEW_ENGINE=0 ollama serve
```

In another terminal, run the app:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Environment Variables

Example:

```bash
OLLAMA_MODEL=qwen2.5-coder:7b
CRAIG_WORKSPACE_ROOT=.
```

Notes:
- `.env.local` is ignored by Git
- secrets should never be committed
- the default model can be changed without touching code
- `CRAIG_WORKSPACE_ROOT` defaults to the project root if not set

## Demo Flow

A good demo prompt for Craig:

```text
Build a premium SaaS dashboard with authentication, a sortable table, filters, and a clean activity feed.
```

What the viewer should see:
- polished agent UI
- clear prompt submission
- streaming assistant output
- visible timeline of file reads, writes, and commands
- real coding-agent behavior rather than a static mock

## Portfolio Talking Points

Use these in interviews, GitHub descriptions, or project summaries:

- Built a local-first autonomous coding agent with Next.js, Vercel AI SDK, and Ollama
- Designed a streaming agent console for natural-language software task execution
- Implemented safe workspace tools for file inspection, file editing, and command execution
- Integrated local model inference for privacy-preserving AI workflows
- Built a portfolio-ready AI product that demonstrates full-stack engineering and agent UX design

## Safety Notes

Craig includes basic command and filesystem safeguards:
- blocks obviously dangerous shell patterns
- restricts file access to the configured workspace
- avoids exposing token values in responses

This project is still a portfolio prototype, not a production sandbox.

## Roadmap

- Improve structured rendering for tool calls and command results
- Add a richer file diff view
- Add session history and task persistence
- Add model/settings controls in the UI
- Package the app into a desktop experience after the workflow is fully stable

## Repo

GitHub:

```bash
https://github.com/christopherlhammer11-ai/craig
```
