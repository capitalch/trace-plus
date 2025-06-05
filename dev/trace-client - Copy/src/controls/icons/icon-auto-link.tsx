// icon:arrow-autofit-content | Tabler Icons https://tablericons.com/ | Csaba Kissi

export function IconAutoLink(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" />
      <path d="M6 4L3 7l3 3M18 4l3 3-3 3" />
      <path d="M6 14 H18 A2 2 0 0 1 20 16 V18 A2 2 0 0 1 18 20 H6 A2 2 0 0 1 4 18 V16 A2 2 0 0 1 6 14 z" />
      <path d="M10 7H3M21 7h-7" />
    </svg>
  );
}
