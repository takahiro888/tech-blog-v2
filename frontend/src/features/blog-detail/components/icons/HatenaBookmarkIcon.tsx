import type { SVGProps } from "react";

export function HatenaBookmarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect width="24" height="24" rx="5" fill="#00A4DE" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="13"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        fill="#fff"
      >
        B!
      </text>
    </svg>
  );
}
