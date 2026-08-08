import { connect } from '@tidbcloud/serverless';

// Singleton connection to avoid multiple instances in dev
declare global {
  var tidbConn: ReturnType<typeof connect> | undefined;
}

const getConn = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL est manquant dans les variables d\'environnement');
  }
  return connect({ url });
};

const conn = global.tidbConn || getConn();

if (process.env.NODE_ENV !== 'production') {
  global.tidbConn = conn;
}

export async function query(sql: string, values?: any[]) {
  // @tidbcloud/serverless return array for SELECT, and object (with insertId) for mutations
  // This behaves exactly like the first element of mysql2's [rows] return.
  const result = await conn.execute(sql, values);
  return result;
}

export default conn;
