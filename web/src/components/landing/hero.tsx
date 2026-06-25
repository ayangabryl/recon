import { IntegrationIcons } from "@/components/landing/integration-icons";

const SPLINE_URL =
  "https://my.spline.design/voiceinteractionanimation-HUS75bKe034bgs2aR3N3AiML/?hideWatermark=true";

const PRIMARY_SHADOW =
  "0 0.706592px 0.706592px -0.625px rgba(0,0,0,0.15), 0 1.80656px 1.80656px -1.25px rgba(0,0,0,0.14), 0 3.62176px 3.62176px -1.875px rgba(0,0,0,0.14), 0 6.8656px 6.8656px -2.5px rgba(0,0,0,0.13), 0 13.6468px 13.6468px -3.125px rgba(0,0,0,0.1), 0 30px 30px -3.75px rgba(0,0,0,0.05)";

export function SplineHero() {
  return (
    <div className="relative h-[540px] w-full overflow-hidden">
      <iframe
        src={SPLINE_URL}
        title="Voice interaction animation"
        className="absolute inset-0 h-full w-full border-0"
        loading="eager"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[245px]"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, #ffffff 100%)",
        }}
      />
    </div>
  );
}

export function HeroContent() {
  return (
    <div className="pt-2">
      <h1 className="font-display text-[42px] leading-[46.2px] font-normal lowercase text-ink">
        introducing vocorize
      </h1>

      <div className="mt-6 space-y-[22px] text-base leading-[22.4px] lowercase text-ink-body">
        <p>a tiny mac app that types what you say.</p>
        <p>instantly.</p>
        <p>right where your cursor is.</p>
        <p>works offline. no accounts. no tracking.</p>
      </div>

        <div className="mt-[44px] flex flex-wrap items-center gap-[15px]">
        <a
          href="https://github.com/vocorize/app/releases"
          className="rounded-[30px] bg-[#222] px-[15px] py-[15px] text-sm font-bold leading-[1.4] text-white no-underline"
          style={{ boxShadow: PRIMARY_SHADOW }}
        >
          download now
        </a>
        <a
          href="https://github.com/vocorize/app"
          className="rounded-full bg-[#ebebeb] px-[15px] py-[15px] text-sm font-bold leading-[1.4] text-[#333] no-underline"
        >
          star us on github
        </a>
      </div>

      <IntegrationIcons />
    </div>
  );
}
