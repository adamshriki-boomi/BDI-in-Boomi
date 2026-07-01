import { GridBox } from 'components';
import { useActivityPageType } from 'containers/Activities/store';
import { Link } from 'react-router-dom';
import { removeParams, upsertSearchParams } from 'utils/searchParams';
import { useViewParamResolver } from '../components/ViewRadios';

export const RowLink = ({
  children,
  'aria-label': ariaLabel,
  enabled,
  templateColumns,
  to,
}) => {
  const { isSubRivers, isRunsView } = useViewParamResolver();
  const { isS2tTRiver } = useActivityPageType();

  return (
    <GridBox
      whiteSpace="nowrap"
      aria-label={ariaLabel}
      fontSize="sm"
      w="full"
      bg={enabled ? 'background-selected-weak' : 'white'}
      _hover={{ bg: 'rgba(245, 245, 245, 0.50)' }}
      fontWeight="normal"
      as={Link}
      pl={4}
      pr={isRunsView && isS2tTRiver ? 0 : 4}
      alignItems="center"
      templateColumns={templateColumns}
      height="40px"
      overflow="hidden"
      color="font"
      replace
      to={{
        search: removeParams(
          upsertSearchParams({
            run: to,
            ...(!isSubRivers ? { sub_river_id: null } : {}),
          }),
          ['pageIndex', 'page', 'pageSize'],
        ),
      }}
    >
      {children}
    </GridBox>
  );
};
