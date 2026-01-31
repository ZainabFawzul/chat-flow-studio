/**
 * @file LeftPanel.tsx
 * @description Left sidebar with Theme/Canvas tabs navigation and fullscreen canvas support
 * 
 * @dependencies ThemeTab, FlowCanvas, UI tabs
 * @usage Rendered in BuilderLayout left panel
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeTab } from "./ThemeTab";
import { FlowCanvas } from "./FlowCanvas";

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
      <Tabs defaultValue="theme" className="flex h-full flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-secondary/50 rounded-xl" aria-label="Builder tabs">
            <TabsTrigger 
              value="theme" 
              className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
            >
              Theme
            </TabsTrigger>
            <TabsTrigger 
              value="canvas" 
              className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
            >
              Canvas
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="theme" className="flex-1 overflow-hidden mt-0">
          <ThemeTab />
        </TabsContent>
        
        <TabsContent value="canvas" className="flex-1 overflow-hidden mt-0 p-0">
          <div className="h-full">
            <FlowCanvas isExpanded={false} onToggleExpand={toggleCanvasExpand} />
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
