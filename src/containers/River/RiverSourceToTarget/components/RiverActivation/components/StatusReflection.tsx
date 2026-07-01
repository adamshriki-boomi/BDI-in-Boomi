import { StatusTypes } from 'api/types';
import { Flex, HStack, StatusIcon, Text } from 'components';
import { ContainedStatusIconAndText } from 'modules/Status';

export function StatusReflection({
  isMain = false,
  activationError = null,
  description,
  status,
  ...props
}) {
  const success = ['D', StatusTypes.SUCCESS].includes(status);
  const error = ['E', StatusTypes.FAILURE].includes(status);
  const pending = ['W', StatusTypes.PENDING].includes(status);
  const text = description.split('_').join(' ');

  const value = pending
    ? StatusTypes.PENDING
    : success
    ? StatusTypes.SUCCEEDED
    : error || activationError
    ? StatusTypes.FAILED
    : StatusTypes.RUNNING;
  return (
    <HStack {...props}>
      {isMain ? (
        <ContainedStatusIconAndText value={value} />
      ) : (
        <StatusIcon value={value} />
      )}

      <Text textTransform="capitalize">{text}</Text>
    </HStack>
  );
}

export function SectionStatus({
  title,
  steps,
  activationError,
  success: done = false,
  showPending = false,
  cancelResponse = {} as any,
}) {
  const hasSteps = Object.keys(steps).length > 0;
  const status_array = hasSteps
    ? Object.values(steps).filter(({ validation_status }) => validation_status)
    : [];
  const success =
    done ||
    (status_array.length > 0 &&
      status_array?.every(
        ({ validation_status = '' }) =>
          validation_status === StatusTypes.SUCCESS,
      ));
  const error = status_array?.some(
    ({ validation_status = '' }) => validation_status === StatusTypes.FAILURE,
  );
  const mainStepStatus =
    activationError || showPending
      ? StatusTypes.PENDING
      : success
      ? StatusTypes.SUCCESS
      : error
      ? StatusTypes.FAILURE
      : StatusTypes.RUNNING;
  return (
    <Flex flexDir="column" gap={2}>
      <StatusReflection description={title} status={mainStepStatus} isMain />
      <Flex flexDir="column" gap={2} pl={6}>
        {Object.entries(steps)?.map(([key, value], idx) => {
          if (key === 'extra_validations') return null;
          return (
            <StatusReflection
              key={idx}
              description={key}
              status={
                cancelResponse?.data?.error_message &&
                (value as Record<string, string>)?.validation_status ===
                  'running'
                  ? StatusTypes.FAILURE
                  : (value as Record<string, string>)?.validation_status
              }
            />
          );
        })}
      </Flex>
    </Flex>
  );
}
