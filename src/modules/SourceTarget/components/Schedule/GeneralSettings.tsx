import {
  Bell,
  Box,
  Divider,
  Flex,
  HStack,
  Icon,
  OutlinedTime,
  RenderGuard,
  Text,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { CustomSelectForm, RiverySwitch } from 'components/Form';
import { InputNumber } from 'components/Form/components/Input/InputNumber';
import MultiEmailsCreatableSelect from 'components/Form/components/MultiEmailsComponent';
import { RiverPrefrences } from 'containers/River/RiverSourceToTarget/Overview/RiverPreferences';
import { timeoutOptions } from 'containers/River/Settings/components/TimeoutSelector';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useSttFormContext } from '../form';

export function GeneralSettings() {
  return (
    <Flex flexDir="column" gap={8}>
      <Timeouts />
      <EmailNotifications />
      <RiverPrefrences />
    </Flex>
  );
}

enum TimeUnit {
  H = 'hours',
  M = 'minutes',
}
const unitMultiplier = {
  [TimeUnit.H]: 3600,
  [TimeUnit.M]: 60,
};

function TimeoutInput({ initialValue, updateForm, unit, isReadOnly = false }) {
  const [value, setValue] = useState(initialValue);
  const multiply = unitMultiplier[unit];
  useEffect(() => {
    if (!isNaN(initialValue) && !value) {
      setValue(initialValue);
    }
  }, [initialValue, value]);
  return (
    <InputNumber
      inputProps={{ min: 0, max: unit === TimeUnit.H ? 48 : 59 }}
      fieldHeight="35px"
      w="60px"
      value={value}
      onChange={v => {
        updateForm(unit, Number(v) * multiply);
        setValue(v);
      }}
      isReadOnly={isReadOnly}
      isDisabled={isReadOnly}
    />
  );
}

const useSelectTimeout = timeout => {
  const hours = useMemo(() => Math.floor(timeout / 3600), [timeout]);
  const minutes = useMemo(() => Math.floor((timeout % 3600) / 60), [timeout]);
  return {
    hours,
    minutes,
    originalMinutes: minutes * 60,
    originalHours: hours * 3600,
  };
};

function Timeouts() {
  const formApi = useSttFormContext();
  const { field: timeoutSeconds } = useController({
    name: 'river.settings.run_timeout_seconds',
    control: formApi?.control,
  });
  const timeout = timeoutSeconds.value;
  const isToggleOn = timeout != null;
  const { minutes, originalMinutes, hours, originalHours } =
    useSelectTimeout(timeout);

  const setFormValue = useCallback(
    (unit, value) => {
      if (unit === TimeUnit.H) {
        timeoutSeconds.onChange(originalMinutes + value);
      }
      if (unit === TimeUnit.M) {
        timeoutSeconds.onChange(originalHours + value);
      }
    },
    [timeoutSeconds, originalMinutes, originalHours],
  );
  return (
    <TimeOutsFields
      hours={hours}
      minutes={minutes}
      setValue={setFormValue}
      isReadOnly={false}
      isToggleOn={isToggleOn}
      onToggleChange={e =>
        timeoutSeconds.onChange(e.target.checked ? 43200 : null)
      }
    />
  );
}

function TimeOutsFields({
  hours,
  minutes,
  setValue,
  isReadOnly,
  isToggleOn,
  onToggleChange,
}) {
  return (
    <Flex flexDir="column" gap={2} w="full">
      <HStack w="full">
        <Icon as={OutlinedTime} color="primary" boxSize={4} flexShrink={0} />
        <Text textStyle="M6" color="primary" flexShrink={0}>
          Set Custom Timeout
        </Text>
        <RiverySwitch
          label=""
          ml="auto"
          isChecked={isToggleOn}
          onChange={onToggleChange}
          isDisabled={isReadOnly}
        />
      </HStack>
      {isToggleOn ? (
        <Flex flexDir="column" gap={2}>
          <Text textStyle="R7" color="font">
            Timeout data flow run after
          </Text>
          <Flex textStyle="R7" color="font" gap={2} alignItems="center">
            <TimeoutInput
              initialValue={hours}
              updateForm={setValue}
              unit={TimeUnit.H}
              isReadOnly={isReadOnly}
            />
            <Text>hours</Text>
            <TimeoutInput
              initialValue={minutes}
              updateForm={setValue}
              unit={TimeUnit.M}
              isReadOnly={isReadOnly}
            />
            <Text>minutes</Text>
            <Text color="font-secondary">(max 48h)</Text>
          </Flex>
          <RiveryAlert
            variant="secondary"
            description={
              <>
                <Text as="span" fontWeight="bold">
                  Note:
                </Text>{' '}
                Large tables may not finish within this limit. The run will stop
                mid-extraction.
              </>
            }
          />
        </Flex>
      ) : (
        <Text textStyle="R7" color="font-secondary">
          Run is handled automatically per run, based on table size. Runs are
          capped between 12 hours and up to 7 days.
        </Text>
      )}
    </Flex>
  );
}

function NotificationsHeader() {
  return (
    <Flex flexDir="column" textStyle="R7" color="font-secondary">
      <HStack>
        <Icon as={Bell} color="primary" boxSize={4} />
        <Text textStyle="M6" color="primary">
          Notifications
        </Text>
      </HStack>
      <Text>
        Add your email address in the fields below to get one or more
        notifications. Use a comma (,) to add multiple emails.
      </Text>
    </Flex>
  );
}

