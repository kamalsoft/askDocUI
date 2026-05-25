import { NextRequest, NextResponse } from 'next/server';
import { chatDb, getMachineId } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const machineId = getMachineId();

    if (id) {
      const conversation = chatDb.getConversation(id);
      if (!conversation || conversation.machine_id !== machineId) {
        return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
      }
      return NextResponse.json(conversation);
    }

    const history = chatDb.getHistory(machineId);
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, messages } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    chatDb.saveConversation(id, title || 'New Conversation', messages || []);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save conversation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all') === 'true';
    const machineId = getMachineId();

    if (all) {
      chatDb.clearAllHistory(machineId);
      return NextResponse.json({ success: true });
    }

    if (!id) return NextResponse.json({ message: 'Conversation ID is required for deletion' }, { status: 400 });

    chatDb.deleteConversation(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error: Could not delete conversation' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title } = body;

    if (!id || !title) {
      return NextResponse.json({ message: 'ID and Title are required for updates' }, { status: 400 });
    }

    chatDb.updateTitle(id, title);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error: Could not update conversation title' }, { status: 500 });
  }
}