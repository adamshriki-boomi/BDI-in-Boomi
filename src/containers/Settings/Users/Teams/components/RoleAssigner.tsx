import { Box, Flex, Grid, RenderGuard } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { CustomSelectForm } from 'components/Form';
import { useSelectFormStyles } from 'components/Form/components/SelectFormGroup/select.styles';
import {
  CustomOption,
  useEnvironmentOptions,
} from 'modules/Environments/components/EnvironmentsSelector';
import { useFormContext } from 'react-hook-form';
import EnvironmentsTable from '../../components/EnvironmentsTable';
import { headerDescriptions, Roles } from '../../users.helpers';

enum RoleAssignOptionEnum {
  BASIC = 'basic',
  ADVANCED = 'advanced',
}

RoleAssigner.ActionType = RoleAssignOptionEnum;
export function RoleAssigner() {
  const formApi = useFormContext();
  const mode = formApi?.watch('mode');
  return (
    <RenderGuard
      condition={mode === RoleAssignOptionEnum.ADVANCED}
      fallback={<SimpleRoleAssigner />}
    >
      <ComplexRoleAssigner />
    </RenderGuard>
  );
}

function SimpleRoleAssigner() {
  const formApi = useFormContext();
  const mode = formApi?.watch('mode');
  const isAdminRole = formApi?.watch('selectedRole') === Roles.ADMIN;
  const baseSelectStyle = useSelectFormStyles(true);
  const environments = useEnvironmentOptions();
  environments?.unshift({
    label: 'All Environments',
    value: 'all',
  } as any);
  const roles = Object.keys(headerDescriptions).map(role => {
    const label = role === Roles.MEMBER ? 'member' : role;
    return {
      label: label.replace('_', ' '),
      value: role,
    };
  });

  return (
    <Flex flexDir="column" gap={2}>
      <Grid gap={2} templateColumns="repeat(2, 1fr)">
        <Box>
          <CustomSelectForm
            placeholder="Select Role"
            options={roles}
            isMulti={false}
            controlId="role_select"
            name="selectedRole"
            api={formApi}
            customStyles={{
              option: (style, props) => ({
                ...baseSelectStyle.option(style, props),
                textTransform: 'capitalize',
                '&:last-child': {
                  borderTop: '1px solid #E2E8F0',
                },
              }),
              control: (style, props) => ({
                ...baseSelectStyle.control(style, props),
                textTransform: 'capitalize',
              }),
            }}
            required={mode === RoleAssignOptionEnum.BASIC}
          />
        </Box>
        <Box>
          <CustomSelectForm
            placeholder="Select Environment"
            options={environments as any}
            isMulti={false}
            controlId="environment_select"
            name="selectedEnvironment"
            api={formApi}
            components={{
              Option: CustomOption,
              SingleValue: CustomOption,
            }}
            customStyles={{
              option: (style, props) => ({
                ...baseSelectStyle.option(style, props),
                '&:first-child': {
                  borderBottom: '1px solid #E2E8F0',
                },
              }),
            }}
            required={!isAdminRole && mode === RoleAssignOptionEnum.BASIC}
            isDisabled={isAdminRole}
          />
        </Box>
      </Grid>
      <RenderGuard condition={isAdminRole}>
        <RiveryAlert
          variant="info"
          description="The admin role enables all actions in all Environments under this Team."
        />
      </RenderGuard>
    </Flex>
  );
}

function ComplexRoleAssigner() {
  const formApi = useFormContext();
  return <EnvironmentsTable formApi={formApi} />;
}
