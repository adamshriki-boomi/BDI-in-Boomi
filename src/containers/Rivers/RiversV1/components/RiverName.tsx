import { useGenerateRiverPathByType } from 'app/routers/useGenerateRiverPathByType';
import { Grid, RiveryOverlay, Text } from 'components';
import { Tagger } from 'components/Tracking/Tagger';
import { DataSourceIcon } from 'containers/Activities/components/ActivitiesColumns';
import { shouldAllowNewStt } from 'containers/River/RiverSourceToTarget/utils/stt.helper';
import { useIsNewInterface } from 'containers/Rivers/LegacyRiver';
import { Link } from 'react-router-dom';

export function RiverName({
  value,
  row: {
    original: { river_cross_id, river_type, datasource_id, target_type = '' },
    original,
  },
}) {
  const isNewInterface = useIsNewInterface(datasource_id, target_type);
  const enableAppRoute =
    isNewInterface && shouldAllowNewStt(river_type, original);

  const to = useGenerateRiverPathByType(
    river_type,
    river_cross_id,
    enableAppRoute,
  );

  return (
    <Tagger tags={{ 'river-name': value }}>
      <Grid
        templateColumns="50px 1fr"
        gap={2}
        aria-label={value}
        title={value}
        w="full"
        h="full"
        alignItems="center"
        as={Link}
        to={to}
      >
        <DataSourceIcon type={datasource_id} />
        <RiveryOverlay placement="auto" description={value}>
          <Text
            aria-label={value}
            fontWeight="normal"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            color="var(--chakra-colors-font-link)"
            textDecoration="underline"
            _hover={{
              color: 'font-link-hover',
              textDecoration: 'underline',
            }}
          >
            {' '}
            {value}
          </Text>
        </RiveryOverlay>
      </Grid>
    </Tagger>
  );
}
