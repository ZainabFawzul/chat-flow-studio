/**
 * @file FlowCanvas.tsx
 * @description React Flow canvas for visual node-based message editing with drag-and-drop
 *              and click-to-connect functionality for building conversation flows
 * 
 * @dependencies @xyflow/react, ScenarioContext, MessageFlowNode, ResponseEdge, CanvasToolbar
 * @usage Rendered in LeftPanel Canvas tab
 */

import { useCallback, useMemo, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  NodeChange,
  Panel,
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

export function FlowCanvas({ isExpanded, onToggleExpand }: FlowCanvasProps) {
  const {
    scenario,
    updateNodePosition,
    addMessageAtPosition,
    connectNodes,
    pendingConnection,
    cancelConnection,
  } = useScenario();

  const containerRef = useRef<HTMLDivElement>(null);
  const focusedNodeIndexRef = useRef<number>(0);

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
      data: {
        message,
        isRoot: message.id === scenario.rootMessageId,
        nodeNumber: index + 1,
        pendingConnection,
        variables: scenario.variables || {},
      },
    }));
  }, [scenario.messages, scenario.rootMessageId, pendingConnection, scenario.variables]);

  // Convert response options to React Flow edges
  const edges: Edge[] = useMemo(() => {
    const edgeList: Edge[] = [];
    Object.values(scenario.messages).forEach((message) => {
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
    });
    return edgeList;
  }, [scenario.messages]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.position && change.id) {
          updateNodePosition(change.id, change.position);
        }
      });
    },
    [updateNodePosition]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target && connection.sourceHandle) {
        connectNodes(connection.source, connection.sourceHandle, connection.target);
      }
    },
    [connectNodes]
  );

  const handleAddNode = useCallback(
    (position: { x: number; y: number }) => {
      addMessageAtPosition("New message...", position);
    },
    [addMessageAtPosition]
  );

  return (
    <div 
      ref={containerRef}
      className={`relative ${isExpanded ? "fixed inset-0 z-50 bg-background" : "h-full"}`}
      role="application"
      aria-label="Message flow canvas. Use Tab to navigate to controls, or click to interact with the canvas."
    >
      {/* FIRST in DOM = First in focus order */}
      <div 
        className="absolute top-4 left-4 z-10"
        role="region" 
        aria-label="Canvas controls. Tab through toolbar buttons first, then Tab to move through message nodes."
      >
        <CanvasToolbar onAddNode={() => handleAddNode({ x: 200, y: 200 })} />
      </div>

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
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
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
          aria-hidden="true"
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
                Connecting "{pendingOptionText}" — Tab to a message node and press Enter
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
