import { createClient } from '@supabase/supabase-js';

// 1. Tu URL real de Supabase
const supabaseUrl = 'https://ifdvcxlbikqhmdnuxmuy.supabase.co';

// 2. Tu Publishable Key real y exacta
const supabaseAnonKey = 'sb_publishable_s8dmc0WVFmmf1jdnKRoPbw_S_CdNWn_';

// 3. Obligamos al sistema a quitar la pantalla negra
export const areSupabaseCredentialsSet = true;

// 4. Conectamos con tus datos reales
export const supabase = createClient(supabaseUrl, supabaseAnonKey);