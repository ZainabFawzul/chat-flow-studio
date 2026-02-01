/**
 * @file CanvasToolbar.tsx
 * @description Canvas toolbar with add node, variables panel, reset canvas, and help buttons
 * 
 * @dependencies ScenarioContext, VariablesPanel, UI components
 * @usage Rendered as a Panel in FlowCanvas
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";
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
      <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-xl shadow-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              onClick={handleAddNode}
              className="gap-2 rounded-lg h-9"
            >
              <Plus className="h-4 w-4" />
              Add Node
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
