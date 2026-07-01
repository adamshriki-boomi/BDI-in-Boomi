import { EditIcon, Flex, Heading, HStack, Icon, Text } from 'components';
import RiveryButton, { CloseIconButton } from 'components/Buttons/RiveryButton';
import { slideInFromRightAnimation } from 'theme/animations';
import { useTestTypesMap } from '../store';
import {
  ResponseViewer,
  TestResultsTime,
  TextStatus,
  useFindTest,
} from './TestsLogCells';

export const logParameters = [
  'Time',
  'Status',
  'Test Name',
  'Step Name',
  'Type',
];
export function QualityTestLog({
  row,
  row: {
    data_quality_test_id,
    step_name,
    test_run_time,
    status,
    test_name,
    error_description,
    step_id,
  },
  setSelectedRow,
  toggleEditModal,
}) {
  const test = useFindTest(data_quality_test_id, step_id);
  const testTypesMap = useTestTypesMap();

  const testTypeName = testTypesMap?.get(
    row?.['data_quality_test_type_id'],
  )?.test_type_name;

  return (
    <Flex
      flexDir="column"
      position="absolute"
      bgColor="white"
      borderLeft="1px"
      borderLeftColor="gray.300"
      p="4"
      maxH="full"
      zIndex="modal"
      shadow="lg"
      width="550px"
      top="15px"
      right="0"
      bottom="0"
      {...slideInFromRightAnimation}
      sx={{
        '.log-row-width': {
          maxWidth: '340px',
        },
      }}
    >
      <HStack
        justifyContent="space-between"
        borderBottom="1px"
        borderColor="#F0F0F0"
        pb="3"
      >
        <Heading as="h4" fontSize="x-large">
          Test Log
        </Heading>
        <CloseIconButton
          onClick={() => setSelectedRow(null)}
          aria-label="close log"
          ml="auto"
          pr={2}
          pb={2}
        />
      </HStack>

      <Flex flexDir="column" overflowY="auto" gap="1">
        <Flex flexDir="column">
          {[
            ['Time', <TestResultsTime value={test_run_time} />],
            [
              'Test Name',
              test ? (
                <RiveryButton
                  leftIcon={<Icon as={EditIcon} ml="2" boxSize="6" />}
                  label={test_name}
                  variant="text"
                  fontSize="sm"
                  fontWeight="normal"
                  p={0}
                  onClick={() => toggleEditModal(true)}
                />
              ) : (
                <Text>{test_name}</Text>
              ),
            ],
            ['Status', <TextStatus value={status} />],
            ['Type', <Text>{testTypeName ?? ''}</Text>],
            ['Step', <Text>{step_name}</Text>],
          ].map(([columnName, valueRenderer], index) => (
            <Flex
              flexDir="row"
              justifyContent="space-between"
              py="2"
              borderTop={index > 0 ? '1px' : ''}
              borderColor="gray.200"
            >
              <Text color="gray.600">{columnName}</Text>
              {valueRenderer}
            </Flex>
          ))}
        </Flex>
        <ResponseViewer json={row} />
      </Flex>
    </Flex>
  );
}
