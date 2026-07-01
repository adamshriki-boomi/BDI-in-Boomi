import { Icon, IconProps } from '@chakra-ui/react';
import { IconAddContainer } from 'components/Icons';
import { DiPython } from 'react-icons/di';
import { FiDatabase } from 'react-icons/fi';
import { ReactComponent as Action } from './icons-action.svg';
import { ReactComponent as Condition } from './icons-condition.svg';
import { ReactComponent as Container } from './icons-container.svg';
import { ReactComponent as LoopOver } from './icons-loop_over.svg';
import { ReactComponent as River } from './icons-river.svg';
import { ReactComponent as ToContainer } from './icons-to-container.svg';
import { ReactComponent as LogicIcon } from './logic.svg';
import { ReactComponent as SnowflakeIcon } from './snowflake.svg';
import { ReactComponent as St2Icon } from './src-to-trgt-river-icon.svg';

export const StepIcons = {
  action: Action,
  actions: Action,
  condition: Condition,
  container: Container,
  loop_over: LoopOver,
  river: River,
  run_once: IconAddContainer,
  sql: FiDatabase,
  'to-container': ToContainer,
  python: DiPython,
  snowflake: SnowflakeIcon,
  logicode: SnowflakeIcon,
  logic: LogicIcon,
  src_to_trgt: St2Icon,
  src_to_fz: St2Icon,
};

interface StepIconProps {
  icon: keyof typeof StepIcons | '';
  disabled?: boolean;
  selected?: boolean;
}
export const StepIcon = ({
  icon = '',
  disabled = false,
  selected = false,
  ...props
}: StepIconProps & IconProps) => {
  const IconComponent = StepIcons?.[icon];
  return IconComponent ? (
    <Icon
      as={IconComponent}
      color={disabled ? 'icon' : selected ? 'white' : null}
      {...props}
    />
  ) : null;
};
