import { Box, HStack, IconButton, StyleProps, Text } from '@chakra-ui/react';
import { BlockTypes, RunStatus } from 'api/types';
import {
  ButtonModal,
  EditableText,
  Flex,
  Icon,
  RiveryInfoTooltip,
  StepIcons,
} from 'components';
import { RiverySwitch } from 'components/Form/components';
import { Tagger } from 'components/Tracking/Tagger';
import { useToastComponent } from 'hooks/useToast';
import React, { ChangeEvent } from 'react';
import { BsSlash } from 'react-icons/bs';
import {
  MdDragIndicator,
  MdError,
  MdErrorOutline,
  MdExpandLess,
  MdExpandMore,
} from 'react-icons/md';
import { useRiverActions } from 'store/river';
import { NodeType } from 'store/river/river.types';
import { useIsRiverRunning } from '../Logic';
import RiveryDropdown from './RiveryChakraMenu';
export type NodeHeaderProps = {
  open?: boolean;
  text: string;
  progress?: number;
  onCollapse?: (collapse: boolean) => any;
  onNameChange?: (value: string) => any;
  onIsEnabledChanges?: (value: ChangeEvent<HTMLInputElement>) => any;
  onDelete?: () => any;
  onDisableErrors?: (value: boolean) => any;
  iconWrapper?: JSX.Element; // React.ElementType;
  type?: NodeType;
  isEnabled?: boolean;
  /**
   * indicates the header status according to the parent node.
   * affects visually and not the "on" switch
   */
  isDisabled?: boolean;
  status?: RunStatus;
  className?: string;
  icon?: string;
  errorMessage?: string;
  errorsDisabled?: boolean;
  dragHandlers?: Record<any, any>;
  children?: any;
  stepId?: string;
  styleProps?: StyleProps;
  index?: string;
  stepsLength?: number;
};

