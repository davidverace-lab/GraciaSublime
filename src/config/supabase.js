import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://toyyebhfidzhnjtvhhvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRveXllYmhmaWR6aG5qdHZoaHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTM0MDAsImV4cCI6MjA3ODQ4OTQwMH0.WcGv7HZptrEHKw7qNlCSbc1RsWlUDHLzWrQhke0laiY';

// Configuración del cliente de Supabase con AsyncStorage para persistencia
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Configurar redirect URL para la app móvil
    // IMPORTANTE: También debes configurar esto en el Dashboard de Supabase:
    // Authentication > URL Configuration > Redirect URLs
    // Agrega: exp://localhost:8081 (para desarrollo) y tu URL de producción
    redirectTo: 'exp://localhost:8081',
  },
});
