import { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleLeft, Plus, Trash2, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
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
import { cn } from "@/lib/utils";

export function VariablesPanel() {
  const { scenario, addVariable, updateVariable, deleteVariable } = useScenario();
  const [newVariableName, setNewVariableName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const variables = Object.values(scenario.variables || {});

  const handleAddVariable = () => {
    if (newVariableName.trim()) {
      addVariable(newVariableName.trim());
      setNewVariableName("");
    }
  };

  const handleStartEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      updateVariable(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // Check if a variable is in use
  const isVariableInUse = (variableId: string) => {
    return Object.values(scenario.messages).some((msg) => {
      if (msg.condition?.variableId === variableId) return true;
      return msg.responseOptions.some(
        (opt) =>
          opt.condition?.variableId === variableId ||
          opt.setsVariable?.variableId === variableId
      );
    });
  };

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-lg h-9 px-3 text-muted-foreground hover:text-foreground"
            >
              <ToggleLeft className="h-4 w-4" />
              Variables
              {variables.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/20 text-primary text-xs px-1.5 py-0.5 font-medium">
                  {variables.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Manage conditional variables</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Conditional Variables</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Boolean flags that control response visibility
          </p>
        </div>

        <div className="max-h-[240px] overflow-y-auto p-2 space-y-1">
          {variables.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No variables yet
            </div>
          )}
          
          {variables.map((variable) => {
            const inUse = isVariableInUse(variable.id);
            
            return (
              <div
                key={variable.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg p-2 hover:bg-secondary/50 transition-colors",
                  editingId === variable.id && "bg-secondary/50"
                )}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary shrink-0">
                  <ToggleLeft className="h-3 w-3" />
                </div>

                {editingId === variable.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-7 text-xs flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={handleSaveEdit}
                    >
                      ✓
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span
                      className="flex-1 text-sm font-mono cursor-pointer hover:text-primary"
                      onClick={() => handleStartEditing(variable.id, variable.name)}
                    >
                      {variable.name}
                    </span>

                    {inUse && (
                      <span className="text-[10px] text-muted-foreground">in use</span>
                    )}

                    {inUse ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete variable in use?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This variable is referenced by responses or messages. Deleting it will remove all conditions and assignments using it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteVariable(variable.id)}
                              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteVariable(variable.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Input
              value={newVariableName}
              onChange={(e) => setNewVariableName(e.target.value)}
              placeholder="New variable name..."
              className="flex-1 h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddVariable();
                }
              }}
            />
            <Button
              variant="default"
              size="sm"
              onClick={handleAddVariable}
              disabled={!newVariableName.trim()}
              className="h-8 px-3 rounded-lg"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
