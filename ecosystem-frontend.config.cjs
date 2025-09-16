module.exports = {
  apps: [
    {
      name: 'markomods-frontend',
      script: 'npx',
      args: 'serve -s dist -l 3000',
      cwd: '/var/www/mods.eumarko.com',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      log_file: '/var/log/pm2/markomods-frontend.log',
      out_file: '/var/log/pm2/markomods-frontend-out.log',
      error_file: '/var/log/pm2/markomods-frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
