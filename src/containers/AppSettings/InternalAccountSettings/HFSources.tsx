import { TagLabel } from '@chakra-ui/react';
import {
  Box,
  DeleteIcon,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  RiveryTable,
  Tag,
  Text,
} from 'components';
import { ComplexSelectField } from 'components/Form';
import { useDSHighFrequency } from 'modules';
import React, { useCallback, useMemo, useState } from 'react';

export function HFSources({ formApi, plan }) {
  const [source, selectSource] = useState(null);
  const isNewPricingPlan = plan === 'trial' || plan?.includes('2025');
  const datasourceTypesSettings = useMemo(
    () => formApi?.watch('datasource_types_settings') || {},
    [formApi],
  );
  const itemsDSAllOptions = useDSHighFrequency().map(({ icon, ...rest }) => {
    return {
      ...rest,
      icon: <Image size={Image.Size.S} pl={2} src={icon} />,
    };
  });

  const itemsDSOptions = itemsDSAllOptions
    ?.filter(ds => ds.status === 'enabled')
    ?.filter(item => {
      return typeof datasourceTypesSettings[item?.value] === 'undefined';
    });

  const tableData = itemsDSAllOptions.filter(
    ({ value }) => value in datasourceTypesSettings,
  );
  const onDelete = useCallback(
    value => {
      const { [value]: ds, ...rest } = datasourceTypesSettings;
      formApi.reset({
        datasource_types_settings: {
          ...rest,
        },
      });
    },
    [datasourceTypesSettings, formApi],
  );

  const addHFsource = useCallback(() => {
    formApi.reset({
      datasource_types_settings: {
        ...datasourceTypesSettings,
        ...{
          [source.value]: source.default_high_frequency_min_rpu
            ? { min_rpu: source.default_high_frequency_min_rpu }
            : { is_high_frequency: true },
        },
      },
    });
  }, [datasourceTypesSettings, formApi, source]);

  return (
    <Flex flexDir="column" pr={4} pt={4} gap={4} w="700px">
      <Flex alignItems="end" justify="space-between" w="full">
        <Flex flexDir="column">
          <Text textStyle="M6" color="primary">
            High Frequency API Additional Fees
          </Text>
          <Text textStyle="R7" color="font-secondary">
            Select an API to set as high frequency.
          </Text>
        </Flex>
        <Box w="350px">
          <ComplexSelectField
            size="md"
            buttonProps={{ label: 'Add', onClick: addHFsource }}
            selectProps={{
              isMulti: false,
              controlId: 'hf-sources',
              options: itemsDSOptions,
              onChange: selectSource,
              components: { Option: HFOption },
            }}
          />
        </Box>
      </Flex>
      <RiveryTable
        compact
        inline
        noPagination
        columns={HFColumns(formApi, onDelete, isNewPricingPlan)}
        data={tableData}
      />
    </Flex>
  );
}

const commonStyle = {
  headerProps: { pl: 6 },
  styleProps: { justifyContent: 'start' },
};

const HFColumns = (useFormApi, onDelete, isNewPricingPlan) => [
  {
    Header: 'Source',
    accessor: 'icon',
    ...commonStyle,
  },
  {
    Header: '',
    accessor: 'label',
  },
  {
    Header: 'BDU',
    accessor: 'rpu',
    weight: 'max-content',
    ...commonStyle,
    Cell: ({ row }) => {
      const source = useFormApi.getValues(
        `datasource_types_settings.${row.original?.value}`,
      );
      const minBDU = source?.min_rpu;
      return minBDU || isNewPricingPlan ? (
        // accounts with plan from the Pricing - always has min bdu
        <Tag variant="blue" size="sm">
          <TagLabel textTransform="capitalize">
            Minimum BDU: ({minBDU || 0.01})
          </TagLabel>
        </Tag>
      ) : (
        <Tag variant="orange" size="sm">
          <TagLabel textTransform="capitalize">No Minimum BDU: (0)</TagLabel>
        </Tag>
      );
    },
  },
  {
    Header: '',
    id: 'delete',
    Cell: ({ row }) => (
      <IconButton
        aria-label="delete"
        bg="transparent"
        icon={<Icon as={DeleteIcon} boxSize={5} />}
        onClick={() => onDelete(row.original.value)}
      />
    ),
    styleProps: { justify: 'flex-end' },
  },
];

function HFOption({ label, data }) {
  return (
    <HStack gap={1}>
      <Image src={data?.icon?.props?.src} size={Image.Size.XS} />
      <Text textStyle="M7">{label}</Text>
    </HStack>
  );
}
