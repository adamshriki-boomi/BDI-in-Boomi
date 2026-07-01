import { RiverTypes } from 'api/types';
import { isEnvFeatureActive } from 'components';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { RiverNotFound } from 'modules';
import { lazy, Suspense, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from 'store/core';
import { useRiver, useRiverActions } from 'store/river';
import { useRiverLoader } from './hooks/useRiverLoader';
import { routes } from './RiverLogic';

const RiverBox = lazy(() => import('./components/RiverBox'));
const RiverSourceToTarget = lazy(() => import('./RiverSourceToTarget'));

export default function River() {
  useRiverSelector();
  const { isSettingOn } = useAccount();
  const { riverType, crossId } = useRiverLoader();
  const { isProcessing } = useRiver();
  const showSpinner = typeof isProcessing === 'undefined' || isProcessing;

  return crossId ? (
    <Suspense fallback={<PageOverlaySpinner />}>
      <RiverRenderer
        type={riverType}
        newStt={isSettingOn('allow_create_new_stt')}
      />
    </Suspense>
  ) : showSpinner ? (
    <PageOverlaySpinner />
  ) : (
    <RiverNotFound />
  );
}

const addSttRenderer = newStt =>
  isEnvFeatureActive('STT') || newStt
    ? {
        [RiverTypes.SOURCE_TO_TARGET]: () => <RiverSourceToTarget />,
        [RiverTypes.SOURCE_TO_FZ]: () => <RiverSourceToTarget />,
      }
    : null;

const RiverRenderer = ({ type, newStt }) => {
  const RiverTypesRenderer = {
    [RiverTypes.LOGIC]: () => (
      <Suspense fallback={<PageOverlaySpinner />}>
        <RiverBox routes={routes} />
      </Suspense>
    ),
    ...addSttRenderer(newStt),
  };
  return RiverTypesRenderer[type] ? RiverTypesRenderer[type]() : null;
};

export function useRiverSelector() {
  const { river: riverId } = useParams<any>();
  const { selectRiver } = useRiverActions();

  useEffect(() => {
    selectRiver(riverId);
  }, [riverId, selectRiver]);
}
