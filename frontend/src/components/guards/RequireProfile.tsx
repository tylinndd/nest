import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useProfile, hasProfile } from "@/store/profile";

export const ONBOARDING_RETURN_KEY = "nest.onboarding.return";

export const RequireProfile = () => {
  const profile = useProfile();
  const location = useLocation();

  if (!hasProfile(profile)) {
    const from = location.pathname + location.search;
    try {
      sessionStorage.setItem(ONBOARDING_RETURN_KEY, from);
    } catch {
      // sessionStorage unavailable; return target defaults to "/"
    }
    return <Navigate to="/onboarding/name" replace />;
  }

  return <Outlet />;
};
