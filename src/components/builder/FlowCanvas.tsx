import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  NodeChange,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useScenario } from "@/context/ScenarioContext";
import { MessageFlowNode } from "./MessageFlowNode";
import { ResponseEdge } from "./ResponseEdge";
import { CanvasToolbar } from "./CanvasToolbar";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

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
    addFollowUpMessage,
    connectNodes,
  } = useScenario();

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
      },
    }));
  }, [scenario.messages, scenario.rootMessageId]);

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

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Only add node on double-click
    },
    []
  );

  return (
    <div className={`${isExpanded ? "fixed inset-0 z-50 bg-background" : "h-full"}`}>
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
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="bg-background"
        />
        <Controls
          className="bg-card border border-border rounded-xl shadow-lg"
          showZoom
          showFitView
          showInteractive={false}
        />
        <MiniMap
          className="bg-card border border-border rounded-xl shadow-lg !bottom-4 !right-4"
          nodeColor="#3b82f6"
          maskColor="hsl(var(--background) / 0.8)"
          pannable
          zoomable
        />
        
        <Panel position="top-left" className="m-4">
          <CanvasToolbar onAddNode={() => handleAddNode({ x: 200, y: 200 })} />
        </Panel>

        <Panel position="top-right" className="m-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleExpand}
            className="h-10 w-10 rounded-xl bg-card shadow-lg"
            aria-label={isExpanded ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
