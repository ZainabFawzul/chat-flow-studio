// Core types for the Chat Scenario Builder

export interface NodePosition {
  x: number;
  y: number;
}

// Variable types for conditional logic
export interface ScenarioVariable {
  id: string;
  name: string;
  defaultValue: boolean;
}

export interface VariableCondition {
  variableId: string;
  requiredValue: boolean;
}

export interface VariableAssignment {
  variableId: string;
  value: boolean;
}

export interface ResponseOption {
  id: string;
  text: string;
  nextMessageId: string | null; // null if this is an endpoint
  setsVariable?: VariableAssignment; // When chosen, set this variable
  condition?: VariableCondition; // Only show if condition is met
}

export interface ChatMessage {
  id: string;
  content: string;
  isEndpoint: boolean;
  responseOptions: ResponseOption[];
  position: NodePosition;
  condition?: VariableCondition; // Message only shown if condition is met
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
  variables: Record<string, ScenarioVariable>; // Scenario-level variables
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
  variables: {},
  rootMessageId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createMessage = (content: string = "", position?: NodePosition): ChatMessage => ({
  id: crypto.randomUUID(),
  content,
  isEndpoint: false,
  responseOptions: [],
  position: position || { x: 100, y: 100 },
});

export const createResponseOption = (text: string = ""): ResponseOption => ({
  id: crypto.randomUUID(),
  text,
  nextMessageId: null,
});

export const createVariable = (name: string): ScenarioVariable => ({
  id: crypto.randomUUID(),
  name,
  defaultValue: false,
});
