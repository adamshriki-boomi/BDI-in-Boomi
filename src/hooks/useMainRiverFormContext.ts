import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RiverForm } from 'containers/River/new/source-to-target/form.hooks';

// Create a context for the main river form
const MainRiverFormContext = createContext<UseFormReturn<RiverForm> | null>(
  null,
);

/**
 * Provider component that provides the main river form context
 * This should be placed at the top level of your river form
 */
export const MainRiverFormProvider = MainRiverFormContext.Provider;

/**
 * Hook that always returns the main river form context, even when inside nested forms
 * This ensures you always get the main river form, not any nested form contexts
 */
export const useMainRiverFormContext = (): UseFormReturn<RiverForm> | null => {
  return useContext(MainRiverFormContext);
};
