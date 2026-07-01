import { useFormContext } from 'react-hook-form';
import { IModifiedColumn } from 'modules/SourceTarget/store';
import { Flex } from '@chakra-ui/react';
import { Input } from 'components/Form';
import { InfoTooltip, Textarea } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { ModeSelect } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/Mapping/components/AllColumns/ModeSelect';
import * as React from 'react';

export function CalculatedColumns() {
  const formMethods = useFormContext<IModifiedColumn>();
  return (
    <>
      <Flex flexDir="column" gap={2}>
        <Input
          as={Textarea}
          label="Expression"
          aria-label="Expression"
          placeholder="Enter expression"
          name="expression"
          api={formMethods}
          chakra
          required
        />

        <RiveryAlert
          variant="info"
          icon={InfoTooltip}
          description="The expression should be composed according to the Target/ Source query syntax; Any statements that modify the granularity of the table (JOIN, GROUP BY, ALTER TABLE, CREATE TABLE etc.) are not supported."
        />
      </Flex>
      <Input
        label="Target Column Name"
        name="name"
        api={formMethods}
        chakra
        secondaryLabel="Avoid using reserved words e.g. INSERT, SELECT, ROWID, etc."
        required
      />
      <ModeSelect />
    </>
  );
}
