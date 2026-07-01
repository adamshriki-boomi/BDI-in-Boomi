import { Flex, useDisclosure } from '@chakra-ui/react';
import { ModalBody, ModalFooter } from '@chakra-ui/react';
import { RiveryButton, RiveryModal } from 'components';
import { Input } from 'components/Form';
import { formatInTimeZone } from 'date-fns-tz';
import { DateRange } from 'modules/SourceTarget/store';
import { useCallback, useEffect, useState } from 'react';
import { compare } from 'utils/array.utils';
import { useTablePropField } from '../../../form';
import { dateRangeOptions, DateTimeEditor } from '../TableSettings/components';

export function DateTimePopover({
  row = null,
  setValue = null,
  outerValue = null,
  onlyCustom = false,
  source = '',
  isPredefined = false,
  showRoundUp = false,
}) {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { value, update } = useTablePropField<DateRange>(
    row?.original,
    'date_range',
    source,
    isPredefined,
  );

  const definiteValue = outerValue ? outerValue : value;

  return (
    <>
      <Input
        label={`${row?.original?.id} timestamp`}
        hideLabel
        placeholder="Select Date"
        value={resolveDateValue(definiteValue, '')}
        readOnly
        chakra
        onClick={onOpen}
      />
      <Content
        isOpen={isOpen}
        value={definiteValue}
        update={setValue ? setValue : update}
        onClose={onClose}
        onlyCustom={onlyCustom}
        showRoundUp={showRoundUp}
      />
    </>
  );
}

function Content({ isOpen, value, update, onClose, onlyCustom, showRoundUp }) {
  const [draft, setDraft] = useState<DateRange>(value);

  useEffect(() => {
    if (draft !== value) {
      setDraft({ ...value });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onCancel = useCallback(() => {
    setDraft(value);
    onClose();
  }, [onClose, value]);

  return (
    <RiveryModal
      title="Time Period"
      show={isOpen}
      onClose={onCancel}
      modalProps={{ size: '5xl' }}
    >
      <ModalBody
        overflow="auto"
        paddingInline="6"
        paddingBlock="6"
        display="flex"
        flexDir="column"
        gap={4}
      >
        <DateTimeEditor
          value={draft ?? value}
          onChange={setDraft}
          onlyCustom={onlyCustom}
          showRoundUp={showRoundUp}
        />
      </ModalBody>
      <ModalFooter px="4">
        <Flex justifyContent="end" gap={2}>
          <RiveryButton
            label="Cancel"
            size="small"
            variant="default"
            onClick={onCancel}
          />
          <RiveryButton
            label="Apply Changes"
            size="small"
            variant="primary"
            isDisabled={!Boolean(draft)}
            onClick={() => {
              if (draft) {
                update(draft);
                onClose();
                setDraft(undefined);
              }
            }}
          />
        </Flex>
      </ModalFooter>
    </RiveryModal>
  );
}

export const resolveDateValue = (date: DateRange, fallback: string) => {
  const isCustom = date?.time_period === 'custom';

  // Use date-fns formatInTimeZone to format dates in UTC
  const formatDateUTC = (dateValue: string) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    return formatInTimeZone(date, 'UTC', 'dd-MMM-yy, HH:mm:ss');
  };

  return isCustom
    ? [date?.start_date, date?.end_date]
        .filter(Boolean)
        .map(value => formatDateUTC(value))
        .join(' ⇀ ')
    : date?.time_period
    ? (Object.values(dateRangeOptions) as any)
        .flat(Infinity)
        .find(compare('value', date?.time_period)).label
    : fallback;
};
