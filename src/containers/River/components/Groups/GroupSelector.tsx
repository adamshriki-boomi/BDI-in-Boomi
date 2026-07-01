import { ButtonProps } from '@chakra-ui/react';
import { IGroup } from 'api/types';
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import Dot from 'components/Dot/Dot';
import { InputSearch } from 'components/Form';
import React, { useCallback, useMemo, useState } from 'react';
import { MdExpandMore } from 'react-icons/md';
import { RiPencilFill } from 'react-icons/ri';
import { useToggle } from 'react-use';
import { getCrossId, getOId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';

export type GroupSelectorProps = {
  selected?: string;
  /** a unique id to allow other dropdowns to work together */
  id: string;
  groups: IGroup[];
  onEdit: (group: IGroup) => any;
  onCreate: () => any;
  onSelect: (group: IGroup) => any;
  buttonTriggerProps?: ButtonProps;
};

export function GroupSelector({
  selected,
  groups,
  onEdit,
  onCreate,
  onSelect,
  id,
  buttonTriggerProps = null,
}: GroupSelectorProps) {
  const { list, filterQuery, resetFilter } = useGroupList(groups);
  const { isOpen, onToggle, onClose } = useDisclosure();
  const selectedGroup = groups?.find(group => getCrossId(group) === selected);

  const sortedList = useMemo(
    () =>
      list?.sort(({ name }, { name: name2 }) =>
        name ? name.localeCompare(name2) : -1,
      ),
    [list],
  );

  const onGroupSelected = useCallback(
    (crossId: string) => {
      const group = groups.find(compare('cross_id', crossId, getOId));
      onSelect(group);
      onClose();
    },
    [groups, onSelect, onClose],
  );

  const onGroupsClose = useCallback(() => {
    onClose();
    resetFilter();
  }, [onClose, resetFilter]);

  return (
    <Popover
      aria-label="group selector"
      isLazy
      isOpen={isOpen}
      onClose={onGroupsClose}
      placement="bottom-start"
    >
      <PopoverTrigger>
        {/* using RiveryButton here cause a visual bug and dislocates the popover
        content on the top left */}
        <Button
          size="xs"
          variant="text-link"
          onClick={onToggle}
          aria-label={`group ${selectedGroup?.name}`}
          rightIcon={<MdExpandMore />}
          leftIcon={
            <Dot
              size={Dot.size.XSmall}
              icon={selectedGroup?.icon}
              color={selectedGroup?.color}
            />
          }
          {...buttonTriggerProps}
        >
          <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {selectedGroup?.name}
          </Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-labelledby={`group-selector-${id}`}>
        <PopoverBody>
          <InputSearch
            onSearch={filterQuery}
            autoComplete="off"
            aria-label="filter groups"
            placeholder="filter groups..."
          />
          <Items
            list={sortedList}
            onEdit={onEdit}
            onClick={onGroupSelected}
            selectedCrossId={getCrossId(selectedGroup)}
          />
          <Box py="3">
            <RiveryButton
              pl={4}
              label="+ Create New Group"
              variant="link"
              onClick={onCreate}
            />
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

function Items({ list, onEdit, onClick, selectedCrossId }) {
  return (
    <Flex
      flexDir="column"
      maxHeight="35vh"
      overflowY="auto"
      position="relative"
      top="1px"
    >
      {list?.map(group => (
        <GroupItem
          {...group}
          key={`group-item-${getCrossId(group)}`}
          onEdit={onEdit}
          onClick={onClick}
          active={getCrossId(group) === selectedCrossId}
        />
      ))}
    </Flex>
  );
}

interface GroupItemProps extends IGroup {
  onEdit: (group: IGroup) => any;
  onClick?: (id: string) => any;
  active?: boolean;
}
function GroupItem({ onEdit, onClick, active, ...group }: GroupItemProps) {
  const { name, color, icon } = group;
  const [showEditIcon, toggleEditIcon] = useToggle(false);
  return (
    <>
      <Flex
        // role="button"
        _active={{
          bgColor: 'nebula.50',
        }}
        _hover={{
          bgColor: active ? 'nebula.50' : 'gray.200',
        }}
        onMouseOver={() => toggleEditIcon(true)}
        onMouseOut={() => toggleEditIcon(false)}
        bgColor={active ? 'nebula.50' : 'transparent'}
        cursor="pointer"
        py="2"
        // pl="2"
        alignItems="center"
        gap="2"
      >
        <Button
          size="sm"
          aria-label={name}
          variant="transparent"
          alignItems="center"
          justifyContent="flex-start"
          sx={{
            '&': { display: 'flex' },
          }}
          gap="2"
          mr="auto"
          onClick={() => onClick(getCrossId(group))}
          leftIcon={<Dot color={color} icon={icon} size={Dot.size.Small} />}
        >
          <Text noOfLines={1} display="unset">
            {name}
          </Text>
        </Button>
        <IconButton
          icon={<Icon as={RiPencilFill} boxSize="5" color="icon-tertiary" />}
          visibility={showEditIcon ? 'visible' : 'hidden'}
          variant="ghost"
          pr="2"
          _hover={{ bg: 'transparent' }}
          className="edit-icon"
          aria-label={`edit group ${name}`}
          size="small"
          onClick={e => {
            e.stopPropagation();
            onEdit(group);
          }}
        />
      </Flex>
      <Divider m="0" />
    </>
  );
}

/**
 * tracks and filters a group[]
 */
function useGroupList(groups: IGroup[]) {
  const [filter, setFilter] = useState('');
  const list = useMemo(
    () =>
      !filter
        ? groups
        : groups?.filter(group => group?.name?.toLowerCase().includes(filter)),
    [filter, groups],
  );

  const api = useMemo(
    () => ({
      filterQuery(query: string) {
        const normalizedQuery = query?.trim().toLowerCase();
        setFilter(normalizedQuery);
      },
      resetFilter() {
        setFilter('');
      },
    }),
    [],
  );

  return { list, ...api };
}
