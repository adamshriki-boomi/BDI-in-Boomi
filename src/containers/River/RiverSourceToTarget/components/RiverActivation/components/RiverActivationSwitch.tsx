import { apiV1 } from 'api/api.proxy';
import {
  CheckIcon,
  Icon,
  PageOverlaySpinner,
  RiveryInfoTooltip,
  Text,
} from 'components';
import { RiverySwitch } from 'components/Form';
import { useRiverId } from 'containers/Activities/helpers';
import { useValidateRiverSaver } from 'containers/River/new/source-to-target/components/SaveRiverButton';
import { useToastComponent } from 'hooks/useToast';
import {
  IRiverStatus,
  IVariableV1,
  useSttFormContext,
  useUpdateRiverMutation,
} from 'modules/SourceTarget';
import { useUpdateRiverVariablesMutation } from 'modules/SourceTarget/store/variables.query';
import { useCallback, useState } from 'react';
import { useAsyncFn, useEffectOnce, useToggle } from 'react-use';
import { getV1Path } from 'store/createRiveryApi';
import { useRiver, useRiverActions } from 'store/river';
import {
  haveVariablesChanged,
  moveToVariablesStructure,
} from 'store/river/river.effects';
import { ActivationModal } from '../RiverActivationModal';
import { DisablingModal } from '../RiverDisablingModal';

export function RiverActivationSwitch({ switchDisabled }) {
  const formApi = useSttFormContext();
  const [showActivation, toggleActivation] = useToggle(false);
  const [showDisabling, toggleDisabling] = useToggle(false);
  const [runningOperation, setRunningOperation] = useState(null);
  const { selectedVariables, initialVariables } = useRiver();
  const { syncInitialVariables } = useRiverActions();

  enum ActivationOperations {
    ACTIVATE = 'activate_river',
    DISABLE = 'disable_river',
  }

  const { error } = useToastComponent();
  const riverId = useRiverId();
  useEffectOnce(() => {
    const urlPath = getV1Path(
      true,
      `/rivers/${riverId}/operations?only_running_operations=true`,
    );
    apiV1.get(urlPath).then(({ data }) => {
      if (data?.items?.length > 0) {
        const runningProccess = data?.items?.find(({ operation_type }) =>
          [
            ActivationOperations.ACTIVATE,
            ActivationOperations.DISABLE,
          ].includes(operation_type),
        );
        if (runningProccess) {
          const opType = runningProccess?.operation_type;
          setRunningOperation(runningProccess);
          if (opType === ActivationOperations.ACTIVATE) {
            toggleActivation(true);
          } else {
            toggleDisabling(true);
          }
        }
      }
    });
  });
  const is_active =
    formApi?.watch('river.metadata.river_status') === IRiverStatus.ACTIVE;
  const [updateRiver] = useUpdateRiverMutation();
  const [setVariables] = useUpdateRiverVariablesMutation();
  const validateRiverStructure = useValidateRiverSaver();
  const [{ loading: isLoading }, saveRiverBeforeActivation] = useAsyncFn(
    async (river, riverVariables) => {
      const valid = await validateRiverStructure(river, {
        isActivateButton: true,
      });
      if (valid) {
        const res: any = await updateRiver(river);
        if (!res.error) {
          const variablesChanged = haveVariablesChanged(
            initialVariables,
            riverVariables,
          );
          if (variablesChanged) {
            const items = moveToVariablesStructure(
              riverVariables ?? {},
            ) as unknown as IVariableV1[];
            const variables: any = await setVariables({
              items,
              crossId: riverId,
            });
            if (!variables.error) {
              syncInitialVariables();
              await toggleActivation(true);
            } else {
              error({
                title: 'Changes to data flow variables were not saved',
                description:
                  (variables?.error?.data?.detail ||
                    variables?.error?.data?.detail?.[0]?.msg) ??
                  'Something went wrong',
                duration: 30000,
              });
            }
          } else {
            await toggleActivation(true);
          }
        } else {
          error({
            title: 'Failed to save data flow',
            description:
              (res?.error?.data?.detail ||
                res?.error?.data?.detail?.[0]?.msg) ??
              'Something went wrong. Your changes were not saved',
            duration: 30000,
          });
        }
      }
    },
  );

  const setActive = useCallback(
    e => {
      const isChecked = e?.target?.checked;
      if (!isChecked) {
        toggleDisabling(true);
      } else {
        const { variables, encryptedVariables, blueprint, ...rest } =
          formApi?.watch('river') as any;
        saveRiverBeforeActivation(rest, selectedVariables);
      }
    },
    [formApi, saveRiverBeforeActivation, selectedVariables, toggleDisabling],
  );

  return (
    <>
      {isLoading && <PageOverlaySpinner />}
      <SwitchWrapper switchDisabled={switchDisabled}>
        <RiverySwitch
          aria-label="Activate Data Flow"
          variant="activate"
          isDisabled={switchDisabled}
          formLabelStyle={{ mr: '4px!important' }}
          checkIcon={
            <Icon
              color="white"
              as={CheckIcon}
              mt={0.5}
              position="absolute"
              left={1}
              top={0.5}
              boxSize="14px"
            />
          }
          label={
            <Text textStyle="M7" color={is_active ? 'font' : 'font-secondary'}>
              Active
            </Text>
          }
          isChecked={is_active}
          onChange={setActive}
          leftLabel
        />
      </SwitchWrapper>
      <ActivationModal
        show={showActivation}
        toggle={toggleActivation}
        runningOperation={runningOperation}
      />
      <DisablingModal
        show={showDisabling}
        toggle={toggleDisabling}
        runningOperation={runningOperation}
      />
    </>
  );
}

function SwitchWrapper({ switchDisabled, children }) {
  return switchDisabled ? (
    <RiveryInfoTooltip
      buttonProps={{ height: '24px!important' }}
      description="The data flow cannot be disabled while running or waiting for re-activation"
      icon={children}
    />
  ) : (
    children
  );
}
