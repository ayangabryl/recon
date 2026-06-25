import { WiseAttributionRotator } from "./attribution-rotator";
import {
  PROGRESS_THUMB_WIDTH,
  PROGRESS_TRACK_HEIGHT,
  PROGRESS_TRACK_WIDTH,
} from "./carousel-data";

export function WiseFooter({ progress, showProgress = true }: { progress: number; showProgress?: boolean }) {
  const thumbLeft = progress * (PROGRESS_TRACK_WIDTH - PROGRESS_THUMB_WIDTH);

  return (
    <footer className="flex items-end justify-between px-4 pb-6 pt-4 md:grid md:grid-cols-[1fr_auto_1fr] md:px-8 md:pb-8">
      <WiseAttributionRotator />

      <div
        className={`relative rounded-full bg-black/[0.08] ${showProgress ? "hidden md:block" : "hidden"}`}
        style={{ width: PROGRESS_TRACK_WIDTH, height: PROGRESS_TRACK_HEIGHT }}
        aria-label="line"
      >
        <div
          className="absolute top-0 rounded-full bg-[rgb(31,41,55)]"
          style={{
            width: PROGRESS_THUMB_WIDTH,
            height: PROGRESS_TRACK_HEIGHT,
            left: thumbLeft,
          }}
        />
      </div>

      <div className="flex flex-col items-end gap-1 text-xs text-black">
        <a href="https://www.instagram.com/wisedesign" className="hover:underline">
          Instagram
        </a>
        <a href="https://wise.jobs/" className="hover:underline">
          Careers
        </a>
      </div>
    </footer>
  );
}
