import { useCallback } from 'react';

export const useContactSales = () => {
  return useCallback(() => {
    window.open('https://rivery.io/book-call-sales', '_blank');
  }, []);
};
