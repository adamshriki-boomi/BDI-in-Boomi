import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Tooltip,
} from '@chakra-ui/react';
import {
  Flex,
  HStack,
  Icon,
  LightningBolt,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { useFormContext } from 'react-hook-form';
import { InterfaceParametersFields } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/TableSource/BlueprintSourceSettings';
import {
  reportDateRangePath,
  reportParamsPath,
  ResultSnapshot,
} from './helpers';
import { ReportDateRangeField } from './ReportDateRangeField';
import { ReportResultPanel } from './ReportResultPanel';

type Props = {
  name: string;
  params: any;
  fieldsIncomplete: boolean;
  runDisabled: boolean;
  isRunning: boolean;
  onRun: () => void;
  result?: ResultSnapshot;
  showResult: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isCopied: boolean;
  onCopy: () => void;
};

export function ReportCard({
  name,
  params,
  fieldsIncomplete,
  runDisabled,
  isRunning,
  onRun,
  result,
  showResult,
  isExpanded,
  onToggleExpand,
  isCopied,
  onCopy,
}: Props) {
  const formApi = useFormContext();
  const declared: any[] = params?.standard ?? [];
  const dateRangeParam = params?.date_range;
  const hasDateRange = Boolean(dateRangeParam?.name);
  const hasAnyParams = declared.length > 0 || hasDateRange;

  return (
    <AccordionItem border="none">
      <AccordionButton>
        <Flex
          w="full"
          borderBottom="1px"
          borderBottomColor="border"
          justifyContent="space-between"
          pb={1}
        >
          <HStack>
            <Box boxSize={1} borderRadius="50%" bg="primary" />
            <Text textStyle="R6">{name}</Text>
          </HStack>
          <AccordionIcon />
        </Flex>
      </AccordionButton>
      <AccordionPanel>
        <Flex
          flexDir="column"
          gap={2}
          bg="white"
          p={4}
          border="1px solid"
          borderColor="border"
          borderRadius={4}
        >
          <RenderGuard condition={hasAnyParams}>
            <Text color="primary" textStyle="M6">
              Report Parameters
            </Text>
          </RenderGuard>
          <InterfaceParametersFields
            declared={declared}
            basePath={reportParamsPath(name)}
            formApi={formApi}
            width="350px"
          />
          <RenderGuard condition={hasDateRange}>
            <ReportDateRangeField path={reportDateRangePath(name)} />
          </RenderGuard>
          <Tooltip
            label="Fill the global interface parameters and the report parameters to enable Run"
            isDisabled={!fieldsIncomplete}
            shouldWrapChildren
          >
            <RiveryButton
              label="Run Report"
              size="small"
              variant="primary"
              leftIcon={<Icon as={LightningBolt} />}
              isDisabled={runDisabled}
              isLoading={isRunning}
              onClick={onRun}
              alignSelf="flex-start"
            />
          </Tooltip>
          <RenderGuard condition={showResult && Boolean(result)}>
            <ReportResultPanel
              result={result!}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
              isCopied={isCopied}
              onCopy={onCopy}
            />
          </RenderGuard>
        </Flex>
      </AccordionPanel>
    </AccordionItem>
  );
}
