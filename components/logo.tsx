export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-1 -1 514 514"
      className={className}
      shapeRendering="geometricPrecision"
    >
      <circle cx="256" cy="256" r="256" className="fill-muted/40" />
      <g
        className="fill-none stroke-white"
        strokeWidth="56"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-24,0)"
      >
        {/* F */}
        <path d="M140 128V384" />
        <path d="M140 128H276" />
        <path d="M140 256H248" />
        {/* G */}
        <path d="M420 176A120 120 0 1 0 420 336" />
        <path d="M420 336H468" />
        <path d="M402 256H468" />
      </g>
    </svg>
  );
}
