#!/bin/bash

# Script de Deploy para MarkoMods
# Execute na VPS: ./deploy.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto (/var/www/mods.eumarko.com)"
fi

log "🚀 Iniciando deploy do MarkoMods..."

# Parar o PM2 se estiver rodando
if command -v pm2 &> /dev/null; then
    log "Parando aplicação PM2..."
    pm2 stop markomods-backend 2>/dev/null || true
else
    warn "PM2 não encontrado. Instalando..."
    npm install -g pm2
fi

# Fazer backup do banco de dados
log "Fazendo backup do banco de dados..."
if [ -f "backend/scripts/backup.sh" ]; then
    bash backend/scripts/backup.sh
else
    warn "Script de backup não encontrado. Pulando backup..."
fi

# Atualizar código do Git
log "Atualizando código do repositório..."
git fetch origin
git reset --hard origin/main

# Instalar dependências do frontend
log "Instalando dependências do frontend..."
npm install

# Fazer build do frontend
log "Fazendo build do frontend..."
npm run build

# Instalar dependências do backend
log "Instalando dependências do backend..."
cd backend
npm install --production
cd ..

# Executar migrações do banco de dados
log "Executando migrações do banco de dados..."
if [ -f "backend/database/migrate.js" ]; then
    cd backend
    node database/migrate.js
    cd ..
else
    warn "Script de migração não encontrado. Pulando migrações..."
fi

# Verificar se o arquivo .env existe
if [ ! -f "backend/.env" ]; then
    warn "Arquivo .env não encontrado no backend. Criando a partir do exemplo..."
    if [ -f "backend/env.example" ]; then
        cp backend/env.example backend/.env
        warn "Configure o arquivo backend/.env com suas credenciais antes de continuar!"
        read -p "Pressione Enter após configurar o .env..."
    else
        error "Arquivo backend/.env não encontrado e não há exemplo disponível!"
    fi
fi

# Criar diretórios necessários
log "Criando diretórios necessários..."
mkdir -p uploads/avatars
mkdir -p uploads/thumbnails
mkdir -p uploads/editor-images
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p /var/log/pm2

# Definir permissões corretas
log "Definindo permissões..."
chown -R deploy:deploy uploads/
chown -R deploy:deploy backend/uploads/
chown -R deploy:deploy backend/logs/
chmod -R 755 uploads/
chmod -R 755 backend/uploads/

# Iniciar aplicação com PM2
log "Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js --env production

# Salvar configuração do PM2
log "Salvando configuração do PM2..."
pm2 save

# Configurar PM2 para iniciar automaticamente
log "Configurando PM2 para iniciar automaticamente..."
pm2 startup

# Verificar se o Nginx está configurado
log "Verificando configuração do Nginx..."
if [ -f "/etc/nginx/sites-enabled/mods.eumarko.com" ]; then
    log "Nginx está configurado"
    nginx -t && systemctl reload nginx
else
    warn "Nginx não está configurado. Execute o script setup-nginx.sh primeiro!"
fi

# Verificar se a aplicação está rodando
log "Verificando se a aplicação está rodando..."
sleep 5

if pm2 list | grep -q "markomods-backend.*online"; then
    log "✅ Backend está rodando!"
else
    error "❌ Backend não está rodando. Verifique os logs: pm2 logs markomods-backend"
fi

# Testar API
log "Testando API..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    log "✅ API está respondendo!"
else
    warn "⚠️ API não está respondendo. Verifique os logs: pm2 logs markomods-backend"
fi

# Verificar SSL
log "Verificando SSL..."
if [ -f "/etc/letsencrypt/live/mods.eumarko.com/fullchain.pem" ]; then
    log "✅ SSL está configurado"
else
    warn "⚠️ SSL não está configurado. Execute: certbot --nginx -d mods.eumarko.com"
fi

# Mostrar status final
log "📊 Status final:"
echo "=================================="
pm2 status
echo "=================================="
echo
echo "🌐 Site: https://mods.eumarko.com"
echo "🔧 Logs: pm2 logs markomods-backend"
echo "📊 Status: pm2 status"
echo "🔄 Restart: pm2 restart markomods-backend"
echo "⏹️ Stop: pm2 stop markomods-backend"
echo

log "✅ Deploy concluído com sucesso!"
