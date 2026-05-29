// ============================================================================
// POST /api/standards/import -- accepts .md file upload and upserts standard
// ============================================================================

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { parseStandardFile } from "@/lib/standards/parse-md";

// TODO: Add authentication check before processing upload (demo mode = no auth)

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "No file provided" } },
        { status: 400 },
      );
    }

    if (!file.name.endsWith(".md")) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Only .md files are supported" } },
        { status: 400 },
      );
    }

    const content = await file.text();
    const parsed = parseStandardFile(content, file.name);

    if (!parsed) {
      return NextResponse.json(
        { success: false, error: { code: "PARSE_ERROR", message: "Could not parse standard from file. Ensure it has an > ID: line." } },
        { status: 400 },
      );
    }

    const data = {
      name: parsed.name,
      category: parsed.category,
      description: parsed.description,
      rules: JSON.stringify(parsed.rules),
      severity: parsed.severity,
      version: parsed.version,
    };

    const existing = await db.standard.findUnique({ where: { id: parsed.id } });
    let created = 0;
    let updated = 0;

    if (existing) {
      await db.standard.update({ where: { id: parsed.id }, data });
      updated = 1;
    } else {
      await db.standard.create({ data: { id: parsed.id, ...data } });
      created = 1;
    }

    return NextResponse.json({
      success: true,
      data: { created, updated, errors: [] },
    });
  } catch (error) {
    console.error("[POST /api/standards/import]", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to import standard" } },
      { status: 500 },
    );
  }
}
