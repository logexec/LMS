import { User } from '@/utils/types';

export interface LoginResponse {
  user: User;
  message?: string;
}