import { HStack, Icon, TagLabel } from '@chakra-ui/react';
import { RiverTypes } from 'api/types';
import { InfoTooltip, RenderGuard, RiveryInfoTooltip, Tag } from 'components';
import { useIsNewInterface } from 'containers/Rivers/LegacyRiver';
import { useDataSourcesSections } from 'modules';
import { IRiverTypes } from 'modules/SourceTarget';

const StatusColor = {
  suspended: 'yellow',
  disabled: 'contained-gray',
  active: 'contained-green',
};

export function StatusTag({ value, row = null }) {
  let isSuspended = false;
  if (row) {
    isSuspended = Boolean((row.original as any)?.suspended?.suspension_date);
  }
  const variant = StatusColor[isSuspended ? 'suspended' : value];

  return (
    <HStack justify="space-around">
      <Tag
        variant={variant}
        py={0.5}
        px={1}
        textTransform="capitalize"
        fontWeight="medium"
        fontSize="xs"
        colorScheme="green"
      >
        <RenderGuard condition={isSuspended}>
          <RiveryInfoTooltip
            ariaLabel="suspended"
            description="This Data Flow is suspended due to consecutive errors"
            icon={<Icon as={InfoTooltip} mx={1} boxSize="14px" />}
            buttonProps={{ minW: '14px' }}
          />
        </RenderGuard>
        <TagLabel>{isSuspended ? 'Suspended' : value}</TagLabel>
      </Tag>
    </HStack>
  );
}

export function RiverV2Tag({
  value: apiV2,
  row: {
    original: {
      datasource_id,
      source_src,
      river_type,
      type_src = null,
      target_type = null,
      target_src = null,
    },
  },
}) {
  const sourceId = datasource_id ?? source_src;
  const { entities: sources } = useDataSourcesSections('source');
  const targetId = target_type ?? target_src;
  const type = river_type ?? type_src;
  const isNewInterface = useIsNewInterface(sourceId, targetId, type);

  const newInterfaceCompatibleTypes = [
    IRiverTypes.SOURCE_TO_TARGET,
    IRiverTypes.SOURCE_TO_TARGET_OLD,
    RiverTypes.SOURCE_TO_FZ,
    RiverTypes.LOGIC,
  ];

  const showNew =
    apiV2 && isNewInterface && newInterfaceCompatibleTypes.includes(type);

  return (
    <RenderGuard condition={Boolean(sources)}>
      <Tag
        variant={showNew ? 'magenta' : 'white'}
        py={0.5}
        px={1}
        fontWeight="medium"
        fontSize="xs"
      >
        <TagLabel>{showNew ? 'New' : 'Classic'}</TagLabel>
      </Tag>
    </RenderGuard>
  );
}
