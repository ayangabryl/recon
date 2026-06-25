"use client";

import Link from "next/link";
import { TabsSegment } from "@/components/ui/tabs-segment";
import { WiseLogo } from "./wise-logo";
import { WiseDirectionIcon, WiseGlobeIcon, WisePadlockIcon } from "./wise-mobile-icons";
import { WisePauseButton } from "./wise-pause-button";

const WISE_TABS_CLASS = "wise-tabs t-tabs";

function MobileHeader() {
  return (
    <header className="relative flex items-center px-4 py-4 md:hidden">
      <WiseLogo />

      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
        <Link
          href="/wise"
          aria-label="Inspiration"
          className="flex size-10 items-center justify-center rounded-full bg-[rgb(34,61,13)] text-[#9fe870]"
        >
          <WiseGlobeIcon className="size-5" />
        </Link>
        <Link
          href="https://wise.design/direction"
          aria-label="Direction"
          className="flex size-10 items-center justify-center rounded-full text-[#163300]"
        >
          <WiseDirectionIcon className="size-[18px]" />
        </Link>
      </div>

      <a
        href="https://docs.wise.design/"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[rgba(62,59,7,0.07)] px-3 text-sm text-[#0e0f0c]"
      >
        <WisePadlockIcon className="size-4" />
        Docs
      </a>
    </header>
  );
}

function DesktopHeader({
  playing,
  onTogglePlay,
}: {
  playing: boolean;
  onTogglePlay: () => void;
}) {
  return (
    <header className="hidden items-center justify-between px-8 py-6 md:flex">
      <WiseLogo />

      <TabsSegment
        items={["Inspiration", "Direction"] as const}
        initial="Inspiration"
        className={`${WISE_TABS_CLASS} mx-auto`}
      />

      <WisePauseButton playing={playing} onClick={onTogglePlay} />
    </header>
  );
}

export function WiseHeader({
  playing,
  onTogglePlay,
  mobile = false,
}: {
  playing: boolean;
  onTogglePlay: () => void;
  mobile?: boolean;
}) {
  if (mobile) {
    return <MobileHeader />;
  }

  return <DesktopHeader playing={playing} onTogglePlay={onTogglePlay} />;
}
