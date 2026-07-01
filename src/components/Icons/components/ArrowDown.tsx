import * as React from 'react';
import type { SVGProps } from 'react';
const SvgArrowDown = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={10}
    height={18}
    viewBox="0 0 10 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M5 18L0.669873 10.5L9.33013 10.5L5 18Z" fill="#CED4DA" />
    <path d="M5 0L5 12" stroke="#CED4DA" strokeWidth={3} />
  </svg>
);
export default SvgArrowDown;
