import { Flex } from 'components';
import { SelectFormGroup } from 'components/Form/components';
import React, { useState } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import ca_province from './canada_provinces.json';
import countries from './countries.json';
import './CountriesSelect.scss';
import us_states from './us_states.json';
import au_states from './australia_states.json';

type CountriesSelectProps = {
  api: Partial<UseFormReturn>;
  pt?: string | number;
  registration?: boolean;
};

export const selectCountriesProps = {
  getOptionValue: option => option.code,
  getOptionLabel: option => option.name,
};
const selectStatesProps = {
  getOptionValue: option => option.abbreviation,
  getOptionLabel: option => option.name,
};

CountriesSelect.doubleOptCountries = countries
  .filter(c => Boolean(c.opt))
  .map(({ code }) => code);
export function CountriesSelect({
  api,
  registration = false,
  ...props
}: CountriesSelectProps) {
  const [countryCode, setCountryCode] = useState({ code: null });
  const displayState = ['US', 'AU'].includes(countryCode?.code);
  const displayProvince = countryCode?.code === 'CA';

  const onCountryChange = (country, onChange) => {
    onChange(registration ? country.code : country.name);
    api.setValue('country_code', country.country_code);
    setCountryCode(country);
  };

  const countryValidation =
    api?.formState.submitCount > 0 &&
    !api?.watch('country_code') &&
    'Country is required';

  const stateValidation =
    api?.formState.submitCount > 0 &&
    !api?.watch('state') &&
    'State is required';

  return (
    <Flex alignItems="flex-start" {...props}>
      <Controller
        control={api.control}
        name="country"
        render={({ field: { onChange } }) => (
          <SelectFormGroup
            label="Country"
            controlId="country"
            inputId="country"
            options={countries}
            selectProps={selectCountriesProps}
            onChange={option => onCountryChange(option, onChange)}
            validationMessage={countryValidation}
            chakra
            isRequired
          />
        )}
      />
      {(displayState || displayProvince) && (
        <Controller
          control={api.control}
          name="state"
          rules={{ required: Boolean(displayState) }}
          render={({ field: { onChange } }) => (
            <SelectFormGroup
              label={displayState ? 'State' : 'Province'}
              controlId="state"
              inputId="state"
              options={
                displayState
                  ? countryCode?.code === 'US'
                    ? us_states
                    : au_states
                  : ca_province
              }
              selectProps={selectStatesProps}
              onChange={state => onChange(state.abbreviation)}
              validationMessage={stateValidation}
              chakra
              isRequired
            />
          )}
        />
      )}
    </Flex>
  );
}
