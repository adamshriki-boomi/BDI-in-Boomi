import { IRiver } from 'api/types';
import { RoutesBuilder } from 'app/routes';
import { Flex, HStack, Icon, RiveryModal, Text } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { CustomSelectForm } from 'components/Form/components';
import { OldAppIframe } from 'components/OldApp/OldAppIframe';
import { StatusTag } from 'containers/Rivers/RiversV1/components/StatusTag';
import React from 'react';
import { MdEdit } from 'react-icons/md';
import { useToggle } from 'react-use';
import { useAccount } from 'store/core';
import { getOId } from 'utils/api.sanitizer';

const selectProps = {
  getOptionLabel: option => option?.river_definitions?.river_name,
  getOptionValue: option => option.cross_id,
};

export type RiverBarProps<T> = {
  rivers: T[];
  selectedRiver?: T & IRiver;
  onChange: (river: T) => any;
  envId: string;
  editInAnotherTab?: boolean;
  accountId: string;
  onRefresh?: () => any;
  nodeName?: string;
  selectLabel?: string;
  placeholder?: string;
};
export enum ParamsOptions {
  POPUP = 'popup',
}
export function RiverBar<T>({
  rivers,
  selectedRiver,
  onChange,
  envId,
  editInAnotherTab,
  accountId,
  onRefresh,
  nodeName,
  selectLabel = 'Select data flow',
  placeholder = 'Select data flow',
}: RiverBarProps<T>) {
  const [show, toggle] = useToggle(false);

  const url =
    selectedRiver &&
    RoutesBuilder.legacyRiver({
      accountId,
      envId,
      river: getOId(selectedRiver?.cross_id),
    });

  return (
    <>
      <HStack gap={4} alignItems="flex-end" mb="4">
        <CustomSelectForm
          header={`${selectedRiver} River`}
          options={rivers}
          label={selectLabel}
          ariaLabel={`${selectLabel} for ${nodeName}`}
          controlId="rivers"
          placeholder={placeholder}
          value={selectedRiver}
          selectProps={
            {
              ...selectProps,
              label: `${selectLabel} for ${nodeName}`,
            } as any
          }
          onChange={onChange}
          isMulti={false}
          chakra={false}
          components={{ Option: CustomOption, ValueContainer: CustomControl }}
          customStyles={{
            placeholder: style => ({
              ...style,
              '&.select-form-group__placeholder': { marginTop: '5px' },
            }),
            input: style => ({
              ...style,
              '&.select-form-group__input-container': {
                position: 'absolute',
                top: '2px',
              },
            }),
          }}
        />
        <RiveryButton
          label="Edit Data Flow"
          aria-label={`Edit data flow for ${nodeName}`}
          variant="outlined-primary"
          leftIcon={<Icon as={MdEdit} boxSize={5} />}
          disabled={!selectedRiver}
          href={editInAnotherTab ? url : null}
          target="_blank"
          onClick={editInAnotherTab ? null : toggle}
        />
      </HStack>
      <RiveryModal
        show={show}
        onClose={() => {
          toggle();
          onRefresh && onRefresh();
        }}
        centered
        backdrop="static"
        ariaLabel={`River ${
          selectedRiver?.river_definitions?.river_name ?? ''
        } editor`}
        style={{
          header: { justifyContent: 'end' },
          content: {
            maxHeight: '90vh',
            height: '90vh',
            minWidth: '90vw',
          },
        }}
      >
        <OldAppIframe
          url={url}
          ariaLabel={`Edit data flow ${
            selectedRiver?.river_definitions?.river_name ?? ''
          }`}
          params={ParamsOptions.POPUP}
          height="100%"
        />
      </RiveryModal>
    </>
  );
}

function CustomOption({ innerProps, children, data }) {
  const { isSettingOn } = useAccount();
  const river = data?.river_definitions;
  const isDisabledRiver =
    isSettingOn('allow_create_new_stt') && river?.river_status === 'disabled';
  return (
    <Flex alignItems="center" justify="space-between" {...innerProps}>
      <Text>{children}</Text>
      {isDisabledRiver && <StatusTag value={river?.river_status} />}
    </Flex>
  );
}

function CustomControl({ children, selectProps, ...rest }) {
  const { isSettingOn } = useAccount();
  const river = selectProps?.value?.river_definitions;
  const isDisabledRiver =
    isSettingOn('allow_create_new_stt') && river?.river_status === 'disabled';
  return (
    <Flex gap={4} alignItems="start" justify="space-between" {...rest} h="30px">
      <Text>{children}</Text>
      {isDisabledRiver && <StatusTag value={river?.river_status} />}
    </Flex>
  );
}
