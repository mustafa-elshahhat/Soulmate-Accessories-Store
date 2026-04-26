export interface Notification {
  id: string;
  title: string;
  title_en: string;
  message: string;
  message_en: string;
  is_read: boolean;
  order_id: string | null;
  created_at: string;
}

export interface NotificationListData {
  items: Notification[];
  unread_count: number;
}
