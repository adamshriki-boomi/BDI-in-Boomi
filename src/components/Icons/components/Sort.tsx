import * as React from 'react';
import type { SVGProps } from 'react';
const SvgSort = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.5 6L16 10.9H9L12.5 6Z"
      fill="#505050"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.5 17.8999L9 12.9999H16L12.5 17.8999Z"
      fill="#505050"
    />
  </svg>
);
export default SvgSort;
