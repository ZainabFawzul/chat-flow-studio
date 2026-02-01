/**
 * @file scenario.ts
 * @description TypeScript type definitions for scenario data structures including ChatMessage,
 *              ChatTheme, ResponseOption, ScenarioVariable, and factory functions
 * 
 * @dependencies None (pure types)
 * @usage Imported throughout the app for type safety
 */

// Core types for the Chat Scenario Builder
export interface NodePosition {
  x: number;
  y: number;
}

// Variable types for conditional logic
export type VariableType = "boolean" | "text" | "number";

export type VariableValue = boolean | string | number;

export interface ScenarioVariable {
  id: string;
  name: string;
  type: VariableType;
  defaultValue: VariableValue;
}

export interface VariableCondition {
  variableId: string;
  requiredValue: VariableValue;
}

export interface VariableAssignment {
  variableId: string;
  value: VariableValue;
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

export interface BubbleBorderRadius {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

export interface ChatTheme {
  contactName: string;
  contactAvatar: string | null; // Base64 image or null for initials
  avatarBackgroundColor: string; // HSL for avatar background when using initials
  avatarTextColor: string; // HSL for avatar text/initials
  senderBubbleColor: string;
  senderTextColor: string;
  senderBorderRadius: BubbleBorderRadius;
  receiverBubbleColor: string;
  receiverTextColor: string;
  receiverBorderRadius: BubbleBorderRadius;
  chatBackground: string;
  fontSize: number; // in pixels
  fontFamily: string;
  // Start screen customization
  startScreenTitle: string;
  startScreenSubtitle: string;
  startButtonText: string;
  startButtonColor: string;
  startButtonTextColor: string;
  startButtonBorderRadius: number; // 0-24px
  // Response panel customization
  responsePanelBackground: string;
  responsePanelLabelText: string;
  responsePanelLabelColor: string;
  responseOptionBackground: string;
  responseOptionTextColor: string;
  responseOptionBorderRadius: number;
  // Controls
  showResetButton: boolean;
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
export const DEFAULT_BORDER_RADIUS: BubbleBorderRadius = {
  topLeft: 16,
  topRight: 16,
  bottomRight: 16,
  bottomLeft: 16,
};

export const DEFAULT_THEME: ChatTheme = {
  contactName: "Contact",
  contactAvatar: null,
  avatarBackgroundColor: "221 83% 40%", // Dark blue - WCAG AA compliant with white (7.5:1)
  avatarTextColor: "0 0% 100%", // White
  senderBubbleColor: "221 83% 40%", // Dark blue - WCAG AA compliant with white (7.5:1)
  senderTextColor: "0 0% 100%",
  senderBorderRadius: { topLeft: 16, topRight: 4, bottomRight: 16, bottomLeft: 16 },
  receiverBubbleColor: "40 14% 94%", // Secondary gray
  receiverTextColor: "222 47% 11%", // Dark foreground - WCAG AA compliant (12:1)
  receiverBorderRadius: { topLeft: 4, topRight: 16, bottomRight: 16, bottomLeft: 16 },
  chatBackground: "40 23% 97%", // Background
  fontSize: 14,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', sans-serif",
  // Start screen customization
  startScreenTitle: "Ready to Start",
  startScreenSubtitle: "Begin the conversation",
  startButtonText: "Start",
  startButtonColor: "221 83% 40%", // Dark blue - WCAG AA compliant with white (7.5:1)
  startButtonTextColor: "0 0% 100%", // White
  startButtonBorderRadius: 12,
  // Response panel customization
  responsePanelBackground: "0 0% 100%", // White
  responsePanelLabelText: "Choose a response",
  responsePanelLabelColor: "220 9% 35%", // Darker muted - WCAG AA compliant (7:1)
  responseOptionBackground: "0 0% 100%", // White
  responseOptionTextColor: "222 47% 11%", // Dark foreground - WCAG AA compliant
  responseOptionBorderRadius: 12,
  // Controls
  showResetButton: true,
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

const getDefaultValueForType = (type: VariableType): VariableValue => {
  switch (type) {
    case "text": return "";
    case "number": return 0;
    default: return false;
  }
};

export const createVariable = (name: string, type: VariableType = "boolean"): ScenarioVariable => ({
  id: crypto.randomUUID(),
  name,
  type,
  defaultValue: getDefaultValueForType(type),
});
