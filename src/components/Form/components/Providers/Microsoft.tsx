import { Image } from '@chakra-ui/react';
import { RiveryButton } from 'components/Buttons';
import { ConnectedComponent } from 'components/Form/components/Providers/Provider';
import * as React from 'react';

export const imageSrc = `${import.meta.env.VITE_IMAGES_PATH}/microsoft.png`;
export const Microsoft = ({ credentials, label, setCredentials, ...rest }) => {
  return Boolean(credentials) ? (
    <ConnectedComponent
      IconComponent={<Image src={imageSrc} boxSize={6} mr={4} />}
      label={label}
      setCredentials={setCredentials}
    />
  ) : (
    <RiveryButton
      leftIcon={<Image src={imageSrc} boxSize={6} mr={4} />}
      aria-label="connect with microsoft account"
      justifyContent="start"
      variant="default"
      {...rest}
      label="Connect with Microsoft Account"
    />
  );
};
