import mysql from 'mysql2/promise';

// Singleton connection pool to avoid multiple instances in dev
declare global {
  var mysqlPool: mysql.Pool | undefined;
}

const getPool = () => {
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

const pool = global.mysqlPool || getPool();

if (process.env.NODE_ENV !== 'production') {
  global.mysqlPool = pool;
}

export async function query(sql: string, values?: any[]) {
  const [rows] = await pool.execute(sql, values);
  return rows;
}

export default pool;
