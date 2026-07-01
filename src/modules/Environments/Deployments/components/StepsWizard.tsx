import { Grid, Icon, Tooltip } from '@chakra-ui/react';
import { Box, HStack, RocketOutlineIcon, Text } from 'components';
import RiveryButton, { CloseIconButton } from 'components/Buttons/RiveryButton';
import { Wizard } from 'components/StepsWizard/Wizard';
import { useToastComponent } from 'hooks/useToast';
import { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useToggle } from 'react-use';
import { getOId } from 'utils/api.sanitizer';
import { Step1 } from '../DeploymentSteps/Step1';
import { Step2 } from '../DeploymentSteps/Step2';
import { Step3 } from '../DeploymentSteps/Step3';
import { EditPackage } from '../EditPackageGrid';
import { useDeployPackageMutation } from '../packages.query';
import { ConfiguredPackageGrid } from './ConfiguredPackageGrid';
import {
  pollResponse,
  useGetFormValues,
  useModifyAndSave,
  usePreparePackage,
  useStepValidation,
  ViewModes,
} from './helpers';

const steps = [
  ['Set Up', Step1],
  ['Object Selection', Step2],
  ['Settings', Step3],
];

export function Content({ mode, onClose, step, setStep, configuredPackage }) {
  const isNotAddMode = mode !== ViewModes.ADD;
  const formApi = useFormContext();
  const isStepValid = useStepValidation(formApi, step);
  return (
    <Grid templateRows="min-content 1fr" height="full" gap={3}>
      <HStack
        borderBottom="1px solid"
        borderBottomColor="gray.300"
        py={2}
        justify="space-between"
        alignItems="center"
      >
        <Text fontWeight="medium" fontSize="lg">
          {configuredPackage ? 'Deploy' : mode} Package
        </Text>
        <CloseIconButton aria-label="close content" onClick={onClose} />
      </HStack>
      {Boolean(configuredPackage) ? (
        <ConfiguredPackageGrid packageConfig={configuredPackage} />
      ) : isNotAddMode ? (
        <EditPackage mode={mode} />
      ) : (
        <Wizard
          steps={steps}
          onChange={index => {
            const isValid = isStepValid?.[index];
            if (isValid) {
              setStep(index);
            }
          }}
          active={step}
          isValidStep={isStepValid}
          isLazy={false}
        />
      )}
    </Grid>
  );
}

const tooltipHelperText = {
  0: 'To proceed fill all required fields',
  1: 'To proceed select at least one entity to deploy',
};

export function Footer({
  mode,
  step,
  setStep,
  onClose,
  configuredPackage,
  setConfiguredPackage,
  packageDeploying,
}) {
  const { success, error } = useToastComponent();
  const isEditMode = mode === ViewModes.EDIT;
  const isViewMode = mode === ViewModes.VIEW;
  const [isDeploying, setDeploying] = useToggle(false);
  const formApi = useFormContext();
  const { name, id } = useGetFormValues(formApi.control);
  const [deploy] = useDeployPackageMutation();
  const isStepValid = useStepValidation(formApi, step, isEditMode);
  const modifyAndSave = useModifyAndSave(formApi, null, setDeploying);
  const showError = useCallback(
    description => {
      setDeploying(false);
      error({ description, duration: null });
    },
    [error, setDeploying],
  );
  const preparePackage = usePreparePackage(setConfiguredPackage, showError);
  useEffect(() => {
    if (isDeploying && configuredPackage) setDeploying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuredPackage]);
  const modifyChanges = useCallback(
    async (package_id, shouldUpdateForm = true) => {
      setDeploying(true);
      await modifyAndSave('PATCH', package_id, shouldUpdateForm);
    },
    [modifyAndSave, setDeploying],
  );

  const modifyPackage = useCallback(async () => {
    setDeploying(true);
    const data: any = await modifyAndSave('PUT');
    const package_id = data._id;
    await preparePackage(package_id, true);
  }, [modifyAndSave, preparePackage, setDeploying]);

  const deployPackage = useCallback(async () => {
    setDeploying(true);
    const package_id = id ? getOId(id) : formApi?.watch('package_id');
    await modifyChanges(package_id, !configuredPackage);
    if (Boolean(configuredPackage)) {
      const res: any = await deploy(package_id);
      if (res?.error) {
        showError(res.error?.data?.message);
        return;
      }
      const poll_id = getOId(res?.data._id);
      pollResponse({
        id: poll_id,
        successCB: setConfiguredPackage,
        additionalData: { finishedDeploy: true, name },
        errorCB: showError,
      });
      packageDeploying(poll_id);
      return;
    }
    await preparePackage(id);
    return;
  }, [
    configuredPackage,
    deploy,
    formApi,
    id,
    modifyChanges,
    name,
    packageDeploying,
    preparePackage,
    setConfiguredPackage,
    setDeploying,
    showError,
  ]);

  const onProceed = useCallback(() => {
    if ([0, 1].includes(step)) {
      setStep(step + 1);
    }
    if (step === 2) {
      modifyPackage();
    }
  }, [modifyPackage, setStep, step]);

  const onSaveChanges = useCallback(async () => {
    await modifyChanges(getOId(id));
    onClose();
    success({ description: 'Package has been saved' });
  }, [id, modifyChanges, onClose, success]);
  return (
    <Box borderTop="1px solid" borderTopColor="gray.300" flex={1}>
      <HStack px={6} height="full" justify="space-between" h="60px">
        <RiveryButton
          label={configuredPackage || isViewMode ? 'Close' : 'Cancel'}
          variant="default"
          onClick={onClose}
        />
        {!isViewMode ? (
          isEditMode || Boolean(configuredPackage) ? (
            <HStack>
              {!Boolean(configuredPackage) ? (
                <RiveryButton
                  aria-label="save changes"
                  label="Save Changes"
                  variant="text"
                  onClick={onSaveChanges}
                  disabled={
                    (isEditMode && !formApi?.formState.isDirty) || isDeploying
                  }
                />
              ) : null}
              <RiveryButton
                aria-label="deploy-package"
                label="Deploy Package"
                leftIcon={<Icon as={RocketOutlineIcon} color="inherit" />}
                onClick={deployPackage}
                isLoading={isDeploying}
                isDisabled={!isStepValid[step + 1]}
              />
            </HStack>
          ) : (
            <HStack gap={0.5}>
              <RiveryButton
                aria-label="back"
                label="Back"
                variant="default"
                onClick={() => setStep(step - 1)}
                isDisabled={step === 0}
              />

              <TooltipWrap
                isStepValid={isStepValid[step + 1]}
                label={tooltipHelperText[step]}
              >
                <RiveryButton
                  aria-label="next"
                  label="Next"
                  onClick={onProceed}
                  isDisabled={!isStepValid[step + 1] && step !== 2}
                  isLoading={isDeploying}
                />
              </TooltipWrap>
            </HStack>
          )
        ) : null}
      </HStack>
    </Box>
  );
}

function TooltipWrap({ isStepValid, label, children }) {
  return isStepValid ? (
    children
  ) : (
    <Tooltip
      hasArrow
      placement="top-start"
      label={label}
      bg="gray.200"
      color="font"
      fontSize="sm"
      fontWeight="normal"
      shouldWrapChildren
      py={2}
      px={4}
    >
      {children}
    </Tooltip>
  );
}
