import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const SUPPORTED_LANGUAGES = new Set(["ko", "en", "ja"]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ language: string; namespace: string }> }
) {
  const { language, namespace } = await context.params;

  if (!SUPPORTED_LANGUAGES.has(language)) {
    return NextResponse.json(
      { error: "Unsupported language" },
      { status: 400 }
    );
  }

  const normalizedNamespace = namespace.replace(/[^a-zA-Z0-9-_]/g, "");
  const translationsDir = path.join(process.cwd(), "translations");
  const filePath = path.join(
    translationsDir,
    language,
    `${normalizedNamespace}.json`
  );

  try {
    const fileContents = await readFile(filePath, "utf-8");
    const data = JSON.parse(fileContents);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Translation not found" }, { status: 404 });
  }
}

