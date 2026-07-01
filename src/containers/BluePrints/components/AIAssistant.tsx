import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  Grid,
  HStack,
} from '@chakra-ui/react';
import {
  Bot,
  Box,
  Flex,
  Icon,
  InfoTooltip,
  RdsCoPilot,
  RenderGuard,
  RiveryButton,
  Sparkles,
  Text,
} from 'components';
import { Input } from 'components/Form';
import { Tagger } from 'components/Tracking/Tagger';
import { useToastComponent } from 'hooks/useToast';
import { useCallback, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useEffectOnce, useInterval, useToggle } from 'react-use';
import { displayDate } from 'utils/date.utils';
import { RiverCreationTags } from 'utils/tracking.tags';
import {
  useCopilotChatMutation,
  useLazyCopilotChatStatusQuery,
} from '../blueprints.query';
import { ActionTypeEnum, useSaveBlueprint } from '../helpers';
import BlueprintLoader from './BlueprintLoader';
import SelectBlueprint from './SelectRecipeDropdown';

export function BlueprintForS2t({ chatId = null }) {
  const s2tFormContext = useFormContext();
  const formData = s2tFormContext?.watch();
  const { field: blueprintField } = useController({
    name: 'blueprint',
    control: s2tFormContext.control,
  });
  const { field: blueprintIdField } = useController({
    name: 'river.properties.source.additional_settings.recipe_id',
    control: s2tFormContext.control,
  });
  const { error } = useToastComponent();
  const [getChatStatus, { data: chatStatus }] = useLazyCopilotChatStatusQuery();
  const [validationStatusResponse, setValidationError] = useState(null);
  const [generating, setGenerating] = useToggle(false);
  const [sendMessage, { data: chat }] = useCopilotChatMutation();

  const { saveBlueprint, loading: saving } = useSaveBlueprint(
    ActionTypeEnum.ADD,
    id => blueprintIdField.onChange(id),
  );

  const handleSuccess = useCallback(
    data => {
      if (data?.status === 'failed') {
        error({
          description:
            'We failed to generate the requeseted YAML. Please try again.',
        });
        setGenerating(false);
      }
      if (data?.status === 'success') {
        blueprintField.onChange({
          ...blueprintField.value,
          yaml: data?.yaml,
        });
        saveBlueprint(
          data?.yaml,
          (formData as any).blueprint.blueprint_name,
          '',
          null,
          null,
        );
        setGenerating(false);
      }
    },
    [blueprintField, error, formData, saveBlueprint, setGenerating],
  );

  //When chat id is in url - pull status
  useEffectOnce(() => {
    if (chatId) {
      getChatStatus({ chat_id: chatId }).then(({ data }) =>
        handleSuccess(data),
      );
    }
  });

  const pullCopilotResponse = useCallback(
    chat_id => {
      getChatStatus({ chat_id });
    },
    [getChatStatus],
  );

  //If prompt is valid - pull status with interval
  useInterval(
    () => {
      if (!validationStatusResponse) {
        getChatStatus({ chat_id: chat?.chat_id })
          .then(({ data }: any) => {
            handleSuccess(data);
          })
          .catch(err => {
            console.log(err);
            error({
              description:
                'We failed to generate the requeseted YAML. Please try again.',
            });
          });
      }
    },
    chatStatus?.status === 'running' ? 3000 : null,
  );

  const generate = useCallback(
    async (doc_url, report) => {
      setValidationError(null);
      setGenerating(true);
      const chat: any = await sendMessage({ doc_url, report });
      if (chat?.error) {
        setValidationError(true);
        error({
          description:
            'We failed to generate a YAML file with the given specifications. Please try again.',
          duration: 30000,
        });
        setGenerating(false);
        return;
      }
      pullCopilotResponse(chat?.data?.chat_id);
    },
    [error, pullCopilotResponse, sendMessage, setGenerating],
  );

  if (
    s2tFormContext?.watch(
      'river.properties.source.additional_settings.recipe_id',
    )
  ) {
    return <SelectBlueprint />;
  }
  return (
    <>
      <Flex h="full" w="full" bg="white" justify="center" overflow="auto">
        {generating || saving ? (
          <BlueprintLoader showInfoText />
        ) : (
          <RenderGuard condition={!chatStatus?.yaml && !chatId}>
            <Flex flexDir="column" w="850px" align="center" py={10} gap={8}>
              <Grid gap={3} templateColumns="1fr 8fr" pb={8}>
                <Icon boxSize="75px" as={Bot} />
                <Flex flexDir="column">
                  <Text textStyle="M4" color="primary">
                    How does it work?
                  </Text>
                  <Box>
                    Connect your Data Source by providing its{' '}
                    <strong>Public API documentation URL </strong> and the{' '}
                    <strong>name of the endpoint </strong> you want to extract
                    data from. A YAML file (Blueprint) based on your
                    specifications will be generated as your data source
                    connection.{' '}
                  </Box>
                </Flex>
              </Grid>
              <CopilotTextArea generate={generate} />
            </Flex>
          </RenderGuard>
        )}
      </Flex>
    </>
  );
}

