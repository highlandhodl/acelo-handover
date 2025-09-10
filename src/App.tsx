import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/navigation/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";
// Lazy load heavy pages for better performance
const Index = lazy(() => import("./pages/Index"));
const PromptsPage = lazy(() => import("./pages/PromptsPage"));
const ContextHubPage = lazy(() => import("./pages/ContextHubPage"));
const AssetsPage = lazy(() => import("./pages/AssetsPage"));
const CoachesPage = lazy(() => import("./pages/CoachesPage"));
const AutomationsPage = lazy(() => import("./pages/AutomationsPage"));
const PromptWorkflowPage = lazy(() => import("./pages/PromptWorkflowPage"));
const AutomationWorkflowPage = lazy(() => import("./pages/AutomationWorkflowPage"));

// Keep Auth and NotFound pages eager-loaded for immediate access
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={
                  <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                    <Index />
                  </Suspense>
                } />
                <Route path="prompts" element={
                  <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                    <PromptsPage />
                  </Suspense>
                } />
                <Route path="prompts/workflow/:promptId" element={
                  <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                    <PromptWorkflowPage />
                  </Suspense>
                } />
                <Route path="contexts" element={
                  <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                    <ContextHubPage />
                  </Suspense>
                } />
                <Route path="assets" element={
                  <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                    <AssetsPage />
                  </Suspense>
                } />
                <Route path="coaches" element={
                  <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                    <CoachesPage />
                  </Suspense>
                } />
                <Route path="automations" element={
                  <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                    <AutomationsPage />
                  </Suspense>
                } />
                <Route path="automations/workflow/:automationId" element={
                  <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                    <AutomationWorkflowPage />
                  </Suspense>
                } />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
