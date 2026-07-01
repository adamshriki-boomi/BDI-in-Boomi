import { Flex, RenderGuard, Spinner } from 'components';
import { ExLoader, LoaderSize } from '@boomi/exosphere';
import React from 'react';

export const LoaderSpin = ({ height }) => {
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  return (
    <Flex
      position="absolute"
      alignItems="center"
      w="full"
      color="brand"
      style={{ height }}
    >
      <RenderGuard condition={exoTheme} fallback={<Spinner m="auto" />}>
        <ExLoader size={LoaderSize.MEDIUM} label="Loading..." />
      </RenderGuard>
    </Flex>
  );
};

export const PageOverlaySpinner = () => {
  return (
    <Flex
      position="absolute"
      justifyContent="center"
      alignItems="center"
      opacity="0.9"
      w="full"
      inset="0"
      zIndex="modal"
      bgColor="background-secondary"
    >
      <ExLoader size={LoaderSize.MEDIUM} leadingIconLabel="Loading..." />
    </Flex>
  );
};

export const ResultsPanelInnerSpinner = ({ ...props }) => {
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  return (
    <Flex
      position="absolute"
      justifyContent="center"
      opacity="0.8"
      w="full"
      bgColor="background-secondary"
      h="inherit"
      pt="100px"
      zIndex={1}
      {...props}
    >
      <RenderGuard condition={exoTheme} fallback={<Spinner />}>
        <ExLoader size={LoaderSize.MEDIUM} label="Loading..." />
      </RenderGuard>
    </Flex>
  );
};
