import { Breadcrumbs, View } from 'components';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useToggle } from 'react-use';
import { AddTokenModal, TokenAddedModal, useApiTokens } from './AddTokenModal';
import { ApiTokensGrid } from './ApiTokensGrid';
import RevokeTokenModal from './RevokeTokenModal';
import ScopesModal from './ScopesModal';
import { useGetScopesQuery, useGetTokensQuery } from './tokens.query';
// import './Tokens.scss';

function useTokensState() {
  const [componentState, setComponentState] = useState<any>({
    selectedRow: null,
    selectedToken: null,
    newToken: null,
  });

  const handlers = React.useMemo(
    () => ({
      setSelectedRow: row => {
        setComponentState(state => ({ ...state, selectedRow: row }));
      },
      setSelectedToken: token => {
        setComponentState(state => ({
          ...state,
          selectedToken: token ? token : null,
        }));
      },
      setNewToken: token => {
        setComponentState(state => ({
          ...state,
          newToken: token ? token : null,
        }));
      },
    }),
    [],
  );

  return [componentState, handlers];
}

export function Tokens() {
  const { data, isLoading: tokensLoading } = useGetTokensQuery(null);
  const { isLoading: scopesLoadig } = useGetScopesQuery(null);
  const [
    { selectedRow, selectedToken, newToken },
    { setSelectedRow, setSelectedToken, setNewToken },
  ] = useTokensState();
  const allowApiAccess = useApiTokens();

  const [showRevokeModal, toggleRevokeModal] = useToggle(false);
  const [showNewTokenModal, toggleNewTokenModal] = useToggle(!allowApiAccess);

  useEffect(
    () => toggleRevokeModal(Boolean(selectedToken)),
    [selectedToken, toggleRevokeModal],
  );

  useEffect(() => {
    if (newToken) {
      toggleNewTokenModal(false);
    }
  }, [newToken, toggleNewTokenModal]);

  return (
    <View
      display="flex"
      flexDir="column"
      overflow="hidden"
      position="relative"
      p={4}
      pt={3}
    >
      <Breadcrumbs links={[{ label: 'Settings' }, { label: 'API Tokens' }]} />
      <ApiTokensGrid
        loading={tokensLoading || scopesLoadig}
        data={data}
        setSelectedRow={setSelectedRow}
        setToken={setSelectedToken}
        toggleNewTokenModal={toggleNewTokenModal}
      />
      {selectedRow && (
        <ScopesModal value={selectedRow} onChange={setSelectedRow} />
      )}
      <RevokeTokenModal
        show={showRevokeModal}
        toggle={toggleRevokeModal}
        value={selectedToken}
        onChange={setSelectedToken}
      />
      <AddTokenModal
        show={showNewTokenModal}
        toggle={toggleNewTokenModal}
        onAdd={setNewToken}
        allowApiAccess={allowApiAccess}
      />
      {newToken && <TokenAddedModal onAdd={setNewToken} data={newToken} />}
    </View>
  );
}
