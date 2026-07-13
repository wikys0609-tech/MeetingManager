import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        position: true,
      },
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: '사용자 목록을 불러오는 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    // Access control: Only admins can create users
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: '사용자 등록은 관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { email, password, name, role, department, position } = await req.json();

    if (!email || !password || !name || !role || !department) {
      return NextResponse.json(
        { error: '이메일, 비밀번호, 성명, 권한, 부서(팀명)는 필수 입력 사항입니다.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일(로그인 아이디)입니다.' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        department,
        position: position || '사원',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        position: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: '사용자를 등록하는 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
