import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { get } from 'api/api.proxy';
import { RoutesBuilder } from 'app/routes';
import {
  ArrowNarrowRight,
  ChevronDown,
  CloseIcon,
  HStack,
  Icon,
  IconButton,
  Image,
  RenderGuard,
  RiveryOverlay,
  ScheduleIcon,
  TablePaginationContext,
  Text,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import Dot from 'components/Dot/Dot';
import { RiveryCheckbox } from 'components/Form';
import { RiverTypeQuerySelect } from 'components/Form/components/FrequentComponents';
import { CustomSelectForm } from 'components/Form/components/SelectFormGroup/CustomSelectForm';
import { useGroups } from 'containers/River/components/Groups/useGroups';
import { getQueryParams, useSetQueryParams } from 'hooks/router';
import { normalizeVariableValue } from 'modules/Environments/helpers';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useCore } from 'store/core';
import { useRiverTypes, useRiverTypesLoader } from 'store/riverTypes';
import { getOId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { displayDate } from 'utils/date.utils';
import {
  commonSelectStyle,
  filterUnique,
  useGetFormValues,
  ViewModes,
} from './helpers';

export function ClearIndicator({ onRemove, selectProps: { value } }) {
  return (
    <Icon
      cursor="pointer"
      as={CloseIcon}
      color="font"
      onClick={onRemove}
      aria-label={`remove-${value.value}`}
    />
  );
}

export function TypeFilter({ setFilter, column }) {
  useRiverTypesLoader();
  const { type_src } = getQueryParams(['type_src']);
  const { riverTypes } = useRiverTypes();
  const riverTypeOptions = riverTypes.map(({ type: value, title: label }) => ({
    label,
    value,
  }));

  const setRiverType = useCallback(
    option =>
      option ? setFilter(column.id, option.value) : setFilter(column.id, null),
    [column.id, setFilter],
  );

  const value = useMemo(
    () => riverTypeOptions.find(compare('value', column.filterValue)) ?? [],
    [riverTypeOptions, column.filterValue],
  );

  return (
    <RiverTypeQuerySelect
      onChange={setRiverType}
      isMulti={false}
      filtersOn={Boolean(type_src)}
      value={value}
    />
  );
}

const useRiverGroupFilter = () => {
  const formApi = useFormContext();
  const { control } = formApi;
  const { sourceEnv, targetEnv } = useGetFormValues(control);

  const [groups, setGroups] = useState([]);
  const fetchAll = useCallback(async () => {
    const data = await get(
      `package/entities?entity_type=river_groups&env_src=${sourceEnv}&env_trg=${targetEnv}&page_size=1000&page=1`,
    );
    return setGroups(
      data.data.data.map(({ entity_id, name_src }) => ({
        label: name_src,
        value: entity_id,
      })),
    );
  }, [sourceEnv, targetEnv]);

  useEffect(() => {
    if (sourceEnv && targetEnv && groups.length === 0) {
      fetchAll();
    }
  }, [fetchAll, groups, sourceEnv, targetEnv]);
  return groups.filter(filterUnique);
};

export function GroupFilter({ setFilter }) {
  const { group_id_src } = getQueryParams(['group_id_src']);
  const groups = useRiverGroupFilter();

  const setGroup = useCallback(
    option =>
      option
        ? setFilter('group_id_src', option.value)
        : setFilter('group_id_src', null),
    [setFilter],
  );

  const value = useMemo(
    () => groups.find(({ value }) => value === group_id_src) ?? [],
    [group_id_src, groups],
  );

  //Can't convert this to the generic one because of the entities/groups response (missing icon and color)
  return (
    <CustomSelectForm
      label="Data Flow Group"
      options={groups}
      controlId="group_id_src"
      onChange={setGroup}
      filtersOn={Boolean(group_id_src)}
      isMulti={false}
      value={value}
      isClearable
    />
  );
}

const useConnectionsFilter = (sourceEnv, targetEnv) => {
  const [connections, setConnections] = useState([]);
  const fetchAll = useCallback(async () => {
    const data = await get(
      `package/entities?entity_type=connections&env_src=${sourceEnv}&env_trg=${targetEnv}&page_size=1000&page=1`,
    );
    return setConnections(
      data.data.data.map(({ type_src }) => ({
        label: type_src,
        value: type_src,
      })),
    );
  }, [sourceEnv, targetEnv]);

  useEffect(() => {
    if (sourceEnv && targetEnv && connections.length === 0) {
      fetchAll();
    }
  }, [fetchAll, connections, sourceEnv, targetEnv]);

  return connections.filter(filterUnique);
};

export function ConnectionTypeFilter({ setFilter, column }) {
  const {
    getProps: { sourceEnv, targetEnv },
  } = column;
  const connectionsOptions = useConnectionsFilter(sourceEnv, targetEnv);
  const { type_src } = getQueryParams(['type_src']);

  const setConnectionType = useCallback(
    ({ value }) => setFilter(column.id, value),
    [column.id, setFilter],
  );

  const value = useMemo(
    () => connectionsOptions.find(({ value }) => value === type_src) ?? [],
    [connectionsOptions, type_src],
  );

  return (
    <CustomSelectForm
      label="Connection Type"
      controlId="connection type"
      options={connectionsOptions}
      customStyles={commonSelectStyle}
      onChange={setConnectionType}
      isMulti={false}
      filtersOn={Boolean(type_src)}
      value={value}
      isClearable
      isDisabled={column.getProps.mode === ViewModes.VIEW}
      components={{
        ClearIndicator: props => (
          <ClearIndicator
            onRemove={() => setConnectionType({ value: null })}
            {...props}
          />
        ),
      }}
    />
  );
}

export function ScheduledFilter({ setFilter }) {
  const [scheduled, setScheduled] = useState(null);

  useEffect(
    () => setFilter('is_scheduled_src', scheduled),
    [scheduled, setFilter],
  );

  return (
    <RiveryOverlay description="Filter scheduled">
      <IconButton
        size="sm"
        p={0}
        bgColor="transparent"
        aria-label="scheduled"
        _focus={{ boxShadow: 'none' }}
        icon={<Icon as={ScheduleIcon} boxSize={4} />}
        onClick={() => setScheduled(!scheduled)}
      />
    </RiveryOverlay>
  );
}

export function Name({
  row: {
    original: {
      name_src,
      type_icon_url_src,
      entity_type,
      type_src,
      entity_id,
      env_id_src,
      entity_name,
      deleted_src,
    },
  },
}) {
  const { activeAccountId: account } = useCore();
  const { groups } = useGroups();
  const group = groups.find(
    ({ cross_id }) => getOId(cross_id) === getOId(entity_id),
  );
  const riverUrlParams = {
    account,
    env: getOId(env_id_src),
    river: entity_id,
  };

  const riverPath =
    type_src === 'logic'
      ? RoutesBuilder.river({ ...riverUrlParams })
      : RoutesBuilder.legacyRiver({
          accountId: account,
          envId: getOId(env_id_src),
          river: riverUrlParams.river,
        });

  const connectionPath = RoutesBuilder.connection({
    account,
    env: getOId(env_id_src),
    connectionId: entity_id,
  });

  const blueprintPath = RoutesBuilder.singleBlueprint({
    account,
    env: getOId(env_id_src),
    blueprint: entity_id,
  });

  function getPath(entity) {
    switch (entity) {
      case 'rivers':
        return riverPath;
      case 'connections':
        return connectionPath;
      case 'recipes':
        return blueprintPath;
    }
  }

  const path = getPath(entity_type);

  return (
    <HStack
      w="full"
      h="full"
      alignItems="center"
      color={deleted_src ? 'font-secondary' : 'font-link'}
      {...(['rivers', 'connections', 'recipes'].includes(entity_type) &&
        !deleted_src && {
          onClick: () => window.open(path, '_blank'),
          role: 'button',
        })}
      {...(!deleted_src && {
        textDecoration: 'underline',
        _hover: { color: 'font-link-hover', textDecoration: 'underline' },
      })}
    >
      <RenderGuard condition={type_icon_url_src}>
        <Box w={12}>
          <Image
            src={type_icon_url_src}
            title={name_src}
            alt={name_src}
            height={5}
            m="auto"
            minWidth={12}
            showSpinnerBefore={false}
          />
        </Box>
      </RenderGuard>
      <RenderGuard condition={Boolean(group)}>
        <Dot boxSize={5} color={group?.color} icon={group?.icon} />
      </RenderGuard>
      <RiveryOverlay description={name_src ?? entity_name}>
        <Text overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
          {name_src ?? entity_name} {deleted_src && `- (Deleted)`}
        </Text>
      </RiveryOverlay>
    </HStack>
  );
}

export function MultiCheck({
  setFilter,
  data,
  column: {
    getProps: { type, disabled },
  },
  state: { pageIndex },
}) {
  const formApi = useFormContext();
  const selectAll = useCallback(
    target => {
      const entities = formApi.watch('entities');
      const visibleData = data
        .filter(({ deleted_src }) => !deleted_src)
        .map(({ entity_id, name_src }) =>
          type === 'dataframes' ? name_src : entity_id,
        );
      const newValues = visibleData.reduce(
        (o, entity) => Object.assign(o, { [entity]: target.checked }),
        {},
      );
      const checkbox = formApi?.watch(type);
      formApi.setValue(
        'entities',
        {
          ...entities,
          [type]:
            entities && entities[type]
              ? { ...entities[type], ...newValues }
              : newValues,
        },
        { shouldDirty: true },
      );
      return formApi.setValue(type, {
        ...checkbox,
        [pageIndex]: target.checked,
      });
    },
    [data, formApi, pageIndex, type],
  );

  const showAll = useCallback(() => setFilter('entity_ids', null), [setFilter]);
  const showSelected = useCallback(() => {
    const entities = formApi.watch('entities');
    const selectedEntities = Object.entries(entities[type]).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc.push(key);
        }
        return acc;
      },
      [],
    );
    setFilter('entity_ids', selectedEntities.join(','));
  }, [formApi, setFilter, type]);
  return (
    <>
      <RiveryCheckbox
        py={3}
        aria-label={`entities-${type}-multicheck`}
        isChecked={Boolean(formApi?.watch(`${type}.${pageIndex}`))}
        name={`${type}.${pageIndex}`}
        label={null}
        onChange={({ target }) => selectAll(target)}
        isDisabled={disabled}
        // isIndeterminate={Object.values(formApi?.watch(`entities.${type}`)).some(
        //   Boolean,
        // )}
      />
      <RenderGuard condition={!['templates', 'variables'].includes(type)}>
        <Menu>
          <MenuButton
            variant="ghost"
            as={Button}
            size="sm"
            px="0"
            aria-label="tables selector"
          >
            <Icon as={ChevronDown} boxSize={3} />
          </MenuButton>
          <MenuList mt="2px">
            <MenuItem onClick={showAll}>Show All</MenuItem>
            <MenuItem onClick={showSelected}>Show Selected</MenuItem>
          </MenuList>
        </Menu>
      </RenderGuard>
    </>
  );
}

