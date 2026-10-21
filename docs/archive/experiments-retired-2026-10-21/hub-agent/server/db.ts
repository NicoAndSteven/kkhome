import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'chat.db');

// 懒加载：不在模块顶层创建 SQLite 连接，避免 tsx watch 重启时因文件创建而再次重启
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');

  // 初始化表
  _db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      model TEXT NOT NULL,
      sdk_session_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      model TEXT,
      created_at TEXT NOT NULL,
      tool_calls TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
  `);

  // 迁移：添加 sdk_session_id 列
  try {
    const tableInfo = _db.prepare("PRAGMA table_info(sessions)").all() as Array<{ name: string }>;
    if (!tableInfo.some(col => col.name === 'sdk_session_id')) {
      _db.exec("ALTER TABLE sessions ADD COLUMN sdk_session_id TEXT");
      console.log("[DB] Added sdk_session_id column");
    }
  } catch {
    // ignore
  }

  return _db;
}

export interface DbSession {
  id: string;
  title: string;
  model: string;
  sdk_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  model: string | null;
  created_at: string;
  tool_calls: string | null;
}

export function getAllSessions(): DbSession[] {
  return getDb().prepare('SELECT * FROM sessions ORDER BY updated_at DESC').all() as DbSession[];
}

export function getSession(id: string): DbSession | undefined {
  return getDb().prepare('SELECT * FROM sessions WHERE id = ?').get(id) as DbSession | undefined;
}

export function createSession(session: DbSession): DbSession {
  getDb().prepare(`
    INSERT INTO sessions (id, title, model, sdk_session_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(session.id, session.title, session.model, session.sdk_session_id, session.created_at, session.updated_at);
  return session;
}

export function updateSession(id: string, updates: Partial<Pick<DbSession, 'title' | 'model' | 'sdk_session_id'>>): boolean {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.model !== undefined) { fields.push('model = ?'); values.push(updates.model); }
  if (updates.sdk_session_id !== undefined) { fields.push('sdk_session_id = ?'); values.push(updates.sdk_session_id); }
  if (fields.length === 0) return false;
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);
  return getDb().prepare(`UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`).run(...values).changes > 0;
}

export function deleteSession(id: string): boolean {
  return getDb().prepare('DELETE FROM sessions WHERE id = ?').run(id).changes > 0;
}

export function getMessagesBySession(sessionId: string): DbMessage[] {
  return getDb().prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC').all(sessionId) as DbMessage[];
}

export function createMessage(message: DbMessage): DbMessage {
  const db = getDb();
  db.prepare(`
    INSERT INTO messages (id, session_id, role, content, model, created_at, tool_calls)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(message.id, message.session_id, message.role, message.content, message.model, message.created_at, message.tool_calls);
  db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?').run(new Date().toISOString(), message.session_id);
  return message;
}

export function updateMessage(id: string, updates: Partial<Pick<DbMessage, 'content' | 'tool_calls'>>): boolean {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.content !== undefined) { fields.push('content = ?'); values.push(updates.content); }
  if (updates.tool_calls !== undefined) { fields.push('tool_calls = ?'); values.push(updates.tool_calls); }
  if (fields.length === 0) return false;
  values.push(id);
  return getDb().prepare(`UPDATE messages SET ${fields.join(', ')} WHERE id = ?`).run(...values).changes > 0;
}

export function deleteMessage(id: string): boolean {
  return getDb().prepare('DELETE FROM messages WHERE id = ?').run(id).changes > 0;
}

export function createMessages(messages: DbMessage[]): void {
  const stmt = getDb().prepare(`
    INSERT INTO messages (id, session_id, role, content, model, created_at, tool_calls)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMany = getDb().transaction((msgs: DbMessage[]) => {
    for (const msg of msgs) {
      stmt.run(msg.id, msg.session_id, msg.role, msg.content, msg.model, msg.created_at, msg.tool_calls);
    }
  });
  insertMany(messages);
}

export function clearAllData(): void {
  const db = getDb();
  db.exec('DELETE FROM messages');
  db.exec('DELETE FROM sessions');
}

export { getDb };
