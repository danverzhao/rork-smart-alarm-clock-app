import { useAlarms } from '@/contexts/AlarmContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function AddAlarmScreen() {
  const router = useRouter();
  const { addAlarm } = useAlarms();
  const [hour, setHour] = useState<number>(9);
  const [minute, setMinute] = useState<number>(0);
  const [label, setLabel] = useState<string>('');

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addAlarm(hour, minute, label);
    router.back();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const incrementHour = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHour((prev) => (prev + 1) % 24);
  };

  const decrementHour = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHour((prev) => (prev - 1 + 24) % 24);
  };

  const incrementMinute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMinute((prev) => (prev + 1) % 60);
  };

  const decrementMinute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMinute((prev) => (prev - 1 + 60) % 60);
  };

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    const displayMinute = m.toString().padStart(2, '0');
    return { displayHour: displayHour.toString(), displayMinute, period };
  };

  const { displayHour, displayMinute, period } = formatTime(hour, minute);

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.pickerContainer}>
              <View style={styles.timePickerRow}>
                <View style={styles.timeColumn}>
                  <Pressable style={styles.pickerButton} onPress={incrementHour}>
                    <Text style={styles.pickerButtonText}>▲</Text>
                  </Pressable>
                  <View style={styles.timeDisplay}>
                    <Text style={styles.timeText}>{displayHour}</Text>
                  </View>
                  <Pressable style={styles.pickerButton} onPress={decrementHour}>
                    <Text style={styles.pickerButtonText}>▼</Text>
                  </Pressable>
                </View>

                <Text style={styles.timeSeparator}>:</Text>

                <View style={styles.timeColumn}>
                  <Pressable style={styles.pickerButton} onPress={incrementMinute}>
                    <Text style={styles.pickerButtonText}>▲</Text>
                  </Pressable>
                  <View style={styles.timeDisplay}>
                    <Text style={styles.timeText}>{displayMinute}</Text>
                  </View>
                  <Pressable style={styles.pickerButton} onPress={decrementMinute}>
                    <Text style={styles.pickerButtonText}>▼</Text>
                  </Pressable>
                </View>

                <View style={styles.periodColumn}>
                  <Text style={styles.periodText}>{period}</Text>
                </View>
              </View>
            </View>

            <View style={styles.labelContainer}>
              <Text style={styles.labelTitle}>Label (optional)</Text>
              <TextInput
                style={styles.labelInput}
                placeholder="Alarm label"
                placeholderTextColor="#ffffff40"
                value={label}
                onChangeText={setLabel}
                maxLength={30}
              />
            </View>

            <View style={styles.buttonsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 32,
  },
  pickerContainer: {
    alignItems: 'center' as const,
    paddingVertical: 32,
  },
  timePickerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  timeColumn: {
    alignItems: 'center' as const,
    gap: 12,
  },
  periodColumn: {
    justifyContent: 'center' as const,
    marginLeft: 8,
  },
  pickerButton: {
    width: 60,
    height: 50,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#ffffff15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  pickerButtonText: {
    fontSize: 24,
    color: '#ffffff',
  },
  timeDisplay: {
    width: 100,
    height: 120,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#ffffff12',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  timeText: {
    fontSize: 64,
    fontWeight: '300' as const,
    color: '#ffffff',
    letterSpacing: -2,
  },
  timeSeparator: {
    fontSize: 64,
    fontWeight: '300' as const,
    color: '#ffffff80',
    marginBottom: 12,
  },
  periodText: {
    fontSize: 28,
    fontWeight: '600' as const,
    color: '#ffffff90',
  },
  labelContainer: {
    gap: 12,
  },
  labelTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff90',
  },
  labelInput: {
    backgroundColor: '#ffffff12',
    borderRadius: 16,
    padding: 16,
    fontSize: 17,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  buttonsContainer: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff15',
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center' as const,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
