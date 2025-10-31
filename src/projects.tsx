import { Action, ActionPanel, Color, Icon, List, getPreferenceValues, showToast, Toast } from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { scanVault, type Note, sortByMtimeDesc, updateNoteStatus, updateNoteDate } from "./utils";
import { readBasesTag } from "./bases";

type Prefs = {
  projectPath: string;
  basesProjectFile: string;
};

function formatDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
      return `${monthStr} ${day}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function isOverdue(dateStr: string): boolean {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dueDate = new Date(year, month, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today;
    }
    return false;
  } catch {
    return false;
  }
}

function isToday(dateStr: string): boolean {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dueDate = new Date(year, month, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    }
    return false;
  } catch {
    return false;
  }
}

export default function Command() {
  const prefs = getPreferenceValues<Prefs>();
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [effectiveProject, setEffectiveProject] = useState<string>("");

  async function load() {
    try {
      setIsLoading(true);

      if (!prefs.projectPath?.trim()) {
        await showToast({ style: Toast.Style.Failure, title: "Set Project Path in Preferences" });
        setNotes([]);
        return;
      }

      if (!prefs.basesProjectFile?.trim()) {
        await showToast({ style: Toast.Style.Failure, title: "Set Bases Project File in Preferences" });
        setNotes([]);
        return;
      }

      const projectFromBases = await readBasesTag(prefs.basesProjectFile.trim());

      if (!projectFromBases) {
        await showToast({
          style: Toast.Style.Failure,
          title: "No tags found in Project file",
          message: "Check that your project.base file contains tags.containsAny() or tags.contains()"
        });
        setNotes([]);
        return;
      }

      const projectTags = projectFromBases.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

      setEffectiveProject(projectTags.join(', '));

      const scanned = await scanVault({
        vaultPath: prefs.projectPath.trim(),
        todoTags: [], // Empty array to not match any todos
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

  // Filter projects by search text
  const filteredProjects = useMemo(() => {
    const projects = notes.filter((n) => n.hasProjectTag);
    if (!searchText.trim()) return projects;
    const searchLower = searchText.trim().toLowerCase();
    return projects.filter((n) => n.title.toLowerCase().includes(searchLower));
  }, [notes, searchText]);

  // Group projects by status
  const planning = useMemo(() => filteredProjects.filter((n) => n.status === "planning").sort(sortByMtimeDesc), [filteredProjects]);
  const inProgress = useMemo(() => filteredProjects.filter((n) => n.status === "in-progress").sort(sortByMtimeDesc), [filteredProjects]);
  const active = useMemo(() => filteredProjects.filter((n) => n.status === "active").sort(sortByMtimeDesc), [filteredProjects]);
  const onHold = useMemo(() => filteredProjects.filter((n) => n.status === "on-hold" || n.status === "hold" || n.status === "paused").sort(sortByMtimeDesc), [filteredProjects]);
  const other = useMemo(() => filteredProjects.filter((n) => !n.status || (n.status !== "planning" && n.status !== "in-progress" && n.status !== "active" && n.status !== "on-hold" && n.status !== "hold" && n.status !== "paused")).sort(sortByMtimeDesc), [filteredProjects]);

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search projects by title…"
      onSearchTextChange={setSearchText}
      searchText={searchText}
    >
      {planning.length > 0 && (
        <List.Section title={`Planning (${planning.length})`} subtitle="status: planning">
          {planning.map((n) => (
            <ProjectItem key={n.path} note={n} onRefresh={load} />
          ))}
        </List.Section>
      )}
      {inProgress.length > 0 && (
        <List.Section title={`In Progress (${inProgress.length})`} subtitle="status: in-progress">
          {inProgress.map((n) => (
            <ProjectItem key={n.path} note={n} onRefresh={load} />
          ))}
        </List.Section>
      )}
      {active.length > 0 && (
        <List.Section title={`Active (${active.length})`} subtitle="status: active">
          {active.map((n) => (
            <ProjectItem key={n.path} note={n} onRefresh={load} />
          ))}
        </List.Section>
      )}
      {onHold.length > 0 && (
        <List.Section title={`On Hold (${onHold.length})`} subtitle="status: on-hold">
          {onHold.map((n) => (
            <ProjectItem key={n.path} note={n} onRefresh={load} />
          ))}
        </List.Section>
      )}
      {other.length > 0 && (
        <List.Section title={`Other (${other.length})`}>
          {other.map((n) => (
            <ProjectItem key={n.path} note={n} onRefresh={load} />
          ))}
        </List.Section>
      )}
    </List>
  );
}

function ProjectItem({ note, onRefresh }: { note: Note; onRefresh: () => void }) {
  const accessories = [];
  if (note.dateDue) {
    const overdue = isOverdue(note.dateDue);
    const today = isToday(note.dateDue);
    let iconColor: Color | undefined = undefined;
    if (overdue) {
      iconColor = Color.Red;
    } else if (today) {
      iconColor = Color.Green;
    }
    accessories.push({
      text: formatDate(note.dateDue),
      icon: { source: Icon.Calendar, tintColor: iconColor }
    });
  }
  if (note.status) {
    accessories.push({ text: note.status });
  }

  // Determine icon based on status
  let itemIcon = Icon.Folder;
  if (note.status === "in-progress") {
    itemIcon = Icon.CircleProgress;
  } else if (note.status === "active") {
    itemIcon = Icon.CheckCircle;
  } else if (note.status === "planning") {
    itemIcon = Icon.Pencil;
  } else if (note.status === "on-hold" || note.status === "hold" || note.status === "paused") {
    itemIcon = Icon.Pause;
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

  async function handleStatusChange(newStatus: string) {
    try {
      await updateNoteStatus(note.path, newStatus);
      await showToast({
        style: Toast.Style.Success,
        title: "Status Updated",
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
          <ActionPanel.Section title="Set Status">
            <Action
              title="Planning"
              icon={Icon.Pencil}
              onAction={() => handleStatusChange("planning")}
            />
            <Action
              title="In Progress"
              icon={Icon.CircleProgress}
              onAction={() => handleStatusChange("in-progress")}
            />
            <Action
              title="Active"
              icon={Icon.CheckCircle}
              onAction={() => handleStatusChange("active")}
            />
            <Action
              title="On Hold"
              icon={Icon.Pause}
              onAction={() => handleStatusChange("on-hold")}
            />
          </ActionPanel.Section>
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
          <Action.OpenInBrowser
            title="Open in Obsidian"
            url={`obsidian://open?path=${encodeURIComponent(note.path)}`}
            icon={Icon.Document}
          />
          <Action.ShowInFinder path={note.path} />
          <Action.CopyToClipboard title="Copy Path" content={note.path} />
          <Action title="Refresh" icon={Icon.RotateClockwise} shortcut={{ modifiers: ["cmd"], key: "r" }} onAction={onRefresh} />
        </ActionPanel>
      }
    />
  );
}
