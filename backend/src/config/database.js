import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'markomods_db',
  port: parseInt(process.env.DB_PORT) || 3306,
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectionLimit: 10,
  multipleStatements: true
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Testar conexão
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexão com MySQL estabelecida com sucesso!');
    console.log(`📊 Banco: ${dbConfig.database} em ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error.message);
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
