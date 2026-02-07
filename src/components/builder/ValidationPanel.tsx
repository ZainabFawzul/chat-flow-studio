/**
 * @file ValidationPanel.tsx
 * @description Floating panel that lists unconnected response options.
 *              Users can click items to jump to the relevant message node on the canvas.
 * 
 * @dependencies ScenarioContext, @xyflow/react, UI components
 * @usage Rendered in FlowCanvas when validation mode is active
 */

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { useScenario } from "@/context/ScenarioContext";
import { Button } from "@/components/ui/button";
import { X, GripVertical, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ValidationIssue {
  messageId: string;
  messageNumber: number;
  messageContent: string;
  type: "response" | "direct";
  optionText?: string;
  optionId?: string;
}

interface ValidationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  invalidMessageIds: Set<string>;
}

export function ValidationPanel({ isOpen, onClose, invalidMessageIds }: ValidationPanelProps) {
  const { scenario } = useScenario();
  const { setCenter } = useReactFlow();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 80 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const issues: ValidationIssue[] = useMemo(() => {
    const result: ValidationIssue[] = [];
    const messageList = Object.values(scenario.messages);

    messageList.forEach((message, index) => {
      // Check response options without connections
      message.responseOptions.forEach((option) => {
        if (!option.nextMessageId) {
          result.push({
            messageId: message.id,
            messageNumber: index + 1,
            messageContent: message.content,
            type: "response",
            optionText: option.text,
            optionId: option.id,
          });
        }
      });

      // Check messages with no responses and no direct connection and not an endpoint
      if (
        message.responseOptions.length === 0 &&
        !message.nextMessageId &&
        !message.isEndpoint
      ) {
        result.push({
          messageId: message.id,
          messageNumber: index + 1,
          messageContent: message.content,
          type: "direct",
        });
      }
    });

    return result;
  }, [scenario.messages]);

  const handleJumpToNode = useCallback(
    (messageId: string) => {
      const message = scenario.messages[messageId];
      if (message?.position) {
        setCenter(message.position.x + 160, message.position.y + 100, {
          zoom: 1,
          duration: 400,
        });
      }
    },
    [scenario.messages, setCenter]
  );

  // Drag logic
  const handleDragStart = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      setIsDragging(true);
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !panelRef.current) return;
      const parent = panelRef.current.parentElement;
      const parentWidth = parent?.clientWidth || window.innerWidth;
      const parentHeight = parent?.clientHeight || window.innerHeight;
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      const maxX = parentWidth - (panelRef.current.offsetWidth || 280);
      const maxY = parentHeight - (panelRef.current.offsetHeight || 200);
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute z-20 w-72 bg-card border border-border rounded-xl shadow-lg animate-in slide-in-from-top-2",
        isDragging && "cursor-grabbing select-none"
      )}
      style={{ left: position.x, top: position.y }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/30">
        <button
          onMouseDown={handleDragStart}
          className="flex items-center justify-center h-7 w-5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground rounded transition-colors"
          aria-label="Drag to reposition panel"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <span className="text-sm font-semibold flex-1">
          Validation {issues.length > 0 && `(${issues.length})`}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
          aria-label="Close validation panel"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="max-h-64">
        <div className="p-2 space-y-1">
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <span className="text-2xl mb-2">✅</span>
              <span className="text-sm font-medium text-foreground">All connected!</span>
              <span className="text-xs text-muted-foreground mt-0.5">
                Every response has a connection.
              </span>
            </div>
          ) : (
            issues.map((issue, i) => (
              <button
                key={`${issue.messageId}-${issue.optionId || "direct"}-${i}`}
                onClick={() => handleJumpToNode(issue.messageId)}
                className="w-full text-left rounded-lg p-2 hover:bg-destructive/10 transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-destructive/15 text-[10px] font-bold text-destructive shrink-0 mt-0.5">
                    {issue.messageNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {issue.type === "response"
                        ? `"${issue.optionText || "Untitled response"}" not connected`
                        : "No connection or endpoint"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {issue.messageContent.slice(0, 60)}
                      {issue.messageContent.length > 60 ? "…" : ""}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
