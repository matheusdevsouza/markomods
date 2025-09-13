// Configuração do PM2 para MarkoMods
// Execute: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'markomods-backend',
      script: './backend/src/server.js',
      cwd: '/var/www/mods.eumarko.com',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      // Configurações de restart
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // Logs
      log_file: '/var/log/pm2/markomods-backend.log',
      out_file: '/var/log/pm2/markomods-backend-out.log',
      error_file: '/var/log/pm2/markomods-backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Configurações de restart automático
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Configurações de monitoramento
      monitoring: true,
      
      // Configurações de cluster (se necessário)
      // instances: 'max',
      // exec_mode: 'cluster',
      
      // Variáveis de ambiente específicas
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        // Adicione outras variáveis de produção aqui
      }
    }
  ],

  // Configurações de deploy (opcional)
  deploy: {
    production: {
      user: 'deploy',
      host: 'SEU_IP_VPS',
      ref: 'origin/main',
      repo: 'https://github.com/matheusdevsouza/markomods.git',
      path: '/var/www/mods.eumarko.com',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && cd backend && npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
