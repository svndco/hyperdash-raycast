import { List } from "@raycast/api";
import { useEffect, useState } from "react";
import fg from "fast-glob";
import path from "path";
import fs from "fs/promises";

// EDIT if needed; using your path from earlier
const VAULT = "/Users/ja/Obsidian/JA";

export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await fs.access(VAULT);
        const files = await fg(["**/*.md", "**/*.markdown"], {
          cwd: VAULT,
          onlyFiles: true,
          dot: false,
          followSymbolicLinks: false
        });
        setItems(files.slice(0, 200));
      } catch (e: any) {
        setError(String(e?.message ?? e));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <List isLoading={isLoading} searchBarPlaceholder={`Vault: ${VAULT}`}>
      {error ? (
        <List.Item title="Error" subtitle={error} />
      ) : items.length === 0 ? (
        <List.Item title="No markdown files found" subtitle="Check VAULT path in src/main.tsx" />
      ) : (
        items.map((rel) => (
          <List.Item key={rel} title={path.basename(rel)} subtitle={rel} />
        ))
      )}
    </List>
  );
}
