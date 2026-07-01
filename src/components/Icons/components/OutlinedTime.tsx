import * as React from 'react';
import type { SVGProps } from 'react';
const SvgOutlinedTime = (props: SVGProps<SVGSVGElement>) => (
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
      d="M12 4.03593C7.60156 4.03593 4.03593 7.60156 4.03593 12C4.03593 16.3984 7.60156 19.9641 12 19.9641C16.3984 19.9641 19.9641 16.3984 19.9641 12C19.9641 7.60156 16.3984 4.03593 12 4.03593ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 5.59281C12.5622 5.59281 13.018 6.04857 13.018 6.61078V10.982H16.0419C16.6041 10.982 17.0599 11.4378 17.0599 12C17.0599 12.5622 16.6041 13.018 16.0419 13.018H12C11.4378 13.018 10.982 12.5622 10.982 12V6.61078C10.982 6.04857 11.4378 5.59281 12 5.59281Z"
      fill="currentColor"
    />
  </svg>
);
export default SvgOutlinedTime;
