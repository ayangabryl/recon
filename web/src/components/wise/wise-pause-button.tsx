const CIRCLE_BG =
  "M0 24C0 10.7452 10.7452 0 24 0V0C37.2548 0 48 10.7452 48 24V24C48 37.2548 37.2548 48 24 48V48C10.7452 48 0 37.2548 0 24V24Z";

export function WisePauseButton({
  playing,
  onClick,
}: {
  playing: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={playing ? "pause-carousel" : "play-carousel"}
      className="relative size-11 shrink-0 cursor-pointer"
      data-name="Pause/Play"
    >
      <svg viewBox="0 0 48 48" className="block size-full" fill="none" aria-hidden>
        <path d={CIRCLE_BG} fill="#3E3B07" fillOpacity={0.07} />
        {playing ? (
          <g>
            <path
              d="M22.2 30.75C22.2 31.9926 21.1926 33 19.95 33H17.25C16.0074 33 15 31.9926 15 30.75V17.25C15 16.0074 16.0074 15 17.25 15H19.95C21.1926 15 22.2 16.0074 22.2 17.25V30.75Z"
              fill="#163300"
            />
            <path
              d="M33 30.75C33 31.9926 31.9926 33 30.75 33H28.05C26.8074 33 25.8 31.9926 25.8 30.75V17.25C25.8 16.0074 26.8074 15 28.05 15H30.75C31.9926 15 33 16.0074 33 17.25V30.75Z"
              fill="#163300"
            />
          </g>
        ) : (
          <g transform="translate(17, 15)">
            <path
              d="M15 7.19959C16.3333 7.96939 16.3333 9.89389 15 10.6637L3 17.5919C1.66667 18.3617 1.01267e-06 17.3994 1.07997e-06 15.8598L1.68565e-06 2.00344C1.75295e-06 0.463837 1.66667 -0.498414 3 0.271387L15 7.19959Z"
              fill="#163300"
            />
          </g>
        )}
      </svg>
    </button>
  );
}
