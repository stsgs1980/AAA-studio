// ============================================================================
// POST /api/standards/import -- accepts .md file upload and upserts standard
// ============================================================================

import { db } from "@/lib/db";
import { handleError, success, BadRequest } from "@/lib/api-error";
import { parseStandardFile } from "@/lib/standards/parse-md";

// TODO: Add authentication check before processing upload (demo mode = no auth)

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw BadRequest("No file provided");
    }

    if (!file.name.endsWith(".md")) {
      throw BadRequest("Only .md files are supported");
    }

    const content = await file.text();
    const parsed = parseStandardFile(content, file.name);

    if (!parsed) {
      throw BadRequest("Could not parse standard from file. Ensure it has an > ID: line.");
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
    let createdCount = 0;
    let updated = 0;

    if (existing) {
      await db.standard.update({ where: { id: parsed.id }, data });
      updated = 1;
    } else {
      await db.standard.create({ data: { id: parsed.id, ...data } });
      createdCount = 1;
    }

    return success({ created: createdCount, updated, errors: [] });
  } catch (error) {
    return handleError(error);
  }
}
