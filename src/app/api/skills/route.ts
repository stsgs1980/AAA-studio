import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const skills = await db.skill.findMany({ orderBy: { updatedAt: "desc" } });
    return NextResponse.json(
      skills.map((s) => ({
        ...s,
        inputSchema: JSON.parse(s.inputSchema),
        outputSchema: JSON.parse(s.outputSchema),
        tags: JSON.parse(s.tags),
        standardIds: JSON.parse(s.standardIds),
      })),
    );
  } catch (error) {
    console.error("[GET /api/skills]", error);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, description, inputSchema, outputSchema, code, tests, tags, standardIds } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const skill = await db.skill.create({
      data: {
        name: name.trim(),
        category: category ?? "general",
        description: description ?? "",
        inputSchema: JSON.stringify(inputSchema ?? {}),
        outputSchema: JSON.stringify(outputSchema ?? {}),
        code: code ?? "",
        tests: tests ?? "",
        tags: JSON.stringify(tags ?? []),
        standardIds: JSON.stringify(standardIds ?? []),
      },
    });
    return NextResponse.json(
      { ...skill, inputSchema: JSON.parse(skill.inputSchema), outputSchema: JSON.parse(skill.outputSchema), tags: JSON.parse(skill.tags), standardIds: JSON.parse(skill.standardIds) },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/skills]", error);
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
  }
}
