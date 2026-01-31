import { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, ChevronLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatBubble {
  id: string;
  content: string;
  isUser: boolean;
}

export function ChatPreview() {
  const { scenario } = useScenario();
  const { theme, messages, rootMessageId } = scenario;

  const [chatHistory, setChatHistory] = useState<ChatBubble[]>([]);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentMessage = currentMessageId ? messages[currentMessageId] : null;
  const rootMessage = rootMessageId ? messages[rootMessageId] : null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStart = () => {
    if (!rootMessageId || !rootMessage) return;
    
    setIsPlaying(true);
    setChatHistory([
      {
        id: rootMessageId,
        content: rootMessage.content,
        isUser: false,
      },
    ]);
    setCurrentMessageId(rootMessageId);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setChatHistory([]);
    setCurrentMessageId(null);
  };

  const handleSelectOption = (optionId: string, optionText: string) => {
    if (!currentMessage) return;

    const option = currentMessage.responseOptions.find((o) => o.id === optionId);
    if (!option) return;

    // Add user's response to history
    const newHistory: ChatBubble[] = [
      ...chatHistory,
      {
        id: `user-${optionId}`,
        content: optionText,
        isUser: true,
      },
    ];

    // If there's a follow-up message, add it
    if (option.nextMessageId) {
      const nextMessage = messages[option.nextMessageId];
      if (nextMessage) {
        newHistory.push({
          id: option.nextMessageId,
          content: nextMessage.content,
          isUser: false,
        });
        setCurrentMessageId(option.nextMessageId);
      }
    } else {
      // End of conversation path
      setCurrentMessageId(null);
    }

    setChatHistory(newHistory);
  };

  const isConversationEnded =
    isPlaying &&
    currentMessage &&
    (currentMessage.isEndpoint || currentMessage.responseOptions.length === 0);

  const isDeadEnd =
    isPlaying &&
    !currentMessageId &&
    chatHistory.length > 0;

  return (
    <div
      className="flex h-full flex-col"
      style={{
        backgroundColor: `hsl(${theme.chatBackground})`,
        fontFamily: theme.fontFamily,
        fontSize: `${theme.fontSize}px`,
      }}
    >
      {/* Chat Header */}
      <header className="flex items-center gap-md border-b border-border bg-card px-md py-sm">
        <Avatar className="h-10 w-10">
          {theme.contactAvatar && (
            <AvatarImage src={theme.contactAvatar} alt={theme.contactName} />
          )}
          <AvatarFallback
            className="text-small"
            style={{
              backgroundColor: `hsl(${theme.senderBubbleColor})`,
              color: `hsl(${theme.senderTextColor})`,
            }}
          >
            {getInitials(theme.contactName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">{theme.contactName}</h2>
          <p className="text-small text-muted-foreground">
            {isPlaying ? "Online" : "Preview"}
          </p>
        </div>
        <div className="flex items-center gap-xs">
          {isPlaying ? (
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-xs">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleStart}
              disabled={!rootMessage}
              className="gap-xs"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Start Preview
            </Button>
          )}
        </div>
      </header>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-md">
        {!isPlaying ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              {rootMessage ? (
                <p>Click "Start Preview" to test your scenario</p>
              ) : (
                <p>Add messages in the Messages tab to see a preview</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-md" role="log" aria-label="Chat messages">
            {chatHistory.map((bubble, index) => (
              <div
                key={bubble.id}
                className={cn(
                  "flex animate-fade-in",
                  bubble.isUser ? "justify-end" : "justify-start"
                )}
              >
                {!bubble.isUser && (
                  <Avatar className="mr-sm h-8 w-8 shrink-0">
                    {theme.contactAvatar && (
                      <AvatarImage src={theme.contactAvatar} alt={theme.contactName} />
                    )}
                    <AvatarFallback
                      className="text-small"
                      style={{
                        backgroundColor: `hsl(${theme.senderBubbleColor})`,
                        color: `hsl(${theme.senderTextColor})`,
                      }}
                    >
                      {getInitials(theme.contactName)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-md py-sm",
                    bubble.isUser ? "rounded-tr-sm" : "rounded-tl-sm"
                  )}
                  style={{
                    backgroundColor: bubble.isUser
                      ? `hsl(${theme.senderBubbleColor})`
                      : `hsl(${theme.receiverBubbleColor})`,
                    color: bubble.isUser
                      ? `hsl(${theme.senderTextColor})`
                      : `hsl(${theme.receiverTextColor})`,
                  }}
                >
                  {bubble.content || (
                    <span className="italic opacity-60">Empty message</span>
                  )}
                </div>
              </div>
            ))}

            {/* End state messages */}
            {(isConversationEnded || isDeadEnd) && (
              <div className="mt-lg text-center">
                <span className="inline-block rounded-full bg-success/20 px-md py-xs text-small text-success-foreground">
                  {isConversationEnded ? "Conversation Complete" : "End of Branch"}
                </span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Response Options */}
      {isPlaying && currentMessage && !currentMessage.isEndpoint && (
        <div className="border-t border-border bg-card p-md" role="group" aria-label="Response options">
          <p className="mb-sm text-small text-muted-foreground">Choose a response:</p>
          <div className="flex flex-wrap gap-sm">
            {currentMessage.responseOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                size="sm"
                onClick={() => handleSelectOption(option.id, option.text)}
                className="text-body"
                disabled={!option.text}
              >
                {option.text || "Empty option"}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
