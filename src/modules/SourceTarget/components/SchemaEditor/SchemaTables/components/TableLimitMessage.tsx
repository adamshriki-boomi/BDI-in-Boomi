import { Box, useToast } from '@chakra-ui/react';
import { RiveryButton } from 'components';
import { CreateErrorToastWithAction } from 'components/ActionToast/ErrorActionToast';
import { FormTypes, ModalFormWrapper } from 'modules/ModalForm';
import { Schemas } from 'modules/SourceTarget/store';
import { useMemo } from 'react';
import { useAccount, useCore } from 'store/core';
import { PlansIds } from 'api/types';

export const currentSelectedTables = (schemas: Schemas) => {
  if (!schemas || typeof schemas !== 'object') {
    return [];
  }

  const selectedTables = [];

  for (const schema of Object.values(schemas)) {
    if (!schema || typeof schema !== 'object') continue;

    for (const table of Object.values(schema)) {
      if (table?.is_selected) {
        selectedTables.push(table);
      }
    }
  }

  return selectedTables;
};

export const currentSelectedTablesForSchema = (
  schemas: Schemas,
  schema: string,
) =>
  schemas &&
  Object.values(schemas?.[schema])?.filter(table => table?.is_selected);

export function useReachedTablesLimit(schemas) {
  const { isSettingOn } = useAccount();
  const limitTableSelection = isSettingOn('max_selected_tables');
  const { currentTablesLength, currentSelectedTables: currentTables } =
    useMemo(() => {
      const tables = currentSelectedTables(schemas);

      return {
        currentTablesLength: tables?.length || 0,
        currentSelectedTables: tables || [],
      };
    }, [schemas]);

  return {
    currentTablesLength,
    currentSelectedTables: currentTables,
    shouldLimit: Boolean(limitTableSelection),
  };
}

function ContactUsForTables() {
  return (
    <Box>
      To add additional tables to this Data Flow, please
      <ModalFormWrapper
        type={FormTypes.CONTACT}
        title="Contact Us"
        message="Hi Team, please contact me regarding my data ingestion needs"
      >
        <RiveryButton label="Contact Us" variant="link" w="65px" size="small" />
      </ModalFormWrapper>
      to discuss your data ingestion needs.
    </Box>
  );
}

export function useErrorToastForTablesValidation() {
  const toast = useToast();
  const { isSettingOn } = useAccount();
  const limitTableSelection = isSettingOn('max_selected_tables');
  const { plan } = useCore();
  const suffix =
    plan === PlansIds.TRIAL
      ? `As a trial user, you can select up to ${limitTableSelection} tables.`
      : `Every data flow can select up to ${limitTableSelection} tables.`;
  return (
    title = 'Maximum Number of Tables Reached',
    description = `You have reached the maximum number of tables allowed for ingestion within a single Data Flow for your trial account. ${suffix}`,
    showContact = true,
  ) =>
    CreateErrorToastWithAction(
      toast,
      title,
      description,
      showContact && <ContactUsForTables />,
      'table-limit-reached',
    );
}
