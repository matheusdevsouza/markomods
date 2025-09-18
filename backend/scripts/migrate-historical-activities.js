import { executeQuery } from '../src/config/database.js';

// Script para migrar atividades históricas dos usuários
async function migrateHistoricalActivities() {
  try {

    // 1. Migrar downloads históricos
    const downloadsQuery = `
      SELECT DISTINCT d.user_id, d.mod_id, d.created_at, m.title, m.file_size, m.minecraft_version
      FROM downloads d
      INNER JOIN mods m ON d.mod_id = m.id
      WHERE d.user_id IS NOT NULL
      ORDER BY d.created_at DESC
    `;
    
    const downloads = await executeQuery(downloadsQuery);
    
    for (const download of downloads) {
      try {
        // Verificar se já existe atividade para este download
        const existingQuery = `
          SELECT id FROM activities 
          WHERE user_id = ? AND mod_id = ? AND activity_type = 'download'
          LIMIT 1
        `;
        const existing = await executeQuery(existingQuery, [download.user_id, download.mod_id]);
        
        if (existing.length === 0) {
          const insertQuery = `
            INSERT INTO activities (user_id, mod_id, activity_type, activity_data, created_at)
            VALUES (?, ?, 'download', ?, ?)
          `;
          
          const activityData = {
            file_size: download.file_size || 'N/A',
            download_type: 'public',
            minecraft_version: download.minecraft_version || 'N/A'
          };
          
          await executeQuery(insertQuery, [
            download.user_id,
            download.mod_id,
            JSON.stringify(activityData),
            download.created_at
          ]);
        }
      } catch (error) {
        console.error('Erro ao migrar download:', download.user_id, download.mod_id, error.message);
      }
    }
    

    // 2. Migrar favoritos históricos
    const favoritesQuery = `
      SELECT DISTINCT f.user_id, f.mod_id, f.created_at, m.title
      FROM favorites f
      INNER JOIN mods m ON f.mod_id = m.id
      ORDER BY f.created_at DESC
    `;
    
    const favorites = await executeQuery(favoritesQuery);
    
    for (const favorite of favorites) {
      try {
        // Verificar se já existe atividade para este favorito
        const existingQuery = `
          SELECT id FROM activities 
          WHERE user_id = ? AND mod_id = ? AND activity_type = 'favorite'
          LIMIT 1
        `;
        const existing = await executeQuery(existingQuery, [favorite.user_id, favorite.mod_id]);
        
        if (existing.length === 0) {
          const insertQuery = `
            INSERT INTO activities (user_id, mod_id, activity_type, activity_data, created_at)
            VALUES (?, ?, 'favorite', ?, ?)
          `;
          
          const activityData = {
            category: 'Geral'
          };
          
          await executeQuery(insertQuery, [
            favorite.user_id,
            favorite.mod_id,
            JSON.stringify(activityData),
            favorite.created_at
          ]);
        }
      } catch (error) {
        console.error('Erro ao migrar favorito:', favorite.user_id, favorite.mod_id, error.message);
      }
    }
    

    // 3. Migrar comentários históricos (apenas aprovados)
    const commentsQuery = `
      SELECT DISTINCT c.user_id, c.mod_id, c.created_at, c.content, c.rating, m.title
      FROM comments c
      INNER JOIN mods m ON c.mod_id = m.id
      WHERE c.is_approved = 1
      ORDER BY c.created_at DESC
    `;
    
    const comments = await executeQuery(commentsQuery);
    
    for (const comment of comments) {
      try {
        // Verificar se já existe atividade para este comentário
        const existingQuery = `
          SELECT id FROM activities 
          WHERE user_id = ? AND mod_id = ? AND activity_type = 'comment'
          LIMIT 1
        `;
        const existing = await executeQuery(existingQuery, [comment.user_id, comment.mod_id]);
        
        if (existing.length === 0) {
          const insertQuery = `
            INSERT INTO activities (user_id, mod_id, activity_type, activity_data, created_at)
            VALUES (?, ?, 'comment', ?, ?)
          `;
          
          const activityData = {
            comment_text: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
            comment_id: comment.id,
            rating: comment.rating || null
          };
          
          await executeQuery(insertQuery, [
            comment.user_id,
            comment.mod_id,
            JSON.stringify(activityData),
            comment.created_at
          ]);
        }
      } catch (error) {
        console.error('Erro ao migrar comentário:', comment.user_id, comment.mod_id, error.message);
      }
    }
    

    // 4. Estatísticas finais
    const statsQuery = `
      SELECT 
        activity_type,
        COUNT(*) as count
      FROM activities 
      GROUP BY activity_type
    `;
    
    const stats = await executeQuery(statsQuery);
    stats.forEach(stat => {
    });

    
  } catch (error) {
    throw error;
  }
}

// Executar migração se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateHistoricalActivities()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no script:', error);
      process.exit(1);
    });
}

export { migrateHistoricalActivities };
