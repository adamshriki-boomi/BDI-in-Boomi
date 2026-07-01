import {
  Box,
  Flex,
  RenderGuard,
  RiveryButton,
  SortRight,
  Text,
} from 'components';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { RiveryCheckbox } from 'components/Form';
import * as React from 'react';
import { TableFilter } from 'components/RiveryTable/TableFilter';
import { useCallback, useMemo } from 'react';

export function RiveryAccordion({
  topLevelIcon = undefined,
  field,
  treeOnly = false,
  editable = true,
}) {
  /**
   * This component renders a two-leveled nested accordion with checkboxes.
   * The first level is the parent, and the second level is the children.
   * @param {Icon} topLevelIcon - The optional icon to display next to the parent name.
   * @param {Field} field - The field object from react-hook-form.
   * the field value should be a dict with the following structure:
   * {
   *  parent1: {
   *  child1: true, child2: false, ...
   *  },
   * }
   * @param {boolean} treeOnly - If true, only display the tree, without other inputs and buttons.
   * @param {boolean} editable - If true, allow the user to edit the checkboxes, otherwise, show labels only
   * @returns {React.ReactElement} - The accordion component.
   */
  const { value, onChange } = field;
  const [searchText, setSearchText] = React.useState('');

  const handleChildChange = useCallback(
    (parentKey: string, childKey: string, checked: boolean) => {
      onChange({
        ...value,
        [parentKey]: { ...value[parentKey], [childKey]: checked },
      });
    },
    [onChange, value],
  );

  const handleParentChange = useCallback(
    (parentKey: string, checked: boolean) => {
      onChange({
        ...value,
        [parentKey]: Object.fromEntries(
          Object.keys(value[parentKey]).map(childKey => [childKey, checked]),
        ),
      });
    },
    [onChange, value],
  );

  const handleClearSelection = () => {
    const clearedValue = Object.keys(value).reduce((acc, parentKey) => {
      acc[parentKey] = Object.keys(value[parentKey]).reduce(
        (childAcc, childKey) => {
          childAcc[childKey] = false;
          return childAcc;
        },
        {},
      );
      return acc;
    }, {});
    onChange(clearedValue);
  };

  const filteredData = React.useMemo(() => {
    if (!searchText) return value;
    const searchLower = searchText.toLowerCase();

    return Object.keys(value).reduce((acc, parentKey) => {
      const children = value[parentKey];
      // If parent matches, include ALL children
      if (parentKey.toLowerCase().includes(searchLower)) {
        acc[parentKey] = children; // Return all children for matching parent
        return acc;
      }

      // If parent doesn't match, only include matching children
      const matchingChildren = Object.fromEntries(
        Object.entries(children).filter(([childKey]) =>
          childKey.toLowerCase().includes(searchLower),
        ),
      );

      if (Object.keys(matchingChildren).length > 0) {
        acc[parentKey] = matchingChildren;
      }
      return acc;
    }, {});
  }, [searchText, value]);

  const totalSelected = useMemo(() => {
    return Object.values(value)
      .flatMap(parent => Object.values(parent))
      .filter(Boolean).length;
  }, [value]);

  return (
    <Box
      width="full"
      height={treeOnly ? '280px' : '400px'}
      border="1px"
      borderColor="gray.200"
      borderRadius="4px"
      borderTop={treeOnly ? 'none' : '1px gray.200'}
      borderTopRadius={treeOnly ? 'none' : '4px'}
      overflow="auto"
    >
      <RenderGuard condition={!treeOnly}>
        <TableFilter
          placeholder="Search..."
          name="search"
          chakra
          value={searchText}
          onFilterChange={setSearchText}
          maxW="full"
          m={4}
        />
      </RenderGuard>
      <Box width="full" height="270px" overflow="scroll" px={4} py={2}>
        {Object.keys(filteredData)?.map((parentKey, idx) => {
          const childItems = filteredData[parentKey];
          const selectedChildCount =
            Object.values(childItems).filter(Boolean).length;
          const isParentChecked =
            selectedChildCount === Object.keys(childItems).length;
          const isIndeterminate =
            selectedChildCount > 0 &&
            selectedChildCount < Object.keys(childItems).length;

          return (
            <Accordion key={idx} allowMultiple>
              <AccordionItem border="none">
                {({ isExpanded }) => (
                  <>
                    <AccordionButton pl={0} pt={0}>
                      <HStack>
                        <Icon
                          as={SortRight}
                          boxSize={3}
                          transform={isExpanded && 'rotate(90deg)'}
                          aria-label={`arrow_schema_${parentKey}`}
                        />
                        <RenderGuard
                          condition={editable}
                          fallback={
                            <Flex gap={2} alignItems="center">
                              <RenderGuard condition={topLevelIcon}>
                                <Icon as={topLevelIcon} boxSize={5} />
                              </RenderGuard>
                              <Text textStyle="R7" color="font">
                                {parentKey}
                              </Text>
                            </Flex>
                          }
                        >
                          <RiveryCheckbox
                            isChecked={isParentChecked}
                            isIndeterminate={isIndeterminate}
                            onChange={e =>
                              handleParentChange(parentKey, e.target.checked)
                            }
                            label={
                              <Flex gap={2}>
                                <RenderGuard condition={topLevelIcon}>
                                  <Icon as={topLevelIcon} boxSize={5} />
                                </RenderGuard>
                                {parentKey}
                              </Flex>
                            }
                            labelColor="font"
                            name={`parent-${parentKey}`}
                          />
                        </RenderGuard>
                      </HStack>
                    </AccordionButton>
                    <AccordionPanel pt={0} pl={10} pb={2}>
                      <Flex flexDir="column" gap={1}>
                        {Object.keys(filteredData[parentKey])?.map(
                          (childKey, idx) => {
                            return (
                              <RenderGuard
                                condition={editable}
                                fallback={
                                  <Text textStyle="R7" key={idx} color="font">
                                    {childKey}
                                  </Text>
                                }
                              >
                                <RiveryCheckbox
                                  key={idx}
                                  isChecked={childItems[childKey]}
                                  onChange={e =>
                                    handleChildChange(
                                      parentKey,
                                      childKey,
                                      e.target.checked,
                                    )
                                  }
                                  label={childKey}
                                  labelColor="font"
                                  name={`${parentKey}-${childKey}`}
                                  aria-label={`select_child_${childKey}`}
                                />
                              </RenderGuard>
                            );
                          },
                        )}
                      </Flex>
                    </AccordionPanel>
                  </>
                )}
              </AccordionItem>
            </Accordion>
          );
        })}
      </Box>
      <RenderGuard condition={!treeOnly}>
        <Flex
          justifyContent="space-between"
          h="60px"
          alignItems="center"
          borderTop="1px"
          borderTopColor="gray.200"
          px={4}
        >
          <Text textStyle="M7">Total Selected: {totalSelected}</Text>
          <RiveryButton
            label="Clear Selection"
            variant="default"
            size="base"
            onClick={handleClearSelection}
          />
        </Flex>
      </RenderGuard>
    </Box>
  );
}
