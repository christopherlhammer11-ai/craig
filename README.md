# Craig

**Autonomous AI software builder.** Craig reads a workspace, plans a change, edits files, runs commands, and reports what happened in a way a human can review.

**Demo:** [Craig Coding Agent](https://christopherhammer.dev/assets/videos/narrated/project-demos/craig-coding-agent-narrated.mp4)  
Portfolio: **Craig site:** [craigbuilds.dev](https://craigbuilds.dev)

## What Craig Does

- Accepts software tasks in plain English
- Inspects project files before changing them
- Plans the smallest useful implementation path
- Edits code with a reviewable diff mindset
- Runs shell commands and reports results
- Supports local-first model workflows through Ollama
- Presents the work through an operator-style interface

## Why It Exists

Most coding assistants feel like chat boxes that might write code. Craig is framed as a worker: understand the repo, do the task, run the check, show the result.

That makes it useful as a portfolio proof piece for AI product engineering, developer tooling, autonomous workflows, and full-stack TypeScript work.

## Real Workflow Example

Ask:

> Add PDF export to the report page.

Craig's ideal flow:

1. Read app routes, scripts, components, and nearby context
2. Identify the report page and export boundary
3. Make targeted edits instead of rewriting unrelated files
4. Run the relevant build or test command
5. Return changed files, command output, and next verification step

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui patterns
- Vercel AI SDK
- Ollama local model path
- Tool/workspace execution patterns

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

If using Ollama locally:

```bash
ollama pull qwen2.5-coder:7b
ollama serve
```

## Portfolio Context

Craig is the builder layer in my portfolio: the project that turns the rest of the work into a workflow story. It also powers the local-business offer around websites, CRM, follow-up, and social content systems.

---

Built by **Christopher L. Hammer** - self-taught AI/product builder shipping local-first tools, demos, and real product surfaces.

- Portfolio: [christopherhammer.dev](https://christopherhammer.dev)
- Proof demos: [https://christopherhammer.dev#proof](https://christopherhammer.dev#proof)
- GitHub: [christopherlhammer11-ai](https://github.com/christopherlhammer11-ai)

