import { Flex, Text } from '@chakra-ui/react';
import { RiveryButton } from 'components/Buttons';
import { Google } from 'components/Form/components/Providers/Google';
import { Image } from 'components/Image/Image';
import { RiveryModal } from 'components/RiveryModal/RiveryChakraModal';
import 'containers/Login/components/GoogleSignIn.scss';
import { useProviderAuthPoller } from 'hooks';
import * as React from 'react';
import { useState } from 'react';
import { getOId } from 'utils/api.sanitizer';
import { Microsoft } from './Microsoft';

type Props = {
  type: 'provider';
  url: string;
  displayName: string;
  provider: string;
  onFail?: (error: any) => any;
  [key: string]: any;
};

const providers = {
  Google: Google,
  Microsoft: Microsoft,
};

const checkRequired = ({ valsArr, requiredArr }): any => {
  if (!requiredArr) {
    return {
      valid: Object.values(valsArr).every(Boolean),
      missing_fields: [],
    };
    //if required array does not exist then default is that all auth_fields are required
  }
  return {
    valid: requiredArr?.map(val => valsArr?.[val]).every(Boolean),
    missing_fields: requiredArr?.filter(val => !valsArr?.[val]),
  };
};
export function Provider({ api, type, label, formMetadata, ...props }: Props) {
  const { dsId } = formMetadata;

  function setCredentials(credentials: any) {
    const add_to_credentials = props?.auth_fields?.add_to_credentials;
    // this field is inside the credentials object in cases you want to add it to the final credentials
    const field_to_add = add_to_credentials && api?.watch(add_to_credentials);

    // if we got this field + it has a value  + the credentials is not null:
    if (add_to_credentials && field_to_add && credentials) {
      api.setValue('credentials', {
        [add_to_credentials]: field_to_add,
        ...credentials,
      });
    } else {
      api.setValue('credentials', credentials);
    }
  }
  const credentials = api?.watch('credentials');
  const connection_id = getOId(api?.watch('cross_id'));
  const connectionType = api?.watch('connection_type');
  const values = props?.auth_fields?.fields || [];
  const connectionFields = api?.getValues() || {};
  const valsArr = values.map(val => {
    return [val, connectionFields[val]];
  });
  const vals = Object.fromEntries(valsArr);
  const { valid, missing_fields } = checkRequired({
    valsArr: vals,
    requiredArr: props?.auth_fields?.required,
  });
  const params = {
    connection_id,
    datasource_id: props?.condition?.datasourceId ?? dsId,
    ...vals,
  };
  const [error, setError] = useState(null);
  const { activatePoller } = useProviderAuthPoller({
    valid,
    missing_fields,
    options: params,
    onSuccess: setCredentials,
    onError: setError,
    api: api,
  });
  const ProviderComponent = providers[label] ?? GenericConnectToButton;
  return connectionType ? (
    <>
      <ProviderComponent
        {...props}
        label={label}
        onClick={() => activatePoller()}
        credentials={credentials}
        setCredentials={setCredentials}
        icon={
          <Image size={Image.Size.XS} src={props?.icon ?? formMetadata?.icon} />
        }
        {...(!Boolean(providers[label]) && { paddingInlineStart: '0px' })}
      />
      <RiveryModal
        show={Boolean(error)}
        toggle={() => setError(null)}
        title="Error"
        ariaLabel="Error"
        body={error}
      />
    </>
  ) : null;
}
export const ConnectedComponent = ({
  IconComponent,
  label,
  setCredentials,
}) => {
  return (
    <Flex alignItems="center">
      {IconComponent}
      <Text ml={1}>Connected with {label}</Text>
      <RiveryButton
        _focus={{ boxShadow: 'none' }}
        fontWeight="normal"
        variant="link"
        onClick={() => setCredentials(null)}
        aria-label="Remove File"
        label="Remove"
        ml={3}
      />
    </Flex>
  );
};
const GenericConnectToButton = ({
  label,
  onClick,
  credentials,
  setCredentials,
  icon,
  ...props
}) => {
  return Boolean(credentials) ? (
    <ConnectedComponent
      IconComponent={icon}
      label={label}
      setCredentials={setCredentials}
    />
  ) : (
    <RiveryButton
      leftIcon={icon}
      variant="default"
      label={`Connect with ${label}`}
      onClick={onClick}
      {...props}
      width="fit-content"
    />
  );
};
