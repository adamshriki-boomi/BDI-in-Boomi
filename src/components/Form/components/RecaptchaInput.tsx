import { Center } from 'components';
import React, { useEffect, useRef } from 'react';
import ReCaptcha from 'react-google-recaptcha';
import { Controller } from 'react-hook-form';

type Recaptcha = {
  reset: () => any;
};

export const RecaptchaInput = ({ api }) => {
  const recaptchaRef = useRef<Recaptcha>();
  const submitCount = api.formState.submitCount;
  useEffect(() => {
    if (submitCount) {
      recaptchaRef?.current.reset();
    }
  }, [submitCount]);
  return (
    <Center mt={4}>
      <Controller
        name="recaptcha"
        control={api.control}
        render={({ field: { onChange } }) => (
          <ReCaptcha
            sitekey={import.meta.env.VITE_GOOGLE_CAPTCHA}
            onChange={onChange}
            ref={recaptchaRef}
          />
        )}
      />
    </Center>
  );
};
