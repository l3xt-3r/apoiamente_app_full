import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/Theme';

export default function BreathingScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<'Inspirar' | 'Expirar'>('Inspirar');

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase(p => p === 'Inspirar' ? 'Expirar' : 'Inspirar');
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Respiração Guiada</Text>
      <View style={[styles.circle, phase === 'Inspirar' ? styles.circleExpand : styles.circleShrink]}>
        <Text style={styles.phaseText}>{phase}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, alignItems: 'center', justifyContent: 'center' },
  back: { position: 'absolute', top: 60, left: 20 },
  backText: { color: Theme.colors.primary, fontWeight: '600', fontSize: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: Theme.colors.text, marginBottom: 40 },
  circle: { width: 180, height: 180, borderRadius: 90, justifyContent: 'center', alignItems: 'center', ...Theme.shadow },
  circleExpand: { backgroundColor: '#EEF2FF', borderWidth: 2, borderColor: Theme.colors.primary },
  circleShrink: { backgroundColor: '#E0F2FE', borderWidth: 2, borderColor: Theme.colors.secondary },
  phaseText: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.text }
});