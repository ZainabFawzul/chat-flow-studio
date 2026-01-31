import { ScenarioProvider } from "@/context/ScenarioContext";
import { TopBar } from "./TopBar";
import { LeftPanel } from "./LeftPanel";
import { ChatPreview } from "./ChatPreview";

export function BuilderLayout() {
  return (
    <ScenarioProvider>
      <div className="flex h-screen flex-col bg-background">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - 40% */}
          <div className="w-2/5 min-w-[320px] max-w-[600px]">
            <LeftPanel />
          </div>
          
          {/* Right Panel - 60% */}
          <main className="flex-1 overflow-hidden" aria-label="Chat preview">
            <ChatPreview />
          </main>
        </div>
      </div>
    </ScenarioProvider>
  );
}
