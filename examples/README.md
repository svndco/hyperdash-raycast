# Hyperdash Examples

This folder contains example configurations and sample notes to help you get started with Hyperdash.

## What's Included

- **bases/** - Example `.base` files for filtering todos and projects
- **sample-vault/** - Minimal Obsidian vault with sample notes

## Quick Setup

### Option 1: Use as Template

1. Copy `sample-vault/` into your existing Obsidian vault
2. Copy `bases/` files into your vault (anywhere is fine)
3. Edit the base files to match your vault structure
4. Configure Raycast with paths to your base files

### Option 2: Download as ZIP

1. Download this examples folder as a ZIP
2. Extract into your Obsidian vault
3. Follow "Option 1" steps above

## File Structure

```
examples/
├── bases/
│   ├── hyperdash.base          # Todo filter configuration
│   └── hyperpro.base           # Project filter configuration
└── sample-vault/
    ├── .obsidian/              # Required for vault detection
    ├── todos/
    │   ├── write-docs.md       # High priority, overdue
    │   ├── review-pr.md        # In progress
    │   └── setup-ci.md         # Waiting status
    └── projects/
        ├── website-redesign.md # In progress, recurring tasks
        ├── api-v2.md           # Planning phase
        └── mobile-app.md       # Someday project
```

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

## Sample Notes Explained

### Todo Examples

**write-docs.md** - Demonstrates:
- High priority task
- Overdue date (shows in red)
- Project association
- Time tracking

**review-pr.md** - Demonstrates:
- In-progress status
- Today's due date (shows in green)
- Recurrence pattern (weekly)

**setup-ci.md** - Demonstrates:
- Waiting status
- Future scheduled date
- Minimal frontmatter

### Project Examples

**website-redesign.md** - Demonstrates:
- In-progress project
- Due date tracking
- Full metadata set

**api-v2.md** - Demonstrates:
- Planning phase
- Start and due dates
- Research status

**mobile-app.md** - Demonstrates:
- Someday/backlog project
- Minimal configuration
- Future planning

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

## Works Without TaskNotes

These examples work standalone - no TaskNotes plugin required!

Just:
1. Create markdown notes with YAML frontmatter
2. Add appropriate tags (`#todo`, `#project`)
3. Use status/priority/date fields as shown

If you DO use TaskNotes:
- All features remain compatible
- Base files work with both systems
- Share the same vault structure

## Testing the Examples

1. Copy `sample-vault/.obsidian/` to make it a valid Obsidian vault
2. Open `sample-vault/` in Obsidian
3. Place the base files inside `sample-vault/`
4. Update base file paths in Raycast preferences:
   - Todo Base File: `/path/to/sample-vault/hyperdash.base`
   - Project Base File: `/path/to/sample-vault/hyperpro.base`
5. Open Hyperdash in Raycast - you should see all sample todos and projects

## Need More Help?

See the [main setup guide](../SETUP_GUIDE.md) for detailed configuration instructions.
