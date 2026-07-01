import { parseUrlSearchParams } from './searchParams';

interface PaginatedResponse {
  items: any[];
  account_id: string;
  current_page_size: number;
  environment_id: string;
  next_page: string;
  page: number | string;
}

/**
 * fetch all next pages according to a paginated query
 * @param baseQuery RTK baseQuery function or equivalent
 * @param url the endpoint
 * @param itemsPerPage (optional) starts with 10 items per page
 * @returns array of ResponseItem
 */
export async function fetchAllPages<ResponseItem>(
  baseQuery,
  url,
  itemsPerPage = 100,
): Promise<ResponseItem[]> {
  const fetchDataframes = async (page, items_per_page) => {
    const response = await baseQuery({
      url,
      params: {
        page,
        items_per_page,
      },
    });
    if (response?.error) {
      //in order to stop the infinite loop
      return [];
    }
    const { next_page, current_page_size, items } =
      response?.data as PaginatedResponse;
    const params = parseUrlSearchParams(next_page);
    const nextPage = params?.page;
    return nextPage
      ? items.concat(await fetchDataframes(nextPage, current_page_size))
      : items;
  };
  return await fetchDataframes(1, itemsPerPage);
}
