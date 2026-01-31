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
          {/* Left Panel - 60% for Canvas/Theme */}
          <div className="w-3/5 min-w-[480px] border-r border-border/50">
            <LeftPanel />
          </div>
          
          {/* Right Panel - 40% for Chat Preview */}
          <main className="w-2/5 min-w-[320px] overflow-hidden" aria-label="Chat preview">
            <ChatPreview />
          </main>
        </div>
      </div>
    </ScenarioProvider>
  );
}
