import type { Metadata } from "next";
import { WiseHero } from "@/components/wise/hero";

export const metadata: Metadata = {
  title: "Wise Design | Building a System for a Borderless World",
  description: "Wise Design inspiration carousel — clone for research.",
};

export default function WisePage() {
  return (
    <main>
      <WiseHero />
    </main>
  );
}
