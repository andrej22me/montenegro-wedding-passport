import Image from "next/image";

const SHADOWS = {
  card: "drop-shadow(0 2px 4px color-mix(in srgb, var(--ink) 15%, transparent))",
  sheet: "drop-shadow(0 3px 8px color-mix(in srgb, var(--ink) 18%, transparent))",
} as const;

export default function Stamp({
  src,
  alt,
  width,
  height,
  padding = 7,
  shadow,
  fluid = false,
  sizes,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  padding?: number;
  shadow?: keyof typeof SHADOWS;
  /** Fill the parent at a 4:5 ratio. */
  fluid?: boolean;
  sizes?: string;
  className?: string;
}) {
  const frame = fluid ? (
    <div className={`stamp flex aspect-[4/5] w-full ${className}`} style={{ padding }}>
      <div className="relative min-h-0 flex-1">
        <Image src={src} alt={alt} fill sizes={sizes ?? "160px"} className="object-cover" />
      </div>
    </div>
  ) : (
    <div className={`stamp ${className}`} style={{ width, height, padding }}>
      <Image src={src} alt={alt} width={width} height={height} sizes={sizes ?? `${width}px`} />
    </div>
  );

  if (!shadow) return frame;

  return <div style={{ filter: SHADOWS[shadow] }}>{frame}</div>;
}
