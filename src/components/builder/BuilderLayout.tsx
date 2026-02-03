/**
 * @file BuilderLayout.tsx
 * @description Main builder layout component that composes TopBar, LeftPanel, and ChatPreview
 *              into a responsive two-panel interface
 * 
 * @dependencies ScenarioContext, TopBar, LeftPanel, ChatPreview
 * @usage Rendered by Index page component
 */

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
  const framePreset = scenario.theme.framePreset ?? 'none';

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Skip Link for keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-card focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:ring-2 focus:ring-ring focus:text-foreground"
      >
        Skip to main content
      </a>
      
      <TopBar onRestartWalkthrough={walkthrough.startWalkthrough} />
      <main id="main-content" className="flex flex-1 overflow-hidden">
        {/* Left Panel - 60% for Canvas/Theme */}
        <section className="w-3/5 min-w-0 lg:min-w-[480px] border-r border-border/50" aria-label="Builder controls">
          <LeftPanel requestedTab={walkthrough.requestedTab} />
        </section>
        
        {/* Right Panel - 40% for Chat Preview */}
        <section 
          className="w-2/5 min-w-0 lg:min-w-[320px] overflow-hidden bg-muted/30" 
          aria-label="Chat preview"
        >
          <DeviceFrame preset={framePreset}>
            <ChatPreview />
          </DeviceFrame>
        </section>
      </main>

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
