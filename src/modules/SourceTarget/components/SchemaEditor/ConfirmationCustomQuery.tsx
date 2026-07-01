import { RoutesBuilder } from 'app/routes';
import {
  ConfirmationModal,
  CustomQueryIcon,
  Icon,
  RiveryButton,
  useDisclosure,
} from 'components';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useCore } from 'store/core';
import { useIsDisabledRiverForm } from '../form';
import { getSourceFromAPIName, useDataSourcesSections } from 'modules';

const createSourceLegacyRoute = (accountId, envId, additionalParams) => ({
  pathname: RoutesBuilder.createRiverLegacy({
    accountId,
    envId,
  }),
  search: `?selected_river_type=src_to_trgt&${additionalParams}`,
});
export const ConfirmationCustomQuery = () => {
  const { envId, selectedAccountId } = useCore();
  const { push } = useHistory();
  const formData = useFormContext();
  const { entities: entitiesSource } = useDataSourcesSections('source');
  const { entities: entitiesTarget } = useDataSourcesSections('target');

  const changeToCustomQuery = () => {
    const riverProps = formData?.getValues('river')?.properties;
    const source = riverProps?.source;
    const target = riverProps?.target;
    const sourceId = getSourceFromAPIName(entitiesSource, source?.name)?.id;
    const targetId = getSourceFromAPIName(entitiesTarget, target?.name)?.id;
    const additionalParams = `run_type=custom_query&ds=${sourceId}&source_connection=${
      source?.connection_id
    }&target=${targetId}&target_params=${window.btoa(JSON.stringify(target))}`;
    push(createSourceLegacyRoute(selectedAccountId, envId, additionalParams));
  };
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isRiverFormDisabled = useIsDisabledRiverForm();
  return (
    <>
      <RiveryButton
        label="Custom Query"
        leftIcon={<Icon as={CustomQueryIcon} color="inherit" />}
        variant="transparent"
        color="primary"
        onClick={onOpen}
        isDisabled={isRiverFormDisabled}
        pl={1}
        pr={0}
        sx={{ '& span': { marginInlineEnd: '0.2rem' } }}
      />
      <ConfirmationModal
        show={isOpen}
        onClose={onClose}
        onConfirm={changeToCustomQuery}
        title="Switch Data Flow Mode"
        description={
          "You're about to switch your Data Flow Mode from Multi-Tables to Custom Query.\n" +
          'By switching mode, your schema configuration will be reset.'
        }
        confirmColorScheme="primary"
        variant="warning"
        confirmLabel="Switch Data Flow Mode"
      />
    </>
  );
};
