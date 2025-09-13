import { executeQuery } from '../src/config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Verificar se já existem usuários
    const existingUsers = await executeQuery('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('✅ Usuários já existem no banco. Pulando seed...');
      return;
    }

    // Hash da senha padrão
    const passwordHash = await bcrypt.hash('123456', 10);

    // Inserir usuários de teste
    const users = [
      {
        id: uuidv4(),
        username: 'marko',
        email: 'marko@markomods.com',
        display_name: 'Marko',
        password_hash: passwordHash,
        role: 'super_admin',
        is_verified: true,
        is_banned: false
      },
      {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@markomods.com',
        display_name: 'Administrador',
        password_hash: passwordHash,
        role: 'admin',
        is_verified: true,
        is_banned: false
      },
      {
        id: uuidv4(),
        username: 'moderator',
        email: 'moderator@markomods.com',
        display_name: 'Moderador',
        password_hash: passwordHash,
        role: 'moderator',
        is_verified: true,
        is_banned: false
      },
      {
        id: uuidv4(),
        username: 'user1',
        email: 'user1@example.com',
        display_name: 'Usuário 1',
        password_hash: passwordHash,
        role: 'member',
        is_verified: true,
        is_banned: false
      },
      {
        id: uuidv4(),
        username: 'user2',
        email: 'user2@example.com',
        display_name: 'Usuário 2',
        password_hash: passwordHash,
        role: 'member',
        is_verified: false,
        is_banned: false
      }
    ];

    for (const user of users) {
      const sql = `
        INSERT INTO users (id, username, email, display_name, password_hash, role, is_verified, is_banned, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      await executeQuery(sql, [
        user.id,
        user.username,
        user.email,
        user.display_name,
        user.password_hash,
        user.role,
        user.is_verified,
        user.is_banned
      ]);
      
      console.log(`✅ Usuário ${user.username} criado com sucesso`);
    }

    console.log('🎉 Seed do banco concluído com sucesso!');
    console.log('📋 Usuários criados:');
    users.forEach(user => {
      console.log(`   • ${user.username} (${user.role}) - ${user.email}`);
    });
    console.log('🔑 Senha padrão para todos os usuários: 123456');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
};

// Executar seed se o arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seed concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no seed:', error);
      process.exit(1);
    });
}

export default seedDatabase;







