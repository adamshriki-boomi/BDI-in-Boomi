import {
  ConnectionTypes,
  ControlList,
  IConnection,
  IDataSourceConnection,
} from 'api/types';
import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  ExternalLink,
  Flex,
  Grid,
  GridBox,
  HStack,
  Icon,
  ModalBody,
  PageOverlaySpinner,
  ShareLink,
  Text,
} from 'components';
import RiveryButton, {
  RiveryButtonProps,
} from 'components/Buttons/RiveryButton';
import { FileZoneInput, FormRenderer, InputTypes } from 'components/Form';
import { useCheckIfShareConnectionMode } from 'containers/Login/containers/CreateConnection';
import {
  DATA_CONNECTIONS,
  ONBOARDING_ADD_CONNECTION,
} from 'containers/Onboarding/consts';
import { useUpdateOnboardingStep } from 'hooks/useUpdateOnboardingStep';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { MdOpenInNew } from 'react-icons/md';
import { useToggle } from 'react-use';
import { ConnectionModalFooter } from './ConnectionModalFooter';
import { ModalHeader } from './ModalHeader';
import { useGetConnectionQuery } from './store';
import { useSource } from './useSource';
import { WhitelistIps } from './WhitelistIps';

export enum Mode {
  EDIT,
  NEW,
}
type Props = {
  header: string;
  mode?: Mode;
  type: string;
  dataSourceId: string;
  // required for Edit mode
  crossId?: string;
  buttonProps?: RiveryButtonProps;
  onSave?: (props?: any) => any;
  onTest?: (item: any) => any;
  children?: ReactNode;
  setConnection?: any;
  useNewConnectionBar?: boolean;
  configuration?: Record<string, any>;
};

ConnectionModal.Mode = Mode;
export function ConnectionModal({
  header,
  type: connectionType,
  dataSourceId,
  crossId,
  mode = null,
  onSave,
  setConnection,
  children,
  buttonProps,
  useNewConnectionBar = false,
  //Added for a custom configuration of blueprint connection which is different from the others
  configuration,
}: Props) {
  const [showModal, toggleModal] = useToggle(false);
  const isEditMode = mode === Mode.EDIT;
  const handleOnOpen = useCallback(async () => {
    toggleModal(true);
  }, [toggleModal]);

  useEffect(() => {
    if (mode !== null && useNewConnectionBar) {
      handleOnOpen();
    }
  }, [crossId, handleOnOpen, mode, useNewConnectionBar]);

  useEffect(() => {
    if (!showModal && useNewConnectionBar) {
      setConnection(null);
    }
  }, [setConnection, showModal, useNewConnectionBar]);
  return (
    <>
      {!useNewConnectionBar ? (
        <RiveryButton
          label={children}
          onClick={handleOnOpen}
          {...buttonProps}
        />
      ) : null}
      <ConnectionModalWindow
        showModal={showModal}
        toggleModal={toggleModal}
        header={header}
        dataSourceId={dataSourceId}
        crossId={crossId}
        connectionType={connectionType}
        isEditMode={isEditMode}
        onSave={onSave}
        configuration={configuration}
      />
    </>
  );
}

