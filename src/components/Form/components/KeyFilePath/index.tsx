import { api } from 'api/api.proxy';
import { Flex, Grid, Icon } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { RiveryButton } from 'components/Buttons';
import { DeleteIcon, PlusIcon } from 'components/Icons';
import { RenderGuard } from 'components/RenderGuard';
import { useCallback, useState } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';
import { getOId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { ComplexInputField } from '../ComplexInputField';
import { FormSelect } from '../FormSelect';

export function KeyFilePathComponent({
  name,
  api: formApi,
  display_name,
  ...rest
}) {
  const [keyID, setKeyID] = useState(null);
  const [publicKey, setPublicKey] = useState({ keyID: null });
  const [options, setOptions] = useState([]);
  const { dsId } = rest?.formMetadata;

  const getKeyOptions = useCallback(
    () =>
      api.get('/connections/key_pairs').then(({ data }) => {
        const options = data?.filter(compare('connection_type', dsId));
        setOptions(
          options.map(({ key_pair_id, key_name, key_file_name }) => ({
            id: getOId(key_pair_id),
            label: key_name,
            value: key_file_name,
          })),
        );
      }),
    [dsId],
  );

  useEffectOnce(() => {
    getKeyOptions();
  });

  const [{ loading: publicKeyLoading }, getPublicKey] = useAsyncFn(async () => {
    await api.get(`/connections/key_pair?id=${keyID}`).then(({ data }) => {
      setPublicKey(state => ({ ...state, [keyID]: data?.public_key }));
    });
  }, [keyID]);

  const [{ loading: addKeyLoading }, addKeyPair] = useAsyncFn(async () => {
    await api
      .post('/connections/key_pair', {
        connection_type: dsId,
        key_name: formApi?.watch('key_name'),
      })
      .then(({ data }) => {
        formApi.setValue(name, data?.key_file_name);
        setKeyID(getOId(data?.key_pair_id));
        getKeyOptions();
        setPublicKey(state => ({
          ...state,
          [getOId(data?.key_pair_id)]: data?.public_key,
        }));
      });
  }, [dsId, formApi, getKeyOptions, keyID, name]);

  const [{ loading: deleteLoading }, deleteSelectedKeyPair] = useAsyncFn(
    async keyID => {
      await api.delete(`/connections/key_pair?id=${keyID}`).then(() => {
        setKeyID(null);
        formApi.setValue(name, undefined);
        getKeyOptions();
      });
    },
    [setKeyID, getKeyOptions],
  );

  return (
    <Flex flexDir="column" gap={3}>
      <Grid
        templateColumns="200px repeat(3, min-content)"
        alignItems="end"
        gap={2}
      >
        <FormSelect
          name={name}
          api={formApi}
          options={options}
          label={display_name}
          controlId={name}
          {...rest}
          onSelect={o => setKeyID(o?.id)}
          {...(!keyID && { value: [] })}
        />
        <RenderGuard condition={Boolean(keyID)}>
          <RiveryButton
            label="Display public key"
            variant="default"
            onClick={() => getPublicKey()}
            isLoading={publicKeyLoading}
          />
        </RenderGuard>
        <RiveryButton
          variant="outlined-primary"
          label="Create new key pair"
          leftIcon={<Icon as={PlusIcon} />}
          onClick={() => {
            formApi.setValue(name, undefined);
            setKeyID(0);
          }}
        />
        <RenderGuard condition={Boolean(keyID)}>
          <RiveryButton
            label="Delete Key Pair"
            variant="default"
            colorScheme="danger"
            leftIcon={<Icon as={DeleteIcon} />}
            onClick={() => deleteSelectedKeyPair(keyID)}
            isLoading={deleteLoading}
          />
        </RenderGuard>
      </Grid>
      <RenderGuard condition={keyID !== null}>
        {publicKey[keyID] ? (
          <RiveryAlert variant="info" description={publicKey[keyID]} />
        ) : (
          <ComplexInputField
            inputProps={{
              label: 'Key Pair Name',
              name: 'key_name',
              placeholder: 'Select a name to your Key Pair',
              api: formApi,
            }}
            buttonProps={{
              label: 'Add',
              onClick: () => addKeyPair(),
              isLoading: addKeyLoading,
            }}
          />
        )}
      </RenderGuard>
    </Flex>
  );
}
