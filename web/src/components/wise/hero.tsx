"use client";

import { useEffect, useState } from "react";
import { MOBILE_BREAKPOINT_PX } from "./carousel-data";
import { WiseHeroDesktop } from "./hero-desktop";
import { WiseHeroMobile } from "./hero-mobile";

type Layout = "desktop" | "mobile";

function getLayout(): Layout {
  return window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT_PX}px)`).matches
    ? "desktop"
    : "mobile";
}

export function WiseHero() {
  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT_PX}px)`);
    const update = () => setLayout(getLayout());
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (layout === null) {
    return <div className="min-h-[100dvh] bg-white" aria-hidden />;
  }

  return layout === "desktop" ? <WiseHeroDesktop /> : <WiseHeroMobile />;
}
