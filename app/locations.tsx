import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/Theme';

export default function LocationsScreen() {
  const router = useRouter();
  const places = [
    { title: 'PRAIA CAPS II', sub: 'Apoio à saúde mental e acompanhamento psicossocial.' },
    { title: 'Hospital Mental de Messejana', sub: 'Atendimento e plantão emergencial psiquiátrico.' }
  ];

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Voltar</Text></TouchableOpacity>
      <Text style={styles.title}>Rede de Apoio Local</Text>
      {places.map((p, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{p.title}</Text>
          <Text style={styles.cardSub}>{p.sub}</Text>
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
  cardSub: { fontSize: 14, color: Theme.colors.textMuted, marginTop: 4 }
});