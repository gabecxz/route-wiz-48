import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LogisticsProvider } from "@/contexts/LogisticsContext";
import Index from "./pages/Index";
import Drivers from "./pages/Drivers";
import Deliveries from "./pages/Deliveries";
import Optimization from "./pages/Optimization";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LogisticsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/motoristas" element={<Drivers />} />
                  <Route path="/entregas" element={<Deliveries />} />
                  <Route path="/otimizacao" element={<Optimization />} />
                  <Route path="/historico" element={<History />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </LogisticsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
