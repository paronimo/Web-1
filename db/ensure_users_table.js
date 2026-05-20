const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

try {
  const info = db.prepare("PRAGMA table_info('users')").all();
  const cols = info.map(c => c.name);
  const ops = [];

  if (!cols.includes('name')) {
    // Agregar con default vacío para evitar NOT NULL failure en tablas existentes
    ops.push("ALTER TABLE users ADD COLUMN name TEXT NOT NULL DEFAULT ''");
  }
  if (!cols.includes('email')) {
    ops.push("ALTER TABLE users ADD COLUMN email TEXT NOT NULL DEFAULT ''");
  }
  if (!cols.includes('password_hash')) {
    ops.push("ALTER TABLE users ADD COLUMN password_hash TEXT");
  }
  if (!cols.includes('created_at')) {
    ops.push("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");
  }

  if (ops.length === 0) {
    console.log('La tabla users ya tiene las columnas necesarias.');
    process.exit(0);
  }

  const tx = db.transaction(() => {
    for (const sql of ops) {
      db.exec(sql);
      console.log('Ejecutado:', sql);
    }
  });

  tx();
  console.log('Columnas añadidas correctamente.');
} catch (err) {
  console.error('Error asegurando tabla users:', err.message);
  process.exit(1);
} finally {
  db.close();
}
