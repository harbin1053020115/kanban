# File Tree Collapsing Feature Design

**Date:** 2026-04-15
**Status:** Draft
**Scope:** Add collapsing functionality to the file tree in the "All Changes" panel

---

## Overview

Add directory collapsing capability to the file tree panel (`FileTreePanel`) used in the "All Changes" view. Users can collapse directories to reduce visual noise, quickly locate specific files, and save screen space.

---

## Requirements Summary

| Requirement | Decision |
|------------|----------|
| Primary purpose | Reduce visual noise, quick navigation, save space |
| Persistence | Session-level (reset when diff source changes) |
| Default state | All directories expanded |
| Trigger method | Click on directory row |
| Animation | CSS transition + icon rotation (150-200ms) |
| Batch operations | "Expand All" and "Collapse All" buttons at bottom |
| Collapsed display | Show file count: `src (12)` |

---

## Architecture

### Component Hierarchy

```
FileTreePanel (container)
    ├── Batch operation buttons (new)
    │   ├── "Expand All" button
    │   └── "Collapse All" button
    │
    └── FileTreeRow (modified)
        ├── Collapsible.Root (Radix)
        ├── Directory row button (clickable for toggle)
        │   ├── Collapse icon (animated rotation)
        │   ├── Directory name
        │   └── File count (shown when collapsed)
        │
        └── Collapsible.Content
            └── Recursive FileTreeRow children
```

### State Management

- `collapsedPaths: Record<string, boolean>` — stored in `FileTreePanel`
- Key: directory path, Value: whether collapsed
- Reset to empty object when `workspaceFiles` changes (diff source switch)

### Data Flow

```
User clicks directory → FileTreeRow calls onToggleCollapse(path)
                     → FileTreePanel updates collapsedPaths state
                     → React re-renders, Collapsible responds
                     → CSS transition executes animation
```

---

## Component Details

### FileTreePanel Modifications

**New state:**
- `collapsedPaths: Record<string, boolean>` — default `{}`

**New handlers:**
- `handleToggleCollapse(path: string)` — toggle single directory
- `handleExpandAll()` — set `collapsedPaths = {}`
- `handleCollapseAll()` — set all directory paths to collapsed

**New computed data:**
- `fileCountByPath: Record<string, number>` — file count per directory
- Computed from `referencedPaths` by accumulating parent directories

**New UI:**
- Batch operation button area at bottom (fixed position)
- Show only when directory count > 1

**Reset trigger:**
- Reset `collapsedPaths` when `workspaceFiles` prop changes

---

### FileTreeRow Modifications

**Current behavior:**
- Directory rows are display-only (no click action)
- File rows are clickable for selection

**New behavior:**
- Directory rows clickable for collapse toggle
- Use `@radix-ui/react-collapsible` for animation support
- Collapse icon rotates on state change
- Show file count when collapsed

**New props:**
- `collapsedPaths: Record<string, boolean>`
- `onToggleCollapse: (path: string) => void`
- `fileCountByPath: Record<string, number>`

---

## Animation Details

### Icon Rotation

```css
.kb-file-tree-collapse-icon {
  transition: transform 150ms ease;
}
.kb-file-tree-collapse-icon[data-state="closed"] {
  transform: rotate(-90deg);
}
```

Use `ChevronDown` icon:
- Open: pointing down
- Closed: pointing right (rotated -90°)

---

### Content Slide Animation

```css
.kb-file-tree-collapsible-content {
  overflow: hidden;
}
.kb-file-tree-collapsible-content[data-state="open"] {
  animation: slideDown 150ms ease-out;
}
.kb-file-tree-collapsible-content[data-state="closed"] {
  animation: slideUp 150ms ease-out;
}

@keyframes slideDown {
  from { height: 0; }
  to { height: var(--radix-collapsible-content-height); }
}
@keyframes slideUp {
  from { height: var(--radix-collapsible-content-height); }
  to { height: 0; }
}
```

Radix provides `--radix-collapsible-content-height` CSS variable automatically.

---

### Click Feedback

- `hover:bg-surface-3` — hover state
- `active:bg-surface-4` — pressed state
- `cursor: pointer` — indicate clickable

---

## Batch Operations

### Layout

```
┌─────────────────────────┐
│  File tree content      │
│  (overflow-y: auto)     │
│                         │
├─────────────────────────┤  ← separator
│  [展开]    [折叠]        │  ← button area (fixed)
└─────────────────────────┘
```

### Button Styling

Use existing `Button` component:
- `variant="ghost"`
- `size="sm"`
- Icons: `ChevronDown` (expand), `ChevronRight` (collapse)

### Visibility Logic

- Show button area only when directory count > 1
- Hide when tree is empty (empty state already displayed)

---

## Helper Functions

### File Count Calculation

```typescript
const fileCountByPath = useMemo(() => {
  const counts: Record<string, number> = {};

  for (const path of referencedPaths) {
    const parts = path.split('/');
    let currentPath = '';
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
      counts[currentPath] = (counts[currentPath] ?? 0) + 1;
    }
  }

  return counts;
}, [referencedPaths]);
```

### Get All Directory Paths

```typescript
function getAllDirectoryPaths(nodes: FileTreeNode[]): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    if (node.type === 'directory') {
      paths.push(node.path);
      paths.push(...getAllDirectoryPaths(node.children));
    }
  }
  return paths;
}
```

Used by `handleCollapseAll()` to set all directories collapsed.

---

## Edge Cases

### Empty Directories

- Directories with no files (only subdirectories) show count `0` or omit count
- Still collapsible/expandable

### Deep Nesting

- Ensure `depth` calculation correct for indentation
- Animation must work smoothly at any depth level

### Selected File with Collapsed Parent

- Do not auto-expand parent directories
- Selected file highlight hidden while parent collapsed
- Highlight appears correctly when user expands parent

### Batch Operation Boundaries

- "Expand All": `collapsedPaths = {}`
- "Collapse All": all directory paths set to `true`
- Hide buttons when directory count ≤ 1

---

## Test Scenarios

### Basic Operations

1. Click directory → collapses, icon rotates, children hidden
2. Click again → expands, icon rotates back, children shown

### Batch Operations

1. Click "Collapse All" → all directories collapsed
2. Click "Expand All" → all directories expanded

### State Persistence

1. Collapse directory, select different file → state persists
2. Collapse directory, switch commit/diff source → state resets (all expanded)

### Edge Scenarios

1. Single directory → no batch buttons shown
2. Empty file tree → empty state displayed, no buttons
3. Deep nesting → animation works correctly

### Animation

1. Icon rotation smooth (150ms)
2. Content slide animation smooth, no jitter

---

## Implementation Notes

### Dependencies

- `@radix-ui/react-collapsible` — already available in project
- No new external dependencies needed

### Files to Modify

1. `web-ui/src/components/detail-panels/file-tree-panel.tsx` — main changes
2. `web-ui/src/styles/globals.css` — add animation keyframes (if not existing)

### CSS Token Usage

Use existing design tokens:
- `surface-3` for hover
- `surface-4` for pressed
- `text-secondary` for file count text

---

## References

- Existing file tree implementation: `web-ui/src/components/detail-panels/file-tree-panel.tsx`
- Tree builder utility: `web-ui/src/utils/file-tree.ts`
- Radix UI Collapsible: https://www.radix-ui.com/primitives/docs/components/collapsible