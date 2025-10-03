import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
export { SvgComponent as IconCross };
