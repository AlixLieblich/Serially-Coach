'use server';

import { z } from 'zod';
import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { lookupSerial as lookupSerialInDb } from './serial';
import { redirect } from 'next/navigation';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const parsed = RegisterSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!parsed.success) {
      return 'Invalid form data.';
    }

    const { name, email, password } = parsed.data;

    // check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return 'User already exists.';
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;

    // auto login (this triggers redirect internally)
    await signIn('credentials', formData);

  } catch (error: any) {
    // IMPORTANT: let Next.js redirects work
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    if (error instanceof AuthError) {
      return 'Authentication failed.';
    }

    console.error(error);
    return 'Something went wrong.';
  }
}

export async function lookupSerial(serial: string): Promise<string> {
  return lookupSerialInDb(serial);
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

