// Configuração da API
// Em desenvolvimento: usar proxy do Vite (/api será redirecionado para localhost:3001)
// Em produção: usar string vazia (Nginx redireciona /api para localhost:3001)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? '/api' : '');
