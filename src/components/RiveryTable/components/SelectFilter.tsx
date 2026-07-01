import {
  Button,
  ButtonGroup,
  Flex,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
} from 'components';
import { InputSearch } from 'components/Form';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { MdClose, MdExpandMore } from 'react-icons/md';

function getLabel(selected, getOptionDisplay) {
  const optionDisplay = getOptionDisplay(selected);
  const optionContent =
    typeof optionDisplay === 'string' ? (
      <Text noOfLines={1}>{optionDisplay}</Text>
    ) : (
      optionDisplay
    );
  return optionContent;
}

// props includes Instance Properties https://react-table.tanstack.com/docs/api/useFilters#instance-properties
interface SelectFilterProps {
  type: string;
  accessor: string;
  options: any[];
  setFilter: (propPath: any, value: any) => any;
  controlId?: string;
  selectProps?: any;
  value?: any;
  getOptionValue?: (any) => string;
  getOptionLabel?: (any) => string;
  getOptionDisplay?: (any) => ReactNode;
}

const emptyArray = [];

export function SelectFilter({
  type,
  options = emptyArray,
  accessor,
  setFilter,
  value,
  getOptionValue = option => option?.value,
  getOptionLabel = option => option?.label,
  getOptionDisplay = getOptionLabel,
}: SelectFilterProps) {
  const [optionsFilter, setOptionsFilter] = useState('');
  const { isOpen, onToggle, onClose } = useDisclosure();

  const onSetFilter = useCallback(
    value => {
      setFilter(accessor, value);
      setOptionsFilter('');
      onClose();
    },
    [setFilter, accessor, onClose],
  );

  const filteredOptions = useMemo(() => {
    if (optionsFilter) {
      const re = new RegExp(optionsFilter.replace(/\\+$/, ''), 'i');
      return options?.filter(option => getOptionLabel(option).match(re));
    } else {
      return options;
    }
  }, [options, optionsFilter, getOptionLabel]);

  return (
    <Popover
      aria-label={`${type}-selector`}
      placement="bottom-start"
      isOpen={isOpen}
      onClose={onClose}
    >
      <PopoverTrigger>
        <ButtonGroup isAttached size="sm">
          <Button
            variant={value ? 'brand' : 'ghost'}
            aria-label={`toggle ${type}`}
            onClick={onToggle}
            maxWidth="33vw"
            rightIcon={value ? null : <MdExpandMore />}
          >
            {value ? getLabel(value, getOptionDisplay) : type}
          </Button>
          {value ? (
            <IconButton
              size="sm"
              variant="primary"
              aria-label={`clear ${type}`}
              icon={<MdClose aria-label={`clear ${type}-selector`} />}
              onClick={() => {
                onSetFilter(undefined);
              }}
            />
          ) : null}
        </ButtonGroup>
      </PopoverTrigger>
      <PopoverContent aria-label={`${type}-selector options list`}>
        <PopoverBody>
          {options?.length > 5 ? (
            <InputSearch
              value={optionsFilter}
              onSearch={setOptionsFilter}
              label={`filter ${type}`}
              placeholder={`filter ${type}...`}
              border="0"
              flexGrow="0"
              flexShrink="0"
            />
          ) : null}
          <Flex
            flexDir="column"
            maxHeight="50vh"
            overflowY="auto"
            position="relative"
            top="1px"
            gap="1"
          >
            {filteredOptions.map(option => (
              <Button
                key={`select-filter-${getOptionLabel(option)}${getOptionValue(
                  option,
                )}`}
                size="sm"
                py="2"
                flex="1"
                w="full"
                borderRadius="0"
                aria-label={getOptionLabel(option)}
                variant="primary"
                alignItems="center"
                justifyContent="flex-start"
                sx={{
                  '&': { display: 'flex' },
                }}
                bgColor={value === option ? 'nebula.50' : 'transparent'}
                gap="2"
                mr="auto"
                onClick={() => onSetFilter(getOptionValue(option))}
              >
                {getOptionDisplay(option)}
              </Button>
            ))}
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
