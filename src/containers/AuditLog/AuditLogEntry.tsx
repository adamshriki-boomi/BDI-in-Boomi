import { Box, HStack, Icon, Link, Text, VStack } from '@chakra-ui/react';
import { RoutesBuilder } from 'app/routes';
import { ActionRiverIcon, LogicIcon, S2TIcon } from 'components';
import { useCore } from 'store/core';
import { displayDate } from 'utils/date.utils';
import { ReactComponent as ConnectionIcon } from './icons/connection-new-icon.svg';
import { ReactComponent as RiverIcon } from './icons/river-icon.svg';
import { ReactComponent as GroupIcon } from './icons/rivers_group.svg';
import { ReactComponent as UsersIcon } from './icons/users.svg';

const IconMap: Record<string, any> = {
  users: UsersIcon,
  rivers: RiverIcon,
  connections: ConnectionIcon,
  river_groups: GroupIcon,
  logic: LogicIcon,
  src_to_trgt: S2TIcon,
  src_to_fz: S2TIcon,
  actions: ActionRiverIcon,
};

enum EntityTypeMap {
  rivers = 'river',
  users = 'user',
  connections = 'connection',
  river_groups = 'group',
}

enum EntitySubType {
  logic = 'logic',
  actions = 'action',
  src_to_trgt = 'source to target',
}

function AuditItemDate({ time }) {
  return (
    <Text fontSize="xs" color="font-secondary" w="110px">
      {displayDate(time, 'dd-MMM-yy, HH:mm')}
    </Text>
  );
}

function Connector({ firstinOrder = false, lastInOrder = false }) {
  return (
    <Box
      height="24px"
      border={!firstinOrder && !lastInOrder && '0.01em solid #c2c5c8'}
    />
  );
}

export function AuditLogItem({ item, index, listLength }) {
  const firstInOrder = index === 0;
  const lastInOrder = index === listLength - 1;

  if (item === null || !item) {
    return null;
  }

  const isItemRiver = item?.entity_type === 'rivers';

  return (
    <HStack h="60px">
      <AuditItemDate time={item?.event_datetime} />
      <VStack pr={4}>
        <Connector firstinOrder={firstInOrder} />
        <Icon
          w={7}
          h={7}
          p={1}
          as={
            IconMap[
              isItemRiver
                ? item?.entity_subtype ?? item.entity_type
                : item?.entity_type
            ]
          }
          borderRadius={50}
          border="0.01em solid #c2c5c8"
        />
        <Connector lastInOrder={lastInOrder} />
      </VStack>
      <LogDescription item={item} />
    </HStack>
  );
}

function LogDescription({
  item: {
    user_name: userName,
    user_id: id,
    event_type: event,
    entity_type: type,
    entity_subtype: subtype,
    entity_name: entityName,
    entity_logical_key: logical_key,
  },
}) {
  const { envId: env, activeAccountId: account } = useCore();
  const isItemRiver = type === 'rivers';
  const isItemConnection = type === 'connections';
  const isItemLinked = isItemConnection || isItemRiver;

  const riverUrlParams = {
    account,
    env,
    river: logical_key,
  };

  const riverPath =
    subtype === 'logic'
      ? RoutesBuilder.river({ ...riverUrlParams })
      : RoutesBuilder.legacyRiver({
          accountId: account,
          envId: env,
          river: riverUrlParams.river,
        });

  const connectionPath = RoutesBuilder.connection({
    account,
    env,
    connectionId: logical_key,
  });

  const path = isItemRiver ? riverPath : connectionPath;
  return (
    <>
      <Text>
        {userName ?? `User: ${id}`} {event}d{' '}
        {isItemRiver ? EntitySubType[subtype] : null} {EntityTypeMap[type]}
      </Text>
      <Text
        as={isItemLinked && Link}
        onClick={() => isItemLinked && window.open(path, '_blank')}
        _hover={{ color: isItemRiver && 'brand', textDecoration: 'none' }}
        fontWeight="bold"
      >
        "{entityName}"
      </Text>
    </>
  );
}
