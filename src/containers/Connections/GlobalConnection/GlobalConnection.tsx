import { RoutesBuilder } from 'app/routes';
import {
  Button,
  Center,
  CloseIconButton,
  Flex,
  HStack,
  Icon,
  Image,
  RiveryButton,
  RiveryModal,
  S2TIcon,
  Text,
} from 'components';
import { ConnectionIcon } from 'containers/AuditLog/icons';
import { EnableFeatureModal } from 'containers/Login/components/EnableFeatureModal';
import { LoginRoutes } from 'containers/Login/LoginRoutes';
import { ModalVideoDisplay } from 'containers/Onboarding/components/VideoModal';
import { ConnectionModalWindow, FormTypes, ModalForm } from 'modules';
import { useCallback, useEffect, useState } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useAccount, useCore } from 'store/core/hooks';
import { getCrossId } from 'utils/api.sanitizer';
import Congrats from '../../../components/Image/Congratulations-Icon.svg';

export enum EventTypes {
  EDIT_CONNECTION = 'edit_connection',
  CREATE_CONNECTION = 'create_connection',
  CONGRATS_CONNECTION = 'congrats_popup',
  MODAL_VIDEO = 'modal_video',
  CONTACT_US = 'contact_us',
  CONTACT_US_SOURCE = 'contact_us_source',
  PLG_POPUP = 'plg_popup',
}

const EventsMapper =
  setInfo =>
  ({ data }) => {
    if (
      Object.values(EventTypes).some(value => data?.type?.startsWith(value))
    ) {
      setInfo(data);
    }
  };

const useSendPosMessage = () => {
  const iframe = (document.querySelector('iframe') as HTMLIFrameElement)
    ?.contentWindow;

  return element => iframe?.postMessage(element, window.location.href);
};

export const ConnectionGlobal = () => {
  const [connectionInfo, setConnectionInfo] = useState(null);
  useEffect(() => {
    const messageHandler = EventsMapper(setConnectionInfo);
    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);
  const sendCallback = useSendPosMessage();
  const onSave = event => {
    sendCallback({
      crossId: getCrossId(event),
      is_target: connectionInfo?.data?.is_target,
      connectionType: connectionInfo?.data?.connectionType,
      type: `${connectionInfo?.type}_callback`,
    });
  };
  return (
    <>
      <ConnectionModalWindow
        showModal={
          connectionInfo &&
          [EventTypes.CREATE_CONNECTION, EventTypes.EDIT_CONNECTION].some(
            value => connectionInfo?.type.startsWith(value),
          )
        }
        toggleModal={() => {
          setConnectionInfo(null);
        }}
        onSave={onSave}
        isEditMode={
          connectionInfo?.type.indexOf(EventTypes.EDIT_CONNECTION) >= 0
        }
        {...connectionInfo?.data}
      />
      <ConnectionDoneDialog
        showModal={
          connectionInfo &&
          connectionInfo?.type === EventTypes.CONGRATS_CONNECTION
        }
      />
      <ModalVideoDisplay
        show={connectionInfo && connectionInfo?.type === EventTypes.MODAL_VIDEO}
        toggle={() => {
          setConnectionInfo(null);
        }}
        setWatchVideo={undefined}
        title={connectionInfo?.data?.title}
        brightcoveVideoId={connectionInfo?.data?.brightcoveVideoId}
      />
      <ModalForm
        title="Talk To Sales"
        show={connectionInfo && connectionInfo?.type === EventTypes.CONTACT_US}
        toggle={() => setConnectionInfo(null)}
        type={FormTypes.CONTACT}
        clickData={{ message: connectionInfo?.data?.message }}
      />
      <ModalForm
        title="Contact us for connector access"
        show={
          connectionInfo &&
          connectionInfo?.type === EventTypes.CONTACT_US_SOURCE
        }
        toggle={() => setConnectionInfo(null)}
        type={FormTypes.CONTACT_SOURCE}
        clickData={{
          message: connectionInfo?.data?.message,
          riveryRequestedDataSource: connectionInfo?.data?.datasources,
        }}
      />
      <EnableFeatureModal
        feature={connectionInfo?.data?.feature}
        show={connectionInfo?.type === EventTypes.PLG_POPUP}
        toggle={() => setConnectionInfo(null)}
      />
    </>
  );
};

export function ConnectionDoneDialog({ showModal }) {
  const [show, toggleShow] = useToggle(true);
  const { envId, selectedAccountId: accountId, isAccountInTrial } = useCore();
  const { push } = useHistory();
  const { isSettingOn } = useAccount();

  const createRiverPipeline = useCallback(() => {
    toggleShow(false);
    push({
      pathname: isSettingOn('allow_create_new_stt')
        ? RoutesBuilder.sourceToTarget({ env: envId, account: accountId })
        : RoutesBuilder.createRiverLegacy({ envId, accountId }),
      search: '?create_first_river=true',
    });
  }, [accountId, envId, isSettingOn, push, toggleShow]);
  return (
    <RiveryModal headerLess show={show && showModal && isAccountInTrial}>
      <Center
        flexDir="column"
        bg="background-secondary"
        gap={4}
        px={6}
        pt={12}
        pb={4}
        borderRadius={4}
      >
        <CloseIconButton
          onClick={toggleShow}
          aria-label="close"
          position="absolute"
          right="2"
          top="2"
        />
        <Image src={Congrats} />
        <Flex flexDir="column" alignItems="center" gap={2}>
          <Text textStyle="M4" color="purple.300">
            Congrats!
          </Text>
          <Text textStyle="R7">
            You've created a connection. What's your next move?
          </Text>
        </Flex>
        <HStack gap={2} textStyle="R7">
          <Option onAction={toggleShow}>
            <Icon as={ConnectionIcon} boxSize="22px" />
            <Text>Add Another Connection</Text>
          </Option>
          <Option onAction={createRiverPipeline}>
            <Icon as={S2TIcon} boxSize="22px" />
            <Text>Create Your First Data Pipeline</Text>
          </Option>
        </HStack>
        <RiveryButton
          label="Return to Onboarding"
          variant="text"
          color="purple.400"
          onClick={() => {
            toggleShow(false);
            push(generatePath(LoginRoutes.ONBOARDING));
          }}
        />
      </Center>
    </RiveryModal>
  );
}

function Option({ children, onAction }) {
  return (
    <Flex
      flexDir="column"
      as={Button}
      gap={3}
      border="1px solid"
      borderColor="gray.300"
      borderRadius={4}
      h="115px"
      w="175px"
      whiteSpace="initial"
      textStyle="R7"
      onClick={onAction}
    >
      {children}
    </Flex>
  );
}
