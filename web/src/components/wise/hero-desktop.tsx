"use client";

import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CAROUSEL_ITEMS,
  COLLAPSED_HEIGHT,
  COLLAPSED_RADIUS,
  EXPANDED_RADIUS,
  EXPANDED_SIZE,
  INTRO_CARD_H,
  INTRO_CARD_RADIUS,
  INTRO_CARD_SRC,
  INTRO_CARD_W,
  INTRO_VIDEO_SRC,
  getExpandedWidth,
  type CarouselItem,
} from "./carousel-data";
import { WiseFooter } from "./footer";
import { WiseHeader } from "./header";

const LOOP_ITEMS = [...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS];
const CARD_GAP = 12;
const MARQUEE_RESUME_MS = 80;
const META_GAP = 12;
const META_PAD_X = 16;
const TITLE_COL_W = 80;
const TRACK_MIN_H = 480;

/** intro-sequence/storyboard.md — card swipe reveals video, then expands to marquee */
const INTRO_CARD_IN = 0.66;
const INTRO_SWIPE_START = 0.95;
const INTRO_SWIPE_DUR = 0.35;
const INTRO_EXPAND_START = 1.1;
const INTRO_EXPAND_DUR = 0.35;
const INTRO_COMPLETE = 1.55;

function CarouselCard({
  item,
  cardKey,
  isActive,
  introLocked,
  onEnter,
  onLeave,
}: {
  item: CarouselItem;
  cardKey: string;
  isActive: boolean;
  introLocked: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const expandedWidth = getExpandedWidth(item.width);

  useGSAP(
    () => {
      const media = mediaRef.current;
      const meta = metaRef.current;
      const shell = shellRef.current;
      if (!media || !meta || !shell || introLocked) return;

      gsap.killTweensOf([media, meta, shell]);

      if (isActive) {
        gsap.set(shell, { zIndex: 30 });
        gsap.to(shell, {
          height: EXPANDED_SIZE,
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(media, {
          width: expandedWidth,
          height: EXPANDED_SIZE,
          borderRadius: EXPANDED_RADIUS,
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.fromTo(
          meta,
          { autoAlpha: 0, y: 8 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
            delay: 0.08,
            overwrite: "auto",
          }
        );
      } else {
        gsap.to(shell, {
          height: COLLAPSED_HEIGHT,
          duration: 0.35,
          ease: "power2.inOut",
          overwrite: "auto",
        });
        gsap.to(media, {
          width: item.width,
          height: COLLAPSED_HEIGHT,
          borderRadius: COLLAPSED_RADIUS,
          duration: 0.35,
          ease: "power2.inOut",
          overwrite: "auto",
        });
        gsap.to(meta, {
          autoAlpha: 0,
          y: 6,
          duration: 0.18,
          ease: "power2.in",
          overwrite: "auto",
        });
        gsap.set(shell, { zIndex: 0, delay: 0.35 });
      }
    },
    { dependencies: [isActive, expandedWidth, item.width, introLocked], scope: shellRef }
  );

  return (
    <div
      ref={shellRef}
      className="carousel-card relative shrink-0 self-center transition-[height] duration-300 ease-out"
      style={{ width: item.width, height: COLLAPSED_HEIGHT }}
      data-card-key={cardKey}
      data-active={isActive ? "true" : "false"}
      onMouseEnter={introLocked ? undefined : onEnter}
      onMouseLeave={introLocked ? undefined : onLeave}
    >
      <div
        ref={mediaRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
        style={{
          width: item.width,
          height: COLLAPSED_HEIGHT,
          borderRadius: COLLAPSED_RADIUS,
        }}
      >
        <Image
          src={item.src}
          alt={item.title}
          width={expandedWidth}
          height={EXPANDED_SIZE}
          className="size-full object-cover"
          draggable={false}
        />
      </div>

      <div
        ref={metaRef}
        className="pointer-events-none absolute left-1/2 opacity-0"
        style={{
          top: `calc(50% + ${EXPANDED_SIZE / 2 + META_GAP}px)`,
          width: expandedWidth,
          transform: "translateX(-50%)",
          paddingLeft: META_PAD_X,
          paddingRight: META_PAD_X,
        }}
      >
        <div className="flex items-start">
          <h3
            className="m-0 shrink-0 text-xs font-semibold leading-[1.35] text-black"
            style={{ width: TITLE_COL_W }}
          >
            {item.title}
          </h3>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-xs font-normal leading-normal text-[#666666]">
              {item.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#f0f0f0] px-2.5 py-1 text-[10px] font-normal leading-none text-[#333333]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WiseHeroDesktop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const introStageRef = useRef<HTMLDivElement>(null);
  const introCardRef = useRef<HTMLDivElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const activeKeyRef = useRef<string | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [activeKey, setActiveKeyState] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const setActiveKey = useCallback((key: string | null) => {
    activeKeyRef.current = key;
    setActiveKeyState(key);
  }, []);

  const syncMarquee = useCallback((hovering: boolean) => {
    const tween = tweenRef.current;
    if (!tween) return;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    if (hovering) {
      tween.pause();
      return;
    }
    resumeTimerRef.current = setTimeout(() => {
      if (!activeKeyRef.current && playingRef.current) tween.play();
    }, MARQUEE_RESUME_MS);
  }, []);

  const handleCardHover = useCallback(
    (key: string, entering: boolean) => {
      if (!introComplete) return;
      if (entering) {
        setActiveKey(key);
        syncMarquee(true);
      } else if (activeKeyRef.current === key) {
        setActiveKey(null);
        syncMarquee(false);
      }
    },
    [introComplete, setActiveKey, syncMarquee]
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      const stage = introStageRef.current;
      const card = introCardRef.current;
      const video = introVideoRef.current;
      if (!root || !stage || !card || !video) return;

      const cards = gsap.utils.toArray<HTMLElement>(".carousel-card", root);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.set(cards, { autoAlpha: 0 });
      gsap.set(stage, {
        autoAlpha: 0,
        width: INTRO_CARD_W,
        height: INTRO_CARD_H,
        borderRadius: COLLAPSED_RADIUS,
      });
      gsap.set(card, { x: 0 });
      gsap.set(video, { autoAlpha: 1 });

      if (reduced) {
        gsap.set(stage, { display: "none" });
        gsap.set(cards, { autoAlpha: 1 });
        setIntroComplete(true);
        return;
      }

      void video.play().catch(() => {});

      const tl = gsap.timeline();

      // empty → centered Wise card
      tl.to(stage, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, INTRO_CARD_IN);

      // card swipes right, revealing intro video underneath
      tl.to(
        card,
        { x: INTRO_CARD_W * 0.55, duration: INTRO_SWIPE_DUR, ease: "power2.inOut" },
        INTRO_SWIPE_START
      );
      tl.to(
        stage,
        {
          width: 720,
          duration: INTRO_SWIPE_DUR,
          ease: "power2.inOut",
        },
        INTRO_SWIPE_START
      );

      // pill expands full-width video strip
      tl.to(
        stage,
        {
          width: "100vw",
          borderRadius: COLLAPSED_RADIUS,
          duration: INTRO_EXPAND_DUR,
          ease: "power2.inOut",
        },
        INTRO_EXPAND_START
      );
      tl.to(
        card,
        { autoAlpha: 0, duration: 0.2, ease: "power2.in" },
        INTRO_EXPAND_START + 0.1
      );

      tl.to(cards, { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, INTRO_COMPLETE - 0.1);
      tl.to(stage, { autoAlpha: 0, duration: 0.25, ease: "power2.in" }, INTRO_COMPLETE);
      tl.call(
        () => {
          gsap.set(stage, { display: "none" });
          video.pause();
          setIntroComplete(true);
        },
        [],
        INTRO_COMPLETE + 0.25
      );

      return () => {
        tl.kill();
      };
    },
    { scope: rootRef }
  );

  useGSAP(
    () => {
      if (!introComplete) return;

      const track = trackRef.current;
      if (!track) return;

      const halfWidth = track.scrollWidth / 2;
      const pxPerSecond = 60;
      const duration = halfWidth / pxPerSecond;

      gsap.set(track, { x: 0 });

      const tween = gsap.to(track, {
        x: -halfWidth,
        duration,
        ease: "none",
        repeat: -1,
        onUpdate: () => {
          const raw = Math.abs(gsap.getProperty(track, "x") as number) / halfWidth;
          track.dispatchEvent(
            new CustomEvent("wise-marquee-progress", { detail: raw % 1 })
          );
        },
      });

      tweenRef.current = tween;
      playingRef.current = true;
      setPlaying(true);

      return () => {
        tween.kill();
      };
    },
    { dependencies: [introComplete], scope: rootRef }
  );

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

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

  const togglePlay = () => {
    if (!introComplete) return;
    const tween = tweenRef.current;
    if (!tween || activeKeyRef.current) return;
    const next = !playing;
    if (next) tween.play();
    else tween.pause();
    setPlaying(next);
    playingRef.current = next;
  };

  return (
    <div
      ref={rootRef}
      className="flex min-h-screen flex-col overflow-x-hidden bg-white font-[family-name:var(--font-inter)] text-black"
      onMouseLeave={() => {
        if (!introComplete) return;
        setActiveKey(null);
        syncMarquee(false);
      }}
    >
      <WiseHeader playing={introComplete && playing && !activeKey} onTogglePlay={togglePlay} />

      <div
        className="relative flex flex-1 items-center overflow-x-hidden overflow-y-visible"
        style={{ minHeight: TRACK_MIN_H }}
      >
        <div
          ref={introStageRef}
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          aria-hidden={introComplete}
        >
          <video
            ref={introVideoRef}
            src={INTRO_VIDEO_SRC}
            className="absolute inset-0 size-full object-cover"
            muted
            playsInline
            loop
            preload="auto"
          />
          <div ref={introCardRef} className="absolute inset-y-0 left-0 z-10" style={{ width: INTRO_CARD_W }}>
            <Image
              src={INTRO_CARD_SRC}
              alt=""
              width={INTRO_CARD_W}
              height={INTRO_CARD_H}
              className="size-full object-cover"
              style={{ borderRadius: INTRO_CARD_RADIUS }}
              draggable={false}
              priority
            />
          </div>
        </div>

        <div
          ref={trackRef}
          className={`flex w-max items-center will-change-transform ${introComplete ? "" : "pointer-events-none"}`}
          style={{ gap: CARD_GAP, minHeight: TRACK_MIN_H }}
        >
          {LOOP_ITEMS.map((item, index) => {
            const cardKey = `${item.title}-${index}`;
            return (
              <CarouselCard
                key={cardKey}
                item={item}
                cardKey={cardKey}
                isActive={activeKey === cardKey}
                introLocked={!introComplete}
                onEnter={() => handleCardHover(cardKey, true)}
                onLeave={() => handleCardHover(cardKey, false)}
              />
            );
          })}
        </div>
      </div>

      <WiseFooter progress={introComplete ? progress : 0} />
    </div>
  );
}
