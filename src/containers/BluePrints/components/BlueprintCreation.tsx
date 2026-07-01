import { HStack } from '@chakra-ui/react';
import {
  ContainerSplitter,
  Flex,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { CustomSelectForm, Input } from 'components/Form';
import { useDataFrameNameValidator } from 'modules/DataFrames';
import { useCallback, useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { displayDate } from 'utils/date.utils';
import { ActionTypeEnum, useSaveBlueprint } from '../helpers';
import { Tagger } from 'components/Tracking/Tagger';
import { BlueprintsTags } from 'utils/tracking.tags';
import BlueprintDrawerFooter from './BlueprintDrawerFooter';
import BlueprintLoader from './BlueprintLoader';
import { Editor } from './Editor';
import TestBlueprint from './TestBlueprint';
import { useMainRiverFormContext } from 'hooks/useMainRiverFormContext';

function setBlueprintId(s2tForm, blueprintId) {
  s2tForm.setValue(
    'river',
    {
      ...s2tForm?.watch('river'),
      properties: {
        ...s2tForm?.watch('river.properties'),
        source: {
          ...s2tForm?.watch('river.properties.source'),
          additional_settings: {
            ...s2tForm?.watch('river.properties.source.additional_settings'),
            recipe_id: blueprintId,
          },
        },
      },
    },
    { shouldDirty: true },
  );
}

export default function BlueprintCreation({
  selectedBlueprint,
  toggle = null,
  s2t = false,
  ...props
}) {
  // const [showCopilot, setShowCopilot] = useToggle(false);

  const { file, formApi, loading } = props;
  const s2tForm = useMainRiverFormContext();
  const {
    saveBlueprint,
    loading: savingBlueprint,
    newBlueprint,
    error,
  } = useSaveBlueprint(file ? ActionTypeEnum.EDIT : ActionTypeEnum.ADD);
  useEffect(() => {
    if (
      s2tForm &&
      newBlueprint &&
      !s2tForm?.watch('river.properties.source.additional_settings.recipe_id')
    ) {
      setBlueprintId(s2tForm, newBlueprint.cross_id);
    }
  }, [s2tForm, newBlueprint]);

  //The regex is the same so we re-use it
  const isBlueprintNameInvalid = useDataFrameNameValidator();
  const prebuildOptions = [
    { label: 'Basic', value: 'basic' },
    { label: 'Single Loop', value: 'single_loop' },
    { label: 'Double Loop', value: 'double_loop' },
  ];

  const loadPrebuild = useCallback(async ({ value }) => {
    const response = await fetch(
      `https://s3.us-east-2.amazonaws.com/com.rivery.io.prod.static.assets/blueprint_templates/${value}.yaml`,
    );
    const text = await response.text();
    formApi.setValue('yaml', text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex flexDir="column" w="full" h="full">
      <FormProvider {...formApi}>
        <form style={{ display: 'contents' }}>
          <ContainerSplitter
            h="100%"
            orientation="vertical"
            overflow="hidden"
            firstChildProps={{ size: 500 }}
            showThirdChild
          >
            <Flex
              pt={6}
              w="full"
              gap={6}
              flexDir="column"
              pl={6}
              pr={4}
              transition="all 0.2s"
            >
              <Flex gap={8} flexDir="column">
                <Flex flexDir="column">
                  <RiveryButton
                    label="Use our YAML Builder"
                    mb={4}
                    data-pendo-id={BlueprintsTags.EDIT_YAML_BUILDER_BUTTON}
                    onClick={() =>
                      window.open(
                        'https://riveryio.github.io/yaml-builder/',
                        '_blank',
                      )
                    }
                  />
                  <HStack>
                    <Text color="tagMagenta">*</Text>
                    <Text
                      textStyle="R7"
                      color="primary"
                      marginInlineStart="0.2rem !important"
                    >
                      Blueprint Name
                    </Text>
                  </HStack>
                  <Input
                    label="Name the blueprint to help you identify it."
                    name="name"
                    api={formApi}
                    placeholder={`Untitled_Blueprint_${displayDate(
                      new Date(),
                      'dd_MM_yyyy',
                    )}`}
                    validate={name => {
                      const validationResult = isBlueprintNameInvalid(name);
                      const messages = {
                        nameExists: 'This name already exists',
                        containsInvalidChars:
                          'Blueprint name must contain only letters, digits or underscores',
                      };
                      return validationResult
                        ? messages[validationResult]
                        : true;
                    }}
                    chakra
                  />
                </Flex>
                <Flex flexDir="column">
                  <Text textStyle="R7" color="primary">
                    YAML Template
                  </Text>
                  <Tagger tags={BlueprintsTags.EDIT_YAML_TEMPLATE_DROPDOWN}>
                    <CustomSelectForm
                      label="Build your connector using a low-code (YAML) approach. You can select one of the optional templates or create your own."
                      options={prebuildOptions}
                      isMulti={false}
                      controlId="yaml tamplates"
                      onChange={loadPrebuild}
                    />
                  </Tagger>
                </Flex>
              </Flex>
            </Flex>
            <BlueprintEditor loading={loading} s2t={s2t} />
            <TestBlueprint />
          </ContainerSplitter>
          {!s2t && (
            <BlueprintDrawerFooter
              file={file}
              toggle={toggle}
              selectedBlueprint={selectedBlueprint}
              saveBlueprint={saveBlueprint}
              newBlueprint={newBlueprint}
              loading={savingBlueprint}
              error={error}
              showRedirectToRiver={props.showRedirectToRiver}
            />
          )}
        </form>
      </FormProvider>
    </Flex>
  );
}

export function BlueprintEditor({ loading, s2t }) {
  return (
    <RenderGuard condition={!loading} fallback={<BlueprintLoader />}>
      <Editor s2t={s2t} />
    </RenderGuard>
  );
}
