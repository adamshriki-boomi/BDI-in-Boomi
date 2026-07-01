import { Collapse, Divider, useDisclosure } from '@chakra-ui/react';
import {
  Box,
  ChevronDown,
  ChevronUp,
  Flex,
  HStack,
  Icon,
  RenderGuard,
  Text,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { Input, Radio } from 'components/Form';
import { ReactNode } from 'react';
import { HiOutlineLightBulb } from 'react-icons/hi';
import { extractionMethods } from '../SchemaTables/TableSettings/TableSource/ExtractMethods';
import { ChunkSizeInput } from '../SchemaTables/TableSettings/components/IncrementalSettings';
import { CustomQueryIncrementalSettings } from './CustomQueryIncrementalSettings';
import { useCustomQueryExtraction } from './useCustomQueryExtraction';

/**
 * Collapsible section wrapper
 */
function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: defaultOpen });

  return (
    <Flex flexDir="column" w="575px" gap={3}>
      <HStack cursor="pointer" onClick={onToggle}>
        <Text textStyle="M7" color="primary">
          {title}
        </Text>
        <Icon as={isOpen ? ChevronUp : ChevronDown} color="primary" ml="auto" />
      </HStack>
      <Divider borderColor="gray.300" />
      <Collapse in={isOpen}>{children}</Collapse>
    </Flex>
  );
}

/**
 * Custom Query Source Settings component.
 * Stores values at river.properties.source.custom_query_source_settings.*
 */
export function CustomQuerySourceSettings() {
  const { formApi, settingsPath } = useCustomQueryExtraction();
  return (
    <Flex flexDir="column" gap={4}>
      <CollapsibleSection title="Extraction Method" defaultOpen>
        <CustomQSourceExtractMethod />
      </CollapsibleSection>
      <CollapsibleSection title="Custom Query Settings">
        <Input
          label="Extraction Array Size"
          name={`${settingsPath}.array_size`}
          api={formApi}
          chakra
        />
        {/* Ask Ron if it should be here */}
        <ChunkSizeInput name={`${settingsPath}.exporter_chunk_size`} />
      </CollapsibleSection>
    </Flex>
  );
}

/**
 * Extraction method section for Custom Query.
 * Includes All/Incremental radio and conditional incremental settings.
 */
function CustomQSourceExtractMethod() {
  const { isIncremental, formApi } = useCustomQueryExtraction();

  return (
    <Flex flexDir="column" gap={4}>
      {/* Recommendation Alert */}
      <Box>
        <RiveryAlert
          icon={HiOutlineLightBulb}
          variant="info"
          title="Our Recommendation: Incremental Method"
          description="When dealing with large datasets, it is highly recommended to perform incremental extractions."
        />
      </Box>

      {/* Extraction Method Radio */}
      <Box w="450px">
        <Radio
          label="Pick the way you would like to extract data from your query."
          aria-label="extraction method"
          name="river.properties.source.custom_query_source_settings.extract_method"
          api={formApi}
          defaultValue="all"
          values={extractionMethods}
        />
      </Box>

      {/* Incremental Settings - shown when incremental method selected */}
      <RenderGuard condition={isIncremental}>
        <CustomQueryIncrementalSettings />
      </RenderGuard>
    </Flex>
  );
}
