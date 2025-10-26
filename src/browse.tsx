import { Action, ActionPanel, Icon, List, getPreferenceValues, showToast, Toast, useNavigation } from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { scanVault, type Note, sortByMtimeDesc, updateNoteStatus, updateNoteDate } from "./utils";
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

      // Support comma-separated tags
      const todoTagRaw = todoFromBases || prefs.todoTag || "todo";
      const projectTagRaw = projectFromBases || prefs.projectTag || "project";

      const todoTags = todoTagRaw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      const projectTags = projectTagRaw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

      setEffectiveTodo(todoTags.join(', '));
      setEffectiveProject(projectTags.join(', '));

      if (!prefs.vaultPath?.trim()) {
        await showToast({ style: Toast.Style.Failure, title: "Set Vault Path in Preferences" });
        setNotes([]);
        return;
      }

      const scanned = await scanVault({
        vaultPath: prefs.vaultPath.trim(),
        todoTags,
        projectTags
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
  const todoItems = useMemo(() => todos.filter((n) => n.status === "todo" || n.status === "not started" || n.status === "open" || !n.status).sort(sortByMtimeDesc), [todos]);
  const holdStuck = useMemo(() => todos.filter((n) => n.status === "hold/stuck" || n.status === "stuck" || n.status === "hold").sort(sortByMtimeDesc), [todos]);
  const waiting = useMemo(() => todos.filter((n) => n.status === "waiting").sort(sortByMtimeDesc), [todos]);
  const someday = useMemo(() => todos.filter((n) => n.status === "someday").sort(sortByMtimeDesc), [todos]);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search notes by title…">
      {inProgress.length > 0 && (
        <List.Section title={`In Progress (${inProgress.length})`} subtitle="status: in-progress">
          {inProgress.map((n) => (
            <NoteItem key={`inprogress-${n.path}`} note={n} onRefresh={load} />
          ))}
        </List.Section>
      )}
      {upNext.length > 0 && (
        <List.Section title={`Up Next (${upNext.length})`} subtitle="status: next">
          {upNext.map((n) => (
            <NoteItem key={`upnext-${n.path}`} note={n} onRefresh={load} />
          ))}
        </List.Section>
      )}
      {todoItems.length > 0 && (
        <List.Section title={`Todo (${todoItems.length})`} subtitle="status: todo">
          {todoItems.map((n) => (
            <NoteItem key={`todo-${n.path}`} note={n} onRefresh={load} />
          ))}
        </List.Section>
      )}
      {holdStuck.length > 0 && (
        <List.Section title={`Hold/Stuck (${holdStuck.length})`} subtitle="status: hold/stuck">
          {holdStuck.map((n) => (
            <NoteItem key={`hold-${n.path}`} note={n} onRefresh={load} />
          ))}
        </List.Section>
      )}
      {waiting.length > 0 && (
        <List.Section title={`Waiting (${waiting.length})`} subtitle="status: waiting">
          {waiting.map((n) => (
            <NoteItem key={`waiting-${n.path}`} note={n} onRefresh={load} />
          ))}
        </List.Section>
      )}
      {someday.length > 0 && (
        <List.Section title={`Someday (${someday.length})`} subtitle="status: someday">
          {someday.map((n) => (
            <NoteItem key={`someday-${n.path}`} note={n} onRefresh={load} />
          ))}
        </List.Section>
      )}
    </List>
  );
}

