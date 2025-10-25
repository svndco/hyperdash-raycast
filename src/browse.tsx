import { Action, ActionPanel, Icon, List, getPreferenceValues, showToast, Toast } from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { scanVault, type Note, sortByMtimeDesc } from "./utils";
import { readBasesTag } from "./bases";

type Prefs = {
  vaultPath?: string;
  basesTodoFile?: string;
  basesProjectFile?: string;
  todoTag?: string;
  projectTag?: string;
};

export default function Command() {
  const prefs = getPreferenceValues<Prefs>();
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [effectiveTodo, setEffectiveTodo] = useState<string>(prefs.todoTag?.trim().toLowerCase() || "todo");
  const [effectiveProject, setEffectiveProject] = useState<string>(prefs.projectTag?.trim().toLowerCase() || "project");

  async function load() {
    try {
      setIsLoading(true);

      const [todoFromBases, projectFromBases] = await Promise.all([
        prefs.basesTodoFile?.trim() ? readBasesTag(prefs.basesTodoFile.trim()) : Promise.resolve(undefined),
        prefs.basesProjectFile?.trim() ? readBasesTag(prefs.basesProjectFile.trim()) : Promise.resolve(undefined)
      ]);

      const todoTag = (todoFromBases || prefs.todoTag || "todo").toLowerCase();
      const projectTag = (projectFromBases || prefs.projectTag || "project").toLowerCase();

      setEffectiveTodo(todoTag);
      setEffectiveProject(projectTag);

      if (!prefs.vaultPath?.trim()) {
        await showToast({ style: Toast.Style.Failure, title: "Set Vault Path in Preferences" });
        setNotes([]);
        return;
      }

      const scanned = await scanVault({
        vaultPath: prefs.vaultPath.trim(),
        todoTag,
        projectTag
      });

      setNotes(scanned);
    } catch (e: any) {
      await showToast({ style: Toast.Style.Failure, title: "Failed to load", message: String(e?.message ?? e) });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.vaultPath, prefs.basesTodoFile, prefs.basesProjectFile, prefs.todoTag, prefs.projectTag]);

  const todos = useMemo(() => notes.filter((n) => n.hasTodoTag).sort(sortByMtimeDesc), [notes]);
  const projects = useMemo(() => notes.filter((n) => n.hasProjectTag).sort(sortByMtimeDesc), [notes]);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search notes by title…">
      <List.Section title={`Todos (${todos.length})`} subtitle={`#${effectiveTodo}`}>
        {todos.map((n) => (
          <NoteItem key={`todo-${n.path}`} note={n} badge="todo" />
        ))}
      </List.Section>
      <List.Section title={`Projects (${projects.length})`} subtitle={`#${effectiveProject}`}>
        {projects.map((n) => (
          <NoteItem key={`project-${n.path}`} note={n} badge="project" />
        ))}
      </List.Section>
    </List>
  );
}

function NoteItem({ note, badge }: { note: Note; badge: "todo" | "project" }) {
  return (
    <List.Item
      title={note.title}
      subtitle={note.relativePath}
      icon={badge === "todo" ? Icon.CheckCircle : Icon.Folder}
      actions={
        <ActionPanel>
          <Action.Open title="Open File" target={note.path} />
          <Action.ShowInFinder path={note.path} />
          <Action.CopyToClipboard title="Copy Path" content={note.path} />
          <Action title="Refresh" icon={Icon.RotateClockwise} shortcut={{ modifiers: ["cmd"], key: "r" }} onAction={() => {}} />
        </ActionPanel>
      }
    />
  );
}
