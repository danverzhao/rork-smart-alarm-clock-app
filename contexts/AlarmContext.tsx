import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import type { Alarm } from '@/types/alarm';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const STORAGE_KEY = 'alarms';
const SETTINGS_KEY = 'alarm_settings';

const SOUND_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Notification 1', value: 'noti1' },
  { label: 'Notification 2', value: 'noti2' },
];

export const [AlarmProvider, useAlarms] = createContextHook(() => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alarmDuration, setAlarmDuration] = useState<number>(5);
  const [defaultSound, setDefaultSound] = useState<string>('default');

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
        setDefaultSound(settings.defaultSound || 'default');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateAlarmDuration = async (duration: number) => {
    try {
      setAlarmDuration(duration);
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      const settings = stored ? JSON.parse(stored) : {};
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, alarmDuration: duration }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const updateDefaultSound = async (sound: string) => {
    try {
      setDefaultSound(sound);
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      const settings = stored ? JSON.parse(stored) : {};
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, defaultSound: sound }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const scheduleNotification = async (alarm: Alarm): Promise<string | undefined> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return undefined;
      }

      const now = new Date();
      const alarmTime = new Date();
      alarmTime.setHours(alarm.hour, alarm.minute, 0, 0);

      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }

      const soundToUse = alarm.sound || defaultSound;
      let soundConfig: boolean | string = true;
      
      if (soundToUse === 'noti1') {
        soundConfig = require('../assets/sounds/noti1.wav');
      } else if (soundToUse === 'noti2') {
        soundConfig = require('../assets/sounds/noti2.wav');
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: alarm.label || 'Alarm',
          body: `${alarm.hour % 12 || 12}:${alarm.minute.toString().padStart(2, '0')} ${alarm.hour >= 12 ? 'PM' : 'AM'}`,
          sound: soundConfig,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { alarmId: alarm.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: alarm.hour,
          minute: alarm.minute,
        },
      });

      console.log('Scheduled notification:', notificationId, 'for', alarmTime, 'with sound:', soundToUse);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return undefined;
    }
  };

  const cancelNotification = async (notificationId?: string) => {
    if (notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log('Cancelled notification:', notificationId);
      } catch (error) {
        console.error('Failed to cancel notification:', error);
      }
    }
  };

  const addAlarm = async (hour: number, minute: number, label: string) => {
    const newAlarm: Alarm = {
      id: Date.now().toString() + Math.random().toString(36),
      hour,
      minute,
      label,
      isEnabled: true,
      createdAt: Date.now(),
      sound: defaultSound,
    };

    const notificationId = await scheduleNotification(newAlarm);
    newAlarm.notificationId = notificationId;

    const updated = [...alarms, newAlarm].sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });
    setAlarms(updated);
    saveAlarms(updated);
  };

  const addMultipleAlarms = async (startHour: number, startMinute: number, intervalMinutes: number, count: number) => {
    const newAlarms: Alarm[] = [];
    let currentHour = startHour;
    let currentMinute = startMinute;

    for (let i = 0; i < count; i++) {
      const alarm: Alarm = {
        id: Date.now().toString() + Math.random().toString(36),
        hour: currentHour,
        minute: currentMinute,
        label: '',
        isEnabled: true,
        createdAt: Date.now() + i,
        sound: defaultSound,
      };

      const notificationId = await scheduleNotification(alarm);
      alarm.notificationId = notificationId;
      newAlarms.push(alarm);

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

  const deleteAlarm = async (id: string) => {
    const alarm = alarms.find((a) => a.id === id);
    if (alarm?.notificationId) {
      await cancelNotification(alarm.notificationId);
    }
    const updated = alarms.filter((alarm) => alarm.id !== id);
    setAlarms(updated);
    saveAlarms(updated);
  };

  const toggleAlarm = async (id: string) => {
    const alarm = alarms.find((a) => a.id === id);
    if (!alarm) return;

    if (alarm.isEnabled && alarm.notificationId) {
      await cancelNotification(alarm.notificationId);
      const updated = alarms.map((a) =>
        a.id === id ? { ...a, isEnabled: false, notificationId: undefined } : a
      );
      setAlarms(updated);
      saveAlarms(updated);
    } else {
      const updatedAlarm = { ...alarm, isEnabled: true };
      const notificationId = await scheduleNotification(updatedAlarm);
      const updated = alarms.map((a) =>
        a.id === id ? { ...a, isEnabled: true, notificationId } : a
      );
      setAlarms(updated);
      saveAlarms(updated);
    }
  };

  const updateAlarmLabel = (id: string, label: string) => {
    const updated = alarms.map((alarm) =>
      alarm.id === id ? { ...alarm, label } : alarm
    );
    setAlarms(updated);
    saveAlarms(updated);
  };

  const enableAll = async () => {
    const updated = await Promise.all(
      alarms.map(async (alarm) => {
        if (!alarm.isEnabled) {
          const notificationId = await scheduleNotification({ ...alarm, isEnabled: true });
          return { ...alarm, isEnabled: true, notificationId };
        }
        return alarm;
      })
    );
    setAlarms(updated);
    saveAlarms(updated);
  };

  const disableAll = async () => {
    await Promise.all(
      alarms.map((alarm) => alarm.notificationId && cancelNotification(alarm.notificationId))
    );
    const updated = alarms.map((alarm) => ({ ...alarm, isEnabled: false, notificationId: undefined }));
    setAlarms(updated);
    saveAlarms(updated);
  };

  const clearAll = async () => {
    await Promise.all(
      alarms.map((alarm) => alarm.notificationId && cancelNotification(alarm.notificationId))
    );
    setAlarms([]);
    saveAlarms([]);
  };

  return {
    alarms,
    isLoading,
    alarmDuration,
    defaultSound,
    soundOptions: SOUND_OPTIONS,
    addAlarm,
    addMultipleAlarms,
    deleteAlarm,
    toggleAlarm,
    updateAlarmLabel,
    updateAlarmDuration,
    updateDefaultSound,
    enableAll,
    disableAll,
    clearAll,
  };
});
