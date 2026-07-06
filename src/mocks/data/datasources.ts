/**
 * GET /data_source_types  → { items: IDataSourceV1[] }
 *
 * Powers source-icon resolution (useSourceByType) across the Data Flows list,
 * Activities and the Dashboard source view. Icons point at local assets so they
 * render offline. Only the connectors this prototype uses are included.
 */
import { CONNECTORS, iconUrl } from './_shared';

const items = CONNECTORS.map(c => ({
  id: c.id,
  api_name: c.id,
  name: c.name,
  icon: iconUrl(c.icon),
  connection_type: c.id,
  status: 'enabled',
  segment:
    c.kind === 'warehouse'
      ? ['connections', 'target']
      : ['source', 'connections', 'target'],
  labels: [],
}));

export const dataSourceTypes = {
  next_page: '',
  previous_page: null,
  page: 1,
  current_page_size: items.length,
  total_items: items.length,
  items,
};
