import { useId } from "react";

export default function Postmark({
  ring,
  center,
  date,
  size = 104,
  className = "",
}: {
  ring: string;
  center: string;
  date: string;
  size?: number;
  className?: string;
}) {
  const id = `pm${useId().replace(/:/g, "")}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <path id={id} d="M48 48m-34 0a34 34 0 1 1 68 0a34 34 0 1 1-68 0" />
      </defs>
      <circle cx="48" cy="48" r="46" fill="var(--paper)" />
      <circle cx="48" cy="48" r="43" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
      <circle cx="48" cy="48" r="25" fill="none" stroke="var(--accent)" strokeWidth="1" />
      <text
        fontFamily="var(--font-ui)"
        fontSize="9.5"
        fontWeight="600"
        letterSpacing="1.6"
        fill="var(--accent)"
      >
        <textPath href={`#${id}`}>{ring}</textPath>
      </text>
      <text
        x="48"
        y="46"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontStyle="italic"
        fontSize="17"
        fill="var(--accent)"
      >
        {center}
      </text>
      <text
        x="48"
        y="60"
        textAnchor="middle"
        fontFamily="var(--font-ui)"
        fontSize="8"
        fontWeight="600"
        letterSpacing="1"
        fill="var(--accent)"
      >
        {date}
      </text>
    </svg>
  );
}
