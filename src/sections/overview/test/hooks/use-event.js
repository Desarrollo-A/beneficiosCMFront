import { useMemo } from 'react';

// ----------------------------------------------------------------------

export default function useEvent() {

  const defaultValues = useMemo(
    () => ({
      id: '',
      title: '',
      start : '',
      end: '',
      textColor: 'red'
    }),
    []
  );

  

  return defaultValues;
}
