import { NextResponse } from 'next/server';
import { chatDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action = 'integrity' } = body;

    // 1. Action Validation: Whitelist allowed actions
    const allowedActions = ['vacuum', 'integrity'];
    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        { success: false, message: `Invalid action: ${action}` },
        { status: 400 }
      );
    }

    // 2. Authorization (Placeholder): 
    // In a real app, check for a session or a secret API key header here.

    if (action === 'vacuum') {
      chatDb.vacuum();
      return NextResponse.json({
        success: true,
        message: 'Database storage optimized and unused space reclaimed successfully.'
      });
    }

    // Perform integrity check
    const checkResult = chatDb.checkIntegrity();
    // PRAGMA integrity_check returns [{ integrity_check: 'ok' }] if healthy
    const isHealthy = checkResult.length === 1 && (checkResult[0] as any).integrity_check === 'ok';

    return NextResponse.json({
      success: isHealthy,
      message: isHealthy 
        ? 'Database integrity check passed. No issues found.' 
        : 'Database integrity check failed. Potential corruption detected.',
      details: checkResult
    });
  } catch (err) {
    console.error('System Maintenance API Error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error during maintenance task.' },
      { status: 500 }
    );
  }
}