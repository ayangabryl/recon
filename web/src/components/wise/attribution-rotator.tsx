"use client";

import { useEffect, useRef, useState } from "react";
import {
  ATTRIBUTION_INTERVAL_MS,
  ATTRIBUTION_LINES,
  ATTRIBUTION_SLIDE_MS,
} from "./attribution-data";

export function WiseAttributionRotator() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"show" | "out">("show");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setPhase("out");
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % ATTRIBUTION_LINES.length);
        setPhase("show");
      }, ATTRIBUTION_SLIDE_MS);
    }, ATTRIBUTION_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div
      className="vertical-text-rotator h-[18px] w-[220px] overflow-hidden text-xs text-black"
      aria-live="polite"
    >
      <p
        className={`vertical-text-rotator__item m-0 leading-[18px] transition-all duration-300 ease-in-out ${
          phase === "out"
            ? "-translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        {ATTRIBUTION_LINES[index]}
      </p>
    </div>
  );
}
