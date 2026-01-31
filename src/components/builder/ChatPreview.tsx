import { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Phone, MoreVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BubbleBorderRadius } from "@/types/scenario";

const DEFAULT_SENDER_RADIUS: BubbleBorderRadius = { topLeft: 16, topRight: 4, bottomRight: 16, bottomLeft: 16 };
const DEFAULT_RECEIVER_RADIUS: BubbleBorderRadius = { topLeft: 4, topRight: 16, bottomRight: 16, bottomLeft: 16 };

interface ChatBubble {
  id: string;
  content: string;
  isUser: boolean;
}

export function ChatPreview() {
  const { scenario } = useScenario();
  const { theme, messages, rootMessageId } = scenario;
  
  // Fallback for legacy scenarios without border radius
  const senderRadius = theme.senderBorderRadius ?? DEFAULT_SENDER_RADIUS;
  const receiverRadius = theme.receiverBorderRadius ?? DEFAULT_RECEIVER_RADIUS;

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
      {/* Chat Header - Modern messaging app style */}
      <header className="flex items-center gap-4 border-b border-border/30 bg-card/90 backdrop-blur-xl px-5 py-3.5">
        <Avatar className="h-11 w-11 ring-2 ring-border/50 ring-offset-2 ring-offset-card">
          {theme.contactAvatar && (
            <AvatarImage src={theme.contactAvatar} alt={theme.contactName} />
          )}
          <AvatarFallback
            className="text-sm font-semibold"
            style={{
              background: `linear-gradient(135deg, hsl(${theme.senderBubbleColor}), hsl(${theme.senderBubbleColor} / 0.7))`,
              color: `hsl(${theme.senderTextColor})`,
            }}
          >
            {getInitials(theme.contactName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">{theme.contactName}</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className={cn(
              "inline-block h-2 w-2 rounded-full",
              isPlaying ? "bg-success animate-pulse" : "bg-muted-foreground/30"
            )} />
            {isPlaying ? "Active now" : "Preview mode"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset} 
              className="gap-2 rounded-xl border-border/50 hover:bg-secondary/80"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleStart}
              disabled={!rootMessage}
              className="gap-2 rounded-xl shadow-lg shadow-primary/25"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Preview
            </Button>
          )}
        </div>
      </header>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-5 py-4">
        {!isPlaying ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary/50 mx-auto mb-4">
                <Play className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {rootMessage ? "Ready to Preview" : "No Messages Yet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {rootMessage 
                  ? "Click Preview to test your conversation flow"
                  : "Add messages in the Messages tab to get started"
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4" role="log" aria-label="Chat messages">
            {chatHistory.map((bubble, index) => (
              <div
                key={bubble.id}
                className={cn(
                  "flex animate-fade-in",
                  bubble.isUser ? "justify-end" : "justify-start"
                )}
              >
                {!bubble.isUser && (
                  <Avatar className="mr-3 h-8 w-8 shrink-0 ring-1 ring-border/30">
                    {theme.contactAvatar && (
                      <AvatarImage src={theme.contactAvatar} alt={theme.contactName} />
                    )}
                    <AvatarFallback
                      className="text-xs font-semibold"
                      style={{
                        background: `linear-gradient(135deg, hsl(${theme.senderBubbleColor}), hsl(${theme.senderBubbleColor} / 0.7))`,
                        color: `hsl(${theme.senderTextColor})`,
                      }}
                    >
                      {getInitials(theme.contactName)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className="max-w-[75%] px-4 py-2.5 shadow-sm"
                  style={{
                    backgroundColor: bubble.isUser
                      ? `hsl(${theme.senderBubbleColor})`
                      : `hsl(${theme.receiverBubbleColor})`,
                    color: bubble.isUser
                      ? `hsl(${theme.senderTextColor})`
                      : `hsl(${theme.receiverTextColor})`,
                    borderTopLeftRadius: `${bubble.isUser ? senderRadius.topLeft : receiverRadius.topLeft}px`,
                    borderTopRightRadius: `${bubble.isUser ? senderRadius.topRight : receiverRadius.topRight}px`,
                    borderBottomRightRadius: `${bubble.isUser ? senderRadius.bottomRight : receiverRadius.bottomRight}px`,
                    borderBottomLeftRadius: `${bubble.isUser ? senderRadius.bottomLeft : receiverRadius.bottomLeft}px`,
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
              <div className="flex justify-center pt-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-success/15 px-4 py-2 text-sm font-medium text-success">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  {isConversationEnded ? "Conversation Complete" : "End of Branch"}
                </span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Response Options */}
      {isPlaying && currentMessage && !currentMessage.isEndpoint && (
        <div className="border-t border-border/30 bg-card/90 backdrop-blur-xl p-4" role="group" aria-label="Response options">
          <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Choose a response
          </p>
          <div className="flex flex-wrap gap-2">
            {currentMessage.responseOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                size="sm"
                onClick={() => handleSelectOption(option.id, option.text)}
                className="rounded-xl border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
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
