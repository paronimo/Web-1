// db/database.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Apuntamos a la ruta de la base de datos dentro de /db
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Lee el archivo schema.sql y lo ejecutamos
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

module.exports = db;