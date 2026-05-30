import { Stack } from 'expo-router';
import { AppProvider } from '../context/AppContext'; // Verifique se o caminho está correto

export default function RootLayout() {
  return (
    /* 
       Injetamos o Provider aqui para que todas as telas 
       (Home, Diário, Login) tenham acesso aos dados do utilizador.
    */
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 
           O Stack vai carregar o grupo (tabs) que contém 
           a nossa Home e o nosso Diário.
        */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AppProvider>
  );
}