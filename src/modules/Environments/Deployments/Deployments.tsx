import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { get } from 'api/api.proxy';
import {
  ConfirmationModal,
  GridBox,
  HStack,
  PageOverlaySpinner,
  Text,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Plg } from 'components/PLG/Plg';
import { getQueryParams, useSetQueryParams } from 'hooks/router';
import { useToastComponent } from 'hooks/useToast';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAsyncFn, useEffectOnce, useToggle } from 'react-use';
import { getOId } from 'utils/api.sanitizer';
import { TabContent } from '../components/TabContent';
import { ActivitiesView } from './ActivitiesGrid';
import {
  useGetFormValues,
  useModifyAndSave,
  useResetAllQueryParams,
  useStepValidation,
  ViewModes,
} from './components/helpers';
import { PackagesActivitiesRadio } from './components/MainGridButton';
import { Content, Footer } from './components/StepsWizard';
import './Deployments.scss';
import { ViewTypes } from './packages.query';
import { PackagesView } from './PackagesGrid';

export function Deployments() {
  const { success } = useToastComponent();
  const [view, setView] = useState<ViewTypes>(ViewTypes.PACKAGES);
  const [configuredPackage, setPreparedPackage] = useState(null);
  const [isDeploying, setPackageDeploying] = useState(null);
  const packageId = getQueryParams(['package_id']);
  const mode = getQueryParams(['mode']);
  const setQueryParams = useSetQueryParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const formApi = useForm({
    defaultValues: {
      activity: {},
      packages: {},
      mode: ViewModes.ADD,
    },
  });

  const onOpenDrawer = useCallback(
    mode => {
      formApi?.setValue('mode', mode);
      onOpen();
    },
    [formApi, onOpen],
  );

  useEffectOnce(() => {
    if (packageId?.package_id) {
      if (mode.mode === ViewModes.VIEW.toLowerCase()) {
        setTimeout(() => onOpenDrawer(ViewModes.VIEW), 1000);
        return;
      }
      setTimeout(() => onOpenDrawer(ViewModes.EDIT), 1000);
    }
  });

  useEffect(() => {
    if (configuredPackage) {
      if (configuredPackage?.finishedDeploy) {
        success({
          duration: 6000,
          description: `Package ${configuredPackage.name} was successfully deployed!`,
        });
        setPackageDeploying(null);
        setPreparedPackage(null);
        return;
      } else if (!isOpen && !isDeploying) {
        const { package_id: id } = configuredPackage;
        const package_id = typeof id == 'string' ? id : getOId(id);
        setQueryParams({ package_id });
        onOpenDrawer(ViewModes.EDIT);
      }
    }
  }, [
    configuredPackage,
    isDeploying,
    isOpen,
    onOpen,
    onOpenDrawer,
    setPackageDeploying,
    setQueryParams,
    success,
  ]);

  useEffect(() => {
    if (isDeploying) {
      onClose();
      setView(ViewTypes.ACTIVITY);
      setQueryParams({ package_id: null });
    }
  }, [isDeploying, onClose, setQueryParams]);

  return (
    <TabContent loading={false}>
      <Plg page="environments" style={{ right: '30px', top: '85px' }} />
      <HStack justifyContent="space-between">
        <Text fontSize="sm" color="font-secondary">
          {view === ViewTypes.PACKAGES
            ? 'Create and manage packages to deploy your objects (Data Flows, Connections, Variables, and Groups) from one Environment to another.'
            : 'View the status of all deployed packages. Any deployment can be reverted back to a previous state.'}
        </Text>
        <PackagesActivitiesRadio selected={view} onSelectView={setView} />
      </HStack>
      <FormProvider {...formApi}>
        <GridBox as="form" overflow="hidden">
          {view === ViewTypes.PACKAGES ? (
            <PackagesView
              onOpen={onOpenDrawer}
              setPreparedPackage={setPreparedPackage}
            />
          ) : (
            <ActivitiesView isDeploying={isDeploying} onOpen={onOpenDrawer} />
          )}
        </GridBox>
      </FormProvider>
      <ActionDrawer
        isOpen={isOpen}
        onClose={onClose}
        mode={formApi?.watch('mode')}
        configuredPackage={configuredPackage}
        setPreparedPackage={setPreparedPackage}
        packageDeploying={setPackageDeploying}
      />
    </TabContent>
  );
}

function setFormValues(formApi, values) {
  if (values) {
    const { package_name = '' } = values;
    return formApi.reset(
      {
        ...values,
        package_name,
      },
      { keepDirty: false, keepDirtyValues: false },
    );
  }
  return null;
}

function setViewValues(formApi, values) {
  if (values) {
    const {
      package_name = '',
      env_id_src,
      env_id_trg,
      deployment_settings,
      entities,
    } = values;
    return formApi.reset(
      {
        ...values,
        env_id_src: { $oid: env_id_src },
        env_id_trg: { $oid: env_id_trg },
        package_name,
        deployment_settings,
        entities,
      },
      { keepDirty: false, keepDirtyValues: false },
    );
  }
  return null;
}

