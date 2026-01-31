import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { useScenario } from "@/context/ScenarioContext";
import { ChatMessage } from "@/types/scenario";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Flag,
  MessageSquare,
  Plus,
  Trash2,
  Link2,
  Unlink,
  CornerDownRight,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

interface MessageFlowNodeData {
  message: ChatMessage;
  isRoot: boolean;
  nodeNumber: number;
}

function MessageFlowNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as MessageFlowNodeData;
  const { message, isRoot, nodeNumber } = nodeData;
  
  const {
    updateMessage,
    deleteMessage,
    toggleEndpoint,
    addResponseOption,
    updateResponseOption,
    deleteResponseOption,
    disconnectOption,
  } = useScenario();

  const [newOptionText, setNewOptionText] = useState("");

  const handleAddOption = () => {
    if (newOptionText.trim()) {
      addResponseOption(message.id, newOptionText.trim());
      setNewOptionText("");
    }
  };

  const isComplete = message.isEndpoint || message.responseOptions.length > 0;

  return (
    <div
      className={cn(
        "w-[320px] rounded-2xl border-2 bg-card shadow-lg transition-all",
        selected ? "border-primary shadow-primary/20" : "border-border/50",
        isRoot && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
      )}
    >
      {/* Input handle for connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            {nodeNumber}
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {isRoot ? "Start" : "Message"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={message.isEndpoint ? "secondary" : "ghost"}
            size="sm"
            onClick={() => toggleEndpoint(message.id)}
            className={cn(
              "gap-1 text-xs rounded-lg h-7 px-2",
              message.isEndpoint && "bg-success/20 text-success hover:bg-success/30"
            )}
          >
            <Flag className="h-3 w-3" />
            {message.isEndpoint ? "End" : "End"}
          </Button>

          {!isRoot && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the message from the flow. Connected options will be unlinked.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMessage(message.id)}
                    className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <Textarea
          value={message.content}
          onChange={(e) => updateMessage(message.id, e.target.value)}
          placeholder="Enter the contact's message..."
          className="min-h-[60px] resize-none rounded-xl border-border/50 bg-secondary/30 text-sm nodrag"
        />

        {/* Status indicators */}
        {!isComplete && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
              Add response options
            </span>
          </div>
        )}
      </div>

      {/* Response Options */}
      {!message.isEndpoint && (
        <div className="border-t border-border/30 p-3 space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Response Options</span>
          
          {message.responseOptions.map((option, index) => (
            <div
              key={option.id}
              className="group relative flex items-center gap-2 rounded-lg bg-secondary/30 p-2"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary shrink-0">
                {index + 1}
              </div>
              <Input
                value={option.text}
                onChange={(e) => updateResponseOption(message.id, option.id, e.target.value)}
                placeholder="Response text..."
                className="flex-1 h-7 text-xs rounded-md border-border/30 bg-card nodrag"
              />
              
              {option.nextMessageId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => disconnectOption(message.id, option.id)}
                  className="h-6 w-6 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                  title="Disconnect"
                >
                  <Unlink className="h-3 w-3" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteResponseOption(message.id, option.id)}
                className="h-6 w-6 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </Button>

              {/* Output handle for this option */}
              <Handle
                type="source"
                position={Position.Right}
                id={option.id}
                className={cn(
                  "!w-3 !h-3 !border-2 !border-background !right-[-6px]",
                  option.nextMessageId ? "!bg-success" : "!bg-primary"
                )}
                style={{ top: "auto" }}
              />
            </div>
          ))}

          {/* Add new option */}
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/50 p-2">
            <Input
              value={newOptionText}
              onChange={(e) => setNewOptionText(e.target.value)}
              placeholder="New response..."
              className="flex-1 h-7 text-xs border-0 bg-transparent focus-visible:ring-0 nodrag"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddOption();
                }
              }}
            />
            <Button
              variant="default"
              size="sm"
              onClick={handleAddOption}
              disabled={!newOptionText.trim()}
              className="h-7 px-2 text-xs rounded-md"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const MessageFlowNode = memo(MessageFlowNodeComponent);
