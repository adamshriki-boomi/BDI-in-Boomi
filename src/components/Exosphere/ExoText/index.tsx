import React, { ReactNode, HTMLAttributes } from 'react';

// All valid typography style names from TYPOGRAPHY_MAPPING.md
export type TypographyStyleName =
  | 'Display'
  | 'Display Bold'
  | 'Headline 1'
  | 'Headline 1 Bold'
  | 'Headline 2'
  | 'Headline 2 Bold'
  | 'Subhead 1 Bold'
  | 'Subhead 2 Bold'
  | 'Subhead 3'
  | 'Body'
  | 'Body Underline - Link'
  | 'Body Bold'
  | 'Body SemiBold UI'
  | 'Body Small 1'
  | 'Body Small 1 - Link'
  | 'Body Small 1 Bold'
  | 'Body Small 1 SemiBold UI'
  | 'Body Small 1 UI'
  | 'Caption'
  | 'Caption Underline - Link'
  | 'Caption UI'
  | 'Code'
  | 'Code Small'
  | 'Display 2'
  | 'Display 2 Bold'
  | 'Body Large 1'
  | 'Body Large 1 Underline - Link'
  | 'Body Large 1 Bold'
  | 'Stat Large'
  | 'Stat'
  | 'Stat Small';

// Style definition interface
interface StyleDefinition {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
  fontFamily: string;
  textTransform?: React.CSSProperties['textTransform'];
  textDecoration?: React.CSSProperties['textDecoration'];
  defaultColor?: string;
}

