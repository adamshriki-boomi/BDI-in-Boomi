import { ControlList } from 'api/types';
import { Icon, RiveryModal } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { FormControl, FormRenderer } from 'components/Form';
import { useRefreshAccountToken } from 'hooks/useRefreshAccountToken';
import React from 'react';
import { BiPlus } from 'react-icons/bi';
import { useToggle } from 'react-use';
import { useCore, useCoreActions } from 'store/core';

const defaultValues = {
  extend_time: 7,
  extend_rpu: 0,
};

export function ExtendTrial() {
  const { daysTrial } = useCore();
  const { extendTrial } = useCoreActions();
  const [, toggleIsUpdating] = useToggle(false);
  const [show, toggle] = useToggle(false);
  const { refreshAccountToken } = useRefreshAccountToken();

  const onSubmit = async formData => {
    toggleIsUpdating(false);
    await extendTrial(convertToNumber(formData));
    refreshAccountToken();
    toggleIsUpdating(true);
    toggle();
  };

  return (
    <>
      <RiveryButton
        label="Extend Trial"
        variant="outlined-primary"
        leftIcon={<Icon as={BiPlus} boxSize={5} />}
        onClick={() => toggle()}
      />
      <RiveryModal
        show={show}
        onClose={toggle}
        centered
        ariaLabel="variables modal"
        title="Extend Trial"
      >
        <FormRenderer
          controls={controls}
          formData={defaultValues}
          onSubmit={onSubmit}
          external={true}
          render={({ form }) => (
            <>
              <RiveryModal.Body>
                <h6>Trial License expires in {daysTrial} days</h6>
                {form}
              </RiveryModal.Body>
              <RiveryModal.Footer>
                <RiveryButton
                  label="Submit"
                  type="submit"
                  aria-label="Submit"
                  variant="primary"
                />
              </RiveryModal.Footer>
            </>
          )}
        />
      </RiveryModal>
    </>
  );
}
const convertToNumber = data =>
  Object.entries(data).reduce(
    (result, [key, value]) => ({
      ...result,
      [key]: Number(value),
    }),
    {},
  );
const controls: Array<FormControl | FormControl[]> = [
  {
    type: ControlList.INPUT_NUMBER,
    name: 'extend_time',
    display_name: 'Days to Extend Trial:',
    required: true,
    placeholder: 'Days to Extend Trial:',
    max: 60,
  },
  {
    type: ControlList.CONTENT,
    display_name: `
    -2 reduces two days from the trial,
    7 adds 7 days to trial.
    `,
  },
  {
    type: ControlList.INPUT_NUMBER,
    name: 'extend_rpu',
    display_name: 'Extend BDU units: ',
    required: true,
    placeholder: 'Extend BDU units: ',
    max: 1000,
    min: 0,
  },
];
