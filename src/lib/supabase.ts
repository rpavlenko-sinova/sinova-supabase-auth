import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.WXT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.WXT_SUPABASE_KEY;

console.info('supabaseUrl', supabaseUrl);
console.info('supabaseAnonKey', supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: async (key: string) => {
        const result = await browser.storage.local.get([key]);
        return result[key] || null;
      },
      setItem: async (key: string, value: string) => {
        await browser.storage.local.set({ [key]: value });
      },
      removeItem: async (key: string) => {
        await browser.storage.local.remove([key]);
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
