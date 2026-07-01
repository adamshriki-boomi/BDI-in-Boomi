import {
  Box,
  Flex,
  GridBox,
  Heading,
  Icon,
  SuccessIcon,
  Text,
} from 'components';
import { QaulityTestLogStatus } from 'modules/QualityTests/store/qualityTestsLog.types';
import { FunctionComponent } from 'react';
import { displayDate } from 'utils/date.utils';
import { useGetTestOne } from '..';
import { ReactComponent as ErrorIcon } from '../icons/status-error.svg';

export function useFindTest(testId: string, stepId: string) {
  // const { findStep } = useRiver();
  // const step = findStep(stepId);
  const data = useGetTestOne(testId);
  // const { tests } = useTestsApi({
  //   id: stepId,
  //   type: TestTableType.STEP,
  // });
  // console.log('stepId', stepId);
  // console.log('tests', tests);
  // console.log('data', data);

  // return tests?.find(test => test._id === testId) ?? null;
  return data;
}

export function TestName({
  value,
  row: {
    original: { test_name },
    original,
  },
}) {
  // const test = useFindTest(value, step_id);
  return (
    <Box _hover={{ textDecoration: 'underline' }}>{original?.test_name}</Box>
  );
}

const testStatusMap: Record<
  QaulityTestLogStatus,
  { icon: FunctionComponent; title: string; color: string }
> = {
  succeeded: { icon: SuccessIcon, title: 'Success', color: '#00B9AD' },
  failed: { icon: ErrorIcon, title: 'Error', color: '#F32002' },
};
export function TextStatus({ value }) {
  const status = testStatusMap[value];
  return <Text color={status.color}>{status.title}</Text>;
}
export function TestStatus({ value, row, errorDescription = '' }) {
  const status = testStatusMap[value];
  return (
    <GridBox
      flexWrap="wrap"
      alignItems="flex-start"
      gridTemplateColumns="min-content 1fr"
      gap={1}
    >
      <Icon as={status.icon} boxSize={6} />
      <Text>
        {status.title}
        {value === QaulityTestLogStatus.FAILED ? (
          <ErrorDescription
            text={row?.original?.error_description ?? errorDescription}
          />
        ) : null}
      </Text>
    </GridBox>
  );
}
function ErrorDescription({ text }) {
  return text ? <>{`: ${text}`}</> : null;
}
export function TestResultsTime({ value, ...props }) {
  return (
    <GridBox {...props}>{value ? displayDate(value, 'PPpp') : 'N/A'}</GridBox>
  );
}

export const ResponseViewer = ({ json }) => {
  return (
    <GridBox bgColor="#F8F8F9" p="2">
      <Heading as="h6" fontSize="medium">
        Log
      </Heading>
      {Object.entries(json).map(([key, value]: any, index) => (
        <Flex
          key={`response-viewer-${index}`}
          flexDir="row"
          justifyContent="space-between"
          py="2"
          borderTop={index > 0 ? '1px' : ''}
          borderColor="background-secondary"
        >
          <Text color="font-secondary">{key}</Text>
          <Text textAlign="right">
            {Array.isArray(value) ? (
              value.join(', ')
            ) : testStatusMap?.[value] ? (
              <TextStatus value={value} />
            ) : (
              value
            )}
          </Text>
        </Flex>
      ))}
    </GridBox>
  );
};
