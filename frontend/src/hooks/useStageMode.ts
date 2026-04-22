import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STAGE_SESSION_KEY = "nest.stage";

const read = (): boolean => {
  try {
    return sessionStorage.getItem(STAGE_SESSION_KEY) === "1";
  } catch {
    return false;
  }
};

const write = (on: boolean) => {
  try {
    if (on) sessionStorage.setItem(STAGE_SESSION_KEY, "1");
    else sessionStorage.removeItem(STAGE_SESSION_KEY);
  } catch {
    // ignore — stage mode is best-effort
  }
};

export function useStageMode(): {
  active: boolean;
  exit: () => void;
} {
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState<boolean>(() => read());

  useEffect(() => {
    const params = new URLSearchParams(search);
    const flag = params.get("stage");
    if (flag === "1") {
      write(true);
      setActive(true);
      params.delete("stage");
      const qs = params.toString();
      navigate(qs ? `${pathname}?${qs}` : pathname, { replace: true });
    } else if (flag === "0") {
      write(false);
      setActive(false);
      params.delete("stage");
      const qs = params.toString();
      navigate(qs ? `${pathname}?${qs}` : pathname, { replace: true });
    }
  }, [search, pathname, navigate]);

  const exit = () => {
    write(false);
    setActive(false);
  };

  return { active, exit };
}
