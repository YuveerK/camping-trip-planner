import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import type { RegisterInput, LoginInput } from '../validators/auth.validators';

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new Error('DUPLICATE_EMAIL');

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const token = signToken({ userId: user.id, email: user.email });
    return { user, token };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new Error('INVALID_CREDENTIALS');

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) throw new Error('INVALID_CREDENTIALS');

    const token = signToken({ userId: user.id, email: user.email });
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  }
}