const useEditPackageInitiate = (formApi, mode) => {
  const { package_id } = getQueryParams(['package_id']);
  const { deployment_id } = getQueryParams(['deployment_id']);
  const [{ loading }, getPackage] = useAsyncFn(async () => {
    return await get(`/package?package_id=${package_id}`);
  }, []);
  const [{ loading: deployedLoading }, getDeployedPackage] =
    useAsyncFn(async () => {
      return await get(
        `deployment/activities/package?deployment_id=${deployment_id}`,
      );
    }, []);
  const { name: packageName } = useGetFormValues(formApi.control);
  useEffect(() => {
    const packageNameMissing =
      packageName === undefined || typeof packageName !== 'string';
    if (packageNameMissing) {
      if (mode === ViewModes.EDIT) {
        getPackage().then(({ data }) => setFormValues(formApi, data));
      }
      if (mode === ViewModes.VIEW) {
        getDeployedPackage().then(({ data }) => {
          setViewValues(formApi, data[0]);
        });
      }
    }
  }, [formApi, getDeployedPackage, getPackage, mode, packageName, package_id]);
  return { loading: loading || deployedLoading };
};

function ActionDrawer({
  isOpen,
  onClose,
  mode,
  setPreparedPackage,
  configuredPackage,
  packageDeploying,
}) {
  const [step, setStep] = useState(0);
  const setPackageAndResetWizard = useCallback(
    preparedPackage => {
      setStep(0);
      setPreparedPackage(preparedPackage);
    },
    [setPreparedPackage],
  );

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <DrawerOverlay />
      <DrawerFormContent
        setStep={setStep}
        step={step}
        onClose={onClose}
        mode={mode}
        setPreparedPackage={setPackageAndResetWizard}
        configuredPackage={configuredPackage}
        packageDeploying={packageDeploying}
      />
    </Drawer>
  );
}

function DrawerFormContent({
  setStep,
  step,
  onClose,
  mode,
  setPreparedPackage,
  configuredPackage,
  packageDeploying,
}) {
  const { success, info } = useToastComponent();
  const [showModal, toggleDismissDrawerModal] = useToggle(false);
  const resetAllQueryParams = useResetAllQueryParams();
  const formApi = useForm({
    defaultValues: {
      package_name: null,
      env_id_src: { $oid: null },
      env_id_trg: { $oid: null },
      deployment_settings: {},
      entities: {},
    },
    mode: 'onChange',
  });
  const { name, sourceEnv, targetEnv, entities } = useGetFormValues(
    formApi.control,
  );
  const hasSelectedEntities = entities && Object.values(entities).length > 0;
  const isFormFilled = name || sourceEnv || targetEnv || hasSelectedEntities;
  const isStepValid = useStepValidation(formApi, step);

  const { loading } = useEditPackageInitiate(formApi, mode);

  const onDrawerDismiss = useCallback(() => {
    onClose();
    resetAllQueryParams();
    setPreparedPackage(null);
    setStep(0);
  }, [onClose, resetAllQueryParams, setPreparedPackage, setStep]);

  const closeDrawer = useCallback(() => {
    if (mode === ViewModes.ADD && isFormFilled && !configuredPackage) {
      toggleDismissDrawerModal(true);
      return;
    }
    onDrawerDismiss();
  }, [
    configuredPackage,
    isFormFilled,
    mode,
    onDrawerDismiss,
    toggleDismissDrawerModal,
  ]);

  const modifyAndSave = useModifyAndSave(formApi, onDrawerDismiss);

  const quitWizard = useCallback(() => {
    onDrawerDismiss();
    info({ description: 'Package set up has been canceled' });
  }, [info, onDrawerDismiss]);

  const saveAndQuitWizard = useCallback(() => {
    modifyAndSave('PUT');
    success({ description: 'Package has been saved' });
  }, [modifyAndSave, success]);

  return (
    <DrawerContent maxWidth="calc(100% - 100px)" aria-label={`${mode} Package`}>
      <FormProvider {...formApi}>
        <DrawerBody h="full" overflow="hidden">
          {loading ? <PageOverlaySpinner /> : null}
          <Content
            step={step}
            setStep={setStep}
            mode={mode}
            onClose={closeDrawer}
            configuredPackage={configuredPackage}
          />
        </DrawerBody>
        <DrawerFooter p={0}>
          <Footer
            step={step}
            setStep={setStep}
            packageDeploying={packageDeploying}
            setConfiguredPackage={setPreparedPackage}
            configuredPackage={configuredPackage}
            onClose={closeDrawer}
            mode={mode}
          />
        </DrawerFooter>

        <ConfirmationModal
          show={showModal}
          onClose={toggleDismissDrawerModal}
          variant="warning"
          title="Exit Package Creation?"
          description={modalDescription(hasSelectedEntities && isStepValid)}
          confirmLabel={
            hasSelectedEntities && isStepValid
              ? 'Save & Exit'
              : 'Exit Package Creation'
          }
          confirmColorScheme="primary"
          footerExtraButtons={
            hasSelectedEntities && isStepValid ? (
              <RiveryButton
                variant="outlined-primary"
                colorScheme="danger"
                label="Exit Without Saving"
                onClick={quitWizard}
              />
            ) : null
          }
          onConfirm={
            hasSelectedEntities && isStepValid ? saveAndQuitWizard : quitWizard
          }
        />
      </FormProvider>
    </DrawerContent>
  );
}

function modalDescription(selectedEntities) {
  return selectedEntities
    ? 'Quitting the process will result in an incomplete Package. You can exit by saving your progress or discarding all changes. How would you like to continue?'
    : 'Exiting at this stage will discard your configuration, requiring you to restart the creation process.';
}
