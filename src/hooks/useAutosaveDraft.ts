'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutosaveDraft<T extends Record<string, any>>(
  draftKey: string,
  initialValues: T,
  debounceMs: number = 300
) {
  const [values, setValues] = useState<T>(initialValues);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentValuesRef = useRef<T>(initialValues);

  useEffect(() => {
    currentValuesRef.current = values;
  }, [values]);

  // 1. Load draft from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`hireroom_draft_${draftKey}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setValues(prev => ({ ...prev, ...parsed }));
            currentValuesRef.current = { ...initialValues, ...parsed };
            setHasDraft(true);
          }
        }
      }
    } catch (e) {
      console.warn(`Could not load draft for ${draftKey}:`, e);
    } finally {
      setIsLoaded(true);
    }
  }, [draftKey]);

  // 2. Debounced save to localStorage when values change
  const saveDraft = useCallback(
    (newValues: Partial<T>) => {
      const updated = { ...currentValuesRef.current, ...newValues };
      currentValuesRef.current = updated;
      setValues(updated);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`hireroom_draft_${draftKey}`, JSON.stringify(updated));
            setLastSaved(new Date());
            setHasDraft(true);
          }
        } catch (e) {
          console.warn(`Could not save draft for ${draftKey}:`, e);
        }
      }, debounceMs);
    },
    [draftKey, debounceMs]
  );

  // 3. Clear draft upon form submission or user discard
  const clearDraft = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`hireroom_draft_${draftKey}`);
        setHasDraft(false);
        setLastSaved(null);
      }
    } catch (e) {
      console.warn(`Could not clear draft for ${draftKey}:`, e);
    }
  }, [draftKey]);

  return {
    values,
    setValues,
    saveDraft,
    clearDraft,
    hasDraft,
    lastSaved,
    isLoaded,
  };
}
