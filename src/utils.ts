import fs from "fs/promises";
import path from "path";
import fg from "fast-glob";
import matter from "gray-matter";

const TAG_INLINE = /(^|\\s)#([A-Za-z0-9/_-]+)/g;
const H1_REGEX = /^#\\s+(.+?)\\s*$/m;

export type Note = {
  title: string;
  path: string;
  relativePath: string;
  tags: string[];
  mtimeMs: number;
  hasTodoTag: boolean;
  hasProjectTag: boolean;
};

function normalizeTags(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((v) => (typeof v === "string" ? v.split(/[,\s]+/) : [])).map((t) => t.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean);
  return [];
}

function extractInlineTags(content: string): string[] {
  const set = new Set<string>();
  for (const m of content.matchAll(TAG_INLINE)) {
    const tag = (m[2] ?? "").trim();
    if (tag) set.add(tag);
  }
  return [...set];
}

function extractTitle(content: string, fmTitle: unknown, fallback: string) {
  if (typeof fmTitle === "string" && fmTitle.trim()) return fmTitle.trim();
  const h1 = content.match(H1_REGEX)?.[1];
  return h1 ? h1.trim() : fallback;
}

export async function scanVault(opts: { vaultPath: string; todoTag: string; projectTag: string }): Promise<Note[]> {
  const { vaultPath, todoTag, projectTag } = opts;
  const entries = await fg(["**/*.md", "**/*.markdown"], {
    cwd: vaultPath,
    ignore: ["**/.obsidian/**", "**/.git/**", "**/node_modules/**"],
    onlyFiles: true,
    unique: true,
    followSymbolicLinks: false
  });

  const notes: Note[] = [];
  await Promise.all(
    entries.map(async (rel) => {
      const abs = path.join(vaultPath, rel);
      try {
        const [raw, st] = await Promise.all([fs.readFile(abs, "utf8"), fs.stat(abs)]);
        const parsed = matter(raw);
        const fmTags = normalizeTags((parsed.data as any)?.tags);
        const inlineTags = extractInlineTags(parsed.content);
        const tags = [...new Set([...fmTags, ...inlineTags])].map((t) => t.toLowerCase());
        const title = extractTitle(parsed.content, (parsed.data as any)?.title, path.parse(rel).name);

        notes.push({
          title,
          path: abs,
          relativePath: rel,
          tags,
          mtimeMs: st.mtimeMs,
          hasTodoTag: tags.includes(todoTag.toLowerCase()),
          hasProjectTag: tags.includes(projectTag.toLowerCase())
        });
      } catch {
        // ignore unreadable file
      }
    })
  );
  return notes;
}

export function sortByMtimeDesc(a: Note, b: Note) {
  return b.mtimeMs - a.mtimeMs;
}
