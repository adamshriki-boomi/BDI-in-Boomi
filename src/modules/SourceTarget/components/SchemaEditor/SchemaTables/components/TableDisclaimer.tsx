import { HStack, RiveryInfoTooltip, Text } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { IRiverExtractMethod } from 'modules/SourceTarget/store';
import { ReactNode } from 'react';

function CdcDisclaimer() {
  return (
    <RiveryAlert
      variant="warning-light"
      w="max-content"
      alignSelf="flex-start"
      description={
        <HStack spacing={1}>
          <Text>Showing CDC-eligible objects only</Text>
          <RiveryInfoTooltip
            description="In CDC mode, the schema list is limited to objects that support change data capture - tables, and synonyms that resolve to a table or editioning view."
            color="font-secondary"
            buttonProps={{ height: '0px', minW: 6 }}
            extraProps={{ placement: 'top', portal: true, offset: [0, 22] }}
          />
        </HStack>
      }
    />
  );
}

export function getFilterTablesDisclaimer(
  extractMethod: IRiverExtractMethod,
): ReactNode {
  switch (extractMethod) {
    case IRiverExtractMethod.LOG:
      return <CdcDisclaimer />;
    default:
      return undefined;
  }
}
