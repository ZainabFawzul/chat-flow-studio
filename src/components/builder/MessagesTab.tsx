import { useScenario } from "@/context/ScenarioContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
      <div className="flex items-center justify-between border-b border-border px-md py-sm">
        <h2 className="text-heading-md text-foreground">Message Tree</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-md">
          {!rootMessage ? (
            <div className="flex flex-col items-center justify-center gap-md rounded-lg border-2 border-dashed border-border p-xl text-center">
              <p className="text-body text-muted-foreground">
                Start by adding the first message from your contact.
              </p>
              <Button onClick={handleAddFirstMessage} className="gap-xs">
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
