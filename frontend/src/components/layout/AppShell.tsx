import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

export const AppShell = () => {
  const location = useLocation();
  const isEmergency = location.pathname.startsWith("/emergency");
  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-md min-h-screen flex flex-col">
        {!isEmergency && <TopBar />}
        <main className={isEmergency ? "flex-1" : "flex-1 pb-28"}>
          <Outlet />
        </main>
        {!isEmergency && <BottomNav />}
      </div>
    </div>
  );
};
