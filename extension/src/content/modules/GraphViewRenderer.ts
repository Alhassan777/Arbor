/**
 * GraphViewRenderer - Handles graph view HTML generation
 */

export class GraphViewRenderer {
  static render(): string {
    return `
      <div style="padding: 20px; border-bottom: 1px solid #2a3530; background: #131917; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #e8efe9;">📊 Tree Visualization</h3>
          <div style="display: flex; gap: 4px; align-items: center;">
            <button id="zoom-out-btn" style="
              padding: 4px 8px;
              background: #1c2420;
              color: #9caba3;
              border: 1px solid #2a3530;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
              transition: all 0.2s ease;
            ">−</button>
            <span id="zoom-level" style="
              font-size: 11px;
              color: #6a7570;
              min-width: 45px;
              text-align: center;
            ">100%</span>
            <button id="zoom-in-btn" style="
              padding: 4px 8px;
              background: #1c2420;
              color: #9caba3;
              border: 1px solid #2a3530;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
              transition: all 0.2s ease;
            ">+</button>
            <button id="zoom-reset-btn" style="
              padding: 4px 8px;
              background: #1c2420;
              color: #9caba3;
              border: 1px solid #2a3530;
              border-radius: 4px;
              cursor: pointer;
              font-size: 10px;
              font-weight: 600;
              transition: all 0.2s ease;
            ">Reset</button>
          </div>
        </div>
        <button id="close-graph-btn" style="
          padding: 6px 12px;
          background: #1c2420;
          color: #9caba3;
          border: 1px solid #2a3530;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.2s ease;
        ">✕ Close</button>
      </div>
      <div style="
        position: absolute;
        bottom: 20px;
        right: 20px;
        background: rgba(28, 36, 32, 0.9);
        border: 1px solid #2a3530;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 11px;
        color: #6a7570;
        z-index: 100;
        pointer-events: none;
      ">
        💡 <strong>Tip:</strong> Space + Scroll to zoom, Space + Drag to pan
      </div>
      <div id="graph-canvas" style="width: 100%; height: calc(100% - 65px); position: relative; overflow: auto; background: #0f1311; cursor: default;">
        <div id="graph-content" style="position: relative; width: 2000px; height: 2000px;"></div>
      </div>
    `;
  }
}
