import { Flex, HStack, Text } from '@chakra-ui/react';
import { Heading, RenderGuard } from 'components';
import { RiverySwitch } from 'components/Form/components';
import { useCallback, useEffect } from 'react';
import { useRiver, useRiverActions } from 'store/river';
import { NotificationEditor } from './components/NotificationEditor';
import {
  normalizeCronTo5Fields,
  ScheduleEditor,
} from './components/ScheduleEditor';
import { TimeoutSelector } from './components/TimeoutSelector';
import RiveryAlert from 'components/Alert/Alert';
import { UTCTimezoneView } from '../RiverSourceToTarget/Overview/ScheduleOverview';
const DEFAULT_CRON_EXPRESSION = '0 0 * * * * *'; // Every hour every day (7-field format for old API)
const DEFAULT_CRON_EXPRESSION_V2 = '0 0/1 * * *'; // Every hour every day (5-field format for v2 API)

export function RiverSettings() {
  const {
    selectedRiver: {
      tasks_definitions: [{ schedule }],
      river_definitions,
    },
    errors,
  } = useRiver();

  const {
    shared_params,
    is_api_v2,
    schedulers,
    suspended = {},
  } = river_definitions;

  // Access schedule from river_definitions (may exist at runtime but not in type)
  const riverDefinitionsSchedule = (river_definitions as any)?.schedule;

  const { updateRiverTaskDefinitions, updateRiverDefinitions, updateErrors } =
    useRiverActions();

  // If schedule is enabled but cron expression is missing, set a default expression
  useEffect(() => {
    if (is_api_v2) {
      // V2 API: check schedulers[0]
      const scheduler = schedulers?.[0];
      if (scheduler?.is_enabled && !scheduler?.cron_expression?.trim()) {
        updateRiverDefinitions({
          schedulers: [
            {
              ...scheduler,
              cron_expression: DEFAULT_CRON_EXPRESSION_V2,
            },
          ],
        });
      }
    } else {
      // Old API: check task_definitions.schedule
      if (schedule?.isEnabled && !schedule?.cronExp) {
        const fallbackExpression =
          riverDefinitionsSchedule || DEFAULT_CRON_EXPRESSION;
        updateRiverTaskDefinitions({
          schedule: { ...schedule, cronExp: fallbackExpression },
        });
      }
    }
  }, [
    is_api_v2,
    schedule,
    schedulers,
    riverDefinitionsSchedule,
    updateRiverTaskDefinitions,
    updateRiverDefinitions,
  ]);

  const onActivateSchedule = useCallback(
    ({ target: { checked: isEnabled } }) => {
      if (is_api_v2) {
        updateRiverDefinitions({
          schedulers: [
            {
              ...(schedulers || [
                {
                  is_enabled: false,
                  cron_expression: '0 0/1 * * *',
                },
              ])[0],
              is_enabled: isEnabled,
            },
          ],
        });
        return;
      }
      updateRiverTaskDefinitions({
        schedule: { ...schedule, isEnabled },
      });
    },
    [
      is_api_v2,
      schedule,
      schedulers,
      updateRiverDefinitions,
      updateRiverTaskDefinitions,
    ],
  );
  const onSchedule = cronExp => {
    // Clear schedule error when a valid expression is entered
    if (cronExp?.trim() && errors?.schedule) {
      const { schedule: _scheduleError, ...remainingErrors } = errors;
      updateErrors(remainingErrors);
    }

    if (is_api_v2) {
      updateRiverDefinitions({
        schedulers: [
          {
            cron_expression: normalizeCronTo5Fields(cronExp),
            is_enabled: true,
          },
        ],
      });
      return;
    }
    const { currentTab, ...scheduleObj } = schedule;
    if (cronExp?.trim())
      updateRiverTaskDefinitions({
        schedule: { ...scheduleObj, cronExp },
      });
  };

  const { notifications } = shared_params;
  const updateNotifications = notification =>
    updateRiverDefinitions({
      shared_params: {
        ...shared_params,
        notifications: {
          ...notifications,
          ...notification,
        },
      },
    });

  return (
    <Flex flexDir="column" ml={3}>
      <Text mt={4} mb={3} fontWeight="medium">
        Schedule{' '}
        <Text as="span" fontSize="xs">
          (UTC Time Zone)
        </Text>
      </Text>
      {/* <div>Set river frequency according to UTC Time Zone.</div> */}
      <RiverySwitch
        ml={1}
        my={3}
        label="Enable Schedule"
        name="enable-schedlue"
        isChecked={
          is_api_v2 ? schedulers?.[0]?.is_enabled : schedule?.isEnabled
        }
        onChange={onActivateSchedule}
      />
      <RenderGuard condition={Boolean(suspended?.suspension_date)}>
        <RiveryAlert
          mb={2}
          w="580px"
          variant="warning-light"
          description={
            <HStack>
              <Text>
                The schedule was disabled due to consecutive errors at
              </Text>
              <UTCTimezoneView
                utcTime={suspended?.suspension_date}
                backslash={false}
              />
            </HStack>
          }
        />
      </RenderGuard>
      {schedulers?.[0]?.is_enabled || schedule?.isEnabled ? (
        <>
          <ScheduleEditor
            schedule={
              is_api_v2 ? schedulers?.[0]?.cron_expression : schedule?.cronExp
            }
            onChange={onSchedule}
            short={is_api_v2}
          />
          {errors?.schedule?.['schedule.cronExp'] && (
            <Text color="red.500" fontSize="sm" mt={2}>
              {errors.schedule['schedule.cronExp'].message}
            </Text>
          )}
        </>
      ) : null}
      <Heading as="h6" mt="4" mb="3" fontSize="sm">
        Timeouts
      </Heading>
      <TimeoutSelector
        shared_params={shared_params}
        onChange={shared_params => updateRiverDefinitions({ shared_params })}
      />
      <Heading as="h6" mt="4" mb="3" fontSize="sm">
        Notifications
      </Heading>
      <NotificationEditor
        name="failure"
        status={shared_params.notifications?.on_failure}
        onChange={on_failure => updateNotifications({ on_failure })}
      />
      <NotificationEditor
        name="warnings"
        status={shared_params.notifications?.on_warning}
        onChange={on_warning => updateNotifications({ on_warning })}
      />
      <NotificationEditor
        name="runtime threshold"
        status={shared_params.notifications?.on_run_threshold}
        onChange={on_run_threshold => updateNotifications({ on_run_threshold })}
      >
        <div>
          <TimeoutSelector
            controlId="run-notification-timeout"
            fieldKey="run_notification_timeout"
            label="Notify when data flow execution passes"
            shared_params={shared_params}
            onChange={shared_params =>
              updateRiverDefinitions({ shared_params })
            }
          />
        </div>
      </NotificationEditor>
    </Flex>
  );
}
