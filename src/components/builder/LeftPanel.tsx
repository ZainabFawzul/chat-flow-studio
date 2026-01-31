import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeTab } from "./ThemeTab";
import { MessagesTab } from "./MessagesTab";
import { Palette, MessageCircle } from "lucide-react";

export function LeftPanel() {
  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-card" aria-label="Builder panel">
      <Tabs defaultValue="messages" className="flex h-full flex-col">
        <TabsList className="mx-md mt-md grid w-auto grid-cols-2 bg-secondary" aria-label="Builder tabs">
          <TabsTrigger value="theme" className="gap-xs text-body">
            <Palette className="h-4 w-4" aria-hidden="true" />
            <span>Theme</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-xs text-body">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span>Messages</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="theme" className="flex-1 overflow-hidden">
          <ThemeTab />
        </TabsContent>
        
        <TabsContent value="messages" className="flex-1 overflow-hidden">
          <MessagesTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
