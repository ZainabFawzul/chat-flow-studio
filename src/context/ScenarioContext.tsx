import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import {
  ScenarioData,
  ChatTheme,
  ChatMessage,
  ResponseOption,
  NodePosition,
  createEmptyScenario,
  createMessage,
  createResponseOption,
} from "@/types/scenario";

// Action types
type ScenarioAction =
  | { type: "SET_SCENARIO"; payload: ScenarioData }
  | { type: "UPDATE_THEME"; payload: Partial<ChatTheme> }
  | { type: "SET_NAME"; payload: string }
  | { type: "ADD_ROOT_MESSAGE"; payload: { content: string; position: NodePosition } }
  | { type: "ADD_MESSAGE_AT_POSITION"; payload: { content: string; position: NodePosition } }
  | { type: "UPDATE_MESSAGE"; payload: { id: string; content: string } }
  | { type: "UPDATE_NODE_POSITION"; payload: { id: string; position: NodePosition } }
  | { type: "DELETE_MESSAGE"; payload: string }
  | { type: "TOGGLE_ENDPOINT"; payload: string }
  | { type: "ADD_RESPONSE_OPTION"; payload: { messageId: string; text: string } }
  | { type: "UPDATE_RESPONSE_OPTION"; payload: { messageId: string; optionId: string; text: string } }
  | { type: "DELETE_RESPONSE_OPTION"; payload: { messageId: string; optionId: string } }
  | { type: "ADD_FOLLOW_UP_MESSAGE"; payload: { parentMessageId: string; optionId: string; content: string; position: NodePosition } }
  | { type: "CONNECT_NODES"; payload: { sourceMessageId: string; optionId: string; targetMessageId: string } }
  | { type: "DISCONNECT_OPTION"; payload: { messageId: string; optionId: string } }
  | { type: "REORDER_OPTIONS"; payload: { messageId: string; fromIndex: number; toIndex: number } }
  | { type: "RESET_SCENARIO" };

