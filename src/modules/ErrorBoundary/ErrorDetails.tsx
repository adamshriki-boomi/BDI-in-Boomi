import { Box } from 'components';
import React from 'react';

type ErrorDetailsProps = {
  error: Error;
};
export function ErrorDetails({ error }: ErrorDetailsProps) {
  const isDev = import.meta.env.NODE_ENV !== 'production';
  return isDev && error ? (
    <Box
      as="details"
      bgColor="red.50"
      p="4"
      width="50vw"
      cursor="pointer"
      whiteSpace="pre-wrap"
    >
      <code>{error && error?.message}</code>
      <br />
      <code>{error?.stack}</code>
    </Box>
  ) : null;
}
