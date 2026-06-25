import { DashedDivider } from "@/components/landing/dashed-divider";

export function Footer() {
  return (
    <footer className="pb-16">
      <DashedDivider className="mb-[70px]" />
      <div className="flex items-start justify-between gap-8">
        <div>
          <h1 className="font-display text-[42px] leading-[46.2px] font-normal lowercase text-ink">
            made by tanvir
          </h1>
          <p className="mt-6 text-base leading-[22.4px] lowercase text-ink-body">
            with care and caffeine. for ppl who think faster than they type.
          </p>
        </div>
        <nav className="flex shrink-0 flex-col gap-2 pt-2 text-base leading-[1.4]">
          <a href="#" className="lowercase text-[rgba(0,0,0,0.72)] no-underline">
            linkedin
          </a>
          <a href="#" className="lowercase text-[rgba(0,0,0,0.72)] no-underline">
            twitter
          </a>
          <a href="#" className="lowercase text-[rgba(0,0,0,0.72)] no-underline">
            email
          </a>
          <span className="lowercase text-[rgba(0,0,0,0.72)]">;)</span>
        </nav>
      </div>
    </footer>
  );
}
