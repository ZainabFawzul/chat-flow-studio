import { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleLeft, Plus, Trash2, X, Type, Hash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { VariableType } from "@/types/scenario";
import { FloatingPanel } from "./FloatingPanel";
const VARIABLE_TYPES = [{
  id: "boolean" as const,
  label: "True/False",
  icon: ToggleLeft
}, {
  id: "text" as const,
  label: "Text",
  icon: Type
}, {
  id: "number" as const,
  label: "Number",
  icon: Hash
}];
const getVariableIcon = (type: VariableType = "boolean") => {
  switch (type) {
    case "text":
      return Type;
    case "number":
      return Hash;
    default:
      return ToggleLeft;
  }
};
interface VariablesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}
export function VariablesPanel({
  isOpen,
  onClose
}: VariablesPanelProps) {
  const {
    scenario,
    addVariable,
    updateVariable,
    deleteVariable
  } = useScenario();
  const [newVariableName, setNewVariableName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [selectedType, setSelectedType] = useState<VariableType>("boolean");
  const variables = Object.values(scenario.variables || {});
  const handleAddVariable = () => {
    if (newVariableName.trim()) {
      addVariable(newVariableName.trim(), selectedType);
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
    return Object.values(scenario.messages).some(msg => {
      if (msg.condition?.variableId === variableId) return true;
      return msg.responseOptions.some(opt => opt.condition?.variableId === variableId || opt.setsVariable?.variableId === variableId);
    });
  };
  return <FloatingPanel isOpen={isOpen} onClose={onClose} title="Variables" defaultPosition={{
    x: 80,
    y: 120
  }} width={340}>
      <div className="p-3 border-b border-border border-0">
        <p className="text-xs text-muted-foreground">Create variables to control response visibility and branching logic.</p>
      </div>

      {/* Type Selector */}
      <div className="p-3 border-b border-border border-0">
        <div className="text-xs text-muted-foreground mb-2">Variable Type</div>
        <div className="flex gap-1">
          {VARIABLE_TYPES.map(vt => <button key={vt.id} onClick={() => setSelectedType(vt.id)} className={cn("flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors", selectedType === vt.id ? "bg-primary/20 text-primary" : "hover:bg-secondary text-muted-foreground")}>
              <vt.icon className="h-3.5 w-3.5" />
              {vt.label}
            </button>)}
        </div>
      </div>

      {/* Add New Variable */}
      <div className="p-3 border-b border-border border-0">
        <div className="flex items-center gap-2">
          <Input value={newVariableName} onChange={e => setNewVariableName(e.target.value)} placeholder="New variable name..." className="flex-1 h-9 text-sm" onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAddVariable();
          }
        }} />
          <Button variant="default" size="sm" onClick={handleAddVariable} disabled={!newVariableName.trim()} className="h-9 px-4 rounded-lg">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add
          </Button>
        </div>
      </div>

      {/* Variables List */}
      <div className="p-3 pb-2">
        <div className="text-xs text-muted-foreground mb-2">Variable List</div>
      </div>
      <div className="max-h-[280px] overflow-y-auto px-2 pb-2 space-y-1">
        {variables.length === 0 && <div className="text-center py-6 text-sm text-muted-foreground">
            No variables yet
          </div>}
        
        {variables.map(variable => {
        const inUse = isVariableInUse(variable.id);
        const VariableIcon = getVariableIcon(variable.type);
        return <div key={variable.id} className={cn("group flex items-center gap-2 rounded-lg p-2 hover:bg-secondary/50 transition-colors", editingId === variable.id && "bg-secondary/50")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary shrink-0">
                    <VariableIcon className="h-3.5 w-3.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="capitalize">{variable.type}</p>
                </TooltipContent>
              </Tooltip>

              {editingId === variable.id ? <div className="flex-1 flex items-center gap-1">
                  <Input value={editingName} onChange={e => setEditingName(e.target.value)} className="h-7 text-xs flex-1" autoFocus onKeyDown={e => {
              if (e.key === "Enter") handleSaveEdit();
              if (e.key === "Escape") handleCancelEdit();
            }} />
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleSaveEdit}>
                    ✓
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCancelEdit}>
                    <X className="h-3 w-3" />
                  </Button>
                </div> : <>
                  <span className="flex-1 text-sm font-mono cursor-pointer hover:text-primary truncate" onClick={() => handleStartEditing(variable.id, variable.name)} title={variable.name}>
                    {variable.name}
                  </span>

                  {inUse && <span className="text-[10px] text-muted-foreground shrink-0">in use</span>}

                  {inUse ? <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-[#FFA2B6] hover:text-[#00178F]">
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
                          <AlertDialogAction onClick={() => deleteVariable(variable.id)} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog> : <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-[#FFA2B6] hover:text-[#00178F]" onClick={() => deleteVariable(variable.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>}
                </>}
            </div>;
      })}
      </div>
    </FloatingPanel>;
}

// Trigger button component to open the panel
interface VariablesTriggerProps {
  onClick: () => void;
  variableCount: number;
}
export function VariablesTrigger({
  onClick,
  variableCount
}: VariablesTriggerProps) {
  return <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="sm" onClick={onClick} className="gap-2 rounded-lg h-9 px-3 text-muted-foreground hover:bg-[#4B96FF] hover:text-[#00178F]">
          <ToggleLeft className="h-4 w-4" />
          Variables
          {variableCount > 0 && <span className="ml-1 rounded-full bg-primary/20 text-primary text-xs px-1.5 py-0.5 font-medium">
              {variableCount}
            </span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Manage conditional variables</p>
      </TooltipContent>
    </Tooltip>;
}