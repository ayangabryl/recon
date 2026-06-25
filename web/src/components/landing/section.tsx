import type { ReactNode } from "react";
import { DashedDivider } from "@/components/landing/dashed-divider";

type SectionProps = {
  title: string;
  children: ReactNode;
  divider?: boolean;
};

export function Section({ title, children, divider = true }: SectionProps) {
  return (
    <section>
      {divider ? <DashedDivider className="mb-[70px]" /> : null}
      <h1 className="font-display text-[42px] leading-[46.2px] font-normal lowercase text-ink">
        {title}
      </h1>
      <div className="mt-6 space-y-[22px] text-base leading-[22.4px] lowercase text-ink-body">
        {children}
      </div>
    </section>
  );
}
