# hyperDASH: Projects & Task Notes

<div align="center">
  <img src="icon.png" width="128" height="128" alt="hyperDASH Icon">

  **A Raycast extension for managing Obsidian Projects and Tasks**

  ![Version](https://img.shields.io/badge/version-1.0.11-green)
  ![License](https://img.shields.io/badge/license-MIT-blue)
  ![TaskNotes](https://img.shields.io/badge/TaskNotes-4.0.1-orange)
</div>

---

Your all-in-one Obsidian task and project manager, right in Raycast. Browse, filter, and organize everything from your vault without leaving your keyboard.

**Works standalone or plays nice with TaskNotes and Bases** - it's just markdown notes with YAML frontmatter, so use what you want!

![Hyperdash Screenshot](metadata/hyperdash-1.png)

## Quick Start

New to Hyperdash? Check out the **[Setup Guide](SETUP_GUIDE.md)** to get rolling.

Want to see it in action first? Grab the **[examples folder](examples/)** with sample base files and notes.

## What You Get

- **Smart filtering** via Obsidian Bases files (or roll your own)
- **Full TaskNotes 4.0.1 compatibility** if you're using it:
  - Recurrence patterns (`recurrence` and `recurrence_anchor`)
  - Alphabetical priority sorting (`1-urgent`, `2-high`, `3-medium`, `4-low`)
  - Time tracking (`time_tracked` and `time_estimate`)
- **Intelligent sorting**: Priority → Due Date → Modified Time
- **Fast performance**: Handles large vaults (30K+ files) with configurable limits
- **Your way**: Show or hide recurrence, priority, and time tracking

## Setup

### What to Configure

Point Hyperdash at your base files:

1. **Todo Base File**: Your `.base` file for todos (vault gets auto-detected)
2. **Todo View Name**: Which view to show (like 'Todo' or 'Done')
3. **Project Base File**: Your `.base` file for projects
4. **Project View Name**: Which view to show (like 'All' or 'Current')

### Display Options

Toggle what you see:
- **Recurrence info**: Show when tasks repeat (on by default)
- **Priority**: Show task priority (on by default)
- **Time tracking**: Show tracked time and estimates (off by default)

### Performance Tuning

- **Maximum Results**: Cap displayed tasks at 500 (default) or whatever works for your vault
  - Got 30K+ tasks? Dial this down to 200-300
  - Smaller vault? Crank it up

## TaskNotes 4.0.1 Compatibility

### Priority Naming

TaskNotes sorts priorities alphabetically, so use numbers to keep them in order:

- `1-urgent` or `1-high`
- `2-high` or `2-important`
- `3-medium` or `3-normal`
- `4-low` or `4-someday`

Numbers first = proper sorting. Simple.

### Recurrence

Set tasks to repeat:
- **`recurrence`**: Pattern like "weekly", "monthly", "every 2 weeks"
- **`recurrence_anchor`**: When to recur from
  - `"completion"`: Next occurrence from when you finish it
  - Leave blank: Next occurrence from original due date

Example frontmatter:
```yaml
---
tags: [todo]
status: todo
date_due: 2025-11-20
recurrence: weekly
recurrence_anchor: completion
priority: 1-urgent
time_estimate: 2
---
```

### Time Tracking

Track your hours:
- **`time_tracked`**: Hours you've spent
- **`time_estimate`**: Hours you think it'll take

Shows as `2h tracked` or `2h / 4h` (tracked/estimate)

## Supported Fields

### Task Fields
- `status`: todo, in-progress, next, hold/stuck, waiting, someday, done, canceled
- `date_due`, `dateDue`, `due_date`, `due`: Due date (YYYY-MM-DD)
- `date_started`, `dateStarted`, `start_date`, `started`: Start date
- `date_scheduled`, `dateScheduled`, `scheduled`: Scheduled date
- `project`, `Project`: Associated project
- `priority`, `Priority`: Task priority (use alphabetical names)
- `recurrence`: Recurrence pattern
- `recurrence_anchor`, `recurrenceAnchor`: Recurrence anchor point
- `time_tracked`, `timeTracked`: Hours tracked
- `time_estimate`, `timeEstimate`: Hours estimated

## Commands

### Task Notes
All your todos, grouped by status:
- In Progress
- Up Next
- Todo
- Hold/Stuck
- Waiting
- Someday

### Project Notes
All your projects in one place

## If Things Are Slow

Got a massive vault?
1. Drop "Maximum Results" to 200-300
2. Point at a specific folder instead of your whole vault
3. Turn off time tracking display if you don't use it

## Upgrading from Earlier Versions

Coming from pre-4.0.1?

1. **Priorities**: Add numbers - `high` becomes `1-high`
2. **Recurrence**: Add `recurrence_anchor` if you want tasks to recur from completion
3. **Performance**: Lower max results if things feel sluggish

## Installation

### From Raycast Store (Coming Soon)

Search for "hyperDASH" in the Raycast Store and hit Install.

### From Source

1. Clone this repo
2. `npm install`
3. `npm run build`
4. Raycast → Extensions → '+' → Add Script Directory
5. Point it at the `hyperdash-raycast` folder

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/svndco/hyperdash-raycast/issues)
- **Documentation**: See this README and the [TaskNotes 4.0.1 documentation](https://github.com/terrychenzw/obsidian-task-note)

## Acknowledgments

- Built for [Obsidian](https://obsidian.md/)
- Compatible with [TaskNotes plugin](https://github.com/terrychenzw/obsidian-task-note) v4.0.1
- Works with [Obsidian Bases plugin](https://github.com/mProjectsCode/obsidian-bases-plugin)
- Powered by [Raycast](https://raycast.com/)

