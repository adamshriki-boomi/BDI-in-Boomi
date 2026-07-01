import { IDataSourceV1 } from 'api/types';
import { useEffect, useState } from 'react';
export enum DisplayOrder {
  ASC = 'asc',
  DESC = 'desc',
}
export function nameFilter(filters, name) {
  return name.toLowerCase().includes(filters?.name.toLowerCase());
}

export function categoryFilter(filters, category) {
  return filters.category === category;
}

export function filterResults(filters, data) {
  return data?.filter(item => {
    const { name, section_name, section_id } = item;
    const includesName = filters?.name ? nameFilter(filters, name) : true;
    const includesCategory =
      filters?.category !== 'All'
        ? categoryFilter(filters, section_name)
        : true;

    if (includesCategory && includesName && section_id !== 'sec_hidden') {
      return item;
    }
    return null;
  });
}

export function sorted(data, filters) {
  return data.sort((a, b) => {
    // Always put "Data Connector Agent" first
    if (a.name === 'Data Connector Agent') return -1;
    if (b.name === 'Data Connector Agent') return 1;

    // Then apply the normal sorting logic
    if (filters.order === DisplayOrder.DESC) {
      return b.name.localeCompare(a.name);
    }
    if (filters.order === DisplayOrder.ASC) {
      return a.name.localeCompare(b.name);
    }
    const order =
      a.data_source_type_settings.in_section_ordinal -
      b.data_source_type_settings.in_section_ordinal;
    if (order === 0) {
      // if same order use a-z
      return a.name.localeCompare(b.name);
    } else return order;
  });
}

export const useFilteredDataSources = (filters, data) => {
  const [sources, setSources] = useState<IDataSourceV1[]>(null);
  useEffect(() => {
    if (data) {
      setSources(filterResults(filters, sorted(data, filters)));
    }
  }, [data, filters]);
  return sources;
};
