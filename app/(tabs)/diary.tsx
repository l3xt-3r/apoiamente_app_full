import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Linking } from 'react-native';
import { useApp } from '../../context/AppContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar as CalendarIcon, MessageSquare, LifeBuoy, Zap, Send, MapPin, ExternalLink, ShieldCheck, Lock, Sliders, BookOpen, PhoneCall } from 'lucide-react-native';

export default function DiaryScreen() {
  // Os dados agora vêm persistidos e seguros do Context global
  // ... seus outros estados
  const params = useLocalSearchParams();

  // declarar o estado antes do useEffect para evitar uso antes da definição
  const [subTab, setSubTab] = useState<'calendar' | 'chat' | 'support' | 'tips'>('calendar');

  useEffect(() => {
    // Se a tela for aberta com um parâmetro 'tab' na URL, muda a aba ativa automaticamente
    const validTabs = ['calendar', 'chat', 'support', 'tips'] as const;
    if (params.tab && validTabs.includes(params.tab as any)) {
      setSubTab(params.tab as typeof validTabs[number]);
    }
  }, [params.tab]);

  const { entries, addEntry, isAuthenticated } = useApp();
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab: string }>();
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"];
  const todayStr = now.toLocaleDateString('pt-BR');

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [mood, setMood] = useState('Em Paz');
  const [text, setText] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai', msg: string }>>([
    { sender: 'ai', msg: 'Este é o seu espaço seguro de escuta. O que gostaria de processar ou deixar fluir agora?' }
  ]);

  const [userCoords, setUserCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(false);

  const capsFortaleza = [
    { id: '1', name: 'CAPS Geral Centro de Fortaleza', address: 'Rua de Assis Bowen, 455 - Centro', phone: '(85) 3105-1616', lat: -3.7319, lon: -38.5267 },
    { id: '2', name: 'CAPS AD III Centro (Álcool e Drogas)', address: 'Rua Silva Paulet, 1941 - Aldeota', phone: '(85) 3105-2632', lat: -3.7405, lon: -38.5042 },
    { id: '3', name: 'CAPS Infantil Estudante Neno', address: 'Avenida da Universidade, 3100 - Benfica', phone: '(85) 3433-2550', lat: -3.7481, lon: -38.5389 },
    { id: '4', name: 'CAPS II IPU (Regional IV)', address: 'Rua Frei Marcelino, 1221 - Rodolfo Teófilo', phone: '(85) 3433-2815', lat: -3.7465, lon: -38.5524 },
    { id: '5', name: 'CAPS II Dr. Silas Munguba', address: 'Rua Delmiro de Farias, 1579 - Rodolfo Teófilo', phone: '(85) 3433-2612', lat: -3.7441, lon: -38.5539 }
  ];

  useEffect(() => {
    if (tab === 'chat' || tab === 'tips' || tab === 'calendar' || tab === 'support') {
      setSubTab(tab);
    }
  }, [tab]);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarCells.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarCells.push(i);

  // PROTEÇÃO: Uso de interrogação caso entries mude de estado durante o carregamento
  const hasEntryOnDate = (dateStr: string) => !!entries?.[dateStr];

  const handleSelectDay = (day: number) => {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const monthStr = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
    const formattedDate = `${dayStr}/${monthStr}/${currentYear}`;
    setSelectedDate(formattedDate);

    if (entries?.[formattedDate]) {
      setMood(entries[formattedDate].mood);
      setText(entries[formattedDate].text);
    } else {
      setMood('Em Paz');
      setText('');
    }
  };

  const requestLocation = async () => {
    setLocLoading(true);
    setLocError(false);
    try {
      const { Location } = require('expo-location');
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocError(true);
        setLocLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    } catch (err) {
      setLocError(true);
    } finally {
      setLocLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const processedCaps = capsFortaleza.map(caps => {
    if (!userCoords) return { ...caps, distance: null };
    const dist = calculateDistance(userCoords.latitude, userCoords.longitude, caps.lat, caps.lon);
    return { ...caps, distance: dist };
  }).sort((a, b) => {
    if (a.distance === null) return 0;
    return (a.distance ?? 0) - (b.distance ?? 0);
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.centerWrapper}>
        <Lock size={28} color="#1E293B" strokeWidth={1.5} />
        <Text style={styles.centerTitle}>Espaço Privado</Text>
        <Text style={styles.centerSubtitle}>Por favor, faça login na tela inicial para aceder.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.subNavbarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subNavbarScroll}>
          {[
            { id: 'calendar', label: 'Diário', icon: CalendarIcon },
            { id: 'chat', label: 'Chat de Escuta', icon: MessageSquare },
            { id: 'support', label: 'Redes de Apoio', icon: LifeBuoy },
            { id: 'tips', label: 'Técnicas', icon: Zap },
          ].map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.subTabChip, subTab === item.id && styles.subTabChipActive]} 
              onPress={() => setSubTab(item.id as any)}
            >
              <item.icon size={14} color={subTab === item.id ? "#FFFFFF" : "#64748B"} strokeWidth={2} />
              <Text style={[styles.subTabChipText, subTab === item.id && styles.subTabChipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {subTab === 'calendar' && (
          <View>
            <Text style={styles.calendarMonthTitle}>{monthNames[currentMonth]} {currentYear}</Text>
            <View style={styles.calendarCard}>
              <View style={styles.weekDaysRow}>
                {daysOfWeek.map((d, idx) => <Text key={idx} style={styles.weekDayLabel}>{d}</Text>)}
              </View>
              <View style={styles.daysGrid}>
                {calendarCells.map((day, idx) => {
                  if (day === null) return <View key={`empty-${idx}`} style={styles.dayCellEmpty} />;
                  const dayStr = day < 10 ? `0${day}` : `${day}`;
                  const monthStr = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
                  const formattedDate = `${dayStr}/${monthStr}/${currentYear}`;
                  const isSelected = selectedDate === formattedDate;
                  const hasEntry = hasEntryOnDate(formattedDate);
                  
                  return (
                    <TouchableOpacity 
                      key={`day-${day}`} 
                      style={[styles.dayCell, hasEntry && styles.dayCellWithEntry, isSelected && styles.dayCellSelected]} 
                      onPress={() => handleSelectDay(day)}
                    >
                      <Text style={[styles.dayNumberText, isSelected && styles.dayNumberTextSelected, hasEntry && !isSelected && styles.dayNumberWithEntryText]}>
                        {day}
                      </Text>
                      {hasEntry && !isSelected && <View style={styles.premiumDotMarker} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.journalPaper}>
              <Text style={styles.journalLabel}>Reflexão consciente: {selectedDate}</Text>
              <View style={styles.moodSelectorRow}>
                {['Radiante', 'Em Paz', 'Tenso', 'Exausto'].map(m => (
                  <TouchableOpacity key={m} style={[styles.moodChip, mood === m && styles.moodChipActive]} onPress={() => setMood(m)}>
                    <Text style={[styles.moodChipText, mood === m && styles.moodChipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput 
                style={styles.journalInput} 
                placeholder="Deixe fluir os seus pensamentos com total honestidade..." 
                placeholderTextColor="#94A3B8" 
                value={text} 
                onChangeText={setText} 
                multiline 
              />
              <TouchableOpacity style={styles.publishBtn} onPress={() => { if(text.trim()) addEntry(selectedDate, mood, text); }}>
                <Text style={styles.publishBtnText}>arquivar reflexão</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {subTab === 'chat' && (
          <View style={styles.chatBox}>
            <ScrollView contentContainerStyle={styles.chatLogContainer} showsVerticalScrollIndicator={false}>
              {chatLog.map((chat, idx) => (
                <View key={idx} style={[styles.chatBubble, chat.sender === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                  <Text style={[styles.chatBubbleText, chat.sender === 'user' ? styles.textUser : styles.textAi]}>{chat.msg}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInputRow}>
              <TextInput 
                style={styles.chatTextInput} 
                placeholder="Escreva o que está na sua mente..." 
                placeholderTextColor="#94A3B8" 
                value={chatInput} 
                onChangeText={setChatInput} 
              />
              <TouchableOpacity style={styles.chatSendBtn} onPress={() => {
                if (!chatInput.trim()) return;
                setChatLog(prev => [...prev, { sender: 'user', msg: chatInput }]);
                setChatInput('');
                setTimeout(() => {
                  setChatLog(prev => [...prev, { sender: 'ai', msg: 'Acolho as suas palavras. Continue no seu tempo, sem pressa nem julgamentos.' }]);
                }, 800);
              }}>
                <Send size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {subTab === 'support' && (
          <View style={styles.supportListContainer}>
            <View style={styles.supportHeaderRow}>
              <View>
                <Text style={styles.sectionTabTitle}>Acolhimento Presencial</Text>
                <Text style={styles.sectionSubtitle}>Unidades CAPS estruturadas em Fortaleza</Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.geoTriggerBtn, userCoords && styles.geoTriggerBtnActive]} 
                onPress={requestLocation}
                disabled={locLoading}
              >
                <MapPin size={12} color={userCoords ? "#FFFFFF" : "#475569"} />
                <Text style={[styles.geoTriggerText, userCoords && styles.geoTriggerTextActive]}>
                  {locLoading ? 'A buscar...' : userCoords ? 'Mais próximos' : 'Ativar GPS'}
                </Text>
              </TouchableOpacity>
            </View>

            {locError && (
              <Text style={styles.locationErrorText}>
                Não foi possível obter a localização. Exibindo lista padrão.
              </Text>
            )}

            {processedCaps.map((caps) => (
              <View key={caps.id} style={styles.supportCard}>
                <View style={styles.cardHeaderWithIcon}>
                  <View style={styles.capsIconBadge}>
                    <LifeBuoy size={16} color="#1E293B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.supportCardTitle}>{caps.name}</Text>
                    <Text style={styles.supportCardAddress}>{caps.address}</Text>
                  </View>
                  {caps.distance !== null && (
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceBadgeText}>{caps.distance.toFixed(1)} km</Text>
                    </View>
                  )}
                </View>

                <View style={styles.capsActionRow}>
                  <TouchableOpacity 
                    style={styles.capsActionCallBtn} 
                    onPress={() => Linking.openURL(`tel:${caps.phone.replace(/[^0-9]/g, '')}`)}
                  >
                    <PhoneCall size={12} color="#1E293B" />
                    <Text style={styles.capsActionCallText}>Ligar: {caps.phone}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.capsActionRouteBtn} 
                    onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${caps.lat},${caps.lon}`)}
                  >
                    <ExternalLink size={12} color="#64748B" />
                    <Text style={styles.capsActionRouteText}>Ver no Mapa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {subTab === 'tips' && (
          <View style={styles.tipCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <ShieldCheck size={18} color="#1E293B" strokeWidth={2} />
              <Text style={styles.tipCardTitle}>Âncora dos cinco sentidos (5-4-3-2-1)</Text>
            </View>
            <Text style={styles.tipCardDesc}>
              Se sentir os seus pensamentos dispersos ou em turbulência, faça uma pausa e procure listar mentalmente:{"\n\n"}
              • <Text style={{fontWeight: '600'}}>5</Text> coisas visíveis ao seu redor.{"\n"}
              • <Text style={{fontWeight: '600'}}>4</Text> elementos que consiga tocar fisicamente.{"\n"}
              • <Text style={{fontWeight: '600'}}>3</Text> sons distintos ao fundo.{"\n"}
              • <Text style={{fontWeight: '600'}}>2</Text> odores ou cheiros do ambiente.{"\n"}
              • <Text style={{fontWeight: '600'}}>1</Text> sabor na boca.
            </Text>
          </View>
        )}

      </ScrollView>

      <View style={styles.emergencyFabContainer}>
        <TouchableOpacity style={styles.emergencyFabCircle} onPress={() => Linking.openURL('tel:188')}>
          <PhoneCall size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.miniFloatBarContainer}>
        <View style={styles.miniFloatBar}>
          <TouchableOpacity style={styles.miniBarItem} onPress={() => router.push('/')}>
            <Sliders size={14} color="#1E293B" />
            <Text style={styles.miniBarLabel}>Práticas</Text>
          </TouchableOpacity>
          <View style={styles.miniBarDivider} />
          <TouchableOpacity style={[styles.miniBarItem, styles.miniBarItemActive]}>
            <BookOpen size={14} color="#1E293B" />
            <Text style={styles.miniBarLabelActive}>Diário</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ... Manter os seus estilos originais idênticos aqui embaixo ...
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#FAF9F6' },
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 180 },
  subNavbarContainer: { paddingTop: 60, paddingBottom: 10, backgroundColor: '#FAF9F6', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  subNavbarScroll: { paddingHorizontal: 24, gap: 6 },
  subTabChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  subTabChipActive: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  subTabChipText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  subTabChipTextActive: { color: '#FFFFFF', fontWeight: '500' },
  calendarMonthTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 14, marginBottom: 12 },
  calendarCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 6 },
  weekDayLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', width: 32, textAlign: 'center' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  dayCell: { width: `${100 / 7}%`, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  dayCellEmpty: { width: `${100 / 7}%`, height: 40 },
  dayCellWithEntry: { backgroundColor: '#FAF9F6' },
  dayCellSelected: { backgroundColor: '#1E293B' },
  dayNumberText: { fontSize: 12, color: '#64748B' },
  dayNumberTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  dayNumberWithEntryText: { color: '#1E293B', fontWeight: '500' },
  premiumDotMarker: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#1E293B', position: 'absolute', bottom: 4 },
  journalPaper: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 16 },
  journalLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  moodSelectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  moodChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FAF9F6', borderWidth: 1, borderColor: '#E2E8F0' },
  moodChipActive: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  moodChipText: { fontSize: 12, color: '#64748B' },
  moodChipTextActive: { color: '#FFFFFF', fontWeight: '500' },
  journalInput: { minHeight: 90, textAlignVertical: 'top', fontSize: 13, color: '#1E293B', marginBottom: 14, lineHeight: 20 },
  publishBtn: { backgroundColor: '#1E293B', padding: 12, borderRadius: 10, alignItems: 'center' },
  publishBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  chatBox: { marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, minHeight: 380, justifyContent: 'space-between' },
  chatLogContainer: { flex: 1, gap: 12, marginBottom: 16 },
  chatBubble: { maxWidth: '85%', padding: 12, borderRadius: 12 },
  bubbleAi: { backgroundColor: '#FAF9F6', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E2E8F0' },
  bubbleUser: { backgroundColor: '#1E293B', alignSelf: 'flex-end' },
  chatBubbleText: { fontSize: 13, lineHeight: 20 },
  textAi: { color: '#334155' },
  textUser: { color: '#FFFFFF' },
  chatInputRow: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  chatTextInput: { flex: 1, backgroundColor: '#FAF9F6', paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 13, color: '#1E293B' },
  chatSendBtn: { backgroundColor: '#1E293B', width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  supportListContainer: { gap: 12, marginTop: 8 },
  sectionTabTitle: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  supportCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeaderWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  supportCardTitle: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  supportCardDesc: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 14 },
  actionLinkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FAF9F6', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  actionLinkText: { color: '#475569', fontSize: 12, fontWeight: '500' },
  tipCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 12 },
  tipCardTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  tipCardDesc: { fontSize: 13, color: '#64748B', lineHeight: 20 },
  emergencyFabContainer: { position: 'absolute', bottom: 104, right: 24, zIndex: 99 },
  emergencyFabCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#E11D48', justifyContent: 'center', alignItems: 'center', shadowColor: '#E11D48', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  miniFloatBarContainer: { position: 'absolute', bottom: 28, left: 0, right: 0, alignItems: 'center', zIndex: 99 },
  miniFloatBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 30, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', gap: 16, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
  miniBarItem: { alignItems: 'center', minWidth: 60, flexDirection: 'row', gap: 6, opacity: 0.4 },
  miniBarItemActive: { opacity: 1 },
  miniBarLabel: { fontSize: 11, color: '#1E293B', fontWeight: '500' },
  miniBarLabelActive: { fontSize: 11, color: '#1E293B', fontWeight: '600' },
  miniBarDivider: { width: 1, height: 16, backgroundColor: '#E2E8F0' },
  centerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF9F6', padding: 24 },
  centerTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginTop: 8 },
  centerSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4 },
  supportHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  geoTriggerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  geoTriggerBtnActive: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  geoTriggerText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  geoTriggerTextActive: { color: '#FFFFFF' },
  locationErrorText: { fontSize: 11, color: '#E11D48', marginBottom: 12, fontWeight: '500' },
  capsIconBadge: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FAF9F6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  supportCardAddress: { fontSize: 11, color: '#64748B', marginTop: 2 },
  distanceBadge: { backgroundColor: '#FAF9F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  distanceBadgeText: { fontSize: 11, fontWeight: '700', color: '#1E293B' },
  capsActionRow: { flexDirection: 'row', gap: 8, marginTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  capsActionCallBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FAF9F6', paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  capsActionCallText: { fontSize: 11, fontWeight: '600', color: '#1E293B' },
  capsActionRouteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  capsActionRouteText: { fontSize: 11, fontWeight: '500', color: '#64748B' }
});