function EmailNotifications() {
  const form = useSttFormContext();
  const notificationsField = 'river.settings.notification';
  const notifications = form?.watch(notificationsField);

  return (
    <Flex flexDir="column" gap={2}>
      <NotificationsHeader />
      <Flex flexDir="column" gap={4}>
        {notifications
          ? Object.keys(notifications)?.map((key, idx) => {
              const isSwitchEnabled = Boolean(notifications[key].is_enabled);
              return (
                <Flex key={idx} flexDir="column" gap={2}>
                  <Flex flexDir="column" pb={2}>
                    <NotificationSwitch
                      name={`${notificationsField}.${key}.is_enabled`}
                      api={form}
                      label={key.replace('_', ' ')}
                    />
                    {idx === 2 && isSwitchEnabled && (
                      <Box h={isSwitchEnabled ? 'full' : 0}>
                        <TimeoutsField
                          name={`${notificationsField}.${key}.run_threshold`}
                          api={form}
                        />
                      </Box>
                    )}

                    <Box
                      h={isSwitchEnabled ? 'full' : 0}
                      w="350px"
                      visibility={isSwitchEnabled ? 'visible' : 'hidden'}
                    >
                      <EmailFieldInput
                        isDisabled={!isSwitchEnabled}
                        form={form}
                        name={`${notificationsField}.${key}.email`}
                      />
                    </Box>
                  </Flex>
                  {idx !== 2 && <Divider w="full" orientation="horizontal" />}
                </Flex>
              );
            })
          : null}
      </Flex>
    </Flex>
  );
}

function EmailFieldInput({ form = null, name, ...inputProps }) {
  const { field: emailsField } = useController({
    name,
    control: form?.control,
  });
  return (
    <MultiEmailsCreatableSelect
      placeholder="Add Email Address"
      emailsField={emailsField}
      {...inputProps}
    />
  );
}

function TimeoutsField({ ...fieldProps }) {
  return (
    <HStack gap={1} py={1} w="85%">
      <Text>Notify when Data Flow execution passes</Text>
      {/* Value is seconds!! */}
      <CustomSelectForm
        options={timeoutOptions}
        controlId="run_thershold"
        isMulti={false}
        {...fieldProps}
      />
    </HStack>
  );
}

function NotificationSwitch({ ...switchProps }) {
  return (
    <RiverySwitch
      label=""
      leftLabel
      mb="2px"
      ml="auto"
      pr={2}
      mt={1}
      formLabelStyle={{
        textStyle: 'R7 !important',
        textTransform: 'capitalize !important',
        color: 'font !important',
      }}
      {...switchProps}
    />
  );
}

export function EditModeTimeoutSettings({ timeout, setTimeout, isReadOnly }) {
  const isToggleOn = timeout != null;
  const { minutes, originalMinutes, hours, originalHours } =
    useSelectTimeout(timeout);

  const setValue = useCallback(
    (unit, value) => {
      if (unit === TimeUnit.H) {
        setTimeout(originalMinutes + value);
      } else {
        setTimeout(originalHours + value);
      }
    },
    [originalHours, originalMinutes, setTimeout],
  );
  return (
    <Flex flexDir="column" gap={3}>
      <TimeOutsFields
        hours={hours}
        minutes={minutes}
        setValue={setValue}
        isReadOnly={isReadOnly}
        isToggleOn={isToggleOn}
        onToggleChange={e => setTimeout(e.target.checked ? 43200 : null)}
      />
    </Flex>
  );
}

export function EditModeNotifications({ isReadOnly }) {
  const form = useFormContext();
  const { field: notificationField } = useController({
    name: 'settings.notification',
    control: form.control,
  });

  return (
    <Flex flexDir="column" gap={2}>
      <NotificationsHeader />
      <Flex flexDir="column" gap={4}>
        {Object.keys(notificationField?.value)?.map((key, idx) => {
          const isSwitchEnabled = Boolean(
            notificationField?.value?.[key]?.is_enabled,
          );
          return (
            <Flex key={idx} flexDir="column" gap={2}>
              <Flex flexDir="column" gap={2}>
                <NotificationSwitch
                  name={`settings.notification.${key}.is_enabled`}
                  isReadOnly={isReadOnly}
                  label={key.replace('_', ' ')}
                  api={form}
                />
                <RenderGuard condition={idx === 2 && isSwitchEnabled}>
                  <Box h="full">
                    <TimeoutsField
                      isReadOnly={isReadOnly}
                      isDisabled={
                        !Boolean(notificationField?.value?.[key]?.is_enabled)
                      }
                      onChange={({ value }) => {
                        const notification = {
                          ...notificationField?.value,
                          run_threshold: {
                            ...notificationField?.value?.['run_threshold'],
                            execution_time_limit_seconds: value,
                          },
                        };
                        notificationField?.onChange(notification);
                      }}
                    />
                  </Box>
                </RenderGuard>
                <RenderGuard
                  condition={Boolean(
                    form?.watch(
                      `settings.notification.${key}.is_enabled` as any,
                    ),
                  )}
                >
                  <Box h="full" w="350px">
                    <EmailFieldInput
                      isDisabled={!isSwitchEnabled || isReadOnly}
                      isReadOnly={isReadOnly}
                      name={`settings.notification.${key}.email`}
                      form={form}
                    />
                  </Box>
                </RenderGuard>
              </Flex>
              {idx !== 2 && <Divider w="full" orientation="horizontal" />}
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
