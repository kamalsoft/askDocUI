import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_session')?.value;
  
  const isAuthenticated = !!adminToken && adminToken === process.env.ADMIN_PASSWORD;

  return NextResponse.json({ isAuthenticated });
}