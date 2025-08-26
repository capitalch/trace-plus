import { SVGProps } from "react";

export function IconChangeArrow(
    props: SVGProps<SVGSVGElement>,
  ) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        width="1em"
        height="1em"
        {...props}
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m11.5 3.5l-3-3l-3 3"></path>
          <path d="M2.5 13.5h2a4 4 0 0 0 4-4v-9"></path>
        </g>
      </svg>
    )
  }
  