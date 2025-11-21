import { Action, ActionPanel, Color, Form, Icon, List, getPreferenceValues, showToast, Toast, useNavigation } from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { scanVault, type Note, sortByMtimeDesc, updateNoteStatus, updateNoteDate, updateNoteProject, scanProjects, createProjectNote, createTodoNote } from "./utils";
import { readBaseConfig, evaluateWithView, type BaseConfig } from "./bases";
import path from "path";

type Prefs = {
  basesTodoFile: string;
  todoViewName?: string;
  todoScanPath?: string;
  basesProjectFile: string;
  projectViewName?: string;
  projectScanPath?: string;
  showRecurrence?: boolean;
  showPriority?: boolean;
  showTimeTracking?: boolean;
  maxResults?: string;
};

function formatDate(dateStr: string): string {
  try {
    // Parse as local date to avoid timezone issues
    // Split "2025-10-26" into [2025, 10, 26]
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
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
      today.setHours(0, 0, 0, 0); // Reset time to midnight for fair comparison
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
  const [effectiveTodo, setEffectiveTodo] = useState<string>("");
  const [effectiveProject, setEffectiveProject] = useState<string>("");
  const [loadingRef, setLoadingRef] = useState(false);

  async function load(rebuildCache = false) {
    // Prevent duplicate simultaneous loads (React 18 strict mode calls useEffect twice)
    if (loadingRef) return;
    setLoadingRef(true);

    try {
      setIsLoading(true);

      // Validate required fields
      if (!prefs.basesTodoFile?.trim()) {
        await showToast({ style: Toast.Style.Failure, title: "Set Todo Base File in Preferences" });
        setNotes([]);
        return;
      }

      if (!prefs.basesProjectFile?.trim()) {
        await showToast({ style: Toast.Style.Failure, title: "Set Project Base File in Preferences" });
        setNotes([]);
        return;
      }

      // Read configurations from Base files
      const [todoConfig, projectConfig] = await Promise.all([
        readBaseConfig(prefs.basesTodoFile.trim()),
        readBaseConfig(prefs.basesProjectFile.trim())
      ]);

      // Validate that Base files were parsed successfully
      if (!todoConfig) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to parse Todo Base file",
          message: "Check that your base file is valid YAML"
        });
        setNotes([]);
        return;
      }

      if (!projectConfig) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to parse Project Base file",
          message: "Check that your base file is valid YAML"
        });
        setNotes([]);
        return;
      }

      // Validate that vault paths were found
      if (!todoConfig.vaultPath) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Could not find vault for Todo Base file",
          message: "Make sure your .base file is inside an Obsidian vault with .obsidian folder"
        });
        setNotes([]);
        return;
      }

      if (!projectConfig.vaultPath) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Could not find vault for Project Base file",
          message: "Make sure your .base file is inside an Obsidian vault with .obsidian folder"
        });
        setNotes([]);
        return;
      }

      // Display effective filter info
      const todoTagFilters = todoConfig.filters.filter(f => f.property === "tags");
      const projectTagFilters = projectConfig.filters.filter(f => f.property === "tags");

      setEffectiveTodo(todoTagFilters.flatMap(f => f.values).join(', ') || 'dynamic filters');
      setEffectiveProject(projectTagFilters.flatMap(f => f.values).join(', ') || 'dynamic filters');

      // Scan the vault with inline filtering
      const todoViewName = prefs.todoViewName?.trim() || undefined;
      const projectViewName = prefs.projectViewName?.trim() || undefined;

      const filterFn = (note: any) => {
        // Apply filters during scan to avoid loading all files into memory
        const matchesTodo = evaluateWithView(todoConfig, note, todoViewName);
        const matchesProject = evaluateWithView(projectConfig, note, projectViewName);

        // Only keep notes that match either filter
        if (!matchesTodo && !matchesProject) return null;

        return {
          ...note,
          hasTodoTag: matchesTodo,
          hasProjectTag: matchesProject
        };
      };

      // Scan vault and show results with toast
      const scanned = await scanVault({
        vaultPath: todoConfig.vaultPath,
        todoTags: [],
        projectTags: [],
        useCache: false,
        filterFn
      });

      setNotes(scanned);
      setIsLoading(false);
      setLoadingRef(false);
    } catch (e: any) {
      await showToast({ style: Toast.Style.Failure, title: "Failed to load", message: String(e?.message ?? e) });
      setIsLoading(false);
      setLoadingRef(false);
    }
  }

  useEffect(() => {
    load().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateTodo() {
    if (!searchText.trim()) return;

    try {
      if (!prefs.basesTodoFile?.trim()) {
        await showToast({ style: Toast.Style.Failure, title: "Todo Base file not set" });
        return;
      }

      // Get todo config from base file
      const todoConfig = await readBaseConfig(prefs.basesTodoFile.trim());

      if (!todoConfig || !todoConfig.vaultPath) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to parse Todo Base file",
          message: "Check that your base file is valid and in an Obsidian vault"
        });
        return;
      }

      // Extract first tag from tag filters
      const todoTagFilters = todoConfig.filters.filter(f => f.property === "tags");
      if (todoTagFilters.length === 0 || todoTagFilters[0].values.length === 0) {
        await showToast({
          style: Toast.Style.Failure,
          title: "No tags found in Todo Base file",
          message: "Base file must contain at least one tag filter"
        });
        return;
      }

      const todoTag = todoTagFilters[0].values[0];

      // Create new todo note (no dates - set later via actions)
      await createTodoNote(todoConfig.vaultPath, searchText.trim(), todoTag);

      await showToast({
        style: Toast.Style.Success,
        title: "Todo Created",
        message: searchText.trim()
      });

      // Clear search and refresh
      setSearchText("");
      await load();
    } catch (error: any) {
      await showToast({ style: Toast.Style.Failure, title: "Failed to create todo", message: error.message });
    }
  }

  // Group todos by status
  const todos = useMemo(() => notes.filter((n) => n.hasTodoTag), [notes]);

  // Filter todos by search text with performance limit
  const filteredTodos = useMemo(() => {
    const prefs = getPreferenceValues<Prefs>();
    const maxResults = parseInt(prefs.maxResults || "500", 10);

    let filtered = todos;
    if (searchText.trim()) {
      const searchLower = searchText.trim().toLowerCase();
      filtered = todos.filter((n) => n.title.toLowerCase().includes(searchLower));
    }

    // Sort by priority (alphabetical), then by due date, then by mtime
    filtered = filtered.sort((a, b) => {
      // Priority first (alphabetical sorting as per TaskNotes 4.0.1)
      if (a.priority && b.priority) {
        const priorityCompare = a.priority.localeCompare(b.priority);
        if (priorityCompare !== 0) return priorityCompare;
      } else if (a.priority) return -1;
      else if (b.priority) return 1;

      // Then by due date
      if (a.dateDue && b.dateDue) {
        const dateCompare = a.dateDue.localeCompare(b.dateDue);
        if (dateCompare !== 0) return dateCompare;
      } else if (a.dateDue) return -1;
      else if (b.dateDue) return 1;

      // Finally by modification time
      return b.mtimeMs - a.mtimeMs;
    });

    // Apply performance limit
    return filtered.slice(0, maxResults);
  }, [todos, searchText]);

  const inProgress = useMemo(() => filteredTodos.filter((n) => n.status === "in-progress").sort(sortByMtimeDesc), [filteredTodos]);
  const upNext = useMemo(() => filteredTodos.filter((n) => n.status === "next" || n.status === "up next").sort(sortByMtimeDesc), [filteredTodos]);
  const todoItems = useMemo(() => filteredTodos.filter((n) => n.status === "todo" || n.status === "not started" || n.status === "open" || !n.status).sort(sortByMtimeDesc), [filteredTodos]);
  const holdStuck = useMemo(() => filteredTodos.filter((n) => n.status === "hold/stuck" || n.status === "stuck" || n.status === "hold").sort(sortByMtimeDesc), [filteredTodos]);
  const waiting = useMemo(() => filteredTodos.filter((n) => n.status === "waiting").sort(sortByMtimeDesc), [filteredTodos]);
  const someday = useMemo(() => filteredTodos.filter((n) => n.status === "someday").sort(sortByMtimeDesc), [filteredTodos]);

  // Check if search text exactly matches any existing todo
  const showCreateOption = useMemo(() => {
    if (!searchText.trim()) return false;
    const searchLower = searchText.trim().toLowerCase();
    return !todos.some(todo => todo.title.toLowerCase() === searchLower);
  }, [searchText, todos]);

  const searchPlaceholder = notes.length > 0
    ? `Search ${notes.length} notes by title…`
    : "Search notes by title…";

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder={searchPlaceholder}
      onSearchTextChange={setSearchText}
      searchText={searchText}
    >
      {showCreateOption && (
        <List.Section title="Create New">
          <List.Item
            title={`Create New Todo: "${searchText.trim()}"`}
            icon={Icon.Plus}
            actions={
              <ActionPanel>
                <Action
                  title="Create Todo"
                  icon={Icon.Plus}
                  onAction={handleCreateTodo}
                />
              </ActionPanel>
            }
          />
        </List.Section>
      )}
      {inProgress.length > 0 && (
        <List.Section title={`In Progress (${inProgress.length})`} subtitle="status: in-progress">
          {inProgress.map((n) => (
            <NoteItem key={`inprogress-${n.path}`} note={n} onRefresh={() => load(false)} onRebuild={() => load(true)} />
          ))}
        </List.Section>
      )}
      {upNext.length > 0 && (
        <List.Section title={`Up Next (${upNext.length})`} subtitle="status: next">
          {upNext.map((n) => (
            <NoteItem key={`upnext-${n.path}`} note={n} onRefresh={() => load(false)} onRebuild={() => load(true)} />
          ))}
        </List.Section>
      )}
      {todoItems.length > 0 && (
        <List.Section title={`Todo (${todoItems.length})`} subtitle="status: todo">
          {todoItems.map((n) => (
            <NoteItem key={`todo-${n.path}`} note={n} onRefresh={() => load(false)} onRebuild={() => load(true)} />
          ))}
        </List.Section>
      )}
      {holdStuck.length > 0 && (
        <List.Section title={`Hold/Stuck (${holdStuck.length})`} subtitle="status: hold/stuck">
          {holdStuck.map((n) => (
            <NoteItem key={`hold-${n.path}`} note={n} onRefresh={() => load(false)} onRebuild={() => load(true)} />
          ))}
        </List.Section>
      )}
      {waiting.length > 0 && (
        <List.Section title={`Waiting (${waiting.length})`} subtitle="status: waiting">
          {waiting.map((n) => (
            <NoteItem key={`waiting-${n.path}`} note={n} onRefresh={() => load(false)} onRebuild={() => load(true)} />
          ))}
        </List.Section>
      )}
      {someday.length > 0 && (
        <List.Section title={`Someday (${someday.length})`} subtitle="status: someday">
          {someday.map((n) => (
            <NoteItem key={`someday-${n.path}`} note={n} onRefresh={() => load(false)} onRebuild={() => load(true)} />
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

function SetProjectForm({ note, onProjectUpdated }: { note: Note; onProjectUpdated: () => void }) {
  const { pop } = useNavigation();
  const prefs = getPreferenceValues<Prefs>();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    async function loadProjects() {
      try {
        if (!prefs.basesProjectFile?.trim()) {
          await showToast({ style: Toast.Style.Failure, title: "Project Base file not set" });
          return;
        }

        // Get project config from base file
        const projectConfig = await readBaseConfig(prefs.basesProjectFile.trim());

        if (!projectConfig || !projectConfig.vaultPath) {
          await showToast({
            style: Toast.Style.Failure,
            title: "Failed to parse Project Base file",
            message: "Check that your base file is valid and in an Obsidian vault"
          });
          return;
        }

        // Extract tags from project filters (for backwards compatibility with scanProjects)
        const projectTagFilters = projectConfig.filters.filter(f => f.property === "tags");
        const projectTags = projectTagFilters.flatMap(f => f.values.map(v => v.toLowerCase()));

        const projectList = await scanProjects(projectConfig.vaultPath, projectTags);
        setProjects(projectList);
      } catch (error: any) {
        await showToast({ style: Toast.Style.Failure, title: "Failed to load projects", message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  // Filter projects by search text
  const filteredProjects = useMemo(() => {
    if (!searchText.trim()) return projects;
    const searchLower = searchText.trim().toLowerCase();
    return projects.filter((proj) => proj.toLowerCase().includes(searchLower));
  }, [projects, searchText]);

  // Check if search text exactly matches any existing project
  const showCreateOption = useMemo(() => {
    if (!searchText.trim()) return false;
    const searchLower = searchText.trim().toLowerCase();
    return !projects.some(proj => proj.toLowerCase() === searchLower);
  }, [searchText, projects]);

  async function handleSelectProject(projectName: string) {
    try {
      await updateNoteProject(note.path, projectName);
      await showToast({
        style: Toast.Style.Success,
        title: "Project Set",
        message: note.title
      });
      onProjectUpdated();
      pop();
    } catch (error: any) {
      await showToast({ style: Toast.Style.Failure, title: "Failed to update", message: error.message });
    }
  }

  async function handleCreateAndSet() {
    if (!searchText.trim()) return;

    try {
      if (!prefs.basesProjectFile?.trim()) {
        await showToast({ style: Toast.Style.Failure, title: "Project Base file not set" });
        return;
      }

      // Get project config from base file
      const projectConfig = await readBaseConfig(prefs.basesProjectFile.trim());

      if (!projectConfig || !projectConfig.vaultPath) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to parse Project Base file",
          message: "Check that your base file is valid and in an Obsidian vault"
        });
        return;
      }

      // Extract first tag from tag filters
      const projectTagFilters = projectConfig.filters.filter(f => f.property === "tags");
      if (projectTagFilters.length === 0 || projectTagFilters[0].values.length === 0) {
        await showToast({
          style: Toast.Style.Failure,
          title: "No tags found in Project Base file",
          message: "Base file must contain at least one tag filter"
        });
        return;
      }

      const projectTag = projectTagFilters[0].values[0];

      // Create new project note (no dates - set later via actions)
      await createProjectNote(projectConfig.vaultPath, searchText.trim(), projectTag);

      // Set it on the todo
      await updateNoteProject(note.path, searchText.trim());

      await showToast({
        style: Toast.Style.Success,
        title: "Project Created & Set",
        message: note.title
      });
      onProjectUpdated();
      pop();
    } catch (error: any) {
      await showToast({ style: Toast.Style.Failure, title: "Failed to create project", message: error.message });
    }
  }

  async function handleClear() {
    try {
      await updateNoteProject(note.path, "");
      await showToast({
        style: Toast.Style.Success,
        title: "Project Cleared",
        message: note.title
      });
      onProjectUpdated();
      pop();
    } catch (error: any) {
      await showToast({ style: Toast.Style.Failure, title: "Failed to clear", message: error.message });
    }
  }

  return (
    <List
      isLoading={isLoading}
      navigationTitle={`Set Project: ${note.title}`}
      searchBarPlaceholder="Search projects or type new name..."
      onSearchTextChange={setSearchText}
      searchText={searchText}
    >
      {showCreateOption && (
        <List.Section title="Create New">
          <List.Item
            title={`Create New Project: "${searchText.trim()}"`}
            icon={Icon.Plus}
            actions={
              <ActionPanel>
                <Action
                  title="Create & Set Project"
                  icon={Icon.Plus}
                  onAction={handleCreateAndSet}
                />
              </ActionPanel>
            }
          />
        </List.Section>
      )}
      <List.Section title={`Current: ${note.project || "none"}`}>
        {note.project && (
          <List.Item
            title="Clear Project"
            icon={Icon.Trash}
            actions={
              <ActionPanel>
                <Action
                  title="Clear Project"
                  icon={Icon.Trash}
                  onAction={handleClear}
                />
              </ActionPanel>
            }
          />
        )}
      </List.Section>
      <List.Section title="Existing Projects">
        {filteredProjects.map((proj) => (
          <List.Item
            key={proj}
            title={proj}
            icon={Icon.Folder}
            accessories={proj === note.project ? [{ text: "Current" }] : []}
            actions={
              <ActionPanel>
                <Action
                  title="Set Project"
                  icon={Icon.Checkmark}
                  onAction={() => handleSelectProject(proj)}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}

function NoteItem({ note, onRefresh, onRebuild }: { note: Note; onRefresh: () => void; onRebuild: () => void }) {
  const prefs = getPreferenceValues<Prefs>();
  const accessories = [];

  // Priority (shown first if enabled)
  if (prefs.showPriority !== false && note.priority) {
    accessories.push({ text: note.priority, icon: Icon.Flag });
  }

  // Due date
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

  // Recurrence info
  if (prefs.showRecurrence !== false && note.recurrence) {
    const recurrenceIcon = note.recurrenceAnchor === "completion" ? Icon.Repeat : Icon.Calendar;
    accessories.push({ text: note.recurrence, icon: recurrenceIcon, tooltip: note.recurrenceAnchor ? `Recurs from ${note.recurrenceAnchor}` : undefined });
  }

  // Time tracking
  if (prefs.showTimeTracking && (note.timeTracked || note.timeEstimate)) {
    const timeText = note.timeTracked && note.timeEstimate
      ? `${note.timeTracked}h / ${note.timeEstimate}h`
      : note.timeTracked
        ? `${note.timeTracked}h tracked`
        : `${note.timeEstimate}h est`;
    accessories.push({ text: timeText, icon: Icon.Clock });
  }

  // Project
  if (note.project) {
    accessories.push({ text: note.project, icon: Icon.Folder });
  }

  // Status
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
          <Action.Push
            title="Set Project"
            icon={Icon.Folder}
            target={<SetProjectForm note={note} onProjectUpdated={onRefresh} />}
          />
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
          <Action
            title="Rebuild Cache"
            icon={Icon.ArrowClockwise}
            shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
            onAction={async () => {
              await showToast({ style: Toast.Style.Animated, title: "Rebuilding cache..." });
              await onRebuild();
            }}
          />
        </ActionPanel>
      }
    />
  );
}
