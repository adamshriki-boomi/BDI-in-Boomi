import {
  Box,
  Button,
  ButtonProps,
  GridItem,
  Icon,
  IconButton,
  IconButtonProps,
  Link,
} from '@chakra-ui/react';
import { CloseIconSmall, RiveryOverlay, RiveryOverlayProps } from 'components';
import React, { Fragment, ReactNode } from 'react';

enum Mode {
  ENABLED = 'Enabled',
}
export interface RiveryButtonProps extends Partial<ButtonProps> {
  label: ReactNode;
  href?: any;
  target?: string;
  tooltip?: ReactNode;
  tooltipProps?: Partial<RiveryOverlayProps>;
  mode?: Mode;
  ref?: any;
  to?: any;
}

function ButtonRenderer({ href, target, children }) {
  return href ? (
    <Link
      textDecoration="none"
      _hover={{ textDecoration: 'none' }}
      href={href}
      target={target}
      rel="noreferrer"
    >
      {children}
    </Link>
  ) : (
    children
  );
}

RiveryButton.Mode = Mode;
export function RiveryButton({
  label,
  href = '',
  target = '_self',
  tooltip = null,
  tooltipProps,
  mode,
  ref = null,
  loadingText,
  ...rest
}: RiveryButtonProps) {
  const ariaLabel = rest['aria-label'];
  const isEnabled = mode === Mode.ENABLED;
  const ButtonComponent = isEnabled ? Box : (Button as any);
  return (
    <ButtonRenderer href={href} target={target}>
      <TooltipWrapper tooltip={tooltip} tooltipProps={tooltipProps}>
        <ButtonComponent
          ref={ref}
          as={href ? 'div' : null}
          aria-label={typeof label == 'string' ? label : ariaLabel}
          variant="primary"
          size="base"
          {...rest}
          {...resolveLoadingText({ label, isEnabled, loadingText })}
        >
          {label}
        </ButtonComponent>
      </TooltipWrapper>
    </ButtonRenderer>
  );
}

const resolveLoadingText = ({ label, isEnabled, loadingText }) => {
  return !isEnabled
    ? {
        loadingText:
          typeof label == 'string'
            ? loadingText || label
            : loadingText || 'Loading...',
      }
    : null;
};
export default RiveryButton;
const TooltipWrapper = React.memo(
  ({ header, tooltip, tooltipProps, children }: any) => {
    const Wrapper: any = tooltip ? ButtonTooltip : React.Fragment;
    const wrapperProps = tooltip
      ? { description: tooltip, tooltipProps, header }
      : {};
    return <Wrapper {...wrapperProps}>{children}</Wrapper>;
  },
);
const ButtonTooltip = ({ children, description, tooltipProps, header }) => {
  return (
    <RiveryOverlay description={description} header={header} {...tooltipProps}>
      {children}
    </RiveryOverlay>
  );
};

export function TooltipIconButton({
  tooltip,
  tooltipProps,
  header,
  ...props
}: IconButtonProps & {
  header?: string | ReactNode;
  tooltip: ReactNode;
  tooltipProps?: Partial<RiveryOverlayProps>;
}) {
  return (
    <TooltipWrapper
      tooltip={tooltip}
      tooltipProps={tooltipProps}
      header={header}
    >
      <IconButton
        isRound
        _focus={{ boxShadow: 'none' }}
        _active={{ boxShadow: 'none' }}
        // make sure the tooltip isn't displayed after it triggers a modal
        // https://github.com/chakra-ui/chakra-ui/issues/5304#issuecomment-1102836734
        onFocus={e => e.preventDefault()}
        {...(props?.as && { as: props.as })}
        {...props}
      />
    </TooltipWrapper>
  );
}

export function ButtonEnabled({ ...props }: Omit<RiveryButtonProps, 'role'>) {
  return (
    <RiveryButton
      mode={Mode.ENABLED}
      _active={{ bg: 'transparent', boxShadow: 'none' }}
      _focus={{ bg: 'transparent', boxShadow: 'none' }}
      {...props}
      role="button"
      display="flex"
    />
  );
}

export function CloseIconButton({ ...props }: IconButtonProps) {
  return (
    <TransparentIconButton
      icon={
        <Icon
          as={CloseIconSmall}
          color="background-action"
          _hover={{ color: 'background-action-hover' }}
          boxSize="14px"
        />
      }
      {...props}
    />
  );
}

export function TransparentIconButton({
  ref = null,
  ...props
}: IconButtonProps & { ref?: any }) {
  return (
    <IconButton
      bg="transparent"
      _hover={{ bg: 'transparent' }}
      _focus={{ boxShadow: 'none', bg: 'transparent' }}
      _active={{ boxShadow: 'none', bg: 'transparent' }}
      ref={ref}
      {...props}
    />
  );
}

/**
 * in this case, the button has to be wrapped inside a div - hence the grid-item
 */
export const RiveryButtonWithTooltip = ({
  tooltip,
  ...props
}: RiveryButtonProps) => {
  const isDisabled = props?.isDisabled;
  const Wrapper = isDisabled ? RiveryOverlay : Fragment;
  const wrapperProps = isDisabled ? { description: tooltip } : null;
  return (
    <Wrapper {...wrapperProps}>
      <GridItem gridArea="next">
        <RiveryButton variant="primary" size="sm" {...props} />
      </GridItem>
    </Wrapper>
  );
};
