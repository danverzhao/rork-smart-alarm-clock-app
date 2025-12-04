import { useAlarms } from '@/contexts/AlarmContext';
import { useRouter } from 'expo-router';
import { Plus, Power, PowerOff, Trash2, Clock, Bell, Settings } from 'lucide-react-native';
import React, { useCallback, useRef, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Animated,
  PanResponder,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import type { Alarm } from '@/types/alarm';

function AlarmItem({ alarm }: { alarm: Alarm }) {
  const { toggleAlarm, deleteAlarm } = useAlarms();
  const translateX = useRef(new Animated.Value(0)).current;
  const isSwipedRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          const newValue = Math.max(gestureState.dx, -80);
          translateX.setValue(newValue);
        } else if (isSwipedRef.current) {
          const newValue = Math.min(gestureState.dx - 80, 0);
          translateX.setValue(newValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40) {
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
          isSwipedRef.current = true;
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
          isSwipedRef.current = false;
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Delete Alarm', 'Are you sure you want to delete this alarm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteAlarm(alarm.id),
      },
    ]);
  };

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleAlarm(alarm.id);
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return { time: `${displayHour}:${displayMinute}`, period };
  };

  const { time, period } = formatTime(alarm.hour, alarm.minute);

  return (
    <View style={styles.alarmItemContainer}>
      <Animated.View style={[styles.deleteButton, { opacity: translateX.interpolate({
        inputRange: [-80, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp'
      })}]}>
        <Pressable style={styles.deleteButtonInner} onPress={handleDelete}>
          <Trash2 size={20} color="#ffffff" />
        </Pressable>
      </Animated.View>
      <Animated.View
        style={[
          styles.alarmItem,
          { transform: [{ translateX }] },
          !alarm.isEnabled && styles.alarmItemDisabled,
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.alarmContent}>
          <View style={styles.alarmTimeContainer}>
            <Text style={[styles.alarmTime, !alarm.isEnabled && styles.alarmTimeDisabled]}>
              {time}
            </Text>
            <Text style={[styles.alarmPeriod, !alarm.isEnabled && styles.alarmPeriodDisabled]}>
              {period}
            </Text>
          </View>
          {alarm.label ? (
            <Text style={[styles.alarmLabel, !alarm.isEnabled && styles.alarmLabelDisabled]}>
              {alarm.label}
            </Text>
          ) : null}
        </View>
        <Switch
          value={alarm.isEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: '#3e3e3e', true: '#34C759' }}
          thumbColor="#ffffff"
        />
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { alarms, isLoading, alarmDuration, defaultSound, soundOptions, enableAll, disableAll, clearAll, updateAlarmDuration, updateDefaultSound } = useAlarms();
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  const ringingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [tempDuration, setTempDuration] = useState<string>('5');
  const [tempSound, setTempSound] = useState<string>('default');

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const alarmId = notification.request.content.data.alarmId as string;
      const triggeredAlarm = alarms.find((a) => a.id === alarmId);

      if (triggeredAlarm && !ringingAlarm) {
        console.log('Alarm notification received:', triggeredAlarm);
        setRingingAlarm(triggeredAlarm);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        ringingTimeoutRef.current = setTimeout(() => {
          console.log('Auto-stopping alarm');
          setRingingAlarm(null);
        }, alarmDuration * 1000);
      }
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const alarmId = response.notification.request.content.data.alarmId as string;
      const triggeredAlarm = alarms.find((a) => a.id === alarmId);

      if (triggeredAlarm) {
        console.log('Alarm notification tapped:', triggeredAlarm);
        setRingingAlarm(triggeredAlarm);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        ringingTimeoutRef.current = setTimeout(() => {
          console.log('Auto-stopping alarm');
          setRingingAlarm(null);
        }, alarmDuration * 1000);
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
      if (ringingTimeoutRef.current) {
        clearTimeout(ringingTimeoutRef.current);
      }
    };
  }, [alarms, ringingAlarm, alarmDuration]);

  const handleEnableAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    enableAll();
  }, [enableAll]);

  const handleDisableAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    disableAll();
  }, [disableAll]);

  const handleClearAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Clear All Alarms',
      'Are you sure you want to delete all alarms? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAll,
        },
      ]
    );
  }, [clearAll]);

  const handleAddAlarm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/add-alarm' as any);
  };

  const handleMultipleAlarms = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/multiple-alarms' as any);
  };

  const handleOpenSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempDuration(alarmDuration.toString());
    setTempSound(defaultSound);
    setShowSettings(true);
  };

  const handleSaveSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const duration = parseInt(tempDuration, 10);
    if (!isNaN(duration) && duration > 0 && duration <= 300) {
      updateAlarmDuration(duration);
      updateDefaultSound(tempSound);
      setShowSettings(false);
    } else {
      Alert.alert('Invalid Duration', 'Please enter a duration between 1 and 300 seconds.');
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#16213e']} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <>
    <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Clock size={32} color="#ffffff" strokeWidth={2.5} />
            <Text style={styles.headerTitle}>Alarms</Text>
          </View>
          {alarms.length > 0 && (
            <View style={styles.bulkActions}>
              <Pressable
                style={({ pressed }) => [styles.bulkButton, pressed && styles.buttonPressed]}
                onPress={handleEnableAll}
              >
                <Power size={18} color="#34C759" />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.bulkButton, pressed && styles.buttonPressed]}
                onPress={handleDisableAll}
              >
                <PowerOff size={18} color="#FF9500" />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.bulkButton, pressed && styles.buttonPressed]}
                onPress={handleClearAll}
              >
                <Trash2 size={18} color="#FF3B30" />
              </Pressable>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {alarms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Clock size={80} color="#ffffff20" strokeWidth={1.5} />
              <Text style={styles.emptyText}>No alarms set</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add your first alarm</Text>
            </View>
          ) : (
            <View style={styles.alarmsContainer}>
              {alarms.map((alarm) => (
                <AlarmItem key={alarm.id} alarm={alarm} />
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleMultipleAlarms}
          >
            <Clock size={20} color="#ffffff" />
            <Text style={styles.secondaryButtonText}>Multiple</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
            onPress={handleAddAlarm}
          >
            <Plus size={32} color="#ffffff" strokeWidth={2.5} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleOpenSettings}
          >
            <Settings size={20} color="#ffffff" />
            <Text style={styles.secondaryButtonText}>Settings</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>

    {ringingAlarm && (
      <Pressable 
        style={styles.ringingOverlay}
        onPress={() => {
          console.log('Notification dismissed by tap');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (ringingTimeoutRef.current) {
            clearTimeout(ringingTimeoutRef.current);
          }
          setRingingAlarm(null);
        }}
      >
        <View style={styles.ringingContainer}>
          <View style={styles.ringingIconContainer}>
            <Bell size={64} color="#ffffff" />
          </View>
          <Text style={styles.ringingTitle}>Alarm</Text>
          <Text style={styles.ringingTime}>
            {(() => {
              const period = ringingAlarm.hour >= 12 ? 'PM' : 'AM';
              const displayHour = ringingAlarm.hour % 12 || 12;
              const displayMinute = ringingAlarm.minute.toString().padStart(2, '0');
              return `${displayHour}:${displayMinute} ${period}`;
            })()}
          </Text>
          {ringingAlarm.label && (
            <Text style={styles.ringingLabel}>{ringingAlarm.label}</Text>
          )}
          <Text style={styles.ringingSubtext}>Will stop in {alarmDuration} seconds</Text>
          <Text style={styles.ringingDismiss}>Tap anywhere to dismiss</Text>
        </View>
      </Pressable>
    )}

    <Modal
      visible={showSettings}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Settings</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Alarm Duration (seconds)</Text>
            <TextInput
              style={styles.settingInput}
              value={tempDuration}
              onChangeText={setTempDuration}
              keyboardType="number-pad"
              placeholder="5"
              placeholderTextColor="#ffffff50"
              maxLength={3}
            />
          </View>
          <Text style={styles.settingHint}>Duration: 1-300 seconds</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Default Notification Sound</Text>
            <View style={styles.soundOptionsContainer}>
              {soundOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.soundOption,
                    tempSound === option.value && styles.soundOptionSelected,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTempSound(option.value);
                  }}
                >
                  <View style={[
                    styles.soundOptionRadio,
                    tempSound === option.value && styles.soundOptionRadioSelected,
                  ]} />
                  <Text style={[
                    styles.soundOptionText,
                    tempSound === option.value && styles.soundOptionTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.modalButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalButtonSecondary,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalButtonPrimary,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSaveSettings}
            >
              <Text style={styles.modalButtonTextPrimary}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  bulkActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  bulkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff15',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  buttonPressed: {
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingTop: 120,
    gap: 16,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: '#ffffff80',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#ffffff50',
    textAlign: 'center' as const,
  },
  alarmsContainer: {
    gap: 12,
  },
  alarmItemContainer: {
    position: 'relative' as const,
    height: 88,
  },
  alarmItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: '#ffffff12',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffffff08',
    height: 88,
  },
  alarmItemDisabled: {
    backgroundColor: '#ffffff06',
  },
  alarmContent: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  alarmTimeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    gap: 8,
  },
  alarmTime: {
    fontSize: 48,
    fontWeight: '300' as const,
    color: '#ffffff',
    letterSpacing: -1,
  },
  alarmTimeDisabled: {
    color: '#ffffff40',
  },
  alarmPeriod: {
    fontSize: 20,
    fontWeight: '500' as const,
    color: '#ffffff90',
  },
  alarmPeriodDisabled: {
    color: '#ffffff30',
  },
  alarmLabel: {
    fontSize: 15,
    color: '#ffffff70',
    marginTop: 4,
  },
  alarmLabelDisabled: {
    color: '#ffffff30',
  },
  deleteButton: {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  },
  deleteButtonInner: {
    width: 80,
    height: 88,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  bottomBar: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 24,
  },
  secondaryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#ffffff15',
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },

  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  addButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  ringingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000cc',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  ringingContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center' as const,
    minWidth: 300,
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  ringingIconContainer: {
    marginBottom: 24,
  },
  ringingTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 12,
  },
  ringingTime: {
    fontSize: 56,
    fontWeight: '300' as const,
    color: '#ffffff',
    letterSpacing: -2,
    marginBottom: 16,
  },
  ringingLabel: {
    fontSize: 18,
    color: '#ffffff90',
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  ringingSubtext: {
    fontSize: 14,
    color: '#ffffff60',
    marginTop: 8,
  },
  ringingDismiss: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#007AFF',
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000cc',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center' as const,
  },
  settingRow: {
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#ffffff90',
    marginBottom: 12,
  },
  settingInput: {
    backgroundColor: '#ffffff12',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#ffffff20',
  },
  settingHint: {
    fontSize: 14,
    color: '#ffffff50',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  modalButtonSecondary: {
    backgroundColor: '#ffffff15',
    borderWidth: 1,
    borderColor: '#ffffff20',
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  soundOptionsContainer: {
    gap: 8,
    marginTop: 8,
  },
  soundOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#ffffff12',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffffff20',
    gap: 12,
  },
  soundOptionSelected: {
    backgroundColor: '#007AFF20',
    borderColor: '#007AFF',
  },
  soundOptionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff40',
  },
  soundOptionRadioSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  soundOptionText: {
    fontSize: 16,
    color: '#ffffff90',
  },
  soundOptionTextSelected: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600' as const,
  },
});
