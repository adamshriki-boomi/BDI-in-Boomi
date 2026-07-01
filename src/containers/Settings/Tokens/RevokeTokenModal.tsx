import { RiveryModal, RiveryModalProps } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { useToastComponent } from 'hooks/useToast';
import { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { useRevokeTokenMutation } from './tokens.query';

interface RevokeTokenModalProps extends RiveryModalProps {
  value: { token_id: string; token_name: string };
  onChange: Dispatch<SetStateAction<{ token_id: string; token_name: string }>>;
}

export default function RevokeTokenModal({
  value,
  onChange,
  ...rest
}: RevokeTokenModalProps) {
  const [revoke, { isLoading, status }] = useRevokeTokenMutation();
  const { success } = useToastComponent();
  const onRevoke = useCallback(() => {
    if (value) {
      revoke(value.token_id);
    }
  }, [revoke, value]);

  useEffect(() => {
    if (status === 'fulfilled') {
      success({ description: 'Token was successfully deleted' });
      onChange(null);
    }
  }, [onChange, status, success]);

  return (
    <RiveryModal
      onClose={() => onChange(null)}
      footer={{
        cancelLabel: 'Cancel',
        saveLabel: (
          <RiveryButton
            size="small"
            label="Delete"
            variant="primary"
            colorScheme="danger"
            onClick={onRevoke}
          />
        ),
      }}
      title="Please confirm delete"
      body={
        <>
          {isLoading ? <PageOverlaySpinner /> : null}
          Are you sure you want to delete {value?.token_name}?
        </>
      }
      {...rest}
    />
  );
}
