"use client";

import { useState, useCallback } from "react";

function markdownToHtml(md: string): string {
  let html = md
    // headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // unordered list items
    .replace(/^- (.+)$/gm, '<li>$1</li>');

  // wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
  // wrap remaining lines in <p> (skip empty lines and already-wrapped tags)
  html = html
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (/^<(h[1-3]|ul|li|p)/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join('\n');

  return html;
}

const PLACEHOLDER = `feat: add dark mode toggle
fix: resolve login redirect loop
docs: update API reference for v2 endpoints
feat: implement webhook notifications
fix(ui): button alignment on mobile
chore: upgrade dependencies
refactor: extract auth middleware
feat!: change default pagination from 10 to 25
docs: add migration guide for v3
fix: race condition in concurrent uploads`;

export default function Home() {
  const [commits, setCommits] = useState("");
  const [version, setVersion] = useState("");
  const [projectName, setProjectName] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"markdown" | "preview">("preview");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    if (!commits.trim()) return;
    setLoading(true);
    setError("");
    setMarkdown("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commits: commits.trim(),
          version: version.trim() || undefined,
          projectName: projectName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMarkdown(data.markdown);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [commits, version, projectName]);

  const copyMarkdown = useCallback(async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [markdown]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
            C
          </div>
          <h1 className="text-lg font-semibold tracking-tight">ChangelogAI</h1>
          <span className="text-xs text-muted hidden sm:inline">
            AI-powered changelog generator
          </span>
        </div>
      </header>

      {/* Main split view */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Left: Input */}
        <div className="flex flex-col w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
            <span className="text-sm font-medium text-muted">Input</span>
          </div>

          {/* Optional fields */}
          <div className="flex gap-3 px-4 py-3 border-b border-border shrink-0">
            <input
              type="text"
              placeholder="Project name (optional)"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="flex-1 bg-surface border border-border rounded-md px-3 py-1.5 text-sm placeholder:text-muted focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="Version (optional)"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-36 bg-surface border border-border rounded-md px-3 py-1.5 text-sm placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            <textarea
              value={commits}
              onChange={(e) => setCommits(e.target.value)}
              placeholder={PLACEHOLDER}
              className="flex-1 w-full bg-surface border border-border rounded-lg p-4 text-sm font-mono leading-relaxed resize-none placeholder:text-muted/50 focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3 border-t border-border shrink-0">
            <button
              onClick={generate}
              disabled={loading || !commits.trim()}
              className="px-5 py-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? "Generating..." : "Generate Changelog"}
            </button>
            {error && (
              <span className="text-red-400 text-sm truncate">{error}</span>
            )}
          </div>
        </div>

        {/* Right: Output */}
        <div className="flex flex-col w-full lg:w-1/2 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-1 bg-surface rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "preview"
                    ? "bg-accent text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode("markdown")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "markdown"
                    ? "bg-accent text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Markdown
              </button>
            </div>

            {markdown && (
              <button
                onClick={copyMarkdown}
                className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-surface transition-colors"
              >
                {copied ? "Copied!" : "Copy Markdown"}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-6">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-3 text-muted">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-sm">Generating changelog...</span>
                </div>
              </div>
            )}

            {!loading && !markdown && (
              <div className="flex items-center justify-center h-full text-muted text-sm">
                Paste your commits and hit Generate to see the changelog here.
              </div>
            )}

            {!loading && markdown && viewMode === "markdown" && (
              <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-foreground/90">
                {markdown}
              </pre>
            )}

            {!loading && markdown && viewMode === "preview" && (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
