export interface FilterValue {
  field: string;
  operator: string;
  value: any;
}

interface FilterColumnValue {
  value: string;
  label: string;
}

export enum FilterType {
  IS = 'is',
  STRING = 'string',
  // Add more types as needed e.g. NUMBER, DATE
}

export enum FilterStringOperators {
  IS = 'is',
  IS_NOT = 'isNot',
  CONTAINS = 'contains',
  DOESNT_CONTAIN = 'doesntContain',
  PREFIX_IS = 'prefixIs',
  SUFFIX_IS = 'suffixIs',
}

export enum FilterIsOperators {
  IS = 'is',
  IS_NOT = 'isNot',
}

export interface FilterColumn {
  value: string;
  label: string;
  type: FilterType;
  isStatic?: boolean;
  staticValue?: string;
  values?: FilterColumnValue[];
}
