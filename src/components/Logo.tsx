import * as React from "react";
import { cn } from "@/lib/utils";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className={cn("rounded-lg", props.className)}
    {...props}
  >
    <rect width="100" height="100" rx="20" fill="black" />
    <defs>
      <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#FBBF24" }} />
        <stop offset="100%" style={{ stopColor: "#D97706" }} />
      </linearGradient>
    </defs>
    <g fill="url(#gold-gradient)">
      <path d="M22 25 C22 22, 22 22, 25 22 L75 22 C78 22, 78 22, 78 25 L78 80 C78 83, 78 83, 75 83 L25 83 C22 83, 22 83, 22 80 Z" />
      <path d="M45 22 L55 22 L58 18 L42 18 Z" />
      <rect x="28" y="30" width="44" height="12" rx="2" />
      
      <rect x="30" y="48" width="8" height="8" rx="2" />
      <rect x="46" y="48" width="8" height="8" rx="2" />
      <rect x="62" y="48" width="8" height="8" rx="2" />

      <rect x="30" y="60" width="8" height="8" rx="2" />
      <rect x="46" y="60" width="8" height="8" rx="2" />
      <rect x="62" y="60" width="8" height="8" rx="2" />
      
      <rect x="30" y="72" width="8" height="8" rx="2" />
      <rect x="46" y="72" width="24" height="8" rx="2" />
    </g>
  </svg>
);