export const ConnectionModalWindow = ({
  showModal,
  toggleModal,
  onSave,
  header,
  connectionType,
  isEditMode,
  dataSourceId,
  crossId,
  configuration = null,
}) => {
  const { updateStep } = useUpdateOnboardingStep(
    DATA_CONNECTIONS,
    ONBOARDING_ADD_CONNECTION,
  );
  const [isSaving, setIsSaving] = useState(false);

  const closeModal = () => {
    toggleModal(false);
  };
  const dataSource = useSource({
    crossId,
    connectionType,
    dataSourceId,
    isEditMode,
    skip: !showModal,
  });

  const { data: selectedConnection } = useGetConnectionQuery(crossId, {
    skip: !crossId,
  });

  const blueprintConnectionConfiguration = useMemo(
    () =>
      configuration
        ? configuration
        : selectedConnection?.connection_type === 'blueprint_custom'
        ? { fields: selectedConnection?.connection_details }
        : false,
    [
      configuration,
      selectedConnection?.connection_details,
      selectedConnection?.connection_type,
    ],
  );

  const handleOnSave = async formData => {
    let data;
    if (blueprintConnectionConfiguration) {
      const { connection_name = '', connection_type = '', ...rest } = formData;

      const connection_details = blueprintConnectionConfiguration.fields.reduce(
        (acc, field) => {
          if (rest.hasOwnProperty(field.name)) {
            let connectionField = {};
            connectionField['type'] = field.is_password
              ? ControlList.PASSWORD
              : field.type;
            connectionField['is_password'] = field.is_password;
            connectionField['label'] = field.name;
            connectionField['key'] = field.name;
            connectionField['value'] = rest[field.name];
            connectionField['name'] = field.name;
            connectionField['connection_name'] = connection_name;
            connectionField['is_hidden'] = field?.is_hidden ?? false;
            acc.push(connectionField);
          }
          return acc;
        },
        [],
      );
      data = {
        connection_name,
        connection_type,
        connection_details,
        ds_name: 'connector_executor',
        ...(selectedConnection?._id && { cross_id: selectedConnection._id }),
      };
    } else {
      data = formData;
    }
    setIsSaving(true);
    await dataSource
      .saveConnection(data)
      .then(res => {
        updateStep();
        closeModal();
        onSave(res);
        setIsSaving(false);
      })
      .catch(e => {
        setIsSaving(false);
        throw e;
      });
  };
  const { source, isLoading } = dataSource;
  const prefix = !isEditMode ? 'Create ' : '';
  const modalHeader = `${prefix}${header}`;
  const isFromShareConnection = useCheckIfShareConnectionMode();
  const [
    showShareLink,
    showTestConnection,
    showFileZone,
    showWhiteList,
    showConnectionGuidance,
  ] = resolveSourceFeatures(source, isEditMode);
  const blueprintFormData = useMemo(() => {
    return {
      ...buildDefaultsFromConfig(
        blueprintConnectionConfiguration,
        selectedConnection,
      ),
      ...selectedConnection,
      connection_type: connectionType,
      connection_name:
        blueprintConnectionConfiguration?.fields?.[0]?.connection_name,
    };
  }, [blueprintConnectionConfiguration, connectionType, selectedConnection]);
  return (
    <Drawer
      isOpen={showModal}
      onClose={closeModal}
      aria-label="connection modal"
      variant="semifull"
      placement="right"
      closeOnOverlayClick={false}
    >
      <DrawerOverlay />
      <DrawerContent overflow="hidden">
        <ModalHeader
          header={modalHeader}
          icon={source?.icon}
          onClose={isFromShareConnection ? null : closeModal}
          style={{ pl: 4 }}
        />
        {isLoading ? <PageOverlaySpinner /> : null}
        <FormRenderer
          formMetadata={{ dsId: source?.id, icon: source?.icon }}
          controls={
            Boolean(blueprintConnectionConfiguration)
              ? buildFieldsFromConfig(blueprintConnectionConfiguration)
              : dataSource.sourceControls
          }
          formData={
            Boolean(blueprintConnectionConfiguration)
              ? blueprintFormData
              : dataSource.connectionDraft
          }
          onSubmit={handleOnSave}
          display={isLoading ? 'none' : 'flex'}
          flexDir="column"
          overflow="auto"
          flexGrow={1}
          external
          render={({ form, useFormApi }) => {
            // This was added in order to dismiis html validation on required fields
            document
              .getElementsByTagName('form')?.[0]
              ?.setAttribute('novalidate', 'true');

            return (
              <ModalBody
                overflow="hidden"
                flex="1"
                display="flex"
                flexDir="column"
                p={4}
                pb={8}
              >
                <Flex justifyContent="space-between">
                  <Flex pl={4}>
                    <Flex flexDir="column">
                      <Text color="font-secondary" fontSize="sm">
                        Enter Connection details and credentials to add a new
                        connection.
                      </Text>
                      {showWhiteList && <WhitelistIps />}
                      {showConnectionGuidance && (
                        <ConnectionGuidance html={source.connection_guidance} />
                      )}
                    </Flex>
                  </Flex>
                  <Flex>
                    {showShareLink && !isFromShareConnection && (
                      <ShareLink dsId={source?.id} />
                    )}
                  </Flex>
                </Flex>
                <GridBox
                  templateColumns="minmax(45%, 500px) 1fr"
                  flex="1"
                  height="full"
                  overflow="hidden"
                >
                  <Grid overflow="hidden" gap={3} pr={4}>
                    <Box mx="auto" flex="1" overflow="auto" w="full" px="4">
                      <GridBox gap={4} maxW="630px" px="0" mx="auto" mt={2}>
                        {form}
                        {showFileZone && (
                          <FileZoneInput
                            control={useFormApi.control}
                            toggleName="custom_fz"
                            filezoneName="fz_connection_id"
                            defaultBucketFieldName="default_bucket"
                            connectionType={connectionType}
                            dataSourceId={source?.id}
                          />
                        )}
                      </GridBox>
                    </Box>
                    <ConnectionModalFooter
                      showTestConnection={showTestConnection}
                      isSaving={isSaving}
                      connectionType={connectionType}
                      connection={useFormApi.watch() as IConnection}
                      onCancel={isFromShareConnection ? null : closeModal}
                    />
                  </Grid>
                  <ConnectionDoc docUrl={source?.doc_url} />
                </GridBox>
              </ModalBody>
            );
          }}
        />
      </DrawerContent>
    </Drawer>
  );
};

