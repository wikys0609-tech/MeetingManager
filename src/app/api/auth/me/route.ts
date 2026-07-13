import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ session: null }, { status: 401 });
    }
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: '세션 조회 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