const blueprintName = `Untitled_Blueprint_${displayDate(
  new Date(),
  'dd_MM_yyyy',
)}`;

export function CopilotTextArea({ generate }) {
  const formApi = useFormContext();
  const { field: blueprintField } = useController({
    name: 'blueprint',
    control: formApi.control,
  });
  const disabled =
    !blueprintField.value.doc_url || !blueprintField.value.report;
  return (
    <Grid
      templateRows="85px repeat(2,75px) auto"
      flexDir="column"
      w="inherit"
      h="300px"
      bg="white"
      borderRadius={4}
      p={6}
      border="1px"
      borderColor="border-secondary"
    >
      <Input
        name="blueprint.blueprint_name"
        label="Blueprint Name"
        placeholder={blueprintName}
        helpText="Name must contain only letters, digits or underscores and begin with a letter"
        api={formApi}
        required
        chakra
      />
      <Input
        name="blueprint.doc_url"
        label="API Documentation URL"
        placeholder="https://docs.github.com/en/rest?apiVersion=2022-11-28"
        api={formApi}
        required
        chakra
        onKeyDown={e => {
          if (e.key === 'Enter' && !disabled) {
            e.preventDefault();
            generate(blueprintField.value.doc_url, blueprintField.value.report);
          }
        }}
      />
      <Input
        name="blueprint.report"
        label="Selected Endpoint"
        placeholder="Repositories"
        api={formApi}
        required
        chakra
        onKeyDown={e => {
          if (e.key === 'Enter' && !disabled) {
            e.preventDefault();
            generate(blueprintField.value.doc_url, blueprintField.value.report);
          }
        }}
      />
      <Flex alignItems="center" pb={4}>
        <HStack>
          <Icon as={Sparkles} color="icon" />
          <Text color="font-secondary" textStyle="R8">
            Powered by AI
          </Text>
        </HStack>
        <Tagger tags={RiverCreationTags.BLUEPRINT_GENERATE_CLICK_ENABLED}>
          <RiveryButton
            label="Generate"
            variant="outlined-primary"
            size="small"
            onClick={() =>
              generate(
                blueprintField.value.doc_url,
                blueprintField.value.report,
              )
            }
            ml="auto"
            isDisabled={disabled}
          />
        </Tagger>
      </Flex>
    </Grid>
  );
}

export function CopilotView({ showCopilot, setShowCopilot, expanded }) {
  return (
    <Drawer
      size="default"
      placement="right"
      isOpen={showCopilot}
      onClose={setShowCopilot}
    >
      <DrawerContent>
        <DrawerHeader>
          <HStack pb={1} borderBottom="1px" borderColor="gray.300" color="font">
            <Icon as={RdsCoPilot} boxSize={5} color="font" />
            <Text textStyle="M4">Data Connector Agent</Text>
          </HStack>
        </DrawerHeader>
        <DrawerCloseButton mt={1} />
        <DrawerBody>
          <Flex
            py={5}
            h="full"
            w="full"
            gap={6}
            flexDir="column"
            justifyContent="end"
            {...(expanded && { display: 'none', height: 0 })}
          >
            <HStack>
              <Icon as={InfoTooltip} color="primary" />
              <Text color="primary">
                Please note, any new prompt entry will overwrite the existing
                YAML
              </Text>
            </HStack>
            <CopilotTextArea generate={undefined} />
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
