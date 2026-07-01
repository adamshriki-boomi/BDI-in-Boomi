import { RoutesBuilder } from 'app/routes';
import { Flex, Grid, RiveryButton } from 'components';
import { useRunComponentRenderer } from 'containers/River/new/source-to-target/components/RunControls';
import { SaveRiverButton } from 'containers/River/new/source-to-target/components/SaveRiverButton';
import { getQueryParams } from 'hooks/router';
import {
  useIsDisabledRiverForm,
  useIsneedReactivate,
  useIsRiverActive,
  useSttFormContext,
} from 'modules/SourceTarget';
import { Link } from 'react-router-dom';
import { useCore } from 'store/core';

export function RiverFooter({
  running,
  toggleRunning,
  reActivate,
  dismissReactivation,
}) {
  const { activeAccountId: account, envId: env } = useCore();
  const form = useSttFormContext();
  const {
    formState: { errors, isDirty },
  } = form;

  const isRiverActive = useIsRiverActive();
  const shouldReactivate = useIsneedReactivate(form);
  //When river needs reactivation, we don't want to allow just save
  const disableSaveWhenActive = isRiverActive && shouldReactivate;
  const hasErrors = errors && Object.keys(errors).length > 0;

  const isRiverFormDisabled = useIsDisabledRiverForm();

  const runComponents = useRunComponentRenderer(
    toggleRunning,
    reActivate,
    dismissReactivation,
  );

  const { tab } = getQueryParams(['tab']);

  return (
    <Flex
      flexDir="column"
      className={`source-to-target-river-${tab ?? 'summary'}`}
    >
      {runComponents.Bar}
      <Grid
        gridArea="footer"
        gridTemplateAreas="'close . save run'"
        gridTemplateColumns="auto 1fr auto auto"
        gridGap="4"
        p="3"
        borderTop="1px"
        borderTopColor="gray.300"
      >
        <RiveryButton
          gridArea="close"
          label="Close"
          variant="text"
          size="sm"
          as={Link}
          to={RoutesBuilder.rivers({ account, env })}
        />
        <SaveRiverButton
          label="Save Changes"
          isDisabled={[
            isRiverFormDisabled,
            hasErrors,
            running,
            disableSaveWhenActive,
            !isDirty,
          ].some(Boolean)}
        />
        {runComponents.Button}
      </Grid>
    </Flex>
  );
}
