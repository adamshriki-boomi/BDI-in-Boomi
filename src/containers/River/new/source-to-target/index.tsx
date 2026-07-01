import { chakra } from '@chakra-ui/react';
import { Grid, GridBox, RenderGuard, View } from 'components';
import { Wizard } from 'components/StepsWizard/Wizard';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { SidebarShell } from 'modules/RiverRightBar';
import {
  createRiverTemplate,
  SchemaEditor,
  SelectDataTarget,
  SetupDataSource,
} from 'modules/SourceTarget';
import { ScheduleAndNotifications } from 'modules/SourceTarget/components/Schedule';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useController, useForm } from 'react-hook-form';
import { MainRiverFormProvider } from 'hooks/useMainRiverFormContext';
import { useEffectOnce } from 'react-use';
import { useRiverActions } from 'store/river';
import { QuitConfirmationModal } from './components/QuitConfirmationModal';
import { WizardControls } from './components/WizardControls';
import {
  RiverForm,
  useGetAndValidateDataSource,
  usePrepopulateFields,
} from './form.hooks';
import { useHeaderStepValidator, useValidateStep } from './useValidateStep';
import { RunType } from 'modules/SourceTarget/components/form/form.consts';

const steps = [
  ['Set Up Data Source', SetupDataSource],
  ['Select Data Target', SelectDataTarget],
  ['Configure Schema', SchemaEditor],
  ['Schedule & Settings', ScheduleAndNotifications],
];

const useSaveBlueprintIns2t = formApi => {
  const { field: loading_method } = useController({
    name: 'river.properties.target.loading_method',
    control: formApi.control,
  });
  const { field: run_type } = useController({
    name: 'river.properties.source.run_type',
    control: formApi.control,
  });

  const save = useCallback(() => {
    ///changing the loading mode from defaullt merge since we don't have any keys on the columns
    loading_method.onChange('overwrite');
    //setting the run type to multi_tables
    run_type.onChange(RunType.MULTI_TABLES);
  }, [loading_method, run_type]);

  return save;
};

export default function CreateSourceToTarget() {
  useDocumentTitle('Data Flow');
  const [currentStep, setStep] = useState(0);
  const { setVariables } = useRiverActions();
  const sourceFromURL = useGetAndValidateDataSource('source');
  const targetFromURL = useGetAndValidateDataSource('target');
  const setUpDefaultValues = usePrepopulateFields(sourceFromURL, targetFromURL);
  const formMethods = useForm<RiverForm>({
    mode: 'onChange',
    defaultValues: {
      river: createRiverTemplate(),
      blueprint: {},
    },
  });
  useEffect(() => {
    if (sourceFromURL || targetFromURL) {
      const defaultValues = setUpDefaultValues();
      formMethods.setValue('river', defaultValues as any, {
        shouldDirty: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFromURL, targetFromURL]);

  const isBlueprint = ['Blueprint', 'blueprint_copilot', 'blueprint'].includes(
    formMethods?.watch('river.properties.source.name'),
  );
  const blueprint_id_field = formMethods?.watch(
    'river.properties.source.additional_settings.recipe_id',
  );
  const isCurrentStepValid = useValidateStep(currentStep, formMethods);
  const isValidStep = useHeaderStepValidator(currentStep, formMethods);
  const saveBlueprint = useSaveBlueprintIns2t(formMethods);
  const onStepChange = useCallback(
    async step => {
      if (step === 1 && isBlueprint) {
        saveBlueprint();
        if (blueprint_id_field) {
          setStep(step);
        }
      } else {
        setStep(step);
      }
    },
    [isBlueprint, saveBlueprint, blueprint_id_field],
  );

  const { field: target } = useController({
    name: 'river.properties.target.name',
    control: formMethods.control,
  });
  const validForSave =
    (currentStep < 2 && formMethods?.formState?.isValid && target.value) ||
    (currentStep >= 2 &&
      Object.keys(formMethods?.formState?.errors).length === 0);

  useEffectOnce(() => {
    setVariables({});
  });

  const form = document.getElementById('river-form');

  form?.addEventListener('submit', e => {
    e.preventDefault();
  });

  const hideSidebar =
    !formMethods?.watch('river.properties.source.name') ||
    (currentStep === 2 &&
      !isBlueprint &&
      !formMethods?.watch(
        'river.properties.source.additional_settings.extract_method',
      ));
  return (
    <SidebarShell
      m="0"
      gridTemplateAreas={`'content ${SidebarShell.sidebarGridArea}'`}
      fallbackAreas="'content'"
      showSidebar={!hideSidebar}
      formApi={formMethods}
      sideBarTopPadding="68px"
    >
      <View m={0} as={GridBox} overflow="hidden" gridTemplateRows="1fr auto">
        <MainRiverFormProvider value={formMethods}>
          <FormProvider {...formMethods}>
            <chakra.form display="contents" id="river-form">
              <Grid
                overflow="hidden"
                className={`create-source-to-target-step-${currentStep + 1}`}
              >
                <Wizard
                  steps={steps}
                  onChange={index => {
                    const isValid = isValidStep?.[index];
                    if (isValid) {
                      onStepChange(index);
                    }
                  }}
                  active={currentStep}
                  isValidStep={isValidStep}
                />
              </Grid>
            </chakra.form>
            <RenderGuard
              condition={formMethods?.watch('river.properties.source.name')}
            >
              <WizardControls
                step={currentStep}
                onStepChange={onStepChange}
                isStepValid={isCurrentStepValid}
                validForSave={validForSave}
              />
            </RenderGuard>
            <QuitConfirmationModal
              currentStep={currentStep}
              validForSave={validForSave}
              onStepChange={onStepChange}
            />
          </FormProvider>
        </MainRiverFormProvider>
      </View>
    </SidebarShell>
  );
}
