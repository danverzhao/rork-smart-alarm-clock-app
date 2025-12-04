import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import type { Alarm } from '@/types/alarm';

const STORAGE_KEY = 'alarms';
const SETTINGS_KEY = 'alarm_settings';

export const [AlarmProvider, useAlarms] = createContextHook(() => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alarmDuration, setAlarmDuration] = useState<number>(5);

  useEffect(() => {
    loadAlarms();
    loadSettings();
  }, []);

  const loadAlarms = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Alarm[];
        setAlarms(parsed.sort((a, b) => {
          if (a.hour !== b.hour) return a.hour - b.hour;
          return a.minute - b.minute;
        }));
      }
    } catch (error) {
      console.error('Failed to load alarms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAlarms = async (newAlarms: Alarm[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAlarms));
    } catch (error) {
      console.error('Failed to save alarms:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        setAlarmDuration(settings.alarmDuration || 5);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateAlarmDuration = async (duration: number) => {
    try {
      setAlarmDuration(duration);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ alarmDuration: duration }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const addAlarm = (hour: number, minute: number, label: string) => {
    const newAlarm: Alarm = {
      id: Date.now().toString() + Math.random().toString(36),
      hour,
      minute,
      label,
      isEnabled: true,
      createdAt: Date.now(),
    };
    const updated = [...alarms, newAlarm].sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });
    setAlarms(updated);
    saveAlarms(updated);
  };

  const addMultipleAlarms = (startHour: number, startMinute: number, intervalMinutes: number, count: number) => {
    const newAlarms: Alarm[] = [];
    let currentHour = startHour;
    let currentMinute = startMinute;

    for (let i = 0; i < count; i++) {
      newAlarms.push({
        id: Date.now().toString() + Math.random().toString(36),
        hour: currentHour,
        minute: currentMinute,
        label: '',
        isEnabled: true,
        createdAt: Date.now() + i,
      });

      currentMinute += intervalMinutes;
      while (currentMinute >= 60) {
        currentMinute -= 60;
        currentHour += 1;
      }
      if (currentHour >= 24) {
        currentHour -= 24;
      }
    }

    const updated = [...alarms, ...newAlarms].sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });
    setAlarms(updated);
    saveAlarms(updated);
  };

  const deleteAlarm = (id: string) => {
    const updated = alarms.filter((alarm) => alarm.id !== id);
    setAlarms(updated);
    saveAlarms(updated);
  };

  const toggleAlarm = (id: string) => {
    const updated = alarms.map((alarm) =>
      alarm.id === id ? { ...alarm, isEnabled: !alarm.isEnabled } : alarm
    );
    setAlarms(updated);
    saveAlarms(updated);
  };

  const updateAlarmLabel = (id: string, label: string) => {
    const updated = alarms.map((alarm) =>
      alarm.id === id ? { ...alarm, label } : alarm
    );
    setAlarms(updated);
    saveAlarms(updated);
  };

  const enableAll = () => {
    const updated = alarms.map((alarm) => ({ ...alarm, isEnabled: true }));
    setAlarms(updated);
    saveAlarms(updated);
  };

  const disableAll = () => {
    const updated = alarms.map((alarm) => ({ ...alarm, isEnabled: false }));
    setAlarms(updated);
    saveAlarms(updated);
  };

  const clearAll = () => {
    setAlarms([]);
    saveAlarms([]);
  };

  return {
    alarms,
    isLoading,
    alarmDuration,
    addAlarm,
    addMultipleAlarms,
    deleteAlarm,
    toggleAlarm,
    updateAlarmLabel,
    updateAlarmDuration,
    enableAll,
    disableAll,
    clearAll,
  };
});
