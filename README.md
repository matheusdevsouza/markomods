# 🎮 Eu, Marko! Mods

Plataforma completa para gerenciamento e distribuição de mods para Minecraft.

## 🚀 Tecnologias

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** + **Shadcn/ui**
- **Framer Motion** (animações)
- **React Router** (navegação)
- **i18next** (internacionalização)

### Backend
- **Node.js** + **Express.js**
- **MySQL/MariaDB** (banco de dados)
- **JWT** (autenticação)
- **Nodemailer** (emails)
- **Winston** (logs)

## 📁 Estrutura do Projeto

```
markomodsold/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── contexts/          # Contextos React
│   ├── hooks/             # Hooks customizados
│   └── i18n/              # Traduções
├── backend/               # Backend Node.js
│   ├── src/               # Código fonte
│   ├── migrations/        # Migrações do banco
│   ├── uploads/           # Arquivos enviados
│   └── logs/              # Logs da aplicação
├── public/                # Arquivos estáticos
└── scripts/               # Scripts utilitários
```

## ⚙️ Configuração

### 1. Instalar Dependências
```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Frontend
cp env.example .env

# Backend
cd backend && cp env.example .env
```

### 3. Configurar Banco de Dados
```bash
# Importar schema
mysql -u root -p < backend/database/markomods_db.sql
```

### 4. Executar Aplicação
```bash
# Frontend (porta 5173)
npm run dev

# Backend (porta 3001)
cd backend && npm start
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia frontend em modo desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `cd backend && npm start` - Inicia backend
- `cd backend && npm run dev` - Backend em modo desenvolvimento

## 📝 Funcionalidades

- ✅ Sistema de autenticação completo
- ✅ Upload e gerenciamento de mods
- ✅ Sistema de comentários
- ✅ Painel administrativo
- ✅ Internacionalização (6 idiomas)
- ✅ Sistema de backup automático
- ✅ Rate limiting e segurança
- ✅ Logs detalhados

## 🛡️ Segurança

- JWT para autenticação
- Rate limiting em todas as rotas
- Validação de entrada
- Sanitização de dados
- Logs de segurança
- Backup automático

## 📄 Licença

Projeto privado - Todos os direitos reservados.