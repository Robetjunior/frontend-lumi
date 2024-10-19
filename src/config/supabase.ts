// supabase.ts
import { createClient } from '@supabase/supabase-js';

// Substitua pela URL do seu projeto Supabase e a chave pública
const supabaseUrl = 'https://yhivluwnxpbqwntxnmtn.supabase.co'; // Encontre a URL no painel do Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloaXZsdXdueHBicXdudHhubXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNjk2NjksImV4cCI6MjA0NDc0NTY2OX0.D5513Hj3C-8MWLsDQvXsken8xjI-igdHJqmXNPAVT3Q'; // Encontre no painel do Supabase, normalmente chamada de anon key

// Inicializa o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
