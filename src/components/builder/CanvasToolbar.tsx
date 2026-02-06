/**
 * @file CanvasToolbar.tsx
 * @description Canvas toolbar with add node, variables panel, reset canvas, and help buttons
 * 
 * @dependencies ScenarioContext, VariablesPanel, UI components
 * @usage Rendered as a Panel in FlowCanvas
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScenario } from "@/context/ScenarioContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { VariablesPanel, VariablesTrigger } from "./VariablesPanel";

interface CanvasToolbarProps {
  onAddNode: () => void;
}

export function CanvasToolbar({ onAddNode }: CanvasToolbarProps) {
  const { scenario, resetScenario, addRootMessage } = useScenario();
  const [isVariablesPanelOpen, setIsVariablesPanelOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (toolbarRef.current) {
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      setIsDragging(true);
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !toolbarRef.current) return;
    const parent = toolbarRef.current.parentElement;
    const parentWidth = parent?.clientWidth || window.innerWidth;
    const parentHeight = parent?.clientHeight || window.innerHeight;
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    const maxX = parentWidth - (toolbarRef.current.offsetWidth || 200);
    const maxY = parentHeight - (toolbarRef.current.offsetHeight || 50);
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  }, [isDragging]);

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

  const handleAddNode = () => {
    if (!scenario.rootMessageId) {
      // Add root message if none exists
      addRootMessage("Hello! How can I help you today?", { x: 200, y: 200 });
    } else {
      onAddNode();
    }
  };

  const variableCount = Object.keys(scenario.variables || {}).length;

  return (
    <TooltipProvider>
      <div 
        ref={toolbarRef}
        className={cn(
          "absolute z-10 flex items-center gap-2 p-2 bg-card border border-border rounded-xl shadow-lg",
          isDragging && "cursor-grabbing select-none"
        )}
        role="toolbar"
        aria-label="Canvas toolbar. Tab to navigate buttons, then Tab again to move to message nodes."
        style={{ left: position.x, top: position.y }}
      >
        {/* Drag handle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onMouseDown={handleDragStart}
              className="flex items-center justify-center h-9 w-6 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              aria-label="Drag to reposition toolbar"
              tabIndex={0}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Drag to move toolbar</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              onClick={handleAddNode}
              className="gap-2 rounded-lg h-9"
              tabIndex={0}
              data-walkthrough="new-message-button"
            >
              <Plus className="h-4 w-4" />
              New Message
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Add a new message node</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border" />

        <div data-walkthrough="variables-button">
          <VariablesTrigger 
            onClick={() => setIsVariablesPanelOpen(true)}
            variableCount={variableCount}
          />
        </div>

        <VariablesPanel 
          isOpen={isVariablesPanelOpen}
          onClose={() => setIsVariablesPanelOpen(false)}
        />

        <div className="w-px h-6 bg-border" />

        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-[#A7B5FF] hover:text-[#00178F]"
                  tabIndex={0}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Reset canvas</p>
            </TooltipContent>
          </Tooltip>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset the entire scenario?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all messages and start fresh. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={resetScenario}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </TooltipProvider>
  );
}