function SetStatusForm({ note, onStatusUpdated }: { note: Note; onStatusUpdated: () => void }) {
  const { pop } = useNavigation();
  const statuses = [
    { value: "todo", title: "Todo", icon: Icon.Circle },
    { value: "in-progress", title: "In Progress", icon: Icon.CircleProgress },
    { value: "next", title: "Up Next", icon: Icon.ArrowRight },
    { value: "hold/stuck", title: "Hold/Stuck", icon: Icon.Pause },
    { value: "waiting", title: "Waiting", icon: Icon.Clock },
    { value: "someday", title: "Someday", icon: Icon.Calendar },
    { value: "done", title: "Done", icon: Icon.CheckCircle },
    { value: "canceled", title: "Canceled", icon: Icon.XMarkCircle }
  ];

  async function handleStatusChange(newStatus: string) {
    try {
      await updateNoteStatus(note.path, newStatus);
      await showToast({
        style: Toast.Style.Success,
        title: `Set Status: ${newStatus}`,
        message: note.title
      });
      onStatusUpdated();
      pop(); // Close the form and return to the main list
    } catch (error: any) {
      await showToast({ style: Toast.Style.Failure, title: "Failed to update", message: error.message });
    }
  }

  return (
    <List navigationTitle={`Set Status: ${note.title}`} searchBarPlaceholder="Choose new status...">
      <List.Section title={`Current: ${note.status || "none"}`}>
        {statuses.map((s) => (
          <List.Item
            key={s.value}
            title={s.title}
            icon={s.icon}
            accessories={s.value === note.status ? [{ text: "Current" }] : []}
            actions={
              <ActionPanel>
                <Action
                  title={`Set to ${s.title}`}
                  icon={Icon.Checkmark}
                  onAction={() => handleStatusChange(s.value)}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}

function NoteItem({ note, onRefresh }: { note: Note; onRefresh: () => void }) {
  const accessories = [];
  if (note.project) {
    accessories.push({ text: note.project, icon: Icon.Folder });
  }
  if (note.status) {
    accessories.push({ text: note.status });
  }

  // Determine icon based on status
  let itemIcon = Icon.Circle; // default for todo/open/not started
  if (note.status === "in-progress") {
    itemIcon = Icon.CircleProgress;
  } else if (note.status === "next" || note.status === "up next") {
    itemIcon = Icon.ArrowRight;
  } else if (note.status === "hold/stuck" || note.status === "stuck" || note.status === "hold") {
    itemIcon = Icon.Pause;
  } else if (note.status === "waiting") {
    itemIcon = Icon.Clock;
  } else if (note.status === "someday") {
    itemIcon = Icon.Calendar;
  } else if (note.status === "done") {
    itemIcon = Icon.CheckCircle;
  } else if (note.status === "canceled") {
    itemIcon = Icon.XMarkCircle;
  }

  async function handleDateChange(field: string, fieldLabel: string, date: Date | null) {
    try {
      await updateNoteDate(note.path, field, date);
      const message = date ? `Set to: ${date.toLocaleDateString()}` : "Cleared";
      await showToast({
        style: Toast.Style.Success,
        title: `${fieldLabel} Updated`,
        message: note.title
      });
      onRefresh();
    } catch (error: any) {
      await showToast({ style: Toast.Style.Failure, title: "Failed to update", message: error.message });
    }
  }

  return (
    <List.Item
      title={note.title}
      icon={itemIcon}
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action.Push
            title="Set Status"
            icon={Icon.Pencil}
            target={<SetStatusForm note={note} onStatusUpdated={onRefresh} />}
          />
          <Action.Open title="Open in Obsidian" target={note.path} />
          <Action.ShowInFinder path={note.path} />
          <Action.CopyToClipboard title="Copy Path" content={note.path} />
          <Action title="Refresh" icon={Icon.RotateClockwise} shortcut={{ modifiers: ["cmd"], key: "r" }} onAction={onRefresh} />

          <ActionPanel.Section title="Set Dates">
            <Action.PickDate
              title="Set Due Date"
              icon={Icon.Calendar}
              onChange={(date) => handleDateChange("date_due", "Due Date", date)}
            />
            <Action.PickDate
              title="Set Start Date"
              icon={Icon.PlayFilled}
              onChange={(date) => handleDateChange("date_started", "Start Date", date)}
            />
            <Action.PickDate
              title="Set Scheduled Date"
              icon={Icon.Clock}
              onChange={(date) => handleDateChange("scheduled", "Scheduled Date", date)}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