// Reducer
function scenarioReducer(state: ScenarioData, action: ScenarioAction): ScenarioData {
  const now = new Date().toISOString();

  switch (action.type) {
    case "SET_SCENARIO":
      return action.payload;

    case "UPDATE_THEME":
      return {
        ...state,
        theme: { ...state.theme, ...action.payload },
        updatedAt: now,
      };

    case "SET_NAME":
      return {
        ...state,
        name: action.payload,
        updatedAt: now,
      };

    case "ADD_ROOT_MESSAGE": {
      const { content, position } = action.payload;
      const newMessage = createMessage(content, position);
      return {
        ...state,
        messages: { ...state.messages, [newMessage.id]: newMessage },
        rootMessageId: newMessage.id,
        updatedAt: now,
      };
    }

    case "ADD_MESSAGE_AT_POSITION": {
      const { content, position } = action.payload;
      const newMessage = createMessage(content, position);
      // If no root exists, make this the root
      const isRoot = !state.rootMessageId;
      return {
        ...state,
        messages: { ...state.messages, [newMessage.id]: newMessage },
        rootMessageId: isRoot ? newMessage.id : state.rootMessageId,
        updatedAt: now,
      };
    }

    case "UPDATE_NODE_POSITION": {
      const { id, position } = action.payload;
      if (!state.messages[id]) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [id]: { ...state.messages[id], position },
        },
        updatedAt: now,
      };
    }

    case "UPDATE_MESSAGE": {
      const { id, content } = action.payload;
      if (!state.messages[id]) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [id]: { ...state.messages[id], content },
        },
        updatedAt: now,
      };
    }

    case "DELETE_MESSAGE": {
      const messageId = action.payload;
      const newMessages = { ...state.messages };
      
      // Recursively delete all child messages
      const deleteRecursive = (id: string) => {
        const message = newMessages[id];
        if (message) {
          message.responseOptions.forEach((opt) => {
            if (opt.nextMessageId) {
              deleteRecursive(opt.nextMessageId);
            }
          });
          delete newMessages[id];
        }
      };
      
      deleteRecursive(messageId);
      
      // Update any parent references
      Object.values(newMessages).forEach((msg) => {
        msg.responseOptions = msg.responseOptions.map((opt) =>
          opt.nextMessageId === messageId ? { ...opt, nextMessageId: null } : opt
        );
      });
      
      return {
        ...state,
        messages: newMessages,
        rootMessageId: state.rootMessageId === messageId ? null : state.rootMessageId,
        updatedAt: now,
      };
    }

    case "TOGGLE_ENDPOINT": {
      const id = action.payload;
      if (!state.messages[id]) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [id]: { ...state.messages[id], isEndpoint: !state.messages[id].isEndpoint },
        },
        updatedAt: now,
      };
    }

    case "ADD_RESPONSE_OPTION": {
      const { messageId, text } = action.payload;
      if (!state.messages[messageId]) return state;
      const newOption = createResponseOption(text);
      return {
        ...state,
        messages: {
          ...state.messages,
          [messageId]: {
            ...state.messages[messageId],
            responseOptions: [...state.messages[messageId].responseOptions, newOption],
          },
        },
        updatedAt: now,
      };
    }

    case "UPDATE_RESPONSE_OPTION": {
      const { messageId, optionId, text } = action.payload;
      if (!state.messages[messageId]) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [messageId]: {
            ...state.messages[messageId],
            responseOptions: state.messages[messageId].responseOptions.map((opt) =>
              opt.id === optionId ? { ...opt, text } : opt
            ),
          },
        },
        updatedAt: now,
      };
    }

    case "DELETE_RESPONSE_OPTION": {
      const { messageId, optionId } = action.payload;
      if (!state.messages[messageId]) return state;
      
      const option = state.messages[messageId].responseOptions.find((o) => o.id === optionId);
      const newMessages = { ...state.messages };
      
      // Delete the follow-up message chain if exists
      if (option?.nextMessageId) {
        const deleteRecursive = (id: string) => {
          const message = newMessages[id];
          if (message) {
            message.responseOptions.forEach((opt) => {
              if (opt.nextMessageId) {
                deleteRecursive(opt.nextMessageId);
              }
            });
            delete newMessages[id];
          }
        };
        deleteRecursive(option.nextMessageId);
      }
      
      newMessages[messageId] = {
        ...newMessages[messageId],
        responseOptions: newMessages[messageId].responseOptions.filter((o) => o.id !== optionId),
      };
      
      return {
        ...state,
        messages: newMessages,
        updatedAt: now,
      };
    }

    case "ADD_FOLLOW_UP_MESSAGE": {
      const { parentMessageId, optionId, content, position } = action.payload;
      if (!state.messages[parentMessageId]) return state;
      
      const newMessage = createMessage(content, position);
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [newMessage.id]: newMessage,
          [parentMessageId]: {
            ...state.messages[parentMessageId],
            responseOptions: state.messages[parentMessageId].responseOptions.map((opt) =>
              opt.id === optionId ? { ...opt, nextMessageId: newMessage.id } : opt
            ),
          },
        },
        updatedAt: now,
      };
    }

    case "CONNECT_NODES": {
      const { sourceMessageId, optionId, targetMessageId } = action.payload;
      if (!state.messages[sourceMessageId] || !state.messages[targetMessageId]) return state;
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [sourceMessageId]: {
            ...state.messages[sourceMessageId],
            responseOptions: state.messages[sourceMessageId].responseOptions.map((opt) =>
              opt.id === optionId ? { ...opt, nextMessageId: targetMessageId } : opt
            ),
          },
        },
        updatedAt: now,
      };
    }

    case "DISCONNECT_OPTION": {
      const { messageId, optionId } = action.payload;
      if (!state.messages[messageId]) return state;
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [messageId]: {
            ...state.messages[messageId],
            responseOptions: state.messages[messageId].responseOptions.map((opt) =>
              opt.id === optionId ? { ...opt, nextMessageId: null } : opt
            ),
          },
        },
        updatedAt: now,
      };
    }

    case "REORDER_OPTIONS": {
      const { messageId, fromIndex, toIndex } = action.payload;
      if (!state.messages[messageId]) return state;
      
      const options = [...state.messages[messageId].responseOptions];
      const [removed] = options.splice(fromIndex, 1);
      options.splice(toIndex, 0, removed);
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [messageId]: { ...state.messages[messageId], responseOptions: options },
        },
        updatedAt: now,
      };
    }

    case "RESET_SCENARIO":
      return createEmptyScenario();

    default:
      return state;
  }
}

// Context types
interface ScenarioContextType {
  scenario: ScenarioData;
  updateTheme: (theme: Partial<ChatTheme>) => void;
  setName: (name: string) => void;
  addRootMessage: (content: string, position?: NodePosition) => void;
  addMessageAtPosition: (content: string, position: NodePosition) => void;
  updateMessage: (id: string, content: string) => void;
  updateNodePosition: (id: string, position: NodePosition) => void;
  deleteMessage: (id: string) => void;
  toggleEndpoint: (id: string) => void;
  addResponseOption: (messageId: string, text: string) => void;
  updateResponseOption: (messageId: string, optionId: string, text: string) => void;
  deleteResponseOption: (messageId: string, optionId: string) => void;
  addFollowUpMessage: (parentMessageId: string, optionId: string, content: string, position: NodePosition) => void;
  connectNodes: (sourceMessageId: string, optionId: string, targetMessageId: string) => void;
  disconnectOption: (messageId: string, optionId: string) => void;
  reorderOptions: (messageId: string, fromIndex: number, toIndex: number) => void;
  importScenario: (data: ScenarioData) => void;
  resetScenario: () => void;
}

