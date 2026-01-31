/**
 * @file MessagesTab.tsx
 * @description Tree-based message editing view as an alternative to the canvas.
 *              Displays recursive message tree with nested response options.
 * 
 * @dependencies ScenarioContext, MessageNode, UI components
 * @usage Alternative view for editing conversation structure (currently unused in LeftPanel)
 */

import { useScenario } from "@/context/ScenarioContext";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquarePlus, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageNode } from "./MessageNode";

export function MessagesTab() {
  const { scenario, addRootMessage } = useScenario();
  const { messages, rootMessageId } = scenario;

  const handleAddFirstMessage = () => {
    addRootMessage("Hello! How can I help you today?");
  };

  const rootMessage = rootMessageId ? messages[rootMessageId] : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Conversation Flow</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Build your branching dialogue</p>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          {!rootMessage ? (
            <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed border-border/50 bg-secondary/20 p-10 text-center transition-colors hover:border-primary/30 hover:bg-primary/5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
                <MessageSquarePlus className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Start Your Scenario</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Add the first message from your contact to begin building the conversation.
                </p>
              </div>
              <Button onClick={handleAddFirstMessage} className="gap-2 rounded-xl shadow-lg shadow-primary/25 h-11 px-6">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add First Message
              </Button>
            </div>
          ) : (
            <div className="message-tree" role="tree" aria-label="Conversation message tree">
              <MessageNode messageId={rootMessageId} depth={0} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
