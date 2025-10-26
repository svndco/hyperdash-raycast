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
  }, []);

  // Group todos by status
  const todos = useMemo(() => notes.filter((n) => n.hasTodoTag), [notes]);
  const inProgress = useMemo(() => todos.filter((n) => n.status === "in-progress").sort(sortByMtimeDesc), [todos]);
  const upNext = useMemo(() => todos.filter((n) => n.status === "next" || n.status === "up next").sort(sortByMtimeDesc), [todos]);
  const todoItems = useMemo(() => todos.filter((n) => n.status === "todo" || n.status === "not started" || !n.status).sort(sortByMtimeDesc), [todos]);
  const holdStuck = useMemo(() => todos.filter((n) => n.status === "hold/stuck" || n.status === "stuck" || n.status === "hold").sort(sortByMtimeDesc), [todos]);
  const waiting = useMemo(() => todos.filter((n) => n.status === "waiting").sort(sortByMtimeDesc), [todos]);
  const someday = useMemo(() => todos.filter((n) => n.status === "someday").sort(sortByMtimeDesc), [todos]);

  const projects = useMemo(() => notes.filter((n) => n.hasProjectTag).sort(sortByMtimeDesc), [notes]);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search notes by title…">
      {inProgress.length > 0 && (
        <List.Section title={`In Progress (${inProgress.length})`} subtitle="status: in-progress">
          {inProgress.map((n) => (
            <NoteItem key={`inprogress-${n.path}`} note={n} badge="todo" onRefresh={load} />
          ))}
        </List.Section>
      )}
      {upNext.length > 0 && (
        <List.Section title={`Up Next (${upNext.length})`} subtitle="status: next">
          {upNext.map((n) => (
            <NoteItem key={`upnext-${n.path}`} note={n} badge="todo" onRefresh={load} />
          ))}
        </List.Section>
      )}
      {todoItems.length > 0 && (
        <List.Section title={`Todo (${todoItems.length})`} subtitle="status: todo">
          {todoItems.map((n) => (
            <NoteItem key={`todo-${n.path}`} note={n} badge="todo" onRefresh={load} />
          ))}
        </List.Section>
      )}
      {holdStuck.length > 0 && (
        <List.Section title={`Hold/Stuck (${holdStuck.length})`} subtitle="status: hold/stuck">
          {holdStuck.map((n) => (
            <NoteItem key={`hold-${n.path}`} note={n} badge="todo" onRefresh={load} />
          ))}
        </List.Section>
      )}
      {waiting.length > 0 && (
        <List.Section title={`Waiting (${waiting.length})`} subtitle="status: waiting">
          {waiting.map((n) => (
            <NoteItem key={`waiting-${n.path}`} note={n} badge="todo" onRefresh={load} />
          ))}
        </List.Section>
      )}
      {someday.length > 0 && (
        <List.Section title={`Someday (${someday.length})`} subtitle="status: someday">
          {someday.map((n) => (
            <NoteItem key={`someday-${n.path}`} note={n} badge="todo" onRefresh={load} />
          ))}
        </List.Section>
      )}
      {projects.length > 0 && (
        <List.Section title={`Projects (${projects.length})`} subtitle={`#${effectiveProject}`}>
          {projects.map((n) => (
            <NoteItem key={`project-${n.path}`} note={n} badge="project" onRefresh={load} />
          ))}
        </List.Section>
      )}
    </List>
  );
}

function NoteItem({ note, badge, onRefresh }: { note: Note; badge: "todo" | "project"; onRefresh: () => void }) {
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
          <Action title="Refresh" icon={Icon.RotateClockwise} shortcut={{ modifiers: ["cmd"], key: "r" }} onAction={onRefresh} />
        </ActionPanel>
      }
    />
  );
}
