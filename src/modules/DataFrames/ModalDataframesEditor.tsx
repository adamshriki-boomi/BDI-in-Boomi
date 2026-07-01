import {
  Box,
  CloseIconButton,
  Flex,
  HStack,
  Icon,
  RdsDataframe,
  Text,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { FeatureEnabler } from 'modules/FeatureEnabler';
import { useDismissDrawer } from 'modules/RiverRightBar';
import React, { useCallback, useState } from 'react';
import { DataFrameFormDialog } from './DataframeForm';
import { DataframesEditor } from './DataframesEditor';
import { useCreateDataframeMutation, useGetDataframesQuery } from './store';

export function DrawerDataframesEditorContent() {
  const onDeleteAllSearchParams = useDismissDrawer();
  const { isFetching } = useGetDataframesQuery();
  const [isAdding, setIsAdding] = useState(false);
  const [onAdd] = useCreateDataframeMutation();
  const onCancel = useCallback(() => setIsAdding(false), []);
  const onCloseDrawer = useCallback(
    () => onDeleteAllSearchParams(),
    [onDeleteAllSearchParams],
  );

  return (
    <Flex bg="white" h="full" w="full" flexDir="column">
      <Flex flexDir="column" gap={4} p={4}>
        <Flex
          pb={1}
          justify="space-between"
          borderBottom="1px solid"
          borderColor="gray.300"
        >
          <HStack>
            <Icon as={RdsDataframe} boxSize={5} color="background-selected" />
            <Text fontSize="lg">DataFrames</Text>
          </HStack>
          <CloseIconButton
            onClick={onCloseDrawer}
            aria-label="close dataframes"
          />
        </Flex>
        <Flex
          color="font-secondary"
          fontSize="sm"
          fontWeight="normal"
          flexDir="column"
        >
          <Text>
            DataFrames are flexible column-based, environment-wide
            data-structures.
          </Text>
          <Text>
            Use DataFrames with Python for data transformations and analytics.
          </Text>
          <Text>
            Visit our{' '}
            <RiveryButton
              target="_blank"
              href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Rivers/LogicRiver/LogicSteps/Python/python-dataframe"
              label="documentation"
              variant="link"
            />{' '}
            for more information.
          </Text>
        </Flex>
      </Flex>
      <Box p={4} height="calc(100vh - 210px)">
        <DataframesEditor />
      </Box>
      <HStack
        w="full"
        borderTop="1px"
        borderTopColor="gray.300"
        flex={1}
        px={4}
        alignSelf="end"
        justifyContent="space-between"
      >
        <RiveryButton
          label="Cancel"
          variant="default"
          onClick={onCloseDrawer}
          size="small"
        />
        <FeatureEnabler scope="dataframe:write">
          <DataFrameFormDialog
            onClick={() => setIsAdding(true)}
            onCancel={onCancel}
            disabled={isFetching || isAdding}
            onSubmit={onAdd}
          />
        </FeatureEnabler>
      </HStack>
    </Flex>
  );
}
