import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured." },
        { status: 500 }
      );
    }
    const groq = new Groq({ apiKey });

    const { commits, version, projectName } = await req.json();

    if (!commits || typeof commits !== "string" || commits.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide commit messages." },
        { status: 400 }
      );
    }

    const versionHeader = version ? `v${version.replace(/^v/, "")}` : "Unreleased";
    const projectPrefix = projectName ? `# ${projectName}\n\n` : "";
    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = `You are a changelog writer. Given raw git commit messages or PR titles, generate a polished, user-facing changelog in markdown.

Rules:
- Group entries into these categories (use ONLY categories that have entries, skip empty ones):
  - ✨ New Features
  - 🐛 Bug Fixes
  - 🔧 Improvements
  - 📚 Documentation
  - ⚠️ Breaking Changes
- Each entry is a concise bullet point describing what changed from the USER's perspective
- Rewrite commit messages into clean, professional language
- Remove internal jargon, ticket numbers, and developer-only details
- Merge duplicate or related commits into single entries
- Output ONLY the categorized bullet points (no version header, no date — I will add those)`;

    const userPrompt = `Here are the raw commit messages / PR titles:\n\n${commits}`;

    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const body = chat.choices[0]?.message?.content?.trim() ?? "";
    const markdown = `${projectPrefix}## ${versionHeader} (${today})\n\n${body}`;

    return NextResponse.json({ markdown });
  } catch (err: unknown) {
    console.error("Groq API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
