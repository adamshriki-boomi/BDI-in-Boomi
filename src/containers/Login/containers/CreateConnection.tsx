import { Box, Center, Flex } from '@chakra-ui/react';
import { setAPISAuthorizations } from 'api/api.interceptors';
import {
  EmptyConnection,
  ExternalLink,
  Icon,
  Icon404Default,
  RenderGuard,
  RiveryButton,
  RiveryModal,
  RTextLogoDark,
  Text,
  ThankYouIcon,
} from 'components';
import { OldAppIframe } from 'components/OldApp/OldAppIframe';
import { ConnectionModalWindow, useGetConnectionDetailsQuery } from 'modules';
import queryString from 'query-string';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToggle } from 'react-use';
import { BoomiColorHeader } from '../components/BoomiColorHeader';

export function CreateConnection() {
  const { state } = useLocation<any>();
  const url = queryString.stringify(state?.data);
  const token = state?.data?.token;

  useEffect(() => {
    //Taking the token parameter from the url and set it in our headers
    setAPISAuthorizations(`Bearer ${token}`);
  }, [token]);

  const { data, isLoading } = useGetConnectionDetailsQuery(state?.data);
  const isReactShareConnection =
    data?.properties?.[data?.ds_name]?.connection_generic_pattern === true ||
    !data?.properties; //if merged to react or has expired
  return isLoading ? null : isReactShareConnection ? (
    <ShareConnection connectionInfo={data} />
  ) : (
    <OldAppIframe
      params={url}
      useIframeParam={true}
      position="fixed"
      top={0}
      bottom={0}
      m={0}
      height="100vh"
      width="100vw"
    />
  );
}

export const ShareConnection = ({ connectionInfo }) => {
  const dataSourceId = connectionInfo?.ds_name;
  const username = connectionInfo?.user_name;
  const ds = connectionInfo?.properties?.[dataSourceId];
  const [connectionModalOpened, toggleConnectionModal] = useToggle(
    Boolean(connectionInfo),
  );
  const [connectionSaved, toggleConnectionSaved] = useToggle(Boolean(false));
  const connectionType = ds?.connection_type;

  return (
    <Box justifyContent="center" w="full">
      <HeaderTopShareConnection />
      <Center height="80vh">
        {connectionModalOpened ? (
          connectionInfo ? (
            <ThanksViking connectionSaved={connectionSaved} />
          ) : null
        ) : connectionInfo ? (
          <ThanksViking connectionSaved={connectionSaved} />
        ) : (
          <OhViking />
        )}
        <ConnectionModalWindow
          header={`${ds?.name} Connection`}
          connectionType={connectionType}
          dataSourceId={dataSourceId}
          showModal={connectionModalOpened}
          toggleModal={() => {
            toggleConnectionModal(null);
            toggleConnectionSaved(true);
          }}
          onSave={() => null}
          isEditMode={false}
          crossId={null}
        />
        {connectionModalOpened && (
          <ModalShareConnectionWelcome username={username} />
        )}
      </Center>
    </Box>
  );
};

const ThanksViking = ({ connectionSaved }) => {
  return connectionSaved ? (
    <Flex flexDir="column" alignItems="center" textAlign="center">
      <Icon as={ThankYouIcon} boxSize="100px" display="block" />
      <Text textStyle="B1" my={2} color="brand">
        Thank You!
      </Text>
      <>
        <Text display="inline">For more information, visit</Text>
        <ExternalLink
          fontSize="md"
          display="inline"
          label="Boomi Data Integration"
          url="https://rivery.io/"
        />
      </>
    </Flex>
  ) : null;
};

const OhViking = () => {
  return (
    <Flex flexDir="column" alignItems="center" textAlign="center">
      <Icon as={Icon404Default} mt={10} boxSize="100px" display="block" />
      <Text textStyle="M4" my={2} color="font">
        Whoops, that’s an expired link
      </Text>
      <Text color="font-secondary" textStyle="R6" display="inline">
        Please contact the person who shared this link and request a new one.
      </Text>
    </Flex>
  );
};

const HeaderTopShareConnection = () => {
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  return (
    <RenderGuard
      condition={exoTheme}
      fallback={
        <Flex
          position="sticky"
          background="brand"
          height="50px"
          alignItems="center"
          justifyContent="space-between"
          px={7}
        >
          <RiveryButton
            leftIcon={
              <Icon mt={1} as={RTextLogoDark} height="50px" width="155px" />
            }
            href="https://rivery.io"
            target="_blank"
            variant="link"
            label=""
            aria-label="link to Boomi Data Integration website"
            size="small"
          />
          <Text
            color="yellow.200"
            fontFamily="Modelica"
            textAlign="right"
            fontSize="medium"
            fontWeight="600"
          >
            The Complete SaaS ELT
          </Text>
        </Flex>
      }
    >
      <BoomiColorHeader
        rightLinks={
          <Text textAlign="right" textStyle="M6">
            The Complete SaaS ELT
          </Text>
        }
      />
    </RenderGuard>
  );
};

export const useCheckIfShareConnectionMode = () => {
  const { pathname: url } = useLocation();
  return url.replace('-', '_').indexOf('create_connection') >= 0;
};

export const ModalShareConnectionWelcome = ({ username }) => {
  const [isOpen, toggleModal] = useToggle(true);
  return (
    <RiveryModal
      show={isOpen}
      toggle={toggleModal}
      footer={{
        saveLabel: 'Create Connection',
        cancelLabel: false,
      }}
      title="Creating a Connection"
      body={
        <Flex gap={3} alignItems="center">
          <Box>
            Can you help {username} in creating a connection in Boomi Data
            Integration? To ensure a proper connection, please enter the
            necessary details.
          </Box>
          <Icon as={EmptyConnection} boxSize="100px" />
        </Flex>
      }
    />
  );
};
