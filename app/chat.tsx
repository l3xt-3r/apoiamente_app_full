import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/Theme';

export default function ChatScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>← Voltar</Text></TouchableOpacity>
      <Text style={styles.emoji}>💬</Text>
      <Text style={styles.title}>Módulo de Conversa</Text>
      <Text style={styles.sub}>Esta tela está pronta para receber a sua futura inteligência ou chat humano.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  back: { position: 'absolute', top: 60, left: 20 },
  backText: { color: Theme.colors.primary, fontWeight: '600', fontSize: 16 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: Theme.colors.text },
  sub: { fontSize: 14, color: Theme.colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 }
});