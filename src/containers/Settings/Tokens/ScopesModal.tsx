import { GridBox, RiveryModal, RiveryModalProps, Text } from 'components';
import { useMemo } from 'react';
import { compare } from 'utils/array.utils';
import { ITokenData, useGetScopesQuery } from './tokens.query';

interface ScopesModalProps extends RiveryModalProps {
  value: ITokenData;
  onChange(ITokenData): void;
}

export default function ScopesModal({
  value,
  onChange,
  ...rest
}: ScopesModalProps) {
  const { data: scopes } = useGetScopesQuery(null);
  const viewScopes = useMemo(() => {
    if (value) {
      const currentScopes = Object.values(value.scopes)
        .flat()
        .map(eachScope => {
          const scope = scopes.find(compare('_id', eachScope));
          const description = scope?.description;
          return { value: [eachScope], description };
        });
      return currentScopes;
    }
  }, [scopes, value]);

  return (
    <RiveryModal
      show
      onClose={() => onChange(null)}
      title={`Token ${value?.token_name}`}
      {...rest}
    >
      <GridBox p={6} overflow="auto" gap={4}>
        {viewScopes?.map((scope, idx) => (
          <GridBox key={`${scope.value}-${idx}`}>
            <Text fontWeight="600" color="font">
              {scope.value}
            </Text>
            <Text color="font-secondary">{scope.description}</Text>
          </GridBox>
        ))}
      </GridBox>
    </RiveryModal>
  );
}
