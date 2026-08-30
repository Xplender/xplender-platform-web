"use client";

import { useEffect, useRef, useCallback } from "react";

const TIMEOUT_MS = 60 * 60 * 1000; // 1 hora de inactividad → cerrar sesión

const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "click",
  "scroll",
  "touchstart",
] as const;

function doLogout() {
  window.location.href = "/api/signout";
}

export function InactivityGuard() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doLogout, TIMEOUT_MS);
  }, []);

  useEffect(() => {
    resetTimer();

    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, resetTimer, { passive: true })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((e) =>
        window.removeEventListener(e, resetTimer)
      );
    };
  }, [resetTimer]);

  return null;
}
