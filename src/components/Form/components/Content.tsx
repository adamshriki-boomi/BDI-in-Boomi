import { Alert, AlertDescription } from 'components';
import React from 'react';

export type ContentProps = {
  content: string;
  display_name?: string;
  /*
    bootstrap variant style, default: 'info'
  */
  variant?: 'primary' | 'error-light' | 'warning-light' | 'success-contained';
};

export function Content({
  content,
  display_name = null,
  variant = 'primary',
}: ContentProps) {
  return (
    <Alert variant={variant}>
      <AlertDescription dangerouslySetInnerHTML={{ __html: display_name }} />
    </Alert>
  );
}
