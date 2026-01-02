# Implementation Plan - Customization Features

## Phase 1: Toggle Buttons (NEXT)
**Goal:** Show/hide sidebars with floating buttons

**Changes needed:**
1. Add CSS for floating toggle buttons
2. Add toggle button injection when sidebar hidden
3. Update toggle logic to show buttons
4. Save sidebar state to IndexedDB

**Files to modify:**
- `src/content/content-production.ts`

**Estimated time:** 30 minutes
**Test:** Hide sidebar → See floating button → Click → Sidebar appears

---

## Phase 2: Drag & Drop Nodes (AFTER Phase 1)
**Goal:** Drag nodes on canvas and save positions

**Changes needed:**
1. Add mousedown/mousemove/mouseup handlers to graph nodes
2. Update node positions in state during drag
3. Save `customPosition` to IndexedDB
4. Use custom position if available, else auto-layout

**Files to modify:**
- `src/content/content-production.ts` (renderGraphNodes)
- `src/types/index.ts` (already done ✅)

**Test:** Drag node → Refresh page → Position persists

---

## Phase 3: Node Customization (AFTER Phase 2)
**Goal:** Right-click menu to customize nodes

**Changes needed:**
1. Add context menu on right-click
2. Show color picker, shape selector
3. Update node visual based on customization
4. Save to IndexedDB

**Files to modify:**
- `src/content/content-production.ts`

**Test:** Right-click node → Change color → See updated color

---

## Phase 4: Connection Customization (AFTER Phase 3)
**Goal:** Click connections to customize

**Changes needed:**
1. Make connection lines clickable
2. Show edit modal for connections
3. Render different line styles
4. Save connection customizations

**Files to modify:**
- `src/content/content-production.ts`
- `src/types/index.ts` (already done ✅)

**Test:** Click connection → Edit label → See label on line

---

## Current Status

✅ **Types updated** - Added customPosition, color, shape, Connection interface
✅ **Documentation** - Created CUSTOMIZATION-GUIDE.md
🔄 **Phase 1** - In progress (toggle buttons)
⏸️ **Phase 2** - Waiting
⏸️ **Phase 3** - Waiting
⏸️ **Phase 4** - Waiting

---

## Quick Win Approach

Since this is a large update, I recommend:

1. **Implement Phase 1 now** (toggle buttons) - commit and test
2. **User tests** - make sure it works
3. **Implement Phase 2** (drag-drop) - commit and test
4. **User tests** - verify
5. **Implement Phases 3 & 4** - commit and test

This way you can use partial features while I build the rest!

---

## Alternative: All-at-Once

If you prefer, I can implement ALL features in one go, but it will be:
- Larger code change
- More risk of bugs
- Harder to test incrementally

**Your choice! What do you prefer?**
