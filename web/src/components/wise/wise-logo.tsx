import Image from "next/image";
import Link from "next/link";
import { LOGO_MASK_SRC, LOGO_PATTERN_SRC } from "./carousel-data";

export function WiseLogo() {
  return (
    <Link
      href="/wise"
      aria-label="Wise Fastflag logo"
      className="relative block size-10 shrink-0 overflow-hidden rounded-[6.67px] p-[6.667px]"
    >
      <div className="relative size-[26.5px] overflow-hidden">
        <Image
          src={LOGO_PATTERN_SRC}
          alt=""
          width={128}
          height={53}
          aria-hidden
          className="pointer-events-none absolute left-[-190%] top-[-50%] h-[200%] w-[480%] max-w-none object-cover"
          draggable={false}
        />
        <div
          className="absolute inset-0 bg-[#163300]"
          style={{
            WebkitMaskImage: `url(${LOGO_MASK_SRC})`,
            maskImage: `url(${LOGO_MASK_SRC})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
      </div>
    </Link>
  );
}
