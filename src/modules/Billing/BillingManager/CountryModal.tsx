import { SelectFormGroup } from 'components/Form/components';
import { Footer, RiveryModal } from 'components/RiveryModal/RiveryChakraModal';
import countries from 'containers/Login/components/CreateAccountForm/countries.json';
import { selectCountriesProps } from 'containers/Login/components/CreateAccountForm/CountriesSelect';
import * as React from 'react';
import { useState } from 'react';
import { compare } from 'utils/array.utils';
import { useChargebeeModal } from '../Chargebee';

export const BillingCountry = ({ show, toggleModalSetCountry, plan }) => {
  const [country, setCountry] = useState(null);
  const { onClose } = useChargebeeModal({ country, plan });
  const footerProperties: Footer = {
    saveLabel: 'Next',
    cancelLabel: 'Close',
    disabledSave: !country,
  };
  return (
    <RiveryModal
      title="Billing Country"
      show={show}
      hasFooter={true}
      footer={footerProperties}
      onSuccess={onClose}
      toggle={toggleModalSetCountry}
      body={
        <SelectFormGroup
          controlId="country"
          options={countries}
          value={countries.find(compare('code', country))}
          selectProps={selectCountriesProps}
          placeholder="Select / enter your billing country"
          onChange={option => setCountry(option.code)}
          chakra
        />
      }
    />
  );
};
