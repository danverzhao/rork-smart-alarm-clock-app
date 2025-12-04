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
import DateTimePicker from '@react-native-community/datetimepicker';

export default function MultipleAlarmsScreen() {
  const router = useRouter();
  const { addMultipleAlarms } = useAlarms();
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(9);
    d.setMinutes(0);
    return d;
  });
  const [intervalMinutes, setIntervalMinutes] = useState<number>(30);
  const [count, setCount] = useState<number>(5);

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addMultipleAlarms(startDate.getHours(), startDate.getMinutes(), intervalMinutes, count);
    router.back();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const onTimeChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setStartDate(selectedDate);
    }
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
    setCount((prev) => Math.min(prev + 1, 60));
  };

  const decrementCount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount((prev) => Math.max(prev - 1, 2));
  };

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    const displayMinute = m.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

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
                <DateTimePicker
                  value={startDate}
                  mode="time"
                  display="spinner"
                  onChange={onTimeChange}
                  textColor="#ffffff"
                  themeVariant="dark"
                  style={styles.timePicker}
                />
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
                {count} alarms will be created starting at {formatTime(startDate.getHours(), startDate.getMinutes())},
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
  timePicker: {
    height: 200,
    width: '100%',
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
