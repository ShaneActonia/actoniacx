// src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'

// Grab the environment variables, ensuring they are not null
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create and EXPORT the client. This is the crucial line.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