// Complete mapping of all 31 typography styles to their Exosphere token-based properties
const typographyStyles: Record<TypographyStyleName, StyleDefinition> = {
  // HEADING Section
  Display: {
    fontSize: 'var(--exo-font-size-7x-large)',
    fontWeight: 'var(--exo-font-weight-light)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-brand)',
  },
  'Display Bold': {
    fontSize: 'var(--exo-font-size-7x-large)',
    fontWeight: 'var(--exo-font-weight-bold)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-brand)',
  },
  'Headline 1': {
    fontSize: 'var(--exo-font-size-5x-large)',
    fontWeight: 'var(--exo-font-weight-light)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-brand)',
  },
  'Headline 1 Bold': {
    fontSize: 'var(--exo-font-size-5x-large)',
    fontWeight: 'var(--exo-font-weight-bold)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-brand)',
  },
  'Headline 2': {
    fontSize: 'var(--exo-font-size-3x-large)',
    fontWeight: 'var(--exo-font-weight-light)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-brand)',
  },
  'Headline 2 Bold': {
    fontSize: 'var(--exo-font-size-3x-large)',
    fontWeight: 'var(--exo-font-weight-bold)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-brand)',
  },

  // SUBHEAD Section
  'Subhead 1 Bold': {
    fontSize: 'var(--exo-font-size-x-large)',
    fontWeight: 'var(--exo-font-weight-bold)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-family)',
  },
  'Subhead 2 Bold': {
    fontSize: 'var(--exo-font-size-medium)',
    fontWeight: 'var(--exo-font-weight-bold)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-family)',
  },
  'Subhead 3': {
    fontSize: 'var(--exo-font-size-small)',
    fontWeight: 'var(--exo-font-weight-regular)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: 'var(--exo-spacing-4x-small)', // 1px = 0.0625rem
    textTransform: 'uppercase',
    fontFamily: 'var(--exo-font-family)',
  },

  // BODY Section
  Body: {
    fontSize: 'var(--exo-font-size-medium)',
    fontWeight: 'var(--exo-font-weight-regular)',
    lineHeight: 'var(--exo-line-height-body)',
    letterSpacing: 'var(--exo-letter-spacing-compact)', // -2%
    fontFamily: 'var(--exo-font-family)',
  },
  'Body Underline - Link': {
    fontSize: 'var(--exo-font-size-medium)',
    fontWeight: 'var(--exo-font-weight-regular)',
    lineHeight: 'var(--exo-line-height-body)',
    letterSpacing: 'var(--exo-letter-spacing-compact)', // -2%
    textDecoration: 'underline',
    fontFamily: 'var(--exo-font-family)',
    defaultColor: 'var(--exo-color-font-link)',
  },
  'Body Bold': {
    fontSize: 'var(--exo-font-size-medium)',
    fontWeight: 'var(--exo-font-weight-bold)',
    lineHeight: 'var(--exo-line-height-body)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-family)',
  },
  'Body SemiBold UI': {
    fontSize: 'var(--exo-font-size-medium)',
    fontWeight: 'var(--exo-font-weight-semibold)',
    lineHeight: 'var(--exo-spacing-large)', // 24px
    letterSpacing: 'var(--exo-letter-spacing-tight)', // -1%
    fontFamily: 'var(--exo-font-family)',
  },
  'Body Small 1': {
    fontSize: 'var(--exo-font-size-small)',
    fontWeight: 'var(--exo-font-weight-regular)',
    lineHeight: 'var(--exo-line-height-body)',
    letterSpacing: 'var(--exo-letter-spacing-compact)', // -2%
    fontFamily: 'var(--exo-font-family)',
  },
  'Body Small 1 - Link': {
    fontSize: 'var(--exo-font-size-small)',
    fontWeight: 'var(--exo-font-weight-regular)',
    lineHeight: 'var(--exo-line-height-body)',
    letterSpacing: 'var(--exo-letter-spacing-compact)', // -2%
    textDecoration: 'underline',
    fontFamily: 'var(--exo-font-family)',
    defaultColor: 'var(--exo-color-font-link)',
  },
  'Body Small 1 Bold': {
    fontSize: 'var(--exo-font-size-small)',
    fontWeight: 'var(--exo-font-weight-bold)',
    lineHeight: 'var(--exo-line-height-body)',
    letterSpacing: 'var(--exo-letter-spacing-tight)', // -1%
    fontFamily: 'var(--exo-font-family)',
  },
  'Body Small 1 SemiBold UI': {
    fontSize: 'var(--exo-font-size-small)',
    fontWeight: 'var(--exo-font-weight-semibold)',
    lineHeight: 'var(--exo-spacing-large)', // 24px
    letterSpacing: 'var(--exo-letter-spacing-tight)', // -1%
    fontFamily: 'var(--exo-font-family)',
  },
  'Body Small 1 UI': {
    fontSize: 'var(--exo-font-size-small)',
    fontWeight: 'var(--exo-font-weight-regular)',
    lineHeight: 'var(--exo-spacing-large)', // 24px
    letterSpacing: 'var(--exo-letter-spacing-compact)', // -2%
    fontFamily: 'var(--exo-font-family)',
  },

  // CAPTION Section
  Caption: {
    fontSize: 'var(--exo-font-size-micro)',
    fontWeight: 'var(--exo-font-weight-regular)',
    lineHeight: 'var(--exo-line-height-body)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-family)',
  },
  'Caption Underline - Link': {
    fontSize: 'var(--exo-font-size-micro)',
    fontWeight: 'var(--exo-font-weight-regular)',
    lineHeight: 'var(--exo-line-height-body)',
    letterSpacing: '0',
    textDecoration: 'underline',
    fontFamily: 'var(--exo-font-family)',
    defaultColor: 'var(--exo-color-font-link)',
  },
  'Caption UI': {
    fontSize: 'var(--exo-font-size-micro)',
    fontWeight: 'var(--exo-font-weight-regular)',
    lineHeight: 'var(--exo-spacing-standard)', // 16px
    letterSpacing: 'var(--exo-letter-spacing-tight)', // -1%
    fontFamily: 'var(--exo-font-family)',
  },

  // CODE Section
  Code: {
    fontSize: 'var(--exo-font-size-small)',
    fontWeight: 'var(--exo-font-weight-regular)',
    lineHeight: 'var(--exo-line-height-denser)', // 21px ≈ 1.3125rem
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-monospace)',
  },
  'Code Small': {
    fontSize: 'var(--exo-font-size-x-small)',
    fontWeight: 'var(--exo-font-weight-regular)',
    lineHeight: 'var(--exo-spacing-medium)', // 20px = 1.25rem
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-monospace)',
  },

  // MARKETING/BRAND Section
  'Display 2': {
    fontSize: 'var(--exo-font-size-6x-large)',
    fontWeight: 'var(--exo-font-weight-light)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-brand)',
  },
  'Display 2 Bold': {
    fontSize: 'var(--exo-font-size-6x-large)',
    fontWeight: 'var(--exo-font-weight-bold)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-brand)',
  },
  'Body Large 1': {
    fontSize: 'var(--exo-font-size-large)',
    fontWeight: 'var(--exo-font-weight-regular)',
    lineHeight: 'var(--exo-line-height-body)',
    letterSpacing: 'var(--exo-letter-spacing-compact)', // -2%
    fontFamily: 'var(--exo-font-family)',
  },
  'Body Large 1 Underline - Link': {
    fontSize: 'var(--exo-font-size-large)',
    fontWeight: 'var(--exo-font-weight-regular)',
    lineHeight: 'var(--exo-line-height-body)',
    letterSpacing: 'var(--exo-letter-spacing-compact)', // -2%
    textDecoration: 'underline',
    fontFamily: 'var(--exo-font-family)',
    defaultColor: 'var(--exo-color-font-link)',
  },
  'Body Large 1 Bold': {
    fontSize: 'var(--exo-font-size-large)',
    fontWeight: 'var(--exo-font-weight-bold)',
    lineHeight: 'var(--exo-line-height-body)',
    letterSpacing: 'var(--exo-letter-spacing-tight)', // -1%
    fontFamily: 'var(--exo-font-family)',
  },

  // STAT Section
  'Stat Large': {
    // Note: 5.25rem (84px) doesn't have a direct token, using largest available
    fontSize: 'var(--exo-font-size-7x-large)', // 2.5rem (40px) - closest available
    fontWeight: 'var(--exo-font-weight-bold)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-family)',
  },
  Stat: {
    // Note: 3.5rem (56px) doesn't have a direct token, using closest available
    fontSize: 'var(--exo-font-size-7x-large)', // 2.5rem (40px) - closest available
    fontWeight: 'var(--exo-font-weight-bold)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-family)',
  },
  'Stat Small': {
    fontSize: 'var(--exo-font-size-7x-large)',
    fontWeight: 'var(--exo-font-weight-bold)',
    lineHeight: 'var(--exo-line-height-heading)',
    letterSpacing: '0',
    fontFamily: 'var(--exo-font-family)',
  },
};

