import {
  AlertDescription,
  AlertIcon,
  AlertProps,
  AlertTitle,
  HStack,
} from '@chakra-ui/react';
import { Alert, ExclamationCircle } from 'components';
import { ReactNode } from 'react';

interface IRiveryAlert extends AlertProps {
  variant:
    | 'error-light'
    | 'warning-light'
    | 'success-contained'
    | 'info'
    | 'secondary';
  icon?: any;
  title?: string;
  description?: ReactNode;
}

export default function RiveryAlert({
  variant,
  icon = ExclamationCircle,
  title,
  description,
  ...rest
}: IRiveryAlert) {
  return (
    <Alert
      variant={variant}
      flexDir={title ? 'column' : 'unset'}
      alignItems={title ? 'start!important' : 'unset'}
      gap={1}
      {...rest}
    >
      {title && (
        <HStack>
          <AlertIcon mt={1} boxSize={4} as={icon} marginInlineEnd={0} />
          <AlertTitle textStyle="M6" fontWeight="medium!important">
            {title}
          </AlertTitle>
        </HStack>
      )}
      <HStack>
        {!title && (
          <AlertIcon mt={0.5} boxSize={4} as={icon} marginInlineEnd={0} />
        )}
        <AlertDescription whiteSpace="break-spaces" lineHeight="20px">
          {description}
        </AlertDescription>
      </HStack>
    </Alert>
  );
}
