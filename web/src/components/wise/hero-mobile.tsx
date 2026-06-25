"use client";

import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import {
  CAROUSEL_ITEMS,
  getMobileCardHeight,
  getMobileCardRadius,
  MOBILE_CARD_W,
  type CarouselItem,
} from "./carousel-data";
import { WiseFooter } from "./footer";
import { WiseHeader } from "./header";

const LOOP_ITEMS = [...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS];
const MARQUEE_PX_PER_SEC = 60;

function MobileCarouselCard({ item }: { item: CarouselItem }) {
  const height = getMobileCardHeight(item.width);
  const radius = getMobileCardRadius(height);

  return (
    <div
      className="carousel-card shrink-0 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
      style={{
        width: MOBILE_CARD_W,
        height,
        borderRadius: radius,
      }}
    >
      <Image
        src={item.src}
        alt={item.title}
        width={MOBILE_CARD_W}
        height={height}
        className="size-full object-cover"
        draggable={false}
      />
    </div>
  );
}

export function WiseHeroMobile() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const halfHeight = track.scrollHeight / 2;
      const duration = halfHeight / MARQUEE_PX_PER_SEC;

      gsap.set(track, { y: 0 });

      const tween = gsap.to(track, {
        y: -halfHeight,
        duration,
        ease: "none",
        repeat: -1,
        onUpdate: () => {
          const raw = Math.abs(gsap.getProperty(track, "y") as number) / halfHeight;
          track.dispatchEvent(
            new CustomEvent("wise-marquee-progress", { detail: raw % 1 })
          );
        },
      });

      return () => {
        tween.kill();
      };
    },
    { scope: rootRef }
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onProgress = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === "number") setProgress(detail);
    };
    track.addEventListener("wise-marquee-progress", onProgress as EventListener);
    return () => track.removeEventListener("wise-marquee-progress", onProgress as EventListener);
  }, []);

  return (
    <div
      ref={rootRef}
      className="flex min-h-[100dvh] flex-col overflow-hidden bg-white font-[family-name:var(--font-inter)] text-black"
    >
      <WiseHeader playing={false} onTogglePlay={() => {}} mobile />

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div
          ref={trackRef}
          className="flex w-full flex-col items-center will-change-transform"
        >
          {LOOP_ITEMS.map((item, index) => (
            <MobileCarouselCard key={`${item.title}-${index}`} item={item} />
          ))}
        </div>
      </div>

      <WiseFooter progress={progress} showProgress={false} />
    </div>
  );
}
