"use client";

import { useEffect, useRef, useState } from "react";

type TabsSegmentProps<T extends string> = {
  items: readonly T[];
  initial: T;
  className?: string;
  tabClassName?: string;
};

function movePill(pill: HTMLSpanElement, tab: HTMLElement, animate: boolean) {
  if (!animate) {
    const prev = pill.style.transition;
    pill.style.transition = "none";
    pill.style.transform = `translateX(${tab.offsetLeft}px)`;
    pill.style.width = `${tab.offsetWidth}px`;
    void pill.offsetWidth;
    pill.style.transition = prev;
  } else {
    pill.style.transform = `translateX(${tab.offsetLeft}px)`;
    pill.style.width = `${tab.offsetWidth}px`;
  }
}

export function TabsSegment<T extends string>({
  items,
  initial,
  className = "",
  tabClassName = "",
}: TabsSegmentProps<T>) {
  const barRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<T>(initial);

  useEffect(() => {
    const bar = barRef.current;
    const pill = pillRef.current;
    if (!bar || !pill) return;

    const sync = () => {
      const tab = bar.querySelector<HTMLElement>(`[data-value="${active}"]`);
      if (tab) movePill(pill, tab, false);
    };

    requestAnimationFrame(sync);
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [active]);

  const handleClick = (value: T, event: React.MouseEvent<HTMLButtonElement>) => {
    const pill = pillRef.current;
    if (!pill) return;
    setActive(value);
    movePill(pill, event.currentTarget, true);
  };

  return (
    <div ref={barRef} className={`t-tabs ${className}`} role="tablist">
      <span ref={pillRef} className="t-tabs-pill" aria-hidden />
      {items.map((item) => (
        <button
          key={item}
          type="button"
          role="tab"
          data-value={item}
          aria-selected={active === item}
          className={`t-tab ${tabClassName}`}
          onClick={(event) => handleClick(item, event)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
