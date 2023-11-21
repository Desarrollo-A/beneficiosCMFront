import { useMemo } from 'react';
import merge from 'lodash/merge';

// ----------------------------------------------------------------------

export default function useEvent(events, selectEventId, openForm) {
  const currentEvent = events.find((event) => event.id === selectEventId);

  const defaultValues = useMemo(
    () => ({
      id: '',
      title: '',
      start : '',
      end: '',
      occupied: ''
    }),
    []
  );

  if(!openForm){
    return undefined;
  }

  if(currentEvent){
    return merge({}, defaultValues, currentEvent);
  }
  

  return defaultValues;
}
