import { useState } from 'react';

export const useEnhancedColumns = (columnsList: any[], otherGetProps) => {
  const [columnsState, setList] = useState([]);
  const clear = () => setList([]);
  const stateApi = {
    clear,
    onSelect: (name: string) => setList(state => [...state, name]),
    onUnselect: (name: string) =>
      setList(state => state.filter(item => name !== item)),
    ...otherGetProps,
  };
  const columns = columnsList.map(column => ({
    ...column,
    getProps: stateApi,
  }));

  return {
    columns,
    state: columnsState,
    ...stateApi,
  };
};
