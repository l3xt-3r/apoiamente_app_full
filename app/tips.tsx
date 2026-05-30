import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/Theme';

export default function TipsScreen() {
  const router = useRouter();
  const data = [
    { title: 'Atenção Plena', body: 'Foque nos sons ao seu redor por 1 minuto quando notar picos de estresse ou agitação.' },
    { title: 'Uso de Telas', body: 'Evite consumir notificações pesadas na primeira meia hora após acordar.' }
  ];

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Voltar</Text></TouchableOpacity>
      <Text style={styles.title}>Dicas Diárias</Text>
      {data.map((d, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{d.title}</Text>
          <Text style={styles.cardBody}>{d.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: 20, paddingTop: 60 },
  backText: { color: Theme.colors.primary, fontWeight: '600', marginBottom: 20, fontSize: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: Theme.colors.text, marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: Theme.radius.card, marginBottom: 12, ...Theme.shadow },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.text },
  cardBody: { fontSize: 14, color: Theme.colors.textMuted, marginTop: 4, lineHeight: 20 }
});