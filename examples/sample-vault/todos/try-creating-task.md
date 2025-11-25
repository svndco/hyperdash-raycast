---
title: Try Creating Your Own Task
tags:
  - todo
status: someday
---

# Try Creating Your Own Task

When you're ready, create your first task by making a new markdown file in your vault!

## How to Create Tasks
1. Create a new `.md` file anywhere in your Obsidian vault
2. Add YAML frontmatter at the top (the stuff between `---` lines)
3. Include the `#todo` tag in the tags array
4. Add any fields you want: status, priority, dates, etc.
5. Save the file
6. Refresh Hyperdash in Raycast to see it appear!

## Minimal Example
```yaml
---
title: My First Task
tags:
  - todo
status: todo
---

Task description goes here...
```

## This Task Shows
- **Someday status** - ideas for the future
- **Minimal frontmatter** - you only need title and tags to get started
- **No dates** - tasks don't need due dates if you don't want them

Once you've created your own task, feel free to delete all these example tasks!
