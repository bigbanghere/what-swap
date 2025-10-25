"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface ValidationContextType {
  canAddMoreCharacters: (key: string) => boolean;
  setCanAddMoreCharacters: (fn: (key: string) => boolean) => void;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

export function ValidationProvider({ children }: { children: React.ReactNode }) {
  const [canAddMoreCharacters, setCanAddMoreCharacters] = useState<(key: string) => boolean>(() => (key: string) => true);
  const functionRef = useRef<(key: string) => boolean>((key: string) => true);

  // Update ref when function changes
  React.useEffect(() => {
    functionRef.current = canAddMoreCharacters;
  }, [canAddMoreCharacters]);

  // Wrapper for setCanAddMoreCharacters
  const setCanAddMoreCharactersWithDebug = React.useCallback((fn: (key: string) => boolean) => {
    if (typeof fn !== 'function') {
      console.warn('🚨 ValidationProvider: setCanAddMoreCharacters received non-function:', typeof fn);
      return;
    }
    setCanAddMoreCharacters(fn);
  }, []);

  // Safe wrapper function that always works
  const safeCanAddMoreCharacters = React.useCallback((key: string) => {
    try {
      const currentFn = functionRef.current;
      if (typeof currentFn === 'function') {
        return currentFn(key);
      }
      return true; // Default to allowing input
    } catch (error) {
      console.warn('⚠️ ValidationProvider: Error in canAddMoreCharacters:', error);
      return true;
    }
  }, []);

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
