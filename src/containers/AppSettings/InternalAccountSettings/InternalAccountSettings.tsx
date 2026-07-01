import { Heading, HStack, Icon, VStack } from '@chakra-ui/react';
import { updateSuperAdminSettings } from 'api/endpoints/accounts.api';
import { isStatusSuccess } from 'api/endpoints/common.api';
import { ControlList, Partner, Plans, PlansIds } from 'api/types';
import { ButtonModal, RenderGuard } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { FormRenderer, InputTypes, RadioGroup } from 'components/Form';
import {
  ActiveAccountType,
  activeAccountTypeInput,
  ManagedByType,
  managedByTypeInput,
  partnerPlanInput,
} from 'containers/AppSettings/AccountTypes';
import { BlockAccountModal } from 'containers/AppSettings/InternalAccountSettings/BlockAccount';
import { DeleteAccountModal } from 'containers/AppSettings/InternalAccountSettings/DeleteAccount';
import { useToastComponent } from 'hooks/useToast';
import { useTargetTypesFilter } from 'modules/Datasources/useLogicTargets';
import React, { useState } from 'react';
import { BiCreditCard } from 'react-icons/bi';
import { useToggle } from 'react-use';
import { useCore, useCoreActions } from 'store/core';
import { displayDate } from 'utils/date.utils';
import { ExtendTrial } from './ExtendTrial';
import { HFSources } from './HFSources';
import { BillingTypes } from 'api/types/billing.types';
import { useGetIsAccountThatIsManagedByBoomi } from 'containers/Settings/Users/users.helpers';

const plansOptionsActivateAccount = [
  { value: PlansIds.PROFESSIONAL_2025, label: Plans.PROFESSIONAL_2025 },
  { value: PlansIds.PRO_PLUS_2025, label: Plans.PRO_PLUS_2025 },
  { value: PlansIds.ENTERPRISE_2025, label: Plans.ENTERPRISE_2025 },
];

export function InternalAccountSettings() {
  const { error } = useToastComponent();
  const { accountSettings, isAccountTypeActive, partner, plan } = useCore();
  const managedByBoomiAccount = useGetIsAccountThatIsManagedByBoomi();
  const [isUpdating, toggle] = useToggle(false);
  const onSubmit = async formData => {
    toggle(true);
    const { partner_plan, managed_by, ...formRest } = formData;
    const formDataToSend =
      formRest.active_account_type === ActiveAccountType.PARTNER
        ? { partner_plan, ...formRest }
        : { partner_plan: null, ...formRest };
    // ...accountSettings is for including any settings that are not shown in form
    const managedBy =
      (managed_by === ManagedByType.RIVERY && managedByBoomiAccount) ||
      (managed_by === ManagedByType.BOOMI && !managedByBoomiAccount)
        ? { managed_by }
        : null; //only if we see a change we will update
    const res: any = await updateSuperAdminSettings({
      ...accountSettings,
      ...formDataToSend,
      ...managedBy,
    });
    if (isStatusSuccess(res)) {
      window.location.reload();
    } else {
      toggle(false);
      error({ description: res?.message });
    }
  };
  const accountSettingsForm = {
    ...accountSettings,
    managed_by: managedByBoomiAccount
      ? ManagedByType.BOOMI
      : ManagedByType.RIVERY,
  };

  const controls = useControls();
  const showExtendTrial = !isAccountTypeActive && !managedByBoomiAccount;

  return (
    <FormRenderer
      controls={controls}
      formData={accountSettingsForm}
      onSubmit={onSubmit}
      display="grid"
      gridTemplateColumns="1fr 2fr"
      style={{ pr: 4, gap: 2 }}
      marginTop={2}
      render={({ useFormApi }) => (
        <>
          <VStack
            borderLeftWidth="1px"
            pl={4}
            borderLeftColor="gray.300"
            alignItems="start"
          >
            {partner !== Partner.AWS && (
              <>
                <Heading
                  as="h3"
                  fontSize="md"
                  fontWeight="medium"
                  color="primary"
                >
                  More Actions
                </Heading>
                <VStack gap={1} alignItems="start">
                  <RenderGuard condition={showExtendTrial}>
                    <ExtendTrial />
                  </RenderGuard>
                  <RenderGuard condition={!managedByBoomiAccount}>
                    <ActivateAccountModal />
                  </RenderGuard>
                  <BlockAccountModal />
                  <DeleteAccountModal />
                </VStack>
              </>
            )}
            <HFSources formApi={useFormApi} plan={plan} />
          </VStack>
          <HStack justifyContent="flex-start" gap={4} my={3}>
            <RiveryButton
              position="absolute"
              top="1"
              size="sm"
              right="1"
              isLoading={isUpdating}
              label="Save Changes"
              type="submit"
              aria-label="save"
              variant="primary"
              disabled={false}
            />
          </HStack>
        </>
      )}
    />
  );
}

