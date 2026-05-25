import Database from 'better-sqlite3';
import { networkInterfaces, hostname, homedir } from 'os';
import path from 'path';
import fs from 'fs';
import { createHash } from 'crypto';

// Resolve the machine's MAC address as a hardware identifier
export function getMachineId(): string {
  const interfaces = networkInterfaces();
  const host = hostname();
  const macs: string[] = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      // Filter for non-internal and likely physical interfaces (standard MAC length)
      if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
        macs.push(iface.mac);
      }
    }
  }

  // Combine hostname with sorted MAC addresses for a persistent, unique machine fingerprint
  const data = host + macs.sort().join('');
  return createHash('sha256').update(data).digest('hex');
}

function getAppDataDir(): string {
  const home = homedir();
  switch (process.platform) {
    case 'win32':
      return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'askDocs');
    case 'darwin':
      return path.join(home, 'Library', 'Application Support', 'askDocs');
    default:
      return path.join(home, '.local', 'share', 'askDocs');
  }
}

const appDir = getAppDataDir();
if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

export const dbPath = path.join(appDir, 'conversations.db');

// Prevent multiple database instances during Next.js HMR (Hot Module Replacement)
const globalForDb = global as unknown as { db: Database.Database };

export const db = globalForDb.db || new Database(dbPath);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    machine_id TEXT,
    title TEXT,
    messages TEXT,
    timestamp INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_machine ON conversations(machine_id);
`);

export const chatDb = {
  saveConversation: (id: string, title: string, messages: any[]) => {
    const machineId = getMachineId();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO conversations (id, machine_id, title, messages, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(id, machineId, title, JSON.stringify(messages), Date.now());
  },

  getHistory: (machineId: string) => {
    const stmt = db.prepare(`
      SELECT id, title, timestamp FROM conversations 
      WHERE machine_id = ? 
      ORDER BY timestamp DESC
    `);
    return stmt.all(machineId);
  },
  
  getConversation: (id: string) => {
    const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
    const row = stmt.get(id) as any;
    if (row && row.messages) {
      try {
        row.messages = JSON.parse(row.messages);
      } catch (e) {
        console.error(`Failed to parse messages for conversation ${id}:`, e);
        row.messages = [];
      }
    }
    return row;
  },

  getConversationCount: () => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM conversations');
    return (stmt.get() as any).count;
  },

  getUsageStats: () => {
    // Gets conversation counts for the last 7 days
    const stmt = db.prepare(`
      SELECT strftime('%Y-%m-%d', timestamp/1000, 'unixepoch') as date, count(*) as count 
      FROM conversations 
      GROUP BY date 
      ORDER BY date DESC 
      LIMIT 7
    `);
    return stmt.all();
  },

  getRecentConversations: (limit: number = 5) => {
    const stmt = db.prepare('SELECT id, title, timestamp FROM conversations ORDER BY timestamp DESC LIMIT ?');
    return stmt.all(limit);
  },

  getAllConversations: () => {
    const stmt = db.prepare('SELECT id, machine_id, title, timestamp FROM conversations ORDER BY timestamp DESC');
    return stmt.all();
  },

  clearAllHistory: (machineId: string) => {
    const stmt = db.prepare('DELETE FROM conversations WHERE machine_id = ?');
    return stmt.run(machineId);
  },

  updateTitle: (id: string, title: string) => {
    return db.prepare('UPDATE conversations SET title = ? WHERE id = ?').run(title, id);
  },

  deleteConversation: (id: string) => {
    return db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
  },

  checkIntegrity: () => {
    return db.prepare('PRAGMA integrity_check').all();
  },

  vacuum: () => {
    return db.exec('VACUUM');
  }
};