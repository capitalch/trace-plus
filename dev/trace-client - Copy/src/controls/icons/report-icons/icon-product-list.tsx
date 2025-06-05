import { SVGProps } from "react";

export function IconProductList(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="1em"
        height="1em"
        {...props}
      >
        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        >
          <path
            fill="#2F88FF"
            stroke="#000"
            d="M33 12H15L10 17.8428V38.0919L15 44H33L38 38.0919V17.8428L33 12Z"
          ></path>
          <path stroke="#fff" d="M19 20H23.5455H29"></path>
          <path
            stroke="#000"
            d="M33 12V7C33 5.34315 31.6569 4 30 4H18C16.3431 4 15 5.34315 15 7V12"
          ></path>
          <circle cx="24" cy="32" r="5" stroke="#fff"></circle>
        </g>
      </svg>
    )
  }
  