import { IGroup } from 'api/types';
import { Grid, Text } from 'components';
import Dot from 'components/Dot/Dot';
import { CustomSelectForm, FormSelectProps } from 'components/Form';
import { useGroups } from 'containers/River/components/Groups/useGroups';
import { useCore } from 'store/core';
import { useGroupsLoader } from 'store/groups';
import { getCrossId } from 'utils/api.sanitizer';
import { pluck } from 'utils/array.utils';

function GroupSelectComponent({ data }) {
  return (
    <Grid
      gap="2"
      alignItems="center"
      gridTemplateColumns="min-content 1fr min-content"
      gridArea="1/1/2/3"
    >
      <Dot color={data?.color} icon={data?.icon} size={Dot.size.XSmall} />
      <Text noOfLines={1} wordBreak="break-all">
        {data?.name}
      </Text>
    </Grid>
  );
}

function GroupIcon({ data }) {
  return <Dot color={data?.color} icon={data?.icon} size={Dot.size.XSmall} />;
}

const groupComponents = isMulti => ({
  ...(!isMulti && {
    SingleValue: GroupSelectComponent,
    Option: GroupSelectComponent,
  }),
});

const labelValueProps = {
  getOptionLabel: pluck<IGroup, string>('name'),
  getOptionValue: getCrossId,
};

export function RiverGroupsQuerySelect({
  ...selectProps
}: Omit<FormSelectProps, 'options' | 'controlId'>) {
  const { groups } = useGroups();
  useGroupsLoader(useCore().envId);

  return (
    <CustomSelectForm
      label="Groups"
      aria-label="Groups"
      controlId="groups select"
      options={groups}
      components={groupComponents(selectProps?.isMulti) as any}
      chakra
      size="md"
      isClearable
      selectProps={labelValueProps}
      displayIcon={GroupIcon}
      {...selectProps}
    />
  );
}
