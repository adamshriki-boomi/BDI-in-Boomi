import { RoutesBuilder, useAccountRoute } from 'app/routes';
import {
  Link as ChakraLink,
  GridBox,
  Icon,
  Icon404Default,
  Text,
  VStack,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import Icon404 from 'components/Icons/components/Icon404';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ErrorDetails } from './ErrorDetails';

type ErrorDisplayProps = {
  header: string;
  children: ReactNode | ReactNode[];
  onClick?: () => any;
  error?: any;
};
export function ErrorDisplay({
  header,
  children,
  onClick,
  error,
}: ErrorDisplayProps) {
  const riversRoute = useAccountRoute(RoutesBuilder.home);

  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  return (
    <GridBox overflow="hidden">
      <VStack justify="center" gap={1} mt={5} m="auto" w="50%">
        <Icon as={exoTheme ? Icon404Default : Icon404} boxSize="135px" />
        <Text textStyle="M4" color="primary">
          {header}
        </Text>
        <Text textAlign="center" m="0" textStyle="R6" color="font-secondary">
          {children}
        </Text>
        <ChakraLink as={Link} to={riversRoute} textDecoration="none">
          <RiveryButton label="Back to Homepage" onClick={onClick} />
        </ChakraLink>
        <ErrorDetails error={error} />
      </VStack>
    </GridBox>
  );
}
