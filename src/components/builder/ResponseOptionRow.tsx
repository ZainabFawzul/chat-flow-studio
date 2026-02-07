/**
 * @file ResponseOptionRow.tsx
 * @description Response option UI component with text editing, variable assignments,
 *              visibility conditions, and connection controls (link/unlink)
 * 
 * @dependencies @xyflow/react, ScenarioContext, scenario types, UI components
 * @usage Rendered by MessageFlowNode for each response option
 */

import { Handle, Position } from "@xyflow/react";
import { useScenario, PendingConnection } from "@/context/ScenarioContext";
import { ResponseOption, ScenarioVariable, VariableAssignment, VariableCondition, VariableValue } from "@/types/scenario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Link2, Unlink, Zap, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
interface ResponseOptionRowProps {
  option: ResponseOption;
  index: number;
  messageId: string;
  variables: Record<string, ScenarioVariable>;
  pendingConnection: PendingConnection | null;
  isConnecting: boolean;
  internalTabIndex?: number;
  isExpanded?: boolean;
}
export function ResponseOptionRow({
  option,
  index,
  messageId,
  variables,
  pendingConnection,
  isConnecting,
  internalTabIndex,
  isExpanded
}: ResponseOptionRowProps) {
  const {
    updateResponseOption,
    deleteResponseOption,
    disconnectOption,
    startConnection,
    setResponseVariableAssignment,
    setResponseCondition
  } = useScenario();
  const variableList = Object.values(variables);
  const isPendingSource = pendingConnection?.sourceMessageId === messageId && pendingConnection?.optionId === option.id;
  const handleSetVariable = (variableId: string | null, value: VariableValue) => {
    if (variableId) {
      setResponseVariableAssignment(messageId, option.id, {
        variableId,
        value
      });
    } else {
      setResponseVariableAssignment(messageId, option.id, null);
    }
  };

  const handleVariableValueChange = (value: VariableValue) => {
    if (option.setsVariable) {
      setResponseVariableAssignment(messageId, option.id, {
        variableId: option.setsVariable.variableId,
        value
      });
    }
  };

  const getSelectedVariable = () => {
    if (!option.setsVariable) return null;
    return variables[option.setsVariable.variableId] || null;
  };

  const selectedVariable = getSelectedVariable();

  const getDefaultValueForType = (type: string): VariableValue => {
    switch (type) {
      case "text": return "";
      case "number": return 0;
      default: return true;
    }
  };

  const formatDisplayValue = (value: VariableValue): string => {
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "string") return value || '""';
    return String(value);
  };
  const handleSetCondition = (variableId: string | null, requiredValue: VariableValue) => {
    if (variableId) {
      setResponseCondition(messageId, option.id, {
        variableId,
        requiredValue
      });
    } else {
      setResponseCondition(messageId, option.id, null);
    }
  };

  const handleConditionValueChange = (requiredValue: VariableValue) => {
    if (option.condition) {
      setResponseCondition(messageId, option.id, {
        variableId: option.condition.variableId,
        requiredValue
      });
    }
  };

  const getConditionVariable = () => {
    if (!option.condition) return null;
    return variables[option.condition.variableId] || null;
  };

  const conditionVariable = getConditionVariable();
  return <TooltipProvider>
      <div className={cn(
        "group relative flex gap-2 rounded-lg bg-secondary/30 p-2 transition-all duration-200",
        isPendingSource && "ring-2 ring-[#ffcad4] bg-[#ffcad4]/20",
        isExpanded ? "flex-col items-stretch" : "flex-row items-center"
      )}>
        <div className={cn("flex gap-2", isExpanded ? "items-start" : "items-center")}>
          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary shrink-0">
            {index + 1}
          </div>
          
          {isExpanded ? (
            <Textarea 
              value={option.text} 
              onChange={e => {
                updateResponseOption(messageId, option.id, e.target.value);
                // Auto-resize textarea
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onFocus={e => {
                // Set initial height on focus
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder="Response text..." 
              tabIndex={internalTabIndex} 
              className="flex-1 min-h-[40px] text-xs rounded-md border-border/30 bg-card nodrag resize-none overflow-hidden" 
            />
          ) : (
            <Input 
              value={option.text} 
              onChange={e => updateResponseOption(messageId, option.id, e.target.value)} 
              placeholder="Response text..." 
              tabIndex={internalTabIndex} 
              className="flex-1 h-7 text-xs rounded-md border-border/30 bg-card nodrag" 
            />
          )}
        </div>

        <div className={cn("flex items-center gap-1", isExpanded && "justify-end")}>
          {/* Variable indicators */}
          {option.setsVariable && variables[option.setsVariable.variableId] && <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-0.5 text-[10px] bg-warning/20 text-warning px-1.5 py-1.5 rounded font-medium">
                  <Zap className="h-2.5 w-2.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Sets: {variables[option.setsVariable.variableId].name} = {formatDisplayValue(option.setsVariable.value)}</p>
              </TooltipContent>
            </Tooltip>}

          {option.condition && variables[option.condition.variableId] && <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-0.5 text-[10px] bg-info/20 text-info px-1.5 py-1.5 rounded font-medium">
                  <Eye className="h-2.5 w-2.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Requires: {variables[option.condition.variableId].name} = {formatDisplayValue(option.condition.requiredValue)}</p>
              </TooltipContent>
            </Tooltip>}

        {/* Variable configuration popover */}
        {variableList.length > 0 && <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" tabIndex={internalTabIndex} className="h-6 w-6 rounded text-muted-foreground hover:bg-[#A7B5FF] hover:text-[#00178F]" data-walkthrough="trigger-button">
                    <Zap className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Configure variable</p>
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-72 p-3" align="end">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    When chosen, set variable
                  </label>
                  <div className="flex gap-2">
                    <Select 
                      value={option.setsVariable?.variableId || "none"} 
                      onValueChange={val => {
                        if (val === "none") {
                          handleSetVariable(null, true);
                        } else {
                          const selectedVar = variables[val];
                          const defaultVal = selectedVar ? getDefaultValueForType(selectedVar.type) : true;
                          handleSetVariable(val, defaultVal);
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {variableList.map(v => <SelectItem key={v.id} value={v.id}>
                            {v.name} ({v.type})
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    
                    {/* Value input based on variable type */}
                    {option.setsVariable && selectedVariable && (
                      selectedVariable.type === "boolean" ? (
                        <Select 
                          value={option.setsVariable.value === true ? "true" : "false"} 
                          onValueChange={val => handleVariableValueChange(val === "true")}
                        >
                          <SelectTrigger className="h-8 text-xs w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">true</SelectItem>
                            <SelectItem value="false">false</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : selectedVariable.type === "text" ? (
                        <Input
                          value={String(option.setsVariable.value)}
                          onChange={e => handleVariableValueChange(e.target.value)}
                          placeholder="Value..."
                          className="h-8 text-xs w-24"
                        />
                      ) : selectedVariable.type === "number" ? (
                        <Input
                          type="number"
                          value={String(option.setsVariable.value)}
                          onChange={e => handleVariableValueChange(Number(e.target.value) || 0)}
                          placeholder="0"
                          className="h-8 text-xs w-20"
                        />
                      ) : null
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Show only if
                  </label>
                  <div className="flex gap-2">
                    <Select 
                      value={option.condition?.variableId || "none"} 
                      onValueChange={val => {
                        if (val === "none") {
                          handleSetCondition(null, true);
                        } else {
                          const selectedVar = variables[val];
                          const defaultVal = selectedVar ? getDefaultValueForType(selectedVar.type) : true;
                          handleSetCondition(val, defaultVal);
                        }
                      }}
                    >
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
                    {option.condition && conditionVariable && (
                      conditionVariable.type === "boolean" ? (
                        <Select 
                          value={option.condition.requiredValue === true ? "true" : "false"} 
                          onValueChange={val => handleConditionValueChange(val === "true")}
                        >
                          <SelectTrigger className="h-8 text-xs w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">= true</SelectItem>
                            <SelectItem value="false">= false</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : conditionVariable.type === "text" ? (
                        <Input
                          value={String(option.condition.requiredValue)}
                          onChange={e => handleConditionValueChange(e.target.value)}
                          placeholder="Value..."
                          className="h-8 text-xs w-24"
                        />
                      ) : conditionVariable.type === "number" ? (
                        <Input
                          type="number"
                          value={String(option.condition.requiredValue)}
                          onChange={e => handleConditionValueChange(Number(e.target.value) || 0)}
                          placeholder="0"
                          className="h-8 text-xs w-20"
                        />
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>}

        {/* Link button (only when not connected) */}
        {!option.nextMessageId && !isConnecting && <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => startConnection(messageId, option.id)} tabIndex={internalTabIndex} className="h-6 w-6 rounded text-muted-foreground hover:bg-[#A7B5FF] hover:text-[#00178F]" aria-label={`Link "${option.text || 'response'}" to another message`} data-walkthrough="link-button">
                <Link2 className="h-3 w-3" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Connect to another message</p>
            </TooltipContent>
          </Tooltip>}

        {/* Unlink button (only when connected) */}
        {option.nextMessageId && <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => disconnectOption(messageId, option.id)} tabIndex={internalTabIndex} className="h-6 w-6 rounded text-muted-foreground hover:bg-[#FFA2B6] hover:text-[#00178F]">
                <Unlink className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Disconnect</p>
            </TooltipContent>
          </Tooltip>}

        <Button variant="ghost" size="icon" onClick={() => deleteResponseOption(messageId, option.id)} tabIndex={internalTabIndex} className="h-6 w-6 rounded text-muted-foreground hover:bg-[#FFA2B6] hover:text-[#00178F]">
          <Trash2 className="h-3 w-3" />
        </Button>
        </div>

        {/* Hidden source handle - required by React Flow for edge rendering */}
        <Handle type="source" position={Position.Right} id={option.id} className="!w-0 !h-0 !bg-transparent !border-0 !min-w-0 !min-h-0 !opacity-0 !pointer-events-none" style={{
        top: "auto"
      }} />
      </div>
    </TooltipProvider>;
}