import {
  Box,
  CloseIconButton,
  Flex,
  Grid,
  HStack,
  Icon,
  RdsScheduleSettings,
  RenderGuard,
  RiveryButton,
  ScheduleIcon,
  Text,
} from 'components';
import { RiverySwitch } from 'components/Form';
import { ErrorsDisplay } from 'containers/River/new/source-to-target/components/DetailedErrorToastComponent';
import { validateNotificationsAndSettings } from 'containers/River/new/source-to-target/components/riverValidation';
import { normalizeCronTo5Fields } from 'containers/River/Settings/components/ScheduleEditor';
import { SchedulingError } from 'containers/River/Settings/components/ScheduleError';
import { useToastComponent } from 'hooks/useToast';
import { useDismissDrawer } from 'modules/RiverRightBar';
import { IRiverExtractMethod } from 'modules/SourceTarget/store';
import * as React from 'react';
import { useCallback, useState } from 'react';
import {
  FormProvider,
  useController,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useSttFormContext } from '../form';
import { useSchedulers } from '../form/form.controllers';
import {
  EditModeNotifications,
  EditModeTimeoutSettings,
} from '../Schedule/GeneralSettings';
import { normalizeCron, useEditModeSchedulerDataFromStore } from './hooks';
import {
  EditModeSchedulerEditorControl,
  SchedulerEditorControl,
} from './SchedulerEditorControl';
import { EXTRACT_METHOD } from '../form/form.consts';

function SchedulingDisclaimer({ isCDCRiver }) {
  return (
    <Flex flexDir="column" color="font-secondary">
      <Text>
        Set the frequency at which you would like the data flow to run.
      </Text>
      <Text> Please note that the time is in UTC.</Text>
      <RenderGuard condition={isCDCRiver}>
        <Text>* CDC Data Flows cannot be scheduled off.</Text>
      </RenderGuard>
    </Flex>
  );
}

export function Scheduler() {
  const schedulersField = useSchedulers(0);
  const formApi = useFormContext();
  const extractMethod = formApi.watch(EXTRACT_METHOD);
  const isCDCExtraction = extractMethod === IRiverExtractMethod.LOG;

  return (
    <Grid width="full" gridAutoRows="min-content" gridGap="4">
      <Box pt={3}>
        <RiverySwitch
          name="river.schedulers[0].is_enabled"
          isChecked={schedulersField?.value?.is_enabled}
          isDisabled={isCDCExtraction && schedulersField?.value?.is_enabled}
          label={
            <HStack>
              <Icon as={ScheduleIcon} boxSize={4} color="primary" />
              <Text textStyle="M6" color="primary" pr={3}>
                Schedule Data Flow
              </Text>
            </HStack>
          }
          leftLabel
          formLabelStyle={{ marginInlineStart: '0px!important' }}
          onChange={e =>
            schedulersField.update({
              ...schedulersField.value,
              is_enabled: e.target.checked,
            })
          }
        />
        <SchedulingDisclaimer isCDCRiver={isCDCExtraction} />
      </Box>

      <SchedulerEditorControl
        isDisabled={!schedulersField?.value?.is_enabled}
      />
    </Grid>
  );
}

