import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'session_token';
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'fallback-secret-for-local-dev-change-me'
);

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  position: string;
}

export async function encrypt(payload: UserSession) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(JWT_SECRET);
}

export async function decrypt(input: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(input, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return payload as unknown as UserSession;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionToken) return null;
  return await decrypt(sessionToken);
}

export async function setSession(user: UserSession) {
  const token = await encrypt(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2, // 2 hours
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
  });
}

// Request session getter (for API routes / middleware)
export async function getRequestSession(req: NextRequest): Promise<UserSession | null> {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  if (!sessionToken) return null;
  return await decrypt(sessionToken);
}
