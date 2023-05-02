import { type RefObject, useEffect } from 'react';

function useClickOutside(
  ref: RefObject<HTMLDivElement> | null,
  callback: () => void,
  targetsToIgnore: (string | undefined)[] = []
) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      console.log('event.target', event.target);
      console.log('targetsToIgnore', targetsToIgnore);
      if (targetsToIgnore.includes((event.target as HTMLElement).id)) {
        return;
      }

      if (ref?.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback, targetsToIgnore]);
}

export default useClickOutside;
