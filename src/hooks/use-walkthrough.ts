/**
 * @file use-walkthrough.ts
 * @description Custom hook for managing onboarding walkthrough state with localStorage persistence
 *
 * @dependencies React useState, useEffect, useCallback
 * @usage Import in BuilderLayout to control walkthrough flow
 */

import { useState, useEffect, useCallback } from "react";

export interface WalkthroughSubStep {
  target: string;
  description: string;
}

export interface WalkthroughStep {
  id: string;
  target: string;
  title: string;
  description: string;
  switchToTab?: "theme" | "canvas";
  subSteps?: WalkthroughSubStep[];
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: "theme",
    target: "theme-tab",
    title: "Theme Tab",
    description: "Use the Theme tab to configure the appearance of your chat.",
    switchToTab: "theme",
  },
  {
    id: "canvas",
    target: "canvas-tab",
    title: "Canvas",
    description: "The Canvas is where you can build and connect messages.",
    switchToTab: "canvas",
    subSteps: [
      { target: "variables-button", description: "Add variables and create conditional branches." },
      { target: "expand-button", description: "Expand the canvas for focused building." },
    ],
  },
  {
    id: "message-card",
    target: "message-card",
    title: "Message Card",
    description: "Each card is a message from the contact. Edit the message text here.",
    switchToTab: "canvas",
  },
  {
    id: "add-responses",
    target: "add-response-input",
    title: "Add Responses",
    description: "Type a response and select 'Add' or press Enter.",
    switchToTab: "canvas",
  },
  {
    id: "add-triggers",
    target: "trigger-button",
    title: "Add Triggers",
    description: "Use triggers to create conditional logic and branching paths based on learner choices.",
    switchToTab: "canvas",
  },
  {
    id: "link-responses",
    target: "link-button",
    title: "Link Responses",
    description: "Use the link button to connect response options to other message nodes.",
    switchToTab: "canvas",
  },
  {
    id: "save-work",
    target: "import-export",
    title: "Save Your Work",
    description:
      "Your work will not be saved. Be sure to export your scenario and re-import it to continue building where you left off.",
  },
  {
    id: "finalize",
    target: "finalize-button",
    title: "Download",
    description: "When you're ready, download the complete chat scenario.",
  },
];

const STORAGE_KEY = "chatScenarioWalkthroughComplete";

export interface UseWalkthroughReturn {
  isActive: boolean;
  currentStep: number;
  currentSubStep: number;
  steps: WalkthroughStep[];
  currentTarget: string;
  currentDescription: string;
  currentTitle: string;
  totalSteps: number;
  startWalkthrough: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipWalkthrough: () => void;
  completeWalkthrough: () => void;
  hasCompletedWalkthrough: boolean;
  requestedTab: "theme" | "canvas" | null;
}

export function useWalkthrough(): UseWalkthroughReturn {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState(-1); // -1 means main step, 0+ means sub-step
  const [hasCompletedWalkthrough, setHasCompletedWalkthrough] = useState(true);
  const [requestedTab, setRequestedTab] = useState<"theme" | "canvas" | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      setHasCompletedWalkthrough(completed === "true");
    } catch {
      // localStorage not available, show walkthrough
      setHasCompletedWalkthrough(false);
    }
  }, []);

  // Auto-start walkthrough for first-time users
  useEffect(() => {
    if (!hasCompletedWalkthrough && !isActive) {
      // Small delay to ensure UI is rendered
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStep(0);
        setCurrentSubStep(-1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedWalkthrough, isActive]);

  // Update requested tab when step changes
  useEffect(() => {
    if (isActive) {
      const step = WALKTHROUGH_STEPS[currentStep];
      if (step?.switchToTab) {
        setRequestedTab(step.switchToTab);
      }
    }
  }, [isActive, currentStep]);

  const getCurrentTarget = useCallback(() => {
    const step = WALKTHROUGH_STEPS[currentStep];
    if (!step) return "";

    if (currentSubStep >= 0 && step.subSteps && step.subSteps[currentSubStep]) {
      return step.subSteps[currentSubStep].target;
    }
    return step.target;
  }, [currentStep, currentSubStep]);

  const getCurrentDescription = useCallback(() => {
    const step = WALKTHROUGH_STEPS[currentStep];
    if (!step) return "";

    if (currentSubStep >= 0 && step.subSteps && step.subSteps[currentSubStep]) {
      return step.subSteps[currentSubStep].description;
    }
    return step.description;
  }, [currentStep, currentSubStep]);

  const getCurrentTitle = useCallback(() => {
    const step = WALKTHROUGH_STEPS[currentStep];
    return step?.title || "";
  }, [currentStep]);

  const getTotalSteps = useCallback(() => {
    let total = 0;
    WALKTHROUGH_STEPS.forEach((step) => {
      total += 1; // Main step
      if (step.subSteps) {
        total += step.subSteps.length;
      }
    });
    return total;
  }, []);

  const startWalkthrough = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    setCurrentSubStep(-1);
  }, []);

  const nextStep = useCallback(() => {
    const step = WALKTHROUGH_STEPS[currentStep];

    // If we have sub-steps and haven't gone through them all
    if (step?.subSteps && currentSubStep < step.subSteps.length - 1) {
      setCurrentSubStep((prev) => prev + 1);
      return;
    }

    // Move to next main step
    if (currentStep < WALKTHROUGH_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setCurrentSubStep(-1);
    } else {
      // Completed all steps
      completeWalkthrough();
    }
  }, [currentStep, currentSubStep]);

  const previousStep = useCallback(() => {
    // If in a sub-step, go back within sub-steps
    if (currentSubStep > 0) {
      setCurrentSubStep((prev) => prev - 1);
      return;
    }

    // If at main step but there were sub-steps shown, go to main step
    if (currentSubStep === 0) {
      setCurrentSubStep(-1);
      return;
    }

    // Move to previous main step
    if (currentStep > 0) {
      const prevStep = WALKTHROUGH_STEPS[currentStep - 1];
      setCurrentStep((prev) => prev - 1);
      // If previous step has sub-steps, go to last sub-step
      if (prevStep.subSteps && prevStep.subSteps.length > 0) {
        setCurrentSubStep(prevStep.subSteps.length - 1);
      } else {
        setCurrentSubStep(-1);
      }
    }
  }, [currentStep, currentSubStep]);

  const skipWalkthrough = useCallback(() => {
    setIsActive(false);
    setRequestedTab(null);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore localStorage errors
    }
    setHasCompletedWalkthrough(true);
  }, []);

  const completeWalkthrough = useCallback(() => {
    setIsActive(false);
    setRequestedTab(null);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore localStorage errors
    }
    setHasCompletedWalkthrough(true);
  }, []);

  return {
    isActive,
    currentStep,
    currentSubStep,
    steps: WALKTHROUGH_STEPS,
    currentTarget: getCurrentTarget(),
    currentDescription: getCurrentDescription(),
    currentTitle: getCurrentTitle(),
    totalSteps: getTotalSteps(),
    startWalkthrough,
    nextStep,
    previousStep,
    skipWalkthrough,
    completeWalkthrough,
    hasCompletedWalkthrough,
    requestedTab,
  };
}
