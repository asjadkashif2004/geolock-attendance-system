require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.warn("⚠️ Missing Supabase URL or Key in environment variables. Using placeholder. Please add them in Vercel settings.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
