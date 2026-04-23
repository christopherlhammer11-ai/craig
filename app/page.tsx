"use client";

import { FormEvent, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Code2,
  FileCode2,
  FilePenLine,
  FolderTree,
  Loader2,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wand2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const starterTasks = [
  "Build a polished todo app with local storage, keyboard shortcuts, and dark mode.",
  "Create a premium SaaS dashboard with a sortable pipeline table and filter drawer.",
  "Refactor this Next.js page into reusable components and improve accessibility.",
  "Find the bug in this React component, fix it, and explain what changed.",
];

const proofPoints = [
  {
    icon: BrainCircuit,
    label: "Plans from natural language",
  },
  {
    icon: FileCode2,
    label: "Edits real project files",
  },
  {
    icon: Terminal,
    label: "Runs commands and reports output",
  },
  {
    icon: ShieldCheck,
    label: "Keeps secrets in environment variables",
  },
];

type ActivityItem = {
  id: string;
  kind: "file" | "command" | "discovery" | "result";
  title: string;
  detail: string;
  status: "working" | "done";
};

function getMessageText(message: {
  parts: Array<{ type: string; text?: string }>;
}) {
  return message.parts
    .filter(
      (
        part,
      ): part is {
        type: "text" | "reasoning";
        text: string;
      } => (part.type === "text" || part.type === "reasoning") && typeof part.text === "string",
    )
    .map((part) => part.text)
    .join("\n\n")
    .trim();
}

function truncate(value: string, max = 120) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}...`;
}

function normalizeToolInput(raw: unknown) {
  if (!raw || typeof raw !== "object") return {};
  return raw as Record<string, unknown>;
}

function extractActivities(messages: Array<{ id?: string; parts: Array<Record<string, unknown>> }>) {
  const items: ActivityItem[] = [];

  for (const message of messages) {
    for (const [index, part] of message.parts.entries()) {
      const type = typeof part.type === "string" ? part.type : "";

      if (type === "tool-input-available") {
        const toolName = typeof part.toolName === "string" ? part.toolName : "tool";
        const input = normalizeToolInput(part.input);

        if (toolName === "writeFile") {
          items.push({
            id: `${message.id ?? "message"}-${index}-write`,
            kind: "file",
            title: "Edited project file",
            detail:
              typeof input.filePath === "string"
                ? input.filePath
                : "Updated a workspace file",
            status: "working",
          });
          continue;
        }

        if (toolName === "runCommand") {
          items.push({
            id: `${message.id ?? "message"}-${index}-command`,
            kind: "command",
            title: "Ran terminal command",
            detail:
              typeof input.command === "string"
                ? truncate(input.command)
                : "Executed a workspace command",
            status: "working",
          });
          continue;
        }

        if (toolName === "readFile" || toolName === "listFiles") {
          items.push({
            id: `${message.id ?? "message"}-${index}-discovery`,
            kind: "discovery",
            title: toolName === "readFile" ? "Inspected source file" : "Mapped project structure",
            detail:
              typeof input.filePath === "string"
                ? input.filePath
                : typeof input.directory === "string"
                  ? input.directory
                  : "Gathered workspace context",
            status: "working",
          });
          continue;
        }
      }

      if (type === "tool-output-available") {
        const output = normalizeToolInput(part.output);
        const outputText =
          typeof output.message === "string"
            ? output.message
            : typeof output.error === "string"
              ? output.error
              : typeof output.command === "string"
                ? truncate(output.command)
                : "Tool completed";

        items.push({
          id: `${message.id ?? "message"}-${index}-result`,
          kind: "result",
          title: "Tool returned output",
          detail: outputText,
          status: "done",
        });
      }
    }
  }

  return items.slice(-8).reverse();
}

export default function Craig() {
  const [task, setTask] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    api: "/api/chat",
  });

  const isLoading = status === "submitted" || status === "streaming";
  const hasMessages = messages.length > 0;

  const activities = useMemo(
    () =>
      extractActivities(
        messages as Array<{ id?: string; parts: Array<Record<string, unknown>> }>,
      ),
    [messages],
  );

  const visibleMessages = useMemo(
    () =>
      messages
        .map((message, index) => ({
          id: message.id ?? `${message.role}-${index}`,
          role: message.role,
          text: getMessageText(message),
        }))
        .filter((message) => message.text.length > 0),
    [messages],
  );

  const stats = useMemo(() => {
    const fileOps = activities.filter((item) => item.kind === "file").length;
    const commandOps = activities.filter((item) => item.kind === "command").length;
    const discoveryOps = activities.filter((item) => item.kind === "discovery").length;

    return [
      {
        label: "Agent Status",
        value: isLoading ? "Executing" : hasMessages ? "Ready" : "Idle",
        icon: Sparkles,
      },
      {
        label: "File Actions",
        value: String(fileOps),
        icon: FilePenLine,
      },
      {
        label: "Command Runs",
        value: String(commandOps),
        icon: Terminal,
      },
      {
        label: "Context Reads",
        value: String(discoveryOps),
        icon: FolderTree,
      },
    ];
  }, [activities, hasMessages, isLoading]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = task.trim();
    if (!value || isLoading) return;

    await sendMessage({
      text: value,
    });

    setTask("");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#06070b] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(45,212,191,0.16),transparent_24%),radial-gradient(circle_at_85%_0%,rgba(56,189,248,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_26%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-6 py-6 lg:px-8">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-300/10 shadow-[0_0_42px_rgba(45,212,191,0.18)]">
                <Bot className="size-6 text-teal-200" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Craig — Autonomous AI Software Engineer
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                  A local-first coding agent built to plan, edit, execute, and ship.
                </p>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
              Give Craig a real product task and watch the agent inspect the codebase,
              write files, run commands, and stream progress through a clean operator
              console.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-teal-300/20 bg-teal-300/10 text-teal-200 hover:bg-teal-300/10">
              <span className="mr-1.5 size-1.5 rounded-full bg-teal-200" />
              {isLoading ? "Agent running" : hasMessages ? "Ready for next task" : "Standing by"}
            </Badge>
            <Badge className="border-sky-300/20 bg-sky-300/10 text-sky-200 hover:bg-sky-300/10">
              qwen2.5-coder:7b
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/5">
              Ollama local
            </Badge>
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-6 xl:grid-cols-[380px_1fr]">
          <aside className="space-y-5">
            <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/25">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                  <Wand2 className="size-5 text-teal-200" />
                </div>
                <div>
                  <h2 className="font-semibold">Launch a Task</h2>
                  <p className="text-sm text-zinc-500">
                    Turn a vague brief into real engineering work.
                  </p>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <Textarea
                  value={task}
                  onChange={(event) => setTask(event.target.value)}
                  placeholder="Build a premium dashboard with auth, role-based routing, tables, and activity logging..."
                  className="min-h-44 resize-none border-white/10 bg-black/30 text-base text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-teal-300/40"
                />

                <Button
                  type="submit"
                  disabled={isLoading || !task.trim()}
                  className="h-12 w-full bg-teal-300 font-semibold text-zinc-950 hover:bg-teal-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Executing
                    </>
                  ) : (
                    <>
                      Start Agent
                      <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Demo prompts
                </p>
                <div className="grid gap-2">
                  {starterTasks.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => setTask(starter)}
                      className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-left text-sm text-zinc-300 transition hover:border-teal-300/25 hover:bg-teal-300/10 hover:text-white"
                    >
                      <span>{starter}</span>
                      <ArrowRight className="size-4 text-zinc-500 transition group-hover:text-teal-200" />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Why it lands
              </p>
              <div className="grid gap-3">
                {proofPoints.map((point) => (
                  <div
                    key={point.label}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3"
                  >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                      <point.icon className="size-4 text-teal-200" />
                    </div>
                    <span className="text-sm text-zinc-300">{point.label}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section className="space-y-6">
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg shadow-black/20"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-white/10">
                    <stat.icon className="size-4 text-teal-200" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 2xl:grid-cols-[360px_1fr]">
              <section className="rounded-2xl border border-white/10 bg-[#0b0d14]/90 p-5 shadow-2xl shadow-black/25">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">Execution Timeline</h2>
                    <p className="text-sm text-zinc-500">
                      Visible agent actions for demos and screenshots.
                    </p>
                  </div>
                  <Badge className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/5">
                    <Clock3 className="mr-1.5 size-3.5" />
                    Live
                  </Badge>
                </div>

                {activities.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-sm leading-7 text-zinc-500">
                    Craig will surface file reads, writes, command executions, and tool
                    results here once a task starts.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex size-2 rounded-full ${
                                item.status === "working" ? "bg-amber-300" : "bg-emerald-300"
                              }`}
                            />
                            <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                          </div>
                          <Badge className="border-white/10 bg-black/20 text-zinc-400 hover:bg-black/20">
                            {item.kind}
                          </Badge>
                        </div>
                        <p className="text-sm leading-6 text-zinc-400">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d14]/90 shadow-2xl shadow-black/25">
                <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                      <Code2 className="size-5 text-teal-200" />
                    </div>
                    <div>
                      <h2 className="font-semibold">Operator Console</h2>
                      <p className="text-sm text-zinc-500">
                        Natural language in, agent execution out.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/5">
                      <FolderTree className="mr-1.5 size-3.5" />
                      Filesystem
                    </Badge>
                    <Badge className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/5">
                      <Play className="mr-1.5 size-3.5" />
                      Commands
                    </Badge>
                  </div>
                </div>

                <div className="max-h-[820px] overflow-y-auto p-5">
                  {!hasMessages ? (
                    <div className="flex min-h-[620px] items-center justify-center text-center">
                      <div className="max-w-xl">
                        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-300/10">
                          <Bot className="size-10 text-teal-200" />
                        </div>
                        <h3 className="text-3xl font-semibold tracking-tight">
                          Portfolio-ready agent UX.
                        </h3>
                        <p className="mt-4 text-sm leading-7 text-zinc-400">
                          Craig is designed to feel like a real autonomous software
                          engineer: brief ingestion, planning, code edits, tool use, and
                          visible execution feedback in one clean workspace.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {visibleMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-4xl rounded-2xl px-5 py-4 text-sm leading-7 shadow-lg ${
                              message.role === "user"
                                ? "bg-teal-300 text-zinc-950 shadow-teal-950/20"
                                : "border border-white/10 bg-white/[0.055] text-zinc-100 shadow-black/20"
                            }`}
                          >
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] opacity-70">
                              {message.role === "user" ? (
                                <>
                                  <Send className="size-3.5" />
                                  Prompt
                                </>
                              ) : (
                                <>
                                  <Bot className="size-3.5" />
                                  Craig
                                </>
                              )}
                            </div>

                            <div className="whitespace-pre-wrap">{message.text}</div>
                          </div>
                        </div>
                      ))}

                      {isLoading ? (
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-teal-200">
                          <Sparkles className="size-4 animate-pulse" />
                          Craig is planning, inspecting, and executing the next step...
                        </div>
                      ) : null}

                      {error ? (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                          {error.message}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="grid gap-3 border-t border-white/10 bg-black/20 p-4 md:grid-cols-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-zinc-400">
                    <CheckCircle2 className="size-4 text-emerald-300" />
                    Streaming UI messages
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-zinc-400">
                    <Terminal className="size-4 text-sky-300" />
                    Visible command execution
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-zinc-400">
                    <ShieldCheck className="size-4 text-teal-200" />
                    Secret-safe local workflow
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
