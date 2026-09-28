import mysql from 'mysql2/promise';

declare global {
  var mysqlPool: mysql.Pool | undefined;
}

// Créer la base de données et toutes les tables automatiquement
async function initDatabase() {
  const dbName = process.env.DB_NAME || 'trissyan_db';

  // Étape 1 : Créer la base de données si elle n'existe pas
  const tempConn = await mysql.createConnection({
    host:     process.env.DB_HOST || '127.0.0.1',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
  });
  await tempConn.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await tempConn.end();

  // Étape 2 : Créer toutes les tables si elles n'existent pas
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || '127.0.0.1',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: dbName,
    multipleStatements: true,
  });

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(255) NOT NULL,
      adresse TEXT,
      telephone VARCHAR(50),
      email VARCHAR(100),
      ice VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS produits (
      reference VARCHAR(100) PRIMARY KEY,
      categorie VARCHAR(100),
      designation TEXT,
      unite VARCHAR(50),
      prix_achat DECIMAL(10,2) DEFAULT 0,
      prix_vente DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parametres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(255),
      adresse TEXT,
      telephone VARCHAR(50),
      fax VARCHAR(50),
      email VARCHAR(100),
      siteweb VARCHAR(100),
      devise VARCHAR(10) DEFAULT 'MAD',
      tva DECIMAL(5,2) DEFAULT 20.00,
      rc VARCHAR(100),
      patente VARCHAR(100),
      if_taxe VARCHAR(100),
      cnss VARCHAR(100),
      ice VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS factures (
      id INT AUTO_INCREMENT PRIMARY KEY,
      numero VARCHAR(50),
      client_id INT,
      client_nom VARCHAR(255),
      client_telephone VARCHAR(50),
      client_ice VARCHAR(50),
      date_facture DATE,
      reglement VARCHAR(100),
      total_ht DECIMAL(10,2) DEFAULT 0,
      tva DECIMAL(10,2) DEFAULT 0,
      total_ttc DECIMAL(10,2) DEFAULT 0,
      statut VARCHAR(20) DEFAULT 'brouillon',
      document_type VARCHAR(20) DEFAULT 'facture',
      parent_id INT NULL,
      parent_type VARCHAR(20) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS facture_lignes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      facture_id INT NOT NULL,
      produit_ref VARCHAR(100),
      designation TEXT,
      unite VARCHAR(50),
      quantite DECIMAL(10,2) DEFAULT 1,
      prix_unitaire DECIMAL(10,2) DEFAULT 0,
      total_ligne DECIMAL(10,2) DEFAULT 0
    );
  `);

  // Insérer les paramètres par défaut si la table est vide
  await conn.execute(`
    INSERT IGNORE INTO parametres (id, nom, devise, tva)
    VALUES (1, 'LUMENEC', 'MAD', 20)
  `);

  await conn.end();
}

const getPool = async () => {
  await initDatabase();
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


