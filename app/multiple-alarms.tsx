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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function MultipleAlarmsScreen() {
  const router = useRouter();
  const { addMultipleAlarms } = useAlarms();
  const [startHour, setStartHour] = useState<number>(9);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(30);
  const [count, setCount] = useState<number>(5);

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addMultipleAlarms(startHour, startMinute, intervalMinutes, count);
    router.back();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const incrementStartHour = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStartHour((prev) => (prev + 1) % 24);
  };

  const decrementStartHour = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStartHour((prev) => (prev - 1 + 24) % 24);
  };

  const incrementStartMinute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStartMinute((prev) => (prev + 1) % 60);
  };

  const decrementStartMinute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStartMinute((prev) => (prev - 1 + 60) % 60);
  };

  const incrementInterval = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIntervalMinutes((prev) => Math.min(prev + 5, 180));
  };

  const decrementInterval = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIntervalMinutes((prev) => Math.max(prev - 5, 5));
  };

  const incrementCount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount((prev) => Math.min(prev + 1, 20));
  };

  const decrementCount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount((prev) => Math.max(prev - 1, 2));
  };

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    const displayMinute = m.toString().padStart(2, '0');
    return { displayHour: displayHour.toString(), displayMinute, period };
  };

  const { displayHour, displayMinute, period } = formatTime(startHour, startMinute);

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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Start Time</Text>
              <View style={styles.pickerContainer}>
                <View style={styles.timePickerRow}>
                  <View style={styles.timeColumn}>
                    <Pressable style={styles.pickerButton} onPress={incrementStartHour}>
                      <Text style={styles.pickerButtonText}>▲</Text>
                    </Pressable>
                    <View style={styles.timeDisplay}>
                      <Text style={styles.timeText}>{displayHour}</Text>
                    </View>
                    <Pressable style={styles.pickerButton} onPress={decrementStartHour}>
                      <Text style={styles.pickerButtonText}>▼</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.timeSeparator}>:</Text>

                  <View style={styles.timeColumn}>
                    <Pressable style={styles.pickerButton} onPress={incrementStartMinute}>
                      <Text style={styles.pickerButtonText}>▲</Text>
                    </Pressable>
                    <View style={styles.timeDisplay}>
                      <Text style={styles.timeText}>{displayMinute}</Text>
                    </View>
                    <Pressable style={styles.pickerButton} onPress={decrementStartMinute}>
                      <Text style={styles.pickerButtonText}>▼</Text>
                    </Pressable>
                  </View>

                  <View style={styles.periodColumn}>
                    <Text style={styles.periodText}>{period}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interval (minutes)</Text>
              <View style={styles.numberPickerContainer}>
                <Pressable style={styles.numberButton} onPress={decrementInterval}>
                  <Text style={styles.numberButtonText}>−</Text>
                </Pressable>
                <View style={styles.numberDisplay}>
                  <Text style={styles.numberText}>{intervalMinutes}</Text>
                  <Text style={styles.numberUnit}>min</Text>
                </View>
                <Pressable style={styles.numberButton} onPress={incrementInterval}>
                  <Text style={styles.numberButtonText}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Number of Alarms</Text>
              <View style={styles.numberPickerContainer}>
                <Pressable style={styles.numberButton} onPress={decrementCount}>
                  <Text style={styles.numberButtonText}>−</Text>
                </Pressable>
                <View style={styles.numberDisplay}>
                  <Text style={styles.numberText}>{count}</Text>
                  <Text style={styles.numberUnit}>alarms</Text>
                </View>
                <Pressable style={styles.numberButton} onPress={incrementCount}>
                  <Text style={styles.numberButtonText}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>Preview</Text>
              <Text style={styles.previewText}>
                {count} alarms will be created starting at {displayHour}:{displayMinute} {period},
                with {intervalMinutes} minute intervals
              </Text>
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
                  styles.createButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleCreate}
              >
                <Text style={styles.createButtonText}>Create</Text>
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
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff90',
  },
  pickerContainer: {
    alignItems: 'center' as const,
    paddingVertical: 16,
  },
  timePickerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  timeColumn: {
    alignItems: 'center' as const,
    gap: 8,
  },
  periodColumn: {
    justifyContent: 'center' as const,
    marginLeft: 8,
  },
  pickerButton: {
    width: 50,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#ffffff15',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  pickerButtonText: {
    fontSize: 20,
    color: '#ffffff',
  },
  timeDisplay: {
    width: 80,
    height: 80,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#ffffff12',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  timeText: {
    fontSize: 40,
    fontWeight: '300' as const,
    color: '#ffffff',
    letterSpacing: -1,
  },
  timeSeparator: {
    fontSize: 40,
    fontWeight: '300' as const,
    color: '#ffffff80',
    marginBottom: 8,
  },
  periodText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#ffffff90',
  },
  numberPickerContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 24,
  },
  numberButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff15',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  numberButtonText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '300' as const,
  },
  numberDisplay: {
    minWidth: 140,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff12',
    borderRadius: 16,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  numberText: {
    fontSize: 48,
    fontWeight: '300' as const,
    color: '#ffffff',
    letterSpacing: -1,
  },
  numberUnit: {
    fontSize: 14,
    color: '#ffffff60',
    marginTop: 4,
  },
  previewContainer: {
    backgroundColor: '#ffffff08',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff90',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 15,
    color: '#ffffff70',
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 8,
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
  createButton: {
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
  createButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
