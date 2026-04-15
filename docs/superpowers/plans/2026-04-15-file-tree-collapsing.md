# File Tree Collapsing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add directory collapsing functionality to the FileTreePanel with session-level persistence, batch operations, and smooth animations.

**Architecture:** Use Radix UI Collapsible for directory expansion/collapse, manage state in FileTreePanel parent component, add CSS animations for icon rotation and content slide, provide batch expand/collapse buttons at bottom.

**Tech Stack:** React, Radix UI Collapsible, Tailwind CSS v4, Lucide icons

---

## File Structure

| File | Responsibility |
|------|---------------|
| `web-ui/src/utils/file-tree.ts` | Add `getAllDirectoryPaths` helper function |
| `web-ui/src/styles/globals.css` | Add collapsible animation CSS |
| `web-ui/src/components/detail-panels/file-tree-panel.tsx` | Main component — state management, batch buttons, FileTreeRow integration |

---

### Task 1: Add Helper Function to file-tree.ts

**Files:**
- Modify: `web-ui/src/utils/file-tree.ts`

- [ ] **Step 1: Add `getAllDirectoryPaths` function**

Add the following function after `buildFileTree` function (around line 49):

```typescript
/**
 * Recursively extract all directory paths from a file tree.
 * Used for batch collapse operations.
 */
export function getAllDirectoryPaths(nodes: FileTreeNode[]): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    if (node.type === "directory") {
      paths.push(node.path);
      paths.push(...getAllDirectoryPaths(node.children));
    }
  }
  return paths;
}
```

- [ ] **Step 2: Commit**

```bash
git add web-ui/src/utils/file-tree.ts
git commit -m "feat(file-tree): add getAllDirectoryPaths helper for batch collapse"
```

---

### Task 2: Add CSS Animations to globals.css

**Files:**
- Modify: `web-ui/src/styles/globals.css`

- [ ] **Step 1: Update file tree row styles for directories**

Replace the `.kb-file-tree-row-directory` block (lines 523-526) with:

```css
.kb-file-tree-row-directory {
  color: var(--color-text-tertiary);
}

.kb-file-tree-row-directory:hover {
  background: var(--color-surface-3);
}

.kb-file-tree-row-directory:active {
  background: var(--color-surface-4);
}
```

- [ ] **Step 2: Add collapsible content animation styles**

Add after the `.kb-file-tree-row` styles section (around line 537):

```css
/* -- File tree collapsible -- */

.kb-file-tree-collapse-icon {
  transition: transform 150ms ease;
}

.kb-file-tree-collapsible-content {
  overflow: hidden;
}

.kb-file-tree-collapsible-content[data-state="open"] {
  animation: kb-file-tree-slide-down 150ms ease-out;
}

.kb-file-tree-collapsible-content[data-state="closed"] {
  animation: kb-file-tree-slide-up 150ms ease-out;
}

@keyframes kb-file-tree-slide-down {
  from { height: 0; }
  to { height: var(--radix-collapsible-content-height); }
}

@keyframes kb-file-tree-slide-up {
  from { height: var(--radix-collapsible-content-height); }
  to { height: 0; }
}
```

- [ ] **Step 3: Add batch button area styles**

Add after the collapsible styles:

```css
/* -- File tree batch operations -- */

.kb-file-tree-batch-buttons {
  display: flex;
  gap: 4px;
  padding: 4px 8px;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-1);
}
```

- [ ] **Step 4: Commit**

```bash
git add web-ui/src/styles/globals.css
git commit -m "feat(css): add file tree collapsible animations and batch button styles"
```

---

### Task 3: Add State Management to FileTreePanel

**Files:**
- Modify: `web-ui/src/components/detail-panels/file-tree-panel.tsx`

- [ ] **Step 1: Add imports**

Update imports at the top (line 1):

```typescript
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { RuntimeWorkspaceFileChange } from "@/runtime/types";
import { buildFileTree, getAllDirectoryPaths, type FileTreeNode } from "@/utils/file-tree";
```

- [ ] **Step 2: Add state and handlers in FileTreePanel**

Inside `FileTreePanel` function, add state and handlers after `diffStatsByPath` useMemo (around line 94):

