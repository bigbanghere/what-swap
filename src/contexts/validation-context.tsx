"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ValidationContextType {
  canAddMoreCharacters: (key: string) => boolean;
  setCanAddMoreCharacters: (fn: (key: string) => boolean) => void;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

export function ValidationProvider({ children }: { children: React.ReactNode }) {
  const [canAddMoreCharacters, setCanAddMoreCharacters] = useState<(key: string) => boolean>(() => (key: string) => true);

  // Wrapper for setCanAddMoreCharacters to add debugging
  const setCanAddMoreCharactersWithDebug = React.useCallback((fn: (key: string) => boolean) => {
    console.log('🔧 setCanAddMoreCharacters called with:', typeof fn, fn);
    if (typeof fn !== 'function') {
      console.log('🚨 ERROR: setCanAddMoreCharacters received non-function:', fn);
      return;
    }
    setCanAddMoreCharacters(fn);
  }, []);

  // Add debugging to track when the function changes
  React.useEffect(() => {
    console.log('🔧 ValidationProvider: canAddMoreCharacters changed to:', typeof canAddMoreCharacters);
    if (typeof canAddMoreCharacters !== 'function') {
      console.log('🚨 ERROR: canAddMoreCharacters is not a function! Value:', canAddMoreCharacters);
    }
  }, [canAddMoreCharacters]);

  // Wrapper function to ensure we always have a function
  const safeCanAddMoreCharacters = React.useCallback((key: string) => {
    console.log('🔍 safeCanAddMoreCharacters called with key:', key, 'canAddMoreCharacters type:', typeof canAddMoreCharacters);
    if (typeof canAddMoreCharacters === 'function') {
      const result = canAddMoreCharacters(key);
      console.log('🔍 Validation result:', result);
      return result;
    }
    console.log('⚠️ canAddMoreCharacters is not a function, defaulting to true');
    return true;
  }, [canAddMoreCharacters]);

  return (
    <ValidationContext.Provider value={{ canAddMoreCharacters: safeCanAddMoreCharacters, setCanAddMoreCharacters: setCanAddMoreCharactersWithDebug }}>
      {children}
    </ValidationContext.Provider>
  );
}

export function useValidation() {
  const context = useContext(ValidationContext);
  if (context === undefined) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
}
