// import { useConversationStore } from '../store/conversationStore';
import { Icons } from './ui/Icons';
// import { ExcalidrawCanvas } from './graph/ExcalidrawCanvas';

interface GraphSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
}

export default function GraphSidebar({ isCollapsed, onToggle, onOpenSettings }: GraphSidebarProps) {
  // const { tree, currentNodeId, setCurrentNode } = useConversationStore();

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex items-start justify-center pt-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Expand graph view"
        >
          <Icons.ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onToggle}
      />

      {/* Sidebar */}
      <div className="w-80 md:w-80 fixed md:relative inset-y-0 right-0 z-50 md:z-auto bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Graph View</h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenSettings}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Settings"
            >
              <Icons.Settings className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Collapse graph view"
            >
              <Icons.ChevronRight className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Graph */}
        <div className="flex-1">
          {/* {tree && (
            <ExcalidrawCanvas
              tree={tree}
              currentNodeId={currentNodeId}
              onNodeSelect={setCurrentNode}
            />
          )} */}
        </div>
      </div>
    </>
  );
}
