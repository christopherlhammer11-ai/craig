# Craig Architecture

Craig is a local-first autonomous coding-agent interface. It is designed to demonstrate the real loop behind AI software work: understand the request, inspect the workspace, make targeted edits, run checks, and report what happened.

## System Overview

```text
User prompt
  |
  v
Next.js operator console
  |
  +-- task input
  +-- streaming assistant response
  +-- tool/result timeline
  +-- follow-up chat loop
  |
  v
Agent API route
  |
  +-- local model/provider call
  +-- tool routing
  +-- validation
  +-- response streaming
  |
  v
Workspace tools
  |
  +-- file reads
  +-- targeted writes
  +-- shell commands
  +-- command output summaries
```

## Local-First Model Path

Craig is configured around Ollama and local coding models by default. That makes the project useful for private repo workflows where source code should not automatically be sent to a hosted model provider.

The default model can be changed through environment configuration rather than code edits.

## Agent Loop

```text
Request
  -> classify the task
  -> inspect relevant files
  -> propose or perform a scoped change
  -> run checks where possible
  -> summarize changed files, commands, and remaining risks
```

## Safety Boundary

Craig is a portfolio prototype, not a hardened sandbox. The current safeguards are intended to make the demo responsible:

- Workspace access is scoped through `CRAIG_WORKSPACE_ROOT`.
- Secrets belong in environment variables, not source files.
- Dangerous shell patterns should be blocked or avoided.
- The UI should make agent activity visible instead of hiding file/command actions.

For production use, Craig would need a stronger sandbox, approval gates, structured patch review, per-command policy, and durable task history.

## Why This Matters

Recruiters and founders do not need another chatbot. They need to see whether an engineer can design an AI workflow that has context, tools, guardrails, state, and an operator-facing UI. Craig is that proof.
