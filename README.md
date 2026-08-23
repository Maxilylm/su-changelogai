# ChangelogAI

> Paste raw git commit messages and get a categorized, user-facing changelog in Markdown.

**[Live demo](https://su-changelogai.vercel.app)**

Release notes usually get written by hand because raw commit logs are full of ticket numbers, merge noise, and messages that only mean something to the person who wrote them. ChangelogAI takes that log — commit subjects or PR titles — and rewrites each line from the user's perspective, merging duplicates and dropping internal jargon. Entries are grouped under fixed emoji categories (New Features, Bug Fixes, Improvements, Documentation, Breaking Changes), and empty categories are omitted.

## Features

- Optional project name and version fields, assembled into a Markdown header with today's date
- Version strings are normalized (a leading `v` is not duplicated); omitting it yields "Unreleased"
- Split-pane layout: commit input on the left, output on the right
- Toggle between rendered preview and raw Markdown
- Copy the finished Markdown to the clipboard in one click

## Stack

- Next.js 16 (App Router) with React 19 and TypeScript
- Tailwind CSS v4
- `groq-sdk` against Groq's `llama-3.3-70b-versatile`

## Running locally

```bash
npm install
npm run dev
```

Requires `GROQ_API_KEY` in `.env.local` (see `.env.example`).

---

Part of a series of 91 small web apps. [Browse them all](https://su-slopmachine.vercel.app).
