import Database from 'better-sqlite3';
import { networkInterfaces, hostname } from 'os';
import path from 'path';
import { createHash } from 'crypto';

// Resolve the machine's MAC address as a hardware identifier
export function getMachineId(): string {
  const interfaces = networkInterfaces();
  const host = hostname();
  const macs: string[] = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (!iface.internal && iface.mac !== '00:00:00:00:00:00') {
        macs.push(iface.mac);
      }
    }
  }

  // Combine hostname with sorted MAC addresses for a persistent, unique machine fingerprint
  const data = host + macs.sort().join('');
  return createHash('sha256').update(data).digest('hex');
}

const dbPath = path.join(process.cwd(), 'conversations.db');
const db = new Database(dbPath);

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
      row.messages = JSON.parse(row.messages);
    }
    return row;
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
  }
};