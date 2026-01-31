import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { useScenario, PendingConnection } from "@/context/ScenarioContext";
import { ChatMessage, ScenarioVariable } from "@/types/scenario";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Flag,
  Plus,
  Trash2,
  Eye,
  MousePointerClick,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ResponseOptionRow } from "./ResponseOptionRow";

interface MessageFlowNodeData {
  message: ChatMessage;
  isRoot: boolean;
  nodeNumber: number;
  pendingConnection: PendingConnection | null;
  variables: Record<string, ScenarioVariable>;
}

function MessageFlowNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as MessageFlowNodeData;
  const { message, isRoot, nodeNumber, pendingConnection, variables } = nodeData;
  
  const {
    updateMessage,
    deleteMessage,
    toggleEndpoint,
    addResponseOption,
    completeConnection,
    setMessageCondition,
  } = useScenario();

  const [newOptionText, setNewOptionText] = useState("");

  const handleAddOption = () => {
    if (newOptionText.trim()) {
      addResponseOption(message.id, newOptionText.trim());
      setNewOptionText("");
    }
  };

  const isComplete = message.isEndpoint || message.responseOptions.length > 0;
  const isConnecting = pendingConnection !== null;
  const isPendingSource = pendingConnection?.sourceMessageId === message.id;
  const canReceiveConnection = isConnecting && !isPendingSource;

  const variableList = Object.values(variables || {});

  const handleMessageCondition = (variableId: string | null, requiredValue: boolean) => {
    if (variableId) {
      setMessageCondition(message.id, { variableId, requiredValue });
    } else {
      setMessageCondition(message.id, null);
    }
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "w-[320px] rounded-2xl border-2 bg-card shadow-lg transition-all",
          selected ? "border-primary shadow-primary/20" : "border-border/50",
          isRoot && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
          canReceiveConnection && "ring-2 ring-success/50 cursor-pointer"
        )}
        onClick={canReceiveConnection ? () => completeConnection(message.id) : undefined}
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
            
            {/* Message condition badge */}
            {message.condition && variables?.[message.condition.variableId] && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-0.5 text-[10px] bg-info/20 text-info px-1.5 py-0.5 rounded font-medium">
                    <Eye className="h-2.5 w-2.5" />
                    {variables[message.condition.variableId].name}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Requires: {variables[message.condition.variableId].name} = {message.condition.requiredValue ? "true" : "false"}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Connection mode indicator */}
            {canReceiveConnection && (
              <span className="flex items-center gap-1 text-[10px] bg-success/20 text-success px-1.5 py-0.5 rounded font-medium animate-pulse">
                <MousePointerClick className="h-2.5 w-2.5" />
                Click to connect
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Message condition popover */}
            {variableList.length > 0 && !isRoot && (
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        variant={message.condition ? "secondary" : "ghost"}
                        size="icon"
                        className={cn(
                          "h-7 w-7 rounded-lg",
                          message.condition ? "bg-info/20 text-info hover:bg-info/30" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Set visibility condition</p>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-64 p-3" align="end">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Show message only if
                    </label>
                    <div className="flex gap-2">
                      <Select
                        value={message.condition?.variableId || "none"}
                        onValueChange={(val) => handleMessageCondition(val === "none" ? null : val, true)}
                      >
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue placeholder="Always visible" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Always visible</SelectItem>
                          {variableList.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {message.condition && (
                        <Select
                          value={message.condition.requiredValue ? "true" : "false"}
                          onValueChange={(val) => handleMessageCondition(message.condition!.variableId, val === "true")}
                        >
                          <SelectTrigger className="h-8 text-xs w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">= true</SelectItem>
                            <SelectItem value="false">= false</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

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
              <ResponseOptionRow
                key={option.id}
                option={option}
                index={index}
                messageId={message.id}
                variables={variables || {}}
                pendingConnection={pendingConnection}
                isConnecting={isConnecting}
              />
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
    </TooltipProvider>
  );
}

export const MessageFlowNode = memo(MessageFlowNodeComponent);
