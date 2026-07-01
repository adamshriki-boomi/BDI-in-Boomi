import { useCallback, useEffect, useRef } from 'react';
import { useCore } from 'store/core';
import { getOId } from './api.sanitizer';

// Hook to set prefill values
function useSetUpFormValues(type, clickData) {
  const { userEmail, userId, activeAccountId } = useCore();

  return useCallback(() => {
    window.MktoForms2.whenReady(form => {
      const { message, ...restData } = clickData;

      form.vals({
        Email: userEmail,
        Rivery_Account_ID__c: activeAccountId,
        Rivery_User_ID__c: getOId(userId),
        temporaryFormOpenTextField: message,
        ...restData,
      });
    });
  }, [activeAccountId, clickData, userEmail, userId]);
}

const MarketoForm = ({ type, onSubmit, onSuccess, clickData = {} }) => {
  const formRef = useRef(null);
  const scriptLoadedRef = useRef(false);
  const prefillValues = useSetUpFormValues(type, clickData);

  const setupFormHandlers = useCallback(
    form => {
      form.onSuccess((values, followUpUrl) => {
        if (onSuccess) {
          onSuccess(values, followUpUrl);
        }
        return false; // prevent redirect
      });

      if (onSubmit) {
        form.onSubmit(form => {
          const formData = form.getValues();
          onSubmit(formData, form);
          return true;
        });
      }
    },
    [onSubmit, onSuccess],
  );

  const loadMarketoForm = useCallback(() => {
    const formId = import.meta.env[type];
    const munchkinId = import.meta.env.VITE_MARKETO_MUNCHKIN_ID;

    if (!formId || !munchkinId) {
      console.error('Missing Marketo env vars');
      return;
    }

    const injectForm = () => {
      const formContainer = document.querySelector(`#mktoForm_${formId}`);
      if (formContainer) {
        formContainer.innerHTML = '';
      }

      window.MktoForms2.loadForm(
        '//marketing.boomi.com',
        munchkinId,
        formId,
        form => {
          setupFormHandlers(form);
          window.MktoForms2.whenReady(form => {
            prefillValues();
          });
        },
      );
    };

    if (window.MktoForms2 && typeof window.MktoForms2.loadForm === 'function') {
      injectForm();
      return;
    }

    if (!scriptLoadedRef.current) {
      const script = document.createElement('script');
      script.src = '//marketing.boomi.com/js/forms2/js/forms2.min.js';
      script.async = true;

      script.onload = () => {
        scriptLoadedRef.current = true;
        setTimeout(() => {
          if (
            window.MktoForms2 &&
            typeof window.MktoForms2.loadForm === 'function'
          ) {
            injectForm();
          } else {
            console.error('MktoForms2 not available after script load');
          }
        }, 100);
      };

      script.onerror = () => {
        console.error('Failed to load Marketo forms script');
      };

      document.head.appendChild(script);
    }
  }, [type, setupFormHandlers, prefillValues]);

  useEffect(() => {
    loadMarketoForm();

    return () => {
      const existingScript = document.querySelector(
        'script[src="//marketing.boomi.com/js/forms2/js/forms2.min.js"]',
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [loadMarketoForm]);

  const formId = import.meta.env[type];

  return (
    <div key={type}>
      <form
        id={`mktoForm_${formId}`}
        ref={formRef}
        style={{ margin: 'auto' }}
      ></form>
    </div>
  );
};

export default MarketoForm;
