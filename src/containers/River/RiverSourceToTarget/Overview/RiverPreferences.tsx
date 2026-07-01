import { FlexProps, Icon, Link } from '@chakra-ui/react';
import {
  Box,
  CloseIconButton,
  Flex,
  HStack,
  InfoTooltip,
  RiveryButton,
  Text,
  Textarea,
} from 'components';
import { Input } from 'components/Form';
import { RiverGroupsQuerySelect } from 'components/Form/components/FrequentComponents';
import { useGroups } from 'containers/River/components/Groups/useGroups';
import { useDismissDrawer } from 'modules/RiverRightBar';
import {
  useIsDisabledRiverForm,
  useSttFormContext,
  useSttSource,
  useSttTarget,
} from 'modules/SourceTarget';
import { useCallback, useMemo, useState } from 'react';
import { useController } from 'react-hook-form';
import { useEffectOnce } from 'react-use';
import { useGroupsState } from 'store/groups';
import { getOId } from 'utils/api.sanitizer';
import { Timestamps } from './Timestamps';

export function RiverPrefrences() {
  return (
    <Flex flexDir="column" w="435px" gap={2}>
      <HStack>
        <Icon as={InfoTooltip} boxSize={4} />
        <Text textStyle="M6" color="primary">
          Data Flow Info
        </Text>
      </HStack>
      <PreferencesForm />
    </Flex>
  );
}

const prefFormInput = {
  chakra: true,
};

function PreferencesForm({ ...props }: FlexProps) {
  const formApi = useSttFormContext();
  const { field: groupIdField } = useController({
    name: 'river.group_id',
    control: formApi.control,
  });
  const source = useSttSource();
  const target = useSttTarget();
  const { defaultGroup } = useGroupsState();
  const defaultGroupId = Boolean(groupIdField?.value)
    ? groupIdField.value
    : getOId(defaultGroup?.cross_id);
  useEffectOnce(() =>
    formApi.setValue('river.group_id', defaultGroupId, { shouldDirty: true }),
  );

  return (
    <Flex flexDir="column" gap={4} {...props}>
      <Input
        label="Data Flow Name"
        placeholder={`${source.name}-${
          target.name
        } ${new Date().toLocaleString()}`}
        name="river.name"
        api={formApi}
        required
        {...prefFormInput}
      />
      <RiverGroupsQuerySelect
        name="river.group_id"
        api={formApi}
        label="Group"
        isMulti={false}
      />
      <Input
        as={Textarea}
        label="Description"
        placeholder="Describe the Data Flow"
        name="river.metadata.description"
        api={formApi}
        size="10"
        fontSize="sm"
        optional
        {...prefFormInput}
      />

      {/* <Input
        label="Tag"
        placeholder="Add tag to River..."
        optional
        {...prefFormInput}
      /> */}
    </Flex>
  );
}

const useRiverMetadataState = river => {
  const { groups } = useGroups();
  const selectedGroup = groups?.filter(
    ({ cross_id }) => river?.group_id === getOId(cross_id),
  );

  const [metadata, setMetadata] = useState<any>({
    name: river?.name,
    description: river?.metadata?.description,
    group: selectedGroup[0],
  });

  const handlers = useMemo(
    () => ({
      setName: name => setMetadata(state => ({ ...state, name })),
      setGroup: group => setMetadata(state => ({ ...state, group })),
      setDescription: description =>
        setMetadata(state => ({ ...state, description })),
    }),
    [],
  );

  return [metadata, handlers];
};

export function EditModeRiverPreferences() {
  const formApi = useSttFormContext();
  const { field: originName } = useController({
    name: 'river.name',
    control: formApi.control,
  });
  const { field: originGroup } = useController({
    name: 'river.group_id',
    control: formApi.control,
  });
  const { field: originDescription } = useController({
    name: 'river.metadata.description',
    control: formApi.control,
  });

  const [{ name, group, description }, { setName, setGroup, setDescription }] =
    useRiverMetadataState(formApi?.watch('river'));
  const dismissDrawer = useDismissDrawer(false);

  const onApplyChanges = useCallback(() => {
    originName.onChange(name);
    originGroup.onChange(getOId(group?.cross_id));
    originDescription.onChange(description);
    dismissDrawer();
  }, [
    description,
    dismissDrawer,
    group?.cross_id,
    name,
    originDescription,
    originGroup,
    originName,
  ]);

  const showDisabledStyle = useIsDisabledRiverForm();

  return (
    <Flex flexDir="column" h="full" pt={3} pb={2} gap={4}>
      <HStack
        pl={6}
        borderBottom="1px"
        borderBottomColor="gray.300"
        w="full"
        justify="space-between"
      >
        <Text textStyle="M4">Data Flow Info</Text>
        <CloseIconButton
          aria-label="close-drawer"
          onClick={dismissDrawer}
          as={Link}
        />
      </HStack>
      <Box px={6}>
        <Input
          name="river-name"
          label="Name"
          value={name}
          onChange={({ target: { value } }) => setName(value)}
          required
          validationError={name === '' && 'Data Flow name is required'}
          {...prefFormInput}
        />
      </Box>
      <Box px={6}>
        <RiverGroupsQuerySelect
          label="Group"
          isMulti={false}
          controlId="river-group"
          value={group}
          onChange={val => setGroup(val)}
          {...(showDisabledStyle && {
            customStyles: {
              control: provided => ({
                ...provided,
                backgroundColor: 'var(--chakra-colors-gray-150)',
                borderColor: 'var(--chakra-colors-gray-300)',
              }),
              valueContainer: provided => ({
                ...provided,
                color: 'var(--chakra-colors-gray-700)',
              }),
            },
          })}
        />
      </Box>
      <Box px={6}>
        <Input
          value={description}
          onChange={({ target: { value } }) => setDescription(value)}
          as={Textarea}
          label="Description"
          placeholder="Describe the Data Flow"
          size="10"
          fontSize="sm"
          optional
          {...prefFormInput}
        />
      </Box>
      <Timestamps />
      <Flex w="full" h="full" alignItems="end">
        <HStack
          pt={3}
          w="full"
          h="49px"
          px={6}
          borderTop="1px"
          borderTopColor="gray.300"
          justify="space-between"
        >
          <RiveryButton
            label="Close"
            size="small"
            variant="default"
            onClick={dismissDrawer}
            href="#"
          />
          <RiveryButton
            label="Apply Changes"
            size="small"
            onClick={onApplyChanges}
            isDisabled={[name === '', !group].some(Boolean)}
          />
        </HStack>
      </Flex>
    </Flex>
  );
}
