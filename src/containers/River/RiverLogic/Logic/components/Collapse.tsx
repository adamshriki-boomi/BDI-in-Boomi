import { Box, Icon, StyleProps, Text } from '@chakra-ui/react';
import { HStack, Image, RiveryInfoTooltip } from 'components';
import {
  ButtonEnabled,
  RiveryButtonProps,
} from 'components/Buttons/RiveryButton';
import React from 'react';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import { useToggle } from 'react-use';
import { revealSlideRight } from 'theme/animations';
import './Collapse.scss';

export enum DisplayVariant {
  DEFAULT = 'default',
  SUMMARY = 'summary',
}

export interface DisplayVariantProps {
  displayVariant?: DisplayVariant;
}

export interface CollapseProps extends StyleProps {
  header: string;
  label?: string;
  children: any;
  icon?: string;
  buttonProps?: Partial<RiveryButtonProps>;
  expanded?: boolean;
  showSummary?: boolean;
  onExpand?: () => void;
  tooltip?: string;
}

export function Collapse({
  header,
  label,
  icon = null,
  children,
  buttonProps,
  expanded = false,
  onExpand = null,
  showSummary = false,
  tooltip,
  ...styleProp
}: CollapseProps) {
  const [show, toggle] = useToggle(expanded);

  return (
    <Box {...styleProp}>
      <ButtonEnabled
        aria-label={['collapse', header, label].join(' ').trim()}
        onClick={event => {
          onExpand && !show && onExpand();
          return toggle(event);
        }}
        variant="none"
        w="full"
        border={0}
        borderBottom="1px"
        fontWeight="normal"
        gridGap={1}
        py={2}
        borderColor={show ? 'primary' : 'gray.200'}
        aria-expanded={show}
        label={
          <HStack w="full" justifyContent="space-between">
            <HStack overflow="hidden">
              <Text flexShrink={0} minW={12}>
                {header}
              </Text>
              {tooltip ? <RiveryInfoTooltip description={tooltip} /> : null}
              <SummaryRenderer
                show={showSummary && !show}
                children={children}
              />
              {icon && (
                <Image
                  ml={3}
                  src={`/${icon}`}
                  alt={`collapse ${header}`}
                  size={Image.Size.XS}
                />
              )}
            </HStack>
            {show ? <Icon as={MdExpandLess} /> : <Icon as={MdExpandMore} />}
          </HStack>
        }
        {...buttonProps}
      />
      {show && <Box {...revealSlideRight}>{children}</Box>}
    </Box>
  );
}

function SummaryRenderer({ children, show }) {
  return show
    ? React.Children.map(children, child =>
        child.type === 'string'
          ? child
          : React.cloneElement(child, {
              displayVariant: DisplayVariant.SUMMARY,
            }),
      )
    : null;
}
Collapse.DisplayVariant = DisplayVariant;
