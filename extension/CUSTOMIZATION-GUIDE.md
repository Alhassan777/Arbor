# Arbor Extension - Customization Features

## New Features Implemented

### 1. **Floating Toggle Buttons**
- When sidebars are hidden, floating buttons appear to show them again
- Left toggle: Shows tree sidebar
- Right toggle: Shows graph sidebar

### 2. **Drag & Drop Nodes**
- Click and drag any node on the graph canvas
- Positions are automatically saved
- Custom positions persist across sessions
- Reset to auto-layout with right-click menu

### 3. **Node Customization**
- Right-click any node to open customization menu
- Change color (color picker)
- Change shape (rectangle, circle, rounded, diamond)
- Edit connection label to parent
- All changes saved automatically

### 4. **Connection Customization**
- Click on connections to edit them
- Add/edit labels
- Change connection style (solid, dashed, dotted, curved)
- Change connection color
- Custom connection types

### 5. **Persistent Customizations**
- All customizations saved to IndexedDB
- Survives browser restarts
- Per-tree customization
- Export/import trees with customizations

---

## Usage Guide

### Toggle Sidebars

**To Hide:**
- Click "Hide" button on sidebar header

**To Show:**
- Click floating button that appears:
  - 🌳 button (bottom-left) → Shows tree sidebar
  - 📊 button (bottom-right) → Shows graph sidebar

---

### Customize Nodes

**Method 1: Right-Click Menu**
1. Right-click any node on graph
2. Choose option:
   - 🎨 Change Color
   - 🔷 Change Shape
   - 🏷️ Edit Connection Label
   - 📍 Reset Position
   - ❌ Delete Node

**Method 2: Drag Position**
1. Click and hold on node
2. Drag to desired position
3. Release to save

---

### Customize Connections

**Click on Connection Line:**
1. Click the line between nodes
2. Edit popup appears:
   - Label text input
   - Style dropdown (solid/dashed/dotted/curved)
   - Color picker
   - Connection type selector

---

## Keyboard Shortcuts

- `R` - Reset selected node to auto-layout
- `C` - Open color picker for selected node
- `L` - Edit connection label
- `Delete` - Delete selected node
- `Esc` - Close customization menu

---

## Data Structure

### Node Customization
```typescript
{
  customPosition: { x: 100, y: 200 },  // Saved position
  color: "#4a9eff",                     // Hex color
  shape: "rounded"                      // rectangle | circle | rounded | diamond
}
```

### Connection Customization
```typescript
{
  label: "Explores this topic",
  style: "dashed",                      // solid | dashed | dotted | curved
  color: "#10b981",
  type: "explores"
}
```

---

## Default Values

- **Node Color**: `#4a9eff` (blue)
- **Node Shape**: `rounded`
- **Connection Style**: `solid`
- **Connection Color**: `#4a9eff`

---

## Tips

1. **Organizing Complex Trees**
   - Use different colors for different topics
   - Use shapes to indicate node types (root = circle, branches = rectangles)
   - Position important nodes prominently

2. **Visual Hierarchy**
   - Larger/brighter nodes for main topics
   - Subdued colors for supporting conversations
   - Curved connections for related topics

3. **Connection Labels**
   - Keep labels short (2-3 words)
   - Use action verbs ("Explores", "Compares", "Applies")
   - Consistent labeling improves clarity

4. **Resetting**
   - Right-click node → "Reset Position" to go back to auto-layout
   - Delete and re-add node to clear all customizations

---

## Implementation Status

✅ Types updated
✅ Toggle buttons for sidebars
🚧 Drag-and-drop nodes (in progress)
🚧 Node customization UI
🚧 Connection customization
🚧 Persistence layer
🚧 Testing

---

## Coming Next

- Export tree as image (PNG/SVG)
- Themes (dark/light/custom)
- Node icons
- Minimap for large trees
- Zoom controls
- Search and filter