const ScenarioContext = createContext<ScenarioContextType | null>(null);

// Local storage key
const STORAGE_KEY = "chat-scenario-builder-autosave";

// Provider component
export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [scenario, dispatch] = useReducer(scenarioReducer, null, () => {
    // Try to load from localStorage on init
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load saved scenario:", e);
    }
    return createEmptyScenario();
  });

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenario));
    } catch (e) {
      console.error("Failed to save scenario:", e);
    }
  }, [scenario]);

  const updateTheme = useCallback((theme: Partial<ChatTheme>) => {
    dispatch({ type: "UPDATE_THEME", payload: theme });
  }, []);

  const setName = useCallback((name: string) => {
    dispatch({ type: "SET_NAME", payload: name });
  }, []);

  const addRootMessage = useCallback((content: string, position?: NodePosition) => {
    dispatch({ type: "ADD_ROOT_MESSAGE", payload: { content, position: position || { x: 100, y: 200 } } });
  }, []);

  const addMessageAtPosition = useCallback((content: string, position: NodePosition) => {
    dispatch({ type: "ADD_MESSAGE_AT_POSITION", payload: { content, position } });
  }, []);

  const updateMessage = useCallback((id: string, content: string) => {
    dispatch({ type: "UPDATE_MESSAGE", payload: { id, content } });
  }, []);

  const updateNodePosition = useCallback((id: string, position: NodePosition) => {
    dispatch({ type: "UPDATE_NODE_POSITION", payload: { id, position } });
  }, []);

  const deleteMessage = useCallback((id: string) => {
    dispatch({ type: "DELETE_MESSAGE", payload: id });
  }, []);

  const toggleEndpoint = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_ENDPOINT", payload: id });
  }, []);

  const addResponseOption = useCallback((messageId: string, text: string) => {
    dispatch({ type: "ADD_RESPONSE_OPTION", payload: { messageId, text } });
  }, []);

  const updateResponseOption = useCallback((messageId: string, optionId: string, text: string) => {
    dispatch({ type: "UPDATE_RESPONSE_OPTION", payload: { messageId, optionId, text } });
  }, []);

  const deleteResponseOption = useCallback((messageId: string, optionId: string) => {
    dispatch({ type: "DELETE_RESPONSE_OPTION", payload: { messageId, optionId } });
  }, []);

  const addFollowUpMessage = useCallback((parentMessageId: string, optionId: string, content: string, position: NodePosition) => {
    dispatch({ type: "ADD_FOLLOW_UP_MESSAGE", payload: { parentMessageId, optionId, content, position } });
  }, []);

  const connectNodes = useCallback((sourceMessageId: string, optionId: string, targetMessageId: string) => {
    dispatch({ type: "CONNECT_NODES", payload: { sourceMessageId, optionId, targetMessageId } });
  }, []);

  const disconnectOption = useCallback((messageId: string, optionId: string) => {
    dispatch({ type: "DISCONNECT_OPTION", payload: { messageId, optionId } });
  }, []);

  const reorderOptions = useCallback((messageId: string, fromIndex: number, toIndex: number) => {
    dispatch({ type: "REORDER_OPTIONS", payload: { messageId, fromIndex, toIndex } });
  }, []);

  const importScenario = useCallback((data: ScenarioData) => {
    dispatch({ type: "SET_SCENARIO", payload: data });
  }, []);

  const resetScenario = useCallback(() => {
    dispatch({ type: "RESET_SCENARIO" });
  }, []);

  return (
    <ScenarioContext.Provider
      value={{
        scenario,
        updateTheme,
        setName,
        addRootMessage,
        addMessageAtPosition,
        updateMessage,
        updateNodePosition,
        deleteMessage,
        toggleEndpoint,
        addResponseOption,
        updateResponseOption,
        deleteResponseOption,
        addFollowUpMessage,
        connectNodes,
        disconnectOption,
        reorderOptions,
        importScenario,
        resetScenario,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
}

// Hook
export function useScenario() {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error("useScenario must be used within a ScenarioProvider");
  }
  return context;
}
