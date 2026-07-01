import { Box, Flex, HStack, Icon } from '@chakra-ui/react';
import RiveryButton, { CloseIconButton } from 'components/Buttons/RiveryButton';
import { Input } from 'components/Form';
import * as React from 'react';
import { MdAdd } from 'react-icons/md';
import { useDebounce, useList } from 'react-use';
import { Collapse } from '../Collapse';

const URI_PREFIX = 'gs://';

type EditUDFSourceURIProps = {
  name: string;
  label: string;
  values: string[];
  onChange: (values: string[]) => any;
};
export function EditUDFSourceURI({
  values,
  onChange,
  name,
  label,
}: EditUDFSourceURIProps) {
  const [list, { removeAt, updateAt, push }] = useList(values);
  const onAddField = () => {
    push(URI_PREFIX);
  };
  const onSourceChange = (index: number, value: string) => {
    updateAt(index, value);
  };

  // debounce for all inputs -> fire on change event XYZms after typing stops
  // because we want to fire the change after few key strokes
  useDebounce(
    () => {
      onChange(list);
    },
    500,
    [list],
  );

  return (
    <Collapse
      header="Add UDF Source URI's"
      tooltip="URI for executing a user-defined function on Bigquery"
      label={label}
      mb={2}
      buttonProps={{
        variant: 'primary',
      }}
    >
      <Box mt={2} p={3} shadow="ms">
        <h6>Edit UDF Source URI's</h6>
        <Flex flexDir="column">
          {list?.map((value, index) => (
            <HStack key={`udf-uri-${index}`} justifyContent="space-between">
              <Input
                placeholder="type uri..."
                name={`${name}-${index}`}
                value={value}
                onChange={ev => onSourceChange(index, ev.target.value)}
                flexGrow="1"
              />
              <CloseIconButton
                onClick={() => removeAt(index)}
                aria-label="close"
                px={0}
              />
            </HStack>
          ))}
        </Flex>
        <RiveryButton
          label="Add Source"
          variant="outlined-primary"
          onClick={onAddField}
          leftIcon={<Icon as={MdAdd} />}
        />
      </Box>
    </Collapse>
  );
}
