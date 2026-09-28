import mysql from 'mysql2/promise';

declare global {
  var mysqlPool: mysql.Pool | undefined;
}

// Créer la base de données automatiquement si elle n'existe pas
async function ensureDatabase() {
  const dbName = process.env.DB_NAME || 'trissyan_db';
  // Connexion SANS spécifier la base de données
  const tempConn = await mysql.createConnection({
    host:     process.env.DB_HOST || '127.0.0.1',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
  });
  await tempConn.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await tempConn.end();
}

const getPool = async () => {
  await ensureDatabase();
  return mysql.createPool({
    host:     process.env.DB_HOST || '127.0.0.1',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'trissyan_db',
    waitForConnections: true,
    connectionLimit: 10,
  });
};

// Pool initialisé de façon asynchrone
const poolPromise = global.mysqlPool
  ? Promise.resolve(global.mysqlPool)
  : getPool();

if (process.env.NODE_ENV !== 'production') {
  poolPromise.then(p => { global.mysqlPool = p; });
}

export async function query(sql: string, values?: any[]) {
  const pool = await poolPromise;
  const [rows] = await pool.execute(sql, values);
  return rows;
}

export default poolPromise;

