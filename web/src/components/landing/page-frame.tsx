import type { ReactNode } from "react";

type PageFrameProps = {
  children: ReactNode;
  className?: string;
};

export function PageFrame({ children, className = "" }: PageFrameProps) {
  return (
    <div
      className={`mx-auto w-[420px] border-x border-dashed border-black/10 ${className}`}
    >
      <div className="mx-auto w-[380px] text-left">{children}</div>
    </div>
  );
}
