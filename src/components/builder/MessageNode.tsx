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
        depth > 0 && "ml-lg pl-md border-l-2 border-border"
      )}
      role="treeitem"
      aria-expanded={isOpen}
      aria-level={depth + 1}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="group mb-sm rounded-lg border border-border bg-card p-md transition-shadow hover:shadow-sm">
          {/* Message Header */}
          <div className="mb-sm flex items-start justify-between gap-sm">
            <div className="flex items-center gap-xs">
              {(message.responseOptions.length > 0 || hasChildren) && (
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
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
              <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-small font-medium text-muted-foreground">
                Contact Message
              </span>
            </div>

            <div className="flex items-center gap-xs opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant={message.isEndpoint ? "secondary" : "ghost"}
                size="sm"
                onClick={() => toggleEndpoint(messageId)}
                className="gap-xs text-small"
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
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      aria-label="Delete message"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will also delete all response options and follow-up
                        messages in this branch. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMessage(messageId)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
            className="min-h-[60px] resize-none"
            aria-label="Message content"
          />

          {/* Status indicators */}
          <div className="mt-xs flex items-center gap-sm">
            {message.isEndpoint && (
              <span className="inline-flex items-center gap-xs rounded-full bg-success/20 px-sm py-xs text-small text-success-foreground">
                <Flag className="h-3 w-3" aria-hidden="true" />
                Conversation End
              </span>
            )}
            {!isComplete && (
              <span className="inline-flex items-center gap-xs rounded-full bg-warning/20 px-sm py-xs text-small text-warning-foreground">
                Needs response options
              </span>
            )}
          </div>
        </div>

        {/* Response Options */}
        {!message.isEndpoint && (
          <CollapsibleContent>
            <div className="mb-sm ml-lg space-y-sm">
              {message.responseOptions.map((option, index) => (
                <div
                  key={option.id}
                  className="group/option rounded-lg border border-border bg-secondary/50 p-sm"
                >
                  <div className="flex items-center gap-sm">
                    <GripVertical
                      className="h-4 w-4 cursor-grab text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="text-small font-medium text-primary">
                      Option {index + 1}:
                    </span>
                    <Input
                      value={option.text}
                      onChange={(e) =>
                        updateResponseOption(messageId, option.id, e.target.value)
                      }
                      placeholder="Enter response text..."
                      className="flex-1 h-8 text-body"
                      aria-label={`Response option ${index + 1}`}
                    />

                    <div className="flex items-center gap-xs opacity-0 transition-opacity group-hover/option:opacity-100">
                      {!option.nextMessageId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddFollowUp(option.id)}
                          className="gap-xs text-small"
                        >
                          <Plus className="h-3 w-3" aria-hidden="true" />
                          Add Follow-up
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            aria-label="Delete option"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this option?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will also delete any follow-up messages attached
                              to this option.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteResponseOption(messageId, option.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                    <div className="mt-sm">
                      <MessageNode
                        messageId={option.nextMessageId}
                        depth={depth + 1}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Add new option */}
              <div className="flex items-center gap-sm rounded-lg border border-dashed border-border p-sm">
                <Input
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  placeholder="Type a new response option..."
                  className="flex-1 h-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  aria-label="New response option"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={!newOptionText.trim()}
                  className="gap-xs"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  Add Option
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}
