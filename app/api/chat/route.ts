import { convertToModelMessages, streamText, tool, type UIMessage } from "ai";
import { ollama } from "ollama-ai-provider-v2";
import { z } from "zod";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

export const maxDuration = 60;

const WORKSPACE_ROOT = path.resolve(
  process.env.CRAIG_WORKSPACE_ROOT || process.cwd(),
);

const MODEL = process.env.OLLAMA_MODEL || "qwen2.5-coder:7b";

function assertInsideWorkspace(targetPath: string) {
  const resolved = path.resolve(WORKSPACE_ROOT, targetPath);
  const rootWithSeparator = WORKSPACE_ROOT.endsWith(path.sep)
    ? WORKSPACE_ROOT
    : `${WORKSPACE_ROOT}${path.sep}`;

  if (resolved !== WORKSPACE_ROOT && !resolved.startsWith(rootWithSeparator)) {
    throw new Error("Access denied: path is outside the configured workspace.");
  }

  return resolved;
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function runWorkspaceCommand(command: string) {
  return new Promise<{
    ok: boolean;
    command: string;
    exitCode: number | null;
    stdout: string;
    stderr: string;
    error?: string;
  }>((resolve) => {
    const blockedPatterns = [
      /\bsudo\b/,
      /\brm\s+-rf\s+\//,
      /\brm\s+-rf\s+\./,
      /\bchmod\s+777\b/,
      /\bchown\b/,
      /\bmkfs\b/,
      /\bdd\s+if=/,
      /:\(\)\s*\{/,
      />\s*\/dev\//,
      /\bcurl\b.*\|\s*(sh|bash|zsh)/,
      /\bwget\b.*\|\s*(sh|bash|zsh)/,
    ];

    if (blockedPatterns.some((pattern) => pattern.test(command))) {
      resolve({
        ok: false,
        command,
        exitCode: null,
        stdout: "",
        stderr: "",
        error: "Command blocked by Craig safety policy.",
      });
      return;
    }

    const child = spawn(command, {
      cwd: WORKSPACE_ROOT,
      shell: true,
      env: {
        ...process.env,
        PUMPFUN_API_TOKEN: process.env.PUMPFUN_API_TOKEN || "",
        SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
    }, 30_000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      resolve({
        ok: false,
        command,
        exitCode: null,
        stdout,
        stderr,
        error: error.message,
      });
    });

    child.on("close", (exitCode) => {
      clearTimeout(timeout);

      resolve({
        ok: exitCode === 0,
        command,
        exitCode,
        stdout: stdout.slice(-20_000),
        stderr: stderr.slice(-20_000),
        ...(exitCode === null
          ? { error: "Command timed out or was terminated." }
          : {}),
      });
    });
  });
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };

  const result = streamText({
    model: ollama(MODEL),
    prompt: convertToModelMessages(messages),
    system: `
You are Craig — Autonomous AI Software Engineer.

Craig is a professional autonomous coding agent for real project work.

Your behavior:
- Think like a senior full-stack engineer.
- Be concise, practical, and implementation-focused.
- Inspect files before editing them.
- Prefer Next.js App Router, TypeScript, Tailwind, shadcn/ui, and clean React patterns.
- When you change code, describe the files changed and why.
- When you run commands, summarize the result clearly.
- Do not reveal secrets or environment variable values.
- Never hard-code private tokens, wallet keys, pump.fun credentials, Solana RPC keys, or API tokens.
- Use environment variables such as PUMPFUN_API_TOKEN and SOLANA_RPC_URL for token integrations.

Workspace:
- Workspace root: ${WORKSPACE_ROOT}
- You can list files, read files, write files, and run project commands through tools.
    `.trim(),
    tools: {
      listFiles: tool({
        description: "List files and folders inside the Craig workspace.",
        parameters: z.object({
          directory: z
            .string()
            .default(".")
            .describe("Directory path relative to the workspace root."),
        }),
        execute: async ({ directory }) => {
          const targetPath = assertInsideWorkspace(directory);
          const exists = await pathExists(targetPath);

          if (!exists) {
            return {
              ok: false,
              error: `Directory not found: ${directory}`,
            };
          }

          const entries = await fs.readdir(targetPath, {
            withFileTypes: true,
          });

          return {
            ok: true,
            directory,
            entries: entries
              .map((entry) => ({
                name: entry.name,
                type: entry.isDirectory() ? "directory" : "file",
              }))
              .sort((a, b) => {
                if (a.type !== b.type) {
                  return a.type === "directory" ? -1 : 1;
                }

                return a.name.localeCompare(b.name);
              }),
          };
        },
      }),

      readFile: tool({
        description: "Read a text file from the Craig workspace.",
        parameters: z.object({
          filePath: z
            .string()
            .describe("File path relative to the workspace root."),
        }),
        execute: async ({ filePath }) => {
          const targetPath = assertInsideWorkspace(filePath);
          const exists = await pathExists(targetPath);

          if (!exists) {
            return {
              ok: false,
              error: `File not found: ${filePath}`,
            };
          }

          const stat = await fs.stat(targetPath);

          if (stat.isDirectory()) {
            return {
              ok: false,
              error: `Cannot read directory as file: ${filePath}`,
            };
          }

          if (stat.size > 250_000) {
            return {
              ok: false,
              error: `File is too large to read safely: ${filePath}`,
            };
          }

          const content = await fs.readFile(targetPath, "utf8");

          return {
            ok: true,
            filePath,
            content,
          };
        },
      }),

      writeFile: tool({
        description:
          "Create or overwrite a text file inside the Craig workspace.",
        parameters: z.object({
          filePath: z
            .string()
            .describe("File path relative to the workspace root."),
          content: z.string().describe("Complete file contents to write."),
        }),
        execute: async ({ filePath, content }) => {
          const targetPath = assertInsideWorkspace(filePath);

          await fs.mkdir(path.dirname(targetPath), { recursive: true });
          await fs.writeFile(targetPath, content, "utf8");

          return {
            ok: true,
            filePath,
            bytes: Buffer.byteLength(content, "utf8"),
          };
        },
      }),

      runCommand: tool({
        description:
          "Run a project command inside the Craig workspace and return stdout/stderr.",
        parameters: z.object({
          command: z
            .string()
            .describe("Command to run from the workspace root."),
        }),
        execute: async ({ command }) => {
          return runWorkspaceCommand(command);
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
  });
}