const TypeConfig = {
  [NodeType.CONTAINER]: {
    bgColor: {
      [RunStatus.DONE]: 'successLight',
      [RunStatus.WAITING]: 'background-selected-weak',
      [RunStatus.RUNNING]: 'background-selected-weak',
      [RunStatus.NONE]: 'background-selected-weak',
      disabled: 'background-secondary',
    },
    iconColor: {
      [RunStatus.DONE]: 'background-selected',
      [RunStatus.WAITING]: 'background-selected',
      [RunStatus.RUNNING]: 'background-selected',
      [RunStatus.NONE]: 'background-selected',
      disabled: 'background-info-strong',
    },
    border: {
      [RunStatus.DONE]: 'background-selected',
    },
  },
  [NodeType.STEP]: {
    bgColor: {
      [RunStatus.DONE]: 'successLight',
      [RunStatus.WAITING]: 'background-selected-weak',
      [RunStatus.RUNNING]: 'background-selected-weak',
      [RunStatus.NONE]: 'background-selected-weak',
      disabled: 'background-tertiary',
    },
    iconColor: {
      [RunStatus.DONE]: 'background-selected',
      [RunStatus.WAITING]: 'background-selected',
      [RunStatus.RUNNING]: 'background-selected',
      [RunStatus.NONE]: 'background-selected',
      disabled: 'background-info-strong',
    },
    border: {
      [RunStatus.DONE]: 'transparent',
    },
  },
  [NodeType.WRAP_CONTAINER]: {
    bgColor: {
      [RunStatus.NONE]: 'background-selected-weak',
      disabled: 'background-tertiary',
    },
    iconColor: {
      [RunStatus.DONE]: 'background-selected',
      [RunStatus.WAITING]: 'background-selected',
      [RunStatus.RUNNING]: 'background-selected',
      [RunStatus.NONE]: 'background-selected',
      disabled: 'background-info-strong',
    },
    border: {
      [RunStatus.DONE]: 'transparent',
    },
  },
  ERROR: {
    bgColor: {
      [RunStatus.ERROR]: 'red.50',
      disabled: 'background-tertiary',
    },
    iconColor: {
      [RunStatus.DONE]: 'background-selected',
      [RunStatus.WAITING]: 'background-selected',
      [RunStatus.RUNNING]: 'background-selected',
      [RunStatus.NONE]: 'background-selected',
      disabled: 'background-info-strong',
    },

    border: {
      [RunStatus.ERROR]: 'transparent',
    },
  },
};
const runningStep = {
  className: 'skeleton-box',
  // overflow: 'hidden',
  // '--skeleton-duration': 2,
  // _after: {
  //   shimmerAnimation,
  //   position: 'absolute',
  //   top: 0,
  //   right: 0,
  //   bottom: 0,
  //   left: 0,
  //   transform: 'translateX(-100%)',
  //   // bgGradient:
  //   //   'linear(90deg, rgba(#fff, 0) 0, rgba(#fff, 0.2) 20%, rgba(#fff, 0.5) 60%, rgba(#fff, 0) )',
  //   content: '""',
  // },
};
export function NodeHeader({
  text,
  progress,
  onCollapse = null,
  onNameChange,
  isEnabled,
  isDisabled = false,
  onIsEnabledChanges = null,
  onDelete,
  onDisableErrors,
  iconWrapper,
  errorsDisabled = false,
  type = NodeType.CONTAINER,
  icon = undefined,
  status = RunStatus.NONE,
  open = true,
  errorMessage,
  dragHandlers,
  children,
  stepId = undefined,
  styleProps = undefined,
  index,
  stepsLength,
}: NodeHeaderProps) {
  const { moveStep } = useRiverActions();
  const { success } = useToastComponent();
  const isLastStep = index === `0.${stepsLength - 1}`;

  const items = [
    onDisableErrors && {
      value: '',
      px: 3,
      icon: (
        <RiverySwitch
          label="Ignore Errors"
          name="disable_errors"
          isChecked={errorsDisabled}
          onChange={ev => onDisableErrors(ev.currentTarget.checked)}
        />
      ),
      divider: true,
    },
    {
      value: 'Move to Top of Data Flow',
      px: 3,
      isDisabled: index === '0.0',
      onClick:
        stepId &&
        (() => {
          moveStep({
            sourceId: stepId,
            direction: -1,
            toEdge: true,
          });
          success({
            description: `'${text}' moved to the top of the Data Flow`,
          });
        }),
    },
    {
      value: 'Move to Bottom of Data Flow',
      isDisabled: stepsLength === 1 || isLastStep,
      px: 3,
      onClick:
        stepId &&
        (() => {
          moveStep({
            sourceId: stepId,
            direction: 1,
            toEdge: true,
          });
          success({
            description: `'${text}' moved to the bottom of the Data Flow`,
          });
        }),
      divider: true,
    },
    {
      ...RiveryDropdown.DeleteMenuItem,
      value: 'Delete Step',
      px: 3,
      onClick: onDelete,
      ariaLabel: 'Delete Step',
    },
  ].filter(Boolean);
  const isRiverRunning = useIsRiverRunning();
  const config =
    status === RunStatus.ERROR ? TypeConfig.ERROR : TypeConfig[type];

  const textColor = isDisabled ? 'font-secondary' : 'font';
  const iconColor = config?.iconColor?.[status || RunStatus.WAITING];

  const isFirstStep = index === '0.0';
  const stepIcon = (
    <Icon
      as={StepIcons?.[icon]}
      color={isDisabled ? config?.iconColor?.disabled : iconColor}
      mx={2}
      boxSize="5"
    />
  );
  return (
    <Flex
      borderTopRadius="4px"
      alignItems="center"
      bgColor={
        isDisabled
          ? config?.bgColor?.disabled
          : config?.bgColor?.[status || RunStatus.WAITING]
      }
      {...(progress || status === RunStatus.RUNNING ? runningStep : null)}
      whiteSpace="nowrap"
      borderBottom="2px solid"
      borderBottomColor={
        isDisabled ? 'border' : config.border?.[RunStatus.DONE]
      }
      color={textColor}
      onDoubleClick={() => onCollapse(!open)}
      role="region"
      aria-label={`${text} title`}
      height="41px"
      {...styleProps}
    >
      {dragHandlers && !isRiverRunning ? (
        <Tagger tags="step-move-handler">
          <Icon
            as={MdDragIndicator}
            {...(!isFirstStep && dragHandlers)}
            color={textColor}
            cursor="move"
            ml={1}
            boxSize="5"
          />
        </Tagger>
      ) : null}
      {children}

      {iconWrapper ? React.cloneElement(iconWrapper, {}, stepIcon) : stepIcon}

      {onNameChange ? (
        <Tagger tags="edit-step-name">
          <EditableText
            iconColor={textColor}
            textColor={textColor}
            text={text}
            onChange={onNameChange}
            textStyle={{
              whiteSpace: 'nowrap',
            }}
          />
        </Tagger>
      ) : (
        <Text textTransform="capitalize" textStyle="M7" color={textColor}>
          {text}
        </Text>
      )}
      {Boolean(onCollapse) && (
        <Tagger
          tags={[{ 'step-expand-collapse': open ? 'collapse' : 'expand' }]}
        >
          <IconButton
            icon={<CollapseIcon open={open} color={textColor} />}
            variant="text-link"
            aria-label="expand/collapse"
            onClick={() => onCollapse(!open)}
            color={textColor}
          />
        </Tagger>
      )}
      <Tagger tags="step-move-handler">
        <Box
          flexGrow={1}
          cursor={dragHandlers ? 'move' : undefined}
          {...dragHandlers}
        >
          &nbsp;
        </Box>
      </Tagger>
      {onIsEnabledChanges && (
        <Tagger tags={isEnabled ? 'disable-step' : 'enable-step'}>
          <Box ml="auto">
            <RiverySwitch
              variant="whiteBorder"
              label={<Text fontSize="small">{isEnabled ? 'On' : 'Off'}</Text>}
              ariaLabel={`enable ${text}`}
              name="isEnabled"
              leftLabel
              isChecked={isEnabled}
              onChange={onIsEnabledChanges}
              sx={{ '& .chakra-switch__track': { border: '1px solid white' } }}
              isDisabled={isRiverRunning}
            />
          </Box>
        </Tagger>
      )}
      {status === RunStatus.ERROR ? (
        <ButtonModal
          header={`${text} Error Message`}
          body={errorMessage}
          button={
            <IconButton
              variant="text-link"
              icon={
                <Icon
                  as={MdError}
                  w="20px"
                  h="20px"
                  color="background-danger-strong"
                />
              }
              aria-label="error message"
            />
          }
        />
      ) : null}
      {Boolean(errorsDisabled) ? (
        <RiveryInfoTooltip
          ariaLabel={'ignore errors'}
          description={<Text>Ignore Errors</Text>}
          icon={<ErrorOutlineSlashIcon color="font-secondary" />}
        />
      ) : null}
      {Boolean(onDelete) && (
        <Tagger tags="step-more-options">
          <RiveryDropdown
            menuButtonAriaLabel={`step ${text} actions`}
            isLazy
            menuItems={items}
            id={text}
            menuListStyle={{ py: 1, color: 'primaryText' }}
            menuButtonStyle={{
              bg: 'transparent',
              _hover: { bg: 'transparent' },
              _expanded: { bg: 'transparent' },
            }}
          />
        </Tagger>
      )}
    </Flex>
  );
}

const ErrorOutlineSlashIcon = ({ color }) => (
  <HStack position="relative" role="figure" aria-label="ignore errors">
    <Icon
      as={MdErrorOutline}
      color={color}
      boxSize="5"
      position="absolute"
      ml="7px"
    />
    <Icon as={BsSlash} boxSize="5" color={color} />
  </HStack>
);

const CollapseIcon = ({ open, color }: { open: boolean; color: string }) => {
  const IconComponent = open ? MdExpandLess : MdExpandMore;
  return <Icon as={IconComponent} boxSize="5" color={color} />;
};
NodeHeader.status = RunStatus;
NodeHeader.stepType = BlockTypes;
