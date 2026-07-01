import {
  Flex,
  FlexProps,
  HStack,
  Icon,
  Text,
  useStyleConfig,
} from '@chakra-ui/react';
import { FilterInput } from 'components/Form';
import { InfoTooltip } from 'components/Icons';
import { RenderGuard } from 'components/RenderGuard';
import { RiveryOverlay } from 'components/RiveryOverlay/RiveryOverlay';
import { MdSearch } from 'react-icons/md';
import { useAccount } from 'store/core';
interface Props extends Omit<FlexProps, 'border'> {
  onFilterChange?: (filter: string) => any;
  value?: string;
  api?: any;
  name?: string;
  chakra?: boolean;
  isDisabled?: boolean;
  label?: string;
  size?: string;
  placeholder?: string;
}

export function TableFilter({
  onFilterChange,
  value,
  api = null,
  name = 'search',
  chakra = false,
  isDisabled = false,
  size = 'md',
  label = null,
  ...rest
}: Props) {
  const { isSettingOn } = useAccount();
  const showRiversTooltip =
    name === 'search-Data Flows' && isSettingOn('use_new_river_list');
  return (
    <Flex
      _hover={{ borderColor: '#6B7280' }}
      minWidth={250}
      maxWidth={300}
      flexDir="column"
      {...rest}
    >
      <RenderGuard condition={showRiversTooltip}>
        <RiverSearchTooltip />
      </RenderGuard>
      <FilterInput
        name={name}
        aria-label={name}
        label={label}
        onChange={onFilterChange}
        value={value}
        icon={null}
        iconRight={<MdSearch size={16} />}
        flexGrow={1}
        hideLabel={!label || showRiversTooltip}
        placeholder={rest.placeholder ?? 'Search'}
        type="search"
        api={api}
        chakra={chakra}
        isDisabled={isDisabled}
        size={size}
      />
    </Flex>
  );
}

function RiverSearchTooltip() {
  const labelStyles = useStyleConfig('FormLabel', {});
  return (
    <RiveryOverlay
      description="Search effortlessly using Data Flow Name, Data Flow ID, Source, Target, Target Table Name, or Connection Name."
      placement="right"
    >
      <HStack alignSelf="start" color={labelStyles.color as any}>
        <Text fontSize="xs" color="inherit">
          Search
        </Text>
        <Icon
          as={InfoTooltip}
          boxSize="14px"
          color="inherit"
          marginInlineStart="0.2rem !important"
        />
      </HStack>
    </RiveryOverlay>
  );
}
