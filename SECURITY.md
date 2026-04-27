# Security Policy

Craig is an autonomous coding-agent prototype. Because it can read files, write files, and run commands inside a configured workspace, safety boundaries matter.

## Supported Surface

Security-sensitive areas include:

- Workspace path handling
- File read/write tools
- Shell command execution
- Environment variable handling
- Streaming API route behavior
- Any future remote model/provider integration

## Reporting a Vulnerability

Please email:

**christopherlhammer11@gmail.com**

Include:

- Affected file, route, or workflow
- Steps to reproduce
- Whether the issue can read/write outside the workspace
- Whether secrets or environment variables can be exposed

## Current Guardrails

- Workspace scope is controlled by `CRAIG_WORKSPACE_ROOT`.
- Secrets should live in `.env.local`, which is ignored by Git.
- The UI is designed to show what Craig is doing rather than hiding tool activity.
- The project is positioned as a local prototype, not a production sandbox.

## Known Limitations

- No containerized sandbox is included yet.
- No per-command approval gate is included yet.
- No multi-user auth boundary is included yet.
- A local agent can still cause damage if pointed at the wrong workspace or given unsafe instructions.

Productionizing Craig would require sandboxed execution, policy-based command allowlists, patch review, persistent audit logs, and explicit user approval for risky actions.
