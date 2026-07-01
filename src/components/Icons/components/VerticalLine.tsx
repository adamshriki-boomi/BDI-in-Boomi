import * as React from 'react';
import type { SVGProps } from 'react';
const SvgVerticalLine = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={10}
    height={18}
    viewBox="0 0 10 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M5 0L5 12" stroke="#CED4DA" strokeWidth={3} />
  </svg>
);
export default SvgVerticalLine;
