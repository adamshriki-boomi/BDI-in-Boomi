import { chakra } from '@chakra-ui/react';
import { Box, Flex, HStack, RenderGuard, RiveryButton, Text } from 'components';
import { useFormContext } from 'react-hook-form';
import { RoleAssigner } from './RoleAssigner';

export function TeamRoles({ hasSelectedGroups }) {
  const formApi = useFormContext();
  const mode = formApi?.watch('mode');

  return (
    <OverlayDiv active={hasSelectedGroups}>
      <Flex gap={2} flexDir="column">
        <HStack textStyle="M6">
          <Text color="tagMagenta">*</Text>
          <Text color="primary">
            Roles and Environments for imported directories
          </Text>
        </HStack>
        {/* <RadioGroup
          label=""
          name="mode"
          values={}
          checked={mode}
          onChange={v => {
            formApi.setValue('mode', v);
          }}
        /> */}
        <RenderGuard condition={mode === RoleAssigner.ActionType.BASIC}>
          <Box color="font">
            <Text display="inline">
              Select default role and Environment for all teams. Note, when
              setting a default role, the roles in all other Environments will
              be set as “No Access.”{' '}
            </Text>
            <RiveryButton
              label="Read more"
              variant="link"
              href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Administration/user-roles-permissions"
              target="_blank"
            />{' '}
            about Team roles and capabilities.
          </Box>
        </RenderGuard>

        <RoleAssigner />
      </Flex>
    </OverlayDiv>
  );
}

function OverlayDiv({ children, active = false }) {
  return active ? (
    children
  ) : (
    <Box
      opacity="0.5"
      zIndex="1500"
      bgColor="background-secondary"
      w="full"
      h="full"
    >
      <chakra.fieldset
        disabled
        sx={{
          '& .select-form-group__control': {
            pointerEvents: 'none',
          },
        }}
      >
        {children}
      </chakra.fieldset>
    </Box>
  );
}
