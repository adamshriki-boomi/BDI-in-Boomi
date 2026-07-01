import * as React from 'react';
import type { SVGProps } from 'react';
const SvgWarningCircle = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={25}
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 22.5C6.47727 22.5 2 18.0227 2 12.5C2 6.97727 6.47727 2.5 12 2.5C17.5227 2.5 22 6.97727 22 12.5C22 18.0227 17.5227 22.5 12 22.5Z"
      fill="#F32002"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 15.5C11.4477 15.5 11 15.0523 11 14.5L11 7.5C11 6.94772 11.4477 6.5 12 6.5C12.5523 6.5 13 6.94772 13 7.5L13 14.5C13 15.0523 12.5523 15.5 12 15.5Z"
      fill="white"
    />
    <circle cx={12} cy={17.5} r={1} fill="white" />
  </svg>
);
export default SvgWarningCircle;
