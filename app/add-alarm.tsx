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
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddAlarmScreen() {
  const router = useRouter();
  const { addAlarm } = useAlarms();
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(9);
    d.setMinutes(0);
    return d;
  });
  const [label, setLabel] = useState<string>('');

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addAlarm(date.getHours(), date.getMinutes(), label);
    router.back();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const onTimeChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
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
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={date}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
                textColor="#ffffff"
                themeVariant="dark"
                style={styles.timePicker}
              />
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
  timePicker: {
    height: 200,
    width: '100%',
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
