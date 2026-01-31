import { Handle, Position } from "@xyflow/react";
import { useScenario, PendingConnection } from "@/context/ScenarioContext";
import { ResponseOption, ScenarioVariable, VariableAssignment, VariableCondition } from "@/types/scenario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Link2,
  Unlink,
  Zap,
  Eye,
} from "lucide-react";
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

interface ResponseOptionRowProps {
  option: ResponseOption;
  index: number;
  messageId: string;
  variables: Record<string, ScenarioVariable>;
  pendingConnection: PendingConnection | null;
  isConnecting: boolean;
  internalTabIndex?: number;
}

export function ResponseOptionRow({
  option,
  index,
  messageId,
  variables,
  pendingConnection,
  isConnecting,
  internalTabIndex,
}: ResponseOptionRowProps) {
  const {
    updateResponseOption,
    deleteResponseOption,
    disconnectOption,
    startConnection,
    setResponseVariableAssignment,
    setResponseCondition,
  } = useScenario();

  const variableList = Object.values(variables);
  const isPendingSource = pendingConnection?.sourceMessageId === messageId && pendingConnection?.optionId === option.id;

  const handleSetVariable = (variableId: string | null, value: boolean) => {
    if (variableId) {
      setResponseVariableAssignment(messageId, option.id, { variableId, value });
    } else {
      setResponseVariableAssignment(messageId, option.id, null);
    }
  };

  const handleSetCondition = (variableId: string | null, requiredValue: boolean) => {
    if (variableId) {
      setResponseCondition(messageId, option.id, { variableId, requiredValue });
    } else {
      setResponseCondition(messageId, option.id, null);
    }
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "group relative flex items-center gap-2 rounded-lg bg-secondary/30 p-2",
          isPendingSource && "ring-2 ring-primary animate-pulse"
        )}
      >
        <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary shrink-0">
          {index + 1}
        </div>
        
        <Input
          value={option.text}
          onChange={(e) => updateResponseOption(messageId, option.id, e.target.value)}
          placeholder="Response text..."
          tabIndex={internalTabIndex}
          className="flex-1 h-7 text-xs rounded-md border-border/30 bg-card nodrag"
        />

        {/* Variable indicators */}
        {option.setsVariable && variables[option.setsVariable.variableId] && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-0.5 text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded font-medium">
                <Zap className="h-2.5 w-2.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Sets: {variables[option.setsVariable.variableId].name} = {option.setsVariable.value ? "true" : "false"}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {option.condition && variables[option.condition.variableId] && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-0.5 text-[10px] bg-info/20 text-info px-1.5 py-0.5 rounded font-medium">
                <Eye className="h-2.5 w-2.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Requires: {variables[option.condition.variableId].name} = {option.condition.requiredValue ? "true" : "false"}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Variable configuration popover */}
        {variableList.length > 0 && (
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    tabIndex={internalTabIndex}
                    className={cn(
                      "h-6 w-6 rounded text-muted-foreground hover:text-foreground",
                      (option.setsVariable || option.condition) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  >
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
                      onValueChange={(val) => handleSetVariable(val === "none" ? null : val, true)}
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {variableList.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {option.setsVariable && (
                      <Select
                        value={option.setsVariable.value ? "true" : "false"}
                        onValueChange={(val) => handleSetVariable(option.setsVariable!.variableId, val === "true")}
                      >
                        <SelectTrigger className="h-8 text-xs w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">true</SelectItem>
                          <SelectItem value="false">false</SelectItem>
                        </SelectContent>
                      </Select>
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
                      onValueChange={(val) => handleSetCondition(val === "none" ? null : val, true)}
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
                    {option.condition && (
                      <Select
                        value={option.condition.requiredValue ? "true" : "false"}
                        onValueChange={(val) => handleSetCondition(option.condition!.variableId, val === "true")}
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
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Link button (only when not connected) */}
        {!option.nextMessageId && !isConnecting && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startConnection(messageId, option.id)}
                tabIndex={internalTabIndex}
                className="h-6 w-6 rounded text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label={`Link "${option.text || 'response'}" to another message`}
              >
                <Link2 className="h-3 w-3" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Press Enter to start linking, then Tab to target message</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Unlink button (only when connected) */}
        {option.nextMessageId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => disconnectOption(messageId, option.id)}
                tabIndex={internalTabIndex}
                className="h-6 w-6 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
              >
                <Unlink className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Disconnect</p>
            </TooltipContent>
          </Tooltip>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteResponseOption(messageId, option.id)}
          tabIndex={internalTabIndex}
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
    </TooltipProvider>
  );
}
