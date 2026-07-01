import { chakra, Flex, FlexProps } from '@chakra-ui/react';
import { Icon, StatusIcon } from 'components';
import {
  CheckmarkSolid,
  CloseBgSolid,
  OutlinedClose,
  OutlinedSuccess,
  RdsSkipped,
  StatusIsRunning,
} from 'components/Icons';
import SvgSolidExclamationMark from 'components/Icons/components/SolidExclamationMark';
import { spinAnimation } from 'containers/River/RiverLogic/Logic/components/ScriptEditor/EditorLayout';
import * as React from 'react';
import { HiOutlineDotsCircleHorizontal } from 'react-icons/hi';

type StatusProps = {
  text: string;
  icon: any;
  variant: string;
  animate?: boolean;
};

export function Status({
  text,
  icon: IconComponent,
  variant,
  animate = false,
  ...styleProps
}: StatusProps & FlexProps) {
  return (
    <Flex gap={1} alignItems="start" flexWrap="nowrap" {...styleProps}>
      <Icon
        as={IconComponent}
        color={variant}
        boxSize={4}
        mt="2px"
        {...(animate && { animation: `${spinAnimation} 2s linear infinite` })}
      />
      <chakra.span wordBreak="break-word" textTransform="capitalize">
        {text}
      </chakra.span>
    </Flex>
  );
}

export const SuccessStatus = ({ text, ...styleProps }) => (
  <Status
    text={text}
    icon={OutlinedSuccess}
    variant="background-success-strong"
    {...styleProps}
  />
);

export const FailStatus = ({ text, ...props }) => (
  <Status
    text={text}
    icon={OutlinedClose}
    variant="background-danger-strong"
    {...props}
  />
);

export const ContainedSuccessStatus = ({ text, ...styleProps }) => (
  <Status text={text} icon={CheckmarkSolid} variant="success" {...styleProps} />
);

export const ContainedFailStatus = ({ text, ...props }) => (
  <Status
    text={text}
    icon={CloseBgSolid}
    variant="background-danger-strong"
    {...props}
  />
);

export const ContainedPartialStatus = ({ text, ...props }) => (
  <Status
    text={text}
    icon={SvgSolidExclamationMark}
    variant="background-warning-strong"
    {...props}
  />
);

export const ContainedSkippedStatus = ({ text, ...props }) => (
  <Status text={text} icon={RdsSkipped} variant="tagOrange" {...props} />
);

export const ContainedRunningStatus = ({ text, ...props }) => (
  <Status
    text={text === 'pending' ? 'Running' : text}
    icon={StatusIsRunning}
    variant="background-deselected"
    animate
    {...props}
  />
);

export const PendingStatus = ({ text, ...props }) => (
  <Status
    text={text}
    icon={
      <Icon
        as={HiOutlineDotsCircleHorizontal}
        boxSize={5}
        color="icon-secondary"
      />
    }
    variant="background-warning-strong"
    {...props}
  />
);

export const statusToIconMap = {
  succeeded: <Icon as={CheckmarkSolid} boxSize={5} color="success" />,
  error: (
    <Icon as={CloseBgSolid} boxSize={5} color="background-danger-strong" />
  ),
};

export function ContainedStatusIconAndText({ value }) {
  return statusToIconMap?.[value] ?? <StatusIcon value={value} />;
}
