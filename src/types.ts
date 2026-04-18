export interface UserProfile {
  id?: string;
  employee_id?: string;
  display_name: string;
  email: string;
  password?: string;
  role_title?: string;
  team: string;
  is_admin?: boolean;
  personal_email?: string;
  created_date?: string;
  updated_date?: string;
  created_by?: string;
}

export interface ChatRoom {
  id?: string;
  name: string;
  description?: string;
  invite_code?: string;
  members?: string[];
  created_date?: string;
  updated_date?: string;
  created_by?: string;
}

export interface Message {
  id?: string;
  content?: string;
  sender_name: string;
  room_id: string;
  image_url?: string;
  created_date?: string;
  updated_date?: string;
  created_by?: string;
}

export interface Base44Response<T> {
  data: T;
  status: string;
}

export type EntityEvent<T> = {
  type: 'create' | 'update' | 'delete';
  id: string;
  data: T;
};
