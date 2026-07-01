export interface IQualityTestType {
  _id: string;
  description: string;
  schema: string;
  test_type_name: TestTypeId;
}

export enum TestTypeId {
  UNIQUE = 'unique_values_test',
  NOT_NULL = 'not_null_test',
}