export function SingleCheck({
  column: {
    getProps: { type, disabled },
  },
  row: {
    original: { entity_id, name_src, entity_name, deleted_src, deleted_trg },
  },
}) {
  const formApi = useFormContext();
  const value = type === 'dataframes' ? name_src ?? entity_name : entity_id;
  return (
    <RiveryCheckbox
      name={`entities.${type}.${value}`}
      label={null}
      aria-label={`data flow list ${name_src}`}
      api={formApi}
      isDisabled={disabled || deleted_src}
    />
  );
}

export function TargetNameCell({ value, row }) {
  const text = value ? value : 'New to Target Environment';
  const color = value ? 'font' : 'font-disabled';
  return (
    <RenderGuard condition={!row?.original?.deleted_src}>
      <Text
        fontSize="sm"
        color={color}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {text}
      </Text>
    </RenderGuard>
  );
}

export function LastModifiedCell({ value, row }) {
  const date = value?.$date ?? value;
  return (
    <RenderGuard condition={!row?.original?.deleted_src}>
      <Text>{displayDate(date, 'dd-MMM-yy, HH:mm')}</Text>
    </RenderGuard>
  );
}

export function ModifiedByCell({ value, row }) {
  return (
    <RenderGuard condition={!row?.original?.deleted_src}>
      <Text>{value}</Text>
    </RenderGuard>
  );
}

