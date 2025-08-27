import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConversationalAIContextType {
  isOpen: boolean;
  openAI: () => void;
  closeAI: () => void;
}

const ConversationalAIContext = createContext<ConversationalAIContextType | undefined>(undefined);

export const useConversationalAI = () => {
  const context = useContext(ConversationalAIContext);
  if (!context) {
    throw new Error('useConversationalAI must be used within a ConversationalAIProvider');
  }
  return context;
};

interface ConversationalAIProviderProps {
  children: ReactNode;
}

export const ConversationalAIProvider = ({ children }: ConversationalAIProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openAI = () => setIsOpen(true);
  const closeAI = () => setIsOpen(false);

  return (
    <ConversationalAIContext.Provider value={{ isOpen, openAI, closeAI }}>
      {children}
    </ConversationalAIContext.Provider>
  );
};