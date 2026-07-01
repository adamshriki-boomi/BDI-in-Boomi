import {
  Flex,
  OutlinedClose,
  OutlinedSuccess,
  RenderGuard,
  Text,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { useGetRiverCommonProps } from 'modules/SourceTarget';
import { SectionStatus, StatusReflection } from './StatusReflection';
import { useRiverStatusMap } from '../hooks';

export function ActivationStatusLogState({
  statusLog,
  activationError = null,
  cancelResponse = null,
  showTitle = true,
}) {
  const { isCDC } = useGetRiverCommonProps();

  const steps = useRiverStatusMap();
  const response = statusLog?.result;
  const success = statusLog?.status === 'D';
  const failure = statusLog?.status === 'E';
  return (
    <Flex flexDir="column" gap={4}>
      <RenderGuard condition={showTitle}>
        <RenderGuard
          condition={!activationError}
          fallback={
            <RiveryAlert
              variant="error-light"
              title="Data Flow Failed to Activate"
              description={activationError?.message}
              icon={OutlinedClose}
            />
          }
        >
          {success ? (
            <RiveryAlert
              variant="success-contained"
              title="Data Flow Was Successfully Activated!"
              description={
                isCDC
                  ? 'Your data is starting to stream and the Data Flow is ready to run.'
                  : 'Your Data Flow is ready to run.'
              }
              icon={OutlinedSuccess}
            />
          ) : failure ? (
            <RiveryAlert
              variant="error-light"
              title={
                cancelResponse?.data?.error_message
                  ? 'River activation was canceled'
                  : 'River Failed to Activate'
              }
              description={
                cancelResponse?.data?.error_message
                  ? null
                  : statusLog?.error_message
                  ? statusLog.error_message
                  : 'Please review the following reason(s) and proceed accordingly.'
              }
              icon={OutlinedClose}
            />
          ) : null}
        </RenderGuard>
      </RenderGuard>
      <RenderGuard condition={showTitle}>
        <StatusReflection
          isMain
          description="Data Flow Saved successfully"
          status="D"
        />
      </RenderGuard>
      {Object.entries(steps).map(([key, value], idx) => {
        let errors = [];
        if (response?.[key]) {
          Object.keys(response[key]).forEach(step => {
            if (response?.[key]?.[step]?.details !== null) {
              errors.push(response?.[key]?.[step]?.details);
            }
          });
        }

        return (
          <Flex key={key} flexDir="column" gap={3}>
            <SectionStatus
              title={value}
              steps={response?.[key] ?? {}}
              activationError={activationError || failure}
              showPending={!response}
              cancelResponse={cancelResponse}
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
