import * as React from 'react';
import type { SVGProps } from 'react';
const SvgMdClose = (props: SVGProps<SVGSVGElement>) => (
  <svg
    height="1rem"
    width="1rem"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 22C6.47727 22 2 17.5227 2 12C2 6.47727 6.47727 2 12 2C17.5227 2 22 6.47727 22 12C22 17.5227 17.5227 22 12 22Z"
      fill="inherit"
    />
    <path
      d="M9.17157 9.17158L14.8284 14.8284"
      stroke="currentColor"
      strokeLinecap="round"
    />
    <path
      d="M14.8284 9.17158L9.17158 14.8284"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </svg>
);
export default SvgMdClose;