function ConnectionGuidance({ html }: { html: string }) {
  if (!html) return null;

  return (
    <Box
      mt={2}
      color="font-secondary"
      fontSize="sm"
      sx={{
        a: {
          color: 'blue.500',
          textDecoration: 'underline',
        },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ConnectionDoc({ docUrl = '/#' }) {
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  const boomiView = exoTheme ? '&boomi_view=true&' : '';
  return (
    <Box bg="background-secondary" position="relative" mt={0}>
      <ExternalLink
        label="Read More"
        icon={<Icon as={MdOpenInNew} />}
        url={docUrl}
        position="absolute"
        top={4}
        right={8}
      />
      <HStack overflow="hidden" h="100%" m={0}>
        <Box
          as="iframe"
          src={`${docUrl}?rivery_view=true${boomiView}&embed=true&navigate-on-blank=true`}
          title="documentation-iframe"
          border="0"
          w="full"
          h="full"
          role="application"
          aria-label="connection documentation"
        />
      </HStack>
    </Box>
  );
}

function resolveSourceFeatures(
  source: IDataSourceConnection,
  isEditMode: boolean,
) {
  return [
    !isEditMode,
    source?.is_test_connection,
    source?.is_fz_connection &&
      ![ConnectionTypes.GCLOUD, ConnectionTypes.BQ_SRC].includes(
        source.connection_type as ConnectionTypes,
      ),
    source?.whitelist_ip_msg,
    source?.connection_guidance,
  ].map(Boolean);
}

const buildFieldsFromConfig = config => {
  const form = [
    {
      display_name: 'Connection Name',
      name: 'connection_name',
      placeholder: 'Connection Name',
      required: true,
      chakra: true,
      type: InputTypes.TEXT,
    },
  ];
  const customFields = Array.isArray(config?.fields)
    ? config?.fields?.map(
        ({ name, type, is_password = null, is_hidden = false }) => {
          return {
            name,
            type: is_password
              ? InputTypes.PASSWORD
              : type === 'string'
              ? InputTypes.TEXT
              : InputTypes.NUMBER,
            display_name: name,
            chakra: true,
            is_hidden,
          };
        },
      )
    : [];
  return [...form, ...customFields];
};

const buildDefaultsFromConfig = (config, selectedConnection) => {
  const connectionDetails = selectedConnection?.connection_details;
  let defaults;
  defaults = config?.fields?.reduce((acc, { name, value = null }, index) => {
    acc[name] = value;
    if (connectionDetails?.[index]) {
      acc[`${name}_exists`] = connectionDetails[index][`${name}_exists`];
      acc[`is_${name}_encrypted`] =
        connectionDetails[index][`is_${name}_encrypted`];
    }
    return acc;
  }, {});

  return defaults;
};
