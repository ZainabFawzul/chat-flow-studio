import { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Flag,
  MessageSquare,
  GripVertical,
  CornerDownRight,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

interface MessageNodeProps {
  messageId: string;
  depth: number;
}

export function MessageNode({ messageId, depth }: MessageNodeProps) {
  const {
    scenario,
    updateMessage,
    deleteMessage,
    toggleEndpoint,
    addResponseOption,
    updateResponseOption,
    deleteResponseOption,
    addFollowUpMessage,
  } = useScenario();

  const message = scenario.messages[messageId];
  const [isOpen, setIsOpen] = useState(true);
  const [newOptionText, setNewOptionText] = useState("");

  if (!message) return null;

  const hasChildren = message.responseOptions.some((opt) => opt.nextMessageId);
  const isComplete = message.isEndpoint || message.responseOptions.length > 0;

  const handleAddOption = () => {
    if (newOptionText.trim()) {
      addResponseOption(messageId, newOptionText.trim());
      setNewOptionText("");
    }
  };

  const handleAddFollowUp = (optionId: string) => {
    addFollowUpMessage(messageId, optionId, "");
  };

  return (
    <div
      className={cn(
        "relative",
        depth > 0 && "ml-6 pl-4 border-l-2 border-border/50"
      )}
      role="treeitem"
      aria-expanded={isOpen}
      aria-level={depth + 1}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="group mb-3 rounded-2xl border border-border/50 bg-card p-4 transition-all duration-200 hover:shadow-lg hover:border-border">
          {/* Message Header */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {(message.responseOptions.length > 0 || hasChildren) && (
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-secondary/80"
                    aria-label={isOpen ? "Collapse" : "Expand"}
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Contact Message
              </span>
            </div>

            <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant={message.isEndpoint ? "secondary" : "ghost"}
                size="sm"
                onClick={() => toggleEndpoint(messageId)}
                className={cn(
                  "gap-1.5 text-xs rounded-lg h-8",
                  message.isEndpoint && "bg-success/20 text-success-foreground hover:bg-success/30"
                )}
                aria-pressed={message.isEndpoint}
              >
                <Flag className="h-3 w-3" aria-hidden="true" />
                {message.isEndpoint ? "End" : "Mark End"}
              </Button>

              {depth > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label="Delete message"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will also delete all response options and follow-up
                        messages in this branch. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMessage(messageId)}
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

          {/* Message Content */}
          <Textarea
            value={message.content}
            onChange={(e) => updateMessage(messageId, e.target.value)}
            placeholder="Enter the contact's message..."
            className="min-h-[80px] resize-none rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors"
            aria-label="Message content"
          />

          {/* Status indicators */}
          <div className="mt-3 flex items-center gap-2">
            {message.isEndpoint && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
                <Flag className="h-3 w-3" aria-hidden="true" />
                Conversation End
              </span>
            )}
            {!isComplete && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning">
                Add response options
              </span>
            )}
          </div>
        </div>

        {/* Response Options */}
        {!message.isEndpoint && (
          <CollapsibleContent>
            <div className="mb-3 ml-6 space-y-2">
              {message.responseOptions.map((option, index) => (
                <div
                  key={option.id}
                  className="group/option rounded-xl border border-border/30 bg-secondary/30 p-3 transition-all hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary shrink-0">
                      {index + 1}
                    </div>
                    <CornerDownRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <Input
                      value={option.text}
                      onChange={(e) =>
                        updateResponseOption(messageId, option.id, e.target.value)
                      }
                      placeholder="Enter response text..."
                      className="flex-1 h-9 rounded-lg border-border/50 bg-card text-sm"
                      aria-label={`Response option ${index + 1}`}
                    />

                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/option:opacity-100">
                      {!option.nextMessageId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddFollowUp(option.id)}
                          className="gap-1.5 text-xs rounded-lg h-8 hover:bg-primary/10 hover:text-primary"
                        >
                          <Plus className="h-3 w-3" aria-hidden="true" />
                          Follow-up
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            aria-label="Delete option"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this option?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will also delete any follow-up messages attached
                              to this option.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteResponseOption(messageId, option.id)}
                              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Nested follow-up message */}
                  {option.nextMessageId && (
                    <div className="mt-3">
                      <MessageNode
                        messageId={option.nextMessageId}
                        depth={depth + 1}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Add new option */}
              <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border/50 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5">
                <Input
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  placeholder="Type a new response option..."
                  className="flex-1 h-9 border-0 bg-transparent focus-visible:ring-0 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  aria-label="New response option"
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={!newOptionText.trim()}
                  className="gap-1.5 rounded-lg h-8 shadow-sm"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  Add
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}
