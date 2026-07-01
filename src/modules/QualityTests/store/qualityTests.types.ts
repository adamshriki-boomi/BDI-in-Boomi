export enum TestSchema {
  LIST = 'list',
}
export interface IQualityTest {
  _id: string;
  is_active: boolean;
  test_name: string;
  test_schema: string[];
  data_quality_test_type_id: string;
  updated_at: string;
  test_type_name?: string;
  description?: string;
}

export type IQualityTestCreatePayload = Pick<
  IQualityTest,
  'test_name' | 'test_schema' | 'data_quality_test_type_id'
> & {
  is_active?: boolean;
  test_type_name: string;
};

export type IQualityTestUpdatePayload = Required<Pick<IQualityTest, '_id'>> &
  Partial<IQualityTest>;
export type ITestId = string | string[];
