# Hyperdash Examples

This folder contains a complete onboarding experience to help you get started with Hyperdash, inspired by Things 3's excellent first-time user experience.

## What's Included

- **sample-vault/** - A complete, ready-to-use Obsidian vault with:
  - `.base` files for filtering todos and projects
  - Example todos and projects organized in folders
  - Everything you need to get started!

The sample vault includes friendly, interactive examples that demonstrate every feature while being immediately useful. Just like Things 3, these examples help you learn by doing!

## Quick Start

### Option 1: Try the Examples First (Recommended)

1. Download this `examples/` folder
2. Open `sample-vault/` directly in Obsidian (File → Open Vault)
3. In Raycast preferences, set:
   - Todo Base File: `path/to/sample-vault/hyperdash.base`
   - Project Base File: `path/to/sample-vault/hyperpro.base`
4. Open Hyperdash in Raycast and explore the examples!

That's it! Everything is already set up and ready to use.

### Option 2: Add to Existing Vault

1. Copy the contents of `sample-vault/` into your existing vault:
   - `hyperdash.base` and `hyperpro.base` files
   - `todos/` and `projects/` folders (optional, just examples)
2. Configure Raycast with paths to your base files
3. Explore the examples, then customize or delete them

## File Structure

```
examples/
└── sample-vault/                         # Complete Obsidian vault
    ├── .obsidian/                        # Obsidian configuration
    ├── hyperdash.base                    # Todo filter configuration
    ├── hyperpro.base                     # Project filter configuration
    ├── todos/
    │   ├── explore-hyperdash.md          # Welcome task (high priority, due tomorrow)
    │   ├── plan-weekly-review.md         # In progress, recurring weekly
    │   ├── organize-notes.md             # Next up, linked to project
    │   ├── try-creating-task.md          # Someday idea
    │   └── example-completed-task.md     # Shows "Done" view
    └── projects/
        ├── personal-organization.md      # Active project
        ├── learn-raycast-extensions.md   # Planning phase
        ├── obsidian-setup.md             # Up next
        └── ideas-backlog.md              # Someday/backlog
```

Everything you need is inside the `sample-vault/` folder - just open it in Obsidian and you're ready to go!

## Base Files Explained

### hyperdash.base (Todos)

Filters notes with the `#todo` tag and provides views:

- **Default view**: All todos except done/canceled
- **Todo view**: Only active todos (not done/canceled)
- **Done view**: Completed todos

Key features:
- Tag-based filtering (`#todo`)
- Status-based views
- Works with or without TaskNotes plugin

### hyperpro.base (Projects)

Filters notes with the `#project` tag and provides views:

- **ALL view**: All projects
- **Current view**: Active projects (planning through in-progress)

Key features:
- Tag-based filtering (`#project`)
- Status-based views
- Project lifecycle tracking

## Example Notes Explained

### Welcome & Onboarding Todos

**explore-hyperdash.md** - Your first task! Demonstrates:
- High priority with due date
- Actionable checklist to try features
- Friendly intro to the extension

**plan-weekly-review.md** - Active work. Shows:
- In-progress status
- Recurring weekly pattern
- Time tracking (30min tracked / 1hr estimate)
- Due today highlighting

**organize-notes.md** - Queued up. Demonstrates:
- Next status (after current tasks)
- Low priority
- Scheduled date (not a due date)
- Project association

**try-creating-task.md** - Future idea. Shows:
- Someday status (backlog)
- Minimal frontmatter
- Tutorial for creating tasks

**example-completed-task.md** - Done! Demonstrates:
- Completed status
- Appears in "Done" view
- Historical due date

### Example Projects

**personal-organization.md** - Active work. Shows:
- In-progress status
- Linked tasks
- Start date, no hard deadline

**learn-raycast-extensions.md** - Planning phase. Demonstrates:
- Planning status
- Multiple tags
- Learning-focused project

**obsidian-setup.md** - Up next. Shows:
- Up-next status
- Target due date
- Actionable checklist

**ideas-backlog.md** - Someday. Demonstrates:
- Someday status
- Minimal frontmatter
- Idea collection

## Customization

### Adapting to Your Workflow

1. **Change tags**: Edit `values:` in base files
2. **Add custom statuses**: Extension recognizes any status value
3. **Add custom fields**: Include any YAML frontmatter you want
4. **Multiple views**: Add more view definitions to base files

### Example Custom View

Add to a base file:

```yaml
views:
  Urgent:
    - property: priority
      operator: equals
      value: urgent
    - property: status
      operator: not_equals
      value: done
```

## The Things 3 Approach

Like Things 3's excellent onboarding, these examples:
- **Teach by doing** - Each example demonstrates a specific feature
- **Are immediately useful** - Real tasks you might actually want to do
- **Guide you forward** - Natural progression from exploration to creation
- **Are easy to clean up** - Delete them when you're ready for your own system

## Works Without TaskNotes

These examples work standalone - no TaskNotes plugin or external API required!

Just:
1. Create markdown notes with YAML frontmatter
2. Add appropriate tags (`#todo`, `#project`)
3. Use status/priority/date fields as shown

If you DO use TaskNotes or Hyperdash API:
- All features remain fully compatible
- Base files work with both systems
- Same vault structure and file format

## Testing the Examples

1. Download or copy the `examples/` folder
2. Open `sample-vault/` in Obsidian (it's already a complete vault!)
3. Update Raycast preferences (⌘,):
   - Todo Base File: `/path/to/sample-vault/hyperdash.base`
   - Project Base File: `/path/to/sample-vault/hyperpro.base`
4. Open Hyperdash in Raycast and start exploring!

No extra setup needed - the base files are already in the vault!

## Your First Steps

1. **Explore** - Open "Explore Hyperdash Features" task and try the actions
2. **Switch views** - Try "Todo" and "Done" views, "All" and "Current" projects
3. **Edit a task** - Open any task in Obsidian and modify it
4. **Mark complete** - Use the complete action on a task
5. **Delete examples** - When ready, delete these examples and create your own!

## Next Steps

- See the [main setup guide](../SETUP_GUIDE.md) for detailed configuration
- Create your own tasks and projects
- Customize the base files for your workflow
- Set up keyboard shortcuts in Raycast for quick access

## Feedback

Found these examples helpful? Let us know what worked well or what could be improved!