```typescript
  const [collapsedPaths, setCollapsedPaths] = useState<Record<string, boolean>>({});

  // Reset collapsed state when workspaceFiles changes (diff source switch)
  useEffect(() => {
    setCollapsedPaths({});
  }, [workspaceFiles]);

  const handleToggleCollapse = useCallback((path: string) => {
    setCollapsedPaths((prev) => ({
      ...prev,
      [path]: !(prev[path] ?? false),
    }));
  }, []);

  const handleExpandAll = useCallback(() => {
    setCollapsedPaths({});
  }, []);

  const handleCollapseAll = useCallback(() => {
    const allPaths = getAllDirectoryPaths(tree);
    const newCollapsed: Record<string, boolean> = {};
    for (const path of allPaths) {
      newCollapsed[path] = true;
    }
    setCollapsedPaths(newCollapsed);
  }, [tree]);
```

- [ ] **Step 3: Add fileCountByPath calculation**

Add after `tree` useMemo (around line 85):

```typescript
  const fileCountByPath = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const path of referencedPaths) {
      const parts = path.split("/");
      let currentPath = "";
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
        counts[currentPath] = (counts[currentPath] ?? 0) + 1;
      }
    }
    return counts;
  }, [referencedPaths]);
```

- [ ] **Step 4: Calculate directory count for batch buttons**

Add after `fileCountByPath`:

```typescript
  const directoryCount = useMemo(() => {
    return getAllDirectoryPaths(tree).length;
  }, [tree]);
```

- [ ] **Step 5: Commit**

```bash
git add web-ui/src/components/detail-panels/file-tree-panel.tsx
git commit -m "feat(file-tree): add collapse state management and handlers"
```

---

### Task 4: Refactor FileTreeRow with Collapsible

**Files:**
- Modify: `web-ui/src/components/detail-panels/file-tree-panel.tsx`

- [ ] **Step 1: Update FileTreeRow props interface**

Replace the `FileTreeRow` interface (lines 17-22) with:

```typescript
function FileTreeRow({
  node,
  depth,
  selectedPath,
  onSelectPath,
  diffStatsByPath,
  collapsedPaths,
  onToggleCollapse,
  fileCountByPath,
}: {
  node: FileTreeNode;
  depth: number;
  selectedPath: string | null;
  onSelectPath: (path: string) => void;
  diffStatsByPath: Record<string, FileDiffStats>;
  collapsedPaths: Record<string, boolean>;
  onToggleCollapse: (path: string) => void;
  fileCountByPath: Record<string, number>;
}): React.ReactElement | null {
```

- [ ] **Step 2: Replace FileTreeRow body with Collapsible implementation**

Replace the entire FileTreeRow function body (lines 24-67) with:

```typescript
  const isDirectory = node.type === "directory";
  const isSelected = !isDirectory && node.path === selectedPath;
  const isCollapsed = collapsedPaths[node.path] ?? false;
  const fileStats = !isDirectory ? diffStatsByPath[node.path] : undefined;
  const fileCount = isDirectory ? fileCountByPath[node.path] ?? 0 : 0;
  const rowClassName = `kb-file-tree-row${isDirectory ? " kb-file-tree-row-directory" : ""}${isSelected ? " kb-file-tree-row-selected" : ""}`;
  const addedStatClassName = isSelected ? "text-accent-fg" : "text-status-green";
  const removedStatClassName = isSelected ? "text-accent-fg" : "text-status-red";

  if (isDirectory) {
    return (
      <Collapsible.Root open={!isCollapsed} onOpenChange={() => onToggleCollapse(node.path)}>
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className={rowClassName}
            style={{ paddingLeft: depth * 12 + 8 }}
          >
            <ChevronDown
              size={12}
              className={`kb-file-tree-collapse-icon${isCollapsed ? "" : ""}`}
              style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
            />
            <Folder size={14} />
            <span className="truncate">{node.name}</span>
            {isCollapsed && fileCount > 0 ? (
              <span className="text-text-tertiary ml-auto" style={{ fontSize: 10 }}>
                ({fileCount})
              </span>
            ) : null}
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content className="kb-file-tree-collapsible-content">
          {node.children.length > 0 ? (
            <div>
              {node.children.map((child) => (
                <FileTreeRow
                  key={child.path}
                  node={child}
                  depth={depth + 1}
                  selectedPath={selectedPath}
                  onSelectPath={onSelectPath}
                  diffStatsByPath={diffStatsByPath}
                  collapsedPaths={collapsedPaths}
                  onToggleCollapse={onToggleCollapse}
                  fileCountByPath={fileCountByPath}
                />
              ))}
            </div>
          ) : null}
        </Collapsible.Content>
      </Collapsible.Root>
    );
  }

  // File row (not directory)
  return (
    <button
      type="button"
      className={rowClassName}
      style={{ paddingLeft: depth * 12 + 8 }}
      onClick={() => onSelectPath(node.path)}
    >
      <FileText size={14} />
      <span className="truncate">{node.name}</span>
      {fileStats ? (
        <span className="font-mono" style={{ marginLeft: "auto", fontSize: 10, display: "flex", gap: 4 }}>
          {fileStats.added > 0 ? <span className={addedStatClassName}>+{fileStats.added}</span> : null}
          {fileStats.removed > 0 ? <span className={removedStatClassName}>-{fileStats.removed}</span> : null}
        </span>
      ) : null}
    </button>
  );
}
```