export interface ExoTextProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  children: ReactNode;
  styleName: TypographyStyleName;
  color?: string; // Accepts any valid CSS color value (tokens, hex, rgb, etc.)
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

// Text component with styleName-based typography
export const ExoText = ({
  children,
  styleName,
  color,
  className = '',
  as,
  ...props
}: ExoTextProps) => {
  const styleDef = typographyStyles[styleName];

  const baseStyle: React.CSSProperties = {
    fontSize: styleDef.fontSize,
    fontWeight: styleDef.fontWeight,
    lineHeight: styleDef.lineHeight,
    letterSpacing: styleDef.letterSpacing,
    fontFamily: styleDef.fontFamily,
    textTransform: styleDef.textTransform,
    textDecoration: styleDef.textDecoration,
    // Color: use provided color, or default from style, or fallback to primary
    color: color || styleDef.defaultColor || 'var(--exo-color-font)',
    margin: 0,
  };

  const mergedStyle: React.CSSProperties = {
    ...(props.style || {}),
    fontSize: baseStyle.fontSize,
    fontWeight: baseStyle.fontWeight,
    lineHeight: baseStyle.lineHeight,
    letterSpacing: baseStyle.letterSpacing,
    fontFamily: baseStyle.fontFamily,
    textTransform: baseStyle.textTransform,
    textDecoration: baseStyle.textDecoration,
    // Color can be overridden by props.style if needed, but prefer baseStyle.color
    color: props.style?.color || baseStyle.color,
    // Preserve margin from baseStyle unless overridden
    margin: props.style?.margin ?? baseStyle.margin,
  };

  // Extract style from props to avoid passing it twice
  const { style: _, ...restProps } = props;

  // Determine the appropriate HTML element
  // Default to semantic elements based on style category
  const Component =
    as ||
    (styleName.startsWith('Headline') || styleName.startsWith('Display')
      ? 'h2'
      : styleName.startsWith('Subhead')
      ? 'h3'
      : styleName.startsWith('Code')
      ? 'code'
      : 'p');

  return React.createElement(
    Component as keyof JSX.IntrinsicElements,
    { style: mergedStyle, className, ...restProps },
    children,
  );
};
