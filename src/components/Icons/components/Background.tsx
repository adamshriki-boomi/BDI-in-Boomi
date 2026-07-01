import * as React from 'react';
import type { SVGProps } from 'react';
const SvgBackground = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={1440}
    height={1015}
    viewBox="0 0 1440 1015"
    fill="none"
    {...props}
  >
    <g opacity={0.5} filter="url(#filter0_f_234_15059)">
      <path
        d="M915.5 185C753.404 185 622 316.404 622 478.5C622 640.596 753.404 772 915.5 772C1077.6 772 1209 640.596 1209 478.5C1209 316.404 1077.6 185 915.5 185Z"
        fill="url(#paint0_linear_234_15059)"
      />
    </g>
    <g opacity={0.5} filter="url(#filter1_f_234_15059)">
      <path
        d="M316.964 273.964C202.345 388.583 202.345 574.417 316.964 689.036C431.583 803.655 617.417 803.655 732.035 689.036C846.654 574.417 846.654 388.583 732.035 273.964C617.416 159.345 431.583 159.345 316.964 273.964Z"
        fill="url(#paint1_linear_234_15059)"
      />
    </g>
    <defs>
      <filter
        id="filter0_f_234_15059"
        x={382}
        y={-55}
        width={1067}
        height={1067}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feGaussianBlur
          stdDeviation={120}
          result="effect1_foregroundBlur_234_15059"
        />
      </filter>
      <filter
        id="filter1_f_234_15059"
        x={-9.00049}
        y={-52}
        width={1067}
        height={1067}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feGaussianBlur
          stdDeviation={120}
          result="effect1_foregroundBlur_234_15059"
        />
      </filter>
      <linearGradient
        id="paint0_linear_234_15059"
        x1={1209}
        y1={478.5}
        x2={622}
        y2={478.5}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FF7C66" />
        <stop offset={1} stopColor="#FF7C66" stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="paint1_linear_234_15059"
        x1={836.947}
        y1={630.429}
        x2={185.441}
        y2={385.106}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.347158} stopColor="#4B4FE2" stopOpacity={0.95} />
        <stop offset={0.955329} stopColor="#0EC38B" />
      </linearGradient>
    </defs>
  </svg>
);
export default SvgBackground;
