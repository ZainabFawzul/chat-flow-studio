import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeTab } from "./ThemeTab";
import { FlowCanvas } from "./FlowCanvas";
import { Palette, GitBranch } from "lucide-react";

export function LeftPanel() {
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);

  const toggleCanvasExpand = () => {
    setIsCanvasExpanded(!isCanvasExpanded);
  };

  // When canvas is expanded, render it in fullscreen mode
  if (isCanvasExpanded) {
    return <FlowCanvas isExpanded={true} onToggleExpand={toggleCanvasExpand} />;
  }

  return (
    <aside className="flex h-full w-full flex-col bg-background" aria-label="Builder panel">
      <Tabs defaultValue="canvas" className="flex h-full flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-secondary/50 rounded-xl" aria-label="Builder tabs">
            <TabsTrigger 
              value="canvas" 
              className="gap-2 rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
            >
              <GitBranch className="h-4 w-4" aria-hidden="true" />
              <span>Canvas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="theme" 
              className="gap-2 rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
            >
              <Palette className="h-4 w-4" aria-hidden="true" />
              <span>Theme</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="canvas" className="flex-1 overflow-hidden mt-0 p-0">
          <div className="h-full">
            <FlowCanvas isExpanded={false} onToggleExpand={toggleCanvasExpand} />
          </div>
        </TabsContent>
        
        <TabsContent value="theme" className="flex-1 overflow-hidden mt-0">
          <ThemeTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
