import { API } from 'api';
import { updateSettingsAdmin } from 'api/endpoints/accounts.api';
import { isStatusSuccess, StatusCodes } from 'api/endpoints/common.api';
import { ControlList } from 'api/types';
import { Flex } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { FormRenderer, InputTypes } from 'components/Form';
import { useToastComponent } from 'hooks/useToast';
import { useTargetTypesFilter } from 'modules/Datasources/useLogicTargets';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { TroubleshootTags } from 'utils/tracking.tags';

export function AdminAccountSettings() {
  const { error } = useToastComponent();
  const { adminAccountSettings, activeAccountId } = useCore();
  const targets = useTargetTypesFilter();
  const [isUpdating, toggle] = useToggle(false);
  const dataTargets = targets
    ?.concat({
      name: 'No Default Target',
      datasource_type_id: '',
    } as any)
    .reverse();
  const controls = getControls({ targets: dataTargets });
  const onSubmit = async formData => {
    toggle(true);
    const res: any = await updateSettingsAdmin(
      {
        ...formData,
      },
      activeAccountId,
    );
    if (isStatusSuccess(res)) {
      API.auth.revokeAccountToken().then(() => {
        window.location.reload();
      });
    } else if (res?.status_code === StatusCodes.CONFLICT) {
      toggle(false);
      error({
        description:
          'Account name already exists. Please select a different account name.',
      });
      return;
    } else {
      const errorMsg = res?.message ?? 'Error on updating account settings.';
      toggle(false);
      error({ description: errorMsg });
    }
  };

  return (
    <FormRenderer
      controls={controls}
      height="100%"
      w="100%"
      display="flex"
      flexDir="column"
      sx={{ '& input': { w: '450px' }, '& [role="listbox"]': { w: '450px' } }}
      formData={adminAccountSettings}
      onSubmit={onSubmit}
      gap={1}
      render={() => (
        <Flex flex="1" flexDir="column" justifyContent="flex-end" mb={4}>
          <RiveryButton
            ml="auto"
            isLoading={isUpdating}
            label="Save Changes"
            role="button"
            type="submit"
            aria-label="save"
            variant="primary"
            disabled={false}
          />
        </Flex>
      )}
    />
  );
}

export const getControls = ({ targets }) => [
  {
    type: ControlList.TITLE,
    display_name: 'General Settings',
  },
  {
    type: InputTypes.TEXT,
    name: 'account_name',
    display_name: 'Account Name',
    required: true,
    chakra: true,
    mb: 3,
  },

  {
    type: InputTypes.TEXT,
    name: 'owner_email',
    display_name: 'Owner Email',
    required: true,
    chakra: true,
    mb: 3,
  },

  {
    type: ControlList.TITLE,
    display_name: 'Features',
    mt: 3,
  },
  {
    type: ControlList.SELECT_SINGLE,
    name: 'main_target',
    display_name: 'Main Data Target',
    required: false,
    name_column: 'name',
    value_column: 'datasource_type_id',
    options: targets,
    chakra: true,
  },
  {
    type: ControlList.TITLE,
    display_name: 'AI Features',
    mt: 3,
  },
  {
    type: ControlList.SWITCH,
    name: 'allow_ai_based_processing',
    display_name: 'Enable AI Features',
    'data-pendo-id': TroubleshootTags.SETTINGS_TOGGLE,
  },
  {
    type: ControlList.PLAIN_TEXT,
    color: 'font-secondary',
    fontSize: 'xs',
    display_name:
      'AI features may generate responses based on your input and should be reviewed. <a href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Security/reporting-and-resolving-problems" target="_blank" rel="noopener noreferrer" style="color: var(--exo-color-font-link); text-decoration: underline;">Read more</a>',
  },
];
