import { SVGProps } from "react";

export function IconStockSummary(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        {...props}
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 9H6m9.5 2a2.5 2.5 0 1 1 0-5a2.5 2.5 0 0 1 0 5M6 6h3m9 12l-4.5-3l-2.5 2l-5-4"
          ></path>
          <path d="M3 20.4V3.6a.6.6 0 0 1 .6-.6h16.8a.6.6 0 0 1 .6.6v16.8a.6.6 0 0 1-.6.6H3.6a.6.6 0 0 1-.6-.6Z"></path>
        </g>
      </svg>
    )
  }
  