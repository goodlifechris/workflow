// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma'; // Adjust path based on your project
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password:passwordHash,
    },
  });

  return NextResponse.json({ userId: user.id }, { status: 201 });
}
