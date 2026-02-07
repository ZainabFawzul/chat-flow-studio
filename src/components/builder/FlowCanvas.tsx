/**
 * @file FlowCanvas.tsx
 * @description React Flow canvas for visual node-based message editing with drag-and-drop
 *              and click-to-connect functionality for building conversation flows
 * 
 * @dependencies @xyflow/react, ScenarioContext, MessageFlowNode, ResponseEdge, CanvasToolbar
 * @usage Rendered in LeftPanel Canvas tab
 */

import { useCallback, useMemo, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Edge,
  Node,
  type ReactFlowInstance,
  BackgroundVariant,
  NodeChange,
  Panel,
  useOnViewportChange,
  type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useScenario } from "@/context/ScenarioContext";
import { MessageFlowNode } from "./MessageFlowNode";
import { ResponseEdge } from "./ResponseEdge";
import { CanvasToolbar } from "./CanvasToolbar";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Link2, X } from "lucide-react";

const nodeTypes = {
  messageNode: MessageFlowNode,
};

const edgeTypes = {
  responseEdge: ResponseEdge,
};

interface FlowCanvasProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function FlowCanvasContent({ isExpanded, onToggleExpand }: FlowCanvasProps) {
  const {
    scenario,
    updateNodePosition,
    addMessageAtPosition,
    // connectNodes removed — drag-to-connect disabled
    pendingConnection,
    cancelConnection,
  } = useScenario();

  const containerRef = useRef<HTMLDivElement>(null);
  const focusedNodeIndexRef = useRef<number>(0);
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  
  // Track selected node ID for expand/collapse behavior
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Track zoom level for condensed node display
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Update zoom level when viewport changes
  useOnViewportChange({
    onEnd: (viewport: Viewport) => setZoomLevel(viewport.zoom),
  });

  // Get list of valid target node IDs (all nodes except the source)
  const targetNodeIds = useMemo(() => {
    if (!pendingConnection) return [];
    return Object.keys(scenario.messages).filter(
      (id) => id !== pendingConnection.sourceMessageId
    );
  }, [pendingConnection, scenario.messages]);

  // Handle keyboard navigation during connection mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cancel on Escape
      if (e.key === "Escape" && pendingConnection) {
        cancelConnection();
        return;
      }

      // Tab navigation only during connection mode
      if (pendingConnection && e.key === "Tab" && targetNodeIds.length > 0) {
        e.preventDefault();
        e.stopPropagation();

        // Cycle through target nodes
        if (e.shiftKey) {
          focusedNodeIndexRef.current =
            (focusedNodeIndexRef.current - 1 + targetNodeIds.length) % targetNodeIds.length;
        } else {
          focusedNodeIndexRef.current =
            (focusedNodeIndexRef.current + 1) % targetNodeIds.length;
        }

        // Focus the target node element
        const targetId = targetNodeIds[focusedNodeIndexRef.current];
        const nodeElement = containerRef.current?.querySelector(
          `[data-connection-target="${targetId}"]`
        ) as HTMLElement;
        nodeElement?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [pendingConnection, cancelConnection, targetNodeIds]);

  // Reset focused index when entering connection mode
  useEffect(() => {
    if (pendingConnection) {
      focusedNodeIndexRef.current = -1; // Start at -1 so first Tab goes to index 0
    }
  }, [pendingConnection]);


  // Get the pending option text for the banner
  const pendingOptionText = useMemo(() => {
    if (!pendingConnection) return null;
    // Direct message connection (no option)
    if (!pendingConnection.optionId) {
      return null;
    }
    const message = scenario.messages[pendingConnection.sourceMessageId];
    if (!message) return null;
    const option = message.responseOptions.find(o => o.id === pendingConnection.optionId);
    return option?.text || "response";
  }, [pendingConnection, scenario.messages]);

