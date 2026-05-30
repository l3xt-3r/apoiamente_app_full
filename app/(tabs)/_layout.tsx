import { Tabs } from 'expo-router';
import { useApp } from '../../context/AppContext';

export default function TabsLayout() {
  const { isAuthenticated } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Esconde completamente a barra nativa do sistema em todas as telas
        tabBarStyle: { display: 'none' }, 
      }}
    />
  );
}