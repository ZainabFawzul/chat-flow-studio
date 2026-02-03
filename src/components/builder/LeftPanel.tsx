/**
 * @file LeftPanel.tsx
 * @description Left sidebar with Theme/Canvas tabs navigation and fullscreen canvas support
 * 
 * @dependencies ThemeTab, FlowCanvas, UI tabs
 * @usage Rendered in BuilderLayout left panel
 */

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeTab } from "./ThemeTab";
import { FlowCanvas } from "./FlowCanvas";

interface LeftPanelProps {
  requestedTab?: "theme" | "canvas" | null;
}

export function LeftPanel({ requestedTab }: LeftPanelProps) {
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("theme");

  // Handle walkthrough tab switching
  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  const toggleCanvasExpand = () => {
    setIsCanvasExpanded(!isCanvasExpanded);
  };

  // When canvas is expanded, render it in fullscreen mode
  if (isCanvasExpanded) {
    return <FlowCanvas isExpanded={true} onToggleExpand={toggleCanvasExpand} />;
  }

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} activationMode="manual" className="flex h-full flex-col">
        <div className="px-4 pt-4" role="navigation" aria-label="Builder tabs">
          <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-secondary/50 rounded-xl">
            <TabsTrigger 
              value="theme" 
              className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
              data-walkthrough="theme-tab"
              tabIndex={0}
            >
              Theme
            </TabsTrigger>
            <TabsTrigger 
              value="canvas" 
              className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
              data-walkthrough="canvas-tab"
              tabIndex={0}
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
    </div>
  );
}
