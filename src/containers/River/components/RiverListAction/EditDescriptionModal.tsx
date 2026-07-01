import { RiveryModal, Textarea } from 'components';
import { InputLabel } from 'components/Form';
import { useVersionController } from 'modules/Versions/hooks';
import { useState } from 'react';

export function EditDescriptionModal({ onClose, onChange, value, header }) {
  const [draft, setDraft] = useState<string>(value);
  const { isActive: isInVersionMode } = useVersionController();
  const updateDraft = ({ currentTarget: { value } }) => {
    setDraft(value);
  };

  return (
    <RiveryModal
      show
      onClose={onClose}
      title={header}
      onSuccess={() => {
        onChange(draft);
        onClose();
      }}
      footer={!isInVersionMode && {}}
      body={
        <>
          <InputLabel label="Describe this data flow" variant="semibold" />
          <Textarea
            name="description"
            id="editRiverDescription"
            aria-label="Describe this data flow"
            value={draft}
            defaultChecked
            onChange={updateDraft}
            isDisabled={isInVersionMode}
          />
        </>
      }
    />
  );
}
