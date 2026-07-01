import { getDataV1 } from 'api/api.proxy';
import { Flex, HStack, Icon, InfiniteScrollComponent, Text } from 'components';
import { RiveryCheckbox, RiverySwitch } from 'components/Form';
import SvgFolder from 'components/Icons/components/Folder';
import { useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useAsyncFn } from 'react-use';
import { compare } from 'utils/array.utils';

function filterADGroups(groups) {
  return groups.filter(compare('source', 'active_directory'));
}

function setGroupsData(formApi, teams, nextPage) {
  formApi.setValue('next_page', nextPage);
  formApi.setValue('teams', teams);
}

GroupList.filterAD = filterADGroups;
GroupList.setData = setGroupsData;
export function GroupList({ showAll, setShowAll }) {
  const formApi = useFormContext();
  const [{ loading }, getNextPage] = useAsyncFn(async () => {
    const nextPage = formApi?.watch('next_page');
    const teams = formApi?.watch('teams');
    const data = await getDataV1(false, nextPage);
    setGroupsData(
      formApi,
      [...teams, ...filterADGroups(data?.items)],
      data?.next_page,
    );
  }, []);

  return (
    <Flex flexDir="column" gap={2} mt={1}>
      <RiverySwitch
        label="Show previously imported groups"
        mb={1}
        onChange={({ target }) => setShowAll(target.checked)}
        isChecked={showAll}
      />
      <InfiniteScrollComponent
        fetchMoreData={getNextPage}
        ariaLabel="ad_groups_list"
        list={formApi?.watch('teams')}
        component={ListComponent}
        rowHeight={25}
        hasMore={Boolean(formApi?.watch('next_page'))}
        isFetching={loading}
        listHeight="370px"
      />
    </Flex>
  );
}

function ListComponent({ item, index }) {
  const formApi = useFormContext();
  const { update } = useFieldArray({
    control: formApi.control,
    name: 'teams',
  });

  const setImported = useCallback(
    (checked, group, idx) =>
      update(idx, { ...group, is_imported: checked, is_new: checked }),
    [update],
  );
  return (
    <RiveryCheckbox
      pl={0.5}
      name={`teams[${index}].is_imported`}
      isChecked={item?.is_imported}
      onChange={({ target }) => setImported(target.checked, item, index)}
      isDisabled={!item?.is_new && item?.is_imported}
      label={
        <HStack color="font">
          <Icon boxSize={4} as={SvgFolder} />
          <Text>{item.remote_display_name}</Text>
        </HStack>
      }
    />
  );
}
