import { authRepository } from './auth.repository';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { AppError } from '../../utils/AppError';
import type { RegisterInput, LoginInput } from './auth.schema';

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) throw new AppError(409, 'An account with this email already exists');

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.create({ name: input.name, email: input.email, passwordHash });
    const token = signToken({ userId: user.id, email: user.email });
    return { user, token };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);
    if (!user) throw new AppError(401, 'Invalid email or password');

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Invalid email or password');

    const token = signToken({ userId: user.id, email: user.email });
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  },

  async getMe(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  },
};
