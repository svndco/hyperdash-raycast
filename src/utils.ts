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
  status?: string;
  project?: string;
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

export async function scanVault(opts: { vaultPath: string; todoTags: string[]; projectTags: string[] }): Promise<Note[]> {
  const { vaultPath, todoTags, projectTags } = opts;
  const entries = await fg(["**/*.md", "**/*.markdown"], {
    cwd: vaultPath,
    ignore: ["**/.obsidian/**", "**/.git/**", "**/node_modules/**", "**/log/**", "**/archive/**"],
    onlyFiles: true,
    unique: true,
    followSymbolicLinks: false
  });

  // Limit to first 5000 files to prevent memory issues
  const limitedEntries = entries.slice(0, 5000);

  const notes: Note[] = [];
  await Promise.all(
    limitedEntries.map(async (rel) => {
      const abs = path.join(vaultPath, rel);
      try {
        const [raw, st] = await Promise.all([fs.readFile(abs, "utf8"), fs.stat(abs)]);
        const parsed = matter(raw);
        const fmTags = normalizeTags((parsed.data as any)?.tags);
        const inlineTags = extractInlineTags(parsed.content);
        const tags = [...new Set([...fmTags, ...inlineTags])].map((t) => t.toLowerCase());
        const title = extractTitle(parsed.content, (parsed.data as any)?.title, path.parse(rel).name);

        // Extract status and project from frontmatter
        const rawStatus = (parsed.data as any)?.status || (parsed.data as any)?.Status;
        const status = typeof rawStatus === "string" ? rawStatus.trim().toLowerCase() : undefined;

        const rawProject = (parsed.data as any)?.project || (parsed.data as any)?.Project;
        const project = typeof rawProject === "string" ? rawProject.trim() : undefined;

        // Filter out done and canceled todos
        const isDoneOrCanceled = status === "done" || status === "canceled" || status === "cancelled";
        if (isDoneOrCanceled) {
          return; // Skip this note
        }

        // Check if note has any of the specified todo or project tags
        const hasTodoTag = todoTags.some(todoTag => tags.includes(todoTag));
        const hasProjectTag = projectTags.some(projectTag => tags.includes(projectTag));

        notes.push({
          title,
          path: abs,
          relativePath: rel,
          tags,
          mtimeMs: st.mtimeMs,
          hasTodoTag,
          hasProjectTag,
          status,
          project
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

export async function updateNoteStatus(filePath: string, newStatus: string): Promise<void> {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);

  // Update status in frontmatter (try both lowercase and capitalized)
  if (parsed.data) {
    parsed.data.status = newStatus;
    // Also update Status if it exists
    if (parsed.data.Status !== undefined) {
      parsed.data.Status = newStatus;
    }
    // Update dateModified
    parsed.data.dateModified = new Date().toISOString();
  }

  // Stringify back to markdown with frontmatter
  const updated = matter.stringify(parsed.content, parsed.data);
  await fs.writeFile(filePath, updated, "utf8");
}
