// icon:controller | CSS Icons https://css.gg/ | Astrit
import * as React from "react";

export function IconControls(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" height="1em" width="1em" {...props}>
      <path
        fill="currentColor"
        d="M14.828 6.343l1.415-1.414L12 .686 7.757 4.93l1.415 1.414L12 3.515l2.828 2.828zM4.929 16.243l1.414-1.415L3.515 12l2.828-2.828L4.93 7.757.686 12l4.243 4.243zM7.757 19.071L12 23.314l4.243-4.243-1.415-1.414L12 20.485l-2.828-2.828-1.415 1.414zM17.657 9.172L20.485 12l-2.828 2.828 1.414 1.415L23.314 12 19.07 7.757l-1.414 1.415z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 8a4 4 0 110 8 4 4 0 010-8zm0 2a2 2 0 110 4 2 2 0 010-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}