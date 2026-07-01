import { IDataSourceV1 } from 'api/types';
import { Flex, Grid, PageOverlaySpinner, Text } from 'components';
import { TableFilter } from 'components/RiveryTable/TableFilter';
import { FormTypes, LabelsSources, ModalForm } from 'modules';
import { useCallback, useMemo, useRef, useState } from 'react';
import { compare } from 'utils/array.utils';
import { DrawerHeader } from './components/ConnectionsDrawerHeader';
import { DisplayOrder, useFilteredDataSources } from './components/helpers';
import { SortButtonGroup } from './components/SortOrderButton';
import { CategoriesTabs, SourcesGrid } from './components/SourcesGrid';
import { useCore } from 'store/core';

interface ConnectionsExplorerProps<T> {
  connections: T[];
  connectionSections?: any[];
  onSelect?: (source: IDataSourceV1) => any;
  hideHeader?: boolean;
  type?: string;
}
export default function ConnectionsExplorer<T>({
  connections,
  connectionSections = [],
  onSelect,
  type = '',
}: ConnectionsExplorerProps<T>) {
  const [filters, setFilters] = useState({
    category: 'All',
    order: DisplayOrder.ASC,
    name: '',
  });
  const { activeAccountId } = useCore();
  const topRef = useRef<any>(null);
  const setAndScroll = useCallback((field, value) => {
    setFilters(state => ({ ...state, [field]: value }));
    topRef?.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const indexedDataSources = useMemo(
    () => connections?.map((ds, index) => ({ ...ds, initialIndex: index })),
    [connections],
  );

  const section = useMemo(
    () => connectionSections?.find(compare('section_name', filters.category)),
    [connectionSections, filters.category],
  );
  const categoryDescription = section?.section_description;
  const dataSources = useFilteredDataSources(
    filters,
    section ? section.section_datasources : indexedDataSources,
  );
  const [contactUsSource, setContactUsSource] = useState(null);
  const onClick = (value: IDataSourceV1) => {
    //It was implemented for Athena target, but can be used anywhere.
    //Alpha source + rollout connector account + target_settings.is_new_interface = false -> enables the target/source in old ui
    if (
      (value?.labels.includes(LabelsSources.ALPHA) &&
        !value?.feature_flags?.rollout_connector_accounts?.includes(
          activeAccountId,
        )) ||
      value.status === LabelsSources.SOON
    ) {
      setContactUsSource({
        ds: value?.id,
        msg: `"${value?.name}" connector${
          value?.status === LabelsSources.SOON ? ' once available' : ''
        }`,
      });
    } else {
      onSelect(value);
    }
  };

  return (
    <Flex flexDir="column" gap={3} h="full">
      <DrawerHeader type={type} />
      <Grid templateColumns="220px 1fr" h="full">
        <CategoriesTabs
          categories={connectionSections}
          setAndScroll={setAndScroll}
        />
        <Grid
          w="full"
          gap={3}
          h="full"
          gridTemplateRows="min-content 1fr"
          overflow="hidden"
        >
          <SearchAndSort
            section={section}
            total={dataSources?.length}
            filters={filters}
            setFilters={setFilters}
            setAndScroll={setAndScroll}
          />
          {Boolean(connections?.length) ? (
            <Flex overflow="hidden" mb={10}>
              <SourcesGrid
                connections={connections}
                dataSources={dataSources}
                categoryDescription={categoryDescription}
                topRef={topRef}
                onSelect={onClick}
                type={type}
              />
            </Flex>
          ) : (
            <PageOverlaySpinner />
          )}
          <ModalForm
            title="Contact us for connector access"
            show={Boolean(contactUsSource)}
            toggle={() => setContactUsSource(null)}
            type={FormTypes.CONTACT_SOURCE}
            clickData={{
              message: `Hey team, I would like to get access to ${contactUsSource?.msg}. Thank you.`,
              riveryRequestedDataSource: contactUsSource?.ds,
            }}
          />
        </Grid>
      </Grid>
    </Flex>
  );
}

function SearchAndSort({ total, filters, setFilters, setAndScroll, section }) {
  return (
    <Flex justify="space-between" alignItems="center" gap={2}>
      <Flex alignItems="center" gap={2}>
        <TableFilter
          value={filters.name}
          onFilterChange={v => setFilters(state => ({ ...state, name: v }))}
          placeholder={`Search ${section?.section_name ?? 'Integrations'}`}
          size="sm"
          chakra
        />
        <Text color="font-secondary">{total} integrations</Text>
      </Flex>
      <SortButtonGroup onSelectView={value => setAndScroll('order', value)} />
    </Flex>
  );
}
