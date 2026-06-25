import Image from "next/image";

type IntegrationIcon = {
  name: string;
  src: string;
  bg: string;
  rounded: string;
  invert?: boolean;
};

const INTEGRATIONS: IntegrationIcon[] = [
  { name: "ChatGPT", src: "/icons/openai.svg", bg: "bg-black", rounded: "rounded-[12px]", invert: true },
  { name: "Cursor", src: "/icons/cursor.svg", bg: "bg-[#14120b]", rounded: "rounded-full" },
  { name: "Raycast", src: "/icons/raycast.svg", bg: "bg-[#f4f4f4]", rounded: "rounded-full", invert: true },
  { name: "Figma", src: "/icons/figma.svg", bg: "bg-[#f4f4f4]", rounded: "rounded-full" },
  { name: "GitHub", src: "/icons/github.svg", bg: "bg-[#f4f4f4]", rounded: "rounded-full", invert: true },
  { name: "Slack", src: "/icons/slack.svg", bg: "bg-[#f4f4f4]", rounded: "rounded-full" },
  { name: "Linear", src: "/icons/linear.svg", bg: "bg-[#f4f4f4]", rounded: "rounded-full", invert: true },
];

export function IntegrationIcons() {
  return (
    <div className="mt-[50px] w-full">
      <p className="text-xs tracking-[0.48px] text-ink-muted uppercase">
        works in every app you love
      </p>
      <div className="mt-[16px] mb-[70px] flex w-[380px] items-center justify-between">
        {INTEGRATIONS.map((icon) => (
          <div
            key={icon.name}
            className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden ${icon.rounded} ${icon.bg}`}
            title={icon.name}
          >
            <Image
              src={icon.src}
              alt=""
              width={22}
              height={22}
              className={`h-[22px] w-[22px] ${icon.invert ? "brightness-0 invert" : ""}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
