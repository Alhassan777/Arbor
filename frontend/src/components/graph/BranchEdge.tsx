import { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

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
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g>
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

      {/* Main edge path */}
      <path
        id={id}
        style={{
          ...style,
          stroke: selected ? '#2dd4a7' : 'rgba(74, 88, 84, 0.4)',
          strokeWidth: selected ? 2.5 : 2,
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
  );
}

export default memo(BranchEdge);
