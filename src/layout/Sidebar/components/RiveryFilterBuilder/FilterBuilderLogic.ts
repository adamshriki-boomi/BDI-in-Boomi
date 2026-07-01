import {
  FilterColumn,
  FilterIsOperators,
  FilterStringOperators,
  FilterType,
  FilterValue,
} from 'layout/Sidebar/components/RiveryFilterBuilder/consts';

export type StringOperator =
  | 'is'
  | 'isNot'
  | 'contains'
  | 'doesntContain'
  | 'prefixIs'
  | 'suffixIs';
export type IsOperator = 'is' | 'isNot';
export type FilterOperator = StringOperator | IsOperator;

interface OperatorOption {
  value: FilterOperator;
  label: string;
}

const STRING_OPERATORS: OperatorOption[] = [
  { value: FilterStringOperators.IS, label: 'is' },
  { value: FilterStringOperators.IS_NOT, label: 'is not' },
  { value: FilterStringOperators.CONTAINS, label: 'contains' },
  { value: FilterStringOperators.DOESNT_CONTAIN, label: "doesn't contain" },
  { value: FilterStringOperators.PREFIX_IS, label: 'prefix is' },
  { value: FilterStringOperators.SUFFIX_IS, label: 'suffix is' },
];

const IS_OPERATORS: OperatorOption[] = [
  { value: FilterIsOperators.IS, label: 'is' },
  { value: FilterIsOperators.IS_NOT, label: 'is not' },
];

export function getOperatorsByColumnType(columnType: string): OperatorOption[] {
  switch (columnType) {
    case FilterType.STRING:
      return STRING_OPERATORS;
    case FilterType.IS:
      return IS_OPERATORS;
    default:
      return [];
  }
}

export function getColumnInfo(columnValue: string, columns) {
  const column = columns.find(col => col.value === columnValue);
  return {
    type: column?.type || undefined,
    isStatic: column?.isStatic || false,
    staticValue: column?.staticValue,
  };
}

export function getColumnType(columnValue: string, columns): string {
  const column = columns.find(col => col.value === columnValue);
  return column?.type || undefined;
}

const stringOperatorToFunction: Record<
  FilterStringOperators,
  (itemValue: string, filterValue: string) => boolean
> = {
  [FilterStringOperators.IS]: isFilter,
  [FilterStringOperators.IS_NOT]: isNotFilter,
  [FilterStringOperators.CONTAINS]: containsFilter,
  [FilterStringOperators.DOESNT_CONTAIN]: doesntContainFilter,
  [FilterStringOperators.PREFIX_IS]: prefixIsFilter,
  [FilterStringOperators.SUFFIX_IS]: suffixIsFilter,
};

const isOperatorToFunction: Record<
  FilterIsOperators,
  (itemValue: string, filterValue: string) => boolean
> = {
  [FilterIsOperators.IS]: isFilter,
  [FilterIsOperators.IS_NOT]: isNotFilter,
};

export function applyFilters(
  dataSet: any[],
  filters: FilterValue[],
  operator: 'and' | 'or',
  filterColumns: FilterColumn[],
): any[] {
  const columnsByValue = Object.fromEntries(
    filterColumns.map(col => [col.value, col]),
  );

  const checkFilter = (filter: FilterValue, item: any) => {
    const column = columnsByValue[filter.field];
    const operatorFn =
      column.type === FilterType.STRING
        ? stringOperatorToFunction[filter.operator]
        : isOperatorToFunction[filter.operator];

    return operatorFn(item[filter.field], filter.value);
  };

  return dataSet.map(item => ({
    ...item,
    isFilteredIn:
      operator === 'and'
        ? filters.every(filter => checkFilter(filter, item))
        : filters.some(filter => checkFilter(filter, item)),
  }));
}

export function containsFilter(
  itemValue: string,
  filterValue: string,
): boolean {
  return itemValue.toLowerCase().includes(filterValue.toLowerCase());
}

export function doesntContainFilter(
  itemValue: string,
  filterValue: string,
): boolean {
  return !itemValue.toLowerCase().includes(filterValue.toLowerCase());
}

export function prefixIsFilter(
  itemValue: string,
  filterValue: string,
): boolean {
  return itemValue.toLowerCase().startsWith(filterValue.toLowerCase());
}

export function suffixIsFilter(
  itemValue: string,
  filterValue: string,
): boolean {
  return itemValue.toLowerCase().endsWith(filterValue.toLowerCase());
}

export function isFilter(itemValue: string, filterValue: string): boolean {
  return itemValue === filterValue;
}

export function isNotFilter(itemValue: string, filterValue: string): boolean {
  return itemValue !== filterValue;
}
