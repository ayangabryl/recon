type DashedDividerProps = {
  className?: string;
};

export function DashedDivider({ className = "" }: DashedDividerProps) {
  return (
    <div
      className={`h-px w-full border-t border-dashed border-black/10 ${className}`}
      aria-hidden="true"
    />
  );
}
