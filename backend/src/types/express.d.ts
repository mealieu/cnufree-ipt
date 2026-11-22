import { TypedSupabaseClient } from '../config/supabase';

export interface AuthContext {
  userId: string;
  email?: string;
  role?: string;
  accessToken: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      supabase?: TypedSupabaseClient;
    }
  }
}

export {};
