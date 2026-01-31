import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeTab } from "./ThemeTab";
import { MessagesTab } from "./MessagesTab";
import { Palette, MessageCircle } from "lucide-react";

export function LeftPanel() {
  return (
    <aside className="flex h-full w-full flex-col bg-background" aria-label="Builder panel">
      <Tabs defaultValue="messages" className="flex h-full flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-secondary/50 rounded-xl" aria-label="Builder tabs">
            <TabsTrigger 
              value="theme" 
              className="gap-2 rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
            >
              <Palette className="h-4 w-4" aria-hidden="true" />
              <span>Theme</span>
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="gap-2 rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Messages</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="theme" className="flex-1 overflow-hidden mt-0">
          <ThemeTab />
        </TabsContent>
        
        <TabsContent value="messages" className="flex-1 overflow-hidden mt-0">
          <MessagesTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
