import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, env } from '../config';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import type { AuthPayload } from '../types';

function signToken(userId: string, email: string): string {
  return jwt.sign(
    { sub: userId, email } satisfies Omit<AuthPayload, 'iat' | 'exp'>,
    env.JWT_SECRET,
    // cast necessário: jsonwebtoken espera StringValue do 'ms', mas env.JWT_EXPIRES_IN é string
    { expiresIn: env.JWT_EXPIRES_IN as unknown as number },
  );
}

export const authService = {
  async register(email: string, password: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictError('Email already registered');

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hash, name },
      select: { id: true, email: true, name: true, stripeAccountId: true, createdAt: true },
    });

    return { user, token: signToken(user.id, user.email) };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    return {
      user: { id: user.id, email: user.email, name: user.name, stripeAccountId: user.stripeAccountId, createdAt: user.createdAt },
      token: signToken(user.id, user.email),
    };
  },

  async updateProfile(userId: string, data: { name?: string; stripeAccountId?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.stripeAccountId !== undefined ? { stripeAccountId: data.stripeAccountId } : {}),
      },
      select: { id: true, email: true, name: true, stripeAccountId: true, createdAt: true },
    });
    return user;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedError('User not found');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');

    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hash } });
  },
};
