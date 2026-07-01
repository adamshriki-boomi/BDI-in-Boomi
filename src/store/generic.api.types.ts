export interface ICollectionResponse<TItems> {
  items: TItems[];
  total_items: number;
  page: number;
  next_page?: string;
  prev_page?: string;
  environment_id: string;
  current_page_size: string;
  account_id: string;
}
