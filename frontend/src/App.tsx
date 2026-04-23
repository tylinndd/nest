import { lazy, Suspense, useEffect, useState } from "react";
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
import { TourOverlay } from "@/components/TourOverlay";
import { PresenterPill } from "@/components/PresenterPill";
import { OfflineBanner } from "@/components/OfflineBanner";
import { probeHealth } from "@/lib/health";
import "@/store/preferences";

const Home = lazy(() => import("./pages/Home"));
const Path = lazy(() => import("./pages/Path"));
const Deadlines = lazy(() => import("./pages/Deadlines"));
const Benefits = lazy(() => import("./pages/Benefits"));
const Navigator = lazy(() => import("./pages/Navigator"));
const Emergency = lazy(() => import("./pages/Emergency"));
const Money = lazy(() => import("./pages/Money"));
const NearMe = lazy(() => import("./pages/NearMe"));
const Saved = lazy(() => import("./pages/Saved"));
const YourData = lazy(() => import("./pages/YourData"));
const Vault = lazy(() => import("./pages/Vault"));
const Settings = lazy(() => import("./pages/Settings"));
const Reset = lazy(() => import("./pages/Reset"));
const About = lazy(() => import("./pages/About"));
const Team = lazy(() => import("./pages/Team"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Glossary = lazy(() => import("./pages/Glossary"));
const Demo = lazy(() => import("./pages/Demo"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Accessibility = lazy(() => import("./pages/Accessibility"));
const Caseworkers = lazy(() => import("./pages/Caseworkers"));
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
  ["/deadlines", "Deadlines · Nest"],
  ["/benefits", "Benefits · Nest"],
  ["/navigator", "Ask Navigator · Nest"],
  ["/vault", "Document Vault · Nest"],
  ["/settings", "Settings · Nest"],
  ["/emergency", "Emergency · Nest"],
  ["/money", "Money · Nest"],
  ["/near-me", "Near you · Nest"],
  ["/saved", "Saved · Nest"],
  ["/your-data", "Your data · Nest"],
  ["/about", "About · Nest"],
  ["/team", "The team · Nest"],
  ["/how-it-works", "How Nest answers · Nest"],
  ["/glossary", "Glossary · Nest"],
  ["/demo", "Demo · Nest"],
  ["/privacy", "Privacy label · Nest"],
  ["/accessibility", "Accessibility · Nest"],
  ["/caseworkers", "For caseworkers · Nest"],
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

const BackendOfflineDot = () => (
  <span
    aria-label="Backend offline"
    role="status"
    className="fixed bottom-2 left-2 z-50 h-2 w-2 rounded-full bg-nest-coral"
  />
);

const App = () => {
  const [backendOffline, setBackendOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    probeHealth().then((res) => {
      if (cancelled || res.ok) return;
      if (import.meta.env.DEV) {
        setBackendOffline(true);
      } else {
        console.warn("Nest backend health probe failed", res.detail);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
  <MotionConfig reducedMotion="user">
    <Sonner />
    <BrowserRouter>
      <RouteTitle />
      <PersistenceBanner />
      <UpdatePrompt />
      <TourOverlay />
      <PresenterPill />
      <OfflineBanner />
      {backendOffline && <BackendOfflineDot />}
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
                <Route path="/deadlines" element={<Deadlines />} />
                <Route path="/benefits" element={<Benefits />} />
                <Route path="/navigator" element={<Navigator />} />
                <Route path="/vault" element={<Vault />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/money" element={<Money />} />
                <Route path="/near-me" element={<NearMe />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/your-data" element={<YourData />} />
              </Route>
            </Route>
            <Route path="/reset" element={<Reset />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/caseworkers" element={<Caseworkers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  </MotionConfig>
  );
};

export default App;
