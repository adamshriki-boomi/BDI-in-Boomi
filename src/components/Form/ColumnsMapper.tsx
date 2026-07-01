import { nanoid } from '@reduxjs/toolkit';
import { API } from 'api';
import { ILogicStep, TargetTypes } from 'api/types';
import {
  Box,
  Center,
  Flex,
  Icon,
  RenderGuard,
  RiveryModal,
  RiveryTable,
  Text,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import RiveryButton from 'components/Buttons/RiveryButton';
import { ViewLogs } from 'components/ViewLogs/ViewLogs';
import { SelectedTarget } from 'containers/River/Targets/SelectedTarget';
import React, { useEffect, useMemo, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { useExpanded } from 'react-table';
import { useAsyncFn, useToggle } from 'react-use';
import { useRiver } from 'store/river/hooks';
import { SQLAlert } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/Mapping/Targets/BigQuery/SQLTableAlert';
import { getId } from 'utils/api.sanitizer';

const emptyArr = [];
const POLL_INTERVAL = 2000;

export function ModalColumnsMapper({
  data,
  sortMapping: sortMappingBase = emptyArr,
  onChange,
  type,
  step = undefined,
}: ColumnsMapperProps) {
  const [show, toggle] = useToggle(false);
  const { selectedVariables } = useRiver();
  const [state, setState] = useState({
    mapping: data,
    sortMapping: sortMappingBase,
  });
  const { mapping, sortMapping } = state;
  useEffect(() => {
    if (!show) {
      setState({
        mapping: data,
        sortMapping: sortMappingBase,
      });
    }
  }, [show, data, sortMappingBase]);

  const [{ value: autoMapping, loading }, fetchAutoMapping] = useAsyncFn(
    async () => updateAutoMapping(step, selectedVariables, setState),
    [step, selectedVariables],
  );

  const autoMapBtn = (
    <RiveryButton
      variant="text-link"
      label="Auto Mapping"
      aria-label="Columns Mapping"
      ml="auto"
      color="primary"
      onClick={fetchAutoMapping}
      isLoading={loading}
      leftIcon={<Icon as={AiOutlineReload} w={4} h={4} />}
    />
  );

  return (
    <>
      <Center>
        <RiveryButton
          variant="outlined-primary"
          label="Columns Mapping"
          mt={3}
          width="full"
          onClick={() => toggle()}
        />
      </Center>
      <RiveryModal
        show={show}
        onClose={toggle}
        onSuccess={() => {
          onChange(state);
          toggle();
        }}
        footer={{}}
        centered
        ariaLabel="columns mapping modal"
        style={{
          content: {
            maxHeight: '90vh',
            minWidth: '90vw',
          },
        }}
        headerLess={true}
        body={
          <Flex flexDir="column" gap={1} overflow="hidden">
            <RenderGuard condition={type === 'bq'}>
              <Box mb={10}>
                <SQLAlert top="0" />
              </Box>
            </RenderGuard>
            <Box mb={10}>
              <Text textStyle="M6">Columns Mapping</Text>
            </Box>
            {loading || autoMapping?.request_status !== 'E' ? null : (
              <RiveryAlert
                variant="error-light"
                description={
                  <>
                    {autoMapping?.error_msg}
                    <ViewLogs pullRequestId={getId(autoMapping)} />
                  </>
                }
              />
            )}
            <ColumnsMapper
              data={mapping}
              onChange={setState}
              sortMapping={sortMapping}
              type={type}
              step={step}
              extraControls={autoMapBtn}
              compact
            />
          </Flex>
        }
      />
    </>
  );
}

type ColumnsMapperProps = {
  data: any;
  sortMapping: string[];
  onChange: (v: any) => any;
  type: TargetTypes;
  step: ILogicStep;
  extraControls?: any;
  compact?: boolean;
};

export function ColumnsMapper({
  data: baseData = emptyArr,
  sortMapping = emptyArr,
  onChange,
  type,
  step = undefined,
  extraControls,
  compact = false,
}: ColumnsMapperProps) {
  //add ids to existing rivers
  const data = useMemo(() => {
    return baseData?.map(item => (item.id ? item : { ...item, id: nanoid() }));
  }, [baseData]);
  const config = SelectedTarget[type].mappingCols;
  const handlers = useMemo(
    () => ({
      setFields: (id, values) =>
        onChange({
          mapping: updateFields(data, id.split('.').map(Number), values),
          sortMapping,
        }),
      addRow: id =>
        onChange({
          mapping: updateRow(data, id.split('.').map(Number), createRow(type)),
          sortMapping,
        }),
      removeRow: id => {
        const primaryId = id.split('.').map(Number);
        const newSortMapping = sortMapping.filter(item => {
          return item !== data[primaryId[0]].id;
        });
        onChange({
          mapping: updateRow(data, primaryId),
          sortMapping: newSortMapping,
        });
      },
      clearRows: () => onChange({ mapping: emptyArr, sortMapping: [] }),
      getSortIndex: fieldName => (sortMapping?.indexOf(fieldName) ?? -1) + 1,
      setSort: (fieldName, isSort, limit = undefined) => {
        if (!sortMapping) {
          return;
        }
        if (isSort && limit) {
          if (sortMapping.length >= limit) {
            return;
          }
        }
        const newSortMapping = isSort
          ? sortMapping.concat(fieldName)
          : sortMapping.filter(item => item !== fieldName);
        onChange({
          mapping: setOrderFields(isSort, fieldName, data, newSortMapping),
          sortMapping: newSortMapping,
        });
      },
      getField: (id, field) => data[id.split('.')[0]]?.[field],
      setIsUnique: (id, isUnique, uniqueKey = 'dist') => {
        onChange({
          mapping: setUniqueField(isUnique, id, data, uniqueKey),
          sortMapping: sortMapping,
        });
      },
      setBoolean: (id: any, isChecked: any, key: any, limit: number) => {
        if (
          !isChecked ||
          data.filter(item => Boolean(item?.[key])).length < limit
        ) {
          onChange({
            mapping: data.map((value, index) => {
              return Boolean(id === index.toString())
                ? {
                    ...value,
                    [key]: isChecked,
                  }
                : value;
            }),
            sortMapping: sortMapping,
          });
        }
      },
    }),
    [data, type, onChange, sortMapping],
  );
  const getColumns = ({ mappingCols, step: Content = undefined }) => {
    return mappingCols.columns.filter((col: any) => {
      return col.Condition ? col.Condition(step) : true;
    });
  };
  const columns = getColumns({ mappingCols: config, step });

  if (!config) {
    return (
      <Text
        as="h1"
        display="flex"
        flexDir="column"
        justifyContent="center"
        h="full"
      >
        mapping configuration for type {type} does not exist
      </Text>
    );
  }

  if (!columns) {
    return (
      <h1>mapping columns configuration for type {type} does not exist</h1>
    );
  }

  return (
    <ColumnsMapperContext.Provider value={handlers}>
      <RiveryTable
        columns={columns}
        data={data}
        getSubRows={getSubRows}
        useExpanded={useExpanded}
        entityType="Columns"
        extraControls={extraControls}
        fixedPageSize={compact}
        ariaLabel="columns mapper"
        filterLabel="Search Columns"
      />
      <RiveryButton
        variant="outlined-primary"
        label="+ Add Field"
        aria-label="add field"
        mx="auto"
        width="50%"
        onClick={() =>
          onChange({
            mapping: (data || emptyArr).concat(createRow(type)),
            sortMapping,
          })
        }
      />
    </ColumnsMapperContext.Provider>
  );
}

export const ColumnsMapperContext = React.createContext<{
  setFields: (id, values) => any;
  addRow: (id) => any;
  removeRow: (id) => any;
  clearRows: (id) => any;
  getSortIndex: (id) => any;
  setSort: (id, value, limit) => any;
  getField: (id, name) => any;
  setIsUnique: (id, value, uniqueKey) => any;
  setBoolean: (id, value, key, limit) => any;
}>({
  setFields: null,
  addRow: null,
  removeRow: null,
  clearRows: null,
  getSortIndex: null,
  setSort: null,
  setIsUnique: null,
  setBoolean: null,
  getField: null,
});
function createRow(type) {
  const selectedTarget = SelectedTarget?.[type];
  const defaultType = selectedTarget?.defaultType;
  return {
    id: nanoid(),
    fieldName: 'newField',
    type: defaultType,
    fields: emptyArr,
    length: selectedTarget?.defaultLengthByType
      ? selectedTarget.defaultLengthByType[defaultType]
      : undefined,
  };
}
function setOrderFields(isSort, id, values, newSortOrder) {
  let val = values.map((value, index) => {
    if (newSortOrder.indexOf(value.id) >= 0) {
      return {
        ...value,
        sort: true,
        sort_order: newSortOrder.indexOf(value.id) + 1,
      };
    } else {
      if ('sort' in value || 'sort_order' in value) {
        const { sort, sort_order, ...result } = value;
        return result;
      } else {
        return value;
      }
    }
  });
  return val;
}
function setUniqueField(isUnique, id, values, uniqueKey) {
  return values.map((value, index) => {
    return {
      ...value,
      [uniqueKey]: Boolean(id === index.toString()) && isUnique,
    };
  });
}
function updateFields(values, keys, newValues) {
  const [targetIndex, ...subKeys] = keys;
  if (keys.length === 1) {
    return values.map((value, index) =>
      targetIndex === index
        ? {
            ...value,
            ...newValues,
          }
        : value,
    );
  } else if (keys.length) {
    return values.map((value, index) =>
      targetIndex === index
        ? {
            ...value,
            fields: updateFields(value.fields, subKeys, newValues),
          }
        : value,
    );
  } else {
    return values;
  }
}

function updateRow(values, keys, value = undefined) {
  if (!keys.length) {
    return values;
  }
  const [targetIndex, ...subKeys] = keys;
  if (subKeys.length === 0) {
    const result = [...values];
    if (value) {
      result.splice(targetIndex, 0, value);
    } else {
      result.splice(targetIndex, 1);
    }
    return result;
  } else {
    return values.map((subValue, index) =>
      targetIndex === index
        ? {
            ...subValue,
            fields: updateRow(subValue.fields ?? emptyArr, subKeys, value),
          }
        : subValue,
    );
  }
}

const getSubRows = ({ fields }) => fields;

async function updateAutoMapping(step, variables, onChange) {
  const pollingHandle = await API.steps.getStepMapping({
    logic_step: step,
    variables,
  });
  let pollingStatus = await API.steps.pollStepMapping({
    _id: pollingHandle._id,
    mapping: pollingHandle.mapping,
  });
  while (['R', 'W'].includes(pollingStatus.request_status)) {
    const { _id, mapping } = pollingStatus;
    pollingStatus = await new Promise(resolve =>
      setTimeout(
        resolve,
        POLL_INTERVAL,
        API.steps.pollStepMapping({
          _id,
          mapping,
        }),
      ),
    );
  }

  if (
    pollingStatus.request_status === 'D' &&
    pollingStatus.mapping?.target?.length
  ) {
    onChange(state => {
      const { mapping } = state;
      const keys = new Set(
        mapping.map(({ fieldName }) => fieldName?.toUpperCase()),
      );
      const newMappings = pollingStatus.mapping.target
        .filter(({ fieldName }) => !keys.has(fieldName?.toUpperCase()))
        .map(row => ({ ...row, id: row.fieldName }));
      return newMappings.length
        ? { ...state, mapping: mapping.concat(newMappings) }
        : state;
    });
  }
  return pollingStatus;
}
