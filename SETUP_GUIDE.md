# Hyperdash Setup Guide

Getting started with Hyperdash in Raycast.

## What you'll need

- An Obsidian vault (just needs a `.obsidian` folder)
- Base files (`.base` format) for filtering your todos and projects
- Markdown notes with YAML frontmatter

Hyperdash works with or without the TaskNotes plugin - just use markdown notes with frontmatter!

## Getting Started

### Install the Extension

Grab it from the Raycast Store, or import from the `dist` folder if you're running from source.

### Create Your Base Files

Base files tell Hyperdash what to look for. Check out [examples/bases/](examples/bases/) for working examples.

You'll want two base files:
- One for todos (could be `hyperdash.base` like mine, or `todo.base`, or `tasks.base` - whatever feels right)
- One for projects (maybe `hyperpro.base`, or `projects.base`, you do you)

Just drop these `.base` files anywhere in your vault.

### Point Raycast at Your Files

Open Raycast preferences and set:

- **Todo Base File**: Path to whichever base file you made for todos
- **Project Base File**: Path to your projects base file
- **Todo View Name**: Which view to show (like "Todo" or "Done" - whatever's in your base file)
- **Project View Name**: Same idea for projects (like "All" or "Current")

### Add Some Notes

Your notes just need tags and frontmatter. The [examples/sample-vault/](examples/sample-vault/) folder has some to get you started:

- **Todos**: Tag them with `#todo`, add frontmatter for status, priority, dates
- **Projects**: Tag them with `#project`, add whatever frontmatter makes sense

## Example Setup

Want to try it out? Download the [examples folder](examples/) and:

1. Copy `examples/sample-vault/` into your Obsidian vault
2. Copy `examples/bases/` files into your vault
3. Update the base files to point to your vault path
4. Configure Raycast preferences to use these base files

## Base File Format

Base files use YAML with these sections:

```yaml
# Base file metadata
title: "My Todos"
vault_path: /path/to/vault  # Auto-detected from .base location

# Filters (combined with AND logic)
filters:
  - property: tags
    operator: contains_any
    values:
      - todo

# Views (optional - additional filters)
views:
  Todo:
    - property: status
      operator: not_equals
      value: done
```

## Note Frontmatter

Todos and projects use YAML frontmatter:

```yaml
---
title: Write Documentation
tags:
  - todo
status: in-progress
priority: high
date_due: 2025-01-25
---

Note content here...
```

## Supported Fields

### Status Values
- Todo: `todo`, `in-progress`, `next`, `hold/stuck`, `waiting`, `someday`, `done`, `canceled`
- Project: `planning`, `research`, `up-next`, `in-progress`, `on-hold`, `someday`, `done`, `canceled`

### Date Fields
- `date_due` - Due date
- `date_started` - Start date
- `date_scheduled` - Scheduled date

### Other Fields
- `priority` - Alphabetical sorting (e.g., `1-urgent`, `2-high`, `3-medium`, `4-low`)
- `project` - Project name (for todos)
- `recurrence` - Recurrence pattern (e.g., `every week`)
- `recurrence_anchor` - Anchor point (`due` or `completion`)
- `time_tracked` - Hours tracked (number)
- `time_estimate` - Estimated hours (number)

## Performance

- **First load**: 1-2 seconds (scans entire vault)
- **Subsequent loads**: ~20ms (instant from cache)
- **Cache refresh**: Automatic every 5 minutes
- **Manual refresh**: `Cmd+R` (refresh cache), `Cmd+Shift+R` (rebuild cache)

## Troubleshooting

### No notes showing up?

1. Check that your base files are valid YAML
2. Verify the vault path can be detected (base file must be inside vault)
3. Ensure notes have the correct tags (`#todo` or `#project`)
4. Try `Cmd+Shift+R` to rebuild the cache

### Toast notifications not showing?

This was fixed in v1.0.10. Make sure you're running the latest version.

### Performance issues?

The cache should make subsequent loads instant. If it's slow:
- Check Console logs in Raycast for cache hits/misses
- Try `Cmd+Shift+R` to rebuild cache
- Verify the 5-minute TTL isn't constantly expiring

## Need Help?

- See [examples/](examples/) for working configurations
- Check the [main README](README.md) for feature details
- Open an issue on GitHub for bugs or questions
