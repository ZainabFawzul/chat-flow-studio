/**
 * @file ResponseEdge.tsx
 * @description Custom edge component for React Flow that displays bezier curves
 *              with response option labels between connected message nodes
 * 
 * @dependencies @xyflow/react
 * @usage Registered as custom edge type in FlowCanvas
 */

import { memo } from "react";
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "@xyflow/react";

interface ResponseEdgeData {
  label?: string;
}

function ResponseEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as ResponseEdgeData | undefined;
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
          strokeWidth: selected ? 3 : 2.5,
        }}
      />
      {edgeData?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            className="px-2 py-1 rounded-md bg-card border border-border/50 text-xs text-muted-foreground shadow-sm max-w-[150px] truncate"
          >
            {edgeData.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const ResponseEdge = memo(ResponseEdgeComponent);
