import {
  ChakraProps,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverProps,
  PopoverTrigger,
  Portal,
} from '@chakra-ui/react';
import { InfoIcon } from 'components';
import { TooltipIconButton } from 'components/Buttons/RiveryButton';
import * as React from 'react';
import { ReactElement } from 'react';

export interface RiveryOverlayProps extends Pick<PopoverProps, 'placement'> {
  description: React.ReactNode;
  children: React.ReactNode;
  ariaLabel?: string;
  bgColor?: string;
  color?: string;
  contentProps?: any;
  portal?: boolean;
  capitalizeHeader?: boolean;
}
export function RiveryOverlay({
  description = null,
  placement = 'bottom-end',
  children,
  header = null,
  bgColor = 'background-action-inverse',
  color = 'font-inverse',
  contentProps = null,
  portal = false,
  capitalizeHeader = false,
  ...rest
}: any) {
  return (
    <Popover
      isLazy
      trigger="hover"
      placement={placement}
      variant="tooltip"
      {...rest}
    >
      <PopoverTrigger>{children}</PopoverTrigger>
      <OverlayPortalWrap portal={portal}>
        <PopoverContent {...contentProps}>
          <PopoverArrow bg={bgColor} />
          {header ? (
            <PopoverHeader
              textTransform={capitalizeHeader ? 'capitalize' : null}
            >
              {header}
            </PopoverHeader>
          ) : null}
          <PopoverBody bg={bgColor} color={color}>
            {description}
          </PopoverBody>
        </PopoverContent>
      </OverlayPortalWrap>
    </Popover>
  );
}

function OverlayPortalWrap({ children, portal }) {
  return portal ? <Portal>{children}</Portal> : children;
}

interface RiveryInfoTooltipProps extends Omit<RiveryOverlayProps, 'children'> {
  iconSize?: number;
  iconClassName?: string;
  iconStyle?: ChakraProps;
  header?: string | React.ReactNode;
  color?: string;
  icon?: ReactElement;
  buttonProps?: any;
  extraProps?: any;
}

export function RiveryInfoTooltip({
  description,
  header = null,
  ariaLabel = null,
  color = 'white',
  iconStyle = undefined,
  buttonProps = null,
  extraProps = null,
  icon = (
    <Icon
      as={InfoIcon}
      color={color}
      borderRadius={50}
      _hover={{ bg: 'background-secondary' }}
      {...iconStyle}
    />
  ),
}: RiveryInfoTooltipProps) {
  const tooltipConfig = React.useMemo(
    () =>
      ({
        ariaLabel,
      } as RiveryOverlayProps),
    [ariaLabel],
  );
  return (
    <TooltipIconButton
      tooltip={description}
      header={header}
      tooltipProps={{ ...tooltipConfig, ...extraProps }}
      aria-label={`tooltip icon ${ariaLabel}`}
      variant="tooltip"
      icon={icon}
      {...buttonProps}
    />
  );
}
