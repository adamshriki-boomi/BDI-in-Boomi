import { HStack, RiveryButton } from 'components';
import { OpenSupport } from 'modules/ModalForm/OpenSupport';
import React from 'react';
import { useHistory } from 'react-router-dom';

export function DrawerFooter({ setDrawer, levelUpContent, stepContent }) {
  const { push, location } = useHistory();

  return (
    <HStack
      position="absolute"
      bottom={0}
      px={6}
      py={4}
      w="full"
      justify="space-between"
      borderTop="1px"
      borderColor="border"
    >
      <RiveryButton
        label="Close"
        variant="default"
        onClick={() => {
          push({
            pathname: location.pathname,
            state: null,
          });
          setDrawer(null);
        }}
        size="small"
      />
      {stepContent ||
      (levelUpContent && !levelUpContent?.saveLabel) ? null : levelUpContent ? (
        <RiveryButton
          label={levelUpContent.saveLabel}
          onClick={() => {
            setDrawer(null);
            push(levelUpContent.onDrawerActionLink);
          }}
          variant="outlined-primary"
          size="small"
        />
      ) : (
        <OpenSupport variant="primary" size="small" label="Contact Us" pl={3} />
      )}
    </HStack>
  );
}