export function ResetFilters({
  paramIdMap,
  setExtraSearchParams = null,
  ...props
}) {
  const { reset } = useContext(TablePaginationContext);
  const setQueryParams = useSetQueryParams();
  const clearAll = useCallback(() => {
    Object.values(paramIdMap).forEach((param: string) =>
      setQueryParams({ [param]: null }),
    );
    reset && reset();
    setExtraSearchParams && setExtraSearchParams({});
  }, [paramIdMap, reset, setExtraSearchParams, setQueryParams]);

  return (
    <RiveryButton
      height={9}
      label="Clear"
      size="sm"
      variant="text"
      onClick={clearAll}
      {...props}
    />
  );
}

export function Arrow({ row }: any = {}) {
  return (
    <RenderGuard condition={!row?.original?.deleted_src}>
      <Icon
        as={ArrowNarrowRight}
        w={4}
        h={4}
        color="icon"
        fontWeight="medium"
      />
    </RenderGuard>
  );
}

export function VariableValue({ value, row }: any) {
  return (
    <RenderGuard condition={!row?.original?.deleted_src}>
      {value ? (
        <RiveryOverlay description={value}>
          <Text
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            color={value ? 'font' : 'font-secondary'}
          >
            {value}
          </Text>
        </RiveryOverlay>
      ) : (
        <Text color="font-disabled">New to Target Environment</Text>
      )}
    </RenderGuard>
  );
}

export function SourceVariableValue({ value, row }: any) {
  return (
    <RenderGuard condition={!row?.original?.deleted_src}>
      <Text>{normalizeVariableValue(value)}</Text>
    </RenderGuard>
  );
}
