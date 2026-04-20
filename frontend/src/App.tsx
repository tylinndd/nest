import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/AppShell";
import { RequireProfile } from "@/components/guards/RequireProfile";
import { PersistenceBanner } from "@/components/PersistenceBanner";
import { UpdatePrompt } from "@/components/UpdatePrompt";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Home = lazy(() => import("./pages/Home"));
const Path = lazy(() => import("./pages/Path"));
const Benefits = lazy(() => import("./pages/Benefits"));
const Navigator = lazy(() => import("./pages/Navigator"));
const Emergency = lazy(() => import("./pages/Emergency"));
const Vault = lazy(() => import("./pages/Vault"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OnboardingLayout = lazy(() =>
  import("./pages/Onboarding/OnboardingLayout").then((m) => ({
    default: m.OnboardingLayout,
  })),
);
const StepName = lazy(() =>
  import("./pages/Onboarding/steps").then((m) => ({ default: m.StepName })),
);
const StepAge = lazy(() =>
  import("./pages/Onboarding/steps").then((m) => ({ default: m.StepAge })),
);
const StepCounty = lazy(() =>
  import("./pages/Onboarding/steps").then((m) => ({ default: m.StepCounty })),
);
const StepDocuments = lazy(() =>
  import("./pages/Onboarding/steps").then((m) => ({
    default: m.StepDocuments,
  })),
);
const StepEducation = lazy(() =>
  import("./pages/Onboarding/steps").then((m) => ({
    default: m.StepEducation,
  })),
);
const StepHousing = lazy(() =>
  import("./pages/Onboarding/steps").then((m) => ({ default: m.StepHousing })),
);
const StepHealth = lazy(() =>
  import("./pages/Onboarding/steps").then((m) => ({ default: m.StepHealth })),
);
const StepReview = lazy(() =>
  import("./pages/Onboarding/steps").then((m) => ({ default: m.StepReview })),
);

const ROUTE_TITLES: Array<[string, string]> = [
  ["/onboarding", "Set up · Nest"],
  ["/path", "Your Path · Nest"],
  ["/benefits", "Benefits · Nest"],
  ["/navigator", "Ask Navigator · Nest"],
  ["/vault", "Document Vault · Nest"],
  ["/emergency", "Emergency · Nest"],
];

const RouteTitle = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === "/") {
      document.title = "Home · Nest";
      return;
    }
    const match = ROUTE_TITLES.find(
      ([prefix]) => pathname === prefix || pathname.startsWith(prefix + "/"),
    );
    document.title = match ? match[1] : "Not found · Nest";
  }, [pathname]);
  return null;
};

const RouteFallback = () => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-[60vh] items-center justify-center"
  >
    <span className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
    <span className="sr-only">Loading…</span>
  </div>
);

const App = () => (
  <MotionConfig reducedMotion="user">
    <Sonner />
    <BrowserRouter>
      <RouteTitle />
      <PersistenceBanner />
      <UpdatePrompt />
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
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
            <Route element={<RequireProfile />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<Home />} />
                <Route path="/path" element={<Path />} />
                <Route path="/benefits" element={<Benefits />} />
                <Route path="/navigator" element={<Navigator />} />
                <Route path="/vault" element={<Vault />} />
                <Route path="/emergency" element={<Emergency />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  </MotionConfig>
);

export default App;
