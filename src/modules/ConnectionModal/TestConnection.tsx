import { CloseIcon, Icon } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { FeatureEnabler } from 'modules';
import * as React from 'react';
import { BsLightningFill } from 'react-icons/bs';

type TestConnectionProps = {
  loading: boolean;
  onCancel: () => any;
  onTest: () => any;
  variant?: 'river' | 'connection';
};

const connectionVariant = { label: 'Cancel Test', variant: 'error' };
const riverVariant = {
  label: 'Stop Testing',
  variant: 'primary',
  colorScheme: 'danger',
  leftIcon: <Icon as={CloseIcon} boxSize={4} />,
};

const cancelButtonVariant = {
  river: riverVariant,
  connection: connectionVariant,
};

export function TestConnection({
  loading,
  onCancel,
  onTest,
  variant = 'connection',
}: TestConnectionProps) {
  return loading ? (
    <RiveryButton
      {...cancelButtonVariant[variant]}
      onClick={onCancel}
      disabled={false}
      {...(variant === 'connection' && { isLoading: loading })}
    />
  ) : (
    <FeatureEnabler>
      <RiveryButton
        leftIcon={
          <Icon
            as={BsLightningFill}
            boxSize="5"
            rounded="full"
            color="white"
            p="1"
            {...(variant === 'connection' && { bg: 'background-selected' })}
          />
        }
        label="Test Connection"
        variant={variant === 'connection' ? 'outlined-primary' : 'primary'}
        onClick={onTest}
      />
    </FeatureEnabler>
  );
}
