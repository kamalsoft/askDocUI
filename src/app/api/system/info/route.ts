import { NextResponse } from 'next/server';
import { getMachineId, dbPath, chatDb } from '@/lib/db';
import fs from 'fs';

export async function GET() {
  try {
    // Ensure DB is initialized before checking stats
    if (!fs.existsSync(dbPath)) return NextResponse.json({ dbSize: '0 KB', status: 'initializing' });

    const machineId = getMachineId();
    const conversationCount = chatDb.getConversationCount();
    const usageStats = chatDb.getUsageStats();
    const recentActivity = chatDb.getRecentConversations(5);
    
    let dbSize = '0 KB';
    try {
      const stats = fs.statSync(dbPath);
      const sizeInBytes = stats.size;
      if (sizeInBytes > 1024 * 1024) {
        dbSize = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
      } else {
        dbSize = (sizeInBytes / 1024).toFixed(2) + ' KB';
      }
    } catch (e) {
      console.error('Could not read DB stats:', e);
    }

    return NextResponse.json({
      version: '1.0.4',
      machineId,
      archHash: machineId.slice(0, 12), // Displaying first 12 chars of the SHA-256 fingerprint
      dbPath,
      dbSize,
      conversationCount,
      usageStats,
      recentActivity
    });
  } catch (err) {
    console.error('System info API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}