- [ ] **Step 3: Import FileText icon**

Ensure `FileText` is imported from `lucide-react` (should already be in imports).

- [ ] **Step 4: Commit**

```bash
git add web-ui/src/components/detail-panels/file-tree-panel.tsx
git commit -m "feat(file-tree): add Collapsible support to FileTreeRow"
```

---

### Task 5: Add Batch Operation Buttons and Update FileTreePanel Render

**Files:**
- Modify: `web-ui/src/components/detail-panels/file-tree-panel.tsx`

- [ ] **Step 1: Import Button component**

Add to imports:

```typescript
import { Button } from "@/components/ui/button";
```

- [ ] **Step 2: Update FileTreePanel render to pass new props**

Replace the tree rendering section (lines 116-126) with:

```typescript
                  {tree.map((node) => (
                    <FileTreeRow
                      key={node.path}
                      node={node}
                      depth={0}
                      selectedPath={selectedPath}
                      onSelectPath={onSelectPath}
                      diffStatsByPath={diffStatsByPath}
                      collapsedPaths={collapsedPaths}
                      onToggleCollapse={handleToggleCollapse}
                      fileCountByPath={fileCountByPath}
                    />
                  ))}
```

- [ ] **Step 3: Add batch buttons area**

Replace the entire return block of FileTreePanel (lines 96-130) with:

```typescript
  return (
    <div
      style={{
        display: "flex",
        flex: panelFlex ?? "0.6 1 0",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 0,
        background: "var(--color-surface-0)",
      }}
    >
      <div style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", padding: 8 }}>
        {tree.length === 0 ? (
          <div className="kb-empty-state-center">
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-text-tertiary">
              <FolderOpen size={40} />
            </div>
          </div>
        ) : (
          <div>
            {tree.map((node) => (
              <FileTreeRow
                key={node.path}
                node={node}
                depth={0}
                selectedPath={selectedPath}
                onSelectPath={onSelectPath}
                diffStatsByPath={diffStatsByPath}
                collapsedPaths={collapsedPaths}
                onToggleCollapse={handleToggleCollapse}
                fileCountByPath={fileCountByPath}
              />
            ))}
          </div>
        )}
      </div>
      {directoryCount > 1 && tree.length > 0 ? (
        <div className="kb-file-tree-batch-buttons">
          <Button variant="ghost" size="sm" onClick={handleExpandAll} icon={<ChevronDown size={12} />}>
            展开
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCollapseAll} icon={<ChevronRight size={12} />}>
            折叠
          </Button>
        </div>
      ) : null}
    </div>
  );
```

- [ ] **Step 4: Commit**

```bash
git add web-ui/src/components/detail-panels/file-tree-panel.tsx
git commit -m "feat(file-tree): add batch expand/collapse buttons"
```

---

### Task 6: Build and Manual Test

**Files:**
- None

- [ ] **Step 1: Run TypeScript check**

```bash
cd web-ui && npm run typecheck
```

Expected: No errors

- [ ] **Step 2: Run build**

```bash
cd web-ui && npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Manual test in browser**

1. Navigate to a task with file changes
2. Open "All Changes" panel
3. Verify:
   - Directory rows show chevron icon
   - Clicking directory toggles collapse
   - Collapsed directory shows file count
   - Icon rotates on collapse
   - Content slide animation works
   - Batch buttons appear when >1 directory
   - "展开" button expands all
   - "折叠" button collapses all
   - Switching commit resets collapse state

- [ ] **Step 4: Final commit if needed**

```bash
git add -A
git commit -m "feat(file-tree): complete collapsible directory implementation"
```

---

## Self-Review Checklist

- [x] Spec coverage: All requirements from spec have corresponding tasks
- [x] Placeholder scan: No TBD, TODO, or vague descriptions
- [x] Type consistency: Function names and signatures match across tasks
- [x] File paths: All exact file paths specified
- [x] Code completeness: All code blocks are complete, no placeholders