import { Box } from '@chakra-ui/react';
import { StepTypes, TargetTypes } from 'api/types';
import {
  TargetAthena,
  TargetAzureDataLake,
  TargetAzureSql,
  TargetAzureSynapse,
  TargetBigQuery,
  TargetDatabricks,
  TargetFirebolt,
  TargetPostgres,
  TargetRedshift,
  TargetSnowflake,
  TargetOneLake,
} from 'containers/River/Targets';
import useMetadataInit from 'containers/River/Targets/useMetadataInit';
import React from 'react';
export const SelectedTarget = {
  [TargetTypes.SNOWFLAKE]: TargetSnowflake,
  [TargetTypes.ONELAKE]: TargetOneLake,
  [TargetTypes.BIG_QUERY]: TargetBigQuery,
  [StepTypes.BIG_QUERY_SQL]: TargetBigQuery,
  [StepTypes.ATHENA]: TargetAthena,
  [TargetTypes.AZURE_DATALAKE]: TargetAzureDataLake,
  [TargetTypes.AZURE_SQL_DWH]: TargetAzureSynapse,
  [TargetTypes.POSTGRES]: TargetPostgres,
  [TargetTypes.AZURE_SQL]: TargetAzureSql,
  [TargetTypes.REDSHIFT]: TargetRedshift,
  [TargetTypes.DATABRICKS]: TargetDatabricks,
  [TargetTypes.FIREBOLT]: TargetFirebolt,
};
export enum ComponentsTypes {
  ADVANCED_OPTIONS_LOGIC = 'LogicAdvancedOptions',
  LOGIC_TABLE = 'LogicTable',
  LOGIC_TABLE_PREFETCH = 'LogicTablePrefetch',
  LOGIC_DATAFRAME = 'LogicDataframe',
  DATAFRAME = 'DataFrame',
  LOGIC_FILE_EXPORT = 'LogicFilesExport',
  TO_META_QUERY_CONFIG = 'toMetaQueryConfig',
  DEFAULT_FIELDS = 'defaultFields',
}

const defaultWrapper = ({ children }) => children;

export const LogicTablePrefetch = ({ step, toMetaQueryConfig }) => {
  useMetadataInit(toMetaQueryConfig(step));
  return null;
};

export function SelectedTargetPrefetch({ targetType, step }) {
  const toMetaQueryConfig =
    SelectedTarget[targetType]?.[ComponentsTypes.TO_META_QUERY_CONFIG];
  const Component = toMetaQueryConfig
    ? LogicTablePrefetch({
        step,
        toMetaQueryConfig,
      })
    : null;
  return Component ? <Component step={step} /> : null;
}

export function SelectedTargetResolver({
  component,
  useFormApi,
  targetType,
  wrapper = defaultWrapper,
  ...rest
}) {
  const Component = SelectedTarget[targetType]?.[component] || null;

  if (!Component) {
    return null;
  }

  return (
    <Box pt={3}>
      {/**
       * FIXME
       * Srrangely: <Wrapper><Compnent.... /></Wrapper> triggers re-rendering, examine why
       */}
      {/* <Wrapper>
        <Component useFormApi={useFormApi} {...rest} />
      </Wrapper> */}
      {wrapper({ children: <Component useFormApi={useFormApi} {...rest} /> })}
    </Box>
  );
}
