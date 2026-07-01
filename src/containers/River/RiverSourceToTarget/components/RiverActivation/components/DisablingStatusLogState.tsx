import {
  Flex,
  OutlinedClose,
  OutlinedSuccess,
  RenderGuard,
  Text,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { SectionStatus } from './StatusReflection';

const CDCStatusMap = {
  disable: 'Disabling',
};

const StatusMap = {
  update_river_settings: 'Disabling Data Flow',
};

export function DisablingStatusLogState({
  statusLog,
  isCDC,
  disablingError = null,
  showTitle = true,
}) {
  const response = statusLog?.result;
  const success = statusLog?.status === 'D';
  const failure = statusLog?.status === 'E';
  console.log(statusLog?.error_message);
  const statusMap = isCDC ? CDCStatusMap : StatusMap;
  return (
    <Flex flexDir="column" gap={4}>
      <RenderGuard condition={showTitle}>
        <RenderGuard
          condition={!disablingError}
          fallback={
            <RiveryAlert
              variant="error-light"
              title="Failed to disable Data Flow"
              description={disablingError?.message}
              icon={OutlinedClose}
            />
          }
        >
          {success ? (
            <RiveryAlert
              variant="success-contained"
              title="Data Flow Was Successfully Disabled!"
              description="Your data will not stream while the data flow is disabled."
              icon={OutlinedSuccess}
            />
          ) : failure ? (
            <RiveryAlert
              variant="error-light"
              title="Failed to disable Data Flow"
              description={
                statusLog?.error_message === 'The run is canceled'
                  ? 'Operation was canceled'
                  : 'Please review the following reason(s) and proceed accordingly.'
              }
              icon={OutlinedClose}
            />
          ) : null}
        </RenderGuard>
      </RenderGuard>
      {Object.entries(statusMap).map(([key, value], idx) => {
        let errors = [];
        if (response?.[key]) {
          Object.keys(response[key]).forEach(step => {
            if (
              step !== 'extra_validations' &&
              response?.[key]?.[step]?.details !== null
            ) {
              errors.push(response?.[key]?.[step]?.details);
            }
          });
        }
        return (
          <Flex key={`${idx}-${key}`} flexDir="column" gap={3}>
            <SectionStatus
              key={key}
              title={value}
              steps={response?.[key] ?? {}}
              activationError={disablingError || failure}
              success={success}
            />
            <RenderGuard condition={failure && errors?.length > 0}>
              <RiveryAlert
                variant="error-light"
                description={
                  <Flex flexDir="column" gap={2}>
                    {errors?.map((err, idx) => (
                      <Text key={idx}>{err}</Text>
                    ))}
                  </Flex>
                }
              />
            </RenderGuard>
          </Flex>
        );
      })}
    </Flex>
  );
}
