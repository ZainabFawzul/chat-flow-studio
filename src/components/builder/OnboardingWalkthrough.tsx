/**
 * @file OnboardingWalkthrough.tsx
 * @description Guided walkthrough overlay with spotlight effect for first-time users
 * 
 * @dependencies use-walkthrough hook, UI components
 * @usage Rendered in BuilderLayout when walkthrough is active
 */

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface OnboardingWalkthroughProps {
  isActive: boolean;
  currentTarget: string;
  currentTitle: string;
  currentDescription: string;
  currentStep: number;
  currentSubStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingWalkthrough({
  isActive,
  currentTarget,
  currentTitle,
  currentDescription,
  currentStep,
  currentSubStep,
  totalSteps,
  onNext,
  onSkip,
}: OnboardingWalkthroughProps) {
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Calculate current progress index for dots
  const getProgressIndex = useCallback(() => {
    let index = 0;
    const steps = [
      { subSteps: undefined }, // theme
      { subSteps: [0, 1] }, // canvas with 2 sub-steps
      { subSteps: undefined }, // save-work
      { subSteps: undefined }, // finalize
    ];
    
    for (let i = 0; i < currentStep; i++) {
      index += 1;
      if (i === 1) index += 2; // canvas has 2 sub-steps
    }
    
    if (currentStep === 1 && currentSubStep >= 0) {
      index += currentSubStep + 1;
    }
    
    return index;
  }, [currentStep, currentSubStep]);

  // Find and measure target element
  const updateSpotlight = useCallback(() => {
    if (!currentTarget) return;
    
    const element = document.querySelector(`[data-walkthrough="${currentTarget}"]`);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8;
      
      setSpotlightRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
      
      // Position tooltip below or beside the element
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 320;
      const tooltipHeight = 180;
      
      let top = rect.bottom + 16;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      
      // Adjust if tooltip would go off-screen
      if (left < 16) left = 16;
      if (left + tooltipWidth > viewportWidth - 16) left = viewportWidth - tooltipWidth - 16;
      
      // If tooltip would go below viewport, position above element
      if (top + tooltipHeight > viewportHeight - 16) {
        top = rect.top - tooltipHeight - 16;
      }
      
      // If still off-screen, position to the side
      if (top < 16) {
        top = Math.max(16, rect.top);
        left = rect.right + 16;
        if (left + tooltipWidth > viewportWidth - 16) {
          left = rect.left - tooltipWidth - 16;
        }
      }
      
      setTooltipPosition({ top, left });
    }
  }, [currentTarget]);

  // Update spotlight on target change and window resize
  useEffect(() => {
    if (!isActive) return;
    
    // Initial update with delay to allow tab switch
    const timer = setTimeout(updateSpotlight, 100);
    
    window.addEventListener("resize", updateSpotlight);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateSpotlight);
    };
  }, [isActive, currentTarget, updateSpotlight]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onSkip();
      } else if (e.key === "Enter" || e.key === "ArrowRight") {
        onNext();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onNext, onSkip]);

  if (!isActive || !spotlightRect) return null;

  const progressIndex = getProgressIndex();

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding walkthrough"
    >
      {/* SVG Overlay with spotlight cutout */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <mask id="spotlight-mask">
            {/* White = visible, black = hidden */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={spotlightRect.left}
              y={spotlightRect.top}
              width={spotlightRect.width}
              height={spotlightRect.height}
              rx="12"
              fill="black"
              className="transition-all duration-300 ease-out"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
          style={{ pointerEvents: "auto" }}
        />
      </svg>

      {/* Spotlight border highlight */}
      <div
        className="absolute rounded-xl border-2 border-primary shadow-lg shadow-primary/25 transition-all duration-300 ease-out pointer-events-none"
        style={{
          top: spotlightRect.top,
          left: spotlightRect.left,
          width: spotlightRect.width,
          height: spotlightRect.height,
        }}
      />

      {/* Tooltip */}
      <div
        className={cn(
          "absolute z-[51] w-80 bg-card border border-border rounded-2xl shadow-2xl p-5",
          "animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">{currentTitle}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkip}
            className="h-8 w-8 rounded-lg -mt-1 -mr-1 text-muted-foreground hover:text-foreground"
            aria-label="Skip walkthrough"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          {currentDescription}
        </p>
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>
          
          {/* Progress dots */}
          <div className="flex items-center gap-1.5" aria-label={`Step ${progressIndex + 1} of ${totalSteps}`}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  i === progressIndex ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          
          <Button
            size="sm"
            onClick={onNext}
            className="gap-1.5 rounded-xl"
          >
            {progressIndex === totalSteps - 1 ? "Done" : "Next"}
            {progressIndex < totalSteps - 1 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        Step {progressIndex + 1} of {totalSteps}: {currentTitle}. {currentDescription}
      </div>
    </div>
  );
}
