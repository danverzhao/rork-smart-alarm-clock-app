export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  label: string;
  isEnabled: boolean;
  createdAt: number;
  notificationId?: string;
  sound?: string;
}
