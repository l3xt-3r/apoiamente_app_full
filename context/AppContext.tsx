import React, { createContext, useContext, useState } from 'react';

interface DiaryEntry {
  mood: string;
  text: string;
}

interface DiaryEntries {
  [dateStr: string]: DiaryEntry;
}

interface AppContextType {
  entries: DiaryEntries;
  addEntry: (dateStr: string, mood: string, text: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  userName: string;
  userPhoto: string | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  updateProfile: (newName: string, newPhoto: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Estados em memória RAM
  const [entries, setEntries] = useState<DiaryEntries>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Iniciando como true para facilitar seus testes na Home
  const [userName, setUserName] = useState<string>('Desenvolvedor');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // Login síncrono direto na memória
  const login = (email: string, password: string) => {
    const extractedName = email.split('@')[0];
    const formatName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
    
    setUserName(formatName);
    setIsAuthenticated(true);
  };

  // Logout síncrono
  const logout = () => {
    setIsAuthenticated(false);
    setUserName('Usuário');
    setUserPhoto(null);
  };

  // Atualizar perfil na memória
  const updateProfile = (newName: string, newPhoto: string | null) => {
    setUserName(newName);
    setUserPhoto(newPhoto);
  };

  // Salvar registro no Diário instantaneamente
  const addEntry = (dateStr: string, mood: string, text: string) => {
    setEntries((prevEntries) => ({
      ...prevEntries,
      [dateStr]: { mood, text },
    }));
  };

  return (
    <AppContext.Provider value={{ 
      entries, 
      addEntry, 
      isAuthenticated, 
      setIsAuthenticated, 
      userName, 
      userPhoto, 
      login, 
      logout,
      updateProfile 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser utilizado obrigatoriamente dentro de um AppProvider');
  }
  return context;
}