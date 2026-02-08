/**
 * @file BuilderLayout.tsx
 * @description Main builder layout component that composes TopBar, LeftPanel, and ChatPreview
 *              into a responsive two-panel interface
 *
 * @dependencies ScenarioContext, TopBar, LeftPanel, ChatPreview
 * @usage Rendered by Index page component
 */

import { useState } from "react";
import { ScenarioProvider, useScenario } from "@/context/ScenarioContext";
import { TopBar } from "./TopBar";
import { LeftPanel } from "./LeftPanel";
import { ChatPreview } from "./ChatPreview";
import { DeviceFrame } from "./DeviceFrame";
import { OnboardingWalkthrough } from "./OnboardingWalkthrough";
import { useWalkthrough } from "@/hooks/use-walkthrough";

function BuilderContent() {
  const walkthrough = useWalkthrough();
  const { scenario } = useScenario();
  const framePreset = scenario.theme.framePreset ?? "none";
  const frameOrientation = scenario.theme.frameOrientation ?? "vertical";
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Skip Link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-card focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:ring-2 focus:ring-ring focus:text-foreground"
      >
        Skip to main content
      </a>

      {!isCanvasExpanded && <TopBar onRestartWalkthrough={walkthrough.startWalkthrough} />}
      <main id="main-content" className="flex flex-1 overflow-hidden">
        {/* Left Panel - Full width when canvas expanded, 60% otherwise */}
        <section
          className={isCanvasExpanded ? "w-full" : "w-3/5 min-w-0 lg:min-w-[480px] border-r border-border/50"}
          aria-label="Builder controls"
        >
          <LeftPanel
            requestedTab={walkthrough.requestedTab}
            isCanvasExpanded={isCanvasExpanded}
            onToggleCanvasExpand={() => setIsCanvasExpanded(!isCanvasExpanded)}
          />
        </section>

        {/* Right Panel - Hidden when canvas expanded */}
        {!isCanvasExpanded && (
          <section className="w-2/5 min-w-0 lg:min-w-[320px] overflow-hidden bg-muted/30" aria-label="Chat preview">
            <DeviceFrame preset={framePreset} orientation={frameOrientation}>
              <ChatPreview />
            </DeviceFrame>
          </section>
        )}
      </main>

      {/* Footer - Hidden when canvas expanded */}
      {!isCanvasExpanded && (
        <footer className="flex items-center justify-center py-2 px-4 border-t border-border/50 bg-background text-sm text-muted-foreground">
          <p>
            Vibe coded with Lovable by Zainab Fawzul. To suggest features or discuss concerns,{" "}
            <a
              href="https://www.linkedin.com/in/zainab-fawzul"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              reach out!
            </a>
          </p>
        </footer>
      )}

      {/* Onboarding Walkthrough */}
      <OnboardingWalkthrough
        isActive={walkthrough.isActive}
        currentTarget={walkthrough.currentTarget}
        currentTitle={walkthrough.currentTitle}
        currentDescription={walkthrough.currentDescription}
        currentStep={walkthrough.currentStep}
        currentSubStep={walkthrough.currentSubStep}
        totalSteps={walkthrough.totalSteps}
        onNext={walkthrough.nextStep}
        onPrevious={walkthrough.previousStep}
        onSkip={walkthrough.skipWalkthrough}
      />
    </div>
  );
}

export function BuilderLayout() {
  return (
    <ScenarioProvider>
      <BuilderContent />
    </ScenarioProvider>
  );
}