  // Convert scenario messages to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    const messageList = Object.values(scenario.messages);
    return messageList.map((message, index) => ({
      id: message.id,
      type: "messageNode",
      // Fallback position for messages without coordinates (legacy data)
      position: message.position || { x: 100 + (index % 3) * 400, y: 100 + Math.floor(index / 3) * 300 },
      selected: message.id === selectedNodeId,
      data: {
        message,
        isRoot: message.id === scenario.rootMessageId,
        nodeNumber: index + 1,
        pendingConnection,
        variables: scenario.variables || {},
        isCondensed: zoomLevel < 0.4, // Show condensed view when zoomed below 40%
      },
    }));
  }, [scenario.messages, scenario.rootMessageId, pendingConnection, scenario.variables, selectedNodeId, zoomLevel]);

  // Ensure nodes are visible when entering expanded mode.
  // Using onInit avoids injecting custom children into <ReactFlow> (which can trigger ref warnings).
  useEffect(() => {
    if (!isExpanded) return;
    const instance = reactFlowInstanceRef.current;
    if (!instance) return;

    const timer = window.setTimeout(() => {
      instance.fitView({ padding: 0.2 });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [isExpanded, nodes.length]);

  // Convert response options to React Flow edges
  const edges: Edge[] = useMemo(() => {
    const edgeList: Edge[] = [];
    Object.values(scenario.messages).forEach((message) => {
      // Response option edges
      message.responseOptions.forEach((option) => {
        if (option.nextMessageId) {
          edgeList.push({
            id: `${message.id}-${option.id}`,
            source: message.id,
            target: option.nextMessageId,
            sourceHandle: option.id,
            type: "responseEdge",
            data: { label: option.text },
          });
        }
      });
      // Direct message-to-message edge
      if (message.nextMessageId) {
        edgeList.push({
          id: `${message.id}-direct`,
          source: message.id,
          target: message.nextMessageId,
          sourceHandle: "direct",
          type: "responseEdge",
          data: { label: "continues to" },
        });
      }
    });
    return edgeList;
  }, [scenario.messages]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.position && change.id) {
          updateNodePosition(change.id, change.position);
        }
        // Handle selection changes
        if (change.type === "select" && change.id) {
          setSelectedNodeId(change.selected ? change.id : null);
        }
      });
    },
    [updateNodePosition]
  );

  // Drag-to-connect disabled — connections are made via the Link button only

  const handleAddNode = useCallback(
    (position: { x: number; y: number }) => {
      addMessageAtPosition("New message...", position);
    },
    [addMessageAtPosition]
  );

  return (
    <div 
      ref={containerRef}
      className="relative h-full w-full bg-background"
      role="application"
      aria-label="Message flow canvas. Use Tab to navigate to controls, or click to interact with the canvas."
    >
      {/* FIRST in DOM = First in focus order */}
      <CanvasToolbar onAddNode={() => handleAddNode({ x: 200, y: 200 })} />

      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleExpand}
          className="h-10 w-10 rounded-xl bg-card shadow-lg"
          aria-label={isExpanded ? "Exit fullscreen" : "Enter fullscreen"}
          data-walkthrough="expand-button"
        >
          {isExpanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* ReactFlow fills the container - toolbar is BEFORE this in DOM */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        // onConnect removed — drag-to-connect disabled
        onInit={(instance) => {
          reactFlowInstanceRef.current = instance;
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        className="bg-secondary/20"
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={null}
        selectionKeyCode={null}
        tabIndex={-1}
        aria-label="Flow canvas area"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="bg-background"
        />
        <Controls
          className="bg-card border border-border rounded-xl shadow-lg [&_button]:focus:outline-none"
          showZoom
          showFitView
          showInteractive={false}
        />

        {/* Connection mode banner */}
        {pendingConnection && (
          <Panel position="top-center" className="mt-4">
            <div 
              className="flex items-center gap-3 px-4 py-2 bg-primary text-primary-foreground rounded-xl shadow-lg animate-in slide-in-from-top-2"
              role="status"
              aria-live="polite"
            >
              <Link2 className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">
                {pendingOptionText 
                  ? `Connecting "${pendingOptionText}" — Tab to a message node and press Enter`
                  : "Connecting message — Tab to a message node and press Enter"
                }
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={cancelConnection}
                className="h-6 w-6 rounded-lg hover:bg-primary-foreground/20"
                aria-label="Cancel connection"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </Button>
              <span className="text-xs opacity-70" aria-hidden="true">or press Esc</span>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

// Wrapper component that provides ReactFlowProvider
export function FlowCanvas({ isExpanded, onToggleExpand }: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasContent isExpanded={isExpanded} onToggleExpand={onToggleExpand} />
    </ReactFlowProvider>
  );
}
