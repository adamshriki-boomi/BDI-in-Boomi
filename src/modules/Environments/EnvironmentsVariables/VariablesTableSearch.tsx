import { HStack } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { CustomSelectForm } from 'components/Form/components/SelectFormGroup/CustomSelectForm';
import React from 'react';
import { useEnvironmentsVariables } from 'store/environments/hooks/useGetEnvironment';
import { useGetEnvironmentsQuery } from '../environments.query';
import './VariablesManager.scss';
const useEnvironmentOptions = () => {
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  return environmentsArray?.map(({ environment_name }) => ({
    label: environment_name,
    value: environment_name,
  }));
};

const useVariableOptions = () => {
  const variables = useEnvironmentsVariables();
  return variables.map(({ name }) => ({ label: name, value: name }));
};

export const TableSearch = React.memo(SearchComponent);

const selectComponentstyle = {
  container: styles => {
    return {
      ...styles,
      width: 360,
    };
  },
};

export function SearchComponent({ updateFilter, clearAllFilters, filtersOn }) {
  const environments = useEnvironmentOptions();
  const variables = useVariableOptions();
  return (
    <HStack maxW="800px" alignItems="end">
      <CustomSelectForm
        options={environments}
        controlId="environments"
        label="Select Environment"
        updateFilter={updateFilter}
        name="environments"
        ariaLabel="environments"
        filtersOn={filtersOn}
        customStyles={selectComponentstyle}
      />
      <CustomSelectForm
        options={variables}
        controlId="variables"
        label="Select Variable"
        updateFilter={updateFilter}
        name="variables"
        ariaLabel="variables"
        filtersOn={filtersOn}
        customStyles={selectComponentstyle}
      />
      <RiveryButton label="Clear" variant="text" onClick={clearAllFilters} />
    </HStack>
  );
}