const ActivateAccountModal = () => {
  const { activateAccount } = useCoreActions();
  const { activeAccountName } = useCore();
  const [selectedPlan, setSelectedPlan] = useState(
    plansOptionsActivateAccount[0].value,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleAccountActivation = async () => {
    setIsLoading(true);
    try {
      await activateAccount(selectedPlan);
      window.location.reload();
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <ButtonModal
      footer={{
        saveLabel: 'Activate',
      }}
      onSuccess={handleAccountActivation}
      header={`Set account ${activeAccountName} for annual plan`}
      body={
        <RadioGroup
          label=""
          name="plan"
          values={plansOptionsActivateAccount}
          checked={selectedPlan}
          onChange={v => {
            setSelectedPlan(v);
          }}
        />
      }
      button={
        <RiveryButton
          label="Set Annual Plan (Activate)"
          isLoading={isLoading}
          leftIcon={<Icon as={BiCreditCard} />}
        />
      }
    />
  );
};

function useControls() {
  const targets = useTargetTypesFilter();
  const managedByBoomiAccount = useGetIsAccountThatIsManagedByBoomi();
  const {
    activatedAt,
    trialEndDate,
    registrationDate,
    accountType,
    plan,
    boomiAccountId,
    partner,
    billingType,
  } = useCore();
  const activatedAtAccount = activatedAt && displayDate(activatedAt * 1000);
  const trialEndDateAccount = trialEndDate && displayDate(trialEndDate * 1000);
  const registrationDateAccount =
    registrationDate && displayDate(registrationDate * 1000);
  const dataTargets = targets
    ?.concat({
      name: 'No Default Target',
      datasource_type_id: '',
    } as any)
    .reverse();
  const props = {
    targets: dataTargets,
    accountType,
    managedBy: managedByBoomiAccount ? 'Boomi' : 'Rivery',
    partner,
    plan,
    boomi_account_id: boomiAccountId,
    registrationDateAccount,
    trialEndDateAccount,
    activatedAtAccount,
    billingType,
  };
  return getControls(props);
}

const getControls = ({
  targets,
  accountType,
  managedBy,
  partner,
  activatedAtAccount,
  trialEndDateAccount,
  registrationDateAccount,
  plan,
  billingType,
}) => {
  return [
    {
      display_name: 'General Settings',
      type: 'title',
    },
    {
      type: InputTypes.TEXT,
      name: 'account_name',
      display_name: 'Account Name',
      required: true,
    },

    {
      type: InputTypes.TEXT,
      name: 'owner_email',
      display_name: 'Owner Email',
      required: true,
    },
    {
      type: InputTypes.TEXT,
      name: 'boomi_account_id',
      display_name: 'Boomi Account ID',
      required: false,
    },
    {
      display_name: 'Subscription & Billing',
      type: 'title',
    },

    {
      type: ControlList.KEY_VAL,
      display_name: 'Account Status',
      value: accountType,
      textTransform: 'capitalize',
    },
    {
      type: ControlList.KEY_VAL,
      display_name: 'Managed By',
      value: managedBy,
      textTransform: 'capitalize',
    },
    {
      type: ControlList.KEY_VAL,
      display_name: 'Partner',
      value: partner,
      textTransform: 'capitalize',
    },
    activeAccountTypeInput,
    managedByTypeInput,
    partnerPlanInput,
    {
      type: ControlList.KEY_VAL,
      display_name: 'Subscription Plan Name',
      value: plan,
      textTransform: 'capitalize',
    },
    {
      type: ControlList.KEY_VAL,
      display_name: 'Registration Date',
      value: registrationDateAccount,
    },
    {
      type: ControlList.KEY_VAL,
      display_name: 'Trial End Date',
      value: trialEndDateAccount,
    },
    {
      type: ControlList.KEY_VAL,
      display_name: 'Activated Date',
      value: activatedAtAccount,
    },
    { display_name: 'Features', type: 'title' },
    {
      type: ControlList.SELECT_SINGLE,
      name: 'main_target',
      display_name: 'Main Data Target',
      required: false,
      name_column: 'name',
      value_column: 'datasource_type_id',
      options: targets,
    },
    {
      type: InputTypes.NUMBER,
      name: 'max_allowed_environments',
      display_name: 'Max Allowed Environments',
      max: 1000,
      min: 1,
      pattern: /^\d*$/,
      validate: value => {
        return /^\d*|\s*$/.test(value) || 'must be a number: 1 to 1000';
      },
    },
    {
      type: InputTypes.NUMBER,
      name: 'max_selected_tables',
      display_name: 'Max Selected Tables',
      placeholder: 'Number between 50-to 550',
      max: 550,
      min: 50,
      pattern: /^\d*$/,
      validate: value => {
        return /^\d*|\s*$/.test(value) || 'must be a number: 50 to 550';
      },
    },

    {
      type: 'switch',
      name: 'allow_sub_rivers',
      display_name: 'Enable sub data flows',
    },
    {
      type: 'switch',
      name: 'allow_metadata_multi_tables',
      display_name: 'Enable Use Rivery Metadata for multi tables',
    },
    {
      type: 'switch',
      name: 'allow_logic_python',
      display_name: 'Enable Logic Python',
    },
    // {
    //   type: 'switch',
    //   name: 'enable_data_quality',
    //   display_name: 'Enable Data Quality Tests',
    // },
    {
      type: 'switch',
      name: 'allow_audit_log',
      display_name: 'Enable Audit View',
    },
    // {
    //   type: 'switch',
    //   name: 'allow_new_run_river_api',
    //   display_name: 'Enable New Run Api',
    // },
    {
      type: 'switch',
      name: 'block_custom_schedule',
      display_name: 'Block Minutes and Custom Schedule',
    },
    {
      type: 'switch',
      name: 'manage_users_by_sso_only',
      display_name: 'Manage users by SSO only',
    },
    {
      type: 'switch',
      name: 'enable_oracle_cdc',
      display_name: 'Enable Oracle CDC',
    },
    billingType === BillingTypes.ANNUAL && {
      type: 'switch',
      name: 'allow_subscriptions_to_payg',
      display_name: 'Allow account to subscribe to Base plan',
    },
  ];
};
