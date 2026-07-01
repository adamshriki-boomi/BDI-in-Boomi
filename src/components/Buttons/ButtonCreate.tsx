import { Icon as ChakraIcon } from '@chakra-ui/react';
import { PlusIcon, RiveryButtonWithTooltip } from 'components';
import { Tagger } from 'components/Tracking/Tagger';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { RiveryButtonProps } from './RiveryButton';

interface Props extends Omit<RiveryButtonProps, 'label'> {
  to?: string;
  state?: any;
  extraAction?: any;
  icon?: React.FunctionComponent;
}

export function ButtonCreate({
  to = '/',
  state = {},
  icon = PlusIcon,
  extraAction,
  ref,
  ...props
}: Props) {
  const Icon: any = icon;
  const history = useHistory();

  const onCreate = () => {
    history.push(to, state);
    extraAction && extraAction();
  };

  return (
    <Tagger
      tags={{
        'btn-create': typeof props.children === 'string' && props.children,
      }}
    >
      <RiveryButtonWithTooltip
        ref={ref}
        aria-label="create"
        display="flex"
        alignItems="center"
        justifyContent="center"
        onClick={onCreate}
        leftIcon={<ChakraIcon as={Icon} color="inherit" />}
        label={props.children}
        pl={2.5}
        pr={4}
        {...props}
      />
    </Tagger>
  );
}
