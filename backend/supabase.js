import { createClient } from '@supabase/supabase-js'

// Usa a chave "service_role" (acesso total ao banco) — por isso o RLS
// fica desligado nas tabelas (veja supabase/schema.sql) e essa chave
// NUNCA pode ir pro navegador, só fica aqui no backend.
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
