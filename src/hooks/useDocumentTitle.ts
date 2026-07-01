import { useEffect, useRef } from 'react';

export function useDocumentTitle(title: string, retainOnUnmount = false) {
  const titleRef = useRef<any>(document.title);

  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  useEffect(() => {
    return () => {
      if (!retainOnUnmount) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        document.title = titleRef?.current;
      }
    };
  }, [retainOnUnmount]);
}
