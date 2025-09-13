import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Configurar dotenv com prioridade para .env
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: './production.env' });
} else {
  try {
    dotenv.config({ path: './.env' });
  } catch (error) {
    dotenv.config({ path: './config.env' });
  }
}

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectionLimit: 10,
  multipleStatements: true,
  waitForConnections: true,
  queueLimit: 0
};

// Criar pool de conexões (apenas se não for produção)
let pool;
if (process.env.NODE_ENV === 'production') {
  // Em produção, usar conexão direta para evitar problemas de permissão
  pool = null;
} else {
  pool = mysql.createPool(dbConfig);
}

// Testar conexão
export const testConnection = async () => {
  try {
    console.log('🔍 Tentando conectar com MySQL...');
    console.log(`📊 Configuração: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
    // Tentar conexão direta primeiro
    const directConnection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexão direta estabelecida!');
    
    // Testar uma query simples
    const [rows] = await directConnection.execute('SELECT 1 as test');
    console.log('✅ Query de teste executada com sucesso:', rows);
    
    await directConnection.end();
    
    // Testar o pool apenas se não for produção
    if (pool) {
      const connection = await pool.getConnection();
      console.log('✅ Pool de conexões funcionando!');
      connection.release();
    } else {
      console.log('✅ Modo produção: usando conexões diretas');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error.message);
    console.error('❌ Código do erro:', error.code);
    console.error('❌ Configuração usada:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    // Tentar conexão alternativa com 127.0.0.1 se localhost falhar
    if (dbConfig.host === 'localhost' && error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔄 Tentando conexão alternativa com 127.0.0.1...');
      try {
        const altConfig = { ...dbConfig, host: '127.0.0.1' };
        const altConnection = await mysql.createConnection(altConfig);
        console.log('✅ Conexão alternativa com 127.0.0.1 estabelecida!');
        await altConnection.end();
        return true;
      } catch (altError) {
        console.error('❌ Conexão alternativa também falhou:', altError.message);
      }
    }
    
    return false;
  }
};

// Executar query com pool ou conexão direta
export const executeQuery = async (sql, params = []) => {
  try {
    if (pool) {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } else {
      // Em produção, usar conexão direta
      const connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(sql, params);
      await connection.end();
      return rows;
    }
  } catch (error) {
    console.error('❌ Erro na query:', error.message);
    throw new Error(`Erro no banco de dados: ${error.message}`);
  }
};

// Executar query com transação
export const executeTransaction = async (queries) => {
  const connection = pool ? await pool.getConnection() : await mysql.createConnection(dbConfig);
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { sql, params = [] } of queries) {
      const [rows] = await connection.execute(sql, params);
      results.push(rows);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    if (pool) {
      connection.release();
    } else {
      await connection.end();
    }
  }
};

// Obter conexão individual (para casos específicos)
export const getConnection = () => {
  if (pool) {
    return pool.getConnection();
  } else {
    return mysql.createConnection(dbConfig);
  }
};

export default pool;
