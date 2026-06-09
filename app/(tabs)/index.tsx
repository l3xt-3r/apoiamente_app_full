import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, Animated, Pressable, Linking, Dimensions, Alert } from 'react-native';
// @ts-ignore: resolved AppContext.tsx but project JSX config prevents module parsing
import { useApp } from '../../context/AppContext';
import { useRouter } from 'expo-router';
import { Wind, Flower, PhoneCall, BookOpen, UserPlus, LogIn, ChevronRight, ChevronLeft, ChevronDown, User, Feather as LucideFeather, Play, Square, RefreshCw, Camera, Sliders } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const { isAuthenticated, userName, userPhoto, login, logout, updateProfile } = useApp();
  const router = useRouter();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'profile' | 'meditation' | 'breathing'>('none');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhoto, setEditedPhoto] = useState('');

  const [medTimeLeft, setMedTimeLeft] = useState(300);
  const [isMedActive, setIsMedActive] = useState(false);
  const medIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [breathPhase, setBreathPhase] = useState<'Inspirar' | 'Prender' | 'Expirar'>('Inspirar');
  const [breathCount, setBreathCount] = useState(4);
  const [isBreathActive, setIsBreathActive] = useState(false);
  const breathIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slideLeftAnim = useRef(new Animated.Value(-320)).current;
  const slideBottomAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const breathCircleScale = useRef(new Animated.Value(1)).current;
  const logoImage = require('../../assets/Logo.png');

  useEffect(() => {
    if (activeDrawer === 'profile') {
      setEditedName(userName || '');
      setEditedPhoto(userPhoto || '');
    }
  }, [activeDrawer, userName, userPhoto]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para mudar a foto de perfil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setEditedPhoto(result.assets[0].uri);
  };

  useEffect(() => {
    if (isMedActive) {
      medIntervalRef.current = setInterval(() => {
        setMedTimeLeft((prev) => {
          if (prev <= 1) { clearInterval(medIntervalRef.current!); setIsMedActive(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else if (medIntervalRef.current) {
      clearInterval(medIntervalRef.current);
    }
    return () => { if (medIntervalRef.current) clearInterval(medIntervalRef.current); };
  }, [isMedActive]);

  useEffect(() => {
    if (isBreathActive) {
      triggerBreathAnimation(breathPhase);
      breathIntervalRef.current = setInterval(() => {
        setBreathCount((prev) => {
          if (prev <= 1) {
            setBreathPhase((currentPhase) => {
              let nextPhase: 'Inspirar' | 'Prender' | 'Expirar' = 'Inspirar';
              if (currentPhase === 'Inspirar') nextPhase = 'Prender';
              else if (currentPhase === 'Prender') nextPhase = 'Expirar';
              else nextPhase = 'Inspirar';
              triggerBreathAnimation(nextPhase);
              return nextPhase;
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      Animated.spring(breathCircleScale, { toValue: 1, useNativeDriver: true }).start();
    }
    return () => { if (breathIntervalRef.current) clearInterval(breathIntervalRef.current); };
  }, [isBreathActive, breathPhase]);

  const triggerBreathAnimation = (phase: 'Inspirar' | 'Prender' | 'Expirar') => {
    if (phase === 'Inspirar') {
      Animated.timing(breathCircleScale, { toValue: 1.4, duration: 4000, useNativeDriver: true }).start();
    } else if (phase === 'Expirar') {
      Animated.timing(breathCircleScale, { toValue: 1, duration: 4000, useNativeDriver: true }).start();
    }
  };

  const formatMedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const openProfileDrawer = () => {
    setActiveDrawer('profile');
    Animated.parallel([
      Animated.timing(slideLeftAnim, { toValue: 0, duration: 250, useNativeDriver: false }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: false })
    ]).start();
  };

  const openBottomDrawer = (type: 'meditation' | 'breathing') => {
    setActiveDrawer(type);
    Animated.parallel([
      Animated.timing(slideBottomAnim, { toValue: 0, duration: 280, useNativeDriver: false }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 280, useNativeDriver: false })
    ]).start();
  };

  const closeAllDrawers = () => {
    setIsMedActive(false);
    setIsBreathActive(false);
    setIsEditingProfile(false);
    setBreathPhase('Inspirar');
    setBreathCount(4);
    Animated.parallel([
      Animated.timing(slideLeftAnim, { toValue: -320, duration: 220, useNativeDriver: false }),
      Animated.timing(slideBottomAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: false }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 220, useNativeDriver: false })
    ]).start(() => setActiveDrawer('none'));
  };

  if (!isAuthenticated) {
    return (
      <KeyboardAvoidingView 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
  >
    <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.authWrapper}>
        <View style={styles.authCard}>
          <Image source={logoImage} style={styles.authLogo} resizeMode="contain" />
          <Text style={styles.authSubtitle}>{isRegistering ? 'Crie sua conta para começar!' : 'Sua pausa diária para clareza mental.'}</Text>
          {isRegistering && (
            <TextInput style={styles.authInput} placeholder="Seu nome" value={name} onChangeText={setName} placeholderTextColor="#94A3B8" />
          )}
          <TextInput style={styles.authInput} placeholder="E-mail" value={email} onChangeText={setEmail} placeholderTextColor="#94A3B8" autoCapitalize="none" />
          <TextInput style={styles.authInput} placeholder="Senha" value={password} onChangeText={setPassword} placeholderTextColor="#94A3B8" secureTextEntry />
          <TouchableOpacity style={styles.authBtn} onPress={async () => { 
            if(email && password) {
              if(isRegistering && name) await updateProfile(name, '');
              await login(email, password); 
            }
          }}>
            <Text style={styles.authBtnText}>{isRegistering ? 'Criar Conta' : 'Entrar no Espaço'}</Text>
            {isRegistering ? <UserPlus size={18} color="#FFF" /> : <LogIn size={18} color="#FFF" />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleAuthBtn} onPress={() => setIsRegistering(!isRegistering)}>
            <Text style={styles.toggleAuthText}>
              {isRegistering ? 'Já tem uma conta? Entre' : 'Não tem conta? Cadastre-se'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
    </ScrollView>
  </KeyboardAvoidingView>
  );
  }

  return (
    <View style={styles.wrapper}>

      {/* DRAWERS OVERLAY */}
      {activeDrawer !== 'none' && (
        <Animated.View style={[styles.drawerOverlay, { opacity: opacityAnim }]}>
          <Pressable style={styles.absoluteDismiss} onPress={closeAllDrawers} />
          
          {activeDrawer === 'profile' && (
            <Animated.View style={[styles.drawerContentLeft, { transform: [{ translateX: slideLeftAnim }] }]}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>perfil</Text>
                <TouchableOpacity onPress={closeAllDrawers} style={styles.closeBtn}><ChevronLeft size={20} color="#64748B" /></TouchableOpacity>
              </View>
              <View style={styles.identityCard}>
                <TouchableOpacity disabled={!isEditingProfile} onPress={pickImage} style={styles.avatarContainer} activeOpacity={0.8}>
                  {editedPhoto || userPhoto ? (
                    <Image source={{ uri: editedPhoto || userPhoto }} style={styles.bigAvatar} />
                  ) : (
                    <View style={styles.bigAvatarPlaceholder}><User size={32} color="#94A3B8" /></View>
                  )}
                  {isEditingProfile && (
                    <View style={styles.avatarUploadOverlay}><Camera size={16} color="#FFF" /></View>
                  )}
                </TouchableOpacity>
                {isEditingProfile ? (
                  <View style={styles.editForm}>
                    <TextInput style={styles.profileInput} placeholder="Seu nome" value={editedName} onChangeText={setEditedName} placeholderTextColor="#94A3B8" />
                    <View style={styles.profileEditActionsRow}>
                      <TouchableOpacity style={[styles.profileActionBtn, styles.saveProfileBtn]} onPress={async () => { await updateProfile(editedName, editedPhoto); setIsEditingProfile(false); }}>
                        <Text style={styles.saveProfileText}>Salvar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.profileActionBtn, styles.cancelProfileBtn]} onPress={() => { setEditedName(userName || ''); setEditedPhoto(userPhoto || ''); setIsEditingProfile(false); }}>
                        <Text style={styles.cancelProfileText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', width: '100%' }}>
                    <Text style={styles.identityName}>{userName}</Text>
                    <TouchableOpacity style={styles.editProfileTrigger} onPress={() => setIsEditingProfile(true)}>
                      <Text style={styles.editProfileTriggerText}>Editar Perfil</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Text style={styles.logoutText}>desconectar</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {(activeDrawer === 'meditation' || activeDrawer === 'breathing') && (
            <Animated.View style={[styles.drawerContentBottom, { transform: [{ translateY: slideBottomAnim }] }]}>
              <View style={styles.bottomDrawerIndicator} />
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>
                  {activeDrawer === 'meditation' ? 'meditação silenciosa' : 'exercício respiratório'}
                </Text>
                <TouchableOpacity onPress={closeAllDrawers} style={styles.closeBtn}><ChevronDown size={20} color="#64748B" /></TouchableOpacity>
              </View>
              {activeDrawer === 'meditation' ? (
                <View style={styles.practiceContainer}>
                  <Flower size={32} color="#1E293B" strokeWidth={1.5} />
                  <Text style={styles.timerNumbers}>{formatMedTime(medTimeLeft)}</Text>
                  <Text style={styles.practiceStateLabel}>{isMedActive ? 'Silencie sua mente...' : 'Pronto para começar?'}</Text>
                  <View style={styles.controlsRow}>
                    <TouchableOpacity style={styles.controlBtn} onPress={() => setIsMedActive(!isMedActive)}>
                      {isMedActive ? <Square size={16} color="#FFF" /> : <Play size={16} color="#FFF" fill="#FFF" />}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.controlBtn, styles.controlBtnSecondary]} onPress={() => { setIsMedActive(false); setMedTimeLeft(300); }}>
                      <RefreshCw size={16} color="#1E293B" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.practiceContainer}>
                  <Animated.View style={[styles.breathVisualCircle, { transform: [{ scale: breathCircleScale }] }]}>
                    <Wind size={24} color="#1E293B" strokeWidth={1.5} />
                  </Animated.View>
                  <Text style={styles.breathPhaseText}>{isBreathActive ? `${breathPhase} (${breathCount}s)` : 'Respiração Quadrada'}</Text>
                  <TouchableOpacity style={[styles.actionToggleActiveBtn, isBreathActive && styles.actionToggleActiveBtnStop]} onPress={() => setIsBreathActive(!isBreathActive)}>
                    <Text style={[styles.actionToggleActiveText, isBreathActive && styles.actionToggleActiveTextStop]}>
                      {isBreathActive ? 'Parar Exercício' : 'Iniciar Ciclo 4-4-4'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          )}
        </Animated.View>
      )}

      {/* BARRA SUPERIOR — fixada fora do scroll */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.profileTrigger} onPress={openProfileDrawer}>
          {userPhoto
            ? <Image source={{ uri: userPhoto }} style={styles.avatarMini} />
            : <View style={styles.avatarMiniPlaceholder}><User size={14} color="#64748B" /></View>
          }
          <View>
            <Text style={styles.greetingHeader}>espaço de</Text>
            <Text style={styles.nameHeader}>{userName}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* SCROLL envolve TODO o conteúdo abaixo da topBar */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>PRÁTICAS SUGERIDAS</Text>
        <View style={styles.row2Col}>
          <TouchableOpacity style={styles.card2Col} activeOpacity={0.7} onPress={() => openBottomDrawer('meditation')}>
            <View>
              <View style={styles.iconCircle}><Ionicons name="flower-outline" size={24} color="black" /></View>
              <Text style={styles.cardTitle}>Meditação:{"\n"}Silêncio Ativo</Text>
              <Text style={styles.cardDesc}>Reduza o estresse e aumente sua presença no momento.</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card2Col} activeOpacity={0.7} onPress={() => openBottomDrawer('breathing')}>
            <View>
              <View style={styles.iconCircle}><Entypo name="air" size={24} color="black" /></View>
              <Text style={styles.cardTitle}>Respiração:{"\n"}Foco 4-4-4</Text>
              <Text style={styles.cardDesc}>Respire com equilíbrio e acalme sua mente.</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>ACESSOS RÁPIDOS</Text>
        <View style={styles.row3Col}>
          <TouchableOpacity style={styles.card3Col} activeOpacity={0.7} onPress={() => router.push({ pathname: '/diary', params: { tab: 'chat' } })}>
            <View>
              <View style={styles.iconCircle}><Ionicons name="chatbox-outline" size={24} color="black" /></View>
              <Text style={styles.cardTitle}>Chat de{"\n"}Escuta</Text>
              <Text style={styles.cardDesc}>Este é o seu espaço seguro de escuta.</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card3Col} activeOpacity={0.7} onPress={() => router.push({ pathname: '/diary', params: { tab: 'support' } })}>
            <View>
              <View style={styles.iconCircle}><Feather name="life-buoy" size={24} color="black" /></View>
              <Text style={styles.cardTitle}>Redes de{"\n"}Apoio</Text>
              <Text style={styles.cardDesc}>Locais presenciais de apoio.</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card3Col} activeOpacity={0.7} onPress={() => router.push({ pathname: '/diary', params: { tab: 'tips' } })}>
            <View>
              <View style={styles.iconCircle}><MaterialCommunityIcons name="flash-outline" size={24} color="black" /></View>
              <Text style={styles.cardTitle}>Técnicas</Text>
              <Text style={styles.cardDesc}>Dicas de apoio e bem-estar.</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>CHECK-IN DIÁRIO</Text>
        <View style={styles.checkinCard}>
          <View style={styles.checkinLeft}>
            <View style={styles.emojiContainer}>
              <SimpleLineIcons name="emotsmile" size={24} color="black" />
            </View>
            <View style={styles.checkinTextContainer}>
              <Text style={styles.checkinTitle}>Como você está se sentindo hoje?</Text>
              <Text style={styles.checkinDesc}>Registre seu estado emocional e acompanhe sua jornada.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push({ pathname: '/diary', params: { tab: 'diary' } })}>
            <Text style={styles.registerBtnText}>Registrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FAB EMERGÊNCIA */}
      <View style={styles.emergencyFabContainer}>
        <TouchableOpacity style={styles.emergencyFabCircle} onPress={() => Linking.openURL('tel:188')}>
          <PhoneCall size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* BARRA FLUTUANTE INFERIOR */}
      <View style={styles.miniFloatBarContainer}>
        <View style={styles.miniFloatBar}>
          <TouchableOpacity style={styles.miniBarItem} onPress={() => router.push('/')}>
            <Sliders size={14} color="#1E293B" />
            <Text style={styles.miniBarLabel}>Práticas</Text>
          </TouchableOpacity>
          <View style={styles.miniBarDivider} />
          <TouchableOpacity style={[styles.miniBarItem, styles.miniBarItemActive]} onPress={() => router.push({ pathname: '/diary', params: { tab: 'diary' } })}>
            <BookOpen size={14} color="#1E293B" />
            <Text style={styles.miniBarLabelActive}>Diário</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#FAF9F6' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120, paddingTop: 8 },

  topBar: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, flexDirection: 'row', alignItems: 'center' },
  profileTrigger: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarMini: { width: 36, height: 36, borderRadius: 18 },
  avatarMiniPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  greetingHeader: { fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  nameHeader: { fontSize: 14, color: '#1E293B', fontWeight: '700' },

  authWrapper: { flex: 1, backgroundColor: '#FAF9F6', justifyContent: 'center', padding: 24 },
  authCard: { width: '100%', maxWidth: 320, alignSelf: 'center' },
  authTitle: { fontSize: 32, fontWeight: '700', color: '#1E293B', textAlign: 'center', letterSpacing: -1 },
  authSubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 32, marginTop: 4 },
  authInput: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12, fontSize: 14 },
  authBtn: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  authBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  toggleAuthBtn: { marginTop: 24, alignItems: 'center' },
  toggleAuthText: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  authLogo: { width: 400, height: 400, alignSelf: 'center', marginBottom: -100 },

  emergencyFabContainer: { position: 'absolute', bottom: 104, right: 24, zIndex: 99 },
  emergencyFabCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#E11D48', justifyContent: 'center', alignItems: 'center', shadowColor: '#E11D48', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },

  drawerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 999 },
  absoluteDismiss: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  drawerContentLeft: { backgroundColor: '#FAF9F6', width: '80%', height: '100%', padding: 24, paddingTop: 60 },
  drawerContentBottom: { backgroundColor: '#FAF9F6', width: '100%', height: '65%', position: 'absolute', bottom: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 16 },
  bottomDrawerIndicator: { width: 36, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  drawerTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: '#94A3B8', letterSpacing: 1 },
  closeBtn: { padding: 4 },
  identityCard: { alignItems: 'center', marginBottom: 40, width: '100%' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, position: 'relative', overflow: 'hidden' },
  bigAvatar: { width: 80, height: 80, borderRadius: 40 },
  bigAvatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  avatarUploadOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  identityName: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  logoutBtn: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FDA4AF', alignItems: 'center', marginTop: 'auto' },
  logoutText: { color: '#E11D48', fontWeight: '600' },
  editForm: { width: '100%', marginTop: 16, gap: 10 },
  profileInput: { backgroundColor: '#FFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 13, color: '#1E293B', width: '100%' },
  profileEditActionsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  profileActionBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  saveProfileBtn: { backgroundColor: '#1E293B' },
  saveProfileText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  cancelProfileBtn: { borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  cancelProfileText: { color: '#64748B', fontSize: 12, fontWeight: '500' },
  editProfileTrigger: { marginTop: 6, paddingHorizontal: 12, paddingVertical: 4 },
  editProfileTriggerText: { color: '#64748B', fontSize: 12, fontWeight: '500', textDecorationLine: 'underline' },

  practiceContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 24 },
  timerNumbers: { fontSize: 48, fontWeight: '300', color: '#1E293B', letterSpacing: -1, marginTop: 8 },
  practiceStateLabel: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 24 },
  controlsRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  controlBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  controlBtnSecondary: { backgroundColor: '#E2E8F0' },
  breathVisualCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  breathPhaseText: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 24 },
  actionToggleActiveBtn: { backgroundColor: '#1E293B', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  actionToggleActiveBtnStop: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FDA4AF' },
  actionToggleActiveText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  actionToggleActiveTextStop: { color: '#E11D48' },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  row2Col: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  row3Col: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  card2Col: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'space-between',
    minHeight: 180,
  },
  card3Col: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'space-between',
    minHeight: 190,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 6, lineHeight: 20 },
  cardDesc: { fontSize: 12, color: '#64748B', lineHeight: 16, marginBottom: 12 },
  arrow: { fontSize: 20, color: '#94A3B8', alignSelf: 'flex-end' },

  miniFloatBarContainer: { position: 'absolute', bottom: 28, left: 0, right: 0, alignItems: 'center', zIndex: 99 },
  miniFloatBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 30, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', gap: 16, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
  miniBarItem: { alignItems: 'center', minWidth: 60, flexDirection: 'row', gap: 6, opacity: 0.4 },
  miniBarLabel: { fontSize: 11, color: '#1E293B', fontWeight: '600' },
  miniBarDivider: { width: 1, height: 16, backgroundColor: '#E2E8F0' },
  miniBarItemActive: { opacity: 1 },
  miniBarLabelActive: { fontSize: 11, color: '#1E293B', fontWeight: '600' },

  checkinCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  checkinLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkinTextContainer: { flex: 1 },
  checkinTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  checkinDesc: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  registerBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 10,
  },
  registerBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  blockTitle: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
  sessionCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sessionCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  sessionTitleText: { fontSize: 14, fontWeight: '500', color: '#1E293B' },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 180 },
  fabContainer: { position: 'absolute', bottom: 104, right: 24, zIndex: 99 },
  fabCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  iconText: { fontSize: 18, color: '#1E293B' },
});