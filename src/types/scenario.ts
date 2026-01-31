// Core types for the Chat Scenario Builder

export interface ResponseOption {
  id: string;
  text: string;
  nextMessageId: string | null; // null if this is an endpoint
}

export interface ChatMessage {
  id: string;
  content: string;
  isEndpoint: boolean;
  responseOptions: ResponseOption[];
}

export interface ChatTheme {
  contactName: string;
  contactAvatar: string | null; // Base64 image or null for initials
  senderBubbleColor: string;
  senderTextColor: string;
  receiverBubbleColor: string;
  receiverTextColor: string;
  chatBackground: string;
  fontSize: number; // in pixels
  fontFamily: string;
}

export interface ScenarioData {
  id: string;
  name: string;
  theme: ChatTheme;
  messages: Record<string, ChatMessage>;
  rootMessageId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Default values
export const DEFAULT_THEME: ChatTheme = {
  contactName: "Contact",
  contactAvatar: null,
  senderBubbleColor: "214 100% 65%", // Primary blue
  senderTextColor: "0 0% 100%",
  receiverBubbleColor: "40 14% 94%", // Secondary gray
  receiverTextColor: "230 100% 28%", // Foreground
  chatBackground: "40 23% 97%", // Background
  fontSize: 14,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', sans-serif",
};

export const createEmptyScenario = (): ScenarioData => ({
  id: crypto.randomUUID(),
  name: "Untitled Scenario",
  theme: { ...DEFAULT_THEME },
  messages: {},
  rootMessageId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createMessage = (content: string = ""): ChatMessage => ({
  id: crypto.randomUUID(),
  content,
  isEndpoint: false,
  responseOptions: [],
});

export const createResponseOption = (text: string = ""): ResponseOption => ({
  id: crypto.randomUUID(),
  text,
  nextMessageId: null,
});
