import { memo, useState } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { Plus, Edit2 } from 'lucide-react';
import type { ConnectionLabel } from '../../types';

interface BranchEdgeData {
  label?: ConnectionLabel;
  onLabelClick?: (edgeId: string) => void;
}

function BranchEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps<BranchEdgeData>) {
  const [isHovered, setIsHovered] = useState(false);
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const hasLabel = !!data?.label;
  const labelText = data?.label?.text || '';

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background glow for selected edge */}
        {selected && (
          <path
            className="react-flow__edge-path"
            d={edgePath}
            style={{
              stroke: 'rgba(45, 212, 167, 0.3)',
              strokeWidth: 6,
              fill: 'none',
              filter: 'blur(4px)',
            }}
          />
        )}

        {/* Invisible thick path for easier hovering/clicking */}
        <path
          d={edgePath}
          style={{
            stroke: 'transparent',
            strokeWidth: 20,
            fill: 'none',
            cursor: 'pointer',
          }}
          className="react-flow__edge-path"
        />

        {/* Main edge path */}
        <path
          id={id}
          style={{
            ...style,
            stroke: selected 
              ? '#2dd4a7' 
              : isHovered 
                ? 'rgba(94, 234, 212, 0.6)' 
                : hasLabel
                  ? 'rgba(94, 234, 212, 0.4)'
                  : 'rgba(74, 88, 84, 0.4)',
            strokeWidth: selected ? 2.5 : isHovered ? 2.5 : 2,
            strokeLinecap: 'round',
          }}
          className="react-flow__edge-path transition-all duration-300"
          d={edgePath}
          markerEnd={markerEnd}
        />

        {/* Animated flow indicator for selected edge */}
        {selected && (
          <circle r="3" fill="#2dd4a7" className="opacity-80">
            <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
          </circle>
        )}
      </g>

      {/* Edge Label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {hasLabel ? (
            <button
              onClick={() => data?.onLabelClick?.(id)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={[
                'group px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 shadow-sm',
                'bg-gradient-to-br from-canopy/20 to-canopy/10 border border-canopy/40',
                'hover:from-canopy/30 hover:to-canopy/20 hover:border-canopy/60 hover:shadow-glow-canopy',
                'text-canopy hover:scale-105 active:scale-95',
              ].join(' ')}
            >
              <div className="flex items-center gap-1.5">
                <span>{labelText}</span>
                <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ) : (
            (isHovered || selected) && (
              <button
                onClick={() => data?.onLabelClick?.(id)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={[
                  'px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200',
                  'bg-undergrowth/90 border border-branch/80 backdrop-blur-sm',
                  'hover:bg-canopy/20 hover:border-canopy/60',
                  'text-lichen hover:text-canopy hover:scale-105 active:scale-95',
                  'animate-fade-in',
                ].join(' ')}
              >
                <div className="flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  <span>Label</span>
                </div>
              </button>
            )
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(BranchEdge);
