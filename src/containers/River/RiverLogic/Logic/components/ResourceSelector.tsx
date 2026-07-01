import { Text } from '@chakra-ui/react';
import { IResource } from 'api/types';
import {
  Button,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  RiveryTable,
  useDisclosure,
} from 'components';
import React, { useMemo } from 'react';
import { MdExpandMore } from 'react-icons/md';
import { compare } from 'utils/array.utils';

interface ResourceSelectorProps {
  selected: string;
  onSelect: (row: any) => any;
  resources?: IResource[];
}

export function ResourceSelector({
  // todo remove
  selected,
  onSelect,
  // todo - add empty array?
  resources,
}: ResourceSelectorProps) {
  const { isOpen, onToggle, onClose } = useDisclosure();

  const selectedCode = useMemo(
    () =>
      resources?.find(compare('_id', selected?.toString(), v => v?.toString()))
        ?.alias,
    [resources, selected],
  );
  const label = selectedCode ? ` (${selectedCode})` : '';

  return (
    <Popover isOpen={isOpen} onClose={onClose} isLazy>
      <PopoverTrigger>
        <Button
          size="sm"
          variant="ghost"
          ml="auto"
          fontWeight="normal"
          color="font"
          aria-label="resource-selector"
          rightIcon={<MdExpandMore />}
          onClick={onToggle}
        >
          Resources {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        w="225px"
        _active={{ boxShadow: '0' }}
        _focus={{ boxShadow: '0' }}
      >
        <PopoverBody>
          <ResourceSelectorTable
            resources={resources}
            selected={selected}
            onChange={value => {
              onSelect(value);
              onClose();
            }}
          />
          <Text px={3} py={2} borderTop="1px solid" borderColor="gray.400">
            BDU per second will be calculated according to the resource size
            selected
          </Text>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export function ResourceSelectorTable({ resources, selected, onChange }) {
  return (
    <RiveryTable
      entityType="Resources"
      ariaLabel="resources selector"
      columns={resourceHeaders}
      data={resources}
      inline
      noPagination={true}
      rowHandlers={{
        onRowClick: onChange,
        isRowSelected: ({ _id }) => _id?.toString() === selected?.toString(),
      }}
    />
  );
}

const resourceHeaders: any[] = [
  {
    Header: 'Size',
    accessor: 'alias',
    weight: 'min-content',
    styleProps: { justifyContent: 'center', whiteSpace: 'nowrap' },
    headerProps: { justifyContent: 'center' },
  },
  {
    Header: 'RAM (GB)',
    accessor: 'ram',
    weight: 'min-content',
    styleProps: { justifyContent: 'center' },
    headerProps: { justifyContent: 'center' },
  },
  {
    Header: 'CPU (Cores)',
    accessor: 'cpu',
    weight: 'min-content',
    styleProps: { justifyContent: 'center' },
    headerProps: { justifyContent: 'center' },
  },
];
