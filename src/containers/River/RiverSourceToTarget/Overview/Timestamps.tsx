import { Box, DateDisplay, Flex, Grid, Text } from 'components';
import { useSttFormContext } from 'modules/SourceTarget';

export function Timestamps() {
  const formApi = useSttFormContext();
  const {
    created_at: createdAt,
    created_by: createdBy,
    last_updated_by: updatedBy,
    last_updated_at: updatedAt,
  } = formApi?.watch('river.metadata') ?? {};
  return (
    <Grid gridArea="timestamps" gap={3} pt={4} px={6}>
      {[
        ['Created', createdAt, createdBy],
        ['Last Modified', updatedAt, updatedBy],
      ].map(([header, date, by]) => (
        <Box key={header}>
          <Text textStyle="R7" color="font-secondary">
            {header}
          </Text>
          <Flex gap="2">
            <DateDisplay value={date} />
            <Text color="font-secondary">By</Text>
            <Text color="font" textStyle="R7">
              {by}
            </Text>
          </Flex>
        </Box>
      ))}
    </Grid>
  );
}
