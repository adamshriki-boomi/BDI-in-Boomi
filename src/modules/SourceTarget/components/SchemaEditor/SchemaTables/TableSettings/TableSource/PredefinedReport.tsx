import { Box, Flex, PageOverlaySpinner, Text } from 'components';
import { FormControls } from 'components/Form';
import { useRiverId } from 'containers/Activities/helpers';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';
import { useGetRiverQuery } from 'modules/SourceTarget/store';
import { useGetPredefinedMetadataQuery } from 'modules/SourceTarget/store/predefined.query';
import * as React from 'react';
import { compare } from 'utils/array.utils';
import { useTableSettingsFormContext } from '../form.hooks';

function buildMetadata(currentTable, reportMetadata) {
  return reportMetadata?.reduce((acc, field) => {
    acc.push({
      ...field,
      default: currentTable[field?.name] ?? field?.default,
    });
    return acc;
  }, []);
}

function useNormalizeMetadtaControls(reportMetadata, report_id) {
  const isNewRiver = useIsInNewS2TRiver();
  const riverId = useRiverId();
  const { data } = useGetRiverQuery(riverId, {
    skip: isNewRiver,
  });
  const tables = data?.properties?.schemas?.no_schema;
  const tableSourceSettings =
    tables && Object.values(tables)?.find(compare('report_id', report_id));
  const sourceSettingsMetadata = reportMetadata
    ? isNewRiver
      ? Object.values(reportMetadata?.properties)
      : buildMetadata(
          tableSourceSettings,
          Object.values(reportMetadata?.properties),
        )
    : [{}];
  return (
    reportMetadata &&
    (
      sourceSettingsMetadata?.reduce((acc: any[], field: any) => {
        if (field.name === 'extract_method') {
          acc.push({
            display_name: 'Extraction Method',
            type: 'title',
            index: field.index,
          });
        }
        if (Number.isInteger(field?.index)) {
          acc.push({
            ...field,
            defaultValue: field?.default,
            name: `table.${field.name}`,
          });
        } else if (!isNaN(parseFloat(field?.index))) {
          const collapseFieldDefinition = {
            type: 'collapse',
            display_name: 'Advanced Settings',
            index: Math.floor(field?.index),
          };
          const collapseField = acc.find(item => item?.type === 'collapse');
          if (collapseField) {
            collapseField.controls.push(field);
          } else {
            acc.push({
              ...collapseFieldDefinition,
              controls: [{ ...field, name: `table.${field.name}` }],
            });
          }
        }
        return acc;
      }, []) as unknown as any[]
    )?.sort((a: any, b: any) => (a?.index < b?.index ? -1 : 0))
  );
}

export function GenericUIPredefined({ sourceDefinition }) {
  const formMethods = useTableSettingsFormContext();
  const report_id = formMethods?.watch('definitions.report_id');
  const datasource_id = sourceDefinition?.name;
  const { data: reportMetadata } = useGetPredefinedMetadataQuery({
    datasource_id,
    report_id,
  });
  const controls = useNormalizeMetadtaControls(reportMetadata, report_id);
  const { handleSubmit, ...useFormApi } = formMethods;
  return controls ? (
    <Box w="450px">
      <Flex flexDir="column" gap={2}>
        <Text color="font-secondary">
          Set up the setting to your Source Data.
        </Text>
        {controls?.map((control, index) => (
          <FormControls
            key={`${index}-${control?.name}`}
            controls={control as any}
            api={useFormApi as any}
          />
        ))}
      </Flex>
    </Box>
  ) : (
    <PageOverlaySpinner />
  );
}
