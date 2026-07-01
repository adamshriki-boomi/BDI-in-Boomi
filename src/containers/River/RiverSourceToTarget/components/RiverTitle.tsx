import { Flex, Grid, HStack, Text } from 'components';
import Dot from 'components/Dot/Dot';
import { useRiverId } from 'containers/Activities/helpers';
import { SourceToTargetIcon } from 'containers/Activities/[id]/components/SourceToTargetIcon';
import { useGroups } from 'containers/River/components/Groups/useGroups';
import { useSetDrawer } from 'modules/RiverRightBar';
import { DrawerType } from 'modules/RiverRightBar/Actions';
import {
  IRiverTypes,
  useGroup,
  useSttSource,
  useSttTarget,
} from 'modules/SourceTarget';
import { useVersionDetailsV1 } from 'modules/Versions/hooks/useVersionDetails';
import React, { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { getOId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { RiverActivationSwitch } from './RiverActivation/components/RiverActivationSwitch';

export function RiverTitle({ switchDisabled }) {
  const formApi = useFormContext();
  const riverId = useRiverId();
  const versionedRiver = useVersionDetailsV1({ riverId });
  const isInVersionMode = Boolean(versionedRiver?.version_id);
  const setDrawer = useSetDrawer();
  const group = useGroup();
  const { groups } = useGroups();
  const riverMetadata = formApi.watch('river');
  const groupId =
    !Boolean(riverMetadata?.group_id) || riverMetadata?.group_id === group
      ? group
      : riverMetadata?.group_id;
  const selectedGroup = groups.find(compare('cross_id', groupId, getOId));
  const openInfoDrawer = useCallback(
    () => setDrawer(DrawerType.INFO),
    [setDrawer],
  );

  return (
    <Grid
      gap="2"
      gridTemplateColumns="1fr min-content"
      alignItems="start"
      pl="200px"
    >
      <Flex alignItems="center" gap={2}>
        {isInVersionMode && (
          <Flex textStyle="R5" color="gray.400">
            <Text textStyle="M5" color="primary" pr={2}>
              Version History Mode
            </Text>{' '}
            /
          </Flex>
        )}
        <Text textStyle="M5" role="button" onClick={openInfoDrawer}>
          {formApi?.watch('river.name')}
        </Text>
        <Text textStyle="R5" color="gray.400" mx={1}>
          /
        </Text>
        <HStack>
          <Dot
            color={selectedGroup?.color}
            icon={selectedGroup?.icon}
            size={Dot.size.XSmall}
          />
          <Text color="font-secondary" role="button" onClick={openInfoDrawer}>
            {selectedGroup?.name}
          </Text>
        </HStack>
      </Flex>
      <RiverActivationSwitch switchDisabled={switchDisabled} />
    </Grid>
  );
}
const allowedTypes = [IRiverTypes.SOURCE_TO_TARGET];

export function RiverConnections({ riverType }) {
  const source = useSttSource();
  const target = useSttTarget();
  return (
    <Flex alignItems="center" position="absolute" top={14}>
      <SourceToTargetIcon
        sourceIcon={source?.name}
        targetIcon={target?.name}
        riverType={riverType}
        allowedTypes={allowedTypes}
      />
    </Flex>
  );
}
