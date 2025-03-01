import { useState, useEffect } from 'react';

type StorageKey = 'flyInterests' | 'movementAddress' | 'selectedTopic';

export function useStorage<T>(key: StorageKey, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load value from storage on mount
  useEffect(() => {
    chrome.storage.local.get([key], (result) => {
      if (result[key] !== undefined) {
        setValue(result[key]);
      }
      setIsLoaded(true);
    });
  }, [key]);

  // Save value to storage when it changes
  const saveValue = (newValue: T) => {
    setValue(newValue);
    chrome.storage.local.set({ [key]: newValue }, () => {
      console.log(`${key} saved:`, newValue);
    });
  };

  return { value, setValue: saveValue, isLoaded };
}

export default useStorage; 