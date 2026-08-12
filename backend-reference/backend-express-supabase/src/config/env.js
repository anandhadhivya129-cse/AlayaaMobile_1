import dotenv from 'dotenv';

dotenv.config();

const requiredInProduction = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

if (process.env.NODE_ENV === 'production') {
  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'property-images',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  emailProvider: process.env.EMAIL_PROVIDER || 'console',
  emailFrom: process.env.EMAIL_FROM || 'notifications@alayaa.in'
};
