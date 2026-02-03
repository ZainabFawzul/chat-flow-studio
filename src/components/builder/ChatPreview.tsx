/**
 * @file ChatPreview.tsx
 * @description Live chat preview panel showing conversation simulation with typing indicators,
 *              themed message bubbles, and interactive response selection
 * 
 * @dependencies ScenarioContext, scenario types, UI components
 * @usage Rendered in BuilderLayout right panel
 */

import { useState, useEffect, useRef } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { BubbleBorderRadius } from "@/types/scenario";

const DEFAULT_SENDER_RADIUS: BubbleBorderRadius = { topLeft: 16, topRight: 4, bottomRight: 16, bottomLeft: 16 };
const DEFAULT_RECEIVER_RADIUS: BubbleBorderRadius = { topLeft: 4, topRight: 16, bottomRight: 16, bottomLeft: 16 };

interface ChatBubble {
  id: string;
  content: string;
  isUser: boolean;
}

function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span 
        className="w-2 h-2 rounded-full animate-bounce"
        style={{ 
          backgroundColor: color,
          animationDelay: "0ms",
          animationDuration: "600ms"
        }}
      />
      <span 
        className="w-2 h-2 rounded-full animate-bounce"
        style={{ 
          backgroundColor: color,
          animationDelay: "150ms",
          animationDuration: "600ms"
        }}
      />
      <span 
        className="w-2 h-2 rounded-full animate-bounce"
        style={{ 
          backgroundColor: color,
          animationDelay: "300ms",
          animationDuration: "600ms"
        }}
      />
    </div>
  );
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
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentMessage = currentMessageId ? messages[currentMessageId] : null;
  const rootMessage = rootMessageId ? messages[rootMessageId] : null;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const addContactMessage = (messageId: string, content: string, callback?: () => void) => {
    const isRegular = (theme.conversationType ?? 'chat') === 'regular';
    
    if (isRegular) {
      // In regular mode, show message immediately without typing indicator
      setChatHistory(prev => [...prev, { id: messageId, content, isUser: false }]);
      callback?.();
    } else {
      // In chat mode, show typing indicator first
      setTypingMessageId(messageId);
      
      // After delay, show actual message
      typingTimeoutRef.current = setTimeout(() => {
        setChatHistory(prev => [...prev, { id: messageId, content, isUser: false }]);
        setTypingMessageId(null);
        callback?.();
      }, 1000);
    }
  };

  const handleStart = () => {
    if (!rootMessageId || !rootMessage) return;
    
    setIsPlaying(true);
    setChatHistory([]);
    setCurrentMessageId(rootMessageId);
    
    // Show typing indicator, then the first message
    addContactMessage(rootMessageId, rootMessage.content);
  };

  const handleReset = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsPlaying(false);
    setChatHistory([]);
    setCurrentMessageId(null);
    setTypingMessageId(null);
  };

  const handleSelectOption = (optionId: string, optionText: string) => {
    if (!currentMessage) return;

    const option = currentMessage.responseOptions.find((o) => o.id === optionId);
    if (!option) return;

    // Add user's response to history immediately
    setChatHistory(prev => [
      ...prev,
      {
        id: `user-${optionId}`,
        content: optionText,
        isUser: true,
      },
    ]);

    // If there's a follow-up message, show typing then message
    if (option.nextMessageId) {
      const nextMessage = messages[option.nextMessageId];
      if (nextMessage) {
        setCurrentMessageId(option.nextMessageId);
        addContactMessage(option.nextMessageId, nextMessage.content);
      } else {
        setCurrentMessageId(null);
      }
    } else {
      // End of conversation path
      setCurrentMessageId(null);
    }
  };

  const isConversationEnded =
    isPlaying &&
    currentMessage &&
    (currentMessage.isEndpoint || currentMessage.responseOptions.length === 0) &&
    !typingMessageId;

  const isDeadEnd =
    isPlaying &&
    !currentMessageId &&
    chatHistory.length > 0 &&
    !typingMessageId;

  // Start screen text with fallbacks
  const startTitle = theme.startScreenTitle ?? "Ready to Start";
  const startSubtitle = theme.startScreenSubtitle ?? "Begin the conversation";
  const startButtonText = theme.startButtonText ?? "Start";
  const showResetButton = theme.showResetButton ?? true;
  const isRegularMode = (theme.conversationType ?? 'chat') === 'regular';

  // Frame styling with fallbacks
  const frameBorderRadius = theme.frameBorderRadius ?? 16;
  const frameBorderWidth = theme.frameBorderWidth ?? 1;
  const frameBorderColor = theme.frameBorderColor ?? "220 13% 91%";

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{
        backgroundColor: `hsl(${theme.chatBackground})`,
        fontFamily: theme.fontFamily,
        fontSize: `${theme.fontSize}px`,
        borderRadius: `${frameBorderRadius}px`,
        border: frameBorderWidth > 0 ? `${frameBorderWidth}px solid hsl(${frameBorderColor})` : 'none',
      }}
    >
      {/* Chat Header - Only show in chat mode */}
      {!isRegularMode && (
        <header className="flex items-center gap-4 border-b border-border/30 bg-card/90 backdrop-blur-xl px-5 py-3.5">
          <Avatar className="h-11 w-11 ring-2 ring-border/50 ring-offset-2 ring-offset-card">
            {theme.contactAvatar && (
              <AvatarImage src={theme.contactAvatar} alt={theme.contactName} />
            )}
            <AvatarFallback
              className="text-sm font-semibold"
              style={{
                background: `linear-gradient(135deg, hsl(${theme.avatarBackgroundColor ?? '214 100% 65%'}), hsl(${theme.avatarBackgroundColor ?? '214 100% 65%'} / 0.7))`,
                color: `hsl(${theme.avatarTextColor ?? '0 0% 100%'})`,
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
              showResetButton && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset} 
                  className="gap-2 rounded-xl border-border/50 hover:bg-secondary/80"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </Button>
              )
            ) : null}
          </div>
        </header>
      )}

      {/* Minimal header for regular mode - just reset button when playing */}
      {isRegularMode && isPlaying && showResetButton && (
        <div className="flex justify-end p-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset} 
            className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </Button>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!isPlaying ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-sm">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {startTitle}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {startSubtitle}
              </p>
              <button
                onClick={rootMessage ? handleStart : undefined}
                disabled={!rootMessage}
                className="inline-flex items-center gap-2 px-5 py-2.5 font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: `hsl(${theme.startButtonColor ?? '214 100% 65%'})`,
                  color: `hsl(${theme.startButtonTextColor ?? '0 0% 100%'})`,
                  borderRadius: `${theme.startButtonBorderRadius ?? 12}px`,
                  boxShadow: `0 4px 12px hsl(${theme.startButtonColor ?? '214 100% 65%'} / 0.25)`,
                }}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                {startButtonText}
              </button>
              {!rootMessage && (
                <p className="text-xs text-muted-foreground mt-4">
                  Add messages to enable the start button
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4" role="log" aria-label="Chat messages">
            {chatHistory.map((bubble) => (
              <div
                key={bubble.id}
                className={cn(
                  "flex animate-fade-in",
                  bubble.isUser ? "justify-end" : "justify-start"
                )}
              >
                {!bubble.isUser && !isRegularMode && (
                  <Avatar className="mr-3 h-8 w-8 shrink-0 ring-1 ring-border/30">
                    {theme.contactAvatar && (
                      <AvatarImage src={theme.contactAvatar} alt={theme.contactName} />
                    )}
                    <AvatarFallback
                      className="text-xs font-semibold"
                      style={{
                        background: `linear-gradient(135deg, hsl(${theme.avatarBackgroundColor ?? '214 100% 65%'}), hsl(${theme.avatarBackgroundColor ?? '214 100% 65%'} / 0.7))`,
                        color: `hsl(${theme.avatarTextColor ?? '0 0% 100%'})`,
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

            {/* Typing indicator */}
            {typingMessageId && (
              <div className="flex justify-start animate-fade-in">
                <Avatar className="mr-3 h-8 w-8 shrink-0 ring-1 ring-border/30">
                  {theme.contactAvatar && (
                    <AvatarImage src={theme.contactAvatar} alt={theme.contactName} />
                  )}
                  <AvatarFallback
                    className="text-xs font-semibold"
                    style={{
                      background: `linear-gradient(135deg, hsl(${theme.avatarBackgroundColor ?? '214 100% 65%'}), hsl(${theme.avatarBackgroundColor ?? '214 100% 65%'} / 0.7))`,
                      color: `hsl(${theme.avatarTextColor ?? '0 0% 100%'})`,
                    }}
                  >
                    {getInitials(theme.contactName)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="shadow-sm"
                  style={{
                    backgroundColor: `hsl(${theme.receiverBubbleColor})`,
                    borderTopLeftRadius: `${receiverRadius.topLeft}px`,
                    borderTopRightRadius: `${receiverRadius.topRight}px`,
                    borderBottomRightRadius: `${receiverRadius.bottomRight}px`,
                    borderBottomLeftRadius: `${receiverRadius.bottomLeft}px`,
                  }}
                >
                  <TypingIndicator color={`hsl(${theme.receiverTextColor} / 0.5)`} />
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Response Options */}
      {isPlaying && currentMessage && !currentMessage.isEndpoint && !typingMessageId && (
        <div 
          className="border-t border-border/30 backdrop-blur-xl p-4" 
          role="group" 
          aria-label="Response options"
          style={{
            backgroundColor: `hsl(${theme.responsePanelBackground ?? '0 0% 100%'})`,
          }}
        >
          <p 
            className="mb-3 text-xs font-medium uppercase tracking-wide"
            style={{ color: `hsl(${theme.responsePanelLabelColor ?? '220 9% 46%'})` }}
          >
            {theme.responsePanelLabelText ?? "Choose a response"}
          </p>
          <div className="flex flex-wrap gap-2">
            {currentMessage.responseOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id, option.text)}
                disabled={!option.text}
                className="px-3 py-1.5 text-sm font-medium border border-border/50 hover:opacity-80 transition-all disabled:opacity-50"
                style={{
                  backgroundColor: `hsl(${theme.responseOptionBackground ?? '0 0% 100%'})`,
                  color: `hsl(${theme.responseOptionTextColor ?? '220 9% 20%'})`,
                  borderRadius: `${theme.responseOptionBorderRadius ?? 12}px`,
                }}
              >
                {option.text || "Empty option"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
