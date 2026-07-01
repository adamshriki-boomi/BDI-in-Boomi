import { Box, Text } from 'components';

export function AllColumnsTitle() {
  return (
    <Text textStyle="R7" color="font-secondary">
      Mapping of the table columns, including their respective data types, mode
      and more.
    </Text>
  );
}

export function MatchKeyTitle() {
  return (
    <Text textStyle="R7" color="font-secondary">
      Set match keys by moving the desired columns to the left table using the
      arrows.{' '}
      <Box textStyle="M7">
        {' '}
        At least one match key must be selected when using the Upsert-Merge
        loading mode.
      </Box>
    </Text>
  );
}

export function ClusterTitle() {
  return (
    <Text textStyle="R7" color="font-secondary">
      Set cluster keys by moving the desired columns to the left table using the
      arrows. The order of the cluster keys is descending.
    </Text>
  );
}

export const titlesMap = editor => {
  switch (editor) {
    case 'All Columns':
      return AllColumnsTitle;
    case 'Match Key':
      return MatchKeyTitle;
    case 'Cluster':
      return ClusterTitle;
    default:
      return AllColumnsTitle;
  }
};
