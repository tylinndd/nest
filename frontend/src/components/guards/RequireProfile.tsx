import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useProfile, hasProfile } from "@/store/profile";

export const RequireProfile = () => {
  const profile = useProfile();
  const location = useLocation();

  if (!hasProfile(profile)) {
    return (
      <Navigate
        to="/onboarding/name"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
};
