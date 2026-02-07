/**
 * @file MessageFlowNode.tsx
 * @description Individual message node component for the flow canvas with content editing,
 *              response options, variable conditions, and connection handling
 * 
 * @dependencies @xyflow/react, ScenarioContext, ResponseOptionRow, UI components
 * @usage Registered as custom node type in FlowCanvas
 */

import { memo, useState, useRef, useEffect, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { useScenario, PendingConnection } from "@/context/ScenarioContext";
import { ChatMessage, ScenarioVariable, VariableValue } from "@/types/scenario";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flag, Plus, Trash2, Eye, MousePointerClick, Link2, Unlink } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ResponseOptionRow } from "./ResponseOptionRow";
interface MessageFlowNodeData {
  message: ChatMessage;
  isRoot: boolean;
  nodeNumber: number;
  pendingConnection: PendingConnection | null;
  variables: Record<string, ScenarioVariable>;
  isCondensed?: boolean;
}
function MessageFlowNodeComponent({
  data,
  selected
}: NodeProps) {
  const nodeData = data as unknown as MessageFlowNodeData;
  const {
    message,
    isRoot,
    nodeNumber,
    pendingConnection,
    variables,
    isCondensed = false,
  } = nodeData;
  const {
    updateMessage,
    deleteMessage,
    toggleEndpoint,
    addResponseOption,
    completeConnection,
    setMessageCondition,
    startConnection,
    disconnectMessageDirect
  } = useScenario();
  const [newOptionText, setNewOptionText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(message.content);
  const nodeRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isFocusedRef = useRef(false);

  // Sync external content changes (undo/redo, imports) to local state
  // but only when the textarea is NOT focused (user is not actively typing)
  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalContent(message.content);
    }
  }, [message.content]);

  // Auto-resize textarea without layout thrashing
  const autoResizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Use a hidden measurement approach: set to min height, read scrollHeight, set final
    el.style.overflow = 'hidden';
    el.style.height = '60px'; // min height for measurement
    const scrollH = el.scrollHeight;
    el.style.height = `${Math.max(60, scrollH)}px`;
  }, []);

  const handleAddOption = () => {
    if (newOptionText.trim()) {
      addResponseOption(message.id, newOptionText.trim());
      setNewOptionText("");
    }
  };
  const isComplete = message.isEndpoint || message.responseOptions.length > 0 || !!message.nextMessageId;
  const isConnecting = pendingConnection !== null;
  const isPendingSource = pendingConnection?.sourceMessageId === message.id;
  const canReceiveConnection = isConnecting && !isPendingSource;
  const hasNoResponses = message.responseOptions.length === 0 && !message.isEndpoint;
  const variableList = Object.values(variables || {});
  const handleMessageCondition = (variableId: string | null, requiredValue: VariableValue) => {
    if (variableId) {
      setMessageCondition(message.id, {
        variableId,
        requiredValue
      });
    } else {
      setMessageCondition(message.id, null);
    }
  };
  const handleMessageConditionValueChange = (requiredValue: VariableValue) => {
    if (message.condition) {
      setMessageCondition(message.id, {
        variableId: message.condition.variableId,
        requiredValue
      });
    }
  };
  const getMessageConditionVariable = () => {
    if (!message.condition) return null;
    return variables?.[message.condition.variableId] || null;
  };
  const messageConditionVariable = getMessageConditionVariable();
  const getDefaultValueForType = (type: string): VariableValue => {
    switch (type) {
      case "text":
        return "";
      case "number":
        return 0;
      default:
        return true;
    }
  };
  const formatDisplayValue = (value: VariableValue): string => {
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "string") return value || '""';
    return String(value);
  };

  // Handle keyboard activation for connection targets or entering edit mode
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (canReceiveConnection && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      completeConnection(message.id);
      return;
    }
    
    // Enter edit mode when pressing Enter on a focused node
    if (!isEditing && (e.key === "Enter" || e.key === " ") && !canReceiveConnection) {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(true);
      return;
    }
    
    // Exit edit mode on Escape
    if (isEditing && e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
      nodeRef.current?.focus();
    }
  };

  // Exit edit mode when focus leaves the node entirely
  useEffect(() => {
    const handleFocusOut = (e: FocusEvent) => {
      if (isEditing && nodeRef.current && !nodeRef.current.contains(e.relatedTarget as Node)) {
        setIsEditing(false);
      }
    };
    
    nodeRef.current?.addEventListener('focusout', handleFocusOut);
    return () => nodeRef.current?.removeEventListener('focusout', handleFocusOut);
  }, [isEditing]);

  // Re-measure textarea height when selected (textarea mounts) or content changes externally
  useEffect(() => {
    if (selected) {
      // Delay to ensure textarea is mounted after selected changes
      requestAnimationFrame(() => autoResizeTextarea());
    }
  }, [selected, message.content, localContent, autoResizeTextarea]);

  // Internal elements are only tabbable when in edit mode and not connecting
  const internalTabIndex = (isEditing && !isConnecting) ? 0 : -1;
  // Condensed view when zoomed out significantly
  if (isCondensed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              ref={nodeRef}
              className={cn(
                "w-16 h-16 rounded-2xl border-2 bg-card shadow-lg transition-all flex items-center justify-center relative",
                selected ? "border-primary shadow-primary/20" : "border-border/50",
                isRoot && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                canReceiveConnection && "ring-2 ring-success/50 cursor-pointer focus:ring-success focus:outline-none"
              )}
              onClick={canReceiveConnection ? () => completeConnection(message.id) : undefined}
              tabIndex={0}
              role="group"
              aria-label={`Message ${nodeNumber}${isRoot ? " (Start)" : ""}`}
              data-connection-target={canReceiveConnection ? message.id : undefined}
              data-message-node={message.id}
            >
              {/* Hidden target handle for edge rendering */}
              <Handle type="target" position={Position.Left} className="!w-0 !h-0 !bg-transparent !border-0 !min-w-0 !min-h-0 !opacity-0 !pointer-events-none" />
              
              <span className={cn(
                "text-xl font-bold",
                isRoot ? "text-primary" : "text-foreground"
              )}>
                {nodeNumber}
              </span>
              
              {/* Hidden handles for edge rendering in condensed mode */}
              {message.responseOptions.map((option, index) => (
                <Handle 
                  key={option.id}
                  type="source" 
                  position={Position.Right} 
                  id={option.id}
                  className="!w-0 !h-0 !bg-transparent !border-0 !min-w-0 !min-h-0 !opacity-0 !pointer-events-none"
                  style={{ top: `${30 + index * 10}%` }}
                />
              ))}
              <Handle 
                type="source" 
                position={Position.Right} 
                id="direct" 
                className="!w-0 !h-0 !bg-transparent !border-0 !min-w-0 !min-h-0 !opacity-0 !pointer-events-none"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px]">
            <p className="font-medium">{isRoot ? "Start: " : ""}Message {nodeNumber}</p>
            <p className="text-xs text-muted-foreground truncate">{message.content.slice(0, 50)}{message.content.length > 50 ? "..." : ""}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <TooltipProvider>
      <div 
        ref={nodeRef}
        className={cn(
          "w-[320px] rounded-2xl border-2 bg-card shadow-lg transition-all",
          selected ? "border-primary shadow-primary/20" : "border-border/50",
          isRoot && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
          canReceiveConnection && "ring-2 ring-success/50 cursor-pointer focus:ring-success focus:outline-none",
          isEditing && "ring-2 ring-primary focus:outline-none"
        )}
        onClick={canReceiveConnection ? () => completeConnection(message.id) : undefined}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="group"
        aria-label={
          canReceiveConnection 
            ? `Connect to message ${nodeNumber}: ${message.content.slice(0, 50)}`
            : `Message ${nodeNumber}${isRoot ? " (Start)" : ""}: ${message.content.slice(0, 50)}. Press Enter to edit.`
        }
        aria-expanded={isEditing}
        aria-describedby={`node-${message.id}-instructions`}
        data-connection-target={canReceiveConnection ? message.id : undefined}
        data-message-node={message.id}
        data-walkthrough="message-card"
      >
        {/* Screen reader instructions */}
        <span id={`node-${message.id}-instructions`} className="sr-only">
          {isEditing 
            ? "Editing mode. Tab through fields to edit message content and response options. Press Escape to exit editing."
            : "Press Enter or Space to edit this message. Press Tab to move to the next message node."
          }
        </span>
        {/* Hidden target handle - required by React Flow for edge rendering */}
        <Handle type="target" position={Position.Left} className="!w-0 !h-0 !bg-transparent !border-0 !min-w-0 !min-h-0 !opacity-0 !pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between gap-2 p-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-sm bg-[#a8b7ff] text-sidebar-foreground">
              {nodeNumber}
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {isRoot ? "Start" : "Message"}
            </span>
            
            {/* Message condition badge */}
            {message.condition && variables?.[message.condition.variableId] && <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-0.5 text-[10px] bg-info/20 text-info px-1.5 py-0.5 rounded font-medium">
                    <Eye className="h-2.5 w-2.5" />
                    {variables[message.condition.variableId].name}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Requires: {variables[message.condition.variableId].name} = {formatDisplayValue(message.condition.requiredValue)}</p>
                </TooltipContent>
              </Tooltip>}

            {/* Connection mode indicator */}
            {canReceiveConnection && <span className="flex items-center gap-1 text-[10px] bg-success/20 text-success px-1.5 py-0.5 rounded font-medium animate-pulse" aria-hidden="true">
                <MousePointerClick className="h-2.5 w-2.5" />
                Press Enter to connect
              </span>}
          </div>

          <div className="flex items-center gap-1">
            {/* Message condition popover */}
            {variableList.length > 0 && !isRoot && <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button variant={message.condition ? "secondary" : "ghost"} size="icon" tabIndex={internalTabIndex} className={cn("h-7 w-7 rounded-lg", message.condition ? "bg-info/20 text-info hover:bg-[#A7B5FF] hover:text-[#00178F]" : "text-muted-foreground hover:bg-[#A7B5FF] hover:text-[#00178F]")}>
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
                      <Select value={message.condition?.variableId || "none"} onValueChange={val => {
                    if (val === "none") {
                      handleMessageCondition(null, true);
                    } else {
                      const selectedVar = variables?.[val];
                      const defaultVal = selectedVar ? getDefaultValueForType(selectedVar.type) : true;
                      handleMessageCondition(val, defaultVal);
                    }
                  }}>
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue placeholder="Always visible" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Always visible</SelectItem>
                          {variableList.map(v => <SelectItem key={v.id} value={v.id}>
                              {v.name} ({v.type})
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                      
                      {/* Condition value input based on variable type */}
                      {message.condition && messageConditionVariable && (messageConditionVariable.type === "boolean" ? <Select value={message.condition.requiredValue === true ? "true" : "false"} onValueChange={val => handleMessageConditionValueChange(val === "true")}>
                            <SelectTrigger className="h-8 text-xs w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">= true</SelectItem>
                              <SelectItem value="false">= false</SelectItem>
                            </SelectContent>
                          </Select> : messageConditionVariable.type === "text" ? <Input value={String(message.condition.requiredValue)} onChange={e => handleMessageConditionValueChange(e.target.value)} placeholder="Value..." className="h-8 text-xs w-24" /> : messageConditionVariable.type === "number" ? <Input type="number" value={String(message.condition.requiredValue)} onChange={e => handleMessageConditionValueChange(Number(e.target.value) || 0)} placeholder="0" className="h-8 text-xs w-20" /> : null)}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>}

            <Button variant={message.isEndpoint ? "secondary" : "ghost"} size="sm" onClick={() => toggleEndpoint(message.id)} tabIndex={internalTabIndex} className={cn("gap-1 text-xs rounded-lg h-7 px-2", message.isEndpoint && "bg-success/20 text-success hover:bg-success/30")}>
              <Flag className="h-3 w-3" />
              {message.isEndpoint ? "End" : "End"}
            </Button>

            {!isRoot && <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" tabIndex={internalTabIndex} className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-[#FFA2B6] hover:text-[#00178F]">
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
                    <AlertDialogAction onClick={() => deleteMessage(message.id)} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>}
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {selected ? (
            <Textarea value={localContent} onChange={e => {
              setLocalContent(e.target.value);
              updateMessage(message.id, e.target.value);
              // Resize after local state update
              requestAnimationFrame(() => autoResizeTextarea());
            }} onFocus={() => {
              isFocusedRef.current = true;
              autoResizeTextarea();
            }} onBlur={() => {
              isFocusedRef.current = false;
              // Ensure context has the final value
              if (localContent !== message.content) {
                updateMessage(message.id, localContent);
              }
            }} placeholder="Enter the contact's message..." tabIndex={internalTabIndex} className="min-h-[60px] resize-none rounded-xl border-border/50 bg-secondary/30 text-sm nodrag overflow-hidden" ref={textareaRef} />
          ) : (
            <div className="text-sm text-foreground rounded-xl border border-border/50 bg-secondary/30 px-3 py-2 min-h-[40px] nodrag">
              {localContent.length > 100 ? `${localContent.slice(0, 100)}…` : (localContent || <span className="text-muted-foreground">Enter the contact's message...</span>)}
            </div>
          )}

          {/* Status indicators */}
          {!isComplete && !hasNoResponses && <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                Add response options
              </span>
            </div>}
        </div>

        {/* Direct message connection for messages without responses */}
        {hasNoResponses && (
          <div className="border-t border-border/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                No responses - connect directly to next message
              </span>
              <div className="flex items-center gap-1">
                {/* Link button for direct connection */}
                {!message.nextMessageId && !isConnecting && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => startConnection(message.id, null)} 
                        tabIndex={internalTabIndex} 
                        className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-[#A7B5FF] hover:text-[#00178F]"
                        aria-label="Link to another message"
                      >
                        <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Connect to next message</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {/* Unlink button when connected */}
                {message.nextMessageId && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => disconnectMessageDirect(message.id)} 
                        tabIndex={internalTabIndex} 
                        className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-[#FFA2B6] hover:text-[#00178F]"
                      >
                        <Unlink className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Disconnect</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            {/* Hidden source handle - required by React Flow for edge rendering */}
            <Handle 
              type="source" 
              position={Position.Right} 
              id="direct" 
              className="!w-0 !h-0 !bg-transparent !border-0 !min-w-0 !min-h-0 !opacity-0 !pointer-events-none !right-[-6px] !top-auto !bottom-4"
            />
          </div>
        )}

        {/* Response Options */}
        {!message.isEndpoint && <div className="border-t border-border/30 p-3 space-y-2" data-walkthrough="response-options-section">
            <span className="text-xs font-medium text-muted-foreground">Response Options</span>
            
            {message.responseOptions.map((option, index) => <ResponseOptionRow key={option.id} option={option} index={index} messageId={message.id} variables={variables || {}} pendingConnection={pendingConnection} isConnecting={isConnecting} internalTabIndex={internalTabIndex} isExpanded={selected === true} />)}

            {/* Add new option */}
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/50 p-2" data-walkthrough="add-response-input">
              <Input value={newOptionText} onChange={e => setNewOptionText(e.target.value)} placeholder="New response..." tabIndex={internalTabIndex} className="flex-1 h-7 text-xs border-0 bg-transparent focus-visible:ring-0 nodrag" onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddOption();
            }
          }} />
              <Button variant="default" size="sm" onClick={handleAddOption} disabled={!newOptionText.trim()} tabIndex={internalTabIndex} className="h-7 px-2 text-xs rounded-md">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>}
      </div>
    </TooltipProvider>;
}
export const MessageFlowNode = memo(MessageFlowNodeComponent);