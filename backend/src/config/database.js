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
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  ssl: false
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Testar conexão
export const testConnection = async () => {
  try {
    console.log('🔍 Tentando conectar com MySQL...');
    console.log(`📊 Configuração: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
    const connection = await pool.getConnection();
    console.log('✅ Conexão com MySQL estabelecida com sucesso!');
    console.log(`📊 Banco: ${dbConfig.database} em ${dbConfig.host}:${dbConfig.port}`);
    
    // Testar uma query simples
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query de teste executada com sucesso:', rows);
    
    connection.release();
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
        const altPool = mysql.createPool(altConfig);
        const altConnection = await altPool.getConnection();
        console.log('✅ Conexão alternativa com 127.0.0.1 estabelecida!');
        altConnection.release();
        altPool.end();
        return true;
      } catch (altError) {
        console.error('❌ Conexão alternativa também falhou:', altError.message);
      }
    }
    
    return false;
  }
};

// Executar query com pool
export const executeQuery = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Erro na query:', error.message);
    throw new Error(`Erro no banco de dados: ${error.message}`);
  }
};

// Executar query com transação
export const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
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
    connection.release();
  }
};

// Obter conexão individual (para casos específicos)
export const getConnection = () => pool.getConnection();

export default pool;
