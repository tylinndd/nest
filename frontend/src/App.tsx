import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import Home from "./pages/Home";
import Path from "./pages/Path";
import Benefits from "./pages/Benefits";
import Navigator from "./pages/Navigator";
import Emergency from "./pages/Emergency";
import Vault from "./pages/Vault";
import NotFound from "./pages/NotFound";
import { OnboardingLayout } from "./pages/Onboarding/OnboardingLayout";
import {
  StepName,
  StepAge,
  StepCounty,
  StepDocuments,
  StepEducation,
  StepHousing,
  StepHealth,
  StepReview,
} from "./pages/Onboarding/steps";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<OnboardingLayout />}>
            <Route index element={<Navigate to="name" replace />} />
            <Route path="name" element={<StepName />} />
            <Route path="age" element={<StepAge />} />
            <Route path="county" element={<StepCounty />} />
            <Route path="documents" element={<StepDocuments />} />
            <Route path="education" element={<StepEducation />} />
            <Route path="housing" element={<StepHousing />} />
            <Route path="health" element={<StepHealth />} />
            <Route path="review" element={<StepReview />} />
          </Route>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/path" element={<Path />} />
            <Route path="/benefits" element={<Benefits />} />
            <Route path="/navigator" element={<Navigator />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/emergency" element={<Emergency />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
