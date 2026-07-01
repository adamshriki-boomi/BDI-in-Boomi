import {
  Box,
  Flex,
  GridItem,
  GridProps,
  Heading,
  Icon,
  Text,
} from '@chakra-ui/react';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GridBox,
  KeyIcon,
  RenderGuard,
  TransparentIconButton,
} from 'components';
import { RiveryCheckbox } from 'components/Form';
import * as React from 'react';
import { useCallback } from 'react';
import { MdDragIndicator } from 'react-icons/md';
import { ExpressionColumnTag } from '../ExpressionColumnTag';

const style = {
  borderColor: 'gray.200',
};

interface ItemListProps {
  items: any[];
  draggable?: boolean;
  onSelect: (name: string) => any;
  onUnselect: (name: string) => any;
  onSortChange?: (source: string[]) => any;
  checked: string[];
  header: string;
  indexHeader?: string;
  showIndex?: boolean;
  showKey?: boolean;
  indexColumnWidth?: string;
}

/**
 * Draggable List with selectable items state (drag can be disabled)
 */
export function ItemList({
  items,
  onSelect,
  onUnselect,
  checked,
  draggable = false,
  header,
  onSortChange,
  indexHeader = '',
  showIndex = false,
  showKey = false,
  ...rest
}: ItemListProps) {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const normalizedItems = items?.map(item => item?.name ?? item);

  return (
    <GridBox
      borderRadius="md"
      border="1px"
      {...style}
      gridTemplateRows="auto 1fr"
      overflow="hidden"
    >
      <GridBox
        bgColor="background-secondary"
        borderBottom="1px"
        gridAutoFlow="column"
        alignItems="center"
        gridTemplateColumns={`${
          showIndex && indexHeader ? rest?.indexColumnWidth : null
        } 1fr`}
        {...style}
        borderTopRadius="md"
      >
        <RenderGuard condition={indexHeader}>
          <Heading
            fontSize="sm"
            px="2"
            borderRight="1px"
            borderColor="gray.200"
            py="3"
          >
            {indexHeader}
          </Heading>
        </RenderGuard>
        <Text
          textStyle="M7"
          color="font"
          px="45px"
          py="3"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          overflow="hidden"
        >
          {header}
        </Text>
      </GridBox>
      <DndContext
        onDragEnd={({ active, over }) => {
          if (active.id === over?.id || !over) {
            return;
          }
          const oldIndex = normalizedItems.findIndex(
            value => active.id === value,
          );
          const newIndex = normalizedItems.findIndex(
            value => over.id === value,
          );
          const newItems = arrayMove(normalizedItems, oldIndex, newIndex);
          onSortChange(newItems);
        }}
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
      >
        <SortableList id={header} items={normalizedItems}>
          {items?.map((item, index) => (
            <SortableItem id={item?.name} key={item?.name} enabled={draggable}>
              <Item
                item={item}
                index={index + 1}
                showIndex={showIndex}
                showKey={showKey}
                onSelect={onSelect}
                onUnselect={onUnselect}
                checked={checked}
                draggable={draggable}
                indexColumnWidth={rest?.indexColumnWidth}
              />
            </SortableItem>
          ))}
        </SortableList>
      </DndContext>
    </GridBox>
  );
}

function Item({
  index,
  showIndex,
  showKey,
  onSelect,
  onUnselect,
  item,
  checked,
  indexColumnWidth,
  ...rest
}) {
  const itemName = item?.name;
  const templateColumns = showIndex
    ? `${indexColumnWidth} auto 1fr auto`
    : `auto 1fr auto`;
  return (
    <GridBox
      gridTemplateColumns={templateColumns}
      gridGap="3"
      bgColor="white"
      alignItems="center"
      {...rest}
    >
      {showIndex ? (
        <GridItem
          px="2"
          py="3"
          color="font-secondary"
          textAlign="center"
          borderRight="1px"
          borderColor="gray.200"
        >
          {index}
        </GridItem>
      ) : null}
      <GridBox
        as="label"
        alignItems="center"
        gridAutoFlow="column"
        py="3"
        gap="3"
        {...(!showIndex && { pl: 4 })}
      >
        <CheckBox
          columnsState={checked}
          onSelect={onSelect}
          onUnselect={onUnselect}
          value={itemName}
        />
        {showKey ? (
          <Flex ml={4} alignItems="center">
            <Icon mr="3" as={KeyIcon} color="yellow.300" boxSize={4} />
            {itemName}
          </Flex>
        ) : (
          itemName
        )}
      </GridBox>
      <GridBox justifyItems="end" justifyContent="end" gridAutoFlow="column">
        <RenderGuard condition={item?.calculated_column_mode}>
          <ExpressionColumnTag label="Calculated" />
        </RenderGuard>
      </GridBox>
    </GridBox>
  );
}

function CheckBox({ columnsState, onSelect, onUnselect, value }) {
  const isChecked = (columnsState as string[]).includes(value);
  const onChange = useCallback(() => {
    const nextValue = !Boolean(isChecked);
    if (nextValue) {
      onSelect(value);
    } else {
      onUnselect(value);
    }
  }, [isChecked, onSelect, onUnselect, value]);

  return (
    <RiveryCheckbox
      aria-label={`select ${value}`}
      name={`column-is_selected`}
      label={null}
      isChecked={isChecked}
      onChange={onChange}
    />
  );
}

function SortableList({ id, items, children }) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
      <Box
        bgColor="white"
        ref={setNodeRef}
        position="relative"
        overflowY="auto"
        h="full"
      >
        {children}
      </Box>
    </SortableContext>
  );
}

function SortableItem({ id, enabled, children }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id, disabled: !enabled });

  return (
    <GridBox
      ref={setNodeRef}
      // transition={isDragging ? `all 200ms` : null}
      transform={CSS.Transform.toString({
        x: transform?.x + (isDragging ? -15 : 0),
        y: transform?.y,
        scaleX: isDragging ? 1.05 : 1,
        scaleY: isDragging ? 1.05 : 1,
      } as any)}
      gridTemplateColumns="1fr auto"
      alignItems="center"
      borderBlockEnd="1px"
      bgColor="white"
      {...(isDragging ? SortableItemStyle.isDragging : null)}
      pr={!enabled ? '2' : null}
      {...style}
    >
      {children}
      <RenderGuard condition={enabled}>
        <TransparentIconButton
          size="sm"
          p="0"
          aria-label={`drag to reorder ${id}`}
          icon={<MdDragIndicator />}
          cursor={isDragging ? 'grabbing' : 'grab'}
          {...listeners}
          {...attributes}
        />
      </RenderGuard>
    </GridBox>
  );
}

const SortableItemStyle: Record<string, GridProps> = {
  isDragging: {
    shadow: 'lg',
    zIndex: 'tooltip',
    position: 'relative',
    border: '1px',
    borderColor: 'gray.200',
    borderRadius: 'md',
  },
};
