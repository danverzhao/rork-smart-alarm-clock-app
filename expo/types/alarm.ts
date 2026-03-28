export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  label: string;
  isEnabled: boolean;
  createdAt: number;
  notificationId?: string;
}

export type NotificationSound = 'default' | 'noti1' | 'noti2';

export type VibrationPattern = 'default' | 'double';
