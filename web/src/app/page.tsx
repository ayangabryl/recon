import { Footer } from "@/components/landing/footer";
import { HeroContent, SplineHero } from "@/components/landing/hero";
import { PageFrame } from "@/components/landing/page-frame";
import { Section } from "@/components/landing/section";
import { DashedDivider } from "@/components/landing/dashed-divider";

export default function Home() {
  return (
    <main className="w-full">
      <SplineHero />

      <PageFrame>
        <HeroContent />

        <DashedDivider className="mb-[70px]" />

        <Section title="hi :)" divider={false}>
          <p>
            this isn&apos;t an ai startup trying to raise a seed round. it&apos;s just a tool i
            needed, and maybe you do too. so i built it.
          </p>
          <p>for me. for you.</p>
          <p>for anyone who thinks faster than they type.</p>
        </Section>

        <Section title="why i built it">
          <ul className="list-disc space-y-[22px] pl-5">
            <li>
              i got tired of speech-to-text tools that needed accounts, internet, and monthly
              subscriptions.
            </li>
            <li>writing a quick note shouldn&apos;t mean streaming my voice to some server.</li>
            <li>none of it felt private or simple.</li>
          </ul>
          <p>i just wanted to hit a key, say my thought, and have it typed out. fast. local. mine.</p>
          <p>
            that tool didn&apos;t exist, so i built vocorize, it listens when you tell it to and
            shuts up when you&apos;re done.
          </p>
          <p>your voice stays on your machine.</p>
          <p>it&apos;s open source, because it should be.</p>
        </Section>

        <Section title="who it's for">
          <ul className="list-disc space-y-[22px] pl-5">
            <li>innovators</li>
            <li>slower typists</li>
            <li>people with a lot on their mind</li>
            <li>people with too many tabs open</li>
            <li>anyone who&apos;d rather talk than type :)</li>
          </ul>
        </Section>

        <Section title="how it works">
          <ol className="list-decimal space-y-[22px] pl-5">
            <li>press your hotkey</li>
            <li>speak your thought</li>
            <li>release - it appears where your cursor is</li>
          </ol>
        </Section>

        <Section title="what you need to know">
          <ul className="list-disc space-y-[22px] pl-5">
            <li>runs only on mac (Apple Silicon for now)</li>
            <li>needs mic + accessibility permissions to do its thing</li>
            <li>uses whisper.cpp under the hood</li>
            <li>no server involved</li>
            <li>open source forever</li>
            <li>no analytics</li>
            <li>no nonsense</li>
          </ul>
        </Section>

        <Section title="pricing">
          <p>free during beta.</p>
          <p>
            later, there&apos;ll be a lifetime access option: one-time payment, all updates, no
            upsells.
          </p>
          <p>buy it once. it&apos;s yours forever.</p>
          <p>because tools should feel like tools, not like renting your own keyboard.</p>
          <p>if you&apos;d rather build your own, you can.</p>
          <p>it&apos;s open source.</p>
          <p>
            but if you want to support the work, grab lifetime access and help keep it alive :)
          </p>
        </Section>

        <Section title="tl;dr">
          <p>
            vocorize is a tiny mac app that turns your voice into text, fast, clean, and offline.
          </p>
          <p>just press a hotkey, speak, release - it types right where your cursor is.</p>
          <p>no accounts. no subscriptions. no internet required.</p>
          <p>runs fully on-device using whisper.cpp.</p>
          <p>apple silicon only.</p>
          <p>open source.</p>
          <p>free for now. one-time payment later.</p>
          <p>i built it because nothing out there was simple, local, and actually yours.</p>
        </Section>

        <Footer />
      </PageFrame>
    </main>
  );
}
