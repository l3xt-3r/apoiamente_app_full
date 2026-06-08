import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppContextType {
  isAuthenticated: boolean;
  userName: string;
  userPhoto: string;
  entries: { [key: string]: { mood: string; text: string } };
  login: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, photo: string) => Promise<void>;
  addEntry: (date: string, mood: string, text: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('Usuário');
  const [userPhoto, setUserPhoto] = useState('');
  const [entries, setEntries] = useState<{ [key: string]: { mood: string; text: string } }>({});

  // 1. CARREGAR OS DADOS SALVOS ASSIM QUE O APP ABRE
  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedAuth = await AsyncStorage.getItem('@apoia_mente:auth');
        const storedName = await AsyncStorage.getItem('@apoia_mente:name');
        const storedPhoto = await AsyncStorage.getItem('@apoia_mente:photo');
        const storedEntries = await AsyncStorage.getItem('@apoia_mente:entries');

        if (storedAuth === 'true') setIsAuthenticated(true);
        if (storedName) setUserName(storedName);
        if (storedPhoto) setUserPhoto(storedPhoto);
        if (storedEntries) setEntries(JSON.parse(storedEntries));
      } catch (error) {
        console.error('Erro ao carregar dados persistentes:', error);
      }
    }
    loadStoredData();
  }, []);

  // 2. FUNÇÃO DE LOGIN PERSISTENTE
  const login = async (email: string, pass: string, name?: string) => {
    try {
      setIsAuthenticated(true);
      await AsyncStorage.setItem('@apoia_mente:auth', 'true');
      
      if (name) {
        setUserName(name);
        await AsyncStorage.setItem('@apoia_mente:name', name);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 3. FUNÇÃO DE LOGOUT (LIMPA OS DADOS DE SESSÃO)
  const logout = async () => {
    try {
      setIsAuthenticated(false);
      await AsyncStorage.removeItem('@apoia_mente:auth');
      // Opcional: manter o nome e fotos locais ou limpar tudo com AsyncStorage.clear()
    } catch (error) {
      console.error(error);
    }
  };

  // 4. ATUALIZAR PERFIL PERSISTENTE
  const updateProfile = async (name: string, photo: string) => {
    try {
      setUserName(name);
      setUserPhoto(photo);
      await AsyncStorage.setItem('@apoia_mente:name', name);
      await AsyncStorage.setItem('@apoia_mente:photo', photo);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  // 5. ADICIONAR OU ATUALIZAR REFLEXÃO/HUMOR NO CALENDÁRIO
  const addEntry = async (date: string, mood: string, text: string) => {
    try {
      const updatedEntries = {
        ...entries,
        [date]: { mood, text }
      };
      setEntries(updatedEntries);
      // Salva a string JSON das reflexões no armazenamento do celular
      await AsyncStorage.setItem('@apoia_mente:entries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Erro ao salvar nova reflexão:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated, userName, userPhoto, entries,
      login, logout, updateProfile, addEntry
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return context;
}