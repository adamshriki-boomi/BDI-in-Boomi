import { IDataSourceConnection } from 'api/types';
import { Image, Text } from 'components';
import { ConnectionModal } from 'modules';
import React from 'react';
interface Props extends IDataSourceConnection {}

export function DataSource({
  name,
  description,
  icon,
  connection_type,
  ...props
}: Props) {
  return (
    <ConnectionModal
      mode={ConnectionModal.Mode.EDIT}
      header={`${connection_type} New Connection`}
      type={connection_type}
      dataSourceId={props.id}
      {...props}
      buttonProps={{
        textAlign: 'center',
        shadow: 'md',
        w: 'full',
        height: '180px',
        variant: 'shadow',
        label: '',
      }}
    >
      <Image src={icon} rounded="full" />
      <h6>{name}</h6>
      <Text fontSize="xs">{description}</Text>
    </ConnectionModal>
  );
}
