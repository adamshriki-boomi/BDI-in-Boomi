import {
  Box,
  EditIcon,
  HStack,
  Icon,
  PlusIcon,
  TransparentIconButton,
} from 'components';
import RdsViewOnlyFile from 'components/Icons/components/RdsViewOnlyFile';
import React from 'react';
import { useEffectOnce } from 'react-use';
import { useAccount } from 'store/core';
import { getOId } from 'utils/api.sanitizer';

export function CustomConnectionOption({
  innerProps,
  label,
  isSelected,
  enableEdit,
  data,
  setConnection,
  value,
}) {
  const isNew = data?.label === 'new';
  const { isMemberRole } = useAccount();
  return (
    <HStack
      h="100%"
      width="100%"
      justify={isNew ? 'unset' : 'space-between'}
      sx={{
        '&:hover': {
          '& .chakra-icon': {
            visibility: 'visible',
          },
        },
      }}
      {...innerProps}
    >
      {isNew ? <Icon as={PlusIcon} boxSize={4} w={6} /> : null}
      <Box borderRadius={4}>{isNew ? 'Add New Connection' : label}</Box>
      {!isNew && enableEdit && (
        <Icon
          as={isMemberRole ? RdsViewOnlyFile : EditIcon}
          boxSize={4}
          color={isSelected ? 'white' : 'icon-tertiary'}
          role="button"
          visibility="hidden"
          onClick={e => {
            e.stopPropagation();
            setConnection(value);
          }}
        />
      )}
    </HStack>
  );
}

export function EditButton({ setConnection, ...props }) {
  const {
    hasValue,
    selectProps: { value },
  } = props;
  useEffectOnce(() => {
    if (!value?.cross_id) {
      props.setValue(undefined);
    }
  });
  const { isMemberRole } = useAccount();
  return hasValue && value.cross_id ? (
    <TransparentIconButton
      h={4}
      ml="auto"
      aria-label="edit-selected-connection"
      icon={
        <Icon
          as={isMemberRole ? RdsViewOnlyFile : EditIcon}
          color="icon-tertiary"
        />
      }
      onMouseDown={e => e.stopPropagation()}
      onClick={() => setConnection(getOId(value.cross_id))}
    />
  ) : null;
}
