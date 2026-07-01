import React, { useContext } from 'react';

type updateCellByKeysFN = (
  varKey: string,
  fieldKey: string,
  value: string | boolean,
) => any;

export const VariablesEditContext = React.createContext<{
  newVarState: Record<string, any>;
  variables: Record<string, any>;
  outputVariables: Record<string, any>;
  onValue: updateCellByKeysFN;
  onAdd: (variable: Record<string, any>) => any;
  onDelete: (key: string) => any;
  onUpdate: (key: any) => any;
  onMappingChange: (outputVar: string, riverVar: string) => any;
  onAddOutputVariable: (newVarName) => any;
}>({
  newVarState: {},
  variables: {},
  outputVariables: {},
  onValue: null,
  onUpdate: null,
  onAdd: null,
  onDelete: null,
  onMappingChange: null,
  onAddOutputVariable: null,
});

export const useVariables = () => useContext(VariablesEditContext);