export function EditModeScheduler() {
  const { error: errorToast } = useToastComponent();
  const formApi = useSttFormContext();
  const formValues = formApi?.watch();
  const [isValidExpression, setIsValidExpression] = useState(true);
  const isReactRoute = window.location.pathname.includes('rivers');
  const dismissDrawer = useDismissDrawer(false);
  //Needed for cases when the account is not open for new UI but have rivers in new API
  const storeData = useEditModeSchedulerDataFromStore();
  const isCDCRiver =
    formValues?.river?.properties?.source.additional_settings
      ?.extract_method === IRiverExtractMethod.LOG;
  const expression = formApi?.watch('river.schedulers')?.[0]?.cron_expression;
  //Creating a sub form to keep temp values
  const drawerFormApi = useForm({
    defaultValues: formApi
      ? {
          settings: formApi?.watch('river.settings'),
          schedulers: {
            ...formApi?.watch('river.schedulers')[0],
            cron_expression: normalizeCron(expression),
          },
        }
      : {
          ...storeData,
        },
    mode: 'onChange',
  });

  const { field: schedulerField } = useController({
    name: 'schedulers',
    control: drawerFormApi.control,
  });

  const isSchedulerEnabled = schedulerField?.value?.is_enabled;

  const { field: timeOutField } = useController({
    name: 'settings.run_timeout_seconds',
    control: drawerFormApi.control,
  });

  const setValues = useCallback(async () => {
    const settings = drawerFormApi?.watch('settings');
    const validationErrors = await validateNotificationsAndSettings({
      settings,
    });
    if (validationErrors?.errors?.length > 0) {
      validationErrors?.paths?.forEach(path =>
        formApi?.setError(`river.${path}` as any, {
          type: 'manual',
          message: 'Invalid value',
        }),
      );
      errorToast({
        title: 'Some fields are incomplete or invalid',
        description: <ErrorsDisplay response={validationErrors.errors} />,
        duration: 30000,
      });
      return;
    }
    const schedulers = {
      schedulers: [
        {
          is_enabled: isSchedulerEnabled,
          cron_expression: normalizeCronTo5Fields(
            schedulerField?.value?.cron_expression,
          ),
        },
      ],
    };

    formApi?.setValue(
      'river',
      {
        ...formValues?.river,
        ...schedulers,
        settings,
      },
      { shouldDirty: true },
    );
    dismissDrawer();
  }, [
    dismissDrawer,
    drawerFormApi,
    errorToast,
    formApi,
    formValues?.river,
    schedulerField?.value?.cron_expression,
    isSchedulerEnabled,
  ]);

  const setAndValidateExpression = useCallback(
    (expression: string, isValid = true) => {
      setIsValidExpression(isValid);
      schedulerField.onChange({
        ...schedulerField.value,
        cron_expression: expression,
      });
    },
    [schedulerField],
  );

  return (
    <form style={{ display: 'contents' }}>
      <FormProvider {...drawerFormApi}>
        <Grid templateRows="min-content 1fr" h="full" gap={4}>
          <HStack
            justify="space-between"
            pt={3}
            pl={6}
            borderBottom="1px"
            borderBottomColor="gray.300"
          >
            <Flex alignItems="center" gap={2}>
              <Icon
                as={RdsScheduleSettings}
                boxSize={5}
                color="background-selected"
              />
              <Text textStyle="M4">Schedule & Notifications</Text>
            </Flex>
            <CloseIconButton
              onClick={dismissDrawer}
              aria-label="dismiss-drawer"
              as={Link}
            />
          </HStack>
          <Grid
            overflowY="auto"
            h="full"
            gap={4}
            templateRows="min-content 50px min-content 1fr min-content"
          >
            <Box px={6}>
              <RiverySwitch
                isChecked={isSchedulerEnabled}
                label={
                  <Text textStyle="M6" color="primary" pr={3}>
                    Schedule Data Flow
                  </Text>
                }
                leftLabel
                formLabelStyle={{ marginInlineStart: '0px!important' }}
                onChange={e =>
                  schedulerField?.onChange({
                    ...schedulerField?.value,
                    is_enabled: e.target.checked,
                  })
                }
                isReadOnly={[
                  !isReactRoute,
                  isCDCRiver && isSchedulerEnabled,
                ].some(Boolean)}
                ariaLabel="Schedule Data Flow"
              />
              <SchedulingDisclaimer isCDCRiver={isCDCRiver} />
            </Box>
            <Box px={6}>
              <EditModeSchedulerEditorControl
                value={schedulerField?.value?.cron_expression}
                setValue={setAndValidateExpression}
                isDisabled={!isSchedulerEnabled}
                isReadOnly={!isReactRoute}
                isCDC={isCDCRiver}
              />
              <SchedulingError />
            </Box>

            <Box px={6}>
              <EditModeTimeoutSettings
                isReadOnly={!isReactRoute}
                timeout={timeOutField?.value}
                setTimeout={timeOutField?.onChange}
              />
            </Box>
            <Box px={6}>
              <EditModeNotifications isReadOnly={!isReactRoute} />
            </Box>
            <HStack
              justify="space-between"
              borderTop="1px"
              h="57px"
              borderTopColor="gray.300"
              px={6}
              py={3}
            >
              <RiveryButton
                label="Cancel"
                size="small"
                variant="text"
                onClick={dismissDrawer}
                href="#"
              />
              <RiveryButton
                label="Apply Changes"
                size="small"
                onClick={setValues}
                isDisabled={!isReactRoute || !isValidExpression}
              />
            </HStack>
          </Grid>
        </Grid>
      </FormProvider>
    </form>
  );
}
