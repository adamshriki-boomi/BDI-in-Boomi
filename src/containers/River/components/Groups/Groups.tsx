import { ButtonProps } from '@chakra-ui/react';
import { IGroup } from 'api/types';
import { Box, Flex, RiveryModal } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Input } from 'components/Form';
import { RiveryCheckbox } from 'components/Form/components';
import { ColorPicker } from 'components/Pickers/ColorPicker';
import { defaultPreset, IconPicker } from 'components/Pickers/IconPicker';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useEffectOnce, useToggle } from 'react-use';
import { getCrossId, getOId } from 'utils/api.sanitizer';
import { GroupSelector } from './GroupSelector';
import { useGroups } from './useGroups';
type GroupsProps = {
  groupId: string;
  modalOnly?: boolean;
  onClose?: () => any;
  onChange?: (groupId: string) => any;
  variant?: 'outlined' | null;
};

const Variants = {
  outlined: {
    variant: 'default',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, auto) 1fr',
    justifyItems: 'end',
    bgColor: 'background-secondary',
    borderColor: 'gray.200',
    size: 'base',
    fontWeight: '400',
    justifyContent: 'flex-start',
  } as ButtonProps,
};
export function Groups({
  groupId,
  onClose,
  modalOnly = false,
  onChange,
  variant = null,
}: GroupsProps) {
  const { groups, update, loading, create, createAndSet, setGroup } =
    useGroups();
  const [show, toggle] = useToggle(modalOnly);
  const { useFormApi, editGroup, selectedGroup } = useGroupForm();
  const { handleSubmit, control, watch } = useFormApi;
  const isEditMode = Boolean(selectedGroup?._id);
  const onEditGroup = (group: Partial<IGroup>) => {
    editGroup(group);
    toggle(true);
  };

  const handleClose = (value = undefined) => {
    toggle(value);
    onClose && onClose();
  };

  const onSelectGroup = (group: IGroup) => {
    if (!modalOnly) {
      const id = getOId(group.cross_id);
      setGroup(id);
      onChange && onChange(id);
    }
  };

  const onSubmit = async (formData: IGroup) => {
    // when creating a new group, it doesnt include an _id
    // thus, the "create" api

    const apiRequest = isEditMode ? update : modalOnly ? create : createAndSet;
    const group = await apiRequest({
      ...selectedGroup,
      ...formData,
      update_time: new Date().getTime(),
    });
    if (!(isEditMode || modalOnly) && group) {
      onSelectGroup(group);
    }
    handleClose(false);
  };

  useEffect(() => {
    if (modalOnly && !selectedGroup) {
      const selected = groupId
        ? groups.find(group => getCrossId(group) === groupId)
        : createGroup();

      editGroup(selected);
    }
  }, [groups, groupId, editGroup, selectedGroup, modalOnly]);

  const [viewSetDefault, setViewSetDefault] = useState(false);
  useEffectOnce(() => {
    const isDefault = watch('is_default');
    setViewSetDefault(!isDefault);
  });

  return (
    <>
      {modalOnly ? null : (
        <GroupSelector
          id="river-box"
          selected={groupId}
          groups={groups}
          onEdit={onEditGroup}
          onCreate={() => onEditGroup(createGroup())}
          onSelect={onSelectGroup}
          buttonTriggerProps={Variants?.[variant]}
        />
      )}
      <RiveryModal
        title={`${isEditMode ? 'Edit' : 'Add New'} Group`}
        onClose={handleClose}
        show={show}
      >
        <Box as="form" onSubmit={handleSubmit(onSubmit)} display="contents">
          <RiveryModal.Body>
            <Flex flexDir="column" gap={1} overflow="hidden">
              <form noValidate>
                <Input
                  label="Group Name"
                  name="name"
                  api={useFormApi}
                  required={true}
                />

                <Box overflow="auto">
                  <Controller
                    control={control}
                    name="color"
                    render={({ field: { value, onChange } }) => (
                      <ColorPicker selected={value} onChange={onChange} />
                    )}
                  />

                  <Controller
                    control={control}
                    name="icon"
                    render={({ field: { value, onChange } }) => (
                      <IconPicker
                        header="Group Icon"
                        color={watch('color')}
                        selected={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </Box>
                {viewSetDefault ? (
                  <RiveryCheckbox
                    pl={2}
                    label="Set as Default Group"
                    ariaLabel="Default Group"
                    name="is_default"
                    api={useFormApi}
                  />
                ) : (
                  <RiveryCheckbox
                    pl={2}
                    label="Default Group"
                    ariaLabel="Default Group"
                    name="is_default"
                    isDisabled={true}
                    api={useFormApi}
                  />
                )}
              </form>
            </Flex>
          </RiveryModal.Body>
          <RiveryModal.Footer>
            <RiveryButton
              label="Cancel"
              variant="default"
              onClick={() => handleClose(false)}
            />
            <RiveryButton
              label="Save"
              type="submit"
              isLoading={loading}
              disabled={false}
            />
          </RiveryModal.Footer>
        </Box>
      </RiveryModal>
    </>
  );
}

const useGroupForm = () => {
  const useFormApi = useForm<Partial<IGroup>>();
  const [selectedGroup, setSelectedGroup] = useState<Partial<IGroup>>();

  const editGroup = useCallback(
    (group: Partial<IGroup>) => {
      useFormApi.reset(group);
      setSelectedGroup(group);
    },
    [useFormApi, setSelectedGroup],
  );
  return { useFormApi, editGroup, selectedGroup };
};

const createGroup = () => ({
  name: '',
  color: ColorPicker.defaultPreset[0],
  is_default: false,
  icon: defaultPreset[0],
});
