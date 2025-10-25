import fs from "fs/promises";
import YAML from "yaml";

export async function readBasesTag(filePath: string): Promise<string | undefined> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const doc = YAML.parse(raw) as any;
    const andList: any[] | undefined = doc?.filters?.and;
    if (Array.isArray(andList)) {
      for (const item of andList) {
        if (typeof item === "string") {
          const m = item.match(/tags\\.contains\\(["'](.+?)["']\\)/i);
          if (m?.[1]) return m[1].trim().toLowerCase();
        }
      }
    }
  } catch {
    // ignore parse/read errors
  }
  return undefined;
}
