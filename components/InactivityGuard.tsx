"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const TIMEOUT_MS = 30 * 60 * 1000;   // 30 minutos de inactividad → mostrar aviso
const WARN_BEFORE_MS = 60 * 1000;    // aviso 60 segundos antes del logout

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
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const startWarnCountdown = useCallback(() => {
    setShowWarning(true);
    setSecondsLeft(WARN_BEFORE_MS / 1000);

    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    logoutTimerRef.current = setTimeout(() => {
      doLogout();
    }, WARN_BEFORE_MS);
  }, []);

  const resetTimers = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setSecondsLeft(WARN_BEFORE_MS / 1000);

    warnTimerRef.current = setTimeout(() => {
      startWarnCountdown();
    }, TIMEOUT_MS - WARN_BEFORE_MS);
  }, [clearAllTimers, startWarnCountdown]);

  // Iniciar timers y escuchar eventos al montar
  useEffect(() => {
    resetTimers();

    const handleActivity = () => {
      // Solo reiniciar si el modal NO está visible para no interrumpir el aviso
      if (!showWarning) resetTimers();
    };

    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, handleActivity, { passive: true })
    );

    return () => {
      clearAllTimers();
      ACTIVITY_EVENTS.forEach((e) =>
        window.removeEventListener(e, handleActivity)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative bg-white rounded-2xl w-full max-w-sm mx-4 overflow-hidden"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.22)" }}
      >
        <div className="px-6 pt-6 pb-5">
          <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] flex items-center justify-center mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-[#111318]">¿Sigues ahí?</h2>
          <p className="text-sm text-[#7B8099] mt-1.5 leading-relaxed">
            Tu sesión se cerrará en{" "}
            <span className="font-semibold text-[#111318]">{secondsLeft}s</span>{" "}
            por inactividad.
          </p>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={() => doLogout()}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-[#444A60] bg-[#F4F5F7] hover:bg-[#E8E9EF] rounded-xl transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
          <button
            onClick={resetTimers}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "#4C63FC" }}
          >
            Continuar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
