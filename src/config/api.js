// Configuração da API
// Em desenvolvimento, usar proxy do Vite (/api será redirecionado)
// Em produção, usar URL completa
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:3001/api');
