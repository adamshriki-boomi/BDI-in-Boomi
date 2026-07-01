import { Grid, HStack, Icon, useToast } from '@chakra-ui/react';
import { API } from 'api';
import { AppRoutes, LegacyRoutes, RoutesBuilder } from 'app/routes';
import {
  ConfirmationModal,
  CopyToAccountIcon,
  DeleteIcon,
  Description,
  DuplicateIcon,
  Flex,
  RiveryModal,
  Text,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import RiveryButton from 'components/Buttons/RiveryButton';
import { SelectFormGroup } from 'components/Form/components';
import CodeBlock from 'components/Icons/components/CodeBlock';
import { TablePaginationContext } from 'components/RiveryTable/PaginatedApiRiveryTable';
import { TablePaginationContext as OldTableContext } from 'components/RiveryTable/PaginatedRiveryTable';
import { useRiverId } from 'containers/Activities/helpers';
import { ActiveAccountType } from 'containers/AppSettings/AccountTypes';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import {
  extractErrorV1,
  useCopyRiverMutation,
  useDeleteRiverMutation,
} from 'containers/Rivers/RiversV1/riversV1.query';
import { useRiverType } from 'hooks/useRiverType';
import { CreateLoadingToast, useToastComponent } from 'hooks/useToast';
import { useAccountsList } from 'modules/AccountPicker/useAccountsList';
import {
  useDismissDrawer,
  useIsInNewRiver,
  useIsInNewS2TRiver,
  useIsInsideOldRiver,
  useIsInsideRiver,
} from 'modules/RiverRightBar';
import { useLazyGetRiverRawQuery } from 'modules/SourceTarget';
import { useVersionController } from 'modules/Versions/hooks';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import { useAsyncFn, useCopyToClipboard, useToggle } from 'react-use';
import { useCore } from 'store/core';
import { useRiverActions } from 'store/river';
import { useRiversActions } from 'store/rivers';
import { getCrossId, getId, getOId } from 'utils/api.sanitizer';
import { EditDescriptionModal } from './EditDescriptionModal';

enum ActionList {
  DUPLICATE,
  COPY,
  COPY_PAYLOAD,
  DELETE,
  EDIT_DESCRIPTION,
}

RiverListActions.ActionList = ActionList;

type RiverListActionsProps = {
  riverName: string;
  riverDesc?: string;
  crossId: string;
  isApiV2?: boolean;
  exclude?: ActionList[];
  onDelete?: () => any;
  drawer?: boolean;
  newTableContext?: boolean;
};

function RiverActionsMenuItem({ text, icon }) {
  return (
    <Flex alignItems="center">
      <Icon as={icon} boxSize="18px" mr={2} mb={0.5} />
      <Text whiteSpace="nowrap">{text}</Text>
    </Flex>
  );
}

export function RiverListActions({
  riverName,
  crossId,
  isApiV2 = false,
  exclude = [],
  riverDesc = '',
  drawer = false,
  newTableContext = false,
  ...props
}: RiverListActionsProps) {
  const { isLogic } = useRiverType();
  const isInNewRiverPage = useIsInNewRiver();
  const { isActive: isInVersionMode } = useVersionController();
  const { isSuperAdminUser } = useCore();
  const isNewS2TRiver = useIsInNewS2TRiver();
  const [showCopyToAccount, toggleShowCopyToAccount] = useToggle(false);
  const [showDelete, toggleShowDelete] = useToggle(false);
  const [showDescription, toggleShowDescription] = useToggle(false);
  const { updateRiverDefinitions } = useRiverActions();
  const { refresh: refreshV1 } = useContext(TablePaginationContext);
  const { refresh } = useContext(OldTableContext);
  const isLegacyRiver = useIsInsideOldRiver();
  const duplicateRiver = useDuplicateRiver(
    newTableContext ? refreshV1 : refresh,
  );

  const { deleteRiverV1, copyRiverV1 } = useV1RiverActions(
    newTableContext,
    refresh,
  );
  const toast = useToast();
  const toastIdRef = useRef<any>(null);
  const { success, error } = useToastComponent();
  const [, copyToClipboard] = useCopyToClipboard();
  const [getRiverRawForPayload] = useLazyGetRiverRawQuery();

  const addToast = useCallback(
    description => {
      toastIdRef.current = CreateLoadingToast(toast, description);
    },
    [toast],
  );

  const updateToast = useCallback(
    (status, description) => {
      toast.update(toastIdRef.current, {
        duration: 3000,
        isClosable: true,
        title: <Text textTransform="capitalize">{status}</Text>,
        status,
        description,
      });
    },
    [toast],
  );

  const duplicateV1 = useCallback(async () => {
    addToast('Copying Data Flow');
    if (isLegacyRiver || !isApiV2) {
      duplicateRiver(getOId(crossId), updateToast);
    } else {
      const res: any = await copyRiverV1({ river_cross_id: getOId(crossId) });
      if (res?.error) {
        updateToast('error', 'Failed to copy Data Flow');
      } else {
        updateToast('success', 'Data Flow Successfully Copied');
      }
    }
  }, [
    addToast,
    copyRiverV1,
    crossId,
    duplicateRiver,
    isLegacyRiver,
    isApiV2,
    updateToast,
  ]);

  const deleteRiver = useCallback(async () => {
    const res: any = await deleteRiverV1({ river_cross_id: getOId(crossId) });
    if (res?.error) {
      error({
        description:
          extractErrorV1(res.error) ??
          'We had an issue deleting your data flow',
      });
    } else {
      success({ description: 'The data flow has been deleted successfully' });
    }
  }, [crossId, deleteRiverV1, error, success]);
  const copyPayload = useCallback(async () => {
    try {
      const river = await getRiverRawForPayload(getOId(crossId)).unwrap();
      const payload = JSON.stringify(river, null, 2);
      if (!river || typeof payload !== 'string') {
        throw new Error('Failed to fetch river payload');
      }
      copyToClipboard(payload);
      success({ description: 'Payload copied to clipboard' });
    } catch (e) {
      error({ description: 'Failed to copy payload to clipboard' });
    }
  }, [copyToClipboard, crossId, error, getRiverRawForPayload, success]);
  const shouldShowCopyPayload = isApiV2 && !isInNewRiverPage && !isNewS2TRiver;
  const actions = [
    {
      value: (
        <RiverActionsMenuItem text="Duplicate Data Flow" icon={DuplicateIcon} />
      ),
      id: ActionList.DUPLICATE,
      onClick: () => duplicateV1(),
      isDisabled: isInVersionMode || isInNewRiverPage,
    },
    {
      filterFn: () => isSuperAdminUser,
      value: (
        <RiverActionsMenuItem
          text="Copy To Another Account"
          icon={CopyToAccountIcon}
        />
      ),
      id: ActionList.COPY,
      onClick: toggleShowCopyToAccount,
      isDisabled: isInVersionMode || isInNewRiverPage,
    },
    shouldShowCopyPayload && {
      value: (
        <RiverActionsMenuItem
          text="Copy Payload To Clipboard"
          icon={CodeBlock}
        />
      ),
      id: ActionList.COPY_PAYLOAD,
      onClick: () => copyPayload(),
      isDisabled: isInVersionMode,
    },

    (isLogic || isLegacyRiver) && {
      value: (
        <RiverActionsMenuItem
          text={`${isInVersionMode ? 'View' : 'Edit'} Description`}
          icon={Description}
        />
      ),
      id: ActionList.EDIT_DESCRIPTION,
      onClick: toggleShowDescription,
      isDisabled: isInNewRiverPage,
    },
    {
      value: <RiverActionsMenuItem text="Delete Data Flow" icon={DeleteIcon} />,
      id: ActionList.DELETE,
      onClick: toggleShowDelete,
      isDisabled: isInVersionMode || isInNewRiverPage,
    },
  ]
    .filter(Boolean)
    .filter(({ id }) => !exclude.includes(id));

  const onDeleteAllSearchParams = useDismissDrawer(false);
  const isNewLogicRiver = useIsInNewRiver();
  return (
    <>
      <RiveryDropdown
        menuButtonDisabled={isNewLogicRiver || isNewS2TRiver}
        isLazy
        menuButtonAriaLabel={`river ${riverName} actions`}
        menuItems={actions}
        id={`river ${riverName} actions`}
        menuButtonStyle={
          drawer
            ? {
                bg: 'transparent!important',
                color: 'disabled!important',
                w: '0px!important',
                px: '30px!important',
                py: '24px!important',
                borderRadius: '0px',
                transform: 'rotate(90deg)',
                onClick: onDeleteAllSearchParams,
                _active: {
                  bg: 'background-selected-weak!important',
                  color: 'background-selected!important',
                  borderBottom: '2px',
                  borderBottomColor: 'background-selected',
                },
                _hover: {
                  color: 'disabledDark!important',
                  bg: 'gray.200',
                },
              }
            : null
        }
        menuListStyle={
          drawer
            ? {
                position: 'absolute',
                right: 0,
                top: '-20px',
                w: '220px!important',
              }
            : null
        }
        useAsPortal={drawer}
      />
      {showCopyToAccount ? (
        <AccountPickerModal
          onClose={toggleShowCopyToAccount}
          onConfirm={() => {
            toggleShowCopyToAccount();
          }}
          riverId={crossId}
        />
      ) : null}
      <ConfirmationModal
        title={
          <Flex flexDir="column" gap={1} w="90%">
            <Text>This will permanently delete data flow:</Text>
            <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
              {riverName}
            </Text>
          </Flex>
        }
        description="Are you sure you want to delete it?"
        onConfirm={deleteRiver}
        onClose={toggleShowDelete}
        show={showDelete}
        variant="error"
      />
      {showDescription ? (
        <EditDescriptionModal
          value={riverDesc}
          header={riverName}
          onChange={(river_desc: string) =>
            updateRiverDefinitions({ river_desc })
          }
          onClose={toggleShowDescription}
        />
      ) : null}
    </>
  );
}

function AccountPickerModal({ onClose, onConfirm, riverId }) {
  const { success } = useToastComponent();
  const {
    state: { data: accounts },
    setFilter,
  } = useAccountsList();
  const [selectedAccount, setSelectedAccount] = useState<any | undefined>(
    undefined,
  );
  const [error, setError] = useState('');
  const [{ value: lastError, loading }, onCopyRiverToAccount] =
    useAsyncFn(async () => {
      const result = await copyRiverToAccount(
        { $oid: riverId },
        selectedAccount._id,
      );
      if (!result) {
        onConfirm();
        success({ description: 'Data Flow copied to account' });
      }

      return result;
    }, [selectedAccount, riverId]);

  useEffect(() => {
    setError(lastError);
  }, [lastError]);
  useEffect(() => {
    setError('');
  }, [selectedAccount]);

  return (
    <RiveryModal
      show
      onClose={loading ? null : onClose}
      title="Copy Data Flow to another account"
    >
      <RiveryModal.Body as={Flex} flexDir="column" gap="4">
        <SelectFormGroup
          label="Target account"
          options={accounts}
          components={components}
          controlId="accounts"
          handleInputChange={setFilter}
          value={selectedAccount}
          selectProps={{
            getOptionLabel: (account: any) =>
              `${account.account_name} (${getId(account)})`,
            getOptionValue: account => {
              return getId(account);
            },
            isDisabled: loading,
          }}
          onChange={setSelectedAccount}
        />
        <RiveryAlert
          variant="warning-light"
          my="4"
          description="Warning: This action will copy all the data flows (inside this data flow) with
          the source connections into the target account"
        />

        {error && !loading ? (
          <RiveryAlert variant="error-light" description={error} />
        ) : null}
      </RiveryModal.Body>
      <RiveryModal.Footer>
        <RiveryButton
          label="Cancel"
          variant="default"
          onClick={onClose}
          disabled={loading}
        />
        <RiveryButton
          label={
            selectedAccount &&
            selectedAccount?.active_account_type !== ActiveAccountType.INTERNAL
              ? 'Copy into client account'
              : 'Copy Data Flow'
          }
          variant="primary"
          disabled={loading || !selectedAccount}
          isLoading={loading}
          onClick={onCopyRiverToAccount}
        />
      </RiveryModal.Footer>
    </RiveryModal>
  );
}

function CustomOption(props) {
  return (
    <Grid gridArea="1/1/1">
      <HStack>
        <Text>{props?.data?.account_name}</Text>
        <Text>({props?.data?.owner_email})</Text>
        <Text
          size="small"
          color={
            props?.data?.active_account_type === ActiveAccountType.INTERNAL
              ? 'text'
              : 'red'
          }
          flexGrow={1}
          display="flex"
          ml={2}
        >
          {props?.data?.active_account_type || ActiveAccountType.CUSTOMER}
        </Text>
      </HStack>
    </Grid>
  );
}

function useDuplicateRiver(refresh) {
  const { duplicateRiver } = useRiversActions();
  const riverId = useRiverId();
  const isOldRiver = useIsInsideOldRiver();
  const { selectedAccountId, envId } = useCore();

  return useCallback(
    (id, updateToast) =>
      Promise.resolve(duplicateRiver(id))
        .then(v => {
          !riverId && refresh();

          const crossId = getCrossId((v as any).payload);
          const pattern = isOldRiver ? LegacyRoutes.RIVER : AppRoutes.RIVER;
          const to = generatePath(pattern, {
            river: crossId,
            account: selectedAccountId,
            env: envId,
          });

          const ToastText = riverId ? (
            <>
              The Data Flow was duplicated successfully.{' '}
              <RiveryButton
                label="Go to Data Flow"
                variant="link"
                href={to}
                target="_blank"
              />
            </>
          ) : (
            'Data Flow duplicate was saved'
          );

          updateToast('success', ToastText);
          return v;
        })
        .catch(() => updateToast('error', 'Failed to duplicate data flow')),
    [duplicateRiver, refresh, riverId, isOldRiver, selectedAccountId, envId],
  );
}
const copyRiverToAccount = async (river, account) => {
  const result: any = await API.rivers.copyToAccount(
    { _id: river },
    { account },
  );
  return result?.status && result?.message;
};

const components = {
  SingleValue: CustomOption,
  Option: CustomOption,
};

const useV1RiverActions = (newTableContext, refresh) => {
  const { selectedAccountId: account, envId: env } = useCore();
  const { push } = useHistory();
  const [deleteRiverV1, { error, isSuccess }] = useDeleteRiverMutation();
  const { error: toastError, success } = useToastComponent();

  const [copyRiverV1] = useCopyRiverMutation();
  const isInRiverView = Boolean(useIsInsideRiver());
  useEffect(() => {
    if (isSuccess) {
      success({ description: 'The data flow has been deleted successfully' });
      if (!newTableContext && !isInRiverView) {
        refresh();
      }
    } else if (error) {
      toastError({
        description:
          extractErrorV1(error) ?? 'We had an issue deleting your data flow',
      });
    }
  }, [
    isInRiverView,
    isSuccess,
    newTableContext,
    push,
    refresh,
    error,
    success,
    toastError,
  ]);

  useEffect(() => {
    if (isSuccess && isInRiverView) {
      push(RoutesBuilder.rivers({ account, env }));
    }
  }, [account, env, isInRiverView, isSuccess, push]);
  return { deleteRiverV1, copyRiverV1 };
};
