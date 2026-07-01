import * as React from 'react';
import type { SVGProps } from 'react';
const SvgDescription = (props: SVGProps<SVGSVGElement>) => (
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
      d="M5 3C4.44772 3 4 3.44772 4 4V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V8.3802C20 8.13528 19.9101 7.89889 19.7474 7.71584L15.8539 3.33564C15.6641 3.12215 15.3921 3 15.1065 3H5ZM6 19V5H13V10H18V19H6ZM17.5714 8L15 5V8H17.5714ZM8 13C8 12.4477 8.44772 12 9 12H15C15.5523 12 16 12.4477 16 13C16 13.5523 15.5523 14 15 14H9C8.44772 14 8 13.5523 8 13ZM8 16C8 15.4477 8.44772 15 9 15H15C15.5523 15 16 15.4477 16 16C16 16.5523 15.5523 17 15 17H9C8.44772 17 8 16.5523 8 16Z"
      fill="#485159"
    />
  </svg>
);
export default SvgDescription;
