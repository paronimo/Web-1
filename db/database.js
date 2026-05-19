const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

const DB_PATH = path.join(__dirname, 'database.sqlite')

const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Ejecutar el esquema inicial si existe
const schemaPath = path.join(__dirname, 'schema.sql')
if (fs.existsSync(schemaPath)) {
  const sql = fs.readFileSync(schemaPath, 'utf8')
  if (sql && sql.trim()) {
    db.exec(sql)
  }
}

module.exports = db
