import {
  Box,
  CopyIcon,
  Divider,
  Flex,
  GridBox,
  Heading,
  Icon,
  IconButton,
  RiveryModal,
  RiveryModalProps,
  RiveryOverlay,
  Text,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Input } from 'components/Form';
import { RiveryCheckbox } from 'components/Form/components';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { EnableFeatureModal } from 'containers/Login/components/EnableFeatureModal';
import { useCopyToClipboardWithToast } from 'hooks/useCopyToClipboard';
import { useFocusFirstField } from 'hooks/useFocusFirstField';
import { useToastComponent } from 'hooks/useToast';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount } from 'store/core';
import { useCreateTokenMutation, useGetScopesQuery } from './tokens.query';
interface AddTokenModalProps extends RiveryModalProps {
  onAdd(data): void;
  allowApiAccess: boolean;
}
export const useApiTokens = () => {
  const { isSettingOn } = useAccount();
  const isBlocked = isSettingOn('block_api_access');
  return !isBlocked;
};
export function AddTokenModal({
  onAdd,
  allowApiAccess,
  ...rest
}: AddTokenModalProps) {
  const { data: scopes } = useGetScopesQuery(null);
  const defaultScopes = useMemo(() => {
    if (scopes) {
      return scopes.filter(scope => scope.is_default).map(scope => scope._id);
    }
  }, [scopes]);
  return allowApiAccess ? (
    <RiveryModal title="Create new API Token" {...rest}>
      <CreateToken
        scopes={scopes}
        defaultScopes={defaultScopes}
        toggle={rest.toggle}
        setNewToken={onAdd}
      />
    </RiveryModal>
  ) : (
    <EnableFeatureModal feature="api" show={rest.show} toggle={rest.toggle} />
  );
}

interface TokenAddedModalProps extends RiveryModalProps {
  data: { message: string; token_id: string };
  onAdd(data): void;
}

export function TokenAddedModal({
  data,
  onAdd,
  ...rest
}: TokenAddedModalProps) {
  return (
    <RiveryModal
      show
      onClose={() => onAdd(null)}
      footer={{
        cancelLabel: null,
        saveLabel: (
          <RiveryButton
            size="small"
            variant="primary"
            onClick={() => onAdd(null)}
            label="Done"
          />
        ),
      }}
      body={<TokenAdded data={data} />}
      title="Your new API Token"
      {...rest}
    />
  );
}

function TokenAdded({ data }) {
  const { copyToClipboard } = useCopyToClipboardWithToast();

  return (
    <GridBox gap={2} color="font">
      <div>You have successfully added a new access token.</div>
      <div>Please Copy the token now.</div>
      <Flex
        justifyContent="space-between"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.300"
        p={2}
        bg="background-secondary"
      >
        <Box overflow="auto" color="font">
          {data?.token_id}
        </Box>
        <RiveryOverlay description="Copy Token">
          <IconButton
            icon={<Icon as={CopyIcon} />}
            size="lg"
            variant="light"
            onClick={() => copyToClipboard(data?.token_id)}
            aria-label="copy"
            color="gray.400"
          />
        </RiveryOverlay>
      </Flex>
      <Box color="font">
        You will not be able to view this token again once you close this
        window, so be sure to store it securely.
      </Box>
    </GridBox>
  );
}

interface IAddToken {
  token_name: string;
  scopes: string[];
}

function CreateToken({ scopes, defaultScopes, toggle, setNewToken }) {
  const [create, { isLoading, status, data }] = useCreateTokenMutation();
  const { error } = useToastComponent();
  useEffect(() => {
    if (status === 'fulfilled' && data) {
      setNewToken(data);
    }
  }, [data, setNewToken, status]);

  const { handleSubmit, getValues, ...useFormApi } = useForm<IAddToken>({
    defaultValues: {
      token_name: '',
      ...defaultScopes?.reduce(
        (o, scope) => Object.assign(o, { [scope]: true }),
        {},
      ),
    },
    mode: 'onChange',
  });
  const onFormSubmit = async (formData: IAddToken) => {
    const { token_name } = formData;
    delete formData.token_name;
    const scopes = Object.entries(formData)
      .map(([key, value]) => (value ? key : null))
      .filter(scope => scope);
    const response: any = await create({ scopes, token_name });
    if (response?.error) {
      error({
        description:
          response?.error?.data?.reason || response?.error?.data?.message,
      });
    }
  };

  const selectAllScopes = useCallback(
    ({ target }) => {
      const { token_name, ...scopes } = getValues();
      const allScopes = Object.assign(
        Object.entries(scopes).reduce((acc, [key]) => {
          acc[key] = target.checked;
          return acc;
        }, {}),
        {},
      );
      useFormApi.reset({
        ...allScopes,
        token_name,
      });
    },
    [getValues, useFormApi],
  );

  useFocusFirstField(useFormApi, 'token_name');
  return (
    <Box as={'form'} onSubmit={handleSubmit(onFormSubmit)}>
      <RiveryModal.Body maxHeight="350px">
        <Flex flexDir="column" gap={3}>
          {isLoading ? <PageOverlaySpinner /> : null}
          <Input
            label="Token Name"
            placeholder="Type Token name"
            name="token_name"
            api={useFormApi}
            required="Token name is required"
            chakra
          />
          <Heading fontSize="13" color="font" fontWeight="medium">
            Scopes
          </Heading>
          <GridBox gap={4} overflow="auto" h="75%" pl={1}>
            <RiveryCheckbox
              name="all_scopes"
              label="Select All Scopes"
              aria-label="Select All Scopes"
              onChange={selectAllScopes}
              isChecked={
                Object.values(useFormApi?.watch()).filter(Boolean).length >=
                scopes?.length
              }
            />
            <Divider />
            {scopes?.map((scope, idx) => (
              <GridBox key={`${scope._id}-${idx}`}>
                <RiveryCheckbox
                  name={scope._id}
                  label={scope._id}
                  aria-label={`toggle ${scope._id}`}
                  api={useFormApi}
                />
                <Text fontSize="xs" color="font-secondary">
                  {scope.description}
                </Text>
              </GridBox>
            ))}
          </GridBox>
        </Flex>
      </RiveryModal.Body>
      <RiveryModal.Footer>
        <RiveryButton label="Cancel" variant="default" onClick={toggle} />
        <RiveryButton variant="primary" type="submit" label="Create" />
      </RiveryModal.Footer>
    </Box>
  );
}
