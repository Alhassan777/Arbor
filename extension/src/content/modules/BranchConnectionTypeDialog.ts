/**
 * BranchConnectionTypeDialog - Dialog for selecting connection type when creating a branch
 */

import type { ConnectionType } from "../../types";

export interface ConnectionTypeOption {
  type: ConnectionType;
  description: string;
  emoji: string;
}

const CONNECTION_TYPES: ConnectionTypeOption[] = [
  {
    type: "extends",
    description: "Let's extend this discussion to related areas.",
    emoji: "🔗",
  },
  {
    type: "deepens",
    description: "Let's explore this topic in more depth.",
    emoji: "🔍",
  },
  {
    type: "explores",
    description: "Let's explore a related aspect of this.",
    emoji: "🧭",
  },
  {
    type: "examples",
    description: "Let's look at specific examples of this.",
    emoji: "💡",
  },
  {
    type: "applies",
    description: "Let's discuss how to apply this in practice.",
    emoji: "⚙️",
  },
  {
    type: "questions",
    description: "I have some questions about this.",
    emoji: "❓",
  },
  {
    type: "contrasts",
    description: "Let's consider an alternative perspective on this.",
    emoji: "🔄",
  },
  {
    type: "summarizes",
    description: "Let's summarize and consolidate what we've discussed.",
    emoji: "📋",
  },
];

export class BranchConnectionTypeDialog {
  /**
   * Show dialog and return selected connection type
   * Returns the connection type if user selects one, or null if cancelled
   */
  static show(
    defaultType: ConnectionType = "extends"
  ): Promise<ConnectionType | null> {
    return new Promise((resolve) => {
      // Remove existing dialog if any
      document.getElementById("arbor-branch-type-dialog")?.remove();

      const modal = document.createElement("div");
      modal.id = "arbor-branch-type-dialog";

      const selectedType = { value: defaultType };

      modal.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          z-index: 99999999;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            background: #1a1a1a;
            border: 1px solid #2a3530;
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            max-height: 85vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 8px 24px rgba(0,0,0,0.6);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h2 style="color: #e8efe9; margin: 0; font-size: 18px; font-weight: 600;">🌿 Create Branch</h2>
              <button id="close-branch-dialog" style="
                background: none;
                border: none;
                color: #9caba3;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s;
              " onmouseover="this.style.background='#2a3530'" onmouseout="this.style.background='transparent'">×</button>
            </div>

            <p style="color: #9caba3; margin-bottom: 20px; font-size: 13px; line-height: 1.5;">
              Choose how this branch relates to the current conversation:
            </p>

            <div style="
              flex: 1;
              overflow-y: auto;
              margin: 0 -24px;
              padding: 0 24px;
            ">
              ${CONNECTION_TYPES.map(
                (option, index) => `
                <div class="connection-type-option" data-type="${option.type}" style="
                  background: ${option.type === defaultType ? "#1c2420" : "#131917"};
                  border: 1px solid ${option.type === defaultType ? "#2dd4a7" : "#2a3530"};
                  border-radius: 8px;
                  padding: 14px 16px;
                  margin-bottom: ${index < CONNECTION_TYPES.length - 1 ? "10px" : "0"};
                  cursor: pointer;
                  transition: all 0.2s ease;
                  ${option.type === defaultType ? "box-shadow: 0 0 0 2px rgba(45, 212, 167, 0.2);" : ""}
                ">
                  <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <span style="font-size: 20px; flex-shrink: 0;">${option.emoji}</span>
                    <div style="flex: 1;">
                      <div style="color: #e8efe9; font-size: 13px; font-weight: 600; margin-bottom: 4px; text-transform: capitalize;">
                        ${option.type}
                      </div>
                      <div style="color: #9caba3; font-size: 12px; line-height: 1.4;">
                        ${option.description}
                      </div>
                    </div>
                    ${option.type === defaultType ? '<span style="color: #2dd4a7; font-size: 16px; flex-shrink: 0;">✓</span>' : ""}
                  </div>
                </div>
              `
              ).join("")}
            </div>

            <div style="
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #2a3530;
              display: flex;
              gap: 10px;
            ">
              <button id="cancel-branch-dialog" style="
                flex: 1;
                padding: 10px 16px;
                background: #1c2420;
                color: #9caba3;
                border: 1px solid #2a3530;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                transition: all 0.2s ease;
              " onmouseover="this.style.background='#22291f'; this.style.borderColor='#4a5854'" onmouseout="this.style.background='#1c2420'; this.style.borderColor='#2a3530'">
                Cancel
              </button>
              <button id="confirm-branch-dialog" style="
                flex: 1;
                padding: 10px 16px;
                background: linear-gradient(135deg, #2dd4a7 0%, #1eb88a 100%);
                color: #0c0f0e;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(45, 212, 167, 0.2);
              " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(45, 212, 167, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(45, 212, 167, 0.2)'">
                Create Branch
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Handle option selection
      modal.querySelectorAll(".connection-type-option").forEach((option) => {
        option.addEventListener("click", () => {
          const type = (option as HTMLElement).dataset.type as ConnectionType;
          selectedType.value = type;

          // Update visual selection
          modal.querySelectorAll(".connection-type-option").forEach((opt) => {
            const optEl = opt as HTMLElement;
            const optType = optEl.dataset.type as ConnectionType;
            if (optType === type) {
              optEl.style.background = "#1c2420";
              optEl.style.borderColor = "#2dd4a7";
              optEl.style.boxShadow = "0 0 0 2px rgba(45, 212, 167, 0.2)";
              // Add checkmark if not present
              if (!optEl.querySelector('span[style*="color: #2dd4a7"]')) {
                const checkmark = document.createElement("span");
                checkmark.style.cssText = "color: #2dd4a7; font-size: 16px; flex-shrink: 0;";
                checkmark.textContent = "✓";
                optEl.querySelector("div[style*='display: flex']")?.appendChild(checkmark);
              }
            } else {
              optEl.style.background = "#131917";
              optEl.style.borderColor = "#2a3530";
              optEl.style.boxShadow = "";
              // Remove checkmark
              optEl.querySelector('span[style*="color: #2dd4a7"]')?.remove();
            }
          });
        });

        // Hover effects
        option.addEventListener("mouseenter", () => {
          const type = (option as HTMLElement).dataset.type as ConnectionType;
          if (type !== selectedType.value) {
            (option as HTMLElement).style.background = "#1c2420";
            (option as HTMLElement).style.borderColor = "#4a5854";
          }
        });
        option.addEventListener("mouseleave", () => {
          const type = (option as HTMLElement).dataset.type as ConnectionType;
          if (type !== selectedType.value) {
            (option as HTMLElement).style.background = "#131917";
            (option as HTMLElement).style.borderColor = "#2a3530";
          }
        });
      });

      // Handle confirm button
      modal.querySelector("#confirm-branch-dialog")?.addEventListener("click", () => {
        modal.remove();
        resolve(selectedType.value);
      });

      // Handle cancel button and close button
      const closeDialog = () => {
        modal.remove();
        resolve(null);
      };

      modal.querySelector("#cancel-branch-dialog")?.addEventListener("click", closeDialog);
      modal.querySelector("#close-branch-dialog")?.addEventListener("click", closeDialog);

      // Close on outside click
      modal.querySelector("div[style*='position: fixed']")?.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) {
          closeDialog();
        }
      });
    });
  }
}
