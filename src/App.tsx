/**
 * @file App.tsx
 * @description Root component that sets up providers (QueryClient, Tooltip, Scenario), routing, and toasters
 * 
 * @dependencies react-router-dom, @tanstack/react-query, ScenarioContext, UI components
 * @usage Imported and rendered by main.tsx
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScenarioProvider } from "@/context/ScenarioContext";
import { MobileBlocker } from "@/components/MobileBlocker";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MobileBlocker>
        <ScenarioProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ScenarioProvider>
      </MobileBlocker>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
