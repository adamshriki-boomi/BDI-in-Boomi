import { Collapse, Icon } from '@chakra-ui/react';
import { Box } from 'components';
import { RiveryButton } from 'components/Buttons';
import { ChevronDown } from 'components/Icons';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useToggle } from 'react-use';
import { FormControl } from '../ControlResolver';
import { FormControls } from '../FormControls';

export type CollapseFormProps = {
  type: string;
  display_name: string;
  controls: FormControl[];
  api: Partial<UseFormReturn>;
};

export function CollapseForm({
  display_name,
  controls,
  api,
}: CollapseFormProps) {
  const [show, toggle] = useToggle(false);

  const handleToggle = () => toggle(!show);

  return (
    <>
      <RiveryButton
        justifyContent="start"
        label={
          <>
            {display_name}
            <Icon as={ChevronDown} color="brand" ml={2} />
          </>
        }
        variant="link"
        color="brand"
        onClick={handleToggle}
        my={4}
      />
      <Box as={Collapse} startingHeight={20} in={show} mt={2}>
        {show && (
          <Box pl="4">
            <FormControls
              controls={controls}
              api={api}
              flexDir="column"
              gap={5}
            />
          </Box>
        )}
      </Box>
    </>
  );
}
